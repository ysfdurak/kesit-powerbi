// Görsel ve model kurma alıştırmalarının doğrulayıcısı: her çözüm hesaplanır ve kendi denetiminden geçer;
// tipik yanlışlar (yanlış tür, sırasız, filtresiz, ters ilişki, eksik ilişki) reddedilir.
global.window = globalThis; global.document = { addEventListener() {}, querySelector() { return null; } };
const fs = require('fs'), path = require('path'); const A = path.join(__dirname, '..', 'app') + '/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'viz']) eval(fs.readFileSync(A + f + '.js', 'utf8'));
const X = window.PBI_DAX, LIB = window.PBI_MEASURES;
window.PBI_CORE = { X, V: window.PBIViz, MODEL: window.PBI_MODEL, esc: s => String(s), P: { ex: {} }, $: () => null, LIB, measureSet: () => { const o = {}; LIB.forEach(m => o[m.name] = { name: m.name, expr: m.expr }); return o; }, fmtOf: () => null, save() {}, noteWrong() {}, curX() {} };
eval(fs.readFileSync(A + 'gv.js', 'utf8'));
for (const f of fs.readdirSync(A).filter(x => /^c\d+\.js$/.test(x))) eval(fs.readFileSync(A + f, 'utf8'));
eval(fs.readFileSync(A + 'x_gorsel.js', 'utf8'));
const G = window.PBI_GV; let n = 0, sorun = 0;
const hata = (id, m) => { sorun++; console.log('SORUN', id, m); };
for (const l of window.PBI_LESSONS) (l.ex || []).forEach((e, i) => {
  const id = l.id + '#' + (i + 1);
  if (e.t === 'gorsel') {
    n++;
    let d; try { d = G.gorselVerisi(e.sol); } catch (err) { return hata(id, 'çözüm hesaplanmadı: ' + err.message); }
    if (!d.kart && d.cats.length < 2) hata(id, 'çözümde 2\'den az kategori');
    if (d.kart && (d.deger == null)) hata(id, 'kart boş');
    if (!d.kart && d.series.some(s => s.vals.every(v => v == null))) hata(id, 'boş seri');
    if (!G.gorselDenetle(e, e.sol).ok) hata(id, 'çözüm kendi denetiminden geçmedi');
    // yanlışlar reddedilmeli
    const yanlisTur = Object.keys(G.TURLER).find(t => !((e.kural && e.kural.turler) || [e.sol.tur]).includes(t));
    if (yanlisTur && G.gorselDenetle(e, Object.assign({}, e.sol, { tur: yanlisTur })).ok) hata(id, 'yanlış tür kabul edildi: ' + yanlisTur);
    if (e.sol.filtre && e.sol.filtre.alan && G.gorselDenetle(e, Object.assign({}, e.sol, { filtre: { alan: null, degerler: [] } })).ok) hata(id, 'filtresiz kabul edildi');
    if (e.sol.sirala === 'azalan' && G.gorselDenetle(e, Object.assign({}, e.sol, { sirala: 'artan' })).ok) hata(id, 'ters sıra kabul edildi');
    if (e.sol.topn && G.gorselDenetle(e, Object.assign({}, e.sol, { topn: 0 })).ok) hata(id, 'İlk N olmadan kabul edildi');
    if ((e.sol.hesap || []).length && G.gorselDenetle(e, Object.assign({}, e.sol, { hesap: [] })).ok) hata(id, 'görsel hesaplamasız kabul edildi');
  }
  if (e.t === 'model') {
    n++;
    if (!G.modelDenetle(e, e.sol).ok) hata(id, 'çözüm geçmedi: ' + G.modelDenetle(e, e.sol).msg);
    if (G.modelDenetle(e, []).ok) hata(id, 'boş model kabul edildi');
    if (G.modelDenetle(e, e.sol.map(r => Object.assign({}, r, { from: r.to, fromCol: r.toCol, to: r.from, toCol: r.fromCol }))).ok) hata(id, 'ters ilişki kabul edildi');
    if (G.modelDenetle(e, e.sol.slice(1)).ok) hata(id, 'eksik ilişki kabul edildi');
    if (e.baslangic && G.modelDenetle(e, e.baslangic).ok) hata(id, 'başlangıç modeli zaten doğru');
    for (const r of e.sol) for (const t of [r.from, r.to]) if (!e.tablolar.includes(t)) hata(id, 'tablo listede yok: ' + t);
    for (const r of e.sol) { const T = window.PBI_MODEL.tables; if (!T[r.from].cols.includes(r.fromCol) || !T[r.to].cols.includes(r.toCol)) hata(id, 'sütun yok: ' + r.from + '[' + r.fromCol + ']'); }
  }
});
// görsel hesaplama birim testleri
const t = { n: 3, adlar: () => ['A'], col: a => a === 'A' ? { vals: [10, 20, 30], total: 60 } : null };
const v = (s, i) => G.vcEval(G.vcParse(s), t, i);
const bek = [['RUNNINGSUM([A])', 2, 60], ['PREVIOUS([A])', 0, null], ['[A] - PREVIOUS([A])', 1, 10], ['MOVINGAVERAGE([A], 2)', 2, 25], ['DIVIDE([A], COLLAPSE([A], ROWS))', 0, 10 / 60], ['FIRST([A])', 2, 10], ['LAST([A])', 0, 30], ['NEXT([A])', 2, null], ['IF([A] > 15, 1, 0)', 0, 0]];
for (const [s, i, b] of bek) { const r = v(s, i); if (!(r === b || (typeof r === 'number' && Math.abs(r - b) < 1e-9))) hata('vc', s + ' satır ' + i + ' → ' + r + ' (beklenen ' + b + ')'); }
try { G.vcParse('SUMX(A)'); hata('vc', 'desteklenmeyen işlev kabul edildi'); } catch (e) { /* beklenen */ }
console.log('gorsel/model ' + n + ' alıştırma, görsel hesaplama ' + bek.length + ' vaka · SORUN ' + sorun);
process.exitCode = sorun ? 1 : 0;
