global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20'].filter(x=>require('fs').existsSync(P+x+'.js')).forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
global.X=X; global.ms=ms;
global.M=(e,f)=>{try{return X.evalMeasure(ms,e,f||[])}catch(x){return 'ERR '+x.message}};
global.Q=(q,n)=>{try{const r=X.runQuery(ms,q);return {cols:r.cols||r.columns,rows:r.rows.slice(0,n||10),n:r.rows.length}}catch(x){return 'ERR '+x.message}};
global.G=(rows,vals)=>{try{return X.query({rows,measures:ms,values:vals,slicers:[],totals:true}).rows}catch(x){return 'ERR '+x.message}};
