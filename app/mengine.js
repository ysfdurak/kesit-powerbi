/* Kesit Power BI — küçük bir M (Power Query formül dili) alt küme yorumlayıcısı.
   Gerçek Power Query motoru DEĞİLDİR: kaynağa bağlanmaz, sorgu katlamaz, gizlilik düzeyi ve tembel akış yoktur.
   İlke: desteklenmeyen işlev ya da seçenekte sessizce yanlış sonuç vermez, açık hata verir.
   Tablo biçimi Power Query Lab ile aynıdır: { cols: [{name, type}], rows: [[...]] }; hücre hatası { pqErr, merr }.
   Uyum testleri: tests/mval.js (resmî M belgesindeki örnekler). */
(function (W) {
'use strict';

/* ---------- Değer sınıfları ---------- */
class MErr extends Error { constructor(rec) { super(rec.Message); this.rec = rec; } }           // M hatası: try ile yakalanır
class MUnsup extends Error { constructor(msg, kind) { super(msg); this.kind = kind || 'unsupported'; } } // alt küme sınırı: try ile YAKALANMAZ
class MSyntax extends Error { constructor(msg, pos) { super(msg); this.pos = pos; } }
class MRecord { constructor() { this.names = []; this.f = new Map(); } }
class MType { constructor(kind, o) { this.kind = kind; Object.assign(this, o || {}); } }
class MFunc { constructor(fn, name, min, max) { this.fn = fn; this.fname = name || null; this.min = min == null ? 0 : min; this.max = max == null ? 99 : max; } }
class MDuration { constructor(ms) { this.ms = ms; } }
class MBinary { constructor(text) { this.text = text; } }
class Thunk { constructor(fn) { this.fn = fn; this.st = 0; } }
const isThunk = v => v instanceof Thunk;
function force(t) {
  if (!isThunk(t)) return t;
  if (t.st === 2) return t.v;
  if (t.st === 3) throw t.e;
  if (t.st === 1) throw err('Expression.Error', 'A cyclic reference was encountered during evaluation.');
  t.st = 1;
  try { t.v = t.fn(); t.st = 2; t.fn = null; return t.v; } catch (e) { t.st = 3; t.e = e; throw e; }
}
function err(reason, msg, detail) { const r = mkRecord([['Reason', reason], ['Message', msg], ['Detail', detail === undefined ? null : detail]]); return new MErr(r); }
const exprErr = (m, d) => err('Expression.Error', m, d);
function unsup(name, why) { return new MUnsup('“' + name + '” bu alt kümede yok' + (why ? ': ' + why : '') + '.'); }
function mkRecord(pairs) { const r = new MRecord(); pairs.forEach(p => { r.names.push(p[0]); r.f.set(p[0], p[1]); }); return r; }
const isDate = v => v instanceof Date;
const isDT = v => v instanceof Date && v.mk === 'datetime';
const isTable = v => v && typeof v === 'object' && Array.isArray(v.cols) && Array.isArray(v.rows);
const isErrCell = v => v && typeof v === 'object' && 'pqErr' in v;
const mkDate = (y, m, d) => { const x = new Date(Date.UTC(y, m - 1, d)); x.setUTCFullYear(y); return x; };
const mkDT = ms => { const x = new Date(ms); x.mk = 'datetime'; return x; };
function typeName(v) {
  if (v === null || v === undefined) return 'Null';
  if (typeof v === 'number') return 'Number'; if (typeof v === 'string') return 'Text'; if (typeof v === 'boolean') return 'Logical';
  if (isDT(v)) return 'DateTime'; if (isDate(v)) return 'Date'; if (v instanceof MDuration) return 'Duration';
  if (Array.isArray(v)) return 'List'; if (v instanceof MRecord) return 'Record'; if (isTable(v)) return 'Table';
  if (v instanceof MFunc) return 'Function'; if (v instanceof MType) return 'Type'; if (v instanceof MBinary) return 'Binary';
  return 'Any';
}
function cellErr(e) { return { pqErr: (recGet(e.rec, 'Reason') || 'Expression.Error') + ': ' + recGet(e.rec, 'Message'), merr: e }; }
function recGet(r, n) { return r.f.has(n) ? force(r.f.get(n)) : null; }
function liftCell(v) { if (isErrCell(v)) throw (v.merr || exprErr(String(v.pqErr).replace(/^[A-Za-z.]+Error: /, ''))); return v; }
/* Hücreyi fonksiyondan üret; M hatası hücrede kalır, alt küme hatası yukarı çıkar */
function protect(fn) { try { return norm(fn()); } catch (e) { if (e instanceof MErr) return cellErr(e); throw e; } }
const norm = v => { const x = force(v); return x === undefined ? null : x; };

/* ---------- Sözcük tarayıcı + ayrıştırıcı (kaynak üzerinde doğrudan çalışır) ---------- */
const KW = new Set(['and', 'as', 'each', 'else', 'error', 'false', 'if', 'in', 'is', 'let', 'meta', 'not', 'null', 'or', 'otherwise', 'section', 'shared', 'then', 'true', 'try', 'type', 'catch']);
const idStart = c => c !== undefined && /[\p{L}_]/u.test(c);
const idPart = c => c !== undefined && /[\p{L}\p{Nd}_]/u.test(c);
function parse(src) {
  let p = 0; const n = src.length;
  function ws() {
    for (;;) {
      const c = src[p];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\u00a0') { p++; continue; }
      if (c === '/' && src[p + 1] === '/') { while (p < n && src[p] !== '\n') p++; continue; }
      if (c === '/' && src[p + 1] === '*') { const e = src.indexOf('*/', p + 2); if (e < 0) throw new MSyntax('Yorum kapatılmamış (/* için */ yok).', p); p = e + 2; continue; }
      break;
    }
  }
  const fail = (m, at) => { throw new MSyntax(m, at == null ? p : at); };
  function peekWord() { ws(); let q = p; if (!idStart(src[q])) return ''; while (idPart(src[q])) q++; return src.slice(p, q); }
  function isKw(w) { return peekWord() === w; }
  function eatKw(w) { if (isKw(w)) { p += w.length; return true; } return false; }
  function needKw(w, ctx) { if (!eatKw(w)) fail('“' + w + '” bekleniyordu' + (ctx ? ' (' + ctx + ')' : '') + '.'); }
  function eat(s) { ws(); if (src.startsWith(s, p)) { p += s.length; return true; } return false; }
  function need(s, ctx) { if (!eat(s)) { ws(); fail('“' + s + '” bekleniyordu' + (ctx ? ' (' + ctx + ')' : '') + (p < n ? ', burada “' + src.slice(p, p + 12).split('\n')[0] + '” var' : ', kod bitti') + '.'); } }
  /* düz tanımlayıcı: Table.AddColumn, Source.Name */
  function rawId() {
    ws(); const st = p; if (!idStart(src[p])) return null;
    for (;;) { while (idPart(src[p])) p++; if (src[p] === '.' && idStart(src[p + 1])) { p++; continue; } break; }
    return src.slice(st, p);
  }
  function quoted() { // #"..."
    p += 2; let out = '';
    for (;;) { if (p >= n) fail('#" ile açılan ad kapatılmamış.'); const c = src[p]; if (c === '"') { if (src[p + 1] === '"') { out += '"'; p += 2; continue; } p++; return out; } out += c; p++; }
  }
  /* alan adı: [Toplam Satış] gibi boşluklu olabilir; #"..." da olur */
  function fieldName() {
    ws(); if (src[p] === '#' && src[p + 1] === '"') return quoted();
    const st = p; let last = p;
    if (!(idStart(src[p]) || /\p{Nd}/u.test(src[p] || ''))) return null;
    while (p < n) { const c = src[p]; if (idPart(c) || c === '.' || c === ' ') { if (c !== ' ') last = p + 1; p++; } else break; }
    p = last; return src.slice(st, last);
  }
  function str() { // "..." , "" kaçış, #(lf) gibi
    const st = p; p++; let out = '';
    for (;;) {
      if (p >= n) fail('Metin kapatılmamış: tırnak eksik.', st); const c = src[p];
      if (c === '"') { if (src[p + 1] === '"') { out += '"'; p += 2; continue; } p++; return out; }
      if (c === '#' && src[p + 1] === '(') {
        const e = src.indexOf(')', p); if (e < 0) fail('#( kapatılmamış.'); const b = src.slice(p + 2, e); p = e + 1;
        out += b.split(',').map(x => { x = x.trim(); if (x === 'cr') return '\r'; if (x === 'lf') return '\n'; if (x === 'tab') return '\t'; if (x === '#') return '#'; if (/^[0-9a-fA-F]{4}$/.test(x)) return String.fromCharCode(parseInt(x, 16)); fail('Geçersiz #(...) kaçışı: ' + x); return ''; }).join('');
        continue;
      }
      out += c; p++;
    }
  }
  function expr() {
    ws(); const w = peekWord();
    if (w === 'let') return letE();
    if (w === 'if') return ifE();
    if (w === 'each') { p += 4; return { k: 'each', b: expr() }; }
    if (w === 'try') return tryE();
    if (w === 'error') { p += 5; return { k: 'error', e: expr() }; }
    if (src[p] === '(') { const fn = tryFunc(); if (fn) return fn; }
    return coalesce();
  }
  function letE() {
    p += 3; const mem = [];
    do { ws(); const at = p; const name = src[p] === '#' && src[p + 1] === '"' ? quoted() : rawId(); if (!name) fail('let içinde ad bekleniyordu.'); if (KW.has(name)) fail('“' + name + '” ayrılmış sözcük, ad olamaz.', at); if (mem.some(m => m[0] === name)) fail('“' + name + '” adı let içinde iki kez tanımlı.', at); need('=', 'let adımı'); mem.push([name, expr()]); } while (eat(','));
    needKw('in', 'let … in: son adımdan sonra virgül olmamalı'); return { k: 'let', mem, b: expr() };
  }
  function ifE() { p += 2; const c = expr(); needKw('then', 'if'); const a = expr(); needKw('else', 'if … then … else: else zorunludur'); return { k: 'if', c, a, b: expr() }; }
  function tryE() {
    p += 3; const e = expr();
    if (eatKw('otherwise')) return { k: 'try', e, other: expr() };
    if (eatKw('catch')) { const fn = tryFunc(); if (!fn) fail('catch sonrası (e) => … biçimi bekleniyordu.'); if (fn.params.length > 1) fail('catch fonksiyonu en çok bir parametre alır.'); return { k: 'try', e, cat: fn }; }
    return { k: 'try', e };
  }
  function tryFunc() {
    const save = p; ws(); if (src[p] !== '(') return null; p++;
    const params = []; let opt = false;
    try {
      ws();
      if (src[p] !== ')') {
        do {
          let isOpt = false; if (isKw('optional')) { p += 8; isOpt = true; opt = true; }
          else if (opt) { p = save; return null; }
          ws(); const name = src[p] === '#' && src[p + 1] === '"' ? quoted() : rawId(); if (!name || KW.has(name)) { p = save; return null; }
          let ty = null; if (eatKw('as')) ty = typeRef();
          params.push({ name, opt: isOpt, ty });
        } while (eat(','));
      }
      if (!eat(')')) { p = save; return null; }
      let ret = null; if (eatKw('as')) ret = typeRef();
      ws(); if (!src.startsWith('=>', p)) { p = save; return null; }
      p += 2; return { k: 'func', params, ret, b: expr() };
    } catch (e) { if (e instanceof MSyntax) { p = save; return null; } throw e; }
  }
  function typeRef() { let nullable = false; if (isKw('nullable')) { p += 8; nullable = true; } const nm = rawId(); if (!nm) fail('Tür adı bekleniyordu.'); return { name: nm, nullable }; }
  function coalesce() { const a = orE(); ws(); if (src.startsWith('??', p)) { p += 2; return { k: 'coal', a, b: coalesce() }; } return a; }
  function orE() { let a = andE(); while (eatKw('or')) a = { k: 'or', a, b: andE() }; return a; }
  function andE() { let a = isE(); while (eatKw('and')) a = { k: 'and', a, b: isE() }; return a; }
  function isE() { let a = asE(); while (eatKw('is')) a = { k: 'is', a, t: typeRef() }; return a; }
  function asE() { let a = eq(); while (eatKw('as')) a = { k: 'as', a, t: typeRef() }; return a; }
  function eq() {
    let a = rel();
    for (;;) {
      ws();
      if (src[p] === '=' && src[p + 1] !== '>') { p++; a = { k: 'bin', op: '=', a, b: rel() }; continue; }
      if (src.startsWith('<>', p)) { p += 2; a = { k: 'bin', op: '<>', a, b: rel() }; continue; }
      return a;
    }
  }
  function rel() {
    let a = add();
    for (;;) {
      ws();
      if (src.startsWith('<=', p)) { p += 2; a = { k: 'bin', op: '<=', a, b: add() }; continue; }
      if (src.startsWith('>=', p)) { p += 2; a = { k: 'bin', op: '>=', a, b: add() }; continue; }
      if (src[p] === '<' && src[p + 1] !== '>') { p++; a = { k: 'bin', op: '<', a, b: add() }; continue; }
      if (src[p] === '>') { p++; a = { k: 'bin', op: '>', a, b: add() }; continue; }
      return a;
    }
  }
  function add() {
    let a = mul();
    for (;;) { ws(); const c = src[p]; if (c === '+' || c === '-' || c === '&') { p++; a = { k: 'bin', op: c, a, b: mul() }; continue; } return a; }
  }
  function mul() {
    let a = metaE();
    for (;;) { ws(); const c = src[p]; if ((c === '*') || (c === '/' && src[p + 1] !== '/' && src[p + 1] !== '*')) { p++; a = { k: 'bin', op: c, a, b: metaE() }; continue; } return a; }
  }
  function metaE() { const a = unary(); if (eatKw('meta')) { const m = unary(); return { k: 'meta', a, m }; } return a; }
  function unary() {
    ws(); const c = src[p];
    if (c === '-') { p++; return { k: 'neg', a: unary() }; }
    if (c === '+') { p++; return { k: 'pos', a: unary() }; }
    if (isKw('not')) { p += 3; return { k: 'not', a: unary() }; }
    const w = peekWord();
    if (w === 'if' || w === 'let' || w === 'each' || w === 'try' || w === 'error') return expr();
    if (w === 'type') { p += 4; return typeExpr(); }
    return postfix(primary());
  }
  function typeExpr() {
    ws();
    if (isKw('nullable')) { p += 8; return { k: 'tynull', t: typeExpr() }; }
    if (isKw('table')) { const s = p; p += 5; ws(); if (src[p] === '[') { return { k: 'tytable', row: recType() }; } p = s; return { k: 'typrim', name: rawId() }; }
    if (src[p] === '[') return { k: 'tyrec', row: recType() };
    if (src[p] === '{') { p++; const it = typeExpr(); need('}', 'liste türü'); return { k: 'tylist', it }; }
    if (isKw('function')) throw new MUnsup('“type function (...)” tür ifadesi bu alt kümede yok; fonksiyon parametrelerinde “as number” yazabilirsin.');
    const nm = rawId(); if (!nm) fail('Tür adı bekleniyordu.');
    return { k: 'typrim', name: nm };
  }
  function recType() {
    need('['); const f = [];
    ws(); if (src[p] === ']') { p++; return f; }
    do {
      ws(); if (src.startsWith('...', p)) { p += 3; break; }
      if (isKw('optional')) p += 8;
      const name = fieldName(); if (!name) fail('Tür tanımında alan adı bekleniyordu.'); need('=', 'tür tanımı'); f.push([name, typeExpr()]);
    } while (eat(','));
    need(']', 'tür tanımı'); return f;
  }
  function primary() {
    ws(); const c = src[p], st = p;
    if (c === undefined) fail('Kod beklenmedik biçimde bitti.');
    if (c === '"') return { k: 'lit', v: str() };
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[p + 1] || ''))) return num();
    if (c === '(') { p++; const e = expr(); need(')', 'parantez'); return e; }
    if (c === '{') return listE();
    if (c === '[') return bracket();
    if (c === '@') { p++; const nm = src[p] === '#' && src[p + 1] === '"' ? quoted() : rawId(); if (!nm) fail('@ sonrası ad bekleniyordu.'); return { k: 'id', name: nm, at: st, incl: true }; }
    if (c === '#') {
      if (src[p + 1] === '"') { const nm = quoted(); return { k: 'id', name: nm, at: st }; }
      p++; const w = rawId();
      if (w === 'date' || w === 'datetime' || w === 'duration' || w === 'table' || w === 'binary') return { k: 'id', name: '#' + w, at: st };
      if (w === 'infinity') return { k: 'lit', v: Infinity };
      if (w === 'nan') return { k: 'lit', v: NaN };
      throw new MUnsup('“#' + w + '” bu alt kümede yok.');
    }
    if (idStart(c)) {
      const w = rawId();
      if (w === 'true') return { k: 'lit', v: true }; if (w === 'false') return { k: 'lit', v: false }; if (w === 'null') return { k: 'lit', v: null };
      if (KW.has(w)) fail('“' + w + '” burada kullanılamaz.', st);
      return { k: 'id', name: w, at: st };
    }
    if (c === '.' && src.startsWith('...', p)) { p += 3; return { k: 'notimpl' }; }
    fail('Beklenmeyen karakter: “' + c + '”.');
    return null;
  }
  function num() {
    const st = p;
    if (src[p] === '0' && (src[p + 1] === 'x' || src[p + 1] === 'X')) { p += 2; while (/[0-9a-fA-F]/.test(src[p] || '')) p++; return { k: 'lit', v: parseInt(src.slice(st + 2, p), 16) }; }
    while (/[0-9]/.test(src[p] || '')) p++;
    if (src[p] === '.' && /[0-9]/.test(src[p + 1] || '')) { p++; while (/[0-9]/.test(src[p] || '')) p++; }
    if (/[eE]/.test(src[p] || '') && /[0-9+\-]/.test(src[p + 1] || '')) { p += 2; while (/[0-9]/.test(src[p] || '')) p++; }
    if (src[p] === ',' && /[0-9]/.test(src[p + 1] || '') && /^,\d{1,2}[^\d]/.test(src.slice(p, p + 5)) && false) fail('M’de ondalık ayırıcı noktadır.');
    return { k: 'lit', v: +src.slice(st, p) };
  }
  function listE() {
    p++; const items = []; ws(); if (src[p] === '}') { p++; return { k: 'list', items }; }
    do {
      const a = expr(); ws();
      if (src.startsWith('..', p)) { p += 2; items.push({ range: [a, expr()] }); } else items.push(a);
    } while (eat(','));
    need('}', 'liste'); return { k: 'list', items };
  }
  function bracket() {
    /* [ ] = boş kayıt; [ad = ...] = kayıt; [ad] = _[ad]; [[a],[b]] = _ üzerinde projeksiyon */
    const st = p; p++; ws();
    if (src[p] === ']') { p++; return { k: 'rec', mem: [] }; }
    if (src[p] === '[') { p = st; return { k: 'implicit', sel: selector() }; }
    const save = p; const nm = fieldName();
    if (nm == null) fail('Köşeli parantez içinde alan adı bekleniyordu.');
    ws();
    if (src[p] === '=' && src[p + 1] !== '>') {
      p = save; const mem = [];
      do { ws(); if (src[p] === ']') break; const at = p; const nm2 = fieldName(); if (nm2 == null) fail('Kayıtta alan adı bekleniyordu.'); if (mem.some(m => m[0] === nm2)) fail('“' + nm2 + '” alanı kayıtta iki kez tanımlı.', at); need('=', 'kayıt alanı'); mem.push([nm2, expr()]); } while (eat(','));
      need(']', 'kayıt'); return { k: 'rec', mem };
    }
    p = st; return { k: 'implicit', sel: selector() };
  }
  function selector() { // [a] ya da [[a],[b]], sondaki ? isteğe bağlı
    need('['); ws();
    if (src[p] === '[') {
      const names = []; do { need('['); const x = fieldName(); if (x == null) fail('Alan adı bekleniyordu.'); need(']', 'projeksiyon'); names.push(x); } while (eat(','));
      need(']', 'projeksiyon'); const opt = src[p] === '?'; if (opt) p++; return { proj: names, opt };
    }
    const nm = fieldName(); if (nm == null) fail('Alan adı bekleniyordu.'); need(']', 'alan erişimi');
    const opt = src[p] === '?'; if (opt) p++; return { name: nm, opt };
  }
  function postfix(a) {
    for (;;) {
      ws(); const c = src[p];
      if (c === '(') { const at = p; p++; const args = []; ws(); if (src[p] === ')') p++; else { do { args.push(expr()); } while (eat(',')); need(')', 'fonksiyon çağrısı'); } a = { k: 'call', f: a, args, at }; continue; }
      if (c === '[') { a = { k: 'sel', t: a, sel: selector() }; continue; }
      if (c === '{') { p++; const i = expr(); need('}', 'öğe erişimi'); const opt = src[p] === '?'; if (opt) p++; a = { k: 'item', t: a, i, opt }; continue; }
      return a;
    }
  }
  const ast = expr(); ws();
  if (p < n) { const rest = src.slice(p, p + 14).split('\n')[0]; fail(src[p] === ',' ? 'Beklenmeyen virgül: ifade burada bitmeliydi.' : 'İfade bittikten sonra fazla kod var: “' + rest + '”.'); }
  return ast;
}

