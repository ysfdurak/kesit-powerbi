global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures','patterns','levels'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
global.X=X; global.ms=ms;
global.ev=(e,sl)=>X.evalMeasure(ms,e,sl||[]);
global.q=(s)=>X.runQuery(ms,s).rows;
global.g=(rows,vals,sl,tot)=>X.query({rows,measures:ms,values:vals,slicers:sl||[],totals:tot!==false}).rows.map(r=>JSON.stringify(r));
global.p=(...a)=>console.log(...a);
