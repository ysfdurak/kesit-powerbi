const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#test'); await p.waitForTimeout(300);
console.log((await p.innerText('#main')).slice(0,1200));
console.log((await p.$$eval('#main button',els=>els.map(e=>JSON.stringify(e.dataset)+' '+e.textContent.trim().slice(0,50)))).join('\n'));
await p.screenshot({path:C.SS+'10_test.png'});
// start
const startBtn=await p.$('#main button.primary, #main [data-act="test-start"]'); if(startBtn) {await startBtn.click(); await p.waitForTimeout(200);}
let n=0; const qn=await p.evaluate(()=>window.PBI_PLACEMENT.length); console.log('placement Q',qn);
while(await p.$('[data-tq]') && n<60){ const ans=await p.evaluate(()=>{return 0}); 
  // answer correctly ~ first 60%
  const q=await p.evaluate(i=>window.PBI_PLACEMENT[i],n);
  const correct = n< qn*0.6;
  const opt = correct? q.a : (q.a===0?1:0);
  await p.click(`[data-tq="${opt}"]`); n++; await p.waitForTimeout(50);}
await p.waitForTimeout(300);
console.log('answered',n); console.log((await p.innerText('#main')).slice(0,2000));
await p.screenshot({path:C.SS+'11_test_result.png',fullPage:true});
console.log((await p.$$eval('#main button',els=>els.map(e=>JSON.stringify(e.dataset)+' '+e.textContent.trim().slice(0,50)))).join('\n'));
await ctx.storageState({path:'st_p2.json'});
console.log(errs);await b.close();})();
