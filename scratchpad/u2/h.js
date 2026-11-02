global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: String(s).length * 6 }) }) }) };
const P = '/home/claude/pbi/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'levels', 'viz', 'dashboards', 'dashcore']) require(P + f + '.js');
const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr }); (PBI_PATTERNS || []).forEach(p => { if (!ms[p.name]) ms[p.name] = { name: p.name, expr: p.expr }; });
module.exports = (slicers, sl) => { const d = { id: 'x', slicers }; const st = PBI_DASHCORE.initState(d); Object.assign(st.sl, sl || {}); const a = PBI_DASHCORE.api(d, st, ms, null); a.V = PBIViz; return a; };
