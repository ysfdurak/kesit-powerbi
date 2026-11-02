global.window=global; require('/home/claude/pbi/certdata_pl.js');
const plain=s=>String(s).replace(/`/g,'');
const all=PBI_CERTQ.concat(PBI_CASES.flatMap(c=>c.qs));
all.filter(q=>(q.type||'mc')==='mc').forEach(q=>{const L=q.o.map(o=>plain(o).length);const mx=Math.max(...L),mn=Math.min(...L);const tag=(L[q.a]===mx&&L.filter(x=>x===mx).length===1)?'LONG':(L[q.a]===mn&&L.filter(x=>x===mn).length===1)?'short':'-';console.log(q.id.padEnd(14),tag.padEnd(6),'a='+q.a,L.join(','));});
const c={};all.forEach(q=>{c[q.type]=(c[q.type]||0)+1});console.log(c);
const d={};PBI_CERTQ.forEach(q=>{d[q.k]=(d[q.k]||0)+1});console.log(d);
