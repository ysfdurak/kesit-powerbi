const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#dersler'); await p.waitForTimeout(300);
const before=await p.$$eval('#currList [data-lesson]',e=>e.length); console.log('curr items',before);
for(const q of ['calculate','CALCULATE','zaman zekası','zaman zekâsı','ilişki','iliski','RLS','sumx','xyzqq','power query']){ await p.fill('#currQ',q); await p.waitForTimeout(150); const n=await p.$$eval('#currList [data-lesson]',e=>e.length); const empty=n?'':(await p.innerText('#currList')).slice(0,120); console.log('search',JSON.stringify(q),'->',n, empty.replace(/\n/g,' '));}
await p.fill('#currQ','xyzqq'); await p.screenshot({path:C.SS+'60_search_empty.png'});
// DAX error messages
await p.goto('http://localhost:8765/index.html#ders-toplama'); await p.waitForTimeout(300);
const exs=await p.evaluate(()=>PBI_CORE.LESSONS.find(l=>l.id==='toplama').ex.map((e,i)=>e.t+':'+(e.name||'')));
console.log(exs);
const di=exs.findIndex(x=>!x.startsWith('mc')); await p.click(`[data-step="${di+1}"]`); await p.waitForTimeout(200);
for(const src of ['SUM(Satislar[Tutar]','SUMM(Satislar[Tutar])','SUM(Satislar[tutar])','SUM(Satış[Tutar])','5','=SUM(Satislar[Tutar])','calculate(sum(Satislar[Tutar]))','DIVIDE(1;2)','Satislar[Tutar]']){
 await p.fill('#daxEditor',src); await p.click('[data-act="check"]'); await p.waitForTimeout(150); console.log('ERR',JSON.stringify(src),'->',(await p.innerText('#out')).slice(0,170).replace(/\n/g,' '));}
// hints
await p.click('[data-act="hint"]'); await p.click('[data-act="hint"]'); await p.click('[data-act="hint"]'); console.log('HINTS',(await p.innerText('#hintBox')).slice(0,400).replace(/\n/g,' '));
console.log(errs.filter(e=>!/ERR_FAILED/.test(e)));await b.close();})();
