const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#ders-toplama'); await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const X=PBI_CORE.X, ms=PBI_CORE.measureSet(); const out={}; for(const s of ['DISTINCTCOUNT(Satislar[SiparisNo])','distinctcount(satislar[siparisno])','DISTINCTCOUNT ( Satislar[SiparisNo] )','DISTINCTCOUNT(\'Satislar\'[SiparisNo])','COUNTROWS(VALUES(Satislar[SiparisNo]))','DIVIDE(10,4)','10/0','DIVIDE(10,0)','FORMAT(0.256,"0.0%")','DATE(2024,2,30)','BLANK()+1','"a"&1']){ try{ out[s]=X.evalMeasure(ms,s,[]);}catch(e){out[s]='ERR '+e.message} } return out;});
console.log(r);
console.log(errs.filter(e=>!/ERR_FAILED/.test(e)));await b.close();})();
