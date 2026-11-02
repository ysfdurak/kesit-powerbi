/* Kesit Power BI — İleri DAX genişletmeleri (1): bağlam geçişi, tablo fonksiyonları, pencere, DAX sorgu, ileri kalıplar, hiyerarşi, ileri zaman, ileri istatistik */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, o) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('ext: ders yok', id); return; } if (o.html) l.body += '<section class="deep"><span class="eyebrow">Uzmanlaş</span>' + o.html + '</section>'; if (o.ex) l.ex = (l.ex || []).concat(o.ex); if (o.min) l.min += o.min; (W.PBI_EXT = W.PBI_EXT || []).push({ id, html: o.html || '', ex: o.ex || [] }); };

/* ───────────────────────── 1. BAĞLAM GEÇİŞİ ───────────────────────── */
ext('baglam-gecisi', { min: 22, html: `
<h2>Bağlam geçişinin bedeli: her satırda bir CALCULATE</h2>
<p>Satış müdürü, "Temsilci Performansı" sayfasının yavaş açıldığından yakınıyor. Sayfadaki bir kart şu ölçüyü kullanıyor: <code>SUMX(Satislar, [Net Satış])</code>. Sonuç doğru: 1.250.772,45 ₺. Peki motor bu sayıya nasıl ulaşıyor?</p>
<ol>
<li>SUMX, Satislar tablosunun 1.620 satırını tek tek dolaşır. Her satırda bir satır bağlamı açılır.</li>
<li>[Net Satış] bir ölçüdür; her ölçü gizli bir CALCULATE ile sarılıdır. CALCULATE satır bağlamını görünce bağlam geçişini çalıştırır: satırın 17 sütununun değeri tek tek filtreye dönüşür.</li>
<li>Bu yeni filtre bağlamında ölçünün kendi filtresi (<code>Satislar[Durum] &lt;&gt; "İptal"</code>) eklenir ve SUM hesaplanır.</li>
<li>Bu iş 1.620 kez tekrarlanır ve sonuçlar toplanır.</li>
</ol>
<div class="tbl-wrap"><table>
<tr><th>Yazım</th><th>Dolaşılan satır</th><th>Bağlam geçişi</th><th>Sonuç</th></tr>
<tr><td><code>SUMX(Satislar, [Net Satış])</code></td><td>1.620</td><td>1.620</td><td>1.250.772,45</td></tr>
<tr><td><code>SUMX(VALUES(Urunler[Urun]), [Net Satış])</code></td><td>40</td><td>40</td><td>1.250.772,45</td></tr>
<tr><td><code>[Net Satış]</code></td><td>yok</td><td>0</td><td>1.250.772,45</td></tr>
</table></div>
<p>Üç yazım da aynı sayıyı verir; maliyetleri çok farklıdır. Power BI'ın motorunda basit toplamalar depolama motorunda (storage engine) sıkıştırılmış sütunlar üzerinde çalışır ve çok hızlıdır. Satır satır bağlam geçişi gerektiren ifadeler ise işi formül motoruna (formula engine) taşır. Bin satırda fark görünmez, on milyon satırda saniyelerle ölçülür.</p>
<p>Nasıl ölçersin? Rapor görünümünde Optimize şeridi → <b>Performans Analizi (Performance analyzer)</b> → kaydı başlat, görselleri yenile, görselin sorgusunu kopyala. Sorguyu DAX Studio'da Server Timings açık çalıştır. Formül motoru süresi yüksek, depolama motoru sorgu sayısı fazlaysa bağlam geçişinden şüphelen.</p>
<div class="tip"><b>Kural</b>İteratörü sorunun tanecik düzeyinde (müşteri, ürün, ay) döndür. Olgu tablosunda dolaşman gerekiyorsa ölçü çağırma, sütun ifadesi yaz: <code>SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat])</code> bağlam geçişi içermez.</div>

<h2>İteratör içinde ölçü çağırmak: üç sessiz fark</h2>
<h3>1. Boş satırlar ortalamadan düşer</h3>
<pre class="dax">Alıcı Ortalaması =
AVERAGEX(Musteriler, [Net Satış])

Kayıtlı Müşteri Ortalaması =
DIVIDE([Net Satış], COUNTROWS(Musteriler))</pre>
<p>Birincisi 9.196,86 ₺, ikincisi 8.338,48 ₺ döndürür. Musteriler'de 150 satır var, ama 14 müşteri hiç alışveriş yapmamış. Onların [Net Satış] değeri BLANK'tir ve AVERAGEX boşları atlar; yani 150'ye değil 136'ya böler. Hangisi doğru? Soru "alışveriş yapan müşteri başına" ise birincisi, "kayıtlı müşteri başına" ise ikincisi. Ölçünün adı bu farkı açıkça söylemeli.</p>
<h3>2. Ölçü yerine çıplak toplama yazmak</h3>
<pre class="dax">Yanlış Değerli Müşteri =
COUNTROWS(FILTER(Musteriler, SUM(Satislar[Tutar]) &gt; 10000))</pre>
<p>Sonuç 150'dir. FILTER'ın satır bağlamı filtre değildir; her müşteri satırında SUM tüm tabloyu (1.346.189,85 ₺) görür ve koşul herkes için doğru çıkar. Aynı koşulu [Net Satış] ile yazınca bağlam geçişi devreye girer ve sonuç 42 olur. Yanlış sürüm hata vermez, yalnızca yanlış sayı üretir. Kod incelemesinde ilk aranacak şey budur.</p>
<h3>3. Ölçünün kendi filtresi satırı kurtarmaz</h3>
<p>[Net Satış] içinde <code>Satislar[Durum] &lt;&gt; "İptal"</code> var. Bu filtre, Durum sütunundaki dış filtrenin yerine geçer. Bir matrise Kanal ve Durum koyarsan "Web / İptal" hücresinde 457.330,90 ₺ görürsün: bu, Web'in tüm net satışıdır. Okuyan kişi bunu "iptal edilen tutar" sanar.</p>
<p>Oysa aynı ölçü <code>SUMX(Satislar, [Net Satış])</code> içinde çağrıldığında iptal satırları boş döner. Neden? Bağlam geçişi yalnızca Durum'u değil SatirNo dahil bütün sütunları filtreler. Durum filtresinin değiştirilmesi, satırın kendisini seçen SatirNo filtresini kaldırmaz; o satır iptal olduğu için kesişim boştur. Aynı ölçü, aynı tabloda iki farklı davranış gösterir.</p>
<div class="warn"><b>Durum kırılımı olan raporlar</b>Ölçünün filtresini KEEPFILTERS ile yaz: <code>CALCULATE([Toplam Satış], KEEPFILTERS(Satislar[Durum] &lt;&gt; "İptal"))</code>. KEEPFILTERS dış filtreyi silmez, onunla kesişir; İptal hücresi boş kalır ve satır görselden düşer.</div>

<h2>Yinelenen satırlar: sayı nasıl şişer?</h2>
<p>Muhasebe, ERP'den "günlük ürün satışı" adlı bir Excel dosyası gönderiyor: Tarih, UrunNo ve Tutar sütunları var, satır numarası yok. Aynı gün aynı ürün aynı tutarla iki kez satıldıysa dosyada birebir aynı iki satır bulunur. Bu tabloda <code>SUMX(Tablo, [Ölçü])</code> çalıştırırsan ne olur? Modelde bunu taklit etmek için bağlam geçişinin yalnızca bu üç sütunu filtrelediğini varsayalım:</p>
<pre class="dax">Anahtarsız Tablo Taklidi =
SUMX(
    Satislar,
    CALCULATE(
        SUM(Satislar[Tutar]),
        ALLEXCEPT(Satislar, Satislar[Tarih], Satislar[UrunNo], Satislar[Tutar])
    )
)</pre>
<p>Gerçek toplam 1.346.189,85 ₺; bu ölçü 1.387.343,85 ₺ döndürür (%3,1 fazla). Satislar'da bu üç sütuna göre 24 yinelenen satır var. İkiz satırlardan her biri, bağlam geçişinde ikisini birden seçer ve toplam iki kez sayılır. Yalnızca Tarih ve UrunNo kalsaydı 65 tekrar oluşur, sonuç 1.432.133,80 ₺'ye (%6,4 fazla) çıkardı. Hata toplamda küçük bir sapma gibi görünür; kimse fark etmez.</p>
<div class="tbl-wrap"><table>
<tr><th>Çözüm</th><th>Ne zaman?</th></tr>
<tr><td>Power Query'de Dizin sütunu (Index column) ekle</td><td>Kaynakta anahtar yoksa; ilk tercih</td></tr>
<tr><td>İteratörü boyut anahtarında döndür: <code>VALUES(Urunler[UrunNo])</code></td><td>Soru zaten ürün ya da müşteri düzeyindeyse</td></tr>
<tr><td>Ölçü yerine sütun ifadesi: <code>SUMX(T, T[Tutar])</code></td><td>Satır düzeyinde hesap yeterliyse; bağlam geçişi hiç yok</td></tr>
<tr><td>Test: <code>COUNTROWS(T) = DISTINCTCOUNT(T[Anahtar])</code></td><td>Her yeni olgu tablosunda, DAX sorgusuyla</td></tr>
</table></div>

<h2>Bağlam geçişi bütün satır bağlamlarını dönüştürür</h2>
<p>İç içe iteratörlerde bağlam geçişi yalnızca en içteki satırı değil, açık olan tüm satır bağlamlarını filtreye çevirir. Şu sorguda dış satır bir segment, iç satır bir müşteridir:</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    VALUES(Musteriler[Segment]),
    "Değerli", COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), [Net Satış] &gt; 10000))
)</pre>
<p>İçteki VALUES(Musteriler[MusteriNo]) segment satırına göre süzülmez; her segmentte 150 müşterinin hepsini döndürür. Ama [Net Satış] çağrıldığında hem müşteri hem segment filtreye döner. Başka segmentteki müşteri için kesişim boştur ve koşul yanlış çıkar. Sonuç yine doğrudur: Premium 21, Kurumsal 14, Bireysel 7. Doğru ama pahalı: her segmentte 150 müşteri dolaşılır. Dış ifadeyi CALCULATE ile sarmak (bir sonraki alıştırma) listeyi baştan segmente göre süzer ve gereksiz geçişleri önler.</p>

<h2>ALLSELECTED iteratörün içinde</h2>
<p>[Seçime Göre Pay %] şöyle tanımlı: <code>DIVIDE([Net Satış], CALCULATE([Net Satış], ALLSELECTED()))</code>. Bir analist "her kanalda kategorilerin ortalama payı"nı istiyor ve şunu yazıyor: <code>AVERAGEX(VALUES(Kategoriler[Kategori]), [Seçime Göre Pay %])</code>. Beklentisi her kanal satırında %14,29 (yedi payın ortalaması). Görselde ise Web %5,22, Mobil %6,85, Mağaza %2,21 çıkıyor.</p>
<p>Mekanizma: ALLSELECTED(), görselin kendi satırlarından gelen filtreleri (burada Kanal) ve bağlam geçişinden gelen kategori filtresini kaldırır; yalnızca görselin dışından gelen filtreleri (dilimleyiciler, sayfa filtreleri) bırakır. Payda Web'in toplamı değil, görselin genel toplamıdır. Yedi payın ortalaması Web'in genel paydaki yerinin (%36,56) yedide biri olur.</p>
<pre class="dax">Kanal İçi Ortalama Kategori Payı =
VAR KanalSatis = [Net Satış]
RETURN
    AVERAGEX(VALUES(Kategoriler[Kategori]), DIVIDE([Net Satış], KanalSatis))</pre>
<p>Doğru yazım paydayı iteratörden önce bir değişkene alır; her kanal satırında %14,29 çıkar. Kural: ALLSELECTED kullanan ölçüleri doğrudan görselde kullan, başka bir iteratörün içinden çağırma. Çağırman gerekiyorsa davranışı DAX sorgu görünümünde ayrıca test et.</p>

<h2>Hesaplanmış sütunda bağlam geçişi</h2>
<p>Ürün tablosuna "ürünün toplam satışı" sütunu eklenecek. Hesaplanmış sütunda satır bağlamı vardır, filtre bağlamı yoktur. Aşağıdaki sorgu iki yazımı yan yana gösterir (ADDCOLUMNS burada hesaplanmış sütunun yerini tutar):</p>
<pre class="dax">EVALUATE
TOPN(
    3,
    ADDCOLUMNS(
        Urunler,
        "Çıplak SUM", SUM(Satislar[Tutar]),
        "CALCULATE ile", CALCULATE(SUM(Satislar[Tutar]))
    ),
    [CALCULATE ile]
)</pre>
<p>"Çıplak SUM" her üründe 1.346.189,85 ₺ (tüm tablo) gösterir. "CALCULATE ile" sütununda ürün satırı filtreye döner, filtre ilişki üzerinden Satislar'a iner: 27" Monitör için 101.986 ₺.</p>
<ul>
<li><b>Döngüsel bağımlılık (circular dependency):</b> Özellikle anahtarı olmayan bir tabloda, CALCULATE kullanan ikinci bir hesaplanmış sütun eklediğinde bu hatayı alabilirsin. Bağlam geçişi tablonun bütün sütunlarını filtrelediği için her yeni sütun diğerine bağımlı görünür. Çözüm: CALCULATE içinde <code>ALLEXCEPT(Tablo, Tablo[Anahtar])</code> ile yalnızca anahtarın filtresini tutmak ya da hesabı ölçüye taşımak.</li>
<li><b>Olgu tablosunda CALCULATE'li sütun:</b> 1.620 satırda sorun yok; 50 milyon satırda yenileme süresini katlar. Bu tür hesaplar Power Query'de ya da kaynakta yapılmalı.</li>
<li><b>Donma:</b> Hesaplanmış sütun yalnızca yenilemede hesaplanır, dilimleyiciye tepki vermez. "Seçili yıldaki satış" gibi sorular ölçü ister.</li>
</ul>

<h2>Kontrol listesi</h2>
<ol>
<li>İteratör hangi tabloda dönüyor? Sorunun düzeyiyle aynı mı?</li>
<li>İçeride ölçü mü, çıplak toplama mı var? Çıplaksa satır bağlamı filtreye dönüşmüyor demektir.</li>
<li>Dolaşılan tablonun benzersiz bir anahtarı var mı? Yoksa sonuç şişebilir.</li>
<li>Ortalama alıyorsan boş satırların atlanması isteniyor mu?</li>
<li>İçeride ALLSELECTED kullanan bir ölçü çağrılıyor mu? Paydayı değişkene al.</li>
<li>Olgu tablosunda hesaplanmış sütun + CALCULATE var mı? Power Query'ye ya da ölçüye taşı.</li>
</ol>
`, ex: [
  { t: 'dax', name: 'Büyük Siparişli Müşteri',
    q: `<b>Büyük Siparişli Müşteri</b>: En az bir siparişinin net tutarı 3.000 TL ya da üzeri olan müşteri sayısı. Alışveriş yapan müşterilerde (VALUES(Satislar[MusteriNo])) dolaş; her müşteride, siparişleri (VALUES(Satislar[SiparisNo])) üzerinde en büyük [Net Satış] değerini al.`,
    sol: `COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), CALCULATE(MAXX(VALUES(Satislar[SiparisNo]), [Net Satış])) >= 3000))`,
    hint: `MAXX'i CALCULATE ile sar: bağlam geçişi müşteriyi filtreye çevirir ve VALUES(Satislar[SiparisNo]) yalnızca o müşterinin siparişlerini listeler. Sarmazsan sonuç yine doğru çıkar ama her müşteride 838 siparişin hepsi dolaşılır (150 × 838 bağlam geçişi). Toplamda 56 çıkmalı.` },
  { t: 'dax', name: 'En Büyük Müşteri Payı %',
    q: `<b>En Büyük Müşteri Payı %</b>: Kategori müdürü tek bir müşteriye bağımlılığı izlemek istiyor. Görünen bağlamda en çok alan müşterinin net satışının, toplam net satışa oranını döndür.`,
    sol: `DIVIDE(MAXX(VALUES(Satislar[MusteriNo]), [Net Satış]), [Net Satış])`,
    hint: `MAXX(VALUES(Satislar[MusteriNo]), [Net Satış]) her müşteride bağlam geçişiyle o müşterinin satışını hesaplar. Toplamda yaklaşık %3,0.` },
  { t: 'query',
    q: `Her müşteri segmenti (Musteriler[Segment]) için net satışı 10.000 TL'yi aşan müşteri sayısını döndür; sütunun adı "Değerli" olsun. Müşteri listesini, segment satırını filtreye çeviren bir CALCULATE içinde süz.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
ADDCOLUMNS(
    VALUES(Musteriler[Segment]),
    "Değerli", CALCULATE(COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), [Net Satış] > 10000)))
)`,
    hint: `ADDCOLUMNS(VALUES(Musteriler[Segment]), "Değerli", CALCULATE(COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), [Net Satış] > 10000)))). Premium 21 çıkmalı.` },
  { t: 'mc',
    q: `40 milyon satırlık bir Satislar tablosunda KDV ölçüsü <code>SUMX(Satislar, [Net Satış] * 0.18)</code> olarak yazılmış ve kart 9 saniyede açılıyor. En iyi düzeltme hangisi?`,
    o: [
      `SUMX'i AVERAGEX ile değiştirip sonucu satır sayısıyla çarpmak`,
      `<code>[Net Satış] * 0.18</code> yazmak; sabitle çarpım toplamaya dağılır`,
      `Hesabı Satislar'da CALCULATE kullanan bir hesaplanmış sütuna taşımak`,
      `SUMX'in tablosunu FILTER(Satislar, Satislar[Tutar] &gt; 0) ile daraltmak`
    ], a: 1,
    why: `Sabit bir oranla çarpım toplamaya dağılır: Σ(x·0,18) = 0,18·Σx. İterasyona ve 40 milyon bağlam geçişine hiç gerek yoktur. AVERAGEX aynı geçişleri yapar. CALCULATE'li hesaplanmış sütun yenilemeyi katlar ve dilimleyiciye tepki vermez. FILTER satırların çoğunu tutar, maliyeti düşürmez.` },
  { t: 'mc',
    q: `Excel'den gelen, satır numarası olmayan bir "kampanya satışları" tablosunda <code>SUMX(Kampanya, [Kampanya Tutarı])</code> kaynak sistemdeki toplamdan %4 fazla çıkıyor. En olası neden ve çözüm hangisi?`,
    o: [
      `Ölçü toplam satırında yanlış; ISINSCOPE ile toplamı gizlemek gerekir`,
      `Tabloda ilişki yönü tek taraflı; çift yönlü yapmak gerekir`,
      `Birebir aynı satırlar var; Power Query'de dizin sütunu eklenmeli`,
      `SUMX ondalıkları yuvarlıyor; ROUND ile sarmak gerekir`
    ], a: 2,
    why: `Bağlam geçişi satırın bütün sütunlarını filtreler. Birebir aynı iki satır birbirini de seçer ve tutar iki kez sayılır. Dizin sütunu her satırı benzersiz kılar. Toplamı gizlemek hatayı saklar; ilişki yönü ve yuvarlama bu farkı açıklamaz.` },
  { t: 'mc',
    q: `Kanal satırlı bir matriste <code>AVERAGEX(VALUES(Kategoriler[Kategori]), [Seçime Göre Pay %])</code> her satırda %14,29 yerine çok daha küçük değerler veriyor. Ne yaparsın?`,
    o: [
      `Ölçüyü SUMX ile yazıp sonucu kategori sayısına bölerim`,
      `Kanalın satışını VAR'a alır, iteratörde ona bölerim`,
      `ALLSELECTED() yerine ALL(Kategoriler) yazarım`,
      `Matristeki Kanal alanını dilimleyiciye taşırım`
    ], a: 1,
    why: `İçerideki ALLSELECTED() görselin Kanal satırını da kaldırır; payda kanalın değil genel toplamın satışıdır. Paydayı iteratörden önce değişkene almak her kanalın kendi toplamını kullandırır. SUMX/sayı aynı yanlış paydayı kullanır. ALL(Kategoriler) Kanal filtresini korur ama dilimleyicileri de yok sayar; Kanal'ı dilimleyiciye taşımak ise kanal kırılımını yok eder.` }
] });

