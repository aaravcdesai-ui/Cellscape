// Project-authored mixed practice. Answers are visible client-side for self-directed learning.
const practiceQuestions = [{
  "id": "p-mito",
  "kind": "identification",
  "concept": "Mitochondria",
  "prompt": "Which organelle has the folded inner membrane shown here?",
  "options": [{
    "id": "mitochondrion",
    "text": "Mitochondrion"
  }, {
    "id": "golgi",
    "text": "Golgi apparatus"
  }, {
    "id": "nucleus",
    "text": "Nucleus"
  }],
  "answer": "mitochondrion",
  "explanation": "Cristae are folds of the mitochondrial inner membrane.",
  "hint": "Look for an outer boundary and many folds within it.",
  "image": "mitochondrion"
}, {
  "id": "p-chloro",
  "kind": "identification",
  "concept": "Chloroplasts",
  "prompt": "Which organelle contains these stacks of internal membrane discs?",
  "options": [{
    "id": "chloroplast",
    "text": "Chloroplast"
  }, {
    "id": "lysosome",
    "text": "Lysosome"
  }, {
    "id": "centrosome",
    "text": "Centrosome"
  }],
  "answer": "chloroplast",
  "explanation": "Thylakoid discs form stacks called grana inside chloroplasts.",
  "hint": "This structure captures light energy in photosynthetic cells.",
  "image": "chloroplast"
}, {
  "id": "p-membrane",
  "kind": "identification",
  "concept": "Cell membrane",
  "prompt": "What structure does this phospholipid bilayer represent?",
  "options": [{
    "id": "wall",
    "text": "Cell wall"
  }, {
    "id": "membrane",
    "text": "Cell membrane"
  }, {
    "id": "ribosomes",
    "text": "Ribosomes"
  }],
  "answer": "membrane",
  "explanation": "The plasma membrane is a selectively permeable phospholipid bilayer.",
  "hint": "Its water-attracting heads face the surrounding fluids.",
  "image": "membrane"
}, {
  "id": "p-ribosome",
  "kind": "function",
  "concept": "Ribosomes",
  "prompt": "Which structure translates messenger RNA into a chain of amino acids?",
  "options": [{
    "id": "golgi",
    "text": "Golgi apparatus"
  }, {
    "id": "ribosomes",
    "text": "Ribosomes"
  }, {
    "id": "vacuole",
    "text": "Central vacuole"
  }],
  "answer": "ribosomes",
  "explanation": "Ribosomes read mRNA and assemble the amino-acid chain.",
  "hint": "It may be free in cytosol or attached to rough ER.",
  "image": null
}, {
  "id": "p-golgi",
  "kind": "function",
  "concept": "Golgi and transport",
  "prompt": "A protein has left the ER. Which compartment further processes and sorts it?",
  "options": [{
    "id": "golgi",
    "text": "Golgi apparatus"
  }, {
    "id": "nucleolus",
    "text": "Nucleolus"
  }, {
    "id": "centrosome",
    "text": "Centrosome"
  }],
  "answer": "golgi",
  "explanation": "The Golgi receives cargo from the ER and sorts it at the trans side.",
  "hint": "Think of a stack of flattened membrane sacs.",
  "image": null
}, {
  "id": "p-osmosis",
  "kind": "function",
  "concept": "Water balance",
  "prompt": "A plant cell is placed in a hypertonic solution. What is the expected net effect?",
  "options": [{
    "id": "water-out",
    "text": "Water leaves; turgor decreases"
  }, {
    "id": "water-in",
    "text": "Water enters; turgor increases"
  }, {
    "id": "wall-vanishes",
    "text": "The cell wall disappears"
  }],
  "answer": "water-out",
  "explanation": "A hypertonic solution draws water out by osmosis, reducing turgor. The wall remains.",
  "hint": "Compare the outside solute concentration with the inside.",
  "image": null
}, {
  "id": "p-route",
  "kind": "sequence",
  "concept": "Secretory pathway",
  "prompt": "Choose the correct route for this soluble secreted protein.",
  "options": [{
    "id": "route-right",
    "text": "Ribosome → rough ER → Golgi → cell surface"
  }, {
    "id": "route-reverse",
    "text": "Golgi → rough ER → ribosome → cell surface"
  }, {
    "id": "route-nucleus",
    "text": "Nucleus → chloroplast → cell surface"
  }],
  "answer": "route-right",
  "explanation": "Translation begins on a ribosome; entry into rough ER is followed by vesicle traffic through the Golgi toward secretion.",
  "hint": "A protein is synthesized before the Golgi processes it.",
  "image": null
}, {
  "id": "p-fusion",
  "kind": "sequence",
  "concept": "Golgi and transport",
  "prompt": "After a secretory vesicle reaches the plasma membrane, what happens next?",
  "options": [{
    "id": "fusion",
    "text": "Membrane fusion releases soluble cargo"
  }, {
    "id": "dna",
    "text": "The protein turns into DNA"
  }, {
    "id": "ribosome",
    "text": "The vesicle becomes a ribosome"
  }],
  "answer": "fusion",
  "explanation": "Exocytosis joins the vesicle and plasma membranes and releases soluble cargo outside.",
  "hint": "The carrier membrane joins the destination membrane.",
  "image": null
}, {
  "id": "p-compare",
  "kind": "comparison",
  "concept": "Plant and animal cells",
  "prompt": "Which statement applies to photosynthetic plant cells and typical animal cells?",
  "options": [{
    "id": "both-mito",
    "text": "Both use mitochondria; only the photosynthetic plant model has chloroplasts"
  }, {
    "id": "plants-no-mito",
    "text": "Plants use chloroplasts instead of mitochondria"
  }, {
    "id": "animals-wall",
    "text": "Both have cellulose walls"
  }],
  "answer": "both-mito",
  "explanation": "Plant cells use mitochondria too. Chloroplasts add photosynthesis; they do not replace respiration.",
  "hint": "Photosynthesis and cellular respiration are different processes.",
  "image": null
}, {
  "id": "p-bacteria",
  "kind": "comparison",
  "concept": "Prokaryotes",
  "prompt": "Which structure is absent from a bacterial cell but present in a typical animal cell?",
  "options": [{
    "id": "nucleus",
    "text": "Membrane-bound nucleus"
  }, {
    "id": "ribosomes",
    "text": "Ribosomes"
  }, {
    "id": "membrane",
    "text": "Plasma membrane"
  }],
  "answer": "nucleus",
  "explanation": "Bacteria have DNA, ribosomes, and a plasma membrane, but no membrane-bound nucleus.",
  "hint": "Bacterial chromosomal DNA occupies a nucleoid region.",
  "image": null
}];
