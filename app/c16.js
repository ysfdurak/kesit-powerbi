/* Kesit Power BI — Vaka çalışmaları (2. tur): kıyaslama, pazar payı, üret mi satın al mı, kredi portföyü */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- Ortak, açıkça uydurulmuş küçük tablolar (gerçek veri değildir) ---------- */
const PAZAR = `DATATABLE(
    "Kategori", STRING, "Yil", INTEGER, "PazarTL", CURRENCY,
    {
        {"Elektronik", 2023, 5200000}, {"Elektronik", 2024, 7800000},
        {"Ev & Yaşam", 2023, 3400000}, {"Ev & Yaşam", 2024, 4760000},
        {"Giyim", 2023, 2900000}, {"Giyim", 2024, 5220000},
        {"Spor", 2023, 2200000}, {"Spor", 2024, 3190000},
        {"Kitap", 2023, 1500000}, {"Kitap", 2024, 1800000},
        {"Kozmetik", 2023, 2600000}, {"Kozmetik", 2024, 3380000},
        {"Hediye", 2023, 600000}, {"Hediye", 2024, 1140000}
    }
)`;
const HAT = 'Urunler[Urun] IN {"Nemlendirici Krem", "Güneş Kremi SPF50", "Şampuan", "Dudak Balmı"}';
const TEKLIF = `DATATABLE(
    "Secenek", STRING, "YillikSabit", CURRENCY, "BirimOran", DOUBLE, "MinAdet", INTEGER,
    {
        {"Mevcut tedarikçi", 0, 1.00, 0},
        {"Yeni tedarikçi", 3000, 0.88, 250},
        {"Kendi üretim", 18000, 0.55, 0}
    }
)`;
const KREDI = `DATATABLE(
    "KrediNo", STRING, "Segment", STRING, "Tutar", CURRENCY, "YillikFaiz", DOUBLE,
    "Vade", INTEGER, "Baslangic", DATETIME, "GecikmeGun", INTEGER,
    {
        {"K01", "KOBİ", 400000, 0.42, 24, "2024-01-15", 0},
        {"K02", "KOBİ", 250000, 0.45, 12, "2024-06-01", 45},
        {"K03", "Bireysel", 120000, 0.48, 36, "2023-09-01", 0},
        {"K04", "Bireysel", 80000, 0.50, 24, "2024-03-01", 120},
        {"K05", "Kurumsal", 1000000, 0.38, 36, "2023-04-01", 0},
        {"K06", "Kurumsal", 600000, 0.40, 24, "2024-09-01", 0},
        {"K07", "KOBİ", 300000, 0.44, 18, "2023-12-01", 0},
        {"K08", "Bireysel", 60000, 0.52, 12, "2024-02-01", 35},
        {"K09", "KOBİ", 150000, 0.46, 24, "2024-04-01", 95},
        {"K10", "Kurumsal", 450000, 0.39, 12, "2024-07-01", 0}
    }
)`;
const PLAN = `GENERATE(
    Krediler,
    VAR i = [YillikFaiz] / 12
    VAR A = PMT(i, [Vade], -[Tutar])
    VAR P0 = [Tutar]
    VAR Bas = [Baslangic]
    RETURN
        SELECTCOLUMNS(
            GENERATESERIES(1, [Vade]),
            "TaksitNo", [Value],
            "OdemeTarihi", EDATE(Bas, [Value]),
            "Taksit", A,
            "Faiz", (P0 * POWER(1 + i, [Value] - 1) - A * (POWER(1 + i, [Value] - 1) - 1) / i) * i,
            "Kalan", P0 * POWER(1 + i, [Value]) - A * (POWER(1 + i, [Value]) - 1) / i
        )
)`;
const OZET = `ADDCOLUMNS(
    Krediler,
    "Durum", SWITCH(TRUE(), [GecikmeGun] >= 90, "Takipte", [GecikmeGun] >= 30, "Gecikmede", "Düzenli"),
    "Odenen", VAR k = [KrediNo] RETURN COUNTROWS(FILTER(Plan, [KrediNo] = k && [OdemeTarihi] <= Rapor)) + 0,
    "Bakiye",
        VAR k = [KrediNo]
        VAR t = [Tutar]
        VAR p = FILTER(Plan, [KrediNo] = k && [OdemeTarihi] <= Rapor)
        RETURN IF(ISEMPTY(p), t, MINX(p, [Kalan])),
    "Faiz2024", VAR k = [KrediNo] RETURN SUMX(FILTER(Plan, [KrediNo] = k && YEAR([OdemeTarihi]) = 2024), [Faiz]),
    "Tahsilat2025", VAR k = [KrediNo] RETURN SUMX(FILTER(Plan, [KrediNo] = k && YEAR([OdemeTarihi]) = 2025), [Taksit])
)`;
const KDEF = 'DEFINE\nVAR Krediler = ' + KREDI + '\nVAR Plan = ' + PLAN + '\nVAR Rapor = DATE(2024, 12, 31)\n';
const KDEF2 = KDEF + 'VAR Ozet = ' + OZET + '\n';

