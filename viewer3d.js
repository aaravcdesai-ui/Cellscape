import * as T from 'three';
import {
  OrbitControls
} from './vendor/three/OrbitControls.js';
import {
  buildCellModel
} from './cell-models.js';
import {
  explodedRig,
  closeupLessons
} from './anatomy-motion.js';
import {
  organizeGlb,
  fitToBox
} from './glb-parts.js';
const host = document.querySelector('#viewer3d');
const status = document.querySelector('#viewer3d-status');
const homeViewport = host.parentElement;
let lessonMode = false,
  lessonStage = -1,
  cargo = null,
  carrier = null,
  lessonTrail = null;
const waterBases = new Map();
let renderer, scene, camera, controls, model = null,
  currentKind = null,
  activeId = null,
  isolated = false,
  cutaway = true,
  showLabels = true,
  quizMode = false;
let dirty = true,
  enabled = false,
  baseDistance = 10,
  pointerStart = null,
  hovered = null,
  lastZoom = null,
  flight = null,
  focusedView = false;
let rig = null,
  spread = 0,
  spreadTarget = 0,
  spreadFlight = null,
  closeupPlaying = false,
  closeupTime = 0,
  closeupLast = null,
  closeupPhase = -1,
  marker = null;
let populationCloud = null,
  populationCarriers = null;
const selectable = [],
  labelNodes = new Map(),
  labelAnchors = new Map();
const raycaster = new T.Raycaster(),
  pointer = new T.Vector2();
const labels = document.createElement('div');
labels.className = 'three-labels';
const leaderLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
leaderLayer.classList.add('three-leaders');
leaderLayer.setAttribute('aria-hidden', 'true');
labels.append(leaderLayer);
const leaderNodes = new Map();

const explodeButton = document.createElement('button');
explodeButton.id = 'explode-3d';
explodeButton.textContent = 'Exploded view';
explodeButton.setAttribute('aria-pressed', 'false');
document.querySelector('.three-tools').append(explodeButton);
const animateButton = document.createElement('button');
animateButton.id = 'animate-organelle';
animateButton.textContent = 'Animate organelle';
animateButton.title = 'Select a nucleus, mitochondrion, or chloroplast';
document.querySelector('.three-tools').append(animateButton);
const study = document.createElement('section');
study.id = 'anatomy-player';
study.hidden = true;
study.setAttribute('aria-label', 'Animated organelle close-up');
study.innerHTML = '<div class="anatomy-player-heading"><strong id="anatomy-animation-title"></strong><button id="anatomy-animation-close" aria-label="Close organelle animation">×</button></div><div id="anatomy-animation-steps" aria-label="Animation stages"></div><p id="anatomy-animation-caption" role="status"></p><div class="anatomy-playback"><button id="anatomy-play">Play</button><button id="anatomy-restart">Restart</button><span>Illustrative sequence · Not to scale</span></div>';
host.append(study);

function stopCloseup() {
  closeupPlaying = false;
  closeupLast = null;
  study.hidden = true;
  if (marker) marker.visible = false;
  host.dataset.anatomyPlaying = 'false'
}

function clearStudy() {
  stopCloseup();
  spread = spreadTarget = 0;
  spreadFlight = null;
  rig?.set(0);
  explodeButton.setAttribute('aria-pressed', 'false');
  explodeButton.textContent = 'Exploded view';
  host.dataset.exploded = '0'
}

function syncStudy() {
  explodeButton.disabled = quizMode || lessonMode;
  animateButton.disabled = quizMode || lessonMode || !closeupLessons[activeId];
}

function beginCloseup() {
  if (!closeupLessons[activeId] || quizMode || lessonMode) return;
  focusStructure();
  closeupTime = 0;
  closeupPhase = -1;
  study.hidden = false;
  const previousFlight = flight;
  fit(false, true);
  if (previousFlight) {
    flight = {
      ...previousFlight,
      toPosition: camera.position.clone(),
      toTarget: controls.target.clone()
    };
    camera.position.copy(previousFlight.fromPosition);
    controls.target.copy(previousFlight.fromTarget)
  }
  document.getElementById('anatomy-animation-title').textContent = closeupLessons[activeId].title;
  const steps = document.getElementById('anatomy-animation-steps');
  steps.replaceChildren();
  closeupLessons[activeId].steps.forEach((s, i) => {
    const b = document.createElement('button');
    b.textContent = (i + 1) + '. ' + s[0];
    b.onclick = () => {
      closeupPlaying = false;
      closeupTime = i * 2600;
      paintCloseup();
    };
    steps.append(b)
  });
  if (!marker) {
    marker = new T.Mesh(new T.SphereGeometry(.055, 16, 12), new T.MeshStandardMaterial({
      color: 0xf2cb66,
      emissive: 0xa87819,
      emissiveIntensity: .5
    }));
    marker.name = 'illustrative-process-marker';
    scene.add(marker)
  }
  marker.visible = true;
  paintCloseup();
}

function paintCloseup() {
  const lesson = closeupLessons[activeId],
    anchor = labelAnchors.get(activeId);
  if (study.hidden || !lesson || !anchor) return;
  const phase = Math.min(2, Math.floor(closeupTime / 2600)),
    fraction = Math.min(1, (closeupTime % 2600) / 1800);
  let points = lesson.points.map(p => new T.Vector3(...p));
  if (activeId === 'nucleus' && anchor.userData.exportPore) {
    const pore = new T.Vector3(...anchor.userData.exportPore);
    points = [pore.clone().multiplyScalar(.45), pore, pore.clone().multiplyScalar(1.4)]
  }
  const local = points[Math.max(0, phase - 1)].clone().lerp(points[phase], fraction);
  model.updateMatrixWorld(true);
  marker.position.copy(anchor.localToWorld(local));
  marker.scale.setScalar(activeId === 'nucleus' ? 1.7 : 1);
  if (phase !== closeupPhase) {
    closeupPhase = phase;
    document.getElementById('anatomy-animation-caption').textContent = lesson.steps[phase][1];
    [...document.getElementById('anatomy-animation-steps').children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === phase)))
  }
  document.getElementById('anatomy-play').textContent = closeupPlaying ? 'Pause' : closeupTime >= 7799 ? 'Replay' : 'Play';
  host.dataset.anatomyPlaying = String(closeupPlaying);
  host.dataset.anatomyPhase = String(phase);
  dirty = true;
}

