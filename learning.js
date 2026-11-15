// Learning activities are kept separate from the cell illustration and its content.
const anatomy = {
 peroxisome: [['Membrane','A single membrane separates oxidative reactions from the cytosol.'],['Oxidative enzymes','Enzymes participate in reactions such as fatty acid breakdown.'],['Catalase','Catalase converts hydrogen peroxide into water and oxygen.']],
 centrosome: [['Centriole pair','Two centrioles lie approximately at right angles in this animal-cell model.'],['Microtubules','Each centriole has nine triplets of microtubules arranged around its circumference.'],['Surrounding matrix','Pericentriolar material helps nucleate and anchor microtubules.']],
 cytoskeleton: [['Microtubules','Hollow tubulin polymers provide transport tracks and help organize the cell.'],['Actin filaments','Thin filaments support cell shape and contribute to movement.'],['Intermediate filaments','These fibers provide mechanical support in many animal cells; plants use a different supporting toolkit.']],
 vesicle: [['Lipid membrane','A lipid bilayer encloses the carrier.'],['Cargo','Proteins, lipids, and other materials move toward specific destinations.'],['Fusion machinery','Membrane proteins help carriers recognize and fuse with appropriate membranes.']],
 nucleus: [['Nuclear envelope','Two membranes separate the nucleus from the cytoplasm.'],['Nuclear pores','Protein complexes in the envelope regulate traffic, including RNA export and protein import.'],['DNA / chromatin','DNA associates with proteins as chromatin. Genes provide instructions for making RNA and proteins.']],
 nucleolus: [['Ribosomal RNA','Ribosomal RNA is transcribed and processed here.'],['Ribosomal subunits','RNA and imported proteins assemble into small and large subunits.'],['No surrounding membrane','The nucleolus is a dense nuclear region, not a membrane-bound compartment.']],
 mitochondrion: [['Outer membrane','The outer boundary surrounds the mitochondrion.'],['Cristae / inner membrane','Folds of the inner membrane support the electron transport chain and ATP synthase.'],['Matrix','The interior contains enzymes for the citric acid cycle, along with mitochondrial DNA and ribosomes.']],
 'rough-er': [['Bound ribosomes','Ribosomes on the cytosolic surface synthesize proteins entering the secretory pathway.'],['ER lumen','Inside the ER, new proteins fold and begin processing.'],['Membrane sheets','Connected sacs provide a separate space for protein processing.']],
 'smooth-er': [['Membrane tubules','A branching network provides surfaces for lipid synthesis.'],['ER lumen','An internal space helps store calcium in specialized cells.'],['No bound ribosomes','This region lacks the ribosomes that give rough ER its studded appearance.']],
 golgi: [['Cis face','The receiving side accepts material arriving from the ER.'],['Cisternae','Stacked flattened sacs support further processing.'],['Trans face','The shipping side sorts cargo into vesicles for different destinations.']],
 ribosomes: [['Large subunit','Catalyzes the formation of peptide bonds between amino acids.'],['Small subunit','Helps read the codons in messenger RNA.'],['mRNA','A messenger RNA template specifies the order of amino acids.']],
 membrane: [['Phospholipid heads','Water-attracting heads face the fluids on either side.'],['Fatty acid tails','Water-avoiding tails face inward, forming a barrier to many substances.'],['Membrane protein','Transport proteins help specific substances cross the membrane.']],
 cytosol: [['Water and ions','The aqueous environment contains dissolved salts and other small molecules.'],['Enzymes','Proteins catalyze reactions, such as the steps of glycolysis.'],['Dissolved metabolites','Small molecules participate in the cell’s chemical reactions.']],
 lysosome: [['Single membrane','A membrane encloses the digestive compartment.'],['Digestive enzymes','Enzymes break down large biological molecules.'],['Acidic interior','An acidic environment supports lysosomal enzyme activity.']],
 chloroplast: [['Envelope','Two membranes enclose the chloroplast.'],['Grana / thylakoids','Stacks of membrane discs contain the machinery for light-dependent reactions.'],['Stroma','The fluid around thylakoids contains enzymes that build sugars using carbon fixation.']],
 vacuole: [['Tonoplast','The vacuole’s membrane controls exchange with the cytosol.'],['Cell sap','Water and dissolved substances fill the central vacuole.'],['Turgor pressure','Water in the vacuole helps press cell contents against the supportive wall.']],
 wall: [['Cellulose fibers','Strong cellulose microfibrils reinforce the plant cell wall.'],['Wall matrix','Other polysaccharides surround and connect the cellulose framework.'],['Plasmodesmata','Channels connect the cytoplasm of neighboring plant cells through their walls.']]
};
// Original study notes: architecture, location, recognition, and functional connections.
const structureProfiles={
 nucleus:['Double membrane','Within the cytoplasm','Look for pores in the cut envelope and fine chromatin threads inside.','Messenger RNA carries genetic instructions from the nucleus to ribosomes. Nuclear pores regulate this exchange.'],
 nucleolus:['No surrounding membrane','Inside the nucleus','The dense, darker body sits among the chromatin.','Ribosomal RNA and ribosomal proteins assemble here into subunits that leave through nuclear pores.'],
 mitochondrion:['Double membrane','Distributed in the cytoplasm','The open interior reveals cristae: folds of the inner membrane.','The inner membrane maintains a proton gradient that powers ATP synthase. ATP supports transport, synthesis, and movement.'],
 chloroplast:['Double envelope + thylakoids','Photosynthetic plant cells','Find the stacks of green thylakoid discs, connected by lamellae.','Light reactions occur in thylakoid membranes; carbon fixation occurs in the surrounding stroma. Plant mitochondria still carry out respiration.'],
 'rough-er':['Connected membrane sacs','Around the nuclear envelope','Small attached ribosomes distinguish rough ER from smooth ER.','Proteins enter the ER while being translated, then fold and travel in vesicles toward the Golgi.'],
 'smooth-er':['Connected membrane tubules','Cytoplasm; continuous with rough ER','Follow branching tubes without the ribosome-studded surface.','Different cells use smooth ER for lipid synthesis, detoxification, or calcium handling. Its specialization reflects the cell’s job.'],
 golgi:['Single-membrane cisternae','Cytoplasm, linked by vesicle traffic','Flattened curved sacs form a stack, with small carriers nearby.','The cis side receives cargo from the ER. The trans side sorts it toward membranes, digestive compartments, or secretion.'],
 ribosomes:['RNA–protein complexes','Free in cytosol or bound to ER','Ribosomes are enlarged dots in this model; bound ones sit on the cytosolic face of ER.','Free and bound ribosomes share the same basic machinery. Signals in a growing protein determine where its ribosome works.'],
 membrane:['Phospholipid bilayer','The cell’s outer boundary','In plant cells, the membrane lies just inside the thicker cell wall.','Transport proteins, receptors, and membrane lipids help the cell exchange material and respond to its surroundings.'],
 cytosol:['Aqueous fluid; no membrane','Around cellular structures','The spaces around organelles are part of the cytosol, not empty gaps.','Many metabolic reactions occur here. Cytoplasm includes cytosol and the structures outside the nucleus suspended within it.'],
 lysosome:['Single membrane','Cytoplasm of many animal cells','Small rounded compartments are shown separately from transport vesicles.','Acidic conditions support digestive enzymes. Lysosomes receive material from endocytosis and from recycling worn cellular components.'],
 peroxisome:['Single membrane','Cytoplasm','Find a small compartment distinct from mitochondria and lysosomes.','Oxidation reactions can make hydrogen peroxide; catalase helps break it down. Peroxisomes also participate in lipid metabolism.'],
 vesicle:['Single membrane','Between membrane compartments','Small round carriers cluster near the ER, Golgi, and cell surface.','Membrane recognition and fusion deliver cargo to the correct destination while keeping it separated from the cytosol.'],
 vacuole:['Single membrane: tonoplast','Much of a mature plant cell’s interior','The large pale-blue compartment pushes much of the cytoplasm toward the edge.','Water movement across the tonoplast helps establish turgor pressure. The surrounding cell wall limits expansion.'],
 wall:['Cellulose-rich extracellular layer','Outside the plant plasma membrane','The thick green cut edge shows the supportive wall around the specimen.','Cellulose microfibrils and a matrix of other polysaccharides give support. Plasmodesmata connect neighboring cells through the wall.'],
 cytoskeleton:['Protein filament network','Throughout the cytoplasm','Fine fibers extend between the cell boundary and internal structures.','Actin and microtubules support shape and movement. Motor proteins use filaments as tracks; animal cells also have intermediate filaments.'],
 centrosome:['Centrioles + surrounding matrix','Near the nucleus in many animal cells','Two short cylinders lie approximately at right angles.','The surrounding matrix organizes microtubules. A centriole contains nine microtubule triplets; flowering plants organize microtubules without these paired centrioles.'],
 soma:['Cell body','Between dendrites and axon','The enlarged body contains the nucleus and much of the synthetic machinery.','The soma maintains the neuron. Signals from many inputs influence whether an action potential begins near the start of the axon.'],
 dendrites:['Branched membrane extensions','Extending from the soma','Follow the short branches spreading away from the cell body.','Many synapses deliver inputs onto dendrites. Branching and, in many neurons, dendritic spines provide space for synaptic contacts.'],
 axon:['Long membrane extension','From soma toward target cells','A single long fiber connects the soma to the terminal branches.','Action potentials propagate along the axonal membrane. The length is compressed here so both ends fit in one teaching view.'],
 myelin:['Many layers of glial membrane','Around portions of the axon','Insulating segments are separated by nodes of Ranvier.','Glial cells form myelin. Current spreads beneath it while action potentials are regenerated at nodes, accelerating conduction.'],
 terminals:['Specialized axon endings','At the far end of the axon','Small rounded endings finish the terminal branches.','At chemical synapses, calcium entry triggers vesicle fusion and neurotransmitter release toward a target cell.'],
 microvilli:['Actin-supported projections','Apical surface of absorptive cells','The brush border consists of many short projections.','Microvilli enlarge absorptive surface area. Their actin core links to the cell’s internal cytoskeleton; they are not motile cilia.'],
 junctions:['Membrane-associated complexes','Where neighboring cells meet','Small lateral complexes indicate contact with neighboring cells.','Tight junctions limit passage between cells; anchoring junctions resist mechanical stress. Gap junctions permit selected small molecules and ions to pass.'],
 basement:['Specialized extracellular matrix','Beneath the epithelial basal surface','The layered platform is outside the cell, below its basal membrane.','Laminins, collagen IV, and other matrix molecules support adhesion and tissue organization. Basement membrane is not an organelle.'],
 nucleoid:['DNA region; no nuclear envelope','Bacterial cytoplasm','The coiled chromosome is exposed directly to the cytoplasm.','DNA-binding proteins help organize the chromosome. Without a nuclear envelope, transcription and translation can be closely coupled.'],
 plasmid:['Accessory DNA molecule','Bacterial cytoplasm','Small DNA loops are separate from the large nucleoid.','Plasmids replicate independently of the main chromosome. Some carry genes that affect survival and some can transfer between cells.'],
 'bacterial-ribosomes':['70S RNA–protein complexes','Bacterial cytoplasm','The many small dots surround the chromosome.','These ribosomes translate messenger RNA. Their differences from eukaryotic cytosolic ribosomes make them targets of some antibiotics.'],
 'bacterial-wall':['Peptidoglycan-containing layer','Outside the bacterial plasma membrane','Look at the distinct cut layers around the cell.','Peptidoglycan helps resist osmotic stress. Bacterial envelopes vary: this is a generalized model, not a complete Gram-positive or Gram-negative reconstruction.'],
 capsule:['Organized outer coating','Beyond the bacterial cell wall','The outermost pale coating surrounds the envelope.','Capsules can aid attachment and protection. Many bacteria lack them, and capsule chemistry varies among species.'],
 pili:['Protein appendages','Bacterial outer surface','Short surface projections differ from the long flagellar filaments.','Some appendages aid attachment, while specialized pili can participate in DNA transfer. Their form and function vary.'],
 flagellum:['Filament, hook, and rotary motor','Anchored in the bacterial envelope','Long wavy filaments extend away from one end.','A motor drives rotation for locomotion. Bacterial flagella are distinct from the microtubule-based flagella of eukaryotes.'],
 myofibril:['Bundles of contractile filaments','Along the muscle fiber','Parallel cylinders show repeating light and dark bands.','Each myofibril contains repeated sarcomeres. Aligned actin and myosin generate force across the length of the fiber.'],
 sarcomere:['Z disc to Z disc','Repeating units in a myofibril','Repeating bands mark the organization of contractile proteins.','During contraction, thin and thick filaments slide past each other. Their overlap changes; the filaments do not themselves shorten.'],
 'sarcoplasmic-reticulum':['Specialized smooth ER','Around skeletal-muscle myofibrils','A fine membrane network surrounds the contractile bundles.','Calcium release enables contraction. Pumps return calcium to the SR so the fiber can relax; T tubules coordinate the signal inward.'],
 't-tubule':['Plasma-membrane invagination','Extending into the muscle fiber','Transverse tubes run inward between contractile regions.','Electrical excitation travels into the fiber and triggers calcium release from nearby sarcoplasmic reticulum. The lumen is continuous with the extracellular space.']
};
function renderStructureProfile(s){
 const profile=structureProfiles[s.id];
 const panel=document.querySelector('#structure-profile');panel.hidden=!profile;
 if(!profile)return;
 const [architecture,location,recognize,connection]=profile;
 document.querySelector('#profile-architecture').textContent=architecture;
 document.querySelector('#profile-location').textContent=location;
 document.querySelector('#profile-recognize').textContent=recognize;
 document.querySelector('#profile-connection').textContent=connection;
 document.querySelector('#profile-connections').open=false;
 document.querySelector('#detail-focus').hidden=artworkMode!=='3d';
}
const diagramAnatomyIds=new Set(Object.keys(anatomy));
for(const [id,name,category,kicker,description,fn,fact] of specializedStructures){
 anatomy[id]=[['Structure',description],['Function',fn],['Field note',fact]];
}
const structureHints = {
 peroxisome:'Look for small green spheres that contain enzymes for oxidative chemistry.',
 centrosome:'Look for a pair of short striped cylinders near the animal cell’s nucleus.',
 cytoskeleton:'Follow the fine protein fibers extending through the cell.',
 vesicle:'Look for small membrane-enclosed carriers near the Golgi and cell surface.', 
 nucleus:'Look for a large compartment surrounded by an envelope. It contains the cell’s chromatin.',
 nucleolus:'Look inside the nucleus for a dense region without its own membrane.',
 mitochondrion:'Look for an oval with a folded inner membrane. It is found in both models.',
 'rough-er':'Look for membrane sheets near the nucleus, studded with ribosomes.',
 'smooth-er':'Look for branching membrane tubules without attached ribosomes.',
 golgi:'Look for a stack of curved, flattened sacs and nearby small vesicles.',
 ribosomes:'These tiny dots are found freely in the cytosol and on the rough ER.',
 membrane:'Find the thin boundary around the cell; in the plant it lies just inside the wall.',
 cytosol:'Think of the fluid surrounding organelles rather than a membrane-enclosed compartment.',
 lysosome:'Look for a small, round digestive compartment in the animal model.',
 chloroplast:'Look for green ovals with stacks of internal discs in the plant model.',
 vacuole:'Look for the large, water-filled compartment occupying much of the plant model.',
 wall:'Find the supportive outer layer beyond the membrane in the plant model.'
};
for(const [id,name,category,kicker,description] of specializedStructures){structureHints[id]=description;}
const mark=(x,y,n)=>`<g class="anatomy-marker" data-marker="${n}"><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y+5}" text-anchor="middle">${n+1}</text></g>`;
function anatomyArt(id){
 let art='',points=[];
 if(id==='cytoskeleton'){
  art='<g fill="none" stroke-linecap="round"><path d="M50 45Q190 140 330 155M50 60Q190 155 330 170" stroke="#b99e7c" stroke-width="8"/><path d="M70 160Q200 70 330 55" stroke="#bc7a99" stroke-width="4"/><path d="M80 90Q210 175 310 90" stroke="#a894be" stroke-width="5" stroke-dasharray="6 4"/></g>';points=[[122,98],[241,81],[275,118]];
 }else if(id==='centrosome'){
  art='<g transform="translate(105 80) rotate(15)"><rect width="140" height="42" rx="13" fill="#bcad87" stroke="#8b7e5d" stroke-width="3"/>'+Array.from({length:12},(_,i)=>`<path d="M${10+i*10} 3v36" stroke="#897d5c" stroke-width="3"/>`).join('')+'</g><g transform="translate(230 103) rotate(78)"><rect width="80" height="35" rx="12" fill="#c7b993" stroke="#8b7e5d" stroke-width="3"/></g>';points=[[129,101],[183,111],[270,73]];
 }else if(id==='nucleus'){
  art='<ellipse cx="190" cy="107" rx="142" ry="85" fill="#bc99cd" stroke="#806091" stroke-width="9"/><ellipse cx="190" cy="107" rx="131" ry="74" fill="none" stroke="#e2cfe9" stroke-width="3"/><circle cx="236" cy="124" r="27" fill="#805295"/><path d="M98 77q23-32 45 0t45 0t45 0 M98 118q23-32 45 0t45 0 M100 77v41m22-43v36m22-34v43m21-42v36m23-34v31" stroke="#9260a3" stroke-width="3" fill="none"/><ellipse cx="322" cy="78" rx="11" ry="7" fill="#6c497e" transform="rotate(35 322 78)"/>';
  points=[[80,55],[322,78],[151,100]];
 }else if(id==='mitochondrion'){
  art='<ellipse cx="190" cy="107" rx="151" ry="76" fill="#e6be94" stroke="#a67352" stroke-width="5"/><path d="M62 108Q74 45 102 63 L108 131 Q118 151 132 130 L139 66 Q150 47 162 68 L169 142 Q183 161 193 139 L201 67 Q215 48 226 72 L234 139 Q248 156 257 132 L265 77 Q277 62 287 86 L295 127 Q310 142 319 108" stroke="#a87555" stroke-width="6" fill="none"/>';
  points=[[68,64],[167,142],[211,105]];
 }else if(id==='chloroplast'){
  art='<ellipse cx="190" cy="107" rx="148" ry="77" fill="#b9ce8c" stroke="#698b4e" stroke-width="6"/><ellipse cx="190" cy="107" rx="137" ry="66" fill="none" stroke="#e7edc6" stroke-width="3"/>';
  for(let x of [105,180,255])for(let y of [81,94,107,120])art+=`<ellipse cx="${x}" cy="${y}" rx="23" ry="6" fill="#719955" stroke="#4d793f" stroke-width="2"/>`;
  art+='<path d="M125 110H158 M202 110H233" stroke="#6e9252" stroke-width="4"/>';points=[[65,70],[180,93],[253,151]];
 }else if(id==='membrane'){
  art='<rect x="32" y="67" width="316" height="82" rx="8" fill="#dce3bc"/>';
  for(let x=45;x<345;x+=22)art+=`<path d="M${x-4} 75v30m8-30v30m-8 33v-25m8 25v-25" stroke="#92a568" stroke-width="3"/><circle cx="${x}" cy="69" r="8" fill="#6d956e"/><circle cx="${x}" cy="146" r="8" fill="#6d956e"/>`;
  art+='<rect x="232" y="48" width="40" height="118" rx="18" fill="#a98d69"/><path d="M251 65v83" stroke="#f1ead7" stroke-width="8"/>';points=[[88,66],[134,109],[251,105]];
 }else if(id==='ribosomes'){
  art='<path d="M89 108Q81 35 189 35Q298 34 288 108Z" fill="#a7b491" stroke="#748965" stroke-width="3"/><path d="M98 132Q189 183 280 132L274 118H105Z" fill="#c6d0ad" stroke="#748965" stroke-width="3"/><path d="M41 113H337" stroke="#a77e52" stroke-width="6"/><path d="M182 39l10-14 12 5 11-14 11 6" stroke="#ca9860" stroke-width="5" fill="none"/>';points=[[191,73],[188,142],[65,113]];
 }else if(id==='golgi'){
  for(let i=0;i<5;i++)art+=`<path d="M${83+i*12} ${48+i*26}q${110-i*7} 44 ${215-i*20} 0" fill="none" stroke="${['#aaa16a','#b7ad78','#c3b985','#cbbf8b','#d1c696'][i]}" stroke-width="17" stroke-linecap="round"/>`;
  art+='<circle cx="304" cy="161" r="14" fill="#cabf89"/>';points=[[88,42],[190,102],[280,166]];
 }else if(id==='rough-er'||id==='smooth-er'){
  art='<g stroke="#78937c" stroke-width="5" fill="#c1d0ae"><path d="M54 62Q111 25 176 61T325 62L325 94Q250 133 176 96T54 94Z"/><path d="M54 132Q111 95 176 131T325 132L325 164Q250 203 176 166T54 164Z"/></g>';
  if(id==='rough-er')for(let i=0;i<12;i++)art+=`<circle cx="${65+i*23}" cy="${i%2?60:47}" r="5" fill="#4e6e56"/>`;
  points=id==='rough-er'?[[110,60],[240,83],[131,144]]:[[78,63],[240,83],[148,115]];
 }else if(id==='wall'){
  art='<rect x="45" y="35" width="290" height="144" rx="12" fill="#d7dfb6" stroke="#8ca46b" stroke-width="3"/>';
  for(let i=0;i<6;i++)art+=`<path d="M50 ${48+i*22}l280 18M${80+i*40} 38l-20 134" stroke="#92a56c" stroke-width="5"/>`;
  art+='<path d="M190 35V179" stroke="#4c7a68" stroke-width="17"/><path d="M190 35V179" stroke="#c5ded1" stroke-width="7"/>';points=[[107,76],[269,113],[190,112]];
 }else{
  const color=id==='lysosome'?'#d7c98c':id==='nucleolus'?'#bc9b85':id==='cytosol'?'#e0e8c8':id==='peroxisome'?'#b4cda5':id==='vesicle'?'#e5d6b3':'#bcd9d1';
  art=`<ellipse cx="190" cy="107" rx="142" ry="78" fill="${color}" stroke="#8da584" stroke-width="${id==='nucleolus'||id==='cytosol'?0:5}"/>`;
  if(id==='cytosol')art+='<path d="M108 79q20-22 35 0t30 0M210 119q20-22 35 0t30 0" stroke="#89a06e" stroke-width="8" fill="none"/>';
  if(id==='nucleolus'||id==='lysosome')for(let i=0;i<18;i++)art+=`<circle cx="${92+(i*37)%190}" cy="${65+(i*23)%86}" r="${i%2?5:8}" fill="${id==='lysosome'?'#a29455':'#977561'}"/>`;
  if(id==='peroxisome'||id==='vesicle'){for(let i=0;i<16;i++)art+=`<circle cx="${110+(i*37)%160}" cy="${69+(i*23)%75}" r="${i%3+2}" fill="${id==='peroxisome'?'#7d9d70':'#bf9c66'}" opacity=".6"/>`;}
  points=['vacuole','peroxisome','lysosome','vesicle'].includes(id)?[[63,75],[190,106],[306,130]]:[[100,70],[218,117],[291,82]];
 }
 return `<svg viewBox="0 0 380 210" role="img" aria-label="Close-up of ${structures.find(s=>s.id===id).name}. Use the numbered controls to explore its features.">${art}${points.map(([x,y],n)=>mark(x,y,n)).join('')}</svg>`;
}
function renderCloseup(s){
 const photo=specimenDetailImage(s.id);
 const sketch=diagramAnatomyIds.has(s.id)?anatomyArt(s.id):'';
 $('#closeup-art').innerHTML=photo+(sketch?`<details class="anatomy-schematic"><summary>Annotated anatomy</summary>${sketch}</details>`:'');
 if(!photo&&!sketch)$('#closeup-art').innerHTML=`<img class="organelle-render" src="assets/specimens/${type}.png" alt="${specimenCatalog[type].name} teaching illustration">`;
 $('#closeup-count').textContent=diagramAnatomyIds.has(s.id)?'3 FEATURES':'3 STUDY NOTES';
 $('#closeup-parts').innerHTML=anatomy[s.id].map(([label],i)=>`<button data-part="${i}" aria-pressed="${i===0}"><b>${i+1}</b> ${label}</button>`).join('');
 const showPart=i=>{
  $('#closeup-note').textContent=anatomy[s.id][i][1];
  document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.part)===i)));
  document.querySelectorAll('[data-marker]').forEach(m=>m.classList.toggle('active',Number(m.dataset.marker)===i));
 };
 $('#closeup-parts').onclick=e=>{const b=e.target.closest('[data-part]');if(b)showPart(Number(b.dataset.part))};
 showPart(0);
}

