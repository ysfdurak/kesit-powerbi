require('./h.js');
const p=(...x)=>console.log(JSON.stringify(x));
const q=(rows,vals,sl)=>{const r=X.query({rows,measures:ms,values:vals,slicers:sl||[],totals:true});return {rows:r.rows.map(x=>[x.keys.join('/'),...x.vals.map(v=>v==null?null:Math.round(v*100)/100)]),total:r.total}};
p(Q('EVALUATE ADDCOLUMNS(CALCULATETABLE(VALUES(Calisanlar[CalisanNo]), Calisanlar[Seviye] = 2), "Ekip", VAR K = Calisanlar[CalisanNo] RETURN CALCULATE([Net Satış], FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], K))))'));
const dir='VAR Kisi = SELECTEDVALUE(Calisanlar[CalisanNo]) RETURN IF(NOT ISBLANK(Kisi), CALCULATE([Net Satış], REMOVEFILTERS(Calisanlar), Calisanlar[YoneticiNo] = Kisi))';
p(q([{t:'Calisanlar',c:'AdSoyad'}],['[Net Satış]','[Ekip Satışı]',dir]).rows.filter(r=>r[1]||r[2]||r[3]));
p(q([{t:'Calisanlar',c:'Seviye'}],['[Net Satış]','[Çalışan Sayısı]']));
p(q([{t:'Calisanlar',c:'Unvan'}],['[Net Satış]']).rows);
p(M('MAXX(Calisanlar, PATHLENGTH(Calisanlar[Yol]))'), M('CONCATENATEX(Calisanlar, PATHITEMREVERSE(Calisanlar[Yol], 2, INTEGER), ",")'));
p(Q('EVALUATE ADDCOLUMNS(Calisanlar, "S2", PATHITEM(Calisanlar[Yol], 2, INTEGER), "S2Ad", LOOKUPVALUE(Calisanlar[AdSoyad], Calisanlar[CalisanNo], PATHITEM(Calisanlar[Yol], 2, INTEGER)), "Y", PATH(Calisanlar[CalisanNo], Calisanlar[YoneticiNo]))',3));
// seller share within manager team
p(q([{t:'Calisanlar',c:'AdSoyad'}],['DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Calisanlar), Calisanlar[YoneticiNo] = 2))']).rows.filter(r=>r[1]));
// isinscope
p(q([{t:'Calisanlar',c:'AdSoyad'}],['IF(ISINSCOPE(Calisanlar[AdSoyad]), [Net Satış], [Net Satış]/2)']).total);
// dept sales via employees
p(q([{t:'Departmanlar',c:'Departman'}],['[Net Satış]','[Toplam Maaş]']).rows);
