/* F1–F4 denetimi: her alıştırmanın çözümü kendi şartlarını geçer; ALL↔ALLSELECTED, HASONEVALUE↔ISINSCOPE mutasyonları yakalanır;
   ipucu çözümü ele vermez; sorgularda sütun sırası sonuç değiştirmez, ad eksikse yakalanır. */
global.window = global; const P = (require('path').resolve(__dirname, '../app') + '/'); const fs = require('fs');
const files = fs.readFileSync(P + 'index.html', 'utf8').match(/src="[^"]+"/g).map(s => s.slice(5, -1));
for (const f of files) { if (/^(app|pq|practice|examui|arena|guides|career|sync|portfolio|vdata|pages)\.js$/.test(f)) continue; require(P + f); }
const X = PBI_DAX, CHK = PBI_CHECK; const base = {}; PBI_MEASURES.forEach(m => base[m.name] = { name: m.name, expr: m.expr });
const ms = ex => { const o = {}; for (const k in base) if (k !== ex) o[k] = base[k]; return o; };
const DEF = [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }];
const close = (a, b) => { const bl = v => v === null || v === undefined || (typeof v === 'number' && isNaN(v)); if (bl(a) && bl(b)) return true; if (bl(a) || bl(b)) return false; if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)); if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime(); return String(a) === String(b); };
function grid(m, expr, g, nt, sl) { const out = []; sl = sl || []; if (!nt) out.push([['T', X.evalMeasure(m, expr, sl)]]); g.forEach(col => { const r = X.query({ rows: [col], measures: m, values: [expr], slicers: sl, totals: false, keepBlank: true }); out.push(r.rows.map(x => [X.keyOf(x.keys[0]), x.vals[0]])); }); return out; }
function same(m, a, b, g, nt, sl) { try { const A = grid(m, a, g, nt, sl), B = grid(m, b, g, nt, sl); return A.every((G, i) => G.every(([k, v]) => { const y = B[i].find(z => z[0] === k); return y && close(v, y[1]); })); } catch (e) { return false; } }
let bad = 0; const fail = s => { bad++; console.log('SORUN ' + s); };
const stat = { dax: 0, query: 0, must: 0, hiddenEx: 0, mutTotal: 0, mutCaught: 0, hintReveal: 0, hintTot: 0 };
const MUT = [[/\bALLSELECTED\s*\(/g, 'ALL('], [/\bALL\s*\(/g, 'ALLSELECTED('], [/\bHASONEVALUE\s*\(/g, 'ISINSCOPE('], [/\bISINSCOPE\s*\(/g, 'HASONEVALUE(']];
const uncaught = [];
for (const l of PBI_LESSONS) (l.ex || []).forEach((e, i) => {
  if (e.t !== 'dax' && e.t !== 'query') return; const key = l.id + '#' + i; stat[e.t]++;
  if (CHK.techIssue(e, key, e.sol)) fail(key + ' çözüm kendi teknik şartını geçmiyor: ' + CHK.techIssue(e, key, e.sol));
  const tq = CHK.techOf(e, key); if (tq.must.length || tq.not.length) stat.must++;
  if (e.hint) { stat.hintTot++; if (CHK.revealsSol(CHK.cleanHint(e), e.sol)) { stat.hintReveal++; fail(key + ' ipucu çözümü içeriyor'); } }
  if (e.t === 'query') { try { const r = X.runQuery(ms(), e.sol); const c = CHK.compareQuery(r, r, e, e.sol); if (!c.ok) fail(key + ' sorgu kendisiyle eşleşmedi: ' + c.msg); const rev = { cols: r.cols.slice().reverse(), rows: r.rows.map(x => x.slice().reverse()) }; const c2 = CHK.compareQuery(rev, r, e, e.sol); if (!c2.ok && r.cols.length > 1) fail(key + ' sütun sırası değişince geçmedi: ' + c2.msg); } catch (x) { fail(key + ' sorgu hata ' + x.message); } return; }
  const hid = CHK.autoHidden(e); if (hid.length) stat.hiddenEx++; const g = e.grid || DEF, m = ms(e.name);
  hid.forEach(h => { try { grid(m, e.sol, h.grid || g, false, h.slicers); } catch (x) { fail(key + ' gizli test çözümde hata: ' + x.message); } });
  MUT.forEach(([re, to]) => { if (!re.test(e.sol)) return; re.lastIndex = 0; const mut = e.sol.replace(re, to); if (mut === e.sol) return; stat.mutTotal++;
    let caught = false; try { if (!same(m, e.sol, mut, g, e.noTotal)) caught = true; else for (const h of hid.concat(e.hidden || [])) if (!same(m, e.sol, mut, h.grid || g, h.noTotal, h.slicers)) { caught = true; break; } } catch (x) { caught = true; }
    if (caught) stat.mutCaught++; else uncaught.push(key + ' ' + String(to)); });
});
/* ad denetimi */
{ const e = { t: 'query', q: 'İki sütun: “Ham” ve “Bağlamlı”.', sol: 'EVALUATE ROW("Ham", 1, "Bağlamlı", 2)' }; const ref = X.runQuery({}, e.sol), m1 = X.runQuery({}, 'EVALUATE ROW("X", 1, "Y", 2)'), m2 = X.runQuery({}, 'EVALUATE ROW("Bağlamlı", 2, "Ham", 1)'); if (CHK.compareQuery(m1, ref, e, '').ok) fail('yanlış adlı sütun geçti'); if (!CHK.compareQuery(m2, ref, e, '').ok) fail('sırası değişen sütun geçmedi'); }
console.log('MUTASYON', stat.mutCaught + '/' + stat.mutTotal, 'yakalandı; gizli testli alıştırma', stat.hiddenEx, '; teknik şartlı', stat.must, '; ipucu', stat.hintTot, 'içeren', stat.hintReveal);
if (uncaught.length) console.log('YAKALANMAYAN', uncaught.join(' | '));
console.log('dax ' + stat.dax + ' query ' + stat.query + ' SORUN ' + bad);
