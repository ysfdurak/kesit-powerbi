const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 for (const W of [1360, 400]) { const p = await b.newPage({ viewport: { width: W, height: 900 } }); await p.goto('http://localhost:8765/index.html#karistirilanlar-all-ailesi'); await p.waitForTimeout(600); await p.evaluate(() => document.querySelector('.kc-demo').scrollIntoView()); await p.screenshot({ path: 'sh6/kcd' + W + '.png' }); await p.close(); }
 await b.close(); })();
