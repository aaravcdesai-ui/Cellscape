// A fixed, illustrative batch of 12 cargo particles; not measured secretion kinetics.
export function cargoBatch(progress,blocked=false){
 const t=Math.max(0,Math.min(1,progress));
 return Array.from({length:12},(_,i)=>{
  const p=Math.max(0,Math.min(1,(t-i*.025)/.7));
  const travel=blocked?Math.min(1,p*6):Math.min(5,p*5);
  const stage=Math.min(5,Math.floor(travel)),fraction=stage===5?1:travel-stage;
  return {stage,progress:fraction,waiting:blocked&&travel>=1,delivered:!blocked&&stage===5};
 });
}
export function cargoSummary(batch){return {upstream:batch.filter(p=>p.waiting).length,delivered:batch.filter(p=>p.delivered).length,total:batch.length}}
