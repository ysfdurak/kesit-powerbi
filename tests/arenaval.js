global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep',...['c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','c24','c25','c26','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3'].filter(x=>require('fs').existsSync(P+x+'.js')),'pqdata','extra','mcfix','bank','exams','arenadata']) require(P + f + '.js');
global.PBIViz = null; require(P + 'viz.js'); const V = window.PBIViz;
const X = PBI_DAX; const base = {}; PBI_MEASURES.forEach(m => base[m.name] = { name: m.name, expr: m.expr });
const ms = ex => { const o = {}; for (const k in base) if (k !== ex) o[k] = base[k]; return o; };
const kk = v => v === null || v === undefined ? '∅' : typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v instanceof Date ? v.getTime() : String(v);
const norm = s => String(s).replace(/\s+/g, '');
const known = new Set([].concat(PBI_LESSONS.flatMap(l => (l.ex || []).filter(e => e.t === 'dax').map(e => norm(e.sol))), PBI_PRACTICE.filter(e => e.t === 'dax').map(e => norm(e.sol)), PBI_CODEPOOL.concat(PBI_INTERVIEW).map(e => norm(e.sol))));
const gridEval = (m, expr, grid, noTotal, sl) => { const out = []; sl = sl || []; if (!noTotal) out.push(X.evalMeasure(m, expr, sl)); grid.forEach(col => X.query({ rows: [col], measures: m, values: [expr], slicers: sl, totals: false, keepBlank: true }).rows.forEach(r => out.push(kk(r.keys[0]) + '=' + kk(r.vals[0])))); return out.map(kk); };
let bad = 0;
console.log('--- meydan okumalar');
const ids = new Set();
for (const e of PBI_AR_CH) {
  if (ids.has(e.id)) { bad++; console.log('DUP', e.id); } ids.add(e.id);
  if (known.has(norm(e.sol))) { bad++; console.log('BAŞKA YERDE VAR', e.id); }
  try {
    const g = e.grid || [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }];
    const v = gridEval(ms(e.name), e.sol, g, e.noTotal); const vals = v.map(x => String(x).split('=').pop()); const u = new Set(vals);
    // sabit cevap ve gizli test ayırt edicilik: görünen ızgarada doğru olan sabit sayı gizli testte yakalanmalı
    const hid = (e.hidden || []).map(h => { const r = gridEval(ms(e.name), e.sol, h.grid || g, h.noTotal !== undefined ? h.noTotal : e.noTotal, h.slicers); return r.filter(x => !/=∅$/.test(x) && x !== '∅').length; });
    const flag = u.size <= 1 ? 'SABİT!' : u.size === 2 ? '(2 değer)' : '';
    if (u.size <= 1 || hid.some(n => n === 0)) { bad++; console.log('SORUN', e.id, flag, 'gizli test dolu hücre:', hid); }
    else console.log(e.id.padEnd(16), e.diff.padEnd(6), String(u.size).padStart(3), 'farklı', flag, 'gizli:', hid.join('/'));
  } catch (er) { bad++; console.log('ERR', e.id, er.message); }
}
console.log('--- tahmin');
for (const p of PBI_AR_PRED) {
  try { const all = [p.expr].concat(p.traps).map(x => X.evalMeasure(ms(), x, p.ctx)); const f = all.map(v => v === null ? '(Boş)' : V.fmt(v, p.fmt === 'adet' ? undefined : p.fmt)); const u = new Set(f);
    if (u.size < 4) { bad++; console.log('AYNI SEÇENEK', p.id, f.join(' | ')); } else console.log(p.id.padEnd(14), f.join(' | ')); }
  catch (er) { bad++; console.log('ERR', p.id, er.message); }
}
console.log('--- bulmaca');
for (const z of PBI_AR_PZ) {
  try { const sol = z.lines.join('\n'); const ref = gridEval(ms(), sol, z.grid, z.noTotal).join('|');
    const tr = z.traps.map((t, i) => { let best = null; for (let j = 0; j < z.lines.length; j++) { const L = z.lines.slice(); L[j] = t; let r; try { r = gridEval(ms(), L.join('\n'), z.grid, z.noTotal).join('|'); } catch (e) { r = 'ERR'; } if (r === ref) best = j; } return best; });
    const same = tr.filter(x => x !== null); if (same.length) { bad++; console.log('TUZAK AYNI SONUÇ', z.id, tr); } else console.log(z.id.padEnd(14), z.lines.length, 'satır, tuzaklar ayırt ediliyor');
  } catch (er) { bad++; console.log('ERR', z.id, er.message); }
}
console.log('--- dedektif');
for (const d of PBI_AR_DET) d.steps.forEach((st, i) => {
  try {
    let res;
    if (st.t === 'query') { const r = X.runQuery(ms(), st.sol); res = r.cols.join('|') + ' :: ' + r.rows.slice(0, 4).map(x => x.map(v => typeof v === 'number' ? Math.round(v * 1000) / 1000 : v).join('/')).join('  '); if (!r.rows.length) { bad++; res = 'BOŞ'; } }
    else { const v = X.evalMeasure(ms(st.name), st.sol, []); res = String(v); if (v === null) bad++; }
    const vals = st.vals.map(([x, f]) => { const v = X.evalMeasure(ms(), x, []); return f === 'metin' ? String(v) : V.fmt(v, f === 'adet' ? undefined : f); });
    let clue = st.clue; vals.forEach((v, j) => clue = clue.split('{' + j + '}').join(v));
    console.log(d.id, i + 1, st.title, '→', res.slice(0, 150)); console.log('     ', clue);
  } catch (er) { bad++; console.log('ERR', d.id, i, er.message); }
});
console.log('ARENA sorun', bad);
