/* Kesit Power BI — tarayıcıda çalışan DAX motoru (öğretim amaçlı alt küme)
   Filtre bağlamı, satır bağlamı, bağlam geçişi, CALCULATE, zaman zekâsı, tablo fonksiyonları, EVALUATE. */
(function (root) {
  'use strict';
  const M = root.PBI_MODEL;
  const T = M.tables;
  const TNAMES = Object.keys(T);
  const TLOW = {}; TNAMES.forEach(n => TLOW[n.toLowerCase()] = n);
  const hasCol = (t, c) => T[t] && T[t].cols.includes(c);
  const colOf = (t, c) => { const tt = T[t]; if (!tt) return null; const f = tt.cols.find(x => x.toLowerCase() === c.toLowerCase()); return f || null; };

  class DaxError extends Error { constructor(msg) { super(msg); this.dax = true; } }
  const err = m => { throw new DaxError(m); };


  /* Bağımsız değişken sayısı: [en az, en çok] (Infinity = sınırsız). Gerçek DAX fazla bağımsız değişkeni hata sayar; burada da ayrıştırırken yakalanır. */
  const INF = Infinity;
  const ARITY = {
    SUM: [1, 1], AVERAGE: [1, 1], MIN: [1, 2], MAX: [1, 2], MEDIAN: [1, 1], 'STDEV.S': [1, 1], 'STDEV.P': [1, 1], 'VAR.S': [1, 1], 'VAR.P': [1, 1], GEOMEAN: [1, 1],
    COUNT: [1, 1], COUNTA: [1, 1], COUNTBLANK: [1, 1], COUNTROWS: [0, 1], DISTINCTCOUNT: [1, 1], DISTINCTCOUNTNOBLANK: [1, 1],
    SUMX: [2, 2], AVERAGEX: [2, 2], MINX: [2, 3], MAXX: [2, 3], COUNTX: [2, 2], COUNTAX: [2, 2], MEDIANX: [2, 2], PRODUCTX: [2, 2], CONCATENATEX: [2, INF], 'VARX.S': [2, 2], 'VARX.P': [2, 2], 'STDEVX.S': [2, 2], 'STDEVX.P': [2, 2], 'PERCENTILE.INC': [2, 2], 'PERCENTILEX.INC': [3, 3],
    CALCULATE: [1, INF], CALCULATETABLE: [1, INF], FILTER: [2, 2], ALL: [0, INF], REMOVEFILTERS: [0, INF], ALLNOBLANKROW: [1, INF], ALLSELECTED: [0, INF], ALLEXCEPT: [2, INF], ALLCROSSFILTERED: [1, 1], KEEPFILTERS: [1, 1], USERELATIONSHIP: [2, 2], CROSSFILTER: [3, 3],
    VALUES: [1, 1], DISTINCT: [1, 1], SELECTEDVALUE: [1, 2], HASONEVALUE: [1, 1], HASONEFILTER: [1, 1], ISFILTERED: [1, 1], ISCROSSFILTERED: [1, 1], ISINSCOPE: [1, 1], RELATED: [1, 1], RELATEDTABLE: [1, 1], LOOKUPVALUE: [3, INF], EARLIER: [1, 2],
    TOPN: [2, INF], RANKX: [2, 5], ADDCOLUMNS: [3, INF], SELECTCOLUMNS: [1, INF], GROUPBY: [1, INF], CURRENTGROUP: [0, 0], SUMMARIZE: [1, INF], SUMMARIZECOLUMNS: [1, INF], ROW: [2, INF], GENERATESERIES: [2, 3], CALENDAR: [2, 2], CALENDARAUTO: [0, 1], UNION: [2, INF], CROSSJOIN: [2, INF], EXCEPT: [2, 2], INTERSECT: [2, 2], GENERATE: [2, 2], NATURALINNERJOIN: [2, 2], TREATAS: [2, INF], CONTAINS: [3, INF], ISEMPTY: [1, 1], DATATABLE: [3, INF],
    IF: [2, 3], 'IF.EAGER': [2, 3], SWITCH: [3, INF], AND: [2, 2], OR: [2, 2], NOT: [1, 1], TRUE: [0, 0], FALSE: [0, 0], BLANK: [0, 0], ISBLANK: [1, 1], ISNUMBER: [1, 1], ISTEXT: [1, 1], ISERROR: [1, 1], ERROR: [1, 1], IFERROR: [2, 2], COALESCE: [2, INF], CONTAINSSTRING: [2, 2], USERPRINCIPALNAME: [0, 0], USERNAME: [0, 0],
    DIVIDE: [2, 3], ROUND: [2, 2], ROUNDUP: [2, 2], ROUNDDOWN: [2, 2], TRUNC: [1, 2], INT: [1, 1], ABS: [1, 1], SQRT: [1, 1], EXP: [1, 1], LN: [1, 1], LOG: [1, 2], SIGN: [1, 1], MOD: [2, 2], POWER: [2, 2], QUOTIENT: [2, 2], EVEN: [1, 1], ODD: [1, 1], CEILING: [2, 2], FLOOR: [2, 2], MROUND: [2, 2], PI: [0, 0], RAND: [0, 0], FV: [3, 5], PV: [3, 5], PMT: [3, 5], XNPV: [4, 4], XIRR: [3, 5],
    VALUE: [1, 1], FORMAT: [2, 3], CONCATENATE: [2, 2], LEFT: [1, 2], RIGHT: [1, 2], MID: [3, 3], LEN: [1, 1], UPPER: [1, 1], LOWER: [1, 1], TRIM: [1, 1], SUBSTITUTE: [3, 4], SEARCH: [2, 4], FIND: [2, 4], REPLACE: [4, 4], UNICHAR: [1, 1], REPT: [2, 2], COMBINEVALUES: [2, INF], CONVERT: [2, 2],
    DATE: [3, 3], TODAY: [0, 0], NOW: [0, 0], YEAR: [1, 1], MONTH: [1, 1], DAY: [1, 1], QUARTER: [1, 1], WEEKDAY: [1, 2], WEEKNUM: [1, 2], EOMONTH: [2, 2], EDATE: [2, 2], HOUR: [1, 1], MINUTE: [1, 1], SECOND: [1, 1], DATEDIFF: [3, 3], DATEVALUE: [1, 1], NETWORKDAYS: [2, 4],
    DATESYTD: [1, 2], DATESQTD: [1, 1], DATESMTD: [1, 1], TOTALYTD: [2, 4], TOTALQTD: [2, 3], TOTALMTD: [2, 3], DATEADD: [3, 5], SAMEPERIODLASTYEAR: [1, 1], PARALLELPERIOD: [3, 3], PREVIOUSMONTH: [1, 1], PREVIOUSQUARTER: [1, 1], PREVIOUSYEAR: [1, 2], PREVIOUSDAY: [1, 1], NEXTMONTH: [1, 1], NEXTQUARTER: [1, 1], NEXTYEAR: [1, 2], NEXTDAY: [1, 1], DATESINPERIOD: [4, 4], DATESBETWEEN: [3, 3], FIRSTDATE: [1, 1], LASTDATE: [1, 1], STARTOFMONTH: [1, 1], ENDOFMONTH: [1, 1], STARTOFQUARTER: [1, 1], ENDOFQUARTER: [1, 1], STARTOFYEAR: [1, 2], ENDOFYEAR: [1, 2], CLOSINGBALANCEMONTH: [2, 3], CLOSINGBALANCEQUARTER: [2, 3], CLOSINGBALANCEYEAR: [2, 4], OPENINGBALANCEYEAR: [2, 4],
    LASTNONBLANK: [2, 2], FIRSTNONBLANK: [2, 2], LASTNONBLANKVALUE: [2, 2], FIRSTNONBLANKVALUE: [2, 2], PATH: [2, 2], PATHLENGTH: [1, 1], PATHITEM: [2, 3], PATHITEMREVERSE: [2, 3], PATHCONTAINS: [2, 2],
    ORDERBY: [0, INF], PARTITIONBY: [0, INF], OFFSET: [1, INF], INDEX: [1, INF], WINDOW: [4, INF], RANK: [0, INF], ROWNUMBER: [0, INF], SELECTEDMEASURE: [0, 0]
  };
  const EXCEL_TIP = { AND: ' Üç ya da daha fazla koşul için && kullan (a && b && c).', OR: ' Üç ya da daha fazla koşul için || kullan (a || b || c).', CONCATENATE: ' Daha fazla parça için & kullan ("a" & "b" & "c").', SUM: ' İki sütunu toplamak için SUM(A[x]) + SUM(A[y]) ya da SUMX kullan.', MAX: ' Üç değerin büyüğü için MAX(MAX(a, b), c) yaz.', MIN: ' Üç değerin küçüğü için MIN(MIN(a, b), c) yaz.' };
  function checkArity(fn, n) {
    const r = ARITY[fn]; if (!r) return;
    if (n < r[0]) err(fn + ' en az ' + r[0] + ' bağımsız değişken ister, sen ' + n + ' yazdın.');
    if (n > r[1]) err(fn + ' en çok ' + r[1] + ' bağımsız değişken alır, sen ' + n + ' yazdın.' + (EXCEL_TIP[fn] || ''));
  }

  /* ---------- Değerler ---------- */
  const isBlank = v => v === null || v === undefined;
  const isTable = v => v && typeof v === 'object' && v.kind === 'table';
  const isDate = v => v instanceof Date;
  const keyOf = v => v === null || v === undefined ? '∅' : v instanceof Date ? 'd' + v.getTime() : typeof v === 'number' ? 'n' + v : typeof v === 'boolean' ? 'b' + v : 's' + v;
  const num = v => { if (isBlank(v)) return 0; if (typeof v === 'number') return v; if (typeof v === 'boolean') return v ? 1 : 0; if (isDate(v)) return v.getTime() / 86400000 + 25569; const n = Number(String(v).replace(',', '.')); if (isNaN(n)) err('“' + v + '” metni sayıya çevrilemedi.'); return n; };
  const fromSerial = n => new Date(Math.round((n - 25569) * 86400000));
  const str = v => isBlank(v) ? '' : isDate(v) ? fmtDate(v, 'dd.MM.yyyy') : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : typeof v === 'number' ? String(Math.round(v * 1e10) / 1e10).replace('.', ',') : String(v);
  const truthy = v => { if (isBlank(v)) return false; if (typeof v === 'boolean') return v; if (typeof v === 'number') return v !== 0; if (isDate(v)) return true; if (v === '') return false; err('“' + v + '” metni DOĞRU/YANLIŞ değerine çevrilemiyor. Koşul ifadesi bir karşılaştırma olmalı.'); };
  const dUTC = (y, m, d) => new Date(Date.UTC(y, m, d));
  const AYK = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const AYU = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const p2 = n => String(n).padStart(2, '0');
  function fmtDate(d, f) {
    const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
    return f.replace(/yyyy|yy|MMMM|MMM|MM|M|dddd|ddd|dd|d|q/g, t => ({ yyyy: y, yy: String(y).slice(2), MMMM: AYU[m], MMM: AYK[m], MM: p2(m + 1), M: m + 1, dddd: GUN[d.getUTCDay()], ddd: GUN[d.getUTCDay()].slice(0, 3), dd: p2(day), d: day, q: Math.floor(m / 3) + 1 }[t]));
  }
  function groupTR(intStr) { return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function fmtNum(v, dec, group) { const neg = v < 0; const s = Math.abs(v).toFixed(dec); let [i, f] = s.split('.'); if (group) i = groupTR(i); return (neg ? '-' : '') + i + (f ? ',' + f : ''); }
  function format(v, f) {
    if (isBlank(v)) return '';
    if (isDate(v)) { const named = { 'Short Date': 'dd.MM.yyyy', 'Long Date': 'd MMMM yyyy' }; let g = named[f] || f || 'dd.MM.yyyy'; g = g.replace(/YYYY/g, 'yyyy').replace(/YY/g, 'yy').replace(/DD/g, 'dd'); if (!/[hHs]/.test(g)) g = g.replace(/mmmm/g, 'MMMM').replace(/mmm/g, 'MMM').replace(/mm/g, 'MM').replace(/(^|[^M])m(?!M)/g, '$1M'); g = g.replace(/[Qq]/g, 'q'); return fmtDate(v, g); }
    if (typeof v !== 'number') return String(v);
    if (f && f.includes(';')) { const sec = f.split(';'); if (v < 0 && sec[1] !== undefined) return format(-v, sec[1]); if (v === 0 && sec[2] !== undefined) return format(v, sec[2]); f = sec[0]; }
    const named = { 'Percent': '0.00%', 'Fixed': '0.00', 'Standard': '#,0.00', 'General Number': 'G', 'Currency': '#,0.00 ₺' };
    f = named[f] || f;
    if (f === 'G') return str(v);
    const m = f.match(/^([^0#]*)([#,]*0*)(?:\.(0+))?(%?)(.*)$/);
    if (!m) return str(v);
    const pct = m[4] === '%'; const dec = m[3] ? m[3].length : 0; const group = m[2].includes(',');
    const zi = (m[2].match(/0/g) || []).length; let out = fmtNum(pct ? v * 100 : v, dec, group); if (zi > 1 && !group) { const neg = out[0] === '-'; let b = neg ? out.slice(1) : out; const k = b.indexOf(','); let ip = k < 0 ? b : b.slice(0, k); const fp = k < 0 ? '' : b.slice(k); if (ip.length < zi) ip = ip.padStart(zi, '0'); out = (neg ? '-' : '') + ip + fp; }
    return m[1] + out + (pct ? '%' : '') + m[5];
  }

  /* ---------- Sözcük çözümleyici ---------- */
  function tokenize(src) {
    const out = []; let i = 0; const n = src.length;
    const push = (type, value, s) => out.push({ type, value, pos: s });
    while (i < n) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if ((c === '/' && src[i + 1] === '/') || (c === '-' && src[i + 1] === '-')) { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
      const s = i;
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1]))) { let j = i; while (j < n && /[0-9.]/.test(src[j])) j++; if (/[eE]/.test(src[j]) && /[-+0-9]/.test(src[j + 1])) { j += 2; while (j < n && /[0-9]/.test(src[j])) j++; } push('num', parseFloat(src.slice(i, j)), s); i = j; continue; }
      if (c === '"') { let j = i + 1, v = ''; for (;;) { if (j >= n) err('Kapanmamış metin: tırnak işaretini (") kapatmayı unutma.'); if (src[j] === '"') { if (src[j + 1] === '"') { v += '"'; j += 2; continue; } break; } v += src[j++]; } push('str', v, s); i = j + 1; continue; }
      if (c === '“' || c === '”') err('Kıvrık tırnak (“ ”) kullanılmış. DAX\'ta metinler düz çift tırnakla yazılır: "Web"');
      if (c === "'") { const e = src.indexOf("'", i + 1); if (e < 0) err("Kapanmamış tablo adı: tek tırnağı (') kapat."); push('qid', src.slice(i + 1, e), s); i = e + 1; continue; }
      if (c === '[') { const e = src.indexOf(']', i + 1); if (e < 0) err('Kapanmamış köşeli parantez: ] eksik.'); push('br', src.slice(i + 1, e), s); i = e + 1; continue; }
      if (/[A-Za-z_À-￿]/.test(c)) { let j = i; while (j < n && /[A-Za-z0-9_.À-￿]/.test(src[j])) j++; push('id', src.slice(i, j), s); i = j; continue; }
      const two = src.slice(i, i + 2);
      if (['<=', '>=', '<>', '==', '&&', '||', ':='].includes(two)) { push('op', two, s); i += 2; continue; }
      if ('+-*/^&=<>(),{};'.includes(c)) { push('op', c, s); i++; continue; }
      err('Beklenmeyen karakter: “' + c + '”');
    }
    push('eof', null, n);
    return out;
  }

  /* ---------- Ayrıştırıcı ---------- */
  function parse(src) {
    const tk = tokenize(src); let p = 0;
    const peek = (o = 0) => tk[p + o];
    const isOp = (v, o = 0) => peek(o).type === 'op' && peek(o).value === v;
    const isKw = (v, o = 0) => peek(o).type === 'id' && peek(o).value.toUpperCase() === v;
    const expect = v => { if (!isOp(v)) err('“' + v + '” bekleniyordu' + near()); p++; };
    const near = () => { const t = peek(); return t.type === 'eof' ? ', ama ifade bitti. Parantezleri kontrol et.' : ', “' + (t.type === 'br' ? '[' + t.value + ']' : t.value) + '” civarında.'; };
    function expr() {
      if (isKw('VAR')) {
        const vars = [];
        while (isKw('VAR')) { p++; const nm = peek(); if (nm.type !== 'id') err('VAR sonrasında değişken adı bekleniyordu.'); p++; expect('='); vars.push([nm.value, expr()]); }
        if (!isKw('RETURN')) err('VAR tanımlarından sonra RETURN gelmeli' + near());
        p++; return { type: 'let', vars, body: expr() };
      }
      return or();
    }
    function bin(next, ops) { return function () { let l = next(); for (;;) { const t = peek(); let op = null; if (t.type === 'op' && ops.includes(t.value)) op = t.value; else if (t.type === 'id' && ops.includes(t.value.toUpperCase())) op = t.value.toUpperCase(); if (!op) return l; p++; const r = next(); l = { type: 'bin', op, l, r }; } }; }
    const pow = () => { let l = unary(); while (isOp('^')) { p++; l = { type: 'bin', op: '^', l, r: unary() }; } return l; };
    function unary() { if (isOp('-')) { p++; return { type: 'neg', e: unary() }; } if (isOp('+')) { p++; return unary(); } return primary(); }
    const mul = bin(pow, ['*', '/']);
    const add = bin(mul, ['+', '-']);
    const cat = bin(add, ['&']);
    const cmp = bin(cat, ['=', '==', '<>', '<', '>', '<=', '>=', 'IN']);
    function notLvl() { if (isKw('NOT')) { p++; return { type: 'call', fn: 'NOT', args: [notLvl()] }; } return cmp(); }
    const and = bin(notLvl, ['&&']);
    const or = bin(and, ['||']);
    function args() { const a = []; expect('('); if (isOp(')')) { p++; return a; } for (;;) { if (isOp(',') || isOp(')')) a.push({ type: 'empty' }); else a.push(expr()); if (isOp(',')) { p++; continue; } expect(')'); return a; } }
    function primary() {
      const t = peek();
      if (t.type === 'num') { p++; return { type: 'lit', v: t.value }; }
      if (t.type === 'str') { p++; return { type: 'lit', v: t.value }; }
      if (t.type === 'br') { p++; return { type: 'mref', name: t.value.trim() }; }
      if (t.type === 'qid' || t.type === 'id') {
        p++;
        if (t.type === 'id' && isOp('(')) { const fn0 = t.value.toUpperCase(), a0 = args(); checkArity(fn0, a0.length); return { type: 'call', fn: fn0, args: a0, pos: t.pos }; }
        if (peek().type === 'br') { const c = peek().value.trim(); p++; return { type: 'col', t: t.value, c }; }
        return { type: 'id', name: t.value, quoted: t.type === 'qid' };
      }
      if (isOp('(')) { p++; const e = expr(); expect(')'); return e; }
      if (isOp('{')) { p++; const items = []; if (!isOp('}')) for (;;) { if (isOp('(')) { p++; const tup = [expr()]; while (isOp(',')) { p++; tup.push(expr()); } expect(')'); items.push(tup); } else items.push([expr()]); if (isOp(',')) { p++; continue; } break; } expect('}'); return { type: 'list', items }; }
      if (t.type === 'eof') err('İfade eksik görünüyor: bir değer, sütun ya da fonksiyon bekleniyordu.');
      err('Beklenmeyen “' + t.value + '”' + (t.value === ';' ? '. DAX\'ta bağımsız değişkenler virgülle ayrılır.' : ''));
    }
    return {
      expr: () => { const e = expr(); if (peek().type !== 'eof') err('İfade bitmeliydi' + near()); return e; },
      query: () => {
        const defs = [];
        if (isKw('DEFINE')) { p++; while (isKw('MEASURE') || isKw('VAR')) { const isM = isKw('MEASURE'); p++; let nm; if (isM) { const tb = peek(); p++; const br = peek(); if (br.type !== 'br') err('MEASURE Tablo[Ad] = ... biçiminde yazılmalı.'); p++; nm = br.value.trim(); } else { nm = peek().value; p++; } expect('='); defs.push({ kind: isM ? 'm' : 'v', name: nm, e: expr() }); } }
        if (!isKw('EVALUATE')) err('DAX sorgusu EVALUATE ile başlamalı.');
        p++; const e = expr(); let order = [];
        if (isKw('ORDER')) { p++; if (!isKw('BY')) err('ORDER sonrası BY bekleniyordu.'); p++; for (;;) { const oe = expr(); let desc = false; if (isKw('DESC')) { desc = true; p++; } else if (isKw('ASC')) p++; order.push({ e: oe, desc }); if (isOp(',')) { p++; continue; } break; } }
        if (peek().type !== 'eof') err('Sorgu bitmeliydi' + near());
        return { defs, e, order };
      }
    };
  }

  /* ---------- Model yardımcıları ---------- */
  const relsFrom = {}; TNAMES.forEach(t => relsFrom[t] = M.rels.filter(r => r.from === t && !r.inactive));
  const ALLRELS = M.rels;
  const idxCache = {};
  function keyIndex(t, c) { const k = t + '|' + c; if (!idxCache[k]) { const m = new Map(); T[t].rows.forEach((r, i) => { const kk = keyOf(r[c]); if (!m.has(kk)) m.set(kk, i); }); idxCache[k] = m; } return idxCache[k]; }
  function expanded(t) { const out = new Set([t]); const st = [t]; while (st.length) { const x = st.pop(); relsFrom[x].forEach(r => { if (!out.has(r.to)) { out.add(r.to); st.push(r.to); } }); } return out; }
  const EXP = {}; TNAMES.forEach(t => EXP[t] = expanded(t));
  function relPath(from, to) { // many -> one yol
    const q = [[from, []]]; const seen = new Set([from]);
    while (q.length) { const [x, path] = q.shift(); if (x === to) return path; for (const r of relsFrom[x]) if (!seen.has(r.to)) { seen.add(r.to); q.push([r.to, path.concat(r)]); } }
    return null;
  }
  const allIdx = {}; TNAMES.forEach(t => allIdx[t] = T[t].rows.map((r, i) => i));
  const dateTableOf = () => TNAMES.find(t => T[t].dateTable);

  /* ---------- Filtre bağlamı ---------- */
  // filtre: {t, c, keys:Set}  ya da  {t, c:'*', rows:Set, cols:[...]}
  /* önbellekler: sütun anahtarları, bağlam imzası, ölçü sonuçları */
  const colKeyCache = {};
  function colKeys(t, c) { const k = t + '|' + c; let a = colKeyCache[k]; if (!a) { a = T[t].rows.map(r => keyOf(r[c])); colKeyCache[k] = a; } return a; }
  let FID = 0, CACHE = null;
  function fsig(f) {
    if (f._sig) return f._sig;
    if (f.c === '*') f._sig = f.rows.size <= 64 ? f.t + '|*' + (f.cols ? '(' + f.cols.join(',') + ')' : '') + '|' + [...f.rows].sort((a, b) => a - b).join(',') : f.t + '|*|#' + (++FID);
    else f._sig = f.keys.size <= 64 ? f.t + '|' + f.c + '|' + [...f.keys].sort().join(',') : f.t + '|' + f.c + '|#' + (++FID);
    return f._sig;
  }
  function csig(ctx) {
    if (ctx._sig) return ctx._sig;
    const fs = ctx.filters.map(fsig).sort().join(';');
    const sh = ctx.shadow === ctx.filters ? '=' : (ctx.shadow || []).map(fsig).sort().join(';');
    const rel = ctx.relOn.map(r => ALLRELS.indexOf(r)).join(',') + '/' + ctx.relOff.map(r => ALLRELS.indexOf(r)).join(',') + '/' + ctx.bidir.map(r => ALLRELS.indexOf(r)).join(',');
    const sc = (ctx.scope || []).map(x => x.t + '.' + x.c).join(',');
    ctx._sig = fs + '¦' + sh + '¦' + rel + '¦' + sc + '¦' + (ctx.user || '');
    return ctx._sig;
  }
  const ISO = new Set(TNAMES.filter(t => !ALLRELS.some(r => r.from === t || r.to === t)));
  function refTables(eng, m, seen) {
    if (m._refs) return m._refs; seen = seen || new Set(); seen.add(m);
    const out = new Set(); let ast; try { ast = eng.ast(m); } catch (e) { return out; }
    (function w(n) { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(w); return; }
      if (n.type === 'col') { const tn = T[n.t] ? n.t : TLOW[(n.t || '').toLowerCase()]; if (tn) out.add(tn); }
      else if (n.type === 'id') { const tn = T[n.name] ? n.name : TLOW[(n.name || '').toLowerCase()]; if (tn) out.add(tn); }
      else if (n.type === 'call' && (n.fn === 'ISINSCOPE')) out.add('#scope');
      else if (n.type === 'call' && (n.fn === 'ALLSELECTED' || n.fn === 'OFFSET' || n.fn === 'WINDOW' || n.fn === 'INDEX' || n.fn === 'RANK' || n.fn === 'ROWNUMBER')) out.add('#shadow');
      else if (n.type === 'mref') { const mm = eng.resolveMeasure(n.name); if (mm && !seen.has(mm)) refTables(eng, mm, seen).forEach(x => out.add(x)); else if (mm && seen.has(mm) && !mm._refs) out.add('*'); }
      for (const key in n) if (key !== 'type') { const v = n[key]; if (v && typeof v === 'object') w(v); } })(ast);
    if (!out.has('*')) m._refs = out; return out;
  }
  function msig(ctx, refs) {
    const keep = f => !ISO.has(f.t) || refs.has(f.t) || refs.has('*');
    const fs = ctx.filters.filter(keep).map(fsig).sort().join(';');
    const sh = refs.has('#shadow') || refs.has('*') ? (ctx.shadow || []).filter(keep).map(fsig).sort().join(';') : '';
    const rel = ctx.relOn.map(r => ALLRELS.indexOf(r)).join(',') + '/' + ctx.relOff.map(r => ALLRELS.indexOf(r)).join(',') + '/' + ctx.bidir.map(r => ALLRELS.indexOf(r)).join(',');
    const sc = refs.has('#scope') || refs.has('*') ? (ctx.scope || []).map(x => x.t + '.' + x.c).join(',') : '';
    return fs + '¦' + sh + '¦' + rel + '¦' + sc + '¦' + (ctx.user || '');
  }
  function withCache(fn) { if (CACHE) return fn(); CACHE = new Map(); try { return fn(); } finally { CACHE = null; } }
  function mkCtx(filters, base) { return { filters, shadow: base ? base.shadow : filters, scope: base ? base.scope : [], user: base ? base.user : null, relOn: base ? base.relOn : [], relOff: base ? base.relOff : [], bidir: base ? base.bidir : [], _vis: new Map() }; }
  const affects = (f, t, c) => (f.t === t && (c === undefined || f.c === c || (f.c === '*' && !f.xcols && (!f.cols || f.cols.includes(c))))) || (c !== undefined && !!f.xcols && f.xcols.includes(t + '|' + c));
  // bağlamdaki etkin ilişkiler (USERELATIONSHIP / CROSSFILTER NONE ile değişebilir)
  function rels(ctx, t) {
    if (!ctx.relOn.length && !ctx.relOff.length) return relsFrom[t];
    let out = relsFrom[t].filter(r => !ctx.relOff.includes(r) && !ctx.relOn.some(o => o.from === r.from && o.to === r.to && o !== r));
    ctx.relOn.forEach(o => { if (o.from === t && !out.includes(o)) out = out.concat([o]); });
    return out;
  }
  function tableFiltered(ctx, t, depth) {
    depth = depth || 0; if (depth > 12) return false;
    if (ctx.filters.some(f => f.t === t)) return true;
    for (const r of rels(ctx, t)) if (tableFiltered(ctx, r.to, depth + 1)) return true;
    for (const b of ctx.bidir) if (b.to === t && tableFiltered(ctxWithout(ctx, b), b.from, depth + 1)) return true;
    return false;
  }
  function ctxWithout(ctx, b) { if (!ctx._wo) ctx._wo = new Map(); if (!ctx._wo.has(b)) { const c = mkCtx(ctx.filters, ctx); c.bidir = ctx.bidir.filter(x => x !== b); ctx._wo.set(b, c); } return ctx._wo.get(b); }
  function visible(ctx, t) {
    if (ctx._vis.has(t)) return ctx._vis.get(t);
    let ck = null; if (CACHE) { ck = 'V' + csig(ctx) + '@' + t; const hit = CACHE.get(ck); if (hit) { ctx._vis.set(t, hit); return hit; } }
    let idx = allIdx[t];
    const own = ctx.filters.filter(f => f.t === t);
    for (const f of own) { if (f.c === '*') idx = idx.filter(i => f.rows.has(i)); else { const ks = colKeys(t, f.c); idx = idx.filter(i => f.keys.has(ks[i])); } }
    for (const r of rels(ctx, t)) {
      if (!tableFiltered(ctx, r.to)) continue;
      const tk = colKeys(r.to, r.toCol); const ks = new Set(visible(ctx, r.to).map(i => tk[i]));
      const fk = colKeys(t, r.fromCol); idx = idx.filter(i => ks.has(fk[i]));
    }
    for (const b of ctx.bidir) {
      if (b.to !== t) continue; const c2 = ctxWithout(ctx, b);
      if (!tableFiltered(c2, b.from)) continue;
      const fk0 = colKeys(b.from, b.fromCol); const ks = new Set(visible(c2, b.from).map(i => fk0[i]));
      const tk = colKeys(t, b.toCol); idx = idx.filter(i => ks.has(tk[i]));
    }
    ctx._vis.set(t, idx); if (ck) CACHE.set(ck, idx);
    return idx;
  }
  function findRel(c1, c2) { return ALLRELS.find(r => (r.from === c1.t && r.fromCol === c1.c && r.to === c2.t && r.toCol === c2.c) || (r.from === c2.t && r.fromCol === c2.c && r.to === c1.t && r.toCol === c1.c)); }
  function removeFilters(filters, pred) { return filters.filter(f => !pred(f)); }
  /* Bir sütunun filtresini kaldırmak, aynı tablodaki satır kümesi (tablo) filtrelerinden yalnızca o sütunu çıkarır:
     filtre kalan sütunlara izdüşürülür. (DAX'ta CALCULATE(..., Satislar[Durum] <> "İptal") bağlam geçişiyle gelen satırı silmez.) */
  const uniqCache = {};
  function isUniqueCol(t, c) { const k = t + '|' + c; if (!(k in uniqCache)) { const a = colKeys(t, c); uniqCache[k] = new Set(a).size === a.length && !a.some(v => v === keyOf(null)); } return uniqCache[k]; }
  function dropCol(filters, t, c) {
    const out = [];
    for (const f of filters) {
      if (f.xcols && f.xcols.includes(t + '|' + c)) { f.xproj.filter(p => !(p.t === t && p.c === c)).forEach(p => out.push({ t: p.t, c: p.c, keys: p.keys })); continue; }
      if (!affects(f, t, c)) { out.push(f); continue; }
      if (f.c !== '*') continue;
      const cols = (f.cols || T[t].cols).filter(x => x !== c); if (!cols.length) continue;
      if (cols.some(x => isUniqueCol(t, x))) { out.push({ t, c: '*', rows: f.rows, cols }); continue; }
      const ks = cols.map(x => colKeys(t, x)); const key = i => { let s = ''; for (const a of ks) s += a[i] + '\u0001'; return s; };
      const keep = new Set(); f.rows.forEach(i => keep.add(key(i)));
      out.push({ t, c: '*', rows: new Set(allIdx[t].filter(i => keep.has(key(i)))), cols });
    }
    return out;
  }

  /* ---------- Tablo değerleri ---------- */
  // taban: {kind:'table', base:'Satislar', idx:[...]}
  // sanal: {kind:'table', cols:[{name, lin:{t,c}|null}], rows:[[...]]}
  const baseTable = (t, idx) => ({ kind: 'table', base: t, idx });
  function tCols(tb) { return tb.base ? T[tb.base].cols.map(c => ({ name: tb.base + '[' + c + ']', short: c, lin: { t: tb.base, c } })) : tb.cols; }
  function tLen(tb) { return tb.base ? tb.idx.length : tb.rows.length; }
  function tRow(tb, i) { if (tb.base) { const r = T[tb.base].rows[tb.idx[i]]; return T[tb.base].cols.map(c => r[c]); } return tb.rows[i]; }
  function tFrame(tb, i) { return tb.base ? { base: tb.base, i: tb.idx[i] } : { cols: tb.cols, vals: tb.rows[i] }; }
  function tScalar(tb) {
    const cs = tCols(tb);
    if (cs.length !== 1) err('Birden çok sütunlu bir tablo, tek değer beklenen yerde kullanıldı.');
    const n = tLen(tb); if (n === 0) return null; if (n > 1) err('Tek değer beklenen yerde birden çok satırlı tablo kullanıldı. Bir toplama fonksiyonu (SUM, MAX…) ya da SELECTEDVALUE kullanmayı dene.');
    return tRow(tb, 0)[0];
  }
  const DCACHE = new WeakMap();
  function distinctCol(rowsIdx, t, c) { if (rowsIdx && typeof rowsIdx === 'object' && !Array.isArray(rowsIdx) === false) { let m = DCACHE.get(rowsIdx); if (!m) { m = new Map(); DCACHE.set(rowsIdx, m); } const k = t + '\u0001' + c; const hit = m.get(k); if (hit) return hit.slice(); const r = distinctCol0(rowsIdx, t, c); m.set(k, r); return r.slice(); } return distinctCol0(rowsIdx, t, c); }
  function distinctCol0(rowsIdx, t, c) { const seen = new Map(); const rows = T[t].rows; for (const i of rowsIdx) { const v = rows[i][c]; const k = keyOf(v); if (!seen.has(k)) seen.set(k, v); } return [...seen.values()]; }
  const colTable = (lins, rows) => ({ kind: 'table', cols: lins.map(l => ({ name: l.t + '[' + l.c + ']', short: l.c, lin: l })), rows });

  /* ---------- Değerlendirici ---------- */
  const TIME_UNITS = ['YEAR', 'QUARTER', 'MONTH', 'DAY', 'WEEK'];
  const DIFF_UNITS = ['HOUR', 'MINUTE', 'SECOND'];
  const KW = new Set([...DIFF_UNITS, 'ASC', 'DESC', 'SKIP', 'DENSE', 'BOTH', 'NONE', 'ONEWAY', 'REL', 'ABS', 'STRING', 'INTEGER', 'DOUBLE', 'CURRENCY', 'DATETIME', 'BOOLEAN', 'KEEP', 'PARTIAL', ...TIME_UNITS]);

  function Engine(measures) {
    this.measures = measures || {}; this.depth = 0;
  }
  Engine.prototype.resolveMeasure = function (name) {
    const k = Object.keys(this.measures).find(x => x.toLowerCase() === name.toLowerCase());
    return k ? this.measures[k] : null;
  };
  Engine.prototype.ast = function (m) { if (!m._ast) { try { m._ast = parse(m.expr).expr(); } catch (e) { m._err = e.message; throw new DaxError('[' + m.name + '] ölçüsünde hata: ' + e.message); } } return m._ast; };

  function E(eng, node, st) {
    switch (node.type) {
      case 'lit': return node.v;
      case 'empty': return null;
      case 'neg': { const v = E(eng, node.e, st); return isBlank(v) ? null : -num(v); }
      case 'let': { let vars = st.vars; for (const [n, e] of node.vars) { const v = E(eng, e, Object.assign({}, st, { vars })); vars = Object.assign(Object.create(vars), { [n.toLowerCase()]: { v } }); } return E(eng, node.body, Object.assign({}, st, { vars })); }
      case 'bin': return binop(eng, node, st);
      case 'list': {
        const w = node.items[0] ? node.items[0].length : 1;
        const cols = []; for (let i = 0; i < w; i++) cols.push({ name: w === 1 ? '[Value]' : '[Value' + (i + 1) + ']', short: w === 1 ? 'Value' : 'Value' + (i + 1), lin: null });
        return { kind: 'table', cols, rows: node.items.map(tp => tp.map(e => E(eng, e, st))) };
      }
      case 'id': {
        const nm = node.name;
        if (!node.quoted && st.vars) { const v = st.vars[nm.toLowerCase()]; if (v) return v.v; }
        const tn = T[nm] ? nm : TLOW[nm.toLowerCase()];
        if (tn) return baseTable(tn, visible(st.ctx, tn));
        const up = nm.toUpperCase();
        if (up === 'TRUE') return true; if (up === 'FALSE') return false;
        if (KW.has(up)) return { kind: 'kw', v: up };
        err('“' + nm + '” adında bir tablo ya da değişken yok. Tablolar: ' + TNAMES.join(', ') + '.');
      }
      case 'col': return colValue(eng, node, st);
      case 'mref': return mref(eng, node, st);
      case 'call': {
        const f = FN[node.fn];
        if (!f) err('“' + node.fn + '” fonksiyonu bu oyun alanında desteklenmiyor ya da yanlış yazılmış.');
        try { return f(eng, node.args, st, node); }
        catch (e) { if (e && (e.dax || e instanceof RangeError)) throw e; err(node.fn + ' bu bağımsız değişkenlerle hesaplanamadı. Sayısını ve türünü kontrol et (tablo mu, sütun mu, değer mi).'); }
      }
    }
    err('Bilinmeyen ifade');
  }
  function resolveCol(node) {
    const tn = T[node.t] ? node.t : TLOW[node.t.toLowerCase()];
    if (!tn) err('“' + node.t + '” adında bir tablo yok. Tablolar: ' + TNAMES.join(', ') + '.');
    const c = colOf(tn, node.c);
    if (!c) err(tn + ' tablosunda “' + node.c + '” sütunu yok. Sütunlar: ' + T[tn].cols.join(', ') + '.');
    return { t: tn, c };
  }
  function lookupFrame(frames, t, c, skip) {
    let skipped = 0;
    for (let i = frames.length - 1; i >= 0; i--) {
      const f = frames[i];
      if (f.base === t) { if (skipped++ < (skip || 0)) continue; return { v: T[t].rows[f.i][c] }; }
      if (f.cols) { const j = f.cols.findIndex(x => x.lin && x.lin.t === t && x.lin.c === c); if (j >= 0) { if (skipped++ < (skip || 0)) continue; return { v: f.vals[j] }; } }
    }
    return null;
  }
  function colValue(eng, node, st) {
    const { t, c } = resolveCol(node);
    const hit = lookupFrame(st.frames, t, c);
    if (hit) return hit.v;
    // sanal tablodaki ad
    for (let i = st.frames.length - 1; i >= 0; i--) { const f = st.frames[i]; if (f.cols) { const j = f.cols.findIndex(x => x.name === t + '[' + c + ']'); if (j >= 0) return f.vals[j]; } }
    const baseF = st.frames.filter(f => f.base).map(f => f.base);
    if (baseF.length && baseF.some(b => relPath(b, t))) err(t + '[' + c + '] sütununa satır bağlamında doğrudan erişilemez; ilişkili tablodan değer almak için RELATED(' + t + '[' + c + ']) kullan.');
    err(t + '[' + c + '] sütunu tek başına bir değer vermez: satır bağlamı yok. Bir toplama (SUM, MAX…) ya da yineleyici (SUMX…) içinde kullan.');
  }
  function mref(eng, node, st) {
    const nm = node.name;
    // satır bağlamındaki ad (ADDCOLUMNS / SUMMARIZE ile eklenen sütun)
    for (let i = st.frames.length - 1; i >= 0; i--) { const f = st.frames[i]; if (f.cols) { const j = f.cols.findIndex(x => x.short.toLowerCase() === nm.toLowerCase() || x.name.toLowerCase() === '[' + nm.toLowerCase() + ']'); if (j >= 0) return f.vals[j]; } }
    const m = eng.resolveMeasure(nm);
    if (m) {
      if (eng.depth > 40) err('[' + nm + '] ölçüsü kendini çağırıyor gibi görünüyor (döngüsel başvuru).');
      eng.depth++;
      try {
        const ctx = transition(st); let key = null;
        if (CACHE) { key = 'M' + m.name.toLowerCase() + '§' + msig(ctx, refTables(eng, m)); if (CACHE.has(key)) return CACHE.get(key); }
        const v = E(eng, eng.ast(m), { ctx, frames: [], vars: null }); if (key) CACHE.set(key, v); return v;
      }
      finally { eng.depth--; }
    }
    for (let i = st.frames.length - 1; i >= 0; i--) { const f = st.frames[i]; if (f.base) { const c = colOf(f.base, nm); if (c) return T[f.base].rows[f.i][c]; } }
    err('[' + nm + '] adında bir ölçü yok. Sütun kastediyorsan tablo adıyla yaz: Satislar[' + nm + '].');
  }
  function transition(st) {
    if (!st.frames.length) return st.ctx;
    let filters = st.ctx.filters;
    for (const f of st.frames) {
      if (f.base) { const ex = f.base; filters = removeFilters(filters, x => x.t === ex); filters = filters.concat([{ t: f.base, c: '*', rows: new Set([f.i]) }]); }
      else f.cols.forEach((col, j) => { if (!col.lin) return; const { t, c } = col.lin; filters = removeFilters(filters, x => x.t === t && x.c === c); filters = filters.concat([{ t, c, keys: new Set([keyOf(f.vals[j])]) }]); });
    }
    return mkCtx(filters, st.ctx);
  }
  function cmpVals(a, b) { // -1/0/1, DAX gibi: boş = 0 ya da ""
    if (isBlank(a) && isBlank(b)) return 0;
    if (typeof a === 'string' || typeof b === 'string') { if (isDate(a) || isDate(b) || typeof a === 'number' || typeof b === 'number') { if (isBlank(a) || isBlank(b)) { a = isBlank(a) ? '' : a; b = isBlank(b) ? '' : b; } else err('Metin ile sayı/tarih karşılaştırılamaz: ' + JSON.stringify(str(a)) + ' ve ' + JSON.stringify(str(b)) + '.'); } const x = str(a).toLocaleLowerCase('tr'), y = str(b).toLocaleLowerCase('tr'); return x < y ? -1 : x > y ? 1 : 0; }
    const x = num(a), y = num(b); return x < y ? -1 : x > y ? 1 : 0;
  }
  function binop(eng, n, st) {
    if (n.op === '&&') return truthy(E(eng, n.l, st)) && truthy(E(eng, n.r, st));
    if (n.op === '||') return truthy(E(eng, n.l, st)) || truthy(E(eng, n.r, st));
    const a = E(eng, n.l, st);
    if (n.op === 'IN') { const tb = E(eng, n.r, st); if (!isTable(tb)) err('IN sağında bir tablo ya da { } listesi olmalı.'); for (let i = 0; i < tLen(tb); i++) if (cmpVals(a, tRow(tb, i)[0]) === 0 && !(isBlank(a) !== isBlank(tRow(tb, i)[0]) && false)) return true; return false; }
    let b = E(eng, n.r, st);
    const sa = isTable(a) ? tScalar(a) : a, sb = isTable(b) ? tScalar(b) : b;
    switch (n.op) {
      case '+': case '-': {
        if (isBlank(sa) && isBlank(sb)) return null;
        if (isDate(sa) && !isDate(sb)) return fromSerial(num(sa) + (n.op === '+' ? 1 : -1) * num(sb));
        return n.op === '+' ? num(sa) + num(sb) : num(sa) - num(sb);
      }
      case '*': if (isBlank(sa) || isBlank(sb)) return null; return num(sa) * num(sb);
      case '/': { if (isBlank(sa) && isBlank(sb)) return null; const d = num(sb); const x = num(sa); if (d === 0) return x === 0 ? NaN : x > 0 ? Infinity : -Infinity; return x / d; }
      case '^': if (isBlank(sa)) return null; return Math.pow(num(sa), num(sb));
      case '&': return str(sa) + str(sb);
      case '=': return cmpVals(sa, sb) === 0;
      case '==': return (isBlank(sa) && isBlank(sb)) || (!isBlank(sa) && !isBlank(sb) && cmpVals(sa, sb) === 0);
      case '<>': return cmpVals(sa, sb) !== 0;
      case '<': return cmpVals(sa, sb) < 0;
      case '>': return cmpVals(sa, sb) > 0;
      case '<=': return cmpVals(sa, sb) <= 0;
      case '>=': return cmpVals(sa, sb) >= 0;
    }
  }

  /* ---------- Yardımcılar ---------- */
  const ev = (eng, a, st) => E(eng, a, st);
  const evS = (eng, a, st) => { const v = E(eng, a, st); return isTable(v) ? tScalar(v) : v; };
  const evT = (eng, a, st, fn) => { const v = E(eng, a, st); if (!isTable(v)) err((fn || 'Fonksiyon') + ' burada bir tablo bekliyor (ör. Satislar, VALUES(...), FILTER(...)).'); return v; };
  const need = (args, n, fn, sig) => { if (args.length < n) err(fn + ' en az ' + n + ' bağımsız değişken ister. Kullanım: ' + sig); };
  function colArg(a, fn) { if (a.type !== 'col') err(fn + ' bir sütun başvurusu bekliyor (ör. Satislar[Tutar]).'); return resolveCol(a); }
  function iterate(eng, tb, st, fn) { const n = tLen(tb); const out = new Array(n); for (let i = 0; i < n; i++) out[i] = fn(Object.assign({}, st, { frames: st.frames.concat([tFrame(tb, i)]) }), i); return out; }
  function colVals(eng, a, st, fn) { const { t, c } = colArg(a, fn); return visible(st.ctx, t).map(i => T[t].rows[i][c]); }
  const textCol = (t, c) => { const r = T[t].rows.find(x => x[c] !== null && x[c] !== undefined); return !!r && typeof r[c] === 'string'; };
  const NUM_ONLY = new Set(['SUM', 'AVERAGE', 'MEDIAN', 'STDEV.S', 'STDEV.P']);
  const nums = arr => arr.filter(v => !isBlank(v) && typeof v !== 'string').map(num);
  function agg(kind, arr) {
    const a = nums(arr);
    if (!a.length) return kind === 'count' ? null : null;
    switch (kind) {
      case 'sum': return a.reduce((x, y) => x + y, 0);
      case 'avg': return a.reduce((x, y) => x + y, 0) / a.length;
      case 'min': return Math.min(...a);
      case 'max': return Math.max(...a);
      case 'median': { a.sort((x, y) => x - y); const h = a.length >> 1; return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2; }
      case 'stdevs': { if (a.length < 2) return null; const m = agg('avg', a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); }
      case 'stdevp': { const m = agg('avg', a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); }
    }
  }
  function minmaxRaw(arr, isMax) { let best = null; for (const v of arr) { if (isBlank(v)) continue; if (best === null || (isMax ? cmpVals(v, best) > 0 : cmpVals(v, best) < 0)) best = v; } return best; }

  /* filtre bağımsız değişkenlerini yorumla */
  function filterArg(eng, a, st, fname) {
    // değiştiriciler
    if (a.type === 'call' && ['ALL', 'REMOVEFILTERS', 'ALLEXCEPT', 'ALLSELECTED', 'ALLNOBLANKROW', 'CROSSFILTER', 'USERELATIONSHIP'].includes(a.fn)) {
      return { mod: a.fn === 'ALLNOBLANKROW' ? 'ALL' : a.fn, args: a.args };
    }
    if (a.type === 'call' && a.fn === 'KEEPFILTERS') { const inner = filterArg(eng, a.args[0], st, fname); inner.keep = true; return inner; }
    if (a.type === 'bin' && ['=', '==', '<>', '<', '>', '<=', '>=', 'IN', '&&', '||'].includes(a.op) || (a.type === 'call' && ['NOT', 'AND', 'OR', 'ISBLANK', 'CONTAINSSTRING', 'SEARCH'].includes(a.fn))) {
      const cols = []; (function walk(n) { if (!n || typeof n !== 'object') return; if (n.type === 'col') { const rc = resolveCol(n); if (!cols.some(x => x.t === rc.t && x.c === rc.c)) cols.push(rc); return; } if (n.type === 'mref' && eng.resolveMeasure(n.name)) err(fname + ' içinde ölçü ([' + n.name + ']) doğrudan bir filtre koşulunda kullanılamaz. FILTER(ALL(...), [ölçü] > x) ya da önce VAR ile hesaplayıp karşılaştır.'); for (const k in n) if (k !== 'type') { const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') walk(v); } })(a);
      if (!cols.length) err(fname + ' filtre koşulunda bir sütun olmalı (ör. Satislar[Kanal] = "Web").');
      const tset = [...new Set(cols.map(x => x.t))];
      if (tset.length > 1) err('Bir filtre koşulu tek bir tablonun sütunlarını kullanabilir. Birden çok tabloyu kapsayan koşullar için FILTER kullan.');
      const t = tset[0];
      if (cols.length === 1) {
        const c = cols[0].c; const vals = distinctCol(allIdx[t], t, c);
        // hızlı yol: Sütun <op> sütunsuz ifade
        if (a.type === 'bin' && ['=', '==', '<>', '<', '>', '<=', '>='].includes(a.op)) {
          const isC = n => n.type === 'col'; const hasCol = n => { let f = false; (function w(x) { if (!x || typeof x !== 'object' || f) return; if (x.type === 'col') { f = true; return; } for (const k in x) if (k !== 'type') { const v = x[k]; if (Array.isArray(v)) v.forEach(w); else if (v && typeof v === 'object') w(v); } })(n); return f; };
          let colSide = null, other = null, flip = false;
          if (isC(a.l) && !hasCol(a.r)) { colSide = a.l; other = a.r; } else if (isC(a.r) && !hasCol(a.l)) { colSide = a.r; other = a.l; flip = true; }
          if (colSide) {
            let rv = E(eng, other, st); if (isTable(rv)) rv = tScalar(rv);
            const op = flip ? ({ '<': '>', '>': '<', '<=': '>=', '>=': '<=' }[a.op] || a.op) : a.op;
            const test = v => { if (op === '==') return (isBlank(v) && isBlank(rv)) || (!isBlank(v) && !isBlank(rv) && cmpVals(v, rv) === 0); const c0 = cmpVals(v, rv); return op === '=' ? c0 === 0 : op === '<>' ? c0 !== 0 : op === '<' ? c0 < 0 : op === '>' ? c0 > 0 : op === '<=' ? c0 <= 0 : c0 >= 0; };
            const keys = new Set(); for (const v of vals) if (test(v)) keys.add(keyOf(v));
            return { filters: [{ t, c, keys }], over: T[t].dateTable === c ? [{ t, c }, { t }] : [{ t, c }] };
          }
        }
        const keys = new Set(); const fr = { cols: [{ name: t + '[' + c + ']', short: c, lin: { t, c } }], vals: [null] };
        for (const v of vals) { fr.vals = [v]; if (truthy(E(eng, a, Object.assign({}, st, { frames: st.frames.concat([fr]) })))) keys.add(keyOf(v)); }
        return { filters: [{ t, c, keys }], over: T[t].dateTable === c ? [{ t, c }, { t }] : [{ t, c }] };
      }
      const rows = new Set(); allIdx[t].forEach(i => { if (truthy(E(eng, a, Object.assign({}, st, { frames: st.frames.concat([{ base: t, i }]) })))) rows.add(i); });
      return { filters: [{ t, c: '*', rows, cols: cols.map(x => x.c) }], over: cols };
    }
    const tb = E(eng, a, st);
    if (!isTable(tb)) err(fname + ' filtre bağımsız değişkeni bir tablo ya da koşul olmalı.');
    return tableToFilter(tb);
  }
  function tableToFilter(tb) {
    if (tb.base) return { filters: [{ t: tb.base, c: '*', rows: new Set(tb.idx) }], over: [...EXP[tb.base]].map(t => ({ t })) };
    const lcols = tb.cols.map((c, j) => [c, j]).filter(([c]) => c.lin);
    if (!lcols.length) err('Bu tablo modeldeki hiçbir sütuna bağlı değil (soy bağı yok), filtre olarak kullanılamaz.');
    const filters = [], over = [];
    if (lcols.length >= 2) {
      const per = lcols.map(([c, j]) => new Set(tb.rows.map(r => keyOf(r[j]))).size);
      const tkey = r => lcols.map(([c, j]) => keyOf(r[j])).join('\u0001'); const tuples = new Set(tb.rows.map(tkey));
      const tabs = [...new Set(lcols.map(([c]) => c.lin.t))];
      if (tuples.size < per.reduce((x, y) => x * y, 1)) {
        const B = tabs.length === 1 ? tabs[0] : (tabs.find(x => tabs.every(y => EXP[x].has(y))) || TNAMES.filter(x => tabs.every(y => EXP[x].has(y))).sort((x, y) => T[x].rows.length - T[y].rows.length)[0]);
        if (B) {
          const getters = lcols.map(([c]) => { if (c.lin.t === B) { const ks = colKeys(B, c.lin.c); return i => ks[i]; } const path = relPath(B, c.lin.t); return i => { let row = T[B].rows[i]; for (const r of path) { const j = keyIndex(r.to, r.toCol).get(keyOf(row[r.fromCol])); if (j === undefined) return keyOf(null); row = T[r.to].rows[j]; } return keyOf(row[c.lin.c]); }; });
          const rows = new Set(allIdx[B].filter(i => tuples.has(getters.map(g => g(i)).join('\u0001'))));
          const f = { t: B, c: '*', rows };
          if (tabs.length === 1) f.cols = lcols.map(([c]) => c.lin.c);
          else { f.cols = lcols.filter(([c]) => c.lin.t === B).map(([c]) => c.lin.c); f.xcols = lcols.map(([c]) => c.lin.t + '|' + c.lin.c); f.xproj = lcols.map(([c, j]) => ({ t: c.lin.t, c: c.lin.c, keys: new Set(tb.rows.map(r => keyOf(r[j]))) })); }
          lcols.forEach(([c]) => { over.push({ t: c.lin.t, c: c.lin.c }); if (T[c.lin.t].dateTable === c.lin.c) over.push({ t: c.lin.t }); });
          return { filters: [f], over };
        }
      }
    }
    lcols.forEach(([c, j]) => { const keys = new Set(tb.rows.map(r => keyOf(r[j]))); filters.push({ t: c.lin.t, c: c.lin.c, keys }); over.push({ t: c.lin.t, c: c.lin.c }); if (T[c.lin.t].dateTable === c.lin.c) over.push({ t: c.lin.t }); });
    return { filters, over };
  }
  function applyMod(eng, mod, ctx, st) {
    if (mod.mod === 'USERELATIONSHIP' || mod.mod === 'CROSSFILTER') {
      if (mod.args.length < 2 || mod.args[0].type !== 'col' || mod.args[1].type !== 'col') err(mod.mod + ' iki sütun ister: ' + mod.mod + '(Tablo1[Sütun], Tablo2[Sütun]' + (mod.mod === 'CROSSFILTER' ? ', BOTH|NONE|ONEWAY' : '') + ')');
      const r = findRel(resolveCol(mod.args[0]), resolveCol(mod.args[1])); if (!r) err('Bu iki sütun arasında modelde ilişki yok. ' + mod.mod + ' yalnızca var olan (etkin ya da pasif) bir ilişkiyle çalışır.');
      const c = mkCtx(ctx.filters, ctx);
      if (mod.mod === 'USERELATIONSHIP') { c.relOn = ctx.relOn.filter(x => !(x.from === r.from && x.to === r.to)).concat([r]); }
      else { const dirv = mod.args[2] ? E(eng, mod.args[2], st) : null; const dir = dirv && dirv.kind === 'kw' ? dirv.v : String(dirv || '').toUpperCase();
        if (dir === 'NONE') c.relOff = ctx.relOff.concat([r]);
        else if (dir === 'BOTH') { c.bidir = ctx.bidir.concat([r]); if (r.inactive) c.relOn = ctx.relOn.concat([r]); }
        else if (dir !== 'ONEWAY') err('CROSSFILTER yönü BOTH, NONE ya da ONEWAY olmalı.'); }
      return c;
    }
    let f = ctx.filters;
    const cols = mod.args.map(a => a.type === 'col' ? { col: resolveCol(a) } : a.type === 'id' ? { tab: (T[a.name] ? a.name : TLOW[a.name.toLowerCase()]) || err('“' + a.name + '” tablosu yok.') } : err(mod.mod + ' içine tablo ya da sütun yazılmalı.'));
    if (mod.mod === 'ALL' || mod.mod === 'REMOVEFILTERS') {
      if (!cols.length) return mkCtx([], ctx);
      cols.forEach(x => { if (x.tab) { const ex = EXP[x.tab]; f = removeFilters(f, y => ex.has(y.t)); } else { f = dropCol(f, x.col.t, x.col.c); if (T[x.col.t].dateTable === x.col.c) f = removeFilters(f, y => y.t === x.col.t); } });
    } else if (mod.mod === 'ALLEXCEPT') {
      const tab = cols[0].tab || err('ALLEXCEPT ilk olarak bir tablo adı ister.'); const keep = cols.slice(1).map(x => x.col);
      const ex = EXP[tab]; const out = [];
      /* Satır kümesi (tablo) filtreleri silinmez; korunan sütunlara izdüşürülür (bağlam geçişinden gelen satır, kategorisinin tamamına genişler) */
      f.forEach(y => { if (!ex.has(y.t)) { out.push(y); return; } if (y.c !== '*') { if (keep.some(k => k.t === y.t && k.c === y.c)) out.push(y); return; }
        const kc = keep.filter(k => k.t === y.t).map(k => k.c).filter(c => !y.cols || y.cols.includes(c)); if (!kc.length) return;
        const ks = kc.map(c => colKeys(y.t, c)); const key = i => ks.map(a => a[i]).join('\u0001'); const want = new Set(); y.rows.forEach(i => want.add(key(i)));
        out.push({ t: y.t, c: '*', rows: new Set(allIdx[y.t].filter(i => want.has(key(i)))), cols: kc }); });
      f = out;
    } else if (mod.mod === 'ALLSELECTED') {
      const sh = ctx.shadow || [];
      if (!cols.length) f = sh.slice();
      else cols.forEach(x => { const pred = x.tab ? (y => EXP[x.tab].has(y.t)) : (y => affects(y, x.col.t, x.col.c)); f = removeFilters(f, pred).concat(sh.filter(pred)); });
    }
    return mkCtx(f, ctx);
  }
  function calcCtx(eng, args, st, fname) {
    const evald = args.map(a => a.type === 'empty' ? null : filterArg(eng, a, st, fname)).filter(Boolean);
    let ctx = transition(st);
    for (const m of evald) if (m.mod) ctx = applyMod(eng, m, ctx, st);
    /* DAX'taki gibi: önce tüm filtre bağımsız değişkenlerinin sütunlarındaki dış filtreler kaldırılır,
       sonra filtrelerin hepsi birlikte (VE) uygulanır. Aynı sütuna verilen iki filtre birbirinin yerine geçmez, kesişir. */
    const fls = evald.filter(fl => !fl.mod);
    if (fls.length) {
      let f = ctx.filters;
      fls.forEach(fl => { if (!fl.keep) fl.over.forEach(o => { f = o.c ? dropCol(f, o.t, o.c) : removeFilters(f, y => y.t === o.t); }); });
      ctx = mkCtx(f.concat(...fls.map(fl => fl.filters)), ctx);
    }
    return ctx;
  }

  /* zaman zekâsı */
  function datesArg(eng, a, st, fn) {
    // Power BI'daki gibi: sütun başvurusu içten CALCULATETABLE(DISTINCT(sütun)) ile sarılır; satır bağlamı varsa bağlam geçişi yapılır
    if (a.type === 'col') { const { t, c } = resolveCol(a); const cx = st.frames && st.frames.length ? transition(st) : st.ctx; const v = distinctCol(visible(cx, t), t, c).filter(isDate); return { t, c, dates: v.sort((x, y) => x - y) }; }
    const tb = evT(eng, a, st, fn); const cs = tCols(tb); const j = cs.findIndex(x => x.lin); if (j < 0) err(fn + ' bir tarih sütunu bekliyor (ör. Tarih[Tarih]).');
    const vals = []; for (let i = 0; i < tLen(tb); i++) { const v = tRow(tb, i)[j]; if (isDate(v)) vals.push(v); }
    return { t: cs[j].lin.t, c: cs[j].lin.c, dates: vals.sort((x, y) => x - y) };
  }
  function existingDates(t, c, pred) { return distinctCol(allIdx[t], t, c).filter(d => isDate(d) && pred(d)); }
  const dtab = (t, c, ds) => colTable([{ t, c }], ds.sort((x, y) => x - y).map(d => [d]));
  function addUnit(d, n, unit) {
    const y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
    if (unit === 'DAY') return dUTC(y, m, day + n);
    if (unit === 'WEEK') return dUTC(y, m, day + 7 * n);
    const months = unit === 'YEAR' ? 12 * n : unit === 'QUARTER' ? 3 * n : n;
    const last = new Date(Date.UTC(y, m + months + 1, 0)).getUTCDate();
    return dUTC(y, m + months, Math.min(day, last));
  }
  const unitArg = (eng, a, st) => { const v = E(eng, a, st); const u = v && v.kind === 'kw' ? v.v : String(v).toUpperCase(); if (!TIME_UNITS.includes(u)) err('Zaman birimi YEAR, QUARTER, MONTH ya da DAY olmalı.'); return u; };
  const monthEnd = d => dUTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0);
  function shiftDates(t, c, ds, n, unit) {
    if (!ds.length) return dtab(t, c, []);
    const set = new Set(ds.map(d => d.getTime()));
    const out = new Set();
    if (unit !== 'DAY' && unit !== 'WEEK') {
      // tam ayları tam ay olarak kaydır
      const months = new Map(); ds.forEach(d => { const k = d.getUTCFullYear() * 12 + d.getUTCMonth(); months.set(k, (months.get(k) || 0) + 1); });
      ds.forEach(d => {
        const full = months.get(d.getUTCFullYear() * 12 + d.getUTCMonth()) === monthEnd(d).getUTCDate();
        if (full && d.getUTCDate() === 1) { const s = addUnit(d, n, unit); const e = monthEnd(s); for (let x = s; x <= e; x = dUTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate() + 1)) out.add(x.getTime()); }
        else if (!full) out.add(addUnit(d, n, unit).getTime());
      });
    } else ds.forEach(d => out.add(addUnit(d, n, unit).getTime()));
    const ok = new Set(distinctCol(allIdx[t], t, c).filter(isDate).map(d => d.getTime()));
    return dtab(t, c, [...out].filter(x => ok.has(x)).map(x => new Date(x)));
  }
  function periodToDate(eng, args, st, fn, startOf) {
    const { t, c, dates } = datesArg(eng, args[0], st, fn);
    if (!dates.length) return dtab(t, c, []);
    const last = dates[dates.length - 1]; let s = startOf(last);
    if (fn === 'DATESYTD' && args[1]) { const ye = str(evS(eng, args[1], st)).trim().match(/^(\d{1,2})[-\/.](\d{1,2})$/); if (ye) { let mo = +ye[1], dd = +ye[2]; if (mo > 12 && dd <= 12) { const x = mo; mo = dd; dd = x; } let y = last.getUTCFullYear(); let endThis = dUTC(y, mo - 1, dd); if (last > endThis) s = new Date(endThis.getTime() + 864e5); else { const endPrev = dUTC(y - 1, mo - 1, dd); s = new Date(endPrev.getTime() + 864e5); } } }
    return dtab(t, c, existingDates(t, c, d => d >= s && d <= last));
  }
  const yStart = d => dUTC(d.getUTCFullYear(), 0, 1);
  const qStart = d => dUTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3, 1);
  const mStart = d => dUTC(d.getUTCFullYear(), d.getUTCMonth(), 1);

  function rankCompare(a, b) { if (isBlank(a) && isBlank(b)) return 0; if (isBlank(a)) return -1; if (isBlank(b)) return 1; return cmpVals(a, b); }

  /* ---------- Fonksiyonlar ---------- */
  const FN = {};
  // toplama
  const simpleAgg = (kind, fn) => (eng, a, st) => { need(a, 1, fn, fn + '(Tablo[Sütun])'); if (NUM_ONLY.has(fn) && a[0].type === 'col') { const rc = resolveCol(a[0]); if (textCol(rc.t, rc.c)) err(fn + ' metin sütununda çalışmaz: ' + rc.t + '[' + rc.c + '] metin. Satır saymak için COUNTROWS ya da DISTINCTCOUNT kullan.'); } if (a.length > 1 && (fn === 'MAX' || fn === 'MIN')) return minmaxRaw([evS(eng, a[0], st), evS(eng, a[1], st)], fn === 'MAX'); if (a[0].type !== 'col') { const v = evS(eng, a[0], st); if (a.length > 1 && (fn === 'MAX' || fn === 'MIN')) { const w = evS(eng, a[1], st); return minmaxRaw([v, w], fn === 'MAX'); } err(fn + ' bir sütun ister (ör. ' + fn + '(Satislar[Tutar])). Bir ifadeyi toplamak için ' + fn + 'X kullan.'); } const vals = colVals(eng, a[0], st, fn); if ((fn === 'MAX' || fn === 'MIN')) { const r = minmaxRaw(vals, fn === 'MAX'); return r; } return agg(kind, vals); };
  FN.SUM = simpleAgg('sum', 'SUM'); FN.AVERAGE = simpleAgg('avg', 'AVERAGE'); FN.MIN = simpleAgg('min', 'MIN'); FN.MAX = simpleAgg('max', 'MAX'); FN.MEDIAN = simpleAgg('median', 'MEDIAN');
  FN['STDEV.S'] = simpleAgg('stdevs', 'STDEV.S'); FN['STDEV.P'] = simpleAgg('stdevp', 'STDEV.P');
  FN.COUNT = (eng, a, st) => { const v = colVals(eng, a[0], st, 'COUNT').filter(x => !isBlank(x) && typeof x !== 'boolean'); return v.length || null; };
  FN.COUNTA = (eng, a, st) => { const v = colVals(eng, a[0], st, 'COUNTA').filter(x => !isBlank(x) && x !== ''); return v.length || null; };
  FN.COUNTBLANK = (eng, a, st) => { const v = colVals(eng, a[0], st, 'COUNTBLANK').filter(x => isBlank(x) || x === ''); return v.length || null; };
  FN.COUNTROWS = (eng, a, st) => { const tb = a.length ? evT(eng, a[0], st, 'COUNTROWS') : err('COUNTROWS bir tablo ister: COUNTROWS(Satislar)'); return tLen(tb) || null; };
  FN.DISTINCTCOUNT = (eng, a, st) => { const { t, c } = colArg(a[0], 'DISTINCTCOUNT'); return distinctCol(visible(st.ctx, t), t, c).length || null; };
  FN.DISTINCTCOUNTNOBLANK = (eng, a, st) => { const { t, c } = colArg(a[0], 'DISTINCTCOUNTNOBLANK'); return distinctCol(visible(st.ctx, t), t, c).filter(v => !isBlank(v)).length || null; };
  const iterAgg = (kind, fn) => (eng, a, st) => { need(a, 2, fn, fn + '(Tablo, İfade)'); const tb = evT(eng, a[0], st, fn); const vals = iterate(eng, tb, st, s => evS(eng, a[1], s)); if (kind === 'count') return vals.filter(v => !isBlank(v)).length || null; if (kind === 'max' || kind === 'min') return minmaxRaw(vals, kind === 'max'); return agg(kind, vals); };
  FN.SUMX = iterAgg('sum', 'SUMX'); FN.AVERAGEX = iterAgg('avg', 'AVERAGEX'); FN.MINX = iterAgg('min', 'MINX'); FN.MAXX = iterAgg('max', 'MAXX'); FN.COUNTX = iterAgg('count', 'COUNTX'); FN.MEDIANX = iterAgg('median', 'MEDIANX');
  FN.PRODUCTX = (eng, a, st) => { const tb = evT(eng, a[0], st, 'PRODUCTX'); const v = nums(iterate(eng, tb, st, s => evS(eng, a[1], s))); return v.length ? v.reduce((x, y) => x * y, 1) : null; };
  FN.CONCATENATEX = (eng, a, st) => {
    need(a, 2, 'CONCATENATEX', 'CONCATENATEX(Tablo, İfade, [Ayraç])'); const tb = evT(eng, a[0], st, 'CONCATENATEX');
    let rows = iterate(eng, tb, st, s => ({ v: str(evS(eng, a[1], s)), o: a[3] ? evS(eng, a[3], s) : null }));
    if (a[3]) { const desc = a[4] && E(eng, a[4], st).v === 'DESC'; rows.sort((x, y) => rankCompare(x.o, y.o) * (desc ? -1 : 1)); }
    return rows.map(r => r.v).join(a[2] ? str(evS(eng, a[2], st)) : '');
  };
  // filtre
  FN.CALCULATE = (eng, a, st) => { need(a, 1, 'CALCULATE', 'CALCULATE(İfade, Filtre1, ...)'); const ctx = calcCtx(eng, a.slice(1), st, 'CALCULATE'); return evS(eng, a[0], { ctx, frames: [], vars: st.vars }); };
  FN.CALCULATETABLE = (eng, a, st) => { const ctx = calcCtx(eng, a.slice(1), st, 'CALCULATETABLE'); return evT(eng, a[0], { ctx, frames: [], vars: st.vars }, 'CALCULATETABLE'); };
  FN.FILTER = (eng, a, st) => {
    need(a, 2, 'FILTER', 'FILTER(Tablo, Koşul)'); const tb = evT(eng, a[0], st, 'FILTER');
    const keep = iterate(eng, tb, st, s => truthy(evS(eng, a[1], s)));
    if (tb.base) return baseTable(tb.base, tb.idx.filter((x, i) => keep[i]));
    return { kind: 'table', cols: tb.cols, rows: tb.rows.filter((x, i) => keep[i]) };
  };
  function allTable(eng, a, st, ctxFor) {
    if (!a.length) err('ALL içine bir tablo ya da sütun yazılmalı.');
    if (a[0].type === 'id') { const tn = T[a[0].name] ? a[0].name : TLOW[a[0].name.toLowerCase()]; if (!tn) err('“' + a[0].name + '” tablosu yok.'); return baseTable(tn, ctxFor ? visible(ctxFor, tn) : allIdx[tn]); }
    const lins = a.map(x => colArg(x, 'ALL'));
    const t = lins[0].t; if (lins.some(l => l.t !== t)) err('ALL içindeki sütunlar aynı tablodan olmalı.');
    const idx = ctxFor ? visible(ctxFor, t) : allIdx[t];
    const seen = new Map(); idx.forEach(i => { const r = T[t].rows[i]; const vals = lins.map(l => r[l.c]); const k = vals.map(keyOf).join('|'); if (!seen.has(k)) seen.set(k, vals); });
    return colTable(lins, [...seen.values()]);
  }
  FN.ALL = (eng, a, st) => allTable(eng, a, st, null);
  FN.REMOVEFILTERS = () => err('REMOVEFILTERS yalnızca CALCULATE içinde filtre kaldırmak için kullanılır.');
  FN.ALLNOBLANKROW = FN.ALL;
  FN.ALLSELECTED = (eng, a, st) => { if (!a.length) err('ALLSELECTED tablo ifadesi olarak kullanılırken bir tablo ya da sütun ister.'); return allTable(eng, a, st, mkCtx(st.ctx.shadow || [], st.ctx)); };
  FN.ALLEXCEPT = (eng, a, st) => { const ctx = applyMod(eng, { mod: 'ALLEXCEPT', args: a }, st.ctx, st); const tn = T[a[0].name] ? a[0].name : TLOW[a[0].name.toLowerCase()]; return baseTable(tn, visible(ctx, tn)); };
  FN.KEEPFILTERS = (eng, a, st) => { const v = E(eng, a[0], st); if (isTable(v)) return v; err('KEEPFILTERS yalnızca CALCULATE / CALCULATETABLE filtre bağımsız değişkeni ya da bir yineleyicinin tablo bağımsız değişkeni olarak kullanılır.'); };
  FN.USERELATIONSHIP = () => err('USERELATIONSHIP yalnızca CALCULATE / CALCULATETABLE içinde filtre bağımsız değişkeni olarak kullanılır.');
  FN.CROSSFILTER = () => err('CROSSFILTER yalnızca CALCULATE / CALCULATETABLE içinde kullanılır.');
  FN.VALUES = (eng, a, st) => {
    need(a, 1, 'VALUES', 'VALUES(Tablo[Sütun])');
    if (a[0].type === 'id') { const tb = E(eng, a[0], st); return tb; }
    const { t, c } = colArg(a[0], 'VALUES'); return colTable([{ t, c }], distinctCol(visible(st.ctx, t), t, c).map(v => [v]));
  };
  FN.DISTINCT = (eng, a, st) => { if (a[0].type === 'col') return FN.VALUES(eng, a, st); const tb = evT(eng, a[0], st, 'DISTINCT'); const seen = new Map(); for (let i = 0; i < tLen(tb); i++) { const r = tRow(tb, i); const k = r.map(keyOf).join('|'); if (!seen.has(k)) seen.set(k, r); } return { kind: 'table', cols: tCols(tb), rows: [...seen.values()] }; };
  FN.SELECTEDVALUE = (eng, a, st) => { const { t, c } = colArg(a[0], 'SELECTEDVALUE'); const hit = lookupFrame(st.frames, t, c); if (hit) return hit.v; const v = distinctCol(visible(st.ctx, t), t, c); return v.length === 1 ? v[0] : (a[1] ? evS(eng, a[1], st) : null); };
  FN.HASONEVALUE = (eng, a, st) => { const { t, c } = colArg(a[0], 'HASONEVALUE'); return distinctCol(visible(st.ctx, t), t, c).length === 1; };
  FN.ISFILTERED = (eng, a, st) => { if (a[0].type === 'id') { const tn = T[a[0].name] ? a[0].name : TLOW[a[0].name.toLowerCase()]; return st.ctx.filters.some(f => f.t === tn); } const { t, c } = colArg(a[0], 'ISFILTERED'); return st.ctx.filters.some(f => affects(f, t, c)); };
  FN.ISCROSSFILTERED = (eng, a, st) => { const { t, c } = colArg(a[0], 'ISCROSSFILTERED'); return visible(st.ctx, t).length < allIdx[t].length || st.ctx.filters.some(f => affects(f, t, c)); };
  FN.ISINSCOPE = (eng, a, st) => { const { t, c } = colArg(a[0], 'ISINSCOPE'); return (st.ctx.scope || []).some(s => s.t === t && s.c === c); };
  FN.RELATED = (eng, a, st) => {
    const { t, c } = colArg(a[0], 'RELATED');
    for (let i = st.frames.length - 1; i >= 0; i--) {
      const f = st.frames[i]; if (!f.base) continue; if (f.base === t) return T[t].rows[f.i][c];
      const path = relPath(f.base, t); if (!path) continue;
      let row = T[f.base].rows[f.i];
      for (const r of path) { const j = keyIndex(r.to, r.toCol).get(keyOf(row[r.fromCol])); if (j === undefined) return null; row = T[r.to].rows[j]; }
      return row[c];
    }
    err('RELATED, ' + t + ' tablosuna ilişkiyle bağlı bir tablonun satır bağlamında çalışır (ör. SUMX(Satislar, ... RELATED(' + t + '[' + c + ']) ...)).');
  };
  FN.RELATEDTABLE = (eng, a, st) => { const tn = a[0].type === 'id' ? (T[a[0].name] ? a[0].name : TLOW[a[0].name.toLowerCase()]) : null; if (!tn) err('RELATEDTABLE bir tablo adı ister.'); const ctx = transition(st); return baseTable(tn, visible(ctx, tn)); };
  FN.LOOKUPVALUE = (eng, a, st) => {
    need(a, 3, 'LOOKUPVALUE', 'LOOKUPVALUE(SonuçSütunu, AramaSütunu, Değer, ...)'); const res = colArg(a[0], 'LOOKUPVALUE');
    const pairs = []; for (let i = 1; i + 1 < a.length; i += 2) pairs.push([colArg(a[i], 'LOOKUPVALUE'), evS(eng, a[i + 1], st)]);
    const found = distinctCol(allIdx[res.t].filter(i => pairs.every(([col, v]) => cmpVals(T[res.t].rows[i][col.c], v) === 0)), res.t, res.c);
    if (found.length > 1) err('LOOKUPVALUE birden çok farklı değer buldu; arama koşulunu daralt.');
    return found.length ? found[0] : (a.length % 2 === 0 ? evS(eng, a[a.length - 1], st) : null);
  };
  FN.EARLIER = (eng, a, st) => { const { t, c } = colArg(a[0], 'EARLIER'); const hit = lookupFrame(st.frames, t, c, a[1] ? num(evS(eng, a[1], st)) : 1); if (!hit) err('EARLIER için dışta ikinci bir satır bağlamı yok.'); return hit.v; };
  FN.TOPN = (eng, a, st) => {
    need(a, 2, 'TOPN', 'TOPN(N, Tablo, Sıralamaİfadesi, [DESC|ASC])'); const n = num(evS(eng, a[0], st)); const tb = evT(eng, a[1], st, 'TOPN');
    const keys = a[2] ? iterate(eng, tb, st, s => evS(eng, a[2], s)) : iterate(eng, tb, st, () => 0);
    const asc = a[3] && E(eng, a[3], st).v === 'ASC' || (a[3] && a[3].type === 'lit' && a[3].v === 1);
    const order = keys.map((k, i) => i).sort((x, y) => rankCompare(keys[x], keys[y]) * (asc ? 1 : -1));
    let cut = order.slice(0, n); if (n > 0 && order.length > n) { const lastK = keys[order[n - 1]]; for (let j = n; j < order.length && rankCompare(keys[order[j]], lastK) === 0; j++) cut.push(order[j]); }
    if (tb.base) return baseTable(tb.base, cut.map(i => tb.idx[i]));
    return { kind: 'table', cols: tb.cols, rows: cut.map(i => tb.rows[i]) };
  };
  FN.RANKX = (eng, a, st) => {
    need(a, 2, 'RANKX', 'RANKX(Tablo, İfade, [Değer], [ASC|DESC], [SKIP|DENSE])'); const tb = evT(eng, a[0], st, 'RANKX');
    const vals = iterate(eng, tb, st, s => evS(eng, a[1], s));
    const v = a[2] && a[2].type !== 'empty' ? evS(eng, a[2], st) : evS(eng, a[1], st);
    const asc = a[3] && a[3].type !== 'empty' && (E(eng, a[3], st).v === 'ASC' || (a[3].type === 'lit' && a[3].v === 1));
    const dense = a[4] && E(eng, a[4], st).v === 'DENSE';
    const better = x => asc ? rankCompare(x, v) < 0 : rankCompare(x, v) > 0;
    if (dense) { const s = new Set(vals.filter(better).map(keyOf)); return s.size + 1; }
    return vals.filter(better).length + 1;
  };
  // tablo
  function groupCols(eng, args, st, fn) { const g = []; let i = 0; while (i < args.length && args[i].type === 'col') { g.push(resolveCol(args[i])); i++; } return [g, i]; }
  function extend(eng, tb, pairs, st, fn) {
    const cols = tCols(tb).slice(); const rows = [];
    const newCols = pairs.map(([n]) => ({ name: '[' + n + ']', short: n, lin: null }));
    for (let i = 0; i < tLen(tb); i++) {
      const base = tRow(tb, i).slice(); const fr0 = tFrame(tb, i);
      const vals = [];
      pairs.forEach(([n, e], k) => { const fr = { cols: cols.concat(newCols.slice(0, k)), vals: base.concat(vals) }; const s = Object.assign({}, st, { frames: st.frames.concat(tb.base ? [fr0, fr] : [fr]) }); vals.push(evS(eng, e, s)); });
      rows.push(base.concat(vals));
    }
    return { kind: 'table', cols: cols.concat(newCols), rows };
  }
  function namePairs(eng, args, st, fn) { const out = []; for (let i = 0; i < args.length; i += 2) { if (args[i].type !== 'lit' || typeof args[i].v !== 'string') err(fn + ' içinde yeni sütun adı tırnak içinde yazılmalı: "Ad", İfade'); if (!args[i + 1]) err(fn + ': "' + args[i].v + '" sütunu için ifade eksik.'); out.push([args[i].v, args[i + 1]]); } return out; }
  FN.ADDCOLUMNS = (eng, a, st) => { need(a, 3, 'ADDCOLUMNS', 'ADDCOLUMNS(Tablo, "Ad", İfade, ...)'); const tb = evT(eng, a[0], st, 'ADDCOLUMNS'); return extend(eng, tb, namePairs(eng, a.slice(1), st, 'ADDCOLUMNS'), st, 'ADDCOLUMNS'); };
  FN.SELECTCOLUMNS = (eng, a, st) => {
    const tb = evT(eng, a[0], st, 'SELECTCOLUMNS'); const pairs = []; let i = 1;
    while (i < a.length) { if (a[i].type === 'col') { const rc = resolveCol(a[i]); pairs.push([rc.c, a[i], rc]); i++; } else { pairs.push([a[i].v, a[i + 1], a[i + 1] && a[i + 1].type === 'col' ? Object.assign({ named: true }, resolveCol(a[i + 1])) : null]); i += 2; } }
    const cols = pairs.map(([n, e, rc]) => ({ name: rc && !rc.named ? rc.t + '[' + rc.c + ']' : '[' + n + ']', short: n, lin: rc ? { t: rc.t, c: rc.c } : null }));
    const rows = iterate(eng, tb, st, s => pairs.map(([n, e]) => evS(eng, e, s)));
    return { kind: 'table', cols, rows };
  };
  function groupBy(eng, st, srcT, g) {
    const idx = visible(st.ctx, srcT); const seen = new Map();
    for (const i of idx) {
      let row = T[srcT].rows[i]; const vals = g.map(gc => { if (gc.t === srcT) return row[gc.c]; const path = relPath(srcT, gc.t); if (!path) err(gc.t + '[' + gc.c + '] sütunu ' + srcT + ' tablosuna ilişkiyle bağlı değil.'); let r = row; for (const rel of path) { const j = keyIndex(rel.to, rel.toCol).get(keyOf(r[rel.fromCol])); if (j === undefined) return null; r = T[rel.to].rows[j]; } return r[gc.c]; });
      const k = vals.map(keyOf).join('|'); if (!seen.has(k)) seen.set(k, vals);
    }
    return [...seen.values()];
  }
  /* Sanal tablo (değişken, DATATABLE, ifade) üzerinde gruplama: SUMMARIZE(sanal, [A], ...) ve GROUPBY(..., "Ad", X(CURRENTGROUP(), ...)) */
  function groupVirtual(eng, a, st, fn) {
    const tb = evT(eng, a[0], st, fn), cs = tCols(tb), gi = []; let i = 1;
    const idxOf = n => { const nm = String(n.type === 'col' ? n.c : n.name).toLowerCase(); return cs.findIndex(c => String(c.short || '').toLowerCase() === nm || (c.lin && String(c.lin.c).toLowerCase() === nm)); };
    while (i < a.length && (a[i].type === 'col' || a[i].type === 'mref')) { const k = idxOf(a[i]); if (k < 0) err(fn + ': “' + (a[i].c || a[i].name) + '” sütunu bu tabloda yok.'); gi.push(k); i++; }
    const pairs = namePairs(eng, a.slice(i), st, fn), groups = new Map();
    for (let r = 0; r < tLen(tb); r++) { const row = tRow(tb, r); const key = gi.map(k => typeof row[k] + ':' + (isDate(row[k]) ? +row[k] : String(row[k]))).join('\u0002'); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(r); }
    const cols = gi.map(k => cs[k]).concat(pairs.map(([n]) => ({ name: '[' + n + ']', short: n, lin: null }))), rows = [];
    groups.forEach(ix => { const first = tRow(tb, ix[0]); const sub = { kind: 'table', cols: cs, rows: ix.map(r => tRow(tb, r)) }; const s2 = Object.assign({}, st, { frames: st.frames.concat([tFrame(tb, ix[0])]), cg: sub }); rows.push(gi.map(k => first[k]).concat(pairs.map(([, e]) => evS(eng, e, s2)))); });
    return { kind: 'table', cols, rows };
  }
  FN.GROUPBY = (eng, a, st) => { need(a, 2, 'GROUPBY', 'GROUPBY(Tablo, GrupSütunu, ..., "Ad", SUMX(CURRENTGROUP(), İfade))'); return groupVirtual(eng, a, st, 'GROUPBY'); };
  FN.CURRENTGROUP = (eng, a, st) => st.cg || err('CURRENTGROUP() yalnızca GROUPBY içindeki bir X fonksiyonunda kullanılabilir.');
  FN.SUMMARIZE = (eng, a, st) => {
    need(a, 2, 'SUMMARIZE', 'SUMMARIZE(Tablo, GrupSütunu, ..., ["Ad", İfade])');
    if (a[0].type !== 'id' || !(T[a[0].name] || TLOW[a[0].name.toLowerCase()])) return groupVirtual(eng, a, st, 'SUMMARIZE');
    const tn = T[a[0].name] ? a[0].name : TLOW[a[0].name.toLowerCase()];
    const [g, k] = groupCols(eng, a.slice(1), st, 'SUMMARIZE');
    const tb = colTable(g, groupBy(eng, st, tn, g));
    const rest = a.slice(1 + k); if (!rest.length) return tb;
    /* Genişletme sütunları grubun filtre bağlamında hesaplanır (örtük bağlam geçişi) */
    const pairsC = namePairs(eng, rest, st, 'SUMMARIZE').map(([n, e]) => [n, e && e.type === 'call' && e.fn === 'CALCULATE' && e.args.length === 1 ? e : { type: 'call', fn: 'CALCULATE', args: [e] }]);
    return extend(eng, tb, pairsC, st, 'SUMMARIZE');
  };
  FN.SUMMARIZECOLUMNS = (eng, a, st) => {
    const [g, k] = groupCols(eng, a, st, 'SUMMARIZECOLUMNS'); let i = k; let ctx = st.ctx;
    while (i < a.length && !(a[i].type === 'lit' && typeof a[i].v === 'string')) { const fl = filterArg(eng, a[i], st, 'SUMMARIZECOLUMNS'); let f = ctx.filters; fl.over && fl.over.forEach(o => { f = o.c ? dropCol(f, o.t, o.c) : removeFilters(f, y => y.t === o.t); }); ctx = mkCtx(f.concat(fl.filters || []), ctx); i++; }
    const pairs = namePairs(eng, a.slice(i), st, 'SUMMARIZECOLUMNS'); const s2 = Object.assign({}, st, { ctx });
    // gruplar: aynı tablodaki sütunlar birlikte; farklı tablolar çapraz
    const byT = {}; g.forEach(c => (byT[c.t] = byT[c.t] || []).push(c));
    let combos = [[]]; let lins = [];
    for (const t in byT) { const vals = groupBy(eng, s2, t, byT[t]); lins = lins.concat(byT[t]); const nc = []; combos.forEach(cb => vals.forEach(v => nc.push(cb.concat(v)))); combos = nc; }
    if (!g.length) combos = [[]];
    // Power BI'daki gibi: her ifade grubun filtre bağlamında hesaplanır (örtük CALCULATE / bağlam geçişi)
    const pairsC = pairs.map(([n, e]) => [n, e && e.type === 'call' && e.fn === 'CALCULATE' && e.args.length === 1 ? e : { type: 'call', fn: 'CALCULATE', args: [e] }]);
    const tb = extend(eng, colTable(lins, combos), pairsC, s2, 'SUMMARIZECOLUMNS');
    if (pairs.length) tb.rows = tb.rows.filter(r => r.slice(lins.length).some(v => !isBlank(v)));
    return tb;
  };
  FN.ROW = (eng, a, st) => { const pairs = namePairs(eng, a, st, 'ROW'); return { kind: 'table', cols: pairs.map(([n]) => ({ name: '[' + n + ']', short: n, lin: null })), rows: [pairs.map(([n, e]) => evS(eng, e, st))] }; };
  FN.GENERATESERIES = (eng, a, st) => { const s = num(evS(eng, a[0], st)), e = num(evS(eng, a[1], st)), step = a[2] ? num(evS(eng, a[2], st)) : 1; if (step <= 0) err('GENERATESERIES adımı pozitif olmalı.'); const rows = []; for (let x = s; x <= e + 1e-9 && rows.length < 10000; x += step) rows.push([Math.round(x * 1e9) / 1e9]); return { kind: 'table', cols: [{ name: '[Value]', short: 'Value', lin: null }], rows }; };
  FN.CALENDAR = (eng, a, st) => { const s = evS(eng, a[0], st), e = evS(eng, a[1], st); if (!isDate(s) || !isDate(e)) err('CALENDAR iki tarih ister: CALENDAR(DATE(2022,1,1), DATE(2024,12,31))'); const rows = []; for (let d = s; d <= e && rows.length < 40000; d = dUTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)) rows.push([d]); return { kind: 'table', cols: [{ name: '[Date]', short: 'Date', lin: null }], rows }; };
  FN.CALENDARAUTO = (eng, a, st) => {
    /* Modeldeki tüm tarih sütunlarının en küçük ve en büyük tarihini bulur; mali yıl sonu ayına (varsayılan 12) göre tam yıllara genişletir */
    const fe = a[0] && a[0].type !== 'empty' ? Math.round(num(evS(eng, a[0], st))) : 12; if (!(fe >= 1 && fe <= 12)) err('CALENDARAUTO: mali yıl sonu ayı 1 ile 12 arasında olmalı.');
    let lo = null, hi = null; Object.keys(T).forEach(t => (T[t].rows || []).forEach(r => Object.values(r).forEach(v => { if (isDate(v)) { if (!lo || v < lo) lo = v; if (!hi || v > hi) hi = v; } })));
    if (!lo) { lo = dUTC(2022, 0, 1); hi = lo; }
    const fyEnd = d => { const y = d.getUTCMonth() + 1 > fe ? d.getUTCFullYear() + 1 : d.getUTCFullYear(); return dUTC(y, fe, 0); };
    const e = fyEnd(hi), s0 = fyEnd(lo), s = dUTC(s0.getUTCFullYear() - 1, fe, 1);
    return FN.CALENDAR(eng, [{ type: 'lit', v: s }, { type: 'lit', v: e }], st);
  };
  FN.UNION = (eng, a, st) => { const ts = a.map(x => evT(eng, x, st, 'UNION')); const w = tCols(ts[0]).length; if (ts.some(t => tCols(t).length !== w)) err('UNION tablolarının sütun sayısı aynı olmalı.'); const rows = []; ts.forEach(t => { for (let i = 0; i < tLen(t); i++) rows.push(tRow(t, i)); }); return { kind: 'table', cols: tCols(ts[0]), rows }; };
  FN.CROSSJOIN = (eng, a, st) => { const ts = a.map(x => evT(eng, x, st, 'CROSSJOIN')); let cols = [], rows = [[]]; ts.forEach(t => { cols = cols.concat(tCols(t)); const nr = []; rows.forEach(r => { for (let i = 0; i < tLen(t); i++) nr.push(r.concat(tRow(t, i))); }); rows = nr; }); return { kind: 'table', cols, rows }; };
  // mantık
  FN.IF = (eng, a, st) => { need(a, 2, 'IF', 'IF(Koşul, DoğruysaDeğer, [YanlışsaDeğer])'); return truthy(evS(eng, a[0], st)) ? evS(eng, a[1], st) : (a[2] ? evS(eng, a[2], st) : null); };
  FN['IF.EAGER'] = FN.IF;
  FN.SWITCH = (eng, a, st) => { need(a, 3, 'SWITCH', 'SWITCH(İfade, Değer1, Sonuç1, ..., [Diğer])'); const v = evS(eng, a[0], st); let i = 1; for (; i + 1 < a.length; i += 2) { const w = evS(eng, a[i], st); if (v === true ? truthy(w) : cmpVals(v, w) === 0 && isBlank(v) === isBlank(w)) return evS(eng, a[i + 1], st); } return i < a.length ? evS(eng, a[i], st) : null; };
  FN.AND = (eng, a, st) => truthy(evS(eng, a[0], st)) && truthy(evS(eng, a[1], st));
  FN.OR = (eng, a, st) => truthy(evS(eng, a[0], st)) || truthy(evS(eng, a[1], st));
  FN.NOT = (eng, a, st) => !truthy(evS(eng, a[0], st));
  FN.TRUE = () => true; FN.FALSE = () => false; FN.BLANK = () => null;
  FN.ISBLANK = (eng, a, st) => isBlank(evS(eng, a[0], st));
  FN.ISNUMBER = (eng, a, st) => typeof evS(eng, a[0], st) === 'number';
  FN.ISTEXT = (eng, a, st) => typeof evS(eng, a[0], st) === 'string';
  FN.ISERROR = (eng, a, st) => { try { evS(eng, a[0], st); return false; } catch (e) { if (!e.dax) throw e; return true; } };
  FN.ERROR = (eng, a, st) => { err(String(evS(eng, a[0], st))); };
  FN.IFERROR = (eng, a, st) => { try { return evS(eng, a[0], st); } catch (e) { if (!e.dax) throw e; return evS(eng, a[1], st); } };
  FN.COALESCE = (eng, a, st) => { for (const x of a) { const v = evS(eng, x, st); if (!isBlank(v)) return v; } return null; };
  FN.CONTAINSSTRING = (eng, a, st) => str(evS(eng, a[0], st)).toLocaleLowerCase('tr').includes(str(evS(eng, a[1], st)).toLocaleLowerCase('tr'));
  FN.USERPRINCIPALNAME = (eng, a, st) => (st.ctx.user || 'ayse.kaya@anadolumarket.com');
  FN.USERNAME = FN.USERPRINCIPALNAME;
  // matematik
  FN.DIVIDE = (eng, a, st) => { need(a, 2, 'DIVIDE', 'DIVIDE(Pay, Payda, [AlternatifSonuç])'); const x = evS(eng, a[0], st), y = evS(eng, a[1], st); if (isBlank(y) || num(y) === 0) return a[2] ? evS(eng, a[2], st) : null; if (isBlank(x)) return null; return num(x) / num(y); };
  const m1 = f => (eng, a, st) => { const v = evS(eng, a[0], st); return isBlank(v) ? null : f(num(v), a[1] ? num(evS(eng, a[1], st)) : 0); };
  const rnd = (v, d) => { const p = Math.pow(10, d); return Math.sign(v) * Math.round(Math.abs(v) * p + 1e-9) / p; };
  FN.ROUND = m1(rnd);
  /* Finansal fonksiyonlar (Excel/DAX ile aynı işaret kuralı: ödenen para negatif) */
  const finArgs = (eng, a, st, n) => Array.from({ length: n }, (_, i) => a[i] && a[i].type !== 'empty' ? num(evS(eng, a[i], st)) : 0);
  FN.FV = (eng, a, st) => { need(a, 3, 'FV', 'FV(Oran, DönemSayısı, Ödeme, [BugünküDeğer], [Tür])'); const [r, n, pmt, pv, t] = finArgs(eng, a, st, 5); if (r === 0) return -(pv + pmt * n); const f = Math.pow(1 + r, n); return -(pv * f + pmt * (1 + r * t) * (f - 1) / r); };
  FN.PV = (eng, a, st) => { need(a, 3, 'PV', 'PV(Oran, DönemSayısı, Ödeme, [GelecekDeğer], [Tür])'); const [r, n, pmt, fv, t] = finArgs(eng, a, st, 5); if (r === 0) return -(fv + pmt * n); const f = Math.pow(1 + r, n); return -(fv + pmt * (1 + r * t) * (f - 1) / r) / f; };
  FN.PMT = (eng, a, st) => { need(a, 3, 'PMT', 'PMT(Oran, DönemSayısı, BugünküDeğer, [GelecekDeğer], [Tür])'); const [r, n, pv, fv, t] = finArgs(eng, a, st, 5); if (r === 0) return -(pv + fv) / n; const f = Math.pow(1 + r, n); return -(r * (pv * f + fv)) / ((1 + r * t) * (f - 1)); };
  const cashflows = (eng, a, st, fn) => { const tb = evT(eng, a[0], st, fn); const v = iterate(eng, tb, st, s => evS(eng, a[1], s)), d = iterate(eng, tb, st, s => evS(eng, a[2], s)); const cf = []; v.forEach((x, i) => { if (!isBlank(x) && isDate(d[i])) cf.push([num(x), d[i].getTime()]); }); if (!cf.length) err(fn + ': nakit akışı yok.'); const t0 = Math.min(...cf.map(c => c[1])); return cf.map(([x, t]) => [x, (t - t0) / 86400000 / 365]); };
  FN.XNPV = (eng, a, st) => { need(a, 4, 'XNPV', 'XNPV(Tablo, Değerler, Tarihler, Oran)'); const r = num(evS(eng, a[3], st)); const cf = cashflows(eng, a, st, 'XNPV'); return cf.reduce((s, [x, y]) => s + x / Math.pow(1 + r, y), 0); };
  FN.XIRR = (eng, a, st) => { need(a, 3, 'XIRR', 'XIRR(Tablo, Değerler, Tarihler, [Tahmin])'); const cf = cashflows(eng, a, st, 'XIRR'); let r = a[3] ? num(evS(eng, a[3], st)) : 0.1; for (let k = 0; k < 100; k++) { let f = 0, df = 0; cf.forEach(([x, y]) => { f += x / Math.pow(1 + r, y); df -= y * x / Math.pow(1 + r, y + 1); }); if (!df) break; const nr = r - f / df; if (!isFinite(nr)) break; if (Math.abs(nr - r) < 1e-10) { r = nr; break; } r = Math.max(nr, -0.9999); } return r; };
  FN.ROUNDUP = m1((v, d) => { const p = Math.pow(10, d); return Math.sign(v) * Math.ceil(Math.abs(v) * p - 1e-9) / p; });
  FN.ROUNDDOWN = m1((v, d) => { const p = Math.pow(10, d); return Math.sign(v) * Math.floor(Math.abs(v) * p + 1e-9) / p; });
  FN.TRUNC = FN.ROUNDDOWN;
  FN.INT = m1(v => Math.floor(v)); FN.ABS = m1(v => Math.abs(v)); FN.SQRT = m1(v => Math.sqrt(v)); FN.EXP = m1(v => Math.exp(v)); FN.LN = m1(v => Math.log(v));
  FN.SIGN = m1(v => Math.sign(v));
  FN.MOD = (eng, a, st) => { const x = num(evS(eng, a[0], st)), y = num(evS(eng, a[1], st)); if (y === 0) err('MOD: bölen sıfır olamaz.'); return x - y * Math.floor(x / y); };
  FN.POWER = (eng, a, st) => Math.pow(num(evS(eng, a[0], st)), num(evS(eng, a[1], st)));
  FN.QUOTIENT = (eng, a, st) => Math.trunc(num(evS(eng, a[0], st)) / num(evS(eng, a[1], st)));
  FN.VALUE = (eng, a, st) => num(evS(eng, a[0], st));
  // metin
  FN.FORMAT = (eng, a, st) => format(evS(eng, a[0], st), str(evS(eng, a[1], st)));
  FN.CONCATENATE = (eng, a, st) => str(evS(eng, a[0], st)) + str(evS(eng, a[1], st));
  FN.LEFT = (eng, a, st) => str(evS(eng, a[0], st)).slice(0, a[1] ? num(evS(eng, a[1], st)) : 1);
  FN.RIGHT = (eng, a, st) => { const s = str(evS(eng, a[0], st)); const n = a[1] ? num(evS(eng, a[1], st)) : 1; return n ? s.slice(-n) : ''; };
  FN.MID = (eng, a, st) => { const s = str(evS(eng, a[0], st)); const i = num(evS(eng, a[1], st)); return s.substr(i - 1, num(evS(eng, a[2], st))); };
  FN.LEN = (eng, a, st) => str(evS(eng, a[0], st)).length;
  FN.UPPER = (eng, a, st) => str(evS(eng, a[0], st)).toLocaleUpperCase('tr');
  FN.LOWER = (eng, a, st) => str(evS(eng, a[0], st)).toLocaleLowerCase('tr');
  FN.TRIM = (eng, a, st) => str(evS(eng, a[0], st)).trim().replace(/\s+/g, ' ');
  FN.SUBSTITUTE = (eng, a, st) => str(evS(eng, a[0], st)).split(str(evS(eng, a[1], st))).join(str(evS(eng, a[2], st)));
  FN.SEARCH = (eng, a, st) => { const i = str(evS(eng, a[1], st)).toLocaleLowerCase('tr').indexOf(str(evS(eng, a[0], st)).toLocaleLowerCase('tr')); if (i < 0) { if (a[3]) return evS(eng, a[3], st); err('SEARCH aranan metni bulamadı.'); } return i + 1; };
  FN.UNICHAR = (eng, a, st) => String.fromCodePoint(num(evS(eng, a[0], st)));
  FN.REPT = (eng, a, st) => str(evS(eng, a[0], st)).repeat(Math.max(0, Math.min(500, num(evS(eng, a[1], st)))));
  // tarih
  const dateArg = (eng, a, st, fn) => { const v = evS(eng, a, st); if (isBlank(v)) return null; if (!isDate(v)) { if (typeof v === 'number') return fromSerial(v); const m = typeof v === 'string' && v.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (m) { const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); if (d.getUTCMonth() === +m[2] - 1) return d; } err(fn + ' bir tarih bekliyor; “' + String(v).slice(0, 30) + '” tarihe çevrilemedi.'); } return v; };
  FN.DATE = (eng, a, st) => dUTC(num(evS(eng, a[0], st)), num(evS(eng, a[1], st)) - 1, num(evS(eng, a[2], st)));
  FN.TODAY = () => dUTC(2024, 11, 31); FN.NOW = FN.TODAY;
  FN.YEAR = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'YEAR'); return d ? d.getUTCFullYear() : null; };
  FN.MONTH = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'MONTH'); return d ? d.getUTCMonth() + 1 : null; };
  FN.DAY = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'DAY'); return d ? d.getUTCDate() : null; };
  FN.QUARTER = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'QUARTER'); return d ? Math.floor(d.getUTCMonth() / 3) + 1 : null; };
  FN.WEEKDAY = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'WEEKDAY'); if (!d) return null; const t = a[1] ? num(evS(eng, a[1], st)) : 1; const w = d.getUTCDay(); return t === 2 ? (w === 0 ? 7 : w) : t === 3 ? (w + 6) % 7 : w + 1; };
  FN.EOMONTH = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'EOMONTH'); const n = a[1] ? num(evS(eng, a[1], st)) : 0; return dUTC(d.getUTCFullYear(), d.getUTCMonth() + n + 1, 0); };
  FN.EDATE = (eng, a, st) => addUnit(dateArg(eng, a[0], st, 'EDATE'), num(evS(eng, a[1], st)), 'MONTH');
  FN.HOUR = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'HOUR'); return d ? d.getUTCHours() : null; };
  FN.MINUTE = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'MINUTE'); return d ? d.getUTCMinutes() : null; };
  FN.SECOND = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'SECOND'); return d ? d.getUTCSeconds() : null; };
  FN.DATEDIFF = (eng, a, st) => { const z = dUTC(1899, 11, 30); const x = dateArg(eng, a[0], st, 'DATEDIFF') || z, y = dateArg(eng, a[1], st, 'DATEDIFF') || z; const uv = E(eng, a[2], st); const uu = uv && uv.kind === 'kw' ? uv.v : String(uv).toUpperCase(); if (DIFF_UNITS.includes(uu)) { const k = uu === 'HOUR' ? 3600000 : uu === 'MINUTE' ? 60000 : 1000; return Math.floor(y.getTime() / k) - Math.floor(x.getTime() / k); } const u = unitArg(eng, a[2], st); if (u === 'DAY') return Math.round((y - x) / 86400000); if (u === 'WEEK') return Math.floor(Math.round((y - x) / 86400000) / 7); const mm = (y.getUTCFullYear() - x.getUTCFullYear()) * 12 + y.getUTCMonth() - x.getUTCMonth(); return u === 'MONTH' ? mm : u === 'QUARTER' ? Math.floor((y.getUTCFullYear() * 4 + Math.floor(y.getUTCMonth() / 3)) - (x.getUTCFullYear() * 4 + Math.floor(x.getUTCMonth() / 3))) : y.getUTCFullYear() - x.getUTCFullYear(); };
  FN.DATEVALUE = (eng, a, st) => { const s = str(evS(eng, a[0], st)); const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/) || s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/); if (!m) err('DATEVALUE: tarih metni anlaşılamadı (ör. "2024-03-15").'); return m[1].length === 4 ? dUTC(+m[1], +m[2] - 1, +m[3]) : dUTC(+m[3], +m[2] - 1, +m[1]); };
  // zaman zekâsı
  FN.DATESYTD = (eng, a, st) => periodToDate(eng, a, st, 'DATESYTD', yStart);
  FN.DATESQTD = (eng, a, st) => periodToDate(eng, a, st, 'DATESQTD', qStart);
  FN.DATESMTD = (eng, a, st) => periodToDate(eng, a, st, 'DATESMTD', mStart);
  const totalX = (fn, dfn) => (eng, a, st) => { need(a, 2, fn, fn + '(İfade, Tarih[Tarih], [Filtre])'); let rest = a.slice(2), ye = null; if (fn === 'TOTALYTD' && rest.length && rest[rest.length - 1].type === 'lit' && typeof rest[rest.length - 1].v === 'string' && /^\s*\d{1,2}[-\/.]\d{1,2}\s*$/.test(rest[rest.length - 1].v)) { ye = rest[rest.length - 1]; rest = rest.slice(0, -1); } return FN.CALCULATE(eng, [a[0], { type: 'call', fn: dfn, args: ye ? [a[1], ye] : [a[1]] }].concat(rest), st); };
  FN.TOTALYTD = totalX('TOTALYTD', 'DATESYTD'); FN.TOTALQTD = totalX('TOTALQTD', 'DATESQTD'); FN.TOTALMTD = totalX('TOTALMTD', 'DATESMTD');
  FN.DATEADD = (eng, a, st) => { need(a, 3, 'DATEADD', 'DATEADD(Tarih[Tarih], Sayı, YEAR|QUARTER|MONTH|DAY)'); const { t, c, dates } = datesArg(eng, a[0], st, 'DATEADD'); return shiftDates(t, c, dates, num(evS(eng, a[1], st)), unitArg(eng, a[2], st)); };
  FN.SAMEPERIODLASTYEAR = (eng, a, st) => { const { t, c, dates } = datesArg(eng, a[0], st, 'SAMEPERIODLASTYEAR'); return shiftDates(t, c, dates, -1, 'YEAR'); };
  FN.PARALLELPERIOD = (eng, a, st) => {
    const { t, c, dates } = datesArg(eng, a[0], st, 'PARALLELPERIOD'); if (!dates.length) return dtab(t, c, []); const n = num(evS(eng, a[1], st)); const u = unitArg(eng, a[2], st);
    const s0 = u === 'YEAR' ? yStart(dates[0]) : u === 'QUARTER' ? qStart(dates[0]) : mStart(dates[0]); const last = dates[dates.length - 1];
    const e0 = u === 'YEAR' ? dUTC(last.getUTCFullYear(), 11, 31) : u === 'QUARTER' ? dUTC(last.getUTCFullYear(), Math.floor(last.getUTCMonth() / 3) * 3 + 3, 0) : monthEnd(last);
    const s = addUnit(s0, n, u), e = monthEnd(addUnit(mStart(e0), n, u));
    return dtab(t, c, existingDates(t, c, d => d >= s && d <= e));
  };
  const prevNext = (unit, dir) => (eng, a, st) => {
    const { t, c, dates } = datesArg(eng, a[0], st, 'PREVIOUS/NEXT'); if (!dates.length) return dtab(t, c, []);
    const ref = dir < 0 ? dates[0] : dates[dates.length - 1];
    const s0 = unit === 'YEAR' ? yStart(ref) : unit === 'QUARTER' ? qStart(ref) : unit === 'MONTH' ? mStart(ref) : ref;
    if (unit === 'DAY') { const d = addUnit(ref, dir, 'DAY'); return dtab(t, c, existingDates(t, c, x => x.getTime() === d.getTime())); }
    const s = addUnit(s0, dir, unit); const e = dUTC(s.getUTCFullYear(), s.getUTCMonth() + (unit === 'YEAR' ? 12 : unit === 'QUARTER' ? 3 : 1), 0);
    return dtab(t, c, existingDates(t, c, d => d >= s && d <= e));
  };
  FN.PREVIOUSMONTH = prevNext('MONTH', -1); FN.PREVIOUSQUARTER = prevNext('QUARTER', -1); FN.PREVIOUSYEAR = prevNext('YEAR', -1); FN.PREVIOUSDAY = prevNext('DAY', -1);
  FN.NEXTMONTH = prevNext('MONTH', 1); FN.NEXTQUARTER = prevNext('QUARTER', 1); FN.NEXTYEAR = prevNext('YEAR', 1); FN.NEXTDAY = prevNext('DAY', 1);
  FN.DATESINPERIOD = (eng, a, st) => {
    need(a, 4, 'DATESINPERIOD', 'DATESINPERIOD(Tarih[Tarih], BaşlangıçTarihi, Sayı, Birim)');
    const { t, c } = colArg(a[0], 'DATESINPERIOD'); const s = dateArg(eng, a[1], st, 'DATESINPERIOD'); if (!s) return dtab(t, c, []); const n = num(evS(eng, a[2], st)); const u = unitArg(eng, a[3], st);
    const o = addUnit(s, n, u);
    return dtab(t, c, existingDates(t, c, d => n < 0 ? (d > o && d <= s) : (d >= s && d < o)));
  };
  FN.DATESBETWEEN = (eng, a, st) => { const { t, c } = colArg(a[0], 'DATESBETWEEN'); const s = a[1] ? dateArg(eng, a[1], st, 'DATESBETWEEN') : null, e = a[2] ? dateArg(eng, a[2], st, 'DATESBETWEEN') : null; return dtab(t, c, existingDates(t, c, d => (!s || d >= s) && (!e || d <= e))); };
  const firstLast = (isLast) => (eng, a, st) => { const { t, c, dates } = datesArg(eng, a[0], st, isLast ? 'LASTDATE' : 'FIRSTDATE'); return dtab(t, c, dates.length ? [isLast ? dates[dates.length - 1] : dates[0]] : []); };
  FN.FIRSTDATE = firstLast(false); FN.LASTDATE = firstLast(true);
  FN.STARTOFMONTH = (eng, a, st) => { const { t, c, dates } = datesArg(eng, a[0], st, 'STARTOFMONTH'); return dtab(t, c, dates.length ? [mStart(dates[0])] : []); };
  FN.ENDOFMONTH = (eng, a, st) => { const { t, c, dates } = datesArg(eng, a[0], st, 'ENDOFMONTH'); return dtab(t, c, dates.length ? [monthEnd(dates[dates.length - 1])] : []); };
  FN.STARTOFYEAR = (eng, a, st) => { const { t, c, dates } = datesArg(eng, a[0], st, 'STARTOFYEAR'); return dtab(t, c, dates.length ? [yStart(dates[0])] : []); };
  FN.ENDOFYEAR = (eng, a, st) => { const { t, c, dates } = datesArg(eng, a[0], st, 'ENDOFYEAR'); return dtab(t, c, dates.length ? [dUTC(dates[dates.length - 1].getUTCFullYear(), 11, 31)] : []); };
  FN.CLOSINGBALANCEMONTH = (eng, a, st) => FN.CALCULATE(eng, [a[0], { type: 'call', fn: 'ENDOFMONTH', args: [a[1]] }], st);
  FN.OPENINGBALANCEYEAR = (eng, a, st) => FN.CALCULATE(eng, [a[0], { type: 'call', fn: 'PREVIOUSDAY', args: [{ type: 'call', fn: 'STARTOFYEAR', args: [a[1]] }] }], st);


  /* ---------- Ek fonksiyonlar (ileri seviye) ---------- */
  const rowKey = r => r.map(keyOf).join('␟');
  function tableRows(tb) { const out = []; for (let i = 0; i < tLen(tb); i++) out.push(tRow(tb, i)); return out; }
  FN.TREATAS = (eng, a, st) => {
    need(a, 2, 'TREATAS', 'TREATAS(Tablo, Sütun1, [Sütun2], …)'); const tb = evT(eng, a[0], st, 'TREATAS');
    const lins = a.slice(1).map(x => colArg(x, 'TREATAS')); if (tCols(tb).length !== lins.length) err('TREATAS: tablodaki sütun sayısı (' + tCols(tb).length + ') verilen sütun sayısıyla (' + lins.length + ') aynı olmalı.');
    return colTable(lins, tableRows(tb));
  };
  FN.EXCEPT = (eng, a, st) => { const t1 = evT(eng, a[0], st, 'EXCEPT'), t2 = evT(eng, a[1], st, 'EXCEPT'); if (tCols(t1).length !== tCols(t2).length) err('EXCEPT: iki tablonun sütun sayısı aynı olmalı.'); const ks = new Set(tableRows(t2).map(rowKey)); const seen = new Set(); return { kind: 'table', cols: tCols(t1), rows: tableRows(t1).filter(r => { const k = rowKey(r); if (ks.has(k) || seen.has(k)) return false; seen.add(k); return true; }) }; };
  FN.INTERSECT = (eng, a, st) => { const t1 = evT(eng, a[0], st, 'INTERSECT'), t2 = evT(eng, a[1], st, 'INTERSECT'); if (tCols(t1).length !== tCols(t2).length) err('INTERSECT: iki tablonun sütun sayısı aynı olmalı.'); const ks = new Set(tableRows(t2).map(rowKey)); return { kind: 'table', cols: tCols(t1), rows: tableRows(t1).filter(r => ks.has(rowKey(r))) }; };
  FN.GENERATE = (eng, a, st) => {
    const t1 = evT(eng, a[0], st, 'GENERATE'); const c1 = tCols(t1); let c2 = null; const rows = [];
    for (let i = 0; i < tLen(t1); i++) { const s2 = Object.assign({}, st, { frames: st.frames.concat([tFrame(t1, i)]) }); const t2 = evT(eng, a[1], s2, 'GENERATE'); if (!c2) c2 = tCols(t2); const r1 = tRow(t1, i); for (let j = 0; j < tLen(t2); j++) rows.push(r1.concat(tRow(t2, j))); }
    return { kind: 'table', cols: c1.concat(c2 || []), rows };
  };
  FN.NATURALINNERJOIN = (eng, a, st) => { const t1 = evT(eng, a[0], st), t2 = evT(eng, a[1], st); const c1 = tCols(t1), c2 = tCols(t2); const common = c1.map((c, i) => [i, c2.findIndex(d => d.name === c.name)]).filter(x => x[1] >= 0); if (!common.length) err('NATURALINNERJOIN: ortak sütun yok.'); const rows = []; tableRows(t1).forEach(r1 => tableRows(t2).forEach(r2 => { if (common.every(([i, j]) => keyOf(r1[i]) === keyOf(r2[j]))) rows.push(r1.concat(r2.filter((v, j) => !common.some(x => x[1] === j)))); })); return { kind: 'table', cols: c1.concat(c2.filter((c, j) => !common.some(x => x[1] === j))), rows }; };
  FN.CONTAINS = (eng, a, st) => { const tb = evT(eng, a[0], st, 'CONTAINS'); const cs = tCols(tb); const pairs = []; for (let i = 1; i + 1 < a.length; i += 2) { const rc = colArg(a[i], 'CONTAINS'); const j = cs.findIndex(c => c.lin && c.lin.t === rc.t && c.lin.c === rc.c); if (j < 0) err('CONTAINS: ' + rc.t + '[' + rc.c + '] tabloda yok.'); pairs.push([j, evS(eng, a[i + 1], st)]); } return tableRows(tb).some(r => pairs.every(([j, v]) => cmpVals(r[j], v) === 0 && isBlank(r[j]) === isBlank(v))); };
  FN.ISEMPTY = (eng, a, st) => tLen(evT(eng, a[0], st, 'ISEMPTY')) === 0;
  FN.COUNTAX = (eng, a, st) => { const tb = evT(eng, a[0], st, 'COUNTAX'); const v = iterate(eng, tb, st, s => evS(eng, a[1], s)).filter(x => !isBlank(x) && x !== ''); return v.length || null; };
  FN.HASONEFILTER = (eng, a, st) => { const { t, c } = colArg(a[0], 'HASONEFILTER'); return st.ctx.filters.some(f => affects(f, t, c)) && distinctCol(visible(st.ctx, t), t, c).length === 1; };
  function pctl(arr, k) { const v = nums(arr).sort((x, y) => x - y); if (!v.length) return null; if (k < 0 || k > 1) err('Yüzdebirlik değeri 0 ile 1 arasında olmalı.'); const h = (v.length - 1) * k; const lo = Math.floor(h); return v[lo] + (h - lo) * ((v[lo + 1] !== undefined ? v[lo + 1] : v[lo]) - v[lo]); }
  FN['PERCENTILE.INC'] = (eng, a, st) => pctl(colVals(eng, a[0], st, 'PERCENTILE.INC'), num(evS(eng, a[1], st)));
  FN['PERCENTILEX.INC'] = (eng, a, st) => { const tb = evT(eng, a[0], st, 'PERCENTILEX.INC'); return pctl(iterate(eng, tb, st, s => evS(eng, a[1], s)), num(evS(eng, a[2], st))); };
  const varOf = (arr, samp) => { const v = nums(arr); if (v.length < (samp ? 2 : 1)) return null; const m = v.reduce((x, y) => x + y, 0) / v.length; return v.reduce((x, y) => x + (y - m) ** 2, 0) / (v.length - (samp ? 1 : 0)); };
  FN['VAR.S'] = (eng, a, st) => varOf(colVals(eng, a[0], st, 'VAR.S'), true); FN['VAR.P'] = (eng, a, st) => varOf(colVals(eng, a[0], st, 'VAR.P'), false);
  FN['VARX.S'] = (eng, a, st) => varOf(iterate(eng, evT(eng, a[0], st), st, s => evS(eng, a[1], s)), true); FN['VARX.P'] = (eng, a, st) => varOf(iterate(eng, evT(eng, a[0], st), st, s => evS(eng, a[1], s)), false);
  FN['STDEVX.S'] = (eng, a, st) => { const v = FN['VARX.S'](eng, a, st); return v === null ? null : Math.sqrt(v); }; FN['STDEVX.P'] = (eng, a, st) => { const v = FN['VARX.P'](eng, a, st); return v === null ? null : Math.sqrt(v); };
  FN.GEOMEAN = (eng, a, st) => { const v = nums(colVals(eng, a[0], st, 'GEOMEAN')); return v.length ? Math.exp(v.reduce((x, y) => x + Math.log(y), 0) / v.length) : null; };
  function nonBlank(eng, a, st, last) {
    const { t, c } = colArg(a[0], last ? 'LASTNONBLANK' : 'FIRSTNONBLANK'); const vals = distinctCol(visible(st.ctx, t), t, c).filter(v => !isBlank(v)).sort((x, y) => cmpVals(x, y));
    if (last) vals.reverse();
    for (const v of vals) { const fr = { cols: [{ name: t + '[' + c + ']', short: c, lin: { t, c } }], vals: [v] }; const r = evS(eng, a[1], Object.assign({}, st, { frames: st.frames.concat([fr]) })); if (!isBlank(r)) return { v, r }; }
    return null;
  }
  FN.LASTNONBLANK = (eng, a, st) => { const { t, c } = colArg(a[0], 'LASTNONBLANK'); const x = nonBlank(eng, a, st, true); return colTable([{ t, c }], x ? [[x.v]] : []); };
  FN.FIRSTNONBLANK = (eng, a, st) => { const { t, c } = colArg(a[0], 'FIRSTNONBLANK'); const x = nonBlank(eng, a, st, false); return colTable([{ t, c }], x ? [[x.v]] : []); };
  FN.LASTNONBLANKVALUE = (eng, a, st) => { const x = nonBlank(eng, a, st, true); return x ? x.r : null; };
  FN.FIRSTNONBLANKVALUE = (eng, a, st) => { const x = nonBlank(eng, a, st, false); return x ? x.r : null; };
  // ebeveyn-çocuk
  FN.PATH = (eng, a, st) => {
    const id = colArg(a[0], 'PATH'), par = colArg(a[1], 'PATH'); if (id.t !== par.t) err('PATH: iki sütun aynı tablodan olmalı.');
    const hit = lookupFrame(st.frames, id.t, id.c); if (!hit) err('PATH satır bağlamında çalışır (hesaplanmış sütun ya da yineleyici içinde).');
    const ix = keyIndex(id.t, id.c); const rows = T[id.t].rows; const out = []; let cur = hit.v; let guard = 0;
    while (!isBlank(cur) && guard++ < 100) { out.unshift(cur); const j = ix.get(keyOf(cur)); if (j === undefined) break; cur = rows[j][par.c]; }
    return out.join('|');
  };
  FN.PATHLENGTH = (eng, a, st) => { const p = str(evS(eng, a[0], st)); return p ? p.split('|').length : 0; };
  FN.PATHITEM = (eng, a, st) => { const p = str(evS(eng, a[0], st)).split('|'); const i = num(evS(eng, a[1], st)); const v = p[i - 1]; if (v === undefined || v === '') return null; const tv = a[2] ? evS(eng, a[2], st) : 0; const ty = typeof tv === 'number' ? tv : /INTEGER/i.test(JSON.stringify(tv)) ? 1 : 0; return ty === 1 ? Number(v) : v; };
  FN.PATHITEMREVERSE = (eng, a, st) => { const p = str(evS(eng, a[0], st)).split('|').reverse(); const v = p[num(evS(eng, a[1], st)) - 1]; if (v === undefined || v === '') return null; const tv = a[2] ? evS(eng, a[2], st) : 0; return (typeof tv === 'number' ? tv : /INTEGER/i.test(JSON.stringify(tv)) ? 1 : 0) === 1 ? Number(v) : v; };
  FN.PATHCONTAINS = (eng, a, st) => str(evS(eng, a[0], st)).split('|').includes(str(evS(eng, a[1], st)));
  // DATATABLE("Ad", STRING, "Değer", INTEGER, {{"a", 1}, {"b", 2}})
  FN.DATATABLE = (eng, a, st) => {
    const lst = a[a.length - 1]; if (!lst || lst.type !== 'list') err('DATATABLE son bağımsız değişken olarak {{…}, {…}} satır listesi ister.');
    const cols = [], typs = []; for (let i = 0; i + 1 < a.length - 1; i += 2) { if (a[i].type !== 'lit') err('DATATABLE: sütun adı tırnak içinde olmalı.'); cols.push({ name: '[' + a[i].v + ']', short: a[i].v, lin: null }); typs.push(a[i + 1].type === 'id' ? a[i + 1].name.toUpperCase() : ''); }
    const conv = (v, ty) => { if (isBlank(v)) return null; if (ty === 'DATETIME' && typeof v === 'string') { const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return dUTC(+m[1], +m[2] - 1, +m[3]); } if (['INTEGER', 'DOUBLE', 'CURRENCY'].includes(ty) && typeof v === 'string' && v.trim() !== '' && !isNaN(+v)) return +v; if (ty === 'STRING' && typeof v === 'number') return String(v); return v; };
    const rows = lst.items.map(tp => { if (tp.length === 1 && tp[0].type === 'list') { const it = tp[0].items; tp = it.every(x => x.length === 1) ? it.map(x => x[0]) : it[0]; } return tp.map(e => evS(eng, e, st)); });
    return { kind: 'table', cols, rows: rows.map(r => r.slice(0, cols.length).map((v, i) => conv(v, typs[i]))) };
  };
  // pencere fonksiyonları (tek ilişki tablosu, sıralı)
  FN.ORDERBY = (eng, a) => ({ kind: 'orderby', items: (() => { const out = []; for (let i = 0; i < a.length; i++) { let desc = false; if (a[i + 1] && a[i + 1].type === 'id' && ['ASC', 'DESC'].includes(a[i + 1].name.toUpperCase())) { desc = a[i + 1].name.toUpperCase() === 'DESC'; out.push({ e: a[i], desc }); i++; } else out.push({ e: a[i], desc }); } return out; })() });
  FN.PARTITIONBY = (eng, a) => ({ kind: 'partitionby', cols: a.map(x => colArg(x, 'PARTITIONBY')) });
  function winSetup(eng, args, st, fn) {
    let rel = null, ob = null, pb = null;
    args.forEach(x => { if (x.type === 'call' && x.fn === 'ORDERBY') ob = E(eng, x, st); else if (x.type === 'call' && x.fn === 'PARTITIONBY') pb = E(eng, x, st); else if (x.type !== 'empty' && !(x.type === 'id' && ['KEEP', 'PARTIAL'].includes(x.name.toUpperCase()))) { const v = E(eng, x, st); if (isTable(v)) rel = v; } });
    if (!rel) err(fn + ' bir ilişki tablosu ister (ör. ALLSELECTED(Tarih[YilAy])).');
    const cs = tCols(rel); let rows = tableRows(rel).map((r, i) => ({ r, f: tFrame(rel, i) }));
    if (!ob) ob = { items: cs.map(c => ({ e: { type: 'col', t: c.lin ? c.lin.t : '', c: c.lin ? c.lin.c : c.short }, desc: false })) };
    const keyed = rows.map(x => ({ x, k: ob.items.map(o => evS(eng, o.e, Object.assign({}, st, { frames: st.frames.concat([x.f]) }))) }));
    keyed.sort((p, q) => { for (let i = 0; i < ob.items.length; i++) { const c = rankCompare(p.k[i], q.k[i]); if (c) return ob.items[i].desc ? -c : c; } return 0; });
    // geçerli satır
    const curVals = cs.map(c => { if (!c.lin) return undefined; const h = lookupFrame(st.frames, c.lin.t, c.lin.c); if (h) return h.v; const d = distinctCol(visible(st.ctx, c.lin.t), c.lin.t, c.lin.c); return d.length === 1 ? d[0] : undefined; });
    let part = keyed;
    if (pb) { const pIdx = pb.cols.map(pc => cs.findIndex(c => c.lin && c.lin.t === pc.t && c.lin.c === pc.c)); part = keyed.filter(k => pIdx.every((j, n) => j >= 0 && curVals[j] !== undefined && keyOf(k.x.r[j]) === keyOf(curVals[j]))); }
    const known = curVals.map((v, j) => [v, j]).filter(x => x[0] !== undefined);
    const cur = known.length ? part.findIndex(k => known.every(([v, j]) => keyOf(k.x.r[j]) === keyOf(v))) : -1;
    return { rel, cs, part, cur };
  }
  const winOut = (w, list) => w.rel.base ? baseTable(w.rel.base, list.map(k => k.x.f.i)) : { kind: 'table', cols: w.cs, rows: list.map(k => k.x.r) };
  FN.OFFSET = (eng, a, st) => { const d = num(evS(eng, a[0], st)); const w = winSetup(eng, a.slice(1), st, 'OFFSET'); if (w.cur < 0) return winOut(w, []); const k = w.part[w.cur + d]; return winOut(w, k ? [k] : []); };
  FN.INDEX = (eng, a, st) => { const n = num(evS(eng, a[0], st)); const w = winSetup(eng, a.slice(1), st, 'INDEX'); const k = n > 0 ? w.part[n - 1] : w.part[w.part.length + n]; return winOut(w, k ? [k] : []); };
  FN.WINDOW = (eng, a, st) => {
    need(a, 5, 'WINDOW', 'WINDOW(Başlangıç, REL|ABS, Bitiş, REL|ABS, İlişki, ORDERBY(...))');
    const from = num(evS(eng, a[0], st)), fT = E(eng, a[1], st), to = num(evS(eng, a[2], st)), tT = E(eng, a[3], st);
    const w = winSetup(eng, a.slice(4), st, 'WINDOW'); const n = w.part.length;
    const pos = (v, ty) => (ty && ty.v === 'ABS') ? (v > 0 ? v - 1 : n + v) : w.cur + v;
    if (((!fT || fT.v !== 'ABS') || (!tT || tT.v !== 'ABS')) && w.cur < 0) return winOut(w, []);
    const s0 = Math.max(0, pos(from, fT)), e0 = Math.min(n - 1, pos(to, tT));
    return winOut(w, s0 <= e0 ? w.part.slice(s0, e0 + 1) : []);
  };
  FN.RANK = (eng, a, st) => { const w = winSetup(eng, a.filter(x => !(x.type === 'id' && ['DENSE', 'SKIP'].includes(x.name.toUpperCase()))), st, 'RANK'); return w.cur < 0 ? null : w.cur + 1; };
  FN.ROWNUMBER = (eng, a, st) => { const w = winSetup(eng, a, st, 'ROWNUMBER'); return w.cur < 0 ? null : w.cur + 1; };
  // tarih ekleri
  FN.WEEKNUM = (eng, a, st) => { const d = dateArg(eng, a[0], st, 'WEEKNUM'); if (!d) return null; const ty = a[1] ? num(evS(eng, a[1], st)) : 1; if (ty === 21) { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); } const y0 = dUTC(d.getUTCFullYear(), 0, 1); const off = ty === 2 ? (y0.getUTCDay() + 6) % 7 : y0.getUTCDay(); return Math.floor((Math.round((d - y0) / 86400000) + off) / 7) + 1; };
  FN.STARTOFQUARTER = (eng, a, st) => { const { t, c, dates } = datesArg(eng, a[0], st, 'STARTOFQUARTER'); return dtab(t, c, dates.length ? [qStart(dates[0])] : []); };
  FN.ENDOFQUARTER = (eng, a, st) => { const { t, c, dates } = datesArg(eng, a[0], st, 'ENDOFQUARTER'); if (!dates.length) return dtab(t, c, []); const l = dates[dates.length - 1]; return dtab(t, c, [dUTC(l.getUTCFullYear(), Math.floor(l.getUTCMonth() / 3) * 3 + 3, 0)]); };
  FN.CLOSINGBALANCEQUARTER = (eng, a, st) => FN.CALCULATE(eng, [a[0], { type: 'call', fn: 'ENDOFQUARTER', args: [a[1]] }], st);
  FN.CLOSINGBALANCEYEAR = (eng, a, st) => FN.CALCULATE(eng, [a[0], { type: 'call', fn: 'ENDOFYEAR', args: [a[1]] }], st);
  FN.NETWORKDAYS = (eng, a, st) => { const s = dateArg(eng, a[0], st, 'NETWORKDAYS'), e = dateArg(eng, a[1], st, 'NETWORKDAYS'); if (!s || !e) return null; let n = 0; const sg = s <= e ? 1 : -1; for (let d = s; sg > 0 ? d <= e : d >= e; d = dUTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + sg)) { const w = d.getUTCDay(); if (w !== 0 && w !== 6) n++; } return n * sg; };
  FN.FIND = (eng, a, st) => { const i = str(evS(eng, a[1], st)).indexOf(str(evS(eng, a[0], st)), a[2] ? num(evS(eng, a[2], st)) - 1 : 0); if (i < 0) { if (a[3]) return evS(eng, a[3], st); err('FIND aranan metni bulamadı.'); } return i + 1; };
  FN.REPLACE = (eng, a, st) => { const s0 = str(evS(eng, a[0], st)); const i = num(evS(eng, a[1], st)) - 1, n = num(evS(eng, a[2], st)); return s0.slice(0, i) + str(evS(eng, a[3], st)) + s0.slice(i + n); };
  FN.COMBINEVALUES = (eng, a, st) => a.slice(1).map(x => str(evS(eng, x, st))).join(str(evS(eng, a[0], st)));
  FN.CONVERT = (eng, a, st) => { const v = evS(eng, a[0], st); const ty = E(eng, a[1], st); const t = ty && ty.kind === 'kw' ? ty.v : ''; if (t === 'STRING') return str(v); if (t === 'INTEGER') return Math.round(num(v)); if (t === 'DOUBLE' || t === 'CURRENCY') return num(v); if (t === 'BOOLEAN') return truthy(v); return v; };
  FN.EVEN = m1(v => { const r = Math.ceil(Math.abs(v)); return Math.sign(v) * (r % 2 ? r + 1 : r); }); FN.ODD = m1(v => { const r = Math.ceil(Math.abs(v)); return Math.sign(v || 1) * (r % 2 ? r : r + 1); });
  FN.CEILING = (eng, a, st) => { const v = num(evS(eng, a[0], st)), s0 = a[1] ? num(evS(eng, a[1], st)) : 1; return Math.ceil(v / s0) * s0; };
  FN.FLOOR = (eng, a, st) => { const v = num(evS(eng, a[0], st)), s0 = a[1] ? num(evS(eng, a[1], st)) : 1; return Math.floor(v / s0) * s0; };
  FN.MROUND = (eng, a, st) => { const v = num(evS(eng, a[0], st)), s0 = num(evS(eng, a[1], st)); return Math.round(v / s0) * s0; };
  FN.LOG = (eng, a, st) => Math.log(num(evS(eng, a[0], st))) / Math.log(a[1] ? num(evS(eng, a[1], st)) : 10);
  FN.PI = () => Math.PI; FN.RAND = () => 0.5;
  FN.ALLCROSSFILTERED = FN.ALL;
  FN.SELECTEDMEASURE = () => err('SELECTEDMEASURE yalnızca hesaplama grubu öğelerinde kullanılır; bu oyun alanında hesaplama grubu tanımlanamaz.');
  /* ---------- Genel arayüz ---------- */
  function stripDef(src) {
    const m = src.match(/^\s*([^\n=()\[\]"'{},]+?(?:\s\([^\n()=\[\]]*\))?)\s*:?=(?!=)/);
    if (m && !/^\s*(VAR|RETURN|EVALUATE|DEFINE)\b/i.test(m[1]) && !/[<>!]$/.test(m[1])) return { name: m[1].trim(), expr: src.slice(m[0].length) };
    return { name: null, expr: src };
  }
  function buildFilters(spec) { // spec: [{t,c,values:[...]}]
    return (spec || []).filter(s => s.values && s.values.length).map(s => ({ t: s.t, c: s.c, keys: new Set(s.values.map(keyOf)) }));
  }
  function evalMeasure(measures, exprSrc, filterSpec, opts) { return withCache(() => evalMeasure0(measures, exprSrc, filterSpec, opts)); }
  function evalMeasure0(measures, exprSrc, filterSpec, opts) {
    const eng = new Engine(measures);
    const ast = typeof exprSrc === 'string' ? parse(stripDef(exprSrc).expr).expr() : exprSrc;
    const f = buildFilters(filterSpec); const base = mkCtx(f); base.shadow = opts && opts.shadow ? buildFilters(opts.shadow) : f; base.scope = (opts && opts.scope) || []; base.user = opts && opts.user;
    const v = E(eng, ast, { ctx: base, frames: [], vars: null });
    return isTable(v) ? tScalar(v) : v;
  }
  // görsel sorgusu: satır ekseni sütunları ve ölçüler
  function axisValues(colRefs, slicerSpec, measures) {
    if (!colRefs.length) return [[]];
    const eng = new Engine(measures); const ctx = mkCtx(buildFilters(slicerSpec));
    const byT = {}; colRefs.forEach(c => (byT[c.t] = byT[c.t] || []).push(c));
    let combos = [[]]; const order = [];
    for (const t in byT) { const vals = groupBy(eng, { ctx, frames: [] }, t, byT[t]); order.push(...byT[t]); const nc = []; combos.forEach(cb => vals.forEach(v => nc.push(cb.concat(v)))); combos = nc; }
    // asıl sıraya göre yeniden diz
    const pos = colRefs.map(c => order.findIndex(o => o.t === c.t && o.c === c.c));
    combos = combos.map(cb => pos.map(p => cb[p]));
    combos.sort((x, y) => { for (let i = 0; i < x.length; i++) { const r = sortCompare(colRefs[i], x[i], y[i]); if (r) return r; } return 0; });
    return combos;
  }
  function sortCompare(col, a, b) {
    const sb = T[col.t].sortBy && T[col.t].sortBy[col.c];
    if (sb) { const ix = keyIndex(col.t, col.c); const ra = T[col.t].rows[ix.get(keyOf(a))], rb = T[col.t].rows[ix.get(keyOf(b))]; if (ra && rb) return ra[sb] - rb[sb]; }
    if (col.c === 'HaftaninGunu') { const o = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']; return o.indexOf(a) - o.indexOf(b); }
    if (col.c === 'Durum') { const o = ['Teslim Edildi', 'Kargoda', 'İade', 'İptal']; return o.indexOf(a) - o.indexOf(b); }
    return rankCompare(a, b);
  }
  function query(opts) { return withCache(() => query0(opts)); }
  function query0(opts) {
    // opts: {rows:[{t,c}], measures:{...}, values:[names|expr], slicers:[{t,c,values}], extra:[{t,c,values}], totals:true}
    const ms = opts.measures; const rows = opts.rows || []; const sl = opts.slicers || [];
    const combos = axisValues(rows, sl.concat(opts.extra || []), ms);
    const out = [];
    const asts = opts.values.map(v => { const m = Object.keys(ms).find(k => k === v); return m ? { type: 'mref', name: m } : parse(stripDef(v).expr).expr(); });
    combos.forEach(cb => {
      const spec = sl.concat(opts.extra || []).filter(s => !rows.some(r => r.t === s.t && r.c === s.c)).concat(rows.map((r, i) => ({ t: r.t, c: r.c, values: [cb[i]] })));
      const sameAxis = sl.concat(opts.extra || []).filter(s => rows.some(r => r.t === s.t && r.c === s.c));
      if (sameAxis.length && sameAxis.some(s => { const i = rows.findIndex(r => r.t === s.t && r.c === s.c); return !s.values.some(v => keyOf(v) === keyOf(cb[i])); })) return;
      const vals = asts.map(a => evalMeasure(ms, a, spec, { shadow: sl, scope: rows }));
      if (opts.keepBlank || vals.some(v => !isBlank(v))) out.push({ keys: cb, vals });
    });
    let total = null;
    if (opts.totals !== false) total = asts.map(a => evalMeasure(ms, a, sl.concat(opts.extra || []), { shadow: sl, scope: [] }));
    return { rows: out, total };
  }
  function runQuery(measures, src) { return withCache(() => runQuery0(measures, src)); }
  function runQuery0(measures, src) {
    const q = parse(src).query();
    const ms = Object.assign({}, measures);
    let vars = null;
    q.defs.forEach(d => { if (d.kind === 'm') ms[d.name] = { name: d.name, expr: '', _ast: d.e }; });
    const eng = new Engine(ms); const ctx = mkCtx([]);
    q.defs.filter(d => d.kind === 'v').forEach(d => { const v = E(eng, d.e, { ctx, frames: [], vars }); vars = Object.assign(Object.create(vars), { [d.name.toLowerCase()]: { v } }); });
    let tb = E(eng, q.e, { ctx, frames: [], vars });
    if (!isTable(tb)) err('EVALUATE bir tablo döndürmeli. Tek bir değeri görmek için { [Ölçü] } ya da ROW("Sonuç", [Ölçü]) yaz.');
    const cols = tCols(tb); let rows = []; for (let i = 0; i < tLen(tb); i++) rows.push({ v: tRow(tb, i), f: tFrame(tb, i) });
    if (q.order.length) {
      const keys = rows.map(r => q.order.map(o => evS(eng, o.e, { ctx, frames: [r.f], vars })));
      const ix = rows.map((r, i) => i).sort((x, y) => { for (let k = 0; k < q.order.length; k++) { const c = rankCompare(keys[x][k], keys[y][k]); if (c) return q.order[k].desc ? -c : c; } return 0; });
      rows = ix.map(i => rows[i]);
    }
    return { cols: cols.map(c => c.name.startsWith('[') ? c.short : c.name), rows: rows.map(r => r.v) };
  }
  function check(src, isQuery) { try { const t = stripDef(src); if (isQuery) parse(src).query(); else parse(t.expr).expr(); return null; } catch (e) { return e.message; } }

  root.PBI_DAX = { batch: withCache, parse, tokenize, evalMeasure, query, runQuery, format, fmtNum, str, isBlank, isDate, keyOf, fmtDate, stripDef, check, FN, T, TNAMES, DaxError, sortCompare };
})(typeof window !== 'undefined' ? window : globalThis);
