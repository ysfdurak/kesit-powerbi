require('./h.js');
const p=(...x)=>console.log(JSON.stringify(x));
const q=(rows,vals,sl)=>{const r=X.query({rows,measures:ms,values:vals,slicers:sl||[],totals:true});return {rows:r.rows.map(x=>[x.keys.join('/'),...x.vals.map(v=>v==null?null:Math.round(v*100)/100)]),total:r.total}};
let r=q([{t:'Tarih',c:'YilAy'}],['[Net Satış]','[Satış YTD]','VAR Son = MAX(Tarih[Tarih]) VAR MaliBas = DATE(YEAR(Son) - IF(MONTH(Son) < 7, 1, 0), 7, 1) RETURN CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], MaliBas, Son))']);
p(r.rows.filter(x=>/2023-0[5-8]|2024-0[67]|2024-12/.test(x[0])));
r=q([{t:'Tarih',c:'YilAy'}],['CALCULATE([Net Satış], DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -12, MONTH))','CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Satislar[Tarih]))','[Satış GY]']);
p(r.rows.filter(x=>/2022-12|2023-0[56]|2024-03|2024-12/.test(x[0])), r.total);
p(Q('EVALUATE SUMMARIZECOLUMNS(StokGorunum[Tarih], "N", COUNTROWS(StokGorunum))',4));
r=q([{t:'Tarih',c:'Yil'}],['CALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))','[Stok Adedi]','CLOSINGBALANCEYEAR(SUM(StokGorunum[StokAdet]), Tarih[Tarih])','SUM(StokGorunum[StokAdet])']); p(r);
r=q([{t:'Tarih',c:'Ceyrek'}],['CALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))','[Stok Adedi]']); p(r);
// running total within year vs ALLSELECTED
r=q([{t:'Tarih',c:'YilAy'}],['CALCULATE([Net Satış], FILTER(ALLSELECTED(Tarih[Tarih]), Tarih[Tarih] <= MAX(Tarih[Tarih])))','[Kümülatif Satış]'],[{t:'Tarih',c:'Yil',values:[2024]}]); p(r.rows.slice(0,2), r.total);
// two ranges
p(M('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024,3,1), DATE(2024,5,31)))'), M('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2023,3,1), DATE(2023,5,31)))'));
p(M('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2023,7,1), DATE(2024,6,30)))'), M('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024,7,1), DATE(2024,12,31)))'));
// first sale date
p(M('CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS(Tarih))'));
r=q([{t:'Tarih',c:'Yil'}],['OPENINGBALANCEYEAR(SUM(StokGorunum[StokAdet]), Tarih[Tarih])']); p(r);