let zoom=1;
function setZoom(value){
 const live3d=artworkMode==='3d';
 zoom=Math.max(live3d ? 0.4 : 1,Math.min(live3d?4:3,value));
 if(live3d){window.Cell3D?.zoomTo(zoom)}else{
  const frame=$('#cell-viewport');const base=Math.min(frame.clientWidth,Math.max(230,frame.clientHeight)*820/570);$('#cell').style.width=`${base*zoom}px`;
 }
 $('#zoom-level').textContent=`${Math.round(zoom*100)}%`;
 $('#zoom-out').disabled=zoom<=(live3d ? 0.401 : 1);$('#zoom-in').disabled=zoom>=(live3d?3.99:3);
}
function resetZoom(){if(artworkMode==='3d'){window.Cell3D?.reset();setZoom(1)}else{setZoom(1);$('#cell-viewport').scrollTo(0,0)}}
$('#zoom-in').onclick=()=>setZoom(zoom+.5);
$('#zoom-out').onclick=()=>setZoom(zoom-.5);
$('#zoom-reset').onclick=resetZoom;
window.addEventListener('resize',()=>requestAnimationFrame(()=>setZoom(zoom)));
// Native scrolling pans the enlarged SVG on phones, trackpads, and keyboards.
resetZoom();

const journey = [
 ['Ribosome','Build the chain','A ribosome begins reading mRNA in the cytosol. For this secreted protein, a targeting signal brings the ribosome to the rough ER as translation continues.',100,109],
 ['Rough ER','Fold and check','The growing protein enters the ER lumen. It folds into a working shape and undergoes quality control before export.',234,109],
 ['Transport vesicle','Make the connection','A small membrane carrier buds from the ER and delivers its cargo to the receiving side of the Golgi.',366,109],
 ['Golgi','Modify and sort','The cargo passes through Golgi compartments for further processing and sorting toward its destination.',499,109],
 ['Secretory vesicle','Pack for delivery','A carrier leaving the Golgi brings the secreted protein toward the cell surface.',632,109],
 ['Cell membrane','Release outside','The vesicle membrane fuses with the cell membrane. Its soluble cargo leaves the cell by exocytosis.',765,109]
];
let journeyStep=0,playing=false,journeyTimer=null,cargoAnimation=null;
$('#journey-stages').innerHTML=journey.map(([name],i)=>`<button data-stage="${i}" aria-pressed="${i===0}"><span>${String(i+1).padStart(2,'0')}</span>${name}</button>`).join('');
$('#journey-art').innerHTML=`<path d="M100 109H765" stroke="#bdc9b0" stroke-width="3" stroke-dasharray="5 7"/>
<g stroke="#76906f" stroke-width="3"><path d="M69 103q30-54 61 0z" fill="#a3b68e"/><path d="M72 121q29 27 56 0z" fill="#c5d2ad"/><path d="M53 115h94"/>
<path d="M191 79q43-28 86 0v24q-43 28-86 0zm0 48q43-28 86 0v24q-43 28-86 0z" fill="#c3d0af"/>
<circle cx="366" cy="109" r="28" fill="#d5dfba"/>
<g fill="none" stroke="#b2a274" stroke-width="12" stroke-linecap="round"><path d="M459 71q40 22 80 0m-74 24q35 22 68 0m-61 24q30 22 55 0m-46 24q19 16 38 0"/></g>
<circle cx="632" cy="109" r="28" fill="#d5dfba"/><path d="M748 46v125m15-125v125" stroke-width="7"/>
<path d="M778 109h40l-10-8m10 8-10 8" fill="none"/></g>
<circle id="protein-dot" cx="100" cy="109" r="9" fill="#bf8139" stroke="#fff8dc" stroke-width="3"/>
${journey.map(([name],i)=>`<text x="${journey[i][3]}" y="204" text-anchor="middle">${name}</text>`).join('')}`;
function pauseJourney(freeze=true){if(freeze&&cargoAnimation?.playState==='running')cargoAnimation.pause();playing=false;clearInterval(journeyTimer);journeyTimer=null;$('#journey-play').textContent=journeyStep===5?'Replay journey':'Play journey';$('#journey-play').setAttribute('aria-pressed','false')}
function showJourney(){
 const [name,title,description,x,y]=journey[journeyStep];
 $('#journey-step-title').textContent=title;$('#journey-description').textContent=description;$('#journey-position').textContent=`STEP ${journeyStep+1} OF 6 · ${name.toUpperCase()}`;
 const dot=$('#protein-dot'),from=Number(dot.getAttribute('cx'));
 cargoAnimation?.cancel();dot.setAttribute('cx',x);dot.setAttribute('cy',y);
 if(playing&&from!==x&&!matchMedia('(prefers-reduced-motion:reduce)').matches){cargoAnimation=dot.animate([{transform:`translateX(${from-x}px)`},{transform:'translateX(0px)'}],{duration:1200,easing:'ease-in-out'})}
 document.querySelectorAll('[data-stage]').forEach(b=>{b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===journeyStep));b.classList.toggle('completed',Number(b.dataset.stage)<journeyStep)});
 const windowEl=$('.journey-viewport');windowEl.scrollTo({left:x/860*$('#journey-art').getBoundingClientRect().width-windowEl.clientWidth/2,behavior:'instant'});
 $('#journey-prev').disabled=journeyStep===0;$('#journey-next').disabled=journeyStep===5;
 if(journeyStep===5)pauseJourney(false);
}
$('#journey-play').onclick=()=>{
 if(playing){pauseJourney();return}
 const replay=journeyStep===5;
 if(replay){journeyStep=0;cargoAnimation?.cancel();$('#protein-dot').setAttribute('cx',100);}
 playing=true;$('#journey-play').textContent='Pause journey';$('#journey-play').setAttribute('aria-pressed','true');
 if(replay)showJourney();else if(cargoAnimation?.playState==='paused')cargoAnimation.play();
 journeyTimer=setInterval(()=>{if(journeyStep<5){journeyStep++;showJourney()}else pauseJourney()},4500);
};
$('#journey-prev').onclick=()=>{pauseJourney();journeyStep=Math.max(0,journeyStep-1);showJourney()};
$('#journey-next').onclick=()=>{pauseJourney();journeyStep=Math.min(5,journeyStep+1);showJourney()};
$('#journey-reset').onclick=()=>{pauseJourney();journeyStep=0;showJourney()};
$('#journey-stages').onclick=e=>{const b=e.target.closest('[data-stage]');if(b){pauseJourney();journeyStep=Number(b.dataset.stage);showJourney()}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseJourney()});
showJourney();

