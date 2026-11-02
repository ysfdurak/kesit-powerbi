const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' }); const p = await b.newPage({ viewport: { width: 400, height: 800 } });
for (const h of ['karistirilanlar-isfiltered-ailesi', 'hatalar-pasif-iliski']) { await p.goto('http://localhost:8765/index.html?q=' + Math.random() + '#' + h); await p.waitForTimeout(500);
 console.log(await p.evaluate(() => { const out = []; for (const sel of ['table', 'code']) { const e = [...document.querySelectorAll('#main ' + sel)].find(x => x.getBoundingClientRect().right > innerWidth + 1); if (!e) continue; let a = e, ch = []; while (a && a.id !== 'main') { ch.push(a.tagName + '.' + (a.className || '') + ':' + Math.round(a.getBoundingClientRect().width) + ':' + getComputedStyle(a).whiteSpace); a = a.parentElement; } out.push(ch.slice(0, 7).join(' < ')); } return out; })); }
await b.close(); })();
