const s='COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), [Sipariş Sayısı] >= 5))';
console.log(ev(s), q(s,{t:'Kategoriler',c:'Kategori'}), q(s,{t:'Tarih',c:'Yil'}));
console.log(ev('CALCULATE([Net Satış], Satislar[Kanal]="Mağaza")'), q('CALCULATE([Net Satış], Satislar[Kanal]="Mağaza")',{t:'Tarih',c:'Yil'}));
console.log(at('CALCULATE([Net Satış], Satislar[Kanal] IN {"Web","Mobil"})','2024-12'), at('CALCULATE([Net Satış], Satislar[Kanal] IN {"Web","Mobil"})','2024-11'));
const g='VAR Bu = [Net Satış] VAR Onceki = CALCULATE([Net Satış], PREVIOUSMONTH(Tarih[Tarih])) RETURN DIVIDE(Bu - Onceki, Onceki)';
console.log(q(g,{t:'Tarih',c:'YilAy'}).slice(-3), ev(g), q(g,{t:'Kategoriler',c:'Kategori'}));
console.log(at('FORMAT([MoM %], "+0.0%;-0.0%")','2024-12'));
console.log(ev('[Kâr Marjı %]'), ev('CALCULATE([Kâr Marjı %], Tarih[Yil]=2024)'));
