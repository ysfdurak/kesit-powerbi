const {M, ev, q, rq} = require('./h.js');
const K = (e,k,qq) => ev(`CALCULATE(${e}, Tarih[YilCeyrek]="${qq}", Satislar[Kanal]="${k}")`);
const OT = 'CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal")', V='CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal")';
for (const k of ['Mağaza','Web','Mobil']) for (const qq of ['2024-Ç1','2024-Ç2']) console.log(k,qq, ['[Net Satış]','[Sipariş Sayısı]','[Ortalama Sepet]',`MAXX(${OT},${V})`,`MEDIANX(${OT},${V})`,'[Toplam Satış]','CALCULATE([Toplam Satış], Satislar[Durum]="İptal")','[İptal Oranı %]','CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]))'].map(m=>Math.round(K(m,k,qq)*100)/100).join(' | '));
// Q2 total gross and iptal
console.log('Ç2 hepsi', ev('CALCULATE([İptal Oranı %], Tarih[YilCeyrek]="2024-Ç2")'), 'Ç2 iptal tutar', ev('CALCULATE([Toplam Satış], Tarih[YilCeyrek]="2024-Ç2", Satislar[Durum]="İptal")'));
// what if Web iptal at Q1 rate
const g2=K('[Toplam Satış]','Web','2024-Ç2'); console.log('web gross q2', g2, 'web net if 10.75% rows... approx gross*(1-0.1075)', g2*(1-0.10752688));
console.log('mayıs web iptal sip', ev('CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), Tarih[YilAy]="2024-05", Satislar[Kanal]="Web", Satislar[Durum]="İptal")'), ev('CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), Tarih[YilAy]="2024-05", Satislar[Kanal]="Web")'));
console.log('Ç2 YoY', ev('CALCULATE([YoY %], Tarih[YilCeyrek]="2024-Ç2")'), ev('CALCULATE([Satış GY], Tarih[YilCeyrek]="2024-Ç2")'));
