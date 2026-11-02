const {M, ev, q, rq} = require('./h.js');
const H = e => `CALCULATE(${e}, Tarih[YilAy] = "2024-06")`;
console.log(q([H('[Net Satış]'),H('[Hedef]'),H('[Hedef Farkı]'),H('[Sipariş Sayısı]'),H('[İptal Oranı %]'), H('[Satış GY]')], {t:'Kategoriler',c:'Kategori'}));
console.log('haz kanal', q([H('[Net Satış]'),H('[Sipariş Sayısı]'),H('[İptal Oranı %]'),H('[Satış GY]')], {t:'Satislar',c:'Kanal'}));
console.log('Ç2 kanal', q(['CALCULATE([Net Satış], Tarih[YilCeyrek]="2024-Ç2")','CALCULATE([Net Satış], Tarih[YilCeyrek]="2024-Ç1")','CALCULATE([İptal Oranı %], Tarih[YilCeyrek]="2024-Ç2")','CALCULATE([İptal Oranı %], Tarih[YilCeyrek]="2024-Ç1")','CALCULATE([Sipariş Sayısı], Tarih[YilCeyrek]="2024-Ç2")','CALCULATE([Sipariş Sayısı], Tarih[YilCeyrek]="2024-Ç1")'], {t:'Satislar',c:'Kanal'}));
console.log('Ç2 durum', q(['CALCULATE([Toplam Satış], Tarih[YilCeyrek]="2024-Ç2")','CALCULATE(COUNTROWS(Satislar), Tarih[YilCeyrek]="2024-Ç2")','CALCULATE([Toplam Satış], Tarih[YilCeyrek]="2024-Ç1")'], {t:'Satislar',c:'Durum'}));
