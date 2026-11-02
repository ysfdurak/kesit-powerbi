const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const p = await (await b.newContext({ viewport: { width: 400, height: 900 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
global.window = global; ['data','data2','dax','measures','confused','confused2'].forEach(f => require('/home/claude/pbi/' + f + '.js'));
const ids = PBI_CONFUSED.slice(25).map(c => c.id), mids = PBI_MISTAKES.slice(28).map(c => c.id); let bad = [];
for (const [v, list] of [['karistirilanlar', ids], ['hatalar', mids]]) {
  await p.goto('http://localhost:8765/index.html#' + v); await p.waitForTimeout(700); const h = await p.evaluate(() => location.hash); console.log(v, h, (await p.textContent('main h1')));
  for (const id of list) { await p.goto('http://localhost:8765/index.html#' + h.slice(1) + '-' + id); await p.waitForTimeout(350);
    const r = await p.evaluate(() => { const m = document.getElementById('main'); return { t: (m.querySelector('h1') || {}).textContent || '', err: m.querySelectorAll('.msg.err').length, nan: /\bNaN\b|undefined/.test(m.innerText), ov: document.documentElement.scrollWidth - innerWidth }; });
    if (r.err || r.nan || r.ov > 1 || !r.t) bad.push(id + ' ' + JSON.stringify(r)); }
}
console.log('bad', bad, 'errs', errs); await b.close(); })();
