global.window=global; const P='/home/claude/pbi/'; const fs=require('fs');
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22'].filter(x=>fs.existsSync(P+x+'.js'))) require(P+f+'.js');
require(P+'x_orta2.js');
const plain=s=>String(s).replace(/<[^>]+>/g,'');
PBI_EXT.forEach(x=>x.ex.forEach((e,i)=>{ if(e.t!=='mc')return; const L=e.o.map(o=>plain(o).length); const mx=Math.max(...L), mn=Math.min(...L); const f=L[e.a]===mx?'LONG':L[e.a]===mn?'short':''; console.log(x.id, i, 'a='+e.a, L.join(','), f); }));
