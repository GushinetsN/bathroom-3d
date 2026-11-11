import {room,floorTiles,wallTiles,wallRows,balanced} from './design.mjs?v=20261112-shower-080-120';

// Heights and finished curb width were confirmed on 2026-11-12.
// Drain centre/ends, the 2% fall and fixing dimensions remain design proposals.
export const showerBase={x:1410,z:1010,width:850,depth:1050,curbWidth:100,curbTop:120,floorHigh:80,slope:.02,
  glass:{x:1460,z:1060,width:800,depth:1000},drain:{x:2125,z:1185,width:70,length:800},
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
function item(id,kind,p,extra={}){return{id,kind,poly:p,area:polygonArea(p),...bounds(p),...extra};}
export function floorLayout(){
  const out=[];
  const main=[[5,5],[2255,5],[2255,b.z-5],[b.x-5,b.z-5],[b.x-5,2055],[5,2055]];
  for(const t of floorTiles()){const p=intersect(main,rect(t.x,t.y,t.w,t.h));if(p.length>=3&&polygonArea(p)>1)out.push(item(t.id,'main',p,{source:t.id,material:'wood'}));}
  // Curb cap courses: each long side is split symmetrically, separately from the room floor.
  for(const [i,s]of balanced(b.depth-5,600).entries())out.push(item(`B-L${i+1}`,'cap',rect(b.x,b.z+s.start,100,s.size),{material:'wood'}));
  for(const [i,s]of balanced(b.width-108,600).entries())out.push(item(`B-N${i+1}`,'cap',rect(b.x+103+s.start,b.z,s.size,100),{material:'wood'}));
  const start=b.z+105,finish=2060-5;
  const rows=[{start,size:d.z-1.5-start},...balanced(d.length-3,200).map(r=>({start:d.z+1.5+r.start,size:r.size})),{start:d.z+d.length+1.5,size:finish-d.z-d.length-1.5}];
  const left=b.x+105,right=2260-5,first=(d.x-5-left-3)/2;
  const cols=[{start:left,size:first},{start:left+first+3,size:right-left-first-3}];
  for(const [r,row]of rows.entries())for(const [c,col]of cols.entries())for(const face of faces){
    let p=intersect(rect(col.start,row.start,col.size,row.size),facePolygon(face,3));
    if(p.length<3||polygonArea(p)<1)continue;
    out.push(item(`D-${r+1}-${c+1}-${face.id}`,'wet',p,{material:'wood',face:face.id,plane:[face.a*b.slope,face.c*b.slope,drainLevel+face.k*b.slope]}));
  }
  return out;
}
export function wallProfile(side){
  if(side==='south')return[[0,0],[1410,0],[1410,120],[1510,120],[1510,80],[2050,69.2],[2260,69.2]];
  if(side==='east')return[[0,0],[1010,0],[1010,120],[1110,120],[1110,69.2],[1120,69],[2050,69],[2060,69.2]];
  const L=side==='north'?2260:2060;return[[0,0],[L,0]];
}
export function wallLayout(side){const L=['north','south'].includes(side)?2260:2060;let profile=wallProfile(side).map(([x,h])=>[x,h+5]);
  let tiles=wallTiles(side);
  if(side==='east'){
    // Align the right pier with the door jamb: remove the old 28.5-mm strip.
    profile=[[0,5],[195,5],[195,2105],[1005,2105],[1005,5],...profile.filter(p=>p[0]>=1010)];
    tiles=[];let i=0;for(const row of wallRows())for(const [s,w]of [[5,394],[402,600],[1005,600],[1608,447]])tiles.push({id:'east-'+(++i),s,y:5+row.start,w,h:row.size,material:'green'});
  }
  const above=[[0,2300],[L,2300],...profile.slice().reverse()];return tiles.map(t=>{const p=intersect(above,rect(t.s,t.y,t.w,t.h));return item(t.id,'wall',p,{material:t.material,side});}).filter(t=>t.poly.length>=3&&t.area>1);}
export function curbFaces(){return[
  {id:'BL',name:'Наружный длинный борт',length:1050,height:120},
  {id:'BN',name:'Наружный короткий борт',length:850,height:120},
  {id:'IL',name:'Внутренняя длинная грань',length:950,height:40},
  {id:'IN',name:'Внутренняя короткая грань',length:750,height:'40…51'}];}
export function allLayoutData(){return{date:'2026-11-12',units:'mm',room,showerBase,drainLevel,floor:floorLayout(),faces:faces.map(f=>({...f,poly:facePolygon(f)})),walls:Object.fromEntries(['north','west','south','east'].map(s=>[s,wallLayout(s)])),profiles:Object.fromEntries(['north','west','south','east'].map(s=>[s,wallProfile(s)])),curbFaces:curbFaces(),status:'Схема по номинальным форматам; монтажные резы у трапа и профиля после проверки паспорта и обмера.'};}