/* ───────────────────────── 2. TABLO FONKSİYONLARI ───────────────────────── */
ext('tablo-fonk', { min: 22, html: `
<h2>SUMMARIZE: yalnızca var olan kombinasyonlar</h2>
<p>Kanal müdürü soruyor: "Hangi ürün hangi kanalda hiç satılmadı?" Bu soru, iki tablo fonksiyonu arasındaki temel farkı gösterir:</p>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Satır</th><th>Anlamı</th></tr>
<tr><td><code>VALUES(Urunler[Urun])</code></td><td>40</td><td>Katalogdaki tüm ürünler</td></tr>
<tr><td><code>SUMMARIZE(Satislar, Urunler[Urun])</code></td><td>38</td><td>Satislar'da en az bir satırı olan ürünler</td></tr>
<tr><td><code>SUMMARIZE(Satislar, Urunler[Urun], Satislar[Kanal])</code></td><td>113</td><td>Gerçekleşmiş ürün-kanal çiftleri</td></tr>
<tr><td><code>CROSSJOIN(VALUES(Urunler[Urun]), VALUES(Satislar[Kanal]))</code></td><td>120</td><td>Olası tüm çiftler</td></tr>
</table></div>
<p>SUMMARIZE olgu tablosunu tarar ve satırların gerçekten içerdiği kombinasyonları döndürür. Gruplama sütunlarını çoka-bir ilişkiler boyunca "bir" tarafından alabilir (Urunler[Urun]); ters yönde alamaz. CROSSJOIN ise tabloları birbiriyle çarpar ve veride hiç olmayan çiftleri de üretir. Aradaki 7 çift sorunun cevabıdır:</p>
<pre class="dax">EVALUATE
FILTER(
    CROSSJOIN(VALUES(Urunler[Urun]), VALUES(Satislar[Kanal])),
    ISBLANK([Net Satış])
)</pre>
<p>Sonuç: Robot Süpürge Web'de hiç satılmamış; Koşu Bandı ve Gurme Lokum Kutusu ise hiçbir kanalda. FILTER her çiftte [Net Satış]'ı çağırır; bağlam geçişi hem ürünü hem kanalı filtreye çevirir.</p>
<div class="note"><b>SUMMARIZE ham satırlara bakar</b>SUMMARIZE iptal edilmiş satırları da sayar. "Satılmış" demek istiyorsan ya CALCULATETABLE ile Durum filtresi ekle ya da yukarıdaki gibi ölçü üzerinden kontrol et.</div>

<h2>SUMMARIZECOLUMNS ve boş satırlar</h2>
<p>SUMMARIZECOLUMNS, ifadelerinin hepsi BLANK olan satırları sonuçtan atar. Görsellerin "boş satırı göstermeme" davranışı buradan gelir. Bu kural küçük bir değişiklikle sonucun boyutunu değiştirir:</p>
<div class="tbl-wrap"><table>
<tr><th>Sorgu (Urunler[Urun] × Tarih[Yil])</th><th>Satır</th><th>Neden?</th></tr>
<tr><td><code>"S", [Net Satış]</code></td><td>111</td><td>Satışı olmayan ürün-yıl çiftleri atılır</td></tr>
<tr><td><code>"S", [Net Satış] + 0</code></td><td>120</td><td>Hiçbir satır boş değil; 40 × 3 çiftin hepsi gelir</td></tr>
<tr><td><code>"S", [Net Satış], "K", [Kayıtlı Müşteri]</code></td><td>120</td><td>İkinci ölçü ürün filtresinden etkilenmez, hiç boş olmaz</td></tr>
</table></div>
<p>Küçük modelde 9 fazladan satır zararsızdır. Müşteri × ürün × gün kırılımında ise "+0" ya da hiç boş olmayan bir ölçü, milyonlarca satırlık bir sonuç üretir; görsel yavaşlar ya da veri sınırına takılır. Sıfırı göstermen gerekiyorsa bunu yalnızca gereken görselde, sınırlı bir eksende yap.</p>
<p>Gerçek Power BI'da, bir ifadeyi boşluk kontrolünden çıkarmak için <code>IGNORE</code> vardır: o ifade boş olmasa da satır, diğer ifadeler boşsa atılır. Bu uygulamanın motoru IGNORE'u desteklemez; söz dizimi aşağıda:</p>
<pre class="dax" data-notry>EVALUATE
SUMMARIZECOLUMNS(
    Urunler[Urun], Tarih[Yil],
    "S", [Net Satış],
    "K", IGNORE([Kayıtlı Müşteri])
)</pre>
<p>Ek bilgi: Eski kaynaklarda "SUMMARIZECOLUMNS'u ölçü içinde kullanma" uyarısını görürsün. Microsoft Learn'e göre Haziran 2024'ten bu yana SUMMARIZECOLUMNS her bağlam geçişinde çalışabiliyor ve ölçü içinde tam destekleniyor. Yine de sonuç sırası garanti edilmez; sıra gerekiyorsa sorguda ORDER BY kullan.</p>

<h2>GENERATE ve CROSSJOIN: kombinasyon üretmek</h2>
<p>Pazarlama her kanalın en iyi ayını görmek istiyor:</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    GENERATE(
        VALUES(Satislar[Kanal]),
        TOPN(1, CALCULATETABLE(VALUES(Tarih[YilAy])), [Net Satış])
    ),
    "Satış", [Net Satış]
)</pre>
<p>Sonuç: Web 2024-12 (44.653,15 ₺), Mobil 2024-06 (41.208,05 ₺), Mağaza 2024-12 (17.423,45 ₺). Mekanizma: GENERATE ilk tablonun her satırı için ikinci ifadeyi o satırın satır bağlamında hesaplar. TOPN içindeki [Net Satış] bağlam geçişiyle hem dış satırı (Kanal) hem iç satırı (YilAy) filtreye çevirir. CALCULATETABLE, ay listesini kanala göre süzer; o kanalda satış olmayan aylar listeye girmez.</p>
<ul>
<li>GENERATE, ikinci ifade boş tablo döndürürse o satırı atar (iç birleştirme gibi). Boş satırları tutmak için Power BI'da GENERATEALL vardır; bu uygulamada desteklenmez.</li>
<li>İki tablonun sütun adları çakışırsa hata alırsın; SELECTCOLUMNS ile yeniden adlandır.</li>
<li>CROSSJOIN maliyetini önceden hesapla: Musteriler × Urunler × Tarih = 150 × 40 × 1.096 = 6.576.000 satır. Bir ölçünün içinde bu boyutta tablo kurmak belleği ve süreyi patlatır.</li>
</ul>

<h2>Veri soyu nerede kaybolur?</h2>
<p>Soy bağını ilk bölümde gördün. Üretimde soru şu: soy hangi adımda düşer? Soysuz bir tablo CALCULATE'e filtre olarak verilince Power BI'da ya hata alırsın ya da tablo hiçbir model sütununu süzmez. İki durumda da beklediğin sonuç gelmez.</p>
<div class="tbl-wrap"><table>
<tr><th>Adım</th><th>Soy</th></tr>
<tr><td><code>VALUES(Tarih[Yil])</code>, <code>FILTER(VALUES(...), ...)</code>, <code>CALCULATETABLE(...)</code></td><td>Korunur</td></tr>
<tr><td><code>ADDCOLUMNS(..., "Yeni", ifade)</code> ile eklenen sütun</td><td>Yeni sütunun soyu yok</td></tr>
<tr><td><code>SELECTCOLUMNS(..., "Y", Tarih[Yil] - 1)</code> gibi bir ifade</td><td>Kaybolur</td></tr>
<tr><td><code>{ 2023, 2024 }</code>, <code>DATATABLE</code>, <code>GENERATESERIES</code></td><td>Hiç yok</td></tr>
</table></div>
<p>Örnek: "Bir önceki yıllar" listesini elle üretip satışı süzmek istiyorsun. Listeyi SELECTCOLUMNS ile kurduğun anda soy düşer. TREATAS soyu yeniden verir:</p>
<pre class="dax" data-notry>-- Soy yok: filtre beklendiği gibi çalışmaz
Geçen Yıl (Hatalı) =
CALCULATE([Net Satış], SELECTCOLUMNS(VALUES(Tarih[Yil]), "Y", Tarih[Yil] - 1))</pre>
<pre class="dax">Geçen Yıl (TREATAS) =
CALCULATE(
    [Net Satış],
    TREATAS(SELECTCOLUMNS(VALUES(Tarih[Yil]), "Y", Tarih[Yil] - 1), Tarih[Yil])
)</pre>
<p>2024 satırında 400.869,55 ₺ (2023'ün satışı) döner. Power BI'da SELECTCOLUMNS içindeki sade bir sütun başvurusu (<code>"Y", Tarih[Yil]</code>) soyu korur; ifade yazdığın anda korumaz. Bu uygulamanın motoru da aynı kuralı izler: sade başvuruda soy korunur, ifadede kopar. Emin olamadığında TREATAS ile soyu açıkça ver.</p>

<h2>Tablo değişkenleri: bir kez hesaplanır, sabit kalır</h2>
<pre class="dax">Sabit Liste =
VAR T = VALUES(Urunler[Urun])
RETURN CALCULATE(COUNTROWS(T), Kategoriler[Kategori] = "Kitap")</pre>
<p>Sonuç 7 değil 40'tır. VAR, tanımlandığı yerde ve o andaki filtre bağlamında bir kez hesaplanır. Sonradan gelen CALCULATE değişkenin içeriğini değiştiremez; yalnızca yeni ifadeleri etkiler. Kitap filtresinin listeye uygulanması için tablo ifadesi CALCULATE'in içinde yazılmalı: <code>CALCULATE(COUNTROWS(VALUES(Urunler[Urun])), Kategoriler[Kategori] = "Kitap")</code> 7 döndürür.</p>
<ul>
<li>Bu davranış performans için iyidir: aynı tabloyu üç kez kullanacaksan bir kez hesaplanır.</li>
<li>Değişken tablonun eklenen sütunlarına <code>[S]</code> diye başvurursun; <code>T[S]</code> yazılamaz. Modelden gelen sütunlar özgün adlarıyla (Urunler[Urun]) kullanılır.</li>
<li>Değişken tablo soyunu korur; yani CALCULATE'e filtre olarak verilebilir.</li>
</ul>

<h2>Küme işlemlerinin kuralları</h2>
<p>2023 ve 2024'te alışveriş yapan müşteri kümeleri (iptaller hariç) 77 ve 123 kişidir:</p>
<div class="tbl-wrap"><table>
<tr><th>İşlem</th><th>Sonuç</th><th>İş dili</th></tr>
<tr><td><code>INTERSECT(M2023, M2024)</code></td><td>64</td><td>İki yıl da alan</td></tr>
<tr><td><code>EXCEPT(M2023, M2024)</code></td><td>13</td><td>2024'te gelmeyen</td></tr>
<tr><td><code>EXCEPT(M2024, M2023)</code></td><td>59</td><td>2024'te 2023'te olmayan</td></tr>
<tr><td><code>UNION(M2023, M2024)</code></td><td>200</td><td>Tekrarlar kalır</td></tr>
<tr><td><code>DISTINCT(UNION(...))</code></td><td>136</td><td>Herhangi bir yılda alan</td></tr>
</table></div>
<ul>
<li>EXCEPT simetrik değildir; sıra yanlışsa "kayıp" yerine "yeni" sayarsın.</li>
<li>Sütunlar adla değil konumla eşleşir; sütun sayısı aynı olmalıdır. Sonucun sütun adları ve soyu ilk tablodan gelir.</li>
<li>Sonuç kümesi filtre olarak kullanılabilir: <code>CALCULATE([Net Satış], EXCEPT(M2024, M2023), Tarih[Yil] = 2024)</code> bu 59 kişinin 2024 satışını (315.901,35 ₺) verir.</li>
</ul>
<p>Bu kümelerle tam bir müşteri köprüsü kurmayı İleri iş kalıpları dersinde, dönem tanımlarını Müşteri analitiği dersinde bulursun.</p>

<h2>Kontrol listesi</h2>
<ol>
<li>"Var olan" mı "olası" kombinasyon mu istiyorsun? SUMMARIZE ile CROSSJOIN'i buna göre seç.</li>
<li>Sonuçta beklenmedik kadar çok satır var mı? Hiç boş olmayan bir ölçü aranıyor.</li>
<li>Filtre olarak kullanacağın tablonun soyu hangi adımda düşüyor? Gerekirse TREATAS.</li>
<li>Tablo değişkeni, sonradan değişmesini beklediğin bir filtreden önce mi tanımlandı?</li>
<li>EXCEPT'in sırası iş sorusuyla aynı mı?</li>
</ol>
`, ex: [
  { t: 'dax', name: 'Satılmayan Ürün Sayısı',
    q: `<b>Satılmayan Ürün Sayısı</b>: Görünen bağlamdaki katalog ürünlerinden (VALUES(Urunler[UrunNo])) iptal edilmemiş hiçbir satışı olmayanların sayısı. Satılanların kümesini CALCULATETABLE ile kur ve EXCEPT ile çıkar.`,
    sol: `COUNTROWS(EXCEPT(VALUES(Urunler[UrunNo]), CALCULATETABLE(VALUES(Satislar[UrunNo]), Satislar[Durum] <> "İptal")))`,
    hint: `EXCEPT(VALUES(Urunler[UrunNo]), CALCULATETABLE(VALUES(Satislar[UrunNo]), Satislar[Durum] <> "İptal")). Toplamda 2, 2022 satırında 5 çıkmalı.` },
  { t: 'dax', name: 'Web ve Mağaza Müşterisi',
    q: `<b>Web ve Mağaza Müşterisi</b>: Hem Web hem Mağaza kanalında iptal edilmemiş alışveriş yapan müşteri sayısı. İki müşteri kümesini kur ve kesiştir.`,
    sol: `COUNTROWS(INTERSECT(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Kanal] = "Web", Satislar[Durum] <> "İptal"), CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Kanal] = "Mağaza", Satislar[Durum] <> "İptal")))`,
    hint: `Her küme için CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Kanal] = "...", Satislar[Durum] <> "İptal"). 2024'te 36 çıkmalı.` },
  { t: 'query',
    q: `Her kanal için net satışı en yüksek ayı (Tarih[YilAy]) ve o ayın satışını ("Satış" sütunu) döndür. GENERATE ile her kanalda TOPN(1, …) çalıştır; ay listesini o kanala göre CALCULATETABLE ile al.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
ADDCOLUMNS(
    GENERATE(VALUES(Satislar[Kanal]), TOPN(1, CALCULATETABLE(VALUES(Tarih[YilAy])), [Net Satış])),
    "Satış", [Net Satış]
)`,
    hint: `ADDCOLUMNS(GENERATE(VALUES(Satislar[Kanal]), TOPN(1, CALCULATETABLE(VALUES(Tarih[YilAy])), [Net Satış])), "Satış", [Net Satış]). Web için 2024-12 gelmeli.` },
  { t: 'query',
    q: `Hiç net satışı olmayan ürün-kanal çiftlerini listele: Urunler[Urun] ile Satislar[Kanal] değerlerinin tüm kombinasyonlarını üret ve [Net Satış]'ı boş olanları bırak.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
FILTER(CROSSJOIN(VALUES(Urunler[Urun]), VALUES(Satislar[Kanal])), ISBLANK([Net Satış]))`,
    hint: `FILTER(CROSSJOIN(VALUES(Urunler[Urun]), VALUES(Satislar[Kanal])), ISBLANK([Net Satış])). 7 satır gelmeli.` },
  { t: 'mc',
    q: `Bir tablo görselinde müşteri × ürün × gün kırılımı var. Analist "satışı olmayanlar da 0 görünsün" diye ölçüyü <code>[Net Satış] + 0</code> yaptı; görsel artık açılmıyor. En doğru yaklaşım hangisi?`,
    o: [
      `Ölçüyü geri alıp sıfırı küçük eksenlerde göstermek`,
      `<code>+ 0</code> yerine <code>COALESCE([Net Satış], 0)</code> yazmak`,
      `Görseli matrise çevirip satır alt toplamlarını kapatmak`,
      `Ölçüyü IF(ISBLANK([Net Satış]), 0, [Net Satış]) ile sarmak`
    ], a: 0,
    why: `Boş olmayan bir ölçü, SUMMARIZECOLUMNS'un boş satırları atma kuralını devre dışı bırakır; her kombinasyon (milyonlarca satır) sonuca girer. COALESCE ve IF de aynı şekilde hiç boş olmayan bir değer üretir, sorun aynıdır. Alt toplamları kapatmak satır sayısını düşürmez. Sıfır gösterimi yalnızca kombinasyon sayısı küçük olan yerlerde yapılmalı.` },
  { t: 'mc',
    q: `Bir ölçü <code>VAR Liste = VALUES(Urunler[Urun])</code> ile başlıyor, sonra <code>CALCULATE(COUNTROWS(Liste), Kategoriler[Kategori] = "Kitap")</code> döndürüyor. Kitap'ta 7 ürün olmasına rağmen 40 çıkıyor. Neden?`,
    o: [
      `CALCULATE içindeki koşul KEEPFILTERS olmadan uygulanmaz`,
      `Değişken bir kez hesaplandı, sonra hiç değişmedi`,
      `VALUES boş satırı da saydığı için liste büyümüş`,
      `Kategoriler ile Urunler arasındaki ilişki pasif durumda`
    ], a: 1,
    why: `VAR tanımlandığı bağlamda bir kez hesaplanır; sonraki CALCULATE yalnızca yeni yazılan ifadeleri etkiler, değişkeni değiştirmez. KEEPFILTERS'ın burada etkisi yok. Boş satır en fazla 1 ekler, 33 değil. İlişki pasif olsaydı CALCULATE içinde VALUES yazıldığında da 40 çıkardı; oysa o yazım 7 verir.` },
  { t: 'mc',
    q: `"Önceki yıllar" listesini <code>SELECTCOLUMNS(VALUES(Tarih[Yil]), "Y", Tarih[Yil] - 1)</code> ile kurup CALCULATE'e filtre olarak verdin, ama sonuç değişmiyor. Ne yaparsın?`,
    o: [
      `Listeyi ADDCOLUMNS ile yeniden kurarım`,
      `Listeyi TREATAS(..., Tarih[Yil]) ile sararım`,
      `Listeyi bir VAR'a alıp sonra filtrede kullanırım`,
      `Listedeki değerleri VALUE ile sayıya çeviririm`
    ], a: 1,
    why: `İfadeyle üretilen sütunun soyu yoktur; motor bu değerlerin hangi model sütununu süzeceğini bilemez. TREATAS soyu Tarih[Yil] olarak verir. ADDCOLUMNS'un yeni sütununun da soyu olmaz. VAR'a almak soyu geri getirmez. Değerler zaten sayıdır; sorun türde değil soyda.` }
] });