function tickStudy(now) {
  if (spreadFlight) {
    const t = Math.min(1, (now - spreadFlight.start) / 900),
      e = t * t * (3 - 2 * t);
    spread = spreadFlight.from + (spreadTarget - spreadFlight.from) * e;
    rig.set(spread);
    host.dataset.exploded = spread.toFixed(3);
    dirty = true;
    if (t === 1) {
      spreadFlight = null;
      if (!spreadTarget) {
        const fromPosition = camera.position.clone(),
          fromTarget = controls.target.clone();
        fit(false);
        flight = {
          fromPosition,
          fromTarget,
          toPosition: camera.position.clone(),
          toTarget: controls.target.clone(),
          start: performance.now()
        };
        camera.position.copy(fromPosition);
        controls.target.copy(fromTarget)
      }
    }
  }
  if (closeupPlaying) {
    if (closeupLast !== null) closeupTime = Math.min(7799, closeupTime + Math.min(100, now - closeupLast));
    closeupLast = now;
    if (closeupTime >= 7799) closeupPlaying = false;
    paintCloseup()
  }
}
explodeButton.onclick = () => {
  if (!model || quizMode || lessonMode) return;
  stopCloseup();
  focusedView = false;
  isolated = false;
  cutaway = true;
  flight = null;
  controls.autoRotate = false;
  spreadTarget = spreadTarget ? 0 : 1;
  applySelection();
  if (spreadTarget) {
    rig.set(1);
    fit(false);
    rig.set(spread)
  }
  explodeButton.setAttribute('aria-pressed', String(!!spreadTarget));
  explodeButton.textContent = spreadTarget ? 'Reassemble cell' : 'Exploded view';
  announce(spreadTarget ? 'Structures separated for study. Positions and distances are illustrative.' : 'Returning structures to their assembled positions.');
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
    spread = spreadTarget;
    rig.set(spread);
    host.dataset.exploded = String(spread);
    fit(false)
  } else spreadFlight = {
    from: spread,
    start: performance.now()
  };
  dirty = true;
};
animateButton.onclick = beginCloseup;
document.getElementById('anatomy-animation-close').onclick = () => {
  stopCloseup();
  reset()
};
document.getElementById('anatomy-play').onclick = () => {
  if (closeupTime >= 7799) closeupTime = 0;
  closeupPlaying = !closeupPlaying;
  closeupLast = null;
  paintCloseup()
};
document.getElementById('anatomy-restart').onclick = () => {
  closeupPlaying = false;
  closeupTime = 0;
  closeupPhase = -1;
  paintCloseup()
};

function idFor(object) {
  for (let node = object; node; node = node.parent)
    if (node.userData.structureId) return node.userData.structureId;
  return null
}

function announce(message) {
  document.querySelector('#viewer3d-live').textContent = message
}

function syncButtons() {
  for (const [id, on] of [
      ['isolate-3d', isolated],
      ['shell-3d', !cutaway],
      ['spin-3d', controls?.autoRotate]
    ]) document.getElementById(id)?.setAttribute('aria-pressed', String(Boolean(on)));
  document.querySelector('#isolate-3d').disabled = !activeId || quizMode;
  document.querySelector('#focus-3d').disabled = !activeId || quizMode;
}

function reset() {
  if (!model || !camera) return;
  clearStudy();
  flight = null;
  focusedView = false;
  controls.autoRotate = false;
  isolated = false;
  cutaway = true;
  applySelection();
  fit(true);
  syncButtons();
  announce('View reset.');
  dirty = true
}

function fit(defaultDirection = false, selectionOnly = false) {
  if (!model) return;
  const focusAnchor = selectionOnly ? labelAnchors.get(activeId) : null;
  const included = o => {
    if (!selectionOnly) return true;
    for (let node = o; node; node = node.parent)
      if (node === focusAnchor) return true;
    return false
  };
  const box = new T.Box3();
  model.traverse(o => {
    if (o.isMesh && o.visible && included(o) && (!o.userData.closedOnly || !cutaway || (isolated && idFor(o) === activeId))) box.expandByObject(o)
  });
  if (box.isEmpty()) box.setFromObject(model);
  const center = box.getCenter(new T.Vector3());
  const direction = defaultDirection ? new T.Vector3(...(currentKind === 'plant' ? [.65, 1.25, 1.5] : currentKind === 'epithelial' ? [.48, .35, 1.6] : [.65, 1.05, 1.5])).normalize() : camera.position.clone().sub(controls.target).normalize();
  const right = new T.Vector3().crossVectors(camera.up, direction).normalize(),
    up = new T.Vector3().crossVectors(direction, right).normalize();
  const tanY = Math.tan(T.MathUtils.degToRad(camera.fov / 2)),
    tanX = tanY * camera.aspect;
  let distance = 0;
  const fittedPoints = [];
  const account = world => {
    fittedPoints.push(world.clone());
    const corner = world.sub(center),
      depth = corner.dot(direction);
    distance = Math.max(distance, Math.abs(corner.dot(right)) / tanX + depth, Math.abs(corner.dot(up)) / tanY + depth)
  };
  model.updateMatrixWorld(true);
  model.traverse(o => {
    if (!o.isMesh || !o.visible || (o.userData.closedOnly && cutaway && !isolated) || !included(o)) return;
    if (o.isInstancedMesh) {
      if (isolated || selectionOnly) {
        const bounds = new T.Box3().setFromObject(o);
        for (const x of [bounds.min.x, bounds.max.x])
          for (const y of [bounds.min.y, bounds.max.y])
            for (const z of [bounds.min.z, bounds.max.z]) account(new T.Vector3(x, y, z))
      }
      return;
    }
    const vertices = o.geometry.getAttribute('position'),
      stride = Math.max(1, Math.floor(vertices.count / 350));
    for (let i = 0; i < vertices.count; i += stride) {
      const world = new T.Vector3().fromBufferAttribute(vertices, i).applyMatrix4(o.matrixWorld);
      if (cutaway && currentKind === 'bacteria' && o.userData.openOnly && world.y > .12) continue;
      account(world)
    }
  });
  // Nothing visible to frame (e.g. a structure a loaded model does not include): fall back to the
  // bounding box corners, so the camera never receives NaN from empty min/max values.
  if (!fittedPoints.length) {
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z]) account(new T.Vector3(x, y, z))
  }
  distance = Math.max(1, distance * 1.08);
  // Center the actual visible geometry rather than its conservative bounding box.
  for (let iteration = 0; iteration < 3; iteration++) {
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(direction, distance);
    camera.lookAt(center);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    for (const point of fittedPoints) {
      const ndc = point.clone().project(camera);
      minX = Math.min(minX, ndc.x);
      maxX = Math.max(maxX, ndc.x);
      minY = Math.min(minY, ndc.y);
      maxY = Math.max(maxY, ndc.y)
    }
    const midX = (minX + maxX) / 2,
      midY = (minY + maxY) / 2;
    center.addScaledVector(right, midX * distance * tanX).addScaledVector(up, midY * distance * tanY);
    const occupancy = Math.max((maxX - minX) / 2, (maxY - minY) / 2);
    distance *= T.MathUtils.clamp(occupancy / (selectionOnly ? .66 : .91), .7, 1.35);
  }
  if (selectionOnly && !study.hidden) {
    const available = Math.max(.35, 1 - (study.offsetHeight + 24) / host.clientHeight);
    distance *= Math.max(1, .72 / available);
    center.addScaledVector(up, -distance * tanY * (1 - available));
  }
  baseDistance = distance;
  controls.target.copy(center);
  camera.position.copy(center).addScaledVector(direction, baseDistance);
  camera.near = Math.max(.01, baseDistance / 1000);
  camera.far = baseDistance * 20;
  camera.updateProjectionMatrix();
  controls.minDistance = baseDistance / 4;
  controls.maxDistance = baseDistance * 2.5;
  controls.update();
  controls.saveState();
  emitZoom();
  dirty = true;
}

