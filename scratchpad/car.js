const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 for (const [k, w, h] of [['d', 1360, 900], ['m', 390, 844]]) {
 const ctx = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = [];
 p.on('pageerror', e => errs.push(e.message));
 await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(600); await p.screenshot({ path: 'ux/' + k + '_c_home.png' });
 await p.click('#main [data-go="hedef"]'); await p.waitForTimeout(300); await p.screenshot({ path: 'ux/' + k + '_c_ob1.png', fullPage: true });
 await p.click('[data-ob-path="analist"]'); await p.click('[data-ob-next]'); await p.click('[data-ob-exp="sifir"]'); await p.click('[data-ob-next]'); await p.screenshot({ path: 'ux/' + k + '_c_ob3.png' }); await p.click('[data-ob-hours="5"]'); await p.click('[data-ob-next]'); await p.waitForTimeout(500);
 await p.screenshot({ path: 'ux/' + k + '_c_path.png', fullPage: true });
 await p.goto('http://localhost:8765/index.html#'); await p.waitForTimeout(500); await p.screenshot({ path: 'ux/' + k + '_c_home2.png', fullPage: false });
 if (k === 'd') { await p.goto('http://localhost:8765/index.html#model'); await p.waitForTimeout(500); const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('[data-act="data-zip"]')]); if (dl) { await dl.saveAs('ux/data.zip'); console.log('zip saved'); } else console.log('no download event'); }
 await p.goto('http://localhost:8765/index.html#projeler'); await p.waitForTimeout(400); await p.screenshot({ path: 'ux/' + k + '_c_proj.png' });
 console.log(k, 'errors', errs); await ctx.close(); }
 await b.close(); })();
