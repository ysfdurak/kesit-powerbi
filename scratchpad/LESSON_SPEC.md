# PBIPatika — yeni ders yazma kuralları

PBIPatika Türkçe bir Power BI/DAX öğrenme uygulaması (tarayıcıda kendi DAX motoru, Power Query simülatörü). Uygulama: /home/claude/pbi. Sen yalnızca SANA VERİLEN DERS DOSYASINI yazarsın; başka dosyaya dokunma.

## Telif ve özgünlük (ÇOK ÖNEMLİ)
Konu listesi bir rakibin (DataCamp) müfredatından çıkarıldı. Onların metnini, örneklerini, alıştırmalarını, veri setlerini, başlık ifadelerini KOPYALAMA ve uyarlama. Konuyu kendi anlatımınla, uygulamanın kendi veri modeliyle (Satislar, Urunler, Musteriler, Tarih, Hedefler…) ve kendi örneklerinle öğret. Rakibin sayfasını açmana gerek yok.

## Dosya şablonu
```js
/* PBIPatika — <kısa açıklama> */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };
add('<müfredatta hangi dersin ARKASINA gelecek: mevcut ders id>', {
  id: 'kebab-case-id', lv: 'A1'|'A2'|'B1'|'B2'|'C1'|'C2', mod: '<modül>', min: <dakika>,
  title: 'Ders başlığı', sum: 'Bir-iki cümle özet.',
  body: `...HTML...`,
  ex: [ ...alıştırmalar... ]
});
})(window);
```
Birden fazla ders aynı dosyada: add(...) çağrılarını sırayla yaz (ikinci ders birinciyi `after` gösterebilir).
Mevcut ders id'leri, seviyeleri, modülleri ve başlıkları: /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/curriculum.txt (satır: seviye | id | modül | başlık || h2 başlıkları || alıştırma sayısı). Mevcut bir dersin konusunu tekrar etme; gerekiyorsa ona bağlantı ver (metinde dersin adını an).
Modül adları (mümkünse bunlardan biri): Başlangıç, Veri Hazırlama, Veri Modelleme, DAX Temelleri, Görselleştirme, DAX Bağlamları, Zaman Zekâsı, DAX Kalıpları, İleri DAX, İleri Modelleme, Yönetim ve Güvenlik, Sınav Hazırlığı, Analiz, Müşteri Analitiği, Uzman DAX, Bitirme, Kariyer. Gerekirse yeni modül: Vaka Çalışmaları, Yapay Zekâ, Fabric.

## Ders gövdesi (body, HTML)
- `<h2>` bölüm başlıkları (en az 3), `<p>`, `<ul>/<ol>`, `<b>`, `<code>`.
- Tablo: `<div class="tbl-wrap"><table><tr><th>…</th></tr><tr><td>…</td></tr></table></div>`
- Kutular: `<div class="tip"><b>Başlık</b>metin</div>` (ipucu), `<div class="note"><b>Başlık</b>metin</div>` (not), `<div class="warn"><b>Başlık</b>metin</div>` (uyarı).
- DAX kod: `<pre class="dax">Ölçü Adı =\nCALCULATE(...)</pre>` — bu bloklarda “Stüdyoda dene” düğmesi çıkar ve doğrulayıcı kodu motorda ÇALIŞTIRIR; çalışmayan/şablon kod için `<pre class="dax" data-notry>` kullan. `<`, `>`, `&` karakterlerini `&lt;` `&gt;` `&amp;` yaz.
- M kodu: `<pre class="m">let ... in ...</pre>`.
- Uzunluk: düz metin olarak en az 1500 karakter; tipik ders 3000–6000. Somut sayı verirken MODELDEN HESAPLA (motorla), uydurma.
- Dil: sade Türkçe, kısa cümleler, arayüz terimleri Türkçe + ilk geçişte İngilizce parantez (“Dilimleyici (Slicer)”). Ürün ayrıntısında emin değilsen Microsoft Learn'den doğrula (WebSearch → learn.microsoft.com linkini WebFetch). Soru-Cevap (Q&A) Aralık 2026'da kaldırılıyor; öğretme, yerine Copilot ve “Yapay zekâ için verileri hazırla” (Prep data for AI).

