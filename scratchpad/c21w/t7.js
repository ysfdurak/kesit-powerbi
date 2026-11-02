require('./h.js');
console.log(Q('EVALUATE CALCULATETABLE(SELECTCOLUMNS(Satislar, "S", Satislar[SiparisNo], "T", Satislar[Tarih], "D", Satislar[Durum], "Tu", Satislar[Tutar], "Te", Satislar[TeslimTarihi]), ISBLANK(Satislar[TeslimTarihi]), Satislar[Durum] = "Kargoda")'));
const Y=[{t:'Tarih',c:'Yil'}], M=[{t:'Tarih',c:'YilAy'}];
def('Açık Sipariş', `VAR Gun = MAX(Tarih[Tarih])
RETURN CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), REMOVEFILTERS(Tarih), Satislar[Tarih] <= Gun, Satislar[Durum] <> "İptal", FILTER(ALL(Satislar[TeslimTarihi]), ISBLANK(Satislar[TeslimTarihi]) || Satislar[TeslimTarihi] > Gun))`);
console.log(G(Y,['[Yoldaki Sipariş]','[Açık Sipariş]']).join('\n'));
console.log(G(M,['[Yoldaki Sipariş]','[Açık Sipariş]']).slice(-8).join('\n'));
