const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html');
await p.evaluate(()=>{const C=PBI_CORE; C.LESSONS.forEach(l=>C.P.done[l.id]=true); C.save();}); await p.waitForTimeout(400);
await p.goto('http://localhost:8765/index.html#patika-hizli'); await p.reload(); await p.waitForTimeout(300);
for(let k=0;k<20;k++){ const cb=await p.$('input[type=checkbox][data-capchk]:not(:checked)'); if(!cb) break; const y0=await p.evaluate(()=>scrollY); await cb.click(); await p.waitForTimeout(150); console.log('scroll',y0,'->',await p.evaluate(()=>scrollY));}
await p.waitForTimeout(300);
for(let k=0;k<20;k++){ const cb=await p.$('input[type=checkbox][data-rdy]:not(:checked)'); if(!cb) break; await cb.click(); await p.waitForTimeout(150);}
await p.waitForTimeout(300);
const cta=await p.innerText('.certcta'); console.log('CTA',cta);
await p.click('.certcta button'); await p.waitForTimeout(400); console.log(p.url());
await p.screenshot({path:C.SS+'31_cert.png'});
await p.fill('#certName','Ayşe Yılmaz'); await p.waitForTimeout(200);
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null), p.click('[data-act="cert-dl"]')]);
console.log('cert download', dl&&dl.suggestedFilename()); if(dl) await dl.saveAs('dl/'+dl.suggestedFilename());
await p.screenshot({path:C.SS+'32_cert_named.png'});
// mobile view of cert
await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300); await p.screenshot({path:C.SS+'33_cert_phone.png',fullPage:true});
console.log(errs);await b.close();})();
