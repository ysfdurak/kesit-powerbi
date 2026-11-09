/* Kesit Power BI — dashboard çekirdeği: dilimleyiciler, çapraz filtre, detaya inme, RLS benzetimi ve görsellere verilen API. */
(function (W) {
'use strict';
const X = W.PBI_DAX, V = W.PBIViz, MODEL = W.PBI_MODEL;
const pc = s => { const m = String(s).match(/^(\w+)\[(.+)\]$/); return m ? { t: m[1], c: m[2] } : null; };
const vals = (t, c) => [...new Set(MODEL.tables[t].rows.map(r => r[c]).filter(v => v != null))].sort((a, b) => X.sortCompare({ t, c }, a, b));
const repIds = [...new Set(MODEL.tables.Satislar.rows.map(r => r.TemsilciNo))];
const reps = MODEL.tables.Calisanlar.rows.filter(r => repIds.includes(r.CalisanNo) && !/Müdür/.test(r.Unvan)).map(r => r.AdSoyad);
const pct = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.round(Math.abs(v) * 100) + '%';

/* Dilimleyici tanımları. single: tek seçim; req: boş bırakılamaz (parametre); rls: filtre değil rol */
const SL = {
  yil: { t: 'Tarih', c: 'Yil', label: 'Yıl', vals: vals('Tarih', 'Yil'), def: [2024] },
  yilMulti: { t: 'Tarih', c: 'Yil', label: 'Yıl (Ctrl ile çoklu)', vals: vals('Tarih', 'Yil'), def: [2023, 2024] },
  kanal: { t: 'Satislar', c: 'Kanal', label: 'Kanal', vals: ['Web', 'Mobil', 'Mağaza'], def: [] },
  segment: { t: 'Musteriler', c: 'Segment', label: 'Segment', vals: vals('Musteriler', 'Segment'), def: [] },
  kategori: { t: 'Kategoriler', c: 'Kategori', label: 'Kategori', vals: vals('Kategoriler', 'Kategori'), def: [], style: 'dropdown' },
  topn: { t: 'TopNSecim', c: 'N', label: 'İlk N (parametre)', vals: vals('TopNSecim', 'N'), def: [5], single: true, req: true, style: 'dropdown' },
  fiyat: { t: 'FiyatSenaryosu', c: 'FiyatDegisimi', label: 'Fiyat değişimi (ne olur parametresi)', vals: vals('FiyatSenaryosu', 'FiyatDegisimi'), def: [0], single: true, req: true, fmtv: v => v === 0 ? '0' : pct(v) },
  para: { t: 'ParaBirimleri', c: 'ParaBirimi', label: 'Para birimi', vals: ['TRY', 'USD', 'EUR'], def: ['TRY'], single: true, req: true },
  viewAs: { t: 'Calisanlar', c: 'AdSoyad', label: 'Farklı görüntüle (RLS rolü: Temsilci)', vals: reps, def: [], single: true, rls: true, style: 'dropdown' },
  cihaz: { t: 'WebOlaylari', c: 'Cihaz', label: 'Cihaz', vals: vals('WebOlaylari', 'Cihaz'), def: [] },
  kaynak: { t: 'WebOlaylari', c: 'Kaynak', label: 'Trafik kaynağı', vals: vals('WebOlaylari', 'Kaynak'), def: [], style: 'dropdown' },
  departman: { t: 'Departmanlar', c: 'Departman', label: 'Departman', vals: vals('Departmanlar', 'Departman'), def: [], style: 'dropdown' }
};

/* Çok sayfalı rapor: d.pages yoksa tek sayfa (d.tiles). Gizli sayfalar: detay (drillthrough) ve araç ipucu sayfaları */
function pagesOf(dash) { return dash.pages && dash.pages.length ? dash.pages : [{ id: 'p1', name: dash.pageName || 'Genel bakış', tiles: dash.tiles || [] }]; }
function pageOf(dash, st) { const ps = pagesOf(dash); return ps.find(p => p.id === (st && st.page)) || ps.find(p => !p.hidden) || ps[0]; }
function allTiles(dash) { return pagesOf(dash).flatMap(p => p.tiles || []); }
function visOk(t, st) { if (!t.vis) return true; const [k, v] = String(t.vis).split(':'); return String((st.vis || {})[k]) === v; }
function tilesOf(dash, st) { return (pageOf(dash, st).tiles || []).filter(t => visOk(t, st) && !(st.mobile && t.mobile === false)).slice().sort((a, b) => st.mobile ? (a.morder || 50) - (b.morder || 50) : 0); }
function initState(dash) {
  const sl = {}; (dash.slicers || []).forEach(k => { sl[k] = (SL[k] ? SL[k].def : []).slice(); });
  const pr = {}; Object.keys(dash.params || {}).forEach(k => { pr[k] = dash.params[k].def; });
  const ps = pagesOf(dash);
  return { id: dash.id, sl, cross: null, drill: {}, page: (ps.find(p => !p.hidden) || ps[0]).id, pr, vis: Object.assign({}, dash.vis || {}), thru: null, mobile: false, bm: null };
}
/* Kayıtlı görünümü güncel rapor tanımlarıyla eşleştir. */
function restoreView(dash, saved) {
  const st = initState(dash);
  if (!saved || typeof saved !== 'object') return st;
  if (pagesOf(dash).some(page => !page.hidden && page.id === saved.page)) st.page = saved.page;
  for (const key of Object.keys(st.sl)) {
    const slicer = SL[key], values = saved.sl?.[key];
    if (!slicer || !Array.isArray(values)) continue;
    const valid = slicer.vals.filter(value => values.includes(value));
    if (valid.length || (!slicer.req && values.length === 0)) st.sl[key] = slicer.single ? valid.slice(0, 1) : valid;
  }
  for (const [key, param] of Object.entries(dash.params || {})) {
    if (param.opts.some(([value]) => value === saved.pr?.[key])) st.pr[key] = saved.pr[key];
  }
  for (const key of Object.keys(st.vis)) {
    const value = saved.vis?.[key];
    if (typeof value === 'string' && (value === st.vis[key] || allTiles(dash).some(tile => tile.vis === key + ':' + value))) st.vis[key] = value;
  }
  st.mobile = saved.mobile === true;
  if ((dash.bookmarks || []).some(bm => bm.id === saved.bm)) st.bm = saved.bm;
  return st;
}
/* Yer işareti uygula: sayfa, dilimleyiciler, parametreler, görünürlük ve çapraz filtre */
function applyBookmark(dash, st, bm) {
  if (!bm) { const f = initState(dash); Object.assign(st, f, { mobile: st.mobile }); return; }
  if (bm.page) st.page = bm.page;
  if (bm.sl) Object.keys(bm.sl).forEach(k => { st.sl[k] = bm.sl[k].slice(); });
  if (bm.pr) Object.assign(st.pr, bm.pr);
  if (bm.vis) Object.assign(st.vis, bm.vis);
  st.cross = bm.cross === undefined ? null : bm.cross; st.drill = {}; st.thru = bm.thru || null; st.bm = bm.id;
}
/* dilimleyiciye tıklama: ctrl = çoklu seçim (Power BI gibi); yıl dilimleyicileri dokunmatikte de çoklu */
function toggleSlicer(st, key, v, multi) {
  const d = SL[key]; const cur = st.sl[key] || [];
  if (d.single) { st.sl[key] = cur.length === 1 && X.keyOf(cur[0]) === X.keyOf(v) && !d.req ? [] : [v]; return; }
  const has = cur.some(x => X.keyOf(x) === X.keyOf(v));
  if (multi || key === 'yilMulti') st.sl[key] = has ? cur.filter(x => X.keyOf(x) !== X.keyOf(v)) : cur.concat([v]);
  else st.sl[key] = has && cur.length === 1 ? [] : [v];
}

function api(dash, st, ms, tile) {
  const keyEq = (a, b) => a.t === b.t && a.c === b.c;
  const yearSl = () => { const k = (dash.slicers || []).find(k => SL[k] && SL[k].t === 'Tarih' && SL[k].c === 'Yil'); return k ? (st.sl[k] || []) : []; };
  function spec(o) {
    o = o || {}; const ex = (o.except || []).map(e => ({ t: e[0], c: e[1] })); const isEx = s => ex.some(e => keyEq(e, s));
    let f = [];
    (dash.slicers || []).forEach(k => { const d = SL[k]; if (!d || d.rls) return; const v = st.sl[k]; if (!v || !v.length) return; const s = { t: d.t, c: d.c, values: v.slice() };
      if (isEx(s) && (s.t === 'Tarih' || MODEL.tables[s.t].kind === 'param')) return; f.push(s); });
    if (!o.noRls && st.sl.viewAs && st.sl.viewAs.length) f.push({ t: 'Calisanlar', c: 'AdSoyad', values: st.sl.viewAs.slice() });
    if (st.cross && !isEx(st.cross)) f.push({ t: st.cross.t, c: st.cross.c, values: [st.cross.v] });
    const pg = pageOf(dash, st); if (pg.thru && !o.noThru) { const tv = st.thru && st.thru.field === pg.thru.field ? st.thru.v : pg.thru.def; const c = pc(pg.thru.field); if (c && tv != null && !isEx(c)) { f = f.filter(x => !keyEq(x, c)); f.push({ t: c.t, c: c.c, values: [tv] }); } }
    (o.add || []).forEach(s => { f = f.filter(x => !keyEq(x, s)); f.push(s); });
    return f;
  }
  const msx = o => { if (!o || !o.extraMeasures) return ms; const m2 = Object.assign({}, ms); Object.keys(o.extraMeasures).forEach(k => { m2[k] = { name: k, expr: o.extraMeasures[k] }; }); return m2; };
  const Q = (rows, values, o) => { o = o || {}; const sp = spec(o); return X.query({ rows: rows.map(pc), measures: msx(o), values, slicers: sp, totals: o.totals !== false, keepBlank: !!o.keepBlank }); };
  const M = (expr, o) => { const sp = spec(o); return X.evalMeasure(msx(o), expr, sp, { shadow: sp }); };
  const ys = yearSl();
  const dr = tile && tile.drill ? (st.drill[tile.id] || { lv: 0, path: [] }) : null;
  const a = {
    Q, M, spec, fmt: V.fmt, esc: s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]),
    yearLabel: ys.length === 1 ? String(ys[0]) : ys.length ? ys.slice().sort().join(', ') : 'Tüm yıllar',
    timeAxis: ys.length === 1 ? 'Tarih[Ay]' : 'Tarih[YilAy]',
    P: { fiyat: st.sl.fiyat && st.sl.fiyat.length ? st.sl.fiyat[0] : 0, para: (st.sl.para && st.sl.para[0]) || 'TRY', viewAs: (st.sl.viewAs && st.sl.viewAs[0]) || null, topn: (st.sl.topn && st.sl.topn[0]) || 5 },
    sel: (cats, t, c) => st.cross && st.cross.t === t && st.cross.c === c ? cats.findIndex(k => X.keyOf(k) === X.keyOf(st.cross.v)) : null,
    slicerVals: k => st.sl[k] || [],
    prm: k => (st.pr || {})[k] !== undefined ? st.pr[k] : ((dash.params || {})[k] || {}).def,
    prmLabel: k => { const d = (dash.params || {})[k]; const v = (st.pr || {})[k] !== undefined ? st.pr[k] : d && d.def; const o = d && d.opts.find(x => x[0] === v); return o ? o[1] : String(v); },
    vis: k => (st.vis || {})[k],
    page: pageOf(dash, st),
    thruVal: () => { const pg = pageOf(dash, st); return pg.thru ? (st.thru && st.thru.field === pg.thru.field ? st.thru.v : pg.thru.def) : null; },
    level: dr ? dr.lv : 0,
    dcol: dr ? tile.drill[dr.lv] : null,
    dspec: dr ? dr.path.map((v, i) => Object.assign(pc(tile.drill[i]), { values: [v] })) : [],
    tipx: (col, cats) => tile && tile.tip ? (i => { const c = pc(col); const add = [{ t: c.t, c: c.c, values: [cats[i]] }]; try { return tile.tip(a, add, cats[i]); } catch (e) { return null; } }) : i => {
      const c = pc(col); const add = [{ t: c.t, c: c.c, values: [cats[i]] }];
      const r = Q(['Tarih[YilAy]'], ['Net Satış'], { add, totals: false, except: [['Tarih', 'Yil']] });
      const yoy = M('[YoY %]', { add });
      return { title: 'Araç ipucu sayfası · ' + cats[i], cards: [['Net Satış', V.fmt(M('[Net Satış]', { add }), 'para', true)], ['Geçen yıla göre', yoy == null ? '—' : pct(yoy)], ['Kâr marjı', V.fmt(M('[Kâr Marjı %]', { add }), 'yuzde')]], spark: r.rows.map(x => x.vals[0]).slice(-12), sparkLabel: 'Son 12 ay net satış' };
    }
  };
  return a;
}
const WIDE = ['column', 'bar', 'line', 'donut', 'waterfall', 'funnel', 'treemap', 'scatter', 'map', 'decomp', 'bullet', 'area', 'multiples', 'calendar', 'variance', 'dumbbell', 'gantt'];
function wrapV(w) { const o = {}; Object.keys(V).forEach(k => { o[k] = WIDE.includes(k) ? (d, opt) => V[k](d, Object.assign({ W: w }, opt || {})) : V[k]; }); return o; }
function renderTile(dash, tile, st, ms, w) {
  const a = api(dash, st, ms, tile); a.V = wrapV(w); a.W = w; a.mobile = !!st.mobile;
  let title = tile.title; try { if (typeof tile.title === 'function') title = tile.title(a); } catch (e) { title = ''; }
  if (tile.kind === 'nav' || tile.kind === 'text') { try { return { html: tile.kind === 'text' ? (typeof tile.html === 'function' ? tile.html(a) : tile.html || '') : '', cats: null, title }; } catch (e) { return { html: '', cats: null, title }; } }
  try { const r = tile.render(a); const o = typeof r === 'string' || r == null ? { html: r || '', cats: null } : r; o.title = title; if (title && o.html && o.html.indexOf('aria-label="Grafik"') >= 0) o.html = o.html.split('aria-label="Grafik"').join('aria-label="' + V.esc(String(title)) + '"'); return o; }
  catch (e) { if (!e.dax && W.console) console.error(tile.id, e); return { html: '<div class="msg err"><b>Hesaplama hatası</b>' + V.esc(e.message) + '</div>', cats: null, err: e }; }
}
/* drill işlemleri */
function drill(st, tile, op, v) {
  const d = st.drill[tile.id] || (st.drill[tile.id] = { lv: 0, path: [], mode: false }); const n = tile.drill.length;
  if (op === 'up' && d.lv > 0) { d.lv--; d.path = d.path.slice(0, d.lv); }
  if (op === 'mode') d.mode = !d.mode;
  if (op === 'next' && d.lv < n - 1) d.lv++; // tüm düzeyi genişlet: mevcut üst filtreler korunur
  if (op === 'reset') { d.lv = 0; d.path = []; d.mode = false; }
  if (op === 'into' && d.lv < n - 1) { d.path = d.path.slice(0, d.lv).concat([v]); d.lv++; }
  // tüm düzeyi genişletirken üst düzeyin filtresi yok: path, lv'den kısa olabilir
  return d;
}
W.PBI_DASHCORE = { SL, pagesOf, pageOf, allTiles, tilesOf, visOk, applyBookmark, initState, restoreView, toggleSlicer, api, renderTile, drill, pc, wrapV };
})(typeof window !== 'undefined' ? window : globalThis);
