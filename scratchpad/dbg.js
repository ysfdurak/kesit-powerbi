const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' }); const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
 await p.goto('http://localhost:8765/index.html#karistirilanlar-' + 'divide-bolme'); await p.waitForTimeout(500);
 const a = await p.evaluate(() => window.PBI_CONFUSED.find(c => c.id === 'divide-bolme').quiz[0].a); await p.click('[data-mc="' + a + '"]'); await p.waitForTimeout(200);
 console.log('rv', await p.evaluate(() => JSON.stringify(Object.keys(window.PBI_CORE.P.rv).slice(-3))), 'ex', await p.evaluate(() => window.PBI_CORE.P.ex['kq:divide-bolme:0']));
 await p.evaluate(() => { const P = window.PBI_CORE.P; P.rv['kq:divide-bolme:0'].d = '2000-01-01'; window.PBI_CORE.save(); });
 await p.goto('http://localhost:8765/index.html?x=2#tekrar'); await p.waitForTimeout(500); console.log((await p.textContent('#main')).slice(0, 400));
 await p.goto('http://localhost:8765/index.html?x=3#kariyer'); await p.waitForTimeout(400); await p.click('[data-ivtab="vaka"]'); await p.waitForTimeout(300); console.log('th', (await p.$$('.th-sol')).length, (await p.textContent('#main')).slice(0, 300));
 await b.close(); })();
