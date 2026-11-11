import * as T from './vendor/three.module.js';
import {room,fixtures,floorTiles,wallTiles,subtractRect} from './design.mjs?v=20261112-black-frame';

export function createBathroom(inputMaterials={}){
  const defaults={light:0xe9e3d9,green:0x557d78,wood:0x82715f,oak:0xa17c4e,ply:0xd7bc8b,white:0xf6f5ef,black:0x181d1e,steel:0xb1b8bb,grout:0xa49f92,core:0x85877f};
  const mat={};for(const [name,color] of Object.entries(defaults))mat[name]=inputMaterials[name]||new T.MeshStandardMaterial({color,roughness:name==='white'?.18:name==='steel'?.34:.72,metalness:name==='steel'?.75:name==='black'?.25:0});
  mat.frameFinish=inputMaterials.frameFinish||new T.MeshStandardMaterial({color:0x151719,roughness:.62,metalness:.12});
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

  box(floor,2420,90,2220,1130,-54,1030,mat.core);
  box(floor,2260,6,2060,1130,-4,1030,mat.grout);
  const drainHole={x:2125,y:1160,w:70,h:800};
  for(const tile of floorTiles())for(const p of subtractRect(tile,drainHole)){
    const mesh=box(floor,p.w,8.5,p.h,p.x+p.w/2,-4.25,p.y+p.h/2,mat.wood);
    mesh.userData={id:tile.id,record:{name:'Джордано · '+tile.id,size:[p.w,8.5,p.h],source:'Номинальный формат600×200, шов3',note:'Предварительная раскладка; посадка и резы у трапа не являются монтажной картой.'}};
    const uv=mesh.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*p.w/600,uv.getY(i)*p.h/200);
  }
  const basePlanes={};
  for(const side of ['north','west','south','east']){
    const wall=new T.Group();wall.name=side;wall.userData.wall=side;root.add(wall);walls[side]=wall;
    const plane=new T.Plane(new T.Vector3(0,-1,0),2.3);basePlanes[side]=plane;
    const coreMat=mat.core.clone();coreMat.clippingPlanes=[plane];
    const tileMat={light:mat.light.clone(),green:mat.green.clone()};for(const m of Object.values(tileMat))m.clippingPlanes=[plane];
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
    for(const tile of wallTiles(side)){
      const mesh=wallBox(tile.s,tile.w,tile.y,tile.h,8.5,tileMat[tile.material]);
      mesh.userData={wall:side,id:tile.id,record:{name:(tile.material==='light'?'Экзюпери':'Рерих')+' · '+tile.id,size:[tile.w,tile.h,8.5],source:'Номинальный формат600×300, шов3',note:side==='west'?'Граница цвета на1200 мм от верхнего угла.':'Размерный эскиз; фактический калибр плитки не подтверждён.'}};
      const uv=mesh.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*tile.w/600,uv.getY(i)*tile.h/300);
    }
  }

  objects.countertop=group('countertop');
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

  objects.washer=group('washer');
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

  objects.shower=group('shower');
  const gx=1460,gz=1060,gh=1950;
  for(const z of [gz+9,gz+500,2051])box(objects.shower,18,gh,18,gx+9,gh/2,z,mat.black);
  for(const x of [gx+9,gx+400,2251])box(objects.shower,18,gh,18,x,gh/2,gz+9,mat.black);
  for(const y of [10,gh-10]){box(objects.shower,18,20,1000,gx+9,y,1560,mat.black);box(objects.shower,800,20,18,1860,y,gz+9,mat.black);}
  for(const [z,len]of [[1310,480],[1810,480]]){const pane=box(objects.shower,6,gh-44,len,gx+9,gh/2,z,mat.glass);pane.castShadow=false;}
  for(const [x,len]of [[1660,380],[2060,380]]){const pane=box(objects.shower,len,gh-44,6,x,gh/2,gz+9,mat.glass);pane.castShadow=false;}
  box(objects.shower,30,220,18,1484,1050,1120,mat.black);box(objects.shower,18,220,30,1520,1050,1084,mat.black);

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

  let frame;
  function buildFrame(H){
    if(frame){root.remove(frame);frame.traverse(o=>{if(o.geometry)o.geometry.dispose();});frameParts.length=0;}
    frame=group('frame');frame.userData.wall='west';objects.frame=frame;const top=H-26;
    function part(id,name){const g=group(id,frame,{name,source:fixtures.frame.source,note:fixtures.frame.note});frameParts.push(g);return g;}
    function plate(width,length){const s=new T.Shape();s.moveTo(0,0);s.lineTo(width,0);s.lineTo(width,length);s.lineTo(0,length);s.closePath();if(length>80)for(let y=25;y<length-15;y+=50){const h=new T.Path();h.absarc(width/2,y,4.5,0,Math.PI*2,true);s.holes.push(h);}return new T.ExtrudeGeometry(s,{depth:2,bevelEnabled:false,curveSegments:8});}
    function L(length){const g=new T.Group();const a=new T.Mesh(plate(40,length),mat.frameFinish);a.castShadow=true;g.add(a);const b=new T.Mesh(plate(38,length),mat.frameFinish);b.rotation.y=-Math.PI/2;b.position.set(2,0,2);b.castShadow=true;g.add(b);return g;}
    let n=0;
    for(const [z,sz]of [[20,1],[700,1],[1180,-1]])for(const [x,sx]of [[20,1],[580,-1]]){
      const g=part(`A${++n}`,`Стойка${n} · L40×40×2`),l=L(top-40);l.scale.set(sx,1,sz);l.position.set(x,40,z);g.add(l);
      const foot=part(`F${n}`,`Опора${n} · изделие подобрать`);cylinder(foot,24,24,10,x+20*sx,5,z+20*sz,mat.black);cylinder(foot,5,5,30,x+20*sx,25,z+20*sz,mat.steel);
    }
    function long(id,start,len,x,front,y){const g=part(id,`${id} · продольная связь L40`),l=L(len);l.rotation.x=Math.PI/2;l.scale.x=front?-1:1;l.position.set(x,y,start);g.add(l);return g;}
    long('B1',20,1160,20,false,top);long('B2',700,480,580,true,top);
    const optionalBeam=long('B3',60,640,580,true,top);optionalBeam.visible=false;optionalBeam.userData.optionalBeam=true;
    for(const [i,z,sz]of [[1,20,1],[2,700,1],[3,1180,-1]]){
      const g=part(`C${i}`,`Поперечина${i} · целый L40`),l=L(560);l.rotation.z=-Math.PI/2;l.scale.z=sz;l.position.set(20,top-2,z);g.add(l);
      box(g,476,2,36,300,top-1,z+20*sz,mat.frameFinish);
    }
    long('D1',700,480,580,true,170);long('D2',700,480,20,false,170);
    for(const [i,z,sz]of [[1,700,1],[2,1180,-1]]){const g=part(`D${i+2}`,'Нижняя поперечина под полкой'),l=L(560);l.rotation.z=-Math.PI/2;l.scale.z=sz;l.position.set(20,168,z);g.add(l);box(g,476,2,36,300,169,z+20*sz,mat.frameFinish);}
    const p1=part('P1','Съёмная фанерная полка15');box(p1,476,15,396,300,177.5,940,mat.ply);
    const p2=part('P2','Задник под раковиной9');box(p2,9,600,400,10,485,940,mat.ply);
    const p3=part('P3','Торцевая вставка6');box(p3,476,600,6,300,485,1184,mat.ply);
    for(const [i,z1,y1,z2,y2]of [[1,60,100,700,810],[2,60,810,700,100]]){
      const p=part(`X${i}`,'Задняя диагональ30×2'),a=new T.Vector3(8,y1,z1),b=new T.Vector3(8,y2,z2),v=b.clone().sub(a),mesh=box(p,2,v.length(),30,0,0,0,mat.frameFinish);mesh.position.copy(a.clone().add(b).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());
    }
    for(const z of [40,720,1160])for(const x of [40,560]){const hardware=part(`K-${x}-${z}`,'Болтовой узел · схема');cylinder(hardware,7,7,4,x,top-22,z,mat.steel,'x',6);cylinder(hardware,4,4,16,x+8,top-22,z,mat.steel,'x',12);}
    return frame;
  }
  buildFrame(900);
  function setCounterHeight(H){countertopMesh.position.y=H-13;objects.basin.position.y=H;objects.mixer.position.y=H;buildFrame(H);root.updateMatrixWorld(true);}
  function setBeam(show){frameParts.find(p=>p.userData.optionalBeam).visible=show;}
  function setExplode(k){
    for(const p of frameParts)p.position.set(0,0,0);root.updateMatrixWorld(true);
    for(const p of frameParts){const b=new T.Box3().setFromObject(p),c=b.getCenter(new T.Vector3());frame.worldToLocal(c);p.position.copy(c.sub(new T.Vector3(300,450,600))).multiplyScalar(k);}
  }
  for(const [id,object]of Object.entries(objects))object.userData.wall=['countertop','basin','mixer','mirror','washer','toilet','frame'].includes(id)?'west':['showerSystem','hygienic'].includes(id)?'south':null;
  root.scale.setScalar(.001);root.updateMatrixWorld(true);
  return{root,walls,floor,dimensions,objects,frameParts,planes:basePlanes,materials:mat,setCounterHeight,setBeam,setExplode};
}
