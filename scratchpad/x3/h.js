global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22'].filter(x => require('fs').existsSync(P + x + '.js')).forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
global.E = (e, f=[]) => X.evalMeasure(ms, e, f);
global.Q = q => X.runQuery(ms, q).rows;
global.G = (rows, vals, slicers=[]) => X.query({ rows, measures: ms, values: vals, slicers, totals: true }).rows.map(r=>[...(r.keys||r.k||[]), ...r.vals]);
global.def = (n, e) => ms[n] = {name:n, expr:e};
module.exports = {X, ms};
