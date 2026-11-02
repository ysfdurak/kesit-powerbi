const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const shots = [['d', 1360, 900], ['m', 390, 844]];
 for (const [k, w, h] of shots) { const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  for (const r of ['', 'path-analist', 'ders-calculate', 'patikalar', 'alistirma', 'profil']) { await p.goto('http://localhost:8765/index.html?r=1#' + r); await p.waitForTimeout(700); await p.screenshot({ path: 'ux/' + k + '_' + (r || 'home') + '.png', fullPage: k === 'd' && r === '' }); } }
 await b.close(); })();
