global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, base = {}; PBI_MEASURES.forEach(m => base[m.name] = { name: m.name, expr: m.expr });
function run(expr, grid){ try{ const e0=X.check(expr); if(e0) return 'CHECKERR '+e0; const out=[X.evalMeasure(Object.assign({},base),expr,[])]; (grid||[{t:'Kategoriler',c:'Kategori'},{t:'Tarih',c:'Yil'}]).forEach(g=>X.query({rows:[g],measures:Object.assign({},base),values:[expr],totals:false,keepBlank:true}).rows.forEach(r=>out.push(r.vals[0]))); return JSON.stringify(out.map(v=>typeof v==='number'?Math.round(v*100)/100:v)).slice(0,400);}catch(e){return 'ERR '+e.message}}
const T = require(process.argv[2]);
T.forEach(([n,s,o,g])=>{console.log('==',n); console.log(' S',run(s,g)); console.log(' O',run(o,g));});
