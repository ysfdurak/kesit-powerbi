const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
 await p.goto('http://localhost:8765/index.html#model'); await p.waitForTimeout(800); await p.screenshot({ path: 'ux/model.png', fullPage: true });
 await p.click('[data-tbl="Talepler"]'); await p.waitForTimeout(300);
 const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('[data-act="data-zip"]')]); if (dl) await dl.saveAs('ux/data2.zip');
 console.log(errs); await b.close(); })();
