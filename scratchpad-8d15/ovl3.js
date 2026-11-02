const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 400, height: 860 } })).newPage();
 for (const [id, s] of [['baglam-gecisi', 2], ['musteri-analitigi', 1]]) {
 await p.goto('http://localhost:8765/index.html?r='+Math.random()+'#ders-'+id); await p.waitForTimeout(500);
 await p.click('.steps button[data-step="'+s+'"]'); await p.waitForTimeout(150); const e = await p.evaluate(([id,s]) => window.PBI_CORE.LMAP[id].ex[s-1], [id,s]);
 for (let h=0;h<3;h++){ const hb = await p.$('[data-act="hint"]:not([disabled])'); if (hb) await hb.click(); }
 await p.fill('#daxEditor', e.sol); await p.click('[data-act="check"]'); await p.waitForTimeout(500);
 console.log(id, await p.evaluate(() => { const o=[]; const walk = (el, d) => { for (const c of el.children) { const cs = getComputedStyle(c); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX)) { continue; } if (c.scrollWidth > c.clientWidth + 1 && c.clientWidth > 0) o.push('  '.repeat(d) + c.tagName + '.' + c.className + ' sw=' + c.scrollWidth + ' cw=' + c.clientWidth); walk(c, d + 1); } }; walk(document.body, 0); return o.slice(0, 25).join('\n'); })); }
 await b.close(); })();
