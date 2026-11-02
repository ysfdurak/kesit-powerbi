global.window=global; require('/home/claude/pbi/confused.js');
const plain=s=>String(s).replace(/`/g,'');
PBI_CONFUSED.forEach(c=>c.quiz.forEach((q,i)=>{const L=q.o.map(o=>plain(o).length);const mx=Math.max(...L),mn=Math.min(...L);
const f=(L[q.a]===mx&&L.filter(x=>x===mx).length===1)?'LONG':(L[q.a]===mn&&L.filter(x=>x===mn).length===1)?'short':'-';
console.log(c.id.padEnd(22),i,'a='+q.a,f.padEnd(5),JSON.stringify(L));}));
