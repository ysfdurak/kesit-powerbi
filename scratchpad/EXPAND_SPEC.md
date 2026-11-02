# PBIPatika — içerik genişletme turu (Ekim 2026, üçüncü tur)

PBIPatika Türkçe bir Power BI / DAX / Fabric öğrenme uygulaması. Kendi DAX motoru tarayıcıda çalışır. Uygulama: /home/claude/pbi.
Amaç: Uygulamayı bitiren kişi "ben artık bir şirkette bu işi yapabilirim" diyebilmeli. Bu turda içerik **derinleşiyor**: ince derslere
yeni bölümler ve alıştırmalar ekleniyor, birkaç yeni uzman ders yazılıyor, püf noktası / karıştırılanlar / sık hatalar / mülakat bankası büyüyor.

**Sen yalnızca SANA VERİLEN DOSYAYI yazarsın** (yeni dosya). Mevcut dosyalara dokunma. Başka ajanlar aynı anda başka dosyalar yazıyor.

## Ortak kurallar (hepsi zorunlu)
- **Özgünlük:** Rakiplerin (DataCamp, SQLBI, Maven, Enterprise DNA, Udemy, Microsoft Learn) metinlerini, örneklerini, alıştırmalarını, veri setlerini kopyalama ya da yakın uyarlama. Konuyu kendi anlatımınla, uygulamanın veri modeliyle anlat. Gerçek sınav sorusu / dump yazma.
- **Doğruluk:** Ürün ayrıntısında (menü yolu, özellik durumu, lisans, sınır, önizleme/GA durumu) emin değilsen Microsoft Learn'den doğrula: WebSearch → learn.microsoft.com sayfasını WebFetch. Tarih: bugün Ekim 2026. Soru-Cevap (Q&A) görseli Aralık 2026'da kaldırılıyor: öğretme; yerine Copilot ve "Yapay zekâ için verileri hazırla" (Prep data for AI).
- **Sayılar:** Metinde modelden bir sayı verirsen motorla HESAPLA (node ile, aşağıdaki örnek). Uydurma.
- **Dil:** Sade Türkçe, kısa cümleler. Arayüz terimleri Türkçe + ilk geçişte İngilizce parantez: "Dilimleyici (Slicer)". Metinde "A1/B2/C1 seviyesi" yazma; "Temel / Orta / İleri" de. Rakip adı anma.
- **Bağlantı:** Başka bir dersin konusunu baştan anlatma; adını anarak bağlantı ver ("Pencere fonksiyonları dersinde gördüğün…"). Müfredat: /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/curriculum.txt (seviye | ince kod | id | modül | başlık || h2'ler || alıştırma sayısı · uzunluk).
- **Mevcut dersi oku:** Genişleteceğin her dersin bugünkü hâlini önce oku: `node /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/show.js <ders-id>` (HTML için `--html`). Var olan anlatımı TEKRARLAMA; üzerine kur.
- **Veri modeli ve hazır ölçüler (119):** /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/model.txt. Motorun desteklediği DAX fonksiyonları: /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/daxfn.txt. Listede olmayan fonksiyonu anlatırsan kod bloğu `data-notry` olsun ve alıştırmada kullanma. Motor çoka çok (many-to-many) ilişki ve çift yönlü ilişki kurmayı desteklemeyebilir: modeldeki ilişkiler model.txt'de; çalıştıramadığın şeyi `data-notry` ile göster.
- **Motorla deneme:**
```js
// node deneme.js   (scratchpad'inde)
global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
console.log(X.evalMeasure(ms, 'CALCULATE([Net Satış], Tarih[Yil] = 2024)', []));
console.log(X.runQuery(ms, 'EVALUATE SUMMARIZECOLUMNS(Kategoriler[Kategori], "N", [Net Satış])').rows.slice(0, 5));
console.log(X.query({ rows: [{ t: 'Tarih', c: 'Yil' }], measures: ms, values: ['[Net Satış]'], slicers: [], totals: true }).rows);
```

## HTML biçimi (ders gövdesi)
- `<h2>` bölüm başlıkları, `<h3>` alt başlık, `<p>`, `<ul>/<ol>`, `<b>`, `<code>`.
- Tablo: `<div class="tbl-wrap"><table><tr><th>…</th></tr><tr><td>…</td></tr></table></div>`
- Kutular: `<div class="tip"><b>Başlık</b>metin</div>`, `<div class="note"><b>Başlık</b>metin</div>`, `<div class="warn"><b>Başlık</b>metin</div>`.
- DAX: `<pre class="dax">Ölçü Adı =\nCALCULATE(...)</pre>` — doğrulayıcı bunu motorda ÇALIŞTIRIR. Çalışmayan/şablon kod: `<pre class="dax" data-notry>`. `<`, `>`, `&` → `&lt;` `&gt;` `&amp;`. Bir blokta birden çok ölçü tanımı olabilir (her biri `Ad =` ile başlar). EVALUATE sorgusu da olur.
- M kodu: `<pre class="m">let ... in ...</pre>`. SQL/KQL/Python/JSON: `<pre class="dax" data-notry>` (renklendirme önemli değil) ya da `<pre><code>`.
- Template literal içinde `${` ve ters tırnak (`) kullanma.

## Alıştırma biçimleri
- Çoktan seçmeli: `{ t:'mc', q:'HTML soru', o:['A','B','C','D'], a:<doğru indeks>, why:'neden doğru, diğerleri neden yanlış' }`
  - **Şık dengesi:** doğru şık en uzun şık olmasın (en fazla %30 oranında), en az %15'inde en kısa olsun; şık uzunlukları yakın; doğru indeksler karışık; "hepsi/hiçbiri" şıkkı yok. Yanlış şıklar makul olmalı (gerçek bir yanılgı).
  - Senaryo tabanlı yaz: "Satış müdürü X istiyor, Y oluyor, ne yaparsın?" İleri seviyede tanım sorma, karar sordur.
- DAX ölçüsü: `{ t:'dax', name:'Ölçü Adı', q:'<b>Ölçü Adı</b>: görev', sol:'DAX ifadesi (Ad = olmadan)', hint:'ipucu', grid?:[{t:'Tablo',c:'Sütun'}], noTotal?:true }` — kullanıcının ölçüsü toplamda ve grid kırılımlarında (varsayılan Kategoriler[Kategori] ve Tarih[Yil]) çözümle karşılaştırılır. Sonuç kırılımda değişmeli, hepsi boş olmamalı. `name` hazır ölçü adlarıyla ve başka derslerdeki alıştırma adlarıyla çakışmasın (benzersiz, açıklayıcı ad seç).
- DAX sorgusu: `{ t:'query', q:'…', start:'EVALUATE\n', sol:'EVALUATE\n...', hint:'…' }`.
- Power Query (isteğe bağlı): /home/claude/pbi/pqdata.js'deki biçim ve kaynaklarla `{ t:'pq', ... }`.
- Aynı soru metni başka bir alıştırmada olmasın.

## A) Ders genişletme dosyası (x_*.js)
```js
/* PBIPatika — <dosya açıklaması> */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, o) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('ext: ders yok', id); return; } if (o.html) l.body += '<section class="deep"><span class="eyebrow">Uzmanlaş</span>' + o.html + '</section>'; if (o.ex) l.ex = (l.ex || []).concat(o.ex); if (o.min) l.min += o.min; (W.PBI_EXT = W.PBI_EXT || []).push({ id, html: o.html || '', ex: o.ex || [] }); };

