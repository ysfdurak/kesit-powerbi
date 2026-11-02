global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures','exams','interview','interview2'].forEach(f => require(P + f + '.js'));
const nb = PBI_IV_BANK.filter(q => q.id.startsWith('iv-b'));
const ids = PBI_IV_BANK.map(q=>q.id); console.log('dup ids', ids.length - new Set(ids).size, 'yeni', nb.length);
const qs = PBI_IV_BANK.map(q=>q.q); console.log('dup q', qs.length - new Set(qs).size);
const bad = nb.filter(q => q.strong.length < 400 || q.strong.length > 900).map(q => q.id + ':' + q.strong.length); console.log('strong uzunluk dışı', bad.join(' '));
const L = nb.map(q=>q.strong.length); console.log('strong min/max/ort', Math.min(...L), Math.max(...L), Math.round(L.reduce((a,b)=>a+b)/L.length));
const by = {}; nb.forEach(q => { by[q.role] = by[q.role] || {}; by[q.role][q.cat] = (by[q.role][q.cat]||0)+1; }); console.log(JSON.stringify(by, null, 1));
const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
for (const k of ['tedarik','butce','destek']) { const t = PBI_IV_TAKEHOME[k]; console.log('TH', k, 'rubric', t.rubric.reduce((s,r)=>s+r.w,0), 'tasks', t.tasks.length, 'brief', t.brief.length);
  t.solution.measures.forEach(([n,e]) => { if (ms[n]) console.log('  AD ÇAKIŞIYOR', n); try { const v = PBI_DAX.evalMeasure(ms, e, [{t:'Tarih',c:'Yil',values:[2024]}]); console.log('  ', n.padEnd(32), Math.round(v*10000)/10000); } catch (er) { console.log('  ERR', n, er.message); } }); }
const txt = require('fs').readFileSync(P+'interview2.js','utf8'); console.log('${', txt.includes('${'));
