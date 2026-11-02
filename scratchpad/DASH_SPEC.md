# PBIPatika — çok sayfalı rapor (dashboard) yazma kuralları

PBIPatika Türkçe bir Power BI öğrenme uygulaması: /home/claude/pbi. "Dashboardlar" bölümü, Power BI raporlarının tarayıcıdaki canlı benzetimidir: kendi DAX motoru (dax.js) her görseli Anadolu Market modelinden hesaplar. Mevcut 13 rapor /home/claude/pbi/dashboards.js içinde (tek sayfa). Rapor motoru artık çok sayfa, yer imi, detay sayfası (drillthrough), araç ipucu sayfası, alan parametresi, seçim bölmesi (göster/gizle), dinamik başlık, tema ve telefon düzenini destekliyor.

**Özgünlük:** Microsoft örnek raporlarının, galerilerin ya da şablonların tasarımını, metnini, görselini KOPYALAMA. Yalnızca hangi tür raporların ve özelliklerin yaygın olduğunu biliyoruz (araştırma: /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/dash_research.md). Her şeyi kendi kurgunla, Anadolu Market verisiyle yap.

## Dosya kuralı
Sana verilen tek dosyayı yaz (ör. /home/claude/pbi/dash_up1.js). Başka dosyaya dokunma. Dosya şablonu:
```js
/* PBIPatika — <açıklama> */
(function (W) {
'use strict';
const D = W.PBI_DASHES; const find = id => D.find(d => d.id === id);
const cats = r => r.rows.map(x => x.keys[0]); const col = (r, j) => r.rows.map(x => x.vals[j]);
const sortBy = (r, j, desc) => { r.rows.sort((a, b) => ((desc === false ? 1 : -1) * ((a.vals[j] || 0) - (b.vals[j] || 0)))); return r; };
// mevcut raporu yükseltme: const d = find('ozet'); d.pages = [{ id: 'genel', name: 'Genel bakış', tiles: d.tiles }, ...]; d.bookmarks = [...]
// yeni rapor: D.push({ id, name, icon, lv, group, audience, question, slicers, pages, bookmarks, params, vis, theme, build })
})(window);
```
Dosya dashboards.js'ten SONRA yüklenir; dosya adları `dash_*.js` olunca doğrulayıcı ve derleme otomatik bulur.

