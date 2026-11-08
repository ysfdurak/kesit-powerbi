/* İçerik doğrulayıcı: node agentval.js dosya.js [dosya2.js ...] */
global.window = global; const P = (require('path').resolve(__dirname, '../app') + '/');
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep',...['c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','c24','c25','c26','c27','c28','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3'].filter(x=>require('fs').existsSync(P+x+'.js')),'mengine','pqdata','extra','exams','certskills']) require(P + f + '.js');
const files = process.argv.slice(2); files.forEach(f => require(require('path').resolve(f)));
const X = PBI_DAX; const base = {}; PBI_MEASURES.forEach(m => base[m.name] = { name: m.name, expr: m.expr });
const LIDS = new Set(PBI_LESSONS.map(l => l.id));
let bad = 0; const err = (...a) => { bad++; console.log('SORUN', ...a); };
const str = (v, w, min) => { if (typeof v !== 'string' || v.trim().length < (min || 2)) err(w, 'eksik/kısa metin'); };
const plain = s => String(s).replace(/<[^>]+>/g, '').replace(/`/g, '');
const lenStats = { n: 0, longest: 0, shortest: 0, pos: [0, 0, 0, 0, 0, 0] };
function mcCheck(q, w) {
  if (!Array.isArray(q.o) || q.o.length < 3) return err(w, 'o en az 3 şık');
  if (!(Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length)) return err(w, 'a geçersiz');
  if (new Set(q.o.map(plain)).size !== q.o.length) err(w, 'tekrar eden şık');
  if (q.o.some(o => /^(hiçbiri|hepsi)/i.test(plain(o)))) err(w, '“hiçbiri/hepsi” şıkkı');
  const L = q.o.map(o => plain(o).length); const mx = Math.max(...L), mn = Math.min(...L);
  lenStats.n++; lenStats.pos[q.a]++;
  if (L[q.a] === mx && L.filter(x => x === mx).length === 1) lenStats.longest++;
  if (L[q.a] === mn && L.filter(x => x === mn).length === 1) lenStats.shortest++;
}
function runDax(expr, grid, noTotal, w) {
  try { const e0 = X.check(expr); if (e0) throw new Error(e0);
    const out = []; if (!noTotal) out.push(X.evalMeasure(Object.assign({}, base), expr, []));
    (grid || [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }]).forEach(g => X.query({ rows: [g], measures: Object.assign({}, base), values: [expr], totals: false, keepBlank: true }).rows.forEach(r => out.push(r.vals[0])));
    return JSON.stringify(out.map(v => typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v));
  } catch (e) { err(w, 'DAX hata:', e.message.slice(0, 120), '|', expr.slice(0, 80)); return null; }
}
/* Sertifika soruları */
const SK = {}; Object.entries(PBI_CERT_SKILLS).forEach(([ex, a]) => a.forEach(s => SK[s.id] = Object.assign({ ex }, s)));
const DOMS = { pl300: PBI_CERT_INFO.pl300.domains.map(d => d[0]), dp600: PBI_CERT_INFO.dp600.domains.map(d => d[0]) };
function certQ(q, w) {
  if (!DOMS[q.ex]) return err(w, 'ex pl300|dp600 olmalı');
  if (!DOMS[q.ex].includes(q.k)) err(w, 'k alan adı geçersiz:', q.k);
  if (!SK[q.s] || SK[q.s].ex !== q.ex) err(w, 's madde id geçersiz:', q.s); else if (SK[q.s].d !== q.k) err(w, 's maddesinin alanı k ile uyuşmuyor', q.s, q.k);
  str(q.q, w + ' q', 15); str(q.why, w + ' why', 15);
  const t = q.type || 'mc';
  if (t === 'mc') mcCheck(q, w);
  else if (t === 'multi') { if (!Array.isArray(q.o) || q.o.length < 4) err(w, 'multi: en az 4 şık'); if (!Array.isArray(q.a) || q.a.length < 2 || q.a.some(i => !(i >= 0 && i < q.o.length)) || new Set(q.a).size !== q.a.length) err(w, 'multi: a en az 2 benzersiz indeks'); else if (q.a.length >= q.o.length) err(w, 'multi: tüm şıklar doğru olamaz'); }
  else if (t === 'yesno') { if (!Array.isArray(q.st) || q.st.length < 3) err(w, 'yesno: st en az 3'); else { q.st.forEach((s, i) => { str(s.t, w + ' st' + i, 10); if (typeof s.a !== 'boolean') err(w, 'yesno a boolean'); }); if (q.st.every(s => s.a) || q.st.every(s => !s.a)) err(w, 'yesno: hepsi aynı cevap'); } }
  else if (t === 'order') { if (!Array.isArray(q.items) || q.items.length < 3) err(w, 'order: items en az 3'); if (q.extra && !Array.isArray(q.extra)) err(w, 'order: extra dizi'); }
  else if (t === 'hot') { str(q.code, w + ' code', 10); if (!Array.isArray(q.slots) || !q.slots.length) err(w, 'hot: slots'); else q.slots.forEach((s, i) => { if (!q.code.includes('{' + i + '}')) err(w, 'hot: kodda {' + i + '} yok'); if (!Array.isArray(s.o) || s.o.length < 2 || !(s.a >= 0 && s.a < s.o.length)) err(w, 'hot slot', i); }); if (q.dax) { let c = q.code; q.slots.forEach((s, i) => c = c.split('{' + i + '}').join(s.o[s.a])); runDax(c.replace(/^[^=\n]*=\s*/, ''), q.grid, q.noTotal, w + ' hot-dax'); } }
  else if (t === 'click') { const U = (global.PBI_UI || {})[q.ui]; if (!U) err(w, 'click: ui yok', q.ui); else { const st = U.tabs.find(x => x.id === q.start); if (!st) err(w, 'click: start sekmesi yok'); const [ti, b] = String(q.a).split('|'); const tt = U.tabs.find(x => x.id === ti); if (!tt || !tt.btns.some(x => x[0] === b)) err(w, 'click: cevap düğmesi yok', q.a); if (ti === q.start) err(w, 'click: cevap başlangıç sekmesinde'); } }
  else err(w, 'type geçersiz', t);
}
if (global.PBI_CERTQ && PBI_CERTQ.length) { const ids = new Set(); PBI_CERTQ.forEach((q, i) => { const w = 'CERTQ ' + (q.id || i); if (!q.id || ids.has(q.id)) err(w, 'id eksik/tekrar'); ids.add(q.id); certQ(q, w); });
  const by = {}; PBI_CERTQ.forEach(q => { const k = q.ex + ':' + (q.type || 'mc'); by[k] = (by[k] || 0) + 1; }); console.log('CERTQ', PBI_CERTQ.length, JSON.stringify(by));
  const cov = {}; PBI_CERTQ.forEach(q => cov[q.s] = (cov[q.s] || 0) + 1); }
if (global.PBI_CASES && PBI_CASES.length) PBI_CASES.forEach(c => { const w = 'CASE ' + c.id; str(c.title, w); if (!Array.isArray(c.tabs) || c.tabs.length < 2) err(w, 'tabs en az 2'); else c.tabs.forEach(t => { str(t[0], w + ' tab adı'); str(t[1], w + ' tab metni', 80); }); if (!Array.isArray(c.qs) || c.qs.length < 4) err(w, 'qs en az 4'); else c.qs.forEach((q, i) => certQ(Object.assign({ ex: c.ex }, q), w + ' q' + i)); console.log('CASE', c.id, c.ex, (c.qs || []).length, 'soru', (c.qs || []).map(q => q.type || 'mc').join(',')); });
if (global.PBI_CERT_TAGS) ['pl300', 'dp600'].forEach(ex => { const t = PBI_CERT_TAGS[ex] || [], src = ex === 'pl300' ? PBI_PL300 : PBI_DP600; if (t.length !== src.length) err('TAGS', ex, 'uzunluk', t.length, '≠', src.length); t.forEach((id, i) => { if (!SK[id] || SK[id].ex !== ex) err('TAGS', ex, i, 'geçersiz', id); else if (SK[id].d !== src[i].k) err('TAGS', ex, i, 'alan uyuşmuyor', id, SK[id].d, '≠', src[i].k); }); });
/* Karıştırılanlar */
if (global.PBI_CONFUSED) { PBI_CONFUSED.forEach(c => { const w = 'CONF ' + c.id; str(c.title, w); str(c.rule, w + ' rule', 20); if (!['DAX', 'Model', 'Power Query', 'Rapor', 'Service'].includes(c.area)) err(w, 'area'); if (!Array.isArray(c.items) || c.items.length < 2) err(w, 'items'); else c.items.forEach(x => { str(x.n, w + ' item n', 1); str(x.d, w + ' item d', 15); });
  if (c.lesson && !LIDS.has(c.lesson)) err(w, 'lesson yok', c.lesson);
  if (c.demo) { const res = c.demo.rows.map(([l, e]) => runDax(e, [c.demo.grid], c.demo.noTotal, w + ' demo ' + l)); if (res.every(r => r) && new Set(res).size < res.length) err(w, 'demo: ifadeler aynı sonucu veriyor; farkı göstermiyor'); }
  if (!Array.isArray(c.quiz) || c.quiz.length < 2) err(w, 'quiz en az 2'); else c.quiz.forEach((q, i) => { str(q.q, w + ' quiz q'); str(q.why, w + ' quiz why'); mcCheck(q, w + ' quiz' + i); }); });
  console.log('CONFUSED', PBI_CONFUSED.length, 'demo', PBI_CONFUSED.filter(c => c.demo).length); }
if (global.PBI_MISTAKES) { const ids = new Set(); PBI_MISTAKES.forEach(m => { const w = 'MIST ' + m.id; if (ids.has(m.id)) err(w, 'tekrar id'); ids.add(m.id); str(m.sym, w + ' sym', 10); str(m.cause, w + ' cause', 20); str(m.fix, w + ' fix', 20); if (!['DAX', 'Model', 'Power Query', 'Rapor', 'Service'].includes(m.area)) err(w, 'area'); if (m.lesson && !LIDS.has(m.lesson)) err(w, 'lesson yok', m.lesson);
  if (m.task) { const t = m.task; str(t.name, w + ' task name', 2); str(t.q, w + ' task q', 20); const a = runDax(t.sol, t.grid, t.noTotal, w + ' sol'); let b = null; try { if (!X.check(t.start)) b = runDax(t.start, t.grid, t.noTotal, w + ' start(bozuk)'); } catch (e) {} if (a && b && a === b) err(w, 'bozuk ölçü (start) çözümle aynı sonucu veriyor'); } });
  console.log('MISTAKES', PBI_MISTAKES.length, 'görevli', PBI_MISTAKES.filter(m => m.task).length); }
/* Mülakat */
if (global.PBI_IV_BANK) { const by = {}; PBI_IV_BANK.forEach(q => { const w = 'IV ' + q.id; ['q', 'weak', 'strong', 'why', 'follow'].forEach(f => str(q[f], w + ' ' + f, 10)); if (!['analist', 'gelistirici', 'fabric', 'hepsi'].includes(q.role)) err(w, 'role'); str(q.cat, w + ' cat'); by[q.role] = (by[q.role] || 0) + 1; if (q.weak && q.strong && q.strong.length < q.weak.length) err(w, 'güçlü cevap zayıftan kısa olmamalı'); }); console.log('IV_BANK', PBI_IV_BANK.length, JSON.stringify(by)); }
if (global.PBI_IV_STAR) PBI_IV_STAR.forEach(s => ['q', 'aim', 'S', 'T', 'A', 'R', 'tip'].forEach(f => str(s[f], 'STAR ' + s.id + ' ' + f, 10)));
if (global.PBI_IV_ASK) PBI_IV_ASK.forEach((s, i) => { str(s.q, 'ASK ' + i); str(s.why, 'ASK ' + i + ' why'); });
if (global.PBI_IV_TAKEHOME) { const t = PBI_IV_TAKEHOME; str(t.title, 'TH title'); str(t.brief, 'TH brief', 80); (t.tasks || []).forEach((x, i) => str(x.t, 'TH task ' + i)); if (!(t.rubric || []).length) err('TH rubric'); else { const sw = t.rubric.reduce((s, r) => s + r.w, 0); if (sw !== 100) err('TH rubric ağırlık toplamı 100 değil', sw); } ((t.solution || {}).measures || []).forEach(([n, e]) => runDax(e, null, false, 'TH ölçü ' + n)); }
if (lenStats.n) { const pl = Math.round(lenStats.longest / lenStats.n * 100), ps = Math.round(lenStats.shortest / lenStats.n * 100); console.log('ŞIK DENGESİ: tek-seçimli', lenStats.n, '· doğru=en uzun %' + pl, '· doğru=en kısa %' + ps, '· konum', JSON.stringify(lenStats.pos.slice(0, 4))); if (lenStats.n >= 8 && pl > 30) err('ŞIK: doğru şık çok sık en uzun (%' + pl + ' > %30)'); if (lenStats.n >= 8 && ps < 20) err('ŞIK: doğru şık yeterince sık en kısa değil (%' + ps + ' < %20)'); }
console.log('SORUN', bad);
