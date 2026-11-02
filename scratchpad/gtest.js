const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const W = +(process.argv[2] || 1360); const p = await b.newPage({ viewport: { width: W, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
 const go = async h => { await p.waitForTimeout(250); await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#' + h); await p.waitForTimeout(400); };
 const ovf = () => p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
 const bad = async tag => { const t = await p.evaluate(() => document.getElementById('main').innerText); const m = []; if (/\bNaN\b|undefined|\[object Object\]/.test(t)) m.push('bozuk metin'); if (await ovf()) m.push('taşma'); if (m.length) console.log('SORUN', tag, m.join(',')); };
 await go('karistirilanlar'); console.log('kart', (await p.$$('.kc-card')).length); await bad('karis'); await p.screenshot({ path: 'sh6/karis' + W + '.png', fullPage: true });
 await p.fill('#kcQ', 'ALLSELECTED'); await p.waitForTimeout(150); console.log('arama ALLSELECTED', (await p.$$('.kc-card')).length);
 const ids = await p.evaluate(() => window.PBI_CONFUSED.map(c => c.id)); let quizOk = 0, demoN = 0;
 for (const id of ids) { await go('karistirilanlar-' + id); await bad('karis ' + id); if (await p.$('.kc-demo table')) demoN++;
   const nq = await p.evaluate(id => window.PBI_CONFUSED.find(c => c.id === id).quiz.length, id);
   for (let j = 0; j < nq; j++) { if (j) { await p.click('[data-kcq="' + j + '"]'); await p.waitForTimeout(100); } const a = await p.evaluate(([id, j]) => window.PBI_CONFUSED.find(c => c.id === id).quiz[j].a, [id, j]); await p.click('[data-mc="' + a + '"]'); await p.waitForTimeout(60); if (await p.evaluate(k => window.PBI_CORE.P.ex[k], 'kq:' + id + ':' + j)) quizOk++; } }
 console.log('demo tablo', demoN, 'mini test doğru', quizOk);
 await go('karistirilanlar-' + ids[0]); await p.screenshot({ path: 'sh6/karis1' + W + '.png', fullPage: true });
 await go('hatalar'); console.log('hata satırı', (await p.$$('.mt-row')).length); await bad('hatalar');
 await p.fill('#mtQ', 'toplam'); await p.waitForTimeout(150); console.log('arama toplam', (await p.$$('.mt-row')).length); await p.screenshot({ path: 'sh6/hatalar' + W + '.png', fullPage: true });
 const tasks = await p.evaluate(() => window.PBI_MISTAKES.filter(m => m.task).map(m => m.id)); let tok = 0;
 for (const id of tasks) { await go('hatalar-' + id); await bad('hata ' + id); const t = await p.evaluate(id => window.PBI_MISTAKES.find(m => m.id === id).task, id);
   // önce bozuk ölçü kontrol: yanlış olmalı
   await p.click('[data-act="check"]'); await p.waitForTimeout(350); const o1 = await p.textContent('#out'); if (/Doğru/.test(o1)) console.log('BOZUK ÖLÇÜ DOĞRU SAYILDI', id);
   await p.fill('#daxEditor', t.sol); await p.click('[data-act="check"]'); await p.waitForTimeout(450); const o = await p.textContent('#out'); if (/Doğru/.test(o)) tok++; else console.log('GÖREV FAIL', id, o.slice(0, 140)); }
 console.log('görev', tok, '/', tasks.length); await go('hatalar-' + tasks[0]); await p.screenshot({ path: 'sh6/hata1' + W + '.png', fullPage: true });
 await go('kariyer'); await bad('iv'); console.log('iv soru', (await p.$$('.iv-q')).length);
 await p.click('[data-ivo]'); await p.waitForTimeout(100); await p.click('[data-ivr$=":3"]'); await p.waitForTimeout(100); await p.click('[data-ivrand="1"]'); await p.waitForTimeout(150); console.log('prova', !!(await p.$('.iv-rand')));
 await p.click('[data-ivrole="fabric"]'); await p.waitForTimeout(100); console.log('fabric', (await p.$$('.iv-list .iv-q')).length); await p.screenshot({ path: 'sh6/iv' + W + '.png', fullPage: true });
 for (const tb of ['star', 'vaka', 'elestiri', 'sor', 'canli']) { await p.click('[data-ivtab="' + tb + '"]'); await p.waitForTimeout(200); if (tb === 'vaka') { await p.click('.th-sol summary'); await p.waitForTimeout(100); } await bad('iv ' + tb); await p.screenshot({ path: 'sh6/iv-' + tb + W + '.png', fullPage: true }); }
 console.log('vaka ölçü değerleri', await p.$$eval('.th-sol td.numc', e => e.map(x => x.textContent).join(' | ')));
 // tekrar listesinde kq ve mt
 await p.evaluate(() => { const P = window.PBI_CORE.P; Object.keys(P.rv).filter(k => /^(kq|mt):/.test(k)).slice(0, 4).forEach(k => P.rv[k].d = '2000-01-01'); window.PBI_CORE.save(); });
 await go('tekrar'); await bad('tekrar'); await p.click('[data-rvgo]'); await p.waitForTimeout(400); console.log('tekrar açılan', await p.evaluate(() => window.PBI_CORE.state().id)); await bad('tekrar soru');
 // profil zayıf konular
 await go('ders-calculate'); await p.click('.steps button[data-step="1"]'); await p.waitForTimeout(200); await p.fill('#daxEditor', '42').catch(() => {}); if (await p.$('#daxEditor')) { await p.click('[data-act="check"]'); await p.waitForTimeout(300); } else { const bs = await p.$$('#mc button'); for (const x of bs) { await x.click(); await p.waitForTimeout(50); } }
 await go('profil'); console.log('zorlandığın', await p.$$eval('.litem.weak b', e => e.map(x => x.textContent))); await bad('profil');
 console.log('errors', errs.slice(0, 5)); await b.close(); })();
