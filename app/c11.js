/* Kesit Power BI — dört yeni ders: DAX'ta tarih/metin/sayma, keşifçi veri analizi (EDA), zaman serisi analizi, finansal raporlama. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- 1 · DAX'ta tarih, metin ve sayma fonksiyonları (A2) ---------- */
add('toplama', {
  id: 'dax-tarih-metin', lv: 'A2', mod: 'DAX Temelleri', min: 20,
  title: "DAX'ta tarih, metin ve sayma fonksiyonları",
  sum: 'Altı sayma fonksiyonunun farkı, teslim süresini DATEDIFF ile hesaplamak, EOMONTH, WEEKDAY, NETWORKDAYS, FORMAT ile ay adı üretmek ve metin fonksiyonları. Hangisi hesaplanmış sütunda, hangisi ölçüde kullanılır?',
  body: `
<p><b>Toplama fonksiyonları</b> dersinde SUM, COUNTROWS ve DISTINCTCOUNT ile tanıştın. Bu derste üç küçük ama her gün kullanılan aileyi tamamlıyoruz: <b>sayma</b>, <b>tarih</b> ve <b>metin</b> fonksiyonları. Örneklerin hepsi Anadolu Market modelinden; sayılar bu modelden hesaplandı.</p>

<h2>Sayma ailesi: altı fonksiyon, altı farklı soru</h2>
<p>“Kaç tane?” sorusunun DAX'ta birden çok cevabı var. Fark, <b>boş (BLANK)</b> hücreleri ve <b>tekrar eden</b> değerleri nasıl ele aldıklarındadır. <code>Satislar[KargoGun]</code> sütununda bazı satırlar boştur; bu sütun farkları görmek için idealdir.</p>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Ne sayar?</th><th><code>Satislar[KargoGun]</code> için sonuç</th></tr>
<tr><td><code>COUNTROWS(Satislar)</code></td><td>Tablonun satırlarını; sütunla ilgilenmez</td><td>1.620</td></tr>
<tr><td><code>COUNT</code></td><td>Boş olmayan hücreleri (sayı, tarih, metin)</td><td>1.489</td></tr>
<tr><td><code>COUNTA</code></td><td>Boş olmayan hücreleri; TRUE/FALSE dahil her türü</td><td>1.489</td></tr>
<tr><td><code>COUNTBLANK</code></td><td>Boş hücreleri</td><td>131</td></tr>
<tr><td><code>DISTINCTCOUNT</code></td><td>Farklı değerleri; BLANK da bir değer sayılır</td><td>15</td></tr>
<tr><td><code>DISTINCTCOUNTNOBLANK</code></td><td>Farklı değerleri; BLANK hariç</td><td>14</td></tr>
</table></div>
<p>Kargo günü 0 ile 13 arasında 14 farklı değer alıyor. <code>DISTINCTCOUNT</code> boş hücreyi de ayrı bir değer saydığı için 15 döndürür. Aynı tuzak müşteri tablosunda da var: 150 müşterinin 7'sinin şehri boş. <code>DISTINCTCOUNT(Musteriler[Sehir])</code> 13, <code>DISTINCTCOUNTNOBLANK(Musteriler[Sehir])</code> 12 verir. “Kaç şehre satış yapıyoruz?” sorusunun doğru cevabı 12'dir.</p>
<pre class="dax">Boş Kargo Günü = COUNTBLANK(Satislar[KargoGun])</pre>
<pre class="dax">Şehirli Müşteri = COUNTA(Musteriler[Sehir])</pre>
<div class="tip"><b>COUNT ile COUNTA</b>Güncel DAX'ta COUNT sayı, tarih ve metin değerlerini sayar; yalnızca TRUE/FALSE sütunlarında çalışmaz. Mantıksal (Boolean) bir sütunu saymak için COUNTA kullan. Pratikte ikisi çoğu sütunda aynı sonucu verir.</div>
<p>Boş değerin <b>nedenini</b> de sor: 131 boş kargo gününün 121'i iptal edilen siparişlerde (teslimat hiç olmayacak), 10'u ise hâlâ kargoda olan siparişlerde (henüz bilinmiyor). Sayı aynı, anlamı farklı. Bu konuya Keşifçi veri analizi dersinde döneceğiz.</p>

<h2>Tarih fonksiyonları</h2>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td><code>YEAR</code>, <code>MONTH</code>, <code>DAY</code></td><td><code>MONTH(DATE(2024, 3, 5))</code></td><td>3</td></tr>
<tr><td><code>DATE(yıl, ay, gün)</code></td><td><code>DATE(2024, 3, 5)</code></td><td>5 Mart 2024</td></tr>
<tr><td><code>EOMONTH(tarih, ay kaydırma)</code></td><td><code>EOMONTH(DATE(2024, 2, 10), 0)</code></td><td>29 Şubat 2024 (ayın son günü)</td></tr>
<tr><td><code>WEEKDAY(tarih, 2)</code></td><td><code>WEEKDAY(DATE(2024, 3, 4), 2)</code></td><td>1 (Pazartesi = 1, Pazar = 7)</td></tr>
<tr><td><code>DATEDIFF(başlangıç, bitiş, aralık)</code></td><td><code>DATEDIFF(DATE(2024, 1, 31), DATE(2024, 2, 1), MONTH)</code></td><td>1</td></tr>
<tr><td><code>NETWORKDAYS(başlangıç, bitiş)</code></td><td><code>NETWORKDAYS(DATE(2024, 3, 1), DATE(2024, 3, 31))</code></td><td>21</td></tr>
</table></div>
<p><code>WEEKDAY</code>'in ikinci bağımsız değişkeni haftanın nereden başlayacağını söyler. Varsayılan (1) Pazar = 1'dir; Türkiye'de alışılan sıra için <b>2</b> kullan. Modeldeki <code>Tarih[GunNo]</code> sütunu tam olarak <code>WEEKDAY(Tarih[Tarih], 2)</code> ile aynıdır.</p>
<p><code>DATEDIFF</code> tam ayları değil, <b>geçilen sınırları</b> sayar: 31 Ocak'tan 1 Şubat'a bir gün vardır, ama bir ay sınırı geçildiği için sonuç 1'dir. Aralık olarak DAY, WEEK, MONTH, QUARTER, YEAR (ve saat için HOUR, MINUTE, SECOND) yazılabilir. İkinci tarih birinciden küçükse sonuç negatiftir.</p>
<pre class="dax">Ortalama Teslim Süresi =
AVERAGEX(
    FILTER(Satislar, NOT ISBLANK(Satislar[TeslimTarihi])),
    DATEDIFF(Satislar[Tarih], Satislar[TeslimTarihi], DAY)
)</pre>
<p>Sonuç 3,12 gündür; modeldeki hazır <code>[Ortalama Kargo Günü]</code> ölçüsüyle aynı. Peki <code>FILTER</code>'ı atlarsan ne olur?</p>
<pre class="dax">Teslim Süresi (hatalı) =
AVERAGEX(Satislar, DATEDIFF(Satislar[Tarih], Satislar[TeslimTarihi], DAY))</pre>
<div class="warn"><b>Boş tarih sıfır değildir</b>Tarih hesaplarında boş bir tarih, DAX'ın tarih başlangıcı olan 30 Aralık 1899 gibi işlenebilir. NETWORKDAYS'in belgesi bunu açıkça söyler: tarihlerden yalnızca biri boşsa 30.12.1899 kabul edilir. Bu uygulamanın motorunda yukarıdaki hatalı ölçü −1.596,7 gün döndürür. Teslim tarihi boş satırları her zaman önce ayıkla.</div>
<p><code>NETWORKDAYS(başlangıç, bitiş, [hafta sonu], [tatiller])</code> iş günlerini sayar. Varsayılan hafta sonu Cumartesi–Pazar'dır (kod 1); tatilleri <code>{ DATE(2024, 4, 10), DATE(2024, 4, 11) }</code> gibi tek sütunlu bir tabloyla verirsin. Başlangıç ve bitiş <b>dahildir</b>: aynı gün teslim edilen bir sipariş 1 iş günü sayılır. Teslimatlarda ortalama NETWORKDAYS 2,97 çıkar; “kaç iş günü sürdü?” sorusu için 1 çıkarırsın.</p>

<h2>TODAY ve FORMAT: iki tuzak</h2>
<p><b>TODAY()</b> bilgisayarın bugünkü tarihini döndürür. Ölçüde her sorguda, hesaplanmış sütunda yalnızca yenilemede hesaplanır. Bu modelin verisi 31 Aralık 2024'te biter; “son 30 gün” ölçüsünü <code>TODAY()</code> ile yazarsan bugün boş sonuç alırsın. Geçmiş verili raporlarda “bugün” olarak verinin son tarihini kullan: <code>CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS())</code>. Uygulamanın motoru tutarlı sonuç versin diye TODAY()'i 31.12.2024 kabul eder.</p>
<p><b>FORMAT(değer, biçim)</b> bir değeri <b>metne</b> çevirir. Model kültürü Türkçe olduğunda ay adları Türkçe gelir:</p>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Sonuç</th></tr>
<tr><td><code>FORMAT(DATE(2024, 3, 5), "MMMM yyyy")</code></td><td>Mart 2024</td></tr>
<tr><td><code>FORMAT(DATE(2024, 3, 5), "yyyy-MM")</code></td><td>2024-03</td></tr>
<tr><td><code>FORMAT(DATE(2024, 3, 5), "dddd")</code></td><td>Salı</td></tr>
<tr><td><code>FORMAT(1234.5, "#,0.00")</code></td><td>1.234,50</td></tr>
</table></div>
<pre class="dax">Seçili Ay Metni =
IF(
    HASONEVALUE(Tarih[YilAy]),
    "Satışlar · " &amp; FORMAT(MAX(Tarih[Tarih]), "MMMM yyyy"),
    "Satışlar · tüm dönem"
)</pre>
<div class="warn"><b>FORMAT sayıyı metne çevirir</b>Üç sonucu var. (1) Metin döndüren bir ölçü sütun ya da çizgi grafiğin Y eksenine konamaz; Microsoft'un belgesi de bunu açıkça söyler. (2) Metin olarak sıralanır: "Ağustos", "Aralık"tan önce gelir; "10" ise "9"dan önce. (3) <b>FORMAT(BLANK()) boş metin ("") döndürür</b>, BLANK değil. Ölçü artık hiç boş olmadığı için tablo görseli satışı olmayan tüm satırları da gösterir. Sayıyı yalnızca görünüşü için biçimlendiriyorsan FORMAT yerine ölçünün biçim ayarını ya da dinamik biçim dizesini kullan.</div>

<h2>Metin fonksiyonları</h2>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td><code>LEFT</code> / <code>RIGHT</code> / <code>MID</code></td><td><code>LEFT("Ankara", 3)</code>, <code>MID("ABCDEF", 2, 3)</code></td><td>Ank, BCD</td></tr>
<tr><td><code>LEN</code></td><td><code>LEN("Antalya")</code></td><td>7</td></tr>
<tr><td><code>UPPER</code> / <code>LOWER</code></td><td><code>UPPER(Musteriler[Sehir])</code></td><td>BURSA</td></tr>
<tr><td><code>SEARCH</code> / <code>FIND</code></td><td><code>SEARCH("set", Urunler[Urun], 1, 0)</code></td><td>Bulunduğu konum; yoksa 0</td></tr>
<tr><td><code>SUBSTITUTE</code></td><td><code>SUBSTITUTE("a-b-c", "-", "")</code></td><td>abc</td></tr>
<tr><td><code>TRIM</code></td><td><code>TRIM("  Kot   Pantolon ")</code></td><td>Kot Pantolon (baştaki, sondaki ve aradaki fazla boşluklar gider)</td></tr>
<tr><td><code>CONCATENATE</code> / <code>&amp;</code></td><td><code>CONCATENATE("a", "b")</code>, <code>"a" &amp; "b" &amp; "c"</code></td><td>CONCATENATE yalnızca iki değer alır; <code>&amp;</code> sınırsızdır</td></tr>
<tr><td><code>COMBINEVALUES</code></td><td><code>COMBINEVALUES("|", Satislar[SiparisNo], Satislar[UrunNo])</code></td><td>1|27 (birleşik anahtar)</td></tr>
</table></div>
<p><code>SEARCH</code> büyük-küçük harfe duyarsızdır ve joker karakter kabul eder; <code>FIND</code> duyarlıdır. İkisi de bulamazsa hata verir; dördüncü bağımsız değişkenle (ör. 0) bunun yerine bir değer döndürmelerini söylersin. Ürün adında “set” geçen üç ürünü bulmak:</p>
<pre class="dax">EVALUATE
FILTER(VALUES(Urunler[Urun]), SEARCH("set", Urunler[Urun], 1, 0) &gt; 0)</pre>
<p>Sonuç: Çaydanlık Seti, Seramik Kupa Seti, Dambıl Seti 10kg. <code>COMBINEVALUES</code> ise iki sütunu ayraçla birleştirip tek bir anahtar üretir. Tek sütunlu ilişki kurulması gereken yerlerde (ör. sipariş + ürün) kullanılır; DirectQuery'de bu birleşik anahtarla kurulan ilişkiler için iyileştirilmiştir.</p>
<pre class="dax">EVALUATE
TOPN(5,
    ADDCOLUMNS(VALUES(Musteriler[Sehir]),
        "Büyük harf", UPPER(Musteriler[Sehir]),
        "İlk 3", LEFT(Musteriler[Sehir], 3),
        "Uzunluk", LEN(Musteriler[Sehir])),
    Musteriler[Sehir], ASC)</pre>

<h2>Hesaplanmış sütunda mı, ölçüde mi?</h2>
<p>Bu fonksiyonların çoğu tek bir değer üzerinde çalışır. Nerede kullanacağın, sonucun <b>bir satıra mı</b> yoksa <b>bir seçime mi</b> ait olduğuna bağlıdır:</p>
<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>Yer</th><th>Neden?</th></tr>
<tr><td>Sipariş satırının teslim süresi, ürün kısa adı, sipariş ayı etiketi</td><td>Hesaplanmış sütun (daha iyisi: Power Query)</td><td>Her satıra ait sabit bir etiket; dilimleyicide ve eksende kullanılır</td></tr>
<tr><td>Ortalama teslim süresi, boş kargo günü sayısı</td><td>Ölçü</td><td>Filtreye göre değişen bir toplam</td></tr>
<tr><td>“Mart 2024” başlığı</td><td>Ölçü</td><td>Kullanıcının seçimine bağlı; satırda saklanamaz</td></tr>
<tr><td>Ay adı, yıl-ay, haftanın günü</td><td>Tarih tablosunun sütunu</td><td>Modelde zaten var: <code>Tarih[Ay]</code>, <code>Tarih[YilAy]</code>, <code>Tarih[HaftaninGunu]</code></td></tr>
</table></div>
<div class="note"><b>Ölçüde satır fonksiyonu</b>Ölçüde <code>DATEDIFF(Satislar[Tarih], …)</code> gibi bir sütunu doğrudan yazamazsın; ölçünün “şu anki satırı” yoktur. Satır satır hesap için <code>AVERAGEX</code>, <code>SUMX</code>, <code>FILTER</code> gibi bir yineleyici kullan. Ayrıntısı <b>Yineleyiciler: SUMX, AVERAGEX ve RELATED</b> dersinde.</div>
`,
  ex: [
    { t: 'dax', name: 'Ortalama Teslim Süresi', q: '<b>Ortalama Teslim Süresi</b>: Sipariş tarihinden teslim tarihine geçen gün sayısının ortalaması. Teslim tarihi boş satırları dışarıda bırak; DATEDIFF ve AVERAGEX kullan.', sol: 'AVERAGEX(FILTER(Satislar, NOT ISBLANK(Satislar[TeslimTarihi])), DATEDIFF(Satislar[Tarih], Satislar[TeslimTarihi], DAY))', hint: 'AVERAGEX(FILTER(Satislar, NOT ISBLANK(Satislar[TeslimTarihi])), DATEDIFF(Satislar[Tarih], Satislar[TeslimTarihi], DAY))' },
    { t: 'dax', name: 'Boş Kargo Günü', q: '<b>Boş Kargo Günü</b>: <code>Satislar[KargoGun]</code> sütunu boş olan satırların sayısı.', sol: 'COUNTBLANK(Satislar[KargoGun])', hint: 'Boş hücreleri sayan fonksiyon: COUNTBLANK(Tablo[Sütun]).' },
    { t: 'dax', name: 'Seçili Ay Başlığı', q: '<b>Seçili Ay Başlığı</b>: Tek bir yıl-ay seçiliyse ayı “Mart 2024” biçiminde yaz; değilse "Tüm dönem" döndür. (Kırılım: Tarih[YilAy])', sol: 'IF(HASONEVALUE(Tarih[YilAy]), FORMAT(MAX(Tarih[Tarih]), "MMMM yyyy"), "Tüm dönem")', hint: 'IF(HASONEVALUE(Tarih[YilAy]), FORMAT(MAX(Tarih[Tarih]), "MMMM yyyy"), "Tüm dönem")', grid: [{ t: 'Tarih', c: 'YilAy' }] },
    { t: 'dax', name: 'Hafta Sonu Satırı', q: '<b>Hafta Sonu Satırı</b>: Sipariş tarihi Cumartesi ya da Pazar olan satış satırlarının sayısı. WEEKDAY’i Pazartesi = 1 düzeniyle kullan.', sol: 'COUNTROWS(FILTER(Satislar, WEEKDAY(Satislar[Tarih], 2) > 5))', hint: 'WEEKDAY(tarih, 2) Cumartesi için 6, Pazar için 7 döndürür: COUNTROWS(FILTER(Satislar, WEEKDAY(Satislar[Tarih], 2) > 5)).' },
    { t: 'mc', q: '<code>DISTINCTCOUNT(Musteriler[Sehir])</code> 13, <code>DISTINCTCOUNTNOBLANK(Musteriler[Sehir])</code> 12 döndürüyor. Fark neden?', o: ['Bir şehir iki farklı yazımla girilmiş', 'Şehri boş müşteriler var; ilki boşu da sayar', 'DISTINCTCOUNT büyük-küçük harfe duyarlıdır', 'İkincisi yalnızca satış yapılan şehirleri sayar'], a: 1, why: 'DISTINCTCOUNT, BLANK değerini ayrı bir değer olarak sayar. 7 müşterinin şehri boş olduğu için 12 gerçek şehre bir “boş” eklenir. DISTINCTCOUNTNOBLANK boşu saymaz.' },
    { t: 'mc', q: 'Bir ölçüyü <code>FORMAT([Net Satış], "#,0")</code> olarak yazdın. Hangisi <b>beklenen</b> bir sonuçtur?', o: ['Kartta görünür, ama grafiğin Y eksenine konamaz', 'Ölçü daha hızlı hesaplanır, çünkü metin sıkıştırılır', 'Ondalık ayırıcı her kullanıcıda aynı kalır', 'Boş hücreler grafikte otomatik olarak sıfır çizilir'], a: 0, why: 'FORMAT sonucu metindir. Metin döndüren ölçü sayısal değer isteyen görsellerde (grafikler) kullanılamaz. Ayrıca FORMAT(BLANK()) boş metin döndürür; bu da tabloda satışı olmayan satırları görünür yapar.' },
    { t: 'mc', q: '<code>FIND("set", Urunler[Urun])</code> “Çaydanlık Seti” satırında hata veriyor, <code>SEARCH("set", Urunler[Urun], 1, 0)</code> ise 11 döndürüyor. Neden?', o: ['FIND yalnızca sayısal değerlerde arama yapar', 'SEARCH metni sondan başa doğru tarar', 'FIND büyük-küçük harfe duyarlıdır', 'SEARCH yalnızca ilk kelimeye bakar'], a: 2, why: 'FIND büyük-küçük harfe duyarlıdır; “Seti” büyük S ile başladığı için “set” bulunamaz ve dördüncü bağımsız değişken verilmediği için hata döner. SEARCH duyarsızdır; bulamadığında dördüncü bağımsız değişkeni (0) döndürür.' }
  ]
});

