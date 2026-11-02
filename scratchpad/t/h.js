global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: String(s).length * 6 }) }) }) };
const P = '/home/claude/pbi/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'levels', 'viz', 'dashboards', 'dashcore']) require(P + f + '.js');
const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr }); (PBI_PATTERNS || []).forEach(p => { if (!ms[p.name]) ms[p.name] = { name: p.name, expr: p.expr }; });
const DC = PBI_DASHCORE;
const dash = { id: 'x', slicers: ['yil'], pages: [{ id: 'p', tiles: [] }] };
const st = DC.initState(dash);
const a = DC.api(dash, st, ms, null);
module.exports = { a, M: PBI_MODEL, st, dash, DC, ms };
