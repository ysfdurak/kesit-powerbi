// usage: node try.js <dash> <page> [k=v state json] ; prints per-tile time and text
global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: String(s).length * 6 }) }) }) };
const P = '/home/claude/pbi/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'levels', 'viz', 'dashboards', 'dashcore'].concat(require('fs').readdirSync(P).filter(f => f === 'dash_up1.js').map(f => f.replace('.js', '')).sort())) require(P + f + '.js');
const DC = PBI_DASHCORE; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr }); (PBI_PATTERNS || []).forEach(p => { if (!ms[p.name]) ms[p.name] = { name: p.name, expr: p.expr }; });
const [id, page, extra] = process.argv.slice(2); const d = PBI_DASHES.find(x => x.id === id); const st = DC.initState(d); if (page) st.page = page; if (extra) Object.assign(st, JSON.parse(extra));
const full = process.env.FULL;
DC.tilesOf(d, st).forEach(t => { const t0 = Date.now(); const r = DC.renderTile(d, t, st, ms, 900); const txt = (r.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); console.log('['+t.id+']', (Date.now() - t0) + 'ms', r.title || '', '|', full ? txt : txt.slice(0, 220), r.err ? 'ERR ' + r.err.message : ''); });
