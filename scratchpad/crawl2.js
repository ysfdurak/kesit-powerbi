const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const W = +(process.argv[2] || 1360);
  const ctx = await b.newContext({ viewport: { width: W, height: 900 } });
  const p = await ctx.newPage(); const issues = []; let where = '';
  p.on('pageerror', e => issues.push('PAGEERR @' + where + ': ' + e.message));
  const scan = async tag => { const r = await p.evaluate(() => { const m = document.getElementById('main'); const t = m.innerText; const bad = []; if (/\bNaN\b/.test(t)) bad.push('NaN'); if (/\bundefined\b/.test(t)) bad.push('undefined'); if (/\[object Object\]/.test(t)) bad.push('[object Object]'); const errs = [...m.querySelectorAll('.msg.err')].map(x => x.textContent.slice(0, 120)); if (errs.length) bad.push('ERRBOX ' + errs.join(' | ')); const ov = document.documentElement.scrollWidth - innerWidth; if (ov > 1) bad.push('overflow ' + ov); return bad; }); r.forEach(x => issues.push(tag + ': ' + x)); };
  const go = async h => { where = h; await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#' + h); await p.waitForTimeout(500); };
  const lessons = await (async () => { await go('dersler'); return p.evaluate(() => window.PBI_CORE.LESSONS.map(l => l.id)); })();
  for (const id of lessons) {
    await go('ders-' + id); await scan('ders ' + id);
    const n = await p.$$eval('.steps button[data-step]', x => x.length);
    for (let s = 1; s < n; s++) {
      await p.click('.steps button[data-step="' + s + '"]'); await p.waitForTimeout(120); where = id + '#' + s;
      const ex = await p.evaluate(([id, s]) => { const l = window.PBI_CORE.LMAP[id]; const e = l.ex[s - 1]; return { t: e.t, a: e.a, sol: e.sol }; }, [id, s]);
      if (ex.t === 'pq') { await p.click('[data-act="hint"]'); await p.click('[data-pq="sol"]'); await p.click('[data-pq="apply"]'); await p.click('[data-pq="check"]'); await p.waitForTimeout(200); const o = await p.textContent('.pqwrap .msg.ok, .pqwrap .msg.err').catch(() => ''); if (!/Doğru/.test(o)) issues.push('PQ not accepted ' + id + '#' + s + ': ' + o.slice(0, 100)); }
      else if (ex.t === 'mc') { await p.click('[data-mc="' + ex.a + '"]'); await p.waitForTimeout(80); const ok = await p.$eval('[data-mc="' + ex.a + '"]', x => x.className); if (!/right/.test(ok)) issues.push('MC not right ' + id + '#' + s); }
      else { for (let h = 0; h < 3; h++) { const hb = await p.$('[data-act="hint"]:not([disabled])'); if (hb) { await hb.click(); await p.waitForTimeout(40); } } console.error('CHK', id + '#' + s); await p.fill('#daxEditor', ex.sol); await p.click('[data-act="check"]'); await p.waitForTimeout(ex.t === 'query' ? 600 : 400); const o = await p.textContent('#out').catch(() => ''); if (!/Doğru/.test(o)) issues.push('DAX not accepted ' + id + '#' + s + ': ' + o.slice(0, 120)); }
      await scan(id + '#' + s);
    }
  }
  for (const v of ['', 'patikalar', 'dersler', 'test', 'studyo', 'pq', 'lab', 'dashboard', 'final', 'menuler', 'gorseller', 'puf', 'formuller', 'model', 'sozluk', 'menu']) { await go(v); await scan('view ' + v); }
  const paths = await p.evaluate(() => window.PBI_PATHS.map(x => x.id)); for (const id of paths) { await go('patika-' + id); await scan('path ' + id); }
  const pats = await p.evaluate(() => window.PBI_PATTERNS.map(x => x.id)); for (const id of pats) { await go('lab-' + id); await p.waitForTimeout(400); await scan('lab ' + id); }
  const dashes = await p.evaluate(() => window.PBI_DASHES.map(x => x.id));
  for (const id of dashes) { await go('dashboard-' + id); await p.waitForTimeout(900); await scan('dash ' + id);
    const empt = await p.evaluate(() => [...document.querySelectorAll('.dtile')].filter(t => { const bd = t.querySelector('.dt-body'); return bd && (!bd.innerText.trim() && !bd.querySelector('svg,img')) ; }).map(t => (t.querySelector('h3') || {}).textContent)); if (empt.length) issues.push('dash ' + id + ' boş kutucuk: ' + empt.join(', '));
    const emp2 = await p.evaluate(() => [...document.querySelectorAll('.dtile .empty')].map(e => e.closest('.dtile').querySelector('h3').textContent + ': ' + e.textContent.slice(0, 60))); if (emp2.length) issues.push('dash ' + id + ' "veri yok": ' + emp2.join(' | '));
    const how = await p.$('button:has-text("Nasıl yapıldı")'); if (how) { await how.click(); await p.waitForTimeout(300); await scan('dash-how ' + id); } }
  const tricks = await p.evaluate(() => window.PBI_TRICKS.map(x => x.id)); await go('puf');
  for (const id of tricks) { where = 'trick ' + id; const sel = '[data-trick="' + id + '"]'; if (await p.$(sel)) { await p.click(sel); await p.waitForTimeout(250); await scan('trick ' + id); await p.click(sel); await p.waitForTimeout(100); } }
  const extraPages = ['alistirma', 'tekrar', 'profil', 'sinavlar', 'pq', 'patikalar', 'arena', 'arena-liste', 'arena-hiz', 'arena-tahmin', 'arena-bulmaca', 'arena-turnuva', 'stüdyo', 'model', 'formuller', 'sozluk', 'karistirilanlar', 'hatalar', 'kariyer'];
  const arIds = await p.evaluate(() => [].concat(window.PBI_AR_CH.map(c => 'arena-ch-' + c.id), window.PBI_AR_PZ.map(z => 'arena-pz-' + z.id), window.PBI_AR_DET.map(d => 'arena-det-' + d.id), window.PBI_PRACTICE.map(x => 'gorev-' + x.id), window.PBI_CONFUSED.map(x => 'karistirilanlar-' + x.id), window.PBI_MISTAKES.filter(x => x.task).map(x => 'hatalar-' + x.id)));
  for (const tb of ['banka', 'star', 'vaka', 'elestiri', 'sor', 'canli']) { await go('kariyer'); await p.click('[data-ivtab="' + tb + '"]'); await p.waitForTimeout(200); await scan('kariyer ' + tb); }
  for (const h of extraPages.concat(arIds)) { await go(h); await scan(h); }
  console.log(issues.length + ' issues'); console.log(issues.join('\n'));
  await b.close();
})();
