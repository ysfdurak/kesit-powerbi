/* Kesit Power BI — Vaka Çalışmaları modülü: müşteri kaybı, İK analitiği, stok, e-ticaret hunisi ve kargo, satış ve hedef takibi. Bütün bulgular modelden motorla hesaplandı. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- Vaka 1: Müşteri kaybı (C1) ---------- */
add('musteri-analitigi', {
  id: 'vaka-kayip', lv: 'C1', mod: 'Vaka Çalışmaları', min: 30,
  title: 'Vaka: müşteri kaybı (churn)',
  sum: 'Pazarlama ekibi hangi müşterileri kaybettiğini ve kimi geri kazanmaya çalışacağını soruyor. Kayıp tanımını koyar, oranı segment, yaş, şehir ve kanala göre kırar, risk altındaki müşteri listesini çıkarırsın.',
  body: `
<h2>1. Şirketin sorusu ve brif</h2>
<p><b>Kim soruyor?</b> Pazarlama müdürü. Önümüzdeki çeyrekte bir “geri kazanma” (win-back) kampanyası yapılacak. Bütçe sınırlı: herkese indirim kodu gönderilmeyecek.</p>
<p><b>Hangi karar?</b> Kampanya kime gidecek, hangi segment ve şehre öncelik verilecek? Brif üç soruya iniyor:</p>
<ol>
<li>Kaç müşteriyi kaybettik ve bu oran hangi grupta yüksek?</li>
<li>Kaybettiğimiz müşteriler geçmişte ne kadar harcamıştı?</li>
<li>Henüz kaybetmediğimiz ama kaybetmek üzere olduğumuz müşteriler kim?</li>
</ol>
<p>Bu vaka, <b>Müşteri analitiği: yeni, geri dönen, kayıp, kohort, RFM</b> dersindeki tekniklere dayanır. Oradaki <code>[Kayıp Müşteri]</code> ölçüsü dönem bazlıdır: “geçen 12 ayda alıp bu dönemde almayan”. Burada kampanya için farklı bir tanım gerekiyor: müşteri bazında, son siparişten bu yana geçen gün sayısı.</p>

<h2>2. Veri ve model</h2>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>Kullanım</th></tr>
<tr><td><code>Satislar</code></td><td>Sipariş tarihi, durum (İptal hariç), kanal, tutar.</td></tr>
<tr><td><code>Musteriler</code></td><td>Segment, şehir, bölge, yaş grubu. 150 kayıtlı müşteri.</td></tr>
<tr><td><code>Tarih</code></td><td>Tarih filtresini kaldırmak ve “tarihe göre” sürüm için.</td></tr>
</table></div>
<p><b>Veri sınırları:</b></p>
<ul>
<li>Satış verisi 22.06.2022’de başlar, 31.12.2024’te biter. “Bugün” yerine bu <b>veri sonu tarihini</b> kullanırız. <code>TODAY()</code> kullansaydık her müşteri birkaç ay sonra “kayıp” görünürdü.</li>
<li>150 müşteriden 14’ü hiç sipariş vermemiş. Onlar “kayıp” değil, “hiç kazanılmamış” müşteridir; paydaya girmezler.</li>
<li>150 müşterinin yalnızca 140 farklı adı var: aynı adı taşıyan müşteriler var. Liste ve gruplamada <code>Musteriler[MusteriNo]</code> kullan, adı yalnızca etiket olarak göster.</li>
<li>Şehri boş 7 müşteri var. Şehir kırılımında “(Boş)” satırı görünür; gizleme, raporda veri kalitesi notu olarak bırak.</li>
</ul>

<h2>3. Analiz adımları</h2>
<p><b>Adım 1: Kayıp tanımı.</b> Kural: iptal edilmemiş son siparişinden bu yana <b>180 gün veya daha fazla</b> geçen müşteri kayıptır; 90–179 gün arası “risk altında”dır. Önce yapı taşları:</p>
<pre class="dax">Son Sipariş =
CALCULATE(
    MAX(Satislar[Tarih]),
    REMOVEFILTERS(Tarih),
    REMOVEFILTERS(Satislar[Kanal]),
    Satislar[Durum] &lt;&gt; "İptal"
)
Veri Sonu = MAXX(ALL(Satislar), Satislar[Tarih])
Sessiz Gün =
VAR Son = [Son Sipariş]
RETURN IF(NOT ISBLANK(Son), DATEDIFF(Son, [Veri Sonu], DAY))</pre>
<p><code>REMOVEFILTERS(Tarih)</code> önemli: rapor sayfasında bir yıl seçilse bile müşterinin gerçek son siparişini buluruz. <code>REMOVEFILTERS(Satislar[Kanal])</code> ise kanal kırılımında “bu kanaldaki son sipariş” yerine “herhangi bir kanaldaki son sipariş”i verir. <code>Veri Sonu</code> için <code>ALL(Satislar)</code> üzerinde yineleriz; hiçbir dilimleyici bu tarihi değiştirmez.</p>
<p><b>Bulgu:</b> Sipariş vermiş 136 müşterinin 89’u aktif (90 günden az), 20’si risk altında (90–179 gün), 27’si kayıp (180+ gün).</p>

<p><b>Adım 2: Kayıp sayısı ve oranı.</b></p>
<pre class="dax">Son Sipariş =
CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), REMOVEFILTERS(Satislar[Kanal]), Satislar[Durum] &lt;&gt; "İptal")
Veri Sonu = MAXX(ALL(Satislar), Satislar[Tarih])
Sessiz Gün =
VAR Son = [Son Sipariş]
RETURN IF(NOT ISBLANK(Son), DATEDIFF(Son, [Veri Sonu], DAY))
Kaybedilen Müşteri =
COUNTROWS(
    FILTER(
        CALCULATETABLE(VALUES(Satislar[MusteriNo]), REMOVEFILTERS(Tarih), Satislar[Durum] &lt;&gt; "İptal"),
        [Sessiz Gün] &gt;= 180
    )
)
Alışveriş Yapmış Müşteri = CALCULATE([Müşteri Sayısı], REMOVEFILTERS(Tarih))
Kayıp Oranı % = DIVIDE([Kaybedilen Müşteri], [Alışveriş Yapmış Müşteri])</pre>
<p>Müşteri listesini <code>Satislar</code> üzerinden alıyoruz (<code>VALUES(Satislar[MusteriNo])</code>). Böylece kanal ve kategori gibi olgu tablosundaki filtreler de listeyi daraltır. <code>FILTER</code> içindeki <code>[Sessiz Gün]</code> çağrısı her müşteri için bağlam geçişi yapar.</p>
<p><b>Bulgu:</b> 27 / 136 = <b>%19,9</b> kayıp oranı. Her beş müşteriden biri altı aydır sipariş vermiyor.</p>

<p><b>Adım 3: Segment, yaş, şehir ve kanal kırılımı.</b> Aynı ölçüyü matriste satırlara koymak yeter.</p>
<div class="tbl-wrap"><table>
<tr><th>Kırılım</th><th>Kayıp / alışveriş yapan</th><th>Kayıp oranı</th></tr>
<tr><td>Premium</td><td>8 / 30</td><td><b>%26,7</b></td></tr>
<tr><td>Bireysel</td><td>15 / 77</td><td>%19,5</td></tr>
<tr><td>Kurumsal</td><td>4 / 29</td><td>%13,8</td></tr>
<tr><td>Yaş 35-44</td><td>8 / 29</td><td><b>%27,6</b></td></tr>
<tr><td>Yaş 45-54</td><td>7 / 26</td><td>%26,9</td></tr>
<tr><td>Yaş 18-24</td><td>4 / 18</td><td>%22,2</td></tr>
<tr><td>Yaş 25-34</td><td>5 / 34</td><td>%14,7</td></tr>
<tr><td>Yaş 55+</td><td>3 / 29</td><td>%10,3</td></tr>
<tr><td>Marmara bölgesi</td><td>13 / 36</td><td><b>%36,1</b></td></tr>
<tr><td>İç Anadolu bölgesi</td><td>6 / 44</td><td>%13,6</td></tr>
<tr><td>Kanal: Mağaza</td><td>17 / 70</td><td>%24,3</td></tr>
<tr><td>Kanal: Mobil</td><td>23 / 117</td><td>%19,7</td></tr>
<tr><td>Kanal: Web</td><td>22 / 113</td><td>%19,5</td></tr>
</table></div>
<p>Şehir düzeyinde İstanbul öne çıkıyor: 27 müşteriden 10’u kayıp (<b>%37,0</b>). Bursa 3/9, Konya 2/5. Ancak Konya’da yalnızca 5 müşteri var; küçük gruplarda oran tek bir müşteriyle %20 oynar. Raporda oranın yanına mutlaka müşteri sayısını yaz.</p>
<div class="note"><b>Kanal kırılımı nasıl okunur?</b>Bir müşteri birden fazla kanaldan alışveriş yapmış olabilir. Kanal satırı “bu kanalı en az bir kez kullanmış müşteriler arasında kayıp oranı”dır. Bu yüzden kanal satırlarının toplamı (17 + 23 + 22 = 62) toplam kayıptan (27) büyüktür. Toplam satırı ise doğru sonucu verir; DAX müşteriyi bir kez sayar.</div>

<p><b>Adım 4: Kaybedilen müşterilerin geçmiş harcaması.</b></p>
<pre class="dax">Son Sipariş =
CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), REMOVEFILTERS(Satislar[Kanal]), Satislar[Durum] &lt;&gt; "İptal")
Sessiz Gün =
VAR Son = [Son Sipariş]
RETURN IF(NOT ISBLANK(Son), DATEDIFF(Son, MAXX(ALL(Satislar), Satislar[Tarih]), DAY))
Kaybedilen Ciro =
CALCULATE(
    [Net Satış],
    REMOVEFILTERS(Tarih),
    FILTER(VALUES(Musteriler[MusteriNo]), [Sessiz Gün] &gt;= 180)
)</pre>
<p><b>Bulgu:</b> Kaybedilen 27 müşteri, tüm dönemde <b>185.576 ₺</b> harcamış. Bu, toplam net satışın (1.250.772 ₺) <b>%14,8</b>’i. Kaybedilen müşteri başına geçmiş harcama 6.873 ₺; kalan müşterilerde 9.772 ₺. Yani genelde daha az harcayanları kaybediyoruz. Ama Premium istisna: kaybedilen cironun 82.328 ₺’si (%44) yalnızca 8 Premium müşteriden geliyor. Premium müşteri ortalama 11,1 sipariş veren, 16.271 ₺ harcayan bir müşteri; böyle birinin altı ay sessiz kalması güçlü bir sinyaldir.</p>

<p><b>Adım 5: Zaman içinde kayıp.</b> Brif “şu an” soruyor, ama yönetim “artıyor mu?” diye de soracak. Veri sonu yerine bağlamdaki son tarihi kullanan bir sürüm:</p>
<pre class="dax">Son Sipariş (Tarihe Kadar) =
VAR Gun = MAX(Tarih[Tarih])
RETURN CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), Satislar[Tarih] &lt;= Gun, Satislar[Durum] &lt;&gt; "İptal")
Kayıp (Tarihe Göre) =
VAR Gun = MAX(Tarih[Tarih])
VAR Musteriler180 =
    FILTER(
        CALCULATETABLE(VALUES(Satislar[MusteriNo]), REMOVEFILTERS(Tarih), Satislar[Tarih] &lt;= Gun, Satislar[Durum] &lt;&gt; "İptal"),
        DATEDIFF([Son Sipariş (Tarihe Kadar)], Gun, DAY) &gt;= 180
    )
RETURN COUNTROWS(Musteriler180)</pre>
<p><b>Bulgu:</b> Çeyrek sonlarında kayıp müşteri sayısı: 2023-Ç4 7, 2024-Ç1 12, Ç2 15, Ç3 20, Ç4 27. Bir yılda dört katına yakın arttı. Müşteri tabanı da büyüyor, ama artış hızı ciddi.</p>

<p><b>Adım 6: Risk altındaki müşteriler listesi.</b> Kampanyanın asıl hedefi bu liste: henüz kaybedilmemiş, 90–179 gündür sessiz müşteriler.</p>
<pre class="dax">EVALUATE
VAR Liste =
    ADDCOLUMNS(
        VALUES(Musteriler[MusteriNo]),
        "Müşteri", CALCULATE(MAX(Musteriler[Musteri])),
        "Segment", CALCULATE(MAX(Musteriler[Segment])),
        "Son", CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), Satislar[Durum] &lt;&gt; "İptal"),
        "Ciro", CALCULATE([Net Satış], REMOVEFILTERS(Tarih))
    )
VAR Riskli =
    FILTER(Liste, NOT ISBLANK([Son]) &amp;&amp; DATEDIFF([Son], DATE(2024, 12, 31), DAY) &gt;= 90 &amp;&amp; DATEDIFF([Son], DATE(2024, 12, 31), DAY) &lt; 180)
RETURN TOPN(10, Riskli, [Ciro], DESC)</pre>
<div class="warn"><b>CALCULATE’i unutma</b><code>ADDCOLUMNS</code> içinde <code>MAX(Musteriler[Segment])</code> yazarsan satır bağlamı filtreye dönüşmez ve her satıra tüm tablonun en büyük değeri (“Premium”) gelir. Bu vakayı hazırlarken ilk denemede tam olarak bu oldu ve liste “hep Premium” göründü. <code>CALCULATE(MAX(...))</code> bağlam geçişi yapar.</div>
<p><b>Bulgu:</b> 20 risk altındaki müşteri, geçmişte toplam <b>122.492 ₺</b> harcamış. 18’i Bireysel, 2’si Kurumsal; risk listesinde hiç Premium müşteri yok. Premium’daki sorun 180+ gün grubunda: 8 kayıp. İlk üç: 97 no.lu Mehmet Doğan (90 gün, 19.457 ₺), 24 no.lu Gamze Kaya (Kurumsal, 97 gün, 16.354 ₺), 51 no.lu Eren Çelik (109 gün, 11.573 ₺).</p>

<h2>4. Rapor sayfası taslağı</h2>
<div class="tbl-wrap"><table>
<tr><th>Konum</th><th>Görsel</th><th>Alanlar</th></tr>
<tr><td>Üst şerit</td><td>4 kart</td><td>Alışveriş yapmış müşteri (136), Kaybedilen (27), Kayıp oranı (%19,9), Kaybedilen ciro (185.576 ₺)</td></tr>
<tr><td>Sol orta</td><td>Çizgi grafik</td><td>X: Tarih[YilCeyrek], Y: Kayıp (Tarihe Göre)</td></tr>
<tr><td>Sağ orta</td><td>Çubuk grafik (yatay)</td><td>Segment ve yaş grubu; değer: Kayıp Oranı %, araç ipucunda müşteri sayısı</td></tr>
<tr><td>Sol alt</td><td>Doldurulmuş harita veya tablo</td><td>Şehir; Kayıp Oranı % ve Alışveriş Yapmış Müşteri yan yana</td></tr>
<tr><td>Sağ alt</td><td>Tablo</td><td>Risk listesi: MusteriNo, ad, segment, son sipariş, sessiz gün, geçmiş ciro; ciroya göre azalan</td></tr>
<tr><td>Sayfa notu</td><td>Metin kutusu</td><td>“Kayıp: veri sonu (31.12.2024) itibarıyla 180+ gün sipariş yok.”</td></tr>
</table></div>
<p>Risk tablosuna bir dilimleyici (Slicer) olarak “sessiz gün eşiği” eklemek istersen <b>Segmentasyon</b> dersindeki ne olur (what-if) parametresini kullan: 180 sabiti parametre değerine dönüşür.</p>

<h2>5. Bulgu özeti ve öneri</h2>
<ol>
<li><b>Kayıp oranı %19,9</b> (27 / 136) ve bir yılda 7’den 27’ye çıktı. Kayıp takibi aylık KPI olmalı.</li>
<li><b>Premium en yüksek orana sahip (%26,7)</b> ve kaybedilen cironun %44’ü bu segmentten. Premium için 180 gün yerine daha kısa bir uyarı eşiği (ör. 60 gün) tanımla; bu müşteriler ortalama 11 sipariş veriyor, uzun sessizlik normal değil.</li>
<li><b>Marmara ve özellikle İstanbul</b> (%37,0) öne çıkıyor. Bölge ekibiyle teslimat ve rakip etkisini konuş; küçük şehirlerde oranı müşteri sayısıyla birlikte oku.</li>
<li><b>Kampanya önce risk listesine gitsin:</b> 20 müşteri, 122.492 ₺ geçmiş ciro. Kaybedilmişlere göre geri kazanmak daha ucuzdur.</li>
<li>35-54 yaş grubunda oran %27 civarında, 55+ grubunda %10,3. Mesaj ve kanal seçimini yaş grubuna göre ayır.</li>
</ol>
`,
  ex: [
    { t:'dax', name:'Kaybedilen Müşteri (180+)', q:'<b>Kaybedilen Müşteri (180+)</b>: iptal edilmemiş son siparişinden bu yana, veri sonu tarihine göre 180 gün veya daha fazla geçen müşterileri say. Tarih filtresini yok say; veri sonunu <code>MAXX(ALL(Satislar), Satislar[Tarih])</code> ile bul.',
      sol:'VAR VeriSonu = MAXX(ALL(Satislar), Satislar[Tarih])\nRETURN COUNTROWS(FILTER(CALCULATETABLE(VALUES(Satislar[MusteriNo]), REMOVEFILTERS(Tarih), Satislar[Durum] <> "İptal"), VAR Son = CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), Satislar[Durum] <> "İptal") RETURN DATEDIFF(Son, VeriSonu, DAY) >= 180))',
      hint:'Müşteri listesini CALCULATETABLE(VALUES(Satislar[MusteriNo]), REMOVEFILTERS(Tarih), Durum <> "İptal") ile al; FILTER içinde her müşterinin son siparişini CALCULATE(MAX(...)) ile bul ve DATEDIFF ile gün farkını hesapla.',
      grid:[{t:'Musteriler',c:'Segment'},{t:'Musteriler',c:'YasGrubu'}] },
    { t:'dax', name:'Kayıp Oranı (180+) %', q:'<b>Kayıp Oranı (180+) %</b>: 180+ gündür sipariş vermeyen müşteri sayısını, tüm dönemde en az bir (iptal olmayan) sipariş vermiş müşteri sayısına böl. İkisinde de tarih filtresini kaldır.',
      sol:'VAR VeriSonu = MAXX(ALL(Satislar), Satislar[Tarih])\nVAR Musteri = CALCULATETABLE(VALUES(Satislar[MusteriNo]), REMOVEFILTERS(Tarih), Satislar[Durum] <> "İptal")\nVAR Kayip = COUNTROWS(FILTER(Musteri, VAR Son = CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), Satislar[Durum] <> "İptal") RETURN DATEDIFF(Son, VeriSonu, DAY) >= 180))\nRETURN DIVIDE(Kayip, COUNTROWS(Musteri))',
      hint:'Müşteri listesini bir VAR’a al; payda COUNTROWS(liste), pay aynı listenin 180+ gün filtresinden geçen kısmı.',
      grid:[{t:'Musteriler',c:'Segment'},{t:'Musteriler',c:'Bolge'}] },
    { t:'dax', name:'Kaybedilen Müşteri Cirosu', q:'<b>Kaybedilen Müşteri Cirosu</b>: 180+ gündür sipariş vermeyen müşterilerin tüm dönemdeki <code>[Net Satış]</code> toplamı. Müşterileri <code>VALUES(Musteriler[MusteriNo])</code> üzerinden filtrele.',
      sol:'VAR VeriSonu = MAXX(ALL(Satislar), Satislar[Tarih])\nRETURN CALCULATE([Net Satış], REMOVEFILTERS(Tarih), FILTER(VALUES(Musteriler[MusteriNo]), VAR Son = CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS(Tarih), Satislar[Durum] <> "İptal") RETURN NOT ISBLANK(Son) && DATEDIFF(Son, VeriSonu, DAY) >= 180))',
      hint:'CALCULATE([Net Satış], REMOVEFILTERS(Tarih), FILTER(VALUES(Musteriler[MusteriNo]), …180+ koşulu…)). Hiç siparişi olmayan müşteriyi NOT ISBLANK ile dışarıda bırak.',
      grid:[{t:'Musteriler',c:'Segment'},{t:'Musteriler',c:'YasGrubu'}] },
    { t:'mc', q:'Kayıp ölçüsünde “bugün” olarak neden <code>TODAY()</code> yerine veri sonu tarihini (31.12.2024) kullandık?',
      o:['TODAY() bu motorda ve Power BI hizmetinde desteklenmeyen bir fonksiyondur','Sabit bir veri sonu tarihi TODAY() fonksiyonuna göre daha hızlı hesaplanır','TODAY() takvimle ilerler; veri bitse de sessiz gün büyür','TODAY() yalnızca hesaplanmış sütunlarda çalışır, ölçüde sonuç vermez'], a:2,
      why:'Model 31.12.2024’te biten bir anlık görüntü. TODAY() kullanılırsa sessiz gün sayısı veriden değil takvimden büyür; birkaç ay sonra neredeyse herkes “kayıp” olur. Veri sonu, analizi verinin kendisine bağlar.' },
    { t:'mc', q:'Kampanya bütçesi yalnızca bir grup için yetiyor. Bulgulara göre <b>en mantıklı ilk hedef</b> hangisi?',
      o:['Risk listesindeki 20 müşteri','Kayıp oranı %40 olan Konya','Tüm 55+ yaş grubu','Hiç sipariş vermemiş 14 kayıtlı müşteri'], a:0,
      why:'Risk listesi (90–179 gün) henüz kaybedilmemiş ve geçmişte 122.492 ₺ harcamış müşterilerden oluşuyor; geri kazanmak kaybedilmişe göre daha ucuz. Konya’nın oranı 5 müşteriye dayanıyor; 55+ en düşük kayıp oranına sahip; hiç almamış müşteriler kayıp değil, edinme sorunudur.' }
  ]
});

