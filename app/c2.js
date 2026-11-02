/* Kesit Power BI içerik 2: Orta seviye */
(window.PBI_LESSONS = window.PBI_LESSONS || []).push(

{
  id: 'baglam', lv: 'orta', mod: 'DAX Bağlamları', min: 16,
  title: 'Filtre bağlamı ve satır bağlamı',
  sum: 'Aynı formül neden her hücrede farklı sonuç verir? DAX\'ın iki bağlamı.',
  body: `
<h2>Filtre bağlamı: “Şu an hangi satırlar görünüyor?”</h2>
<p>Bir matriste satıra <code>Kategoriler[Kategori]</code>, sütuna <code>Tarih[Yil]</code>, değere <code>[Toplam Satış]</code> koyduğunu düşün. “Kitap / 2024” hücresi hesaplanırken Power BI şunu yapar:</p>
<ol>
<li>Hücrenin koordinatlarından filtreler çıkarır: <code>Kategori = "Kitap"</code>, <code>Yil = 2024</code>.</li>
<li>Dilimleyici, sayfa ve rapor filtrelerini ekler (ör. <code>Kanal = "Web"</code>).</li>
<li>Filtreleri ilişkiler üzerinden <code>Satislar</code> tablosuna yayar.</li>
<li><code>SUM(Satislar[Tutar])</code>'ı yalnızca kalan satırlar üzerinde hesaplar.</li>
</ol>
<p>Bu filtrelerin tümüne <b>filtre bağlamı</b> denir. Formül hiç değişmez; değişen, formülün gördüğü satırlardır. Toplam satırında kategori filtresi yoktur, bu yüzden toplam tüm kategorileri kapsar.</p>
<div class="note"><b>Deney</b>DAX Stüdyosu'nda <code>SUM(Satislar[Tutar])</code> yaz ve satır eksenini Kategori, sonra Yıl, sonra Kanal yap. Aynı formül, farklı bağlam.</div>
<h2>Satır bağlamı: “Şu an hangi satırdayım?”</h2>
<p>Hesaplanmış sütunlarda ve <code>SUMX</code> gibi <b>yineleyicilerde</b> (iterator) DAX tablonun satırlarını tek tek dolaşır. Her adımda “geçerli satır” vardır; <code>Satislar[Adet]</code> yazdığında o satırın adedini okursun.</p>
<pre class="dax">Brüt Tutar = SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat])</pre>
<p><code>SUMX</code>, filtre bağlamında görünen her satış satırı için <code>Adet × BirimFiyat</code> hesaplar ve sonuçları toplar.</p>
<h2>İkisi aynı şey değil</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Filtre bağlamı</th><th>Satır bağlamı</th></tr>
<tr><td>Kaynağı</td><td>Görsel, dilimleyici, filtreler, CALCULATE</td><td>Hesaplanmış sütun, X ile biten fonksiyonlar, FILTER</td></tr>
<tr><td>Etkisi</td><td>Tablolardaki satırları süzer</td><td>Bir satırın değerlerini okumayı sağlar</td></tr>
<tr><td>İlişkileri izler mi?</td><td>Evet, kendiliğinden</td><td>Hayır; ilişkili tabloya <code>RELATED</code> ile gidilir</td></tr>
</table></div>
<div class="warn"><b>Sık hata</b>Bir ölçüde çıplak sütun yazmak: <code>Fiyat Ölçüsü = Satislar[BirimFiyat]</code>. Ölçünün satır bağlamı yoktur; hangi satırın fiyatı? DAX hata verir. Toplayıcı (<code>SUM</code>, <code>AVERAGE</code>, <code>MAX</code>) ya da yineleyici kullan.</div>
`,
  ex: [
    { t: 'mc', q: 'Bir matriste satırlarda Kategori var, değer [Toplam Satış]. “Toplam” satırı neden tüm kategorilerin toplamına eşit?', o: ['Power BI hücreleri ayrıca toplar', 'Toplam satırında kategori filtresi yoktur; ölçü tüm satırlarda yeniden hesaplanır', 'Toplam satırı her zaman SUM kullanır', 'Önbellekten gelir'], a: 1, why: 'Toplam satırı ayrı bir filtre bağlamıdır. SUM için sonuç aynıdır, ama oran gibi toplanamayan ölçülerde toplam satırı hücrelerin toplamı olmaz.' },
    { t: 'dax', q: '<b>Brüt Tutar</b>: her satış satırı için <code>Adet × BirimFiyat</code> hesapla ve topla (indirim öncesi tutar).', name: 'Brüt Tutar', sol: 'SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat])', hint: 'SUMX(Tablo, satır başına ifade)' },
    { t: 'mc', q: '[Kâr Marjı %] ölçüsü kategorilerde %40,5, %38,2, %34,4… gösteriyor. Toplam satırında ne görmeyi beklersin?', o: ['Yüzdelerin toplamını', 'Yüzdelerin basit ortalamasını', 'Toplam kârın toplam satışa oranını', 'Boş'], a: 2, why: 'Toplam satırında ölçü, filtresiz bağlamda yeniden hesaplanır: DIVIDE(toplam kâr, toplam satış).' }
  ]
},

{
  id: 'calculate', lv: 'orta', mod: 'DAX Bağlamları', min: 18,
  title: 'CALCULATE: filtre bağlamını değiştirmek',
  sum: 'DAX\'ın en güçlü fonksiyonu. Filtre eklemek, değiştirmek ve kaldırmak.',
  body: `
<h2>Söz dizimi</h2>
<pre class="dax" data-notry>CALCULATE( &lt;ifade&gt;, &lt;filtre1&gt;, &lt;filtre2&gt;, ... )</pre>
<p><code>CALCULATE</code>, ifadeyi <b>değiştirilmiş bir filtre bağlamında</b> hesaplar. Filtre bağımsız değişkenleri mevcut bağlamın üzerine yazılır, sonra ifade çalışır.</p>
<h2>Filtre eklemek</h2>
<pre class="dax">Web Satışı = CALCULATE([Toplam Satış], Satislar[Kanal] = "Web")</pre>
<p>Bu ölçüyü kategoriye göre bir tabloya koyarsan her kategorinin <i>yalnızca web</i> satışını görürsün. Kategori filtresi korunur, kanal filtresi eklenir.</p>
<h2>Filtrenin üzerine yazmak</h2>
<p>Dilimleyicide “Mobil” seçili olsa bile <code>[Web Satışı]</code> web satışını gösterir. Çünkü <code>Satislar[Kanal] = "Web"</code> filtresi, aynı sütundaki mevcut filtrenin <b>yerine geçer</b>. Mevcut filtreyi korumak istersen <code>KEEPFILTERS</code> kullanırsın:</p>
<pre class="dax">Web Satışı (seçimle) = CALCULATE([Toplam Satış], KEEPFILTERS(Satislar[Kanal] = "Web"))</pre>
<p>Bu sürümde dilimleyicide “Mobil” seçiliyse sonuç boş olur, çünkü iki filtre kesişir.</p>
<h2>Birden çok koşul</h2>
<pre class="dax">Mobil Elektronik = CALCULATE(
    [Toplam Satış],
    Satislar[Kanal] = "Mobil",
    Urunler[Kategori] = "Elektronik"
)

Kitap ve Spor = CALCULATE([Toplam Satış], Urunler[Kategori] IN {"Kitap", "Spor"})

İptal Dışı = CALCULATE([Toplam Satış], Satislar[Durum] &lt;&gt; "İptal")</pre>
<p>Ayrı bağımsız değişkenler <b>VE</b> ile birleşir. Aynı sütunda <b>VEYA</b> için <code>IN { }</code> ya da <code>||</code> kullanılır.</p>
<h2>Filtre kaldırmak</h2>
<pre class="dax">Tüm Kategoriler = CALCULATE([Toplam Satış], ALL(Urunler))
Pay % = DIVIDE([Toplam Satış], [Tüm Kategoriler])</pre>
<p><code>ALL</code> (ya da daha okunur adıyla <code>REMOVEFILTERS</code>) bir tablo ya da sütundaki filtreleri kaldırır. Payda her hücrede genel toplamı verir; böylece pay hesaplanır. Bir sonraki derste ayrıntısıyla göreceğiz.</p>
<div class="tip"><b>Akılda tut</b>Boolean filtre (<code>Satislar[Kanal] = "Web"</code>) aslında <code>FILTER(ALL(Satislar[Kanal]), Satislar[Kanal] = "Web")</code> tablosunun kısa yazımıdır. Bu yüzden mevcut kanal filtresinin üzerine yazar.</div>
`,
  ex: [
    { t: 'dax', q: '<b>Web Satışı</b>: yalnızca Web kanalındaki satış tutarı toplamı.', name: 'Web Satışı', sol: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] = "Web")', hint: 'CALCULATE(SUM(...), Satislar[Kanal] = "Web")' },
    { t: 'dax', q: '<b>Net Satış</b>: iptal edilen satırlar hariç satış tutarı. (<code>Durum</code> sütununda “İptal” değeri var.)', name: 'Net Satış', sol: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal")', hint: 'Eşit değildir işleci: <>' },
    { t: 'dax', q: '<b>Mobil Elektronik</b>: Mobil kanaldan yapılan Elektronik kategorisi satışları.', name: 'Mobil Elektronik', sol: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] = "Mobil", Urunler[Kategori] = "Elektronik")', hint: 'İki filtre bağımsız değişkeni virgülle ayrılır; ikisi de uygulanır.' },
    { t: 'dax', q: '<b>Premium Satış</b>: yalnızca Premium segmentindeki müşterilerin satış tutarı.', name: 'Premium Satış', sol: 'CALCULATE(SUM(Satislar[Tutar]), Musteriler[Segment] = "Premium")', hint: 'Segment sütunu Musteriler tablosunda; filtre ilişki üzerinden Satislar\'a akar.' },
    { t: 'dax', q: '<b>Kitap ve Spor</b>: Kitap ya da Spor kategorisindeki satışlar (Urunler[Kategori]).', name: 'Kitap ve Spor', sol: 'CALCULATE(SUM(Satislar[Tutar]), Urunler[Kategori] IN {"Kitap", "Spor"})', hint: 'IN {"Kitap", "Spor"}' }
  ]
},

