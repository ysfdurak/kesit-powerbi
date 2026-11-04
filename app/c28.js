/* Kesit Power BI — c28: Kapsam denetiminin kapattığı başlıklar.
   Pivot ve Devrik, Power Query komut uygulaması, M işlev alıştırmaları, DAX metin ailesi, dönem başı ve sonu fonksiyonları, görsel hesaplama,
   ve mevcut derslere kısa köprüler: ERP ve veri tabanı kaynakları, SSIS ile ADF ve data mart, Tableau ve Qlik, Copilot ile model özeti.
   Kaynaklar Kasım 2026'da Microsoft Learn'den denetlendi. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };
const app = (id, html) => { const l = L.find(x => x.id === id); if (l) l.body += html; }; // tests/mval.js varlığını denetler
const S = (op, cols, x) => Object.assign({ op, cols: cols || [] }, x || {});

/* ---------- Pivot, Unpivot, Transpose ---------- */
add('pq-menu-2', {
  id: 'pq-pivot-devrik', lv: 'B1', mod: 'Veri Hazırlama', min: 16,
  title: 'Pivot, Unpivot ve Transpose: tablonun yönünü değiştirmek',
  sum: 'PL-300 maddesi “Pivot, unpivot, and transpose”: üçünün farkı, Diğer ve Seçili sütunlar, toplama işlevi, sütun adını korumak, hangisi model için doğru.',
  body: `<h2>Üç komut, üç farklı dönüş</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Komut</th><th>Ne yapar</th><th>Önce</th><th>Sonra</th></tr></thead><tbody>
<tr><td><b>Unpivot</b></td><td>Sütunları satıra çevirir: genişten uzuna</td><td>Kategori | Oca | Şub</td><td>Kategori | Ay | Hedef</td></tr>
<tr><td><b>Pivot sütunu</b></td><td>Bir sütunun değerlerini başlık yapar: uzundan genişe</td><td>Bölge | Ay | Tutar</td><td>Bölge | Oca | Şub | Mar</td></tr>
<tr><td><b>Transpose</b></td><td>Tabloyu çevirir: her satır sütun, her sütun satır olur</td><td>Satır başlıkları solda</td><td>Column1, Column2, ...</td></tr>
</tbody></table></div>
<p>Yıldız şemada olgu tablosu uzun olur: ay bir sütundur, ölçü bir sütundur. Unpivot bu yüzden Pivot’tan çok daha sık kullanılır. Pivot’u sunum için ya da satır başına bir nesne gerektiğinde (örneğin her müşteri için tek satır, anahtar ve değer çiftlerinden gelen veri) kullan.</p>
<h2>Unpivot: Diğer mi, Seçili mi?</h2>
<p>Üç seçenek var. <b>Unpivot Columns</b> ve <b>Unpivot Other Columns</b> kodda sütunu farklı adlandırır:</p>
<pre class="m" data-run>Table.UnpivotOtherColumns(Hedefler, {"Kategori"}, "Ay", "Hedef")</pre>
<pre class="m" data-run>Table.Unpivot(Hedefler, {"Oca", "Şub"}, "Ay", "Hedef")</pre>
<p>İlki yalnız sabit kalacak sütunu yazar; yeni ay gelince o da satıra döner. İkincisi dönecek sütunları yazar; yeni ay sütun olarak kalır. Aylık büyüyen dosyada <b>Other Columns</b> doğrudur. <b>Unpivot Only Selected</b> ise yeni sütun hiç gelmesin istediğin dosyalarda doğrudur. null hücreler satır üretmez: Giyim’in Mart’ı yok, sonuçta o satır da yoktur.</p>
<h2>Pivot: değer listesi ve toplama</h2>
<p>Pivot sütunu kutusu değer sütununu ve <b>toplama işlevini</b> sorar. Learn’deki iki durum:</p>
<pre class="m" data-run>Table.Pivot(
    Table.FromRecords({
        [key = "x", attribute = "a", value = 1],
        [key = "x", attribute = "c", value = 3],
        [key = "x", attribute = "c", value = 5],
        [key = "y", attribute = "a", value = 2]
    }),
    {"a", "b", "c"}, "attribute", "value", List.Max
)</pre>
<p>Toplama işlevini silersen, “x ve c” kesişimine iki değer düştüğü için o hücre hata olur. Kesişimi olmayan hücreler null gelir. Şerit değer listesini <code>List.Distinct(t[Ay])</code> diye yazar; yenilemede yeni ay yeni sütun demektir. Bu modelin sütun yapısını değiştirir, bu yüzden model tablosunda pivot riskli, son sunum adımında daha güvenlidir.</p>
<div class="warn"><b>Metin dışı başlık</b>Pivot edilen sütun metin olmalı: sütun adları metindir. Sayı ya da tarih sütununu Pivot’tan önce metne çevir; şerit bunu kendisi ekler.</div>
<h2>Transpose: başlık kaybolur</h2>
<p>Transpose sütun adlarını siler. Korumak için önce <b>Use headers as first row</b> (Başlıkları ilk satıra indir), sonra Transpose, sonra <b>Use first row as headers</b>:</p>
<pre class="m" data-run>let
    Indir = Table.DemoteHeaders(Hedefler),
    Cevir = Table.Transpose(Indir),
    Basliklar = Table.PromoteHeaders(Cevir)
in
    Basliklar</pre>
<p>Sonuçta her kategori bir sütun, her ay bir satır olur. Transpose genellikle Excel’deki yan yatık özet tablolarını düzeltmek içindir. Çift başlıklı tablo gibi işlerde Unpivot ile birlikte kullanılır.</p>`,
  ex: [
    { t: 'pq', src: 'hedef', pre: [], sol: [S('unpivot', ['Kategori']), S('rename', ['Öznitelik'], { to: 'Ay' }), S('rename', ['Değer'], { to: 'Hedef' }), S('filter', ['Hedef'], { cmp: '>', v: '20000' })], q: '<b>Uzun tablo ve filtre.</b> <code>Kategori</code>’yi seç, Diğer sütunların özetini kaldır. Yeni sütunları <code>Ay</code> ve <code>Hedef</code> diye adlandır. <code>Hedef</code> 20000’den büyük satırları tut.', hint: 'Sıra: Diğer sütunların özetini kaldır, iki yeniden adlandırma, filtre.' },
    { t: 'pq', src: 'hedef', pre: [], sol: [S('unpivotSel', ['Oca', 'Şub'])], q: '<b>Seçili unpivot.</b> Yalnız <code>Oca</code> ve <code>Şub</code> satıra dönsün, <code>Mar</code> sütun olarak kalsın. Dönüştür sekmesinde “Unpivot only selected columns”.', hint: 'Çoklu sütun seçimini aç, iki başlığa tıkla.' },
    { t: 'pq', src: 'aylik', pre: [], sol: [S('pivot', ['Ay'], { val: 'Tutar', agg: 'max' }), S('sort', ['Bölge'], { order: 'asc' })], q: '<b>Pivot ve sırala.</b> <code>Ay</code>’ı Pivot sütunu ile başlık yap (değer <code>Tutar</code>, toplama En büyük). Sonra <code>Bölge</code>’ye göre artan sırala.', hint: 'Ay başlığına tıkla, Dönüştür, Pivot sütunu.' },
    { t: 'pq', src: 'hedef', pre: [], sol: [S('demote'), S('transpose'), S('promote')], q: '<b>Adları koruyarak devrik.</b> Sütun adlarını ilk satıra indir, Transpose al, sonra ilk satırı başlık yap. Her kategori bir sütun olsun.', hint: 'Use headers as first row, Transpose, İlk satırı üst bilgi olarak kullan.' },
    { t: 'mcode', q: '<b>Pivot yaz.</b> <code>Satislar</code>’ı önce <code>Şehir</code> ve <code>Kategori</code> sütunlarına indir, <code>Tutar</code> da kalsın. Sonra <code>Kategori</code> değerleri sütun olsun, toplama <code>List.Sum</code>.', start: 'Table.SelectColumns(Satislar, {"Şehir", "Kategori", "Tutar"})', sol: 'let\n    T = Table.SelectColumns(Satislar, {"Şehir", "Kategori", "Tutar"})\nin\n    Table.Pivot(T, List.Distinct(T[Kategori]), "Kategori", "Tutar", List.Sum)', must: ['Table.Pivot', 'List.Sum'], hint: 'SiparisNo gibi tekil bir sütun kalırsa her satır ayrı kalır; bu yüzden önce sütunları indir.' },
    { t: 'mcode', q: '<b>Hatayı bul.</b> Aylar sabit yazılmış, Mar sonuçta yok. Değer listesini veriden üret.', start: 'Table.Pivot(Aylik_Satis, {"Oca", "Şub"}, "Ay", "Tutar")', sol: 'Table.Pivot(Aylik_Satis, List.Distinct(Aylik_Satis[Ay]), "Ay", "Tutar")', must: ['List.Distinct'], hint: 'List.Distinct(t[Ay]) şeridin de yazdığı biçimdir.', ordered: true },
    { t: 'mcode', q: '<b>Unpivot ve yeniden Pivot.</b> <code>Hedefler</code>’i uzun yap (<code>Ay</code>, <code>Hedef</code>), sonra <code>Ay</code>’ı satır, <code>Kategori</code>’yi sütun olacak biçimde çevir. Bu, Transpose’un adları koruyan hâlidir.', sol: 'let\n    Uzun = Table.UnpivotOtherColumns(Hedefler, {"Kategori"}, "Ay", "Hedef")\nin\n    Table.Pivot(Uzun, List.Distinct(Uzun[Kategori]), "Kategori", "Hedef", List.Sum)', must: ['Table.UnpivotOtherColumns', 'Table.Pivot'], start: 'Hedefler', hint: 'Giyim’in Mart’ı önceki adımda düştüğü için sonuçta null olur.' },
    { t: 'mc', q: 'Her ay yeni bir sütunla büyüyen bütçe dosyasında aşağıdakilerden hangisi yenilemede yeni ayı da alır?', o: ['Table.Unpivot(t, {"Oca", "Şub"}, "Ay", "T")', 'Table.Pivot(t, {"Oca"}, "Ay", "T")', 'Table.UnpivotOtherColumns(t, {"Kategori"}, "Ay", "T")', 'Table.Transpose(t)'], a: 2, why: 'Other Columns sabit sütunu adlandırır, gerisini her seferinde hesaplar.' },
    { t: 'mc', q: 'Transpose’tan sonra sütunların adı ne olur?', o: ['Eski adlar korunur', 'Column1, Column2, ...', 'İlk satır başlık olur', 'Satır numaraları'], a: 1, why: 'Learn’deki örnekte de sonuç Column1, Column2, Column3’tür. Adları korumak için önce başlıkları indir.' },
    { t: 'mc', q: 'Yıldız şemada olgu tablosu için normalde hangisi hedeflenir?', o: ['Uzun biçim', 'Geniş biçim: her ay bir sütun', 'Transpose edilmiş biçim', 'Her kategori için ayrı tablo'], a: 0, why: 'Uzun tabloda ay, Tarih boyutuna bağlanır; ölçüler tek sütundan toplanır. Geniş biçim yeni ayda modeli değiştirir.' }
  ]
});

