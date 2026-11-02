const { chromium } = require('playwright');
const fs=require('fs'); const AXE=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
const EP='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const U='http://localhost:8765/index.html';
const R=['','#ders-tarih','#studyo','#dashboard-rfm','#dashboard-kokpit','#sinavlar','#arena','#formuller','#model','#profil','#hedef','#pq'];
(async () => {
  const b = await chromium.launch({ executablePath: EP });
  const agg={};
  for (const scheme of ['light','dark']) {
    const ctx=await b.newContext({colorScheme:scheme, viewport:{width:1366,height:900}}); const p=await ctx.newPage(); await p.route(/fonts\.(googleapis|gstatic)/, rt=>rt.abort());
    await p.goto(U); await p.waitForTimeout(700);
    if (scheme==='light') console.log('html lang=',await p.evaluate(()=>document.documentElement.lang), 'doctype=',await p.evaluate(()=>!!document.doctype), 'compatMode', await p.evaluate(()=>document.compatMode),'viewport meta', await p.evaluate(()=>!!document.querySelector('meta[name=viewport]')), 'h1 count home', await p.evaluate(()=>document.querySelectorAll('h1').length));
    for (const r of R) {
      await p.evaluate(h=>location.hash=h,r); await p.waitForTimeout(r.includes('dash')?1200:400);
      await p.addScriptTag({content:AXE});
      const res=await p.evaluate(async()=> (await axe.run(document,{resultTypes:['violations']})).violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length, ex:v.nodes.slice(0,2).map(n=>n.target.join(' ')+' :: '+(n.any[0]||n.all[0]||n.none[0]||{}).message).join(' || ')})));
      for (const v of res){ const k=scheme+' '+v.id; agg[k]=agg[k]||{impact:v.impact,n:0,routes:[],ex:v.ex}; agg[k].n+=v.n; agg[k].routes.push(r||'home'); }
      const hs = await p.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>+h.tagName[1]));
      let skips=0; for(let i=1;i<hs.length;i++) if(hs[i]-hs[i-1]>1) skips++;
      if(scheme==='light') console.log('headings',r||'home','h1s',hs.filter(x=>x===1).length,'skips',skips, 'first', hs.slice(0,6).join(''), 'svg w/o role/label', await p.evaluate(()=>[...document.querySelectorAll('#main svg')].filter(s=>!s.closest('[aria-hidden=true]') && s.getAttribute('aria-hidden')!=='true' && !s.getAttribute('role') && !s.getAttribute('aria-label') && !s.querySelector('title')).length), 'title', await p.evaluate(()=>document.title));
    }
    await ctx.close();
  }
  for (const [k,v] of Object.entries(agg)) console.log('AXE',k,v.impact,'nodes',v.n,'routes',v.routes.length, '\n   ', v.ex.slice(0,300));
  await b.close();
})();
