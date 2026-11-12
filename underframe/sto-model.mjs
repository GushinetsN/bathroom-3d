import * as T from '../vendor/three.module.js';
import {parts,check} from './compact-design.mjs';
import {SHELF_OUTLINE,TOP_SCREWS,SHELF_SCREWS} from './compact.mjs';

// Millimetres. Holes and relief cuts are geometry, not painted marks.
export function createModel(parameters){
 const root=new T.Group(),items=[],mats={};
 for(const[k,c,r,m]of[['steel',0x242a29,.76,.16],['hardware',0x969e9c,.45,.65],['ply',0xe7d2a5,.7,0],['wood',0xd5b588,.75,0],['oak',0xb38b59,.65,0],['white',0xf9f7ed,.24,0],['glass',0x22332f,.12,.25],['anchor',0xbb7e3e,.75,0]])mats[k]=new T.MeshStandardMaterial({color:c,roughness:r,metalness:m,side:T.DoubleSide});
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
  mesh(g,plate(30,a.length,15,a.phase,0,0,a.drill1),mats.steel,'flange1');
  const start=a.web2Start??a.webStart??0,end=a.web2End??a.webEnd??0;
  const b=mesh(g,plate(28,a.length,13,a.phase,start,end,a.drill2),mats.steel,'flange2');b.rotation.y=-Math.PI/2;b.position.set(2,start,2);
  if(a.axis==='x')wrapper.rotation.z=-Math.PI/2;if(a.axis==='z')wrapper.rotation.x=Math.PI/2;
 }
 function ring(p,outer,inner,h,y,hex=false,name=''){
  const poly=Array.from({length:hex?6:48},(_,i)=>{const a=i*2*Math.PI/(hex?6:48);return[outer*Math.cos(a),outer*Math.sin(a)];});
  const g=sheet(poly,[[0,0,inner]],h),o=mesh(p,g,mats.hardware,name);o.rotation.x=-Math.PI/2;o.position.y=y;return o;
 }
 function horizontalSheet(p,w,d,h,x,y,z,holes,m,name){const o=mesh(p,sheet(rect(w,d),holes,h),m,name);o.rotation.x=-Math.PI/2;o.position.set(x,y,z+d);return o;}
 function wood(p,a){
  // Slice at bore bands; each slice is a through-extruded shape. Blind vertical
  // socket ends at35, and cross bores never share a band.
  const bands=a.bores.map(b=>({...b,lo:b.y-a.position[1]-4.25,hi:b.y-a.position[1]+4.25})).sort((a,b)=>a.lo-b.lo);
  const solid=(lo,hi)=>{if(hi>lo)box(p,27,hi-lo,27,0,lo,0,mats.wood);};
  horizontalSheet(p,27,27,35,0,0,0,[[13.5,13.5,7.2]],mats.wood,'blind-socket');let cursor=35;
  for(const b of bands){solid(cursor,b.lo);const y=b.y-a.position[1]-b.lo;
   if(b.axis==='z'){const at=b.at-a.position[0],o=mesh(p,sheet(rect(27,b.hi-b.lo),[[at,y,3.25]],27),mats.wood,'wood-bore-z');o.position.y=b.lo;}
   else{const at=b.at-a.position[2],o=mesh(p,sheet(rect(27,b.hi-b.lo),[[27-at,y,3.25]],27),mats.wood,'wood-bore-x');o.rotation.y=Math.PI/2;o.position.set(0,b.lo,27);}
   cursor=b.hi;
  }solid(cursor,a.size[1]);
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
   const holes=a.pockets.map(([x,z])=>[x,600-z,11]);
   // Six screw pilots are also blind and remain below the upper14mm cap.
   const screws=TOP_SCREWS.map(([x,z])=>[x,600-z,1.25]);
   horizontalSheet(g,1200,600,6,0,0,0,[...holes,...screws],mats.oak,'underside-pockets');
   horizontalSheet(g,1200,600,6,0,6,0,screws,mats.oak);box(g,1200,14,600,0,12,0,mats.oak);
  }
  if(a.kind==='block')wood(g,a);
  if(a.kind==='insert')ring(g,7.2,5.2,20,0,false,'M10-insert');
  if(a.kind==='foot'){
   cyl(g,15,4,0,2,0,mats.steel);cyl(g,4.7,40,0,24,0,mats.hardware);
   const w=a.plateWidth||35,base=a.base||20.5;
   ring(g,9.8,5.2,8,base-11,true,'M10-locknut');horizontalSheet(g,w,w,3,-w/2,base-3,-w/2,[[w/2,w/2,5.5]],mats.hardware,'bearing-plate');
  }
  if(a.kind==='fitting'){
   const o=mesh(g,sheet(a.polygon,a.holes.map(([x,y])=>[x,y,3.25]),a.size[2]),mats.steel);
   o.applyMatrix4(new T.Matrix4().makeBasis(new T.Vector3(...a.u),new T.Vector3(...a.v),new T.Vector3(...a.normal)));
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
   cyl(b,7.1,1.1,0,-.55,0,mats.hardware).name='head-flange';cyl(b,10/Math.sqrt(3),5.5,0,-3.85,0,mats.hardware,'y',6).name='head-hex';
   if(a.nut==='nyloc'){ring(b,9,3.2,1.6,a.grip,false,'nut-washer');ring(b,10/Math.sqrt(3),2.6,6,a.grip+1.6,true,'M6-nyloc');}
   else{ring(b,7.1,3.2,1.1,a.grip,false,'nut-flange');ring(b,10/Math.sqrt(3),2.6,4.9,a.grip+1.1,true,'nut-hex');}
   if(a.spacer)for(const y of[2,3.6])ring(b,9,3.2,1.6,y,false,'brace-spacer');
  }
  if(a.kind==='screw'){
   const b=new T.Group();g.add(b);b.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...a.axisVector));
   ring(b,6,2.15,1,-1,false,'screw-washer');cyl(b,2,a.length,0,a.length/2-1,0,mats.hardware);cyl(b,3.8,2.6,0,-2.3,0,mats.hardware);
  }
  if(a.kind==='basin'){
   const profile=[[.12,0],[.45,0],[.66,8],[.83,45],[.96,105],[1,135],[.98,140],[.94,140],[.88,122],[.77,70],[.57,32],[.12,27]];
   const o=mesh(g,new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),80),mats.white);o.scale.set(250,1,180);cyl(g,22,2,0,28,0,mats.hardware);
  }
  if(a.kind==='mixer'){
   cyl(g,19,100,0,50,0,mats.steel);const points=[[0,80,0],[0,250,0],[65,280,-20],[140,240,-75],[140,180,-115]].map(v=>new T.Vector3(...v));
   mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points),36,10,12,false),mats.steel);box(g,6,65,6,25,60,-3,mats.steel);
  }
  if(a.kind==='washer'){
   const[w,h,d]=a.size;box(g,w,h,d,0,0,0,mats.white);box(g,w-4,2,d-4,2,h-4,2,mats.hardware);box(g,w-24,95,3,12,h-115,-3,mats.white);box(g,145,22,3,w-172,h-72,-7,mats.steel);
   cyl(g,22,9,85,h-63,-10,mats.hardware,'z');cyl(g,205,17,w/2,h*.46,-9,mats.hardware,'z',64);cyl(g,181,22,w/2,h*.46,-24,mats.steel,'z',64);cyl(g,154,2,w/2,h*.46,-36,mats.glass,'z',64);box(g,22,92,10,w/2-182,h*.46-46,-42,mats.white);
   for(const x of[30,w-30])for(const z of[35,d-35])cyl(g,15,7,x,3.5,z,mats.steel);
  }
  g.userData.base=g.position.clone();g.userData.direction=new T.Vector3((a.position[0]-600)*.34,(a.position[1]-400)*.28,(a.position[2]-300)*.65);
  if(a.id==='T1'||['basin','mixer'].includes(a.kind))g.userData.direction.set(0,a.id==='T1'?180:340,0);if(a.kind==='washer')g.userData.direction.set(-100,0,-250);
 }
 root.updateMatrixWorld(true);
 return{root,items,mats,check:check(parameters),dispose(){const gs=new Set(),ms=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});for(const g of gs)g.dispose();for(const m of ms){m.map?.dispose();m.dispose();}}};
}
