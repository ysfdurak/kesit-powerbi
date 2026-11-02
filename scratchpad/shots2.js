const { chromium } = require('playwright'); const OUT = '/home/claude/pbi/build/gh/ekran/';
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500); await p.screenshot({ path: OUT + 'karsilama.png' });
  await p.click('[data-kdoor="yeni"]'); await p.waitForTimeout(800); await p.click('.steps button[data-step="3"]'); await p.waitForTimeout(400);
  await p.fill('#daxEditor', 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] = "Mobil")'); await p.click('[data-act="check"]'); await p.waitForTimeout(900); await p.screenshot({ path: OUT + 'alistirma.png' });
  await p.evaluate(() => { location.hash = 'dashboard-finans'; }); await p.waitForTimeout(2000); const c = await p.$('.dash-card'); if (c) await c.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await p.screenshot({ path: OUT + 'rapor.png' });
  await p.evaluate(() => { location.hash = 'veriler-lezzet-kurye'; }); await p.waitForTimeout(1200); await p.screenshot({ path: OUT + 'veri-seti.png' });
  await b.close(); })();