/* ---------- Vaka 6: Şehir ve temsilci kıyaslaması (B2) ---------- */
add('vaka-satis', {
  id: 'vaka-kiyaslama', lv: 'B2', mod: 'Vaka Çalışmaları', min: 28,
  title: 'Vaka: şehir ve temsilci kıyaslaması (benchmarking)',
  sum: 'Operasyon direktörü şehirleri ve temsilcileri adil bir lig tablosunda görmek istiyor. Şirket ortalamasına göre endeks, müşteri başına normalleştirme, sipariş sıklığı ile sepetin ayrıştırılması, z-skoru ve örnek büyüklüğü eşiği, teslim süresi farkı, karma etkisinden arındırılmış iade karşılaştırması ve dinamik başlıklı bir şehir profili sayfası kurarsın.',
  body: `
<h2>1. Şirketin sorusu ve brif</h2>
<p><b>Kim soruyor?</b> Operasyon direktörü. Yıllık bölge toplantısında şehir müdürlerine ve temsilcilere “nerede güçlüsünüz, nerede geridesiniz?” sorusunun cevabını tek bir tabloyla vermek istiyor.</p>
<p><b>Hangi karar?</b> Gelecek yıl saha desteği hangi şehirlere verilecek, hangi temsilciyle iade konusunda konuşulacak? Brifin soruları:</p>
<ol>
<li>Şehirler şirket ortalamasının neresinde: sepet (sipariş başı satış), müşteri başı satış, iade oranı, teslim süresi?</li>
<li>Büyük şehir küçük şehri toplamda hep geçer. Kıyas nasıl adil olur?</li>
<li>Hangi farklar gerçekten olağan dışı, hangileri az veriden doğan gürültü?</li>
<li>Temsilciler arasındaki iade farkı kişiden mi, yoksa sorumlu oldukları şehirlerden mi geliyor?</li>
<li>Bir şehre tıklayınca açılan, başlığı seçime göre değişen bir profil sayfası.</li>
</ol>
<p><b>Vaka: satış performansı ve hedef takibi</b> temsilcileri büyüme ve hedefle ele aldı. Burada soru farklı: büyüme değil, <b>yapısal kıyas</b>. Herkesi aynı cetvelle, şirket ortalamasına göre ölçüyoruz.</p>

<h2>2. Veri ve model</h2>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>Kullanım</th></tr>
<tr><td><code>Musteriler</code></td><td><code>Sehir</code>, <code>Bolge</code>: 12 şehir. Şehir, siparişin değil müşterinin özelliğidir.</td></tr>
<tr><td><code>Satislar</code></td><td><code>Durum</code> (iade), <code>Kanal</code>, <code>KargoGun</code> (sipariş ile teslim arası gün).</td></tr>
<tr><td><code>Calisanlar</code></td><td><code>Satislar[TemsilciNo]</code> üzerinden temsilci adı. Satışı olan 6 temsilci var.</td></tr>
</table></div>
<p>Hazır ölçüler: <code>[Ortalama Sepet]</code>, <code>[Müşteri Başı Satış]</code>, <code>[Müşteri Başı Sipariş]</code>, <code>[İade Oranı %]</code>, <code>[Ortalama Kargo Günü]</code>. Dönem: verinin tamamı (Haziran 2022 – Aralık 2024). Tek yıl seçilirse küçük şehirlerde örnek iyice azalır.</p>
<p><b>Veri sınırları:</b></p>
<ul>
<li><b>Şehri boş müşteriler:</b> 7 müşterinin şehri boş (42 sipariş, 63.853 ₺). Bu satırları silme; tabloda “(Şehir yok)” diye göster ve kaynak sisteme bildir.</li>
<li><b>Mağaza siparişlerinde kargo günü 0.</b> Şehirlerin mağaza payı çok farklı: Samsun’da satışın %0,3’ü, Bursa’da %28,1’i mağazadan. Karışık ortalama, mağazası güçlü şehri hızlı gösterir. Teslim kıyasında yalnızca Web ve Mobil’i al (gerekçesi <b>Vaka: e-ticaret dönüşüm hunisi ve kargo</b> dersinde).</li>
<li><b>Küçük örnekler:</b> Konya’da 22, Gaziantep’te 23, Samsun’da 28 sipariş var. Bu şehirlerde oranlar birkaç siparişle çok oynar.</li>
<li><b>Temsilci ataması geriye dönük:</b> temsilci, müşterinin bugünkü temsilcisidir. Kıyas “portföy kıyası” olarak okunmalı.</li>
</ul>

<h2>3. Analiz adımları</h2>
<p><b>Adım 1: Ortak cetvel: şirket ortalaması ve endeks.</b> Her ölçüyü şirket ortalamasına bölüp 100 ile çarparız. 100 ortalama demektir; 120 ortalamanın %20 üstü.</p>
<pre class="dax">Şirket Ortalama Sepet =
CALCULATE([Ortalama Sepet], REMOVEFILTERS(Musteriler))
Sepet Endeksi =
DIVIDE([Ortalama Sepet], [Şirket Ortalama Sepet]) * 100</pre>
<p><code>REMOVEFILTERS(Musteriler)</code> şehir, bölge ve segment filtresini kaldırır; yıl ve kanal dilimleyicileri ise kalır. Böylece ortalama her zaman <b>seçili dönemin</b> şirket ortalamasıdır. Cetvel olarak şehirlerin basit ortalamasını değil, şirketin kendisini alırız: 12 şehrin müşteri başı satış ortalaması 9.309 ₺, şirketinki 9.197 ₺. Küçük şehirler basit ortalamada büyük şehirlerle aynı ağırlığı alır.</p>
<div class="tbl-wrap"><table>
<tr><th>Şehir</th><th>Net satış</th><th>Sipariş</th><th>Müşteri</th><th>Sepet (endeks)</th><th>Müşteri başı satış (endeks)</th><th>İade</th></tr>
<tr><td>Trabzon</td><td>105.118 ₺</td><td>82</td><td>7</td><td>1.282 ₺ (86)</td><td><b>15.017 ₺ (163)</b></td><td>%11,8</td></tr>
<tr><td>Antalya</td><td>104.621 ₺</td><td>57</td><td>9</td><td>1.835 ₺ (123)</td><td>11.625 ₺ (126)</td><td>%1,8</td></tr>
<tr><td>Bursa</td><td>99.080 ₺</td><td>58</td><td>9</td><td>1.708 ₺ (114)</td><td>11.009 ₺ (120)</td><td>%10,2</td></tr>
<tr><td>İzmir</td><td>146.768 ₺</td><td>98</td><td>14</td><td>1.498 ₺ (100)</td><td>10.483 ₺ (114)</td><td>%11,3</td></tr>
<tr><td>Kayseri</td><td>92.949 ₺</td><td>61</td><td>9</td><td>1.524 ₺ (102)</td><td>10.328 ₺ (112)</td><td>%7,5</td></tr>
<tr><td>Adana</td><td>58.749 ₺</td><td>39</td><td>6</td><td>1.506 ₺ (101)</td><td>9.792 ₺ (106)</td><td>%7,1</td></tr>
<tr><td>İstanbul</td><td><b>225.869 ₺</b></td><td>181</td><td>27</td><td>1.248 ₺ (84)</td><td>8.366 ₺ (91)</td><td>%2,8</td></tr>
<tr><td>Eskişehir</td><td>120.800 ₺</td><td>74</td><td>15</td><td>1.632 ₺ (109)</td><td>8.053 ₺ (88)</td><td>%6,6</td></tr>
<tr><td>Ankara</td><td>116.700 ₺</td><td>73</td><td>15</td><td>1.599 ₺ (107)</td><td>7.780 ₺ (85)</td><td>%9,0</td></tr>
<tr><td>Samsun</td><td>45.530 ₺</td><td>28</td><td>6</td><td>1.626 ₺ (109)</td><td>7.588 ₺ (83)</td><td>%8,3</td></tr>
<tr><td>Gaziantep</td><td>43.292 ₺</td><td>23</td><td>7</td><td>1.882 ₺ (126)</td><td>6.185 ₺ (67)</td><td>%4,3</td></tr>
<tr><td>Konya</td><td>27.444 ₺</td><td>22</td><td>5</td><td>1.247 ₺ (84)</td><td>5.489 ₺ (60)</td><td>%0</td></tr>
<tr><td>(Şehir yok)</td><td>63.853 ₺</td><td>42</td><td>7</td><td>1.520 ₺ (102)</td><td>9.122 ₺ (99)</td><td>%3,5</td></tr>
<tr><td><b>Şirket</b></td><td>1.250.772 ₺</td><td>838</td><td>136</td><td>1.493 ₺ (100)</td><td>9.197 ₺ (100)</td><td>%6,8</td></tr>
</table></div>
<p><b>Bulgu:</b> Toplam satışta İstanbul açık ara birinci (satışın %18,1’i). Ama müşteri başına ortalamanın altında (91) ve sepeti en küçüklerden (84). Toplam tutar şehrin büyüklüğünü ölçer, başarısını değil. Müşteri başına bakınca 7 müşterili Trabzon birinci (163).</p>

<p><b>Adım 2: Müşteri başı satışı ikiye ayır.</b> Müşteri başı satış = müşteri başı sipariş × sepet. İki şehir aynı endekse farklı yollardan ulaşabilir ve her yolun aksiyonu farklıdır.</p>
<pre class="dax">Sipariş Sıklığı Endeksi =
DIVIDE(
    [Müşteri Başı Sipariş],
    CALCULATE([Müşteri Başı Sipariş], REMOVEFILTERS(Musteriler))
) * 100</pre>
<p><b>Bulgu:</b> Trabzon’da müşteri ortalama 11,7 sipariş veriyor (şirket 6,2; sıklık endeksi 190) ama sepeti küçük (86). Gaziantep tam tersi: sepet 126, sıklık yalnızca 53. Trabzon için doğru aksiyon sepeti büyütmek (çapraz satış), Gaziantep için tekrar siparişi artırmak (hatırlatma kampanyası).</p>
<p>İstanbul’un küçük sepeti kanal karmasından mı geliyor? Aynı kanal içinde kıyaslarız: İstanbul’un Web sepeti 1.176 ₺ (şirketin Web sepeti 1.420 ₺), Mobil sepeti 1.163 ₺ (şirket 1.554 ₺). İki kanalda da düşük; yani fark kanal karmasından değil, İstanbul müşterisinin daha küçük sepetle alışveriş yapmasından geliyor.</p>

<p><b>Adım 3: Olağan dışı mı, gürültü mü?</b> Bir şehrin farkının ne kadar büyük olduğunu z-skoru söyler: (şehir − şehirlerin ortalaması) ÷ standart sapma. Yöntemin ayrıntısı <b>İleri istatistik: eğilim, z-skoru, mevsimsellik</b> dersinde.</p>
<pre class="dax">Şehir Z-Skoru =
VAR Seri =
    FILTER(
        ADDCOLUMNS(ALL(Musteriler[Sehir]), "M", [Müşteri Başı Satış]),
        NOT ISBLANK(Musteriler[Sehir])
    )
VAR Ort = AVERAGEX(Seri, [M])
VAR Sapma = STDEVX.P(Seri, [M])
RETURN
    IF(HASONEVALUE(Musteriler[Sehir]), DIVIDE([Müşteri Başı Satış] - Ort, Sapma))</pre>
<p><b>Bulgu:</b> 12 şehrin müşteri başı satış ortalaması 9.309 ₺, standart sapması 2.510 ₺. ±2 sınırını aşan tek şehir Trabzon (z = 2,27). En düşükler Konya (−1,52) ve Gaziantep (−1,25). İade oranında hiçbir şehir ±2’yi aşmıyor; en yüksekler Trabzon (1,40) ve İzmir (1,26).</p>
<p>İkinci savunma hattı örnek büyüklüğüdür. Konya’nın iade oranı %0: 22 siparişte tek iade olmamış. Bu bir başarı değil, az veridir. Oranı yalnızca yeterli sipariş varsa göster:</p>
<pre class="dax">Güvenilir İade % =
IF([Sipariş Sayısı] &gt;= 30, [İade Oranı %])</pre>
<p><b>Bulgu:</b> 30 sipariş eşiğini 9 şehir ve şehri boş grup geçiyor. Konya, Gaziantep ve Samsun’da hücre boş kalır; tabloya “örnek az” notu düş. Eşiği raporda yazılı tut, sonuç beğenilmedi diye değiştirme.</p>

<p><b>Adım 4: Teslim süresi kıyası.</b> Mağazasız ortalamayı şirketin mağazasız ortalamasıyla karşılaştırırız. Fark gün cinsindendir; eksi değer daha hızlı demektir.</p>
<pre class="dax">Teslim Farkı (gün) =
VAR Sehir = CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web", "Mobil"})
VAR Sirket =
    CALCULATE(
        [Ortalama Kargo Günü],
        Satislar[Kanal] IN {"Web", "Mobil"},
        REMOVEFILTERS(Musteriler)
    )
RETURN Sehir - Sirket</pre>
<p><b>Bulgu:</b> Şirketin Web ve Mobil teslim ortalaması 3,65 gün. En yavaş Eskişehir (4,09 gün, +0,44), Konya (4,03) ve Bursa (3,97); en hızlı İzmir (3,30 gün, −0,36), Gaziantep (3,39) ve Ankara (3,41). Bursa’da kargolu satırların %16,4’ü 7 gün ya da daha geç teslim edilmiş; İzmir’de bu oran %1,4. Bursa hem yavaş hem iadesi yüksek (%10,2) bir şehir; kargo firmasıyla konuşulacak ilk şehir burası.</p>

<p><b>Adım 5: Temsilci kıyası: karma etkisini ayır.</b> Temsilcilerin iade oranları farklı. Ama her temsilcinin müşterileri farklı şehirlerde. İadesi yüksek bir şehirde çok müşterisi olan temsilci, kendi hatası olmadan yüksek görünebilir. Bu yüzden her temsilci için <b>beklenen</b> iadeyi hesaplarız: kendi şehir karmasıyla, ama şirketin şehir oranlarıyla.</p>
<pre class="dax">Beklenen İade % =
DIVIDE(
    SUMX(
        VALUES(Musteriler[Sehir]),
        CALCULATE(COUNTROWS(Satislar))
            * CALCULATE([İade Oranı %], REMOVEFILTERS(Calisanlar))
    ),
    COUNTROWS(Satislar)
)
İade Farkı (puan) =
([İade Oranı %] - [Beklenen İade %]) * 100</pre>
<div class="tbl-wrap"><table>
<tr><th>Temsilci</th><th>İade oranı</th><th>Şehir karmasına göre beklenen</th><th>Fark</th></tr>
<tr><td>Can Aydın</td><td><b>%12,4</b></td><td>%8,5</td><td><b>+3,9 puan</b></td></tr>
<tr><td>Yusuf Kara</td><td>%7,6</td><td>%6,6</td><td>+1,0 puan</td></tr>
<tr><td>Ece Kurt</td><td>%5,8</td><td>%5,8</td><td>0,0 puan</td></tr>
<tr><td>Elif Doğan</td><td>%5,5</td><td>%5,5</td><td>0,0 puan</td></tr>
<tr><td>Oğuz Demir</td><td>%4,9</td><td>%7,0</td><td>−2,1 puan</td></tr>
<tr><td>Gamze Özkan</td><td>%4,3</td><td>%6,9</td><td>−2,6 puan</td></tr>
</table></div>
<p><b>Bulgu:</b> Can Aydın’ın 290 satırının 62’si Trabzon’dan. Bu karma onun beklenen iadesini %8,5’e çıkarıyor, ama gerçekleşen %12,4 yine 3,9 puan yukarıda. Asıl ilginç olan şu: Trabzon’da Can Aydın’ın müşterilerinde iade %19,4 (62 satırda 12), aynı şehirde diğer temsilcilerin müşterilerinde %6,1 (82 satır). Trabzon dışında da Can Aydın’ın iadesi %10,5. Yani Trabzon’un yüksek iadesi şehirden değil, büyük ölçüde bu portföyden geliyor. Şirketin 80.835 ₺ iade tutarının 30.641 ₺’si (%37,9) bu portföyde. Kategori karması ise farkı açıklamıyor: kategori karmasına göre beklenen iade bütün temsilcilerde %6,7 ile %6,9 arasında.</p>
<div class="warn"><b>Kişiyi suçlamadan önce</b>Fark bir sinyaldir, hüküm değil. Can Aydın’ın 8 müşterisinde 3 ya da daha fazla iade var; sorun tek bir müşteriye bağlı değil. Önce bu müşterilerin ürünlerine ve iade nedenlerine bak, sonra temsilciyle konuş.</div>

<p><b>Adım 6: Şehir profili ve dinamik başlık.</b> Kıyas sayfasında bir şehre sağ tıklayınca <b>Detaya git (Drill-through)</b> ile profil sayfası açılır. Sayfanın başlığı seçili şehri ve konumunu anlatır:</p>
<pre class="dax">Profil Başlığı =
VAR Sehir =
    IF(
        HASONEVALUE(Musteriler[Sehir]),
        COALESCE(SELECTEDVALUE(Musteriler[Sehir]), "(Şehir yok)"),
        "Tüm şehirler"
    )
VAR Sepet = DIVIDE([Ortalama Sepet], CALCULATE([Ortalama Sepet], REMOVEFILTERS(Musteriler))) - 1
VAR Siklik = DIVIDE([Müşteri Başı Sipariş], CALCULATE([Müşteri Başı Sipariş], REMOVEFILTERS(Musteriler))) - 1
RETURN
    Sehir &amp; " · sepet " &amp; IF(Sepet &gt;= 0, "+", "−") &amp; "%" &amp; FORMAT(ABS(Sepet) * 100, "0")
        &amp; ", sipariş sıklığı " &amp; IF(Siklik &gt;= 0, "+", "−") &amp; "%" &amp; FORMAT(ABS(Siklik) * 100, "0")</pre>
<p><b>Bulgu:</b> Trabzon seçiliyken başlık “Trabzon · sepet −%14, sipariş sıklığı +%90” olur; Gaziantep’te “sepet +%26, sipariş sıklığı −%47”. Başlık, tablodaki iki endeksi tek cümlede okutur. Şehri boş grup “(Şehir yok)” diye görünür, boş bir başlık çıkmaz.</p>

<h2>4. Rapor sayfası taslağı</h2>
<div class="tbl-wrap"><table>
<tr><th>Sayfa / konum</th><th>Görsel</th><th>Alanlar</th></tr>
<tr><td>Kıyas, üst şerit</td><td>4 kart</td><td>Şirket sepeti, müşteri başı satış, iade oranı, Web+Mobil teslim günü (cetvel değerleri)</td></tr>
<tr><td>Kıyas, sol</td><td>Matris</td><td>Sehir; Sepet Endeksi, Sipariş Sıklığı Endeksi, Güvenilir İade %, Teslim Farkı (gün). Endekslerde 100 çevresinde iki yönlü renk ölçeği.</td></tr>
<tr><td>Kıyas, sağ</td><td>Dağılım grafiği (Scatter)</td><td>X: Sipariş Sıklığı Endeksi, Y: Sepet Endeksi, boyut: Müşteri Sayısı. 100’de iki sabit çizgi dört bölge çizer.</td></tr>
<tr><td>Kıyas, alt</td><td>Tablo</td><td>Temsilci; İade Oranı %, Beklenen İade %, İade Farkı (puan); alt bilgi: “Portföy kıyası, atama geriye dönük.”</td></tr>
<tr><td>Şehir profili</td><td>Detay sayfası</td><td>Detaya git alanı: Musteriler[Sehir]. Başlık: Profil Başlığı. Aylık satış çizgisi, kategori çubuğu, kanal payı, en çok iade eden 5 müşteri.</td></tr>
</table></div>
<div class="tip"><b>Endeksi biçimlendir</b>Endeks ölçülerinde ondalık gösterme ve eksen ya da renk ölçeğinin ortasını 100’e sabitle. Okuyucu “100’ün üstü iyi” kuralını bir kez öğrenince bütün sütunları aynı gözle okur. İade ve teslim gününde ters yön geçerlidir; renk ölçeğini bu sütunlarda ters çevir.</div>

<h2>5. Bulgu özeti ve öneri</h2>
<ol>
<li><b>Toplamla değil müşteri başına kıyasla.</b> İstanbul satışın %18,1’ini getiriyor ama müşteri başına ortalamanın altında (91). Hedef ve ödül tablolarına toplam satışın yanında müşteri başı endeksi ekle.</li>
<li><b>Trabzon’da sepet, Gaziantep’te sıklık:</b> Trabzon müşterisi çok sık ama küçük sepetle alıyor (sıklık 190, sepet 86); Gaziantep tersi (sıklık 53, sepet 126). Kampanyaları bu iki farklı soruna göre ayır.</li>
<li><b>Can Aydın portföyündeki iadeyi incele:</b> şehir karmasına göre beklenenden 3,9 puan yüksek; şirket iade tutarının %37,9’u bu portföyde. Trabzon’un yüksek iadesi şehirden değil bu portföyden geliyor.</li>
<li><b>Bursa ve Eskişehir için kargo görüşmesi:</b> Web+Mobil teslim 3,97 ve 4,09 gün; Bursa’da her altı kargolu satırdan biri 7 gün ya da daha geç.</li>
<li><b>Küçük şehirleri eşikle göster:</b> 30 siparişin altındaki şehirlerin (Konya, Gaziantep, Samsun) oranlarını “örnek az” diye işaretle; şehri boş 7 müşteriyi kaynakta düzelt.</li>
</ol>
`,
  ex: [
    { t:'dax', name:'Şehir Sepet Endeksi', q:'<b>Şehir Sepet Endeksi</b>: <code>[Ortalama Sepet]</code> değerini, müşteri tablosundaki tüm filtreler kaldırılmış şirket sepetine böl ve 100 ile çarp.',
      sol:'DIVIDE([Ortalama Sepet], CALCULATE([Ortalama Sepet], REMOVEFILTERS(Musteriler))) * 100',
      hint:'Pay: [Ortalama Sepet]. Payda: CALCULATE([Ortalama Sepet], REMOVEFILTERS(Musteriler)). Sonucu 100 ile çarp.',
      grid:[{t:'Musteriler',c:'Sehir'}] },
    { t:'dax', name:'Bölge Sıklık Endeksi', q:'<b>Bölge Sıklık Endeksi</b>: <code>[Müşteri Başı Sipariş]</code> değerini şirket ortalamasına (müşteri filtreleri kaldırılmış) böl ve 100 ile çarp.',
      sol:'DIVIDE([Müşteri Başı Sipariş], CALCULATE([Müşteri Başı Sipariş], REMOVEFILTERS(Musteriler))) * 100',
      hint:'Endeks kalıbı aynı: DIVIDE(ölçü, CALCULATE(ölçü, REMOVEFILTERS(Musteriler))) * 100.',
      grid:[{t:'Musteriler',c:'Bolge'}] },
    { t:'dax', name:'Mağazasız Teslim Farkı', q:'<b>Mağazasız Teslim Farkı</b>: yalnızca Web ve Mobil kanalında <code>[Ortalama Kargo Günü]</code> ile aynı kanallardaki şirket ortalaması (müşteri filtreleri kaldırılmış) arasındaki farkı gün olarak döndür.',
      sol:'CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web", "Mobil"}) - CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web", "Mobil"}, REMOVEFILTERS(Musteriler))',
      hint:'İki CALCULATE yaz; ikisinde de Satislar[Kanal] IN {"Web", "Mobil"} olsun, ikincisine REMOVEFILTERS(Musteriler) ekle ve birinciden çıkar.',
      grid:[{t:'Musteriler',c:'Sehir'}] },
    { t:'dax', name:'Karmaya Göre Beklenen İade %', q:'<b>Karmaya Göre Beklenen İade %</b>: her şehir için satır sayısını, o şehrin temsilci filtresi kaldırılmış <code>[İade Oranı %]</code> değeriyle çarp; şehirler üzerinden topla ve toplam satır sayısına böl.',
      sol:'DIVIDE(SUMX(VALUES(Musteriler[Sehir]), CALCULATE(COUNTROWS(Satislar)) * CALCULATE([İade Oranı %], REMOVEFILTERS(Calisanlar))), COUNTROWS(Satislar))',
      hint:'SUMX(VALUES(Musteriler[Sehir]), CALCULATE(COUNTROWS(Satislar)) * CALCULATE([İade Oranı %], REMOVEFILTERS(Calisanlar))) sonucunu DIVIDE ile COUNTROWS(Satislar)’a böl.',
      grid:[{t:'Calisanlar',c:'AdSoyad'}] },
    { t:'query', q:'En az 30 siparişi olan şehirler için <code>Musteriler[Sehir]</code>, <code>"Sipariş"</code> (<code>[Sipariş Sayısı]</code>) ve <code>"İade %"</code> (<code>[İade Oranı %]</code>) sütunlarını döndür.',
      start:'EVALUATE\n',
      sol:'EVALUATE\nFILTER(\n    ADDCOLUMNS(VALUES(Musteriler[Sehir]), "Sipariş", [Sipariş Sayısı], "İade %", [İade Oranı %]),\n    [Sipariş] >= 30\n)',
      hint:'ADDCOLUMNS(VALUES(Musteriler[Sehir]), …) ile iki sütun ekle, sonra FILTER(…, [Sipariş] >= 30).' },
    { t:'mc', q:'Konya’nın iade oranı %0 (22 sipariş). Kıyas tablosunda bunu nasıl göstermelisin?',
      o:['En iyi şehir olarak öne çıkar','Örnek az diye işaretle','Konya’yı tablodan tamamen çıkar','Şirket ortalamasını Konya’ya yaz'], a:1,
      why:'22 siparişte hiç iade olmaması şans eseri olabilir; birkaç sipariş oranı çok oynatır. Eşik altındaki şehri silmek bilgiyi gizler, ortalama yazmak uydurmadır. “Örnek az” notuyla göster.' },
    { t:'mc', q:'Trabzon’un iade oranı %11,8. Can Aydın’ın Trabzon müşterilerinde %19,4, diğer temsilcilerin Trabzon müşterilerinde %6,1. En doğru yorum hangisi?',
      o:['Trabzon’a kargo gönderimi durdurulmalı','Trabzon’daki fark tamamen şans eseridir','Fark büyük ölçüde bir portföyden geliyor','Trabzon’un iadesi ortalamanın altındadır'], a:2,
      why:'Aynı şehirde diğer portföylerin iadesi şirket ortalamasına yakın (%6,1). Yüksek oran şehrin genelinden değil, Can Aydın’ın müşterilerinden geliyor; kırılımı ikinci bir boyutla kesmek bunu gösterdi.' }
  ]
});

