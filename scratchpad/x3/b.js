require('./h.js');
def('Aktif Müşteri (90 Gün)', `COUNTROWS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -90, DAY), Satislar[Durum] <> "İptal"))`);
console.log('tot', E('[Aktif Müşteri (90 Gün)]'));
console.log(G([{t:'Tarih',c:'Yil'}], ['[Aktif Müşteri (90 Gün)]','[Müşteri Sayısı]']));
console.log(G([{t:'Tarih',c:'YilCeyrek'}], ['[Aktif Müşteri (90 Gün)]','[Müşteri Sayısı]']));
console.log(G([{t:'Kategoriler',c:'Kategori'}], ['[Aktif Müşteri (90 Gün)]','[Müşteri Sayısı]']));
// TODAY anti
console.log('today', E(`COUNTROWS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), DATESINPERIOD(Tarih[Tarih], TODAY(), -90, DAY), Satislar[Durum] <> "İptal"))`));
// last purchase gap distribution
const r = Q(`EVALUATE
VAR T = ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"),
  "Ilk", CALCULATE(MIN(Satislar[Tarih]), Satislar[Durum] <> "İptal"),
  "Son", CALCULATE(MAX(Satislar[Tarih]), Satislar[Durum] <> "İptal"),
  "N", CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), Satislar[Durum] <> "İptal"))
VAR T2 = ADDCOLUMNS(FILTER(T, [N] > 1), "Ara", DIVIDE(DATEDIFF([Ilk], [Son], DAY), [N] - 1))
RETURN ROW("musteri", COUNTROWS(T), "tekrar", COUNTROWS(T2), "medyan", MEDIANX(T2, [Ara]), "p80", PERCENTILEX.INC(T2, [Ara], 0.8), "p90", PERCENTILEX.INC(T2, [Ara], 0.9), "ort", AVERAGEX(T2,[Ara]))`);
console.log(r);
// recency at end of 2024
console.log(Q(`EVALUATE
VAR T = ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), "R", DATEDIFF(CALCULATE(MAX(Satislar[Tarih]), Satislar[Durum] <> "İptal"), DATE(2024,12,31), DAY))
RETURN ROW("r90", COUNTROWS(FILTER(T,[R]<=90)), "r180", COUNTROWS(FILTER(T,[R]<=180)), "r365", COUNTROWS(FILTER(T,[R]<=365)), "gt180", COUNTROWS(FILTER(T,[R]>180)), "gt120", COUNTROWS(FILTER(T,[R]>120)))`));
