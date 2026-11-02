global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: String(s).length * 6 }) }) }) };
const P = '/home/claude/pbi/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'levels', 'viz', 'dashboards', 'dashcore', 'dash_new1']) require(P + f + '.js');
const DC = PBI_DASHCORE; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr }); (PBI_PATTERNS || []).forEach(p => { if (!ms[p.name]) ms[p.name] = { name: p.name, expr: p.expr }; });
const [id, page, extra] = process.argv.slice(2); const d = PBI_DASHES.find(x => x.id === id); const st = DC.initState(d); st.page = page; if (extra) Object.assign(st, JSON.parse(extra));
DC.tilesOf(d, st).forEach(t => { const r = DC.renderTile(d, t, st, ms, 900); const tips = []; (r.html||'').replace(/data-tip="([^"]*)"/g, (m, j) => { tips.push(j); return ''; });
  console.log('##', t.id, '|', r.title || '', '\n  ', (r.html || '').replace(/data-tip="[^"]*"/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 600)); if (process.env.TIPS && tips[0]) console.log('  TIP:', tips[0].replace(/&quot;/g,'"').slice(0, 500)); });