/* ───────────────────────── 3. PENCERE FONKSİYONLARI ───────────────────────── */
ext('pencere', { min: 22, html: `
<h2>İlişki parametresi: ALL mı, ALLSELECTED mı?</h2>
<p>Finans raporunda dilimleyicide 2024 seçili. Aylık tabloda "önceki ay" sütunu Ocak 2024'te boş; finans müdürü Aralık 2023'ü görmek istiyor. Üç yazımı karşılaştıralım:</p>
<div class="tbl-wrap"><table>
<tr><th>Yazım</th><th>Ocak 2024</th><th>Neden?</th></tr>
<tr><td><code>OFFSET(-1, ALLSELECTED(Tarih[YilAy]), ...)</code></td><td>boş</td><td>İlişkide yalnızca 2024 ayları var; Ocak'ın öncesi yok</td></tr>
<tr><td><code>OFFSET(-1, ALL(Tarih[YilAy]), ...)</code></td><td>boş</td><td>OFFSET 2023-12'yi bulur, ama dilimleyicinin Yil = 2024 filtresi CALCULATE'te kalır; kesişim boş</td></tr>
<tr><td><code>ALL(Tarih[YilAy])</code> + <code>REMOVEFILTERS(Tarih[Yil])</code></td><td>43.560,05</td><td>Satır bulunur ve yıl filtresi de kaldırılır</td></tr>
</table></div>
<pre class="dax">Önceki Ay (Dilimleyiciden Bağımsız) =
CALCULATE(
    [Net Satış],
    OFFSET(-1, ALL(Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC)),
    REMOVEFILTERS(Tarih[Yil])
)</pre>
<p>Mekanizma: OFFSET bir tablo satırı döndürür (YilAy = "2023-12"). CALCULATE bu satırı yalnızca ilişkinin sütunlarına filtre olarak koyar ve YilAy'daki eski filtrenin yerine geçer. Aynı tablonun başka sütunlarındaki filtreler (Yil, Ceyrek) olduğu gibi kalır. İkinci satırdaki hata pencere fonksiyonuna özgü değildir; filtre bağlamının sıradan kuralıdır.</p>
<p>Hangisi doğru? "Görseldeki bir önceki satır" isteniyorsa ALLSELECTED; "takvimdeki bir önceki ay" isteniyorsa zaman zekâsı (PREVIOUSMONTH) daha sadedir. Üçüncü yazım, takvim tablosu olmayan sıralı eksenlerde (ör. sprint numarası) işe yarar.</p>

<h2>PARTITIONBY ve ilişkideki sütunlar</h2>
<p>Satış ekibi "yıl içinde bir önceki ay" istiyor: Ocak, geçen yılın Aralık'ına bağlanmamalı. Bölüm (partition) sütunu ilişkinin içinde ya da ilişkiyle bağlı bir tabloda olmalıdır. En açık yol, Yil'i ilişkiye eklemektir:</p>
<pre class="dax">Yıl İçi Önceki Ay =
CALCULATE(
    [Net Satış],
    OFFSET(
        -1,
        ALLSELECTED(Tarih[Yil], Tarih[YilAy]),
        ORDERBY(Tarih[YilAy], ASC),
        PARTITIONBY(Tarih[Yil])
    )
)</pre>
<p>Ocak 2023 satırı artık boştur; bölümsüz sürüm aynı hücrede Aralık 2022'yi (40.257,85 ₺) gösterir. Microsoft Learn'deki kurallar üretimde önemlidir:</p>
<ul>
<li>İlişkideki her sütun için dış bağlamda bir değer olmalı. Tek değer varsa o kullanılır; birden fazla dış sütun eşleşirse hata alırsın.</li>
<li>ORDERBY ve PARTITIONBY sütunları satırları benzersiz tanımlamıyorsa fonksiyon gereken ek sütunları kendisi ekler; bulamazsa hata verir.</li>
<li>ORDERBY'da ölçü kullanırsan eşit değerler sıralamayı belirsizleştirir. "Yılın en iyi ayı" gibi sorularda ikinci bir sıralama sütunu (<code>ORDERBY([Net Satış], DESC, Tarih[YilAy], ASC)</code>) eşitliği bozar.</li>
</ul>

<h2>Boş aylar: pencere satır sayar, takvim saymaz</h2>
<p>WINDOW(-2, REL, 0, REL, ...) "son üç satır" demektir; bu satırlarda veri olup olmadığına bakmaz. Veri 22 Haziran 2022'de başlıyor; ilk aylarda üç farklı cevap çıkar:</p>
<div class="tbl-wrap"><table>
<tr><th>Ay</th><th>Net Satış</th><th>AVERAGEX(pencere)</th><th>Toplam / 3</th><th>Tam pencere</th></tr>
<tr><td>2022-06</td><td>595,00</td><td>595,00</td><td>198,33</td><td>boş</td></tr>
<tr><td>2022-07</td><td>11.916,20</td><td>6.255,60</td><td>4.170,40</td><td>boş</td></tr>
<tr><td>2022-08</td><td>6.766,35</td><td>6.425,85</td><td>6.425,85</td><td>6.425,85</td></tr>
</table></div>
<p>AVERAGEX boş ayları atlar ve tek aylık "üç ay ortalaması" üretir. Üçe bölmek eksik ayları sıfır sayar. Üçüncü yol, pencere dolu değilse hiç göstermemektir. Grafikte ilk ayların yapay biçimde yüksek ya da düşük görünmesini istemiyorsan üçüncüsü en dürüst seçenektir (alıştırmada yazacaksın). Not: Haziran 2022 yalnızca 9 günlük veri içerir; tam olmayan dönemler her pencere hesabını bozar.</p>

<h2>Toplam satırında ne olur?</h2>
<p>Toplam satırında YilAy'ın dış bağlamda değeri yoktur. Belgelenen kurala göre fonksiyon, dış değeri olmayan sütunların mevcut her değeri için ayrı ayrı çalışır ve dönen satırların birleşimini (union) verir. Power BI'da bu şu sonuçları doğurur:</p>
<div class="tbl-wrap"><table>
<tr><th>Ölçü</th><th>Toplam satırında</th><th>Anlamlı mı?</th></tr>
<tr><td>Önceki Ay (OFFSET -1)</td><td>Son ay hariç tüm aylar: 1.250.772,45 − 94.000,95 = 1.156.771,50</td><td>Hayır</td></tr>
<tr><td>Kümülatif (WINDOW 1 ABS … 0 REL)</td><td>Tüm aylar: 1.250.772,45</td><td>Tesadüfen evet</td></tr>
<tr><td>3 ay ortalaması (AVERAGEX + WINDOW)</td><td>Verisi olan 31 ayın ortalaması: 40.347,50</td><td>Hayır</td></tr>
</table></div>
<p>Bu uygulamanın motoru bu durumda toplamı boş gösterir; Power BI'da yukarıdaki sayıları görürsün. Kullanıcı toplam satırını okur ve yanlış yorumlar. Üretimde toplamı açıkça yönet:</p>
<pre class="dax">Önceki Ay (Güvenli) =
IF(
    ISINSCOPE(Tarih[YilAy]),
    CALCULATE([Net Satış], OFFSET(-1, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC)))
)</pre>

<h2>Görsel hesaplama mı, model ölçüsü mü?</h2>
<p>Görsel hesaplamalar (visual calculations) aynı işi çoğu zaman tek satırda yapar: <code>PREVIOUS([Net Satış])</code>. Seçimi şu ölçütler belirler (Microsoft Learn'deki sınırlamalardan):</p>
<div class="tbl-wrap"><table>
<tr><th>Ölçüt</th><th>Görsel hesaplama</th><th>Model ölçüsü</th></tr>
<tr><td>Yeniden kullanım</td><td>Yalnızca o görselde; görseller arasında kopyalanamaz</td><td>Tüm raporlar ve Excel'de analiz</td></tr>
<tr><td>Filtreleme, sıralama</td><td>Görsel hesaplamaya göre filtreleme ve sıralama desteklenmez</td><td>Tam destek</td></tr>
<tr><td>Dışa aktarma, paylaşım</td><td>Veri dışa aktarmada sonuçlar yer almaz; panoya sabitlenemez, Web'de yayımla kullanılamaz</td><td>Sorun yok</td></tr>
<tr><td>Dinamik biçim dizesi, RELATED, USERELATIONSHIP</td><td>Yok</td><td>Var</td></tr>
<tr><td>Yazım kolaylığı</td><td>RUNNINGSUM, PREVIOUS, MOVINGAVERAGE; eksen ve sıfırlama parametreleri</td><td>OFFSET/WINDOW ile ilişki, sıralama, bölüm elle yazılır</td></tr>
<tr><td>Maliyet</td><td>Görselin zaten toplanmış ızgarası üzerinde çalışır</td><td>Her hücrede modelden hesaplanır</td></tr>
</table></div>
<p>Karar: ekipçe kullanılacak bir iş tanımı (resmî "önceki ay" ya da "kümülatif" rakamı) model ölçüsü olmalı. Tek bir görselde keşif amaçlı, dışa aktarılmayacak bir hesap için görsel hesaplama daha hızlı ve daha az hatalıdır.</p>

<h2>Performans notları</h2>
<ul>
<li>İlişkiyi boyut sütunlarından kur (<code>ALLSELECTED(Tarih[YilAy])</code>: 36 satır). Olgu tablosundan türetilmiş bir ilişki (<code>SUMMARIZE(Satislar, ...)</code>) hem yavaştır hem de satışı olmayan ayları atlar.</li>
<li>ORDERBY'da ölçü kullanmak, her hücrede ilişkinin her satırı için ölçüyü hesaplatır: 36 aylık eksende 36 × 36 = 1.296 ölçü değerlendirmesi. Günlük eksende 1.096 × 1.096 ≈ 1,2 milyon olur.</li>
<li>Gün düzeyinde kümülatif istiyorsan ve tarih tablon işaretliyse, <code>DATESBETWEEN</code> ya da tarih filtresiyle yazılan klasik kalıp çoğu zaman daha hızlıdır. İki yazımı Performans Analizi ile ölç, sonra karar ver.</li>
</ul>

<h2>Kontrol listesi</h2>
<ol>
<li>"Görseldeki önceki satır" mı, "takvimdeki önceki dönem" mi? Aracı buna göre seç.</li>
<li>İlişki dilimleyiciye uymalı mı (ALLSELECTED), yoksa onu aşmalı mı (ALL + REMOVEFILTERS)?</li>
<li>Bölüm sütunu ilişkinin içinde mi?</li>
<li>ORDERBY eşitlikleri bozacak ikinci bir sütun içeriyor mu?</li>
<li>Pencere boş ya da eksik dönemlerde ne göstermeli?</li>
<li>Toplam satırında ISINSCOPE ile ne göstereceğini açıkça belirledin mi?</li>
</ol>
`, ex: [
  { t: 'dax', name: 'Yıl İçi Önceki Ay (Bölümlü)',
    q: `<b>Yıl İçi Önceki Ay (Bölümlü)</b>: Aylık tabloda bir önceki ayın net satışı; ama her yıl kendi içinde başlasın (Ocak satırı boş kalsın). İlişkiye Tarih[Yil] ve Tarih[YilAy] sütunlarını koy, YilAy'a göre sırala, Yil'e göre bölümle.`,
    sol: `CALCULATE([Net Satış], OFFSET(-1, ALLSELECTED(Tarih[Yil], Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC), PARTITIONBY(Tarih[Yil])))`,
    hint: `OFFSET(-1, ALLSELECTED(Tarih[Yil], Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC), PARTITIONBY(Tarih[Yil])) ifadesini CALCULATE'e filtre olarak ver.`,
    grid: [{ t: 'Tarih', c: 'YilAy' }], noTotal: true },
  { t: 'dax', name: 'Yılın En İyi Ayı Satışı',
    q: `<b>Yılın En İyi Ayı Satışı</b>: Her ay satırında, o ayın yılı içindeki en yüksek aylık net satış. INDEX(1, …) ile ilişkiyi net satışa göre büyükten küçüğe sırala ve yıla göre bölümle.`,
    sol: `CALCULATE([Net Satış], INDEX(1, ALLSELECTED(Tarih[Yil], Tarih[YilAy]), ORDERBY([Net Satış], DESC), PARTITIONBY(Tarih[Yil])))`,
    hint: `INDEX(1, ALLSELECTED(Tarih[Yil], Tarih[YilAy]), ORDERBY([Net Satış], DESC), PARTITIONBY(Tarih[Yil])). 2024 aylarında 94.000,95 görünmeli.`,
    grid: [{ t: 'Tarih', c: 'YilAy' }, { t: 'Tarih', c: 'Yil' }], noTotal: true },
  { t: 'dax', name: 'Tam Pencere 3 Ay Ort.',
    q: `<b>Tam Pencere 3 Ay Ort.</b>: Görseldeki aylar arasında geçerli ay ve önceki iki ayın net satış ortalaması; ama yalnızca pencerenin üç ayında da satış varsa. Aksi hâlde boş döndür.`,
    sol: `VAR Pencere = WINDOW(-2, REL, 0, REL, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC))
VAR Dolu = COUNTROWS(FILTER(Pencere, NOT ISBLANK([Net Satış])))
RETURN IF(Dolu = 3, AVERAGEX(Pencere, [Net Satış]))`,
    hint: `Pencereyi VAR'a al; FILTER(Pencere, NOT ISBLANK([Net Satış])) ile dolu ayları say. İlk değer 2022-08'de 6.425,85 olmalı.`,
    grid: [{ t: 'Tarih', c: 'YilAy' }], noTotal: true },
  { t: 'query',
    q: `2024'ün her ayı için net satışı ("Satış") ve bir önceki takvim ayına göre farkı ("Değişim") döndür. Ocak 2024 de Aralık 2023 ile karşılaştırılsın: ay listesini CALCULATETABLE ile 2024'e süz, önceki ayı OFFSET(-1, ALL(Tarih[YilAy]), …) ile bul.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
ADDCOLUMNS(
    CALCULATETABLE(VALUES(Tarih[YilAy]), Tarih[Yil] = 2024),
    "Satış", [Net Satış],
    "Değişim", [Net Satış] - CALCULATE([Net Satış], OFFSET(-1, ALL(Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC)))
)`,
    hint: `CALCULATETABLE yalnızca ay listesini süzer; ADDCOLUMNS içindeki ifadeler 2024 filtresini taşımaz. Ocak 2024'te Değişim 3.872,80 çıkmalı.` },
  { t: 'mc',
    q: `Dilimleyicide 2024 seçili. "Önceki ay" ölçüsünü <code>OFFSET(-1, ALL(Tarih[YilAy]), ...)</code> ile yazdın ama Ocak 2024 hâlâ boş. Neden?`,
    o: [
      `ALL, ORDERBY ile birlikte kullanılınca sıralamayı bozar`,
      `OFFSET'in ilişkisi ALLSELECTED olmadan dilimleyiciyi görmez`,
      `Yil = 2024 filtresi CALCULATE'te kaldığı için kesişim boş`,
      `YilAy metin olduğu için 2023-12 ile 2024-01 komşu sayılmaz`
    ], a: 2,
    why: `OFFSET doğru satırı (2023-12) bulur ve CALCULATE onu YilAy'a filtre olarak koyar. Ama aynı tablodaki Yil sütununda dilimleyicinin 2024 filtresi durur; 2023-12 ile 2024 kesişimi boştur. REMOVEFILTERS(Tarih[Yil]) eklemek çözer. ALL sıralamayı bozmaz; YYYY-AA metni doğru sıralanır.` },
  { t: 'mc',
    q: `Matristeki "Önceki Ay (OFFSET)" sütununun toplam satırında, Power BI genel toplamdan biraz küçük bir sayı gösteriyor ve yönetici bunu soruyor. Ne yaparsın?`,
    o: [
      `Ölçüyü ISINSCOPE ile sarıp toplamı boş bırakırım`,
      `ORDERBY'a DESC ekleyip sıralamayı ters çeviririm`,
      `İlişkiyi ALLSELECTED yerine VALUES(Tarih[YilAy]) yaparım`,
      `Toplamı matrisin biçim ayarlarından yüzde olarak gösteririm`
    ], a: 0,
    why: `Toplamda YilAy'ın dış değeri yoktur; OFFSET her ay için çalışır ve kaymış satırların birleşimini döndürür: son ay hariç tüm aylar. Bu sayı anlamsızdır, ISINSCOPE ile toplamı açıkça yönetmek gerekir. DESC başka bir yanlış sayı üretir. VALUES ilişkisi her hücrede tek ay içerir, önceki ay hiç bulunmaz. Biçim değişikliği sayıyı düzeltmez.` },
  { t: 'mc',
    q: `Analist tek bir matriste "önceki aya göre değişim" için görsel hesaplama yazdı. Finans aynı rakamı aylık Excel dışa aktarımında ve üç ayrı raporda kullanmak istiyor. Ne önerirsin?`,
    o: [
      `Görsel hesaplamayı her rapora kopyalayıp yapıştırmayı`,
      `Hesabı model ölçüsü olarak yazıp tüm raporlarda kullanmayı`,
      `Görsel hesaplamayı gizleyip yalnızca dışa aktarmada açmayı`,
      `Matrisi panoya sabitleyip finansa panoyu paylaşmayı`
    ], a: 1,
    why: `Görsel hesaplamalar modelde değil görselde yaşar; görseller arasında kopyalanamaz, veri dışa aktarmalarında sonuçları yer almaz ve panoya sabitlenemez. Birden çok raporda ve dışa aktarmada kullanılacak bir iş tanımı model ölçüsü olmalıdır.` }
] });

