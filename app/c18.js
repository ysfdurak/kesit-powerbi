/* Kesit Power BI — dört yeni ders: veri okuryazarlığı, rapordan karara, Power BI ortamını yönetmek, BI projesini baştan sona yürütmek. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- 1 · Başlangıç · veri okuryazarlığı ---------- */
add('dashboard-kavramlar', {
  id: 'veri-okuryazarligi', lv: 'A2', mod: 'Başlangıç', min: 22,
  title: 'Veri okuryazarlığı: rakamı doğru okumak ve doğru soruyu sormak',
  sum: 'Ortalama ile medyan, yüzde ile yüzde puan, küçük taban etkisi, korelasyon ile nedensellik, Simpson paradoksu, yanıltan grafikler, örneklem ve mevsimsellik. Yöneticinin analiste sorması gereken sorular.',
  body: `
<p>Bir rapor doğru hesaplanmış olabilir ama yine de yanlış okunabilir. “Ortalama sepet 1.500 ₺”, “iade %19 düştü”, “Giyim %492 büyüdü” gibi cümleler doğrudur; ama hepsi bir bağlam ister. Bu ders formül yazmayı değil, <b>rakamı okumayı</b> öğretiyor. Örneklerin tamamı Anadolu Market modelinden hesaplandı.</p>

<h2>Ortalama mı, medyan mı?</h2>
<p><b>Ortalama (mean)</b> bütün değerleri toplar ve sayıya böler. <b>Medyan (median)</b> değerleri sıraya dizer ve tam ortadakini alır. Değerler simetrik dağılıyorsa ikisi yakındır. Birkaç çok büyük değer varsa ortalama yukarı kayar, medyan yerinde kalır.</p>
<p>Anadolu Market’te iptal edilmemiş 838 sipariş var. Sipariş tutarlarına bakalım:</p>
<div class="tbl-wrap"><table>
<tr><th>Gösterge</th><th>Değer</th></tr>
<tr><td>Ortalama sipariş tutarı ([Ortalama Sepet])</td><td>1.492,57 ₺</td></tr>
<tr><td>Medyan sipariş tutarı</td><td>1.086,50 ₺</td></tr>
<tr><td>En küçük / en büyük sipariş</td><td>71 ₺ / 12.335,45 ₺</td></tr>
<tr><td>Ortalamanın üstündeki sipariş sayısı</td><td>278 (yaklaşık üçte biri)</td></tr>
</table></div>
<p>Yani “tipik müşterimiz 1.500 ₺ harcıyor” cümlesi yanlıştır. Siparişlerin yarısı 1.086,50 ₺’nin altında kalıyor; ortalamayı birkaç büyük sipariş çekiyor. Kategori içinde fark daha da büyük: Elektronik’te ortalama 1.570,85 ₺, medyan ise 809 ₺.</p>
<p>Dağılımın kuyruğunu görmek için bir yüzdelik de işe yarar. Aşağıdaki ölçü, siparişlerin %90’ının altında kaldığı tutarı verir (bu modelde 2.879,60 ₺):</p>
<pre class="dax">Sipariş Tutarı P90 =
PERCENTILEX.INC(
    CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] &lt;&gt; "İptal"),
    CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] &lt;&gt; "İptal"),
    0.9
)</pre>
<div class="tip"><b>Kural</b>Tutar, süre, maaş gibi sağa çarpık (birkaç çok büyük değeri olan) verilerde ortalamanın yanına medyanı da koy. İkisi çok farklıysa bunu raporda söyle. İstatistik fonksiyonlarının ayrıntısı “Temel istatistik, gruplama ve kutulama” dersinde.</div>

<h2>Yüzde değişim ve yüzde puan</h2>
<p>Bir oran değiştiğinde iki farklı şey söylenebilir:</p>
<ul>
<li><b>Yüzde puan (pp) farkı:</b> Yeni oran eksi eski oran. %7,27’den %5,91’e inen iade oranı <b>1,37 puan</b> düşmüştür.</li>
<li><b>Göreli (yüzde) değişim:</b> Farkın eski orana bölümü. Aynı düşüş <b>%18,8</b>’lik bir azalmadır.</li>
</ul>
<div class="tbl-wrap"><table>
<tr><th>Oran</th><th>2023</th><th>2024</th><th>Puan farkı</th><th>Göreli değişim</th></tr>
<tr><td>İade oranı (satır bazında)</td><td>%7,27</td><td>%5,91</td><td>−1,37 puan</td><td>−%18,8</td></tr>
<tr><td>Kâr marjı</td><td>%31,91</td><td>%38,63</td><td>+6,71 puan</td><td>+%21,0</td></tr>
</table></div>
<p>İkisi de doğrudur ama farklı izlenim bırakır. “İade %18,8 düştü” cümlesi kulağa büyük gelir; “iade 1,37 puan düştü” daha ölçülüdür. Oranlarda hangisini kullandığını <b>her zaman</b> yaz. Puan farkını DAX’ta şöyle hesaplarsın:</p>
<pre class="dax">İade Oranı Puan Farkı =
VAR BuDonem = [İade Oranı %]
VAR OncekiYil = CALCULATE([İade Oranı %], SAMEPERIODLASTYEAR(Tarih[Tarih]))
RETURN
    IF(NOT ISBLANK(OncekiYil), (BuDonem - OncekiYil) * 100)</pre>
<p>Sonuç “puan” birimindedir; yüzde biçimi verme, yanına “puan” yaz.</p>

<h2>Küçük taban etkisi</h2>
<p>Taban küçükse küçük bir artış dev bir yüzde üretir. Anadolu Market’in verisi <b>22 Haziran 2022</b>’de başlıyor; 2022 yarım bir yıl. Bu yüzden 2023’ün geçen yıla göre büyümesi <b>%289,8</b> çıkıyor. Giyim kategorisinde 11.576 ₺’den 68.502,45 ₺’ye çıkış <b>%491,8</b> görünüyor. Bunlar şirketin performansını değil, eksik başlangıç yılını anlatır.</p>
<p>Aynı tuzak küçük kategorilerde de var:</p>
<div class="tbl-wrap"><table>
<tr><th>Karşılaştırma</th><th>Yüzde</th><th>Tutar olarak</th></tr>
<tr><td>Hediye, 2023 / 2022</td><td>+%183,5</td><td>+3.670 ₺</td></tr>
<tr><td>Elektronik, 2024 / 2023</td><td>+%94,5</td><td>+100.284,95 ₺</td></tr>
</table></div>
<p>Yüzdeye bakan Hediye’yi yıldız sanar; tutara bakan Elektronik’in şirkete 27 kat daha fazla ek satış getirdiğini görür. <b>Yüzdeyi her zaman mutlak değerle birlikte göster.</b></p>

<h2>Korelasyon nedensellik değildir</h2>
<p>İki sayı birlikte artıyorsa biri diğerine sebep olmayabilir. Örnek: Anadolu Market’te ortalama indirim oranı yıllara göre %2,35 → %3,11 → %3,33 arttı; net satış da 102.837 ₺ → 400.870 ₺ → 747.066 ₺ oldu. “İndirim arttı, satış patladı; o hâlde indirimi artıralım” demek cazip. Ama aynı yıllarda satın alan müşteri sayısı da 32 → 77 → 123 oldu. Satışı büyüten asıl şey müşteri tabanının büyümesi olabilir. İkisini birlikte etkileyen üçüncü bir etkene <b>karıştırıcı değişken (confounder)</b> denir; burada zaman ve şirketin büyümesi.</p>
<p>Nedensellik için ya kontrollü bir deney (aynı dönemde bir grup indirim alır, bir grup almaz) ya da karıştırıcıları sabit tutan bir kıyas gerekir. Dağılım grafiği ve korelasyon katsayısı “Keşifçi veri analizi” dersinde.</p>

<h2>Simpson paradoksu</h2>
<p><b>Simpson paradoksu</b>, bir oranın toplamda bir yöne, alt gruplarda ise ters yöne işaret etmesidir. Sebep, grupların büyüklüklerinin (karışımın) farklı olmasıdır.</p>
<p>Bu modelde gerçek bir örnek aradık: iade, iptal, kâr marjı, zamanında teslim ve indirimli satış payı oranlarını kanal, segment, bölge, yaş grubu, cinsiyet, yıl, kategori ve indirim bandına göre ikili ikili karşılaştırdık. Yeterli satırı olan <b>gerçek bir tersine dönme bulamadık</b>. Bu yüzden aşağıda açıkça <b>örnek amaçlı</b>, uydurma küçük bir tablo kullanıyoruz: iki kargo firması, yakın ve uzak gönderiler.</p>
<pre class="dax">EVALUATE
VAR Gonderiler =
    DATATABLE(
        "Firma", STRING, "Mesafe", STRING, "Gonderi", INTEGER, "Zamaninda", INTEGER,
        {
            {"A", "Yakın", 200, 180}, {"A", "Uzak", 600, 300},
            {"B", "Yakın", 600, 510}, {"B", "Uzak", 200, 90}
        }
    )
RETURN
    ADDCOLUMNS(
        DISTINCT(SELECTCOLUMNS(Gonderiler, "Firma", [Firma])),
        "Genel Oran",
            VAR F = [Firma]
            RETURN DIVIDE(
                SUMX(FILTER(Gonderiler, [Firma] = F), [Zamaninda]),
                SUMX(FILTER(Gonderiler, [Firma] = F), [Gonderi])
            )
    )</pre>
<div class="tbl-wrap"><table>
<tr><th>Firma</th><th>Yakın</th><th>Uzak</th><th>Genel</th></tr>
<tr><td>A</td><td>%90 (200 gönderi)</td><td>%50 (600 gönderi)</td><td>%60</td></tr>
<tr><td>B</td><td>%85 (600 gönderi)</td><td>%45 (200 gönderi)</td><td>%75</td></tr>
</table></div>
<p>A firması hem yakında hem uzakta daha iyi; ama genelde B önde görünüyor. Çünkü A’ya zor işler (uzak gönderiler) verilmiş. Toplam oran, işin karışımını da ölçer. Bir oranı karşılaştırmadan önce sor: <b>“Gruplar aynı karışımda mı?”</b></p>

<h2>Yanıltan grafikler</h2>
<ul>
<li><b>Kesik eksen:</b> Mobil kanal 599.841 ₺, Web 457.331 ₺ sattı; Mobil 1,31 kat büyük. Sütun grafiğinde eksen 400.000’den başlarsa çubuklar 3,49 kat farklı görünür. Sütun ve çubuk grafiklerde eksen sıfırdan başlamalı. Çizgi grafikte kesik eksen kabul edilebilir, ama eksen değerleri görünür olmalı.</li>
<li><b>İkili eksen:</b> İki farklı ölçeği aynı grafiğe koyunca çizgilerin kesiştiği nokta tamamen eksen ayarına bağlıdır. Okuyucu “satış hedefi geçti” sanabilir. Ayrıntı “Görsel algı” dersinde.</li>
<li><b>Kümülatif ile dönem:</b> Nisan 2024’te aylık satış bir önceki aya göre <b>%45,9 düştü</b> (63.252 ₺ → 34.234 ₺). Aynı ay kümülatif satış 659.098 ₺’den 693.331 ₺’ye <b>çıktı</b>. Kümülatif eğri hiç düşmez; düşüşü gizler. Grafiğin başlığında hangisi olduğunu yaz.</li>
</ul>

<h2>Örneklem büyüklüğü ve mevsimsellik</h2>
<p><b>Örneklem:</b> 2022’nin iade oranı %12,38. Kulağa kötü geliyor, ama bu oran yalnızca 105 satırdan (13 iade) çıkıyor. 2024’te 965 satır var. Birkaç iade küçük grubun oranını çok oynatır. Bir oranın yanına her zaman “kaç kayıttan?” bilgisini koy (araç ipucuna satır sayısı eklemek kolay bir yöntem).</p>
<p><b>Mevsimsellik:</b> Aralık 2024 satışı Kasım’a göre %5,6 arttı. Bir yıl önce ise Aralık, Kasım’a göre %22,1 düşmüştü. Ay-ay kıyas, mevsimin etkisini büyümeyle karıştırır. Mevsimi olan işlerde asıl soru <b>geçen yılın aynı ayıyla</b> kıyastır: Aralık 2024, Aralık 2023’ün %115,8 üstünde. Mevsimsellik ayrıntısı “Zaman serisi analizi” dersinde.</p>

<h2>Yöneticinin analiste sorması gereken sorular</h2>
<ol>
<li><b>Neye göre?</b> Hedefe mi, geçen yıla mı, önceki aya mı?</li>
<li><b>Tanım ne?</b> “Satış” iptalleri, iadeleri, indirimi içeriyor mu?</li>
<li><b>Kaç kayıttan?</b> Oran kaç sipariş ya da müşteriden çıkıyor?</li>
<li><b>Ortalama mı, medyan mı?</b> Birkaç büyük değer tabloyu çarpıtıyor mu?</li>
<li><b>Puan mı, yüzde mi?</b> Oran değişiminde hangisi yazıldı?</li>
<li><b>Tutar olarak ne kadar?</b> Büyük yüzde küçük bir tabandan mı geliyor?</li>
<li><b>Karışım değişti mi?</b> Toplam oran, grupların ağırlığı değiştiği için mi oynadı?</li>
<li><b>Başka ne açıklayabilir?</b> Mevsim, kampanya, veri eksikliği, tanım değişikliği?</li>
<li><b>Veri ne kadar taze?</b> Son yenileme ne zaman, eksik gün var mı?</li>
</ol>
<div class="note"><b>İyi bir analist bu soruları sevmez değil, bekler</b>Bu sorular güvensizlik işareti değildir. Cevaplarını raporun içine (araç ipucu, dipnot, tanım sayfası) koyan bir rapor, toplantıda daha az soruyla karşılaşır.</div>
`,
  ex: [
    { t: 'dax', name: 'Medyan Sipariş Tutarı',
      q: '<b>Medyan Sipariş Tutarı</b>: İptal edilmemiş siparişlerin tutarlarını sipariş düzeyinde topla ve bu sipariş tutarlarının medyanını döndür. (Toplamda 1.086,50 ₺ çıkmalı.)',
      sol: 'MEDIANX(CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal"), CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal"))',
      hint: 'MEDIANX bir tablo üzerinde dolaşır. Tablo: iptal olmayan satırlardaki VALUES(Satislar[SiparisNo]) (CALCULATETABLE ile). İfade: CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal"); CALCULATE her siparişi kendi satırlarına süzer.' },
    { t: 'dax', name: 'Kâr Marjı Puan Farkı',
      q: '<b>Kâr Marjı Puan Farkı</b>: [Kâr Marjı %] ölçüsünün geçen yılın aynı dönemine göre farkını <b>yüzde puan</b> olarak döndür (ör. 0,3863 − 0,3191 → 6,71). Geçen yıl yoksa boş kalsın.',
      sol: 'VAR Bu = [Kâr Marjı %] VAR Once = CALCULATE([Kâr Marjı %], SAMEPERIODLASTYEAR(Tarih[Tarih])) RETURN IF(NOT ISBLANK(Once), (Bu - Once) * 100)',
      hint: 'Geçen yılın marjı: CALCULATE([Kâr Marjı %], SAMEPERIODLASTYEAR(Tarih[Tarih])). Farkı 100 ile çarp. IF(NOT ISBLANK(...)) ile ilk yılı boş bırak.' },
    { t: 'dax', name: 'Kurumsal İade Oranı',
      q: '<b>Kurumsal İade Oranı</b>: Yalnızca Kurumsal segmentteki müşterilerin satış satırlarında, durumu "İade" olan satırların tüm satırlara oranı.',
      sol: 'DIVIDE(CALCULATE(COUNTROWS(Satislar), Satislar[Durum] = "İade", Musteriler[Segment] = "Kurumsal"), CALCULATE(COUNTROWS(Satislar), Musteriler[Segment] = "Kurumsal"))',
      hint: 'Pay ve paydaya aynı segment filtresini koy: Musteriler[Segment] = "Kurumsal". Paya ek olarak Satislar[Durum] = "İade". Hazır [İade Oranı %] ölçüsünü CALCULATE ile de kullanabilirsin.' },
    { t: 'mc', q: 'İade oranı %7,27’den %5,91’e indi. Hangi cümle <b>doğru ve en açık</b>?',
      o: ['İade oranı %1,37 azaldı', 'İade oranı 1,37 puan azaldı', 'İade oranı %81,3 seviyesine indi', 'İade sayısı %18,8 azaldı'], a: 1,
      why: 'Fark 1,37 yüzde puandır; göreli değişim −%18,8’dir. “%1,37 azaldı” göreli değişim gibi okunur ve yanlıştır. Oran düştü diye iade sayısının aynı oranda düştüğü de söylenemez, çünkü satır sayısı da değişti.' },
    { t: 'mc', q: 'Bir yönetici “Hediye kategorisi %183 büyüdü, bütçeyi oraya kaydıralım” diyor. Analist olarak ilk ne söylersin?',
      o: ['Hediye’nin büyümesi hedefin üstünde kaldığı için öneri yerinde', 'Taban küçük: ek satış yalnızca 3.670 ₺', 'Yüzdeler doğru değil, çünkü DIVIDE kullanılmamış', 'Büyüme oranları yalnızca medyanla hesaplanmalıdır'], a: 1,
      why: 'Küçük taban etkisi: Hediye’nin yüzdesi büyük ama ek satışı yalnızca 3.670 ₺; Elektronik’in 2024’teki eki 100.285 ₺. Kararı yüzdeye değil, mutlak katkıya ve potansiyele bakarak ver.' },
    { t: 'mc', q: 'A ekibi her iki müşteri grubunda B’den daha yüksek dönüşüm oranına sahip, ama toplam oranda B önde. En olası açıklama?',
      o: ['Hesapta bir hata var; böyle bir sonuç matematiksel olarak imkânsız', 'İki ekip farklı tarih tablosu kullanıyor', 'Ekiplerin müşteri karışımı farklı (Simpson paradoksu)', 'Toplam satırında DIVIDE yerine / kullanılmış'], a: 2,
      why: 'Toplam oran, grupların ağırlığına bağlıdır. A zor gruba daha çok müşteri almışsa her grupta önde olup toplamda geride kalabilir. Bu bir hesap hatası değil, karışım etkisidir.' }
  ]
});

