global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const r3 = v => typeof v === 'number' ? Math.round(v * 10000) / 10000 : (v instanceof Date ? v.toISOString().slice(0,10) : v);
module.exports = {
  X, ms,
  def: (n, e) => { ms[n] = { name: n, expr: e }; },
  ev: (e, f) => r3(X.evalMeasure(ms, e, f || [])),
  q: (e, g, opt) => X.query(Object.assign({ rows: Array.isArray(g) ? g : [g], measures: ms, values: Array.isArray(e) ? e : [e], totals: true }, opt||{})).rows.map(r => r.keys.join('/') + ' = ' + r.vals.map(r3).join(' | ')),
  run: s => { const r = X.runQuery(ms, s); return r.rows.map(x => JSON.stringify(Array.isArray(x)?x.map(r3):Object.fromEntries(Object.entries(x).map(([k,v])=>[k,r3(v)])))); },
};
