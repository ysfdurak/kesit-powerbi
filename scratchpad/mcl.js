global.window=global;global.PBI_ORDER=[];require('/home/claude/pbi/c19.js');
const pl=s=>String(s).replace(/<[^>]+>/g,'');
PBI_LESSONS.forEach(l=>l.ex.forEach((e,i)=>{if(e.t!=='mc')return;const L=e.o.map(o=>pl(o).length);const mx=Math.max(...L),mn=Math.min(...L);console.log(l.id,i,L.join(','),'a='+e.a,L[e.a]===mx?'LONGEST':'',L[e.a]===mn?'SHORTEST':'')}));
