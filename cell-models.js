// Procedural, editable 3D teaching specimens. Coordinates are illustrative, not measured.
import * as T from './vendor/three/three.module.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const PI=Math.PI;
let seed=1;
function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
const palette={nucleus:0x9160ae,nucleolus:0x5c2775,'rough-er':0x718bb9,'smooth-er':0xb3a0c6,golgi:0xdb9781,mitochondrion:0xd99d49,chloroplast:0x82a447,lysosome:0xc488ac,peroxisome:0x8caf8c,vesicle:0xd5b37a,ribosomes:0xc5a2be};
function material(color,options={}){return new T.MeshStandardMaterial({color,roughness:.48,metalness:.025,...options})}
function tag(object,id){object.userData.structureId=id;return object}
function mesh(parent,geometry,mat,id,position,scale){const m=new T.Mesh(geometry,mat);m.castShadow=true;m.receiveShadow=true;if(id)tag(m,id);if(position)m.position.copy(position);if(scale)m.scale.copy(scale);parent.add(m);return m}
function sphere(parent,id,p,scale,color,options={}){const result=mesh(parent,new T.SphereGeometry(1,28,20),material(color,options),id,p,scale);if(Math.max(scale.x,scale.y,scale.z)<.1)result.castShadow=false;return result}
function curve(parent,id,points,radius,color,options={}){const line=new T.CatmullRomCurve3(points);return mesh(parent,new T.TubeGeometry(line,Math.max(16,points.length*3),radius,7,false),material(color,options),id)}
function group(parent,id,p=V()){const g=new T.Group();g.position.copy(p);tag(g,id);parent.add(g);return g}
function randomInside(r){let p;do{p=V((random()-.5)*2,(random()-.5)*2,(random()-.5)*2)}while(p.lengthSq()>1);return p.multiplyScalar(r)}
function membraneTexture(){
 const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,n=160+Math.floor(random()*42+18*Math.sin(x*.42)*Math.cos(y*.37));data[i]=data[i+1]=data[i+2]=n;data[i+3]=255}
 const texture=new T.DataTexture(data,size,size);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(4,3);texture.needsUpdate=true;return texture;
}
function textureFor(parent){for(let node=parent;node;node=node.parent)if(node.userData.texture)return node.userData.texture;return null}
function organic(geometry,amount=.025){
 const pos=geometry.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),f=1+amount*(Math.sin(x*7+z*3)*Math.cos(y*6)+.45*Math.sin(z*11-y*4));pos.setXYZ(i,x*f,y*f,z*f)}
 pos.needsUpdate=true;geometry.computeVertexNormals();return geometry;
}
function textured(color,tex,extra={}){return material(color,{bumpMap:tex,bumpScale:.045,roughness:.66,...extra})}
function nucleus(parent,p,r=1,tex){
 const g=group(parent,'nucleus',p);
 const shell=organic(new T.SphereGeometry(r,64,40,PI*.95,PI*1.5),.013);
 mesh(g,shell,textured(palette.nucleus,tex,{side:T.DoubleSide}),'nucleus');
 mesh(g,new T.SphereGeometry(r*.94,40,28,PI*.95,PI*1.5),material(0xb28bc6,{side:T.DoubleSide}),'nucleus');
 const pores=new T.InstancedMesh(new T.TorusGeometry(r*.052,r*.014,7,14),material(0xdab4e8),58);tag(pores,'nucleus');const poreTransform=new T.Object3D();
 for(let i=0;i<58;i++){
  const phi=PI*.95+random()*PI*1.5,theta=.2+random()*(PI-.4),normal=V(-Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi));
  poreTransform.position.copy(normal).multiplyScalar(r*1.01);poreTransform.quaternion.setFromUnitVectors(V(0,0,1),normal);poreTransform.updateMatrix();pores.setMatrixAt(i,poreTransform.matrix);
 }g.add(pores);
 for(let j=0;j<27;j++){
  const points=[],phase=random()*PI*2,freq=1.2+random();
  for(let i=0;i<23;i++){const a=i*.43;points.push(V(Math.cos(a*freq+phase)*r*.61,Math.sin(a*1.63+phase*2)*r*.49,Math.sin(a*.87+phase)*r*.55))}
  curve(g,'nucleus',points,r*.008,j%3?0x703d86:0xb18ac2);
 }
 sphere(g,'nucleolus',V(.1,-.05,.16).multiplyScalar(r),V(.28,.28,.28).multiplyScalar(r),palette.nucleolus,{bumpMap:tex,bumpScale:.06,roughness:.44});
 for(const phi of [PI*.95,PI*2.45]){const points=[];for(let i=0;i<=32;i++){const theta=i/32*PI;points.push(V(-r*Math.sin(theta)*Math.cos(phi),r*Math.cos(theta),r*Math.sin(theta)*Math.sin(phi)))}curve(g,'nucleus',points,r*.018,0xd6b0e2)}
 return g;
}
function mito(parent,p,angle=0,scale=1){
 const g=group(parent,'mitochondrion',p);g.rotation.y=angle;g.scale.setScalar(scale);const tex=textureFor(parent);
 mesh(g,new T.SphereGeometry(1,40,24,0,PI*2,PI/2,PI/2),textured(0xc47c36,tex,{side:T.DoubleSide}),'mitochondrion',V(),V(.72,.35,.38));
 mesh(g,new T.SphereGeometry(1,36,20,0,PI*2,PI/2,PI/2),material(0xe3ac55,{side:T.DoubleSide}),'mitochondrion',V(0,.015,0),V(.665,.30,.325));
 sphere(g,'mitochondrion',V(0,-.12,0),V(.61,.045,.27),0xf4ce7e);
 for(const [rx,rz,y,color] of [[.71,.375,.012,0xe7b05c],[.665,.325,.025,0xf6d487]]){
  const rim=[];for(let i=0;i<=64;i++){const a=i/64*PI*2;rim.push(V(rx*Math.cos(a),y,rz*Math.sin(a)))}curve(g,'mitochondrion',rim,.018,color);
 }
 // Inner membrane sheets rise from the matrix; cristae are folds, not separate rods.
 for(let fold=0;fold<8;fold++){
  const x=-.5+fold*.142,width=.26*Math.sqrt(1-(x/.68)**2),points=[],positions=[],indices=[];
  for(let i=0;i<=20;i++){
   const z=-width+2*width*i/20,top=.08+.12*Math.sin(PI*i/20),xx=x+.022*Math.sin(i*.48+fold);
   positions.push(xx,-.12,z,xx,top,z);points.push(V(xx,top,z));
   if(i<20){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2)}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
  mesh(g,geo,material(fold%2?0xcf8d39:0xe5ae57,{side:T.DoubleSide}),'mitochondrion');curve(g,'mitochondrion',points,.016,0xf9d386);
 }
 dots(g,'mitochondrion',16,V(0,-.065,0),V(.5,.04,.19),0xad7738,.018);return g;
}
function chloroplast(parent,p,angle=0,scale=1){
 const g=group(parent,'chloroplast',p);g.rotation.y=angle;g.scale.setScalar(scale);
 mesh(g,new T.SphereGeometry(1,28,16,0,PI*2,PI/2,PI/2),material(0x6f923f,{side:T.DoubleSide}),'chloroplast',V(),V(.78,.34,.43));
 sphere(g,'chloroplast',V(0,-.055,0),V(.7,.065,.35),0xb1c879);
 for(let col=0;col<4;col++){
  const x=-.46+col*.3;
  for(let k=0;k<7;k++)mesh(g,new T.CylinderGeometry(.135,.135,.026,24),material(k%2?0x52802e:0x79a33c),'chloroplast',V(x,.02+k*.031,0));
  if(col<3)curve(g,'chloroplast',[V(x+.1,.065,0),V(x+.2,.075,.03)],.018,0x83a450);
 }
 const ring=[];for(let i=0;i<=48;i++){const a=i/48*PI*2;ring.push(V(.76*Math.cos(a),0,.41*Math.sin(a)))}curve(g,'chloroplast',ring,.028,0xa4bd69);dots(g,'chloroplast',24,V(0,-.01,.19),V(.51,.03,.1),0x668a3c,.018);
 return g;
}
function golgi(parent,p,scale=1){
 const g=group(parent,'golgi',p);g.scale.setScalar(scale);const tex=textureFor(parent);
 for(let i=0;i<7;i++){
  const geo=new T.SphereGeometry(1,36,12),pos=geo.attributes.position;
  for(let j=0;j<pos.count;j++){const x=pos.getX(j),y=pos.getY(j),z=pos.getZ(j);pos.setXYZ(j,x*(.86-i*.045),y*.045+.16*x*x,z*(.36-i*.016))}geo.computeVertexNormals();
  mesh(g,geo,textured(i%2?0xdf937b:0xcf7e6a,tex,{bumpScale:.015}),'golgi',V(0,i*.12,0));
  const edge=[];for(let j=0;j<=36;j++){const a=j/36*PI*2,x=Math.cos(a)*(.86-i*.045);edge.push(V(x,i*.12+.16*(x/(.86-i*.045))**2,Math.sin(a)*(.36-i*.016)))}curve(g,'golgi',edge,.017,0xf1b49c);
 }
 for(let i=0;i<10;i++)sphere(g,'vesicle',V(.82+random()*.36,random()*.9,(random()-.5)*.9),V(.065,.065,.065),0xe8a88a,{roughness:.35});return g;
}
function er(parent,p,r=1,rough=true){
 const id=rough?'rough-er':'smooth-er',g=group(parent,id,p);
 if(rough){
  const ribosomePoints=[];
  for(let layer=0;layer<5;layer++){
   const positions=[],indices=[],n=44;
   for(let i=0;i<=n;i++){
    const a=.05*PI+i/n*1.72*PI;
    for(let k=0;k<2;k++){const rad=r+.14+layer*.15+k*.19;positions.push(Math.cos(a)*rad,.13*Math.sin(a*4+layer)+layer*.14,Math.sin(a)*rad)}
    if(i<n){const v=i*2;indices.push(v,v+1,v+2,v+1,v+3,v+2)}
   }
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(g,geo,material(layer%2?0x7e9bc2:0x91acd0,{side:T.DoubleSide}),id);
   const points=[];for(let i=0;i<=44;i++){const a=.05*PI+i/44*1.72*PI;points.push(V(Math.cos(a)*(r+.18+layer*.14),.13*Math.sin(a*4+layer)+layer*.14,Math.sin(a)*(r+.18+layer*.14)))}curve(g,id,points,.024,0x6584ae);
   for(let i=0;i<28;i++){const a=.05*PI+i/28*1.72*PI,rad=r+.23+layer*.15;ribosomePoints.push(V(Math.cos(a)*rad,layer*.14+.04+.13*Math.sin(a*4+layer),Math.sin(a)*rad))}
  }
  const beads=new T.InstancedMesh(new T.SphereGeometry(.035,10,7),material(0xc8adc9),ribosomePoints.length);tag(beads,id);const bead=new T.Object3D();for(let i=0;i<ribosomePoints.length;i++){bead.position.copy(ribosomePoints[i]);bead.updateMatrix();beads.setMatrixAt(i,bead.matrix)}g.add(beads);
 }else{
  for(let j=0;j<7;j++){const points=[];for(let i=0;i<=12;i++){const t=i/12;points.push(V((t-.5)*1.7,j*.11+.12*Math.sin(t*PI*4+j),.28*Math.sin(t*PI*3+j)+j*.11))}curve(g,id,points,.045,0xa18ab8);if(j<6)curve(g,id,[V(-.55,j*.11,.28*Math.sin(.5*PI+j)+j*.11),V(-.4,j*.11+.13,.28*Math.sin(.5*PI+j+1)+(j+1)*.11)],.038,0xb59cc8)}
 }return g;
}
function centrosome(parent,p){const g=group(parent,'centrosome',p);for(let j=0;j<2;j++){const part=group(g,'centrosome',V(j*.42,0,j*.22));if(j)part.rotation.z=PI/2;for(let i=0;i<9;i++){const a=i/9*PI*2;for(let k=0;k<3;k++)mesh(part,new T.CylinderGeometry(.025,.025,.48,8),material(0xd3b269),'centrosome',V(.13*Math.cos(a)+k*.025,.16,.13*Math.sin(a)))}}return g}
function dots(parent,id,count,p,scale,color,r=.04){
 const geo=new T.SphereGeometry(r,7,5),mat=material(color),instances=new T.InstancedMesh(geo,mat,count);tag(instances,id);instances.castShadow=true;
 const dummy=new T.Object3D();for(let i=0;i<count;i++){const q=randomInside(1);dummy.position.set(p.x+q.x*scale.x,p.y+q.y*scale.y,p.z+q.z*scale.z);dummy.updateMatrix();instances.setMatrixAt(i,dummy.matrix)}parent.add(instances);return instances;
}
function fibers(parent,count,rx,rz,y=0){for(let i=0;i<count;i++){const points=[];for(let j=0;j<6;j++){const a=i/count*PI*2,t=j/5;points.push(V(Math.cos(a+t*.3)*rx*t,y+.05+Math.sin(t*PI)*.12,Math.sin(a+t*.3)*rz*t))}curve(parent,'cytoskeleton',points,.012,i%2?0xba8fab:0xa8b8a0)}}
function outlineShape(w,d,corner=.5){const s=new T.Shape();s.moveTo(-w/2+corner,-d/2);s.lineTo(w/2-corner,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+corner);s.lineTo(w/2,d/2-corner);s.quadraticCurveTo(w/2,d/2,w/2-corner,d/2);s.lineTo(-w/2+corner,d/2);s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-corner);s.lineTo(-w/2,-d/2+corner);s.quadraticCurveTo(-w/2,-d/2,-w/2+corner,-d/2);return s}
function extrude(parent,id,shape,depth,color,y,tex){const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.07,bevelThickness:.06,curveSegments:10});const m=mesh(parent,geo,textured(color,tex),id,V(0,y,0));m.rotation.x=-PI/2;return m}
function plant(root,tex){
 const outer=outlineShape(8,5.8,.65),hole=outlineShape(7.65,5.45,.6);outer.holes.push(new T.Path(hole.getPoints(32).reverse()));
 extrude(root,'wall',outer,1,0x6e923e,-1.15,tex);
 for(let layer=0;layer<4;layer++){const points=outlineShape(7.94,5.74,.64).getPoints(60).map(p=>V(p.x,-.94+layer*.21,p.y));curve(root,'wall',points,.018,layer%2?0xa9ba72:0x819d4f)}
 for(let i=0;i<11;i++){const pore=mesh(root,new T.TorusGeometry(.044,.012,5,10),material(0xbcc58c),'wall',V(-3.1+i*.6,-.5,2.88));pore.rotation.x=.1}

 extrude(root,'cytosol',outlineShape(7.55,5.35,.5),.14,0xdbe0a9,-1.08,tex);
 const rim=outlineShape(7.53,5.33,.5),rimHole=outlineShape(7.43,5.23,.5);rim.holes.push(new T.Path(rimHole.getPoints(32).reverse()));extrude(root,'membrane',rim,.8,0xa8b875,-.99,tex);
 const cover=mesh(root,new T.ExtrudeGeometry(outlineShape(7.55,5.35,.5),{depth:2.5,bevelEnabled:true,bevelSize:.1,bevelThickness:.1,bevelSegments:3,steps:1}),material(0xb5c780,{transparent:true,opacity:.16,depthWrite:false}),'membrane',V(0,-1,0));cover.rotation.x=-PI/2;cover.userData.closedOnly=true;
 sphere(root,'vacuole',V(.9,-.02,.15),V(2.02,.96,1.38),0x8fbfce,{roughness:.25,metalness:.05,bumpMap:tex,bumpScale:.015});
 nucleus(root,V(-1.95,.78,-1.35),.95,tex);er(root,V(-1.95,-.35,-1.35),.86,true);
 er(root,V(.35,.03,-2.25),1,false);
 chloroplast(root,V(-2.55,-.65,1.6),-.3);chloroplast(root,V(2.75,-.65,-1.9),.7);chloroplast(root,V(2.95,-.65,1.65),-.7);
 mito(root,V(-.7,-.5,2.17),-.2,.8);mito(root,V(1.4,-.5,-2.05),.2,.7);
 golgi(root,V(.45,-.62,1.75),.64);
 sphere(root,'peroxisome',V(-2.75,-.45,.3),V(.2,.2,.2),0x8fac7b);sphere(root,'vesicle',V(1.85,-.4,1.9),V(.13,.13,.13),0xdac194);
 dots(root,'ribosomes',105,V(0,-.8,0),V(3.4,.14,2.3),0xa691a8,.03);fibers(root,16,3.5,2.35,-.85);
}
function animal(root,tex,leukocyte=false){
 const radius=leukocyte?V(3.45,1.8,3.2):V(3.8,1.6,3.1);
 const bowl=mesh(root,organic(new T.SphereGeometry(1,80,40,0,PI*2,PI/2,PI/2),leukocyte?.04:.018),textured(leukocyte?0xc7ccd4:0x8fb5c9,tex,{side:T.DoubleSide,roughness:.56}),'membrane',V(0,-.05,0),radius);bowl.userData.openOnly=true;
 const closed=sphere(root,'membrane',V(0,-.05,0),radius,leukocyte?0xcbd0dc:0x9fc1d1,{transparent:true,opacity:.24,depthWrite:false,bumpMap:tex,bumpScale:.04});closed.userData.closedOnly=true;
 sphere(root,'cytosol',V(0,-.92,0),V(radius.x*.91,.32,radius.z*.91),leukocyte?0xd3cadc:0xb7cfda,{roughness:.8});
 const rim=[];for(let i=0;i<=96;i++){const a=i/96*PI*2;const f=1+(leukocyte?.04:.018)*(Math.sin(Math.cos(a)*7+Math.sin(a)*3)+.45*Math.sin(Math.sin(a)*11));rim.push(V(Math.cos(a)*radius.x*f,-.04,Math.sin(a)*radius.z*f))}const edge=curve(root,'membrane',rim,.055,leukocyte?0xdce0e6:0xb3d1dc);edge.userData.openOnly=true;
 if(leukocyte){
  const centers=[V(-1.2,.4,-.75),V(.9,.45,-1.1),V(.5,.3,1)];
  for(const p of centers)sphere(root,'nucleus',p,V(.95,.6,.82),0x9060a9,{bumpMap:tex,bumpScale:.09});
  curve(root,'nucleus',[centers[0],V(-.1,.35,-1.1),centers[1],V(.7,.32,-.1),centers[2]],.17,0x9464ab);
  for(let i=0;i<29;i++){const a=random()*PI*2,r=1.5+random()*1.3;sphere(root,i%4?'lysosome':'vesicle',V(Math.cos(a)*r,-.45+random()*.22,Math.sin(a)*r),V(.1,.1,.1).multiplyScalar(.8+random()),i%2?0xc89acb:0xd99cba)}
  er(root,V(-1.5,-.65,1.1),.45,true);golgi(root,V(1.65,-.65,1.4),.6);
 }else{
  nucleus(root,V(-.85,.8,-1.0),1.17,tex);er(root,V(-.85,-.4,-1),1.05,true);er(root,V(-2,-.4,1.05),1,false);golgi(root,V(.45,-.6,1.38),.85);centrosome(root,V(-1.9,-.55,1.6));
  for(const p of [V(2.1,-.4,.7),V(-2.3,-.45,-1.25),V(.4,-.4,2.45)])sphere(root,'lysosome',p,V(.2,.2,.2),0xc083a9,{bumpMap:tex,bumpScale:.02});
  sphere(root,'peroxisome',V(-.4,-.45,2.1),V(.17,.17,.17),0x8caf8c);
 }
 mito(root,V(2.3,-.5,-1.45),.5,.85);mito(root,V(2.3,-.5,1.5),-.5,.8);mito(root,V(-1.2,-.5,2.25),.1,.65);
 dots(root,'ribosomes',130,V(0,-.66,0),V(3.15,.18,2.6),0xb49ac1,.03);dots(root,'vesicle',16,V(.1,-.5,1.3),V(1,.4,1),0xd6b47d,.075);fibers(root,22,3.4,2.75,-.72);
}
function neuron(root,tex){
 const center=V(-2.6,0,0);
 sphere(root,'soma',center,V(1.3,.65,1.2),0xa69abd,{roughness:.58});nucleus(root,V(-2.6,.42,0),.55,tex);er(root,V(-2.6,.08,0),.48,true);
 for(let i=0;i<9;i++){
  const a=(i/9*PI*2),end=V(center.x+Math.cos(a)*2.4,.05,Math.sin(a)*2.2);
  if(Math.cos(a)>.65)continue;
  const midpoint=V(center.x+Math.cos(a)*1.5,.05+Math.sin(a)*.15,Math.sin(a)*1.4);
  curve(root,'dendrites',[center,midpoint,end],.07,0xa78dbb);
  for(let j=0;j<2;j++){const e=end.clone().add(V(-.3+(j*.6),.05,(j?.5:-.5)));curve(root,'dendrites',[midpoint,end,e],.035,0xaf99c0);for(let twig=0;twig<2;twig++){const tip=e.clone().add(V(-.18-twig*.12,.08,(twig?1:-1)*.26));curve(root,'dendrites',[end,e,tip],.017,0xb59ac8)}}
 }
 const axonPoints=[V(-1.4,.05,0),V(0,.1,0),V(1.5,.12,.1),V(3.4,.06,.05),V(4.35,.1,0)];curve(root,'axon',axonPoints,.095,0xa786ba);
 for(let i=0;i<5;i++){
  const x=-.6+i*.87;
  const cylinder=mesh(root,new T.CapsuleGeometry(.23,.47,5,14),material(0xa4c9da,{roughness:.4}),'myelin',V(x,.1,.04));cylinder.rotation.z=PI/2;
  for(let j=0;j<3;j++){const ring=mesh(root,new T.TorusGeometry(.233,.012,5,16),material(0xc4dce3),'myelin',V(x-.18+j*.18,.1,.04));ring.rotation.y=PI/2}
 }
 for(let i=0;i<5;i++){const end=V(5+.15*Math.cos(i),.08,(i-2)*.56);curve(root,'terminals',[V(4.15,.1,0),V(4.55,.12,(i-2)*.22),end],.05,0xa68ab8);sphere(root,'terminals',end,V(.12,.12,.12),0xb695c4)}
 mito(root,V(-3,.44,.75),.1,.35);mito(root,V(-2.0,.45,-.7),1,.3);
 // The membrane is represented by the soma's thin outer skirt.
 const membrane=sphere(root,'membrane',center,V(1.35,.67,1.25),0xb9afcc,{transparent:true,opacity:.15,depthWrite:false});membrane.userData.closedOnly=true;
}
function epithelial(root,tex){
 const back=mesh(root,new T.BoxGeometry(2.7,4.8,.16),textured(0xdd9aa6,tex),'membrane',V(0,1.3,-1));
 for(const x of [-1.37,1.37])mesh(root,new T.BoxGeometry(.13,4.8,1.9),textured(0xdf9da8,tex),'membrane',V(x,1.3,0));
 mesh(root,new T.BoxGeometry(2.8,.18,2),material(0xe2a9b3),'cytoskeleton',V(0,3.75,0));
 const cover=mesh(root,new T.BoxGeometry(2.7,4.8,.06),material(0xe4b4bd,{transparent:true,opacity:.2,depthWrite:false}),'membrane',V(0,1.3,1));cover.userData.closedOnly=true;
 for(let i=0;i<9;i++)for(let j=0;j<5;j++){mesh(root,new T.CapsuleGeometry(.065,.42,4,7),material(0xdb94a3),'microvilli',V(-1.15+i*.28,4.04+(i%2)*.06,-.75+j*.37))}
 mesh(root,new T.BoxGeometry(3.3,.16,2.5),textured(0xb5a2cb,tex),'basement',V(0,-1.22,0));
 for(let i=0;i<7;i++)curve(root,'basement',[V(-1.55,-1.31,-1+i*.33),V(0,-1.34,-.9+i*.33),V(1.55,-1.31,-1+i*.33)],.023,0xd2bbd8);nucleus(root,V(-.12,-.12,0),.8,tex);er(root,V(-.12,-.55,0),.72,true);golgi(root,V(0,1.18,0),.68);
 mito(root,V(-.7,2.6,.2),.6,.5);mito(root,V(.7,.55,.15),-.6,.45);mito(root,V(.6,2.3,.05),.2,.4);
 for(const y of [-.65,1.1,2.9])for(const x of [-1.45,1.45]){const b=mesh(root,new T.TorusGeometry(.13,.045,5,12),material(0x89b4c9),'junctions',V(x,y,.8));b.rotation.y=PI/2}
 for(let i=0;i<12;i++)curve(root,'cytoskeleton',[V(-1.15+i*.21,-.9,-.65),V(-1.1+i*.2,1.3,-.55),V(-1.1+i*.2,3.6,-.65)],.018,0xc480a0);
}
function bacteria(root,tex){
 // Long axis is X; open half-shells expose a membrane-free nucleoid.
 const layers=[['capsule',.94,0xadcbd2],['bacterial-wall',.87,0x6eaaa9],['membrane',.81,0xd3be85]];
 for(const [id,r,color] of layers){const g=group(root,id);const shell=mesh(g,organic(new T.CapsuleGeometry(r,3.35,12,48),.012),textured(color,tex,{side:T.DoubleSide,clippingPlanes:[new T.Plane(V(0,-1,0),.12)],clipShadows:true}),id);shell.rotation.z=PI/2;const full=mesh(g,new T.CapsuleGeometry(r,3.35,10,40),material(color,{transparent:true,opacity:.16,depthWrite:false}),id);full.rotation.z=PI/2;full.userData.closedOnly=true;shell.userData.openOnly=true;}
 sphere(root,'cytosol',V(0,-.28,0),V(2.1,.28,.73),0x8caebe);
 const dna=[];for(let i=0;i<100;i++){const t=i/99;dna.push(V((t-.5)*2.5,.05+.26*Math.sin(t*PI*14)+.09*Math.cos(t*PI*23),.38*Math.sin(t*PI*18)+.07*Math.sin(t*PI*31)))}curve(root,'nucleoid',dna,.065,0x9b70b3);
 for(const x of [-1.2,1.25]){const plasmid=mesh(root,new T.TorusGeometry(.19,.028,6,26),material(0xb388c5),'plasmid',V(x,.05,.3));plasmid.rotation.x=PI/2}
 for(let i=0;i<14;i++){const x=-1.8+i*.28;sphere(root,'membrane',V(x,-.11,.79),V(.035,.075,.035),0xaa9063)}
 dots(root,'bacterial-ribosomes',160,V(0,-.12,0),V(1.95,.25,.64),0xc8acd4,.03);
 for(let i=0;i<30;i++){const x=-2.05+random()*4.1,a=random()*PI*2;curve(root,'pili',[V(x,Math.sin(a)*.87,Math.cos(a)*.87),V(x+.08,Math.sin(a)*1.23,Math.cos(a)*1.23)],.025,0xd29aad)}
 for(let j=0;j<2;j++){const points=[];for(let i=0;i<50;i++){const t=i/49;points.push(V(2.2+t*2.7,.18*Math.sin(t*PI*5+j),j*.4+.32*Math.sin(t*PI*4)))}curve(root,'flagellum',points,.04,0xd5ae63)}
}
function muscle(root,tex){
 const base=mesh(root,new T.CylinderGeometry(1.27,1.27,6.5,40,1,true,0,PI*1.2),textured(0xda8b9b,tex,{side:T.DoubleSide}),'membrane');base.rotation.z=PI/2;base.rotation.x=PI*.4;base.userData.openOnly=true;
 const full=mesh(root,new T.CylinderGeometry(1.3,1.3,6.5,40,1,true),material(0xdb9eaf,{transparent:true,opacity:.16,depthWrite:false}),'membrane');full.rotation.z=PI/2;full.userData.closedOnly=true;
 for(const z of [-.7,0,.7])for(const y of [-.6,0,.6]){
  if(y*y+z*z>1)continue;for(let i=0;i<7;i++){const a=i/7*PI*2;curve(root,'myofibril',[V(-3.26,y+.13*Math.cos(a),z+.13*Math.sin(a)),V(3.28,y+.13*Math.cos(a),z+.13*Math.sin(a))],.012,0xefb6bd)}
  for(let i=0;i<13;i++){const m=mesh(root,new T.CylinderGeometry(.23,.23,.48,14),material(i%2?0xdba0ab:0xbd7188),i===6?'sarcomere':'myofibril',V(-3.03+i*.5,y,z));m.rotation.z=PI/2}
  for(let i=0;i<12;i++){const m=mesh(root,new T.TorusGeometry(.243,.018,5,14),material(0xedbdc2),'sarcomere',V(-2.8+i*.5,y,z));m.rotation.y=PI/2}
 }
 for(const x of [-2.4,-.8,.8,2.4]){
  const points=[];for(let i=0;i<=30;i++){const a=i/30*PI*2;points.push(V(x,1.1*Math.cos(a),1.1*Math.sin(a)))}curve(root,'t-tubule',points,.05,0x83b1ca);
  const sr=[];for(let i=0;i<40;i++){const a=i/39*PI*4;sr.push(V(x+.22*Math.sin(a*2),.97*Math.cos(a),.97*Math.sin(a)))}curve(root,'sarcoplasmic-reticulum',sr,.025,0xb39cc7);
 }
 for(const x of [-2.2,0,2.2]){sphere(root,'nucleus',V(x,-.75,.94),V(.38,.14,.21),0x9964ae,{bumpMap:tex,bumpScale:.05});mito(root,V(x+.3,.62,.65),0,.34)}
}
export function buildCellModel(kind){
 seed=Object.keys(palette).length+(kind.length*177);const root=new T.Group();root.name=kind;const tex=membraneTexture();root.userData.texture=tex;
 if(kind==='plant')plant(root,tex);else if(kind==='animal')animal(root,tex);else if(kind==='leukocyte')animal(root,tex,true);else if(kind==='neuron')neuron(root,tex);else if(kind==='epithelial')epithelial(root,tex);else if(kind==='bacteria')bacteria(root,tex);else if(kind==='muscle')muscle(root,tex);else throw new Error('Unknown specimen '+kind);
 return root;
}
