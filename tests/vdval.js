/* Veri seti paketi doğrulayıcı: node vdval.js /home/claude/pbi/vd_<id>.js
   - CSV'lerden (DS/csv/<src>/*.csv) bir anlam modeli kurar (spec.tables, spec.derive, spec.calendar, spec.rels)
   - PBIPatika DAX motorunu bu modelle başlatır
   - spec.measures'ı çalıştırır, spec.tasks'ın DAX/sorgu çözümlerini beklenen değerle karşılaştırır
   - task.sql varsa aynı soruyu SQLite'ta (DS/<src>.sqlite) çalıştırıp beklenen değerle karşılaştırır (bağımsız doğrulama) */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const DS = '/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/ds';
const file = path.resolve(process.argv[2]);
global.window = global; window.PBI_DATASETS = [];
require(file);
const spec = window.PBI_DATASETS[window.PBI_DATASETS.length - 1];
let bad = 0; const err = (...a) => { bad++; console.log('SORUN', ...a); };
const ok = (...a) => console.log('OK', ...a);
if (!spec) { console.log('SORUN spec yok'); process.exit(1); }
const need = ['id', 'name', 'src', 'story', 'tables', 'rels', 'measures', 'tasks', 'dashboard', 'prep'];
need.forEach(k => { if (!spec[k]) err('alan eksik', k); });

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
require('/home/claude/pbi/dax.js');
const X = global.PBI_DAX; const ms = {};
const near = (a, b, tol) => { if (a == null || b == null) return a == b; if (typeof a === 'number' && typeof b === 'number') { const t = tol != null ? tol : Math.max(1e-6, Math.abs(b) * 1e-6); return Math.abs(a - b) <= t; } return String(a) === String(b); };
/* Ölçü kütüphanesi */
(spec.measures || []).forEach(m => { if (!m.name || !m.expr || !m.desc) err('ölçü alanı eksik', m.name); ms[m.name] = { name: m.name, expr: m.expr }; });
(spec.measures || []).forEach(m => { try { const v = X.evalMeasure(ms, m.expr, []); if (v == null) console.log('BİLGİ ölçü toplamda boş', m.name); else console.log('ÖLÇÜ', m.name, '=', typeof v === 'number' ? Math.round(v * 1000) / 1000 : v); } catch (e) { err('ölçü hata', m.name, e.message.slice(0, 160)); } });
/* SQLite */
function sqlite(q) { const out = cp.execFileSync('python3', ['-c', 'import sqlite3,json,sys; c=sqlite3.connect(sys.argv[1]); r=c.execute(sys.argv[2]).fetchall(); print(json.dumps(r))', path.join(DS, spec.src + '.sqlite'), q], { encoding: 'utf8', maxBuffer: 64e6 }); return JSON.parse(out); }
/* Görevler */
const lvc = {}; const ids = new Set();
(spec.tasks || []).forEach((t, i) => { const w = 'GÖREV ' + (t.id || i); lvc[t.lv] = (lvc[t.lv] || 0) + 1;
  if (ids.has(t.id)) err(w, 'tekrar id'); ids.add(t.id);
  if (!['temel', 'orta', 'ileri'].includes(t.lv)) err(w, 'lv temel/orta/ileri olmalı');
  if (!t.q || !t.hint) err(w, 'q/hint eksik');
  if (!t.dax && !t.query && !t.steps) err(w, 'dax, query ya da steps gerekli');
  let got;
  try {
    if (t.dax) { const m2 = Object.assign({}, ms); if (t.name) m2[t.name] = { name: t.name, expr: t.dax }; got = X.evalMeasure(m2, t.dax, t.filters || []); }
    else if (t.query) { const r = X.runQuery(ms, t.query); if (!r.rows.length) err(w, 'sorgu boş'); got = r.rows.slice(0, (t.expectRows || []).length || 3); }
  } catch (e) { return err(w, 'DAX hata', e.message.slice(0, 200)); }
  if (t.dax) { if (t.expect === undefined) err(w, 'expect yok'); else if (!near(got, t.expect, t.tol)) err(w, 'DAX sonucu beklenenden farklı', got, '≠', t.expect); }
  if (t.query && t.expectRows) { t.expectRows.forEach((er, k) => { const gr = got[k]; if (!gr) return err(w, 'satır yok', k); er.forEach((v, j) => { if (!near(gr[j], v, t.tol)) err(w, 'sorgu satır', k, 'sütun', j, gr[j], '≠', v); }); }); }
  if (t.sql) { try { const r = sqlite(t.sql); if (t.dax) { const v = r[0] && r[0][0]; if (!near(v, t.expect, t.tol)) err(w, 'SQL sonucu beklenenden farklı', v, '≠', t.expect); } else if (t.expectRows) { t.expectRows.forEach((er, k) => er.forEach((v, j) => { if (!r[k] || !near(r[k][j], v, t.tol)) err(w, 'SQL satır', k, j, r[k] && r[k][j], '≠', v); })); } } catch (e) { err(w, 'SQL hata', String(e.message).slice(0, 200)); } }
  else if (t.dax || t.query) console.log('BİLGİ', w, 'bağımsız SQL denetimi yok');
});
const totalRows = Object.values(tables).reduce((a, t) => a + t.rows.length, 0);
console.log('VERİ', spec.id, Object.keys(tables).length, 'tablo', totalRows, 'satır · ölçü', (spec.measures || []).length, '· görev', (spec.tasks || []).length, JSON.stringify(lvc));
console.log('SORUN', bad);