function focusStructure() {
  if (!model || !activeId || quizMode) return;
  clearStudy();
  controls.autoRotate = false;
  flight = null;
  focusedView = true;
  isolated = true;
  applySelection();
  const fromPosition = camera.position.clone(),
    fromTarget = controls.target.clone(),
    oldMax = controls.maxDistance;
  fit(false, true);
  controls.maxDistance = Math.max(oldMax, controls.maxDistance);
  const toPosition = camera.position.clone(),
    toTarget = controls.target.clone();
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    camera.position.copy(fromPosition);
    controls.target.copy(fromTarget);
    controls.update();
    flight = {
      fromPosition,
      fromTarget,
      toPosition,
      toTarget,
      start: performance.now()
    };
  }
  syncButtons();
  announce('Focused on ' + (window.CellAtlasBridge?.nameFor(activeId) || activeId) + '. Surrounding structures are hidden. Reset view returns to the whole cell.');
  dirty = true;
}

function resize() {
  if (!renderer || !host.clientWidth || !host.clientHeight) return;
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  camera.aspect = host.clientWidth / host.clientHeight;
  camera.updateProjectionMatrix();
  fit(false, focusedView);
  dirty = true;
}

function emitZoom() {
  if (!camera) return;
  const factor = baseDistance / camera.position.distanceTo(controls.target);
  if (lastZoom !== null && Math.abs(lastZoom - factor) < .002) return;
  lastZoom = factor;
  window.dispatchEvent(new CustomEvent('cell3d-zoom', {
    detail: {
      factor
    }
  }))
}

function zoomTo(factor) {
  if (!camera || !model) return;
  flight = null;
  const direction = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(controls.target).addScaledVector(direction, baseDistance / T.MathUtils.clamp(factor, .4, 4));
  controls.update();
  dirty = true
}

function disposeModel() {
  clearStudy();
  flight = null;
  if (!model) return;
  scene.remove(model);
  const geometries = new Set(),
    materials = new Set();
  model.traverse(o => {
    if (o.geometry) geometries.add(o.geometry);
    if (o.material) {
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m)
    }
  });
  geometries.forEach(g => g.dispose());
  materials.forEach(m => {
    // GLB materials carry their own texture maps; procedural ones share the surface texture.
    for (const value of Object.values(m))
      if (value?.isTexture) value.dispose();
    m.dispose()
  });
  model.userData.texture?.dispose();
  model = null;
  selectable.length = 0;
  labelAnchors.clear();
  for (const node of labelNodes.values()) node.remove();
  labelNodes.clear();
  for (const node of leaderNodes.values()) node.remove();
  leaderNodes.clear();
}

// Artist-made models: models/manifest.json maps a specimen to a GLB file, e.g.
// {"plant": {"file": "plant.glb", "credit": "…"}}. Listed specimens first show the procedural
// model, then swap to the GLB once it has loaded; unlisted ones stay procedural.
let glbManifest = null,
  glbLoader = null,
  glbRequest = 0;

// The public build stamps this URL with a hash of the artwork and models (?v=…); GLB requests
// reuse that query so a cached old file never pairs with a new manifest.
function modelManifest() {
  glbManifest ||= fetch('models/manifest.json').then(async r => r.ok ? {
    entries: await r.json(),
    query: new URL(r.url).search
  } : {
    entries: {},
    query: ''
  }).catch(() => ({
    entries: {},
    query: ''
  }));
  return glbManifest
}

async function loaderForGlb() {
  if (!glbLoader) {
    glbLoader = Promise.all([import('./vendor/three/GLTFLoader.js'), import('./vendor/three/meshopt_decoder.module.js')]).then(([{
      GLTFLoader
    }, {
      MeshoptDecoder
    }]) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder))
  }
  return glbLoader
}

async function upgradeToGlb(kind) {
  const request = ++glbRequest;
  const {
    entries,
    query
  } = await modelManifest(), entry = entries[kind];
  if (!entry?.file || request !== glbRequest) return;
  try {
    const loader = await loaderForGlb(),
      gltf = await loader.loadAsync('models/' + entry.file + query);
    // Skip if the visitor moved to another specimen or a lesson while it loaded.
    if (request !== glbRequest || currentKind !== kind || lessonMode) return;
    const reference = new T.Box3().setFromObject(model),
      ids = typeof specimenCatalog !== 'undefined' ? specimenCatalog[kind]?.ids || [] : [],
      upgraded = fitToBox(organizeGlb(gltf.scene, ids, kind), reference);
    upgraded.userData.credit = entry.credit || '';
    disposeModel();
    install(upgraded, kind, false);
    rig.set(spread);
    // fitToBox only matches width and floor, so frame the new shape, unless the visitor is
    // already focused on one structure.
    if (!focusedView && !isolated) fit(true);
    applySelection();
    host.dataset.modelSource = 'glb';
  } catch (error) {
    console.warn(`Could not load models/${entry.file}; keeping the procedural ${kind} model.`, error)
  }
}

