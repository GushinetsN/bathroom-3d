// Единственный размерный исходник действующей редакции. Все значения в мм.
export const INPUTS={
 revision:'2026-11-17',
 top:{width:1200,depth:600,thickness:40,material:'Клеёный массив дуба',name:'Welcome Wood · дуб с живым краем',owned:true,source:'https://www.ozon.ru/product/1676256641/',status:'40 мм подтверждены владельцем; фактический контур живого края неизвестен'},
 basin:{width:500,depth:360,height:140,drain:45,color:'белый',owned:true,source:'https://www.ozon.ru/product/276734331/',status:'Размеры карточки купленного товара; масса и установочный шаблон не подтверждены'},
 faucet:{baseDiameter:35,baseHeight:105,flexLength:445,color:'чёрный',owned:true,source:'https://www.ozon.ru/product/5652221511/',status:'Аналог по прямой ссылке владельца. Высота/вылет гибкого излива меняются; посадку и резьбу сверить по купленному крану'},
 washer:{width:600,depth:600,height:850,owned:true,status:'Условный габарит стандартной Indesit; 17.11 владелец сообщила, что точнее указать не может. Модель, люк и требования инструкции неизвестны'},
 foot:{baseDiameter:32,baseHeight:10,studDiameter:10,studLength:40,nominalBottom:29,adjustment:3,plateWidth:40,plateThickness:4,plateHole:11,nutHeight:10,nutFlange:21.8,source:'https://www.ozon.ru/product/1571555304/'},
 wood:{width:30,length:217.5,chamfer:3,socketDiameter:12,socketDepth:28},
 fixing:{top:{diameter:5,length:30,washerOuter:15,washerInner:5.3,washerThickness:1.2,pilotDiameter:3.5,pilotDepth:28},shelf:{diameter:4,length:12,washerOuter:12,washerInner:4.3,washerThickness:1},foot:{diameter:4,length:25,washerOuter:12,washerInner:4.3,washerThickness:1}},
 wall:{status:'Закладные есть. Узлы, крепёж и проверку жёсткости определяет прораб по месту; фиктивных анкеров в модели нет'},
 safety:{childLoadKg:15,status:'Прочность нестандартного каркаса и верхних узлов не рассчитана. До нагрузки требуется решение прораба, включая крепление к закладным'}
};
export const LEVELS={bottom:INPUTS.foot.nominalBottom,postTop:INPUTS.foot.nominalBottom+900,bearing:INPUTS.foot.nominalBottom+907.5,lower:INPUTS.foot.nominalBottom+217.5};
LEVELS.top=LEVELS.bearing+INPUTS.top.thickness;
