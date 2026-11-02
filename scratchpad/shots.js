const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 1360, height: 1000 } })).newPage();
 for (const id of process.argv.slice(2)) { await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#dashboard-' + id); await p.waitForTimeout(500); await p.waitForFunction(() => !document.querySelector('.dgrid2.busy'), null, { timeout: 30000 }).catch(() => {});
   const el = await p.$('.dash-frame'); await el.screenshot({ path: 'ux/r_' + id + '.png' }); }
 await b.close(); })();