// The GLB (1–2 MB) waits so it doesn't compete with the first page load: it starts once the
// page has loaded and the browser is idle, or as soon as the visitor touches the viewer or
// picks another specimen. With Data Saver or a slow connection it waits for that interaction.
let glbAllowed = false,
  builtOnce = false;

function allowGlb() {
  if (glbAllowed) return;
  glbAllowed = true;
  if (currentKind && !lessonMode && host.dataset.modelSource === 'procedural') upgradeToGlb(currentKind);
}

for (const type of ['pointerdown', 'wheel', 'keydown', 'touchstart']) host.addEventListener(type, allowGlb, {
  once: true,
  passive: true
});
{
  const connection = navigator.connection,
    slow = connection && (connection.saveData || /2g|3g/.test(connection.effectiveType || ''));
  const whenIdle = () => setTimeout(() => (window.requestIdleCallback || (f => f()))(allowGlb, {
    timeout: 3000
  }), 1500);
  if (!slow) document.readyState === 'complete' ? whenIdle() : addEventListener('load', whenIdle, {
    once: true
  });
}

function build(kind) {
  disposeModel();
  install(buildCellModel(kind), kind, true);
  host.dataset.modelSource = 'procedural';
  // Picking another specimen is an interaction too.
  if (builtOnce && !lessonMode) glbAllowed = true;
  builtOnce = true;
  if (!lessonMode && glbAllowed) upgradeToGlb(kind);
  else glbRequest++;
}

function install(newModel, kind, reset) {
  model = newModel;
  scene.add(model);
  rig = explodedRig(model);
  currentKind = kind;
  if (reset) {
    focusedView = false;
    isolated = false;
    cutaway = true
  }
  model.traverse(o => {
    if (o.isMesh) {
      selectable.push(o);
      const id = idFor(o);
      if (id && !labelAnchors.has(id)) labelAnchors.set(id, o);
      if (o.material) {
        for (const mat of Array.isArray(o.material) ? o.material : [o.material]) {
          mat.userData.baseColor = mat.color.clone();
          mat.userData.baseOpacity = mat.opacity
        }
      }
    }
  });
  // Prefer a structure's group origin over the first pore or ribbon vertex.
  model.traverse(o => {
    if (o.isGroup && o.userData.structureId) labelAnchors.set(o.userData.structureId, o)
  });
  host.querySelector('canvas').setAttribute('aria-label', kind + ' cell 3D model. Drag to rotate; scroll to zoom. Arrow keys rotate, Shift plus arrows pan, plus and minus zoom, Home resets.');
  // A swapped-in GLB is fitted to the procedural model's box, so the camera can stay put.
  if (reset) fit(true);
  dirty = true;
}

function applySelection() {
  if (!model) return;
  model.traverse(o => {
    if (!o.isMesh) return;
    const id = idFor(o),
      matches = id === activeId || (activeId === 'nucleus' && id === 'nucleolus');
    o.visible = (!o.userData.closedOnly || !cutaway || (isolated && matches)) && (!o.userData.openOnly || cutaway) && (!isolated || matches);
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const mat of mats) {
      if (mat.emissive) {
        mat.emissive.set(matches && !quizMode ? 0x342037 : 0x000000);
        mat.emissiveIntensity = matches && !quizMode ? 0.17 : 0
      }
    }
  });
  const ground = scene.getObjectByName('specimen-ground');
  if (ground) ground.visible = !isolated;
  host.dataset.isolated = String(isolated);
  host.dataset.selection = activeId || '';
  dirty = true;
  syncButtons();
  updateLabels();
}
const internalFeatures = {
  nucleus: [
    ['Nuclear envelope', [.8, .25, .1], 0],
    ['Nuclear pores', [.45, .7, .25], 1],
    ['Chromatin', [-.25, .05, .2], 2]
  ],
  mitochondrion: [
    ['Outer membrane', [.66, 0, .08], 0],
    ['Cristae', [-.12, .15, 0], 1],
    ['Matrix', [.18, -.1, .1], 2]
  ],
  chloroplast: [
    ['Double envelope', [.73, 0, .1], 0],
    ['Thylakoid stacks', [-.15, .18, 0], 1],
    ['Stroma', [.3, -.02, .24], 2]
  ]
};

function showInternalLabels(width, height) {
  const anchor = labelAnchors.get(activeId);
  if (!anchor) return;
  internalFeatures[activeId].forEach(([name, position, part], i) => {
    const id = 'internal-' + i;
    let node = labelNodes.get(id),
      path = leaderNodes.get(id);
    if (!node) {
      node = document.createElement('button');
      node.type = 'button';
      node.className = 'three-label selected';
      labels.append(node);
      labelNodes.set(id, node)
    }
    if (!path) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      leaderLayer.append(path);
      leaderNodes.set(id, path)
    }
    node.textContent = name;
    node.setAttribute('aria-label', 'Inspect ' + name);
    node.onclick = () => window.dispatchEvent(new CustomEvent('cell3d-feature', {
      detail: {
        part
      }
    }));
    node.hidden = false;
    const point = anchor.localToWorld(new T.Vector3(...position)).project(camera),
      x = (point.x * .5 + .5) * width,
      y = (-point.y * .5 + .5) * height;
    const left = i !== 1,
      labelX = left ? 12 : width - node.offsetWidth - 12,
      labelY = study.hidden ? height * (.2 + i * .26) : height * (.14 + i * .18);
    node.style.left = labelX + 'px';
    node.style.top = labelY + 'px';
    const end = left ? labelX + node.offsetWidth : labelX;
    path.setAttribute('d', `M${x},${y}L${end+(left?12:-12)},${labelY+14}H${end}`);
    path.setAttribute('class', 'selected');
    path.style.display = '';
  });
  host.dataset.visibleLabels = '3';
}

