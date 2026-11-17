import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/controls/OrbitControls.js';
import {RoomEnvironment} from './vendor/environments/RoomEnvironment.js';
import {BASE,check} from './compact-design.mjs';
import {INPUTS,LEVELS} from './inputs.mjs';
import {createModel} from './sto-model.mjs';
import {SCENE_SCALE,viewPose} from './view-orientation.mjs';
const $=id=>document.getElementById(id),viewport=$('viewport'),p={...BASE};
let model,view='perspective',explode=0,selected,helper;
const visibility={top:true,basin:true,washer:true,shelf:true,bolts:true,supports:true},dims=new T.Group();
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});}catch(error){$('loading').textContent='WebGL недоступен. Планы и ведомость доступны по ссылке в панели. '+error.message;throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.setClearColor(0xe8ebe8);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;viewport.appendChild(renderer.domElement);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,1,20000),controls=new OrbitControls(camera,renderer.domElement);
// Same right-handed project orientation as the source bathroom; no global reflection.
const modelStage=new T.Group();modelStage.scale.set(...SCENE_SCALE);scene.add(modelStage);
controls.enableDamping=true;controls.dampingFactor=.1;controls.minDistance=350;controls.maxDistance=7000;controls.target.set(600,470,250);
const pmrem=new T.PMREMGenerator(renderer),environment=new RoomEnvironment();scene.environment=pmrem.fromScene(environment,.04).texture;environment.dispose();pmrem.dispose();
scene.add(new T.HemisphereLight(0xffffff,0x747865,2));
const key=new T.DirectionalLight(0xfff5df,3.2);key.position.set(-900,2400,-1100);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-1600;key.shadow.camera.right=1600;key.shadow.camera.top=1600;key.shadow.camera.bottom=-1600;key.shadow.camera.near=100;key.shadow.camera.far=7000;key.shadow.bias=-.0004;key.shadow.normalBias=2;scene.add(key);
const fill=new T.DirectionalLight(0xd9e4e1,1.8);fill.position.set(1900,1000,1200);scene.add(fill);
const ground=new T.Mesh(new T.PlaneGeometry(10000,10000),new T.MeshStandardMaterial({color:0xe8ebe8,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.position.y=-1;ground.receiveShadow=true;scene.add(ground);
const grid=new T.GridHelper(2400,24,0xc3c5b8,0xe0e0d4);grid.position.set(600,.2,300);grid.material.transparent=true;grid.material.opacity=.38;scene.add(grid);

model=createModel(p);modelStage.add(model.root,dims);
function setView(next){view=next;const pose=viewPose(next,p.height);camera.position.set(...pose.position);controls.target.set(...pose.target);controls.update();document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));}
function dimension(a,b,text){const points=[new T.Vector3(...a),new T.Vector3(...b)],line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0x4d7860,depthTest:false}));dims.add(line);
 const canvas=document.createElement('canvas');canvas.width=320;canvas.height=68;const c=canvas.getContext('2d');c.fillStyle='#ffffffed';c.fillRect(0,0,320,68);c.fillStyle='#355d46';c.font='500 30px Segoe UI';c.textAlign='center';c.fillText(text,160,44);const tex=new T.CanvasTexture(canvas),s=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false,toneMapped:false}));s.position.copy(points[0]).add(points[1]).multiplyScalar(.5);s.scale.set(200,42.5,1);s.renderOrder=30;dims.add(s);
}
dimension([0,80,-125],[1200,80,-125],'Щит 1200 мм');dimension([-100,0,0],[-100,p.height,0],p.height+' мм');dimension([1270,80,0],[1270,80,600],'600 мм');dims.visible=false;
function layers(){for(const item of model.items){const a=item.userData.part;item.visible=visibility[a.layer]??true;item.position.copy(item.userData.base).addScaledVector(item.userData.direction,explode/100);}dims.visible=$('dimensions').getAttribute('aria-pressed')==='true'&&explode===0;if(helper){helper.visible=selected.visible;helper.update();}}
function pick(item){if(helper){scene.remove(helper);helper.geometry.dispose();helper.material.dispose();helper=null;}selected=item;$('part-info').hidden=!item;if(!item)return;const a=item.userData.part;$('part-name').textContent=a.id+' · '+a.name;$('part-size').textContent=a.kind==='angle'?'L35 ×35 ×2 · '+a.length+' мм':a.kind==='bolt'?'М6 ×'+a.length+' · пакет '+a.grip+' мм':a.kind==='mixer'?'Корпус Ø35 ×105 · гибкая часть 445 мм':a.size.join(' × ')+' мм';$('part-note').textContent=a.note||'';helper=new T.BoxHelper(item,0xb47b3f);helper.material.depthTest=false;helper.renderOrder=20;scene.add(helper);}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelectorAll('[data-layer]').forEach(el=>el.onchange=()=>{visibility[el.dataset.layer]=el.checked;layers();});
$('dimensions').onclick=()=>{$('dimensions').setAttribute('aria-pressed',String($('dimensions').getAttribute('aria-pressed')!=='true'));layers();};$('explode').oninput=e=>{explode=+e.target.value;layers();};$('close-part').onclick=()=>pick(null);
$('reset').onclick=()=>{explode=0;$('explode').value=0;for(const el of document.querySelectorAll('[data-layer]'))visibility[el.dataset.layer]=el.checked=true;$('dimensions').setAttribute('aria-pressed','false');pick(null);layers();setView('perspective');};
let down;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=renderer.domElement.getBoundingClientRect(),ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);let hit=ray.intersectObjects(model.items.filter(g=>g.visible),true)[0]?.object;while(hit&&!hit.userData.part)hit=hit.parent;pick(hit);});
viewport.addEventListener('keydown',e=>{if(e.key==='Home')setView('perspective');});
new ResizeObserver(()=>{const r=viewport.getBoundingClientRect();if(r.width&&r.height){renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.fov=camera.aspect<1.4?48:36;camera.updateProjectionMatrix();}}).observe(viewport);
const fit=check(p);$('ready').textContent='Каркас 1190 · с крепежом 1196,6 · щит 1200 мм';$('fit').textContent='Условная Indesit: проход '+fit.width+' ×'+fit.clear+' мм, сбоку по '+fit.sideGap+' мм, над корпусом '+fit.gap+' мм. Корпус выходит вперёд на '+fit.projection+' мм; люк и шланги требуют проверки на месте.';
$('loading').remove();setView('perspective');renderer.setAnimationLoop(()=>{controls.update();helper?.update();renderer.render(scene,camera);});
window.underframeDiagnostics=()=>({parameters:p,check:check(p),partCount:model.items.length,view,explode,layers:{...visibility,dims:dims.visible},webgl:renderer.getContext().getParameter(renderer.getContext().VERSION)});
