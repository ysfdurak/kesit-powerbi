global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22'].filter(x=>require('fs').existsSync(P+x+'.js')).forEach(f => require(P + f + '.js'));
const n=[];PBI_LESSONS.forEach(l=>(l.ex||[]).forEach(e=>{if(e.t==='dax')n.push(e.name)}));console.log(n.sort().join(' | '));
