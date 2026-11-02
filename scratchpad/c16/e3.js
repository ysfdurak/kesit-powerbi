require('./h.js');
const exp = `DIVIDE(SUMX(VALUES(Urunler[Kategori]), CALCULATE(COUNTROWS(Satislar)) * CALCULATE([İade Oranı %], ALL(Calisanlar))), COUNTROWS(Satislar))`;
T(`EVALUATE FILTER(ADDCOLUMNS(VALUES(Calisanlar[AdSoyad]), "Iade", [İade Oranı %], "Bek", ${exp}, "Satir", CALCULATE(COUNTROWS(Satislar)), "IadeSatir", CALCULATE(COUNTROWS(Satislar), Satislar[Durum]="İade"), "Sehirler", CALCULATE(DISTINCTCOUNT(Musteriler[Sehir])), "Endeks", DIVIDE([Müşteri Başı Satış], CALCULATE([Müşteri Başı Satış], ALL(Calisanlar)))*100), NOT ISBLANK([Iade]))`);
T(`EVALUATE ADDCOLUMNS(VALUES(Urunler[Kategori]), "Iade", [İade Oranı %], "Satir", CALCULATE(COUNTROWS(Satislar)))`);
// city z-score of MBS
T(`EVALUATE VAR S = FILTER(ADDCOLUMNS(VALUES(Musteriler[Sehir]), "M", [Müşteri Başı Satış]), NOT ISBLANK(Musteriler[Sehir])) RETURN ROW("ort", AVERAGEX(S,[M]), "sd", STDEVX.P(S,[M]), "n", COUNTROWS(S))`);
T(`EVALUATE VAR S = FILTER(ADDCOLUMNS(VALUES(Musteriler[Sehir]), "M", [İade Oranı %]+0), NOT ISBLANK(Musteriler[Sehir])) RETURN ROW("ort", AVERAGEX(S,[M]), "sd", STDEVX.P(S,[M]))`);
T(`EVALUATE ADDCOLUMNS(VALUES(Musteriler[Sehir]), "z", VAR S = FILTER(ADDCOLUMNS(ALL(Musteriler[Sehir]), "M", [Müşteri Başı Satış]), NOT ISBLANK(Musteriler[Sehir])) VAR o = AVERAGEX(S,[M]) VAR sd = STDEVX.P(S,[M]) RETURN DIVIDE([Müşteri Başı Satış]-o, sd))`);
// city by channel
T(`EVALUATE ADDCOLUMNS(VALUES(Musteriler[Sehir]), "Web", CALCULATE([Net Satış], Satislar[Kanal]="Web"), "Mob", CALCULATE([Net Satış], Satislar[Kanal]="Mobil"), "Mag", CALCULATE([Net Satış], Satislar[Kanal]="Mağaza"), "MagPay", DIVIDE(CALCULATE([Net Satış], Satislar[Kanal]="Mağaza"),[Net Satış]), "SipBasiAdet", DIVIDE([Satılan Adet],[Sipariş Sayısı]), "OrtFiyat",[Ortalama Birim Fiyat], "KargoWM", CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web","Mobil"}), "KargoSatir", CALCULATE(COUNT(Satislar[KargoGun]), Satislar[Kanal] IN {"Web","Mobil"}), "Gec7", CALCULATE(COUNTROWS(Satislar), Satislar[KargoGun]>=7, Satislar[Kanal] IN {"Web","Mobil"}))`);
console.log(ev('DIVIDE([Satılan Adet],[Sipariş Sayısı])'), ev('[Ortalama Birim Fiyat]'), ev('DIVIDE(CALCULATE([Net Satış], Satislar[Kanal]="Mağaza"),[Net Satış])'));
