global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13'].forEach(f => { try { require(P + f + '.js'); } catch (e) { console.log('ERR', f, e.message); } });
const ids = process.argv.slice(2);
PBI_LESSONS.filter(l => ids.includes(l.id)).forEach(l => console.log('=====', l.id, l.lv, '\n', l.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 6000)));
