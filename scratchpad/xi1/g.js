require('./h.js');
const p=(...x)=>console.log(JSON.stringify(x));
const f=[{t:'Tarih',c:'YilAy',values:['2024-12']}];
['[Satış YTD]','TOTALYTD([Net Satış], Tarih[Tarih], "6/30")','TOTALYTD([Net Satış], Tarih[Tarih], ALL(Tarih), "6/30")','CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6/30"))','CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6-30"))','CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Satislar[Tarih]))','CALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))','CLOSINGBALANCEYEAR(SUM(StokGorunum[StokAdet]), Tarih[Tarih])','OPENINGBALANCEYEAR(SUM(StokGorunum[StokAdet]), Tarih[Tarih])'].forEach(e=>p(e,M(e,f)));
