const {ev,q,run,def}=require('./h.js');
def('Son Sipariş','CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), REMOVEFILTERS(Satislar[Kanal]), Satislar[Durum] <> "İptal")');
def('Veri Sonu','MAXX(ALL(Satislar), Satislar[Tarih])');
def('Sessiz Gün','VAR Son = [Son Sipariş]\nRETURN IF(NOT ISBLANK(Son), DATEDIFF(Son, [Veri Sonu], DAY))');
def('Kaybedilen Müşteri','COUNTROWS(FILTER(CALCULATETABLE(VALUES(Satislar[MusteriNo]), REMOVEFILTERS(Tarih), Satislar[Durum] <> "İptal"), [Sessiz Gün] >= 180))');
def('Alışveriş Yapmış Müşteri','CALCULATE([Müşteri Sayısı], REMOVEFILTERS(Tarih))');
def('Kayıp Oranı %','DIVIDE([Kaybedilen Müşteri], [Alışveriş Yapmış Müşteri])');
def('Kaybedilen Ciro','CALCULATE([Net Satış], REMOVEFILTERS(Tarih), FILTER(VALUES(Musteriler[MusteriNo]), [Sessiz Gün] >= 180))');
def('Riskli Müşteri','COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), VAR G = [Sessiz Gün] RETURN G >= 90 && G < 180))');
console.log(ev('[Veri Sonu]'), ev('[Kaybedilen Müşteri]'), ev('[Alışveriş Yapmış Müşteri]'), ev('[Kayıp Oranı %]'), ev('[Kaybedilen Ciro]'), ev('CALCULATE([Net Satış],REMOVEFILTERS(Tarih))'), ev('[Riskli Müşteri]'), ev('[Kayıtlı Müşteri]'));
for (const c of ['Segment','YasGrubu','Sehir','Bolge']) console.log(c, q(['[Kaybedilen Müşteri]','[Alışveriş Yapmış Müşteri]','[Kayıp Oranı %]','[Kaybedilen Ciro]'],{t:'Musteriler',c}));
console.log('kanal', q(['[Kaybedilen Müşteri]','[Alışveriş Yapmış Müşteri]','[Kayıp Oranı %]','[Kaybedilen Ciro]'],{t:'Satislar',c:'Kanal'}));
console.log('kat', q(['[Kaybedilen Müşteri]','[Kayıp Oranı %]'],{t:'Kategoriler',c:'Kategori'}));
console.log('yil', q(['[Kaybedilen Müşteri]','[Kayıp Oranı %]'],{t:'Tarih',c:'Yil'}));
// avg spend churned vs active
console.log('kayıp müşteri başı', ev('DIVIDE([Kaybedilen Ciro],[Kaybedilen Müşteri])'), ev('DIVIDE(CALCULATE([Net Satış],REMOVEFILTERS(Tarih)) - [Kaybedilen Ciro], [Alışveriş Yapmış Müşteri]-[Kaybedilen Müşteri])'));
console.log(run(`EVALUATE
TOPN(10, FILTER(ADDCOLUMNS(VALUES(Musteriler[Musteri]), "Son", [Son Sipariş], "Gun", [Sessiz Gün], "Ciro", CALCULATE([Net Satış], REMOVEFILTERS(Tarih)), "Seg", MAX(Musteriler[Segment])), [Gun] >= 90 && [Gun] < 180), [Ciro], DESC)`));
// distribution of silent days
console.log(run(`EVALUATE ROW("lt90", COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), [Sessiz Gün] < 90)), "90-179", [Riskli Müşteri], "180+", [Kaybedilen Müşteri], "hic", COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), ISBLANK([Sessiz Gün]))))`));
