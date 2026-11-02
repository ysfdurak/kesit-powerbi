const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const W = +(process.argv[2] || 1360); const p = await b.newPage({ viewport: { width: W, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.addInitScript(() => { window.PBI_SERIES = [{ ex: 'pl300', id: 'ser-t', k: 'Yönet ve güvenli hâle getir', s: 'pl-sg3', q: 'Senaryo: bölge müdürleri yalnızca kendi bölgelerini görmeli. Önerilen çözüm hedefi karşılıyor mu?', sols: [{ t: 'Statik rol', a: false, why: 'x' }, { t: 'Dinamik RLS', a: true, why: 'y' }, { t: 'Ayrı rapor', a: false, why: 'z' }] }, { ex: 'dp600', id: 'ser-d', k: 'Veriyi hazırla', s: 'dp-gd3', q: 'DP senaryo', sols: [{ t: 'Kısayol', a: true, why: 'a' }, { t: 'Kopya', a: false, why: 'b' }, { t: 'CSV', a: false, why: 'c' }] }]; window.PBI_CERT_CLASS = { 'pl300#0': ['alistirma', 'tanım'], 'pl300#1': ['alistirma', 'tanım'] }; });
 await p.goto('http://localhost:8765/index.html#sinavlar'); await p.waitForTimeout(600);
 console.log('aileler', await p.$$eval('.lvl-block h2', e => e.map(x => x.textContent).slice(0, 6)));
 await p.click('[data-exstart="pl300"]'); await p.waitForTimeout(300);
 const st = await p.evaluate(() => { const E = window.PBI_EXAMUI.cur(); return { n: E.qs.length, secs: E.secList, cls: E.qs.filter(q => q.x.cls !== 'sinav').length, les: E.qs.filter(q => q.x.fromLesson).length }; }); console.log('pl300', JSON.stringify(st));
 const s0 = st.secs[0], s1 = st.secs[1];
 // ana bölüm sonundan seriye geçiş onayı
 await p.click('[data-exq="' + s0.b + '"]'); await p.waitForTimeout(100); await p.click('.pager .btn.pri'); await p.waitForTimeout(100); console.log('onay', !!(await p.$('[data-exsec]'))); await p.click('[data-exsec="1"]'); await p.waitForTimeout(150);
 console.log('seri bölümünde', await p.evaluate(() => window.PBI_EXAMUI.cur().cur), 'ana kapalı', await p.$eval('[data-exq="0"]', e => e.disabled)); await p.screenshot({ path: 'sh6/series' + W + '.png', fullPage: true });
 await p.click('[data-exs="true"]'); await p.waitForTimeout(100); await p.click('.pager [data-exq="' + (s1.a + 1) + '"]'); await p.waitForTimeout(100);
 console.log('seride geri kapalı', await p.$eval('[data-exq="' + s1.a + '"]', e => e.disabled), await p.$eval('.pager .btn', e => e.disabled));
 await p.click('[data-exs="false"]'); await p.click('.pager .btn.pri'); await p.waitForTimeout(100); await p.click('[data-exs="true"]'); await p.click('.pager .btn.pri'); await p.waitForTimeout(100); await p.click('[data-exsec="2"]'); await p.waitForTimeout(150); console.log('vaka', !!(await p.$('.case-box')), await p.textContent('.sec-strip'));
 await p.screenshot({ path: 'sh6/seccase' + W + '.png', fullPage: true });
 await p.click('[data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(250); console.log('sonuç', await p.textContent('.finish h2'));
 await p.click('[data-exback="1"]'); await p.waitForTimeout(100); await p.click('[data-exstart="dp600"]'); await p.waitForTimeout(300);
 console.log('dp600', JSON.stringify(await p.evaluate(() => window.PBI_EXAMUI.cur().secList)), 'ilk soru vaka', !!(await p.$('.case-box')));
 await p.click('[data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(200); await p.click('[data-exback="1"]'); await p.waitForTimeout(100);
 // alıştırma
 await p.click('[data-exstart="pl300a"]'); await p.waitForTimeout(300); const pr = await p.evaluate(() => { const E = window.PBI_EXAMUI.cur(); return { n: E.qs.length, end: E.end, les: E.qs.filter(q => q.x.fromLesson).length }; }); console.log('alıştırma', JSON.stringify(pr), 'saat yok', !(await p.$('#exClock')));
 for (let i = 0; i < 3; i++) { const x = await p.evaluate(() => { const E = window.PBI_EXAMUI.cur(); return E.qs[E.cur].x; });
   if (x.type === 'mc') await p.click('[data-exa="' + ((x.a + 1) % x.o.length) + '"]'); else if (x.type === 'multi') await p.click('[data-exm="' + x.a[0] + '"]'); else if (x.type === 'yesno') for (let k = 0; k < x.st.length; k++) await p.click('[data-exy="' + k + ':true"]'); else if (x.type === 'order') await p.click('[data-exo="i0"]'); else if (x.type === 'hot') for (let k = 0; k < x.slots.length; k++) await p.selectOption('[data-exh="' + k + '"]', '0'); else if (x.type === 'serq') await p.click('[data-exs="true"]');
   await p.click('[data-excheck="1"]'); await p.waitForTimeout(120); console.log(' kontrol', x.type, (await p.textContent('.brief .msg')).slice(0, 50)); if (i === 0) await p.screenshot({ path: 'sh6/prac' + W + '.png', fullPage: true }); await p.click('.pager [data-exq="' + (i + 1) + '"]'); await p.waitForTimeout(100); }
 await p.click('[data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(200); console.log('alıştırma sonuç', await p.textContent('.finish h2'));
 await p.click('[data-exback="1"]'); await p.waitForTimeout(100); await p.evaluate(() => window.PBI_EXAMUI.start('mad:pl-sg3')); await p.waitForTimeout(200); console.log('madde', await p.evaluate(() => { const E = window.PBI_EXAMUI.cur(); return E.def.practice + ' ' + E.qs.length + ' ' + E.qs.map(q => q.x.type).join(','); }));
 console.log('errors', errs); await b.close(); })();
