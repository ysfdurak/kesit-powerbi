m('TOTALYTD([Net Satış], Tarih[Tarih], "6-30")');
m('CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6-30"), Tarih[YilAy]="2024-03")');
m('CALCULATE(TOTALYTD([Net Satış], Tarih[Tarih], "6-30"), Tarih[YilAy]="2024-03")');
m('CALCULATE(CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -364, DAY)), Tarih[YilAy]="2024-03")');
q('EVALUATE VAR o = SUMMARIZECOLUMNS(Tarih[YilAy], Kategoriler[Kategori], "T", [Net Satış]) RETURN ROW("Ozet", SUMX(o, [T]), "Ayrinti", [Net Satış], "Satir", COUNTROWS(o))');
q('EVALUATE ADDCOLUMNS(FILTER(Tarih, Tarih[AyNo]=1 && Tarih[Gun]<=4), "ISOYil", YEAR(Tarih[Tarih]-Tarih[GunNo]+4))');
q('EVALUATE ROW("n", COUNTROWS(FILTER(Tarih, Tarih[Yil]=2022 && Tarih[HaftaNo]=52)))');
m('CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Tarih[Yil]=2024)');
m('CALCULATE(SUMX(VALUES(Tarih[YilAy]), CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]))), Tarih[Yil]=2024)');
