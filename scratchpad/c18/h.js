global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const M = PBI_MODEL;
const ev = (e, f) => X.evalMeasure(ms, e, f || []);
const q = (e, g, n) => X.query({ rows: Array.isArray(g)?g:[g], measures: ms, values: Array.isArray(e)?e:[e], totals: true }).rows.slice(0, n||60).map(r => r.keys.join('|') + ' = ' + r.vals.map(v=>typeof v==='number'?Math.round(v*10000)/10000:v).join(' ; '));
const rq = s => X.runQuery(Object.assign({}, ms), s).rows;
module.exports = {X, ms, M, ev, q, rq};
