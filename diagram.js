// Original SVG specimens. All structures remain real, keyboard-accessible targets.
const structureColors={nucleus:'#9b6eb1',nucleolus:'#6b3c89',mitochondrion:'#d89a49','rough-er':'#7d96ba','smooth-er':'#b6a5c2',golgi:'#d28b77',ribosomes:'#827354',membrane:'#b39c69',cytosol:'#d9cdb2',lysosome:'#c77a9c',chloroplast:'#89a954',vacuole:'#8ebecb',wall:'#799253',peroxisome:'#80a88c',centrosome:'#ac9369',cytoskeleton:'#b4a38a',vesicle:'#cfb485'};
function renderCellArtwork(model,active,showLabels){
 const plant=model==='plant';
 const animalShape='M165 111C250 49 414 45 533 70C664 95 739 175 716 297C692 421 614 494 489 512C347 535 186 497 112 410C34 316 58 186 165 111Z';
 const plantShape='M147 67Q112 64 103 112L83 414Q79 461 127 477L633 510Q685 514 697 461L728 151Q731 108 684 98Z';
 const shape=plant?plantShape:animalShape;
 const nucleusX=plant?264:284,nucleusY=plant?293:278;
 let out=`<defs>
 <radialGradient id="cell-fluid" cx="42%" cy="35%" r="72%"><stop stop-color="${plant?'#f0f1c9':'#faf0d4'}"/><stop offset=".75" stop-color="${plant?'#d8e5ac':'#eee0b9'}"/><stop offset="1" stop-color="${plant?'#b5ca8e':'#d6c08d'}"/></radialGradient>
 <linearGradient id="wall-rim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b7c77e"/><stop offset=".35" stop-color="#718b45"/><stop offset=".6" stop-color="#a1b665"/><stop offset="1" stop-color="#52763e"/></linearGradient>
 <radialGradient id="nuclear-fill" cx="35%" cy="28%"><stop stop-color="#d6b7dd"/><stop offset=".6" stop-color="#b08abe"/><stop offset="1" stop-color="#88649e"/></radialGradient>
 <radialGradient id="nucleolar-fill" cx="32%" cy="28%"><stop stop-color="#ad7ac3"/><stop offset=".6" stop-color="#794296"/><stop offset="1" stop-color="#532d70"/></radialGradient>
 <linearGradient id="mito-shell" x2="0" y2="1"><stop stop-color="#f4cd7e"/><stop offset=".4" stop-color="#dba04e"/><stop offset="1" stop-color="#b87436"/></linearGradient>
 <linearGradient id="er-fill" x2=".5" y2="1"><stop stop-color="#c2d1e4"/><stop offset=".55" stop-color="#92a8c9"/><stop offset="1" stop-color="#637d9e"/></linearGradient>
 <linearGradient id="golgi-fill" x2="0" y2="1"><stop stop-color="#edb398"/><stop offset=".45" stop-color="#d3836f"/><stop offset="1" stop-color="#a55e50"/></linearGradient>
 <radialGradient id="chloro-fill" cx="35%" cy="30%"><stop stop-color="#e2e8a8"/><stop offset=".65" stop-color="#a8c471"/><stop offset="1" stop-color="#6d934c"/></radialGradient>
 <radialGradient id="vacuole-fill" cx="35%" cy="30%"><stop stop-color="#d5ece6"/><stop offset=".65" stop-color="#b1d5d2"/><stop offset="1" stop-color="#8eb9bf"/></radialGradient>
 <radialGradient id="lysosome-fill" cx="30%" cy="25%"><stop stop-color="#e9b3c3"/><stop offset="1" stop-color="#b16686"/></radialGradient>
 <radialGradient id="perox-fill" cx="30%" cy="25%"><stop stop-color="#c0d5ad"/><stop offset="1" stop-color="#6d9977"/></radialGradient>
 <filter id="specimen-shadow" x="-15%" y="-15%" width="140%" height="150%"><feDropShadow dx="2" dy="10" stdDeviation="9" flood-color="#504a2d" flood-opacity=".14"/></filter>
 <filter id="org-shadow" x="-25%" y="-30%" width="160%" height="180%"><feDropShadow dx="1" dy="3" stdDeviation="2" flood-color="#4e422e" flood-opacity=".19"/></filter>
 <clipPath id="cytoplasm-clip"><path d="${shape}"/></clipPath>
 <clipPath id="nuclear-clip"><ellipse cx="${nucleusX}" cy="${nucleusY}" rx="75" ry="70"/></clipPath>
 </defs>`;
 if(plant){
  out+=group('wall',`<path d="${shape}" transform="translate(0 13)" fill="#6c8643" stroke="#56713b" stroke-width="29"/><path d="${shape}" fill="none" stroke="url(#wall-rim)" stroke-width="31" stroke-linejoin="round" filter="url(#specimen-shadow)"/><path d="${shape}" fill="none" stroke="#c2d293" stroke-width="3" transform="translate(-5 -7)"/><g stroke="#6d8549" stroke-width="2" opacity=".5">${Array.from({length:21},(_,i)=>`<path d="M${147+i*24} ${67+i*1.52}l-1-13M${128+i*24} ${477+i*1.56}v17"/>`).join('')}</g>`);
 }
 // A raised edge and a separate inner boundary make the membrane distinct from the wall.
 out+=group('membrane',`<path d="${shape}" fill="url(#cell-fluid)" stroke="${plant?'#839f5b':'#bb9b56'}" stroke-width="8" filter="url(#specimen-shadow)"/><path d="${shape}" fill="none" stroke="${plant?'#e3ecc0':'#fff4d5'}" stroke-width="2" transform="translate(-2 -2)"/>`);
 out+=group('cytosol',`<path d="${shape}" fill="transparent" pointer-events="fill"/><g clip-path="url(#cytoplasm-clip)" fill="#aa985f" opacity=".22">${Array.from({length:175},(_,i)=>`<circle cx="${85+(i*73)%640}" cy="${76+(i*97)%440}" r="${.5+(i%4)*.3}"/>`).join('')}</g>`);
 // Cytoskeletal fibers are behind the membrane compartments, not drawn through them.
 out+=group('cytoskeleton',`<g clip-path="url(#cytoplasm-clip)" fill="none" stroke-linecap="round"><g stroke="#b0a48b" stroke-width="3" opacity=".65"><path d="M127 167Q339 151 518 266T674 424M123 416Q357 346 518 266T651 123M221 93Q428 137 518 266T474 495"/></g><g stroke="#c18b9f" stroke-width="1.6" opacity=".6"><path d="M126 341Q440 453 630 210M194 463Q579 421 663 171M169 123Q529 121 681 340M101 285Q359 490 609 460"/></g><path d="M130 216Q406 81 610 133M204 477Q511 470 669 300" stroke="#c4b895" stroke-width="1.5" stroke-dasharray="4 3"/></g>`);
 // Free ribosomes stay outside the nucleus and, in the plant, outside the central vacuole.
 let ribos='';
 for(let i=0;i<155;i++){
  const x=115+(i*107)%570,y=105+(i*71)%365;
  if(((x-400)/285)**2+((y-285)/200)**2>1||((x-nucleusX)/106)**2+((y-nucleusY)/100)**2<1)continue;
  if(plant&&x>362&&x<605&&y>155&&y<399)continue;
  ribos+=`<circle cx="${x}" cy="${y}" r="1.9" fill="#7f7053"/><circle cx="${x+2.5}" cy="${y+1.5}" r="1.3" fill="#9b8a65"/><circle cx="${x}" cy="${y}" r="6" fill="transparent"/>`;
 }
 out+=group('ribosomes',ribos);
 if(plant)out+=group('vacuole',`<path d="M407 141C480 116 604 154 622 211C642 281 615 383 553 414C495 446 407 419 382 371C352 313 361 194 407 141Z" fill="url(#vacuole-fill)" stroke="#719da2" stroke-width="3" filter="url(#org-shadow)"/><path d="M411 150C476 134 568 153 599 193" fill="none" stroke="#f3fbeb" stroke-width="5" opacity=".75"/><path d="M393 366Q435 422 529 409" fill="none" stroke="#87b2b4" stroke-width="2" opacity=".5"/>`);
 // Flattened rough ER wraps around the nuclear envelope; each ribbon has a lumen.
 let rough='';
 for(let i=0;i<6;i++){
  const d=`M${nucleusX+13} ${nucleusY-101-i*9}C${nucleusX-116-i*7} ${nucleusY-133-i*3} ${nucleusX-129-i*5} ${nucleusY+7} ${nucleusX-84-i*3} ${nucleusY+78+i*6}Q${nucleusX-39} ${nucleusY+130+i*6} ${nucleusX+64+i*3} ${nucleusY+83+i*8}`;
  rough+=`<path d="${d}" fill="none" stroke="#5c7598" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#b7c9df" stroke-width="4.5" stroke-linecap="round"/>`;
  for(let j=0;j<9;j++){
   const angle=2.15+j*.23;
   const x=nucleusX+Math.cos(angle)*(105+i*7),y=nucleusY+Math.sin(angle)*(100+i*6);
   rough+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.7" fill="#405474"/>`;
  }
 }
 out+=group('rough-er',rough);
 out+=group('smooth-er',`<g transform="${plant?'translate(70 35) scale(.6)':'translate(0 0)'}"><g fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#org-shadow)"><g stroke="#8d789e" stroke-width="10"><path d="M370 180q16-42 44-25t40-13q22-30 40 0t41-8M376 203q35-32 52-5t40-13q20-26 43 4t35-16M411 156l-7-27m48 19 8-28m7 68 2 31m42-32 15 24"/></g><g stroke="#cebdd2" stroke-width="4"><path d="M370 178q16-42 44-25t40-13q22-30 40 0t41-8M376 201q35-32 52-5t40-13q20-26 43 4t35-16M411 154l-7-27m48 19 8-28m7 68 2 31m42-32 15 24"/></g></g></g>`);
 let nuclear=`<ellipse cx="${nucleusX}" cy="${nucleusY+4}" rx="88" ry="82" fill="#775486" filter="url(#org-shadow)"/><ellipse cx="${nucleusX}" cy="${nucleusY}" rx="87" ry="81" fill="url(#nuclear-fill)" stroke="#6d537c" stroke-width="3"/><ellipse cx="${nucleusX}" cy="${nucleusY}" rx="79" ry="74" fill="none" stroke="#dfc4e4" stroke-width="2"/><g clip-path="url(#nuclear-clip)" fill="none" stroke="#80518f" stroke-width="1.2" opacity=".6">`;
 for(let i=0;i<20;i++){
  const x=nucleusX-70+(i*37)%145,y=nucleusY-66+(i*29)%130;
  nuclear+=`<path d="M${x} ${y}q-14-18-22 0t19 20t23-17q-14-19-21 4t20 16"/>`;
 }
 nuclear+='</g>';
 for(let i=0;i<20;i++){
  const a=i*Math.PI/10,x=nucleusX+84*Math.cos(a),y=nucleusY+78*Math.sin(a);
  nuclear+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${i*18})"><ellipse rx="4.2" ry="2.8" fill="#624473" stroke="#c6a3d4" stroke-width="1.2"/><ellipse rx="1.7" ry="1" fill="#e0c5e4"/></g>`;
 }
 nuclear+=`<path d="M${nucleusX-54} ${nucleusY-43}Q${nucleusX-12} ${nucleusY-81} ${nucleusX+39} ${nucleusY-54}" fill="none" stroke="#ecd8f0" stroke-width="4" opacity=".4"/>`;
 out+=group('nucleus',nuclear);
 out+=group('nucleolus',`<circle cx="${nucleusX-12}" cy="${nucleusY+4}" r="25" fill="url(#nucleolar-fill)" stroke="#6d4385" stroke-width="1.5"/><ellipse cx="${nucleusX-19}" cy="${nucleusY-5}" rx="10" ry="6" fill="#c291d6" opacity=".32"/><g fill="#592c75" opacity=".45">${Array.from({length:18},(_,i)=>`<circle cx="${nucleusX-29+(i*13)%34}" cy="${nucleusY-12+(i*17)%33}" r="1"/>`).join('')}</g>`);
 function mito(x,y,angle,scale=1){
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})" filter="url(#org-shadow)"><path d="M-50-15C-40-40 5-33 39-15C68 1 53 24 26 28C-7 34-65 17-50-15Z" fill="url(#mito-shell)" stroke="#a96e37" stroke-width="2"/><path d="M-45-10C-35-30 2-24 34-11C53-2 48 16 23 21C-5 28-52 12-45-10Z" fill="#f4d58c" stroke="#c68143" stroke-width="2"/><path d="M-35-9q-10 15 3 19l8-25q4-7 9 0l-4 30q7 4 12 1l6-26q3-7 8 0l1 24q7 2 11-3l-1-16q2-8 8-2l7 10" fill="none" stroke="#bd793d" stroke-width="4" stroke-linecap="round"/><path d="M-43-16Q-17-33 23-17" fill="none" stroke="#fff0b5" stroke-width="2" opacity=".8"/></g>`;
 }
 out+=group('mitochondrion',plant?mito(179,360,-60,.66)+mito(532,455,-12,.73):mito(222,123,16,.73)+mito(587,145,34,.92)+mito(587,397,-28,.83)+mito(205,437,-28,.71));
 // The Golgi ribbons are shallow sacks, with small carriers budding at their tips.
 const gx=plant?432:446,gy=plant?424:387;
 let golgi='';
 for(let i=0;i<6;i++){
  const y=gy+i*11,width=106-i*8;
  golgi+=`<path d="M${gx-width/2} ${y}q${width/2} 24 ${width} -5l-4 8q-${width/2} 28-${width-7} 5Z" fill="url(#golgi-fill)" stroke="#a76959" stroke-width="1.2"/><path d="M${gx-width/2+4} ${y+1}q${width/2-2} 20 ${width-10} -3" fill="none" stroke="#f4c4a8" stroke-width="2"/>`;
 }
 for(let i=0;i<7;i++)golgi+=`<circle cx="${gx+60+(i%3)*9}" cy="${gy+8+i*9}" r="${3+(i%3)}" fill="#e1a48c" stroke="#b97f67" stroke-width="1"/>`;
 out+=group('golgi',`<g filter="url(#org-shadow)">${golgi}</g>`);
 if(!plant){
  out+=group('centrosome',`<g transform="translate(526 266) rotate(-24)" filter="url(#org-shadow)"><rect x="-24" y="-13" width="46" height="16" rx="5" fill="#baac80" stroke="#8c7d5c" stroke-width="1.5"/><g stroke="#7e7659" stroke-width="2">${Array.from({length:8},(_,i)=>`<path d="M${-18+i*5}-12V2"/>`).join('')}</g><g transform="translate(12 20) rotate(82)"><rect x="-22" y="-9" width="44" height="17" rx="5" fill="#c1b38d" stroke="#8c7d5c" stroke-width="1.5"/>${Array.from({length:8},(_,i)=>`<path d="M${-18+i*5}-8V7" stroke="#817657" stroke-width="2"/>`).join('')}</g></g>`);
  out+=group('lysosome',[[414,445,15],[643,311,13],[621,282,9]].map(([x,y,r])=>`<g filter="url(#org-shadow)"><circle cx="${x}" cy="${y}" r="${r}" fill="url(#lysosome-fill)" stroke="#aa6583" stroke-width="1.4"/><g fill="#974e72" opacity=".6">${Array.from({length:7},(_,i)=>`<circle cx="${x-r*.5+(i*5)%(r)}" cy="${y-r*.5+(i*7)%(r)}" r="1.4"/>`).join('')}</g></g>`).join(''));
 }
 out+=group('peroxisome',[[plant?348:524,plant?445:448,14],[plant?169:611,plant?222:233,10]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#perox-fill)" stroke="#6c9470" stroke-width="1.4"/><path d="M${x-4} ${y-4}h8v8h-8Z" fill="#739b72" opacity=".6"/><circle cx="${x-3}" cy="${y-6}" r="3" fill="#e2e9ba" opacity=".5"/>`).join(''));
 out+=group('vesicle',[[plant?520:537,plant?475:367,9],[plant?603:655,plant?430:359,15],[plant?624:672,plant?446:345,6],[plant?549:568,plant?425:348,5],[plant?503:518,plant?453:395,6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#e7d4a9" stroke="#b89c69" stroke-width="1.5"/><circle cx="${x-2}" cy="${y-3}" r="${r*.5}" fill="#fff0c9" opacity=".65"/>`).join(''));
 if(plant){
  let chloros='';
  for(const [x,y,a,size] of [[189,143,-18,.8],[624,180,67,.88],[638,374,72,.88],[205,433,14,.8]]){
   let discs='';
   for(let col=0;col<4;col++){
    const cx=-32+col*21;
    for(let row=0;row<4;row++)discs+=`<ellipse cx="${cx}" cy="${-10+row*5}" rx="8" ry="3.4" fill="${row%2?'#648b36':'#87a74b'}" stroke="#557a30" stroke-width=".8"/>`;
    if(col<3)discs+=`<path d="M${cx+7} 4h8" stroke="#709544" stroke-width="2"/>`;
   }
   chloros+=`<g transform="translate(${x} ${y}) rotate(${a}) scale(${size})" filter="url(#org-shadow)"><ellipse rx="57" ry="28" fill="#809e4b" stroke="#587b35" stroke-width="2"/><ellipse cy="-3" rx="52" ry="24" fill="url(#chloro-fill)" stroke="#c7d698" stroke-width="2"/>${discs}<path d="M-44-16Q-20-29 21-18" fill="none" stroke="#edf1bc" stroke-width="2" opacity=".7"/></g>`;
  }
  out+=group('chloroplast',chloros);
 }
 // Short callouts keep text outside the dense illustration. The list covers all structures.
 const labels=plant?[
  ['wall',97,42,140,69,'start'],['chloroplast',587,58,622,153,'start'],['vacuole',523,254,493,288,'middle'],['nucleus',26,278,182,290,'start'],['rough-er',27,365,149,354,'start'],['mitochondrion',392,555,515,458,'middle'],['membrane',675,535,682,479,'middle'],['golgi',270,516,418,441,'middle']
 ]:[
  ['membrane',575,54,601,100,'start'],['mitochondrion',289,50,235,111,'middle'],['smooth-er',529,92,489,145,'middle'],['nucleus',17,255,201,269,'start'],['nucleolus',17,293,261,283,'start'],['rough-er',17,371,144,350,'start'],['golgi',319,545,432,420,'middle'],['centrosome',701,239,542,271,'end'],['lysosome',739,310,648,311,'end'],['peroxisome',610,550,530,456,'middle']
 ];
 if(showLabels){
  out+=`<g class="specimen-callouts">${labels.map(([id,x,y,tx,ty,anchor])=>`<path d="M${x} ${y+5}H${x+(tx>x?12:-12)}L${tx} ${ty}"/><circle cx="${tx}" cy="${ty}" r="2"/><text x="${x}" y="${y}" text-anchor="${anchor}">${structures.find(s=>s.id===id).name}</text>`).join('')}</g>`;
 }
 return out;
}
