const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 400, height: 900 } })).newPage();
 for (const h of ['ders-copilot','ders-python-r','ders-fabric-yildiz']) { await p.goto('http://localhost:8765/index.html#' + h); await p.waitForTimeout(800);
  console.log(h, await p.evaluate(() => [...document.querySelectorAll('#main *')].filter(e => e.getBoundingClientRect().right > 410 && e.children.length===0).slice(0,4).map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().width) + ' ' + (e.textContent||'').slice(0,60)))); }
 await p.goto('http://localhost:8765/index.html#sinavlar'); await p.waitForTimeout(800);
 console.log(await p.evaluate(() => { const t = document.getElementById('main').innerText; const i = t.indexOf('undefined'); return t.slice(Math.max(0,i-200), i+50); }));
 await b.close(); })();
