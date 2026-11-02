const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 for (const W of [1360, 400]) { const p = await b.newPage({ viewport: { width: W, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('http://localhost:8765/index.html#sinavlar'); await p.waitForTimeout(500); await p.evaluate(() => window.PBI_EXAMUI.start('mad:pl-tl7')); await p.waitForTimeout(200);
 const i = await p.evaluate(() => window.PBI_EXAMUI.cur().qs.findIndex(q => q.x.type === 'click')); await p.evaluate(i => { const E = window.PBI_EXAMUI.cur(); E.cur = i; window.PBI_CORE.render(); }, i); await p.waitForTimeout(150);
 await p.click('[data-exct="pq-donustur"]'); await p.waitForTimeout(80); await p.click('[data-excb="pq-donustur|Devrik"]'); await p.waitForTimeout(80); await p.screenshot({ path: 'sh6/click' + W + '.png', fullPage: true });
 await p.click('[data-excheck="1"]'); await p.waitForTimeout(150); await p.screenshot({ path: 'sh6/clickrev' + W + '.png', fullPage: true });
 console.log(W, (await p.textContent('.brief .msg')).slice(0, 60), 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), errs); await p.close(); }
 await b.close(); })();
