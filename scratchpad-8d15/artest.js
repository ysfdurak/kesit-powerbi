const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const W = +(process.argv[2]||1360); const ctx = await b.newContext({ viewport: { width: W, height: 900 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
 const go = async h => { await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#' + h); await p.waitForTimeout(450); };
 const sw = async () => p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
 await go('arena'); await p.screenshot({ path: 'sh5/hub' + W + '.png', fullPage: true }); console.log('hub modes', (await p.$$('.ar-modes .tool')).length, 'overflow', await sw());
 await go('arena-liste'); console.log('liste', (await p.$$('[data-arg^="ch-"]')).length, 'overflow', await sw());
 // tüm meydan okumalar
 const ids = await p.evaluate(() => window.PBI_AR_CH.map(c => c.id)); let ok = 0;
 for (const id of ids) { await go('arena-ch-' + id); const sol = await p.evaluate(id => window.PBI_AR_CH.find(c => c.id === id).sol, id); await p.fill('#daxEditor', sol); await p.click('[data-act="check"]'); await p.waitForTimeout(450); const o = await p.textContent('#out'); if (/Doğru/.test(o)) ok++; else console.log('FAIL', id, o.slice(0, 160)); }
 console.log('meydan okuma doğru', ok, '/', ids.length, 'puan', await p.evaluate(() => window.PBI_CORE.P.arena.pts));
 // sabit sayı hilesi gizli testte yakalanmalı
 await p.evaluate(() => { window.PBI_CORE.P.arena.ch = {}; window.PBI_CORE.save(); });
 await go('arena-ch-' + ids[0]); await p.screenshot({ path: 'sh5/ch' + W + '.png', fullPage: true });
 // ipucu
 const hb = await p.$('[data-act="hint"]'); if (hb) { await hb.click(); await p.waitForTimeout(150); }
 const sol0 = await p.evaluate(id => window.PBI_AR_CH.find(c => c.id === id).sol, ids[0]); await p.fill('#daxEditor', sol0); await p.click('[data-act="check"]'); await p.waitForTimeout(400);
 console.log('ipuçlu puan', await p.evaluate(id => JSON.stringify(window.PBI_CORE.P.arena.ch[id]), ids[0]));
 // hız turu
 await go('arena-hiz'); await p.click('[data-arsp="start"]'); await p.waitForTimeout(400);
 for (let i = 0; i < 4; i++) { const st = await p.evaluate(() => { const s = window.PBI_ARENA.state().SP; return s.list[s.i]; }); if (st.t === 'mc') { await p.click('[data-arsp="skip"]'); continue; } await p.fill('#daxEditor', st.sol); await p.click('[data-act="check"]'); await p.waitForTimeout(1100); }
 await p.click('[data-arsp="skip"]'); await p.waitForTimeout(200);
 console.log('hız ok', await p.evaluate(() => window.PBI_ARENA.state().SP.ok)); await p.screenshot({ path: 'sh5/hiz' + W + '.png', fullPage: true });
 await p.evaluate(() => { window.PBI_ARENA.state().SP.end = Date.now() - 1000; }); await p.waitForTimeout(900); console.log('hız bitiş', (await p.textContent('.finish h2')), 'rekor', await p.evaluate(() => window.PBI_CORE.P.arena.speed.best));
 // tahmin
 await go('arena-tahmin'); let pr = 0;
 for (let i = 0; i < 16; i++) { await p.click('[data-arpi="' + i + '"]'); await p.waitForTimeout(120); const n = (await p.$$('#prMc button')).length; if (n < 3) console.log('az seçenek', i, n); const idx = await p.evaluate(i => window.PBI_ARENA.predOpts(window.PBI_AR_PRED[i]).findIndex(o => o.ok), i); await p.click('[data-arpo="' + idx + '"]'); pr++; }
 console.log('tahmin', await p.evaluate(() => Object.values(window.PBI_CORE.P.arena.pred).filter(Boolean).length)); await p.screenshot({ path: 'sh5/tahmin' + W + '.png', fullPage: true });
 // bulmaca: doğru sırayla
 const pz = await p.evaluate(() => window.PBI_AR_PZ.map(z => z.id)); let pzok = 0;
 for (const id of pz) { await go('arena-pz-' + id); const keys = await p.evaluate(() => { const S = window.PBI_ARENA.state().PZS; return S.pool.filter(x => x.k[0] === 'L').sort((a, b) => +a.k.slice(1) - +b.k.slice(1)).map(x => x.k); }); for (const k of keys) await p.click('[data-arpz="' + k + '"]'); await p.click('[data-arpzc="1"]'); await p.waitForTimeout(250); const o = await p.textContent('#pzOut'); if (/Çözüldü/.test(o)) pzok++; else console.log('PZ FAIL', id, o.slice(0, 120)); }
 console.log('bulmaca', pzok, '/', pz.length);
 // tuzakla
 await go('arena-pz-' + pz[1]); await p.evaluate(() => { const S = window.PBI_ARENA.state().PZS; const z = window.PBI_AR_PZ.find(x => x.id === S.id); S.used = z.lines.map((_, i) => 'L' + i); const ti = S.used.length - 2; S.used[ti] = 'T0'; }); await p.click('[data-arpzc="1"]'); await p.waitForTimeout(250); console.log('tuzaklı:', (await p.textContent('#pzOut')).slice(0, 60)); await p.screenshot({ path: 'sh5/pz' + W + '.png', fullPage: true });
 // dedektif
 for (const d of await p.evaluate(() => window.PBI_AR_DET.map(x => x.id))) { await go('arena-det-' + d); const n = await p.evaluate(d => window.PBI_AR_DET.find(x => x.id === d).steps.length, d);
   for (let i = 0; i < n; i++) { const st = await p.evaluate(([d, i]) => window.PBI_AR_DET.find(x => x.id === d).steps[i], [d, i]); if (st.t === 'mc') await p.click('[data-mc="' + st.a + '"]'); else { await p.fill('#daxEditor', st.sol); await p.click('[data-act="check"]'); } await p.waitForTimeout(1100); }
   console.log('dedektif', d, await p.evaluate(d => window.PBI_CORE.P.arena.det[d], d), 'kapandı', !!(await p.$('.finish'))); const cl = await p.$$eval('.det-clue p', e => e.map(x => x.textContent)); if (cl.some(t => /\{\d\}|\?/.test(t.replace(/\?\s/g,'')) )) console.log('ipucu şüpheli', cl); await p.screenshot({ path: 'sh5/det-' + d + W + '.png', fullPage: true }); }
 // turnuva
 await go('arena-turnuva'); await p.click('[data-artr="start"]'); await p.waitForTimeout(400);
 for (let i = 0; i < 5; i++) { await p.click('[data-artrq="' + i + '"]'); await p.waitForTimeout(250); const c = await p.evaluate(i => window.PBI_ARENA.state().TR.set[i], i); await p.fill('#daxEditor', c.sol); await p.click('[data-act="check"]'); await p.waitForTimeout(500); }
 await p.waitForTimeout(800); console.log('turnuva', await p.textContent('.finish h2').catch(() => 'yok'), JSON.stringify(await p.evaluate(() => window.PBI_CORE.P.arena.tour)));
 await go('arena'); console.log('puan son', await p.evaluate(() => window.PBI_CORE.P.arena.pts), await p.textContent('.ar-rank h2')); await p.screenshot({ path: 'sh5/hub2' + W + '.png', fullPage: true });
 console.log('errors', errs.slice(0, 10)); await b.close(); })();
