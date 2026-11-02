const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(300);
// keyboard: tab sequence
const seq=[]; for(let i=0;i<8;i++){ await p.keyboard.press('Tab'); seq.push(await p.evaluate(()=>{const a=document.activeElement; const cs=getComputedStyle(a); return a.tagName+':'+(a.textContent||'').trim().slice(0,20)+' outline='+cs.outlineStyle+'/'+cs.outlineWidth+' shadow='+(cs.boxShadow!=='none')}));}
console.log('TAB',seq.join('\n'));
const skip=await p.$('a[href="#main"], .skip, [class*=skip]'); console.log('skip link',!!skip);
await p.screenshot({path:C.SS+'80_focus.png'});
// Enter on focused nav
await p.keyboard.press('Enter'); await p.waitForTimeout(200); console.log('after Enter url',p.url(), 'focus now', await p.evaluate(()=>document.activeElement.tagName+':'+document.activeElement.id));
// lesson MC by keyboard: keys A-D?
await p.goto('http://localhost:8765/index.html#ders-aile'); await p.waitForTimeout(200); await p.click('[data-step="1"]');
await p.keyboard.press('b'); await p.waitForTimeout(150); console.log('press b ->',(await p.innerText('#mcFb')).slice(0,40));
// editor tab trap
await p.goto('http://localhost:8765/index.html#ders-ilk-rapor'); await p.waitForTimeout(200); await p.click('[data-step="3"]'); await p.focus('#daxEditor'); await p.keyboard.press('Tab'); console.log('Tab in editor -> focus',await p.evaluate(()=>document.activeElement.id), JSON.stringify(await p.inputValue('#daxEditor')));
await p.keyboard.press('Escape'); await p.keyboard.press('Tab'); console.log('Esc+Tab -> focus',await p.evaluate(()=>document.activeElement.id||document.activeElement.tagName));
// back/forward
await p.goto('http://localhost:8765/index.html'); 
await p.click('[data-go="curr"]'); await p.waitForTimeout(150); await p.click('[data-go="sinav"]'); await p.waitForTimeout(150); await p.click('[data-go="dash"]'); await p.waitForTimeout(150);
const u1=p.url(); await p.goBack(); await p.waitForTimeout(200); const u2=p.url(); const h2=(await p.innerText('#main h1, #main h2')); await p.goBack(); await p.waitForTimeout(200); const u3=p.url(); await p.goForward(); await p.waitForTimeout(200); const u4=p.url();
console.log('history',u1,'<-',u2,h2.slice(0,30),'<-',u3,'->',u4);
// scroll restoration on back
await p.goto('http://localhost:8765/index.html#dersler'); await p.waitForTimeout(200); await p.evaluate(()=>scrollTo(0,2500)); await p.waitForTimeout(100);
const btn=await p.$$('#currList [data-lesson]'); await btn[40].click(); await p.waitForTimeout(200); await p.goBack(); await p.waitForTimeout(300); console.log('scroll after back',await p.evaluate(()=>scrollY));
// invalid hash
await p.goto('http://localhost:8765/index.html#ders-yok-boyle'); await p.reload(); await p.waitForTimeout(200); console.log('invalid lesson ->', p.url(), (await p.innerText('#main')).slice(0,60).replace(/\n/g,' '));
await p.goto('http://localhost:8765/index.html#saçma'); await p.reload(); await p.waitForTimeout(200); console.log('invalid route ->', (await p.innerText('#main')).slice(0,60).replace(/\n/g,' '));
await p.goto('http://localhost:8765/index.html#dashboard-yok'); await p.reload(); await p.waitForTimeout(200); console.log('invalid dash ->', (await p.innerText('#main')).slice(0,80).replace(/\n/g,' '));
await p.goto('http://localhost:8765/index.html#patika-yok'); await p.reload(); await p.waitForTimeout(200); console.log('invalid path ->', (await p.innerText('#main')).slice(0,80).replace(/\n/g,' '));
// heavy page timings (cold load)
for(const r of ['dashboard-ozet','dashboard-kokpit','final','studyo','lab','kariyer','alistirma','menuler','gorseller']){ const t0=Date.now(); await p.goto('http://localhost:8765/index.html#'+r); await p.reload({waitUntil:'load'}); const t1=Date.now()-t0; const lt=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0]; return Math.round(n.loadEventEnd)}); 
 // in-app nav timing
 await p.goto('http://localhost:8765/index.html'); const t2=await p.evaluate(async r=>{const s=performance.now(); location.hash=r; await new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(res))); return Math.round(performance.now()-s)},r);
 console.log('timing',r,'cold load',lt,'ms; in-app render',t2,'ms');}
const tot=await p.evaluate(()=>performance.getEntriesByType('resource').reduce((a,r)=>a+(r.transferSize||r.encodedBodySize||0),0)); console.log('resource bytes',tot);
console.log(errs.filter(e=>!/ERR_FAILED/.test(e)));await b.close();})();