/* ---------- Ortam ---------- */
class Env {
  constructor(parent, vars, excl) { this.parent = parent; this.vars = vars; this.excl = excl; }
  lookup(name, incl) {
    let e = this, skip = null;
    while (e) {
      if (e.exclFrame && !incl && e.excl === name) { e = e.exclFrame.parent; continue; }
      if (e.vars && e.vars.has(name)) return e.vars.get(name);
      e = e.parent;
    }
    return undefined;
  }
}
function memberEnv(frame, name) { const e = new Env(frame, null); e.exclFrame = frame; e.excl = name; return e; }

let STEPS = 0, MAXSTEPS = 4000000, DEPTH = 0;
function tick() { if (++STEPS > MAXSTEPS) throw new MUnsup('Hesap çok uzadı ve durduruldu (sonsuz döngü olabilir: List.Generate koşulunu kontrol et).', 'limit'); }

function ev(a, env) {
  tick();
  switch (a.k) {
    case 'lit': return a.v;
    case 'id': {
      const v = env.lookup(a.name, a.incl);
      if (v !== undefined) return force(v);
      const g = globalLookup(a.name); if (g !== undefined) return g;
      throw unknownName(a.name);
    }
    case 'let': { const fr = new Env(env, new Map()); a.mem.forEach(m => { const me = memberEnv(fr, m[0]); fr.vars.set(m[0], new Thunk(() => ev(m[1], me))); }); return ev(a.b, fr); }
    case 'if': { const c = ev(a.c, env); if (typeof c !== 'boolean') throw convErr(c, 'Logical'); return c ? ev(a.a, env) : ev(a.b, env); }
    case 'each': return new MFunc(args => { const fr = new Env(env, new Map([['_', args[0]]])); return ev(a.b, fr); }, null, 1, 1);
    case 'func': return mkFunc(a, env);
    case 'try': return evTry(a, env);
    case 'error': { const v = ev(a.e, env); throw makeError(v); }
    case 'notimpl': throw exprErr('Not Implemented');
    case 'meta': { const v = ev(a.a, env); ev(a.m, env); return v; }
    case 'coal': { const v = ev(a.a, env); return v === null ? ev(a.b, env) : v; }
    case 'or': { const x = ev(a.a, env); if (x === true) return true; if (x !== false && x !== null) throw opErr('or', x, null); const y = ev(a.b, env); if (y === true) return true; if (y !== false && y !== null) throw opErr('or', x, y); return x === null || y === null ? null : false; }
    case 'and': { const x = ev(a.a, env); if (x === false) return false; if (x !== true && x !== null) throw opErr('and', x, null); const y = ev(a.b, env); if (y === false) return false; if (y !== true && y !== null) throw opErr('and', x, y); return x === null || y === null ? null : true; }
    case 'not': { const x = ev(a.a, env); if (x === null) return null; if (typeof x !== 'boolean') throw exprErr('We cannot apply operator not to type ' + typeName(x) + '.'); return !x; }
    case 'neg': { const x = ev(a.a, env); if (x === null) return null; if (typeof x !== 'number') throw exprErr('We cannot apply operator - to type ' + typeName(x) + '.'); return -x; }
    case 'pos': { const x = ev(a.a, env); if (x === null) return null; if (typeof x !== 'number') throw exprErr('We cannot apply operator + to type ' + typeName(x) + '.'); return x; }
    case 'bin': return binop(a.op, ev(a.a, env), ev(a.b, env));
    case 'is': return isType(ev(a.a, env), refType(a.t));
    case 'as': return asType(ev(a.a, env), refType(a.t));
    case 'list': { const out = []; a.items.forEach(it => { if (it.range) { const lo = ev(it.range[0], env), hi = ev(it.range[1], env); range(lo, hi, out); } else out.push(protectItem(it, env)); }); return out; }
    case 'rec': { const r = new MRecord(); const fr = new Env(env, new Map()); a.mem.forEach(m => { const me = memberEnv(fr, m[0]); const th = new Thunk(() => ev(m[1], me)); r.names.push(m[0]); r.f.set(m[0], th); fr.vars.set(m[0], th); }); return r; }
    case 'implicit': { const u = env.lookup('_'); if (u === undefined) throw exprErr('The name \'_\' wasn\'t recognized. Make sure it\'s spelled correctly.'); return select(force(u), a.sel); }
    case 'sel': return select(ev(a.t, env), a.sel);
    case 'item': return itemAt(ev(a.t, env), ev(a.i, env), a.opt);
    case 'call': {
      const f = ev(a.f, env);
      if (!(f instanceof MFunc)) throw exprErr('We cannot convert a value of type ' + typeName(f) + ' to type Function.');
      const args = a.args.map(x => new Thunk(() => ev(x, env)));
      return callF(f, args);
    }
    case 'typrim': { const v = env.lookup(a.name); if (v !== undefined) return force(v); return namedType(a.name); }
    case 'tynull': { const t = ev(a.t, env); return new MType(t.kind, Object.assign({}, t, { nullable: true })); }
    case 'tylist': return new MType('list', { item: ev(a.it, env) });
    case 'tyrec': return new MType('record', { row: a.row.map(f => [f[0], ev(f[1], env)]) });
    case 'tytable': return new MType('table', { row: a.row.map(f => [f[0], ev(f[1], env)]) });
  }
  throw new Error('Bilinmeyen düğüm ' + a.k);
}
function protectItem(it, env) { try { return ev(it, env); } catch (e) { if (e instanceof MErr) return cellErr(e); throw e; } }
function mkFunc(a, env) {
  const min = a.params.filter(x => !x.opt).length, max = a.params.length;
  const tys = a.params.map(x => x.ty ? refType(x.ty) : null); const ret = a.ret ? refType(a.ret) : null;
  return new MFunc(args => {
    const fr = new Env(env, new Map());
    a.params.forEach((pm, i) => {
      const th = i < args.length ? args[i] : null;
      if (tys[i]) { const v = force(th); if (!(v === null && pm.opt)) asType(v, tys[i], 'param'); fr.vars.set(pm.name, v); }
      else fr.vars.set(pm.name, th);
    });
    const v = ev(a.b, fr); if (ret) asType(v, ret, 'ret'); return v;
  }, null, min, max);
}
function callF(f, args) {
  if (args.length < f.min || args.length > f.max) throw exprErr((f.fname ? f.fname + ': ' : '') + (args.length > f.max ? 'Too many arguments' : 'Too few arguments') + ' were passed to the function, which expects between ' + f.min + ' and ' + f.max + ' arguments.');
  if (++DEPTH > 1500) { DEPTH = 0; throw new MUnsup('Çağrı zinciri çok derinleşti ve durduruldu (bitmeyen özyineleme olabilir).', 'limit'); }
  try { const r = f.fn(args); return r === undefined ? null : force(r); } finally { DEPTH--; }
}
/* JS içinden M fonksiyonu çağır */
const call = (f, ...a) => { need(f, 'function'); return callF(f, a); };
function evTry(a, env) {
  let val, failed = null;
  const sd = DEPTH;
  try { val = ev(a.e, env); } catch (e) { DEPTH = sd; if (e instanceof MErr) failed = e; else throw e; }
  if (!failed) return a.other || a.cat ? val : mkRecord([['HasError', false], ['Value', val]]);
  if (a.other) return ev(a.other, env);
  if (a.cat) { const fn = mkFunc(a.cat, env); return callF(fn, a.cat.params.length ? [failed.rec] : []); }
  return mkRecord([['HasError', true], ['Error', failed.rec]]);
}
function makeError(v) {
  if (v === null) return exprErr('null');
  if (typeof v === 'string') return exprErr(v);
  if (v instanceof MRecord) {
    let msg = recGet(v, 'Message'); const fmt = recGet(v, 'Message.Format'), pars = recGet(v, 'Message.Parameters');
    if (msg === null && typeof fmt === 'string') msg = fmt.replace(/#\{(\d+)\}/g, (m, i) => (pars && pars[+i] !== undefined ? pars[+i] : m));
    const r = mkRecord([['Reason', recGet(v, 'Reason') === null ? 'Expression.Error' : recGet(v, 'Reason')], ['Message', msg], ['Detail', recGet(v, 'Detail')]]);
    if (fmt !== null) { r.names.push('Message.Format'); r.f.set('Message.Format', fmt); r.names.push('Message.Parameters'); r.f.set('Message.Parameters', pars); }
    return new MErr(r);
  }
  return exprErr('We cannot convert a value of type ' + typeName(v) + ' to type Record.');
}
function opErr(op, a, b) { return exprErr('We cannot apply operator ' + op + ' to types ' + typeName(a) + ' and ' + typeName(b) + '.'); }
function convErr(v, t) { return exprErr('We cannot convert the value ' + fmt(v, 1) + ' to type ' + t + '.', v); }
function range(lo, hi, out) {
  if (lo === null || hi === null) throw exprErr('We cannot convert the value null to type Number.');
  if (typeof lo === 'string' && typeof hi === 'string' && [...lo].length === 1 && [...hi].length === 1) { const a = lo.codePointAt(0), b = hi.codePointAt(0); if (b - a > 70000) throw new MUnsup('Bu metin aralığı alt küme sınırını aşıyor.', 'limit'); for (let c = a; c <= b; c++) out.push(String.fromCodePoint(c)); return; }
  if (typeof lo !== 'number' || typeof hi !== 'number' || lo !== Math.floor(lo) || hi !== Math.floor(hi)) throw new MUnsup('Bu liste aralığı biçimi bu alt kümede yok: yalnız tam sayı ({1..5}) ve tek karakterli metin ({"a".."z"}) aralığı çalışır.');
  if (hi - lo > 1000000) throw new MUnsup('Bu aralık alt küme sınırını (1.000.000 öğe) aşıyor.', 'limit');
  for (let i = lo; i <= hi; i++) out.push(i);
}
function select(t, sel) {
  if (t === null && sel.opt) return null;
  if (isTable(t)) {
    if (sel.proj) return selectCols(t, sel.proj, sel.opt ? 'null' : 'err');
    const i = t.cols.findIndex(c => c.name === sel.name);
    if (i < 0) { if (sel.opt) return null; throw exprErr('The column \'' + sel.name + '\' of the table wasn\'t found.', sel.name); }
    return t.rows.map(r => r[i]);
  }
  if (t instanceof MRecord) {
    if (sel.proj) { const r = new MRecord(); sel.proj.forEach(n => { if (!t.f.has(n)) { if (sel.opt) { r.names.push(n); r.f.set(n, null); return; } throw exprErr('The field \'' + n + '\' of the record wasn\'t found.', n); } r.names.push(n); r.f.set(n, t.f.get(n)); }); return r; }
    if (!t.f.has(sel.name)) { if (sel.opt) return null; throw exprErr('The field \'' + sel.name + '\' of the record wasn\'t found.', sel.name); }
    return force(t.f.get(sel.name));
  }
  throw exprErr('We cannot apply field access to the type ' + typeName(t) + '.');
}
function rowRecord(t, r) {
  const o = new MRecord(); t.cols.forEach((c, i) => { o.names.push(c.name); const v = r[i]; o.f.set(c.name, isErrCell(v) ? new Thunk(() => liftCell(v)) : v); }); return o;
}
function itemAt(t, i, opt) {
  if (t === null && opt) return null;
  if (isTable(t)) {
    if (i instanceof MRecord) {
      const hits = t.rows.filter(r => i.names.every(n => { const c = t.cols.findIndex(x => x.name === n); if (c < 0) throw exprErr('The field \'' + n + '\' of the record wasn\'t found.', n); return valEq(r[c], recGet(i, n)); }));
      if (hits.length === 1) return rowRecord(t, hits[0]);
      if (hits.length === 0) { if (opt) return null; throw exprErr('The key didn\'t match any rows in the table.'); }
      if (opt) throw exprErr('The key matched more than one row in the table.');
      throw exprErr('The key matched more than one row in the table.');
    }
    if (typeof i !== 'number') throw convErr(i, 'Number');
    if (i < 0 || i >= t.rows.length) { if (opt) return null; throw exprErr('There weren\'t enough elements in the enumeration to complete the operation.'); }
    return rowRecord(t, t.rows[i]);
  }
  if (Array.isArray(t)) {
    if (typeof i !== 'number') throw convErr(i, 'Number');
    if (i < 0 || i >= t.length) { if (opt) return null; throw exprErr('There weren\'t enough elements in the enumeration to complete the operation.'); }
    return liftCell(t[i]);
  }
  throw exprErr('We cannot apply item access to the type ' + typeName(t) + '.');
}

/* ---------- İşleçler ---------- */
const TYPE_EQ_NOTE = 'M belirtimi tür eşitliğini uygulamaya bırakır. Bu alt küme yalnız yalın türleri karşılaştırır, ötekinde sonuç tahmin etmez. Uyumluluk için “is”, Value.Is ya da Type.Is kullan.';
function typeEq(a, b) { if (a.row || a.item || b.row || b.item || (a.facet || '') !== (b.facet || '')) throw new MUnsup(TYPE_EQ_NOTE); return a.kind === b.kind && !!a.nullable === !!b.nullable; }
function valEq(a, b) {
  if (isErrCell(a)) liftCell(a); if (isErrCell(b)) liftCell(b);
  if (a === b) return true; if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime() && isDT(a) === isDT(b);
  if (a instanceof MDuration && b instanceof MDuration) return a.ms === b.ms;
  if (a instanceof MType && b instanceof MType) return typeEq(a, b);
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => valEq(x, b[i]));
  if (a instanceof MRecord && b instanceof MRecord) return a.names.length === b.names.length && a.names.every(n => b.f.has(n) && valEq(recGet(a, n), recGet(b, n)));
  if (isTable(a) && isTable(b)) return tablesEq(a, b);
  return false;
}
function tablesEq(a, b) { if (a.cols.length !== b.cols.length || a.rows.length !== b.rows.length) return false; const map = a.cols.map(c => b.cols.findIndex(x => x.name === c.name)); if (map.includes(-1)) return false; return a.rows.every((r, i) => r.every((v, j) => valEq(v, b.rows[i][map[j]]))); }
function ordVal(v) { return v instanceof Date ? v.getTime() : v instanceof MDuration ? v.ms : v; }
function sameKind(a, b) { return typeName(a) === typeName(b); }
function compareVals(a, b) { const x = ordVal(a), y = ordVal(b); return x < y ? -1 : x > y ? 1 : 0; }
function binop(op, a, b) {
  if (op === '=') return valEq(a, b);
  if (op === '<>') return !valEq(a, b);
  if (op === '<' || op === '>' || op === '<=' || op === '>=') {
    if (a === null || b === null) return null;
    if (!sameKind(a, b) || !(typeof a === 'number' || typeof a === 'string' || typeof a === 'boolean' || a instanceof Date || a instanceof MDuration)) throw opErr(op, a, b);
    const c = compareVals(a, b); return op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0;
  }
  if (op === '&') {
    if (a === null || b === null) { if ((a === null || typeof a === 'string' || Array.isArray(a) || a instanceof MRecord || isTable(a)) && (b === null || typeof b === 'string' || Array.isArray(b) || b instanceof MRecord || isTable(b))) return null; throw opErr('&', a, b); }
    if (typeof a === 'string' && typeof b === 'string') return a + b;
    if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
    if (a instanceof MRecord && b instanceof MRecord) return mergeRec(a, b);
    if (isTable(a) && isTable(b)) return combine([a, b]);
    if (isDate(a) && !isDT(a) && false) return null;
    throw opErr('&', a, b);
  }
  if (a === null || b === null) { if (a !== null && !(typeof a === 'number' || a instanceof Date || a instanceof MDuration)) throw opErr(op, a, b); if (b !== null && !(typeof b === 'number' || b instanceof Date || b instanceof MDuration)) throw opErr(op, a, b); return null; }
  if (typeof a === 'number' && typeof b === 'number') { return op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b; }
  if (a instanceof Date && b instanceof MDuration && (op === '+' || op === '-')) { const ms = a.getTime() + (op === '+' ? b.ms : -b.ms); if (isDT(a)) return mkDT(ms); if (b.ms % 86400000 !== 0) return mkDT(ms); return new Date(ms); }
  if (a instanceof MDuration && b instanceof Date && op === '+') return binop('+', b, a);
  if (a instanceof Date && b instanceof Date && op === '-') { if (isDT(a) !== isDT(b)) throw new MUnsup('date ile datetime arasında çıkarma bu alt kümede yok: belge karışık türü göstermiyor. Önce ikisini aynı türe çevir (DateTime.Date ya da DateTime.From).'); return new MDuration(a.getTime() - b.getTime()); }
  if (a instanceof MDuration && b instanceof MDuration && (op === '+' || op === '-')) return new MDuration(op === '+' ? a.ms + b.ms : a.ms - b.ms);
  if (a instanceof MDuration && typeof b === 'number' && (op === '*' || op === '/')) return new MDuration(op === '*' ? a.ms * b : a.ms / b);
  if (typeof a === 'number' && b instanceof MDuration && op === '*') return new MDuration(a * b.ms);
  throw opErr(op, a, b);
}
function mergeRec(a, b) { const r = new MRecord(); a.names.forEach(n => { r.names.push(n); r.f.set(n, a.f.get(n)); }); b.names.forEach(n => { if (!r.f.has(n)) r.names.push(n); r.f.set(n, b.f.get(n)); }); return r; }

