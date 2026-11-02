global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep',...['c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3'].filter(x=>require('fs').existsSync(P+x+'.js')),'pqdata','extra']) require(P + f + '.js');
const X = PBI_DAX; const base = {}; PBI_MEASURES.forEach(m => base[m.name] = { name: m.name, expr: m.expr });
const ms = ex => { const o = {}; for (const k in base) if (k !== ex) o[k] = base[k]; return o; };
const k = v => v === null ? '∅' : typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : String(v);
for (const l of PBI_LESSONS) (l.ex || []).forEach((e, i) => {
  if (e.t !== 'dax') return;
  const g = e.grid || [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }];
  const vals = []; if (!e.noTotal) vals.push(X.evalMeasure(ms(e.name), e.sol, []));
  g.forEach(c => X.query({ rows: [c], measures: ms(e.name), values: [e.sol], totals: false, keepBlank: true }).rows.forEach(r => vals.push(r.vals[0])));
  const u = new Set(vals.map(k)); if (u.size <= 2) console.log('WEAK', l.id, i, e.name, '| farklı değer:', [...u].join(', '), '| grid', g.map(c => c.t + '[' + c.c + ']').join(' '));
});
