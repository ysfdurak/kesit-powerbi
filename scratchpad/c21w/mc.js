global.window=global; const P='/home/claude/pbi/'; require(P+'c21.js');
const plain=s=>String(s).replace(/<[^>]+>/g,'').replace(/&[a-z]+;/g,'x');
PBI_LESSONS.forEach(l=>{console.log(l.id, plain(l.body).length); l.ex.forEach((e,i)=>{ if(e.t!=='mc')return; const L=e.o.map(o=>plain(o).length); console.log(' ex'+i,'a='+e.a, L.join(','), L[e.a]===Math.max(...L)?'LONGEST':'', L[e.a]===Math.min(...L)?'SHORTEST':'');});});
