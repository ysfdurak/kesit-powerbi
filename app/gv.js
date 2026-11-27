/* Kesit Power BI — Görsel kurma (t:'gorsel') ve model kurma (t:'model') alıştırmaları; görsel hesaplamalar (RUNNINGSUM, MOVINGAVERAGE, PREVIOUS, COLLAPSE…).
   Görsel: alan kutuları (eksen, gösterge, değerler), görsel türü, görsel düzeyi filtre, sıralama, İlk N ve görsel hesaplama. Denetim: tür kuralı + görselin verisi çözümün verisiyle aynı mı.
   Model: ilişkileri öğrenci kurar (kardinalite, çapraz filtre, aktif). Denetim: ilişki kümesi + o modelle hesaplanan kontrol tablosu. */
(function () {
'use strict';
if (!window.PBI_CORE) return; // arayüzsüz (node) yüklemede atlanır
const C = window.PBI_CORE, X = C.X, V = window.PBIViz, MODEL = C.MODEL, esc = C.esc, P = C.P, $ = C.$;

/* ---------------------------------------------------------------- ortak */
const TURLER = { kart: 'Kart', sutun: 'Kümelenmiş sütun', cubuk: 'Kümelenmiş çubuk', yigin: 'Yığılmış sütun', cizgi: 'Çizgi', alan: 'Alan', halka: 'Halka', tablo: 'Tablo', matris: 'Matris' };
const TUR_NE = { kart: 'Tek bir sayı', sutun: 'Az kategoriyi karşılaştırmak', cubuk: 'Uzun adlı ya da çok kategori, sıralı liste', yigin: 'Toplam ve parçaları birlikte', cizgi: 'Zaman içindeki değişim', alan: 'Zaman içinde birikim ya da hacim', halka: 'Bir bütünün 2–5 parçası', tablo: 'Ayrıntılı değerler, birden çok ölçü', matris: 'İki boyutlu kırılım (satır × sütun)' };
const pc = s => { const m = /^'?([^'\[]+)'?\[(.+)\]$/.exec(String(s || '')); return m ? { t: m[1], c: m[2] } : null; };
const ad = s => { const p = pc(s); return p ? p.t + '[' + p.c + ']' : s; };
const isNum = v => typeof v === 'number' && isFinite(v);
const esit = (a, b) => (a == null && b == null) || (isNum(a) && isNum(b) ? Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b)) : X.keyOf(a) === X.keyOf(b));
const kat = v => v == null ? '(Boş)' : v instanceof Date ? X.fmtDate(v, 'dd.MM.yyyy') : String(v);
function alanlar() {
  const out = [];
  Object.keys(MODEL.tables).forEach(t => { const T = MODEL.tables[t]; if (T.kind !== 'dim') return; T.cols.forEach(c => out.push(t + '[' + c + ']')); });
  // olgu tablosundaki metin sütunları da eksene konabilir (Kanal, Durum gibi)
  const S = MODEL.tables.Satislar; if (S) S.cols.forEach(c => { const v = S.rows[0] && (Array.isArray(S.rows[0]) ? S.rows[0][S.cols.indexOf(c)] : S.rows[0][c]); if (typeof v === 'string' && !/^\d{4}-\d{2}-\d{2}/.test(v)) out.push('Satislar[' + c + ']'); });
  return out;
}
const OLCULER = () => C.LIB.filter(m => !m.lv || m.lv !== 'ileri').map(m => m.name);

