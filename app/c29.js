/* Kesit Power BI içerik 29: DAX çekirdeğini derinleştiren pratik dersleri (Kasım 2026, müfredat karşılaştırması §9). Her derste ağırlık DAX alıştırmasında. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, l) => { L.push(l); const O = W.PBI_ORDER; if (O && !O.includes(l.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, l.id); } };

/* ---------------------------------------------------------------- 1. Sayma */
add('toplama', {
  id: 'dax-sayma', lv: 'A2', mod: 'DAX Temelleri', min: 16,
  title: 'Saymanın yolları: COUNTROWS, DISTINCTCOUNT, COUNTBLANK ve boş sonuç',
  sum: 'Satır mı, sipariş mi, müşteri mi sayıyorsun? Doğru sayma işlevini seçmek, boşları ayırt etmek ve sıfır yerine boş dönen ölçüleri düzeltmek.',
  body: `
<h2>Ne sayıyorsun?</h2>
<p>“Kaç satış yaptık?” sorusunun üç doğru cevabı olabilir: <b>satır</b> sayısı (sipariş kalemi), <b>sipariş</b> sayısı (bir siparişte birden çok ürün olabilir) ve <b>müşteri</b> sayısı. Anadolu Market modelinde Satislar tablosunun her satırı bir sipariş kalemidir. Bu yüzden satır sayısı sipariş sayısından büyüktür.</p>
<div class="tbl-wrap"><table><tr><th>Soru</th><th>İşlev</th><th>Ne sayar?</th></tr>
<tr><td>Kaç satır var?</td><td><code>COUNTROWS(Satislar)</code></td><td>Tablodaki satırları (filtre bağlamında)</td></tr>
<tr><td>Kaç farklı sipariş?</td><td><code>DISTINCTCOUNT(Satislar[SiparisNo])</code></td><td>Sütundaki benzersiz değerleri (boş da bir değer sayılır)</td></tr>
<tr><td>Kaç dolu hücre?</td><td><code>COUNT</code> / <code>COUNTA</code></td><td>Boş olmayan değerleri</td></tr>
<tr><td>Kaç boş hücre?</td><td><code>COUNTBLANK(Musteriler[Sehir])</code></td><td>Boş (BLANK) değerleri</td></tr></table></div>
<pre class="dax">Satır Sayısı =
COUNTROWS(Satislar)</pre>
<p>COUNTROWS bir tablo alır, sütun değil. Excel'den gelenler COUNT(Satislar[SatirNo]) yazmaya alışkındır; sonuç çoğu zaman aynıdır ama niyeti COUNTROWS daha açık söyler ve boş hücreden etkilenmez.</p>

<h2>Benzersiz saymak</h2>
<p>Bir müşterinin üç siparişi varsa “müşteri sayısı” onu bir kez saymalıdır. <code>DISTINCTCOUNT</code> bunu yapar. Bir görselde kategori satırları ile toplam satırını karşılaştırın: kategori satırlarındaki müşteri sayılarını toplarsanız genel toplamdan büyük çıkar, çünkü aynı müşteri birçok kategoriden almıştır. Bu bir hata değildir; benzersiz sayımlar <b>toplanmaz</b>.</p>
<pre class="dax">Alışveriş Yapan Müşteri =
DISTINCTCOUNT(Satislar[MusteriNo])</pre>

<h2>Boş, sıfır ve COALESCE</h2>
<p>Bir kategori bir yıl hiç satılmadıysa ölçü <b>BLANK</b> döner ve görsel o satırı gizler. Bu genellikle istenen davranıştır. Ama bir tabloda “0” görmek istiyorsanız <code>COALESCE([Ölçü], 0)</code> kullanırsınız: ilk boş olmayan değeri döndürür. Dikkat: her satıra 0 yazdırmak, hiç ilişkisi olmayan kombinasyonları da (ör. hiç satılmamış ürün × her gün) görünür yapar ve görseli şişirir.</p>
<pre class="dax">İade Satırı (0'lı) =
COALESCE(CALCULATE(COUNTROWS(Satislar), Satislar[Durum] = "İade"), 0)</pre>
<div class="tip"><b>Ortalama ve DIVIDE</b>Ortalama sepet = net satış / sipariş sayısı. Bölmeyi her zaman <code>DIVIDE</code> ile yapın: sipariş yoksa hata yerine boş döner.</div>
`,
  ex: [
    { t: 'dax', name: 'Satır Sayısı', q: '<b>Satır Sayısı</b>: Satislar tablosundaki satır (sipariş kalemi) sayısı.', sol: 'COUNTROWS(Satislar)', hint: 'COUNTROWS bir tablo alır.' },
    { t: 'dax', name: 'Benzersiz Sipariş', q: '<b>Benzersiz Sipariş</b>: kaç farklı sipariş numarası var? (İptaller dahil.)', sol: 'DISTINCTCOUNT(Satislar[SiparisNo])', hint: 'DISTINCTCOUNT(Satislar[SiparisNo])' },
    { t: 'dax', name: 'Alışveriş Yapan Müşteri', q: '<b>Alışveriş Yapan Müşteri</b>: en az bir satış satırı olan farklı müşteri sayısı.', sol: 'DISTINCTCOUNT(Satislar[MusteriNo])', hint: 'Müşteri numarası Satislar tablosunda da var.' },
    { t: 'dax', name: 'Şehri Boş Müşteri', q: '<b>Şehri Boş Müşteri</b>: Musteriler tablosunda şehri boş olan müşteri sayısı. Bölgeye göre kontrol edilir.', sol: 'COUNTBLANK(Musteriler[Sehir])', grid: [{ t: 'Musteriler', c: 'Segment' }], hint: 'COUNTBLANK boş değerleri sayar.' },
    { t: 'dax', name: 'İade Satırı (0lı)', q: '<b>İade Satırı (0lı)</b>: durumu "İade" olan satır sayısı; hiç iade yoksa boş yerine 0 dönsün.', sol: 'COALESCE(CALCULATE(COUNTROWS(Satislar), Satislar[Durum] = "İade"), 0)', hint: 'CALCULATE ile Durum = "İade" filtresi, dışında COALESCE(…, 0).' },
    { t: 'dax', name: 'Sepet Ortalaması', q: '<b>Sepet Ortalaması</b>: [Net Satış] bölü [Sipariş Sayısı]; sıfıra bölme hatası vermesin.', sol: 'DIVIDE([Net Satış], [Sipariş Sayısı])', hint: 'DIVIDE(pay, payda)' },
    { t: 'dax', name: 'Sipariş Başına Kalem', q: '<b>Sipariş Başına Kalem</b>: iptal edilmemiş satırların sayısı bölü [Sipariş Sayısı] (bir siparişte ortalama kaç ürün satırı var?).', sol: 'DIVIDE(CALCULATE(COUNTROWS(Satislar), Satislar[Durum] <> "İptal"), [Sipariş Sayısı])', hint: '[Sipariş Sayısı] iptalleri dışarıda bırakır; payda da aynı kuralla saymalı.' },
    { t: 'mc', q: 'Kategori satırlarındaki <b>müşteri sayılarını</b> elle topladınız; sonuç genel toplamdan büyük. Neden?', o: ['Ölçü yanlış yazılmış ya da DISTINCTCOUNT bozuk', 'Genel toplam satırı görsel filtresini yok sayıyor', 'Aynı müşteri birçok kategoride sayılır', 'Modelde Musteriler ile ilişki eksik kalmış'], a: 2, why: 'DISTINCTCOUNT her satırda kendi bağlamında benzersiz sayar; aynı müşteri birçok satırda sayılır, genel toplamda bir kez.' },
  ],
});

