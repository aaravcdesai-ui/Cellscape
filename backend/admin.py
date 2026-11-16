"""Local credential setup, expiring admin sessions, and read-only result summaries."""
import hashlib, hmac, json, secrets, threading, time
from http.cookies import SimpleCookie
from urllib.parse import parse_qs

def password_record(password):
    if len(password)<14 or len(password)>256: raise ValueError('Use a password or passphrase of 14–256 characters.')
    salt=secrets.token_hex(24)
    return dict(salt=salt,iterations=600000,digest=hashlib.pbkdf2_hmac('sha256',password.encode(),bytes.fromhex(salt),600000).hex())

class Admin:
    def __init__(self, path, secure=False):
        self.path=path;self.secure=secure;self.lock=threading.Lock();self.sessions={};self.attempts={}
    def record(self):
        try:return json.loads(self.path.read_text())
        except (FileNotFoundError,ValueError):return None
    def cookie(self, token='', age=3600):
        return f'cellscape_admin={token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age={age}'+('; Secure' if self.secure else '')
    def key(self, headers):
        try:
            cookies=SimpleCookie();cookies.load(headers.get('Cookie',''));value=cookies.get('cellscape_admin');return hashlib.sha256((value.value if value else '').encode()).hexdigest()
        except Exception:return ''
    def authorized(self, headers):
        with self.lock:
            now=time.time();self.sessions={k:v for k,v in self.sessions.items() if v>now}
            return self.sessions.get(self.key(headers),0)>now
    def login(self, password, ip):
        with self.lock:
            now=time.time();self.attempts={k:v for k,v in self.attempts.items() if v[1]>now-900}
            # Per-address and global throttles. Addresses are kept only transiently in RAM.
            if self.attempts.get(ip,(0,0))[0]>=5 or sum(v[0] for v in self.attempts.values())>=40:return 429,{'error':'Too many login attempts. Try again in 15 minutes.'},None
            self.attempts[ip]=(self.attempts.get(ip,(0,0))[0]+1,now)
            record=self.record()
            if not record:return 503,{'error':'Admin login has not been configured.'},None
            if not isinstance(password,str) or len(password)>256:return 401,{'error':'Incorrect password.'},None
            digest=hashlib.pbkdf2_hmac('sha256',password.encode(),bytes.fromhex(record['salt']),record['iterations']).hex()
            if not hmac.compare_digest(digest,record['digest']):return 401,{'error':'Incorrect password.'},None
            self.attempts.pop(ip,None)
            self.sessions={k:v for k,v in self.sessions.items() if v>now}
            if len(self.sessions)>=100:self.sessions.clear()
            token=secrets.token_urlsafe(32);self.sessions[hashlib.sha256(token.encode()).hexdigest()]=now+3600
            return 200,{'authenticated':True},self.cookie(token)
    def logout(self, headers):
        with self.lock:self.sessions.pop(self.key(headers),None)
        return self.cookie(age=0)

def summarize(row,events,bank,detail=False):
    ids=json.loads(row['questions']);questions=[];independent=assisted=revealed=0
    for n,qid in enumerate(ids,1):
        history=[e for e in events if e['question']==n];correct=any(e['correct']==1 for e in history);shown=any(e['kind']=='reveal' for e in history)
        first=bool(history and history[0]['kind']=='answer' and history[0]['correct']==1)
        independent+=first;assisted+=correct and not first;revealed+=shown
        definition=bank['structures'][qid];option_names={o['id']:o['text'] for o in definition.get('options',[])};expected=definition.get('answer',qid);expected_name=option_names.get(expected,definition['name'])
        if detail:questions.append(dict(number=n,expected=expected,name=expected_name,concept=definition.get('concept',definition['name']),prompt=definition['prompt'],outcome='independent' if first else 'assisted' if correct else 'revealed' if shown else 'unanswered',history=[dict(kind=e['kind'],answer=e['answer'],answerName=option_names.get(e['answer'],bank['structures'].get(e['answer'],{}).get('name')),correct=bool(e['correct']) if e['correct'] is not None else None,created=e['created']) for e in history]))
    resolved=independent+assisted+revealed
    return dict(id=row['id'],model=row['model'],created=row['created'],score=independent,assisted=assisted,revealed=revealed,resolved=resolved,status='complete' if resolved==5 else 'in progress' if events else 'not started',responses=len(events),**({'questions':questions} if detail else {}))

def results(db,bank,query,sid=None):
    if sid:
        row=db.execute('SELECT * FROM sessions WHERE id=?',(sid,)).fetchone()
        if not row:return 404,{'error':'Session not found'}
        events=db.execute('SELECT * FROM events WHERE session_id=? ORDER BY rowid',(sid,)).fetchall()
        return 200,summarize(row,events,bank,True)
    params=parse_qs(query);model=params.get('model',[''])[0]
    try:page=max(1,min(10000,int(params.get('page',['1'])[0])))
    except ValueError:return 400,{'error':'Invalid page'}
    if model and model not in bank['models']:return 400,{'error':'Invalid specimen'}
    where=' WHERE model=?' if model else '';args=(model,) if model else ()
    total=db.execute('SELECT count(*) FROM sessions'+where,args).fetchone()[0]
    rows=db.execute('SELECT * FROM sessions'+where+' ORDER BY created DESC,rowid DESC LIMIT 25 OFFSET ?',args+((page-1)*25,)).fetchall()
    sessions=[summarize(row,db.execute('SELECT * FROM events WHERE session_id=? ORDER BY rowid',(row['id'],)).fetchall(),bank) for row in rows]
    completed=db.execute("SELECT count(*) FROM (SELECT e.session_id FROM events e JOIN sessions s ON s.id=e.session_id WHERE (e.correct=1 OR e.kind='reveal')"+(' AND s.model=?' if model else '')+' GROUP BY e.session_id HAVING count(DISTINCT e.question)=5)',args).fetchone()[0]
    responses=db.execute('SELECT count(*) FROM events e JOIN sessions s ON s.id=e.session_id'+(' WHERE s.model=?' if model else ''),args).fetchone()[0]
    # Aggregate all filtered records, rather than only the visible page.
    concepts={};question_states={}
    sql='SELECT e.*,s.questions FROM events e JOIN sessions s ON s.id=e.session_id'+(' WHERE s.model=?' if model else '')+' ORDER BY e.rowid'
    for event in db.execute(sql,args):
        qid=json.loads(event['questions'])[event['question']-1];definition=bank['structures'][qid];name=definition.get('concept',definition['name']);key=(event['session_id'],event['question'])
        state=question_states.setdefault(key,dict(name=name,first=(event['kind']=='answer' and event['correct']==1),correct=False,revealed=False))
        state['correct'] |= event['correct']==1;state['revealed'] |= event['kind']=='reveal'
    independent=assisted=revealed=0
    for state in question_states.values():
        group=concepts.setdefault(state['name'],dict(name=state['name'],seen=0,support=0));group['seen']+=1;group['support']+=not state['first']
        independent+=state['first'];assisted+=state['correct'] and not state['first'];revealed+=state['revealed']
    ranked=sorted(concepts.values(),key=lambda c:(-c['support'],-c['seen'],c['name']))[:8]
    return 200,dict(sessions=sessions,total=total,completed=completed,responses=responses,page=page,pages=max(1,(total+24)//25),insights=dict(firstTry=independent,assisted=assisted,revealed=revealed,incomplete=total-completed,concepts=ranked))
