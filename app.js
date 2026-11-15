const structures = [
...specializedStructures,
['nucleus','Nucleus','Control center','The cell’s control center','A double membrane surrounds the nucleus, which contains most of the cell’s DNA. Instructions stored here guide growth, repair, and everyday cell activity.','Stores genetic information and regulates gene expression.','A typical diploid human cell contains about two meters of nuclear DNA, packed into a nucleus only a few micrometers across.'],
['nucleolus','Nucleolus','Assembly station','Where ribosomes begin','Inside the nucleus is a dense region called the nucleolus. It makes ribosomal RNA and assembles the subunits that become ribosomes.','Produces and assembles ribosomal subunits.','The nucleolus has no surrounding membrane. It forms around active regions of DNA.'],
['mitochondrion','Mitochondrion','Energy conversion','Powering cellular work','These double-membraned organelles convert energy from food into ATP through cellular respiration. Folds in the inner membrane, called cristae, provide space for energy-producing reactions.','Generates most ATP during aerobic cellular respiration.','Mitochondria have their own DNA. Plant cells have mitochondria too; chloroplasts do not replace them.'],
['rough-er','Rough ER','Protein production','The protein workshop','The rough endoplasmic reticulum is a network of membrane sheets near the nucleus. Ribosomes on its surface make proteins that enter the ER for folding and processing.','Makes and processes proteins destined for secretion, membranes, or certain organelles.','Its “rough” appearance comes from thousands of attached ribosomes.'],
['smooth-er','Smooth ER','Lipid production','A connected chemical workshop','The smooth endoplasmic reticulum is a branching network of membrane tubules without attached ribosomes. Its roles vary between cell types.','Synthesizes lipids, stores calcium, and helps detoxify certain substances.','Muscle cells use a specialized smooth ER to release the calcium that triggers contraction.'],
['golgi','Golgi apparatus','Sorting & shipping','The cell’s distribution center','Stacks of flattened membrane sacs receive proteins and lipids from the ER. The Golgi modifies them, sorts them, and packages them into transport vesicles.','Modifies, sorts, and packages proteins and lipids.','Each stack has a receiving side and a shipping side, keeping cellular traffic organized.'],
['ribosomes','Ribosomes','Protein synthesis','Reading life’s instructions','These tiny structures translate messenger RNA into chains of amino acids. Ribosomes float freely in the cytosol or attach to the rough ER.','Builds proteins by translating messenger RNA.','Ribosomes are found in every cellular form of life, including bacteria.'],
['membrane','Cell membrane','Selective boundary','A boundary with a purpose','A flexible phospholipid bilayer surrounds the cell. Embedded proteins help move substances, receive signals, and connect the cell to its surroundings.','Controls movement into and out of the cell and enables communication.','The membrane is dynamic: many of its lipids and proteins move sideways within the bilayer.'],
['cytosol','Cytosol','Reaction space','The space between','The cytosol is the fluid portion of the cytoplasm. Water, dissolved ions, proteins, and other molecules fill the space around organelles.','Provides a medium for many metabolic reactions, including glycolysis.','Cytoplasm includes both the cytosol and the structures suspended in it, outside the nucleus.'],
['lysosome','Lysosome','Recycling','Reuse. Recycle. Renew.','Lysosomes contain digestive enzymes that break down worn-out cell parts and material taken in by the cell. Their interior is acidic, helping the enzymes work.','Digests and recycles cellular material.','Plant cells usually carry out many similar digestive functions in a lytic vacuole.'],
['chloroplast','Chloroplast','Photosynthesis','Turning light into chemical energy','Chloroplasts, found in photosynthetic plant tissues, contain chlorophyll, which captures light. Photosynthesis uses this energy to build sugars from carbon dioxide and water.','Converts light energy into chemical energy stored in sugars.','Stacks of membrane discs called grana give photosynthesis a large working surface.'],
['vacuole','Central vacuole','Storage & support','Room to grow','A large membrane-bound compartment occupies much of a mature plant cell. It stores water and solutes and helps maintain pressure against the cell wall.','Maintains turgor pressure and stores water, ions, and other materials.','When cells lose water, turgor pressure falls and the plant may wilt.'],
['wall','Cell wall','Structural support','A supportive outer layer','Outside the cell membrane, the plant cell wall is a strong, porous layer made largely of cellulose. It supports the cell while allowing water and many dissolved substances through.','Provides support, protection, and resistance to excessive expansion.','Tiny channels called plasmodesmata connect neighboring plant cells through their walls.'],
['peroxisome','Peroxisome','Oxidation','Oxidative reactions','Peroxisomes are small, membrane-bound compartments containing enzymes for oxidation reactions. They participate in fatty acid metabolism and help process hydrogen peroxide.','Carries out oxidation reactions and breaks down hydrogen peroxide using catalase.','Hydrogen peroxide can damage cell components, so peroxisomes keep its production and breakdown in a controlled compartment.'],
['centrosome','Centrosome','Microtubule organization','Organizing the cell’s scaffolding','In many animal cells, the centrosome is a microtubule-organizing region near the nucleus. It contains two centrioles embedded in a surrounding protein matrix.','Organizes microtubules and helps form the mitotic spindle.','Typical flowering plant cells organize microtubules without the paired centrioles shown in this animal model.'],
['cytoskeleton','Cytoskeleton','Support and movement','An internal network','A network of protein filaments extends through the cytoplasm. Microtubules, actin filaments, and intermediate filaments contribute to cell shape, movement, and internal organization.','Supports cell shape and provides tracks for intracellular transport.','Motor proteins can move cargo along microtubules, connecting distant parts of the cell.'],
['vesicle','Transport vesicle','Membrane transport','Moving cargo','Small membrane-bound carriers shuttle cargo between compartments. Different vesicles move proteins and lipids along different routes through the cell.','Transports cargo between membrane-bound compartments.','A carrier’s membrane can fuse with its destination membrane, delivering the contents without exposing them to the cytosol.']
].map(([id,name,category,kicker,description,fn,fact])=>({id,name,category,kicker,description,fn,fact}));
let type='plant', selected='nucleus', quiz=false, question=0, answered=false, score=0;
const $=s=>document.querySelector(s);
const available=()=>specimenCatalog[type].ids.map(id=>structures.find(s=>s.id===id)).filter(Boolean);
const group=(id,art)=>`<g class="organelle ${['lysosome','centrosome','chloroplast','vacuole','wall'].includes(id)?'different-structure':'shared-structure'} ${selected===id?'selected':''}" data-id="${id}" role="button" tabindex="0" aria-label="${structures.find(s=>s.id===id).name}" aria-pressed="${selected===id}"><title>${structures.find(s=>s.id===id).name}</title>${art}</g>`;
function render(){
const focused = document.activeElement;
const focusId = focused?.closest('[data-id]')?.dataset.id;
const focusSelect = focused?.dataset.select;
const spec=specimenCatalog[type];
$('#cell').innerHTML=renderAtlasArtwork(type,selected,$('#labels').checked&&!quiz);
$('#specimen').textContent=spec.classification.toUpperCase()+' / '+spec.subtitle.toUpperCase();
$('#model-title').textContent=spec.name;
$('#model-subtitle').textContent=spec.subtitle+' · '+spec.classification;
$('.diagram-panel>.model-note:not(#comparison-highlight)').textContent=artworkMode==='3d'?'Interactive 3D teaching model · Structures and proportions are simplified.':artworkMode==='diagram'?'Annotated educational schematic · Not to scale.':['plant','animal'].includes(type)?'Generated teaching illustration · Switch to Diagram for the schematic.':'Generated teaching illustration · Colors and proportions are illustrative.';
$('#plate-number').textContent='PLATE '+String(Object.keys(specimenCatalog).indexOf(type)+1).padStart(2,'0');
$('#cell-classification').textContent=spec.classification==='Prokaryote'?'Prokaryotes':'Eukaryotes';
$('#specimen-context').textContent=spec.note;
const funFact=cellFunFacts[type];
$('#cell-fun-fact-title').textContent=funFact.title;
$('#cell-fun-fact-text').textContent=funFact.text;
$('#cell-fun-fact-source').href=funFact.source;
$('#cell-fun-fact-source').setAttribute('aria-label','Read the source for the '+spec.name.toLowerCase()+' fun fact');
$('#specimen-location').textContent=spec.where;
$('#structure-count').textContent=String(available().length).padStart(2,'0');
$('#organelle-list').innerHTML=available().map(s=>`<button data-select="${s.id}" class="${selected===s.id?'active':''}" aria-pressed="${selected===s.id}"><span class="organelle-swatch" style="--swatch:${structureColors[s.id]||'#a58eb4'}"></span><span>${s.name}</span><span class="row-arrow">↗</span></button>`).join('');
const s=structures.find(s=>s.id===selected)||structures.find(s=>s.id===spec.default),index=available().findIndex(a=>a.id===selected);
$('#detail-title').textContent=s.name;$('#detail-kicker').textContent=s.kicker;$('#description').textContent=s.description;$('#function').textContent=s.fn;$('#fact').textContent=s.fact;$('#category').textContent=s.category.toUpperCase();$('#detail-number').textContent=`${String(index+1).padStart(2,'0')} / CELL STRUCTURE`;$('#position').textContent=`${String(index+1).padStart(2,'0')} OF ${available().length}`;
renderCloseup(s);renderStructureProfile(s);
setZoom(zoom);
if(focusId)$(`#cell [data-id="${focusId}"]`)?.focus();
if(focusSelect)$(`[data-select="${focusSelect}"]`)?.focus();
}
function select(id){
selected=id;render();$('#cell-details').scrollTop=0;
if(matchMedia('(max-width:1050px)').matches)$('#cell-details').scrollIntoView({block:'start',behavior:'instant'});
}
$('#cell').addEventListener('click',e=>{const el=e.target.closest('[data-id]');if(el){if(quiz)check(el.dataset.id);else select(el.dataset.id)}});
$('#cell').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const el=e.target.closest('[data-id]');if(el){e.preventDefault();if(quiz)check(el.dataset.id);else select(el.dataset.id)}}});
$('#organelle-list').addEventListener('click',e=>{const button=e.target.closest('[data-select]');if(button){if(quiz)check(button.dataset.select);else select(button.dataset.select)}});
document.querySelector('.tabs').addEventListener('click',e=>{const button=e.target.closest('[data-type]');if(button)chooseSpecimen(button.dataset.type)});
document.querySelectorAll('[data-art]').forEach(button=>button.onclick=()=>{artworkMode=button.dataset.art;resetZoom();render()});
$('#labels').addEventListener('change',render);
for(const [id,delta] of [['previous',-1],['next',1]])$('#'+id).onclick=()=>{const a=available();select(a[(a.findIndex(s=>s.id===selected)+delta+a.length)%a.length].id)};
let questions=[], attempts=0, hintsUsed=0, assisted=0, usedHelp=false;
const explorationPanels = '#cell-fun-fact, aside > .function, aside > .fact, #description, #detail-kicker, #detail-icon, #closeup, #structure-profile, .specimen-context, .detail-nav';
function stopQuiz(){
 quiz=false;$('#quiz-save-status').hidden=true;$('#cell').classList.remove('quiz-mode');$('#quiz').textContent='↗ Test yourself';$('#quiz-area').hidden=true;$('#labels').disabled=false;
 document.querySelectorAll(explorationPanels).forEach(e=>e.hidden=false);
}
$('#quiz').onclick=()=>{
 if(quiz){stopQuiz();selected=selected||specimenCatalog[type].default;render();return}
 quiz=true;question=0;score=0;assisted=0;hintsUsed=0;resetZoom();
 questions=[...available()];
 for(let i=questions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[questions[i],questions[j]]=[questions[j],questions[i]]}
 questions=questions.slice(0,5);$('#quiz-save-status').hidden=false;window.QuizStore?.begin(type,questions.map(q=>q.id));$('#quiz').textContent='× Exit quiz';$('#labels').disabled=true;showQuestion();
 if(matchMedia('(max-width:1050px)').matches)$('#cell-details').scrollIntoView({block:'start'});
};
function showQuestion(){
 answered=false;attempts=0;usedHelp=false;selected=null;$('#cell').classList.add('quiz-mode');render();
 document.querySelectorAll(explorationPanels).forEach(e=>e.hidden=true);
 $('#detail-title').textContent='Find the structure';$('#category').textContent='PRACTICE';$('#detail-number').textContent=`QUESTION ${question+1} / 5`;
 $('#quiz-area').hidden=false;
 const fn=questions[question].fn;
 $('#quiz-area').innerHTML=`<p>Which structure ${fn.charAt(0).toLowerCase()+fn.slice(1).replace(/\.$/,'')}?</p><p>Choose below or select it in the diagram.</p><div id="quiz-options"></div><p id="feedback" role="status"></p><div class="quiz-actions"><button id="hint" class="quiz-choice">Give me a hint</button><button id="reveal" class="quiz-choice">Show answer</button></div><p id="hint-text" class="hint-text" hidden></p>`;
 $('#quiz-options').innerHTML=available().map(s=>`<button class="quiz-option" data-answer="${s.id}">${s.name}</button>`).join('');
 $('#quiz-options').onclick=e=>{if(e.target.dataset.answer)check(e.target.dataset.answer)};
 $('#hint').onclick=()=>{window.QuizStore?.record('hint',question+1);if(!usedHelp)hintsUsed++;usedHelp=true;$('#hint-text').hidden=false;$('#hint-text').textContent=structureHints[questions[question].id];$('#hint').disabled=true};
 $('#reveal').onclick=()=>{if(answered)return;usedHelp=true;finishAnswer(false,true)};
}
function check(id){
 if(answered)return;
 const target=questions[question],chosen=structures.find(s=>s.id===id);
 if(!chosen||!available().some(s=>s.id===id))return;
 window.QuizStore?.record('answer',question+1,id);
 if(id!==target.id){
  attempts++;$('#feedback').textContent=`${chosen.name}: ${chosen.fn} That function differs from the one in the question. Try another structure, or use a hint.`;
  const option=$(`[data-answer="${id}"]`);if(option)option.disabled=true;
  return;
 }
 finishAnswer(attempts===0&&!usedHelp,false);
}
function finishAnswer(independent,revealed){
 answered=true;const target=questions[question];if(revealed)window.QuizStore?.record('reveal',question+1);
 if(independent)score++;else if(!revealed)assisted++;
 $('#feedback').textContent=`${revealed?'The answer is': 'Correct!'} ${target.name}. ${target.fn} ${revealed?'Explore it, then continue.':independent?'You identified it on your first try.':'You found it with practice.'}`;
 selected=target.id;
 if(artworkMode==='3d')window.Cell3D?.show(type,selected,false,true);
 document.querySelectorAll('#cell [data-id], [data-select]').forEach(e=>{const active=(e.dataset.id||e.dataset.select)===selected;e.classList.toggle(e.dataset.id?'selected':'active',active);e.setAttribute('aria-pressed',String(active))});
 document.querySelectorAll('#quiz-options button, #hint, #reveal').forEach(b=>b.disabled=true);
 const btn=document.createElement('button');btn.className='quiz-choice quiz-next';btn.textContent=question===4?'See results →':'Next question →';
 btn.onclick=()=>{question++;if(question<5){showQuestion();$('#detail-title').setAttribute('tabindex','-1');$('#detail-title').focus({preventScroll:true})}else{
  $('#detail-title').textContent='Keep looking closer.';
  $('#quiz-area').innerHTML=`<p><strong>${score} of 5</strong> correct on the first try without hints.</p><p>${assisted} solved with practice · ${5-score-assisted} revealed · ${hintsUsed} hints used.</p><p>Retries help you learn. Explore the structures and try again whenever you’re ready.</p><button class="quiz-choice" id="finish">Back to exploring →</button>`;
  $('#finish').onclick=()=>{stopQuiz();selected=specimenCatalog[type].default;render();$('#quiz').focus({preventScroll:true})};$('#finish').focus({preventScroll:true});
 }};
 $('#quiz-area').append(btn);btn.focus({preventScroll:true});
}

window.CellAtlasBridge={nameFor:id=>structures.find(s=>s.id===id)?.name||id,hasStructure:id=>available().some(s=>s.id===id)};
window.addEventListener('cell3d-ready',()=>{if(artworkMode==='3d')render()});
window.addEventListener('cell3d-select',event=>{if(quiz)check(event.detail.id);else select(event.detail.id)});
window.addEventListener('cell3d-zoom',event=>{if(artworkMode!=='3d')return;zoom=event.detail.factor;$('#zoom-level').textContent=Math.round(zoom*100)+'%';$('#zoom-out').disabled=zoom<=.401;$('#zoom-in').disabled=zoom>=3.99});
