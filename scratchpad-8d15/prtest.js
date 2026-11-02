const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const ctx = await b.newContext({ viewport: { width: +(process.argv[2]||1360), height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
 const go = async h => { await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#' + h); await p.waitForTimeout(500); };
 await go('alistirma'); console.log('liste', (await p.$$('[data-prgo]')).length);
 const items = await p.evaluate(() => window.PBI_PRACTICE.map(x => [x.id, x.t]));
 let ok = 0;
 for (const [id, t] of items) {
   await go('gorev-' + id);
   if (t === 'pq') { await p.click('[data-pq="sol"]'); await p.click('[data-pq="apply"]'); await p.click('[data-pq="check"]'); await p.waitForTimeout(150); const o = await p.textContent('.pqwrap .msg.ok, .pqwrap .msg.err'); if (/Doğru/.test(o)) ok++; else console.log('PQ FAIL', id, o.slice(0, 80)); continue; }
   const sol = await p.evaluate(id => window.PBI_PRACTICE.find(x => x.id === id).sol, id);
   await p.click('[data-act="hint"]'); await p.fill('#daxEditor', sol); await p.click('[data-act="check"]'); await p.waitForTimeout(t === 'query' ? 500 : 350);
   const o = await p.textContent('#out'); if (/Doğru/.test(o)) ok++; else console.log('FAIL', id, o.slice(0, 120));
 }
 console.log('bankada doğru', ok, '/', items.length);
 // yanlış cevap denemesi
 await go('gorev-a1-urun'); await p.fill('#daxEditor', '40'); await p.click('[data-act="check"]'); await p.waitForTimeout(300); console.log('sabit 40:', (await p.textContent('#out')).slice(0, 60));
 // tekrar: vakitleri bugüne çek
 await p.evaluate(() => { const P = window.PBI_CORE.P; Object.keys(P.rv).slice(0, 3).forEach(k => P.rv[k].d = '2000-01-01'); window.PBI_CORE.save(); });
 await p.waitForTimeout(300); await go('tekrar'); console.log('tekrar bekleyen', await p.textContent('.kpis .kpi b'));
 await p.click('[data-rvgo]'); await p.waitForTimeout(400);
 const k = await p.evaluate(() => window.PBI_CORE.state().id); console.log('tekrar açılan', k);
 const ex = await p.evaluate(k => window.PBI_PRACTICE_UI.exByKey(k).e, k);
 if (ex.t === 'mc') await p.click('[data-mc="' + ex.a + '"]'); else if (ex.t === 'pq') { await p.click('[data-pq="sol"]'); await p.click('[data-pq="apply"]'); await p.click('[data-pq="check"]'); } else { await p.fill('#daxEditor', ex.sol); await p.click('[data-act="check"]'); }
 await p.waitForTimeout(400); console.log('tekrar sonrası', await p.evaluate(k => JSON.stringify(window.PBI_CORE.P.rv[k]), k), 'rvc', await p.evaluate(() => window.PBI_CORE.P.rvc));
 await p.screenshot({ path: 'sh4/review.png' });
 await go('profil'); await p.click('[data-thm="dark"]'); await p.waitForTimeout(200); console.log('tema', await p.evaluate(() => document.documentElement.getAttribute('data-theme')));
 const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act2="export"]')]); console.log('indirilen', dl.suggestedFilename());
 await p.click('[data-thm="auto"]');
 await p.screenshot({ path: 'sh4/profile.png', fullPage: true });
 await go('alistirma'); await p.screenshot({ path: 'sh4/pratik.png' });
 // sorun bildir
 await go('ders-calculate'); await p.click('.steps button[data-step="1"]'); await p.waitForTimeout(200); await p.click('[data-rep]'); await p.fill('.repform textarea', 'Deneme bildirimi'); await p.click('[data-repsend]'); console.log('rapor', await p.evaluate(() => window.PBI_CORE.P.reports.length));
 console.log('errors', errs); await b.close(); })();
