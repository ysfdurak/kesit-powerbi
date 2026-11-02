const { M, ms, ev, q, rq } = require('./h.js');
console.log(rq(`EVALUATE
VAR Kalemler = SELECTCOLUMNS({ (1, "Brüt satış"), (2, "İndirimler"), (3, "Satış (indirim sonrası)"), (4, "İadeler"), (5, "Net satış"), (6, "Satılan malın maliyeti"), (7, "Brüt kâr") }, "Sira", [Value1], "Kalem", [Value2])
VAR IadeMaliyet = CALCULATE([Toplam Maliyet], Satislar[Durum] = "İade")
RETURN ADDCOLUMNS(Kalemler, "Tutar", SWITCH([Sira],
  1, CALCULATE([Brüt Tutar], Satislar[Durum] <> "İptal"),
  2, -[İndirim Tutarı],
  3, [Net Satış],
  4, -[İade Tutarı],
  5, [Net Satış] - [İade Tutarı],
  6, -([Net Maliyet] - IadeMaliyet),
  7, [Net Satış] - [İade Tutarı] - ([Net Maliyet] - IadeMaliyet)))`));
console.log(rq(`EVALUATE ADDCOLUMNS(GENERATESERIES(0, 2000, 250), "Satır", VAR Alt = [Value] RETURN COUNTROWS(FILTER(Satislar, Satislar[Tutar] >= Alt && Satislar[Tutar] < Alt + 250)))`));
console.log(rq(`EVALUATE ADDCOLUMNS(GENERATESERIES(0, 2000, 250), "Satır", COUNTROWS(FILTER(Satislar, Satislar[Tutar] >= [Value] && Satislar[Tutar] < [Value] + 250)))`).slice(0,3));
console.log('hs', ev('COUNTROWS(FILTER(Satislar, WEEKDAY(Satislar[Tarih], 2) > 5))'), ev('CALCULATE(COUNTROWS(Satislar), WEEKDAY(Satislar[Tarih], 2) > 5)'), q('COUNTROWS(FILTER(Satislar, WEEKDAY(Satislar[Tarih], 2) > 5))',{t:'Tarih',c:'Yil'}));
console.log('min2', ev('MIN(3, 5)'), ev('MAXX(Satislar, MIN(Satislar[Tutar], 1000))'));
const U='VAR Q1 = PERCENTILE.INC(Satislar[Tutar], 0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar], 0.75) VAR Ust = Q3 + 1.5 * (Q3 - Q1) RETURN ';
console.log('winsor', ev(U+'AVERAGEX(Satislar, IF(Satislar[Tutar] > Ust, Ust, Satislar[Tutar]))'), ev('AVERAGE(Satislar[Tutar])'), ev(U+'AVERAGEX(FILTER(Satislar, Satislar[Tutar] <= Ust), Satislar[Tutar])'), q(U+'AVERAGEX(Satislar, IF(Satislar[Tutar] > Ust, Ust, Satislar[Tutar]))',{t:'Kategoriler',c:'Kategori'}));
console.log('eksik pay', ev('DIVIDE(COUNTBLANK(Satislar[KargoGun]), COUNTROWS(Satislar))'), ev('CALCULATE(COUNTBLANK(Satislar[KargoGun]), Satislar[Durum] <> "İptal")'));
console.log('cmgr dec', ev('POWER(DIVIDE(CALCULATE([Net Satış], Tarih[YilAy] = "2024-12"), CALCULATE([Net Satış], Tarih[YilAy] = "2023-12")), 1/12) - 1'));
console.log('12ay', ev('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024,1,1), DATE(2024,12,31)))'));
const f3 = 'VAR Son = MAX(Tarih[Tarih]) RETURN DIVIDE(CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], EOMONTH(Son, -4) + 1, EOMONTH(Son, -1))), 3)';
console.log('f3', q(f3,{t:'Tarih',c:'YilAy'}).slice(-4), q(f3,{t:'Tarih',c:'Yil'}), q(f3,{t:'Kategoriler',c:'Kategori'}), ev(f3));
const gb = 'DIVIDE([Net Satış], COUNTROWS(FILTER(Tarih, Tarih[Tarih] >= DATE(2022, 6, 22))))';
console.log('gb kat', q(gb,{t:'Kategoriler',c:'Kategori'}));
const gb2 = 'VAR Ilk = CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS()) RETURN DIVIDE([Net Satış], COUNTROWS(FILTER(Tarih, Tarih[Tarih] >= Ilk)))';
console.log('gb2', q(gb2,{t:'Tarih',c:'HaftaninGunu'}).slice(0,3), q(gb2,{t:'Kategoriler',c:'Kategori'}).slice(0,2));
const cagr = 'VAR Bas = CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2022, 7, 1), DATE(2022, 12, 31))) VAR Son = CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024, 7, 1), DATE(2024, 12, 31))) RETURN POWER(DIVIDE(Son, Bas), 1 / 2) - 1';
console.log('cagr', ev(cagr), q(cagr,{t:'Kategoriler',c:'Kategori'}), q(cagr,{t:'Tarih',c:'Yil'}));
console.log('h2', ev('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2022, 7, 1), DATE(2022, 12, 31)))'), ev('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024, 7, 1), DATE(2024, 12, 31)))'));
console.log('run median', q('VAR Seri = FILTER(ADDCOLUMNS(ALLSELECTED(Tarih[YilAy]), "S", [Net Satış]), NOT ISBLANK([S])) RETURN MEDIANX(Seri, [S])',{t:'Tarih',c:'YilAy'}).slice(-2));
console.log('ly growth', q('VAR GY = CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, YEAR)) VAR B = DIVIDE(CALCULATE([Net Satış], Tarih[Yil] = 2024), CALCULATE([Net Satış], Tarih[Yil] = 2023)) - 1 RETURN GY * (1 + B)',{t:'Tarih',c:'Ay'}).slice(0,3));
console.log('marj sap', q('[Kâr Marjı %] - 0.35',{t:'Kategoriler',c:'Kategori'}), q('[Kâr Marjı %] - 0.35',{t:'Tarih',c:'Yil'}));
console.log('butce', ev('DIVIDE([Net Satış] - [Hedef], [Hedef])'), q('DIVIDE([Net Satış] - [Hedef], [Hedef])',{t:'Tarih',c:'Yil'}));
console.log('iade sonrası', q('[Net Satış] - [İade Tutarı]',{t:'Tarih',c:'Yil'}));
console.log('iade oran tutar', q('DIVIDE([İade Tutarı], [Net Satış])',{t:'Kategoriler',c:'Kategori'}));
console.log('combine', rq('EVALUATE TOPN(3, ADDCOLUMNS(Satislar, "Anahtar", COMBINEVALUES("|", Satislar[SiparisNo], Satislar[UrunNo])), Satislar[SatirNo], ASC)').map(r=>r[r.length-1]));
console.log('ay kolon', rq('EVALUATE TOPN(3, ADDCOLUMNS(Satislar, "SipAy", FORMAT(Satislar[Tarih], "yyyy-MM"), "AyAdi", FORMAT(Satislar[Tarih], "MMMM")), Satislar[SatirNo], ASC)').map(r=>r.slice(-2)));
console.log('eom', ev('EOMONTH(DATE(2024,1,31), 1)'), ev('DATEDIFF(DATE(2024,1,31), DATE(2024,3,1), MONTH)'), ev('DATEDIFF(DATE(2024,3,30), DATE(2024,4,2), DAY)'));
console.log('search kat', ev('COUNTROWS(FILTER(Urunler, SEARCH("set", Urunler[Urun], 1, 0) > 0))'), rq('EVALUATE FILTER(VALUES(Urunler[Urun]), SEARCH("set", Urunler[Urun], 1, 0) > 0)'));
console.log('sub', ev('SUBSTITUTE("27\\" Monitör", "\\"", " inç")'), ev('VALUE(SUBSTITUTE("1.250,50", ".", ""))'));
