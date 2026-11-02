const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + p.url() + ' ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type()==='warning') errs.push(m.type()+' ' + p.url() + ' ' + m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  const seen = new Set([''] ); const q = [''];
  let hrefs = await p.$$eval('a[href^="#"]', as => as.map(a => a.getAttribute('href')));
  const onclick = await p.$$eval('[data-go],[onclick]', as => as.slice(0,20).map(a => a.outerHTML.slice(0,120)));
  console.log('home hrefs', hrefs.length, [...new Set(hrefs)].slice(0,80).join(' '));
  console.log('onclick sample', onclick.slice(0,5));
  console.log('nav html', (await p.$eval('#nav', n => n.innerHTML.slice(0,1500))).replace(/\s+/g,' '));
  console.log(errs.join('\n'));
  await b.close();
})();
