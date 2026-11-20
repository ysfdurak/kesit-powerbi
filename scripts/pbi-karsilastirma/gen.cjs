// Kesit Power BI benzetim motoru <-> gerçek Power BI karşılaştırma paketi üretir.
// Çıktı: out/model.tmdl (TMDL görünümüne yapıştırılacak), out/beklenen.json, out/kontrol.py
const fs = require('node:fs'), vm = require('node:vm'), zlib = require('node:zlib'), path = require('node:path');
const ROOT = process.argv[2] || '/home/claude/kesit-powerbi';
const OUT = process.argv[3] || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
global.window = global;
const skip = f => /^(app|pq|practice|examui|arena|guides|career|sync|portfolio|vdata|pages)\.js$/.test(f);
const b = fs.readFileSync(ROOT + '/kesit.js', 'utf8').split(/\/\* ===== ([^\n]+) ===== \*\//);
for (let i = 1; i < b.length; i += 2) if (!skip(b[i])) vm.runInThisContext(b[i + 1], { filename: b[i] });

const M = PBI_MODEL;
const DEFAULT_GRID = [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }];
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const isDate = v => v instanceof Date;
const iso = d => d.toISOString().slice(0, 10);

// ---------- sütun tipleri
function colType(rows, c) {
  let t = null;
  for (const r of rows) {
    const v = r[c];
    if (v === null || v === undefined || v === '') continue;
    const k = isDate(v) ? 'date' : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'dbl') : 'str';
    if (t === null) t = k;
    else if (t !== k) {
      if ((t === 'int' && k === 'dbl') || (t === 'dbl' && k === 'int')) t = 'dbl';
      else t = 'str';
    }
  }
  return t || 'str';
}
const TMDL = { int: 'int64', dbl: 'double', date: 'dateTime', str: 'string' };
const MT = { int: 'Int64.Type', dbl: 'type number', date: 'type date', str: 'type text' };
function csvCell(v) {
  if (v === null || v === undefined) return '';
  if (isDate(v)) return iso(v);
  if (typeof v === 'number') return String(v);
  const s = String(v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// ---------- model betiği
let t = 'createOrReplace\n\n';
const ind = (n, s) => '\t'.repeat(n) + s + '\n';
const tableNames = Object.keys(M.tables);
for (const [name, tb] of Object.entries(M.tables)) {
  const types = Object.fromEntries(tb.cols.map(c => [c, colType(tb.rows, c)]));
  t += ind(1, 'table ' + q(name));
  if (name === 'Tarih') t += ind(2, 'dataCategory: Time');
  t += '\n';
  if (name === 'Satislar') {
    for (const m of PBI_MEASURES) t += measureTmdl(m.name, m.expr);
  }
  for (const c of tb.cols) {
    t += ind(2, 'column ' + q(c));
    t += ind(3, 'dataType: ' + TMDL[types[c]]);
    if (name === 'Tarih' && c === 'Tarih') t += ind(3, 'isKey');
    if (types[c] === 'date') t += ind(3, 'formatString: yyyy-mm-dd');
    t += ind(3, 'summarizeBy: none');
    t += ind(3, 'sourceColumn: ' + c);
    t += '\n';
  }
  const csv = [tb.cols.join(',')].concat(tb.rows.map(r => tb.cols.map(c => csvCell(r[c])).join(','))).join('\n');
  const b64 = zlib.gzipSync(Buffer.from(csv, 'utf8')).toString('base64');
  const typeList = tb.cols.map(c => '{"' + c + '", ' + MT[types[c]] + '}').join(', ');
  t += ind(2, 'partition ' + q(name) + ' = m');
  t += ind(3, 'mode: import');
  t += ind(3, 'source =');
  t += ind(4, 'let');
  t += ind(5, 'Bin = Binary.Decompress(Binary.FromText("' + b64 + '", BinaryEncoding.Base64), Compression.GZip),');
  t += ind(5, 'Src = Csv.Document(Bin, [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),');
  t += ind(5, 'Hdr = Table.PromoteHeaders(Src, [PromoteAllScalars = true]),');
  // Boş CSV hücresi Power BI'da boş metin ("") olarak gelir; ISBLANK doğru çalışsın diye null yapılır.
  t += ind(5, 'Nul = Table.ReplaceValue(Hdr, "", null, Replacer.ReplaceValue, Table.ColumnNames(Hdr)),');
  t += ind(5, 'Typed = Table.TransformColumnTypes(Nul, {' + typeList + '}, "en-US")');
  t += ind(4, 'in');
  t += ind(5, 'Typed');
  t += '\n';
}
function measureTmdl(name, expr) {
  return ind(2, 'measure ' + q(name) + ' = ```') +
    expr.split('\n').map(l => ind(3, l)).join('') + ind(3, '```') + '\n';
}

// alıştırma ölçüleri ayrı tabloda (hesaplanmış tek satırlık tablo)
const exercises = [];
for (const l of PBI_LESSONS) for (const [i, e] of (l.ex || []).entries())
  if (e.t === 'dax' || e.t === 'query') exercises.push({ lesson: l.id, idx: i, e });

t += ind(1, "table '_Test'") + '\n';
let n = 0;
const daxEx = [];
const MUT = process.env.MUT ? require('./mutasyon.cjs') : null;
for (const x of exercises.filter(x => x.e.t === 'dax' && !MUT)) {
  n++;
  const code = 'X' + String(n).padStart(3, '0');
  const expr = PBI_DAX.stripDef(x.e.sol).expr;
  t += measureTmdl(code, expr);
  daxEx.push({ code, ...x, expr });
}
t += ind(2, 'column x') + ind(3, 'dataType: int64') + ind(3, 'isHidden') + ind(3, 'summarizeBy: none') + ind(3, 'sourceColumn: [x]') + '\n';
t += ind(2, "partition '_Test' = calculated") + ind(3, 'mode: import') + ind(3, 'source = ROW("x", 1)') + '\n';

M.rels.forEach((r, i) => {
  t += ind(1, 'relationship rel' + (i + 1));
  if (r.inactive) t += ind(2, 'isActive: false');
  t += ind(2, 'fromColumn: ' + q(r.from) + '.' + q(r.fromCol));
  t += ind(2, 'toColumn: ' + q(r.to) + '.' + q(r.toCol));
  t += '\n';
});
fs.writeFileSync(path.join(OUT, 'model.tmdl'), t);

// ---------- beklenen sonuçlar (benzetim motoru)
const baseAll = {}; PBI_MEASURES.forEach(m => baseAll[m.name] = { name: m.name, expr: m.expr });
const norm = v => v === undefined ? null : (typeof v === 'number' && !Number.isFinite(v)) ? (Number.isNaN(v) ? 'NAN' : v > 0 ? 'INF' : '-INF') : isDate(v) ? 'D:' + iso(v) : (typeof v === 'string' && /^\d{4}-\d\d-\d\dT00:00:00\.000Z$/.test(v)) ? 'D:' + v.slice(0, 10) : v;
const expected = [];
for (const x of daxEx) {
  const ms = { ...baseAll }; if (x.e.name) delete ms[x.e.name];
  const item = { code: x.code, lesson: x.lesson, idx: x.idx, name: x.e.name || '', expr: x.expr, checks: [] };
  try {
    if (!x.e.noTotal) item.checks.push({ kind: 'total', value: norm(PBI_DAX.evalMeasure(ms, x.expr, [])) });
    for (const col of (x.e.grid || DEFAULT_GRID)) {
      const r = PBI_DAX.query({ rows: [col], measures: ms, values: [x.expr], slicers: [], totals: false, keepBlank: true });
      item.checks.push({ kind: 'by', t: col.t, c: col.c, rows: r.rows.map(rr => [norm(rr.keys[0]), norm(rr.vals[0])]) });
    }
  } catch (err) { item.engineError = String(err && err.message || err); }
  expected.push(item);
}
const queries = [];
let qn = 0;
for (const x of exercises.filter(x => x.e.t === 'query' && !MUT)) {
  qn++;
  const code = 'Q' + String(qn).padStart(3, '0');
  const ms = { ...baseAll };
  const item = { code, lesson: x.lesson, idx: x.idx, sol: x.e.sol };
  try { const r = PBI_DAX.runQuery(ms, x.e.sol); item.cols = r.cols; item.rows = r.rows.map(rr => rr.map(norm)); }
  catch (err) { item.engineError = String(err && err.message || err); }
  queries.push(item);
}

// ---------- 2. tur: ders örnekleri, püf noktaları, Pratik, Arena, mülakat, kalıplar, karıştırılanlar, hata kataloğu, hazır ölçüler
// Bu ölçüler modele eklenmez; kontrol.py her birini DEFINE MEASURE ile sorguda tanımlar.
const parseCol = s => { if (typeof s !== 'string') return s; const m = s.match(/^'?([^'\[]+)'?\[([^\]]+)\]$/); return m ? { t: m[1], c: m[2] } : null; };
const toSl = arr => (arr || []).map(x => Array.isArray(x) ? { t: x[0], c: x[1], values: x[2] } : x);
const slOut = sl => sl.map(x => ({ t: x.t, c: x.c, values: x.values.map(norm) }));
const extra = [], counters = {};
// 5. tur (MUT=1): her çözümün yerine öğrenci hatası/farklı yazım varyantları (en çok MUTN tanesi, kurallar dengeli dağıtılır)
const MUTN = +(process.env.MUTN || 3), used = {};
function pickVariants(expr) {
  const CAP = +(process.env.MUTCAP || 120); const vs = MUT.variants(expr).filter(([lab]) => (used[lab] || 0) < (lab === 'parantez eksik' ? 25 : CAP));
  vs.sort((x, y) => (used[x[0]] || 0) - (used[y[0]] || 0));
  const out = vs.slice(0, MUTN); out.forEach(([lab]) => { used[lab] = (used[lab] || 0) + 1; }); return out;
}
function addM(prefix, origin, defs, expr, grids, noTotal, sl, exclude, inModel) {
  if (MUT && !addM.inner) {
    addM.inner = true;
    try {
      const named = expr.match(/^\[([^\]]+)\]$/); const host = named && defs.find(d => d.name === named[1]);
      const base = host ? host.expr : expr;
      for (const [lab, v] of pickVariants(base)) {
        if (host) addM(prefix, origin + ' ~ ' + lab, defs.map(d => (d === host ? { name: d.name, expr: v } : d)), expr, grids, noTotal, sl, exclude, false);
        else addM(prefix, origin + ' ~ ' + lab, inModel ? [] : defs, v, grids, noTotal, sl, exclude, false);
      }
    } finally { addM.inner = false; }
    return;
  }
  counters[prefix] = (counters[prefix] || 0) + 1;
  const code = prefix + String(counters[prefix]).padStart(3, '0');
  const ms = { ...baseAll }; if (exclude) delete ms[exclude];
  defs.forEach(d => { ms[d.name] = { name: d.name, expr: d.expr }; });
  sl = toSl(sl);
  const dd = new Map(); defs.forEach(d => dd.set(d.name, d)); defs = [...dd.values()];
  const env = /\b(TODAY|NOW|UTCNOW|UTCTODAY|USERPRINCIPALNAME|USERNAME|USEROBJECTID)\s*\(/i.test(expr + defs.map(d => d.expr).join(' '));
  const item = { code, lesson: origin, idx: '', name: '', env: env || undefined, expr, defs: inModel ? undefined : defs, inModel: inModel || undefined, checks: [] };
  try {
    if (!noTotal) item.checks.push({ kind: 'total', sl: slOut(sl), value: norm(PBI_DAX.evalMeasure(ms, expr, sl)) });
    for (const col of grids.map(parseCol).filter(Boolean)) {
      const r = PBI_DAX.query({ rows: [col], measures: ms, values: [expr], slicers: sl, totals: false, keepBlank: true });
      item.checks.push({ kind: 'by', t: col.t, c: col.c, sl: slOut(sl), rows: r.rows.map(rr => [norm(rr.keys[0]), norm(rr.vals[0])]) });
    }
  } catch (err) { item.engineError = String(err && err.message || err); }
  extra.push(item);
}
const extraQ = [];
function addQ(prefix, origin, sol) {
  if (MUT && !addQ.inner) { addQ.inner = true; try { for (const [lab, v] of pickVariants(sol)) addQ(prefix, origin + ' ~ ' + lab, v); } finally { addQ.inner = false; } return; }
  counters[prefix] = (counters[prefix] || 0) + 1;
  const code = prefix + String(counters[prefix]).padStart(3, '0');
  const item = { code, lesson: origin, idx: '', sol };
  try { const r = PBI_DAX.runQuery({ ...baseAll }, sol); item.cols = r.cols; item.rows = r.rows.map(rr => rr.map(norm)); }
  catch (err) { item.engineError = String(err && err.message || err); }
  extraQ.push(item);
}
// hazır ölçüler (modelde var)
for (const m of PBI_MEASURES) addM('B', 'hazır ölçü', [], '[' + m.name + ']', DEFAULT_GRID, false, [], null, true);
// ders içi DAX blokları ve püf noktaları (snip.js ile aynı ayrıştırma)
function splitDefs(src) {
  const lines = src.split('\n'); const out = []; let cur = null;
  lines.forEach(line => { const m = line.match(/^([^\s\-\/=()\[\]"'{},<>][^=()\[\]"{},<>]*?(?:\s\([^()=\[\]]*\))?)\s*:?=(?!=)\s*(.*)$/); if (m && !/^(VAR|RETURN)\b/i.test(m[1].trim())) { cur = { name: m[1].trim(), expr: m[2] }; out.push(cur); } else if (cur) cur.expr += '\n' + line; else { cur = { name: null, expr: line }; out.push(cur); } });
  return out.map(d => ({ name: d.name, expr: d.expr.replace(/^\s*\n/, '').replace(/\s+$/, '') })).filter(d => d.expr.trim() && !/^--/.test(d.expr.trim()));
}
const dec = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const TABLE_FN = /^(CALENDAR|CALENDARAUTO|ADDCOLUMNS|SELECTCOLUMNS|SUMMARIZE|SUMMARIZECOLUMNS|DATATABLE|GENERATESERIES|FILTER|VALUES|DISTINCT|ALL|TOPN|UNION|CROSSJOIN|GENERATE|NATURALINNERJOIN|NATURALLEFTOUTERJOIN|TREATAS|EXCEPT|INTERSECT|ROW|GROUPBY|CALCULATETABLE)\s*\(|^\{/i;
function snippet(origin, raw) {
  const src = dec(raw).trim();
  if (/\bEVALUATE\b/i.test(src)) return addQ('SQ', origin, src);
  const d = PBI_DAX.stripDef(src);
  if (TABLE_FN.test(d.expr.trim()) && splitDefs(src).length <= 1) return addQ('SQ', origin, 'EVALUATE\n' + d.expr.trim());
  const defs = splitDefs(src); const last = defs[defs.length - 1]; if (!last) return;
  const named = defs.slice(0, -1).filter(x => x.name);
  if (last.name) named.push(last);
  addM('S', origin, named, last.name ? '[' + last.name + ']' : last.expr, DEFAULT_GRID, false, []);
}
PBI_LESSONS.forEach(l => { const re = /<pre class="dax"(?![^>]*data-notry)[^>]*>([\s\S]*?)<\/pre>/g; let m; while ((m = re.exec(l.body || ''))) snippet('ders ' + l.id, m[1]); });
PBI_TRICKS.forEach(tk => { if (tk.dax && !tk.noTry) snippet('püf ' + tk.id, tk.dax); });
// Pratik, mülakat
const task = (prefix, origin, e) => {
  if (e.t === 'query') return addQ(prefix + 'Q', origin, e.sol);
  if (e.t && e.t !== 'dax') return;
  addM(prefix, origin, [], PBI_DAX.stripDef(e.sol).expr, e.grid || DEFAULT_GRID, e.noTotal, e.slicers || [], e.name);
};
if (MUT) for (const x of exercises) { if (x.e.t === 'query') addQ('XQ', 'ders ' + x.lesson + '#' + x.idx, x.e.sol); else addM('X', 'ders ' + x.lesson + '#' + x.idx, [], PBI_DAX.stripDef(x.e.sol).expr, x.e.grid || DEFAULT_GRID, x.e.noTotal, x.e.slicers || [], x.e.name); }
PBI_PRACTICE.forEach(e => task('P', 'pratik ' + e.id, e));
PBI_CODEPOOL.concat(PBI_INTERVIEW).forEach(e => task('M', 'mülakat ' + e.id, e));
// Arena: meydan okumalar (görünen + gizli ızgaralar), bulmaca, tahmin, dedektif
PBI_AR_CH.forEach(e => { if (e.t && e.t !== 'dax') return; task('A', 'arena ' + e.id, e); (e.hidden || []).forEach((h, i) => addM('A', 'arena gizli ' + e.id + '#' + i, [], PBI_DAX.stripDef(e.sol).expr, h.grid || e.grid || DEFAULT_GRID, h.noTotal !== undefined ? h.noTotal : e.noTotal, h.slicers || [], e.name)); });
PBI_AR_PZ.forEach(e => addM('A', 'bulmaca ' + e.id, [], e.lines.join('\n'), e.grid || DEFAULT_GRID, e.noTotal, [], null));
PBI_AR_PRED.forEach(e => addM('A', 'tahmin ' + e.id, [], e.expr, [], false, e.ctx, null));
PBI_AR_DET.forEach(d => d.steps.forEach((s, i) => task('D', 'dedektif ' + d.id + '#' + i, s)));
// kalıplar, karıştırılanlar demoları, hata kataloğu görevleri
PBI_PATTERNS.forEach(p => addM('K', 'kalıp ' + p.id, [], p.expr, [p.axis].concat(p.axis2 ? [p.axis2] : []), false, p.slicers || [], null));
PBI_CONFUSED.filter(c => c.demo).forEach(c => c.demo.rows.forEach(([lab, ex], i) => addM('C', 'karıştırılan ' + c.id + '#' + i, [], ex, [c.demo.grid], c.demo.noTotal, [], null)));
PBI_MISTAKES.filter(m => m.task).forEach(m => addM('H', 'hata ' + m.id, [], PBI_DAX.stripDef(m.task.sol).expr, m.task.grid || DEFAULT_GRID, m.task.noTotal, [], m.task.name));
expected.push(...extra); queries.push(...extraQ);
fs.writeFileSync(path.join(OUT, 'beklenen.json'), JSON.stringify({ measures: expected, queries }, null, 0));
if (MUT) console.error(JSON.stringify(used));
console.log(JSON.stringify({
  tables: tableNames.length, rels: M.rels.length, baseMeasures: PBI_MEASURES.length,
  daxExercises: daxEx.length, queries: queries.length, extra: counters,
  engineErrors: expected.filter(e => e.engineError).length + queries.filter(e => e.engineError).length,
  tmdlKB: Math.round(t.length / 1024)
}));
