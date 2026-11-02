global.window=global; global.PBI_LESSONS=[]; const ids=['baglam','calculate','iteratorler','filter-all','var-mantik','siralama','yari-toplanabilir','hizli-olcu','zaman','hedef','rol-oynayan']; ids.forEach(id=>PBI_LESSONS.push({id,body:'',ex:[],min:0}));
require('/home/claude/pbi/x_orta1.js'); const pl=s=>String(s).replace(/<[^>]+>/g,'');
PBI_EXT.forEach(x=>x.ex.forEach((e,i)=>{ if(e.t!=='mc')return; const L=e.o.map(o=>pl(o).length); const mx=Math.max(...L),mn=Math.min(...L); console.log(x.id,i,'a='+e.a,L.join(','), L[e.a]===mx?'LONGEST':L[e.a]===mn?'shortest':''); }));
