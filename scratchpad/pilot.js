/* Pilot denetimi testi: node scratchpad/pilot.js <genişlik> (sunucu 8765 açıkken). Seviye testi, pilot özeti, yedek, sıfırlama, Türkçe İ ipucu, yükleme mesajı, vaka uyarısı. */
const { chromium } = require('playwright');
const W = +process.argv[2] || 1280;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const ctx = await b.newContext({ viewport: { width: W, height: 860 }, permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true }); const p = await ctx.newPage(); const errs = [], bad = [];
  const ok = (c, m) => { if (!c) bad.push(m); }; p.on('pageerror', e => errs.push(e.message));
  const reqs = new Set(); p.on('request', r => { const u = new URL(r.url()); if (u.host !== 'localhost:' + (process.env.PORT || 8771)) reqs.add(u.host); });
  const go = async h => { await p.goto('http://localhost:' + (process.env.PORT || 8771) + '/index.html?' + Math.random() + '#' + h); await p.waitForTimeout(450); };
  const over = async t => { const s = await p.evaluate(() => document.documentElement.scrollWidth); ok(s <= W + 1, 'taşma ' + t + ' ' + s); };
  /* Yeni kişi: Hemen başla, yanlış bir alıştırma sonrası Devam et */
  await go(''); await p.evaluate(() => localStorage.clear()); await go('');
  let hero = await p.textContent('.hero-main .btn.pri').catch(() => ''); console.log('yeni kişi:', hero.slice(0, 40));
  const ql = await p.evaluate(() => window.PBI_PLACEMENT.length);
  /* Seviye testi: sıra ve konum */
  const runTest = async pick => { await go('test'); const a = await p.$('[data-act="test-again"]'); if (a) { await a.click(); await p.waitForTimeout(150); } const order = [], posA = []; let score = 0;
    for (let i = 0; i < ql; i++) { const q = await p.textContent('.brief .q'); order.push(q); const tq = await p.$$eval('.mc button', x => x.map(e => +e.dataset.tq)); const correct = await p.evaluate(t => window.PBI_PLACEMENT.find(q => q.q === t).a, q); const pos = tq.indexOf(correct); posA.push(pos); const lv = await p.evaluate(t => window.PBI_PLACEMENT.find(q => q.q === t).lv, q); await p.click('.mc button:nth-child(' + (pick === 'A' ? 1 : pos + 1) + ')'); await p.waitForTimeout(25); if (pick === 'A' && pos === 0) score++; }
    await p.waitForTimeout(250); return { order, posA, score }; };
  const t1 = await runTest('A'); const t2 = await runTest('dogru');
  const c = [0, 0, 0, 0]; t1.posA.forEach(x => c[x]++); console.log('doğru konum', c, 'hepsine A', t1.score); ok(c.every(x => x === ql / 4), 'konum dengesi ' + c); ok(t1.order.join() !== t2.order.join(), 'soru sırası aynı'); ok(new Set(t1.order).size === ql, 'yinelenen soru');
  ok(/24\/24/.test(await p.textContent('main')), 'tam puan sonucu'); ok(/İlk testin: 6\/24/.test(await p.textContent('main')), 'ilk test notu');
  await p.waitForTimeout(250); let S = await p.evaluate(() => JSON.parse(localStorage.getItem('pbipatika.v1')).pilot); console.log('tests', JSON.stringify(S.tests)); ok(S.tests.length === 2 && S.tests[0].puan === 6 && S.tests[1].puan === 24, 'iki test'); ok(S.tests[1].seviye === 'ileri', 'seviye ' + S.tests[1].seviye);
  /* Tırnak: 25 test, ilk kalır */
  await p.evaluate(() => { const o = window.PBI_CORE.P; o.pilot.tests = Array.from({ length: 19 }, (_, i) => ({ tarih: '2026-11-01T0' + (i % 9) + ':00:' + String(i).padStart(2, '0') + 'Z', puan: 7, toplam: 24, seviye: 'temel' })).concat(o.pilot.tests); o.pilot.tests[0].puan = 1; });
  await runTest('A'); await p.waitForTimeout(250); S = await p.evaluate(() => JSON.parse(localStorage.getItem('pbipatika.v1')).pilot); ok(S.tests.length === 20 && S.tests[0].puan === 1, 'en fazla 20, ilk kalır ' + S.tests.length + ' ' + S.tests[0].puan); console.log('20 sınırı', S.tests.length, 'ilk puan', S.tests[0].puan); await over('test');
  /* Ders başlangıç, bitiş */
  await go('ders-ilk-olcu'); await p.waitForTimeout(250);
  const exs = await p.evaluate(() => window.PBI_LESSONS.find(l => l.id === 'ilk-olcu').ex.map(e => e.sol));
  for (let i = 0; i < exs.length; i++) { await p.click('.steps button[data-step="' + (i + 1) + '"]'); await p.waitForTimeout(150); await p.fill('#daxEditor', exs[i]); await p.click('[data-act="check"]'); await p.waitForTimeout(400); }
  /* Türkçe İ */
  await p.fill('#daxEditor', 'DİVİDE([Net Satış], "İptal") + FİLTER(Satislar, 1)'); await p.click('[data-act="check"]'); await p.waitForTimeout(300); let o = await p.textContent('#out'); console.log('ipucu:', o.slice(0, 190)); ok(/“DİVİDE” değil, “DIVIDE”/.test(o) && /“FİLTER” değil, “FILTER”/.test(o), 'İ ipucu'); ok(!/“İPTAL”|“İptal” değil/.test(o), 'metin içi'); ok((await p.inputValue('#daxEditor')).startsWith('DİVİDE'), 'ifade değişti');
  await go('studyo'); const ed = await p.$('#studioEd textarea, .ed-shell textarea, textarea'); if (ed) { await ed.fill('DİVİDE(1, 2)'); await p.click('[data-act="run"], [data-act="studio-run"], .ed-actions .btn.pri').catch(() => {}); await p.waitForTimeout(400); console.log('playground ipucu', /DIVIDE/.test(await p.textContent('main'))); }
  await p.waitForTimeout(300); S = await p.evaluate(() => JSON.parse(localStorage.getItem('pbipatika.v1')).pilot); ok(S.dersBaslangic['ilk-olcu'] && S.dersBitis['ilk-olcu'], 'ders zamanları'); console.log('ders', S.dersBaslangic['ilk-olcu'], S.dersBitis['ilk-olcu']);
  /* Profil */
  await go('profil'); await over('profil'); ok(/Pilot özeti/.test(await p.textContent('#pilotBox')), 'kutu'); await p.click('[data-act2="pilot-copy"]'); await p.waitForTimeout(200); const cp = JSON.parse(await p.evaluate(() => navigator.clipboard.readText())); console.log('özet', JSON.stringify(cp)); ok(JSON.stringify(Object.keys(cp)) === JSON.stringify(['uygulama', 'surum', 'tests', 'aktifDk', 'tamamlananDers', 'cozulenAlistirma', 'sonDers', 'enCokTakilinan']), 'özet şeması'); ok(cp.uygulama === 'kesit-powerbi' && cp.tamamlananDers >= 1 && cp.cozulenAlistirma >= 3, 'özet değer');
  await p.screenshot({ path: process.argv[3] + '/pilot-' + W + '.png' }); await p.$eval('#pilotBox', e => e.scrollIntoView()); await p.waitForTimeout(100); await p.screenshot({ path: process.argv[3] + '/pilot-box-' + W + '.png' });
  /* Aktif dakika: etkileşimli geçer, boşta durur */
  const before = await p.evaluate(() => window.PBI_CORE.P.pilot.aktifDk);
  await p.clock.install(); await p.goto('http://localhost:' + (process.env.PORT || 8771) + '/index.html?' + Math.random() + '#profil'); await p.clock.runFor(1000);
  const a0 = await p.evaluate(() => window.PBI_CORE.P.pilot.aktifDk);
  for (let i = 0; i < 6; i++) { await p.mouse.move(50 + i, 50); await p.clock.runFor(15000); await p.mouse.move(60 + i, 60); await p.clock.runFor(15000); }
  const a1 = await p.evaluate(() => window.PBI_CORE.P.pilot.aktifDk); await p.clock.runFor(600000); const a2 = await p.evaluate(() => window.PBI_CORE.P.pilot.aktifDk);
  console.log('aktif dk: başta', a0, '3 dk etkileşim sonra', a1, '10 dk boşta sonra', a2); ok(a1 - a0 >= 2 && a1 - a0 <= 3, 'aktif sayım'); ok(a2 - a1 <= 2, 'boşta sayıyor'); await ctx.close();
  /* Yedek birleştirme, sıfırlama */
  const c2 = await b.newContext({ viewport: { width: W, height: 860 }, acceptDownloads: true }); const q = await c2.newPage(); q.on('pageerror', e => errs.push(e.message)); const g2 = async h => { await q.goto('http://localhost:' + (process.env.PORT || 8771) + '/index.html?' + Math.random() + '#' + h); await q.waitForTimeout(450); };
  await g2(''); await q.evaluate(() => { const o = window.PBI_CORE.P; o.done = { 'ilk-olcu': true }; o.ex = { 'ilk-olcu:0': true }; o.xp = 5; o.testDone = { lv: null, total: 3, score: {}, at: '2026-10-01' }; delete o.pilot; }); await g2('profil');
  let e0 = await q.evaluate(() => window.PBI_CORE.P.pilot); console.log('eski kayıttan göç', JSON.stringify(e0.tests)); ok(e0.tests.length === 1 && e0.tests[0].puan === 3, 'göç');
  const merged = await q.evaluate(() => { const m = window.PBI_SYNC.merge(window.PBI_CORE.P, { xp: 1, pilot: { tests: [{ tarih: '2026-09-01T00:00:00Z', puan: 9, toplam: 24, seviye: 'temel' }, { tarih: '2026-10-01', puan: 3, toplam: 24, seviye: 'baslangic' }], aktifDk: 12, dersBaslangic: { 'ilk-olcu': '2026-01-01T00:00:00Z' }, dersBitis: {} } }); return m.pilot; }); console.log('birleşim', JSON.stringify(merged)); ok(merged.tests.length === 2 && merged.tests[0].puan === 9 && merged.aktifDk === 12, 'birleşim');
  const f = await q.evaluate(() => { const s = JSON.stringify({ app: 'kesit-powerbi', v: 3, date: '2026-11-04', data: { done: { 'ilk-olcu': true }, ex: {}, xp: 1, pilot: { tests: [{ tarih: '2026-09-01T00:00:00Z', puan: 9, toplam: 24, seviye: 'temel' }], aktifDk: 12, dersBaslangic: { yok: 'x', 'ilk-olcu': '2026-01-01T00:00:00Z' }, dersBitis: {} } } }); return s; });
  await q.setInputFiles('input[type=file]', { name: 'yedek.json', mimeType: 'application/json', buffer: Buffer.from(f) }); await q.waitForTimeout(500); let e1 = await q.evaluate(() => window.PBI_CORE.P.pilot); console.log('içe aktarma', JSON.stringify(e1)); ok(e1.tests.length === 2 && e1.tests[0].puan === 9 && e1.aktifDk === 12 && !e1.dersBaslangic.yok, 'içe aktarma');
  const [dl] = await Promise.all([q.waitForEvent('download', { timeout: 5000 }), q.click('[data-act="prog-export"]')]); const fs = require('fs'); const js = JSON.parse(fs.readFileSync(await dl.path(), 'utf8')); ok(js.data.pilot && js.data.pilot.tests.length === 2, 'dışa aktarma'); console.log('dışa aktarma pilot', !!js.data.pilot);
  await q.click('[data-act="reset-ask"]'); await q.waitForTimeout(100); await q.click('[data-act="reset-yes"]'); await q.waitForTimeout(300); e1 = await q.evaluate(() => window.PBI_CORE.P.pilot); ok(e1.tests.length === 0 && e1.aktifDk === 0, 'sıfırlama'); console.log('sıfırlama', JSON.stringify(e1));
  /* Devam et */
  await g2(''); console.log('sıfır:', (await q.textContent('.hero-main .btn.pri')).slice(0, 30)); ok(/Hemen başla/.test(await q.textContent('.hero-main .btn.pri')), 'sıfırda başla');
  await q.evaluate(() => { window.PBI_CORE.P.ex = { 'ilk-olcu:0': true }; }); await g2(''); const he = await q.textContent('.hero-main .btn.pri'); console.log('bir alıştırma:', he.slice(0, 30)); ok(/Devam et/.test(he), 'devam et');
  /* Vaka uyarısı */
  await g2('veriler'); ok(/yalnız Windows/.test(await q.textContent('main')) && /henüz gerçek Power BI Desktop/.test(await q.textContent('main')), 'liste notu'); const s1 = await q.evaluate(() => document.documentElement.scrollWidth); ok(s1 <= W + 1, 'veri taşma');
  await g2('veriler-lezzet-kurye'); ok(/yalnız Windows/.test(await q.textContent('main')), 'paket notu'); await q.screenshot({ path: process.argv[3] + '/vaka-' + W + '.png' });
  /* Yükleme mesajı: betik gecikince */
  const c3 = await b.newContext({ viewport: { width: W, height: 860 } }); const r = await c3.newPage(); await r.route('**/*.js', async rt => { await new Promise(s => setTimeout(s, 3000)); rt.continue(); }); r.goto('http://localhost:' + (process.env.PORT || 8771) + '/index.html', { waitUntil: 'commit' }).catch(() => {}); await r.waitForTimeout(1500); const bm = await r.textContent('#main').catch(() => ''); console.log('yavaş:', bm.slice(0, 60)); ok(/yükleniyor/.test(bm), 'yükleme mesajı'); await r.screenshot({ path: process.argv[3] + '/boot-' + W + '.png' }); await c3.close();
  console.log('dış istek', [...reqs].filter(h => !/fonts\.g/.test(h))); console.log('SORUN', bad.length, bad, 'hata', errs.slice(0, 5)); await b.close();
})();