{
  id: 'iteratorler', lv: 'orta', mod: 'DAX Bağlamları', min: 16,
  title: 'Yineleyiciler: SUMX, AVERAGEX ve RELATED',
  sum: 'Satır satır hesap yapıp sonucu toplamak; ilişkili tablodan değer çekmek.',
  body: `
<h2>X ile biten fonksiyonlar</h2>
<p><code>SUMX</code>, <code>AVERAGEX</code>, <code>MINX</code>, <code>MAXX</code>, <code>COUNTX</code>, <code>CONCATENATEX</code> aynı kalıbı izler:</p>
<pre class="dax" data-notry>SUMX( &lt;tablo&gt;, &lt;her satır için hesaplanacak ifade&gt; )</pre>
<p>Tabloyu satır satır dolaşır (satır bağlamı), ifadeyi her satırda hesaplar, sonra toplar ya da ortalamasını alır.</p>
<h2>RELATED: boyuttan değer getirmek</h2>
<p>Satış satırında ürünün <b>liste fiyatı</b> yok, ama <code>Urunler</code> tablosunda var. İlişkinin “bir” tarafındaki değeri satır bağlamında okumak için <code>RELATED</code> kullanılır:</p>
<pre class="dax">Liste Fiyatından Ciro = SUMX(Satislar, Satislar[Adet] * RELATED(Urunler[Fiyat]))</pre>
<p>Ters yön (bir ürünün tüm satışları) için <code>RELATEDTABLE</code> vardır: <code>COUNTROWS(RELATEDTABLE(Satislar))</code> bir ürün satırında o ürünün satış satırı sayısını verir.</p>
<h2>SUM mı SUMX mi?</h2>
<p><code>SUM(Satislar[Tutar])</code> aslında <code>SUMX(Satislar, Satislar[Tutar])</code>'ın kısaltmasıdır. Toplanacak şey hazır bir sütunsa <code>SUM</code>; satır başına bir <b>hesap</b> gerekiyorsa <code>SUMX</code>.</p>
<div class="tip"><b>Hesaplanmış sütun yerine SUMX</b>“Satır başına kâr” için Satislar'a sütun eklemek yerine <code>SUMX</code> içinde hesaplamak çoğu zaman daha iyidir: model küçük kalır, hesap yalnızca gerektiğinde yapılır.</div>
<h2>Ortalamanın iki anlamı</h2>
<pre class="dax">Satır Ortalaması = AVERAGE(Satislar[Tutar])
Sipariş Ortalaması = AVERAGEX(VALUES(Satislar[SiparisNo]), CALCULATE(SUM(Satislar[Tutar])))</pre>
<p>İlki sipariş <i>satırı</i> başına, ikincisi <i>sipariş</i> başına ortalamadır. <code>VALUES</code>, görünür sipariş numaralarının listesini verir; <code>AVERAGEX</code> bu liste üzerinde dolaşır. İçerideki <code>CALCULATE</code>'in görevi bir sonraki ileri derste (bağlam geçişi) açıklanıyor.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Liste Fiyatından Ciro</b>: her satış satırı için <code>Adet × ürünün liste fiyatı (Urunler[Fiyat])</code> toplamı.', name: 'Liste Fiyatından Ciro', sol: 'SUMX(Satislar, Satislar[Adet] * RELATED(Urunler[Fiyat]))', hint: 'Fiyat Urunler tablosunda: RELATED(Urunler[Fiyat])' },
    { t: 'dax', q: '<b>İndirim Tutarı</b>: her satır için <code>Adet × BirimFiyat × Indirim</code> toplamı.', name: 'İndirim Tutarı', sol: 'SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat] * Satislar[Indirim])' },
    { t: 'dax', q: '<b>Ortalama Satır Kârı</b>: her satır için <code>Tutar − Maliyet</code>, sonra bunların ortalaması.', name: 'Ortalama Satır Kârı', sol: 'AVERAGEX(Satislar, Satislar[Tutar] - Satislar[Maliyet])', hint: 'AVERAGEX(Satislar, ...)' },
    { t: 'dax', q: '<b>En Pahalı Satılan</b>: satılan ürünlerin liste fiyatları içinde en yükseği (RELATED ile).', name: 'En Pahalı Satılan', sol: 'MAXX(Satislar, RELATED(Urunler[Fiyat]))', hint: 'MAXX(Satislar, RELATED(...))' }
  ]
},

{
  id: 'filter-all', lv: 'orta', mod: 'DAX Bağlamları', min: 18,
  title: 'FILTER, ALL, ALLEXCEPT, ALLSELECTED: pay ve oranlar',
  sum: 'Genel toplama göre pay, ebeveyne göre pay, seçime göre pay ve satır koşullu filtreler.',
  body: `
<h2>FILTER: satır satır koşul</h2>
<pre class="dax">Büyük Satırlar = CALCULATE([Toplam Satış], FILTER(Satislar, Satislar[Tutar] &gt; 2000))</pre>
<p><code>FILTER(tablo, koşul)</code> koşulu her satırda test eder ve geçen satırlardan bir tablo döndürür. Basit sütun koşullarında boolean filtre (<code>Satislar[Kanal] = "Web"</code>) daha hızlıdır. <code>FILTER</code>, koşul bir <b>ölçüye</b> ya da birden çok sütuna dayandığında gerekir:</p>
<pre class="dax">Çok Satan Ürün Sayısı = COUNTROWS(FILTER(Urunler, [Toplam Satış] &gt; 50000))</pre>
<h2>ALL ailesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>CALCULATE içinde ne yapar?</th></tr>
<tr><td><code>ALL(Tablo)</code> / <code>REMOVEFILTERS(Tablo)</code></td><td>Tablodaki (ve ilişkiyle bağlı boyutlarındaki) tüm filtreleri kaldırır</td></tr>
<tr><td><code>ALL(Tablo[Sütun])</code></td><td>Yalnızca o sütunun filtresini kaldırır</td></tr>
<tr><td><code>ALLEXCEPT(Tablo, Tablo[Sütun])</code></td><td>Belirtilen sütun dışındaki tüm filtreleri kaldırır</td></tr>
<tr><td><code>ALLSELECTED(...)</code></td><td>Görselin satır/sütun filtrelerini kaldırır ama dilimleyici seçimlerini korur</td></tr>
</table></div>
<h2>Üç farklı pay</h2>
<pre class="dax">Genel Pay % =
DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Kategoriler)))