/* ---------------------------------------------------------------- 2. Koşul */
add('dax-sayma', {
  id: 'dax-kosul', lv: 'A2', mod: 'DAX Temelleri', min: 15,
  title: 'Koşullar: IF, AND/OR, SWITCH ve SWITCH(TRUE()) ile sınıflar',
  sum: 'Bir ölçünün sonucuna göre metin ya da başka bir hesap döndürmek; birden çok koşulu bağlamak ve okunur sınıf ölçüleri yazmak.',
  body: `
<h2>IF: iki yol</h2>
<p><code>IF(koşul, doğruysa, yanlışsa)</code> Excel'deki EĞER ile aynı mantıktadır. Fark: DAX'ta koşul çoğu zaman bir <b>ölçünün</b> sonucudur ve her görsel hücresinde ayrı hesaplanır.</p>
<pre class="dax">Satış Durumu =
IF([Net Satış] >= 100000, "Güçlü", "Zayıf")</pre>
<p>Üçüncü bağımsız değişkeni yazmazsanız yanlış durumda <b>BLANK</b> döner; görselde o satır görünmeyebilir.</p>

<h2>Birden çok koşul: && ve ||</h2>
<p>“Ve” için <code>&&</code>, “veya” için <code>||</code> kullanın. <code>AND(a, b)</code> ve <code>OR(a, b)</code> işlevleri de vardır ama yalnız iki bağımsız değişken alır; üç koşulda iç içe yazmak gerekir. <code>NOT</code> bir koşulu tersine çevirir.</p>
<pre class="dax">Hedefte ve Kârlı =
IF([Hedef Gerçekleşme %] >= 1 && [Kâr Marjı %] >= 0.3, "Evet", "Hayır")</pre>

<h2>SWITCH: çok yol</h2>
<p>Bir değeri birçok seçenekle karşılaştırırken iç içe IF yerine <code>SWITCH</code> okunurdur. Aralık (eşik) sınıfları için kalıp <code>SWITCH(TRUE(), koşul1, sonuç1, koşul2, sonuç2, varsayılan)</code>'dır: ilk doğru koşulun sonucu döner. Koşulları <b>büyükten küçüğe</b> sıralayın; yoksa her değer ilk geniş koşula takılır.</p>
<pre class="dax">Performans Sınıfı =
SWITCH(TRUE(),
  [Kâr Marjı %] >= 0.40, "A",
  [Kâr Marjı %] >= 0.30, "B",
  "C")</pre>
<h2>Boş ve sıfır karşılaştırması</h2><p>DAX'ta BLANK bir karşılaştırmada 0 gibi davranır: <code>BLANK() &lt; 1</code> DOĞRU'dur. Bu yüzden hiç satışı olmayan bir satırda <code>IF([Net Satış] &lt; 1000, "Düşük")</code> “Düşük” yazar. Boşu ayrı ele almak istiyorsanız önce <code>ISBLANK([Net Satış])</code> ile sınayın. Koşullu ölçüyü yazdıktan sonra hem dolu hem boş bir satırda deneyin.</p>
<div class="warn"><b>Metin ölçüsü ve toplam</b>Metin döndüren ölçüler toplam satırında da hesaplanır: toplamın sınıfı, satırların sınıflarının “toplamı” değildir. Gerekirse toplamda boş döndürmek için HASONEVALUE kullanılır (Seçime göre çalışan hesaplar dersi).</div>
`,
  ex: [
    { t: 'dax', name: 'Satış Durumu', q: '<b>Satış Durumu</b>: [Net Satış] 100.000 ve üstüyse "Güçlü", değilse "Zayıf".', sol: 'IF([Net Satış] >= 100000, "Güçlü", "Zayıf")', hint: 'IF(koşul, "Güçlü", "Zayıf")' },
    { t: 'dax', name: 'Marj Uyarısı', q: '<b>Marj Uyarısı</b>: [Kâr Marjı %] yüzde 35\'in altındaysa "Düşük marj", değilse boş dönsün.', sol: 'IF([Kâr Marjı %] < 0.35, "Düşük marj")', hint: 'Üçüncü bağımsız değişkeni yazmazsan yanlış durumda BLANK döner.' },
    { t: 'dax', name: 'Hedefte ve Kârlı', q: '<b>Hedefte ve Kârlı</b>: [Hedef Gerçekleşme %] en az 0,97 ve [Kâr Marjı %] en az 0,35 ise "Evet", değilse "Hayır".', sol: 'IF([Hedef Gerçekleşme %] >= 0.97 && [Kâr Marjı %] >= 0.35, "Evet", "Hayır")', hint: 'İki koşulu && ile bağla.' },
    { t: 'dax', name: 'Web ya da Mobil Satış', q: '<b>Web ya da Mobil Satış</b>: kanalı "Web" veya "Mobil" olan satışların [Net Satış] toplamı.', sol: 'CALCULATE([Net Satış], Satislar[Kanal] = "Web" || Satislar[Kanal] = "Mobil")', hint: 'Aynı sütunda iki değer: || ile.' },
    { t: 'dax', name: 'Performans Sınıfı', q: '<b>Performans Sınıfı</b>: [Kâr Marjı %] 0,40 ve üstü "A", 0,30 ve üstü "B", diğerleri "C".', sol: 'SWITCH(TRUE(), [Kâr Marjı %] >= 0.40, "A", [Kâr Marjı %] >= 0.30, "B", "C")', hint: 'SWITCH(TRUE(), …); en yüksek eşik önce.' },
    { t: 'dax', name: 'Çeyrek Adı', q: '<b>Çeyrek Adı</b>: tek bir çeyrek seçiliyse MAX(Tarih[CeyrekNo]) değerine göre 1 → "Kış", 2 → "Bahar", 3 → "Yaz", 4 → "Güz" döndür.', sol: 'SWITCH(MAX(Tarih[CeyrekNo]), 1, "Kış", 2, "Bahar", 3, "Yaz", 4, "Güz")', grid: [{ t: 'Tarih', c: 'Ceyrek' }], noTotal: true, hint: 'SWITCH(değer, 1, "Kış", 2, …)' },
    { t: 'mc', q: '<code>SWITCH(TRUE(), [Marj] >= 0.30, "B", [Marj] >= 0.40, "A", "C")</code> yazıldı. Marjı 0,45 olan ürün hangi sınıfı alır?', o: ['B: ilk doğru koşulda durur', 'A, çünkü en yüksek eşik kazanır', 'C, çünkü iki koşul birden doğru', 'Hata, çünkü koşullar çakışıyor'], a: 0, why: 'SWITCH(TRUE()) ilk doğru koşulda durur. 0,45 ≥ 0,30 ilk koşul olduğu için "B" döner; eşikler büyükten küçüğe yazılmalıydı.' },
  ],
});

