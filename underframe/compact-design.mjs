import {STO,phaseFor,TOP_SCREWS,SHELF_SCREWS} from './compact.mjs';
export {STO} from './compact.mjs';
export const BASE=Object.freeze({height:900,mode:'open',washerW:600,washerD:600,washerH:850,rearGap:60,targetGap:20});
export const MODES={open:'Прямой нахлёст · задняя вниз'};
export const ASSEMBLY_STEPS=[{id:1,label:'1 · Три вертикальных блока',note:'Две стойки и две поперечины в каждом блоке: прямой нахлёст на коротких болтах; только сзади накладка65×65.'},{id:2,label:'2 · Продольные балки',note:'Задняя1180 крылом вниз, две нижние500 с вырезами только горизонтального крыла. Прямые болтовые стыки.'},{id:3,label:'3 · Диагональные стяжки',note:'Последними заднийX; нужна также фиксация от качания по глубине. Один болт в углу не заменяет раскрепление.'},{id:4,label:'Вся модель',note:'Вариант по фото: углы стоек1180×580 под плитой1200×600. Выборок под болты в столешнице нет. Монтажный эскиз, не допуск по нагрузке.'}];
export function validate(input={}){const p={...BASE,...input};for(const[k,lo,hi]of[['height',875,975],['washerW',500,660],['washerD',400,720],['washerH',780,920],['rearGap',40,120],['targetGap',0,60]])if(!Number.isFinite(p[k])||p[k]<lo||p[k]>hi)throw new RangeError(k);if((p.height-875)%25||p.mode!=='open')throw new RangeError('height/mode');return p;}
export function check(input={}){const p=validate(input),left=50,right=678.4,width=right-left;return{clear:p.height-26,gap:p.height-26-p.washerH,rim:p.height+140,sideGap:(width-p.washerW)/2,width,left,right,center:(left+right)/2,postWidth:645,required:p.washerH+p.targetGap+26,front:590-p.rearGap-p.washerD,projection:Math.max(0,p.washerD+p.rearGap-590),lip:0,metalTop:p.height-26,geometricFit:p.height-26>=p.washerH&&p.washerW<=width};}
export function parts(input={}){
 const p=validate(input),c=check(p),H=p.height,out=[];
 const add=(id,name,kind,position,size,extra={})=>{const a={id,name,kind,position,size,stage:4,layer:'frame',material:'steel',...extra};out.push(a);return a;};
 const angle=(id,name,L,position,axis,sx,sz,extra={})=>add(id,name,'angle',position,[30,L,30],{axis,sx,sz,length:L,phase:phaseFor(id),stage:1,...extra});
 let kn=0;
 const bolt=(pt,axis,L,grip,extra={})=>add(`K${++kn}`,`М6×${L} · фланцевый`,'bolt',pt,[6,L,6],{axisVector:axis,length:L,grip,nut:'flange',flange:true,layer:'bolts',material:'hardware',stage:1,washerLast:0,...extra,note:`Пакет${grip}мм, головка/фланец14,2/6,6; гайка${extra.nut==='nyloc'?'самоконтрящаяся6 с широкой шайбой':'DIN6923, h6, фланец14,2'}. Длину не увеличивать без проверки двух соседних болтов.`});
 let n=0;
 for(const[x,sx]of[[10,1],[685,1],[1190,-1]])for(const[z,sz]of[[10,1],[590,-1]]){
  const i=++n,block=`V${Math.ceil(i/2)}`,cx=x+15.5*sx,cz=z+15.5*sz;
  angle(`A${i}`,'СтойкаСТО · низ20,5',H-50.5,[x,20.5,z],'y',sx,sz,{block,note:'При H900 длина849,5; нижний торец заводской. Под ним общая пластина35×35. '+STO.caveat});
  const bores=[{axis:'z',y:108,at:x+15*sx},{axis:'x',y:133,at:z+15*sz}];if(i===2||i===4)bores.push({axis:'z',y:83,at:x+15*sx});
  add(`N${i}`,'Вставка27×27×197,5','block',[cx-13.5,20.5,cz-13.5],[27,197.5,27],{block,stage:1,layer:'supports',material:'wood',bores,cut:[197.5,27,27],note:'Верх218 под нижней поперечиной; глухое гнездо14,4×35 снизу по купленной втулке. Фаска по радиусу; два удерживающихМ6×40.'});
  add(`I${i}`,'ВтулкаМ10','insert',[cx,20.5,cz],[14.4,20,14.4],{block,stage:1,layer:'supports',material:'hardware'});
  add(`F${i}`,'НожкаМ10 · общая пластина35×35','foot',[cx,0,cz],[35,44,35],{block,stage:1,layer:'supports',plateWidth:35,base:20.5,note:'Пластина35×35×3 под торцом стальной стойки и бруска, отверстие11. Y17,5…20,5; гайка9,5…17,5, винтМ10×40. Проверить нагрузку выбранной опоры.'});
  bolt([x,133,z+15*sz],[sx,0,0],40,29,{block,nut:'nyloc',washerLast:18});bolt([x+15*sx,108,z],[0,0,sz],40,29,{block,nut:'nyloc',washerLast:18});
 }
 for(const[id,x,sx,block]of[['C1',12,1,'V1'],['C2',687,1,'V2'],['C3',1188,-1,'V3']]){
  angle(id,'Верхняя580 · фаза15',580,[x,H-28,10],'z',sx,1,{block,webStart:2.5,webEnd:2.5,note:'Горизонталь целая580, вертикальное крыло подрезать по2,5 с обоих концов. М6 в штатныхØ8; ось болта между центрами отверстий, сдвиг0,5 на каждом.'});
  add('Q'+id.slice(1),'Полоса30×552×2 под плитой','box',[sx>0?x:x-30,H-28,10],[30,2,552],{block,cut:[552,30,2],drillY:[[15,140],[15,440]],note:'Выравнивает горизонтальную поверхность до874 при H900; проходы5 под шурупы.'});
  for(const z of[25,575])bolt([sx>0?x-2:x+2,H-42.5,z],[sx,0,0],z===575?16:12,z===575?6:4,{block});
  // Small rear-only angle plate fixes the depth-plane parallelogram. The
  // visible front joint stays a direct lap, matching the supplied reference.
  const origin=[x+2*sx,H-30,587.5],holes=[[12.5,12.5],[37.5,13],[12.5,37]];
  add('G'+id.slice(1),'Задняя угловая накладка65×65×2','fitting',origin,[65,65,2],{u:[0,0,-1],v:[0,-1,0],normal:[sx,0,0],polygon:[[0,0],[65,0],[0,65]],holes,block,stage:1,cut:[65,65,2],note:'Только сзади каждой рамы, как небольшая накладка на фото3. Три болта удерживают угол; прочность не подтверждена.'});
  add('J'+id.slice(1),'Проставка18×18×2','pad',[sx>0?x:x-2,H-76,566],[2,18,18],{holes:[{axis:'x',y:9,at:9}],block,stage:1,cut:[18,18,2],note:'Под нижним отверстием маленькой накладки; верх проставки касается нижней кромки поперечины.'});
  bolt([x,H-43,550],[sx,0,0],12,4,{block});bolt([sx>0?x-2:x+2,H-67,575],[sx,0,0],16,6,{block});
 }
 for(const[id,x,sx,block]of[['D5',12,1,'V1'],['D3',687,1,'V2'],['D4',1188,-1,'V3']]){
  angle(id,'Нижняя576 · прямой нахлёст',576,[x,218,12],'z',sx,-1,{block,note:'Оба крыла целые576; не выполнять прежний задний вырез20. Горизонталь218…220; оси болтовY233,Z25/575.'});
  for(const z of[25,575])bolt([sx>0?x-2:x+2,233,z],[sx,0,0],12,4,{block});
 }
 angle('B2','Задняя1180 · крыло вниз',1180,[10,H-26,592],'x',1,-1,{stage:2,note:'Горизонталь872…874, вертикальное крыло844…874 снаружиZ590…592. ТриМ6×12 через задние стойки; отверстия штатные8, ось между центрами со смещением0,5. Выборок плиты нет.'});
 for(const x of[25,700,1175])bolt([x,H-41.5,592],[0,0,-1],12,4,{stage:2});
 for(const[id,z,sz]of[['D1',8,1],['D2',592,-1]]){
  angle(id,'Нижняя продольная500 · концевые вырезы29,5',500,[687.5,218,z],'x',-1,sz,{stage:2,web2Start:29.5,web2End:29.5,drill2:SHELF_SCREWS.filter(([,z])=>id==='D1'?z<100:z>500).map(([x])=>[17,x-687.5,2.5]),note:'Вертикальное крыло500 оставить целым, горизонтальное вырезать на29,5 с обоих концов на всю ширину28. Останется441 горизонтального опирания. Без вырезов крылья пересекутся с поперечинами.'});
  for(const x of[700,1175])bolt([x,233,z===8?8:592],[0,0,z===8?1:-1],12,4,{stage:2});
 }
 add('P1','Полка493×572×18 ·4 выреза20×20','box',[691,220,14],[493,18,572],{layer:'shelf',material:'ply',cut:[493,572,18],note:'Убрать четыре квадрата20×20 по углам на всю толщину под короткий крепёж. Пилоты2,5×10, четыре4×12 снизу.'});
 const dh=H-142,pin=Math.hypot(675,dh-83);
 for(const[id,y1,y2,z]of[['X1',83,dh,591],['X2',dh,83,594.2]])add(id,'Задняя диагональ25×2','brace',[25,y1,z],[25,pin+40,2],{end:[700,y2,z],length:pin+40,pin,endAllowance:20,stage:3,note:'Отверстияпо20 отторцов: концы остаются под плитой по ширине. X удерживает заднюю плоскость; общую устойчивость/фиксацию подтвердить. Вторая полоса на двух шайбах1,6 на каждом конце.'});
 for(const[xx,yy,gap]of[[25,83,0],[700,dh,0],[25,dh,3.2],[700,83,3.2]]){const low=yy===83;bolt([xx,yy,592+gap],[0,0,-1],low?45:gap?16:12,low?31+gap:4+gap,{stage:3,nut:low?'nyloc':'flange',washerLast:low?18:0,spacer:gap});}
 let un=0;for(const[x,z]of TOP_SCREWS)add(`U${++un}`,'Шуруп плиты4×16','screw',[x,H-30,z],[4,16,4],{layer:'bolts',material:'hardware',axisVector:[0,1,0],length:16,grip:4,note:'Пилот2,5×12 снизу, шайба4,3×12. Верхние болты не заходят в плиту.'});
 for(const[x,z]of SHELF_SCREWS)add(`U${++un}`,'Шуруп полки4×12','screw',[x,218,z],[4,12,4],{layer:'bolts',material:'hardware',axisVector:[0,1,0],length:12,grip:2});
 for(const[n,x]of[[1,25],[2,700],[3,1175]])add(`W${n}`,'Точка фиксации к стене · проверить','box',[x-10,700,596],[20,30,20],{layer:'anchors',material:'anchor',note:'Тип/количество анкеров и вынос по фактической стене. Это ещё не разработанная фиксация по глубине.'});
 add('T1','Столешница1200×600×26 · без выборок под болты','slab',[0,H-26,0],[1200,26,600],{layer:'top',material:'oak',pockets:[],note:'Углы стоек отступают10 от краёв; обвязка584 по глубине, головки сзади доZ601,8. Только6 глухих пилотов под шурупы; слив/смеситель по своим шаблонам. Масса по карточке11,7кг.'});
 add('S1','Чаша Melana · условная','basin',[900,H,300],[500,140,360],{layer:'basin',material:'white',note:'Габарит500×360×140; массу/воду/опорное пятно уточнить.'});add('M1','Смеситель · условный','mixer',[810,H,530],[180,300,70],{layer:'basin'});
 add('WM','Indesit · условный корпус','washer',[c.center-p.washerW/2,0,c.front],[p.washerW,p.washerH,p.washerD],{layer:'washer',material:'white',note:'Зазоры по реальной модели и её инструкции. Машина стоит отдельно на полу.'});return out;
}
export function cutList(input={}){return parts(input).filter(a=>['angle','brace'].includes(a.kind)||a.cut).map(a=>({id:a.id,name:a.name,qty:1,dimensions:a.kind==='angle'?`${a.length} ×L30×30×2`:a.kind==='brace'?`${a.length.toFixed(2)} ×25×2`:a.cut.join(' × '),material:a.material}));}
export function intersects(a,b,tolerance=.01){return a.min.every((v,i)=>Math.min(a.max[i],b.max[i])-Math.max(v,b.min[i])>tolerance);}
