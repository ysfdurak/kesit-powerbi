/* Power Query Lab ve M editörü tarayıcı testi: node scratchpad/mlab.js <genişlik> [ekran klasörü] */
const { chromium } = require('playwright'); const W = +process.argv[2] || 1280, SHOT = process.argv[3], PORT = process.env.PORT || 8771;
const P = process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
let bad = 0; const fail = m => { bad++; console.log('SORUN', m); };
(async () => {
  const b = await chromium.launch({ executablePath: P }); const c = await b.newContext({ viewport: { width: W, height: 900 } }); const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|ERR_FILE|404|ERR_TUNNEL/.test(m.text())) errs.push(m.text()); });
  const base = 'http://localhost:' + PORT + '/index.html';
  await p.goto(base + '#pq'); await p.waitForSelector('#pqHost .pqrib');
  const noScroll = async w => { const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (o > 1) fail(w + ' yatay taşma ' + o); };
  const txt = async s => (await p.textContent(s)).trim();
  await noScroll('lab');
  /* sekmeler */
  for (const t of ['Giriş', 'Dönüştür', 'Sütun ekle', 'Görünüm']) { const n = await p.locator('.pqtabs button', { hasText: t }).count(); if (!n) fail('sekme yok ' + t); }
  await p.click('[data-pqsrc="satis"]'); await p.waitForSelector('#pqHost .pqrib');
  await p.click('.pqtabs button:has-text("Görünüm")'); await p.check('[data-pqvo="d"]'); await p.check('[data-pqvo="p"]');
  if (!await p.locator('.pqd').count()) fail('dağılım satırı yok');
  await p.click('[data-pqcol="Tutar"]');
  const prof = await txt('.pqprof'); if (!/Standart sapma/.test(prof) || !/Boş/.test(prof)) fail('profil eksik: ' + prof.slice(0, 80));
  if (SHOT) await p.screenshot({ path: SHOT + '/lab-gorunum-' + W + '.png' });
  /* Sütun ekle: koşullu */
  await p.click('.pqtabs button:has-text("Sütun ekle")'); await p.click('[data-pqop="addCond"]');
  await p.fill('[data-pqf="v"]', '1000'); await p.fill('[data-pqf="then"]', 'Büyük'); await p.fill('[data-pqf="els"]', 'Küçük'); await p.click('[data-pq="ok"]');
  await p.waitForSelector('[data-pqcol="Koşullu"]');
  const fx = await txt('.pqfx code'); if (!fx.includes('if [Tutar] > 1000')) fail('koşullu M: ' + fx);
  /* null Tutar hücresi Error olmalı (if null) */
  if (!await p.locator('#pqHost .pqerr').count()) fail('null hücrede Error beklenirdi');
  await p.click('[data-pqcol="Tutar"]'); 
  /* Dizin ve özel sütun */
  await p.click('[data-pqop="addCustom"]'); await p.fill('[data-pqf="name"]', 'K'); await p.fill('[data-pqf="expr"]', 'Table.Foo(1)'); await p.click('[data-pq="ok"]');
  const e1 = await txt('#pqHost .pqleft'); if (!/Bu adım hata/.test(e1)) fail('bilinmeyen işlevde hata gösterilmedi');
  await p.click('.pqsteps li.bad .x, .pqsteps li:last-child .x');
  /* Gelişmiş düzenleyici → M editörü */
  await p.click('.pqtabs button:has-text("Görünüm")'); await p.click('[data-pq="advt"]');
  await p.click('[data-mq="fromlab"]'); await p.waitForSelector('#mOut .pqgrid');
  const code = await p.inputValue('#mFreeTa'); if (!code.includes('Kaynak = Satislar')) fail('fromlab kodu ' + code.slice(0, 60));
  /* Reset: lab adımlarını temizle */
  await p.evaluate(() => { window.PBI_CORE.P.pqFree = {}; });
  /* Örnekler ve hata türleri */
  for (let i = 0; i < 6; i++) { await p.click('[data-mq="sample"][data-i="' + i + '"]'); const o = await txt('#mOut'); if (/Söz dizimi|M hatası|Bu alt kümede yok|Durduruldu/.test(o)) fail('örnek ' + i + ': ' + o.slice(0, 120)); }
  const run = async s => { await p.fill('#mFreeTa', s); await p.click('[data-mq="run"]'); return txt('#mOut'); };
  if (!/Bu alt kümede yok/.test(await run('Table.Foo(1)'))) fail('desteklenmeyen işlev');
  if (!/Value.NativeQuery/.test(await run('Value.NativeQuery(1, "x")'))) fail('NativeQuery');
  if (!/Söz dizimi/.test(await run('let a = 1,\nin a'))) fail('söz dizimi');
  if (!/15/.test(await run('List.Sum({1..5})'))) fail('liste');
  await noScroll('M editör');
  if (SHOT) { await p.locator('#mFree').scrollIntoViewIfNeeded(); await p.screenshot({ path: SHOT + '/lab-m-' + W + '.png' }); }
  /* Ders: mcode alıştırması */
  const open = async (id, step) => { await p.evaluate(([id, step]) => { const C = window.PBI_CORE; C.go('lesson', id); }, [id, step]); await p.waitForTimeout(200); };
  const go = async (id, st) => { await p.evaluate(([id, st]) => { const C = window.PBI_CORE; C.go('lesson', id); C.setStep ? C.setStep(st) : (C.state().step = st, C.render()); }, [id, st]); await p.waitForTimeout(150); };
  await go('m-yaz', 0); if (!await p.locator('pre.m[data-run]').count()) fail('kod bloğu yok');
  await p.locator('.mrunb').first().click(); if (!/1200/.test(await p.locator('.mrunout').first().textContent())) fail('kod bloğu sonucu');
  await noScroll('ders m-yaz');
  await go('m-yaz', 2); await p.waitForSelector('#mTa');
  await p.click('[data-mq="check"]'); if (!await p.locator('#mRes .msg.err').count()) fail('yanlış sonuç reddedilmedi');
  await p.click('[data-act="hint"]'); if (!(await txt('#hintBox')).length) fail('ipucu yok');
  await p.fill('#mTa', 'Table.SelectRows(Satislar, each [Kategori] = "Elektronik")'); await p.click('[data-mq="check"]'); await p.waitForSelector('#mRes .msg.ok');
  const k = await p.evaluate(() => Object.keys(window.PBI_CORE.P.ex).filter(x => x.includes('m-yaz')).length); if (!k) fail('ilerleme kaydedilmedi');
  await noScroll('alıştırma');
  if (SHOT) await p.screenshot({ path: SHOT + '/ders-mcode-' + W + '.png' });
  /* must denetimi */
  await go('m-yapi', 2); await p.fill('#mTa', 'List.Sum(Aylik_Satis[Tutar])'); await p.click('[data-mq="check"]'); if (!await p.locator('#mRes .msg.ok').count()) fail('m-yapi 2');
  await go('m-tablo', 2); await p.fill('#mTa', '#table({"Bölge", "Oca"}, {{"Marmara", 1}})'); await p.click('[data-mq="check"]'); if (!await p.locator('#mRes .msg.err').count()) fail('sabit tablo geçti');
  await p.click('[data-mq="sol"]'); await p.click('[data-mq="usesol"]'); await p.click('[data-mq="check"]'); await p.waitForSelector('#mRes .msg.ok');
  /* pq alıştırması */
  await go('pq-pivot-devrik', 3); await p.waitForSelector('#pqHost .pqrib'); await p.click('[data-pq="sol"]'); await p.click('[data-pq="apply"]'); await p.click('[data-pq="check"]'); await p.waitForSelector('.msg.ok');
  /* Pratik ve Arena */
  await p.evaluate(() => window.PBI_CORE.go('pratikSoru', 'm-kdv')); await p.waitForSelector('#mTa'); await p.fill('#mTa', 'Table.AddColumn(Satislar, "KDVli", each [Tutar] * 1.2)'); await p.click('[data-mq="check"]'); if (!/türü/.test(await txt('#mRes'))) fail('tür denetimi: ' + await txt('#mRes'));
  await p.fill('#mTa', 'Table.AddColumn(Satislar, "KDVli", each [Tutar] * 1.2, type number)'); await p.click('[data-mq="check"]'); await p.waitForSelector('#mRes .msg.ok');
  await p.evaluate(() => { const C = window.PBI_CORE; location.hash = ''; }); 
  const arena = await p.evaluate(() => window.PBI_AR_CH.filter(c => c.t === 'mcode').map(c => c.id)); if (arena.length < 6) fail('arena m');
  console.log(W, 'SORUN', bad, 'hata', errs.length); errs.slice(0, 8).forEach(e => console.log(' ', e.slice(0, 200)));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
