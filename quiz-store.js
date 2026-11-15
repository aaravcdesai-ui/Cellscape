// Anonymous persistence; tokens live only in memory, never in cookies or browser storage.
window.QuizStore=(()=>{
 let active=null;
 function status(text){const node=document.querySelector('#quiz-save-status');if(node)node.textContent=text}
 async function post(url,body,token){
  for(let attempt=0;attempt<2;attempt++){
   try{const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(5000)});if(!response.ok)throw new Error('Saving failed');return await response.json()}catch(error){if(attempt===1)throw error}
  }
 }
 return {
  begin(model,questions){
   const run={failed:false,session:null,tail:null};active=run;
   status('Saving anonymous quiz answers to this server. No name or email is requested.');
   // Session creation is not retried: a lost response may leave an empty anonymous session.
   run.tail=fetch('/api/sessions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,questions}),signal:AbortSignal.timeout(5000)})
    .then(async response=>{if(!response.ok)throw new Error();run.session=await response.json();if(active===run)status('Answer saving is on. Anonymous attempts are kept for up to 30 days.')})
    .catch(()=>{run.failed=true;if(active===run)status('Practice only — the answer server is unavailable. This quiz is not being saved.')});
  },
  record(kind,question,answer){
   const run=active;if(!run)return;
   const event={eventId:crypto.randomUUID(),kind,question,...(answer?{answer}:{})};
   run.tail=run.tail.then(async()=>{
    if(run.failed)return;
    try{await post('/api/sessions/'+run.session.id+'/events',event,run.session.token);if(active===run)status('Latest response saved. Anonymous attempts are kept for up to 30 days.')}
    catch{run.failed=true;if(active===run)status('Saving stopped — your latest response and subsequent answers were not saved. You can continue practicing.')}
   });
  }
 };
})();
