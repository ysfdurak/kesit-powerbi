require('./h.js'); global.PBI_ORDER = []; require('/home/claude/pbi/c15.js');
const dec = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const r4 = v => typeof v === 'number' ? Math.round(v * 10000) / 10000 : v;
PBI_LESSONS.forEach(l => { console.log('=== ', l.id, 'plain', l.body.replace(/<[^>]+>/g,'').length, 'ex', JSON.stringify(l.ex.reduce((a,e)=>(a[e.t]=(a[e.t]||0)+1,a),{})));
  const re = /<pre class="dax"(?![^>]*data-notry)[^>]*>([\s\S]*?)<\/pre>/g; let m;
  while ((m = re.exec(l.body))) { const src = dec(m[1]).trim();
    if (/EVALUATE/.test(src)) { const r = X.runQuery(Object.assign({}, ms), src); console.log('Q', src.split('\n').slice(-1)[0].slice(0,50)); r.rows.forEach(x => console.log('   ', x.map(r4).join(' | '))); }
    else { const d = X.stripDef(src); console.log('M', d.expr.slice(0,40), 'T=', r4(ev(d.expr)), q(d.expr,{t:'Kategoriler',c:'Kategori'}).join(' '), q(d.expr,{t:'Tarih',c:'Yil'}).join(' ')); } }
  l.ex.filter(e=>e.t==='query').forEach(e => { const r = X.runQuery(Object.assign({}, ms), e.sol); console.log('EXQ', JSON.stringify(r.rows.map(x=>x.map(r4)))); });
  l.ex.filter(e=>e.t==='dax').forEach(e => { const g = e.grid || [{t:'Kategoriler',c:'Kategori'},{t:'Tarih',c:'Yil'}]; console.log('EXD', e.name, 'T=', r4(ev(e.sol)), g.map(x=>q(e.sol,x).join(' ')).join(' || ')); });
});
