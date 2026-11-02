const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 400, height: 860 } })).newPage(); const id='dax-opt';
 await p.goto('http://localhost:8765/index.html#ders-'+id); await p.waitForTimeout(500);
 const n = await p.$$eval('.steps button[data-step]', x => x.length);
 for (let s=1;s<n;s++){ await p.click('.steps button[data-step="'+s+'"]'); await p.waitForTimeout(150); const e = await p.evaluate(([id,s]) => window.PBI_CORE.LMAP[id].ex[s-1], [id,s]);
  if (e.t==='mc') await p.click('[data-mc="'+e.a+'"]'); else { await p.fill('#daxEditor', e.sol); await p.click('[data-act="check"]'); } await p.waitForTimeout(400); }
 console.log(await p.evaluate(() => { const W = innerWidth; const o=[document.documentElement.scrollWidth]; document.querySelectorAll('body *').forEach(e => { const r = e.getBoundingClientRect(); let a=e.parentElement,cl=false; while(a&&a!==document.body){ if(/(auto|scroll|hidden)/.test(getComputedStyle(a).overflowX)){cl=true;break;} a=a.parentElement;} if (!cl && r.right > W + 1) o.push(e.tagName + '.' + e.className + ' "' + e.textContent.slice(0, 80) + '" w=' + Math.round(r.width)); }); return o.join('\n'); }));
 await b.close(); })();
