require('./h.js');
ms['Beklenen İade %'] = {name:'Beklenen İade %', expr:`DIVIDE(SUMX(VALUES(Urunler[Kategori]), CALCULATE(COUNTROWS(Satislar)) * CALCULATE([İade Oranı %], ALL(Calisanlar))), COUNTROWS(Satislar))`};
ms['BekSehir'] = {name:'BekSehir', expr:`DIVIDE(SUMX(VALUES(Musteriler[Sehir]), CALCULATE(COUNTROWS(Satislar)) * CALCULATE([İade Oranı %], ALL(Calisanlar))), COUNTROWS(Satislar))`};
T(`EVALUATE FILTER(ADDCOLUMNS(VALUES(Calisanlar[AdSoyad]), "Iade", [İade Oranı %], "Bek", [Beklenen İade %], "BekS", [BekSehir], "Mus", [Müşteri Sayısı], "Sip", [Sipariş Sayısı], "Kargo", CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web","Mobil"}), "IadeTutar", [İade Tutarı]), NOT ISBLANK([Iade]))`);
// Can Aydın city distribution & returns
T(`EVALUATE CALCULATETABLE(FILTER(ADDCOLUMNS(VALUES(Musteriler[Sehir]), "Satir", CALCULATE(COUNTROWS(Satislar)), "Iade", CALCULATE(COUNTROWS(Satislar), Satislar[Durum]="İade")), [Satir]>0), Calisanlar[AdSoyad]="Can Aydın")`);
T(`EVALUATE CALCULATETABLE(FILTER(ADDCOLUMNS(VALUES(Musteriler[Musteri]), "Satir", CALCULATE(COUNTROWS(Satislar)), "Iade", CALCULATE(COUNTROWS(Satislar), Satislar[Durum]="İade"), "IadeTutar", [İade Tutarı]), [Iade]>2), Calisanlar[AdSoyad]="Can Aydın")`);
T(`EVALUATE ADDCOLUMNS(VALUES(Tarih[Yil]), "Iade", [İade Oranı %], "CanIade", CALCULATE([İade Oranı %], Calisanlar[AdSoyad]="Can Aydın"))`);
