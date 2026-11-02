const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
let dialogs=0; p.on('dialog',d=>{dialogs++;console.log('DIALOG',d.type(),d.message());d.dismiss()});
await p.goto('http://localhost:8765/index.html#sinavlar'); await p.waitForTimeout(300);
await p.click('[data-exstart="pl300k"]'); await p.waitForTimeout(300);
for(let i=0;i<5;i++){ const opt=await p.$('#main [data-exa], #main [data-excb], #main [data-exo]'); if(opt) await opt.click(); await p.click('#main .pager .btn.pri'); await p.waitForTimeout(100);}
console.log('at', (await p.innerText('#main h2')));
// navigate away via sidebar
await p.click('#nav [data-go="home"]').catch(async()=>{await p.click('[data-go="home"]')}); await p.waitForTimeout(300);
console.log('URL after home',p.url(),'dialogs',dialogs);
await p.goto('http://localhost:8765/index.html#sinavlar'); await p.waitForTimeout(300);
console.log('back on sinavlar:', (await p.innerText('#main')).slice(0,120).replace(/\n/g,' | '));
await p.reload(); await p.waitForTimeout(400);
console.log('after reload:', (await p.innerText('#main')).slice(0,120).replace(/\n/g,' | '));
// restart & finish
await p.click('[data-exstart="pl300k"]'); await p.waitForTimeout(300);
for(let i=0;i<20;i++){ const opt=await p.$('#main [data-exa], #main [data-excb], #main [data-exo], #main [data-exy]'); if(opt) await opt.click(); const nb=await p.$('#main .pager .btn.pri'); const t=await nb.innerText(); if(/bitir/i.test(t)&&!/Bölüm/.test(t)) break; await nb.click(); await p.waitForTimeout(80);}
await p.click('#main .pager .btn.pri'); await p.waitForTimeout(200);
console.log('ask:', await p.innerText('#exAsk'));
await p.click('[data-exfin="yes"]'); await p.waitForTimeout(400);
await p.screenshot({path:C.SS+'14_exam_result.png',fullPage:true});
console.log((await p.innerText('#main')).slice(0,2500));
await ctx.storageState({path:'st_p2b.json'});
console.log(errs);await b.close();})();
