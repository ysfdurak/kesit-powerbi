require('./h.js');
console.log(Q('EVALUATE GROUPBY(ADDCOLUMNS(VALUES(Satislar[MusteriNo]), "K", CALCULATE(DISTINCTCOUNT(Urunler[Kategori]), Satislar[Durum] <> "İptal", CROSSFILTER(Satislar[UrunNo], Urunler[UrunNo], BOTH))), [K], "n", COUNTX(CURRENTGROUP(), 1))'));
console.log(Q('EVALUATE GROUPBY(ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), "K", CALCULATE(COUNTROWS(SUMMARIZE(Satislar, Urunler[Kategori])), Satislar[Durum] <> "İptal")), [K], "n", COUNTX(CURRENTGROUP(), 1))'));
const cok='COUNTROWS(FILTER(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), CALCULATE(DISTINCTCOUNT(Urunler[Kategori]), REMOVEFILTERS(Kategoriler), Satislar[Durum] <> "İptal", CROSSFILTER(Satislar[UrunNo], Urunler[UrunNo], BOTH)) >= 4))';
console.log(G([{t:'Kategoriler',c:'Kategori'}],[cok]).join('\n')); console.log(G([{t:'Tarih',c:'Yil'}],[cok]).join('\n'));
console.log(G([{t:'Satislar',c:'Kanal'}],['CALCULATE(DISTINCTCOUNT(Urunler[Kategori]))','CALCULATE(DISTINCTCOUNT(Urunler[Kategori]), CROSSFILTER(Satislar[UrunNo], Urunler[UrunNo], BOTH))']).join('\n'));
