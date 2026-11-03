global.window = global;
const P = '/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep',...['c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','c24','c25','c26','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3'].filter(x=>require('fs').existsSync(P+x+'.js')),'pqdata','extra','menus','tricks','final','formatpane','dashboards']) require(P + f + '.js');
const fs = require('fs');
const L = PBI_LESSONS, LM = {}; const out = [];
const add = (cat, msg) => out.push(cat + ' | ' + msg);
const lvOf = l => (PBI_LEVEL_OF || {})[l.id] || l.lv;
L.forEach(l => { if (LM[l.id]) add('ID', 'tekrar ders id ' + l.id); LM[l.id] = l; });
// sıra
PBI_ORDER.forEach(id => { if (!LM[id]) add('ORDER', 'sırada olup derste olmayan ' + id); });
L.forEach(l => { if (!PBI_ORDER.includes(l.id)) add('ORDER', 'sırada olmayan ders ' + l.id); });
// seviye sırası: ORDER içinde seviyeler monoton mu
const LV = ['A1','A2','B1','B2','C1','C2']; let prev = 0;
PBI_ORDER.forEach(id => { const l = LM[id]; if (!l) return; const i = LV.indexOf(lvOf(l)); if (i < prev) add('ORDER', 'seviye geri gidiyor: ' + id + ' ' + lvOf(l)); prev = Math.max(prev, i); });
// patikalar
PBI_PATHS.forEach(p => { p.lessons.forEach(id => { if (!LM[id]) add('PATH', p.id + ' bilinmeyen ders ' + id); }); const dup = p.lessons.filter((x, i) => p.lessons.indexOf(x) !== i); if (dup.length) add('PATH', p.id + ' tekrar: ' + dup);
  const idx = p.lessons.map(id => PBI_ORDER.indexOf(id)); for (let i = 1; i < idx.length; i++) if (idx[i] < idx[i - 1]) add('PATH', p.id + ' sıra dışı: ' + p.lessons[i - 1] + ' → ' + p.lessons[i]); });
