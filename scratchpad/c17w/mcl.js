global.window=global; window.PBI_ORDER=[]; require('/home/claude/pbi/c17.js');
PBI_LESSONS.forEach(l=>l.ex.forEach((e,i)=>{ if(e.t!=='mc')return; const L=e.o.map(o=>o.replace(/<[^>]+>/g,'').length); const mx=Math.max(...L), mn=Math.min(...L); console.log(l.id, i, 'a='+e.a, L.join(','), L[e.a]===mx?'LONG':L[e.a]===mn?'SHORT':''); }));
