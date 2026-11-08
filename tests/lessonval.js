/* Yeni ders dosyalarını doğrular: node lessonval.js /home/claude/pbi/c9.js [...] */
global.window = global; const P = (require('path').resolve(__dirname, '../app') + '/');
const BASE = ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20'].filter(x => require('fs').existsSync(P + x + '.js'));
BASE.forEach(f => require(P + f + '.js'));
const before = new Set(PBI_LESSONS.map(l => l.id)); const MODS0 = new Set(PBI_LESSONS.map(l => l.mod));
const files = process.argv.slice(2); files.forEach(f => require(require('path').resolve(f)));
require(P + 'mengine.js'); require(P + 'pqdata.js'); require(P + 'extra.js');
const X = PBI_DAX; const base = {}; PBI_MEASURES.forEach(m => base[m.name] = { name: m.name, expr: m.expr });
const ms = ex => { const o = {}; for (const k in base) if (k !== ex) o[k] = base[k]; return o; };
let bad = 0; const err = (...a) => { bad++; console.log('SORUN', ...a); };
const plain = s => String(s).replace(/<[^>]+>/g, '');
const NEW = PBI_LESSONS.filter(l => !before.has(l.id));
const ids = new Set(); PBI_LESSONS.forEach(l => { if (ids.has(l.id)) err('tekrar eden ders id', l.id); ids.add(l.id); });
const dec = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
function splitDefs(src) { const lines = src.split('\n'); const out = []; let cur = null; lines.forEach(line => { const m = line.match(/^([^\s\-\/=()\[\]"'{},<>][^=()\[\]"{},<>]*?(?:\s\([^()=\[\]]*\))?)\s*:?=(?!=)\s*(.*)$/); if (m && !/^(VAR|RETURN)\b/i.test(m[1].trim())) { cur = { name: m[1].trim(), expr: m[2] }; out.push(cur); } else if (cur) cur.expr += '\n' + line; else { cur = { name: null, expr: line }; out.push(cur); } }); return out.map(d => ({ name: d.name, expr: d.expr.replace(/^\s*\n/, '').replace(/\s+$/, '') })).filter(d => d.expr.trim() && !/^--/.test(d.expr.trim())); }
const TABLE_FN = /^(CALENDAR|CALENDARAUTO|ADDCOLUMNS|SELECTCOLUMNS|SUMMARIZE|SUMMARIZECOLUMNS|DATATABLE|GENERATESERIES|FILTER|VALUES|DISTINCT|ALL|TOPN|UNION|CROSSJOIN|GENERATE|NATURALINNERJOIN|NATURALLEFTOUTERJOIN|TREATAS|EXCEPT|INTERSECT|ROW|GROUPBY|CALCULATETABLE)\s*\(|^\{/i;
function snip(where, raw) { const src = dec(raw).trim(); try { if (/\bEVALUATE\b/i.test(src)) { X.runQuery(Object.assign({}, base), src); return; } const d = X.stripDef(src); if (TABLE_FN.test(d.expr.trim()) && splitDefs(src).length <= 1) { X.runQuery(Object.assign({}, base), 'EVALUATE\n' + d.expr.trim()); return; } const m = Object.assign({}, base); const defs = splitDefs(src); defs.slice(0, -1).forEach(x => { if (x.name) m[x.name] = { name: x.name, expr: x.expr }; }); const last = defs[defs.length - 1]; if (!last) return; if (last.name) m[last.name] = { name: last.name, expr: last.expr }; X.evalMeasure(m, last.expr, []); } catch (e) { err('KOD PARÇASI', where, '|', e.message.slice(0, 110), '|', src.split('\n')[0].slice(0, 70)); } }
const len = { n: 0, longest: 0, shortest: 0 };
const counts = {};
NEW.forEach(l => {
  const w = 'DERS ' + l.id;
  if (!['A1','A2','B1','B2','C1','C2'].includes(l.lv)) err(w, 'lv A1..C2 olmalı');
  if (!l.mod) err(w, 'mod yok'); else if (!MODS0.has(l.mod)) console.log('BİLGİ', w, 'yeni modül adı:', l.mod);
  if (!(l.min > 0)) err(w, 'min'); if (!l.title || !l.sum) err(w, 'title/sum');
  if (!l.body || plain(l.body).length < 1500) err(w, 'body kısa (<1500 karakter düz metin)', l.body ? plain(l.body).length : 0);
  if (!/<h2/.test(l.body || '')) err(w, 'body h2 yok');
  if (!PBI_ORDER.includes(l.id)) err(w, 'PBI_ORDER içinde değil');
  const re = /<pre class="dax"(?![^>]*data-notry)[^>]*>([\s\S]*?)<\/pre>/g; let m; while ((m = re.exec(l.body || ''))) snip(w, m[1]);
  const ex = l.ex || []; if (ex.length < 3) err(w, 'en az 3 alıştırma');
  ex.forEach((e, i) => { const we = w + ' ex' + i; counts[e.t] = (counts[e.t] || 0) + 1;
    if (e.t === 'mc') { if (!e.q || !Array.isArray(e.o) || e.o.length < 3 || !(e.a >= 0 && e.a < e.o.length)) return err(we, 'mc şema'); if (!e.why) err(we, 'why yok'); const L = e.o.map(o => plain(o).length), mx = Math.max(...L), mn = Math.min(...L); len.n++; if (L[e.a] === mx && L.filter(x => x === mx).length === 1) len.longest++; if (L[e.a] === mn && L.filter(x => x === mn).length === 1) len.shortest++; }
    else if (e.t === 'dax') { if (!e.name || !e.q || !e.sol || !e.hint) return err(we, 'dax şema (name,q,sol,hint)'); if (base[e.name]) err(we, 'ad hazır ölçüyle çakışıyor', e.name);
      try { const tot = e.noTotal ? null : X.evalMeasure(ms(e.name), e.sol, []); const g = e.grid || [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }]; const cells = g.flatMap(c => X.query({ rows: [c], measures: ms(e.name), values: [e.sol], totals: false, keepBlank: true }).rows.map(r => r.vals[0])); if (cells.every(v => v === null)) err(we, 'tüm hücreler boş'); const u = new Set(cells.map(v => JSON.stringify(v))); if (u.size <= 1 && cells.length > 1) err(we, 'her hücrede aynı değer (kırılım anlamsız ya da sabit)'); } catch (x) { err(we, 'DAX hata', x.message.slice(0, 120)); } }
    else if (e.t === 'query') { if (!e.sol) return err(we, 'query sol'); try { const r = X.runQuery(ms(), e.sol); if (!r.rows.length) err(we, 'sorgu boş'); } catch (x) { err(we, 'sorgu hata', x.message.slice(0, 120)); } }
    else if (e.t === 'mcode') { const r = PBI_M.run(e.sol); if (!r.ok) err(we, 'mcode hata', PBI_M.errorText(r)); }
    else if (e.t === 'pq') { try { const r = PBI_PQ.run(PBI_PQ.exSource(e), e.sol); if (r.error) err(we, 'pq hata', r.error.msg); } catch (x) { err(we, 'pq hata', x.message); } }
    else err(we, 'tip', e.t); });
});
console.log('YENİ DERS', NEW.length, NEW.map(l => l.id + '(' + l.lv + ')').join(' '));
console.log('ALIŞTIRMA', JSON.stringify(counts));
if (len.n) { const pl = Math.round(len.longest / len.n * 100), ps = Math.round(len.shortest / len.n * 100); console.log('ŞIK DENGESİ', len.n, 'mc · doğru=en uzun %' + pl, '· en kısa %' + ps); if (len.n >= 6 && pl > 35) err('ŞIK: doğru şık çok sık en uzun'); if (len.n >= 6 && pl < 15) err('ŞIK: doğru şık neredeyse hiç en uzun değil (en uzun elenerek cevap daralır)'); if (len.n >= 6 && ps < 15) err('ŞIK: doğru şık neredeyse hiç en kısa değil'); }
console.log('SORUN', bad);
