global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: String(s).length * 6 }) }) }) };
const P = '/home/claude/pbi/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'levels', 'viz', 'dashboards', 'dashcore', 'dash_up2']) require(P + f + '.js');
const DC = PBI_DASHCORE; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr }); (PBI_PATTERNS || []).forEach(p => { if (!ms[p.name]) ms[p.name] = { name: p.name, expr: p.expr }; });
const [id, pid] = process.argv.slice(2); const d = PBI_DASHES.find(x => x.id === id); const st = DC.initState(d); st.page = pid;
DC.tilesOf(d, st).forEach(t => { const t0 = Date.now(); DC.renderTile(d, t, st, ms, 900); console.log(t.id, Date.now() - t0); });
const a = DC.api(d, st, ms, null); const ex={ 'Ziyaretçi (Adım 1)': 'CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 1)', 'Satın Alan Ziyaretçi':ms['Satın Alan Ziyaretçi'].expr};
console.log('hedef', a.M('[Hedef]'), a.M('[Net Satış]'), a.M('[Satış GY]'));