/* ---------- Vaka 2: İK analitiği (C1) ---------- */
add('hiyerarsi', {
  id: 'vaka-ik', lv: 'C1', mod: 'Vaka Çalışmaları', min: 30,
  title: 'Vaka: İK analitiği',
  sum: 'İK müdürü bütçe dönemi öncesi kadro ve ücret yapısını görmek istiyor. Departman başına çalışan, maaş dağılımı ve çeyrekler, kıdem grupları, unvan bazında maaş aralığı, yönetici başına ekip ve işe alım eğilimini çıkarırsın; ayrılış verisinin neden olmadığını ve nasıl ekleneceğini konuşursun.',
  body: `
<h2>1. Şirketin sorusu ve brif</h2>
<p><b>Kim soruyor?</b> İK müdürü (Onur Özkan), genel müdüre sunum hazırlıyor. Yeni yılın ücret bütçesi ve işe alım planı konuşulacak.</p>
<p><b>Hangi karar?</b> Hangi departmanlarda ücret düzenlemesi gerekiyor, yöneticilerin ekipleri dengeli mi, işe alım hangi hızda sürmeli? Ek olarak genel müdür “çalışan kaybımız ne durumda?” diye soracak; buna dürüst bir cevap gerekiyor.</p>
<p>Ebeveyn-çocuk yapısını (<code>YoneticiNo</code>, <code>Yol</code>) <b>Hiyerarşiler</b> dersinde gördün. Burada aynı tabloyu bir İK raporuna dönüştürüyoruz.</p>

<h2>2. Veri ve model</h2>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>İçerik</th></tr>
<tr><td><code>Calisanlar</code></td><td>27 çalışan: unvan, maaş, işe giriş, kıdem yılı, seviye (1 genel müdür, 2 müdür, 3 uzman/temsilci), yönetici no, yol.</td></tr>
<tr><td><code>Departmanlar</code></td><td>8 departman ve şehri. <code>Calisanlar[DepartmanNo]</code> ile çoka-bir ilişkili.</td></tr>
</table></div>
<p><b>Veri sınırları:</b></p>
<ul>
<li><b>Modelde ayrılış verisi yok.</b> <code>Calisanlar</code> bugün çalışanların anlık görüntüsüdür: ayrılan kişi tablodan düşmüş. Bu yüzden çalışan devir oranı (turnover), ortalama çalışma süresi veya “kim ayrılıyor?” sorusu bu modelle <b>cevaplanamaz</b>. Ayrıca maaş ve kıdem dağılımı yalnızca “kalanları” gösterir (hayatta kalan yanlılığı).</li>
<li>Departmanlar tablosunda <b>Hukuk</b> var ama ona bağlı çalışan yok. Matriste “boş öğeleri göster” kapalıysa bu departman hiç görünmez; bilinçli bir seçim yap.</li>
<li><code>Tarih</code> tablosu 2022–2024’ü kapsar ve <code>Calisanlar</code> ile ilişkili değildir. Daha eski işe girişler için ayrı bir yöntem gerekir (Adım 6).</li>
<li>Maaş ve e-posta kişisel veridir. Yayımlamadan önce <b>Satır ve nesne düzeyinde güvenlik</b> dersindeki nesne düzeyi güvenliği (OLS) ile <code>Maas</code> sütununu yalnızca İK rolüne aç.</li>
</ul>

<h2>3. Analiz adımları</h2>
<p><b>Adım 1: Departman başına çalışan.</b> Hazır <code>[Çalışan Sayısı]</code> ölçüsünü <code>Departmanlar[Departman]</code> ile matrise koy.</p>
<p><b>Bulgu:</b> Satış 6, Veri Analitiği 5, Yazılım 5, Pazarlama 4, Finans 3, İnsan Kaynakları 3, Genel Müdürlük 1, Hukuk 0. Toplam maaş yükünde Satış (357.000 ₺, %19,2) ve Yazılım (356.000 ₺, %19,2) başta.</p>

<p><b>Adım 2: Maaş dağılımı: medyan ve çeyrekler.</b> Ortalama tek başına yanıltır; çeyrekler dağılımın gövdesini gösterir.</p>
<pre class="dax">Maaş 1. Çeyrek = PERCENTILE.INC(Calisanlar[Maas], 0.25)
Maaş 3. Çeyrek = PERCENTILE.INC(Calisanlar[Maas], 0.75)
Çeyrekler Arası Fark = [Maaş 3. Çeyrek] - [Maaş 1. Çeyrek]</pre>
<p><b>Bulgu:</b> Şirket geneli: ortalama 68.741 ₺, medyan 67.000 ₺, 1. çeyrek 54.500 ₺, 3. çeyrek 78.500 ₺. En düşük 38.000 ₺, en yüksek 145.000 ₺ (genel müdür). Ortalamanın medyandan yüksek olması tek bir yüksek maaşın etkisi.</p>
<div class="tbl-wrap"><table>
<tr><th>Departman</th><th>Kişi</th><th>1. çeyrek</th><th>Medyan</th><th>3. çeyrek</th><th>En yüksek / en düşük</th></tr>
<tr><td>İnsan Kaynakları</td><td>3</td><td>69.500</td><td>72.000</td><td>81.000</td><td>1,34</td></tr>
<tr><td>Yazılım</td><td>5</td><td>66.000</td><td>71.000</td><td>75.000</td><td>1,53</td></tr>
<tr><td>Finans</td><td>3</td><td>66.000</td><td>69.000</td><td>75.500</td><td>1,30</td></tr>
<tr><td>Veri Analitiği</td><td>5</td><td>60.000</td><td>60.000</td><td>71.000</td><td>2,02</td></tr>
<tr><td>Satış</td><td>6</td><td>45.250</td><td>55.000</td><td>67.000</td><td><b>2,53</b></td></tr>
<tr><td>Pazarlama</td><td>4</td><td>44.000</td><td>46.000</td><td>56.750</td><td>1,89</td></tr>
</table></div>
<p>Pazarlama’nın medyanı şirket medyanının 21.000 ₺ altında. Satış’ta en yüksek maaş en düşüğün 2,53 katı: departman içi en geniş makas.</p>

<p><b>Adım 3: Kıdem grupları.</b> <code>KidemYil</code> sütunundan grup üretmek için hesaplanmış sütun ya da gruplama (Group) kullanılabilir. Analiz için bir DAX sorgusu yeterli:</p>
<pre class="dax">EVALUATE
VAR T =
    ADDCOLUMNS(
        Calisanlar,
        "Grup", SWITCH(TRUE(),
            Calisanlar[KidemYil] &lt;= 1, "0-1 yıl",
            Calisanlar[KidemYil] &lt;= 4, "2-4 yıl",
            Calisanlar[KidemYil] &lt;= 7, "5-7 yıl",
            "8+ yıl")
    )
RETURN
    ADDCOLUMNS(
        DATATABLE("Grup", STRING, {{"0-1 yıl"}, {"2-4 yıl"}, {"5-7 yıl"}, {"8+ yıl"}}),
        "Kişi", VAR G = [Grup] RETURN COUNTROWS(FILTER(T, [Grup] = G)),
        "Medyan", VAR G = [Grup] RETURN MEDIANX(FILTER(T, [Grup] = G), Calisanlar[Maas])
    )</pre>
<p><b>Bulgu:</b> 0-1 yıl 5 kişi (medyan 58.000 ₺), 2-4 yıl 12 kişi (63.000 ₺), 5-7 yıl 5 kişi (71.000 ₺), 8+ yıl 5 kişi (90.000 ₺). Kadronun yarıya yakını (12 / 27) 2-4 yıllık: terfi ve ücret beklentisinin en yoğun olduğu grup.</p>

<p><b>Adım 4: Unvan ve seviye bazında maaş aralığı.</b></p>
<pre class="dax">Maaş Aralığı = MAX(Calisanlar[Maas]) - MIN(Calisanlar[Maas])
Maaş Aralığı Oranı = DIVIDE(MAX(Calisanlar[Maas]), MIN(Calisanlar[Maas]))</pre>
<p><b>Bulgu:</b> Seviye 2’de (6 müdür) maaşlar 82.000–97.000 ₺, medyan 88.500 ₺. Seviye 3’te (20 kişi) 38.000–75.000 ₺, medyan 60.000 ₺: müdür medyanı uzman medyanının 1,48 katı. Birden fazla kişili unvanlarda en geniş aralık <b>Satış Temsilcisi</b>’nde: 52.000–70.000 ₺ (18.000 ₺ fark). Dikkat çeken iki nokta:</p>
<ul>
<li><b>Ücret sıkışması:</b> 09.07.2024’te giren Yusuf Kara (Satış Temsilcisi) 58.000 ₺ alıyor; 2022’den beri aynı unvanda olan Ece Kurt 52.000 ₺. Yeni girenin eskiden fazla alması ayrılma riskini artırır.</li>
<li><b>Unvan sırası:</b> Satış Uzmanı unvanındaki iki kişi (38.000–43.000 ₺) Satış Temsilcilerinden düşük ücret alıyor. Unvan adları kariyer basamağını yansıtmıyor olabilir; İK ile unvan sözlüğü konuşulmalı.</li>
</ul>

<p><b>Adım 5: Yönetici başına ekip büyüklüğü.</b> Doğrudan bağlıları saymak için bağlamdaki kişileri “yönetici” kabul edip tüm tabloda onlara bağlı olanları ararız:</p>
<pre class="dax">Doğrudan Bağlı =
VAR Yoneticiler = VALUES(Calisanlar[CalisanNo])
RETURN COUNTROWS(FILTER(ALL(Calisanlar), Calisanlar[YoneticiNo] IN Yoneticiler))
Yönetici Sayısı = COUNTROWS(FILTER(VALUES(Calisanlar[CalisanNo]), [Doğrudan Bağlı] &gt; 0))
Ortalama Ekip Büyüklüğü = DIVIDE([Doğrudan Bağlı], [Yönetici Sayısı])</pre>
<p><b>Bulgu:</b> 7 yönetici, 26 doğrudan bağlı, ortalama ekip <b>3,7</b> kişi. Genel müdür 6, Satış Müdürü 5, Analitik ve Yazılım müdürleri 4’er, Pazarlama 3, İK ve Finans 2’şer kişi yönetiyor. Ekip büyüklüğü sorunu yok; ama genel müdürün 6 doğrudan bağlısı tüm müdürler demek. Tüm alt ağaç (dolaylı bağlılar dâhil) için <b>Hiyerarşiler</b> dersindeki <code>PATHCONTAINS</code> kalıbını kullan.</p>

<p><b>Adım 6: İşe alım eğilimi.</b> <code>Calisanlar</code> ile <code>Tarih</code> arasında ilişki yok. <code>TREATAS</code> sanal bir ilişki kurar (<b>Tablo fonksiyonları, kümeler ve sanal ilişkiler</b> dersi):</p>
<pre class="dax">İşe Alım =
CALCULATE(COUNTROWS(Calisanlar), TREATAS(VALUES(Tarih[Tarih]), Calisanlar[IseGiris]))</pre>
<p>Tarih tablosu 2022’de başladığı için önceki yıllar bu ölçüde görünmez. Tüm geçmiş için bir sorgu:</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    GENERATESERIES(2015, 2024, 1),
    "İşe giriş", VAR Y = [Value] RETURN COUNTROWS(FILTER(Calisanlar, YEAR(Calisanlar[IseGiris]) = Y))
)</pre>
<p><b>Bulgu:</b> 2015’ten 2021’e yılda 1–4 kişi alınmış; <b>2022’de 7</b> kişi (zirve), 2023’te 2, 2024’te 3. 2024’te alınan üç kişiden ikisi Pazarlama’da İçerik Uzmanı. Ancak ayrılış verisi olmadığı için bu “net büyüme” değildir: 2022’de alınıp ayrılan biri tabloda hiç görünmez.</p>

<h2>Ayrılış analizi hangi veriyle yapılır?</h2>
<p>Genel müdürün sorusuna cevap: <b>bu modelle yapılamaz</b>; şu veriler gerekir:</p>
<ul>
<li><b>Ayrılış tarihi ve nedeni:</b> <code>AyrilisTarihi</code> (boşsa çalışıyor) ve <code>AyrilisTuru</code> (gönüllü / gönülsüz / emeklilik). Ayrılanlar tablodan silinmemeli.</li>
<li><b>Tarihli çalışan geçmişi:</b> unvan, departman ve maaş değiştiğinde yeni satır açan bir tablo (yavaş değişen boyut, tip 2). Böylece “ayrıldığında hangi departmandaydı, ne kazanıyordu?” cevaplanır.</li>
<li><b>Aylık kadro anlık görüntüsü:</b> ay sonu çalışan sayısı. Devir oranı = dönemdeki ayrılış ÷ ortalama çalışan sayısı; ortalama kadro yarı toplanabilir bir ölçüdür (<b>Yarı toplanabilir ölçüler</b> dersi).</li>
</ul>
<p>Bu veriler gelince örnek ölçü şöyle olur (bu modelde sütun olmadığından çalıştırılamaz):</p>
<pre class="dax" data-notry>Ayrılan Çalışan =
CALCULATE(
    COUNTROWS(Calisanlar),
    USERELATIONSHIP(Calisanlar[AyrilisTarihi], Tarih[Tarih])
)
Devir Oranı % = DIVIDE([Ayrılan Çalışan], [Ortalama Kadro])</pre>

<h2>4. Rapor sayfası taslağı</h2>
<div class="tbl-wrap"><table>
<tr><th>Konum</th><th>Görsel</th><th>Alanlar</th></tr>
<tr><td>Üst şerit</td><td>4 kart</td><td>Çalışan (27), Medyan maaş (67.000 ₺), Ortalama kıdem (3,9 yıl), Ortalama ekip (3,7)</td></tr>
<tr><td>Sol orta</td><td>Matris</td><td>Satır: Departman; değerler: Çalışan, 1. çeyrek, Medyan, 3. çeyrek, Maaş Aralığı Oranı (koşullu biçim: 2’nin üstü uyarı rengi)</td></tr>
<tr><td>Sağ orta</td><td>Sütun grafik</td><td>X: kıdem grubu; Y: Çalışan Sayısı; araç ipucu: Medyan Maaş</td></tr>
<tr><td>Sol alt</td><td>Ayrıştırma ağacı veya hiyerarşik tablo</td><td>Yol hiyerarşisi; Doğrudan Bağlı</td></tr>
<tr><td>Sağ alt</td><td>Çizgi grafik</td><td>İşe giriş yılı; işe alım sayısı</td></tr>
<tr><td>Alt bilgi</td><td>Metin kutusu</td><td>“Ayrılış verisi modelde yok; devir oranı gösterilmiyor.”</td></tr>
</table></div>

<h2>5. Bulgu özeti ve öneri</h2>
<ol>
<li><b>Pazarlama ücret seviyesi geride:</b> medyan 46.000 ₺, şirket medyanı 67.000 ₺. Piyasa karşılaştırması yapılmadan işe alım zorlaşır.</li>
<li><b>Satış’ta ücret makası en geniş</b> (2,53 kat) ve aynı unvanda yeni gelen eskiden fazla alıyor. Satış Temsilcisi bandını 52.000–70.000 ₺ arasında yeniden tanımla.</li>
<li><b>2-4 yıl kıdemli 12 kişi</b> kadronun %44’ü. Terfi kriterlerini bu grup için yazılı hâle getir.</li>
<li><b>Ayrılış verisini topla:</b> AyrilisTarihi ve AyrilisTuru sütunları ile aylık kadro anlık görüntüsü olmadan çalışan kaybı raporlanamaz.</li>
<li>Hukuk departmanı tanımlı ama boş: ya kadro planına ekle ya da boyut tablosundan çıkar.</li>
</ol>
`,
  ex: [
    { t:'dax', name:'Maaş 3. Çeyreği', q:'<b>Maaş 3. Çeyreği</b>: maaşların %75’lik dilimini (3. çeyrek) <code>PERCENTILE.INC</code> ile hesapla.',
      sol:'PERCENTILE.INC(Calisanlar[Maas], 0.75)', hint:'PERCENTILE.INC(sütun, 0.75).',
      grid:[{t:'Departmanlar',c:'Departman'},{t:'Calisanlar',c:'Seviye'}] },
    { t:'dax', name:'Doğrudan Bağlı Sayısı', q:'<b>Doğrudan Bağlı Sayısı</b>: bağlamdaki çalışanlara doğrudan bağlı (<code>YoneticiNo</code> değeri onların <code>CalisanNo</code>’su olan) kişileri tüm tabloda say.',
      sol:'VAR Yoneticiler = VALUES(Calisanlar[CalisanNo])\nRETURN COUNTROWS(FILTER(ALL(Calisanlar), Calisanlar[YoneticiNo] IN Yoneticiler))',
      hint:'Bağlamdaki CalisanNo’ları VALUES ile bir VAR’a al; FILTER(ALL(Calisanlar), Calisanlar[YoneticiNo] IN …) satırlarını say.',
      grid:[{t:'Departmanlar',c:'Departman'},{t:'Calisanlar',c:'Seviye'}] },
    { t:'dax', name:'İşe Alım Sayısı', q:'<b>İşe Alım Sayısı</b>: <code>Calisanlar</code> ile <code>Tarih</code> arasında ilişki yok. <code>TREATAS</code> ile bağlamdaki tarihleri <code>Calisanlar[IseGiris]</code> sütununa uygulayarak işe girenleri say.',
      sol:'CALCULATE(COUNTROWS(Calisanlar), TREATAS(VALUES(Tarih[Tarih]), Calisanlar[IseGiris]))',
      hint:'CALCULATE(COUNTROWS(Calisanlar), TREATAS(VALUES(Tarih[Tarih]), Calisanlar[IseGiris])).',
      grid:[{t:'Tarih',c:'Yil'},{t:'Departmanlar',c:'Departman'}] },
    { t:'mc', q:'Genel müdür “geçen yıl kaç kişi ayrıldı?” diye soruyor. Bu modelle en doğru cevap hangisi?',
      o:['2023’te işe giren 2 kişiyle karşılaştırarak tahmin ederiz','KidemYil 0 olanlar ayrılanlardır','Bu modelle bilinemez; ayrılış tarihi ve aylık kadro verisi gerekir','Boş Hukuk departmanı ayrılanları gösterir'], a:2,
      why:'Calisanlar yalnızca bugün çalışanları içerir; ayrılan kişi tabloda yoktur. İşe giriş sayısı, kıdem ya da boş departman ayrılışı göstermez. Cevap için AyrilisTarihi/AyrilisTuru ve aylık kadro anlık görüntüsü toplanmalı.' },
    { t:'mc', q:'Satış Temsilcisi unvanında 2024’te giren biri 58.000 ₺, 2022’den beri çalışan biri 52.000 ₺ alıyor. Bu bulgu raporda hangi başlık altında verilmeli?',
      o:['Kıdem grubu dağılımı','Ekip büyüklüğü dengesizliği','Departman maliyet payı','Ücret sıkışması'], a:3,
      why:'Yeni girenin aynı unvandaki kıdemliden fazla kazanması ücret sıkışmasıdır (pay compression). Kıdemli çalışanın ayrılma riskini artırdığı için ücret bandı önerisine bağlanır.' }
  ]
});

