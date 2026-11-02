global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep',...['c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3'].filter(x=>require('fs').existsSync(P+x+'.js')),'pqdata','extra','mcfix','bank']) require(P + f + '.js');
const X = PBI_DAX; const base = {}; PBI_MEASURES.forEach(m => base[m.name] = { name: m.name, expr: m.expr });
const ms = ex => { const o = {}; for (const k in base) if (k !== ex) o[k] = base[k]; return o; };
const norm = s => String(s).replace(/\s+/g, '');
const lessonSols = new Set(PBI_LESSONS.flatMap(l => (l.ex || []).filter(e => e.t === 'dax' || e.t === 'query').map(e => norm(e.sol))));
const kk = v => v === null ? '∅' : typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v instanceof Date ? v.getTime() : String(v);
let bad = 0; const ids = new Set(); const per = {};
for (const e of PBI_PRACTICE) {
  per[e.L] = (per[e.L] || 0) + 1;
  if (ids.has(e.id)) { bad++; console.log('DUP ID', e.id); } ids.add(e.id);
  if (!PBI_PR_TOPICS[e.tp]) { bad++; console.log('TOPIC?', e.id); }
  if (e.t === 'pq') { const s = PBI_PQ.exSource(e); const r = PBI_PQ.run(s, e.sol); if (r.error) { bad++; console.log('PQ ERR', e.id, r.error.msg); } else console.log('PQ', e.id, r.table.cols.map(c => c.name + ':' + c.type).join(','), r.table.rows.length); continue; }
  if (lessonSols.has(norm(e.sol))) { bad++; console.log('DERSTE VAR', e.id); }
  try {
    if (e.t === 'query') { const r = X.runQuery(ms(), e.sol); console.log('Q', e.id, r.cols.join('|'), r.rows.length); if (!r.rows.length) bad++; continue; }
    const g = e.grid || [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }];
    const vals = []; if (!e.noTotal) vals.push(X.evalMeasure(ms(e.name), e.sol, []));
    g.forEach(c => X.query({ rows: [c], measures: ms(e.name), values: [e.sol], totals: false, keepBlank: true }).rows.forEach(r => vals.push(r.vals[0])));
    const u = new Set(vals.map(kk)); const nb = vals.filter(v => v !== null).length;
    const flag = u.size <= 1 ? 'SABİT!' : u.size === 2 ? '(2 değer)' : '';
    if (u.size <= 1 || !nb) bad++;
    console.log(e.id.padEnd(14), String(vals.length).padStart(3), 'hücre', String(u.size).padStart(3), 'farklı', flag, JSON.stringify(vals.slice(0, 3)).slice(0, 70));
  } catch (er) { bad++; console.log('ERR', e.id, er.message); }
}
console.log(PBI_PRACTICE.length, 'görev', JSON.stringify(per), 'sorun', bad);
