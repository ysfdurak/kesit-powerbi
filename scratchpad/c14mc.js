global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels'].forEach(f => require(P + f + '.js'));
const before = new Set((window.PBI_LESSONS||[]).map(l=>l.id)); require(P + 'c14.js');
PBI_LESSONS.filter(l => !before.has(l.id)).forEach(l => l.ex.forEach((e, i) => { if (e.t !== 'mc') return; const L = e.o.map(o => o.replace(/<[^>]+>/g,'').length); const mx = Math.max(...L), mn = Math.min(...L); console.log(l.id, i, 'a=' + e.a, L.join(','), L[e.a] === mx ? 'LONGEST' : L[e.a] === mn ? 'shortest' : ''); }));
