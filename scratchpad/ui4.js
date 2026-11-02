const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const p = await (await b.newContext({ viewport: { width: 400, height: 900 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8765/index.html#kariyer'); await p.waitForTimeout(800); await p.click('[data-ivtab="vaka"]'); await p.waitForTimeout(400);
const ks = await p.$$eval('[data-ivth]', x => x.map(b => b.dataset.ivth + ':' + b.textContent)); console.log(ks);
for (const k of ks.map(x => x.split(':')[0])) { await p.click('[data-ivth="' + k + '"]'); await p.waitForTimeout(400); console.log(k, await p.textContent('.th-brief h3'), await p.$$eval('.th-sol tbody tr', x => x.length), await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), (await p.textContent('.th-sol')).includes('Hesaplama')); }
await p.click('[data-ivtab="star"]'); await p.waitForTimeout(300); console.log('star', (await p.textContent('main')).match(/st-|Durum/g)?.length);
console.log(errs); await b.close(); })();
