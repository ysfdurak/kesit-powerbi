global.window = global; const D = '/home/claude/pbi/';
['data', 'dax', 'measures', 'patterns', 'viz', 'dashboards', 'dashcore'].forEach(f => require(D + f + '.js'));
const C = PBI_DASHCORE; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
PBI_DASHES.forEach(d => { const st = C.initState(d); if (d.id==='ekip') st.sl.viewAs=[C.SL.viewAs.vals[0]]; PBI_DAX.batch(() => d.tiles.forEach(t => { const r = C.renderTile(d, t, st, ms, 500); const h = r.html || '';
  const issues = []; if (/NaN|undefined|Infinity/.test(h)) issues.push('NaN/undef'); const nb = (h.match(/\(Boş\)/g) || []).length; if (nb) issues.push(nb + ' boş'); if (/Veri yok|class="empty"/.test(h)) issues.push('empty'); if (h.length < 80) issues.push('short:' + h.replace(/<[^>]+>/g,' ').trim().slice(0,80));
  if (issues.length) console.log(d.id, t.id, issues.join(', ')); })); });
