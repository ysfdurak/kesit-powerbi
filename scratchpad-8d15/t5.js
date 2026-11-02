globalThis.window = globalThis;
for (const f of ['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7']) require('/home/claude/pbi/'+f+'.js');
const X = PBI_DAX; const base = {}; PBI_MEASURES.forEach(m => base[m.name] = m);
const ms = ex => { const o = {}; for (const k in base) if (k !== ex) o[k] = { name: k, expr: base[k].expr }; return o; };
const ids = new Set(PBI_LESSONS.map(l => l.id));
const missing = PBI_ORDER.filter(i => !ids.has(i)); const extra = [...ids].filter(i => !PBI_ORDER.includes(i));
console.log('lessons', PBI_LESSONS.length, 'missing in content', missing, 'not ordered', extra);
let n = 0, bad = 0, lines = [];
for (const l of PBI_LESSONS) (l.ex||[]).forEach((e,i)=>{
  if (e.t === 'mc') { if (e.a >= e.o.length) { console.log('MC idx', l.id, i); bad++; } return; }
  n++; const t0 = Date.now();
  try {
    if (e.t === 'query') { const r = X.runQuery(ms(), e.sol); if (!r.rows.length) { bad++; console.log('EMPTY', l.id, i); } }
    else { const grid = e.grid || [{t:'Kategoriler',c:'Kategori'},{t:'Tarih',c:'Yil'}]; if (!e.noTotal) X.evalMeasure(ms(e.name), e.sol, []);
      const g = grid.map(c => X.query({rows:[c], measures: ms(e.name), values:[e.sol], totals:false, keepBlank:true}).rows);
      const nonblank = g.flat().filter(r => r.vals[0] !== null && r.vals[0] !== undefined).length;
      if (!nonblank) { bad++; console.log('ALLBLANK', l.id, i, e.name); }
      if (e.start && X.check(e.start) === null && e.start.trim() !== e.sol.trim()) { /* start compiles; fine */ }
    }
    const d = Date.now()-t0; if (d > 800) console.log('SLOW', l.id, i, e.name || '', d + 'ms');
    lines.push(e.sol.split('\n').length);
  } catch (er) { bad++; console.log('ERR', l.id, i, e.name || '', er.message); }
});
const byLv = {}; for (const l of PBI_LESSONS) { const lv = l.lv.length === 2 ? l.lv : PBI_LEVEL_OF[l.id]; (byLv[lv] = byLv[lv] || []).push(...(l.ex||[]).filter(e => e.t !== 'mc').map(e => e.sol.split('\n').length)); }
for (const k of Object.keys(byLv).sort()) { const a = byLv[k]; console.log(k, 'DAX ex', a.length, 'avg lines', (a.reduce((x,y)=>x+y,0)/Math.max(1,a.length)).toFixed(1), 'max', Math.max(0,...a)); }
console.log('dax ex', n, 'bad', bad, 'total ex', PBI_LESSONS.reduce((a,l)=>a+(l.ex||[]).length,0));