Seçime Göre Pay % =
DIVIDE([Net Satış], CALCULATE([Net Satış], ALLSELECTED(Kategoriler)))

Kategori İçi Pay % =
DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Urunler[Urun])))</pre>
<ul>
<li><b>Genel pay:</b> Dilimleyicide yalnızca 3 kategori seçilse bile payda tüm kategorilerdir; yüzdeler 100'e tamamlanmaz.</li>
<li><b>Seçime göre pay:</b> Payda yalnızca seçili kategorilerdir; görseldeki yüzdeler 100'e tamamlanır.</li>
<li><b>Kategori içi pay:</b> Satırda ürün varken, ürün filtresi kalkar ama kategori filtresi kalır: ürünün kendi kategorisindeki payı.</li>
</ul>
<div class="warn"><b>Doğru sütunu kaldır</b>Görselde <code>Kategoriler[Kategori]</code> ile grupluyorsan, paydada da <code>Kategoriler</code> filtresini kaldırmalısın. <code>ALL(Urunler[Kategori])</code> yazarsan görselin filtresi (Kategoriler'den geliyor) yerinde kalır ve her satırda %100 görürsün. Bu modelde iki kategori sütunu var; alıştırmalarda hangisinin kullanıldığına dikkat et.</div>
`,
  ex: [
    { t: 'dax', q: '<b>Kategori Payı %</b>: Net satışın tüm kategoriler içindeki payı. Kontrol tablosu satırlarda <code>Kategoriler[Kategori]</code> kullanıyor. <code>[Net Satış]</code> ölçüsü hazır.', name: 'Kategori Payı %', sol: 'DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Kategoriler)))', hint: 'Paydada ALL(Kategoriler) ya da REMOVEFILTERS(Kategoriler)', grid: [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }] },
    { t: 'dax', q: '<b>Büyük Satır Satışı</b>: Tutarı 2.000 TL\'den büyük olan satırların toplam tutarı. FILTER kullan.', name: 'Büyük Satır Satışı', sol: 'CALCULATE(SUM(Satislar[Tutar]), FILTER(Satislar, Satislar[Tutar] > 2000))', hint: 'CALCULATE(SUM(...), FILTER(Satislar, koşul))' },
    { t: 'dax', q: '<b>Kanal Payı %</b>: Net satışın tüm kanallar içindeki payı. Kontrol tablosu satırlarda <code>Satislar[Kanal]</code> kullanıyor.', name: 'Kanal Payı %', sol: 'DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Satislar[Kanal])))', hint: 'Yalnızca kanal sütununun filtresini kaldır: ALL(Satislar[Kanal])', grid: [{ t: 'Satislar', c: 'Kanal' }, { t: 'Kategoriler', c: 'Kategori' }] },
    { t: 'dax', q: '<b>Çok Satan Ürün Sayısı</b>: Net satışı 20.000 TL\'yi geçen ürün sayısı. Urunler tablosunu FILTER ile süz, satırları say.', name: 'Çok Satan Ürün Sayısı', sol: 'COUNTROWS(FILTER(Urunler, [Net Satış] > 20000))', hint: 'COUNTROWS(FILTER(Urunler, [Net Satış] > 20000))' }
  ]
},

{
  id: 'zaman', lv: 'orta', mod: 'Zaman Zekâsı', min: 18,
  title: 'Zaman zekâsı: YTD, geçen yıl, büyüme',
  sum: 'TOTALYTD, SAMEPERIODLASTYEAR, DATEADD, PREVIOUSMONTH ve yıllık büyüme ölçüleri.',
  body: `
<h2>Ön koşul</h2>
<p>Zaman zekâsı fonksiyonları, tarih tablosu olarak işaretlenmiş, kesintisiz bir tarih tablosuna ihtiyaç duyar. Bu modelde <code>Tarih[Tarih]</code> o sütundur. Görselde tarih bilgisini her zaman <b>Tarih tablosundan</b> al (<code>Tarih[Yil]</code>, <code>Tarih[YilAy]</code>), olgu tablosundaki tarihten değil.</p>
<h2>Yılbaşından bugüne (YTD)</h2>
<pre class="dax">Satış YTD = TOTALYTD([Net Satış], Tarih[Tarih])
-- aynısı:
Satış YTD = CALCULATE([Net Satış], DATESYTD(Tarih[Tarih]))</pre>
<p>Mart satırında 1 Ocak – 31 Mart toplamını verir. Benzerleri: <code>TOTALQTD</code>, <code>TOTALMTD</code>, <code>DATESQTD</code>, <code>DATESMTD</code>.</p>
<h2>Geçen yılla karşılaştırma</h2>
<pre class="dax">Satış GY = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))