/* ---------- Tür sistemi ---------- */
const PRIMS = ['any', 'anynonnull', 'null', 'logical', 'number', 'date', 'datetime', 'duration', 'text', 'binary', 'type', 'list', 'record', 'table', 'function', 'none'];
const UNSUP_PRIMS = ['time', 'datetimezone'];
function namedType(nm) {
  if (PRIMS.includes(nm)) return new MType(nm);
  if (UNSUP_PRIMS.includes(nm)) throw unsup('type ' + nm, 'bu değer türü desteklenmiyor');
  const g = globalLookup(nm); if (g instanceof MType) return g;
  throw exprErr('The name \'' + nm + '\' wasn\'t recognized. Make sure it\'s spelled correctly.');
}
function refType(t) { const m = namedType(t.name); return t.nullable ? new MType(m.kind, Object.assign({}, m, { nullable: true })) : m; }
function isType(v, t) {
  if (v === null) return t.kind === 'any' || t.kind === 'null' || !!t.nullable;
  switch (t.kind) {
    case 'any': return true; case 'anynonnull': return true; case 'null': return false; case 'none': return false;
    case 'logical': return typeof v === 'boolean'; case 'number': return typeof v === 'number'; case 'text': return typeof v === 'string';
    case 'date': return isDate(v) && !isDT(v); case 'datetime': return isDT(v); case 'duration': return v instanceof MDuration; case 'binary': return v instanceof MBinary;
    case 'type': return v instanceof MType; case 'list': return Array.isArray(v); case 'record': return v instanceof MRecord; case 'table': return isTable(v); case 'function': return v instanceof MFunc;
  }
  return false;
}
function kindLabel(t) { const k = t.kind; return k === 'logical' ? 'Logical' : k === 'datetime' ? 'DateTime' : k.charAt(0).toUpperCase() + k.slice(1); }
function asType(v, t) { if (!isType(v, t)) throw convErr(v, kindLabel(t)); return v; }
function colTypeOf(t) { if (!t) return 'any'; if (t.facet) return t.facet; return t.kind === 'anynonnull' ? 'any' : t.kind; }
function inferType(rows, i) { let ty = null; for (const r of rows) { const v = r[i]; if (v === null || isErrCell(v)) continue; const k = typeof v === 'string' ? 'text' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'logical' : isDT(v) ? 'datetime' : isDate(v) ? 'date' : 'any'; if (ty && ty !== k) return 'any'; ty = k; } return 'any'; }

/* ---------- Biçimlendirme ---------- */
function fmtNum(n) { if (Number.isNaN(n)) return '#nan'; if (n === Infinity) return '#infinity'; if (n === -Infinity) return '-#infinity'; return String(+n.toPrecision(15)); }
function fmt(v, depth) {
  depth = depth || 0;
  if (isThunk(v)) { try { v = force(v); } catch (e) { return 'Error'; } }
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') return '"' + v.replace(/"/g, '""') + '"';
  if (typeof v === 'number') return fmtNum(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (isDT(v)) return '#datetime(' + [v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate(), v.getUTCHours(), v.getUTCMinutes(), v.getUTCSeconds()].join(', ') + ')';
  if (isDate(v)) return '#date(' + [v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate()].join(', ') + ')';
  if (v instanceof MDuration) { const a = Math.abs(v.ms) / 1000, s = v.ms < 0 ? -1 : 1; return '#duration(' + [s * Math.floor(a / 86400), s * Math.floor(a % 86400 / 3600), s * Math.floor(a % 3600 / 60), s * (a % 60)].join(', ') + ')'; }
  if (isErrCell(v)) return 'Error';
  if (Array.isArray(v)) return depth > 6 ? '{…}' : '{' + v.map(x => fmt(x, depth + 1)).join(', ') + '}';
  if (v instanceof MRecord) return depth > 6 ? '[…]' : '[' + v.names.map(n => fieldOut(n) + ' = ' + fmt(v.f.get(n), depth + 1)).join(', ') + ']';
  if (isTable(v)) return '#table({' + v.cols.map(c => '"' + c.name + '"').join(', ') + '}, {' + v.rows.map(r => '{' + r.map(x => fmt(x, depth + 1)).join(', ') + '}').join(', ') + '})';
  if (v instanceof MFunc) return 'Function' + (v.fname ? ' (' + v.fname + ')' : '');
  if (v instanceof MType) return 'type ' + v.kind;
  if (v instanceof MBinary) return 'Binary (' + v.text.length + ' karakter)';
  return String(v);
}
const fieldOut = n => /^[\p{L}_][\p{L}\p{Nd}_.]*( [\p{L}\p{Nd}_.]+)*$/u.test(n) ? n : '#"' + n + '"';

/* ---------- Sonuç karşılaştırma (alıştırma denetimi) ---------- */
function deep(a, b) {
  a = norm(a); b = norm(b);
  if (isErrCell(a) || isErrCell(b)) return isErrCell(a) && isErrCell(b);
  if (typeof a === 'number' && typeof b === 'number') return a === b || (Number.isNaN(a) && Number.isNaN(b)) || Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deep(x, b[i]));
  if (a instanceof MRecord && b instanceof MRecord) { if (a.names.length !== b.names.length) return false; return a.names.every(n => { if (!b.f.has(n)) return false; let x, y; try { x = force(a.f.get(n)); } catch (e) { if (!(e instanceof MErr)) throw e; x = cellErr(e); } try { y = force(b.f.get(n)); } catch (e) { if (!(e instanceof MErr)) throw e; y = cellErr(e); } return deep(x, y); }); }
  if (isTable(a) && isTable(b)) { if (a.cols.length !== b.cols.length || a.rows.length !== b.rows.length) return false; if (a.cols.some((c, i) => c.name !== b.cols[i].name)) return false; return a.rows.every((r, i) => r.every((v, j) => deep(v, b.rows[i][j]))); }
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof MDuration && b instanceof MDuration) return a.ms === b.ms;
  if (a instanceof MFunc && b instanceof MFunc) return true;
  if (a instanceof MBinary && b instanceof MBinary) return a.text === b.text;
  if (a instanceof MType && b instanceof MType) return a.kind === b.kind;
  return a === b;
}
const cellOut = v => isErrCell(v) ? 'Error' : fmt(v, 1);
function compareResult(mine, target, opt) {
  opt = opt || {};
  if (typeName(mine) !== typeName(target)) return { ok: false, msg: 'Sonuç türü farklı: hedef ' + typeName(target) + ', seninki ' + typeName(mine) + '.' };
  if (!isTable(target)) { return deep(mine, target) ? { ok: true } : { ok: false, msg: 'Sonuç farklı. Hedef: ' + short(fmt(target)) + ' · Seninki: ' + short(fmt(mine)) }; }
  const mn = mine.cols.map(c => c.name), tn = target.cols.map(c => c.name);
  if (mn.join('|') !== tn.join('|')) { const miss = tn.filter(x => !mn.includes(x)), extra = mn.filter(x => !tn.includes(x)); return { ok: false, msg: 'Sütunlar hedefle aynı değil.' + (miss.length ? ' Eksik: ' + miss.join(', ') + '.' : '') + (extra.length ? ' Fazla: ' + extra.join(', ') + '.' : '') + (!miss.length && !extra.length ? ' Sütun sırası farklı: hedef ' + tn.join(', ') + '.' : '') }; }
  if (opt.types) { const bad = target.cols.filter((c, i) => c.type !== 'any' && c.type !== mine.cols[i].type).map(c => c.name); if (bad.length) return { ok: false, msg: 'Değerler bir yana, şu sütunların türü hedefle aynı değil: ' + bad.join(', ') + ' (hedef türler: ' + target.cols.map(c => c.name + ' ' + c.type).join(', ') + ').' }; }
  if (mine.rows.length !== target.rows.length) return { ok: false, msg: 'Satır sayısı farklı: hedef ' + target.rows.length + ', seninki ' + mine.rows.length + '.' };
  const rk = r => r.map(v => typeof v === 'number' ? fmtNum(+v.toFixed(6)) : cellOut(v)).join('␟');
  if (opt.ordered) { const i = mine.rows.findIndex((r, j) => !r.every((v, c) => deep(v, target.rows[j][c]))); if (i >= 0) return { ok: false, msg: (i + 1) + '. satır farklı. Hedef: ' + target.rows[i].map(cellOut).join(' | ') + ' · Seninki: ' + mine.rows[i].map(cellOut).join(' | ') + ' (satır sırası da önemli).' }; return { ok: true }; }
  const a = mine.rows.map(rk).sort(), b = target.rows.map(rk).sort(); const j = a.findIndex((x, i) => x !== b[i]);
  if (j >= 0) return { ok: false, msg: 'Sütunlar ve satır sayısı doğru ama bazı değerler farklı. Hedefte şu satır var, sende yok: ' + b[j].split('␟').join(' | ') + '.' };
  return { ok: true };
}
const short = s => s.length > 300 ? s.slice(0, 300) + '…' : s;

/* ---------- Yardımcılar (kütüphane) ---------- */
function need(v, kind) {
  const ok = kind === 'text' ? typeof v === 'string' : kind === 'number' ? typeof v === 'number' : kind === 'list' ? Array.isArray(v) : kind === 'record' ? v instanceof MRecord : kind === 'table' ? isTable(v) : kind === 'function' ? v instanceof MFunc : kind === 'date' ? v instanceof Date : kind === 'logical' ? typeof v === 'boolean' : kind === 'binary' ? v instanceof MBinary : kind === 'duration' ? v instanceof MDuration : true;
  if (!ok) throw convErr(v, kind === 'list' ? 'List' : kind === 'record' ? 'Record' : kind === 'table' ? 'Table' : kind === 'function' ? 'Function' : kind === 'text' ? 'Text' : kind === 'number' ? 'Number' : kind === 'date' ? 'Date' : kind === 'logical' ? 'Logical' : kind === 'binary' ? 'Binary' : kind === 'duration' ? 'Duration' : kind);
  return v;
}
function items(l) { need(l, 'list'); return l.map(x => liftCell(x)); }
function listOf(v) { return typeof v === 'string' ? [v] : items(v); }
function colI(t, n) { const i = t.cols.findIndex(c => c.name === n); if (i < 0) throw exprErr('The column \'' + n + '\' of the table wasn\'t found.', n); return i; }
const cloneT = t => ({ cols: t.cols.map(c => Object.assign({}, c)), rows: t.rows.map(r => r.slice()) });
function mkTable(names, rows, types) { return { cols: names.map((n, i) => ({ name: n, type: (types && types[i]) || 'any' })), rows }; }
function selectCols(t, names, mode) {
  const idxs = names.map(n => { const i = t.cols.findIndex(c => c.name === n); if (i < 0 && mode === 'err') throw exprErr('The column \'' + n + '\' of the table wasn\'t found.', n); return i; });
  const keep = names.map((n, j) => [n, idxs[j]]).filter(x => x[1] >= 0 || mode === 'null');
  return { cols: keep.map(x => x[1] >= 0 ? Object.assign({}, t.cols[x[1]]) : { name: x[0], type: 'any' }), rows: t.rows.map(r => keep.map(x => x[1] >= 0 ? r[x[1]] : null)) };
}
function missing(o) { if (o === null || o === undefined || o === 0) return 'err'; if (o === 1) return 'ignore'; if (o === 2) return 'null'; throw exprErr('MissingField değeri tanınmadı.'); }
function combine(ts) {
  const names = []; ts.forEach(t => { need(t, 'table'); t.cols.forEach(c => { if (!names.includes(c.name)) names.push(c.name); }); });
  const rows = []; ts.forEach(t => { const m = names.map(n => t.cols.findIndex(c => c.name === n)); t.rows.forEach(r => rows.push(m.map(i => i < 0 ? null : r[i]))); });
  const types = names.map(n => { const tt = ts.map(t => (t.cols.find(c => c.name === n) || { type: 'any' }).type); return tt.every(x => x === tt[0]) && ts.every(t => t.cols.some(c => c.name === n)) ? tt[0] : 'any'; });
  return mkTable(names, rows, types);
}
const CMP_ORD = new MFunc(a => { const x = force(a[0]), y = force(a[1]); return x < y ? -1 : x > y ? 1 : 0; }, 'Comparer.Ordinal', 2, 2); CMP_ORD.ci = false;
const foldTr = s => String(s).toLocaleLowerCase('en-US');
const CMP_OIC = new MFunc(a => { const x = foldTr(force(a[0])), y = foldTr(force(a[1])); return x < y ? -1 : x > y ? 1 : 0; }, 'Comparer.OrdinalIgnoreCase', 2, 2); CMP_OIC.ci = true;
function ciOf(c, fname) { if (c === null || c === undefined) return false; if (c === CMP_ORD) return false; if (c === CMP_OIC) return true; throw unsup(fname + ' karşılaştırıcısı', 'yalnız Comparer.Ordinal ve Comparer.OrdinalIgnoreCase destekleniyor'); }
function eqFn(c, fname) { const ci = ciOf(c, fname); return ci ? (a, b) => (typeof a === 'string' && typeof b === 'string' ? foldTr(a) === foldTr(b) : valEq(a, b)) : valEq; }
function sortCompare(a, b) {
  if (a === null && b === null) return 0; if (a === null) return -1; if (b === null) return 1;
  if (typeName(a) !== typeName(b)) throw exprErr('We cannot apply operator < to types ' + typeName(a) + ' and ' + typeName(b) + '.');
  return compareVals(a, b);
}
function keyList(v) { return Array.isArray(v) ? v.map(liftCell) : [v]; }
function truth(v, fname) { if (v === true) return true; if (v === false || v === null) return false; throw convErr(v, 'Logical'); }
const CULTURES = /^(tr|tr-TR|en-US|fr-FR|de-DE)$/i;
const CULT = c => { if (c === null || c === undefined) return null; const v = c instanceof MRecord ? recGet(c, 'Culture') : need(c, 'text'); if (v !== null && !CULTURES.test(v)) throw unsup('“' + v + '” kültürü', 'tr-TR, en-US, fr-FR ve de-DE çalışır; sonuç tahmin edilmez'); return v; };
function isTr(c) { return c && /^tr/i.test(c); }
const commaDec = c => c && /^(tr|fr|de)/i.test(c);
const up = (s, c) => s.toLocaleUpperCase(isTr(c) ? 'tr-TR' : 'en-US'), lo = (s, c) => s.toLocaleLowerCase(isTr(c) ? 'tr-TR' : 'en-US');
const proper = (s, c) => lo(s, c).replace(/(^|[^\p{L}\p{Nd}])(\p{L})/gu, (m, a, b) => a + up(b, c));
const MONTHS = { tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'], en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] };
const DAYS = { tr: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
const lng = c => { if (c && /^(fr|de)/i.test(c)) throw unsup('“' + c + '” kültüründe ay ve gün adı', 'tr-TR ve en-US çalışır'); return isTr(c) ? 'tr' : 'en'; };
const pad2 = n => String(n).padStart(2, '0');
function fmtDatePat(d, f, c) {
  const y = d.getUTCFullYear(), m = d.getUTCMonth(), dd = d.getUTCDate(), wd = d.getUTCDay(); const L = /MMM|ddd/.test(f) ? lng(c) : 'en';
  return f.replace(/yyyy|yy|MMMM|MMM|MM|M|dddd|ddd|dd|d|HH|H|mm|ss|'[^']*'/g, t => {
    switch (t) { case 'yyyy': return String(y).padStart(4, '0'); case 'yy': return pad2(y % 100); case 'MMMM': return MONTHS[L][m]; case 'MMM': return MONTHS[L][m].slice(0, 3); case 'MM': return pad2(m + 1); case 'M': return String(m + 1); case 'dddd': return DAYS[L][wd]; case 'ddd': return DAYS[L][wd].slice(0, 3); case 'dd': return pad2(dd); case 'd': return String(dd); case 'HH': return pad2(d.getUTCHours()); case 'H': return String(d.getUTCHours()); case 'mm': return pad2(d.getUTCMinutes()); case 'ss': return pad2(d.getUTCSeconds()); }
    return t.slice(1, -1);
  });
}
function numToText(n, c) { const s = fmtNum(n); return commaDec(c) ? s.replace('.', ',') : s; }
function textToNum(s, c) {
  const raw = String(s), t = raw.trim(); const bad = () => err('DataFormat.Error', 'We couldn\'t convert to Number.', raw);
  if (t === '') throw bad();
  if (c && /^fr/i.test(c)) { if (!/^[-+]?\d+(,\d+)?$/.test(t)) throw bad(); return +t.replace(',', '.'); }
  if (c && /^(tr|de)/i.test(c)) { if (!/^[-+]?(\d{1,3}(\.\d{3})+|\d+)(,\d+)?$/.test(t)) throw bad(); return +t.replace(/\./g, '').replace(',', '.'); }
  if (!/^[-+]?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?([eE][-+]?\d+)?$/.test(t)) throw bad();
  return +t.replace(/,/g, '');
}
function textToDate(s, c) {
  const t = String(s).trim(); const bad = () => err('DataFormat.Error', 'We couldn\'t parse the input provided as a Date value.', String(s));
  const ok = (y, mo, d) => { const x = mkDate(y, mo, d); if (x.getUTCMonth() !== mo - 1 || x.getUTCDate() !== d) throw bad(); return x; };
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (m) return ok(+m[1], +m[2], +m[3]);
  if (c && /^(tr|fr|de)/i.test(c)) { m = t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/); if (m) return ok(+m[3], +m[2], +m[1]); throw bad(); }
  if (c && /^en-US/i.test(c)) { m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (m) return ok(+m[3], +m[1], +m[2]); throw bad(); }
  if (/^\d{1,2}[./]\d{1,2}[./]\d{4}$/.test(t)) throw new MUnsup('Bu tarih biçimi bilgisayarın bölge ayarına bağlıdır, burada tahmin edilmez. Kültürü açıkça ver: Date.FromText(x, [Culture = "tr-TR"]) ya da Table.TransformColumnTypes(t, {{"Tarih", type date}}, "tr-TR").');
  throw bad();
}
const typeCode = t => colTypeOf(t);
function convertTo(v, t, c) {
  if (v === null || isErrCell(v)) return v;
  const k = t.facet || t.kind;
  switch (k) {
    case 'any': return v;
    case 'text': return toText(v, c);
    case 'number': case 'currency': case 'percentage': { const n = typeof v === 'number' ? v : typeof v === 'string' ? (v.trim() === '' ? null : textToNum(v, c)) : typeof v === 'boolean' ? (v ? 1 : 0) : badConv(v, 'Number'); if (n === null) return null; return k === 'currency' ? bankRound(n, 4) : n; }
    case 'int': { const n = typeof v === 'number' ? v : typeof v === 'string' ? (v.trim() === '' ? null : textToNum(v, c)) : typeof v === 'boolean' ? (v ? 1 : 0) : badConv(v, 'Number'); return n === null ? null : bankRound(n, 0); }
    case 'date': if (isDT(v)) return mkDate(v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate()); if (v instanceof Date) return v; if (typeof v === 'string') return v.trim() === '' ? null : textToDate(v, c); return badConv(v, 'Date');
    case 'datetime': if (isDT(v)) return v; if (v instanceof Date) return mkDT(v.getTime()); if (typeof v === 'string') return v.trim() === '' ? null : mkDT(textToDate(v, c).getTime()); return badConv(v, 'DateTime');
    case 'logical': if (typeof v === 'boolean') return v; if (typeof v === 'number') return v !== 0; if (typeof v === 'string') { const x = v.trim().toLowerCase(); if (x === 'true') return true; if (x === 'false') return false; } return badConv(v, 'Logical');
    case 'duration': if (v instanceof MDuration) return v; return badConv(v, 'Duration');
  }
  throw unsup('Tür dönüşümü ' + k);
}
function badConv(v, t) { throw err('Expression.Error', 'We cannot convert the value ' + fmt(v, 1) + ' to type ' + t + '.', v); }
function toText(v, c) {
  if (v === null) return null; if (typeof v === 'string') return v; if (typeof v === 'number') return numToText(v, c); if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (isDT(v)) return fmtDatePat(v, c && /^(tr|de)/i.test(c) ? 'dd.MM.yyyy HH:mm:ss' : c && /^fr/i.test(c) ? 'dd/MM/yyyy HH:mm:ss' : 'M/d/yyyy H:mm:ss', c);
  if (isDate(v)) return fmtDatePat(v, c && /^(tr|de)/i.test(c) ? 'dd.MM.yyyy' : c && /^fr/i.test(c) ? 'dd/MM/yyyy' : 'M/d/yyyy', c);
  if (v instanceof MDuration) return fmt(v);
  throw exprErr('We cannot convert a value of type ' + typeName(v) + ' to type Text.');
}
/* Ondalık yuvarlama; varsayılan bankacı yuvarlaması (RoundingMode.ToEven) */
function bankRound(x, d) {
  if (x === null) return null; const f = Math.pow(10, d || 0); const y = +(x * f).toPrecision(15); const r = Math.floor(y); const diff = y - r;
  let out; if (Math.abs(diff - 0.5) < 1e-9) out = r % 2 === 0 ? r : r + 1; else out = Math.round(y);
  return out / f;
}
function roundMode(x, d, m) {
  const f = Math.pow(10, d || 0), y = +(x * f).toPrecision(15);
  const r = Math.floor(y), half = Math.abs(y - r - 0.5) < 1e-9; if (!half) return Math.round(y) / f;
  switch (m) { case 0: return (r + 1) / f; case 1: return r / f; case 2: return (y < 0 ? r : r + 1) / f; case 3: return (y < 0 ? r + 1 : r) / f; case 4: return bankRound(x, d); }
  throw exprErr('RoundingMode değeri tanınmadı.');
}
const dateParts = d => [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()];
function sameDK(orig, ms) { return isDT(orig) ? mkDT(ms) : new Date(ms); }
function addMonths(d, n) {
  const [y, m, dd] = dateParts(d); const tm = m + n; const ny = y + Math.floor(tm / 12), nm = ((tm % 12) + 12) % 12; const last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  const base = Date.UTC(ny, nm, Math.min(dd, last)); return sameDK(d, base + (d.getTime() - Date.UTC(y, m, dd)));
}
const dayMs = 86400000;
function isoDay(d) { return d.getUTCDay(); }
function startOfWeek(d, first) { const f = first == null ? 0 : first; const diff = (isoDay(d) - f + 7) % 7; const b = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - diff * dayMs; return sameDK(d, b); }
const daysInMonth = d => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
function parseFormatOpt(o) { if (o === null || o === undefined) return { f: null, c: null }; if (typeof o === 'string') return { f: o, c: null }; if (o instanceof MRecord) return { f: recGet(o, 'Format'), c: recGet(o, 'Culture') }; throw convErr(o, 'Record'); }

