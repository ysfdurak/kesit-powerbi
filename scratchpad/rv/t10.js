const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#patika-pl300'); await p.waitForTimeout(300);
const t=await p.innerText('#main'); console.log(t.slice(0,900)); console.log('placement mention:', /seviye testi|atla|geçildi/i.test(t));
await p.goto('http://localhost:8765/index.html#sinavlar'); await p.waitForTimeout(300);
console.log((await p.innerText('#main')).slice(0,2500));
await p.screenshot({path:C.SS+'12_sinavlar.png'});
console.log((await p.$$eval('#main button',els=>els.map(e=>JSON.stringify(e.dataset)+' '+e.textContent.trim().slice(0,50)))).slice(0,40).join('\n'));
console.log(errs);await b.close();})();