YoY % = DIVIDE([Net Satış] - [Satış GY], [Satış GY])</pre>
<p><code>SAMEPERIODLASTYEAR</code>, görünen tarihleri bir yıl geri kaydırır. <code>DATEADD(Tarih[Tarih], -1, YEAR)</code> aynı işi yapar ve daha esnektir: <code>-1, MONTH</code> bir önceki ay, <code>-1, QUARTER</code> bir önceki çeyrek.</p>
<h2>Önceki dönem</h2>
<pre class="dax">Satış GA = CALCULATE([Net Satış], PREVIOUSMONTH(Tarih[Tarih]))
Aylık Değişim % = DIVIDE([Net Satış] - [Satış GA], [Satış GA])</pre>
<div class="note"><b>PREVIOUSMONTH ile DATEADD farkı</b><code>PREVIOUSMONTH</code> her zaman görünen ilk tarihten önceki <b>tam ayı</b> döndürür. Yıl düzeyinde bir hücrede (ör. 2024 toplamı) bile Aralık 2023'ü verir. <code>DATEADD(..., -1, MONTH)</code> ise tüm dönemi bir ay kaydırır.</div>
<div class="warn"><b>İlk yıl boş</b>Verinin başladığı yılda “geçen yıl” yoktur; <code>Satış GY</code> boş, <code>YoY %</code> de boş döner. DIVIDE sayesinde hata değil boşluk görürsün.</div>
`,
  ex: [
    { t: 'dax', q: '<b>Satış YTD</b>: <code>[Net Satış]</code> ölçüsünün yılbaşından bugüne toplamı. Kontrol, Tarih[YilAy] ve Tarih[Yil] kırılımlarında yapılır.', name: 'Satış YTD', sol: 'TOTALYTD([Net Satış], Tarih[Tarih])', hint: 'TOTALYTD(ölçü, Tarih[Tarih])', grid: [{ t: 'Tarih', c: 'YilAy' }, { t: 'Tarih', c: 'Yil' }] },
    { t: 'dax', q: '<b>Satış GY</b>: <code>[Net Satış]</code> ölçüsünün geçen yılın aynı dönemindeki değeri.', name: 'Satış GY', sol: 'CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))', hint: 'CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))', grid: [{ t: 'Tarih', c: 'YilAy' }, { t: 'Tarih', c: 'Yil' }] },
    { t: 'dax', q: '<b>YoY %</b>: geçen yıla göre büyüme oranı. <code>[Net Satış]</code> ve <code>[Satış GY]</code> ölçüleri hazır.', name: 'YoY %', sol: 'DIVIDE([Net Satış] - [Satış GY], [Satış GY])', hint: 'DIVIDE(bu yıl - geçen yıl, geçen yıl)', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Kategoriler', c: 'Kategori' }] },
    { t: 'dax', q: '<b>Satış Önceki Çeyrek</b>: <code>[Net Satış]</code> ölçüsünün bir önceki çeyrekteki değeri. DATEADD kullan.', name: 'Satış Önceki Çeyrek', sol: 'CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, QUARTER))', hint: 'DATEADD(Tarih[Tarih], -1, QUARTER)', grid: [{ t: 'Tarih', c: 'YilAy' }] }
  ]
},

{
  id: 'var-mantik', lv: 'orta', mod: 'DAX Kalıpları', min: 15,
  title: 'VAR / RETURN, IF ve SWITCH',
  sum: 'Değişkenlerle okunur ve hızlı formüller; koşullu mantık ve dinamik metinler.',
  body: `
<h2>Değişkenler</h2>
<pre class="dax">YoY % =
VAR BuYil = [Net Satış]
VAR GecenYil = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))
RETURN
    DIVIDE(BuYil - GecenYil, GecenYil)</pre>
<ul>
<li><b>Okunurluk:</b> Her ara adımın bir adı olur.</li>
<li><b>Performans:</b> Değişken bir kez hesaplanır; formülde iki kez kullansan da tekrar hesaplanmaz.</li>
<li><b>Hata ayıklama:</b> <code>RETURN GecenYil</code> yazıp ara sonucu görebilirsin.</li>
<li><b>Dikkat:</b> Değişken, <b>tanımlandığı yerdeki</b> bağlamda hesaplanır ve sabit kalır. <code>CALCULATE(BuYil, ...)</code> yazmak BuYil'i değiştirmez.</li>
</ul>
<h2>IF</h2>
<pre class="dax">Hedef Durumu = IF([Net Satış] &gt;= [Hedef], "Hedefte", "Altında")</pre>
<h2>SWITCH ve SWITCH(TRUE())</h2>
<pre class="dax">Kanal Kodu = SWITCH(SELECTEDVALUE(Satislar[Kanal]), "Web", "W", "Mobil", "M", "Mağaza", "S", "?")

Performans =
VAR Oran = DIVIDE([Net Satış], [Hedef])
RETURN SWITCH(TRUE(),
    ISBLANK(Oran), "Hedef yok",
    Oran &gt;= 1.05, "Üstün",
    Oran &gt;= 0.95, "Hedefte",
    "Geride")</pre>
