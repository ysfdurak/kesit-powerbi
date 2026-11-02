global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep'].forEach(f => require(P + f + '.js'));
const n0 = PBI_LESSONS.length; require(P + 'c9.js');
const plain = s => String(s).replace(/<[^>]+>/g, '');
PBI_LESSONS.slice(n0).forEach(l => { console.log(l.id, plain(l.body).length, l.ex.map(e=>e.t).join(','), PBI_ORDER.indexOf(l.id), PBI_ORDER[PBI_ORDER.indexOf(l.id)-1]);
  l.ex.forEach((e,i)=>{ if(e.t!=='mc')return; const L=e.o.map(o=>plain(o).length); const mx=Math.max(...L), mn=Math.min(...L); console.log('  ex'+i, 'a='+e.a, L.join('/'), L[e.a]===mx?'LONGEST':'', L[e.a]===mn?'SHORTEST':''); }); });
