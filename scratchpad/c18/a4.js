const {M, ev, q, rq} = require('./h.js');
const W = e => `CALCULATE(${e}, Tarih[YilCeyrek] = "2024-Ç2")`;
console.log(q([W('[Net Satış]'),W('[Hedef]'),W('[Hedef Farkı]'),W('[Hedef Gerçekleşme %]'),W('[Satış GY]'),W('[Sipariş Sayısı]'), W('[Ortalama Sepet]')], {t:'Kategoriler',c:'Kategori'}));
console.log(q([W('[Net Satış]'),W('[Hedef]'),W('[Hedef Farkı]'),W('[Hedef Gerçekleşme %]'), W('[Sipariş Sayısı]')], {t:'Tarih',c:'Ay'}).filter(s=>!/= ;/.test(s)));
for (const k of ['Elektronik','Ev & Yaşam','Giyim','Spor']) {
 const WK = e => `CALCULATE(${e}, Tarih[YilCeyrek] = "2024-Ç2", Kategoriler[Kategori] = "${k}")`;
 console.log(k, q([WK('[Net Satış]'),WK('[Hedef]'),WK('[Hedef Farkı]'), WK('[Sipariş Sayısı]'), WK('[Ortalama Sepet]'), WK('[Satış GY]')], {t:'Tarih',c:'Ay'}).filter(s=>/Nisan|Mayıs|Haziran/.test(s)));
 console.log(k, q([WK('[Net Satış]'), WK('[Sipariş Sayısı]'), WK('[Satış GY]'), WK('[İptal Oranı %]')], {t:'Satislar',c:'Kanal'}));
}
console.log('Ç2 ortalama sepet', ev(W('[Ortalama Sepet]')), ev('CALCULATE([Ortalama Sepet], Tarih[YilCeyrek] = "2024-Ç1")'), ev(W('[Sipariş Sayısı]')), ev('CALCULATE([Sipariş Sayısı], Tarih[YilCeyrek] = "2024-Ç1")'));
console.log('Ç2 iptal', ev(W('[İptal Oranı %]')), ev(W('[İade Oranı %]')),'Ç1', ev('CALCULATE([İptal Oranı %], Tarih[YilCeyrek] = "2024-Ç1")'));
