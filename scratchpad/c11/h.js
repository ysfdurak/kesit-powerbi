global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const M = PBI_MODEL;
const ev = (e, f) => { try { return X.evalMeasure(ms, e, f || []); } catch (x) { return 'ERR ' + x.message; } };
const q = (e, g, n) => { try { return X.query({ rows: [g], measures: ms, values: [e], totals: true }).rows.slice(0, n||40).map(r => r.keys[0] + '=' + (typeof r.vals[0]==='number'?Math.round(r.vals[0]*10000)/10000:r.vals[0])); } catch (x) { return 'ERR ' + x.message; } };
const rq = s => { try { return X.runQuery(Object.assign({}, ms), s).rows; } catch (x) { return 'ERR ' + x.message; } };
module.exports = { X, ms, M, ev, q, rq };
