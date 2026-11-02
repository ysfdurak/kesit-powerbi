const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 for (const W of [1360, 400]) { const p = await b.newPage({ viewport: { width: W, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('http://localhost:8765/index.html#kariyer'); await p.waitForTimeout(500); await p.click('[data-ivtab="elestiri"]'); await p.waitForTimeout(200);
 for (const c of ['c1', 'c3', 'c5', 'c8']) { await p.click('[data-crit="' + c + '"]'); await p.waitForTimeout(80); }
 console.log(W, 'found', await p.textContent('.cr-found .eyebrow'), 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), errs);
 await p.screenshot({ path: 'sh6/crit' + W + '.png', fullPage: true }); await p.close(); }
 await b.close(); })();
