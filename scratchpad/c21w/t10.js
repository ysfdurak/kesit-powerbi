require('./h.js');
def('Hedef (Günlük)', `SUMX(
    VALUES(Tarih[YilAy]),
    VAR AyHedef = CALCULATE([Hedef], REMOVEFILTERS(Tarih), VALUES(Tarih[YilAy]))
    VAR AyGun = CALCULATE(COUNTROWS(Tarih), REMOVEFILTERS(Tarih), VALUES(Tarih[YilAy]))
    VAR GorunenGun = CALCULATE(COUNTROWS(Tarih))
    RETURN DIVIDE(AyHedef * GorunenGun, AyGun)
)`);
def('Hedef (Tam Ay)', `VAR Gorunen = COUNTROWS(Tarih)
VAR TamAy = CALCULATE(COUNTROWS(Tarih), REMOVEFILTERS(Tarih), VALUES(Tarih[YilAy]))
RETURN IF(Gorunen = TamAy, [Hedef])`);
const W=[{t:'Tarih',c:'HaftaNo'}];
const r=X.query({rows:W, measures:ms, values:['[Net Satış]','[Hedef]','[Hedef (Günlük)]','[Hedef (Tam Ay)]'], slicers:[{t:'Tarih',c:'Yil',values:[2024]}], totals:true});
r.rows.slice(0,10).forEach(x=>console.log(x.keys.join(),x.vals.join(' | '))); console.log(r.total);
console.log(G([{t:'Tarih',c:'Yil'}],['[Hedef]','[Hedef (Günlük)]','[Hedef (Tam Ay)]']).join('\n'));
console.log(G([{t:'Kategoriler',c:'Kategori'}],['[Hedef]','[Hedef (Günlük)]']).join('\n'));
// MTD: 2024-12 first 15 days
console.log(E('CALCULATE([Hedef], DATESBETWEEN(Tarih[Tarih], DATE(2024,12,1), DATE(2024,12,15)))'), E('CALCULATE([Hedef (Günlük)], DATESBETWEEN(Tarih[Tarih], DATE(2024,12,1), DATE(2024,12,15)))'), E('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024,12,1), DATE(2024,12,15)))'), E('CALCULATE([Hedef], Tarih[YilAy]="2024-12")'));
console.log(E('CALCULATE([Hedef], DATESBETWEEN(Tarih[Tarih], DATE(2024,12,2), DATE(2024,12,31)))'), E('CALCULATE([Hedef (Günlük)], DATESBETWEEN(Tarih[Tarih], DATE(2024,12,2), DATE(2024,12,31)))'));
