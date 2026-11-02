const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 400, height: 900 } })).newPage();
 for (const h of ['patika-pl300','patika-mulakat']) { await p.goto('http://localhost:8765/index.html?r=1#' + h); await p.waitForTimeout(700);
  console.log(h, await p.evaluate(() => { const out=[]; document.querySelectorAll('#main *').forEach(e => { const r=e.getBoundingClientRect(); if (r.right>401) { let a=e.parentElement, clip=false; while(a&&a.id!=='main'){ if(getComputedStyle(a).overflowX!=='visible'){clip=true;break;} a=a.parentElement;} if(!clip) out.push(e.tagName+'.'+e.className+' r'+Math.round(r.right)+' :: '+(e.textContent||'').slice(0,60)); } }); return out.slice(0,6); })); }
 await b.close(); })();