/* ---------- 2 · Keşifçi veri analizi (B2) ---------- */
add('istatistik', {
  id: 'eda', lv: 'B2', mod: 'Analiz', min: 24,
  title: 'Keşifçi veri analizi: eksik değer, dağılım, aykırı değer ve korelasyon',
  sum: 'Bir veri setini rapora dökmeden önce tanımak: eksik değerleri bulup nedenini anlamak, dağılımı histogramla görmek, IQR kuralıyla aykırı değer ayıklamak, kırpma (winsorizing), kutu grafiği ve DAX ile Pearson korelasyonu.',
  body: `
<p>Keşifçi veri analizi (Exploratory Data Analysis, EDA), bir grafiği yayımlamadan önce verinin ne söylediğini ve neyi saklıyor olabileceğini anlamaktır. <b>Temel istatistik, gruplama ve kutulama</b> dersindeki fonksiyonları (MEDIAN, STDEV, PERCENTILE) burada bir yöntemin parçası olarak kullanacağız.</p>

<h2>EDA dört adımda</h2>
<ol>
<li><b>Soru:</b> Neyi merak ediyorsun? “Sipariş tutarları nasıl dağılıyor, birkaç büyük sipariş ortalamayı bozuyor mu?” gibi somut bir soruyla başla.</li>
<li><b>Profil:</b> Her sütunun türü, satır sayısı, boş ve farklı değer sayısı, en küçük ve en büyük değeri.</li>
<li><b>Dağılım:</b> Tek değişkenin şekli: simetrik mi, sağa çarpık mı, uç değerler var mı?</li>
<li><b>İlişki:</b> İki değişken birlikte nasıl hareket ediyor? Dağılım grafiği ve korelasyon.</li>
</ol>
<p>Bu derste soru şu: <code>Satislar[Tutar]</code> (sipariş satırı tutarı) ve <code>Satislar[KargoGun]</code> nasıl bir veri?</p>

<h2>Eksik değer: bul, anla, sonra karar ver</h2>
<p><b>Power Query'de:</b> Görünüm sekmesinde <b>Sütun kalitesi</b> (Column quality) her sütunun üstünde geçerli, hatalı ve boş yüzdesini gösterir. <b>Sütun dağılımı</b> farklı ve benzersiz değer sayısını, <b>Sütun profili</b> ise seçili sütunun istatistiklerini ve değer dağılımını verir. Varsayılan olarak yalnızca ilk 1.000 satıra bakılır; durum çubuğundan “tüm veri kümesine göre sütun profili oluşturma” seçeneğine geç.</p>
<p><b>DAX ile:</b> Rapora bir veri kalitesi kartı koymak için:</p>
<pre class="dax">Eksik Kargo Payı = DIVIDE(COUNTBLANK(Satislar[KargoGun]), COUNTROWS(Satislar))</pre>
<p>Sonuç %8,1: 1.620 satırın 131'inde kargo günü yok. Şimdi en önemli adım: <b>neden yok?</b> 121'i iptal edilmiş sipariş (teslimat hiç olmayacak, eksik değil “uygulanamaz”); 10'u hâlâ kargoda (değer henüz oluşmadı). Doldurma yöntemi seçmeden önce eksikliğin türünü ayır:</p>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Ortalama kargo günü</th><th>Yanlılığı</th></tr>
<tr><td>Satırı yok say (silme)</td><td>3,12</td><td>Eksikler rastgele değilse kalan veri temsilî olmaz. Hâlâ kargoda olan siparişler muhtemelen uzun sürenlerdir; ortalama biraz iyimser kalır.</td></tr>
<tr><td>Sabitle doldur (0)</td><td>2,87</td><td>İptalleri “aynı gün teslim” gibi gösterir; ortalamayı yapay olarak düşürür.</td></tr>
<tr><td>Medyanla doldur (3)</td><td>3,11</td><td>Ortalama neredeyse değişmez ama dağılım daralır, standart sapma küçülür; aykırılar daha az aykırı görünür.</td></tr>
<tr><td>Önceki değer (Power Query: Doldur → Aşağı)</td><td>Sıraya bağlı</td><td>Yalnızca sıralı ve “değer değişene kadar geçerli” verilerde anlamlıdır (ör. bir başlık satırının altındaki satırlar). Sipariş satırlarında rastgele bir komşunun değerini kopyalar.</td></tr>
</table></div>
<div class="warn"><b>İptal edilmiş siparişi doldurma</b>“Uygulanamaz” eksikliği hiçbir değerle doldurma; hesaptan çıkar. Doğru ölçü iptalleri filtreler, kargodaki 10 siparişi ise “açık” olarak ayrıca raporlar. Doldurma bir analiz kararıdır; ne yaptığını raporun notunda yaz.</div>

<h2>Dağılım: histogram ve frekans</h2>
<p>Histogram, sayısal bir değişkeni eşit genişlikte <b>kutulara</b> (bins) böler ve her kutudaki satır sayısını çizer. Power BI'da yerleşik histogram görseli yoktur; bir kutu sütunu (Veri bölmesi → Yeni grup → Kutu) ya da DAX ile frekans tablosu kurup sütun grafiği çizersin. Kutu genişliğini sen seçersin; çok dar kutu gürültü, çok geniş kutu düz bir blok gösterir.</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    GENERATESERIES(0, 2000, 250),
    "Satır", VAR Alt = [Value]
        RETURN COUNTROWS(FILTER(Satislar, Satislar[Tutar] &gt;= Alt &amp;&amp; Satislar[Tutar] &lt; Alt + 250))
)</pre>
<p>Sonuç: 0–250 arası 222 satır, 250–500 arası 384, 500–750 arası 398, 750–1.000 arası 273, 1.000–1.250 arası 139 satır; sonra 30–40 satırlık uzun bir kuyruk 8.999 TL'ye kadar uzanır. Dağılım <b>sağa çarpık</b>: ortalama 831 TL, medyan 640 TL. Ortalama medyandan belirgin büyükse birkaç büyük değer ortalamayı yukarı çekiyordur.</p>
<p>Ekseni bir bağlantısız kutu tablosundan alan bir ölçü yazmak da mümkündür (kutu sınırları bir <code>GENERATESERIES</code> hesaplanmış tablosunda, ölçü <code>SELECTEDVALUE</code> ile sınırı okur). Bu kalıp <b>Segmentasyon</b> dersindeki dinamik dilim kalıbıyla aynıdır.</p>

<h2>Çeyrekler, IQR ve aykırı değer kuralı</h2>
<p>Çeyrekler veriyi dört eşit parçaya böler: Q1 (%25), medyan (%50), Q3 (%75). Çeyrekler açıklığı <b>IQR = Q3 − Q1</b>, verinin ortadaki yarısının genişliğidir. Tukey'in kuralı: <b>Q1 − 1,5 × IQR</b> altı ve <b>Q3 + 1,5 × IQR</b> üstü aykırı değer adayıdır.</p>
<pre class="dax">Tutar Üst Sınırı =
VAR Q1 = PERCENTILE.INC(Satislar[Tutar], 0.25)
VAR Q3 = PERCENTILE.INC(Satislar[Tutar], 0.75)
RETURN Q3 + 1.5 * (Q3 - Q1)</pre>
<p>Tüm veride Q1 = 355,96 TL, Q3 = 899 TL, IQR = 543,04 TL ve üst sınır 1.713,56 TL. Alt sınır negatif çıkar (−458,6); yani alt tarafta aykırı yok. Üst sınırın üstünde <b>138 satır</b> var (%8,5) ve bu satırlar toplam tutarın <b>%32,4</b>'ünü oluşturuyor. Aykırı değer burada “hatalı veri” değil, işin önemli bir parçası: monitör, robot süpürge, koşu bandı gibi pahalı ürünler.</p>
<div class="tip"><b>Sınır bağlama göre değişir</b>Aynı ölçü kategori kırılımında her kategori için kendi çeyreklerini hesaplar: Elektronik'te üst sınır 2.288 TL, Kitap'ta 1.053 TL. “Genel olarak aykırı” ile “kendi grubunda aykırı” farklı sorulardır; raporda hangisini gösterdiğini belli et.</div>
<p><b>Kırpma (winsorizing):</b> Aykırı satırları silmek yerine sınıra çekmek. Üst sınırın üstündeki her değer sınıra eşitlenir; satır sayısı korunur, uç değerlerin etkisi azalır. Ortalama tutar 831 TL'den 707,5 TL'ye iner; aykırıları tamamen silersek 613,9 TL olur. Kırpılmış ortalama, “tipik” siparişi anlatmak için ortalama ile medyan arasında bir uzlaşmadır; ciro raporunda ise asla kırpılmış değer kullanılmaz.</p>

<h2>Kutu grafiği</h2>
<p>Kutu grafiği (box plot) beş sayıyı tek görselde gösterir: kutunun alt ve üst kenarı Q1 ve Q3, içindeki çizgi medyan, bıyıklar (whiskers) 1,5 × IQR sınırına kadar uzanan en uç gözlemler, ötesindeki noktalar aykırı değerler. Kategorileri yan yana koyunca hem merkezi hem yayılımı bir bakışta karşılaştırırsın.</p>
<p>Power BI'da yerleşik kutu grafiği <b>yoktur</b>. İki yol var: AppSource'tan bir özel görsel (custom visual) eklemek ya da kendin kurmak: Q1, medyan, Q3, alt ve üst sınır ölçülerini yazıp bir tabloda ya da hata çubuklu (error bars) bir grafikte göstermek. Özel görsel kullanacaksan kuruluşunun izin verdiği görseller listesine bak.</p>

<h2>İki değişken: dağılım grafiği ve korelasyon</h2>
<p>İki sürekli değişkenin ilişkisine önce <b>dağılım grafiğinde</b> (scatter chart) bak: Değerler alanına iki ölçü, Değerler (Values) kutusuna ayrıntı düzeyi (ör. <code>Urunler[Urun]</code>). Sonra ilişkinin gücünü tek bir sayıyla özetle: <b>Pearson korelasyon katsayısı r</b>, −1 ile +1 arasında, iki değişkenin <b>doğrusal</b> olarak birlikte hareket etme derecesidir.</p>
<p>r = Σ(x − x̄)(y − ȳ) / √(Σ(x − x̄)² · Σ(y − ȳ)²). DAX'ta önce ürün başına bir sanal tablo kurulur, sonra beş toplam <code>SUMX</code> ile hesaplanır:</p>
<pre class="dax">Fiyat Adet r =
VAR T = ADDCOLUMNS(VALUES(Urunler[Urun]),
    "X", CALCULATE(AVERAGE(Urunler[Fiyat])),
    "Y", [Satılan Adet])
VAR T2 = FILTER(T, NOT ISBLANK([X]) &amp;&amp; NOT ISBLANK([Y]))
VAR MX = AVERAGEX(T2, [X])
VAR MY = AVERAGEX(T2, [Y])
RETURN DIVIDE(
    SUMX(T2, ([X] - MX) * ([Y] - MY)),
    SQRT(SUMX(T2, ([X] - MX) ^ 2)) * SQRT(SUMX(T2, ([Y] - MY) ^ 2)))</pre>
<p>Ürün düzeyinde r = −0,60: pahalı ürünler daha az adet satıyor. İki ayrıntı önemli:</p>
<ul>
<li><b>CALCULATE'i unutma.</b> <code>"X", AVERAGE(Urunler[Fiyat])</code> yazarsan satır bağlamı filtreye dönüşmez; her ürün için tüm ürünlerin ortalama fiyatı gelir ve r = 0 çıkar. Ölçü referansı (<code>[Satılan Adet]</code>) ise CALCULATE'i zaten içerir. Bkz. <b>Bağlam geçişi</b> dersi.</li>
<li><b>r yalnızca doğrusal ilişkiyi ölçer.</b> Fiyatlar 79 TL ile 15.999 TL arasında; ilişki eğri. Fiyatın logaritmasıyla (<code>LN</code>) hesaplanan r −0,87'ye çıkar. Önce dağılım grafiğine bakmanın nedeni budur.</li>
</ul>
<p>Kategori kırılımında ilişki daha güçlü: Kozmetik'te −0,96, Elektronik'te −0,86, Kitap'ta −0,51. Gruplar arası farklar (kitaplar ucuz ve çok satar) genel katsayıyı başka yöne çekebilir; her zaman grup içi ilişkiye de bak. <b>İleri istatistik</b> dersi bu formülü eğilim ve z-skoru ile birlikte ele alıyor.</p>

<h2>Korelasyon nedensellik değildir</h2>
<p>Ürün düzeyinde ortalama kargo günü ile iade oranı arasında r = +0,41 çıkıyor. “Kargo geciktikçe müşteri iade ediyor” demek cazip; ama korelasyon tek başına bunu kanıtlamaz:</p>
<ul>
<li><b>Ortak neden (karıştırıcı):</b> Büyük ve kırılgan ürünler hem geç gelir hem daha çok iade edilir; ikisini de ürün türü belirler.</li>
<li><b>Ters yön:</b> İade sürecindeki bir ürün yeniden gönderilir ve kargo süresi uzar.</li>
<li><b>Tesadüf:</b> 40 ürünlük bir örnekte orta büyüklükte bir r rastlantıyla çıkabilir.</li>
</ul>
<p>Nedenselliği test etmek deney (A/B testi) ya da en azından karıştırıcıyı sabit tutan bir karşılaştırma gerektirir: aynı kategoride, aynı fiyat bandında hızlı ve yavaş kargolanan siparişleri karşılaştır. Power BI'daki <b>Temel etkileyiciler</b> görseli de korelasyon bulur, neden bulmaz.</p>
`,
  ex: [
    { t: 'dax', name: 'Tutar Üst Sınırı', q: '<b>Tutar Üst Sınırı</b>: <code>Satislar[Tutar]</code> için Tukey üst sınırı: Q3 + 1,5 × (Q3 − Q1). Çeyrekleri PERCENTILE.INC ile bul.', sol: 'VAR Q1 = PERCENTILE.INC(Satislar[Tutar], 0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar], 0.75) RETURN Q3 + 1.5 * (Q3 - Q1)', hint: 'VAR Q1 = PERCENTILE.INC(Satislar[Tutar], 0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar], 0.75) RETURN Q3 + 1.5 * (Q3 - Q1)' },
    { t: 'dax', name: 'Aykırı Satır Sayısı', q: '<b>Aykırı Satır Sayısı</b>: Tutarı, aynı bağlamdaki Tukey üst sınırının üstünde olan satış satırlarının sayısı.', sol: 'VAR Q1 = PERCENTILE.INC(Satislar[Tutar], 0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar], 0.75) VAR Ust = Q3 + 1.5 * (Q3 - Q1) RETURN COUNTROWS(FILTER(Satislar, Satislar[Tutar] > Ust))', hint: 'Sınırı önce bir VAR olarak hesapla, sonra COUNTROWS(FILTER(Satislar, Satislar[Tutar] > Ust)).' },
    { t: 'dax', name: 'Kırpılmış Ortalama Tutar', q: '<b>Kırpılmış Ortalama Tutar</b>: Üst sınırın üstündeki tutarları sınıra eşitleyerek (winsorizing) hesaplanan ortalama satır tutarı.', sol: 'VAR Q1 = PERCENTILE.INC(Satislar[Tutar], 0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar], 0.75) VAR Ust = Q3 + 1.5 * (Q3 - Q1) RETURN AVERAGEX(Satislar, IF(Satislar[Tutar] > Ust, Ust, Satislar[Tutar]))', hint: 'AVERAGEX(Satislar, IF(Satislar[Tutar] > Ust, Ust, Satislar[Tutar])); Ust önceki alıştırmadaki sınır.' },
    { t: 'dax', name: 'Kategori İçi Fiyat Adet r', q: '<b>Kategori İçi Fiyat Adet r</b>: Ürün düzeyinde liste fiyatı (<code>Urunler[Fiyat]</code>) ile <code>[Satılan Adet]</code> arasındaki Pearson korelasyonu. Boş değerli ürünleri dışarıda bırak.', sol: 'VAR T = ADDCOLUMNS(VALUES(Urunler[Urun]), "X", CALCULATE(AVERAGE(Urunler[Fiyat])), "Y", [Satılan Adet]) VAR T2 = FILTER(T, NOT ISBLANK([X]) && NOT ISBLANK([Y])) VAR MX = AVERAGEX(T2, [X]) VAR MY = AVERAGEX(T2, [Y]) RETURN DIVIDE(SUMX(T2, ([X] - MX) * ([Y] - MY)), SQRT(SUMX(T2, ([X] - MX) ^ 2)) * SQRT(SUMX(T2, ([Y] - MY) ^ 2)))', hint: 'ADDCOLUMNS(VALUES(Urunler[Urun]), "X", CALCULATE(AVERAGE(Urunler[Fiyat])), "Y", [Satılan Adet]) ile başla; CALCULATE olmadan X her üründe aynı olur.' },
    { t: 'query', q: 'Tutarları 500 TL genişliğinde kutulara ayıran bir frekans tablosu: 0, 500, …, 3.000 alt sınırları ve her kutudaki satır sayısı ("Satır" sütunu).', start: 'EVALUATE\n', sol: 'EVALUATE\nADDCOLUMNS(GENERATESERIES(0, 3000, 500), "Satır", VAR Alt = [Value] RETURN COUNTROWS(FILTER(Satislar, Satislar[Tutar] >= Alt && Satislar[Tutar] < Alt + 500)))', hint: 'GENERATESERIES(0, 3000, 500) alt sınırları üretir; her satırda [Value]’yu bir VAR’a al ve FILTER ile o aralıktaki satırları say.' },
    { t: 'mc', q: '131 boş kargo gününün 121’i iptal edilmiş siparişlerde. Ortalama kargo günü için en doğru yaklaşım hangisi?', o: ['Boşları 0 ile doldurmak', 'İptalleri hesaptan çıkarmak', 'Boşları genel medyanla doldurmak', 'Boşları önceki satırın değeriyle doldurmak'], a: 1, why: 'İptal edilen siparişte teslimat hiç olmayacak; bu “uygulanamaz” bir eksikliktir ve doldurulmaz. 0 ortalamayı düşürür, medyan dağılımı daraltır, önceki değer rastgele bir komşuyu kopyalar.' },
    { t: 'mc', q: 'Ürün düzeyinde fiyat–adet korelasyonu −0,60, fiyatın logaritmasıyla −0,87 çıkıyor. Bu ne anlatır?', o: ['Fiyat ile adet arasında hiçbir ilişki yoktur', 'Düşük fiyat yüksek adede kesin olarak neden olur', 'Hesaplama yanlıştır, r iki durumda da aynı olmalı', 'İlişki güçlü ama doğrusal değil, eğrisel'], a: 3, why: 'Pearson r yalnızca doğrusal ilişkiyi ölçer. Değişkeni dönüştürünce r büyüyorsa ilişki eğriseldir. Korelasyon nedensellik kanıtı da değildir.' },
    { t: 'mc', q: 'Power BI’da kategorilere göre kutu grafiği (box plot) çizmek istiyorsun. Hangisi doğru?', o: ['Görselleştirmeler bölmesinde yerleşik bir kutu grafiği vardır', 'Analiz bölmesinden her grafiğe kutu eklenir', 'Yerleşik değil; özel görsel ya da ölçülerle kendi kurulumun', 'Yalnızca Power Query’nin sütun profili gösterir'], a: 2, why: 'Power BI’da yerleşik kutu grafiği yoktur. AppSource’tan bir özel görsel eklenir ya da Q1, medyan, Q3 ve sınır ölçüleri yazılıp tablo veya hata çubuklarıyla gösterilir.' }
  ]
});

