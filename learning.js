// Learning activities are kept separate from the cell illustration and its content.
const anatomy = {
  peroxisome: [
    ['Membrane', 'A single membrane separates oxidative reactions from the cytosol.'],
    ['Oxidative enzymes', 'Enzymes participate in reactions such as fatty acid breakdown.'],
    ['Catalase', 'Catalase converts hydrogen peroxide into water and oxygen.']
  ],
  centrosome: [
    ['Centriole pair', 'Two centrioles lie approximately at right angles in this animal-cell model.'],
    ['Microtubules', 'Each centriole has nine triplets of microtubules arranged around its circumference.'],
    ['Surrounding matrix', 'Pericentriolar material helps nucleate and anchor microtubules.']
  ],
  cytoskeleton: [
    ['Microtubules', 'Hollow tubulin polymers provide transport tracks and help organize the cell.'],
    ['Actin filaments', 'Thin filaments support cell shape and contribute to movement.'],
    ['Intermediate filaments', 'These fibers provide mechanical support in many animal cells; plants use a different supporting toolkit.']
  ],
  vesicle: [
    ['Lipid membrane', 'A lipid bilayer encloses the carrier.'],
    ['Cargo', 'Proteins, lipids, and other materials move toward specific destinations.'],
    ['Fusion machinery', 'Membrane proteins help carriers recognize and fuse with appropriate membranes.']
  ],
  nucleus: [
    ['Nuclear envelope', 'Two membranes separate the nucleus from the cytoplasm.'],
    ['Nuclear pores', 'Protein complexes in the envelope regulate traffic, including RNA export and protein import.'],
    ['DNA / chromatin', 'DNA associates with proteins as chromatin. Genes provide instructions for making RNA and proteins.']
  ],
  nucleolus: [
    ['Ribosomal RNA', 'Ribosomal RNA is transcribed and processed here.'],
    ['Ribosomal subunits', 'RNA and imported proteins assemble into small and large subunits.'],
    ['No surrounding membrane', 'The nucleolus is a dense nuclear region, not a membrane-bound compartment.']
  ],
  mitochondrion: [
    ['Outer membrane', 'The outer boundary surrounds the mitochondrion.'],
    ['Cristae / inner membrane', 'Folds of the inner membrane support the electron transport chain and ATP synthase.'],
    ['Matrix', 'The interior contains enzymes for the citric acid cycle, along with mitochondrial DNA and ribosomes.']
  ],
  'rough-er': [
    ['Bound ribosomes', 'Ribosomes on the cytosolic surface synthesize proteins entering the secretory pathway.'],
    ['ER lumen', 'Inside the ER, new proteins fold and begin processing.'],
    ['Membrane sheets', 'Connected sacs provide a separate space for protein processing.']
  ],
  'smooth-er': [
    ['Membrane tubules', 'A branching network provides surfaces for lipid synthesis.'],
    ['ER lumen', 'An internal space helps store calcium in specialized cells.'],
    ['No bound ribosomes', 'This region lacks the ribosomes that give rough ER its studded appearance.']
  ],
  golgi: [
    ['Cis face', 'The receiving side accepts material arriving from the ER.'],
    ['Cisternae', 'Stacked flattened sacs support further processing.'],
    ['Trans face', 'The shipping side sorts cargo into vesicles for different destinations.']
  ],
  ribosomes: [
    ['Large subunit', 'Catalyzes the formation of peptide bonds between amino acids.'],
    ['Small subunit', 'Helps read the codons in messenger RNA.'],
    ['mRNA', 'A messenger RNA template specifies the order of amino acids.']
  ],
  membrane: [
    ['Phospholipid heads', 'Water-attracting heads face the fluids on either side.'],
    ['Fatty acid tails', 'Water-avoiding tails face inward, forming a barrier to many substances.'],
    ['Membrane protein', 'Transport proteins help specific substances cross the membrane.']
  ],
  cytosol: [
    ['Water and ions', 'The aqueous environment contains dissolved salts and other small molecules.'],
    ['Enzymes', 'Proteins catalyze reactions, such as the steps of glycolysis.'],
    ['Dissolved metabolites', 'Small molecules participate in the cell’s chemical reactions.']
  ],
  lysosome: [
    ['Single membrane', 'A membrane encloses the digestive compartment.'],
    ['Digestive enzymes', 'Enzymes break down large biological molecules.'],
    ['Acidic interior', 'An acidic environment supports lysosomal enzyme activity.']
  ],
  chloroplast: [
    ['Envelope', 'Two membranes enclose the chloroplast.'],
    ['Grana / thylakoids', 'Stacks of membrane discs contain the machinery for light-dependent reactions.'],
    ['Stroma', 'The fluid around thylakoids contains enzymes that build sugars using carbon fixation.']
  ],
  vacuole: [
    ['Tonoplast', 'The vacuole’s membrane controls exchange with the cytosol.'],
    ['Cell sap', 'Water and dissolved substances fill the central vacuole.'],
    ['Turgor pressure', 'Water in the vacuole helps press cell contents against the supportive wall.']
  ],
  wall: [
    ['Cellulose fibers', 'Strong cellulose microfibrils reinforce the plant cell wall.'],
    ['Wall matrix', 'Other polysaccharides surround and connect the cellulose framework.'],
    ['Plasmodesmata', 'Channels connect the cytoplasm of neighboring plant cells through their walls.']
  ]
};
// Original study notes: architecture, location, recognition, and functional connections.
const structureProfiles = {
  nucleus: ['Double membrane', 'Within the cytoplasm', 'Look for pores in the cut envelope and fine chromatin threads inside.', 'Messenger RNA carries genetic instructions from the nucleus to ribosomes. Nuclear pores regulate this exchange.'],
  nucleolus: ['No surrounding membrane', 'Inside the nucleus', 'The dense, darker body sits among the chromatin.', 'Ribosomal RNA and ribosomal proteins assemble here into subunits that leave through nuclear pores.'],
  mitochondrion: ['Double membrane', 'Distributed in the cytoplasm', 'The open interior reveals cristae: folds of the inner membrane.', 'The inner membrane maintains a proton gradient that powers ATP synthase. ATP supports transport, synthesis, and movement.'],
  chloroplast: ['Double envelope + thylakoids', 'Photosynthetic plant cells', 'Find the stacks of green thylakoid discs, connected by lamellae.', 'Light reactions occur in thylakoid membranes; carbon fixation occurs in the surrounding stroma. Plant mitochondria still carry out respiration.'],
  'rough-er': ['Connected membrane sacs', 'Around the nuclear envelope', 'Small attached ribosomes distinguish rough ER from smooth ER.', 'Proteins enter the ER while being translated, then fold and travel in vesicles toward the Golgi.'],
  'smooth-er': ['Connected membrane tubules', 'Cytoplasm; continuous with rough ER', 'Follow branching tubes without the ribosome-studded surface.', 'Different cells use smooth ER for lipid synthesis, detoxification, or calcium handling. Its specialization reflects the cell’s job.'],
  golgi: ['Single-membrane cisternae', 'Cytoplasm, linked by vesicle traffic', 'Flattened curved sacs form a stack, with small carriers nearby.', 'The cis side receives cargo from the ER. The trans side sorts it toward membranes, digestive compartments, or secretion.'],
  ribosomes: ['RNA–protein complexes', 'Free in cytosol or bound to ER', 'Ribosomes are enlarged dots in this model; bound ones sit on the cytosolic face of ER.', 'Free and bound ribosomes share the same basic machinery. Signals in a growing protein determine where its ribosome works.'],
  membrane: ['Phospholipid bilayer', 'The cell’s outer boundary', 'In plant cells, the membrane lies just inside the thicker cell wall.', 'Transport proteins, receptors, and membrane lipids help the cell exchange material and respond to its surroundings.'],
  cytosol: ['Aqueous fluid; no membrane', 'Around cellular structures', 'The spaces around organelles are part of the cytosol, not empty gaps.', 'Many metabolic reactions occur here. Cytoplasm includes cytosol and the structures outside the nucleus suspended within it.'],
  lysosome: ['Single membrane', 'Cytoplasm of many animal cells', 'Small rounded compartments are shown separately from transport vesicles.', 'Acidic conditions support digestive enzymes. Lysosomes receive material from endocytosis and from recycling worn cellular components.'],
  peroxisome: ['Single membrane', 'Cytoplasm', 'Find a small compartment distinct from mitochondria and lysosomes.', 'Oxidation reactions can make hydrogen peroxide; catalase helps break it down. Peroxisomes also participate in lipid metabolism.'],
  vesicle: ['Single membrane', 'Between membrane compartments', 'Small round carriers cluster near the ER, Golgi, and cell surface.', 'Membrane recognition and fusion deliver cargo to the correct destination while keeping it separated from the cytosol.'],
  vacuole: ['Single membrane: tonoplast', 'Much of a mature plant cell’s interior', 'The large pale-blue compartment pushes much of the cytoplasm toward the edge.', 'Water movement across the tonoplast helps establish turgor pressure. The surrounding cell wall limits expansion.'],
  wall: ['Cellulose-rich extracellular layer', 'Outside the plant plasma membrane', 'The thick green cut edge shows the supportive wall around the specimen.', 'Cellulose microfibrils and a matrix of other polysaccharides give support. Plasmodesmata connect neighboring cells through the wall.'],
  cytoskeleton: ['Protein filament network', 'Throughout the cytoplasm', 'Fine fibers extend between the cell boundary and internal structures.', 'Actin and microtubules support shape and movement. Motor proteins use filaments as tracks; animal cells also have intermediate filaments.'],
  centrosome: ['Centrioles + surrounding matrix', 'Near the nucleus in many animal cells', 'Two short cylinders lie approximately at right angles.', 'The surrounding matrix organizes microtubules. A centriole contains nine microtubule triplets; flowering plants organize microtubules without these paired centrioles.'],
  soma: ['Cell body', 'Between dendrites and axon', 'The enlarged body contains the nucleus and much of the synthetic machinery.', 'The soma maintains the neuron. Signals from many inputs influence whether an action potential begins near the start of the axon.'],
  dendrites: ['Branched membrane extensions', 'Extending from the soma', 'Follow the short branches spreading away from the cell body.', 'Many synapses deliver inputs onto dendrites. Branching and, in many neurons, dendritic spines provide space for synaptic contacts.'],
  axon: ['Long membrane extension', 'From soma toward target cells', 'A single long fiber connects the soma to the terminal branches.', 'Action potentials propagate along the axonal membrane. The length is compressed here so both ends fit in one teaching view.'],
  myelin: ['Many layers of glial membrane', 'Around portions of the axon', 'Insulating segments are separated by nodes of Ranvier.', 'Glial cells form myelin. Current spreads beneath it while action potentials are regenerated at nodes, accelerating conduction.'],
  terminals: ['Specialized axon endings', 'At the far end of the axon', 'Small rounded endings finish the terminal branches.', 'At chemical synapses, calcium entry triggers vesicle fusion and neurotransmitter release toward a target cell.'],
  microvilli: ['Actin-supported projections', 'Apical surface of absorptive cells', 'The brush border consists of many short projections.', 'Microvilli enlarge absorptive surface area. Their actin core links to the cell’s internal cytoskeleton; they are not motile cilia.'],
  junctions: ['Membrane-associated complexes', 'Where neighboring cells meet', 'Small lateral complexes indicate contact with neighboring cells.', 'Tight junctions limit passage between cells; anchoring junctions resist mechanical stress. Gap junctions permit selected small molecules and ions to pass.'],
  basement: ['Specialized extracellular matrix', 'Beneath the epithelial basal surface', 'The layered platform is outside the cell, below its basal membrane.', 'Laminins, collagen IV, and other matrix molecules support adhesion and tissue organization. Basement membrane is not an organelle.'],
  nucleoid: ['DNA region; no nuclear envelope', 'Bacterial cytoplasm', 'The coiled chromosome is exposed directly to the cytoplasm.', 'DNA-binding proteins help organize the chromosome. Without a nuclear envelope, transcription and translation can be closely coupled.'],
  plasmid: ['Accessory DNA molecule', 'Bacterial cytoplasm', 'Small DNA loops are separate from the large nucleoid.', 'Plasmids replicate independently of the main chromosome. Some carry genes that affect survival and some can transfer between cells.'],
  'bacterial-ribosomes': ['70S RNA–protein complexes', 'Bacterial cytoplasm', 'The many small dots surround the chromosome.', 'These ribosomes translate messenger RNA. Their differences from eukaryotic cytosolic ribosomes make them targets of some antibiotics.'],
  'bacterial-wall': ['Peptidoglycan-containing layer', 'Outside the bacterial plasma membrane', 'Look at the distinct cut layers around the cell.', 'Peptidoglycan helps resist osmotic stress. Bacterial envelopes vary: this is a generalized model, not a complete Gram-positive or Gram-negative reconstruction.'],
  capsule: ['Organized outer coating', 'Beyond the bacterial cell wall', 'The outermost pale coating surrounds the envelope.', 'Capsules can aid attachment and protection. Many bacteria lack them, and capsule chemistry varies among species.'],
  pili: ['Protein appendages', 'Bacterial outer surface', 'Short surface projections differ from the long flagellar filaments.', 'Some appendages aid attachment, while specialized pili can participate in DNA transfer. Their form and function vary.'],
  flagellum: ['Filament, hook, and rotary motor', 'Anchored in the bacterial envelope', 'Long wavy filaments extend away from one end.', 'A motor drives rotation for locomotion. Bacterial flagella are distinct from the microtubule-based flagella of eukaryotes.'],
  myofibril: ['Bundles of contractile filaments', 'Along the muscle fiber', 'Parallel cylinders show repeating light and dark bands.', 'Each myofibril contains repeated sarcomeres. Aligned actin and myosin generate force across the length of the fiber.'],
  sarcomere: ['Z disc to Z disc', 'Repeating units in a myofibril', 'Repeating bands mark the organization of contractile proteins.', 'During contraction, thin and thick filaments slide past each other. Their overlap changes; the filaments do not themselves shorten.'],
  'sarcoplasmic-reticulum': ['Specialized smooth ER', 'Around skeletal-muscle myofibrils', 'A fine membrane network surrounds the contractile bundles.', 'Calcium release enables contraction. Pumps return calcium to the SR so the fiber can relax; T tubules coordinate the signal inward.'],
  't-tubule': ['Plasma-membrane invagination', 'Extending into the muscle fiber', 'Transverse tubes run inward between contractile regions.', 'Electrical excitation travels into the fiber and triggers calcium release from nearby sarcoplasmic reticulum. The lumen is continuous with the extracellular space.']
};

