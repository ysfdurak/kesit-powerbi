const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://localhost:8765/index.html#sertifika'); await p.waitForTimeout(800); console.log((await p.textContent('main')).slice(0,400)); await b.close(); })();
