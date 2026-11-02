/* Kesit Power BI — vaka veri setleri: Kesit SQL'in hayali şirketleri Power BI Desktop'ta uçtan uca vaka olarak.
   Her paket: CSV'ler (zip), model ve ilişki planı, Power Query adımları, takvim tablosu, ölçü kütüphanesi,
   beklenen sonuçlu görevler, rapor brifi, veri tuzakları ve portföy anlatımı. Paket içerikleri vd_*.js dosyalarında. */
(function () {
'use strict';
const C = window.PBI_CORE, P = C.P, esc = C.esc;
const DS = window.PBI_DATASETS || [];
const LV = { temel: 'Temel', orta: 'Orta', ileri: 'İleri' };
const fmtN = (v, unit) => { if (v == null) return 'boş (BLANK)'; if (typeof v !== 'number') return String(v);
  if (unit === 'yuzde') return '%' + (v * 100).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
  const s = Math.abs(v) >= 1000 || Number.isInteger(v) ? v.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : v.toLocaleString('tr-TR', { maximumFractionDigits: 4 });
  return s + (unit === 'para' ? ' ₺' : unit === 'dakika' ? ' dk' : unit === 'km' ? ' km' : ''); };
const rowsOf = d => (d.tables || []).reduce((a, t) => a + (+(String(t.desc || '').match(/\(([\d.]+)/) || [0, '0'])[1].replace(/\./g, '') || 0), 0);
const OPEN = {};
const COMMON = `<section class="panel vd-before"><h3>Başlamadan önce (her paket için)</h3><ol>
<li><b>Yerel ayar:</b> CSV’ler ondalık ayırıcı olarak nokta kullanır. Desktop Türkçe yerel ayardaysa yüklerken <code>-664.74</code> gibi değerler −66474’e dönüşür. Boş bir dosya açıp <b>Dosya → Seçenekler ve ayarlar → Seçenekler → GEÇERLİ DOSYA → Bölgesel Ayarlar (Regional Settings) → İçeri aktarma için yerel ayar (Locale for import)</b> değerini <b>İngilizce (ABD)</b> yap, sonra veriyi yükle. Ya da Power Query’de otomatik eklenen “Değiştirilen Tür” adımını silip türleri yerel ayarla yeniden ver: <code>Table.TransformColumnTypes(Kaynak, {{"amount", type number}}, "en-US")</code>.</li>
<li><b>Otomatik ilişkileri kapat:</b> <b>GEÇERLİ DOSYA → Veri Yükleme (Data Load) → İlişkiler</b> altında “Veri yüklendikten sonra yeni ilişkileri otomatik algıla” (Autodetect new relationships) seçeneğini kaldır. Aynı adlı sütunlar yüzünden Desktop yanlış ilişki kurabilir ya da gereken ilişkiyi pasif bırakabilir. İlişkileri paketteki listeye göre kendin kur; sonra <b>Model → İlişkileri yönet</b> listesini paketle karşılaştır.</li>
<li><b>Boş hücreler:</b> CSV’de boş olan tarih ve sayılar tür verilince <code>null</code> olur; boş metin hücreleri ise boş metin (“”) kalır. Metin sütununda null istiyorsan Dönüştür → Değerleri değiştir ile boşu <code>null</code> yap.</li>
<li><b>Otomatik tarih/saat:</b> Kendi Takvim tablonu kullanacağın için GEÇERLİ DOSYA → Veri Yükleme altında “Otomatik tarih/saat” seçeneğini kapat.</li>
</ol></section>`;
const st = id => { P.vd = P.vd || {}; return P.vd[id] = P.vd[id] || {}; };
const doneN = d => (d.tasks || []).filter(t => st(d.id)[t.id]).length;
const plainCode = s => '<pre class="dax" data-notry>' + esc(s) + '</pre>';

function card(d) {
  const n = (d.tasks || []).length, dn = doneN(d);
  return '<button class="panel vd-card" style="--pc:' + esc(d.color || '#888') + '" data-go="veriler" data-id="' + esc(d.id) + '"><span class="vd-ic" aria-hidden="true">' + esc(d.icon || '▦') + '</span><span class="vd-tx"><span class="eyebrow">' + esc(d.sector || '') + '</span><b>' + esc(d.name) + '</b><small>' + esc(d.tagline || '') + '</small><span class="row" style="gap:6px;flex-wrap:wrap">' + C.lvBadge(d.lv === 'ileri' ? 'C1' : d.lv === 'temel' ? 'A2' : 'B1') + '<span class="chip">' + (d.tables || []).length + ' tablo</span><span class="chip">' + n + ' görev</span>' + (dn ? '<span class="chip on">' + dn + '/' + n + ' çözüldü</span>' : '') + '</span></span></button>';
}
function viewList() {
  let h = '<div class="wrap" style="gap:18px">' + C.head('Desktop’ta uygula', 'Vaka veri setleri', DS.length + ' hayali şirketin verisi: CSV’leri indir, Power BI Desktop’ta modeli kur, ölçüleri yaz, sonucunu paketteki beklenen değerle karşılaştır.', 'veriler');
  h += '<p class="muted" style="margin:0;max-width:74ch">Tarayıcıdaki alıştırmalar Anadolu Market modelini kullanır. Bu paketler ise gerçek bir işteki gibi sıfırdan başlar: ham CSV’ler, ilişkisi kurulmamış tablolar, veri kalitesi sorunları. Her pakette 14–18 görev var; her görevin beklenen sonucu hem bu uygulamanın DAX motorunda hem bağımsız olarak SQL’de hesaplanıp doğrulandı.</p>';
  h += '<div class="vd-grid">' + DS.map(card).join('') + '<button class="panel vd-card" style="--pc:#E9B10C" data-go="model"><span class="vd-ic" aria-hidden="true">🛒</span><span class="vd-tx"><span class="eyebrow">E-ticaret</span><b>Anadolu Market</b><small>Derslerin ve dashboardların kullandığı model: satışlar, ürünler, müşteriler, hedefler, giderler, tedarik ve projeler.</small><span class="row" style="gap:6px"><span class="chip">Veri modeli sayfasında indir</span></span></span></button></div>';
  h += '<section class="panel vd-how"><h3>Nasıl çalışılır?</h3><ol><li>Paketi indir ve zip’i bir klasöre aç.</li><li>Power BI Desktop → <b>Veri al → Metin/CSV</b> ile tabloları yükle; ya da <b>Veri al → Klasör</b> ile hepsini birden gör.</li><li>Paketteki <b>Hazırlık</b> adımlarını uygula: veri türleri, türetilmiş sütunlar, Takvim tablosu.</li><li><b>Model</b> görünümünde ilişkileri kur, Takvim’i tarih tablosu olarak işaretle.</li><li>Ölçü kütüphanesini yaz, görevleri çöz; sonucunu her görevdeki <b>beklenen değerle</b> karşılaştır.</li><li>Rapor brifine göre çok sayfalı raporu tasarla; bitirince portföyüne ekle.</li></ol></section>';
  return h + '</div>';
}
function viewOne(d) {
  const S = st(d.id), n = (d.tasks || []).length, dn = doneN(d);
  let h = '<div class="wrap" style="gap:18px;max-width:1080px" id="vdTop"><div class="crumbs"><button data-go="veriler">Vaka veri setleri</button><span>/</span><span>' + esc(d.name) + '</span></div>';
  h += '<section class="panel vd-hero" style="--pc:' + esc(d.color || '#888') + '"><span class="vd-ic big" aria-hidden="true">' + esc(d.icon || '▦') + '</span><div class="grow" style="min-width:0"><span class="eyebrow">' + esc(d.sector || '') + ' · ' + esc(d.period || '') + '</span><h1>' + esc(d.name) + '</h1><p class="muted" style="margin:4px 0 0">' + esc(d.tagline || '') + '</p><div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn pri" data-vddl="' + esc(d.id) + '">' + C.ic('dl') + ' Paketi indir (CSV + rehber)</button><span class="chip">' + (d.tables || []).length + ' tablo · ~' + rowsOf(d).toLocaleString('tr-TR') + ' satır</span><span class="chip">' + dn + '/' + n + ' görev</span></div></div></section>';
  h += COMMON;
  const sec = (id, t, body, open) => { const k = d.id + ':' + id; const o = OPEN[k] !== undefined ? OPEN[k] : open; return '<details class="panel vd-sec"' + (o ? ' open' : '') + ' id="vd-' + id + '" data-vdsec="' + esc(k) + '"><summary><h2>' + t + '</h2></summary><div class="vd-body">' + body + '</div></details>'; };
  h += sec('hikaye', 'Vaka', '<div class="theory">' + d.story + '</div>', true);
  h += sec('tablolar', 'Tablolar ve sütunlar', (d.tables || []).map(t => '<div class="vd-tbl"><h3>' + esc(t.name) + ' <span class="chip">' + (t.kind === 'fact' ? 'olgu' : 'boyut') + '</span></h3><p class="muted" style="margin:0 0 6px">' + esc(t.desc || '') + '</p><div class="coltable"><table><thead><tr><th>Sütun</th><th>Tür</th><th>Açıklama</th></tr></thead><tbody>' + (t.cols || []).map(c => '<tr><td>' + esc(c[0]) + '</td><td>' + esc(c[1]) + '</td><td>' + esc(c[2] || '') + '</td></tr>').join('') + '</tbody></table></div></div>').join(''));
  h += sec('hazirlik', 'Hazırlık: Power Query ve Takvim', '<ol class="vd-steps">' + (d.prep || []).map(p => '<li>' + p + '</li>').join('') + '</ol>' + ((d.derive || []).length ? '<h3>Türetilmiş sütunlar</h3><ul>' + d.derive.map(x => '<li><code>' + esc(x.t) + '[' + esc(x.c) + ']</code> ← <code>' + esc(x.from) + '</code> (' + ({ date: 'yalnız tarih', hour: 'saat', year: 'yıl', weekday: 'haftanın günü, Pazartesi = 1' })[x.fn] + ')' + (x.why ? ': ' + esc(x.why) : '') + '</li>').join('') + '</ul>' : '') + (d.dateTableDax ? '<h3>Takvim tablosu (Modelleme → Yeni tablo)</h3>' + plainCode(d.dateTableDax) : ''));
  h += sec('model', 'Model ve ilişkiler', '<p class="muted" style="margin:0 0 8px">Çok tarafı → bir tarafı. Kesikli olanlar pasif ilişkidir; ölçünün içinde USERELATIONSHIP ile etkinleştirilir.</p><ul class="vd-rels">' + (d.rels || []).map(r => { const o = r[4] || {}; return '<li class="' + (o.inactive ? 'off' : '') + '"><code>' + esc(r[0]) + '[' + esc(r[1]) + ']</code><span aria-hidden="true">' + (o.inactive ? ' ┄┄▶ ' : ' ──▶ ') + '</span><code>' + esc(r[2]) + '[' + esc(r[3]) + ']</code>' + (o.inactive ? ' <span class="chip">pasif</span>' : '') + (o.why ? '<small>' + esc(o.why) + '</small>' : '') + '</li>'; }).join('') + '</ul>');
  const folders = []; (d.measures || []).forEach(m => { const f = m.folder || 'Ölçüler'; let g = folders.find(x => x[0] === f); if (!g) folders.push(g = [f, []]); g[1].push(m); });
  h += sec('olculer', 'Ölçü kütüphanesi (' + (d.measures || []).length + ')', folders.map(([f, ms]) => '<h3>' + esc(f) + '</h3>' + ms.map(m => '<div class="vd-ms"><b>' + esc(m.name) + '</b><span class="muted">' + esc(m.desc || '') + '</span>' + plainCode(m.name + ' =\n' + m.expr) + '</div>').join('')).join(''));
  const byLv = ['temel', 'orta', 'ileri'].map(l => [l, (d.tasks || []).filter(t => t.lv === l)]).filter(x => x[1].length);
  h += sec('gorevler', 'Görevler (' + dn + '/' + n + ')', '<p class="muted" style="margin:0 0 10px">Önce Desktop’ta kendin çöz, sonra beklenen sonuca bak. Sonucun tutuyorsa “Çözdüm” işaretle.</p>' + byLv.map(([l, ts]) => '<h3>' + LV[l] + '</h3>' + ts.map((t, i) => {
    const open = (st(d.id)._open || {})[t.id];
    return '<article class="vd-task' + (S[t.id] ? ' ok' : '') + '" id="vt-' + esc(t.id) + '"><div class="row" style="justify-content:space-between;gap:8px;align-items:flex-start"><div style="min-width:0"><span class="eyebrow">' + LV[l] + ' · ' + esc(t.id) + (t.name ? ' · ' + esc(t.name) : '') + '</span><div class="q">' + t.q + '</div></div><label class="vd-chk"><input type="checkbox" data-vdok="' + esc(d.id) + ':' + esc(t.id) + '"' + (S[t.id] ? ' checked' : '') + '> Çözdüm</label></div>' +
      (open ? '<div class="vd-ans"><p><b>Beklenen sonuç:</b> ' + (t.expect !== undefined ? '<span class="vd-exp">' + esc(fmtN(t.expect, t.unit)) + '</span>' : (t.expectRows ? 'ilk satırlar: ' + t.expectRows.map(r => '<code>' + esc(r.map(v => fmtN(v)).join(' · ')) + '</code>').join(', ') : '—')) + '</p>' + (t.hint ? '<p class="muted"><b>İpucu:</b> ' + esc(t.hint) + '</p>' : '') + (t.dax ? plainCode((t.name || 'Ölçü') + ' =\n' + t.dax) : '') + (t.query ? plainCode(t.query) : '') + (t.steps ? '<ol>' + t.steps.map(s => '<li>' + s + '</li>').join('') + '</ol>' : '') + (t.explain ? '<p>' + t.explain + '</p>' : '') + '</div>'
        : '<div class="row" style="gap:8px"><button class="btn sm" data-vdhint="' + esc(d.id) + ':' + esc(t.id) + '">Beklenen sonucu ve çözümü göster</button></div>') + '</article>';
  }).join('')).join(''));
  const db = d.dashboard || {};
  h += sec('rapor', 'Rapor brifi', (db.title ? '<p><b>' + esc(db.title) + '</b>' + (db.audience ? ' · <span class="muted">' + esc(db.audience) + '</span>' : '') + '</p>' : '') + '<div class="vd-pages">' + (db.pages || []).map((p, i) => '<div class="vd-page"><span class="eyebrow">Sayfa ' + (i + 1) + '</span><h3>' + esc(p.name) + '</h3><p class="muted">' + esc(p.purpose || '') + '</p>' + ((p.visuals || []).length ? '<b>Görseller</b><ul>' + p.visuals.map(v => '<li>' + esc(v) + '</li>').join('') + '</ul>' : '') + ((p.interactions || []).length ? '<b>Etkileşimler</b><ul>' + p.interactions.map(v => '<li>' + esc(v) + '</li>').join('') + '</ul>' : '') + '</div>').join('') + '</div>');
  if ((d.traps || []).length) h += sec('tuzak', 'Veri ve modelleme tuzakları', '<ul class="vd-traps">' + d.traps.map(x => '<li>' + x + '</li>').join('') + '</ul>');
  if ((d.portfolio || []).length) h += sec('portfoy', 'Portföyde ve mülakatta nasıl anlatırsın', '<ul>' + d.portfolio.map(x => '<li>' + x + '</li>').join('') + '</ul>');
  return h + '</div>';
}
function view(id) { const d = DS.find(x => x.id === id); return d ? viewOne(d) : viewList(); }
C.view('veriler', { render: view, hash: 'veriler' });

async function download(id) {
  const d = DS.find(x => x.id === id); if (!d) return; const name = 'kesit-powerbi-' + d.id + '.zip';
  try { let buf = null; try { const r = await fetch('veri/' + d.id + '.zip'); if (r.ok) buf = new Uint8Array(await r.arrayBuffer()); } catch (e0) {}
    if (!buf || buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4B) { const r2 = await fetch('veri/' + d.id + '.b64.txt'); if (!r2.ok) throw new Error('yok'); const bin = atob((await r2.text()).trim()); buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i); }
    if (window.PBI_CAREER && window.PBI_CAREER.saveFile) return window.PBI_CAREER.saveFile(name, buf);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([buf], { type: 'application/zip' })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  } catch (e) { C.toast('Paket indirilemedi; bağlantını kontrol edip tekrar dene.'); }
}
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-vddl],[data-vdhint]'); if (!t) return;
  if (t.dataset.vddl) { download(t.dataset.vddl); try { window.KESIT_PORTFOLIO && window.KESIT_PORTFOLIO.gcEvent('veri-indir/' + t.dataset.vddl, 'Veri paketi indirildi: ' + t.dataset.vddl); } catch (e) {} return; }
  if (t.dataset.vdhint) { const [id, tid] = t.dataset.vdhint.split(':'); const s = st(id); s._open = s._open || {}; s._open[tid] = 1; C.save(); const y = window.scrollY; C.render(); window.scrollTo(0, y); }
});
document.addEventListener('change', ev => {
  const el = ev.target; if (!el.dataset || !el.dataset.vdok) return; const [id, tid] = el.dataset.vdok.split(':'); const s = st(id);
  if (el.checked) { s[tid] = 1; C.addXP(5); } else delete s[tid]; C.save(); const y = window.scrollY; C.render(); window.scrollTo(0, y);
});
document.addEventListener('toggle', ev => { const el = ev.target; if (el && el.dataset && el.dataset.vdsec) OPEN[el.dataset.vdsec] = el.open; }, true);
window.PBI_VDATA = { list: DS };
})();
