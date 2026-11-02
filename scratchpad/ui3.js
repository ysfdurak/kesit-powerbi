const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  for (const W of [1360, 400]) {
  const p = await (await b.newContext({ viewport: { width: W, height: 900 } })).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const go = async h => { await p.goto('http://localhost:8765/index.html?' + Math.random() + '#' + h); await p.waitForTimeout(700); };
  const ov = () => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await go('puf'); console.log(W, 'tricks', await p.$$eval('.tcard', x => x.length), 'ov', await ov());
  await p.fill('#trQ', 'katlama'); await p.waitForTimeout(200); console.log(' search katlama', await p.$$eval('.tcard', x => x.length));
  await p.fill('#trQ', ''); await p.click('[data-trlv="ileri"]'); await p.waitForTimeout(200); console.log(' ileri', await p.$$eval('.tcard', x => x.length));
  const first = await p.$('.tcard [data-trick]'); await first.click(); await p.waitForTimeout(500); console.log(' open ok', !!(await p.$('.tc-body')));
  await go('karisanlar'); console.log(' karis main', (await p.textContent('main')).slice(0, 80).replace(/\s+/g,' '));
  await go('kariyer'); console.log(' iv', await p.$$eval('.iv-q', x => x.length), 'ov', await ov());
  await p.fill('#ivQ', 'Direct Lake'); await p.waitForTimeout(700); console.log(' iv search', await p.$$eval('.iv-q', x => x.length), await p.evaluate(() => document.activeElement.id));
  await p.fill('#ivQ', ''); await p.waitForTimeout(700);
  await p.click('[data-ivst="yeni"]'); await p.waitForTimeout(300); console.log(' iv yeni', await p.$$eval('.iv-q', x => x.length));
  const tabs = await p.$$eval('[data-ivtab]', x => x.map(b => b.dataset.ivtab)); console.log(' tabs', tabs.join(','));
  const th = tabs.find(t => /ev|odev|take/i.test(t)); if (th) { await p.click('[data-ivtab="' + th + '"]'); await p.waitForTimeout(400); const ks = await p.$$eval('[data-ivth]', x => x.map(b => b.dataset.ivth)); console.log(' takehome', ks.join(',')); if (ks[1]) { await p.click('[data-ivth="' + ks[1] + '"]'); await p.waitForTimeout(400); console.log(' th title', (await p.textContent('.th-brief h3'))); } console.log(' ov', await ov()); }
  await go('ders-genisletilmis-tablolar'); console.log(' new lesson', await p.textContent('main h1'), 'steps', await p.$$eval('.steps button[data-step]', x => x.length), 'ov', await ov());
  await go('ders-pencere'); console.log(' pencere steps', await p.$$eval('.steps button[data-step]', x => x.length), 'deep', await p.$$eval('section.deep', x => x.length));
  await go('patika-gelistirici'); console.log(' path text has coka-cok', (await p.content()).includes('Çoka çok'));
  console.log(' errors', errs);
  }
  await b.close();
})();