/* ───────────────────────── 4. DAX SORGU ───────────────────────── */
ext('dax-sorgu', { min: 22, html: `
<h2>DAX sorgu görünümü bir test tezgâhıdır</h2>
<p>Finans, "Net Satış" tanımından iadelerin de düşülmesini istiyor. Modeldeki ölçüyü hemen değiştirirsen ona bağlı onlarca ölçü ve rapor aynı anda değişir. Önce sorgu içinde dene:</p>
<pre class="dax">DEFINE
    MEASURE Satislar[Net Satış (İadesiz)] =
        CALCULATE([Toplam Satış], NOT Satislar[Durum] IN {"İptal", "İade"})
EVALUATE
SUMMARIZECOLUMNS(
    Tarih[Yil],
    "Eski", [Net Satış],
    "Yeni", [Net Satış (İadesiz)],
    "Fark", [Net Satış] - [Net Satış (İadesiz)]
)
ORDER BY Tarih[Yil]</pre>
<p>Fark 2022'de 11.621,15 ₺, 2023'te 26.035,75 ₺, 2024'te 43.178,45 ₺: bu, iade tutarlarıdır. Finansa "bu değişiklik 2024 net satışını 43 bin ₺ düşürür" diyebilirsin. Power BI Desktop'taki iş akışı (Microsoft Learn'e göre):</p>
<ol>
<li>Veri bölmesinde ölçüye sağ tık → <b>Hızlı sorgular (Quick queries)</b> → <b>Değerlendir (Evaluate)</b>, <b>Tanımla ve değerlendir (Define and evaluate)</b> ya da <b>Başvurularla tanımla ve değerlendir (Define with references and evaluate)</b>. Sonuncusu, ölçünün dayandığı ölçüleri de DEFINE bloğuna getirir.</li>
<li>Tanımı düzenle, çalıştır, sonuçları eski tanımla karşılaştır.</li>
<li>Ölçünün üstündeki CodeLens bağlantısı <b>Modeli güncelle: Ölçünün üzerine yaz (Update model: Overwrite measure)</b> ya da şeritteki <b>Modeli değişikliklerle güncelle (Update model with changes)</b> ile modele yaz.</li>
</ol>
<ul>
<li>Sorgudaki MEASURE, modelde aynı adlı bir ölçü varsa onu yalnızca o sorgu boyunca geçersiz kılar; model değişmez.</li>
<li>Ölçünün üstüne <code>///</code> ile yazdığın açıklama, modele eklenince ölçünün açıklaması olur. Belgeleme işini burada yapmış olursun.</li>
<li>Sorgu sekmeleri Desktop dosyasıyla kaydedilir. Power BI proje (PBIP) biçiminde her sekme, anlamsal model klasöründeki DAXQueries klasörüne .dax dosyası olarak yazılır; yani test sorguların Git'e girer.</li>
<li>Canlı bağlantıda (live connect) model ölçüleri görüntülenemez ve "Modeli güncelle" seçenekleri yoktur.</li>
</ul>

<h2>Ölçü doğrulama sorguları</h2>
<p>Her yeni ya da değiştirilmiş ölçü için birkaç sabit test yaz. Testin cevabı tek bir satır olsun; sonuç "GEÇTİ / KALDI" diye okunsun:</p>
<pre class="dax">EVALUATE
VAR Beklenen = 1250772.45
RETURN
    ROW(
        "Net Satış", [Net Satış],
        "Durum", IF(ABS([Net Satış] - Beklenen) &lt; 0.01, "GEÇTİ", "KALDI")
    )</pre>
<div class="tbl-wrap"><table>
<tr><th>Test</th><th>Sorgu fikri</th><th>Bu modelde</th></tr>
<tr><td>Toplam tutarlılığı</td><td><code>[Net Satış]</code> ile <code>SUMX(VALUES(Kategoriler[Kategori]), [Net Satış])</code> eşit mi?</td><td>İkisi de 1.250.772,45</td></tr>
<tr><td>Paylar toplamı</td><td><code>SUMX(VALUES(Kategoriler[Kategori]), [Kategori Payı %])</code> = 1 mi?</td><td>1</td></tr>
<tr><td>Zaman zekâsı</td><td>31 Aralık 2024'teki [Satış YTD] = 2024 yılının satışı mı?</td><td>İkisi de 747.065,70</td></tr>
<tr><td>Hedef</td><td>Kategorilere dağıtılmış hedef toplamı = genel hedef mi?</td><td>1.299.300</td></tr>
<tr><td>Kaynakla mutabakat</td><td>Kaynak sistemdeki (SQL, ERP) toplamla aynı mı?</td><td>Kaynak sorgusuyla karşılaştır</td></tr>
</table></div>
<p>Kayan nokta tuzağı: <code>[Net Satış] - SUMX(...)</code> sıfır değil, −0,000000000466 çıkar. Testleri doğrudan eşitlikle değil, küçük bir toleransla (<code>ABS(fark) &lt; 0.01</code>) ya da ROUND ile yaz; yoksa doğru ölçü "KALDI" der.</p>

<h2>SUMMARIZECOLUMNS + TREATAS: görseli sorguda kurmak</h2>
<p>Bir görselin rakamı sorgulanıyor: "2024'te Web ve Mobil'de kategori satışları". Performans Analizi'nden görselin sorgusunu kopyaladığında hep aynı şekli görürsün: gruplama sütunları, dilimleyicileri temsil eden filtre tabloları ve ölçüler.</p>
<pre class="dax">DEFINE
    MEASURE Satislar[Dijital Marj] = DIVIDE([Brüt Kâr], [Net Satış])
EVALUATE
SUMMARIZECOLUMNS(
    Kategoriler[Kategori],
    TREATAS({2024}, Tarih[Yil]),
    TREATAS({"Web", "Mobil"}, Satislar[Kanal]),
    "Satış", [Net Satış],
    "Marj", [Dijital Marj]
)
ORDER BY [Satış] DESC</pre>
<p>Elektronik 168.910,60 ₺ ile başta, Hediye 8.700 ₺ ile sonda. Filtre tabloları dilimleyici gibi davranır; değerleri, gruplama satırları oluşturulmadan önce uygulanır. Üç kural:</p>
<ul>
<li>SUMMARIZECOLUMNS sıra garantisi vermez; testlerde her zaman ORDER BY yaz.</li>
<li>Modeldeki "Sütuna göre sırala" (Sort by column) ayarı sorgu sonucuna uygulanmaz. Ay adlarını doğru sıralamak için AyNo'yu da sorguya alıp ona göre sırala.</li>
<li>Sonuç ızgarasındaki sıralama ve filtre yalnızca dönen satırlara uygulanır. Sorgu başına sınır 1.000.000 değerdir (20 sütunda en fazla 50.000 satır); büyük sonuçları doğrularken filtreyi sorgunun içine yaz.</li>
</ul>

<h2>ORDER BY, START AT ve DEFINE VAR</h2>
<p>START AT, ORDER BY'ın içinde yer alır ve sonucun hangi değerden başlayacağını belirler. Değerler sabit olmalı; ORDER BY sütun sayısından fazla değer verilemez. Büyük bir listeyi sayfa sayfa dışa aktarırken işe yarar. Bu uygulamanın motoru START AT'i desteklemez:</p>
<pre class="dax" data-notry>EVALUATE
SUMMARIZECOLUMNS(Urunler[Urun], "Satış", [Net Satış])
ORDER BY Urunler[Urun] ASC
START AT "M"</pre>
<p>İkinci bir tuzak: ORDER BY, TOPN'in hangi satırları seçeceğini belirlemez; yalnızca seçilenleri sıralar. "İlk 10" sorusunun sırası TOPN'in kendi sıralama bağımsız değişkenindedir.</p>
<p>DEFINE bloğunda VAR ile sorgu genelinde geçerli bir eşik tanımlayabilirsin. Belgeler DEFINE TABLE ve DEFINE COLUMN için "iç kullanım içindir, önerilmez" diyor; sorgu içi tablolar için VAR kullan:</p>
<pre class="dax">DEFINE
    VAR Esik = 0.3
EVALUATE
FILTER(SUMMARIZECOLUMNS(Urunler[Urun], "Marj", [Kâr Marjı %]), [Marj] &lt; Esik)</pre>
<p>Marjı %30'un altında kalan 9 ürün gelir. Eşiği değiştirip yeniden çalıştırmak tek bir sayıyı düzenlemek kadar kolaydır.</p>

<h2>Sorgu ile veri kalitesi kontrolü</h2>
<p>Yeni bir veri kaynağı bağlandığında, rapor yazmadan önce tek bir "sağlık" sorgusu çalıştır. Bu modelde sonuçlar şöyle:</p>
<div class="tbl-wrap"><table>
<tr><th>Kontrol</th><th>İfade fikri</th><th>Sonuç</th><th>Yorum</th></tr>
<tr><td>Anahtar benzersiz mi?</td><td><code>COUNTROWS(Satislar) - DISTINCTCOUNT(Satislar[SatirNo])</code></td><td>0</td><td>Bağlam geçişi güvenli</td></tr>
<tr><td>Yetim ürün satırı</td><td><code>FILTER(Satislar, ISBLANK(RELATED(Urunler[Urun])))</code></td><td>0</td><td>Her satışın ürünü var</td></tr>
<tr><td>Negatif tutar</td><td><code>Satislar[Tutar] &lt; 0</code></td><td>0</td><td>İadeler Durum ile işaretli</td></tr>
<tr><td>Teslim, siparişten önce</td><td><code>TeslimTarihi &lt; Tarih</code></td><td>0</td><td>Tarih mantığı tutarlı</td></tr>
<tr><td>Boş kargo günü</td><td><code>ISBLANK(Satislar[KargoGun])</code></td><td>131</td><td>121 iptal + 10 kargoda; beklenen</td></tr>
<tr><td>Tarih tablosu kesintisiz mi?</td><td><code>COUNTROWS(Tarih)</code> ile gün farkı + 1</td><td>1.096 = 1.096</td><td>Eksik gün yok</td></tr>
<tr><td>Hiç almamış müşteri</td><td><code>ISEMPTY(RELATEDTABLE(Satislar))</code></td><td>14</td><td>Ortalama ölçülerinde dikkat</td></tr>
<tr><td>Şehri boş müşteri</td><td><code>COUNTBLANK(Musteriler[Sehir])</code></td><td>7</td><td>Harita ve bölge raporunda "(Boş)"</td></tr>
<tr><td>Hiç satılmamış ürün</td><td><code>ISEMPTY(CALCULATETABLE(Satislar))</code></td><td>2</td><td>Koşu Bandı, Gurme Lokum Kutusu</td></tr>
</table></div>
<pre class="dax">EVALUATE
ROW(
    "Satır", COUNTROWS(Satislar),
    "Yetim ürün", COUNTROWS(FILTER(Satislar, ISBLANK(RELATED(Urunler[Urun])))) + 0,
    "Boş kargo günü", COUNTROWS(FILTER(Satislar, ISBLANK(Satislar[KargoGun]))) + 0,
    "Tarih satırı", COUNTROWS(Tarih),
    "Gün sayısı", DATEDIFF(MIN(Tarih[Tarih]), MAX(Tarih[Tarih]), DAY) + 1,
    "Almayan müşteri", COUNTROWS(FILTER(Musteriler, ISEMPTY(RELATEDTABLE(Satislar)))) + 0
)</pre>
<p>Boş bir FILTER üzerinde COUNTROWS 0 değil BLANK döndürür. Rapor ya da test çıktısında "0" görmek istiyorsan <code>+ 0</code> ekle.</p>
<div class="tip"><b>Ekip çalışması</b>Sağlık sorgusunu ve ölçü testlerini PBIP projesinde DAXQueries klasöründe tut. Bir ölçüyü değiştiren kişi testleri çalıştırır ve sonucu çekme isteğine (pull request) ekler. Böylece "bu rakam neden değişti?" sorusunun cevabı kayıt altında olur.</div>
`, ex: [
  { t: 'query',
    q: `Bir test sorgusu yaz: tek satırda modeldeki [Net Satış] ("Model"), kanallar üzerinden toplanmış net satış ("Kanallar": SUMX(VALUES(Satislar[Kanal]), [Net Satış])) ve ikisinin 2 basamağa yuvarlanmış farkı ("Fark") yer alsın.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
ROW(
    "Model", [Net Satış],
    "Kanallar", SUMX(VALUES(Satislar[Kanal]), [Net Satış]),
    "Fark", ROUND([Net Satış] - SUMX(VALUES(Satislar[Kanal]), [Net Satış]), 2)
)`,
    hint: `ROW("Model", [Net Satış], "Kanallar", SUMX(VALUES(Satislar[Kanal]), [Net Satış]), "Fark", ROUND(..., 2)). Fark 0 çıkmalı.` },
  { t: 'query',
    q: `Veri kalitesi kontrolü: Satislar tablosunda hiçbir satırı olmayan ürünlerin adlarını (Urunler[Urun]) listele.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
FILTER(VALUES(Urunler[Urun]), ISEMPTY(CALCULATETABLE(Satislar)))`,
    hint: `FILTER(VALUES(Urunler[Urun]), ISEMPTY(CALCULATETABLE(Satislar))). CALCULATETABLE ürün satırını filtreye çevirir. 2 ürün gelmeli.` },
  { t: 'query',
    q: `Sorgu içinde <code>Satislar[Mobil Marj]</code> adlı bir ölçü tanımla (DIVIDE([Brüt Kâr], [Net Satış])). 2024 yılında yalnızca Mobil kanalı için kategori bazında "Satış" ([Net Satış]) ve "Marj" döndür; filtreleri TREATAS ile ver, sonucu satışa göre büyükten küçüğe sırala.`,
    start: 'DEFINE\n',
    sol: `DEFINE
    MEASURE Satislar[Mobil Marj] = DIVIDE([Brüt Kâr], [Net Satış])
EVALUATE
SUMMARIZECOLUMNS(
    Kategoriler[Kategori],
    TREATAS({2024}, Tarih[Yil]),
    TREATAS({"Mobil"}, Satislar[Kanal]),
    "Satış", [Net Satış],
    "Marj", [Mobil Marj]
)
ORDER BY [Satış] DESC`,
    hint: `DEFINE MEASURE Satislar[Mobil Marj] = ... EVALUATE SUMMARIZECOLUMNS(Kategoriler[Kategori], TREATAS({2024}, Tarih[Yil]), TREATAS({"Mobil"}, Satislar[Kanal]), "Satış", [Net Satış], "Marj", [Mobil Marj]) ORDER BY [Satış] DESC` },
  { t: 'query',
    q: `Pazarlama, hiç alışveriş yapmamış kayıtlı müşterilere kampanya yapacak. Her şehir (Musteriler[Sehir]) için bu müşterilerin sayısını "Almayan" sütununda döndür. Müşteri tablosunu şehre göre CALCULATETABLE ile süz; satışı olmayanları ISEMPTY(RELATEDTABLE(Satislar)) ile bul.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
ADDCOLUMNS(
    VALUES(Musteriler[Sehir]),
    "Almayan", COUNTROWS(FILTER(CALCULATETABLE(Musteriler), ISEMPTY(RELATEDTABLE(Satislar))))
)`,
    hint: `ADDCOLUMNS(VALUES(Musteriler[Sehir]), "Almayan", COUNTROWS(FILTER(CALCULATETABLE(Musteriler), ISEMPTY(RELATEDTABLE(Satislar))))). Gaziantep 4 çıkmalı.` },
  { t: 'mc',
    q: `Satış müdürü, ölçü testinde "Durum: KALDI" görüyor. Sorgu <code>IF([Net Satış] = SUMX(VALUES(Kategoriler[Kategori]), [Net Satış]), "GEÇTİ", "KALDI")</code>. İki sayı ekranda aynı görünüyor. En olası neden hangisi?`,
    o: [
      `Kayan nokta farkı; tolerans gerekir`,
      `SUMX kategorilerde bağlam geçişi yapmıyor`,
      `IF içinde ölçüler yalnızca bir kez hesaplanır`,
      `Kategoriler tablosunda boş satır olduğu için`
    ], a: 0,
    why: `Ondalıklı toplamalar farklı sırayla yapılınca çok küçük farklar oluşur (bu modelde yaklaşık 0,0000000005). Eşitlik testi bu yüzden başarısız olur; ABS(fark) &lt; 0.01 ya da ROUND kullanılmalı. SUMX ölçü çağırdığı için bağlam geçişi yapar. IF'in değerlendirme sırası eşitliği etkilemez. Boş kategori satırı olsaydı fark gözle görülürdü.` },
  { t: 'mc',
    q: `Ürün bazında test sorgun 40 ürünün hepsini listelemeli, ama <code>SUMMARIZECOLUMNS(Urunler[Urun], "S", [Net Satış])</code> 38 satır döndürüyor. Doğru yorum hangisi?`,
    o: [
      `Sorgu sınırı aşıldığı için sonuç kesilmiştir`,
      `Satışı olmayan 2 ürün boş olduğu için atılmıştır`,
      `ORDER BY yazılmadığı için iki satır gizlenmiştir`,
      `Ürün adları yinelendiği için iki satır birleşmiştir`
    ], a: 1,
    why: `SUMMARIZECOLUMNS, ifadelerin hepsi boş olan satırları atar. Satışı olmayan iki ürünün [Net Satış]'ı BLANK'tir. Sınır 1.000.000 değerdir, 40 satırda devreye girmez. ORDER BY satır sayısını değiştirmez. Ürün adları bu modelde benzersizdir.` },
  { t: 'mc',
    q: `Bir danışman, şirketin yayımlanmış anlamsal modeline canlı bağlantı (live connect) kurulmuş bir raporda DAX sorgu görünümünde bir ölçünün tanımını düzeltip "Modeli güncelle" ile kaydetmek istiyor ama seçeneği bulamıyor. Doğru açıklama hangisi?`,
    o: [
      `Seçenek yalnızca Premium kapasitedeki çalışma alanlarında görünür`,
      `Önce sorgu sekmesini .dax dosyası olarak dışa aktarmak gerekir`,
      `Canlı bağlantıda model ölçüleri buradan düzenlenemez`,
      `Ölçü tanımında /// açıklaması olmadığı için seçenek gizlenir`
    ], a: 2,
    why: `Microsoft Learn'e göre canlı bağlantıda model ölçüleri görüntülenemez ve düzenlenemez; "Modeli güncelle" seçenekleri yalnızca modeli içeren dosyada (ya da yetki verilmişse serviste model düzenlemede) vardır. Kapasite türü, dışa aktarma ya da açıklama yorumu bu seçeneği açmaz.` }
] });