function renderStructureProfile(s) {
  const profile = structureProfiles[s.id];
  const panel = document.querySelector('#structure-profile');
  panel.hidden = !profile;
  if (!profile) return;
  const [architecture, location, recognize, connection] = profile;
  document.querySelector('#profile-architecture').textContent = architecture;
  document.querySelector('#profile-location').textContent = location;
  document.querySelector('#profile-recognize').textContent = recognize;
  document.querySelector('#profile-connection').textContent = connection;
  document.querySelector('#profile-connections').open = false;
  document.querySelector('#detail-focus').hidden = artworkMode !== '3d';
}
const diagramAnatomyIds = new Set(Object.keys(anatomy));
for (const [id, name, category, kicker, description, fn, fact] of specializedStructures) {
  anatomy[id] = [
    ['Structure', description],
    ['Function', fn],
    ['Field note', fact]
  ];
}
const structureHints = {
  peroxisome: 'Look for small green spheres that contain enzymes for oxidative chemistry.',
  centrosome: 'Look for a pair of short striped cylinders near the animal cell’s nucleus.',
  cytoskeleton: 'Follow the fine protein fibers extending through the cell.',
  vesicle: 'Look for small membrane-enclosed carriers near the Golgi and cell surface.',
  nucleus: 'Look for a large compartment surrounded by an envelope. It contains the cell’s chromatin.',
  nucleolus: 'Look inside the nucleus for a dense region without its own membrane.',
  mitochondrion: 'Look for an oval with a folded inner membrane. It is found in both models.',
  'rough-er': 'Look for membrane sheets near the nucleus, studded with ribosomes.',
  'smooth-er': 'Look for branching membrane tubules without attached ribosomes.',
  golgi: 'Look for a stack of curved, flattened sacs and nearby small vesicles.',
  ribosomes: 'These tiny dots are found freely in the cytosol and on the rough ER.',
  membrane: 'Find the thin boundary around the cell; in the plant it lies just inside the wall.',
  cytosol: 'Think of the fluid surrounding organelles rather than a membrane-enclosed compartment.',
  lysosome: 'Look for a small, round digestive compartment in the animal model.',
  chloroplast: 'Look for green ovals with stacks of internal discs in the plant model.',
  vacuole: 'Look for the large, water-filled compartment occupying much of the plant model.',
  wall: 'Find the supportive outer layer beyond the membrane in the plant model.'
};
for (const [id, name, category, kicker, description] of specializedStructures) {
  structureHints[id] = description;
}
const mark = (x, y, n) => `<g class="anatomy-marker" data-marker="${n}"><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y+5}" text-anchor="middle">${n+1}</text></g>`;

