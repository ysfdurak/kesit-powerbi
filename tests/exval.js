global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep',...['c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','c24','c25','c26','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3'].filter(x=>require('fs').existsSync(P+x+'.js')),'pqdata','extra']) require(P + f + '.js');
const X = PBI_DAX; const base = {}; PBI_MEASURES.forEach(m => base[m.name] = { name: m.name, expr: m.expr });
const ms = ex => { const o = {}; for (const k in base) if (k !== ex) o[k] = base[k]; return o; };
let n = 0, bad = 0;
for (const l of PBI_LESSONS) (l.ex || []).forEach((e, i) => {
  if (e.t === 'mc' || e.t === 'pq') return; n++;
  try {
    if (e.t === 'query') { const r = X.runQuery(ms(), e.sol); if (!r.rows.length) { bad++; console.log('EMPTY', l.id, i); } return; }
    const g = e.grid || [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }];
    const tot = e.noTotal ? '-' : X.evalMeasure(ms(e.name), e.sol, []);
    const cells = g.map(c => X.query({ rows: [c], measures: ms(e.name), values: [e.sol], totals: false, keepBlank: true }).rows.map(r => r.vals[0]));
    const allBlank = cells.every(c => c.every(v => v === null));
    if (allBlank) { bad++; console.log('ALLBLANK', l.id, i, e.name); }
    if (['blank-hata','ilk-rapor','kosullu-bicim','istatistik-ileri'].includes(l.id)) console.log('OK', l.id, i, e.name, JSON.stringify(tot), JSON.stringify(cells.map(c => c.slice(0, 4))));
  } catch (er) { bad++; console.log('ERR', l.id, i, er.message); }
});
console.log('dax ex', n, 'bad', bad);