/* ---------- 2 · Analiz · rapordan karara ---------- */
add('ayristirma-etkileyen', {
  id: 'karar-toplantisi', lv: 'B1', mod: 'Analiz', min: 24,
  title: 'Rapordan karara: yönetici toplantısında rapor kullanmak',
  sum: 'KPI sayfasını yukarıdan aşağı oku, her sayıya “neye göre?” diye sor, kırmızı bir KPI’dan üç tıklamada nedene in, bulguyu sahibi ve tarihi olan bir eyleme çevir, takip ölçüsünü seç ve tek paragraflık yönetici özetini DAX ile üret.',
  body: `
<p>Rapor bir sonuç değil, bir toplantının aracıdır. Toplantının sonunda “güzel rapor” değil, <b>“kim, neyi, ne zamana kadar yapacak?”</b> sorusunun cevabı çıkmalıdır. Bu derste Anadolu Market’in 2024 ikinci çeyrek (Ç2) toplantısını baştan sona oynuyoruz. Bütün sayılar modelden hesaplandı.</p>

<h2>KPI sayfasını yukarıdan aşağı okumak</h2>
<p>İyi bir yönetici sayfası üç katmandır (bkz. “Rapor kavramları” ve “Kullanıcı odaklı tasarım”):</p>
<ol>
<li><b>Üst şerit, “Durum ne?”:</b> 3–5 KPI kartı. Her kartta değer, karşılaştırma ve renk.</li>
<li><b>Orta, “Nerede?”:</b> Kategori, kanal ya da bölge kırılımı. Kırmızının hangi parçadan geldiğini gösterir.</li>
<li><b>Alt ya da detay sayfası, “Neden?”:</b> Ay, ürün, sipariş durumu gibi ayrıntılar.</li>
</ol>
<p>Toplantıda da bu sırayla git. Detaydan başlayan toplantı, ilk on dakikada tek bir ürünün tartışmasına sıkışır.</p>

<h2>“Neye göre?” sorusu</h2>
<p>2024 Ç2 net satışı <b>145.102 ₺</b>. Bu sayı tek başına ne iyi ne kötüdür. Üç farklı kıyas üç farklı hikâye anlatır:</p>
<div class="tbl-wrap"><table>
<tr><th>Kıyas</th><th>Değer</th><th>Sonuç</th><th>Renk</th></tr>
<tr><td>Hedefe göre</td><td>Hedef 155.000 ₺</td><td>%93,6 gerçekleşme, −9.898 ₺</td><td>Kırmızı</td></tr>
<tr><td>Geçen yılın aynı çeyreğine göre</td><td>86.910 ₺</td><td>+%67,0</td><td>Yeşil</td></tr>
<tr><td>Önceki çeyreğe göre</td><td>155.391 ₺</td><td>−%6,6</td><td>Sarı</td></tr>
</table></div>
<p>Hepsi doğrudur. Toplantının ilk işi, <b>hangi kıyasın karar için geçerli olduğunu</b> netleştirmektir. Bütçe hedefleri bağlayıcıysa hedef kıyası öndedir; ama “geçen yıla göre %67 büyüdük” bilgisi de masada olmalı ki kimse şirketin küçüldüğünü sanmasın.</p>

<h2>Kırmızı KPI’dan nedene: üç tıklama</h2>
<p>Hedef sapması kırmızı. Şimdi nedeni bulalım. Her adımda tek bir kırılım ekliyoruz.</p>
<p><b>Tık 1, kanal kırılımı (önceki çeyreğe göre):</b></p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    VALUES(Satislar[Kanal]),
    "Ç1 Satış", CALCULATE([Net Satış], Tarih[YilCeyrek] = "2024-Ç1"),
    "Ç2 Satış", CALCULATE([Net Satış], Tarih[YilCeyrek] = "2024-Ç2"),
    "Ç2 İptal %", CALCULATE([İptal Oranı %], Tarih[YilCeyrek] = "2024-Ç2")
)</pre>
<div class="tbl-wrap"><table>
<tr><th>Kanal</th><th>Ç1</th><th>Ç2</th><th>Fark</th></tr>
<tr><td>Mobil</td><td>63.783 ₺</td><td>78.455 ₺</td><td>+14.672 ₺</td></tr>
<tr><td>Web</td><td>56.330 ₺</td><td>42.506 ₺</td><td>−13.824 ₺</td></tr>
<tr><td>Mağaza</td><td>35.278 ₺</td><td>24.141 ₺</td><td>−11.137 ₺</td></tr>
</table></div>
<p>İki kanal düşmüş. İkisine ayrı ayrı bakmak gerekiyor.</p>
<p><b>Tık 2, Web’de sipariş durumu:</b> Web’in iptal dahil toplam tutarı Ç1’de 64.791 ₺, Ç2’de 59.004 ₺; yani talep yalnızca %8,9 azalmış. Asıl fark iptallerde: iptal edilen tutar 8.461 ₺’den <b>16.498 ₺</b>’ye çıkmış. Satır bazında iptal oranı %10,8’den <b>%24,7</b>’ye yükselmiş.</p>
<p><b>Tık 3, Web iptallerinin ayı:</b> Nisan %23,8, <b>Mayıs %36,4</b> (33 satırdan 12’si), Haziran %5,3. Sorun Nisan–Mayıs’a yoğunlaşmış ve Haziran’da kendiliğinden geçmiş görünüyor. Web’deki ek iptal tutarı (16.498 − 8.461 = 8.037 ₺) tek başına hedef açığının (9.898 ₺) yaklaşık <b>%81</b>’i kadar.</p>
<p><b>Mağaza’ya da bakalım:</b> Mağaza’nın Ç1’i tek bir siparişle şişmiş: 12.335 ₺’lik sipariş, bütün verinin en büyük siparişi. Mağaza’nın sipariş sayısı 17’den 19’a çıkmış, medyan sipariş 814 ₺’den 948 ₺’ye yükselmiş. Yani Mağaza’da bir sorun yok; düşüş, bir önceki çeyreğin aykırı değerinden geliyor. Bu bilgi toplantıda gereksiz bir “Mağaza kampanyası” kararını önler.</p>
<div class="tip"><b>Raporda bu yol nasıl kurulur?</b>Kanal çubuğundan bir <b>detay sayfasına (drillthrough)</b> geç; o sayfada durum (Durum) ve ay kırılımı olsun. Aynı keşfi <b>ayrıştırma ağacı</b> ile de yapabilirsin: Net Satış → Kanal → Durum → Ay. Araçların kendisi “Ayrıştırma ağacı ve anahtar etkileyiciler” ile “Raporla hikâye anlatmak” derslerinde.</div>

<h2>Bulgudan eyleme: sahip ve tarih</h2>
<p>“Web’de iptal arttı” bir bulgudur, eylem değildir. Eylemin dört parçası vardır: <b>ne yapılacak, kim yapacak, ne zamana kadar, nasıl ölçülecek</b>.</p>
<div class="tbl-wrap"><table>
<tr><th>Bulgu</th><th>Eylem</th><th>Sahip</th><th>Tarih</th><th>Takip ölçüsü</th></tr>
<tr><td>Web iptal oranı Ç2’de %24,7 (Mayıs %36,4)</td><td>Nisan–Mayıs Web iptallerinin nedenini (ödeme hatası, stok, fiyat) çıkar; kalıcı nedense düzelt</td><td>E-ticaret müdürü</td><td>2 hafta içinde</td><td>Haftalık Web iptal oranı (hedef: %11’in altı)</td></tr>
<tr><td>İptal nedeni veride yok</td><td>Kaynak sisteme “iptal nedeni” alanı ekle, modele al</td><td>BI ekibi + BT</td><td>Bir sonraki sprint</td><td>Nedeni boş iptal satırlarının payı</td></tr>
<tr><td>Mağaza düşüşü aykırı değerden</td><td>Eylem yok; KPI kartına medyan sipariş eklenecek</td><td>Rapor sahibi</td><td>Bu hafta</td><td>—</td></tr>
</table></div>
<p>Bir bulgu için eylem gerekmediğini söylemek de bir karardır ve tutanağa yazılır.</p>
<p>Veriden sonradan ne olduğunu da görebiliyoruz: Web iptal oranı Ç3’te %9,8, Ç4’te %8,2. Gerçek bir toplantıda bunu bir sonraki toplantının ilk maddesi olarak kontrol edersin.</p>

<h2>Takip ölçüleri ve gösteriş ölçüleri</h2>
<p><b>Gösteriş ölçüsü (vanity metric)</b>, iyi görünen ama bir karara bağlanmayan sayıdır: “toplam kayıtlı müşteri”, “rapor görüntülenme sayısı”, kümülatif satış eğrisi. Bunlar hep artar; bir eylemin işe yarayıp yaramadığını söylemez.</p>
<p>İyi bir takip ölçüsü:</p>
<ul>
<li>Eylemle <b>doğrudan bağlantılıdır</b> (iptal nedenini düzeltirsen iptal oranı düşer).</li>
<li><b>Bir oran ya da birim başına değerdir</b>, ham toplam değildir.</li>
<li><b>Hedefi ve eşiği önceden yazılmıştır</b> (%11’in altı).</li>
<li><b>Sık ölçülür</b>; haftalık eylemi çeyreklik ölçü izleyemez.</li>
</ul>

<h2>Tek paragraflık yönetici özeti</h2>
<p>Toplantıya gelmeyen yönetici için sayfanın en üstüne seçime göre değişen bir cümle koy. Aşağıdaki ölçü bir kart görseline konur:</p>
<pre class="dax">Toplantı Özeti =
VAR Satis = [Net Satış]
VAR Hedef = [Hedef]
VAR GY = [Satış GY]
VAR Oran = DIVIDE(Satis, Hedef)
VAR Buyume = DIVIDE(Satis - GY, GY)
VAR Kanallar = ADDCOLUMNS(VALUES(Satislar[Kanal]), "Iptal", [İptal Oranı %])
VAR EnKotu = TOPN(1, Kanallar, [Iptal], DESC)
VAR Cumle1 = "Net satış " &amp; FORMAT(Satis, "#,0") &amp; " ₺; hedef gerçekleşmesi %" &amp; FORMAT(Oran * 100, "0.0")
VAR Cumle2 =
    IF(ISBLANK(GY), ".",
        ", geçen yıla göre " &amp; IF(Buyume &gt;= 0, "+%", "-%") &amp; FORMAT(ABS(Buyume) * 100, "0.0") &amp; ".")
VAR Cumle3 =
    " En yüksek iptal oranı: " &amp; MAXX(EnKotu, Satislar[Kanal])
        &amp; " (%" &amp; FORMAT(MAXX(EnKotu, [Iptal]) * 100, "0.0") &amp; ")."
RETURN
    CONCATENATE(Cumle1 &amp; Cumle2, Cumle3)</pre>
<p>2024 Ç2 seçiliyken sonuç: <i>“Net satış 145.102 ₺; hedef gerçekleşmesi %93,6, geçen yıla göre +%67,0. En yüksek iptal oranı: Web (%24,7).”</i> Ç3 seçilince: <i>“Net satış 187.330 ₺; hedef gerçekleşmesi %96,4, geçen yıla göre +%83,5. En yüksek iptal oranı: Web (%9,8).”</i></p>
<ul>
<li><b>CONCATENATE</b> yalnızca iki metni birleştirir; daha fazlası için <code>&amp;</code> işlecini kullan.</li>
<li><b>FORMAT</b> sayıyı metne çevirir; sonuç artık sayı değildir, sıralanamaz ve toplanamaz.</li>
<li>Türkçede yüzde işareti sayının önüne gelir. Bu yüzden <code>"0.0%"</code> yerine <code>"%" &amp; FORMAT(Oran * 100, "0.0")</code> kullandık.</li>
</ul>
<p>Paragrafın geri kalanını (neden ve eylem) analist elle yazar: <i>“Açığın büyük kısmı Nisan–Mayıs’taki Web iptallerinden geliyor; e-ticaret ekibi iki hafta içinde nedenleri raporlayacak. Mağaza’daki düşüş geçen çeyreğin tek büyük siparişinden kaynaklanıyor, eylem gerekmiyor.”</i> Otomatik cümle “ne oldu?” sorusunu, analistin cümlesi “ne yapıyoruz?” sorusunu cevaplar.</p>
`,
  ex: [
    { t: 'dax', name: 'Hedef Sapma Etiketi',
      q: '<b>Hedef Sapma Etiketi</b>: Hedef yoksa boş döndür. Varsa durum ve farkı tek metinde ver: gerçekleşme ([Net Satış] / [Hedef]) 1 ve üstüyse "Yeşil", 0,95 ve üstüyse "Sarı", değilse "Kırmızı"; ardından boşluk ve parantez içinde fark ([Net Satış] − [Hedef]) <code>FORMAT(Fark, "+#,0;-#,0")</code> ve " ₺". Örnek: <code>Kırmızı (-9.898 ₺)</code>.',
      sol: 'VAR Fark = [Net Satış] - [Hedef] VAR Oran = DIVIDE([Net Satış], [Hedef]) VAR Durum = SWITCH(TRUE(), Oran >= 1, "Yeşil", Oran >= 0.95, "Sarı", "Kırmızı") RETURN IF(ISBLANK([Hedef]), BLANK(), Durum & " (" & FORMAT(Fark, "+#,0;-#,0") & " ₺)")',
      hint: 'Önce VAR ile Fark, Oran ve Durum’u hesapla. Durum için SWITCH(TRUE(), Oran >= 1, "Yeşil", Oran >= 0.95, "Sarı", "Kırmızı"). Sonuç: Durum & " (" & FORMAT(Fark, "+#,0;-#,0") & " ₺)". En dışa IF(ISBLANK([Hedef]), BLANK(), ...).' },
    { t: 'dax', name: 'Hedef Cümlesi',
      q: '<b>Hedef Cümlesi</b>: CONCATENATE kullanarak şu metni üret: <code>Net satış 1.250.772 ₺; hedef gerçekleşmesi %96,3.</code> Satış için <code>FORMAT([Net Satış], "#,0")</code>, oran için <code>"%" &amp; FORMAT([Hedef Gerçekleşme %] * 100, "0.0")</code> kullan.',
      sol: 'CONCATENATE("Net satış " & FORMAT([Net Satış], "#,0") & " ₺", "; hedef gerçekleşmesi %" & FORMAT([Hedef Gerçekleşme %] * 100, "0.0") & ".")',
      hint: 'CONCATENATE iki argüman alır: birincisi "Net satış " & FORMAT([Net Satış], "#,0") & " ₺", ikincisi "; hedef gerçekleşmesi %" & FORMAT([Hedef Gerçekleşme %] * 100, "0.0") & ".". Boşluklara ve noktalama işaretlerine dikkat et.' },
    { t: 'dax', name: 'Web İptal Oranı',
      q: '<b>Web İptal Oranı</b>: Toplantıda seçilen takip ölçüsü. Yalnızca Web kanalındaki satırlarda, durumu "İptal" olan satırların tüm satırlara oranı.',
      sol: 'CALCULATE([İptal Oranı %], Satislar[Kanal] = "Web")',
      hint: 'Hazır [İptal Oranı %] ölçüsünü CALCULATE içinde Satislar[Kanal] = "Web" filtresiyle kullan.' },
    { t: 'mc', q: 'Bir KPI kartı “Net satış: 145.102 ₺” gösteriyor, başka bilgi yok. Toplantıda ilk sorulacak soru hangisi?',
      o: ['Bu sayı neye göre iyi ya da kötü?', 'Kartın yazı tipi neden bu kadar büyük?', 'Bu sayıyı hangi DAX fonksiyonu hesaplıyor?', 'Kart yerine gösterge kullanılabilir miydi?'], a: 0,
      why: 'Karşılaştırması olmayan bir sayı yorumlanamaz. Aynı 145.102 ₺ hedefe göre kırmızı, geçen yıla göre yeşil, önceki çeyreğe göre sarıdır.' },
    { t: 'mc', q: 'Mağaza satışı önceki çeyreğe göre 11.137 ₺ düştü. Ama önceki çeyrekte verinin en büyük siparişi (12.335 ₺) vardı; sipariş sayısı ve medyan sipariş tutarı arttı. Ne önerirsin?',
      o: ['Mağaza için hemen indirim kampanyası başlatmak', 'Mağaza kanalını raporlardan çıkarmak', 'Eylem yok; karta medyan sipariş eklemek', 'Büyük siparişi veriden silip raporu yenilemek'], a: 2,
      why: 'Düşüş tek bir aykırı değerden geliyor; talepte sorun yok. Eylem gerekmediğini kaydet ve bir sonraki sefer aynı yanılgıyı önlemek için medyanı göster. Gerçek bir siparişi veriden silmek ise veriyi bozmak olur.' },
    { t: 'mc', q: 'Hangisi bir <b>takip ölçüsü</b> olarak en zayıftır?',
      o: ['Haftalık Web iptal oranı', 'Kümülatif toplam kayıtlı müşteri', 'İptal nedeni boş olan satırların payı', 'Web siparişlerinde medyan kargo günü'], a: 1,
      why: 'Kümülatif kayıtlı müşteri sayısı neredeyse hiç düşmez; bir eylemin etkisini göstermez. Bu tipik bir gösteriş ölçüsüdür. Diğerleri oran ya da birim başına değerdir ve bir eyleme bağlanabilir.' }
  ]
});

