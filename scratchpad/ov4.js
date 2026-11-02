const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 400, height: 900 } })).newPage();
 for (const h of ['ders-copilot','ders-python-r','ders-fabric-yildiz']) { await p.goto('http://localhost:8765/index.html?r=1#' + h); await p.waitForTimeout(800);
  console.log(h, await p.evaluate(() => { const out=[]; document.querySelectorAll('body *').forEach(e => { const r=e.getBoundingClientRect(); if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX==="visible" && e.clientWidth>0) out.push(e.tagName+'.'+e.className+' w'+Math.round(r.width)+' ' +getComputedStyle(e).position+' :: '+e.outerHTML.slice(0,160)); }); return out.slice(0,8); })); }
 await b.close(); })();
