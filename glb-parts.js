// Turns an artist-made glTF/GLB scene into the shape the viewer expects: one group per structure,
// directly under the model root, tagged with userData.structureId (selection, labels and the
// exploded view all work from these tags).
//
// How parts are matched to structures, first rule wins:
//   1. A custom property "structureId" on the object (Blender: Object Properties > Custom
//      Properties; exported to glTF "extras", which three.js puts in userData).
//   2. The object's name, or the nearest named ancestor's: "Nucleus", "golgi_stack",
//      "Rough ER.002" and "mitochondrion-3" become nucleus, golgi, rough-er, mitochondrion.
// Parts that match nothing are still shown, but cannot be selected.
import * as T from './vendor/three/three.module.js';

const aliases = {
  er: 'rough-er',
  'rer': 'rough-er',
  'ser': 'smooth-er',
  'endoplasmic-reticulum': 'rough-er',
  'rough-endoplasmic-reticulum': 'rough-er',
  'smooth-endoplasmic-reticulum': 'smooth-er',
  'golgi-apparatus': 'golgi',
  'golgi-body': 'golgi',
  mitochondria: 'mitochondrion',
  chloroplasts: 'chloroplast',
  ribosome: 'ribosomes',
  vesicles: 'vesicle',
  lysosomes: 'lysosome',
  peroxisomes: 'peroxisome',
  'cell-membrane': 'membrane',
  'plasma-membrane': 'membrane',
  'cell-wall': 'wall',
  cytoplasm: 'cytosol',
  'central-vacuole': 'vacuole',
  'cell-body': 'soma',
  dendrite: 'dendrites',
  'axon-terminals': 'terminals',
  'myelin-sheath': 'myelin',
  myofibrils: 'myofibril',
  'sarcoplasmic-reticulum': 'sarcoplasmic-reticulum',
  't-tubules': 't-tubule',
  sarcolemma: 'membrane',
  microvillus: 'microvilli',
  'tight-junctions': 'junctions',
  'basement-membrane': 'basement',
  pilus: 'pili',
  flagella: 'flagellum',
  ribosomes70s: 'bacterial-ribosomes'
};

// "Golgi_Stack.002" -> candidates ["golgi-stack", "golgi"], most specific first.
// GLTFLoader strips dots from names, so Blender's "Chloroplast.001" arrives as "Chloroplast001":
// trailing copy numbers are removed with or without a separator.
function candidates(name) {
  const slug = String(name).toLowerCase().trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[.-]?\d+$/, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) return [];
  const parts = slug.split('-');
  const out = [];
  for (let n = parts.length; n >= 1; n--) out.push(parts.slice(0, n).join('-'));
  return out;
}

export function structureIdFor(name, ids) {
  const known = new Set(ids);
  for (const candidate of candidates(name)) {
    if (known.has(candidate)) return candidate;
    const alias = aliases[candidate];
    if (alias && known.has(alias)) return alias;
  }
  return null;
}

function idForNode(node, ids) {
  for (let n = node; n; n = n.parent) {
    const explicit = n.userData?.structureId;
    if (explicit && ids.includes(explicit)) return explicit;
    if (n.name) {
      const id = structureIdFor(n.name, ids);
      if (id) return id;
    }
  }
  return null;
}

// Moves every mesh under one group per structure, keeping each mesh's world placement.
export function organizeGlb(scene, ids, kind) {
  scene.updateMatrixWorld(true);
  const root = new T.Group();
  root.name = kind;
  root.userData.source = 'glb';
  const groups = new Map();
  const groupFor = id => {
    const key = id || '';
    if (!groups.has(key)) {
      const g = new T.Group();
      g.name = id || 'unassigned';
      if (id) g.userData.structureId = id;
      groups.set(key, g);
      root.add(g);
    }
    return groups.get(key);
  };
  const meshes = [];
  scene.traverse(o => {
    if (o.isMesh) meshes.push(o)
  });
  for (const m of meshes) {
    const id = idForNode(m, ids);
    const world = m.matrixWorld.clone();
    m.removeFromParent();
    world.decompose(m.position, m.quaternion, m.scale);
    m.castShadow = true;
    m.receiveShadow = true;
    groupFor(id).add(m);
  }
  root.userData.matched = [...groups.keys()].filter(Boolean);
  return root;
}

// Scales and moves an organized model so its bounding box matches a reference box (the
// procedural model), so camera framing, the ground shadow and exploded offsets stay in the same
// units. The transform is baked into the meshes; the root stays unscaled. Each structure group's
// origin then moves to the centre of its parts, because labels anchor to group origins.
export function fitToBox(root, reference) {
  root.updateMatrixWorld(true);
  const box = new T.Box3().setFromObject(root);
  if (box.isEmpty() || reference.isEmpty()) return root;
  const size = box.getSize(new T.Vector3()),
    target = reference.getSize(new T.Vector3()),
    scale = Math.max(target.x, target.y, target.z) / Math.max(size.x, size.y, size.z),
    center = box.getCenter(new T.Vector3()),
    goal = reference.getCenter(new T.Vector3()),
    // Centre horizontally, and rest on the same floor as the procedural model.
    shift = new T.Vector3(goal.x - center.x * scale, reference.min.y - box.min.y * scale, goal.z - center.z * scale);
  for (const group of root.children) {
    for (const m of group.children) {
      m.position.multiplyScalar(scale).add(shift);
      m.scale.multiplyScalar(scale);
    }
  }
  root.updateMatrixWorld(true);
  for (const group of root.children) {
    const middle = new T.Box3().setFromObject(group).getCenter(new T.Vector3());
    group.position.copy(middle);
    for (const m of group.children) m.position.sub(middle);
  }
  root.updateMatrixWorld(true);
  return root;
}
