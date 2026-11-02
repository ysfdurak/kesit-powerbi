require('./h.js');
def('Lider Ürün', `VAR Satanlar = FILTER(VALUES(Urunler[Urun]), NOT ISBLANK([Net Satış])) VAR Lider = TOPN(1, Satanlar, [Net Satış], DESC) RETURN CONCATENATEX(Lider, Urunler[Urun], ", ")`);
const r=G([{t:'Tarih',c:'YilAy'}], ['[Lider Ürün]']); console.log(r.slice(0,8));
console.log(Q(`EVALUATE ROW("n", COUNTROWS(FILTER(VALUES(Tarih[YilAy]), CALCULATE(ISBLANK([Net Satış])))))`));
