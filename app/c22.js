/* Kesit Power BI — c22: Özel takvimler (mali yıl, ISO hafta, 4-4-5, takvim tabanlı zaman zekâsı) ve büyük modeller (artımlı yenileme, hibrit tablo, toplamalar, bileşik model) */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

add('zaman-ileri', {
  id: 'ozel-takvim', lv: 'C1', mod: 'Zaman Zekâsı', min: 40,
  title: 'Özel takvimler: mali yıl, hafta tabanlı ve 4-4-5 takvimlerle zaman zekâsı',
  sum: 'Temmuz başlangıçlı mali yıl, ISO hafta ve hafta tabanlı yıl, perakende 4-4-5 takvimi, 364 gün geriye hafta karşılaştırması, hazır zaman zekâsı fonksiyonlarının bozulduğu yerler, sütun tabanlı özel zaman zekâsı ve önizlemedeki takvim tabanlı zaman zekâsı.',
  body: `
<p>“Zaman zekâsı” ve “Gelişmiş zaman hesapları” derslerinde her şey ocakta başlayan Gregoryen takvimle çalıştı. Şirketlerde bu nadiren yeterlidir. Finans ekibi yılı temmuzda başlatır, mağaza ekibi haftayla yaşar, satın alma ekibi 4-4-5 dönemleriyle plan yapar. Bu derste aynı Tarih tablosunu üç takvime çevirecek ve hazır fonksiyonların nerede yanlış sayı ürettiğini göreceksin.</p>

<h2>Üç ekip, üç takvim</h2>
<p>Anadolu Market’te pazartesi sabahı üç ayrı istek geliyor:</p>
<ul>
<li><b>Finans:</b> “Mali yılımız 1 Temmuz’da başlıyor. Mart 2024 satırında mali yılbaşından bugüne satışı görmek istiyorum.”</li>
<li><b>Mağaza operasyonu:</b> “Geçen haftayı, geçen yılın aynı haftasıyla karşılaştır. Pazartesiyi pazartesiyle karşılaştırmalıyız.”</li>
<li><b>Satın alma:</b> “Dönemlerimiz 4-4-5 haftalık. Her dönem pazartesi başlayıp pazar bitiyor. Dönem 3’ün toplamı lazım.”</li>
</ul>
<div class="tbl-wrap"><table>
<tr><th>Takvim</th><th>Yıl nasıl başlar?</th><th>En küçük birim</th><th>Hazır fonksiyonlar çalışır mı?</th></tr>
<tr><td>Gregoryen</td><td>1 Ocak</td><td>Gün → ay</td><td>Evet</td></tr>
<tr><td>Kaydırılmış Gregoryen (mali yıl)</td><td>Sabit bir tarih (1 Temmuz)</td><td>Gün → ay</td><td>Büyük ölçüde evet, yıl sonu parametresiyle</td></tr>
<tr><td>Hafta tabanlı (ISO, 4-4-5)</td><td>Bir pazartesi; tarihi her yıl değişir</td><td>Gün → hafta → dönem</td><td>Hayır; aylar ve yıllar tutmaz</td></tr>
</table></div>
<p>Modeldeki <code>Tarih[HaftaNo]</code> ISO 8601 hafta numarası, <code>Tarih[GunNo]</code> haftanın günüdür (1 = Pazartesi).</p>

<h2>Mali yıl: Temmuz başlangıçlı yıl</h2>
<h3>Hazır yol: yıl sonu parametresi</h3>
<p><code>DATESYTD</code> ve <code>TOTALYTD</code>, isteğe bağlı bir <b>yıl sonu tarihi</b> (year_end_date) alır. Microsoft Learn’e göre bu bir metin sabitidir, yıl kısmı yok sayılır ve biçimi raporu oluşturan istemcinin yerel ayarına bağlıdır: bir makinede <code>"6-30"</code>, diğerinde <code>"30-6"</code> olabilir. Varsayılan 31 Aralık’tır.</p>
<pre class="dax">Mali YTD (hazır) =
TOTALYTD([Net Satış], Tarih[Tarih], "6-30")

Mali YTD (DATESYTD) =
CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6-30"))</pre>
<div class="note"><b>Playground’da dene</b>İki ölçü de Mart 2024 için 401.796,75 ₺ döner; takvim yılı YTD’si 155.390,75 ₺’dir. Yine de yıl sonu dizesi bölgesel ayara bağlı olduğu için ekip modellerinde aşağıdaki açık kalıp daha güvenlidir; her iki yerde de aynı sonucu verir.</div>
<h3>Sütun ve tarih aritmetiğiyle aynı hesap</h3>
<pre class="dax">Mali YTD =
VAR son = MAX(Tarih[Tarih])
VAR bas = IF(MONTH(son) &gt;= 7, DATE(YEAR(son), 7, 1), DATE(YEAR(son) - 1, 7, 1))
RETURN CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], bas, son))

Mali YTD GY =
CALCULATE([Mali YTD], SAMEPERIODLASTYEAR(Tarih[Tarih]))</pre>
<p>Motor görünen dönemin son gününü (<code>son</code>) okur, mali yılın ilk gününü (<code>bas</code>) hesaplar, sonra <code>DATESBETWEEN</code> Tarih[Tarih] filtresini bu aralıkla değiştirir; işaretli tarih tablosunda Yıl ve Ay filtreleri de kalkar. Sonuçlar:</p>
<div class="tbl-wrap"><table>
<tr><th>Satır</th><th>Takvim YTD</th><th>Mali YTD</th><th>Mali YTD GY</th></tr>
<tr><td>Mart 2024</td><td>155.390,75</td><td>401.796,75 (Tem 2023–Mar 2024)</td><td>169.796,10 (Tem 2022–Mar 2023)</td></tr>
<tr><td>Temmuz 2024</td><td>—</td><td>60.948,00 (yeni mali yılın ilk ayı)</td><td>—</td></tr>
</table></div>
<p>Tam mali yıllar: MY2023 256.705,75; MY2024 546.898,75; MY2025 henüz yarım, 446.572,95.</p>
<h3>Mali yıl sütunları</h3>
<p>Ölçülerin yanında rapor da mali yılı göstermeli. Tarih tablosuna üç sütun eklenir. Aşağıdaki sorgu bu sütunları üretip her ayın ilk gününde gösterir:</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    FILTER(Tarih, Tarih[Gun] = 1),
    "MaliYil", Tarih[Yil] + IF(Tarih[AyNo] &gt;= 7, 1, 0),
    "MaliAyNo", MOD(Tarih[AyNo] + 5, 12) + 1,
    "MaliCeyrek", "MÇ" &amp; (INT(MOD(Tarih[AyNo] + 5, 12) / 3) + 1)
)</pre>
<ul>
<li><b>Adlandırma:</b> Mali yıl bittiği yılla adlandırılır (Tem 2023–Haz 2024 = MY2024). Bu bir şirket kararıdır; belgele.</li>
<li><b>Sıralama:</b> Mali raporda ayları <code>MaliAyNo</code>’ya göre sırala.</li>
<li><b>Toplam satırı:</b> Toplamda son gün 31 Aralık 2024’tür; Mali YTD 446.572,95 gösterir, bu bütün yılların toplamı değildir. Gizle ya da <code>ISINSCOPE</code> ile boş döndür.</li>
</ul>

<h2>ISO hafta ve hafta tabanlı yıl</h2>
<p>ISO 8601’e göre hafta pazartesi başlar. Yılın ilk haftası, o yılın ilk perşembesini içeren haftadır. Bu yüzden bir yıl 52 ya da 53 hafta sürer. Yılın ilk birkaç günü önceki yılın son haftasına, son birkaç günü sonraki yılın ilk haftasına düşebilir. DAX’ta <code>WEEKNUM(tarih, 21)</code> ISO hafta numarasını verir.</p>
<p>Modelde bunu görmek kolay: 1–2 Ocak 2022’nin <code>HaftaNo</code> değeri 52, 30–31 Aralık 2024’ün değeri 1’dir.</p>
<h3>Anti-kalıp: Yıl × HaftaNo</h3>
<p>Mağaza müdürü bir matrise <code>Tarih[Yil]</code> ve <code>Tarih[HaftaNo]</code> koyuyor. 2024 / Hafta 1 hücresinde 27.516,05 görünüyor. Oysa ISO 2024’ün ilk haftası (1–7 Ocak) 16.728,05’tir. Aradaki 10.788,00, 30–31 Aralık 2024’e aittir. O iki gün ISO 2025’in ilk haftasıdır ama Gregoryen yıl 2024 olduğu için aynı hücreye girer. Yani hafta 1 iki ayrı haftanın toplamıdır.</p>
<pre class="dax">EVALUATE
ROW(
    "Yanlis", CALCULATE([Net Satış], Tarih[Yil] = 2024, Tarih[HaftaNo] = 1),
    "Dogru", CALCULATE([Net Satış],
        FILTER(ALL(Tarih), YEAR(Tarih[Tarih] - Tarih[GunNo] + 4) = 2024 &amp;&amp; Tarih[HaftaNo] = 1))
)</pre>
<p>Çözüm, haftayla birlikte <b>hafta tabanlı yılı</b> da saklamaktır. Kural basit: bir günün ISO yılı, o haftanın perşembesinin yılıdır. Perşembe = <code>Tarih - GunNo + 4</code>. Haftanın başlangıcı = <code>Tarih - GunNo + 1</code>.</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    FILTER(Tarih, Tarih[Tarih] &gt;= DATE(2024, 12, 28)),
    "ISOYil", YEAR(Tarih[Tarih] - Tarih[GunNo] + 4),
    "HaftaBaslangic", Tarih[Tarih] - Tarih[GunNo] + 1,
    "HaftaAnahtari", YEAR(Tarih[Tarih] - Tarih[GunNo] + 4) &amp; "-H" &amp; IF(Tarih[HaftaNo] &lt; 10, "0", "") &amp; Tarih[HaftaNo]
)</pre>
<p>28–29 Aralık “2024-H52”, 30–31 Aralık “2025-H01” çıkar. Görselde ve dilimleyicide Yıl × HaftaNo yerine <code>HaftaAnahtari</code> (ya da ISOYil × HaftaNo) kullan.</p>

<h2>Perakende 4-4-5 takvimi</h2>
<p>Perakendede aylar karşılaştırılabilir değildir: bir ayda beş, diğerinde dört cumartesi olur. 4-4-5 takviminde yıl 52 haftadır, her çeyrek 13 haftadır ve çeyrek 4 + 4 + 5 haftalık üç döneme bölünür. Her dönem aynı gün başlar ve biter. 4-5-4 ve 5-4-4 de yaygındır.</p>
<p>Bedeli: Gregoryen yılla her yıl bir gün (artık yılda iki) kayma birikir ve 5–6 yılda bir <b>53. hafta</b> eklenir. Bu haftanın hangi döneme gireceği bir iş kararıdır. 2026, 53 haftalık bir ISO yılıdır.</p>
<p>ISO haftayı perakende haftası olarak kabul edersek dönem numarası haftadan hesaplanır:</p>
<pre class="dax">EVALUATE
VAR g =
    ADDCOLUMNS(
        FILTER(Tarih, YEAR(Tarih[Tarih] - Tarih[GunNo] + 4) = 2024),
        "Donem",
            VAR hw = Tarih[HaftaNo]
            VAR c = MIN(4, INT((hw - 1) / 13) + 1)
            VAR wq = hw - (c - 1) * 13
            RETURN (c - 1) * 3 + IF(wq &lt;= 4, 1, IF(wq &lt;= 8, 2, 3)),
        "S", [Net Satış]
    )
RETURN GROUPBY(g, [Donem], "SatisliGun", COUNTX(CURRENTGROUP(), [S]), "Satis", SUMX(CURRENTGROUP(), [S]))</pre>
<p><code>MIN(4, …)</code> 53. haftayı dördüncü çeyreğe, <code>wq</code> 14 olduğu için de son döneme (D12) koyar. 2024 perakende yılının sonuçlarından birkaçı: D1 (4 hafta) 43.545,85; D3 (5 hafta) 63.251,60; D12 (5 hafta) 105.592,25. Beş haftalık dönemi dört haftalıkla doğrudan karşılaştırma; haftalık ortalamaya bak.</p>

<h2>Hafta bazlı karşılaştırma: 364 gün geri</h2>
<p>Mağaza ekibinin sorusuna dönelim: ISO 2024’ün 10. haftası (4–10 Mart 2024) net satışı 23.869,65. Geçen yılın karşılığı ne?</p>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Karşılaştırılan günler</th><th>Sonuç</th></tr>
<tr><td><code>SAMEPERIODLASTYEAR</code></td><td>4–10 Mart 2023 (Cumartesi–Cuma)</td><td>7.998,30</td></tr>
<tr><td><code>DATEADD(Tarih[Tarih], -364, DAY)</code></td><td>6–12 Mart 2023 (Pazartesi–Pazar)</td><td>7.126,30</td></tr>
</table></div>
<p><code>SAMEPERIODLASTYEAR</code> takvim tarihini korur, haftanın gününü değil. “Zaman serisi analizi” dersindeki gün etkisi yüzünden farklı gün karışımlı iki pencereyi karşılaştırmak büyüme oranını bozar. 364 = 52 × 7 olduğu için <code>DATEADD(…, -364, DAY)</code> her günü haftanın aynı gününe taşır.</p>
<pre class="dax">Satış GY Hafta Hizalı =
CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -364, DAY))</pre>
<h3>Kenar durumlar</h3>
<ul>
<li><b>Yıl düzeyi:</b> 2024 satırında 364 gün kaydırma 2 Ocak 2023–2 Ocak 2024 penceresini verir: 402.716,95; <code>[Satış GY]</code> ise 400.869,55. Hizalı ölçüyü yalnızca hafta ve gün kırılımlarında kullan.</li>
<li><b>53 haftalık yıl:</b> 53. haftanın geçen yılda karşılığı yoktur. Boş mu bırakılacak, 52. haftayla mı karşılaştırılacak? Kararı iş birimiyle ver ve ölçü açıklamasına yaz.</li>
<li><b>Eksik veri:</b> Satışlar 22 Haziran 2022’de başlıyor; 2022’de hizalı geçen yıl boştur, büyüme için <code>DIVIDE</code> kullan.</li>
</ul>

<h2>Hazır fonksiyonlar nerede bozulur?</h2>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Mali yıl (kaydırılmış)</th><th>Hafta tabanlı / 4-4-5</th></tr>
<tr><td><code>TOTALYTD</code>, <code>DATESYTD</code></td><td>Yıl sonu parametresiyle doğru</td><td>Yanlış: yıl başı sabit bir tarih değil</td></tr>
<tr><td><code>SAMEPERIODLASTYEAR</code>, <code>DATEADD(…, YEAR)</code></td><td>Doğru (12 ay kaydırma)</td><td>Haftanın günü kayar</td></tr>
<tr><td><code>TOTALMTD</code>, <code>PREVIOUSMONTH</code></td><td>Doğru (aylar aynı)</td><td>Yanlış: dönem ay değildir</td></tr>
<tr><td><code>PARALLELPERIOD(…, QUARTER)</code></td><td>Takvim çeyreği döner, mali çeyrek değil</td><td>13 haftalık çeyrek değil</td></tr>
<tr><td><code>STARTOFYEAR</code>, <code>ENDOFYEAR</code></td><td>Yıl sonu parametresi alır</td><td>Gregoryen yıl sınırları</td></tr>
</table></div>
<p>Hazır fonksiyonlar takvimi tarih aritmetiğiyle bilir; mantık <b>sütunlarda</b> yaşıyorsa (ISOYil, Donem, HaftaSira) bunu göremez.</p>

<h2>Sütun tabanlı özel zaman zekâsı</h2>
<p>Hazır fonksiyonların yerine üç adımlı bir kalıp kullanılır:</p>
<ol>
<li>Görünen bağlamdan konumu oku: <code>MAX(Tarih[Tarih])</code>, <code>MAX(Tarih[HaftaSira])</code>.</li>
<li>Tarih tablosundaki filtreleri kaldır: <code>REMOVEFILTERS(Tarih)</code> ya da <code>ALL(Tarih)</code>.</li>
<li>Yeni dönemi sütunlarla tarif et: <code>Tarih[ISOYil] = y &amp;&amp; Tarih[Tarih] &lt;= son</code>.</li>
</ol>
<p>Örneğin hafta başından bugüne (WTD) yalnızca tarih aritmetiğiyle yazılabilir:</p>
<pre class="dax">Hafta Başından Satış =
VAR son = MAX(Tarih[Tarih])
VAR bas = son - WEEKDAY(son, 2) + 1
RETURN CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], bas, son))</pre>
<p>Üretim modelinde ise sütunlar fiziksel olarak Tarih tablosunda (Power Query ya da kaynakta) bulunur. <code>HaftaSira</code>, ilk haftadan itibaren 1, 2, 3… diye artan bir sıradır. “Önceki hafta” için <code>HaftaNo - 1</code> yeterli değildir, çünkü 1. haftanın öncesi 0 değil, geçen yılın 52. ya da 53. haftasıdır:</p>
<pre class="dax" data-notry>Önceki Hafta (sütunla) =
VAR s = MAX(Tarih[HaftaSira])
RETURN CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[HaftaSira] = s - 1)

Perakende YTD (sütunla) =
VAR y = MAX(Tarih[ISOYil])
VAR son = MAX(Tarih[Tarih])
RETURN CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[ISOYil] = y, Tarih[Tarih] &lt;= son)</pre>
<div class="tbl-wrap"><table>
<tr><th>Yol</th><th>Ne zaman?</th><th>Performans</th><th>Bakım</th></tr>
<tr><td>Tarih aritmetiği (<code>DATESBETWEEN</code>, <code>DATEADD … DAY</code>)</td><td>Kural sabit gün sayısıyla anlatılabiliyorsa</td><td>İyi</td><td>Kolay ama kural kodda gizli</td></tr>
<tr><td><code>FILTER(ALL(Tarih), ifade)</code></td><td>Hızlı deneme, sütun eklenemiyorsa</td><td>Her satırda ifade hesaplanır; büyük takvimde yavaşlar</td><td>Zor: aynı ifade her ölçüde tekrar eder</td></tr>
<tr><td>Fiziksel sütunlar + <code>REMOVEFILTERS</code></td><td>Kalıcı model, ekip çalışması</td><td>En iyi: basit sütun filtreleri depolama motoruna gider</td><td>Kolay: kural tek yerde, Tarih tablosunda</td></tr>
</table></div>
<p>“DAX optimizasyonu” dersinde gördüğün gibi basit sütun eşitlikleri depolama motorunda çözülür; satır satır ifade hesaplayan <code>FILTER</code> formül motoruna iş bırakır.</p>
<div class="warn"><b>REMOVEFILTERS’ı unutma</b>Tarih[Tarih] üzerine filtre koyan hazır fonksiyonlar, işaretli tarih tablosunda diğer Tarih filtrelerini kendiliğinden kaldırır. Sütun filtresi (Tarih[ISOYil]) bunu yapmaz. <code>REMOVEFILTERS(Tarih)</code> olmadan, rapordaki Gregoryen Yıl = 2024 dilimleyicisi 2025-H01’in 30–31 Aralık günleriyle kesişir ve hafta yarım görünür.</div>
<p><b>Test:</b> Her özel ölçüyü DAX sorgu görünümünde bilinen bir haftayla (2024-H10 = 23.869,65) ve yılın ilk/son haftasıyla dene.</p>

<h2>Takvim tabanlı zaman zekâsı (önizleme)</h2>
<p>Power BI 2025’te bu sorunu doğrudan çözen bir özellik getirdi: <b>takvim tabanlı zaman zekâsı</b> (calendar-based time intelligence). Tarih tablosunda bir ya da birkaç <b>takvim</b> tanımlarsın; zaman zekâsı fonksiyonlarına tarih sütunu yerine takvimin adını verirsin. Microsoft Learn sayfası özelliği Ekim 2026 itibarıyla hâlâ <b>önizleme</b> olarak etiketliyor.</p>
<h3>Nasıl açılır, nasıl tanımlanır?</h3>
<ol>
<li><b>Dosya → Seçenekler ve ayarlar → Seçenekler → Önizleme özellikleri</b> altında “Enhanced DAX Time Intelligence” seçeneğini işaretle ve Desktop’ı yeniden başlat.</li>
<li>Tarih tablosuna sağ tıkla → <b>Takvim seçenekleri</b> (Calendar options) → <b>Yeni takvim</b>.</li>
<li><b>Kategori ekle</b> ile sütunları kategorilere bağla: Yıl, Çeyrek, Ay, Hafta, Tarih ve “yılın haftası”, “haftanın günü” gibi kısmi kategoriler. Her kategorinin bir birincil sütunu, isteğe bağlı ilişkili sütunları olur. “Tam” (complete) kategoriler bir dönemi tek başına tanımlar (2024-H10); “kısmi” kategoriler tanımlamaz (H10).</li>
</ol>
<pre class="dax" data-notry>table Tarih
    calendar 'Perakende 445'
        calendarColumnGroup = year
            primaryColumn: ISOYil
        calendarColumnGroup = month
            primaryColumn: DonemAnahtari
        calendarColumnGroup = week
            primaryColumn: HaftaAnahtari
        calendarColumnGroup = date
            primaryColumn: Tarih</pre>
<pre class="dax" data-notry>Perakende YTD = TOTALYTD([Net Satış], 'Perakende 445')
Perakende WTD = TOTALWTD([Net Satış], 'Perakende 445')
Perakende GY  = CALCULATE([Net Satış], DATEADD('Perakende 445', -1, YEAR))</pre>
<p>Böylece <code>TOTALWTD</code> gibi hafta fonksiyonları kullanılabilir, “geçen yıl” takvimin kendi yılına göre hesaplanır. <code>DATEADD</code> ve <code>SAMEPERIODLASTYEAR</code> “sabit” fonksiyonlardır: yalnızca yana doğru kaydırır. Diğerleri esnektir. Bir takvim sütununa bağlam koymak, o kategorinin üstündeki ve altındaki kategorilerdeki bağlamı temizler.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>Klasik</th><th>Takvim tabanlı (önizleme)</th></tr>
<tr><td>Takvim türü</td><td>Gregoryen ya da kaydırılmış Gregoryen</td><td>Her türlü takvim</td></tr>
<tr><td>Hafta hesapları</td><td>Yok</td><td>Var</td></tr>
<tr><td>Yazım</td><td><code>SAMEPERIODLASTYEAR(Tarih[Tarih])</code></td><td><code>TOTALYTD([Net Satış], 'Mali')</code></td></tr>
</table></div>
<h3>Sınırlamalar (Learn’e göre)</h3>
<ul>
<li>Canlı bağlantılı ve bileşik (composite) modellerde takvim kullanılamaz.</li>
<li>Takvimler henüz Power BI Service’te yazılamaz; Desktop ya da harici araç gerekir.</li>
<li>Otomatik tarih/saat tablolarıyla birlikte kullanılmamalı.</li>
<li>Takvim tanımlı ve satır düzeyi güvenliğe (RLS) tabi bir olgu tablosunda beklenmedik sonuçlar çıkabilir.</li>
<li>Takvim kullanan zaman zekâsı fonksiyonları iç içe yazılamaz: <code>PREVIOUSDAY(PREVIOUSMONTH('Takvim'))</code> yerine <code>CALCULATETABLE(PREVIOUSDAY('Takvim'), PREVIOUSMONTH('Takvim'))</code>.</li>
<li>Bir sütun tek kategoriye bağlanır; tabloda 200’den az sütun olmalı.</li>
<li>Yıl sonu parametresi (<code>"6-30"</code>) yalnızca tarih sütunu yazımında geçerlidir; takvim yazımında mali yıl, takvim tanımının içindedir.</li>
</ul>
<div class="note"><b>Bu uygulamada</b>Tarayıcıdaki motor takvim tanımlarını desteklemiyor; bu bölümdeki bloklar bu yüzden çalıştırılamaz. Alıştırmalar sütun tabanlı kalıpla yapılır.</div>
<p><b>Üretim kararı:</b> Önizleme özelliği kurumsal bir modelde ana yol olmamalı. Bugün sütun tabanlı kalıbı kur; ISOYil, HaftaAnahtari, DonemAnahtari gibi sütunları zaten hazırlamış olacağın için özellik genel kullanıma geçtiğinde takvim tanımına taşımak kolaylaşır.</p>

<h2>Kontrol listesi</h2>
<ul>
<li>Mali yıl adlandırması (bittiği yıl mı, başladığı yıl mı) belgelendi mi?</li>
<li>Hafta görsellerinde Yıl × HaftaNo değil, ISOYil × HaftaNo ya da HaftaAnahtari mı kullanılıyor?</li>
<li>Hafta karşılaştırmaları 364 gün mü, takvim tarihi mi? 53. hafta kuralı ne?</li>
<li>Sütun tabanlı ölçülerde <code>REMOVEFILTERS(Tarih)</code> var mı? Toplam satırı ne gösteriyor?</li>
</ul>
`,
  ex: [
    { t: 'dax', name: 'Mali Yıl Başından Satış', q: '<b>Mali Yıl Başından Satış</b>: mali yıl 1 Temmuz’da başlıyor. Görünen dönemin son gününe kadar, o günün ait olduğu mali yılın başından itibaren net satışı hesapla. Yıl sonu parametresi kullanma; DATESBETWEEN ile yaz.', sol: 'VAR son = MAX(Tarih[Tarih]) VAR bas = IF(MONTH(son) >= 7, DATE(YEAR(son), 7, 1), DATE(YEAR(son) - 1, 7, 1)) RETURN CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], bas, son))', hint: 'Son günün ayı 7 ya da büyükse mali yıl o yılın 1 Temmuz’unda, değilse bir önceki yılın 1 Temmuz’unda başlar.' },
    { t: 'dax', name: 'Mali Yılın Tamamı', q: '<b>Mali Yılın Tamamı</b>: görünen dönemin son gününün ait olduğu mali yılın (Temmuz–Haziran) tamamındaki net satış. Mali yıl, bittiği yılla adlandırılır. Tarih tablosunda mali yıl sütunu yok; FILTER(ALL(Tarih), …) içinde ifadeyle hesapla.', sol: 'VAR son = MAX(Tarih[Tarih]) VAR my = YEAR(son) + IF(MONTH(son) >= 7, 1, 0) RETURN CALCULATE([Net Satış], FILTER(ALL(Tarih), YEAR(Tarih[Tarih]) + IF(Tarih[AyNo] >= 7, 1, 0) = my))', hint: 'Bir günün mali yılı = Yıl + (Ay ≥ 7 ise 1, değilse 0). Aynı ifadeyi hem son gün için hem FILTER içinde her satır için kullan.' },
    { t: 'dax', name: 'Geçen Yıl Aynı Hafta Günü', q: '<b>Geçen Yıl Aynı Hafta Günü</b>: her günü geçen yılın haftanın aynı gününe taşıyarak net satışı hesapla (pazartesi pazartesiyle karşılaştırılsın).', sol: 'CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -364, DAY))', hint: '52 hafta × 7 gün. DATEADD gün birimiyle kaydırabilir.' },
    { t: 'dax', name: 'Hafta Başından Satış', q: '<b>Hafta Başından Satış</b>: görünen dönemin son gününün haftasının pazartesisinden o güne kadar net satış (WTD).', sol: 'VAR son = MAX(Tarih[Tarih]) VAR bas = son - WEEKDAY(son, 2) + 1 RETURN CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], bas, son))', hint: 'WEEKDAY(tarih, 2) pazartesiye 1, pazara 7 verir. Pazartesi = son − WEEKDAY + 1.' },
    { t: 'query', q: 'Tarih tablosundan 2024 Aralık’ın son dört gününü getir ve her satıra ISO yılını gösteren <code>ISOYil</code> ve haftanın pazartesisini gösteren <code>HaftaBaslangic</code> sütunlarını ekle. 30–31 Aralık hangi ISO yılına düşüyor?', start: 'EVALUATE\n', sol: 'EVALUATE\nADDCOLUMNS(FILTER(Tarih, Tarih[Tarih] >= DATE(2024, 12, 28)), "ISOYil", YEAR(Tarih[Tarih] - Tarih[GunNo] + 4), "HaftaBaslangic", Tarih[Tarih] - Tarih[GunNo] + 1)', hint: 'ISO yılı, o haftanın perşembesinin yılıdır: Tarih − GunNo + 4.' },
    { t: 'query', q: 'Matristeki “2024 / Hafta 1” hücresinin neden şiştiğini kanıtla: tek satırlık bir sonuçta <code>Yanlis</code> (Yil = 2024 ve HaftaNo = 1) ile <code>Dogru</code> (ISO yılı 2024 olan 1. hafta) net satışlarını yan yana döndür.', start: 'EVALUATE\nROW(\n', sol: 'EVALUATE\nROW("Yanlis", CALCULATE([Net Satış], Tarih[Yil] = 2024, Tarih[HaftaNo] = 1), "Dogru", CALCULATE([Net Satış], FILTER(ALL(Tarih), YEAR(Tarih[Tarih] - Tarih[GunNo] + 4) = 2024 && Tarih[HaftaNo] = 1)))', hint: 'Doğru sürümde ISO yılını FILTER(ALL(Tarih), …) içinde ifadeyle hesapla.' },
    { t: 'query', q: 'ISO 2024 yılını 4-4-5 dönemlerine böl: her gün için dönem numarasını (1–12) hesapla ve dönem başına net satışı döndür. Çeyrek 13 haftadır; çeyrek içindeki ilk 4 hafta 1. dönem, sonraki 4 hafta 2. dönem, son 5 hafta 3. dönemdir.', start: 'EVALUATE\nVAR g =\n', sol: 'EVALUATE\nVAR g = ADDCOLUMNS(FILTER(Tarih, YEAR(Tarih[Tarih] - Tarih[GunNo] + 4) = 2024), "Donem", VAR hw = Tarih[HaftaNo] VAR c = MIN(4, INT((hw - 1) / 13) + 1) VAR wq = hw - (c - 1) * 13 RETURN (c - 1) * 3 + IF(wq <= 4, 1, IF(wq <= 8, 2, 3)), "S", [Net Satış])\nRETURN GROUPBY(g, [Donem], "Satis", SUMX(CURRENTGROUP(), [S]))', hint: 'Önce ADDCOLUMNS ile Donem ve günlük satış (S) sütunlarını ekle, sonra GROUPBY ve SUMX(CURRENTGROUP(), [S]) ile topla.' },
    { t: 'mc', q: 'Mağaza müdürü “bu hafta geçen yılın aynı haftasından %15 iyi” diyor. Ölçü <code>SAMEPERIODLASTYEAR</code> ile yazılmış; geçen yılın penceresi cumartesi başlıyor. Ne yaparsın?', o: ['DATEADD(Tarih[Tarih], -364, DAY) ile karşılaştır', 'PARALLELPERIOD(…, -1, YEAR) ile yeniden yaz', 'Tarih tablosu işaretini kaldırıp yeniden işaretle', 'Hafta sonu günlerini iki dönemden de çıkar'], a: 0, why: 'SAMEPERIODLASTYEAR takvim tarihini korur, haftanın gününü kaydırır; 364 gün (52 hafta) geri gitmek pazartesiyi pazartesiye eşler. PARALLELPERIOD geçen yılın tamamını verir. İşaretleme bu sorunu değiştirmez. Hafta sonlarını atmak gün etkisini gizler ama soruyu çözmez.' },
    { t: 'mc', q: 'Finans, mali yıl için <code>TOTALYTD([Net Satış], Tarih[Tarih], "30-6")</code> yazdı. Kendi bilgisayarında doğru, Amerika’daki meslektaşının dosyasında yanlış çalışıyor. En olası neden?', o: ['TOTALYTD mali yılı hiç desteklemez', 'Yıl sonu metni yerel ayarla okunur', 'Tarih tablosu iki yıldan kısa kalmış', 'Ölçüde SAMEPERIODLASTYEAR eksik kalmış'], a: 1, why: 'Learn’e göre yıl sonu parametresi, dosyanın oluşturulduğu istemcinin yerel ayarındaki bir tarih metnidir; "30-6" ile "6-30" bölgeye göre farklı okunabilir. TOTALYTD mali yılı destekler; tablo uzunluğu ve SAMEPERIODLASTYEAR ilgisizdir.' },
    { t: 'mc', q: 'Ekip, önizlemedeki takvim tabanlı zaman zekâsını kullanmak istiyor. Model, büyük bir DirectQuery olgu tablosu ve Import boyutlardan oluşan bileşik bir model. Ne söylersin?', o: ['Takvimi Service’te tanımlayıp yayımlamak yeterli', 'Önce otomatik tarih/saat açılmalı', 'Bileşik modelde takvim kullanılamaz', 'Takvim yalnızca DirectQuery olgu tablosunda çalışır'], a: 2, why: 'Learn’in sınırlamalar listesine göre takvimler canlı bağlantılı ve bileşik modellerde kullanılamaz; ayrıca Service’te takvim yazılamaz ve otomatik tarih/saat tablolarıyla kullanılmamalıdır. Bu modelde sütun tabanlı kalıp kalır.' },
    { t: 'mc', q: 'Perakende takviminde 2026 yılı 53 hafta sürüyor. Satın alma müdürü 53. haftanın geçen yıl karşılaştırmasını soruyor. Doğru yaklaşım hangisi?', o: ['364 gün kaydırma bu haftayı kendiliğinden eşler', '53. haftayı modelden silip 52 haftaya indir', 'Eşi yok; kuralı iş birimiyle belirle', 'Karşılaştırmayı SAMEPERIODLASTYEAR ile yap'], a: 2, why: '53 haftalık yılın son haftasının önceki yılda eşi yoktur. Boş bırakmak ya da 52. haftayla karşılaştırmak bir iş kararıdır ve belgelenmelidir. 364 gün kaydırma bir hafta getirir ama bu “aynı hafta” değildir; veriyi silmek ve takvim tarihine dönmek yeni hatalar üretir.' },
    { t: 'mc', q: 'Sütun tabanlı bir “Perakende YTD” ölçüsü yazdın: <code>CALCULATE([Net Satış], Tarih[ISOYil] = y, Tarih[Tarih] &lt;= son)</code>. Raporda Gregoryen Yıl dilimleyicisi 2024 seçiliyken 2025-H01 haftası yarım görünüyor. Neden?', o: ['ISOYil sütununun türü metin olmalıydı', 'Tarih tablosu işaretli olmadığı için hata var', 'Yil filtresi kalıyor; REMOVEFILTERS eksik', 'CALCULATE yerine CALCULATETABLE gerekir'], a: 2, why: 'Sütun eşitliği yalnızca o sütunun filtresinin üzerine yazar; Tarih[Yil] = 2024 dilimleyicisi kalır ve 2025-H01’in yalnızca 30–31 Aralık günleriyle kesişir. Hazır fonksiyonların aksine REMOVEFILTERS(Tarih) ile tablo filtrelerini kendin temizlemelisin.' }
  ]
});

