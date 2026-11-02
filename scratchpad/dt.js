const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: +(process.env.W || 1360), height: 900 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
 const ids = process.argv.slice(2);
 await p.goto('http://localhost:8765/index.html#dashboard'); await p.waitForTimeout(600);
 const all = ids.length ? ids : await p.evaluate(() => window.PBI_DASHES.map(d => d.id));
 for (const id of all) { await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#dashboard-' + id); await p.waitForTimeout(900);
   const pages = await p.evaluate(id => window.PBI_DASHCORE.pagesOf(window.PBI_DASHES.find(d => d.id === id)).map(x => x.id), id);
   for (const pg of pages) { const btn = await p.$('[data-dpage="' + pg + '"]'); if (btn) { await btn.click(); await p.waitForTimeout(700); }
     await p.waitForFunction(() => !document.querySelector('.dgrid2.busy'), null, { timeout: 30000 }).catch(() => {}); const r = await p.evaluate(() => { const g = document.querySelector('.dgrid2'); const tm = (document.querySelector('.dtime') || {}).textContent; const t = g ? g.innerText : ''; return { tiles: document.querySelectorAll('.dgrid2 .dtile').length, err: [...document.querySelectorAll('.dgrid2 .msg.err')].map(e => e.textContent.slice(0, 120)), tm, nan: /NaN|undefined|\[object/.test(t), ov: document.documentElement.scrollWidth - innerWidth }; });
     console.log(id, pg, JSON.stringify(r)); }
   const bms = await p.$$('[data-dbm]'); for (let i = 0; i < Math.min(bms.length, 6); i++) { const bb = (await p.$$('[data-dbm]'))[i]; if (!bb) break; await bb.click(); await p.waitForTimeout(500); const e2 = await p.evaluate(() => [...document.querySelectorAll('.dgrid2 .msg.err')].length); if (e2) console.log(id, 'bookmark', i, 'ERR'); }
 }
 console.log('pageerrors', errs); await b.close(); })();
