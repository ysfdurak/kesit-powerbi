const {M, ev, q, rq} = require('./h.js');
const WQ = (e,qq) => `CALCULATE(${e}, Tarih[YilCeyrek]="${qq||'2024-Ç2'}", Satislar[Kanal]="Web")`;
console.log('web Ç2 by ay', q([WQ('[İptal Oranı %]'), WQ('COUNTROWS(Satislar)'), WQ('CALCULATE(COUNTROWS(Satislar), Satislar[Durum]="İptal")'), WQ('CALCULATE([Toplam Satış], Satislar[Durum]="İptal")'), WQ('[Net Satış]')], {t:'Tarih',c:'Ay'}).filter(s=>/Nis|May|Haz/.test(s)));
console.log('web Ç2 total', ['[İptal Oranı %]','COUNTROWS(Satislar)','CALCULATE(COUNTROWS(Satislar), Satislar[Durum]="İptal")','CALCULATE([Toplam Satış], Satislar[Durum]="İptal")','[Net Satış]','[Toplam Satış]'].map(m=>ev(WQ(m))));
console.log('web Ç1 total', ['[İptal Oranı %]','COUNTROWS(Satislar)','CALCULATE(COUNTROWS(Satislar), Satislar[Durum]="İptal")','CALCULATE([Toplam Satış], Satislar[Durum]="İptal")','[Net Satış]','[Toplam Satış]'].map(m=>ev(WQ(m,'2024-Ç1'))));
console.log('web Ç2 kat', q([WQ('[İptal Oranı %]'), WQ('COUNTROWS(Satislar)')], {t:'Kategoriler',c:'Kategori'}));
console.log('web Ç3', ev(WQ('[İptal Oranı %]','2024-Ç3')), ev(WQ('[İptal Oranı %]','2024-Ç4')), ev(WQ('[İptal Oranı %]','2023-Ç2')));
console.log('iptal by kanal yearly', q(['[İptal Oranı %]'], [{t:'Satislar',c:'Kanal'},{t:'Tarih',c:'YilCeyrek'}]).filter(s=>/2024/.test(s)));
console.log('kargo web q2', ev(WQ('[Ortalama Kargo Günü]')), ev(WQ('[Ortalama Kargo Günü]','2024-Ç1')));
