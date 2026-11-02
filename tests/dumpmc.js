global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep',...['c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3'].filter(x=>require('fs').existsSync(P+x+'.js')),'pqdata','extra','mcfix']) require(P + f + '.js');
const plain = s => String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const all = [];
PBI_LESSONS.forEach(l => (l.ex || []).forEach((e, i) => { if (e.t === 'mc' && !e.thumbs) all.push({ id: l.id + '#' + i, e }); }));
PBI_PLACEMENT.forEach((e, i) => all.push({ id: 'test#' + i, e }));
const fl = all.filter(({ e }) => { const L = e.o.map(o => plain(o).length); return L[e.a] === Math.max(...L); });
const fs = require('fs'); fs.writeFileSync('mcflag.json', JSON.stringify(fl.map(x => ({ id: x.id, q: x.e.q, o: x.e.o, a: x.e.a })), null, 1));
fl.forEach((x, n) => { console.log('#' + n + ' ' + x.id + ' :: ' + plain(x.e.q)); x.e.o.forEach((o, i) => console.log('   ' + (i === x.e.a ? '*' : ' ') + i + ' ' + plain(o))); });
