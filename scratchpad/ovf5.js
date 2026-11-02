const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' }); const p = await b.newPage({ viewport: { width: 400, height: 800 } });
for (const h of ['karistirilanlar-depolama-modlari', 'karistirilanlar-isfiltered-ailesi', 'hatalar-filter-all-satislar', 'hatalar-pasif-iliski']) { await p.goto('http://localhost:8765/index.html?q=' + Math.random() + '#' + h); await p.waitForTimeout(500);
 const o = await p.evaluate(() => { const out = []; document.querySelectorAll('#main *').forEach(e => { const r = e.getBoundingClientRect(); if (r.right > innerWidth + 1 && !(e.parentElement && e.parentElement.getBoundingClientRect().right > innerWidth + 1)) out.push(e.tagName + '.' + e.className + ' w' + Math.round(r.width) + ' ' + e.textContent.slice(0, 50)); }); return out.slice(0, 4); }); console.log(h, o); }
await b.close(); })();
