import {room,strip,wallRows} from './design.mjs?v=20261112-herringbone-opt3';

// Heights and finished curb width were confirmed on 2026-11-12.
// Drain centre/ends, the 2% fall and fixing dimensions remain design proposals.
export const showerBase={x:1410,z:1010,width:850,depth:1050,curbWidth:100,curbTop:120,floorHigh:80,slope:.02,
  glass:{x:1460,z:1060,width:800,depth:1000},drain:{x:2120,z:1185,width:70,length:800},
  note:'Верх борта +120, высокая кромка пола душа +80, ширина борта100. Уклон2% и положение трапа предложены для согласования.'};
const b=showerBase,d=b.drain;
export const drainLevel=b.floorHigh-b.slope*(d.x-(b.x+b.curbWidth));
export function showerHeight(x,z){return drainLevel+b.slope*Math.max(0,d.x-x,x-d.x-d.width,d.z-z,z-d.z-d.length);}
export function polygonArea(p){return Math.abs(p.reduce((a,q,i)=>{const r=p[(i+1)%p.length];return a+q[0]*r[1]-r[0]*q[1];},0))/2;}
export function bounds(p){const xx=p.map(q=>q[0]),zz=p.map(q=>q[1]);return{x:Math.min(...xx),z:Math.min(...zz),width:Math.max(...xx)-Math.min(...xx),depth:Math.max(...zz)-Math.min(...zz)};}
const rect=(x,z,w,h)=>[[x,z],[x+w,z],[x+w,z+h],[x,z+h]];
export function clip(p,a,c,k){const out=[];if(!p.length)return out;for(let i=0;i<p.length;i++){const s=p[i],e=p[(i+1)%p.length],fs=a*s[0]+c*s[1]-k,fe=a*e[0]+c*e[1]-k,si=fs<=1e-7,ei=fe<=1e-7;if(si)out.push(s);if(si!==ei){const t=fs/(fs-fe);out.push([s[0]+t*(e[0]-s[0]),s[1]+t*(e[1]-s[1])]);}}return out;}
export function intersect(p,q){for(let i=0;i<q.length&&p.length;i++){const s=q[i],e=q[(i+1)%q.length],a=e[1]-s[1],c=s[0]-e[0];p=clip(p,a,c,a*s[0]+c*s[1]);}return p;}
export const faces=[{id:'W',name:'Основной уклон',a:-1,c:0,k:d.x},{id:'E',name:'Узкая полоса у стены',a:1,c:0,k:-d.x-d.width},{id:'N',name:'Верхний торец',a:0,c:-1,k:d.z},{id:'S',name:'Нижний торец',a:0,c:1,k:-d.z-d.length}];
export function facePolygon(face,joint=0){let p=rect(b.x+b.curbWidth+5,b.z+b.curbWidth+5,b.width-b.curbWidth-10,b.depth-b.curbWidth-10);for(const f of [...faces,{a:0,c:0,k:joint?5:0}]){if(f===face)continue;const a=f.a-face.a,c=f.c-face.c,k=face.k-f.k-(joint&&f.id?joint/2*Math.hypot(a,c):0);p=clip(p,a,c,k);}return p;}
function item(id,kind,p,extra={}){const area=polygonArea(p);return{id,kind,poly:p,area,...bounds(p),fullTile:Math.abs(area-(kind==='wall'?180000:120000))<.5,...extra};}
export const layoutRevision='20261112-herringbone-opt3';
export function herringboneMain(){
  const out=[],main=[[5,5],[2255,5],[2255,1005],[1405,1005],[1405,2055],[5,2055]],L=603,W=203,ox=300,oz=300;let id=0;
  for(let i=-3;i<=6;i++)for(let j=-10;j<=10;j++)for(const vertical of[false,true]){
    const x=ox+i*L+j*W+(vertical?L:0)+1.5,z=oz+i*L-j*W+1.5,w=vertical?200:600,h=vertical?600:200;
    if(x>2255||z>2055||x+w<5||z+h<5)continue;const p=intersect(main,rect(x,z,w,h));
    if(p.length>=3&&polygonArea(p)>1)out.push(item('F-'+String(++id).padStart(2,'0'),'main',p,{material:'wood',grainVertical:vertical}));
  }return out;
}
export function floorLayout(){
  const out=herringboneMain();
  for(const [i,s]of strip(b.depth-5,600,600).entries())out.push(item(`B-L${i+1}`,'cap',rect(b.x,b.z+s.start,100,s.size),{material:'wood',grainVertical:true}));
  for(const [i,s]of strip(b.width-108,600,600).entries())out.push(item(`B-N${i+1}`,'cap',rect(b.x+103+s.start,b.z,s.size,100),{material:'wood'}));
  const start=b.z+105,finish=2060-5;
  const rows=[{start,size:d.z-1.5-start},...strip(d.length-3,200,188).map(r=>({start:d.z+1.5+r.start,size:r.size})),{start:d.z+d.length+1.5,size:finish-d.z-d.length-1.5}];
  const left=b.x+105,right=2260-5;
  const cols=[{start:left,size:600},{start:left+603,size:right-left-603}];
  for(const [r,row]of rows.entries())for(const face of faces)for(const[c,col]of((face.id==='N'||face.id==='S')?[{start:left,size:right-left}]:cols).entries()){
    let p=intersect(rect(col.start,row.start,col.size,row.size),facePolygon(face,3));
    if(p.length<3||polygonArea(p)<1)continue;
    out.push(item(`D-${r+1}-${c+1}-${face.id}`,'wet',p,{material:'wood',face:face.id,plane:[face.a*b.slope,face.c*b.slope,drainLevel+face.k*b.slope]}));
  }
  return out;
}
export function wallProfile(side){
  if(side==='south')return[[0,0],[1410,0],[1410,120],[1510,120],[1510,80],[d.x-75,showerHeight(d.x-75,2060)],[2260,showerHeight(2260,2060)]];
  if(side==='east')return[[0,0],[1010,0],[1010,120],[1110,120],[1110,showerHeight(2260,1110)],[d.z-70,showerHeight(2260,d.z-70)],[d.z+d.length+70,showerHeight(2260,d.z+d.length+70)],[2060,showerHeight(2260,2060)]];
  const L=side==='north'?2260:2060;return[[0,0],[L,0]];
}
export function wallLayout(side){const L=['north','south'].includes(side)?2260:2060;let profile=wallProfile(side).map(([x,h])=>[x,h+5]);
  let tiles=[];let id=0;const zones=side==='west'?[[5,1193.5,'light'],[1201.5,853.5,'green']]:[[5,L-10,side==='north'?'light':'green']];
  for(const[start,len,material]of zones){const first=len-Math.floor((len+3)/603)*603;for(const row of wallRows())for(const col of strip(len,600,first))tiles.push({id:side+'-'+(++id),s:start+col.start,y:5+row.start,w:col.size,h:row.size,material});}
  if(side==='east'){
    // Whole tiles end at the visible shower corner; cuts are placed near the door.
    profile=[[0,5],[195,5],[195,2105],[1005,2105],[1005,5],...profile.filter(p=>p[0]>=1010)];
  }
  const above=[[0,2300],[L,2300],...profile.slice().reverse()];return tiles.map(t=>{const p=intersect(above,rect(t.s,t.y,t.w,t.h));return item(t.id,'wall',p,{material:t.material,side});}).filter(t=>t.poly.length>=3&&t.area>1);}
