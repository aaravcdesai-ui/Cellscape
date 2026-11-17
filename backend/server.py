"""Same-origin Cellscape quiz API. Python standard library; no external services."""
import argparse, csv, hashlib, hmac, json, secrets, sqlite3, time
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from admin import Admin, password_record, results
ROOT = Path(__file__).resolve().parent.parent
BANK = json.loads((ROOT / 'backend/quiz-bank.json').read_text())
SCHEMA = '''
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, model TEXT NOT NULL, questions TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS events(session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE, event_id TEXT NOT NULL, question INTEGER NOT NULL, kind TEXT NOT NULL, answer TEXT, correct INTEGER, created INTEGER NOT NULL, PRIMARY KEY(session_id,event_id));
'''
PUBLIC = {'index.html','about.html','NOTICE.md','style.css','app.js','diagram.js','specimens.js','learning.js','viewer3d.js','cell-models.js','anatomy-motion.js','experiment-model.js','investigations.js','discovery.js','quiz-store.js','admin.html','admin.js','admin.css','lab.js','lab-data.js','studio.js'}
@contextmanager
def connect(path):
    db = sqlite3.connect(path, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    try:
        with db: yield db
    finally: db.close()

def initialize(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with connect(path) as db: db.executescript(SCHEMA)
    path.chmod(0o600)

def handler(database, retention_days, admin_file=None, secure_cookies=False):
    admin=Admin(admin_file or database.parent/'admin.json',secure_cookies)
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_): pass  # No application request/IP logs.
        def reply(self, status, body, cookie=None):
            raw = json.dumps(body).encode()
            self.send_response(status)
            if cookie: self.send_header('Set-Cookie',cookie)
            self.send_header('X-Frame-Options','DENY'); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(raw))); self.send_header('Cache-Control','no-store'); self.send_header('X-Content-Type-Options','nosniff'); self.end_headers(); self.wfile.write(raw)
        def do_GET(self):
            path = urlsplit(self.path).path
            if path.startswith('/api/admin/'):
                if path=='/api/admin/auth':return self.reply(200,{'authenticated':admin.authorized(self.headers),'configured':bool(admin.record())})
                if not admin.authorized(self.headers):return self.reply(401,{'error':'Please sign in.'})
                if path=='/api/admin/results' or path.startswith('/api/admin/results/'):
                    with connect(database) as db:
                        db.execute('DELETE FROM sessions WHERE created < ?',(int(time.time())-retention_days*86400,))
                        status,body=results(db,BANK,urlsplit(self.path).query,path.removeprefix('/api/admin/results/') if path.startswith('/api/admin/results/') else None)
                    return self.reply(status,body)
                return self.reply(404,{'error':'Not found'})
            if path == '/api/health': return self.reply(200, {'saving':True,'retentionDays':retention_days})
            if path.startswith('/api/'): return self.reply(404, {'error':'Not found'})
            relative = path.lstrip('/') or 'index.html'
            target = (ROOT / relative).resolve()
            allowed = relative in PUBLIC or relative.startswith(('assets/','vendor/three/'))
            if '..' in Path(relative).parts or not allowed or not target.is_relative_to(ROOT) or not target.is_file(): return self.reply(404, {'error':'Not found'})
            import mimetypes
            raw = target.read_bytes(); mime = mimetypes.guess_type(str(target))[0] or 'application/octet-stream'
            if target.suffix == '.js': mime = 'text/javascript'
            self.send_response(200)
            if relative.startswith('admin.'):
                self.send_header('Cache-Control','no-store');self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");self.send_header('X-Frame-Options','DENY')
            self.send_header('Content-Type',mime); self.send_header('Content-Length',str(len(raw))); self.send_header('X-Content-Type-Options','nosniff'); self.send_header('Referrer-Policy','no-referrer'); self.end_headers(); self.wfile.write(raw)
        def do_POST(self):
            # JSON + same-origin checking prevents cross-site browser submissions. No CORS is enabled.
            origin = self.headers.get('Origin')
            if origin and origin not in {f'http://{self.headers.get("Host")}', f'https://{self.headers.get("Host")}'}: return self.reply(403, {'error':'Origin rejected'})
            try:
                length = int(self.headers.get('Content-Length','0'))
                if not 0 < length <= 8192 or self.headers.get_content_type() != 'application/json': return self.reply(400, {'error':'Expected a small JSON body'})
                body = json.loads(self.rfile.read(length))
                if not isinstance(body,dict): raise ValueError()
                path = urlsplit(self.path).path
                if path.startswith('/api/admin/'):
                    if path=='/api/admin/login':return self.reply(*admin.login(body.get('password'),self.client_address[0]))
                    if path=='/api/admin/logout':return self.reply(200,{'authenticated':False},admin.logout(self.headers))
                    return self.reply(404,{'error':'Not found'})
                with connect(database) as db:
                    db.execute('BEGIN IMMEDIATE')
                    db.execute('DELETE FROM sessions WHERE created < ?', (int(time.time())-retention_days*86400,))
                    if path == '/api/sessions':
                        model, questions = body.get('model'), body.get('questions')
                        if not isinstance(model,str) or model not in BANK['models'] or not isinstance(questions,list) or len(questions)!=5 or any(not isinstance(q,str) or q not in BANK['models'][model] for q in questions) or len(set(questions))!=5: raise ValueError()
                        # Bound storage on this small development backend.
                        if db.execute('SELECT count(*) FROM sessions').fetchone()[0] >= 10000: return self.reply(503, {'error':'Session capacity reached'})
                        sid, token = secrets.token_urlsafe(24), secrets.token_urlsafe(32)
                        db.execute('INSERT INTO sessions VALUES(?,?,?,?,?)',(sid,hashlib.sha256(token.encode()).hexdigest(),model,json.dumps(questions),int(time.time())))
                        result = (201, {'id':sid,'token':token})
                    elif path.startswith('/api/sessions/') and path.endswith('/events'):
                        sid = path.split('/')[3]
                        row = db.execute('SELECT * FROM sessions WHERE id=?',(sid,)).fetchone()
                        token = self.headers.get('Authorization','').removeprefix('Bearer ')
                        if not row or not hmac.compare_digest(row['token_hash'],hashlib.sha256(token.encode()).hexdigest()): return self.reply(404, {'error':'Session not found'})
                        eid, number, kind, answer = body.get('eventId'),body.get('question'),body.get('kind'),body.get('answer')
                        if not isinstance(eid,str) or not 8 <= len(eid) <= 80 or type(number)!=int or not 1<=number<=5 or kind not in ('answer','hint','reveal'): raise ValueError()
                        questions = json.loads(row['questions']); definition=BANK['structures'][questions[number-1]];correct_id=definition.get('answer',questions[number-1]);allowed_answers=[o['id'] for o in definition['options']] if 'options' in definition else BANK['models'][row['model']]
                        if kind=='answer' and (not isinstance(answer,str) or answer not in allowed_answers): raise ValueError()
                        if kind!='answer' and answer is not None: raise ValueError()
                        old = db.execute('SELECT * FROM events WHERE session_id=? AND event_id=?',(sid,eid)).fetchone()
                        if old:
                            if (old['question'],old['kind'],old['answer']) != (number,kind,answer): return self.reply(409, {'error':'Event ID already used'})
                            result=(200,{'saved':True,'duplicate':True})
                        else:
                            resolved = {r[0] for r in db.execute("SELECT question FROM events WHERE session_id=? AND (correct=1 OR kind='reveal')",(sid,))}
                            current = next((n for n in range(1,6) if n not in resolved),None)
                            if current != number: return self.reply(409, {'error':'Question is not active'})
                            if db.execute('SELECT count(*) FROM events WHERE session_id=?',(sid,)).fetchone()[0]>=250: return self.reply(429, {'error':'Attempt limit reached'})
                            correct = int(answer==correct_id) if kind=='answer' else None
                            db.execute('INSERT INTO events VALUES(?,?,?,?,?,?,?)',(sid,eid,number,kind,answer,correct,int(time.time())))
                            result=(201,{'saved':True,'correct':bool(correct) if correct is not None else None})
                    else: return self.reply(404,{'error':'Not found'})
                return self.reply(*result)  # Commit before acknowledging durable storage.
            except (ValueError, TypeError, json.JSONDecodeError): return self.reply(400,{'error':'Invalid quiz event'})
            except sqlite3.Error: return self.reply(503,{'error':'Storage unavailable'})
    return Handler

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--port',type=int,default=8000); parser.add_argument('--host',default='127.0.0.1'); parser.add_argument('--database',type=Path,default=ROOT/'backend/data/quiz.sqlite3'); parser.add_argument('--retention-days',type=int,default=30); parser.add_argument('--export',type=Path); parser.add_argument('--purge',action='store_true')
    parser.add_argument('--setup-admin',action='store_true');parser.add_argument('--secure-cookies',action='store_true');args=parser.parse_args()
    if args.setup_admin:
        from getpass import getpass
        password=getpass('New admin passphrase (at least 14 characters): ')
        if password!=getpass('Confirm passphrase: '):parser.error('Passphrases did not match')
        try:record=password_record(password)
        except ValueError as error:parser.error(str(error))
        config=args.database.parent/'admin.json';config.parent.mkdir(parents=True,exist_ok=True)
        import os
        fd=os.open(config,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
        with os.fdopen(fd,'w') as out:json.dump(record,out)
        config.chmod(0o600);print('Admin configured. Restart the server to revoke any old login sessions.');return
    if args.retention_days<1: parser.error('Retention must be positive')
    if args.host not in ('127.0.0.1','localhost','::1') and not args.secure_cookies:parser.error('Non-local serving requires --secure-cookies and an HTTPS reverse proxy.')
    initialize(args.database)
    with connect(args.database) as db:
        db.execute('DELETE FROM sessions WHERE created < ?',(int(time.time())-args.retention_days*86400,))
        if args.export:
            with args.export.open('w',newline='') as out:
                writer=csv.writer(out); writer.writerow(['session','model','question','correct_answer','prompt','event','chosen_answer','correct','timestamp'])
                for row in db.execute('SELECT s.id,s.model,s.questions,e.question,e.kind,e.answer,e.correct,e.created FROM events e JOIN sessions s ON s.id=e.session_id ORDER BY e.created,e.rowid'):
                    q=json.loads(row['questions'])[row['question']-1]; writer.writerow([row['id'],row['model'],row['question'],BANK['structures'][q].get('answer',q),BANK['structures'][q]['prompt'],row['kind'],row['answer'],row['correct'],row['created']])
            return
    if args.purge: return
    server=ThreadingHTTPServer((args.host,args.port),handler(args.database,args.retention_days,secure_cookies=args.secure_cookies)); print(f'Cellscape: http://{args.host}:{server.server_port}',flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()
if __name__=='__main__': main()