/* ---------- 3 · Zaman serisi analizi (C1) ---------- */
add('zaman-ileri', {
  id: 'zaman-serisi', lv: 'C1', mod: 'Zaman Zekâsı', min: 26,
  title: 'Zaman serisi analizi: gün etkisi, mevsimsellik, tahmin ve büyüme oranları',
  sum: 'Bir satış serisini bileşenlerine ayırmak: haftanın günü etkisi, çalışma çizelgesi, mevsimsellik endeksi, yerleşik tahmin ve geriye dönük test, DAX ile basit tahmin, CAGR ve aylık bileşik büyüme.',
  body: `
<p><b>Zaman zekâsı</b> ve <b>Gelişmiş zaman hesapları</b> derslerinde dönemleri karşılaştırmayı (YTD, geçen yıl, hareketli ortalama) öğrendin. Bu derste soruyu değiştiriyoruz: Seri <b>neden</b> böyle hareket ediyor ve bir sonraki ay ne bekleyebiliriz?</p>

<h2>Bir zaman serisinin dört bileşeni</h2>
<div class="tbl-wrap"><table>
<tr><th>Bileşen</th><th>Ne demek?</th><th>Anadolu Market'te</th></tr>
<tr><td>Eğilim (trend)</td><td>Uzun dönemli yön</td><td>Yıllık net satış hızla büyüyor</td></tr>
<tr><td>Mevsimsellik (seasonality)</td><td>Takvime bağlı, her yıl tekrarlanan desen</td><td>Kasım–Aralık yüksek, Ocak ve Nisan düşük</td></tr>
<tr><td>Döngü (cycle)</td><td>Takvime bağlı olmayan, yıllardan uzun dalgalar (ekonomik döngü)</td><td>Üç yıllık veride ayırt edilemez</td></tr>
<tr><td>Düzensizlik (noise)</td><td>Kalan rastgele oynama</td><td>Tek bir büyük siparişin ayı yukarı çekmesi</td></tr>
</table></div>

<h2>Önce veriye bak: 2022 eksik bir yıl</h2>
<p>Tarih tablosu 1 Ocak 2022'de başlıyor, ama ilk satış <b>22 Haziran 2022</b>'de. Yıllık net satış: 2022'de 102.837 TL (yalnızca ~6 ay), 2023'te 400.870 TL, 2024'te 747.066 TL. Bu bilgi aşağıdaki her hesabı etkiler:</p>
<ul>
<li>2022'yi tam yıl gibi kullanan bir büyüme oranı abartılı çıkar.</li>
<li>Takvim günlerine bölünen ortalamalarda 2022'nin ilk yarısı (satış olmayan 172 gün) payda olarak girerse ortalama düşer.</li>
<li>Mevsimsellik endeksinde 2022'nin boş ayları (Ocak–Mayıs) o ayları “düşük sezon” gibi gösterir.</li>
</ul>
<p>Kural: Analize başlamadan önce serinin <b>başlangıç ve bitiş tarihini</b> ve aradaki boş dönemleri yaz.</p>

<h2>Haftanın günü etkisi</h2>
<p>“Hangi gün daha çok satıyoruz?” sorusunun cevabı paydaya bağlıdır. Haftanın gününe göre toplam satış, o günden kaç tane olduğuna bağlı olarak yanıltabilir; bu yüzden <b>gün başına ortalama</b> hesaplanır:</p>
<pre class="dax">Gün Başına Satış =
VAR Ilk = CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS())
RETURN DIVIDE([Net Satış], COUNTROWS(FILTER(Tarih, Tarih[Tarih] &gt;= Ilk)))</pre>
<p>Payda, verinin başladığı günden itibaren o haftanın gününe düşen <b>tüm takvim günleri</b>dir (satışsız günler dahil). Sonuç: Çarşamba 1.590 TL ile en yüksek, Perşembe 1.266 TL ve Pazartesi 1.268 TL ile en düşük; tüm günlerin ortalaması 1.354 TL.</p>
<div class="warn"><b>Satışsız günler de gündür</b>924 günün yalnızca 509'unda satış var. <code>AVERAGEX(VALUES(Tarih[Tarih]), [Net Satış])</code> boş günleri atlar ve “satış olan günlerin ortalaması”nı verir: bu hesapta en yüksek gün Cumartesi (2.758 TL) çıkar. Birinci ölçü “ortalama bir Çarşamba ne getirir?”, ikincisi “satış olan bir Cumartesi ne getirir?” sorusunu cevaplar. Hangisini sorduğunu bil. Ayrıca az veride (1.620 satır) günler arasındaki farkın bir kısmı tesadüftür.</div>

<h2>Çalışma çizelgesi (run chart) ve medyan çizgisi</h2>
<p>Çalışma çizelgesi, zaman ekseninde bir ölçünün çizgi grafiği ve üzerinde <b>medyan çizgisidir</b>. Medyan, uç aylardan etkilenmediği için ortalamadan daha sağlam bir referanstır. Power BI'da çizgi grafiği seç, Analiz bölmesinden <b>Medyan çizgisi</b> ekle; ya da ölçüyle:</p>
<pre class="dax">Aylık Medyan =
VAR Seri = FILTER(ADDCOLUMNS(ALLSELECTED(Tarih[YilAy]), "S", [Net Satış]), NOT ISBLANK([S]))
RETURN MEDIANX(Seri, [S])</pre>
<p>Satış olan 31 ayın medyanı 40.258 TL. Okuma kuralı: Medyanın aynı tarafında art arda <b>6 ya da daha çok nokta</b> varsa bu rastlantı değil, bir <b>kayma</b>dır (shift). Ekim 2023–Mart 2024 arası 6 ay, Mayıs–Aralık 2024 arası 8 ay üst üste medyanın üstünde: seri kalıcı olarak yukarı kaymış. Böyle bir durumda tek bir medyan çizgisi tüm dönemi temsil etmez; çizgiyi kayma noktasından sonra yeniden hesapla.</p>

<h2>Mevsimsellik endeksi</h2>
<p>Mevsimsellik endeksi = bir takvim ayının ortalama satışı / tüm ayların ortalama satışı. 1'in üstü “bu ay normalden güçlü”, altı “zayıf” demektir. 2022 eksik olduğu için yalnızca <b>tam yılları</b> (2023 ve 2024) kullan:</p>
<pre class="dax">Ay Endeksi Tam Yıl =
VAR AyOrt = DIVIDE(
    CALCULATE([Net Satış], KEEPFILTERS(Tarih[Yil] IN {2023, 2024})),
    CALCULATE(DISTINCTCOUNT(Tarih[YilAy]), KEEPFILTERS(Tarih[Yil] IN {2023, 2024})))
VAR GenelOrt = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[Yil] IN {2023, 2024}) / 24
RETURN DIVIDE(AyOrt, GenelOrt)</pre>
<div class="tbl-wrap"><table>
<tr><th>Oca</th><th>Şub</th><th>Mar</th><th>Nis</th><th>May</th><th>Haz</th><th>Tem</th><th>Ağu</th><th>Eyl</th><th>Eki</th><th>Kas</th><th>Ara</th></tr>
<tr><td>0,64</td><td>0,78</td><td>0,92</td><td>0,60</td><td>0,76</td><td>1,06</td><td>1,11</td><td>0,83</td><td>1,09</td><td>1,27</td><td>1,52</td><td>1,44</td></tr>
</table></div>
<p>Toplam satırda endeks 1'dir (bütün ayların ortalaması kendine eşittir); bu iyi bir sağlama. Ama bir sorun var: Seri bir yılda %86 büyüdüğü için yılın son ayları, yalnızca takvim yüzünden değil <b>eğilim yüzünden de</b> yüksek çıkar. Endeksi eğilimden arındırmak için ya her yılı kendi ortalamasına bölüp yılları ortalarsın ya da önce eğilim çizgisini çıkarırsın (<b>İleri istatistik</b> dersindeki en küçük kareler). Kategori kırılımında ölçü her kategorinin kendi mevsimselliğini verir, çünkü <code>REMOVEFILTERS(Tarih)</code> yalnızca tarihi temizler.</p>

<h2>Yerleşik tahmin ve geriye dönük test</h2>
<p>Çizgi grafiğinde Analiz bölmesi → <b>Tahmin</b> (Forecast). Ön koşul: ekseni sürekli bir tarih (ya da tarih hiyerarşisi) olan, tek ölçülü bir çizgi grafik. Ayarlar:</p>
<ul>
<li><b>Tahmin uzunluğu</b> ve birimi (ör. 3 ay).</li>
<li><b>Güven aralığı</b>: tahminin etrafındaki gölgeli bant (ör. %95). Bant genişse model emin değildir.</li>
<li><b>Mevsimsellik</b>: kaç noktada bir tekrar ettiği (aylık veride 12). Otomatik bırakılabilir; 31 aylık seride elle 12 vermek daha güvenlidir.</li>
<li><b>Son noktaları yok say</b> (Ignore last): Son N noktayı modelden saklar ve onları tahmin ettirir.</li>
</ul>
<p>Sonuncusu <b>geriye dönük test</b> (backtest, hindcast) için kullanılır: Son 3 ayı yok say, tahmin edilen 3 ayı gerçekleşenle karşılaştır. Tahmin gerçek değerlerin çok altında ya da üstündeyse, geleceğe dönük tahmine de güvenme. Yerleşik tahmin üstel düzeltmeye dayanır; sonuçları ölçü olarak modele yazılmaz, yalnızca o görselde yaşar.</p>

<h2>DAX ile basit tahmin</h2>
<p>Her ay için “son 3 ayın ortalaması” bir sonraki ayın naif tahminidir. Ölçü, içinde bulunduğu ayı <b>görmeden</b> önceki üç tam aya bakar; böylece geçmişin her ayında bir geriye dönük test yapmış olursun:</p>
<pre class="dax">Naif Tahmin 3 Ay =
VAR Son = MAX(Tarih[Tarih])
RETURN DIVIDE(
    CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], EOMONTH(Son, -4) + 1, EOMONTH(Son, -1))),
    3)</pre>
<p>Aralık 2024 için tahmin 78.158 TL (Eylül–Kasım ortalaması), gerçekleşen 94.001 TL: hata −%16,9. Büyüyen ve mevsimsel bir seride naif ortalama hep geriden gelir. İkinci yöntem <b>geçen yıl × büyüme</b>dir:</p>
<pre class="dax">Tahmin GY x Büyüme =
CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih])) * (1 + 0.8)</pre>
<p>Geçen yılın aynı ayı mevsimselliği taşır, büyüme katsayısı eğilimi. 2024'ün yıllık büyümesiyle (%86,4) Aralık 2023'ten (43.560 TL) yapılan tahmin 81.179 TL, hata −%13,6. Sabit katsayıyı bir <b>ne olur (what-if) parametresine</b> bağlarsan kullanıcı büyüme varsayımını kaydırıcıyla değiştirir.</p>
<div class="note"><b>Gelecek tarihler</b>Tahmini gelecekteki aylarda göstermek için tarih tablosu o ayları da içermelidir. Bu modelin Tarih tablosu 31.12.2024'te biter; 2025 için bir değer görmek istersen önce tarih tablosunu uzatman gerekir.</div>

<h2>Büyüme oranları: CAGR ve CMGR</h2>
<p><b>Bileşik yıllık büyüme oranı</b> (CAGR) = (Son / İlk)^(1 / yıl sayısı) − 1. Dönem boyunca her yıl aynı oranda büyüseydin hangi oranda büyümüş olurdun sorusunu cevaplar.</p>
<ul>
<li><b>Yanlış:</b> 2022 → 2024 yıllık toplamlarıyla CAGR %169,5 çıkar; çünkü 2022 yalnızca altı aydır.</li>
<li><b>Bir yıllık CAGR</b> (2023 → 2024) yıllık büyümeyle aynıdır: %86,4.</li>
<li><b>Adil karşılaştırma:</b> Aynı mevsimi karşılaştır. Temmuz–Aralık 2022 (102.242 TL) ile Temmuz–Aralık 2024 (446.573 TL) arası iki yıldır: CAGR = (446.573 / 102.242)^(1/2) − 1 = <b>%109</b>.</li>
</ul>
<pre class="dax">Yarıyıl CAGR Örnek =
VAR Bas = CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2022, 7, 1), DATE(2022, 12, 31)))
VAR Son = CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024, 7, 1), DATE(2024, 12, 31)))
RETURN POWER(DIVIDE(Son, Bas), 1 / 2) - 1</pre>
<p><b>Bileşik aylık büyüme</b> (CMGR) aynı formülün ay sayısıyla yazılışıdır. Mevsim etkisini azaltmak için aynı ayları seç: Aralık 2023 → Aralık 2024 (12 ay) için CMGR = (94.001 / 43.560)^(1/12) − 1 = <b>ayda %6,6</b>. Ocak 2023 (zayıf ay) ile Aralık 2024'ü (güçlü ay) karşılaştırmak oranı şişirir. Uç noktalar tek aylık değerse gürültüye duyarlıdır; çeyreklik ya da 12 aylık toplamlarla çalışmak daha sağlamdır.</p>

<h2>Anomali</h2>
<p>Mevsimselliği ve eğilimi bilince, “beklenenden sapan” ayı ayırt edebilirsin: Nisan 2024 (34.234 TL) hem önceki hem sonraki aylardan belirgin düşük. Power BI'daki <b>Anomali bul</b> özelliği ve z-skoruyla işaretleme <b>Analiz özellikleri ve yapay zekâ görselleri</b> ile <b>İleri istatistik</b> derslerinde anlatılıyor. Bir anomaliyi raporlamadan önce veri hatası olup olmadığını (eksik yükleme, iptal dalgası) kontrol et.</p>
`,
  ex: [
    { t: 'dax', name: 'Gün Başına Satış', q: '<b>Gün Başına Satış</b>: Net satışı, verinin ilk satış gününden itibaren bağlamdaki takvim günü sayısına böl (satışsız günler de paydada). İlk satış günü filtrelerden bağımsız olsun.', sol: 'VAR Ilk = CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS()) RETURN DIVIDE([Net Satış], COUNTROWS(FILTER(Tarih, Tarih[Tarih] >= Ilk)))', hint: 'VAR Ilk = CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS()) RETURN DIVIDE([Net Satış], COUNTROWS(FILTER(Tarih, Tarih[Tarih] >= Ilk)))', grid: [{ t: 'Tarih', c: 'HaftaninGunu' }, { t: 'Kategoriler', c: 'Kategori' }] },
    { t: 'dax', name: 'Yarıyıl CAGR', q: '<b>Yarıyıl CAGR</b>: Temmuz–Aralık 2022 ile Temmuz–Aralık 2024 net satışı arasındaki bileşik yıllık büyüme oranı (2 yıl).', sol: 'VAR Bas = CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2022, 7, 1), DATE(2022, 12, 31))) VAR Son = CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024, 7, 1), DATE(2024, 12, 31))) RETURN POWER(DIVIDE(Son, Bas), 1 / 2) - 1', hint: 'İki dönemi DATESBETWEEN ile ayrı VAR’lara al; POWER(DIVIDE(Son, Bas), 1 / 2) - 1.', grid: [{ t: 'Kategoriler', c: 'Kategori' }] },
    { t: 'dax', name: 'Ay Endeksi Tam Yıl', q: '<b>Ay Endeksi Tam Yıl</b>: Yalnızca 2023 ve 2024 verisiyle, bağlamdaki ayların aylık ortalama satışının iki yılın 24 aylık ortalamasına oranı. (Kırılım: Tarih[Ay])', sol: 'VAR AyOrt = DIVIDE(CALCULATE([Net Satış], KEEPFILTERS(Tarih[Yil] IN {2023, 2024})), CALCULATE(DISTINCTCOUNT(Tarih[YilAy]), KEEPFILTERS(Tarih[Yil] IN {2023, 2024}))) VAR GenelOrt = CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[Yil] IN {2023, 2024}) / 24 RETURN DIVIDE(AyOrt, GenelOrt)', hint: 'Pay: KEEPFILTERS(Tarih[Yil] IN {2023, 2024}) ile satış / aynı filtreyle DISTINCTCOUNT(Tarih[YilAy]). Payda: REMOVEFILTERS(Tarih) ile iki yılın satışı / 24.', grid: [{ t: 'Tarih', c: 'Ay' }] },
    { t: 'dax', name: 'Naif Tahmin 3 Ay', q: '<b>Naif Tahmin 3 Ay</b>: Bağlamdaki son tarihin ayından önceki üç tam ayın ortalama net satışı (içinde bulunulan ay hariç). (Kırılım: Tarih[YilAy])', sol: 'VAR Son = MAX(Tarih[Tarih]) RETURN DIVIDE(CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], EOMONTH(Son, -4) + 1, EOMONTH(Son, -1))), 3)', hint: 'Önceki üç ay: EOMONTH(Son, -4) + 1 ile EOMONTH(Son, -1) arası. DATESBETWEEN ile filtrele ve 3’e böl.', grid: [{ t: 'Tarih', c: 'YilAy' }] },
    { t: 'mc', q: 'Yerleşik tahminde “Son noktaları yok say” değerini 3 yaptın. Bu ayar ne işe yarar?', o: ['Son üç ayı saklayıp tahmini onlarla sınamaya', 'Güven aralığını son üç aya göre daraltmaya', 'Mevsimselliği üç aylık bir döngüye sabitlemeye', 'Tahmini üç ay daha ileriye uzatmaya'], a: 0, why: 'Ignore last, son N noktayı modelin görmediği bir test dönemi yapar. Tahmin edilen değerler gerçekleşenlerle karşılaştırılır; bu geriye dönük testtir (hindcast).' },
    { t: 'mc', q: 'Veri 22 Haziran 2022’de başlıyor. 2022 ve 2024 yıllık toplamlarıyla CAGR %169,5 çıkıyor. En iyi düzeltme hangisi?', o: ['2022’yi 2 ile çarpıp tam yıl saymak', 'Aynı yarıyılları karşılaştırmak', 'CAGR yerine yalnızca 2024 toplamını raporlamak', 'Yıl sayısını 2 yerine 3 almak'], a: 1, why: 'Eksik yılı tam yıl gibi kullanmak oranı şişirir. 2022’yi ikiyle çarpmak mevsimselliği yok sayar. Temmuz–Aralık 2022 ile Temmuz–Aralık 2024’ü karşılaştırmak hem kapsamı hem mevsimi eşitler (%109).' },
    { t: 'mc', q: 'Gün Başına Satış’ta en yüksek gün Çarşamba, <code>AVERAGEX(VALUES(Tarih[Tarih]), [Net Satış])</code> ile Cumartesi çıkıyor. Neden?', o: ['Tarih tablosu tarih tablosu olarak işaretlenmemiş', 'WEEKDAY varsayılan olarak Pazar’dan başlar', 'İkincisi satışsız günleri ortalamaya almıyor', 'AVERAGEX yalnızca son yılın günlerine bakar'], a: 2, why: 'AVERAGEX boş değerleri atlar; yalnızca satış olan günlerin ortalamasını verir. 924 günün 509’unda satış var. Birinci ölçü satışsız günleri de paydaya katar; iki ölçü farklı soruları cevaplar.' }
  ]
});

