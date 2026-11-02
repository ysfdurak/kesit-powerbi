const {ev,q,run,def,ms}=require('./h.js');
def('Son Sipariş','CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), REMOVEFILTERS(Satislar[Kanal]), Satislar[Durum] <> "İptal")');
def('Veri Sonu','MAXX(ALL(Satislar), Satislar[Tarih])');
def('Sessiz Gün','VAR Son = [Son Sipariş]\nRETURN IF(NOT ISBLANK(Son), DATEDIFF(Son, [Veri Sonu], DAY))');
def('Riskli Müşteri','COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), VAR G = [Sessiz Gün] RETURN G >= 90 && G < 180))');
def('Riskli Ciro','CALCULATE([Net Satış], REMOVEFILTERS(Tarih), FILTER(VALUES(Musteriler[MusteriNo]), VAR G = [Sessiz Gün] RETURN G >= 90 && G < 180))');
console.log(q(['[Riskli Müşteri]','[Riskli Ciro]'],{t:'Musteriler',c:'Segment'}), ev('[Riskli Ciro]'));
console.log(q(['[Müşteri Sayısı]','[Müşteri Başı Satış]','[Müşteri Başı Sipariş]'].map(m=>`CALCULATE(${m}, REMOVEFILTERS(Tarih))`),{t:'Musteriler',c:'Segment'}));
for (const n of ['Kaybedilen Müşteri','Kayıp Oranı %','Kaybedilen Ciro','Maaş 1. Çeyrek','Maaş 3. Çeyrek','Doğrudan Bağlı','İşe Alım Sayısı','Ortalama Stok (Ay Sonu)','Stok Devir Hızı','Stokta Kalma Günü','Stoksuz Ürün-Ay','Sepetten Satın Alma %','E-ticaret Kargo Günü','Geç Teslim İade %','Hedef Gerçekleşme YTD %','Hedef Açığı YTD','Büyüme Sırası','Hedef Özeti Metni','Sessiz Gün','Son Sipariş','Veri Sonu','Riskli Müşteri','Ortalama Stok Değeri','İşe Alım','Yönetici Sayısı','Ortalama Ekip Büyüklüğü']) if (PBI_MEASURES.find(m=>m.name===n)) console.log('ÇAKIŞMA', n);
console.log(run(`EVALUATE
TOPN(5, FILTER(ADDCOLUMNS(VALUES(Musteriler[Musteri]), "Son", [Son Sipariş], "Gun", [Sessiz Gün], "Ciro", CALCULATE([Net Satış], REMOVEFILTERS(Tarih)), "Seg", CALCULATE(MAX(Musteriler[Segment])), "Sehir", CALCULATE(MAX(Musteriler[Sehir]))), [Gun] >= 90 && [Gun] < 180), [Ciro], DESC)`));
console.log(ev('COUNTROWS(VALUES(Musteriler[Musteri]))'));
console.log(run(`EVALUATE
TOPN(5, FILTER(ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "Ad", CALCULATE(MAX(Musteriler[Musteri])), "Son", [Son Sipariş], "Gun", [Sessiz Gün], "Ciro", CALCULATE([Net Satış], REMOVEFILTERS(Tarih)), "Seg", CALCULATE(MAX(Musteriler[Segment]))), [Gun] >= 90 && [Gun] < 180), [Ciro], DESC)`));
