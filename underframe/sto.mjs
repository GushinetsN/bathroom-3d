export const STO={width:30,thickness:2,pitch:25,first:12.5,hole:8,across:15,
 source:'https://www.ozon.ru/product/stoyka-dlya-stellazha-sto-tselnaya-chernaya-900-mm-4-sht-3380484074/?tab=questions',
 caveat:'L30×30×2 — рабочая трактовка ответа изготовителя. Ось15, радиус гиба и рисунок второго крыла проверить на первой стойке.'};
export const STOCK=[...Array.from({length:3},(_,i)=>({id:`S${i+1}`,length:1800,cuts:[{id:`A${i*2+1}`,start:0,length:850},{id:`A${i*2+2}`,start:875,length:850}]})),
 {id:'S4',length:2000,cuts:[0,625,1250].map((start,i)=>({id:`C${i+1}`,start,length:600}))},
 {id:'S5',length:2000,cuts:[24.5,649.5,1274.5].map((start,i)=>({id:['D5','D3','D4'][i],start,length:596}))},
 {id:'S6',length:1325,cuts:[{id:'B2',start:0,length:1200}]},
 {id:'S7',length:1000,cuts:[{id:'D1',start:0,length:460},{id:'D2',start:500,length:460}]}];
export const TOP_POCKETS=[24,704,1176].map(x=>[x,580]);
export const TOP_SCREWS=[17,697,1183].flatMap(x=>[137.5,437.5].map(z=>[x,z]));
export const SHELF_SCREWS=[835,1035].flatMap(x=>[18,582].map(z=>[x,z]));
// Plan of shelf from above, origin at its front-left corner. Eight open
// edge recesses leave access/clearance for fourteen lower-frame bolts.
export const SHELF_OUTLINE=[[20,0],[24.5,0],[24.5,18],[73.5,18],[73.5,0],[424.5,0],[424.5,18],[473.5,18],[473.5,0],[488,0],[488,26],[508,26],[508,523],[488,523],[488,574],[508,574],[508,592],[473.5,592],[473.5,574],[424.5,574],[424.5,592],[73.5,592],[73.5,574],[24.5,574],[24.5,592],[0,592],[0,574],[20,574],[20,523],[0,523],[0,26],[20,26]];
export function phaseFor(id){const c=STOCK.flatMap(s=>s.cuts).find(c=>c.id===id);return c?((12.5-c.start)%25+25)%25:12.5;}
export function stockCheck(kerf=3){const issues=[];for(const s of STOCK){let end=-kerf;for(const c of s.cuts){if(c.start<end+kerf-1e-6||c.start+c.length>s.length)issues.push(s.id+'/'+c.id);end=c.start+c.length;}}return{issues,bought:STOCK.reduce((n,s)=>n+s.length,0),finished:STOCK.flatMap(s=>s.cuts).reduce((n,c)=>n+c.length,0),kerf};}
