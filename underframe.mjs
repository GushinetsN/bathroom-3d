import {createModel} from './underframe/sto-model.mjs?v=20261113-frame-end-screw';
import {check} from './underframe/compact-design.mjs?v=20261113-frame-end-screw';

export const wallOffset=5;
export function washerPlacement(height=900){
  const c=check({height});
  return {position:[600+wallOffset-c.front-600,0,c.left+c.sideGap],check:c};
}
export function createUnderframe(height=900){
  const model=createModel({height});
  const items=model.items.filter(o=>!['T1','S1','M1','WM'].includes(o.name)&&o.userData.part.layer!=='anchors');
  for(const o of model.items)if(!items.includes(o)){model.root.remove(o);o.traverse(n=>n.geometry?.dispose());}
  model.root.rotation.y=-Math.PI/2;
  model.root.position.x=600+wallOffset;
  for(const o of items){
    const a=o.userData.part;
    o.userData.id=a.id;
    o.userData.record={name:a.name,size:a.kind==='angle'?[a.length,30,30]:a.cut||a.size,
      source:'Подстолье СТО · версия13.11.2026 · один саморез в торец ножки',
      note:(a.note||'')+' Допустимая нагрузка всей конструкции не подтверждена.'};
  }
  return {...model,items};
}