export function curbFaces(){return[
  {id:'BL',name:'Наружный длинный борт',length:1050,height:120},
  {id:'BN',name:'Наружный короткий борт',length:850,height:120},
  {id:'IL',name:'Внутренняя длинная грань',length:950,height:40},
  {id:'IN',name:'Внутренняя короткая грань',length:750,height:'40…51'}];}
export function allLayoutData(){const floor=floorLayout(),walls=Object.fromEntries(['north','west','south','east'].map(s=>[s,wallLayout(s)]));const counts=ts=>({pieces:ts.length,whole:ts.filter(t=>t.fullTile).length,cut:ts.filter(t=>!t.fullTile).length});return{date:'2026-11-12',revision:layoutRevision,units:'mm',room,showerBase,drainLevel,floor,faces:faces.map(f=>({...f,poly:facePolygon(f)})),walls,profiles:Object.fromEntries(['north','west','south','east'].map(s=>[s,wallProfile(s)])),curbFaces:curbFaces(),counts:{main:counts(floor.filter(t=>t.kind==='main')),wet:counts(floor.filter(t=>t.kind==='wet')),cap:counts(floor.filter(t=>t.kind==='cap')),walls:counts(Object.values(walls).flat())},status:'Прямая ёлочка90 на основном полу, прямые ряды в душе, горизонтальные стены; номинальные форматы, монтаж проверить.'};}
