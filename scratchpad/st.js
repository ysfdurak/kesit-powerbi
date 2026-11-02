const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const p = await b.newPage(); const e = []; p.on('pageerror', x => e.push(x.message));
await p.goto('http://localhost:8790/'); await p.waitForTimeout(1200); console.log(await p.evaluate(() => document.compatMode), (await p.textContent('main h1')).slice(0, 60));
await p.goto('http://localhost:8790/#ders-calculate'); await p.waitForTimeout(800); console.log((await p.textContent('main h1')).slice(0, 60)); console.log(e); await b.close(); })();
