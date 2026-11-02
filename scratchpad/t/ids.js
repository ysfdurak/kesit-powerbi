const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const p = await b.newPage();
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1000);
  const r = await p.evaluate(() => ({ dashes: (window.PBI_DASHES||[]).map ? (window.PBI_DASHES).map(d=>d.id) : Object.keys(window.PBI_DASHES||{}), lessons: window.PBI_CORE.LESSONS.slice(0,3).map(l=>l.id), nL: window.PBI_CORE.LESSONS.length, paths: window.PBI_CORE.PATHS.map(p=>p.id), globals: Object.keys(window).filter(k=>!(k in Object.getPrototypeOf(window)) ).length, gl: Object.keys(window).filter(k=>/^[a-zA-Z_$]/.test(k)).slice(-120).join(' ') }));
  console.log(JSON.stringify(r,null,0));
  await b.close();
})();
