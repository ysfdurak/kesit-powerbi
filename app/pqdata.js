/* Kesit Power BI — Power Query Lab: dönüşüm motoru, M kodu üretici, kirli örnek tablolar ve alıştırmalar.
   Motor, Power Query Düzenleyicisi'nin en sık kullanılan komutlarını taklit eder; her adım gerçek M koduna çevrilir. */
(function (W) {
'use strict';
const ERR = msg => ({ pqErr: msg });
const isErr = v => v && typeof v === 'object' && 'pqErr' in v;
const isBlank = v => v === null || v === undefined || v === '';
const D = (y, m, d) => new Date(Date.UTC(y, m - 1, d));

/* ---------- Türler ---------- */
const TYPES = {
  any: { label: 'ABC123', name: 'Herhangi', m: 'type any' },
  text: { label: 'ABC', name: 'Metin', m: 'type text' },
  number: { label: '1.2', name: 'Ondalık sayı', m: 'type number' },
  int: { label: '123', name: 'Tam sayı', m: 'Int64.Type' },
  date: { label: 'Tarih', name: 'Tarih', m: 'type date' }
};
function parseNumTR(s) {
  if (typeof s === 'number') return s;
  const t = String(s).trim(); if (!t) return null;
  if (!/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$/.test(t)) return ERR('DataFormat.Error: “' + t + '” sayıya dönüştürülemedi.');
  return +t.replace(/\./g, '').replace(',', '.');
}
function parseDateTR(s) {
  if (s instanceof Date) return s;
  const t = String(s).trim(); if (!t) return null;
  const ok = (y, mo, d) => { const x = D(y, mo, d); return x.getUTCMonth() === mo - 1 && x.getUTCDate() === d ? x : ERR('DataFormat.Error: “' + t + '” geçerli bir tarih değil.'); };
  let m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/); if (m) return ok(+m[3], +m[2], +m[1]);
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return ok(+m[1], +m[2], +m[3]);
  return ERR('DataFormat.Error: “' + t + '” tarihe dönüştürülemedi.');
}
function convert(v, type) {
  if (isErr(v) || v === null || v === undefined) return v === undefined ? null : v;
  if (type === 'any') return v;
  if (type === 'text') return v instanceof Date ? fmtDate(v) : typeof v === 'number' ? String(v).replace('.', ',') : String(v);
  if (type === 'number') { if (v === '') return null; return parseNumTR(v); }
  if (type === 'int') { if (v === '') return null; const n = parseNumTR(v); return isErr(n) || n === null ? n : Math.round(n); }
  if (type === 'date') { if (v === '') return null; return parseDateTR(v); }
  return v;
}
const pad = n => String(n).padStart(2, '0');
const fmtDate = d => pad(d.getUTCDate()) + '.' + pad(d.getUTCMonth() + 1) + '.' + d.getUTCFullYear();
const keyOf = v => isErr(v) ? '⚠' : v === null || v === undefined ? '∅' : v instanceof Date ? 'd' + v.getTime() : typeof v + ':' + v;
const trUp = s => s.toLocaleUpperCase('tr-TR'), trLo = s => s.toLocaleLowerCase('tr-TR');
const proper = s => trLo(s).replace(/(^|[\s\-'’(])(\S)/g, (m, a, b) => a + trUp(b));

/* ---------- Tablo yardımcıları ---------- */
const clone = t => ({ cols: t.cols.map(c => Object.assign({}, c)), rows: t.rows.map(r => r.slice()) });
function idx(t, name) { const i = t.cols.findIndex(c => c.name === name); if (i < 0) throw ERR('Expression.Error: “' + name + '” sütunu tabloda bulunamadı.'); return i; }
function need(st, n) { if (!st.cols || st.cols.length < (n || 1)) throw ERR('Bu komut için önce sütun başlığına tıklayarak ' + ((n || 1) > 1 ? 'en az ' + n + ' sütun' : 'bir sütun') + ' seç.'); }
function textMap(t, cols, fn, label) {
  const out = clone(t); cols.forEach(c => { const i = idx(out, c); out.rows.forEach(r => { const v = r[i]; if (v === null || isErr(v)) return; if (typeof v !== 'string') { r[i] = ERR('Expression.Error: ' + label + ' yalnızca metne uygulanır; “' + (v instanceof Date ? fmtDate(v) : v) + '” metin değil.'); return; } r[i] = fn(v); }); if (out.cols[i].type === 'any') out.cols[i].type = 'text'; }); return out;
}
function cmp(v, op, x) {
  if (op === 'notnull') return !isBlank(v) && !isErr(v);
  if (op === 'null') return isBlank(v);
  if (isErr(v) || v === null) return false;
  const a = v instanceof Date ? v.getTime() : v, b = x instanceof Date ? x.getTime() : x;
  if (op === 'contains') return String(v).toLocaleLowerCase('tr-TR').includes(String(x).toLocaleLowerCase('tr-TR'));
  if (op === '=') return keyOf(v) === keyOf(x) || (typeof a === 'number' && a === +b);
  if (op === '<>') return !(keyOf(v) === keyOf(x) || (typeof a === 'number' && a === +b));
  if (typeof a !== typeof b && typeof a === 'number') return op === '>' ? a > +b : op === '>=' ? a >= +b : op === '<' ? a < +b : a <= +b;
  return op === '>' ? a > b : op === '>=' ? a >= b : op === '<' ? a < b : a <= b;
}
function parseParam(s, type) {
  if (s === null || s === undefined) return null;
  const t = String(s); if (/^null$/i.test(t.trim())) return null;
  if (type === 'number' || type === 'int') { const n = parseNumTR(t); return isErr(n) ? t : n; }
  if (type === 'date') { const d = parseDateTR(t); return isErr(d) ? t : d; }
  if (type === 'any' && /^-?\d+(,\d+)?$/.test(t.trim())) return t;
  return t;
}

/* ---------- Komutlar ---------- */
const mStr = s => '"' + String(s).replace(/"/g, '""') + '"';
const mList = a => '{' + a.map(mStr).join(', ') + '}';
const mVal = v => v === null ? 'null' : typeof v === 'number' ? String(v) : v instanceof Date ? '#date(' + v.getUTCFullYear() + ', ' + (v.getUTCMonth() + 1) + ', ' + v.getUTCDate() + ')' : mStr(v);
const OPS = {
  removeTop: { name: 'Üst satırları kaldır', group: 'Satırları kaldır', step: 'Kaldırılan Üst Satırlar', form: [{ k: 'n', label: 'Kaç satır?', type: 'num', d: 1 }],
    run: (t, s) => { const out = clone(t); out.rows = out.rows.slice(Math.max(0, +s.n || 0)); return out; },
    m: (p, s) => 'Table.Skip(' + p + ', ' + (+s.n || 0) + ')',
    what: 'Tablonun en üstündeki N satırı siler. Excel dökümlerindeki başlık ve açıklama satırları için.' },
  promote: { name: 'İlk satırı üst bilgi olarak kullan', group: 'Giriş', step: 'Yükseltilen Üst Bilgiler',
    run: t => { if (!t.rows.length) throw ERR('Tablo boş; başlık yapılacak satır yok.'); const out = clone(t); const h = out.rows.shift(); const used = {}; out.cols = out.cols.map((c, i) => { let n = isBlank(h[i]) || isErr(h[i]) ? 'Column' + (i + 1) : String(h[i] instanceof Date ? fmtDate(h[i]) : h[i]).trim(); if (used[n]) n = n + '_' + (++used[n]); else used[n] = 1; return { name: n, type: 'any' }; }); return out; },
    m: p => 'Table.PromoteHeaders(' + p + ', [PromoteAllScalars = true])',
    what: 'İlk veri satırını sütun adları yapar. Sütun türleri ABC123 (herhangi) olur; ardından türleri sen belirlersin.' },
  removeCols: { name: 'Sütunları kaldır', group: 'Giriş', step: 'Kaldırılan Sütunlar', sel: 1,
    run: (t, s) => { const ix = s.cols.map(c => idx(t, c)); const out = { cols: t.cols.filter((c, i) => !ix.includes(i)).map(c => Object.assign({}, c)), rows: t.rows.map(r => r.filter((v, i) => !ix.includes(i))) }; return out; },
    m: (p, s) => 'Table.RemoveColumns(' + p + ', ' + mList(s.cols) + ')',
    what: 'Seçili sütunları siler. Modelde kullanılmayan her sütun dosyayı büyütür; erken kaldır.' },
  keepCols: { name: 'Diğer sütunları kaldır', group: 'Giriş', step: 'Kaldırılan Diğer Sütunlar', sel: 1,
    run: (t, s) => { const ix = s.cols.map(c => idx(t, c)); return { cols: ix.map(i => Object.assign({}, t.cols[i])), rows: t.rows.map(r => ix.map(i => r[i])) }; },
    m: (p, s) => 'Table.SelectColumns(' + p + ', ' + mList(s.cols) + ')',
    what: 'Yalnızca seçili sütunları tutar. Kaynağa yeni sütun eklense bile model değişmez; bu yüzden “Sütunları kaldır”dan daha sağlamdır.' },
  removeBlank: { name: 'Boş satırları kaldır', group: 'Satırları kaldır', step: 'Kaldırılan Boş Satırlar',
    run: t => { const out = clone(t); out.rows = out.rows.filter(r => r.some(v => !isBlank(v))); return out; },
    m: p => 'Table.SelectRows(' + p + ', each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null})))',
    what: 'Tüm hücreleri boş (null ya da "") olan satırları siler.' },
  distinct: { name: 'Yinelenenleri kaldır', group: 'Satırları kaldır', step: 'Kaldırılan Yinelenenler', sel: 0,
    run: (t, s) => { const ix = (s.cols && s.cols.length ? s.cols : t.cols.map(c => c.name)).map(c => idx(t, c)); const seen = new Set(); const out = clone(t); out.rows = out.rows.filter(r => { const k = ix.map(i => keyOf(r[i])).join('␟'); if (seen.has(k)) return false; seen.add(k); return true; }); return out; },
    m: (p, s) => s.cols && s.cols.length ? 'Table.Distinct(' + p + ', ' + mList(s.cols) + ')' : 'Table.Distinct(' + p + ')',
    what: 'Seçili sütunlarda (seçim yoksa tüm satırda) aynı olan satırlardan yalnızca ilkini tutar. Boyut tablosunun anahtarında yineleme ilişkiyi bozar.' },
  removeErrors: { name: 'Hataları kaldır', group: 'Satırları kaldır', step: 'Hatalar Kaldırıldı', sel: 1,
    run: (t, s) => { const ix = s.cols.map(c => idx(t, c)); const out = clone(t); out.rows = out.rows.filter(r => !ix.some(i => isErr(r[i]))); return out; },
    m: (p, s) => 'Table.RemoveRowsWithErrors(' + p + ', ' + mList(s.cols) + ')',
    what: 'Seçili sütunda hata (Error) olan satırları siler. Önce hatanın nedenine bak: veri mi kirli, tür mü yanlış?' },
  filter: { name: 'Satırları filtrele', group: 'Giriş', step: 'Filtrelenen Satırlar', sel: 1, single: true,
    form: [{ k: 'cmp', label: 'Koşul', type: 'sel', o: [['notnull', 'boş değil'], ['=', 'eşittir'], ['<>', 'eşit değil'], ['>', 'büyüktür'], ['>=', 'büyük ya da eşit'], ['<', 'küçüktür'], ['<=', 'küçük ya da eşit'], ['contains', 'içerir'], ['null', 'boş']], d: 'notnull' }, { k: 'v', label: 'Değer', type: 'text', d: '', hideIf: s => s.cmp === 'notnull' || s.cmp === 'null' }],
    run: (t, s) => { const i = idx(t, s.cols[0]); const x = parseParam(s.v, t.cols[i].type); const out = clone(t); out.rows = out.rows.filter(r => cmp(r[i], s.cmp, x)); return out; },
    m: (p, s) => { const c = '[' + s.cols[0] + ']'; const x = mVal(parseParam(s.v, 'any')); const body = s.cmp === 'notnull' ? c + ' <> null and ' + c + ' <> ""' : s.cmp === 'null' ? c + ' = null' : s.cmp === 'contains' ? 'Text.Contains(' + c + ', ' + x + ', Comparer.OrdinalIgnoreCase)' : c + ' ' + s.cmp + ' ' + mVal(isNaN(+String(s.v).replace(',', '.')) || s.v === '' ? s.v : +String(s.v).replace(',', '.')); return 'Table.SelectRows(' + p + ', each ' + body + ')'; },
    what: 'Koşulu sağlamayan satırları atar. Kaynakta yapılabiliyorsa sorgu katlamayla kaynağa gönderilir.' },
  type: { name: 'Veri türü', group: 'Dönüştür', step: 'Değiştirilen Tür', sel: 1,
    form: [{ k: 'to', label: 'Tür', type: 'sel', o: [['text', 'Metin (ABC)'], ['number', 'Ondalık sayı (1.2)'], ['int', 'Tam sayı (123)'], ['date', 'Tarih'], ['any', 'Herhangi (ABC123)']], d: 'number' }],
    run: (t, s) => { const out = clone(t); s.cols.forEach(c => { const i = idx(out, c); out.rows.forEach(r => { r[i] = convert(r[i], s.to); }); out.cols[i].type = s.to; }); return out; },
    m: (p, s) => 'Table.TransformColumnTypes(' + p + ', {' + s.cols.map(c => '{' + mStr(c) + ', ' + TYPES[s.to].m + '}').join(', ') + '}, "tr-TR")',
    what: 'Sütunun veri türünü belirler. “tr-TR” kültürü 1.250,50 gibi Türkçe sayıları ve 05.01.2024 gibi tarihleri doğru okur. Dönüşmeyen hücreler Error olur.' },
  trim: { name: 'Kırp', group: 'Biçim', step: 'Kırpılan Metin', sel: 1,
    run: (t, s) => textMap(t, s.cols, v => v.trim(), 'Text.Trim'),
    m: (p, s) => 'Table.TransformColumns(' + p + ', {' + s.cols.map(c => '{' + mStr(c) + ', Text.Trim, type text}').join(', ') + '})',
    what: 'Baştaki ve sondaki boşlukları siler. “ankara ” ile “ankara” farklı değerlerdir; dilimleyicide iki kez görünür.' },
  upper: { name: 'BÜYÜK HARF', group: 'Biçim', step: 'Büyük Harfe Dönüştürülmüş Metin', sel: 1,
    run: (t, s) => textMap(t, s.cols, trUp, 'Text.Upper'),
    m: (p, s) => 'Table.TransformColumns(' + p + ', {' + s.cols.map(c => '{' + mStr(c) + ', each Text.Upper(_, "tr-TR"), type text}').join(', ') + '})',
    what: 'Tüm harfleri büyütür. Türkçe kültür verilmezse “i” harfi “I” olur; “tr-TR” ile “İ” olur.' },
  lower: { name: 'küçük harf', group: 'Biçim', step: 'Küçük Harfe Dönüştürülmüş Metin', sel: 1,
    run: (t, s) => textMap(t, s.cols, trLo, 'Text.Lower'),
    m: (p, s) => 'Table.TransformColumns(' + p + ', {' + s.cols.map(c => '{' + mStr(c) + ', each Text.Lower(_, "tr-TR"), type text}').join(', ') + '})',
    what: 'Tüm harfleri küçültür. E-posta gibi büyük/küçük harf ayrımı olmaması gereken alanlar için.' },
  proper: { name: 'Her Sözcüğün İlk Harfi', group: 'Biçim', step: 'Her Sözcüğün İlk Harfi Büyük', sel: 1,
    run: (t, s) => textMap(t, s.cols, proper, 'Text.Proper'),
    m: (p, s) => 'Table.TransformColumns(' + p + ', {' + s.cols.map(c => '{' + mStr(c) + ', each Text.Proper(_, "tr-TR"), type text}').join(', ') + '})',
    what: 'Her sözcüğün ilk harfini büyük, kalanını küçük yapar: “İZMİR”, “izmir” → “İzmir”.' },
  replace: { name: 'Değerleri değiştir', group: 'Giriş', step: 'Değiştirilen Değer', sel: 1,
    form: [{ k: 'find', label: 'Aranacak değer', type: 'text', d: '' }, { k: 'repl', label: 'Yeni değer (boş için null yaz)', type: 'text', d: 'null' }, { k: 'whole', label: 'Hücrenin tamamı eşleşsin', type: 'chk', d: true }],
    run: (t, s) => { const out = clone(t); s.cols.forEach(c => { const i = idx(out, c); const typ = out.cols[i].type; const f = parseParam(s.find, typ), r2 = parseParam(s.repl, typ); out.rows.forEach(r => { const v = r[i]; if (isErr(v)) return; if (s.whole === false && typeof v === 'string' && typeof f === 'string' && f) { r[i] = v.split(f).join(r2 === null ? '' : String(r2)); return; } if (keyOf(v) === keyOf(f) || (f === '' && v === null) || (typeof v === 'number' && typeof f === 'string' && f !== '' && +f.replace(',', '.') === v)) r[i] = r2; }); }); return out; },
    m: (p, s) => 'Table.ReplaceValue(' + p + ', ' + mVal(parseParam(s.find, 'any')) + ', ' + mVal(parseParam(s.repl, 'any')) + ', Replacer.' + (s.whole === false ? 'ReplaceText' : 'ReplaceValue') + ', ' + mList(s.cols) + ')',
    what: 'Bir değeri başka bir değerle değiştirir. “-” gibi “veri yok” işaretlerini null yapmak türü değiştirmeden önce gerekir; yoksa o hücreler Error olur.' },
  replaceErr: { name: 'Hataları değiştir', group: 'Dönüştür', step: 'Değiştirilen Hatalar', sel: 1,
    form: [{ k: 'v', label: 'Hata yerine yazılacak değer', type: 'text', d: '0' }],
    run: (t, s) => { const out = clone(t); s.cols.forEach(c => { const i = idx(out, c); const x = parseParam(s.v, out.cols[i].type); out.rows.forEach(r => { if (isErr(r[i])) r[i] = x; }); }); return out; },
    m: (p, s) => 'Table.ReplaceErrorValues(' + p + ', {' + s.cols.map(c => '{' + mStr(c) + ', ' + mVal(parseParam(s.v, 'number')) + '}').join(', ') + '})',
    what: 'Error hücrelerini sabit bir değerle değiştirir. Satırı korur ama sorunu gizler; raporda 0 ile “bilinmiyor” aynı görünür.' },
  fillDown: { name: 'Aşağı doldur', group: 'Dönüştür', step: 'Aşağı Doldurulan', sel: 1,
    run: (t, s) => { const out = clone(t); s.cols.forEach(c => { const i = idx(out, c); let last = null; out.rows.forEach(r => { if (isBlank(r[i])) r[i] = last; else last = r[i]; }); }); return out; },
    m: (p, s) => 'Table.FillDown(' + p + ', ' + mList(s.cols) + ')',
    what: 'Boş hücreleri üstteki son dolu değerle doldurur. Excel’de birleştirilmiş hücrelerle yapılmış grup başlıkları için.' },
  split: { name: 'Sütunu böl', group: 'Dönüştür', step: 'Sınırlayıcıya Göre Bölünen Sütun', sel: 1, single: true,
    form: [{ k: 'd', label: 'Sınırlayıcı', type: 'text', d: ' ' }, { k: 'mode', label: 'Nerede bölünsün?', type: 'sel', o: [['first', 'En soldaki sınırlayıcıda'], ['each', 'Her sınırlayıcıda']], d: 'first' }],
    run: (t, s) => { const i = idx(t, s.cols[0]); const d = s.d === '' || s.d == null ? ' ' : s.d; const parts = t.rows.map(r => { const v = r[i]; if (v === null || isErr(v)) return [v]; const str = String(v); if (s.mode === 'each') return str.split(d); const k = str.indexOf(d); return k < 0 ? [str] : [str.slice(0, k), str.slice(k + d.length)]; });
      const n = s.mode === 'each' ? Math.max(1, ...parts.map(p => p.length)) : 2; const name = t.cols[i].name;
      const newCols = Array.from({ length: n }, (_, j) => ({ name: name + '.' + (j + 1), type: 'text' }));
      return { cols: t.cols.slice(0, i).concat(newCols, t.cols.slice(i + 1)).map(c => Object.assign({}, c)), rows: t.rows.map((r, ri) => r.slice(0, i).concat(Array.from({ length: n }, (_, j) => parts[ri][j] === undefined ? null : parts[ri][j]), r.slice(i + 1))) }; },
    m: (p, s) => { const d = s.d === '' || s.d == null ? ' ' : s.d; return s.mode === 'each' ? 'Table.SplitColumn(' + p + ', ' + mStr(s.cols[0]) + ', Splitter.SplitTextByDelimiter(' + mStr(d) + ', QuoteStyle.Csv))' : 'Table.SplitColumn(' + p + ', ' + mStr(s.cols[0]) + ', Splitter.SplitTextByEachDelimiter({' + mStr(d) + '}, QuoteStyle.Csv, false), {' + mStr(s.cols[0] + '.1') + ', ' + mStr(s.cols[0] + '.2') + '})'; },
    what: '“K01 Suç ve Ceza” gibi birleşik bir alanı parçalara ayırır. “En soldaki” seçeneği yalnızca ilk boşlukta böler; ürün adındaki boşluklar korunur.' },
  rename: { name: 'Yeniden adlandır', group: 'Dönüştür', step: 'Yeniden Adlandırılan Sütunlar', sel: 1, single: true,
    form: [{ k: 'to', label: 'Yeni ad', type: 'text', d: '' }],
    run: (t, s) => { const i = idx(t, s.cols[0]); const to = String(s.to || '').trim(); if (!to) throw ERR('Yeni sütun adı boş olamaz.'); if (t.cols.some((c, j) => j !== i && c.name === to)) throw ERR('Expression.Error: “' + to + '” adında bir sütun zaten var.'); const out = clone(t); out.cols[i].name = to; return out; },
    m: (p, s) => 'Table.RenameColumns(' + p + ', {{' + mStr(s.cols[0]) + ', ' + mStr(String(s.to || '').trim()) + '}})',
    what: 'Sütun adını değiştirir. Rapor kullanıcısının göreceği ad budur; teknik adları (Column1, Tutar_TL) burada düzelt.' },
  unpivot: { name: 'Diğer sütunların özetini kaldır', group: 'Dönüştür', step: 'Özeti Kaldırılan Diğer Sütunlar', sel: 1,
    run: (t, s) => { const keep = s.cols.map(c => idx(t, c)); const other = t.cols.map((c, i) => i).filter(i => !keep.includes(i)); const rows = []; t.rows.forEach(r => other.forEach(i => { if (r[i] === null || r[i] === undefined) return; rows.push(keep.map(k => r[k]).concat([t.cols[i].name, r[i]])); }));
      const types = other.map(i => t.cols[i].type); const vt = types.every(x => x === types[0]) ? types[0] : 'any';
      return { cols: keep.map(k => Object.assign({}, t.cols[k])).concat([{ name: 'Öznitelik', type: 'text' }, { name: 'Değer', type: vt }]), rows }; },
    m: (p, s) => 'Table.UnpivotOtherColumns(' + p + ', ' + mList(s.cols) + ', "Öznitelik", "Değer")',
    what: 'Seçili sütunları tutar, geri kalan sütunları satıra çevirir: Oca | Şub | Mar sütunları → Ay ve Değer. Excel’deki geniş tablolar modelde uzun olmalıdır.' },
  group: { name: 'Gruplandırma ölçütü', group: 'Dönüştür', step: 'Gruplandırılmış Satırlar', sel: 1,
    form: [{ k: 'name', label: 'Yeni sütun adı', type: 'text', d: 'Toplam' }, { k: 'agg', label: 'İşlem', type: 'sel', o: [['sum', 'Toplam'], ['avg', 'Ortalama'], ['min', 'En küçük'], ['max', 'En büyük'], ['count', 'Satırları say']], d: 'sum' }, { k: 'src', label: 'Sütun', type: 'col', d: '', hideIf: s => s.agg === 'count' }],
    run: (t, s) => { const ks = s.cols.map(c => idx(t, c)); const si = s.agg === 'count' ? -1 : idx(t, s.src); const name = String(s.name || 'Sayı').trim(); const g = new Map();
      t.rows.forEach(r => { const k = ks.map(i => keyOf(r[i])).join('␟'); if (!g.has(k)) g.set(k, { key: ks.map(i => r[i]), vals: [], n: 0 }); const G = g.get(k); G.n++; if (si >= 0) G.vals.push(r[si]); });
      const agg = G => { if (s.agg === 'count') return G.n; if (G.vals.some(isErr)) return ERR('Gruptaki bir hücre hatalı.'); const v = G.vals.filter(x => typeof x === 'number'); if (!v.length) return null; return s.agg === 'sum' ? v.reduce((a, b) => a + b, 0) : s.agg === 'avg' ? v.reduce((a, b) => a + b, 0) / v.length : s.agg === 'min' ? Math.min(...v) : Math.max(...v); };
      return { cols: ks.map(i => Object.assign({}, t.cols[i])).concat([{ name, type: s.agg === 'count' ? 'int' : 'number' }]), rows: [...g.values()].map(G => G.key.concat([agg(G)])) }; },
    m: (p, s) => { const f = { sum: 'List.Sum', avg: 'List.Average', min: 'List.Min', max: 'List.Max' }[s.agg]; return 'Table.Group(' + p + ', ' + mList(s.cols) + ', {{' + mStr(String(s.name || 'Sayı').trim()) + ', ' + (s.agg === 'count' ? 'each Table.RowCount(_), Int64.Type' : 'each ' + f + '([' + s.src + ']), type nullable number') + '}})'; },
    what: 'Seçili sütun(lar)a göre gruplar ve her grup için tek satır üretir; SQL’deki GROUP BY. Ayrıntıyı kaybedersin: modelde ayrıntıyı tutup DAX ile toplamak çoğu zaman daha esnektir.' }
};

/* ---------- Uygulama ve M kodu ---------- */
function stepName(op, used) { let n = OPS[op].step; if (used[n]) { used[n]++; n = n + (used[n] - 1); } else used[n] = 1; return n; }
function run(src, steps, upto) {
  let t = src.table; const states = [{ name: 'Kaynak', table: t, m: src.m }]; const used = { 'Kaynak': 1 };
  let error = null; const end = upto == null ? steps.length : Math.min(upto, steps.length);
  for (let i = 0; i < end; i++) {
    const s = steps[i], op = OPS[s.op]; const prevName = states[states.length - 1].ref || 'Kaynak';
    const name = stepName(s.op, used); const ref = '#"' + name + '"';
    let m = ''; try { m = op.m(prevName, s); } catch (e) { m = '…'; }
    try { if (op.sel && (!s.cols || !s.cols.length)) need(s); t = op.run(t, s); states.push({ name, ref, table: t, m }); }
    catch (e) { if (!isErr(e)) throw e; error = { i, msg: e.pqErr }; states.push({ name, ref, table: null, m, error: e.pqErr }); break; }
  }
  return { table: error ? null : t, states, error };
}
function mCode(src, states) {
  const lines = ['let', '    Kaynak = ' + src.m + (states.length > 1 ? ',' : '')];
  states.slice(1).forEach((s, i, a) => lines.push('    ' + s.ref + ' = ' + s.m + (i < a.length - 1 ? ',' : '')));
  lines.push('in', '    ' + (states.length > 1 ? states[states.length - 1].ref : 'Kaynak'));
  return lines.join('\n');
}
function quality(t) {
  return t.cols.map((c, i) => { let ok = 0, er = 0, em = 0; t.rows.forEach(r => { const v = r[i]; if (isErr(v)) er++; else if (isBlank(v)) em++; else ok++; }); const n = Math.max(1, t.rows.length); return { ok: ok / n, er: er / n, em: em / n, dist: new Set(t.rows.map(r => keyOf(r[i]))).size }; });
}
function compare(mine, target) {
  if (!mine) return { ok: false, msg: 'Uygulanan adımlardan biri hata veriyor; önce onu düzelt ya da sil.' };
  const mn = mine.cols.map(c => c.name), tn = target.cols.map(c => c.name);
  if (mn.join('|') !== tn.join('|')) { const miss = tn.filter(x => !mn.includes(x)), extra = mn.filter(x => !tn.includes(x)); return { ok: false, msg: 'Sütunlar hedefle aynı değil.' + (miss.length ? ' Eksik: ' + miss.join(', ') + '.' : '') + (extra.length ? ' Fazla: ' + extra.join(', ') + '.' : '') + (!miss.length && !extra.length ? ' Sütun sırası farklı: hedef ' + tn.join(', ') + '.' : '') }; }
  const sameT = (a, b) => a === b || (a === 'any' && b === 'text') || (a === 'text' && b === 'any');
  const badT = target.cols.map((c, i) => !sameT(c.type, mine.cols[i].type) ? c.name + ' (hedef: ' + TYPES[c.type].name + ', seninki: ' + TYPES[mine.cols[i].type].name + ')' : null).filter(Boolean);
  if (badT.length) return { ok: false, msg: 'Veri türleri farklı: ' + badT.join('; ') + '.' };
  if (mine.rows.length !== target.rows.length) return { ok: false, msg: 'Satır sayısı farklı: hedef ' + target.rows.length + ', seninki ' + mine.rows.length + '.' };
  const rk = r => r.map(keyOf).join('␟'); const a = mine.rows.map(rk).sort(), b = target.rows.map(rk).sort();
  const j = a.findIndex((x, i) => x !== b[i]); if (j >= 0) { const tr = target.rows.find(r => rk(r) === b[j]); return { ok: false, msg: 'Sütunlar, türler ve satır sayısı doğru ama bazı değerler farklı. Örneğin hedefte şu satır var, sende yok: ' + tr.map(v => isErr(v) ? 'Error' : v === null ? 'null' : v instanceof Date ? fmtDate(v) : v).join(' | ') + '.' }; }
  return { ok: true };
}

/* ---------- Kirli örnek tablolar ---------- */
const T = (names, rows, type) => ({ cols: names.map(n => ({ name: n, type: type || 'any' })), rows });
const SOURCES = {
  bayi: { name: 'Bayi satış raporu (Excel)', desc: 'Bayilerin Ocak 2024 satışlarını içeren, elle doldurulmuş bir Excel sayfası: üstte başlık satırı, boşluklu ve karışık harfli şehirler, Türkçe sayı biçimi, “-” işaretleri, boş ve yinelenen satırlar.',
    m: 'Excel.Workbook(File.Contents("C:\\\\Veri\\\\bayi_ocak.xlsx"), null, true){[Item = "Rapor", Kind = "Sheet"]}[Data]',
    table: T(['Column1', 'Column2', 'Column3', 'Column4', 'Column5'], [
      ['Anadolu Market · Bayi satış raporu (Ocak 2024)', null, null, null, null],
      ['Bayi', 'Şehir', 'Tarih', 'Tutar', 'Not'],
      ['Merkez Bayi', ' istanbul ', '05.01.2024', '1.250,50', ''],
      ['Kızılay Bayi', 'ANKARA', '06.01.2024', '980', null],
      ['Alsancak Bayi', 'izmir  ', '07.01.2024', '-', 'kasa kapalı'],
      [null, null, null, null, null],
      ['Merkez Bayi', ' istanbul ', '05.01.2024', '1.250,50', ''],
      ['Nilüfer Bayi', 'bursa', '08.01.2024', '2.040,00', null],
      ['Konyaaltı Bayi', 'Antalya ', '09.01.2024', '1.115,75', 'yeni'],
      ['Kızılay Bayi', 'ankara', '10.01.2024', '1.430', null],
      ['Selçuklu Bayi', 'KONYA', 'bilinmiyor', '760,25', null],
      ['Ortahisar Bayi', 'trabzon', '12.01.2024', '890', null]
    ]) },
  hedef: { name: 'Aylık kategori hedefleri (geniş tablo)', desc: 'Finans ekibinin bütçe dosyası: her ay ayrı bir sütunda. Görselde “ay” eksenine koymak ve Tarih tablosuna bağlamak için uzun biçime çevrilmeli.',
    m: 'Excel.Workbook(File.Contents("C:\\\\Veri\\\\butce_2024.xlsx"), null, true){[Item = "Hedef", Kind = "Table"]}[Data]',
    table: { cols: [{ name: 'Kategori', type: 'text' }, { name: 'Oca', type: 'number' }, { name: 'Şub', type: 'number' }, { name: 'Mar', type: 'number' }], rows: [
      ['Elektronik', 52000, 48000, 55000], ['Kitap', 9000, 8500, 9800], ['Giyim', 21000, 19500, null], ['Spor', 15000, 16200, 18400]] } },
  urun: { name: 'Ürün listesi (gruplu Excel)', desc: 'Satın alma ekibinin ürün listesi: kategori yalnızca grubun ilk satırında yazıyor, ürün kodu ve adı tek hücrede.',
    m: 'Excel.Workbook(File.Contents("C:\\\\Veri\\\\urun_listesi.xlsx"), null, true){[Item = "Liste", Kind = "Table"]}[Data]',
    table: { cols: [{ name: 'Kategori', type: 'text' }, { name: 'Ürün Kodu ve Adı', type: 'text' }, { name: 'Fiyat', type: 'number' }], rows: [
      ['Elektronik', 'E01 Kablosuz Kulaklık', 1299], [null, 'E02 Akıllı Saat', 3499], [null, 'E03 Powerbank 20000mAh', 649],
      ['Kitap', 'K01 Suç ve Ceza', 145], [null, 'K02 Tutunamayanlar', 260], [null, 'K03 İnce Memed', 180],
      ['Spor', 'S01 Yoga Matı', 399], [null, 'S02 Termos 750ml', 459], [null, 'S03 Kamp Çadırı', 3299]] } },
  musteri: { name: 'CRM müşteri dışa aktarımı (CSV)', desc: 'CRM’den alınan müşteri listesi: e-postalar karışık harfli, bazı satırlarda müşteri numarası yinelenmiş, kayıt tarihi metin.',
    m: 'Csv.Document(File.Contents("C:\\\\Veri\\\\crm_musteri.csv"), [Delimiter = ";", Encoding = 65001, QuoteStyle = QuoteStyle.Csv])',
    table: T(['Column1', 'Column2', 'Column3', 'Column4'], [
      ['MusteriNo', 'Ad Soyad', 'E-posta', 'KayitTarihi'],
      ['101', 'Ayşe Yılmaz', 'Ayse.Yilmaz@Gmail.com', '2023-03-14'],
      ['102', 'mehmet kaya', 'MEHMET.KAYA@hotmail.com', '2023-05-02'],
      ['103', 'Zeynep Demir', 'zeynep.demir@outlook.com', '2023-07-21'],
      ['102', 'mehmet kaya', 'mehmet.kaya@hotmail.com', '2023-05-02'],
      ['104', 'ALİ ŞAHİN', null, '2024-01-09'],
      ['105', 'Elif Çelik', 'elif.celik@icloud.com', '2024-02-30']
    ]) }
};

/* ---------- Alıştırmalar ---------- */
const S = (op, cols, extra) => Object.assign({ op, cols: cols || [] }, extra || {});
const BAYI_A = [S('removeTop', [], { n: 1 }), S('promote'), S('removeCols', ['Not'])];
const BAYI_B = [S('trim', ['Şehir']), S('proper', ['Şehir']), S('replace', ['Tutar'], { find: '-', repl: 'null', whole: true }), S('type', ['Tutar'], { to: 'number' })];
const BAYI_C = [S('removeBlank'), S('distinct'), S('type', ['Tarih'], { to: 'date' }), S('removeErrors', ['Tarih'])];
const HEDEF_A = [S('unpivot', ['Kategori']), S('rename', ['Öznitelik'], { to: 'Ay' }), S('rename', ['Değer'], { to: 'Hedef' })];
const URUN_A = [S('fillDown', ['Kategori']), S('split', ['Ürün Kodu ve Adı'], { d: ' ', mode: 'first' }), S('rename', ['Ürün Kodu ve Adı.1'], { to: 'UrunKodu' }), S('rename', ['Ürün Kodu ve Adı.2'], { to: 'Urun' })];
const MUS_A = [S('promote'), S('type', ['MusteriNo'], { to: 'int' }), S('lower', ['E-posta']), S('proper', ['Ad Soyad']), S('distinct', ['MusteriNo'])];

const EX = {
  'pq-temel': [
    { t: 'pq', src: 'bayi', pre: [], sol: BAYI_A, q: '<b>Başlıkları düzelt.</b> Excel sayfasının ilk satırı bir rapor başlığı, gerçek sütun adları ikinci satırda. Başlık satırını kaldır, ikinci satırı sütun adı yap ve işe yaramayan <code>Not</code> sütununu sil.', hint: 'Sırayla: Satırları kaldır → Üst satırları kaldır (1), İlk satırı üst bilgi olarak kullan, sonra Not sütununu seçip Sütunları kaldır.' },
    { t: 'pq', src: 'bayi', pre: BAYI_A, sol: BAYI_B, q: '<b>Şehirleri ve tutarları temizle.</b> <code>Şehir</code> sütununda boşluklar ve karışık harfler var (“ istanbul ”, “ANKARA”). Önce kırp, sonra her sözcüğün ilk harfini büyüt. <code>Tutar</code> sütunundaki “-” işaretlerini <code>null</code> yap ve sütunu ondalık sayıya çevir.', hint: '“-” işaretini türü değiştirmeden ÖNCE null yap; yoksa o hücre Error olur. Tür değişiminde tr-TR kültürü 1.250,50’yi 1250,5 olarak okur.' },
    { t: 'pq', src: 'bayi', pre: BAYI_A.concat(BAYI_B), sol: BAYI_C, q: '<b>Satırları temizle.</b> Tamamen boş satırı ve aynı satırın ikinci kopyasını kaldır. <code>Tarih</code> sütununu tarihe çevir; dönüşemeyen (“bilinmiyor”) satırı da kaldır. Sonuçta 7 temiz bayi satırı kalmalı.', hint: 'Boş satırları kaldır → Yinelenenleri kaldır (sütun seçmeden tüm satıra bakar) → Tarih’i seçip Veri türü: Tarih → Hataları kaldır.' }
  ],
  'pq-model': [
    { t: 'pq', src: 'urun', pre: [], sol: URUN_A, q: '<b>Gruplu listeyi düz tabloya çevir.</b> <code>Kategori</code> yalnızca grubun ilk satırında yazıyor: aşağı doldur. <code>Ürün Kodu ve Adı</code> sütununu <b>en soldaki</b> boşluktan ikiye böl ve parçaları <code>UrunKodu</code> ile <code>Urun</code> olarak adlandır.', hint: '“Her sınırlayıcıda” bölersen “Suç ve Ceza” üç parçaya ayrılır. En soldaki boşluk yeterli.' },
    { t: 'pq', src: 'musteri', pre: [], sol: MUS_A, q: '<b>Müşteri boyutunu hazırla.</b> İlk satırı başlık yap, <code>MusteriNo</code>’yu tam sayıya çevir, e-postaları küçük harfe, adları “Her Sözcüğün İlk Harfi” biçimine getir ve <b>MusteriNo’ya göre</b> yinelenenleri kaldır. Bir boyut tablosunun anahtarı benzersiz olmalı.', hint: 'Yinelenenleri kaldırırken yalnızca MusteriNo sütununu seç. E-postayı küçük harfe çevirmeden kaldırırsan iki satır farklı görünür; ama burada anahtar MusteriNo olduğu için sıra önemli değil.' }
  ],
  'pq-orta': [
    { t: 'pq', src: 'hedef', pre: [], sol: HEDEF_A, q: '<b>Geniş tabloyu uzun yap.</b> Ay sütunlarını (Oca, Şub, Mar) satırlara çevir: <code>Kategori</code> kalsın, diğer sütunların özetini kaldır. Yeni sütunları <code>Ay</code> ve <code>Hedef</code> olarak adlandır. Giyim’in Mart hedefi boş; özeti kaldırma boş hücreleri atar, sonuçta 11 satır olur.', hint: 'Kategori sütununu seç → Diğer sütunların özetini kaldır. Sonra Öznitelik ve Değer sütunlarını tek tek yeniden adlandır.' },
    { t: 'pq', src: 'hedef', pre: HEDEF_A, sol: [S('group', ['Kategori'], { name: 'Çeyrek Hedefi', agg: 'sum', src: 'Hedef' })], q: '<b>Kategori başına toplam hedef.</b> Uzun tabloyu <code>Kategori</code>’ye göre gruplandır; <code>Hedef</code>’in toplamını <code>Çeyrek Hedefi</code> adlı sütunda hesapla.', hint: 'Kategori’yi seç → Gruplandırma ölçütü: yeni sütun adı “Çeyrek Hedefi”, işlem Toplam, sütun Hedef.' }
  ],
  'm-dili': [
    { t: 'pq', src: 'bayi', pre: BAYI_A, sol: [S('type', ['Tutar'], { to: 'number' }), S('replaceErr', ['Tutar'], { v: '0' })], q: '<b>M kodunu oku.</b> Bu kez “-” işaretini önceden temizlemeden <code>Tutar</code>’ı ondalık sayıya çevir ve oluşan hatayı 0 ile değiştir. Sonra sağdaki <b>Gelişmiş Düzenleyici</b>’yi aç: <code>Table.TransformColumnTypes</code> ve <code>Table.ReplaceErrorValues</code> satırlarını, her adımın bir önceki adımın adını (<code>#"…"</code>) aldığını gör.', hint: 'Tutar’ı seç → Veri türü: Ondalık sayı → Hataları değiştir: 0.' }
  ]
};
const MC = {
  'pq-temel': [{ t: 'mc', q: 'Bayi tablosunda <code>Tutar</code> sütununu önce sayıya çevirip sonra “-” işaretini null yapmaya çalışırsan ne olur?', o: ['Sorun olmaz, sonuç aynıdır', '“-” hücresi tür değişiminde Error olur; artık “-” diye bir metin kalmadığı için Değerleri değiştir onu bulamaz', 'Power Query “-” işaretini kendiliğinden null yapar', 'Tüm sütun metin olarak kalır'], a: 1, why: 'Adımlar sırayla çalışır. Tür değişimi “-”i sayıya çeviremez ve hücre Error olur. Bu yüzden temizlik (Değerleri değiştir) tür değişiminden önce gelir; ya da sonradan “Hataları değiştir” kullanılır.' }]
};
Object.keys(EX).forEach(id => { const l = (W.PBI_LESSONS || []).find(x => x.id === id); if (!l) return; l.ex = (l.ex || []).concat(EX[id], MC[id] || []); });

function source(srcId, pre) { const src = SOURCES[srcId]; const r = run(src, pre || []); if (r.error) throw new Error('PQ ön adım hatası: ' + srcId + ' ' + r.error.msg); return { name: src.name, desc: src.desc, m: pre && pre.length ? mCode(src, r.states).replace(/^let\n|\nin\n[\s\S]*$/g, '') : src.m, table: r.table, base: src, pre: pre || [] }; }
function exSource(e) {
  const src = SOURCES[e.src]; const r0 = run(src, e.pre || []);
  // ön adımlar “Kaynak” olarak görünür: M kodunda tek ifadeyle özetlenir
  return { name: src.name, desc: src.desc, m: (e.pre && e.pre.length ? '/* önceki alıştırmanın ' + e.pre.length + ' adımı */ ' : '') + src.m, table: r0.table };
}
function target(e) { const s = exSource(e); return run(s, e.sol).table; }

W.PBI_PQ = { OPS, TYPES, SOURCES, run, mCode, quality, compare, exSource, target, isErr, isBlank, fmtDate, keyOf, source };
})(window);
