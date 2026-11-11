export const room={width:2260,depth:2060,height:2300,colourBoundary:1200,grout:3,gap:5,door:{start:200,width:800,height:2100,verified:false}};
export const fixtures={
  countertop:{name:'Столешница · Дуб вотан',position:[0,874,0],size:[600,26,1200],source:'Куплено · Mebelton, Ozon1035013762',note:'Высота установки900 мм — эскиз. ЛДСП; открытые торцы и отверстия требуют влагозащиты.'},
  basin:{name:'Melana · накладная чаша',position:[140,900,650],size:[360,140,500],source:'Куплено · Ozon276734331',note:'Длинная сторона500 мм вдоль левой стены; положение соответствует рисунку. Форма упрощена.'},
  mirror:{name:'Sundays · зеркало',position:[0,1200,650],size:[16,700,500],source:'Куплено · Ozon3595948833',note:'500×700 мм. Низ1200 мм пока предложен для общего вида; розетку и монтажную высоту уточнить.'},
  toilet:{name:'Grossman GR-4458SQ',position:[0,0,1400],size:[640,835,360],source:'Куплено · снимок Сила воды61933',note:'Ось480 мм от нижней стены по рисунку. Размерная форма, не заводская CAD-модель.'},
  washer:{name:'Indesit · модель не уточнена',position:[60,0,80],size:[600,850,600],source:'Только марка подтверждена',note:'Условно600×600×850. Показаны зазор60 сзади и20 по бокам; выступ люка и точные зазоры проверить по машине.'},
  shower:{name:'Triton Вента-Блэк',position:[1460,0,1060],size:[800,1950,1000],source:'Куплено · снимок Сила воды56696',note:'Подтверждён план800×1000. Высота1950 мм и деталировка створок пока условные. Поддона нет.'},
  drain:{name:'TIM · линейный трап',position:[2125,0,1160],size:[70,12,800],source:'Куплено · снимок Сила воды44146',note:'Подтверждены800×70. Отступы100 от торцов и ось100 от правой стены предварительные. Монтажная высота и фланцы не определены.'},
  showerSystem:{name:'Vexorus · душевая система',position:[1860,0,2060],source:'Куплено · Ozon2748840306',note:'Ось400 от правого угла по рисунку. Верхняя лейка250; высота2100 мм и форма стойки эскизные.'},
  hygienic:{name:'ESKO · гигиенический душ',position:[400,600,2060],source:'Куплено · Ozon1956646868',note:'На нижней стене: ось400 от левого угла,600 от пола по рисунку. Монтажные габариты корпуса уточнить.'},
  mixer:{name:'Чёрный гибкий смеситель',source:'Куплено · референс аналога Ozon5652221511',note:'Форма по указанному аналогу. Габариты, вылет и отверстие купленного смесителя нужно проверить на самом изделии.'},
  frame:{name:'Подстолье · кухонный принцип',source:'Предложение · L40×40×2, чёрная окраска, шесть стоек и фанера',note:'Цвет уголка — чёрный матовый. Перфорация, крепёж и опоры эскизные. Нагрузка узлов и пролёт ЛДСП над машиной не подтверждены.'},
};

export function strip(length,size,first,grout=3){
  const out=[];let p=0,i=0;while(p<length-.0001){const n=Math.min(i===0?first:size,length-p);if(n>.0001)out.push({start:p,size:n});p+=n+grout;i++;}return out;
}
export function balanced(length,size){const n=Math.max(0,Math.floor((length+3)/(size+3))-1);return strip(length,size,(length-n*size-(n+1)*3)/2);}
export function wallRows(height=2300){const len=height-10,n=Math.floor((len+3)/303),last=len-n*303;return last>=100?strip(len,300,last):balanced(len,300);}
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
export function heightCheck(topHeight,washerHeight,beam){return{clearHeight:topHeight-26-(beam?40:0),gap:topHeight-26-(beam?40:0)-washerHeight,rim:topHeight+140,requiredTop:washerHeight+20+26+(beam?40:0)};}
