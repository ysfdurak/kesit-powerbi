const { chromium } = require('playwright');
const EP='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
(async () => {
  const b = await chromium.launch({ executablePath: EP });
  for (const [n,c] of [['Fast4G',{latency:60,downloadThroughput:9e6/8,uploadThroughput:1.5e6/8}],['Slow4G',{latency:150,downloadThroughput:1.6e6/8,uploadThroughput:750e3/8}]]) {
  const ctx=await b.newContext(); const p=await ctx.newPage(); await p.route(/fonts/, rt=>rt.abort());
  const cdp=await ctx.newCDPSession(p); await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions',{offline:false,...c}); await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const t0=Date.now(); await p.goto('http://localhost:8765/index.html',{timeout:120000}); await p.waitForFunction(()=>document.querySelector('#main').children.length>0,{timeout:120000});
  const fcp=await p.evaluate(()=>Math.round((performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime||0));
  console.log(n,'(uncompressed local server, 4x CPU) main rendered ms', Date.now()-t0, 'fcp', fcp); await ctx.close(); }
  await b.close();
})();