/* ---------- Kütüphane ---------- */
const LIB = new Map();
/* def: ad, en az, en çok, gövde (argümanlar zorlanmış gelir) */
function def(name, min, max, fn) { LIB.set(name, new MFunc(args => { const a = args.map(x => force(x)); while (a.length < max) a.push(null); return fn(...a); }, name, min, max)); }
function nn(fn) { return (...a) => (a[0] === null ? null : fn(...a)); } // ilk argüman null ise null döner
const con = (name, v) => LIB.set(name, v);
const PTYPES = [['Any.Type', new MType('any')], ['Null.Type', new MType('null')], ['Logical.Type', new MType('logical')], ['Number.Type', new MType('number')], ['Text.Type', new MType('text')], ['Date.Type', new MType('date')], ['DateTime.Type', new MType('datetime')], ['Duration.Type', new MType('duration')], ['Binary.Type', new MType('binary')], ['List.Type', new MType('list')], ['Record.Type', new MType('record')], ['Table.Type', new MType('table')], ['Function.Type', new MType('function')], ['Type.Type', new MType('type')], ['Int64.Type', new MType('number', { facet: 'int' })], ['Int32.Type', new MType('number', { facet: 'int' })], ['Currency.Type', new MType('number', { facet: 'currency' })], ['Percentage.Type', new MType('number', { facet: 'percentage' })], ['Decimal.Type', new MType('number')], ['Double.Type', new MType('number')]];
PTYPES.forEach(x => con(x[0], x[1]));
[['JoinKind.Inner', 0], ['JoinKind.LeftOuter', 1], ['JoinKind.RightOuter', 2], ['JoinKind.FullOuter', 3], ['JoinKind.LeftAnti', 4], ['JoinKind.RightAnti', 5], ['Order.Ascending', 0], ['Order.Descending', 1], ['MissingField.Error', 0], ['MissingField.Ignore', 1], ['MissingField.UseNull', 2], ['QuoteStyle.None', 0], ['QuoteStyle.Csv', 1], ['GroupKind.Local', 0], ['GroupKind.Global', 1], ['Occurrence.First', 0], ['Occurrence.Last', 1], ['Occurrence.All', 2], ['RoundingMode.Up', 0], ['RoundingMode.Down', 1], ['RoundingMode.AwayFromZero', 2], ['RoundingMode.TowardZero', 3], ['RoundingMode.ToEven', 4], ['Day.Sunday', 0], ['Day.Monday', 1], ['Day.Tuesday', 2], ['Day.Wednesday', 3], ['Day.Thursday', 4], ['Day.Friday', 5], ['Day.Saturday', 6], ['Number.PI', Math.PI], ['Number.E', Math.E], ['Number.NaN', NaN], ['Number.PositiveInfinity', Infinity], ['Number.NegativeInfinity', -Infinity], ['ExtraValues.List', 0], ['ExtraValues.Error', 1], ['ExtraValues.Ignore', 2]].forEach(x => con(x[0], x[1]));
con('Comparer.Ordinal', CMP_ORD); con('Comparer.OrdinalIgnoreCase', CMP_OIC);
LIB.set('Replacer.ReplaceValue', new MFunc(a => { const v = force(a[0]), o = force(a[1]), n = force(a[2]); return valEq(v, o) ? n : v; }, 'Replacer.ReplaceValue', 3, 3));
LIB.set('Replacer.ReplaceText', new MFunc(a => { const v = force(a[0]), o = force(a[1]), n = force(a[2]); if (v === null) return null; need(v, 'text'); need(o, 'text'); return o === '' ? v : v.split(o).join(n === null ? '' : n); }, 'Replacer.ReplaceText', 3, 3));

/* # kurucular */
def('#date', 3, 3, (y, m, d) => { [y, m, d].forEach(x => need(x, 'number')); if (m < 1 || m > 12 || d < 1 || d > new Date(Date.UTC(y, m, 0)).getUTCDate()) throw exprErr('The Date operation failed because the resulting value falls outside the range of allowed values.'); return mkDate(y, m, d); });
def('#datetime', 6, 6, (y, m, d, h, mi, s) => { [y, m, d, h, mi, s].forEach(x => need(x, 'number')); return mkDT(Date.UTC(y, m - 1, d, h, mi, s)); });
def('#duration', 4, 4, (d, h, m, s) => { [d, h, m, s].forEach(x => need(x, 'number')); return new MDuration((d * 86400 + h * 3600 + m * 60 + s) * 1000); });
def('#table', 2, 2, (head, rows) => {
  need(rows, 'list'); const data = items(rows).map(r => need(r, 'list').slice());
  let cols;
  if (head === null) { const w = data.reduce((a, r) => Math.max(a, r.length), 0); cols = Array.from({ length: w }, (_, i) => ({ name: 'Column' + (i + 1), type: 'any' })); }
  else if (typeof head === 'number') cols = Array.from({ length: head }, (_, i) => ({ name: 'Column' + (i + 1), type: 'any' }));
  else if (head instanceof MType) { if (head.kind !== 'table' || !head.row) throw exprErr('#table için “type table [...]” bekleniyordu.'); cols = head.row.map(f => ({ name: f[0], type: colTypeOf(f[1]) })); }
  else { need(head, 'list'); cols = items(head).map(n => ({ name: need(n, 'text'), type: 'any' })); }
  data.forEach(r => { if (r.length !== cols.length) throw exprErr('The specified row contains ' + r.length + ' values, but the table has ' + cols.length + ' columns.'); });
  return { cols, rows: data };
});

/* --- List --- */
def('List.Count', 1, 1, l => need(l, 'list').length);
def('List.NonNullCount', 1, 1, l => items(l).filter(x => x !== null).length);
def('List.IsEmpty', 1, 1, l => need(l, 'list').length === 0);
function numericList(l, fname) { const a = items(l).filter(x => x !== null); a.forEach(x => { if (typeof x !== 'number' && !(x instanceof MDuration)) throw exprErr('We cannot apply operator + to types ' + typeName(x) + ' and Number.'); }); return a; }
def('List.Sum', 1, 2, (l, pr) => { if (pr !== null) throw unsup('List.Sum precision'); const a = numericList(l); if (!a.length) return null; return a.reduce((s, x) => binop('+', s, x)); });
def('List.Product', 1, 2, (l, pr) => { if (pr !== null) throw unsup('List.Product precision'); const a = numericList(l); return a.length ? a.reduce((s, x) => s * x, 1) : null; });
def('List.Average', 1, 2, (l, pr) => { if (pr !== null) throw unsup('List.Average precision'); const a = numericList(l); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; });
def('List.Median', 1, 2, (l) => { const a = items(l).filter(x => x !== null); if (!a.length) return null; a.sort(sortCompare); const m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (typeof a[m] === 'number' ? (a[m] + a[m - 1]) / 2 : a[m - 1]); });
def('List.StandardDeviation', 1, 1, l => { const a = numericList(l); if (a.length < 2) throw exprErr('The list must contain at least two values.'); const m = a.reduce((s, x) => s + x, 0) / a.length; return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1)); });
function minmax(l, def0, comp, sign) { if (comp !== null) throw unsup('List.Min/Max comparisonCriteria'); const a = items(l).filter(x => x !== null); if (!a.length) return def0; return a.reduce((m, x) => (sortCompare(x, m) * sign > 0 ? x : m)); }
def('List.Min', 1, 3, (l, d, c) => minmax(l, d, c, -1));
def('List.Max', 1, 3, (l, d, c) => minmax(l, d, c, 1));
def('List.First', 1, 2, (l, d) => { const a = need(l, 'list'); return a.length ? liftCell(a[0]) : d; });
def('List.Last', 1, 2, (l, d) => { const a = need(l, 'list'); return a.length ? liftCell(a[a.length - 1]) : d; });
function countOrCond(l, c, fromEnd) { const a = need(l, 'list'); if (typeof c === 'number') return c; need(c, 'function'); let n = 0; if (fromEnd) { for (let i = a.length - 1; i >= 0 && truth(call(c, liftCell(a[i]))); i--) n++; } else { while (n < a.length && truth(call(c, liftCell(a[n])))) n++; } return n; }
def('List.FirstN', 2, 2, (l, c) => l.slice(0, countOrCond(l, c)));
def('List.LastN', 2, 2, (l, c) => { const n = countOrCond(l, c, true); return n <= 0 ? [] : l.slice(-n); });
def('List.Skip', 1, 2, (l, c) => { const n = c === null ? 1 : countOrCond(l, c); return l.slice(n); });
def('List.RemoveFirstN', 1, 2, (l, c) => { const n = c === null ? 1 : countOrCond(l, c); return l.slice(n); });
def('List.RemoveLastN', 1, 2, (l, c) => { const n = c === null ? 1 : countOrCond(l, c, true); return n <= 0 ? l.slice() : l.slice(0, -n); });
def('List.Reverse', 1, 1, l => need(l, 'list').slice().reverse());
def('List.Single', 1, 1, l => { const a = need(l, 'list'); if (!a.length) throw exprErr('There weren\'t enough elements in the enumeration to complete the operation.'); if (a.length > 1) throw exprErr('There were too many elements in the enumeration to complete the operation.'); return liftCell(a[0]); });
def('List.SingleOrDefault', 1, 2, (l, d) => { const a = need(l, 'list'); if (a.length > 1) throw exprErr('There were too many elements in the enumeration to complete the operation.'); return a.length ? liftCell(a[0]) : d; });
def('List.Range', 2, 3, (l, off, c) => { need(l, 'list'); return c === null ? l.slice(off) : l.slice(off, off + c); });
function sortBy(a, crit, getter) {
  // crit: null | Order | fonksiyon | {f, Order}
  let keyF = null, ord = 0, cmpF = null;
  if (crit === null) { /* artan */ }
  else if (typeof crit === 'number') ord = crit;
  else if (crit instanceof MFunc) { if (crit.min === 2) cmpF = crit; else keyF = crit; }
  else if (Array.isArray(crit)) { keyF = crit[0]; ord = crit[1] === undefined ? 0 : crit[1]; need(keyF, 'function'); }
  else throw new MUnsup('Bu sıralama ölçütü biçimi bu alt kümede yok.');
  return a.map((x, i) => [x, i]).sort((p, q) => {
    let c; if (cmpF) c = call(cmpF, p[0], q[0]); else { const u = keyF ? call(keyF, p[0]) : p[0], v = keyF ? call(keyF, q[0]) : q[0]; c = sortCompare(u, v); }
    if (ord === 1) c = -c; return c || p[1] - q[1];
  }).map(p => p[0]);
}
def('List.Sort', 1, 2, (l, c) => sortBy(items(l), c));
def('List.Distinct', 1, 2, (l, c) => { const eq = eqFn(c, 'List.Distinct'); const out = []; items(l).forEach(x => { if (!out.some(y => eq(x, y))) out.push(x); }); return out; });
def('List.Select', 2, 2, (l, f) => { need(f, 'function'); return items(l).filter(x => truth(call(f, x))); });
def('List.Transform', 2, 2, (l, f) => { need(l, 'list'); need(f, 'function'); return l.map(x => protect(() => call(f, liftCell(x)))); });
def('List.TransformMany', 3, 3, () => { throw unsup('List.TransformMany'); });
def('List.Accumulate', 3, 3, (l, seed, f) => { need(f, 'function'); return items(l).reduce((s, x) => call(f, s, x), seed); });
def('List.Generate', 3, 4, (init, cond, nxt, sel) => {
  need(init, 'function'); need(cond, 'function'); need(nxt, 'function'); const out = []; let v = call(init);
  while (truth(call(cond, v))) { tick(); if (out.length > 200000) throw new MUnsup('List.Generate 200.000 öğeyi aştı ve durduruldu.', 'limit'); out.push(sel ? call(sel, v) : v); v = call(nxt, v); }
  return out;
});
def('List.Buffer', 1, 1, l => need(l, 'list').slice());
def('List.Contains', 2, 3, (l, v, c) => { const eq = eqFn(c, 'List.Contains'); return items(l).some(x => eq(x, v)); });
def('List.ContainsAny', 2, 3, (l, vs, c) => { const eq = eqFn(c, 'List.ContainsAny'); const a = items(l); return items(vs).some(v => a.some(x => eq(x, v))); });
def('List.ContainsAll', 2, 3, (l, vs, c) => { const eq = eqFn(c, 'List.ContainsAll'); const a = items(l); return items(vs).every(v => a.some(x => eq(x, v))); });
def('List.Combine', 1, 1, ls => { const out = []; items(ls).forEach(x => { need(x, 'list').forEach(y => out.push(y)); }); return out; });
def('List.Numbers', 2, 3, (s, c, st) => { const out = []; const stp = st === null ? 1 : st; for (let i = 0; i < c; i++) out.push(s + i * stp); return out; });
def('List.Dates', 3, 3, (s, c, st) => { need(s, 'date'); need(st, 'duration'); const out = []; for (let i = 0; i < c; i++) out.push(new Date(s.getTime() + i * st.ms)); return out; });
def('List.Zip', 1, 1, ls => { const a = items(ls); const w = a.reduce((m, x) => Math.max(m, need(x, 'list').length), 0); return Array.from({ length: w }, (_, i) => a.map(x => (i < x.length ? x[i] : null))); });
def('List.PositionOf', 2, 4, (l, v, occ, c) => { const eq = eqFn(c, 'List.PositionOf'); const a = items(l); const hits = []; a.forEach((x, i) => { if (eq(x, v)) hits.push(i); }); const o = occ === null ? 0 : occ; if (o === 2) return hits; if (!hits.length) return -1; return o === 1 ? hits[hits.length - 1] : hits[0]; });
def('List.AnyTrue', 1, 1, l => items(l).some(x => x === true));
def('List.AllTrue', 1, 1, l => items(l).every(x => x === true));
def('List.MatchesAll', 2, 2, (l, f) => items(l).every(x => truth(call(f, x))));
def('List.MatchesAny', 2, 2, (l, f) => items(l).some(x => truth(call(f, x))));
def('List.RemoveNulls', 1, 1, l => need(l, 'list').filter(x => x !== null));
def('List.RemoveItems', 2, 2, (l, r) => { const b = items(r); return items(l).filter(x => !b.some(y => valEq(x, y))); });
def('List.RemoveMatchingItems', 2, 3, (l, r, c) => { const eq = eqFn(c, 'List.RemoveMatchingItems'); const b = items(r); return items(l).filter(x => !b.some(y => eq(x, y))); });
def('List.Difference', 2, 3, (l, r, c) => { const eq = eqFn(c, 'List.Difference'); const b = items(r).slice(); return items(l).filter(x => { const i = b.findIndex(y => eq(x, y)); if (i >= 0) { b.splice(i, 1); return false; } return true; }); });
def('List.Intersect', 1, 2, (ls, c) => { const eq = eqFn(c, 'List.Intersect'); const a = items(ls).map(items); if (!a.length) return []; const pool = a.slice(1).map(x => x.slice()); return a[0].filter(x => pool.every(p => { const i = p.findIndex(y => eq(x, y)); if (i < 0) return false; p.splice(i, 1); return true; })); });
def('List.Union', 1, 2, (ls, c) => { const eq = eqFn(c, 'List.Union'); const out = []; items(ls).map(items).forEach(a => { const pool = out.slice(); a.forEach(x => { const i = pool.findIndex(y => eq(x, y)); if (i >= 0) pool.splice(i, 1); else out.push(x); }); }); return out; });
def('List.Repeat', 2, 2, (l, c) => { let out = []; for (let i = 0; i < c; i++) out = out.concat(need(l, 'list')); return out; });

