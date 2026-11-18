// Original image assets generated from the visual brief in the supplied recording.
// Hotspots are coordinates in the atlas's 820 × 570 illustration space.
const specimenCatalog = {
  plant: {
    name: 'Plant cell',
    subtitle: 'Photosynthetic cell',
    classification: 'Eukaryote',
    default: 'nucleus',
    note: 'A mature photosynthetic cell. The central vacuole occupies much of its interior; organelles lie in the surrounding cytoplasm.',
    where: 'Photosynthetic tissues, such as the leaf mesophyll.',
    ids: ['nucleus', 'nucleolus', 'chloroplast', 'mitochondrion', 'rough-er', 'smooth-er', 'golgi', 'ribosomes', 'vacuole', 'membrane', 'wall', 'cytosol', 'peroxisome', 'cytoskeleton', 'vesicle'],
    spots: {
      nucleus: [212, 130, 70],
      nucleolus: [250, 140, 20],
      chloroplast: [507, 90, 58],
      mitochondrion: [657, 167, 40],
      'rough-er': [153, 207, 40],
      'smooth-er': [353, 87, 30],
      golgi: [123, 280, 45],
      ribosomes: [220, 213, 15],
      vacuole: [440, 247, 110],
      membrane: [507, 480, 16],
      wall: [467, 527, 35],
      cytosol: [700, 247, 16],
      cytoskeleton: [557, 445, 18],
      vesicle: [565, 421, 14]
    }
  },
  leukocyte: {
    name: 'White blood cell',
    subtitle: 'Neutrophil-like immune cell',
    classification: 'Eukaryote',
    default: 'nucleus',
    note: 'A neutrophil-like leukocyte with one connected, lobed nucleus and numerous cytoplasmic granules. White blood cells vary considerably between types.',
    where: 'Blood and tissues involved in immune defense.',
    ids: ['nucleus', 'mitochondrion', 'rough-er', 'golgi', 'ribosomes', 'lysosome', 'vesicle', 'membrane', 'cytosol'],
    spots: {
      nucleus: [400, 127, 62],
      mitochondrion: [603, 230, 22],
      'rough-er': [453, 360, 40],
      golgi: [547, 330, 35],
      ribosomes: [533, 143, 15],
      lysosome: [417, 320, 18],
      vesicle: [365, 420, 16],
      membrane: [657, 253, 22],
      cytosol: [353, 220, 18]
    }
  },
  neuron: {
    name: 'Neuron',
    subtitle: 'Myelinated nerve cell',
    classification: 'Eukaryote',
    default: 'soma',
    note: 'A simplified myelinated neuron. Its proportions are compressed to show dendrites, soma, axon, and terminals in one image.',
    where: 'The brain, spinal cord, and peripheral nervous system.',
    ids: ['soma', 'nucleus', 'dendrites', 'axon', 'myelin', 'terminals', 'mitochondrion', 'rough-er', 'membrane'],
    spots: {
      soma: [165, 305, 50],
      nucleus: [203, 257, 40],
      dendrites: [140, 87, 35],
      axon: [333, 290, 20],
      myelin: [460, 280, 35],
      terminals: [773, 313, 40],
      mitochondrion: [267, 223, 18],
      'rough-er': [227, 200, 20],
      membrane: [307, 247, 16]
    }
  },
  epithelial: {
    name: 'Epithelial cell',
    subtitle: 'Absorptive columnar cell',
    classification: 'Eukaryote',
    default: 'microvilli',
    note: 'A polarized columnar epithelial teaching model. The microvilli face the lumen; the basal surface rests on basement membrane.',
    where: 'Absorptive epithelia, including the lining of the small intestine.',
    ids: ['microvilli', 'nucleus', 'junctions', 'basement', 'mitochondrion', 'rough-er', 'golgi', 'membrane', 'cytoskeleton'],
    spots: {
      microvilli: [407, 67, 60],
      nucleus: [367, 440, 70],
      junctions: [547, 177, 18],
      basement: [393, 527, 25],
      mitochondrion: [453, 170, 25],
      'rough-er': [393, 313, 40],
      golgi: [387, 220, 40],
      membrane: [240, 293, 16],
      cytoskeleton: [280, 160, 18]
    }
  },
  bacteria: {
    name: 'Bacterial cell',
    subtitle: 'Rod-shaped prokaryote',
    classification: 'Prokaryote',
    default: 'nucleoid',
    note: 'A generalized rod-shaped bacterium. Its DNA is not enclosed in a nucleus; the envelope and appendages vary between bacterial species.',
    where: 'Diverse habitats, including soil, water, and the bodies of other organisms.',
    ids: ['nucleoid', 'plasmid', 'bacterial-ribosomes', 'membrane', 'bacterial-wall', 'capsule', 'pili', 'flagellum', 'cytosol'],
    spots: {
      nucleoid: [393, 253, 75],
      plasmid: [585, 259, 22],
      'bacterial-ribosomes': [313, 337, 18],
      membrane: [347, 379, 13],
      'bacterial-wall': [467, 363, 14],
      capsule: [467, 413, 20],
      pili: [180, 160, 22],
      flagellum: [747, 193, 30],
      cytosol: [200, 313, 16]
    }
  },
  animal: {
    name: 'Animal cell',
    subtitle: 'Generalized eukaryotic cell',
    classification: 'Eukaryote',
    default: 'nucleus',
    note: 'A generalized animal cell showing major membrane compartments, a centrosome, and cytoskeletal fibers. The structures are enlarged for study.',
    where: 'Animal tissues; organelle abundance varies with cell function.',
    ids: ['nucleus', 'nucleolus', 'mitochondrion', 'rough-er', 'smooth-er', 'golgi', 'ribosomes', 'membrane', 'cytosol', 'lysosome', 'peroxisome', 'centrosome', 'cytoskeleton', 'vesicle'],
    spots: {
      nucleus: [233, 153, 85],
      nucleolus: [287, 160, 30],
      mitochondrion: [193, 380, 52],
      'rough-er': [313, 280, 45],
      'smooth-er': [543, 177, 50],
      golgi: [493, 360, 75],
      ribosomes: [253, 307, 15],
      membrane: [787, 287, 20],
      cytosol: [740, 400, 18],
      lysosome: [80, 270, 25],
      centrosome: [427, 103, 30],
      cytoskeleton: [667, 427, 22],
      vesicle: [637, 297, 14]
    }
  },
  muscle: {
    name: 'Muscle fiber',
    subtitle: 'Skeletal muscle cell',
    classification: 'Eukaryote',
    default: 'myofibril',
    note: 'A short segment of a multinucleated skeletal muscle fiber. Parallel myofibrils contain repeating sarcomeres; nuclei lie toward the cell periphery.',
    where: 'Skeletal muscles attached to the skeleton.',
    ids: ['myofibril', 'sarcomere', 'sarcoplasmic-reticulum', 't-tubule', 'mitochondrion', 'nucleus', 'membrane'],
    spots: {
      myofibril: [110, 347, 45],
      sarcomere: [373, 247, 25],
      'sarcoplasmic-reticulum': [413, 140, 25],
      't-tubule': [453, 260, 25],
      mitochondrion: [360, 341, 28],
      nucleus: [180, 220, 35],
      membrane: [313, 143, 22]
    }
  }
};
// Short, project-worded facts with links to the relevant textbook section.
const cellFunFacts = {
  plant: {
    title: 'Water helps a plant stand tall',
    text: 'Water in a plant cell’s central vacuole pushes outward against the cell wall. When that pressure drops, the plant can wilt—even though its cell walls are still there.',
    source: 'https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells'
  },
  leukocyte: {
    title: 'A cell that can swallow invaders',
    text: 'Neutrophils, the white blood cells represented here, can surround and engulf microbes. This cellular “eating” process is called phagocytosis.',
    source: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/18-4-leukocytes-and-platelets'
  },
  neuron: {
    title: 'Its insulation comes from another cell',
    text: 'A neuron does not make its own myelin wrapping. Specialized glial cells wrap their membranes around its axon to help electrical signals travel faster.',
    source: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/12-2-nervous-tissue'
  },
  epithelial: {
    title: 'A tiny brush border makes more room',
    text: 'Absorptive epithelial cells have many short microvilli. These tiny surface projections provide extra area for taking up nutrients without making the whole cell much larger.',
    source: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/4-2-epithelial-tissue'
  },
  bacteria: {
    title: 'Division without a nucleus',
    text: 'Bacteria can reproduce by binary fission: they copy their DNA and divide into two cells. They do this without a nucleus or the mitotic machinery used by eukaryotic cells.',
    source: 'https://openstax.org/books/biology-2e/pages/10-5-prokaryotic-cell-division'
  },
  animal: {
    title: 'Not every animal cell keeps its nucleus',
    text: 'This model shows a generalized animal cell, but mature human red blood cells are an exception: they lose their nucleus as they develop, leaving more room for oxygen-carrying hemoglobin.',
    source: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/18-3-erythrocytes'
  },
  muscle: {
    title: 'One cell, many nuclei',
    text: 'A skeletal muscle fiber forms when many developing muscle cells fuse together. That is why a single mature fiber contains multiple nuclei near its outer edge.',
    source: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/10-2-skeletal-muscle'
  }
};
const specializedStructures = [
  ['soma', 'Cell body / soma', 'Integration', 'The neuron’s cell body', 'The soma contains the nucleus and much of a neuron’s machinery for metabolism and protein synthesis. It also integrates many incoming signals.', 'Maintains the neuron and integrates incoming signals.', 'A neuron’s cell body supports processes that may extend far from it.'],
  ['dendrites', 'Dendrites', 'Signal reception', 'Receiving information', 'Dendrites are branching extensions that receive many of the inputs arriving at a neuron. Their branching helps provide space for synaptic contacts.', 'Receives many incoming signals from other neurons.', 'Dendrites can have small spines that increase the surface available for synapses.'],
  ['axon', 'Axon', 'Signal conduction', 'Sending an electrical signal', 'An axon conducts action potentials away from the cell body toward other cells. The diagram compresses its length so the whole neuron fits on screen.', 'Conducts action potentials toward target cells.', 'An axon can extend much farther than the diameter of its cell body.'],
  ['myelin', 'Myelin sheath', 'Insulation', 'A segmented insulating layer', 'Myelin is formed by specialized glial cells that wrap their membranes around an axon. Gaps between segments are called nodes of Ranvier.', 'Insulates axons and supports rapid saltatory conduction.', 'Myelin is made by glial cells, not by the neuron wrapping itself.'],
  ['terminals', 'Axon terminals', 'Cell communication', 'The output connections', 'Axon terminals form communication sites with target cells. At many synapses, vesicles release neurotransmitter into the synaptic cleft.', 'Releases neurotransmitter at many chemical synapses.', 'Not all synapses are chemical; some transmit signals through electrical connections.'],
  ['microvilli', 'Microvilli', 'Absorption', 'Increasing surface area', 'Microvilli are short projections of the apical cell surface supported by actin filaments. They enlarge the area available for absorption.', 'Increases apical surface area for absorption.', 'Microvilli differ from motile cilia: their main role is surface-area expansion.'],
  ['junctions', 'Cell junctions', 'Tissue organization', 'Connecting neighboring cells', 'Different junction complexes seal spaces between cells, mechanically connect them, or allow direct communication. This image shows junctions schematically.', 'Connects neighboring cells and helps maintain epithelial organization.', 'Tight junctions help maintain distinct apical and basolateral membrane domains.'],
  ['basement', 'Basement membrane', 'Tissue support', 'A supporting extracellular layer', 'The basement membrane is a specialized extracellular matrix beneath an epithelium. It supports the tissue and helps anchor its basal surface.', 'Supports and anchors the basal surface of an epithelium.', 'The basement membrane lies outside the cell; it is not an organelle.'],
  ['nucleoid', 'Nucleoid', 'Genetic information', 'DNA without a nucleus', 'The nucleoid is the region containing the main bacterial chromosome. It has no surrounding nuclear envelope. The purple fibers are an enlarged illustration of DNA organization.', 'Contains the main bacterial chromosome without a nuclear envelope.', 'A bacterium does not need a membrane-bound nucleus to organize and use genetic information.'],
  ['plasmid', 'Plasmid', 'Accessory DNA', 'An additional DNA molecule', 'Plasmids are independently replicating DNA molecules, often circular, that are separate from the main bacterial chromosome. Their genes can provide useful traits.', 'Carries accessory genes on independently replicating DNA.', 'Some plasmids can move between bacterial cells.'],
  ['bacterial-ribosomes', 'Bacterial ribosomes', 'Protein synthesis', 'Building bacterial proteins', 'Bacterial ribosomes translate messenger RNA into protein. They are smaller than the cytosolic ribosomes of eukaryotic cells.', 'Translates bacterial messenger RNA into proteins.', 'Bacterial ribosomes are called 70S; this measurement describes sedimentation behavior.'],
  ['bacterial-wall', 'Bacterial cell wall', 'Structural support', 'Supporting a bacterial cell', 'Most bacteria have a cell wall containing peptidoglycan. The exact envelope structure differs among species; this is a generalized teaching model.', 'Provides structural support through a peptidoglycan-containing wall in most bacteria.', 'Bacterial cell walls differ chemically from the cellulose-rich walls of plants.'],
  ['capsule', 'Capsule', 'Protection', 'An outer coating', 'Some bacteria produce an organized outer capsule, often made of polysaccharides. It can help cells attach to surfaces and protect them from environmental stresses.', 'Forms an outer coating that can support protection and attachment.', 'Not all bacteria have capsules.'],
  ['pili', 'Pili / fimbriae', 'Attachment', 'Fine surface appendages', 'These short protein appendages can help bacterial cells attach to surfaces. Some specialized pili participate in DNA transfer between cells.', 'Supports surface attachment through short protein appendages.', 'The long propellers in this model are flagella; the shorter surface projections are pili.'],
  ['flagellum', 'Flagellum', 'Motility', 'A rotating propeller', 'Many motile bacteria use flagella driven by rotary motors in the cell envelope. Their arrangement and number differ among species.', 'Propels many bacteria using a rotating filament.', 'A bacterial flagellum is structurally different from the flagella of eukaryotic cells.'],
  ['myofibril', 'Myofibrils', 'Contraction', 'Parallel contractile bundles', 'Myofibrils are long contractile assemblies inside a muscle fiber. Repeated sarcomeres, built from organized actin and myosin filaments, create their banded appearance.', 'Produces contraction through organized arrays of actin and myosin.', 'One skeletal muscle fiber contains many parallel myofibrils.'],
  ['sarcomere', 'Sarcomere', 'Contractile unit', 'The repeating unit', 'A sarcomere extends from one Z disc to the next. During contraction, thin and thick filaments slide relative to each other, shortening the unit.', 'Shortens as actin and myosin filaments slide during contraction.', 'The filaments slide; they do not themselves become shorter.'],
  ['sarcoplasmic-reticulum', 'Sarcoplasmic reticulum', 'Calcium storage', 'Controlling contraction', 'This specialized smooth ER surrounds the contractile machinery. It releases calcium to initiate contraction and takes calcium back up as the fiber relaxes.', 'Stores and releases calcium to regulate muscle contraction.', 'Calcium links electrical activation to the contraction of skeletal muscle.'],
  ['t-tubule', 'T tubules', 'Electrical activation', 'Carrying the signal inward', 'Transverse tubules are invaginations of the muscle cell membrane. They help carry electrical excitation into the fiber’s interior.', 'Carries membrane excitation deep into a muscle fiber.', 'T tubules are continuous with the cell’s surface membrane.']
];

