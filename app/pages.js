/* Kesit Power BI sayfaları: Görseller (biçim bölmesi benzetimi), Dashboardlar, Ölçü Laboratuvarı, Püf Noktaları, Menüler, Final. */
(function () {
'use strict';
const C = window.PBI_CORE, X = C.X, V = C.V, MODEL = C.MODEL, esc = C.esc, $ = C.$;
const DC = window.PBI_DASHCORE, FP = window.PBI_FORMAT;
const pc = C.parseCol;
const Y24 = [{ t: 'Tarih', c: 'Yil', values: [2024] }];
const MS = () => C.measureSet();
const fmtOf = n => C.fmtOf(n);
const sortRows = (r, how) => { if (how === 'valueDesc') r.rows.sort((a, b) => (b.vals[0] || 0) - (a.vals[0] || 0)); else if (how === 'valueAsc') r.rows.sort((a, b) => (a.vals[0] || 0) - (b.vals[0] || 0)); return r; };
const cats = r => r.rows.map(x => x.keys[0]);
const col = (r, j) => r.rows.map(x => x.vals[j]);
const uniqK = (r, i, colRef) => { const out = []; r.rows.forEach(x => { if (!out.some(v => X.keyOf(v) === X.keyOf(x.keys[i]))) out.push(x.keys[i]); }); if (colRef) out.sort((a, b) => X.sortCompare(colRef, a, b)); return out; };
const pick = (r, a, b, j) => { const x = r.rows.find(z => X.keyOf(z.keys[0]) === X.keyOf(a) && X.keyOf(z.keys[1]) === X.keyOf(b)); return x ? x.vals[j || 0] : null; };
const pctS = v => v == null ? '—' : (v >= 0 ? '+' : '−') + Math.round(Math.abs(v) * 100) + '%';
const later = fn => setTimeout(fn, 16);

/* ======================================================================
   GÖRSELLER: Görselleştirmeler bölmesi benzetimi
   ====================================================================== */
const VS = { id: 'column', w: {}, f: {}, a: {}, g: {}, tab: 'build', last: null, sl: [], dpath: [] };
function vsDefaults(id) {
  const def = FP.visuals[id]; Object.assign(VS, { id, w: {}, f: {}, a: {}, g: {}, last: null, sl: [], dpath: [] });
  if (!def) return;
  def.wells.forEach(w => VS.w[w.k] = w.d);
  def.fmt.forEach(s => s.i.forEach(it => { if (it.t !== 'info') VS.f[it.k] = it.d; }));
  (def.an || []).forEach(it => VS.a[it.k] = it.d);
  FP.G.forEach(it => { if (it.t !== 'info') VS.g[it.k] = it.d; });
}
vsDefaults('column');
const simW = () => { const ww = window.innerWidth; const pane = ww > 1080 ? 380 : 0; return Math.max(270, Math.min(760, C.mainW() - pane - 70)); };
const slFor = cols => cols.some(c => /^Tarih\[(Yil|YilAy|YilCeyrek)\]$/.test(c)) ? [] : Y24;
const qq = (cols, vals, sl) => X.query({ rows: cols.map(pc), measures: MS(), values: vals, slicers: sl || slFor(cols), totals: true });
const label = k => (k.match(/\[(.+)\]$/) || [0, k])[1];
function tipFor(colRef, ks, sl) {
  const c = pc(colRef); const ms = MS();
  return i => { const f = (sl || []).concat([{ t: c.t, c: c.c, values: [ks[i]] }]); const r = X.query({ rows: [pc('Tarih[YilAy]')], measures: ms, values: ['Net Satış'], slicers: [{ t: c.t, c: c.c, values: [ks[i]] }], totals: false }); const yoy = X.evalMeasure(ms, '[YoY %]', f);
    return { title: 'Araç ipucu sayfası · ' + ks[i], cards: [['Net Satış', V.fmt(X.evalMeasure(ms, '[Net Satış]', f), 'para', true)], ['Geçen yıla göre', pctS(yoy)], ['Kâr marjı', V.fmt(X.evalMeasure(ms, '[Kâr Marjı %]', f), 'yuzde')]], spark: r.rows.map(x => x.vals[0]).slice(-12), sparkLabel: 'Son 12 ay net satış' }; };
}
function baseOpts() {
  const f = VS.f, a = VS.a; const o = { W: simW(), labels: !!f.labels, legend: f.legend || 'auto', grid: f.grid !== false, yMin: f.yMin || 'zero', units: f.units && f.units !== 'auto' ? f.units : undefined, colorMode: f.colorMode || 'series', lines: [] };
  if (f.gap) o.gap = +f.gap;
  if (a.avg) o.lines.push({ type: 'avg' }); if (a.median) o.lines.push({ type: 'median' }); if (a.minmax) o.lines.push({ type: 'min' }, { type: 'max' }); if (a.trend) o.lines.push({ type: 'trend' });
  if (a.forecast && a.forecast !== '0') o.forecast = +a.forecast;
  return o;
}
function constLine(o, xcol, vals, sl) { if (!VS.a.const) return; let t = null; try { const r = qq([xcol], ['Hedef'], sl); const hv = col(r, 0).filter(v => v != null); if (hv.length) t = hv.reduce((p, q) => p + q, 0) / hv.length; } catch (e) {} if (t == null) { const v = vals.filter(x => x != null); t = v.length ? v.reduce((p, q) => p + q, 0) / v.length * 1.1 : 0; } o.lines.push({ type: 'const', value: t, label: 'Hedef' }); }
const SIM = {
  column: () => barLike('column'), bar: () => barLike('bar'),
  stacked: () => { const w = VS.w, r = qq([w.x, w.leg], [w.y]); const xs = uniqK(r, 0, pc(w.x)), ls = uniqK(r, 1, pc(w.leg)); const o = baseOpts(); o.stacked = true; return { m: [w.y], html: V.column({ cats: xs.map(String), series: ls.map(l => ({ name: String(l), vals: xs.map(x => pick(r, x, l)) })), fmt: fmtOf(w.y) }, o), title: w.y + ' · ' + label(w.x) + ' ve ' + label(w.leg) }; },
  pct: () => { const w = VS.w, r = qq([w.x, w.leg], [w.y]); const xs = uniqK(r, 0, pc(w.x)), ls = uniqK(r, 1, pc(w.leg)); const o = baseOpts(); o.pct = true; return { m: [w.y], html: V.bar({ cats: xs.map(String), series: ls.map(l => ({ name: String(l), vals: xs.map(x => pick(r, x, l)) })), fmt: fmtOf(w.y) }, o), title: label(w.x) + ' başına ' + label(w.leg) + ' karışımı (%100)' }; },
  line: () => lineLike(false), area: () => lineLike(true),
  combo: () => { const w = VS.w, r = qq([w.x], [w.y, w.y2]); const o = baseOpts(); constLine(o, w.x, col(r, 0)); return { m: [w.y, w.y2], html: V.column({ cats: cats(r).map(String), series: [{ name: w.y, vals: col(r, 0) }, { name: w.y2, type: 'line', vals: col(r, 1), color: 'var(--s2)' }], fmt: fmtOf(w.y) }, o), title: w.y + ' ve ' + w.y2 }; },
  donut: () => { const w = VS.w, f = VS.f, r = qq([w.x], [w.y]); const ks = cats(r); return { m: [w.y], html: V.donut({ cats: ks, series: [{ name: w.y, vals: col(r, 0) }], fmt: fmtOf(w.y) }, { W: Math.min(simW(), 460), inner: +f.inner, labelMode: f.labelMode, legend: f.legend, tipx: VS.g.tooltip === 'page' ? tipFor(w.x, ks, Y24) : null }), title: label(w.x) + ' payı · 2024' }; },
  treemap: () => { const w = VS.w, f = VS.f; const isU = w.x === 'Urunler[Urun]'; const r = sortRows(qq(isU ? [w.x, 'Urunler[Kategori]'] : [w.x], [w.y]), 'valueDesc'); r.rows = r.rows.filter(x => x.vals[0] > 0).slice(0, 24); return { m: [w.y], html: V.treemap({ cats: cats(r), series: [{ name: w.y, vals: col(r, 0) }], fmt: fmtOf(w.y), groups: isU && f.group ? r.rows.map(x => x.keys[1]) : null }, { W: simW(), labels: f.labels, tipx: VS.g.tooltip === 'page' && !isU ? tipFor(w.x, cats(r), Y24) : null }), title: label(w.x) + ' payları (ilk 24)' }; },
  waterfall: () => { const w = VS.w, f = VS.f; const gy = w.y === 'Net Satış' ? 'Satış GY' : 'CALCULATE([Brüt Kâr], SAMEPERIODLASTYEAR(Tarih[Tarih]))'; const r = qq([w.x], [w.y, gy]); const st = X.evalMeasure(MS(), w.y === 'Net Satış' ? '[Satış GY]' : gy, Y24); return { m: [w.y, 'Satış GY'], html: V.waterfall({ cats: cats(r), series: [{ name: 'Değişim', vals: r.rows.map(x => (x.vals[0] || 0) - (x.vals[1] || 0)) }], fmt: 'para' }, { W: simW(), start: st, startLabel: '2023', endLabel: '2024', showTotal: f.showTotal, labels: f.labels }), title: w.y + ': 2023 → 2024 köprüsü, ' + label(w.x) + ' katkıları' }; },
  funnel: () => { const w = VS.w, f = VS.f; const web = /Web/.test(w.x); const r = X.query({ rows: [pc(w.x)], measures: MS(), values: [web ? 'Ziyaretçi' : 'COUNTROWS(Satislar)'], slicers: web ? [] : Y24, totals: false }); const rows = web ? r.rows : r.rows.slice(); return { m: web ? ['Ziyaretçi'] : [], html: V.funnel({ cats: rows.map(x => x.keys[0]), series: [{ name: web ? 'Ziyaretçi' : 'Satır', vals: rows.map(x => x.vals[0]) }], fmt: 'adet' }, { W: simW(), conv: f.conv, labels: f.labels }), title: web ? 'Web dönüşüm hunisi' : 'Sipariş durumu' }; },
  scatter: () => { const w = VS.w, f = VS.f, a = VS.a; const vals = [w.mx, w.my].concat(w.size ? [w.size] : []); const r = qq([w.x].concat(w.leg ? [w.leg] : []), vals); const pts = r.rows.filter(x => x.vals[0] != null && x.vals[1] != null).map(x => ({ label: x.keys[0], g: w.leg ? x.keys[1] : null, x: x.vals[0], y: x.vals[1], s: w.size ? x.vals[2] : null })); return { m: vals, html: V.scatter(pts, { W: simW(), xfmt: fmtOf(w.mx), yfmt: fmtOf(w.my), sfmt: 'adet', xlabel: w.mx, ylabel: w.my, slabel: w.size, bubble: !!w.size, labels: f.ptLabels, quadrants: a.quadrants, trend: a.trend, grid: f.grid !== false }), title: label(w.x) + ': ' + w.mx + ' × ' + w.my }; },
  map: () => { const w = VS.w, f = VS.f; const r = qq([w.x], [w.y]); const geo = MODEL.geo || {}; const ks = cats(r); return { m: [w.y], html: V.map(ks.map((k, i) => ({ ll: geo[k], v: r.rows[i].vals[0], label: k, i })), { W: simW(), maxR: +f.maxR, labels: f.labels }), title: 'Şehre göre ' + w.y }; },
  card: () => { const w = VS.w, f = VS.f; const v = X.evalMeasure(MS(), '[' + w.y + ']', Y24); return { m: [w.y], html: '<div style="max-width:320px">' + V.card(v, w.y + ' · 2024', fmtOf(w.y), null, { units: f.units === 'auto' ? undefined : f.units, showLabel: f.showLabel }) + '</div>', title: w.y }; },
  kpi: () => { const w = VS.w, f = VS.f, ms = MS(); const v = X.evalMeasure(ms, '[' + w.y + ']', Y24), t = X.evalMeasure(ms, '[' + w.t + ']', Y24); const r = qq(['Tarih[Ay]'], [w.y]); return { m: [w.y, w.t], html: '<div style="max-width:340px">' + V.kpi(v, t, w.y + ' · 2024', fmtOf(w.y), w.t === 'Hedef' ? 'hedefe göre' : 'geçen yıla göre', { goal: f.goal, direction: f.direction, spark: col(r, 0), trend: f.trend, units: f.units === 'auto' ? undefined : f.units }) + '</div>', title: w.y + ' ve ' + w.t }; },
  gauge: () => { const w = VS.w, f = VS.f, ms = MS(); const v = X.evalMeasure(ms, '[' + w.y + ']', Y24), t = X.evalMeasure(ms, '[' + w.t + ']', Y24); const mx = f.gaugeMax === 'tgt2' ? t * 2 : Math.max(v || 0, t || 0) * 1.25; return { m: [w.y, w.t], html: '<div style="max-width:360px;margin:auto">' + V.gauge(v, t, mx, 'para', 'Gösterge', { showTarget: f.showTarget }) + '</div>', title: w.y + ' · hedefe göre' }; },
  bullet: () => { const w = VS.w; const r = qq([w.x], [w.y, w.t]); return { m: [w.y, w.t], html: V.bullet(r.rows.map(x => ({ c: x.keys[0], v: x.vals[0], t: x.vals[1] })), { W: simW(), fmt: 'para' }), title: w.y + ' ve ' + w.t + ' · ' + label(w.x) }; },
  table: () => { const w = VS.w, f = VS.f; const ms = ['Net Satış', 'Satılan Adet', 'Kâr Marjı %']; const r = sortRows(qq([w.x], ms), 'valueDesc'); r.rows = r.rows.filter(x => x.vals[0] != null).slice(0, 12); const avg = col(r, 0).reduce((p, q) => p + (q || 0), 0) / Math.max(1, r.rows.length); return { m: ms, html: V.table([label(w.x)].concat(ms), r.rows.map(x => [x.keys[0]].concat(x.vals)), { fmts: [null, 'para', 'adet', 'yuzde'], cf: f.cf && f.cf !== 'none' ? { 1: f.cf } : null, cfTarget: avg, total: ['Toplam'].concat(r.total), totals: f.totals, banded: f.banded, compact: f.compact, units: f.units === 'auto' ? undefined : f.units }), title: 'İlk 12 · ' + label(w.x) + ' · 2024' }; },
  matrix: () => { const w = VS.w, f = VS.f; const sl = w.c === 'Tarih[Yil]' ? [] : Y24; const r = qq([w.x, w.c], [w.y], sl); const ks = uniqK(r, 0, pc(w.x)), cs = uniqK(r, 1, pc(w.c)); const ms = MS(); const rowT = ks.map(k => X.evalMeasure(ms, '[' + w.y + ']', sl.concat([Object.assign(pc(w.x), { values: [k] })]))); const colT = cs.map(c => X.evalMeasure(ms, '[' + w.y + ']', sl.filter(s => !(s.t === pc(w.c).t && s.c === pc(w.c).c)).concat([Object.assign(pc(w.c), { values: [c] })]))); const fm = fmtOf(w.y); const cf = f.cf && f.cf !== 'none' ? Object.fromEntries(cs.map((c, i) => [i + 1, f.cf])) : null; return { m: [w.y], html: V.table([label(w.x)].concat(cs.map(String)).concat(['Toplam']), ks.map((k, i) => [k].concat(cs.map(c => pick(r, k, c))).concat([rowT[i]])), { fmts: [null].concat(cs.map(() => fm)).concat([fm]), cf, total: ['Toplam'].concat(colT).concat(r.total), totals: f.totals, banded: f.banded }), title: w.y + ' · ' + label(w.x) + ' × ' + label(w.c) }; },
  slicer: () => { const w = VS.w, f = VS.f; const c = pc(w.x); const vals = [...new Set(MODEL.tables[c.t].rows.map(r => r[c.c]).filter(v => v != null))].sort((a, b) => X.sortCompare(c, a, b)); const sl = VS.sl.length ? [{ t: c.t, c: c.c, values: VS.sl }] : []; const xcol = c.c === 'Kategori' ? 'Satislar[Kanal]' : 'Kategoriler[Kategori]'; const r = X.query({ rows: [pc(xcol)], measures: MS(), values: ['Net Satış'], slicers: sl, totals: true }); return { m: ['Net Satış'], html: V.slicer('vs', label(w.x), vals, VS.sl, { style: f.style }) + '<div class="sl-demo"><span class="eyebrow">Aynı sayfadaki görsel: ' + label(xcol) + ' (' + (VS.sl.length ? VS.sl.join(', ') : 'filtre yok') + ')</span>' + V.column({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { W: simW(), labels: true }) + '<div class="vtot"><span>Filtre bağlamındaki toplam</span><b>' + V.fmt(r.total[0], 'para') + '</b></div></div>', title: 'Dilimleyici: ' + label(w.x) }; },
  decomp: () => { const w = VS.w; const ord = { 'K>N>S': ['Kategoriler[Kategori]', 'Satislar[Kanal]', 'Musteriler[Segment]'], 'S>K>N': ['Musteriler[Segment]', 'Kategoriler[Kategori]', 'Satislar[Kanal]'], 'N>B>S': ['Satislar[Kanal]', 'Musteriler[Bolge]', 'Musteriler[Segment]'] }[w.x]; const ms = MS(); const levels = [{ title: w.y, items: [{ c: 'Toplam', v: X.evalMeasure(ms, '[' + w.y + ']', Y24), open: true }] }]; let sl = Y24.slice(); for (let d = 0; d < ord.length && d <= VS.dpath.length; d++) { const r = sortRows(X.query({ rows: [pc(ord[d])], measures: ms, values: [w.y], slicers: sl, totals: false }), 'valueDesc'); levels.push({ title: label(ord[d]), items: r.rows.map(x => ({ c: String(x.keys[0]), v: x.vals[0], open: VS.dpath[d] != null && X.keyOf(VS.dpath[d]) === X.keyOf(x.keys[0]) })) }); if (VS.dpath[d] == null) break; sl = sl.concat([Object.assign(pc(ord[d]), { values: [VS.dpath[d]] })]); } VS._dord = ord; return { m: [w.y], html: '<div class="hscroll">' + V.decomp(levels, { W: simW(), fmt: fmtOf(w.y) }) + '</div><p class="muted" style="font-size:.85rem;margin:6px 0 0">Bir düğüme tıkla: sıradaki boyuta göre dallanır. Kök düğüme tıklamak ağacı sıfırlar.</p>', title: 'Ayrıştırma ağacı · ' + w.y }; },
  pareto: () => { const w = VS.w, f = VS.f; const r = sortRows(qq([w.x], [w.y]), 'valueDesc'); r.rows = r.rows.filter(x => x.vals[0] > 0); const v = col(r, 0); const tot = v.reduce((p, q) => p + q, 0); let acc = 0; const cum = v.map(x => (acc += x) / tot); const mx = Math.max(...v); const n80 = cum.findIndex(c => c >= 0.8) + 1; const o = { W: simW(), labels: f.labels && v.length <= 15, legend: 'top', lines: VS.a.const ? [{ type: 'const', value: 0.8 * mx, label: '%80' }] : [] }; return { m: ['Net Satış', 'Kümülatif Pay %'], html: '<div class="tsub">Satışın %80’i ilk <b>' + n80 + '</b> kalemden (' + v.length + ' kalemden) geliyor.</div>' + V.column({ cats: cats(r).map(c => String(c).split(' ')[0]), series: [{ name: w.y, vals: v }, { name: 'Birikimli pay (ölçekli)', type: 'line', vals: cum.map(c => c * mx), color: 'var(--s2)' }], fmt: 'para' }, o), title: 'Pareto: ' + label(w.x) }; }
};
function barLike(kind) {
  const w = VS.w, f = VS.f; const o = baseOpts(); const fm = fmtOf(w.y);
  if (w.sm) { const smc = pc(w.sm); const vals = [...new Set(MODEL.tables[smc.t].rows.map(r => r[smc.c]))].sort((a, b) => X.sortCompare(smc, a, b)); const ww = Math.max(220, Math.floor(simW() / Math.min(3, vals.length)) - 12); return { m: [w.y], html: '<div class="smgrid">' + vals.map(v => { const r = X.query({ rows: [pc(w.x)], measures: MS(), values: [w.y], slicers: slFor([w.x]).concat([{ t: smc.t, c: smc.c, values: [v] }]), totals: false }); sortRows(r, f.sort); return '<div><span class="eyebrow">' + esc(v) + '</span>' + V.column({ cats: cats(r).map(String), series: [{ name: w.y, vals: col(r, 0) }], fmt: fm }, Object.assign({}, o, { W: ww, H: 180, lines: [] })) + '</div>'; }).join('') + '</div>', title: w.y + ' · ' + label(w.x) + ' (küçük katlar: ' + label(w.sm) + ')' }; }
  let data, xs, r;
  if (w.leg) { r = qq([w.x, w.leg], [w.y]); xs = uniqK(r, 0, pc(w.x)); const ls = uniqK(r, 1, pc(w.leg)); data = { cats: xs.map(String), series: ls.map(l => ({ name: String(l), vals: xs.map(x => pick(r, x, l)) })), fmt: fm }; }
  else { r = qq([w.x], [w.y].concat(w.y2 ? [w.y2] : [])); sortRows(r, f.sort); if (w.topn) r.rows = r.rows.slice(0, +w.topn); xs = cats(r); data = { cats: xs.map(String), series: [{ name: w.y, vals: col(r, 0) }].concat(w.y2 ? [{ name: w.y2, vals: col(r, 1) }] : []), fmt: fm }; }
  constLine(o, w.x, data.series[0].vals);
  if (VS.g.tooltip === 'page' && !w.leg) o.tipx = tipFor(w.x, xs, slFor([w.x]));
  return { m: [w.y].concat(w.y2 ? [w.y2] : []), html: V[kind](data, o), title: w.y + (w.y2 ? ' ve ' + w.y2 : '') + ' · ' + label(w.x) + (w.leg ? ' ve ' + label(w.leg) : '') + (slFor([w.x]).length ? ' · 2024' : '') };
}
function lineLike(areaDefault) {
  const w = VS.w, f = VS.f; const o = baseOpts(); Object.assign(o, { width: +f.width || 2, interp: f.interp, markers: f.markers, area: f.area != null ? f.area : areaDefault });
  const fm = fmtOf(w.y); let data;
  if (w.leg) { const r = qq([w.x, w.leg], [w.y]); const xs = uniqK(r, 0, pc(w.x)), ls = uniqK(r, 1, pc(w.leg)); data = { cats: xs.map(String), series: ls.map(l => ({ name: String(l), vals: xs.map(x => pick(r, x, l)) })), fmt: fm }; }
  else { const r = qq([w.x], [w.y].concat(w.y2 ? [w.y2] : [])); data = { cats: cats(r).map(String), series: [{ name: w.y, vals: col(r, 0) }].concat(w.y2 ? [{ name: w.y2, vals: col(r, 1), dash: true, color: 'var(--axis)', width: 1.5 }] : []), fmt: fm }; }
  constLine(o, w.x, data.series[0].vals);
  return { m: [w.y].concat(w.y2 ? [w.y2] : []), html: V.line(data, o), title: w.y + (w.y2 ? ' ve ' + w.y2 : '') + ' · ' + label(w.x) + (slFor([w.x]).length ? ' · 2024' : '') };
}
const VIS = () => window.PBI_VISUALS;
function viewVisuals() {
  const L = VIS(); const groups = [...new Set(L.map(v => v.cat))];
  let h = '<div class="wrap" style="gap:16px">' + C.head('Görselleştirme', 'Görseller ve Biçim bölmesi', L.length + ' görsel türü. Bir görsel seç, sağdaki bölmede ayarları değiştir: ne olduğunu anında gör ve oku.', 'visuals');
  h += '<nav class="vstrip" aria-label="Görsel türleri">' + groups.map(g => '<div class="vsg"><span class="eyebrow">' + esc(g) + '</span><div class="vsg-row">' + L.filter(v => v.cat === g).map(v => '<button data-vsel="' + v.id + '" aria-pressed="' + (v.id === VS.id) + '" title="' + esc(v.name) + '">' + V.thumb(v.id) + '<span>' + esc(v.name) + '</span></button>').join('') + '</div></div>').join('') + '</nav>';
  h += '<div class="vsim"><section class="panel vcanvas" id="vsCanvas"></section><aside class="panel vpane" id="vsPane" aria-label="Görselleştirmeler bölmesi"></aside></div></div>';
  return h;
}
function paintVS(paneToo) {
  const cv = $('#vsCanvas'); if (!cv) return; const v = VIS().find(x => x.id === VS.id) || {}; const def = FP.visuals[VS.id];
  let h = '<div class="vc-head"><div><span class="eyebrow">' + esc(v.cat || '') + '</span><h2>' + esc(v.name || VS.id) + '</h2></div>' + V.thumb(VS.id) + '</div>';
  h += VS.last ? '<div class="vlast" role="status"><b>Ne değişti?</b> <span class="chip">' + esc(VS.last.l) + ': ' + esc(VS.last.v) + '</span><p>' + esc(VS.last.does || '') + '</p>' + (VS.last.when ? '<p class="muted"><b>Ne zaman kullanılır?</b> ' + esc(VS.last.when) + '</p>' : '') + '</div>' : '<div class="vlast idle">Sağdaki bölmeden bir ayarı değiştir: grafik anında güncellenir ve burada ne olduğu açıklanır.</div>';
  if (!def || !SIM[VS.id]) { h += '<div class="msg info"><b>Canlı benzetim yok</b>Bu görsel Power BI’ın kendi hizmetine dayanır (ör. şerit grafiğin sıralama animasyonu). Kullanım notları aşağıda.</div>'; }
  else { let r; try { r = SIM[VS.id](); } catch (e) { console.error(e); r = { html: '<div class="msg err">' + esc(e.message) + '</div>', m: [] }; }
    const g = VS.g; h += '<div class="vframe' + (g.border ? ' bd' : '') + (g.shadow ? ' sh' : '') + (g.bg === false ? ' nobg' : '') + '">' + (g.title !== false ? '<div class="vtitle">' + esc(r.title || '') + '</div>' : '') + r.html + '</div>';
    if (g.tooltip === 'page') h += '<p class="muted" style="font-size:.84rem;margin:0">Araç ipucu türü “Rapor sayfası”: bir çubuğun/dilimin üzerine gel.</p>';
    VS._m = r.m; }
  h += '<div class="vwhen"><div class="tip"><b>Ne zaman?</b>' + esc(v.when || '') + '</div><div class="warn"><b>Kaçın</b>' + esc(v.avoid || '') + '</div></div><div class="note"><b>Tipik alan kutuları</b>' + esc(v.fields || '') + '</div>';
  if (VS._m && VS._m.length) h += C.daxBlock(VS._m.filter(n => C.LIBMAP[n]), 'Bu görseldeki ölçülerin DAX’ı');
  cv.innerHTML = h; C.enhance(cv); C.bindMarks();
  if (paneToo) paintPane();
}
function ctl(it, kind) {
  const val = VS[kind][it.k]; const dk = 'data-vs' + kind;
  if (it.t === 'toggle') return '<button class="sw" ' + dk + '="' + it.k + '" aria-pressed="' + (!!val) + '" aria-label="' + esc(it.l) + '"><i></i></button>';
  if (it.t === 'select') return '<select ' + dk + '="' + it.k + '" aria-label="' + esc(it.l) + '">' + it.o.map(o => '<option value="' + esc(o[0]) + '"' + (String(val) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
  return '';
}
const pitem = (it, kind) => '<div class="pitem"><div class="prow"><span class="pl">' + esc(it.l) + '</span>' + ctl(it, kind) + '</div>' + (it.does ? '<p class="pdoes"><b>Ne yapar:</b> ' + esc(it.does) + '</p>' : '') + (it.when ? '<p class="pwhen"><b>Ne zaman:</b> ' + esc(it.when) + '</p>' : '') + '</div>';
function paintPane() {
  const pane = $('#vsPane'); if (!pane) return; const def = FP.visuals[VS.id];
  const tabs = [['build', 'Oluştur'], ['fmt', 'Biçim'], ['an', 'Analiz'], ['gen', 'Genel']];
  let h = '<div class="ptabs" role="tablist">' + tabs.map(([k, t]) => '<button role="tab" data-vstab="' + k + '" aria-selected="' + (VS.tab === k) + '">' + t + '</button>').join('') + '</div><div class="pbody">';
  if (!def) h += '<p class="muted">Bu görselin bölme benzetimi yok.</p>';
  else if (VS.tab === 'build') { h += '<p class="pintro">Alan kutuları (Power BI: Görselleştirmeler → <b>Görsel oluştur</b>). Veri bölmesinden alanları sürükleyip bırakmanın karşılığı.</p>' + def.wells.map(w => '<div class="pitem"><div class="prow"><span class="pl">' + esc(w.l) + '</span><select data-vsw="' + w.k + '" aria-label="' + esc(w.l) + '">' + w.o.map(o => '<option value="' + esc(o[0]) + '"' + (VS.w[w.k] === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select></div><p class="pdoes">' + esc(w.does) + '</p></div>').join(''); }
  else if (VS.tab === 'fmt') { h += '<p class="pintro">Görselin biçimi (Power BI: <b>Görseli biçimlendir → Görsel</b>).</p>' + (def.fmt.length ? def.fmt.map(s => '<details open class="psec"><summary>' + esc(s.s) + '</summary>' + s.i.map(it => pitem(it, 'f')).join('') + '</details>').join('') : '<p class="muted">Bu görselde ek biçim seçeneği benzetilmedi.</p>'); }
  else if (VS.tab === 'an') { h += '<p class="pintro">Analiz bölmesi (büyüteç simgesi): referans çizgileri, eğilim ve tahmin.</p>' + ((def.an || []).length ? def.an.map(it => pitem(it, 'a')).join('') : '') + (def.anNote ? '<div class="note">' + esc(def.anNote) + '</div>' : (def.an || []).length ? '' : '<p class="muted">Bu görsel türünde Analiz bölmesi yok.</p>'); }
  else { h += '<p class="pintro">Tüm görsellerde ortak ayarlar (Power BI: <b>Görseli biçimlendir → Genel</b>).</p>' + FP.G.map(it => it.t === 'info' ? '<div class="pitem"><div class="prow"><span class="pl">' + esc(it.l) + '</span><span class="chip">bilgi</span></div><p class="pdoes">' + esc(it.does) + '</p><p class="pwhen"><b>Ne zaman:</b> ' + esc(it.when) + '</p></div>' : pitem(it, 'g')).join(''); }
  pane.innerHTML = h + '</div><div class="pfoot"><button class="btn sm ghost" data-vsreset>Varsayılanlara dön</button></div>';
}
function findItem(kind, k) {
  const def = FP.visuals[VS.id];
  if (kind === 'w') return def.wells.find(w => w.k === k);
  if (kind === 'f') { for (const s of def.fmt) { const it = s.i.find(i => i.k === k); if (it) return it; } }
  if (kind === 'a') return (def.an || []).find(i => i.k === k);
  if (kind === 'g') return FP.G.find(i => i.k === k);
  return null;
}
function vsSet(kind, k, val) {
  VS[kind][k] = val; const it = findItem(kind, k) || {};
  const vl = typeof val === 'boolean' ? (val ? 'Açık' : 'Kapalı') : ((it.o || []).find(o => String(o[0]) === String(val)) || [0, val])[1];
  VS.last = { l: it.l || k, v: vl, does: it.does, when: it.when };
  if (VS.id === 'decomp' && kind === 'w') VS.dpath = [];
  paintVS();
}
C.view('visuals', { render: viewVisuals, mount: () => paintVS(true), resize: () => paintVS(), hash: 'gorseller' });

/* ======================================================================
   DASHBOARDLAR
   ====================================================================== */
const DASHES = window.PBI_DASHES || [];
const DMAP = {}; DASHES.forEach(d => DMAP[d.id] = d);
const DB = { id: 'ozet', tab: 'rapor', states: {}, cats: {}, insp: null };
const stOf = d => DB.states[d.id] || (DB.states[d.id] = DC.initState(d));
function slicerHTML(d, st, scope) {
  return '<div class="dash-sl">' + (d.slicers || []).map(k => { const s = DC.SL[k]; if (!s) return ''; const sel = st.sl[k] || [];
    if (s.style === 'dropdown') return '<div class="slicer"><span class="eyebrow">' + esc(s.label) + '</span><select class="sl-dd" data-dsl="' + k + '" data-scope="' + scope + '" aria-label="' + esc(s.label) + '">' + (s.req ? '' : '<option value="">' + (s.rls ? 'Yönetici (rol yok)' : 'Tümü') + '</option>') + s.vals.map(v => '<option value="' + esc(JSON.stringify(v)) + '"' + (sel.length === 1 && X.keyOf(sel[0]) === X.keyOf(v) ? ' selected' : '') + '>' + esc(s.fmtv ? s.fmtv(v) : V.fmt(v)) + '</option>').join('') + '</select></div>';
    return '<div class="slicer"><span class="eyebrow">' + esc(s.label) + '</span><div class="sl-opts">' + s.vals.map(v => '<button data-dslb="' + k + '" data-scope="' + scope + '" data-v="' + esc(JSON.stringify(v)) + '" aria-pressed="' + sel.some(x => X.keyOf(x) === X.keyOf(v)) + '">' + esc(s.fmtv ? s.fmtv(v) : V.fmt(v)) + '</button>').join('') + '</div></div>'; }).join('') + '</div>';
}
function drillTools(t, st) {
  if (!t.drill) return '';
  const dr = st.drill[t.id] || { lv: 0, path: [], mode: false }; const n = t.drill.length;
  return '<span class="drillb"><button data-drill="up" data-tile="' + t.id + '" title="Detaya inme: yukarı çık" aria-label="Yukarı çık"' + (dr.lv ? '' : ' disabled') + '>⬆</button><button data-drill="mode" data-tile="' + t.id + '" title="Detaya inme modu: açıkken bir çubuğa tıkla" aria-pressed="' + !!dr.mode + '" aria-label="Detaya inme modu">⬇</button><button data-drill="next" data-tile="' + t.id + '" title="Sonraki düzeye git (tümü)" aria-label="Sonraki düzey"' + (dr.lv < n - 1 ? '' : ' disabled') + '>⇊</button></span>';
}
function drillCrumb(t, st) { if (!t.drill) return ''; const dr = st.drill[t.id] || { lv: 0, path: [] }; return '<div class="dcrumb">' + t.drill.map((c, i) => '<span class="' + (i === dr.lv ? 'on' : '') + '">' + esc(pc(c).c) + (dr.path[i] != null && i < dr.lv ? ': ' + esc(V.fmt(dr.path[i])) : '') + '</span>').join('<i>›</i>') + '</div>'; }
function tileShell(t, st, scope, body, title) {
  const crossCol = t.cross || null; const ttl = title != null ? title : (typeof t.title === 'function' ? '' : t.title);
  if (t.kind === 'nav') return '<section class="dtile s' + t.span + ' dnav' + (t.style ? ' ' + t.style : '') + '" data-tile="' + t.id + '" data-scope="' + scope + '">' + (ttl ? '<span class="dnav-t">' + esc(ttl) + '</span>' : '') + '<div class="dnav-b">' + (t.items || []).map(it => { const on = it.page ? st.page === it.page : it.bm ? st.bm === it.bm : it.vis ? String((st.vis || {})[it.vis.split(':')[0]]) === it.vis.split(':')[1] : false; return '<button class="dbtn" ' + (it.page ? 'data-dpage="' + it.page + '"' : it.bm ? 'data-dbm="' + it.bm + '"' : 'data-dvis="' + it.vis + '"') + ' data-scope="' + scope + '" aria-pressed="' + on + '">' + (it.icon ? '<span class="dbi">' + it.icon + '</span>' : '') + esc(it.label) + '</button>'; }).join('') + '</div></section>';
  if (t.kind === 'text') return '<section class="dtile s' + t.span + ' dtext' + (t.style ? ' ' + t.style : '') + '" data-tile="' + t.id + '" data-scope="' + scope + '">' + body + '</section>';
  return '<section class="dtile s' + t.span + (t.style ? ' ' + t.style : '') + (DB.insp === t.id && scope === 'dash' ? ' insp' : '') + '" data-tile="' + t.id + '" data-scope="' + scope + '"' + (crossCol || t.drill ? ' data-cross="1"' : '') + '><div class="dt-head"><h3>' + esc(ttl) + '</h3><span class="dt-tools">' + (t.thru ? '<span class="chip tp" title="Bir öğeye sağ tıkla ya da seçip “Detaya git”e bas">Detay sayfası</span>' : '') + (t.tooltip || t.tip ? '<span class="chip tp" title="Rapor sayfası araç ipucu">İpucu sayfası</span>' : '') + drillTools(t, st) + '<button class="btn sm ghost insb" data-insp="' + t.id + '" data-scope="' + scope + '">İncele</button></span></div>' + drillCrumb(t, st) + '<div class="dt-body">' + body + '</div></section>';
}
const tileW = (span, st) => st && st.mobile ? 330 : C.spanW(span);
const tileById = (d, id) => DC.allTiles(d).find(x => x.id === id);
function paintGrid(host, d, st, scope) {
  if (!host) return;
  const pg = DC.pageOf(d, st); let cb = '';
  if (st.cross) { const src = DC.tilesOf(d, st).find(t => t.thru && t.cross && pc(t.cross).t === st.cross.t && pc(t.cross).c === st.cross.c); const tp = src && DC.pagesOf(d).find(p => p.id === src.thru);
    cb = '<div class="crossbar"><span>Çapraz filtre: <b>' + esc(st.cross.c) + ' = ' + esc(V.fmt(st.cross.v)) + '</b></span>' + (tp ? '<button class="btn sm pri" data-dthru="' + src.id + '" data-scope="' + scope + '">Detaya git: ' + esc(tp.name) + ' ›</button>' : '') + '<button class="btn sm ghost" data-xclear data-scope="' + scope + '">Temizle ✕</button></div>'; }
  host.querySelector('.crossbar-slot').innerHTML = cb;
  const g = host.querySelector('.dgrid2'); g.classList.add('busy');
  later(() => {
    const ms = MS(); const t0 = performance.now(); let h = ''; const ts = DC.tilesOf(d, st);
    X.batch(() => ts.forEach(t => { const r = DC.renderTile(d, t, st, ms, tileW(t.span, st)); DB.cats[scope + ':' + t.id] = r.cats; h += tileShell(t, st, scope, r.html, r.title); }));
    g.innerHTML = h; g.classList.remove('busy'); C.enhance(g); C.bindMarks();
    const tm = host.querySelector('.dtime'); if (tm) tm.textContent = DC.pagesOf(d).filter(p => !p.hidden).length + ' sayfa · ' + ts.length + ' görsel · ' + Math.round(performance.now() - t0) + ' ms';
  });
}
function bmBar(d, st, scope) {
  const bms = d.bookmarks || []; if (!bms.length) return '';
  const story = bms.some(b => b.story); const cur = bms.find(b => b.id === st.bm); const i = cur ? bms.indexOf(cur) : -1;
  return '<div class="bmbar' + (story ? ' story' : '') + '"><span class="eyebrow">' + (story ? 'Sunum (yer imleri)' : 'Yer imleri') + '</span><div class="bm-list">' + bms.map(b => '<button data-dbm="' + b.id + '" data-scope="' + scope + '" aria-pressed="' + (st.bm === b.id) + '" title="' + esc(b.desc || '') + '">' + esc(b.name) + '</button>').join('') + '<button class="ghost" data-dbm="__reset" data-scope="' + scope + '" title="Varsayılan görünüme dön">↺ Sıfırla</button></div>' + (story ? '<div class="bm-story"><button class="btn sm" data-dbmstep="-1" data-scope="' + scope + '"' + (i <= 0 ? ' disabled' : '') + '>‹</button><p>' + (cur && cur.story ? cur.story : 'Sunumu başlatmak için ilk yer imine bas ya da ›’e tıkla.') + '</p><button class="btn sm" data-dbmstep="1" data-scope="' + scope + '"' + (i >= bms.length - 1 ? ' disabled' : '') + '>›</button></div>' : '') + '</div>';
}
function paramHTML(d, st, scope) {
  return Object.keys(d.params || {}).map(k => { const p = d.params[k]; const v = st.pr[k]; return '<div class="slicer prm"><span class="eyebrow">' + esc(p.label) + ' <i class="fp">alan parametresi</i></span><div class="sl-opts">' + p.opts.map(o => '<button data-dprm="' + k + '" data-scope="' + scope + '" data-v="' + esc(JSON.stringify(o[0])) + '" aria-pressed="' + (v === o[0]) + '">' + esc(o[1]) + '</button>').join('') + '</div></div>'; }).join('');
}
function pageTabs(d, st, scope) {
  const ps = DC.pagesOf(d).filter(p => !p.hidden); if (ps.length < 2) return '';
  return '<nav class="ptabs" aria-label="Rapor sayfaları"><div role="tablist" class="ptabs-in">' + ps.map(p => '<button role="tab" data-dpage="' + p.id + '" data-scope="' + scope + '" aria-selected="' + (st.page === p.id) + '">' + (p.icon ? '<span class="pti">' + p.icon + '</span>' : '') + esc(p.name) + '</button>').join('') + '</div></nav>';
}
function dashFrame(d, scope) {
  const st = stOf(d), pg = DC.pageOf(d, st), th = d.theme || {}, ts = DC.tilesOf(d, st);
  let h = '<div class="dash-frame' + (th.id ? ' th-' + th.id : '') + (st.mobile ? ' mob' : '') + (th.nav === 'left' && !st.mobile ? ' navleft' : '') + '" data-scope="' + scope + '" data-dash="' + d.id + '">';
  if (th.header) h += '<header class="dhero"><span class="dlogo" aria-hidden="true">' + esc(th.logo || d.icon) + '</span><div class="grow"><b>' + esc(th.header) + '</b><small>' + esc(pg.name) + (th.sub ? ' · ' + esc(th.sub) : '') + '</small></div><span class="dh-r">Anadolu Market · veri: 31.12.2024</span></header>';
  h += bmBar(d, st, scope);
  if (th.nav === 'left' && !st.mobile) h += '<div class="dbody"><aside class="lnav" aria-label="Rapor sayfaları"><div role="tablist" class="lnav-in" aria-orientation="vertical">' + DC.pagesOf(d).filter(p => !p.hidden).map(p => '<button role="tab" data-dpage="' + p.id + '" data-scope="' + scope + '" aria-selected="' + (st.page === p.id) + '">' + (p.icon ? '<span class="pti">' + p.icon + '</span>' : '') + '<span>' + esc(p.name) + '</span></button>').join('') + '</div></aside><div class="dmain">';
  h += '<div class="dash-sl-wrap">' + slicerHTML(d, st, scope).replace('<div class="dash-sl">', '<div class="dash-sl">' + paramHTML(d, st, scope)) + '</div>';
  if (pg.thru) { const tv = st.thru && st.thru.field === pg.thru.field ? st.thru.v : pg.thru.def; h += '<div class="thrubar">' + (st.thru ? '<button class="btn sm" data-dback data-scope="' + scope + '">← Geri</button>' : '') + '<span>Detay sayfası · <b>' + esc(pg.thru.label || pc(pg.thru.field).c) + ': ' + esc(V.fmt(tv)) + '</b></span>' + (pg.note ? '<small class="muted">' + esc(pg.note) + '</small>' : '') + '</div>'; }
  h += '<div class="crossbar-slot"></div><div class="dgrid2 busy">' + ts.map(t => '<section class="dtile s' + t.span + ' skel"><div class="dt-head"><h3>' + esc(typeof t.title === 'function' ? '' : t.title || '') + '</h3></div><div class="dt-body"><div class="skbar"></div></div></section>').join('') + '</div>';
  if (th.nav === 'left' && !st.mobile) h += '</div></div>';
  else h += pageTabs(d, st, scope);
  h += '<div class="dfoot"><span class="dtime muted"></span><span class="muted">Ctrl/⌘ ile çoklu seçim · tıkla: çapraz filtre' + (DC.allTiles(d).some(t => t.thru) ? ' · sağ tık: detay sayfası' : '') + '</span><button class="btn sm ghost" data-dmob data-scope="' + scope + '" aria-pressed="' + !!st.mobile + '">' + (st.mobile ? 'Masaüstü düzeni' : 'Telefon düzeni') + '</button></div></div>';
  return h;
}
function wireframe(d) { return DC.pagesOf(d).map(p => '<div class="wpage"><span class="eyebrow">' + esc(p.name) + (p.hidden ? (p.thru ? ' · detay sayfası (gizli)' : ' · gizli sayfa') : '') + '</span><div class="wire">' + (p.tiles || []).map(t => '<div class="wbox s' + t.span + (t.vis ? ' wvis' : '') + '"><b>' + esc(typeof t.title === 'function' ? (t.titleHint || 'Dinamik başlık') : (t.title || (t.kind === 'nav' ? 'Gezinme düğmeleri' : 'Metin'))) + '</b><small>' + esc(t.kind === 'nav' ? 'Düğmeler' : t.kind === 'text' ? 'Metin kutusu' : t.type) + ' · ' + t.span + '/12' + (t.vis ? ' · ' + esc(t.vis) : '') + '</small></div>').join('') + '</div></div>').join(''); }
function featList(d) {
  const ps = DC.pagesOf(d), at = DC.allTiles(d), f = [];
  if (ps.filter(p => !p.hidden).length > 1) f.push(['Sayfalar', ps.filter(p => !p.hidden).length + ' sayfa, ' + ((d.theme || {}).nav === 'left' ? 'sol gezinme paneli' : 'sayfa sekmeleri') + (at.some(t => t.kind === 'nav' && t.items.some(i => i.page)) ? ' ve gezinme düğmeleri' : '')]);
  if (ps.some(p => p.thru)) f.push(['Detay sayfası', ps.filter(p => p.thru).map(p => p.name).join(', ')]);
  if ((d.bookmarks || []).length) f.push(['Yer imleri', d.bookmarks.map(b => b.name).join(', ')]);
  if (Object.keys(d.vis || {}).length) f.push(['Seçim bölmesi', 'Göster/gizle grupları: ' + Object.keys(d.vis).join(', ')]);
  if (Object.keys(d.params || {}).length) f.push(['Alan parametresi', Object.values(d.params).map(p => p.label).join(', ')]);
  if (at.some(t => t.tip || t.tooltip)) f.push(['Araç ipucu sayfası', at.filter(t => t.tip || t.tooltip).length + ' görselde']);
  if (at.some(t => t.drill)) f.push(['Detaya inme', at.filter(t => t.drill).length + ' görselde hiyerarşi']);
  if (at.some(t => typeof t.title === 'function')) f.push(['Dinamik başlık', at.filter(t => typeof t.title === 'function').length + ' görselde']);
  if ((d.theme || {}).id) f.push(['Tema ve tasarım', d.theme.desc || d.theme.id]);
  return f;
}
document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('dpick-det')) DB.pk = e.target.open; }, true);
function viewDash(id) {
  if (id && DMAP[id]) DB.id = id;
  const d = DMAP[DB.id] || DASHES[0];
  const nPages = DASHES.reduce((a, x) => a + DC.pagesOf(x).length, 0), nTiles = DASHES.reduce((a, x) => a + DC.allTiles(x).length, 0);
  let h = '<div class="wrap" style="gap:16px">' + C.head('Örnek raporlar', 'Dashboardlar', DASHES.length + ' rapor · ' + nPages + ' sayfa · ' + nTiles + ' görsel. Hepsi aynı anlam modeli ve ölçü kütüphanesiyle canlı hesaplanır; çok sayfalı raporlarda yer imi, detay sayfası ve araç ipucu sayfası var.', 'dash');
  const groups = []; DASHES.forEach(x => { const g = x.group || 'Diğer'; let G = groups.find(y => y[0] === g); if (!G) groups.push(G = [g, []]); G[1].push(x); });
  const pkOpen = DB.pk !== false; h += '<details class="dpick-det"' + (pkOpen ? ' open' : '') + '><summary><span class="eyebrow">Rapor seç</span><b>' + esc(d.name) + '</b><span class="muted">' + DASHES.length + ' rapor arasından değiştir</span></summary><div class="dpick-wrap">' + groups.map(([g, xs]) => '<div class="dpg"><span class="eyebrow">' + esc(g) + '</span><div class="dpick" role="tablist">' + xs.map(x => '<button role="tab" data-dash="' + x.id + '" aria-selected="' + (x.id === d.id) + '"><span class="dic"' + (x.theme && x.theme.id ? ' data-th="' + x.theme.id + '"' : '') + '>' + esc(x.icon) + '</span><span class="dpn"><b>' + esc(x.name) + '</b><small>' + esc(x.audience) + '</small></span><span class="dpm">' + DC.pagesOf(x).filter(p => !p.hidden).length + ' s</span></button>').join('') + '</div></div>').join('') + '</div></details>';
  const ft = featList(d);
  h += '<section class="panel dash-card"><div class="dash-head"><div><div class="row" style="gap:8px">' + C.lvBadge(d.lv) + '<h2>' + esc(d.name) + '</h2></div><p class="dq"><b>Soru:</b> ' + esc(d.question) + '</p><p class="muted" style="margin:0;font-size:.88rem"><b>Kitle:</b> ' + esc(d.audience) + '</p>' + (ft.length ? '<div class="dfeat">' + ft.map(f => '<span title="' + esc(f[1]) + '"><b>' + esc(f[0]) + '</b> ' + esc(f[1]) + '</span>').join('') + '</div>' : '') + '</div><div class="dtoggle"><button data-dtab="rapor" aria-pressed="' + (DB.tab === 'rapor') + '">Rapor</button><button data-dtab="yapim" aria-pressed="' + (DB.tab === 'yapim') + '">Nasıl yapıldı</button></div></div>';
  if (DB.tab === 'rapor') h += dashFrame(d, 'dash');
  else {
    const at = DC.allTiles(d).filter(t => !t.kind);
    h += '<div class="build"><div class="bsec"><span class="eyebrow">Düzen (12 sütunluk ızgara)</span>' + wireframe(d) + '</div><ol class="bsteps">' + d.build.map((b, i) => '<li><span class="bn">' + (i + 1) + '</span><div><h3>' + esc(b[0]) + '</h3><p>' + esc(b[1]) + '</p>' + (b[2] && b[2].length ? C.daxBlock(b[2], 'Bu adımda yazılan ölçüler') : '') + '</div></li>').join('') + '</ol>';
    h += '<div class="bsec"><span class="eyebrow">Görsel listesi: alanlar ve biçim</span><div class="coltable"><table><thead><tr><th>Görsel</th><th>Tür</th><th>Alan kutuları</th><th>Biçim</th><th>Neden</th></tr></thead><tbody>' + at.map(t => '<tr><td><b>' + esc(typeof t.title === 'function' ? (t.titleHint || 'Dinamik başlık') : t.title) + '</b></td><td>' + esc(t.type) + '</td><td>' + Object.keys(t.wells || {}).map(k => '<div><span class="muted">' + esc(k) + ':</span> <code>' + esc(t.wells[k]) + '</code></div>').join('') + '</td><td>' + (t.format || []).map(f => '<div>• ' + esc(f) + '</div>').join('') + '</td><td>' + esc(t.why || '') + '</td></tr>').join('') + '</tbody></table></div></div>';
    h += '<div class="row"><button class="btn pri" data-dtab="rapor">Raporu aç ve dene</button></div></div>';
  }
  h += '</section></div><aside class="drawer" id="drawer" aria-label="Görsel ayrıntısı" hidden></aside>';
  return h;
}
function mountDash() { if (DB.tab === 'rapor') { const d = DMAP[DB.id]; paintGrid(document.querySelector('.dash-frame[data-scope="dash"]'), d, stOf(d), 'dash'); } if (DB.insp) openDrawer(DB.insp, 'dash'); }
function scopeDash(scope) { return scope === 'final' ? DMAP[FIN.page] : DMAP[DB.id]; }
function repaint(scope) { const d = scopeDash(scope); paintGrid(document.querySelector('.dash-frame[data-scope="' + scope + '"]'), d, stOf(d), scope); }
function reframe(scope) { document.querySelectorAll('.vtip').forEach(e => { e.hidden = true; }); const d = scopeDash(scope); const host = document.querySelector('.dash-frame[data-scope="' + scope + '"]'); if (!host) return; const tmp = document.createElement('div'); tmp.innerHTML = dashFrame(d, scope); const nf = tmp.firstElementChild; host.replaceWith(nf); paintGrid(nf, d, stOf(d), scope); }
function openDrawer(tid, scope) {
  const d = scopeDash(scope); const t = tileById(d, tid); const dr = $('#drawer'); if (!t || !dr) return;
  DB.insp = tid; document.querySelectorAll('.dtile.insp').forEach(e => e.classList.remove('insp')); const te = document.querySelector('.dtile[data-tile="' + tid + '"][data-scope="' + scope + '"]'); if (te) te.classList.add('insp');
  const steps = ['Görselleştirmeler bölmesinden <b>' + esc(t.type) + '</b> görselini seç (ya da Giriş → Yeni görsel).', 'Veri bölmesinden alanları aşağıdaki kutulara sürükle.', 'Biçim bölmesinde aşağıdaki ayarları uygula.'];
  if (t.cross) steps.push('Etkileşim: bir öğeye tıklamak sayfayı <code>' + esc(t.cross) + '</code> değerine göre filtreler. Diğer görsellerin tepkisini Biçim → Etkileşimleri düzenle ile ayarla.');
  if (t.drill) steps.push('Hiyerarşi: X/Y eksenine ' + t.drill.map(c => '<code>' + esc(c) + '</code>').join(' → ') + ' alanlarını sırayla koy; görsel başlığında detaya inme düğmeleri belirir.');
  if (t.tooltip) steps.push('Araç ipucu: Biçim → Genel → Araç ipuçları → Tür: Rapor sayfası.');
  if (t.tip) steps.push('Araç ipucu sayfası: yeni sayfa ekle → Sayfa bilgileri → <b>Araç ipucu olarak kullanılmasına izin ver</b> açık, Tuval ayarları → Tür: Araç ipucu. Sayfaya küçük kartlar ve bir grafik koy; bu görselde Biçim → Genel → Araç ipuçları → Tür: Rapor sayfası, Sayfa: o sayfa.');
  if (t.thru) steps.push('Detay sayfası (drillthrough): hedef sayfada Görselleştirmeler bölmesinin altındaki <b>Detaya git</b> kutusuna <code>' + esc(t.cross) + '</code> alanını koy. Power BI geri düğmesini kendisi ekler. Kaynak görselde bir öğeye sağ tıkla → Detaya git.');
  if (t.vis) steps.push('Göster/gizle: Görünüm → Seçim bölmesi’nde bu görseli bir gruba koy; bir yer imi gruplardan birini görünür, diğerini gizli kaydeder. Düğmenin Eylem’i → Yer imi.');
  if (typeof t.title === 'function') steps.push('Dinamik başlık: Biçim → Genel → Başlık → metin kutusunun yanındaki <b>fx</b> → Alan değeri → başlığı döndüren bir metin ölçüsü seç.');
  dr.innerHTML = '<div class="dr-head"><div><span class="eyebrow">' + esc(t.type) + '</span><h2>' + esc(t.title) + '</h2></div><button class="btn sm ghost" data-drclose aria-label="Kapat">✕</button></div><div class="dr-body">' + (t.why ? '<div class="tip"><b>Neden bu görsel?</b>' + esc(t.why) + '</div>' : '') + '<h3>Power BI’da nasıl yapılır?</h3><ol class="drsteps">' + steps.map(s => '<li>' + s + '</li>').join('') + '</ol><h3>Alan kutuları</h3><div class="wells">' + Object.keys(t.wells || {}).map(k => '<div class="well"><span>' + esc(k) + '</span><code>' + esc(t.wells[k]) + '</code></div>').join('') + '</div>' + ((t.format || []).length ? '<h3>Biçim ayarları</h3><ul class="fmtlist">' + t.format.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul>' : '') + C.daxBlock(t.measures || [], 'Bu görselin DAX ölçüleri', true) + '<button class="btn sm" data-go="visuals">Bu tür görselin biçim seçeneklerini dene</button></div>';
  dr.hidden = false; C.enhance(dr); document.body.classList.add('drawer-open'); const cl = dr.querySelector('[data-drclose]'); if (cl) cl.focus({ preventScroll: true });
}
function closeDrawer() { const dr = $('#drawer'); if (dr) dr.hidden = true; DB.insp = null; document.body.classList.remove('drawer-open'); document.querySelectorAll('.dtile.insp').forEach(e => e.classList.remove('insp')); }
C.view('dash', { render: viewDash, mount: mountDash, resize: () => { if (DB.tab === 'rapor') repaint('dash'); }, hash: 'dashboard' });

/* ======================================================================
   ÖLÇÜ LABORATUVARI
   ====================================================================== */
const PATS = window.PBI_PATTERNS || [];
const LAB = { id: PATS[0] && PATS[0].id };
const nLines = p => p.expr.split('\n').length;
function stepLines(p, v) {
  const lines = p.expr.split('\n'); const out = [];
  if (/^RETURN$/i.test(v)) { const i = lines.findIndex(l => /^\s*RETURN\b/.test(l)); if (i >= 0) for (let k = i; k < lines.length; k++) out.push(k); return out; }
  const re = new RegExp('^\\s*VAR\\s+' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'); const i = lines.findIndex(l => re.test(l)); if (i < 0) return out;
  out.push(i); for (let k = i + 1; k < lines.length && !/^\s*(VAR|RETURN)\b/.test(lines[k]); k++) out.push(k); return out;
}
function viewLab(id) {
  if (id && PATS.some(p => p.id === id)) LAB.id = id;
  const p = PATS.find(x => x.id === LAB.id) || PATS[0]; const LV = C.LEVELS.filter(L => PATS.some(x => x.lv === L.id));
  let h = '<div class="wrap" style="gap:16px">' + C.head('Uygulama', 'Ölçü Laboratuvarı', PATS.length + ' uzun DAX kalıbı, Orta’dan İleri’ye. Kısa ölçüleri derslerde, uzun ve gerçek iş kalıplarını burada öğrenirsin.', 'lab');
  h += '<div class="panel lvlen"><table><thead><tr><th>Seviye</th><th>Yazacağın DAX</th><th>Kalıp</th><th>Ortalama satır</th></tr></thead><tbody>' + C.LEVELS.map(L => { const ps = PATS.filter(x => x.lv === L.id); return '<tr><td>' + C.lvBadge(L.id) + '</td><td>' + esc(L.dax) + '</td><td>' + (ps.length || '—') + '</td><td>' + (ps.length ? Math.round(ps.reduce((a, x) => a + nLines(x), 0) / ps.length) : '—') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  h += '<div class="labgrid"><nav class="panel lablist" aria-label="Kalıplar"><select id="labSel" class="input" aria-label="Kalıp seç">' + LV.map(L => '<optgroup label="' + L.id + ' · ' + L.name + '">' + PATS.filter(x => x.lv === L.id).map(x => '<option value="' + x.id + '"' + (x.id === p.id ? ' selected' : '') + '>' + esc(x.name) + ' (' + nLines(x) + ' satır)</option>').join('') + '</optgroup>').join('') + '</select>' + LV.map(L => '<div class="llg"><span class="eyebrow">' + L.id + ' · ' + L.name + '</span>' + PATS.filter(x => x.lv === L.id).map(x => '<button data-lab="' + x.id + '" aria-current="' + (x.id === p.id) + '"><span>' + esc(x.name) + '</span><small>' + nLines(x) + '</small>' + (C.P.labSeen[x.id] ? '<i class="seen" title="İncelendi">✓</i>' : '') + '</button>').join('') + '</div>').join('') + '</nav>';
  h += '<article class="panel labd" id="labD">' + labDetail(p) + '</article></div></div>';
  return h;
}
function labDetail(p) {
  const i = PATS.indexOf(p); const prev = PATS[i - 1], next = PATS[i + 1];
  const code = p.expr.split('\n').map((ln, k) => '<span class="ln" data-ln="' + k + '"><em>' + (k + 1) + '</em>' + (C.hl(ln) || ' ') + '</span>').join('');
  let h = '<div class="row" style="gap:8px">' + C.lvBadge(p.lv) + '<span class="chip">' + esc(p.group) + '</span><span class="chip">' + nLines(p) + ' satır</span></div><h2>' + esc(p.title) + '</h2><div class="msg info"><b>Problem</b>' + esc(p.problem) + '</div>';
  h += '<div class="labcode"><div class="lc-head"><code>[' + esc(p.name) + '] =</code><button class="btn sm" data-try="' + esc(p.name + ' =\n' + p.expr) + '">Stüdyoda dene</button></div><pre class="lc">' + code + '</pre></div>';
  h += '<h3>Mantık, adım adım <small class="muted">(adımın üzerine gel: ilgili satırlar vurgulanır)</small></h3><ol class="lsteps">' + p.steps.map(s => { const ls = stepLines(p, s[0]); return '<li tabindex="0" data-hl="' + ls.join(',') + '"><code>' + esc(s[0]) + '</code><span>' + esc(s[1]) + '</span></li>'; }).join('') + '</ol>';
  h += '<h3>Sonuç</h3><div id="labRes" class="labres"><div class="skbar"></div></div>';
  if (p.pitfall) h += '<div class="warn"><b>Sık yapılan hata</b>' + esc(p.pitfall) + '</div>';
  if (p.uses && p.uses.length) h += '<div class="note"><b>Kullanıldığı yer</b>' + p.uses.map(u => DMAP[u] ? '<button class="chip" data-go="dash" data-id="' + u + '">Dashboard: ' + esc(DMAP[u].name) + '</button>' : (C.LMAP[u] ? '<button class="chip" data-lesson="' + u + '">Ders: ' + esc(C.LMAP[u].title) + '</button>' : '')).join(' ') + '</div>';
  h += '<div class="pager">' + (prev ? '<button class="btn" data-lab="' + prev.id + '">← ' + esc(prev.name) + '</button>' : '<span></span>') + (next ? '<button class="btn pri" data-lab="' + next.id + '">' + esc(next.name) + ' →</button>' : '<button class="btn pri" data-go="final">Final projesi →</button>') + '</div>';
  return h;
}
function labResult(p) {
  const el = $('#labRes'); if (!el) return;
  later(() => {
    const t0 = performance.now();
    try {
      const ms = MS(); const sl = (p.slicers || []).map(s => ({ t: s[0], c: s[1], values: s[2] })); const W = Math.max(280, Math.min(720, el.clientWidth - 8));
      const a1 = pc(p.axis), a2 = p.axis2 ? pc(p.axis2) : null; const fm = p.fmt;
      const slTxt = sl.length ? ' · ' + sl.map(s => s.c + ' = ' + s.values.join(', ')).join(' · ') : '';
      let html;
      if (a2) { const r = X.query({ rows: [a1, a2], measures: ms, values: [p.name], slicers: sl, totals: false }); const k1 = uniqK(r, 0, a1), k2 = uniqK(r, 1, a2); html = V.table([a1.c].concat(k2.map(String)), k1.map(a => [V.fmt(a)].concat(k2.map(b => pick(r, a, b)))), { fmts: [null].concat(k2.map(() => fm)), cf: Object.fromEntries(k2.map((b, i) => [i + 1, 'heat'])), compact: true }); }
      else {
        const r = X.query({ rows: [a1], measures: ms, values: [p.name], slicers: sl, totals: true }); const ks = cats(r).map(k => V.fmt(k)), vs = col(r, 0); const numeric = vs.every(v => v == null || typeof v === 'number');
        if (!numeric || p.chart === 'table' || p.chart === 'card') { let rows = r.rows; if (rows.length > 25) rows = rows.slice(0, 25); html = V.table([a1.c, p.name], rows.map(x => [V.fmt(x.keys[0]), x.vals[0]]), { fmts: [null, fm], cf: numeric ? { 1: 'bar' } : null, compact: true, total: r.total && r.total[0] != null && numeric ? ['Toplam', r.total[0]] : null }) + (r.rows.length > 25 ? '<p class="muted" style="font-size:.82rem">İlk 25 satır</p>' : ''); }
        else if (p.chart === 'line' || p.chart === 'trend') html = V.line({ cats: ks, series: [{ name: p.name, vals: vs }], fmt: fm }, { W, lines: p.chart === 'trend' ? [] : [] });
        else if (p.chart === 'bar' || p.chart === 'pareto') html = V.bar({ cats: ks, series: [{ name: p.name, vals: vs }], fmt: fm }, { W, grid: false, labels: ks.length <= 14 });
        else html = V.column({ cats: ks, series: [{ name: p.name, vals: vs }], fmt: fm }, { W, labels: ks.length <= 14, colorMode: vs.some(v => v < 0) ? 'sign' : 'series' });
        if (r.total && r.total[0] != null && numeric && p.chart !== 'table') html += '<div class="vtot"><span>Toplam satırı</span><b>' + esc(V.fmt(r.total[0], fm)) + '</b></div>';
      }
      el.innerHTML = '<div class="vtitle">[' + esc(p.name) + '] · ' + esc(a1.c) + (a2 ? ' × ' + esc(a2.c) : '') + esc(slTxt) + ' <span class="muted">' + Math.round(performance.now() - t0) + ' ms</span></div>' + html;
      C.bindMarks();
    } catch (e) { console.error(e); el.innerHTML = '<div class="msg err"><b>Hesaplama hatası</b>' + esc(e.message) + '</div>'; }
  });
}
function mountLab() { const p = PATS.find(x => x.id === LAB.id); if (p) { labResult(p); C.P.labSeen[p.id] = true; C.save(); } }
function showLab(id) {
  LAB.id = id; const p = PATS.find(x => x.id === id); const d = $('#labD'); if (!d || !p) return C.go('lab', id);
  document.querySelectorAll('[data-lab]').forEach(b => { if (b.closest('.lablist')) b.setAttribute('aria-current', b.dataset.lab === id); });
  const sel = $('#labSel'); if (sel) sel.value = id;
  d.innerHTML = labDetail(p); C.enhance(d); mountLab();
  try { history.replaceState(null, '', '#lab-' + id); } catch (e) {}
  if (window.innerWidth <= 980) d.scrollIntoView({ block: 'start', behavior: 'smooth' }); else if (d.getBoundingClientRect().top < 0) d.scrollIntoView({ block: 'start' });
}
C.view('lab', { render: viewLab, mount: mountLab, hash: 'lab' });

/* ======================================================================
   PÜF NOKTALARI
   ====================================================================== */
const TRICKS = window.PBI_TRICKS || [];
const TR = { cat: 'Tümü', open: null, st: {}, q: '', lv: '' };
const ts = id => TR.st[id] || (TR.st[id] = {});
const demoW = () => Math.max(280, Math.min(760, C.mainW() - 80));
const DEMOS = {
  tooltip: () => { const r = sortRows(qq(['Kategoriler[Kategori]'], ['Net Satış']), 'valueDesc'); const ks = cats(r); return '<p class="muted">Bir çubuğun üzerine gel (dokunmatikte dokun): o kategorinin rapor sayfası araç ipucu açılır.</p>' + V.bar({ cats: ks, series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { W: demoW(), grid: false, tipx: tipFor('Kategoriler[Kategori]', ks, Y24) }); },
  dynTitle: id => { const s = ts(id); s.yil = s.yil || [2024]; s.kanal = s.kanal || []; const sl = []; if (s.yil.length) sl.push({ t: 'Tarih', c: 'Yil', values: s.yil }); if (s.kanal.length) sl.push({ t: 'Satislar', c: 'Kanal', values: s.kanal }); const ms = MS(); const title = X.evalMeasure(ms, '[Dinamik Başlık]', sl); const r = X.query({ rows: [pc('Kategoriler[Kategori]')], measures: ms, values: ['Net Satış'], slicers: sl, totals: false }); return '<div class="slrow"><span class="eyebrow">Yıl</span>' + [2022, 2023, 2024].map(y => '<button class="chip" data-trd="' + id + '|yil|' + y + '" aria-pressed="' + s.yil.includes(y) + '">' + y + '</button>').join('') + '<span class="eyebrow">Kanal</span>' + ['Web', 'Mobil', 'Mağaza'].map(k => '<button class="chip" data-trd="' + id + '|kanal|' + k + '" aria-pressed="' + s.kanal.includes(k) + '">' + k + '</button>').join('') + '</div><div class="vframe"><div class="vtitle dyn">' + esc(title) + '</div>' + V.column({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { W: demoW() }) + '</div>'; },
  bookmark: id => { const s = ts(id); s.v = s.v || 'g'; const r = sortRows(qq(['Kategoriler[Kategori]'], ['Net Satış', 'Kâr Marjı %']), 'valueDesc'); return '<div class="dtoggle sm"><button data-trd="' + id + '|v|g" aria-pressed="' + (s.v === 'g') + '">Grafik (yer imi 1)</button><button data-trd="' + id + '|v|t" aria-pressed="' + (s.v === 't') + '">Tablo (yer imi 2)</button></div>' + (s.v === 'g' ? V.bar({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { W: demoW(), grid: false }) : V.table(['Kategori', 'Net Satış', 'Marj'], r.rows.map(x => [x.keys[0]].concat(x.vals)), { fmts: [null, 'para', 'yuzde'], cf: { 1: 'bar' }, total: ['Toplam'].concat(r.total) })); },
  svg: () => { const ms = MS(); const r = sortRows(qq(['Urunler[Urun]'], ['Net Satış']), 'valueDesc'); r.rows = r.rows.slice(0, 7); return V.table(['Ürün', 'Net Satış', '2024 eğilimi (SVG ölçüsü)'], r.rows.map(x => [x.keys[0], x.vals[0], X.evalMeasure(ms, '[Trend Mini Grafik]', [{ t: 'Urunler', c: 'Urun', values: [x.keys[0]] }])]), { fmts: [null, 'para'], cf: { 1: 'bar' } }); },
  sparkTable: () => { const ms = MS(); const r = sortRows(qq(['Kategoriler[Kategori]'], ['Net Satış']), 'valueDesc'); return V.table(['Kategori', 'Net Satış', 'Aylık (yerleşik mini grafik)'], r.rows.map(x => { const m = X.query({ rows: [pc('Tarih[Ay]')], measures: ms, values: ['Net Satış'], slicers: Y24.concat([{ t: 'Kategoriler', c: 'Kategori', values: [x.keys[0]] }]), totals: false }); return [x.keys[0], x.vals[0], V.spark(col(m, 0), { W: 130, H: 26 })]; }), { fmts: [null, 'para'] }); },
  topnOther: id => { const s = ts(id); s.n = s.n || 5; const r = X.query({ rows: [pc('UrunlerVeDiger[Urun]')], measures: MS(), values: ['Satış (Top N + Diğer)'], slicers: Y24.concat([{ t: 'TopNSecim', c: 'N', values: [s.n] }]), totals: true }); const rows = r.rows.filter(x => x.vals[0] != null && x.keys[0] !== 'Diğer').sort((a, b) => b.vals[0] - a.vals[0]); const o = r.rows.find(x => x.keys[0] === 'Diğer'); if (o) rows.push(o); return '<div class="slrow"><span class="eyebrow">N (parametre)</span>' + [3, 5, 8, 10].map(n => '<button class="chip" data-trd="' + id + '|n|' + n + '" aria-pressed="' + (s.n === n) + '">' + n + '</button>').join('') + '</div>' + V.bar({ cats: rows.map(x => x.keys[0]), series: [{ name: 'Net Satış', vals: rows.map(x => x.vals[0]) }], fmt: 'para' }, { W: demoW(), grid: false, labelFn: (i, v) => V.fmt(v, 'para', true) }) + '<div class="vtot"><span>Toplam (her N için aynı)</span><b>' + V.fmt(r.total[0], 'para') + '</b></div>'; },
  fieldParam: id => { const s = ts(id); s.m = s.m || 'Net Satış'; const r = X.query({ rows: [pc('Kategoriler[Kategori]')], measures: MS(), values: ['Seçili Ölçü'], slicers: Y24.concat([{ t: 'OlcuSecimi', c: 'Olcu', values: [s.m] }]), totals: false }); return '<div class="slrow"><span class="eyebrow">Ölçü seç (alan parametresi)</span>' + ['Net Satış', 'Brüt Kâr', 'Sipariş Sayısı', 'Müşteri Sayısı'].map(m => '<button class="chip" data-trd="' + id + '|m|' + m + '" aria-pressed="' + (s.m === m) + '">' + m + '</button>').join('') + '</div><div class="vframe"><div class="vtitle">' + esc(s.m) + ' · kategoriye göre · 2024</div>' + V.column({ cats: cats(r), series: [{ name: s.m, vals: col(r, 0) }], fmt: fmtOf(s.m) }, { W: demoW(), labels: true }) + '</div>'; },
  drill: id => { const s = ts(id); s.lv = s.lv || 0; s.path = s.path || []; const H = ['Tarih[Yil]', 'Tarih[YilCeyrek]', 'Tarih[YilAy]']; const sl = s.path.map((v, i) => Object.assign(pc(H[i]), { values: [v] })); const r = X.query({ rows: [pc(H[s.lv])], measures: MS(), values: ['Net Satış'], slicers: sl, totals: false }); s.cats = cats(r); return '<div class="row" style="gap:6px"><button class="btn sm" data-trd="' + id + '|up|1"' + (s.lv ? '' : ' disabled') + '>⬆ Yukarı</button><span class="dcrumb">' + H.map((c, i) => '<span class="' + (i === s.lv ? 'on' : '') + '">' + pc(c).c + (s.path[i] != null && i < s.lv ? ': ' + s.path[i] : '') + '</span>').join('<i>›</i>') + '</span></div><p class="muted" style="font-size:.85rem">Bir sütuna tıkla: bir alt düzeye iner (Yıl → Çeyrek → Ay).</p><div data-trdrill="' + id + '">' + V.column({ cats: s.cats.map(String), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { W: demoW(), labels: s.cats.length <= 12 }) + '</div>'; },
  drillthrough: id => { const s = ts(id); if (s.cat) { const f = Y24.concat([{ t: 'Kategoriler', c: 'Kategori', values: [s.cat] }]); const ms = MS(); const r = sortRows(X.query({ rows: [pc('Urunler[Urun]')], measures: ms, values: ['Net Satış', 'Kâr Marjı %'], slicers: f, totals: false }), 'valueDesc'); return '<div class="dthru"><div class="row" style="justify-content:space-between"><button class="btn sm" data-trd="' + id + '|cat|">← Geri (otomatik geri düğmesi)</button><span class="chip">Detay sayfası filtresi: Kategori = ' + esc(s.cat) + '</span></div><div class="kgrid">' + V.card(X.evalMeasure(ms, '[Net Satış]', f), 'Net Satış', 'para') + V.card(X.evalMeasure(ms, '[Kâr Marjı %]', f), 'Kâr marjı', 'yuzde') + V.card(X.evalMeasure(ms, '[Sipariş Sayısı]', f), 'Sipariş', 'adet') + '</div>' + V.table(['Ürün', 'Net Satış', 'Marj'], r.rows.slice(0, 6).map(x => [x.keys[0]].concat(x.vals)), { fmts: [null, 'para', 'yuzde'], cf: { 1: 'bar' } }) + '</div>'; } const r = sortRows(qq(['Kategoriler[Kategori]'], ['Net Satış']), 'valueDesc'); s.cats = cats(r); return '<p class="muted" style="font-size:.85rem">Bir çubuğa tıkla (Power BI’da sağ tık → Detaya git): kategori detay sayfası açılır.</p><div data-trthru="' + id + '">' + V.bar({ cats: s.cats, series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { W: demoW(), grid: false }) + '</div>'; },
  condColor: () => { const r = qq(['Kategoriler[Kategori]'], ['Hedef Gerçekleşme %']); return '<p class="muted" style="font-size:.85rem">Renk kuralı: hedef gerçekleşme ≥ %100 yeşil, altı kırmızı (Sütunlar → Renk → fx → Kurallar).</p>' + V.column({ cats: cats(r), series: [{ name: 'Hedef Gerçekleşme %', vals: col(r, 0) }], fmt: 'yuzde' }, { W: demoW(), colorMode: 'cond', condTarget: 1, labels: true, yMin: 'auto', lines: [{ type: 'const', value: 1, label: 'Hedef' }] }); },
  customLabel: () => { const r = sortRows(qq(['Kategoriler[Kategori]'], ['Net Satış', 'YoY %']), 'valueDesc'); return V.bar({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { W: demoW(), grid: false, labelFn: (i, v) => V.fmt(v, 'para', true) + '  ' + (r.rows[i].vals[1] >= 0 ? '▲' : '▼') + V.fmt(Math.abs(r.rows[i].vals[1] || 0), 'yuzde') }); },
  smallMult: () => { const ms = MS(); const segs = ['Bireysel', 'Kurumsal', 'Premium']; const w = Math.max(220, Math.floor(demoW() / 3) - 12); return '<div class="smgrid">' + segs.map(sg => { const r = X.query({ rows: [pc('Tarih[Ay]')], measures: ms, values: ['Net Satış'], slicers: Y24.concat([{ t: 'Musteriler', c: 'Segment', values: [sg] }]), totals: false }); return '<div><span class="eyebrow">' + sg + '</span>' + V.line({ cats: cats(r), series: [{ name: sg, vals: col(r, 0) }], fmt: 'para' }, { W: w, H: 170 }) + '</div>'; }).join('') + '</div>'; },
  bullet: () => { const r = qq(['Kategoriler[Kategori]'], ['Net Satış', 'Hedef']); return V.bullet(r.rows.map(x => ({ c: x.keys[0], v: x.vals[0], t: x.vals[1] })), { W: demoW(), fmt: 'para' }); },
  pareto: () => { const r = sortRows(qq(['Urunler[Urun]'], ['Net Satış']), 'valueDesc'); r.rows = r.rows.filter(x => x.vals[0] > 0); const v = col(r, 0); const tot = v.reduce((p, q) => p + q, 0); let acc = 0; const cum = v.map(x => (acc += x) / tot); const mx = Math.max(...v); return V.column({ cats: cats(r).map(c => String(c).split(' ')[0]), series: [{ name: 'Net Satış', vals: v }, { name: 'Birikimli pay', type: 'line', vals: cum.map(c => c * mx), color: 'var(--s2)' }], fmt: 'para' }, { W: demoW(), legend: 'top', lines: [{ type: 'const', value: 0.8 * mx, label: '%80' }] }); },
  histogram: () => { const by = {}; MODEL.tables.Satislar.rows.forEach(r => { if (r.Durum === 'İptal' || r.Tarih.getUTCFullYear() !== 2024) return; by[r.SiparisNo] = (by[r.SiparisNo] || 0) + r.Tutar; }); const B = 1000; const bins = {}; Object.values(by).forEach(v => { const b = Math.floor(v / B) * B; bins[b] = (bins[b] || 0) + 1; }); const ks = Object.keys(bins).map(Number).sort((a, b) => a - b); return '<p class="muted" style="font-size:.85rem">2024 siparişlerinin tutar dağılımı, 1.000 ₺ genişliğinde kutular (Veri grupları → Kutu boyutu 1000).</p>' + V.column({ cats: ks.map(k => V.fmt(k, null, true) + '–' + V.fmt(k + B, null, true)), series: [{ name: 'Sipariş', vals: ks.map(k => bins[k]) }], fmt: 'adet' }, { W: demoW(), labels: ks.length <= 14, gap: 0.05 }); }
};
function trickCard(t) {
  const open = TR.open === t.id;
  let h = '<article class="panel tcard' + (open ? ' open' : '') + '" id="tr-' + t.id + '"><button class="tc-head" data-trick="' + t.id + '" aria-expanded="' + open + '"><span class="row" style="gap:6px">' + C.lvBadge(t.lv) + '<span class="chip">' + esc(t.cat) + '</span>' + (t.demo ? '<span class="chip dx">canlı demo</span>' : '') + (C.P.trickSeen[t.id] ? '<span class="chip">✓</span>' : '') + '</span><h3>' + esc(t.title) + '</h3><p>' + esc(t.problem) + '</p><span class="tc-more">' + (open ? 'Kapat ▲' : 'Nasıl yapılır? ▼') + '</span></button>';
  if (open) {
    h += '<div class="tc-body"><div class="tc-cols"><div><h4>Power BI’da adım adım</h4><ol>' + t.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' + (t.dax ? '<h4>DAX</h4><pre class="dax"' + (t.noTry ? ' data-notry' : '') + '>' + esc(t.dax) + '</pre>' : '') + '<div class="tip"><b>Neden işe yarar?</b>' + esc(t.why) + '</div></div>' + (t.demo && DEMOS[t.demo] ? '<div class="tc-demo"><h4>Canlı demo</h4><div class="demo" id="demo-' + t.id + '"><div class="skbar"></div></div></div>' : '') + '</div></div>';
  }
  return h + '</article>';
}
function viewTricks() {
  const catsL = ['Tümü'].concat([...new Set(TRICKS.map(t => t.cat))]);
  return '<div class="wrap" style="gap:16px">' + C.head('Profesyonel dokunuşlar', 'Püf noktaları', TRICKS.length + ' teknik, ' + TRICKS.filter(t => t.demo).length + ' tanesinde canlı demo.', 'tricks') + '<div class="filters">' + catsL.map(c => '<button data-trcat="' + esc(c) + '" aria-pressed="' + (TR.cat === c) + '">' + esc(c) + ' <small>' + (c === 'Tümü' ? TRICKS.length : TRICKS.filter(t => t.cat === c).length) + '</small></button>').join('') + '</div><div class="row" style="gap:10px"><input class="input" id="trQ" placeholder="Püf noktası ara: yer imi, SVG, Top N, katlama…" value="' + esc(TR.q) + '" style="max-width:360px" aria-label="Püf noktası ara"><div class="filters">' + [['', 'Tüm seviyeler'], ['temel', 'Temel'], ['orta', 'Orta'], ['ileri', 'İleri']].map(([k, t]) => '<button data-trlv="' + k + '" aria-pressed="' + (TR.lv === k) + '">' + t + '</button>').join('') + '</div></div><div class="tgrid" id="tGrid">' + tGrid() + '</div></div>';
}
const TIER = { A1: 'temel', A2: 'temel', B1: 'orta', B2: 'orta', C1: 'ileri', C2: 'ileri' };
const tGrid = () => { const q = trFold(TR.q.trim()); const xs = TRICKS.filter(t => (TR.cat === 'Tümü' || t.cat === TR.cat) && (!TR.lv || (TIER[t.lv] || t.lv) === TR.lv) && (!q || trFold([t.title, t.problem, t.desc || '', (t.steps || []).join(' '), t.dax || '', t.why || ''].join(' ')).includes(q))); return xs.length ? xs.map(trickCard).join('') : '<div class="panel empty">Bu filtreyle eşleşen püf noktası yok.</div>'; };
document.addEventListener('input', ev => { if (ev.target.id === 'trQ') { TR.q = ev.target.value; const g = document.getElementById('tGrid'); if (g) { g.innerHTML = tGrid(); C.enhance(g); } } });
function paintDemo(id) { const t = TRICKS.find(x => x.id === id); const el = document.getElementById('demo-' + id); if (!t || !el || !DEMOS[t.demo]) return; later(() => { try { X.batch(() => { el.innerHTML = DEMOS[t.demo](id); }); C.bindMarks(); } catch (e) { console.error(e); el.innerHTML = '<div class="msg err">' + esc(e.message) + '</div>'; } }); }
function toggleTrick(id) {
  TR.open = TR.open === id ? null : id; if (TR.open) { C.P.trickSeen[id] = true; C.save(); }
  $('#tGrid').innerHTML = tGrid(); C.enhance($('#tGrid'));
  if (TR.open) { paintDemo(id); const el = document.getElementById('tr-' + id); if (el) { const r = el.getBoundingClientRect(); if (r.top < 60 || r.top > window.innerHeight * 0.6) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }
}
C.view('tricks', { render: viewTricks, mount: () => { if (TR.open) paintDemo(TR.open); }, hash: 'puf' });

/* ======================================================================
   POWER BI MENÜLERİ
   ====================================================================== */
const MENUS = window.PBI_MENUS || []; const FIN_DEF = window.PBI_FINAL;
const MN = { g: 0, tab: MENUS[0] && MENUS[0].tabs[0].id, q: '' };
const stageChip = (tab, i) => { const n = FIN_DEF ? FIN_DEF.stageOf(tab, i) : null; return n ? '<button class="chip fin" data-go="final" title="Final projesinde kullanıldığı aşama">Final · Aşama ' + n + '</button>' : ''; };
const cmdRow = (tab, c, i) => '<div class="cmd"><div class="cmd-n"><span class="rbtn">' + esc(c[0]) + '</span></div><div class="cmd-d"><p><b>Ne yapar:</b> ' + esc(c[1]) + '</p><p class="muted"><b>Ne zaman:</b> ' + esc(c[2]) + '</p><div class="row" style="gap:6px">' + (c[3] && C.LMAP[c[3]] ? '<button class="chip" data-lesson="' + c[3] + '">Ders: ' + esc(C.LMAP[c[3]].title) + '</button>' : '') + stageChip(tab.id, i) + '</div></div></div>';
function viewMenus() {
  const total = MENUS.reduce((a, g) => a + g.tabs.reduce((b, t) => b + t.cmds.length, 0), 0);
  let h = '<div class="wrap" style="gap:16px">' + C.head('Başvuru', 'Power BI menüleri', MENUS.reduce((a, g) => a + g.tabs.length, 0) + ' sekme, ' + total + ' komut. Her komut: ne yapar, ne zaman kullanılır, hangi derste anlatılır.', 'menus');
  h += '<input class="input" id="mnQ" placeholder="Komut ara: yer imi, sütuna göre sırala, abone ol…" value="' + esc(MN.q) + '" style="max-width:420px" aria-label="Komut ara"><div id="mnBody">' + menusBody() + '</div></div>';
  return h;
}
function menusBody() {
  const q = MN.q.trim().toLocaleLowerCase('tr');
  if (q) { let n = 0; const out = MENUS.map(g => g.tabs.map(t => { const hits = t.cmds.map((c, i) => [c, i]).filter(([c]) => (c.join(' ') + ' ' + t.name).toLocaleLowerCase('tr').includes(q)); n += hits.length; return hits.length ? '<div class="panel mtab"><div class="mtab-h"><span class="eyebrow">' + esc(g.grp) + '</span><h3>' + esc(t.name) + '</h3></div>' + hits.map(([c, i]) => cmdRow(t, c, i)).join('') + '</div>' : ''; }).join('')).join(''); return '<p class="muted">' + n + ' komut bulundu.</p>' + (out || '<div class="panel empty">Sonuç yok.</div>'); }
  const g = MENUS[MN.g]; const t = g.tabs.find(x => x.id === MN.tab) || g.tabs[0];
  let h = '<div class="mgroups" role="tablist">' + MENUS.map((x, i) => '<button role="tab" data-mng="' + i + '" aria-selected="' + (i === MN.g) + '">' + esc(x.grp) + '</button>').join('') + '</div>';
  h += '<div class="ribbon" role="tablist">' + g.tabs.map(x => '<button role="tab" data-mnt="' + x.id + '" aria-selected="' + (x.id === t.id) + '">' + esc(x.name) + '<small>' + x.cmds.length + '</small></button>').join('') + '</div>';
  h += '<div class="panel mtab"><div class="mtab-h"><h2>' + esc(t.name) + '</h2><p>' + esc(t.desc) + '</p></div><div class="rgroup">' + t.cmds.map(c => '<span class="rmini">' + esc(c[0]) + '</span>').join('') + '</div>' + t.cmds.map((c, i) => cmdRow(t, c, i)).join('') + '</div>';
  return h;
}
C.view('menus', { render: viewMenus, hash: 'menuler' });

/* ======================================================================
   FİNAL PROJESİ
   ====================================================================== */
const FIN = { page: 'ozet', open: 1 };
const finKey = (n, i) => n + ':' + i;
function finProgress() { let t = 0, d = 0; FIN_DEF.stages.forEach(s => s.tasks.forEach((x, i) => { t++; if (C.P.final[finKey(s.n, i)]) d++; })); return { t, d }; }
function stageCmds(n) { const out = []; MENUS.forEach(g => g.tabs.forEach(t => t.cmds.forEach((c, i) => { if (FIN_DEF.stageOf(t.id, i) === n) out.push(t.name + ' → ' + c[0]); }))); return out; }
function viewFinal() {
  const F = FIN_DEF; const pr = finProgress();
  let h = '<div class="wrap" style="gap:18px">' + C.head('Kapanış', 'Final Projesi: ' + esc(F.title), null, 'final');
  h += '<section class="panel hero-main"><p>' + esc(F.intro) + '</p><div class="bar"><i style="width:' + (pr.d / pr.t * 100) + '%"></i></div><div class="row"><span class="num muted">' + pr.d + '/' + pr.t + ' görev tamamlandı</span>' + (pr.d === pr.t ? '<span class="chip dx">Tebrikler: final tamamlandı</span>' : '') + '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">10 aşama</span><h2>Sıfırdan yayına</h2></div></div><div class="stages">' + F.stages.map(s => { const done = s.tasks.filter((x, i) => C.P.final[finKey(s.n, i)]).length; const cmds = stageCmds(s.n); return '<details class="panel stage"' + (FIN.open === s.n ? ' open' : '') + ' data-stage="' + s.n + '"><summary><span class="sn">' + s.n + '</span><span class="st"><b>' + esc(s.title) + '</b><small>' + done + '/' + s.tasks.length + ' görev · ' + cmds.length + ' menü komutu</small></span>' + C.lvBadge(s.lv) + '</summary><div class="stage-b"><p class="muted">' + esc(s.goal) + '</p><ul class="tasks">' + s.tasks.map((x, i) => '<li><label><input type="checkbox" data-fin="' + finKey(s.n, i) + '"' + (C.P.final[finKey(s.n, i)] ? ' checked' : '') + '> <span>' + esc(x) + '</span></label></li>').join('') + '</ul>' + (s.measures && s.measures.length ? C.daxBlock(s.measures, 'Bu aşamada yazılan ölçüler') : '') + '<details class="cmdlist"><summary>Bu aşamada kullanılan menü komutları (' + cmds.length + ')</summary><div class="row" style="gap:6px">' + cmds.map(c => '<span class="chip">' + esc(c) + '</span>').join('') + '</div></details><div class="row"><span class="chip">Teslim: ' + esc(s.deliver) + '</span>' + (s.dash && DMAP[s.dash] ? '<button class="btn sm" data-finpage="' + s.dash + '">Örnek sayfa: ' + esc(DMAP[s.dash].name) + '</button>' : '') + '</div></div></details>'; }).join('') + '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Teslim edilecek rapor</span><h2>Beş sayfalı final raporu</h2></div></div><div class="panel finrep"><div class="pagenav" role="tablist">' + F.pages.map(([id, n]) => '<button role="tab" data-finpage="' + id + '" aria-selected="' + (FIN.page === id) + '">' + esc(n) + '</button>').join('') + '</div><div id="finRep">' + dashFrame(DMAP[FIN.page], 'final') + '</div></div><p class="muted" style="font-size:.85rem;margin:0">Sayfa gezintisi (Ekle → Düğmeler → Gezgin → Sayfa gezgini) ile sayfalar arasında geçiş. Her sayfanın nasıl kurulduğu Dashboardlar → “Nasıl yapıldı” sekmesinde.</p></section>';
  const all = []; MENUS.forEach(g => g.tabs.forEach(t => t.cmds.forEach((c, i) => all.push({ g: g.grp, t, c, i, n: F.stageOf(t.id, i) }))));
  const covered = all.filter(x => x.n).length;
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Menü kapsama tablosu</span><h2>Her menü komutu bir aşamada</h2></div><span class="chip ' + (covered === all.length ? 'dx' : '') + '">' + covered + '/' + all.length + ' komut</span></div><div class="panel cover">' + MENUS.map(g => '<details><summary><b>' + esc(g.grp) + '</b> <span class="muted">' + g.tabs.reduce((a, t) => a + t.cmds.length, 0) + ' komut</span></summary><div class="coltable"><table><thead><tr><th>Sekme</th><th>Komut</th><th>Aşama</th></tr></thead><tbody>' + g.tabs.map(t => t.cmds.map((c, i) => '<tr><td>' + esc(t.name) + '</td><td>' + esc(c[0]) + '</td><td>' + (F.stageOf(t.id, i) ? '<span class="chip">' + F.stageOf(t.id, i) + '. ' + esc(F.stages[F.stageOf(t.id, i) - 1].title) + '</span>' : '<span class="chip">—</span>') + '</td></tr>').join('')).join('') + '</tbody></table></div></details>').join('') + '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Değerlendirme ölçütleri</span><h2>Profesyonel rapor kontrol listesi</h2></div></div><div class="panel rubric">' + F.rubric.map(r => '<div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>').join('') + '</div></section>';
  return h + '<aside class="drawer" id="drawer" aria-label="Görsel ayrıntısı" hidden></aside></div>';
}
function mountFinal() { repaint('final'); }
C.view('final', { render: viewFinal, mount: mountFinal, resize: () => repaint('final'), hash: 'final' });

/* ======================================================================
   OLAYLAR
   ====================================================================== */
document.addEventListener('click', ev => {
  const t = ev.target.closest('button, [data-i], .dnode, li[data-hl]'); if (!t) return;
  const d = t.dataset;
  // Görseller
  if (d.vsel) { vsDefaults(d.vsel); document.querySelectorAll('[data-vsel]').forEach(b => b.setAttribute('aria-pressed', b.dataset.vsel === d.vsel)); paintVS(true); const cv = $('#vsCanvas'); if (cv && cv.getBoundingClientRect().top < 0) cv.scrollIntoView({ block: 'start' }); return; }
  if (d.vstab) { VS.tab = d.vstab; paintPane(); return; }
  if (d.vsf !== undefined && t.classList.contains('sw')) { vsSet('f', d.vsf, !VS.f[d.vsf]); t.setAttribute('aria-pressed', !!VS.f[d.vsf]); return; }
  if (d.vsa !== undefined && t.classList.contains('sw')) { vsSet('a', d.vsa, !VS.a[d.vsa]); t.setAttribute('aria-pressed', !!VS.a[d.vsa]); return; }
  if (d.vsg !== undefined && t.classList.contains('sw')) { vsSet('g', d.vsg, !VS.g[d.vsg]); t.setAttribute('aria-pressed', !!VS.g[d.vsg]); return; }
  if (d.vsreset !== undefined) { vsDefaults(VS.id); paintVS(true); return; }
  if (d.slicer === 'vs') { const v = JSON.parse(d.v); const single = VS.f.single; const has = VS.sl.some(x => X.keyOf(x) === X.keyOf(v)); VS.sl = single ? (has ? [] : [v]) : (has ? VS.sl.filter(x => X.keyOf(x) !== X.keyOf(v)) : VS.sl.concat([v])); paintVS(); return; }
  if (t.classList.contains('dnode') && t.closest('#vsCanvas')) { const li = +t.dataset.lvl, k = +t.dataset.k; if (li === 0) VS.dpath = []; else { const ord = VS._dord; const r = sortRows(X.query({ rows: [pc(ord[li - 1])], measures: MS(), values: [VS.w.y], slicers: Y24.concat(VS.dpath.slice(0, li - 1).map((v, i) => Object.assign(pc(ord[i]), { values: [v] }))), totals: false }), 'valueDesc'); const v = r.rows[k] && r.rows[k].keys[0]; if (v !== undefined) VS.dpath = VS.dpath.slice(0, li - 1).concat([v]); } paintVS(); return; }
  // Dashboard
  if (d.dash) { DB.id = d.dash; DB.pk = false; closeDrawer(); C.go('dash', d.dash, { keepScroll: true }); requestAnimationFrame(() => { const c = document.querySelector('.dash-card'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); return; }
  if (d.dtab) { DB.tab = d.dtab; closeDrawer(); C.render(); return; }
  if (d.dslb) { const scope = d.scope, dd = scopeDash(scope), st = stOf(dd); DC.toggleSlicer(st, d.dslb, JSON.parse(d.v), ev.ctrlKey || ev.metaKey); document.querySelectorAll('[data-dslb="' + d.dslb + '"][data-scope="' + scope + '"]').forEach(b => b.setAttribute('aria-pressed', (st.sl[d.dslb] || []).some(x => X.keyOf(x) === X.keyOf(JSON.parse(b.dataset.v))))); repaint(scope); return; }
  if (d.xclear !== undefined) { const st = stOf(scopeDash(d.scope)); st.cross = null; repaint(d.scope); return; }
  if (d.dpage) { const dd = scopeDash(d.scope), st = stOf(dd); st.page = d.dpage; st.cross = null; st.thru = null; st.drill = {}; st.bm = null; closeDrawer(); reframe(d.scope); return; }
  if (d.dbm) { const dd = scopeDash(d.scope), st = stOf(dd); DC.applyBookmark(dd, st, d.dbm === '__reset' ? null : (dd.bookmarks || []).find(b => b.id === d.dbm)); closeDrawer(); reframe(d.scope); return; }
  if (d.dbmstep) { const dd = scopeDash(d.scope), st = stOf(dd), bms = dd.bookmarks || []; const i = Math.max(0, Math.min(bms.length - 1, bms.findIndex(b => b.id === st.bm) + +d.dbmstep)); DC.applyBookmark(dd, st, bms[i]); reframe(d.scope); return; }
  if (d.dvis) { const dd = scopeDash(d.scope), st = stOf(dd); const [k, v] = d.dvis.split(':'); st.vis[k] = v; st.bm = null; reframe(d.scope); return; }
  if (d.dprm) { const dd = scopeDash(d.scope), st = stOf(dd); st.pr[d.dprm] = JSON.parse(d.v); st.bm = null; reframe(d.scope); return; }
  if (d.dthru) { const dd = scopeDash(d.scope), st = stOf(dd), tl = tileById(dd, d.dthru); if (tl && st.cross) { st.thru = { field: tl.cross, v: st.cross.v, from: st.page }; st.page = tl.thru; st.cross = null; st.drill = {}; closeDrawer(); reframe(d.scope); window.scrollTo({ top: document.querySelector('.dash-frame[data-scope="' + d.scope + '"]').getBoundingClientRect().top + window.scrollY - 70 }); } return; }
  if (d.dback !== undefined) { const dd = scopeDash(d.scope), st = stOf(dd); st.page = (st.thru && st.thru.from) || DC.pagesOf(dd)[0].id; st.thru = null; reframe(d.scope); return; }
  if (d.dmob !== undefined) { const dd = scopeDash(d.scope), st = stOf(dd); st.mobile = !st.mobile; reframe(d.scope); return; }
  if (d.insp) { openDrawer(d.insp, d.scope); return; }
  if (d.drclose !== undefined) { closeDrawer(); return; }
  if (d.drill) { const tileEl = t.closest('.dtile'); const scope = tileEl.dataset.scope; const dd = scopeDash(scope); const tl = tileById(dd,  d.tile); const st = stOf(dd); DC.drill(st, tl, d.drill); if (d.drill === 'mode') { t.setAttribute('aria-pressed', !!st.drill[tl.id].mode); return; } if (st.cross && tl.drill.some(c => { const p = pc(c); return p.t === st.cross.t && p.c === st.cross.c; })) st.cross = null; repaint(scope); return; }
  if (d.i !== undefined && t.closest('.dtile[data-cross]')) {
    const tileEl = t.closest('.dtile'); const scope = tileEl.dataset.scope; const dd = scopeDash(scope); const tl = tileById(dd,  tileEl.dataset.tile); const st = stOf(dd); const cs = DB.cats[scope + ':' + tl.id]; if (!cs) return; const v = cs[+d.i]; if (v === undefined) return;
    const dr = st.drill[tl.id];
    if (tl.drill && dr && dr.mode) { if (dr.lv < tl.drill.length - 1) { DC.drill(st, tl, 'into', v); if (st.cross) { const p0 = pc(tl.drill[dr.lv - 1] || ''); if (p0 && st.cross.t === p0.t && st.cross.c === p0.c) st.cross = null; } repaint(scope); } return; }
    if (!tl.cross || (dr && dr.lv > 0)) return; // çapraz filtre yalnızca görselin ilk düzeyinden
    const c = pc(tl.cross); if (!c) return;
    st.cross = st.cross && st.cross.t === c.t && st.cross.c === c.c && X.keyOf(st.cross.v) === X.keyOf(v) ? null : { t: c.t, c: c.c, v };
    repaint(scope); return;
  }
  // Laboratuvar
  if (d.lab) { showLab(d.lab); return; }
  if (t.matches('li[data-hl]')) { hlLines(t); return; }
  // Püf noktaları
  if (d.trick) { toggleTrick(d.trick); return; }
  if (d.trlv !== undefined && t.matches('[data-trlv]')) { TR.lv = d.trlv; document.querySelectorAll('[data-trlv]').forEach(b => b.setAttribute('aria-pressed', b.dataset.trlv === d.trlv)); $('#tGrid').innerHTML = tGrid(); C.enhance($('#tGrid')); return; }
  if (d.trcat) { TR.cat = d.trcat; document.querySelectorAll('[data-trcat]').forEach(b => b.setAttribute('aria-pressed', b.dataset.trcat === d.trcat)); $('#tGrid').innerHTML = tGrid(); C.enhance($('#tGrid')); if (TR.open) paintDemo(TR.open); return; }
  if (d.trd) { const [id, k, v] = d.trd.split('|'); const s = ts(id); if (k === 'yil') { const y = +v; s.yil = s.yil.includes(y) ? s.yil.filter(x => x !== y) : s.yil.concat([y]); } else if (k === 'kanal') s.kanal = s.kanal.includes(v) ? s.kanal.filter(x => x !== v) : s.kanal.concat([v]); else if (k === 'n') s.n = +v; else if (k === 'up') { s.lv = Math.max(0, s.lv - 1); s.path = s.path.slice(0, s.lv); } else if (k === 'cat') s.cat = v || null; else s[k] = v; paintDemo(id); return; }
  if (d.i !== undefined) { const dw = t.closest('[data-trdrill]'), th = t.closest('[data-trthru]'); if (dw) { const id = dw.dataset.trdrill, s = ts(id); if (s.lv < 2) { s.path = s.path.slice(0, s.lv).concat([s.cats[+d.i]]); s.lv++; paintDemo(id); } return; } if (th) { const id = th.dataset.trthru, s = ts(id); s.cat = s.cats[+d.i]; paintDemo(id); return; } }
  // Menüler
  if (d.mng !== undefined) { MN.g = +d.mng; MN.tab = MENUS[MN.g].tabs[0].id; $('#mnBody').innerHTML = menusBody(); return; }
  if (d.mnt) { MN.tab = d.mnt; $('#mnBody').innerHTML = menusBody(); return; }
  // Final
  if (d.finpage) { FIN.page = d.finpage; closeDrawer(); document.querySelectorAll('.pagenav [data-finpage]').forEach(b => b.setAttribute('aria-selected', b.dataset.finpage === FIN.page)); const host = $('#finRep'); if (host) { host.innerHTML = dashFrame(DMAP[FIN.page], 'final'); repaint('final'); if (!t.closest('.pagenav')) host.scrollIntoView({ block: 'start', behavior: 'smooth' }); } return; }
});
function hlLines(li) { const box = li.closest('.labd'); if (!box) return; box.querySelectorAll('.ln.on').forEach(e => e.classList.remove('on')); box.querySelectorAll('.lsteps li.on').forEach(e => e.classList.remove('on')); li.classList.add('on'); (li.dataset.hl || '').split(',').filter(Boolean).forEach(i => { const e = box.querySelector('.ln[data-ln="' + i + '"]'); if (e) e.classList.add('on'); }); }
document.addEventListener('pointerover', ev => { const li = ev.target.closest && ev.target.closest('.lsteps li[data-hl]'); if (li) hlLines(li); });
document.addEventListener('focusin', ev => { const li = ev.target.closest && ev.target.closest('.lsteps li[data-hl]'); if (li) hlLines(li); });
document.addEventListener('change', ev => {
  const e = ev.target, d = e.dataset;
  if (d.vsw !== undefined) { vsSet('w', d.vsw, e.value); return; }
  if (d.vsf !== undefined) { vsSet('f', d.vsf, e.value); return; }
  if (d.vsa !== undefined) { vsSet('a', d.vsa, e.value); return; }
  if (d.vsg !== undefined) { vsSet('g', d.vsg, e.value); return; }
  if (d.slicerDd === 'vs') { VS.sl = e.value ? [JSON.parse(e.value)] : []; paintVS(); return; }
  if (d.dsl) { const scope = d.scope, st = stOf(scopeDash(scope)); st.sl[d.dsl] = e.value ? [JSON.parse(e.value)] : []; repaint(scope); return; }
  if (d.fin) { C.P.final[d.fin] = e.checked; if (e.checked) C.addXP(2); C.save(); const det = e.closest('details.stage'); if (det) { const n = +det.dataset.stage; const s = FIN_DEF.stages[n - 1]; const done = s.tasks.filter((x, i) => C.P.final[finKey(n, i)]).length; det.querySelector('summary small').textContent = done + '/' + s.tasks.length + ' görev · ' + stageCmds(n).length + ' menü komutu'; } const pr = finProgress(); const bar = document.querySelector('.hero-main .bar i'); if (bar) bar.style.width = (pr.d / pr.t * 100) + '%'; const sp = document.querySelector('.hero-main .num'); if (sp) sp.textContent = pr.d + '/' + pr.t + ' görev tamamlandı'; return; }
  if (e.id === 'labSel') { showLab(e.value); return; }
  if (e.type === 'checkbox' && d.slicer === 'vs') { const v = JSON.parse(d.v); VS.sl = e.checked ? (VS.f.single ? [v] : VS.sl.concat([v])) : VS.sl.filter(x => X.keyOf(x) !== X.keyOf(v)); paintVS(); return; }
});
document.addEventListener('input', ev => { if (ev.target.id === 'mnQ') { MN.q = ev.target.value; $('#mnBody').innerHTML = menusBody(); } });
document.addEventListener('toggle', ev => { const el = ev.target; if (el && el.matches && el.matches('details.stage') && el.open) FIN.open = +el.dataset.stage; }, true);
/* Sağ tık → detay sayfası (Power BI’daki “Detaya git”) */
document.addEventListener('contextmenu', ev => {
  const m = ev.target.closest && ev.target.closest('.dtile[data-cross] [data-i]'); if (!m) return;
  const tileEl = m.closest('.dtile'), scope = tileEl.dataset.scope, dd = scopeDash(scope); if (!dd) return; const tl = tileById(dd, tileEl.dataset.tile); if (!tl || !tl.thru || !tl.cross) return;
  const cs = DB.cats[scope + ':' + tl.id]; const v = cs && cs[+m.dataset.i]; if (v === undefined) return;
  ev.preventDefault(); const st = stOf(dd); st.thru = { field: tl.cross, v, from: st.page }; st.page = tl.thru; st.cross = null; st.drill = {}; closeDrawer(); reframe(scope);
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && DB.insp) { closeDrawer(); return; }
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.dtile [data-i]:not(button), .dnode, [data-trdrill] [data-i], [data-trthru] [data-i]')) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
});

C.start();
})();
