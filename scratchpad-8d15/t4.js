globalThis.window = globalThis;
for (const f of ['data','dax','measures','patterns']) require('/home/claude/pbi/'+f+'.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
console.log('library', PBI_MEASURES.length);
for (const m of PBI_MEASURES) { const t0 = Date.now(); try { const v = X.evalMeasure(ms, '['+m.name+']', [{t:'Tarih',c:'Yil',values:[2024]}]); const d = Date.now()-t0; if (d > 150 || m.pattern) console.log('M', m.name.padEnd(26), String(typeof v==='string'?v.slice(0,60):v).padEnd(24), d+'ms'); } catch (e) { console.log('ERR', m.name, e.message); } }
for (const p of PBI_PATTERNS) {
  const t0 = Date.now();
  try {
    const col = s => { const m = s.match(/^(\w+)\[(.+)\]$/); return { t: m[1], c: m[2] }; };
    const sl = (p.slicers||[]).map(([t,c,v]) => ({t,c,values:v}));
    const rows = [col(p.axis)].concat(p.axis2 ? [col(p.axis2)] : []);
    const r = X.query({ rows, measures: ms, values: [p.name], slicers: sl, totals: true });
    console.log('P', p.lv, p.id.padEnd(14), r.rows.length, 'rows', JSON.stringify(r.rows.slice(0,3).map(x=>[x.keys.join('/'), typeof x.vals[0]==='string'?x.vals[0].slice(0,40):x.vals[0]])), 'tot', typeof r.total[0]==='string'? r.total[0].slice(0,30): r.total[0], (Date.now()-t0)+'ms');
  } catch (e) { console.log('PERR', p.id, e.message); }
}