function renderSpecimenNavigation(current) {
  document.querySelector('.tabs').innerHTML = Object.entries(specimenCatalog).map(([id, s]) => `<button class="${id===current?'active':''}" data-type="${id}" aria-pressed="${id===current}"><img class="specimen-thumb" src="assets/specimens/thumbs/${id}.webp" alt="" width="36" height="24" decoding="async"><span>${s.name}<small>${s.subtitle}</small></span></button>`).join('');
}
renderSpecimenNavigation('plant');
let artworkMode = location.protocol === 'file:' ? 'rendered' : '3d';

function chooseSpecimen(next) {
  type = next;
  selected = specimenCatalog[type].default;
  artworkMode = location.protocol === 'file:' ? 'rendered' : '3d';
  stopQuiz();
  resetZoom();
  document.querySelectorAll('[data-type]').forEach(b => {
    b.classList.toggle('active', b.dataset.type === type);
    b.setAttribute('aria-pressed', String(b.dataset.type === type))
  });
  render();
  document.querySelector('#cell-details').scrollTop = 0;
}

function renderImageSpecimen(model, active, showLabels) {
  const spec = specimenCatalog[model];
  const landmarks = ['nucleus', 'vacuole', 'chloroplast', 'mitochondrion', 'nucleoid', 'axon', 'microvilli', 'myofibril'];
  let out = `<image class="rendered-specimen" href="assets/specimens/${model}.webp" x="0" y="11.667" width="820" height="546.667" preserveAspectRatio="xMidYMid meet"/><g class="image-hotspots">`;
  for (const [id, [x, y, r]] of Object.entries(spec.spots)) {
    const item = structures.find(s => s.id === id);
    if (!item) continue;
    const visible = showLabels && (id === active || landmarks.includes(id));
    const labelX = x > 580 ? x - 13 : x + 13;
    const anchor = x > 580 ? 'end' : 'start';
    out += group(id, `<circle class="hotspot-target" cx="${x}" cy="${y}" r="${Math.max(13,Math.min(28,r*.55))}" fill="transparent"/><circle class="hotspot-ring" cx="${x}" cy="${y}" r="${id===active?7:4}"/><circle class="hotspot-center" cx="${x}" cy="${y}" r="2"/>${visible?`<text class="image-label" x="${labelX}" y="${y-8}" text-anchor="${anchor}">${item.name}</text>`:''}`);
  }
  return out + '</g>';
}