/* ---------- Vaka 7: Pazar payı ve rakip karşılaştırması (B2) ---------- */
add('vaka-kiyaslama', {
  id: 'vaka-pazar', lv: 'B2', mod: 'Vaka Çalışmaları', min: 28,
  title: 'Vaka: pazar payı ve rakip karşılaştırması',
  sum: 'Pazarlama müdürü “büyüyoruz ama pazar da büyüyor; payımız artıyor mu?” diye soruyor. Modelde olmayan bir pazar büyüklüğü tablosunu DATATABLE ile kurar, ayrıntı düzeyini ve ilişkiyi (ilişki ya da TREATAS) çözer, pazar payını, puan cinsinden pay değişimini, ilk 3 + Diğer tablosunu ve pazar büyümesine karşı bizim büyümemizi gösteren dört bölgeli bir sınıflamayı hesaplarsın.',
  body: `
<h2>1. Şirketin sorusu ve brif</h2>
<p><b>Kim soruyor?</b> Pazarlama müdürü. 2024’te satışımız %86 büyüdü; yönetim kurulu bunu kutlamak istiyor. Müdür ise temkinli: “Pazar da büyüdüyse, belki sadece dalgaya bindik.”</p>
<p><b>Hangi karar?</b> 2025 pazarlama bütçesi kategoriler arasında nasıl bölünecek? Brifin soruları:</p>
<ol>
<li>Her kategoride pazarın yüzde kaçını alıyoruz ve bu pay geçen yıla göre kaç puan değişti?</li>
<li>En büyük üç kategorimiz ve “Diğer” grubu pazarda nerede duruyor?</li>
<li>Hangi kategoride pazardan hızlı büyüyoruz, hangisinde pazarın gerisinde kaldık?</li>
</ol>
<div class="warn"><b>Bu vakadaki pazar rakamları örnektir</b>Modelde pazar verisi yok. Aşağıdaki pazar büyüklükleri <b>ders için uydurulmuş</b> örnek değerlerdir; gerçek bir sektörü ya da kurumu temsil etmez. Gerçek işte bu tablo bir sektör derneğinden, araştırma şirketinden ya da kamu istatistiğinden gelir ve kaynağı rapora yazılır.</div>

<h2>2. Veri ve model</h2>
<p>Dış kaynaktan gelen pazar verisi genelde küçük bir Excel tablosudur. Bizim örneğimiz <b>kategori × yıl</b> düzeyinde 14 satır. Power BI’da <b>Hesaplanmış tablo (Calculated table)</b> olarak şöyle kurulabilir:</p>
<pre class="dax">Pazar =
${esc(PAZAR)}</pre>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>Ayrıntı düzeyi</th><th>Not</th></tr>
<tr><td><code>Satislar</code></td><td>Sipariş satırı, gün</td><td>Bizim satışımız: <code>[Net Satış]</code></td></tr>
<tr><td><code>Pazar</code></td><td>Kategori × yıl</td><td>Örnek pazar büyüklüğü, ₺. Yalnızca 2023 ve 2024.</td></tr>
<tr><td><code>Kategoriler</code>, <code>Tarih</code></td><td>Kategori; gün → ay → yıl</td><td>İki tablonun ortak boyutları</td></tr>
</table></div>
<p><b>Ayrıntı düzeyi sorunu.</b> Satışlar gün düzeyinde, pazar yıl düzeyinde. Bu, <b>Hedef ve gerçekleşen: farklı ayrıntı düzeyleri</b> dersindeki sorunun aynısı. Bağlamak için iki yol var:</p>
<ul>
<li><b>Kategori için ilişki:</b> <code>Pazar[Kategori]</code> çoka-bir <code>Kategoriler[Kategori]</code>. Kategori boyutu zaten var; ilişki en temiz yoldur.</li>
<li><b>Yıl için TREATAS:</b> modelde yıl başına bir satırlık tablo yok; <code>Tarih[Yil]</code> benzersiz değil, ilişki kurulamaz. Ya küçük bir <code>Yillar</code> boyutu eklenir ya da ölçüde sanal ilişki kurulur:</li>
</ul>
<pre class="dax" data-notry>Pazar Büyüklüğü =
CALCULATE(
    SUM(Pazar[PazarTL]),
    TREATAS(VALUES(Tarih[Yil]), Pazar[Yil])
)
-- İlişki yerine kategori için de TREATAS kullanılabilir:
-- TREATAS(VALUES(Kategoriler[Kategori]), Pazar[Kategori])</pre>
<p><code>TREATAS</code>, <code>Tarih</code>’te seçili yılları alır ve sanki <code>Pazar[Yil]</code> sütununa konmuş bir filtreymiş gibi uygular. Ayrıntısı <b>Tablo fonksiyonları, kümeler ve sanal ilişkiler</b> dersinde. Ters yönde de çalışır: pazar tablosunun her satırına bizim satışımızı getirmek için satırın kategori ve yılını iki sütunlu bir filtreye çeviririz:</p>
<pre class="dax">EVALUATE
VAR Pazar = ${esc(PAZAR)}
RETURN
    ADDCOLUMNS(
        Pazar,
        "Bizim Satış",
            CALCULATE(
                [Net Satış],
                TREATAS(ROW("K", [Kategori], "Y", [Yil]), Kategoriler[Kategori], Tarih[Yil])
            )
    )</pre>
<p><b>Veri sınırları:</b> 2022 için pazar verisi yok ve bizim 2022 satışımız Haziran’da başlıyor. Pay hesabı yalnızca 2023 ve 2024’te anlamlı. Pazar verisi yıllık olduğu için ay düzeyinde pay hesaplanmaz.</p>

<h2>3. Analiz adımları</h2>
<p><b>Adım 1: Pazar payı ve ayrıntı düzeyi koruması.</b> Uygulamanın motorunda <code>Pazar</code> tablosu modelde olmadığı için tabloyu ölçünün içinde bir değişkene koyarız; modelde yukarıdaki <code>TREATAS</code>’lı sürümü kullanırsın. Mantık aynı:</p>
<pre class="dax">Pazar Büyüklüğü =
VAR P = ${esc(PAZAR).replace(/\n/g, '\n    ')}
RETURN
    SUMX(
        FILTER(P, [Kategori] IN VALUES(Kategoriler[Kategori]) &amp;&amp; [Yil] IN VALUES(Tarih[Yil])),
        [PazarTL]
    )
Pazar Payı % =
VAR TekTamYil = HASONEVALUE(Tarih[Yil]) &amp;&amp; DISTINCTCOUNT(Tarih[YilAy]) = 12
RETURN IF(TekTamYil, DIVIDE([Net Satış], [Pazar Büyüklüğü]))
Pay Değişimi (puan) =
VAR Bu = [Pazar Payı %]
VAR Gecen = CALCULATE([Pazar Payı %], SAMEPERIODLASTYEAR(Tarih[Tarih]))
RETURN IF(NOT ISBLANK(Bu) &amp;&amp; NOT ISBLANK(Gecen), (Bu - Gecen) * 100)</pre>
<p>Koruma neden gerekli? Koruma olmadan matriste ay satırına inersen, bir aylık satış bütün yılın pazarına bölünür: Elektronik 2024 Ocak için %0,10 gibi anlamsız küçük bir pay çıkar. Hiç yıl seçilmezse de 2022’yi içeren satış, yalnızca 2023–2024’ü içeren pazara bölünür. <code>TekTamYil</code> ikisini de engeller.</p>
<div class="note"><b>Puan ve yüzde farkı</b>Pay %2,0’dan %2,5’e çıktıysa artış <b>0,5 puandır</b> (yüzde puan); “%25 arttı” demek de doğrudur ama başka bir şeyi anlatır. Raporda pay değişimini her zaman puanla yaz ve ölçünün adına “(puan)” ekle.</div>
<div class="tbl-wrap"><table>
<tr><th>Kategori</th><th>2024 satış</th><th>2024 pazar (örnek)</th><th>Pay 2023</th><th>Pay 2024</th><th>Değişim</th></tr>
<tr><td>Kitap</td><td>95.327 ₺</td><td>1.800.000 ₺</td><td>%2,99</td><td><b>%5,30</b></td><td>+2,30 puan</td></tr>
<tr><td>Spor</td><td>98.317 ₺</td><td>3.190.000 ₺</td><td>%3,19</td><td>%3,08</td><td>−0,11 puan</td></tr>
<tr><td>Ev &amp; Yaşam</td><td>144.292 ₺</td><td>4.760.000 ₺</td><td>%1,97</td><td>%3,03</td><td>+1,06 puan</td></tr>
<tr><td>Elektronik</td><td>206.432 ₺</td><td>7.800.000 ₺</td><td>%2,04</td><td>%2,65</td><td>+0,61 puan</td></tr>
<tr><td>Kozmetik</td><td>82.908 ₺</td><td>3.380.000 ₺</td><td>%1,47</td><td>%2,45</td><td>+0,98 puan</td></tr>
<tr><td>Giyim</td><td>110.090 ₺</td><td>5.220.000 ₺</td><td>%2,36</td><td>%2,11</td><td><b>−0,25 puan</b></td></tr>
<tr><td>Hediye</td><td>9.700 ₺</td><td>1.140.000 ₺</td><td>%0,95</td><td>%0,85</td><td>−0,09 puan</td></tr>
<tr><td><b>Toplam</b></td><td>747.066 ₺</td><td>27.290.000 ₺</td><td>%2,18</td><td>%2,74</td><td>+0,56 puan</td></tr>
</table></div>
<p><b>Bulgu:</b> Toplam payımız %2,18’den %2,74’e çıktı (+0,56 puan): büyümenin bir kısmı gerçekten pazardan pay almaktan geliyor. Ama üç kategoride pay kaybettik: Giyim (−0,25 puan), Spor (−0,11) ve Hediye (−0,09). En güçlü kategori oransal olarak Kitap (%5,30).</p>

<p><b>Adım 2: İlk 3 + Diğer.</b> Yönetim kuruluna yedi satırlık tablo yerine en büyük üç kategoriyi ve geri kalanı tek satırda gösteririz. Kalıbın ürün düzeyindeki hali <b>İleri iş kalıpları: Top N + Diğer, sepet, LFL, para birimi</b> dersinde; burada sorguyla kuruyoruz:</p>
<pre class="dax">EVALUATE
VAR Pazar = ${esc(PAZAR)}
VAR T =
    ADDCOLUMNS(
        VALUES(Kategoriler[Kategori]),
        "Satış", CALCULATE([Net Satış], Tarih[Yil] = 2024),
        "Pazar", VAR k = Kategoriler[Kategori] RETURN SUMX(FILTER(Pazar, [Kategori] = k &amp;&amp; [Yil] = 2024), [PazarTL])
    )
VAR Ilk3 = TOPN(3, T, [Satış], DESC)
VAR Diger = EXCEPT(T, Ilk3)
RETURN
    UNION(
        SELECTCOLUMNS(Ilk3, "Grup", Kategoriler[Kategori], "Satış", [Satış], "Pazar", [Pazar], "Pay", DIVIDE([Satış], [Pazar])),
        ROW("Grup", "Diğer", "Satış", SUMX(Diger, [Satış]), "Pazar", SUMX(Diger, [Pazar]),
            "Pay", DIVIDE(SUMX(Diger, [Satış]), SUMX(Diger, [Pazar])))
    )</pre>
<p><b>Bulgu:</b> Elektronik (%2,65), Ev &amp; Yaşam (%3,03) ve Giyim (%2,11) satışımızın %61,7’sini getiriyor. “Diğer” grubu 286.252 ₺ ile 9.510.000 ₺’lik bir pazarın %3,01’ini alıyor. Dikkat: “Diğer”in payı, içindeki Kitap’ın yüksek payıyla şişiyor. Özet tablo kararı gizleyebilir; detayı araç ipucunda (Tooltip) ver.</p>

<p><b>Adım 3: Bizim büyüme ile pazar büyümesi.</b> Her kategoriyi iki soruya göre dört bölgeye koyarız: pazar, toplam pazardan (%48,3) hızlı mı büyüyor? Biz pay kazanıyor muyuz?</p>
<pre class="dax">EVALUATE
VAR Pazar = ${esc(PAZAR)}
VAR T =
    ADDCOLUMNS(
        VALUES(Kategoriler[Kategori]),
        "Biz23", CALCULATE([Net Satış], Tarih[Yil] = 2023),
        "Biz24", CALCULATE([Net Satış], Tarih[Yil] = 2024),
        "P23", VAR k = Kategoriler[Kategori] RETURN SUMX(FILTER(Pazar, [Kategori] = k &amp;&amp; [Yil] = 2023), [PazarTL]),
        "P24", VAR k = Kategoriler[Kategori] RETURN SUMX(FILTER(Pazar, [Kategori] = k &amp;&amp; [Yil] = 2024), [PazarTL])
    )
VAR PazarOrt = DIVIDE(SUMX(T, [P24]), SUMX(T, [P23])) - 1
RETURN
    ADDCOLUMNS(
        T,
        "Pazar Büyümesi", DIVIDE([P24], [P23]) - 1,
        "Bizim Büyüme", DIVIDE([Biz24], [Biz23]) - 1,
        "Kadran",
            VAR Hizli = DIVIDE([P24], [P23]) - 1 &gt;= PazarOrt
            VAR Kazan = DIVIDE([Biz24], [P24]) &gt; DIVIDE([Biz23], [P23])
            RETURN SWITCH(TRUE(),
                Hizli &amp;&amp; Kazan, "Yıldız",
                Hizli, "Fırsat kaçıyor",
                Kazan, "Güçleniyor",
                "Geriliyor")
    )</pre>
<div class="tbl-wrap"><table>
<tr><th>Bölge</th><th>Anlamı</th><th>Kategoriler (pazar büyümesi / bizim büyüme)</th></tr>
<tr><td><b>Yıldız</b></td><td>Pazar hızlı, biz daha hızlı</td><td>Elektronik (%50 / %94)</td></tr>
<tr><td><b>Fırsat kaçıyor</b></td><td>Pazar hızlı, biz geride</td><td>Giyim (%80 / %61), Hediye (%90 / %71)</td></tr>
<tr><td><b>Güçleniyor</b></td><td>Pazar yavaş, biz hızlı</td><td>Kitap (%20 / %112), Ev &amp; Yaşam (%40 / %115), Kozmetik (%30 / %117)</td></tr>
<tr><td><b>Geriliyor</b></td><td>Pazar yavaş, biz daha yavaş</td><td>Spor (%45 / %40)</td></tr>
</table></div>
<p><b>Bulgu:</b> Giyim %61 büyüdüğü halde pay kaybetti, çünkü pazar %80 büyüdü. 2023 payını koruyabilseydik Giyim’de 13.214 ₺, Spor’da 3.587 ₺, Hediye’de 1.073 ₺ daha fazla satış olacaktı. Elektronik sınırda bir Yıldız: pazarı %50 büyüdü, eşik %48,3. Eşiğe çok yakın kategorileri raporda ayrıca belirt.</p>
<div class="tip"><b>Görsel olarak</b>Dağılım grafiğinde X: pazar büyümesi, Y: pay değişimi (puan), boyut: 2024 satışı. X’te %48,3, Y’de 0 için iki sabit çizgi (Analiz bölmesi) dört bölgeyi çizer. Kadran adını renk alanına koy.</div>

<h2>4. Rapor sayfası taslağı</h2>
<div class="tbl-wrap"><table>
<tr><th>Konum</th><th>Görsel</th><th>Alanlar</th></tr>
<tr><td>Üst şerit</td><td>3 kart</td><td>Toplam pazar payı 2024; Pay değişimi (puan); Pazar büyümesi ve bizim büyüme yan yana</td></tr>
<tr><td>Sol orta</td><td>Çubuk grafik</td><td>Kategori (İlk 3 + Diğer); Pazar Payı %; araç ipucunda Diğer’in içindekiler</td></tr>
<tr><td>Sağ orta</td><td>Dağılım grafiği</td><td>Pazar büyümesi × Pay değişimi; dört bölge</td></tr>
<tr><td>Alt</td><td>Matris</td><td>Kategori; Net Satış, Pazar Büyüklüğü, Pazar Payı %, Pay Değişimi (puan), Kadran</td></tr>
<tr><td>Sayfa notu</td><td>Metin kutusu</td><td>“Pazar verisi: örnek tablo, yıllık. Ay düzeyinde pay gösterilmez.” Gerçek raporda kaynak ve yayın tarihi.</td></tr>
</table></div>

<h2>5. Bulgu özeti ve öneri</h2>
<ol>
<li><b>Büyümenin bir kısmı gerçek pay kazancı:</b> toplam pay %2,18’den %2,74’e (+0,56 puan). Yönetim kuruluna “%86 büyüdük” yerine “pazar %48 büyüdü, biz %86” cümlesini götür.</li>
<li><b>Giyim ve Hediye’de fırsat kaçıyor:</b> pazar %80 ve %90 büyürken pay kaybettik. 2025 bütçesinde bu iki kategoriye ek pazarlama payı ayır.</li>
<li><b>Spor geriliyor:</b> yavaş büyüyen pazarda bile pay kaybı (−0,11 puan). Önce ürün ve fiyat sorununu ara; bütçe artırmadan önce nedeni bul.</li>
<li><b>Kitap, Ev &amp; Yaşam ve Kozmetik güçleniyor:</b> payı koruyacak kadar bütçe yeterli; fazlası Giyim’e kaydırılabilir.</li>
<li><b>Pazar verisinin kaynağını ve güncelliğini yaz:</b> bu vakadaki rakamlar örnektir. Gerçek tabloda tanım farkı (ör. pazarın KDV dâhil olması) payı puanlarca değiştirebilir.</li>
</ol>
`,
  ex: [
    { t:'dax', name:'Pazar Payı 2024 %', q:'<b>Pazar Payı 2024 %</b>: başlangıç kodundaki <code>P</code> tablosundan seçili kategorilerin 2024 pazarını topla; 2024 <code>[Net Satış]</code> değerini bu pazara böl.',
      start:'VAR P = ' + PAZAR + '\nRETURN\n',
      sol:'VAR P = ' + PAZAR + '\nRETURN\n    DIVIDE(\n        CALCULATE([Net Satış], Tarih[Yil] = 2024),\n        SUMX(FILTER(P, [Kategori] IN VALUES(Kategoriler[Kategori]) && [Yil] = 2024), [PazarTL])\n    )',
      hint:'Pazar: SUMX(FILTER(P, [Kategori] IN VALUES(Kategoriler[Kategori]) && [Yil] = 2024), [PazarTL]). Satış: CALCULATE([Net Satış], Tarih[Yil] = 2024). İkisini DIVIDE ile böl.',
      grid:[{t:'Kategoriler',c:'Kategori'}] },
    { t:'dax', name:'Pay Değişimi 2024 (puan)', q:'<b>Pay Değişimi 2024 (puan)</b>: seçili kategorilerin 2024 payından 2023 payını çıkar ve 100 ile çarp (yüzde puan). Pay = o yılın <code>[Net Satış]</code> ÷ o yılın pazarı.',
      start:'VAR P = ' + PAZAR + '\nRETURN\n',
      sol:'VAR P = ' + PAZAR + '\nVAR Kat = VALUES(Kategoriler[Kategori])\nVAR Pay24 = DIVIDE(CALCULATE([Net Satış], Tarih[Yil] = 2024), SUMX(FILTER(P, [Kategori] IN Kat && [Yil] = 2024), [PazarTL]))\nVAR Pay23 = DIVIDE(CALCULATE([Net Satış], Tarih[Yil] = 2023), SUMX(FILTER(P, [Kategori] IN Kat && [Yil] = 2023), [PazarTL]))\nRETURN (Pay24 - Pay23) * 100',
      hint:'Seçili kategorileri bir VAR’a al. İki pay için aynı kalıbı yaz (yalnızca yıl değişir), sonra (Pay24 - Pay23) * 100.',
      grid:[{t:'Kategoriler',c:'Kategori'}] },
    { t:'query', q:'Her kategori için 2024 <code>"Satış"</code> ve <code>"Pazar Büyümesi"</code> (2024 pazarı ÷ 2023 pazarı − 1) sütunlarını döndür. <code>Kategoriler[Kategori]</code> ilk sütun olsun.',
      start:'EVALUATE\nVAR Pazar = ' + PAZAR + '\nRETURN\n',
      sol:'EVALUATE\nVAR Pazar = ' + PAZAR + '\nRETURN\n    ADDCOLUMNS(\n        VALUES(Kategoriler[Kategori]),\n        "Satış", CALCULATE([Net Satış], Tarih[Yil] = 2024),\n        "Pazar Büyümesi",\n            VAR k = Kategoriler[Kategori]\n            RETURN DIVIDE(\n                SUMX(FILTER(Pazar, [Kategori] = k && [Yil] = 2024), [PazarTL]),\n                SUMX(FILTER(Pazar, [Kategori] = k && [Yil] = 2023), [PazarTL])\n            ) - 1\n    )',
      hint:'ADDCOLUMNS(VALUES(Kategoriler[Kategori]), …). Satır kategorisini VAR k’ye al; iki SUMX(FILTER(Pazar, [Kategori] = k && [Yil] = …), [PazarTL]) değerini böl ve 1 çıkar.' },
    { t:'query', q:'2024 için “İlk 3 + Diğer” tablosu: satışa göre ilk üç kategori ve geri kalanların toplamı tek “Diğer” satırında. Sütunlar: <code>"Grup"</code>, <code>"Satış"</code>, <code>"Pay"</code> (satış ÷ pazar).',
      start:'EVALUATE\nVAR Pazar = ' + PAZAR + '\nRETURN\n',
      sol:'EVALUATE\nVAR Pazar = ' + PAZAR + '\nVAR T =\n    ADDCOLUMNS(\n        VALUES(Kategoriler[Kategori]),\n        "Satış", CALCULATE([Net Satış], Tarih[Yil] = 2024),\n        "Pazar", VAR k = Kategoriler[Kategori] RETURN SUMX(FILTER(Pazar, [Kategori] = k && [Yil] = 2024), [PazarTL])\n    )\nVAR Ilk3 = TOPN(3, T, [Satış], DESC)\nVAR Diger = EXCEPT(T, Ilk3)\nRETURN\n    UNION(\n        SELECTCOLUMNS(Ilk3, "Grup", Kategoriler[Kategori], "Satış", [Satış], "Pay", DIVIDE([Satış], [Pazar])),\n        ROW("Grup", "Diğer", "Satış", SUMX(Diger, [Satış]), "Pay", DIVIDE(SUMX(Diger, [Satış]), SUMX(Diger, [Pazar])))\n    )',
      hint:'Önce kategori başına Satış ve Pazar içeren bir T tablosu kur. TOPN(3, T, [Satış], DESC) ilk üçü, EXCEPT(T, Ilk3) kalanları verir. UNION ile SELECTCOLUMNS(Ilk3, …) ve tek satırlık ROW("Grup", "Diğer", …) birleştir.' },
    { t:'mc', q:'Matriste <code>Tarih[Ay]</code> satırına inince Elektronik’in pazar payı her ay %0,1–0,5 gibi çok küçük görünüyor. Sorun ne?',
      o:['Aylık satış yıllık pazara bölünüyor','TREATAS ay sütununu tanımıyor','Pazar tablosunda ay sütunu eksik yazılmış','DIVIDE sıfıra bölmeyi engelliyor'], a:0,
      why:'Pazar verisi yıllık. Ay satırında satış bir aylık, pazar ise TREATAS(VALUES(Tarih[Yil]), …) ile o yılın tamamı. Ayrıntı düzeyi uymuyorsa ölçü boş dönmeli (TekTamYil koruması) ya da pazar aylara bilinçli bir kuralla dağıtılmalı.' },
    { t:'mc', q:'Giyim satışı %61 büyüdü ama payı 0,25 puan düştü. Bu nasıl mümkün?',
      o:['Giyim ölçüsünde iptaller de sayılmış','Pazar bizden hızlı, %80 büyüdü','Pay hesabı yüzdeyi puana çevirmiyor','Giyim pazarı bu yıl daralmış'], a:1,
      why:'Pay = bizim satış ÷ pazar. Pazar %80, biz %61 büyüdüysek oran düşer. Bu yüzden büyümeyi tek başına değil, pazar büyümesiyle birlikte okuruz.' }
  ]
});

