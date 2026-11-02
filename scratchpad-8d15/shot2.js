const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const out = process.argv[2]; const only = process.argv[3] ? process.argv[3].split(',') : null;
  const views = only || ['', 'dersler', 'patikalar', 'test', 'studyo', 'lab', 'lab-kohort', 'dashboard-ozet', 'dashboard-rfm', 'dashboard-ekip', 'final', 'menuler', 'gorseller', 'puf', 'formuller', 'model', 'sozluk', 'ders-calculate', 'menu'];
  const sizes = process.argv[4] === 'm' ? [[400, 860, 'm', true]] : process.argv[4] === 'd' ? [[1360, 900, 'd', false]] : [[1360, 900, 'd', false], [400, 860, 'm', true]];
  for (const [w, h, tag, dark] of sizes) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light' });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
    for (const v of views) {
      const t0 = Date.now();
      await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#' + v); await p.waitForTimeout(v.startsWith('dash') || v === 'final' || v.startsWith('lab') ? 1800 : 500);
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (ov > 1) errs.push('overflow ' + v + ' ' + ov);
      const errBoxes = await p.evaluate(() => [...document.querySelectorAll('.msg.err')].map(e => e.textContent.slice(0, 120)));
      if (errBoxes.length) errs.push('ERRBOX ' + v + ': ' + errBoxes.join(' | '));
      await p.screenshot({ path: out + '/' + tag + '_' + (v || 'home') + '.png', fullPage: tag === 'd' });
      console.log(tag, v || 'home', (Date.now() - t0) + 'ms');
    }
    console.log(tag, JSON.stringify(errs, null, 1));
    await ctx.close();
  }
  await b.close();
})();
