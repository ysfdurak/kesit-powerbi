global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep'].forEach(f => require(P + f + '.js'));
for (const id of process.argv.slice(2)) { const l = PBI_LESSONS.find(x=>x.id===id); console.log('=====', id, l.lv, l.mod); console.log(l.body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0, 2500)); console.log('EX:', l.ex.map(e=>e.t+':'+(e.name||'')).join(', ')); }
