/* Kesit Power BI — “Derinleş” bölümleri (çekirdek DAX derslerine ileri notlar) ve “DAX ve Power BI mülakatına hazırlık” dersi. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const find = id => L.find(l => l.id === id);
const deep = (id, title, html) => { const l = find(id); if (l) l.body += '<section class="deep"><span class="eyebrow">Derinleş</span><h2>' + title + '</h2>' + html + '</section>'; };

deep('baglam', 'Toplam satırı neden satırların toplamı değildir?', `
<p>Matristeki <b>Toplam</b> satırı, üstteki hücreleri toplamaz. Ölçü, toplam satırının kendi filtre bağlamında (yani kategori filtresi olmadan) <b>yeniden hesaplanır</b>. Toplanabilir ölçülerde (SUM gibi) bu fark görünmez; toplanamayan ölçülerde ise toplam, satırların toplamından farklı çıkar.</p>
<pre class="dax">Müşteri Sayısı (kategori toplamı) =
SUMX(VALUES(Urunler[Kategori]), [Müşteri Sayısı])</pre>
<p>Bu modelde <code>[Müşteri Sayısı]</code> toplamda <b>136</b>, ama yukarıdaki ölçü <b>628</b> verir. Bir müşteri birden çok kategoriden alışveriş yaptığı için her kategoride yeniden sayılır. Hangisi doğru? Soruya bağlı: “kaç farklı müşterimiz var?” sorusunun cevabı 136’dır. Toplam satırının satırların toplamını göstermesi gerekiyorsa SUMX ile açıkça öyle yazmak gerekir.</p>
<p>Toplam satırında farklı bir şey göstermek (ya da hiçbir şey göstermemek) için hücrenin hangi düzeyde olduğunu sorabilirsin:</p>
<pre class="dax">Kategori Satışı (yalnızca satırlarda) =
IF(ISINSCOPE(Urunler[Kategori]), [Net Satış], BLANK())</pre>
<div class="note"><b>Kural</b>Bir ölçünün toplamı “yanlış” görünüyorsa önce şunu sor: toplam satırının filtre bağlamı ne? Cevap neredeyse her zaman “satırlardaki filtrenin olmadığı bağlam”dır.</div>`);

deep('calculate', 'Filtre argümanı aslında bir tablodur', `
<p><code>CALCULATE([Net Satış], Urunler[Kategori] = "Elektronik")</code> yazdığında DAX bunu şuna çevirir:</p>
<pre class="dax">Elektronik Satış =
CALCULATE([Net Satış], FILTER(ALL(Urunler[Kategori]), Urunler[Kategori] = "Elektronik"))</pre>
<p>İçteki <code>ALL</code>, kategori sütunundaki dış filtreyi <b>kaldırır</b>. Bu yüzden ölçüyü kategoriye göre bir matrise koyduğunda her satırda Elektronik’in satışı (339.304 ₺) görünür: Giyim satırında da, Kitap satırında da. Bu bir hata değil, “filtreyi değiştir” davranışıdır.</p>
<p>Dış filtreyi silmek yerine onunla <b>kesiştirmek</b> istiyorsan KEEPFILTERS kullan:</p>
<pre class="dax">Elektronik Satış (kesişim) =
CALCULATE([Net Satış], KEEPFILTERS(Urunler[Kategori] = "Elektronik"))</pre>
<p>Bu sürüm Elektronik satırında 339.304 ₺, diğer kategorilerde BLANK döndürür; görsel de yalnızca Elektronik satırını gösterir.</p>
<h3>Sütun filtresi mi, tablo filtresi mi?</h3>
<p><code>FILTER(Urunler, Urunler[Fiyat] &gt; 1000)</code> bütün <code>Urunler</code> tablosunu filtre olarak verir; tablo, o anki bağlamda görünen satırlarla ve tüm sütunlarıyla gelir. <code>Urunler[Fiyat] &gt; 1000</code> ise yalnızca Fiyat sütununu filtreler. Bu örnekte iki yazım aynı sonucu verir, ama tablo filtresi daha yavaştır ve filtre bağlamındaki diğer Urunler sütunlarını da sabitler. Önce sütun filtresini dene; tablo filtresine yalnızca koşul birden çok tablodan sütun ya da bir ölçü içerdiğinde ihtiyaç duyarsın.</p>`);

deep('iteratorler', 'Ortalamaların ortalaması tuzağı', `
<p>“Kategorilerin ortalama sepeti” ile “ortalama sepet” aynı şey değildir:</p>
<pre class="dax">Kategori Ortalaması =
AVERAGEX(VALUES(Urunler[Kategori]), [Ortalama Sepet])</pre>
<p>Bu modelde <code>[Ortalama Sepet]</code> <b>1.493 ₺</b>, kategori ortalamalarının ortalaması ise <b>893 ₺</b>. AVERAGEX her kategoriye eşit ağırlık verir: 20 siparişlik bir kategori ile 300 siparişlik bir kategori ortalamayı aynı ölçüde etkiler. Bir sipariş birden çok kategoriden ürün içerdiğinde, kategori düzeyinde siparişler parçalandığı için ortalama daha da düşer.</p>
<p>Kural: ortalamayı her zaman <b>pay ve paydanın oranı</b> olarak hesapla (<code>DIVIDE([Net Satış], [Sipariş Sayısı])</code>). AVERAGEX’i yalnızca soru gerçekten “grupların ortalaması” olduğunda kullan, ör. “bir mağazanın ortalama aylık cirosu”.</p>
<h3>Bir iteratör kaç kez hesaplar?</h3>
<p><code>SUMX(Satislar, ...)</code> her satırda ifadeyi bir kez hesaplar. İfade bir ölçü ise her satırda bağlam geçişi de olur. Satır sayısı 1.000’i geçtiğinde bunun maliyeti hissedilir. Aynı sonucu daha az satır üzerinde döndürebilirsen (ör. <code>VALUES(Urunler[Urun])</code> üzerinde) her zaman tercih et.</p>`);

deep('var-mantik', 'VAR, tanımlandığı yerde ve bir kez hesaplanır', `
<p>Mülakatlarda en sık sorulan DAX tuzaklarından biri:</p>
<pre class="dax">Web Satışı (hatalı) =
VAR S = [Net Satış]
RETURN CALCULATE(S, Satislar[Kanal] = "Web")</pre>
<p>Bu ölçü <b>1.250.772 ₺</b> döndürür, yani tüm kanalların satışını. Beklenen ise 457.331 ₺. Sebep: <code>S</code> değişkeni tanımlandığı satırda, o anki filtre bağlamında hesaplanır ve bir <b>sabite</b> dönüşür. CALCULATE’in değiştirdiği filtre, artık hesaplanmış bir sayıyı etkilemez. Doğrusu, ölçüyü CALCULATE’in içinde çağırmaktır:</p>
<pre class="dax">Web Satışı =
CALCULATE([Net Satış], Satislar[Kanal] = "Web")</pre>
<p>Değişkenlerin bu davranışı aynı zamanda avantajdır: bir değeri dış bağlamda bir kez hesaplayıp sonra farklı bir bağlamda karşılaştırmak için kullanılır, ör. “ürünün satışı, kategorinin ortalamasından büyük mü?”.</p>
<div class="note"><b>Tablo değişkenleri de sabittir</b><code>VAR T = FILTER(...)</code> bir kez hesaplanır. T’yi CALCULATE’e filtre olarak verebilirsin, ama T’nin içeriği CALCULATE’in değiştirdiği bağlama göre yeniden hesaplanmaz.</div>`);

deep('zaman', 'Tarih tablosu olarak işaretlemek ne değiştirir?', `
<p>Tarih tablosunu “tarih tablosu olarak işaretle”diğinde Power BI, tarih sütunu (<code>Tarih[Tarih]</code>) üzerine kurulan her filtreye otomatik olarak <code>REMOVEFILTERS(Tarih)</code> ekler. Bu yüzden şu kümülatif ölçü, satırlarda <code>Tarih[YilAy]</code> olsa bile doğru çalışır:</p>
<pre class="dax">Kümülatif (tarih sütunuyla) =
VAR Son = MAX(Tarih[Tarih])
RETURN CALCULATE([Net Satış], Tarih[Tarih] &lt;= Son)</pre>
<p>Aynı mantığı yıl sütunuyla elle kurmak ise bozulur:</p>
<pre class="dax">Satış GY (elle) =
VAR Y = MAX(Tarih[Yil])
RETURN CALCULATE([Net Satış], Tarih[Yil] = Y - 1)</pre>
<p>Bu ölçü <code>Tarih[Ay]</code> kırılımında doğru sonuç verir, ama <code>Tarih[YilAy]</code> kırılımında <b>her hücrede BLANK</b> döner: “2024-03” filtresi yerinde kalır, üstüne “Yıl = 2023” eklenir ve iki filtreyi aynı anda sağlayan tarih yoktur. <code>SAMEPERIODLASTYEAR</code> bu sorunu yaşamaz, çünkü tarih sütunu üzerinden çalışır ve diğer tarih filtrelerini kaldırır.</p>
<div class="warn"><b>Zaman zekâsının üç ön koşulu</b>1) Tarih sütunu kesintisiz olmalı: ilk yılın 1 Ocak’ından son yılın 31 Aralık’ına her gün bir satır. 2) Tablo, tarih tablosu olarak işaretlenmeli. 3) Olgu tablosu tarih tablosuna bu tarih sütunuyla bağlanmalı. Biri eksikse ölçü hata vermez; yalnızca yanlış sonuç verir.</div>`);

deep('filter-all', 'Genişletilmiş tablolar: ALL(Satislar) neden kategori filtresini de siler?', `
<p>DAX’ta bir olgu tablosu, ilişkili olduğu boyut tablolarının sütunlarını da “içerir”. Buna <b>genişletilmiş tablo</b> denir: <code>Satislar</code>, çoktan bire ilişkiler üzerinden <code>Urunler</code>, <code>Musteriler</code> ve <code>Tarih</code> sütunlarını da kapsar. Bu yüzden:</p>
<pre class="dax">Tüm Satışlar =
CALCULATE([Net Satış], ALL(Satislar))</pre>
<p>kategori kırılımında her satırda <b>1.250.772 ₺</b> (genel toplam) verir. Kategori filtresi <code>Urunler</code> tablosunda olduğu halde ALL(Satislar) onu da kaldırır, çünkü Urunler[Kategori] genişletilmiş Satislar tablosunun bir parçasıdır. Tersi doğru değildir: <code>ALL(Urunler)</code> yalnızca ürün tablosundaki filtreleri siler; <code>Satislar[Kanal]</code> filtresi yerinde kalır.</p>
<pre class="dax">Kanal Filtresiz Satış =
CALCULATE([Net Satış], ALL(Satislar[Kanal]))</pre>
<p>Tek bir sütunu hedeflemek ise genişletmeye girmez: yukarıdaki ölçü yalnızca kanal filtresini kaldırır; kategori, tarih ve müşteri filtreleri korunur. Pratik kural: <b>tüm tabloyu değil, kaldırmak istediğin sütunu ya da boyut tablosunu</b> hedefle. Niyetini en açık gösteren yazım <code>REMOVEFILTERS(Urunler)</code> gibi boyut tablosunu adıyla anmaktır.</p>`);

deep('baglam-gecisi', 'Bağlam geçişi hangi satırları filtreler?', `
<p>Satır bağlamı CALCULATE ile filtreye dönüştüğünde, mevcut satırın <b>tüm sütunlarının</b> değeri filtre olur. Satır benzersizse bu, tam olarak o satırı seçer. Ama tablo birbirinin aynısı iki satır içeriyorsa, bağlam geçişi ikisini birden seçer ve iteratör her birinde iki satırın toplamını görür: sonuç iki katına çıkar.</p>
<p>Bu modelde <code>Satislar[SatirNo]</code> her satırı benzersiz kıldığı için <code>SUMX(Satislar, [Net Satış])</code> doğru sonuç verir. Ama anahtarı olmayan bir tabloda (ör. Excel’den gelen, satır numarası olmayan bir liste) aynı ölçü sessizce yanlış toplar. Olgu tablolarında benzersiz bir satır anahtarı tutmanın bir sebebi de budur.</p>
<pre class="dax">Ürün Başına Satış (doğru düzey) =
SUMX(VALUES(Urunler[Urun]), [Net Satış])</pre>
<p>İkinci kural: iteratörü <b>sorunun düzeyinde</b> döndür. “Her ürünün satışı” sorusu ürün listesinde döner; 3.000 satırlık olgu tablosunda dönmek hem yavaştır hem de yukarıdaki tekrar riskini taşır.</p>
<div class="note"><b>EARLIER nereden çıktı?</b>Eski DAX kodlarında iç içe satır bağlamlarında dıştaki satıra erişmek için <code>EARLIER</code> görürsün. Bugün aynı iş, dış satırın değerini bir <code>VAR</code>’a alarak çok daha okunur yapılır.</div>`);

deep('tablo-fonk', 'SUMMARIZE ile gruplama, ADDCOLUMNS ile hesaplama', `
<p>SUMMARIZE’ın içinde hesaplanmış sütun (<code>"Satış", [Net Satış]</code>) tanımlamak çalışır ama önerilmez: SUMMARIZE bu sütunları beklenmedik bir filtre bağlamında hesaplayabilir ve sonuç, özellikle aynı tablodan birden çok sütunla gruplandığında yanıltıcı olur. Güvenli kalıp, gruplamayı SUMMARIZE’a, hesaplamayı ADDCOLUMNS’a bırakmaktır:</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    SUMMARIZE(Satislar, Urunler[Kategori]),
    "Satış", [Net Satış]
)</pre>
<p>ADDCOLUMNS her satır için ölçüyü bağlam geçişiyle çağırır; yani her kategori satırında <code>[Net Satış]</code> o kategorinin filtresiyle hesaplanır. Yalnızca sorgu yazıyorsan <code>SUMMARIZECOLUMNS</code> daha da iyidir: gruplama ile hesaplamayı tek adımda yapar ve tüm ölçüleri BLANK olan satırları otomatik atar.</p>`);

deep('pencere', 'Pencere fonksiyonlarında üç gizli varsayım', `
<p>OFFSET, INDEX ve WINDOW kısa yazılır, ama arka planda üç varsayım yapar. Mülakatta da sık sorulur:</p>
<ol>
<li><b>Bağlam ilişkisi (relation) belirtilmezse</b> fonksiyon, görseldeki <code>ALLSELECTED</code> kümesini kullanır. Yani dilimleyiciyle gizlenen aylar “önceki ay” sayılmaz.</li>
<li><b>ORDERBY belirtilmezse</b> sıralama, ilişkideki sütunların kendi sırasıdır. Ay adına göre (“Ağu, Ara, Eki…”) sıralanan bir sütunda “önceki ay” alfabetik önceki ay olur. Her zaman sayısal bir sıralama sütunu (YilAy, AyNo) kullan.</li>
<li><b>PARTITIONBY belirtilmezse</b> tüm satırlar tek bir bölümdür. “Her yıl kendi içinde ilk ay” gibi sorular için yılı bölüm olarak vermek gerekir.</li>
</ol>
<pre class="dax">Önceki Ay Satış =
CALCULATE([Net Satış], OFFSET(-1, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC)))</pre>
<p>Zaman zekâsı fonksiyonlarından (PREVIOUSMONTH, DATEADD) farkı: pencere fonksiyonları bir <b>takvim bilmez</b>. İlişki olarak olgu tablosundan türetilmiş bir liste verirsen (ör. <code>SUMMARIZE(Satislar, Tarih[YilAy])</code>), satış olmayan ay listede yer almaz ve OFFSET onu atlayıp bir önceki “mevcut” aya bakar. Takvim aylarına göre karşılaştırma gerekiyorsa zaman zekâsı, “bir önceki satır” gerekiyorsa pencere fonksiyonu doğru araçtır.</p>`);

deep('dax-opt', 'Formula Engine ve Storage Engine', `
<p>Bir DAX sorgusu iki motorda çalışır. <b>Storage Engine</b> (VertiPaq), sıkıştırılmış sütunları çok çekirdekli ve çok hızlı tarar; ama yalnızca basit işler bilir: filtrele, grupla, topla, say. <b>Formula Engine</b> geri kalan her şeyi yapar: koşullar, iç içe iteratörler, karmaşık mantık. Formula Engine tek çekirdekte çalışır.</p>
<p>Optimizasyonun özü, işi Storage Engine’e bırakmaktır:</p>
<ul>
<li><b>Sütun filtresi tablo filtresinden hızlıdır.</b> <code>Urunler[Fiyat] &gt; 1000</code> doğrudan Storage Engine sorgusuna dönüşür; <code>FILTER(Urunler, ...)</code> çoğu zaman Formula Engine’de satır satır değerlendirilir.</li>
<li><b>İteratör içinde IF “geri çağırma” (callback) üretir.</b> <code>SUMX(Satislar, IF(...))</code> her satır için Formula Engine’e döner. Koşulu CALCULATE filtresine taşıyabiliyorsan taşı.</li>
<li><b>Değişkenler tekrar hesaplamayı önler.</b> Aynı ölçüyü bir formülde üç kez çağırmak, üç ayrı hesaplama demektir; VAR ile bir kez hesaplanır.</li>
<li><b>Kardinalite her şeyden önemlidir.</b> Bir sütundaki farklı değer sayısı sıkıştırmayı ve tarama hızını belirler. Tarih-saat sütununu tarih ve saat diye ikiye bölmek, modeli birkaç kat küçültebilir.</li>
</ul>
<pre class="dax">Pahalı Satırlar Satışı =
CALCULATE([Net Satış], Satislar[Tutar] &gt; 2000)</pre>
<p>Bu yazım, aynı sonucu veren <code>SUMX(Satislar, IF(Satislar[Tutar] &gt; 2000, Satislar[Tutar]))</code> gibi bir iteratörden daha ölçeklenebilirdir. Gerçek modelde farkı görmek için Performans Analizcisi ile sorguyu kopyalayıp DAX Studio’da “Server Timings” ile SE ve FE sürelerine bak.</p>`);

/* ---------- Yeni ders: mülakata hazırlık ---------- */
L.push({
  id: 'mulakat', lv: 'C1', mod: 'Kariyer', min: 22,
  title: 'DAX ve Power BI mülakatına hazırlık',
  sum: 'BI mülakatlarının yapısı, en sık sorulan 12 kavram sorusu ve kısa model cevapları, canlı DAX sorusuna yaklaşım, klasik tuzaklar ve vaka sorusunu anlatma yöntemi.',
  body: `
<h2>Bir BI mülakatı nasıl ilerler?</h2>
<p>Veri analisti ve BI geliştirici mülakatları genellikle dört bölümden oluşur. Her biri farklı bir şeyi ölçer:</p>
<div class="tbl-wrap"><table>
<tr><th>Bölüm</th><th>Ne ölçülür?</th><th>Nasıl hazırlanılır?</th></tr>
<tr><td>Kavram soruları</td><td>Filtre bağlamı, ilişkiler, model tasarımı gibi temellerin anlaşılması</td><td>Aşağıdaki 12 soruyu kendi cümlelerinle, örnekle cevaplayabilmek</td></tr>
<tr><td>Canlı DAX ya da SQL</td><td>Bir iş sorusunu doğru ölçüye çevirme ve sesli düşünme</td><td>Arena meydan okumaları ve Sınavlar’daki kod sınavları</td></tr>
<tr><td>Vaka ya da rapor eleştirisi</td><td>Bir dashboard’u okuma, sorunu bulma, öneri sunma</td><td>Dashboardlar bölümü ve DAX Dedektif vakaları</td></tr>
<tr><td>Davranışsal</td><td>Paydaşla çalışma, belirsizlik, hata yönetimi</td><td>2–3 gerçek proje hikâyesini Durum–Görev–Eylem–Sonuç yapısıyla hazırlamak</td></tr>
</table></div>

<h2>En sık sorulan 12 kavram sorusu</h2>
<p>Her cevap üç parçadan oluşmalı: tanım, kısa bir örnek ve “ne zaman önemli”. Ezberden okunan tanım değil, örnek ikna eder.</p>
<details class="faq"><summary>1. Filtre bağlamı ile satır bağlamı arasındaki fark nedir?</summary><p>Filtre bağlamı, bir hücre hesaplanırken modelde hangi satırların görünür olduğudur (görselin satırları, dilimleyiciler, CALCULATE filtreleri). Satır bağlamı ise bir iteratörün ya da hesaplanmış sütunun “şu anki satır” bilgisidir ve kendi başına filtrelemez. Örnek: hesaplanmış sütunda <code>SUM(Satislar[Tutar])</code> her satırda tablonun toplamını verir, çünkü satır bağlamı filtre değildir.</p></details>
<details class="faq"><summary>2. CALCULATE ne yapar?</summary><p>İfadeyi değiştirilmiş bir filtre bağlamında hesaplar: filtre argümanları ilgili sütunlardaki dış filtreleri değiştirir, satır bağlamı varsa önce filtreye dönüştürür (bağlam geçişi). DAX’ta filtre bağlamını değiştirebilen fonksiyonlar yalnızca CALCULATE ve CALCULATETABLE’dır.</p></details>
<details class="faq"><summary>3. SUM ile SUMX farkı nedir?</summary><p>SUM tek bir sütunu toplar. SUMX bir tabloyu satır satır dolaşır, her satırda bir ifade hesaplar ve sonuçları toplar: <code>SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat])</code>. Satır düzeyinde bir hesap gerekiyorsa SUMX; yoksa SUM daha sade ve aynı hızdadır.</p></details>
<details class="faq"><summary>4. Bağlam geçişi nedir?</summary><p>Satır bağlamında bir ölçü çağrıldığında ya da CALCULATE kullanıldığında, mevcut satırın değerleri filtreye dönüşür. Ölçüler örtük bir CALCULATE içerdiği için <code>SUMX(VALUES(Urunler[Urun]), [Net Satış])</code> her üründe o ürünün satışını hesaplar.</p></details>
<details class="faq"><summary>5. ALL, ALLSELECTED ve REMOVEFILTERS farkı?</summary><p>ALL ve REMOVEFILTERS, CALCULATE içinde filtreleri tamamen kaldırır (REMOVEFILTERS yalnızca bu iş için vardır ve niyeti daha açık gösterir). ALL ayrıca tablo döndürebilir. ALLSELECTED görselin kendi satır ve sütunlarından gelen filtreleri kaldırır ama dilimleyici ve sayfa filtrelerini korur: “ekranda görünen toplam içindeki pay” için kullanılır.</p></details>
<details class="faq"><summary>6. Yıldız şema neden önerilir?</summary><p>Olgu tablosu ortada, boyut tabloları çevresinde ve ilişkiler bire-çok olduğunda filtreler tek yönde, öngörülebilir biçimde akar; VertiPaq daha iyi sıkıştırır ve DAX daha basit kalır. Düz (tek tablo) model, tekrar eden metin sütunları yüzünden büyür ve “müşteri başına” gibi ölçüleri zorlaştırır.</p></details>
<details class="faq"><summary>7. Çift yönlü ilişki ne zaman sorun olur?</summary><p>Filtrenin iki yönde akması belirsiz yollar ve döngüler yaratabilir; sonuçlar beklenmedik değişir ve performans düşer. Gerektiğinde ilişkiyi tek yönlü bırakıp ölçü içinde <code>CROSSFILTER(..., BOTH)</code> ile yalnızca o hesap için açmak daha güvenlidir.</p></details>
<details class="faq"><summary>8. Hesaplanmış sütun mu, ölçü mü?</summary><p>Hesaplanmış sütun yenilemede bir kez hesaplanır, modelde yer kaplar ve dilimleyicide, satır alanında kullanılabilir. Ölçü sorgu anında, filtre bağlamına göre hesaplanır ve yer kaplamaz. Kural: değeri satır düzeyinde bir özellik olarak filtrelemek ya da gruplamak istiyorsan sütun; toplanacak bir sayıysa ölçü.</p></details>
<details class="faq"><summary>9. Zaman zekâsı için neden ayrı bir tarih tablosu gerekir?</summary><p>Zaman fonksiyonları kesintisiz bir tarih sütunu bekler. Olgu tablosundaki tarihlerde boşluk olur (satış olmayan günler). Ayrıca ayrı tablo; yıl, çeyrek, ay ve tatil gibi sütunları tek yerde tutar ve birden çok olgu tablosunu aynı takvimle filtreler.</p></details>
<details class="faq"><summary>10. Satır düzeyi güvenlik (RLS) nasıl çalışır?</summary><p>Bir rol, bir tabloya DAX filtresi ekler (ör. <code>[Bolge] = "Marmara"</code>); filtre ilişkiler üzerinden olgu tablosuna yayılır. Dinamik RLS’te filtre kullanıcının e-postasıyla eşleşen satırları seçer: <code>[Eposta] = USERPRINCIPALNAME()</code>. Roller yayından sonra hizmette kullanıcılara atanır ve “Farklı görüntüle” ile test edilir.</p></details>
<details class="faq"><summary>11. Yavaş bir raporu nasıl incelersin?</summary><p>Önce ölç: Performans Analizcisi ile hangi görselin ve hangi aşamanın (DAX sorgusu mu, görsel çizimi mi) yavaş olduğunu bul. Sorgu yavaşsa DAX Studio’da Server Timings’e bak. Sonra en sık sebepleri ele: yüksek kardinaliteli sütunlar, gereksiz sütunlar, çift yönlü ilişkiler, iteratör içindeki koşullar, sayfadaki görsel sayısı.</p></details>
<details class="faq"><summary>12. Import, DirectQuery ve Direct Lake arasında nasıl seçim yaparsın?</summary><p>Import en hızlı sorguyu verir ama veri yenileme zamanına kadar eskidir ve model belleğe sığmalıdır. DirectQuery veriyi kaynağında sorgular; güncel ama yavaştır ve DAX kısıtları vardır. Direct Lake (Fabric) Delta tablolarını doğrudan belleğe okur: Import’a yakın hız, kopya ve yenileme gerektirmeden güncellik.</p></details>

<h2>Canlı DAX sorusuna yaklaşım</h2>
<p>Mülakatçı doğru formülden çok <b>düşünme biçimini</b> izler. Beş adımlı bir yol işe yarar:</p>
<ol>
<li><b>Soruyu netleştir.</b> “Net satış iptalleri içeriyor mu? Toplam satırında ne görünmeli?” gibi bir iki soru sormak eksiklik değil, profesyonelliktir.</li>
<li><b>Görseli tarif et.</b> “Satırlarda kategori, sütunda yıl olan bir matris düşünüyorum.” Filtre bağlamını konuşulur hâle getirir.</li>
<li><b>Mevcut ölçülerden kur.</b> <code>[Net Satış]</code> varsa SUM’ı yeniden yazma; ölçüleri birbirinin üzerine kurmak, iyi model alışkanlığıdır.</li>
<li><b>VAR ile adım adım yaz</b> ve her değişkenin ne tuttuğunu söyle.</li>
<li><b>Bir hücreyle doğrula.</b> “Elektronik 2024 hücresinde bu ölçü şunu verir; toplam satırında ise şunu.” Sınır durumlarını (BLANK, ilk yıl, sıfıra bölme) kendin söyle.</li>
</ol>

<h2>Mülakatçının sevdiği tuzaklar</h2>
<div class="tbl-wrap"><table>
<tr><th>Tuzak</th><th>Ne olur?</th><th>Ders</th></tr>
<tr><td>VAR’ı CALCULATE’ten önce hesaplamak</td><td>Değişken sabittir; filtre onu değiştirmez</td><td>VAR, mantık</td></tr>
<tr><td><code>[A] - [GY]</code> ilk yılda</td><td>BLANK 0 sayılır; tüm satış “büyüme” görünür</td><td>BLANK ve hatalar</td></tr>
<tr><td><code>Tarih[Yil] = Y - 1</code> ile geçen yıl</td><td>Ay-yıl kırılımında her hücre BLANK</td><td>Zaman zekâsı</td></tr>
<tr><td>Ortalamaların ortalaması</td><td>Küçük gruplar ortalamayı orantısız etkiler</td><td>İteratörler</td></tr>
<tr><td><code>ALL(Satislar)</code></td><td>Boyut filtreleri de silinir (genişletilmiş tablo)</td><td>ALL ailesi</td></tr>
<tr><td>Toplam satırının toplam olmaması</td><td>Toplanamayan ölçüler toplamda yeniden hesaplanır</td><td>Filtre bağlamı</td></tr>
</table></div>
<p>Bu tuzakların hepsi derslerin “Derinleş” bölümlerinde gerçek verilerle gösteriliyor.</p>

<h2>Vaka sorusunu anlatmak</h2>
<p>“Bu dashboard’a bakıp ne söylersin?” sorusunda sonuca değil, <b>yola</b> puan verilir. Önce genel resmi (toplam, eğilim), sonra en büyük sapmayı, sonra sebebi aradığın kırılımları anlat ve bir öneriyle bitir. DAX Dedektif vakaları tam olarak bu akışı çalıştırır. Sınavlar bölümündeki <b>Mülakat simülasyonu</b> ise süreli bir canlı DAX turudur ve her sorudan sonra gerçek mülakatlardaki gibi bir takip sorusu gösterir.</p>
<p>Rol bazlı kavram soru bankası (zayıf ve güçlü cevap örnekleriyle), davranışsal sorular, ev ödevi vakası ve dashboard eleştirisi alıştırması için menüdeki <b>Mülakat hazırlığı</b> bölümüne, sık karıştırılan kavramlar ve hatalar için de <b>Sık karıştırılanlar</b> ve <b>Sık yapılan hatalar</b> sayfalarına bak.</p>`,
  ex: [
    { t: 'mc', q: 'Mülakatçı şu ölçüyü gösteriyor: <code>VAR S = [Net Satış] RETURN CALCULATE(S, Satislar[Kanal] = "Web")</code>. Ne döndürür?', o: ['Yalnızca Web kanalının net satışını; CALCULATE filtreyi değişkene de uygular', 'O anki bağlamın tüm net satışını; S önceden hesaplanmış bir sabittir', 'Söz dizimi hatası; VAR, CALCULATE içinde kullanılamaz', 'BLANK'], a: 1, why: 'Değişken tanımlandığı yerde, dış bağlamda bir kez hesaplanır. CALCULATE’in değiştirdiği filtre hesaplanmış bir sayıyı etkilemez.' },
    { t: 'mc', q: 'Matriste her kategorinin müşteri sayısı doğru, ama Toplam satırı satırların toplamından çok küçük. En doğru açıklama hangisi?', o: ['Matrisin toplam ayarı “toplam” yerine “ortalama” olarak bırakılmış', 'Toplamda ölçü kategori filtresi olmadan yeniden hesaplanır; aynı müşteri bir kez sayılır', 'Musteriler ile Satislar arasındaki ilişki tek yönlü olduğu için toplam satırı eksik kalıyor', 'DISTINCTCOUNT toplam satırında desteklenmez'], a: 1, why: 'Toplam satırı satırları toplamaz; ölçü o hücrenin bağlamında yeniden hesaplanır. Farklı müşteri sayısı toplanabilir bir ölçü değildir.' },
    { t: 'mc', q: '“Ekranda görünen toplam içindeki pay” ölçüsünde paydada hangisi kullanılmalı?', o: ['<code>ALL(Urunler)</code>', '<code>ALLSELECTED(Urunler[Kategori])</code>', '<code>VALUES(Urunler[Kategori])</code>', '<code>REMOVEFILTERS(Urunler[Kategori])</code>'], a: 1, why: 'ALLSELECTED görselin kendi kategori filtresini kaldırır ama dilimleyicilerle yapılan seçimi korur; böylece görünen kategorilerin payları %100 eder. ALL ve REMOVEFILTERS dilimleyici seçimini de siler.' },
    { t: 'mc', q: 'Bir analist, filtreleri iki yönde akıtmak için tüm ilişkileri çift yönlü yapmayı öneriyor. En iyi cevap hangisi?', o: ['Kabul etmek; böylece her görsel diğerlerini her iki yönde de filtreleyebilir', 'Tek yönde bırakıp gereken ölçüde CROSSFILTER ile açmak; çift yön belirsizlik yaratır', 'İlişkileri silip gereken tüm boyut sütunlarını LOOKUPVALUE ile olgu tablosuna taşımak', 'Modeli tek tabloya birleştirmek'], a: 1, why: 'Çift yönlü ilişkiler belirsiz filtre yolları ve performans sorunları yaratabilir. Gerektiği yerde ölçü içinde CROSSFILTER kullanmak etkiyi sınırlar.' },
    { t: 'mc', q: 'Canlı DAX sorusunda ilk yapman gereken hangisi?', o: ['Zaman kaybetmemek için hemen en kısa formülü yazıp çalıştırmak', 'Soruyu netleştirmek: tanımlar ve toplam satırı', 'Önce ölçünün yerine geçecek bir hesaplanmış sütun eklemek', 'Mülakatçıdan örnek çözümü istemek'], a: 1, why: 'Belirsiz bir iş sorusunu netleştirmek (iptaller dahil mi, toplam satırında ne görünmeli) doğru ölçünün yarısıdır. Mülakatçı bu adımı profesyonellik işareti olarak görür.' },
    { t: 'dax', name: 'Web Payı %', q: '<b>Web Payı %</b>: Bir aday şu ölçüyü yazmış ve her hücrede %100 görmüş: <code>VAR S = [Net Satış] RETURN DIVIDE(CALCULATE(S, Satislar[Kanal] = "Web"), S)</code>. Ölçüyü düzelt: Web kanalının o hücredeki net satış içindeki payını döndürsün. Değişken kullanmaya devam edebilirsin.', sol: 'VAR Toplam = [Net Satış]\nRETURN DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Web"), Toplam)', hint: 'Toplamı değişkende tutmak doğru; ama payda Web filtresinin işlemesi için ölçünün CALCULATE’in içinde çağrılması gerekir.' },
    { t: 'dax', name: 'İlk 3 Ürün Satışı', q: '<b>İlk 3 Ürün Satışı</b>: klasik bir mülakat sorusu. Her kategoride en çok satan 3 ürünün toplam net satışını döndür. Kontrol kategori kırılımında yapılır.', sol: 'CALCULATE([Net Satış], TOPN(3, ALL(Urunler[Urun]), [Net Satış]))', hint: 'TOPN(3, ürün listesi, [Net Satış]) ile ilk 3 ürünü bul ve CALCULATE’e filtre olarak ver. Ürün sütunundaki filtreyi ALL ile kaldır; kategori filtresi yerinde kalır.', grid: [{ t: 'Urunler', c: 'Kategori' }] },
    { t: 'dax', name: 'Tekrar Eden Müşteri', q: '<b>Tekrar Eden Müşteri</b>: birden fazla siparişi olan müşterilerin sayısı. Bu modelde 136 müşterinin 129’u tekrar sipariş vermiş.', sol: 'COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo])) > 1))', hint: 'Müşteri listesini (VALUES) FILTER ile süz: her müşterinin farklı sipariş sayısı (CALCULATE ile bağlam geçişi) 1’den büyük olsun. Sonra COUNTROWS.' }
  ]
});
if (W.PBI_ORDER && !W.PBI_ORDER.includes('mulakat')) W.PBI_ORDER.splice(W.PBI_ORDER.indexOf('pl300') + 1, 0, 'mulakat');
})(window);
