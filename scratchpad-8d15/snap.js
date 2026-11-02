const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const [w,h,v,out,dark] = [+process.argv[2], +process.argv[3], process.argv[4], process.argv[5], process.argv[6]==='dark'];
 const p = await (await b.newContext({ viewport: { width: w, height: h }, colorScheme: dark?'dark':'light' })).newPage();
 await p.goto('http://localhost:8765/index.html?r='+Math.random()+'#' + v); await p.waitForTimeout(1500); await p.screenshot({ path: out }); await b.close(); })();
