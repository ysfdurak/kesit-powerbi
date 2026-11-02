global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13'].forEach(f => require(P + f + '.js'));
const before = new Set((window.PBI_LESSONS||[]).map(l=>l.id)); require(P + 'c14.js');
PBI_LESSONS.filter(l => !before.has(l.id)).forEach(l => { const t = l.body.replace(/<[^>]+>/g,''); const all = t + l.title + l.sum + JSON.stringify(l.ex); const c = {}; l.ex.forEach(e => c[e.t] = (c[e.t]||0)+1); console.log(l.id, l.lv, t.length, JSON.stringify(c), 'levelcodes:', (all.match(/\b[ABC][12]\b/g)||[]).join(',')); });
console.log('order', PBI_ORDER.indexOf('hesap-tablolar') - PBI_ORDER.indexOf('dax-tarih-metin'), PBI_ORDER.indexOf('ayristirma-etkileyen') - PBI_ORDER.indexOf('analiz-ozellikleri'));
