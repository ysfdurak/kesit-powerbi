const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 const p = await (await b.newContext({ viewport: { width: 1360, height: 1000 } })).newPage(); const errs = [];
 p.on('pageerror', e => errs.push(e.message));
 for (const h of ['', 'dersler', 'patikalar', 'test', 'profil', 'alistirma', 'lab', 'sinavlar', 'tekrar']) { await p.goto('http://localhost:8765/index.html?r=' + Math.random() + '#' + h); await p.waitForTimeout(600);
   const t = await p.evaluate(() => document.getElementById('main').innerText); const bad = t.match(/.{0,40}\b[ABC][12]\b.{0,40}/g); console.log(h || 'home', t.length, bad ? bad.slice(0, 4) : ''); if (h === '') await p.screenshot({ path: 'lv_home.png', fullPage: false }); if (h === 'dersler') await p.screenshot({ path: 'lv_curr.png' }); }
 // seviye testini bitir: hep doğru
 await p.goto('http://localhost:8765/index.html?r=2#test'); await p.waitForTimeout(400);
 for (let i = 0; i < 40; i++) { const q = await p.evaluate(() => { const C = window.PBI_PLACEMENT; return C.length; }); const btn = await p.$('[data-tq="-1"]'); if (!btn) break; await btn.click(); await p.waitForTimeout(60); }
 console.log('test sonuç:', (await p.evaluate(() => document.getElementById('main').innerText)).slice(0, 300));
 console.log('errors', errs); await b.close(); })();
