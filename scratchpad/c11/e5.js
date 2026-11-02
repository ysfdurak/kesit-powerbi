const { M, ev, q, rq } = require('./h.js');
console.log('yil', q('[Net Satış]',{t:'Tarih',c:'Yil'}));
console.log('ay', q('[Net Satış]',{t:'Tarih',c:'YilAy'}).join(' '));
const gun = 'DIVIDE([Net Satış], COUNTROWS(FILTER(Tarih, Tarih[Tarih] >= DATE(2022,6,22))))';
console.log('gunort', q(gun,{t:'Tarih',c:'HaftaninGunu'}), ev(gun));
const gun2 = 'AVERAGEX(VALUES(Tarih[Tarih]), [Net Satış])'; console.log('gunort2 (satış olan gün)', q(gun2,{t:'Tarih',c:'HaftaninGunu'}), ev(gun2));
const gun3 = 'DIVIDE([Net Satış], COUNTROWS(Tarih))'; console.log('gunort3 tüm takvim', ev(gun3), q(gun3,{t:'Tarih',c:'Yil'}));
console.log('days with sales', ev('COUNTROWS(FILTER(VALUES(Tarih[Tarih]), [Net Satış] > 0))'), ev('COUNTROWS(FILTER(Tarih, Tarih[Tarih] >= DATE(2022,6,22)))'));
// endeks: full years only
const mi = 'VAR Ay = DIVIDE(CALCULATE([Net Satış], KEEPFILTERS(Tarih[Yil] IN {2023, 2024})), CALCULATE(DISTINCTCOUNT(Tarih[YilAy]), KEEPFILTERS(Tarih[Yil] IN {2023, 2024}))) VAR Genel = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[Yil] IN {2023, 2024}) / 24 RETURN DIVIDE(Ay, Genel)';
console.log('mevsim', q(mi,{t:'Tarih',c:'Ay'}).join(' '), ev(mi));
console.log('mevsim kategori', q(mi,{t:'Kategoriler',c:'Kategori'}));
console.log('mevsim yil', q(mi,{t:'Tarih',c:'Yil'}));
console.log('existing', q('[Mevsim Endeksi]',{t:'Tarih',c:'Ay'}));
// CAGR H2
const cagr = 'VAR Bas = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), DATESBETWEEN(Tarih[Tarih], DATE(2022,7,1), DATE(2022,12,31))) VAR Son = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), DATESBETWEEN(Tarih[Tarih], DATE(2024,7,1), DATE(2024,12,31))) RETURN POWER(DIVIDE(Son, Bas), 1/2) - 1';
console.log('cagr h2', ev(cagr), q(cagr,{t:'Kategoriler',c:'Kategori'}));
const cagr2 = 'VAR Bas = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[Yil] = 2023) VAR Son = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[Yil] = 2024) RETURN POWER(DIVIDE(Son, Bas), 1/1) - 1';
console.log('cagr 23-24', ev(cagr2), q(cagr2,{t:'Kategoriler',c:'Kategori'}));
console.log('naive cagr 22-24', ev('POWER(DIVIDE(CALCULATE([Net Satış], Tarih[Yil]=2024), CALCULATE([Net Satış], Tarih[Yil]=2022)), 1/2) - 1'));
const cmgr = 'VAR Bas = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[YilAy] = "2023-01") VAR Son = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[YilAy] = "2024-12") RETURN POWER(DIVIDE(Son, Bas), 1/23) - 1';
console.log('cmgr', ev(cmgr));
const cmgrq = 'VAR Bas = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[YilCeyrek] = "2023-Ç1") VAR Son = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[YilCeyrek] = "2024-Ç4") RETURN POWER(DIVIDE(Son, Bas), 1/7) - 1';
console.log('cqgr', ev(cmgrq));
console.log('q', q('[Net Satış]',{t:'Tarih',c:'YilCeyrek'}).join(' '));
// forecast simple
const f3 = 'VAR Son = MAX(Tarih[Tarih]) VAR Donem = DATESINPERIOD(Tarih[Tarih], EOMONTH(Son, -1), -3, MONTH) RETURN CALCULATE([Net Satış], Donem) / 3';
console.log('f3', q(f3,{t:'Tarih',c:'YilAy'}).slice(-6).join(' '));
const fly = 'VAR GY = CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, YEAR)) RETURN GY * (1 + 0.1)';
console.log('fly', q(fly,{t:'Tarih',c:'YilAy'}).slice(-6).join(' '));
// median line
console.log('median month', ev('MEDIANX(FILTER(ADDCOLUMNS(VALUES(Tarih[YilAy]), "S", [Net Satış]), NOT ISBLANK([S])), [S])'), ev('AVERAGEX(FILTER(ADDCOLUMNS(VALUES(Tarih[YilAy]), "S", [Net Satış]), NOT ISBLANK([S])), [S])'), ev('COUNTROWS(FILTER(ADDCOLUMNS(VALUES(Tarih[YilAy]), "S", [Net Satış]), NOT ISBLANK([S])))'));
console.log('median line per row', q('MEDIANX(FILTER(ADDCOLUMNS(ALLSELECTED(Tarih[YilAy]), "S", [Net Satış]), NOT ISBLANK([S])), [S])',{t:'Tarih',c:'YilAy'}).slice(0,8).join(' '));