function setView(view){
 document.body.dataset.page=view;
 history.replaceState(null,'',view==='atlas'?'#atlas':view==='journey'?'#protein-journey':'#comparison');
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
 pauseJourney();
 if(view!=='atlas')window.Cell3D?.hide();else if(artworkMode==='3d')window.Cell3D?.show(type,selected,$('#labels').checked,quiz);
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{setView(b.dataset.view);window.scrollTo({top:0,behavior:'instant'})});
setView(location.hash==='#protein-journey'?'journey':location.hash==='#comparison'?'compare':'atlas');
let comparisonFilter='all';
function renderComparison(){
 const shared=structures.filter(s=>specimenCatalog.animal.ids.includes(s.id)&&specimenCatalog.plant.ids.includes(s.id));
 const cards=[['shared','Shared foundations','Both models',shared],['animal','Animal specializations','Animal model',structures.filter(s=>['lysosome','centrosome'].includes(s.id))],['plant','Plant specializations','Plant model',structures.filter(s=>['chloroplast','vacuole','wall'].includes(s.id))]];
 $('#comparison-cards').innerHTML=cards.filter(([kind])=>comparisonFilter==='all'||(comparisonFilter==='shared'?kind==='shared':kind!=='shared')).map(([kind,title,label,items])=>`<article class="compare-card ${kind}"><p class="eyebrow">${label}</p><h3>${title}</h3><p>${kind==='shared'?'Both are eukaryotic cells, with a nucleus and many of the same working structures.':kind==='plant'?'A supportive wall, a large central vacuole, and chloroplasts in photosynthetic cells.':'This model includes lysosomes and a centrosome with centrioles. Plant lytic vacuoles perform similar digestive tasks; flowering plants organize microtubules without paired centrioles.'}</p><div>${items.map(s=>`<button data-compare-id="${s.id}" data-model="${kind}">${s.name} <span>↗</span></button>`).join('')}</div></article>`).join('');
}
document.querySelectorAll('[data-compare]').forEach(b=>b.onclick=()=>{comparisonFilter=b.dataset.compare;$('#cell').dataset.compare=comparisonFilter;$('#comparison-highlight').hidden=comparisonFilter==='all';$('#comparison-highlight').textContent=comparisonFilter==='shared'?'Highlighted: structures shared by both models.':'Highlighted: model-specific structures. See the comparison notes below.';document.querySelectorAll('[data-compare]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));renderComparison()});
$('#comparison-cards').onclick=e=>{
 const b=e.target.closest('[data-compare-id]');if(!b)return;setView('atlas');if(b.dataset.model==='shared'&&!specimenCatalog[type].ids.includes(b.dataset.compareId))chooseSpecimen('animal');
 if(quiz)stopQuiz();
 if(b.dataset.model!=='shared'){type=b.dataset.model;document.querySelectorAll('[data-type]').forEach(t=>{t.classList.toggle('active',t.dataset.type===type);t.setAttribute('aria-pressed',String(t.dataset.type===type))})}
 selected=b.dataset.compareId;resetZoom();render();$('#cell-details').scrollTop=0;$('#cell-details').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});$('#detail-title').setAttribute('tabindex','-1');$('#detail-title').focus({preventScroll:true});
};
renderComparison();
render();