/* ---------- Komutları uygulama ---------- */
add('pq-pivot-devrik', {
  id: 'pq-uygulama', lv: 'B1', mod: 'Veri Hazırlama', min: 12,
  title: 'Power Query komutları uygulama: satır, sütun, ayıklama, örnekten sütun',
  sum: 'Üst, alt, aralık, yinelenen satır tutma; alt satır kaldırma; sırala, yukarı doldur, seçili unpivot; ayıkla, önek, sonek, sütun birleştir, gün farkı, Column from Examples: Lab’de elle.',
  body: `<p>Menü haritasındaki komutları burada elinle çalıştırıyorsun. Her görevde Lab hedef tabloyla karşılaştırır, ürettiğin M’yi de gösterir. Yanlış adımı Uygulanan adımlardan silebilir, önceki adıma dönüp önizleme alabilirsin.</p>
<h2>Satır tutmak ve kaldırmak</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Durum</th><th>Komut</th><th>M</th></tr></thead><tbody>
<tr><td>Rapor dosyasının altında Genel Toplam satırı var</td><td>Remove bottom rows</td><td><code>Table.RemoveLastN(t, 1)</code></td></tr>
<tr><td>Yalnız son 3 kayıt lazım</td><td>Keep bottom rows</td><td><code>Table.LastN(t, 3)</code></td></tr>
<tr><td>Belirli aralık</td><td>Keep range of rows</td><td><code>Table.Range(t, 2, 5)</code>: M’de konum 0’dan başlar</td></tr>
<tr><td>Anahtarda yinelenen var mı?</td><td>Keep duplicates</td><td>Gruplayıp <code>Table.Join</code> yapan uzun bir adım</td></tr>
<tr><td>Her ikinci satır gereksiz</td><td>Remove alternate rows</td><td><code>Table.AlternateRows(t, 1, 1, 1)</code></td></tr>
</tbody></table></div>
<h2>Metin ve sütun</h2>
<p>Dönüştür sekmesindeki <b>Extract</b> (Ayıkla) ve <b>Add prefix / suffix</b> sütunu yerinde değiştirir. Sütun ekle sekmesindeki eşi aslı korur. <b>Merge columns</b> da iki sekmede var; biri asılları siler, öteki tutar.</p>
<h2>Column from Examples</h2>
<p>Learn’e göre bir örnek yazarsın, Power BI dönüşümü bulur, gerekirse başka satırı düzeltirsin. Lab’deki komut küçük bir benzetimdir: kopya, harf durumu, baştan ve sondan parça, sınırlayıcı, uzunluk, tarih parçası kurallarını dener. Gerçek özelliğin kapsamı çok daha geniştir (koşullu sütun, aralık, tarih hesapları). Birden çok kural uyabileceği için ikinci örnek vermek ve M’yi okumak iki yerde de iyi alışkanlıktır.</p>
<h2>Gün çıkarma</h2>
<p>Tarih eksi tarih, M’de süre (duration) üretir. Sayı için <code>Duration.Days</code> gerekir. Şeritte tarih sütunları seçilip <b>Sütun ekle → Tarih → Gün Çıkarma</b> aynı kodu yazar. Türkçe komut adını Learn’de doğrulayamadık; İngilizcesi <b>Subtract Days</b>.</p>`,
  ex: [
    { t: 'pq', src: 'satis', pre: [], sol: [S('removeBottom', [], { n: 1 })], q: '<b>Alt satır.</b> Son satırın tutarı boş ve dosyada sonradan eklenmiş. Remove bottom rows ile son satırı kaldır.', hint: 'Giriş sekmesi, Satırları kaldır grubu.' },
    { t: 'pq', src: 'satis', pre: [], sol: [S('keepBottom', [], { n: 3 })], q: '<b>Son kayıtlar.</b> Yalnız son 3 satırı tut.', hint: 'Satırları tut grubu.' },
    { t: 'pq', src: 'satis', pre: [], sol: [S('keepRange', [], { first: 4, n: 3 })], q: '<b>Aralık.</b> 4. satırdan başlayarak 3 satır tut.', hint: 'İlk satır 1’den sayılır; üretilen M 3 yazacak.' },
    { t: 'pq', src: 'musteri', pre: [S('promote')], sol: [S('keepDups', ['MusteriNo'])], q: '<b>Yinelenen anahtar.</b> Müşteri listesinde <code>MusteriNo</code>’su birden çok kez geçen satırları tut. Temiz anahtarda sonuç boş olurdu.', hint: 'MusteriNo’yu seç, Satırları tut grubunda Keep duplicates.' },
    { t: 'pq', src: 'urun', pre: [], sol: [S('fillUp', ['Kategori'])], q: '<b>Yukarı doldur.</b> <code>Kategori</code> sütunundaki null’ları alttaki değerle doldur. Sonra hangi satırların hâlâ null kaldığına bak: ilk gruptan sonrası yanlış kategori alıyor. Bu dosya aslında Aşağı doldur ister; fark görmek için dene.', hint: 'Dönüştür sekmesi, Fill up.' },
    { t: 'pq', src: 'urun', pre: [S('fillDown', ['Kategori'])], sol: [S('extract', ['Ürün Kodu ve Adı'], { what: 'first', n: '3' }), S('prefix', ['Ürün Kodu ve Adı'], { mode: 'pre', x: 'TR-' }), S('rename', ['Ürün Kodu ve Adı'], { to: 'Kod' })], q: '<b>Ayıkla ve önek.</b> <code>Ürün Kodu ve Adı</code> sütununu ilk 3 karakterine indir (Extract), başına <code>TR-</code> öneki ekle, sütunun adını <code>Kod</code> yap.', hint: 'Dönüştür sekmesi, Biçim grubu.' },
    { t: 'pq', src: 'satis', pre: [], sol: [S('mergeCols', ['Şehir', 'Kategori'], { name: 'Etiket', d: ' / ' }), S('prefix', ['Etiket'], { mode: 'suf', x: ' (2024)' })], q: '<b>Birleştir ve sonek.</b> <code>Şehir</code> ve <code>Kategori</code>’yi <code>" / "</code> ile <code>Etiket</code> sütununda birleştir (Sütun ekle), <code>Etiket</code>’in sonuna <code>" (2024)"</code> ekle.', hint: 'Çoklu sütun seçimini aç. Merge columns Sütun ekle sekmesinde, Metinden grubunda.' },
    { t: 'pq', src: 'satis', pre: [], sol: [S('dateSub', ['Tarih'], { ref: '31.03.2024', name: 'Kalan Gün' })], q: '<b>Gün farkı.</b> <code>Tarih</code>’ten çeyrek sonuna (31.03.2024) kaç gün kaldığını <code>Kalan Gün</code> sütununda hesapla.', hint: 'Sütun ekle, Tarihten grubu, Subtract days.' },
    { t: 'pq', src: 'urun', pre: [], sol: [S('fromEx', ['Ürün Kodu ve Adı'], { ex1: 'E01', ex2: 'E02', name: 'Kod' })], q: '<b>Örneklerden sütun.</b> <code>Ürün Kodu ve Adı</code> seçiliyken Column from Examples aç. İlk satır için <code>E01</code>, ikinci satır için <code>E02</code> yaz, sütun adı <code>Kod</code>. Üretilen M’yi Gelişmiş Düzenleyici’de oku.', hint: 'Sütun ekle, Genel grubu. Kural “ilk boşluktan önce” ya da “ilk 3 karakter” olabilir: ikisi de bu veride aynı sonucu verir.' },
    { t: 'pq', src: 'satis', pre: [], sol: [S('addCustom', [], { name: 'Birim', expr: '[Tutar] / [Adet]', to: 'number' }), S('addCond', ['Birim'], { name: 'Sınıf', cmp: '>=', v: '1000', then: 'Pahalı', els: 'Normal' }), S('addIndex', [], { name: 'Sıra', start: 1, step: 1 })], q: '<b>Üçlü.</b> <code>Birim</code> özel sütunu: <code>[Tutar] / [Adet]</code>, tür Ondalık sayı. <code>Birim</code> üzerinde <code>Sınıf</code> koşullu sütunu: 1000 ve üstü Pahalı, değilse Normal. Son olarak 1’den başlayan <code>Sıra</code> dizini.', hint: 'Son satırda tutar null: Birim null, if null hata verir. Hedefte o hücre Error’dur, hücre hatası satırı silmez. Sonra düzeltmesi: try ya da null sınaması.' },
    { t: 'pq', src: 'satis', pre: [], sol: [S('dupCol', ['Şehir']), S('upper', ['Şehir - Kopya']), S('numOp', ['Tutar'], { what: 'pct', v: '18', name: 'Yüzde 18' }), S('numOp', ['Adet'], { what: 'mul', v: '2', name: 'Çift Adet' })], q: '<b>Kopya ve sayı işlemi.</b> <code>Şehir</code> sütununu çoğalt (Duplicate column), kopyayı BÜYÜK harfe çevir. Sonra Sayı işlemi ile <code>Tutar</code>’ın yüzde 18’ini <code>Yüzde 18</code> sütununda, <code>Adet</code>’in 2 katını <code>Çift Adet</code> sütununda hesapla.', hint: 'Sayı işlemi Sütun ekle sekmesinde Sayıdan grubunda: Yüzdesi ve Çarp.' },
    { t: 'mc', q: 'Rapor dosyasının altında bazen 1, bazen 3 toplam satırı var. Sabit sayılı Remove bottom rows neden riskli?', o: ['Üstteki satırları da sessizce siler', 'Sayı değişince yanlış satır gider', 'M’de karşılığı yoktur', 'Yalnız Excel kaynağında çalışır'], a: 1, why: 'Table.RemoveLastN koşul da alabilir: each [Kategori] = "Toplam". Learn de sabit sayıyı yalnız sabit dip toplamlar için önerir.' },
    { t: 'mc', q: 'Keep duplicates sonucu boş geldiyse bu bize ne söyler?', o: ['Yinelenen yok', 'Komut başarısız oldu', 'Sütun boş', 'Tür yanlış'], a: 0, why: 'Komut yalnız birden çok geçen değerlerin satırlarını tutar. Boş sonuç, anahtar adayının temiz olduğunu gösterir.' }
  ]
});

