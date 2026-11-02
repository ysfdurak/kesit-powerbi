const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' }); const p = await b.newPage({ viewport: { width: 400, height: 800 } });
 await p.goto('http://localhost:8765/index.html#karistirilanlar'); await p.waitForTimeout(500);
 const hs = await p.evaluate(() => window.PBI_CONFUSED.map(c => 'karistirilanlar-' + c.id).concat(window.PBI_MISTAKES.filter(m => m.task).map(m => 'hatalar-' + m.id), ['hatalar', 'karistirilanlar', 'kariyer', 'sinavlar']));
 let bad = 0; for (const h of hs) { await p.goto('http://localhost:8765/index.html?q=' + Math.random() + '#' + h); await p.waitForTimeout(350); const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 1) { bad++; console.log(h, o); } }
 console.log('sayfa', hs.length, 'taşan', bad); await b.close(); })();
