global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
global.Q = s => { try { return X.runQuery(ms, s).rows; } catch(e) { return 'ERR ' + e.message; } };
global.M = s => { try { return X.evalMeasure(ms, s, []); } catch(e) { return 'ERR ' + e.message; } };
global.ms = ms; global.X = X;