/* ---------- M işlev alıştırmaları ---------- */
add('m-liste-metin', {
  id: 'm-islev-pratik', lv: 'B2', mod: 'Veri Hazırlama', min: 10,
  title: 'M işlevleri alıştırması: Text, List, Record, Date',
  sum: 'Sık kullanılan M işlevlerini kısa görevlerle yazmak: Text.Contains, Text.Remove, List.Sort, List.Max, Record.AddField, Record.ToTable, Table.Profile, M ile takvim.',
  body: `<p>Bu ders neredeyse tamamen koddur. Learn’deki işlev başvuruları: <code>Text.*</code>, <code>List.*</code>, <code>Record.*</code>, <code>Date.*</code>. Takıldığında sonucun türüne bak: bu görevlerin çoğu tablo değil, liste, kayıt ya da tek değer döndürür.</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Aile</th><th>Bu derste</th></tr></thead><tbody>
<tr><td>Text</td><td>Contains, StartsWith, EndsWith, Remove, Select, PadStart, Combine, Length</td></tr>
<tr><td>List</td><td>Max, Min, Average, Sort, Distinct, PositionOf, RemoveNulls, Union, Zip, Reverse</td></tr>
<tr><td>Record</td><td>FieldNames, HasFields, AddField, RemoveFields, SelectFields, TransformFields, ToTable, Combine</td></tr>
<tr><td>Date</td><td>AddDays, AddMonths, StartOfMonth, EndOfMonth, DayOfWeek, ToText, List.Dates</td></tr>
</tbody></table></div>
<h2>Record: kayıt üstünde çalışmak</h2>
<pre class="m" data-run>let
    R = [Ad = "Ayşe", Yas = 30],
    Eklendi = Record.AddField(R, "Sehir", "Bursa"),
    Sade = Record.RemoveFields(Eklendi, "Yas")
in
    [Adlar = Record.FieldNames(Sade), Var = Record.HasFields(Sade, "Ad"), Tablo = Record.ToTable(Sade)]</pre>
<h2>Table.Profile</h2>
<p>Görünüm sekmesindeki sütun profilinin kod karşılığı: her sütun için en küçük, en büyük, ortalama, standart sapma, sayım, null ve ayrı sayısı. Denetim sorgusu olarak yükleyebilirsin.</p>
<pre class="m" data-run>Table.Profile(Satislar)</pre>
<h2>Takvim: M ile</h2>
<p>PL-300’ün ortak tarih tablosu maddesi DAX ya da M ile yapılabilir. Veriye bağlı aralık kurmak için <code>List.Min</code> ve <code>List.Max</code> kullanılır:</p>
<pre class="m" data-run>let
    Bas = List.Min(Satislar[Tarih]),
    Son = List.Max(Satislar[Tarih]),
    Gun = Duration.Days(Son - Bas) + 1,
    T = Table.FromList(List.Dates(Bas, Gun, #duration(1, 0, 0, 0)), Splitter.SplitByNothing(), {"Tarih"}),
    Tipli = Table.TransformColumnTypes(T, {{"Tarih", type date}}),
    Yil = Table.AddColumn(Tipli, "Yıl", each Date.Year([Tarih]), Int64.Type),
    Ay = Table.AddColumn(Yil, "Ay", each Date.Month([Tarih]), Int64.Type)
in
    Table.FirstN(Ay, 5)</pre>`,
  ex: [
    { t: 'mcode', q: '<b>Text.Contains.</b> <code>Urun_Listesi</code>’nde adında <code>kamp</code> geçen satırları, harf büyüklüğüne bakmadan bul.', start: 'Table.SelectRows(Urun_Listesi, each Text.Contains([Ürün Kodu ve Adı], "kamp"))', sol: 'Table.SelectRows(Urun_Listesi, each Text.Contains([Ürün Kodu ve Adı], "kamp", Comparer.OrdinalIgnoreCase))', must: ['Text.Contains', 'Comparer.OrdinalIgnoreCase'], hint: 'Üçüncü bağımsız değişken karşılaştırıcıdır. Varsayılan büyük küçük harfe duyarlıdır.' },
    { t: 'mcode', q: '<b>StartsWith.</b> <code>Sehir_Bolge</code>’de adı <code>İ</code> ile başlayan şehirlerin listesini döndür.', sol: 'Table.SelectRows(Sehir_Bolge, each Text.StartsWith([Şehir], "İ"))[Şehir]', must: ['Text.StartsWith'], ordered: true, start: 'Sehir_Bolge', hint: 'Süz, [Şehir] ile sütunu liste al.' },
    { t: 'mcode', q: '<b>Temizle.</b> <code>"T-12 / 34.5"</code> metninden yalnız rakamları bırak: <code>Text.Select</code> ve <code>{"0".."9"}</code> yerine liste kullanarak.', sol: 'Text.Select("T-12 / 34.5", {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9"})', must: ['Text.Select'], start: '"T-12 / 34.5"', hint: 'İkinci bağımsız değişken izin verilen karakterlerin listesi.' },
    { t: 'mcode', q: '<b>PadStart.</b> <code>Satislar</code>’daki <code>Adet</code> değerlerini metne çevir, soldan sıfırla 3 haneye tamamla. Sonuç liste.', sol: 'List.Transform(Satislar[Adet], each Text.PadStart(Text.From(_), 3, "0"))', must: ['Text.PadStart'], ordered: true, start: 'Satislar[Adet]', hint: 'Önce Text.From.' },
    { t: 'mcode', q: '<b>List.Max ve null.</b> <code>Satislar[Tutar]</code> listesinden null’ları at, kaç öğe kaldığını ve en büyük, en küçük, ortalamayı kayıt olarak döndür: <code>[Adet, EnBuyuk, EnKucuk, Ortalama]</code>.', sol: 'let\n    L = List.RemoveNulls(Satislar[Tutar])\nin\n    [Adet = List.Count(L), EnBuyuk = List.Max(L), EnKucuk = List.Min(L), Ortalama = List.Average(L)]', must: ['List.RemoveNulls', 'List.Max', 'List.Average'], start: 'Satislar[Tutar]', hint: 'List.Max null’ları zaten atlar, ama List.Count saymaz değil, sayar: önce temizle.' },
    { t: 'mcode', q: '<b>List.Sort ve Distinct.</b> <code>Satislar[Şehir]</code>’den yinelenenleri at, azalan sırala.', sol: 'List.Sort(List.Distinct(Satislar[Şehir]), Order.Descending)', must: ['List.Sort', 'List.Distinct'], ordered: true, start: 'Satislar[Şehir]', hint: 'İkinci bağımsız değişken Order.Descending.' },
    { t: 'mcode', q: '<b>List.PositionOf.</b> <code>{"Oca", "Şub", "Mar"}</code> listesinde <code>"Mar"</code>’ın konumunu döndür.', sol: 'List.PositionOf({"Oca", "Şub", "Mar"}, "Mar")', must: ['List.PositionOf'], start: '{"Oca", "Şub", "Mar"}', hint: '0’dan başlar. Bulunmazsa -1.' },
    { t: 'mcode', q: '<b>List.Zip.</b> <code>{"A", "B"}</code> ile <code>{1, 2}</code> listelerini eşleştirip iki sütunlu tablo yap: <code>Kod</code>, <code>Deger</code>.', sol: 'Table.FromRows(List.Zip({{"A", "B"}, {1, 2}}), {"Kod", "Deger"})', must: ['List.Zip', 'Table.FromRows'], start: 'List.Zip({{"A", "B"}, {1, 2}})', hint: 'List.Zip satır listesi verir, Table.FromRows satırlardan tablo kurar.' },
    { t: 'mcode', q: '<b>Record.AddField.</b> <code>Satislar{0}</code> kaydına <code>KDV</code> alanı ekle (Tutar * 0.2), sonra yalnız <code>SiparisNo</code>, <code>Tutar</code>, <code>KDV</code> alanlarını seç.', sol: 'let\n    R = Satislar{0},\n    E = Record.AddField(R, "KDV", R[Tutar] * 0.2)\nin\n    Record.SelectFields(E, {"SiparisNo", "Tutar", "KDV"})', must: ['Record.AddField', 'Record.SelectFields'], start: 'Satislar{0}', hint: 'Önce alanı ekle, sonra seç.' },
    { t: 'mcode', q: '<b>Record.TransformFields.</b> <code>[Ad = "ayşe", Sehir = "bursa"]</code> kaydında iki alana da <code>Text.Proper</code> uygula, kültür <code>tr-TR</code>.', sol: 'Record.TransformFields([Ad = "ayşe", Sehir = "bursa"], {{"Ad", each Text.Proper(_, "tr-TR")}, {"Sehir", each Text.Proper(_, "tr-TR")}})', must: ['Record.TransformFields'], start: '[Ad = "ayşe", Sehir = "bursa"]', hint: 'Dönüşüm listesi: {{"Alan", fonksiyon}, ...}' },
    { t: 'mcode', q: '<b>Record.ToTable.</b> <code>Satislar{0}</code> kaydını Name ve Value sütunlu tabloya çevir, yalnız <code>Name</code> değeri <code>Şehir</code> ya da <code>Kategori</code> olan satırları tut.', sol: 'Table.SelectRows(Record.ToTable(Satislar{0}), each List.Contains({"Şehir", "Kategori"}, [Name]))', must: ['Record.ToTable'], start: 'Record.ToTable(Satislar{0})', hint: 'List.Contains ile iki değer.' },
    { t: 'mcode', q: '<b>Table.Profile.</b> <code>Satislar</code>’da null değeri olan sütunların adlarını profil tablosundan bul.', sol: 'Table.SelectRows(Table.Profile(Satislar), each [NullCount] > 0)[Column]', must: ['Table.Profile'], start: 'Table.Profile(Satislar)', hint: 'NullCount sütununa bak, [Column] ile listele.' },
    { t: 'mcode', q: '<b>M ile takvim.</b> <code>Satislar</code>’daki ilk tarihten son tarihe uzanan tablo kur: <code>Tarih</code> (tarih), <code>Yıl</code>, <code>Çeyrek</code>. Satır sayısı toplam gün olacak.', sol: 'let\n    Bas = List.Min(Satislar[Tarih]),\n    Son = List.Max(Satislar[Tarih]),\n    T = Table.FromList(List.Dates(Bas, Duration.Days(Son - Bas) + 1, #duration(1, 0, 0, 0)), Splitter.SplitByNothing(), {"Tarih"}),\n    Tipli = Table.TransformColumnTypes(T, {{"Tarih", type date}}),\n    Y = Table.AddColumn(Tipli, "Yıl", each Date.Year([Tarih]), Int64.Type)\nin\n    Table.AddColumn(Y, "Çeyrek", each Date.QuarterOfYear([Tarih]), Int64.Type)', must: ['List.Dates', 'List.Min', 'Date.QuarterOfYear'], types: true, ordered: true, start: 'List.Min(Satislar[Tarih])', hint: 'Son - Bas süredir. Duration.Days + 1 gün sayısı.' },
    { t: 'mcode', q: '<b>Date.ToText.</b> <code>Date.AddMonths(#date(2024, 1, 31), 1)</code> sonucunu <code>"2024-02-29"</code> biçiminde metne çevir.', sol: 'Date.ToText(Date.AddMonths(#date(2024, 1, 31), 1), "yyyy-MM-dd")', must: ['Date.ToText', 'Date.AddMonths'], start: 'Date.AddMonths(#date(2024, 1, 31), 1)', hint: 'Biçim metni büyük küçük harfe duyarlıdır: MM ay, mm dakika.' },
    { t: 'mcode', q: '<b>JSON çözümle.</b> <code>"{""sehir"": ""Ankara"", ""adet"": 4}"</code> metnini <code>Json.Document</code> ile kayda çevir, <code>adet</code> alanını döndür. Şeritte bu komut Parse (Çözümle) adıyla geçer.', sol: 'Json.Document("{""sehir"": ""Ankara"", ""adet"": 4}")[adet]', must: ['Json.Document'], start: '"{""sehir"": ""Ankara"", ""adet"": 4}"', hint: 'M metninde tırnak "" ile yazılır.' },
    { t: 'mcode', q: '<b>Değerleri ayıkla.</b> <code>T</code> tablosundaki liste sütununu Extract Values gibi birleştir: virgülle metin yap, sütun adı aynı kalsın.', start: 'let\n    T = #table({"Kod", "Etiket"}, {{"A", {"x", "y"}}, {"B", {"z"}}})\nin\n    T', sol: 'let\n    T = #table({"Kod", "Etiket"}, {{"A", {"x", "y"}}, {"B", {"z"}}})\nin\n    Table.TransformColumns(T, {{"Etiket", each Text.Combine(_, ","), type text}})', must: ['Table.TransformColumns', 'Text.Combine'], hint: 'Hücreye liste gelir, Text.Combine birleştirir.' },
    { t: 'mc', q: 'Sonuç nedir?<pre class="m">Text.Contains("Ankara", "ANK")</pre>', o: ['true', 'false', 'null', 'Hata'], a: 1, why: 'Varsayılan karşılaştırma büyük küçük harfe duyarlıdır. Comparer.OrdinalIgnoreCase ile true olur.' },
    { t: 'mc', q: '<code>List.Average({1, null, 3})</code> kaç verir?', o: ['2', '1,33', 'null', 'Hata'], a: 0, why: 'null değerler sayılmaz. (1 + 3) / 2 = 2. Aynı kural DAX AVERAGE’da da BLANK için geçerlidir.' },
    { t: 'mc', q: '<code>Record.HasFields([a = 1], {"a", "b"})</code> sonucu?', o: ['true', 'false', '{true, false}', 'Hata'], a: 1, why: 'Listedeki tüm alanlar olmalı; b yok.' }
  ]
});

