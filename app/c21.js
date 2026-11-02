/* Kesit Power BI — c21: Uzman DAX ve ileri modelleme: genişletilmiş tablolar ve veri soyu, çoka çok ilişkiler ve köprü tablolar, uzman kalıplar (devam eden olaylar, karşılaştırılabilir dönem, döviz, bütçe taneciği) */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- 1. Genişletilmiş tablolar, veri soyu, keyfi biçimli filtreler (C2 · Uzman DAX) ---------- */
add('baglam-gecisi', {
  id: 'genisletilmis-tablolar', lv: 'C2', mod: 'Uzman DAX', min: 40,
  title: 'DAX’ın iç mantığı: genişletilmiş tablolar, veri soyu ve keyfi biçimli filtreler',
  sum: 'Bir tabloyu filtrelemenin aslında genişletilmiş tablosunu filtrelemek olduğu, ALL(Satislar) ve REMOVEFILTERS(Urunler) neyi siler, tablo filtresinin gizli etkisi, veri soyu (lineage) ve TREATAS, keyfi biçimli filtre ve KEEPFILTERS, ALLSELECTED ve gölge filtre bağlamı, CALCULATE argümanlarının değerlendirme sırası.',
  body: `
<p>“CALCULATE: filtre bağlamını değiştirmek” ve “FILTER, ALL, ALLEXCEPT, ALLSELECTED” derslerinde kuralları öğrendin. “Bağlam geçişi” dersinde satır bağlamının filtreye nasıl dönüştüğünü gördün. Bu ders, o kuralların <b>altındaki</b> mekanizmayı anlatıyor. Bir ölçü “bazen” yanlış sonuç veriyorsa, sebep çoğu zaman bu derste anlatılan beş şeyden biridir: genişletilmiş tablo, tablo filtresi, veri soyu, keyfi biçimli filtre ya da argüman sırası.</p>
<p>Anadolu Market’in finans ekibinden gelen üç gerçek soru ile başlayalım:</p>
<ul>
<li>“Kategori matrisinde ‘tüm ürünler’ toplamını istedim, <code>REMOVEFILTERS(Urunler)</code> yazdım. Kategori filtresi de gitti. Neden? Kategori ayrı bir tabloda.”</li>
<li>“İade ve iptal hariç satış ölçüsü yazdım. Sonuç net satışla aynı çıktı; iadeler hâlâ içeride.”</li>
<li>“Kullanıcı matriste Aralık 2023 ile Ocak 2024’ü birlikte seçti. ‘2024 satışı’ ölçüm Aralık 2024’ü de getirdi.”</li>
</ul>

<h2>1 · Genişletilmiş tablo: bir tablo, bağlı olduğu boyutları da içerir</h2>
<p>DAX motoru her tabloyu <b>genişletilmiş (expanded)</b> hâliyle düşünür. Bir tablonun genişletilmiş hâli, kendi sütunları artı çoka-bir ilişkilerle <b>bir tarafına doğru</b> ulaşabildiği bütün tabloların sütunlarıdır. Genişleme yalnızca çok taraftan bir tarafa doğru olur; tersine olmaz.</p>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>Genişletilmiş hâli şunları da içerir</th></tr>
<tr><td>Satislar</td><td>Urunler, Kategoriler, Musteriler, Tarih, Calisanlar, Departmanlar</td></tr>
<tr><td>Urunler</td><td>Kategoriler</td></tr>
<tr><td>Calisanlar</td><td>Departmanlar</td></tr>
<tr><td>Hedefler</td><td>Kategoriler, Tarih</td></tr>
<tr><td>Giderler</td><td>Tarih, GiderTurleri, Departmanlar</td></tr>
<tr><td>Kategoriler, Tarih, Musteriler</td><td>Hiçbir şey (zincirin ucundaki boyutlar)</td></tr>
</table></div>
<p>Microsoft Learn’e göre iki ayrıntı önemli: <b>pasif ilişkiler de genişler</b> (Satislar[TeslimTarihi] → Tarih bağı kullanılmasa bile) ve <b>çift yönlü filtre genişlemeyi değiştirmez</b>. Çoka-çok kardinaliteli (sınırlı) ilişkilerde ise genişleme hiç olmaz; bunu “Çoka çok ilişkiler” dersinde göreceksin.</p>
<p>Altın kural: <b>Bir tabloyu filtrelemek, onun genişletilmiş tablosunu filtrelemektir.</b> Kategoriler[Kategori] = "Elektronik" filtresi Satislar’ı süzer, çünkü Kategoriler[Kategori] genişletilmiş Satislar’ın bir sütunudur. Aynı mantık ters yönde de geçerlidir: bir filtreyi kaldıran fonksiyon, genişletilmiş tablodaki filtreleri de kaldırır.</p>
<h3>Sayılarla: hangi kaldırma neyi siler?</h3>
<p>Matriste satırlarda Kategoriler[Kategori] var. Elektronik satırında beş ölçünün sonucu:</p>
<pre class="dax">Tüm Satış (Olgu) =
CALCULATE([Net Satış], ALL(Satislar))

Tüm Satış (Ürün Boyutu) =
CALCULATE([Net Satış], REMOVEFILTERS(Urunler))

Tüm Satış (Kategori Boyutu) =
CALCULATE([Net Satış], REMOVEFILTERS(Kategoriler))

Yanlış Sütun =
CALCULATE([Net Satış], REMOVEFILTERS(Urunler[Kategori]))</pre>
<div class="tbl-wrap"><table>
<tr><th>Ölçü</th><th>Elektronik satırı</th><th>Neden?</th></tr>
<tr><td>[Net Satış]</td><td>339.304 ₺</td><td>Kategori filtresi Satislar’a ulaşır.</td></tr>
<tr><td>ALL(Satislar)</td><td>1.250.772 ₺</td><td>Kategoriler genişletilmiş Satislar’ın içinde; filtre kalkar.</td></tr>
<tr><td>REMOVEFILTERS(Urunler)</td><td>1.250.772 ₺</td><td>Urunler’in genişletilmiş hâli Kategoriler’i içerir; kategori filtresi de kalkar.</td></tr>
<tr><td>REMOVEFILTERS(Kategoriler)</td><td>1.250.772 ₺</td><td>Filtre doğrudan bu tabloda.</td></tr>
<tr><td>REMOVEFILTERS(Urunler[Kategori])</td><td>339.304 ₺</td><td>Görselin filtresi Kategoriler’de, bu sütunda değil; hiçbir şey kalkmaz.</td></tr>
</table></div>
<p>Ters yönü de dene: satırlarda Urunler[Urun] varken <code>REMOVEFILTERS(Kategoriler)</code> ürün filtresini <b>kaldırmaz</b>; 27" Monitör satırı 101.986 ₺ olarak kalır. Çünkü Kategoriler’in genişletilmiş tablosunda Urunler yoktur. Satislar[Kanal] kırılımında da <code>REMOVEFILTERS(Urunler)</code> kanal filtresine dokunmaz: Mağaza satırı 193.600 ₺ kalır, oysa <code>ALL(Satislar)</code> orada da 1.250.772 ₺ verir.</p>
<div class="tip"><b>Pratik kural</b>Kaldırmak istediğin filtreyi, görselin filtrelediği <b>sütunu ya da boyut tablosunu</b> adıyla anarak kaldır. Olgu tablosunu (ALL(Satislar)) hedeflemek, istemediğin bütün boyut filtrelerini de siler.</div>

<h2>2 · Tablo filtresi: görünmeyen sütunlar da filtredir</h2>
<p>Finans ekibinin ikinci sorusu. Hedef: iptal ve iade hariç satış. [Net Satış] zaten iptalleri çıkarıyor; üzerine iade filtresi eklemek yeterli gibi görünür.</p>
<pre class="dax">İadesiz (Deneme A) =
CALCULATE([Net Satış], Satislar[Durum] &lt;&gt; "İade")

İadesiz (Deneme B) =
CALCULATE([Net Satış], FILTER(Satislar, Satislar[Durum] &lt;&gt; "İade"))

İadesiz (Deneme C) =
CALCULATE([Net Satış], FILTER(ALL(Satislar), Satislar[Durum] &lt;&gt; "İade"))

İadesiz (Doğru) =
CALCULATE([Toplam Satış], Satislar[Durum] &lt;&gt; "İptal", Satislar[Durum] &lt;&gt; "İade")</pre>
<div class="tbl-wrap"><table>
<tr><th>Deneme</th><th>Toplam</th><th>Elektronik satırı</th><th>Ne oldu?</th></tr>
<tr><td>A · sütun filtresi</td><td>1.250.772 ₺</td><td>339.304 ₺</td><td>[Net Satış] içindeki CALCULATE, Durum sütununa kendi filtresini yazar ve dıştaki “İade değil” filtresinin <b>üzerine yazar</b>. İadeler geri gelir.</td></tr>
<tr><td>B · FILTER(Satislar)</td><td>1.169.937 ₺</td><td>323.108 ₺</td><td>Doğru ama yavaş. Tablo filtresi Satislar’ın bütün sütunlarını (SatirNo dahil) taşır. İçteki CALCULATE yalnızca Durum’u değiştirebilir; iade satırları SatirNo filtresiyle dışarıda kalır.</td></tr>
<tr><td>C · FILTER(ALL(Satislar))</td><td>1.169.937 ₺</td><td>1.169.937 ₺</td><td>Toplam doğru, kırılım bozuk. ALL(Satislar) genişletilmiş tabloyu, yani kategori filtresini de siler.</td></tr>
<tr><td>Doğru · iki koşul tek CALCULATE’te</td><td>1.169.937 ₺</td><td>323.108 ₺</td><td>Aynı sütuna iki ayrı filtre argümanı VE ile kesişir. Hızlı ve okunur.</td></tr>
</table></div>
<p>B ile C’nin farkı tam olarak genişletilmiş tablodur. B, o anki bağlamda görünen Satislar satırlarını alır; bu satırlar zaten kategoriye göre süzülmüştür ve tablo filtresi olarak verildiğinde Kategoriler sütunları da filtrede kalır. C ise önce bütün filtreleri kaldırır, sonra satırları döndürür. Diğer yol <code>[Net Satış] - [İade Tutarı]</code> da aynı sonucu verir ve ekipte en kolay okunan yazımdır.</p>
<div class="warn"><b>Anti-kalıp: olgu tablosunu FILTER’a vermek</b>FILTER(Satislar, …) bütün olgu tablosunu satır satır dolaşır ve sonucu genişletilmiş tablo filtresi olarak taşır. Bir milyon satırlık modelde yavaştır ve filtre bağlamına gereksiz sütunlar ekler. Koşul tek sütundaysa sütun filtresi, birkaç sütundaysa <code>FILTER(ALL(Satislar[Durum], Satislar[Kanal]), …)</code> gibi yalnızca gereken sütunları al.</div>

<h2>3 · Veri soyu (lineage): filtre hangi sütunu süzeceğini nereden bilir?</h2>
<p>“Tablo fonksiyonları” dersinde soy bağını tanıdın. Uzman düzeyinde bilmen gereken, soyun <b>ne zaman korunduğu, ne zaman koptuğu</b>dur.</p>
<div class="tbl-wrap"><table>
<tr><th>Soy korunur</th><th>Soy kopar</th></tr>
<tr><td>VALUES, DISTINCT, ALL, FILTER, TOPN, CALCULATETABLE, INTERSECT, EXCEPT sonucu: sütunlar modeldeki sütunu “hatırlar”.</td><td>ADDCOLUMNS ile eklenen yeni sütun, elle yazılan tablo ({"Web", "Mobil"}), DATATABLE ve bir sütun üzerinde işlem yapan ifade (Urunler[Urun] &amp; "").</td></tr>
</table></div>
<p>Pazarlama sorusu: “Web’den alışveriş yapan müşteriler mağazada ne kadar harcıyor?” Önce Web müşterilerinin kümesini bul, sonra bu kümeyi filtre olarak ver:</p>
<pre class="dax">Web Müşterilerinin Mağaza Satışı =
VAR WebMusterileri =
    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Kanal] = "Web", Satislar[Durum] &lt;&gt; "İptal")
RETURN
    CALCULATE([Net Satış], WebMusterileri, Satislar[Kanal] = "Mağaza")</pre>
<p>Sonuç 158.614 ₺; tüm mağaza satışı ise 193.600 ₺. Yani mağaza cirosunun yaklaşık %82’si Web’i de kullanan müşterilerden geliyor. WebMusterileri değişkeninin soyu Satislar[MusteriNo]’yu gösterdiği için CALCULATE doğru sütunu süzer; kanal filtresi ise ayrı bir argümanla Mağaza’ya çevrilir. Filtre olgu sütununda durur. Aynı kümeyi <code>TREATAS(WebMusterileri, Musteriler[MusteriNo])</code> ile boyuta taşırsan sonuç aynı kalır, ama filtre artık Musteriler üzerinden Talepler gibi diğer olgulara da ulaşır. Hangisini istediğine bilerek karar ver.</p>
<p>Soy koptuğunda motor tabloyu filtre olarak kullanamaz. Aşağıdaki ilk ifade ürün adlarını metne çevirdiği için soyu kaybeder; ikincisi TREATAS ile soyu geri verir ve ilk 3 ürünün satışını (217.706 ₺) döndürür:</p>
<pre class="dax" data-notry>-- Soy kopar: &amp; "" ifadesi yeni, bağımsız bir metin sütunu üretir
CALCULATE([Net Satış], SELECTCOLUMNS(TOPN(3, VALUES(Urunler[Urun]), [Net Satış]), "U", Urunler[Urun] &amp; ""))</pre>
<pre class="dax">İlk 3 Ürün (Soy Geri Verildi) =
CALCULATE(
    [Net Satış],
    TREATAS(SELECTCOLUMNS(TOPN(3, VALUES(Urunler[Urun]), [Net Satış]), "U", Urunler[Urun] &amp; ""), Urunler[Urun])
)</pre>
<p>Soy kopunca filtre ya hiçbir şeyi süzmez ya da hata verir. Teşhis için tabloyu DAX sorgu görünümünde EVALUATE ile döndür, sonra TREATAS ile hedef sütunu açıkça yaz.</p>

<h2>4 · Keyfi biçimli filtre ve KEEPFILTERS</h2>
<p>Kullanıcı Yıl → Ay hiyerarşisinde, Ctrl ile <b>Aralık 2023</b> ve <b>Ocak 2024</b>’ü seçti. Bu seçim iki ayrı sütun filtresi değildir; (Yıl, Ay) <b>çiftlerinden</b> oluşan tek bir filtredir: {(2023, 12), (2024, 1)}. Böyle, sütunların bağımsız listelerine ayrıştırılamayan filtreye <b>keyfi biçimli filtre (arbitrarily shaped filter)</b> denir. Seçimin net satışı 43.560 + 47.433 = 90.993 ₺’dir.</p>
<p>Şimdi seçim varken şu ölçü çalışsın:</p>
<pre class="dax" data-notry>2024 Satışı = CALCULATE([Net Satış], Tarih[Yil] = 2024)
2024 Satışı (Kesişim) = CALCULATE([Net Satış], KEEPFILTERS(Tarih[Yil] = 2024))</pre>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Filtre sonunda ne olur?</th><th>Sonuç</th></tr>
<tr><td>Seçim (keyfi biçim)</td><td>{(2023, 12), (2024, 1)}</td><td>90.993 ₺</td></tr>
<tr><td>2024 Satışı (üzerine yazma)</td><td>Yil sütunu çiftlerden çıkarılır, geriye Ay {12, 1} kalır; yeni filtre Yil = 2024. Sonuç Aralık 2024 + Ocak 2024.</td><td>141.434 ₺</td></tr>
<tr><td>2024 Satışı (Kesişim)</td><td>Çiftler korunur ve Yil = 2024 ile kesişir: yalnızca (2024, 1).</td><td>47.433 ₺</td></tr>
<tr><td>Biçim kaybolsaydı (iki ayrı dilimleyici)</td><td>Yil {2023, 2024} × Ay {12, 1}: dört ay.</td><td>198.531 ₺</td></tr>
</table></div>
<p>Üzerine yazma sürümü, kullanıcının hiç seçmediği Aralık 2024’ü raporlar. Testte görünmez, çünkü test eden genelde tek ay seçer. Hiyerarşi seçimini Playground’da TREATAS ile kurup üç sonucu kendin görebilirsin:</p>
<pre class="dax">Seçim (Çiftler) =
CALCULATE([Net Satış], TREATAS({(2023, "Ara"), (2024, "Oca")}, Tarih[Yil], Tarih[Ay]))
Seçimde 2024 (Üzerine Yazma) =
CALCULATE(CALCULATE([Net Satış], Tarih[Yil] = 2024), TREATAS({(2023, "Ara"), (2024, "Oca")}, Tarih[Yil], Tarih[Ay]))
Seçimde 2024 (Kesişim) =
CALCULATE(CALCULATE([Net Satış], KEEPFILTERS(Tarih[Yil] = 2024)), TREATAS({(2023, "Ara"), (2024, "Oca")}, Tarih[Yil], Tarih[Ay]))</pre>
<p>Sırasıyla 90.993 ₺, 141.434 ₺ ve 47.433 ₺ döner.</p>
<p>İki savunma yolu var. Birincisi, kullanıcı seçimiyle kesişmesi gereken filtrelerde <b>KEEPFILTERS</b>. İkincisi, biçimi tek sütunda tutmak: dilimleyiciye ya da hiyerarşiye Tarih[YilAy] gibi birleşik bir sütun koymak. Tek sütundaki filtre başka bir sütunun filtresiyle birlikte yaşar:</p>
<pre class="dax">Seçimde 2024 (Tek Sütun) =
CALCULATE(
    CALCULATE([Net Satış], Tarih[Yil] = 2024),
    Tarih[YilAy] IN {"2023-12", "2024-01"}
)</pre>
<p>Sonuç 47.433 ₺: Yil filtresi YilAy filtresini silemez, çünkü ikisi farklı sütunlardır.</p>

<h2>5 · ALLSELECTED ve gölge filtre bağlamı</h2>
<p>Power BI bir görseli çizerken bir sorgu üretir. Dilimleyiciler ve filtre bölmesi dış filtreyi kurar; görselin satırları (gruplama) her hücre için ayrı bir filtre ekler. Motor, gruplamaya başlamadan önceki filtreyi bir kenarda saklar. Buna <b>gölge filtre bağlamı (shadow filter context)</b> denir: etkin değildir, hiçbir şeyi süzmez, ama ALLSELECTED onu geri çağırabilir. ALLSELECTED “seçimi” değil, <b>son gölge filtre bağlamını</b> geri yükler.</p>
<p>Dilimleyicide Elektronik, Kitap ve Spor seçili, satırlarda Kategoriler[Kategori]:</p>
<div class="tbl-wrap"><table>
<tr><th>Elektronik satırı</th><th>Payda</th><th>Sonuç</th></tr>
<tr><td>[Seçime Göre Pay %] (ALLSELECTED)</td><td>Üç kategorinin toplamı: 675.417 ₺</td><td>%50,2</td></tr>
<tr><td>ALL(Kategoriler) ile pay</td><td>Bütün kategoriler: 1.250.772 ₺</td><td>%27,1</td></tr>
<tr><td>Toplam satırı</td><td>ALLSELECTED %100, ALL ile %54,0</td><td></td></tr>
</table></div>
<p>Sorun, iteratörlerin de gölge bağlam kurmasıdır. ALLSELECTED kullanan bir ölçüyü SUMX, AVERAGEX ya da FILTER içinden çağırırsan, ALLSELECTED görselin değil iteratörün dolaştığı kümenin bağlamını geri yükleyebilir. Sonuç görseldeki sayıyla tutmaz ve hata ayıklaması zordur.</p>
<pre class="dax" data-notry>-- Kaçın: ALLSELECTED kullanan ölçüyü iteratör içinden çağırmak
Ortalama Seçim Payı = AVERAGEX(VALUES(Urunler[Urun]), [Seçime Göre Pay %])</pre>
<ul>
<li>ALLSELECTED’ı yalnızca görsele doğrudan konan ölçülerde kullan.</li>
<li>Paydayı bir VAR’da, iteratörden <b>önce</b> hesapla; iteratörün içinde ALLSELECTED çağırma.</li>
<li>Argümanlı yazımı (ALLSELECTED(Kategoriler)) argümansız ALLSELECTED()’a tercih et; neyi geri yüklediğin belli olsun.</li>
</ul>

<h2>6 · CALCULATE argümanları hangi sırayla değerlendirilir?</h2>
<p>CALCULATE argümanlarını yazıldığı sırayla değil, sabit bir sırayla işler:</p>
<ol>
<li><b>Filtre argümanları dış bağlamda hesaplanır.</b> VALUES, MAX, FILTER gibi ifadeler, CALCULATE’in değiştireceği bağlamı değil, <b>çağrıldığı</b> bağlamı görür.</li>
<li><b>Bağlam geçişi</b> olur (satır bağlamı varsa).</li>
<li><b>Değiştiriciler</b> uygulanır: ALL / REMOVEFILTERS / ALLEXCEPT, USERELATIONSHIP, CROSSFILTER.</li>
<li><b>Filtre argümanları</b> uygulanır: KEEPFILTERS ile sarılı olanlar kesişir, diğerleri aynı sütundaki filtrenin üzerine yazar.</li>
<li>İfade yeni bağlamda hesaplanır.</li>
</ol>
<p>Sonuç 1: sıra yazımdan bağımsızdır. Aşağıdaki iki ölçü her yıl satırında aynı sayıyı, 747.066 ₺’yi verir; REMOVEFILTERS sonra yazılsa da önce çalışır ve Yil = 2024 filtresini silemez.</p>
<pre class="dax">2024 Sabit A = CALCULATE([Net Satış], Tarih[Yil] = 2024, REMOVEFILTERS(Tarih))
2024 Sabit B = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[Yil] = 2024)</pre>
<p>Sonuç 2: iteratör içindeki filtre argümanı satırı görmez. Aşağıdaki hatalı ölçüde VALUES(Tarih[YilAy]) bağlam geçişinden <b>önce</b>, dış bağlamda hesaplanır ve yılın bütün aylarını döndürür. Her ay için yılın tamamı toplanır: 2024 satırında 747.066 ₺ yerine 12 katı, 8.964.788 ₺ çıkar.</p>
<pre class="dax">Ay Ay Toplam (Hatalı) =
SUMX(VALUES(Tarih[YilAy]), CALCULATE([Net Satış], REMOVEFILTERS(Tarih), VALUES(Tarih[YilAy])))

Ay Ay Toplam (Doğru) =
SUMX(
    VALUES(Tarih[YilAy]),
    VAR Ay = Tarih[YilAy]
    RETURN CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[YilAy] = Ay)
)</pre>
<p>Düzeltme, satırın değerini önce bir VAR’a almaktır. “Uzman kalıplar” dersinde aylık hedefi güne dağıtırken aynı hatanın çok daha sinsi bir sürümünü göreceksin: yıllık ve aylık toplamlar doğru çıkar, yalnızca hafta düzeyinde bozulur.</p>

<h2>Üretimde test ve kontrol listesi</h2>
<p>Bu hatalar toplam satırında ya da tek seçimde doğru görünür. Ölçüyü DAX sorgu görünümünde <b>en az üç bağlamda</b> dene: toplam, tek kırılım, çoklu seçim (iki ay, iki kanal). Performans Analizi’nden sorguyu DAX Studio’ya kopyalayıp sunucu zamanlamalarına bakmak, gereksiz tablo filtresini hemen ele verir.</p>
<ol>
<li>Kaldırdığım filtre görselin filtrelediği <b>sütun ya da boyut</b> mu, yoksa olgu tablosunun tamamı mı?</li>
<li>FILTER’a bir tablo veriyorsam, o tablonun genişletilmiş hâli hangi filtreleri taşıyor?</li>
<li>İç ölçü (ör. [Net Satış]) aynı sütuna kendi filtresini yazıyor mu? Dıştaki filtrem eziliyor mu?</li>
<li>Filtre olarak verdiğim tablonun soyu doğru model sütununu gösteriyor mu? Emin değilsem TREATAS.</li>
<li>Kullanıcı hiyerarşide çoklu seçim yapabilir mi? Evet ise sabit filtrelerde KEEPFILTERS.</li>
<li>ALLSELECTED kullanan ölçü bir iteratörün içinden çağrılıyor mu?</li>
<li>İteratör içindeki CALCULATE’in filtre argümanı satırın değerini mi kullanıyor? Kullanıyorsa değeri önce VAR’a al.</li>
</ol>
<div class="note"><b>Ekip için belge</b>Ölçünün açıklamasına (Description) “hangi filtreleri korur, hangilerini kaldırır” cümlesini yaz: “Kanal ve tarih filtresini korur; ürün ve kategori filtresini kaldırır.” Kod incelemesinde ilk sorulan soru budur ve Copilot da bu açıklamayı okur.</div>
`,
  ex: [
    { t: 'dax', name: 'Ürün Filtresiz Satış (Kanal Korunur)', q: '<b>Ürün Filtresiz Satış (Kanal Korunur)</b>: Kanal ve kategori kırılımlarında, ürün tablosundan gelen bütün filtreler (ürün ve kategori dahil) kalksın ama kanal ve tarih filtreleri korunsun. [Net Satış] üzerinden yaz. Kontrol tablosu Satislar[Kanal] ve Kategoriler[Kategori] ile kırar.', sol: 'CALCULATE([Net Satış], REMOVEFILTERS(Urunler))', hint: 'Urunler’in genişletilmiş tablosu Kategoriler’i de içerir. Olgu tablosunu (ALL(Satislar)) hedeflersen kanal filtresi de gider.', grid: [{ t: 'Satislar', c: 'Kanal' }, { t: 'Kategoriler', c: 'Kategori' }] },
    { t: 'dax', name: 'İade ve İptal Hariç Satış', q: '<b>İade ve İptal Hariç Satış</b>: Durumu “İptal” ya da “İade” olan satırlar hariç satış tutarı. Kategori ve yıl kırılımında doğru çalışmalı. Dikkat: [Net Satış]’ı dıştan Durum filtresiyle sarmak işe yaramaz.', sol: 'CALCULATE([Toplam Satış], Satislar[Durum] <> "İptal", Satislar[Durum] <> "İade")', hint: '[Net Satış] içindeki CALCULATE Durum sütununa kendi filtresini yazar. [Toplam Satış]’tan başla ve iki koşulu aynı CALCULATE’e ayrı argüman olarak ver (ya da [Net Satış] - [İade Tutarı]).' },
    { t: 'dax', name: 'Mobil Alıcılarının Web Satışı', q: '<b>Mobil Alıcılarının Web Satışı</b>: Mobil kanaldan en az bir iptal edilmemiş satırı olan müşterilerin, Web kanalındaki net satışı. Önce müşteri kümesini VAR’da CALCULATETABLE + VALUES(Satislar[MusteriNo]) ile bul, sonra filtre olarak kullan.', sol: 'VAR MobilMusteriler = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Kanal] = "Mobil", Satislar[Durum] <> "İptal") RETURN CALCULATE([Net Satış], MobilMusteriler, Satislar[Kanal] = "Web")', hint: 'Kümenin soyu Satislar[MusteriNo]’yu gösterir; CALCULATE onu doğru sütuna uygular. Kanal filtresi ikinci argümanla Web’e çevrilir.' },
    { t: 'dax', name: 'Sabit 2023 Satışı', q: '<b>Sabit 2023 Satışı</b>: Hangi yıl satırında olursa olsun 2023 yılının net satışını göster; kategori filtresi korunsun. Tarih tablosundaki bütün filtreleri kaldır ve Yil = 2023 uygula.', sol: 'CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[Yil] = 2023)', hint: 'Değiştiriciler (REMOVEFILTERS) filtre argümanlarından önce uygulanır; yazım sırası sonucu değiştirmez.' },
    { t: 'query', q: 'Satışa göre ilk 5 müşteriyi (tüm dönem) bir VAR’da TOPN(5, VALUES(Musteriler[MusteriNo]), [Net Satış]) ile bul. Sonra SUMMARIZECOLUMNS ile Satislar[Kanal] başına bu 5 müşterinin net satışını "İlk 5 Müşteri" sütununda döndür.', start: 'EVALUATE\n', sol: 'EVALUATE\nVAR Ilk5 = TOPN(5, VALUES(Musteriler[MusteriNo]), [Net Satış])\nRETURN\n    SUMMARIZECOLUMNS(Satislar[Kanal], "İlk 5 Müşteri", CALCULATE([Net Satış], Ilk5))', hint: 'TOPN, VALUES’tan gelen soyu korur; tablo değişkeni CALCULATE’e filtre olarak verilebilir.' },
    { t: 'query', q: 'Keyfi biçimli seçimi tek sütunla taklit et: ROW ile iki sütun döndür. "Seçim": Tarih[YilAy] IN {"2023-12", "2024-01"} filtresiyle net satış. "Seçimde 2024": aynı YilAy filtresi dışta, içte Tarih[Yil] = 2024 olan iç içe CALCULATE.', start: 'EVALUATE\n', sol: 'EVALUATE\nROW(\n    "Seçim", CALCULATE([Net Satış], Tarih[YilAy] IN {"2023-12", "2024-01"}),\n    "Seçimde 2024", CALCULATE(CALCULATE([Net Satış], Tarih[Yil] = 2024), Tarih[YilAy] IN {"2023-12", "2024-01"})\n)', hint: 'Yil ve YilAy farklı sütunlardır; içteki filtre dıştakini silmez. İkinci değer yalnızca Ocak 2024 olmalı.' },
    { t: 'mc', q: 'Kullanıcı hiyerarşide Aralık 2023 ile Ocak 2024’ü birlikte seçti. Ekrandaki <code>CALCULATE([Net Satış], Tarih[Yil] = 2024)</code> ölçüsü Aralık 2024’ü de topluyor. Ölçüyü en az değişiklikle nasıl düzeltirsin?', o: ['Filtreyi <code>KEEPFILTERS(Tarih[Yil] = 2024)</code> ile sararım; seçim çiftleri korunur ve kesişir', 'Filtreyi <code>FILTER(ALL(Tarih), Tarih[Yil] = 2024)</code> biçiminde yazarım; tablo filtresi daha güçlüdür', 'Ölçüye <code>REMOVEFILTERS(Tarih[AyNo])</code> eklerim; ay filtresi kalkınca yıl doğru süzülür', 'Yil filtresini <code>Tarih[Yil] IN {2024}</code> yazarım; IN listesi seçimle kesişir'], a: 0, why: 'Seçim (Yıl, Ay) çiftlerinden oluşan keyfi biçimli bir filtredir. Sütun filtresi Yil’in üzerine yazar ve geriye Ay {12, 1} kalır. KEEPFILTERS üzerine yazmak yerine kesiştirir: yalnızca (2024, 1) kalır. FILTER(ALL(Tarih)) bütün tarih filtresini siler; AyNo’yu kaldırmak yılın tamamını getirir; IN {2024} de bir sütun filtresidir ve aynı şekilde üzerine yazar.' },
    { t: 'mc', q: 'Bir analist kategori matrisine <code>CALCULATE([Net Satış], REMOVEFILTERS(Urunler))</code> koydu ve her satırda genel toplamı gördü. “Kategori ayrı tabloda, neden kalktı?” diye soruyor. Doğru açıklama hangisi?', o: ['Kategoriler, Urunler’den sonra yüklendiği için REMOVEFILTERS onu da kapsar', 'Genişletilmiş Urunler, Kategoriler’i içerir; onun filtresi de kalkar', 'REMOVEFILTERS her zaman modeldeki bütün boyutların filtresini kaldırır', 'İlişki çift yönlü olmadığı için kategori filtresi Urunler’e hiç ulaşmamıştır'], a: 1, why: 'Urunler çoka-bir ilişkiyle Kategoriler’e bağlı; genişletilmiş Urunler, Kategoriler sütunlarını içerir. Urunler’i hedefleyen REMOVEFILTERS bu sütunlardaki filtreyi de siler. Yükleme sırasının etkisi yoktur; REMOVEFILTERS yalnızca verilen tablonun (genişletilmiş) filtrelerini kaldırır, kanal filtresi örneğin kalır; ilişki yönü tek yönlü olsa da filtre Kategoriler’den Satislar’a zaten akar.' },
    { t: 'mc', q: 'Ekip arkadaşın şunu yazdı: <code>Pay = AVERAGEX(VALUES(Urunler[Urun]), [Seçime Göre Pay %])</code>. Görseldeki sayı, ürün satırlarındaki payların elle alınan ortalamasıyla tutmuyor. En olası sebep ne?', o: ['AVERAGEX boş değerleri sıfır sayıyor ve ortalamayı aşağı çekiyor', 'VALUES(Urunler[Urun]) soyu kaybettiği için paylar yanlış hesaplanıyor', 'İteratörün gölge bağlamı geri yükleniyor; payda görselinki değil', 'Seçime Göre Pay % içinde DIVIDE kullanıldığı için ortalama bozuluyor'], a: 2, why: 'İteratörler de gölge filtre bağlamı kurar. İteratör içinden çağrılan ALLSELECTED, görselin değil iteratörün bağlamını geri yükleyebilir; payda değişir. AVERAGEX boşları atlar, sıfır saymaz; VALUES soyu korur; DIVIDE yalnızca sıfıra bölmeyi yönetir. Çözüm: paydayı iteratörden önce bir VAR’da hesaplamak.' },
    { t: 'mc', q: '<code>SUMX(VALUES(Tarih[YilAy]), CALCULATE([Net Satış], REMOVEFILTERS(Tarih), VALUES(Tarih[YilAy])))</code> ölçüsü 2024 satırında 747.066 ₺ yerine 8.964.788 ₺ veriyor. Neden?', o: ['REMOVEFILTERS(Tarih) bağlam geçişini iptal ediyor ve SUMX satırları birden çok kez sayıyor', 'İçteki VALUES dış bağlamda, geçişten önce hesaplanıyor ve her satırda yılın 12 ayını döndürüyor', 'VALUES(Tarih[YilAy]) soyu kaybettiği için filtre hiçbir şeyi süzmüyor ve bütün yıllar toplanıyor', 'SUMX ay sayısını otomatik olarak çarpan alır; AVERAGEX kullanılmalıydı'], a: 1, why: 'Filtre argümanları CALCULATE’in çağrıldığı dış bağlamda hesaplanır. Satır bağlamı filtre değildir; VALUES yılın 12 ayını döndürür. Her ay satırında yılın tamamı toplanır: 12 × 747.066. REMOVEFILTERS geçişi iptal etmez, soy da korunur; SUMX çarpan almaz. Çözüm: VAR Ay = Tarih[YilAy] ve Tarih[YilAy] = Ay.' }
  ]
});

