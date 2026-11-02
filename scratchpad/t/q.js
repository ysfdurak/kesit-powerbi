global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: String(s).length * 6 }) }) }) };
const P = '/home/claude/pbi/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'levels', 'viz', 'dashboards', 'dashcore']) require(P + f + '.js');
const DC = PBI_DASHCORE; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr }); (PBI_PATTERNS || []).forEach(p => { if (!ms[p.name]) ms[p.name] = { name: p.name, expr: p.expr }; });
const d = PBI_DASHES.find(x => x.id === (process.env.D || 'ozet')); const st = DC.initState(d);
const a = DC.api(d, st, ms, null); a.V = DC.wrapV(900);
global.a = a; eval(require('fs').readFileSync(0, 'utf8'));
