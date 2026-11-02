global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: 6 }) }) }) };
const P = '/home/claude/pbi/'; for (const f of ['data','data2','dax','measures','patterns','levels','viz','dashboards','dashcore','dash_new1','dash_new2','dash_new3','dash_up1','dash_up2']) require(P + f + '.js');
const DC = PBI_DASHCORE; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
for (const id of ['rfm','kokpit','musteri']) { const d = PBI_DASHES.find(x => x.id === id); const st = DC.initState(d);
  for (const pg of DC.pagesOf(d).filter(p=>!p.hidden)) { st.page = pg.id; const t0 = Date.now(); PBI_DAX.batch(() => DC.tilesOf(d, st).forEach(t => DC.renderTile(d, t, st, ms, 900))); console.log(id, pg.id, Date.now() - t0, 'ms'); } }