/* --- Text --- */
const textFn = (name, min, max, fn) => def(name, min, max, nn((s, ...r) => { need(s, 'text'); return fn(s, ...r); }));
textFn('Text.Length', 1, 1, s => [...s].length);
textFn('Text.Start', 2, 2, (s, c) => s.slice(0, c));
textFn('Text.End', 2, 2, (s, c) => (c <= 0 ? '' : s.slice(-c)));
textFn('Text.Middle', 2, 3, (s, o, c) => { if (o > s.length) throw exprErr('The offset is out of range.'); return c === null ? s.slice(o) : s.slice(o, o + c); });
textFn('Text.Range', 2, 3, (s, o, c) => { if (o > s.length) throw exprErr('The offset is out of range.'); if (c !== null && o + c > s.length) throw exprErr('The count is out of range.'); return c === null ? s.slice(o) : s.slice(o, o + c); });
textFn('Text.At', 2, 2, (s, i) => { if (i < 0 || i >= s.length) throw exprErr('The index is out of range.'); return s[i]; });
textFn('Text.Upper', 1, 2, (s, c) => up(s, CULT(c)));
textFn('Text.Lower', 1, 2, (s, c) => lo(s, CULT(c)));
textFn('Text.Proper', 1, 2, (s, c) => proper(s, CULT(c)));
function trimFn(s, t, mode) { if (t === null) return mode === 0 ? s.trim() : mode === 1 ? s.trimStart() : s.trimEnd(); const set = typeof t === 'string' ? [t] : items(t); let a = 0, b = s.length; if (mode !== 2) while (a < b && set.includes(s[a])) a++; if (mode !== 1) while (b > a && set.includes(s[b - 1])) b--; return s.slice(a, b); }
textFn('Text.Trim', 1, 2, (s, t) => trimFn(s, t, 0));
textFn('Text.TrimStart', 1, 2, (s, t) => trimFn(s, t, 1));
textFn('Text.TrimEnd', 1, 2, (s, t) => trimFn(s, t, 2));
textFn('Text.Clean', 1, 1, s => s.replace(/[\u0000-\u001f\u007f-\u009f]/g, ''));
textFn('Text.Contains', 2, 3, (s, x, c) => { need(x, 'text'); return ciOf(c, 'Text.Contains') ? foldTr(s).includes(foldTr(x)) : s.includes(x); });
textFn('Text.StartsWith', 2, 3, (s, x, c) => { need(x, 'text'); return ciOf(c, 'Text.StartsWith') ? foldTr(s).startsWith(foldTr(x)) : s.startsWith(x); });
textFn('Text.EndsWith', 2, 3, (s, x, c) => { need(x, 'text'); return ciOf(c, 'Text.EndsWith') ? foldTr(s).endsWith(foldTr(x)) : s.endsWith(x); });
textFn('Text.Replace', 3, 3, (s, o, n) => { need(o, 'text'); need(n, 'text'); if (o === '') throw exprErr('Text.Replace: boş metin aranamaz.'); return s.split(o).join(n); });
const charsIn = (r, fname) => { const set = []; (typeof r === 'string' ? [r] : items(r)).forEach(x => { if (Array.isArray(x)) { const a = x[0].charCodeAt(0), b = x[1].charCodeAt(0); for (let c = a; c <= b; c++) set.push(String.fromCharCode(c)); } else set.push(x); }); return set; };
textFn('Text.Remove', 2, 2, (s, r) => { const set = charsIn(r); return [...s].filter(c => !set.includes(c)).join(''); });
textFn('Text.Select', 2, 2, (s, r) => { const set = charsIn(r); return [...s].filter(c => set.includes(c)).join(''); });
def('Text.Split', 2, 2, (s, d) => { need(s, 'text'); need(d, 'text'); return d === '' ? [...s] : s.split(d); });
textFn('Text.SplitAny', 2, 2, (s, d) => { need(d, 'text'); const set = [...d]; const out = []; let cur = ''; [...s].forEach(c => { if (set.includes(c)) { out.push(cur); cur = ''; } else cur += c; }); out.push(cur); return out; });
def('Text.Combine', 1, 2, (l, sep) => { const a = items(l).filter(x => x !== null); a.forEach(x => need(x, 'text')); return a.join(sep === null ? '' : sep); });
def('Text.From', 1, 2, (v, c) => (v === null ? null : toText(v, CULT(c))));
def('Text.Repeat', 2, 2, (s, c) => { need(s, 'text'); return s.repeat(c); });
textFn('Text.Reverse', 1, 1, s => [...s].reverse().join(''));
textFn('Text.ToList', 1, 1, s => [...s]);
textFn('Text.Insert', 3, 3, (s, o, x) => s.slice(0, o) + x + s.slice(o));
textFn('Text.PadStart', 2, 3, (s, c, ch) => s.padStart(c, ch === null ? ' ' : ch));
textFn('Text.PadEnd', 2, 3, (s, c, ch) => s.padEnd(c, ch === null ? ' ' : ch));
textFn('Text.PositionOf', 2, 4, (s, x, occ, c) => { need(x, 'text'); const ci = ciOf(c, 'Text.PositionOf'); const A = ci ? foldTr(s) : s, B = ci ? foldTr(x) : x; const o = occ === null ? 0 : occ; if (o === 0) return A.indexOf(B); if (o === 1) return A.lastIndexOf(B); const out = []; let i = A.indexOf(B); while (i >= 0 && B) { out.push(i); i = A.indexOf(B, i + B.length); } return out; });
function delimIdx(i) { if (i === null) return [0, 0]; if (typeof i === 'number') return [i, 0]; if (Array.isArray(i) && typeof i[0] === 'number') { if (i[1] === 1) throw unsup('Text.*Delimiter RelativePosition.FromEnd'); return [i[0], 0]; } throw new MUnsup('Text.*Delimiter için bu index biçimi bu alt kümede yok.'); }
function nthPos(s, d, n) { let p = -1, st = 0; for (let k = 0; k <= n; k++) { p = s.indexOf(d, st); if (p < 0) return -1; st = p + d.length; } return p; }
textFn('Text.BeforeDelimiter', 2, 3, (s, d, i) => { const [n] = delimIdx(i); const p = nthPos(s, d, n); return p < 0 ? s : s.slice(0, p); });
textFn('Text.AfterDelimiter', 2, 3, (s, d, i) => { const [n] = delimIdx(i); const p = nthPos(s, d, n); return p < 0 ? '' : s.slice(p + d.length); });
textFn('Text.BetweenDelimiters', 3, 5, (s, a, b, i, j) => { const [n] = delimIdx(i); const [m] = delimIdx(j); const p = nthPos(s, a, n); if (p < 0) return ''; const rest = s.slice(p + a.length); const q = nthPos(rest, b, m); return q < 0 ? rest : rest.slice(0, q); });
def('Text.Format', 2, 3, (f, args, c) => { need(f, 'text'); return f.replace(/#\{([^}]*)\}|#\[([^\]]*)\]/g, (m, i, nm) => { let v; if (i !== undefined) { if (!Array.isArray(args) || +i >= args.length) throw exprErr('Text.Format: #{' + i + '} için değer yok.'); v = args[+i]; } else { if (!(args instanceof MRecord)) throw exprErr('Text.Format: kayıt bekleniyordu.'); v = recGet(args, nm); } return v === null ? '' : toText(liftCell(v), CULT(c)); }); });

/* --- Number, Logical, Int64 --- */
def('Number.From', 1, 2, (v, c) => { if (v === null) return null; if (typeof v === 'number') return v; if (typeof v === 'boolean') return v ? 1 : 0; if (typeof v === 'string') return textToNum(v, CULT(c)); if (v instanceof Date) throw unsup('Number.From(date)', 'seri tarih sayısı alt küme dışında'); if (v instanceof MDuration) return v.ms / dayMs; throw convErr(v, 'Number'); });
def('Number.FromText', 1, 2, (v, c) => (v === null ? null : textToNum(need(v, 'text'), CULT(c))));
def('Number.ToText', 1, 3, (v, f, c) => { if (v === null) return null; need(v, 'number'); if (f !== null) { const m = String(f).match(/^([FfNn])(\d+)?$/); if (!m) throw unsup('Number.ToText biçimi “' + f + '”', 'yalnız F2, N2 gibi biçimler var'); const d = m[2] === undefined ? 2 : +m[2]; let t = v.toFixed(d); if (/[Nn]/.test(m[1])) { const [a, b] = t.split('.'); const g = a.replace(/\B(?=(\d{3})+(?!\d))/g, isTr(CULT(c)) ? '.' : ','); t = isTr(CULT(c)) ? g + (b ? ',' + b : '') : g + (b ? '.' + b : ''); } else if (isTr(CULT(c))) t = t.replace('.', ','); return t; } return numToText(v, CULT(c)); });
const n1 = (name, fn) => def(name, 1, 1, nn(x => fn(need(x, 'number'))));
def('Number.Round', 1, 3, nn((x, d, m) => { need(x, 'number'); return m === null ? bankRound(x, d === null ? 0 : d) : roundMode(x, d === null ? 0 : d, m); }));
def('Number.RoundUp', 1, 2, nn((x, d) => { const f = Math.pow(10, d === null ? 0 : d); return Math.ceil(+(x * f).toPrecision(15)) / f; }));
def('Number.RoundDown', 1, 2, nn((x, d) => { const f = Math.pow(10, d === null ? 0 : d); return Math.floor(+(x * f).toPrecision(15)) / f; }));
def('Number.RoundTowardZero', 1, 2, nn((x, d) => { const f = Math.pow(10, d === null ? 0 : d); return Math.trunc(+(x * f).toPrecision(15)) / f; }));
/* Belge: pozitif yukarı, negatif aşağı. Number.Round(x, d, RoundingMode.AwayFromZero) ile karıştırma: o yalnız yarım değerde ayrışır. */
def('Number.RoundAwayFromZero', 1, 2, nn((x, d) => { const f = Math.pow(10, d === null ? 0 : d), y = +(Math.abs(x) * f).toPrecision(15); return Math.sign(x) * Math.ceil(y) / f; }));
n1('Number.Abs', Math.abs); n1('Number.Sign', Math.sign); n1('Number.Sqrt', Math.sqrt); n1('Number.Exp', Math.exp); n1('Number.Ln', Math.log); n1('Number.Sin', Math.sin); n1('Number.Cos', Math.cos); n1('Number.Tan', Math.tan);
def('Number.Log', 1, 2, nn((x, b) => (b === null ? Math.log(x) : Math.log(x) / Math.log(b))));
n1('Number.Log10', Math.log10); n1('Number.IsNaN', Number.isNaN); n1('Number.IsEven', x => x % 2 === 0); n1('Number.IsOdd', x => Math.abs(x % 2) === 1);
n1('Number.Factorial', x => { let r = 1; for (let i = 2; i <= x; i++) r *= i; return r; });
def('Number.Power', 2, 2, (a, b) => (a === null || b === null ? null : Math.pow(a, b)));
def('Number.Mod', 2, 3, (a, b, pr) => { if (pr !== null) throw unsup('Number.Mod precision'); if (a === null || b === null) return null; if (b === 0) throw exprErr('We cannot divide by zero.'); return a % b; });
def('Number.IntegerDivide', 2, 3, (a, b, pr) => { if (pr !== null) throw unsup('Number.IntegerDivide precision'); if (a === null || b === null) return null; if (b === 0) throw exprErr('We cannot divide by zero.'); return Math.trunc(a / b); });
def('Int64.From', 1, 3, (v, c, m) => { if (v === null) return null; if (m !== null) { const x = typeof v === 'string' ? textToNum(v, CULT(c)) : v; return roundMode(x, 0, m); } return convertTo(v, new MType('number', { facet: 'int' }), CULT(c)); });
def('Int32.From', 1, 3, (v, c) => (v === null ? null : convertTo(v, new MType('number', { facet: 'int' }), CULT(c))));
def('Currency.From', 1, 3, (v, c) => (v === null ? null : convertTo(v, new MType('number', { facet: 'currency' }), CULT(c))));
def('Decimal.From', 1, 2, (v, c) => (v === null ? null : convertTo(v, new MType('number'), CULT(c))));
def('Double.From', 1, 2, (v, c) => (v === null ? null : convertTo(v, new MType('number'), CULT(c))));
def('Logical.From', 1, 1, v => (v === null ? null : convertTo(v, new MType('logical'))));
def('Logical.FromText', 1, 1, v => { if (v === null) return null; need(v, 'text'); const x = v.toLowerCase(); if (x === 'true') return true; if (x === 'false') return false; throw exprErr('We couldn\'t convert to Logical.'); });
def('Logical.ToText', 1, 1, v => (v === null ? null : (need(v, 'logical') ? 'true' : 'false')));

/* --- Date, DateTime, Duration --- */
const dfn = (name, min, max, fn) => def(name, min, max, nn((d, ...r) => { if (!(d instanceof Date)) throw convErr(d, 'Date'); return fn(d, ...r); }));
def('Date.From', 1, 2, (v, c) => { if (v === null) return null; if (v instanceof Date) return convertTo(v, new MType('date')); if (typeof v === 'string') return textToDate(v, CULT(c)); if (typeof v === 'number') throw unsup('Date.From(number)', 'seri tarih sayısı alt küme dışında'); throw convErr(v, 'Date'); });
def('Date.FromText', 1, 2, (v, o) => { if (v === null) return null; need(v, 'text'); const { f, c } = parseFormatOpt(o); if (f) throw unsup('Date.FromText Format seçeneği', 'Culture verilebilir'); return textToDate(v, c || (typeof o === 'string' ? o : null)); });
dfn('Date.ToText', 1, 3, (d, o, c0) => { const { f, c } = parseFormatOpt(o); const cu = c || CULT(c0); return f ? fmtDatePat(d, f, cu) : toText(convertTo(d, new MType('date')), cu); });
dfn('Date.Year', 1, 1, d => d.getUTCFullYear()); dfn('Date.Month', 1, 1, d => d.getUTCMonth() + 1); dfn('Date.Day', 1, 1, d => d.getUTCDate());
dfn('Date.AddDays', 2, 2, (d, n) => sameDK(d, d.getTime() + n * dayMs)); dfn('Date.AddWeeks', 2, 2, (d, n) => sameDK(d, d.getTime() + 7 * n * dayMs));
dfn('Date.AddMonths', 2, 2, (d, n) => addMonths(d, n)); dfn('Date.AddQuarters', 2, 2, (d, n) => addMonths(d, 3 * n)); dfn('Date.AddYears', 2, 2, (d, n) => addMonths(d, 12 * n));
dfn('Date.DayOfWeek', 1, 2, (d, f) => (d.getUTCDay() - (f === null ? 0 : f) + 7) % 7);
dfn('Date.DayOfWeekName', 1, 2, (d, c) => DAYS[lng(CULT(c))][d.getUTCDay()]);
dfn('Date.MonthName', 1, 2, (d, c) => MONTHS[lng(CULT(c))][d.getUTCMonth()]);
dfn('Date.DayOfYear', 1, 1, d => Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 1)) / dayMs) + 1);
dfn('Date.DaysInMonth', 1, 1, daysInMonth);
dfn('Date.QuarterOfYear', 1, 1, d => Math.floor(d.getUTCMonth() / 3) + 1);
dfn('Date.WeekOfYear', 1, 2, (d, f) => { const fs = f === null ? 0 : f; const j1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); const off = (j1.getUTCDay() - fs + 7) % 7; const doy = Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - j1.getTime()) / dayMs); return Math.floor((doy + off) / 7) + 1; });
dfn('Date.WeekOfMonth', 1, 2, (d, f) => { const fs = f === null ? 0 : f; const m1 = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); const off = (m1.getUTCDay() - fs + 7) % 7; return Math.floor((d.getUTCDate() - 1 + off) / 7) + 1; });
dfn('Date.StartOfMonth', 1, 1, d => sameDK(d, Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)));
dfn('Date.EndOfMonth', 1, 1, d => (isDT(d) ? mkDT(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) - 1) : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))));
dfn('Date.StartOfYear', 1, 1, d => sameDK(d, Date.UTC(d.getUTCFullYear(), 0, 1)));
dfn('Date.EndOfYear', 1, 1, d => new Date(Date.UTC(d.getUTCFullYear(), 11, 31)));
dfn('Date.StartOfQuarter', 1, 1, d => sameDK(d, Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3, 1)));
dfn('Date.EndOfQuarter', 1, 1, d => new Date(Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3 + 3, 0)));
dfn('Date.StartOfWeek', 1, 2, (d, f) => startOfWeek(d, f));
dfn('Date.EndOfWeek', 1, 2, (d, f) => new Date(startOfWeek(d, f).getTime() + 6 * dayMs));
dfn('Date.IsLeapYear', 1, 1, d => { const y = d.getUTCFullYear(); return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; });
def('DateTime.LocalNow', 0, 0, () => { const n = new Date(); return mkDT(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours(), n.getMinutes(), n.getSeconds())); });
dfn('DateTime.Date', 1, 1, d => mkDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()));
def('DateTime.From', 1, 2, (v, c) => (v === null ? null : convertTo(v, new MType('datetime'), CULT(c))));
dfn('DateTime.ToText', 1, 3, (d, o, c0) => { const { f, c } = parseFormatOpt(o); const cu = c || CULT(c0); return f ? fmtDatePat(d, f, cu) : toText(d, cu); });
const durF = (name, fn) => def(name, 1, 1, nn(x => fn(need(x, 'duration').ms)));
durF('Duration.Days', ms => Math.trunc(ms / dayMs)); durF('Duration.Hours', ms => Math.trunc(ms % dayMs / 3600000)); durF('Duration.Minutes', ms => Math.trunc(ms % 3600000 / 60000)); durF('Duration.Seconds', ms => ms % 60000 / 1000);
durF('Duration.TotalDays', ms => ms / dayMs); durF('Duration.TotalHours', ms => ms / 3600000); durF('Duration.TotalMinutes', ms => ms / 60000); durF('Duration.TotalSeconds', ms => ms / 1000);

