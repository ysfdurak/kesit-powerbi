const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open({vp:{width:390,height:844}});
await p.goto('http://localhost:8765/index.html#dashboard-ozet'); await p.waitForTimeout(400);
const top=await p.evaluate(()=>{const e=document.querySelector('[data-dbm]');return Math.round(e.getBoundingClientRect().top+scrollY)}); console.log('phone report top',top,'= screens',(top/844).toFixed(1));
await p.evaluate(t=>scrollTo(0,t-60),top); await p.waitForTimeout(200); await p.screenshot({path:C.SS+'51_m_report.png'});
await p.goto('http://localhost:8765/index.html#ders-ilk-rapor'); await p.waitForTimeout(300);
await p.click('[data-step="3"]'); await p.waitForTimeout(300);
await p.fill('#daxEditor','En Küçük Satır = MIN(Satislar[Tutar])'); await p.click('[data-act="check"]'); await p.waitForTimeout(300);
await p.screenshot({path:C.SS+'52_m_dax.png'}); 
const ed=await p.$('#daxEditor'); await ed.scrollIntoViewIfNeeded(); await p.screenshot({path:C.SS+'53_m_dax2.png'});
// Patikam tab with no goal
await p.click('.tabbar [data-go="paths"], #tabbar [data-go="paths"]').catch(e=>console.log('tab err',e.message.slice(0,80)));
await p.waitForTimeout(300); console.log('Patikam ->',p.url());
await p.click('#tabbar [data-go="more"]').catch(e=>console.log('more err',e.message.slice(0,80))); await p.waitForTimeout(300);
await p.screenshot({path:C.SS+'54_m_menu.png'});
console.log(errs.filter(e=>!/ERR_FAILED/.test(e)));await b.close();})();
