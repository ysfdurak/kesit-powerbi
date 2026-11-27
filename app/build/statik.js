/* Statik ders sayfaları: node build/statik.js <çıktı klasörü>  →  <çıktı>/ders/<id>/index.html ve ders/index.html, sitemap.xml'e ders adresleri.
   Arama motorları ve JavaScript'siz okuyucu için dersin okuma sürümü; alıştırmalar uygulamada çözülür.
   Biçim, main dalındaki elle üretilmiş ilk sürümle aynıdır (ders/statik.css main'de durur). */
const fs = require('fs'), path = require('path');
global.window = global; global.document = { addEventListener() {}, querySelector() { return null; } };
const APP = path.join(__dirname, '..');
const files = fs.readFileSync(path.join(__dirname, 'build.sh'), 'utf8').match(/for f in ([^;]+);/)[1].trim().split(/\s+/);
for (const f of files) { try { require(path.join(APP, f + '.js')); } catch (e) { /* tarayıcıya özgü modüller */ } }
const OUT = path.resolve(process.argv[2] || '.');
const SITE = 'https://ysfdurak.github.io/kesit-powerbi/';
const CSP = "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; base-uri 'none'; form-action 'none'";
const LV = { temel: 'Temel', orta: 'Orta', ileri: 'İleri' };
const L = window.PBI_LESSONS, BY = Object.fromEntries(L.map(l => [l.id, l]));
const tier = l => (window.PBI_TIER || (x => x))((window.PBI_LEVEL_OF || {})[l.id] || l.lv);
/* Sıra: seviye (Temel, Orta, İleri), seviye içinde modül (ilk göründüğü sırayla), modül içinde öğrenme sırası. Dizin ve önceki/sonraki bağlantıları aynı sırayı kullanır. */
const ORDER = (() => { const base = (window.PBI_ORDER || L.map(l => l.id)).filter(id => BY[id]); const out = [];
  for (const t of ['temel', 'orta', 'ileri']) { const ls = base.filter(id => tier(BY[id]) === t), mods = [...new Set(ls.map(id => BY[id].mod))]; mods.forEach(m => ls.filter(id => BY[id].mod === m).forEach(id => out.push(id))); }
  base.filter(id => !out.includes(id)).forEach(id => out.push(id)); return out; })();
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const kisa = s => s.length > 155 ? s.slice(0, 155).replace(/\s+\S*$/, '') + '…' : s;
const txt = s => String(s || '').replace(/<[^>]+>/g, '');
// uygulama içi ders bağlantısı (button data-lesson) statik sayfada bağlantı olur
const govde = b => String(b).replace(/<button class="lnk" data-lesson="([\w-]+)"([^>]*)>([\s\S]*?)<\/button>/g, (m, id, r, t) => BY[id] ? '<a href="../' + id + '/">' + t + '</a>' : t)
  .replace(/<button class="lnk" data-(?:go|act)="[\w-]+"[^>]*>([\s\S]*?)<\/button>/g, '<a href="../../">$1</a>');