/* ---------- Vaka 8: Tedarik: üret mi, satın al mı? (C1) ---------- */
add('vaka-stok', {
  id: 'vaka-tedarik', lv: 'C1', mod: 'Vaka Çalışmaları', min: 32,
  title: 'Vaka: tedarik — üret mi, satın al mı?',
  sum: 'Satın alma ve üretim ekibi bakım ürünleri hattı için üç seçeneği kıyaslıyor: mevcut tedarikçi, yeni tedarikçi teklifi ve kendi üretim. Ürünlerin birim maliyeti ve satış adetleriyle her seçeneğin toplam maliyetini, artımlı ve batık maliyet ayrımını, adet parametresiyle ne olur analizini, başabaş adedini ve senaryoları hesaplar, kararı varsayımlarıyla birlikte sunarsın.',
  body: `
<h2>1. Şirketin sorusu ve brif</h2>
<p><b>Kim soruyor?</b> Satın alma müdürü ve finans ekibi. Kozmetik kategorisindeki dört bakım ürünü (Nemlendirici Krem, Güneş Kremi SPF50, Şampuan, Dudak Balmı) son iki yılda hızla büyüdü. Bu “bakım hattı” için iki yeni seçenek masada.</p>
<p><b>Hangi karar?</b> 2025’te bu hattı kimden ve nasıl tedarik edeceğiz? Brifin soruları:</p>
<ol>
<li>Bugünkü adetle her seçeneğin yıllık toplam maliyeti ne?</li>
<li>Hangi maliyetler karara girmeli, hangileri girmemeli?</li>
<li>Kendi üretim hangi adetten sonra kâra geçer (başabaş)?</li>
<li>Satış büyürse ya da durursa karar değişir mi?</li>
</ol>
<p>Ne olur parametresinin temeli <b>Finansal raporlama</b> dersinin “Ne olur parametresiyle duyarlılık” bölümünde ve <b>Segmentasyon</b> dersinde var; burada onu bir yatırım kararına bağlıyoruz.</p>

<h2>2. Veri ve model</h2>
<div class="tbl-wrap"><table>
<tr><th>Kaynak</th><th>Kullanım</th></tr>
<tr><td><code>Urunler[BirimMaliyet]</code></td><td>Bugünkü tedarikçiden alış fiyatı. <code>Satislar[Maliyet]</code> = adet × birim maliyet.</td></tr>
<tr><td><code>Satislar</code></td><td>Satılan adet (<code>[Satılan Adet]</code>) ve satılan malın maliyeti (<code>[Net Maliyet]</code>); iptaller hariç.</td></tr>
<tr><td>Teklif tablosu (örnek)</td><td>Seçeneklerin yıllık sabit maliyeti, birim maliyet oranı ve en az sipariş adedi. Ders için uydurulmuştur.</td></tr>
</table></div>
<pre class="dax">Teklifler =
${esc(TEKLIF)}</pre>
<p><code>BirimOran</code>, bugünkü birim maliyete göre çarpandır: yeni tedarikçi her ürünü %12 ucuza veriyor (0,88) ama yıllık 3.000 ₺ sözleşme bedeli istiyor ve yılda en az 250 adet şartı koyuyor. Kendi üretimde birim maliyet (hammadde, ambalaj, enerji) bugünkünün %55’i, ama yıllık 18.000 ₺ sabit gider var. Oran kullanmak, dört ürünün farklı maliyetlerini tek bir kuralla taşımamızı sağlar.</p>
<p><b>Hat bugün:</b> 2024’te 299 adet satıldı, satılan malın maliyeti 39.072 ₺, satış 62.219 ₺. Ortalama birim maliyet 130,68 ₺. 2023’te 143 adet satılmıştı.</p>
<pre class="dax">Hat Satın Alma Maliyeti =
CALCULATE([Net Maliyet], ${esc(HAT)})
Hat Adedi =
CALCULATE([Satılan Adet], ${esc(HAT)})
Hat Birim Maliyeti =
DIVIDE([Hat Satın Alma Maliyeti], [Hat Adedi])</pre>
<p><b>Veri sınırları:</b> Model geçmiş alış fiyatlarını tutmuyor; <code>BirimMaliyet</code> bugünkü fiyattır ve geçmiş yıllara da uygulanır. Ürün karmasının 2025’te 2024’teki gibi kalacağını varsayıyoruz. Teklif rakamları örnektir.</p>

<h2>3. Analiz adımları</h2>
<p><b>Adım 1: Hangi maliyet karara girer?</b> Kendi üretim için ekip şu kalemleri listeledi:</p>
<div class="tbl-wrap"><table>
<tr><th>Kalem (yıllık)</th><th>Tutar</th><th>Tür</th><th>Karara girer mi?</th></tr>
<tr><td>Küçük üretim alanı kirası</td><td>9.600 ₺</td><td>Artımlı</td><td>Evet</td></tr>
<tr><td>Yarı zamanlı teknisyen</td><td>7.200 ₺</td><td>Artımlı</td><td>Evet</td></tr>
<tr><td>Ruhsat ve kalite testleri</td><td>1.200 ₺</td><td>Artımlı</td><td>Evet</td></tr>
<tr><td>Geçen yıl ödenen formül geliştirme</td><td>12.000 ₺</td><td>Batık</td><td>Hayır</td></tr>
<tr><td>Merkez depo kirasından dağıtılan pay</td><td>6.000 ₺</td><td>Dağıtılmış</td><td>Hayır</td></tr>
</table></div>
<ul>
<li><b>Artımlı (incremental) maliyet:</b> yalnızca bu seçeneği seçersek ortaya çıkar. Toplam 18.000 ₺.</li>
<li><b>Batık (sunk) maliyet:</b> çoktan harcandı; hangi seçeneği seçersek seçelim geri gelmez. Karara katılmaz.</li>
<li><b>Dağıtılmış maliyet:</b> depo kirası zaten ödeniyor ve seçenekle değişmez. Muhasebe bunu hatta dağıtabilir ama karar için farksızdır.</li>
</ul>
<p><b>Bulgu:</b> Bütün kalemler karara katılsaydı sabit gider 36.000 ₺ olur ve başabaş adedi 612’ye çıkardı: kendi üretim hiç cazip görünmezdi. Doğru sabit gider 18.000 ₺; başabaş 306 adet. Yanlış sınıflama kararı tek başına değiştirebilir.</p>

<p><b>Adım 2: Bugünkü adetle toplam maliyet.</b> Satış fiyatı üç seçenekte de aynı olduğu için gelir karara girmez; yalnızca maliyeti kıyaslarız. Sabit gider yıllıktır; ölçü aya ya da çeyreğe bakılırken de doğru çalışsın diye sabit gideri aylara yayarız (aylık 1.500 ₺):</p>
<pre class="dax">Kendi Üretim Maliyeti =
VAR Alim = CALCULATE([Net Maliyet], ${esc(HAT)})
VAR Ay = DISTINCTCOUNT(Tarih[YilAy])
RETURN IF(NOT ISBLANK(Alim), 1500 * Ay + 0.55 * Alim)
Üretim Tasarrufu =
CALCULATE([Net Maliyet], ${esc(HAT)}) - [Kendi Üretim Maliyeti]</pre>
<div class="tbl-wrap"><table>
<tr><th>Seçenek (2024, 299 adet)</th><th>Sabit</th><th>Değişken</th><th>Toplam</th><th>Bugüne göre</th></tr>
<tr><td>Mevcut tedarikçi</td><td>0 ₺</td><td>39.072 ₺</td><td>39.072 ₺</td><td>—</td></tr>
<tr><td><b>Yeni tedarikçi</b></td><td>3.000 ₺</td><td>34.383 ₺</td><td><b>37.383 ₺</b></td><td>−1.689 ₺</td></tr>
<tr><td>Kendi üretim</td><td>18.000 ₺</td><td>21.490 ₺</td><td>39.490 ₺</td><td>+418 ₺</td></tr>
</table></div>
<p><b>Bulgu:</b> Bugünkü adetle en ucuz seçenek yeni tedarikçi (yılda 1.689 ₺ tasarruf, %4,3). Kendi üretim 2024’te 418 ₺ pahalıya gelirdi; 2023’ün 143 adedinde ise 9.494 ₺ pahalıya. Üretimin avantajı adet arttıkça büyür.</p>

<p><b>Adım 3: Adet parametresi.</b> Kararın adete ne kadar duyarlı olduğunu görmek için Power BI’da <b>Modelleme → Yeni parametre → Sayısal aralık (Numeric range)</b> ile bir parametre kurulur. Arka planda bu bir <code>GENERATESERIES</code> tablosu ve bir <code>SELECTEDVALUE</code> ölçüsüdür:</p>
<pre class="dax" data-notry>Yıllık Adet = GENERATESERIES(0, 800, 25)
Seçili Adet = SELECTEDVALUE('Yıllık Adet'[Value], 299)
Senaryo Kendi Üretim =
18000 + 0.55 * [Seçili Adet] * [Hat Birim Maliyeti]
Senaryo Yeni Tedarikçi =
IF([Seçili Adet] &gt;= 250, 3000 + 0.88 * [Seçili Adet] * [Hat Birim Maliyeti])</pre>
<p>Kullanıcı kaydırıcıyla adedi değiştirdikçe kartlar ve çizgi grafiği güncellenir. Parametre tablosu modelde hiçbir tabloyla ilişkili değildir (bağlantısız tablo). Aynı eğriyi sorguyla da üretebiliriz:</p>
<pre class="dax">EVALUATE
VAR Birim = CALCULATE(DIVIDE([Net Maliyet], [Satılan Adet]), Tarih[Yil] = 2024, ${esc(HAT)})
RETURN
    ADDCOLUMNS(
        GENERATESERIES(150, 450, 50),
        "Mevcut", [Value] * Birim,
        "Yeni", IF([Value] &gt;= 250, 3000 + 0.88 * [Value] * Birim),
        "Kendi", 18000 + 0.55 * [Value] * Birim,
        "En ucuz",
            VAR M = [Value] * Birim
            VAR Y = IF([Value] &gt;= 250, 3000 + 0.88 * [Value] * Birim, M)
            VAR K = 18000 + 0.55 * [Value] * Birim
            RETURN SWITCH(TRUE(), K &lt;= MIN(M, Y), "Kendi üretim", Y &lt; M, "Yeni tedarikçi", "Mevcut tedarikçi")
    )</pre>
<p><b>Bulgu:</b> 150 ve 200 adette mevcut tedarikçi en ucuz (yeni tedarikçi 250 adet şartı yüzünden seçilemez). 250 ve 300 adette yeni tedarikçi, 350 adetten itibaren kendi üretim önde. 450 adette kendi üretim mevcut tedarikçiye göre 8.462 ₺ daha ucuz.</p>

<p><b>Adım 4: Başabaş adedi.</b> İki seçeneğin maliyeti eşit olduğunda: sabit gider farkı = adet × birim maliyet farkı. Buradan adet = sabit gider farkı ÷ (birim oran farkı × birim maliyet).</p>
<pre class="dax">Başabaş Adedi (Üret / Mevcut) =
VAR Birim =
    DIVIDE(
        CALCULATE([Net Maliyet], ${esc(HAT)}),
        CALCULATE([Satılan Adet], ${esc(HAT)})
    )
RETURN DIVIDE(18000, (1 - 0.55) * Birim)</pre>
<div class="tbl-wrap"><table>
<tr><th>Karşılaştırma</th><th>Sabit fark</th><th>Birim fark</th><th>Başabaş</th></tr>
<tr><td>Yeni tedarikçi ↔ Mevcut</td><td>3.000 ₺</td><td>0,12 × 130,68 ₺</td><td>192 adet (ama en az 250 şartı var)</td></tr>
<tr><td>Kendi üretim ↔ Mevcut</td><td>18.000 ₺</td><td>0,45 × 130,68 ₺</td><td><b>307 adet</b></td></tr>
<tr><td>Kendi üretim ↔ Yeni tedarikçi</td><td>15.000 ₺</td><td>0,33 × 130,68 ₺</td><td><b>348 adet</b></td></tr>
</table></div>
<p><b>Bulgu:</b> Asıl rakip yeni tedarikçi olduğu için kendi üretimin geçmesi gereken eşik 348 adet. 2024’ün 299 adedi bunun %14 altında. Başabaş adedi ürün karmasına da bağlı: ortalama birim maliyet 2023’te 132,19 ₺ olduğu için o yılın karmasıyla eşik 303 adet olurdu. Ucuz ürünlerin (Dudak Balmı, Şampuan) payı arttıkça birim maliyet düşer ve eşik yükselir.</p>

<p><b>Adım 5: Senaryolar.</b> Üç 2025 senaryosunu teklif tablosuyla çaprazlarız. <code>GENERATE</code>, her senaryo satırını her seçenekle eşleştirir:</p>
<pre class="dax">EVALUATE
VAR Teklifler = ${esc(TEKLIF).replace(/\n/g, '\n    ')}
VAR Birim = CALCULATE(DIVIDE([Net Maliyet], [Satılan Adet]), Tarih[Yil] = 2024, ${esc(HAT)})
VAR Senaryolar =
    DATATABLE("Senaryo", STRING, "Adet", INTEGER,
        {{"Durgun", 299}, {"Temel (+%25)", 374}, {"İyimser (+%50)", 449}})
RETURN
    ADDCOLUMNS(
        GENERATE(Senaryolar, Teklifler),
        "Uygun", IF([Adet] &gt;= [MinAdet], "Evet", "Hayır"),
        "Toplam Maliyet", [YillikSabit] + [BirimOran] * [Adet] * Birim
    )</pre>
<div class="tbl-wrap"><table>
<tr><th>Senaryo (adet)</th><th>Mevcut</th><th>Yeni tedarikçi</th><th>Kendi üretim</th><th>En ucuz</th></tr>
<tr><td>Durgun (299)</td><td>39.072 ₺</td><td><b>37.383 ₺</b></td><td>39.490 ₺</td><td>Yeni tedarikçi</td></tr>
<tr><td>Temel, +%25 (374)</td><td>48.873 ₺</td><td>46.008 ₺</td><td><b>44.880 ₺</b></td><td>Kendi üretim (1.128 ₺ farkla)</td></tr>
<tr><td>İyimser, +%50 (449)</td><td>58.673 ₺</td><td>54.633 ₺</td><td><b>50.270 ₺</b></td><td>Kendi üretim (4.362 ₺ farkla)</td></tr>
</table></div>
<p><b>Bulgu:</b> Karar büyümeye bağlı. Satış yerinde sayarsa yeni tedarikçi, %25 ya da daha fazla büyürse kendi üretim kazanıyor. Hat 2024’te iki katından fazla büyüdü (143’ten 299’a); ama bu hızın sürmesi garanti değil.</p>

<h2>4. Rapor sayfası taslağı</h2>
<div class="tbl-wrap"><table>
<tr><th>Konum</th><th>Görsel</th><th>Alanlar</th></tr>
<tr><td>Sol üst</td><td>Dilimleyici (parametre)</td><td>Yıllık Adet kaydırıcısı (varsayılan 299)</td></tr>
<tr><td>Üst şerit</td><td>3 kart</td><td>Senaryo maliyeti: Mevcut, Yeni tedarikçi, Kendi üretim; en ucuz seçenek koşullu renkte</td></tr>
<tr><td>Orta</td><td>Çizgi grafik</td><td>X: Yıllık Adet; üç maliyet çizgisi; 307 ve 348’de sabit çizgiler; bugünkü adet (299) işaretli</td></tr>
<tr><td>Sağ</td><td>Tablo</td><td>Senaryo × seçenek toplam maliyeti, Uygun sütunu</td></tr>
<tr><td>Alt</td><td>Metin kutusu</td><td>Varsayımlar listesi (aşağıda) ve kaynakları</td></tr>
</table></div>

<h2>5. Bulgu özeti ve öneri</h2>
<ol>
<li><b>2025 için öneri:</b> yeni tedarikçiyle bir yıllık sözleşme. Bugünkü adetle yılda 1.689 ₺ tasarruf; 250 adet şartı 2024 adediyle (299) karşılanıyor.</li>
<li><b>Kendi üretimi tetikleyiciye bağla:</b> son 12 ayın adedi 348’i geçerse (temel senaryo 374) kendi üretim yeni tedarikçiden ucuza gelir. Raporda bu eşiği izleyen bir kart olsun.</li>
<li><b>Batık ve dağıtılmış maliyeti karara katma:</b> katılsaydı başabaş 612 adet görünür ve doğru seçenek haksız yere elenirdi.</li>
<li><b>Varsayımları kararın yanına yaz:</b> (a) ürün karması 2024 gibi kalır; (b) satış fiyatı seçenekten bağımsız; (c) teklif rakamları örnektir ve bir yıl sabit; (d) kalite, kapasite ve teslim riski bu hesapta yok. Bu dört varsayımdan biri değişirse hesabı parametreyle yeniden yap.</li>
<li><b>Sayısal olmayan riskler:</b> kendi üretimde ruhsat süresi ve kalite sorumluluğu şirkete geçer; yeni tedarikçide tek kaynağa bağımlılık artar. Karar sunumunda bunları ayrı bir satırda göster.</li>
</ol>
`,
  ex: [
    { t:'dax', name:'Bakım Hattı Maliyeti', q:'<b>Bakım Hattı Maliyeti</b>: <code>[Net Maliyet]</code> ölçüsünü yalnızca dört üründe (Nemlendirici Krem, Güneş Kremi SPF50, Şampuan, Dudak Balmı) hesapla.',
      sol:'CALCULATE([Net Maliyet], ' + HAT + ')',
      hint:'CALCULATE([Net Maliyet], Urunler[Urun] IN {"Nemlendirici Krem", "Güneş Kremi SPF50", "Şampuan", "Dudak Balmı"}).' },
    { t:'dax', name:'Kendi Üretim Toplamı', q:'<b>Kendi Üretim Toplamı</b>: hattın alış maliyetinin %55’ine, dönemdeki ay sayısı (<code>DISTINCTCOUNT(Tarih[YilAy])</code>) × 1.500 ₺ sabit gideri ekle. Hatta maliyet yoksa BLANK döndür.',
      sol:'VAR Alim = CALCULATE([Net Maliyet], ' + HAT + ')\nVAR Ay = DISTINCTCOUNT(Tarih[YilAy])\nRETURN IF(NOT ISBLANK(Alim), 1500 * Ay + 0.55 * Alim)',
      hint:'Alım maliyetini ve ay sayısını iki VAR’a al; IF(NOT ISBLANK(Alim), 1500 * Ay + 0.55 * Alim).',
      grid:[{t:'Tarih',c:'Yil'}, {t:'Tarih',c:'Ceyrek'}] },
    { t:'dax', name:'Üretim Başabaş Adedi', q:'<b>Üretim Başabaş Adedi</b>: hattın birim maliyetini (alış maliyeti ÷ satılan adet) bul; 18.000 ₺ yıllık sabit gideri, birim başına tasarrufa (birim maliyetin %45’i) böl.',
      sol:'VAR Birim = DIVIDE(CALCULATE([Net Maliyet], ' + HAT + '), CALCULATE([Satılan Adet], ' + HAT + '))\nRETURN DIVIDE(18000, 0.45 * Birim)',
      hint:'Birim = DIVIDE(hat maliyeti, hat adedi). Sonra DIVIDE(18000, 0.45 * Birim).',
      grid:[{t:'Tarih',c:'Yil'}] },
    { t:'query', q:'Başlangıç kodundaki teklif tablosu için 2024 hat adedinde (299) her seçeneğin <code>"Toplam Maliyet"</code> değerini (yıllık sabit + birim oran × 2024 hat alış maliyeti) döndür. Sütunlar: <code>Secenek</code> ve <code>"Toplam Maliyet"</code>.',
      start:'EVALUATE\nVAR Teklifler = ' + TEKLIF + '\nRETURN\n',
      sol:'EVALUATE\nVAR Teklifler = ' + TEKLIF + '\nVAR Alim = CALCULATE([Net Maliyet], Tarih[Yil] = 2024, ' + HAT + ')\nRETURN\n    SELECTCOLUMNS(Teklifler, "Secenek", [Secenek], "Toplam Maliyet", [YillikSabit] + [BirimOran] * Alim)',
      hint:'2024 hat alış maliyetini bir VAR’a al: CALCULATE([Net Maliyet], Tarih[Yil] = 2024, Urunler[Urun] IN {…}). Sonra SELECTCOLUMNS(Teklifler, "Secenek", [Secenek], "Toplam Maliyet", [YillikSabit] + [BirimOran] * Alim).' },
    { t:'mc', q:'Geçen yıl formül geliştirmeye 12.000 ₺ ödendi. Ekip “bu parayı çıkarmak için kendi üretime geçmeliyiz” diyor. Doğru yaklaşım hangisi?',
      o:['Para harcandı; karara girmez','12.000 ₺’yi sabit gidere ekleyip yeniden hesapla','Harcamayı beş yıla bölüp yıllık 2.400 ₺ ekle','Kendi üretimi seç, aksi halde para boşa gider'], a:0,
      why:'Batık maliyet hangi seçenek seçilirse seçilsin geri gelmez; seçenekler arasında fark yaratmaz. Karara yalnızca seçeneğe göre değişen (artımlı) maliyetler girer.' },
    { t:'mc', q:'Yönetime kararı sunarken hangi cümle en sağlıklıdır?',
      o:['Kendi üretim her durumda en ucuz seçenek','Hesap kesin; varsayım yazmaya gerek yok','Bugün yeni tedarikçi; 348 adedi geçince kendi üretim','En yüksek tasarrufu gösteren iyimser senaryoyu sun'], a:2,
      why:'Sonuç adede bağlı: 299 adette yeni tedarikçi, 348’in üstünde kendi üretim ucuz. Kararı eşik ve varsayımlarla birlikte söylemek, durum değişince neyin yeniden hesaplanacağını da gösterir.' }
  ]
});

