/* Dashboard doğrulayıcı: tüm raporların tüm sayfalarını, yer imlerini, parametre seçeneklerini, detay sayfalarını ve telefon düzenini node'da çizer. */
global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: String(s).length * 6 }) }) }) };
const P = '/home/claude/pbi/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'levels', 'viz', 'dashboards', 'dashcore'].concat(process.argv.slice(2).length ? [] : []).concat(require('fs').readdirSync(P).filter(f => f === 'dash_up1.js').map(f => f.replace('.js', '')).sort())) require(P + f + '.js');
const DC = PBI_DASHCORE; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr }); (PBI_PATTERNS || []).forEach(p => { if (!ms[p.name]) ms[p.name] = { name: p.name, expr: p.expr }; });
const only = process.argv.slice(2);
let bad = 0, n = 0, pages = 0; const ids = new Set(); const sizes = {};
const check = (d, st, tag) => {
  const ts = DC.tilesOf(d, st); if (!ts.length) { bad++; console.log('BOŞ SAYFA', d.id, tag); }
  ts.forEach(t => { n++; const r = DC.renderTile(d, t, st, ms, st.mobile ? 330 : 900); const html = (r.html || '') + ' ' + (r.title || '');
    if (r.err || /msg err/.test(html)) { bad++; console.log('HATA', d.id, tag, t.id, r.err ? r.err.message : html.replace(/<[^>]+>/g, ' ').slice(0, 160)); }
    else if (/NaN|undefined|\[object Object\]|Infinity/.test(html.replace(/data-tip="[^"]*"/g, ''))) { bad++; console.log('GARİP DEĞER', d.id, tag, t.id, (html.match(/.{0,60}(NaN|undefined|\[object Object\]|Infinity).{0,40}/) || [''])[0].replace(/<[^>]+>/g, ' ')); }
    else if (!t.kind && html.replace(/<[^>]+>/g, '').trim().length < 2 && !/<svg|<img/.test(html)) { bad++; console.log('BOŞ GÖRSEL', d.id, tag, t.id); } });
};
PBI_DASHES.forEach(d => {
  if (only.length && !only.includes(d.id)) return;
  if (ids.has(d.id)) { bad++; console.log('ÇİFT ID', d.id); } ids.add(d.id);
  ['id', 'name', 'icon', 'audience', 'question', 'build'].forEach(k => { if (!d[k]) { bad++; console.log('EKSİK', d.id, k); } });
  const ps = DC.pagesOf(d); const tids = new Set();
  ps.forEach(pg => { pages++; (pg.tiles || []).forEach(t => { if (tids.has(t.id)) { bad++; console.log('ÇİFT GÖRSEL ID', d.id, t.id); } tids.add(t.id);
    if (t.thru && !ps.some(p => p.id === t.thru)) { bad++; console.log('DETAY SAYFASI YOK', d.id, t.id, t.thru); }
    if (t.thru && !t.cross) { bad++; console.log('DETAY İÇİN cross GEREKİR', d.id, t.id); }
    if (t.kind === 'nav') (t.items || []).forEach(it => { if (it.page && !ps.some(p => p.id === it.page)) { bad++; console.log('NAV SAYFA YOK', d.id, t.id, it.page); } if (it.bm && !(d.bookmarks || []).some(b => b.id === it.bm)) { bad++; console.log('NAV YER İMİ YOK', d.id, it.bm); } });
    if (!t.kind && (!t.type || !t.wells || !t.why)) { bad++; console.log('GÖRSEL BİLGİSİ EKSİK (type/wells/why)', d.id, t.id); } });
    const st = DC.initState(d); st.page = pg.id; check(d, st, pg.id);
    if (pg.thru) { const st2 = DC.initState(d); st2.page = pg.id; if (pg.thru.def == null) { bad++; console.log('DETAY SAYFASI def YOK', d.id, pg.id); } check(d, st2, pg.id + '(detay)'); } });
  (d.bookmarks || []).forEach(b => { const st = DC.initState(d); DC.applyBookmark(d, st, b); if (b.page && !ps.some(p => p.id === b.page)) { bad++; console.log('YER İMİ SAYFA YOK', d.id, b.id); } check(d, st, 'bm:' + b.id); });
  Object.keys(d.params || {}).forEach(k => d.params[k].opts.forEach(o => { const st = DC.initState(d); st.pr[k] = o[0]; ps.filter(p => !p.hidden).forEach(pg => { st.page = pg.id; check(d, st, 'prm:' + k + '=' + o[0] + '@' + pg.id); }); }));
  Object.keys(d.vis || {}).forEach(k => { const vals = new Set(DC.allTiles(d).filter(t => t.vis && t.vis.split(':')[0] === k).map(t => t.vis.split(':')[1])); vals.forEach(v => { const st = DC.initState(d); st.vis[k] = v; ps.forEach(pg => { st.page = pg.id; if (DC.tilesOf(d, st).length) check(d, st, 'vis:' + k + '=' + v + '@' + pg.id); }); }); });
  const stm = DC.initState(d); stm.mobile = true; check(d, stm, 'mobil');
  sizes[d.id] = ps.length + 's/' + DC.allTiles(d).length + 'g' + ((d.bookmarks || []).length ? '/' + d.bookmarks.length + 'yi' : '');
});
console.log(JSON.stringify(sizes));
console.log('rapor', ids.size, 'sayfa', pages, 'görsel çizimi', n, 'SORUN', bad);
