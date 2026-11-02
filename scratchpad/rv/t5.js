const C=require('./common.js');
(async()=>{const {b,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#hedef');
await p.click('[data-ob-path="analist"]'); await p.click('[data-ob-next]'); 
await p.click('[data-ob-exp="sifir"]'); await p.click('[data-ob-next]'); await p.waitForTimeout(300);
console.log((await p.innerText('#main')).slice(0,1500));
console.log((await p.$$eval('#main button, #main input, #main select',els=>els.map(e=>e.tagName+JSON.stringify(e.dataset)+' '+(e.value||'')+' '+e.textContent.trim().slice(0,50)))).join('\n'));
await p.screenshot({path:C.SS+'04_hedef3.png',fullPage:true});
await b.close();})();
