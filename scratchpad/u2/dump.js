global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: String(s).length * 6 }) }) }) };
const P = '/home/claude/pbi/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'levels', 'viz', 'dashboards', 'dashcore', 'dash_up2']) require(P + f + '.js');
const DC = PBI_DASHCORE; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr }); (PBI_PATTERNS || []).forEach(p => { if (!ms[p.name]) ms[p.name] = { name: p.name, expr: p.expr }; });
const ids = process.argv.slice(2); const strip = h => String(h||'').replace(/data-tip="[^"]*"/g,'').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
PBI_DASHES.filter(d => ids.includes(d.id)).forEach(d => { DC.pagesOf(d).forEach(pg => { const st = DC.initState(d); st.page = pg.id; const t0=Date.now();
  DC.tilesOf(d, st).forEach(t => { const r = DC.renderTile(d, t, st, ms, 900); const s = strip(r.html); const flag = /\(Boş\)|—|empty/.test(s + (r.html||'').slice(0,0)) || /class="empty"/.test(r.html||'');
    console.log((flag?'!! ':'   ')+d.id+'/'+pg.id+'/'+t.id+' ['+(r.title||'')+'] '+s.slice(0,150));
    if (t.tip && r.cats && r.cats.length) { const a = DC.api(d, st, ms, t); a.V = PBIViz; const x = a.tipx(t.cross || '', r.cats); }
  }); console.log('   time', pg.id, Date.now()-t0, 'ms'); }); });
// tips: find tiles with tip and test with a tipx call on first cats
PBI_DASHES.filter(d => ids.includes(d.id)).forEach(d => DC.pagesOf(d).forEach(pg => (pg.tiles||[]).filter(t=>t.tip).forEach(t => { const st = DC.initState(d); st.page = pg.id; const r = DC.renderTile(d, t, st, ms, 900);
  const m = (r.html||'').match(/data-tip="([^"]*)"/); if (!m) { console.log('TIP YOK', d.id, t.id); return; } const j = JSON.parse(m[1].replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')); const s=JSON.stringify(j.x); console.log((/NaN|undefined|null,|Infinity/.test(s)||!j.x?'!! ':'   ')+'TIP', d.id, t.id, s.slice(0,300)); })));