/* ---------------------------------------------------------------- görsel hesaplama */
// Küçük bir ifade dili: [Ad] başvuruları görseldeki sütunlara, işlevler görselin satırları üzerinde çalışır.
const VC_FN = ['RUNNINGSUM', 'MOVINGAVERAGE', 'PREVIOUS', 'NEXT', 'FIRST', 'LAST', 'COLLAPSE', 'EXPAND', 'DIVIDE', 'IF', 'BLANK', 'ISBLANK', 'ROWS', 'COLUMNS', 'ABS', 'ROUND', 'MIN', 'MAX'];
function vcTokens(s) {
  const out = []; let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '[') { const j = s.indexOf(']', i); if (j < 0) throw new Error('Kapanmayan köşeli parantez: ' + s.slice(i)); out.push({ k: 'ref', v: s.slice(i + 1, j) }); i = j + 1; continue; }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(s[i + 1] || ''))) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; out.push({ k: 'num', v: parseFloat(s.slice(i, j)) }); i = j; continue; }
    if (/[A-Za-zÇĞİÖŞÜçğıöşü_]/.test(ch)) { let j = i; while (j < s.length && /[A-Za-z0-9_.ÇĞİÖŞÜçğıöşü]/.test(s[j])) j++; out.push({ k: 'id', v: s.slice(i, j).toUpperCase() }); i = j; continue; }
    if ('<>='.includes(ch)) { const two = s.slice(i, i + 2); if (two === '<=' || two === '>=' || two === '<>') { out.push({ k: 'op', v: two }); i += 2; continue; } }
    if ('+-*/(),<>=&'.includes(ch)) { out.push({ k: ch === '(' || ch === ')' || ch === ',' ? ch : 'op', v: ch }); i++; continue; }
    throw new Error('Tanınmayan karakter: ' + ch);
  }
  return out;
}
function vcParse(src) {
  const t = vcTokens(src); let p = 0;
  const peek = () => t[p], eat = k => { const x = t[p]; if (!x || (k && x.k !== k && x.v !== k)) throw new Error('Beklenmeyen ' + (x ? '“' + x.v + '”' : 'ifade sonu') + (k ? ', beklenen ' + k : '')); p++; return x; };
  function prim() {
    const x = peek(); if (!x) throw new Error('İfade eksik');
    if (x.k === 'num') { p++; return { n: x.v }; }
    if (x.k === 'ref') { p++; return { r: x.v }; }
    if (x.v === '(') { p++; const e = cmp(); eat(')'); return e; }
    if (x.v === '-') { p++; return { op: 'neg', a: prim() }; }
    if (x.k === 'id') {
      p++;
      if (x.v === 'TRUE' || x.v === 'FALSE') { if (peek() && peek().v === '(') { p++; eat(')'); } return { n: x.v === 'TRUE' }; }
      if (!peek() || peek().v !== '(') { if (x.v === 'ROWS' || x.v === 'COLUMNS') return { kw: x.v }; throw new Error('“' + x.v + '” tanınmıyor. Sütun adını köşeli parantezle yaz: [' + x.v + ']'); }
      if (!VC_FN.includes(x.v)) throw new Error(x.v + ' görsel hesaplamada desteklenmiyor. Kullanılabilenler: RUNNINGSUM, MOVINGAVERAGE, PREVIOUS, NEXT, FIRST, LAST, COLLAPSE, EXPAND, DIVIDE, IF.');
      p++; const args = []; if (peek() && peek().v !== ')') { args.push(cmp()); while (peek() && peek().v === ',') { p++; args.push(cmp()); } } eat(')');
      return { f: x.v, args };
    }
    throw new Error('Beklenmeyen “' + x.v + '”');
  }
  function mul() { let a = prim(); while (peek() && (peek().v === '*' || peek().v === '/')) { const o = eat().v; a = { op: o, a, b: prim() }; } return a; }
  function add() { let a = mul(); while (peek() && (peek().v === '+' || peek().v === '-' || peek().v === '&')) { const o = eat().v; a = { op: o, a, b: mul() }; } return a; }
  function cmp() { let a = add(); while (peek() && ['<', '>', '=', '<=', '>=', '<>'].includes(peek().v)) { const o = eat().v; a = { op: o, a, b: add() }; } return a; }
  const e = cmp(); if (p < t.length) throw new Error('Fazladan: “' + t[p].v + '”'); return e;
}
// tablo: { n satır, col(ad) → { vals:[], total } }. i = -1 toplam satırı.
function vcEval(ast, tablo, i) {
  const ev = (a, j) => vcEval(a, tablo, j);
  const bos = v => v == null;
  if ('n' in ast) return ast.n;
  if (ast.r != null) { const c = tablo.col(ast.r); if (!c) throw new Error('[' + ast.r + '] görselde yok. Görseldeki sütunlar: ' + tablo.adlar().map(x => '[' + x + ']').join(', ')); return i < 0 ? c.total : c.vals[i]; }
  if (ast.op) {
    if (ast.op === 'neg') { const v = ev(ast.a, i); return bos(v) ? null : -v; }
    const a = ev(ast.a, i), b = ev(ast.b, i);
    switch (ast.op) {
      case '+': return bos(a) && bos(b) ? null : (a || 0) + (b || 0);
      case '-': return bos(a) && bos(b) ? null : (a || 0) - (b || 0);
      case '*': return bos(a) || bos(b) ? null : a * b;
      case '/': if (bos(a)) return null; if (!b) throw new Error('Sıfıra bölme: / yerine DIVIDE kullan.'); return a / b;
      case '&': return String(a ?? '') + String(b ?? '');
      case '<': return (a ?? 0) < (b ?? 0); case '>': return (a ?? 0) > (b ?? 0); case '<=': return (a ?? 0) <= (b ?? 0); case '>=': return (a ?? 0) >= (b ?? 0);
      case '=': return (a ?? 0) === (b ?? 0); case '<>': return (a ?? 0) !== (b ?? 0);
    }
  }
  if (ast.kw) return ast.kw;
  const A = ast.args, n = tablo.n;
  const ilk = () => { if (!A[0]) throw new Error(ast.f + ' bir sütun ister'); return A[0]; };
  switch (ast.f) {
    case 'BLANK': return null;
    case 'ISBLANK': return bos(ev(A[0], i));
    case 'IF': return ev(A[0], i) ? ev(A[1], i) : A[2] ? ev(A[2], i) : null;
    case 'DIVIDE': { const a = ev(A[0], i), b = ev(A[1], i); return !b || bos(a) ? (A[2] ? ev(A[2], i) : null) : a / b; }
    case 'ABS': { const v = ev(A[0], i); return bos(v) ? null : Math.abs(v); }
    case 'ROUND': { const v = ev(A[0], i), d = A[1] ? ev(A[1], i) : 0; return bos(v) ? null : Math.round(v * 10 ** d) / 10 ** d; }
    case 'MIN': case 'MAX': { const a = ev(A[0], i), b = ev(A[1], i); return ast.f === 'MIN' ? Math.min(a, b) : Math.max(a, b); }
    case 'RUNNINGSUM': { if (i < 0) return null; let t = null; for (let k = 0; k <= i; k++) { const v = ev(ilk(), k); if (!bos(v)) t = (t || 0) + v; } return t; }
    case 'MOVINGAVERAGE': { if (i < 0) return null; const w = A[1] ? ev(A[1], i) : 3; const xs = []; for (let k = Math.max(0, i - w + 1); k <= i; k++) { const v = ev(ilk(), k); if (!bos(v)) xs.push(v); } return xs.length ? xs.reduce((x, y) => x + y, 0) / xs.length : null; }
    case 'PREVIOUS': { if (i < 0) return null; const s = A[1] && A[1].kw == null ? ev(A[1], i) : 1; return i - s >= 0 ? ev(ilk(), i - s) : null; }
    case 'NEXT': { if (i < 0) return null; const s = A[1] && A[1].kw == null ? ev(A[1], i) : 1; return i + s < n ? ev(ilk(), i + s) : null; }
    case 'FIRST': return n ? ev(ilk(), 0) : null;
    case 'LAST': return n ? ev(ilk(), n - 1) : null;
    case 'COLLAPSE': return ev(ilk(), -1);
    case 'EXPAND': return ev(ilk(), i);
    case 'RANK': { if (i < 0) return null; const v = ev(ilk(), i); if (bos(v)) return null; let r = 1; for (let k = 0; k < n; k++) { const w = ev(ilk(), k); if (!bos(w) && w > v) r++; } return r; }
  }
  throw new Error(ast.f + ' desteklenmiyor');
}