/* --- Record --- */
def('Record.Field', 2, 2, (r, n) => { need(r, 'record'); need(n, 'text'); if (!r.f.has(n)) throw exprErr('The field \'' + n + '\' of the record wasn\'t found.', n); return force(r.f.get(n)); });
def('Record.FieldOrDefault', 2, 3, (r, n, d) => { if (r === null) return d; need(r, 'record'); return r.f.has(n) ? force(r.f.get(n)) : d; });
def('Record.FieldNames', 1, 1, r => need(r, 'record').names.slice());
def('Record.FieldValues', 1, 1, r => need(r, 'record').names.map(n => protect(() => r.f.get(n))));
def('Record.ToList', 1, 1, r => need(r, 'record').names.map(n => protect(() => r.f.get(n))));
def('Record.FieldCount', 1, 1, r => need(r, 'record').names.length);
def('Record.HasFields', 2, 2, (r, n) => { need(r, 'record'); return listOf(n).every(x => r.f.has(x)); });
def('Record.AddField', 3, 4, (r, n, v, d) => { need(r, 'record'); if (r.f.has(n)) throw exprErr('The field \'' + n + '\' already exists in the record.', n); if (d !== null) throw unsup('Record.AddField delayed'); const o = mergeRec(r, new MRecord()); o.names.push(n); o.f.set(n, v); return o; });
def('Record.RemoveFields', 2, 3, (r, n, m) => { need(r, 'record'); const mode = missing(m); const del = listOf(n); if (mode === 'err') del.forEach(x => { if (!r.f.has(x)) throw exprErr('The field \'' + x + '\' of the record wasn\'t found.', x); }); const o = new MRecord(); r.names.forEach(x => { if (!del.includes(x)) { o.names.push(x); o.f.set(x, r.f.get(x)); } }); return o; });
def('Record.SelectFields', 2, 3, (r, n, m) => { need(r, 'record'); const mode = missing(m); const o = new MRecord(); listOf(n).forEach(x => { if (r.f.has(x)) { o.names.push(x); o.f.set(x, r.f.get(x)); } else if (mode === 'err') throw exprErr('The field \'' + x + '\' of the record wasn\'t found.', x); else if (mode === 'null') { o.names.push(x); o.f.set(x, null); } }); return o; });
def('Record.RenameFields', 2, 3, (r, ren, m) => { need(r, 'record'); const mode = missing(m); const pairs = (Array.isArray(ren[0]) ? ren : [ren]); const o = new MRecord(); pairs.forEach(p => { if (!r.f.has(p[0]) && mode === 'err') throw exprErr('The field \'' + p[0] + '\' of the record wasn\'t found.', p[0]); }); r.names.forEach(x => { const p = pairs.find(q => q[0] === x); const nm = p ? p[1] : x; o.names.push(nm); o.f.set(nm, r.f.get(x)); }); return o; });
def('Record.TransformFields', 2, 3, (r, ops, m) => { need(r, 'record'); missing(m); const pairs = Array.isArray(ops[0]) ? ops : [ops]; const o = mergeRec(r, new MRecord()); pairs.forEach(p => { if (!r.f.has(p[0])) { if (missing(m) === 'err') throw exprErr('The field \'' + p[0] + '\' of the record wasn\'t found.', p[0]); return; } const old = r.f.get(p[0]); o.f.set(p[0], new Thunk(() => call(p[1], force(old)))); }); return o; });
def('Record.Combine', 1, 1, l => items(l).reduce((a, b) => mergeRec(a, need(b, 'record')), new MRecord()));
def('Record.FromList', 2, 2, (vals, names) => { need(vals, 'list'); const nm = names instanceof MType ? names.row.map(f => f[0]) : items(names); if (vals.length !== nm.length) throw exprErr('The number of items doesn\'t match the number of fields.'); const o = new MRecord(); nm.forEach((n, i) => { o.names.push(n); o.f.set(n, vals[i]); }); return o; });
def('Record.ToTable', 1, 1, r => { need(r, 'record'); return mkTable(['Name', 'Value'], r.names.map(n => [n, protect(() => r.f.get(n))])); });
def('Record.FromTable', 1, 1, t => { need(t, 'table'); const a = colI(t, 'Name'), b = colI(t, 'Value'); const o = new MRecord(); t.rows.forEach(r => { o.names.push(r[a]); o.f.set(r[a], r[b]); }); return o; });

/* --- Value, Type, Error, Function --- */
LIB.set('Value.Is', new MFunc(a => { const v = force(a[0]), t = force(a[1]); if (!(t instanceof MType)) throw convErr(t, 'Type'); return isType(v, t); }, 'Value.Is', 2, 2));
LIB.set('Value.As', new MFunc(a => { const v = force(a[0]), t = force(a[1]); if (!(t instanceof MType)) throw convErr(t, 'Type'); return asType(v, t); }, 'Value.As', 2, 2));
LIB.set('Value.Type', new MFunc(a => { const v = force(a[0]); if (isTable(v)) return new MType('table', { row: v.cols.map(c => [c.name, new MType('any')]) }); if (v instanceof MFunc) return new MType('function', { item: true }); return new MType(v === null ? 'null' : typeName(v).toLowerCase()); }, 'Value.Type', 1, 1));
/* Belge: ilk bağımsız değişken her tür, ikincisi yalın ya da nullable yalın tür */
LIB.set('Type.Is', new MFunc(a => { const x = force(a[0]), y = force(a[1]); if (!(x instanceof MType)) throw convErr(x, 'Type'); if (!(y instanceof MType)) throw convErr(y, 'Type'); if (y.row || y.item) throw new MUnsup('Type.Is ikinci bağımsız değişken olarak yalnız yalın ya da nullable yalın tür alır.'); if (y.kind === 'any') return true; if (y.kind === 'none') return x.kind === 'none'; if (x.kind === 'null') return !!y.nullable || y.kind === 'null'; if (y.kind === 'anynonnull') return !x.nullable && x.kind !== 'any'; return x.kind === y.kind && (!!y.nullable || !x.nullable); }, 'Type.Is', 2, 2));
LIB.set('Type.NonNullable', new MFunc(a => { const x = force(a[0]); if (!(x instanceof MType)) throw convErr(x, 'Type'); return new MType(x.kind, Object.assign({}, x, { nullable: false })); }, 'Type.NonNullable', 1, 1));
def('Value.Equals', 2, 3, (a, b, c) => eqFn(c, 'Value.Equals')(a, b));
LIB.set('Error.Record', new MFunc(a => mkRecord([['Reason', force(a[0])], ['Message', a.length > 1 ? force(a[1]) : null], ['Detail', a.length > 2 ? force(a[2]) : null]]), 'Error.Record', 1, 4));
LIB.set('Function.Invoke', new MFunc(a => callF(need(force(a[0]), 'function'), need(force(a[1]), 'list').slice()), 'Function.Invoke', 2, 2));
const NATIVE_NOTE = 'Bu laboratuvar veritabanına bağlanmaz. Value.NativeQuery ve bağlayıcılar burada çalışmaz; derslerde yalnız okunur kod olarak geçer. Gerçek Power BI Desktop’ta dene.';
['Value.NativeQuery', 'Sql.Database', 'Sql.Databases', 'Web.Contents', 'Web.Page', 'OData.Feed', 'SharePoint.Tables', 'SharePoint.Files', 'SharePoint.Contents', 'Excel.Workbook', 'Excel.CurrentWorkbook', 'Xml.Document', 'Odbc.DataSource', 'Oracle.Database', 'PostgreSQL.Database', 'Lakehouse.Contents', 'AzureStorage.Blobs', 'Expression.Evaluate'].forEach(n => LIB.set(n, new MFunc(() => { throw new MUnsup('“' + n + '” bu alt kümede çalışmaz. ' + NATIVE_NOTE, 'connector'); }, n, 0, 99)));

/* --- Splitter / Combiner --- */
function splitter(fn, name) { const f = new MFunc(a => { const s = force(a[0]); return s === null ? { nullSplit: 1 } && [null] : fn(need(s, 'text')); }, name, 1, 1); return f; }
def('Splitter.SplitTextByDelimiter', 1, 2, (d, q) => splitter(s => s.split(need(d, 'text')), 'Splitter'));
def('Splitter.SplitTextByEachDelimiter', 1, 3, (ds, q, fromEnd) => splitter(s => { const out = []; let rest = s; const list = items(ds); for (const d of list) { if (fromEnd === true) { const i = rest.lastIndexOf(d); if (i < 0) break; out.unshift(rest.slice(i + d.length)); rest = rest.slice(0, i); } else { const i = rest.indexOf(d); if (i < 0) break; out.push(rest.slice(0, i)); rest = rest.slice(i + d.length); } } if (fromEnd === true) out.unshift(rest); else out.push(rest); return out; }, 'Splitter'));
def('Splitter.SplitTextByAnyDelimiter', 1, 3, (ds, q, fromEnd) => { if (fromEnd !== null) throw unsup('Splitter.SplitTextByAnyDelimiter startAtEnd'); return splitter(s => { const list = items(ds); const out = []; let cur = ''; for (let i = 0; i < s.length;) { const d = list.find(x => s.startsWith(x, i)); if (d) { out.push(cur); cur = ''; i += d.length; } else cur += s[i++]; } out.push(cur); return out; }, 'Splitter'); });
def('Splitter.SplitTextByLengths', 1, 2, (ls) => splitter(s => { const out = []; let p = 0; items(ls).forEach(n => { out.push(s.slice(p, p + n)); p += n; }); return out; }, 'Splitter'));
def('Splitter.SplitByNothing', 0, 0, () => new MFunc(a => [force(a[0])], 'Splitter', 1, 1));
def('Combiner.CombineTextByDelimiter', 1, 2, (d, q) => { need(d, 'text'); return new MFunc(a => items(force(a[0])).filter(x => x !== null).map(x => need(x, 'text')).join(d), 'Combiner', 1, 1); });

