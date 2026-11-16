import json, sqlite3, tempfile, threading, unittest
from pathlib import Path
from http.server import ThreadingHTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from server import handler, initialize, connect

class QuizAPI(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.db=Path(self.temp.name)/'quiz.sqlite3';initialize(self.db)
  self.http=ThreadingHTTPServer(('127.0.0.1',0),handler(self.db,30));self.thread=threading.Thread(target=self.http.serve_forever,daemon=True);self.thread.start();self.url='http://127.0.0.1:'+str(self.http.server_port)
  self.questions=['nucleus','nucleolus','mitochondrion','rough-er','golgi']
 def tearDown(self):self.http.shutdown();self.http.server_close();self.thread.join();self.temp.cleanup()
 def request(self,path,body=None,token=None,origin=None,cookie=None):
  headers={'Content-Type':'application/json'}
  if cookie:headers['Cookie']=cookie
  if token:headers['Authorization']='Bearer '+token
  if origin:headers['Origin']=origin
  req=Request(self.url+path,data=json.dumps(body).encode() if body is not None else None,headers=headers)
  try:
   with urlopen(req) as r:return r.status,json.loads(r.read())
  except HTTPError as e:
   with e:return e.code,json.loads(e.read())
 def session(self):
  code,s=self.request('/api/sessions',{'model':'animal','questions':self.questions});self.assertEqual(code,201);return s
 def test_records_retries_hints_reveals_and_persistence(self):
  s=self.session();path='/api/sessions/'+s['id']+'/events'
  def event(eid,q,kind,answer=None):return self.request(path,dict(eventId=eid,question=q,kind=kind,**({'answer':answer} if answer else {})),s['token'])
  self.assertEqual(event('attempt-1',1,'answer','golgi')[1]['correct'],False)
  self.assertEqual(event('attempt-1',1,'answer','golgi')[1]['duplicate'],True)
  self.assertEqual(event('hint-0001',1,'hint')[0],201)
  self.assertEqual(event('attempt-2',1,'answer','nucleus')[1]['correct'],True)
  self.assertEqual(event('reveal-02',2,'reveal')[0],201)
  for q in range(3,6):self.assertEqual(event('answer-0'+str(q),q,'answer',self.questions[q-1])[0],201)
  initialize(self.db)  # Reopening storage must not erase the records.
  with connect(self.db) as db:
   self.assertEqual(db.execute('SELECT count(*) FROM events').fetchone()[0],7)
   self.assertEqual(db.execute("SELECT count(*) FROM events WHERE correct=1 OR kind='reveal'").fetchone()[0],5)
 def test_reject_invalid_and_unauthorized_events(self):
  s=self.session();p='/api/sessions/'+s['id']+'/events';body={'eventId':'event-0001','question':1,'kind':'answer','answer':'nucleus'}
  self.assertEqual(self.request(p,body,'wrong')[0],404)
  self.assertEqual(self.request(p,body,s['token'],'https://other.example')[0],403)
  self.assertEqual(self.request(p,{**body,'question':3},s['token'])[0],409)
  self.assertEqual(self.request(p,{**body,'answer':'not-real'},s['token'])[0],400)
  self.assertEqual(self.request('/api/sessions',{'model':'animal','questions':['nucleus']*5})[0],400)
  self.assertEqual(self.request('/api/sessions',{'model':[], 'questions':[]})[0],400)
 def test_mixed_practice_server_grading(self):
  from server import BANK
  ids=BANK['models']['practice'][:5]
  code,session=self.request('/api/sessions',{'model':'practice','questions':ids});self.assertEqual(code,201)
  definition=BANK['structures'][ids[0]];path='/api/sessions/'+session['id']+'/events'
  body=dict(eventId='practice-answer-1',question=1,kind='answer',answer='forged')
  self.assertEqual(self.request(path,body,session['token'])[0],400)
  body['answer']=definition['answer']
  self.assertTrue(self.request(path,body,session['token'])[1]['correct'])
 def test_database_and_source_not_public(self):
  for p in ['/backend/data/quiz.sqlite3','/backend/server.py','/.git/config','/assets/../backend/server.py','/api/sessions']:
   self.assertEqual(self.request(p)[0],404)
 def test_retention_cascades(self):
  s=self.session()
  with connect(self.db) as db:db.execute('UPDATE sessions SET created=0')
  self.session()
  with connect(self.db) as db:self.assertEqual(db.execute('SELECT count(*) FROM sessions WHERE id=?',(s['id'],)).fetchone()[0],0)
class AdminAPI(QuizAPI):
 def setUp(self):
  super().setUp()
  from admin import password_record
  (self.db.parent/'admin.json').write_text(json.dumps(password_record('test-only-long-passphrase')))
 def login(self,password='test-only-long-passphrase'):
  req=Request(self.url+'/api/admin/login',data=json.dumps({'password':password}).encode(),headers={'Content-Type':'application/json'})
  with urlopen(req) as r:
   cookie=r.headers['Set-Cookie'];self.assertIn('HttpOnly',cookie);self.assertIn('SameSite=Strict',cookie);self.assertEqual(r.headers['Cache-Control'],'no-store');return cookie.split(';')[0]
 def test_login_logout_and_protected_results(self):
  self.assertEqual(self.request('/api/admin/results')[0],401)
  self.assertEqual(self.request('/api/admin/login',{'password':'incorrect'})[0],401)
  cookie=self.login();session=self.session()
  status,data=self.request('/api/admin/results',cookie=cookie);self.assertEqual(status,200);self.assertEqual(data['total'],1);self.assertNotIn('token_hash',json.dumps(data));self.assertEqual(data['sessions'][0]['score'],0)
  detail='/api/admin/results/'+session['id'];self.assertEqual(self.request(detail)[0],401)
  data=self.request(detail,cookie=cookie)[1];self.assertEqual(len(data['questions']),5)
  self.assertEqual(self.request('/api/admin/logout',{},cookie=cookie)[0],200)
  self.assertEqual(self.request('/api/admin/results',cookie=cookie)[0],401)
 def test_login_throttle(self):
  for _ in range(5):self.assertEqual(self.request('/api/admin/login',{'password':'wrong'})[0],401)
  self.assertEqual(self.request('/api/admin/login',{'password':'wrong'})[0],429)
 def test_score_with_assistance(self):
  s=self.session();p='/api/sessions/'+s['id']+'/events'
  for index,(n,kind,answer) in enumerate([(1,'hint',None),(1,'answer','nucleus'),(2,'reveal',None),(3,'answer','mitochondrion'),(4,'answer','rough-er'),(5,'answer','golgi')]):
   body={'eventId':'testevent-'+str(index),'question':n,'kind':kind}
   if answer:body['answer']=answer
   self.assertEqual(self.request(p,body,s['token'])[0],201)
  data=self.request('/api/admin/results/'+s['id'],cookie=self.login())[1]
  self.assertEqual((data['score'],data['assisted'],data['revealed'],data['resolved']),(3,1,1,5))
  self.assertEqual(data['questions'][0]['outcome'],'assisted')
 def test_concept_insights_and_mixed_detail(self):
  from server import BANK
  ids=BANK['models']['practice'][:5]
  _,session=self.request('/api/sessions',{'model':'practice','questions':ids})
  path='/api/sessions/'+session['id']+'/events'
  for index,(number,kind,answer) in enumerate([(1,'hint',None),(1,'answer',BANK['structures'][ids[0]]['answer']),(2,'reveal',None),(3,'answer',BANK['structures'][ids[2]]['answer'])]):
   body=dict(eventId='insight-event-'+str(index),question=number,kind=kind)
   if answer:body['answer']=answer
   self.assertEqual(self.request(path,body,session['token'])[0],201)
  cookie=self.login();data=self.request('/api/admin/results?model=practice',cookie=cookie)[1]
  self.assertEqual([data['insights'][k] for k in ['firstTry','assisted','revealed','incomplete']],[1,1,1,1])
  self.assertEqual(sum(c['seen'] for c in data['insights']['concepts']),3)
  detail=self.request('/api/admin/results/'+session['id'],cookie=cookie)[1]
  expected=BANK['structures'][ids[0]]['answer']
  self.assertEqual(detail['questions'][0]['expected'],expected)
  self.assertEqual(detail['questions'][0]['outcome'],'assisted')
 def test_credentials_and_admin_source_not_downloadable(self):
  for p in ['/backend/data/admin.json','/backend/admin.py']:
   self.assertEqual(self.request(p)[0],404)

if __name__=='__main__':unittest.main()
