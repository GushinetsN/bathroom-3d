import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/controls/OrbitControls.js';
import {RoomEnvironment} from './vendor/environments/RoomEnvironment.js';
import {Reflector} from './vendor/objects/Reflector.js';
import {createBathroom} from './model.mjs?v=20261113-towel-warmer';
import {fixtures,heightCheck} from './design.mjs?v=20261113-towel-warmer';

const $=s=>document.querySelector(s),wrap=$('#canvas-wrap');
let renderer,model,controls,camera,dirty=true,selection=null,selectionBox=null;
const scene=new T.Scene();scene.background=new T.Color(0xe8eeeb);
const perspective=new T.PerspectiveCamera(49,1,.025,30);
const ortho=new T.OrthographicCamera(-2,2,2,-2,.01,50);
let orthoHeight=3.6;
const ui={view:$('#camera-view'),walls:$('#wall-mode'),fixtures:$('#show-fixtures'),glass:$('#show-glass'),counter:$('#show-counter'),dims:$('#show-dimensions'),height:$('#counter-height'),explode:$('#explode'),item:$('#item-select')};
const captions={overall:'Общий вид',plan:'План сверху',frame:'Подстолье',entry:'От входа',north:'Верхняя стена',west:'Левая стена',south:'Нижняя стена',east:'Правая стена'};
const elevations=['north','west','south','east'];
const ray=new T.Raycaster(),pointer=new T.Vector2();
const dimensionRoot=new T.Group();scene.add(dimensionRoot);
const ground=new T.Mesh(new T.PlaneGeometry(20,20),new T.MeshStandardMaterial({color:0xe8eeeb,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.101;ground.receiveShadow=true;scene.add(ground);
let byId=new Map();

function woodTexture(){
  const c=document.createElement('canvas');c.width=512;c.height=1024;const x=c.getContext('2d');x.fillStyle='#94734d';x.fillRect(0,0,512,1024);
  for(let i=0;i<480;i++){const a=(i*71)%512;x.strokeStyle=`rgba(${i%3===0?'67,47,28':'221,189,143'},${.06+(i%7)*.012})`;x.lineWidth=1+i%3;x.beginPath();for(let y=0;y<=1024;y+=16){const xx=a+Math.sin(y*.009+i)*5+Math.sin(y*.002+i*2)*12;if(y===0)x.moveTo(xx,y);else x.lineTo(xx,y);}x.stroke();}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;
}
async function materials(){
  const loader=new T.TextureLoader();const [wood,light,green]=await Promise.all(['giordano','exupery','rerikh'].map(n=>loader.loadAsync(`./assets/${n}-1.jpg`)));
  for(const t of [wood,light,green]){t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}
  const tile=t=>new T.MeshStandardMaterial({map:t,color:0xffffff,roughness:.79,metalness:0});
  return{wood:tile(wood),light:tile(light),green:tile(green),oak:new T.MeshStandardMaterial({map:woodTexture(),roughness:.54,metalness:0}),ply:new T.MeshStandardMaterial({color:0xd5bc94,roughness:.74})};
}
function disposeGroup(g){while(g.children.length){const o=g.children[0];g.remove(o);o.traverse(v=>{v.geometry?.dispose();if(v.material){if(v.material.map)v.material.map.dispose();v.material.dispose();}});}}
function label(text,position){
  const c=document.createElement('canvas'),x=c.getContext('2d');x.font='500 48px Segoe UI,Arial';c.width=Math.ceil(x.measureText(text).width)+32;c.height=80;x.fillStyle='rgba(250,252,249,.96)';x.fillRect(0,0,c.width,c.height);x.font='500 48px Segoe UI,Arial';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#244a40';x.fillText(text,c.width/2,42);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));s.userData.labelAspect=c.width/c.height;s.position.copy(position);s.renderOrder=100;dimensionRoot.add(s);
}
function dim(a,b,text,offset=[0,.045,0]){
  const aa=new T.Vector3(...a),bb=new T.Vector3(...b);const geo=new T.BufferGeometry().setFromPoints([aa,bb]);const line=new T.Line(geo,new T.LineBasicMaterial({color:0x537567,depthTest:false}));dimensionRoot.add(line);
  const d=bb.clone().sub(aa).normalize(),tick=Math.abs(d.y)>.8?new T.Vector3(.025,0,.025):new T.Vector3(0,.025,0);
  const pts=[];for(const p of [aa,bb])pts.push(p.clone().sub(tick),p.clone().add(tick));dimensionRoot.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0x537567,depthTest:false})));
  label(text,aa.add(bb).multiplyScalar(.5).add(new T.Vector3(...offset)));
}
function dimensions(){
  disposeGroup(dimensionRoot);if(!ui.dims.checked)return;
  const H=Number(ui.height.value)/1000,v=ui.view.value;
  if(v==='frame'){
    dim([.7,H+.08,0],[.7,H+.08,1.2],'1200 мм');dim([.7,.12,.05],[.7,.12,.6784],'628,4 мм*');dim([.75,0,1.18],[.75,H,1.18],`${Math.round(H*1000)} мм*`,[.13,0,0]);
  }else if(elevations.includes(v)){
    const L=['north','south'].includes(v)?2.26:2.06;
    if(v==='north'||v==='south'){const z=v==='north'?-.04:2.1;dim([0,2.42,z],[L,2.42,z],`${Math.round(L*1000)} мм`);}
    else{const xx=v==='west'?-.04:2.3;dim([xx,2.42,0],[xx,2.42,L],`${Math.round(L*1000)} мм`);if(v==='west')dim([xx,2.29,0],[xx,2.29,1.2],'1200 мм');}
  }else{
    dim([0,.035,-.16],[2.26,.035,-.16],'2260 мм',[0,.065,0]);dim([-.16,.035,0],[-.16,.035,2.06],'2060 мм',[0,.065,0]);
    if(v==='plan')dim([1.46,.05,2.21],[2.26,.05,2.21],'800 мм',[0,.065,0]);
  }
}
function resize(){
  const w=wrap.clientWidth,h=wrap.clientHeight,aspect=w/h;renderer.setSize(w,h);perspective.aspect=aspect;perspective.updateProjectionMatrix();
  const fit=aspect<.95?orthoHeight/Math.max(.72,aspect):orthoHeight;ortho.left=-fit*aspect/2;ortho.right=fit*aspect/2;ortho.top=fit/2;ortho.bottom=-fit/2;ortho.updateProjectionMatrix();dirty=true;
}
function cameraView(reset=true){
  const v=ui.view.value;camera=v==='entry'?perspective:ortho;controls?.dispose();
  camera.up.set(0,1,0);camera.zoom=1;
  let target=new T.Vector3(1.13,1.06,1.03);
  orthoHeight=v==='frame'?1.55:elevations.includes(v)?2.75:4.05;
  if(v==='overall')camera.position.set(4.1,3.7,4.8);
  if(v==='plan'){camera.position.set(1.13,7,1.03);camera.up.set(0,0,-1);target.set(1.13,0,1.03);orthoHeight=2.9;}
  if(v==='frame'){camera.position.set(2.5,1.6,2.3);target.set(.29,.48,.61);}
  if(v==='entry'){camera.position.set(2.12,1.58,.63);target.set(.45,1.0,1.28);}
  if(v==='north'){camera.position.set(1.13,1.15,5);target.set(1.13,1.15,0);}
  if(v==='south'){camera.position.set(1.13,1.15,-3);target.set(1.13,1.15,2.06);}
  if(v==='west'){camera.position.set(5,1.15,1.03);target.set(0,1.15,1.03);}
  if(v==='east'){camera.position.set(-3,1.15,1.03);target.set(2.26,1.15,1.03);}
  camera.lookAt(target);controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.dampingFactor=.12;controls.enableRotate=!['plan',...elevations].includes(v);controls.maxPolarAngle=Math.PI*.49;controls.minDistance=.3;controls.maxDistance=12;controls.minZoom=.6;controls.maxZoom=4;
  controls.addEventListener('change',()=>{dirty=true;});controls.addEventListener('end',save);
  resize();$('#view-caption').textContent=captions[v];dimensions();visibility();dirty=true;
}
function visibility(){
  const v=ui.view.value,frameOnly=v==='frame',wallView=elevations.includes(v);
  model.floor.visible=!frameOnly&&!wallView;ground.visible=!wallView;ground.position.y=frameOnly?-.002:-.101;
  for(const [side,wall]of Object.entries(model.walls)){
    wall.visible=!frameOnly&&(!wallView||v===side)&&ui.walls.value!=='none';
    let limit=2.5;
    if(ui.walls.value==='low'||v==='plan')limit=.11;
    else if(ui.walls.value==='auto'&&!wallView){if((side==='west'&&camera.position.x<0)||(side==='east'&&camera.position.x>2.26)||(side==='north'&&camera.position.z<0)||(side==='south'&&camera.position.z>2.06))limit=.18;}
    model.planes[side].constant=limit;
  }
  for(const [id,g]of Object.entries(model.objects)){
    g.visible=frameOnly?['frame','countertop'].includes(id):ui.fixtures.checked;
    if(wallView)g.visible=ui.fixtures.checked&&g.userData.wall===v;
    if(id==='shower')g.visible=g.visible&&ui.glass.checked;
    if(id==='countertop')g.visible=g.visible&&ui.counter.checked;
    if(id==='showerBase')g.visible=!frameOnly&&!wallView;
  }
  if(selectionBox)selectionBox.visible=selection&&isVisible(selection);dirty=true;
}
function isVisible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
function indexObjects(){byId=new Map();model.root.traverse(o=>{if(o.userData.id)byId.set(o.userData.id,o);});}
function select(o){
  selection=o;if(selectionBox){scene.remove(selectionBox);selectionBox.geometry.dispose();selectionBox.material.dispose();selectionBox=null;}
  if(!o){$('#selection').innerHTML='<h2>О модели</h2><p>Выберите предмет в модели или списке. Размеры в миллиметрах.</p>';return;}
  selectionBox=new T.BoxHelper(o,0x476b5f);selectionBox.material.depthTest=false;scene.add(selectionBox);
  const r=o.userData.record||fixtures[o.userData.id]||{};const box=new T.Box3().setFromObject(o),s=box.getSize(new T.Vector3()).multiplyScalar(1000);
  const title=document.createElement('h2');title.textContent=r.name||o.userData.id;
  const dimension=document.createElement('p');dimension.className='dimension';dimension.textContent=r.size?`${r.size.map(n=>Math.round(n*10)/10).join(' × ')} мм`:`${[s.x,s.y,s.z].map(n=>Math.round(n)).join(' × ')} мм`;
  const source=document.createElement('p');source.className='small';source.textContent=r.source||'';
  const note=document.createElement('p');note.textContent=r.note||'';$('#selection').replaceChildren(title,dimension,source,note);ui.item.value=byId.has(o.userData.id)&&[...ui.item.options].some(p=>p.value===o.userData.id)?o.userData.id:'';dirty=true;
}
function pickAt(e){
  const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);
  const hit=ray.intersectObject(model.root,true).find(h=>isVisible(h.object)&&(!h.object.userData.wall||h.point.y<=model.planes[h.object.userData.wall].constant+.001));
  let o=hit?.object;while(o&&!o.userData.id)o=o.parent;select(o||null);
}
function clearance(){const c=heightCheck(Number(ui.height.value),850);$('#height-value').textContent=ui.height.value+' мм*';$('#clearance').textContent=`Просвет ${c.clearHeight} мм. Для условной машины850 мм: зазор ${c.gap} мм. Проём ${c.width.toFixed(1)} мм, по ${c.sideGap.toFixed(1)} мм сбоку. Край чаши ${c.rim} мм.`;$('#clearance').classList.toggle('warn',c.gap<0);}
function save(){try{localStorage.setItem('bathroom-3d-v1',JSON.stringify({view:ui.view.value,walls:ui.walls.value,fixtures:ui.fixtures.checked,glass:ui.glass.checked,counter:ui.counter.checked,dims:ui.dims.checked,height:Number(ui.height.value),explode:Number(ui.explode.value)}));}catch{}}
function restore(){try{const d=JSON.parse(localStorage.getItem('bathroom-3d-v1')||'null');if(!d)return;for(const key of ['view','walls'])if([...ui[key].options].some(o=>o.value===d[key]))ui[key].value=d[key];for(const key of ['fixtures','glass','counter','dims'])if(typeof d[key]==='boolean')ui[key].checked=d[key];if(d.height>=875&&d.height<=975&&(d.height-875)%25===0)ui.height.value=d.height;if(d.explode>=0&&d.explode<=100)ui.explode.value=d.explode;}catch{}}
try{
  renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.localClippingEnabled=true;wrap.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Трёхмерная размерная модель санузла');renderer.domElement.setAttribute('role','img');
  const pm=new T.PMREMGenerator(renderer),environment=new RoomEnvironment();scene.environment=pm.fromScene(environment,.04).texture;environment.dispose();pm.dispose();scene.environmentIntensity=.4;
  scene.add(new T.HemisphereLight(0xffffff,0x829b8c,1.15));const key=new T.DirectionalLight(0xfff7eb,2.0);key.position.set(2.3,6,4);key.target.position.set(1,0,1);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:.1,far:12});key.shadow.normalBias=.002;key.shadow.bias=-.00015;key.shadow.radius=2;key.shadow.intensity=.65;scene.add(key,key.target);const fill=new T.DirectionalLight(0xe6f2ff,.65);fill.position.set(-3,4,-2);scene.add(fill);
  model=createBathroom(await materials());scene.add(model.root);
  const oldFace=model.objects.mirror.getObjectByName('mirror-face');oldFace.visible=false;const mirror=new Reflector(new T.PlaneGeometry(484,684),{clipBias:.003,textureWidth:512,textureHeight:768,color:0xdde3df});mirror.position.set(16.1,1550,900);mirror.rotation.y=Math.PI/2;model.objects.mirror.add(mirror);
  const mainGroup=document.createElement('optgroup');mainGroup.label='Предметы';for(const [id,o]of Object.entries(model.objects)){const op=document.createElement('option');op.value=id;op.textContent=o.userData.record?.name||id;mainGroup.appendChild(op);}ui.item.appendChild(mainGroup);
  const frameGroup=document.createElement('optgroup');frameGroup.label='Детали подстолья';for(const o of model.frameParts){const op=document.createElement('option');op.value=o.userData.id;op.textContent=o.userData.id+' · '+o.userData.record.name;frameGroup.appendChild(op);}ui.item.appendChild(frameGroup);
  restore();model.setCounterHeight(Number(ui.height.value));model.objects.frame.userData.wall='west';model.setExplode(Number(ui.explode.value)/100*.28);indexObjects();clearance();cameraView();
  let down=null;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});renderer.domElement.addEventListener('pointerup',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<5)pickAt(e);down=null;});
  ui.view.addEventListener('change',()=>{cameraView();save();if(innerWidth<=650)$('#viewport').scrollIntoView({block:'start'});});$('#reset-view').addEventListener('click',()=>{cameraView();save();if(innerWidth<=650)$('#viewport').scrollIntoView({block:'start'});});
  for(const el of [ui.walls,ui.fixtures,ui.glass,ui.counter])el.addEventListener('change',()=>{visibility();clearance();save();});
  ui.dims.addEventListener('change',()=>{dimensions();dirty=true;save();});ui.explode.addEventListener('input',()=>{model.setExplode(Number(ui.explode.value)/100*.28);selectionBox?.update();dirty=true;});ui.explode.addEventListener('change',save);
  ui.height.addEventListener('input',()=>{$('#height-value').textContent=ui.height.value+' мм*';});ui.height.addEventListener('change',()=>{const id=selection?.userData.id;select(null);model.setCounterHeight(Number(ui.height.value));model.objects.frame.userData.wall='west';model.setExplode(Number(ui.explode.value)/100*.28);indexObjects();if(id&&byId.has(id))select(byId.get(id));clearance();dimensions();visibility();save();});
  ui.item.addEventListener('change',()=>select(byId.get(ui.item.value)||null));
  let imageUrl=null;
  $('#save-view').addEventListener('click',()=>{
    renderer.render(scene,camera);
    renderer.domElement.toBlob(blob=>{
      if(!blob){$('#model-status').textContent='Не удалось подготовить PNG';return;}
      if(imageUrl)URL.revokeObjectURL(imageUrl);
      imageUrl=URL.createObjectURL(blob);const a=$('#saved-view');a.href=imageUrl;a.download=`sanuzel-${ui.view.value}.png`;a.hidden=false;
      $('#model-status').textContent='PNG подготовлен. Скачайте его по ссылке выше.';
    },'image/png');
  });
  new ResizeObserver(resize).observe(wrap);
  renderer.setAnimationLoop(()=>{if(document.hidden)return;const moved=controls.update();if(dirty||moved){visibility();selectionBox?.update();const unit=camera.isOrthographicCamera?(camera.top-camera.bottom)/camera.zoom/wrap.clientHeight:.004;for(const o of dimensionRoot.children)if(o.isSprite)o.scale.set(unit*24*o.userData.labelAspect,unit*24,1);renderer.render(scene,camera);dirty=false;}});
  $('#loading').style.display='none';$('#model-status').textContent='Модель готова · все данные и материалы сохранены локально';document.documentElement.dataset.ready='true';
}catch(error){$('#loading').textContent='Не удалось открыть3D: '+error.message;$('#model-status').textContent='Ошибка загрузки';console.error(error);}
