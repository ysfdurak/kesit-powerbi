/* Kesit Power BI — Veri hazırlama ve modelleme ekleri: Power Query dönüşümleri, ileri birleştirmeler, veri bağlantıları, model tasarımı II. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- 1. Power Query: metin, sayı ve tarih dönüşümleri (A2) ---------- */
add('pq-temel', {
  id: 'pq-donusum', lv: 'A2', mod: 'Veri Hazırlama', min: 18,
  title: 'Power Query: metin, sayı ve tarih dönüşümleri',
  sum: 'Metni kırpmak, birleştirmek ve parçalamak; sayıyı yuvarlamak ve çarpmak; tarihten yıl, ay, gün adı ve süre çıkarmak. Dönüştür ile Sütun ekle sekmelerinin farkı, yerel ayarla tür değiştirme ve aynı işi DAX’ta yapmanın bedeli.',
  body: `
<p>“Power Query ile veri temizleme” dersinde kirli bir Excel sayfasını başlık, tür ve boş satır açısından düzelttik. Bu ders bir adım ileri gidiyor: sütunların <b>içeriğini</b> değiştiren komutlar. Hepsi şeritte üç grupta durur: <b>Metin</b>, <b>Sayı</b> ve <b>Tarih ve Saat</b>. Her komut, arka planda tek satırlık bir M fonksiyonu yazar.</p>

<h2>Önce karar: Dönüştür mü, Sütun ekle mi?</h2>
<p>Aynı komutların çoğu iki sekmede birden bulunur. Fark, sonucun nereye yazıldığıdır.</p>
<div class="tbl-wrap"><table>
<tr><th>Sekme</th><th>Ne olur?</th><th>Arka plandaki M</th><th>Ne zaman?</th></tr>
<tr><td><b>Dönüştür</b> (Transform)</td><td>Seçili sütun <b>yerinde</b> değişir; eski değer kalmaz.</td><td><code>Table.TransformColumns</code></td><td>Eski değere ihtiyacın yoksa: boşluklu şehir adını düzeltmek gibi.</td></tr>
<tr><td><b>Sütun ekle</b> (Add Column)</td><td>Sonuç <b>yeni bir sütuna</b> yazılır; kaynak sütun durur.</td><td><code>Table.AddColumn</code></td><td>İkisi de lazımsa: Tarih dururken yanına Ay adı eklemek gibi.</td></tr>
</table></div>
<p>Örnek: <code>Tarih</code> sütununu seçip <b>Dönüştür → Tarih → Ay → Ay adı</b> dersen tarih kaybolur, yerine “Ocak” yazar. Artık o sütunla Tarih tablosuna ilişki kuramazsın. Aynı komutu <b>Sütun ekle</b> sekmesinden çalıştırırsan tarih korunur.</p>

<h2>Metin dönüşümleri</h2>
<div class="tbl-wrap"><table>
<tr><th>İşlem</th><th>Şeritteki yeri</th><th>M karşılığı</th></tr>
<tr><td>Kırp (Trim): baş ve sondaki boşluklar</td><td>Biçim</td><td><code>Text.Trim</code></td></tr>
<tr><td>Temizle (Clean): satır sonu gibi görünmez karakterler</td><td>Biçim</td><td><code>Text.Clean</code></td></tr>
<tr><td>BÜYÜK, küçük, Her Sözcüğün İlk Harfi</td><td>Biçim</td><td><code>Text.Upper</code>, <code>Text.Lower</code>, <code>Text.Proper</code></td></tr>
<tr><td>Önek / sonek ekle (Add prefix / suffix)</td><td>Biçim</td><td><code>each "TR-" &amp; _</code></td></tr>
<tr><td>Uzunluk (Length)</td><td>Ayıkla</td><td><code>Text.Length</code></td></tr>
<tr><td>İlk / son karakterler, aralık</td><td>Ayıkla</td><td><code>Text.Start</code>, <code>Text.End</code>, <code>Text.Middle</code></td></tr>
<tr><td>Sınırlayıcılar arasındaki metin</td><td>Ayıkla</td><td><code>Text.BetweenDelimiters</code></td></tr>
<tr><td>Sütunları birleştir (Merge Columns), ayraçla</td><td>Metin sütunu</td><td><code>Table.CombineColumns</code>, <code>Text.Combine</code></td></tr>
<tr><td>Değerleri değiştir (Replace Values)</td><td>Giriş / Dönüştür</td><td><code>Table.ReplaceValue</code></td></tr>
</table></div>
<p>Değerleri değiştir iki biçimde çalışır. <b>Hücrenin tamamı eşleşsin</b> işaretliyse yalnızca tam olarak “-” olan hücre değişir (<code>Replacer.ReplaceValue</code>). İşaret kaldırılırsa metnin içindeki her geçiş değişir (<code>Replacer.ReplaceText</code>): “Merkez Bayi” içindeki “ Bayi” silinir ve “Merkez” kalır.</p>
<pre class="m">let
    Kaynak = Musteriler,
    Kirpilmis = Table.TransformColumns(Kaynak, {{"Sehir", Text.Trim, type text}}),
    Etiket = Table.AddColumn(Kirpilmis, "Konum",
        each Text.Combine({[Sehir], [Bolge]}, " / "), type text),
    Kod = Table.AddColumn(Etiket, "MusteriKodu",
        each "M-" &amp; Text.PadStart(Text.From([MusteriNo]), 4, "0"), type text),
    Kisa = Table.AddColumn(Kod, "SehirKisa",
        each Text.Upper(Text.Start([Sehir], 3), "tr-TR"), type text)
in
    Kisa</pre>
<p><code>Text.Combine</code> boş (null) parçaları atlar. Musteriler tablomuzda şehri boş müşteriler var. Onlarda <code>Konum</code> yalnızca bölge adı olur, başında fazladan ayraç kalmaz.</p>
<div class="warn"><b>Türkçe İ sorunu</b>Kültür vermeden büyük harfe çevirmek “izmir”i “IZMIR” yapar. Şeritteki komut ya da <code>Text.Upper([Sehir], "tr-TR")</code> “İZMİR” üretir. Dilimleyicide aynı şehrin iki yazımı görünüyorsa önce buna bak.</div>

<h2>Sayı dönüşümleri</h2>
<ul>
<li><b>Standart</b>: topla, çarp, böl, yüzde. İki sütunu seçip <b>Sütun ekle → Standart → Çarp</b> dersen <code>[Adet] * [BirimFiyat]</code> gibi satır tutarı sütunu oluşur. <b>Yüzde</b> komutu sütunun belirli bir yüzdesini hesaplar (ör. KDV için %20).</li>
<li><b>Yuvarlama</b>: <code>Number.Round</code>, <code>Number.RoundUp</code>, <code>Number.RoundDown</code>.</li>
<li><b>Bilimsel</b>: mutlak değer (<code>Number.Abs</code>), karekök (<code>Number.Sqrt</code>), logaritma (<code>Number.Log10</code>, <code>Number.Ln</code>), üs.</li>
</ul>
<div class="note"><b>Yuvarlama iki dilde farklı</b>M’de <code>Number.Round</code> varsayılan olarak <b>çifte yuvarlar</b> (RoundingMode.ToEven): 2,5 → 2, 3,5 → 4. DAX’ta <code>ROUND(2.5, 0)</code> ise 3 verir. Muhasebe toplamlarını eşleştirmen gerekiyorsa M’de kipi açıkça yaz: <code>Number.Round([Tutar], 0, RoundingMode.AwayFromZero)</code>.</div>
<p>Mutlak değer, iade satırları eksi tutarla gelen bir sistemde “hareket büyüklüğü” için işe yarar. Logaritma ve karekök ise rapor için nadiren gerekir: çok çarpık bir dağılımı (birkaç dev müşteri, yüzlerce küçük müşteri) dağılım grafiğinde okunur yapmak ya da bir modele girdi hazırlamak için kullanılır. Rapordaki eksenin logaritmik olması yetiyorsa veriyi değiştirme; görselin eksen ayarını kullan.</p>

<h2>Tarih dönüşümleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Çıkarılan</th><th>M karşılığı</th><th>Örnek (27.04.2023)</th></tr>
<tr><td>Yıl, ay, gün</td><td><code>Date.Year</code>, <code>Date.Month</code>, <code>Date.Day</code></td><td>2023, 4, 27</td></tr>
<tr><td>Ay adı</td><td><code>Date.MonthName([Tarih], "tr-TR")</code></td><td>Nisan</td></tr>
<tr><td>Gün adı</td><td><code>Date.DayOfWeekName([Tarih], "tr-TR")</code></td><td>Perşembe</td></tr>
<tr><td>Yılın haftası</td><td><code>Date.WeekOfYear</code></td><td>17</td></tr>
<tr><td>Çeyrek</td><td><code>Date.QuarterOfYear</code></td><td>2</td></tr>
<tr><td>Ay başı / ay sonu</td><td><code>Date.StartOfMonth</code>, <code>Date.EndOfMonth</code></td><td>01.04.2023, 30.04.2023</td></tr>
</table></div>
<p>İki tarih arasındaki süre için iki sütunu seçip <b>Sütun ekle → Tarih → Günleri çıkar</b> komutunu kullan; sonuç bir <b>süre</b> (duration) değeridir, <code>Duration.Days</code> onu gün sayısına çevirir. <b>Yaş</b> (Age) komutu ise bugünle fark alır: her yenilemede değer değişir. Bu bazen istenir (müşterinin bugünkü yaşı), bazen yanıltır (siparişin verildiği andaki yaş).</p>
<pre class="m">let
    Kaynak = Siparisler,
    Sure = Table.AddColumn(Kaynak, "TeslimGunu",
        each Duration.Days([TeslimTarihi] - [Tarih]), Int64.Type),
    AyAdi = Table.AddColumn(Sure, "AyAdi",
        each Date.MonthName([Tarih], "tr-TR"), type text)
in
    AyAdi</pre>
<div class="tip"><b>Olgu tablosuna takvim sütunu ekleme</b>Satislar tablosunun her satırına Yıl, Ay, Gün adı yazmak yerine “Tarih tablosu” dersindeki gibi ayrı bir takvim kullan. Olgu tablosunda yalnızca tarih kalsın; ay adı, çeyrek ve hafta takvimden gelsin. Tarih dönüşümleri en çok, takvimi kendisi kuran tablolar ve kaynakta düzeltilmesi gereken metin tarihler için gerekir.</div>

<h2>Yerel ayarla tür değiştirme</h2>
<p>“03/04/2024” ABD biçiminde 4 Mart değil 3 Nisan değildir; tam tersidir. Power Query metni çözerken dosyanın <b>yerel ayarını</b> (locale) kullanır. Kaynak dosya başka bir ülkeden geliyorsa sütun başlığına sağ tıkla: <b>Türü değiştir → Yerel ayarı kullanarak</b> (Using Locale). Açılan pencerede hedef türü ve kaynağın yerel ayarını seç. Arka planda <code>Table.TransformColumnTypes</code> fonksiyonuna üçüncü bir bağımsız değişken eklenir:</p>
<pre class="m">Table.TransformColumnTypes(Kaynak, {{"Tarih", type date}, {"Tutar", type number}}, "en-US")</pre>
<p>Aynı ayar sayıları da etkiler: “1,250.50” en-US ile 1250,5 okunur, tr-TR ile hata verir. Dosyanın varsayılan yerel ayarı <b>Seçenekler → Geçerli dosya → Bölgesel ayarlar</b> altındadır.</p>

<h2>Aynı işi DAX’ta yapmak</h2>
<p>Bir ay adı sütununu DAX’ta hesaplanmış sütun olarak da yazabilirsin:</p>
<pre class="dax" data-notry>Ay Adı = FORMAT(Satislar[Tarih], "MMMM")</pre>
<p>Sonuç aynı görünür ama maliyeti farklıdır. Hesaplanmış sütun, Power Query yüklemesi bittikten sonra modelde ayrıca hesaplanır; yenileme süresine eklenir ve kaynakta yapılan sütunlar kadar iyi sıkıştırılmaz. Sorgu katlamayla kaynağa da gönderilemez, başka modeller (ör. veri akışları) onu yeniden kullanamaz. Genel kural: <b>dönüşümü olabildiğince kaynağa yakın, gerektiği kadar rapora yakın yap.</b> Satır düzeyindeki temizlik Power Query’nin işidir.</p>
<p>DAX’ın gerçekten gerekli olduğu yer, hesaplamanın <b>model ilişkilerine</b> ya da filtre bağlamına ihtiyaç duyduğu durumlardır. Örneğin müşterinin sipariş anındaki ortalama yaşını bir ölçüyle hesaplamak, her satış satırına yaş sütunu yazmaktan esnektir; kategoriye ve yıla göre kendiliğinden değişir:</p>
<pre class="dax">Ortalama Alım Yaşı =
AVERAGEX(Satislar, YEAR(Satislar[Tarih]) - RELATED(Musteriler[DogumYili]))</pre>
<p>Modelimizde bu değer tüm satışlarda yaklaşık 41,5; 2022’de 38,1, 2024’te 42,0’dır.</p>
`,
  ex: [
    { t: 'pq', src: 'bayi', pre: [{ op: 'removeTop', cols: [], n: 1 }, { op: 'promote', cols: [] }, { op: 'removeCols', cols: ['Not'] }],
      sol: [{ op: 'replace', cols: ['Bayi'], find: ' Bayi', repl: '', whole: false }, { op: 'trim', cols: ['Şehir'] }, { op: 'upper', cols: ['Şehir'] }],
      q: '<b>Etiketleri sadeleştir.</b> <code>Bayi</code> sütunundaki her adın sonunda “ Bayi” yazıyor: bu metni sil, “Merkez Bayi” yalnızca “Merkez” olsun. Ardından <code>Şehir</code> sütununu kırp ve tamamen BÜYÜK HARF yap (“İZMİR”).',
      hint: 'Bayi’yi seç → Değerleri değiştir: aranacak “ Bayi” (başında boşlukla), yeni değer boş, “Hücrenin tamamı eşleşsin” işaretini KALDIR. Sonra Şehir’i seç → Kırp → BÜYÜK HARF.' },
    { t: 'dax', name: 'Ortalama Alım Yaşı', q: '<b>Ortalama Alım Yaşı</b>: her satış satırında, sipariş yılından müşterinin doğum yılını çıkar ve bu yaşların ortalamasını al. Yaşı Power Query’de bir sütun olarak saklamak yerine ölçüyle hesapla.', sol: 'AVERAGEX(Satislar, YEAR(Satislar[Tarih]) - RELATED(Musteriler[DogumYili]))', hint: 'AVERAGEX(Satislar, …) satır satır gezer. Doğum yılı Musteriler tablosunda: RELATED(Musteriler[DogumYili]). Yıl için YEAR(Satislar[Tarih]).' },
    { t: 'mc', q: 'Satislar sorgusunda <code>Tarih</code> sütununu seçip <b>Dönüştür → Tarih → Ay → Ay adı</b> komutunu çalıştırdın. Modelde ne olur?', o: ['Yanına yeni bir “Ay adı” sütunu eklenir, Tarih sütunu olduğu gibi kalır', 'Tarih sütunu ay adına dönüşür; Tarih tablosuyla ilişki kurulamaz', 'Ay adı yalnızca rapor görünümünde biçim olarak gösterilir', 'Power Query komutu reddeder; tarih sütunu değiştirilemez'], a: 1, why: 'Dönüştür sekmesindeki komutlar seçili sütunu yerinde değiştirir. Tarih kaybolduğu için Tarih[Tarih] ile ilişki kuracak sütun kalmaz. Tarihi korumak için aynı komutu Sütun ekle sekmesinden çalıştır.' },
    { t: 'mc', q: 'ABD’deki bir ortaktan gelen CSV’de tarihler “04/03/2024” (ay/gün/yıl), tutarlar “1,250.50” biçiminde. Bilgisayarının bölgesi Türkiye. En doğru çözüm hangisi?', o: ['Türü değiştir → Yerel ayarı kullanarak (en-US)', 'Önce Değerleri değiştir ile virgül ve noktaları yer değiştirmek', 'Tutar ve Tarih’i metin bırakıp raporda DAX ile çevirmek', 'Seçeneklerden dosyanın bölgesel ayarını kalıcı olarak değiştirmek'], a: 0, why: 'Yerel ayarla tür değiştirme, metni kaynağın biçimine göre çözer: Table.TransformColumnTypes(…, "en-US"). Elle karakter değiştirmek kırılgandır; metin bırakmak da modeli bozar.' },
    { t: 'mc', q: 'Müşterilerin bölge ve şehir adını “İç Anadolu / Kayseri” biçiminde birleştiren bir sütun gerekiyor. Neden DAX hesaplanmış sütunu yerine Power Query tercih edilir?', o: ['DAX metin birleştirmeyi yalnızca ölçülerde yapabilir', 'Yüklemede bir kez oluşur, iyi sıkışır ve katlanabilir', 'Hesaplanmış sütun dilimleyicide ve filtrelerde kullanılamaz', 'Power Query sütunları ölçülerden her zaman daha hızlı toplanır'], a: 1, why: 'Satır düzeyinde, model ilişkisine ihtiyaç duymayan bir dönüşüm kaynağa yakın yapılmalı. DAX bunu yapabilir (& işleci ya da COMBINEVALUES), ama hesaplanmış sütun yükleme sonrası ayrıca hesaplanır ve daha az verimli saklanır.' }
  ]
});

