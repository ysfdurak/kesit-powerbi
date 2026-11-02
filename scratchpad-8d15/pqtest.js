const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const W = +(process.argv[2]||1360); const p = await (await b.newContext({ viewport: { width: W, height: 900 } })).newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message));
 const out = process.argv[3];
 await p.goto('http://localhost:8765/index.html?r='+Math.random()+'#pq'); await p.waitForTimeout(800);
 // manuel: üst satır kaldır, başlık, Not kaldır
 await p.click('[data-pqop="removeTop"]'); await p.waitForTimeout(100); await p.click('[data-pq="ok"]'); await p.waitForTimeout(100);
 await p.click('[data-pqop="promote"]'); await p.waitForTimeout(100);
 await p.click('th[data-pqcol="Şehir"]'); await p.click('[data-pqtab="tr"]'); await p.click('[data-pqop="trim"]'); await p.click('[data-pqop="proper"]');
 await p.click('th[data-pqcol="Tutar"]'); await p.click('span[data-pqtype="Tutar"]'); await p.waitForTimeout(100); await p.click('[data-pq="ok"]'); await p.waitForTimeout(200);
 await p.screenshot({ path: out + '/pq_free.png', fullPage: true });
 const st = await p.$$eval('.pqsteps li', x => x.map(l => l.textContent)); console.log('steps', st);
 // ders alıştırmaları: çözümü uygula + kontrol
 const exs = await p.evaluate(() => window.PBI_CORE.LESSONS.flatMap(l => (l.ex||[]).map((e,i)=>[l.id,i,e.t])).filter(x=>x[2]==='pq'));
 for (const [id,i] of exs) { await p.goto('http://localhost:8765/index.html?r='+Math.random()+'#ders-'+id); await p.waitForTimeout(400); await p.click('.steps button[data-step="'+(i+1)+'"]'); await p.waitForTimeout(300);
   await p.click('[data-pq="check"]'); await p.waitForTimeout(100); const before = await p.textContent('.pqwrap .msg'); 
   await p.click('[data-pq="sol"]'); await p.click('[data-pq="apply"]'); await p.click('[data-pq="check"]'); await p.waitForTimeout(150); const after = await p.textContent('.pqwrap .msg.ok, .pqwrap .msg.err');
   console.log(id, i, '|', before.slice(0,70), '|', after.slice(0,40)); if (id==='pq-temel' && i===4) await p.screenshot({ path: out + '/pq_ex.png', fullPage: true }); }
 console.log('errors', errs); await b.close(); })();