/* ---------- 4 · Finansal raporlama (C1) ---------- */
add('segmentasyon', {
  id: 'finans', lv: 'C1', mod: 'Analiz', min: 28,
  title: 'Finansal raporlama: gelir tablosu, bütçe sapması, oranlar ve finansal fonksiyonlar',
  sum: 'Satış ve maliyet verisinden küçük bir kâr-zarar tablosu kurmak (yardımcı tablo + SWITCH), bütçe sapması, oran panosu, FV/PV/PMT ile paranın zaman değeri, XNPV ve XIRR ile yatırım kararı ve ne olur parametresiyle duyarlılık.',
  body: `
<p>Finans ekibi bir raporda üç şey arar: <b>tutarlar bir gelir tablosu düzeninde mi</b>, <b>bütçeye göre neredeyiz</b> ve <b>bir kararın parasal değeri ne</b>. Anadolu Market modelinde faaliyet giderleri <code>Giderler</code>, bütçesi <code>GiderButce</code>, türleri <code>GiderTurleri</code> tablosundadır; bilanço yoktur. Gelir tablosunu faaliyet kârına kadar gerçek veriyle kurarız. Şirket ölçeği öğretim için sıkıştırılmıştır: <code>Giderler</code> tutarları satışa göre küçük, <code>Calisanlar[Maas]</code> ile aynı ölçekte değildir.</p>

<h2>Gelir tablosunun mantığı</h2>
<p>Gelir tablosu (kâr-zarar tablosu, P&amp;L) yukarıdan aşağı okunur; her satır bir öncekinden bir kalem düşer:</p>
<ol>
<li><b>Brüt satış:</b> Liste fiyatıyla satış (adet × birim fiyat).</li>
<li><b>− İndirimler</b> → <b>Satış (indirim sonrası)</b></li>
<li><b>− İadeler</b> → <b>Net satış</b></li>
<li><b>− Satılan malın maliyeti (SMM)</b> → <b>Brüt kâr</b>. Brüt kâr / net satış = <b>brüt marj</b>.</li>
<li><b>− Faaliyet giderleri</b> (pazarlama, genel yönetim, personel) → <b>FAVÖK</b> (faiz, amortisman ve vergi öncesi kâr; İngilizcede EBITDA). Operasyonun nakit üretme gücüne yakın bir göstergedir.</li>
<li><b>− Amortisman, faiz, vergi</b> → <b>Net kâr</b>.</li>
</ol>
<p>Modelde 5. satıra kadar inebiliriz: hazır <code>[Gider]</code> ve <code>[Faaliyet Kârı]</code> ölçüleri <code>Giderler</code> tablosunu kullanır. Amortisman ayrı tutulmadığı için buna tam FAVÖK değil, faaliyet kârı diyoruz. Dikkat: modeldeki <code>[Net Satış]</code> yalnızca iptalleri çıkarır, iadeleri değil. Muhasebe dilindeki net satış için iadeyi ayrıca düşmek gerekir. Bir ölçüye ad verirken hangi tanımı kullandığını açıklamasına yaz.</p>

<h2>Modelden küçük bir kâr-zarar tablosu</h2>
<p>Matrisin satırlarında “Brüt satış, İndirimler, …” gibi <b>kalem adları</b> olmalı; ama bu adlar modelde bir sütun değil. Kalıp: kalemleri tutan bir <b>yardımcı tablo</b> (Giriş → Veri gir) ve kalem başına doğru ölçüyü seçen bir <b>SWITCH</b> ölçüsü.</p>
<pre class="dax" data-notry>-- Yardımcı tablo: KZKalemleri (Sira, Kalem), Kalem sütunu Sira'ya göre sıralı
KZ Tutarı =
VAR IadeMaliyet = CALCULATE([Toplam Maliyet], Satislar[Durum] = "İade")
VAR NetSatis = [Net Satış] - [İade Tutarı]
VAR SMM = [Net Maliyet] - IadeMaliyet
RETURN SWITCH(SELECTEDVALUE(KZKalemleri[Sira]),
    1, CALCULATE([Brüt Tutar], Satislar[Durum] &lt;&gt; "İptal"),
    2, -[İndirim Tutarı],
    3, [Net Satış],
    4, -[İade Tutarı],
    5, NetSatis,
    6, -SMM,
    7, NetSatis - SMM)</pre>
<p>Aynı mantığı yardımcı tabloyu sorgunun içinde kurarak deneyebilirsin:</p>
<pre class="dax">EVALUATE
VAR Kalemler = SELECTCOLUMNS(
    { (1, "Brüt satış"), (2, "İndirimler"), (3, "Satış (indirim sonrası)"), (4, "İadeler"),
      (5, "Net satış"), (6, "Satılan malın maliyeti"), (7, "Brüt kâr") },
    "Sira", [Value1], "Kalem", [Value2])
VAR IadeMaliyet = CALCULATE([Toplam Maliyet], Satislar[Durum] = "İade")
RETURN ADDCOLUMNS(Kalemler, "Tutar", SWITCH([Sira],
    1, CALCULATE([Brüt Tutar], Satislar[Durum] &lt;&gt; "İptal"),
    2, -[İndirim Tutarı],
    3, [Net Satış],
    4, -[İade Tutarı],
    5, [Net Satış] - [İade Tutarı],
    6, -([Net Maliyet] - IadeMaliyet),
    7, [Net Satış] - [İade Tutarı] - ([Net Maliyet] - IadeMaliyet)))</pre>
<div class="tbl-wrap"><table>
<tr><th>Kalem</th><th>Tutar (TL)</th></tr>
<tr><td>Brüt satış</td><td>1.291.856</td></tr>
<tr><td>İndirimler</td><td>−41.084</td></tr>
<tr><td>Satış (indirim sonrası)</td><td>1.250.772</td></tr>
<tr><td>İadeler</td><td>−80.835</td></tr>
<tr><td><b>Net satış</b></td><td><b>1.169.937</b></td></tr>
<tr><td>Satılan malın maliyeti</td><td>−743.418</td></tr>
<tr><td><b>Brüt kâr</b></td><td><b>426.519</b> (marj %36,5)</td></tr>
</table></div>
<p>Satılan malın maliyetinden iade edilen ürünlerin maliyeti (51.246 TL) düşüldü; ürün stoğa geri döndüğü varsayımıyla. Gider kalemleri tutarları negatif yazılır; böylece matrisin toplamı anlamlı olmaz ama her satır doğru okunur. Ara toplam satırlarını (Net satış, Brüt kâr) koşullu biçimlendirmeyle kalın göster; matrisin kendi toplam satırını kapat.</p>
<div class="tip"><b>Kalem sırası</b>Yardımcı tablonun Kalem sütununu “Sütuna göre sırala” ile Sira'ya bağla; yoksa kalemler alfabetik dizilir. Bu kalıp, <b>Hesaplama grupları, alan parametreleri, görsel hesaplamalar</b> dersindeki ölçü seçme mantığıyla akrabadır.</div>

<h2>Bütçe sapması</h2>
<p>Bütçe (ya da hedef) sapması iki biçimde verilir: <b>tutar</b> olarak (gerçekleşen − bütçe) ve <b>yüzde</b> olarak ((gerçekleşen − bütçe) / bütçe). Modeldeki <code>Hedefler</code> tablosu kategori ve ay düzeyindedir (ayrıntı düzeyi farkı için <b>Hedef ve gerçekleşen</b> dersine bak).</p>
<pre class="dax">Bütçe Sapma Yüzdesi = DIVIDE([Net Satış] - [Hedef], [Hedef])</pre>
<p>Toplamda net satış 1.250.772 TL, hedef 1.299.300 TL: sapma −48.528 TL, yani <b>−%3,7</b>. Yıllara göre: 2022 −%23,0, 2023 −%0,4, 2024 −%2,1. 2022'deki büyük açık bir performans sorunu değil; hedefler Ocak'tan, satışlar 22 Haziran'dan başlıyor. Sapmayı yorumlamadan önce iki tarafın aynı dönemi kapsadığını kontrol et.</p>
<p>Sapma <b>işareti</b> kaleme göre yorumlanır: satışta pozitif sapma iyi, maliyette kötüdür. Koşullu biçimlendirmede renk kuralını kaleme göre ters çevir. Oranlarda (marj gibi) sapma <b>yüzde puan</b> olarak verilir: %36,5 marj ile %35 hedef arasındaki fark +1,5 puandır, %4,3 değil.</p>

<h3>Gider bütçesi: gerçek veriyle sapma</h3>
<p><code>GiderButce</code> gider türü ve ay düzeyindedir. Hazır ölçüler:</p>
<pre class="dax">Gider Sapma Kontrol = [Gider] - [Gider Bütçe]</pre>
<p>Gider tarafında işaret terstir: pozitif sapma bütçe aşımı, yani kötü haberdir. <b>Örnek raporlar → Finansal Performans</b> raporu bu ölçüleri ve <code>GiderTurleri[Grup]</code> kırılımını kullanır.</p>

<h2>Oranlar ve oran panosu</h2>
<div class="tbl-wrap"><table>
<tr><th>Oran</th><th>Tanım</th><th>Modelde</th></tr>
<tr><td>Brüt marj</td><td>Brüt kâr / net satış</td><td><code>[Kâr Marjı %]</code> = %36,5</td></tr>
<tr><td>İndirim oranı</td><td>İndirim / brüt satış</td><td><code>[Ortalama İndirim %]</code> = %3,2</td></tr>
<tr><td>İade oranı (satır)</td><td>İade satırı / tüm satırlar</td><td><code>[İade Oranı %]</code> = %6,8</td></tr>
<tr><td>İade oranı (tutar)</td><td>İade tutarı / satış</td><td><code>DIVIDE([İade Tutarı], [Net Satış])</code> = %6,5</td></tr>
<tr><td>İptal oranı</td><td>İptal satırı / tüm satırlar</td><td><code>[İptal Oranı %]</code> = %7,5</td></tr>
</table></div>
<p>Aynı adlı oranın iki tanımı (satır ya da tutar bazlı) farklı sonuç verir; panoya hangisini koyduğunu yaz. Kategoriye göre tutar bazlı iade oranı Kozmetik'te %10,9, Spor'da %3,9. Oran panosunda her oranı <b>kendi hedefi ve geçen yılı</b> ile birlikte göster; tek başına bir yüzde iyi mi kötü mü söylemez. Pano tasarımı için <b>Koşullu biçimlendirme ve KPI'lar</b> dersine bak.</p>

<h2>Paranın zaman değeri: FV, PV, PMT</h2>
<p>Bugünkü 1 TL, bir yıl sonraki 1 TL'den değerlidir; çünkü bugün yatırıp faiz alabilirsin. DAX, Excel'deki finansal fonksiyonların aynısını içerir. İşaret kuralı da Excel'deki gibidir: <b>senden çıkan para negatif</b>, sana gelen pozitif.</p>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Soru</th><th>Örnek</th><th>Sonuç</th></tr>
<tr><td><code>FV(oran, dönem, ödeme, [bd], [tür])</code></td><td>Her ay 10.000 TL yatırırsam 12 ay sonra ne birikir? (aylık %3)</td><td><code>FV(0.03, 12, -10000)</code></td><td>141.920 TL</td></tr>
<tr><td><code>PV(oran, dönem, ödeme)</code></td><td>3 yıl boyunca yılda 120.000 TL almanın bugünkü değeri? (%30)</td><td><code>PV(0.30, 3, -120000)</code></td><td>217.934 TL</td></tr>
<tr><td><code>PMT(oran, dönem, bd)</code></td><td>500.000 TL krediyi 24 ayda aylık %3,5 ile öderken taksit?</td><td><code>PMT(0.035, 24, -500000)</code></td><td>31.136 TL</td></tr>
</table></div>
<p>Oranın ve dönemin <b>aynı birimde</b> olmasına dikkat et: aylık taksit için aylık oran ve ay sayısı. Yıllık %42 nominal oran aylık 0,42 / 12 = 0,035'tir. Son bağımsız değişken <b>tür</b> (type) ödemenin dönem sonunda (0, varsayılan) mı başında (1) mı yapıldığını söyler: <code>FV(0.03, 12, -10000, 0, 1)</code> 146.178 TL döndürür.</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(GENERATESERIES(12, 36, 12),
    "Taksit", PMT(0.035, [Value], -500000),
    "Toplam Ödeme", PMT(0.035, [Value], -500000) * [Value])</pre>
<p>Vade 12 aydan 36 aya uzayınca taksit 51.742 TL'den 24.642 TL'ye iner; ama toplam ödeme 620.904 TL'den 887.115 TL'ye çıkar.</p>

<h2>Yatırım kararı: XNPV ve XIRR</h2>
<p><b>Net bugünkü değer</b> (NBD, NPV): Bir yatırımın tüm nakit akışlarını, istenen getiri oranıyla bugüne indirip toplamak. NBD &gt; 0 ise yatırım istenen getiriden fazlasını kazandırır. <b>İç verim oranı</b> (İVO, IRR): NBD'yi sıfır yapan oran; yatırımın kendi getirisi.</p>
<p>DAX'ta düzensiz tarihli akışlar için <code>XNPV(tablo, değer, tarih, oran)</code> ve <code>XIRR(tablo, değer, tarih)</code> kullanılır. İndirgeme ilk akışın tarihine göre, (gün farkı / 365) üssüyle yapılır. Akışlarda en az bir negatif ve bir pozitif değer olmalı. Örnek: Depo otomasyonu için 1 Ocak 2025'te 300.000 TL yatırım; sonraki iki yıl boyunca her çeyrek 50.000 TL ek brüt kâr (varsayımsal bir proje):</p>
<pre class="dax">EVALUATE
VAR Akis = SELECTCOLUMNS(GENERATESERIES(0, 8),
    "Tarih", EDATE(DATE(2025, 1, 1), 3 * [Value]),
    "Nakit", IF([Value] = 0, -300000, 50000))
RETURN ROW(
    "NBD (%25)", XNPV(Akis, [Nakit], [Tarih], 0.25),
    "İVO", XIRR(Akis, [Nakit], [Tarih]))</pre>
<p>Sonuç: NBD 13.920 TL, İVO %30,6. Şirketin istediği getiri %25 ise proje kabul edilir (NBD pozitif, İVO &gt; %25). İstenen getiri %35 olsaydı NBD −10.159 TL olurdu ve proje reddedilirdi.</p>
<div class="note"><b>Nakit akışı tablosu</b>Gerçek bir modelde nakit akışları bir tabloda (ör. Excel'den gelen bir yatırım planı) durur ve ölçü <code>XNPV(Akislar, Akislar[Tutar], Akislar[Tarih], 0.25)</code> biçiminde yazılır. Sorgu içinde <code>SELECTCOLUMNS(GENERATESERIES(…))</code> ya da <code>{ (DATE(2025, 1, 1), -250000), … }</code> tablo oluşturucusuyla küçük bir tablo kurmak deneme için yeterlidir.</div>

<h2>Ne olur parametresiyle duyarlılık</h2>
<p>NBD, varsayılan orana çok duyarlıdır. <b>Segmentasyon</b> dersindeki ne olur (what-if) parametresi kalıbı burada da işler: Modelleme → Yeni parametre → Sayısal aralık ile 0,10–0,40 arasında 0,05 adımlı bir “İskonto Oranı” parametresi oluştur; ölçü <code>SELECTEDVALUE</code> ile seçili oranı okur.</p>
<pre class="dax" data-notry>NBD Senaryo =
XNPV(Akislar, Akislar[Tutar], Akislar[Tarih],
     SELECTEDVALUE('İskonto Oranı'[İskonto Oranı], 0.25))</pre>
<p>Parametre tablosunu bir çizgi grafiğin eksenine koyarsan <b>duyarlılık eğrisini</b> görürsün; eğrinin sıfırı kestiği nokta İVO'dur:</p>
<pre class="dax">EVALUATE
VAR Akis = SELECTCOLUMNS(GENERATESERIES(0, 8),
    "Tarih", EDATE(DATE(2025, 1, 1), 3 * [Value]),
    "Nakit", IF([Value] = 0, -300000, 50000))
RETURN ADDCOLUMNS(GENERATESERIES(0.10, 0.40, 0.05), "NBD", XNPV(Akis, [Nakit], [Tarih], [Value]))</pre>
<p>%10'da 59.949 TL, %20'de 27.750 TL, %30'da 1.336 TL, %35'te −10.159 TL. Satış tarafında aynı soruyu Segmentasyon dersindeki fiyat senaryosuyla sorarsın: fiyat %5 artarsa adet ve kâr ne olur? İkisini bir sayfada birleştirmek, yatırımın getirisinin fiyat varsayımına ne kadar bağlı olduğunu gösterir.</p>
`,
  ex: [
    { t: 'dax', name: 'Bütçe Sapma Yüzdesi', q: '<b>Bütçe Sapma Yüzdesi</b>: Net satışın hedeften sapması, hedefin yüzdesi olarak: (gerçekleşen − hedef) / hedef.', sol: 'DIVIDE([Net Satış] - [Hedef], [Hedef])', hint: 'DIVIDE([Net Satış] - [Hedef], [Hedef])' },
    { t: 'dax', name: 'Marj Sapması Puan', q: '<b>Marj Sapması Puan</b>: Brüt kâr marjının (<code>[Kâr Marjı %]</code>) %35 hedef marjdan farkı, yüzde puan olarak (ör. 0,015 = +1,5 puan).', sol: '[Kâr Marjı %] - 0.35', hint: 'Oranlarda sapma çıkarmayla bulunur: [Kâr Marjı %] - 0.35. Bölme yaparsan yüzde değişim elde edersin, puan değil.' },
    { t: 'dax', name: 'İade Sonrası Brüt Kâr', q: '<b>İade Sonrası Brüt Kâr</b>: (Net satış − iade tutarı) − (net maliyet − iade edilen satırların maliyeti). İade satırları <code>Satislar[Durum] = "İade"</code>.', sol: '([Net Satış] - [İade Tutarı]) - ([Net Maliyet] - CALCULATE([Toplam Maliyet], Satislar[Durum] = "İade"))', hint: 'İade maliyeti: CALCULATE([Toplam Maliyet], Satislar[Durum] = "İade"). Satıştan iadeyi, maliyetten iade maliyetini düş.' },
    { t: 'query', q: '600.000 TL kredi, aylık %3 faiz. 12, 24, 36 ve 48 ay vadeler için aylık taksiti ("Taksit") gösteren bir tablo döndür (taksit pozitif çıksın).', start: 'EVALUATE\n', sol: 'EVALUATE\nADDCOLUMNS(GENERATESERIES(12, 48, 12), "Taksit", PMT(0.03, [Value], -600000))', hint: 'GENERATESERIES(12, 48, 12) vadeleri üretir; PMT(0.03, [Value], -600000). Kredi tutarını negatif yazınca taksit pozitif gelir.' },
    { t: 'query', q: '1 Ocak 2025’te −200.000 TL, ardından 1 Ocak 2026, 2027 ve 2028’de 90.000 TL nakit akışı olan bir yatırımın %20 oranla NBD’sini ("NBD") ve İVO’sunu ("İVO") tek satırda döndür. Akış tablosunu SELECTCOLUMNS(GENERATESERIES(...)) ile kur.', start: 'EVALUATE\n', sol: 'EVALUATE\nVAR Akis = SELECTCOLUMNS(GENERATESERIES(0, 3), "Tarih", DATE(2025 + [Value], 1, 1), "Nakit", IF([Value] = 0, -200000, 90000))\nRETURN ROW("NBD", XNPV(Akis, [Nakit], [Tarih], 0.20), "İVO", XIRR(Akis, [Nakit], [Tarih]))', hint: 'GENERATESERIES(0, 3) dört satır verir; tarih DATE(2025 + [Value], 1, 1), nakit IF([Value] = 0, -200000, 90000). Sonra ROW("NBD", XNPV(...), "İVO", XIRR(...)).' },
    { t: 'mc', q: 'Bir projenin %25 oranla NBD’si −8.000 TL, İVO’su %22. Hangi yorum doğru?', o: ['Proje zarar eder, İVO negatif olmalıdır', '%25’i karşılamıyor; bu oranla reddedilir', 'NBD ile İVO çelişiyor, hesap hatalı', 'İVO pozitif olduğu için kabul edilmelidir'], a: 1, why: 'İVO (%22) istenen getiriden (%25) düşük, bu yüzden %25 ile indirgenmiş NBD negatiftir. İkisi aynı kararı verir: proje kendi parasını çıkarır ama istenen getiriyi sağlamaz.' },
    { t: 'mc', q: 'Kâr-zarar matrisinde kalemler “Brüt kâr, Brüt satış, İadeler…” diye alfabetik diziliyor. Çözüm nedir?', o: ['SWITCH’teki kalemlerin sırasını değiştirmek', 'Matrisin toplam satırını kapatmak', 'Kalemleri büyük harfle yazmak', 'Kalem sütununu Sira’ya göre sıralamak'], a: 3, why: 'Satır başlıkları yardımcı tablonun Kalem sütunundan gelir. “Sütuna göre sırala” ile Kalem’i Sira’ya bağlamak, gelir tablosunun yukarıdan aşağı düzenini korur. SWITCH’in sırası görseldeki sırayı etkilemez.' },
    { t: 'mc', q: 'Bu modelde [Faaliyet Kârı] ölçüsüne neden tam FAVÖK (EBITDA) demiyoruz?', o: ['Amortisman ayrı bir kalem olarak tutulmuyor', 'DAX’ta FAVÖK fonksiyonu yoktur', 'Modelde faaliyet gideri hiç yok', 'Hedefler tablosu aylık olduğu için'], a: 0, why: 'Faaliyet giderleri Giderler tablosunda var, ama amortisman, faiz ve vergi ayrı tutulmuyor. Bu yüzden ölçü “brüt kâr − faaliyet giderleri”dir; adını da buna göre koyarız.' },
    { t: 'dax', name: 'Faaliyet Kârı Marjı', q: '<b>Faaliyet Kârı Marjı</b>: Brüt kârdan faaliyet giderlerini (<code>Giderler[Tutar]</code> toplamı) çıkar, net satışa böl. Hazır <code>[Brüt Kâr]</code> ve <code>[Net Satış]</code> ölçülerini kullan.', sol: 'DIVIDE([Brüt Kâr] - SUM(Giderler[Tutar]), [Net Satış])', hint: 'Payda net satış, payda sıfır olabilir: güvenli bölme kullan.', explain: 'Giderler tablosu kategoriye bağlı değildir; kategori satırlarında giderin tamamı düşülür. Bu tür kırılımda yorumu buna göre yap.' }
  ]
});
})(window);
