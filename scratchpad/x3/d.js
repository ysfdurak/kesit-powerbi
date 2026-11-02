require('./h.js');
def('Kohort Büyüklüğü', `CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[KohortAyFarki] = 0, Satislar[Durum] <> "İptal", REMOVEFILTERS(Tarih))`);
console.log(E('[Kohort Büyüklüğü]'));
console.log(G([{t:'Musteriler',c:'KohortAy'}], ['[Kohort Büyüklüğü]']).map(r=>r.join(':')).join(' '));
console.log(G([{t:'Satislar',c:'KohortAyFarki'}], ['[Kohort Tutma %]', '[Kohort Büyüklüğü]', 'CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")']).slice(0,15));
// naive average vs right censored for month 6
def('Olgun Kohort Tutma %', `VAR Ay = SELECTEDVALUE(Satislar[KohortAyFarki])
VAR SonAy = CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS())
VAR Olgun = FILTER(VALUES(Musteriler[KohortAy]), DATEDIFF(DATEVALUE(Musteriler[KohortAy] & "-01"), SonAy, MONTH) >= Ay)
VAR Aktif = CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[Durum] <> "İptal", REMOVEFILTERS(Tarih), Olgun)
VAR Boyut = CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[KohortAyFarki] = 0, Satislar[Durum] <> "İptal", REMOVEFILTERS(Tarih), REMOVEFILTERS(Satislar[KohortAyFarki]), Olgun)
RETURN DIVIDE(Aktif, Boyut)`);
console.log(G([{t:'Satislar',c:'KohortAyFarki'}], ['[Olgun Kohort Tutma %]']).slice(0,15));