// dersler
const perLv = {};
L.forEach(l => {
  const lv = lvOf(l); perLv[lv] = perLv[lv] || { n: 0, mc: 0, dax: 0, q: 0, min: 0 }; const s = perLv[lv]; s.n++; s.min += l.min || 0;
  const ex = l.ex || [];
  ex.forEach((e, i) => {
    if (e.t === 'mc') { s.mc++;
      if (!(e.a >= 0 && e.a < e.o.length)) add('MC', l.id + '#' + i + ' cevap indeksi geçersiz');
      if (!e.why) add('MC', l.id + '#' + i + ' açıklama (why) yok');
      if (new Set(e.o).size !== e.o.length) add('MC', l.id + '#' + i + ' tekrar eden seçenek');
    } else { e.t === 'query' ? s.q++ : s.dax++; if (!e.hint) add('DAX', l.id + '#' + i + ' ipucu yok'); }
  });
  if (!ex.length) add('EX', l.id + ' (' + lv + ') hiç alıştırma yok');
  else if (ex.length < 3) add('EX', l.id + ' (' + lv + ') yalnızca ' + ex.length + ' alıştırma');
  if (['B1','B2','C1','C2'].includes(lv) && /dax|calculate|zaman|bağlam|olcu|ölçü|tablo|pencere|sira|filter|hiyerarsi|istatistik|segment|musteri|kalip|rol|yari/i.test(l.id + l.title) && !ex.some(e => e.t !== 'mc')) add('EX', l.id + ' DAX konusu ama canlı DAX alıştırması yok');
  if (!l.sum) add('META', l.id + ' özet yok'); if (!l.min) add('META', l.id + ' süre yok');
  // gövde bağlantıları
  const body = l.body || '';
  (body.match(/data-lesson="([^"]+)"/g) || []).forEach(m => { const id = m.slice(13, -1); if (!LM[id]) add('LINK', l.id + ' kırık ders bağlantısı ' + id); });
  (body.match(/data-go="([^"]+)"/g) || []).forEach(m => { const v = m.slice(9, -1); if (!['home','paths','curr','test','studio','lab','dash','final','menus','visuals','tricks','formulas','model','dict'].includes(v)) add('LINK', l.id + ' bilinmeyen sayfa ' + v); });
  // gövde içinde açılıp kapanmayan etiketler
  for (const tg of ['ul','ol','table','div','pre','b','code','p']) { const o = (body.match(new RegExp('<' + tg + '[ >]', 'g')) || []).length, c = (body.match(new RegExp('</' + tg + '>', 'g')) || []).length; if (o !== c) add('HTML', l.id + ' <' + tg + '> açılış ' + o + ' / kapanış ' + c); }
  // eski seviye adları metinde
  if (/\b(Temel|Orta|İleri) seviye/.test(body)) add('TEXT', l.id + ' eski 3 seviyeli dil: ' + body.match(/\b(Temel|Orta|İleri) seviye[^.<]{0,40}/)[0]);
  if (!body.match(/<h2>/)) add('META', l.id + ' gövdede başlık yok');
  if (body.length < 1500) add('THIN', l.id + ' (' + lv + ') gövde kısa: ' + body.length + ' karakter');
});
// MC cevap konumu dağılımı
const pos = [0,0,0,0,0]; L.flatMap(l => l.ex || []).filter(e => e.t === 'mc').forEach(e => pos[e.a]++); add('STAT', 'MC doğru cevap konumu dağılımı (A,B,C,D): ' + pos.slice(0,4).join(', '));
const ppos = [0,0,0,0]; PBI_PLACEMENT.forEach(q => ppos[q.a]++); add('STAT', 'Seviye testi doğru cevap konumu: ' + ppos.join(', '));
const plv = {}; PBI_PLACEMENT.forEach(q => plv[q.lv] = (plv[q.lv] || 0) + 1); add('STAT', 'Seviye testi soru/seviye: ' + JSON.stringify(plv));
Object.entries(perLv).forEach(([k, s]) => add('STAT', k + ': ' + s.n + ' ders, ' + s.mc + ' MC, ' + s.dax + ' DAX, ' + s.q + ' sorgu, ' + s.min + ' dk'));
// menüler ve püfler ders referansları
PBI_MENUS.forEach(g => g.tabs.forEach(t => t.cmds.forEach(c => { if (c[3] && !LM[c[3]]) add('LINK', 'menü ' + t.id + ' / ' + c[0] + ' → bilinmeyen ders ' + c[3]); })));
PBI_TRICKS.forEach(t => { (t.lessons || (t.lesson ? [t.lesson] : [])).forEach(id => { if (!LM[id]) add('LINK', 'püf ' + t.id + ' → bilinmeyen ders ' + id); }); });
PBI_PATTERNS.forEach(p => { if (p.lesson && !LM[p.lesson]) add('LINK', 'kalıp ' + p.id + ' → ders ' + p.lesson); });
// menü komutu kapsama
let tot = 0, unc = 0; PBI_MENUS.forEach(g => g.tabs.forEach(t => t.cmds.forEach((c, i) => { tot++; if (!PBI_FINAL.stageOf(t.id, i)) { unc++; add('FINAL', 'finalde kullanılmayan komut: ' + t.name + ' / ' + c[0]); } })));
add('STAT', 'menü komutu ' + tot + ', finalde olmayan ' + unc);
// sözlük
const gl = PBI_GLOSSARY.map(g => g[0].toLowerCase()); gl.forEach((g, i) => { if (gl.indexOf(g) !== i) add('DICT', 'tekrar terim ' + g); });
add('STAT', 'sözlük ' + gl.length + ', katalog ' + PBI_CATALOG.length + ', görsel ' + PBI_VISUALS.length + ', püf ' + PBI_TRICKS.length + ', kalıp ' + PBI_PATTERNS.length + ', dashboard ' + PBI_DASHES.length);
const cat = PBI_CATALOG.map(c => c[0]); cat.forEach((c, i) => { if (cat.indexOf(c) !== i) add('DICT', 'tekrar katalog ' + c); });
// sayı iddiaları
const src = ['app.js','pages.js','extra.js','final.js','levels.js'].map(f => fs.readFileSync(P + f, 'utf8')).join('\n');
(src.match(/\b\d{2,3} (ders|alıştırma|soru|terim|fonksiyon|görsel|dashboard|püf|kalıp|komut)/g) || []).forEach(m => add('CLAIM', m));
console.log(out.sort().join('\n'));