/* ---------- 3 · Yönetim ve Güvenlik · Power BI ortamını yönetmek ---------- */
add('yonetisim', {
  id: 'bi-yonetimi', lv: 'C1', mod: 'Yönetim ve Güvenlik', min: 26,
  title: 'Power BI ortamını yönetmek: lisans, kapasite, mükemmeliyet merkezi ve benimseme',
  sum: 'Ekip lideri ve kıdemli geliştirici için: lisans ve kapasite kararları, self-servis ile kurumsal BI arasında yönetilen self-servis, mükemmeliyet merkezi rolleri, kiracı ayarları kontrol listesi, onaylı anlam modelleri, benimsemeyi izlemek ve 90 günlük yayılım planı.',
  body: `
<p>Bir şirkette Power BI’ı “kurmak” bir gün sürer; <b>iyi yönetmek</b> yıllar sürer. Bu ders ekip lideri, BI yöneticisi ve kıdemli geliştirici içindir. Konu teknik ayarlardan çok kararlardır: kim ne lisans alacak, içeriği kim sahiplenecek, hangi model “resmî” sayılacak, insanlar raporları gerçekten kullanıyor mu? Microsoft bu soruları <b>Fabric benimseme yol haritası (Fabric adoption roadmap)</b> adlı bir rehber dizisinde ele alır; aşağıda onun fikirlerini kendi sözlerimizle ve Anadolu Market örneğiyle özetliyoruz.</p>
<div class="note"><b>Fiyat yok, kural var</b>Lisans fiyatları ve paket adları sık değişir. Bu derste fiyat vermiyoruz; kuralları Ekim 2026’da Microsoft Learn’den doğruladık. Karar vermeden önce güncel sayfaya bak.</div>

<h2>Lisans ve kapasite: hangi soru hangi kararı doğurur?</h2>
<p>İki tür satın alma vardır: <b>kullanıcı başına lisans</b> ve <b>kapasite</b> (paylaşılan işlem gücü).</p>
<div class="tbl-wrap"><table>
<tr><th>Seçenek</th><th>Ne sağlar?</th><th>Dikkat</th></tr>
<tr><td><b>Ücretsiz (Free)</b></td><td>Fabric’e giriş, Fabric kapasitesindeki alanlarda Power BI dışı Fabric öğeleri oluşturup paylaşmak</td><td>Paylaşılan Power BI içeriğini yalnızca F64 ve üstü kapasitede, Görüntüleyici (Viewer) rolüyle görebilir</td></tr>
<tr><td><b>Pro</b></td><td>Power BI içeriği oluşturup paylaşmak</td><td>Power BI kullanan her kuruluşta en az bir Pro ya da PPU kullanıcı gerekir</td></tr>
<tr><td><b>Kullanıcı başına Premium (PPU)</b></td><td>Premium özelliklerinin çoğu, kullanıcı başına</td><td>Fabric kapasitesi sağlamaz; Power BI dışı Fabric öğelerini tek başına çalıştıramaz. Learn’e göre 250’den az kullanıcı için genelde daha ekonomik</td></tr>
<tr><td><b>Fabric kapasitesi (F SKU)</b></td><td>F2’den F8192’ye; saniye bazında faturalama, isteğe bağlı yıllık rezervasyon</td><td>Önerilen seçenek. Power BI Premium kapasite (P SKU) satın alma seçenekleri emekliye ayrılıyor</td></tr>
<tr><td><b>Deneme (Trial)</b></td><td>60 gün; F4 ya da F64 boyutunda deneme kapasitesi</td><td>Power BI lisans kuralları denemede değişmez; Copilot denemede desteklenmez; süre bitince sona erer</td></tr>
</table></div>
<p><b>F64 eşiği</b> kararın merkezindedir. Learn’e göre F64’ten küçük F kapasitelerde, Power BI içeriğini görüntüleyen her kullanıcının Pro, PPU ya da bireysel deneme lisansı olmalı. F64 ve üstünde yalnızca ücretsiz lisansı olan ve çalışma alanında Görüntüleyici rolü bulunan kullanıcılar da içeriği görebilir. Kuruluş içi gömme (SharePoint, PowerPoint) için de aynı kural geçerlidir.</p>
<p>Anadolu Market büyüyüp 20 rapor geliştiricisine ve 600 mağaza müdürüne (yalnızca okuyucu) ulaştığını varsay. Soru şudur: 600 okuyucuya Pro mu alınır, yoksa F64 ve üstü bir kapasite mi? Cevap fiyat listesine, kapasitenin başka iş yüklerine (lakehouse, not defteri) gerekip gerekmediğine ve kullanım yoğunluğuna bağlıdır. Kapasite alındıysa <b>Microsoft Fabric Capacity Metrics</b> uygulamasıyla CU tüketimi ve kısıtlama (throttling) izlenir.</p>
<p>Kapasite ve depolama kavramlarının teknik tarafı “Microsoft Fabric’e giriş” ve “Kurumsal model” derslerinde.</p>

<h2>Self-servis, yönetilen self-servis, kurumsal BI</h2>
<p>Yol haritası içerik sahipliği için üç strateji tanımlar:</p>
<div class="tbl-wrap"><table>
<tr><th>Strateji</th><th>Veriyi kim sahiplenir?</th><th>Raporu kim sahiplenir?</th><th>Ne zaman?</th></tr>
<tr><td><b>İş birimi liderliğinde self-servis</b></td><td>İş birimi</td><td>İş birimi</td><td>Kişisel ve ekip analizleri; en esnek, en az denetim</td></tr>
<tr><td><b>Yönetilen self-servis</b></td><td>Merkezî ekip (BT, kurumsal BI, CoE)</td><td>İş birimindeki rapor yazarları</td><td>Ekip ve departman raporları; çoğu kuruluş için hedef model</td></tr>
<tr><td><b>Kurumsal</b></td><td>Merkezî ekip</td><td>Merkezî ekip</td><td>Şirket geneli, hassas ya da denetlenen veri, ihtiyacı net raporlar</td></tr>
</table></div>
<p>Microsoft yönetilen self-servisi “çekirdekte disiplin, kenarda esneklik” diye özetler. Anadolu Market’te bunun anlamı: BI ekibi tek bir <b>Satış</b> anlam modelini (Satislar, Urunler, Musteriler, Tarih, Hedefler) yayımlar ve sertifikalar; bölge analistleri bu modele canlı bağlanıp kendi raporlarını yazar. Bölgeye özel bir tabloya ihtiyaç olursa bileşik model ile ekler, ana modeli kopyalamaz.</p>
<div class="warn"><b>Gölge BI ile self-servis aynı şey değil</b>Self-servis onaylı bir yaklaşımdır ve yönetişim kurallarına uyar. Kişisel e-postayla dolaşan Excel dosyaları ve kimsenin bilmediği çalışma alanları ise gölge BI’dır (shadow IT).</div>

<h2>Mükemmeliyet merkezi (CoE): roller ve yapı</h2>
<p><b>Mükemmeliyet merkezi (Center of Excellence, CoE)</b>, standartları koyan, eğiten ve paylaşılan veri varlıklarını yöneten küçük bir ekiptir. Yol haritasındaki roller:</p>
<div class="tbl-wrap"><table>
<tr><th>Rol</th><th>Ne yapar?</th></tr>
<tr><td>CoE lideri</td><td>Günlük işleri yönetir; üst yönetim sponsoru ve veri yönetişim kuruluyla çalışır</td></tr>
<tr><td>Koç</td><td>Ofis saatleri, en iyi uygulama incelemeleri, birlikte geliştirme; şampiyonlar ağını destekler</td></tr>
<tr><td>Eğitmen</td><td>İç eğitim materyali ve dokümantasyon hazırlar</td></tr>
<tr><td>Veri analisti</td><td>İş biriminin konu uzmanı; CoE ile birim arasında köprü, sertifikasyona yardım</td></tr>
<tr><td>Veri modelleyici</td><td>Paylaşılan anlam modellerini ve veri akışlarını yönetir</td></tr>
<tr><td>Rapor yazarı</td><td>Rapor, pano ve ölçüm (metrics) içeriği yayımlar</td></tr>
<tr><td>Veri mühendisi</td><td>Mimari ve dağıtım; lakehouse, ambar, işlem hattı gibi geniş kullanılan varlıklar</td></tr>
<tr><td>Kullanıcı desteği</td><td>Veri tutarsızlıklarını ve üst seviyeye taşınan destek taleplerini çözer</td></tr>
</table></div>
<p>Yapı dört türlü olabilir: <b>merkezî</b> (tek ekip her şeyi yapar), <b>birleşik (unified)</b> (merkezî ekip + birimlere gömülü üyeler), <b>federe</b> (çekirdek ekip + birimlerden uydu üyeler) ve <b>dağınık</b> (her birimin kendi CoE’si). Learn’e göre çoğu kuruluş için birleşik ya da federe yapı en etkilidir, çünkü birimler arası sınırı aşar. Anadolu Market gibi orta ölçekli bir şirkette başlangıç için 2–3 kişilik merkezî bir çekirdek ve her bölgeden bir “şampiyon” yeterlidir.</p>

<h2>Kiracı ayarları ve yönetişim kontrol listesi</h2>
<p><b>Kiracı ayarları (tenant settings)</b> yönetim portalında bulunur ve bütün kuruluşu etkiler. Çoğu ayar tüm kuruluşa ya da belirli güvenlik gruplarına açılabilir. İlk gün gözden geçirilecek ayarlar:</p>
<ul>
<li><b>Publish to web</b> (Web’de yayımla): Herkese açık, kimlik doğrulamasız bağlantı üretir. Kapalı tut ya da çok dar bir gruba aç.</li>
<li><b>Export to Excel</b> ve diğer dışa aktarma ayarları: Kim veriyi dışarı alabilir?</li>
<li><b>Create workspaces</b> (Çalışma alanı oluştur): Herkes mi, yalnızca bir grup mu? Kontrolsüz alan sayısı, sahipsiz içerik demektir.</li>
<li><b>Certification</b> (Sertifikasyon): Hangi grup içeriği sertifikalayabilir?</li>
<li><b>Users can create Fabric items</b>: Power BI dışı Fabric öğelerini kim oluşturabilir?</li>
<li><b>Guest users can access Microsoft Fabric</b>: Kuruluş dışı misafir kullanıcılar.</li>
<li><b>Allow XMLA endpoints and Analyze in Excel with on-premises semantic models</b>: Dış araçların modele erişimi.</li>
<li>Kullanım ölçümleri ve denetim (audit) ayarları: Benimseme ölçümü için açık olmalı.</li>
</ul>
<p>Kontrol listesine ayarların yanında şu kuralları da ekle: çalışma alanı adlandırma standardı, her alanda en az iki yönetici, geliştirme / test / üretim ayrımı (bkz. “Yaşam döngüsü” dersi), duyarlılık etiketlerinin zorunluluğu (bkz. “Yönetişim” dersi).</p>

<h2>Tek doğruluk kaynağı: onaylı anlam modelleri</h2>
<p>İki müdür aynı toplantıya farklı “net satış” rakamıyla geliyorsa sorun DAX’ta değil, yönetişimdedir. Çözüm, ortak modelleri <b>onaylamaktır (endorsement)</b>:</p>
<ul>
<li><b>Tanıtılan (Promoted):</b> Sahibi “bu iyi, kullanılabilir” der. Self-servis içerik için.</li>
<li><b>Sertifikalı (Certified):</b> Yetkili bir grup kalite, belge ve destek kurallarına uyduğunu onaylar. Kurumsal ve yönetilen self-servis içerik için.</li>
</ul>
<p>Sertifikalı içerik veri kalitesi doğrulanmış, değişiklik yönetimine bağlı, destek sahibi belli ve belgelenmiş olmalıdır. Yol haritası bir sağlık göstergesi de önerir: <b>anlam modeli / rapor oranı</b>. Her rapor kendi modelini taşıyorsa oran yüksektir; bu, tekrar eden mantık, tutarsız rakamlar ve yüksek bakım yükü demektir. Anadolu Market’te hedef, satış raporlarının tamamının tek sertifikalı Satış modeline bağlanmasıdır.</p>

<h2>Benimsemeyi izlemek</h2>
<p>Yayımlanan raporu kimse açmıyorsa proje başarısızdır, ne kadar güzel olursa olsun. İki resmî araç vardır:</p>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Kim görür?</th><th>Ne gösterir?</th></tr>
<tr><td><b>Kullanım ölçümleri raporu (Usage metrics report)</b></td><td>Çalışma alanında Yönetici, Üye ya da Katkıda bulunan; Pro ya da PPU lisansı gerekir. Görüntüleyici rolü yetmez</td><td>Son 30 günün rapor ve sayfa görüntülemeleri, tekil görüntüleyiciler, eğilim, tipik açılma süresi. “Çalışma alanım”da desteklenmez</td></tr>
<tr><td><b>Yönetici izleme çalışma alanı (Admin monitoring workspace)</b></td><td>Fabric yöneticisi kurar; raporları başkalarıyla paylaşabilir</td><td>Kiracı geneli etkinlik ve envanter. Microsoft genel bakış için OneLake kataloğundaki <b>Govern</b> raporunu öneriyor; eski “Feature usage and adoption” raporu önizlemede kalacak</td></tr>
</table></div>
<p>Kullanım ölçümleri modeli yalnızca son 30 günü tutar. Uzun dönem eğilim için verisini düzenli olarak dışarı aktar. Basit bir benimseme ölçüsü: <b>aktif kullanıcı / lisanslı kullanıcı</b>. Aşağıdaki sorgu, örnek amaçlı küçük bir 30 günlük kullanım tablosundan bunu hesaplıyor (12 lisanslı kullanıcıdan 6’sı aktif, %50):</p>
<pre class="dax">EVALUATE
VAR Kullanim =
    DATATABLE(
        "Rapor", STRING, "Kullanici", STRING, "Goruntuleme", INTEGER,
        {
            {"Satış Panosu", "ayse", 18}, {"Satış Panosu", "mert", 12},
            {"Satış Panosu", "deniz", 9}, {"Satış Panosu", "selin", 7},
            {"Satış Panosu", "burak", 4}, {"Stok Raporu", "ayse", 3},
            {"Stok Raporu", "kerem", 6}, {"Bölge Raporu", "mert", 1}
        }
    )
VAR Lisansli = 12
VAR Aktif = COUNTROWS(DISTINCT(SELECTCOLUMNS(Kullanim, "Kisi", [Kullanici])))
RETURN
    ROW("Aktif Kullanıcı", Aktif, "Benimseme %", DIVIDE(Aktif, Lisansli))</pre>
<p>Sayının kendisi kadar <b>eğilimi</b> önemlidir: benimseme her ay artıyor mu? Hangi raporlar tek kişiye hizmet ediyor? Görüntülenme sayısı tek başına bir gösteriş ölçüsü olabilir; abonelikler de görüntüleme sayısını etkiler.</p>

<h2>Olgunluk düzeyleri</h2>
<p>Yol haritası her alanı beş olgunluk düzeyiyle değerlendirir: <b>100 Başlangıç</b> (dağınık denemeler, belgesiz bilgi), <b>200 Tekrarlanabilir</b> (planlı ama her yerde aynı değil), <b>300 Tanımlı</b> (standart süreçler birimler arasında tutarlı), <b>400 Yetkin</b> (veri yaşam döngüsü boyunca yönetiliyor, yönetişim kabul görmüş), <b>500 Verimli</b> (otomasyon, sürekli iyileştirme, kendini sürdüren topluluk). Amaç her alanda 500 değil; iş için yeterli düzeyi seçip ona ulaşmaktır.</p>

<h2>90 günlük yayılım planı</h2>
<div class="tbl-wrap"><table>
<tr><th>Dönem</th><th>Odak</th><th>Çıktı</th></tr>
<tr><td>Gün 1–30</td><td>Temel</td><td>Üst yönetim sponsoru belirlendi; lisans ve kapasite kararı; kiracı ayarları gözden geçirildi; CoE çekirdeği ve adlandırma standardı; mevcut rapor envanteri çıkarıldı</td></tr>
<tr><td>Gün 31–60</td><td>Pilot</td><td>Tek sertifikalı Satış modeli; bir pilot bölgede 2–3 rapor; şampiyonlar seçildi; ofis saatleri ve iç eğitim başladı; destek kanalı (Teams kanalı ya da form) açıldı</td></tr>
<tr><td>Gün 61–90</td><td>Yaygınlaştırma</td><td>Diğer bölgelere uygulama olarak dağıtım; kullanım ölçümleri her ay raporlanıyor; hiç açılmayan raporlar için emeklilik süreci; ikinci veri alanı (stok) için plan</td></tr>
</table></div>
<div class="tip"><b>İlk metrik seti</b>Aktif kullanıcı oranı, sertifikalı modele bağlı rapor payı, 30 günde hiç açılmayan rapor sayısı, destek talebi çözüm süresi. Dördü de bir eyleme bağlanır.</div>
`,
  ex: [
    { t: 'mc', q: 'Anadolu Market F32 Fabric kapasitesi aldı. Raporları yalnızca okuyacak, ücretsiz lisanslı mağaza müdürleri Görüntüleyici rolüyle eklendi ama içeriği göremiyorlar. Neden?',
      o: ['Görüntüleyici rolü yerine Katkıda bulunan rolü gerekiyor', 'F64 altında her okuyucuya Pro/PPU gerekir', 'Raporlar sertifikalanmadan paylaşılamaz', 'Kapasite yalnızca not defterleri içindir'], a: 1,
      why: 'Learn’e göre F64’ten küçük kapasitelerde Power BI içeriğini gören her kullanıcının Pro, PPU ya da bireysel deneme lisansı olmalı. Ücretsiz kullanıcı ancak F64 ve üstünde, Görüntüleyici rolüyle görebilir.' },
    { t: 'mc', q: 'BI ekibi tek bir Satış anlam modelini yönetiyor; bölge analistleri bu modele canlı bağlanıp kendi raporlarını yazıyor. Bu hangi içerik sahipliği stratejisidir?',
      o: ['Kurumsal BI', 'Gölge BI', 'Yönetilen self-servis', 'İş birimi liderliğinde self-servis'], a: 2,
      why: 'Veriyi merkezî ekip, raporu iş birimi sahipleniyor: yönetilen self-servis. Kurumsalda raporu da merkez yazar; iş birimi liderliğinde self-serviste veri de birimdedir.' },
    { t: 'mc', q: 'İki müdür aynı ay için farklı “net satış” rakamı getiriyor; her biri kendi raporundaki modeli kullanıyor. Kalıcı çözüm hangisi?',
      o: ['Raporlara “rakamlar farklı olabilir” notu eklemek', 'Her müdüre ayrı bir çalışma alanı açmak', 'Bütün raporları PDF olarak dağıtmak', 'Tek modeli sertifikalayıp raporları ona bağlamak'], a: 3,
      why: 'Tek doğruluk kaynağı, sertifikalı ve paylaşılan bir anlam modelidir. Yol haritası, anlam modeli / rapor oranını bu tekrarın göstergesi olarak izlemeyi önerir.' },
    { t: 'mc', q: 'Bir rapor yazarı çalışma alanında yalnızca <b>Görüntüleyici</b> rolünde. Kullanım ölçümleri raporunu açamıyor. Neden?',
      o: ['Yönetici, Üye ya da Katkıda bulunan rolü gerekir', 'Kullanım ölçümleri yalnızca Desktop’ta açılır', 'Rapor 30 günden eski olduğu için silinmiştir', 'Kullanım ölçümleri yalnızca panolarda çalışır'], a: 0,
      why: 'Learn: kullanım ölçümlerini yalnızca Yönetici, Üye ya da Katkıda bulunan rolündekiler görebilir; Görüntüleyici yetmez. Ayrıca Pro ya da PPU lisansı gerekir.' },
    { t: 'mc', q: 'Hangi kiracı ayarı, kimlik doğrulaması olmadan internetteki herkesin görebileceği bir bağlantı üretilmesine izin verir?',
      o: ['Certification', 'Create workspaces', 'Publish to web', 'Export to Excel'], a: 2,
      why: 'Publish to web herkese açık bağlantı üretir. Hassas veri riski yüzünden genelde kapalı tutulur ya da çok dar bir gruba açılır.' },
    { t: 'mc', q: 'Orta ölçekli bir şirket CoE kuruyor. Learn’e göre çoğu kuruluş için hangi yapılar en etkilidir?',
      o: ['Tamamen dağınık: her birimin kendi CoE’si', 'Birleşik ya da federe yapı', 'Yalnızca BT içinde merkezî ekip', 'CoE yerine dış danışman ekibi'], a: 1,
      why: 'Birleşik ve federe yapılar merkezî standartları birimlerin bilgisiyle birleştirir ve birimler arası sınırı aşar. Dağınık yapı tutarsızlık, tamamen merkezî yapı ise iş ihtiyacından kopma riski taşır.' },
    { t: 'query', q: 'Örnek kullanım tablosundaki her rapor için <b>"Tekil Kullanıcı"</b> (satır sayısı; her satır bir rapor-kullanıcı çiftidir) ve <b>"Görüntüleme"</b> (Goruntuleme toplamı) sütunlarını döndür. İlk sütun "Rapor" olsun.',
      start: 'EVALUATE\nVAR Kullanim =\n    DATATABLE(\n        "Rapor", STRING, "Kullanici", STRING, "Goruntuleme", INTEGER,\n        {\n            {"Satış Panosu", "ayse", 18}, {"Satış Panosu", "mert", 12},\n            {"Satış Panosu", "deniz", 9}, {"Satış Panosu", "selin", 7},\n            {"Satış Panosu", "burak", 4}, {"Stok Raporu", "ayse", 3},\n            {"Stok Raporu", "kerem", 6}, {"Bölge Raporu", "mert", 1}\n        }\n    )\nRETURN\n    ',
      sol: 'EVALUATE\nVAR Kullanim = DATATABLE("Rapor", STRING, "Kullanici", STRING, "Goruntuleme", INTEGER, {{"Satış Panosu", "ayse", 18}, {"Satış Panosu", "mert", 12}, {"Satış Panosu", "deniz", 9}, {"Satış Panosu", "selin", 7}, {"Satış Panosu", "burak", 4}, {"Stok Raporu", "ayse", 3}, {"Stok Raporu", "kerem", 6}, {"Bölge Raporu", "mert", 1}})\nRETURN ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Kullanim, "Rapor", [Rapor])), "Tekil Kullanıcı", VAR R = [Rapor] RETURN COUNTROWS(FILTER(Kullanim, [Rapor] = R)), "Görüntüleme", VAR R = [Rapor] RETURN SUMX(FILTER(Kullanim, [Rapor] = R), [Goruntuleme]))',
      hint: 'Rapor listesi: DISTINCT(SELECTCOLUMNS(Kullanim, "Rapor", [Rapor])). ADDCOLUMNS içinde VAR R = [Rapor] ile o satırın raporunu al; FILTER(Kullanim, [Rapor] = R) ile COUNTROWS ve SUMX hesapla. Bölge Raporu’nda 1 kullanıcı, 1 görüntüleme çıkmalı.' },
    { t: 'query', q: 'Rapor envanterinde beş rapor var: Satış Panosu, Stok Raporu, Bölge Raporu, Kampanya Raporu 2023, Kargo Raporu. Kullanım tablosunda <b>hiç geçmeyen</b> (30 günde açılmayan) raporları döndür. Bunlar emeklilik adayıdır.',
      start: 'EVALUATE\nVAR Kullanim =\n    DATATABLE(\n        "Rapor", STRING, "Kullanici", STRING, "Goruntuleme", INTEGER,\n        {\n            {"Satış Panosu", "ayse", 18}, {"Satış Panosu", "mert", 12},\n            {"Satış Panosu", "deniz", 9}, {"Satış Panosu", "selin", 7},\n            {"Satış Panosu", "burak", 4}, {"Stok Raporu", "ayse", 3},\n            {"Stok Raporu", "kerem", 6}, {"Bölge Raporu", "mert", 1}\n        }\n    )\nVAR Envanter =\n    DATATABLE("Rapor", STRING, {{"Satış Panosu"}, {"Stok Raporu"}, {"Bölge Raporu"}, {"Kampanya Raporu 2023"}, {"Kargo Raporu"}})\nRETURN\n    ',
      sol: 'EVALUATE\nVAR Kullanim = DATATABLE("Rapor", STRING, "Kullanici", STRING, "Goruntuleme", INTEGER, {{"Satış Panosu", "ayse", 18}, {"Satış Panosu", "mert", 12}, {"Satış Panosu", "deniz", 9}, {"Satış Panosu", "selin", 7}, {"Satış Panosu", "burak", 4}, {"Stok Raporu", "ayse", 3}, {"Stok Raporu", "kerem", 6}, {"Bölge Raporu", "mert", 1}})\nVAR Envanter = DATATABLE("Rapor", STRING, {{"Satış Panosu"}, {"Stok Raporu"}, {"Bölge Raporu"}, {"Kampanya Raporu 2023"}, {"Kargo Raporu"}})\nRETURN EXCEPT(Envanter, DISTINCT(SELECTCOLUMNS(Kullanim, "Rapor", [Rapor])))',
      hint: 'EXCEPT(tablo1, tablo2) birinci tabloda olup ikincide olmayan satırları verir. İkinci tablo kullanılan raporların tek sütunlu listesi olmalı: DISTINCT(SELECTCOLUMNS(Kullanim, "Rapor", [Rapor])). İki rapor dönmeli.' }
  ]
});