function updateLabels() {
  if (!model || !camera) return;
  const width = host.clientWidth,
    height = host.clientHeight,
    narrow = width < 440;
  const priority = lessonMode ? [activeId] : spread > .01 ? [activeId, ...labelAnchors.keys()] : [activeId, 'nucleus', 'vacuole', 'mitochondrion', 'chloroplast', 'nucleoid', 'axon', 'myofibril', 'microvilli'];
  const limit = spread > .01 ? (narrow ? 3 : 6) : narrow ? 1 : width < 620 ? 2 : 3,
    chosen = [];
  leaderLayer.setAttribute('viewBox', `0 0 ${width} ${height}`);
  for (const node of labelNodes.values()) node.hidden = true;
  for (const path of leaderNodes.values()) path.style.display = 'none';
  if (!showLabels || quizMode) return;
  if (focusedView && !lessonMode && internalFeatures[activeId]) {
    showInternalLabels(width, height);
    return;
  }
  for (const id of [...new Set(priority)]) {
    if (!id || !labelAnchors.has(id) || chosen.length >= limit || ((isolated || focusedView) && id !== activeId)) continue;
    const anchor = labelAnchors.get(id);
    let p = anchor.getWorldPosition(new T.Vector3());
    if (anchor.isInstancedMesh) {
      const matrix = new T.Matrix4();
      anchor.getMatrixAt(0, matrix);
      p.setFromMatrixPosition(matrix).applyMatrix4(anchor.matrixWorld)
    }
    p.project(camera);
    const x = (p.x * .5 + .5) * width,
      y = (-p.y * .5 + .5) * height;
    if (p.z > 1 || p.z < -1 || x < 6 || x > width - 6 || y < 6 || y > height - 6) continue;
    if (id !== activeId && spread < .01) {
      raycaster.setFromCamera(new T.Vector2(p.x, p.y), camera);
      const front = raycaster.intersectObjects(selectable, false).find(hit => hit.object.visible && !(hit.object.userData.closedOnly && hit.object.material.opacity < .3) && !(cutaway && currentKind === 'bacteria' && hit.object.userData.openOnly && hit.point.y > .12));
      if (front && idFor(front.object) !== id && !(id === 'nucleus' && idFor(front.object) === 'nucleolus')) continue;
    }
    let node = labelNodes.get(id),
      path = leaderNodes.get(id);
    if (!node) {
      node = document.createElement('button');
      node.className = 'three-label';
      node.dataset.structure = id;
      node.type = 'button';
      node.onclick = () => dispatchSelection(id);
      labels.append(node);
      labelNodes.set(id, node)
    }
    if (!path) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      leaderLayer.append(path);
      leaderNodes.set(id, path)
    }
    const name = window.CellAtlasBridge?.nameFor(id) || id;
    node.textContent = name;
    node.setAttribute('aria-label', 'Select ' + name);
    node.classList.toggle('selected', id === activeId);
    node.hidden = false;
    const w = Math.min(node.offsetWidth, width - 28),
      h = node.offsetHeight,
      left = x < width / 2;
    node.dataset.side = left ? 'left' : 'right';
    chosen.push({
      id,
      node,
      path,
      x,
      y,
      w,
      h,
      left,
      labelY: T.MathUtils.clamp(y - 22, h / 2 + 12, height - h / 2 - 12)
    });
  }
  // Reserve a little vertical space around each label, keeping selection first.
  const placed = [];
  for (const item of chosen) {
    const candidates = [item.labelY, ...Array.from({
      length: 8
    }, (_, i) => item.labelY + (i % 2 ? -1 : 1) * (Math.floor(i / 2) + 1) * (item.h + 12))];
    const good = candidates.find(y => y >= item.h / 2 + 10 && y <= height - item.h / 2 - 10 && placed.every(other => other.left !== item.left || Math.abs(y - other.labelY) > (item.h + other.h) / 2 + 10));
    if (good === undefined) {
      item.node.hidden = true;
      continue
    }
    item.labelY = good;
    placed.push(item);
    const left = item.left ? 12 : width - item.w - 12,
      endX = item.left ? left + item.w : left,
      elbow = endX + (item.left ? 12 : -12);
    item.node.style.left = left + 'px';
    item.node.style.top = (good - item.h / 2) + 'px';
    item.path.setAttribute('d', `M${item.x.toFixed(1)},${item.y.toFixed(1)} L${elbow.toFixed(1)},${good.toFixed(1)} H${endX.toFixed(1)}`);
    item.path.setAttribute('class', item.id === activeId ? 'selected' : '');
    item.path.style.display = '';
  }
  host.dataset.visibleLabels = String(placed.length);
}

function pick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(selectable, false);
  for (const hit of hits) {
    if (!hit.object.visible) continue;
    let visible = true;
    for (let parent = hit.object.parent; parent; parent = parent.parent)
      if (!parent.visible) visible = false;
    if (!visible) continue;
    if (hit.object.userData.closedOnly && hit.object.material.opacity < .3) continue;
    // Respect the clipping plane of the open bacterial envelope when picking.
    if (cutaway && currentKind === 'bacteria' && hit.object.userData.openOnly && hit.point.y > .12) continue;
    const id = idFor(hit.object);
    if (id && window.CellAtlasBridge?.hasStructure(id)) return id;
  }
  return null;
}

function dispatchSelection(id) {
  if (lessonMode) return;
  window.dispatchEvent(new CustomEvent('cell3d-select', {
    detail: {
      id
    }
  }))
}