/* ---------- DAX metin ailesi ---------- */
const T1 = [{ t: 'Kategoriler', c: 'Kategori' }];
add('dax-tarih-metin', {
  id: 'dax-metin-pratik', lv: 'A2', mod: 'DAX Temelleri', min: 10,
  title: 'DAX metin fonksiyonları: LEFT, MID, SEARCH, SUBSTITUTE, VALUE alıştırmaları',
  sum: 'Metin ailesini kod yazarak pekiştirmek: LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER, SEARCH, FIND, SUBSTITUTE, REPLACE, VALUE, CONTAINSSTRING.',
  body: `<h2>Nerede lazım olur?</h2><p>Metin temizliği çoğu modelde Power Query’de biter. DAX’taki metin fonksiyonları şu üç yerde karşına çıkar: rapor anına bağlı etiket ölçüleri (Mart 2024 başlığı gibi), filtre koşulları (adında “kablosuz” geçen ürünler) ve bazen hesaplanmış sütunlar. Burada her fonksiyonu gerçek bir görevde yazıyorsun. Çıktıyı görmek için görevlerin bir kısmı EVALUATE sorgusudur: sonuç doğrudan tablo olarak gelir.</p><h2>Aile</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fonksiyon</th><th>Örnek</th><th>Dikkat</th></tr></thead><tbody>
<tr><td><code>LEFT, RIGHT, MID</code></td><td><code>LEFT("Ankara", 3)</code></td><td>MID konumu 1’den başlar; M’de 0’dan başlar.</td></tr>
<tr><td><code>LEN, TRIM</code></td><td><code>LEN(TRIM(x))</code></td><td>TRIM aradaki çoklu boşluğu da teke indirir.</td></tr>
<tr><td><code>UPPER, LOWER</code></td><td><code>UPPER("istanbul")</code></td><td>Sonuç sistem kültürüne bağlıdır; Türkçe İ ve I’ya dikkat.</td></tr>
<tr><td><code>SEARCH, FIND</code></td><td><code>SEARCH("@", x)</code></td><td>SEARCH harf duyarsız, FIND duyarlı. Bulamazsa hata; dördüncü bağımsız değişken yedek değer.</td></tr>
<tr><td><code>SUBSTITUTE, REPLACE</code></td><td><code>SUBSTITUTE(x, "-", " ")</code></td><td>SUBSTITUTE metne bakar, REPLACE konuma bakar.</td></tr>
<tr><td><code>VALUE</code></td><td><code>VALUE("2024")</code></td><td>Sayıya çeviremezse hata.</td></tr>
<tr><td><code>CONTAINSSTRING</code></td><td><code>CONTAINSSTRING(x, "kablosuz")</code></td><td>Harf duyarsız, joker destekler. Duyarlısı CONTAINSSTRINGEXACT.</td></tr>
</tbody></table></div>
<h2>Üç sık hata</h2><ul><li><b>Bulunamayan metin:</b> SEARCH ve FIND bulamayınca hata verir. Boş ya da eksik veride dördüncü bağımsız değişkeni ver: <code>SEARCH("@", x, 1, 0)</code>.</li><li><b>Sayı gibi görünen metin:</b> <code>"2024" + 1</code> DAX’ta örtük çevrilir, ama “2024-Ç1” hata verir. Niyetini VALUE ile açık yaz.</li><li><b>Sıra sütunu:</b> Metin ay adları alfabetik sıralanır. Sıra için Sütuna göre sırala gerekir, metin fonksiyonu değil.</li></ul><div class="tip"><b>Neyi nerede yap?</b>Sütunda kalıcı temizlik Power Query’nin işidir. DAX metin fonksiyonlarını ölçü başlığı ve dinamik etiket gibi rapor anına bağlı işlere sakla.</div>`,
  ex: [
    { t: 'dax', name: 'Uzun Adlı Ürün', q: '<b>Uzun Adlı Ürün</b>: Adı 15 karakterden uzun olan ürün sayısı. LEN kullan.', sol: 'COUNTROWS(FILTER(Urunler, LEN(Urunler[Urun]) > 15))', hint: 'COUNTROWS(FILTER(Urunler, LEN(Urunler[Urun]) > 15))', grid: T1 },
    { t: 'query', q: '<b>Kısa kod.</b> Her ürün için <code>Urun</code> ve ilk 3 harfini büyük harfle veren <code>Kod</code> sütunu: EVALUATE ile.', start: 'EVALUATE\nSELECTCOLUMNS(Urunler, "Urun", Urunler[Urun], "Kod", )', sol: 'EVALUATE\nSELECTCOLUMNS(Urunler, "Urun", Urunler[Urun], "Kod", UPPER(LEFT(Urunler[Urun], 3)))', hint: 'UPPER(LEFT(...))' },
    { t: 'query', q: '<b>E-posta alanı.</b> Çalışanların <code>AdSoyad</code> ve e-postanın <code>@</code> sonrasını veren <code>Alan</code> sütunu.', start: 'EVALUATE\nSELECTCOLUMNS(Calisanlar, "AdSoyad", Calisanlar[AdSoyad], "Alan", )', sol: 'EVALUATE\nSELECTCOLUMNS(Calisanlar, "AdSoyad", Calisanlar[AdSoyad], "Alan", MID(Calisanlar[Eposta], SEARCH("@", Calisanlar[Eposta], 1, 0) + 1, 100))', hint: 'MID(metin, başlangıç, uzunluk). Başlangıç SEARCH + 1. E-postası boş çalışan olabilir: SEARCH için dördüncü bağımsız değişken 0.' },
    { t: 'query', q: '<b>Ad.</b> <code>AdSoyad</code>’dan ilk boşluğa kadarki parçayı veren <code>Ad</code> sütunu.', start: 'EVALUATE\nSELECTCOLUMNS(Calisanlar, "Ad", )', sol: 'EVALUATE\nSELECTCOLUMNS(Calisanlar, "Ad", LEFT(Calisanlar[AdSoyad], SEARCH(" ", Calisanlar[AdSoyad]) - 1))', hint: 'LEFT ile SEARCH birlikte. Boşluğu sayma: - 1.' },
    { t: 'query', q: '<b>Ay numarası.</b> Tarih tablosundan ayrı <code>YilAy</code> değerleri ve son iki karakteri veren <code>AyNo</code> sütunu. RIGHT kullan.', start: 'EVALUATE\nSELECTCOLUMNS(VALUES(Tarih[YilAy]), "YilAy", Tarih[YilAy], "AyNo", )', sol: 'EVALUATE\nSELECTCOLUMNS(VALUES(Tarih[YilAy]), "YilAy", Tarih[YilAy], "AyNo", RIGHT(Tarih[YilAy], 2))', hint: 'RIGHT(metin, 2)' },
    { t: 'dax', name: 'En Son Yıl Metinden', q: '<b>En Son Yıl Metinden</b>: <code>Tarih[YilAy]</code> metninin ilk 4 karakterini sayıya çevir, en büyüğünü döndür. VALUE kullan.', sol: 'MAXX(VALUES(Tarih[YilAy]), VALUE(LEFT(Tarih[YilAy], 4)))', hint: 'MAXX(VALUES(...), VALUE(LEFT(...)))', grid: [{ t: 'Tarih', c: 'Yil' }] },
    { t: 'query', q: '<b>SUBSTITUTE.</b> <code>Tarih[YilCeyrek]</code> ayrı değerlerinde tireyi boşluğa çevirip <code>Etiket</code> sütunu üret.', start: 'EVALUATE\nSELECTCOLUMNS(VALUES(Tarih[YilCeyrek]), "Etiket", )', sol: 'EVALUATE\nSELECTCOLUMNS(VALUES(Tarih[YilCeyrek]), "Etiket", SUBSTITUTE(Tarih[YilCeyrek], "-", " "))', hint: 'SUBSTITUTE(metin, eski, yeni)' },
    { t: 'query', q: '<b>REPLACE.</b> <code>Tarih[YilAy]</code> değerlerinin ilk iki karakterini sil: 2024-03 → 24-03. Sütun adı <code>Kisa</code>.', start: 'EVALUATE\nSELECTCOLUMNS(VALUES(Tarih[YilAy]), "Kisa", )', sol: 'EVALUATE\nSELECTCOLUMNS(VALUES(Tarih[YilAy]), "Kisa", REPLACE(Tarih[YilAy], 1, 2, ""))', hint: 'REPLACE(metin, konum, uzunluk, yeni). Konum 1’den başlar.' },
    { t: 'dax', name: 'Kablosuz Ürün', q: '<b>Kablosuz Ürün</b>: Adında <code>kablosuz</code> geçen ürün sayısı, harf büyüklüğünden bağımsız.', sol: 'COUNTROWS(FILTER(Urunler, CONTAINSSTRING(Urunler[Urun], "kablosuz")))', hint: 'CONTAINSSTRING harf duyarsızdır.', grid: T1 },
    { t: 'dax', name: 'Ankara Müşteri', q: '<b>Ankara Müşteri</b>: Şehri, kırpılıp küçük harfe çevrildiğinde <code>ankara</code> olan müşteri sayısı. TRIM ve LOWER kullan.', sol: 'COUNTROWS(FILTER(Musteriler, LOWER(TRIM(Musteriler[Sehir])) = "ankara"))', hint: 'FILTER içinde LOWER(TRIM(...)).', grid: [{ t: 'Musteriler', c: 'Segment' }] },
    { t: 'mc', q: '<code>SEARCH("z", "Ankara")</code> ne döndürür?', o: ['0', 'BLANK', 'Hata', '-1'], a: 2, why: 'Bulunamazsa hata verir. SEARCH("z", "Ankara", 1, 0) ile yedek değer verilir.' },
    { t: 'mc', q: 'DAX MID ile M Text.Middle arasındaki en önemli fark hangisi?', o: ['Fark yok', 'Başlangıç konumu: DAX 1’den, M 0’dan', 'MID yalnız sayı alır', 'M sürümü her zaman büyük harf döndürür'], a: 1, why: 'Karıştırılan yer budur. Text.Middle("Ankara", 0, 3) ile MID("Ankara", 1, 3) aynı sonucu verir.' },
    { t: 'mc', q: 'Rapordaki ürün adlarında kalıcı boşluk temizliği için doğru yer?', o: ['Power Query’de Trim', 'Her ölçüde TRIM', 'Hesaplanmış sütunda', 'Görsel başlığında'], a: 0, why: 'Kalıcı temizlik kaynağa yakın yapılır: bir kez, modele girmeden önce.' }
  ]
});