function sayfa(l, i) {
  const lv = LV[tier(l)] || tier(l), n = (l.ex || []).length, url = SITE + 'ders/' + l.id + '/', t = txt(l.title), d = kisa(txt(l.sum)), uzun = txt(l.sum);
  const ld = { '@context': 'https://schema.org', '@type': 'LearningResource', name: t, description: d, inLanguage: 'tr', isAccessibleForFree: true, learningResourceType: 'Ders', educationalLevel: lv, url, isPartOf: { '@type': 'Course', name: 'Kesit Power BI', url: SITE, provider: { '@type': 'Person', name: 'Yusuf Durak' } } };
  const pr = BY[ORDER[i - 1]], nx = BY[ORDER[i + 1]];
  return '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="' + CSP + '"><meta name="viewport" content="width=device-width,initial-scale=1">\n'
    + '<title>' + esc(t) + ' | Kesit Power BI</title><meta name="description" content="' + esc(d) + '"><link rel="canonical" href="' + url + '">\n'
    + '<meta property="og:type" content="article"><meta property="og:locale" content="tr_TR"><meta property="og:site_name" content="Kesit Power BI"><meta property="og:title" content="' + esc(t) + '"><meta property="og:description" content="' + esc(d) + '"><meta property="og:url" content="' + url + '"><meta property="og:image" content="' + SITE + 'og.png"><meta name="twitter:card" content="summary_large_image">\n'
    + '<link rel="icon" href="../../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/vendor/fonts.css"><link rel="stylesheet" href="../statik.css"><script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script></head>\n'
    + '<body class="st"><a class="st-skip" href="#icerik">Ana içeriğe geç</a><header class="st-h"><a class="st-b" href="../../">Kesit Power BI</a><nav aria-label="Konum"><a href="../">Tüm dersler</a></nav></header>\n'
    + '<main id="icerik" class="st-m"><span class="st-e">' + esc(lv) + ' · ' + esc(l.mod) + '</span><h1>' + esc(t) + '</h1><p class="st-l">' + esc(uzun) + '</p>\n'
    + '<div class="st-c"><a class="st-p" href="../../#ders-' + l.id + '">' + (n ? 'Uygulamada aç, ' + n + ' alıştırmayı çöz' : 'Uygulamada aç') + '</a><span>Ücretsiz, hesap gerekmez, kurulum yok.</span></div>\n'
    + '<p class="st-not">Bu sayfa dersin okuma sürümüdür. Metin bir kutuyu çalıştırmanı ya da adıma geçmeni söylüyorsa dersi uygulamada aç.</p>\n'
    + '<article class="panel theory">' + govde(l.body) + '</article>\n'
    + (n ? '<div class="st-c"><a class="st-p" href="../../#ders-' + l.id + '/1">Alıştırmalara geç (' + n + ')</a></div>\n' : '')
    + '<nav class="st-n" aria-label="Ders sırası">' + (pr ? '<a href="../' + pr.id + '/">← ' + esc(txt(pr.title)) + '</a>' : '<span></span>') + (nx ? '<a href="../' + nx.id + '/">' + esc(txt(nx.title)) + ' →</a>' : '<span></span>') + '</nav></main>\n'
    + '<footer class="st-f">Kesit ücretsiz bir eğitim ve portföy projesidir. Veri setleri hayalidir. <a href="/">Kesit ana sayfası</a> · <a href="/vaka/">Nasıl yapıldı</a></footer></body></html>';
}
function dizin() {
  let h = '';
  for (const t of ['temel', 'orta', 'ileri']) {
    const ls = ORDER.map(id => BY[id]).filter(l => tier(l) === t); if (!ls.length) continue;
    h += '<h2>' + LV[t] + '</h2>'; let mod = null;
    ls.forEach(l => { if (l.mod !== mod) { h += (mod !== null ? '</ul>' : '') + '<h3>' + esc(l.mod) + '</h3><ul>'; mod = l.mod; } h += '<li><a href="' + l.id + '/">' + esc(txt(l.title)) + '</a></li>'; });
    h += '</ul>';
  }
  const n = ORDER.length;
  return '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="' + CSP + '"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Power BI dersleri | Kesit Power BI</title><meta name="description" content="' + n + ' ücretsiz Türkçe Power BI dersi. Kurulum ve hesap gerekmez; tarayıcıda yazarak öğren."><link rel="canonical" href="' + SITE + 'ders/"><link rel="icon" href="../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/vendor/fonts.css"><link rel="stylesheet" href="statik.css"></head>\n'
    + '<body class="st"><a class="st-skip" href="#icerik">Ana içeriğe geç</a><header class="st-h"><a class="st-b" href="../">Kesit Power BI</a></header><main id="icerik" class="st-m"><h1>Power BI dersleri</h1><p class="st-l">' + n + ' ücretsiz Türkçe ders. Metni burada oku, alıştırmaları uygulamada çöz.</p><div class="st-c"><a class="st-p" href="../">Uygulamayı aç</a></div><div class="st-d">' + h + '</div></main><footer class="st-f"><a href="/">Kesit ana sayfası</a></footer></body></html>';
}
ORDER.forEach((id, i) => { const d = path.join(OUT, 'ders', id); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, 'index.html'), sayfa(BY[id], i)); });
fs.writeFileSync(path.join(OUT, 'ders', 'index.html'), dizin());
// sitemap: var olan ders dışı adresleri koru, ders adreslerini yeniden yaz
const sm = path.join(OUT, 'sitemap.xml');
if (fs.existsSync(sm)) {
  const s = fs.readFileSync(sm, 'utf8'), keep = (s.match(/<url>[\s\S]*?<\/url>/g) || []).filter(u => !/\/ders\/[^<]+\/<\/loc>/.test(u));
  const urls = keep.concat(ORDER.map(id => '<url><loc>' + SITE + 'ders/' + id + '/</loc></url>'));
  fs.writeFileSync(sm, s.slice(0, s.indexOf('<url>')) + urls.join('\n') + '\n</urlset>\n');
}
console.log('statik ders sayfası', ORDER.length);
