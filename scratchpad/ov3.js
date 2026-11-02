const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 400, height: 900 } })).newPage();
 for (const h of ['ders-copilot','ders-python-r','ders-fabric-yildiz']) { await p.goto('http://localhost:8765/index.html?r=1#' + h); await p.waitForTimeout(800);
  console.log(h, await p.evaluate(() => { const sw=document.documentElement.scrollWidth; const out=[]; document.querySelectorAll('body *').forEach(e => { const r=e.getBoundingClientRect(); if (r.right<=innerWidth+1) return; let a=e.parentElement, clip=false; while(a){ const cs=getComputedStyle(a); if(cs.overflowX!=='visible'&&a!==document.body&&a!==document.documentElement){clip=true;break;} a=a.parentElement;} if(!clip) out.push(e.tagName+'.'+e.className+' r'+Math.round(r.right)+' :: '+e.outerHTML.slice(0,140)); }); return [sw, out.slice(0,4)]; })); }
 await b.close(); })();
