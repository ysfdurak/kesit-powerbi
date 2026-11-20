// Öğrenci hataları ve farklı yazımlar: bir DAX ifadesinden yaygın yanlış/alternatif varyantlar üretir.
// variants(expr) → [[etiket, yeni ifade], ...]
function scan(s) { // dize, '…' tablo adı ve […] köşeli parantez içindeki konumları işaretler
  const inside = new Uint8Array(s.length); let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '"') { let j = i + 1; while (j < s.length && !(s[j] === '"' && s[j + 1] !== '"')) j += s[j] === '"' ? 2 : 1; for (let k = i; k <= j && k < s.length; k++) inside[k] = 1; i = j + 1; }
    else if (c === "'") { let j = s.indexOf("'", i + 1); if (j < 0) j = s.length - 1; for (let k = i; k <= j; k++) inside[k] = 1; i = j + 1; }
    else if (c === '[') { let j = s.indexOf(']', i + 1); if (j < 0) j = s.length - 1; for (let k = i; k <= j; k++) inside[k] = 1; i = j + 1; }
    else if (c === '-' && s[i + 1] === '-') { let j = s.indexOf('\n', i); if (j < 0) j = s.length; for (let k = i; k < j; k++) inside[k] = 1; i = j; }
    else if (c === '/' && s[i + 1] === '/') { let j = s.indexOf('\n', i); if (j < 0) j = s.length; for (let k = i; k < j; k++) inside[k] = 1; i = j; }
    else i++;
  }
  return inside;
}
// fn( … ) çağrılarını bulur: {start, open, close, args:[{a,b}]}
function calls(s, fn) {
  const ins = scan(s), out = []; const re = new RegExp('(^|[^A-Za-z0-9_.\\]])(' + fn + ')\\s*\\(', 'gi'); let m;
  while ((m = re.exec(s))) {
    const start = m.index + m[1].length; if (ins[start]) continue;
    const open = s.indexOf('(', start); let d = 0, k = open, args = [], a0 = open + 1;
    for (; k < s.length; k++) { if (ins[k]) continue; const c = s[k]; if (c === '(' || c === '{') d++; else if (c === ')' || c === '}') { d--; if (d === 0) break; } else if (c === ',' && d === 1) { args.push({ a: a0, b: k }); a0 = k + 1; } }
    if (k >= s.length) continue; if (s.slice(a0, k).trim()) args.push({ a: a0, b: k });
    out.push({ start, open, close: k, args, name: m[2] });
  }
  return out;
}
const A = (s, x) => s.slice(x.a, x.b).trim();
const rep = (s, a, b, t) => s.slice(0, a) + t + s.slice(b);
function words(s, re, to) { const ins = scan(s); let hit = false; const r = s.replace(re, (m0, ...g) => { const off = g[g.length - 2]; if (ins[off]) return m0; hit = true; return typeof to === 'function' ? to(m0, ...g) : m0.replace(re, to); }); return hit ? r : null; }
const RULES = [
  ['ALL→ALLSELECTED', s => words(s, /\bALL\s*\(/gi, 'ALLSELECTED(')],
  ['ALLSELECTED→ALL', s => words(s, /\bALLSELECTED\s*\(/gi, 'ALL(')],
  ['REMOVEFILTERS→ALL', s => words(s, /\bREMOVEFILTERS\s*\(/gi, 'ALL(')],
  ['ALLEXCEPT→ALL', s => { const c = calls(s, 'ALLEXCEPT')[0]; return c ? rep(s, c.start, c.close + 1, 'ALL(' + A(s, c.args[0]) + ')') : null; }],
  ['DIVIDE→/', s => { const c = calls(s, 'DIVIDE')[0]; return c && c.args.length >= 2 ? rep(s, c.start, c.close + 1, '(' + A(s, c.args[0]) + ') / (' + A(s, c.args[1]) + ')') : null; }],
  ['/→DIVIDE', s => { const ins = scan(s); const m = /(\[[^\]]+\]|(?<![.\w])[A-Z]+\([^()]*\))\s*\/\s*(\[[^\]]+\]|(?<![.\w])[A-Z]+\([^()]*\))/.exec(s); return m && !ins[m.index] ? rep(s, m.index, m.index + m[0].length, 'DIVIDE(' + m[1] + ', ' + m[2] + ')') : null; }],
  ['DIVIDE alt değer', s => { const c = calls(s, 'DIVIDE')[0]; return c && c.args.length === 2 ? rep(s, c.close, c.close, ', 0') : null; }],
  ['VALUES→DISTINCT', s => words(s, /\bVALUES\s*\(/gi, 'DISTINCT(')],
  ['DISTINCT→VALUES', s => words(s, /\bDISTINCT\s*\(/gi, 'VALUES(')],
  ['SELECTEDVALUE→VALUES', s => { const c = calls(s, 'SELECTEDVALUE')[0]; return c ? rep(s, c.start, c.close + 1, 'VALUES(' + A(s, c.args[0]) + ')') : null; }],
  ['SELECTEDVALUE varsayılansız', s => { const c = calls(s, 'SELECTEDVALUE')[0]; return c && c.args.length === 2 ? rep(s, c.args[0].b, c.close, '') : null; }],
  ['HASONEVALUE→ISINSCOPE', s => words(s, /\bHASONEVALUE\s*\(/gi, 'ISINSCOPE(')],
  ['ISINSCOPE→HASONEVALUE', s => words(s, /\bISINSCOPE\s*\(/gi, 'HASONEVALUE(')],
  ['DISTINCTCOUNT→COUNT', s => words(s, /\bDISTINCTCOUNT\s*\(/gi, 'COUNT(')],
  ['COUNT→COUNTA', s => words(s, /\bCOUNT\s*\(/gi, 'COUNTA(')],
  ['COUNTROWS→COUNT', s => { const c = calls(s, 'COUNTROWS')[0]; if (!c) return null; const t = A(s, c.args[0]); return /^'?[A-Za-zÇĞİÖŞÜçğıöşü_ ]+'?$/.test(t) ? null : null; }],
  ['SUM→SUMX tablosuz', s => { const c = calls(s, 'SUM')[0]; if (!c) return null; const a = A(s, c.args[0]); const m = a.match(/^'?([^'\[]+)'?\[/); return m ? rep(s, c.start, c.close + 1, "SUMX('" + m[1] + "', " + a + ')') : null; }],
  ['SUMX→SUM', s => { const c = calls(s, 'SUMX')[0]; if (!c || c.args.length !== 2) return null; const b = A(s, c.args[1]); return /^'?[^'\[]+'?\[[^\]]+\]$/.test(b) ? rep(s, c.start, c.close + 1, 'SUM(' + b + ')') : null; }],
  ['CALCULATE son filtre yok', s => { const c = calls(s, 'CALCULATE')[0]; return c && c.args.length >= 2 ? rep(s, c.args[c.args.length - 2].b, c.close, '') : null; }],
  ['CALCULATE yok', s => { const c = calls(s, 'CALCULATE').find(x => x.args.length === 1); return c ? rep(s, c.start, c.close + 1, A(s, c.args[0])) : null; }],
  ['FILTER(ALL(x))→FILTER(x)', s => { const c = calls(s, 'FILTER')[0]; if (!c) return null; const t = A(s, c.args[0]); const m = t.match(/^ALL\s*\(\s*('?[^'()\[\]]+'?)\s*\)$/i); return m ? rep(s, c.args[0].a, c.args[0].b, ' ' + m[1]) : null; }],
  ['FILTER(x)→FILTER(ALL(x))', s => { const c = calls(s, 'FILTER')[0]; if (!c) return null; const t = A(s, c.args[0]); return /^'?[A-Za-zÇĞİÖŞÜçğıöşü_]+'?$/.test(t) ? rep(s, c.args[0].a, c.args[0].b, ' ALL(' + t + ')') : null; }],
  ['SAMEPERIODLASTYEAR→DATEADD', s => { const c = calls(s, 'SAMEPERIODLASTYEAR')[0]; return c ? rep(s, c.start, c.close + 1, 'DATEADD(' + A(s, c.args[0]) + ', -1, YEAR)') : null; }],
  ['DATEADD -1 YEAR→SAMEPERIODLASTYEAR', s => { const c = calls(s, 'DATEADD').find(x => x.args.length === 3 && /^-1$/.test(A(s, x.args[1])) && /^YEAR$/i.test(A(s, x.args[2]))); return c ? rep(s, c.start, c.close + 1, 'SAMEPERIODLASTYEAR(' + A(s, c.args[0]) + ')') : null; }],
  ['DATEADD MONTH→PREVIOUSMONTH', s => { const c = calls(s, 'DATEADD').find(x => x.args.length === 3 && /^-1$/.test(A(s, x.args[1])) && /^MONTH$/i.test(A(s, x.args[2]))); return c ? rep(s, c.start, c.close + 1, 'PREVIOUSMONTH(' + A(s, c.args[0]) + ')') : null; }],
  ['TOTALYTD→DATESYTD', s => { const c = calls(s, 'TOTALYTD')[0]; return c && c.args.length === 2 ? rep(s, c.start, c.close + 1, 'CALCULATE(' + A(s, c.args[0]) + ', DATESYTD(' + A(s, c.args[1]) + '))') : null; }],
  ['RANKX ALL→VALUES', s => { const c = calls(s, 'RANKX')[0]; if (!c) return null; const t = A(s, c.args[0]); const m = t.match(/^ALL\s*\((.*)\)$/is); return m ? rep(s, c.args[0].a, c.args[0].b, 'VALUES(' + m[1] + ')') : null; }],
  ['RANKX DENSE', s => { const c = calls(s, 'RANKX')[0]; return c && c.args.length === 2 ? rep(s, c.close, c.close, ', , DESC, DENSE') : null; }],
  ['&&→||', s => words(s, /&&/g, '||')],
  ['=→==', s => { const ins = scan(s); const m = /([^<>=!:])=([^=])/.exec(s); return m && !ins[m.index + 1] ? rep(s, m.index + 1, m.index + 2, '==') : null; }],
  ['ISBLANK→= BLANK()', s => { const c = calls(s, 'ISBLANK')[0]; return c ? rep(s, c.start, c.close + 1, '(' + A(s, c.args[0]) + ' = BLANK())') : null; }],
  ['IF else yok', s => { const c = calls(s, 'IF').find(x => x.args.length === 3); return c ? rep(s, c.args[1].b, c.close, '') : null; }],
  ['metin büyük harf', s => { const ins = scan(s); const m = /"([a-zçğıöşü][^"]*)"/.exec(s) || /"([A-ZÇĞİÖŞÜ][^"]+)"/.exec(s); if (!m) return null; const v = m[1]; const t = v === v.toLocaleLowerCase('tr') ? v.toLocaleUpperCase('tr') : v.toLocaleLowerCase('tr'); return t !== v ? rep(s, m.index, m.index + m[0].length, '"' + t + '"') : null; }],
  ['tablo adı yok', s => { const ins = scan(s); const m = /'?(Satislar|Satışlar)'?\[([^\]]+)\]/.exec(s); return m ? rep(s, m.index, m.index + m[0].length, '[' + m[2] + ']') : null; }],
  ['MAX→LASTDATE', s => { const c = calls(s, 'MAX').find(x => x.args.length === 1 && /Tarih\]$/.test(A(s, x.args[0]))); return c ? rep(s, c.start, c.close + 1, 'LASTDATE(' + A(s, c.args[0]) + ')') : null; }],
  ['tarih metin', s => { const c = calls(s, 'DATE').find(x => x.args.length === 3 && x.args.every(a => /^\d+$/.test(A(s, a)))); return c ? rep(s, c.start, c.close + 1, '"' + A(s, c.args[0]) + '-' + A(s, c.args[1]).padStart(2, '0') + '-' + A(s, c.args[2]).padStart(2, '0') + '"') : null; }],
  ['sayı metin', s => { const ins = scan(s); const m = /([=<>]\s*)(\d+(?:\.\d+)?)\b/.exec(s); return m && !ins[m.index] ? rep(s, m.index + m[1].length, m.index + m[0].length, '"' + m[2] + '"') : null; }],
  ['parantez eksik', s => { const i = s.lastIndexOf(')'); return i > 0 ? rep(s, i, i + 1, '') : null; }],
  ['RELATED yok', s => { const c = calls(s, 'RELATED')[0]; return c ? rep(s, c.start, c.close + 1, A(s, c.args[0])) : null; }],
  ['USERELATIONSHIP yok', s => { const c = calls(s, 'USERELATIONSHIP')[0]; if (!c) return null; const p = s.lastIndexOf(',', c.start); return p > 0 ? rep(s, p, c.close + 1, '') : null; }],
  ['KEEPFILTERS yok', s => { const c = calls(s, 'KEEPFILTERS')[0]; return c ? rep(s, c.start, c.close + 1, A(s, c.args[0])) : null; }],
  ['AVERAGE→AVERAGEX VALUES', s => { const c = calls(s, 'AVERAGE')[0]; return c ? rep(s, c.start, c.close + 1, 'AVERAGEX(VALUES(' + A(s, c.args[0]) + '), ' + A(s, c.args[0]) + ')') : null; }],
  ['ölçü yerine SUM(ölçü)', s => { const ins = scan(s); const m = /(^|[^'\w\]])\[([^\]]+)\]/.exec(s); return m ? rep(s, m.index + m[1].length, m.index + m[0].length, 'SUM([' + m[2] + '])') : null; }],
];
function variants(expr) { const out = []; const seen = new Set([expr]); for (const [lab, f] of RULES) { let v = null; try { v = f(expr); } catch (e) { v = null; } if (v && !seen.has(v)) { seen.add(v); out.push([lab, v]); } } return out; }
module.exports = { variants, RULES, calls };
