import assert from 'node:assert/strict';
import {
  structureIdFor,
  organizeGlb,
  fitToBox
} from '../glb-parts.js';
import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3
} from '../vendor/three/three.module.js';

const plant = ['nucleus', 'nucleolus', 'chloroplast', 'mitochondrion', 'rough-er', 'smooth-er', 'golgi', 'ribosomes', 'vacuole', 'membrane', 'wall', 'cytosol', 'peroxisome', 'cytoskeleton', 'vesicle'];

// Names as artists and exporters produce them.
const cases = {
  'Nucleus': 'nucleus',
  'nucleolus': 'nucleolus',
  'Chloroplast.001': 'chloroplast',
  'Chloroplast001': 'chloroplast', // GLTFLoader strips the dot
  'Golgi apparatus': 'golgi',
  'golgi_stack': 'golgi',
  'Rough ER.002': 'rough-er',
  'Smooth_ER': 'smooth-er',
  'Mitochondria': 'mitochondrion',
  'mitochondrion-3': 'mitochondrion',
  'Central_Vacuole': 'vacuole',
  'Cell Wall': 'wall',
  'Plasma membrane': 'membrane',
  'Cytoplasm': 'cytosol',
  'Ribosome': 'ribosomes',
  'Mystery thing': null,
  '': null
};
for (const [name, id] of Object.entries(cases)) assert.equal(structureIdFor(name, plant), id, `${JSON.stringify(name)} -> ${id}`);
// Only ids that exist for this specimen are matched.
assert.equal(structureIdFor('Nucleoid', ['nucleoid', 'plasmid']), 'nucleoid');
assert.equal(structureIdFor('Nucleoid', plant), null);

// Organizing: nested, scaled exports become one group per structure, tagged for selection.
const scene = new Group();
const wrapper = new Group();
wrapper.scale.setScalar(.01);
scene.add(wrapper);
const part = (name, x, parent = wrapper) => {
  const m = new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial());
  m.name = name;
  m.position.set(x, 0, 0);
  parent.add(m);
  return m
};
part('Cell Wall', 0);
const nucleus = part('Nucleus', -2);
part('Nucleolus', 0, nucleus);
part('Chloroplast001', 2);
part('Chloroplast002', 3);
const tagged = part('blob', 1);
tagged.userData.structureId = 'peroxisome';
part('Mystery thing', 4);
const root = organizeGlb(scene, plant, 'plant');
const byId = Object.fromEntries(root.children.map(g => [g.userData.structureId || 'unassigned', g.children.length]));
assert.deepEqual(byId, {
  wall: 1,
  nucleus: 1,
  nucleolus: 1,
  chloroplast: 2,
  peroxisome: 1,
  unassigned: 1
});
for (const g of root.children)
  if (g.userData.structureId) assert.equal(g.parent, root, 'structure groups sit directly under the root');

// Fitting: scaled to the reference size, resting on its floor; groups centred on their parts.
const reference = new Box3(new Vector3(-4, -1.2, -3), new Vector3(4, 1, 3));
fitToBox(root, reference);
const fitted = new Box3().setFromObject(root);
const size = fitted.getSize(new Vector3());
assert(Math.abs(Math.max(size.x, size.y, size.z) - 8) < 1e-6, 'largest side matches the reference');
assert(Math.abs(fitted.min.y - reference.min.y) < 1e-6, 'rests on the reference floor');
assert.equal(root.scale.x, 1, 'root stays unscaled so exploded offsets keep their units');
const nucleusGroup = root.children.find(g => g.userData.structureId === 'nucleus');
const nucleusCentre = new Box3().setFromObject(nucleusGroup).getCenter(new Vector3());
assert(nucleusGroup.position.distanceTo(nucleusCentre) < 1e-6, 'group origin is at its parts, for labels');
console.log(`GLB parts: ${Object.keys(cases).length} names matched; organize and fit verified.`);
