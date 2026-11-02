const { chromium } = require('playwright');
const EP='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const R=['','#dersler','#studyo','#dashboard-rfm','#dashboard-kokpit','#formuller','#sinavlar','#arena','#model','#pq','#kariyer','#dashboard-hikaye'];
(async () => {
  const b = await chromium.launch({ executablePath: EP, args:['--js-flags=--expose-gc'] });
  const p=await b.newPage(); await p.route(/fonts/, rt=>rt.abort());
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
  for (let round=0; round<4; round++){ for(const r of R){ await p.evaluate(h=>location.hash=h,r); await p.waitForTimeout(250);} await p.evaluate(()=>{gc(); gc();}); console.log('round',round,'heapMB',(await p.evaluate(()=>performance.memory.usedJSHeapSize/1e6)).toFixed(1), 'listeners on doc?', await p.evaluate(()=>document.querySelectorAll('.toast').length)); }
  await b.close();
})();