## Rapor nesnesi
- `id` (benzersiz, kebab), `name`, `icon` (2 harf), `lv` ('A1'…'C2', ince seviye; arayüz Temel/Orta/İleri gösterir), `group` (seçicide başlık: 'Yönetim ve finans', 'Satış ve müşteri', 'Operasyon ve tedarik', 'Pazarlama ve dijital', 'İnsan kaynakları ve proje', 'Tasarım vitrini'), `audience`, `question`.
- `slicers`: rapor düzeyi dilimleyiciler (tüm sayfalara uygulanır = senkron dilimleyici). Anahtarlar /home/claude/pbi/dashcore.js `SL` içinde: yil, yilMulti, kanal, segment, kategori, topn, fiyat, para, viewAs (RLS), cihaz, kaynak, departman. Yeni dilimleyici gerekiyorsa `W.PBI_DASHCORE.SL.<anahtar> = { t, c, label, vals, def, single?, req?, style:'dropdown'? }` ile ekle (vals'ı modelden hesapla).
- `pages`: `[{ id, name, icon?, tiles, hidden?, thru?: { field: 'Tablo[Sütun]', label, def }, note? }]`
  - `hidden:true` + `thru` = **detay sayfası** (drillthrough). `def`: doğrudan açılırsa kullanılacak değer (zorunlu). Sayfa sekmelerinde görünmez.
  - Sayfa adları kısa olsun ("Genel bakış", "Kategori detayı").
- `bookmarks`: `[{ id, name, desc?, page?, sl?: { yil: [2024] }, pr?: { olcu: 'Brüt Kâr' }, vis?: { gorunum: 'tablo' }, cross?: { t, c, v }, story?: 'HTML metin' }]`. `story` alanı olan yer imleri bir **sunum** (hikâye) oluşturur: çubukta ‹ › ile ilerlenir.
- `params` (alan parametresi): `{ olcu: { label: 'Ölçü', opts: [['Net Satış', 'Net satış'], ['Brüt Kâr', 'Brüt kâr']], def: 'Net Satış' } }` — görsel içinde `a.prm('olcu')` ile oku. Eksen parametresi de aynı: opts değeri bir sütun adı 'Kategoriler[Kategori]'.
- `vis` (seçim bölmesi grupları): `{ gorunum: 'grafik' }` varsayılan; görsellere `vis: 'gorunum:grafik'` ya da `'gorunum:tablo'` ver; değiştirmek için nav düğmesi `{ label, vis: 'gorunum:tablo' }` ya da yer imi `vis`.
- `theme`: `{ id: 'dark'|'glass'|'corp'|'ibcs'|'story', header: 'Başlık bandı metni', sub?, logo?: 'AM', nav?: 'left' (sol sayfa menüsü), desc: 'tasarım açıklaması' }`. id yoksa varsayılan açık tema.
- `build`: "Nasıl yapıldı" adımları `[['Başlık', 'Açıklama', ['Ölçü adı', ...]]]`. Çok sayfalı raporlarda sayfa yapısını, yer imlerini (Görünüm → Yer imleri, Seçim bölmesi), detay sayfasını, araç ipucu sayfasını, düğme eylemlerini, alan parametresini ve temayı Power BI'da nasıl kurduğunu da anlat (8–12 adım). Ölçü adları ölçü kütüphanesinde olmalı (yoksa boş dizi).

## Görsel (tile)
Ortak alanlar: `id` (rapor içinde benzersiz), `span` (12 sütunluk ızgarada 3–12), `title` (metin ya da `a => 'dinamik başlık'`; fonksiyonsa `titleHint` de ver), `type` (Power BI görsel adı, Türkçe: 'Kart', 'KPI', 'Kümelenmiş çubuk', 'Çizgi grafik', 'Alan grafik', 'Küçük katlar', 'Matris', 'Şelale', 'Huni', 'Ağaç haritası', 'Dağılım grafiği', 'Harita (Azure Maps)', 'Ayrıştırma ağacı', 'Önemli etkileyenler', 'Gantt (özel görsel)', 'Anlatı' …), `wells` (alan kutuları: {'X ekseni': 'Tarih[Ay]', 'Y ekseni': '[Net Satış]'}), `measures` (kütüphane ölçü adları), `format` (biçim ayarları listesi), `why` (neden bu görsel, 1–2 cümle), `render: a => …`.
İsteğe bağlı: `cross: 'Tablo[Sütun]'` (tıklayınca sayfayı çapraz filtreler; render `{ cats, html }` döndürmeli ve görsel `sel: a.sel(cats, 'Tablo', 'Sütun')` almalı), `drill: ['Kategoriler[Kategori]', 'Urunler[Urun]']` (hiyerarşi), `thru: 'detaySayfaId'` (cross ile birlikte; sağ tık/“Detaya git”), `tip: (a, add, cat) => ({ title, cards: [['Etiket', 'değer metni']], spark?: [sayılar], sparkLabel?, bars?: [['etiket', sayı, 'metin']], barsLabel?, note? })` (özel araç ipucu sayfası — görselin `tipx: a.tipx('Tablo[Sütun]', cats)` seçeneğini alması gerekir), `vis: 'grup:değer'`, `mobile: false` (telefonda gizle), `morder` (telefonda sıra), `style` (CSS sınıfı).
Özel türler: `{ id, span, kind: 'nav', title?, items: [{ label, icon?, page? | bm? | vis? }] }` (sayfa gezinme / yer imi / görünüm düğmeleri; seçili olan basılı görünür) ve `{ id, span, kind: 'text', html: '…' | a => '…' }` (başlık, açıklama, yardım katmanı; `<h2>`, `<p>`, `<div class="callout">`).

## render içindeki `a` API'si (/home/claude/pbi/dashcore.js `api`)
- `a.Q(rows, values, opts)` → `{ rows: [{ keys:[...], vals:[...] }], total }`. `rows`: ['Kategoriler[Kategori]'], `values`: ölçü adları. opts: `except: [['Tablo','Sütun']]` (o sütunun çapraz filtresini/dilimleyicisini yok say — kendi kendini filtreleyen görsellerde), `add: [{ t, c, values: [...] }]` (ek filtre), `totals:false`, `extraMeasures: { 'Ad': 'DAX' }` (yalnızca bu görsel için geçici ölçü), `keepBlank`.
- `a.M('[Ölçü]' | 'DAX ifadesi', opts)` → sayı.
- `a.fmt(v, 'para'|'yuzde'|'adet'|null, kisa?)`, `a.yearLabel`, `a.timeAxis` ('Tarih[Ay]' tek yıl, değilse 'Tarih[YilAy]'), `a.P` (fiyat, para, viewAs, topn), `a.sel(cats,'T','C')`, `a.tipx(col, cats)`, `a.prm(k)`, `a.prmLabel(k)`, `a.vis(k)`, `a.page`, `a.thruVal()` (detay sayfasındaki seçili değer; filtre zaten uygulanmıştır), `a.level/a.dcol/a.dspec` (detaya inme), `a.slicerVals(k)`.
- `a.V` görseller (/home/claude/pbi/viz.js): `kpi(v, hedef, etiket, biçim, hedefEtiketi, {spark, direction:'down'})`, `card(v, etiket, biçim)`, `kpicard({ v, fmt, delta, dlabel, deltaFmt:'pp'?, invert?, icon:'₺', spark:[..], sub })`, `line({cats, series:[{name, vals, dash?, color?}], fmt}, {legend:'top', labels, markers, area, forecast, refs})`, `area({cats, series, fmt}, {pct})` (yığılmış alan), `column(d, {stacked, pct, labels, labelFn, sel, tipx})` (seride `type:'line'` → kombo), `bar(d, {...})`, `donut(d, {sel, legend, inner})`, `waterfall({cats, series:[{vals}], fmt}, {start, startLabel, endLabel})`, `funnel(d)`, `treemap(d)`, `scatter([{x,y,s?,label,i}], {xlabel, ylabel, xfmt, yfmt, quadrants, trend, bubble})`, `map([{label, ll:[lat,lon], v, i}], {fmt})`, `decomp(levels)`, `table(cols, rows, {fmts, cf:{1:'bar'|'heat'|'diverge'|'icon'}, sel, compact, total, banded})`, `gauge(v, hedef, max, biçim, etiket)`, `bullet([{c, v, t}], {fmt})`, `multiples({panels:[{title, vals}], fmt}, {kind:'column'?, cols?})` (küçük katlar), `calendar({days:[{date, v}], fmt}, {vlabel})` (takvim ısı haritası), `variance([{cat, ac, ref}], {fmt, refLabel:'GY'|'BÜ', mode:'pct'?, invert?})` (IBCS sapma çubukları), `pnl([{label, ac, ref, level:0|1, kind:'sub'|'total'?, cost?}], {fmt, acLabel, refLabel})` (gelir tablosu), `dumbbell([{cat, a, b}], {aLabel, bLabel, fmt})`, `progress([{cat, v, target}], {fmt})`, `gantt([{label, start, end, actual?, status, progress}], {today})`, `influencers([{factor, rate, base, lift, n}], {head})`, `spark(vals)`.
Mevcut raporlardaki görselleri (dashboards.js) örnek olarak oku: sorgu kalıpları ve biçimler orada.

## Kalite kuralları
- Her sayfa bir soruya cevap verir; sayfa başına 5–10 görsel. Üstte KPI şeridi, ortada eğilim/karşılaştırma, altta kalem/detay (Z deseni).
- Sayılar modelden hesaplanır; uydurma sayı yazma. Metin içinde sayı gerekiyorsa render içinde hesapla (Anlatı görselleri gibi).
- Her raporda en az: 3 görünür sayfa, 1 detay sayfası (drillthrough), 1 araç ipucu sayfası (`tip`), 2–4 yer imi, gezinme ya da görünüm düğmeleri, en az 1 dinamik başlık. Uygun olan raporlarda alan parametresi ve göster/gizle (grafik ↔ tablo).
- Ölçü adları kütüphanede olmalı. Liste: /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/model.txt + yeni eklenenler (measures.js sonundaki Finans, Müşteri hizmetleri, Tedarik, Proje grupları). Kütüphanede olmayan hesap için `extraMeasures` kullan ve `build` adımında DAX'ını yaz.
- Model: model.txt + yeni tablolar (data2.js): GiderTurleri, Giderler(Tarih, GiderTuru, DepartmanNo, Tutar), GiderButce(Tarih, GiderTuru, Butce), Talepler(TalepNo, Tarih, MusteriNo, Kanal, Konu, Oncelik, IlkYanitDk, CozumSaat, Cozuldu, Memnuniyet), Tedarikciler(TedarikciNo, Tedarikci, Ulke, Sehir, SozGun), SatinAlmalar(SiparisNo, Tarih, UrunNo, TedarikciNo, Adet, BirimFiyat, Tutar, TeslimGun, Zamaninda, Kusurlu), Projeler(ProjeNo, Proje, DepartmanNo, Birim, Baslangic, BitisPlan, BitisGercek, Durum, Butce, Harcanan, Ilerleme). Satışlar 22.06.2022'de başlar; 2022 yarım yıldır.
- Türkçe, kısa; arayüz terimleri Power BI Türkçe adlarıyla (Yer imleri, Seçim bölmesi, Detaya git, Araç ipucu). Görsel `why` metinleri neden bu görselin seçildiğini söyler.
- Motor desteklemediği DAX'ı kullanma (desteklenen fonksiyonlar: /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/daxfn.txt; GROUPBY/CURRENTGROUP da var).

## Doğrulama
`node /home/claude/recover/dashval.js <rapor id'leri>` → her sayfayı, detay sayfasını, yer imini, parametre seçeneğini, görünüm grubunu ve telefon düzenini çizer; "SORUN 0" olmalı (hata, NaN/undefined, boş görsel, eksik type/wells/why, olmayan sayfa ya da yer imi bulunmamalı). Tarayıcıda görmek istersen: http://localhost:8765/index.html#dashboard-<id> (sunucu açıksa; değilse `cd /home/claude/pbi && python3 -m http.server 8765` arka planda) — derleme: `bash /tmp/claude-0/-home-claude/8d15e87e-21b9-51fd-9b9d-27135d77cfc3/scratchpad/build.sh` (dash_*.js dosyalarını otomatik ekler). Playwright: require('playwright'), chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell' }).
