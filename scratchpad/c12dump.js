global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep'].forEach(f => require(P + f + '.js'));
for (const id of process.argv.slice(2)) { const l = PBI_LESSONS.find(x=>x.id===id); if(!l){console.log('YOK',id);continue;} console.log('=====',id,l.lv,l.mod); console.log(l.body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')); console.log('EX:', l.ex.map(e=>e.t+':'+(e.q||'').replace(/<[^>]+>/g,'').slice(0,80)).join('\n')); }
console.log(PBI_ORDER.join(' '));
