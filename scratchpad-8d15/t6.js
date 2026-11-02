// Dashboard smoke test: her dashboardın her görselini varsayılan durumda ve bazı etkileşimlerle çiz
global.window = global; const D = '/home/claude/pbi/';
['data', 'dax', 'measures', 'patterns', 'viz', 'dashboards', 'dashcore'].forEach(f => require(D + f + '.js'));
const X = PBI_DAX, C = PBI_DASHCORE;
const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
let bad = 0;
const missing = new Set();
PBI_DASHES.forEach(d => {
  d.tiles.forEach(t => (t.measures || []).forEach(n => { if (!ms[n]) missing.add(d.id + ':' + t.id + ' -> ' + n); }));
  (d.build || []).forEach(b => (b[2] || []).forEach(n => { if (!ms[n]) missing.add(d.id + ':build -> ' + n); }));
  const variants = [['default', st => st]];
  if (d.slicers.includes('kategori')) variants.push(['kat', st => { st.sl.kategori = ['Elektronik']; return st; }]);
  if (d.slicers.includes('viewAs')) variants.push(['rls', st => { st.sl.viewAs = [C.SL.viewAs.vals[0]]; return st; }]);
  if (d.slicers.includes('para')) variants.push(['usd', st => { st.sl.para = ['USD']; st.sl.fiyat = [0.1]; return st; }]);
  if (d.slicers.includes('yil')) variants.push(['allyears', st => { st.sl.yil = []; return st; }]);
  variants.push(['cross', st => { st.cross = { t: 'Satislar', c: 'Kanal', v: 'Web' }; return st; }]);
  variants.forEach(([vn, fn]) => {
    const st = fn(C.initState(d)); const t0 = Date.now();
    X.batch(() => d.tiles.forEach(t => {
      const t1 = Date.now(); const r = C.renderTile(d, t, st, ms, 500); const dt = Date.now() - t1;
      if (r.err || /msg err/.test(r.html)) { bad++; console.log('ERR', d.id, vn, t.id, r.err ? r.err.message : r.html.slice(0, 200)); }
      if (dt > 400) console.log('slow', d.id, vn, t.id, dt + 'ms');
      if (t.drill) { const st2 = JSON.parse(JSON.stringify(st)); const cats = r.cats || []; if (cats.length) { C.drill(st2, t, 'into', cats[0]); const r2 = C.renderTile(d, t, st2, ms, 500); if (r2.err) { bad++; console.log('ERR drill', d.id, t.id, r2.err.message); } } }
    }));
    console.log(d.id.padEnd(10), vn.padEnd(9), (Date.now() - t0) + 'ms');
  });
});
console.log('missing measures:', [...missing]);
console.log('tiles', PBI_DASHES.reduce((a, d) => a + d.tiles.length, 0), 'bad', bad);
