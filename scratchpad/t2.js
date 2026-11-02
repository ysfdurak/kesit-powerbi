global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const t=(e,g)=>{try{ if(/EVALUATE/.test(e)) {const r=X.runQuery(Object.assign({},ms),e); console.log(JSON.stringify(r.rows.slice(0,6)), r.rows.length);} else if(g){console.log(JSON.stringify(X.query({rows:[g],measures:Object.assign({},ms),values:[e],totals:true}).rows.map(r=>[r.keys||r.k||r.label, r.vals])).slice(0,600));} else console.log(JSON.stringify(X.evalMeasure(Object.assign({},ms),e,[])));}catch(err){console.log('ERR',err.message)}};
module.exports=t;
if(require.main===module){ const a=process.argv.slice(2); t(a[0], a[1]?{t:a[1],c:a[2]}:null); }
