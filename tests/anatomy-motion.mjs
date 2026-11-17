import assert from 'node:assert/strict';
import {buildCellModel} from '../cell-models.js';
import {explodedRig,closeupLessons} from '../anatomy-motion.js';
for(const kind of ['plant','animal','leukocyte','neuron','epithelial','bacteria','muscle']){
 const model=buildCellModel(kind),before=model.children.map(o=>o.position.toArray()),rig=explodedRig(model);
 rig.set(1);assert(model.children.some((o,i)=>o.position.toArray().some((v,j)=>Math.abs(v-before[i][j])>.1)),kind+' must separate');
 for(const p of rig.parts)if(['wall','membrane','cytosol','capsule','bacterial-wall','basement'].includes(p.object.userData.structureId))assert.deepEqual(p.object.position.toArray(),p.base.toArray());
 for(const amount of [.7,.2,0])rig.set(amount);
 assert.deepEqual(model.children.map(o=>o.position.toArray()),before,kind+' must reassemble without drift');
 console.log(kind+': exploded and restored exactly');
}
assert.equal(Object.keys(closeupLessons).length,3);for(const l of Object.values(closeupLessons)){assert.equal(l.steps.length,3);assert.equal(l.points.length,3)}
