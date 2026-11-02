global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures','patterns']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
global.X=X; global.ms=ms;
global.ev = (e, f) => X.evalMeasure(ms, e, f || []);
global.q = (e, g) => X.query({ rows: [g], measures: ms, values: [e], totals: true }).rows.map(r => r.keys[0] + '=' + (typeof r.vals[0]==='number'?Math.round(r.vals[0]*10000)/10000:r.vals[0]));
global.rq = s => { const r = X.runQuery(Object.assign({}, ms), s); return r.rows; };
