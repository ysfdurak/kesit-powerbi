const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' }); const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('http://localhost:8765/index.html#sinavlar'); await p.waitForTimeout(600);
 for (const id of ['pl300', 'dp600', 'pl300k', 'dp600k']) { const r = await p.evaluate(id => { window.PBI_EXAMUI.start(id); const E = window.PBI_EXAMUI.cur(); const d = {}; E.qs.forEach(q => { const k = q.x.k + (q.x.caseRef ? '(vaka)' : q.x.serRef ? '(seri)' : ''); d[k] = (d[k] || 0) + 1; }); const cls = E.qs.filter(q => q.x.cls !== 'sinav').length; return { n: E.qs.length, secs: E.secList.map(s => s.type + ':' + (s.b - s.a + 1)).join(' '), d, cls }; }, id); console.log(id, JSON.stringify(r)); await p.evaluate(() => { location.hash = '#sinavlar'; }); }
 console.log(await p.evaluate(() => window.PBI_EXAMS.filter(e => e.fam !== 'kod' && e.fam !== 'mulakat').map(e => e.id + ':' + e.qs.length).join(' ')));
 console.log('errors', errs); await b.close(); })();
