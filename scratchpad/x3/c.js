require('./h.js');
def('Birikimli Müşteri Kârı', `VAR Son = MAX(Tarih[Tarih]) RETURN DIVIDE(CALCULATE([Brüt Kâr], REMOVEFILTERS(Tarih), Tarih[Tarih] <= Son), CALCULATE([Müşteri Sayısı], REMOVEFILTERS(Tarih), Tarih[Tarih] <= Son))`);
console.log(E('[Birikimli Müşteri Kârı]'), G([{t:'Tarih',c:'Yil'}], ['[Birikimli Müşteri Kârı]','[Brüt Kâr]','[Müşteri Başı Satış]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Birikimli Müşteri Kârı]']));
def('Yıllık Kayıp Oranı %', `VAR DonemBasi = MIN(Tarih[Tarih])
VAR Onceki = CALCULATETABLE(VALUES(Satislar[MusteriNo]), DATESINPERIOD(Tarih[Tarih], DonemBasi - 1, -12, MONTH), Satislar[Durum] <> "İptal")
VAR Simdi = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")
RETURN DIVIDE(COUNTROWS(EXCEPT(Onceki, Simdi)) + 0, COUNTROWS(Onceki))`);
def('Basit CLV', `VAR KarMusteri = DIVIDE([Brüt Kâr], [Müşteri Sayısı])
VAR Kayip = [Yıllık Kayıp Oranı %]
VAR Omur = MIN(5, DIVIDE(1, Kayip))
RETURN IF(Kayip > 0, KarMusteri * Omur)`);
console.log(G([{t:'Tarih',c:'Yil'}], ['[Yıllık Kayıp Oranı %]','[Basit CLV]', 'DIVIDE([Brüt Kâr], [Müşteri Sayısı])']));
console.log(G([{t:'Tarih',c:'YilCeyrek'}], ['[Yıllık Kayıp Oranı %]','[Basit CLV]']));
console.log(G([{t:'Musteriler',c:'Segment'}], ['[Brüt Kâr]','[Müşteri Sayısı]','DIVIDE([Brüt Kâr], [Müşteri Sayısı])'], [{t:'Tarih',c:'Yil',v:[2024]}]));
