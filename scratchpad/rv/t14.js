const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#patika-hizli'); await p.waitForTimeout(300);
// bottom of path
const tail=await p.innerText('#main'); console.log(tail.slice(-2500).replace(/\n+/g,' | '));
await p.locator('.certcta').scrollIntoViewIfNeeded(); await p.screenshot({path:C.SS+'30_certcta.png'});
// download
const dlb=await p.$('[data-act="data-zip"]'); console.log('zip button', !!dlb);
if(dlb){ const [dl]=await Promise.all([p.waitForEvent('download',{timeout:8000}).catch(e=>null), dlb.click()]); if(dl){ const path='/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/rv/dl/'+dl.suggestedFilename(); await dl.saveAs(path); console.log('downloaded',path);} else console.log('NO DOWNLOAD EVENT'); }
// click cert button while locked
await p.click('.certcta button'); await p.waitForTimeout(300); console.log('cert locked view:',p.url(), (await p.innerText('#main')).slice(0,300));
// force complete lessons
await p.evaluate(()=>{const C=PBI_CORE; C.PMAP.hizli.ids?0:0; const ids=(C.PMAP.hizli.lessons||C.PMAP.hizli.ids||[]); console.log(ids)});
const keys=await p.evaluate(()=>Object.keys(PBI_CORE.PMAP.hizli)); console.log('path keys',keys);
console.log(errs);await b.close();})();
