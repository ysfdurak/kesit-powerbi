require('./h.js');
const Y=[{t:'Tarih',c:'Yil'}], K=[{t:'Kategoriler',c:'Kategori'}];
def('Kohort Müşteri Satış', `VAR DonemBasi = MIN(Tarih[Tarih])
VAR KarsiBasi = EDATE(DonemBasi, -12)
VAR Eski = CALCULATETABLE(VALUES(Musteriler[MusteriNo]), REMOVEFILTERS(Tarih), Musteriler[IlkSiparis] < KarsiBasi)
RETURN CALCULATE([Net Satış], Eski)`);
def('Kohort Müşteri Satış GY', `VAR DonemBasi = MIN(Tarih[Tarih])
VAR KarsiBasi = EDATE(DonemBasi, -12)
VAR Eski = CALCULATETABLE(VALUES(Musteriler[MusteriNo]), REMOVEFILTERS(Tarih), Musteriler[IlkSiparis] < KarsiBasi)
RETURN CALCULATE([Net Satış], Eski, SAMEPERIODLASTYEAR(Tarih[Tarih]))`);
def('Aktif LFL', `VAR A = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")
VAR B = CALCULATETABLE(VALUES(Satislar[MusteriNo]), SAMEPERIODLASTYEAR(Tarih[Tarih]), Satislar[Durum] <> "İptal")
VAR O = INTERSECT(A, B)
RETURN DIVIDE(CALCULATE([Net Satış], O), CALCULATE([Net Satış], O, SAMEPERIODLASTYEAR(Tarih[Tarih]))) - 1`);
console.log(G(Y,['[Net Satış]','[Satış GY]','[YoY %]','[Kohort Müşteri Satış]','[Kohort Müşteri Satış GY]','DIVIDE([Kohort Müşteri Satış],[Kohort Müşteri Satış GY])-1','[Aktif LFL]',
 'COUNTROWS(CALCULATETABLE(VALUES(Musteriler[MusteriNo]), REMOVEFILTERS(Tarih), Musteriler[IlkSiparis] < EDATE(MIN(Tarih[Tarih]), -12)))',
 'COUNTROWS(INTERSECT(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), CALCULATETABLE(VALUES(Satislar[MusteriNo]), SAMEPERIODLASTYEAR(Tarih[Tarih]), Satislar[Durum] <> "İptal")))','[Müşteri Sayısı]']).join('\n'));
console.log(G(K,['DIVIDE([Kohort Müşteri Satış],[Kohort Müşteri Satış GY])-1','[Aktif LFL]','[YoY %]'],[{t:'Tarih',c:'Yil',values:[2024]}]).join('\n'));
console.log(G(Y,['[Net Satış]','[Satış GY]','[YoY %]','[Kohort Müşteri Satış]','[Kohort Müşteri Satış GY]','DIVIDE([Kohort Müşteri Satış],[Kohort Müşteri Satış GY])-1','[Aktif LFL]',
 'COUNTROWS(INTERSECT(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), CALCULATETABLE(VALUES(Satislar[MusteriNo]), SAMEPERIODLASTYEAR(Tarih[Tarih]), Satislar[Durum] <> "İptal")))','[Müşteri Sayısı]']).join('\n'));
console.log(Q('EVALUATE ROW("eski", COUNTROWS(FILTER(Musteriler, Musteriler[IlkSiparis] < DATE(2023,1,1))), "eski aktif24", CALCULATE([Müşteri Sayısı], Tarih[Yil]=2024, FILTER(Musteriler, Musteriler[IlkSiparis] < DATE(2023,1,1))), "eski aktif23", CALCULATE([Müşteri Sayısı], Tarih[Yil]=2023, FILTER(Musteriler, Musteriler[IlkSiparis] < DATE(2023,1,1))))'));
