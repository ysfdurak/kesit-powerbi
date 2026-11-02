global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13'].forEach(f => { try { require(P + f + '.js'); } catch (e) { console.log('skip', f, e.message.slice(0,60)); } });
require(P + 'c16.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const dec = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const r3 = v => typeof v === 'number' ? Math.round(v*10000)/10000 : v instanceof Date ? v.toISOString().slice(0,10) : v;
const ids = ['vaka-kiyaslama','vaka-pazar','vaka-tedarik','vaka-kredi'];
console.log(ids.map(id => id + '@' + PBI_ORDER.indexOf(id) + ' after ' + PBI_ORDER[PBI_ORDER.indexOf(id)-1]).join('\n'));
for (const id of ids) { const l = PBI_LESSONS.find(x => x.id === id);
  console.log('==', id, 'plain', l.body.replace(/<[^>]+>/g,'').length, 'ex', l.ex.length, JSON.stringify(l.ex.reduce((a,e)=>(a[e.t]=(a[e.t]||0)+1,a),{})));
  const re = /<pre class="dax"(?![^>]*data-notry)[^>]*>([\s\S]*?)<\/pre>/g; let m;
  while ((m = re.exec(l.body))) { const src = dec(m[1]).trim(); if (/\bEVALUATE\b/.test(src)) { const r = X.runQuery(Object.assign({}, ms), src); console.log('-- Q', src.split('\n').slice(-3)[0].slice(0,60)); r.rows.slice(0,16).forEach(row => console.log('   ', row.map(r3).join(' | '))); } }
}
