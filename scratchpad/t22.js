global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
global.X=X; global.ms=ms;
const q = s => { try { const r = X.runQuery(ms, s); console.log(JSON.stringify(r.rows.slice(0, 40))); } catch (e) { console.log('ERR', e.message); } };
const m = s => { try { console.log(JSON.stringify(X.evalMeasure(ms, s, []))); } catch (e) { console.log('ERR', e.message); } };
global.q=q; global.m=m;
require(process.argv[2]);
