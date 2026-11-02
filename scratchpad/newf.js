const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const p = await (await b.newContext({ viewport: { width: 1360, height: 900 } })).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const go = async h => { await p.goto('http://localhost:8765/index.html?' + Math.random() + '#' + h); await p.waitForTimeout(600); };
  await go('dersler'); await p.fill('#currQ', 'kurulum'); await p.waitForTimeout(200); console.log('search kurulum', await p.$$eval('#currList [data-go="lesson"], #currList button', x => x.length));
  await p.fill('#currQ', 'baglam gecisi'); await p.waitForTimeout(200); console.log('fold', (await p.textContent('#currList')).includes('ağlam geçişi') || (await p.textContent('#currList')).slice(0,200));
  await go('ders-kurulum'); console.log('lesson h1', await p.textContent('main h1'));
  await p.click('.steps button[data-step="1"]'); await p.waitForTimeout(200); await p.keyboard.press('b'); await p.waitForTimeout(200); console.log('mc key', await p.$$eval('#mc button', x => x.map(b => b.className).join(',')));
  await go('ders-dax-giris'); const n = await p.$$eval('.steps button[data-step]', x => x.length);
  for (let s = 1; s < n; s++) { await p.click('.steps button[data-step="' + s + '"]'); await p.waitForTimeout(150); if (await p.$('#daxEditor')) break; }
  await p.fill('#daxEditor', '= SUM(Satislar[Tutar]; 1)'); await p.click('[data-act="check"]'); await p.waitForTimeout(400); console.log('errtip', await p.$$eval('.errtip', x => x.length));
  await p.focus('#daxEditor'); await p.keyboard.press('Escape'); console.log('esc active', await p.evaluate(() => document.activeElement.id));
  await go('dashboard'); console.log('det open', await p.$eval('.dpick-det', d => d.open)); await p.click('[data-dash="finans"]'); await p.waitForTimeout(800); console.log('det after', await p.$eval('.dpick-det', d => d.open), 'scrollY', await p.evaluate(() => scrollY), await p.$eval('.dash-card h2', x => x.textContent));
  console.log('aria', await p.$$eval('.dash-card svg.viz', x => x.slice(0, 3).map(s => s.getAttribute('aria-label'))));
  await go('sertifika'); console.log('cert list', await p.$$eval('main .card', x => x.length), (await p.textContent('main h1')));
  console.log('footer', !!(await p.$('.sitefoot')));
  await go('test'); console.log('test', (await p.textContent('main')).slice(0, 300));
  await p.evaluate(() => { localStorage.setItem('pbipatika.v1', '{"done":5,"xp":"x"}'); }); await go('home'); console.log('home ok', await p.$$eval('main h1, main h2', x => x.length));
  console.log('back', await (async () => { await go('home'); await p.click('[data-go="curr"]'); await p.waitForTimeout(300); await p.goBack(); await p.waitForTimeout(400); return p.evaluate(() => location.hash); })());
  console.log('errors', errs); await b.close();
})();
