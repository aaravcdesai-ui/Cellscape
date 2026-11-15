import * as T from 'three';
import {OrbitControls} from './vendor/three/OrbitControls.js';
import {buildCellModel} from './cell-models.js';
const host=document.querySelector('#viewer3d');
const status=document.querySelector('#viewer3d-status');
let renderer,scene,camera,controls,model=null,currentKind=null,activeId=null,isolated=false,cutaway=true,showLabels=true,quizMode=false;
let dirty=true,enabled=false,baseDistance=10,pointerStart=null,hovered=null,lastZoom=null,flight=null,focusedView=false;
const selectable=[],labelNodes=new Map(),labelAnchors=new Map();
const raycaster=new T.Raycaster(),pointer=new T.Vector2();
const labels=document.createElement('div');labels.className='three-labels';
const leaderLayer=document.createElementNS('http://www.w3.org/2000/svg','svg');leaderLayer.classList.add('three-leaders');leaderLayer.setAttribute('aria-hidden','true');labels.append(leaderLayer);
const leaderNodes=new Map();

function idFor(object){for(let node=object;node;node=node.parent)if(node.userData.structureId)return node.userData.structureId;return null}
function announce(message){document.querySelector('#viewer3d-live').textContent=message}
function syncButtons(){
 for(const [id,on] of [['isolate-3d',isolated],['shell-3d',!cutaway],['spin-3d',controls?.autoRotate]])document.getElementById(id)?.setAttribute('aria-pressed',String(Boolean(on)));
 document.querySelector('#isolate-3d').disabled=!activeId||quizMode;document.querySelector('#focus-3d').disabled=!activeId||quizMode;
}
function reset(){if(!model||!camera)return;flight=null;focusedView=false;controls.autoRotate=false;isolated=false;cutaway=true;applySelection();fit(true);syncButtons();announce('View reset.');dirty=true}
function fit(defaultDirection=false,selectionOnly=false){
 if(!model)return;
 const focusAnchor=selectionOnly?labelAnchors.get(activeId):null;
 const included=o=>{if(!selectionOnly)return true;for(let node=o;node;node=node.parent)if(node===focusAnchor)return true;return false};
 const box=new T.Box3();
 model.traverse(o=>{if(o.isMesh&&o.visible&&included(o)&&(!o.userData.closedOnly||!cutaway||(isolated&&idFor(o)===activeId)))box.expandByObject(o)});
 if(box.isEmpty())box.setFromObject(model);
 const center=box.getCenter(new T.Vector3());
 const direction=defaultDirection?new T.Vector3(...(currentKind==='plant'?[.65,1.25,1.5]:currentKind==='epithelial'?[.48,.35,1.6]:[.65,1.05,1.5])).normalize():camera.position.clone().sub(controls.target).normalize();
 const right=new T.Vector3().crossVectors(camera.up,direction).normalize(),up=new T.Vector3().crossVectors(direction,right).normalize();
 const tanY=Math.tan(T.MathUtils.degToRad(camera.fov/2)),tanX=tanY*camera.aspect;
 let distance=0;const fittedPoints=[];
 const account=world=>{fittedPoints.push(world.clone());const corner=world.sub(center),depth=corner.dot(direction);distance=Math.max(distance,Math.abs(corner.dot(right))/tanX+depth,Math.abs(corner.dot(up))/tanY+depth)};
 model.updateMatrixWorld(true);
 model.traverse(o=>{
  if(!o.isMesh||!o.visible||(o.userData.closedOnly&&cutaway&&!isolated)||!included(o))return;
  if(o.isInstancedMesh){if(isolated||selectionOnly){const bounds=new T.Box3().setFromObject(o);for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])account(new T.Vector3(x,y,z))}return;}
  const vertices=o.geometry.getAttribute('position'),stride=Math.max(1,Math.floor(vertices.count/350));
  for(let i=0;i<vertices.count;i+=stride){const world=new T.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(o.matrixWorld);if(cutaway&&currentKind==='bacteria'&&o.userData.openOnly&&world.y>.12)continue;account(world)}
 });
 distance=Math.max(1,distance*1.08);
 // Center the actual visible geometry rather than its conservative bounding box.
 for(let iteration=0;iteration<3;iteration++){
  controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const point of fittedPoints){const ndc=point.clone().project(camera);minX=Math.min(minX,ndc.x);maxX=Math.max(maxX,ndc.x);minY=Math.min(minY,ndc.y);maxY=Math.max(maxY,ndc.y)}
  const midX=(minX+maxX)/2,midY=(minY+maxY)/2;
  center.addScaledVector(right,midX*distance*tanX).addScaledVector(up,midY*distance*tanY);
  const occupancy=Math.max((maxX-minX)/2,(maxY-minY)/2);
  distance*=T.MathUtils.clamp(occupancy/(selectionOnly?.66:.91),.7,1.35);
 }
 baseDistance=distance;
 controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,baseDistance);
 camera.near=Math.max(.01,baseDistance/1000);camera.far=baseDistance*20;camera.updateProjectionMatrix();
 controls.minDistance=baseDistance/4;controls.maxDistance=baseDistance*2.5;
 controls.update();controls.saveState();emitZoom();dirty=true;
}
function focusStructure(){
 if(!model||!activeId||quizMode)return;
 controls.autoRotate=false;flight=null;focusedView=true;isolated=true;applySelection();
 const fromPosition=camera.position.clone(),fromTarget=controls.target.clone(),oldMax=controls.maxDistance;
 fit(false,true);controls.maxDistance=Math.max(oldMax,controls.maxDistance);
 const toPosition=camera.position.clone(),toTarget=controls.target.clone();
 if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
  camera.position.copy(fromPosition);controls.target.copy(fromTarget);controls.update();
  flight={fromPosition,fromTarget,toPosition,toTarget,start:performance.now()};
 }
 syncButtons();announce('Focused on '+(window.CellAtlasBridge?.nameFor(activeId)||activeId)+'. Surrounding structures are hidden. Reset view returns to the whole cell.');dirty=true;
}
function resize(){
 if(!renderer||!host.clientWidth||!host.clientHeight)return;
 renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();fit(false,focusedView);dirty=true;
}
function emitZoom(){if(!camera)return;const factor=baseDistance/camera.position.distanceTo(controls.target);if(lastZoom!==null&&Math.abs(lastZoom-factor)<.002)return;lastZoom=factor;window.dispatchEvent(new CustomEvent('cell3d-zoom',{detail:{factor}}))}
function zoomTo(factor){if(!camera||!model)return;flight=null;const direction=camera.position.clone().sub(controls.target).normalize();camera.position.copy(controls.target).addScaledVector(direction,baseDistance/T.MathUtils.clamp(factor,.4,4));controls.update();dirty=true}
function disposeModel(){
 flight=null;if(!model)return;scene.remove(model);const geometries=new Set(),materials=new Set();model.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)}});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());model.userData.texture?.dispose();
 model=null;selectable.length=0;labelAnchors.clear();for(const node of labelNodes.values())node.remove();labelNodes.clear();for(const node of leaderNodes.values())node.remove();leaderNodes.clear();
}
function build(kind){
 disposeModel();model=buildCellModel(kind);scene.add(model);currentKind=kind;focusedView=false;isolated=false;cutaway=true;
 model.traverse(o=>{if(o.isMesh){selectable.push(o);const id=idFor(o);if(id&&!labelAnchors.has(id))labelAnchors.set(id,o);if(o.material){for(const mat of Array.isArray(o.material)?o.material:[o.material]){mat.userData.baseColor=mat.color.clone();mat.userData.baseOpacity=mat.opacity}}}});
 // Prefer a structure's group origin over the first pore or ribbon vertex.
 model.traverse(o=>{if(o.isGroup&&o.userData.structureId)labelAnchors.set(o.userData.structureId,o)});
 document.querySelector('#viewer3d canvas').setAttribute('aria-label',kind+' cell 3D model. Drag to rotate; scroll to zoom. Arrow keys rotate, Shift plus arrows pan, plus and minus zoom, Home resets.');
 fit(true);dirty=true;
}
function applySelection(){
 if(!model)return;
 model.traverse(o=>{
  if(!o.isMesh)return;
  const id=idFor(o),matches=id===activeId||(activeId==='nucleus'&&id==='nucleolus');
  o.visible=(!o.userData.closedOnly||!cutaway||(isolated&&matches))&&(!o.userData.openOnly||cutaway)&&(!isolated||matches);
  const mats=Array.isArray(o.material)?o.material:[o.material];
  for(const mat of mats){if(mat.emissive){mat.emissive.set(matches&&!quizMode?0x342037:0x000000);mat.emissiveIntensity=matches && !quizMode ? 0.17 : 0}}
 });
 const ground=scene.getObjectByName('specimen-ground');if(ground)ground.visible=!isolated;
 host.dataset.isolated=String(isolated);host.dataset.selection=activeId||'';dirty=true;syncButtons();updateLabels();
}
function updateLabels(){
 if(!model||!camera)return;
 const width=host.clientWidth,height=host.clientHeight,narrow=width<440;
 const priority=[activeId,'nucleus','vacuole','mitochondrion','chloroplast','nucleoid','axon','myofibril','microvilli'];
 const limit=narrow?1:width<620?2:3,chosen=[];
 leaderLayer.setAttribute('viewBox',`0 0 ${width} ${height}`);
 for(const node of labelNodes.values())node.hidden=true;
 for(const path of leaderNodes.values())path.style.display='none';
 if(!showLabels||quizMode)return;
 for(const id of [...new Set(priority)]){
  if(!id||!labelAnchors.has(id)||chosen.length>=limit||((isolated||focusedView)&&id!==activeId))continue;
  const anchor=labelAnchors.get(id);let p=anchor.getWorldPosition(new T.Vector3());
  if(anchor.isInstancedMesh){const matrix=new T.Matrix4();anchor.getMatrixAt(0,matrix);p.setFromMatrixPosition(matrix).applyMatrix4(anchor.matrixWorld)}
  p.project(camera);const x=(p.x*.5+.5)*width,y=(-p.y*.5+.5)*height;
  if(p.z>1||p.z< -1||x<6||x>width-6||y<6||y>height-6)continue;
  if(id!==activeId){
   raycaster.setFromCamera(new T.Vector2(p.x,p.y),camera);
   const front=raycaster.intersectObjects(selectable,false).find(hit=>hit.object.visible&&!(hit.object.userData.closedOnly&&hit.object.material.opacity<.3)&&!(cutaway&&currentKind==='bacteria'&&hit.object.userData.openOnly&&hit.point.y>.12));
   if(front&&idFor(front.object)!==id&&!(id==='nucleus'&&idFor(front.object)==='nucleolus'))continue;
  }
  let node=labelNodes.get(id),path=leaderNodes.get(id);
  if(!node){node=document.createElement('button');node.className='three-label';node.dataset.structure=id;node.type='button';node.onclick=()=>dispatchSelection(id);labels.append(node);labelNodes.set(id,node)}
  if(!path){path=document.createElementNS('http://www.w3.org/2000/svg','path');leaderLayer.append(path);leaderNodes.set(id,path)}
  const name=window.CellAtlasBridge?.nameFor(id)||id;node.textContent=name;node.setAttribute('aria-label','Select '+name);node.classList.toggle('selected',id===activeId);node.hidden=false;
  const w=Math.min(node.offsetWidth,width-28),h=node.offsetHeight,left=x<width/2;
  node.dataset.side=left?'left':'right';
  chosen.push({id,node,path,x,y,w,h,left,labelY:T.MathUtils.clamp(y-22,h/2+12,height-h/2-12)});
 }
 // Reserve a little vertical space around each label, keeping selection first.
 const placed=[];
 for(const item of chosen){
  const candidates=[item.labelY,...Array.from({length:8},(_,i)=>item.labelY+(i%2?-1:1)*(Math.floor(i/2)+1)*(item.h+12))];
  const good=candidates.find(y=>y>=item.h/2+10&&y<=height-item.h/2-10&&placed.every(other=>other.left!==item.left||Math.abs(y-other.labelY)>(item.h+other.h)/2+10));
  if(good===undefined){item.node.hidden=true;continue}item.labelY=good;placed.push(item);
  const left=item.left?12:width-item.w-12,endX=item.left?left+item.w:left,elbow=endX+(item.left?12:-12);
  item.node.style.left=left+'px';item.node.style.top=(good-item.h/2)+'px';
  item.path.setAttribute('d',`M${item.x.toFixed(1)},${item.y.toFixed(1)} L${elbow.toFixed(1)},${good.toFixed(1)} H${endX.toFixed(1)}`);
  item.path.setAttribute('class',item.id===activeId?'selected':'');item.path.style.display='';
 }
 host.dataset.visibleLabels=String(placed.length);
}
function pick(event){
 const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
 const hits=raycaster.intersectObjects(selectable,false);
 for(const hit of hits){if(!hit.object.visible)continue;let visible=true;for(let parent=hit.object.parent;parent;parent=parent.parent)if(!parent.visible)visible=false;if(!visible)continue;
  if(hit.object.userData.closedOnly&&hit.object.material.opacity<.3)continue;
  // Respect the clipping plane of the open bacterial envelope when picking.
  if(cutaway&&currentKind==='bacteria'&&hit.object.userData.openOnly&&hit.point.y>.12)continue;
  const id=idFor(hit.object);if(id&&window.CellAtlasBridge?.hasStructure(id))return id;
 }return null;
}
function dispatchSelection(id){window.dispatchEvent(new CustomEvent('cell3d-select',{detail:{id}}))}
function init(){
 try{
  renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.97;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.localClippingEnabled=true;
  scene=new T.Scene();camera=new T.PerspectiveCamera(38,1,.05,200);camera.position.set(10,8,12);
  scene.add(new T.HemisphereLight(0xfff8e9,0xa8ac91,1.6));scene.add(new T.AmbientLight(0xffffff,.3));
  const key=new T.DirectionalLight(0xfff4e0,3.0);key.position.set(-5,12,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:35});key.shadow.bias=-.001;scene.add(key);
  const fill=new T.DirectionalLight(0xdad9ff,.8);fill.position.set(7,5,-8);scene.add(fill);
  const ground=new T.Mesh(new T.PlaneGeometry(40,40),new T.ShadowMaterial({opacity:.12,depthWrite:false}));ground.name='specimen-ground';ground.rotation.x=-Math.PI/2;ground.position.y=-1.85;ground.receiveShadow=true;scene.add(ground);
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.className='cell3d-canvas';host.append(canvas,labels);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.09;controls.rotateSpeed=.65;controls.panSpeed=.7;controls.zoomSpeed=.8;controls.autoRotateSpeed=.75;controls.maxPolarAngle=Math.PI-.08;controls.minPolarAngle=.08;controls.screenSpacePanning=true;
  controls.addEventListener('change',()=>{dirty=true;emitZoom()});controls.addEventListener('start',()=>{flight=null});
  canvas.addEventListener('pointerdown',e=>{if(e.button===0){pointerStart={x:e.clientX,y:e.clientY};controls.autoRotate=false;syncButtons()}});
  canvas.addEventListener('pointerup',e=>{if(pointerStart&&e.button===0&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<5){const id=pick(e);if(id)dispatchSelection(id)}pointerStart=null});
  canvas.addEventListener('pointercancel',()=>pointerStart=null);
  canvas.addEventListener('pointermove',e=>{if(e.buttons)return;const id=pick(e);if(id!==hovered){hovered=id;canvas.style.cursor=id?'pointer':'grab'}});
  canvas.addEventListener('keydown',e=>{
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
    e.preventDefault();
    if(e.shiftKey){const delta=new T.Vector3().setFromMatrixColumn(camera.matrix,e.key==='ArrowLeft'||e.key==='ArrowRight'?0:1);const sign=e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:1;delta.multiplyScalar(camera.position.distanceTo(controls.target)*.025*sign);camera.position.add(delta);controls.target.add(delta);controls.update();dirty=true;return;}
    const offset=camera.position.clone().sub(controls.target),spherical=new T.Spherical().setFromVector3(offset);
    if(e.key==='ArrowLeft')spherical.theta-=.13;if(e.key==='ArrowRight')spherical.theta+=.13;if(e.key==='ArrowUp')spherical.phi-=.13;if(e.key==='ArrowDown')spherical.phi+=.13;spherical.phi=T.MathUtils.clamp(spherical.phi,.1,Math.PI-.1);camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(spherical));controls.update();dirty=true;
   }else if(e.key==='+'||e.key==='='){e.preventDefault();zoomTo(baseDistance/camera.position.distanceTo(controls.target)*1.15)}else if(e.key==='-'){e.preventDefault();zoomTo(baseDistance/camera.position.distanceTo(controls.target)/1.15)}else if(e.key==='Home'){e.preventDefault();reset()}
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();status.hidden=false;status.textContent='3D rendering paused. Reload the page to restore it, or switch to Illustration.';enabled=false});
  new ResizeObserver(resize).observe(host);
  document.querySelector('#focus-3d').onclick=focusStructure;
  document.querySelector('#detail-focus').onclick=()=>{if(artworkMode!=='3d')return;focusStructure();document.querySelector('#cell-viewport').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})};
  document.querySelector('#isolate-3d').onclick=()=>{flight=null;focusedView=false;isolated=!isolated;applySelection();fit(false);announce(isolated?'Showing the selected structure only.':'Showing the full specimen.')};
  document.querySelector('#shell-3d').onclick=()=>{cutaway=!cutaway;applySelection();announce(cutaway?'Cutaway shell shown.':'Outer shell shown.')};
  document.querySelector('#spin-3d').onclick=()=>{controls.autoRotate=!controls.autoRotate;syncButtons();dirty=true};
  document.querySelector('#reset-3d').onclick=reset;
  renderer.setAnimationLoop(()=>{
   if(!enabled||document.hidden||document.body.dataset.page!=='atlas')return;
   if(flight){const t=Math.min(1,(performance.now()-flight.start)/650),e=t*t*(3-2*t);camera.position.lerpVectors(flight.fromPosition,flight.toPosition,e);controls.target.lerpVectors(flight.fromTarget,flight.toTarget,e);dirty=true;if(t===1)flight=null}
   const changed=controls.update();if(dirty||changed||controls.autoRotate){updateLabels();renderer.render(scene,camera);dirty=false}
  });
  status.hidden=true;return true;
 }catch(error){
  status.hidden=false;status.textContent='3D requires WebGL 2. Try a current Chrome or Safari browser, or use Illustration.';document.querySelector('#viewer3d').dataset.error='webgl';console.error('Cellscape 3D initialization failed:',error);return false;
 }
}
const initialized=init();
window.Cell3D={
 show(kind,id,withLabels=true,isQuiz=false){
  enabled=true;host.dataset.model=kind;if(!initialized)return;
  const changed=kind!==currentKind;if(changed)build(kind);
  const selectionChanged=activeId!==id;activeId=id;showLabels=withLabels;quizMode=isQuiz;if(quizMode)isolated=false;
  applySelection();if(changed)resize();else if(focusedView){if(selectionChanged&&!quizMode)focusStructure()}else if(isolated)fit(false);dirty=true;
 },
 hide(){flight=null;enabled=false;if(controls){controls.autoRotate=false;syncButtons()}},
 zoomTo,reset,focus:focusStructure,
 ready:initialized,
 // Read-only diagnostics are kept on the DOM for QA and troubleshooting.
};
if(initialized){controls.addEventListener('change',()=>{host.dataset.camera=camera.position.toArray().map(v=>v.toFixed(3)).join(',');host.dataset.target=controls.target.toArray().map(v=>v.toFixed(3)).join(',')});}
window.dispatchEvent(new Event('cell3d-ready'));
