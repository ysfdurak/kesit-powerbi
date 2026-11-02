const { chromium } = require('playwright');
const EP='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const b = await chromium.launch({ executablePath: EP });
  const ctx=await b.newContext(); const p=await ctx.newPage(); await p.route(/fonts/, rt=>rt.abort());
  await p.goto('http://localhost:8765/index.html#dersler'); await p.waitForTimeout(1500);
  const cdp=await ctx.newCDPSession(p); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval',{interval:200}); await cdp.send('Profiler.start');
  await p.evaluate(()=>location.hash='#dashboard-rfm'); await p.waitForTimeout(2000);
  const {profile}=await cdp.send('Profiler.stop');
  const self={}; const dt=profile.timeDeltas; const idx={}; profile.nodes.forEach(n=>idx[n.id]=n);
  profile.samples.forEach((s,i)=>{ const n=idx[s]; const k=n.callFrame.functionName+' '+n.callFrame.url.split('/').pop()+':'+n.callFrame.lineNumber; self[k]=(self[k]||0)+(dt[i]||0); });
  Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([k,v])=>console.log((v/1000).toFixed(0)+'ms',k));
  await b.close();
})();