/* ---------------------------------------------------------------- görsel verisi */
// sp: { tur, eksen, gosterge, degerler:[ölçü], filtre:{alan, degerler}, sirala:'etiket'|'azalan'|'artan', topn, hesap:[{ad, ifade}] }
function gorselVerisi(sp) {
  if (!sp.tur) throw new Error('Görsel türü seç: soruya hangi görselin cevap verdiğine karar ver.');
  const ms = C.measureSet();
  const degerler = (sp.degerler || []).filter(Boolean);
  if (!degerler.length) throw new Error('Değerler kutusu boş: en az bir ölçü ekle.');
  degerler.forEach(d => { if (!ms[d]) throw new Error('“' + d + '” adlı ölçü yok.'); });
  const sl = sp.filtre && sp.filtre.alan && (sp.filtre.degerler || []).length ? [Object.assign(pc(sp.filtre.alan), { values: sp.filtre.degerler.slice() })] : [];
  if (sp.tur === 'kart') {
    const v = X.evalMeasure(ms, '[' + degerler[0] + ']', sl, { shadow: sl });
    return { kart: true, deger: v, ad: degerler[0], cats: [], series: [], hesap: [] };
  }
  if (!sp.eksen) throw new Error(sp.tur === 'tablo' || sp.tur === 'matris' ? 'Satırlar kutusu boş: bir alan ekle.' : 'Eksen boş: kategoriyi koyacağın bir alan seç.');
  const ek = pc(sp.eksen); if (!ek || !MODEL.tables[ek.t]) throw new Error('Eksen alanı tanınmadı: ' + sp.eksen);
  if (sp.gosterge) {
    if (degerler.length > 1) throw new Error('Gösterge (ya da matris sütunu) varken yalnız bir değer kullanılabilir.');
    const gk = pc(sp.gosterge);
    const r = X.query({ rows: [ek, gk], measures: ms, values: degerler, slicers: sl, totals: true });
    const cats = [], seri = [];
    r.rows.forEach(x => { if (!cats.some(c => X.keyOf(c) === X.keyOf(x.keys[0]))) cats.push(x.keys[0]); if (!seri.some(c => X.keyOf(c) === X.keyOf(x.keys[1]))) seri.push(x.keys[1]); });
    const series = seri.map(s => ({ name: kat(s), vals: cats.map(c => { const row = r.rows.find(x => X.keyOf(x.keys[0]) === X.keyOf(c) && X.keyOf(x.keys[1]) === X.keyOf(s)); return row ? row.vals[0] : null; }) }));
    // toplam sütunu: her kategori için tüm gösterge değerlerinin toplamı (matris "Toplam" sütunu)
    const rt = X.query({ rows: [ek], measures: ms, values: degerler, slicers: sl, totals: true });
    const top = cats.map(c => { const row = rt.rows.find(x => X.keyOf(x.keys[0]) === X.keyOf(c)); return row ? row.vals[0] : null; });
    let ix = cats.map((_, k) => k);
    ix = siralaIx(ix, sp, k => top[k], cats);
    return { cats: ix.map(k => cats[k]), series: series.map(s => ({ name: s.name, vals: ix.map(k => s.vals[k]) })), toplam: ix.map(k => top[k]), genel: rt.total ? rt.total[0] : null, gosterge: true, hesap: [], ad: degerler[0] };
  }
  const r = X.query({ rows: [ek], measures: ms, values: degerler, slicers: sl, totals: true });
  let ix = r.rows.map((_, k) => k);
  ix = siralaIx(ix, sp, k => r.rows[k].vals[0], r.rows.map(x => x.keys[0]));
  const cats = ix.map(k => r.rows[k].keys[0]);
  const series = degerler.map((d, j) => ({ name: d, vals: ix.map(k => r.rows[k].vals[j]) }));
  const total = (r.total || []).slice();
  // İlk N: toplam yalnız görünen kategorilerden (Power BI görsel düzeyi filtresi gibi)
  if (sp.topn > 0) for (let j = 0; j < degerler.length; j++) { const ms2 = ms; const sl2 = sl.concat([Object.assign({}, ek, { values: cats.slice() })]); total[j] = X.evalMeasure(ms2, '[' + degerler[j] + ']', sl2, { shadow: sl2 }); }
  // görsel hesaplamalar
  const hesap = [];
  const tablo = { n: cats.length, adlar: () => series.map(s => s.name).concat(hesap.map(h => h.name)), col: a => { const s = series.find(x => x.name.toLowerCase() === a.toLowerCase()); if (s) return { vals: s.vals, total: total[series.indexOf(s)] }; const h = hesap.find(x => x.name.toLowerCase() === a.toLowerCase()); return h ? { vals: h.vals, total: h.total } : null; } };
  (sp.hesap || []).filter(h => h && h.ifade).forEach(h => {
    const ast = vcParse(String(h.ifade).replace(/^\s*[^=\[]+=\s*/, ''));
    const vals = cats.map((_, i) => vcEval(ast, tablo, i)); let tot = null; try { tot = vcEval(ast, tablo, -1); } catch (e) { tot = null; }
    hesap.push({ name: h.ad || 'Hesap', vals, total: tot });
  });
  return { cats, series, total, hesap };
}
function siralaIx(ix, sp, deg, keys) {
  const s = sp.sirala || 'etiket';
  if (s === 'azalan' || s === 'artan' || sp.topn > 0) {
    const yon = s === 'artan' ? 1 : -1;
    ix = ix.slice().sort((a, b) => ((deg(a) ?? -Infinity) - (deg(b) ?? -Infinity)) * yon);
  }
  if (sp.topn > 0) {
    const sinir = deg(ix[Math.min(sp.topn, ix.length) - 1]);
    ix = ix.filter((k, n) => n < sp.topn || esit(deg(k), sinir));
    if (s === 'etiket') ix.sort((a, b) => X.sortCompare ? X.sortCompare(keys[a], keys[b]) : String(keys[a]).localeCompare(String(keys[b]), 'tr'));
  }
  return ix;
}
function ciz(sp, d, W) {
  W = W || 460;
  const fmt0 = d.ad ? C.fmtOf(d.ad) : d.series && d.series[0] ? C.fmtOf(d.series[0].name) : null;
  if (d.kart) return V.card(d.deger, d.ad, C.fmtOf(d.ad));
  const cats = d.cats.map(kat);
  const ser = d.series.concat((d.hesap || []).map(h => ({ name: h.name, vals: h.vals, type: sp.tur === 'sutun' || sp.tur === 'cubuk' ? 'line' : undefined })));
  if (sp.tur === 'tablo' || sp.tur === 'matris') {
    const cols = [ad(sp.eksen).replace(/^.*\[|\]$/g, '')].concat(ser.map(s => s.name)).concat(d.gosterge ? ['Toplam'] : []);
    const rows = cats.map((c, i) => [c].concat(ser.map(s => s.vals[i])).concat(d.gosterge ? [d.toplam[i]] : []));
    const tot = ['Toplam'].concat(d.gosterge ? d.series.map(s => s.vals.reduce((a, b) => a + (b || 0), 0)).concat([d.genel]) : (d.total || []).concat((d.hesap || []).map(h => h.total)));
    return V.table(cols, rows.concat([tot]), { fmts: [null].concat(ser.map(s => C.fmtOf(s.name))).concat(d.gosterge ? [fmt0] : []), short: false });
  }
  const dd = { cats, series: ser, fmt: fmt0 };
  if (sp.tur === 'halka') return V.donut({ cats, vals: ser[0].vals, fmt: fmt0 }, { W });
  if (sp.tur === 'cubuk') return V.bar(dd, { W });
  if (sp.tur === 'cizgi') return V.line(dd, { W, padL: 66 });
  if (sp.tur === 'alan') return V.area ? V.area(dd, { W, padL: 66 }) : V.line(dd, { W, padL: 66 });
  return V.column(dd, { W, padL: 66, stacked: sp.tur === 'yigin' });
}
function gorselDenetle(e, sp) {
  let o, c;
  try { o = gorselVerisi(sp); } catch (err) { return { ok: false, msg: err.message }; }
  c = gorselVerisi(e.sol);
  const turler = (e.kural && e.kural.turler) || [e.sol.tur];
  if (!sp.tur) return { ok: false, msg: 'Önce görsel türünü seç.' };
  if (!turler.includes(sp.tur)) return { ok: false, msg: (e.kural && e.kural.turNeden) || ('Bu soru için ' + TURLER[sp.tur] + ' uygun değil; ' + turler.map(t => TURLER[t]).join(' ya da ') + ' dene.') };
  if (c.kart) return o.kart && esit(o.deger, c.deger) ? { ok: true } : { ok: false, msg: o.kart ? 'Kartın değeri beklenenden farklı: ölçüyü ve filtreyi kontrol et.' : 'Tek bir sayı isteniyor: Kart görseli.' };
  if (o.cats.length !== c.cats.length) return { ok: false, msg: 'Görselde ' + o.cats.length + ' kategori var, ' + c.cats.length + ' bekleniyor. ' + (sp.eksen !== e.sol.eksen ? 'Eksendeki alanı kontrol et.' : (e.sol.topn ? 'İlk N filtresini kontrol et.' : 'Görsel düzeyindeki filtreyi kontrol et.')) };
  const kumeO = o.cats.map(X.keyOf).slice().sort().join('|'), kumeC = c.cats.map(X.keyOf).slice().sort().join('|');
  if (kumeO !== kumeC) return { ok: false, msg: 'Kategoriler farklı. Eksendeki alanı ya da filtreyi kontrol et.' };
  const sirali = e.kural && e.kural.sirali !== undefined ? e.kural.sirali : (e.sol.sirala && e.sol.sirala !== 'etiket');
  if (sirali && o.cats.map(X.keyOf).join('|') !== c.cats.map(X.keyOf).join('|')) return { ok: false, msg: 'Kategoriler doğru ama sıra farklı. ' + (e.sol.sirala === 'azalan' ? 'Değere göre büyükten küçüğe sırala.' : 'Sıralamayı kontrol et.') };
  const harita = d => { const m = new Map(); d.cats.forEach((k, i) => m.set(X.keyOf(k), i)); return m; };
  const ho = harita(o), hc = harita(c);
  const sO = o.series.concat(o.hesap), sC = c.series.concat(c.hesap);
  if (sO.length < sC.length) return { ok: false, msg: 'Görselde ' + sO.length + ' değer sütunu var, ' + sC.length + ' bekleniyor.' + (c.hesap.length && !o.hesap.length ? ' Görsel hesaplama ekle.' : '') };
  for (const sc of sC) {
    const so = sO.find(s => c.cats.every(k => esit(s.vals[ho.get(X.keyOf(k))], sc.vals[hc.get(X.keyOf(k))])));
    if (!so) return { ok: false, msg: c.hesap.includes(sc) ? 'Görsel hesaplamanın sonucu beklenenden farklı. İfadeyi ve sıralamayı kontrol et.' : '“' + sc.name + '” değerleri görselde yok ya da farklı. Ölçüyü, filtreyi ve göstergeyi kontrol et.' };
  }
  return { ok: true };
}

/* ---------------------------------------------------------------- görsel arayüzü */
const ST = {};
function bos() { return { tur: '', eksen: null, gosterge: null, degerler: [], filtre: { alan: null, degerler: [] }, sirala: 'etiket', topn: 0, hesap: [] }; }
function gorselView(e, k) {
  const solved = P.ex[k];
  return '<div class="panel brief"><div class="row" style="justify-content:space-between"><span class="eyebrow">Görsel kurma' + (e.sol.hesap && e.sol.hesap.length ? ' · görsel hesaplama' : '') + (solved ? ' · çözüldü' : '') + '</span><span class="chip">Anadolu Market</span></div><div class="q">' + e.q + '</div>'
    + '<div class="row" style="gap:8px"><button class="btn sm" data-act="hint">İpucu</button></div><div id="hintBox"></div></div><div class="panel gvwrap" id="gvHost"></div>';
}
function secim(id, etiket, deger, ops, bosAd) {
  return '<label class="gvf"><span>' + esc(etiket) + '</span><select data-gv="' + id + '">' + (bosAd != null ? '<option value="">' + esc(bosAd) + '</option>' : '') + ops.map(([v, a]) => '<option value="' + esc(v) + '"' + (v === deger ? ' selected' : '') + '>' + esc(a) + '</option>').join('') + '</select></label>';
}
function filtreDegerleri(alan) {
  const p = pc(alan); if (!p) return [];
  const T = MODEL.tables[p.t]; const i = T.cols.indexOf(p.c); const set = new Map();
  T.rows.forEach(r => { const v = Array.isArray(r) ? r[i] : r[p.c]; if (v != null && !set.has(X.keyOf(v))) set.set(X.keyOf(v), v); });
  return [...set.values()].sort((a, b) => (X.sortCompare ? X.sortCompare(a, b) : String(a).localeCompare(String(b), 'tr'))).slice(0, 60);
}
function gorselPaint(k) {
  const s = ST[k], sp = s.sp, e = s.e, host = $('#gvHost'); if (!host) return;
  const A = alanlar().map(a => [a, a]), O = OLCULER().map(m => [m, m]);
  const tabloMu = sp.tur === 'tablo' || sp.tur === 'matris';
  let h = '<div class="gvgrid"><div class="gvpane">';
  h += secim('tur', 'Görsel türü', sp.tur, Object.entries(TURLER), '— tür seç —');
  h += '<p class="muted gvne">' + esc(TUR_NE[sp.tur]) + '</p>';
  if (sp.tur !== 'kart') h += secim('eksen', tabloMu ? 'Satırlar' : 'Eksen (X)', sp.eksen, A, '— alan seç —');
  if (['sutun', 'cubuk', 'yigin', 'cizgi', 'alan', 'matris'].includes(sp.tur)) h += secim('gosterge', sp.tur === 'matris' ? 'Sütunlar' : 'Gösterge', sp.gosterge, A, '— yok —');
  const n = Math.max(1, sp.degerler.length + (sp.degerler.length < 3 && !sp.gosterge && sp.tur !== 'kart' && sp.tur !== 'halka' ? 1 : 0));
  for (let i = 0; i < n; i++) h += secim('deger' + i, i ? 'Değerler (' + (i + 1) + ')' : 'Değerler', sp.degerler[i] || '', O, i ? '— ekleme —' : '— ölçü seç —');
  h += '<details class="gvmore"' + (sp.filtre.alan || sp.topn || sp.sirala !== 'etiket' || sp.hesap.length ? ' open' : '') + '><summary>Filtre, sıralama, görsel hesaplama</summary>';
  h += secim('falan', 'Bu görselde filtre', sp.filtre.alan, A, '— yok —');
  if (sp.filtre.alan) h += '<div class="gvchips" role="group" aria-label="Filtre değerleri">' + filtreDegerleri(sp.filtre.alan).map(v => { const on = sp.filtre.degerler.some(x => X.keyOf(x) === X.keyOf(v)); return '<button type="button" class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-gvf="' + esc(JSON.stringify(v instanceof Date ? { d: +v } : v)) + '">' + esc(kat(v)) + '</button>'; }).join('') + '</div>';
  if (sp.tur !== 'kart') {
    h += secim('sirala', 'Sırala', sp.sirala, [['etiket', 'Eksene göre (varsayılan)'], ['azalan', 'Değere göre: büyükten küçüğe'], ['artan', 'Değere göre: küçükten büyüğe']]);
    h += secim('topn', 'İlk N (görsel filtresi)', String(sp.topn || ''), [['3', 'İlk 3'], ['5', 'İlk 5'], ['10', 'İlk 10']], '— yok —');
    if (!sp.gosterge) h += '<label class="gvf"><span>Görsel hesaplama</span><input class="input" data-gv="hesap" placeholder="Kümülatif = RUNNINGSUM([Net Satış])" value="' + esc(sp.hesap[0] ? (sp.hesap[0].ad + ' = ' + sp.hesap[0].ifade) : '') + '"></label>';
  }
  h += '</details><div class="row" style="gap:8px;margin-top:10px"><button class="btn primary" data-gvact="kontrol">Kontrol et</button><button class="btn sm" data-gvact="sifirla">Temizle</button></div></div>';
  let cizim = '', hata = '';
  try { const d = gorselVerisi(sp); cizim = ciz(sp, d, 460); } catch (err) { hata = '<div class="msg info"><b>Görsel boş</b>' + esc(err.message) + '</div>'; }
  h += '<div class="gvcanvas" aria-live="polite">' + (hata || cizim) + '</div></div>';
  if (s.res) h += s.res;
  host.innerHTML = h;
  if (V.bindTips) try { V.bindTips(host); } catch (err) { /* araç ipucu isteğe bağlı */ }
}
function gorselMount(e, k, onSolved) {
  const kayit = P.gv && P.gv[k];
  ST[k] = { e, k, onSolved, sp: kayit ? Object.assign(bos(), JSON.parse(JSON.stringify(kayit))) : Object.assign(bos(), e.start || {}), res: null };
  if (P.ex[k] && kayit) { const c = gorselDenetle(e, ST[k].sp); if (c.ok) ST[k].res = '<div class="msg ok"><b>Çözüldü.</b>Kayıtlı görselin beklenen sonucu veriyor.</div>'; }
  AKTIF = k; gorselPaint(k);
}
let AKTIF = null;
function kaydet(k) { P.gv = P.gv || {}; P.gv[k] = ST[k].sp; C.save(); }
document.addEventListener('change', ev => {
  const el = ev.target.closest('[data-gv]'); if (!el || !AKTIF || !ST[AKTIF]) return;
  const s = ST[AKTIF], sp = s.sp, id = el.dataset.gv, v = el.value || null; s.res = null;
  if (id === 'tur') { sp.tur = v; if (sp.tur === 'kart' || sp.tur === 'halka') { sp.degerler = sp.degerler.slice(0, 1); sp.gosterge = null; } if (!['sutun', 'cubuk', 'yigin', 'cizgi', 'alan', 'matris'].includes(sp.tur)) sp.gosterge = null; }
  else if (id === 'eksen') sp.eksen = v;
  else if (id === 'gosterge') { sp.gosterge = v; if (v) { sp.degerler = sp.degerler.slice(0, 1); sp.hesap = []; } }
  else if (/^deger\d$/.test(id)) { const i = +id.slice(5); if (v) sp.degerler[i] = v; else sp.degerler.splice(i, 1); sp.degerler = sp.degerler.filter(Boolean); }
  else if (id === 'falan') sp.filtre = { alan: v, degerler: [] };
  else if (id === 'sirala') sp.sirala = v || 'etiket';
  else if (id === 'topn') sp.topn = v ? +v : 0;
  else if (id === 'hesap') { const m = /^\s*([^=]+?)\s*=\s*(.+)$/.exec(el.value || ''); sp.hesap = el.value.trim() ? [{ ad: m ? m[1] : 'Hesap', ifade: m ? m[2] : el.value }] : []; }
  kaydet(AKTIF); gorselPaint(AKTIF);
});
document.addEventListener('click', ev => {
  const f = ev.target.closest('[data-gvf]'), a = ev.target.closest('[data-gvact]');
  if (!AKTIF || !ST[AKTIF] || (!f && !a)) return;
  const s = ST[AKTIF], sp = s.sp;
  if (f) { let v = JSON.parse(f.dataset.gvf); if (v && v.d) v = new Date(v.d); const i = sp.filtre.degerler.findIndex(x => X.keyOf(x) === X.keyOf(v)); if (i >= 0) sp.filtre.degerler.splice(i, 1); else sp.filtre.degerler.push(v); s.res = null; kaydet(AKTIF); gorselPaint(AKTIF); return; }
  if (a.dataset.gvact === 'sifirla') { s.sp = Object.assign(bos(), s.e.start || {}); s.res = null; kaydet(AKTIF); gorselPaint(AKTIF); return; }
  if (a.dataset.gvact === 'kontrol') {
    const c = gorselDenetle(s.e, sp);
    s.res = c.ok ? '<div class="msg ok"><b>Doğru!</b>' + esc(s.e.ok || 'Görsel beklenen veriyi ve türü gösteriyor.') + '</div>' : '<div class="msg err"><b>Henüz değil</b>' + esc(c.msg) + '</div>';
    gorselPaint(AKTIF); if (c.ok) s.onSolved(); else if (C.noteWrong) C.noteWrong(C.curX());
  }
});

/* ---------------------------------------------------------------- model kurma */
const KARD = [['*:1', 'Çoka bir (*:1)'], ['1:1', 'Bire bir (1:1)'], ['*:*', 'Çoka çok (*:*)']];
const YON = [['tek', 'Tek yönlü'], ['cift', 'Çift yönlü']];
const anahtar = r => r.from + '[' + r.fromCol + ']→' + r.to + '[' + r.toCol + ']';
function normal(r) {
  // 1 tarafı her zaman "to": öğrenci ters seçtiyse çevrilip kardinalite hatası ayrıca bildirilir
  return { from: r.from, fromCol: r.fromCol, to: r.to, toCol: r.toCol, kard: r.kard || '*:1', yon: r.yon || 'tek', aktif: r.aktif !== false };
}
function modelDenetle(e, rels) {
  const sol = e.sol.map(normal), mine = rels.map(normal);
  const ayni = (a, b) => a.from === b.from && a.fromCol === b.fromCol && a.to === b.to && a.toCol === b.toCol;
  const ters = (a, b) => a.from === b.to && a.fromCol === b.toCol && a.to === b.from && a.toCol === b.fromCol;
  for (const s of sol) {
    const m = mine.find(x => ayni(x, s)), t = mine.find(x => ters(x, s));
    if (!m && t) return { ok: false, msg: 'İlişki ters kurulmuş: çok tarafı ' + s.from + '[' + s.fromCol + '], bir tarafı ' + s.to + '[' + s.toCol + ']. Olgu tablosu (her satır bir işlem) çok tarafıdır.' };
    if (!m) return { ok: false, msg: s.from + ' ile ' + s.to + ' arasında ilişki eksik. ' + (e.eksikNeden || ('Bu ilişki olmadan ' + s.to + ' alanıyla kırılan görselde her satırda aynı toplam görünür.')) };
    if (m.kard !== s.kard) return { ok: false, msg: s.from + '–' + s.to + ' ilişkisinde kardinalite ' + m.kard + ' değil, ' + s.kard + ' olmalı. ' + (s.kard === '*:1' ? s.to + '[' + s.toCol + '] her değeri bir kez içerir; ' + s.from + ' tarafında aynı değer birçok kez geçer.' : '') };
    if (m.yon !== s.yon) return { ok: false, msg: s.yon === 'tek' ? s.from + '–' + s.to + ' ilişkisinde çift yönlü filtre gereksiz: filtre bir tarafından çok tarafına akar. Çift yön, belirsiz yollar ve yavaşlık yaratır; yalnız gerçekten gerekiyorsa açılır.' : s.from + '–' + s.to + ' ilişkisinin çift yönlü olması gerekiyor: ' + (e.ciftNeden || 'filtre çok tarafından bir tarafına da akmalı.') };
    if (m.aktif !== s.aktif) return { ok: false, msg: s.aktif ? s.from + '[' + s.fromCol + '] ilişkisi etkin olmalı.' : s.from + '[' + s.fromCol + ']–' + s.to + ' ilişkisi pasif olmalı: iki tablo arasında aynı anda yalnız bir etkin yol olabilir. Pasif ilişki ölçüde USERELATIONSHIP ile açılır.' };
  }
  const fazla = mine.filter(x => !sol.some(s => ayni(x, s) || ters(x, s)));
  if (fazla.length) return { ok: false, msg: 'Fazladan ilişki: ' + anahtar(fazla[0]) + '. ' + (e.fazlaNeden || 'Bu sütunlar aynı şeyi göstermiyor ya da ilişki gereksiz.') };
  // aynı iki tablo arasında iki etkin ilişki
  const cift = mine.filter(x => x.aktif).map(x => [x.from, x.to].sort().join('|')); if (new Set(cift).size !== cift.length) return { ok: false, msg: 'İki tablo arasında birden çok etkin ilişki var; yalnız biri etkin olabilir.' };
  return { ok: true };
}
function modelOnizle(e, rels) {
  if (!e.kontrol || !window.PBI_CREATE_DAX) return '';
  try {
    if (rels.some(r => (r.kard || '*:1') === '*:*')) return '<p class="muted">Önizleme çoka çok ilişkide gösterilmiyor.</p>';
    const model = Object.assign({}, MODEL, { rels: rels.map(r => ({ from: r.from, fromCol: r.fromCol, to: r.to, toCol: r.toCol, inactive: r.aktif === false, both: r.yon === 'cift' })) });
    const D = window.PBI_CREATE_DAX(model); const ms = C.measureSet();
    const q = D.query({ rows: [pc(e.kontrol.satir)], measures: ms, values: [e.kontrol.olcu], slicers: [], totals: true });
    const rows = q.rows.slice(0, 8).map(r => [kat(r.keys[0]), r.vals[0]]);
    const ayni = q.rows.length > 1 && q.rows.every(r => r.vals[0] === q.rows[0].vals[0]);
    const not = ayni ? '<div class="msg info"><b>Her satırda aynı değer</b>' + esc(ad(e.kontrol.satir)) + ' filtresi ölçünün tablosuna ulaşmıyor: ilişki yok, ters ya da pasif. Doğru kurulduğunda her satır kendi değerini gösterir.</div>' : '';
    return '<div class="gvprev">' + not + '<b>Bu modelle: ' + esc(e.kontrol.olcu) + ' / ' + esc(ad(e.kontrol.satir)) + '</b>' + V.table([pc(e.kontrol.satir).c, e.kontrol.olcu], rows.concat([['Toplam', q.total ? q.total[0] : null]]), { fmts: [null, C.fmtOf(e.kontrol.olcu)] }) + (q.rows.length > 8 ? '<small class="muted">İlk 8 satır</small>' : '') + '</div>';
  } catch (err) { return '<p class="muted">Önizleme hesaplanamadı: ' + esc(err.message) + '</p>'; }
}
const MS = {};
function modelView(e, k) {
  return '<div class="panel brief"><div class="row" style="justify-content:space-between"><span class="eyebrow">Model kurma' + (P.ex[k] ? ' · çözüldü' : '') + '</span><span class="chip">' + e.tablolar.length + ' tablo</span></div><div class="q">' + e.q + '</div>'
    + '<div class="row" style="gap:8px"><button class="btn sm" data-act="hint">İpucu</button></div><div id="hintBox"></div></div><div class="panel gvwrap" id="mdHost"></div>';
}
function modelPaint(k) {
  const s = MS[k], e = s.e, host = $('#mdHost'); if (!host) return;
  const T = e.tablolar;
  let h = '<div class="mdtables">' + T.map(t => '<div class="mdtable"><b>' + esc(t) + '</b><small>' + esc(MODEL.tables[t].kind === 'fact' ? 'olgu' : 'boyut') + ' · ' + MODEL.tables[t].rows.length + ' satır</small><ul>' + MODEL.tables[t].cols.slice(0, 9).map(c => '<li>' + esc(c) + '</li>').join('') + (MODEL.tables[t].cols.length > 9 ? '<li class="muted">…</li>' : '') + '</ul></div>').join('') + '</div>';
  h += '<h4 class="mdh">İlişkiler (' + s.rels.length + ')</h4><ul class="mdrels">' + (s.rels.length ? s.rels.map((r, i) => '<li><code>' + esc(r.from + '[' + r.fromCol + ']') + '</code> ' + (r.kard || '*:1').replace(':', ' → ') + ' <code>' + esc(r.to + '[' + r.toCol + ']') + '</code> <span class="chip">' + (r.yon === 'cift' ? 'çift yönlü' : 'tek yönlü') + '</span>' + (r.aktif === false ? ' <span class="chip">pasif</span>' : '') + ' <button class="btn sm" data-mdsil="' + i + '" aria-label="İlişkiyi sil">Sil</button></li>').join('') : '<li class="muted">Henüz ilişki yok.</li>') + '</ul>';
  const colOps = t => t ? MODEL.tables[t].cols.map(c => [c, c]) : [];
  const f = s.form;
  h += '<div class="mdform"><b>İlişki ekle</b><div class="gvrow">' + secim('mdFrom', 'Tablo (çok tarafı)', f.from, T.map(t => [t, t]), '—') + secim('mdFromCol', 'Sütun', f.fromCol, colOps(f.from), '—') + '</div>'
    + '<div class="gvrow">' + secim('mdTo', 'Tablo (bir tarafı)', f.to, T.map(t => [t, t]), '—') + secim('mdToCol', 'Sütun', f.toCol, colOps(f.to), '—') + '</div>'
    + '<div class="gvrow">' + secim('mdKard', 'Kardinalite', f.kard, KARD) + secim('mdYon', 'Çapraz filtre yönü', f.yon, YON) + '<label class="gvf cb"><input type="checkbox" data-gv="mdAktif"' + (f.aktif ? ' checked' : '') + '> Bu ilişkiyi etkin yap</label></div>'
    + '<div class="row" style="gap:8px"><button class="btn sm" data-mdact="ekle">İlişkiyi ekle</button><button class="btn primary" data-mdact="kontrol">Kontrol et</button></div></div>';
  h += modelOnizle(e, s.rels);
  if (s.res) h += s.res;
  host.innerHTML = h;
}
function modelMount(e, k, onSolved) {
  const kayit = P.md && P.md[k];
  MS[k] = { e, k, onSolved, rels: kayit ? kayit.map(r => Object.assign({}, r)) : (e.baslangic || []).map(r => Object.assign({}, r)), form: { from: null, fromCol: null, to: null, toCol: null, kard: '*:1', yon: 'tek', aktif: true }, res: null };
  if (P.ex[k] && kayit && modelDenetle(e, kayit).ok) MS[k].res = '<div class="msg ok"><b>Çözüldü.</b>Kayıtlı model doğru.</div>';
  MAKTIF = k; modelPaint(k);
}
let MAKTIF = null;
document.addEventListener('change', ev => {
  const el = ev.target.closest('[data-gv^="md"]'); if (!el || !MAKTIF || !MS[MAKTIF]) return;
  const f = MS[MAKTIF].form, id = el.dataset.gv;
  if (id === 'mdFrom') { f.from = el.value || null; f.fromCol = null; }
  if (id === 'mdFromCol') f.fromCol = el.value || null;
  if (id === 'mdTo') { f.to = el.value || null; f.toCol = null; }
  if (id === 'mdToCol') f.toCol = el.value || null;
  if (id === 'mdKard') f.kard = el.value;
  if (id === 'mdYon') f.yon = el.value;
  if (id === 'mdAktif') f.aktif = el.checked;
  // aynı adlı sütunu öner (Power BI otomatik algılama gibi)
  if ((id === 'mdTo' || id === 'mdFromCol') && f.from && f.to && f.fromCol && !f.toCol && MODEL.tables[f.to].cols.includes(f.fromCol)) f.toCol = f.fromCol;
  modelPaint(MAKTIF);
}, true);
document.addEventListener('click', ev => {
  const a = ev.target.closest('[data-mdact],[data-mdsil]'); if (!a || !MAKTIF || !MS[MAKTIF]) return;
  const s = MS[MAKTIF]; s.res = null;
  if (a.dataset.mdsil != null) { s.rels.splice(+a.dataset.mdsil, 1); }
  else if (a.dataset.mdact === 'ekle') {
    const f = s.form;
    if (!f.from || !f.fromCol || !f.to || !f.toCol) { s.res = '<div class="msg info"><b>Eksik</b>İki tabloyu ve sütunlarını seç.</div>'; modelPaint(MAKTIF); return; }
    if (f.from === f.to) { s.res = '<div class="msg err"><b>Aynı tablo</b>İlişki iki farklı tablo arasında kurulur.</div>'; modelPaint(MAKTIF); return; }
    s.rels.push({ from: f.from, fromCol: f.fromCol, to: f.to, toCol: f.toCol, kard: f.kard, yon: f.yon, aktif: f.aktif });
    s.form = { from: null, fromCol: null, to: null, toCol: null, kard: '*:1', yon: 'tek', aktif: true };
  } else if (a.dataset.mdact === 'kontrol') {
    const c = modelDenetle(s.e, s.rels);
    s.res = c.ok ? '<div class="msg ok"><b>Doğru!</b>' + esc(s.e.ok || 'Model beklenen ilişkileri doğru ayarlarla içeriyor.') + '</div>' : '<div class="msg err"><b>Henüz değil</b>' + esc(c.msg) + '</div>';
    if (c.ok) s.onSolved(); else if (C.noteWrong) C.noteWrong(C.curX());
  }
  P.md = P.md || {}; P.md[MAKTIF] = s.rels; C.save(); modelPaint(MAKTIF);
});

/* ---------------------------------------------------------------- ipuçları */
function ipuclari(e) {
  if (e.t === 'model') {
    const s = e.sol.map(normal);
    return [e.hint ? esc(e.hint) : 'Önce olgu tablosunu bul: her satırı bir işlem olan tablo. İlişkilerin çok tarafı odur.', 'Kurulacak ilişki sayısı: ' + s.length + '. Sütunlar: ' + s.map(r => '<code>' + esc(r.from + '[' + r.fromCol + ']') + '</code> ↔ <code>' + esc(r.to + '[' + r.toCol + ']') + '</code>').join(', ') + '.', 'Ayarlar: ' + s.map(r => r.kard + (r.yon === 'cift' ? ', çift yönlü' : ', tek yönlü') + (r.aktif ? '' : ', pasif')).join(' · ')];
  }
  const sp = e.sol;
  const out = [e.hint ? esc(e.hint) : 'Soru hangi sayıyı, neye göre kırılmış olarak istiyor? Sayı Değerler kutusuna, kırılım Eksen ya da Satırlar kutusuna gider.'];
  out.push('Görsel türü: <b>' + esc(((e.kural && e.kural.turler) || [sp.tur]).map(t => TURLER[t]).join(' ya da ')) + '</b>.' + (sp.eksen ? ' Eksen: <code>' + esc(sp.eksen) + '</code>.' : '') + (sp.gosterge ? ' Gösterge: <code>' + esc(sp.gosterge) + '</code>.' : ''));
  out.push('Değerler: ' + sp.degerler.map(d => '<code>' + esc(d) + '</code>').join(', ') + (sp.filtre && sp.filtre.alan ? '. Filtre: <code>' + esc(sp.filtre.alan) + '</code> = ' + esc(sp.filtre.degerler.map(kat).join(', ')) : '') + (sp.sirala && sp.sirala !== 'etiket' ? '. Sırala: ' + (sp.sirala === 'azalan' ? 'büyükten küçüğe' : 'küçükten büyüğe') : '') + (sp.topn ? '. İlk ' + sp.topn : '') + (sp.hesap && sp.hesap[0] ? '. Görsel hesaplama: <code>' + esc(sp.hesap[0].ad + ' = ' + sp.hesap[0].ifade) + '</code>' : '') + '.');
  return out;
}

window.PBI_GV = { gorselView, gorselMount, modelView, modelMount, gorselVerisi, gorselDenetle, modelDenetle, vcParse, vcEval, ipuclari, TURLER };
})();
