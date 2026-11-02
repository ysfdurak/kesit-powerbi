global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
global.Q = s => { try { const r = X.runQuery(ms, s); console.log(r.cols.join(' | ')); r.rows.forEach(x => console.log(JSON.stringify(x))); } catch (e) { console.log('ERR', e.message); } };
global.M = (s, f) => { try { console.log(JSON.stringify(X.evalMeasure(ms, s, f || []))); } catch (e) { console.log('ERR', e.message); } };
require(require('path').resolve(process.argv[2]));
