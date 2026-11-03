global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep',...['c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','c24','c25','c26','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3'].filter(x=>require('fs').existsSync(P+x+'.js')),'pqdata','extra','tricks','tricks2']) require(P + f + '.js');
process.argv.slice(2).forEach(f => require(require('path').resolve(f)));
const X = PBI_DAX; const base = {}; PBI_MEASURES.forEach(m => base[m.name] = { name: m.name, expr: m.expr });
function splitDefs(src) {
  const lines = src.split('\n'); const out = []; let cur = null;
  lines.forEach(line => { const m = line.match(/^([^\s\-\/=()\[\]"'{},<>][^=()\[\]"{},<>]*?(?:\s\([^()=\[\]]*\))?)\s*:?=(?!=)\s*(.*)$/); if (m && !/^(VAR|RETURN)\b/i.test(m[1].trim())) { cur = { name: m[1].trim(), expr: m[2] }; out.push(cur); } else if (cur) cur.expr += '\n' + line; else { cur = { name: null, expr: line }; out.push(cur); } });
  return out.map(d => ({ name: d.name, expr: d.expr.replace(/^\s*\n/, '').replace(/\s+$/, '') })).filter(d => d.expr.trim() && !/^--/.test(d.expr.trim()));
}
const dec = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
let n = 0, bad = 0;
const run = (where, raw) => {
  const src = dec(raw).trim(); n++;
  try {
    if (/\bEVALUATE\b/i.test(src)) { X.runQuery(Object.assign({}, base), src); return; }
    const TABLE_FN = /^(CALENDAR|CALENDARAUTO|ADDCOLUMNS|SELECTCOLUMNS|SUMMARIZE|SUMMARIZECOLUMNS|DATATABLE|GENERATESERIES|FILTER|VALUES|DISTINCT|ALL|TOPN|UNION|CROSSJOIN|GENERATE|NATURALINNERJOIN|NATURALLEFTOUTERJOIN|TREATAS|EXCEPT|INTERSECT|ROW|GROUPBY|CALCULATETABLE)\s*\(|^\{/i;
    { const d = X.stripDef(src); if (TABLE_FN.test(d.expr.trim()) && splitDefs(src).length <= 1) { X.runQuery(Object.assign({}, base), 'EVALUATE\n' + d.expr.trim()); return; } }
    const ms = Object.assign({}, base); const defs = splitDefs(src);
    defs.slice(0, -1).forEach(d => { if (d.name) ms[d.name] = { name: d.name, expr: d.expr }; });
    const last = defs[defs.length - 1]; if (!last) return;
    if (last.name) ms[last.name] = { name: last.name, expr: last.expr };
    X.evalMeasure(ms, last.expr, []);
  } catch (e) { bad++; console.log('BAD', where, '|', e.message.slice(0, 110), '|', src.split('\n')[0].slice(0, 70)); }
};
PBI_LESSONS.forEach(l => { const re = /<pre class="dax"(?![^>]*data-notry)[^>]*>([\s\S]*?)<\/pre>/g; let m; while ((m = re.exec(l.body || ''))) run('ders ' + l.id, m[1]); });
PBI_TRICKS.forEach(t => { if (t.dax && !t.noTry) run('püf ' + t.id, t.dax); });
console.log('snippets', n, 'bad', bad);
