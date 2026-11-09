/* Öğrenme yolları: ders kimlikleri, aşamalar, ön koşul sırası, PL-300 maddeleri, DP-600 payı, kapsam haritası, belge şartı */
global.window = global; const P = (require('path').resolve(__dirname, '../app') + '/'); const fs = require('fs');
const files = fs.readFileSync(P + 'index.html', 'utf8').match(/src="[^"]+"/g).map(s => s.slice(5, -1));
for (const f of files) { if (/^(app|pq|practice|examui|arena|guides|career|sync|portfolio|vdata|pages)\.js$/.test(f)) continue; require(P + f); }
let bad = 0; const fail = s => { bad++; console.log('SORUN ' + s); };
const L = {}; PBI_LESSONS.forEach(l => { if (L[l.id]) fail('tekrar ders ' + l.id); L[l.id] = l; });
const O = PBI_ORDER; PBI_LESSONS.forEach(l => { if (!O.includes(l.id)) fail('sırada yok ' + l.id); }); O.forEach(id => { if (!L[id]) fail('sırada var, derste yok ' + id); }); if (new Set(O).size !== O.length) fail('sırada tekrar');
const est = l => (l.min || 10) + (l.ex || []).length * 3;
const before = (p, a, b) => { const i = p.lessons.indexOf(a), j = p.lessons.indexOf(b); if (i >= 0 && j >= 0 && i > j) fail(p.id + ': ' + a + ' önce olmalı, ' + b + ' sonra'); };
for (const p of PBI_PATHS) {
  const r = PBI_ROLES[p.id] || {}; const seen = new Set();
  p.lessons.forEach(id => { if (!L[id]) fail(p.id + ' bilinmeyen ' + id); if (seen.has(id)) fail(p.id + ' tekrar ' + id); seen.add(id); if ((PBI_OPTIONAL || []).includes(id)) fail(p.id + ' isteğe bağlı ders zorunlu ' + id); });
  (r.ms || []).forEach(m => { if (!p.lessons.includes(m.to)) fail(p.id + ' aşama sonu yolda yok: ' + m.t + ' ' + m.to); });
  (r.ready || []).forEach(x => (x.lessons || []).forEach(id => { if (!p.lessons.includes(id)) fail(p.id + ' hazırlık maddesi yolda olmayan ders: ' + id); }));
  [['baglam', 'calculate'], ['calculate', 'zaman'], ['filter-all', 'siralama'], ['dax-giris', 'tarih-tablosu'], ['model-temel', 'dax-giris'], ['var-mantik', 'zaman'], ['baglam-gecisi', 'musteri-analitigi'], ['pl300', 'final-hazirlik'], ['portfoy-kariyer', 'final-hazirlik']].forEach(([a, b]) => before(p, a, b));
  if (/\b(dashboard|patika)\b/i.test(JSON.stringify([p.name, p.desc, p.long, r.title, r.who, r.long]))) fail(p.id + ' metninde eski terim');
}
const gp = id => PBI_PATHS.find(p => p.id === id);
['yari-toplanabilir', 'hizli-olcu', 'hesaplama-gruplari', 'istatistik', 'eda', 'tema-sayfa', 'sayfalandirilmis', 'pencere'].forEach(id => { if (!gp('pl300').lessons.includes(id)) fail('PL-300 eksik ' + id); });
['yayinlama', 'guvenlik', 'baglam-gecisi'].forEach(id => { if (!gp('analist').lessons.includes(id)) fail('analist eksik ' + id); });
['bicim-temel', 'etkilesim', 'hikaye', 'sayfalandirilmis'].forEach(id => { if (!gp('gelistirici').lessons.includes(id)) fail('geliştirici eksik ' + id); });
['baglam', 'filter-all', 'tarih-tablosu'].forEach(id => { if (!gp('yonetici').lessons.includes(id)) fail('excel eksik ' + id); });
if (!gp('hizli').lessons.includes('tarih-tablosu')) fail('bir günde: tarih tablosu yok'); if (!new RegExp('^' + gp('hizli').lessons.length + ' derste').test(gp('hizli').desc)) fail('bir günde sayısı');
if (!PBI_ROLES.dp600.prereq) fail('DP-600 ön koşul yok'); PBI_ROLES.dp600.prereq.lessons.forEach(id => { if (!L[id]) fail('ön koşul ' + id); });
const dp = gp('dp600').lessons, tot = dp.reduce((a, id) => a + est(L[id]), 0), DATA = ['fabric-giris', 'fabric-onelake', 'fabric-lakehouse', 'fabric-data-factory', 'fabric-pipeline', 'gateway', 'veri-baglantilari', 'veri-akislari', 'fabric-veri-alma', 'pq-orta', 'sql-analist', 'fabric-hazirlama', 'fabric-tsql-odev', 'fabric-spark-odev', 'fabric-yildiz', 'kql-gercek-zaman', 'dax-sorgu'], dat = DATA.reduce((a, id) => a + est(L[id]), 0);
console.log('DP-600 veri hazırlama payı %' + Math.round(dat / tot * 100) + ' (' + dat + '/' + tot + ' dk)');
if (dat / tot < 0.4) fail('DP-600 veri hazırlama payı düşük');
const domains = PBI_CERT_INFO.dp600.domains;
const expectedWeights = [[10,15], [40,45], [20,25], [20,25]];
if (JSON.stringify(domains.map(d => d.slice(2))) !== JSON.stringify(expectedWeights)) fail('DP-600 sınav ağırlıkları');
const role = PBI_ROLES.dp600;
domains.forEach(([title, , lo, hi]) => {
  const weight = '%' + lo + '–' + hi;
  if (!role.ms.some(m => m.t === title && m.d.includes(weight))) fail('DP-600 aşaması: ' + title);
  if (!role.ready.some(r => r.t === title && r.d === weight && r.lessons.length)) fail('DP-600 hazırlık maddesi: ' + title);
  if (!PBI_CERT_SKILLS.dp600.some(s => s.d === title && !s.extra)) fail('DP-600 kapsam alanı: ' + title);
});
if (PBI_CERT_SKILLS.dp600.some(s => !domains.some(d => d[0] === s.d))) fail('DP-600 eşleşmeyen kapsam alanı');
const SK = PBI_SKILL_LESSON || {}; const ids = Object.keys(SK);
ids.forEach(k => { const pth = k.startsWith('pl') ? gp('pl300') : gp('dp600'); SK[k].forEach(id => { if (!L[id]) fail('kapsam ' + k + ' ' + id); else if (k.startsWith('pl') && !pth.lessons.includes(id)) fail('PL-300 maddesi yolda olmayan derse bağlı: ' + k + ' ' + id); }); });
const src = fs.readFileSync(P + 'certskills.js', 'utf8'); (src.match(/\['((?:pl|dp)-\w+)',/g) || []).map(x => x.slice(2, -2)).forEach(k => { if (!SK[k]) fail('kapsam haritasında ders yok: ' + k); });
console.log('yol ' + PBI_PATHS.length + ' ders ' + PBI_LESSONS.length + ' ' + PBI_PATHS.map(p => p.id + ':' + p.lessons.length).join(' '));
console.log('SORUN ' + bad);
if (bad) process.exitCode = 1;
