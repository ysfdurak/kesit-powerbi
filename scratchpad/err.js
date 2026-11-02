const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext()).newPage(); p.on('pageerror', e => console.log('ERR', e.message, e.stack.split('\n')[1])); p.on('console', m => { if (m.type()==='error') console.log('CON', m.text().slice(0,200)); });
 await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800); console.log(await p.evaluate(()=>typeof window.PBI_CAREER)); await b.close(); })();
