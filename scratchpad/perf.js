global.window = global; for (const f of ['data','dax','measures']) require('/home/claude/pbi/' + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
for (const e of ['SUMX(Satislar, [Net Satış])', 'SUMX(Satislar, [Kâr Marjı %])', 'AVERAGEX(Musteriler, [Net Satış])']) { const t0 = Date.now(); const v = X.evalMeasure(ms, e, []); console.log(e, v, Date.now() - t0, 'ms'); }
const t0 = Date.now(); X.query({ rows: [{ t: 'Tarih', c: 'YilAy' }], measures: ms, values: ['SUMX(Satislar, [Net Satış])'], totals: true }); console.log('query yilay', Date.now() - t0, 'ms');