/* ---------- Vaka 3: Stok analizi (B2) ---------- */
add('yari-toplanabilir', {
  id: 'vaka-stok', lv: 'B2', mod: 'Vaka Çalışmaları', min: 28,
  title: 'Vaka: stok analizi',
  sum: 'Satın alma müdürü hangi ürünlere sipariş vereceğine ve hangi stoku eriteceğine karar verecek. Dönem sonu stok değeri, stok devir hızı, stokta kalma günü, ABC sınıfına göre stok ve stoksuz kalma riskini aylık stok görüntüsünden hesaplarsın.',
  body: `
<h2>1. Şirketin sorusu ve brif</h2>
<p><b>Kim soruyor?</b> Satın alma müdürü. Depoda yer daralıyor, finans ise stoka bağlanan parayı azaltmak istiyor.</p>
<p><b>Hangi karar?</b> 2025 ilk çeyrek satın alma planı: hangi ürünlerde sipariş azaltılacak (aşırı stok), hangilerinde artırılacak (stoksuz kalma riski)? Brifin soruları:</p>
<ol>
<li>Stokta ne kadar para bağlı ve yıl içinde nasıl değişti?</li>
<li>Stok ne kadar hızlı dönüyor; kategoriler arasında fark var mı?</li>
<li>Satışın çoğunu getiren ürünlere mi, yoksa az satan ürünlere mi stok bağlamışız?</li>
<li>Hangi ürünler stoksuz kaldı, hangileri hiç hareket etmiyor?</li>
</ol>
<p>Stok yarı toplanabilir bir değerdir: aylar boyunca toplanmaz. Kapanış değeri ve ortalama bakiye tekniklerini <b>Yarı toplanabilir ölçüler: stok, bakiye, nüfus</b> dersinde gördün; burada onları karar verdiren bir rapora dönüştürüyoruz.</p>

<h2>2. Veri ve model</h2>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>Kullanım</th></tr>
<tr><td><code>StokGorunum</code></td><td>Ay sonu anlık görüntüsü: ürün, stok adedi, gelen adet, stok değeri (maliyetle). 40 ürün × 36 ay = 1.440 satır.</td></tr>
<tr><td><code>Satislar</code></td><td>Satılan malın maliyeti: hazır <code>[Net Maliyet]</code>.</td></tr>
<tr><td><code>Urunler</code>, <code>Kategoriler</code>, <code>Tarih</code></td><td>Ürün ve kategori kırılımı; ay ve yıl.</td></tr>
</table></div>
<p>Hazır ölçüler: <code>[Stok Değeri]</code> (son dolu tarihteki değer, <code>LASTNONBLANK</code>), <code>[Stok Adedi]</code> (son görüntüdeki adet).</p>
<p><b>Veri sınırları:</b></p>
<ul>
<li>Görüntüler yalnızca ay sonunda alınıyor (31.01.2022 – 31.12.2024). Ay içinde stok sıfıra düşüp tekrar dolduysa bunu göremeyiz; “stoksuz ay” sayısı gerçek stoksuz gün sayısının alt sınırıdır.</li>
<li>Satışlar Haziran 2022’de başlıyor. 2022 devir hızı yapay olarak düşük çıkar; yıllık karşılaştırmada 2023 ve 2024’ü kullan.</li>
<li><code>Urunler[Stok]</code> sütunu statiktir ve son görüntüyle aynıdır (311 adet, 163.465 ₺). Tarihli analizde her zaman <code>StokGorunum</code>’u kullan.</li>
</ul>

<h2>3. Analiz adımları</h2>
<p><b>Adım 1: Dönem sonu stok değeri.</b> Hazır <code>[Stok Değeri]</code> ölçüsünü <code>Tarih[Yil]</code> ve <code>Tarih[YilAy]</code> ile kullan.</p>
<p><b>Bulgu:</b> Yıl sonu stok değeri 2022’de 164.498 ₺, 2023’te 166.057 ₺, 2024’te <b>163.465 ₺</b> (311 adet). Satışlar 2024’te %86 büyürken stok neredeyse sabit kaldı: bu iyi haber; aynı stokla daha çok satıyoruz.</p>

<p><b>Adım 2: Ortalama stok ve stok devir hızı.</b> Devir hızı = satılan malın maliyeti ÷ ortalama stok. Ortalama stok, dönemdeki ay sonu değerlerinin ortalamasıdır:</p>
<pre class="dax">Ortalama Stok Değeri =
AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])
Stok Devir Hızı =
DIVIDE([Net Maliyet], [Ortalama Stok Değeri])
Stokta Kalma Günü =
VAR Gun = DATEDIFF(MIN(Tarih[Tarih]), MAX(Tarih[Tarih]), DAY) + 1
RETURN DIVIDE(Gun, [Stok Devir Hızı])</pre>
<p><b>Bulgu:</b> 2024’te ortalama stok 180.333 ₺, net maliyet 458.504 ₺: devir hızı <b>2,54</b>, stokta kalma <b>144 gün</b>. 2023’te 1,60 ve 228 gündü. Stok yılda iki buçuk kez dönüyor; bir ürün ortalama beş ay depoda bekliyor.</p>
<div class="note"><b>Hazır [Stok Gün Sayısı] neden farklı?</b>Modeldeki <code>[Stok Gün Sayısı]</code> dönem sonu stokunu günlük maliyete böler ve 2024 için 130,5 gün verir. Bizim ölçümüz ortalama stoku kullanır (144 gün). Yıl içinde stok dalgalanıyorsa ortalama daha adildir; raporda hangisini kullandığını sayfa notunda yaz.</div>
<div class="tbl-wrap"><table>
<tr><th>Kategori (2024)</th><th>Yıl sonu stok</th><th>Devir hızı</th><th>Stokta kalma günü</th></tr>
<tr><td>Kitap</td><td>11.660 ₺</td><td>4,01</td><td>91</td></tr>
<tr><td>Kozmetik</td><td>13.113 ₺</td><td>3,55</td><td>103</td></tr>
<tr><td>Giyim</td><td>16.667 ₺</td><td>3,33</td><td>110</td></tr>
<tr><td>Elektronik</td><td>35.209 ₺</td><td>3,08</td><td>119</td></tr>
<tr><td>Ev &amp; Yaşam</td><td>27.423 ₺</td><td>3,00</td><td>122</td></tr>
<tr><td>Hediye</td><td>2.545 ₺</td><td>2,93</td><td>125</td></tr>
<tr><td><b>Spor</b></td><td><b>56.848 ₺</b></td><td><b>1,04</b></td><td><b>353</b></td></tr>
</table></div>
<p>Spor stokun %35’ini tutuyor ama yılda bir kez bile tam dönmüyor. Nedenini ürün düzeyinde arayalım.</p>

<p><b>Adım 3: Ürün düzeyi: aşırı stok.</b> Aynı ölçüleri <code>Urunler[Urun]</code> ile tabloya koy, stokta kalma gününe göre sırala.</p>
<p><b>Bulgu:</b></p>
<ul>
<li><b>Koşu Bandı:</b> 4 adet, <b>41.564 ₺</b> stok ve veride <b>hiç satışı yok</b>. Tek başına Spor stokunun %73’ü, toplam stokun %25’i. Devir hızı boş (BLANK) çıkar, çünkü maliyet yok. Boş değer “sorun yok” anlamına gelmez: tabloda en tehlikeli satır bu.</li>
<li><b>Gurme Lokum Kutusu:</b> 955 ₺ stok, hiç satış yok.</li>
<li>Yavaş dönenler (2024): Robot Süpürge (devir 1,14; 320 gün; 14.067 ₺), Kamp Çadırı (1,36; 268 gün), Mont (1,65; 222 gün).</li>
</ul>

<p><b>Adım 4: ABC sınıfına göre stok.</b> Ürünleri 2024 net satışına göre sırala: kümülatif payı %70’e kadar A, %90’a kadar B, kalanı C. Hazır <code>[ABC Sınıfı]</code> ölçüsü görselde ürün satırında çalışır (<code>ISINSCOPE</code>); sınıf başına stok toplamı için sorgu yazarız:</p>
<pre class="dax">EVALUATE
VAR T =
    CALCULATETABLE(
        ADDCOLUMNS(VALUES(Urunler[Urun]), "S", [Net Satış], "Stok", [Stok Değeri]),
        Tarih[Yil] = 2024
    )
VAR Toplam = SUMX(T, [S])
VAR T2 = ADDCOLUMNS(T, "Pay", VAR s = [S] RETURN DIVIDE(SUMX(FILTER(T, [S] &gt;= s), [S]), Toplam))
VAR T3 = ADDCOLUMNS(T2, "Sınıf", IF(ISBLANK([S]), "C", IF([Pay] &lt;= 0.7, "A", IF([Pay] &lt;= 0.9, "B", "C"))))
RETURN
    ADDCOLUMNS(
        DATATABLE("Sınıf", STRING, {{"A"}, {"B"}, {"C"}}),
        "Ürün", VAR K = [Sınıf] RETURN COUNTROWS(FILTER(T3, [Sınıf] = K)),
        "Satış", VAR K = [Sınıf] RETURN SUMX(FILTER(T3, [Sınıf] = K), [S]),
        "Stok", VAR K = [Sınıf] RETURN SUMX(FILTER(T3, [Sınıf] = K), [Stok])
    )</pre>
<div class="tbl-wrap"><table>
<tr><th>Sınıf</th><th>Ürün</th><th>2024 satış payı</th><th>Yıl sonu stok</th><th>Stok payı</th></tr>
<tr><td>A</td><td>19</td><td>%68,0</td><td>85.102 ₺</td><td>%52,1</td></tr>
<tr><td>B</td><td>10</td><td>%20,9</td><td>26.789 ₺</td><td>%16,4</td></tr>
<tr><td>C</td><td>11</td><td>%11,1</td><td>51.574 ₺</td><td><b>%31,6</b></td></tr>
</table></div>
<p><b>Bulgu:</b> C sınıfı satışın %11’ini getiriyor ama stokun %32’sini tutuyor. Bu fazlalığın büyük kısmı tek ürün: Koşu Bandı (C sınıfında, satışsız).</p>

<p><b>Adım 5: Stoksuz kalma riski.</b> Ay sonunda adedi 0 olan ürün-ay sayısı:</p>
<pre class="dax">Stoksuz Ürün-Ay =
SUMX(
    VALUES(Urunler[UrunNo]),
    COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Stok Adedi] = 0))
)</pre>
<p><b>Bulgu:</b> 36 ayda toplam 17 ürün-ay stoksuz (2022’de 7, 2023’te 7, 2024’te 3). En sık stoksuz kalan <b>Çaydanlık Seti</b>: 4 ay. Bu ürün aynı zamanda en hızlı dönen ürün (2024 devir hızı 7,41; 49 gün). Türk Kahvesi Makinesi, 27" Monitör ve Dambıl Seti 10kg 2’şer ay stoksuz kaldı. 2024’te stoksuz kalanlar: Kürk Mantolu Madonna, Türk Kahvesi Makinesi, Çaydanlık Seti (1’er ay).</p>

<h2>4. Rapor sayfası taslağı</h2>
<div class="tbl-wrap"><table>
<tr><th>Konum</th><th>Görsel</th><th>Alanlar</th></tr>
<tr><td>Üst şerit</td><td>4 kart</td><td>Yıl sonu stok değeri, Ortalama stok, Stok devir hızı, Stokta kalma günü (yıl dilimleyicisine bağlı)</td></tr>
<tr><td>Sol orta</td><td>Çizgi ve kümelenmiş sütun grafik</td><td>X: YilAy; sütun: Stok Değeri; çizgi: Net Maliyet</td></tr>
<tr><td>Sağ orta</td><td>Çubuk grafik</td><td>Kategori; Stokta Kalma Günü; 180 gün sabit çizgisi (Analiz bölmesi)</td></tr>
<tr><td>Sol alt</td><td>Dağılım grafiği (Scatter)</td><td>X: Stok Devir Hızı, Y: Stok Değeri, ayrıntı: Urun, renk: ABC sınıfı. Sağ üstte kalan ürün yok; sol üst köşe aşırı stok.</td></tr>
<tr><td>Sağ alt</td><td>Tablo</td><td>Urun, Stok Adedi, Stok Değeri, Devir, Stokta Kalma Günü, Stoksuz Ürün-Ay; koşullu biçim</td></tr>
</table></div>

<h2>5. Bulgu özeti ve öneri</h2>
<ol>
<li><b>Koşu Bandı stokunu erit:</b> 41.564 ₺, toplam stokun %25’i, hiç satış yok. Kampanya, iade ya da başka kanala aktarma; yeni sipariş verme.</li>
<li><b>Spor kategorisinin devir hızı 1,04</b> (353 gün). Koşu Bandı çıkarıldığında kategoriyi yeniden ölç; Kamp Çadırı ve Robot Süpürge gibi yavaş ürünlerin sipariş miktarını düşür.</li>
<li><b>Hızlı dönenlerde emniyet stoku artır:</b> Çaydanlık Seti 36 ayın 4’ünde ay sonunda stoksuz; devir hızı 7,41. Yeniden sipariş noktasını yükselt.</li>
<li><b>C sınıfı stok payını hedefle:</b> şu an %31,6; satış payı %11,1. Hedef: C stok payını satış payına yaklaştırmak.</li>
<li>Görüntüler aylık olduğu için ay içi stoksuzluk görünmüyor. Haftalık ya da günlük stok hareketi verisi istenmeli.</li>
</ol>
`,
  ex: [
    { t:'dax', name:'Ortalama Stok (Ay Sonu)', q:'<b>Ortalama Stok (Ay Sonu)</b>: dönemdeki her ayın <code>[Stok Değeri]</code> ay sonu değerinin ortalamasını hesapla.',
      sol:'AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])', hint:'AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri]) — her ay için ölçü bağlam geçişiyle ay sonu değerini verir.' },
    { t:'dax', name:'Stok Devir Katsayısı', q:'<b>Stok Devir Katsayısı</b>: <code>[Net Maliyet]</code>’i ay sonu stok değerlerinin ortalamasına böl.',
      sol:'DIVIDE([Net Maliyet], AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri]))', hint:'DIVIDE([Net Maliyet], AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])).' },
    { t:'dax', name:'Stokta Bekleme Günü', q:'<b>Stokta Bekleme Günü</b>: dönemin gün sayısını (<code>DATEDIFF</code> ile, ilk ve son gün dâhil) stok devir hızına böl. Devir hızı = <code>[Net Maliyet]</code> ÷ ay sonu stok ortalaması.',
      sol:'VAR Gun = DATEDIFF(MIN(Tarih[Tarih]), MAX(Tarih[Tarih]), DAY) + 1\nVAR Devir = DIVIDE([Net Maliyet], AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri]))\nRETURN DIVIDE(Gun, Devir)',
      hint:'Gün sayısı ve devir hızını iki VAR’da hesapla; DIVIDE(Gun, Devir).' },
    { t:'dax', name:'Stoksuz Ay Sayısı', q:'<b>Stoksuz Ay Sayısı</b>: her ürün için ay sonu <code>[Stok Adedi]</code> değeri 0 olan ayları say ve ürünler üzerinden topla.',
      sol:'SUMX(VALUES(Urunler[UrunNo]), COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Stok Adedi] = 0)))',
      hint:'Dışta SUMX(VALUES(Urunler[UrunNo]), …), içte COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Stok Adedi] = 0)).' },
    { t:'mc', q:'Ürün tablosunda Koşu Bandı satırının <b>Stok Devir Hızı</b> hücresi boş (BLANK) görünüyor. Bunun anlamı nedir?',
      o:['Hiç satılmadığı için pay (maliyet) boş','Ürünün depoda hiç stoku kalmadığı için oran hesaplanamıyor','Ölçüdeki DIVIDE bu ürün için hata verip boş döndürüyor','Ürün 2024’te kataloğa yeni girdiği için geçmişi yok'], a:0,
      why:'DIVIDE(BLANK, 41.564) BLANK döndürür. Koşu Bandı’nın 4 adet, 41.564 ₺ stoku var ama hiç satışı yok. Boş hücreyi koşullu biçimle ya da ayrı bir “satışsız stok” ölçüsüyle görünür kıl.' },
    { t:'mc', q:'Çaydanlık Seti en hızlı dönen ürün (devir 7,41) ve 36 ayın 4’ünde ay sonunda stoksuz. Satın alma için doğru öneri hangisi?',
      o:['Ürünü katalogdan çıkarıp yerine benzerini koy','Fiyatı düşürerek talebi daha da artır','Daha seyrek ama toplu sipariş vermeye geç','Emniyet stoku ve sipariş noktasını yükselt'], a:3,
      why:'Hızlı dönen ve stoksuz kalan ürün kayıp satış demektir. Emniyet stoku ve sipariş noktası yükseltilir. Fiyatı düşürmek talebi daha da artırır; seyrek toplu sipariş stoksuz süreyi uzatabilir.' }
  ]
});

