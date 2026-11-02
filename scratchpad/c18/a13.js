const {M, ev, q, rq} = require('./h.js');
const T = [
 'MEDIANX(CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal"), CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal"))',
 'VAR Bu = [Kâr Marjı %] VAR Once = CALCULATE([Kâr Marjı %], SAMEPERIODLASTYEAR(Tarih[Tarih])) RETURN IF(NOT ISBLANK(Once), (Bu - Once) * 100)',
 'DIVIDE(CALCULATE(COUNTROWS(Satislar), Satislar[Durum] = "İade", Musteriler[Segment] = "Kurumsal"), CALCULATE(COUNTROWS(Satislar), Musteriler[Segment] = "Kurumsal"))',
 'VAR Fark = [Net Satış] - [Hedef] VAR Oran = DIVIDE([Net Satış], [Hedef]) VAR Durum = SWITCH(TRUE(), Oran >= 1, "Yeşil", Oran >= 0.95, "Sarı", "Kırmızı") RETURN IF(ISBLANK([Hedef]), BLANK(), Durum & " (" & FORMAT(Fark, "+#,0;-#,0") & " ₺)")',
 'CONCATENATE("Net satış " & FORMAT([Net Satış], "#,0") & " ₺", "; hedefin %" & FORMAT([Hedef Gerçekleşme %] * 100, "0.0") & "’i.")',
 'CALCULATE([İptal Oranı %], Satislar[Kanal] = "Web")',
 'VAR Son = MAX(Satislar[Tarih]) VAR ModelSon = CALCULATE(MAX(Satislar[Tarih]), ALL(Satislar)) RETURN IF(NOT ISBLANK(Son), DATEDIFF(Son, ModelSon, DAY))',
 'DIVIDE(CALCULATE(COUNTROWS(Satislar), ISBLANK(Satislar[KargoGun]), Satislar[Durum] <> "İptal"), CALCULATE(COUNTROWS(Satislar), Satislar[Durum] <> "İptal"))',
];
T.forEach(e => { console.log('TOT', ev(e)); console.log(q(e,{t:'Kategoriler',c:'Kategori'}).join(' | ')); console.log(q(e,{t:'Tarih',c:'Yil'}).join(' | ')); });
console.log(ev('CALCULATE(' + T[3].replace(/^VAR/,'VAR') + ', Tarih[YilCeyrek]="2024-Ç2")'));
