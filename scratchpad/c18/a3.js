const {M, ev, q, rq} = require('./h.js');
console.log(q(['[Net Satış]','[Hedef]','[Hedef Gerçekleşme %]','[YoY %]'], {t:'Tarih',c:'Yil'}));
console.log(q(['[Net Satış]','[Hedef]','[Hedef Gerçekleşme %]','[YoY %]'], {t:'Tarih',c:'YilCeyrek'}));
const f24=[{t:'Tarih',c:'Yil',v:[2024]}];
console.log(M.tables.Hedefler.rows.slice(0,3));
