global.window=global;['data','data2','dax','measures'].forEach(f=>require('/home/claude/pbi/'+f+'.js'));const X=PBI_DAX,ms={};PBI_MEASURES.forEach(m=>ms[m.name]={name:m.name,expr:m.expr});
const T=(e)=>{const t0=Date.now(); const v=X.evalMeasure(ms,e,[]); console.log(Date.now()-t0,'ms',v,e.slice(0,100));};
T('COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), MAXX(VALUES(Satislar[SiparisNo]), [Net Satış]) >= 3000))');
T('COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), MAXX(VALUES(Satislar[SiparisNo]), CALCULATE(SUM(Satislar[Tutar]))) >= 3000))');
T('SUMX(VALUES(Satislar[SiparisNo]), [Net Satış])');
T('SUMX(VALUES(Satislar[MusteriNo]), SUMX(VALUES(Satislar[SiparisNo]), 1))');
T('COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), CALCULATE(MAXX(VALUES(Satislar[SiparisNo]), [Net Satış])) >= 3000))');
