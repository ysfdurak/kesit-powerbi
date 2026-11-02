require('./e.js');
const p = x => console.log(JSON.stringify(x));
p(Q('EVALUATE VALUES(Satislar[Kanal])'));
p(Q('EVALUATE VALUES(Satislar[Durum])'));
p(Q('EVALUATE VALUES(Tarih[Yil])'));
p(Q('EVALUATE ROW("min", MIN(Satislar[Tarih]), "max", MAX(Satislar[Tarih]))'));
p(Q('EVALUATE TOPN(30, SELECTCOLUMNS(Calisanlar, "No", Calisanlar[CalisanNo], "Ad", Calisanlar[AdSoyad], "Yon", Calisanlar[YoneticiNo], "E", Calisanlar[Eposta], "Yol", Calisanlar[Yol], "U", Calisanlar[Unvan]), [No], ASC)'));
p(Q('EVALUATE TOPN(3, Tarih, Tarih[Tarih], ASC)'));
p(Q('EVALUATE ROW("Tarih", DISTINCTCOUNT(Satislar[Tarih]), "Musteri", DISTINCTCOUNT(Satislar[MusteriNo]), "Siparis", DISTINCTCOUNT(Satislar[SiparisNo]), "SatirNo", DISTINCTCOUNT(Satislar[SatirNo]), "Kanal", DISTINCTCOUNT(Satislar[Kanal]), "Tutar", DISTINCTCOUNT(Satislar[Tutar]), "Urun", DISTINCTCOUNT(Satislar[UrunNo]), "Durum", DISTINCTCOUNT(Satislar[Durum]))'));
