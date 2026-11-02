const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message));
 await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
 console.log(await p.evaluate(() => { const CR = window.PBI_CAREER, R = window.PBI_ROLES; return (window.PBI_PATHS).map(pp => { const ms = CR.milestones(pp); const n = ms.reduce((a, m) => a + m.ids.length, 0); const missing = []; (R[pp.id]||{}).ms && R[pp.id].ms.forEach(m => { if (!pp.lessons.includes(m.to)) missing.push(m.to); }); const rl = CR.readyItems(pp.id).filter(x=>x.lessons).flatMap(x=>x.lessons.filter(l=>!window.PBI_CORE.LMAP[l])); return pp.id + ' ' + ms.map(m => m.ids.length).join('/') + ' toplam ' + n + '/' + pp.lessons.length + (missing.length ? ' EKSİK ' + missing : '') + (rl.length ? ' HAZIRLIK-EKSİK ' + rl : '') + ' ready=' + CR.readyItems(pp.id).length; }).join('\n'); }));
 console.log(errs); await b.close(); })();
