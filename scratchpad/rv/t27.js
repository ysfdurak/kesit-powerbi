const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#ders-tarih'); await p.waitForTimeout(300);
await p.click('[data-step="1"]'); const a=await p.evaluate(()=>PBI_CORE.LESSONS.find(l=>l.id==='tarih').ex[0].a);
await p.click(`#mc [data-mc="${a}"]`); await p.reload(); await p.waitForTimeout(300);
console.log('after immediate reload xp', await p.evaluate(()=>PBI_CORE.P.xp));
await p.click('[data-step="1"]'); await p.click(`#mc [data-mc="${a}"]`); await p.waitForTimeout(300); await p.reload(); await p.waitForTimeout(300);
console.log('after 300ms reload xp', await p.evaluate(()=>PBI_CORE.P.xp));
// import roundtrip
await p.goto('http://localhost:8765/index.html#profil'); await p.waitForTimeout(300);
const [dl]=await Promise.all([p.waitForEvent('download'), p.click('[data-act2="export"]')]); await dl.saveAs('dl/backup.json');
await p.evaluate(()=>{localStorage.clear()}); await p.reload(); await p.waitForTimeout(300); console.log('cleared xp',await p.evaluate(()=>PBI_CORE.P.xp));
await p.setInputFiles('#impFile','dl/backup.json'); await p.waitForTimeout(400); console.log('imported xp',await p.evaluate(()=>PBI_CORE.P.xp));
await b.close();})();
