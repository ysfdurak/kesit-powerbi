const { chromium } = require('playwright');
const EP='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const routes=['', '#ders-tarih', '#studyo', '#dashboard-rfm', '#dashboard-kokpit'];
(async () => {
  const b = await chromium.launch({ executablePath: EP });
  for (const thr of [1,4]) for (const r of routes) {
    const ctx = await b.newContext({viewport:{width:1366,height:850}}); const p = await ctx.newPage();
    await p.route(/fonts\.(googleapis|gstatic)/, rt => rt.abort());
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:thr});
    await cdp.send('Performance.enable');
    let bytes=0, reqs=0; p.on('requestfinished', async rq => { reqs++; try{ const s=await rq.sizes(); bytes+=s.responseBodySize+s.responseHeadersSize;}catch(e){} });
    await p.addInitScript(() => { window.__lt=[]; new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(e.duration))).observe({type:'longtask',buffered:true}); });
    const t0=Date.now();
    await p.goto('http://localhost:8765/index.html'+r, {waitUntil:'load'});
    const tl=Date.now()-t0;
    await p.waitForFunction(()=>document.querySelector('#main') && document.querySelector('#main').children.length>0);
    const tm=Date.now()-t0;
    await p.waitForTimeout(1500);
    const m = await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0]; const fcp=(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime; return {dcl:Math.round(n.domContentLoadedEventEnd), load:Math.round(n.loadEventEnd), fcp:Math.round(fcp||0), lt:window.__lt.length, ltMax:Math.round(Math.max(0,...window.__lt)), ltSum:Math.round(window.__lt.reduce((a,b)=>a+b,0)), heap: Math.round(performance.memory.usedJSHeapSize/1e6), dom: document.getElementsByTagName('*').length, svg: document.querySelectorAll('svg').length}});
    console.log(`thr${thr} ${r||'home'} reqs=${reqs} KB=${Math.round(bytes/1024)} fcp=${m.fcp} dcl=${m.dcl} load=${m.load} mainRendered=${tm} longtasks=${m.lt} max=${m.ltMax} sum=${m.ltSum} heapMB=${m.heap} dom=${m.dom} svg=${m.svg}`);
    await ctx.close();
  }
  await b.close();
})();