// A small warm photo studio, rendered once into a prefiltered environment map: a dim room with a
// large softbox above-left (matching the key light), a cool rim panel and a low front fill.
function studioEnvironment(renderer) {
  const studio = new T.Scene(),
    geometry = new T.PlaneGeometry(1, 1),
    room = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({
      color: 0x6f6a60,
      side: T.BackSide
    }));
  room.scale.set(32, 20, 32);
  room.position.y = 6;
  studio.add(room);
  const panel = (color, strength, position, size) => {
    const light = new T.Mesh(geometry, new T.MeshBasicMaterial({
      color: new T.Color(color).multiplyScalar(strength),
      side: T.DoubleSide
    }));
    light.position.set(...position);
    light.scale.set(size[0], size[1], 1);
    light.lookAt(0, 0, 0);
    studio.add(light)
  };
  panel(0xfff1dc, 7, [-6, 12, 7], [11, 7]);
  panel(0xdbe3ff, 2.6, [11, 5, -7], [6, 9]);
  panel(0xffffff, 1.4, [0, 2.5, 15], [16, 4]);
  panel(0xefe4cc, 1.1, [0, -9, 0], [24, 24]);
  const pmrem = new T.PMREMGenerator(renderer),
    texture = pmrem.fromScene(studio, .04).texture;
  pmrem.dispose();
  studio.traverse(o => {
    o.material?.dispose()
  });
  geometry.dispose();
  room.geometry.dispose();
  return texture
}

function init() {
  try {
    renderer = new T.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    // Neutral tone mapping keeps the specimen colours saturated (ACES washes them out).
    renderer.toneMapping = T.NeutralToneMapping;
    renderer.toneMappingExposure = .92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(38, 1, .05, 200);
    camera.position.set(10, 8, 12);
    // Image-based lighting gives soft reflections and form; the flat fill lights stay low so
    // surfaces keep contrast instead of looking chalky.
    scene.environment = studioEnvironment(renderer);
    scene.environmentIntensity = .85;
    scene.add(new T.HemisphereLight(0xfff8e9, 0xa8ac91, .45));
    const key = new T.DirectionalLight(0xfff4e0, 2.4);
    key.position.set(-5, 12, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, {
      left: -10,
      right: 10,
      top: 10,
      bottom: -10,
      near: 1,
      far: 35
    });
    key.shadow.bias = -.001;
    scene.add(key);
    const fill = new T.DirectionalLight(0xdad9ff, .8);
    fill.position.set(7, 5, -8);
    scene.add(fill);
    const ground = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({
      opacity: .12,
      depthWrite: false
    }));
    ground.name = 'specimen-ground';
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.85;
    ground.receiveShadow = true;
    scene.add(ground);
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.className = 'cell3d-canvas';
    host.append(canvas, labels);
    controls = new OrbitControls(camera, canvas);
    const touchMode = document.createElement('button');
    touchMode.id = 'touch-3d';
    touchMode.textContent = 'Touch mode: rotate';
    touchMode.setAttribute('aria-pressed', 'true');
    document.querySelector('.three-tools').append(touchMode);
    touchMode.onclick = () => {
      controls.enabled = !controls.enabled;
      canvas.style.touchAction = controls.enabled ? 'none' : 'pan-y';
      touchMode.textContent = controls.enabled ? 'Touch mode: rotate' : 'Touch mode: scroll page';
      touchMode.setAttribute('aria-pressed', String(controls.enabled));
      announce(controls.enabled ? 'Drag to rotate the cell.' : 'Drag over the cell to scroll the page. Use buttons or the structure list to explore.');
    };
    controls.enableDamping = true;
    controls.dampingFactor = .09;
    controls.rotateSpeed = .65;
    controls.panSpeed = .7;
    controls.zoomSpeed = .8;
    controls.autoRotateSpeed = .75;
    controls.maxPolarAngle = Math.PI - .08;
    controls.minPolarAngle = .08;
    controls.screenSpacePanning = true;
    controls.addEventListener('change', () => {
      dirty = true;
      emitZoom()
    });
    controls.addEventListener('start', () => {
      flight = null
    });
    canvas.addEventListener('pointerdown', e => {
      if (e.button === 0) {
        pointerStart = {
          x: e.clientX,
          y: e.clientY
        };
        controls.autoRotate = false;
        syncButtons()
      }
    });
    canvas.addEventListener('pointerup', e => {
      if (pointerStart && e.button === 0 && Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) < 5) {
        const id = pick(e);
        if (id) dispatchSelection(id)
      }
      pointerStart = null
    });
    canvas.addEventListener('pointercancel', () => pointerStart = null);
    canvas.addEventListener('pointermove', e => {
      if (e.buttons) return;
      const id = pick(e);
      if (id !== hovered) {
        hovered = id;
        canvas.style.cursor = id ? 'pointer' : 'grab'
      }
    });
    canvas.addEventListener('keydown', e => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        if (e.shiftKey) {
          const delta = new T.Vector3().setFromMatrixColumn(camera.matrix, e.key === 'ArrowLeft' || e.key === 'ArrowRight' ? 0 : 1);
          const sign = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 1;
          delta.multiplyScalar(camera.position.distanceTo(controls.target) * .025 * sign);
          camera.position.add(delta);
          controls.target.add(delta);
          controls.update();
          dirty = true;
          return;
        }
        const offset = camera.position.clone().sub(controls.target),
          spherical = new T.Spherical().setFromVector3(offset);
        if (e.key === 'ArrowLeft') spherical.theta -= .13;
        if (e.key === 'ArrowRight') spherical.theta += .13;
        if (e.key === 'ArrowUp') spherical.phi -= .13;
        if (e.key === 'ArrowDown') spherical.phi += .13;
        spherical.phi = T.MathUtils.clamp(spherical.phi, .1, Math.PI - .1);
        camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(spherical));
        controls.update();
        dirty = true;
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomTo(baseDistance / camera.position.distanceTo(controls.target) * 1.15)
      } else if (e.key === '-') {
        e.preventDefault();
        zoomTo(baseDistance / camera.position.distanceTo(controls.target) / 1.15)
      } else if (e.key === 'Home') {
        e.preventDefault();
        reset()
      }
    });
    canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      status.hidden = false;
      status.textContent = '3D rendering paused. Reload the page to restore it, or switch to Illustration.';
      enabled = false
    });
    new ResizeObserver(resize).observe(host);
    document.querySelector('#focus-3d').onclick = focusStructure;
    document.querySelector('#detail-focus').onclick = () => {
      if (artworkMode !== '3d') return;
      focusStructure();
      document.querySelector('#cell-viewport').scrollIntoView({
        block: 'center',
        behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth'
      })
    };
    document.querySelector('#isolate-3d').onclick = () => {
      flight = null;
      focusedView = false;
      isolated = !isolated;
      applySelection();
      fit(false);
      announce(isolated ? 'Showing the selected structure only.' : 'Showing the full specimen.')
    };
    document.querySelector('#shell-3d').onclick = () => {
      cutaway = !cutaway;
      applySelection();
      announce(cutaway ? 'Cutaway shell shown.' : 'Outer shell shown.')
    };
    document.querySelector('#spin-3d').onclick = () => {
      controls.autoRotate = !controls.autoRotate;
      syncButtons();
      dirty = true
    };
    document.querySelector('#reset-3d').onclick = reset;
    renderer.setAnimationLoop(() => {
      if (!enabled || document.hidden || (!lessonMode && document.body.dataset.page !== 'atlas')) {
        closeupLast = null;
        return;
      }
      tickStudy(performance.now());
      if (flight) {
        const t = Math.min(1, (performance.now() - flight.start) / 650),
          e = t * t * (3 - 2 * t);
        camera.position.lerpVectors(flight.fromPosition, flight.toPosition, e);
        controls.target.lerpVectors(flight.fromTarget, flight.toTarget, e);
        dirty = true;
        if (t === 1) flight = null
      }
      const changed = controls.update();
      if (dirty || changed || controls.autoRotate) {
        updateLabels();
        renderer.render(scene, camera);
        dirty = false
      }
    });
    status.hidden = true;
    return true;
  } catch (error) {
    status.hidden = false;
    status.textContent = '3D requires WebGL 2. Try a current Chrome or Safari browser, or use Illustration.';
    document.querySelector('#viewer3d').dataset.error = 'webgl';
    console.error('Cellscape 3D initialization failed:', error);
    return false;
  }
}
// Reuse the same real 3D geometry and GPU canvas for lessons and experiments.
const processPoints = [new T.Vector3(.7, .32, -.6), new T.Vector3(.5, .08, -.4), new T.Vector3(.85, -.05, .6), new T.Vector3(.45, -.2, 1.38), new T.Vector3(1.85, -.1, 1.7), new T.Vector3(3.8, .08, 1.0)];
const processIds = ['ribosomes', 'rough-er', 'vesicle', 'golgi', 'vesicle', 'membrane'];

