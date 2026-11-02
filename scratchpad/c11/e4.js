const { M, ev, q, rq } = require('./h.js');
const cor = (x,y,lvl) => `VAR T = ADDCOLUMNS(${lvl}, "X", ${x}, "Y", ${y}) VAR T2 = FILTER(T, NOT ISBLANK([X]) && NOT ISBLANK([Y])) VAR MX = AVERAGEX(T2,[X]) VAR MY = AVERAGEX(T2,[Y]) RETURN DIVIDE(SUMX(T2, ([X]-MX)*([Y]-MY)), SQRT(SUMX(T2, ([X]-MX)^2)) * SQRT(SUMX(T2, ([Y]-MY)^2)))`;
const c1 = cor('CALCULATE(AVERAGE(Urunler[Fiyat]))','[Satılan Adet]','VALUES(Urunler[Urun])'); console.log('fiyat-adet', ev(c1), q(c1,{t:'Kategoriler',c:'Kategori'}), q(c1,{t:'Tarih',c:'Yil'}));
const c1b = cor('CALCULATE(AVERAGE(Urunler[Fiyat]))','[Satılan Adet]','VALUES(Urunler[UrunNo])'); console.log('fiyat-adet urunno', ev(c1b));
const c1c = cor('[Ortalama Birim Fiyat]','[Satılan Adet]','VALUES(Urunler[Urun])'); console.log('obf-adet', ev(c1c), q(c1c,{t:'Kategoriler',c:'Kategori'}));
const ln = cor('LN(CALCULATE(AVERAGE(Urunler[Fiyat])))','[Satılan Adet]','VALUES(Urunler[Urun])'); console.log('lnfiyat-adet', ev(ln));
// product list price & adet
console.log(rq('EVALUATE ADDCOLUMNS(VALUES(Urunler[Urun]), "F", CALCULATE(AVERAGE(Urunler[Fiyat])), "A", [Satılan Adet])').map(r=>r.join(':')).join(' | '));
const c4 = cor('[Ortalama Kargo Günü]','[İade Oranı %]','VALUES(Urunler[Urun])'); console.log('kargo-iade', ev(c4));
