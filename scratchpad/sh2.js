const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
 await p.goto('http://localhost:8765/index.html'); await p.evaluate(() => { localStorage.setItem('pbipatika.v1', JSON.stringify({ goal: { path: 'analist', exp: 'sifir', hours: 5, start: '2026-10-27' }, done: { tarih: true, aile: true, arayuz: true } })); });
 await p.goto('http://localhost:8765/index.html#patika-analist'); await p.waitForTimeout(700); await p.screenshot({ path: 'ux/m_p1.png' });
 await p.evaluate(() => document.getElementById('ready').scrollIntoView()); await p.waitForTimeout(200); await p.screenshot({ path: 'ux/m_p2.png' });
 const d = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage(); await d.goto('http://localhost:8765/index.html'); await d.evaluate(() => { localStorage.setItem('pbipatika.v1', JSON.stringify({ goal: { path: 'analist', exp: 'sifir', hours: 5, start: '2026-10-27' }, done: { tarih: true, aile: true, arayuz: true } })); }); await d.goto('http://localhost:8765/index.html'); await d.waitForTimeout(700); await d.screenshot({ path: 'ux/d_h.png' }); await d.goto('http://localhost:8765/index.html#patika-analist'); await d.waitForTimeout(700); await d.screenshot({ path: 'ux/d_p1.png' });
 await b.close(); })();
