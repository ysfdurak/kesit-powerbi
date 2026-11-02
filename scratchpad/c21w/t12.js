require('./h.js');
def('Hedef (Günlük)', `SUMX(
    VALUES(Tarih[YilAy]),
    VAR Ay = Tarih[YilAy]
    VAR AyHedef = CALCULATE([Hedef], REMOVEFILTERS(Tarih), Tarih[YilAy] = Ay)
    VAR AyGun = CALCULATE(COUNTROWS(Tarih), REMOVEFILTERS(Tarih), Tarih[YilAy] = Ay)
    VAR GorunenGun = CALCULATE(COUNTROWS(Tarih))
    RETURN DIVIDE(AyHedef * GorunenGun, AyGun)
)`);
def('Hedef (Günlük Hatalı)', `SUMX(
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
const r=X.query({rows:W, measures:ms, values:['[Net Satış]','[Hedef]','[Hedef (Günlük)]','[Hedef (Günlük Hatalı)]','[Hedef (Tam Ay)]'], slicers:[{t:'Tarih',c:'Yil',values:[2024]}], totals:true});
r.rows.slice(0,6).concat(r.rows.slice(-2)).forEach(x=>console.log(x.keys.join(),x.vals.join(' | '))); console.log(r.total);
console.log(G([{t:'Tarih',c:'Yil'}],['[Hedef]','[Hedef (Günlük)]','[Hedef (Günlük Hatalı)]']).join('\n'));
const r2=X.query({rows:[{t:'Tarih',c:'YilAy'}], measures:ms, values:['[Hedef]','[Hedef (Tam Ay)]','[Hedef (Günlük)]'], slicers:[{t:'Tarih',c:'Yil',values:[2024]}], totals:true}); console.log(r2.rows.slice(0,2).map(x=>x.keys+' '+x.vals), r2.total);
console.log(E('CALCULATE([Hedef (Günlük)], DATESBETWEEN(Tarih[Tarih], DATE(2024,12,1), DATE(2024,12,15)))'),E('CALCULATE([Hedef (Günlük Hatalı)], DATESBETWEEN(Tarih[Tarih], DATE(2024,12,1), DATE(2024,12,15)))'));
// gider
def('Bütçe (Günlük)', `SUMX(VALUES(Tarih[YilAy]), VAR Ay = Tarih[YilAy] VAR AyB = CALCULATE([Gider Bütçe], REMOVEFILTERS(Tarih), Tarih[YilAy] = Ay) VAR AyGun = CALCULATE(COUNTROWS(Tarih), REMOVEFILTERS(Tarih), Tarih[YilAy] = Ay) RETURN DIVIDE(AyB * CALCULATE(COUNTROWS(Tarih)), AyGun))`);
console.log(G([{t:'GiderTurleri',c:'GiderTuru'}],['[Gider Bütçe]','[Bütçe (Günlük)]']).join('\n'));