/* ---------- 2. Çoka çok ilişkiler, köprü tablolar ve ilişki türleri (C1 · İleri Modelleme) ---------- */
add('model-ileri', {
  id: 'coka-cok', lv: 'C1', mod: 'İleri Modelleme', min: 38,
  title: 'Çoka çok ilişkiler, köprü tablolar ve ilişki türleri',
  sum: 'Gerçek çoka-çok senaryoları (bir proje birden çok departmanda, bir müşteri birden çok kategoride, bütçe farklı taneciklikte), köprü tablo ve ağırlık, çift yönlü filtrenin riskleri ve belirsiz yollar, sınırlı (limited) ilişkiler, CROSSFILTER ve TREATAS ile ölçü içinde çözüm, toplam satırı ve çift sayma.',
  body: `
<p>Yıldız şemada her ilişki çoka-birdir: bir satış satırı tek bir ürüne, tek bir müşteriye bağlanır. Gerçek iş hayatı bu kadar düzenli değildir. “Model tasarımı II” dersinde ayrıntı düzeyini (grain), “Rol oynayan boyutlar” dersinde CROSSFILTER’ı, “Tablo fonksiyonları” dersinde köprü tablonun kısa tanımını gördün. Bu ders, çoka-çok (many-to-many) durumları tanımayı, modelde ve ölçüde çözmeyi ve <b>toplam satırını kullanıcıya doğru anlatmayı</b> öğretiyor.</p>
<p>Anadolu Market’te bu hafta gelen üç talep:</p>
<ul>
<li><b>Proje yönetim ofisi:</b> “Fabric veri platformu geçişi, Veri Analitiği ile Yazılım’ın ortak projesi. Departman raporunda bütçe iki departmanda da görünmeli, ama şirket toplamı şişmemeli.”</li>
<li><b>Pazarlama:</b> “Elektronik alan müşterilerimizin toplam cirosu, yani bütün kategorilerdeki harcaması ne?”</li>
<li><b>Satış planlama:</b> “Hedefler kategori ve ay düzeyinde. Ürün tablosundaki kategori sütunuyla rapor yapınca hedef her satırda aynı.”</li>
</ul>

<h2>1 · Çoka-çok’un üç yüzü</h2>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Örnek</th><th>Tipik çözüm</th></tr>
<tr><td>İki boyut arasında çok değerli ilişki</td><td>Bir proje birden çok departmanda, bir departmanın birden çok projesi var</td><td>Köprü tablo (ProjeDepartman), gerekirse ağırlık sütunu</td></tr>
<tr><td>Olgu üzerinden iki boyut</td><td>Bir müşteri birden çok kategoriden alır, bir kategoriden birçok müşteri alır</td><td>Olgu tablosu zaten köprüdür; ölçüde küme filtresi ya da CROSSFILTER</td></tr>
<tr><td>Farklı taneciklikte olgu</td><td>Hedefler kategori × ay, satış ürün × gün</td><td>Ortak boyut (Kategoriler); olmazsa TREATAS ya da çoka-çok kardinalite</td></tr>
</table></div>
<p>Hepsinin ortak sonucu aynıdır: <b>satırların toplamı, toplam satırına eşit değildir</b>. Bir proje iki departmanda görünür, toplamda bir kez sayılır. Bu bir hata değil, çoka-çok’un doğasıdır; hata, bunu kullanıcıya söylememektir.</p>

<h2>2 · Köprü tablo: proje ↔ departman</h2>
<p>Modelde Projeler[DepartmanNo] tek bir departman tutuyor. Ortak projeleri göstermek için bir köprü tablo gerekir: her satırı “bu proje, bu departmana, şu payla aittir” cümlesidir. Modelde şöyle kurulur:</p>
<pre class="dax" data-notry>Departmanlar[DepartmanNo]  1 ──&gt; *  ProjeDepartman[DepartmanNo]
Projeler[ProjeNo]          1 &lt;─&gt; *  ProjeDepartman[ProjeNo]     (çift yönlü)

ProjeDepartman: ProjeNo | DepartmanNo | Pay
                5       | 2 (Pazarlama)      | 0,7
                5       | 1 (Satış)          | 0,3
                7       | 3 (Veri Analitiği) | 0,6
                7       | 4 (Yazılım)        | 0,4
               12       | 3 (Veri Analitiği) | 0,5
               12       | 1 (Satış)          | 0,3
               12       | 2 (Pazarlama)      | 0,2</pre>
<p>Filtrenin Departmanlar’dan Projeler’e ulaşması için köprü ile Projeler arasındaki ilişkinin çift yönlü olması gerekir: filtre Departmanlar → köprü yönünde doğal akar, köprü → Projeler yönünde ise “çoktan bire” geri gitmesi gerekir. Bu uygulamanın modelinde köprü tablo yok; aynı mantığı ölçünün içinde, sanal bir köprüyle deneyebilirsin. Önce ağırlıklı (paylaştırılmış) bütçe:</p>
<pre class="dax">Paylaştırılmış Bütçe =
VAR Kopru =
    DATATABLE(
        "ProjeNo", INTEGER, "DepartmanNo", INTEGER, "Pay", DOUBLE,
        {
            {5, 2, 0.7}, {5, 1, 0.3},
            {7, 3, 0.6}, {7, 4, 0.4},
            {12, 3, 0.5}, {12, 1, 0.3}, {12, 2, 0.2}
        }
    )
VAR Gorunen = FILTER(Kopru, [DepartmanNo] IN VALUES(Departmanlar[DepartmanNo]))
RETURN
    SUMX(Gorunen, [Pay] * LOOKUPVALUE(Projeler[Butce], Projeler[ProjeNo], [ProjeNo]))</pre>
<p>Sonra ağırlıksız, “dokunduğu projelerin tam bütçesi”:</p>
<pre class="dax">Katıldığı Projelerin Bütçesi =
VAR Kopru =
    DATATABLE(
        "ProjeNo", INTEGER, "DepartmanNo", INTEGER, "Pay", DOUBLE,
        {
            {5, 2, 0.7}, {5, 1, 0.3},
            {7, 3, 0.6}, {7, 4, 0.4},
            {12, 3, 0.5}, {12, 1, 0.3}, {12, 2, 0.2}
        }
    )
VAR Projeler_ = SELECTCOLUMNS(FILTER(Kopru, [DepartmanNo] IN VALUES(Departmanlar[DepartmanNo])), "P", [ProjeNo])
RETURN
    CALCULATE([Proje Bütçesi], REMOVEFILTERS(Departmanlar), TREATAS(Projeler_, Projeler[ProjeNo]))</pre>
<div class="tbl-wrap"><table>
<tr><th>Departman</th><th>Paylaştırılmış</th><th>Tam bütçe</th></tr>
<tr><td>Pazarlama</td><td>165.000 ₺</td><td>450.000 ₺</td></tr>
<tr><td>Satış</td><td>135.000 ₺</td><td>450.000 ₺</td></tr>
<tr><td>Veri Analitiği</td><td>402.000 ₺</td><td>720.000 ₺</td></tr>
<tr><td>Yazılım</td><td>168.000 ₺</td><td>420.000 ₺</td></tr>
<tr><td><b>Satırların toplamı</b></td><td>870.000 ₺</td><td>2.040.000 ₺</td></tr>
<tr><td><b>Toplam satırı</b></td><td>870.000 ₺</td><td>870.000 ₺</td></tr>
</table></div>
<p>Üç projenin gerçek bütçesi 870.000 ₺. Paylaştırılmış ölçü <b>toplanabilir</b>: satırlar toplama eşittir. Tam bütçe ölçüsü <b>toplanamaz</b>: her departman “benim projem” der, satırlar 2.040.000 ₺ eder. İkisi de doğrudur, ama farklı soruları cevaplar. Departman müdürü “sorumlu olduğum işlerin büyüklüğü”nü, finans “maliyetin kime yazılacağı”nı sorar. Raporda ikisini aynı ada koyma.</p>
<div class="note"><b>Üretimde köprü</b>DATATABLE yalnızca deneme ve öğretim içindir. Gerçek köprü tablo kaynakta ya da Power Query’de üretilir; payların her proje için 1’e tamamlandığını yenilemeden sonra bir sorguyla doğrula. Fiziksel tasarımı (vekil anahtar, köprünün ambarda nasıl tutulduğu) “Fabric’te yıldız şema” dersi anlatıyor.</div>

<h2>3 · Olgu tablosu bir köprüdür: müşteri ↔ kategori</h2>
<p>Pazarlamanın sorusu: “Elektronik alanların toplam cirosu.” Burada köprü tablo kurmana gerek yok; Satislar zaten her müşteriyi aldığı kategorilere bağlıyor. Yapılacak iş, iki adımlı bir filtre:</p>
<ol>
<li>Görünen kategoride alışveriş yapan müşterilerin kümesini bul.</li>
<li>Kategori filtresini kaldır, bu müşterilerin tüm satışını hesapla.</li>
</ol>
<pre class="dax">Alıcıların Toplam Satışı =
VAR Alicilar = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal")
RETURN
    CALCULATE([Net Satış], Alicilar, REMOVEFILTERS(Kategoriler), REMOVEFILTERS(Urunler))</pre>
<div class="tbl-wrap"><table>
<tr><th>Kategori</th><th>Alıcı sayısı</th><th>Kategorideki satış</th><th>Alıcıların toplam satışı</th></tr>
<tr><td>Elektronik</td><td>95</td><td>339.304 ₺</td><td>1.104.856 ₺</td></tr>
<tr><td>Kitap</td><td>113</td><td>151.882 ₺</td><td>1.153.184 ₺</td></tr>
<tr><td>Hediye</td><td>30</td><td>17.370 ₺</td><td>328.027 ₺</td></tr>
<tr><td><b>Toplam satırı</b></td><td>136</td><td>1.250.772 ₺</td><td>1.250.772 ₺</td></tr>
</table></div>
<p>Kitap alıcıları, şirket cirosunun %92’sini yapıyor: Kitap küçük bir kategori ama çok geniş bir müşteri kitlesine dokunuyor. Bu bilgi kategori satışından görünmez. Yedi kategorinin alıcı sayılarını toplarsan 628 eder, oysa tekil müşteri 136’dır. Bir müşteri ortalama 4,6 kategoride görünür.</p>
<h3>Tek yönlü filtrenin tuzağı</h3>
<p>“En az 4 kategoriden alan müşteri” sorusunda çoğu kişi <code>CALCULATE(DISTINCTCOUNT(Urunler[Kategori]))</code> yazar ve her müşteride 7 bulur. Sebep: filtre Satislar’dan Urunler’e akmaz. Müşteri filtresi Satislar’ı süzer ama Urunler tablosunun bütün satırları görünür kalır. Çözüm ya ölçü içinde <code>CROSSFILTER(Satislar[UrunNo], Urunler[UrunNo], BOTH)</code> ya da olgu üzerinden saymak: <code>COUNTROWS(SUMMARIZE(Satislar, Urunler[Kategori]))</code>. İkisiyle de dağılım şöyle çıkar: 7 kategoride 13, 6’da 40, 5’te 22, 4’te 28 müşteri; yani 136 müşterinin 103’ü en az 4 kategoriden almış.</p>

<h2>4 · Çift yönlü filtre: ne zaman, neden riskli?</h2>
<p>Çift yönlü (both) ilişki, filtrenin bir taraftan çok tarafa olduğu gibi çok taraftan bir tarafa da akmasını sağlar. Kolay görünür; üç bedeli vardır.</p>
<h3>Bedel 1: anlam sessizce değişir</h3>
<p>Kanal kırılımında <code>CALCULATE([Kayıtlı Müşteri], CROSSFILTER(Satislar[MusteriNo], Musteriler[MusteriNo], BOTH))</code> Mağaza’da 73 verir. [Müşteri Sayısı] ise 70. Fark, bu kanaldaki siparişlerinin hepsi iptal olan 3 müşteri: çift yönlü filtre “bu kanalda satırı olan” müşteriyi sayar, iş kuralını (iptal hariç) bilmez. Kullanıcı modelde ilişkiyi çift yönlü görünce bütün müşteri sayılarının bu yolla geldiğini varsayar.</p>
<h3>Bedel 2: belirsiz yollar</h3>
<p>Modelde Talepler hem Tarih’e hem Musteriler’e bağlı. Satislar–Musteriler ilişkisini çift yönlü yaparsan, Tarih’ten Talepler’e iki yol oluşur: doğrudan Tarih → Talepler ve Tarih → Satislar → Musteriler → Talepler.</p>
<pre class="dax" data-notry>Yol 1: Tarih ──&gt; Talepler
Yol 2: Tarih ──&gt; Satislar ──(çift yönlü)──&gt; Musteriler ──&gt; Talepler</pre>
<p>Microsoft Learn’e göre Power BI bu durumda yolları önceliğe göre sıralar (önce doğrudan bire-çok yollar), eşit öncelik ve ağırlıkta birden çok yol kalırsa “belirsiz yol” hatası verir. Desktop çift yönlü değişikliği kaydetmeyi reddedebilir ya da belirsizliğe izin verip bir yolu seçebilir. Her iki durumda da [Talep Sayısı] gibi masum bir ölçünün anlamı, modeli kimin ne zaman değiştirdiğine bağlı hâle gelir.</p>
<h3>Bedel 3: performans ve güvenlik</h3>
<p>Çift yönlü ilişki her sorguda ek filtre yayılımı demektir ve büyük modellerde belirgin biçimde yavaştır. Satır düzeyi güvenlikte (RLS) güvenlik filtresi varsayılan olarak tek yönde akar; ilişki özelliklerindeki “Güvenlik filtresini her iki yönde de uygula” seçeneği açılmadıkça çift yönlü ilişki RLS’yi taşımaz. Bu seçeneği açmak ise rol tasarımını karmaşıklaştırır.</p>
<div class="tip"><b>Kural</b>Modeldeki ilişkiler tek yönlü kalsın. Çift yönlü davranışa ihtiyaç duyan her ölçü bunu <code>CROSSFILTER(…, BOTH)</code> ile, açıkça ve yalnızca kendi içinde istesin. İstisna: köprü tablo ile ona bağlı boyut arasındaki ilişki; orada çift yön desenin parçasıdır ve belgelenmelidir.</div>

<h2>5 · Farklı taneciklik: hedef kategori düzeyinde, rapor ürün tablosundan</h2>
<p>Satış planlamanın sorunu: görselde kategoriyi Urunler[Kategori]’den kullanınca [Hedef] her satırda 1.299.300 ₺ gösteriyor. Hedefler, Urunler’e bağlı değil; Kategoriler üzerinden bağlı. Üç çözüm var:</p>
<div class="tbl-wrap"><table>
<tr><th>Yol</th><th>Nasıl?</th><th>Artı</th><th>Eksi</th></tr>
<tr><td>Ortak boyut</td><td>Görselde Kategoriler[Kategori]; Urunler[Kategori] gizlenir</td><td>Hızlı, düzenli ilişki, ölçü değişmez</td><td>Kullanıcıyı doğru alana yönlendirmek gerekir</td></tr>
<tr><td>TREATAS (sanal ilişki)</td><td>Ölçü içinde Urunler[Kategori] değerleri Hedefler[Kategori]’ye uygulanır</td><td>Modele dokunmaz, hangi ölçüde geçerli olduğu açık</td><td>Her ölçüye ayrı yazılır, bakım yükü</td></tr>
<tr><td>Çoka-çok kardinalite</td><td>Hedefler[Kategori] *—* Urunler[Kategori] ilişkisi</td><td>Kodsuz, sürükle-bırak</td><td>Sınırlı ilişki: yavaş, RELATED yok, boş satır yok</td></tr>
</table></div>
<pre class="dax">Hedef (Ürün Kategorisinden) =
CALCULATE([Hedef], TREATAS(VALUES(Urunler[Kategori]), Hedefler[Kategori]))</pre>
<p>Urunler[Kategori] kırılımında artık Elektronik 351.800 ₺, Kitap 156.200 ₺ gösterir; toplam 1.299.300 ₺.</p>
<h3>Sınırlı (limited) ilişki ne demek?</h3>
<p>Learn’e göre bir ilişki, motor “bir” tarafını garanti edemediğinde <b>sınırlı</b>dır: çoka-çok kardinalite (sütunlar benzersiz olsa bile) ve bileşik modellerde farklı kaynak grupları arasındaki ilişkiler. Sınırlı ilişkinin davranışı düzenli ilişkiden farklıdır:</p>
<ul>
<li>Birleşme iç birleşme (inner join) mantığıyla yapılır; eşleşmeyen satırlar için <b>boş sanal satır eklenmez</b>. Hedefte olup ürün tablosunda olmayan bir kategori raporda “(Boş)” satırı olarak görünmez, sessizce kaybolur.</li>
<li><b>RELATED</b> ile “bir” taraftaki değer alınamaz.</li>
<li><b>Tablo genişlemesi olmaz</b>; birinci derste gördüğün “ALL(Hedefler) Kategoriler filtresini de kaldırır” kuralı burada işlemez.</li>
<li>İçe aktarma modelinde ilişki için yapı önceden oluşturulmaz, birleşme sorgu anında çözülür; daha yavaştır.</li>
</ul>
<pre class="dax" data-notry>-- Model görünümünde (bu uygulamanın motorunda kurulamaz)
Hedefler[Kategori]  *  ──  *  Urunler[Kategori]
Çapraz filtre yönü: Tek (Urunler filtreler Hedefler’i)</pre>

<h2>6 · Ortak boyut mu, çift yönlü mü, TREATAS mı? Toplam satırındaki fark</h2>
<p>Gider türüne göre proje bütçesini görmek isteyelim. Giderler ve Projeler, Departmanlar üzerinden birbirine dokunuyor; ama gider türü filtresinin projelere ulaşması için filtrenin Giderler’den Departmanlar’a geri akması gerekir.</p>
<pre class="dax">Gider Türü Proje Bütçesi (CROSSFILTER) =
CALCULATE([Proje Bütçesi], CROSSFILTER(Giderler[DepartmanNo], Departmanlar[DepartmanNo], BOTH))

Gider Türü Proje Bütçesi (TREATAS) =
CALCULATE([Proje Bütçesi], TREATAS(VALUES(Giderler[DepartmanNo]), Departmanlar[DepartmanNo]))</pre>
<div class="tbl-wrap"><table>
<tr><th>Gider türü</th><th>Gideri yapan departman</th><th>İki ölçü de</th></tr>
<tr><td>Personel</td><td>Satış</td><td>45.000 ₺</td></tr>
<tr><td>Lojistik ve kargo</td><td>Satış</td><td>45.000 ₺</td></tr>
<tr><td>Pazarlama ve reklam</td><td>Pazarlama</td><td>240.000 ₺</td></tr>
<tr><td>Teknoloji</td><td>Yazılım</td><td>1.140.000 ₺</td></tr>
<tr><td>Kira ve tesis, Genel yönetim</td><td>Genel Müdürlük (projesi yok)</td><td>BLANK</td></tr>
<tr><td><b>Toplam satırı</b></td><td></td><td>CROSSFILTER: 3.040.000 ₺ · TREATAS: 1.425.000 ₺</td></tr>
</table></div>
<p>Satırlarda iki ölçü aynı. Toplamda ayrılıyorlar: CROSSFILTER’da Giderler hiç filtrelenmemişse Departmanlar’a yayılacak bir filtre yoktur ve bütün projeler (3.040.000 ₺) gelir. TREATAS ise her zaman “gideri olan departmanlar” kümesini uygular ve Veri Analitiği, Finans, İK, Hukuk projelerini dışarıda bırakır (1.425.000 ₺). Satırların toplamı ise 1.470.000 ₺’dir, çünkü Satış departmanının 45.000 ₺’lik projesi iki gider türünde görünür. Üç farklı “toplam” var; hangisinin doğru olduğunu iş sorusu belirler, DAX değil.</p>

<h2>Karar listesi ve test</h2>
<ol>
<li><b>Gerçekten çoka-çok mu?</b> Önce ortak bir boyut ara. Hedef–satış sorununun %90’ı ortak boyutla çözülür.</li>
<li><b>Köprü gerekiyorsa</b> payların toplamını doğrula, köprü–boyut ilişkisini çift yönlü yap ve bunu ilişki açıklamasına yaz.</li>
<li><b>Ölçü içinde çöz:</b> Model tek yönlü kalsın; CROSSFILTER ya da TREATAS yalnızca gereken ölçüde.</li>
<li><b>Toplanabilir mi?</b> Paylaştırılmış ölçü toplanır, tam değer ölçüsü toplanmaz. Ölçü adına ve araç ipucuna bunu yaz: “Toplam satırı tekil projeleri bir kez sayar.”</li>
<li><b>Test:</b> DAX sorgu görünümünde <code>SUMX(VALUES(Boyut[Anahtar]), [Ölçü])</code> ile toplam satırını yan yana koy. Fark beklediğin fark mı?</li>
<li><b>RLS:</b> Köprü ya da çift yönlü ilişki varsa, güvenlik filtresinin hangi yönde aktığını rol görünümüyle (Farklı görüntüle) kontrol et.</li>
<li><b>Performans:</b> Performans Analizi’nde çift yönlü ilişkili görselin süresini, CROSSFILTER’lı ölçü sürümüyle karşılaştır.</li>
</ol>
`,
  ex: [
    { t: 'dax', name: 'Hedef (Ürün Kategorisi Kırılımı)', q: '<b>Hedef (Ürün Kategorisi Kırılımı)</b>: Kontrol tablosu satırlarda Urunler[Kategori] kullanıyor ve [Hedef] her satırda aynı çıkıyor. Hedefler’le Urunler arasında ilişki yok. Urunler[Kategori] değerlerini Hedefler[Kategori]’ye sanal ilişkiyle uygula.', sol: 'CALCULATE([Hedef], TREATAS(VALUES(Urunler[Kategori]), Hedefler[Kategori]))', hint: 'TREATAS(VALUES(kaynak sütun), hedef sütun). Tarih filtresi zaten Hedefler’e ulaşıyor.', grid: [{ t: 'Urunler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }] },
    { t: 'dax', name: 'Gider Türüne Göre Proje Bütçesi', q: '<b>Gider Türüne Göre Proje Bütçesi</b>: Gider türü kırılımında, o türde gideri olan departmanların proje bütçesi ([Proje Bütçesi]). Filtrenin Giderler’den Departmanlar’a, oradan Projeler’e akması gerekiyor; modeli değiştirmeden, yalnızca bu ölçüde ilişkiyi çift yönlü yap. (Toplam satırı karşılaştırılmaz.)', sol: 'CALCULATE([Proje Bütçesi], CROSSFILTER(Giderler[DepartmanNo], Departmanlar[DepartmanNo], BOTH))', hint: 'CROSSFILTER(çok taraf sütunu, bir taraf sütunu, BOTH). Teknoloji satırında Yazılım’ın projeleri, 1.140.000 ₺ görünmeli.', grid: [{ t: 'GiderTurleri', c: 'GiderTuru' }, { t: 'Tarih', c: 'Yil' }], noTotal: true },
    { t: 'dax', name: 'Kategori Alıcılarının Talep Sayısı', q: '<b>Kategori Alıcılarının Talep Sayısı</b>: Görünen kategoriden iptal edilmemiş alışverişi olan müşterilerin açtığı destek talebi sayısı ([Talep Sayısı]). Kategori filtresi Talepler’e ulaşmaz; alıcı kümesini Musteriler[MusteriNo]’ya taşı.', sol: 'CALCULATE([Talep Sayısı], TREATAS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), Musteriler[MusteriNo]))', hint: 'Satislar olgu tablosu müşteri ile kategori arasında köprüdür. CALCULATETABLE(VALUES(Satislar[MusteriNo]), …) kümeyi verir, TREATAS onu Musteriler’e uygular; Musteriler de Talepler’i süzer.' },
    { t: 'dax', name: 'Çok Kategorili Alıcı', q: '<b>Çok Kategorili Alıcı</b>: Görünen bağlamda iptal edilmemiş alışverişi olan müşterilerden, (kategori filtresinden bağımsız olarak) en az 4 farklı kategoriden alanların sayısı. Müşteri kümesini FILTER ile dolaş; kategori sayısında Satislar’dan Urunler’e filtre akmadığını unutma.', sol: 'COUNTROWS(FILTER(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), CALCULATE(DISTINCTCOUNT(Urunler[Kategori]), REMOVEFILTERS(Kategoriler), Satislar[Durum] <> "İptal", CROSSFILTER(Satislar[UrunNo], Urunler[UrunNo], BOTH)) >= 4))', hint: 'CROSSFILTER olmadan DISTINCTCOUNT(Urunler[Kategori]) her müşteride 7 verir. REMOVEFILTERS(Kategoriler) satırdaki kategori filtresini iç hesaptan kaldırır. Toplamda 103 bulmalısın.' },
    { t: 'dax', name: 'Ortak Proje Sayısı (Köprü)', q: '<b>Ortak Proje Sayısı (Köprü)</b>: Departman kırılımında, departmanın yer aldığı ortak proje sayısı. Köprüyü ölçü içinde DATATABLE ile kur: ProjeNo, DepartmanNo, Pay sütunları; satırlar {5, 2, 0.7}, {5, 1, 0.3}, {7, 3, 0.6}, {7, 4, 0.4}, {12, 3, 0.5}, {12, 1, 0.3}, {12, 2, 0.2}. Toplam satırında projeler bir kez sayılsın (3), köprü satırı sayısı (7) değil.', sol: 'VAR Kopru = DATATABLE("ProjeNo", INTEGER, "DepartmanNo", INTEGER, "Pay", DOUBLE, {{5, 2, 0.7}, {5, 1, 0.3}, {7, 3, 0.6}, {7, 4, 0.4}, {12, 3, 0.5}, {12, 1, 0.3}, {12, 2, 0.2}}) VAR Gorunen = FILTER(Kopru, [DepartmanNo] IN VALUES(Departmanlar[DepartmanNo])) RETURN COUNTROWS(DISTINCT(SELECTCOLUMNS(Gorunen, "P", [ProjeNo])))', hint: 'Görünen departmanların köprü satırlarını FILTER ile al; proje numaralarını SELECTCOLUMNS ile çek ve DISTINCT ile tekilleştir.', grid: [{ t: 'Departmanlar', c: 'Departman' }] },
    { t: 'query', q: 'Çift saymayı ölç: ROW ile iki sütun döndür. "Satırların toplamı": kategori başına [Müşteri Sayısı] değerlerinin toplamı (SUMX + VALUES(Kategoriler[Kategori])). "Tekil": genel [Müşteri Sayısı].', start: 'EVALUATE\n', sol: 'EVALUATE\nROW(\n    "Satırların toplamı", SUMX(VALUES(Kategoriler[Kategori]), [Müşteri Sayısı]),\n    "Tekil", [Müşteri Sayısı]\n)', hint: 'SUMX her kategori satırında ölçüyü bağlam geçişiyle hesaplar. 628 ile 136 arasındaki fark, müşterilerin birden çok kategoride görünmesidir.' },
    { t: 'mc', q: 'Bir geliştirici Satislar–Musteriler ilişkisini çift yönlü yapmak istiyor; Talepler hem Tarih’e hem Musteriler’e bağlı. Power BI değişikliği kaydetmiyor ya da [Talep Sayısı] yıl kırılımında farklı sonuç vermeye başlıyor. Ne olmuştur?', o: ['Tarih’ten Talepler’e iki filtre yolu oluşmuştur; belirsizlik vardır', 'Talepler tablosunun kardinalitesi bire-bir olmuş, sayımlar ikiye bölünmüştür', 'Çift yönlü ilişki Musteriler’deki RLS rolünü otomatik olarak silmiştir', 'Tarih tablosu artık tarih tablosu olarak işaretli sayılmaz, zaman zekâsı bozulur'], a: 0, why: 'Çift yön, Tarih → Satislar → Musteriler → Talepler yolunu açar; doğrudan Tarih → Talepler yolu zaten var. Eşit öncelikli yollar belirsiz yol hatası doğurur ya da Desktop değişikliği reddeder. Kardinalite değişmez, RLS rolü silinmez, tarih tablosu işareti etkilenmez. Çözüm: ilişkiyi tek yönlü bırakıp gereken ölçüde CROSSFILTER kullanmak.' },
    { t: 'mc', q: 'Hedefler[Kategori] ile Urunler[Kategori] arasına çoka-çok kardinaliteli bir ilişki kurdun. Hedefte olan ama ürün tablosunda henüz ürünü olmayan “Bahçe” kategorisinin hedefi raporda görünmüyor. Neden?', o: ['Çoka-çok ilişkiler yalnızca DirectQuery modundaki tablolarda çalışır', 'Sınırlı ilişkide eşleşmeyen satır için boş satır eklenmez', 'Kategori sütunu metin olduğu için ilişki büyük-küçük harfe duyarlıdır', 'Çapraz filtre yönü tek olduğu için hedefler hiç filtrelenmez'], a: 1, why: 'Çoka-çok kardinalite sınırlı bir ilişkidir: birleşme iç birleşme mantığıyla yapılır ve bütünlük ihlalleri için boş sanal satır eklenmez; eşleşmeyen hedef sessizce kaybolur. İçe aktarmada da çalışır; Power BI metin karşılaştırmasında büyük-küçük harfe duyarsızdır; tek yön Urunler’den Hedefler’e filtreyi zaten taşır. Ortak Kategoriler boyutu bu sorunu yaşamaz.' },
    { t: 'mc', q: 'PMO, departman raporunda ortak projelerin bütçesini “tam” göstermek istiyor; finans ise toplam satırının şirket bütçesine eşit olmasını şart koşuyor. En iyi tasarım hangisi?', o: ['Tek ölçü yeter: toplam satırı zaten tekil projeleri sayar, satırlar da tam görünür', 'Köprüye pay sütunu ekleyip tam bütçeyi kaldırır, yalnızca paylaştırılmış ölçüyü bırakırım', 'İki ayrı ölçü: tam bütçe (toplanmaz) ve paylaştırılmış bütçe (toplanır); adlarında ve ipucunda belirtirim', 'Toplam satırını görselden kapatır, kullanıcıların satırları elle toplamasını isterim'], a: 2, why: 'İki soru farklıdır: sorumluluk büyüklüğü (tam, toplanamaz) ve maliyet dağılımı (paylı, toplanır). İkisini ayrı adlarla vermek iki tarafı da karşılar. Tek ölçüde satırlar toplamla tutmaz ve kullanıcı bunu hata sanar; yalnızca paylı ölçü PMO’nun ihtiyacını karşılamaz; toplamı kapatmak sorunu gizler.' }
  ]
});

/* ---------- 3. Uzman kalıplar (C2 · Uzman DAX) ---------- */
add('ileri-kaliplar', {
  id: 'uzman-kaliplar', lv: 'C2', mod: 'Uzman DAX', min: 42,
  title: 'Uzman kalıplar: devam eden olaylar, karşılaştırılabilir dönem, döviz çevirme ve farklı taneciklikte bütçe',
  sum: 'Açık siparişleri doğru saymak (boş teslim tarihi, yaşlandırma, günlük ortalama), müşteri düzeyinde karşılaştırılabilir dönem ve hayatta kalan yanlılığı, işlem kuru / dönem sonu kuru / sabit kur ayrımı ve eksik kur, aylık hedefi güne dağıtmak ve taneciklik koruması.',
  body: `
<p>“İleri iş kalıpları” dersinde Top N + Diğer, sepet analizi, ürün düzeyinde LFL ve aylık kurla dönüşümün iskeletini kurdun; Measure Lab’de [Yoldaki Sipariş] kalıbını gördün. Bu ders o kalıpları <b>üretime</b> taşıyor: gerçek verinin kenar durumları, aynı sorunun iki farklı doğru tanımı ve raporu sessizce bozan tanecik farkları. Her bölümde önce mevcut çözümün nerede yanlış sayı verdiğini motorla göreceğiz.</p>

<h2>1 · Devam eden olaylar: açık siparişleri doğru saymak</h2>
<p>Lojistik müdürü yılbaşı sabahı soruyor: “31 Aralık 2024 akşamı depoda kaç açık sipariş vardı?” Measure Lab’deki [Yoldaki Sipariş], ay satırlarında 2024 boyunca 1 ile 5 arasında değerler veriyor. Aralık 2024 satırı ise <b>BLANK</b>.</p>
<p>Sebep veride: Aralık’ın son günlerinde verilmiş 6 sipariş (10 satır) hâlâ “Kargoda” ve TeslimTarihi <b>boş</b>. Kalıp <code>Satislar[TeslimTarihi] &gt; Gun</code> koşulunu kullanıyor; DAX’ta BLANK bir tarihle karşılaştırılınca sıfır gibi davranır ve koşul yanlış olur. Yani “henüz teslim edilmemiş” siparişler, tam da sayılması gerekenler, dışarıda kalıyor. Öte yandan iptal edilen 121 satırın da teslim tarihi boş; onları açık saymamalıyız.</p>
<pre class="dax">Açık Sipariş =
VAR Gun = MAX(Tarih[Tarih])
RETURN
    CALCULATE(
        DISTINCTCOUNT(Satislar[SiparisNo]),
        REMOVEFILTERS(Tarih),
        Satislar[Tarih] &lt;= Gun,
        Satislar[Durum] &lt;&gt; "İptal",
        FILTER(
            ALL(Satislar[TeslimTarihi]),
            ISBLANK(Satislar[TeslimTarihi]) || Satislar[TeslimTarihi] &gt; Gun
        )
    )</pre>
<div class="tbl-wrap"><table>
<tr><th>Ay sonu</th><th>[Yoldaki Sipariş]</th><th>[Açık Sipariş]</th></tr>
<tr><td>2024-10</td><td>5</td><td>5</td></tr>
<tr><td>2024-11</td><td>3</td><td>3</td></tr>
<tr><td>2024-12</td><td>BLANK</td><td>6</td></tr>
</table></div>
<p>Geçmiş aylar aynı, çünkü o siparişlerin teslim tarihi artık dolu. Hata yalnızca <b>en güncel</b> dönemde, yani yöneticinin en çok baktığı yerde görünür. Devam eden olay kalıbının genel kuralı: bitiş tarihi boşsa olay <b>hâlâ sürüyordur</b>; iptal gibi “hiç başlamamış” durumları ayrıca dışla.</p>
<h3>Aynı kalıptan türeyen üç soru</h3>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Değişiklik</th><th>31.12.2024</th></tr>
<tr><td>Açık sipariş tutarı</td><td>DISTINCTCOUNT yerine SUM(Satislar[Tutar])</td><td>11.063 ₺</td></tr>
<tr><td>3 günden uzun açık (yaşlandırma)</td><td>Satislar[Tarih] &lt;= Gun - 3</td><td>2 sipariş</td></tr>
<tr><td>Ay içinde ortalama günlük açık sipariş</td><td>AVERAGEX(VALUES(Tarih[Tarih]), [Açık Sipariş])</td><td>Aralık: 6,2 · en yüksek gün: 10</td></tr>
</table></div>
<p>Ay sonu değeri (6) ile ayın günlük ortalaması (6,2) ve zirvesi (10) farklı kararlar doğurur: ay sonu bilanço içindir, ortalama kapasite planı içindir, zirve ise vardiya planı içindir. Raporda hangisini gösterdiğini başlıkta yaz.</p>
<h3>Performans: dinamik ölçü mü, fotoğraf tablosu mu?</h3>
<div class="tbl-wrap"><table>
<tr><th>Yol</th><th>Ne zaman?</th><th>Bedel</th></tr>
<tr><td>Dinamik ölçü (yukarıdaki)</td><td>Ay ya da gün düzeyinde, orta büyüklükte olgu</td><td>Her hücrede tarih filtresi yeniden kurulur; günlük ortalamada gün sayısı × sorgu</td></tr>
<tr><td>Günlük fotoğraf tablosu (Tarih × açık sipariş sayısı)</td><td>Milyonlarca satır, günlük trend sık kullanılıyor</td><td>Yenilemede hesaplanır (Power Query ya da ambar); geçmişe dönük düzeltmelerde yeniden üretmek gerekir</td></tr>
</table></div>
<p>StokGorunum tablosu da bir fotoğraf tablosudur; “Model tasarımı II” dersinde gördüğün gibi aylar boyunca toplanmaz, son değeri alınır. Açık sipariş de aynı türde, <b>yarı toplanabilir</b> bir ölçüdür: yıl satırında 12 ayın toplamı değil, yıl sonu değeri gösterilir.</p>

<h2>2 · Karşılaştırılabilir dönem: hangi müşteriler “aynı”?</h2>
<p>“İleri iş kalıpları” dersinde LFL’yi ürün kümesiyle kurdun: her iki dönemde de satılan ürünler. Aynı fikri müşteriye uyguladığında, ürün analizinde göze batmayan bir tuzak ortaya çıkar. Yönetim kurulu soruyor: “2024’teki %86 büyümenin ne kadarı yeni müşteriden, ne kadarı mevcut müşterinin daha çok harcamasından?”</p>
<div class="tbl-wrap"><table>
<tr><th>Tanım</th><th>Küme</th><th>2024 / 2023</th><th>Büyüme</th></tr>
<tr><td>Tüm müşteriler</td><td>Herkes</td><td>747.066 / 400.870 ₺</td><td>+%86,4</td></tr>
<tr><td>Etkinliğe göre (her iki yılda alan)</td><td>64 müşteri</td><td>—</td><td>+%27,3</td></tr>
<tr><td>Kohorta göre (ilk siparişi 2023’ten önce)</td><td>46 müşteri</td><td>194.668 / 202.047 ₺</td><td>−%3,7</td></tr>
</table></div>
<p>İki “karşılaştırılabilir” tanım, işareti bile farklı iki sonuç veriyor. Etkinliğe dayalı tanım, 2024’te alışverişi bırakan müşterileri tanım gereği dışarıda bırakır: yalnızca “hayatta kalanlar” kalır. Bu <b>hayatta kalan yanlılığı (survivorship bias)</b> mevcut müşteri büyümesini olduğundan iyi gösterir. Kohort tanımı ise kümeyi dönem başında, sonuca bakmadan sabitler; kayıpları da içerir. Eski müşteri tabanı aslında küçülmüş; büyümenin tamamı yeni müşterilerden geliyor.</p>
<pre class="dax">Eski Kohort Satışı =
VAR DonemBasi = MIN(Tarih[Tarih])
VAR KarsilastirmaBasi = EDATE(DonemBasi, -12)
VAR EskiMusteriler =
    CALCULATETABLE(
        VALUES(Musteriler[MusteriNo]),
        REMOVEFILTERS(Tarih),
        Musteriler[IlkSiparis] &lt; KarsilastirmaBasi
    )
RETURN
    CALCULATE([Net Satış], EskiMusteriler)

Eski Kohort Satışı GY =
VAR DonemBasi = MIN(Tarih[Tarih])
VAR KarsilastirmaBasi = EDATE(DonemBasi, -12)
VAR EskiMusteriler =
    CALCULATETABLE(
        VALUES(Musteriler[MusteriNo]),
        REMOVEFILTERS(Tarih),
        Musteriler[IlkSiparis] &lt; KarsilastirmaBasi
    )
RETURN
    CALCULATE([Net Satış], EskiMusteriler, SAMEPERIODLASTYEAR(Tarih[Tarih]))</pre>
<p>Küme, karşılaştırma döneminin <b>başına</b> göre kurulur: 2024 satırında “ilk siparişi 1 Ocak 2023’ten önce olanlar”. Böylece aynı 46 müşteri iki yılda da ölçülür.</p>
<h3>Kenar durumlar</h3>
<ul>
<li><b>Eksik taban yılı:</b> Veri Haziran 2022’de başlıyor. 2023’ün 2022’ye göre büyümesi (+%290) yarım yılı tam yılla karşılaştırır; 2023 satırında LFL’yi gizle ya da yalnızca ortak aylarla hesapla.</li>
<li><b>Bölme biçimi:</b> <code>DIVIDE(A, B) - 1</code> taban boşken BLANK − 1 = <b>−1</b> verir; 2022 satırı “−%100” görünür. <code>DIVIDE(A - B, B)</code> boş döner.</li>
<li><b>Tanımı belgele:</b> Ölçü adına tanımı koy (“Eski Kohort Büyümesi”), açıklamaya kümenin nasıl seçildiğini yaz. “LFL” kısaltması tek başına iki ayrı ekipte iki ayrı şey demektir.</li>
</ul>
<div class="note"><b>Üretimde bayrak</b>Perakendede karşılaştırılabilir mağaza listesi genelde iş kuralıyla (en az 13 ay açık, tadilat yok) belirlenir ve kaynakta ya da Power Query’de dönem başına bir bayrak sütunu olarak tutulur. Dinamik DAX kümesi keşif için iyidir; resmî raporda bayrak, denetlenebilir ve hızlıdır.</div>

<h2>3 · Döviz çevirme: hangi kur, hangi sayı?</h2>
<p>Ortaklara dolar bazlı rapor hazırlanıyor. Kur tablosu DovizKurlari ayda bir satır tutuyor (ayın ilk günü, USD ve EUR) ve Tarih’e bağlı değil. Aylık kurla satış dönüşümünü Measure Lab’deki [Satış (Seçili Para)] yapıyor. Uzman sorusu şu: <b>her sayı aynı kurla mı çevrilir?</b></p>
<div class="tbl-wrap"><table>
<tr><th>Sayı türü</th><th>Örnek</th><th>Doğru kur</th></tr>
<tr><td>Akış (dönem boyunca oluşur)</td><td>Satış, gider, satın alma</td><td>İşlem tarihinin kuru (burada ay kuru); ay ay çevrilip toplanır</td></tr>
<tr><td>Bakiye (bir andaki fotoğraf)</td><td>Stok değeri, açık sipariş tutarı, alacak</td><td>Dönem sonu kuru</td></tr>
<tr><td>Performans karşılaştırması</td><td>Büyüme, hedef sapması</td><td>Sabit kur (iki dönem aynı kurla)</td></tr>
</table></div>
<h3>Akış ve bakiye</h3>
<p>2024 net satışı 747.066 ₺. Aylık kurlarla 22.614 $; tüm yılı Aralık kuruyla (35,00) çevirirsen 21.345 $; yıl ortalama kuruyla (32,78) 22.788 $. Akış için doğru olan ilkidir. Stok değeri ise yıl sonu fotoğrafıdır: 163.465 ₺, dönem sonu kuruyla 4.670 $. Ortalama kurla çevirmek 4.986 $ verir ve bilançoda olmayan bir değeri raporlar.</p>
<pre class="dax">Stok Değeri (USD, Dönem Sonu) =
VAR SonAyBasi = EOMONTH(MAX(Tarih[Tarih]), -1) + 1
VAR Kur =
    LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], SonAyBasi, DovizKurlari[ParaBirimi], "USD")
RETURN
    DIVIDE([Stok Değeri], Kur)</pre>
<h3>Sabit kur: büyümenin ne kadarı kurdan?</h3>
<p>Dolar bazında 2024 büyümesi 22.614 / 16.613 → <b>+%36,1</b>. TL bazında <b>+%86,4</b>. Hangisi “gerçek” performans? İkisini ayırmak için 2024’ün her ayını, 2023’ün aynı ayının kuruyla çevir:</p>
<pre class="dax">Satış USD (GY Kuruyla) =
SUMX(
    VALUES(Tarih[YilAy]),
    VAR GecenYilAyBasi = EDATE(DATEVALUE(Tarih[YilAy] &amp; "-01"), -12)
    VAR Kur =
        LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], GecenYilAyBasi, DovizKurlari[ParaBirimi], "USD")
    RETURN DIVIDE([Net Satış], Kur)
)</pre>
<p>2024 sabit kurla 31.204 $; 2023’e göre <b>+%87,8</b>. Yani iş hacmi neredeyse ikiye katlanmış, TL’nin değer kaybı dolar büyümesini %36’ya indirmiş. Kur etkisi: 22.614 − 31.204 = <b>−8.590 $</b>. Bu ayrıştırma, “dolar büyümesi düşük, ekip başarısız” yanlış sonucunu önler.</p>
<h3>Eksik kur: sessiz kayıp</h3>
<p>Yukarıdaki ölçü 2022 satırında BLANK verir; kur tablosunda 2021 yok. Asıl tehlike toplam satırında: 54.948 $, 2022’yi hiç içermiyor ve hiçbir uyarı yok. Üretimde iki koruma kur:</p>
<ul>
<li><b>Kontrol ölçüsü:</b> görünen aylardan kuru bulunamayanları say; sıfırdan büyükse kartta uyarı göster.</li>
<li><b>Son bilinen kur:</b> kur tablosu bir gün geç yükleniyorsa, “o tarihe kadar bilinen en son kur” mantığı (MAX(DovizKurlari[Tarih]) ≤ gün) boş ay yerine bir önceki ayın kurunu kullanır. Bunu yalnızca iş birimi onaylarsa yap ve açıklamaya yaz.</li>
</ul>
<pre class="dax">Kuru Eksik Ay =
COUNTROWS(
    FILTER(
        VALUES(Tarih[YilAy]),
        ISBLANK(
            LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], EDATE(DATEVALUE(Tarih[YilAy] &amp; "-01"), -12), DovizKurlari[ParaBirimi], "USD")
        )
    )
)</pre>
<p>2022 satırında 12, diğer yıllarda BLANK döner. Toplam satırında da 12: rapor kullanıcısına “bu toplamın 12 ayı eksik” demenin tek yolu budur.</p>

<h2>4 · Farklı taneciklikte bütçe: aylık hedefi güne dağıtmak</h2>
<p>Satış direktörü haftalık toplantı için “haftalık satış ve hedef” tablosu istiyor. Hedefler ay düzeyinde ve her ayın hedefi ayın 1. gününe yazılı. Hafta kırılımında [Hedef] şöyle görünür:</p>
<div class="tbl-wrap"><table>
<tr><th>2024 haftası</th><th>Net satış</th><th>[Hedef]</th><th>Günlük dağıtım</th></tr>
<tr><td>1 (1–7 Ocak, 30–31 Aralık)</td><td>27.516 ₺</td><td>48.500 ₺</td><td>16.655 ₺</td></tr>
<tr><td>2</td><td>6.921 ₺</td><td>BLANK</td><td>10.952 ₺</td></tr>
<tr><td>5 (29 Ocak–4 Şubat)</td><td>5.682 ₺</td><td>46.000 ₺</td><td>11.038 ₺</td></tr>
</table></div>
<p>Ayın 1’ini içeren hafta ayın bütün hedefini alıyor, diğer haftalar hedefsiz. Aynı sorun ay içi “bugüne kadar” raporunda daha da tehlikeli: 1–15 Aralık 2024 satışı 60.134 ₺, [Hedef] 88.400 ₺ gösteriyor ve ekip “%68’deyiz” diye alarm veriyor. Günlük dağıtımla hedef 42.774 ₺, gerçekleşme %141. 2–31 Aralık seçilirse hedef BLANK olur.</p>
<pre class="dax">Hedef (Günlük Dağıtım) =
SUMX(
    VALUES(Tarih[YilAy]),
    VAR Ay = Tarih[YilAy]
    VAR AyHedefi = CALCULATE([Hedef], REMOVEFILTERS(Tarih), Tarih[YilAy] = Ay)
    VAR AyGunSayisi = CALCULATE(COUNTROWS(Tarih), REMOVEFILTERS(Tarih), Tarih[YilAy] = Ay)
    VAR GorunenGun = CALCULATE(COUNTROWS(Tarih))
    RETURN DIVIDE(AyHedefi * GorunenGun, AyGunSayisi)
)</pre>
<p>Her görünen ay için: ayın tam hedefi × (görünen gün / ayın gün sayısı). GorunenGun, bağlam geçişiyle o ayın <b>görünen</b> günlerini sayar; hafta 1’de Ocak için 7, Aralık için 2. Ay ve yıl satırlarında sonuç [Hedef] ile birebir aynıdır (2024: 763.200 ₺), yani ölçü mevcut raporları bozmaz.</p>
<div class="warn"><b>Anti-kalıp: VAR yerine VALUES</b><code>Tarih[YilAy] = Ay</code> yerine <code>VALUES(Tarih[YilAy])</code> yazarsan, “Genişletilmiş tablolar” dersinde gördüğün gibi filtre argümanı dış bağlamda hesaplanır ve hafta 1’de iki ayı birden döndürür. Sonuç 16.655 ₺ yerine 19.873 ₺ olur. Ay, çeyrek ve yıl satırlarında ise iki sürüm aynı sayıyı verir; hata yalnızca ay sınırını kesen kırılımlarda görünür. Testte mutlaka hafta ve “1–15 Aralık” gibi kısmi bir aralık dene.</div>
<h3>Üç strateji</h3>
<div class="tbl-wrap"><table>
<tr><th>Strateji</th><th>Ne yapar?</th><th>Ne zaman?</th></tr>
<tr><td>Dağıt (yukarıdaki)</td><td>Ay hedefini görünen günlere orantılar</td><td>Haftalık ve ay içi takip isteniyorsa</td></tr>
<tr><td>Gizle</td><td>Görünen gün sayısı, görünen ayların tam gün sayısına eşit değilse BLANK</td><td>Hedef ancak ay düzeyinde anlamlıysa; yanlış sayı göstermektense boş</td></tr>
<tr><td>Önceden dağıt</td><td>Power Query’de ya da ambarda gün düzeyinde hedef tablosu</td><td>Büyük model, ağırlıklı dağıtım (iş günü, mevsimsellik)</td></tr>
</table></div>
<pre class="dax">Hedef (Yalnızca Tam Ay) =
VAR GorunenGun = COUNTROWS(Tarih)
VAR TamAyGun = CALCULATE(COUNTROWS(Tarih), REMOVEFILTERS(Tarih), VALUES(Tarih[YilAy]))
RETURN IF(GorunenGun = TamAyGun, [Hedef])</pre>
<p>Burada VALUES doğru kullanım: ölçü iteratör içinde değil, dış bağlamda tek bir kez hesaplanıyor. Eşit dağıtım bir varsayımdır: hafta sonu satışı yüksek bir perakendecide günlere eşit pay vermek hafta içini hep “geride” gösterir. “Zaman serisi analizi” dersindeki haftanın günü endeksiyle ağırlıklandırmak bir sonraki adımdır; bu durumda önceden dağıtılmış gün tablosu daha bakımı kolay olur. Aynı kalıp GiderButce için de geçerlidir: gider bütçesi gider türü × ay düzeyinde, günlük dağıtım ölçüsü gider türü kırılımında [Gider Bütçe] ile aynı sayıyı verir.</p>

<h2>Uzman kalıp kontrol listesi</h2>
<ol>
<li><b>Bitiş tarihi boş olabilir mi?</b> Devam eden olaylarda boş bitiş “sürüyor” demektir; iptal gibi başlamamış durumları ayrıca dışla.</li>
<li><b>Ölçü toplanabilir mi?</b> Açık sipariş ve stok gibi bakiyeler yıl boyunca toplanmaz; dönem sonu ya da ortalama göster, hangisi olduğunu başlığa yaz.</li>
<li><b>Karşılaştırılabilir küme sonuca bakmadan mı seçildi?</b> Etkinliğe dayalı küme hayatta kalan yanlılığı taşır.</li>
<li><b>Sayı akış mı, bakiye mi?</b> Akış işlem kuruyla, bakiye dönem sonu kuruyla; büyüme yorumu sabit kurla.</li>
<li><b>Kur eksik mi?</b> Kontrol ölçüsü toplam satırında da uyarmalı.</li>
<li><b>Bütçe hangi tanecikte?</b> Ay sınırını kesen her kırılımda (hafta, tarih aralığı) hedefin ne gösterdiğini test et; dağıt, gizle ya da önceden dağıt.</li>
<li><b>Belgele:</b> Her uzman ölçünün açıklamasına tanımı, kenar durumu ve test edilen kırılımları yaz. Bu ölçüler ekipte en çok “neden bu sayı?” sorusu alanlardır.</li>
</ol>
`,
  ex: [
    { t: 'dax', name: 'Açık Sipariş Tutarı', q: '<b>Açık Sipariş Tutarı</b>: Görünen dönemin son gününde açık olan siparişlerin satış tutarı (SUM(Satislar[Tutar])). Açık: sipariş tarihi o gün ya da önce, durumu “İptal” değil ve teslim tarihi boş ya da o günden sonra. Tarih tablosundaki filtreyi kaldırmayı unutma.', sol: 'VAR Gun = MAX(Tarih[Tarih]) RETURN CALCULATE(SUM(Satislar[Tutar]), REMOVEFILTERS(Tarih), Satislar[Tarih] <= Gun, Satislar[Durum] <> "İptal", FILTER(ALL(Satislar[TeslimTarihi]), ISBLANK(Satislar[TeslimTarihi]) || Satislar[TeslimTarihi] > Gun))', hint: 'BLANK > tarih yanlıştır; boş teslim tarihini ISBLANK ile ayrıca kabul et. Teslim tarihi koşulu VEYA içerdiği için FILTER(ALL(Satislar[TeslimTarihi]), …) kullan. 2024 satırında 11.063 ₺ çıkmalı.' },
    { t: 'dax', name: 'Üç Günden Uzun Açık Sipariş', q: '<b>Üç Günden Uzun Açık Sipariş</b>: Görünen dönemin son gününde açık olan ve en az 3 gün önce (Gun - 3 ya da daha önce) verilmiş siparişlerin sayısı (DISTINCTCOUNT(Satislar[SiparisNo])). İptaller hariç; teslim tarihi boş ya da o günden sonra.', sol: 'VAR Gun = MAX(Tarih[Tarih]) RETURN CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), REMOVEFILTERS(Tarih), Satislar[Tarih] <= Gun - 3, Satislar[Durum] <> "İptal", FILTER(ALL(Satislar[TeslimTarihi]), ISBLANK(Satislar[TeslimTarihi]) || Satislar[TeslimTarihi] > Gun))', hint: 'Açık sipariş kalıbında tek değişiklik sipariş tarihi koşulu: Satislar[Tarih] <= Gun - 3. Tarihten gün çıkarmak DAX’ta doğrudan çalışır.', grid: [{ t: 'Tarih', c: 'YilAy' }, { t: 'Kategoriler', c: 'Kategori' }] },
    { t: 'dax', name: 'Eski Kohort Büyümesi %', q: '<b>Eski Kohort Büyümesi %</b>: İlk siparişi (Musteriler[IlkSiparis]) görünen dönemin başlangıcından 12 ay önceki tarihten önce olan müşterilerin, bu dönem ile geçen yılın aynı dönemi arasındaki net satış büyümesi. Kümeyi REMOVEFILTERS(Tarih) ile kur; bölmeyi DIVIDE(Bu - Önceki, Önceki) biçiminde yap.', sol: 'VAR DonemBasi = MIN(Tarih[Tarih]) VAR KarsilastirmaBasi = EDATE(DonemBasi, -12) VAR EskiMusteriler = CALCULATETABLE(VALUES(Musteriler[MusteriNo]), REMOVEFILTERS(Tarih), Musteriler[IlkSiparis] < KarsilastirmaBasi) VAR Bu = CALCULATE([Net Satış], EskiMusteriler) VAR Onceki = CALCULATE([Net Satış], EskiMusteriler, SAMEPERIODLASTYEAR(Tarih[Tarih])) RETURN DIVIDE(Bu - Onceki, Onceki)', hint: 'EDATE(MIN(Tarih[Tarih]), -12) karşılaştırma döneminin başıdır. Küme her iki hesapta aynı kalmalı; yalnızca ikinci CALCULATE’e SAMEPERIODLASTYEAR ekle. 2024’te yaklaşık −%3,7.' },
    { t: 'dax', name: 'Stok Değeri (USD, Dönem Sonu)', q: '<b>Stok Değeri (USD, Dönem Sonu)</b>: [Stok Değeri] ölçüsünü, görünen dönemin son ayının USD kuruyla çevir. Son ayın ilk günü: EOMONTH(MAX(Tarih[Tarih]), -1) + 1. Kuru DovizKurlari’ndan iki koşullu LOOKUPVALUE ile bul.', sol: 'VAR SonAyBasi = EOMONTH(MAX(Tarih[Tarih]), -1) + 1 VAR Kur = LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], SonAyBasi, DovizKurlari[ParaBirimi], "USD") RETURN DIVIDE([Stok Değeri], Kur)', hint: 'Stok bir bakiyedir; ortalama kur değil dönem sonu kuru kullanılır. 2024 satırında 163.465 ₺ / 35,00.' },
    { t: 'dax', name: 'Satış USD (Sabit Kur)', q: '<b>Satış USD (Sabit Kur)</b>: Görünen her ayın net satışını, bir önceki yılın aynı ayının USD kuruyla çevir ve topla (SUMX + VALUES(Tarih[YilAy])). Ayın ilk günü: DATEVALUE(Tarih[YilAy] &amp; "-01"); bir yıl öncesi: EDATE(…, -12).', sol: 'SUMX(VALUES(Tarih[YilAy]), VAR GecenYilAyBasi = EDATE(DATEVALUE(Tarih[YilAy] & "-01"), -12) VAR Kur = LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], GecenYilAyBasi, DovizKurlari[ParaBirimi], "USD") RETURN DIVIDE([Net Satış], Kur))', hint: 'VAR’ları SUMX’in içinde tanımla; her ay için yeniden hesaplanır. 2022 satırı BLANK çıkar, çünkü 2021 kuru yok.' },
    { t: 'dax', name: 'Gider Bütçesi (Günlük Dağıtım)', q: '<b>Gider Bütçesi (Günlük Dağıtım)</b>: [Gider Bütçe] ay düzeyinde, ayın ilk gününe yazılı. Görünen her ay için ayın tam bütçesini, ayın görünen gün sayısı / ayın toplam gün sayısı oranında dağıt ve topla. Ayın değerini önce VAR’a al.', sol: 'SUMX(VALUES(Tarih[YilAy]), VAR Ay = Tarih[YilAy] VAR AyButcesi = CALCULATE([Gider Bütçe], REMOVEFILTERS(Tarih), Tarih[YilAy] = Ay) VAR AyGunSayisi = CALCULATE(COUNTROWS(Tarih), REMOVEFILTERS(Tarih), Tarih[YilAy] = Ay) VAR GorunenGun = CALCULATE(COUNTROWS(Tarih)) RETURN DIVIDE(AyButcesi * GorunenGun, AyGunSayisi))', hint: 'VALUES(Tarih[YilAy]) filtre argümanı olarak yazılırsa dış bağlamda hesaplanır ve hafta kırılımında yanlış sonuç verir. VAR Ay = Tarih[YilAy] ve Tarih[YilAy] = Ay kullan.', grid: [{ t: 'Tarih', c: 'HaftaNo' }, { t: 'GiderTurleri', c: 'GiderTuru' }] },
    { t: 'query', q: 'Ay içi hedef tuzağını sayılarla göster: ROW ile üç sütun döndür. "Satış": 1–15 Aralık 2024 net satışı (DATESBETWEEN). "Ay hedefi": Tarih[YilAy] = "2024-12" için [Hedef]. "Gün payı": DIVIDE(15, 31).', start: 'EVALUATE\n', sol: 'EVALUATE\nROW(\n    "Satış", CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024, 12, 1), DATE(2024, 12, 15))),\n    "Ay hedefi", CALCULATE([Hedef], Tarih[YilAy] = "2024-12"),\n    "Gün payı", DIVIDE(15, 31)\n)', hint: 'DATESBETWEEN(Tarih[Tarih], başlangıç, bitiş). Ay hedefi × gün payı, dağıtılmış hedefi verir (yaklaşık 42.774 ₺).' },
    { t: 'mc', q: 'Lojistik panosunda “ay sonu açık sipariş” kartı yalnızca içinde bulunulan ayda BLANK gösteriyor; geçmiş aylar dolu. Ölçü <code>Satislar[TeslimTarihi] &gt; Gun</code> koşulunu kullanıyor. En olası sebep ve çözüm?', o: ['Tarih tablosu bugünden sonrasını içermiyor; tabloyu gelecek yılın sonuna uzatırım', 'Teslim edilmemişlerde teslim tarihi boş; boşu kabul eder, iptali dışlarım', 'Pasif teslim ilişkisi etkin değil; ölçüye USERELATIONSHIP eklerim', 'DISTINCTCOUNT boş sipariş numaralarını sayıyor; COUNTROWS kullanırım'], a: 1, why: 'Açık siparişlerin bitiş tarihi henüz yok; BLANK > tarih yanlış döner ve tam sayılması gerekenler düşer. Geçmiş aylarda teslim tarihleri dolduğu için sorun yalnızca güncel dönemde görünür. Tarih tablosu son günü zaten içeriyor; ölçü ilişki kullanmıyor, sütunları doğrudan karşılaştırıyor; sipariş numaraları boş değil.' },
    { t: 'mc', q: 'CFO, dolar bazlı yönetim raporunda yıl sonu stok değerini ve yıllık satışı birlikte gösterecek. Hangi kur seçimi doğru?', o: ['İkisini de yıl ortalama kuruyla çeviririm; tek kur karşılaştırmayı kolaylaştırır', 'İkisini de yıl sonu kuruyla çeviririm; rapor tarihindeki değer en güncel olandır', 'Satışı ay ay işlem kuruyla, stoku dönem sonu kuruyla çeviririm', 'Satışı yıl sonu, stoku yıl ortalama kuruyla çeviririm; dalgalanma dengelenir'], a: 2, why: 'Satış bir akıştır, yıl boyunca farklı kurlarda oluşur; ay ay çevrilip toplanır. Stok bir bakiyedir, bir andaki fotoğraftır; dönem sonu kuruyla çevrilir. Tek kurla çevirmek akışı ya da bakiyeyi yanlış gösterir; ters eşleştirme ikisini birden bozar.' },
    { t: 'mc', q: 'Pazarlama “mevcut müşteri büyümesi”ni, her iki yılda da alışveriş yapan müşterilerle hesapladı: +%27. Finans, ilk siparişi önceki yıldan eski olan müşterilerle hesapladı: −%4. Yönetim kuruluna hangisini, neden sunarsın?', o: ['Pazarlamanınkini; alışveriş yapmayan müşteri zaten mevcut sayılmaz', 'Finansınkini; küme sonuca bakmadan seçilmiş, kayıpları da içeriyor', 'İkisinin ortalamasını; iki ekibin görüşü dengelenmiş olur', 'Hiçbirini; toplam büyüme (+%86) tek doğru göstergedir'], a: 1, why: 'Etkinliğe dayalı küme, alışverişi bırakanları tanım gereği dışlar (hayatta kalan yanlılığı) ve büyümeyi olduğundan iyi gösterir. Kohort kümesi dönem başında sabitlenir, kayıpları da sayar. Ortalama anlamsızdır; toplam büyüme yeni ve mevcut müşteri katkısını ayırmaz. Sunarken iki tanımı ve farkın sebebini de göstermek iyi pratiktir.' }
  ]
});
})(window);
