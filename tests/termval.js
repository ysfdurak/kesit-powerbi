/* Ürün dili: görünür veri ve arayüz metinlerinde eski adlar kalmamalı. Kod yorumları, kimlikler ve adresler kapsam dışı. */
global.window = global; const P = (require('path').resolve(__dirname, '../app') + '/'); const fs = require('fs');
const files = fs.readFileSync(P + 'index.html', 'utf8').match(/src="[^"]+"/g).map(s => s.slice(5, -1));
const UI = /^(app|pq|practice|examui|arena|guides|career|sync|portfolio|vdata|pages)\.js$/;
for (const f of files) { if (UI.test(f)) continue; require(P + f); }
const BAN = [[/patika/gi, 'patika'], [/St[üu]dyo(?!\b.*DAX)/g, 'Stüdyo'], [/At[öo]lyesi/g, 'Atölye'], [/Laboratuvar/g, 'Laboratuvar'], [/\b[Yy]er [iİ]m(?=[ile])/g, 'yer imi'], [/Final [Pp]rojesi/g, 'Final Projesi'], [/A→C/g, 'A→C'], [/Dashboardlar/g, 'Dashboardlar'], [/Önemli [Ee]tkileyen/g, 'Önemli etkileyen'], [/Performans Analizcisi/g, 'Performans Analizcisi'], [/Sıfırdan (Uzmana|Profesyonele)/g, 'Sıfırdan Uzmana'], [/Seviye tespit/gi, 'Seviye tespit'], [/gerçek bir DAX motoru/gi, 'gerçek DAX motoru'], [/Yakında eklen/gi, 'yakında eklenecek'], [/\bORTA · ORTA\b/g, 'ORTA · ORTA'], [/DP-700/g, 'DP-700']];
const OK_DASH = /^.{0,5}Dashboard$|[Pp]ano|Real-Time|create dash|[iİ]ş dilinde|d\.dashboard|dashboard:|hash: 'dashboard|\/\/ Dashboard/;
let bad = 0; const fail = s => { bad++; console.log('SORUN ' + s); };
const seen = new WeakSet(); let nstr = 0;
function walk(o, path) { if (typeof o === 'string') { nstr++; check(o, path); return; } if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); if (o instanceof Date) return; if (Array.isArray(o)) { o.forEach((x, i) => walk(x, path + '[' + i + ']')); return; } for (const k of Object.keys(o)) { if (path === 'PBI_MODEL.tables') continue; walk(o[k], path + '.' + k); } }
function check(s, path) { for (const [re, name] of BAN) { re.lastIndex = 0; const m = re.exec(s); if (m) fail(path.slice(0, 60) + ': ' + name + ' → …' + s.slice(Math.max(0, m.index - 30), m.index + 40).replace(/\n/g, ' ')); }
  const d = /[Dd]ashboard/g; let m; while ((m = d.exec(s))) { const ctx = s.slice(Math.max(0, m.index - 45), m.index + 30); if (/dashboard-(tasarim|kavramlar)/.test(ctx)) continue; if (!OK_DASH.test(ctx)) fail(path.slice(0, 60) + ': dashboard → …' + ctx.replace(/\n/g, ' ')); } }
Object.keys(global).filter(k => /^(PBI_|KESIT_)/.test(k)).forEach(k => { const v = global[k]; if (typeof v === 'function' || k === 'PBI_DAX' || k === 'PBI_FINAL_') return; walk(v, k); });
/* Arayüz dosyaları: dize sabitleri */
for (const f of files.filter(x => UI.test(x)).concat(['build/body.html', 'build/head.html', 'build/readme.js'])) { let s = fs.readFileSync(P + f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/pbipatika\.\w+/g, '').replace(/\/\/[^\n']*/g, '').replace(/hash: 'patika\w*'/g, '').replace(/'patika\w*'/g, '').replace(/#patika\w*/g, '').replace(/St[üu]dyo(?=\s*---)/g, ''); check(s, f); }
console.log('metin ' + nstr + ' SORUN ' + bad);
