import * as T from './vendor/three/three.module.js';
// Display-only disassembly; offsets do not represent biological distances.
export function explodedRig(model){
 const fixed=new Set(['wall','membrane','cytosol','capsule','bacterial-wall','basement']);
 const ids=[...new Set(model.children.map(o=>o.userData.structureId).filter(id=>id&&!fixed.has(id)))];
 const parts=model.children.map(o=>{const id=o.userData.structureId,index=ids.indexOf(id),base=o.position.clone(),offset=new T.Vector3();
  if(index>=0){const angle=index*2.3999632297,r=1.9+(index%3)*.35;offset.set(Math.cos(angle)*r,1.2+(index%4)*.6,Math.sin(angle)*r)}
  return {object:o,base,offset};
 });
 return {set(amount){for(const p of parts)p.object.position.copy(p.base).addScaledVector(p.offset,amount);model.updateMatrixWorld(true)},parts};
}
export const closeupLessons={
 nucleus:{title:'Through a nuclear pore',symbol:'RNA',steps:[['Inside the nucleus','An RNA molecule is prepared for export. The gold marker represents an RNA–protein cargo, not DNA leaving the nucleus.'],['At the pore','Nuclear pore complexes selectively regulate traffic across the double envelope. Export requires transport machinery.'],['Into the cytoplasm','Exported messenger RNA can be translated by cytoplasmic ribosomes. This is a simplified example of nuclear transport.']],points:[[.1,.1,.2],[.6,.35,.7],[1,.55,1.15]]},
 mitochondrion:{title:'From a gradient to ATP',symbol:'H⁺',steps:[['Store a gradient','The electron transport chain uses energy to build a proton gradient across the inner membrane. Cristae provide membrane area.'],['Through ATP synthase','Protons return toward the matrix through ATP synthase. The highlighted stalk-and-head complexes represent this enzyme.'],['Make ATP','ATP synthase couples proton flow to ATP formation from ADP and phosphate. The marker illustrates a sequence, not a measured proton trajectory.']],points:[[-.3,.23,.1],[-.32,.08,.1],[-.32,-.1,.1]]},
 chloroplast:{title:'Light reactions to carbon fixation',symbol:'Light',steps:[['Capture light','Pigments in thylakoid membranes absorb light. The stacked discs are grana, connected by membrane lamellae.'],['Make energy carriers','Thylakoid light reactions produce ATP and NADPH. Oxygen comes from splitting water; sugar is not made directly by a photon.'],['Fix carbon in the stroma','The Calvin cycle uses ATP and NADPH to help convert carbon dioxide into carbohydrate precursors in the stroma.']],points:[[-.45,.55,0],[-.15,.12,0],[.32,-.02,.23]]}
};
