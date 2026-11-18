// Virtual investigations are qualitative teaching models, not measured predictions.
(() => {
  const by = id => document.getElementById(id);
  let mode = '3d',
    experiment = 'transport',
    running = false,
    frame = null,
    start = null,
    progress = 0,
    prediction = null,
    observed = false,
    experimentPaused = false;
  // Completed protein-journey checks (steps 0–5) survive a reload; storage failures are ignored.
  const checks = new Set((() => {
      try {
        const stored = JSON.parse(localStorage.getItem('cellscape:lesson-checks') || '[]');
        return Array.isArray(stored) ? stored.filter(step => Number.isInteger(step) && step >= 0 && step < 6) : []
      } catch {
        return []
      }
    })()),
    missed = new Set();
  const goalText = () => `${checks.size} / 6 checks completed${checks.size===6?' · Route explained!':''}`;
  let pack = [],
    number = 0,
    solved = false,
    firstScore = 0,
    helped = false,
    attempts = 0,
    reviewOnly = false;
  const toolbar = document.createElement('div');
  toolbar.className = 'lesson-mode';
  toolbar.innerHTML = '<div><strong>Trace a secreted protein</strong><small>Goal: explain the route, its compartments, and membrane fusion.</small></div><div class="lesson-mode-buttons"><button id="journey-mode-3d" aria-pressed="true">Inside the 3D cell</button><button id="journey-mode-map" aria-pressed="false">Pathway map</button></div><span id="lesson-goal">' + goalText() + '</span>';
  by('journey-stages').before(toolbar);
  const stage = document.createElement('div');
  stage.id = 'journey-3d-stage';
  stage.className = 'lesson-3d-stage';
  document.querySelector('.journey-viewport').append(stage);
  const fallback = document.createElement('p');
  fallback.id = 'lesson-3d-fallback';
  fallback.className = 'lesson-3d-hint';
  fallback.textContent = 'Drag to rotate the cell. The gold marker is the protein; a translucent sphere is its carrier. Geometry, distances, and timing are illustrative.';
  stage.after(fallback);

  function journey(step, fraction) {
    if (document.body.dataset.page !== 'journey' || mode !== '3d') return;
    const ready = window.Cell3D?.lesson({
      hostId: 'journey-3d-stage',
      kind: 'animal',
      stage: step,
      progress: fraction
    });
    if (ready === false) {
      mode = 'map';
      updateMode();
      by('lesson-3d-fallback').textContent = '3D is unavailable in this browser. The pathway map provides the same lesson.'
    }
  }

  function updateMode() {
    by('journey-art').toggleAttribute('hidden', mode === '3d');
    stage.hidden = mode !== '3d';
    by('journey-mode-3d').setAttribute('aria-pressed', String(mode === '3d'));
    by('journey-mode-map').setAttribute('aria-pressed', String(mode === 'map'));
    if (mode === 'map') {
      window.Cell3D?.endLesson();
      window.Cell3D?.hide()
    } else journey(journeyStep, 1);
    document.querySelector('.journey-viewport').scrollTo(0, 0);
  }
  by('journey-mode-3d').onclick = () => {
    mode = '3d';
    pauseJourney();
    updateMode()
  };
  by('journey-mode-map').onclick = () => {
    mode = 'map';
    pauseJourney();
    updateMode();
    panJourney()
  };

  function stopExperiment() {
    running = false;
    cancelAnimationFrame(frame);
    frame = null;
    start = null;
    by('lab-run').disabled = false
  }

  function configure() {
    experimentPaused = false;
    stopExperiment();
    progress = 0;
    prediction = null;
    observed = false;
    by('lab-predictions').replaceChildren();
    by('lab-result').textContent = 'Choose a prediction, then run the experiment.';
    by('lab-explain').hidden = true;
    by('lab-progress').value = 0;
    by('lab-water-control').hidden = experiment !== 'water';
    by('lab-block-control').hidden = experiment !== 'transport';
    const water = experiment === 'water',
      control = !water && !by('lab-block').checked;
    by('lab-goal').textContent = water ? 'Explain how external solute concentration changes net water movement and turgor.' : 'Explain why blocking ER-to-Golgi traffic reduces protein delivery downstream.';
    by('lab-question').textContent = water ? 'With the selected outside solution, what will happen to the plant cell?' : control ? 'With transport functioning normally, where will this new secreted protein go?' : 'If ER-to-Golgi delivery is blocked, what happens to newly made secreted proteins?';
    const options = water ? ['They lose water and turgor', 'They gain water and turgor', 'No net water movement at equilibrium'] : control ? ['Through ER and Golgi to the surface', 'It remains trapped in the nucleus', 'The Golgi begins translating mRNA'] : ['They accumulate upstream; less reaches the cell surface', 'More reaches the surface', 'The Golgi begins translating mRNA'];
    options.forEach((label, i) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.setAttribute('aria-pressed', 'false');
      b.onclick = () => {
        prediction = i;
        by('lab-predictions').querySelectorAll('button').forEach(e => e.setAttribute('aria-pressed', String(e === b)));
        by('lab-result').textContent = 'Prediction recorded. Run the model to compare it with the outcome.'
      };
      by('lab-predictions').append(b)
    });
    paintExperiment(0);
  }

  function paintExperiment(t) {
    if (document.body.dataset.page !== 'lab') return;
    const water = experiment === 'water',
      condition = by('lab-water').value,
      target = condition === 'hypertonic' ? 0 : condition === 'hypotonic' ? 1 : .65;
    const waterLevel = water ? (.65 + (target - .65) * t) : null;
    const stage = Math.min(5, Math.floor(t * 6)),
      fraction = t === 1 ? 1 : Math.min(1, t * 6 - stage);
    const ready = window.Cell3D?.lesson({
      hostId: 'lab-3d-stage',
      kind: water ? 'plant' : 'animal',
      stage,
      progress: fraction,
      blocked: !water && by('lab-block').checked,
      water: waterLevel
    });
    by('lab-3d-status').textContent = ready === false ? '3D is unavailable. Read the explained outcome below.' : 'Drag to rotate · Sizes and timing are illustrative';
    window.CellInvestigations?.paint({
      experiment,
      t,
      blocked: by('lab-block').checked,
      condition: by('lab-water').value,
      running
    });
    by('lab-progress').value = t * 100;
  }

  function finishExperiment() {
    observed = true;
    experimentPaused = false;
    stopExperiment();
    progress = 1;
    paintExperiment(1);
    const water = experiment === 'water',
      blocked = by('lab-block').checked,
      condition = by('lab-water').value;
    const correct = water ? (condition === 'hypertonic' ? 0 : condition === 'hypotonic' ? 1 : 2) : 0;
    const outcome = water ? (condition === 'hypertonic' ? 'Water leaves the cell; the vacuole shrinks and turgor falls. With sufficient water loss, the protoplast may pull away from the wall (plasmolysis). This model simplifies that change.' : condition === 'hypotonic' ? 'Water enters; the vacuole expands and turgor rises. The cell wall resists expansion, so a walled plant cell becomes turgid rather than behaving like an unprotected animal cell.' : 'At osmotic equilibrium there is no net water flow. Water molecules still move in both directions; this is not a frozen state.') : blocked ? 'New cargo remains upstream of the block. Less of this newly synthesized protein reaches the Golgi and cell surface. Existing cargo may still be released; this model follows only a newly made batch.' : 'Cargo passes through the ER and Golgi, then reaches the surface for secretion.';
    by('lab-result').textContent = (prediction === correct ? 'Your prediction matches. ' : 'Compare with your prediction: ') + outcome;
    by('lab-explain').hidden = false;
    by('lab-explanation').textContent = '';
  }

  function animateExperiment(now) {
    if (!running) return;
    if (start === null) start = now;
    progress = Math.min(1, (now - start) / 8500);
    paintExperiment(progress);
    if (progress === 1) finishExperiment();
    else frame = requestAnimationFrame(animateExperiment)
  }
  by('lab-run').onclick = () => {
    if (prediction === null) {
      by('lab-result').textContent = 'Make a prediction first.';
      return
    }
    experimentPaused = false;
    stopExperiment();
    progress = 0;
    running = true;
    by('lab-run').disabled = true;
    start = null;
    by('lab-explain').hidden = true;
    by('lab-result').textContent = 'Observe the gold cargo or the size of the vacuole.';
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) finishExperiment();
    else frame = requestAnimationFrame(animateExperiment)
  };
  by('lab-finish').onclick = () => {
    if (prediction !== null) finishExperiment();
    else by('lab-result').textContent = 'Choose a prediction before showing the outcome.'
  };
  by('lab-reset').onclick = configure;
  by('lab-experiment').onchange = e => {
    experiment = e.target.value;
    configure()
  };
  by('lab-water').onchange = configure;
  by('lab-block').onchange = configure;
  by('lab-explain-answer').onclick = () => {
    by('lab-explanation').textContent = experiment === 'water' ? 'Investigation complete: explain the direction of net water movement using the outside solution, then connect vacuole volume to turgor. The wall does not disappear.' : 'Investigation complete: the ER, Golgi, and surface communicate through membrane traffic. Blocking delivery affects downstream cargo; it does not turn the Golgi into a ribosome.'
  };

  function shuffle(items) {
    return items.map(value => ({
      value,
      r: Math.random()
    })).sort((a, b) => a.r - b.r).map(e => e.value)
  }

  function startPractice(review = false) {
    reviewOnly = review;
    let chosen = [];
    if (review) chosen = shuffle(practiceQuestions.filter(q => missed.has(q.id)));
    for (const kind of ['identification', 'function', 'sequence', 'comparison']) {
      if (chosen.length >= 5) break;
      if (!chosen.some(q => q.kind === kind)) {
        const q = shuffle(practiceQuestions.filter(q => q.kind === kind && !chosen.includes(q)))[0];
        if (q) chosen.push(q)
      }
    }
    pack = [...chosen, ...shuffle(practiceQuestions.filter(q => !chosen.includes(q)))].slice(0, 5);
    number = 0;
    firstScore = 0;
    by('practice-area').hidden = false;
    by('practice-feedback').textContent = '';
    window.QuizStore?.begin('practice', pack.map(q => q.id), 'practice-save-status');
    showPractice();
  }

  function showPractice() {
    solved = false;
    helped = false;
    attempts = 0;
    const q = pack[number];
    by('practice-position').textContent = `QUESTION ${number+1} OF 5 / ${q.kind.toUpperCase()}`;
    by('practice-prompt').textContent = q.prompt;
    by('practice-feedback').textContent = '';
    by('practice-options').replaceChildren();
    by('practice-next').hidden = true;
    by('practice-hint').disabled = false;
    by('practice-reveal').disabled = false;
    by('practice-figure').innerHTML = q.image ? anatomyArt(q.image) : '';
    const svg = by('practice-figure').querySelector('svg');
    if (svg) svg.setAttribute('aria-label', q.image === 'mitochondrion' ? 'Oval organelle with a folded inner membrane.' : q.image === 'chloroplast' ? 'Oval organelle containing stacks of membrane discs.' : 'A double layer of molecules with heads facing out and tails facing inward.');
    shuffle(q.options).forEach(option => {
      const b = document.createElement('button');
      b.textContent = option.text;
      b.onclick = () => {
        if (solved) return;
        window.QuizStore?.record('answer', number + 1, option.id, 'practice-save-status');
        if (option.id !== q.answer) {
          attempts++;
          missed.add(q.id);
          b.disabled = true;
          by('practice-feedback').textContent = 'Not yet. ' + q.hint + ' Try another answer.'
        } else {
          if (!attempts && !helped) {
            firstScore++;
            missed.delete(q.id)
          }
          finishPracticeQuestion(false)
        }
      };
      by('practice-options').append(b)
    });
  }

  function finishPracticeQuestion(revealed) {
    const q = pack[number];
    solved = true;
    if (revealed) missed.add(q.id);
    by('practice-feedback').textContent = (revealed ? 'Answer: ' + q.options.find(o => o.id === q.answer).text + '. ' : 'Correct. ') + q.explanation;
    by('practice-options').querySelectorAll('button').forEach(b => b.disabled = true);
    by('practice-hint').disabled = true;
    by('practice-reveal').disabled = true;
    by('practice-next').hidden = false;
    by('practice-next').textContent = number === 4 ? 'See results' : 'Next question';
  }
  by('practice-start').onclick = () => startPractice(false);
  by('practice-review').onclick = () => startPractice(true);
  by('practice-hint').onclick = () => {
    if (solved) return;
    helped = true;
    missed.add(pack[number].id);
    window.QuizStore?.record('hint', number + 1, undefined, 'practice-save-status');
    by('practice-feedback').textContent = pack[number].hint;
    by('practice-hint').disabled = true
  };
  by('practice-reveal').onclick = () => {
    if (solved) return;
    helped = true;
    window.QuizStore?.record('reveal', number + 1, undefined, 'practice-save-status');
    finishPracticeQuestion(true)
  };
  by('practice-next').onclick = () => {
    if (number < 4) {
      number++;
      showPractice()
    } else {
      by('practice-position').textContent = 'PRACTICE COMPLETE';
      by('practice-prompt').textContent = `${firstScore} / 5 correct on the first try without help.`;
      by('practice-options').replaceChildren();
      by('practice-figure').replaceChildren();
      by('practice-feedback').textContent = missed.size ? 'Review missed concepts to revisit the questions that needed support. Reviews stay within this open page; no student identity is tracked.' : 'You solved these concepts independently. Try another mixed set.';
      by('practice-next').hidden = true;
      by('practice-hint').disabled = true;
      by('practice-reveal').disabled = true;
      by('practice-review').disabled = !missed.size
    }
  };

  function onView(view) {
    if (view !== 'lab') {
      experimentPaused = false;
      stopExperiment()
    }
    if (view === 'journey') updateMode();
    else if (view === 'lab') {
      paintExperiment(observed ? 1 : 0)
    } else stopExperiment()
  }
  window.CellLab = {
    journey,
    paused: () => experimentPaused,
    refreshExperiment: () => paintExperiment(progress),
    toggleExperiment() {
      if (running) {
        experimentPaused = true;
        stopExperiment();
        paintExperiment(progress)
      } else if (experimentPaused) {
        experimentPaused = false;
        running = true;
        start = performance.now() - progress * 8500;
        by('lab-run').disabled = true;
        frame = requestAnimationFrame(animateExperiment)
      }
    },
    completeStep(step) {
      checks.add(step);
      try {
        localStorage.setItem('cellscape:lesson-checks', JSON.stringify([...checks]))
      } catch {}
      by('lesson-goal').textContent = goalText()
    },
    onView
  };
  window.addEventListener('cell3d-ready', () => onView(document.body.dataset.page));
  configure();
  updateMode();
  onView(document.body.dataset.page);
})();
