global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures','patterns','levels'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
global.X=X; global.ms=ms;
global.E = (e, f=[]) => { try { return X.evalMeasure(ms, e, f); } catch(x) { return ['ERR '+x.message]; } };
global.Q = (q) => { try { return X.runQuery(ms, q).rows; } catch(x) { return ['ERR '+x.message]; } };
global.G = (rows, vals, slicers=[], totals=true) => { try { const r = X.query({ rows, measures: ms, values: vals, slicers, totals }); return r.rows.map(x=>[x.keys||x.key||x.k, x.vals].flat(2).join(' | ')).concat(['TOT '+JSON.stringify(r.total)]); } catch(x) { return ['ERR '+x.message]; } };
global.def = (n,e)=> ms[n]={name:n,expr:e};
