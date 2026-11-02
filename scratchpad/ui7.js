const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const p = await (await b.newContext({ viewport: { width: 400, height: 900 } })).newPage();
await p.goto('http://localhost:8765/index.html#ders-kosullu-bicim'); await p.waitForTimeout(800);
console.log(await p.evaluate(() => { const t = document.getElementById('main').innerText; const i = t.indexOf('NaN'); return t.slice(i - 200, i + 80); }));
for (const [id, s] of [['ileri-kaliplar', 7], ['hiyerarsi', 7]]) { await p.goto('http://localhost:8765/index.html#ders-' + id); await p.waitForTimeout(700); await p.click('.steps button[data-step="' + s + '"]'); await p.waitForTimeout(300);
  const sol = await p.evaluate(([id, s]) => window.PBI_CORE.LMAP[id].ex[s - 1].sol, [id, s]); for (let h = 0; h < 3; h++) { const hb = await p.$('[data-act="hint"]:not([disabled])'); if (hb) { await hb.click(); await p.waitForTimeout(60); } } await p.fill('#daxEditor', sol); await p.click('[data-act="check"]'); await p.waitForTimeout(1500);
  console.log(id, await p.evaluate(() => { const ov = () => document.documentElement.scrollWidth - innerWidth > 1; let node = document.body, path = []; for (let d = 0; d < 30; d++) { let found = null; for (const c of node.children) { const old = c.style.display; c.style.display = 'none'; const ok = !ov(); c.style.display = old; if (ok) { found = c; break; } } if (!found) break; path.push(found.tagName + '.' + found.className + '#' + found.id); node = found; } return path.slice(-4).join(' > ') + ' :: ' + node.outerHTML.slice(0, 300); })); }
await b.close(); })();
