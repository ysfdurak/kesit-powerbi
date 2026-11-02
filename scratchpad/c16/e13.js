require('./h.js');
ms['PB']={name:'x',expr:`VAR Sehir = IF(HASONEVALUE(Musteriler[Sehir]), COALESCE(SELECTEDVALUE(Musteriler[Sehir]), "(Şehir yok)"), "Tüm şehirler")
VAR Sepet = DIVIDE([Ortalama Sepet], CALCULATE([Ortalama Sepet], REMOVEFILTERS(Musteriler))) - 1
VAR Siklik = DIVIDE([Müşteri Başı Sipariş], CALCULATE([Müşteri Başı Sipariş], REMOVEFILTERS(Musteriler))) - 1
VAR Isaret = IF(Sepet >= 0, "+", "−")
RETURN Sehir & " · sepet " & IF(Sepet >= 0, "+", "−") & "%" & FORMAT(ABS(Sepet) * 100, "0") & ", sipariş sıklığı " & IF(Siklik >= 0, "+", "−") & "%" & FORMAT(ABS(Siklik) * 100, "0")`};
T(`EVALUATE ADDCOLUMNS(VALUES(Musteriler[Sehir]), "B", [PB], "Sik", DIVIDE([Müşteri Başı Sipariş], CALCULATE([Müşteri Başı Sipariş], REMOVEFILTERS(Musteriler))) * 100, "Gec7Pay", DIVIDE(CALCULATE(COUNTROWS(Satislar), Satislar[KargoGun]>=7, Satislar[Kanal] IN {"Web","Mobil"}), CALCULATE(COUNTROWS(Satislar), NOT ISBLANK(Satislar[KargoGun]), Satislar[Kanal] IN {"Web","Mobil"})))`);
T(`EVALUATE ADDCOLUMNS(VALUES(Musteriler[Bolge]), "Sik", DIVIDE([Müşteri Başı Sipariş], CALCULATE([Müşteri Başı Sipariş], REMOVEFILTERS(Musteriler))) * 100)`);
console.log(ev('[İade Tutarı]'), ev('CALCULATE([Ortalama Sepet], Satislar[Kanal]="Web")'));
