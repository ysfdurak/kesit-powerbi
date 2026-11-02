const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const p = await (await b.newContext({ viewport: { width: 400, height: 900 } })).newPage();
await p.goto('http://localhost:8765/index.html#kariyer'); await p.waitForTimeout(800); await p.click('[data-ivtab="vaka"]'); await p.waitForTimeout(300); await p.click('[data-ivth="tedarik"]'); await p.waitForTimeout(400);
console.log(await p.evaluate(() => [...document.querySelectorAll('main *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('table')).slice(0, 12).map(e => e.tagName + '.' + e.className + ' w' + Math.round(e.getBoundingClientRect().width) + ' ' + getComputedStyle(e).whiteSpace + ' ' + Math.round(e.getBoundingClientRect().right) + ' ' + e.textContent.slice(0, 60))));
await b.close(); })();
