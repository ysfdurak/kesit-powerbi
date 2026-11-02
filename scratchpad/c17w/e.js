global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const M = PBI_MODEL;
const ev = (e, f) => X.evalMeasure(ms, e, f || []);
const q = (e, g) => X.query({ rows: [g], measures: ms, values: [e], totals: true }).rows.map(r => r.keys[0] + '=' + (typeof r.vals[0]==='number'?Math.round(r.vals[0]*1000)/1000:r.vals[0]));
const rq = s => X.runQuery(Object.assign({}, ms), s).rows;
const at=(e,ym)=>ev(`CALCULATE(${e}, Tarih[YilAy]="${ym}")`);
const code = require('fs').readFileSync(process.argv[2],'utf8'); eval(code);
