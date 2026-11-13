import * as T from './vendor/three.module.js';
import {createUnderframe,washerPlacement,wallOffset} from './underframe.mjs?v=20261112-sto-bottom-rows';
import {room,fixtures} from './design.mjs?v=20261113-towel-warmer';
import {floorLayout,wallLayout,faces,facePolygon,showerBase,showerHeight,drainLevel} from './tiling-layout.mjs?v=20261112-sto-bottom-rows';

export function createBathroom(inputMaterials={}){
  const defaults={light:0xe9e3d9,green:0x557d78,wood:0x82715f,oak:0xa17c4e,ply:0xd7bc8b,white:0xf6f5ef,black:0x181d1e,steel:0xb1b8bb,grout:0xa49f92,core:0x85877f};
  const mat={};for(const [name,color] of Object.entries(defaults))mat[name]=inputMaterials[name]||new T.MeshStandardMaterial({color,roughness:name==='white'?.18:name==='steel'?.34:.72,metalness:name==='steel'?.75:name==='black'?.25:0});
  mat.glass=inputMaterials.glass||new T.MeshPhysicalMaterial({color:0xeef8f5,roughness:.06,transmission:.94,thickness:.006,ior:1.5});
  mat.darkGlass=inputMaterials.darkGlass||new T.MeshPhysicalMaterial({color:0x26383b,metalness:.15,roughness:.08,clearcoat:1});
  mat.led=inputMaterials.led||new T.MeshStandardMaterial({color:0xfff5dc,emissive:0xffe4b3,emissiveIntensity:2});
  const root=new T.Group(),walls={},objects={},frameParts=[];root.name='bathroom-mm';
  const floor=new T.Group(),dimensions=new T.Group();root.add(floor,dimensions);
  function group(id,parent=root,record=fixtures[id]){const g=new T.Group();g.name=id;g.userData={id,record};parent.add(g);return g;}
  function box(parent,w,h,d,x,y,z,material){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function rounded(parent,w,h,d,r,x,y,z,material){
    const b=Math.min(4,r/3,h/4),ww=w-2*b,dd=d-2*b,rr=Math.max(1,r-b),s=new T.Shape();
    s.moveTo(-ww/2+rr,-dd/2);s.lineTo(ww/2-rr,-dd/2);s.quadraticCurveTo(ww/2,-dd/2,ww/2,-dd/2+rr);s.lineTo(ww/2,dd/2-rr);s.quadraticCurveTo(ww/2,dd/2,ww/2-rr,dd/2);s.lineTo(-ww/2+rr,dd/2);s.quadraticCurveTo(-ww/2,dd/2,-ww/2,dd/2-rr);s.lineTo(-ww/2,-dd/2+rr);s.quadraticCurveTo(-ww/2,-dd/2,-ww/2+rr,-dd/2);
    const geo=new T.ExtrudeGeometry(s,{depth:h-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,steps:1,curveSegments:12});geo.rotateX(-Math.PI/2);geo.translate(0,b,0);
    const mesh=new T.Mesh(geo,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  function cylinder(parent,r1,r2,h,x,y,z,material,axis='y',segments=32){const mesh=new T.Mesh(new T.CylinderGeometry(r1,r2,h,segments),material);if(axis==='x')mesh.rotation.z=Math.PI/2;if(axis==='z')mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
  function pipe(parent,points,r,material){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,48,r,10,false),material);mesh.castShadow=true;parent.add(mesh);return mesh;}
  function lathe(parent,profile,sx,sz,x,y,z,material){const curve=new T.SplineCurve(profile.map(p=>new T.Vector2(...p)));const pts=curve.getPoints(64).map(p=>new T.Vector2(T.MathUtils.clamp(p.x,.02,1),T.MathUtils.clamp(p.y,0,140)));const mesh=new T.Mesh(new T.LatheGeometry(pts,72),material);mesh.scale.set(sx,1,sz);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function surface(parent,poly,height,material,wall=null,rotateGrain=false){
    const shape=new T.Shape(poly.map(([x,z])=>new T.Vector2(x,wall?z:-z))),geo=new T.ShapeGeometry(shape);
    if(!wall)geo.rotateX(-Math.PI/2);const p=geo.attributes.position,uv=geo.attributes.uv;
    const minX=Math.min(...poly.map(v=>v[0])),minZ=Math.min(...poly.map(v=>v[1]));
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=wall?p.getY(i):p.getZ(i);
      if(wall){if(wall==='north')p.setXYZ(i,x,z,0);if(wall==='south')p.setXYZ(i,x,z,2060);if(wall==='west')p.setXYZ(i,0,z,x);if(wall==='east')p.setXYZ(i,2260,z,x);uv.setXY(i,(x-minX)/600,(z-minZ)/300);}
      else{p.setY(i,typeof height==='function'?height(x,z):height);uv.setXY(i,((rotateGrain?z:x)-(rotateGrain?minZ:minX))/600,((rotateGrain?x:z)-(rotateGrain?minX:minZ))/200);}
    }geo.computeVertexNormals();const mesh=new T.Mesh(geo,material);mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }

  box(floor,2420,90,2220,1130,-54,1030,mat.core);
  box(floor,2260,6,2060,1130,-4,1030,mat.grout);
  objects.showerBase=group('showerBase');const base=objects.showerBase,b=showerBase;
  box(base,850,58,1050,1835,29,1535,mat.core);
  box(base,100,119,1050,1460,59.5,1535,mat.wood);box(base,750,119,100,1885,59.5,1060,mat.wood);
  for(const face of faces)surface(base,facePolygon(face),((x,z)=>showerHeight(x,z)-.7),mat.grout);
  for(const tile of floorLayout()){
    const parent=tile.kind==='main'?floor:base,height=tile.kind==='main'?0:tile.kind==='cap'?120:showerHeight;
    const mesh=surface(parent,tile.poly,height,mat.wood,null,tile.grainVertical||false);
    mesh.userData={id:tile.id,record:{name:'Джордано · '+tile.id,size:[tile.width,tile.depth],source:'Схема раскладки, формат600×200',note:tile.kind==='wet'?'Размеры в плане. Посадку трапа и отметки проверить по паспорту.':'Расчётный рез по номинальному формату.'}};
  }
  const basePlanes={};
  for(const side of ['north','west','south','east']){
    const wall=new T.Group();wall.name=side;wall.userData.wall=side;root.add(wall);walls[side]=wall;
    const plane=new T.Plane(new T.Vector3(0,-1,0),2.3);basePlanes[side]=plane;
    const coreMat=mat.core.clone();coreMat.clippingPlanes=[plane];
    const tileMat={light:mat.light.clone(),green:mat.green.clone()};for(const m of Object.values(tileMat)){m.clippingPlanes=[plane];m.side=T.DoubleSide;}
    function wallBox(start,width,y,height,depth,material,insideOffset=0){
      const center=start+width/2;let mesh;
      if(side==='north')mesh=box(wall,width,height,depth,center,y+height/2,-depth/2-insideOffset,material);
      if(side==='south')mesh=box(wall,width,height,depth,center,y+height/2,2060+depth/2+insideOffset,material);
      if(side==='west')mesh=box(wall,depth,height,width,-depth/2-insideOffset,y+height/2,center,material);
      if(side==='east')mesh=box(wall,depth,height,width,2260+depth/2+insideOffset,y+height/2,center,material);
      mesh.userData.wall=side;return mesh;
    }
    const length=['north','south'].includes(side)?2260:2060;
    if(side==='east'){wallBox(0,200,0,2300,72,coreMat,8.5);wallBox(1000,1060,0,2300,72,coreMat,8.5);wallBox(200,800,2100,200,72,coreMat,8.5);}
    else wallBox(-80,length+160,0,2300,72,coreMat,8.5);
    for(const tile of wallLayout(side)){
      const mesh=surface(wall,tile.poly,0,tileMat[tile.material],side);
      mesh.userData={wall:side,id:tile.id,record:{name:(tile.material==='light'?'Экзюпери':'Рерих')+' · '+tile.id,size:[tile.width,tile.depth],source:'Номинальный формат600×300, шов3',note:side==='west'?'Граница цвета на1200 мм от верхнего угла.':'Подрезка по новой площадке; фактический калибр и проём проверить.'}};
    }
  }

  objects.countertop=group('countertop');objects.countertop.position.x=wallOffset;
  const countertopMesh=box(objects.countertop,600,26,1200,300,887,600,mat.oak);
  objects.basin=group('basin');objects.basin.position.set(320,900,900);
  lathe(objects.basin,[[.1,0],[.48,0],[.70,12],[.86,55],[.96,108],[1,136],[.97,140],[.90,132],[.82,80],[.60,40],[.12,30]],180,250,0,0,0,mat.white);
  cylinder(objects.basin,22.5,22.5,3,0,32,0,mat.steel);
  objects.mixer=group('mixer');objects.mixer.position.set(85,900,790);
  cylinder(objects.mixer,22,25,110,0,55,0,mat.black);
  pipe(objects.mixer,[[0,110,0],[-8,250,-20],[45,350,-20],[125,310,0],[190,210,0]],13,mat.black);
  cylinder(objects.mixer,18,18,35,190,200,0,mat.black);
  cylinder(objects.mixer,16,16,46,0,53,37,mat.black,'z');pipe(objects.mixer,[[0,55,60],[0,115,60]],4.5,mat.black);

  objects.mirror=group('mirror');
  box(objects.mirror,12,700,500,6,1550,900,mat.led);
  const mirrorFace=box(objects.mirror,2,684,484,15,1550,900,mat.steel);mirrorFace.name='mirror-face';

  objects.towelWarmer=group('towelWarmer');objects.towelWarmer.position.set(...fixtures.towelWarmer.position);
  const warmerBody=new T.Group();warmerBody.name='towel-warmer-body';objects.towelWarmer.add(warmerBody);
  for(const x of [-209,209]){
    rounded(warmerBody,32,300,35,4,x,0,82.5,mat.black);
    for(const y of [45,255]){
      cylinder(warmerBody,14,14,4,x,y,2,mat.black,'z');
      cylinder(warmerBody,7,7,61,x,y,34.5,mat.black,'z');
    }
  }
  for(const y of [35,112,188,265])rounded(warmerBody,418,18,22,5,0,y-9,88,mat.black);
  rounded(warmerBody,14,36,2,2,-209,18,99,mat.core);
  box(warmerBody,5,9,1,-209,36,99.5,mat.black);
  // The loose lead is illustrative; no socket location or wiring route is implied.
  pipe(objects.towelWarmer,[[-209,0,82],[-209,-28,82],[-230,-70,70],[-235,-150,60]],2.5,mat.black);

  objects.washer=group('washer');
  const placement=washerPlacement();objects.washer.position.set(placement.position[0]-60,0,placement.position[2]-80);
  rounded(objects.washer,550,850,600,12,335,0,380,mat.white);
  box(objects.washer,10,110,574,614,766,380,mat.white);
  box(objects.washer,2,48,196,620,775,237,mat.core);
  cylinder(objects.washer,30,30,17,630,770,450,mat.steel,'x');
  box(objects.washer,10,24,70,628,777,565,mat.black);
  cylinder(objects.washer,218,218,24,621,410,380,mat.steel,'x',64);
  cylinder(objects.washer,193,193,30,638,410,380,mat.black,'x',64);
  cylinder(objects.washer,168,168,15,652,410,380,mat.darkGlass,'x',64);
  rounded(objects.washer,24,114,28,8,644,353,568,mat.white);
  for(const z of [105,655])for(const x of [100,575])cylinder(objects.washer,17,17,16,x,8,z,mat.black);

  objects.toilet=group('toilet');objects.toilet.position.z=1580;
  rounded(objects.toilet,160,420,280,30,80,0,0,mat.white);
  rounded(objects.toilet,480,350,270,65,320,0,0,mat.white);
  const bowl=new T.Mesh(new T.SphereGeometry(1,64,36),mat.white);bowl.scale.set(250,130,180);bowl.position.set(390,310,0);objects.toilet.add(bowl);bowl.castShadow=true;
  rounded(objects.toilet,492,16,354,90,393,432,0,mat.white);
  rounded(objects.toilet,160,415,360,25,80,420,0,mat.white);
  rounded(objects.toilet,160,16,360,25,80,816,0,mat.white);
  cylinder(objects.toilet,24,24,3,80,833.5,0,mat.steel);

  objects.drain=group('drain');
  box(objects.drain,70,8,800,2160,0,1560,mat.steel);
  box(objects.drain,56,1.5,784,2160,4.5,1560,mat.black);
  box(objects.drain,50,2,780,2160,6,1560,mat.steel);
  for(let z=1184;z<1940;z+=20)box(objects.drain,39,1,4,2160,7.1,z,mat.black);
  objects.drain.position.set(showerBase.drain.x+35-2160,drainLevel-7.6,25);

  objects.shower=group('shower');
  const gx=1460,gz=1060,gh=1950;
  for(const z of [gz+9,gz+500,2051])box(objects.shower,18,gh,18,gx+9,gh/2,z,mat.black);
  for(const x of [gx+9,gx+400,2251])box(objects.shower,18,gh,18,x,gh/2,gz+9,mat.black);
  for(const y of [10,gh-10]){box(objects.shower,18,20,1000,gx+9,y,1560,mat.black);box(objects.shower,800,20,18,1860,y,gz+9,mat.black);}
  for(const [z,len]of [[1310,480],[1810,480]]){const pane=box(objects.shower,6,gh-44,len,gx+9,gh/2,z,mat.glass);pane.castShadow=false;}
  for(const [x,len]of [[1660,380],[2060,380]]){const pane=box(objects.shower,len,gh-44,6,x,gh/2,gz+9,mat.glass);pane.castShadow=false;}
  box(objects.shower,30,220,18,1484,1050,1120,mat.black);box(objects.shower,18,220,30,1520,1050,1084,mat.black);
  objects.shower.position.y=120;

  objects.showerSystem=group('showerSystem');objects.showerSystem.position.set(1860,0,2060);
  rounded(objects.showerSystem,260,56,110,12,0,1072,-60,mat.black);
  pipe(objects.showerSystem,[[0,1120,-45],[0,1980,-45],[0,2100,-65],[0,2100,-230]],13,mat.black);
  cylinder(objects.showerSystem,125,125,14,0,2089,-250,mat.black,'y',64);
  cylinder(objects.showerSystem,112,112,1,0,2081,-250,mat.core,'y',64);
  for(const y of [1220,1880]){cylinder(objects.showerSystem,24,24,12,0,y,-7,mat.black,'z');pipe(objects.showerSystem,[[0,y,-10],[0,y,-44]],7,mat.black);}
  cylinder(objects.showerSystem,38,38,13,-112,1490,-80,mat.black,'z');
  pipe(objects.showerSystem,[[-112,1445,-82],[-112,1380,-72]],13,mat.black);
  pipe(objects.showerSystem,[[-112,1380,-72],[-170,860,-80],[-60,660,-120],[85,800,-95],[85,1080,-90]],6.5,mat.black);
  cylinder(objects.showerSystem,24,24,28,-107,1100,-60,mat.black,'x');

  objects.hygienic=group('hygienic');objects.hygienic.position.set(400,600,2060);
  rounded(objects.hygienic,125,78,8,12,0,-39,-5,mat.black);
  cylinder(objects.hygienic,25,25,35,-28,0,-26,mat.black,'z');pipe(objects.hygienic,[[-28,0,-44],[-28,45,-44]],4,mat.black);
  pipe(objects.hygienic,[[35,-15,-30],[38,70,-35],[45,115,-50]],9,mat.black);
  pipe(objects.hygienic,[[35,-30,-30],[60,-350,-60],[-20,-430,-75],[-70,-300,-60],[-28,-20,-45]],5.5,mat.black);

  objects.door=group('door',root,{name:'Дверь · привязка предварительная',source:'На плане800, в спецификации блок900×2100',note:'Отступ200 от верхнего угла и исполнение двери условные; проём требует обмера.'});
  const pivot=new T.Group();pivot.position.set(2260,0,200);pivot.rotation.y=-Math.PI*.48;objects.door.add(pivot);
  rounded(pivot,34,2090,790,5,0,5,395,mat.oak);cylinder(pivot,20,20,12,-22,1030,700,mat.black,'x');pipe(pivot,[[-32,1030,700],[-32,1030,620]],7,mat.black);
  for(const z of [190,1010])box(objects.door,22,2120,22,2247,1060,z,mat.oak);
  box(objects.door,22,22,842,2247,2110,600,mat.oak);

  let frame,importedFrame;
  function buildFrame(H){
    if(importedFrame){root.remove(frame);importedFrame.dispose();frameParts.length=0;}
    importedFrame=createUnderframe(H);frame=importedFrame.root;
    frame.name='frame';frame.userData={id:'frame',record:fixtures.frame,wall:'west'};
    root.add(frame);objects.frame=frame;frameParts.push(...importedFrame.items);
  }
  buildFrame(900);
  function setCounterHeight(H){countertopMesh.position.y=H-13;objects.basin.position.y=H;objects.mixer.position.y=H;buildFrame(H);root.updateMatrixWorld(true);}
  function setExplode(k){
    for(const p of frameParts)p.position.copy(p.userData.base).addScaledVector(p.userData.direction,k);
    root.updateMatrixWorld(true);
  }
  for(const [id,object]of Object.entries(objects))object.userData.wall=['countertop','basin','mixer','mirror','washer','toilet','frame'].includes(id)?'west':['showerSystem','hygienic'].includes(id)?'south':id==='towelWarmer'?'north':null;
  root.scale.setScalar(.001);root.updateMatrixWorld(true);
  return{root,walls,floor,dimensions,objects,frameParts,planes:basePlanes,materials:mat,setCounterHeight,setExplode};
}