ext('ders-id', { min: 12, html: `<h2>…</h2>…`, ex: [ … ] });
})(window);
```
- `html` dersin SONUNA eklenir ("Uzmanlaş" bölümü). Birden çok `<h2>` içerebilir. Kendi başına okunabilir olsun.
- `ex` mevcut alıştırmaların SONUNA eklenir (mevcutlar değişmez).
- `min`: eklenen okuma+alıştırma süresi (dakika).
- Doğrulama: `node /home/claude/recover/extval.js <dosyan>` → `SORUN 0`. Ayrıca `node -e "global.window=global; require('<dosyan>')"` sözdizimi için.

## B) Yeni ders dosyası (c21.js, c22.js)
```js
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };
add('<arkasına geleceği mevcut ders id>', { id:'kebab-id', lv:'C1'|'C2'|…, mod:'<modül>', min:<dk>, title:'…', sum:'…', body:`…`, ex:[…] });
})(window);
```
Modüller: Başlangıç, Veri Hazırlama, Veri Modelleme, DAX Temelleri, Görselleştirme, DAX Bağlamları, Zaman Zekâsı, DAX Kalıpları, İleri DAX, İleri Modelleme, Yönetim ve Güvenlik, Sınav Hazırlığı, Analiz, Müşteri Analitiği, Uzman DAX, Fabric, Vaka Çalışmaları, Kariyer, Bitirme.
Doğrulama: `node /home/claude/recover/lessonval.js /home/claude/pbi/<dosyan>.js` → `SORUN 0`.

## İleri seviye için kalite çıtası (en önemli kısım)
İleri içerik "fonksiyon şunu yapar" düzeyinde kalmasın. Her bölümde şunlardan çoğu olsun:
1. **Gerçek iş sorusu** ile açılış (modeldeki verilerle: Anadolu Market, kategoriler, kanallar, müşteriler, temsilciler, giderler, tedarik, projeler).
2. **Mekanizma:** motor bunu nasıl değerlendirir (filtre bağlamı adım adım, hangi filtre üzerine yazılır, hangi tablo genişler).
3. **Karşılaştırmalı çözümler:** 2–3 yol, hangisi ne zaman doğru, performans/okunabilirlik/bakım farkı (tablo ile).
4. **Kenar durumlar:** BLANK, toplam satırı, çoklu seçim, eksik tarih, ilişki yönü, RLS etkisi.
5. **Üretim gerçekleri:** performans etkisi, test etme (DAX sorgu görünümü, Performans Analizi, DAX Studio), ekip çalışması, belgelendirme.
6. **Anti-kalıp:** sık görülen yanlış çözüm ve neden yanlış (mümkünse motorla çıkan yanlış sayı vs doğru sayı).
7. **Kontrol listesi** ya da karar ağacı.
Alıştırmalar: ileri derslerde her genişletmede **en az 5 yeni alıştırma**, bunların **en az 3'ü DAX (dax/query)** (DAX dışı konularda — yönetişim, yayınlama, sayfalandırılmış — en az 4 senaryo MC + varsa 1–2 DAX/query). Orta: en az 4 (≥2 DAX, konu DAX ise). Temel: en az 3.
Eklenen metin uzunluğu: ileri ders başına **5.000–9.000 karakter** düz metin; orta 3.500–6.000; temel 2.000–3.500.
