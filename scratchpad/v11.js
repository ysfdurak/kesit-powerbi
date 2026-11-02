const {ev,q,run,def}=require('./h.js');
console.log(ev('COUNTROWS(FILTER(Satislar, Satislar[TemsilciNo] <> RELATED(Musteriler[TemsilciNo])))'), ev('COUNTROWS(Satislar)'));
def('Son Sipariş (Tarihe Kadar)','VAR Gun = MAX(Tarih[Tarih])\nRETURN CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), Satislar[Tarih] <= Gun, Satislar[Durum] <> "İptal")');
def('Kayıp (Tarihe Göre)','VAR Gun = MAX(Tarih[Tarih])\nVAR Musteriler180 = FILTER(CALCULATETABLE(VALUES(Satislar[MusteriNo]), REMOVEFILTERS(Tarih), Satislar[Tarih] <= Gun, Satislar[Durum] <> "İptal"), Gun - [Son Sipariş (Tarihe Kadar)] >= 180)\nRETURN COUNTROWS(Musteriler180)');
console.log(q('[Kayıp (Tarihe Göre)]',{t:'Tarih',c:'Yil'}), q('[Kayıp (Tarihe Göre)]',{t:'Tarih',c:'YilCeyrek'}));
console.log(q('[Kayıp (Tarihe Göre)]',{t:'Musteriler',c:'Segment'}));