function endLesson() {
  if (!lessonMode) return;
  lessonMode = false;
  lessonStage = -1;
  host.removeAttribute('data-lesson');
  homeViewport.append(host);
  if (populationCloud) populationCloud.visible = false;
  if (populationCarriers) populationCarriers.visible = false;
  if (cargo) cargo.visible = false;
  if (carrier) carrier.visible = false;
  if (lessonTrail) lessonTrail.visible = false;
  for (const [object, scale] of waterBases) object.scale.copy(scale);
  waterBases.clear();
  // A cell first built inside a lesson stays procedural there; upgrade it back in the atlas.
  if (glbAllowed && host.dataset.modelSource === 'procedural') upgradeToGlb(currentKind);
}

function setLesson({
  hostId,
  kind = 'animal',
  stage = 0,
  progress = 1,
  blocked = false,
  water = null
}) {
  if (!initialized) return false;
  const target = document.getElementById(hostId);
  if (!target) return false;
  if (!lessonMode) clearStudy();
  const moved = host.parentElement !== target,
    changed = kind !== currentKind;
  if (moved) target.append(host);
  flight = null;
  if (controls) controls.autoRotate = false;
  lessonMode = true;
  host.dataset.lesson = 'true';
  host.dataset.model = kind;
  enabled = true;
  if (changed) {
    waterBases.clear();
    build(kind);
    lessonStage = -1
  }
  if (populationCloud) populationCloud.visible = false;
  if (populationCarriers) populationCarriers.visible = false;
  isolated = false;
  focusedView = false;
  cutaway = true;
  quizMode = false;
  showLabels = true;
  const effectiveStage = blocked ? Math.min(stage, 1) : stage;
  const nextId = water !== null ? 'vacuole' : processIds[effectiveStage];
  if (activeId !== nextId || changed || lessonStage !== effectiveStage) {
    activeId = nextId;
    applySelection();
    lessonStage = effectiveStage
  }
  if (!cargo) {
    cargo = new T.Mesh(new T.IcosahedronGeometry(.13, 2), new T.MeshStandardMaterial({
      color: 0xeac063,
      emissive: 0x9f641a,
      emissiveIntensity: .3,
      roughness: .35
    }));
    cargo.name = 'lesson-protein';
    scene.add(cargo);
    carrier = new T.Mesh(new T.SphereGeometry(.28, 24, 16), new T.MeshStandardMaterial({
      color: 0xe7cf92,
      transparent: true,
      opacity: .28,
      depthWrite: false
    }));
    scene.add(carrier);
    const points = processPoints.map(p => p.clone()),
      path = new T.CatmullRomCurve3(points);
    lessonTrail = new T.Mesh(new T.TubeGeometry(path, 70, .012, 5, false), new T.MeshBasicMaterial({
      color: 0xb99b59,
      transparent: true,
      opacity: .5
    }));
    scene.add(lessonTrail);
  }
  cargo.visible = carrier.visible = lessonTrail.visible = water === null;
  if (water === null) {
    const from = processPoints[Math.max(0, effectiveStage - 1)],
      to = processPoints[effectiveStage],
      t = blocked && stage > 1 ? 1 : T.MathUtils.clamp(progress, 0, 1);
    cargo.position.lerpVectors(from, to, t);
    cargo.position.y += Math.sin(t * Math.PI) * .12;
    carrier.position.copy(cargo.position);
    carrier.visible = effectiveStage === 2 || effectiveStage === 4;
    host.dataset.cargoStage = String(effectiveStage);
    host.dataset.transport = blocked ? 'blocked' : 'normal';
  } else {
    model.traverse(o => {
      if (o.isMesh && ['vacuole', 'cytosol'].includes(idFor(o))) {
        if (!waterBases.has(o)) waterBases.set(o, o.scale.clone());
        const factor = idFor(o) === 'vacuole' ? (.58 + water * .42) : (.90 + water * .10);
        o.scale.copy(waterBases.get(o)).multiplyScalar(factor)
      }
    });
    host.dataset.water = water.toFixed(2);
  }
  if (changed || moved) {
    camera.aspect = host.clientWidth / Math.max(1, host.clientHeight);
    fit(true);
    resize()
  }
  dirty = true;
  return true;
}

