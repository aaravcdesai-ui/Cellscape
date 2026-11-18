// Reference-inspired study tools. Notes and saved structures are kept in this browser
// (localStorage) so a reload does not lose them; user images stay in this open page.
(() => {
  // Storage can be unavailable (private windows, blocked site data), so every access is guarded
  // and the tools fall back to page-only memory.
  const store = {
    read(name) {
      try {
        return JSON.parse(localStorage.getItem('cellscape:' + name) || 'null')
      } catch {
        return null
      }
    },
    write(name, value) {
      try {
        localStorage.setItem('cellscape:' + name, JSON.stringify(value));
        return true
      } catch {
        return false
      }
    },
    remove(name) {
      try {
        localStorage.removeItem('cellscape:' + name)
      } catch {}
    }
  };
  // Only restore entries that still point at a real specimen and structure.
  const validKey = key => {
    if (typeof key !== 'string') return false;
    const [kind, id] = key.split(':');
    return kind in specimenCatalog && structures.some(s => s.id === id)
  };
  const restore = (name, isValid) => {
    const value = store.read(name);
    return new Map(Array.isArray(value) ? value.filter(entry => Array.isArray(entry) && validKey(entry[0]) && isValid(entry[1])) : [])
  };
  const el = id => document.getElementById(id),
    saved = restore('library', item => item && item.specimen in specimenCatalog && structures.some(s => s.id === item.structure)),
    notes = restore('notes', note => typeof note === 'string' && note.length <= 10000),
    images = new Map();
  const persist = () => store.write('library', [...saved]) && store.write('notes', [...notes]);
  let activeTool = '',
    imageMode = 0,
    imageZoom = 1,
    comparison = 'animal',
    returnFocus = null;
  const specimenKeys = Object.keys(specimenCatalog);
  const structureClass = id => id === 'bacterial-ribosomes' ? 'ribosomes' : id;
  const sharedIds = (left, right) => left.ids.filter(id => right.ids.some(other => structureClass(id) === structureClass(other)));
  const button = (text, fn, className = '') => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.className = className;
    b.onclick = fn;
    return b
  };
  const text = (tag, value, className = '') => {
    const n = document.createElement(tag);
    n.textContent = value;
    n.className = className;
    return n
  };

  function download(blob, name) {
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000)
  }

  function announce(value) {
    el('studio-status').textContent = value
  }
  const dialog = document.createElement('dialog');
  dialog.id = 'studio-dialog';
  dialog.setAttribute('aria-labelledby', 'studio-dialog-title');
  dialog.innerHTML = '<div class="studio-dialog-head"><div><p class="eyebrow" id="studio-dialog-eyebrow">THE STUDY DESK</p><h2 id="studio-dialog-title"></h2></div><button id="studio-close" aria-label="Close study tool">×</button></div><div id="studio-dialog-body"></div>';
  document.body.append(dialog);
  el('studio-close').onclick = () => dialog.close();
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close()
    }
  });
  dialog.addEventListener('close', () => {
    activeTool = '';
    returnFocus?.focus()
  });
  const status = text('p', '', 'studio-status');
  status.id = 'studio-status';
  status.setAttribute('role', 'status');
  document.querySelector('.diagram-panel').append(status);
  const actions = document.createElement('div');
  actions.className = 'specimen-actions';
  actions.innerHTML = '<div><button id="save-structure" aria-pressed="false">☆ Save structure</button><button id="note-structure">✎ Add note</button></div><div><button id="snapshot-cell">↓ Snapshot</button><button id="export-cell">↓ 3D model</button></div>';
  document.querySelector('.three-tools').after(actions);
  el('save-structure').onclick = () => {
    if (quiz || !selected) return;
    const key = type + ':' + selected;
    if (saved.has(key)) saved.delete(key);
    else saved.set(key, {
      specimen: type,
      structure: selected
    });
    persist();
    refresh();
    announce(saved.has(key) ? 'Structure saved to your library.' : 'Structure removed from your library.')
  };
  el('note-structure').onclick = () => open('notebook');
  el('snapshot-cell').onclick = async () => {
    try {
      if (artworkMode !== '3d') {
        announce('Switch to 3D to capture a model snapshot.');
        return
      }
      const blob = await window.Cell3D?.snapshot();
      if (!blob) throw Error();
      download(blob, `cellscape-${type}.png`);
      announce('Snapshot downloaded with the current view and visible labels.')
    } catch {
      announce('The snapshot could not be created. Try resetting the 3D view.')
    }
  };
  el('export-cell').onclick = () => {
    try {
      const model = window.Cell3D?.exportModel();
      if (!model) {
        announce('Switch to 3D to export a model.');
        return
      }
      download(new Blob([JSON.stringify(model)], {
        type: 'application/json'
      }), `cellscape-${type}.three.json`);
      announce('Three.js Object JSON downloaded. It contains geometry and materials, not quiz records.')
    } catch {
      announce('The model could not be exported. Try resetting the 3D view.')
    }
  };
  // Keep the selected structure first; the fun fact is a separate field-note card.
  const fact = el('cell-fun-fact');
  el('cell-details').append(fact);
  const context = document.createElement('section');
  context.className = 'habitat-card';
  context.innerHTML = '<p class="eyebrow">WHERE IT OCCURS</p><div id="habitat-art"></div><p id="habitat-caption"></p><span>STUDY SCHEMATIC · NOT TO SCALE</span>';
  el('cell-details').append(context);
  const desk = document.createElement('section');
  desk.id = 'study-desk';
  desk.className = 'study-desk';
  desk.setAttribute('aria-label', 'Specimen study desk');
  desk.innerHTML = '<section class="desk-microscope"><div class="desk-heading"><div><p class="eyebrow">LOOK AT ANOTHER SCALE</p><h2>Microscope desk</h2></div><span class="desk-page">01 / OBSERVE</span></div><div id="tissue-tiles" class="tissue-tiles"></div><p id="tissue-caption"></p><button id="open-microscope" class="desk-link">Open image workspace <span>↗</span></button></section><section class="desk-compare"><div class="desk-heading"><div><p class="eyebrow">FORM FOLLOWS FUNCTION</p><h2>Compare specimens</h2></div><span class="desk-page">02 / CONNECT</span></div><div class="compare-pair"><div id="compare-current"></div><span class="versus">&</span><label><span class="sr-only">Compare with specimen</span><select id="compare-partner"></select><img id="compare-partner-image" alt=""></label></div><p id="compare-summary"></p><button id="open-specimen-comparison" class="desk-link">Open side-by-side study <span>↗</span></button></section>';
  document.querySelector('.workspace').after(desk);
  el('compare-partner').onchange = e => {
    comparison = e.target.value;
    paintDesk()
  };
  el('open-specimen-comparison').onclick = () => open('compare');
  el('open-microscope').onclick = () => {
    if (imageMode === 3 && !images.has(type)) imageMode = 0;
    open('microscope')
  };

  function tissueSVG(kind, mode = 0) {
    const color = mode === 1 ? '#ad7b9e' : mode === 2 ? '#777d75' : kind === 'plant' ? '#8aab63' : '#9a83ad',
      bg = mode === 1 ? '#f1e2e9' : mode === 2 ? '#e8e8df' : '#e9eecf';
    let shapes = '';
    if (mode === 2) {
      let lipids = '';
      for (let x = 12; x < 260; x += 18) lipids += `<circle cx="${x}" cy="47" r="7" fill="#a7b5a1" stroke="#75866e"/><path d="M${x-3} 54l-3 23m9-23l4 23M${x-3} 96l-3-17m9 17l4-17" stroke="#9c9a83" stroke-width="2"/><circle cx="${x}" cy="103" r="7" fill="#a7b5a1" stroke="#75866e"/>`;
      return `<svg viewBox="0 0 260 150" role="img" aria-label="Phospholipid bilayer study schematic"><rect width="260" height="150" fill="#e7eee7"/><rect y="54" width="260" height="42" fill="#eee8d3"/>${lipids}<rect x="110" y="38" width="25" height="75" rx="10" fill="#9b87b3" stroke="#7d6493"/><path d="M122 44v63" stroke="#e9e2ed" stroke-width="4"/></svg>`;
    }
    // Original schematics, rather than fabricated microscope photographs.
    if (kind === 'neuron')
      for (let i = 0; i < 5; i++) {
        const x = 32 + i * 47,
          y = 65 + (i % 2) * 35;
        shapes += `<path d="M${x-25} ${y-42}l25 42 30-35M${x-20} ${y+37}l20-37 28 43M${x-18} ${y-10}l18 10 50-2" fill="none" stroke="${color}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="12" fill="${color}"/><circle cx="${x}" cy="${y}" r="5" fill="#635575"/>`
      }
    else if (kind === 'muscle')
      for (let i = 0; i < 8; i++) {
        const y = 16 + i * 17;
        shapes += `<path d="M-5 ${y}Q130 ${y-10} 265 ${y}" stroke="${color}" stroke-width="12" fill="none"/>`;
        for (let x = 7; x < 260; x += 17) shapes += `<path d="M${x} ${y-7}v12" stroke="#f5e9e3" stroke-width="2"/>`
      }
    else if (kind === 'bacteria')
      for (let i = 0; i < 29; i++) {
        const x = 13 + (i * 43) % 236,
          y = 14 + (i * 37) % 125;
        shapes += `<g transform="translate(${x} ${y}) rotate(${i*29})"><rect x="-9" y="-4" width="18" height="8" rx="4" fill="${color}"/><path d="M9 0q12 9 18-2" fill="none" stroke="${color}"/></g>`
      }
    else if (kind === 'epithelial')
      for (let row = 0; row < 2; row++)
        for (let i = 0; i < 12; i++) {
          const x = i * 23 - 6,
            y = row * 74;
          shapes += `<rect x="${x}" y="${y}" width="22" height="70" rx="5" fill="${color}" fill-opacity=".45" stroke="${color}"/><ellipse cx="${x+11}" cy="${y+48}" rx="5" ry="9" fill="${color}"/>`;
          for (let k = 0; k < 4; k++) shapes += `<path d="M${x+3+k*5} ${y}v-7" stroke="${color}" stroke-width="2"/>`
        }
    else if (kind === 'plant')
      for (let row = 0; row < 4; row++)
        for (let col = 0; col < 6; col++) {
          const x = col * 47 - (row % 2) * 19,
            y = row * 40 - 8;
          shapes += `<rect x="${x}" y="${y}" width="44" height="38" rx="8" fill="#f3f5d9" stroke="${color}" stroke-width="3"/><ellipse cx="${x+31}" cy="${y+28}" rx="5" ry="3" fill="${color}"/><ellipse cx="${x+8}" cy="${y+8}" rx="5" ry="3" fill="${color}"/>`
        }
    else
      for (let i = 0; i < 25; i++) {
        const x = 13 + (i * 53) % 235,
          y = 13 + (i * 39) % 130,
          r = kind === 'leukocyte' ? (i % 7 === 0 ? 16 : 9) : 16;
        shapes += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" fill-opacity="${kind==='leukocyte'?'.35':'.25'}" stroke="${color}"/><${kind==='leukocyte'?'ellipse':'circle'} cx="${x}" cy="${y}" ${kind==='leukocyte'?'rx="5" ry="3"':'r="5"'} fill="${color}"/>`
      }
    return `<svg viewBox="0 0 260 150" role="img" aria-label="${specimenCatalog[kind].name} study schematic"><rect width="260" height="150" fill="${bg}"/>${shapes}</svg>`;
  }
  const observations = {
    plant: ['Repeated cell walls', 'Look for adjoining compartments. The outer boundary is a wall; the living membrane lies just inside it.'],
    leukocyte: ['Cells in a fluid tissue', 'Blood contains many red cells and fewer white cells. This pattern is schematic, not a blood count.'],
    neuron: ['Branching connections', 'Follow a cell body into its processes. Whole-neuron proportions are compressed in the atlas.'],
    epithelial: ['An organized lining', 'Look for closely packed cells, an exposed apical surface, and a basal side.'],
    bacteria: ['Small repeating rods', 'This is one possible bacterial shape. Many bacteria are spherical or have other forms.'],
    animal: ['A generalized tissue', 'Animal cells form many tissues. This study pattern does not represent a specific biopsy.'],
    muscle: ['Parallel, repeating fibers', 'Look for alignment and repeating bands. A muscle fiber contains many myofibrils.']
  };

  function paintDesk() {
    if (comparison === type) comparison = specimenKeys.find(k => k !== type);
    el('compare-partner').replaceChildren(...specimenKeys.filter(k => k !== type).map(k => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = specimenCatalog[k].name;
      return o
    }));
    el('compare-partner').value = comparison;
    el('compare-current').replaceChildren();
    const img = document.createElement('img');
    img.src = `assets/specimens/${type}.webp`;
    img.alt = '';
    el('compare-current').append(img, text('strong', specimenCatalog[type].name));
    el('compare-partner-image').src = `assets/specimens/${comparison}.webp`;
    const common = sharedIds(specimenCatalog[type], specimenCatalog[comparison]);
    el('compare-summary').textContent = `${common.length} shared structure types in these models. Compare their organization and specialized features.`;
    el('tissue-tiles').replaceChildren();
    for (let i = 0; i < 3; i++) {
      const b = button('', () => {
        imageMode = i;
        open('microscope')
      });
      b.innerHTML = tissueSVG(type, i);
      b.append(text('span', ['Cell pattern', 'Stain study', 'Membrane study'][i]));
      b.setAttribute('aria-label', `Open ${['cell pattern','stain study','membrane study'][i]} schematic`);
      el('tissue-tiles').append(b)
    }
    const add = button('+', () => {
      open('microscope');
      el('microscope-file').click()
    }, 'add-tissue');
    add.append(text('span', 'Add image'));
    el('tissue-tiles').append(add);
    el('tissue-caption').textContent = observations[type][0] + ' · Illustrated study patterns, not micrographs.';
    el('habitat-art').innerHTML = tissueSVG(type);
    el('habitat-caption').textContent = specimenCatalog[type].where;
  }

  function open(tool) {
    returnFocus = document.activeElement;
    activeTool = tool;
    renderTool();
    if (!dialog.open) dialog.showModal()
  }

  function renderTool() {
    const body = el('studio-dialog-body');
    body.replaceChildren();
    const title = {
      gallery: 'The specimen gallery',
      library: 'Your structure library',
      notebook: 'The field notebook',
      settings: 'Make room to explore',
      compare: 'Two cells, side by side',
      microscope: 'The image workspace'
    };
    el('studio-dialog-title').textContent = title[activeTool];
    ({
      gallery: gallery,
      library: library,
      notebook: notebook,
      settings: settings,
      compare: compare,
      microscope: microscope
    } [activeTool])?.(body)
  }

  function jump(kind, id) {
    dialog.close();
    setView('atlas');
    chooseSpecimen(kind);
    if (id) select(id);
    el('cell-viewport').scrollIntoView({
      block: 'center'
    })
  }

  function gallery(body) {
    body.append(text('p', 'Seven teaching specimens. Choose one to return to its rotatable model.', 'tool-intro'));
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';
    for (const kind of specimenKeys) {
      const s = specimenCatalog[kind],
        b = button('', () => jump(kind));
      const img = document.createElement('img');
      img.src = `assets/specimens/thumbs/${kind}.webp`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = '';
      b.append(img, text('h3', s.name), text('p', s.subtitle), text('small', `${s.ids.length} structure types · ${s.classification}`));
      grid.append(b)
    }
    body.append(grid)
  }

  function library(body) {
    body.append(text('p', 'Save a structure from the atlas to collect it here. Your library is kept in this browser on this device.', 'tool-intro'));
    if (!saved.size) {
      body.append(text('p', 'Your first saved structure will appear here.', 'tool-empty'));
      return
    }
    const list = document.createElement('div');
    list.className = 'library-list';
    for (const [key, item] of saved) {
      const row = document.createElement('article'),
        s = structures.find(s => s.id === item.structure);
      row.append(button(`${s.name} ↗`, () => jump(item.specimen, item.structure)), text('p', specimenCatalog[item.specimen].name + ' · ' + s.fn), button('Remove', () => {
        saved.delete(key);
        persist();
        refresh();
        renderTool()
      }, 'remove-item'));
      list.append(row)
    }
    body.append(list)
  }

  function notebook(body) {
    const key = type + ':' + (selected || specimenCatalog[type].default),
      structure = structures.find(s => s.id === key.split(':')[1]);
    body.append(text('p', 'Notes are kept in this browser on this device. Nothing is uploaded or saved to an account. On a shared computer, download a copy and clear your saved work when you finish.', 'tool-intro'));
    const layout = document.createElement('div');
    layout.className = 'notebook-layout';
    const nav = document.createElement('div');
    nav.className = 'note-index';
    nav.append(text('p', 'YOUR PAGES', 'eyebrow'));
    const keys = [...new Set([key, ...notes.keys()])];
    for (const k of keys) {
      const [kind, id] = k.split(':');
      const b = button(`${specimenCatalog[kind].name} / ${structures.find(s=>s.id===id)?.name||id}`, () => {
        setView('atlas');
        chooseSpecimen(kind);
        selected = id;
        render();
        activeTool = 'notebook';
        renderTool()
      });
      b.setAttribute('aria-current', String(k === key));
      nav.append(b)
    }
    const page = document.createElement('div');
    page.append(text('p', specimenCatalog[type].name, 'eyebrow'), text('h3', structure.name));
    const label = text('label', 'What do you notice?');
    label.htmlFor = 'field-note';
    const area = document.createElement('textarea');
    area.id = 'field-note';
    area.rows = 9;
    area.maxLength = 10000;
    area.placeholder = 'Describe its shape, its function, and how it connects to the other structures…';
    area.value = notes.get(key) || '';
    const state = text('p', 'Notes save automatically in this browser.', 'note-state');
    state.setAttribute('role', 'status');
    area.oninput = () => {
      if (area.value) notes.set(key, area.value);
      else notes.delete(key);
      state.textContent = persist() ? 'Saved in this browser.' : 'This browser is not allowing saved data, so this note lasts only until you reload. Download it to keep a copy.'
    };
    page.append(label, area, state, button('Download notebook (.txt)', () => {
      const entries = [...notes].map(([k, n]) => {
        const [kind, id] = k.split(':');
        return specimenCatalog[kind].name + ' / ' + structures.find(s => s.id === id)?.name + '\n' + n
      });
      download(new Blob(['CELLSCAPE / FIELD NOTEBOOK\n\n' + (entries.join('\n\n---\n\n') || 'No notes recorded.')], {
        type: 'text/plain'
      }), 'cellscape-notebook.txt')
    }), button('Clear saved work', () => {
      if (!confirm('Delete all notes and saved structures from this browser? This cannot be undone.')) return;
      notes.clear();
      saved.clear();
      store.remove('notes');
      store.remove('library');
      refresh();
      renderTool();
      announce('Notes and saved structures cleared from this browser.')
    }, 'clear-saved'));
    layout.append(nav, page);
    body.append(layout)
  }

  function settings(body) {
    body.append(text('p', 'Viewer preferences apply to this page. Your operating system’s reduced-motion setting is respected by the lesson animations.', 'tool-intro'));
    const label = document.createElement('label');
    label.className = 'setting-row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = el('labels').checked;
    cb.disabled = quiz;
    cb.onchange = () => {
      el('labels').checked = cb.checked;
      render()
    };
    label.append(cb, text('span', 'Show structure labels'));
    body.append(label, button('Reset the 3D camera', () => {
      window.Cell3D?.reset();
      announce('Camera reset.')
    }), text('h3', 'Model exports'), text('p', 'Snapshots are PNG images of the current 3D camera view. Model downloads use Three.js Object JSON, readable with THREE.ObjectLoader. They include the teaching model’s geometry and materials; they are not GLB or STL files.', 'tool-intro'), text('h3', 'Keyboard controls'), text('p', 'In the 3D canvas: arrow keys rotate; Shift + arrows pan; + and − zoom; Home resets. Use Tab to reach buttons and labels.', 'tool-intro'))
  }

  function compare(body) {
    const left = specimenCatalog[type],
      right = specimenCatalog[comparison];
    body.append(text('p', 'Compare the structure types included in these teaching models. A feature absent from a model is not necessarily absent from every real cell of that type.', 'tool-intro'));
    const pair = document.createElement('div');
    pair.className = 'comparison-study';
    const shared = sharedIds(left, right);
    for (const kind of [type, comparison]) {
      const s = specimenCatalog[kind],
        article = document.createElement('article'),
        img = document.createElement('img');
      img.src = `assets/specimens/${kind}.webp`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = `Generated illustration of ${s.name}`;
      article.append(text('p', s.subtitle, 'eyebrow'), text('h3', s.name), img, text('p', s.note), text('h4', 'Specialized in this pair'));
      const unique = s.ids.filter(id => !shared.some(other => structureClass(id) === structureClass(other))),
        tags = document.createElement('div');
      tags.className = 'structure-tags';
      for (const id of unique) tags.append(button(structures.find(q => q.id === id).name, () => jump(kind, id)));
      if (!unique.length) tags.append(text('p', 'No additional structure types in this model.'));
      article.append(tags, button('Explore this cell ↗', () => jump(kind)));
      pair.append(article)
    }
    body.append(pair, text('h3', 'Shared structure types'));
    const common = document.createElement('div');
    common.className = 'structure-tags';
    for (const id of shared) common.append(button(structures.find(q => q.id === id).name, () => jump(type, id)));
    body.append(common)
  }

  function microscope(body) {
    body.append(text('p', 'Use the original study schematics as study prompts, or add a microscope image from your device. Added images are shown only in this page and are never uploaded. No scale measurements are inferred.', 'tool-intro'));
    const modes = document.createElement('div');
    modes.className = 'microscope-modes';
    for (let i = 0; i < 3; i++) {
      const b = button(['Cell pattern', 'Stain study', 'Membrane study'][i], () => {
        imageMode = i;
        imageZoom = 1;
        renderTool()
      });
      b.setAttribute('aria-pressed', String(imageMode === i));
      modes.append(b)
    }
    if (images.has(type)) {
      const b = button('Your image', () => {
        imageMode = 3;
        imageZoom = 1;
        renderTool()
      });
      b.setAttribute('aria-pressed', String(imageMode === 3));
      modes.append(b)
    }
    body.append(modes);
    const stage = document.createElement('div');
    stage.className = 'microscope-stage';
    stage.id = 'microscope-stage';
    const art = document.createElement('div');
    art.id = 'microscope-art';
    if (images.has(type) && imageMode === 3) {
      const img = document.createElement('img');
      img.src = images.get(type).url;
      img.alt = 'Locally added study image: ' + images.get(type).name;
      art.append(img)
    } else art.innerHTML = tissueSVG(type, imageMode);
    art.style.transform = `scale(${imageZoom})`;
    stage.append(art);
    body.append(stage, text('p', images.has(type) && imageMode === 3 ? 'LOCAL IMAGE / ' + images.get(type).name : 'SCHEMATIC / ' + (imageMode === 2 ? 'A phospholipid bilayer with an embedded protein. Heads face the watery surroundings; tails face inward.' : observations[type][1]), 'microscope-caption'));
    const controls = document.createElement('div');
    controls.className = 'microscope-controls';
    const zoom = text('output', Math.round(imageZoom * 100) + '%');

    function magnify(delta) {
      imageZoom = Math.min(3, Math.max(1, imageZoom + delta));
      art.style.transform = `scale(${imageZoom})`;
      zoom.textContent = Math.round(imageZoom * 100) + '%'
    }
    controls.append(button('−', () => magnify(-.25)), zoom, button('+', () => magnify(.25)), button('Reset zoom', () => {
      imageZoom = 1;
      magnify(0)
    }));
    const label = text('label', 'Add your image', 'image-picker');
    label.htmlFor = 'microscope-file';
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'microscope-file';
    input.accept = 'image/png,image/jpeg,image/webp';
    input.className = 'sr-only';
    const message = text('p', '', 'image-message');
    message.setAttribute('role', 'status');
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) {
        message.textContent = 'Choose a PNG, JPEG, or WebP image smaller than 12 MB.';
        return
      }
      const url = URL.createObjectURL(file),
        kind = type,
        check = new Image();
      check.onload = () => {
        const previous = images.get(kind);
        if (previous) URL.revokeObjectURL(previous.url);
        images.set(kind, {
          url,
          name: file.name
        });
        imageMode = 3;
        imageZoom = 1;
        if (dialog.open && activeTool === 'microscope') renderTool()
      };
      check.onerror = () => {
        URL.revokeObjectURL(url);
        message.textContent = 'This image could not be opened.'
      };
      check.src = url
    };
    controls.append(label, input);
    if (images.has(type)) controls.append(button('Remove local image', () => {
      URL.revokeObjectURL(images.get(type).url);
      images.delete(type);
      imageMode = 0;
      renderTool()
    }));
    body.append(controls, message)
  }

  function refresh() {
    document.body.dataset.quiz = String(quiz);
    const key = type + ':' + selected;
    el('save-structure').disabled = quiz || !selected;
    el('note-structure').disabled = quiz || !selected;
    el('save-structure').textContent = saved.has(key) ? '★ Saved structure' : '☆ Save structure';
    el('save-structure').setAttribute('aria-pressed', String(saved.has(key)));
    el('snapshot-cell').disabled = artworkMode !== '3d' || quiz;
    el('export-cell').disabled = artworkMode !== '3d' || quiz;
    paintDesk();
    announce('')
  }
  for (const b of document.querySelectorAll('[data-studio]')) b.onclick = () => open(b.dataset.studio);
  window.CellStudio = {
    refresh
  };
  refresh();
})();
