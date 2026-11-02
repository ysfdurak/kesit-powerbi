global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const r3 = v => typeof v==='number'?Math.round(v*10000)/10000:v;
const q = (e, g) => X.query({ rows: [g], measures: ms, values: [e], totals: false, keepBlank:true }).rows.map(r => r.keys[0] + '=' + r3(r.vals[0])).join(' ; ');
console.log(q('[YoY %]', {t:'Tarih',c:'YilAy'}));
const ok2 = 'VAR B = [YoY %]\nRETURN IF(ISBLANK(B), BLANK(), IF(B >= 0, UNICHAR(9650), UNICHAR(9660)) & " " & FORMAT(ABS(B), "0.0%"))';
console.log(q(ok2, {t:'Tarih',c:'YilAy'}));
console.log(q('[MoM %]', {t:'Tarih',c:'YilAy'}));
