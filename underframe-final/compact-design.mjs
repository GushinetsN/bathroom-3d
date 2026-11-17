import {INPUTS as I,LEVELS as Y} from './inputs.mjs';
import {STO,STO_GUSSET,LAYOUT,phaseFor,SHELF_SCREWS,TOP_SCREWS} from './compact.mjs';
export {STO} from './compact.mjs';
export const BASE={height:Y.top,mode:'open',washerW:600,washerD:600,washerH:850,rearGap:60,targetGap:20};
export const ASSEMBLY_STEPS=[{id:1,label:'Рамы',note:''},{id:2,label:'Связи',note:''},{id:4,label:'Вся модель',note:''}];
export function validate(input={}){const p={...BASE,...input};for(const[k,lo,hi]of[['height',Y.top-I.foot.adjustment,Y.top+I.foot.adjustment],['washerW',500,660],['washerD',400,720],['washerH',780,920],['rearGap',40,120],['targetGap',0,60]])if(!Number.isFinite(p[k])||p[k]<lo||p[k]>hi)throw new RangeError(k);if(p.mode!=='open')throw new RangeError('mode');return p;}
export function check(input={}){const p=validate(input),left=42,right=676.7-(p.replaceAllBolts?1:0),width=+(right-left).toFixed(1),metalTop=p.height-I.top.thickness,clear=metalTop-35;return{clear,gap:clear-p.washerH,rim:p.height+140,sideGap:+((width-p.washerW)/2).toFixed(2),width,left,right,center:(left+right)/2,postWidth:675,required:p.washerH+p.targetGap+I.top.thickness+35,front:557.5-p.rearGap-p.washerD,projection:Math.max(0,p.washerD+p.rearGap-557.5),lip:0,metalTop,geometricFit:clear>=p.washerH&&p.washerW<=width};}
export function parts(input={}){
 const p=validate(input),c=check(p),d=p.height-Y.top,base=Y.bottom+d,top=Y.bearing+d,upper=top,lower=Y.lower+d,longLow=lower,out=[],{xs,zs}=LAYOUT;
 const add=(id,name,kind,position,size,extra={})=>{const a={id,name,kind,position,size,stage:4,layer:'frame',material:'steel',...extra};if(['bolt','screw','flatwasher','foot'].includes(kind))a.finish='black-head';out.push(a);return a;};
 const angle=(id,name,L,position,axis,sx,sz,extra={})=>add(id,name,'angle',position,[35,L,35],{axis,sx,sz,length:L,phase:phaseFor(id),stage:1,...extra});
 let kn=0,jn=0;
 const bolt=(pt,axis,L,grip,extra={})=>add('K'+(++kn),'М6×'+L+' ISO7380-2 · низкая головка','bolt',pt,[6,L,6],{axisVector:axis,length:L,grip,nut:'flange',flange:true,headHeight:3.3,headDiameter:13.6,layer:'bolts',material:'hardware',stage:1,...extra,note:''+grip+'мм, без дополнительной шайбы; момент и несущую способность не назначали.'});
 const shim=(pt,axis,stage,block)=>{for(let j=0;j<2;j++)add('J'+(++jn),'DIN988 6×12×1','flatwasher',pt.map((v,i)=>v+j*axis[i]),[12,1,12],{axisVector:axis,outer:12,inner:6.03,thickness:1,role:'gusset-spacer',block,stage,layer:'bolts',material:'hardware',note:''});};
 const polygon=[],arc=(cx,cy,r,a,b)=>{for(let i=0;i<=12;i++){const t=(a+(b-a)*i/12)*Math.PI/180;polygon.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);}};
 polygon.push([12.5,0]);arc(62.5,12.5,12.5,-90,90);arc(37.5,37.5,12.5,-90,-180);arc(12.5,62.5,12.5,0,180);arc(12.5,12.5,12.5,180,270);
 const gusset=(id,corner,u,v,normal,stage,block,role)=>add(id,'Чёрный усилительСТО · 2554277360','fitting',corner.map((x,i)=>x-12.5*(u[i]+v[i])),[75,75,.7],{u,v,normal,corner,polygon,holes:[[12.5,12.5],[62.5,12.5],[12.5,62.5]],holeDiameter:6.5,article:STO_GUSSET.article,source:STO_GUSSET.source,envelopeConfirmed:false,stage,block,role,note:STO_GUSSET.caveat+' Установка изнутри. Показываемый контур не является шаблоном изготовления.'});
 let n=0;
 for(const[x,sx]of[[xs[0],1],[xs[1],1],[xs[2],-1]])for(const[z,sz]of[[zs[0],1],[zs[1],-1]]){
  const i=++n,block='V'+Math.ceil(i/2),cx=x+17*sx,cz=z+17*sz,px=x+22*sx,pz=z+20*sz;
  angle('A'+i,'Стойка900 · целая',900,[x,base,z],'y',sx,sz,{block,note:''+STO.caveat});
  add('N'+i,'Брусок30×30×217,5','block',[cx-15,base,cz-15],[30,217.5,30],{block,stage:1,layer:'supports',material:'wood',bores:[],corner:{sx,sz,chamfer:3},endPilot:{x:px-(cx-15),z:pz-(cz-15),diameter:2.5,depth:23},cut:[217.5,30,30],socket:{diameter:12,depth:28,flangeDiameter:25,flangeDepth:2,conditional:true},note:''});
  add('I'+i,'Забивная гайкаМ10 DIN1624','insert',[cx,base,cz],[25,13,25],{block,stage:1,layer:'supports',material:'hardware'});
  add('F'+i,'ОпораМ10×40 + пластина40×40×4','foot',[cx,0,cz],[40,50,40],{block,stage:1,layer:'supports',plateWidth:40,base,note:''});
  add('R'+i,'Саморез4×25 · один сверху в торец','screw',[px,lower+2,pz],[4,25,4],{block,stage:1,layer:'bolts',material:'hardware',axisVector:[0,-1,0],...I.fixing.foot,steelGrip:2,role:'foot-end',woodId:'N'+i,note:''});
 }
 for(const[k,x,sx]of[[1,xs[0],1],[2,xs[1],1],[3,xs[2],-1]]){
  const block='V'+k,bx=x+2*sx;
  angle('C'+k,'Верхняя поперечина500 · целая',500,[bx,upper,50],'z',sx,1,{block,note:''});
  angle('D'+(k+2),'Нижняя поперечина500 · целая',500,[bx,lower,50],'z',sx,-1,{block,note:''});
  for(const[z,sz,label]of[[zs[0],1,'f'],[zs[1],-1,'r']])for(const[pre,y,dy,role]of[['GT',upper-20,-1,'upper-frame'],['GL',lower+20,1,'lower-frame']]){
   const hz=z+20*sz;
   gusset(pre+k+label,[x+4*sx,y,hz],[0,0,sz],[0,dy,0],[sx,0,0],1,block,role);
   shim([x+2*sx,y+50*dy,hz],[sx,0,0],1,block);
   bolt([x,y,hz],[sx,0,0],16,4.7,{block});bolt([bx,y,hz+50*sz],[sx,0,0],12,2.7,{block});bolt([x,y+50*dy,hz],[sx,0,0],16,4.7,{block});
  }
 }
 for(const[id,label,z,sz]of[['B2','Задняя',557.5,1],['B1','Передняя',42.5,-1]]){
  angle(id,label+' балка1190 · из1500',1190,[5,upper,z],'x',1,sz,{stage:2,source:'https://www.ozon.ru/product/2573210826/'});
  for(const[i,x,dx]of[[1,25,1],[2,700,1],[3,1175,-1]]){
   gusset((id==='B2'?'GB':'GF')+i,[x,upper-20,z+2*sz],[dx,0,0],[0,-1,0],[0,0,sz],2,undefined,'upper-longitudinal');
   shim([x,upper-70,z],[0,0,sz],2);
   bolt([x,upper-20,z-2*sz],[0,0,sz],16,4.7,{stage:2,role:'upper-longitudinal'});
   bolt([x+50*dx,upper-20,z],[0,0,sz],12,2.7,{stage:2,role:'upper-longitudinal'});
   bolt([x,upper-70,z-2*sz],[0,0,sz],16,4.7,{stage:2,role:'upper-longitudinal'});
  }
 }
 for(const[id,z,sz]of[['D1',zs[0],1],['D2',zs[1],-1]]){
  angle(id,'Нижняя продольная500 · прежний внутренний узел',500,[687.5,longLow,z+2*sz],'x',-1,sz,{stage:2,web2Start:31,web2End:31,drill2:SHELF_SCREWS.filter(([,s])=>sz>0?s<100:s>500).map(([x])=>[24.5,x-687.5,2.5]),note:''});
  for(const[j,x,dx]of[[1,700,1],[2,1175,-1]]){
   gusset('GP'+id.slice(1)+j,[x,longLow+20,z+4*sz],[dx,0,0],[0,1,0],[0,0,sz],2,undefined,'lower-longitudinal');
   shim([x,longLow+70,z+2*sz],[0,0,sz],2);
   bolt([x,longLow+20,z],[0,0,sz],16,4.7,{stage:2});bolt([x+50*dx,longLow+20,z+2*sz],[0,0,sz],12,2.7,{stage:2});bolt([x,longLow+70,z],[0,0,sz],16,4.7,{stage:2});
  }
 }
 add('P1','Полка476×478×18 · прежняя схема на4сторонах','box',[699.5,longLow+2,61],[476,18,478],{layer:'shelf',material:'ply',cut:[476,478,18],note:''});
 let un=0;
 for(const[x,z]of SHELF_SCREWS)add('U'+(++un),'Шуруп полки4×12','screw',[x,longLow,z],[4,12,4],{layer:'bolts',material:'hardware',axisVector:[0,1,0],...I.fixing.shelf,grip:2,role:'shelf-fixing',note:''});
 let tn=0;for(const[x,z]of TOP_SCREWS)add('T'+(++tn+1),'Шуруп5×30 · дуб','screw',[x,top-2,z],[5,30,5],{layer:'bolts',material:'hardware',axisVector:[0,1,0],...I.fixing.top,grip:2,role:'top-fixing'});
 add('T1',I.top.name,'slab',[0,top,0],[1200,I.top.thickness,600],{layer:'top',material:'oak',pockets:[],note:''});
 add('S1','Melana500×360×140 · условное пятно','basin',[900,p.height,300],[500,140,360],{layer:'basin',material:'white',note:''});
 add('M1','Чёрный смеситель · гибкий излив','mixer',[810,p.height,530],[180,300,70],{layer:'basin'});
 add('WM','Indesit600×600×850 · условная','washer',[c.center-p.washerW/2,0,c.front],[p.washerW,p.washerH,p.washerD],{layer:'washer',material:'white',note:''});
 // The 48 included bolts remain conditional until measured. Eighteen additional
 // M6x16 use the sourced low button head plus a separate 1 mm steel washer.
 // replaceAllBolts checks the contingency before any extra hardware is bought.
 let kitLong=0;
 for(const a of out.filter(a=>a.kind==='bolt')){
  const replacement=p.replaceAllBolts||(a.length===16&&++kitLong>26);
  a.standard=replacement?'ISO7380-1':'included-flange-conditional';
  a.name='М6×'+a.length+(replacement?' · низкая головка + шайба1':' · комплектный, примерить');
  if(replacement){
   a.position=a.position.map((v,i)=>v-a.axisVector[i]);a.grip+=1;a.headDiameter=10.5;
   add('HW'+a.id,'Шайба под головкой6×12×1','flatwasher',[...a.position],[12,1,12],{axisVector:a.axisVector,outer:12,inner:6.03,thickness:1,role:'head-washer',stage:a.stage,block:a.block,layer:'bolts',material:'hardware'});
  }
 }
 for(const a of out){
  a.note=notes[a.id]||notes[a.role]||notes[a.kind]||'';
  if(a.kind==='screw')Object.assign(a,a.role==='foot-end'?I.fixing.foot:a.role==='shelf-fixing'?I.fixing.shelf:I.fixing.top);
  if(a.kind==='bolt')a.note=a.standard==='ISO7380-1'?'Ozon: чёрный низкий ISO7380, класс10.9; проектная головкаØ10,5×3,3 по ISO7380-1. Отдельная стальная шайба1мм под головкой. Пакет'+a.grip+'мм. Реальную головку и посадку проверить.':'Из комплектов усилителей: длина, форма и высота головки требуют примерки. Показана прежняя проектная посадка с фланцемØ13,6×3,3. При неподходящих штатных — замена низкими ISO7380 с отдельной шайбой1мм; резерв в ведомости.';
 }
 return out;
}
export function cutList(input={}){return parts(input).filter(a=>['angle','brace'].includes(a.kind)||a.cut).map(a=>({id:a.id,name:a.name,qty:1,dimensions:a.kind==='angle'?a.length+' × L35×35×2':a.kind==='brace'?a.length.toFixed(2)+' ×25×2':a.cut.join(' × '),material:a.material}));}
export function intersects(a,b,tolerance=.01){return a.min.every((v,i)=>Math.min(a.max[i],b.max[i])-Math.max(v,b.min[i])>tolerance);}