function anatomyArt(id) {
  let art = '',
    points = [];
  if (id === 'cytoskeleton') {
    art = '<g fill="none" stroke-linecap="round"><path d="M50 45Q190 140 330 155M50 60Q190 155 330 170" stroke="#b99e7c" stroke-width="8"/><path d="M70 160Q200 70 330 55" stroke="#bc7a99" stroke-width="4"/><path d="M80 90Q210 175 310 90" stroke="#a894be" stroke-width="5" stroke-dasharray="6 4"/></g>';
    points = [
      [122, 98],
      [241, 81],
      [275, 118]
    ];
  } else if (id === 'centrosome') {
    art = '<g transform="translate(105 80) rotate(15)"><rect width="140" height="42" rx="13" fill="#bcad87" stroke="#8b7e5d" stroke-width="3"/>' + Array.from({
      length: 12
    }, (_, i) => `<path d="M${10+i*10} 3v36" stroke="#897d5c" stroke-width="3"/>`).join('') + '</g><g transform="translate(230 103) rotate(78)"><rect width="80" height="35" rx="12" fill="#c7b993" stroke="#8b7e5d" stroke-width="3"/></g>';
    points = [
      [129, 101],
      [183, 111],
      [270, 73]
    ];
  } else if (id === 'nucleus') {
    art = '<ellipse cx="190" cy="107" rx="142" ry="85" fill="#bc99cd" stroke="#806091" stroke-width="9"/><ellipse cx="190" cy="107" rx="131" ry="74" fill="none" stroke="#e2cfe9" stroke-width="3"/><circle cx="236" cy="124" r="27" fill="#805295"/><path d="M98 77q23-32 45 0t45 0t45 0 M98 118q23-32 45 0t45 0 M100 77v41m22-43v36m22-34v43m21-42v36m23-34v31" stroke="#9260a3" stroke-width="3" fill="none"/><ellipse cx="322" cy="78" rx="11" ry="7" fill="#6c497e" transform="rotate(35 322 78)"/>';
    points = [
      [80, 55],
      [322, 78],
      [151, 100]
    ];
  } else if (id === 'mitochondrion') {
    art = '<ellipse cx="190" cy="107" rx="151" ry="76" fill="#e6be94" stroke="#a67352" stroke-width="5"/><path d="M62 108Q74 45 102 63 L108 131 Q118 151 132 130 L139 66 Q150 47 162 68 L169 142 Q183 161 193 139 L201 67 Q215 48 226 72 L234 139 Q248 156 257 132 L265 77 Q277 62 287 86 L295 127 Q310 142 319 108" stroke="#a87555" stroke-width="6" fill="none"/>';
    points = [
      [68, 64],
      [167, 142],
      [211, 105]
    ];
  } else if (id === 'chloroplast') {
    art = '<ellipse cx="190" cy="107" rx="148" ry="77" fill="#b9ce8c" stroke="#698b4e" stroke-width="6"/><ellipse cx="190" cy="107" rx="137" ry="66" fill="none" stroke="#e7edc6" stroke-width="3"/>';
    for (let x of [105, 180, 255])
      for (let y of [81, 94, 107, 120]) art += `<ellipse cx="${x}" cy="${y}" rx="23" ry="6" fill="#719955" stroke="#4d793f" stroke-width="2"/>`;
    art += '<path d="M125 110H158 M202 110H233" stroke="#6e9252" stroke-width="4"/>';
    points = [
      [65, 70],
      [180, 93],
      [253, 151]
    ];
  } else if (id === 'membrane') {
    art = '<rect x="32" y="67" width="316" height="82" rx="8" fill="#dce3bc"/>';
    for (let x = 45; x < 345; x += 22) art += `<path d="M${x-4} 75v30m8-30v30m-8 33v-25m8 25v-25" stroke="#92a568" stroke-width="3"/><circle cx="${x}" cy="69" r="8" fill="#6d956e"/><circle cx="${x}" cy="146" r="8" fill="#6d956e"/>`;
    art += '<rect x="232" y="48" width="40" height="118" rx="18" fill="#a98d69"/><path d="M251 65v83" stroke="#f1ead7" stroke-width="8"/>';
    points = [
      [88, 66],
      [134, 109],
      [251, 105]
    ];
  } else if (id === 'ribosomes') {
    art = '<path d="M89 108Q81 35 189 35Q298 34 288 108Z" fill="#a7b491" stroke="#748965" stroke-width="3"/><path d="M98 132Q189 183 280 132L274 118H105Z" fill="#c6d0ad" stroke="#748965" stroke-width="3"/><path d="M41 113H337" stroke="#a77e52" stroke-width="6"/><path d="M182 39l10-14 12 5 11-14 11 6" stroke="#ca9860" stroke-width="5" fill="none"/>';
    points = [
      [191, 73],
      [188, 142],
      [65, 113]
    ];
  } else if (id === 'golgi') {
    for (let i = 0; i < 5; i++) art += `<path d="M${83+i*12} ${48+i*26}q${110-i*7} 44 ${215-i*20} 0" fill="none" stroke="${['#aaa16a','#b7ad78','#c3b985','#cbbf8b','#d1c696'][i]}" stroke-width="17" stroke-linecap="round"/>`;
    art += '<circle cx="304" cy="161" r="14" fill="#cabf89"/>';
    points = [
      [88, 42],
      [190, 102],
      [280, 166]
    ];
  } else if (id === 'rough-er' || id === 'smooth-er') {
    art = '<g stroke="#78937c" stroke-width="5" fill="#c1d0ae"><path d="M54 62Q111 25 176 61T325 62L325 94Q250 133 176 96T54 94Z"/><path d="M54 132Q111 95 176 131T325 132L325 164Q250 203 176 166T54 164Z"/></g>';
    if (id === 'rough-er')
      for (let i = 0; i < 12; i++) art += `<circle cx="${65+i*23}" cy="${i%2?60:47}" r="5" fill="#4e6e56"/>`;
    points = id === 'rough-er' ? [
      [110, 60],
      [240, 83],
      [131, 144]
    ] : [
      [78, 63],
      [240, 83],
      [148, 115]
    ];
  } else if (id === 'wall') {
    art = '<rect x="45" y="35" width="290" height="144" rx="12" fill="#d7dfb6" stroke="#8ca46b" stroke-width="3"/>';
    for (let i = 0; i < 6; i++) art += `<path d="M50 ${48+i*22}l280 18M${80+i*40} 38l-20 134" stroke="#92a56c" stroke-width="5"/>`;
    art += '<path d="M190 35V179" stroke="#4c7a68" stroke-width="17"/><path d="M190 35V179" stroke="#c5ded1" stroke-width="7"/>';
    points = [
      [107, 76],
      [269, 113],
      [190, 112]
    ];
  } else {
    const color = id === 'lysosome' ? '#d7c98c' : id === 'nucleolus' ? '#bc9b85' : id === 'cytosol' ? '#e0e8c8' : id === 'peroxisome' ? '#b4cda5' : id === 'vesicle' ? '#e5d6b3' : '#bcd9d1';
    art = `<ellipse cx="190" cy="107" rx="142" ry="78" fill="${color}" stroke="#8da584" stroke-width="${id==='nucleolus'||id==='cytosol'?0:5}"/>`;
    if (id === 'cytosol') art += '<path d="M108 79q20-22 35 0t30 0M210 119q20-22 35 0t30 0" stroke="#89a06e" stroke-width="8" fill="none"/>';
    if (id === 'nucleolus' || id === 'lysosome')
      for (let i = 0; i < 18; i++) art += `<circle cx="${92+(i*37)%190}" cy="${65+(i*23)%86}" r="${i%2?5:8}" fill="${id==='lysosome'?'#a29455':'#977561'}"/>`;
    if (id === 'peroxisome' || id === 'vesicle') {
      for (let i = 0; i < 16; i++) art += `<circle cx="${110+(i*37)%160}" cy="${69+(i*23)%75}" r="${i%3+2}" fill="${id==='peroxisome'?'#7d9d70':'#bf9c66'}" opacity=".6"/>`;
    }
    points = ['vacuole', 'peroxisome', 'lysosome', 'vesicle'].includes(id) ? [
      [63, 75],
      [190, 106],
      [306, 130]
    ] : [
      [100, 70],
      [218, 117],
      [291, 82]
    ];
  }
  return `<svg viewBox="0 0 380 210" role="img" aria-label="Close-up of ${structures.find(s=>s.id===id).name}. Use the numbered controls to explore its features.">${art}${points.map(([x,y],n)=>mark(x,y,n)).join('')}</svg>`;
}

