const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 400, height: 900 } })).newPage();
 for (const h of ['ders-copilot','ders-python-r','ders-fabric-yildiz']) { await p.goto('http://localhost:8765/index.html#' + h); await p.waitForTimeout(800);
  console.log(h, await p.evaluate(() => { const out=[]; document.querySelectorAll('#main *').forEach(e => { const r=e.getBoundingClientRect(); const pr=e.parentElement.getBoundingClientRect(); if (r.right>402 && pr.right<=402) out.push(e.tagName+'.'+e.className+' w'+Math.round(r.width)+' parent '+e.parentElement.tagName+'.'+e.parentElement.className+' :: '+(e.outerHTML||'').slice(0,120)); }); return out.slice(0,5); })); }
 await b.close(); })();
