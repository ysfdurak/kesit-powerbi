require('./h.js');
const GT=[{t:'GiderTurleri',c:'GiderTuru'}], D=[{t:'Departmanlar',c:'Departman'}], K=[{t:'Kategoriler',c:'Kategori'}], Y=[{t:'Tarih',c:'Yil'}];
console.log(G(GT,['[Gider]','[Proje Bütçesi]','CALCULATE([Proje Bütçesi], CROSSFILTER(Giderler[DepartmanNo], Departmanlar[DepartmanNo], BOTH))','CALCULATE([Proje Bütçesi], TREATAS(VALUES(Giderler[DepartmanNo]), Departmanlar[DepartmanNo]))','CALCULATE([Proje Bütçesi], TREATAS(VALUES(Giderler[DepartmanNo]), Projeler[DepartmanNo]))']).join('\n'));
console.log(Q('EVALUATE SUMMARIZECOLUMNS(GiderTurleri[GiderTuru], "deps", CONCATENATEX(VALUES(Giderler[DepartmanNo]), Giderler[DepartmanNo], ","))'));
console.log(G(Y,['[Proje Bütçesi]','CALCULATE([Proje Bütçesi], CROSSFILTER(Giderler[DepartmanNo], Departmanlar[DepartmanNo], BOTH))']).join('\n'));
def('Alıcıların Toplam Satışı', 'CALCULATE([Net Satış], CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), REMOVEFILTERS(Kategoriler), REMOVEFILTERS(Urunler))');
console.log(G(K,['[Net Satış]','[Müşteri Sayısı]','[Alıcıların Toplam Satışı]','CALCULATE([Net Satış], TREATAS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), Musteriler[MusteriNo]), REMOVEFILTERS(Urunler))']).join('\n'));
console.log(G(Y,['[Alıcıların Toplam Satışı]']).join('\n'));
