require('./e.js');
const t=(e,s)=>{try{return ev(e,s)}catch(x){return 'ERR '+x.message.slice(0,90)}};
const gp='SUMX(VALUES(Tarih[YilAy]), VAR AyHedef = CALCULATE([Hedef], ALLEXCEPT(Tarih, Tarih[YilAy])) VAR Gorunen = CALCULATE(COUNTROWS(Tarih)) VAR AyGunu = CALCULATE(COUNTROWS(Tarih), ALLEXCEPT(Tarih, Tarih[YilAy])) RETURN AyHedef * DIVIDE(Gorunen, AyGunu))';
const days=[];for(let d=1;d<=15;d++)days.push(new Date(Date.UTC(2024,2,d)));
const sl=[{t:'Tarih',c:'Tarih',values:days}];
p('mart24 hedef', t('[Hedef]',[{t:'Tarih',c:'YilAy',values:['2024-03']}]), 'net', t('[Net Satış]',[{t:'Tarih',c:'YilAy',values:['2024-03']}]));
p('1-15 mart', 'net', t('[Net Satış]',sl), 'hedef', t('[Hedef]',sl), 'pay', t(gp,sl), 'oran', t('DIVIDE([Net Satış], '+gp+')',sl), t('[Hedef Gerçekleşme %]',sl));
p(g([{t:'Tarih',c:'Yil'}],[gp,'[Hedef]','DIVIDE([Satış YTD], [Hedef YTD])']), g([{t:'Kategoriler',c:'Kategori'}],[gp]).slice(0,2));
const may=[{t:'Tarih',c:'YilAy',values:['2024-05']}];
p('may ytd', t('[Satış YTD]',may), t('[Hedef YTD]',may), t('DIVIDE([Satış YTD], [Hedef YTD])',may), 'aylık', t('[Hedef Gerçekleşme %]',may));
p('ay sayisi', g([{t:'Tarih',c:'Yil'}],['COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Net Satış] >= [Hedef]))']), g([{t:'Kategoriler',c:'Kategori'}],['COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Net Satış] >= [Hedef]))']));
p('kalan', g([{t:'Tarih',c:'Yil'}],['MAX(0, [Hedef] - [Net Satış])','IF([Net Satış] < [Hedef], [Hedef] - [Net Satış], 0)']));
p(g([{t:'Kategoriler',c:'Kategori'}],['IF([Net Satış] < [Hedef], [Hedef] - [Net Satış], 0)','[Hedef]','[Net Satış]']));
// wrong: sum of ratios
p('ort oran', t('AVERAGEX(VALUES(Tarih[YilAy]), [Hedef Gerçekleşme %])',[{t:'Tarih',c:'Yil',values:[2024]}]), t('[Hedef Gerçekleşme %]',[{t:'Tarih',c:'Yil',values:[2024]}]));
// hedef at day grain
p(g([{t:'Tarih',c:'Tarih'}],['[Hedef]'],[{t:'Tarih',c:'YilAy',values:['2024-03']}]).slice(0,3));