<p><code>SWITCH(TRUE(), …)</code> iç içe IF'lerin okunur hâlidir: koşullar sırayla denenir, ilk doğru olanın sonucu döner.</p>
<h2>SELECTEDVALUE ile dinamik başlık</h2>
<pre class="dax">Başlık = "Net satış · " &amp; SELECTEDVALUE(Tarih[Yil], "Tüm yıllar")</pre>
<p>Tek bir yıl seçiliyse o yılı, değilse “Tüm yıllar” metnini döndürür. Görselin başlığına <i>fx</i> düğmesiyle bu ölçüyü bağlayabilirsin.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Hedef Durumu</b>: <code>[Net Satış]</code>, <code>[Hedef]</code> ölçüsünden büyük ya da eşitse "Hedefte", değilse "Altında" döndür.', name: 'Hedef Durumu', sol: 'IF([Net Satış] >= [Hedef], "Hedefte", "Altında")', grid: [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'YilAy' }] },
    { t: 'dax', q: '<b>Performans</b>: Oran = Net Satış / Hedef. Oran ≥ 1,05 ise "Üstün", ≥ 0,95 ise "Hedefte", aksi hâlde "Geride". VAR ve SWITCH(TRUE()) kullan. (Hedef her kırılımda dolu.)', name: 'Performans', start: 'VAR Oran = DIVIDE([Net Satış], [Hedef])\nRETURN\n', sol: 'VAR Oran = DIVIDE([Net Satış], [Hedef])\nRETURN SWITCH(TRUE(), Oran >= 1.05, "Üstün", Oran >= 0.95, "Hedefte", "Geride")', hint: 'SWITCH(TRUE(), Oran >= 1.05, "Üstün", Oran >= 0.95, "Hedefte", "Geride")', grid: [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'YilAy' }] },
    { t: 'dax', q: '<b>Seçili Yıl Metni</b>: Tek bir yıl görünüyorsa "Yıl: 2024" gibi bir metin, değilse "Tüm yıllar" döndür.', name: 'Seçili Yıl Metni', sol: 'IF(HASONEVALUE(Tarih[Yil]), "Yıl: " & SELECTEDVALUE(Tarih[Yil]), "Tüm yıllar")', hint: 'HASONEVALUE ile kontrol et, & ile metin birleştir.', grid: [{ t: 'Tarih', c: 'Yil' }] }
  ]
},

{
  id: 'siralama', lv: 'orta', mod: 'DAX Kalıpları', min: 15,
  title: 'Sıralama ve ilk N: RANKX ve TOPN',
  sum: 'Ürünleri sıralamak, ilk 5\'in toplamını almak, eşitliklerle başa çıkmak.',
  body: `
<h2>RANKX</h2>
<pre class="dax">Ürün Sırası = RANKX(ALL(Urunler[Urun]), [Net Satış])</pre>
<p><code>RANKX(tablo, ifade)</code> tablodaki her satır için ifadeyi hesaplar, sonra geçerli bağlamdaki değerin bu listede kaçıncı olduğunu bulur. <code>ALL</code> burada şarttır: görselin satır filtresi kalırsa tabloda tek ürün kalır ve her ürün 1. olur.</p>
<p>İsteğe bağlı bağımsız değişkenler: <code>RANKX(tablo, ifade, , ASC)</code> küçükten büyüğe; son bağımsız değişken <code>DENSE</code> olursa eşitliklerden sonra numara atlanmaz: iki ürün 1. ise sıradaki 3. değil 2. olur.</p>
<div class="warn"><b>Toplam satırı</b>Toplam satırında da RANKX çalışır ve anlamsız bir “1” üretir. <code>IF(HASONEVALUE(Urunler[Urun]), RANKX(...))</code> ya da <code>ISINSCOPE</code> ile yalnızca ürün düzeyinde göster.</div>
<h2>TOPN</h2>
<pre class="dax">İlk 5 Ürün Satışı =
CALCULATE([Net Satış], TOPN(5, ALL(Urunler[Urun]), [Net Satış]))</pre>
<p><code>TOPN(n, tablo, sıralamaİfadesi)</code> en yüksek n satırı tablo olarak döndürür. <code>CALCULATE</code> içinde filtre olarak kullanılınca “yalnızca bu ürünler” anlamına gelir.</p>
<h2>Görselde ilk N</h2>
<p>Kod yazmadan da yapılabilir: Filtreler bölmesinde ürün alanını seç → Filtre türü: <b>İlk N</b> → 5 → Değere göre: Net Satış. Ama ölçüyle yapılan ilk N, kart ve KPI gibi her görselde kullanılabilir.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Kategori Sırası</b>: kategorileri net satışa göre büyükten küçüğe sırala. Kontrol satırları <code>Kategoriler[Kategori]</code>.', name: 'Kategori Sırası', sol: 'RANKX(ALL(Kategoriler[Kategori]), [Net Satış])', hint: 'RANKX(ALL(Kategoriler[Kategori]), [Net Satış])', grid: [{ t: 'Kategoriler', c: 'Kategori' }], noTotal: true },
    { t: 'dax', q: '<b>İlk 5 Ürün Satışı</b>: net satışa göre en çok satan 5 ürünün toplam net satışı.', name: 'İlk 5 Ürün Satışı', sol: 'CALCULATE([Net Satış], TOPN(5, ALL(Urunler[Urun]), [Net Satış]))', hint: 'CALCULATE([Net Satış], TOPN(5, ALL(Urunler[Urun]), [Net Satış]))', grid: [{ t: 'Tarih', c: 'Yil' }] },
    { t: 'dax', q: '<b>Ürün Sırası</b>: ürünleri net satışa göre sırala; yalnızca tek ürün görünüyorsa sıra göster, değilse boş döndür.', name: 'Ürün Sırası', sol: 'IF(HASONEVALUE(Urunler[Urun]), RANKX(ALL(Urunler[Urun]), [Net Satış]))', hint: 'IF(HASONEVALUE(Urunler[Urun]), RANKX(...))', grid: [{ t: 'Urunler', c: 'Urun' }] }
  ]
},

{
  id: 'pq-orta', lv: 'orta', mod: 'Veri Hazırlama', min: 15,
  title: 'Power Query: birleştirme, ekleme, özetten çıkarma',
  sum: 'Merge (join türleri), Append, Unpivot, Group By, koşullu sütun, parametreler ve sorgu katlama.',
  body: `
<h2>Sorguları birleştir (Merge)</h2>
<p>İki tabloyu ortak bir sütun üzerinden yan yana getirir; SQL'deki JOIN'in karşılığıdır. Giriş → <b>Sorguları Birleştir</b>.</p>
<div class="tbl-wrap"><table>
<tr><th>Birleştirme türü</th><th>Sonuç</th></tr>
<tr><td>Sol dış</td><td>Soldaki tüm satırlar + sağdaki eşleşenler (en yaygın)</td></tr>
<tr><td>Sağ dış</td><td>Sağdaki tüm satırlar + soldaki eşleşenler</td></tr>
<tr><td>Tam dış</td><td>İki taraftaki tüm satırlar</td></tr>
<tr><td>İç</td><td>Yalnızca iki tarafta da eşleşenler</td></tr>
<tr><td>Sol karşıt (anti)</td><td>Solda olup sağda eşleşmeyenler (ör. hiç sipariş vermemiş müşteriler)</td></tr>
<tr><td>Sağ karşıt</td><td>Sağda olup solda eşleşmeyenler</td></tr>
</table></div>
<p>Birleştirmeden sonra yeni bir “tablo” sütunu oluşur; başlığındaki genişlet düğmesiyle istediğin sütunları seçersin.</p>
<h2>Sorguları ekle (Append)</h2>
<p>Aynı yapıdaki tabloları alt alta ekler (SQL'de UNION ALL). Her ay ayrı dosya gelen satış raporları için idealdir. Daha da iyisi: <b>Klasör</b> bağlayıcısı, bir klasördeki tüm dosyaları tek seferde birleştirir; klasöre yeni dosya eklendikçe yenilemede kendiliğinden gelir.</p>
<h2>Özetten çıkar (Unpivot)</h2>
<p>Excel'den gelen “Ocak | Şubat | Mart …” sütunlu bütçe tablosunu modele uygun hâle getirir:</p>
<div class="tbl-wrap"><table>
<tr><th>Kategori</th><th>Oca</th><th>Şub</th><th></th><th>Kategori</th><th>Ay</th><th>Hedef</th></tr>
<tr><td>Kitap</td><td>4.000</td><td>4.200</td><td>→</td><td>Kitap</td><td>Oca</td><td>4.000</td></tr>
<tr><td>Spor</td><td>6.500</td><td>6.100</td><td></td><td>Kitap</td><td>Şub</td><td>4.200</td></tr>
</table></div>
<p>Kategori sütununu seç → Dönüştür → <b>Diğer Sütunların Özetini Kaldır</b>. Bu modeldeki <code>Hedefler</code> tablosu tam olarak bu biçimdedir.</p>
<h2>Gruplandırma ve koşullu sütun</h2>
<ul>
<li><b>Gruplandırma ölçütü:</b> Satırları özetler (ör. müşteri başına sipariş sayısı). Modele daha küçük bir tablo yüklemek için kullanılır.</li>
<li><b>Koşullu sütun:</b> Sihirbazla “Eğer Fiyat &gt; 1000 ise Pahalı” gibi kurallar. Hesaplanmış sütun yerine burada oluşturmak modeli verimli tutar.</li>
<li><b>Örneklerden sütun:</b> Birkaç örnek yazarsın, Power Query kuralı kendisi çıkarır.</li>
</ul>
<h2>Parametreler ve sorgu katlama</h2>
<ul>
<li><b>Parametre:</b> Sunucu adı, başlangıç tarihi gibi değerleri bir yerde tanımla; geliştirme ve canlı ortam arasında tek tıkla geçiş yap. Artımlı yenileme de <code>RangeStart</code> ve <code>RangeEnd</code> parametrelerine dayanır.</li>
<li><b>Sorgu katlama (query folding):</b> Adımların kaynak veritabanına tek bir SQL sorgusu olarak gönderilmesi. Filtre, sütun seçimi, gruplama gibi adımlar katlanır; işi veritabanı yapar. Bir adıma sağ tıklayıp <b>Yerel Sorguyu Görüntüle</b> ile kontrol edebilirsin. Katlamayı bozan adımları (ör. dizin sütunu) mümkün olduğunca sona koy.</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Hiç sipariş vermemiş müşterileri bulmak için Musteriler (sol) ile Siparisler (sağ) arasında hangi birleştirme?', o: ['İç birleştirme', 'Sol karşıt (anti) birleştirme', 'Tam dış birleştirme', 'Ekleme (Append)'], a: 1, why: 'Sol karşıt, solda olup sağda karşılığı olmayan satırları verir.' },
    { t: 'mc', q: 'Her ay “Satis_2024_01.xlsx” gibi yeni bir dosya geliyor. En sürdürülebilir yöntem?', o: ['Her ay elle yeni sorgu ekleyip Append', 'Klasör bağlayıcısı ile klasördeki tüm dosyaları birleştirmek', 'Dosyaları kopyalayıp yapıştırmak', 'DirectQuery'], a: 1, why: 'Klasör bağlayıcısı, yeni dosyaları yenilemede kendiliğinden ekler.' },
    { t: 'mc', q: 'Bütçe tablosunda her ay ayrı bir sütun. Modele uygun hâle getirmek için hangi dönüşüm?', o: ['Özet (Pivot)', 'Özetten çıkar (Unpivot)', 'Devrik (Transpose)', 'Gruplandır'], a: 1, why: 'Unpivot, sütun başlıklarını (aylar) satırlara çevirir: Kategori | Ay | Değer.' },
    { t: 'mc', q: 'Sorgu katlama (query folding) neden önemlidir?', o: ['Raporu daha renkli yapar', 'Dönüşümleri kaynak veritabanına yaptırarak yenilemeyi hızlandırır', 'DAX\'ı hızlandırır', 'RLS için gereklidir'], a: 1, why: 'Katlanan adımlar SQL olarak kaynağa gider; daha az veri taşınır, yenileme hızlanır.' }
  ]
},

