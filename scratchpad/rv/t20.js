const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#dashboard-ozet'); await p.waitForTimeout(400);
const mob=await p.$('[data-dmob]'); await mob.scrollIntoViewIfNeeded(); await mob.click(); await p.waitForTimeout(500);
const m2=await p.$('[data-dmob]'); await m2.scrollIntoViewIfNeeded(); await p.evaluate(()=>scrollBy(0,-500)); 
await p.screenshot({path:C.SS+'48_phone_layout.png'});
console.log(await m2.innerText());
console.log(errs);await b.close();})();