/* ───────────────────────── 5. İLERİ KALIPLAR ───────────────────────── */
ext('ileri-kaliplar', { min: 24, html: `
<h2>ABC / Pareto: üretim hâli</h2>
<p>Kategori müdürü ABC sınıfını stok planlamasında kullanacak: A ürünlerinin stoğu hiç bitmemeli, C ürünleri gözden geçirilecek. Sınıf bir karar tetiklediği için her satırının savunulabilir olması gerekir. Segmentasyon dersindeki kalıbı üretime taşırken beş soruya cevap ver.</p>
<h3>1. Sınır kuralı yazılı mı?</h3>
<p>Satan 38 ürün için iki makul kural farklı sonuç verir:</p>
<div class="tbl-wrap"><table>
<tr><th>Kural</th><th>A</th><th>B</th><th>C</th></tr>
<tr><td>Kümülatif pay (ürün dahil) ≤ %70 ise A</td><td>20</td><td>9</td><td>9</td></tr>
<tr><td>Önceki ürünlerin payı &lt; %70 ise A (eşiği geçen ürün de A)</td><td>21</td><td>9</td><td>8</td></tr>
</table></div>
<p>İkisi de savunulabilir; önemli olan ekibin hangisini kullandığını ölçünün açıklamasına yazmasıdır. Tedarik ekibi "21. ürün neden B?" diye sorduğunda cevap belgede olmalı.</p>
<h3>2. Eşitlikler nasıl çözülüyor?</h3>
<p>Klasik kalıp "satışı benimkinden büyük ya da eşit olanların toplamı"dır. Eşit satışlı iki ürün birbirinin satışını kümülatife katar ve ikisi de büyük kümülatifi alır. Bu katalogda eşitlik yok, ama binlerce SKU'lu gerçek listelerde (aynı fiyatla bir kez satılan ürünler) çok sık görülür. Eşitliği bozmanın yolu ikinci bir sıralama ölçütüdür: pencere fonksiyonunda <code>ORDERBY([Net Satış], DESC, Urunler[Urun], ASC)</code>.</p>
<pre class="dax" data-notry>Kümülatif Satış (Eşitliksiz) =
SUMX(
    WINDOW(
        1, ABS, 0, REL,
        ALLSELECTED(Urunler[Urun]),
        ORDERBY([Net Satış], DESC, Urunler[Urun], ASC)
    ),
    [Net Satış]
)</pre>
<h3>3. Performans ne kadar?</h3>
<p>Klasik kalıp her ürün satırında tüm ürün listesini süzer: n ürün için n² karşılaştırma. 40 üründe 1.600; 50.000 SKU'da 2,5 milyar. Seçenekler:</p>
<div class="tbl-wrap"><table>
<tr><th>Yol</th><th>Filtrelere tepki</th><th>Hız</th><th>Ne zaman?</th></tr>
<tr><td>Ölçü (FILTER + ADDCOLUMNS)</td><td>Var</td><td>n² ; büyük katalogda yavaş</td><td>Birkaç yüz ürün</td></tr>
<tr><td>Ölçü (WINDOW)</td><td>Var</td><td>Sıralama maliyeti; daha okunur</td><td>Orta katalog, eşitlik çözümü gerekiyorsa</td></tr>
<tr><td>Hesaplanmış sütun / tablo</td><td>Yok (yenilemede donar)</td><td>Hızlı</td><td>"Son 12 aya göre sabit sınıf" yeterliyse</td></tr>
<tr><td>Power Query ya da kaynak</td><td>Yok</td><td>En hızlı</td><td>Sınıf başka sistemlerde de kullanılacaksa</td></tr>
</table></div>
<h3>4. 80/20 gerçekten geçerli mi?</h3>
<p>Bu katalogda satışın %80'ini satan 38 ürünün 25'i (%66) getiriyor. "Ürünlerin %20'si satışın %80'i" kuralı burada yok; satış oldukça dengeli dağılıyor. Kuralı varsayma, veriden ölç ve raporda söyle.</p>
<h3>5. Sınıfları eksene koymak</h3>
<p>Ölçü ile hesaplanan sınıf eksene konamaz. "Her sınıfta kaç ürün var?" grafiği için A/B/C satırlarını içeren bağlantısız küçük bir tablo (DATATABLE) ve sınıf sayan bir ölçü gerekir. Ölçünün çekirdeği alıştırmada.</p>

<h2>Yeni, sadık, geri kazanılan, kayıp: köprü tutmalı</h2>
<p>Yönetim kurulu yıllık "müşteri köprüsü" istiyor: geçen yılın aktif müşterisinden bu yılın aktif müşterisine nasıl gelindi? Tanımlar (yıllık pencere, iptaller hariç):</p>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Tanım</th><th>2024</th></tr>
<tr><td>Önceki yıl aktif</td><td>2023'te alan</td><td>77</td></tr>
<tr><td>Kayıp</td><td>2023'te alıp 2024'te almayan</td><td>13</td></tr>
<tr><td>Sadık</td><td>İki yılda da alan</td><td>64</td></tr>
<tr><td>Yeni</td><td>2024'te alan, daha önce hiç almamış</td><td>59</td></tr>
<tr><td>Geri kazanılan</td><td>2024'te alan, 2023'te almamış ama daha önce almış</td><td>0</td></tr>
<tr><td>Bu yıl aktif</td><td>2024'te alan</td><td>123</td></tr>
</table></div>
<p>Köprü: 77 − 13 + 59 + 0 = 123. Bu eşitlik her dönemde tutmalıdır; tutmuyorsa tanımlardan biri diğeriyle örtüşüyor ya da bir müşteriyi iki kez sayıyorsun. Köprüyü bir DAX sorgusuyla her dönem için test et ve testi ölçüyle birlikte sakla.</p>
<ul>
<li><b>Veri başlangıcı etkisi:</b> Veri Haziran 2022'de başladığı için 2022'nin 32 müşterisinin hepsi "yeni" görünür. Bu gerçek bir kazanım değildir; köprüyü 2023'ten başlat ya da ilk dönemi işaretle.</li>
<li><b>Pencere uzunluğu:</b> Çeyreklik pencerede aynı müşteriler sık sık "kayıp" ve "geri kazanılan" olur (2024 Ç4'te 23 geri kazanılan). Pencere, müşterinin alışveriş sıklığına göre seçilmelidir.</li>
<li><b>Toplam satırı:</b> Önceki dönemi DATEADD ile tanımlayan ölçü toplamda anlamsız sayı üretir. <code>HASONEVALUE(Tarih[Yil])</code> ile koru.</li>
<li><b>Durumları eksende göstermek:</b> Bağlantısız bir durum tablosu ve SWITCH gerekir; Top N + Diğer'deki model hilesiyle aynı mantık.</li>
</ul>
<pre class="dax" data-notry>Müşteri Köprüsü =
VAR Durum = SELECTEDVALUE(MusteriDurumu[Durum])
VAR Simdi = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal")
VAR Onceki = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal", DATEADD(Tarih[Tarih], -1, YEAR))
VAR Eski = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal", Tarih[Tarih] &lt; MIN(Tarih[Tarih]))
RETURN
    IF(HASONEVALUE(Tarih[Yil]),
        SWITCH(Durum,
            "Kayıp", - COUNTROWS(EXCEPT(Onceki, Simdi)),
            "Sadık", COUNTROWS(INTERSECT(Simdi, Onceki)),
            "Yeni", COUNTROWS(EXCEPT(EXCEPT(Simdi, Onceki), Eski)),
            "Geri kazanılan", COUNTROWS(INTERSECT(EXCEPT(Simdi, Onceki), Eski))
        )
    )</pre>

<h2>Sepet analizi: müşteri değil sipariş düzeyinde</h2>
<p>Ana bölümdeki birlikte alma oranı müşteri düzeyindedir: "A'yı bir kez alan, B'yi herhangi bir zaman almış mı?" Mağaza yerleşimi ve "bunu alan bunu da aldı" önerisi için asıl soru sipariş düzeyindedir: aynı sepette mi? Kitap ve Kozmetik için sayılar (iptaller hariç, 838 sipariş):</p>
<div class="tbl-wrap"><table>
<tr><th>Metrik</th><th>Hesap</th><th>Değer</th></tr>
<tr><td>Kitap içeren sipariş</td><td></td><td>311</td></tr>
<tr><td>Kozmetik içeren sipariş</td><td></td><td>229</td></tr>
<tr><td>İkisini birlikte içeren</td><td></td><td>61</td></tr>
<tr><td>Destek</td><td>61 / 838</td><td>%7,3</td></tr>
<tr><td>Güven (Kitap → Kozmetik)</td><td>61 / 311</td><td>%19,6</td></tr>
<tr><td>Kozmetik'in genel oranı</td><td>229 / 838</td><td>%27,3</td></tr>
<tr><td>Kaldıraç</td><td>%19,6 / %27,3</td><td>0,72</td></tr>
</table></div>
<p>En sık birlikte görülen çift, tesadüften <i>daha az</i> birlikte alınıyor. Bu veride 21 kategori çiftinin hiçbirinde kaldıraç 1'i geçmiyor; sepetler küçük (sipariş başına ortalama 1,79 satır) ve kategoriler aynı sepette birbirinin yerine geçiyor. En yüksek kaldıraç Hediye–Kozmetik (0,89), ama yalnızca 9 siparişe dayanıyor ve yıla göre 1,21 (2023) ile 0,87 (2024) arasında oynuyor.</p>
<pre class="dax">Hediye–Kozmetik Kaldıracı =
VAR Tum = CALCULATE([Sipariş Sayısı], REMOVEFILTERS(Kategoriler), REMOVEFILTERS(Urunler))
VAR A = CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] &lt;&gt; "İptal", Kategoriler[Kategori] = "Hediye")
VAR B = CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] &lt;&gt; "İptal", Kategoriler[Kategori] = "Kozmetik")
VAR AB = COUNTROWS(INTERSECT(A, B))
RETURN DIVIDE(AB * Tum, COUNTROWS(A) * COUNTROWS(B))</pre>
<ul>
<li><b>En az destek eşiği koy:</b> Örneğin 30 siparişin altındaki çiftleri gösterme. Küçük sayılarda kaldıraç rastgele büyür ya da küçülür.</li>
<li><b>Oranın yanında sayıyı göster:</b> "Kaldıraç 1,21 (n = 4)" ile "Kaldıraç 1,21 (n = 400)" aynı karar değildir.</li>
<li><b>Performans:</b> Ürün düzeyinde n ürün için n² çift vardır. Binlerce SKU'da çift tablosunu Power Query'de ya da Fabric'te önceden hesapla, Power BI'da yalnızca göster.</li>
</ul>

<h2>Dinamik segmentasyon: üyelik hangi filtreye göre?</h2>
<p>Kitap kategori müdürü dilimleyicide Kitap'ı seçip [Dilimdeki Müşteri] grafiğine bakıyor: 85 Küçük, 28 Orta, hiç Büyük ya da VIP yok. "Kitap müşterilerimiz değersiz mi?" Hayır: ölçü müşteriyi yalnızca Kitap harcamasına göre segmentliyor. İki farklı soru var:</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Küçük</th><th>Orta</th><th>Büyük</th><th>VIP</th></tr>
<tr><td>Kitap harcamasına göre (mevcut ölçü)</td><td>85</td><td>28</td><td>0</td><td>0</td></tr>
<tr><td>Kitap alanlar, toplam harcamalarına göre</td><td>12</td><td>31</td><td>37</td><td>33</td></tr>
</table></div>
<p>İkinci soru için iki değişiklik gerekir: müşterinin değeri ürün filtreleri kaldırılarak hesaplanır, ama dolaşılan liste yalnızca Kitap alanlardır. Dikkat: listeyi VALUES(Musteriler[MusteriNo]) ile kurarsan Kitap filtresi Musteriler'e ulaşmaz (filtre Satislar'dan Musteriler'e akmaz) ve 113 yerine 136 müşteri sayarsın.</p>
<ul>
<li><b>Sınır kontrolü:</b> Koşul <code>Min &lt; S &lt;= Max</code>. Değeri 0 ya da negatif olan müşteri (iadesi satışından büyük) hiçbir dilime girmez. Testte dilimlerin toplamını [Müşteri Sayısı] ile karşılaştır.</li>
<li><b>Dönem etkisi:</b> 2024 seçilince VIP sayısı 34'ten 10'a düşer; çünkü değer seçili döneme göre hesaplanır. Bu bilinçli bir karar olmalı ve başlıkta yazmalı.</li>
</ul>

<h2>Kontrol listesi</h2>
<ol>
<li>Sınır kuralı ve eşitlik çözümü ölçünün açıklamasında yazılı mı?</li>
<li>Katalog büyüklüğünde performansı ölçtün mü? Gerekirse sınıfı yenilemede hesapla.</li>
<li>Müşteri köprüsü her dönemde kapanıyor mu? İlk dönem işaretli mi?</li>
<li>Sepet metriklerinin yanında sipariş sayısı görünüyor mu, en az destek eşiği var mı?</li>
<li>Segment üyeliği hangi filtreye göre hesaplanıyor? Başlık bunu söylüyor mu?</li>
</ol>
`, ex: [
  { t: 'dax', name: 'A Sınıfı Ürün Sayısı',
    q: `<b>A Sınıfı Ürün Sayısı</b>: Görünen ürünlerden (satışı boş olmayanlar) kaç tanesi A sınıfında? Kural: ürünün kendisinden büyük satışlı ürünlerin toplamı, toplam satışın %70'inden azsa ürün A'dır (eşiği geçen ürün de A).`,
    sol: `VAR Siralama = FILTER(ADDCOLUMNS(VALUES(Urunler[Urun]), "S", [Net Satış]), NOT ISBLANK([S]))
VAR Toplam = SUMX(Siralama, [S])
RETURN
    COUNTROWS(
        FILTER(
            Siralama,
            VAR Ben = [S]
            RETURN DIVIDE(SUMX(FILTER(Siralama, [S] > Ben), [S]), Toplam) < 0.7
        )
    )`,
    hint: `Ürün tablosunu VAR'a al. FILTER'ın içinde VAR Ben = [S] ile geçerli ürünün satışını sakla, sonra [S] > Ben olanların toplamını Toplam'a böl. Toplamda 21 çıkmalı.` },
  { t: 'dax', name: 'Siparişte Birlikte Alma %',
    q: `<b>Siparişte Birlikte Alma %</b>: Seçili ürün/kategori filtresiyle (A) iptal edilmemiş siparişlerin yüzde kaçında, eksendeki KarsiUrunler ürünlerinden (B) de en az biri var? Müşteri değil sipariş (Satislar[SiparisNo]) kümeleriyle çalış.`,
    sol: `VAR A = CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal")
VAR B = CALCULATETABLE(VALUES(Satislar[SiparisNo]), REMOVEFILTERS(Urunler), REMOVEFILTERS(Kategoriler), TREATAS(VALUES(KarsiUrunler[KarsiUrunNo]), Urunler[UrunNo]), Satislar[Durum] <> "İptal")
RETURN DIVIDE(COUNTROWS(INTERSECT(A, B)), COUNTROWS(A))`,
    hint: `Birlikte Alma Oranı % kalıbıyla aynı; yalnızca VALUES(Satislar[MusteriNo]) yerine VALUES(Satislar[SiparisNo]). Kitap satırında %37,1 çıkmalı.`,
    grid: [{ t: 'KarsiUrunler', c: 'KarsiKategori' }] },
  { t: 'dax', name: 'Toplam Değere Göre Dilim',
    q: `<b>Toplam Değere Göre Dilim</b>: MusteriDilimleri ekseninde, görünen bağlamda alışveriş yapan müşterileri (CALCULATETABLE(VALUES(Satislar[MusteriNo]), iptaller hariç)) say; ama her müşterinin değerini ürün ve kategori filtrelerini kaldırarak hesapla. Dilim koşulu: Min &lt; S &lt;= Max.`,
    sol: `VAR MusteriSatis = ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), "S", CALCULATE([Net Satış], REMOVEFILTERS(Urunler), REMOVEFILTERS(Kategoriler)))
RETURN SUMX(MusteriDilimleri, COUNTROWS(FILTER(MusteriSatis, [S] > MusteriDilimleri[Min] && [S] <= MusteriDilimleri[Max])))`,
    hint: `Liste: CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"). Değer: CALCULATE([Net Satış], REMOVEFILTERS(Urunler), REMOVEFILTERS(Kategoriler)). Sonra Dilimdeki Müşteri'deki gibi SUMX(MusteriDilimleri, ...).`,
    grid: [{ t: 'MusteriDilimleri', c: 'Dilim' }] },
  { t: 'dax', name: 'Geri Kazanılan Müşteri (Çeyrek)',
    q: `<b>Geri Kazanılan Müşteri (Çeyrek)</b>: Bu dönemde alışveriş yapan, dönem başından önceki 3 ayda almamış ama ondan daha önce almış müşteri sayısı (iptaller hariç). Önceki pencere: DATESBETWEEN(Tarih[Tarih], EDATE(Bas, -3), Bas - 1).`,
    sol: `VAR Bas = MIN(Tarih[Tarih])
VAR Simdi = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")
VAR Onceki = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal", DATESBETWEEN(Tarih[Tarih], EDATE(Bas, -3), Bas - 1))
VAR Eski = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal", Tarih[Tarih] < EDATE(Bas, -3))
RETURN COUNTROWS(INTERSECT(EXCEPT(Simdi, Onceki), Eski))`,
    hint: `Üç küme kur: Simdi, Onceki (3 aylık pencere), Eski (pencereden önce). Geri kazanılan = (Simdi − Onceki) ∩ Eski. 2024-Ç4'te 23 çıkmalı.`,
    grid: [{ t: 'Tarih', c: 'YilCeyrek' }], noTotal: true },
  { t: 'mc',
    q: `Tedarik ekibi, ABC raporunda kümülatif payı %70,4 olan ürünün B çıkmasına itiraz ediyor; ürünün önceki ürünlerle toplam payı %68,1. Ne yaparsın?`,
    o: [
      `Eşiği %71'e çıkarıp ürünü A sınıfına alırım`,
      `Kuralı ekiple seçer, ölçünün açıklamasına yazarım`,
      `Ürünü elle A olarak işaretleyen bir istisna eklerim`,
      `ABC yerine yalnızca kümülatif payı gösteririm`
    ], a: 1,
    why: `"Ürün dahil ≤ %70" ve "önceki ürünler &lt; %70" iki geçerli kuraldır; bu ürün birinde B, diğerinde A olur. Doğru iş, bir kuralı ekiple seçmek ve belgelemektir. Eşiği ürün için kaydırmak ya da elle istisna eklemek her ay yeni itirazlar doğurur. Sınıfı kaldırmak, stok kararlarını tetikleyen bilgiyi yok eder.` },
  { t: 'mc',
    q: `Pazarlama, Hediye–Kozmetik çifti için sipariş düzeyinde kaldıracı 2023'te 1,21 görüp "birlikte kampanya" planlıyor. Çift yalnızca 9 siparişte birlikte geçiyor. En iyi tavsiye hangisi?`,
    o: [
      `Kaldıraç 1'den büyük olduğu için kampanyayı hemen başlatmak`,
      `Kaldıracı müşteri düzeyine çevirip yeniden hesaplamak`,
      `Önce destek eşiği koyup yeni veriyle doğrulamak`,
      `Destek düşük olduğu için güven metriğini tek ölçüt yapmak`
    ], a: 2,
    why: `9 siparişlik bir çiftte kaldıraç rastgele oynar; nitekim 2024'te 0,87'ye düşüyor. Önce en az destek eşiği koyup sonucu yeni dönemde doğrulamak gerekir. Müşteri düzeyi farklı bir soruyu cevaplar. Güven tek başına, B'nin zaten yaygın olup olmadığını hesaba katmaz.` },
  { t: 'mc',
    q: `Yıllık müşteri köprüsünde 2022 için "32 yeni müşteri, 0 kayıp" görünüyor; yönetim "2022 harika bir kazanım yılı" diyor. Doğru yorum hangisi?`,
    o: [
      `Veri Haziran 2022'de başladığı için herkes yeni görünüyor`,
      `2022'de gerçekten hiç müşteri kaybedilmemiş`,
      `Kayıp ölçüsü toplam satırında hesaplanmadığı için 0`,
      `İptal edilen siparişler kayıpları gizliyor`
    ], a: 0,
    why: `İlk veri döneminde "daha önce alışveriş yapmış" müşteri olamaz; herkes yeni sayılır ve kayıp hesaplanamaz. Bu bir veri başlangıcı etkisidir, gerçek kazanım değildir. Köprüyü 2023'ten başlatmak ya da ilk dönemi işaretlemek gerekir. Toplam satırı ve iptaller bu satırı açıklamaz.` }
] });