{
  id: 'gorsel-ilkeler', lv: 'orta', mod: 'Görselleştirme', min: 14,
  title: 'Görselleştirme ilkeleri',
  sum: 'Veri-mürekkep oranı, renk, sıralama, etiketler, eksenler ve erişilebilirlik.',
  body: `
<h2>Az ama doğru</h2>
<ul>
<li><b>Veri-mürekkep oranı:</b> Ekrandaki her pikselin bir görevi olsun. Kalın kenarlıklar, gölgeler, 3B efektler, ızgara çizgilerinin hepsi bilgiye rakip olur.</li>
<li><b>Bir görsel, bir mesaj:</b> Başlık mesajı söylesin: “Elektronik, satışın üçte birini taşıyor”.</li>
<li><b>Sayfa başına 5–7 görsel:</b> Daha fazlası hem okuyucuyu hem motoru yorar.</li>
</ul>
<h2>Renk</h2>
<ul>
<li><b>Kategorik renk</b> kimlik içindir (Web, Mobil, Mağaza). Her kanal her sayfada aynı renkte olmalı.</li>
<li><b>Sıralı renk</b> (açıktan koyuya tek ton) büyüklük içindir: ısı haritası, harita.</li>
<li><b>Iraksak renk</b> (iki ton, ortada nötr) iyi/kötü sapma içindir: hedefe göre fark.</li>
<li><b>Durum renkleri</b> (yeşil/sarı/kırmızı) yalnızca durum için kullanılır; renk körlüğü için yanına simge (▲ ▼) ya da metin koy.</li>
<li>Vurgu için gri + tek renk: Tüm çubuklar gri, odaklanılan kategori renkli.</li>
</ul>
<h2>Eksenler ve sıralama</h2>
<ul>
<li>Çubuk ve sütun grafiklerinde eksen <b>sıfırdan</b> başlar.</li>
<li>Kategorileri değere göre sırala; zamanı soldan sağa kronolojik bırak.</li>
<li>Uzun kategori adları için yatay çubuk kullan; eğik metinden kaçın.</li>
<li>Ölçeği farklı iki ölçüyü ikili eksenle birleştirme.</li>
</ul>
<h2>Erişilebilirlik</h2>
<ul>
<li>Görsellere <b>alternatif metin</b> ekle (Biçim → Genel → Alternatif metin).</li>
<li>Sekme sırasını Seçim bölmesinden düzenle; klavyeyle gezilebilir olsun.</li>
<li>Metin kontrastı en az 4,5:1 olsun; açık gri üstüne beyaz yazı kullanma.</li>
<li>Rengi tek bilgi taşıyıcısı yapma: gösterge, etiket ya da desen ekle.</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Bir sütun grafiğinde y ekseni 90.000\'den başlıyor ve iki çubuk arasındaki %5\'lik fark 3 kat gibi görünüyor. Ne yapmalısın?', o: ['Ekseni sıfırdan başlatmak', 'Çubukları farklı renklere boyamak', '3B efekt eklemek', 'Veri etiketlerini kapatmak'], a: 0, why: 'Çubuk uzunluğu değeri temsil eder; eksen sıfırdan başlamazsa oranlar bozulur.' },
    { t: 'mc', q: 'Hedefin altında kalan kategorileri işaretlemek istiyorsun. Renk körü kullanıcılar için en iyi yaklaşım?', o: ['Yalnızca kırmızı/yeşil renk', 'Renk + ▲/▼ simgesi ya da metin', 'Yanıp sönen animasyon', 'Kalın kenarlık'], a: 1, why: 'Durum bilgisi rengin yanında simge ya da metinle de taşınmalı.' },
    { t: 'mc', q: 'Web, Mobil, Mağaza kanalları bir sayfada mavi/turuncu/yeşil, diğer sayfada yeşil/mavi/turuncu. Sorun ne?', o: ['Sorun yok', 'Renk kimliği tutarsız; okuyucu her sayfada yeniden öğrenmek zorunda', 'Çok az renk var', 'Tema yüklenmemiş'], a: 1, why: 'Kategorik renk bir varlığa bağlıdır; rapor boyunca sabit kalmalı.' }
  ]
},

{
  id: 'etkilesim', lv: 'orta', mod: 'Görselleştirme', min: 15,
  title: 'Etkileşimler: dilimleyici, detaya inme, araç ipucu, yer imi',
  sum: 'Raporu keşfedilebilir yapan özellikler ve hangisinin ne zaman kullanılacağı.',
  body: `
<h2>Dilimleyiciler</h2>
<ul>
<li>Liste, açılır menü, döşeme, tarih aralığı (kaydırıcı) ve göreli tarih (“son 3 ay”) stilleri.</li>
<li><b>Dilimleyicileri eşitle</b> (Görünüm → Dilimleyicileri eşitle): Bir sayfadaki yıl seçimi diğer sayfalara da taşınır.</li>
<li>Çok sayıda dilimleyici yerine <b>Filtreler bölmesi</b>ni kullanıcıya açmak da bir seçenektir.</li>
</ul>
<h2>Çapraz filtreleme ve vurgulama</h2>
<p>Bir grafikte bir çubuğa tıklamak sayfadaki diğer görselleri etkiler. Varsayılan davranış çoğu görselde <b>vurgulama</b>dır (seçilmeyen kısım soluklaşır). Biçim → <b>Etkileşimleri düzenle</b> ile her görsel için “Filtrele / Vurgula / Yok” seçersin. <b>Dashboardlar</b> sayfasında grafiklere tıklayarak bunu deneyebilirsin.</p>
<h2>Detaya inme (drill-down)</h2>
<p>Eksene birden çok alan koyarsan (Yıl → Çeyrek → Ay) bir <b>hiyerarşi</b> oluşur. Görselin üstündeki oklarla bir alt düzeye inersin. Tarih hiyerarşileri ve Kategori → Ürün gibi doğal hiyerarşiler için idealdir.</p>
<h2>Detay sayfası (drill-through)</h2>
<p>Ayrı bir “Ürün Detayı” sayfası tasarlar, <code>Urunler[Urun]</code> alanını o sayfanın <b>detaylandırma</b> alanına koyarsın. Kullanıcı herhangi bir sayfada bir ürüne sağ tıklayıp <i>Detaya git → Ürün Detayı</i> der ve o ürünle süzülmüş sayfaya geçer.</p>
<h2>Araç ipucu sayfaları</h2>
<p>Küçük bir sayfayı (Sayfa bilgileri → Araç ipucu olarak kullan) bir görselin üzerine gelindiğinde açılan mini rapor olarak gösterebilirsin. Örneğin kategori çubuğunun üzerine gelince o kategorinin aylık eğilimi.</p>
<h2>Yer imleri ve düğmeler</h2>
<ul>
<li><b>Yer imi:</b> Sayfanın o anki durumunu (filtreler, görünür görseller) kaydeder.</li>
<li><b>Düğme + yer imi:</b> “Grafik / Tablo” geçişi, “Filtreleri temizle” düğmesi, rehberli sunum.</li>
<li><b>Sayfa gezintisi:</b> Düğmelerle sayfalar arasında menü oluşturma.</li>
</ul>
<h2>Yapay zekâ görselleri</h2>
<ul>
<li><b>Anahtar etkileyiciler:</b> Bir ölçüyü en çok neyin artırıp azalttığını bulur.</li>
<li><b>Ayrıştırma ağacı:</b> Bir toplamı istediğin sırayla alt boyutlara böler.</li>
<li><b>Copilot:</b> “2024'te kategoriye göre net satış” gibi doğal dil soruları. (Eski Soru-Cevap özelliği Aralık 2026'da kaldırılıyor.)</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Kullanıcılar herhangi bir sayfada bir müşteriye sağ tıklayıp o müşterinin tüm ayrıntılarını tek sayfada görmek istiyor. Hangi özellik?', o: ['Detaya inme (drill-down)', 'Detay sayfası (drill-through)', 'Yer imi', 'Senkron dilimleyici'], a: 1, why: 'Drill-through, seçilen öğeyle süzülmüş ayrı bir sayfaya götürür.' },
    { t: 'mc', q: 'Bir sütun grafiğinde Yıl → Çeyrek → Ay hiyerarşisinde gezinmek hangi özelliktir?', o: ['Drill-down', 'Drill-through', 'Araç ipucu sayfası', 'Etkileşimleri düzenle'], a: 0, why: 'Drill-down aynı görsel içinde hiyerarşinin alt düzeyine iner.' },
    { t: 'mc', q: 'Kanal grafiğine tıklandığında yanındaki KPI kartının hiç değişmemesini istiyorsun. Ne yaparsın?', o: ['Kartı silmek', 'Etkileşimleri düzenle → kart için “Yok”', 'Kartı başka sayfaya taşımak', 'RLS tanımlamak'], a: 1, why: 'Etkileşimleri düzenle, her kaynak-hedef görsel çifti için davranışı belirler.' }
  ]
},

