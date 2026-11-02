const C=require('./common.js');
(async()=>{const {b,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#hedef');
await p.click('[data-ob-path="analist"]'); await p.click('[data-ob-next]'); await p.waitForTimeout(300);
await p.screenshot({path:C.SS+'03_hedef2.png',fullPage:true});
console.log((await p.innerText('#main')).slice(0,2000));
console.log((await p.$$eval('#main button',els=>els.map(e=>JSON.stringify(e.dataset)+' '+e.textContent.trim().slice(0,50)))).join('\n'));
await p.context().storageState({path:'st_after2.json'});
console.log(errs);await b.close();})();
