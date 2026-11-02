console.log(ev('DISTINCTCOUNT(Musteriler[Musteri])'), ev('COUNTROWS(FILTER(Musteriler, Musteriler[Musteri]="Kaan Kara"))'));
console.log(rq(`EVALUATE TOPN(5, ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "Ad", CALCULATE(MAX(Musteriler[Musteri])), "Sip", [Sipariş Sayısı], "Net", [Net Satış]), [Net], DESC)`));
console.log(rq(`EVALUATE FILTER(ADDCOLUMNS(VALUES(Musteriler[Musteri]), "N", CALCULATE(COUNTROWS(Musteriler))), [N] > 1)`));
console.log('ort sepet 2024 web', ev('CALCULATE([Ortalama Sepet], Tarih[Yil]=2024)'));
console.log(rq(`EVALUATE FILTER(SUMMARIZECOLUMNS(Musteriler[Sehir], "Mus", [Müşteri Sayısı]), [Mus] >= 10)`));
