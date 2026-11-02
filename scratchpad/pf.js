const { chromium } = require('playwright');
const CFG = "window.KESIT_CONFIG={author:{name:'Örnek Ad',title:'Veri Analisti',bio:'Power BI üzerine çalışıyorum.',linkedin:'https://www.linkedin.com/in/ornek',github:'https://github.com/ornek',repo:'https://github.com/ornek/kesit-powerbi'},story:'Deneme hikâyesi.',license:'',sqlUrl:'https://ornek.github.io/kesit-sql/',feedbackFormUrl:'https://docs.google.com/forms/d/e/ABC/viewform?usp=pp_url&entry.1={ders}',giscus:{repo:'ornek/kesit-powerbi',repoId:'R_1',category:'Dersler',categoryId:'DIC_1'},goatcounter:'kesitpbi'};";
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/config.js', r => r.fulfill({ contentType: 'text/javascript', body: CFG }));
  await p.route('**giscus.app/**', r => r.fulfill({ contentType: 'text/javascript', body: "window.__gs=(window.__gs||0)+1;" }));
  await p.route('**gc.zgo.at/count.js', r => r.fulfill({ contentType: 'text/javascript', body: "window.goatcounter=Object.assign(window.goatcounter||{}, {count:function(v){(window.__gc=window.__gc||[]).push(v)}});" }));
  await p.route('**fonts.g**', r => r.abort());
  // GoatCounter yerelde kapalı; testte host kontrolünü atlamak için 127.0.0.1 yerine bir alias kullanılamıyor, o yüzden sayaç olaylarını ayrıca kontrol etmiyoruz
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1200);
  console.log('brand', await p.textContent('.side .brand b'), '| title', await p.title());
  console.log('doors', await p.$$eval('[data-kdoor]', x => x.map(b => b.dataset.kdoor).join(',')));
  await p.click('[data-kdoor="yeni"]'); await p.waitForTimeout(800); console.log('yeni ->', location = await p.evaluate(() => location.hash), await p.textContent('main h1'));
  console.log('lesson fb', !!(await p.$('main [data-kfb]')), 'giscus box', !!(await p.$('#gsBox')), 'gs script', await p.evaluate(() => { const s = document.querySelector('#gsBox script'); return s ? s.getAttribute('data-term') + '|' + s.getAttribute('data-repo') : 'yok'; }));
  await p.evaluate(() => { window.open = u => { window.__opened = u; }; }); await p.click('main [data-kfb]'); console.log('form', decodeURIComponent(await p.evaluate(() => window.__opened || '')));
  await p.click('.steps button[data-step="1"]'); await p.waitForTimeout(300); console.log('step1 giscus', !!(await p.$('#gsBox')));
  await p.fill('#daxEditor', 'SUM(Satislar[Tutar])'); await p.click('[data-act="check"]'); await p.waitForTimeout(500); console.log('ex1', (await p.textContent('#out')).slice(0, 30));
  await p.evaluate(() => { location.hash = ''; }); await p.waitForTimeout(600); console.log('doors after', await p.$$eval('[data-kdoor]', x => x.length));
  await p.evaluate(() => { location.hash = 'hakkinda'; }); await p.waitForTimeout(600); console.log('about', await p.textContent('main h1'), '|', await p.$$eval('.about-card h3', x => x.map(y => y.textContent).join(', ')));
  await p.evaluate(() => { location.hash = 'veriler'; }); await p.waitForTimeout(600); console.log('veriler', await p.textContent('main h1'), await p.$$eval('.vd-card', x => x.length));
  // yedek hatırlatma
  await p.evaluate(() => { const C = window.PBI_CORE; const ids = C.LESSONS.slice(0, 12).map(l => l.id); ids.forEach(id => C.P.done[id] = true); C.save(); location.hash = ''; }); await p.waitForTimeout(700);
  console.log('bkcard', !!(await p.$('.bkcard')));
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('.bkcard [data-act="prog-export"]')]); const f = await dl.path(); console.log('export', dl.suggestedFilename()); await p.waitForTimeout(500); console.log('bkcard after', !!(await p.$('.bkcard')));
  // birleştirme: yeni cihaz
  await p.evaluate(() => { const C = window.PBI_CORE; C.replaceProgress(Object.assign(C.FRESH(), { done: { 'calculate': true }, xp: 3, welcomed: true })); location.hash = 'profil'; }); await p.waitForTimeout(700);
  const inp = await p.$('[data-act="prog-import"]'); console.log('import input', !!inp); if (inp) { await inp.setInputFiles(f); await p.waitForTimeout(800); }
  console.log('merged done', await p.evaluate(() => Object.keys(window.PBI_CORE.P.done).length), 'calculate kept', await p.evaluate(() => !!window.PBI_CORE.P.done.calculate));
  await p.setViewportSize({ width: 390, height: 844 }); for (const h of ['', 'hakkinda', 'veriler', 'ders-ilk-olcu']) { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(600); console.log('mobil', h || 'home', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)); }
  await p.evaluate(() => { localStorage.clear(); location.hash = ''; }); await p.reload(); await p.waitForTimeout(1000); await p.screenshot({ path: 'pf_home_m.png' });
  console.log('errs', errs); await b.close(); })();
