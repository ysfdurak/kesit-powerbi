// Power Query (M) için öğrenci hataları ve farklı yazımlar. Sözdizimini bozmaz (bozuk sorgu Desktop'ta tüm yenilemeyi durdurur).
function scan(s) { const ins = new Uint8Array(s.length); let i = 0; while (i < s.length) { if (s[i] === '"') { let j = i + 1; while (j < s.length && !(s[j] === '"' && s[j + 1] !== '"')) j += s[j] === '"' ? 2 : 1; for (let k = i; k <= j && k < s.length; k++) ins[k] = 1; i = j + 1; } else if (s[i] === '/' && s[i + 1] === '/') { let j = s.indexOf('\n', i); if (j < 0) j = s.length; for (let k = i; k < j; k++) ins[k] = 1; i = j; } else i++; } return ins; }
function sub(s, re, to) { const ins = scan(s); let hit = false; const r = s.replace(re, (...g) => { const off = g[g.length - 2]; if (ins[off]) return g[0]; hit = true; return typeof to === 'function' ? to(...g) : g[0].replace(new RegExp(re.source, re.flags.replace('g', '')), to); }); return hit ? r : null; }
const once = (s, re, to) => { const ins = scan(s); const m = new RegExp(re.source, re.flags.replace('g', '')).exec(s); if (!m || ins[m.index]) return null; return s.slice(0, m.index) + (typeof to === 'function' ? to(...m) : to) + s.slice(m.index + m[0].length); };
const RULES = [
  ['kültür yok', s => sub(s, /,\s*"(en-US|tr-TR)"/g, '')],
  ['kültür tr-TR', s => sub(s, /"en-US"/g, '"tr-TR"')],
  ['tür metin', s => once(s, /type number\b/, 'type text')],
  ['tür tamsayı', s => once(s, /type number\b/, 'Int64.Type')],
  ['sütun adı küçük harf', s => { const ins = scan(s); const m = /\[([A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü]+)\]/.exec(s); if (!m || ins[m.index]) return null; return s.slice(0, m.index) + '[' + m[1].toLocaleLowerCase('tr') + ']' + s.slice(m.index + m[0].length); }],
  ['metin sütun adı küçük harf', s => { const m = /\{"([A-ZÇĞİÖŞÜ][^"]*)"/.exec(s); if (!m) return null; return s.slice(0, m.index) + '{"' + m[1].toLocaleLowerCase('tr') + '"' + s.slice(m.index + m[0].length); }],
  ['LeftOuter→Inner', s => sub(s, /JoinKind\.LeftOuter/g, 'JoinKind.Inner')],
  ['Inner→LeftOuter', s => sub(s, /JoinKind\.Inner/g, 'JoinKind.LeftOuter')],
  ['LeftAnti→RightAnti', s => sub(s, /JoinKind\.LeftAnti/g, 'JoinKind.RightAnti')],
  ['Upper→Lower', s => sub(s, /Text\.Upper\b/g, 'Text.Lower')],
  ['Proper→Upper', s => sub(s, /Text\.Proper\b/g, 'Text.Upper')],
  ['Trim→Clean', s => sub(s, /Text\.Trim\b/g, 'Text.Clean')],
  ['> → >=', s => once(s, /(\s)>(\s)/, (a, b, c) => b + '>=' + c)],
  ['= → <>', s => once(s, /(\]\s*)=(\s*")/, (a, b, c) => b + '<>' + c)],
  ['and→or', s => sub(s, /\band\b/g, 'or')],
  ['Skip 1→2', s => once(s, /Table\.Skip\(([^,()]+),\s*1\)/, (a, b) => 'Table.Skip(' + b + ', 2)')],
  ['başlık yükseltme yok', s => once(s, /Table\.PromoteHeaders\(([^,()]+)(,\s*\[[^\]]*\])?\)/, (a, b) => b)],
  ['List.Sum→List.Average', s => sub(s, /List\.Sum\b/g, 'List.Average')],
  ['List.Max→List.Min', s => sub(s, /List\.Max\b/g, 'List.Min')],
  ['ReplaceText→ReplaceValue', s => sub(s, /Replacer\.ReplaceText/g, 'Replacer.ReplaceValue')],
  ['Round ondalıksız', s => once(s, /Number\.Round\(([^,()]+(?:\([^()]*\))?),\s*\d+\)/, (a, b) => 'Number.Round(' + b + ')')],
  ['Month→MonthName', s => sub(s, /Date\.Month\(/g, 'Date.MonthName(')],
  ['Text.From sayı', s => once(s, /each \[([^\]]+)\] \* /, (a, b) => 'each Text.From([' + b + ']) & "" & ')],
  ['Order.Ascending→Descending', s => sub(s, /Order\.Ascending/g, 'Order.Descending')],
  ['RemoveColumns→SelectColumns', s => sub(s, /Table\.RemoveColumns\(/g, 'Table.SelectColumns(')],
  ['MissingField.Ignore', s => once(s, /Table\.(RemoveColumns|SelectColumns)\(([^()]+?\{[^{}]*\})\)/, (a, f, b) => 'Table.' + f + '(' + b + ', MissingField.Ignore)')],
  ['null karşılaştırma', s => once(s, /each \[([^\]]+)\] <> ""/, (a, b) => 'each [' + b + '] <> null')],
  ['Text.Contains büyük harf', s => once(s, /Text\.Contains\(([^,]+),\s*"([^"]+)"\)/, (a, b, c) => 'Text.Contains(' + b + ', "' + c.toLocaleUpperCase('tr') + '")')],
  ['Comparer.OrdinalIgnoreCase', s => once(s, /Text\.Contains\(([^,]+),\s*("[^"]+")\)/, (a, b, c) => 'Text.Contains(' + b + ', ' + c + ', Comparer.OrdinalIgnoreCase)')],
];
function variants(code) { const out = [], seen = new Set([code]); for (const [lab, f] of RULES) { let v = null; try { v = f(code); } catch (e) {} if (v && !seen.has(v)) { seen.add(v); out.push([lab, v]); } } return out; }
module.exports = { variants, RULES };
