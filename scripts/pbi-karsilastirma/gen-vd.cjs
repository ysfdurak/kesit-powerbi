// Vaka paketi -> Power BI karşılaştırma paketi: node gen-vd.cjs <vd dosya adı: ilgaz|kanat|lezzet|pusula|pedal> <csv kök (csv/<src>/*.csv)> <çıktı klasörü> <PC'deki klasör (Windows yolu)>
const fs = require('fs'), path = require('path');
const [, , VD, DSROOT, OUT, PCDIR] = process.argv;
const APP = path.resolve(__dirname, '../../app');
global.window = global; window.PBI_DATASETS = [];
require(path.join(APP, 'vd_' + VD + '.js'));
const spec = window.PBI_DATASETS[window.PBI_DATASETS.length - 1];
const DS = DSROOT; let bad = 0; const err = (...a) => { bad++; console.log('SORUN', ...a); };
/* CSV okuyucu (tırnaklı alanlar dahil) */
function parseCSV(txt) {
  txt = txt.replace(/^﻿/, ''); const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < txt.length; i++) { const ch = txt[i];
    if (q) { if (ch === '"') { if (txt[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; continue; }
    if (ch === '"') q = true; else if (ch === ',') { row.push(cur); cur = ''; } else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (ch !== '\r') cur += ch; }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
const reD = /^\d{4}-\d{2}-\d{2}$/, reDT = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/, reN = /^-?\d+(\.\d+)?$/;
function loadTable(name) {
  const p = path.join(DS, 'csv', spec.src, name + '.csv'); if (!fs.existsSync(p)) { err('CSV yok', p); return null; }
  const [hdr, ...data] = parseCSV(fs.readFileSync(p, 'utf8')).filter(r => r.length > 1 || r[0] !== '');
  const kinds = hdr.map((c, j) => { const vs = data.map(r => r[j]).filter(v => v !== '' && v != null); if (!vs.length) return 's'; if (vs.every(v => reN.test(v))) return 'n'; if (vs.every(v => reD.test(v))) return 'd'; if (vs.every(v => reDT.test(v))) return 't'; return 's'; });
  const rows = data.map(r => { const o = {}; hdr.forEach((c, j) => { const v = r[j]; if (v === '' || v == null) { o[c] = null; return; } const k = kinds[j]; o[c] = k === 'n' ? +v : k === 'd' ? new Date(v + 'T00:00:00Z') : k === 't' ? new Date(v.replace(' ', 'T') + (v.length === 16 ? ':00' : '') + 'Z') : v; }); return o; });
  return { cols: hdr.slice(), rows, kinds: Object.fromEntries(hdr.map((c, j) => [c, kinds[j]])) };
}
const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'], GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const tables = {};
(spec.tables || []).forEach(t => { const tb = loadTable(t.name); if (tb) tables[t.name] = { rows: tb.rows, cols: tb.cols, kind: t.kind === 'fact' ? 'fact' : 'dim', _kinds: tb.kinds }; if (tb && t.cols) { const names = t.cols.map(c => c[0]); tb.cols.forEach(c => { if (!names.includes(c)) err('tablo', t.name, 'sütun açıklaması eksik', c); }); names.forEach(c => { if (!tb.cols.includes(c)) err('tablo', t.name, 'olmayan sütun açıklanmış', c); }); } });
/* Türetilmiş sütunlar (Power Query'de eklenecek) */
(spec.derive || []).forEach(d => { const tb = tables[d.t]; if (!tb) return err('derive tablo yok', d.t); if (!tb.cols.includes(d.from)) return err('derive kaynak sütun yok', d.t, d.from);
  tb.rows.forEach(r => { const v = r[d.from]; if (v == null) { r[d.c] = null; return; } if (!(v instanceof Date)) { r[d.c] = null; return; }
    r[d.c] = d.fn === 'date' ? new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate())) : d.fn === 'hour' ? v.getUTCHours() : d.fn === 'year' ? v.getUTCFullYear() : d.fn === 'weekday' ? ((v.getUTCDay() + 6) % 7) + 1 : null; });
  tb.cols.push(d.c); });
/* Takvim tablosu */
if (spec.calendar) { const c = spec.calendar, rows = []; for (let t = Date.parse(c.from + 'T00:00:00Z'); t <= Date.parse(c.to + 'T00:00:00Z'); t += 864e5) { const d = new Date(t), y = d.getUTCFullYear(), m = d.getUTCMonth(), wd = (d.getUTCDay() + 6) % 7 + 1;
    rows.push({ Tarih: d, Yil: y, CeyrekNo: Math.floor(m / 3) + 1, Ceyrek: 'Ç' + (Math.floor(m / 3) + 1), AyNo: m + 1, Ay: AY[m], YilAy: y + '-' + String(m + 1).padStart(2, '0'), Gun: d.getUTCDate(), GunNo: wd, HaftaninGunu: GUN[d.getUTCDay()], HaftaSonu: wd >= 6 ? 'Evet' : 'Hayır' }); }
  tables[c.name || 'Takvim'] = { rows, cols: ['Tarih', 'Yil', 'CeyrekNo', 'Ceyrek', 'AyNo', 'Ay', 'YilAy', 'Gun', 'GunNo', 'HaftaninGunu', 'HaftaSonu'], kind: 'dim', dateTable: 'Tarih', sortBy: { Ay: 'AyNo', HaftaninGunu: 'GunNo' } }; }
const rels = (spec.rels || []).map(r => ({ from: r[0], fromCol: r[1], to: r[2], toCol: r[3], inactive: !!(r[4] && r[4].inactive) }));
rels.forEach(r => { const a = tables[r.from], b = tables[r.to]; if (!a || !b) return err('ilişki tablosu yok', JSON.stringify(r)); if (!a.cols.includes(r.fromCol) || !b.cols.includes(r.toCol)) return err('ilişki sütunu yok', JSON.stringify(r));
  const keys = new Set(b.rows.map(x => x[r.toCol] instanceof Date ? x[r.toCol].getTime() : x[r.toCol])); if (keys.size !== b.rows.length) err('ilişkinin bir tarafı benzersiz değil', r.to + '[' + r.toCol + ']');
  const miss = a.rows.filter(x => x[r.fromCol] != null && !keys.has(x[r.fromCol] instanceof Date ? x[r.fromCol].getTime() : x[r.fromCol])).length; if (miss) console.log('BİLGİ', r.from + '[' + r.fromCol + '] →', r.to, 'eşleşmeyen satır', miss); });
global.PBI_MODEL = { tables, rels, notes: {}, colDesc: {} };
require(path.join(APP, 'dax.js'));
const X = global.PBI_DAX;
fs.mkdirSync(path.join(OUT, 'csv'), { recursive: true });
const isDate = v => v instanceof Date;
const iso = d => d.toISOString().slice(0, 10);
function colType(rows, c) {
  let t = null;
  for (const r of rows) { const v = r[c]; if (v === null || v === undefined || v === '') continue;
    const k = isDate(v) ? (v.getUTCHours() || v.getUTCMinutes() || v.getUTCSeconds() ? 'dt' : 'date') : typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'dbl') : typeof v === 'boolean' ? 'bool' : 'str';
    if (t === null) t = k; else if (t !== k) { if ((t === 'int' && k === 'dbl') || (t === 'dbl' && k === 'int')) t = 'dbl'; else if ((t === 'date' && k === 'dt') || (t === 'dt' && k === 'date')) t = 'dt'; else t = 'str'; } }
  return t || 'str';
}
const TMDL = { int: 'int64', dbl: 'double', date: 'dateTime', dt: 'dateTime', str: 'string', bool: 'boolean' };
const MT = { int: 'Int64.Type', dbl: 'type number', date: 'type date', dt: 'type datetime', str: 'type text', bool: 'type logical' };
const cell = v => v === null || v === undefined ? '' : isDate(v) ? (v.getUTCHours() || v.getUTCMinutes() || v.getUTCSeconds() ? v.toISOString().slice(0, 19).replace('T', ' ') : iso(v)) : typeof v === 'number' || typeof v === 'boolean' ? String(v) : (/[",\n\r]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v));
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const ind = (n, s) => '\t'.repeat(n) + s + '\n';
const home = spec.tables.find(t => t.kind === 'fact').name;
let t = 'createOrReplace\n\n';
for (const [name, tb] of Object.entries(tables)) {
  const types = Object.fromEntries(tb.cols.map(c => [c, colType(tb.rows, c)]));
  fs.writeFileSync(path.join(OUT, 'csv', name + '.csv'), [tb.cols.join(',')].concat(tb.rows.map(r => tb.cols.map(c => cell(r[c])).join(','))).join('\n'));
  t += ind(1, 'table ' + q(name)); if (tb.dateTable) t += ind(2, 'dataCategory: Time'); t += '\n';
  if (name === home) spec.measures.forEach(m => { t += ind(2, 'measure ' + q(m.name) + ' = ```') + m.expr.split('\n').map(l => ind(3, l)).join('') + ind(3, '```') + '\n'; });
  for (const c of tb.cols) { t += ind(2, 'column ' + q(c)) + ind(3, 'dataType: ' + TMDL[types[c]]); if (tb.dateTable === c) t += ind(3, 'isKey'); t += ind(3, 'summarizeBy: none') + ind(3, 'sourceColumn: ' + c) + '\n'; }
  if (tb.sortBy) Object.entries(tb.sortBy).forEach(() => {});
  const typeList = tb.cols.map(c => '{"' + c + '", ' + MT[types[c]] + '}').join(', ');
  t += ind(2, 'partition ' + q(name) + ' = m') + ind(3, 'mode: import') + ind(3, 'source =') + ind(4, 'let');
  t += ind(5, 'Src = Csv.Document(File.Contents("' + PCDIR + '\\csv\\' + name + '.csv"), [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),');
  t += ind(5, 'Hdr = Table.PromoteHeaders(Src, [PromoteAllScalars = true]),');
  t += ind(5, 'Nul = Table.ReplaceValue(Hdr, "", null, Replacer.ReplaceValue, Table.ColumnNames(Hdr)),');
  t += ind(5, 'Typed = Table.TransformColumnTypes(Nul, {' + typeList + '}, "en-US")') + ind(4, 'in') + ind(5, 'Typed') + '\n';
}
rels.forEach((r, i) => { t += ind(1, 'relationship rel' + (i + 1)); if (r.inactive) t += ind(2, 'isActive: false'); t += ind(2, 'fromColumn: ' + q(r.from) + '.' + q(r.fromCol)) + ind(2, 'toColumn: ' + q(r.to) + '.' + q(r.toCol)) + '\n'; });
fs.writeFileSync(path.join(OUT, 'model.tmdl'), t);
// beklenen
const ms = {}; spec.measures.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const norm = v => v === undefined ? null : (typeof v === 'number' && !Number.isFinite(v)) ? (Number.isNaN(v) ? 'NAN' : v > 0 ? 'INF' : '-INF') : isDate(v) ? 'D:' + iso(v) : v;
const slOut = sl => (sl || []).map(x => ({ t: x.t, c: x.c, values: x.values.map(norm) }));
const grid = tables.Takvim ? [{ t: 'Takvim', c: 'YilAy' }] : [];
const measures = [], queries = []; let n = 0, qn = 0;
function addM(origin, expr, sl, inModel, extraGrid) {
  const code = 'V' + String(++n).padStart(3, '0'); const item = { code, lesson: origin, idx: '', name: '', home, expr, defs: inModel ? undefined : [], inModel: inModel || undefined, checks: [] };
  try { item.checks.push({ kind: 'total', sl: slOut(sl), value: norm(X.evalMeasure(ms, expr, sl || [])) });
    for (const col of grid.concat(extraGrid || [])) { const r = X.query({ rows: [col], measures: ms, values: [expr], slicers: sl || [], totals: false, keepBlank: true }); item.checks.push({ kind: 'by', t: col.t, c: col.c, sl: slOut(sl), rows: r.rows.map(rr => [norm(rr.keys[0]), norm(rr.vals[0])]) }); }
  } catch (e) { item.engineError = String(e.message || e); }
  measures.push(item);
}
const dimGrid = []; spec.tables.filter(x => x.kind !== 'fact').forEach(x => { const tb = tables[x.name]; if (!tb) return; const c = tb.cols.find(c => colType(tb.rows, c) === 'str' && new Set(tb.rows.map(r => r[c])).size <= 30); if (c && dimGrid.length < 2) dimGrid.push({ t: x.name, c }); });
spec.measures.forEach(m => addM(spec.id + ' ölçü ' + m.name, '[' + m.name + ']', [], true, dimGrid));
spec.tasks.forEach(tk => { if (tk.dax) addM(spec.id + ' görev ' + tk.id, X.stripDef(tk.dax).expr, tk.filters || [], false);
  else if (tk.query) { const code = 'W' + String(++qn).padStart(3, '0'); const item = { code, lesson: spec.id + ' görev ' + tk.id, idx: '', sol: tk.query }; try { const r = X.runQuery(ms, tk.query); item.cols = r.cols; item.rows = r.rows.map(rr => rr.map(norm)); } catch (e) { item.engineError = String(e.message || e); } queries.push(item); } });
fs.writeFileSync(path.join(OUT, 'beklenen.json'), JSON.stringify({ measures, queries }));
console.log(JSON.stringify({ id: spec.id, tables: Object.keys(tables).length, rows: Object.values(tables).reduce((a, x) => a + x.rows.length, 0), measures: measures.length, queries: queries.length, engineErrors: measures.filter(x => x.engineError).length + queries.filter(x => x.engineError).length, dimGrid, tmdlKB: Math.round(t.length / 1024), sorun: bad }));