/* ---------- Dönem başı ve sonu ---------- */
const Y = [{ t: 'Tarih', c: 'Yil' }], AY = [{ t: 'Tarih', c: 'YilAy' }];
add('zaman', {
  id: 'zaman-donem', lv: 'B2', mod: 'Zaman Zekâsı', min: 12,
  title: 'Dönem fonksiyonları: DATESMTD, DATESQTD, STARTOF, ENDOF, OPENING ve CLOSINGBALANCE',
  sum: 'Ay ve çeyrek başından bugüne tarih kümesi, dönemin ilk ve son günü, stok gibi yarı toplanabilir değerler için açılış ve kapanış bakiyesi.',
  body: `<h2>Aile</h2><p><code>DATESYTD</code> ve <code>TOTALYTD</code> önceki derste geçti. Bu kısa derste kardeşlerini yazıyoruz; hepsi Tarih tablosunun işaretli ve kesintisiz olmasını ister. Tarih fonksiyonlarını CALCULATE içinde filtre olarak kullanırsın: fonksiyon, bağlamdaki son tarihe göre yeni bir tarih kümesi üretir. Bu yüzden görselde hangi düzeyde (gün, ay, yıl) durduğun sonucu belirler.</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Fonksiyon</th><th>Döndürür</th><th>Tipik kullanım</th></tr></thead><tbody>
<tr><td><code>DATESMTD, DATESQTD</code></td><td>Dönem başından bağlamdaki son tarihe kadar tarih kümesi</td><td><code>CALCULATE([Net Satış], DATESMTD(Tarih[Tarih]))</code></td></tr>
<tr><td><code>STARTOFMONTH, STARTOFQUARTER, STARTOFYEAR</code></td><td>Dönemin ilk tarihi, tek satırlık tablo</td><td>O ilk güne filtre</td></tr>
<tr><td><code>ENDOFMONTH, ENDOFQUARTER, ENDOFYEAR</code></td><td>Dönemin son tarihi</td><td>Stok anlık görüntüsü</td></tr>
<tr><td><code>CLOSINGBALANCEMONTH, QUARTER, YEAR</code></td><td>Değeri dönemin son gününde hesaplar</td><td>Ay sonu stok</td></tr>
<tr><td><code>OPENINGBALANCEYEAR</code></td><td>Değeri önceki dönemin son gününde hesaplar</td><td>Yıl başı stok</td></tr>
</tbody></table></div>
<div class="warn"><b>Takvim sonuna dikkat</b><code>CLOSINGBALANCEYEAR</code> takvim yılının son gününde hesaplar. Veri o gün yoksa BLANK döner. Bu modelde stok ay sonlarında kayıtlı olduğu için çalışır. Günlük olmayan veride “dönemde kaydı olan son tarih” kalıbı <button class="lnk" data-lesson="yari-toplanabilir">Yarı toplanabilir</button> dersindedir.</div>
<h2>Stok ve bakiye</h2><p>Stok, bakiye, çalışan sayısı gibi değerler yarı toplanabilirdir: aylar arasında toplanmaz. Kapanış bakiyesi dönemin son gününü alır, açılış bakiyesi önceki dönemin son gününü. Bu model bu iki fonksiyonu sınamak için uygundur çünkü <code>StokGorunum</code> her ay sonunda bir kayıt tutar. İlk yılın açılışı boş kalır: daha önceki yıl veride yok.</p><p>Yılsonu ve mali yıl için son bağımsız değişken vardır: <code>DATESYTD(Tarih[Tarih], "6-30")</code> gibi. Ayrıntı için <button class="lnk" data-lesson="zaman-ileri">İleri zaman zekâsı</button>.</p>`,
  ex: [
    { t: 'dax', name: 'Net Satış MTD', q: '<b>Net Satış MTD</b>: Ay başından bağlamdaki son tarihe kadar net satış. DATESMTD kullan. (Kırılım: yıl ve ay)', sol: 'CALCULATE([Net Satış], DATESMTD(Tarih[Tarih]))', hint: 'CALCULATE([Net Satış], DATESMTD(Tarih[Tarih]))', grid: AY },
    { t: 'dax', name: 'Net Satış QTD', q: '<b>Net Satış QTD</b>: Çeyrek başından bağlamdaki son tarihe kadar net satış. DATESQTD kullan.', sol: 'CALCULATE([Net Satış], DATESQTD(Tarith[Tarih]))'.replace('Tarith', 'Tarih'), hint: 'DATESMTD ile aynı kalıp.', grid: AY },
    { t: 'dax', name: 'Ayın İlk Günü Satış', q: '<b>Ayın İlk Günü Satış</b>: Bağlamdaki ayın ilk gününde net satış. STARTOFMONTH kullan.', sol: 'CALCULATE([Net Satış], STARTOFMONTH(Tarih[Tarih]))', hint: 'STARTOFMONTH tek tarih döndürür; CALCULATE filtre olarak alır.', grid: AY },
    { t: 'dax', name: 'Ay Sonu Stok', q: '<b>Ay Sonu Stok</b>: Bağlamdaki ayın son gününde stok adedi. ENDOFMONTH kullan.', sol: 'CALCULATE(SUM(StokGorunum[StokAdet]), ENDOFMONTH(Tarih[Tarih]))', hint: 'Stok ay sonlarında kayıtlı.', grid: AY },
    { t: 'dax', name: 'Yıl Sonu Stok', q: '<b>Yıl Sonu Stok</b>: CLOSINGBALANCEYEAR ile yıl sonu stok adedi.', sol: 'CLOSINGBALANCEYEAR(SUM(StokGorunum[StokAdet]), Tarih[Tarih])', hint: 'CLOSINGBALANCEYEAR(ifade, tarih sütunu)', grid: Y },
    { t: 'dax', name: 'Ay Kapanış Stok', q: '<b>Ay Kapanış Stok</b>: CLOSINGBALANCEMONTH ile ay sonu stok adedi. Bir önceki görevle aynı sonucu görmelisin.', sol: 'CLOSINGBALANCEMONTH(SUM(StokGorunum[StokAdet]), Tarih[Tarih])', hint: 'CLOSINGBALANCEMONTH(ifade, tarih sütunu)', grid: AY },
    { t: 'dax', name: 'Yıl Açılış Stok', q: '<b>Yıl Açılış Stok</b>: OPENINGBALANCEYEAR ile yılın açılış stoğu: bir önceki yılın son günündeki adet.', sol: 'OPENINGBALANCEYEAR(SUM(StokGorunum[StokAdet]), Tarih[Tarih])', hint: 'OPENINGBALANCEYEAR(ifade, tarih sütunu)', grid: Y },
    { t: 'dax', name: 'Stok Değişimi', q: '<b>Stok Değişimi</b>: Yıl sonu stok eksi yıl açılış stoğu.', sol: 'CLOSINGBALANCEYEAR(SUM(StokGorunum[StokAdet]), Tarih[Tarih]) - OPENINGBALANCEYEAR(SUM(StokGorunum[StokAdet]), Tarih[Tarih])', hint: 'İki fonksiyonu çıkar. Veride ilk yılın açılışı boştur.', grid: Y },
    { t: 'mc', q: 'Stok gibi yarı toplanabilir bir değeri yıl düzeyinde SUM ile göstermek neden yanlıştır?', o: ['SUM stok sütununda çalışmaz', 'Bakiye toplanmaz', 'Tarih tablosu gerekir', 'Hiç yanlış değildir'], a: 1, why: 'Bakiye zamana göre toplanamaz. CLOSINGBALANCEYEAR ya da son tarih kalıbı gerekir.' },
    { t: 'mc', q: 'DATESMTD ile DATESINPERIOD(…, -1, MONTH) arasındaki fark hangisi?', o: ['Fark yok', 'Biri ay başına, öteki kayan pencere', 'DATESINPERIOD yalnız yıl düzeyinde çalışır', 'DATESMTD Tarih tablosu istemez'], a: 1, why: 'MTD ayın 1’inde sıfırlanır; kayan pencere sıfırlanmaz.' },
    { t: 'mc', q: 'CLOSINGBALANCEMONTH BLANK döndürüyor, oysa ayda kayıt var. En olası neden?', o: ['Ayın son günü kayıt yok', 'Ölçü adı yanlış', 'Ay çok kısa', 'Stok sıfır olamaz'], a: 0, why: 'Fonksiyon ayın son takvim gününü filtreler. Veri o gün yoksa sonuç boştur; “son kayıt tarihi” kalıbını kullan.' }
  ]
});

