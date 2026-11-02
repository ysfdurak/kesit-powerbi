const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#dashboard-ozet'); await p.waitForTimeout(500);
console.log('scrollY after direct open',await p.evaluate(()=>scrollY));
const pg=await p.$('[data-dpage="genel"]'); await pg.scrollIntoViewIfNeeded();
const top=await p.evaluate(()=>{const e=document.querySelector('[data-dbm]');return e.getBoundingClientRect().top+scrollY}); console.log('report top at',top);
await p.evaluate(t=>scrollTo(0,t-80),top); await p.waitForTimeout(200);
await p.screenshot({path:C.SS+'43_report.png'});
// bookmark
await p.click('[data-dbm="b23"]'); await p.waitForTimeout(300); await p.screenshot({path:C.SS+'44_bm_b23.png'});
console.log('after bm url',p.url());
// pages
await p.click('[data-dpage="kar"] >> nth=0'); await p.waitForTimeout(300); await p.screenshot({path:C.SS+'45_page_kar.png'});
await p.click('[data-dpage="genel"] >> nth=0'); await p.waitForTimeout(300);
// find a drillable element: look for elements with data attrs inside visuals
const cand=await p.$$eval('#main [data-dt], #main [data-thru], #main [data-pt], #main svg rect[data-k], #main [data-k]',els=>els.slice(0,10).map(e=>e.tagName+' '+JSON.stringify(e.dataset)));
console.log('cands',cand.join('\n'));
console.log(errs);await b.close();})();