/* ───────────────────────── 6. HİYERARŞİ ───────────────────────── */
ext('hiyerarsi', { min: 20, html: `
<h2>Bu modelin organizasyon ağacı</h2>
<p>Calisanlar tablosunda 27 kişi ve üç düzey var: Genel Müdür Selim Aksoy (düzey 1), altında altı müdür (düzey 2), onların altında 20 uzman ve temsilci (düzey 3). Satış yapanlar Satış Müdürü Elif Doğan ve ekibindeki beş kişi. Satışın 183.134,35 ₺'si düzey 2'de (Elif Doğan'ın kendisi), 1.067.638,10 ₺'si düzey 3'te.</p>
<p>Bu yapı, gerçek şirketlerde sık görülen bir sorunu taşır: müdür hem yönetir hem satar. Matris açıldığında müdürün kendi satışı nereye düşer? Bu soru düzensiz hiyerarşinin (ragged hierarchy) özüdür.</p>

<h2>Düzensiz hiyerarşi: boşluklar nereden gelir?</h2>
<p>Matrise Seviye1 → Seviye2 → Seviye3 sütunları konduğunda Elif Doğan'ın satırı düzey 2'de biter; Seviye3 değeri boştur. Matris onun 183.134,35 ₺'lik kendi satışını Elif Doğan'ın altında "(Boş)" adlı bir satırda gösterir. Kullanıcı "Boş kim?" diye sorar. Üç çözüm:</p>
<div class="tbl-wrap"><table>
<tr><th>Çözüm</th><th>Artı</th><th>Eksi</th></tr>
<tr><td>Boş düzeyi ISINSCOPE'lu bir ölçüyle gizlemek (ana bölümdeki "Satış (Hiyerarşi)")</td><td>Model değişmez</td><td>Müdürün kendi satışı hiçbir alt satırda görünmez, yalnızca toplamında</td></tr>
<tr><td>Boş düzeyi kişinin kendi adıyla doldurmak</td><td>Her tutar adı olan bir satırda</td><td>Müdür kendi altında bir kez daha görünür</td></tr>
<tr><td>Boş düzeyi "(kendi satışı)" gibi bir etiketle doldurmak</td><td>Açık ve okunur</td><td>Etiket kuralı belgelenmeli</td></tr>
</table></div>
<pre class="dax" data-notry>-- Calisanlar tablosunda hesaplanmış sütun
Seviye3 (Dolu) =
VAR Kendi = Calisanlar[AdSoyad]
VAR Uc = LOOKUPVALUE(
    Calisanlar[AdSoyad], Calisanlar[CalisanNo],
    PATHITEM(Calisanlar[Yol], 3, INTEGER)
)
RETURN IF(PATHLENGTH(Calisanlar[Yol]) &lt; 3, Kendi &amp; " (kendi satışı)", Uc)</pre>
<p>Hangi çözümü seçersen seç, matrisin toplamları değişmez; değişen, kullanıcının tutarı nerede bulduğudur. Organizasyon raporlarında en az soru getiren seçenek genellikle üçüncüsüdür.</p>

<h2>PATH ailesi: derinlemesine</h2>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Gamze Özkan için (Yol = "1|2|8")</th><th>Not</th></tr>
<tr><td><code>PATHLENGTH(Yol)</code></td><td>3</td><td>Düzey</td></tr>
<tr><td><code>PATHITEM(Yol, 1, INTEGER)</code></td><td>1</td><td>Kök (Genel Müdür)</td></tr>
<tr><td><code>PATHITEMREVERSE(Yol, 2, INTEGER)</code></td><td>2</td><td>Sondan ikinci: doğrudan yönetici</td></tr>
<tr><td><code>PATHCONTAINS(Yol, 2)</code></td><td>DOĞRU</td><td>Elif Doğan'ın ağacında mı?</td></tr>
</table></div>
<p>PATHITEM'in üçüncü bağımsız değişkenini unutma: varsayılan dönüş türü metindir. Metin "2" ile tamsayı CalisanNo, LOOKUPVALUE'da eşleşmez. Microsoft Learn'deki kurallar, PATH sütunu yenilemede hata vermeden önce veri kalitesini kontrol etmeni gerektirir:</p>
<ul>
<li>Kimlik ve ebeveyn sütunu aynı türde olmalı: ikisi de metin ya da ikisi de tamsayı.</li>
<li>Ebeveyn sütunu boşsa PATH yalnızca kişinin kendi kimliğini döndürür (kök).</li>
<li>Ebeveyn sütunundaki her değer kimlik sütununda bulunmalı.</li>
<li>Kimlikte dikey çizgi (|) varsa hata alırsın.</li>
<li>Aynı kimlik farklı ebeveynlerle iki kez geçiyorsa hata alırsın.</li>
<li>DirectQuery modunda hesaplanmış sütunda ve RLS kuralında desteklenmez.</li>
</ul>
<p>Yenilemeden önce şu sorguyla "yöneticisi tabloda olmayan" kayıtları ara:</p>
<pre class="dax">EVALUATE
EXCEPT(VALUES(Calisanlar[YoneticiNo]), VALUES(Calisanlar[CalisanNo]))</pre>
<p>Bu modelde tek satır gelir ve değeri boştur: kök çalışanın boş YoneticiNo'su. Başka bir değer gelirse PATH o çalışanda hata verecek demektir.</p>

<h2>Yönetici bazında toplama: üç farklı soru</h2>
<p>İK direktörü "Elif Doğan'ın satışı ne kadar?" diye soruyor. Bu cümle üç farklı sayıya karşılık gelebilir:</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Ölçü fikri</th><th>Elif Doğan</th><th>Selim Aksoy</th></tr>
<tr><td>Kişinin kendi satışı</td><td><code>[Net Satış]</code></td><td>183.134,35</td><td>boş</td></tr>
<tr><td>Doğrudan bağlıları</td><td><code>Calisanlar[YoneticiNo] = Kisi</code></td><td>1.067.638,10</td><td>183.134,35</td></tr>
<tr><td>Tüm alt ağaç (kendisi dahil)</td><td><code>PATHCONTAINS(Calisanlar[Yol], Kisi)</code></td><td>1.250.772,45</td><td>1.250.772,45</td></tr>
</table></div>
<p>Mekanizma: <code>FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], Kisi))</code>, satırdaki kişiye ait filtreyi kaldırır ve yerine ekibin satırlarını koyar. Bu filtre TemsilciNo ilişkisi üzerinden Satislar'a iner. Raporda hangi sayının gösterildiği başlıkta yazmalı; yoksa üç ayrı toplantıda üç ayrı rakam konuşulur.</p>
<p>Ekip içindeki pay da aynı mantıkla hesaplanır: payda, kişinin yöneticisinin alt ağacıdır. Gamze Özkan'ın payı Elif Doğan ağacının %21,2'si; Elif Doğan'ın kendi payı ise Genel Müdür ağacının %14,6'sı.</p>
<div class="warn"><b>RLS ile birlikte</b>Satır düzeyi güvenlik (RLS) kişiyi kendi alt ağacıyla sınırlıyorsa (ör. <code>PATHCONTAINS(Calisanlar[Yol], ...USERPRINCIPALNAME()...)</code>), ölçüdeki ALL(Calisanlar) RLS'nin gizlediği satırları geri getirmez. Müdür kendi ekibinin toplamını doğru görür; temsilci yalnızca kendini görür. "Şirket toplamına göre pay" ise RLS altında "görebildiğim toplama göre pay" olur. Bu farkı raporun kullanım notuna yaz.</div>

<h2>ISINSCOPE ile düzeye göre farklı hesap</h2>
<p>Satış direktörü Departman → Çalışan matrisi istiyor: çalışan satırında kişinin tüm alt ağacının satışı, departman satırında departmanın satışı görünsün.</p>
<pre class="dax">Düzeye Göre Ekip Satışı =
SWITCH(
    TRUE(),
    ISINSCOPE(Calisanlar[AdSoyad]), [Ekip Satışı],
    ISINSCOPE(Departmanlar[Departman]), [Net Satış],
    [Net Satış]
)</pre>
<p>Bunun bir bedeli var: alt toplam artık çocukların toplamı değildir. Satış departmanı satırı 1.250.772,45 ₺ gösterir; altındaki çalışan satırlarının toplamı ise 2.318.410,55 ₺'dir, çünkü Elif Doğan'ın satırı ekibinin satışını da içerir. Kullanıcı satırları toplarsa yanlış sonuca varır. Bu tür ölçülerde:</p>
<ul>
<li>Ölçünün adı farkı söylesin ("Ekip Satışı (alt ağaç)").</li>
<li>Kenara bir not ekle: "Çalışan satırları toplanmaz."</li>
<li>ISINSCOPE kullan, HASONEVALUE değil: dilimleyicide tek departman seçiliyken HASONEVALUE toplam satırında da DOĞRU döner; ISINSCOPE yalnızca o düzey matriste gerçekten açıkken DOĞRU döner.</li>
</ul>

<h2>Kontrol listesi</h2>
<ol>
<li>Kök kayıt dışında, yöneticisi tabloda olmayan çalışan var mı? (EXCEPT sorgusu)</li>
<li>PATHITEM'de dönüş türü INTEGER mı?</li>
<li>Müdürün kendi satışı matriste adı olan bir satırda görünüyor mu?</li>
<li>"Kendi", "doğrudan bağlı" ve "alt ağaç" sayılarından hangisi gösteriliyor?</li>
<li>RLS altında ALL'ın göremeyeceği satırlar düşünüldü mü?</li>
<li>Düzeye göre değişen ölçüde alt toplamların çocukların toplamı olmadığı belirtildi mi?</li>
</ol>
`, ex: [
  { t: 'dax', name: 'Doğrudan Ekip Satışı',
    q: `<b>Doğrudan Ekip Satışı</b>: Satırdaki çalışana doğrudan bağlı kişilerin (Calisanlar[YoneticiNo] = çalışanın numarası) net satış toplamı. Çalışan filtresini kaldır, yerine yönetici koşulunu koy; tek çalışan yoksa boş döndür.`,
    sol: `VAR Kisi = SELECTEDVALUE(Calisanlar[CalisanNo])
RETURN IF(NOT ISBLANK(Kisi), CALCULATE([Net Satış], REMOVEFILTERS(Calisanlar), Calisanlar[YoneticiNo] = Kisi))`,
    hint: `CALCULATE([Net Satış], REMOVEFILTERS(Calisanlar), Calisanlar[YoneticiNo] = Kisi). Elif Doğan satırında 1.067.638,10 çıkmalı.`,
    grid: [{ t: 'Calisanlar', c: 'AdSoyad' }], noTotal: true },
  { t: 'dax', name: 'Ekipteki Satışçı Sayısı',
    q: `<b>Ekipteki Satışçı Sayısı</b>: Satırdaki çalışanın alt ağacında (kendisi dahil) net satışı boş olmayan kişi sayısı. ALL(Calisanlar) üzerinde PATHCONTAINS ile ekibi bul, satışı olanları say.`,
    sol: `VAR Kisi = SELECTEDVALUE(Calisanlar[CalisanNo])
RETURN IF(NOT ISBLANK(Kisi), COUNTROWS(FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], Kisi) && NOT ISBLANK([Net Satış]))))`,
    hint: `FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], Kisi) && NOT ISBLANK([Net Satış])). [Net Satış] her satırda bağlam geçişiyle o kişinin satışını verir. Elif Doğan için 6.`,
    grid: [{ t: 'Calisanlar', c: 'AdSoyad' }], noTotal: true },
  { t: 'dax', name: 'Yönetici Ekibindeki Pay %',
    q: `<b>Yönetici Ekibindeki Pay %</b>: Çalışan satırında, kişinin net satışının, yöneticisinin tüm alt ağacının (PATHCONTAINS ile) net satışına oranı. Yalnızca Calisanlar[AdSoyad] düzeyi matriste açıkken ve kişinin yöneticisi varken hesapla.`,
    sol: `VAR Yonetici = SELECTEDVALUE(Calisanlar[YoneticiNo])
RETURN IF(ISINSCOPE(Calisanlar[AdSoyad]) && NOT ISBLANK(Yonetici), DIVIDE([Net Satış], CALCULATE([Net Satış], FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], Yonetici)))))`,
    hint: `Yöneticinin numarası SELECTEDVALUE(Calisanlar[YoneticiNo]). Payda: CALCULATE([Net Satış], FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], Yonetici))). Gamze Özkan için yaklaşık %21,2.`,
    grid: [{ t: 'Calisanlar', c: 'AdSoyad' }], noTotal: true },
  { t: 'query',
    q: `Düzey 2'deki her müdür (Calisanlar[Seviye] = 2) için adını, tüm alt ağacının net satışını ("Ekip Satışı") ve alt ağacındaki kişi sayısını ("Kişi") döndür. Müdürün numarasını CALCULATE(SELECTEDVALUE(Calisanlar[CalisanNo])) ile bir değişkene al.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
ADDCOLUMNS(
    CALCULATETABLE(VALUES(Calisanlar[AdSoyad]), Calisanlar[Seviye] = 2),
    "Ekip Satışı",
        VAR K = CALCULATE(SELECTEDVALUE(Calisanlar[CalisanNo]))
        RETURN CALCULATE([Net Satış], FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], K))),
    "Kişi",
        VAR K = CALCULATE(SELECTEDVALUE(Calisanlar[CalisanNo]))
        RETURN COUNTROWS(FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], K)))
)`,
    hint: `ADDCOLUMNS(CALCULATETABLE(VALUES(Calisanlar[AdSoyad]), Calisanlar[Seviye] = 2), "Ekip Satışı", VAR K = CALCULATE(SELECTEDVALUE(Calisanlar[CalisanNo])) RETURN ..., "Kişi", ...). Elif Doğan için 6 kişi.` },
  { t: 'mc',
    q: `Organizasyon matrisinde Satış Müdürü'nün altında "(Boş)" adlı bir satır ve 183 bin ₺ görünüyor; kullanıcılar bunun kim olduğunu soruyor. En uygun çözüm hangisi?`,
    o: [
      `Matristeki boş değerleri filtre bölmesinden gizlemek`,
      `Boş düzeyi "Ad (kendi satışı)" etiketiyle doldurmak`,
      `Müdürün satışlarını bir temsilciye aktarmak`,
      `PATHITEM'in dönüş türünü metne çevirmek`
    ], a: 1,
    why: `Boş satır, müdürün kendi satışıdır; hiyerarşi onun için bir düzey erken biter. Etiketle doldurmak tutarı adı olan bir satıra koyar. Filtreyle gizlemek tutarı alt satırlardan siler ve alt toplamlar tutmaz görünür. Satışı başkasına aktarmak veriyi bozar. Dönüş türü bu boşluğu açıklamaz.` },
  { t: 'mc',
    q: `RLS her çalışanı kendi alt ağacıyla sınırlıyor. Bir temsilci, [Ekip Satışı] içindeki <code>FILTER(ALL(Calisanlar), ...)</code> sayesinde şirket toplamını görebileceğinden endişeleniyor. Doğru açıklama hangisi?`,
    o: [
      `ALL tüm filtreleri kaldırır; RLS'yi de aşar, ölçüyü değiştirmek gerekir`,
      `ALL yalnızca rapor filtrelerini kaldırır; RLS'nin gizlediği satırlar görünmez`,
      `ALL, RLS'yi yalnızca toplam satırında aşar; ISINSCOPE eklenmeli`,
      `RLS yalnızca boyut tablolarını süzer; Satislar'a ulaşmaz`
    ], a: 1,
    why: `RLS filtreleri modelin görebildiği satırları baştan sınırlar; DAX içindeki ALL ya da REMOVEFILTERS bu satırları geri getiremez. Temsilci yalnızca kendi satırını görür. RLS boyut tablosunda tanımlansa da ilişkiler üzerinden olgu tablosuna yayılır.` },
  { t: 'mc',
    q: `Departman → Çalışan matrisinde çalışan satırları alt ağaç satışını gösteriyor. Finans, Satış departmanı satırının (1,25 milyon ₺) çalışan satırlarının toplamından (2,32 milyon ₺) neden küçük olduğunu soruyor. Ne yaparsın?`,
    o: [
      `Alt ağaç ölçüsünü HASONEVALUE ile yeniden yazarım`,
      `Departman satırını da alt ağaç toplamına çeviririm`,
      `Matrisi düzleştirip alt toplamları kapatırım`,
      `Ölçüyü "alt ağaç" diye adlandırıp satırların toplanmadığını not ederim`
    ], a: 3,
    why: `Departman toplamı doğrudur; çalışan satırları örtüşür (müdürün satırı ekibini de içerir), bu yüzden toplanmaz. Doğru iş, ölçünün anlamını adında ve notta açıkça söylemektir. HASONEVALUE durumu değiştirmez. Departmanı da alt ağaç yapmak satışları çift sayar. Alt toplamları kapatmak soruyu ortadan kaldırmaz, bilgiyi saklar.` }
] });