/* ---------- Görsel hesaplama ---------- */
add('zaman-serisi', {
  id: 'gorsel-hesaplama', lv: 'B2', mod: 'İleri DAX', min: 12,
  title: 'Görsel hesaplamalar: kavram, işlevler ve ne zaman ölçü yerine',
  sum: 'RUNNINGSUM, MOVINGAVERAGE, PREVIOUS, NEXT, FIRST, LAST; Axis ve Reset; ölçü ve hesaplanmış sütundan farkı, sınırlar. Bu uygulamanın motoru görsel hesaplamayı çalıştırmaz: senaryo ve elle hesap.',
  body: `<div class="warn"><b>Bu ders senaryo ile</b>Bu uygulamanın DAX motoru görsel hesaplamayı çalıştırmaz. Bu yüzden kod görevi yok, Çalıştır düğmesi de yok; formülleri küçük tablolarda elle izliyoruz. Uygulaması için Power BI Desktop’ta bir görsel seçip düzenleme modunu aç.</div>
<h2>Nedir?</h2>
<p>Learn’e göre görsel hesaplama, anlam modelinde değil doğrudan bir görselde çalışan DAX hesabıdır. Yalnız o görselde görünen toplanmış veriyi kullanır: filtre bağlamı ve model ilişkileriyle uğraşmadan yürüyen toplam, hareketli ortalama, önceki dönem farkı yazarsın.</p>
<pre class="dax" data-notry>Running sum = RUNNINGSUM([Sales Amount])
MovingAverageSales = MOVINGAVERAGE([Sales Amount], 2)
ProfitVSPrevious = [Profit] - PREVIOUS([Profit])
ProfitVSFirst = [Profit] - FIRST([Profit])</pre>
<h2>Ölçü, hesaplanmış sütun, görsel hesaplama</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Hesaplanmış sütun</th><th>Ölçü</th><th>Görsel hesaplama</th></tr></thead><tbody>
<tr><td>Yeri</td><td>Modelde</td><td>Modelde</td><td>Görselde</td></tr>
<tr><td>Ne zaman</td><td>Yenilemede</td><td>Sorguda</td><td>Sorguda, görselin toplanmış verisi üstünde</td></tr>
<tr><td>Başka görselde</td><td>Var</td><td>Var</td><td>Yok: kopyalanamaz, yeniden kullanılamaz</td></tr>
<tr><td>İlişki fonksiyonları</td><td>Var</td><td>Var</td><td>USERELATIONSHIP, RELATED, RELATEDTABLE yok</td></tr>
</tbody></table></div>
<h2>İşlevler</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>İşlev</th><th>Anlam</th><th>Kısayolu olduğu</th></tr></thead><tbody>
<tr><td><code>RUNNINGSUM</code></td><td>Eksen boyunca yürüyen toplam</td><td>WINDOW</td></tr>
<tr><td><code>MOVINGAVERAGE</code></td><td>Eksen boyunca hareketli ortalama</td><td>WINDOW</td></tr>
<tr><td><code>PREVIOUS, NEXT</code></td><td>Önceki ve sonraki satır</td><td>OFFSET(-1), OFFSET(1)</td></tr>
<tr><td><code>FIRST, LAST</code></td><td>İlk ve son satır</td><td>INDEX(1), INDEX(-1)</td></tr>
</tbody></table></div>
<p>Pencere fonksiyonları ile bağ kurmak için <button class="lnk" data-lesson="pencere">Pencere fonksiyonları</button> dersine bak: orada OFFSET ve WINDOW’u bu uygulamada çalıştırabilirsin.</p>
<h2>Axis ve Reset</h2>
<p><b>Axis</b> hesabın matriste hangi yönde yürüdüğünü söyler. Varsayılan ilk eksendir, genellikle ROWS; COLUMNS, ROWPAGES ya da <code>ROWS COLUMNS</code> olabilir. <b>Reset</b> hesabın nerede sıfırlandığını söyler: varsayılan NONE. Pozitif sayı hiyerarşinin üstünden sayar: Yıl ve Ay satırlarında <code>RUNNINGSUM([Sales Amount], 1)</code> her yıl yeniden başlar. Negatif sayı bulunduğun yerden yukarı sayar: <code>-1</code> bir üst düzeyde sıfırlar. Eşanlamlılar: HIGHESTPARENT, LOWESTPARENT, NONE.</p>
<h2>Sınırlar</h2>
<ul><li>Dilimleyici, R, Python, Temel Etmenler, Ayrıştırma Ağacı, Q&amp;A, Akıllı Anlatı, Metrikler, sayfalandırılmış rapor, Power Apps, Power Automate görsellerinde ve özel görsellerde kullanılmaz.</li>
<li>Filtreleme ve sıralama görsel hesaplama üzerinde çalışmaz; biçimi dinamik yapamazsın; toplamayı değiştiremezsin.</li>
<li>Panoya iğnelenemez, Publish to web ile yayımlanamaz. Veri dışa aktarmada sonuçlar yer almaz.</li></ul>
<h2>Ne zaman hangisi?</h2>
<p>Yalnız bu görselde gereken, eksene bağlı bir hesap ise görsel hesaplama hızlı ve basittir. Birden çok görselde, Copilot’ta, dışa aktarmada, panoda ya da başka ölçünün içinde lazımsa ölçü yaz. Learn de görsel hesaplamaların toplanmış veri üstünde çalıştığı için çoğu zaman eşdeğer ölçüden daha iyi performans verdiğini söyler.</p>`,
  ex: [
    { t: 'mc', q: 'Görsel: Oca 10, Şub 20, Mar 30. <code>RUNNINGSUM([Satış])</code> Mar satırında kaç gösterir?', o: ['30', '50', '60', '20'], a: 2, why: 'Yürüyen toplam: 10 + 20 + 30 = 60.' },
    { t: 'mc', q: 'Aynı görselde <code>[Satış] - PREVIOUS([Satış])</code> Oca satırında ne gösterir?', o: ['10', '-10', '0', '10: önceki satır boş'], a: 3, why: 'PREVIOUS ilk satırda boş döner. Sayı eksi boş, DAX’ta sayının kendisidir, yani 10. Bu yüzden ilk satırı yorumlarken dikkat et.' },
    { t: 'mc', q: 'Görsel: Oca 10, Şub 20, Mar 30. <code>[Satış] - FIRST([Satış])</code> Mar satırında?', o: ['20', '30', '10', '0'], a: 0, why: 'İlk satır 10. 30 - 10 = 20.' },
    { t: 'mc', q: 'Matris satırları Yıl ve Ay. Yürüyen toplam her yıl sıfırlansın. Hangisi?', o: ['RUNNINGSUM([Satış])', 'RUNNINGSUM([Satış], 1)', 'RUNNINGSUM([Satış], 0)', 'RUNNINGSUM([Satış], COLUMNS)'], a: 1, why: 'Learn’deki örnek: Reset için pozitif sayı üstten sayar, 1 en üst düzeydir, yani yıl.' },
    { t: 'mc', q: 'Yönetici yürüyen toplamı dışa aktarılan Excel’de de görmek istiyor. Doğru seçim?', o: ['Görsel hesaplama, varsayılanı değiştirmeden', 'Görsel hesaplama, Axis ile', 'Ölçü yazmak', 'Görsel hesaplamayı gizleyip dışa aktarmak'], a: 2, why: 'Learn: veri dışa aktarmada görsel hesaplama sonuçları yer almaz. Bu durumda ölçü gerekir.' },
    { t: 'mc', q: 'Görsel hesaplama içinde RELATED kullanmaya çalıştın, olmadı. Neden?', o: ['Görsel yanlış', 'İlişki fonksiyonları yok', 'Önce Tarih tablosu gerekir', 'Sadece Premium’da çalışır'], a: 1, why: 'Learn: USERELATIONSHIP, RELATED, RELATEDTABLE görsel hesaplamada kullanılamaz. Görsel hesaplama görselin verisiyle çalışır; alanı görsele koy.' },
    { t: 'mc', q: 'Aynı “önceki aya göre fark” hesabı beş ayrı görselde gerekiyor. Doğru seçim?', o: ['Beş kez görsel hesaplama', 'Kopyalayıp yapıştırmak', 'Hesaplanmış sütun', 'Ölçü'], a: 3, why: 'Learn sınırlar arasında kopyala, yapıştır ve görseller arası yeniden kullanımı sayar.' }
  ]
});

