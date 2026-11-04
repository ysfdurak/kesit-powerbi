/* Kesit Power BI — Power Query Lab arayüzü: şerit, formül çubuğu, sütun kalitesi, uygulanan adımlar, Gelişmiş Düzenleyici.
   Hem kendi sayfasında (#pq) hem de derslerin içinde “pq” türündeki alıştırmalarda kullanılır. */
(function () {
'use strict';
const C = window.PBI_CORE, Q = window.PBI_PQ, esc = C.esc, $ = C.$;
const OPS = Q.OPS, TYPES = Q.TYPES;
const TABS = [['home', 'Giriş', ['Giriş', 'Satırları kaldır', 'Satırları tut', 'Sırala', 'Birleştir']], ['tr', 'Dönüştür', ['Dönüştür', 'Tablo', 'Biçim']], ['add', 'Sütun ekle', ['Genel', 'Metinden', 'Sayıdan', 'Tarihten']], ['view', 'Görünüm', []]];
const VO = { q: true, d: false, p: false }; // Görünüm sekmesi: sütun kalitesi, dağılımı, profili
const P = C.P; P.pq = P.pq || {}; P.pqFree = P.pqFree || {};

const PQS = { src: 'bayi' };
let E = null; // etkin düzenleyici
function fresh(cfg) { return Object.assign({ steps: [], sel: [], view: null, form: null, fv: {}, adv: false, multi: false, tab: 'home', msg: null, res: null, solOpen: false }, cfg); }

/* ---------- Hücre ve tablo görünümü ---------- */
function cell(v) {
  if (Q.isErr(v)) return '<span class="pqerr" title="' + esc(v.pqErr) + '">Error</span>';
  if (v === null || v === undefined) return '<i class="pqnull">null</i>';
  if (v instanceof Date) return v.mk === 'datetime' ? esc(Q.fmtDate(v) + ' ' + String(v.getUTCHours()).padStart(2, '0') + ':' + String(v.getUTCMinutes()).padStart(2, '0') + ':' + String(v.getUTCSeconds()).padStart(2, '0')) : Q.fmtDate(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return '<i class="pqnest">List</i>';
  if (v && typeof v === 'object') { const M = window.PBI_M; return '<i class="pqnest">' + (M.isTable(v) ? 'Table' : M.typeName(v)) + '</i>'; }
  if (typeof v === 'number') return v.toLocaleString('tr-TR', { maximumFractionDigits: 4 });
  if (v === '') return '<i class="pqnull">""</i>';
  const s = String(v); const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
  return (m[1] ? '<span class="pqsp">' + '·'.repeat(m[1].length) + '</span>' : '') + esc(m[2]) + (m[3] ? '<span class="pqsp">' + '·'.repeat(m[3].length) + '</span>' : '');
}
function grid(t, opt) {
  opt = opt || {}; const sel = opt.sel || []; const qs = opt.quality ? Q.quality(t) : null; const lim = opt.limit || 60;
  let h = '<div class="pqgrid"><table><thead><tr><th class="rn"></th>' + t.cols.map(c => '<th class="' + (sel.includes(c.name) ? 'on' : '') + '"' + (opt.click ? ' data-pqcol="' + esc(c.name) + '" tabindex="0" role="button" aria-pressed="' + sel.includes(c.name) + '"' : '') + '><span class="pqty' + (c.type === 'any' ? ' any' : '') + '"' + (opt.click ? ' data-pqtype="' + esc(c.name) + '" title="Veri türünü değiştir"' : '') + '>' + TYPES[c.type].label + '</span>' + esc(c.name) + '</th>').join('') + '</tr>';
  if (qs) h += '<tr class="pqq"><th class="rn"></th>' + qs.map(q => '<td><span class="qbar"><i class="ok" style="width:' + q.ok * 100 + '%"></i><i class="er" style="width:' + q.er * 100 + '%"></i><i class="em" style="width:' + q.em * 100 + '%"></i></span><small>Geçerli %' + Math.round(q.ok * 100) + (q.er ? ' · <b class="e">Hata %' + Math.round(q.er * 100) + '</b>' : '') + (q.em ? ' · Boş %' + Math.round(q.em * 100) : '') + '</small></td>').join('') + '</tr>';
  if (opt.dist) h += '<tr class="pqq pqd"><th class="rn"></th>' + t.cols.map(c => { const f = Q.profile(t, c.name); const mx = f.top.length ? f.top[0].n : 1; return '<td title="' + f.distinct + ' ayrı değer, ' + f.unique + ' tek değer"><span class="dbars" aria-hidden="true">' + f.top.map(x => '<i style="height:' + Math.max(8, x.n / mx * 100) + '%"></i>').join('') + '</span><small>' + f.distinct + ' ayrı, ' + f.unique + ' tek</small></td>'; }).join('') + '</tr>';
  h += '</thead><tbody>' + t.rows.slice(0, lim).map((r, i) => '<tr><td class="rn">' + (i + 1) + '</td>' + r.map((v, j) => '<td class="' + (sel.includes(t.cols[j].name) ? 'on' : '') + (typeof v === 'number' ? ' nc' : '') + '">' + cell(v) + '</td>').join('') + '</tr>').join('') + (t.rows.length ? '' : '<tr><td class="rn"></td><td colspan="' + t.cols.length + '" class="pqnull">Tablo boş</td></tr>') + '</tbody></table></div>';
  if (t.rows.length > lim) h += '<p class="muted pqfoot">İlk ' + lim + ' satır gösteriliyor (' + t.rows.length + ' satır).</p>';
  return h;
}

/* ---------- Düzenleyici ---------- */
function state() { const r = Q.run(E.src, E.steps); const vi = E.view == null ? r.states.length - 1 : Math.min(E.view, r.states.length - 1); return { r, vi, cur: r.states[vi] }; }
function stepLabel(s) {
  const op = OPS[s.op]; const c = s.cols && s.cols.length ? ' · ' + s.cols.join(', ') : '';
  const extra = s.op === 'type' ? ' → ' + TYPES[s.to].name : s.op === 'replace' ? ' · “' + s.find + '” → ' + (String(s.repl).toLowerCase() === 'null' ? 'null' : '“' + s.repl + '”') : s.op === 'rename' ? ' → ' + s.to : s.op === 'removeTop' ? ' · ' + s.n : s.op === 'filter' ? ' · ' + ({ notnull: 'boş değil', null: 'boş', contains: 'içerir “' + s.v + '”' })[s.cmp] || ' ' + s.cmp + ' ' + s.v : s.op === 'group' ? ' · ' + s.name : s.op === 'append' || s.op === 'merge' ? ' ← ' + ((Q.SOURCES[s.with] || {}).name || s.with) + (s.op === 'merge' ? ' (' + ({ left: 'sol dış', inner: 'iç', anti: 'sol karşıt' })[s.kind] + ')' : '') : '';
  return op.name + c + extra;
}
function ribbon() {
  return '<div class="pqrib"><div class="pqtabs" role="tablist">' + TABS.map(t => '<button role="tab" data-pqtab="' + t[0] + '" aria-selected="' + (E.tab === t[0]) + '">' + t[1] + '</button>').join('') + '<label class="pqmulti"><input type="checkbox" data-pqmulti' + (E.multi ? ' checked' : '') + '> Çoklu sütun seçimi</label></div><div class="pqbtns">' +
    (E.tab === 'view' ? viewTab() : '') + TABS.find(t => t[0] === E.tab)[2].map(g => '<div class="pqgrp"><div>' + Object.keys(OPS).filter(k => OPS[k].group === g).map(k => '<button data-pqop="' + k + '" title="' + esc(OPS[k].what) + '" class="' + (E.form === k ? 'on' : '') + '">' + esc(OPS[k].name) + '</button>').join('') + '</div><span>' + g + '</span></div>').join('') + '</div></div>';
}
function viewTab() {
  const chk = (k, t, w) => '<label class="pqvo" title="' + esc(w) + '"><input type="checkbox" data-pqvo="' + k + '"' + (VO[k] ? ' checked' : '') + '> ' + t + '</label>';
  return '<div class="pqgrp"><div>' + chk('q', 'Sütun kalitesi', 'Geçerli, hata ve boş yüzdesi') + chk('d', 'Sütun dağılımı', 'Ayrı ve tek değer sayısı, değer sıklığı') + chk('p', 'Sütun profili', 'Seçili sütunun istatistikleri ve değer dağılımı') + '</div><span>Veri önizleme</span></div><div class="pqgrp"><div><button data-pq="advt" class="' + (E.adv ? 'on' : '') + '">Gelişmiş Düzenleyici</button></div><span>Gelişmiş</span></div>';
}
function profilePanel(t) {
  const c = E.sel[0]; const f = c ? Q.profile(t, c) : null;
  if (!f) return '<div class="pqprof muted">Sütun profili için tablodan bir sütun başlığına tıkla.</div>';
  const val = v => v === null || v === undefined ? '-' : v instanceof Date ? Q.fmtDate(v) : typeof v === 'number' ? v.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : esc(String(v));
  const rows = [['Sayı', f.count], ['Geçerli', f.valid], ['Hata', f.err], ['Boş', f.empty], ['Ayrı', f.distinct], ['Tek', f.unique], ['En küçük', val(f.min)], ['En büyük', val(f.max)]].concat(f.avg !== null ? [['Ortalama', val(f.avg)], ['Standart sapma', val(f.sd)], ['Sıfır', f.zero]] : []);
  const mx = f.top.length ? f.top[0].n : 1;
  return '<div class="pqprof"><div><b>Sütun istatistikleri · ' + esc(c) + '</b><table>' + rows.map(r => '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>').join('') + '</table></div><div><b>Değer dağılımı</b>' + f.top.map(x => '<div class="pqbar"><span>' + (x.v === null || x.v === undefined || x.v === '' ? '<i>boş</i>' : val(x.v)) + '</span><i style="width:' + (x.n / mx * 100) + '%"></i><em>' + x.n + '</em></div>').join('') + '</div></div>';
}
function form(cols) {
  if (!E.form) return ''; const op = OPS[E.form]; const fv = E.fv;
  let h = '<div class="pqform"><b>' + esc(op.name) + (E.sel.length && op.sel ? ' <span class="muted">· ' + esc(E.sel.join(', ')) + '</span>' : '') + '</b><p class="muted">' + esc(op.what) + '</p><div class="row" style="gap:10px;align-items:end">';
  (op.form || []).forEach(f => {
    if (f.hideIf && f.hideIf(fv)) return;
    h += '<label class="pqf">' + esc(f.label);
    if (f.type === 'sel') h += '<select data-pqf="' + f.k + '">' + f.o.map(o => '<option value="' + o[0] + '"' + (String(fv[f.k]) === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
    else if (f.type === 'col') h += '<select data-pqf="' + f.k + '">' + cols.filter(c => !E.sel.includes(c.name)).map(c => '<option' + (fv[f.k] === c.name ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') + '</select>';
    else if (f.type === 'chk') h += '<input type="checkbox" data-pqf="' + f.k + '"' + (fv[f.k] !== false ? ' checked' : '') + '>';
    else h += '<input class="input" data-pqf="' + f.k + '" value="' + esc(fv[f.k] == null ? '' : fv[f.k]) + '"' + (f.type === 'num' ? ' inputmode="numeric"' : '') + ' style="width:' + (f.type === 'num' ? 90 : 190) + 'px">';
    h += '</label>';
  });
  return h + '<button class="btn sm pri" data-pq="ok">Tamam</button><button class="btn sm ghost" data-pq="cancel">İptal</button></div></div>';
}
function editorHTML() {
  const { r, vi, cur } = state(); const t = cur.table;
  let h = ribbon() + form(t ? t.cols : []);
  h += '<div class="pqfx"><span>fx</span><code>' + esc(vi === 0 ? '= ' + E.src.m : '= ' + cur.m) + '</code></div>';
  h += '<div class="pqmain"><div class="pqleft">';
  if (E.msg) h += '<div class="msg ' + (E.msg[0] === 'err' ? 'err' : 'info') + '" style="margin-bottom:8px">' + E.msg[1] + '</div>';
  if (cur.error) h += '<div class="msg err"><b>Bu adım hata veriyor</b><span class="vend">' + esc(cur.error) + '</span>Adımı silebilir ya da bir önceki adıma dönüp düzeltebilirsin.</div>';
  else { h += grid(t, { sel: E.sel, quality: VO.q, dist: VO.d, click: true }); if (VO.p) h += profilePanel(t); }
  h += '<div class="pqstatus"><span>' + (t ? t.cols.length + ' sütun, ' + t.rows.length + ' satır' : '—') + '</span><span>' + (vi < r.states.length - 1 ? 'Önizleme: “' + esc(cur.name) + '” adımı. <button class="lnk" data-pq="last">Son adıma dön</button>' : 'Son adım gösteriliyor') + '</span></div></div>';
  h += '<aside class="pqside"><div class="pqsteps"><b>Uygulanan adımlar</b><ol>' + r.states.map((s, i) => '<li class="' + (i === vi ? 'on' : '') + (s.error ? ' bad' : '') + '"><button data-pqview="' + i + '">' + esc(i === 0 ? 'Kaynak' : stepLabel(E.steps[i - 1])) + '</button>' + (i ? '<button class="x" data-pqdel="' + (i - 1) + '" aria-label="Adımı sil">×</button>' : '') + '</li>').join('') +
    E.steps.slice(r.states.length - 1).map((s, j) => '<li class="dead"><button disabled>' + esc(stepLabel(s)) + '</button><button class="x" data-pqdel="' + (r.states.length - 1 + j) + '" aria-label="Adımı sil">×</button></li>').join('') + '</ol>' + (E.steps.length ? '' : '<p class="muted" style="font-size:.8rem;margin:6px 0 0">Bir sütun başlığına tıkla, sonra şeritten bir komut seç. Her komut buraya bir adım ekler.</p>') + '</div>';
  h += '<details class="pqadv"' + (E.adv ? ' open' : '') + ' data-pqadv><summary>Gelişmiş Düzenleyici (M kodu)</summary><pre class="m">' + esc(Q.mCode(E.src, r.states)) + '</pre>' + (E.ex || !labQn() ? '' : '<button class="btn sm" data-mq="fromlab">Bu kodu M editöründe çalıştır</button>') + '</details></aside></div>';
  return h;
}
const labQn = () => { const id = PQS.src; const s = Q.SOURCES[id]; return s && E && E.src === s ? (s.qn || (window.PBI_M && window.PBI_M.QN[id])) : null; };
function paint() { const host = $('#pqHost'); if (!host || !E) return; const y = window.scrollY; host.innerHTML = editorHTML() + (E.ex ? exPanel() : ''); C.enhance(host); window.scrollTo(0, y); }
function persist() { if (E.store) { E.store(E.steps.slice()); } }

/* ---------- Alıştırma paneli ---------- */
function exPanel() {
  let h = '<div class="pqexbar"><button class="btn pri" data-pq="check">Kontrol et</button><button class="btn sm ghost" data-pq="sol">' + (E.solOpen ? 'Çözümü gizle' : 'Çözümü göster') + '</button><button class="btn sm ghost" data-pq="reset">Baştan başla</button></div>';
  if (E.res) h += E.res;
  if (E.solOpen) h += '<div class="note"><b>Örnek çözüm (' + E.ex.sol.length + ' adım)</b><ol style="margin:4px 0 8px">' + E.ex.sol.map(s => '<li>' + esc(stepLabel(s)) + '</li>').join('') + '</ol><button class="btn sm" data-pq="apply">Bu adımları düzenleyiciye uygula</button></div>';
  return h;
}
function check() {
  const r = Q.run(E.src, E.steps); const c = Q.compare(r.table, E.target);
  if (c.ok) { E.res = '<div class="msg ok"><b>Doğru!</b>Tablon hedefle birebir aynı: ' + E.target.cols.length + ' sütun, ' + E.target.rows.length + ' satır, türler doğru. ' + E.steps.length + ' adım kullandın' + (E.steps.length > E.ex.sol.length ? ' (örnek çözüm ' + E.ex.sol.length + ' adım; gereksiz adım modeli yavaşlatmaz ama okunurluğu düşürür)' : '') + '.</div>'; if (E.onSolved) E.onSolved(); }
  else E.res = '<div class="msg err"><b>Henüz değil</b>' + esc(c.msg) + '</div>';
  paint();
}

/* ---------- Ders içi alıştırma ---------- */
function lessonView(e, k) {
  const solved = P.ex[k]; const src = Q.exSource(e); const tg = Q.target(e);
  let h = '<div class="panel brief pqbrief"><div class="row" style="justify-content:space-between"><span class="eyebrow">Power Query alıştırması' + (solved ? ' · çözüldü' : '') + '</span><span class="chip pqc">' + esc(src.name) + '</span></div><div class="q">' + e.q + '</div>';
  h += '<div class="row" style="gap:8px"><button class="btn sm" data-act="hint">İpucu</button></div><div id="hintBox"></div>';
  h += '<details class="pqtarget"><summary>Hedef tablo (' + tg.cols.length + ' sütun, ' + tg.rows.length + ' satır)</summary>' + grid(tg, { limit: 20 }) + '</details></div>';
  return h + '<div class="panel pqwrap" id="pqHost"></div>';
}
function mountLesson(e, k, onSolved) {
  E = fresh({ src: Q.exSource(e), steps: (P.pq[k] || []).map(s => Object.assign({}, s)), ex: e, target: Q.target(e), onSolved, store: st => { P.pq[k] = st; C.save(); } });
  if (P.ex[k] && E.steps.length) { const c = Q.compare(Q.run(E.src, E.steps).table, E.target); if (c.ok) E.res = '<div class="msg ok"><b>Çözüldü.</b>Kayıtlı adımların hedef tabloyu üretiyor.</div>'; }
  paint();
}

/* ---------- Power Query Lab sayfası ---------- */
function viewPQ() {
  const exs = C.LESSONS.flatMap(l => (l.ex || []).map((e, i) => ({ l, e, i })).filter(x => x.e.t === 'pq' || x.e.t === 'mcode'));
  let h = '<div class="wrap" style="gap:16px">' + C.head('Araçlar', 'Power Query Lab', 'Kirli bir tabloyu adım adım temizle; her adım gerçek M koduna dönüşür. ' + Object.keys(OPS).length + ' komut, ' + Object.keys(Q.SOURCES).length + ' örnek kaynak, derslerde ' + exs.length + ' alıştırma.', 'pq');
  h += '<div class="pqsrcs" role="tablist">' + Object.keys(Q.SOURCES).map(id => '<button role="tab" data-pqsrc="' + id + '" aria-selected="' + (PQS.src === id) + '"><b>' + esc(Q.SOURCES[id].name) + '</b><small>' + Q.SOURCES[id].table.rows.length + ' satır · ' + Q.SOURCES[id].table.cols.length + ' sütun</small></button>').join('') + '</div>';
  h += '<p class="muted" style="margin:0;max-width:80ch">' + esc(Q.SOURCES[PQS.src].desc) + '</p><div class="panel pqwrap" id="pqHost"></div>';
  h += mFreeHTML();
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Derslerdeki alıştırmalar</span><h2>Hedef tabloya ulaş, kontrol ettir</h2></div></div><div class="panel lessons">' + exs.map(x => '<button class="litem" data-lesson="' + x.l.id + '" data-pqstep="' + (x.i + 1) + '"><span class="check ' + (P.ex[x.l.id + ':' + x.i] ? 'done' : '') + '">' + (P.ex[x.l.id + ':' + x.i] ? C.ic('tick', 3.2) : '') + '</span><span style="min-width:0"><b>' + esc(x.e.q.replace(/<[^>]+>/g, '').split('.')[0]) + '</b><small>' + esc(x.l.title) + ' · ' + esc(Q.SOURCES[x.e.src].name) + ' · örnek çözüm ' + x.e.sol.length + ' adım</small></span>' + C.lvBadge(x.l.lvl) + '</button>').join('') + '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Komut listesi</span><h2>Her komut ne yapar?</h2></div></div><div class="fgrid">' + Object.keys(OPS).map(k => '<div class="panel fcard"><b>' + esc(OPS[k].name) + ' <span class="chip">' + esc(OPS[k].group) + '</span></b><p>' + esc(OPS[k].what) + '</p><code class="syn">' + esc(OPS[k].m('#"Önceki Adım"', sample(k))) + '</code></div>').join('') + '</div></section>';
  return h + '</div>';
}
function sample(k) { return { cols: ['Sütun'], with: k === 'merge' ? 'sehir_bolge' : 'bayi_sub', kind: 'left', n: 1, to: k === 'type' ? 'number' : k === 'addCustom' ? 'number' : 'Yeni Ad', val: 'Değer', expr: '[Tutar] * 1.2', then: 'Büyük', els: 'Küçük', start: 0, step: 1, order: 'asc', x: 'TR-', ref: '31.12.2024', first: 1, rm: 1, keep: 1, ex1: 'Kad', what: k === 'dateOp' ? 'year' : k === 'textCol' || k === 'extract' ? 'len' : 'mul', find: '-', repl: 'null', whole: true, v: '0', d: ' ', mode: 'first', cmp: '>', name: 'Toplam', agg: 'sum', src: 'Tutar' }; }
function mountPQ() {
  const id = PQS.src; E = fresh({ src: Q.SOURCES[id], steps: (P.pqFree[id] || []).map(s => Object.assign({}, s)), store: st => { P.pqFree[id] = st; C.save(); } });
  paint(); mountFree();
}
C.view('pq', { render: viewPQ, mount: mountPQ, hash: 'pq' });

/* ---------- Olaylar ---------- */
function addStep(op, vals) {
  const s = Object.assign({ op, cols: E.sel.slice() }, vals || {});
  const at = E.view == null ? E.steps.length : E.view; E.steps.splice(at, 0, s); E.view = null; E.form = null; E.msg = null; E.res = null;
  const r = Q.run(E.src, E.steps); const t = r.table || (r.states[r.states.length - 1] || {}).table; if (t) E.sel = E.sel.filter(c => t.cols.some(x => x.name === c));
  persist(); paint();
}
function openOp(k) {
  const op = OPS[k]; E.msg = null;
  if (op.sel && !E.sel.length) { E.msg = ['err', '<b>Önce sütun seç.</b>“' + esc(op.name) + '” bir sütuna uygulanır. Tablodaki bir sütun başlığına tıkla.']; E.form = null; paint(); return; }
  if (op.sel === 2 && E.sel.length < 2) { E.msg = ['err', '<b>En az iki sütun seç.</b>“' + esc(op.name) + '” için Çoklu sütun seçimini aç ya da Ctrl ile iki sütuna tıkla.']; E.form = null; paint(); return; }
  if (op.single && E.sel.length > 1) { E.msg = ['err', '<b>Tek sütun seç.</b>“' + esc(op.name) + '” aynı anda yalnızca bir sütuna uygulanır.']; paint(); return; }
  if (!op.form) { addStep(k); return; }
  E.form = k; E.fv = {}; op.form.forEach(f => E.fv[f.k] = f.d);
  if (k === 'group') { const { cur } = state(); const t = cur.table; const num = t && t.cols.find(c => !E.sel.includes(c.name) && (c.type === 'number' || c.type === 'int')); E.fv.src = num ? num.name : (t && t.cols.find(c => !E.sel.includes(c.name)) || {}).name; }
  if (k === 'rename') E.fv.to = E.sel[0];
  if (k === 'pivot') { const t = state().cur.table; const num = t && t.cols.find(c => !E.sel.includes(c.name) && (c.type === 'number' || c.type === 'int')); E.fv.val = num ? num.name : (t && t.cols.find(c => !E.sel.includes(c.name)) || {}).name; }
  paint(); const inp = document.querySelector('.pqform input.input, .pqform select'); if (inp) inp.focus();
}
function readForm() { document.querySelectorAll('[data-pqf]').forEach(el => { E.fv[el.dataset.pqf] = el.type === 'checkbox' ? el.checked : el.value; }); }
document.addEventListener('click', ev => {
  if (!E) return; const t = ev.target.closest('[data-pq],[data-pqop],[data-pqcol],[data-pqtype],[data-pqview],[data-pqdel],[data-pqtab],[data-pqsrc],[data-pqmulti],[data-pqstep]'); if (!t) return;
  const d = t.dataset;
  if (d.pqstep !== undefined && d.lesson) { setTimeout(() => { const st = C.state(); st.step = +d.pqstep; C.render(); }, 0); return; }
  if (d.pqsrc) { PQS.src = d.pqsrc; C.render(); return; }
  if (d.pqmulti !== undefined) { E.multi = t.checked; return; }
  if (d.pqtab) { E.tab = d.pqtab; paint(); return; }
  if (d.pqtype !== undefined) { ev.stopPropagation(); E.sel = [d.pqtype]; E.tab = 'tr'; openOp('type'); return; }
  if (d.pqcol !== undefined) { const c = d.pqcol; const multi = E.multi || ev.ctrlKey || ev.metaKey || ev.shiftKey; if (multi) E.sel = E.sel.includes(c) ? E.sel.filter(x => x !== c) : E.sel.concat([c]); else E.sel = E.sel.length === 1 && E.sel[0] === c ? [] : [c]; if (E.form && OPS[E.form].sel) { readForm(); } paint(); return; }
  if (d.pqop) { openOp(d.pqop); return; }
  if (d.pqview !== undefined) { E.view = +d.pqview; E.form = null; paint(); return; }
  if (d.pqdel !== undefined) { E.steps.splice(+d.pqdel, 1); E.view = null; E.res = null; persist(); paint(); return; }
  const a = d.pq;
  if (a === 'advt') { E.adv = !E.adv; paint(); return; }
  if (a === 'ok') { readForm(); const op = OPS[E.form]; if (E.form === 'rename' && !String(E.fv.to || '').trim()) { E.msg = ['err', 'Yeni ad boş olamaz.']; paint(); return; } addStep(E.form, Object.assign({}, E.fv)); return; }
  if (a === 'cancel') { E.form = null; paint(); return; }
  if (a === 'last') { E.view = null; paint(); return; }
  if (a === 'check') { check(); return; }
  if (a === 'sol') { E.solOpen = !E.solOpen; paint(); return; }
  if (a === 'apply') { E.steps = E.ex.sol.map(s => Object.assign({}, s)); E.view = null; E.sel = []; E.res = null; persist(); paint(); return; }
  if (a === 'reset') { E.steps = []; E.view = null; E.sel = []; E.res = null; E.form = null; persist(); paint(); return; }
});
document.addEventListener('change', ev => { if (!E || !ev.target.matches('[data-pqf]')) return; readForm(); if (OPS[E.form] && (OPS[E.form].form || []).some(f => f.hideIf)) paint(); });
document.addEventListener('change', ev => { if (!E || !ev.target.matches('[data-pqvo]')) return; VO[ev.target.dataset.pqvo] = ev.target.checked; paint(); });
document.addEventListener('toggle', ev => { if (E && ev.target.matches && ev.target.matches('[data-pqadv]')) E.adv = ev.target.open; }, true);
document.addEventListener('keydown', ev => { if (!E) return; if (ev.key === 'Enter' && ev.target.matches('.pqform input.input')) { ev.preventDefault(); const b = document.querySelector('[data-pq="ok"]'); if (b) b.click(); } if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('th[data-pqcol]')) { ev.preventDefault(); ev.target.click(); } });

/* ---------- M editörü: yaz, çalıştır, kontrol et ---------- */
const MM = () => window.PBI_M;
const M_NOTE = 'Bu, gerçek Power Query motoru değil; tarayıcıda çalışan küçük bir M alt kümesi yorumlayıcısı. ';
function supportedHTML() {
  const m = MM(); const groups = {}; m.supported().forEach(n => { const g = n.split('.')[0]; (groups[g] = groups[g] || []).push(n); });
  const qs = Object.keys(Q.SOURCES).map(id => { const s = Q.SOURCES[id]; const qn = s.qn || m.QN[id]; return qn ? '<li><code>' + esc(qn) + '</code>: ' + s.table.cols.map(c => esc(c.name)).join(', ') + '</li>' : ''; }).join('');
  return '<details class="msup"><summary>Sınırlar, sorgular ve desteklenen işlevler (' + m.supported().length + ')</summary><p>' + esc(M_NOTE + m.LIMIT) + ' Kod sonucu kültür vermezsen en-US kurallarıyla okunur. Uyum, Microsoft Learn’deki resmî örneklerle sınandı; yine de son sözü Power BI Desktop söyler.</p><p><b>Hazır sorgular</b></p><ul>' + qs + '<li><code>Folder.Files("C:\\Veri\\Satis")</code>: benzetimli klasör (3 CSV, 1 TXT)</li></ul><p><b>İşlevler</b></p>' + Object.keys(groups).sort().map(g => '<p class="mfn"><b>' + esc(g) + '</b> ' + groups[g].map(n => n.slice(g.length + 1) || n).map(esc).join(', ') + '</p>').join('') + '</details>';
}
function mValueHTML(v) {
  const m = MM();
  if (m.isTable(v)) return '<p class="muted pqfoot">Tablo: ' + v.cols.length + ' sütun, ' + v.rows.length + ' satır</p>' + grid(v, { limit: 40 });
  const ty = m.typeName(v);
  if (ty === 'Record' && v.names.length) return '<p class="muted pqfoot">Kayıt</p><pre class="m">' + esc(m.fmt(v)) + '</pre>';
  return '<p class="muted pqfoot">' + esc(ty) + '</p><pre class="m">' + esc(m.fmt(v)) + '</pre>';
}
function mErrHTML(r) {
  const m = MM(); const t = r.kind === 'syntax' ? 'Söz dizimi hatası' : r.kind === 'runtime' ? 'M hatası' : r.kind === 'limit' ? 'Durduruldu' : 'Bu alt kümede yok';
  return '<div class="msg err" role="alert"><b>' + t + '</b>' + esc(m.errorText(r)) + (r.kind === 'unsupported' || r.kind === 'connector' ? '<span class="vend">Bu bir kod hatası olmayabilir: yorumlayıcı küçük bir alt küme. Sonuç uydurmak yerine durur.</span>' : '') + '</div>';
}
function mEdHTML(id, code) {
  return '<textarea class="mta" id="' + id + '" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" rows="' + Math.min(18, Math.max(7, String(code).split('\n').length + 1)) + '" aria-label="M kodu editörü">' + esc(code) + '</textarea>';
}
function bindTA(ta, onChange, onRun) {
  ta.addEventListener('input', () => onChange && onChange(ta.value));
  ta.addEventListener('keydown', ev => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); onRun(); }
    else if (ev.key === 'Escape') { ta.blur(); C.toast('Düzenleyiciden çıktın; Tab ile sonraki öğeye geçebilirsin.'); }
    else if (ev.key === 'Tab' && !ev.shiftKey) { ev.preventDefault(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
    else if (ev.key === 'Enter') { const before = ta.value.slice(0, ta.selectionStart); const ln = before.split('\n').pop(); const ind = (ln.match(/^\s*/) || [''])[0] + (/(let|[(\[{,])\s*$/.test(ln) ? '    ' : ''); ev.preventDefault(); ta.setRangeText('\n' + ind, ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
  });
}
/* Lab sayfasındaki serbest editör */
const M_SAMPLES = [
  ['let ve adımlar', 'let\n    Kaynak = Satislar,\n    Filtre = Table.SelectRows(Kaynak, each [Tutar] <> null and [Tutar] > 1000),\n    KDV = Table.AddColumn(Filtre, "KDVli", each [Tutar] * 1.2, type number),\n    Sirali = Table.Sort(KDV, {{"Tutar", Order.Descending}})\nin\n    Sirali'],
  ['Pivot', 'Table.Pivot(Aylik_Satis, List.Distinct(Aylik_Satis[Ay]), "Ay", "Tutar", List.Sum)'],
  ['List.Accumulate', 'List.Accumulate({1, 2, 3, 4, 5}, 0, (toplam, x) => toplam + x)'],
  ['Özel fonksiyon', 'let\n    KdvEkle = (tutar as number, optional oran as nullable number) as number =>\n        tutar * (1 + (oran ?? 0.2))\nin\n    [Varsayilan = KdvEkle(100), Yuzde10 = KdvEkle(100, 0.1)]'],
  ['Klasörden birleştir', 'let\n    Dosyalar = Folder.Files("C:\\Veri\\Satis"),\n    Csvler = Table.SelectRows(Dosyalar, each [Extension] = ".csv"),\n    Oku = (ikili as binary) as table => Table.PromoteHeaders(Csv.Document(ikili, [Delimiter = ";"])),\n    Tablolar = Table.AddColumn(Csvler, "Veri", each Oku([Content])),\n    Sade = Table.SelectColumns(Tablolar, {"Name", "Veri"}),\n    Acik = Table.ExpandTableColumn(Sade, "Veri", {"Tarih", "Bayi", "Tutar"})\nin\n    Acik'],
  ['Hata yönetimi', 'let\n    Ham = #table({"Kod", "Tutar"}, {{"A", "120"}, {"B", "yok"}, {"C", "75"}}),\n    Sayi = Table.AddColumn(Ham, "Sayi", each try Number.From([Tutar]) otherwise null, type number)\nin\n    Sayi']
];
const MF = { code: M_SAMPLES[0][1], out: '' };
function mFreeHTML() {
  return '<section class="lvl-block" id="mFree"><div class="sec-head"><div><span class="eyebrow">M editörü</span><h2>M kodu yaz, çalıştır</h2></div></div><div class="panel pqwrap mbox"><p class="muted" style="margin:0 0 8px">' + esc(M_NOTE + MM().LIMIT) + '</p><div class="row" style="gap:6px;margin-bottom:8px">' + M_SAMPLES.map((s, i) => '<button class="btn sm ghost" data-mq="sample" data-i="' + i + '">' + esc(s[0]) + '</button>').join('') + '</div>' + mEdHTML('mFreeTa', MF.code) + '<div class="row" style="gap:8px;margin-top:8px"><button class="btn pri" data-mq="run">Çalıştır</button><span class="muted" style="font-size:.78rem">Ctrl + Enter</span></div><div id="mOut">' + MF.out + '</div>' + supportedHTML() + '</div></section>';
}
function mountFree() { const ta = $('#mFreeTa'); if (!ta) return; bindTA(ta, v => { MF.code = v; }, runFree); }
function runFree() { const r = MM().run(MF.code); MF.out = r.ok ? mValueHTML(r.value) : mErrHTML(r); const o = $('#mOut'); if (o) o.innerHTML = MF.out; }
/* Ders ve Pratik alıştırması */
let MX = null;
const mTarget = e => { const r = MM().run(e.sol); if (!r.ok) throw new Error('M çözümü çalışmadı: ' + MM().errorText(r)); return r.value; };
const stripC = s => String(s).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ').replace(/"(?:[^"]|"")*"/g, '""');
function mLessonView(e, k) {
  const solved = P.ex[k]; const tv = mTarget(e);
  let h = '<div class="panel brief pqbrief"><div class="row" style="justify-content:space-between"><span class="eyebrow">M kodu alıştırması' + (solved ? ' · çözüldü' : '') + '</span><span class="chip pqc">M alt kümesi</span></div><div class="q">' + e.q + '</div>';
  h += '<div class="row" style="gap:8px"><button class="btn sm" data-act="hint">İpucu</button></div><div id="hintBox"></div>';
  h += '<details class="pqtarget"><summary>Hedef sonuç</summary>' + mValueHTML(tv) + '</details></div>';
  h += '<div class="panel pqwrap mbox">' + mEdHTML('mTa', P.drafts[k] != null ? P.drafts[k] : (e.start || '')) + '<div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn" data-mq="xrun">Çalıştır</button><button class="btn pri" data-mq="check">Kontrol et</button><button class="btn sm ghost" data-mq="sol">Çözümü göster</button><button class="btn sm ghost" data-mq="reset">Baştan başla</button><span class="muted" style="font-size:.78rem">Ctrl + Enter kontrol eder</span></div><div id="mRes"></div><div id="mOut"></div><div id="mSol"></div>' + supportedHTML() + '</div>';
  return h;
}
function mMount(e, k, onSolved) {
  MX = { e, k, onSolved }; const ta = $('#mTa'); if (!ta) return;
  bindTA(ta, v => { P.drafts[k] = v; C.save(); }, () => mCheck());
  if (P.ex[k] && P.drafts[k] != null) mCheck(true);
}
function mCheck(silent) {
  const { e, onSolved } = MX; const ta = $('#mTa'), res = $('#mRes'), out = $('#mOut'); const src = ta.value;
  if (!src.trim()) { res.innerHTML = '<div class="msg info"><b>Editör boş</b>Önce M kodunu yaz.</div>'; return; }
  const r = MM().run(src);
  if (!r.ok) { out.innerHTML = ''; res.innerHTML = mErrHTML(r); if (!silent && r.kind !== 'unsupported' && r.kind !== 'connector') C.noteWrong(C.curX()); return; }
  out.innerHTML = '<details class="pqtarget" open><summary>Senin sonucun</summary>' + mValueHTML(r.value) + '</details>';
  const c = MM().compareResult(r.value, mTarget(e), { ordered: !!e.ordered, types: !!e.types });
  if (!c.ok) { res.innerHTML = '<div class="msg err" role="alert"><b>Henüz değil</b>' + esc(c.msg) + '</div>'; if (!silent) C.noteWrong(C.curX()); return; }
  const missing = (e.must || []).filter(f => !stripC(src).includes(f));
  if (missing.length) { res.innerHTML = '<div class="msg info"><b>Sonuç doğru, ama görev başka</b>Bu görevde şu işlevi kullan: ' + missing.map(esc).join(', ') + '.</div>'; return; }
  res.innerHTML = '<div class="msg ok"><b>Doğru!</b>Kodun hedefle aynı sonucu üretiyor. Unutma: Burada doğrulayan bir alt küme yorumlayıcısı; Power BI Desktop’ta da aynı kod çalışır, ama bağlayıcı ve katlama davranışını yalnız orada görürsün.</div>';
  if (onSolved) onSolved(silent);
}
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-mq]'); if (!t) return; const a = t.dataset.mq;
  if (a === 'run') { const ta = $('#mFreeTa'); if (ta) MF.code = ta.value; runFree(); return; }
  if (a === 'sample') { const ta = $('#mFreeTa'); MF.code = M_SAMPLES[+t.dataset.i][1]; ta.value = MF.code; ta.rows = Math.min(18, Math.max(7, MF.code.split('\n').length + 1)); runFree(); return; }
  if (a === 'fromlab') { const qn = labQn(); if (!qn) return; const r = Q.run(E.src, E.steps); MF.code = Q.mCode({ m: qn }, r.states); const ta = $('#mFreeTa'); ta.value = MF.code; ta.rows = Math.min(18, Math.max(7, MF.code.split('\n').length + 1)); runFree(); ta.scrollIntoView({ block: 'center' }); return; }
  if (!MX) return;
  if (a === 'xrun') { const r = MM().run($('#mTa').value); $('#mRes').innerHTML = ''; $('#mOut').innerHTML = r.ok ? mValueHTML(r.value) : mErrHTML(r); return; }
  if (a === 'check') { mCheck(); return; }
  if (a === 'sol') { const o = $('#mSol'); o.innerHTML = o.innerHTML ? '' : '<div class="note"><b>Örnek çözüm</b><pre class="m">' + esc(MX.e.sol) + '</pre><button class="btn sm" data-mq="usesol">Editöre al</button></div>'; return; }
  if (a === 'usesol') { const ta = $('#mTa'); ta.value = MX.e.sol; ta.dispatchEvent(new Event('input')); return; }
  if (a === 'reset') { const ta = $('#mTa'); ta.value = MX.e.start || ''; ta.dispatchEvent(new Event('input')); $('#mRes').innerHTML = ''; $('#mOut').innerHTML = ''; return; }
});
/* Ders içindeki çalıştırılabilir kod blokları */
function mBlocks(root) {
  root.querySelectorAll('pre.m[data-run]').forEach(pre => {
    if (pre.dataset.done) return; pre.dataset.done = 1; const src = pre.textContent;
    const b = document.createElement('button'); b.className = 'btn sm mrunb'; b.type = 'button'; b.textContent = 'Çalıştır';
    const out = document.createElement('div'); out.className = 'mrunout';
    b.addEventListener('click', () => { const r = MM().run(src); out.innerHTML = r.ok ? mValueHTML(r.value) : mErrHTML(r); });
    pre.after(b); b.after(out);
  });
}
window.PBI_PQUI = { lessonView, mountLesson, grid, mLessonView, mMount, mBlocks };
})();
