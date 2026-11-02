const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' }); const p = await b.newPage();
await p.goto('http://localhost:8765/index.html#ders-blank-hata'); await p.waitForTimeout(500);
for (let s = 0; s <= 7; s++) { if (s) { const bt = await p.$('.steps button[data-step="' + s + '"]'); if (!bt) break; await bt.click(); await p.waitForTimeout(300); } const t = await p.evaluate(() => document.getElementById('main').innerText); const i = t.search(/\bNaN\b/); if (i >= 0) console.log(s, JSON.stringify(t.slice(i - 150, i + 60))); }
await b.close(); })();
