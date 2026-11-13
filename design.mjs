import {check as frameCheck} from './underframe/compact-design.mjs?v=20261113-frame-end-screw';
export const room={width:2260,depth:2060,height:2300,colourBoundary:1200,grout:3,gap:5,door:{start:200,width:800,height:2100,verified:false}};
export const fixtures={
  countertop:{name:'Столешница · Дуб вотан',position:[5,874,0],size:[600,26,1200],source:'Куплено · Mebelton, Ozon1035013762',note:'Высота установки900 мм — эскиз. ЛДСП; открытые торцы и отверстия требуют влагозащиты.'},
  basin:{name:'Melana · накладная чаша',position:[140,900,650],size:[360,140,500],source:'Куплено · Ozon276734331',note:'Длинная сторона500 мм вдоль левой стены; положение соответствует рисунку. Форма упрощена.'},
  mirror:{name:'Sundays · зеркало',position:[0,1200,650],size:[16,700,500],source:'Куплено · Ozon3595948833',note:'500×700 мм. Низ1200 мм пока предложен для общего вида; розетку и монтажную высоту уточнить.'},
  toilet:{name:'Grossman GR-4458SQ',position:[0,0,1400],size:[640,835,360],source:'Куплено · снимок Сила воды61933',note:'Ось480 мм от нижней стены по рисунку. Размерная форма, не заводская CAD-модель.'},
  washer:{name:'Indesit · модель не уточнена',position:[75,0,60.7],size:[600,850,600],source:'Только марка подтверждена',note:'Условно600×600×850. Компоновка по подстольюСТО: номинальный проём635,4, по17,7 сбоку; задний зазор60 в отдельной модели, дополнительно5 до стены. Выступ люка и зазоры проверить по реальной машине.'},
  shower:{name:'Triton Вента-Блэк',position:[1460,0,1060],size:[800,1950,1000],source:'Куплено · снимок Сила воды56696',note:'Подтверждён план800×1000. Высота1950 мм и деталировка створок пока условные. Поддона нет.'},
  drain:{name:'TIM · линейный трап',position:[2120,67.8,1185],size:[70,800],source:'Куплено · снимок Сила воды44146',note:'Решётка800×70. Ось105 от стены и по75 от торцов; сдвиг5 мм позволяет целые600×200. Отметка+67,8 и привязка предложены, корпус и фланцы проверить.'},
  showerBase:{name:'Душевая площадка и борт',position:[1410,0,1010],size:[850,120,1050],source:'Уточнение: пол+80, верх борта+120, ширина100; наружный габарит850×1050',note:'Ограждение800×1000 по середине борта. +80 у высокой кромки; уклон2% и решётка+67,8 предложены. В душе прямые ряды, на основном полу ёлочка90.'},
  showerSystem:{name:'Vexorus · душевая система',position:[1860,0,2060],source:'Куплено · Ozon2748840306',note:'Ось400 от правого угла по рисунку. Верхняя лейка250; высота2100 мм и форма стойки эскизные.'},
  hygienic:{name:'ESKO · гигиенический душ',position:[400,600,2060],source:'Куплено · Ozon1956646868',note:'На нижней стене: ось400 от левого угла,600 от пола по рисунку. Монтажные габариты корпуса уточнить.'},
  mixer:{name:'Чёрный гибкий смеситель',source:'Куплено · референс аналога Ozon5652221511',note:'Форма по указанному аналогу. Габариты, вылет и отверстие купленного смесителя нужно проверить на самом изделии.'},
  towelWarmer:{name:'MQQ · электрический полотенцесушитель',position:[900,1300,0],size:[450,300,100],source:'Выбрано Натальей · Ozon1737725231 · https://ozon.ru/t/ZaYEwlM',note:'Чёрная лесенка, левый ТЭН,80Вт. По карточке корпус450×300×100мм (Ш×В×Г). На верхней белой стене; ось900мм от левого угла, низ1300/верх1600мм — предварительная примерка. Шнур показан с вилкой в правом гнезде двойной розетки. Крепления, длина шнура и размещение примерочные; электрический монтаж не спроектирован.'},
  powerOutlet:{name:'Двойная розетка · примерка',position:[450,1100,0],size:[150,80,16],source:'Пожелание Натальи13.11.2026 · условный чёрный блок с крышками',note:'На верхней белой стене над столешницей, ближе к переднему краю. Ось450мм от левого угла, центр1100мм от пола:200мм над столешницей. В правом гнезде вилка полотенцесушителя, левое свободно. Размеры блока и размещение примерочные. Конкретную розетку, допустимость места и защиту цепи должен проверить электрик; это не электропроект.'},
  frame:{name:'Подстолье · СТО, торцевой саморез',source:'Версия13.11.2026 · СТО L30×30×2, три рамы,29болтовМ6',note:'В каждом чёрном бруске один саморез сверху в торец; боковых саморезов в дерево нет. Нижние продольные внутри стоек, диагонали снизу на258мм только к стали. Задняя верхняя крылом вниз; ножкиМ10 и полка18. Три накладки65×65 — эскизные, артикул ещё не подобран. От стены5мм. Прочность и реальные зазоры машины не подтверждены.'},
};

export function strip(length,size,first,grout=3){
  const out=[];let p=0,i=0;while(p<length-.0001){const n=Math.min(i===0?first:size,length-p);if(n>.0001)out.push({start:p,size:n});p+=n+grout;i++;}return out;
}
export function balanced(length,size){const n=Math.max(0,Math.floor((length+3)/(size+3))-1);return strip(length,size,(length-n*size-(n+1)*3)/2);}
export function wallRows(height=2300){return strip(height-10,300,300);}
export function floorTiles(){
  const out=[];for(const [r,row]of balanced(2050,200).entries())for(const [c,col]of strip(2250,600,118.5+(r%3)*201).entries())out.push({id:`F-${r+1}-${c+1}`,x:5+col.start,y:5+row.start,w:col.size,h:row.size,material:'wood'});return out;
}
export function subtractRect(r,hole){
  const x0=Math.max(r.x,hole.x),x1=Math.min(r.x+r.w,hole.x+hole.w),y0=Math.max(r.y,hole.y),y1=Math.min(r.y+r.h,hole.y+hole.h);
  if(x0>=x1||y0>=y1)return[r];
  return [{...r,h:y0-r.y},{...r,y:y1,h:r.y+r.h-y1},{...r,y:y0,w:x0-r.x,h:y1-y0},{...r,x:x1,y:y0,w:r.x+r.w-x1,h:y1-y0}].filter(p=>p.w>.001&&p.h>.001);
}
export function wallTiles(wall){
  const len=['north','south'].includes(wall)?2260:2060;
  const zones=wall==='west'?[{s:5,len:1193.5,material:'light'},{s:1201.5,len:853.5,material:'green'}]:[{s:5,len:len-10,material:wall==='north'?'light':'green'}];
  const out=[];let id=0;
  for(const zone of zones)for(const row of wallRows())for(const col of balanced(zone.len,600)){
    const r={x:zone.s+col.start,y:5+row.start,w:col.size,h:row.size};
    const pieces=wall==='east'?subtractRect(r,{x:200,y:0,w:800,h:2100}):[r];
    for(const p of pieces)out.push({id:`${wall}-${++id}`,s:p.x,y:p.y,w:p.w,h:p.h,material:zone.material});
  }return out;
}
export function heightCheck(topHeight,washerHeight){const c=frameCheck({height:topHeight,washerH:washerHeight});return{clearHeight:c.clear,gap:c.gap,rim:c.rim,requiredTop:c.required,width:c.width,sideGap:c.sideGap,left:c.left,right:c.right};}
