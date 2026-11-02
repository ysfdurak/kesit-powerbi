const { chromium } = require('playwright');
const EP='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const b = await chromium.launch({ executablePath: EP });
  for (const thr of [1,4]) for (const r of ['#dashboard-rfm','#dashboard-kokpit']) {
  const ctx=await b.newContext({viewport:{width:1366,height:900}}); const p=await ctx.newPage(); await p.route(/fonts/, rt=>rt.abort());
  await p.goto('http://localhost:8765/index.html'+r); await p.waitForTimeout(4000);
  const cdp=await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate',{rate:thr});
  const sel = await p.evaluate(()=>{ const bs=[...document.querySelectorAll('#main .dash button, #main [data-slc], #main [data-fv], #main .slicer button, #main .chip')].filter(b=>b.offsetParent); return bs.slice(0,40).map((b,i)=>{b.setAttribute('data-tt',i); return (b.className+'|'+Object.keys(b.dataset).join(',')+'|'+b.innerText.trim().slice(0,15))}); });
  console.log(r, 'candidates', sel.length, sel.slice(0,8).join(' ; '));
  for (const i of [2,3,5]) { if(i>=sel.length) break; const t=await p.evaluate(async i=>{ const b=document.querySelector('[data-tt="'+i+'"]'); if(!b) return -1; const t0=performance.now(); b.click(); await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0))); return Math.round(performance.now()-t0); }, i); console.log(`  thr${thr} click`, sel[i].slice(0,50), t,'ms'); }
  await ctx.close(); }
  await b.close();
})();
