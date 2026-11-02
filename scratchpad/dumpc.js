global.window=global; const P='/home/claude/pbi/';
require(P+'certskills.js'); ['certdata_pl','certdata_pl2','certdata_dp'].forEach(f=>require(P+f+'.js'));
PBI_CASES.forEach(c=>{console.log('\n#####',c.id,c.ex,c.title); c.tabs.forEach(t=>console.log('--',t[0],'::',t[1])); c.qs.forEach((q,i)=>console.log('Q'+i,q.k,q.s,q.type,'|',q.q, q.o?JSON.stringify(q.o)+' a='+q.a:'', q.st?JSON.stringify(q.st):'', q.items?JSON.stringify(q.items):''));});
