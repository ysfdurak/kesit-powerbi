const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' });
const p = await (await b.newContext({ acceptDownloads: true })).newPage(); await p.route('**/*.zip', r => r.fulfill({ status: 404, body: '' }));
await p.goto('http://localhost:8765/index.html#veriler-kanat-havayollari'); await p.waitForTimeout(1000);
const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-vddl]')]); const f = await dl.path(); const a = fs.readFileSync(f), z = fs.readFileSync('/home/claude/pbi/veri/kanat-havayollari.zip'); console.log(dl.suggestedFilename(), a.length, z.length, a.equals(z)); await b.close(); })();