function renderCloseup(s) {
  const photo = specimenDetailImage(s.id);
  const sketch = diagramAnatomyIds.has(s.id) ? anatomyArt(s.id) : '';
  $('#closeup-art').innerHTML = photo + (sketch ? `<details class="anatomy-schematic"><summary>Annotated anatomy</summary>${sketch}</details>` : '');
  if (!photo && !sketch) $('#closeup-art').innerHTML = `<img class="organelle-render" src="assets/specimens/${type}.webp" decoding="async" alt="${specimenCatalog[type].name} teaching illustration">`;
  $('#closeup-count').textContent = diagramAnatomyIds.has(s.id) ? '3 FEATURES' : '3 STUDY NOTES';
  $('#closeup-parts').innerHTML = anatomy[s.id].map(([label], i) => `<button data-part="${i}" aria-pressed="${i===0}"><b>${i+1}</b> ${label}</button>`).join('');
  const showPart = i => {
    $('#closeup-note').textContent = anatomy[s.id][i][1];
    document.querySelectorAll('[data-part]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.part) === i)));
    document.querySelectorAll('[data-marker]').forEach(m => m.classList.toggle('active', Number(m.dataset.marker) === i));
  };
  $('#closeup-parts').onclick = e => {
    const b = e.target.closest('[data-part]');
    if (b) showPart(Number(b.dataset.part))
  };
  showPart(0);
}

let zoom = 1;

function setZoom(value) {
  const live3d = artworkMode === '3d';
  zoom = Math.max(live3d ? 0.4 : 1, Math.min(live3d ? 4 : 3, value));
  if (live3d) {
    window.Cell3D?.zoomTo(zoom)
  } else {
    const frame = $('#cell-viewport');
    const base = Math.min(frame.clientWidth, Math.max(230, frame.clientHeight) * 820 / 570);
    $('#cell').style.width = `${base*zoom}px`;
  }
  $('#zoom-level').textContent = `${Math.round(zoom*100)}%`;
  $('#zoom-out').disabled = zoom <= (live3d ? 0.401 : 1);
  $('#zoom-in').disabled = zoom >= (live3d ? 3.99 : 3);
}

function resetZoom() {
  if (artworkMode === '3d') {
    window.Cell3D?.reset();
    setZoom(1)
  } else {
    setZoom(1);
    $('#cell-viewport').scrollTo(0, 0)
  }
}
$('#zoom-in').onclick = () => setZoom(zoom + .5);
$('#zoom-out').onclick = () => setZoom(zoom - .5);
$('#zoom-reset').onclick = resetZoom;
window.addEventListener('resize', () => requestAnimationFrame(() => setZoom(zoom)));
// Native scrolling pans the enlarged SVG on phones, trackpads, and keyboards.
resetZoom();

const journey = [
  ['Ribosome', 'Read the instructions', 'Translation begins on a ribosome in the cytosol. An mRNA supplies the amino-acid sequence; a signal in this growing secreted protein directs the ribosome to the rough ER.', 105, 190, 'Cytosol → rough ER', 'An amino-acid chain is being built', 'A signal sequence is an address label, not a separate delivery vesicle.'],
  ['Rough ER', 'Fold into a working shape', 'As translation continues, the chain enters the ER lumen. Folding, quality control, and some chemical modifications prepare it for transport. Misfolded proteins are not simply sent onward.', 275, 202, 'Inside the ER lumen', 'Folded protein; early processing', 'The ribosome stays on the cytosolic face. The growing protein passes through a channel in the ER membrane.'],
  ['Transport vesicle', 'Travel inside a carrier', 'A vesicle buds from the ER with the protein enclosed in its lumen. Targeting and fusion machinery guide delivery to the receiving, or cis, side of the Golgi.', 408, 210, 'Vesicle lumen', 'Enclosed cargo', 'The protein stays separated from the cytosol while its carrier travels between compartments.'],
  ['Golgi', 'Modify, sort, and address', 'The protein moves through the Golgi’s compartments, where further processing can alter attached carbohydrate groups. The trans side sorts cargo toward its destination.', 562, 193, 'Golgi compartments: cis → trans', 'Processed and sorted protein', 'The Golgi sorts cargo; it does not read mRNA or build the original amino-acid chain.'],
  ['Secretory vesicle', 'Carry it to the surface', 'A carrier leaves the Golgi and brings this soluble secreted protein toward the plasma membrane. Some cargo is released continuously; other cargo waits for a signal.', 723, 202, 'Secretory vesicle lumen', 'Ready for secretion', 'A secretory vesicle carries both a membrane and cargo inside it. These have different destinations during fusion.'],
  ['Cell membrane', 'Deliver beyond the cell', 'The vesicle fuses with the plasma membrane. Its membrane joins the cell surface, while the soluble protein is released outside by exocytosis.', 880, 190, 'Outside the cell', 'Released protein', 'Membrane proteins can remain in a membrane. This particular journey follows a soluble protein destined for secretion.']
];
const journeyChecks = [
  ['What does the ribosome read?', ['Messenger RNA', 'A transport vesicle', 'A Golgi stack'], 0, 'The mRNA sequence guides the order of amino acids in the new protein.'],
  ['Which side of rough ER holds the ribosome?', ['Inside the ER lumen', 'The cytosolic surface', 'Inside the nucleus'], 1, 'The ribosome is on the cytosolic face; the growing chain passes into the ER lumen.'],
  ['Where is this protein during transport?', ['Loose in the cytosol', 'Inside the vesicle', 'Inside a ribosome'], 1, 'The carrier’s lumen keeps the cargo separated from the cytosol.'],
  ['What is a key Golgi task?', ['Copying DNA', 'Reading mRNA', 'Processing and sorting cargo'], 2, 'Golgi compartments process cargo and sort it toward different destinations.'],
  ['Where did this carrier come from?', ['The Golgi', 'A chloroplast', 'The nucleolus'], 0, 'This secretory carrier leaves the trans side of the Golgi.'],
  ['What happens to the vesicle membrane?', ['It becomes part of the cell membrane', 'It is released as the protein', 'It turns into mRNA'], 0, 'During fusion, the membranes join. The soluble cargo is released outside.']
];
let journeyStep = 0,
  playing = false,
  journeyFrame = null,
  journeyElapsed = 0,
  journeyLast = null,
  journeySpeed = 1;
const journeyDuration = 6500;
$('#journey-stages').innerHTML = journey.map(([name], i) => `<button data-stage="${i}" aria-pressed="${i===0}"><span>${String(i+1).padStart(2,'0')}</span>${name}</button>`).join('');
$('#journey-art').setAttribute('viewBox', '0 0 960 350');
$('#journey-art').setAttribute('aria-label', 'Secreted protein route: ribosome, rough ER, transport vesicle, Golgi, secretory vesicle, then exocytosis at the plasma membrane.');
$('#journey-art').innerHTML = `<defs><linearGradient id="er-shade" x2="0" y2="1"><stop stop-color="#d5dfea"/><stop offset="1" stop-color="#91aac1"/></linearGradient><linearGradient id="golgi-shade" x2="0" y2="1"><stop stop-color="#f0c3ab"/><stop offset="1" stop-color="#cb8d7c"/></linearGradient><marker id="journey-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8" fill="none" stroke="#a6ac94"/></marker></defs>
<text x="34" y="34" class="journey-zone">INSIDE THE CELL / CYTOSOL</text><text x="849" y="34" class="journey-zone">OUTSIDE</text>
<path d="M100 190C175 125 210 148 275 202S360 240 408 210S498 158 562 193S670 236 723 202S827 150 880 190" class="journey-route" marker-end="url(#journey-arrow)"/>
<g class="journey-station" data-journey-node="0"><circle class="station-halo" cx="105" cy="190" r="62"/><path d="M48 184Q43 117 105 120Q169 120 164 184Z" fill="#af9cc2" stroke="#857197" stroke-width="2"/><path d="M54 201Q106 250 156 201L151 191H61Z" fill="#cbbbd7" stroke="#857197" stroke-width="2"/><path d="M27 188H178" stroke="#819875" stroke-width="5"/><path d="M84 143L91 129L101 139L112 123" stroke="#d7ad5b" fill="none" stroke-width="5"/><text x="105" y="282">Ribosome</text><text x="105" y="303" class="journey-sub-label">Read mRNA</text></g>
<g class="journey-station" data-journey-node="1"><circle class="station-halo" cx="275" cy="190" r="70"/><g fill="url(#er-shade)" stroke="#7b96af" stroke-width="2"><path d="M211 123Q269 94 337 124L334 151Q278 126 212 155Z"/><path d="M211 169Q269 140 337 170L334 197Q278 172 212 201Z"/><path d="M211 215Q269 186 337 216L334 243Q278 218 212 247Z"/></g>${Array.from({length:9},(_,i)=>` < circle cx = "${220+i*13}"
cy = "${119+Math.sin(i*.6)*-12}"
r = "4"
fill = "#a08bae" / > < circle cx = "${220+i*13}"
cy = "${165+Math.sin(i*.6)*-12}"
r = "4"
fill = "#a08bae" / > `).join('')}<text x="275" y="282">Rough ER</text><text x="275" y="303" class="journey-sub-label">Fold & check</text></g>
<g class="journey-station" data-journey-node="2"><circle class="station-halo" cx="408" cy="210" r="54"/><circle cx="408" cy="210" r="32" fill="#e7ddbb" stroke="#b8a77a" stroke-width="4"/><circle cx="408" cy="210" r="25" fill="none" stroke="#f6efd8" stroke-width="2"/><text x="408" y="282">Transport vesicle</text><text x="408" y="303" class="journey-sub-label">ER → Golgi</text></g>
<g class="journey-station" data-journey-node="3"><circle class="station-halo" cx="562" cy="190" r="72"/>${Array.from({length:5},(_,i)=>` < path d = "M${505+i*4} ${126+i*24}Q563 ${153+i*24} ${620-i*4} ${126+i*24}"
fill = "none"
stroke = "url(#golgi-shade)"
stroke - width = "16"
stroke - linecap = "round" / > `).join('')}<text x="509" y="100" class="journey-sub-label">cis</text><text x="613" y="255" class="journey-sub-label">trans</text><text x="562" y="282">Golgi apparatus</text><text x="562" y="303" class="journey-sub-label">Modify & sort</text></g>
<g class="journey-station" data-journey-node="4"><circle class="station-halo" cx="723" cy="202" r="54"/><circle cx="723" cy="202" r="32" fill="#e7ddbb" stroke="#b8a77a" stroke-width="4"/><circle cx="723" cy="202" r="25" fill="none" stroke="#f6efd8" stroke-width="2"/><text x="723" y="282">Secretory vesicle</text><text x="723" y="303" class="journey-sub-label">To the surface</text></g>
<g class="journey-station" data-journey-node="5"><circle class="station-halo" cx="858" cy="190" r="58"/><path d="M818 64V150Q775 190 818 231V315M832 64V151Q790 190 832 230V315" fill="none" stroke="#9bad80" stroke-width="6"/>${Array.from({length:15},(_,i)=>` < circle cx = "818"
cy = "${67+i*17}"
r = "3.5"
fill = "#718b64" / > < circle cx = "832"
cy = "${67+i*17}"
r = "3.5"
fill = "#718b64" / > `).join('')}<path d="M846 192H916" stroke="#9bad80" stroke-width="2" marker-end="url(#journey-arrow)"/><text x="880" y="282">Exocytosis</text><text x="880" y="303" class="journey-sub-label">Release cargo</text></g>
<g id="protein-cargo" transform="translate(105 190)"><circle class="cargo-glow" r="18"/><path id="protein-shape" d="M-10 0Q-8-12 0-7T10 0T0 8T-10 0" fill="#d5a44b" stroke="#8d6625" stroke-width="2"/><circle cx="-3" cy="-1" r="2" fill="#fff1b5"/></g>`;
const journeyExtra = document.createElement('div');
journeyExtra.className = 'journey-study';
journeyExtra.innerHTML = `<div class="cargo-state"><p class="eyebrow">FOLLOW THE GOLD PROTEIN</p><dl><div><dt>Location</dt><dd id="journey-location"></dd></div><div><dt>Protein state</dt><dd id="journey-state"></dd></div></dl><p id="journey-insight"></p></div><div class="journey-check"><p class="eyebrow">PAUSE & THINK</p><h4 id="journey-check-question"></h4><div id="journey-check-options"></div><p id="journey-check-feedback" role="status"></p></div>`;
$('.journey-bottom').after(journeyExtra);
const speedLabel = document.createElement('label');
speedLabel.className = 'journey-speed';
speedLabel.innerHTML = 'Playback <select id="journey-speed" aria-label="Journey playback speed"><option value="1">1×</option><option value="2">2×</option></select>';
$('.journey-controls').append(speedLabel);
const progress = document.createElement('div');
progress.className = 'journey-progress';
progress.innerHTML = '<div id="journey-progress-fill"></div>';
$('.journey-viewport').before(progress);

function pauseJourney() {
  playing = false;
  cancelAnimationFrame(journeyFrame);
  journeyFrame = null;
  journeyLast = null;
  $('#journey-play').textContent = journeyStep === 5 && journeyElapsed >= journeyDuration ? 'Replay journey' : journeyElapsed > 0 ? 'Resume journey' : 'Play journey';
  $('#journey-play').setAttribute('aria-pressed', 'false')
}

function paintCargo() {
  const end = journey[journeyStep],
    start = journey[Math.max(0, journeyStep - 1)],
    reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  window.CellLab?.journey(journeyStep, playing ? Math.min(1, journeyElapsed / 1600) : 1);
  const t = reduced || !playing ? 1 : Math.min(1, journeyElapsed / 1600),
    ease = t * t * (3 - 2 * t);
  $('#protein-cargo').setAttribute('transform', `translate(${start[3]+(end[3]-start[3])*ease} ${start[4]+(end[4]-start[4])*ease})`);
  $('#journey-progress-fill').style.width = ((journeyStep + Math.min(1, journeyElapsed / journeyDuration)) / 6 * 100) + '%';
}

function showJourney() {
  const [name, title, description, x, y, location, state, insight] = journey[journeyStep];
  $('#journey-step-title').textContent = title;
  $('#journey-description').textContent = description;
  $('#journey-position').textContent = `STEP ${journeyStep+1} OF 6 · ${name.toUpperCase()}`;
  $('#journey-location').textContent = location;
  $('#journey-state').textContent = state;
  $('#journey-insight').textContent = insight;
  document.querySelectorAll('[data-stage]').forEach(b => {
    const active = Number(b.dataset.stage) === journeyStep;
    b.setAttribute('aria-pressed', String(active));
    b.classList.toggle('completed', Number(b.dataset.stage) < journeyStep)
  });
  document.querySelectorAll('[data-journey-node]').forEach(e => e.classList.toggle('active', Number(e.dataset.journeyNode) === journeyStep));
  $('#journey-prev').disabled = journeyStep === 0;
  $('#journey-next').disabled = journeyStep === 5;
  const [question, options, answer, explanation] = journeyChecks[journeyStep];
  $('#journey-check-question').textContent = question;
  $('#journey-check-feedback').textContent = '';
  $('#journey-check-options').replaceChildren();
  options.forEach((option, i) => {
    const button = document.createElement('button');
    button.textContent = option;
    button.onclick = () => {
      pauseJourney();
      if (i === answer) {
        $('#journey-check-feedback').textContent = 'That’s right. ' + explanation;
        window.CellLab?.completeStep(journeyStep);
        $('#journey-check-options').querySelectorAll('button').forEach(b => b.disabled = true)
      } else {
        button.disabled = true;
        $('#journey-check-feedback').textContent = 'Try another answer. Think about what this compartment does.'
      }
    };
    $('#journey-check-options').append(button)
  });
  paintCargo();
  panJourney();
}

function panJourney() {
  const frame = $('.journey-viewport'),
    x = journey[journeyStep][3];
  frame.scrollTo({
    left: x / 960 * $('#journey-art').getBoundingClientRect().width - frame.clientWidth / 2,
    behavior: 'instant'
  })
}
window.addEventListener('resize', () => {
  if (document.body.dataset.page === 'journey') requestAnimationFrame(panJourney)
});

function tickJourney(now) {
  if (!playing) return;
  if (journeyLast !== null) journeyElapsed += (now - journeyLast) * journeySpeed;
  journeyLast = now;
  if (journeyElapsed >= journeyDuration) {
    if (journeyStep === 5) {
      journeyElapsed = journeyDuration;
      paintCargo();
      pauseJourney();
      return
    }
    journeyStep++;
    journeyElapsed = 0;
    showJourney()
  }
  paintCargo();
  journeyFrame = requestAnimationFrame(tickJourney);
}
$('#journey-play').onclick = () => {
  if (playing) {
    pauseJourney();
    return
  }
  if (journeyStep === 5 && journeyElapsed >= journeyDuration) {
    journeyStep = 0;
    journeyElapsed = 0;
    showJourney()
  }
  playing = true;
  journeyLast = null;
  $('#journey-play').textContent = 'Pause journey';
  $('#journey-play').setAttribute('aria-pressed', 'true');
  journeyFrame = requestAnimationFrame(tickJourney);
};

function goToJourney(step) {
  pauseJourney();
  journeyStep = step;
  journeyElapsed = step === 5 ? journeyDuration : step === 0 ? 0 : 1600;
  showJourney()
}
$('#journey-prev').onclick = () => goToJourney(Math.max(0, journeyStep - 1));
$('#journey-next').onclick = () => goToJourney(Math.min(5, journeyStep + 1));
$('#journey-reset').onclick = () => goToJourney(0);
$('#journey-stages').onclick = e => {
  const b = e.target.closest('[data-stage]');
  if (b) goToJourney(Number(b.dataset.stage))
};
$('#journey-speed').onchange = e => {
  journeySpeed = Number(e.target.value)
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseJourney()
});
showJourney();

