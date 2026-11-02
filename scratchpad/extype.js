const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const W = +(process.argv[2] || 1360); const p = await b.newPage({ viewport: { width: W, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.addInitScript(() => { window.PBI_CERTQ = [
  { ex: 'pl300', id: 't1', k: 'Modelle', s: 'pl-dx2', type: 'multi', q: 'İki tane seç: `CALCULATE` hakkında doğru olanlar?', o: ['Filtre bağlamını değiştirir', 'Satır bağlamını filtreye çevirir', 'Yalnızca hesaplanmış sütunda çalışır', 'Her zaman tüm filtreleri siler'], a: [0, 1], why: 'açıklama burada yeterince uzun' },
  { ex: 'pl300', id: 't2', k: 'Modelle', s: 'pl-dm3', type: 'yesno', q: 'Senaryo: çift yönlü ilişki.', st: [{ t: 'Belirsizlik yaratabilir', a: true }, { t: 'Her zaman hızlıdır', a: false }, { t: 'CROSSFILTER ile ölçüde açılabilir', a: true }], why: 'açıklama burada yeterince uzun' },
  { ex: 'pl300', id: 't3', k: 'Veriyi hazırla', s: 'pl-tl4', type: 'order', q: 'Sırala', items: ['Kaynağa bağlan', 'Başlıkları yükselt', 'Özetlemeyi kaldır'], extra: ['Tabloyu sil'], why: 'açıklama burada yeterince uzun' },
  { ex: 'pl300', id: 't4', k: 'Modelle', s: 'pl-dx3', type: 'hot', q: 'Boşlukları doldur', code: 'Satış GY =\nCALCULATE([Net Satış], {0}(Tarih[{1}]))', slots: [{ o: ['SAMEPERIODLASTYEAR', 'PREVIOUSDAY', 'VALUES'], a: 0 }, { o: ['Tarih', 'Yil'], a: 0 }], why: 'açıklama burada yeterince uzun' }];
  window.PBI_CASES = [{ ex: 'pl300', id: 'case-x', title: 'Deneme AŞ: test', tabs: [['Genel bakış', 'Şirket satır.\n- madde bir\n- madde iki'], ['Gereksinimler', 'Gereksinim metni.']], qs: [{ k: 'Modelle', s: 'pl-dm2', q: 'Vaka sorusu 1?', o: ['a1', 'b22', 'c333', 'd4444'], a: 2, why: 'açıklama' }, { k: 'Modelle', s: 'pl-dm4', type: 'yesno', q: 'Vaka 2', st: [{ t: 'x ifadesi', a: true }, { t: 'y ifadesi', a: false }, { t: 'z', a: true }], why: 'a' }] }]; });
 await p.goto('http://localhost:8765/index.html#sinavlar'); await p.waitForTimeout(600);
 console.log('kartlar', await p.$$eval('.excard h3', e => e.map(x => x.textContent)));
 console.log('kapsam satırı', (await p.$$('.cov-t tr')).length, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1));
 await p.screenshot({ path: 'sh6/sinav' + W + '.png', fullPage: true });
 // madde çalışmasıyla tipleri dene: pl-dx2 multi
 const runSkill = async sid => { await p.goto('http://localhost:8765/index.html?x=' + Math.random() + '#sinavlar'); await p.waitForTimeout(400); await p.evaluate(s => window.PBI_EXAMUI.start('mad:' + s), sid); await p.waitForTimeout(300); };
 await runSkill('pl-dx2'); const EXs = () => p.evaluate(() => { const e = window.PBI_EXAMUI.cur(); return { n: e.qs.length, types: e.qs.map(q => q.x.type), cur: e.cur }; });
 console.log('dx2', JSON.stringify(await EXs()));
 // tüm soruları doğru cevapla
 const answerAll = async () => { const n = (await EXs()).n; for (let i = 0; i < n; i++) { const st = await p.evaluate(i => { const E = window.PBI_EXAMUI.cur(); return { x: E.qs[i].x, pool: E.qs[i].pool, inCase: E.inCase, cs: E.caseStart }; }, i);
   if (i > 0) { await p.click('[data-exq="' + i + '"]'); await p.waitForTimeout(120); if (await p.$('[data-excase="yes"]')) { await p.click('[data-excase="yes"]'); await p.waitForTimeout(150); } }
   const x = st.x;
   if (x.type === 'mc') await p.click('[data-exa="' + x.a + '"]');
   else if (x.type === 'multi') for (const j of x.a) await p.click('[data-exm="' + j + '"]');
   else if (x.type === 'yesno') for (let k = 0; k < x.st.length; k++) await p.click('[data-exy="' + k + ':' + x.st[k].a + '"]');
   else if (x.type === 'order') for (let k = 0; k < x.items.length; k++) await p.click('[data-exo="i' + k + '"]');
   else if (x.type === 'hot') for (let k = 0; k < x.slots.length; k++) await p.selectOption('[data-exh="' + k + '"]', String(x.slots[k].a));
   await p.waitForTimeout(80); } };
 await answerAll(); await p.click('[data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(300); console.log('sonuç', await p.textContent('.finish h2'));
 // karışık: tüm türleri bir kerede: özel sınav
 await p.evaluate(() => { const ui = window.PBI_EXAMUI; const pool = ui.certPool('pl300').filter(q => ['t1', 't2', 't3', 't4'].includes(q.id)); const d = { id: 'mad:test', fam: 'sertifika', cert: 'pl300', short: 'PL', name: 'Tip testi', qs: pool.concat(window.PBI_CASES[0].qs.map(q => Object.assign({ type: q.type || 'mc', k: q.k, s: q.s, q: q.q, o: q.o, a: q.a, st: q.st, why: q.why, caseRef: 'case-x' }))), n: 6, min: 10, pass: 70, adhoc: true }; });
 await runSkill('pl-dm3'); console.log('dm3', JSON.stringify(await EXs()));
 await p.screenshot({ path: 'sh6/yesno' + W + '.png', fullPage: true });
 // vaka içeren madde: pl-dm2 (yalnızca vaka sorusu) 
 await runSkill('pl-dm2'); console.log('dm2', JSON.stringify(await EXs())); await p.screenshot({ path: 'sh6/case' + W + '.png', fullPage: true });
 // sıralama ve hot: yanlış cevapla, sonuç ekranında inceleme
 await runSkill('pl-tl4'); console.log('tl4', JSON.stringify(await EXs())); const t3 = await p.evaluate(() => window.PBI_EXAMUI.cur().qs.findIndex(q => q.x.id === 't3'));
 if (t3 >= 0) { await p.click('[data-exq="' + t3 + '"]'); await p.waitForTimeout(100); await p.click('[data-exo="i1"]'); await p.click('[data-exo="i0"]'); await p.screenshot({ path: 'sh6/order' + W + '.png', fullPage: true }); }
 await p.click('[data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(300); console.log('order sonuç', await p.textContent('.finish h2')); await p.screenshot({ path: 'sh6/orderres' + W + '.png', fullPage: true });
 await runSkill('pl-dx3'); const t4 = await p.evaluate(() => window.PBI_EXAMUI.cur().qs.findIndex(q => q.x.id === 't4')); if (t4 >= 0) { await p.click('[data-exq="' + t4 + '"]'); await p.waitForTimeout(100); await p.selectOption('[data-exh="0"]', '1'); await p.screenshot({ path: 'sh6/hot' + W + '.png', fullPage: true }); }
 await p.click('[data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(300); await p.screenshot({ path: 'sh6/hotres' + W + '.png', fullPage: true });
 // tam deneme: vaka bölümü kilidi
 await p.goto('http://localhost:8765/index.html?x=1#sinavlar'); await p.waitForTimeout(400); await p.click('[data-exstart="pl300"]'); await p.waitForTimeout(300);
 const st = await p.evaluate(() => { const E = window.PBI_EXAMUI.cur(); return { n: E.qs.length, cs: E.caseStart, doms: E.qs.reduce((o, q) => (o[q.x.k] = (o[q.x.k] || 0) + 1, o), {}) }; }); console.log('tam', JSON.stringify(st));
 await p.click('[data-exq="' + st.cs + '"]'); await p.waitForTimeout(150); console.log('kilit uyarısı', !!(await p.$('[data-excase="yes"]'))); await p.click('[data-excase="yes"]'); await p.waitForTimeout(200);
 console.log('vakada', await p.evaluate(() => window.PBI_EXAMUI.cur().inCase), 'eski soru kapalı', await p.$eval('[data-exq="0"]', e => e.disabled)); await p.screenshot({ path: 'sh6/fullcase' + W + '.png', fullPage: true });
 await p.click('[data-extab="1"]'); await p.waitForTimeout(100); console.log('sekme', (await p.textContent('.case-txt')).slice(0, 40));
 await p.click('[data-exfin="ask"]'); await p.click('[data-exfin="yes"]'); await p.waitForTimeout(300); console.log('tam sonuç', await p.textContent('.finish h2')); await p.screenshot({ path: 'sh6/fullres' + W + '.png', fullPage: true });
 console.log('errors', errs); await b.close(); })();