/* ---------- Vaka 4: E-ticaret dönüşüm hunisi ve kargo (C1) ---------- */
add('segmentasyon', {
  id: 'vaka-eticaret', lv: 'C1', mod: 'Vaka Çalışmaları', min: 30,
  title: 'Vaka: e-ticaret dönüşüm hunisi ve kargo',
  sum: 'E-ticaret müdürü sitedeki kaybın nerede olduğunu ve kargonun müşteri deneyimine etkisini soruyor. Huni adımlarını cihaz ve kaynağa göre kırar, Web ve Mobil kanalların sepet, iade ve teslim performansını ölçer, kargo süresiyle iade ve tekrar sipariş ilişkisini sınarsın.',
  body: `
<h2>1. Şirketin sorusu ve brif</h2>
<p><b>Kim soruyor?</b> E-ticaret müdürü. Yönetim kurulu mobil uygulamaya ek yatırım ve yeni bir kargo anlaşması için iki ayrı teklif bekliyor.</p>
<p><b>Hangi karar?</b></p>
<ol>
<li>Site ve uygulamada ziyaretçi en çok hangi adımda kayboluyor; düzeltme önce nereye yapılmalı?</li>
<li>Web ve Mobil kanal satışta, sepette ve iadede nasıl farklılaşıyor?</li>
<li>Kargo süresi iade ya da tekrar siparişi etkiliyor mu? Daha hızlı (ve pahalı) kargo anlaşmasına değer mi?</li>
</ol>

<h2>2. Veri ve model</h2>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>Kullanım</th></tr>
<tr><td><code>WebOlaylari</code></td><td>Ziyaretçi, adım (1 Ziyaret → 5 Satın alma), cihaz, kaynak. <code>Tarih</code> ile ilişkili.</td></tr>
<tr><td><code>Satislar</code></td><td>Kanal (Web, Mobil, Mağaza), durum, <code>KargoGun</code>, <code>TeslimTarihi</code>.</td></tr>
</table></div>
<p>Hazır ölçüler: <code>[Ziyaretçi]</code>, <code>[Dönüşüm Oranı %]</code>, <code>[Önceki Adıma Göre %]</code>, <code>[İlk Adıma Göre %]</code>, <code>[Ortalama Kargo Günü]</code>, <code>[Zamanında Teslim %]</code> (3 gün ve altı), <code>[İade Oranı %]</code>, <code>[Ortalama Sepet]</code>.</p>
<p><b>Veri sınırları:</b></p>
<ul>
<li><b>Web olayları yalnızca iki ay:</b> 01.10.2024 – 29.11.2024; 900 ziyaretçi, 2.019 olay. Mevsimsellik ve yıl karşılaştırması yapılamaz.</li>
<li><b>Ziyaretçi ile müşteri bağlı değil.</b> <code>ZiyaretciNo</code> ile <code>MusteriNo</code> arasında eşleşme yok. “Huniyi tamamlayan ziyaretçi ne aldı?” sorusu cevaplanamaz; huni ve sipariş analizi ayrı yürür.</li>
<li><b>Mağaza siparişlerinde kargo günü 0.</b> Mağaza, ortalama kargo gününü aşağı çeker ve “zamanında teslim”i %100 gösterir. Kargo analizinde yalnızca Web ve Mobil’i al.</li>
<li>İptal edilen siparişlerde <code>KargoGun</code> boş; iade edilenlerde dolu.</li>
</ul>

<h2>3. Analiz adımları</h2>
<p><b>Adım 1: Huni adımları ve adım dönüşümleri.</b> <code>WebOlaylari[AdimNo]</code> ve <code>[Adim]</code> satırda; değerlerde <code>[Ziyaretçi]</code>, <code>[Önceki Adıma Göre %]</code>, <code>[İlk Adıma Göre %]</code>.</p>
<div class="tbl-wrap"><table>
<tr><th>Adım</th><th>Ziyaretçi</th><th>Önceki adıma göre</th><th>İlk adıma göre</th></tr>
<tr><td>1 Ziyaret</td><td>900</td><td>–</td><td>%100</td></tr>
<tr><td>2 Ürün görüntüleme</td><td>640</td><td>%71,1</td><td>%71,1</td></tr>
<tr><td>3 Sepete ekleme</td><td>254</td><td><b>%39,7</b></td><td>%28,2</td></tr>
<tr><td>4 Ödeme</td><td>137</td><td>%53,9</td><td>%15,2</td></tr>
<tr><td>5 Satın alma</td><td>88</td><td>%64,2</td><td>%9,8</td></tr>
</table></div>
<p><b>Bulgu:</b> Genel dönüşüm <b>%9,8</b>. En büyük kayıp ürün görüntülemeden sepete geçişte: 640 kişiden 386’sı sepete eklemeden çıkıyor.</p>

<p><b>Adım 2: Cihaz ve kaynak kırılımı.</b> Huninin hangi adımının hangi cihazda koptuğunu görmek için sepetten satın almaya geçişi ayrı ölç:</p>
<pre class="dax">Sepetten Satın Alma % =
DIVIDE(
    CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 5),
    CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 3)
)</pre>
<div class="tbl-wrap"><table>
<tr><th>Cihaz</th><th>Ziyaret</th><th>Satın alma</th><th>Dönüşüm</th><th>Sepet → ödeme</th><th>Sepetten satın alma</th></tr>
<tr><td>Masaüstü</td><td>370</td><td>48</td><td>%13,0</td><td>%61,4</td><td>%42,1</td></tr>
<tr><td>Mobil</td><td>530</td><td>40</td><td><b>%7,5</b></td><td><b>%47,9</b></td><td><b>%28,6</b></td></tr>
</table></div>
<p><b>Bulgu:</b> Mobil trafiğin %59’unu getiriyor ama daha az satın alma üretiyor. Fark en çok sepetten sonra açılıyor: mobilde sepete ekleyenlerin yalnızca %47,9’u ödeme adımına geçiyor. Bu, mobil ödeme akışında bir sürtünme olduğunu düşündürür.</p>
<p>Kaynağa göre dönüşüm: E-posta %13,7 (124 ziyaretten 17), Doğrudan %11,9, Sosyal medya %11,5, Organik arama %9,5, <b>Reklam %6,5</b> (278 ziyaretten 18). Reklam en çok trafiği getirip en düşük dönüşümü veriyor.</p>

<p><b>Adım 3: Kanal performansı.</b> Hazır ölçüleri <code>Satislar[Kanal]</code> ile matrise koy (tüm dönem):</p>
<div class="tbl-wrap"><table>
<tr><th>Kanal</th><th>Net satış</th><th>Sipariş</th><th>Ortalama sepet</th><th>İade</th><th>İptal</th><th>Kargo günü</th><th>Zamanında</th></tr>
<tr><td>Mobil</td><td>599.841 ₺</td><td>386</td><td>1.554 ₺</td><td>%6,6</td><td>%4,6</td><td>3,80</td><td>%50,8</td></tr>
<tr><td>Web</td><td>457.331 ₺</td><td>322</td><td>1.420 ₺</td><td>%7,5</td><td><b>%11,6</b></td><td>3,47</td><td>%56,9</td></tr>
<tr><td>Mağaza</td><td>193.600 ₺</td><td>130</td><td>1.489 ₺</td><td>%5,2</td><td>%5,2</td><td>0</td><td>%100</td></tr>
</table></div>
<p>Web ve Mobil birlikte 1.057.172 ₺ ile net satışın %84,5’i. Kargo ölçülerini mağazasız hesapla:</p>
<pre class="dax">E-ticaret Kargo Günü =
CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web", "Mobil"})
E-ticaret Zamanında Teslim % =
CALCULATE([Zamanında Teslim %], Satislar[Kanal] IN {"Web", "Mobil"})</pre>
<p><b>Bulgu:</b> E-ticarette ortalama teslim <b>3,65 gün</b>, zamanında teslim <b>%53,5</b>. Mağaza dâhil edilince ortalama 3,12 gün, zamanında %60,2 görünüyordu: mağaza siparişleri kargo performansını olduğundan iyi gösteriyor. Mobil’in teslim süresi 2024’te 3,80 gün ve zamanında teslimi %48,9. Web’de ise iptal oranı (%11,6) diğer kanalların iki katından fazla.</p>

<p><b>Adım 4: Kargo süresi ve iade.</b></p>
<pre class="dax">İade Oranı (Kargo 0-3 Gün) % =
CALCULATE([İade Oranı %], Satislar[Kanal] IN {"Web", "Mobil"}, Satislar[KargoGun] &lt;= 3)
Kargo 7+ Gün İade % =
CALCULATE([İade Oranı %], Satislar[Kanal] IN {"Web", "Mobil"}, Satislar[KargoGun] &gt;= 7)</pre>
<div class="tbl-wrap"><table>
<tr><th>Kargo süresi (Web + Mobil)</th><th>Satır</th><th>İade oranı</th></tr>
<tr><td>0–3 gün</td><td>799</td><td>%5,4</td></tr>
<tr><td>4–6 gün</td><td>498</td><td>%8,2</td></tr>
<tr><td>7+ gün</td><td>94</td><td><b>%14,9</b></td></tr>
</table></div>
<p><b>Bulgu:</b> Teslim uzadıkça iade oranı yükseliyor: 7 gün ve üstünde gelen siparişlerde iade, 3 gün içinde gelenlerin yaklaşık 2,8 katı. Bu bir ilişkidir, kanıtlanmış neden değil: geç gelen ürünler belirli kategorilerde ya da bölgelerde toplanıyor olabilir. Kategori dilimleyicisiyle kontrol et.</p>
<div class="note"><b>Payda farkı</b>Kargo gününe göre filtrelediğinde iptal satırları (kargo günü boş) dışarıda kalır. Genel <code>[İade Oranı %]</code> ise iptalleri de paydaya katar. Karşılaştırırken iki oranı aynı tabanda tut.</div>

<p><b>Adım 5: Kargo süresi ve tekrar sipariş.</b> Soru: ilk siparişi geç gelen müşteri bir daha alıyor mu? Müşterinin ilk siparişinin kargo gününü ve sonrasındaki sipariş sayısını hesaplarız. Tekrar için zaman tanımak amacıyla yalnızca ilk siparişi 30.06.2024’e kadar olanları alırız.</p>
<pre class="dax">EVALUATE
VAR T =
    ADDCOLUMNS(
        CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal"),
        "Ilk", CALCULATE(MIN(Satislar[Tarih]), Satislar[Durum] &lt;&gt; "İptal")
    )
VAR T2 =
    ADDCOLUMNS(T,
        "IlkKargo", VAR d = [Ilk] RETURN CALCULATE(MAX(Satislar[KargoGun]), Satislar[Tarih] = d, Satislar[Durum] &lt;&gt; "İptal"),
        "IlkKanal", VAR d = [Ilk] RETURN CALCULATE(MAX(Satislar[Kanal]), Satislar[Tarih] = d, Satislar[Durum] &lt;&gt; "İptal"),
        "Sonra", VAR d = [Ilk] RETURN CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), Satislar[Tarih] &gt; d, Satislar[Durum] &lt;&gt; "İptal")
    )
VAR E = FILTER(T2, [IlkKanal] &lt;&gt; "Mağaza" &amp;&amp; NOT ISBLANK([IlkKargo]) &amp;&amp; [Ilk] &lt;= DATE(2024, 6, 30))
RETURN
    ROW(
        "Hızlı ilk teslim", COUNTROWS(FILTER(E, [IlkKargo] &lt;= 3)),
        "Hızlı, tekrar eden", COUNTROWS(FILTER(E, [IlkKargo] &lt;= 3 &amp;&amp; [Sonra] &gt; 0)),
        "Geç ilk teslim", COUNTROWS(FILTER(E, [IlkKargo] &gt; 3)),
        "Geç, tekrar eden", COUNTROWS(FILTER(E, [IlkKargo] &gt; 3 &amp;&amp; [Sonra] &gt; 0))
    )</pre>
<p><b>Bulgu:</b> İlk teslimi 3 gün içinde olan 43 müşterinin 43’ü (%100), geç olan 49 müşterinin 48’i (%98) tekrar sipariş vermiş. <b>Bu veride kargo süresiyle tekrar sipariş arasında anlamlı bir ilişki yok.</b> Neredeyse herkes tekrar ettiği için ölçü ayırt edici değil; bunu açıkça yaz, “ilişki bulamadık” da bir bulgudur.</p>

<h2>4. Rapor sayfası taslağı</h2>
<div class="tbl-wrap"><table>
<tr><th>Konum</th><th>Görsel</th><th>Alanlar</th></tr>
<tr><td>Üst şerit</td><td>4 kart</td><td>Ziyaretçi (900), Dönüşüm (%9,8), E-ticaret kargo günü (3,65), E-ticaret zamanında teslim (%53,5)</td></tr>
<tr><td>Sol orta</td><td>Huni (Funnel)</td><td>Kategori: Adim (AdimNo’ya göre sıralı); değer: Ziyaretçi; araç ipucu: Önceki Adıma Göre %</td></tr>
<tr><td>Sağ orta</td><td>Kümelenmiş çubuk</td><td>Adim × Cihaz; Önceki Adıma Göre % (mobil kopuşu görünür)</td></tr>
<tr><td>Orta şerit</td><td>Tablo</td><td>Kaynak; Ziyaret, Satın alma, Dönüşüm (koşullu biçim)</td></tr>
<tr><td>Sol alt</td><td>Matris</td><td>Kanal (Web, Mobil); Net Satış, Ortalama Sepet, İade, İptal, Kargo Günü, Zamanında</td></tr>
<tr><td>Sağ alt</td><td>Sütun grafik</td><td>Kargo süresi grubu (0–3, 4–6, 7+); İade Oranı %</td></tr>
<tr><td>Sayfa notu</td><td>Metin</td><td>“Web olayları: Ekim–Kasım 2024. Kargo ölçüleri mağazasız.”</td></tr>
</table></div>
<p>Huni görseli ve ayrıntılı huni ölçülerini <b>Analiz özellikleri ve yapay zekâ görselleri</b> ile <b>Segmentasyon</b> derslerindeki dilim mantığıyla birleştirebilirsin.</p>

<h2>5. Bulgu özeti ve öneri</h2>
<ol>
<li><b>Mobil ödeme akışını düzelt:</b> mobil dönüşüm %7,5, masaüstü %13,0; fark sepetten sonra açılıyor (sepetten satın alma %28,6’ya karşı %42,1). Mobil yatırım teklifinin önceliği ödeme adımı olsun.</li>
<li><b>Ürün sayfası → sepet</b> en büyük kayıp (640’tan 254’e). Fiyat, stok bilgisi ve kargo süresi ürün sayfasında görünür olmalı.</li>
<li><b>Reklam bütçesini sorgula:</b> en yüksek trafik (278 ziyaret), en düşük dönüşüm (%6,5). E-posta %13,7 ile en verimli kaynak.</li>
<li><b>Kargo anlaşması iade için anlamlı:</b> 7+ gün teslimde iade %14,9, 0–3 günde %5,4. Zamanında teslim yalnızca %53,5; hızlı kargo iadeyi azaltabilir. Tekrar sipariş üzerinde etkisi bu veride görülmedi.</li>
<li><b>Web iptal oranı %11,6:</b> nedenini (ödeme hatası, stok, fiyat değişimi) ayrı bir iptal nedeni sütunuyla izle.</li>
</ol>
`,
  ex: [
    { t:'dax', name:'Sepetten Satın Almaya %', q:'<b>Sepetten Satın Almaya %</b>: satın alma adımına (AdimNo 5) ulaşan ziyaretçiyi, sepete ekleme adımına (AdimNo 3) ulaşan ziyaretçiye böl.',
      sol:'DIVIDE(CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 5), CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 3))',
      hint:'İki CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = …) ifadesini DIVIDE ile böl.',
      grid:[{t:'WebOlaylari',c:'Cihaz'},{t:'WebOlaylari',c:'Kaynak'}] },
    { t:'dax', name:'Web ve Mobil Kargo Günü', q:'<b>Web ve Mobil Kargo Günü</b>: <code>[Ortalama Kargo Günü]</code> ölçüsünü yalnızca Web ve Mobil kanalları için hesapla (mağaza siparişlerini çıkar).',
      sol:'CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web", "Mobil"})',
      hint:'CALCULATE([Ortalama Kargo Günü], Satislar[Kanal] IN {"Web", "Mobil"}).' },
    { t:'dax', name:'Geç Teslim İade Oranı %', q:'<b>Geç Teslim İade Oranı %</b>: Web ve Mobil kanalında, kargo süresi 7 gün ve üstü olan satırlardaki <code>[İade Oranı %]</code>.',
      sol:'CALCULATE([İade Oranı %], Satislar[Kanal] IN {"Web", "Mobil"}, Satislar[KargoGun] >= 7)',
      hint:'CALCULATE içinde iki filtre: kanal listesi ve Satislar[KargoGun] >= 7.' },
    { t:'mc', q:'Mobilde ziyaretçinin %47,9’u sepetten ödemeye geçiyor, masaüstünde %61,4. Mobil yatırımında önceliğin ne olmalı?',
      o:['Mobil reklam bütçesini artırıp trafiği büyütmek','Ana sayfa tasarımını baştan yenilemek','Mobil ödeme akışını sadeleştirmek','Masaüstünü kapatmak'], a:2,
      why:'Mobil, trafik getirmekte zorlanmıyor (530 ziyaret); kopuş sepetten sonra açılıyor. Daha çok trafik ya da ana sayfa yenilemesi bu adımı düzeltmez. Ödeme adımlarını ve form alanlarını azaltmak doğrudan kopuşa yöneliktir.' },
    { t:'mc', q:'Kargo süresi ile tekrar sipariş arasında ilişki bulamadın (%100’e karşı %98). Raporda bunu nasıl ele almalısın?',
      o:['Bulguyu sonuç vermediği için rapordan çıkarırım','“İlişki görülmedi” diye yazarım','Eşiği değiştirip ilişki çıkana kadar denerim','Tekrar oranını iade oranıyla tek ölçüde birleştiririm'], a:1,
      why:'İlişki bulunamaması da karar için bilgidir: hızlı kargonun gerekçesi tekrar sipariş değil, iade olmalı. Eşikle oynayarak sonuç aramak yanıltıcı olur; bulguyu silmek ise yönetimin aynı soruyu tekrar sormasına yol açar.' }
  ]
});