function setView(view) {
  document.body.dataset.page = view;
  window.Cell3D?.endLesson();
  history.replaceState(null, '', view === 'atlas' ? atlasHash() : view === 'journey' ? '#protein-journey' : view === 'lab' ? '#virtual-lab' : '#comparison');
  document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  pauseJourney();
  window.CellLab?.onView(view);
  if (view === 'journey') requestAnimationFrame(panJourney);
  window.dispatchEvent(new CustomEvent('cellscape-view', {
    detail: {
      view
    }
  }));
  if (view === 'atlas' && artworkMode === '3d') window.Cell3D?.show(type, selected, $('#labels').checked, quiz);
}
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => {
  setView(b.dataset.view);
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  })
});
const viewRoutes = {
  '#protein-journey': 'journey',
  '#virtual-lab': 'lab',
  '#comparison': 'compare'
};

// Opens #atlas/<cell>/<structure> links; unknown cells or structures fall back gracefully.
function applyAtlasLink(hash) {
  const [, kind, id] = /^#atlas\/([\w-]+)(?:\/([\w-]+))?\/?$/.exec(hash) || [];
  if (!kind || !specimenCatalog[kind]) return false;
  if (kind !== type) chooseSpecimen(kind);
  if (id && specimenCatalog[kind].ids.includes(id) && id !== selected) {
    selected = id;
    render();
  }
  return true;
}
applyAtlasLink(location.hash);
setView(viewRoutes[location.hash] || 'atlas');
// A link pasted into the same tab only changes the hash; in-page anchors such as the skip link
// are not routes and are ignored.
addEventListener('hashchange', () => {
  if (viewRoutes[location.hash]) setView(viewRoutes[location.hash]);
  else if (applyAtlasLink(location.hash) || location.hash === '#atlas') {
    if (quiz) stopQuiz();
    setView('atlas');
    $('#cell-details').scrollTop = 0;
  }
});
$('#share-structure').onclick = async () => {
  const url = location.href.split('#')[0] + atlasHash(),
    status = $('#share-status');
  try {
    await navigator.clipboard.writeText(url);
    status.textContent = 'Link copied';
  } catch {
    window.prompt('Copy this link:', url);
    status.textContent = '';
  }
  clearTimeout(status.timer);
  status.timer = setTimeout(() => status.textContent = '', 2500);
};
let comparisonFilter = 'all';