add('kurumsal-model', {
  id: 'buyuk-model', lv: 'C2', mod: 'İleri Modelleme', min: 45,
  title: 'Büyük modeller: artımlı yenileme, hibrit tablolar, toplama tabloları ve bileşik modeller',
  sum: 'RangeStart/RangeEnd ve katlama şartı, artımlı yenileme politikası, gerçek zamanlı DirectQuery bölümüyle hibrit tablo, kullanıcı tanımlı ve otomatik toplamalar, isabet kontrolü, Dual ve bileşik model, büyük model depolama biçimi, XMLA ile bölüm yenileme, Direct Lake karşılaştırması ve lisans gereksinimleri.',
  body: `
<p>“Kurumsal model” dersinde depolama modlarını, toplamaları ve artımlı yenilemeyi kısaca tanıdın; “Veri bağlantıları” dersinde katlamanın neden önemli olduğunu gördün. Bu ders o başlıkları bir üretim projesi gibi ele alıyor: mekanizma, sayılar, tuzaklar ve lisans gerçekleri.</p>

<h2>Senaryo: Anadolu Market büyüdü</h2>
<p>Bu uygulamadaki Satislar tablosu 1.620 satırdır. Şimdi şirketin beş yılda 900 milyon satış satırına ulaştığını düşün. Üç şikâyet var:</p>
<ul>
<li>Gece yenilemesi dört saat sürüyor ve bazen zaman aşımına düşüyor.</li>
<li>Model belleğe sığmıyor; kapasite yöneticisi uyarı gönderiyor.</li>
<li>Satış direktörü bugünün satışlarını canlı görmek istiyor.</li>
</ul>
<p>Her şikâyetin ayrı bir aracı var: <b>artımlı yenileme</b> süreyi, <b>büyük model biçimi</b> ve <b>toplamalar</b> belleği ve sorgu hızını, <b>hibrit tablo</b> tazeliği çözer. Yanlış araç seçmek, bir sorunu çözerken diğerini büyütür.</p>

<h2>Artımlı yenileme: mekanizma</h2>
<p>Power Query’de tam olarak <code>RangeStart</code> ve <code>RangeEnd</code> adlı iki <b>Tarih/Saat</b> parametresi oluşturulur. Adlar ayrılmıştır ve büyük-küçük harfe duyarlıdır. Olgu tablosu bunlarla filtrelenir:</p>
<pre class="m">let
    Kaynak = Sql.Database("sql-anadolu", "SatisDW"),
    Satis = Kaynak{[Schema = "dbo", Item = "Satislar"]}[Data],
    Filtre = Table.SelectRows(Satis, each [Tarih] &gt;= RangeStart and [Tarih] &lt; RangeEnd)
in
    Filtre</pre>
<p>Yayımladıktan sonra Service bu parametrelere kendi değerlerini verir ve her <b>bölüm</b> (partition) için ayrı bir sorgu gönderir. Filtre kaynağa katlanırsa her bölüm sorgusu yalnızca kendi satırlarını çeker. Katlanmazsa her bölüm tüm tabloyu indirir ve filtreyi ağ geçidinde ya da Service’te uygular. Learn bunun yenilemeyi yavaşlattığını ve kaynakları tükettiğini, yani artımlı yenilemenin amacını boşa çıkardığını söyler.</p>
<h3>Sınır kuralı: büyük-eşit ve küçük</h3>
<p>Başta <code>&gt;=</code>, sonda <code>&lt;</code> kullanılır. İki uçta da <code>&lt;=</code> kullanırsan gece yarısındaki bir satır iki komşu bölüme birden girer ve <b>çift sayılır</b>. Bu hata toplamı yalnızca biraz şişirdiği için uzun süre fark edilmez.</p>
<h3>Politika ve bölümler</h3>
<p>Tabloya sağ tık → <b>Artımlı yenileme</b>. Örnek politika: “Son 3 yılı arşivle, son 10 günü artımlı yenile, yalnızca tam günler”. Service eski dönemleri yıl bölümlerinde, yakın dönemleri daha küçük bölümlerde tutar; her yenilemede yalnızca son 10 günün bölümleri yeniden yüklenir.</p>
<p>Bu uygulamanın verisiyle bir benzetim: yenileme 1 Ocak 2025 sabahı çalışıyor ve “yalnızca tam günler” açık. Pencere 22–31 Aralık 2024’tür. Motorla sayınca bu pencerede 31 satır ve 25.897,20 net satış var; dokunulmayan arşivde 1.589 satır kalıyor. Yani her gece verinin yaklaşık %1,9’u işleniyor. 900 milyon satırlık modelde oran benzer kalırsa dört saatlik yenileme dakikalara iner.</p>
<div class="tbl-wrap"><table>
<tr><th>Ayar</th><th>Ne yapar?</th><th>Dikkat</th></tr>
<tr><td>Arşivle</td><td>Tutulacak geçmiş dönem</td><td>Daha eskisi modelden düşer</td></tr>
<tr><td>Artımlı yenile</td><td>Her seferinde yeniden yüklenen dönem</td><td>Geriye dönük düzeltmeler (iade, iptal) bu pencereye sığmalı</td></tr>
<tr><td>Yalnızca tam günler</td><td>Bugünün yarım gününü yüklemez</td><td>Gerçek zamanlı bölüm için zorunlu; saat dilimi varsayılan UTC</td></tr>
<tr><td>Veri değişikliklerini algıla</td><td>Değişmemiş bölümleri atlar</td><td>Bölümleme sütunundan farklı bir “son güncelleme” sütunu ister</td></tr>
</table></div>
<p>Anadolu Market’te iadeler satıştan 30 gün sonra kaydediliyorsa 10 günlük pencere yetmez: iade edilen satır arşiv bölümünde eski hâliyle kalır. Pencereyi iş kuralına göre seç.</p>
<h3>Sık hatalar</h3>
<ul>
<li><b>Tür uyuşmazlığı:</b> Kaynak sütun tarih, parametreler tarih/saat. Kaynak tamsayı anahtar (20241231) ise parametreyi <code>yyyyMMdd</code> biçimli tamsayıya çevirmek gerekir.</li>
<li><b>Filtre sırası:</b> Filtre, kaynak adımından hemen sonra gelmeli. Önce <code>Table.Buffer</code>, birleştirme ya da özel sütun eklemek katlamayı bozabilir.</li>
<li><b>Yerel SQL sorgusu:</b> Yalnızca saf Import politikasında <code>EnableFolding=false</code> ile mümkündür; gerçek zamanlı bölümle olmaz.</li>
<li><b>Desktop’tan yeniden yayımlamak:</b> Var olan bölümleri ve veriyi siler. Yayımladıktan sonra modeli .pbix olarak geri indiremezsin. Şema değişikliklerini ALM Toolkit gibi araçlarla yalnızca meta veri olarak dağıt.</li>
<li><b>İlk yenileme:</b> Bütün geçmişi yükler, uzun sürer; elle başlat ve izle.</li>
</ul>

<h2>Hibrit tablo: gerçek zamanlı son bölüm</h2>
<p>Politikadaki “En son verileri DirectQuery ile gerçek zamanlı al” seçeneği, yenileme penceresinden sonraki dönem için bir <b>DirectQuery bölümü</b> ekler. Tablo artık hibrittir: geçmiş bellekte, bugün kaynakta. Satış direktörünün “bugünü canlı göster” isteği böyle karşılanır.</p>
<ul>
<li>“Yalnızca tam günler” açık olmalıdır.</li>
<li>Katlanmayan dönüşümlere izin verilmez; bütün bölümler tek bir veri kaynağını kullanmalıdır.</li>
<li>Learn’e göre yalnızca Premium, Kullanıcı Başına Premium (PPU) ve Embedded’da vardır; Pro’da yoktur. Bu tür bir model yalnızca Premium çalışma alanına yayımlanabilir.</li>
</ul>
<p>Mekanizma: “Bu yıl” toplamını isteyen bir görsel için motor bellekteki bölümleri tarar, bugünün bölümü için kaynağa SQL gönderir ve sonuçları birleştirir. Yani <b>her görsel sorgusu</b> kaynağa da gider. Kaynak veritabanı bu yükü kaldırmalı; Dual boyutlar ve toplama tabloları bu yükü azaltır.</p>

<h2>Kullanıcı tanımlı toplama tabloları</h2>
<p>Toplama tablosu (aggregation), ayrıntı olgu tablosunun daha kaba bir özetidir. Kullanıcı yalnızca ayrıntı tablosunu görür; motor sorguyu özetle cevaplayabiliyorsa özete gider (<b>isabet</b>, hit), cevaplayamıyorsa ayrıntıya düşer (<b>ıska</b>, miss).</p>
<h3>Kurulum (Learn’e göre)</h3>
<ul>
<li>Veri bölmesinde özet tabloya sağ tık → <b>Toplamaları yönet</b> (Manage aggregations). Her sütun için özetleme (Sum, Count, Count table rows, GroupBy), ayrıntı tablosu ve ayrıntı sütunu seçilir.</li>
<li>Ayrıntı tablosu <b>DirectQuery</b> olmalıdır, Import olamaz. Özet tablo en hızlı Import’tadır; Import’a alındıktan sonra geri çevrilemez.</li>
<li>Özet Import olunca Power BI ilişkili boyutları <b>Dual</b> yapmayı önerir. İlişki tabanlı isabet için ilişkiler “normal” (regular) olmalıdır.</li>
<li>Birden çok özet varsa <b>öncelik</b> (precedence) değeri yüksek olan önce denenir. Zincirleme toplama (özetin özeti) yoktur; ayrıntı tablosu her zaman temel tablodur.</li>
<li>İlişki tabanlı toplamalar yıldız şemaya, GroupBy tabanlı toplamalar ilişkisi olmayan düz büyük tablolara uygundur.</li>
</ul>
<h3>Motorla bir benzetim</h3>
<p>Ay × kategori düzeyinde bir özet tablo:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Tarih[YilAy], Kategoriler[Kategori],
    "Tutar", SUM(Satislar[Tutar]),
    "Satir", COUNTROWS(Satislar)
)</pre>
<p>Sonuç 199 satırdır; ayrıntı 1.620 satır. Gerçek modelde oran çok daha çarpıcıdır: 900 milyon satır birkaç bin satıra iner. Özet ile ayrıntı aynı sonucu vermeli; bunu sorguyla doğrularsın:</p>
<pre class="dax">EVALUATE
VAR o = SUMMARIZECOLUMNS(Tarih[YilAy], Kategoriler[Kategori], "Tutar", SUM(Satislar[Tutar]))
RETURN ROW("OzetTutar", SUMX(o, [Tutar]), "AyrintiTutar", SUM(Satislar[Tutar]), "OzetSatir", COUNTROWS(o))</pre>
<p>İki tutar da 1.346.189,85 çıkar. Bu toplamı <code>[Toplam Satış]</code> ölçüsüne aittir.</p>
<h3>Anti-kalıp: ölçünün filtresi özette yok</h3>
<p>Raporlar ise <code>[Net Satış]</code> kullanıyor ve bu ölçü <code>Satislar[Durum] &lt;&gt; "İptal"</code> filtresi uygular. Özet tabloda Durum sütunu yoksa motor bu filtreyi özetle cevaplayamaz ve <b>her sorgu ayrıntıya düşer</b>. Toplama tablosu vardır ama hiç kullanılmaz. Çözüm Durum’u özetin GroupBy sütunlarına eklemektir: özet 431 satıra çıkar, iptaller dışarıda bırakılınca 1.250.772,45 verir, yani <code>[Net Satış]</code> ile aynı. Kural: özetin taneciği (grain), raporlardaki ölçülerin kullandığı <b>bütün</b> sütunları kapsamalı.</p>
<h3>Toplanamayan ölçüler</h3>
<ul>
<li><b>Ortalama:</b> Learn’e göre <code>AVERAGE</code> toplam / sayıya katlanır, bu yüzden özette hem Sum hem “Count table rows” bulunmalı. Ortalamayı <code>DIVIDE(SUM(…), COUNTROWS(…))</code> diye yazmak niyeti açık eder.</li>
<li><b>Tekil sayım:</b> 2024’te tekil müşteri 123, ama aylık tekil müşterileri toplarsan 509 çıkar. Tekil sayım özetten toplanamaz; isabet için sayılan sütun (MusteriNo) özette GroupBy olmalıdır. Bu da özeti büyütür.</li>
</ul>
<h3>Güvenlik ve tazelik</h3>
<ul>
<li>RLS ifadesi hem özeti hem ayrıntıyı filtrelemeli. Yalnızca özeti filtreleyen RLS’ye izin verilmez; yalnızca ayrıntıyı filtreleyen RLS çalışır ama sorgular isabet almaz.</li>
<li>Özet Import, ayrıntı DirectQuery olduğu için özet bayatlarsa aynı soru iki farklı sayı verebilir. Özetin yenilemesini kaynağın yükleme zamanına bağla.</li>
</ul>
<h3>İsabeti nasıl ölçersin?</h3>
<ul>
<li>Learn, SQL Server Profiler’da <b>Query Processing → Aggregate Table Rewrite Query</b> olayını önerir. Olayın JSON çıktısındaki <code>matchingResult</code> isabeti, <code>dataRequest</code> istenen sütunları, <code>mapping</code> eşlenen özet sütunlarını gösterir.</li>
<li>Pratik ilk kontrol: Performans Analizi’nde (Performance Analyzer) görselin satırında DirectQuery süresi görünüyorsa sorgu kaynağa gitmiştir.</li>
<li>Test listesi: her rapor sayfasındaki her görseli bir kez çalıştır, ıskaları yaz, özet taneciğini ya da ölçüyü düzelt.</li>
</ul>

<h2>Otomatik toplamalar</h2>
<p>Otomatik toplamalar, son 7 günün sorgu günlüğünden öğrenerek <code>System</code> özet tablolarını kendisi oluşturur ve günceller. Ayarı anlam modelinin Service’teki <b>Ayarlar</b> sayfasındadır; bir kaydırıcıyla önbellekten cevaplanacak sorgu yüzdesi seçilir.</p>
<ul>
<li>Premium kapasite, PPU ve Embedded gerekir; Pro’da yoktur. Yalnızca Service’te çalışır, Desktop’ta yoktur.</li>
<li>DirectQuery modelleri ve bileşik modellerin DirectQuery kısmı içindir. Kaynaklar arasında Azure SQL Database, SQL Server 2019 ve sonrası, Snowflake, Databricks, BigQuery ve Redshift sayılır.</li>
<li>Eğitim günün ilk zamanlanmış yenilemesinde çalışır ve 60 dakika sınırı vardır. Yüzde arttıkça kaynağa giden eğitim sorguları da artar.</li>
<li>Hesaplanmış sütunlar dikkate alınmaz; yalnızca hibrit tablolardan oluşan modellerde açılmamalıdır; özellik açıkken .pbix indirilemez.</li>
</ul>
<p>Ne zaman hangisi? Sorgu kalıpları belli ve az sayıdaysa kullanıcı tanımlı özet daha öngörülebilirdir. Kullanıcılar çok farklı açılardan sorguluyorsa otomatik toplama emek kazandırır.</p>

<h2>Bileşik model ve depolama modu seçimi</h2>
<p>Toplamaların isabet alması, ilişkilerin normal kalmasına bağlıdır. Learn’in tek kaynaklı model için verdiği kural:</p>
<div class="tbl-wrap"><table>
<tr><th>Çok tarafı</th><th>Bir tarafı normal ilişki için</th></tr>
<tr><td>Dual</td><td>Dual</td></tr>
<tr><td>Import</td><td>Import ya da Dual</td></tr>
<tr><td>DirectQuery</td><td>DirectQuery ya da Dual</td></tr>
</table></div>
<p>Yani boyutlar hem Import özete hem DirectQuery ayrıntıya bağlanacaksa tek doğru seçim Dual’dır. Boyut Import kalırsa DirectQuery ayrıntıyla ilişkisi sınırlı (limited) olur. Çoka çok ilişkiler her zaman sınırlıdır; farklı kaynaklar arasındaki ilişki yalnızca iki taraf da Import ise normaldir.</p>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>Mod</th><th>Neden</th></tr>
<tr><td>Satislar (900 M satır)</td><td>DirectQuery (hibritse son bölüm)</td><td>Belleğe alınmaz; ayrıntı sorguları için</td></tr>
<tr><td>Satış özeti (ay × kategori × durum)</td><td>Import, gizli</td><td>Raporların çoğu buradan cevaplanır</td></tr>
<tr><td>Tarih, Urunler, Kategoriler, Musteriler</td><td>Dual</td><td>İki tarafa da normal ilişki</td></tr>
<tr><td>Küçük bağımsız arama tabloları</td><td>Import</td><td>DirectQuery tabloya bağlı değilse</td></tr>
</table></div>

<h2>Büyük model biçimi ve XMLA ile bölüm yenileme</h2>
<p><b>Büyük anlam modeli depolama biçimi</b> (Large semantic model storage format), modelin varsayılan 1 GB sınırını aşıp kapasitenin izin verdiği boyuta kadar büyümesini sağlar. Learn’e göre Fabric F, Premium P, Embedded A SKU’larında ve PPU’da vardır; ayrılmış kapasitedeki Pro çalışma alanlarında 1 GB ile sınırlıdır. Service’te modelin <b>Ayarlar → Büyük anlam modeli depolama biçimi</b> anahtarıyla açılır; Premium çalışma alanı bunu yeni modeller için varsayılan yapabilir. 1 GB’ı aşacak artımlı yenileme modellerinde ilk yenilemeden <b>önce</b> açılmalıdır. Ayrıca XMLA yazma performansını iyileştirdiği için küçük modellerde de önerilir.</p>
<p>Bellek gerçeği: yenileme sırasında model geçici olarak daha fazla bellek ister. Kapasitenin yarısına yaklaşan bir model tam yenilemede belleği aşabilir; tek tek bölüm yenilemek bu yüzden önemlidir.</p>
<p>XMLA uç noktası varsayılan olarak salt okunurdur; yazma işlemleri için kapasite ayarından <b>Okuma Yazma</b> açılır. SQL Server Management Studio’da TMSL ile tek bir bölüm yenilenebilir:</p>
<pre class="dax" data-notry>{
  "refresh": {
    "type": "full",
    "objects": [
      { "database": "AnadoluSatis", "table": "Satislar", "partition": "2024Q4" }
    ]
  }
}</pre>
<div class="tbl-wrap"><table>
<tr><th>Yenileme yolu</th><th>Süre sınırı (Learn)</th></tr>
<tr><td>Pro, zamanlanmış</td><td>2 saat</td></tr>
<tr><td>Premium, zamanlanmış</td><td>5 saat</td></tr>
<tr><td>XMLA uç noktası</td><td>Sınır yok; günlük 48 yenileme sınırına da sayılmaz</td></tr>
</table></div>
<p>Çok büyük modellerde “önyükleme” (bootstrapping) yapılır: nesneler veri yüklenmeden oluşturulur, sonra geçmiş bölümler tek tek doldurulur. Eski bir bölümü (ör. düzeltilmiş 2022 verisi) yeniden yüklemek de XMLA (SSMS ya da TMSL betiği) veya gelişmiş yenileme REST API’sinin <code>objects</code> parametresiyle yapılır (Premium, PPU, Embedded). Unutma: Desktop’ta yazılmış bir modelde XMLA ile yazma yapılınca model artık .pbix olarak indirilemez; kaynak dosyanı sakla.</p>

<h2>Direct Lake ile karşılaştırma ve karar tablosu</h2>
<p>Veri Fabric’te Delta tablolarındaysa “Kurumsal model” dersindeki Direct Lake seçeneği çoğu artımlı yenileme işini ortadan kaldırır: veri kopyalanmaz, “yenileme” tablonun yeni sürümüne bakmaktır (çerçeveleme). Bedeli, verinin önce bir göl evine ya da ambara taşınmış olmasıdır.</p>
<div class="tbl-wrap"><table>
<tr><th>Seçenek</th><th>Tazelik</th><th>Sorgu hızı</th><th>Kaynak yükü</th><th>Ne zaman?</th></tr>
<tr><td>Import + artımlı yenileme</td><td>Son yenileme</td><td>En iyi</td><td>Yenilemede düşük</td><td>Gecelik tazelik yeterli, kaynak ilişkisel</td></tr>
<tr><td>Hibrit tablo</td><td>Bugün canlı</td><td>Geçmiş hızlı, bugün kaynağa bağlı</td><td>Her sorguda biraz</td><td>“Bugünü göster” isteği, Premium/PPU</td></tr>
<tr><td>Bileşik + toplama</td><td>Ayrıntı canlı, özet son yenileme</td><td>İsabette hızlı, ıskada yavaş</td><td>Iskalarda yüksek</td><td>Veri belleğe sığmıyor, sorgular çoğunlukla özet</td></tr>
<tr><td>Direct Lake</td><td>Delta’nın son sürümü</td><td>Import’a yakın</td><td>Yok (OneLake okunur)</td><td>Veri zaten Fabric’te</td></tr>
<tr><td>Saf DirectQuery</td><td>Canlı</td><td>Kaynağa bağlı</td><td>Her sorguda</td><td>Saniyeler önemli, kaynak çok güçlü</td></tr>
</table></div>
<h3>Lisans özeti (Learn’e göre)</h3>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>Pro</th><th>PPU</th><th>Premium / Fabric kapasitesi</th></tr>
<tr><td>Artımlı yenileme</td><td>Var</td><td>Var</td><td>Var</td></tr>
<tr><td>Gerçek zamanlı DirectQuery bölümü</td><td>Yok</td><td>Var</td><td>Var</td></tr>
<tr><td>Büyük model biçimi</td><td>Yalnızca ayrılmış kapasitede, 1 GB</td><td>Var</td><td>Var</td></tr>
<tr><td>XMLA okuma-yazma</td><td>Yok</td><td>Var</td><td>Var</td></tr>
<tr><td>Otomatik toplamalar</td><td>Yok</td><td>Var</td><td>Var</td></tr>
</table></div>

<h2>Kontrol listesi</h2>
<ul>
<li>RangeStart/RangeEnd tarih/saat mi, filtre kaynak adımından hemen sonra mı, katlandığı doğrulandı mı?</li>
<li>Filtre <code>&gt;=</code> ve <code>&lt;</code> mı? Yenileme penceresi geriye dönük düzeltmeleri kapsıyor mu?</li>
<li>1 GB’ı aşacak modelde büyük model biçimi ilk yenilemeden önce açıldı mı?</li>
<li>Özet tablonun taneciği raporlardaki ölçülerin bütün filtre sütunlarını kapsıyor mu? İsabet Profiler ya da Performans Analizi ile ölçüldü mü?</li>
<li>Boyutlar Dual mı? RLS hem özeti hem ayrıntıyı filtreliyor mu?</li>
<li>Şema değişikliği yayımlamayla değil, meta veri dağıtımıyla mı yapılıyor? Kaynak .pbix saklanıyor mu?</li>
<li>Veri Fabric’teyse Direct Lake değerlendirildi mi?</li>
</ul>
`,
  ex: [
    { t: 'query', q: 'Bir toplama tablosunun içeriğini benzet: ay (<code>Tarih[YilAy]</code>) × kategori düzeyinde <code>Tutar</code> (Satislar[Tutar] toplamı) ve <code>Satir</code> (satır sayısı) sütunlarını döndür.', start: 'EVALUATE\nSUMMARIZECOLUMNS(\n', sol: 'EVALUATE\nSUMMARIZECOLUMNS(Tarih[YilAy], Kategoriler[Kategori], "Tutar", SUM(Satislar[Tutar]), "Satir", COUNTROWS(Satislar))', hint: 'SUMMARIZECOLUMNS(gruplama sütunları, "Ad", ifade, …).' },
    { t: 'query', q: 'Özet tablo ile ayrıntının aynı sonucu verdiğini kanıtla: ay × kategori × durum düzeyinde bir özeti bir değişkende tut; tek satırlık sonuçta özetten iptaller hariç toplanan <code>OzetNet</code> ile <code>[Net Satış]</code> ölçüsünün değerini (<code>AyrintiNet</code>) yan yana döndür.', start: 'EVALUATE\nVAR o =\n', sol: 'EVALUATE\nVAR o = SUMMARIZECOLUMNS(Tarih[YilAy], Kategoriler[Kategori], Satislar[Durum], "Tutar", SUM(Satislar[Tutar]))\nRETURN ROW("OzetNet", SUMX(FILTER(o, Satislar[Durum] <> "İptal"), [Tutar]), "AyrintiNet", [Net Satış])', hint: 'Durum’u gruplama sütunlarına ekle; ROW içinde SUMX(FILTER(o, Satislar[Durum] <> "İptal"), [Tutar]).' },
    { t: 'query', q: 'Artımlı yenileme benzetimi: yenileme 1 Ocak 2025’te çalışıyor, politika “son 10 tam günü yenile”. Tek satırda pencere içindeki satır sayısını (<code>PencereSatir</code>), penceredeki net satışı (<code>PencereNet</code>) ve pencere öncesindeki arşiv satır sayısını (<code>ArsivSatir</code>) döndür.', start: 'EVALUATE\nROW(\n', sol: 'EVALUATE\nROW("PencereSatir", CALCULATE(COUNTROWS(Satislar), DATESBETWEEN(Tarih[Tarih], DATE(2024, 12, 22), DATE(2024, 12, 31))), "PencereNet", CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024, 12, 22), DATE(2024, 12, 31))), "ArsivSatir", CALCULATE(COUNTROWS(Satislar), Tarih[Tarih] < DATE(2024, 12, 22)))', hint: 'Son 10 tam gün: 22–31 Aralık 2024. Arşiv: Tarih < 22 Aralık 2024.' },
    { t: 'dax', name: 'Özet Dostu Ortalama Tutar', q: '<b>Özet Dostu Ortalama Tutar</b>: satır başına ortalama tutarı, bir toplama tablosunun Sum ve Count table rows sütunlarıyla cevaplanabilecek biçimde (toplam bölü satır sayısı) yaz.', sol: 'DIVIDE(SUM(Satislar[Tutar]), COUNTROWS(Satislar))', hint: 'AVERAGE özette toplam / sayıya katlanır; bunu açıkça DIVIDE ile yaz.' },
    { t: 'dax', name: 'Yenileme Penceresi Satışı', q: '<b>Yenileme Penceresi Satışı</b>: görünen dönemin son gününden geriye 10 günlük penceredeki net satış. Bu ölçü, son yenilemede değişebilecek tutarı izlemek için kullanılacak.', sol: 'CALCULATE([Net Satış], DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -10, DAY))', hint: 'DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -10, DAY).' },
    { t: 'mc', q: 'Özet tabloyu (ay × kategori, Tutar toplamı) kurdun ve eşledin. Ama Performans Analizi her görselde DirectQuery süresi gösteriyor. Raporlar <code>[Net Satış]</code> kullanıyor. En olası neden?', o: ['Ölçünün Durum filtresi özette yok', 'Özet tablo Import yerine Dual moda alınmalıydı', 'Ayrıntı tablosu da Import moduna alınmalıydı', 'Öncelik değeri 0 kaldığı için özet atlanıyor'], a: 0, why: '[Net Satış] Satislar[Durum] üzerine filtre koyar; özette Durum sütunu yoksa motor bu filtreyi özetle cevaplayamaz ve ayrıntıya gider. Durum’u GroupBy olarak ekle. Ayrıntı tablosu DirectQuery olmak zorundadır; tek özet varken öncelik sorun değildir.' },
    { t: 'mc', q: 'Gece yenilemesi artımlı yenilemeye rağmen hâlâ saatler sürüyor. Power Query’de RangeStart filtresinden önce bir <code>Table.Buffer</code> adımı ve bir birleştirme var. Ne yaparsın?', o: ['Yenileme penceresini 10 günden 1 güne indir', 'Veri değişikliklerini algıla seçeneğini kapat', 'Filtreyi kaynak adımından hemen sonraya taşı', 'Parametrelerin türünü metne çevir'], a: 2, why: 'Filtre katlanmazsa her bölüm sorgusu bütün tabloyu indirir; artımlı yenilemenin kazancı kaybolur. Filtreyi kaynak adımının hemen arkasına koyup katlandığını doğrula. Pencereyi küçültmek sorunu gizler; parametreler tarih/saat olmak zorundadır.' },
    { t: 'mc', q: 'Satış direktörü bugünün satışlarını canlı istiyor. Çalışma alanı Pro lisanslı ve model 600 MB. En dürüst cevap hangisi?', o: ['Politikaya DirectQuery bölümünü eklemek yeter', 'Büyük model biçimini açınca canlı veri gelir', 'Hibrit tablo Pro’da yok; Premium/PPU gerekir', 'Otomatik toplamaları açmak bugünü getirir'], a: 2, why: 'Learn’e göre artımlı yenileme Pro’da vardır ama gerçek zamanlı DirectQuery bölümü (hibrit tablo) yalnızca Premium, PPU ve Embedded’dadır. Büyük model biçimi boyutla, otomatik toplamalar sorgu hızıyla ilgilidir ve ikisi de Pro’da yoktur.' },
    { t: 'mc', q: 'Bileşik modelde Satislar DirectQuery, özet tablo Import. Urunler boyutunu hangi moda almalısın ki hem özetle hem ayrıntıyla normal ilişki kursun?', o: ['Import', 'DirectQuery', 'Direct Lake', 'Dual'], a: 3, why: 'Learn’in kuralına göre Import çok tarafına Import ya da Dual, DirectQuery çok tarafına DirectQuery ya da Dual bir taraf normal ilişki verir. İkisini birden karşılayan tek mod Dual’dır.' },
    { t: 'mc', q: 'Yönetim “aylık tekil müşteri” görselini toplama tablosundan hızlandırmak istiyor. Özet ay × kategori düzeyinde ve MusteriNo içermiyor. Ne olur?', o: ['Özet tekil sayıyı ay toplamlarından üretir', 'Count table rows eşlemesi tekil sayımı karşılar', 'Tekil sayım her durumda ayrıntıdan okunur', 'Iska olur; MusteriNo GroupBy olmalı'], a: 3, why: 'Tekil sayım toplanamaz: 2024’te tekil müşteri 123 iken aylık tekilleri toplamak 509 verir. Learn’e göre DISTINCTCOUNT, sayılan sütun özette GroupBy olarak varsa isabet alır; bu özeti büyütür ve 2–5 milyon tekil değerden sonra performans düşebilir.' },
    { t: 'mc', q: 'Model Service’te artımlı yenilemeyle bölümlendi ve iki yıllık geçmiş yüklendi. Bir geliştirici Desktop’ta yeni bir ölçü ekleyip aynı dosyayı yeniden yayımlamak istiyor. Uyarın ne olur?', o: ['Yalnızca yeni ölçü yüklenir, bölümler korunur', 'Ölçü eklemek sonraki yenilemeyi tama çevirir', 'Yayımlamadan sonra .pbix Service’ten geri indirilir', 'Bölümler silinir; meta veri dağıtımı kullan'], a: 3, why: 'Learn’e göre Desktop’tan yeniden yayımlamak var olan bölümleri ve veriyi kaldırır; artımlı yenilemeli model .pbix olarak geri de indirilemez. Değişiklik ALM Toolkit ya da TMSL gibi araçlarla yalnızca meta veri olarak dağıtılmalı.' },
    { t: 'mc', q: 'Kapasite yöneticisi bir RLS kuralının yalnızca özet tabloya yazıldığını görüyor; ayrıntı tablosunda kural yok. Doğru değerlendirme hangisi?', o: ['Doğru kurulum; özet zaten ayrıntıyı temsil eder', 'Ayrıntı DirectQuery olduğu için RLS gerekmez', 'Yalnızca özeti filtreleyen RLS’ye izin verilmez', 'Kural yalnızca Dual boyutlara yazılabilir'], a: 2, why: 'Learn’e göre RLS hem özeti hem ayrıntıyı filtrelemeli; yalnızca özet tabloyu filtreleyen kurala izin verilmez. Yalnızca ayrıntıyı filtrelemek çalışır ama isabet alınmaz. Iska olduğunda sorgu ayrıntıya gider; orada kural yoksa veri sızar.' }
  ]
});
})(window);
