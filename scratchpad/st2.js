const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const p = await (await b.newContext({ acceptDownloads: true })).newPage(); const e = []; p.on('pageerror', x => e.push(x.message));
await p.goto('http://localhost:8791/'); await p.waitForTimeout(1500); console.log(await p.evaluate(() => document.compatMode), (await p.textContent('.welcome h2')));
await p.goto('http://localhost:8791/#veriler-pedal-izmir'); await p.waitForTimeout(1000); const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 10000 }).catch(() => null), p.click('[data-vddl]')]); console.log('dl', dl && dl.suggestedFilename());
await p.goto('http://localhost:8791/#dashboard'); await p.waitForTimeout(1500); console.log('dash', await p.$$eval('.dash-card svg', x => x.length));
console.log(e); await b.close(); })();
