const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
 for (const W of [1280, 390]) { const ctx = await b.newContext({ viewport: { width: W, height: 860 }, acceptDownloads: true }); const p = await ctx.newPage(); const e = [], ext = new Set();
 p.on('pageerror', x => e.push(x.message)); p.on('request', r => { const u = new URL(r.url()); if (u.host !== 'localhost:8793') ext.add(u.host); });
 await p.goto('http://localhost:8793/'); await p.waitForTimeout(1500);
 const fontOk = await p.evaluate(() => document.fonts.check('16px "Bricolage Grotesque"') && [...document.fonts].some(f => f.family.includes('Bricolage') && f.status === 'loaded'));
 console.log(W, 'title', await p.title(), '| welcome', !!(await p.$('.welcome')), '| font', fontOk, '| sw', await p.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())));
 await p.goto('http://localhost:8793/#hakkinda'); await p.waitForTimeout(700); console.log(' about', await p.$$eval('.about-card h3', x => x.map(y => y.textContent).join(', ')), '| name', (await p.textContent('main')).includes('Yusuf Durak'), '| local fonts note', (await p.textContent('main')).includes('kendi dosyalarından'));
 await p.click('[data-kdoor]').catch(() => {}); 
 await p.goto('http://localhost:8793/#ders-ilk-olcu'); await p.waitForTimeout(700); await p.click('.steps button[data-step="1"]'); await p.fill('#daxEditor', 'SUM(Satislar[Tutar])'); await p.click('[data-act="check"]'); await p.waitForTimeout(600); console.log(' ex', (await p.textContent('#out')).slice(0, 8));
 await p.goto('http://localhost:8793/#veriler-ilgaz-bank'); await p.waitForTimeout(800);
 if (W === 1280) { const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(() => null), p.click('[data-vddl]')]); console.log(' dl', dl && dl.suggestedFilename()); }
 await p.goto('http://localhost:8793/#dashboard'); await p.waitForTimeout(1500); console.log(' dash svgs', await p.$$eval('.dash-card svg', x => x.length), '| ov', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
 console.log(' external hosts', [...ext].join(',') || 'yok', '| errors', e); await ctx.close(); }
 await b.close(); })();
