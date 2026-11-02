global.window = global; global.PBI_ORDER=[]; require('/home/claude/pbi/c10.js');
const plain = s => String(s).replace(/<[^>]+>/g, '');
PBI_LESSONS.forEach(l => (l.ex||[]).forEach((e,i)=>{ if(e.t!=='mc')return; const L=e.o.map(o=>plain(o).length); const mx=Math.max(...L), mn=Math.min(...L); console.log(l.id, i, 'a='+e.a, L.join(','), L[e.a]===mx?'LONG':L[e.a]===mn?'short':''); }));
