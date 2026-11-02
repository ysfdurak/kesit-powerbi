const {M, ev, q, rq} = require('./h.js');
const E = (e, qq) => `CALCULATE(${e}, Tarih[YilCeyrek] = "${qq}", Kategoriler[Kategori] = "Elektronik")`;
for (const qq of ['2024-Ç1','2024-Ç2','2024-Ç3']) console.log(qq, ['[Net Satış]','[Hedef]','[Sipariş Sayısı]','[Ortalama Sepet]','[İptal Oranı %]','[İade Oranı %]','[Satılan Adet]','[Ortalama Birim Fiyat]','[Ortalama İndirim %]'].map(m=>m+'='+Math.round(ev(E(m,qq))*1000)/1000).join(' '));
console.log(q([E('[Net Satış]','2024-Ç2'),E('[Hedef]','2024-Ç2'),E('[Sipariş Sayısı]','2024-Ç2')], {t:'Tarih',c:'Ay'}));
console.log(q([E('[Net Satış]','2024-Ç2'),E('[Satılan Adet]','2024-Ç2'),E('[Net Satış]','2024-Ç1'),E('[Satılan Adet]','2024-Ç1')], {t:'Urunler',c:'Urun'}));
console.log(q([E('[Net Satış]','2024-Ç2'),E('[Net Satış]','2024-Ç1'),E('[Sipariş Sayısı]','2024-Ç2'),E('[Sipariş Sayısı]','2024-Ç1')], {t:'Satislar',c:'Kanal'}));
console.log(q([E('[Net Satış]','2024-Ç2'),E('[Net Satış]','2024-Ç1')], {t:'Musteriler',c:'Segment'}));
console.log(q([E('[Net Satış]','2024-Ç2'),E('[Net Satış]','2024-Ç1')], {t:'Calisanlar',c:'AdSoyad'}));
