/* mval.js ikinci bölüm: Lab komutlarının M kodu, derslerdeki M kod blokları, mcode alıştırmaları */
const fs = require('fs');
module.exports = function (say, M, APP) {
  const html = fs.readFileSync(APP + 'index.html', 'utf8');
  const list = [...html.matchAll(/src="([^"]+)\.js"/g)].map(m => m[1]);
  const UI = ['app', 'pq', 'practice', 'examui', 'arena', 'guides', 'career', 'sync', 'portfolio', 'vdata', 'pages'];
  for (const f of list) { if (UI.includes(f) || f === 'mengine') continue; try { require(APP + f + '.js'); } catch (e) { console.log('yükleme uyarısı', f, e.message); } }
  const Q = window.PBI_PQ, S = (op, cols, x) => Object.assign({ op, cols: cols || [] }, x || {});
  /* 3. Her Lab komutu: Lab motorunun sonucu ile üretilen M kodunun yorumlayıcıdaki sonucu aynı olmalı */
  const SC = [
    ['bayi', [S('removeTop', [], { n: 1 }), S('promote'), S('removeCols', ['Not']), S('trim', ['Şehir']), S('upper', ['Şehir']), S('replace', ['Tutar'], { find: '-', repl: 'null', whole: true }), S('removeBlank'), S('distinct'), S('type', ['Tutar'], { to: 'number' }), S('type', ['Tarih'], { to: 'date' }), S('replaceErr', ['Tutar'], { v: '0' }), S('removeErrors', ['Tarih'])]],
    ['bayi', [S('removeTop', [], { n: 1 }), S('promote'), S('keepCols', ['Bayi', 'Şehir']), S('lower', ['Şehir']), S('proper', ['Bayi'])]],
    ['bayi', [S('removeTop', [], { n: 1 }), S('promote'), S('filter', ['Şehir'], { cmp: 'contains', v: 'ank' })]],
    ['bayi', [S('removeTop', [], { n: 1 }), S('promote'), S('filter', ['Bayi'], { cmp: 'notnull' })]],
    ['urun', [S('fillDown', ['Kategori']), S('split', ['Ürün Kodu ve Adı'], { d: ' ', mode: 'first' }), S('rename', ['Ürün Kodu ve Adı.1'], { to: 'Kod' }), S('group', ['Kategori'], { name: 'Ort', agg: 'avg', src: 'Fiyat' })]],
    ['urun', [S('split', ['Ürün Kodu ve Adı'], { d: ' ', mode: 'each' })]],
    ['hedef', [S('unpivot', ['Kategori']), S('rename', ['Öznitelik'], { to: 'Ay' }), S('group', ['Kategori'], { name: 'Top', agg: 'sum', src: 'Değer' })]],
    ['hedef', [S('group', ['Kategori'], { name: 'N', agg: 'count' })]],
    ['musteri', [S('promote'), S('type', ['MusteriNo'], { to: 'int' }), S('lower', ['E-posta']), S('distinct', ['MusteriNo']), S('filter', ['E-posta'], { cmp: 'notnull' })]],
    ['bayi_sub', [S('append', [], { with: 'bayi_sub' })]],
    ['bayi_sub', [S('merge', ['Şehir'], { with: 'sehir_bolge', kind: 'left' })]],
    ['bayi_sub', [S('merge', ['Şehir'], { with: 'sehir_bolge', kind: 'inner' })]],
    ['bayi_sub', [S('merge', ['Şehir'], { with: 'sehir_bolge', kind: 'anti' })]],
    ['satis', [S('keepTop', [], { n: 5 }), S('sort', ['Tutar'], { order: 'desc' }), S('reverse'), S('removeBottom', [], { n: 1 })]],
    ['satis', [S('addCustom', [], { name: 'KDVli', expr: '[Tutar] * 1.2', to: 'number' }), S('addCond', ['Tutar'], { name: 'Boy', cmp: '>', v: '1000', then: 'Büyük', els: 'Küçük' }), S('addIndex', [], { name: 'Sıra', start: 1, step: 1 }), S('dupCol', ['Şehir'])]],
    ['satis', [S('mergeCols', ['Şehir', 'Kategori'], { name: 'Etiket', d: ' / ' }), S('mergeCols', ['Şehir', 'Adet'], { name: 'E2', d: '-' }), S('textCol', ['Şehir'], { what: 'first', n: '3', name: 'Kısa' }), S('textCol', ['Şehir'], { what: 'len', name: 'Uz' })]],
    ['satis', ['add', 'mul', 'div', 'sub', 'idiv', 'mod', 'pct', 'round', 'up', 'down', 'abs', 'sq', 'sqrt'].map((w, i) => S('numOp', ['Tutar'], { what: w, v: '3', name: 'N' + i }))],
    ['satis', ['year', 'month', 'quarter', 'day', 'dow', 'week', 'monthName', 'dayName', 'som', 'eom', 'soy'].map((w, i) => S('dateOp', ['Tarih'], { what: w, name: 'T' + i }))],
    ['satis', [S('keepBottom', [], { n: 4 }), S('keepRange', [], { first: 2, n: 2 })]],
    ['aylik', [S('keepDups', ['Bölge'])]],
    ['satis', [S('removeAlt', [], { first: 2, rm: 1, keep: 1 })]],
    ['urun', [S('fillUp', ['Kategori'])]],
    ['hedef', [S('unpivotSel', ['Oca', 'Şub'])]],
    ['satis', [S('prefix', ['Şehir'], { mode: 'pre', x: 'TR-' }), S('prefix', ['Kategori'], { mode: 'suf', x: ' (K)' }), S('extract', ['Şehir'], { what: 'first', n: '5' }), S('mergeT', ['Şehir', 'Kategori'], { name: 'E', d: '/' })]],
    ['satis', [S('dateSub', ['Tarih'], { ref: '31.03.2024', name: 'Kalan' })]],
    ['urun', [S('fromEx', ['Ürün Kodu ve Adı'], { ex1: 'E01', name: 'Kod' })]],
    ['satis', [S('fromEx', ['Tarih'], { ex1: '2024', name: 'Yıl' })]],
    ['aylik', [S('pivot', ['Ay'], { val: 'Tutar', agg: 'sum' })]],
    ['aylik', [S('pivot', ['Ay'], { val: 'Tutar', agg: 'none' })]],
    ['aylik', [S('demote'), S('transpose')]],
    ['musteri', [S('detect')]],
    ['musteri', [S('promote'), S('detect')]],
  ];
  const used = new Set(); let labN = 0;
  for (const [id, steps] of SC) {
    const src = Q.SOURCES[id]; const qn = src.qn || M.QN[id]; const r = Q.run(src, steps);
    steps.forEach(s => used.add(s.op));
    const nm = id + ': ' + steps.map(s => s.op).join(',');
    if (r.error) { say(false, 'Lab adımı hata verdi ' + nm, r.error.msg); continue; }
    const code = Q.mCode({ m: qn }, r.states); const m = M.run(code); labN++;
    if (!m.ok) { say(false, 'Üretilen M çalışmadı ' + nm, M.errorText(m) + '\n' + code); continue; }
    const c = M.compareResult(m.value, r.table, { ordered: true }); say(c.ok, 'Lab ve M farklı ' + nm, c.msg + '\n' + code);
  }
  const missing = Object.keys(Q.OPS).filter(k => !used.has(k)); say(!missing.length, 'Çapraz denetimi olmayan komut', missing.join(','));
  /* Lab önizleme kodu da üretilebilmeli: alıştırma çözümleri M olarak da aynı sonucu versin */
  let exN = 0; const allEx = window.PBI_LESSONS.flatMap(l => (l.ex || []).map(e => ({ e, w: l.id }))).concat((window.PBI_PRACTICE || []).map(e => ({ e, w: 'pratik ' + e.id })));
  for (const { e, w } of allEx) { if (e.t !== 'pq') continue; const src = Q.SOURCES[e.src], qn = src.qn || M.QN[e.src]; const all = (e.pre || []).concat(e.sol); const r = Q.run(src, all); if (r.error) { say(false, 'pq çözümü hata ' + w, r.error.msg); continue; } const m = M.run(Q.mCode({ m: qn }, r.states)); exN++; if (!m.ok) { say(false, 'pq çözümünün M kodu çalışmadı ' + w, M.errorText(m)); continue; } const c = M.compareResult(m.value, r.table, { ordered: true }); say(c.ok, 'pq çözümü Lab ve M farklı ' + w, c.msg); }
  [['veri-baglantilari', 'ERP ve kurumsal'], ['fabric-data-factory', 'SSIS'], ['aile', 'Tableau'], ['copilot', 'Copilot ile model']].forEach(([id, w]) => { const l = window.PBI_LESSONS.find(z => z.id === id); say(l && l.body.includes(w), 'Köprü bölümü yok ' + id); });
  /* 4. Ders kod blokları ve mcode alıştırmaları */
  const dec = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  let blocks = 0, skipped = 0;
  for (const l of window.PBI_LESSONS) { for (const m of String(l.body || '').matchAll(/<pre class="m"( data-notry)?( data-run)?[^>]*>([\s\S]*?)<\/pre>/g)) { if (!m[2]) { skipped++; continue; } blocks++; const r = M.run(dec(m[3])); say(r.ok, 'Ders kod bloğu çalışmadı ' + l.id, M.errorText(r) + '\n' + dec(m[3])); } }
  const mcodes = allEx.filter(x => x.e.t === 'mcode'); const seen = new Set(); const qs = new Set();
  const QU = (window.PBI_AR_CH || []).filter(c => c.t === 'mcode');
  for (const { e, w } of mcodes.concat(QU.map(e => ({ e, w: 'ek ' + (e.id || '') })))) {
    if (!e.sol || !e.q) { say(false, 'mcode eksik alan ' + w); continue; }
    const r = M.run(e.sol); say(r.ok, 'mcode çözümü çalışmadı ' + w, M.errorText(r) + '\n' + e.sol); if (!r.ok) continue;
    (e.must || []).forEach(f => say(e.sol.includes(f), 'must çözümde yok ' + w, f));
    say(!seen.has(e.sol), 'mcode çözümü yinelenmiş ' + w); seen.add(e.sol);
    say(!qs.has(e.q), 'mcode sorusu yinelenmiş ' + w); qs.add(e.q);
    if (e.start != null) { const s = M.run(e.start); if (s.ok) { const c = M.compareResult(s.value, r.value, { ordered: !!e.ordered, types: !!e.types }); say(!c.ok, 'Başlangıç kodu zaten çözüm ' + w); } }
    if (e.bad) e.bad.forEach(b => { const s = M.run(b); if (s.ok) { const c = M.compareResult(s.value, r.value, { ordered: !!e.ordered, types: !!e.types }); say(!c.ok, 'Yanlış örnek çözüm gibi geçti ' + w, b); } });
  }
  console.log('Lab ve M çapraz senaryo: ' + labN + ', pq çözümü: ' + exN + ', komut: ' + used.size + '/' + Object.keys(Q.OPS).length + ', ders kod bloğu çalıştırılan: ' + blocks + ' (salt okunur ' + skipped + '), mcode: ' + mcodes.length);
};