{
  id: 'hedef', lv: 'orta', mod: 'Veri Modelleme', min: 15,
  title: 'Hedef ve gerçekleşen: farklı ayrıntı düzeyleri',
  sum: 'Günlük satışla aylık hedefi aynı görselde göstermek; ortak boyutlar ve doğru kategori sütunu.',
  body: `
<h2>Sorun: iki olgu, iki tanecik</h2>
<p><code>Satislar</code> sipariş satırı düzeyinde ve günlük; <code>Hedefler</code> ise <b>ay × kategori</b> düzeyinde. İkisini tek tabloya birleştirmek yerine her iki olguyu da <b>ortak boyutlara</b> bağlarız:</p>
<ul>
<li><code>Tarih[Tarih]</code> → <code>Hedefler[Tarih]</code> (hedef ayın ilk gününe bağlı)</li>
<li><code>Kategoriler[Kategori]</code> → <code>Hedefler[Kategori]</code> ve <code>Kategoriler[Kategori]</code> → <code>Urunler[Kategori]</code> → <code>Satislar</code></li>
</ul>
<p>Böylece <code>Kategoriler[Kategori]</code> ve <code>Tarih[YilAy]</code> ile kurulan bir matris hem <code>[Net Satış]</code>'ı hem <code>[Hedef]</code>'i doğru gösterir.</p>
<h2>Yanlış sütunu seçmenin bedeli</h2>
<p>Matrise kategori olarak <code>Urunler[Kategori]</code> koyarsan satış doğru kırılır ama hedef her satırda <b>aynı toplamı</b> gösterir. Çünkü <code>Urunler</code>'deki filtre <code>Hedefler</code>'e ulaşamaz: filtreler yalnızca bir taraftan çok tarafa akar, <code>Urunler</code> ise <code>Kategoriler</code>'in çok tarafıdır.</p>
<div class="tip"><b>Kural</b>Birden çok olguyu birlikte kesen nitelikleri <b>paylaşılan boyut</b>tan al. Olgu tablolarından ya da yalnızca bir olguya bağlı boyutlardan alma.</div>
<h2>Gün düzeyinde hedef?</h2>
<p>Hedef aylık olduğu için günlük grafikte hedef yalnızca ayın ilk gününde görünür. Ay altı düzeyde göstermemek için:</p>
<pre class="dax">Hedef (ay düzeyi) =
IF(HASONEVALUE(Tarih[Tarih]), BLANK(), [Hedef])</pre>
<p>Basit yol: hedef görsellerinde tarih eksenini ay ve üstüyle sınırlı tut.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Hedef</b>: Hedefler tablosundaki Hedef sütununun toplamı.', name: 'Hedef', sol: 'SUM(Hedefler[Hedef])', grid: [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }] },
    { t: 'dax', q: '<b>Hedef Gerçekleşme %</b>: <code>[Net Satış]</code> bölü <code>[Hedef]</code>.', name: 'Hedef Gerçekleşme %', sol: 'DIVIDE([Net Satış], [Hedef])', grid: [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'YilAy' }] },
    { t: 'mc', q: 'Bir matriste satıra Urunler[Kategori], değere [Net Satış] ve [Hedef] koydun. Hedef her satırda aynı. Neden?', o: ['Hedef ölçüsü yanlış yazılmış', 'Urunler\'deki filtre Hedefler tablosuna ulaşamıyor; Kategoriler[Kategori] kullanılmalı', 'Hedefler tablosu boş', 'İlişki çift yönlü olmalı'], a: 1, why: 'Hedefler yalnızca Kategoriler ve Tarih boyutlarına bağlı. Urunler bu yolda değil.' }
  ]
},

{
  id: 'kosullu-bicim', lv: 'orta', mod: 'Görselleştirme', min: 12,
  title: 'Koşullu biçimlendirme ve KPI\'lar',
  sum: 'Renk, veri çubukları ve simgeleri ölçülerle yönetmek; KPI ve gösterge görselleri.',
  body: `
<h2>Tablo ve matriste koşullu biçim</h2>
<p>Değer alanının açılır menüsü → <b>Koşullu biçimlendirme</b>:</p>
<ul>
<li><b>Arka plan rengi / Yazı rengi:</b> Renk skalası (ısı haritası), kurallar ya da <b>alan değeri</b> (renk kodunu bir ölçüden almak).</li>
<li><b>Veri çubukları:</b> Hücrenin içine küçük bir çubuk.</li>
<li><b>Simgeler:</b> ▲ ▼ ● gibi durum simgeleri.</li>
<li><b>Web URL'si:</b> Hücreyi bağlantıya çevirir.</li>
</ul>
<h2>Rengi DAX'la belirlemek</h2>
<pre class="dax">Durum Rengi =
SWITCH(TRUE(),
    [Hedef Gerçekleşme %] &gt;= 1, "#17855A",
    [Hedef Gerçekleşme %] &gt;= 0.95, "#A86A12",
    "#C0392B")</pre>
<p>Koşullu biçimde “Biçim stili: Alan değeri” seçip bu ölçüyü verirsin. Aynı ölçü sütun grafiğinin “Veri renkleri” bölümünde de (fx düğmesi) kullanılabilir. Kural tek yerde durur.</p>
<h2>KPI görseli ve gösterge</h2>
<ul>
<li><b>KPI görseli:</b> Değer + hedef + eğilim ekseni. Hedefin üstü yeşil, altı kırmızı.</li>
<li><b>Gösterge (gauge):</b> Yarım daire üzerinde değer, hedef çizgisi ve maksimum. Tek bir oran için.</li>
<li><b>Kart (yeni):</b> Birden çok ölçüyü tek görselde, referans etiketleriyle gösterir.</li>
</ul>
<div class="tip"><b>Ölçek</b>Isı haritası renk skalasında minimum ve maksimumu sabitlemezsen renkler her filtrede yeniden ölçeklenir; “koyu yeşil” bir sayfada %120, diğerinde %80 anlamına gelebilir. Kurallarla sabit eşikler daha tutarlıdır.</div>
`,
  ex: [
    { t: 'dax', q: '<b>Durum Rengi</b>: Hedef Gerçekleşme ≥ 1 ise "#17855A", değilse "#C0392B" döndür. <code>[Hedef Gerçekleşme %]</code> hazır.', name: 'Durum Rengi', sol: 'IF([Hedef Gerçekleşme %] >= 1, "#17855A", "#C0392B")', grid: [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'YilAy' }] },
    { t: 'mc', q: 'Bir matrisin hücre arka planını bir ölçünün döndürdüğü renk koduna göre boyamak için hangi biçim stili?', o: ['Renk skalası', 'Kurallar', 'Alan değeri', 'Veri çubukları'], a: 2, why: '“Alan değeri”, rengi doğrudan ölçünün döndürdüğü metinden (#RRGGBB ya da renk adı) alır.' }
  ]
}

);
