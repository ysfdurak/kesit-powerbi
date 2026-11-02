const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const ctx = await b.newContext({ viewport: { width: 1360, height: 900 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  const go = async h => { await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#' + h); await p.waitForTimeout(700); };
  const errbox = async tag => { const e = await p.evaluate(() => [...document.querySelectorAll('.msg.err')].map(x => x.textContent.slice(0, 140))); if (e.length) errs.push(tag + ': ' + e.join(' | ')); };
  // Görseller: tüm görselleri, tüm sekmeleri gez, her seçeneği değiştir
  await go('gorseller');
  const ids = await p.$$eval('[data-vsel]', bs => bs.map(b => b.dataset.vsel));
  for (const id of ids) {
    await p.click('[data-vsel="' + id + '"]'); await p.waitForTimeout(150); await errbox('vis ' + id);
    for (const tab of ['build', 'fmt', 'an', 'gen']) {
      await p.click('[data-vstab="' + tab + '"]'); await p.waitForTimeout(60);
      const sws = await p.$$('#vsPane .sw'); for (const s of sws) { await s.click(); await p.waitForTimeout(40); }
      const sels = await p.$$('#vsPane select');
      for (let i = 0; i < sels.length; i++) { const s = (await p.$$('#vsPane select'))[i]; const opts = await s.$$eval('option', o => o.map(x => x.value)); for (const v of opts.slice(-2)) { await s.selectOption(v); await p.waitForTimeout(60); await errbox('vis ' + id + ' ' + tab + ' ' + v); } }
    }
    if (id === 'column') await p.screenshot({ path: out + '/i_vis_column.png' });
  }
  // decomp clicks
  await p.click('[data-vsel="decomp"]'); await p.waitForTimeout(150); await p.click('.dnode[data-lvl="1"][data-k="0"]'); await p.waitForTimeout(150); await p.click('.dnode[data-lvl="2"][data-k="1"]'); await p.waitForTimeout(150); await errbox('decomp'); await p.screenshot({ path: out + '/i_decomp.png' });
  // Dashboards
  const dids = await (async () => { await go('dashboard'); return p.$$eval('[data-dash]', bs => bs.map(b => b.dataset.dash).filter(Boolean)); })();
  for (const d of dids) {
    await go('dashboard-' + d); await p.waitForTimeout(1200); await errbox('dash ' + d);
    const sl = await p.$$('[data-dslb][data-scope="dash"]'); if (sl.length > 1) { await sl[1].click(); await p.waitForTimeout(1300); await errbox('dash slicer ' + d); }
    const mk = await p.$('.dtile[data-cross] .vmark[data-i]'); if (mk) { await mk.click(); await p.waitForTimeout(1300); await errbox('dash cross ' + d); }
    const dm = await p.$('[data-drill="mode"]'); if (dm) { await dm.click(); const m2 = await p.$('[data-drill="mode"]'); const tile = await m2.evaluateHandle(e => e.closest('.dtile')); const bar = await tile.$('.vmark[data-i]'); if (bar) { await bar.click(); await p.waitForTimeout(1300); await errbox('drill ' + d); } }
    await p.click('[data-insp]'); await p.waitForTimeout(200);
    if (d === 'ozet') await p.screenshot({ path: out + '/i_dash_drawer.png' });
    await p.keyboard.press('Escape');
    await p.click('[data-dtab="yapim"]'); await p.waitForTimeout(300); await errbox('build ' + d);
    if (d === 'ozet') await p.screenshot({ path: out + '/i_dash_build.png', fullPage: true });
  }
  // dropdown slicer rls
  await go('dashboard-ekip'); await p.click('[data-dtab="rapor"]').catch(() => {}); await p.waitForTimeout(1200);
  const dd = await p.$('select[data-dsl="viewAs"]'); if (dd) { const v = await dd.$$eval('option', o => o[1].value); await dd.selectOption(v); await p.waitForTimeout(1200); await errbox('rls'); await p.screenshot({ path: out + '/i_rls.png', fullPage: true }); }
  // Tricks
  await go('puf');
  const tids = await p.$$eval('[data-trick]', bs => bs.map(b => b.dataset.trick));
  for (const t of tids) { await p.click('[data-trick="' + t + '"]'); await p.waitForTimeout(250); await errbox('trick ' + t); }
  await p.click('[data-trick="drill"]'); await p.waitForTimeout(300); const dc = await p.$('[data-trdrill] .vmark[data-i]'); if (dc) { await dc.click(); await p.waitForTimeout(300); }
  await p.screenshot({ path: out + '/i_trick_drill.png' });
  await p.click('[data-trick="drillthrough"]'); await p.waitForTimeout(300); const dt = await p.$('[data-trthru] .vmark[data-i]'); if (dt) { await dt.click(); await p.waitForTimeout(300); } await errbox('drillthrough'); await p.screenshot({ path: out + '/i_trick_thru.png' });
  // Lab: every pattern
  await go('lab'); const lids = await p.$$eval('.llg [data-lab]', bs => bs.map(b => b.dataset.lab));
  for (const l of lids) { await p.click('.llg [data-lab="' + l + '"]'); await p.waitForTimeout(l === 'kohort' || l === 'rfm-sayi' || l === 'pvm' ? 1600 : 450); await errbox('lab ' + l); }
  await p.click('.llg [data-lab="pvm"]'); await p.waitForTimeout(1200); await p.hover('.lsteps li:nth-child(8)'); await p.screenshot({ path: out + '/i_lab_pvm.png', fullPage: true });
  // Final
  await go('final'); await p.waitForTimeout(1200); await p.check('[data-fin="1:0"]'); await p.click('.pagenav [data-finpage="urun"]'); await p.waitForTimeout(1300); await errbox('final'); await p.screenshot({ path: out + '/i_final.png', fullPage: true });
  // Menus
  await go('menuler'); await p.click('[data-mng="3"]'); await p.waitForTimeout(100); await p.screenshot({ path: out + '/i_menus.png' }); await p.fill('#mnQ', 'yer imi'); await p.waitForTimeout(150);
  // lesson + studio
  await go('ders-calculate'); await p.click('[data-step="2"]'); await p.fill('#daxEditor', 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal")'); await p.click('[data-act="check"]'); await p.waitForTimeout(200); errs.push('CHECK: ' + (await p.textContent('#out')).slice(0, 60));
  await go('test'); for (let i = 0; i < 24; i++) { await p.click('[data-tq="1"]'); await p.waitForTimeout(30); } await p.screenshot({ path: out + '/i_test.png' });
  console.log(JSON.stringify(errs, null, 1));
  await b.close();
})();
