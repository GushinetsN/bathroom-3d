export {STO} from './sto.mjs';
import {LEVELS} from './inputs.mjs';
export const STO_GUSSET={article:'2554277360',source:'https://www.ozon.ru/product/komplekt-chernyh-usiliteley-dlya-polki-sto-2554277360/',pack:8,pitch:50,thickness:.7,envelopeConfirmed:false,caveat:'Чёрный комплект8шт вновь продаётся: проверка исходного чата, снимок в checks. Для линейки подтверждены шаг50, сталь0,7, М6. Контур75×75/плечи25/отступ12,5/Ø6,5 условны, требуется обмер именно чёрного комплекта. Комплектный крепёж оцинкован; длины не опубликованы.'};
export const LAYOUT={xs:[5,680,1195],zs:[42.5,557.5],frameW:1190,frameD:515,lowerY:LEVELS.lower};
export const TOP_SCREWS=[27,702,1173].map(x=>[x,312.5]);
export const SHELF_SCREWS=[837.5,1062.5].flatMap(x=>[71,529].map(z=>[x,z]));
// The prior scheme: inward lower flanges, a level shelf, four corner pockets for foot-end heads.
export const SHELF_OUTLINE=[[20,0],[456,0],[456,20],[476,20],[476,458],[456,458],[456,478],[20,478],[20,458],[0,458],[0,20],[20,20]];
export const STOCK=[...Array.from({length:6},(_,i)=>({id:'900-'+(i+1),length:900,cuts:[{id:'A'+(i+1),start:0,length:900,ready:true}]})),...Array.from({length:8},(_,i)=>({id:'500-'+(i+1),length:500,cuts:[{id:i<3?'C'+(i+1):'D'+(i-2),start:0,length:500,ready:true}]})),...['B1','B2'].map(id=>({id:'1500-'+id,length:1500,cuts:[{id,start:17.5,length:1190}]}))];
export function phaseFor(id){return ['B1','B2'].includes(id)?20:12.5;}
export function stockCheck(kerf=3){return{issues:STOCK.flatMap(s=>s.cuts.filter(c=>c.start<0||c.start+c.length>s.length).map(c=>c.id)),bought:STOCK.reduce((n,s)=>n+s.length,0),finished:STOCK.flatMap(s=>s.cuts).reduce((n,c)=>n+c.length,0),kerf};}
