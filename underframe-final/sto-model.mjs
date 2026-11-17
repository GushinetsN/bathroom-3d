import {INPUTS as I} from './inputs.mjs';
import * as T from './vendor/three.module.js';
import {parts,check} from './compact-design.mjs';
import {SHELF_OUTLINE,TOP_SCREWS,SHELF_SCREWS,STO} from './compact.mjs';

// Millimetres. Holes and relief cuts are geometry, not painted marks.
export function createModel(parameters){
 const root=new T.Group(),items=[],mats={};
 for(const[k,c,r,m]of[['steel',0x242a29,.76,.16],['galvanized',0xb0b5b3,.55,.45],['hardware',0x969e9c,.45,.65],['ply',0xe7d2a5,.7,0],['wood',0x202020,.85,0],['oak',0xb38b59,.65,0],['white',0xf9f7ed,.24,0],['glass',0x22332f,.12,.25],['anchor',0xbb7e3e,.75,0]])mats[k]=new T.MeshStandardMaterial({color:c,roughness:r,metalness:m,side:T.DoubleSide});
 function woodTexture(base,dark,seed){
  if(typeof document==='undefined')return null;
  const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,512,256);
  let s=seed;const rand=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  for(let i=0;i<330;i++){const y=rand()*256;ctx.beginPath();ctx.strokeStyle=dark;ctx.globalAlpha=rand()*.26;ctx.lineWidth=rand()*1.3+.3;ctx.moveTo(0,y);for(let x=0;x<=512;x+=16)ctx.lineTo(x,y+Math.sin(x/70+i)*rand()*5);ctx.stroke();}ctx.globalAlpha=1;
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;
 }
 mats.oak.map=woodTexture('#d5b27d','#65472c',53);mats.ply.map=woodTexture('#efddba','#a58c60',91);
 if(mats.oak.map)mats.oak.color.set(0xffffff);if(mats.ply.map)mats.ply.color.set(0xffffff);
 const mesh=(p,g,m,name)=>{const o=new T.Mesh(g,m);o.name=name||'';o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
 function box(p,w,h,d,x,y,z,m,name){const o=mesh(p,new T.BoxGeometry(w,h,d),m,name);o.position.set(x+w/2,y+h/2,z+d/2);return o;}
 function cyl(p,r,h,x,y,z,m,axis='y',n=24){const o=mesh(p,new T.CylinderGeometry(r,r,h,n),m);o.position.set(x,y,z);if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;return o;}
 const cache=new Map();
 function sheet(poly,holes,depth=2){
  const key=JSON.stringify([poly,holes,depth]);if(cache.has(key))return cache.get(key);
  const s=new T.Shape();poly.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
  for(const[x,y,r]of holes){const h=new T.Path();h.absarc(x,y,r,0,2*Math.PI,true);s.holes.push(h);}
  const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:16});cache.set(key,g);return g;
 }
 const rect=(w,l)=>[[0,0],[w,0],[w,l],[0,l]];
 function plate(w,L,across,phase,start=0,end=0,extra=[]){
  const holes=[];for(let y=phase;y<L;y+=25)if(y-4>start&&y+4<L-end)holes.push([across,y-start,4]);
  for(const[x,y,r=3.25]of extra)holes.push([x,y-start,r]);
  return sheet(rect(w,L-start-end),holes);
 }
 function angle(p,a){
  const wrapper=new T.Group(),g=new T.Group();p.add(wrapper);wrapper.add(g);g.scale.set(a.sx,1,a.sz);
  mesh(g,plate(STO.width,a.length,STO.across,a.phase,0,0,a.drill1),mats.steel,'flange1');
  const start=a.web2Start??a.webStart??0,end=a.web2End??a.webEnd??0;
  for(const[lo,hi]of a.flange2Segments??[[start,a.length-end]]){const b=mesh(g,plate(STO.width-2,a.length,STO.across-2,a.phase,lo,a.length-hi,a.drill2),mats.steel,'flange2');b.rotation.y=-Math.PI/2;b.position.set(2,lo,2);}
  if(a.axis==='x')wrapper.rotation.z=-Math.PI/2;if(a.axis==='z')wrapper.rotation.x=Math.PI/2;
 }
 function ring(p,outer,inner,h,y,hex=false,name=''){
  const poly=Array.from({length:hex?6:48},(_,i)=>{const a=i*2*Math.PI/(hex?6:48);return[outer*Math.cos(a),outer*Math.sin(a)];});
  const g=sheet(poly,[[0,0,inner]],h),o=mesh(p,g,mats.hardware,name);o.rotation.x=-Math.PI/2;o.position.y=y;return o;
 }
 function horizontalSheet(p,w,d,h,x,y,z,holes,m,name){const o=mesh(p,sheet(rect(w,d),holes,h),m,name);o.rotation.x=-Math.PI/2;o.position.set(x,y,z+d);return o;}
 function wood(p,a){
  const {sx,sz,chamfer:c}=a.corner,h=a.size[1],pilot=a.endPilot,w=a.size[0],half=w/2;
  const plan=[[c,0],[w,0],[w,w],[0,w],[0,c]].map(([u,v])=>[sx>0?u:w-u,sz>0?v:w-v]);
  const poly=plan.map(([x,z])=>[x,w-z]);
  const slice=(low,high,holes,name)=>{const o=mesh(p,sheet(poly,holes,high-low),mats.wood,name);o.rotation.x=-Math.PI/2;o.position.set(0,low,w);};
  slice(0,2,[[half,half,12.5]],'T-nut-flange-recess');
  slice(2,28,[[half,half,6]],'M10-blind-socket');
  slice(28,h-pilot.depth,[],'solid-wood');
  slice(h-pilot.depth,h,[[pilot.x,w-pilot.z,pilot.diameter/2]],'blind-end-pilot');
 }

 for(const a of parts(parameters)){
  const g=new T.Group();g.name=a.id;g.position.set(...a.position);g.userData.part=a;root.add(g);items.push(g);
  if(a.kind==='angle')angle(g,a);
  if(a.kind==='box'){
   if(a.drillY)horizontalSheet(g,a.size[0],a.size[2],a.size[1],0,0,0,a.drillY.map(([x,z])=>[x,a.size[2]-z,2.5]),mats[a.material]);
   else if(a.id==='P1'){
    // Blind pilot holes9mm into18mm plywood; remaining cap is solid.
    const holes=SHELF_SCREWS.map(([x,z])=>[x-a.position[0],a.size[2]-(z-a.position[2]),1.25]);
    const poly=SHELF_OUTLINE.map(([x,z])=>[x,a.size[2]-z]);
    const b=mesh(g,sheet(poly,holes,10),mats.ply);b.rotation.x=-Math.PI/2;b.position.z=a.size[2];
    const t=mesh(g,sheet(poly,[],8),mats.ply);t.rotation.x=-Math.PI/2;t.position.set(0,10,a.size[2]);
   }else box(g,...a.size,0,0,0,mats[a.material]);
  }
  if(a.kind==='slab'){
   const screws=TOP_SCREWS.map(([x,z])=>[x-a.position[0],a.size[2]-(z-a.position[2]),I.fixing.top.pilotDiameter/2]);
   const depth=I.fixing.top.pilotDepth;
   horizontalSheet(g,a.size[0],a.size[2],depth,0,0,0,screws,mats.oak,'blind-top-pilots');
   box(g,a.size[0],a.size[1]-depth,a.size[2],0,depth,0,mats.oak,'solid-oak-cap');
  }
  if(a.kind==='block')wood(g,a);
  if(a.kind==='insert'){ring(g,12.5,5.2,2,0,false,'T-nut-flange');ring(g,6,5,11,2,false,'T-nut-body');}
  if(a.kind==='foot'){
   const f=I.foot,base=a.base;
   cyl(g,f.baseDiameter/2,f.baseHeight,0,f.baseHeight/2,0,mats.steel);
   cyl(g,4.9,f.studLength,0,f.baseHeight+f.studLength/2,0,mats.hardware);
   ring(g,15/Math.sqrt(3),5.1,8.2,base-14,true,'M10-locknut');
   ring(g,10.9,5.1,1.8,base-5.8,false,'M10-nut-flange');
   horizontalSheet(g,40,40,4,-20,base-4,-20,[[20,20,I.foot.plateHole/2]],mats.hardware,'bearing-plate');
  }
  if(a.kind==='fitting'){
   const o=mesh(g,sheet(a.polygon,a.holes.map(([x,y])=>[x,y,(a.holeDiameter??6.5)/2]),a.size[2]),mats[a.material]);
   o.applyMatrix4(new T.Matrix4().makeBasis(new T.Vector3(...a.u),new T.Vector3(...a.v),new T.Vector3(...a.normal)));
  }
  if(a.kind==='flatwasher'){
   const b=new T.Group();g.add(b);b.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...a.axisVector));
   ring(b,a.outer/2,a.inner/2,a.thickness,0,false,'gusset-spacer');
  }
  if(a.kind==='pad'){
   const axis=a.size[0]===2?'x':'z',w=axis==='x'?a.size[2]:a.size[0],d=2;
   const holes=a.holes.map(b=>[axis==='x'?w-b.at:b.at,b.y,a.reused?4:3.25]);const o=mesh(g,sheet(rect(w,a.size[1]),holes,d),mats.steel);
   if(axis==='x'){o.rotation.y=Math.PI/2;o.position.z=w;}
  }
  if(a.kind==='brace'){
   const dir=new T.Vector3(...a.end).sub(new T.Vector3(...a.position));
   const allowance=a.endAllowance??25;
   const o=mesh(g,sheet(rect(25,a.length),[[12.5,allowance,3.25],[12.5,a.length-allowance,3.25]],2),mats.steel);
   const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.clone().normalize());o.quaternion.copy(q);o.position.copy(new T.Vector3(-12.5,-allowance,-1).applyQuaternion(q));
  }
  if(a.kind==='bolt'){
   const b=new T.Group();g.add(b);b.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...a.axisVector));
   const shank=cyl(b,3,a.length,0,a.length/2,0,mats.hardware);shank.name='shank';
   const flange=a.standard==='ISO7380-1'?0:.6;
   if(flange)cyl(b,6.8,flange,0,-flange/2,0,mats.hardware).name='head-flange';
   // Nominal low-head envelope; actual supplied heads still require measurement.
   const head=mesh(b,sheet(Array.from({length:40},(_,i)=>[5.25*Math.cos(i*Math.PI/20),5.25*Math.sin(i*Math.PI/20)]),[[0,0,2]],3.3-flange),mats.hardware,'head-button');head.rotation.x=Math.PI/2;head.position.y=-flange;
   if(a.nut==='nyloc'){ring(b,9,3.2,1.6,a.grip,false,'nut-washer');ring(b,10/Math.sqrt(3),2.6,6,a.grip+1.6,true,'M6-nyloc');}
   else{ring(b,7.1,3.2,1.1,a.grip,false,'nut-flange');ring(b,10/Math.sqrt(3),2.6,4.9,a.grip+1.1,true,'nut-hex');}
   if(a.spacer)for(const y of[2,3.6])ring(b,9,3.2,1.6,y,false,'brace-spacer');
  }
  if(a.kind==='screw'){
   const b=new T.Group();g.add(b);b.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...a.axisVector));
   const t=a.washerThickness||1,d=a.diameter||4;
   ring(b,(a.washerOuter||12)/2,(a.washerInner||4.3)/2,t,-t,false,'screw-washer');
   cyl(b,d/2,a.length,0,a.length/2-t,0,mats.hardware).name='screw-shank';
   cyl(b,d,2.6,0,-t-1.3,0,mats.hardware).name='screw-head';
  }
  if(a.kind==='basin'){
   const profile=[[.12,0],[.75,0],[.82,8],[.83,45],[.96,105],[1,135],[.98,140],[.94,140],[.88,122],[.77,70],[.57,32],[.12,27]];
   const o=mesh(g,new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),80),mats.white);o.scale.set(250,1,180);cyl(g,22,2,0,28,0,mats.hardware);
  }
  if(a.kind==='mixer'){
   cyl(g,17.5,105,0,52.5,0,mats.steel);
   const points=[[0,105,0],[0,240,0],[55,297,-10],[120,270,-45],[135,185,-125]].map(v=>new T.Vector3(...v));
   const curve=new T.CatmullRomCurve3(points),length=curve.getLength(),scale=I.faucet.flexLength/length;
   // Scale displacement around the rigid base to preserve flexible tube length445.
   for(const v of points)v.sub(new T.Vector3(0,105,0)).multiplyScalar(scale).add(new T.Vector3(0,105,0));
   mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points),60,8,12,false),mats.steel);
   box(g,5,40,5,25,45,-2.5,mats.steel);
  }
  if(a.kind==='washer'){
   const[w,h,d]=a.size;box(g,w,h,d,0,0,0,mats.white);box(g,w-4,2,d-4,2,h-4,2,mats.hardware);box(g,w-24,95,3,12,h-115,-3,mats.white);box(g,145,22,3,w-172,h-72,-7,mats.steel);
   cyl(g,22,9,85,h-63,-10,mats.hardware,'z');cyl(g,205,17,w/2,h*.46,-9,mats.hardware,'z',64);cyl(g,181,22,w/2,h*.46,-24,mats.steel,'z',64);cyl(g,154,2,w/2,h*.46,-36,mats.glass,'z',64);box(g,22,92,10,w/2-182,h*.46-46,-42,mats.white);
   for(const x of[30,w-30])for(const z of[35,d-35])cyl(g,15,7,x,3.5,z,mats.steel);
  }
  if(a.finish==='black-head'&&a.kind==='bolt')for(const child of g.children[0].children)if(child.name.startsWith('head'))child.material=mats.steel;
  if(a.finish==='paint-visible-black')g.traverse(o=>{if(o.isMesh&&o.material===mats.hardware)o.material=mats.steel;});
  g.userData.base=g.position.clone();g.userData.direction=new T.Vector3((a.position[0]-600)*.34,(a.position[1]-400)*.28,(a.position[2]-300)*.65);
  if(a.id==='T1'||['basin','mixer'].includes(a.kind))g.userData.direction.set(0,a.id==='T1'?180:340,0);if(a.kind==='washer')g.userData.direction.set(-100,0,-250);
 }
 root.updateMatrixWorld(true);
 return{root,items,mats,check:check(parameters),dispose(){const gs=new Set(),ms=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});for(const g of gs)g.dispose();for(const m of ms){m.map?.dispose();m.dispose();}}};
}
