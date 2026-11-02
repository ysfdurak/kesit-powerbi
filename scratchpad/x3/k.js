require('./h.js');
def('Medyan Sipariş Tutarı', `MEDIANX(CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal"), [Net Satış])`);
console.log(E('[Medyan Sipariş Tutarı]'), E('MEDIAN(Satislar[Tutar])'), E('[Ortalama Sepet]'), G([{t:'Tarih',c:'Yil'}], ['[Medyan Sipariş Tutarı]','[Ortalama Sepet]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Medyan Sipariş Tutarı]']));
def('Hedefe Kalan Tutar', `VAR Kalan = [Hedef] - [Net Satış] RETURN IF(NOT ISBLANK([Hedef]), MAX(Kalan, 0))`);
console.log(E('[Hedefe Kalan Tutar]'), G([{t:'Tarih',c:'Yil'}], ['[Hedefe Kalan Tutar]','[Hedef]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Hedefe Kalan Tutar]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Hedefe Kalan Tutar]'],[{t:'Tarih',c:'Yil',values:[2024]}]));
console.log(Q(`EVALUATE
SUMMARIZECOLUMNS(
    Tarih[Yil],
    "Rapor", [Net Satış],
    "Kaynak", CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] IN {"Teslim Edildi", "Kargoda", "İade"}),
    "Fark", [Net Satış] - CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] IN {"Teslim Edildi", "Kargoda", "İade"})
)`));
console.log(Q(`EVALUATE
SUMMARIZECOLUMNS(Satislar[Durum], "Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]), "Müşteri", DISTINCTCOUNT(Satislar[MusteriNo]))`));
def('Seçim Özeti Başlığı', `VAR Kat = IF(ISFILTERED(Kategoriler[Kategori]), IF(HASONEVALUE(Kategoriler[Kategori]), SELECTEDVALUE(Kategoriler[Kategori]), COUNTROWS(VALUES(Kategoriler[Kategori])) & " kategori"), "Tüm kategoriler")
VAR Yil = IF(HASONEVALUE(Tarih[Yil]), FORMAT(SELECTEDVALUE(Tarih[Yil]), "0"), "Tüm yıllar")
RETURN "Net satış · " & Kat & " · " & Yil`);
console.log(E('[Seçim Özeti Başlığı]'), E('[Seçim Özeti Başlığı]', [{t:'Kategoriler',c:'Kategori',values:['Kitap','Spor']}]), G([{t:'Kategoriler',c:'Kategori'}], ['[Seçim Özeti Başlığı]']).slice(0,2));
// İade effect
console.log(E('[İade Tutarı]'), E('[Net Satış] - [İade Tutarı]'));
// customers only cancelled 2023
console.log(Q(`EVALUATE ROW("x", COUNTROWS(EXCEPT(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil]=2023), CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil]=2023, Satislar[Durum] <> "İptal"))))`));
