global.window=global;const P='/home/claude/pbi/';for(const f of ['data','data2','dax','measures'])require(P+f+'.js');const ms={};PBI_MEASURES.forEach(m=>ms[m.name]={name:m.name,expr:m.expr});
const T=PBI_MODEL.tables;console.log('rows', ['Giderler','GiderButce','Talepler','SatinAlmalar','Projeler'].map(t=>t+'='+T[t].rows.length).join(' '));
for(const q of process.argv.slice(2)) try{const r=PBI_DAX.runQuery(ms,q);console.log(r.rows.map(x=>x.map(v=>typeof v==='number'?Math.round(v*1000)/1000:v).join(' | ')).join('\n'))}catch(e){console.log('ERR',e.message)}
