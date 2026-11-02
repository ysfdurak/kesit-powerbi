global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const M = PBI_MODEL; const T=M.tables;
global.ev = (e, f) => { try { return X.evalMeasure(ms, e, f || []); } catch(x){ return 'ERR '+x.message; } };
global.q = (e, g) => { try { return X.query({ rows: [g], measures: ms, values: [e], totals: true }).rows.map(r => r.keys[0] + '=' + (typeof r.vals[0]==='number'?Math.round(r.vals[0]*1000)/1000:r.vals[0])).join(' | '); } catch(x){ return 'ERR '+x.message; } };
global.rq = s => { try { const r = X.runQuery(Object.assign({}, ms), s); return JSON.stringify(r.rows.slice(0,12)); } catch(x){ return 'ERR '+x.message; } };
global.T=T; global.X=X; global.ms=ms;
require(require('path').resolve(process.argv[2]));
