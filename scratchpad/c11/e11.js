const { M, ms, ev, q, rq } = require('./h.js');
console.log(rq(`EVALUATE
VAR Akis = SELECTCOLUMNS(GENERATESERIES(0, 8), "Tarih", EDATE(DATE(2025, 1, 1), 3 * [Value]), "Nakit", IF([Value] = 0, -300000, 50000))
RETURN ROW("NBD", XNPV(Akis, [Nakit], [Tarih], 0.25), "IVO", XIRR(Akis, [Nakit], [Tarih]))`));
console.log(rq(`EVALUATE
VAR Akis = SELECTCOLUMNS(GENERATESERIES(0, 8), "Tarih", EDATE(DATE(2025, 1, 1), 3 * [Value]), "Nakit", IF([Value] = 0, -300000, 50000))
RETURN ADDCOLUMNS(GENERATESERIES(0.10, 0.40, 0.05), "NBD", XNPV(Akis, [Nakit], [Tarih], [Value]))`));
console.log(rq(`EVALUATE ADDCOLUMNS(GENERATESERIES(0.10, 0.40, 0.10), "NBD", XNPV({(DATE(2025,1,1), -250000), (DATE(2026,1,1), 120000), (DATE(2027,1,1), 120000), (DATE(2028,1,1), 120000)}, [Value2], [Value1], [Value]))`));
console.log('senaryo', q('[Senaryo Kârı]',{t:'FiyatSenaryosu',c:'FiyatDegisimi'}), ev('[Brüt Kâr]'));
console.log('ly', 43560.05*(1+ (747065.7/400869.55-1)), (78157.5167-94000.95)/94000.95, 'mape-ish');
console.log('nw-1', ev('AVERAGEX(FILTER(Satislar, NOT ISBLANK(Satislar[TeslimTarihi])), NETWORKDAYS(Satislar[Tarih], Satislar[TeslimTarihi]) - 1)'));
console.log('fmt blank', JSON.stringify(ev('FORMAT(BLANK(), "0")')));
const ft='VAR GY = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih])) RETURN GY * (1 + 0.8)'; console.log(q(ft,{t:'Tarih',c:'YilAy'}).slice(-3));
const f3 = 'VAR Son = MAX(Tarih[Tarih]) RETURN DIVIDE(CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], EOMONTH(Son, -4) + 1, EOMONTH(Son, -1))), 3)';
const err = `VAR T = FILTER(ADDCOLUMNS(VALUES(Tarih[YilAy]), "G", [Net Satış], "F", ${f3.replace('MAX(Tarih[Tarih])','MAX(Tarih[Tarih])')}), [G] > 0 && [F] > 0) RETURN AVERAGEX(T, ABS([G] - [F]) / [G])`;
console.log('mape 2024', ev(err, []), q(err,{t:'Tarih',c:'Yil'}));
console.log('ust median runs', q('IF([Net Satış] > 40257.85, "Üst", "Alt")',{t:'Tarih',c:'YilAy'}).join(' '));
console.log('kat iade vs kargo', q('[Ortalama Kargo Günü]',{t:'Kategoriler',c:'Kategori'}), q('[İade Oranı %]',{t:'Kategoriler',c:'Kategori'}));
