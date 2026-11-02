const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  for (const W of [1280, 390]) {
  const ctx = await b.newContext({ viewport: { width: W, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html#veriler'); await p.waitForTimeout(1000);
  const ids = await p.$$eval('.vd-card[data-id]', x => x.map(c => c.dataset.id)); console.log(W, 'cards', ids.join(','), 'ov', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  for (const id of ids) { await p.goto('http://localhost:8765/index.html#veriler-' + id); await p.waitForTimeout(700);
    await p.$$eval('details.vd-sec', ds => ds.forEach(d => d.open = true)); await p.waitForTimeout(200);
    const hb = await p.$$('[data-vdhint]'); if (hb[0]) { await hb[0].click(); await p.waitForTimeout(400); }
    const r = await p.evaluate(() => ({ h1: document.querySelector('main h1').textContent, tasks: document.querySelectorAll('.vd-task').length, exp: (document.querySelector('.vd-exp') || {}).textContent, ov: document.documentElement.scrollWidth - innerWidth, nan: /NaN|undefined/.test(document.getElementById('main').innerText) }));
    console.log(' ', id, JSON.stringify(r));
    if (W === 1280) { const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(() => null), p.click('[data-vddl]')]); console.log('   dl', dl ? dl.suggestedFilename() : 'YOK'); }
    const cb = await p.$('.vd-chk'); if (cb) { await cb.click(); await p.waitForTimeout(300); console.log('   ok saved', await p.evaluate(id => JSON.stringify(window.PBI_CORE.P.vd[id]).slice(0, 60), id)); } }
  console.log(' errs', errs); await ctx.close(); }
  await b.close(); })();