## Alıştırmalar (ex) — her derste en az 3, tercihen 4–6
- Çoktan seçmeli: `{ t:'mc', q:'HTML soru', o:['A','B','C','D'], a:<doğru indeks>, why:'neden doğru' }` — doğru şık en uzun şık OLMASIN (en fazla %30), şıkların uzunluğu yakın olsun; doğru indeksleri karıştır.
- DAX ölçüsü: `{ t:'dax', name:'Ölçü Adı', q:'<b>Ölçü Adı</b>: görev', sol:'DAX ifadesi (ad = olmadan)', hint:'ipucu', grid?:[{t:'Tablo',c:'Sütun'}], noTotal?:true }` — kullanıcının ölçüsü toplamda ve grid kırılımlarında (varsayılan: Kategoriler[Kategori] ve Tarih[Yil]) sol ile karşılaştırılır; sonuç kırılımda değişmeli. Ad hazır ölçü adlarıyla (model.txt) çakışmasın.
- DAX sorgusu: `{ t:'query', q:'…', start:'EVALUATE\n', sol:'EVALUATE\n...', hint:'…' }`.
- Power Query (isteğe bağlı): /home/claude/pbi/pqdata.js içindeki biçim ve kaynaklar (bayi, hedef, urun, musteri) ile `{ t:'pq', src:'bayi', pre:[], sol:[{op:'removeTop',cols:[],n:1},…], q, hint }`.
DAX gerektiren derslerde en az 2 DAX alıştırması olsun. DAX gerektirmeyen (arayüz, hizmet, tasarım) derslerde MC ağırlıklı olabilir.

## Veri modeli
Tablolar, ilişkiler, 96 hazır ölçü: /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/model.txt. Motorla deneme: /home/claude/recover/deepcalc.js örneğindeki gibi node ile.

## Doğrulama
`node /home/claude/recover/lessonval.js /home/claude/pbi/<dosyan>.js` → "SORUN 0" olmalı (kod parçaları çalışıyor, alıştırmalar çözülebilir ve anlamlı, şık dengesi, PBI_ORDER'a eklenmiş).

## Motorun desteklediği DAX fonksiyonları
Liste: /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/daxfn.txt. Listede olmayan bir fonksiyonu anlatman gerekiyorsa kod bloğunu `data-notry` yap ve alıştırmada kullanma.
## Diğer derslerin yazarları
Aynı anda başka ajanlar da ders yazıyor (c9–c13.js). Sana verilen ders listesinin dışına çıkma; başka bir yeni dersin konusunu anlatma.

## Güncel notlar (Ekim 2026, ikinci tur)
- Arayüz artık üç seviye gösteriyor: Temel (A1–A2), Orta (B1–B2), İleri (C1–C2). Ders dosyasında `lv` alanına yine ince kodu (A1…C2) yaz; ders sırası ve doğrulayıcı bunu kullanır. Ders METNİNDE “A1/B2/C1 seviyesi” gibi ifadeler KULLANMA; gerekiyorsa “Temel / Orta / İleri seviye” de.
- Motorda DATATABLE artık çok sütunlu satırlarla doğru çalışıyor (STRING, INTEGER, DOUBLE, CURRENCY, DATETIME "2024-01-05"). MIN/MAX iki değerle, COUNT metin sütunuyla çalışıyor. ALLEXCEPT bağlam geçişini doğru izdüşürüyor.
- Güncel müfredat (84 ders, seviye | ince kod | id | modül | başlık || h2'ler || alıştırma): curriculum.txt. Var olan dersin konusunu tekrar etme, adını anarak bağlantı ver.
- Bu turdaki diğer yeni dosyalar c14.js, c15.js, c16.js; sadece sana verileni yaz.
