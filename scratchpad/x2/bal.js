global.window = global; global.PBI_LESSONS = [];
['hesaplama-gruplari','performans','dax-opt','kurumsal-model','guvenlik','yayinlama','yonetisim','sayfalandirilmis','yasam-dongusu','m-dili'].forEach(id => PBI_LESSONS.push({ id, body: '', ex: [], min: 0 }));
require('/home/claude/pbi/x_ileri2.js');
const plain = s => String(s).replace(/<[^>]+>/g, '');
let n=0,lo=0,sh=0;
PBI_EXT.forEach(x => x.ex.forEach((e,i) => { if (e.t!=='mc') return; n++; const L=e.o.map(o=>plain(o).length); const mx=Math.max(...L), mn=Math.min(...L); const isL = L[e.a]===mx && L.filter(v=>v===mx).length===1; const isS = L[e.a]===mn && L.filter(v=>v===mn).length===1; if(isL)lo++; if(isS)sh++; console.log((isL?'L':isS?'S':'-'), x.id, i, 'a='+e.a, L.join(',')); }));
console.log(n, 'longest', lo, 'shortest', sh);
