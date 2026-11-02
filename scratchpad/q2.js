const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' }); const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
const id = 'ar-' ; await p.goto('http://localhost:8765/index.html#arena-liste'); await p.waitForTimeout(400);
const c = await p.evaluate(() => PBI_AR_CH[0]); await p.goto('http://localhost:8765/index.html?x=1#arena-ch-' + c.id); await p.waitForTimeout(400);
console.log(await p.$$eval('[data-act="hint"]', e => e.map(x => x.outerHTML)));
await p.click('[data-act="hint"]'); await p.waitForTimeout(200); console.log('hintbox', (await p.textContent('#hintBox')).slice(0, 80));
await p.fill('#daxEditor', c.sol); await p.click('[data-act="check"]'); await p.waitForTimeout(400); console.log(await p.evaluate(id => JSON.stringify(PBI_CORE.P.arena.ch[id]), c.id)); await b.close(); })();
