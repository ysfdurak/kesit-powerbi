const H=require('./h.js'); global.PBI_ORDER=[]; require('/home/claude/pbi/c13.js');
const dec = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const NEW=PBI_LESSONS.filter(l=>l.id.startsWith('vaka-'));
NEW.forEach(l=>{ console.log(l.id, 'len', l.body.replace(/<[^>]+>/g,'').length, 'ex', l.ex.map(e=>e.t).join(','));
  const re=/<pre class="dax">([\s\S]*?)<\/pre>/g; let m; while((m=re.exec(l.body))){ const s=dec(m[1]); if(/EVALUATE/.test(s)) console.log('  Q', H.run(s).slice(0,10).join(' ')); }
  l.ex.filter(e=>e.t==='dax').forEach(e=>console.log('  ', e.name, H.ev(e.sol)));
});