/* --- Table --- */
function recsToTable(list, cols, fname) {
  const recs = items(list); recs.forEach(r => need(r, 'record'));
  let names = null, types = null;
  if (cols instanceof MType) { names = cols.row.map(f => f[0]); types = cols.row.map(f => colTypeOf(f[1])); }
  else if (cols !== null) names = listOf(cols);
  else names = recs.length ? recs[0].names.slice() : [];
  const rows = recs.map((r, idx) => { if (cols === null) { if (r.names.length !== names.length || r.names.some(n => !names.includes(n))) throw exprErr('The field \'' + (r.names.find(n => !names.includes(n)) || names.find(n => !r.names.includes(n))) + '\' of the record wasn\'t found.'); } return names.map(n => { if (!r.f.has(n)) throw exprErr('The field \'' + n + '\' of the record wasn\'t found.', n); return protect(() => r.f.get(n)); }); });
  return mkTable(names, rows, types);
}
def('Table.FromRecords', 1, 3, (l, c, m) => { if (m !== null) throw unsup('Table.FromRecords missingField'); return recsToTable(l, c); });
function namesFrom(c, w) { if (c === null) return Array.from({ length: w }, (_, i) => 'Column' + (i + 1)); if (typeof c === 'number') return Array.from({ length: c }, (_, i) => 'Column' + (i + 1)); if (c instanceof MType) return c.row.map(f => f[0]); return listOf(c); }
def('Table.FromRows', 1, 2, (rows, c) => { const data = items(rows).map(r => need(r, 'list').slice()); const w = data.reduce((m, r) => Math.max(m, r.length), 0); const names = namesFrom(c, w); data.forEach(r => { if (r.length !== names.length) throw exprErr('The specified row contains ' + r.length + ' values, but the table has ' + names.length + ' columns.'); }); return { cols: names.map((n, i) => ({ name: n, type: c instanceof MType ? colTypeOf(c.row[i][1]) : 'any' })), rows: data }; });
def('Table.FromColumns', 1, 2, (colsL, c) => { const a = items(colsL).map(x => need(x, 'list')); const h = a.reduce((m, x) => Math.max(m, x.length), 0); const names = namesFrom(c, a.length); return mkTable(names, Array.from({ length: h }, (_, i) => a.map(x => (i < x.length ? x[i] : null)))); });
def('Table.FromList', 1, 5, (l, sp, c, dflt, extra) => { if (dflt !== null || extra !== null) throw unsup('Table.FromList default/extraValues'); need(l, 'list'); const splitF = sp === null ? null : need(sp, 'function'); const parts = l.map(x => { const v = liftCell(x); if (splitF) { const r = call(splitF, v); return Array.isArray(r) ? r : [r]; } if (v === null) return [null]; if (typeof v === 'string') return v.split(','); if (Array.isArray(v)) return v.slice(); throw convErr(v, 'Text'); }); const w = parts.reduce((m, r) => Math.max(m, r.length), 0); const names = namesFrom(c, w); return mkTable(names, parts.map(r => names.map((_, i) => (i < r.length ? r[i] : null)))); });
def('Table.ToRecords', 1, 1, t => need(t, 'table').rows.map(r => rowRecord(t, r)));
def('Table.ToRows', 1, 1, t => need(t, 'table').rows.map(r => r.slice()));
def('Table.ToColumns', 1, 1, t => { need(t, 'table'); return t.cols.map((c, i) => t.rows.map(r => r[i])); });
def('Table.ToList', 1, 2, (t, cb) => { need(t, 'table'); const f = cb === null ? (r => r.map(x => toText(liftCell(x))).join(',')) : (r => call(cb, r.map(liftCell))); return t.rows.map(r => f(r)); });
def('Table.Column', 2, 2, (t, n) => { need(t, 'table'); const i = colI(t, n); return t.rows.map(r => r[i]); });
def('Table.ColumnNames', 1, 1, t => need(t, 'table').cols.map(c => c.name));
def('Table.ColumnCount', 1, 1, t => need(t, 'table').cols.length);
def('Table.RowCount', 1, 1, t => need(t, 'table').rows.length);
def('Table.IsEmpty', 1, 1, t => need(t, 'table').rows.length === 0);
def('Table.HasColumns', 2, 2, (t, n) => { need(t, 'table'); return listOf(n).every(x => t.cols.some(c => c.name === x)); });
def('Table.First', 1, 2, (t, d) => { need(t, 'table'); return t.rows.length ? rowRecord(t, t.rows[0]) : d; });
def('Table.Last', 1, 2, (t, d) => { need(t, 'table'); return t.rows.length ? rowRecord(t, t.rows[t.rows.length - 1]) : d; });
def('Table.FirstValue', 1, 2, (t, d) => { need(t, 'table'); return t.rows.length && t.cols.length ? liftCell(t.rows[0][0]) : d; });
def('Table.SelectRows', 2, 2, (t, f) => { need(t, 'table'); need(f, 'function'); return { cols: t.cols.map(c => Object.assign({}, c)), rows: t.rows.filter(r => truth(call(f, rowRecord(t, r)))) }; });
def('Table.SelectColumns', 2, 3, (t, n, m) => { need(t, 'table'); const mode = missing(m); return selectCols(t, listOf(n), mode === 'err' ? 'err' : mode === 'null' ? 'null' : 'ign'); });
def('Table.RemoveColumns', 2, 3, (t, n, m) => { need(t, 'table'); const del = listOf(n); if (missing(m) === 'err') del.forEach(x => colI(t, x)); const keep = t.cols.map((c, i) => i).filter(i => !del.includes(t.cols[i].name)); return { cols: keep.map(i => Object.assign({}, t.cols[i])), rows: t.rows.map(r => keep.map(i => r[i])) }; });
def('Table.RenameColumns', 2, 3, (t, ren, m) => { need(t, 'table'); const pairs = Array.isArray(ren[0]) ? ren : [ren]; const out = cloneT(t); const mode = missing(m); pairs.forEach(p => { const i = t.cols.findIndex(c => c.name === p[0]); if (i < 0) { if (mode === 'err') throw exprErr('The column \'' + p[0] + '\' of the table wasn\'t found.', p[0]); return; } out.cols[i].name = p[1]; }); out.cols.forEach((c, i) => { if (out.cols.findIndex(x => x.name === c.name) !== i) throw exprErr('The field \'' + c.name + '\' already exists in the record.', c.name); }); return out; });
def('Table.ReorderColumns', 2, 3, (t, n, m) => { need(t, 'table'); missing(m); const list = listOf(n); list.forEach(x => colI(t, x)); const set = new Set(list); let k = 0; const order = t.cols.map(c => (set.has(c.name) ? list[k++] : c.name)); return selectCols(t, order, 'err'); });
function addCol(t, name, valuesFn, type) { if (t.cols.some(c => c.name === name)) throw exprErr('The field \'' + name + '\' already exists in the record.', name); return { cols: t.cols.map(c => Object.assign({}, c)).concat([{ name, type: type || 'any' }]), rows: t.rows.map((r, i) => r.concat([valuesFn(r, i)])) }; }
def('Table.AddColumn', 3, 4, (t, n, f, ty) => { need(t, 'table'); need(n, 'text'); need(f, 'function'); return addCol(t, n, r => protect(() => call(f, rowRecord(t, r))), ty ? colTypeOf(ty) : 'any'); });
def('Table.AddIndexColumn', 2, 5, (t, n, s, st, ty) => { need(t, 'table'); const a = s === null ? 0 : s, b = st === null ? 1 : st; return addCol(t, n, (r, i) => a + i * b, ty ? colTypeOf(ty) : 'int'); });
def('Table.DuplicateColumn', 3, 4, (t, c, n, ty) => { need(t, 'table'); const i = colI(t, c); return addCol(t, n, r => r[i], ty ? colTypeOf(ty) : t.cols[i].type); });
def('Table.CombineColumns', 4, 4, (t, cs, f, n) => { need(t, 'table'); const list = listOf(cs); const ix = list.map(x => colI(t, x)); const keepI = t.cols.map((c, i) => i).filter(i => !ix.includes(i)); const at = Math.min(...ix); const cols = []; t.cols.forEach((c, i) => { if (i === at) cols.push({ name: n, type: 'any' }); if (keepI.includes(i)) cols.push(Object.assign({}, c)); }); return { cols, rows: t.rows.map(r => { const out = []; r.forEach((v, i) => { if (i === at) out.push(protect(() => call(f, ix.map(j => r[j])))); if (keepI.includes(i)) out.push(v); }); return out; }) }; });
def('Table.SplitColumn', 3, 6, (t, c, f, names, dflt, extra) => {
  need(t, 'table'); need(f, 'function'); if (dflt !== null || extra !== null) throw unsup('Table.SplitColumn default/extraValues');
  const i = colI(t, c); const parts = t.rows.map(r => { const v = r[i]; if (v === null) return [null]; if (isErrCell(v)) return [v]; const o = call(f, v); return Array.isArray(o) ? o : [o]; });
  let nm; if (names === null) { const w = parts.reduce((m, p) => Math.max(m, p.length), 1); nm = Array.from({ length: w }, (_, j) => c + '.' + (j + 1)); } else if (typeof names === 'number') nm = Array.from({ length: names }, (_, j) => c + '.' + (j + 1)); else nm = listOf(names);
  return { cols: t.cols.slice(0, i).concat(nm.map(x => ({ name: x, type: 'any' })), t.cols.slice(i + 1)).map(x => Object.assign({}, x)), rows: t.rows.map((r, ri) => r.slice(0, i).concat(nm.map((_, j) => (j < parts[ri].length ? parts[ri][j] : null)), r.slice(i + 1))) };
});
function opsList(x) { need(x, 'list'); return x.length && !Array.isArray(x[0]) ? [x] : x; }
def('Table.TransformColumns', 2, 4, (t, ops, dflt, m) => {
  need(t, 'table'); const out = cloneT(t); const mode = missing(m); const done = new Set();
  opsList(ops).forEach(o => { const name = o[0], f = o[1]; const i = t.cols.findIndex(c => c.name === name); if (i < 0) { if (mode === 'err') throw exprErr('The column \'' + name + '\' of the table wasn\'t found.', name); return; } done.add(i); need(f, 'function'); out.rows.forEach(r => { const v = r[i]; if (!isErrCell(v)) r[i] = protect(() => call(f, v)); }); out.cols[i].type = o.length > 2 && o[2] ? colTypeOf(o[2]) : 'any'; });
  if (dflt !== null) { need(dflt, 'function'); t.cols.forEach((c, i) => { if (done.has(i)) return; out.rows.forEach(r => { const v = r[i]; if (!isErrCell(v)) r[i] = protect(() => call(dflt, v)); }); out.cols[i].type = 'any'; }); }
  return out;
});
def('Table.TransformColumnTypes', 2, 3, (t, ops, c) => {
  need(t, 'table'); let mode = 'err'; if (c instanceof MRecord) { c.names.forEach(n => { if (n !== 'Culture' && n !== 'MissingField') throw unsup('Table.TransformColumnTypes seçeneği ' + n); }); if (c.f.has('MissingField')) mode = missing(recGet(c, 'MissingField')); }
  const cu = CULT(c); const out = cloneT(t);
  opsList(ops).forEach(o => { const ty = o[1]; if (!(ty instanceof MType)) throw convErr(ty, 'Type'); let i = out.cols.findIndex(x => x.name === o[0]); if (i < 0) { if (mode === 'err') throw exprErr('The column \'' + o[0] + '\' of the table wasn\'t found.', o[0]); if (mode === 'ignore') return; out.cols.push({ name: o[0], type: colTypeOf(ty) }); out.rows.forEach(r => r.push(null)); return; } out.rows.forEach(r => { r[i] = protect(() => convertTo(r[i], ty, cu)); }); out.cols[i].type = colTypeOf(ty); });
  return out;
});
def('Table.TransformRows', 2, 2, (t, f) => { need(t, 'table'); need(f, 'function'); return t.rows.map(r => protect(() => call(f, rowRecord(t, r)))); });
def('Table.Group', 3, 5, (t, key, agg, kind, cmp) => {
  need(t, 'table'); if (cmp !== null) throw unsup('Table.Group comparer'); const keys = listOf(key); const ki = keys.map(k => colI(t, k));
  need(agg, 'list'); const aggs = agg.length && !Array.isArray(agg[0]) ? [agg] : agg;
  const groups = []; const local = kind === 0;
  t.rows.forEach(r => { const kv = ki.map(i => r[i]); const g = local ? (groups.length && groups[groups.length - 1].k.every((x, j) => valEq(x, kv[j])) ? groups[groups.length - 1] : null) : groups.find(x => x.k.every((v, j) => valEq(v, kv[j]))); if (g) g.rows.push(r); else groups.push({ k: kv, rows: [r] }); });
  const cols = keys.map((k, j) => Object.assign({}, t.cols[ki[j]])).concat(aggs.map(a => ({ name: a[0], type: a.length > 2 && a[2] ? colTypeOf(a[2]) : 'any' })));
  return { cols, rows: groups.map(g => { const sub = { cols: t.cols.map(c => Object.assign({}, c)), rows: g.rows }; return g.k.concat(aggs.map(a => { need(a[1], 'function'); return protect(() => call(a[1], sub)); })); }) };
});
function sortSpec(spec) { if (spec instanceof MFunc) return [[spec, 0]]; if (typeof spec === 'string') return [[spec, 0]]; need(spec, 'list'); if (spec.length === 2 && (typeof spec[1] === 'number') && !Array.isArray(spec[0])) return [[spec[0], spec[1]]]; return spec.map(x => { if (Array.isArray(x)) return [x[0], x[1] === undefined ? 0 : x[1]]; return [x, 0]; }); }
def('Table.Sort', 2, 2, (t, spec) => { need(t, 'table'); const sp = sortSpec(spec).map(s => { if (typeof s[0] === 'string') { const i = colI(t, s[0]); return [r => liftCell(r[i]), s[1]]; } need(s[0], 'function'); return [r => call(s[0], rowRecord(t, r)), s[1]]; }); const rows = t.rows.map((r, i) => [r, i]).sort((a, b) => { for (const s of sp) { let c = sortCompare(s[0](a[0]), s[0](b[0])); if (s[1] === 1) c = -c; if (c) return c; } return a[1] - b[1]; }).map(x => x[0]); return { cols: t.cols.map(c => Object.assign({}, c)), rows }; });
def('Table.PrefixColumns', 2, 2, (t, x) => { need(t, 'table'); need(x, 'text'); const o = cloneT(t); o.cols.forEach(c => { c.name = x + '.' + c.name; }); return o; });
def('Table.Distinct', 1, 2, (t, cr) => { need(t, 'table'); let idxs = t.cols.map((c, i) => i); let eq = valEq; if (cr !== null) { if (typeof cr === 'string') idxs = [colI(t, cr)]; else if (Array.isArray(cr)) { if (cr.length === 2 && cr[1] instanceof MFunc) { idxs = listOf(cr[0]).map(x => colI(t, x)); eq = eqFn(cr[1], 'Table.Distinct'); } else idxs = cr.map(x => colI(t, x)); } else throw unsup('Table.Distinct ölçütü'); } const out = []; const safeEq = (a, b) => { if (isErrCell(a) || isErrCell(b)) return isErrCell(a) && isErrCell(b) && a.pqErr === b.pqErr; return eq(a, b); }; t.rows.forEach(r => { if (!out.some(o => idxs.every(i => safeEq(o[i], r[i])))) out.push(r); }); return { cols: t.cols.map(c => Object.assign({}, c)), rows: out }; });
function rowCount(t, c, fromEnd) { if (typeof c === 'number') return c; need(c, 'function'); const R = t.rows; let n = 0; if (fromEnd) { for (let i = R.length - 1; i >= 0 && truth(call(c, rowRecord(t, R[i]))); i--) n++; } else { while (n < R.length && truth(call(c, rowRecord(t, R[n])))) n++; } return n; }
const withRows = (t, rows) => ({ cols: t.cols.map(c => Object.assign({}, c)), rows });
def('Table.FirstN', 2, 2, (t, c) => { need(t, 'table'); return withRows(t, t.rows.slice(0, rowCount(t, c))); });
def('Table.LastN', 2, 2, (t, c) => { need(t, 'table'); const n = rowCount(t, c, true); return withRows(t, n > 0 ? t.rows.slice(-n) : []); });
def('Table.Skip', 1, 2, (t, c) => { need(t, 'table'); return withRows(t, t.rows.slice(c === null ? 1 : rowCount(t, c))); });
def('Table.RemoveFirstN', 1, 2, (t, c) => { need(t, 'table'); return withRows(t, t.rows.slice(c === null ? 1 : rowCount(t, c))); });
def('Table.RemoveLastN', 1, 2, (t, c) => { need(t, 'table'); const n = c === null ? 1 : rowCount(t, c, true); return withRows(t, n > 0 ? t.rows.slice(0, -n) : t.rows.slice()); });
def('Table.Range', 2, 3, (t, o, c) => { need(t, 'table'); return withRows(t, c === null ? t.rows.slice(o) : t.rows.slice(o, o + c)); });
def('Table.ReverseRows', 1, 1, t => { need(t, 'table'); return withRows(t, t.rows.slice().reverse()); });
def('Table.Repeat', 2, 2, (t, c) => { need(t, 'table'); let rows = []; for (let i = 0; i < c; i++) rows = rows.concat(t.rows); return withRows(t, rows); });
def('Table.Max', 2, 3, (t, f, d) => extreme(t, f, d, 1));
def('Table.Min', 2, 3, (t, f, d) => extreme(t, f, d, -1));
function extreme(t, f, d, sign) { need(t, 'table'); if (!t.rows.length) return d; const g = typeof f === 'string' ? (i => r => liftCell(r[i]))(colI(t, f)) : r => call(f, rowRecord(t, r)); let b = t.rows[0]; t.rows.slice(1).forEach(r => { if (sortCompare(g(r), g(b)) * sign > 0) b = r; }); return rowRecord(t, b); }
def('Table.Contains', 2, 3, (t, row, c) => { if (c !== null) throw unsup('Table.Contains equationCriteria'); need(t, 'table'); need(row, 'record'); return t.rows.some(r => row.names.every(n => { const i = colI(t, n); return valEq(r[i], recGet(row, n)); })); });
def('Table.MatchesAllRows', 2, 2, (t, f) => t.rows.every(r => truth(call(f, rowRecord(t, r)))));
def('Table.MatchesAnyRows', 2, 2, (t, f) => t.rows.some(r => truth(call(f, rowRecord(t, r)))));
def('Table.Combine', 1, 2, (ts, c) => { if (c !== null) throw unsup('Table.Combine columns'); return combine(items(ts)); });
def('Table.Buffer', 1, 2, t => need(t, 'table'));
def('Table.StopFolding', 1, 1, t => need(t, 'table'));
function joinRows(a, ka, b, kb, kind, fn) {
  const ia = listOf(ka).map(x => colI(a, x)), ib = listOf(kb).map(x => colI(b, x));
  if (ia.length !== ib.length) throw exprErr('Anahtar sütun sayıları eşit olmalı.');
  const match = (ra, rb) => ia.every((x, j) => ra[x] !== null && !isErrCell(ra[x]) && valEq(ra[x], rb[ib[j]]));
  return fn(ia, ib, match);
}
def('Table.Join', 4, 8, (a, ka, b, kb, kind, algo, keyEq) => {
  need(a, 'table'); need(b, 'table'); if (algo !== null || keyEq !== null) throw unsup('Table.Join joinAlgorithm/keyEqualityComparers');
  const k = kind === null ? 0 : kind; const la = listOf(ka), lb = listOf(kb);
  const same = b.cols.map(c => { const i = lb.indexOf(c.name); return i >= 0 && la[i] === c.name; }); // aynı adlı anahtar tek sütun kalır
  a.cols.forEach(c => { const j = b.cols.findIndex(x => x.name === c.name); if (j >= 0 && !same[j]) throw exprErr('A join operation cannot result in a table with duplicate column names ("' + c.name + '").', c.name); });
  const keepB = b.cols.map((c, i) => i).filter(i => !same[i]);
  return joinRows(a, ka, b, kb, k, (ia, ib, match) => {
    const rows = []; const used = new Set();
    const mk = (ra, rb) => { const left = ra ? ra.slice() : a.cols.map(() => null); if (!ra) a.cols.forEach((c, i) => { const j = b.cols.findIndex(x => x.name === c.name); if (j >= 0 && same[j]) left[i] = rb[j]; }); return left.concat(keepB.map(i => (rb ? rb[i] : null))); };
    a.rows.forEach(ra => { const hits = b.rows.filter(rb => match(ra, rb)); hits.forEach(h => used.add(h)); if (k === 4) { if (!hits.length) rows.push(mk(ra, null)); return; } if (k === 5) return; if (hits.length) hits.forEach(rb => rows.push(mk(ra, rb))); else if (k === 1 || k === 3) rows.push(mk(ra, null)); });
    if (k === 2 || k === 3 || k === 5) b.rows.forEach(rb => { if (!used.has(rb)) rows.push(mk(null, rb)); });
    return { cols: a.cols.map(c => Object.assign({}, c)).concat(keepB.map(i => Object.assign({}, b.cols[i]))), rows };
  });
});
def('Table.NestedJoin', 5, 8, (a, ka, b, kb, n, kind, keyEq) => {
  need(a, 'table'); need(b, 'table'); if (keyEq !== null) throw unsup('Table.NestedJoin keyEqualityComparers'); const k = kind === null ? 1 : kind;
  return joinRows(a, ka, b, kb, k, (ia, ib, match) => {
    const rows = []; const used = new Set();
    a.rows.forEach(ra => { const hits = b.rows.filter(rb => match(ra, rb)); hits.forEach(h => used.add(h)); const sub = withRows(b, hits); if (k === 0) { if (hits.length) rows.push(ra.concat([sub])); } else if (k === 4) { if (!hits.length) rows.push(ra.concat([sub])); } else if (k !== 5) rows.push(ra.concat([sub])); });
    if (k === 2 || k === 3 || k === 5) b.rows.forEach(rb => { if (!used.has(rb)) rows.push(a.cols.map(() => null).concat([withRows(b, [rb])])); });
    if (k === 2) return { cols: a.cols.map(c => Object.assign({}, c)).concat([{ name: n, type: 'table' }]), rows: rows.filter(r => r[r.length - 1].rows.length) };
    return { cols: a.cols.map(c => Object.assign({}, c)).concat([{ name: n, type: 'table' }]), rows };
  });
});
def('Table.ExpandTableColumn', 3, 4, (t, c, names, nn2) => {
  need(t, 'table'); const i = colI(t, c); const inner = listOf(names); const out = nn2 === null ? inner : listOf(nn2); const rows = [];
  t.rows.forEach(r => { const s = r[i]; const base = v => r.slice(0, i).concat(v, r.slice(i + 1)); if (s === null) { rows.push(base(inner.map(() => null))); return; } if (isErrCell(s)) { rows.push(base(inner.map(() => s))); return; } need(s, 'table'); const ix = inner.map(n => colI(s, n)); if (!s.rows.length) rows.push(base(inner.map(() => null))); else s.rows.forEach(sr => rows.push(base(ix.map(j => sr[j])))); });
  const firstSub = t.rows.map(r => r[i]).find(isTable);
  return { cols: t.cols.slice(0, i).concat(out.map((n, j) => { const sc = firstSub && firstSub.cols.find(x => x.name === inner[j]); return { name: n, type: sc ? sc.type : 'any' }; }), t.cols.slice(i + 1)).map(x => Object.assign({}, x)), rows };
});
def('Table.ExpandRecordColumn', 3, 4, (t, c, names, nn2) => {
  need(t, 'table'); const i = colI(t, c); const inner = listOf(names); const out = nn2 === null ? inner : listOf(nn2);
  return { cols: t.cols.slice(0, i).concat(out.map(n => ({ name: n, type: 'any' })), t.cols.slice(i + 1)).map(x => Object.assign({}, x)), rows: t.rows.map(r => { const s = r[i]; const vals = s === null ? inner.map(() => null) : isErrCell(s) ? inner.map(() => s) : inner.map(n => { need(s, 'record'); if (!s.f.has(n)) return null; return protect(() => s.f.get(n)); }); return r.slice(0, i).concat(vals, r.slice(i + 1)); }) };
});
def('Table.ExpandListColumn', 2, 2, (t, c) => { need(t, 'table'); const i = colI(t, c); const rows = []; t.rows.forEach(r => { const s = r[i]; if (s === null || isErrCell(s)) { rows.push(r.slice()); return; } need(s, 'list'); if (!s.length) { const x = r.slice(); x[i] = null; rows.push(x); } else s.forEach(v => { const x = r.slice(); x[i] = v; rows.push(x); }); }); const out = withRows(t, rows); out.cols[i].type = 'any'; return out; });
def('Table.Pivot', 4, 5, (t, vals, attr, val, agg) => {
  need(t, 'table'); const pv = items(vals); const ia = colI(t, attr), iv = colI(t, val); pv.forEach(p => need(p, 'text'));
  const kept = t.cols.map((c, i) => i).filter(i => i !== ia && i !== iv); const groups = [];
  t.rows.forEach(r => { const k = kept.map(i => r[i]); let g = groups.find(x => x.k.every((v, j) => valEq(v, k[j]))); if (!g) { g = { k, m: new Map() }; groups.push(g); } const a = r[ia]; if (a === null) throw new MUnsup('Pivot öznitelik sütununda null var: gerçek davranış belgede yazmıyor, burada durduruldu. Önce null satırları süz.'); if (!g.m.has(a)) g.m.set(a, []); g.m.get(a).push(r[iv]); });
  if (agg !== null) need(agg, 'function');
  const rows = groups.map(g => g.k.concat(pv.map(p => {
    const a = g.m.get(p); if (agg !== null) return protect(() => call(agg, a || []));
    if (!a) return null; if (a.length > 1) return { pqErr: 'Expression.Error: There were too many elements in the enumeration to complete the operation.', merr: exprErr('There were too many elements in the enumeration to complete the operation.') }; return a[0];
  })));
  return { cols: kept.map(i => Object.assign({}, t.cols[i])).concat(pv.map(p => ({ name: p, type: 'any' }))), rows };
});
function unpivotBy(t, cols, attr, val) {
  const up2 = t.cols.map((c, i) => i).filter(i => cols.includes(t.cols[i].name)); const keep = t.cols.map((c, i) => i).filter(i => !up2.includes(i)); const rows = [];
  t.rows.forEach(r => up2.forEach(i => { if (r[i] === null) return; rows.push(keep.map(k => r[k]).concat([t.cols[i].name, r[i]])); }));
  const tys = up2.map(i => t.cols[i].type); const vt = tys.length && tys.every(x => x === tys[0]) ? tys[0] : 'any';
  return { cols: keep.map(k => Object.assign({}, t.cols[k])).concat([{ name: attr, type: 'text' }, { name: val, type: vt }]), rows };
}
def('Table.Unpivot', 4, 4, (t, pv, a, v) => { need(t, 'table'); const l = listOf(pv); l.forEach(x => colI(t, x)); return unpivotBy(t, l, a, v); });
def('Table.UnpivotOtherColumns', 4, 4, (t, pv, a, v) => { need(t, 'table'); const l = listOf(pv); l.forEach(x => colI(t, x)); return unpivotBy(t, t.cols.map(c => c.name).filter(n => !l.includes(n)), a, v); });
def('Table.Transpose', 1, 2, (t, cs) => { need(t, 'table'); const h = t.rows.length; const names = cs === null ? Array.from({ length: h }, (_, i) => 'Column' + (i + 1)) : listOf(cs); if (names.length !== h) throw exprErr('Transpose: sütun adı sayısı satır sayısına eşit olmalı.'); return mkTable(names, t.cols.map((c, j) => t.rows.map(r => r[j]))); });
def('Table.PromoteHeaders', 1, 2, (t, o) => { need(t, 'table'); if (!t.rows.length) return cloneT(t); const seen = new Map(); const names = t.rows[0].map((v, i) => { let s = v === null ? t.cols[i].name : isErrCell(v) ? t.cols[i].name : toText(v, o instanceof MRecord ? recGet(o, 'Culture') : null); if (s === '') s = t.cols[i].name; return s; }); names.forEach((n, i) => { if (seen.has(n)) { let k = seen.get(n) + 1; while (names.includes(n + '_' + k)) k++; names[i] = n + '_' + k; seen.set(n, k); } else seen.set(n, 0); }); return mkTable(names, t.rows.slice(1).map(r => r.slice())); });
def('Table.DemoteHeaders', 1, 1, t => { need(t, 'table'); return mkTable(t.cols.map((c, i) => 'Column' + (i + 1)), [t.cols.map(c => c.name)].concat(t.rows.map(r => r.slice()))); });
def('Table.ReplaceValue', 5, 5, (t, o, n, rep, cs) => { need(t, 'table'); need(rep, 'function'); const out = cloneT(t); listOf(cs).forEach(c => { const i = colI(t, c); out.rows.forEach(r => { if (!isErrCell(r[i])) r[i] = protect(() => call(rep, r[i], o, n)); }); }); return out; });
def('Table.ReplaceErrorValues', 2, 2, (t, ops) => { need(t, 'table'); const out = cloneT(t); opsList(ops).forEach(p => { const i = colI(t, p[0]); out.rows.forEach(r => { if (isErrCell(r[i])) r[i] = p[1]; }); }); return out; });
def('Table.RemoveRowsWithErrors', 1, 2, (t, cs) => { need(t, 'table'); const ix = cs === null ? t.cols.map((c, i) => i) : listOf(cs).map(x => colI(t, x)); return withRows(t, t.rows.filter(r => !ix.some(i => isErrCell(r[i])))); });
def('Table.SelectRowsWithErrors', 1, 2, (t, cs) => { need(t, 'table'); const ix = cs === null ? t.cols.map((c, i) => i) : listOf(cs).map(x => colI(t, x)); return withRows(t, t.rows.filter(r => ix.some(i => isErrCell(r[i])))); });
function fill(t, cs, rev) { need(t, 'table'); const out = cloneT(t); listOf(cs).forEach(c => { const i = colI(t, c); let last = null; const R = rev ? out.rows.slice().reverse() : out.rows; R.forEach(r => { if (r[i] === null) r[i] = last; else last = r[i]; }); }); return out; }
def('Table.FillDown', 2, 2, (t, c) => fill(t, c, false));
def('Table.FillUp', 2, 2, (t, c) => fill(t, c, true));
def('Table.Profile', 1, 2, (t, o) => {
  need(t, 'table'); if (o !== null) throw unsup('Table.Profile additionalAggregates');
  return mkTable(['Column', 'Min', 'Max', 'Average', 'StandardDeviation', 'Count', 'NullCount', 'DistinctCount'], t.cols.map((c, i) => {
    const vals = t.rows.map(r => r[i]).filter(v => !isErrCell(v)); const nz = vals.filter(v => v !== null); const num = nz.filter(v => typeof v === 'number');
    const sorted = nz.slice().sort((a, b) => (typeName(a) === typeName(b) ? compareVals(a, b) : 0)); const seen = []; vals.forEach(v => { if (!seen.some(x => valEq(x, v))) seen.push(v); });
    const m = num.length ? num.reduce((s, x) => s + x, 0) / num.length : null;
    return [c.name, sorted.length ? sorted[0] : null, sorted.length ? sorted[sorted.length - 1] : null, num.length === nz.length && nz.length ? m : null, num.length > 1 && num.length === nz.length ? Math.sqrt(num.reduce((s, x) => s + (x - m) * (x - m), 0) / (num.length - 1)) : null, t.rows.length, vals.filter(v => v === null).length, seen.length];
  }));
});

