global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: 6 }) }) }) };
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns', 'levels', 'viz', 'dashboards', 'dashcore', 'dash_up2']) require('/home/claude/pbi/' + f + '.js');
const lib = new Set(PBI_MEASURES.map(m => m.name).concat((PBI_PATTERNS||[]).map(p=>p.name)));
['operasyon','fiyat','stok','ekip','web','ik'].forEach(id => { const d = PBI_DASHES.find(x => x.id === id); const bad = new Set();
  PBI_DASHCORE.allTiles(d).forEach(t => (t.measures || []).forEach(m => { if (!lib.has(m)) bad.add(t.id + ':' + m); }));
  d.build.forEach(b => (b[2] || []).forEach(m => { if (!lib.has(m)) bad.add('build:' + m); }));
  const tips = PBI_DASHCORE.allTiles(d).filter(t => t.tip).length, dyn = PBI_DASHCORE.allTiles(d).filter(t => typeof t.title === 'function').length;
  console.log(id, 'group', d.group, 'tips', tips, 'dyn', dyn, 'build', d.build.length, 'pages', d.pages.map(p => p.id + '(' + p.tiles.length + ')' + (p.hidden ? 'H' : '')).join(' '), [...bad].join(', ') || 'OK'); });
