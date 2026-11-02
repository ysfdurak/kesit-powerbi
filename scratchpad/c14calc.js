global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const ev = (e, f) => { try { return X.evalMeasure(ms, e, f || []); } catch (x) { return 'ERR ' + x.message; } };
const qq = (s, n) => { try { const r = X.runQuery(Object.assign({}, ms), s); console.log(r.cols.join(' | ')); r.rows.slice(0, n || 15).forEach(x => console.log('  ', x.map(v => v instanceof Date ? v.toISOString().slice(0,10) : typeof v === 'number' ? Math.round(v*1000)/1000 : v).join(' | '))); console.log('  rows', r.rows.length); } catch (x) { console.log('ERR', x.message); } };
const g = (e, t, c) => { try { return X.query({ rows: [{ t, c }], measures: ms, values: [e], totals: true }).rows.map(r => r.keys[0] + '=' + (typeof r.vals[0]==='number'?Math.round(r.vals[0]*1000)/1000:r.vals[0])); } catch (x) { return 'ERR ' + x.message; } };
module.exports = { X, ms, ev, qq, g };
if (require.main === module) { const code = process.argv[2]; eval(require('fs').readFileSync(code, 'utf8')); }
