global.window = global; require('/home/claude/pbi/menus.js');
const split = n => { const m = n.split(' → '); if (m.length > 1) { const pre = m[0]; return m.slice(1).join(' → ').split(' / ').map(x => pre + ' → ' + x); } return n.split(' / '); };
PBI_MENUS.forEach(g => g.tabs.forEach(t => { const b = [...new Set(t.cmds.flatMap(c => split(c[0])))]; console.log(g.grp.slice(0, 12), t.id, '|', b.join(' ¦ ')); }));