/* ---------- Vaka 5: Satış performansı ve hedef takibi (B2) ---------- */
add('dashboard-tasarim', {
  id: 'vaka-satis', lv: 'B2', mod: 'Vaka Çalışmaları', min: 28,
  title: 'Vaka: satış performansı ve hedef takibi',
  sum: 'Satış müdürü 2024’ü kapatırken hedefe ne kadar yaklaştığını, hangi kategori ve temsilcinin öne çıktığını ve 2025 için neyi değiştireceğini soruyor. Kategori düzeyinde hedef gerçekleşme, YTD takibi, temsilci performansı, büyüme sırası ve dinamik yönetici özeti metnini kurarsın.',
  body: `
<h2>1. Şirketin sorusu ve brif</h2>
<p><b>Kim soruyor?</b> Satış Müdürü Elif Doğan. Ocak ayındaki yıl kapanış toplantısında yönetim kuruluna tek sayfalık bir performans raporu sunacak.</p>
<p><b>Hangi karar?</b> 2025 hedefleri kategori bazında nasıl dağıtılacak, temsilcilere prim nasıl hesaplanacak? Brifin soruları:</p>
<ol>
<li>2024’te hedefin ne kadarını gerçekleştirdik, yıl içinde nerede geride kaldık?</li>
<li>Hangi kategoriler hedefi tuttu, hangileri en çok büyüdü ya da yavaşladı?</li>
<li>Temsilcilerin performansı nasıl ve bu karşılaştırma adil mi?</li>
<li>Kartların üstünde tek cümlelik, seçime göre değişen bir yönetici özeti.</li>
</ol>
<p>Sayfa düzeni ve KPI ilkeleri için <b>Dashboard tasarımı: bir vaka çalışması</b>, farklı ayrıntı düzeyindeki hedefler için <b>Hedef ve gerçekleşen</b> dersine dayanıyoruz.</p>

<h2>2. Veri ve model</h2>
<div class="tbl-wrap"><table>
<tr><th>Tablo</th><th>Kullanım</th></tr>
<tr><td><code>Hedefler</code></td><td>Aylık (ayın ilk günü) ve kategori düzeyinde hedef; 2022-01 – 2024-12, 7 kategori × 36 ay = 252 satır.</td></tr>
<tr><td><code>Kategoriler</code></td><td>Hedefler ve Urunler’in ortak boyutu. <b>Kategori kırılımı her zaman bu tablodan</b> alınmalı.</td></tr>
<tr><td><code>Satislar</code> → <code>Calisanlar</code></td><td><code>Satislar[TemsilciNo]</code> çoka-bir <code>Calisanlar[CalisanNo]</code>. Temsilci adı <code>Calisanlar[AdSoyad]</code>.</td></tr>
</table></div>
<p><b>Veri sınırları:</b></p>
<ul>
<li><b>Doğru boyut:</b> Hedefler, <code>Urunler</code> ile değil <code>Kategoriler</code> ile ilişkili. Matrise <code>Urunler[Kategori]</code> koyarsan <code>[Hedef]</code> her satırda toplamı gösterir. <code>Kategoriler[Kategori]</code> kullan.</li>
<li><b>Temsilci hedefi yok:</b> hedefler yalnızca kategori düzeyinde. Temsilci için “hedef gerçekleşme” hesaplanamaz; sıralama ve büyüme ile yetinilir.</li>
<li><b>Temsilci ataması geriye dönük:</b> <code>Satislar[TemsilciNo]</code> 1.620 satırın tamamında müşterinin bugünkü temsilcisiyle (<code>Musteriler[TemsilciNo]</code>) aynı. Müşteri devredildiğinde geçmiş satışlar da yeni temsilciye geçmiş. Aşağıda bunun sonuçlarını görüyoruz.</li>
</ul>

<h2>3. Analiz adımları</h2>
<p><b>Adım 1: Yıllık hedef gerçekleşme.</b> Hazır <code>[Hedef]</code>, <code>[Hedef Gerçekleşme %]</code>, <code>[Hedef Farkı]</code> ölçüleri.</p>
<p><b>Bulgu:</b> 2024 net satış <b>747.066 ₺</b>, hedef 763.200 ₺: gerçekleşme <b>%97,9</b>, açık 16.134 ₺. Geçen yıla göre büyüme %86,4. Çeyreklere göre: Ç1 %98,2, <b>Ç2 %93,6</b>, Ç3 %96,4, Ç4 %101,4. Hedefi aşan tek çeyrek Ç4. Aylık bazda 12 ayın yalnızca ikisinde (Ağustos ve Aralık) hedef aşıldı.</p>

<p><b>Adım 2: YTD hedef gerçekleşme.</b> Yöneticiler “yılbaşından bu yana neredeyiz?” sorusunu sorar. Hazır <code>[Satış YTD]</code> ve <code>[Hedef YTD]</code> ile:</p>
<pre class="dax">Hedef Gerçekleşme YTD % = DIVIDE([Satış YTD], [Hedef YTD])
Hedef Açığı YTD = [Satış YTD] - [Hedef YTD]</pre>
<p><b>Bulgu:</b> 2024’te YTD gerçekleşme yıl boyunca %95,9 ile %98,2 arasında kaldı. En düşük nokta Haziran sonu (%95,9; açık 12.707 ₺). Aralık’taki güçlü ay (94.001 ₺, hedef 88.400 ₺) yılı %97,9’a taşıdı. Yani açık yılın ilk yarısında oluştu, ikinci yarıda kısmen kapandı.</p>

<p><b>Adım 3: Kategori bazında hedef ve büyüme.</b></p>
<pre class="dax">Büyüme Sırası =
IF(
    HASONEVALUE(Kategoriler[Kategori]),
    RANKX(ALL(Kategoriler[Kategori]), [YoY %])
)</pre>
<div class="tbl-wrap"><table>
<tr><th>Kategori (2024)</th><th>Net satış</th><th>Hedef gerçekleşme</th><th>Büyüme (2023’e göre)</th><th>Büyüme sırası</th></tr>
<tr><td>Kozmetik</td><td>82.908 ₺</td><td>%98,7</td><td>+%116,6</td><td>1</td></tr>
<tr><td>Ev &amp; Yaşam</td><td>144.292 ₺</td><td>%96,6</td><td>+%115,0</td><td>2</td></tr>
<tr><td>Kitap</td><td>95.327 ₺</td><td><b>%100,2</b></td><td>+%112,4</td><td>3</td></tr>
<tr><td>Elektronik</td><td>206.432 ₺</td><td>%96,8</td><td>+%94,5</td><td>4</td></tr>
<tr><td>Hediye</td><td>9.700 ₺</td><td><b>%83,6</b></td><td>+%71,1</td><td>5</td></tr>
<tr><td>Giyim</td><td>110.090 ₺</td><td>%99,5</td><td>+%60,7</td><td>6</td></tr>
<tr><td>Spor</td><td>98.317 ₺</td><td>%99,1</td><td><b>+%39,9</b></td><td>7</td></tr>
</table></div>
<p><b>Bulgu:</b> Hedefi aşan tek kategori Kitap (%100,2). Hediye %83,6 ile en geride; açığın 1.900 ₺’si burada. 2024’te <b>küçülen kategori yok</b>; en yavaş büyüyen Spor (+%39,9). Dikkat: Spor ve Giyim hedefe çok yakın ama yavaş büyüyor. Bu, hedeflerin bu kategorilerde düşük konduğunu gösterebilir.</p>

<p><b>Adım 4: Temsilci performansı.</b> İlişki modelde var; <code>Calisanlar[AdSoyad]</code>’ı satıra koy, hazır <code>[Temsilci Sırası]</code> ve <code>[YoY %]</code> ölçülerini ekle.</p>
<div class="tbl-wrap"><table>
<tr><th>Temsilci (2024)</th><th>Net satış</th><th>Müşteri</th><th>Ortalama sepet</th><th>Büyüme</th></tr>
<tr><td>Gamze Özkan</td><td>150.012 ₺</td><td>20</td><td>1.875 ₺</td><td>+%105</td></tr>
<tr><td>Yusuf Kara</td><td>149.376 ₺</td><td>21</td><td>1.606 ₺</td><td>+%108</td></tr>
<tr><td>Can Aydın</td><td>138.653 ₺</td><td>18</td><td>1.671 ₺</td><td>+%82</td></tr>
<tr><td>Ece Kurt</td><td>109.374 ₺</td><td>20</td><td>1.420 ₺</td><td>+%238</td></tr>
<tr><td>Elif Doğan (müdür)</td><td>105.770 ₺</td><td>21</td><td>1.290 ₺</td><td>+%45</td></tr>
<tr><td>Oğuz Demir</td><td>93.881 ₺</td><td>23</td><td>1.204 ₺</td><td>+%26</td></tr>
</table></div>
<p>Tablo adil mi? Yusuf Kara 09.07.2024’te işe girmiş. Yine de işe girişinden önceki tarihli satışlar ona yazılı:</p>
<pre class="dax">İşe Girişten Önceki Satış =
SUMX(
    VALUES(Calisanlar[CalisanNo]),
    VAR Giris = CALCULATE(MAX(Calisanlar[IseGiris]))
    RETURN CALCULATE([Net Satış], Satislar[Tarih] &lt; Giris)
)</pre>
<p><b>Bulgu:</b> Toplam <b>163.810 ₺</b> satış, temsilcinin işe girişinden önceki tarihli. Bunun 140.318 ₺’si Yusuf Kara’da; 2024’teki 149.376 ₺’sinin 54.741 ₺’si işe girişinden önce. Can Aydın’da 21.701 ₺, Oğuz Demir’de 1.791 ₺. Neden: temsilci, sipariş anındaki değil müşterinin bugünkü temsilcisi. Bu veriyle temsilci primi hesaplanırsa yanlış kişiye ödeme yapılır.</p>
<div class="warn"><b>Prim için kullanmadan önce</b>Kaynak sistemden sipariş anındaki temsilciyi (<code>SiparisTemsilciNo</code>) iste ya da müşteri-temsilci atama geçmişini tarihli bir tabloyla modele ekle. O zamana kadar temsilci tablosunu “portföy performansı” olarak adlandır.</div>

<p><b>Adım 5: Yönetici özeti metni.</b> Kartların üstüne, seçime göre değişen bir cümle. Modeldeki <code>[Yönetici Özeti Metni]</code> büyüme ve kanalı anlatıyor; bu vaka için hedef odaklı bir sürüm yazıyoruz:</p>
<pre class="dax">Hedef Özeti Metni =
VAR Satis = [Satış YTD]
VAR Hedef = [Hedef YTD]
VAR Oran = DIVIDE(Satis, Hedef)
VAR Kat =
    FILTER(
        ADDCOLUMNS(VALUES(Kategoriler[Kategori]), "O", DIVIDE([Satış YTD], [Hedef YTD])),
        NOT ISBLANK([O])
    )
VAR EnGeri = TOPN(1, Kat, [O], ASC)
VAR Temsilci = FILTER(ADDCOLUMNS(VALUES(Calisanlar[AdSoyad]), "S", [Satış YTD]), NOT ISBLANK([S]))
VAR EnIyi = TOPN(1, Temsilci, [S], DESC)
VAR Cumle1 = "YTD satış " &amp; FORMAT(Satis, "#,##0") &amp; " ₺, hedef gerçekleşmesi %" &amp; FORMAT(Oran * 100, "0.0")
VAR Cumle2 = IF(Satis &gt;= Hedef, " (hedef aşıldı).", " (açık " &amp; FORMAT(Hedef - Satis, "#,##0") &amp; " ₺).")
VAR Cumle3 = " En geride kalan kategori: " &amp; MAXX(EnGeri, Kategoriler[Kategori]) &amp; " (%" &amp; FORMAT(MAXX(EnGeri, [O]) * 100, "0.0") &amp; ")."
VAR Cumle4 = " En yüksek portföy: " &amp; MAXX(EnIyi, Calisanlar[AdSoyad]) &amp; "."
RETURN
    IF(ISBLANK(Hedef), "Seçimde hedef yok.", Cumle1 &amp; Cumle2 &amp; Cumle3 &amp; Cumle4)</pre>
<p><b>Bulgu (2024 seçili):</b> “YTD satış 747.066 ₺, hedef gerçekleşmesi %97,9 (açık 16.134 ₺). En geride kalan kategori: Hediye (%83,6). En yüksek portföy: Gamze Özkan.” Haziran 2024 seçilince metin “%95,9 (açık 12.707 ₺)” olur; 2023 seçilince en yüksek portföy Can Aydın’a geçer. Türkçede yüzde işareti sayının önüne gelir; bu yüzden <code>"0.0%"</code> biçimi yerine <code>"%" &amp; FORMAT(Oran * 100, "0.0")</code> kullandık.</p>

<h2>4. Rapor sayfası taslağı</h2>
<div class="tbl-wrap"><table>
<tr><th>Konum</th><th>Görsel</th><th>Alanlar</th></tr>
<tr><td>En üst</td><td>Kart (metin)</td><td>Hedef Özeti Metni</td></tr>
<tr><td>Üst şerit</td><td>3 KPI görseli</td><td>Satış YTD / Hedef YTD; Hedef Gerçekleşme YTD %; YoY %</td></tr>
<tr><td>Sol orta</td><td>Çizgi grafik</td><td>X: YilAy (2024); çizgiler: Satış YTD ve Hedef YTD (açığın nerede açıldığı görünür)</td></tr>
<tr><td>Sağ orta</td><td>Madde grafiği tarzı çubuk</td><td>Kategoriler[Kategori]; çubuk: Net Satış; hedef işareti: Hedef; renk: gerçekleşme %100’ün altı/üstü</td></tr>
<tr><td>Sol alt</td><td>Tablo</td><td>Kategori; YoY %, Büyüme Sırası (koşullu biçim)</td></tr>
<tr><td>Sağ alt</td><td>Tablo</td><td>Temsilci (portföy); Net Satış, Müşteri, Ortalama Sepet, YoY %; alt bilgi: “Temsilci ataması geriye dönüktür.”</td></tr>
<tr><td>Dilimleyici</td><td>Yıl, Kanal</td><td>Sağ üst köşe</td></tr>
</table></div>

<h2>5. Bulgu özeti ve öneri</h2>
<ol>
<li><b>Hedefin %97,9’u gerçekleşti</b> (açık 16.134 ₺); açık Ç2’de (%93,6) oluştu. 2025’te Nisan–Haziran için erken uyarı: YTD gerçekleşme %97’nin altına inerse aylık aksiyon toplantısı.</li>
<li><b>Hediye kategorisi %83,6</b> ile tek büyük sapma. Ya hedef gerçekçi değil ya kategori desteklenmiyor; 2025 hedefini geçmiş büyümeye (+%71) göre yeniden kur.</li>
<li><b>Hedef dağılımını büyümeye göre güncelle:</b> Spor (+%39,9) ve Giyim (+%60,7) hedefe yakın ama yavaş büyüyor; Kozmetik ve Ev &amp; Yaşam iki kattan fazla büyüdü.</li>
<li><b>Temsilci primini bu veriyle hesaplama:</b> 163.810 ₺ satış, temsilcinin işe girişinden önce. Sipariş anındaki temsilci bilgisi kaynak sistemden alınmalı.</li>
<li>Rapordaki tüm kategori görsellerinde <code>Kategoriler[Kategori]</code> kullan; hedef ölçüleri <code>Urunler[Kategori]</code> ile yanlış sonuç verir.</li>
</ol>
`,
  ex: [
    { t:'dax', name:'YTD Hedef Gerçekleşme %', q:'<b>YTD Hedef Gerçekleşme %</b>: hazır <code>[Satış YTD]</code> ölçüsünü <code>[Hedef YTD]</code> ölçüsüne böl.',
      sol:'DIVIDE([Satış YTD], [Hedef YTD])', hint:'DIVIDE([Satış YTD], [Hedef YTD]).' },
    { t:'dax', name:'YTD Hedef Açığı', q:'<b>YTD Hedef Açığı</b>: yılbaşından bu yana gerçekleşen satıştan yılbaşından bu yana hedefi çıkar. Hedefin olmadığı yerde BLANK döndür.',
      sol:'VAR H = [Hedef YTD]\nRETURN IF(NOT ISBLANK(H), [Satış YTD] - H)', hint:'Hedefi bir VAR’a al; IF(NOT ISBLANK(H), [Satış YTD] - H).' },
    { t:'dax', name:'Kategori Büyüme Sırası', q:'<b>Kategori Büyüme Sırası</b>: tek bir kategori seçiliyken kategorileri <code>[YoY %]</code> değerine göre sırala (en hızlı büyüyen 1). Birden fazla kategori varsa BLANK döndür.',
      sol:'IF(HASONEVALUE(Kategoriler[Kategori]), RANKX(ALL(Kategoriler[Kategori]), [YoY %]))',
      hint:'IF(HASONEVALUE(Kategoriler[Kategori]), RANKX(ALL(Kategoriler[Kategori]), [YoY %])).',
      grid:[{t:'Kategoriler',c:'Kategori'}] },
    { t:'query', q:'2024 için temsilci portföy tablosu: <code>Calisanlar[AdSoyad]</code> başına <code>[Net Satış]</code> ve <code>[Müşteri Sayısı]</code>; satışı olmayan çalışanları çıkar.',
      start:'EVALUATE\n',
      sol:'EVALUATE\nFILTER(\n    CALCULATETABLE(\n        ADDCOLUMNS(VALUES(Calisanlar[AdSoyad]), "Satış", [Net Satış], "Müşteri", [Müşteri Sayısı]),\n        Tarih[Yil] = 2024\n    ),\n    NOT ISBLANK([Satış])\n)',
      hint:'CALCULATETABLE(ADDCOLUMNS(VALUES(Calisanlar[AdSoyad]), …), Tarih[Yil] = 2024) sonucunu FILTER ile boş satışlardan arındır.' },
    { t:'mc', q:'Matriste <code>Urunler[Kategori]</code> satıra konunca <code>[Hedef]</code> her satırda aynı (toplam) değeri gösteriyor. Neden?',
      o:['Hedef ölçüsü SUM yerine SUMX ile yazılmalıydı','Hedefler tablosu aylık değil günlük ayrıntıda tutuluyor','Satış ve hedef farklı para birimlerinde saklanıyor','Hedefler Kategoriler ile ilişkili, Urunler ile değil'], a:3,
      why:'Filtre yalnızca ilişkiler boyunca bir taraftan çok tarafa akar. Urunler[Kategori] filtresi Hedefler’e giden yolda değildir; Kategoriler[Kategori] ise hem Urunler’e hem Hedefler’e akar.' },
    { t:'mc', q:'Yusuf Kara Temmuz 2024’te işe girmiş ama 2023 satışları da ona yazılı. Prim kararı için doğru adım hangisi?',
      o:['Primi bu tabloya göre olduğu gibi öde','Sipariş anındaki temsilciyi iste','Yusuf Kara’yı gizle','Yalnızca 2024 satışlarını kullanarak öde'], a:1,
      why:'Satislar[TemsilciNo] müşterinin bugünkü temsilcisidir; 2024 içinde bile 54.741 ₺ satış işe girişten önce. Gizlemek ya da yılı daraltmak sorunu çözmez; sipariş anındaki temsilci ya da tarihli atama geçmişi gerekir.' }
  ]
});

})(window);