function showBatch(batch) {
  if (populationCloud) populationCloud.visible = false;
  if (populationCarriers) populationCarriers.visible = false;
  if (!batch || !lessonMode || currentKind !== 'animal') return;
  if (!populationCloud) {
    populationCloud = new T.InstancedMesh(new T.SphereGeometry(.075, 12, 8), new T.MeshStandardMaterial({
      color: 0xe0ac43,
      emissive: 0x7c4c08,
      emissiveIntensity: .25
    }), 12);
    populationCloud.frustumCulled = false;
    scene.add(populationCloud);
    populationCarriers = new T.InstancedMesh(new T.SphereGeometry(.17, 12, 8), new T.MeshStandardMaterial({
      color: 0xdac894,
      transparent: true,
      opacity: .24,
      depthWrite: false
    }), 12);
    populationCarriers.frustumCulled = false;
    scene.add(populationCarriers)
  }
  populationCloud.visible = populationCarriers.visible = true;
  if (cargo) cargo.visible = false;
  if (carrier) carrier.visible = false;
  const dummy = new T.Object3D();
  batch.forEach((p, i) => {
    dummy.position.copy(processPoints[p.stage]).lerp(processPoints[Math.min(5, p.stage + 1)], p.progress);
    dummy.position.x += (i % 3 - 1) * .13;
    dummy.position.y += (Math.floor(i / 3) - 1.5) * .10;
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    populationCloud.setMatrixAt(i, dummy.matrix);
    dummy.scale.setScalar(p.stage === 2 || p.stage === 4 ? 1 : 0);
    dummy.updateMatrix();
    populationCarriers.setMatrixAt(i, dummy.matrix)
  });
  populationCloud.instanceMatrix.needsUpdate = true;
  populationCarriers.instanceMatrix.needsUpdate = true;
  host.dataset.cargoWaiting = String(batch.filter(p => p.waiting).length);
  host.dataset.cargoDelivered = String(batch.filter(p => p.delivered).length);
  dirty = true;
}
async function snapshot() {
  if (!renderer || !enabled || lessonMode || document.body.dataset.page !== 'atlas') return null;
  renderer.render(scene, camera);
  const source = renderer.domElement,
    output = document.createElement('canvas'),
    scale = source.width / host.clientWidth;
  output.width = source.width;
  output.height = source.height + Math.round(72 * scale);
  const ctx = output.getContext('2d');
  ctx.fillStyle = '#f6f4e9';
  ctx.fillRect(0, 0, output.width, output.height);
  ctx.drawImage(source, 0, 0);
  const bounds = host.getBoundingClientRect();
  ctx.save();
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#a18ba8';
  ctx.lineWidth = 1;
  for (const path of leaderNodes.values()) {
    const d = path.getAttribute('d');
    if (d && getComputedStyle(path).display !== 'none') ctx.stroke(new Path2D(d))
  }
  for (const node of labelNodes.values()) {
    if (node.hidden || !node.getClientRects().length) continue;
    const r = node.getBoundingClientRect(),
      x = r.left - bounds.left,
      y = r.top - bounds.top;
    if (x < 0 || y < 0 || x + r.width > host.clientWidth || y + r.height > host.clientHeight) continue;
    ctx.fillStyle = '#f7eef9';
    ctx.fillRect(x, y, r.width, r.height);
    ctx.strokeStyle = '#b9a5c3';
    ctx.strokeRect(x, y, r.width, r.height);
    ctx.fillStyle = '#574361';
    ctx.font = '11px sans-serif';
    ctx.fillText(node.textContent, x + 8, y + r.height / 2 + 4);
  }
  ctx.fillStyle = '#46523e';
  ctx.font = '18px Georgia';
  ctx.fillText('Cellscape / ' + (window.CellAtlasBridge?.specimenName?.() || currentKind + ' cell'), 18, host.clientHeight + 28);
  ctx.fillStyle = '#737d65';
  ctx.font = '10px sans-serif';
  const madeBy = model?.userData.source === 'glb' ? '3D model' + (model.userData.credit ? ' by ' + model.userData.credit : '') : 'Procedural teaching model';
  ctx.fillText(madeBy + ' · Simplified anatomy · Not to scale', 18, host.clientHeight + 49);
  ctx.restore();
  return new Promise(resolve => output.toBlob(resolve, 'image/png'));
}

function exportModel() {
  if (!model || !enabled || lessonMode || document.body.dataset.page !== 'atlas') return null;
  const data = model.toJSON();
  data.metadata.cellscape = {
    specimen: currentKind,
    description: 'Procedural educational model; simplified anatomy and proportions.',
    format: 'Three.js Object JSON',
    licenseNotice: 'Preserve vendor/three/LICENSE when redistributing Three.js.'
  };
  return data;
}
const initialized = init();
window.Cell3D = {
  show(kind, id, withLabels = true, isQuiz = false) {
    endLesson();
    enabled = true;
    host.dataset.model = kind;
    if (!initialized) return;
    const changed = kind !== currentKind;
    if (changed) build(kind);
    const selectionChanged = activeId !== id;
    if (selectionChanged || isQuiz) stopCloseup();
    if (isQuiz && spread) clearStudy();
    activeId = id;
    showLabels = withLabels;
    quizMode = isQuiz;
    if (quizMode) isolated = false;
    applySelection();
    syncStudy();
    if (changed) resize();
    else if (focusedView) {
      if (selectionChanged && !quizMode) focusStructure()
    } else if (isolated) fit(false);
    dirty = true;
  },
  hide() {
    stopCloseup();
    flight = null;
    enabled = false;
    if (controls) {
      controls.autoRotate = false;
      syncButtons()
    }
  },
  zoomTo,
  reset,
  focus: focusStructure,
  lesson: setLesson,
  endLesson,
  ready: initialized,
  snapshot,
  exportModel,
  batch: showBatch,
  // Read-only diagnostics are kept on the DOM for QA and troubleshooting.
};
if (initialized) {
  controls.addEventListener('change', () => {
    host.dataset.camera = camera.position.toArray().map(v => v.toFixed(3)).join(',');
    host.dataset.target = controls.target.toArray().map(v => v.toFixed(3)).join(',')
  });
}
window.dispatchEvent(new Event('cell3d-ready'));
