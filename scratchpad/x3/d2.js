require('./h.js');
def('Olgun Kohort Tutma %', `VAR Ay = SELECTEDVALUE(Satislar[KohortAyFarki])
VAR SonTarih = CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS())
VAR Olgun = FILTER(VALUES(Musteriler[KohortAy]), VAR Ilk = CALCULATE(MIN(Musteriler[IlkSiparis])) RETURN NOT ISBLANK(Ilk) && DATEDIFF(Ilk, SonTarih, MONTH) >= Ay)
VAR Aktif = CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[Durum] <> "İptal", REMOVEFILTERS(Tarih), Olgun)
VAR Boyut = CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[KohortAyFarki] = 0, Satislar[Durum] <> "İptal", REMOVEFILTERS(Tarih), Olgun)
RETURN IF(Ay >= 0, DIVIDE(Aktif, Boyut))`);
console.log(G([{t:'Satislar',c:'KohortAyFarki'}], ['[Olgun Kohort Tutma %]','[Kohort Tutma %]']).filter(r=>r[0]>=0 && r[0]<=13));
console.log(G([{t:'Kategoriler',c:'Kategori'}], ['[Olgun Kohort Tutma %]','[Kohort Tutma %]']));
console.log(G([{t:'Tarih',c:'Yil'}], ['[Olgun Kohort Tutma %]','[Kohort Tutma %]']));
