require('./h.js');
const p=(...x)=>console.log(JSON.stringify(x));
const q=(rows,vals,sl)=>{const r=X.query({rows,measures:ms,values:vals,slicers:sl||[],totals:true});return {rows:r.rows.map(x=>[x.keys.join('/'),...x.vals.map(v=>v==null?null:Math.round(v*100)/100)]),total:r.total}};
const off='CALCULATE([Net Satış], OFFSET(-1, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC)))';
const offAll='CALCULATE([Net Satış], OFFSET(-1, ALL(Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC)))';
let r=q([{t:'Tarih',c:'YilAy'}],['[Net Satış]',off,offAll],[{t:'Tarih',c:'Yil',values:[2024]}]); p(r.rows.slice(0,2), r.total);
r=q([{t:'Tarih',c:'YilAy'}],['[Net Satış]',off,'AVERAGEX(WINDOW(-2, REL, 0, REL, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy])), [Net Satış])','DIVIDE(SUMX(WINDOW(-2, REL, 0, REL, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy])), [Net Satış]), 3)','SUMX(WINDOW(1, ABS, 0, REL, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy])), [Net Satış])','[Kümülatif Satış]']); p(r.rows.slice(0,4), r.total);
// total row behavior
p('tot', M(off), M('CALCULATE([Net Satış], INDEX(-1, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy])))'), M('CALCULATE([Net Satış], INDEX(1, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy])))'));
// row context in ADDCOLUMNS
p(Q('EVALUATE ADDCOLUMNS(CALCULATETABLE(VALUES(Tarih[YilAy]), Tarih[Yil] = 2024), "S", [Net Satış], "Önceki", CALCULATE([Net Satış], OFFSET(-1, ALL(Tarih[YilAy]), ORDERBY(Tarih[YilAy]))))',3));
// partition with YilAy only grid
const yp='CALCULATE([Net Satış], OFFSET(-1, ALLSELECTED(Tarih[Yil], Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC), PARTITIONBY(Tarih[Yil])))';
r=q([{t:'Tarih',c:'YilAy'}],['[Net Satış]',yp]); p(r.rows.slice(6,9), r.total);
r=q([{t:'Tarih',c:'Yil'}],[yp]); p(r.rows, r.total);
r=q([{t:'Kategoriler',c:'Kategori'}],[yp]); p(r.rows.slice(0,2), r.total);
// best month per year INDEX
const best='CALCULATE([Net Satış], INDEX(1, ALLSELECTED(Tarih[Yil], Tarih[YilAy]), ORDERBY([Net Satış], DESC), PARTITIONBY(Tarih[Yil])))';
r=q([{t:'Tarih',c:'YilAy'}],[best]); p(r.rows.slice(0,3),r.rows.slice(7,9), r.total);
r=q([{t:'Tarih',c:'Yil'}],[best]); p(r.rows, r.total);
r=q([{t:'Kategoriler',c:'Kategori'}],[best]); p(r.rows.slice(0,2), r.total);
// rank channel within ... 
const rk='RANK(ALLSELECTED(Urunler[Kategori], Urunler[Urun]), ORDERBY([Net Satış], DESC), PARTITIONBY(Urunler[Kategori]))';
r=q([{t:'Urunler',c:'Urun'}],[rk]); p(r.rows.slice(0,3), r.total);
