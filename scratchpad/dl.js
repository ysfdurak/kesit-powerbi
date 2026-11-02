global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep'].forEach(f => require(P + f + '.js'));
const ids = process.argv.slice(2);
PBI_LESSONS.filter(l => ids.includes(l.id)).forEach(l => { console.log('=== '+l.id+' | '+l.title); console.log(l.body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0, 4000)); console.log('EX:', l.ex.map(e=>e.t+':'+(e.q||'').replace(/<[^>]+>/g,'').slice(0,100)).join('\n  ')); });
console.log('ORDER', PBI_ORDER.join(' '));
