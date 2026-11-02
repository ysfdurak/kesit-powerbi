global.window = global; const P = '/home/claude/pbi/'; const fs=require('fs');
for (const f of fs.readdirSync(P).filter(f=>f.endsWith('.js'))) { try { require(P+f); } catch(e) { } }
const names = new Map();
const add=(n,w)=>{ if(n) names.set(n, (names.get(n)||[]).concat(w)); };
(PBI_MEASURES||[]).forEach(m=>add(m.name,'measure'));
(PBI_LESSONS||[]).forEach(l=>(l.ex||[]).forEach(e=>add(e.name,l.id)));
(window.PBI_CODEPOOL||[]).forEach(e=>add(e.name,e.id));
(window.PBI_INTERVIEW||[]).forEach(e=>add(e.name,e.id));
(window.PBI_PRACTICE||[]).forEach(e=>add(e.name,e.id));
const want = process.argv.slice(2);
want.forEach(w=>{ const hits=[...names.keys()].filter(k=>k.toLowerCase()===w.toLowerCase()); console.log(w, '=>', hits.map(h=>names.get(h).join(',')).join(';')||'serbest'); });
console.log('toplam ad', names.size);
