const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const W = +(process.argv[2] || 1360); const p = await b.newPage({ viewport: { width: W, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('http://localhost:8765/index.html#sinavlar'); await p.waitForTimeout(600);
 const skills = await p.evaluate(() => Object.values(window.PBI_CERT_SKILLS).flat().map(s => s.id));
 let full = 0, zero = 0, tested = 0, empty = [], ovf = [];
 const answerAll = async (correct) => { const n = await p.evaluate(() => window.PBI_EXAMUI.cur().qs.length); for (let i = 0; i < n; i++) {
   const x = await p.evaluate(i => window.PBI_EXAMUI.cur().qs[i].x, i);
   if (i > 0) { await p.evaluate(i => { const E = window.PBI_EXAMUI.cur(); E.cur = i; E.sec = E.secList.findIndex(s => i >= s.a && i <= s.b); window.PBI_CORE.render(); }, i); await p.waitForTimeout(60); }
   if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) ovf.push(x.id || x.s);
   if (!correct) continue;
   if (x.type === 'mc') await p.click('[data-exa="' + x.a + '"]');
   else if (x.type === 'multi') for (const j of x.a) await p.click('[data-exm="' + j + '"]');
   else if (x.type === 'yesno') for (let k = 0; k < x.st.length; k++) await p.click('[data-exy="' + k + ':' + x.st[k].a + '"]');
   else if (x.type === 'order') for (let k = 0; k < x.items.length; k++) await p.click('[data-exo="i' + k + '"]');
   else if (x.type === 'click') { await p.click('[data-exct="' + x.a.split('||')[0].split('|')[0] + '"]'); await p.waitForTimeout(60); await p.click('[data-excb="' + x.a.split('||')[0] + '"]'); }
   else if (x.type === 'serq') await p.click('[data-exs="' + x.a + '"]');
   else if (x.type === 'hot') for (let k = 0; k < x.slots.length; k++) await p.selectOption('[data-exh="' + k + '"]', String(x.slots[k].a)); } };
 for (const s of skills) { await p.evaluate(s => window.PBI_EXAMUI.start('mad:' + s), s); await p.waitForTimeout(150); const ex = await p.evaluate(() => window.PBI_EXAMUI.cur() && window.PBI_EXAMUI.cur().qs.length); if (!ex) { empty.push(s); await p.evaluate(() => { location.hash = '#sinavlar'; }); continue; }
   tested++; await answerAll(true); await p.click('[data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(120); const h = await p.textContent('.finish h2'); if (/^1000|^%100/.test(h)) full++; else console.log('TAM DEĞİL', s, h);
   await p.click('[data-exback="1"]'); await p.waitForTimeout(80); }
 console.log('madde', skills.length, 'test', tested, 'tam puan', full, 'boş madde', empty.join(','));
 // yanlış/boş cevaplarla inceleme ekranı tüm tipler
 for (const id of ['pl300', 'dp600']) { await p.click('[data-exstart="' + id + '"]'); await p.waitForTimeout(200); await answerAll(false); await p.click('[data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(300); console.log(id, 'boş sonuç', await p.textContent('.finish h2'), 'inceleme', (await p.$$('.exrev')).length, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)); await p.screenshot({ path: 'sh6/rev-' + id + W + '.png', fullPage: true }); await p.click('[data-exback="1"]'); await p.waitForTimeout(100); }
 console.log('taşan sorular', ovf.slice(0, 10), 'errors', errs.slice(0, 5)); await b.close(); })();
