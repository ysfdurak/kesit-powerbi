global.window=global;const P='/home/claude/pbi/';for(const f of ['data','dax','measures'])require(P+f+'.js');const ms={};PBI_MEASURES.forEach(m=>ms[m.name]={name:m.name,expr:m.expr});
for(const q of process.argv.slice(2)) try{const r=PBI_DAX.runQuery(ms,q);console.log(JSON.stringify(r.rows).slice(0,300))}catch(e){console.log('ERR',e.message)}
