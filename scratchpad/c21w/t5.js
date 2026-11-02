require('./h.js');
const K=[{t:'Kategoriler',c:'Kategori'}];
console.log('top3', E('CALCULATE([Net Satış], TOPN(3, VALUES(Urunler[Urun]), [Net Satış]))'));
console.log('top3 sel', E('CALCULATE([Net Satış], SELECTCOLUMNS(TOPN(3, VALUES(Urunler[Urun]), [Net Satış]), "U", Urunler[Urun]))'));
console.log('top3 lost', E('CALCULATE([Net Satış], SELECTCOLUMNS(TOPN(3, VALUES(Urunler[Urun]), [Net Satış]), "U", Urunler[Urun] & ""))'));
console.log('top3 treat', E('CALCULATE([Net Satış], TREATAS(SELECTCOLUMNS(TOPN(3, VALUES(Urunler[Urun]), [Net Satış]), "U", Urunler[Urun] & ""), Urunler[Urun]))'));
console.log(Q('EVALUATE TOPN(3, ADDCOLUMNS(VALUES(Urunler[Urun]), "S", [Net Satış]), [S])'));
console.log(G(K,['CALCULATE([Net Satış], TOPN(3, ALL(Urunler[Urun]), [Net Satış]))','CALCULATE([Net Satış], KEEPFILTERS(TOPN(3, ALL(Urunler[Urun]), [Net Satış])))']).join('\n'));
console.log(Q('EVALUATE DATATABLE("ProjeNo", INTEGER, "DepartmanNo", INTEGER, "Pay", DOUBLE, {{7, 3, 0.6}, {7, 4, 0.4}})'));
