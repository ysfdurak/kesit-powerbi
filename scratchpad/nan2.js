const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' }); const p = await b.newPage();
for (const h of ['karistirilanlar-count-ailesi', 'hatalar']) { await p.goto('http://localhost:8765/index.html?q=' + Math.random() + '#' + h); await p.waitForTimeout(500); const t = await p.evaluate(() => document.getElementById('main').innerText); const i = t.search(/\bNaN\b/); console.log(h, JSON.stringify(t.slice(i - 160, i + 40))); }
await b.close(); })();