const notes={
 angle:'СТО L35×35×2, шаг25, Ø8, ось20. Номинальная геометрия; фактические радиусы гиба и посадку накладки сверить сухой сборкой.',
 fitting:'Готовая чёрная накладка СТО. Три болта, шаг50, сталь0,7. Контур75×75 и крайние отступы условны: сверить реальную деталь перед закупкой остальных.',
 bolt:'Показана проектная посадка ISO7380-2 класса10.9, головкаØ13,6×3,3; штатные головки и длины по реальной поставке. ГайкаDIN6923 М6 h6. Пакеты4,7/2,7; выступ резьбы5,3/3,3. Шайбы под фланцами не нужны. Головки чёрные, гайки оцинкованные.',
 flatwasher:'ДвеDIN988 6×12×1 под свободным плечом накладки компенсируют перепад2. Это дистанционные элементы, а не лишние шайбы под гайками. Примерить к окрашенному болту.',
 'head-washer':'Одна DIN9886×12×1 под низкой головкой нового винта ISO7380-1 без встроенного фланца. На18новых винтов18шайб; под подходящие комплектные головки с фланцем их не добавлять. При полной замене —66шайб под головками.',
 block:'Брусок30×30×217,5. Фаска3×3 по внутреннему радиусу. Один4×25 сверху в торец. Снизу забивнаяМ10: фланец утопить заподлицо. Ø12/Ø25×2 показаны условно; сверление по реальной гайке. Защитить дерево от влаги.',
 insert:'Ozon2624090672 DIN1624М10, фланец25, высота13; Øкорпуса, толщина фланца и рабочая резьба не опубликованы. Показанный контур не шаблон сверления.',
 foot:'Ozon1571555304: пяткаH10, на чертежеØ30, в текстеØ32; винтМ10×40. ГотоваяСт3 40×40×4, просверлить центральноеØ11; снизуDIN6923М10 h10 фланцем вверх, SW15. Низ стоек29, регулировка±3. Заход винта18…24; полезная резьба по фактической гайке.',
 'foot-end':'Один4×25 через штатное отверстие сверху. Шайба4,3×12×1; вход в дерево22. Пилот ориентировочно2,5×23, уточнить по шурупу.',
 'shelf-fixing':'Четыре4×12 снизу: металл2+шайба1, вход9 в фанеру18. Пилот2,5×10.',
 'top-fixing':'Три5×30 по средней линии Z312,5, через штатныеØ8. DIN9021М5 5,3×15×1,2; вход26,8, остаток13,2. Волокна дуба вдольX, расширение поZ свободно. Пилот3,5×28 предварительный — уточнить по шурупу.',
 B2:'Из1500 получить1190: границы17,5/1207,5 от исходного торца, пропил в отход. Штатный первый центр12,5 проверить до резки; после резки первый центр20. Крыло назад, оба крыла непрерывны. Три накладки через штатныеØ8, без новых отверстий.',
 B1:'Из1500 получить1190, какB2. Штатная перфорация сохраняется, дополнительных отверстий нет. Крыло вперёд, верх936,5. Каркас1190, с проектными головками1196,6 — внутри щита1200. Под балкой проход901,5.',
 D1:'Готовая500: длина сохранена. Убрать только горизонтальное крыло33×31 с обоих концов. Вертикальное не резать. Ø5:150/375 от торца,24,5 от края крыла; перемычка до заводских отверстий7,59.',
 D2:'Готовая500: длина сохранена. Убрать только горизонтальное крыло33×31 с обоих концов. Вертикальное не резать. Ø5:150/375 от торца,24,5 от края крыла; перемычка до заводских отверстий7,59.',
 P1:'Фанера476×478×18, четыре выреза20×20. Опирание на четыре балки одной высоты17,5/18,5. Пилоты снизу X138/363,Z10/468,Ø2,5×10. Защитить все кромки от воды.',
 T1:'Уже куплен дуб1200×600×40. Пять верхних крыльев одной высоты: три поперечины, передняя и задняя балки. Живой край показан номинальным прямоугольником. Сантехнические отверстия по реальным креплениям, без выдуманного шаблона.',
 S1:'КупленнаяMelana500×360×140, белая, без перелива, сливØ45. Это отверстие чаши: вырез в столешнице должен пропускать гайку выпуска. Наружные размеры подтверждены, внутренний профиль ориентировочный.',
 M1:I.faucet.status+' КорпусØ35×105, гибкая часть445. Показана одна возможная форма изгиба.',
 WM:I.washer.status+' Корпус выступает вперёд102,5 при зазоре60; люк/фасад условные.'
};
