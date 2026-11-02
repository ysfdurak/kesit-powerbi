require('./h.js');
def('Önceki Çeyrek Satışı', `CALCULATE([Net Satış], PREVIOUSQUARTER(Tarih[Tarih]))`);
console.log(G([{t:'Tarih',c:'Yil'}], ['[Önceki Çeyrek Satışı]','[Net Satış]']), G([{t:'Tarih',c:'YilCeyrek'}], ['[Önceki Çeyrek Satışı]','[Net Satış]']).slice(6));
console.log(Q(`EVALUATE TOPN(5, SUMMARIZECOLUMNS(Urunler[Urun], Urunler[Kategori], TREATAS({2024}, Tarih[Yil]), "Net Satış 2024", [Net Satış]), [Net Satış 2024], DESC) ORDER BY [Net Satış 2024] DESC`));
console.log(Q('EVALUATE SUMMARIZECOLUMNS(Satislar[Kanal], "N", [Net Satış], "M", [Müşteri Sayısı])'));
def('Çok Kanallı Müşteri', `COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), CALCULATE(DISTINCTCOUNT(Satislar[Kanal]), Satislar[Durum] <> "İptal") >= 2))`);
console.log(E('[Çok Kanallı Müşteri]'), G([{t:'Tarih',c:'Yil'}], ['[Çok Kanallı Müşteri]','[Müşteri Sayısı]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Çok Kanallı Müşteri]']));
def('Lider Ürün', `VAR Lider = TOPN(1, VALUES(Urunler[Urun]), [Net Satış], DESC) RETURN CONCATENATEX(Lider, Urunler[Urun], ", ")`);
console.log(E('[Lider Ürün]'), G([{t:'Tarih',c:'Yil'}], ['[Lider Ürün]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Lider Ürün]']));
// wrong customer count
console.log(E('DISTINCTCOUNT(Satislar[MusteriNo])'), E('[Müşteri Sayısı]'), G([{t:'Tarih',c:'Yil'}], ['DISTINCTCOUNT(Satislar[MusteriNo])','[Müşteri Sayısı]']));
// avg order wrong
console.log(E('AVERAGE(Satislar[Tutar])'), E('[Ortalama Sepet]'), E('CALCULATE(AVERAGE(Satislar[Tutar]), Satislar[Durum] <> "İptal")'));
// kargo for cancelled
console.log(Q('EVALUATE SUMMARIZECOLUMNS(Satislar[Durum], "kg", AVERAGE(Satislar[KargoGun]), "nb", COUNT(Satislar[KargoGun]))'));