/* ---------- 4 · Kariyer · BI projesini yürütmek ---------- */
add('kademeli-tasarim', {
  id: 'proje-yonetimi-bi', lv: 'B2', mod: 'Kariyer', min: 24,
  title: 'Bir BI projesini baştan sona yürütmek: plan, sprint, teslim ve bakım',
  sum: 'Keşiften bakıma yedi aşama, Anadolu Market için dört haftalık bir rapor sprint planı, risk listesi, RACI, tamamlandı tanımı, teslim ve belgeleme, canlı sonrası yenileme ve veri tazeliği izleme, eski raporları emekliye ayırmak.',
  body: `
<p>İş ilanlarında “Power BI bilgisi” yazar ama mülakatta sorulan çoğu zaman şudur: <b>“Bir projeyi baştan sona nasıl yürüttün?”</b> Bu ders o soruya cevap verebilmen için. Örnek proje: Anadolu Market satış müdürü haftalık toplantı için bir <b>satış ve hedef panosu</b> istiyor; süre dört hafta.</p>

<h2>Yedi aşama</h2>
<div class="tbl-wrap"><table>
<tr><th>Aşama</th><th>Soru</th><th>Çıktı</th></tr>
<tr><td>1. Keşif</td><td>Kim, hangi kararı, ne sıklıkla verecek?</td><td>Rapor brifi, KPI tanımları, kabul kriterleri</td></tr>
<tr><td>2. Veri değerlendirmesi</td><td>Veri nerede, erişimimiz var mı, ne kadar temiz?</td><td>Kaynak listesi, veri kalitesi notları, erişim talepleri</td></tr>
<tr><td>3. Model</td><td>Olgu ve boyutlar neler, tanecik ne?</td><td>Yıldız şema, ölçüler, tarih tablosu</td></tr>
<tr><td>4. Rapor</td><td>Sayfa hangi sırayla okunacak?</td><td>Sayfa taslağı, görseller, etkileşimler</td></tr>
<tr><td>5. Kullanıcı kabul testi (UAT)</td><td>Rakamlar kaynakla tutuyor mu, kullanıcı işini yapabiliyor mu?</td><td>Test listesi, düzeltmeler, onay</td></tr>
<tr><td>6. Canlıya alma</td><td>Kim, nereden, hangi yetkiyle erişecek?</td><td>Uygulama, erişim grupları, yenileme planı, duyuru</td></tr>
<tr><td>7. Bakım</td><td>Rapor sağlıklı mı ve kullanılıyor mu?</td><td>Yenileme izleme, destek kanalı, değişiklik talepleri</td></tr>
</table></div>
<p>Keşif ve kabul kriterlerinin ayrıntısı “Talepten rapor brifine” dersinde; yayımlama ve yenileme “Yayımlama, yenileme ve yaşam döngüsü” dersinde; geliştirme / test / üretim ayrımı ve Git “Yaşam döngüsü” dersinde; test yöntemleri “Rapor kalitesi” konusunda.</p>

<h2>Dört haftalık sprint planı</h2>
<p>Küçük bir BI projesi için ağır bir çevik (agile) kurulum gerekmez. Haftalık sprint, her hafta sonunda kullanıcıya kısa bir gösterim yeter:</p>
<div class="tbl-wrap"><table>
<tr><th>Hafta</th><th>Hedef</th><th>İşler</th><th>Hafta sonu gösterimi</th></tr>
<tr><td>1</td><td>Keşif ve veri</td><td>Brif görüşmesi; KPI tanımları (“net satış iptaller hariç”); kaynak erişimi; veri kalitesi taraması</td><td>Brif onayı, veri kalitesi notları</td></tr>
<tr><td>2</td><td>Model</td><td>Power Query temizliği; yıldız şema; tarih tablosu; temel ölçüler; kaynakla mutabakat</td><td>Ölçüler bir tabloda; rakamlar kaynakla karşılaştırıldı</td></tr>
<tr><td>3</td><td>Rapor</td><td>Sayfa taslağı; KPI kartları; kategori ve kanal kırılımı; detay sayfası; mobil düzen</td><td>Tıklanabilir taslak; geri bildirim listesi</td></tr>
<tr><td>4</td><td>Test ve canlı</td><td>UAT; düzeltmeler; RLS testi; uygulama yayımı; zamanlanmış yenileme; kullanıcı rehberi</td><td>Canlıya alma ve ilk toplantıda kullanım</td></tr>
</table></div>
<div class="tip"><b>Kapsamı sabit, sırayı esnek tut</b>Her sprintin başında yalnızca o haftanın işlerini sırala. Yeni bir istek gelirse “bir sonraki sürüm” listesine yaz; aynı haftaya sıkıştırma.</div>

<h2>Risk listesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Risk</th><th>Belirti</th><th>Önlem</th></tr>
<tr><td>Veri kalitesi</td><td>Anadolu Market’te 7 müşterinin bölgesi boş; bu müşterilerin net satışı 63.852,75 ₺. Bölge raporunda “(Boş)” satırı çıkar</td><td>1. haftada taramayı yap; kaynağa düzeltme talebi aç; raporda “Bölge belirsiz” etiketiyle göster</td></tr>
<tr><td>Erişim</td><td>Veritabanı izni ya da ağ geçidi 3. haftaya kadar gelmiyor</td><td>Erişim talebini 1. gün aç; geçici olarak örnek dışa aktarımla çalış</td></tr>
<tr><td>Kapsam kayması (scope creep)</td><td>“Bir de stok sayfası ekleyelim” istekleri</td><td>Brifteki kapsam listesi; ek istekler bir sonraki sürüme</td></tr>
<tr><td>Tanım çatışması</td><td>Finans ve satış farklı “net satış” kullanıyor</td><td>KPI tanımını iki tarafa imzalat; ölçü açıklamasına yaz</td></tr>
<tr><td>Kullanıcı ilgisi</td><td>Kullanıcı gösterimlere gelmiyor</td><td>Sponsoru gösterime davet et; ilk toplantıyı raporla yap</td></tr>
</table></div>

<h2>RACI: kim ne yapar?</h2>
<p><b>RACI</b> her iş için dört rolü yazar: <b>R</b>esponsible (işi yapan), <b>A</b>ccountable (sonuçtan hesap veren, tek kişi), <b>C</b>onsulted (görüşü alınan), <b>I</b>nformed (bilgilendirilen).</p>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>Satış müdürü</th><th>BI geliştirici</th><th>Veri sahibi (BT)</th><th>BI ekip lideri</th></tr>
<tr><td>KPI tanımları</td><td>A</td><td>R</td><td>C</td><td>I</td></tr>
<tr><td>Veri erişimi</td><td>I</td><td>C</td><td>R</td><td>A</td></tr>
<tr><td>Model ve rapor</td><td>C</td><td>R</td><td>C</td><td>A</td></tr>
<tr><td>Kabul testi</td><td>A</td><td>R</td><td>I</td><td>C</td></tr>
<tr><td>Canlı sonrası destek</td><td>I</td><td>R</td><td>C</td><td>A</td></tr>
</table></div>
<p>Her satırda tam bir “A” olmalı. İki A varsa kimse sorumlu değildir.</p>

<h2>Tamamlandı tanımı</h2>
<p><b>Tamamlandı tanımı (definition of done)</b>, “bitti” demeden önce her işin geçmesi gereken ortak listedir:</p>
<ul>
<li>Toplam rakamlar kaynak sistemle mutabık (fark ve nedeni yazılı).</li>
<li>Her ölçünün açıklaması (description) ve biçimi var; görünmesi gerekmeyen sütunlar gizli.</li>
<li>RLS rolleri “Farklı görüntüle” ile test edildi.</li>
<li>Sayfa, kabul kriterindeki sürede açılıyor (Performans Analizi ile ölçüldü).</li>
<li>Erişilebilirlik: alternatif metin, sekme sırası, renk dışında işaret.</li>
<li>Zamanlanmış yenileme çalışıyor ve hata bildirimi bir kişiye değil bir gruba gidiyor.</li>
<li>Kullanıcı rehberi ve teknik belge güncel.</li>
</ul>

<h2>Teslim ve belgeleme</h2>
<p>Projeyi bırakan kişi giderse rapor ölmemelidir. Teslim paketinde:</p>
<ol>
<li><b>Kullanıcı rehberi:</b> Bir sayfa. Hangi soruya hangi sayfa cevap verir, filtreler nasıl kullanılır, kime sorulur.</li>
<li><b>Teknik belge:</b> Kaynaklar, yenileme planı, ağ geçidi, ölçü tanımları, RLS rolleri, bilinen veri sorunları.</li>
<li><b>Kaynak kod:</b> PBIP klasörü Git’te (bkz. “Yaşam döngüsü” dersi).</li>
<li><b>Sahiplik:</b> Çalışma alanında en az iki yönetici; anlam modelinin sahibi ve yedeği belli.</li>
</ol>

<h2>Canlı sonrası destek ve yenileme izleme</h2>
<p>İlk iki hafta “hiper bakım” dönemidir: sorulara aynı gün cevap ver, her sabah yenilemeyi kontrol et. Sonra izlemeyi otomatikleştir. İki basit sağlık ölçüsü:</p>
<p><b>Veri tazeliği:</b> Bir kırılımın son satış tarihi, modeldeki en son satış tarihinin kaç gün gerisinde? Anadolu Market’te Hediye kategorisinin son satışı 15 Aralık 2024; modelin son satışı 31 Aralık 2024. Fark 16 gün. Diğer kategoriler 0–1 gün geride. 16 gün Hediye için normal olabilir (az satan kategori), ama günlük satan bir kategoride alarm işaretidir.</p>
<pre class="dax">Son Satış Tarihi =
VAR Son = MAX(Satislar[Tarih])
RETURN
    IF(NOT ISBLANK(Son), FORMAT(Son, "dd.MM.yyyy"), "Satış yok")</pre>
<p>Hiç satışı olmayan bir ürünün son satış tarihi boştur; boş tarihle gün farkı hesaplamak anlamsız sonuç verir. Bu yüzden tazelik ölçüsünü yazarken boş durumu açıkça ele al.</p>
<p><b>Tamlık:</b> Bir sütunda boş değer ne kadar? Satislar[KargoGun] 1.620 satırın 131’inde boş. Ama boşların 121’i iptal satırı (iptal edilen sipariş kargoya çıkmaz), 10’u ise henüz kargoda. Teslim edilmiş satırlarda boş yok. Ders: <b>boş her zaman hata değildir</b>; tamlık ölçüsünü iş kuralına göre tanımla.</p>
<pre class="dax">Boş Kargo Satırı =
CALCULATE(COUNTROWS(Satislar), ISBLANK(Satislar[KargoGun]), Satislar[Durum] = "Teslim Edildi")</pre>
<p>Bu ölçü sıfırdan farklı olursa veri hattında bir sorun var demektir. Service’te yenileme geçmişini izle, yenileme hatası bildirimlerini bir gruba yönlendir ve sağlık ölçülerini bir “Veri sağlığı” sayfasına koy.</p>

<h2>Eski raporları emekliye ayırmak</h2>
<p>Yeni pano canlıya çıkınca eski Excel ve rapor kopyaları kendiliğinden ölmez. Emeklilik süreci:</p>
<ol>
<li>Kullanım ölçümlerinden 30 günde açılmayan ya da yeni raporla aynı işi yapan raporları listele.</li>
<li>Sahibine ve son kullanıcılarına “X tarihinde kaldırılacak, yerine şu rapor” diye haber ver.</li>
<li>Raporu önce erişimden kaldır (silme), bir süre bekle; şikâyet gelmezse arşivle.</li>
<li>Eski raporun anlam modeli başka içerik besliyorsa önce etki analizine bak.</li>
</ol>
<p>Emeklilik, bakım yükünü azaltır ve “hangi rapor doğru?” sorusunu ortadan kaldırır.</p>
`,
  ex: [
    { t: 'dax', name: 'Veri Tazeliği (Gün)',
      q: '<b>Veri Tazeliği (Gün)</b>: Bulunduğun kırılımdaki son satış tarihinin, bütün modeldeki son satış tarihinin kaç gün gerisinde olduğunu döndür. Kırılımda hiç satış yoksa boş döndür. (Hediye kategorisinde 16 çıkmalı.)',
      sol: 'VAR Son = MAX(Satislar[Tarih]) VAR ModelSon = CALCULATE(MAX(Satislar[Tarih]), ALL(Satislar)) RETURN IF(NOT ISBLANK(Son), DATEDIFF(Son, ModelSon, DAY))',
      hint: 'Kırılımın son tarihi: MAX(Satislar[Tarih]). Modelin son tarihi: CALCULATE(MAX(Satislar[Tarih]), ALL(Satislar)) — ALL(Satislar) ilişkili boyutlardan gelen filtreleri de kaldırır. DATEDIFF(Son, ModelSon, DAY); boş durum için IF(NOT ISBLANK(Son), ...).' },
    { t: 'dax', name: 'Kargo Günü Eksik Payı',
      q: '<b>Kargo Günü Eksik Payı</b>: İptal edilmemiş satırlar içinde Satislar[KargoGun] değeri boş olan satırların payı. (İptaller zaten kargoya çıkmaz; onları pay ve paydadan çıkar.)',
      sol: 'DIVIDE(CALCULATE(COUNTROWS(Satislar), ISBLANK(Satislar[KargoGun]), Satislar[Durum] <> "İptal"), CALCULATE(COUNTROWS(Satislar), Satislar[Durum] <> "İptal"))',
      hint: 'Pay: CALCULATE(COUNTROWS(Satislar), ISBLANK(Satislar[KargoGun]), Satislar[Durum] <> "İptal"). Payda: aynı ifade ISBLANK filtresi olmadan. DIVIDE ile böl.' },
    { t: 'mc', q: 'Projenin 2. haftasında satış müdürü “bir de stok sayfası ekleyelim” diyor. Brifte stok yok. En iyi cevap?',
      o: ['Hemen ekleyip teslim tarihini korumaya çalışmak', 'Sonraki sürüm listesine yazmak', 'İsteği reddedip konuyu kapatmak', 'Stok verisini mevcut satış sayfasına sıkıştırmak'], a: 1,
      why: 'Bu kapsam kaymasıdır. İsteği kaybetme, ama mevcut sprinte de sokma: “sonraki sürüm” listesine yaz ve sponsorla birlikte önceliklendir.' },
    { t: 'mc', q: 'RACI tablosunda “KPI tanımları” satırında hem satış müdürü hem finans müdürü “A” olarak işaretli. Sorun ne?',
      o: ['Sorun yok; iki onay daha güvenlidir', 'R harfi eksik olduğu için tablo geçersizdir', 'Hesap veren tek kişi olmalı', 'Finans müdürü I olmalı, çünkü raporu kullanmaz'], a: 2,
      why: 'Accountable tek kişidir. İki A olunca anlaşmazlıkta kimin karar vereceği belirsiz kalır. Diğer taraf C (görüşü alınan) olabilir.' },
    { t: 'mc', q: 'Canlıya almadan bir gün önce. Hangisi tamamlandı tanımına <b>girmez</b>?',
      o: ['RLS rolleri “Farklı görüntüle” ile test edildi', 'Toplamlar kaynak sistemle mutabık', 'Yenileme hatası bir gruba bildiriliyor', 'Raporda en az on farklı görsel türü var'], a: 3,
      why: 'Görsel çeşitliliği bir kalite ölçütü değildir. Mutabakat, güvenlik testi ve yenileme bildirimi ise her projede olmalıdır.' },
    { t: 'mc', q: 'Satislar[KargoGun] sütununda 131 boş var; 121’i iptal, 10’u kargoda olan satır. Doğru yorum hangisi?',
      o: ['131 satır hatalıdır, kaynağa düzeltme talebi açılmalı', 'Boşlar iş kuralına uygun; teslim edilenlerde boş yok', 'Boş satırlar silinmeli, yoksa ortalama bozulur', 'KargoGun sütunu güvenilmez, modelden çıkarılmalı'], a: 1,
      why: 'İptal edilen sipariş kargoya çıkmaz, kargodaki siparişin teslim süresi henüz bilinmez. Tamlık ölçüsünü iş kuralına göre tanımla: teslim edilmiş satırlarda boş olmamalı.' },
    { t: 'mc', q: 'Yeni pano canlıda. Eski “Bölge Satış v3” raporu 30 gündür açılmadı. İlk adım ne olmalı?',
      o: ['Raporu ve anlam modelini hemen silmek', 'Raporu yeni bir çalışma alanına taşımak', 'Sahibine ve kullanıcılara haber vermek', 'Raporu yeni panoyla birleştirmek'], a: 2,
      why: 'Önce haber ver, sonra erişimi kaldır, sonra arşivle. Hemen silmek, modeli besleyen başka içerik varsa onları da bozabilir; önce etki analizine bakılır.' }
  ]
});

})(window);