/* ---------- Vaka 9: Kredi portföyü ve geri ödeme planı (C1) ---------- */
add('finans', {
  id: 'vaka-kredi', lv: 'C1', mod: 'Vaka Çalışmaları', min: 32,
  title: 'Vaka: kredi portföyü ve geri ödeme planı',
  sum: 'Bir finansman şirketinin risk yöneticisi on kredilik portföyün durumunu soruyor. Her kredi için PMT ve GENERATESERIES ile aylık geri ödeme planı kurar, taksiti faiz ve anaparaya ayırır, rapor tarihindeki kalan bakiyeyi, segmentlere göre gecikme oranını, sözleşme ve riskten arındırılmış portföy getirisini hesaplar ve kredi düzeyinde bir detay sayfası tasarlarsın.',
  body: `
<h2>1. Şirketin sorusu ve brif</h2>
<p><b>Kim soruyor?</b> Küçük bir finansman şirketinin risk yöneticisi. Kurul toplantısından önce portföyün 31.12.2024 itibarıyla fotoğrafını istiyor.</p>
<p><b>Hangi karar?</b> 2025’te hangi segmentte yeni kredi verilmeye devam edilecek, hangisinde koşullar sıkılaştırılacak? Brifin soruları:</p>
<ol>
<li>Her kredinin aylık taksiti ne, taksitin ne kadarı faiz, ne kadarı anapara?</li>
<li>Rapor tarihinde portföyde ne kadar bakiye var?</li>
<li>Gecikme ve takip (30+ ve 90+ gün) bakiyenin yüzde kaçı; segmentlere göre fark var mı?</li>
<li>Portföy ne getiriyor? Riskli krediler hesaba katılınca getiri ne olur?</li>
<li>Bir krediye tıklayınca açılan, o kredinin ödeme planını gösteren bir detay sayfası.</li>
</ol>
<p>Paranın zaman değeri ve <code>PMT</code> fonksiyonunun mantığı <b>Finansal raporlama: gelir tablosu, bütçe sapması, oranlar ve finansal fonksiyonlar</b> dersinde anlatıldı; burada tekrar etmiyoruz, onu bir portföye uyguluyoruz.</p>
<div class="warn"><b>Bu vakadaki krediler örnektir</b>Uygulamanın modelinde kredi verisi yok. Aşağıdaki on kredi <b>ders için uydurulmuştur</b>; gerçek kişi, şirket ya da kurumla ilgisi yoktur.</div>

<h2>2. Veri ve model</h2>
<pre class="dax">Krediler =
${esc(KREDI)}</pre>
<div class="tbl-wrap"><table>
<tr><th>Sütun</th><th>Anlamı</th></tr>
<tr><td><code>Tutar</code>, <code>YillikFaiz</code>, <code>Vade</code></td><td>Kullandırılan anapara, yıllık sözleşme faizi, ay cinsinden vade. Eşit taksitli (anüite) kredi.</td></tr>
<tr><td><code>Baslangic</code></td><td>Kullandırım tarihi; ilk taksit bir ay sonra.</td></tr>
<tr><td><code>GecikmeGun</code></td><td>Rapor tarihinde en eski ödenmemiş taksitin gecikme günü. 30+ “gecikmede”, 90+ “takipte”.</td></tr>
</table></div>
<p>Modelde ikinci tablo <b>ödeme planıdır</b>: her kredi için her ay bir satır. Krediler ile ödeme planı arasında bire-çok ilişki kurulur (<code>KrediNo</code>), plandaki ödeme tarihi de tarih tablosuna bağlanır.</p>
<p><b>Veri sınırları:</b></p>
<ul>
<li><b>Sözleşme bakiyesi:</b> bakiyeyi ödeme planına göre hesaplıyoruz, yani her taksitin zamanında ödendiğini varsayıyoruz. Gecikmedeki kredilerde gerçek bakiye daha yüksektir (ödenmeyen taksitler ve gecikme faizi). Gerçek işte tahsilat tablosu ayrıca gelir.</li>
<li><b>Tarih tablosu kısa:</b> uygulamanın <code>Tarih</code> tablosu 31.12.2024’te bitiyor; portföyün son taksiti ise Eylül 2026’da. 222 taksitin 123’ü 2024’ten sonra. Modelde ödeme planını tarih tablosuna bağlayacaksan tarih tablosunu vadelerin sonuna kadar uzat.</li>
</ul>

<h2>3. Analiz adımları</h2>
<p><b>Adım 1: Ödeme planı (amortisman tablosu).</b> Aylık faiz i = yıllık faiz ÷ 12, taksit A = <code>PMT(i, Vade, -Tutar)</code>. k. taksitten sonra kalan bakiye için kapalı formül: B<sub>k</sub> = P·(1+i)<sup>k</sup> − A·((1+i)<sup>k</sup> − 1) ÷ i. k. taksitin faizi bir önceki bakiyenin faizidir: B<sub>k−1</sub> × i; anapara = A − faiz. <code>GENERATE</code> her kredi satırı için <code>GENERATESERIES(1, Vade)</code> ile taksit satırlarını üretir:</p>
<pre class="dax" data-notry>Ödeme Planı =
${esc(PLAN)}</pre>
<p>Uygulamanın motorunda <code>Krediler</code> modelde olmadığı için aynı tabloyu sorguda değişkenle deneriz. Önce tek bir kredi (K03):</p>
<pre class="dax">EVALUATE
VAR Krediler =
    DATATABLE(
        "KrediNo", STRING, "Tutar", CURRENCY, "YillikFaiz", DOUBLE, "Vade", INTEGER, "Baslangic", DATETIME,
        {{"K03", 120000, 0.48, 36, "2023-09-01"}}
    )
VAR Plan = ${esc(PLAN).replace(/\n/g, '\n    ')}
RETURN
    SELECTCOLUMNS(
        FILTER(Plan, [TaksitNo] &lt;= 2 || [TaksitNo] = 15 || [TaksitNo] = 36),
        "Taksit No", [TaksitNo], "Tarih", [OdemeTarihi], "Taksit", [Taksit],
        "Faiz", [Faiz], "Anapara", [Taksit] - [Faiz], "Kalan", [Kalan]
    )</pre>
<div class="tbl-wrap"><table>
<tr><th>K03 taksit</th><th>Tarih</th><th>Taksit</th><th>Faiz</th><th>Anapara</th><th>Kalan bakiye</th></tr>
<tr><td>1</td><td>01.10.2023</td><td>6.346,43 ₺</td><td>4.800,00 ₺</td><td>1.546,43 ₺</td><td>118.453,57 ₺</td></tr>
<tr><td>2</td><td>01.11.2023</td><td>6.346,43 ₺</td><td>4.738,14 ₺</td><td>1.608,28 ₺</td><td>116.845,29 ₺</td></tr>
<tr><td>15</td><td>01.12.2024</td><td>6.346,43 ₺</td><td>3.668,52 ₺</td><td>2.677,91 ₺</td><td>89.035,02 ₺</td></tr>
<tr><td>36</td><td>01.09.2026</td><td>6.346,43 ₺</td><td>244,09 ₺</td><td>6.102,33 ₺</td><td>0,00 ₺</td></tr>
</table></div>
<p><b>Bulgu:</b> Taksit sabit, içeriği değişiyor. K03’ün ilk taksitinin %76’sı faiz; son taksitin %96’sı anapara. Kredi boyunca toplam 228.471 ₺ ödenecek; bunun 108.471 ₺’si faiz. Son satırda kalan bakiyenin tam 0 çıkması planın doğru kurulduğunun testidir; bu kontrolü her kredi için yap.</p>

<p><b>Adım 2: Rapor tarihinde kalan bakiye ve 2024 faiz geliri.</b> Her kredi için rapor tarihine kadar vadesi gelen taksitleri sayar, son taksitten sonraki bakiyeyi alırız. Henüz taksiti gelmemiş kredinin bakiyesi tutarın kendisidir.</p>
<pre class="dax">${esc(KDEF)}EVALUATE
${esc(OZET)}</pre>
<div class="tbl-wrap"><table>
<tr><th>Kredi</th><th>Segment</th><th>Tutar</th><th>Durum</th><th>Ödenen taksit</th><th>Kalan bakiye</th><th>2024 faiz</th></tr>
<tr><td>K01</td><td>KOBİ</td><td>400.000 ₺</td><td>Düzenli</td><td>11 / 24</td><td>256.632 ₺</td><td>130.633 ₺</td></tr>
<tr><td>K02</td><td>KOBİ</td><td>250.000 ₺</td><td>Gecikmede (45)</td><td>6 / 12</td><td>138.749 ₺</td><td>46.268 ₺</td></tr>
<tr><td>K03</td><td>Bireysel</td><td>120.000 ₺</td><td>Düzenli</td><td>15 / 36</td><td>89.035 ₺</td><td>50.019 ₺</td></tr>
<tr><td>K04</td><td>Bireysel</td><td>80.000 ₺</td><td>Takipte (120)</td><td>9 / 24</td><td>58.652 ₺</td><td>26.683 ₺</td></tr>
<tr><td>K05</td><td>Kurumsal</td><td>1.000.000 ₺</td><td>Düzenli</td><td>20 / 36</td><td>582.299 ₺</td><td>282.409 ₺</td></tr>
<tr><td>K06</td><td>Kurumsal</td><td>600.000 ₺</td><td>Düzenli</td><td>3 / 24</td><td>548.172 ₺</td><td>58.310 ₺</td></tr>
<tr><td>K07</td><td>KOBİ</td><td>300.000 ₺</td><td>Düzenli</td><td>12 / 18</td><td>122.209 ₺</td><td>98.934 ₺</td></tr>
<tr><td>K08</td><td>Bireysel</td><td>60.000 ₺</td><td>Gecikmede (35)</td><td>10 / 12</td><td>12.234 ₺</td><td>17.408 ₺</td></tr>
<tr><td>K09</td><td>KOBİ</td><td>150.000 ₺</td><td>Takipte (95)</td><td>8 / 24</td><td>114.086 ₺</td><td>41.453 ₺</td></tr>
<tr><td>K10</td><td>Kurumsal</td><td>450.000 ₺</td><td>Düzenli</td><td>5 / 12</td><td>283.204 ₺</td><td>62.630 ₺</td></tr>
</table></div>
<p><b>Bulgu:</b> 3.410.000 ₺ kullandırılmış, rapor tarihinde 2.205.272 ₺ bakiye var. 2024’te vadesi gelen taksitlerin faiz kısmı 814.747 ₺, anapara kısmı 1.063.190 ₺: tahsil edilmesi gerekenin %43’ü faiz. 2025’te planlanan tahsilat 2.189.223 ₺; bunun 350.646 ₺’si (%16) 30 gün ve üstü gecikmedeki kredilerden.</p>

<p><b>Adım 3: Segmentlere göre risk ve getiri.</b> Gecikme oranını kredi sayısıyla değil <b>bakiyeyle</b> ölçeriz: küçük bir kredinin gecikmesi büyük bir kredininkiyle aynı ağırlığı taşımamalı. Getiri için iki ölçü: <b>sözleşme getirisi</b> (bakiye ağırlıklı faiz) ve takipteki kredileri getirisiz sayan <b>riskten arındırılmış getiri</b>.</p>
<pre class="dax">${esc(KDEF2)}EVALUATE
ADDCOLUMNS(
    DISTINCT(SELECTCOLUMNS(Krediler, "Segment", [Segment])),
    "Bakiye", VAR s = [Segment] RETURN SUMX(FILTER(Ozet, [Segment] = s), [Bakiye]),
    "Gecikme 30+ %", VAR s = [Segment]
        RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s &amp;&amp; [GecikmeGun] &gt;= 30), [Bakiye]), SUMX(FILTER(Ozet, [Segment] = s), [Bakiye])) + 0,
    "Takip 90+ %", VAR s = [Segment]
        RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s &amp;&amp; [GecikmeGun] &gt;= 90), [Bakiye]), SUMX(FILTER(Ozet, [Segment] = s), [Bakiye])) + 0,
    "Sözleşme Getirisi", VAR s = [Segment]
        RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s), [Bakiye] * [YillikFaiz]), SUMX(FILTER(Ozet, [Segment] = s), [Bakiye])),
    "Riskten Arındırılmış", VAR s = [Segment]
        RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s &amp;&amp; [GecikmeGun] &lt; 90), [Bakiye] * [YillikFaiz]), SUMX(FILTER(Ozet, [Segment] = s), [Bakiye]))
)</pre>
<div class="tbl-wrap"><table>
<tr><th>Segment</th><th>Kredi</th><th>Bakiye (pay)</th><th>Gecikme 30+</th><th>Takip 90+</th><th>Sözleşme getirisi</th><th>Riskten arındırılmış</th></tr>
<tr><td>Kurumsal</td><td>3</td><td>1.413.675 ₺ (%64,1)</td><td>%0</td><td>%0</td><td>%39,0</td><td><b>%39,0</b></td></tr>
<tr><td>KOBİ</td><td>4</td><td>631.677 ₺ (%28,6)</td><td>%40,0</td><td>%18,1</td><td>%43,8</td><td>%35,5</td></tr>
<tr><td>Bireysel</td><td>3</td><td>159.921 ₺ (%7,3)</td><td><b>%44,3</b></td><td><b>%36,7</b></td><td><b>%49,0</b></td><td>%30,7</td></tr>
<tr><td><b>Portföy</b></td><td>10</td><td>2.205.272 ₺</td><td>%14,7</td><td>%7,8</td><td>%41,1</td><td>%37,4</td></tr>
</table></div>
<p><b>Bulgu:</b> Kâğıt üzerinde en kârlı segment Bireysel (%49,0), ama takipteki K04 hesaba katılınca getirisi %30,7’ye iniyor ve en düşük segment oluyor. Kurumsal hiç gecikme olmadan %39,0 getiriyor. Yüksek faiz riskin bedelidir; risk gerçekleşince getiri kaybolur. Portföy düzeyinde takip oranı %7,8 ve bu bakiye 2024 faizinin 68.136 ₺’sini oluşturuyor; bu faiz büyük olasılıkla tahsil edilemeyecek.</p>
<div class="note"><b>Neden 10 kredi az?</b>Gerçek bir portföyde binlerce kredi olur ve oranlar daha durağandır. Burada tek bir kredi (K04) Bireysel segmentin takip oranını %36,7’ye çıkarıyor. Küçük segmentlerde kredi sayısını tablonun yanında göster; <b>Vaka: şehir ve temsilci kıyaslaması</b>’ndaki örnek büyüklüğü uyarısı burada da geçerli.</div>

<p><b>Adım 4: Model ölçüleri ve kredi detay sayfası.</b> Gerçek modelde <code>Krediler</code> ve <code>Ödeme Planı</code> iki tablodur; ölçüler ilişki üzerinden çalışır. Kalan bakiye yarı toplanabilir bir değerdir: krediler üzerinden toplanır ama aylar üzerinden toplanmaz (<b>Yarı toplanabilir ölçüler: stok, bakiye, nüfus</b>).</p>
<pre class="dax" data-notry>Kalan Bakiye =
VAR Rapor = MAX(Tarih[Tarih])
RETURN
    SUMX(
        VALUES(Krediler[KrediNo]),
        VAR Son = CALCULATE(MIN('Ödeme Planı'[Kalan]), REMOVEFILTERS(Tarih), 'Ödeme Planı'[OdemeTarihi] &lt;= Rapor)
        RETURN IF(ISBLANK(Son), CALCULATE(SUM(Krediler[Tutar])), Son)
    )
Gecikme 30+ % =
DIVIDE(CALCULATE([Kalan Bakiye], Krediler[GecikmeGun] &gt;= 30), [Kalan Bakiye])
Kredi Başlığı =
VAR No = SELECTEDVALUE(Krediler[KrediNo])
VAR Gun = SELECTEDVALUE(Krediler[GecikmeGun])
VAR Durum = SWITCH(TRUE(), Gun &gt;= 90, "Takipte", Gun &gt;= 30, "Gecikmede", "Düzenli")
RETURN
    IF(
        ISBLANK(No), "Bir kredi seçin",
        No &amp; " · " &amp; SELECTEDVALUE(Krediler[Segment]) &amp; " · " &amp; FORMAT(SELECTEDVALUE(Krediler[Tutar]), "#,##0") &amp; " ₺ · yıllık %"
            &amp; FORMAT(SELECTEDVALUE(Krediler[YillikFaiz]) * 100, "0") &amp; " · " &amp; Durum &amp; IF(Gun &gt; 0, " (" &amp; Gun &amp; " gün)")
    )</pre>
<p>Portföy sayfasındaki kredi tablosunda bir satıra sağ tıklayıp <b>Detaya git</b> denince <b>Kredi detayı</b> sayfası açılır; detay alanı <code>Krediler[KrediNo]</code>. K04 için başlık “K04 · Bireysel · 80.000 ₺ · yıllık %50 · Takipte (120 gün)” olur. Sayfada ödeme planı tablosu (taksit no, tarih, faiz, anapara, kalan), faiz ve anaparayı yığılmış sütunla gösteren grafik ve rapor tarihini işaretleyen bir sabit çizgi bulunur.</p>

<h2>4. Rapor sayfası taslağı</h2>
<div class="tbl-wrap"><table>
<tr><th>Sayfa / konum</th><th>Görsel</th><th>Alanlar</th></tr>
<tr><td>Portföy, üst şerit</td><td>4 kart</td><td>Kalan bakiye (2.205.272 ₺), Gecikme 30+ % (%14,7), Takip 90+ % (%7,8), Riskten arındırılmış getiri (%37,4)</td></tr>
<tr><td>Portföy, sol</td><td>Kümelenmiş çubuk</td><td>Segment; Sözleşme getirisi ve riskten arındırılmış getiri yan yana</td></tr>
<tr><td>Portföy, sağ</td><td>Yığılmış sütun</td><td>2025 ayları; planlanan tahsilat, Durum’a göre renkli (Düzenli / Gecikmede / Takipte)</td></tr>
<tr><td>Portföy, alt</td><td>Tablo</td><td>Kredi; Segment, Tutar, Ödenen taksit, Kalan bakiye, Durum (koşullu ikon)</td></tr>
<tr><td>Kredi detayı</td><td>Detay sayfası</td><td>Başlık: Kredi Başlığı; ödeme planı tablosu; faiz/anapara yığılmış sütunu; “Geri” düğmesi</td></tr>
</table></div>

<h2>5. Bulgu özeti ve öneri</h2>
<ol>
<li><b>Portföyün %14,7’si 30 gün ve üstü gecikmede, %7,8’i takipte.</b> Takipteki iki kredi (K04, K09) için yapılandırma ya da hukuki takip kararı ve karşılık ayrılması gerekiyor.</li>
<li><b>Bireysel segmentte koşulları sıkılaştır:</b> en yüksek sözleşme faizine (%49,0) rağmen riskten arındırılmış getiri en düşük (%30,7). Faizi artırmak yerine kredi onay kriterlerini gözden geçir.</li>
<li><b>Kurumsal segment portföyün bel kemiği:</b> bakiyenin %64,1’i, gecikme yok, getiri %39,0. Büyüme bu segmentte daha güvenli; ama tek bir kredinin (K05) bakiyenin %26’sı olduğu yoğunlaşma riski not edilmeli.</li>
<li><b>2025 nakit planını riske göre ayır:</b> planlanan 2.189.223 ₺ tahsilatın 350.646 ₺’si gecikmedeki kredilerden; nakit planında bu kısmı ayrı satırda ve iskontolu göster.</li>
<li><b>Modeli tamamla:</b> gerçek tahsilat tablosu ve vadelerin sonuna kadar uzanan tarih tablosu olmadan bakiye sözleşme varsayımına dayanır.</li>
</ol>
`,
  ex: [
    { t:'query', q:'Her kredi için <code>KrediNo</code>, aylık <code>"Taksit"</code> (PMT ile, pozitif) ve kredi boyunca ödenecek <code>"Toplam Faiz"</code> (taksit × vade − tutar) sütunlarını döndür.',
      start:'DEFINE\nVAR Krediler = ' + KREDI + '\nEVALUATE\n',
      sol:'DEFINE\nVAR Krediler = ' + KREDI + '\nEVALUATE\nSELECTCOLUMNS(\n    Krediler,\n    "KrediNo", [KrediNo],\n    "Taksit", PMT([YillikFaiz] / 12, [Vade], -[Tutar]),\n    "Toplam Faiz", PMT([YillikFaiz] / 12, [Vade], -[Tutar]) * [Vade] - [Tutar]\n)',
      hint:'Aylık oran [YillikFaiz] / 12. PMT(oran, [Vade], -[Tutar]) pozitif taksit verir. SELECTCOLUMNS(Krediler, "KrediNo", [KrediNo], "Taksit", …, "Toplam Faiz", … * [Vade] - [Tutar]).' },
    { t:'query', q:'Ödeme planından K06 kredisinin 2025’te vadesi gelen taksitlerini döndür. Sütunlar: <code>"TaksitNo"</code>, <code>"Faiz"</code> ve <code>"Anapara"</code> (taksit − faiz).',
      start: KDEF + 'EVALUATE\n',
      sol: KDEF + 'EVALUATE\nSELECTCOLUMNS(\n    FILTER(Plan, [KrediNo] = "K06" && YEAR([OdemeTarihi]) = 2025),\n    "TaksitNo", [TaksitNo],\n    "Faiz", [Faiz],\n    "Anapara", [Taksit] - [Faiz]\n)',
      hint:'FILTER(Plan, [KrediNo] = "K06" && YEAR([OdemeTarihi]) = 2025) ile satırları seç, SELECTCOLUMNS ile üç sütunu üret.' },
    { t:'query', q:'Rapor tarihinde (31.12.2024) her kredinin kalan bakiyesi: <code>"KrediNo"</code> ve <code>"Bakiye"</code>. Vadesi gelen taksit yoksa bakiye kredinin tutarıdır; varsa vadesi gelen son taksitten sonraki <code>[Kalan]</code>.',
      start: KDEF + 'EVALUATE\n',
      sol: KDEF + 'EVALUATE\nSELECTCOLUMNS(\n    Krediler,\n    "KrediNo", [KrediNo],\n    "Bakiye",\n        VAR k = [KrediNo]\n        VAR t = [Tutar]\n        VAR p = FILTER(Plan, [KrediNo] = k && [OdemeTarihi] <= Rapor)\n        RETURN IF(ISEMPTY(p), t, MINX(p, [Kalan]))\n)',
      hint:'Kredinin numarasını ve tutarını VAR’a al. p = FILTER(Plan, [KrediNo] = k && [OdemeTarihi] <= Rapor). Bakiye azaldığı için son taksitin kalanı MINX(p, [Kalan]); p boşsa tutar.' },
    { t:'query', q:'Segment başına <code>"Segment"</code>, <code>"Bakiye"</code> ve 30 gün ve üstü gecikmedeki bakiyenin paya oranı <code>"Gecikme 30+ %"</code> (gecikmesiz segmentte 0) döndür. <code>Ozet</code> tablosu başlangıç kodunda hazır.',
      start: KDEF2 + 'EVALUATE\n',
      sol: KDEF2 + 'EVALUATE\nADDCOLUMNS(\n    DISTINCT(SELECTCOLUMNS(Krediler, "Segment", [Segment])),\n    "Bakiye", VAR s = [Segment] RETURN SUMX(FILTER(Ozet, [Segment] = s), [Bakiye]),\n    "Gecikme 30+ %", VAR s = [Segment]\n        RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s && [GecikmeGun] >= 30), [Bakiye]), SUMX(FILTER(Ozet, [Segment] = s), [Bakiye])) + 0\n)',
      hint:'Segment listesi: DISTINCT(SELECTCOLUMNS(Krediler, "Segment", [Segment])). Her satırda segmenti VAR s’ye al; bakiyeyi SUMX(FILTER(Ozet, [Segment] = s), [Bakiye]) ile, gecikmeli bakiyeyi ek koşulla topla ve böl; + 0 boşu sıfıra çevirir.' },
    { t:'mc', q:'Bireysel segmentin sözleşme faizi en yüksek (%49,0), riskten arındırılmış getirisi en düşük (%30,7). Bu farkı en iyi ne açıklar?',
      o:['Takipteki kredi getiri üretmiyor','Bireysel kredilerin vadesi daha kısa','PMT bireysel kredide yanlış çalışıyor','Kurumsal kredilerin faizi daha yüksek'], a:0,
      why:'Riskten arındırılmış getiride takipteki (90+ gün) kredilerin faizi sıfır sayılır. K04 Bireysel bakiyenin %36,7’si olduğu için segmentin getirisi sert düşer. Yüksek faiz risk primidir; risk gerçekleşince kaybolur.' },
    { t:'mc', q:'Gecikme oranını neden kredi sayısıyla değil bakiyeyle hesaplıyoruz?',
      o:['Kredi sayısı DAX’ta hesaplanamaz','Bakiye her zaman daha düşük sonuç verir','Kayıp riski bakiyenin büyüklüğüne bağlı','Düzenleyici kurum kredi sayısını yasaklar'], a:2,
      why:'Şirketin riske attığı para kalan bakiyedir. 12.234 ₺ bakiyeli bir kredinin gecikmesiyle 582.299 ₺ bakiyeli bir kredininki aynı ağırlıkta sayılırsa tablo riski yanlış gösterir. Kredi sayısını ek bilgi olarak verebilirsin.' }
  ]
});

})(window);