/* ───────────────────────── 7. ZAMAN (İLERİ) ───────────────────────── */
ext('zaman-ileri', { min: 22, html: `
<h2>Kümülatif toplam: "nereden başlıyor?" sorusu</h2>
<p>Satış direktörü 2024 dilimleyicisini seçip kümülatif grafiğe bakıyor; Ocak 2024 noktası 551.139,60 ₺. "Ocak'ta bu kadar satmadık" diyor. Haklı: [Kümülatif Satış] verinin başından (Haziran 2022) sayıyor. Hangi başlangıç istendiğini önceden sor:</p>
<div class="tbl-wrap"><table>
<tr><th>Başlangıç</th><th>Filtre</th><th>Ocak 2024 (2024 seçili)</th></tr>
<tr><td>Verinin başı</td><td><code>FILTER(ALL(Tarih[Tarih]), Tarih[Tarih] &lt;= MAX(Tarih[Tarih]))</code></td><td>551.139,60</td></tr>
<tr><td>Seçimin başı</td><td><code>FILTER(ALLSELECTED(Tarih[Tarih]), Tarih[Tarih] &lt;= MAX(Tarih[Tarih]))</code></td><td>47.432,85</td></tr>
<tr><td>Yılın başı</td><td><code>DATESYTD(Tarih[Tarih])</code></td><td>47.432,85</td></tr>
</table></div>
<p>İkinci ve üçüncü satır burada aynıdır, ama kullanıcı dilimleyicide Mart–Haziran seçerse ayrışır: seçimin başı Mart'tan, yıl başı Ocak'tan sayar. Mekanizma: ALL(Tarih[Tarih]) tarih tablosundaki tüm filtreleri kaldırır (tablo tarih tablosu olarak işaretli olduğu için); ALLSELECTED yalnızca görselin kendi satırlarından gelenleri kaldırır, dilimleyiciyi bırakır.</p>
<p>Kenar durum: Tarih tablosu verinin bittiği günden sonra da devam ediyorsa (ör. yıl sonuna kadar), kümülatif çizgi gelecek aylarda düz bir çizgi olarak sürer. Son satış tarihinden sonraki dönemlerde ölçüyü boş döndür.</p>

<h2>Hareketli toplamlar ve eksik geçmiş</h2>
<p>"Son 12 ay" ölçüsü Aralık 2022'de 102.837,20 ₺ gösterir. Ama veri 22 Haziran 2022'de başladığı için bu sayı aslında 6 ay 9 günün toplamıdır. Grafikte bu nokta, gerçek 12 aylık değerlerin yanında "düşüş" gibi görünür. Doğru davranış, pencere tam dolmadıkça boş döndürmektir:</p>
<pre class="dax">Tam 12 Ay Hareketli =
VAR Son = MAX(Tarih[Tarih])
VAR IlkSatis = CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS(Tarih))
VAR PencereBas = EDATE(Son, -12) + 1
RETURN
    IF(
        IlkSatis &lt;= PencereBas,
        CALCULATE([Net Satış], DATESINPERIOD(Tarih[Tarih], Son, -12, MONTH))
    )</pre>
<p>Yıl kırılımında 2022 boş, 2023 400.869,55 ₺, 2024 747.065,70 ₺ döner. IlkSatis ifadesi REMOVEFILTERS(Tarih) ile yalnızca tarih filtresini kaldırır; kategori filtresi kalır. Böylece sonradan satışa başlayan bir kategori kendi başlangıç tarihine göre değerlendirilir.</p>

<h2>Dönem başı ve sonu: yarı toplanabilir değerler</h2>
<p>StokGorunum her ayın son gününde alınmış anlık görüntülerdir (36 tarih × 40 ürün). Stok adedini yıllar boyunca toplamak anlamsızdır:</p>
<div class="tbl-wrap"><table>
<tr><th>2024 için</th><th>İfade</th><th>Değer</th></tr>
<tr><td>Düz toplam (yanlış)</td><td><code>SUM(StokGorunum[StokAdet])</code></td><td>4.183</td></tr>
<tr><td>Dönem sonu</td><td><code>CLOSINGBALANCEYEAR(SUM(...), Tarih[Tarih])</code></td><td>311</td></tr>
<tr><td>Dönem başı</td><td><code>OPENINGBALANCEYEAR(SUM(...), Tarih[Tarih])</code></td><td>309 (31 Aralık 2023)</td></tr>
</table></div>
<p>LASTDATE ve CLOSINGBALANCE fonksiyonları burada çalışıyor, çünkü görüntüler tam ay sonunda alınmış. Görüntü haftanın belirli bir gününde alınıyorsa ya da son gün eksikse, dönemin son günü boş döner ve stok sıfır gibi görünür. Bu durumda "dönemdeki son görüntü tarihini bul" kalıbı ([Stok Adedi] ölçüsü) daha sağlamdır. Açılış ile kapanış arasındaki fark, dönemdeki net stok değişimidir: 2023'te −16, 2024'te +2 adet.</p>

<h2>Tarih tablosu sorunları</h2>
<p>En sık görülen hata, zaman zekâsını olgu tablosunun tarih sütunuyla yazmaktır:</p>
<pre class="dax">GY (Olgu Tarihiyle) =
CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Satislar[Tarih]))</pre>
<p>Bu ölçü her ay satırında boş, toplam satırında 376.747,20 ₺ gösterir; ikisi de yanlıştır. Neden? Satislar[Tarih] yalnızca satış olan günleri içerir ve bu sütundaki filtre, Tarih tablosundaki ay filtresini kaldırmaz. Kaydırılmış tarihlerle ay filtresinin kesişimi boştur. Toplamda ay filtresi olmadığı için "satış olan günlerin bir yıl öncesi" toplanır: anlamsız bir sayı. Doğru yazım [Satış GY]: <code>SAMEPERIODLASTYEAR(Tarih[Tarih])</code>.</p>
<ul>
<li><b>Kesintisiz olmalı:</b> Bu modelde Tarih 1.096 satır ve ilk ile son gün arası 1.096 gün; eksik gün yok. Satış Haziran 2022'de başlasa da tablo yılın başından başlar; zaman zekâsı tam yılları ister.</li>
<li><b>Tarih tablosu olarak işaretle:</b> İşaret yoksa Tarih[Tarih] filtresi diğer tarih sütunlarındaki filtreleri kaldırmaz ve ALL/REMOVEFILTERS eklemen gerekir.</li>
<li><b>Otomatik tarih/saat (Auto date/time) kapalı:</b> Her tarih sütunu için gizli tablo üretir, modeli büyütür ve ekip içinde farklı hiyerarşiler kullanılmasına yol açar.</li>
<li><b>Kapsam kontrolü:</b> <code>COUNTROWS(FILTER(Satislar, ISBLANK(RELATED(Tarih[Yil]))))</code> tarih tablosunun dışında kalan satış satırlarını sayar; bu modelde 0.</li>
</ul>

<h2>Mali yıl (Temmuz başlangıçlı) YTD</h2>
<p>Finans mali yılı 1 Temmuz'da başlatıyor. Standart yol TOTALYTD'nin yıl sonu bağımsız değişkenidir:</p>
<pre class="dax">Mali YTD (TOTALYTD) =
TOTALYTD([Net Satış], Tarih[Tarih], "6/30")</pre>
<p>Microsoft Learn bu dizenin, modelin oluşturulduğu istemcinin bölgesel ayarına göre yorumlandığını belirtiyor ve "ay/gün" biçimini öneriyor. Türkçe bölgesel ayarlı makinelerle çalışan bir ekipte bu bir belirsizlik kaynağıdır. Bu uygulamanın motoru dizeyi her zaman ay/gün olarak okur, ama paylaşılan bir modelde bu güvenceye yaslanamazsın. Bölgesel ayardan bağımsız, açık bir yazım:</p>
<pre class="dax">Mali YTD (Açık) =
VAR Son = MAX(Tarih[Tarih])
VAR MaliBas = DATE(YEAR(Son) - IF(MONTH(Son) &lt; 7, 1, 0), 7, 1)
RETURN CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], MaliBas, Son))</pre>
<div class="tbl-wrap"><table>
<tr><th>Ay</th><th>Takvim YTD</th><th>Mali YTD</th></tr>
<tr><td>Haziran 2024</td><td>300.492,75</td><td>546.898,75 (Temmuz 2023 – Haziran 2024)</td></tr>
<tr><td>Temmuz 2024</td><td>361.440,75</td><td>60.948,00 (yeni mali yıl)</td></tr>
<tr><td>Aralık 2024</td><td>747.065,70</td><td>446.572,95</td></tr>
</table></div>
<p>Eksen için Tarih tablosuna Power Query'de bir mali yıl sütunu ekle. Adlandırma kuralını (mali yıl, bittiği takvim yılıyla mı anılıyor?) finansla yazılı olarak kararlaştır:</p>
<pre class="m">= Table.AddColumn(Kaynak, "MaliYil", each if Date.Month([Tarih]) &gt;= 7 then Date.Year([Tarih]) + 1 else Date.Year([Tarih]), Int64.Type)</pre>
<p>Mali yılın önceki yıl karşılaştırması için açık yazımı <code>CALCULATE([Mali YTD (Açık)], SAMEPERIODLASTYEAR(Tarih[Tarih]))</code> ile sarmak yeterlidir. Mali takvimi takvim nesnesiyle tanımlamak ayrı bir konudur; Takvim tabanlı zaman zekâsı dersinde ele alınır.</p>

<h2>İki tarih aralığını karşılaştırmak</h2>
<p>Pazarlama, sayfada iki ayrı tarih dilimleyicisi istiyor: "kampanya dönemi" ve "karşılaştırma dönemi". Tek Tarih tablosuyla iki bağımsız seçim yapılamaz. Desen:</p>
<ol>
<li>İlişkisiz ikinci bir tarih tablosu oluştur: <code>KarsilastirmaTarih = CALENDAR(DATE(2022, 1, 1), DATE(2024, 12, 31))</code>. Modelde hiçbir tabloya bağlama.</li>
<li>Ana dilimleyici Tarih[Tarih]'i, ikinci dilimleyici KarsilastirmaTarih[Tarih]'i kullanır.</li>
<li>Karşılaştırma ölçüsü ikinci tablonun seçimini okur ve Tarih'e uygular:</li>
</ol>
<pre class="dax" data-notry>Karşılaştırma Dönemi Satışı =
VAR Bas = MIN(KarsilastirmaTarih[Tarih])
VAR Bit = MAX(KarsilastirmaTarih[Tarih])
RETURN CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], Bas, Bit))</pre>
<p>DATESBETWEEN, işaretli tarih tablosunun Tarih sütununa filtre koyduğu için ana dilimleyicinin seçimini geçersiz kılar. Örnek: Mart–Mayıs 2024 satışı 143.723,65 ₺, Mart–Mayıs 2023 ise 74.307,45 ₺; artış %93,4. İki aralık da 92 gün olduğu için doğrudan karşılaştırılabilir.</p>
<ul>
<li><b>Farklı uzunluk:</b> 30 gün ile 45 günü karşılaştırıyorsan günlük ortalamaya çevir.</li>
<li><b>Eksen tuzağı:</b> Grafikte ay ekseni ana Tarih'ten gelir; karşılaştırma ölçüsü her ayda aynı toplamı gösterir. Bu desen kartlar ve tablolar için uygundur; çizgi grafikte "dönemin kaçıncı günü" gibi ortak bir eksen gerekir.</li>
<li><b>Varsayılan:</b> İkinci dilimleyicide seçim yoksa MIN ve MAX tüm tabloyu kapsar. Başlıkta seçili aralığı ölçüyle yazdır.</li>
</ul>

<h2>Kontrol listesi</h2>
<ol>
<li>Kümülatif hangi günden başlıyor: veri, seçim, yıl?</li>
<li>Hareketli pencerede eksik geçmiş boş mu gösteriliyor?</li>
<li>Stok gibi değerler dönem sonu/başı ile mi alınıyor? Görüntü tarihleri dönem sonuna denk geliyor mu?</li>
<li>Zaman zekâsı Tarih[Tarih] ile mi yazıldı? Tablo işaretli, kesintisiz mi?</li>
<li>Mali yıl tanımı ve adlandırma kuralı finansla yazılı mı?</li>
<li>İki dönem karşılaştırmasında uzunluklar eşit mi, eksen anlamlı mı?</li>
</ol>
`, ex: [
  { t: 'dax', name: 'Mali YTD Satış',
    q: `<b>Mali YTD Satış</b>: Mali yıl 1 Temmuz'da başlıyor. Görünen dönemin son gününe kadar, içinde bulunulan mali yılın başından itibaren net satış. Mali yıl başını DATE ile hesapla, DATESBETWEEN ile uygula.`,
    sol: `VAR Son = MAX(Tarih[Tarih])
VAR MaliBas = DATE(YEAR(Son) - IF(MONTH(Son) < 7, 1, 0), 7, 1)
RETURN CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], MaliBas, Son))`,
    hint: `Ay 7'den küçükse mali yıl geçen yılın 1 Temmuz'unda başlar: DATE(YEAR(Son) - IF(MONTH(Son) < 7, 1, 0), 7, 1). 2024 satırında 446.572,95 çıkmalı.` },
  { t: 'dax', name: 'Tam 12 Ay Hareketli Toplam',
    q: `<b>Tam 12 Ay Hareketli Toplam</b>: Görünen dönemin son gününden geriye 12 aylık net satış; ama yalnızca ilk satış tarihi (tarih filtreleri kaldırılarak) pencerenin başlangıcından önce ya da aynı günse. Aksi hâlde boş döndür.`,
    sol: `VAR Son = MAX(Tarih[Tarih])
VAR IlkSatis = CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS(Tarih))
VAR PencereBas = EDATE(Son, -12) + 1
RETURN IF(IlkSatis <= PencereBas, CALCULATE([Net Satış], DATESINPERIOD(Tarih[Tarih], Son, -12, MONTH)))`,
    hint: `Pencere başı EDATE(Son, -12) + 1. İlk satış: CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS(Tarih)). 2022 satırı boş, 2023 satırı 400.869,55 olmalı.` },
  { t: 'dax', name: 'Dönem Stok Farkı (Açılış-Kapanış)',
    q: `<b>Dönem Stok Farkı (Açılış-Kapanış)</b>: Dönemin son günündeki stok adedi (LASTDATE ile) eksi dönem başlamadan önceki günün stok adedi (SUM(StokGorunum[StokAdet])). Açılış stoğu yoksa boş döndür.`,
    sol: `VAR Bas = MIN(Tarih[Tarih])
VAR Kapanis = CALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))
VAR Acilis = CALCULATE(SUM(StokGorunum[StokAdet]), REMOVEFILTERS(Tarih), Tarih[Tarih] = Bas - 1)
RETURN IF(NOT ISBLANK(Acilis), Kapanis - Acilis)`,
    hint: `Açılış: CALCULATE(SUM(StokGorunum[StokAdet]), REMOVEFILTERS(Tarih), Tarih[Tarih] = Bas - 1). 2023 satırında −16 çıkmalı.`,
    grid: [{ t: 'Tarih', c: 'YilAy' }, { t: 'Tarih', c: 'Yil' }], noTotal: true },
  { t: 'query',
    q: `Pazarlama iki bahar dönemini karşılaştırıyor. Tek satırda Mart–Mayıs 2024 net satışını ("Bahar 2024"), Mart–Mayıs 2023 net satışını ("Bahar 2023") ve değişim oranını ("Değişim %") döndür. Aralıkları DATESBETWEEN ile ver.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
VAR B24 = CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024, 3, 1), DATE(2024, 5, 31)))
VAR B23 = CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2023, 3, 1), DATE(2023, 5, 31)))
RETURN ROW("Bahar 2024", B24, "Bahar 2023", B23, "Değişim %", DIVIDE(B24 - B23, B23))`,
    hint: `EVALUATE VAR B24 = ... VAR B23 = ... RETURN ROW("Bahar 2024", B24, "Bahar 2023", B23, "Değişim %", DIVIDE(B24 - B23, B23)). Değişim yaklaşık %93,4.` },
  { t: 'mc',
    q: `Bir raporda geçen yıl ölçüsü <code>CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Satislar[Tarih]))</code> olarak yazılmış. Ay satırları boş, toplam satırı ise bir sayı gösteriyor. Ne yaparsın?`,
    o: [
      `Ölçüyü Tarih[Tarih] sütunuyla yeniden yazarım`,
      `Satislar[Tarih] ile Tarih arasındaki ilişkiyi çift yönlü yaparım`,
      `Toplam satırını ISINSCOPE ile gizlerim`,
      `SAMEPERIODLASTYEAR yerine DATEADD(..., -12, MONTH) yazarım`
    ], a: 0,
    why: `Olgu tablosunun tarih sütunu yalnızca satış olan günleri içerir ve bu sütundaki filtre Tarih tablosundaki ay filtresini kaldırmaz; ay satırlarında kesişim boştur, toplamdaki sayı da anlamsızdır. Zaman zekâsı kesintisiz ve işaretli tarih tablosunun sütunuyla yazılmalı. Çift yönlü ilişki ve DATEADD aynı yanlış sütunu kullanır; toplamı gizlemek ay satırlarını düzeltmez.` },
  { t: 'mc',
    q: `Pazarlama sayfada iki bağımsız tarih dilimleyicisi istiyor: biri kampanya dönemi, biri karşılaştırma dönemi. Hangi model tasarımı doğru?`,
    o: [
      `Tarih tablosuna ikinci bir pasif ilişki eklemek`,
      `Aynı Tarih sütunuyla iki dilimleyici koyup birini düzenlemek`,
      `Satislar'da ikinci bir tarih sütunu oluşturmak`,
      `İlişkisiz ikinci bir tarih tablosu ve onu okuyan bir ölçü`
    ], a: 3,
    why: `Aynı tablodaki iki dilimleyici birbirini süzer; bağımsız seçim için ilişkisiz ikinci bir tarih tablosu gerekir. Ölçü bu tablonun MIN/MAX değerini okur ve DATESBETWEEN ile Tarih'e uygular. Pasif ilişki ve ikinci tarih sütunu farklı bir olayın (ör. teslim) tarihi içindir, ikinci bir seçim için değil.` },
  { t: 'mc',
    q: `Ekipten biri Türkçe bölgesel ayarlı bilgisayarında mali YTD'yi <code>TOTALYTD([Net Satış], Tarih[Tarih], "30/6")</code> olarak yazdı; başka bir analistin dosyasında sonuçlar tutarsız. En sağlam çözüm hangisi?`,
    o: [
      `Dizeyi "6/30" yapıp herkesin bölgesel ayarını İngilizceye çevirmek`,
      `Mali yıl başını DATE ile hesaplayan açık bir ölçü yazmak`,
      `TOTALYTD yerine TOTALQTD kullanıp çeyrekleri toplamak`,
      `Yıl sonu dizesini "Haziran 30" biçiminde yazmak`
    ], a: 1,
    why: `Microsoft Learn'e göre yıl sonu dizesi modelin oluşturulduğu istemcinin bölgesel ayarına göre yorumlanır. Mali yıl başını DATE ve DATESBETWEEN ile açıkça hesaplamak bu belirsizliği tamamen kaldırır. Bölgesel ayarı herkese dayatmak kırılgandır; çeyrek toplamı mali yılla hizalanmaz; yerel ay adları da aynı yorumlama sorununu taşır.` }
] });

