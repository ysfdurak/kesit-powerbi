require('./e.js');
const t=(e,s)=>{try{return ev(e,s)}catch(x){return 'ERR '+x.message.slice(0,90)}};
const m=[{t:'Tarih',c:'YilAy',values:['2024-05']}];
p('may24', t('[Net Satış]',m), 'mtd', t('TOTALMTD([Net Satış], Tarih[Tarih])',m), 'qtd', t('[Satış QTD]',m), 'ytd', t('[Satış YTD]',m), 'gy ytd', t('[Satış GY YTD]',m));
p(g([{t:'Tarih',c:'Yil'}],['TOTALMTD([Net Satış], Tarih[Tarih])','CALCULATE([Net Satış], PREVIOUSYEAR(Tarih[Tarih]))','DIVIDE([Satış YTD] - [Satış GY YTD], [Satış GY YTD])']));
p(g([{t:'Tarih',c:'YilAy'}],['[Net Satış]','CALCULATE([Net Satış], PREVIOUSYEAR(Tarih[Tarih]))','[Satış GY]','[Satış GA]','CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, MONTH))','CALCULATE([Net Satış], PARALLELPERIOD(Tarih[Tarih], -1, QUARTER))']).slice(27,32));
const q2=[{t:'Tarih',c:'YilCeyrek',values:['2024-Q2']}];
p(q('EVALUATE TOPN(2, VALUES(Tarih[YilCeyrek]))'));
p(g([{t:'Tarih',c:'YilCeyrek'}],['[Net Satış]','[Satış GA]','CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, MONTH))','CALCULATE([Net Satış], PREVIOUSQUARTER(Tarih[Tarih]))','CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, QUARTER))']).slice(8,10));
// 2022 partial: YoY 2023 inflated
p('ytd growth tot', t('DIVIDE([Satış YTD] - [Satış GY YTD], [Satış GY YTD])'));
