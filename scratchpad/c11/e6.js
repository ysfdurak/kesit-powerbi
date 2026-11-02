const { M, ms, ev, q, rq } = require('./h.js');
console.log(Object.keys(ms).filter(k=>/Mevsim|Endeks|Gün|Tahmin|CAGR|Marj|Bütçe|Sapma|Korel|Eksik|IQR|Çeyrek|Teslim/.test(k)));
for (const e of ['[Brüt Tutar]','CALCULATE([Brüt Tutar], Satislar[Durum] <> "İptal")','[İndirim Tutarı]','[Net Satış]','[İade Tutarı]','[Net Satış] - [İade Tutarı]','[Net Maliyet]','CALCULATE([Toplam Maliyet], Satislar[Durum] = "İade")','[Brüt Kâr]','[Kâr Marjı %]','[Hedef]','[Hedef Gerçekleşme %]','[İade Oranı %]','[İptal Oranı %]','[Ortalama İndirim %]',
'VAR NS = [Net Satış] - [İade Tutarı] VAR NM = [Net Maliyet] - CALCULATE([Toplam Maliyet], Satislar[Durum] = "İade") RETURN DIVIDE(NS - NM, NS)',
'DIVIDE([İade Tutarı], [Net Satış])']) console.log(e.slice(0,80), '=>', ev(e));
console.log(q('[Kâr Marjı %]',{t:'Kategoriler',c:'Kategori'}), q('[Kâr Marjı %]',{t:'Tarih',c:'Yil'}));
console.log(q('[Hedef Gerçekleşme %]',{t:'Kategoriler',c:'Kategori'}), q('[Hedef]',{t:'Tarih',c:'Yil'}), q('[Net Satış]',{t:'Kategoriler',c:'Kategori'}));
console.log(rq(`EVALUATE
VAR Akis = DATATABLE("Tarih", DATETIME, "Nakit", DOUBLE, {{"2025-01-01", -250000}, {"2025-07-01", 60000}, {"2026-01-01", 90000}, {"2026-07-01", 90000}, {"2027-01-01", 80000}})
RETURN ROW("NBD", XNPV(Akis, [Nakit], [Tarih], 0.30), "IVO", XIRR(Akis, [Nakit], [Tarih]))`));
console.log(rq(`EVALUATE
VAR Akis = SELECTCOLUMNS(GENERATESERIES(0, 4), "Donem", [Value], "Tarih", EDATE(DATE(2025,1,1), 6*[Value]), "Nakit", IF([Value] = 0, -250000, 70000))
RETURN ROW("NBD", XNPV(Akis, [Nakit], [Tarih], 0.30), "IVO", XIRR(Akis, [Nakit], [Tarih]), "n", COUNTROWS(Akis))`));
console.log(rq(`EVALUATE ADDCOLUMNS(GENERATESERIES(12, 36, 12), "Taksit", PMT(0.035, [Value], -500000), "Toplam", PMT(0.035, [Value], -500000) * [Value])`));
console.log(rq(`EVALUATE ADDCOLUMNS(GENERATESERIES(0.2, 0.5, 0.1), "NBD", VAR O = [Value] RETURN XNPV(DATATABLE("Tarih", DATETIME, "Nakit", DOUBLE, {{"2025-01-01", -250000}, {"2026-01-01", 120000}, {"2027-01-01", 120000}, {"2028-01-01", 120000}}), [Nakit], [Tarih], O))`));
console.log('fv', ev('FV(0.03, 12, -10000)'), ev('FV(0.03,12,-10000,0,1)'), ev('PV(0.30, 3, -120000)'), ev('FV(0.30,2,0,-100000)'));
