const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 400, height: 860 } })).newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message));
 const views = process.argv.slice(2);
 for (const v of views) { await p.goto('http://localhost:8765/index.html?r='+Math.random()+'#' + v); await p.waitForTimeout(1200);
  const r = await p.evaluate(() => { const W = innerWidth; const sw = document.documentElement.scrollWidth - W; const out=[]; if (sw > 1) document.querySelectorAll('body *').forEach(e => { const r = e.getBoundingClientRect(); if (r.right > W + 1 && r.width > 0) { let a = e.parentElement, clipped=false; while (a) { const cs = getComputedStyle(a); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX)) { clipped=true; break; } a = a.parentElement; } if (!clipped) out.push(e.tagName + '.' + e.className); } }); return sw + ' ' + out.slice(0,6).join(' '); });
  console.log(v.padEnd(22), r); }
 console.log('errors', errs.length, errs.slice(0,3)); await b.close(); })();