function renderComparison() {
  const shared = structures.filter(s => specimenCatalog.animal.ids.includes(s.id) && specimenCatalog.plant.ids.includes(s.id));
  const cards = [
    ['shared', 'Shared foundations', 'Both models', shared],
    ['animal', 'Animal specializations', 'Animal model', structures.filter(s => ['lysosome', 'centrosome'].includes(s.id))],
    ['plant', 'Plant specializations', 'Plant model', structures.filter(s => ['chloroplast', 'vacuole', 'wall'].includes(s.id))]
  ];
  $('#comparison-cards').innerHTML = cards.filter(([kind]) => comparisonFilter === 'all' || (comparisonFilter === 'shared' ? kind === 'shared' : kind !== 'shared')).map(([kind, title, label, items]) => `<article class="compare-card ${kind}"><p class="eyebrow">${label}</p><h3>${title}</h3><p>${kind==='shared'?'Both are eukaryotic cells, with a nucleus and many of the same working structures.':kind==='plant'?'A supportive wall, a large central vacuole, and chloroplasts in photosynthetic cells.':'This model includes lysosomes and a centrosome with centrioles. Plant lytic vacuoles perform similar digestive tasks; flowering plants organize microtubules without paired centrioles.'}</p><div>${items.map(s=>`<button data-compare-id="${s.id}" data-model="${kind}">${s.name} <span>↗</span></button>`).join('')}</div></article>`).join('');
}
document.querySelectorAll('[data-compare]').forEach(b => b.onclick = () => {
  comparisonFilter = b.dataset.compare;
  $('#cell').dataset.compare = comparisonFilter;
  $('#comparison-highlight').hidden = comparisonFilter === 'all';
  $('#comparison-highlight').textContent = comparisonFilter === 'shared' ? 'Highlighted: structures shared by both models.' : 'Highlighted: model-specific structures. See the comparison notes below.';
  document.querySelectorAll('[data-compare]').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
  renderComparison()
});
$('#comparison-cards').onclick = e => {
  const b = e.target.closest('[data-compare-id]');
  if (!b) return;
  setView('atlas');
  if (b.dataset.model === 'shared' && !specimenCatalog[type].ids.includes(b.dataset.compareId)) chooseSpecimen('animal');
  if (quiz) stopQuiz();
  if (b.dataset.model !== 'shared') {
    type = b.dataset.model;
    document.querySelectorAll('[data-type]').forEach(t => {
      t.classList.toggle('active', t.dataset.type === type);
      t.setAttribute('aria-pressed', String(t.dataset.type === type))
    })
  }
  selected = b.dataset.compareId;
  resetZoom();
  render();
  $('#cell-details').scrollTop = 0;
  $('#cell-details').scrollIntoView({
    block: 'start',
    behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'
  });
  $('#detail-title').setAttribute('tabindex', '-1');
  $('#detail-title').focus({
    preventScroll: true
  });
};
renderComparison();
render();

window.addEventListener('cell3d-feature', e => {
  const details = document.querySelector('.anatomy-schematic');
  if (details) details.open = true;
  document.querySelector(`[data-part="${e.detail.part}"]`)?.click();
  document.querySelector('#closeup').scrollIntoView({
    block: 'nearest'
  })
});
