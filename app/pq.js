/* Kesit Power BI — Power Query Lab arayüzü: şerit, formül çubuğu, sütun kalitesi, uygulanan adımlar, Gelişmiş Düzenleyici.
   Hem kendi sayfasında (#pq) hem de derslerin içinde “pq” türündeki alıştırmalarda kullanılır. */
(function () {
'use strict';
const C = window.PBI_CORE, Q = window.PBI_PQ, esc = C.esc, $ = C.$;
const OPS = Q.OPS, TYPES = Q.TYPES;
const TABS = [['home', 'Giriş', ['Giriş', 'Satırları kaldır']], ['tr', 'Dönüştür', ['Dönüştür', 'Biçim']]];
const P = C.P; P.pq = P.pq || {}; P.pqFree = P.pqFree || {};

let E = null; // etkin düzenleyici
function fresh(cfg) { return Object.assign({ steps: [], sel: [], view: null, form: null, fv: {}, adv: false, multi: false, tab: 'home', msg: null, res: null, solOpen: false }, cfg); }

/* ---------- Hücre ve tablo görünümü ---------- */
function cell(v) {
  if (Q.isErr(v)) return '<span class="pqerr" title="' + esc(v.pqErr) + '">Error</span>';
  if (v === null || v === undefined) return '<i class="pqnull">null</i>';
  if (v instanceof Date) return Q.fmtDate(v);
  if (typeof v === 'number') return v.toLocaleString('tr-TR', { maximumFractionDigits: 4 });
  if (v === '') return '<i class="pqnull">""</i>';
  const s = String(v); const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
  return (m[1] ? '<span class="pqsp">' + '·'.repeat(m[1].length) + '</span>' : '') + esc(m[2]) + (m[3] ? '<span class="pqsp">' + '·'.repeat(m[3].length) + '</span>' : '');
}
function grid(t, opt) {
  opt = opt || {}; const sel = opt.sel || []; const qs = opt.quality ? Q.quality(t) : null; const lim = opt.limit || 60;
  let h = '<div class="pqgrid"><table><thead><tr><th class="rn"></th>' + t.cols.map(c => '<th class="' + (sel.includes(c.name) ? 'on' : '') + '"' + (opt.click ? ' data-pqcol="' + esc(c.name) + '" tabindex="0" role="button" aria-pressed="' + sel.includes(c.name) + '"' : '') + '><span class="pqty' + (c.type === 'any' ? ' any' : '') + '"' + (opt.click ? ' data-pqtype="' + esc(c.name) + '" title="Veri türünü değiştir"' : '') + '>' + TYPES[c.type].label + '</span>' + esc(c.name) + '</th>').join('') + '</tr>';
  if (qs) h += '<tr class="pqq"><th class="rn"></th>' + qs.map(q => '<td><span class="qbar"><i class="ok" style="width:' + q.ok * 100 + '%"></i><i class="er" style="width:' + q.er * 100 + '%"></i><i class="em" style="width:' + q.em * 100 + '%"></i></span><small>Geçerli %' + Math.round(q.ok * 100) + (q.er ? ' · <b class="e">Hata %' + Math.round(q.er * 100) + '</b>' : '') + (q.em ? ' · Boş %' + Math.round(q.em * 100) : '') + '</small></td>').join('') + '</tr>';
  h += '</thead><tbody>' + t.rows.slice(0, lim).map((r, i) => '<tr><td class="rn">' + (i + 1) + '</td>' + r.map((v, j) => '<td class="' + (sel.includes(t.cols[j].name) ? 'on' : '') + (typeof v === 'number' ? ' nc' : '') + '">' + cell(v) + '</td>').join('') + '</tr>').join('') + (t.rows.length ? '' : '<tr><td class="rn"></td><td colspan="' + t.cols.length + '" class="pqnull">Tablo boş</td></tr>') + '</tbody></table></div>';
  if (t.rows.length > lim) h += '<p class="muted pqfoot">İlk ' + lim + ' satır gösteriliyor (' + t.rows.length + ' satır).</p>';
  return h;
}

/* ---------- Düzenleyici ---------- */
function state() { const r = Q.run(E.src, E.steps); const vi = E.view == null ? r.states.length - 1 : Math.min(E.view, r.states.length - 1); return { r, vi, cur: r.states[vi] }; }
function stepLabel(s) {
  const op = OPS[s.op]; const c = s.cols && s.cols.length ? ' · ' + s.cols.join(', ') : '';
  const extra = s.op === 'type' ? ' → ' + TYPES[s.to].name : s.op === 'replace' ? ' · “' + s.find + '” → ' + (String(s.repl).toLowerCase() === 'null' ? 'null' : '“' + s.repl + '”') : s.op === 'rename' ? ' → ' + s.to : s.op === 'removeTop' ? ' · ' + s.n : s.op === 'filter' ? ' · ' + ({ notnull: 'boş değil', null: 'boş', contains: 'içerir “' + s.v + '”' })[s.cmp] || ' ' + s.cmp + ' ' + s.v : s.op === 'group' ? ' · ' + s.name : '';
  return op.name + c + extra;
}
function ribbon() {
  return '<div class="pqrib"><div class="pqtabs" role="tablist">' + TABS.map(t => '<button role="tab" data-pqtab="' + t[0] + '" aria-selected="' + (E.tab === t[0]) + '">' + t[1] + '</button>').join('') + '<label class="pqmulti"><input type="checkbox" data-pqmulti' + (E.multi ? ' checked' : '') + '> Çoklu sütun seçimi</label></div><div class="pqbtns">' +
    TABS.find(t => t[0] === E.tab)[2].map(g => '<div class="pqgrp"><div>' + Object.keys(OPS).filter(k => OPS[k].group === g).map(k => '<button data-pqop="' + k + '" title="' + esc(OPS[k].what) + '" class="' + (E.form === k ? 'on' : '') + '">' + esc(OPS[k].name) + '</button>').join('') + '</div><span>' + g + '</span></div>').join('') + '</div></div>';
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
  else h += grid(t, { sel: E.sel, quality: true, click: true });
  h += '<div class="pqstatus"><span>' + (t ? t.cols.length + ' sütun, ' + t.rows.length + ' satır' : '—') + '</span><span>' + (vi < r.states.length - 1 ? 'Önizleme: “' + esc(cur.name) + '” adımı. <button class="lnk" data-pq="last">Son adıma dön</button>' : 'Son adım gösteriliyor') + '</span></div></div>';
  h += '<aside class="pqside"><div class="pqsteps"><b>Uygulanan adımlar</b><ol>' + r.states.map((s, i) => '<li class="' + (i === vi ? 'on' : '') + (s.error ? ' bad' : '') + '"><button data-pqview="' + i + '">' + esc(i === 0 ? 'Kaynak' : stepLabel(E.steps[i - 1])) + '</button>' + (i ? '<button class="x" data-pqdel="' + (i - 1) + '" aria-label="Adımı sil">×</button>' : '') + '</li>').join('') +
    E.steps.slice(r.states.length - 1).map((s, j) => '<li class="dead"><button disabled>' + esc(stepLabel(s)) + '</button><button class="x" data-pqdel="' + (r.states.length - 1 + j) + '" aria-label="Adımı sil">×</button></li>').join('') + '</ol>' + (E.steps.length ? '' : '<p class="muted" style="font-size:.8rem;margin:6px 0 0">Bir sütun başlığına tıkla, sonra şeritten bir komut seç. Her komut buraya bir adım ekler.</p>') + '</div>';
  h += '<details class="pqadv"' + (E.adv ? ' open' : '') + ' data-pqadv><summary>Gelişmiş Düzenleyici (M kodu)</summary><pre class="m">' + esc(Q.mCode(E.src, r.states)) + '</pre></details></aside></div>';
  return h;
}
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
const PQS = { src: 'bayi' };
function viewPQ() {
  const exs = C.LESSONS.flatMap(l => (l.ex || []).map((e, i) => ({ l, e, i })).filter(x => x.e.t === 'pq'));
  let h = '<div class="wrap" style="gap:16px">' + C.head('Araçlar', 'Power Query Lab', 'Kirli bir tabloyu adım adım temizle; her adım gerçek M koduna dönüşür. ' + Object.keys(OPS).length + ' komut, ' + Object.keys(Q.SOURCES).length + ' örnek kaynak, derslerde ' + exs.length + ' alıştırma.', 'pq');
  h += '<div class="pqsrcs" role="tablist">' + Object.keys(Q.SOURCES).map(id => '<button role="tab" data-pqsrc="' + id + '" aria-selected="' + (PQS.src === id) + '"><b>' + esc(Q.SOURCES[id].name) + '</b><small>' + Q.SOURCES[id].table.rows.length + ' satır · ' + Q.SOURCES[id].table.cols.length + ' sütun</small></button>').join('') + '</div>';
  h += '<p class="muted" style="margin:0;max-width:80ch">' + esc(Q.SOURCES[PQS.src].desc) + '</p><div class="panel pqwrap" id="pqHost"></div>';
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Derslerdeki alıştırmalar</span><h2>Hedef tabloya ulaş, kontrol ettir</h2></div></div><div class="panel lessons">' + exs.map(x => '<button class="litem" data-lesson="' + x.l.id + '" data-pqstep="' + (x.i + 1) + '"><span class="check ' + (P.ex[x.l.id + ':' + x.i] ? 'done' : '') + '">' + (P.ex[x.l.id + ':' + x.i] ? C.ic('tick', 3.2) : '') + '</span><span style="min-width:0"><b>' + esc(x.e.q.replace(/<[^>]+>/g, '').split('.')[0]) + '</b><small>' + esc(x.l.title) + ' · ' + esc(Q.SOURCES[x.e.src].name) + ' · örnek çözüm ' + x.e.sol.length + ' adım</small></span>' + C.lvBadge(x.l.lvl) + '</button>').join('') + '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Komut başvurusu</span><h2>Her komut ne yapar?</h2></div></div><div class="fgrid">' + Object.keys(OPS).map(k => '<div class="panel fcard"><b>' + esc(OPS[k].name) + ' <span class="chip">' + esc(OPS[k].group) + '</span></b><p>' + esc(OPS[k].what) + '</p><code class="syn">' + esc(OPS[k].m('#"Önceki Adım"', sample(k))) + '</code></div>').join('') + '</div></section>';
  return h + '</div>';
}
function sample(k) { return { cols: ['Sütun'], n: 1, to: k === 'type' ? 'number' : 'Yeni Ad', find: '-', repl: 'null', whole: true, v: '0', d: ' ', mode: 'first', cmp: '>', name: 'Toplam', agg: 'sum', src: 'Tutar' }; }
function mountPQ() {
  const id = PQS.src; E = fresh({ src: Q.SOURCES[id], steps: (P.pqFree[id] || []).map(s => Object.assign({}, s)), store: st => { P.pqFree[id] = st; C.save(); } });
  paint();
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
  if (op.single && E.sel.length > 1) { E.msg = ['err', '<b>Tek sütun seç.</b>“' + esc(op.name) + '” aynı anda yalnızca bir sütuna uygulanır.']; paint(); return; }
  if (!op.form) { addStep(k); return; }
  E.form = k; E.fv = {}; op.form.forEach(f => E.fv[f.k] = f.d);
  if (k === 'group') { const { cur } = state(); const t = cur.table; const num = t && t.cols.find(c => !E.sel.includes(c.name) && (c.type === 'number' || c.type === 'int')); E.fv.src = num ? num.name : (t && t.cols.find(c => !E.sel.includes(c.name)) || {}).name; }
  if (k === 'rename') E.fv.to = E.sel[0];
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
  if (a === 'ok') { readForm(); const op = OPS[E.form]; if (E.form === 'rename' && !String(E.fv.to || '').trim()) { E.msg = ['err', 'Yeni ad boş olamaz.']; paint(); return; } addStep(E.form, Object.assign({}, E.fv)); return; }
  if (a === 'cancel') { E.form = null; paint(); return; }
  if (a === 'last') { E.view = null; paint(); return; }
  if (a === 'check') { check(); return; }
  if (a === 'sol') { E.solOpen = !E.solOpen; paint(); return; }
  if (a === 'apply') { E.steps = E.ex.sol.map(s => Object.assign({}, s)); E.view = null; E.sel = []; E.res = null; persist(); paint(); return; }
  if (a === 'reset') { E.steps = []; E.view = null; E.sel = []; E.res = null; E.form = null; persist(); paint(); return; }
});
document.addEventListener('change', ev => { if (!E || !ev.target.matches('[data-pqf]')) return; readForm(); if (OPS[E.form] && (OPS[E.form].form || []).some(f => f.hideIf)) paint(); });
document.addEventListener('toggle', ev => { if (E && ev.target.matches && ev.target.matches('[data-pqadv]')) E.adv = ev.target.open; }, true);
document.addEventListener('keydown', ev => { if (!E) return; if (ev.key === 'Enter' && ev.target.matches('.pqform input.input')) { ev.preventDefault(); const b = document.querySelector('[data-pq="ok"]'); if (b) b.click(); } if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('th[data-pqcol]')) { ev.preventDefault(); ev.target.click(); } });

window.PBI_PQUI = { lessonView, mountLesson, grid };
})();
