require('./h.js');
const city = `EVALUATE
ADDCOLUMNS(VALUES(Musteriler[Sehir]),
 "Satis", [Net Satış], "Sip", [Sipariş Sayısı], "Sepet", [Ortalama Sepet], "Mus", [Müşteri Sayısı], "MBS", [Müşteri Başı Satış], "Kayitli", [Kayıtlı Müşteri],
 "Iade", [İade Oranı %], "Kargo", CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web","Mobil"}), "Zaman", CALCULATE([Zamanında Teslim %], Satislar[Kanal] IN {"Web","Mobil"}), "Marj", [Kâr Marjı %], "Satir", COUNTROWS(Satislar))`;
T(city);
console.log('TOTAL', ['[Net Satış]','[Sipariş Sayısı]','[Ortalama Sepet]','[Müşteri Sayısı]','[Müşteri Başı Satış]','[İade Oranı %]','CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web","Mobil"})','CALCULATE([Zamanında Teslim %], Satislar[Kanal] IN {"Web","Mobil"})','[Kâr Marjı %]'].map(e=>ev(e)));
T(city.replace('VALUES(Musteriler[Sehir])','VALUES(Musteriler[Bolge])'));
T(city.replace('VALUES(Musteriler[Sehir])','VALUES(Calisanlar[AdSoyad])'));
T(city.replace('VALUES(Musteriler[Sehir])','VALUES(Musteriler[Segment])'));
