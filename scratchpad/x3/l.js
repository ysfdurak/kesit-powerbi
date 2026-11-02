require('./h.js');
def('Yıllık Kayıp Oranı (Korumalı) %', `VAR Gun = COUNTROWS(Tarih)
VAR DonemBasi = MIN(Tarih[Tarih])
VAR Onceki = CALCULATETABLE(VALUES(Satislar[MusteriNo]), DATESINPERIOD(Tarih[Tarih], DonemBasi - 1, -12, MONTH), Satislar[Durum] <> "İptal")
VAR Simdi = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")
RETURN IF(Gun >= 365, DIVIDE(COUNTROWS(EXCEPT(Onceki, Simdi)) + 0, COUNTROWS(Onceki)))`);
console.log(G([{t:'Tarih',c:'Yil'}], ['[Yıllık Kayıp Oranı (Korumalı) %]']), G([{t:'Tarih',c:'YilCeyrek'}], ['[Yıllık Kayıp Oranı (Korumalı) %]']).slice(-2), E('[Yıllık Kayıp Oranı (Korumalı) %]'));
