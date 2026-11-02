require('./h.js');
const p=(...x)=>console.log(JSON.stringify(x));
p(M('[Net Satış]'), M('SUMX(Satislar, [Net Satış])'), M('SUMX(VALUES(Urunler[Urun]), [Net Satış])'));
p(M('SUMX(Satislar, CALCULATE(SUM(Satislar[Tutar]), REMOVEFILTERS(Satislar[SatirNo])))'), M('[Toplam Satış]'));
p(M('COUNTROWS(SUMMARIZE(Satislar, Satislar[SiparisNo], Satislar[Tarih], Satislar[TeslimTarihi], Satislar[KargoGun], Satislar[MusteriNo], Satislar[UrunNo], Satislar[TemsilciNo], Satislar[Kanal], Satislar[Durum], Satislar[Adet], Satislar[BirimFiyat], Satislar[Indirim], Satislar[IndirimBandi], Satislar[Tutar], Satislar[Maliyet], Satislar[KohortAyFarki]))'));
p(M('COUNTROWS(SUMMARIZE(Satislar, Satislar[Tarih], Satislar[MusteriNo], Satislar[UrunNo], Satislar[Adet]))'));
p(M('SUMX(Satislar, CALCULATE(SUM(Satislar[Tutar]), ALLEXCEPT(Satislar, Satislar[Tarih], Satislar[MusteriNo], Satislar[UrunNo], Satislar[Adet])))'));
// ALLSELECTED in iterator
p(G([{t:'Kategoriler',c:'Kategori'}],['[Seçime Göre Pay %]','SUMX(VALUES(Kategoriler[Kategori]), [Seçime Göre Pay %])','SUMX(VALUES(Kategoriler[Kategori]), DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Kategoriler))))']));
// calc column sim
p(Q('EVALUATE TOPN(3, ADDCOLUMNS(Urunler, "A", SUM(Satislar[Tutar]), "B", CALCULATE(SUM(Satislar[Tutar]))), [B])'));
// müşteri ort
p(M('AVERAGEX(Musteriler, [Net Satış])'), M('AVERAGEX(VALUES(Satislar[MusteriNo]), [Net Satış])'), M('DIVIDE([Net Satış], COUNTROWS(Musteriler))'));
p(M('AVERAGEX(Satislar, [Net Satış])'), M('AVERAGEX(Satislar, Satislar[Tutar])'));
p(M('COUNTROWS(FILTER(Musteriler, [Net Satış] > 10000))'), M('COUNTROWS(FILTER(Musteriler, SUM(Satislar[Tutar]) > 10000))'));
