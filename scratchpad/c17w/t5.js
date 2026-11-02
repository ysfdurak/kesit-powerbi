console.log(rq(`EVALUATE SUMMARIZECOLUMNS(Urunler[Kategori], "Net", [Net Satış], "Sip", [Sipariş Sayısı])`));
console.log(rq(`EVALUATE FILTER(SUMMARIZECOLUMNS(Urunler[Kategori], "Net", [Net Satış]), [Net] > 180000)`));
console.log(rq(`EVALUATE SUMMARIZECOLUMNS(Musteriler[Sehir], "Mus", [Müşteri Sayısı], "Net", [Net Satış])`));
console.log('çok siparişli', ev('COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), [Sipariş Sayısı] >= 10))'), ev('COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), [Sipariş Sayısı] >= 8))'), ev('MAXX(VALUES(Musteriler[MusteriNo]), [Sipariş Sayısı])'));
console.log(rq(`EVALUATE TOPN(5, SUMMARIZECOLUMNS(Musteriler[Musteri], "Sip", [Sipariş Sayısı], "Net", [Net Satış]), [Net], DESC)`));
console.log(rq(`EVALUATE SUMMARIZECOLUMNS(Satislar[Kanal], Tarih[Yil], "Net", [Net Satış])`));
console.log('2024 web', ev('CALCULATE([Net Satış], Tarih[Yil]=2024, Satislar[Kanal]="Web")'), ev('CALCULATE(SUM(Satislar[Tutar]), Tarih[Yil]=2024, Satislar[Kanal]="Web", Satislar[Durum]<>"İptal")'));
console.log(rq(`EVALUATE SUMMARIZECOLUMNS(Musteriler[Segment], "Mus", [Müşteri Sayısı], "Sepet", [Ortalama Sepet])`));
console.log('rows per musteri no sales', ev('COUNTROWS(FILTER(Musteriler, ISEMPTY(RELATEDTABLE(Satislar))))'), ev('[Kayıtlı Müşteri]'), ev('DISTINCTCOUNT(Satislar[MusteriNo])'));
