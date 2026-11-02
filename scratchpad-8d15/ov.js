const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 400, height: 860 } })).newPage();
 await p.goto('http://localhost:8765/index.html#' + process.argv[2]); await p.waitForTimeout(2500);
 console.log(await p.evaluate(() => { const W = innerWidth; const out = []; document.querySelectorAll('body *').forEach(e => { const r = e.getBoundingClientRect(); if (r.right > W + 1 && r.width > 0) { const par = e.parentElement.getBoundingClientRect(); if (par.right <= W + 1) out.push(e.tagName + '.' + e.className + ' w=' + Math.round(r.width) + ' r=' + Math.round(r.right)); } }); return out.slice(0, 15).join('\n'); }));
 await b.close(); })();
