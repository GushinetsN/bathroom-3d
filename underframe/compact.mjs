export {STO} from './sto.mjs?v=20261113-frame-end-screw';
export const STOCK=[...Array.from({length:3},(_,i)=>({id:`S${i+1}`,length:1800,cuts:[{id:`A${i*2+1}`,start:0,length:849.5},{id:`A${i*2+2}`,start:875,length:849.5}]})),{id:'S4',length:2000,cuts:[22.5,622.5,1222.5].map((start,i)=>({id:`C${i+1}`,start,length:580}))},{id:'S5',length:2000,cuts:[2.5,602.5,1202.5].map((start,i)=>({id:['D5','D3','D4'][i],start,length:570}))},{id:'S6',length:1325,cuts:[{id:'B2',start:22.5,length:1180}]},{id:'S7',length:500,cuts:[{id:'D1',start:3.5,length:493}]},{id:'S8',length:500,cuts:[{id:'D2',start:3.5,length:493}]}];
export const TOP_SCREWS=[27,702,1173].flatMap(x=>[150,450].map(z=>[x,z]));
export const SHELF_SCREWS=[835,1035].flatMap(x=>[27,573].map(z=>[x,z]));
export const SHELF_OUTLINE=[[20,0],[473,0],[473,20],[493,20],[493,552],[473,552],[473,572],[20,572],[20,552],[0,552],[0,20],[20,20]];
export function phaseFor(id){const c=STOCK.flatMap(s=>s.cuts).find(a=>a.id===id);return c?((12.5-c.start)%25+25)%25:12.5;}
export function stockCheck(kerf=3){const issues=[];for(const s of STOCK){let end=-kerf;for(const c of s.cuts){if(c.start<end+kerf-1e-6||c.start+c.length>s.length)issues.push(s.id+'/'+c.id);end=c.start+c.length;}}return{issues,bought:STOCK.reduce((n,s)=>n+s.length,0),finished:STOCK.flatMap(s=>s.cuts).reduce((n,c)=>n+c.length,0),kerf};}
