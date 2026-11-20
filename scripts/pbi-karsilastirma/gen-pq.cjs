// Power Query (M) karşılaştırması: node gen-pq.cjs <çıktı klasörü> "<PC'deki klasör>"
// Her M ifadesi (mcode çözümleri, Lab pq çözümleri ve Lab komut senaryolarının ürettiği M, derslerdeki çalıştırılabilir M blokları)
// Power BI'da ayrı bir tabloya yüklenir; sonuç (satır, sütun, tür etiketli değer) uzun biçimde karşılaştırılır.
const fs = require('fs'), path = require('path');
const [, , OUT, PCDIR] = process.argv;
const APP = path.resolve(__dirname, '../../app') + '/';
global.window = global; global.document = undefined;
require(APP + 'mengine.js');
const html = fs.readFileSync(APP + 'index.html', 'utf8');
const UI = ['app', 'pq', 'practice', 'examui', 'arena', 'guides', 'career', 'sync', 'portfolio', 'vdata', 'pages', 'mengine'];
for (const m of html.matchAll(/src="([^"]+)\.js"/g)) { if (UI.includes(m[1])) continue; try { require(APP + m[1] + '.js'); } catch (e) {} }
const M = window.PBI_M, Q = window.PBI_PQ;
const S = (op, cols, x) => Object.assign({ op, cols: cols || [] }, x || {});
const v2 = fs.readFileSync(path.join(__dirname, '../../tests/mval2.js'), 'utf8');
const SC = eval(v2.slice(v2.indexOf('const SC = [') + 'const SC = '.length, v2.indexOf('\n  ];', v2.indexOf('const SC = [')) + 4));
fs.mkdirSync(path.join(OUT, 'Veri', 'Satis'), { recursive: true });
M.FILES.forEach(f => fs.writeFileSync(path.join(OUT, 'Veri', 'Satis', f.name), f.text));
const PCV = PCDIR.replace(/\\?$/, '\\') + 'Veri\\';
const fixPath = c => c.replace(/C:\\\\Veri\\\\/g, PCV.replace(/\\/g, '\\\\')).replace(/C:\\Veri\\/g, PCV);
// --- M değişmezleri
const mstr = s => '"' + String(s).replace(/"/g, '""').replace(/#\(/g, '#(#)(').replace(/\r/g, '#(cr)').replace(/\n/g, '#(lf)').replace(/\t/g, '#(tab)') + '"';
function mlit(v) {
  if (v === null || v === undefined) return 'null';
  if (Q.isErr && Q.isErr(v)) return 'error "Hata"';
  if (M.isErrCell(v)) return 'error "Hata"';
  if (typeof v === 'number') return Number.isNaN(v) ? '#nan' : v === Infinity ? '#infinity' : v === -Infinity ? '-#infinity' : String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return mstr(v);
  if (v instanceof Date) { const p = [v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate()]; return (v.getUTCHours() || v.getUTCMinutes() || v.getUTCSeconds() || v.mk === 'datetime') ? '#datetime(' + p.concat([v.getUTCHours(), v.getUTCMinutes(), v.getUTCSeconds()]).join(', ') + ')' : '#date(' + p.join(', ') + ')'; }
  throw new Error('değişmez yok: ' + v);
}
const MT = { text: 'text', number: 'number', int: 'Int64.Type', date: 'date', datetime: 'datetime', currency: 'Currency.Type', percentage: 'Percentage.Type', logical: 'logical', any: 'any' };
const tlit = t => '#table(type table [' + t.cols.map(c => '#' + mstr(c.name) + ' = ' + (MT[c.type] || 'any')).join(', ') + '], {' + t.rows.map(r => '{' + r.map(mlit).join(', ') + '}').join(', ') + '})';
// --- beklenen: tür etiketli uzun biçim
const nf = x => (Number.isNaN(x) ? 'NaN' : x === Infinity ? 'Infinity' : x === -Infinity ? '-Infinity' : String(x));
const p2 = n => String(n).padStart(2, '0');
function tag(v, colType) {
  if (v === null || v === undefined) return 'null';
  if (M.isErrCell(v) || (Q.isErr && Q.isErr(v))) return 't:#HATA';
  if (typeof v === 'number') return 'n:' + nf(v);
  if (typeof v === 'string') return 't:' + v;
  if (typeof v === 'boolean') return 'b:' + v;
  if (v instanceof Date) { const d = v.getUTCFullYear() + '-' + p2(v.getUTCMonth() + 1) + '-' + p2(v.getUTCDate()); return (v.mk === 'datetime' || colType === 'datetime') ? 'dt:' + d + ' ' + p2(v.getUTCHours()) + ':' + p2(v.getUTCMinutes()) + ':' + p2(v.getUTCSeconds()) : 'd:' + d; }
  if (v instanceof M.MDuration) return 'du:' + nf(v.ms / 1000);
  if (M.isTable(v)) return '[Table]';
  if (Array.isArray(v)) return '[List]';
  if (v instanceof M.MRecord) return '[Record]';
  if (v instanceof M.MFunc) return '[Function]';
  if (v instanceof M.MBinary) return '[Binary]';
  return '[?]';
}
function canon(v, err) {
  let names, rows, types;
  if (err) { names = ['HATA']; rows = [[err]]; types = ['text']; }
  else if (M.isTable(v)) { names = v.cols.map(c => c.name); rows = v.rows; types = v.cols.map(c => c.type); }
  else if (Array.isArray(v)) { names = ['Value']; rows = v.map(x => [x]); types = ['any']; }
  else if (v instanceof M.MRecord) { names = ['Name', 'Value']; rows = v.names.map(n => [n, M.recGet(v, n)]); types = ['text', 'any']; }
  else { names = ['Value']; rows = [[v]]; types = ['any']; }
  const out = names.map((n, j) => [0, j, n]);
  rows.forEach((r, i) => r.forEach((c, j) => out.push([i + 1, j, typeof c === 'string' && err ? 't:' + c : tag(c, types[j])])));
  return out;
}
// --- PBI tarafı sarmalayıcı
const WRAP = code => `let
    Fmt = (v) => if v is null then "null" else if v is number then "n:" & Number.ToText(v, "R", "en-US") else if v is text then "x:" & Binary.ToText(Text.ToBinary(v, TextEncoding.Utf8), BinaryEncoding.Hex) else if v is datetime then "dt:" & DateTime.ToText(v, "yyyy-MM-dd HH:mm:ss") else if v is date then "d:" & Date.ToText(v, "yyyy-MM-dd") else if v is logical then "b:" & (if v then "true" else "false") else if v is duration then "du:" & Number.ToText(Duration.TotalSeconds(v), "R", "en-US") else if v is table then "[Table]" else if v is list then "[List]" else if v is record then "[Record]" else if v is function then "[Function]" else if v is binary then "[Binary]" else "[?]",
    R = try (let x = (
${code}
    ) in if x is table then Table.Buffer(x) else if x is list then List.Buffer(x) else x),
    V = if R[HasError] then #table({"HATA"}, {{R[Error][Reason]}}) else if R[Value] is table then R[Value] else if R[Value] is list then Table.FromColumns({R[Value]}, {"Value"}) else if R[Value] is record then Record.ToTable(R[Value]) else #table({"Value"}, {{R[Value]}}),
    Names = Table.ColumnNames(V),
    V2 = Table.ReplaceErrorValues(V, List.Transform(Names, each {_, "#HATA"})),
    Rows = Table.ToRows(V2),
    Hdr = List.Transform(List.Positions(Names), (j) => {0, j, Names{j}}) & (if R[HasError] then {{-1, 0, Text.From(R[Error][Message])}} else {}),
    Body = List.Combine(List.Transform(List.Positions(Rows), (i) => List.Transform(List.Positions(Names), (j) => {i + 1, j, Fmt(Rows{i}{j})})))
in
    #table(type table [Satir = Int64.Type, Sutun = Int64.Type, Deger = nullable text], Hdr & Body)`;
// --- maddeler
const items = []; let n = 0;
/* Benzetim yolu (C:\Veri\) PC'deki gerçek klasör yoluyla değiştirilir; Folder Path gibi metin hücreleri de aynı yolu taşısın */
const pathRows = rows => rows.map(r => (typeof r[2] === 'string' && r[2].startsWith('t:') ? [r[0], r[1], 't:' + fixPath(r[2].slice(2))] : r));
function add(origin, code, expected, err) { const id = 'PQ' + String(++n).padStart(3, '0'); items.push({ code: id, lesson: origin, m: code, rows: pathRows(canon(expected, err)), unordered: /Join\(/.test(code) || undefined, envDates: /Folder\.Files/.test(code) || undefined }); }
function addM(origin, code) {
  const r = M.run(code);
  if (!r.ok && r.kind !== 'runtime') return; // desteklenmeyen/sözdizimi: karşılaştırılmaz
  add(origin, fixPath(code), r.ok ? r.value : null, r.ok ? null : r.reason);
}
const dec = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const allEx = [];
PBI_LESSONS.forEach(l => (l.ex || []).forEach((e, i) => allEx.push(['ders ' + l.id + '#' + i, e])));
(window.PBI_PRACTICE || []).forEach(e => allEx.push(['pratik ' + e.id, e]));
(window.PBI_CODEPOOL || []).concat(window.PBI_INTERVIEW || []).forEach(e => allEx.push(['mülakat ' + e.id, e]));
(window.PBI_AR_CH || []).forEach(e => allEx.push(['arena ' + e.id, e]));
allEx.forEach(([w, e]) => {
  if (e.t === 'mcode' && e.sol) addM(w, e.sol);
  if (e.t === 'pq') { const src = Q.SOURCES[e.src], qn = src.qn || M.QN[e.src]; const r = Q.run(src, (e.pre || []).concat(e.sol)); if (r.error) return; add(w + ' (Lab)', Q.mCode({ m: qn }, r.states), r.table); }
});
SC.forEach(([id, steps], i) => { const src = Q.SOURCES[id], qn = src.qn || M.QN[id]; const r = Q.run(src, steps); if (r.error) return; add('Lab senaryo ' + i + ' ' + id + ': ' + steps.map(s => s.op).join(','), Q.mCode({ m: qn }, r.states), r.table); });
PBI_LESSONS.forEach(l => { for (const m of String(l.body || '').matchAll(/<pre class="m"( data-notry)?( data-run)?[^>]*>([\s\S]*?)<\/pre>/g)) if (m[2]) addM('ders bloğu ' + l.id, dec(m[3])); });
// --- yalnız seçilen maddeler (ör. ONLY=PQ001,PQ008): hafif yeniden deneme için
if (process.env.ONLY) { const keep = new Set(process.env.ONLY.split(',')); items.splice(0, items.length, ...items.filter(i => keep.has(i.code))); }
// --- TMDL
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const ind = (k, s) => '\t'.repeat(k) + s + '\n';
let t = 'createOrReplace\n\n';
const qnames = M.QUERY_NAMES();
const srcTables = {}; Object.keys(Q.SOURCES).forEach(k => { const s = Q.SOURCES[k]; const nm = s.qn || M.QN[k]; if (nm) srcTables[nm] = s.table; });
qnames.forEach(nm => { if (!srcTables[nm]) return; t += ind(1, 'expression ' + q(nm) + ' ='); t += ind(3, tlit(srcTables[nm])) + '\n'; });
for (const it of items) {
  t += ind(1, 'table ' + it.code) + '\n';
  t += ind(2, 'column Satir') + ind(3, 'dataType: int64') + ind(3, 'summarizeBy: none') + ind(3, 'sourceColumn: Satir') + '\n';
  t += ind(2, 'column Sutun') + ind(3, 'dataType: int64') + ind(3, 'summarizeBy: none') + ind(3, 'sourceColumn: Sutun') + '\n';
  t += ind(2, 'column Deger') + ind(3, 'dataType: string') + ind(3, 'summarizeBy: none') + ind(3, 'sourceColumn: Deger') + '\n';
  t += ind(2, 'partition ' + it.code + ' = m') + ind(3, 'mode: import') + ind(3, 'source =');
  t += WRAP(it.m).split('\n').map(l => ind(4, l)).join('') + '\n';
}
fs.writeFileSync(path.join(OUT, 'model.tmdl'), t);
fs.writeFileSync(path.join(OUT, 'beklenen.json'), JSON.stringify({ pq: items.map(i => ({ code: i.code, lesson: i.lesson, m: i.m, rows: i.rows, unordered: i.unordered, envDates: i.envDates })) }));
const c = {}; items.forEach(i => { const k = i.lesson.split(' ')[0]; c[k] = (c[k] || 0) + 1; });
console.log(JSON.stringify({ items: items.length, by: c, sources: Object.keys(srcTables), tmdlKB: Math.round(t.length / 1024) }));
