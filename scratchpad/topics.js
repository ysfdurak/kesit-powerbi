global.window=global; const P='/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','tricks','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20']) require(P+f+'.js');
const T=process.argv.slice(2);
for (const t of T){ const re=new RegExp(t,'i'); const hits=PBI_LESSONS.filter(l=>re.test(l.body)).map(l=>l.id+'('+((l.body.match(new RegExp(t,'gi'))||[]).length)+')'); console.log(t.padEnd(36), hits.length, hits.slice(0,8).join(' ')); }
