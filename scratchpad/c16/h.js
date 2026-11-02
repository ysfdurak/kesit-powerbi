global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const M = PBI_MODEL;
const r3 = v => typeof v === 'number' ? Math.round(v*10000)/10000 : v;
global.ev = (e, f) => X.evalMeasure(ms, e, f || []);
global.Q = (src) => { const r = X.runQuery(Object.assign({}, ms), src); return r; };
global.T = (src) => { const r = Q(src); console.log(r.cols ? r.cols.map(c=>c.short||c.name||c).join(' | ') : ''); r.rows.forEach(row => console.log((Array.isArray(row)?row:Object.values(row)).map(r3).join(' | '))); };
global.M = M; global.X = X; global.ms = ms;
