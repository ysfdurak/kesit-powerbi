require('./e.js');
const p = x => console.log(JSON.stringify(x));
p(Q('EVALUATE SUMMARIZECOLUMNS(Satislar[TemsilciNo], "N", [Net Satış])'));
p(M('[Net Satış]'));
p(Q('EVALUATE SUMMARIZECOLUMNS(Satislar[Kanal], "N", [Net Satış], "Kolon", CALCULATE([Net Satış], Satislar[Kanal] = "Web"), "Filt", CALCULATE([Net Satış], FILTER(Satislar, Satislar[Kanal] = "Web")), "Keep", CALCULATE([Net Satış], KEEPFILTERS(Satislar[Kanal] = "Web")))'));
// precedence
p(Q(`EVALUATE CALCULATETABLE(SUMMARIZECOLUMNS(Tarih[YilAy], "YTDdisi", CALCULATE(DIVIDE([Net Satış], COUNTROWS(Tarih)), DATESYTD(Tarih[Tarih])), "Ortdisi", DIVIDE(CALCULATE([Net Satış], DATESYTD(Tarih[Tarih])), COUNTROWS(Tarih)), "Net", [Net Satış], "YTD", [Satış YTD]), Tarih[Yil] = 2024, Tarih[AyNo] <= 4)`));
p(Q('EVALUATE ROW("ekip2", CALCULATE([Net Satış], FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], 2))), "elif", CALCULATE([Net Satış], Calisanlar[CalisanNo]=2), "ece", CALCULATE([Net Satış], Calisanlar[CalisanNo]=9))'));
p(Q('EVALUATE SUMMARIZECOLUMNS(Musteriler[Bolge], "N", [Net Satış])'));
p(Q('EVALUATE ROW("n", COUNTROWS(SUMMARIZECOLUMNS(Tarih[YilAy], Kategoriler[Kategori], "x", [Net Satış])), "n2", COUNTROWS(SUMMARIZECOLUMNS(Tarih[YilAy], Urunler[UrunNo], "x", [Toplam Satış])), "ay", DISTINCTCOUNT(Satislar[Tarih]))'));