/* ---------- Mevcut derslere kısa köprüler ---------- */
app('veri-baglantilari', `<h2>ERP ve kurumsal veri tabanı kaynakları</h2>
<p>İş ilanlarında sık geçer. Kısa karar özeti:</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kaynak</th><th>Bağlayıcı</th><th>Dikkat</th></tr></thead><tbody>
<tr><td><b>PostgreSQL</b></td><td><code>PostgreSQL.Database</code>, Import ve DirectQuery</td><td>Desktop ve ağ geçidi Npgsql’i içerir. Yerel sorguda katlama varsayılan açıktır; <code>Value.NativeQuery</code> isteğe bağlı parametre alırsa katlanmaz.</td></tr>
<tr><td><b>Oracle</b></td><td><code>Oracle.Database</code>, Import ve DirectQuery</td><td>Oracle 12c (12.1.0.2) ve sonrası. Güncel Desktop ve ağ geçidinde yerleşik sürücü var. Kişisel ağ geçidi desteklenmez, kurumsal ağ geçidi gerekir.</td></tr>
<tr><td><b>SAP HANA, SAP BW</b></td><td>Adanmış bağlayıcılar (SAP HANA database, SAP Business Warehouse)</td><td>SAP’nin hazır analitik görünümlerini ya da BW sorgularını okumak çoğu zaman ham tablolardan daha doğrudur. Lisans ve yetkiyi SAP ekibiyle netleştir.</td></tr>
<tr><td><b>Oracle ERP</b></td><td>Oracle ERP (önizleme) bağlayıcısı listede</td><td>Önizleme: üretimde kullanmadan önce sınırlarını oku.</td></tr>
<tr><td><b>Logo, Netsis, Mikro gibi yerel ERP’ler</b></td><td>Power Query bağlayıcı listesinde adanmış bağlayıcı görmedik (Kasım 2026)</td><td>Pratikte erişim çoğu kurulumda arkadaki veri tabanından ya da üreticinin raporlama yolundan olur. Tablo yapısını, lisans koşulunu ve okuma yetkisini üreticiden ve BT’den doğrula. Bu cümle bizim saha gözlemimizdir, resmî belge değildir.</td></tr>
</tbody></table></div>
<p><b>Üç kural.</b> ERP’nin canlı işlem tablolarına ağır sorgu atma: mümkünse salt okunur kopya, rapor görünümü ya da ambar kullan. Ham tabloyu değil, ERP ekibinin onayladığı görünümü oku. Fatura ve iade mantığını kendin yeniden kurarken Finans’ın rakamıyla mutabakat yap.</p>`);
app('fabric-data-factory', `<h2>Bu adlarla karşına çıkar: SSIS, Azure Data Factory, data mart</h2>
<p>İlanlar çoğu kez Fabric yerine şu adları yazar. Köprü:</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Terim</th><th>Nedir</th><th>Fabric’te yakın karşılığı</th></tr></thead><tbody>
<tr><td><b>SSIS</b></td><td>SQL Server’ın ETL aracı: paket, denetim akışı, veri akışı</td><td>Pipeline ve Dataflow Gen2 kavramsal olarak yakın. Learn’ün karşılaştırma sayfasına göre Fabric Data Factory’de SSIS çalıştırma etkinliği yok, bu tasarım sürüyor; SSIS paketlerin varsa şimdilik ADF’de kalmayı planla.</td></tr>
<tr><td><b>Azure Data Factory</b></td><td>PaaS veri tümleştirme: işlem hattı, etkinlik, tetikleyici</td><td>Fabric pipeline: etkinlik, tetikleyici, parametre modeli aynı kalır; Fabric’te yayımlama adımı yoktur. Mapping Data Flow için Dataflow Gen2’deki MDF dönüşümleri önizlemededir.</td></tr>
<tr><td><b>Data mart</b></td><td>Bir iş birimine yönelik, konu odaklı küçük ambar. Genel bir veri ambarı terimi.</td><td>Fabric warehouse ya da lakehouse üzerinde konu şeması. Power BI’daki “datamart” öğesi ayrı bir üründü; güncel durumunu Learn’den denetle, biz Kasım 2026’da doğrulayamadık.</td></tr>
</tbody></table></div>
<p>Görüşmede söylemen gereken: “SSIS ve ADF’de elle çalışmadım ama işlem hattı, etkinlik, tetikleyici ve artımlı yükleme kavramlarını Fabric üzerinde biliyorum.” Yapmadığın işi yaptım deme.</p>`);
app('aile', `<h2>Tableau ya da Qlik biliyorsan</h2>
<p>Kavramlar büyük ölçüde eşlenir, ama birebir değildir. En büyük fark: Power BI’da model ve DAX merkezdedir. Yaklaşık eşleme:</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tableau</th><th>Qlik</th><th>Power BI</th></tr></thead><tbody>
<tr><td>Data Source, Extract</td><td>Load script, QVD</td><td>Power Query ve anlam modeli, Import</td></tr>
<tr><td>Live bağlantı</td><td>Direct Discovery</td><td>DirectQuery</td></tr>
<tr><td>Tableau Prep</td><td>Data Load Editor</td><td>Power Query, Dataflow Gen2</td></tr>
<tr><td>Calculated Field</td><td>Master Measure, ifade</td><td>Ölçü ya da hesaplanmış sütun</td></tr>
<tr><td>LOD ifadesi</td><td>Set Analysis, Aggr</td><td>CALCULATE, ALL ailesi, SUMX</td></tr>
<tr><td>Table Calculation</td><td>Above, RangeSum</td><td>Görsel hesaplama, WINDOW, OFFSET</td></tr>
<tr><td>Worksheet, gösterge paneli</td><td>Sheet</td><td>Görsel, rapor sayfası</td></tr>
<tr><td>Tableau Server, Cloud</td><td>Qlik Sense Enterprise, Cloud</td><td>Power BI hizmeti</td></tr>
</tbody></table></div>
<p><b>Alışkanlık değiştiren iki nokta.</b> Qlik’in ilişkisel motoru alan adlarıyla otomatik ilişki kurar; Power BI’da ilişkileri sen tasarlarsın ve filtre yönünü bilinçli seçersin. Tableau’da hesap çoğu kez görselin ayrıntı düzeyinde düşünülür; DAX’ta filtre bağlamını düşünürsün. <button class="lnk" data-lesson="baglam">Bağlam dersi</button> bu yüzden önemlidir.</p>`);
app('copilot', `<h2>Copilot ile model: özet, açıklama, denetim</h2>
<p>PL-300 maddesi “Copilot ile model özeti” bu bölüm içindir. Learn’e göre dört yüzey vardır:</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Yüzey</th><th>Nerede</th><th>Ne yapar</th></tr></thead><tbody>
<tr><td>Veriye soru</td><td>Desktop, yayımlanmış rapor, mobil</td><td>Doğal dilde soru: görsel ve özet döndürür. Model hakkında “bu modelde hangi tablolar var, satış nasıl hesaplanıyor” diye sorabilirsin.</td></tr>
<tr><td>DAX sorgu görünümü</td><td>Desktop</td><td>DAX yazar, açıklar, yorum ekler</td></tr>
<tr><td>Ölçü açıklaması üret</td><td>Desktop</td><td>Ölçüler için açıklama yazar; belgeleme ve Copilot’un kendisi için dayanak olur</td></tr>
<tr><td>Copilot ile web’de modelleme</td><td>Service, Model görünümü, düzenleme modu</td><td>Modeli sorun için çözümler, şema değişikliği önerir; her değişikliği kabul etmeden gözden geçir</td></tr>
</tbody></table></div>
<p><b>Model özetinin kalitesi modelinkidir.</b> Copilot dayanağını ad, açıklama, eşanlamlı ve yapıdan alır. Yanıtlar belirlenimci değildir: aynı soru farklı sonuç verebilir. Canlı bağlantıda ölçü DAX’ını ve gizli nesneleri göremez. Eski konuşma da dayanak olur: ilgisiz soru için bölmeyi kapatıp aç.</p>
<p><b>Uygulamada süreç.</b> Önce yıldız şema ve okunur adlar. Sonra ölçü açıklamalarını üret ve doğrula. Sonra AI veri şeması ve eşanlamlılar. En sonda “bu modeli özetle” de ve özeti sen okuyarak denetle: özet doğruysa model anlaşılırdır, yanlışsa çoğu zaman modeli düzeltmek gerekir. Desktop’ta Copilot için çalışma alanı F2 ya da P1 kapasitesinde olmalıdır. Bu uygulamada Copilot arayüzü yok, taklit de etmiyoruz.</p>`);
})(window);