/* ───────────────────────── 8. İSTATİSTİK (İLERİ) ───────────────────────── */
ext('istatistik-ileri', { min: 22, html: `
<h2>Aykırı değer: hangi ölçüt?</h2>
<p>Finans "olağandışı büyük siparişleri" işaretlemek istiyor. Önce dağılıma bak. İptal edilmemiş 838 siparişin net tutarları:</p>
<div class="tbl-wrap"><table>
<tr><th>İstatistik</th><th>Değer (₺)</th><th>DAX</th></tr>
<tr><td>Ortalama</td><td>1.492,57</td><td><code>AVERAGEX(T, [S])</code></td></tr>
<tr><td>Medyan</td><td>1.086,50</td><td><code>MEDIANX(T, [S])</code></td></tr>
<tr><td>1. çeyrek (P25)</td><td>646,00</td><td><code>PERCENTILEX.INC(T, [S], 0.25)</code></td></tr>
<tr><td>3. çeyrek (P75)</td><td>1.792,00</td><td><code>PERCENTILEX.INC(T, [S], 0.75)</code></td></tr>
<tr><td>P95</td><td>3.969,73</td><td><code>PERCENTILEX.INC(T, [S], 0.95)</code></td></tr>
<tr><td>En büyük</td><td>12.335,45</td><td><code>MAXX(T, [S])</code></td></tr>
</table></div>
<p>Ortalama medyandan belirgin biçimde büyük: dağılım sağa çarpık. Birkaç büyük sipariş ortalamayı yukarı çekiyor. Bu durumda iki yaygın yöntem farklı sonuç verir:</p>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Eşik</th><th>Aykırı sipariş</th></tr>
<tr><td>IQR: Ç3 + 1,5 × (Ç3 − Ç1)</td><td>3.511 ₺</td><td>57 (%6,8)</td></tr>
<tr><td>|z| &gt; 3 (örneklem standart sapması 1.463,19)</td><td>yaklaşık 5.882 ₺</td><td>22</td></tr>
<tr><td>|z| &gt; 2</td><td>yaklaşık 4.419 ₺</td><td>33</td></tr>
</table></div>
<pre class="dax">Aykırı Eşiği (IQR) =
VAR T = FILTER(ADDCOLUMNS(VALUES(Satislar[SiparisNo]), "S", [Net Satış]), NOT ISBLANK([S]))
VAR Q1 = PERCENTILEX.INC(T, [S], 0.25)
VAR Q3 = PERCENTILEX.INC(T, [S], 0.75)
RETURN Q3 + 1.5 * (Q3 - Q1)</pre>
<p>Z-skoru simetrik, normale yakın bir dağılım varsayar; para tutarları neredeyse hiç böyle değildir. Çarpık verilerde IQR ya da logaritma üzerinde z-skoru daha savunulabilirdir. Asıl üretim dersi şu: IQR'a göre aykırı olan 57 sipariş toplam 327.447 ₺ ediyor, yani net satışın %26,2'si. "Aykırıları çıkaralım" demek gelirin dörtte birini raporlardan silmek demektir. Aykırıyı silme, işaretle; ayrı bir sütunda ya da renkle göster.</p>

<h2>Z-skoru: eğilimli seride yanılgı</h2>
<p>Satış olan 31 ayın ortalaması 40.347,50 ₺, popülasyon standart sapması 23.535,82 ₺. Aralık 2024 (94.000,95 ₺) için z = 2,28; ana bölümdeki [Z-Skoru] ölçüsü bu ayı "aykırı" işaretler. Ama seri güçlü bir eğilim taşıyor: ay sırası ile satış arasındaki korelasyon 0,92. Eğilimi olan bir seride son aylar doğal olarak yüksek, ilk aylar doğal olarak düşüktür. Önce eğilimi çıkar, z-skorunu kalıntılara uygula (eğilim bölümündeki yöntem).</p>
<ul>
<li><b>Eksik dönem:</b> En düşük ay Haziran 2022 (595 ₺); yalnızca 9 günlük veri içerir. Kısmi dönemler aykırı değil, eksik veridir. Analizden çıkar ya da gün başına çevir.</li>
<li><b>Aynı seri, IQR ile:</b> Aylık seride üst eşik 107.714,94 ₺; hiçbir ay aykırı değil. Yöntem seçimi sonucu belirler; raporda yöntemi yaz.</li>
<li><b>STDEV.S mi STDEV.P mi?</b> Dönemin bütün aylarını betimliyorsan popülasyon (P); bu aylardan gelecek hakkında çıkarım yapıyorsan örneklem (S). Burada 23.535,82 ile 23.924,87: n = 31'de fark küçük, n = 5'te büyük olur.</li>
</ul>

<h2>Korelasyon: sayının arkasındaki n</h2>
<p>İK direktörü soruyor: "Temsilci maaşı ile satış arasında ilişki var mı?" Altı temsilci için DAX ile hesaplanan korelasyon −0,12; kıdem ile satış arasında −0,24. Yorum yapmadan önce n'e bak: altı gözlemle %5 düzeyinde anlamlı sayılmak için |r| yaklaşık 0,81'i geçmelidir. Bu sayılar "ilişki yok" bile demez; "bu veriyle bir şey söylenemez" der.</p>
<pre class="dax">Maaş–Satış Korelasyonu =
VAR T =
    ADDCOLUMNS(
        FILTER(Calisanlar, NOT ISBLANK([Net Satış])),
        "X", Calisanlar[Maas],
        "Y", [Net Satış]
    )
VAR MX = AVERAGEX(T, [X])
VAR MY = AVERAGEX(T, [Y])
VAR Kov = SUMX(T, ([X] - MX) * ([Y] - MY))
VAR SX = SQRT(SUMX(T, ([X] - MX) ^ 2))
VAR SY = SQRT(SUMX(T, ([Y] - MY) ^ 2))
RETURN DIVIDE(Kov, SX * SY)</pre>
<p>Üç üretim tuzağı:</p>
<ul>
<li><b>Boşlar sıfır sayılır:</b> Ana bölümdeki fiyat–adet korelasyonu 40 ürünün hepsini kullanır ve −0,52 verir. Hiç satılmamış 2 ürünün adedi BLANK'tir; AVERAGEX onu atlar ama <code>[Y] - MY</code> aritmetiğinde BLANK sıfır gibi davranır. Bu ürünler çıkarılınca sonuç −0,60 olur. Satır kümesini önce <code>NOT ISBLANK</code> ile temizle.</li>
<li><b>Eğilim sahte korelasyon üretir:</b> Zamanla büyüyen iki seri (satış ve çalışan sayısı, satış ve reklam harcaması) neredeyse her zaman yüksek korelasyon verir. Satışın ay sırasıyla korelasyonu 0,92'dir; büyüyen başka her şeyle de yüksek çıkar. Karşılaştırmayı değişimler (ay farkları) üzerinde yap.</li>
<li><b>n'yi ölçünün yanında göster:</b> "r = −0,24 (n = 6)" yazmak, okuyucuyu yanlış karardan korur.</li>
</ul>

<h2>Güven aralığı yaklaşımı</h2>
<p>Satış müdürü: "Ortalama sepet 2023'te 1.411,51 ₺ idi, 2024'te 1.515,35 ₺ oldu; %7,4 büyüdük." Bu fark gerçek mi, yoksa sipariş tutarlarındaki doğal dalgalanma mı? Büyük örneklemde ortalamanın yaklaşık %95 güven aralığı: ortalama ± 1,96 × s / √n.</p>
<div class="tbl-wrap"><table>
<tr><th>Yıl</th><th>n</th><th>Ortalama</th><th>Hata payı</th><th>Aralık</th></tr>
<tr><td>2023</td><td>284</td><td>1.411,51</td><td>± 148,86</td><td>1.262,66 – 1.560,37</td></tr>
<tr><td>2024</td><td>493</td><td>1.515,35</td><td>± 134,42</td><td>1.380,93 – 1.649,76</td></tr>
</table></div>
<p>Aralıklar büyük ölçüde örtüşüyor. Örtüşme kesin bir test değildir, ama "%7,4 büyüme" cümlesinin gürültü olabileceği konusunda güçlü bir uyarıdır. Oranlar için aynı yaklaşım: p ± 1,96 × √(p(1 − p) / n).</p>
<div class="tbl-wrap"><table>
<tr><th>Destek kanalı</th><th>CSAT</th><th>n</th><th>Hata payı</th></tr>
<tr><td>Canlı destek</td><td>%82,7</td><td>52</td><td>± 10,3 puan</td></tr>
<tr><td>Telefon</td><td>%80,0</td><td>45</td><td>± 11,7 puan</td></tr>
<tr><td>Sosyal medya</td><td>%73,3</td><td>15</td><td>± 22,4 puan</td></tr>
<tr><td>E-posta</td><td>%56,3</td><td>48</td><td>± 14,0 puan</td></tr>
</table></div>
<p>E-posta ile canlı destek arasındaki fark aralıkları aşar; büyük olasılıkla gerçektir. Sosyal medyanın %73,3'ü ise yalnızca 15 değerlendirmeye dayanır ve %51 ile %96 arasında herhangi bir yerde olabilir. Bu kanal için karar vermek erken.</p>
<div class="warn"><b>n'yi yanlış bağlamda saymak</b>Kanal satırlı bir tabloda n'yi <code>COUNT(Talepler[Memnuniyet])</code> ile ADDCOLUMNS içinde CALCULATE olmadan hesaplarsan her kanalda 160 (tüm değerlendirmeler) çıkar ve hata payı olduğundan küçük görünür: canlı destek için ± 10,3 yerine ± 5,9 puan. Sahte bir kesinlik üretir. n her zaman CALCULATE içinde, satırın bağlamında sayılmalı.</div>

<h2>İstatistiksel anlamlılık yanılgıları</h2>
<ul>
<li><b>Çoklu karşılaştırma:</b> 7 kategori × 12 ay = 84 hücreyi tarayıp "anlamlı" fark ararsan, %5 düzeyinde yalnızca tesadüfen yaklaşık 4 hücre anlamlı çıkar. Önce hipotezi koy, sonra veriye bak.</li>
<li><b>Dilimleyiciyle kesit avı:</b> Dilimleyicileri çevirip "farkın göründüğü" kesiti bulmak aynı hatanın etkileşimli hâlidir.</li>
<li><b>Anlamlı ≠ önemli:</b> Milyonlarca satırda 0,1 puanlık fark istatistiksel olarak anlamlı olabilir ama iş açısından önemsizdir. Etki büyüklüğünü (fark ₺ ya da puan) her zaman yanında yaz.</li>
<li><b>Küçük gruplar:</b> İade oranı Elektronik'te %3,6 (± 2,3), Kitap'ta %8,0 (± 2,7): fark büyük olasılıkla gerçek. Hediye'de %5,1, ama 39 satışla ± 6,9 puan; hiçbir şey söylenemez.</li>
<li><b>Korelasyon ≠ nedensellik:</b> İndirimli satış payı ile satış birlikte artıyorsa, indirim satışı artırmış olabilir; ya da yoğun sezonda hem indirim hem satış artmıştır.</li>
</ul>

<h2>Kontrol listesi</h2>
<ol>
<li>Dağılım çarpık mı? Ortalama yerine medyan ve çeyrekler daha mı açıklayıcı?</li>
<li>Aykırı değer yöntemi raporda yazılı mı? Aykırılar siliniyor mu, işaretleniyor mu?</li>
<li>Seri eğilimli mi? Z-skoru eğilimden arındırılmış değerlere mi uygulanıyor?</li>
<li>Korelasyon ve oranların yanında n görünüyor mu? Boşlar temizlendi mi?</li>
<li>Karşılaştırmada güven aralığı ya da en azından hata payı var mı?</li>
<li>Analiz bir hipotezle mi başladı, yoksa çok sayıda kesit taranarak mı bulundu?</li>
</ol>
`, ex: [
  { t: 'dax', name: 'Sipariş Tutarı IQR',
    q: `<b>Sipariş Tutarı IQR</b>: İptal edilmemiş siparişlerin (VALUES(Satislar[SiparisNo]), net satışı boş olmayanlar) net tutarlarında çeyrekler açıklığı: P75 − P25 (PERCENTILEX.INC).`,
    sol: `VAR T = FILTER(ADDCOLUMNS(VALUES(Satislar[SiparisNo]), "S", [Net Satış]), NOT ISBLANK([S]))
RETURN PERCENTILEX.INC(T, [S], 0.75) - PERCENTILEX.INC(T, [S], 0.25)`,
    hint: `Sipariş tablosunu VAR'a al; PERCENTILEX.INC(T, [S], 0.75) - PERCENTILEX.INC(T, [S], 0.25). Toplamda 1.146 çıkmalı.` },
  { t: 'dax', name: 'Aykırı Sipariş Sayısı (IQR)',
    q: `<b>Aykırı Sipariş Sayısı (IQR)</b>: Net tutarı Ç3 + 1,5 × (Ç3 − Ç1) eşiğini aşan sipariş sayısı. Siparişler: VALUES(Satislar[SiparisNo]), net satışı boş olmayanlar.`,
    sol: `VAR T = FILTER(ADDCOLUMNS(VALUES(Satislar[SiparisNo]), "S", [Net Satış]), NOT ISBLANK([S]))
VAR Q1 = PERCENTILEX.INC(T, [S], 0.25)
VAR Q3 = PERCENTILEX.INC(T, [S], 0.75)
VAR Ust = Q3 + 1.5 * (Q3 - Q1)
RETURN COUNTROWS(FILTER(T, [S] > Ust))`,
    hint: `Eşik bağlama göre (kategori, yıl) yeniden hesaplanır. Toplamda 57 çıkmalı.` },
  { t: 'dax', name: 'Sepet Ortalaması Hata Payı',
    q: `<b>Sepet Ortalaması Hata Payı</b>: Sipariş tutarlarının ortalaması için yaklaşık %95 hata payı: 1,96 × örneklem standart sapması / √n. Siparişler net satışı boş olmayanlar; n 30'dan küçükse boş döndür.`,
    sol: `VAR T = FILTER(ADDCOLUMNS(VALUES(Satislar[SiparisNo]), "S", [Net Satış]), NOT ISBLANK([S]))
VAR N = COUNTROWS(T)
RETURN IF(N >= 30, 1.96 * STDEVX.S(T, [S]) / SQRT(N))`,
    hint: `STDEVX.S(T, [S]) örneklem standart sapması; n = COUNTROWS(T). 2024 satırında yaklaşık 134,42.` },
  { t: 'query',
    q: `Her destek kanalı (Talepler[Kanal]) için CSAT oranını ("CSAT", [CSAT %]), değerlendirme sayısını ("N") ve yaklaşık %95 hata payını ("Hata Payı" = 1,96 × √(p(1 − p) / N)) döndür. N'yi kanalın bağlamında saymak için CALCULATE(COUNT(Talepler[Memnuniyet])) kullan.`,
    start: 'EVALUATE\n',
    sol: `EVALUATE
ADDCOLUMNS(
    VALUES(Talepler[Kanal]),
    "CSAT", [CSAT %],
    "N", CALCULATE(COUNT(Talepler[Memnuniyet])),
    "Hata Payı",
        VAR P = [CSAT %]
        VAR N = CALCULATE(COUNT(Talepler[Memnuniyet]))
        RETURN 1.96 * SQRT(P * (1 - P) / N)
)`,
    hint: `CALCULATE olmadan COUNT her kanalda 160 verir ve hata payı yapay olarak küçülür. Sosyal medya için N = 15.` },
  { t: 'mc',
    q: `Finans, aykırı siparişleri z-skoru (|z| &gt; 3) ile bulmak istiyor. Sipariş tutarlarında ortalama 1.493 ₺, medyan 1.087 ₺. Ne önerirsin?`,
    o: [
      `Z-skorunu ortalama yerine medyanla hesaplamayı`,
      `Çarpık dağılım için IQR yöntemini ve aykırıları işaretlemeyi`,
      `Eşiği |z| &gt; 1 yapıp daha çok siparişi yakalamayı`,
      `Aykırıları kaldırıp ortalamayı yeniden hesaplamayı`
    ], a: 1,
    why: `Ortalamanın medyandan çok büyük olması sağa çarpıklığı gösterir; z-skoru simetrik dağılım varsayar. IQR çarpıklığa daha dayanıklıdır. Aykırılar işaretlenmeli, silinmemeli: bu veride IQR aykırıları net satışın %26'sı. Medyanla z-skoru standart sapmanın çarpıklığını düzeltmez; |z| &gt; 1 olağan siparişleri de aykırı sayar.` },
  { t: 'mc',
    q: `İK, altı temsilcinin verisiyle "kıdem ile satış arasında r = −0,24; kıdemli temsilciler daha az satıyor" sonucunu sunmak istiyor. Ne dersin?`,
    o: [
      `n = 6 ile bu r anlamlı değil; sonuç çıkarılamaz`,
      `Negatif r olduğu için kıdemli temsilciler daha az satıyor`,
      `r'nin karesini alıp %6 etki olarak sunmak gerekir`,
      `Korelasyonu STDEV.P yerine STDEV.S ile hesaplamak gerekir`
    ], a: 0,
    why: `Altı gözlemle %5 düzeyinde anlamlı olmak için |r| yaklaşık 0,81'i geçmelidir; −0,24 rastgele dalgalanmayla rahatça açıklanır. Negatif işaret tek başına bir şey kanıtlamaz. r² yine aynı belirsiz sayıdan türetilir. Standart sapma türü korelasyonda payda ve paydada sadeleşir, sonucu değiştirmez.` },
  { t: 'mc',
    q: `Bir analist 7 kategori × 12 ay matrisini tarayıp "Spor'da Mart ayındaki artış istatistiksel olarak anlamlı" diyor. Başka bir hipotez yoktu. Doğru yorum hangisi?`,
    o: [
      `Anlamlı bulunduğu için Mart kampanyası Spor'da tekrarlanmalı`,
      `Matris bir kez daha, bu kez çeyrek bazında taranmalı`,
      `84 hücre taranınca tesadüfen birkaç anlamlı sonuç beklenir`,
      `Spor'un payı küçük olduğu için sonuç önemsizdir`
    ], a: 2,
    why: `%5 düzeyinde 84 karşılaştırmada yalnızca tesadüfen yaklaşık 4 "anlamlı" sonuç beklenir. Hipotez veriye bakmadan önce konmalı ya da sonuç yeni veriyle doğrulanmalı. Çeyrek bazında yeniden taramak aynı hatayı tekrarlar. Payın küçüklüğü anlamlılık sorusuyla ilgili değildir.` }
] });

})(window);
