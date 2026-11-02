const { chromium } = require('playwright');
(async () => {
  const [id, page, w, out, thru] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const p = await b.newPage({ viewport: { width: +w, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8765/index.html#dashboard-' + id, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  if (page && page !== '-') { const btn = await p.$('.dash-frame [data-dpage="' + page + '"]'); if (btn) { await btn.click(); await p.waitForTimeout(4000); } else errs.push('no page btn ' + page); }
  if (thru) { const m = await p.$('.dtile .dt-tools .chip.tp'); const tile = await p.$$('.dtile'); let done = false; for (const t of tile) { const h = await t.innerHTML(); if (h.includes('Detay sayfası') && !done) { const mk = await t.$('.dt-body [data-i]'); if (mk) { await mk.click({ button: 'right' }); done = true; } } } await p.waitForTimeout(4000); if (!done) errs.push('no thru'); }
  const fr = await p.$('.dash-frame'); 
  const sw = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  if (fr) await fr.screenshot({ path: out }); else await p.screenshot({ path: out, fullPage: true });
  console.log(JSON.stringify({ errs, sw }));
  await b.close();
})();