function renderAtlasArtwork(model, active, showLabels) {
  const canDiagram = ['plant', 'animal'].includes(model);
  document.querySelectorAll('[data-art]').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.art === artworkMode));
    b.disabled = (b.dataset.art === 'diagram' && !canDiagram) || (b.dataset.art === '3d' && location.protocol === 'file:')
  });
  document.querySelector('#cell-viewport').dataset.mode = artworkMode;
  document.querySelector('.zoom-hint').textContent = artworkMode === '3d' ? 'Drag to rotate · Scroll to zoom · Right-drag or two-finger drag to pan' : 'Zoom to inspect · Scroll or swipe to pan';
  if (artworkMode === '3d') {
    window.Cell3D?.show(model, active, showLabels, quiz);
    return '';
  }
  window.Cell3D?.hide();
  return artworkMode === 'diagram' && canDiagram ? renderCellArtwork(model, active, showLabels) : renderImageSpecimen(model, active, showLabels);
}

function specimenDetailImage(id) {
  const spec = specimenCatalog[type],
    spot = spec.spots[id];
  if ((id === 'nucleus' || id === 'nucleolus') && type !== 'leukocyte') return `<img class="organelle-render" src="assets/organelles/nucleus.webp" decoding="async" alt="Illustrated cutaway of a nucleus with chromatin, pores, and nucleolus.">`;
  if (!spot) return '';
  const [x, y, r] = spot, half = Math.max(r * 1.6, 35), left = Math.max(0, x - half), top = Math.max(12, y - half), side = Math.min(half * 2, 820 - left, 558 - top);
  return `<svg class="organelle-render" viewBox="${left} ${top} ${side} ${side}" role="img" aria-label="Enlarged view of ${structures.find(s=>s.id===id).name} in the specimen illustration"><image href="assets/specimens/${type}.webp" x="0" y="11.667" width="820" height="546.667"/></svg>`;
}
