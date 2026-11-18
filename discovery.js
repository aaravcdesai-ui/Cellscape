// Guided exploration remains in page memory and is not submitted as quiz data.
(() => {
  const lessons = {
    secretion: {
      name: 'Trace the protein team',
      specimen: 'animal',
      goal: 'Find three structures that make, prepare, and sort a secreted protein.',
      targets: [
        ['ribosomes', 'Where translation happens', 'Ribosomes translate mRNA into an amino-acid chain.'],
        ['rough-er', 'Where this protein enters a membrane compartment', 'The chain enters the ER lumen for folding and early processing.'],
        ['golgi', 'Where cargo is processed and sorted', 'Golgi compartments further process and sort cargo for delivery.']
      ],
      question: 'Why does blocking ER-to-Golgi transport reduce new protein delivery to the surface?',
      options: ['New cargo cannot reach downstream compartments.', 'The Golgi stops reading DNA.'],
      answer: 0,
      explanation: 'Membrane traffic connects the compartments. The Golgi does not translate mRNA or read DNA to build the original protein.'
    },
    water: {
      name: 'Why does a plant wilt?',
      specimen: 'plant',
      goal: 'Find three structures that connect water movement to support.',
      targets: [
        ['vacuole', 'The large water-filled compartment', 'The central vacuole stores water and contributes to turgor.'],
        ['membrane', 'The selective boundary', 'Water crosses the plasma membrane in response to osmotic conditions.'],
        ['wall', 'The supportive outer layer', 'The wall resists expansion; pressure against it helps support the cell.']
      ],
      question: 'A plant cell loses water. What explains the loss of firmness?',
      options: ['Its cellulose wall instantly dissolves.', 'Its vacuole shrinks and turgor pressure falls.'],
      answer: 1,
      explanation: 'Water loss reduces turgor. The wall remains; it does not need to disappear for the plant to wilt.'
    },
    neuron: {
      name: 'Follow a neuron’s signal',
      specimen: 'neuron',
      goal: 'Find the receiving branches, conducting process, and insulating layer.',
      targets: [
        ['dendrites', 'The receiving branches', 'Dendrites receive many inputs from other cells.'],
        ['axon', 'The long conducting process', 'The axon carries action potentials toward target cells.'],
        ['myelin', 'The insulating wrapping', 'Myelin made by glial cells supports rapid saltatory conduction.']
      ],
      question: 'What is the role of myelin in this model?',
      options: ['It builds a new nucleus around the axon.', 'It insulates the axon and supports faster conduction.'],
      answer: 1,
      explanation: 'Myelin is glial-cell membrane wrapped around the axon. Gaps between segments are nodes of Ranvier.'
    }
  };
  let active = null,
    found = new Set(),
    finished = false;
  const panel = document.createElement('section');
  panel.id = 'guided-discovery';
  panel.setAttribute('aria-labelledby', 'discovery-title');
  panel.innerHTML = '<div class="discovery-head"><div><p class="eyebrow">GUIDED DISCOVERY / EXPLORE WITH A GOAL</p><h2 id="discovery-title">Find the connections.</h2></div><label>Activity <select id="discovery-lesson"></select></label><button id="discovery-start">Start activity</button></div><div id="discovery-work" hidden><p id="discovery-goal"></p><ol id="discovery-targets"></ol><p id="discovery-progress" role="status"></p><p id="discovery-feedback" role="status"></p><div id="discovery-check" hidden><h3 id="discovery-question"></h3><div id="discovery-options"></div></div><a class="discovery-model-link" href="#cell-viewport">Explore the model ↓</a><button id="discovery-exit">Leave activity</button></div>';
  document.querySelector('.lab-top').after(panel);
  const back = document.createElement('a');
  back.className = 'discovery-return';
  back.href = '#guided-discovery';
  back.id = 'discovery-return';
  document.querySelector('.specimen-title').after(back);
  const by = id => document.getElementById(id);
  for (const [id, l] of Object.entries(lessons)) {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = l.name;
    by('discovery-lesson').append(o)
  }

  function draw() {
    const l = lessons[active];
    by('discovery-targets').replaceChildren();
    for (const [id, clue] of l.targets) {
      const item = document.createElement('li');
      item.textContent = (found.has(id) ? '✓ ' + structures.find(s => s.id === id).name : clue);
      if (found.has(id)) item.className = 'discovered';
      by('discovery-targets').append(item)
    }
    by('discovery-return').textContent = found.size + ' / ' + l.targets.length + ' connections found · Back to activity ↑';
    by('discovery-progress').textContent = found.size + ' / ' + l.targets.length + ' connections found' + (finished ? ' · Activity complete!' : '');
    by('discovery-check').hidden = found.size !== l.targets.length;
  }
  by('discovery-start').onclick = () => {
    document.body.dataset.discovery = 'active';
    active = by('discovery-lesson').value;
    found = new Set();
    finished = false;
    setView('atlas');
    chooseSpecimen(lessons[active].specimen);
    by('discovery-work').hidden = false;
    by('discovery-goal').textContent = lessons[active].goal;
    by('discovery-feedback').textContent = 'Choose structures in the model or the structure list. Find them in any order.';
    by('discovery-question').textContent = lessons[active].question;
    by('discovery-options').replaceChildren();
    lessons[active].options.forEach((label, i) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.onclick = () => {
        finished = i === lessons[active].answer;
        by('discovery-feedback').textContent = (finished ? 'Correct. ' : 'Try again. ') + lessons[active].explanation;
        draw()
      };
      by('discovery-options').append(b)
    });
    draw();
    by('discovery-goal').tabIndex = -1;
    by('discovery-goal').focus({
      preventScroll: true
    })
  };
  by('discovery-exit').onclick = () => {
    document.body.dataset.discovery = '';
    active = null;
    by('discovery-work').hidden = true;
    by('discovery-start').focus()
  };
  window.addEventListener('cellscape-inspect', e => {
    if (!active || quiz) return;
    const l = lessons[active];
    if (e.detail.specimen !== l.specimen) {
      by('discovery-feedback').textContent = 'This activity uses the ' + specimenCatalog[l.specimen].name + '. Start the activity again to return to that specimen.';
      return
    }
    const target = l.targets.find(t => t[0] === e.detail.id);
    if (target) {
      found.add(target[0]);
      by('discovery-feedback').textContent = target[2]
    } else {
      const s = structures.find(s => s.id === e.detail.id);
      by('discovery-feedback').textContent = (s ? s.name + ': ' + s.fn + ' ' : '') + 'Look for a structure that matches one of the remaining clues.'
    }
    draw()
  });
  window.CellDiscovery = {
    active: () => !!active
  };
})();
