require('./e.js');
for (const m of ['[Satılan Adet]','[Sipariş Sayısı]','[Müşteri Sayısı]']) {
const r=q('EVALUATE ADDCOLUMNS(VALUES(Urunler[Urun]), "A", '+m+', "Skip", RANKX(ALL(Urunler[Urun]), '+m+'), "Dense", RANKX(ALL(Urunler[Urun]), '+m+', , DESC, DENSE))');
r.sort((a,b)=>a[2]-b[2]); const ties=r.filter((x,i)=>r.some((y,j)=>j!==i&&y[1]===x[1])); p(m, ties.slice(0,10)); }
const r=q('EVALUATE ADDCOLUMNS(VALUES(Urunler[Urun]), "S", [Net Satış], "R", RANKX(ALL(Urunler[Urun]), [Net Satış]))'); r.sort((a,b)=>a[2]-b[2]); p(r.slice(-4));