/* ---------------------------------------------------------------- 3. CALCULATE pratik */
add('calculate', {
  id: 'calculate-pratik', lv: 'B1', mod: 'DAX Bağlamları', min: 18,
  title: 'CALCULATE pratiği: filtreyi korumak, değiştirmek, kaldırmak',
  sum: 'KEEPFILTERS ile kesişim, REMOVEFILTERS ile kaldırma, ALL ile tüm tablo ve ALLSELECTED ile seçilenin içindeki pay: aynı soruya farklı cevaplar.',
  body: `
<h2>CALCULATE filtreyi değiştirir</h2>
<p><code>CALCULATE([Net Satış], Urunler[Kategori] = "Kitap")</code> bir görselde Elektronik satırında bile <b>Kitap</b> satışını gösterir: aynı sütundaki mevcut filtreyi <b>değiştirir</b>. Çoğu zaman istenen budur (ör. “Kitap satışı” sabit bir karşılaştırma sütunu).</p>
<pre class="dax">Kitap Satışı =
CALCULATE([Net Satış], Urunler[Kategori] = "Kitap")</pre>

<h2>KEEPFILTERS: kesişim</h2>
<p>“Bu satırda zaten Kitap seçiliyse göster, değilse boş kalsın” isteniyorsa filtre mevcut seçimle <b>kesişmelidir</b>: <code>KEEPFILTERS(Urunler[Kategori] = "Kitap")</code>. Elektronik satırında sonuç boş olur.</p>
<pre class="dax">Kitap Satışı (Kesişim) =
CALCULATE([Net Satış], KEEPFILTERS(Urunler[Kategori] = "Kitap"))</pre>

<h2>REMOVEFILTERS, ALL ve ALLSELECTED</h2>
<div class="tbl-wrap"><table><tr><th>Yazım</th><th>Etkisi</th><th>Tipik kullanım</th></tr>
<tr><td><code>REMOVEFILTERS(Urunler[Kategori])</code></td><td>Kategori filtresini kaldırır</td><td>Payda: tüm kategoriler</td></tr>
<tr><td><code>ALL(Urunler)</code></td><td>Ürün tablosundaki bütün filtreleri kaldırır</td><td>Ürünle ilgili hiçbir seçim sonucu değiştirmesin</td></tr>
<tr><td><code>ALLSELECTED(Urunler[Kategori])</code></td><td>Görselin kendi satırını kaldırır, dilimleyici seçimini korur</td><td>“Seçilenlerin içindeki pay”</td></tr></table></div>
<p>REMOVEFILTERS ile ALL'ın CALCULATE içindeki etkisi aynıdır; REMOVEFILTERS niyeti daha açık söyler. ALL ayrıca tablo döndüren bir işlev olarak da kullanılır (ör. COUNTROWS(ALL(Urunler))).</p>
<pre class="dax">Kategori Payı =
DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Urunler[Kategori])))</pre>
<div class="warn"><b>Ölçünün kendi filtresi</b>[Net Satış] içinde <code>Satislar[Durum] &lt;&gt; "İptal"</code> filtresi var. Bu yüzden görselde Durum dilimleyicisiyle "İptal" seçerseniz [Net Satış] yine iptal dışını gösterir: CALCULATE aynı sütundaki filtreyi değiştirir. Ölçünün içindeki filtreyi bilmeden dilimleyici sonucu şaşırtır.</div>
`,
  ex: [
    { t: 'dax', name: 'Kitap Satışı', q: '<b>Kitap Satışı</b>: her satırda Kitap kategorisinin [Net Satış] değerini göster (mevcut kategori filtresini değiştirerek).', sol: 'CALCULATE([Net Satış], Urunler[Kategori] = "Kitap")', hint: 'CALCULATE([Net Satış], Urunler[Kategori] = "Kitap")' },
    { t: 'dax', name: 'Kitap Satışı (Kesişim)', q: '<b>Kitap Satışı (Kesişim)</b>: yalnız Kitap satırında Kitap satışını göster; diğer kategorilerde boş kalsın.', sol: 'CALCULATE([Net Satış], KEEPFILTERS(Urunler[Kategori] = "Kitap"))', grid: [{ t: 'Urunler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }], hint: 'Filtreyi KEEPFILTERS içine al.' },
    { t: 'dax', name: 'Tüm Kategoriler Satışı', q: '<b>Tüm Kategoriler Satışı</b>: kategori filtresini kaldırarak [Net Satış] (yıl filtresi korunsun).', sol: 'CALCULATE([Net Satış], REMOVEFILTERS(Urunler[Kategori]))', grid: [{ t: 'Urunler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }], hint: 'REMOVEFILTERS(Urunler[Kategori])' },
    { t: 'dax', name: 'Kategori Payı (Ürün)', q: '<b>Kategori Payı (Ürün)</b>: her kategorinin [Net Satış] değerinin, aynı yıldaki tüm kategorilere oranı.', sol: 'DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Urunler[Kategori])))', grid: [{ t: 'Urunler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }], hint: 'Pay / REMOVEFILTERS ile hesaplanan payda.' },
    { t: 'dax', name: 'Elektronik ve 2024', q: '<b>Elektronik ve 2024</b>: Elektronik kategorisinin 2024 yılı [Net Satış] değeri (iki filtre birlikte).', sol: 'CALCULATE([Net Satış], Urunler[Kategori] = "Elektronik", Tarih[Yil] = 2024)', hint: 'CALCULATE içinde virgülle ayrılan filtreler VE ile birleşir.' },
    { t: 'dax', name: 'İndirimli Net Satış', q: '<b>İndirimli Net Satış</b>: indirimi (Satislar[Indirim]) sıfırdan büyük olan satırların [Net Satış] toplamı.', sol: 'CALCULATE([Net Satış], Satislar[Indirim] > 0)', hint: 'Sayısal karşılaştırma filtresi: Satislar[Indirim] > 0' },
    { t: 'dax', name: 'Yıl Payı', q: '<b>Yıl Payı</b>: her yılın [Net Satış] değerinin, üç yılın toplamına oranı (kategori filtresi korunsun).', sol: 'DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Tarih)))', hint: 'Tarih tablosundaki filtreyi kaldır.' },
    { t: 'mc', q: 'Bir görselde satırlarda kategori var. <code>CALCULATE([Net Satış], Urunler[Kategori] = "Kitap")</code> Elektronik satırında ne gösterir?', o: ['Boş bir hücre', 'Kitap satışı', 'Elektronik satışı', 'Tüm kategorilerin toplamı'], a: 1, why: 'CALCULATE aynı sütundaki filtreyi değiştirir: Elektronik filtresi kalkar, yerine Kitap gelir. Boş görmek için KEEPFILTERS gerekir.' },
  ],
});

/* ---------------------------------------------------------------- 4. Genel toplam */
add('iteratorler', {
  id: 'genel-toplam', lv: 'B1', mod: 'DAX Bağlamları', min: 14,
  title: 'Genel toplam neden farklı? Satır toplamı, oran ve toplam satırı',
  sum: 'Toplam satırı satırların toplamı değil, aynı ölçünün filtresiz hesabıdır. Oranlarda, ortalamalarda ve eşik ölçülerinde toplamın neden “yanlış” göründüğünü ve nasıl düzeltildiğini öğren.',
  body: `
<h2>Toplam satırı yeniden hesaplanır</h2>
<p>Power BI tablosundaki toplam satırı, yukarıdaki sayıların toplamı <b>değildir</b>. Ölçü, toplam satırının bağlamında (satır filtresi olmadan) bir kez daha hesaplanır. Toplanabilir ölçülerde (SUM, COUNTROWS) iki sonuç aynı çıkar. Oranlarda, ortalamalarda, benzersiz sayımlarda ve eşikli ölçülerde farklı çıkar.</p>
<pre class="dax">Marj (Satır Ortalaması) =
AVERAGEX(VALUES(Urunler[Kategori]), [Kâr Marjı %])</pre>
<p>[Kâr Marjı %] toplamda “toplam kâr / toplam satış” verir; yukarıdaki ölçü ise kategori marjlarının basit ortalamasını verir. Hangisinin doğru olduğu soruya bağlıdır: ağırlıklı marj çoğu zaman doğrusudur.</p>

<h2>Eşikli ölçüde toplam</h2>
<p>“100.000'in üstündeki kategorilerin satışı” gibi bir ölçü her satırda doğru çalışır. Toplamda ise koşul <b>toplam</b> için sınanır: toplam zaten 100.000'den büyük olduğu için bütün satış görünür. Doğrusu, koşulu her kategori için ayrı sınamak ve sonuçları toplamaktır: <code>SUMX(VALUES(Urunler[Kategori]), …)</code>.</p>
<pre class="dax">Büyük Kategori Satışı =
SUMX(VALUES(Urunler[Kategori]), IF([Net Satış] > 200000, [Net Satış]))</pre>

<h2>Toplamda göstermemek</h2>
<p>Bazı ölçülerin toplamı anlamsızdır (ör. “en çok satan ürünün adı”, sıra numarası). <code>HASONEVALUE(Urunler[Kategori])</code> satırda tek kategori varsa DOĞRU döner; toplamda YANLIŞ. <code>IF(HASONEVALUE(…), [Ölçü])</code> toplamı boş bırakır.</p>
<h2>Matrisin ara toplamları</h2><p>Aynı kural matrisin ara toplamlarında da geçerlidir: kategori ara toplamı, o kategorideki ürün satırlarının toplamı değil, ölçünün o kategori bağlamındaki hesabıdır. Ürün düzeyinde eşik uygulayan bir ölçü, ara toplamda yeniden “kategori” için sınanır. Bu yüzden eşik ve ortalama ölçülerinde SUMX(VALUES(Urunler[Urun]), …) ile hangi düzeyde topladığınızı açıkça yazın.</p>
<div class="tip"><b>Kural</b>Toplam satırını gördüğünüzde kendinize sorun: “Bu sayı, satırların toplamı mı olmalı, yoksa tüm veri üzerinden aynı hesap mı?” Cevaba göre SUMX(VALUES(…)) ya da HASONEVALUE kullanın.</div>
`,
  ex: [
    { t: 'dax', name: 'Marj (Satır Ortalaması)', q: '<b>Marj (Satır Ortalaması)</b>: kategori marjlarının ([Kâr Marjı %]) basit ortalaması: toplamda da kategorilerin ortalaması çıksın.', sol: 'AVERAGEX(VALUES(Urunler[Kategori]), [Kâr Marjı %])', grid: [{ t: 'Urunler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }], hint: 'AVERAGEX(VALUES(Urunler[Kategori]), …)' },
    { t: 'dax', name: 'Büyük Kategori Satışı', q: '<b>Büyük Kategori Satışı</b>: [Net Satış] değeri 200.000\'den büyük olan kategorilerin satışı; toplam satırı yalnız bu kategorileri toplasın.', sol: 'SUMX(VALUES(Urunler[Kategori]), IF([Net Satış] > 200000, [Net Satış]))', grid: [{ t: 'Urunler', c: 'Kategori' }], hint: 'Koşulu her kategori için ayrı sına: SUMX(VALUES(…), IF(…)).' },
    { t: 'dax', name: 'Kategori Satışı (Toplamsız)', q: '<b>Kategori Satışı (Toplamsız)</b>: [Net Satış] satırlarda görünsün, toplam satırında (birden çok kategori varken) boş kalsın.', sol: 'IF(HASONEVALUE(Urunler[Kategori]), [Net Satış])', grid: [{ t: 'Urunler', c: 'Kategori' }], hint: 'IF(HASONEVALUE(Urunler[Kategori]), [Net Satış])' },
    { t: 'dax', name: 'Satır Bazında Kâr Toplamı', q: '<b>Satır Bazında Kâr Toplamı</b>: iptal dışı satırlarda (Tutar − Maliyet) farkının toplamı (SUMX ile).', sol: 'SUMX(FILTER(Satislar, Satislar[Durum] <> "İptal"), Satislar[Tutar] - Satislar[Maliyet])', hint: 'SUMX(FILTER(Satislar, …), Tutar − Maliyet)' },
    { t: 'dax', name: 'Kategori Başına Ortalama Satış', q: '<b>Kategori Başına Ortalama Satış</b>: seçili kategorilerin [Net Satış] ortalaması (toplamda 7 kategorinin ortalaması).', sol: 'AVERAGEX(VALUES(Urunler[Kategori]), [Net Satış])', grid: [{ t: 'Urunler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }], hint: 'AVERAGEX(VALUES(…), [Net Satış])' },
    { t: 'mc', q: 'Tablo görselinde [Kâr Marjı %] satırları %30, %40, %50; toplam satırı %37 gösteriyor. Neden %40 değil?', o: ['Toplam satırı hatalı hesaplanmış olabilir', 'Bir kategori görselde filtrelenmiş olabilir', 'Yuvarlama farkı birikmiş olabilir', 'Toplam, tüm veride kâr bölü satıştır (ağırlıklı)'], a: 3, why: 'Toplam satırı satırların ortalaması değil, ölçünün filtresiz hesabıdır: ağırlıklı ortalama.' },
  ],
});

/* ---------------------------------------------------------------- 5. İlişki işlevleri */
add('genel-toplam', {
  id: 'iliski-fonk', lv: 'B1', mod: 'DAX Bağlamları', min: 16,
  title: 'İlişkilerle hesap: RELATED, RELATEDTABLE, LOOKUPVALUE, USERELATIONSHIP',
  sum: 'Bir tablodan ilişkili tablonun değerini okumak, bir boyut satırından olgu satırlarını saymak, ilişki yokken değer bulmak ve pasif ilişkiyi açmak.',
  body: `
<h2>RELATED: çok tarafından bir tarafına</h2>
<p>Satislar'ın bir satırındayken ürünün fiyatını okumak için <code>RELATED(Urunler[Fiyat])</code> yazılır. RELATED satır bağlamı ister: hesaplanmış sütunda ya da SUMX gibi bir yineleyicinin içinde çalışır.</p>
<pre class="dax">Liste Fiyatıyla Ciro =
SUMX(Satislar, Satislar[Adet] * RELATED(Urunler[Fiyat]))</pre>

<h2>RELATEDTABLE: bir tarafından çok tarafına</h2>
<p>Ürün tablosunun bir satırındayken o ürünün satış satırlarını almak için <code>RELATEDTABLE(Satislar)</code> kullanılır. Çoğu zaman COUNTROWS ile birlikte: “her ürünün kaç satış satırı var?”.</p>
<pre class="dax">Satırı Olan Ürün =
COUNTROWS(FILTER(Urunler, COUNTROWS(RELATEDTABLE(Satislar)) > 0))</pre>

<h2>LOOKUPVALUE: ilişki yoksa</h2>
<p>İki tablo arasında ilişki yoksa ya da bir tablodan tek bir değeri adla bulmak gerekiyorsa <code>LOOKUPVALUE(sonuç sütunu, arama sütunu, aranan değer)</code> Excel'deki DÜŞEYARA'ya benzer. Birden çok eşleşme varsa hata verir; modelde ilişki varsa RELATED hem hızlı hem güvenlidir.</p>
<pre class="dax">Kulaklık Fiyatı =
LOOKUPVALUE(Urunler[Fiyat], Urunler[Urun], "Kablosuz Kulaklık")</pre>

<h2>USERELATIONSHIP: pasif ilişkiyi açmak</h2>
<p>Satislar[TeslimTarihi] Tarih tablosuna <b>pasif</b> bir ilişkiyle bağlı. Teslim tarihine göre satış için ölçünün içinde bu ilişkiyi açarsınız. Açılan ilişki, o ölçü hesaplanırken etkin ilişkinin yerini alır.</p>
<pre class="dax">Teslim Tarihine Göre Satış =
CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))</pre>
<div class="note"><b>TREATAS</b>Fiziksel ilişki olmayan iki tablo arasında filtreyi aktarmak için <code>TREATAS(VALUES(Kaynak[Sütun]), Hedef[Sütun])</code> kullanılır (Seçime göre çalışan hesaplar dersi).</div>
`,
  ex: [
    { t: 'dax', name: 'Liste Fiyatıyla Ciro', q: '<b>Liste Fiyatıyla Ciro</b>: her satış satırında Adet × ürünün liste fiyatı (Urunler[Fiyat]); toplamı.', sol: 'SUMX(Satislar, Satislar[Adet] * RELATED(Urunler[Fiyat]))', hint: 'SUMX içinde RELATED(Urunler[Fiyat]).' },
    { t: 'dax', name: 'Liste Fiyatı Farkı', q: '<b>Liste Fiyatı Farkı</b>: [Liste Fiyatıyla Ciro] ile satırlardaki Tutar toplamı arasındaki fark (indirim ve fiyat değişiminin etkisi). Ölçüyü kendi ifadesiyle yaz.', sol: 'SUMX(Satislar, Satislar[Adet] * RELATED(Urunler[Fiyat])) - SUM(Satislar[Tutar])', hint: 'İki toplam arasındaki fark.' },
    { t: 'dax', name: 'Satırı Olan Ürün', q: '<b>Satırı Olan Ürün</b>: en az bir satış satırı olan ürün sayısı (Urunler üzerinde RELATEDTABLE ile).', sol: 'COUNTROWS(FILTER(Urunler, COUNTROWS(RELATEDTABLE(Satislar)) > 0))', hint: 'FILTER(Urunler, COUNTROWS(RELATEDTABLE(Satislar)) > 0)' },
    { t: 'dax', name: 'Seçili Ürünün Fiyatı', q: '<b>Seçili Ürünün Fiyatı</b>: tek bir ürün seçiliyse, adı SELECTEDVALUE(Urunler[Urun]) olan ürünün liste fiyatını LOOKUPVALUE ile bul.', sol: 'LOOKUPVALUE(Urunler[Fiyat], Urunler[Urun], SELECTEDVALUE(Urunler[Urun]))', grid: [{ t: 'Urunler', c: 'Urun' }], noTotal: true, hint: 'LOOKUPVALUE(Urunler[Fiyat], Urunler[Urun], SELECTEDVALUE(Urunler[Urun]))' },
    { t: 'dax', name: 'Teslim Tarihine Göre Satış', q: '<b>Teslim Tarihine Göre Satış</b>: [Net Satış] değerini sipariş tarihi yerine teslim tarihine göre hesapla.', sol: 'CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))', hint: 'USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih])' },
    { t: 'dax', name: 'Teslim Gecikme Farkı', q: '<b>Teslim Gecikme Farkı</b>: sipariş tarihine göre [Net Satış] eksi teslim tarihine göre net satış (yıl sınırında kayan satışlar).', sol: '[Net Satış] - CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))', hint: 'İki hesap arasındaki fark; yıl sonunda verilen siparişler ertesi yıl teslim edilir.' },
    { t: 'mc', q: 'Urunler tablosunda hesaplanmış sütuna <code>RELATED(Satislar[Tutar])</code> yazıldı ve hata verdi. Neden?', o: ['Satislar tablosunda Tutar sütunu yok', 'Hesaplanmış sütunda RELATED kullanılamaz', 'Bir ürünün birçok satış satırı vardır', 'Satislar ile Urunler ilişkisi pasif durumda'], a: 2, why: 'RELATED çok tarafından bir tarafına okur. Bir tarafından çok tarafına gitmek için RELATEDTABLE ve bir toplama (SUMX, COUNTROWS) gerekir.' },
  ],
});

/* ---------------------------------------------------------------- 6. Zaman pratik */
add('zaman-donem', {
  id: 'zaman-pratik', lv: 'B1', mod: 'Zaman Zekâsı', min: 18,
  title: 'Zaman pratiği: önceki ay, geçen yıl, hareketli dönem ve eksik dönemler',
  sum: 'DATEADD ve PREVIOUSMONTH ile önceki dönem, SAMEPERIODLASTYEAR ile yıllık değişim, DATESINPERIOD ile hareketli toplam ve yarım ayı tam ayla karşılaştırma hatası.',
  body: `
<h2>Önceki dönem</h2>
<p><code>DATEADD(Tarih[Tarih], -1, MONTH)</code> görseldeki her tarih aralığını bir ay geri kaydırır. Ay satırında önceki ayı, yıl satırında “bir ay geri kaydırılmış yılı” verir. <code>PREVIOUSMONTH(Tarih[Tarih])</code> ise her zaman bir önceki <b>tam ayı</b> döndürür. Zaman işlevlerinde tarih sütunu her zaman <b>tarih tablosundan</b> gelmelidir.</p>
<pre class="dax">Önceki Ay Satışı =
CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, MONTH))</pre>

<h2>Geçen yıl ve değişim</h2>
<pre class="dax">Geçen Yıl Satışı =
CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))</pre>
<p>Değişim oranı = (bu yıl − geçen yıl) / geçen yıl. Geçen yıl boşsa sonuç boş kalmalıdır; DIVIDE bunu sağlar.</p>

<h2>Hareketli dönem</h2>
<p>“Son 3 ay” toplamı için <code>DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -3, MONTH)</code>: görseldeki son tarihten geriye 3 aylık tarih kümesi. Mevsim dalgalanmasını yumuşatır.</p>
<pre class="dax">Son 3 Ay Satışı =
CALCULATE([Net Satış], DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -3, MONTH))</pre>

<h2>Eksik dönem tuzağı</h2>
<p>Veri ayın ortasında bitiyorsa son ay “düşmüş” görünür; gerçekte yarım aydır. Yıl başından bugüne (YTD) karşılaştırmada bu yıl 10 ay, geçen yıl 12 ay toplanırsa büyüme yanlış çıkar. Çözüm: geçen yılı da aynı güne kadar kesmek ya da yalnız tamamlanmış ayları karşılaştırmak.</p>
<h2>Tarih tablosu olmadan olmaz</h2><p>Zaman işlevleri kesintisiz bir tarih sütunu ister: her gün bir satır, boşluk yok. Satislar[Tarih] sütununu doğrudan kullanırsanız satış olmayan günler eksik olduğu için DATEADD ve SAMEPERIODLASTYEAR beklenmedik sonuç verir. Modeldeki Tarih tablosu “tarih tablosu olarak işaretli” olduğu için bu derste her zaman Tarih[Tarih] kullanılır.</p>
<div class="tip"><b>Kural</b>Her zaman ölçüsünün yanına “hangi tarih aralığını topladım?” sorusunu soran bir kontrol koyun: <code>MIN(Tarih[Tarih])</code> ve <code>MAX(Tarih[Tarih])</code> kartları.</div>
`,
  ex: [
    { t: 'dax', name: 'Önceki Ay Satışı', q: '<b>Önceki Ay Satışı</b>: [Net Satış] değerini bir ay geri kaydırılmış tarihlerle hesapla (DATEADD).', sol: 'CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, MONTH))', grid: [{ t: 'Tarih', c: 'YilAy' }], hint: 'DATEADD(Tarih[Tarih], -1, MONTH)' },
    { t: 'dax', name: 'Aylık Değişim %', q: '<b>Aylık Değişim %</b>: (bu ay − önceki ay) / önceki ay; önceki ay boşsa boş.', sol: 'DIVIDE([Net Satış] - CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, MONTH)), CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, MONTH)))', grid: [{ t: 'Tarih', c: 'YilAy' }], hint: 'VAR ile önceki ayı bir kez hesaplayıp DIVIDE kullanabilirsin.' },
    { t: 'dax', name: 'Geçen Yıl Satışı', q: '<b>Geçen Yıl Satışı</b>: SAMEPERIODLASTYEAR ile geçen yılın aynı dönemi.', sol: 'CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))', hint: 'SAMEPERIODLASTYEAR(Tarih[Tarih])' },
    { t: 'dax', name: 'Yıllık Büyüme', q: '<b>Yıllık Büyüme</b>: [Net Satış] eksi geçen yılın aynı dönemi (fark, oran değil).', sol: '[Net Satış] - CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))', hint: 'Fark: bu yıl − geçen yıl.' },
    { t: 'dax', name: 'Son 3 Ay Satışı', q: '<b>Son 3 Ay Satışı</b>: görseldeki son tarihten geriye 3 aylık [Net Satış] toplamı.', sol: 'CALCULATE([Net Satış], DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -3, MONTH))', grid: [{ t: 'Tarih', c: 'YilAy' }], hint: 'DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -3, MONTH)' },
    { t: 'dax', name: 'Çeyrek Başından Satış', q: '<b>Çeyrek Başından Satış</b>: çeyrek başından görseldeki tarihe kadar [Net Satış] (DATESQTD).', sol: 'CALCULATE([Net Satış], DATESQTD(Tarih[Tarih]))', grid: [{ t: 'Tarih', c: 'YilAy' }], hint: 'DATESQTD(Tarih[Tarih])' },
    { t: 'dax', name: 'Yıl Başından Satış', q: '<b>Yıl Başından Satış</b>: TOTALYTD ile yıl başından bugüne [Net Satış].', sol: 'TOTALYTD([Net Satış], Tarih[Tarih])', grid: [{ t: 'Tarih', c: 'YilAy' }], hint: 'TOTALYTD([Net Satış], Tarih[Tarih])' },
    { t: 'mc', q: 'Veri 15 Ekim\'de bitiyor. Ekim satışı geçen yılın Ekim\'ine göre %48 düşük görünüyor. İlk ne yaparsınız?', o: ['Satış ekibine düşüşü hemen bildirmek', 'Ekim\'i rapordan tamamen çıkarmak', 'Aynı gün aralığıyla karşılaştırmak', 'Ölçüyü DATEADD ile yeniden yazmak'], a: 2, why: 'Yarım ay tam ayla karşılaştırılmış olabilir. Geçen yılı da 15 Ekim\'e kadar kesin ya da yalnız tamamlanmış ayları karşılaştırın.' },
  ],
});

/* ---------------------------------------------------------------- 7. Katkı analizi */
add('siralama', {
  id: 'katki-analizi', lv: 'B2', mod: 'DAX Kalıpları', min: 18,
  title: 'Sıralama ve katkı: eşitlikli sıra, TOPN payı, Pareto ve ABC',
  sum: 'RANKX ile eşitlik ve seçime göre sıra, TOPN ile en iyi ürünlerin payı, birikimli pay ile Pareto ve eşiklerle ABC sınıfı.',
  body: `
<h2>RANKX ve eşitlik</h2>
<p><code>RANKX(ALL(Urunler[Urun]), [Net Satış])</code> her ürünün tüm ürünler içindeki sırasını verir. Eşit değerler aynı sırayı alır; sonraki sıra atlanır (1, 2, 2, 4). Atlamasız sıra için beşinci bağımsız değişken <code>DENSE</code> yazılır. <code>ALL</code> yerine <code>ALLSELECTED</code> kullanırsanız sıra yalnız dilimleyicide seçilen ürünler arasında yapılır.</p>
<pre class="dax">Ürün Sırası (Seçili) =
RANKX(ALLSELECTED(Urunler[Urun]), [Net Satış])</pre>

<h2>TOPN ve katkı</h2>
<p><code>TOPN(5, ALL(Urunler[Urun]), [Net Satış])</code> en çok satan 5 ürünün tablosunu döndürür. Bu tabloyu CALCULATE'e filtre olarak verirseniz “ilk 5 ürünün satışı”, bunu toplama bölerseniz “ilk 5'in payı” çıkar.</p>
<pre class="dax">İlk 5 Ürün Payı =
DIVIDE(CALCULATE([Net Satış], TOPN(5, ALL(Urunler[Urun]), [Net Satış])), CALCULATE([Net Satış], ALL(Urunler)))</pre>

<h2>Pareto ve ABC</h2>
<p>Pareto: ürünleri büyükten küçüğe sıraladığınızda, bu ürüne kadar olanların toplam içindeki birikimli payı. Bir ürünün birikimli satışı = satışı kendisininkinden büyük ya da eşit olan ürünlerin satışı. ABC sınıfı bu paya göre verilir: ilk %80 A, sonraki %15 B, kalan C. Kategorinin kendi satışına göre değil, birikimli paya göre sınıflandırmak gerekir.</p>
<pre class="dax">Birikimli Pay =
VAR s = [Net Satış]
RETURN DIVIDE(
  SUMX(FILTER(ALL(Urunler[Urun]), [Net Satış] >= s), [Net Satış]),
  CALCULATE([Net Satış], ALL(Urunler)))</pre>
<h2>Hangisini ne zaman?</h2><p>Sıra numarası bir listeyi okumayı kolaylaştırır ama tek başına karar vermez: 1. ile 2. arasında büyük fark olabilir. Katkı payı ve birikimli pay ise “ilk 5 ürün satışın ne kadarını yapıyor?”, “stokta hangi ürünlere öncelik vermeliyim?” gibi soruları cevaplar. ABC sınıfını stok ve tedarik kararlarında, Pareto'yu sorunların önceliklendirilmesinde kullanın.</p>
<div class="tip"><b>Görsel hesaplama ile</b>Aynı Pareto'yu bir tablo görselinde <code>RUNNINGSUM</code> ile de kurabilirsiniz (Görsel hesaplamalar dersi). Model ölçüsü ise her görselde ve dışa aktarmada çalışır.</div>
`,
  ex: [
    { t: 'dax', name: 'Ürün Sırası (Tüm)', q: '<b>Ürün Sırası (Tüm)</b>: her ürünün tüm ürünler içindeki [Net Satış] sırası (1 en büyük).', sol: 'RANKX(ALL(Urunler[Urun]), [Net Satış])', grid: [{ t: 'Urunler', c: 'Urun' }], noTotal: true, hint: 'RANKX(ALL(Urunler[Urun]), [Net Satış])' },
    { t: 'dax', name: 'Ürün Sırası (Atlamasız)', q: '<b>Ürün Sırası (Atlamasız)</b>: eşitlikte sıra atlamasın (DENSE).', sol: 'RANKX(ALL(Urunler[Urun]), [Net Satış], , DESC, DENSE)', grid: [{ t: 'Urunler', c: 'Urun' }], noTotal: true, hint: 'RANKX(…, [Net Satış], , DESC, DENSE)' },
    { t: 'dax', name: 'Kategori İçi Sıra', q: '<b>Kategori İçi Sıra</b>: her ürünün kendi kategorisindeki ürünler arasında [Net Satış] sırası.', sol: 'RANKX(ALLEXCEPT(Urunler, Urunler[Kategori]), [Net Satış])', grid: [{ t: 'Urunler', c: 'Urun' }], noTotal: true, hint: 'ALLEXCEPT(Urunler, Urunler[Kategori]) kategori filtresini korur.' },
    { t: 'dax', name: 'İlk 5 Ürün Satışı', q: '<b>İlk 5 Ürün Satışı</b>: tüm ürünler arasında en çok satan 5 ürünün toplam [Net Satış] değeri.', sol: 'CALCULATE([Net Satış], TOPN(5, ALL(Urunler[Urun]), [Net Satış]))', grid: [{ t: 'Tarih', c: 'Yil' }], hint: 'CALCULATE([Net Satış], TOPN(5, ALL(Urunler[Urun]), [Net Satış]))' },
    { t: 'dax', name: 'İlk 5 Ürün Payı', q: '<b>İlk 5 Ürün Payı</b>: en çok satan 5 ürünün satışının tüm ürünlerin satışına oranı.', sol: 'DIVIDE(CALCULATE([Net Satış], TOPN(5, ALL(Urunler[Urun]), [Net Satış])), CALCULATE([Net Satış], ALL(Urunler)))', grid: [{ t: 'Tarih', c: 'Yil' }], hint: 'İlk 5\'in satışı / ALL(Urunler) ile toplam.' },
    { t: 'dax', name: 'Birikimli Pay (Ürün)', q: '<b>Birikimli Pay (Ürün)</b>: satışı bu ürününkinden büyük ya da eşit olan ürünlerin toplam satışının, tüm ürünlerin satışına oranı.', sol: 'VAR s = [Net Satış] RETURN DIVIDE(SUMX(FILTER(ALL(Urunler[Urun]), [Net Satış] >= s), [Net Satış]), CALCULATE([Net Satış], ALL(Urunler)))', grid: [{ t: 'Urunler', c: 'Urun' }], noTotal: true, hint: 'VAR ile ürünün satışını sakla; FILTER(ALL(Urunler[Urun]), [Net Satış] >= s).' },
    { t: 'dax', name: 'ABC Sınıfı (Ürün)', q: '<b>ABC Sınıfı (Ürün)</b>: birikimli pay 0,80\'e kadar "A", 0,95\'e kadar "B", üstü "C". Birikimli payı ölçünün içinde VAR ile hesapla.', sol: 'VAR s = [Net Satış] VAR p = DIVIDE(SUMX(FILTER(ALL(Urunler[Urun]), [Net Satış] >= s), [Net Satış]), CALCULATE([Net Satış], ALL(Urunler))) RETURN SWITCH(TRUE(), p <= 0.80, "A", p <= 0.95, "B", "C")', grid: [{ t: 'Urunler', c: 'Urun' }], noTotal: true, hint: 'Birikimli payı VAR p ile hesapla, sonra SWITCH(TRUE(), p <= 0.80, "A", …).' },
    { t: 'mc', q: 'Dilimleyiciyle yalnız 3 kategori seçildi. <code>RANKX(ALL(Urunler[Urun]), [Net Satış])</code> sıraları 1\'den başlamıyor. Neden?', o: ['ALL seçimi yok sayar; ALLSELECTED gerek', 'RANKX eşitlikte sırayı atlıyor', 'Ürün tablosu dilimleyiciyle süzülemez', 'Net Satış iptalleri dışarıda bırakır'], a: 0, why: 'ALL bütün filtreleri kaldırır; sıra tüm ürünler arasında yapılır. Seçili ürünler arasında sıralamak için ALLSELECTED kullanılır.' },
  ],
});

/* ---------------------------------------------------------------- 8. Seçime göre */
add('katki-analizi', {
  id: 'secime-gore', lv: 'B2', mod: 'DAX Kalıpları', min: 18,
  title: 'Seçime göre çalışan hesaplar: SELECTEDVALUE, ISINSCOPE, ölçü seçici ve dinamik metin',
  sum: 'Dilimleyicide ne seçildiğini okumak, toplam ve ayrıntı düzeyini ayırmak, bağlantısız bir tabloyla gösterilen ölçüyü değiştirmek ve başlığı seçimle yazmak.',
  body: `
<h2>Ne seçildi?</h2>
<p><code>SELECTEDVALUE(Urunler[Kategori], "Tüm kategoriler")</code> tek bir kategori seçiliyse onun adını, değilse ikinci bağımsız değişkeni döndürür. <code>HASONEVALUE</code> aynı soruyu DOĞRU/YANLIŞ olarak cevaplar. Birden çok seçimi metne dökmek için <code>CONCATENATEX(VALUES(Urunler[Kategori]), Urunler[Kategori], ", ")</code>.</p>
<pre class="dax">Seçili Kategori =
SELECTEDVALUE(Urunler[Kategori], "Tüm kategoriler")</pre>

<h2>ISINSCOPE: hangi düzeydeyim?</h2>
<p>Matris görselinde Kategori → Ürün hiyerarşisi varsa, ürün satırında <code>ISINSCOPE(Urunler[Urun])</code> DOĞRU, kategori ara toplamında YANLIŞ döner. Ürün düzeyinde “kategori içindeki pay”, kategori düzeyinde “toplam içindeki pay” göstermek için kullanılır. HASONEVALUE filtre sayar, ISINSCOPE ise görseldeki gruplama düzeyini.</p>

<h2>Ölçü seçici: bağlantısız tablo + SWITCH</h2>
<p>OlcuSecimi tablosu modele <b>bağlı değildir</b>; yalnız dilimleyicide seçenek göstermek için vardır. Ölçü, seçilen metne göre doğru ölçüyü döndürür:</p>
<pre class="dax">Seçilen Gösterge =
SWITCH(SELECTEDVALUE(OlcuSecimi[Olcu], "Net Satış"),
  "Net Satış", [Net Satış],
  "Brüt Kâr", [Brüt Kâr],
  "Sipariş Sayısı", [Sipariş Sayısı],
  "Müşteri Sayısı", [Müşteri Sayısı])</pre>
<p>Power BI'daki <b>alan parametreleri</b> aynı işi arayüzden yapar ve eksendeki alanı da değiştirebilir; ölçü seçici ise biçim ve hesap üzerinde tam kontrol verir.</p>

<h2>Dinamik başlık</h2>
<p>Görsel başlığı bir ölçüye bağlanabilir (Biçim > Başlık > fx). <code>FORMAT</code> sayıyı metne çevirir: <code>FORMAT([Net Satış], "#,0")</code>.</p>
<pre class="dax">Başlık Metni =
"Net satış: " & FORMAT([Net Satış], "#,0") & " · " & SELECTEDVALUE(Urunler[Kategori], "Tüm kategoriler")</pre>
`,
  ex: [
    { t: 'dax', name: 'Seçili Kategori', q: '<b>Seçili Kategori</b>: tek bir kategori seçiliyse adı, değilse "Tüm kategoriler".', sol: 'SELECTEDVALUE(Urunler[Kategori], "Tüm kategoriler")', grid: [{ t: 'Urunler', c: 'Kategori' }], hint: 'SELECTEDVALUE(sütun, yedek)' },
    { t: 'dax', name: 'Seçili Kategoriler Listesi', q: '<b>Seçili Kategoriler Listesi</b>: bağlamdaki kategorilerin adlarını virgül ve boşlukla ayrılmış tek metin olarak döndür (alfabetik).', sol: 'CONCATENATEX(VALUES(Urunler[Kategori]), Urunler[Kategori], ", ", Urunler[Kategori], ASC)', grid: [{ t: 'Urunler', c: 'Kategori' }], hint: 'CONCATENATEX(VALUES(…), …, ", ", …, ASC)' },
    { t: 'dax', name: 'Düzeye Göre Pay', q: '<b>Düzeye Göre Pay</b>: ürün düzeyindeysen (ISINSCOPE(Urunler[Urun])) ürünün kendi kategorisindeki payı, değilse kategorinin toplam içindeki payı.', sol: 'IF(ISINSCOPE(Urunler[Urun]), DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Urunler[Urun]))), DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Urunler))))', grid: [{ t: 'Urunler', c: 'Kategori' }, { t: 'Urunler', c: 'Urun' }], hint: 'IF(ISINSCOPE(Urunler[Urun]), ürün/kategori, kategori/toplam)' },
    { t: 'dax', name: 'Seçilen Gösterge', q: '<b>Seçilen Gösterge</b>: OlcuSecimi[Olcu] seçimine göre [Net Satış], [Brüt Kâr], [Sipariş Sayısı] ya da [Müşteri Sayısı]; seçim yoksa [Net Satış].', sol: 'SWITCH(SELECTEDVALUE(OlcuSecimi[Olcu], "Net Satış"), "Net Satış", [Net Satış], "Brüt Kâr", [Brüt Kâr], "Sipariş Sayısı", [Sipariş Sayısı], "Müşteri Sayısı", [Müşteri Sayısı])', grid: [{ t: 'OlcuSecimi', c: 'Olcu' }], hint: 'SWITCH(SELECTEDVALUE(OlcuSecimi[Olcu], "Net Satış"), …)' },
    { t: 'dax', name: 'Başlık Metni', q: '<b>Başlık Metni</b>: "Net satış: " + [Net Satış] binlik ayırıcılı tam sayı (FORMAT "#,0") + " · " + seçili kategori (yoksa "Tüm kategoriler").', sol: '"Net satış: " & FORMAT([Net Satış], "#,0") & " · " & SELECTEDVALUE(Urunler[Kategori], "Tüm kategoriler")', grid: [{ t: 'Urunler', c: 'Kategori' }], hint: 'Metinleri & ile birleştir.' },
    { t: 'dax', name: 'Kategori Satışı (Seçim Varsa)', q: '<b>Kategori Satışı (Seçim Varsa)</b>: tek bir kategori seçiliyse [Net Satış], değilse boş (HASONEVALUE).', sol: 'IF(HASONEVALUE(Urunler[Kategori]), [Net Satış])', grid: [{ t: 'Urunler', c: 'Kategori' }], hint: 'IF(HASONEVALUE(Urunler[Kategori]), [Net Satış])' },
    { t: 'mc', q: 'Ölçü seçici için OlcuSecimi tablosunu Satislar ile ilişkilendirdiniz. Ne olur?', o: ['Ölçü daha hızlı çalışır', 'Bu ilişki ölçü seçici için zorunludur', 'SWITCH çalışmaz, ama sonuç yine doğru kalır', 'Gereksiz: tablo yalnız seçenek gösterir'], a: 3, why: 'Bağlantısız (disconnected) tablo yalnız dilimleyicide değer seçtirir; ölçü SELECTEDVALUE ile bu seçimi okur.' },
  ],
});
})(typeof window !== 'undefined' ? window : globalThis);
