const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: +(process.argv[2]||1360), height: 900 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#sinavlar'); await p.waitForTimeout(600);
 console.log('sınav kartı', (await p.$$('[data-exstart]')).length); await p.screenshot({ path: 'sh4/sinav.png', fullPage: true });
 for (const id of ['sv-a', 'sv-b', 'sv-c']) {
   await p.click('[data-exstart="' + id + '"]'); await p.waitForTimeout(200);
   const n = await p.evaluate(() => window.PBI_EXAMUI.cur().qs.length);
   for (let i = 0; i < n; i++) { const a = await p.evaluate(() => { const E = window.PBI_EXAMUI.cur(); return E.qs[E.cur].x.a; }); if (i % 5 !== 4) await p.click('[data-exa="' + a + '"]'); if (i < n - 1) await p.click('.pager [data-exq="' + (i + 1) + '"]'); }
   if (id === 'pl300') await p.screenshot({ path: 'sh4/sinav_run.png' });
   await p.click('.pager [data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(200);
   console.log(id, n, 'soru →', (await p.textContent('.finish h2')).trim());
   if (id === 'pl300') await p.screenshot({ path: 'sh4/sinav_sonuc.png', fullPage: true });
   await p.click('[data-exback]'); await p.waitForTimeout(150);
 }
 for (const id of ['kod-a', 'kod-b', 'kod-c', 'mulakat']) {
   await p.click('[data-exstart="' + id + '"]'); await p.waitForTimeout(300);
   const n = await p.evaluate(() => window.PBI_EXAMUI.cur().tasks.length);
   for (let i = 0; i < n; i++) {
     const t = await p.evaluate(() => { const E = window.PBI_EXAMUI.cur(); return E.tasks[E.cur]; });
     if (i === 0) { await p.fill('#daxEditor', t.t === 'query' ? 'EVALUATE ROW("x", 1)' : '1'); await p.click('[data-act="check"]'); await p.waitForTimeout(300); const o = await p.textContent('#out'); console.log('  yanlış deneme:', o.slice(0, 70).replace(/\s+/g, ' '), '| beklenen sütunu var mı:', /Beklenen/.test(await p.innerHTML('#out'))); console.log('  ipucu düğmesi:', !!(await p.$('[data-act="hint"]')), 'çözüm düğmesi:', !!(await p.$('[data-act="sol"]'))); }
     await p.fill('#daxEditor', t.sol); await p.click('[data-act="check"]'); await p.waitForTimeout(t.t === 'query' ? 600 : 400);
     const o = await p.textContent('#out'); if (!/Doğru/.test(o)) console.log('  FAIL', t.id, o.slice(0, 100));
     if (id === 'mulakat' && i === 0) console.log('  takip sorusu:', (await p.textContent('#exFollow')).slice(0, 60));
     if (i < n - 1) { await p.click('.pager [data-exq="' + (i + 1) + '"]'); await p.waitForTimeout(250); }
   }
   if (id === 'mulakat') await p.screenshot({ path: 'sh4/mulakat.png' });
   await p.click('.pager [data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(200);
   console.log(id, '→', (await p.textContent('.finish h2')).trim());
   await p.click('[data-exback]'); await p.waitForTimeout(150);
 }
 // süre bitince otomatik teslim
 await p.click('[data-exstart="sv-a"]'); await p.evaluate(() => { window.PBI_EXAMUI.cur().end = Date.now() + 1500; }); await p.waitForTimeout(3000); console.log('süre bitti:', (await p.textContent('.finish h2').catch(() => 'TESLİM EDİLMEDİ')).trim());
 console.log('profil sınav bölümü:', await p.evaluate(() => Object.keys(window.PBI_CORE.P.exams).length));
 console.log('errors', errs); await b.close(); })();