/* --- Benzetimli dosya sistemi: Folder.Files, File.Contents, Csv.Document, Binary --- */
const FILES = [
  { path: 'C:\\Veri\\Satis\\', name: 'satis_2024_01.csv', ext: '.csv', mod: Date.UTC(2024, 1, 1, 9, 0, 0), text: 'Tarih;Bayi;Tutar\n2024-01-05;Kadıköy Bayi;1250.5\n2024-01-12;Kızılay Bayi;980\n2024-01-20;Alsancak Bayi;1430' },
  { path: 'C:\\Veri\\Satis\\', name: 'satis_2024_02.csv', ext: '.csv', mod: Date.UTC(2024, 2, 1, 9, 0, 0), text: 'Tarih;Bayi;Tutar\n2024-02-02;Kadıköy Bayi;1410.5\n2024-02-09;Nilüfer Bayi;1880.25' },
  { path: 'C:\\Veri\\Satis\\', name: 'satis_2024_03.csv', ext: '.csv', mod: Date.UTC(2024, 3, 1, 9, 0, 0), text: 'Tarih;Bayi;Tutar\n2024-03-04;Kızılay Bayi;1125\n2024-03-15;Alsancak Bayi;960\n2024-03-28;Nilüfer Bayi;1505' },
  { path: 'C:\\Veri\\Satis\\', name: 'okubeni.txt', ext: '.txt', mod: Date.UTC(2024, 0, 2, 9, 0, 0), text: 'Bu klasöre yalnız aylık satış dosyalarını bırakın.' }
];
function normPath(p) { return String(p).replace(/\//g, '\\').replace(/\\?$/, '\\'); }
def('Folder.Files', 1, 2, (p, o) => { need(p, 'text'); if (o !== null) throw unsup('Folder.Files options'); const np = normPath(p); const hit = FILES.filter(f => f.path.toLowerCase().startsWith(np.toLowerCase())); if (!hit.length) throw err('DataSource.NotFound', 'Could not find a part of the path \'' + p + '\'. Bu benzetimde yalnız C:\\Veri\\Satis klasörü var.', p); return mkTable(['Content', 'Name', 'Extension', 'Date modified', 'Folder Path'], hit.map(f => [new MBinary(f.text), f.name, f.ext, mkDT(f.mod), f.path]), ['binary', 'text', 'text', 'datetime', 'text']); });
LIB.set('Folder.Contents', new MFunc(() => { throw unsup('Folder.Contents', 'benzetimde Folder.Files var'); }, 'Folder.Contents', 0, 9));
def('File.Contents', 1, 2, (p, o) => { need(p, 'text'); if (o !== null) throw unsup('File.Contents options'); const f = FILES.find(x => (x.path + x.name).toLowerCase() === String(p).replace(/\//g, '\\').toLowerCase()); if (!f) throw err('DataSource.NotFound', 'Could not find file \'' + p + '\'. Bu benzetimde yalnız C:\\Veri\\Satis klasöründeki dosyalar var.', p); return new MBinary(f.text); });
def('Text.FromBinary', 1, 2, (b, e) => (b === null ? null : need(b, 'binary').text));
def('Text.ToBinary', 1, 3, (s, e) => (s === null ? null : new MBinary(need(s, 'text'))));
def('Binary.Length', 1, 1, b => (b === null ? null : need(b, 'binary').text.length));
function splitCsvLine(line, d, quote) { if (!quote) return line.split(d); const out = []; let cur = '', q = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; } else if (c === '"') q = true; else if (line.startsWith(d, i)) { out.push(cur); cur = ''; i += d.length - 1; } else cur += c; } out.push(cur); return out; }
def('Csv.Document', 1, 5, (b, o, d2, x, e2) => {
  if (x !== null || e2 !== null) throw unsup('Csv.Document extraValues/encoding bağımsız değişkeni');
  need(b, 'binary'); let d = ',', columns = null, quote = true;
  if (o instanceof MRecord) { o.names.forEach(n => { if (!['Delimiter', 'Columns', 'Encoding', 'QuoteStyle'].includes(n)) throw unsup('Csv.Document seçeneği ' + n); }); if (o.f.has('Delimiter')) d = recGet(o, 'Delimiter'); if (o.f.has('Columns')) columns = recGet(o, 'Columns'); if (o.f.has('QuoteStyle')) quote = recGet(o, 'QuoteStyle') !== 0; }
  else if (typeof o === 'number') columns = o; else if (o !== null) throw unsup('Csv.Document ikinci bağımsız değişken biçimi');
  if (d2 !== null) d = d2;
  const lines = b.text.split(/\r?\n/).filter(l => l !== '' ); const data = lines.map(l => splitCsvLine(l, d, quote)); const w = columns === null ? data.reduce((m, r) => Math.max(m, r.length), 0) : (typeof columns === 'number' ? columns : columns.length);
  const names = typeof columns === 'object' && columns ? listOf(columns) : Array.from({ length: w }, (_, i) => 'Column' + (i + 1));
  return mkTable(names, data.map(r => names.map((_, i) => (i < r.length ? r[i] : null))));
});

function fromJson(v) { if (Array.isArray(v)) return v.map(fromJson); if (v && typeof v === 'object') { const r = new MRecord(); Object.keys(v).forEach(k => { r.names.push(k); r.f.set(k, fromJson(v[k])); }); return r; } return v === undefined ? null : v; }
def('Json.Document', 1, 2, (s, enc) => { if (s === null) return null; const t = s instanceof MBinary ? s.text : need(s, 'text'); try { return fromJson(JSON.parse(t)); } catch (x) { throw err('DataFormat.Error', 'We found extra characters at the end of the JSON input.', t); } });
def('Table.AlternateRows', 4, 4, (t, off, sk, tk) => { need(t, 'table'); const rows = t.rows.slice(0, off); let i = off; while (i < t.rows.length) { i += sk; for (let j = 0; j < tk && i < t.rows.length; j++, i++) rows.push(t.rows[i]); } return withRows(t, rows); });
/* ---------- Ad çözümü: kitaplık, Lab sorguları, net hata ---------- */
let QUERIES = {};
function refreshQueries() {
  const out = {}; const PQ = W.PBI_PQ; if (PQ && PQ.SOURCES) Object.keys(PQ.SOURCES).forEach(k => { const s = PQ.SOURCES[k]; const qn = s.qn || QN[k]; if (qn) out[qn] = s.table; });
  Object.assign(out, EXTRA_QUERIES); return out;
}
const QN = { bayi: 'Bayi_Ocak', hedef: 'Hedefler', urun: 'Urun_Listesi', musteri: 'Musteri_Ham' };
const EXTRA_QUERIES = {};
function globalLookup(name) {
  if (LIB.has(name)) return LIB.get(name);
  if (Object.prototype.hasOwnProperty.call(QUERIES, name)) return QUERIES[name];
  return undefined;
}
const NS = ['Table', 'List', 'Text', 'Date', 'DateTime', 'DateTimeZone', 'Duration', 'Time', 'Number', 'Record', 'Value', 'Type', 'Binary', 'BinaryFormat', 'Lines', 'Uri', 'Function', 'Splitter', 'Combiner', 'Replacer', 'Comparer', 'Character', 'Cube', 'Access', 'Csv', 'Sql', 'Excel', 'Web', 'Folder', 'File', 'Json', 'Xml', 'OData', 'SharePoint', 'Odbc', 'OleDb', 'Oracle', 'Hdfs', 'Hive', 'Spark', 'Salesforce', 'AzureStorage', 'Expression', 'Error', 'Diagnostics', 'Logical', 'Int8', 'Int16', 'Int32', 'Int64', 'Single', 'Double', 'Decimal', 'Currency', 'Percentage', 'JoinKind', 'JoinAlgorithm', 'Order', 'MissingField', 'QuoteStyle', 'GroupKind', 'Occurrence', 'RoundingMode', 'Day', 'Culture', 'Graph', 'Geography', 'Geometry', 'WebAction', 'Pdf', 'Parquet', 'Lakehouse', 'Sybase', 'Teradata', 'PostgreSQL', 'MySQL', 'Snowflake', 'AnalysisServices', 'Variable', 'Action', 'Identity', 'RowExpression', 'ItemExpression', 'Precision', 'TextEncoding', 'Compression', 'BufferMode', 'LimitClause', 'ExtraValues', 'RelativePosition', 'SqlExpression', 'AccessControlEntry', 'Embedded', 'Soda', 'Exchange', 'ActiveDirectory', 'Informix', 'DB2', 'Essbase', 'SapBusinessWarehouse', 'SapHana', 'Tables', 'Password', 'Pi', 'Guid', 'Comparer'];
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
function suggest(name) {
  const low = name.toLowerCase(); const all = [...LIB.keys()].concat(Object.keys(QUERIES));
  const exact = all.find(x => x.toLowerCase() === low); if (exact) return { exact };
  let best = null, bd = 3; all.forEach(x => { if (Math.abs(x.length - name.length) > 2) return; const c = lev(low, x.toLowerCase()); if (c < bd) { bd = c; best = x; } }); return { near: best };
}
function unknownName(name) {
  const s = suggest(name);
  if (s.exact) return err('Expression.Error', 'The name \'' + name + '\' wasn\'t recognized. M büyük/küçük harfe duyarlıdır: “' + s.exact + '” yaz.', name);
  const ns = name.split('.')[0];
  if (name.includes('.') && NS.includes(ns)) return new MUnsup('“' + name + '” bu alt kümede yok' + (s.near ? ' (“' + s.near + '” mı demek istedin?)' : '') + '. Gerçek M’de var olabilir; burada sessizce yanlış sonuç vermek yerine duruyoruz.');
  return err('Expression.Error', 'The name \'' + name + '\' wasn\'t recognized. Make sure it\'s spelled correctly.' + (s.near ? ' “' + s.near + '” mı demek istedin?' : ''), name);
}

/* ---------- Dış arayüz ---------- */
function posOf(src, at) { const pre = src.slice(0, at); const line = pre.split('\n').length; return { line, col: at - pre.lastIndexOf('\n') }; }
function run(src, opt) {
  opt = opt || {}; QUERIES = refreshQueries(); if (opt.env) Object.assign(QUERIES, opt.env);
  STEPS = 0; DEPTH = 0; if (opt.maxSteps) MAXSTEPS = opt.maxSteps;
  try {
    const ast = parse(String(src == null ? '' : src));
    const root = new Env(null, new Map());
    const value = norm(ev(ast, root));
    return { ok: true, value };
  } catch (e) {
    if (e instanceof MSyntax) { const P = posOf(String(src), e.pos == null ? 0 : e.pos); return { ok: false, kind: 'syntax', message: e.message, line: P.line, col: P.col }; }
    if (e instanceof MErr) { const reason = recGet(e.rec, 'Reason'), msg = recGet(e.rec, 'Message'); return { ok: false, kind: 'runtime', reason, message: msg, detail: recGet(e.rec, 'Detail') }; }
    if (e instanceof MUnsup) return { ok: false, kind: e.kind, message: e.message };
    if (e instanceof RangeError) return { ok: false, kind: 'limit', message: 'Çağrı zinciri çok derinleşti ve durduruldu (bitmeyen özyineleme olabilir).' };
    throw e;
  }
}
/* Lab köprüsü: önceki tablo üstüne bir M ifadesi çalıştırır. Tablo Prev adıyla görünür. */
const TYPE_BACK = { text: 'text', number: 'number', int: 'int', date: 'date', any: 'any', currency: 'number', percentage: 'number', logical: 'any', datetime: 'any', duration: 'any', table: 'any', list: 'any', record: 'any', binary: 'any', function: 'any', null: 'any' };
function applyStep(table, code) {
  const r = run(code, { env: { Prev: table } });
  if (!r.ok) { const e = new Error(r.message); e.m = r; throw e; }
  if (!isTable(r.value)) throw new Error('M ifadesi tablo döndürmedi.');
  return { cols: r.value.cols.map(c => ({ name: c.name, type: TYPE_BACK[c.type] || 'any' })), rows: r.value.rows };
}
function names() { return [...LIB.keys()].filter(n => LIB.get(n) instanceof MFunc && !n.startsWith('#') && !['Value.NativeQuery'].includes(n) && !LIB.get(n).fn.toString().includes('NATIVE_NOTE')); }
function isConnector(n) { const f = LIB.get(n); return f instanceof MFunc && f.fn.toString().includes('MUnsup') && f.fn.toString().includes('NATIVE_NOTE'); }
function supported() { return [...LIB.keys()].filter(n => !n.startsWith('#') && !isConnector(n) && !/^(Folder\.Contents|List\.TransformMany)$/.test(n)); }
function errorText(r) {
  if (r.ok) return '';
  if (r.kind === 'syntax') return 'Söz dizimi hatası (' + r.line + '. satır, ' + r.col + '. sütun): ' + r.message;
  if (r.kind === 'runtime') return r.reason + ': ' + r.message;
  return r.message;
}
W.PBI_M = { run, fmt, compareResult, applyStep, isTable, isErrCell, MRecord, MFunc, MType, MDuration, MBinary, supported, errorText, typeName, FILES, QN, recGet, QUERY_NAMES: () => Object.keys(refreshQueries()), LIMIT: 'Kaynağa bağlanmaz, sorgu katlamaz; zaman (time) ve saat dilimi türleri, gizlilik düzeyleri ve bağlayıcılar yoktur. Dosya işlevleri benzetimdir. Kültür olarak tr-TR, en-US, fr-FR, de-DE çalışır. Desteklenmeyen işlevde hata verir, try bile bu hatayı yakalamaz, tahmin yürütülmez.' };
})(window);