/* ---------- 2. Power Query: join türleri, dizin sütunu ve gruplu sıra (B1) ---------- */
add('pq-orta', {
  id: 'pq-ileri', lv: 'B1', mod: 'Veri Hazırlama', min: 20,
  title: 'Power Query: join türleri, dizin sütunu ve gruplu sıra',
  sum: 'Altı birleştirme türü ve hangi soruya cevap verdikleri, birleştirmeden sonra null gelmesinin nedenleri, bulanık eşleştirme, dizin sütunu ve her grupta sıra numarası. Sonuçları DAX sorgusuyla doğrulama.',
  body: `
<p>“Power Query: birleştirme, ekleme, özetten çıkarma” dersinde iki sorguyu bir anahtarla birleştirmeyi gördük. Orada hep varsayılan türü, <b>sol dış birleştirmeyi</b> kullandık. Oysa Birleştir (Merge) penceresindeki <b>Birleştirme türü</b> (Join kind) listesinde altı seçenek var ve her biri farklı bir soruya cevap verir.</p>

<h2>Altı birleştirme türü</h2>
<p>Örnekte sol tablo bir satış dökümü, sağ tablo ürün listesi; anahtar <code>UrunNo</code>.</p>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Hangi satırlar kalır?</th><th>Cevapladığı soru</th><th>M</th></tr>
<tr><td>Sol dış (Left outer)</td><td>Soldaki tüm satırlar + sağdan eşleşenler</td><td>“Her satışın ürün bilgisi ne?”</td><td><code>JoinKind.LeftOuter</code></td></tr>
<tr><td>Sağ dış (Right outer)</td><td>Sağdaki tüm satırlar + soldan eşleşenler</td><td>“Her ürünün satışları neler?”</td><td><code>JoinKind.RightOuter</code></td></tr>
<tr><td>Tam dış (Full outer)</td><td>İki taraftaki tüm satırlar</td><td>“İki listeyi eksiksiz karşılaştır.”</td><td><code>JoinKind.FullOuter</code></td></tr>
<tr><td>İç (Inner)</td><td>Yalnızca iki tarafta da olanlar</td><td>“Sadece eşleşen kayıtlar.”</td><td><code>JoinKind.Inner</code></td></tr>
<tr><td>Sol karşıt (Left anti)</td><td>Solda olup sağda <b>olmayanlar</b></td><td>“Listede olmayan ürün koduyla satış var mı?”</td><td><code>JoinKind.LeftAnti</code></td></tr>
<tr><td>Sağ karşıt (Right anti)</td><td>Sağda olup solda <b>olmayanlar</b></td><td>“Hiç satılmamış ürün hangisi?”</td><td><code>JoinKind.RightAnti</code></td></tr>
</table></div>
<pre class="m">let
    Satislar = Kaynak_Satislar,
    Birlesik = Table.NestedJoin(Satislar, {"UrunNo"}, Urunler, {"UrunNo"},
        "Urun", JoinKind.LeftOuter),
    Acilmis = Table.ExpandTableColumn(Birlesik, "Urun", {"Urun", "Kategori"})
in
    Acilmis</pre>
<p>Karşıt birleştirmeler bir <b>veri kalitesi denetimi</b> olarak çok değerlidir. Sol karşıt sonucu boş değilse olgu tablosunda boyutta karşılığı olmayan anahtarlar var demektir; modelde bu satırlar görselde “(Boş)” satırına düşer. Sağ karşıt ise kullanılmayan boyut üyelerini bulur. Bizim modelimizde 40 üründen 2’si hiç satılmamıştır: <b>Koşu Bandı</b> ve <b>Gurme Lokum Kutusu</b>. 150 müşteriden 14’ünün de hiç siparişi yok.</p>

<h2>Birleştirmeden sonra neden null geliyor?</h2>
<p>Sol dış birleştirmeden sonra genişlettiğin sütunlar null doluysa eşleşme olmamıştır. Sık nedenler:</p>
<ol>
<li><b>Anahtar türü farklı.</b> Bir tarafta <code>UrunNo</code> metin “7”, diğerinde sayı 7. Microsoft da eşleşen sütunların aynı veri türünde olması gerektiğini vurgular. Birleştirmeden önce iki tarafın türünü eşitle.</li>
<li><b>Görünmez boşluk ya da karakter.</b> “E01 ” ile “E01” farklıdır. İki tarafı da Kırp ve Temizle.</li>
<li><b>Büyük/küçük harf.</b> Power Query metni harf duyarlı karşılaştırır: “ankara” ile “Ankara” eşleşmez. İki tarafı aynı biçime getir.</li>
<li><b>Sütun sırası.</b> Birden fazla sütunla birleştirirken iki tablodaki seçim sırası aynı olmalı: soldaki ilk seçilen sütun sağdaki ilk seçilenle eşleşir.</li>
</ol>
<div class="warn"><b>Satır çoğalması</b>Ters sorun da var: sağ tabloda anahtar <b>yineleniyorsa</b> soldaki her satır, eşleşen her kopya için bir kez tekrar eder. 1.620 satırlık satış tablosu ürün listesiyle birleştikten sonra 1.700 satır olduysa ürün listesinde yinelenen kod vardır ve toplamlar şişer. Birleştirmeden önce ve sonra satır sayısını karşılaştır; boyut tarafında anahtara göre <b>Yinelenenleri kaldır</b>.</div>

<h2>Bulanık eşleştirme</h2>
<p>Anahtar yazımı tutarsız olduğunda (“Anadolu Market AŞ” ile “Anadolu Market A.Ş.”) Birleştir penceresinde <b>Birleştirme yapmak için bulanık eşleştirme kullan</b> kutusunu işaretle. Bu yalnızca <b>metin</b> sütunlarında çalışır. Seçenekler:</p>
<ul>
<li><b>Benzerlik eşiği</b> (Similarity threshold): 0 ile 1 arası, varsayılan <b>0,80</b>. 1 tam eşleşme demektir.</li>
<li><b>Büyük/küçük harfi yoksay</b> ve <b>Metin parçalarını birleştirerek eşleştir</b> (“Micro soft” ile “Microsoft”).</li>
<li><b>En fazla eşleşme sayısı</b>: her satıra kaç aday döneceği.</li>
<li><b>Dönüşüm tablosu</b>: <code>From</code> ve <code>To</code> sütunlu bir eşleme tablosu (“İst.” → “İstanbul”).</li>
</ul>
<pre class="m">Table.FuzzyNestedJoin(Bayiler, {"Unvan"}, CariListe, {"Unvan"}, "Cari",
    JoinKind.LeftOuter, [IgnoreCase = true, Threshold = 0.85])</pre>
<p>Bulanık eşleştirme bir kurtarma aracıdır, kalıcı çözüm değildir. Sonuçları gözle kontrol et, eşiği yükselt ve kaynak sistemde ortak bir kod alanı iste.</p>

<h2>Dizin sütunu ve gruplu sıra</h2>
<p><b>Sütun ekle → Dizin sütunu</b> (Index column) her satıra 0’dan ya da 1’den başlayan bir sıra numarası verir; “Özel” seçeneğiyle başlangıç ve artış belirlenir. Tek başına satır numarası verir. Asıl gücü, <b>Gruplandırma ölçütü</b> ile birleştiğinde ortaya çıkar: her kategori içinde ayrı sıra.</p>
<ol>
<li>Ürün listesini <b>Kategori</b>’ye göre grupla, işlem olarak <b>Tüm satırlar</b> (All rows) seç. Her kategori için içinde bir tablo taşıyan tek satır oluşur.</li>
<li>Bu iç tabloları fiyata göre azalan sırala ve her birine dizin ekle.</li>
<li>İç tabloları genişlet; <code>Sira = 1</code> olan satırları filtrele.</li>
</ol>
<pre class="m">let
    Kaynak = Urunler,
    Gruplu = Table.Group(Kaynak, {"Kategori"},
        {{"Satirlar", each Table.AddIndexColumn(
            Table.Sort(_, {{"Fiyat", Order.Descending}}), "Sira", 1, 1), type table}}),
    Acilmis = Table.ExpandTableColumn(Gruplu, "Satirlar", {"Urun", "Fiyat", "Sira"}),
    EnPahali = Table.SelectRows(Acilmis, each [Sira] = 1)
in
    EnPahali</pre>
<p>Kullanıcı arayüzü 2. adımı doğrudan sunmaz: grupladıktan sonra formül çubuğunda <code>each _</code> kısmını <code>each Table.AddIndexColumn(…)</code> ile değiştirirsin. Sonuç yedi satırdır; her kategorinin en pahalı ürünü. Aynı sonucu modelde bir DAX sorgusuyla doğrulayabilirsin:</p>
<pre class="dax">EVALUATE
FILTER(
    Urunler,
    VAR Kat = Urunler[Kategori]
    RETURN Urunler[Fiyat] = MAXX(FILTER(ALL(Urunler), Urunler[Kategori] = Kat), Urunler[Fiyat])
)</pre>
<p>Örneğin Spor’da Koşu Bandı (15.999 ₺), Elektronik’te 27" Monitör (7.499 ₺) gelir. Eşit fiyatlı iki ürün varsa DAX ikisini de döndürür, Power Query’deki dizin ise yalnızca birine 1 verir. İki yöntemin farkı bu bağ (tie) durumunda ortaya çıkar.</p>
<div class="note"><b>Sıra için DAX mı, Power Query mi?</b>Sıra, kullanıcının seçimine göre değişmeliyse (dilimleyicide yıl seçince en çok satan ürün) DAX ölçüsü gerekir. Sabit bir özellikse (ürünün kategorisindeki fiyat sırası) Power Query’de bir kez hesaplamak daha ucuzdur.</div>

<h2>Sorguyu okunur tutmak</h2>
<ul>
<li><b>Adımları yeniden adlandır.</b> “Değiştirilen Tür1” yerine “Tutar sayıya çevrildi”. Uygulanan Adımlar listesinde adıma sağ tıkla → Yeniden adlandır.</li>
<li><b>Açıklama ekle.</b> Adıma sağ tıkla → <b>Özellikler</b> → Açıklama. Metin, adımın üzerine gelince ipucu olarak görünür; Gelişmiş Düzenleyici’de adımın üstünde <code>// yorum</code> satırı olarak durur.</li>
<li><b>Sorgu bağımlılıkları.</b> <b>Görünüm → Sorgu bağımlılıkları</b> (Query dependencies) penceresi hangi sorgunun hangi kaynaktan ve hangi sorgudan beslendiğini bir ağaç olarak çizer. Bir kaynağın yolunu değiştirmeden önce neyin etkileneceğini burada gör.</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Kampanya ekibi bir e-posta listesi gönderdi. CRM müşteri tablon solda, kampanya listesi sağda. “CRM’de olup kampanyaya <b>hiç</b> eklenmemiş müşteriler” için hangi birleştirme türü?', o: ['İç birleştirme', 'Sağ karşıt birleştirme', 'Sol karşıt birleştirme', 'Tam dış birleştirme'], a: 2, why: 'Sol karşıt, sol tabloda olup sağda eşleşmesi olmayan satırları verir. Sağ karşıt bunun tersidir: kampanya listesinde olup CRM’de olmayan adresler.' },
    { t: 'mc', q: 'Satış dökümünü ürün listesiyle sol dış birleştirdin. Satır sayısı 1.620’den 1.700’e çıktı. En olası neden?', o: ['Ürün listesinde UrunNo değerleri yineleniyor', 'Anahtar sütunların veri türü iki tabloda farklı', 'Satış dökümünde tamamen boş satırlar var', 'Birleştirmede bulanık eşleştirme açık kalmış'], a: 0, why: 'Sol dış birleştirme sol tablodaki satırları korur; sayı ancak sağ tarafta aynı anahtarın birden fazla kopyası varsa artar. Tür farkı satır eklemez, eşleşmeyi bozar ve null getirir.' },
    { t: 'mc', q: 'Birleştirmeden sonra genişletilen <code>Kategori</code> sütunu tüm satırlarda null. Soldaki <code>UrunNo</code> metin türünde “7”, sağdaki tam sayı 7. Ne yapmalısın?', o: ['Bulanık eşleştirmeyi açıp eşiği düşürmek', 'Tam dış birleştirmeye geçmek', 'İki anahtarı aynı veri türüne çevirmek', 'Genişletmeden önce null’ları değiştirmek'], a: 2, why: 'Eşleşen sütunlar aynı türde olmalı. Bulanık eşleştirme yalnızca metinle çalışır ve sorunu gizler; null’ları değiştirmek de eşleşmeyi geri getirmez.' },
    { t: 'mc', q: 'Her kategoride ürünleri fiyata göre sıralayıp 1, 2, 3… numarası vermek istiyorsun. Power Query’de doğru yol hangisi?', o: ['Tabloyu önce fiyata göre sıralayıp tüm tabloya tek bir dizin sütunu eklemek', 'Kategoriye göre “Tüm satırlar” ile gruplayıp iç tablolara dizin eklemek', 'Kategoriye göre gruplayıp işlem olarak “En büyük” fiyatı seçmek', 'Her kategori için koşullu sütunla ayrı bir sayaç yazmak'], a: 1, why: 'Tek dizin tüm tabloyu baştan sona numaralar. Grup içinde yeniden başlayan sıra için her grubu bir tablo olarak tutmak (Tüm satırlar) ve Table.AddIndexColumn’u o tabloya uygulamak gerekir. “En büyük” yalnızca fiyatı verir, ürünü değil.' },
    { t: 'query', q: '<b>Sağ karşıt birleştirmeyi DAX ile doğrula.</b> Power Query’de ürün listesine karşı satışları karşıt birleştirerek hiç satılmamış ürünleri buldun. Aynı listeyi modelde bir sorguyla üret: Urunler’deki <code>UrunNo</code> değerlerinden, Satislar’da geçenleri çıkar.', start: 'EVALUATE\n', sol: 'EVALUATE\nEXCEPT(VALUES(Urunler[UrunNo]), VALUES(Satislar[UrunNo]))', hint: 'EXCEPT(tablo1, tablo2) birinci tabloda olup ikincide olmayan satırları döndürür. İki tarafı da VALUES ile tek sütunlu tablo yap. Sonuçta 2 ürün kalmalı.' },
    { t: 'dax', name: 'Satışsız Ürün Sayısı', q: '<b>Satışsız Ürün Sayısı</b>: geçerli filtrede hiç satış satırı olmayan ürünleri say. Kategoriye ve yıla göre değişmeli (2022’de 4, 2023 ve 2024’te 2 olmalı).', sol: 'COUNTROWS(FILTER(Urunler, ISEMPTY(RELATEDTABLE(Satislar))))', hint: 'FILTER(Urunler, …) her ürünü gezer. RELATEDTABLE(Satislar) o ürünün geçerli filtredeki satışlarını verir; ISEMPTY boşsa TRUE döndürür. Sonra COUNTROWS.' }
  ]
});

/* ---------- 3. Veri bağlantıları: veritabanı, yerel SQL, Desktop ile hizmet (B1) ---------- */
add('pq-model', {
  id: 'veri-baglantilari', lv: 'B1', mod: 'Veri Hazırlama', min: 18,
  title: 'Veri bağlantıları: veritabanı, yerel SQL sorgusu, Desktop ile hizmet',
  sum: 'Bir SQL veritabanına bağlanmak, gezgin ile yerel SQL sorgusu arasında seçim yapmak, M, DAX ve SQL’in yeri, bağlantıyı parametreyle yönetmek ve Desktop’ta kurulan bağlantının hizmette nasıl yenilendiği.',
  body: `
<p>“Veri alma ve bağlantı modları” dersinde İçeri aktarma ile DirectQuery farkını gördük. Bu ders bir bağlantının yaşam döngüsüne bakıyor: Desktop’ta nasıl kurulur, hangi bilgileri saklar ve rapor yayımlandıktan sonra hizmette neden bazen yenilenmez.</p>

<h2>Verinin yolculuğu ve üç dil</h2>
<ol>
<li><b>Kaynak</b>: SQL Server, Excel, SharePoint, bir API…</li>
<li><b>Power Query</b>: verinin alınması ve temizlenmesi. Dil: <b>M</b>.</li>
<li><b>Anlam modeli</b> (semantic model): tablolar, ilişkiler, ölçüler. Dil: <b>DAX</b>.</li>
<li><b>Rapor</b>: görseller ölçüleri çağırır.</li>
<li><b>Hizmet</b> (Power BI service): yayımlanan model zamanlanmış olarak yenilenir, rapor paylaşılır.</li>
</ol>
<div class="tbl-wrap"><table>
<tr><th>Dil</th><th>Nerede çalışır?</th><th>Ne için?</th></tr>
<tr><td>SQL</td><td>Kaynak veritabanında</td><td>Veriyi kaynağında süzmek, birleştirmek. Power Query çoğu adımı kendisi SQL’e çevirir (sorgu katlama); istersen elle de yazarsın.</td></tr>
<tr><td>M</td><td>Power Query’de, yenileme sırasında</td><td>Bağlanmak, şekillendirmek, temizlemek.</td></tr>
<tr><td>DAX</td><td>Modelde, rapor açıkken</td><td>Ölçüler, hesaplanmış tablolar ve sütunlar, güvenlik kuralları.</td></tr>
</table></div>

<h2>Bir veritabanına bağlanmak</h2>
<p><b>Veri al → SQL Server veritabanı</b> penceresi şunları ister:</p>
<ul>
<li><b>Sunucu</b>: <code>sql01.sirket.local</code> ya da bir bulut adresi. Bağlantı noktası gerekiyorsa sunucu adına eklenir.</li>
<li><b>Veritabanı</b> (isteğe bağlı): boş bırakırsan gezgin sunucudaki tüm veritabanlarını listeler.</li>
<li><b>Veri bağlantısı modu</b>: İçeri aktar ya da DirectQuery.</li>
<li><b>Gelişmiş seçenekler</b> (Advanced options): komut zaman aşımı (varsayılan 10 dakika), <b>SQL deyimi</b>, ilişki sütunlarını ekle, tam hiyerarşiyle gezin.</li>
</ul>
<p>İlk bağlantıda <b>kimlik doğrulama türü</b> sorulur: Windows, Veritabanı (kullanıcı adı ve parola) ya da kuruluş hesabı (Microsoft Entra ID). Kimlik bilgisi .pbix dosyasına yazılmaz; bilgisayarındaki <b>Veri kaynağı ayarları</b>’nda saklanır. Dosyayı bir meslektaşına gönderirsen o da kendi kimliğiyle bağlanır. Bağlantı şifreli değilse Desktop bir uyarı gösterir; mümkünse sunucu tarafında şifrelemeyi açtır.</p>
<pre class="m">let
    Kaynak = Sql.Database("sql01.sirket.local", "SatisDB"),
    Satislar = Kaynak{[Schema = "dbo", Item = "Satislar"]}[Data]
in
    Satislar</pre>

<h2>Gezgin mi, yerel SQL sorgusu mu?</h2>
<p>Gezginden (Navigator) tablo seçip Power Query’de filtrelemek ile <b>Gelişmiş seçenekler → SQL deyimi</b> kutusuna hazır bir sorgu yapıştırmak aynı veriyi getirebilir. Fark sonraki adımlarda ortaya çıkar.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>Gezgin + Power Query adımları</th><th>Yerel SQL sorgusu (native query)</th></tr>
<tr><td>Sorgu katlama</td><td>Filtre, sütun seçme, gruplama kaynağa gönderilir.</td><td>Klasik yöntemde sonraki adımlar katlanmaz; hepsi Power Query’de, yerelde çalışır.</td></tr>
<tr><td>Bakım</td><td>Adımlar görünür ve tıklanarak düzenlenir.</td><td>SQL metni tek bir adımda; değişiklik için SQL bilmek gerekir.</td></tr>
<tr><td>Güvenlik</td><td>Ek onay yok.</td><td>Gelişmiş Düzenleyici’den eklenen ya da değiştirilen yerel sorgu için onay istenir.</td></tr>
<tr><td>İyi olduğu yer</td><td>Çoğu senaryo.</td><td>Veritabanı ekibinin optimize ettiği karmaşık bir sorgu ya da saklı yordam çağrısı.</td></tr>
</table></div>
<p>Yerel sorgu kullanman gerekiyorsa katlamayı korumanın bir yolu vardır: <code>Value.NativeQuery</code> fonksiyonunu <code>EnableFolding = true</code> seçeneğiyle çağırmak. Bu, SQL Server, PostgreSQL, Snowflake, Google BigQuery gibi bazı bağlayıcılarda desteklenir; sonraki filtre adımı senin sorgunu bir alt sorgu olarak sarar.</p>
<pre class="m">let
    Kaynak = Sql.Database("sql01.sirket.local", "SatisDB"),
    Sorgu = Value.NativeQuery(Kaynak,
        "SELECT SiparisNo, Tarih, UrunNo, Tutar FROM dbo.Satislar WHERE Durum &lt;&gt; 'İptal'",
        null, [EnableFolding = true]),
    Son2Yil = Table.SelectRows(Sorgu, each [Tarih] &gt;= #date(2023, 1, 1))
in
    Son2Yil</pre>

<h2>Parametreli bağlantı</h2>
<p>“Power Query ile modele hazırlık” dersindeki parametreleri bağlantı bilgisine uygula: sunucu adını ve veritabanını metin parametresi yap. Geliştirme sırasında test sunucusunu, yayımladıktan sonra üretim sunucusunu kullanırsın; M koduna dokunmazsın.</p>
<pre class="m">let
    Kaynak = Sql.Database(SunucuAdi, VeritabaniAdi),
    Satislar = Kaynak{[Schema = "dbo", Item = "Satislar"]}[Data]
in
    Satislar</pre>
<p>Hizmette parametre değeri anlam modelinin ayarlarından değiştirilebilir; dağıtım işlem hatlarında (deployment pipelines) her aşama için ayrı değer veren kurallar tanımlanır.</p>

<h2>Desktop’tan hizmete: neden yenilenmiyor?</h2>
<p>Yayımladığında hizmete model, veri ve M kodu gider; <b>kimlik bilgileri gitmez</b>. Zamanlanmış yenilemenin çalışması için hizmetin kaynağa ulaşabilmesi ve oturum açabilmesi gerekir:</p>
<ul>
<li><b>Bulut kaynağı</b> (Azure SQL, SharePoint Online): anlam modeli ayarlarında <b>Veri kaynağı kimlik bilgileri</b>’ni gir ya da “Bağlantıları ve ağ geçitlerini yönet” sayfasındaki bir <b>bulut bağlantısını</b> seç.</li>
<li><b>Şirket içi kaynak</b> (ofisteki SQL Server, ağ klasöründeki Excel): <b>şirket içi veri ağ geçidi</b> (on-premises data gateway) gerekir. Kimlik bilgilerini ağ geçidi yöneticisi tanımlar; senin hesabın o veri kaynağının kullanıcı listesinde olmalı. Kişisel mod ağ geçidi yalnızca tek kullanıcı içindir.</li>
<li><b>Gizlilik düzeyleri</b>: farklı kaynakları birleştiren sorgularda hizmet de gizlilik düzeylerine (Özel, Kuruluş, Genel) uyar; Desktop’ta çalışan birleştirme hizmette bu yüzden hata verebilir.</li>
</ul>
<div class="note"><b>Yenileme sınırları</b>Pro lisansta günde en fazla 8, Premium kişi başı (PPU) ve Premium/Fabric kapasitede 48 zamanlanmış yenileme yapılabilir. Art arda dört başarısız yenilemeden ya da süresi dolmuş kimlik bilgisi gibi düzeltilemez bir hatadan sonra zamanlama kendiliğinden kapanır. İki ay boyunca hiç görüntülenmeyen modelin zamanlaması da duraklatılır.</div>

<h2>Bağlantı hatalarını okumak</h2>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Olası neden</th><th>Ne yapılır?</th></tr>
<tr><td>“Kimlik bilgileri geçersiz” ya da oturum açma hatası</td><td>Parola değişti, hesap kilitlendi, yanlış kimlik doğrulama türü</td><td>Veri kaynağı ayarlarında (hizmette model ayarlarında) kimliği güncelle.</td></tr>
<tr><td>“Ağla ilgili ya da örneğe özgü bir hata” (network-related error)</td><td>Sunucu adı yanlış, güvenlik duvarı, VPN kapalı, hizmette ağ geçidi yok</td><td>Sunucuya ağdan erişimi kontrol et; buluttaki kaynakta istemci IP’sine izin ver; şirket içinde ağ geçidi kur.</td></tr>
<tr><td><code>Expression.Error</code>: “…sütunu bulunamadı”</td><td>Kaynakta şema değişti: sütun silindi ya da yeniden adlandırıldı</td><td>Hata veren adımı bul; sütun adını düzelt ya da “Diğer sütunları kaldır” ile yalnızca gerekenleri seç.</td></tr>
<tr><td>Hizmette “ağ geçidi çevrimdışı”</td><td>Ağ geçidinin kurulu olduğu makine kapalı</td><td>Makineyi ya da ağ geçidi kümesini çalıştır.</td></tr>
</table></div>
<p>Kaynak taşındığında (yeni sunucu, yeni dosya yolu) <b>Dönüştür → Veri kaynağı ayarları → Kaynağı değiştir</b> ile tüm sorgulardaki bağlantı bir kerede güncellenir. Tek bir sorguda ise <code>Kaynak</code> adımındaki sunucu adını Gelişmiş Düzenleyici’de değiştirmen yeter; sonraki adımlar aynı tablo yapısını bulduğu sürece çalışır.</p>

<h2>Artımlı yenileme: kısa bir bakış</h2>
<p>Milyonlarca satırlık bir olgu tablosunu her gece baştan yüklemek yerine yalnızca son günleri yenilemek mümkündür. Bunun için <code>RangeStart</code> ve <code>RangeEnd</code> adlı iki tarih/saat parametresiyle tabloyu filtreler ve tabloya bir yenileme ilkesi tanımlarsın. Filtrenin kaynağa katlanması şarttır; yerel SQL sorgusu bu yüzden burada risklidir. Ayrıntılar “Kurumsal model” dersinde.</p>
`,
  ex: [
    { t: 'mc', q: 'Bir SQL Server tablosunu gezginden seçip Power Query’de bir tarih filtresi ve sütun seçimi uyguladın. Bu adımlar nerede çalışır?', o: ['Her zaman bilgisayarındaki Power Query motorunda', 'SQL’e çevrilip veritabanında (katlanabiliyorsa)', 'Rapor her açıldığında modeldeki DAX motorunda', 'Yalnızca hizmette, şirket içi ağ geçidinin üzerinde'], a: 1, why: 'Sorgu katlama, Power Query adımlarını kaynağın diline (burada SQL) çevirir; filtre ve sütun seçimi tipik olarak katlanır. Veri kaynağında süzüldüğü için daha az satır taşınır.' },
    { t: 'mc', q: 'Gelişmiş seçeneklerdeki <b>SQL deyimi</b> kutusuna bir sorgu yazdın, ardından Power Query’de ek filtreler ekledin. Klasik yöntemde ne olur?', o: ['Filtreler SQL sorgusunun WHERE kısmına eklenir', 'Power Query ek adımları kabul etmez', 'Sonraki adımlar katlanmaz, yerelde çalışır', 'Bağlantı kendiliğinden DirectQuery moduna geçer'], a: 2, why: 'Yerel sorgudan sonraki adımlar klasik yöntemde kaynağa gönderilmez. Katlamayı korumak için desteklenen bağlayıcılarda Value.NativeQuery(…, [EnableFolding = true]) kullanılır.' },
    { t: 'mc', q: 'Raporu yayımladın. Model ofisteki bir SQL Server’dan besleniyor ve hizmette zamanlanmış yenileme “kaynağa ulaşılamıyor” hatası veriyor. Eksik parça ne?', o: ['Şirket içi veri ağ geçidi', 'Raporun yeniden yayımlanması', 'DirectQuery moduna geçiş', 'Satır düzeyi güvenlik rolü'], a: 0, why: 'Hizmet buluttadır ve şirket ağındaki sunucuya doğrudan erişemez. Şirket içi veri ağ geçidi bu köprüyü kurar; kimlik bilgileri ağ geçidindeki veri kaynağı tanımında tutulur.' },
    { t: 'mc', q: 'Geliştirmede test sunucusunu, yayımladıktan sonra üretim sunucusunu kullanmak istiyorsun. M koduna her seferinde dokunmamak için ne yaparsın?', o: ['Her ortam için ayrı bir .pbix dosyası tutarsın', 'Sunucu adını yerel SQL sorgusunun içine yazarsın', 'Sunucu adını bir parametre yaparsın', 'Veri kaynağı ayarlarından kimlik bilgilerini silersin'], a: 2, why: 'Parametre, bağlantı bilgisini koddan ayırır. Hizmette model ayarlarından ya da dağıtım işlem hattı kurallarıyla her aşamaya ayrı değer verilir.' },
    { t: 'mc', q: 'Kaynak veritabanında <code>Tutar</code> sütunu <code>SatisTutari</code> olarak yeniden adlandırıldı. Yenilemede hangi hatayı görmeyi beklersin?', o: ['Kimlik bilgilerinin geçersiz olduğu uyarısı', 'Expression.Error: sütun bulunamadı', 'Ağla ilgili ya da örneğe özgü bağlantı hatası', 'Hizmette ağ geçidinin çevrimdışı olduğu'], a: 1, why: 'Bağlantı ve oturum sorunsuzdur; ama sonraki adımlar artık var olmayan “Tutar” sütununu arar. Bu bir şema değişikliği hatasıdır ve hata veren adımda sütun adını düzeltmek gerekir.' },
    { t: 'mc', q: 'Bir .pbix dosyasını SQL Server bağlantısıyla birlikte meslektaşına e-postayla gönderdin. Dosyayı açıp yenilediğinde ne olur?', o: ['Senin kimliğinle bağlanır, çünkü parola dosyada saklıdır', 'Yenileme yapılamaz; dosya yalnızca senin bilgisayarında çalışır', 'Veriler silinir, yalnızca M kodu kalır', 'Kendi kimlik bilgilerini girmesi istenir; parola dosyada değil'], a: 3, why: 'Kimlik bilgileri .pbix’e yazılmaz, her kullanıcının Veri kaynağı ayarlarında saklanır. Meslektaşın ilk yenilemede kendi yetkisiyle oturum açar; yetkisi yoksa veriye ulaşamaz.' }
  ]
});

/* ---------- 4. Model tasarımı II (B1) ---------- */
add('hedef', {
  id: 'model-ileri', lv: 'B1', mod: 'Veri Modelleme', min: 20,
  title: 'Model tasarımı II: kar tanesi şema, bileşik anahtar, ayrıntı düzeyi ve görünürlük',
  sum: 'Kar tanesi ile yıldız şemanın farkı ve ne zaman düzleştirileceği, iki sütunlu anahtar sorunu, olgu tablosunun ayrıntı düzeyi cümlesi, hiyerarşiler, alan görünürlüğü, veri kategorisi, varsayılan özetleme ve sütunun nerede hesaplanacağı.',
  body: `
<p>“Veri modelleme: yıldız şema ve ilişkiler” dersinde olgu ve boyut tablolarını, “Hedef ve gerçekleşen” dersinde iki farklı ayrıntı düzeyindeki olguyu gördük. Bu ders modeli bir kullanıcının gözünden düzenliyor: hangi tablo nereye bağlanmalı, hangi sütun görünmeli, hangi sayı toplanmamalı.</p>

<h2>Kar tanesi mi, yıldız mı?</h2>
<p>Yıldız şemada her boyut tablosu doğrudan olgu tablosuna bağlanır. <b>Kar tanesi</b> (snowflake) şemada bir boyut, başka bir boyuta bağlanarak dallanır. Bizim modelimizde böyle bir dal var:</p>
<pre class="dax" data-notry>Satislar[UrunNo]   *-1  Urunler[UrunNo]
Urunler[Kategori]  *-1  Kategoriler[Kategori]
Hedefler[Kategori] *-1  Kategoriler[Kategori]</pre>
<p>Satış satırı, kategorisine iki adımda ulaşır. Satır bağlamında <code>RELATED</code> bu zinciri izler:</p>
<pre class="dax">Elektronik Satışı (Zincir) =
SUMX(
    FILTER(Satislar, RELATED(Kategoriler[Kategori]) = "Elektronik" &amp;&amp; Satislar[Durum] &lt;&gt; "İptal"),
    Satislar[Tutar]
)</pre>
<p>Sonuç 339.303,65 ₺; <code>CALCULATE([Net Satış], Urunler[Kategori] = "Elektronik")</code> ile aynıdır.</p>
<p><b>Ne zaman düzleştirmeli?</b> Dallanan tablo yalnızca bir boyuta hizmet ediyorsa onu Power Query’de üst boyuta birleştir (birleştir + genişlet), dalı sil. Kazancın: daha az ilişki, daha kısa filtre yolu, daha sade bir Veri bölmesi ve tek tabloda kurulabilen hiyerarşiler. Dalı <b>tutmanın</b> haklı nedeni, aynı boyutu farklı ayrıntı düzeyinde başka bir olgunun da kullanmasıdır. Kategoriler tablosu tam olarak bu yüzden var: Hedefler ürün düzeyinde değil kategori düzeyinde tutuluyor ve iki olgu ortak bir kategori listesinde buluşuyor.</p>
<div class="warn"><b>Yanlış sütun, sabit sonuç</b>Kategoriyi görsele <code>Urunler[Kategori]</code>’den koyarsan <code>[Hedef]</code> her satırda 1.299.300 ₺ gösterir, çünkü Urunler’den Hedefler’e giden bir filtre yolu yoktur. <code>Kategoriler[Kategori]</code> ise hem satışı hem hedefi süzer. Ortak boyut kullanılan bir kar tanesinde dal ucundaki sütunu (<code>Urunler[Kategori]</code>) gizle.</div>

<h2>Ayrıntı düzeyi: olgu tablosunun cümlesi</h2>
<p>Bir olgu tablosu tasarlarken önce tek bir cümle yaz: “<b>Bir satır, … demektir.</b>” Bu cümle ayrıntı düzeyini (grain) belirler; hangi boyutlara bağlanabileceğini ve hangi sorulara cevap verebileceğini sınırlar.</p>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>Satır</th><th>Tanecik cümlesi</th></tr>
<tr><td>Satislar</td><td>1.620</td><td>Bir satır, bir siparişteki bir ürün satırıdır (910 sipariş).</td></tr>
<tr><td>Hedefler</td><td>252</td><td>Bir satır, bir ayın bir kategorideki hedefidir (36 ay × 7 kategori).</td></tr>
<tr><td>StokGorunum</td><td>1.440</td><td>Bir satır, bir ürünün bir ay sonundaki stok fotoğrafıdır (36 ay × 40 ürün).</td></tr>
</table></div>
<p>Cümle netse hatalar erken görünür. Hedefler ay düzeyinde olduğu için gün düzeyinde bir hedef sorusu anlamsızdır; StokGorunum bir fotoğraf olduğu için aylar boyunca toplanamaz, son değeri alınır. Aynı tabloya iki farklı tanecikte satır karıştırmak (ör. ürün satırları ile sipariş başlığındaki kargo ücreti) toplamları sessizce bozar: kargo ücretini ayrı bir sipariş düzeyi tabloya ya da satırlara paylaştırarak ekle.</p>

<h2>Bileşik anahtar</h2>
<p>Power BI’da bir ilişki her iki tarafta <b>tek bir sütun</b> kullanır. StokGorunum’daki bir satırı benzersiz kılan şey ise iki sütunun birlikteliğidir: <code>Tarih</code> + <code>UrunNo</code>. Çoğu zaman bu bir sorun değildir: yıldız şemada her parça kendi boyutuna bağlanır (Tarih’e ve Urunler’e). Bileşik anahtar ancak iki sütunla tanımlanan bir boyuta bağlanman gerektiğinde gerekir; örneğin bayi kodlarının yalnızca bölge içinde benzersiz olduğu bir bayi listesi.</p>
<p>Çözüm, iki sütunu tek bir anahtar sütununda birleştirmektir. En iyi yer Power Query’dir: iki tarafta da aynı ayraçla <b>Sütunları birleştir</b>.</p>
<pre class="m">Table.AddColumn(Kaynak, "BayiAnahtar",
    each Text.Combine({[BolgeKodu], Text.From([BayiKodu])}, "|"), type text)</pre>
<p>DAX’ta hesaplanmış sütunla da yapılabilir; <code>COMBINEVALUES</code> bu iş için tasarlanmıştır:</p>
<pre class="dax" data-notry>BayiAnahtar = COMBINEVALUES("|", Bayiler[BolgeKodu], Bayiler[BayiKodu])</pre>
<p>Anahtarın gerçekten benzersiz olduğunu bir sorguyla kontrol et. StokGorunum’da birleşik anahtarın farklı değer sayısı satır sayısına (1.440) eşitse anahtar sağlamdır:</p>
<pre class="dax">EVALUATE
ROW(
    "Satır", COUNTROWS(StokGorunum),
    "Farklı anahtar", COUNTROWS(DISTINCT(SELECTCOLUMNS(StokGorunum, "K", COMBINEVALUES("|", StokGorunum[Tarih], StokGorunum[UrunNo]))))
)</pre>
<p>Ayraç önemlidir: ayraçsız “1” + “12” ile “11” + “2” aynı “112” anahtarını üretir.</p>

<h2>Hiyerarşi</h2>
<p>Hiyerarşi, kullanıcının matriste ve grafikte detaya inmesini (drill down) sağlayan sıralı bir alan grubudur: Yıl → Çeyrek → Ay ya da Kategori → Ürün. Veri bölmesinde en üst düzey alana sağ tıklayıp <b>Hiyerarşi oluştur</b> dersin, diğer alanları üzerine sürüklersin. Kısıt: <b>bir hiyerarşinin bütün düzeyleri aynı tabloda olmalı.</b> <code>Kategoriler[Kategori]</code> ile <code>Urunler[Urun]</code> farklı tablolarda olduğu için ikisiyle tek bir hiyerarşi kuramazsın; düzleştirmenin bir başka nedeni budur. Hiyerarşi içinde pay hesaplamak sık bir istektir: ürünün kendi kategorisi içindeki payı.</p>
<pre class="dax">Kategori İçi Pay % =
DIVIDE(
    [Net Satış],
    CALCULATE([Net Satış], REMOVEFILTERS(Urunler[Urun]), VALUES(Urunler[Kategori]))
)</pre>
<p><code>REMOVEFILTERS</code> ürün filtresini kaldırır; <code>VALUES(Urunler[Kategori])</code> ise o ürünün kategorisini filtre olarak geri koyar. 27" Monitör Elektronik satışlarının yaklaşık %30’unu oluşturur.</p>

<h2>Görünürlük, klasörler ve açıklamalar</h2>
<ul>
<li><b>Rapor görünümünde gizle</b>: ilişki anahtarları (<code>Satislar[UrunNo]</code>, <code>Satislar[MusteriNo]</code>), yardımcı sütunlar ve ham sayı sütunları. Kullanıcı ham <code>Tutar</code>’ı değil <code>[Net Satış]</code> ölçüsünü kullanmalı.</li>
<li><b>Görüntüleme klasörü</b> (Display folder): Model görünümünde Özellikler bölmesinden ölçüleri “Satış”, “Müşteri”, “Zaman” gibi klasörlere ayır; ters eğik çizgiyle alt klasör olur (<code>Satış\\Oranlar</code>).</li>
<li><b>Açıklama</b> (Description): Veri bölmesinde alanın üzerine gelince görünür. “Net Satış: iptal edilen siparişler hariç, indirim sonrası tutar.” Copilot da bu açıklamaları okur; “Yapay zekâ için verileri hazırla” (Prep data for AI) çalışmasının bir parçasıdır.</li>
<li><b>Veri kategorisi</b> (Data category): Sütun araçları sekmesinde. <code>Musteriler[Sehir]</code>’i “Şehir” yaparsan harita görseli değeri doğru konumlar; “Web URL’si” bağlantıyı tıklanabilir, “Görüntü URL’si” resmi tabloda gösterir. Veri türüne uymayan kategoriler devre dışıdır.</li>
<li><b>Varsayılan özetleme</b> (Summarization): Power BI sayısal sütunları görsele koyunca toplar. <code>UrunNo</code>, <code>Musteriler[DogumYili]</code> ya da <code>Tarih[Yil]</code> toplanınca anlamsız sayılar çıkar; bu sütunlarda özetlemeyi <b>Özetleme</b> (Don’t summarize) yap. Fiyat gibi birim değerler için toplam yerine ortalama daha doğru bir varsayılandır; asıl hesap yine ölçüyle yapılmalı.</li>
</ul>

<h2>Sütunu nerede hesaplamalı?</h2>
<div class="tbl-wrap"><table>
<tr><th>Yer</th><th>Artısı</th><th>Eksisi</th></tr>
<tr><td>Kaynak (SQL görünümü, veri ambarı)</td><td>Tek doğru, tüm raporlar paylaşır, en iyi sıkıştırma.</td><td>Veritabanı ekibine bağımlılık.</td></tr>
<tr><td>Power Query</td><td>Rapor geliştiricisinin elinde, katlanabilir, iyi sıkışır.</td><td>Yalnızca bu model (ya da veri akışı) kullanır.</td></tr>
<tr><td>DAX hesaplanmış sütun</td><td>Model ilişkilerini ve diğer tabloları görür (RELATED, ölçüler).</td><td>Yüklemeden sonra ayrıca hesaplanır, daha az verimli saklanır, katlanmaz.</td></tr>
</table></div>
<p>Örneğin Satislar’a <code>RELATED(Kategoriler[Kategori])</code> ile bir kategori sütunu eklemek gereksizdir: ilişki zaten filtreyi taşır. Hesaplanmış sütun, Power Query’de kolayca yapılamayan ve model bilgisi gerektiren durumlar için kalsın; örneğin bir müşterinin ömür boyu satışına göre segment, sabit bir değer olarak gerekiyorsa.</p>
`,
  ex: [
    { t: 'dax', name: 'Elektronik Satışı (Zincir)', q: '<b>Elektronik Satışı (Zincir)</b>: kategorisi Kategoriler tablosunda “Elektronik” olan ve iptal edilmemiş satış satırlarının <code>Tutar</code> toplamı. Kategoriye satış satırından iki ilişki üzerinden (Satislar → Urunler → Kategoriler) ulaş.', sol: 'SUMX(FILTER(Satislar, RELATED(Kategoriler[Kategori]) = "Elektronik" && Satislar[Durum] <> "İptal"), Satislar[Tutar])', hint: 'FILTER(Satislar, …) içinde RELATED(Kategoriler[Kategori]) zinciri izler. Durum koşulunu && ile ekle, sonra SUMX ile Satislar[Tutar]’ı topla.' },
    { t: 'dax', name: 'Kategori İçi Pay %', q: '<b>Kategori İçi Pay %</b>: her ürünün <code>[Net Satış]</code>’ının, o ürünün kendi kategorisinin toplam net satışına oranı. Ürün filtresini kaldır ama kategoriyi koru.', sol: 'DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Urunler[Urun]), VALUES(Urunler[Kategori])))', hint: 'Payda: CALCULATE([Net Satış], REMOVEFILTERS(Urunler[Urun]), VALUES(Urunler[Kategori])). VALUES, geçerli ürünün kategorisini filtre olarak geri koyar.', grid: [{ t: 'Urunler', c: 'Urun' }] },
    { t: 'mc', q: 'Matriste Kategori → Ürün detaya inme istiyorsun. Kategori <code>Kategoriler</code> tablosunda, ürün adı <code>Urunler</code> tablosunda. Neden tek bir hiyerarşi oluşturamazsın?', o: ['Hiyerarşinin düzeyleri aynı tabloda olmalı', 'Kategori metin, ürün adı sayı olmalı', 'İlişki çift yönlü değil', 'Hiyerarşi yalnızca tarih sütunlarında çalışır'], a: 0, why: 'Hiyerarşi tek tablonun sütunlarından kurulur. Ya görselde iki alanı ayrı ayrı sürükleyip detaya inersin ya da kategoriyi ürün tablosuna düzleştirip hiyerarşiyi orada kurarsın.' },
    { t: 'mc', q: 'Bir bayi listesinde <code>BayiKodu</code> yalnızca bölge içinde benzersiz; satış dosyasında da <code>BolgeKodu</code> ve <code>BayiKodu</code> var. İlişkiyi nasıl kurarsın?', o: ['İki ayrı ilişki kurup ikisini de etkin yaparsın', 'Yalnızca BayiKodu ile çoka-çok ilişki kurarsın', 'İki tarafta da birleşik bir anahtar sütunu oluşturursun', 'Bayi listesini satış tablosuna ekleme (append) ile katarsın'], a: 2, why: 'Power BI ilişkisi her tarafta tek sütun kullanır. “Bölge|Bayi” gibi bir anahtar iki tarafta da oluşturulur (tercihen Power Query’de). Yalnızca BayiKodu ile kurulan ilişki farklı bölgelerdeki aynı kodları karıştırır.' },
    { t: 'mc', q: 'Bir kullanıcı tablo görseline <code>Musteriler[DogumYili]</code>’nı sürükledi ve tek satırda 297.530 gibi bir sayı gördü. Ne yapmalısın?', o: ['Sütunun veri türünü metne çevirirsin', 'Varsayılan özetlemeyi “Özetleme” yaparsın', 'Sütunu modelden tamamen silersin', 'Görseli tek değerli kart görseline çevirirsin'], a: 1, why: 'Power BI sayısal sütunları varsayılan olarak toplar. Doğum yılı, kod ve yıl gibi sütunlar toplanmamalı; “Özetleme” ayarı değerleri tek tek listeler. Türü metne çevirmek sıralamayı ve hesaplamaları bozar.' }
  ]
});
})(window);
