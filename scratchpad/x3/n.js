require('./h.js');
try { console.log(Q(`DEFINE
    MEASURE Satislar[Çok Kanallı Müşteri] =
        COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), CALCULATE(DISTINCTCOUNT(Satislar[Kanal]), Satislar[Durum] <> "İptal") >= 2))
EVALUATE
SUMMARIZECOLUMNS(Tarih[Yil], "Çok kanallı", [Çok Kanallı Müşteri], "Müşteri", [Müşteri Sayısı])`)); } catch(e){console.log('ERR',e.message)}
console.log(Q(`EVALUATE
EXCEPT(
    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023),
    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023, Satislar[Durum] <> "İptal")
)`));
// tie check on Lider Ürün over all categories x years
console.log(G([{t:'Tarih',c:'YilAy'}], ['CONCATENATEX(TOPN(1, VALUES(Urunler[Urun]), [Net Satış], DESC), Urunler[Urun], ", ")']).filter(r=>String(r[1]).includes(',')).slice(0,3));
// marj summed anti
console.log(E('SUMX(VALUES(Kategoriler[Kategori]), [Kâr Marjı %])'), E('[Kâr Marjı %]'));
