const {ev,q,run,def}=require('./h.js');
const E='Satislar[Kanal] IN {"Web", "Mobil"}';
console.log(ev(`CALCULATE([Ortalama Kargo Günü], ${E})`), ev(`CALCULATE([Zamanında Teslim %], ${E})`), ev(`CALCULATE([İade Oranı %], ${E})`), ev(`CALCULATE([Ortalama Sepet], ${E})`), ev(`CALCULATE([Net Satış], ${E})`), ev(`[Kanal Payı %]`));
for (const [a,b] of [[0,3],[4,6],[7,99]]) console.log(a,b, ev(`CALCULATE([İade Oranı %], ${E}, Satislar[KargoGun] >= ${a}, Satislar[KargoGun] <= ${b})`), ev(`CALCULATE(COUNTROWS(Satislar), ${E}, Satislar[KargoGun] >= ${a}, Satislar[KargoGun] <= ${b})`));
console.log(ev(`CALCULATE([İade Oranı %], ${E}, ISBLANK(Satislar[KargoGun]))`));
console.log(q(['[Ortalama Kargo Günü]','[Zamanında Teslim %]','[Kanal Payı %]'],[{t:'Satislar',c:'Kanal'},{t:'Tarih',c:'Yil'}]));
// repeat after first order by first-order shipping
def('İlk Sipariş Tarihi','CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS(Tarih), Satislar[Durum] <> "İptal")');
console.log(run(`EVALUATE
VAR T = ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"),
  "Ilk", [İlk Sipariş Tarihi])
VAR T2 = ADDCOLUMNS(T, "IlkKargo", VAR d = [Ilk] RETURN CALCULATE(MAX(Satislar[KargoGun]), Satislar[Tarih] = d, Satislar[Durum] <> "İptal"),
  "IlkKanal", VAR d = [Ilk] RETURN CALCULATE(MAX(Satislar[Kanal]), Satislar[Tarih] = d, Satislar[Durum] <> "İptal"),
  "Sonra", VAR d = [Ilk] RETURN CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), Satislar[Tarih] > d, Satislar[Durum] <> "İptal"))
VAR W = FILTER(T2, [IlkKanal] <> "Mağaza" && NOT ISBLANK([IlkKargo]) && [Ilk] <= DATE(2024, 6, 30))
RETURN ROW("hizli", COUNTROWS(FILTER(W, [IlkKargo] <= 3)), "hizliTekrar", COUNTROWS(FILTER(W, [IlkKargo] <= 3 && [Sonra] > 0)),
 "yavas", COUNTROWS(FILTER(W, [IlkKargo] > 3)), "yavasTekrar", COUNTROWS(FILTER(W, [IlkKargo] > 3 && [Sonra] > 0)), "tum", COUNTROWS(T2))`));
