import assert from 'node:assert/strict';
import {buildCellModel} from '../cell-models.js';
import {Box3} from '../vendor/three/three.module.js';
const expected={
 plant:['wall','membrane','cytosol','vacuole','nucleus','nucleolus','rough-er','smooth-er','chloroplast','mitochondrion','golgi','peroxisome','vesicle','ribosomes','cytoskeleton'],
 animal:['membrane','cytosol','nucleus','nucleolus','rough-er','smooth-er','golgi','centrosome','lysosome','peroxisome','mitochondrion','ribosomes','vesicle','cytoskeleton'],
 leukocyte:['membrane','cytosol','nucleus','rough-er','golgi','lysosome','vesicle','mitochondrion','ribosomes'],
 neuron:['soma','nucleus','dendrites','axon','myelin','terminals','mitochondrion','rough-er','membrane'],
 epithelial:['membrane','microvilli','basement','nucleus','rough-er','golgi','mitochondrion','junctions','cytoskeleton'],
 bacteria:['capsule','bacterial-wall','membrane','cytosol','nucleoid','plasmid','bacterial-ribosomes','pili','flagellum'],
 muscle:['membrane','myofibril','sarcomere','t-tubule','sarcoplasmic-reticulum','nucleus','mitochondrion']
};
for(const [kind,ids] of Object.entries(expected)){
 const model=buildCellModel(kind),seen=new Set(),geometries=new Set(),materials=new Set();let vertices=0,meshes=0;
 model.updateMatrixWorld(true);
 model.traverse(o=>{
  if(o.userData.structureId)seen.add(o.userData.structureId);
  if(!o.isMesh)return;
  meshes++;geometries.add(o.geometry);materials.add(o.material);
  const positions=o.geometry.getAttribute('position');assert(positions&&positions.count>0,kind+' empty mesh');
  for(const value of positions.array)assert(Number.isFinite(value),kind+' non-finite vertex');
  vertices+=positions.count;
  const normals=o.geometry.getAttribute('normal');if(normals)for(const value of normals.array)assert(Number.isFinite(value),kind+' non-finite normal');
  if(o.isInstancedMesh){assert(o.count>0,kind+' empty instance batch');for(const value of o.instanceMatrix.array)assert(Number.isFinite(value),kind+' invalid instance transform');}
  const index=o.geometry.index;if(index)for(const i of index.array)assert(i<positions.count,kind+' invalid mesh index');
  for(const value of o.matrixWorld.elements)assert(Number.isFinite(value),kind+' invalid transform');
 });
 for(const id of ids)assert(seen.has(id),`${kind}: missing selectable ${id}`);
 const bounds=new Box3().setFromObject(model);assert(!bounds.isEmpty(),kind+' empty model');
 assert(vertices>1000&&meshes>10,kind+' incomplete 3D model');
 if(kind==='bacteria')for(const forbidden of ['nucleus','mitochondrion','golgi','chloroplast'])assert(!seen.has(forbidden),'Bacteria must not contain '+forbidden);
 console.log(`${kind}: ${meshes} meshes, ${vertices} vertices, ${ids.length} expected structures verified`);
 for(const g of geometries)g.dispose();for(const m of materials)m.dispose();model.userData.texture.dispose();
}
