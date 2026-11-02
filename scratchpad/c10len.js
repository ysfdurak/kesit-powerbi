global.window = global; const P='/home/claude/pbi/'; ['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep'].forEach(f=>require(P+f+'.js'));
require(P+'c10.js'); require(P+'pqdata.js');
const plain = s => String(s).replace(/<[^>]+>/g, '');
['pq-donusum','pq-ileri','veri-baglantilari','model-ileri'].forEach(id=>{const l=PBI_LESSONS.find(x=>x.id===id); const c={}; l.ex.forEach(e=>c[e.t]=(c[e.t]||0)+1); console.log(id, plain(l.body).length, l.ex.length, JSON.stringify(c), 'pos', PBI_ORDER.indexOf(id), PBI_ORDER[PBI_ORDER.indexOf(id)-1]);});
const l=PBI_LESSONS.find(x=>x.id==='pq-donusum'); const e=l.ex[0]; const s=PBI_PQ.exSource(e); const r=PBI_PQ.run(s,e.sol); console.log(r.table.rows.map(x=>x.join(' | '))); console.log(PBI_PQ.mCode(s,r.states));
