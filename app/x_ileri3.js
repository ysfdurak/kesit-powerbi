/* Kesit Power BI — ileri ders genişletmeleri (3): müşteri analitiği, segmentasyon, rapor tasarımı, bitirme, PL-300, DP-600, mülakat */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, o) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('ext: ders yok', id); return; } if (o.html) l.body += '<section class="deep"><span class="eyebrow">Uzmanlaş</span>' + o.html + '</section>'; if (o.ex) l.ex = (l.ex || []).concat(o.ex); if (o.min) l.min += o.min; (W.PBI_EXT = W.PBI_EXT || []).push({ id, html: o.html || '', ex: o.ex || [] }); };

/* ───────────────────────── 1. Müşteri analitiği ───────────────────────── */
ext('musteri-analitigi', { min: 16, html: `
<h2>Aktif müşteri: tanımı sen seçersin</h2>
<p>Pazarlama müdürü soruyor: “Şu anda kaç aktif müşterimiz var?” “Aktif” bir iş tanımıdır; raporu yazan kişi onu açıkça seçip belgeye yazar. Anadolu Market'te kullanılan tanım şu: <b>son 90 günde en az bir iptal edilmemiş siparişi olan müşteri</b>.</p>
<pre class="dax">Aktif Müşteri (90 Gün) =
COUNTROWS(
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -90, DAY),
        Satislar[Durum] &lt;&gt; "İptal"
    )
)</pre>
<h3>Motor bunu nasıl değerlendirir?</h3>
<ol>
<li><code>MAX(Tarih[Tarih])</code> dış bağlamda hesaplanır: 2024 hücresinde 31.12.2024.</li>
<li><code>DATESINPERIOD</code> geriye 90 günlük bir liste döndürür: 3 Ekim – 31 Aralık 2024.</li>
<li>CALCULATETABLE bu listeyi Tarih[Tarih] filtresinin yerine koyar; tarih tablosu işaretli olduğu için Yıl filtresi de kalkar. Hücre artık “son 90 günde alışveriş yapanlar”ı sayar.</li>
</ol>
<div class="tbl-wrap"><table><tr><th>Hücre</th><th>Müşteri Sayısı (dönem içinde)</th><th>Aktif Müşteri (90 Gün)</th></tr>
<tr><td>2022</td><td>32</td><td>28</td></tr><tr><td>2023</td><td>77</td><td>55</td></tr><tr><td>2024</td><td>123</td><td>89</td></tr><tr><td>2024-Ç4</td><td>90</td><td>89</td></tr></table></div>
<p>2024-Ç4'teki 1 kişilik fark öğreticidir: çeyrek 92 gün, pencere 90 gün. 1–2 Ekim'de alışveriş yapıp sonra gelmeyen müşteri çeyreğin müşterisidir ama “aktif” değildir.</p>
<h3>Kenar durumlar</h3>
<ul>
<li><b>Toplam satırı:</b> Kategori matrisinde satırlar 32, 32, 34, 5, 50, 46, 30 gösterir. Toplamları 229 eder, ama toplam satırı 89 der. Bir müşteri birden çok kategoriden alır. Bu doğrudur; araç ipucunda (tooltip) açıkla.</li>
<li><b>Gün sayımı:</b> <code>-90, DAY</code> son günü de sayar ve tam 90 gün verir. “Son alımdan bu yana ≤ 90 gün” yazarsan 91 gün sayarsın: 2024 sonunda 90 müşteri çıkar, ölçü 89 der. Tanımı veri sözlüğüne yaz.</li>
<li><b>TODAY() tuzağı:</b> Çapayı <code>TODAY()</code> yaparsan veri 31.12.2024'te bittiği hâlde pencere bugünden geriye kayar ve sonuç boş gelir. Yenileme bir gün gecikirse de sayı sessizce düşer. Çapa her zaman <b>verinin</b> son günü olmalı: <code>CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS())</code>.</li>
</ul>

<h2>Kayıp (churn) tanımını seçmek</h2>
<div class="tbl-wrap"><table><tr><th>Tanım</th><th>Nasıl ölçülür?</th><th>Ne zaman doğru?</th></tr>
<tr><td>Sabit eşik</td><td>Son alımdan bu yana X günden fazla geçti</td><td>Abonelik olmayan perakende; kampanya listesi</td></tr>
<tr><td>Dönem karşılaştırma</td><td>Önceki 12 ayda vardı, bu dönemde yok (<code>[Kayıp Müşteri]</code>)</td><td>Yıllık yönetim raporu, bütçe</td></tr>
<tr><td>Olay tabanlı</td><td>Üyelik iptali, sözleşme bitişi</td><td>Abonelik işi; olay verisi gerekir</td></tr></table></div>
<p>Sabit eşiği tahminle seçme. Müşterilerin iki alışveriş arasında normalde ne kadar beklediğine bak. Aşağıdaki sorgu bunu motorda hesaplar:</p>
<pre class="dax">EVALUATE
VAR T =
    ADDCOLUMNS(
        CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal"),
        "Ilk", CALCULATE(MIN(Satislar[Tarih]), Satislar[Durum] &lt;&gt; "İptal"),
        "Son", CALCULATE(MAX(Satislar[Tarih]), Satislar[Durum] &lt;&gt; "İptal"),
        "N", CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), Satislar[Durum] &lt;&gt; "İptal")
    )
VAR Tekrar = ADDCOLUMNS(FILTER(T, [N] &gt; 1), "Ara", DIVIDE(DATEDIFF([Ilk], [Son], DAY), [N] - 1))
RETURN
    ROW(
        "Medyan", MEDIANX(Tekrar, [Ara]),
        "Yuzde90", PERCENTILEX.INC(Tekrar, [Ara], 0.9)
    )</pre>
<p>Sonuç: tekrar alan 127 müşteride medyan aralık 83 gün, %90'lık değer 155 gün (%80'lik değer 136). 90 günlük bir “kayıp” eşiği normal davranan müşterilerin neredeyse yarısını kayıp sayar; 180 gün, %90'ın olağan aralığının dışında kalır. 2024 sonunda son alımı 180 günden eski müşteri sayısı 27. Rapor hâli Vaka: müşteri kaybı dersinde.</p>
<h3>Anti-kalıp: pencere uyuşmazlığı</h3>
<p>“Önceki 12 ayda vardı, bu dönemde yok” mantığını çeyrek kırılımına koyarsan şu olur: 2024 yıl hücresinde oran %16,9 (77 müşterinin 13'ü). Çeyreklerde ise %30–39 görünür. Çünkü 12 aylık bir geçmiş, 3 aylık bir gözlemle karşılaştırılıyor. Üç ay alışveriş yapmamak kayıp değildir. Kural: gözlem penceresi karşılaştırma penceresinden kısa olmamalı; olursa ölçü BLANK dönsün.</p>
<pre class="dax">Korumalı Yıllık Kayıp % =
VAR Gun = COUNTROWS(Tarih)
VAR DonemBasi = MIN(Tarih[Tarih])
VAR Onceki =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        DATESINPERIOD(Tarih[Tarih], DonemBasi - 1, -12, MONTH),
        Satislar[Durum] &lt;&gt; "İptal"
    )
VAR Simdi = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal")
RETURN
    IF(Gun &gt;= 365, DIVIDE(COUNTROWS(EXCEPT(Onceki, Simdi)) + 0, COUNTROWS(Onceki)))</pre>
<p><code>+ 0</code> önemli: boş kümede COUNTROWS BLANK döner ve 2023'te (2022 müşterilerinin hepsi geri döndü) oran %0 yerine boş görünür.</p>

<h2>CLV: müşteri yaşam boyu değeri</h2>
<p>Finans direktörü soruyor: “Yeni bir müşteri kazanmak için en fazla ne harcayabiliriz?” Cevap CLV'dir (Customer Lifetime Value). Tek bir doğru formül yok. Olasılıksal modeller Python ya da Fabric not defterinde kurulur ve sonucu tabloya yazılır; DAX tarafında üç yaklaşım var.</p>
<div class="tbl-wrap"><table><tr><th>Yaklaşım</th><th>Hesap</th><th>Güçlü yanı</th><th>Zayıf yanı</th></tr>
<tr><td>Tarihsel</td><td>Bugüne kadarki brüt kâr ÷ müşteri</td><td>Kesin, denetlenebilir</td><td>Geleceği söylemez; yeni müşteriyi küçük gösterir</td></tr>
<tr><td>Basit formül</td><td>Yıllık müşteri başı kâr × beklenen ömür (≈ 1 ÷ yıllık kayıp oranı)</td><td>Anlaşılır, tek ölçü</td><td>Kayıp oranına çok duyarlı</td></tr>
<tr><td>Kohort temelli</td><td>Her kohortun ay ay birikimli kârı</td><td>En dürüst eğri</td><td>Uzun geçmiş ister</td></tr>
</table></div>
<pre class="dax">Birikimli Müşteri Kârı =
VAR Son = MAX(Tarih[Tarih])
RETURN
    DIVIDE(
        CALCULATE([Brüt Kâr], REMOVEFILTERS(Tarih), Tarih[Tarih] &lt;= Son),
        CALCULATE([Müşteri Sayısı], REMOVEFILTERS(Tarih), Tarih[Tarih] &lt;= Son)
    )

Basit CLV =
VAR KarMusteri = DIVIDE([Brüt Kâr], [Müşteri Sayısı])
VAR Onceki = CALCULATE([Müşteri Sayısı], DATESINPERIOD(Tarih[Tarih], MIN(Tarih[Tarih]) - 1, -12, MONTH))
VAR Kayip = IF(COUNTROWS(Tarih) &gt;= 365, DIVIDE([Kayıp Müşteri] + 0, Onceki))
VAR Omur = MIN(5, DIVIDE(1, Kayip))
RETURN IF(Kayip &gt; 0, KarMusteri * Omur)</pre>
<p>2024 için: müşteri başı yıllık brüt kâr 2.346 ₺, kayıp oranı %16,9. Ömür 1 ÷ 0,169 ≈ 5,9 yıl çıkar; 5 yıllık tavanla CLV 11.730 ₺ olur. Birikimli kâr ise 2024 sonunda müşteri başı 3.354 ₺ (2023 sonunda 2.176 ₺).</p>
<ul>
<li><b>Kayıp oranı 0:</b> 2023'te 1 ÷ 0 sonsuz ömür demektir. <code>IF(Kayip &gt; 0, …)</code> bu hücreyi boş bırakır. Tavan (5 yıl) bir iş varsayımıdır; ölçü açıklamasına yaz.</li>
<li><b>Tek sayı verme:</b> Bir aralık sun: ömür 3 yılsa 7.038 ₺, 5 yılsa 11.730 ₺. Karar alt uçla verilir.</li>
<li><b>Segment farkı:</b> Tüm dönemde müşteri başı brüt kâr Premium'da 5.866 ₺, Bireysel'de 1.961 ₺. Ortalama bir CLV, iki çok farklı kitleyi tek sayıda saklar.</li>
</ul>

<h2>Kohort matrisi: üretimde üç tuzak</h2>
<h3>1. Sağdan sansür</h3>
<p>Son kohortların ileri ayları henüz yaşanmadı. <code>[Kohort Tutma %]</code> ölçüsü 12. ay sütununun toplamında %19,1 der (136 müşterinin 26'sı). Ama Ocak 2024'ten sonraki kohortlar 12. aya ulaşmadı; paydada olmamalılar. Yalnızca olgun kohortlarla oran %33,8 olur. 6. ayda fark %31,6'ya karşı %38,1.</p>
<pre class="dax">Olgun Kohort Tutma % =
VAR Ay = SELECTEDVALUE(Satislar[KohortAyFarki])
VAR SonTarih = CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS())
VAR Olgun =
    FILTER(
        VALUES(Musteriler[KohortAy]),
        VAR Ilk = CALCULATE(MIN(Musteriler[IlkSiparis]))
        RETURN NOT ISBLANK(Ilk) &amp;&amp; DATEDIFF(Ilk, SonTarih, MONTH) &gt;= Ay
    )
VAR Aktif = CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal", REMOVEFILTERS(Tarih), Olgun)
VAR Boyut =
    CALCULATE(
        DISTINCTCOUNT(Satislar[MusteriNo]),
        Satislar[KohortAyFarki] = 0, Satislar[Durum] &lt;&gt; "İptal", REMOVEFILTERS(Tarih), Olgun
    )
RETURN IF(NOT ISBLANK(Ay) &amp;&amp; Ay &gt;= 0, DIVIDE(Aktif, Boyut))</pre>
<h3>2. Negatif ay farkı</h3>
<p>Matriste −6 ile −1 arası sütunlar görünür. Kohort, ilk <b>iptal edilmemiş</b> siparişten hesaplanır. Ondan önce iptal edilmiş siparişi olan müşteri negatif fark üretir. Görsel filtresine <code>KohortAyFarki ≥ 0</code> koy ve bu kararı belgeye yaz.</p>
<h3>3. Küçük kohortlar</h3>
<p>2023-09 kohortunda 1 müşteri var; hücreleri ya %100 ya %0 görünür. Kohort büyüklüğünü ilk sütuna koy, 5'ten küçük kohortları gri yap ya da çeyreklik kohorta geç. Kohort büyüklüğü ölçüsünde <code>KohortAyFarki = 0</code> filtresi sütundan gelen ay farkının üzerine yazar; değer satırda sabit kalır.</p>

<h2>RFM'yi üretime almak</h2>
<p>Uygulamadaki <code>[RFM Skoru]</code> sabit eşikler kullanıyor (ör. son 12 ay satışı 12.000 ₺ ve üstü → M = 5). İki seçenek var:</p>
<p><b>Sabit eşik</b> yıllar arası kıyası anlamlı tutar (“Şampiyon” her yıl aynı ölçüt) ama dağılım dengesiz olabilir: 2024'te 123 müşteriden yalnızca 16'sı M ≥ 12.000. <b>Yüzdelik eşik</b> her puana yaklaşık eşit müşteri koyar ama dağılım her yıl yeniden bölündüğü için yıl kıyası zayıflar. 2024 net satışında %20'lik sınırlar 2.030 / 3.735 / 5.372 / 9.305 ₺. Segment dağılımı 2023 sonundan 2024 sonuna şöyle değişti: Şampiyon 17 → 27, Potansiyel sadık 37 → 75, Kaybedilmiş 0 → 13.</p>
<h3>Ölçü mü, anlık görüntü mü?</h3>
<p>Ölçü dilimleyiciye tepki verir; keşif için iyidir. Ama CRM ekibi “1 Kasım'da Şampiyon olanlara kampanya gönderdik” dediğinde rapor aynı listeyi yeniden üretebilmelidir. Bunun için her ay sonunda bir <b>anlık görüntü tablosu</b> (Ay, MusteriNo, Segment) yazılır; segment geçişleri de bu tablodan basit bir sayımla çıkar. Milyonlarca müşteride ölçü her hücrede müşteri başına üç CALCULATE çalıştırır; o ölçekte anlık görüntü zorunludur (DAX optimizasyonu dersi).</p>
<div class="tip"><b>Yayın öncesi kontrol listesi</b>Tanımlar veri sözlüğünde mi? Çapa verinin son günü mü? Kayıp eşiği aralık dağılımına dayanıyor mu? Kohortta olgun payda, büyüklük sütunu ve ay farkı ≥ 0 filtresi var mı? CLV aralık ve varsayımlarıyla mı sunuluyor? Kampanya segmentleri anlık görüntüden mi?</div>
`, ex: [
  { t:'dax', name:'Aktif Müşteri (90 Gün)', q:'<b>Aktif Müşteri (90 Gün)</b>: Filtre bağlamının son gününden geriye 90 gün içinde en az bir iptal edilmemiş siparişi olan müşteri sayısı. 2024 hücresi 89 olmalı.', sol:'COUNTROWS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -90, DAY), Satislar[Durum] <> "İptal"))', hint:'Müşteri listesini CALCULATETABLE ile al; tarih penceresi DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -90, DAY).' },
  { t:'dax', name:'Yıllık Kayıp Oranı %', q:'<b>Yıllık Kayıp Oranı %</b>: Dönem başından önceki 12 ayda alışveriş yapan müşterilerden bu dönemde alışveriş yapmayanların oranı (iptaller hariç). Hiç kayıp yoksa boş değil %0 göstersin. Kontrol yıl kırılımında yapılır: 2024 için yaklaşık %16,9.', sol:'VAR DonemBasi = MIN(Tarih[Tarih]) VAR Onceki = CALCULATETABLE(VALUES(Satislar[MusteriNo]), DATESINPERIOD(Tarih[Tarih], DonemBasi - 1, -12, MONTH), Satislar[Durum] <> "İptal") VAR Simdi = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal") RETURN DIVIDE(COUNTROWS(EXCEPT(Onceki, Simdi)) + 0, COUNTROWS(Onceki))', hint:'Önceki 12 ayın müşterileri EXCEPT bu dönemin müşterileri; payda önceki kümenin büyüklüğü. Boş küme için COUNTROWS(...) + 0.', grid:[{t:'Tarih',c:'Yil'}] },
  { t:'dax', name:'Kohort Büyüklüğü', q:'<b>Kohort Büyüklüğü</b>: Kohort matrisinin ilk sütunu için, satırdaki kohortun 0. ayında (KohortAyFarki = 0) alışveriş yapan müşteri sayısı. Takvim filtrelerini yok say, iptalleri hariç tut. Kontrol Musteriler[KohortAy] kırılımında yapılır.', sol:'CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[KohortAyFarki] = 0, Satislar[Durum] <> "İptal", REMOVEFILTERS(Tarih))', hint:'DISTINCTCOUNT(Satislar[MusteriNo]) üç filtreyle: KohortAyFarki = 0, Durum <> "İptal", REMOVEFILTERS(Tarih).', grid:[{t:'Musteriler',c:'KohortAy'}] },
  { t:'dax', name:'Birikimli Müşteri Kârı', q:'<b>Birikimli Müşteri Kârı</b>: Tarihsel CLV. Verinin başından filtre bağlamının son gününe kadar elde edilen brüt kârın, aynı aralıkta alışveriş yapan müşteri sayısına bölümü. 2024 hücresi yaklaşık 3.354 ₺.', sol:'VAR Son = MAX(Tarih[Tarih]) RETURN DIVIDE(CALCULATE([Brüt Kâr], REMOVEFILTERS(Tarih), Tarih[Tarih] <= Son), CALCULATE([Müşteri Sayısı], REMOVEFILTERS(Tarih), Tarih[Tarih] <= Son))', hint:'Son günü önce bir değişkene al. Pay ve payda aynı pencereyi kullanmalı: REMOVEFILTERS(Tarih), Tarih[Tarih] <= Son.' },
  { t:'mc', q:'CRM ekibi “90 gündür alışveriş yapmayanlara geri kazanma kampanyası” istiyor. Senin hesabına göre tekrar alan müşterilerde iki alışveriş arası medyan 83 gün, %90’lık değer 155 gün. Ne önerirsin?', o:['Eşiği 90 günde bırakmak, çünkü talep böyle geldi','Eşiği dağılıma göre 180 güne çekmek','Eşiği medyan aralığa, yani 83 güne indirmek','Kayıp tanımı yerine yalnızca RFM segmentini kullanmak'], a:1, why:'90 gün, normal davranan müşterilerin neredeyse yarısını “kayıp” sayar; kampanya bütçesi zaten dönecek müşterilere harcanır. %90’lık değerin üstünde bir eşik (180 gün gibi) olağan aralığın dışında kalanları yakalar. Medyana inmek sorunu büyütür. RFM de bir recency eşiği kullanır; tanım sorusunu ortadan kaldırmaz.' },
  { t:'mc', q:'Kohort matrisinin 12. ay sütununun toplam satırı %19 tutma gösteriyor. Ürün müdürü “bir yılda müşterilerin beşte dördünü kaybediyoruz” diye sunum hazırlıyor. İlk ne kontrol edersin?', o:['Paydada 12. aya henüz ulaşmamış kohortların olup olmadığını','Tarih tablosunun tarih tablosu olarak işaretlenip işaretlenmediğini','Ölçünün DISTINCTCOUNT yerine COUNT ile müşteri sayıp saymadığını','Matris satırlarında KohortAy yerine Tarih[Yil] kullanılıp kullanılmadığını'], a:0, why:'Son kohortlar 12. aya ulaşmadığı için paydada sayılıp payda hiç görünmezler; oran yapay olarak düşer (bu modelde %19,1 yerine olgun kohortlarla %33,8). Tarih işareti zaman fonksiyonlarını etkiler, burada sorun değil. COUNT kullanımı oranı tersine şişirirdi. Satır alanı değişse toplam yine aynı sansür hatasını taşırdı.' },
  { t:'mc', q:'Pazarlama, 1 Kasım’da “Şampiyon” segmentine e-posta gönderdi. Aralıkta raporda o tarihin Şampiyonlarını açtıklarında liste farklı çıkıyor. Kalıcı çözüm hangisi?', o:['Segment ölçüsünü Musteriler’de hesaplanmış sütuna çevirmek','Ay sonlarında segment anlık görüntüsü saklamak','Raporda tarih dilimleyicisini 1 Kasım’a sabitlemek','RFM puan eşiklerini sabit değerden yüzdeliğe çevirmek'], a:1, why:'Ölçü her etkileşimde yeniden hesaplanır ve geç gelen iade, iptal gibi değişiklikler geçmiş listeyi de değiştirir. Ay sonu anlık görüntüsü gönderilen listeyi dondurur ve segment geçişlerini de sayılabilir yapar. Hesaplanmış sütun her yenilemede yeniden hesaplanır; geçmişi tutmaz. Dilimleyiciyi sabitlemek veri değişikliğini durdurmaz. Eşik türü bu sorunla ilgili değil.' }
] });

/* ───────────────────────── 2. Segmentasyon ───────────────────────── */
ext('segmentasyon', { min: 15, html: `
<h2>Dört segmentleme yolu: hangisi ne zaman?</h2>
<p>Satış direktörü üç şey istiyor: müşterileri yıllık harcamaya göre bantlara ayırmak, her bandın satış payını görmek ve “geçen yıla göre kaç müşteri üst banda çıktı?” sorusunu cevaplamak. Önce hangi yolu kullanacağına karar ver.</p>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Filtreye tepki</th><th>Eksende kullanım</th><th>Maliyet</th><th>Doğru olduğu yer</th></tr>
<tr><td>Hesaplanmış sütun</td><td>Yok</td><td>Doğrudan</td><td>Yenilemede bir kez</td><td>Ömür boyu değer, kayıt kanalı gibi sabit özellikler</td></tr>
<tr><td>Ölçü + ilişkisiz bant tablosu</td><td>Var</td><td>Bant tablosu üzerinden</td><td>Her hücrede müşteri sayısıyla orantılı</td><td>Keşif, “seçili dönemde hangi bant?”</td></tr>
<tr><td>Yüzdelik eşik (ölçü)</td><td>Var</td><td>Bant tablosu ya da kart</td><td>Sıralama + yüzdelik hesap</td><td>“En iyi %20” gibi göreli tanımlar</td></tr>
<tr><td>Anlık görüntü tablosu</td><td>Dondurulmuş</td><td>Doğrudan</td><td>Kaynakta, ayda bir</td><td>Kampanya listeleri, geçiş analizi, denetim</td></tr></table></div>

<h2>İlişkisiz bant tablosu: mekanizma ve toplam satırı</h2>
<p><code>MusteriDilimleri</code> tablosunun modelde hiçbir ilişkisi yok. Matrisin satırına <code>Dilim</code> konduğunda filtre yalnızca bu küçük tabloyu daraltır; Satislar'a ulaşmaz. Bu yüzden ölçü üç iş yapar: müşterileri ve satışlarını sanal bir tabloda hesaplar, görünen bant satırlarını dolaşır, sınırlar arasındaki müşterileri toplar. Hazır <code>[Dilimdeki Müşteri]</code> ölçüsü bunu <code>SUMX(MusteriDilimleri, …)</code> ile yapar.</p>
<h3>Anti-kalıp: SELECTEDVALUE ile sınır okumak</h3>
<pre class="dax">Naif Dilim Müşterisi =
VAR AltSinir = SELECTEDVALUE(MusteriDilimleri[Min])
VAR UstSinir = SELECTEDVALUE(MusteriDilimleri[Max])
RETURN
    COUNTROWS(
        FILTER(VALUES(Musteriler[MusteriNo]), [Net Satış] &gt; AltSinir &amp;&amp; [Net Satış] &lt;= UstSinir)
    )</pre>
<p>2024 seçiliyken bant satırları doğru görünür: Küçük 24, Orta 53, Büyük 36, VIP 10. Ama toplam satırı <b>boş</b> gelir. Toplamda dört bant birden görünür, SELECTEDVALUE BLANK döner ve hiçbir müşteri koşulu sağlamaz. <code>SUMX(MusteriDilimleri, …)</code> kalıbı ise toplamda dört bandı tek tek dolaşır ve 123 verir. Kural: ilişkisiz tablodan değer okuyorsan, toplam satırında birden çok satır görüneceğini varsay ve satırları dolaş.</p>
<h3>Sınırların çakışması</h3>
<p>Bantlar “alt sınır hariç, üst sınır dahil” kuralıyla tanımlı: <code>[S] &gt; Min &amp;&amp; [S] &lt;= Max</code>. İki tarafı da dahil yazarsan, tam 6.000 ₺ harcayan bir müşteri hem Orta'da hem Büyük'te sayılır. Satırların toplamı toplam satırından büyük çıkar. Bu modelde tam sınırda müşteri olmadığı için hata bugün görünmez; veri büyüdüğünde sessizce ortaya çıkar. Bunu test sayfana bir kontrol olarak ekle: bant satırlarının toplamı, toplam satırına eşit mi?</p>
<h3>Bant payı ve toplam</h3>
<pre class="dax">Bant Satış Payı % =
DIVIDE([Dilim Satışı], [Net Satış])</pre>
<p>Pay ölçüsü ilişkisiz tabloda kolaydır, çünkü <code>[Net Satış]</code> bant filtresinden etkilenmez: payda her satırda dönemin tamamıdır. 2024'te VIP bandı 10 müşteriyle 184.624 ₺ getirir (%24,7). Tüm yıllar birlikte alındığında VIP'te 34 müşteri ve %56,6 pay görünür. Aynı bant tanımı, dönem uzadıkça müşterileri yukarı taşır. Yıllık eşikleri tüm dönemde kullanma; ya dönemi sabitle ya eşikleri dönem uzunluğuna göre ölçekle.</p>

<h2>Göreli segment: yüzdelik eşik</h2>
<p>“En iyi %20 müşterimiz satışın ne kadarını getiriyor?” Burada eşik sabit değil; seçili döneme ve kategoriye göre yeniden hesaplanır.</p>
<pre class="dax">Müşteri 80. Yüzdelik Satışı =
PERCENTILEX.INC(
    ADDCOLUMNS(
        CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal"),
        "S", [Net Satış]
    ),
    [S], 0.8
)

Üst Beşte Bir Payı % =
VAR Esik = [Müşteri 80. Yüzdelik Satışı]
VAR T =
    ADDCOLUMNS(
        CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal"),
        "S", [Net Satış]
    )
RETURN DIVIDE(SUMX(FILTER(T, [S] &gt;= Esik), [S]), [Net Satış])</pre>
<p>2024'te eşik 9.305 ₺; bu eşiği geçen müşteriler satışın %48,4'ünü getirir. Elektronik'te eşik 7.420 ₺ ve pay %57,1; Hediye'de eşik 580 ₺ ve pay %35,1. Neden <code>VALUES(Musteriler[MusteriNo])</code> değil de Satislar'dan alınan liste? Musteriler'de 150 kayıt var. Seçili dönemde alışveriş yapmayanlar BLANK satışla yüzdelik hesabına girerse eşik aşağı kayar. Kenar durum: eşikte birden çok müşteri varsa <code>&gt;=</code> nedeniyle “%20” biraz fazla müşteri kapsayabilir. Kartın altına gerçek müşteri sayısını yaz.</p>

<h2>Segment geçişleri: bu yıl ve geçen yıl</h2>
<p>Geçiş sorusunun iki biçimi var. Tek sayı (“kaç müşteri üst banda çıktı?”) bir ölçüyle cevaplanır:</p>
<pre class="dax">Bandı Yükselen Müşteri =
VAR T = ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "Bu", [Net Satış], "GY", [Satış GY])
RETURN
    COUNTROWS(
        FILTER(
            T,
            VAR B1 = MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] &lt; [Bu] &amp;&amp; [Bu] &lt;= MusteriDilimleri[Max]), MusteriDilimleri[Sira])
            VAR B0 = MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] &lt; [GY] &amp;&amp; [GY] &lt;= MusteriDilimleri[Max]), MusteriDilimleri[Sira])
            RETURN NOT ISBLANK(B0) &amp;&amp; B1 &gt; B0
        )
    )</pre>
<p>2024'te 28 müşteri üst banda çıktı; 25 müşteri alt banda indi ya da hiç alışveriş yapmadı. Tam geçiş matrisi (2023 bandı × 2024 bandı) için iki ilişkisiz bant tablosu gerekir: biri satırlara, biri sütunlara. Modelde tek tablo varsa geçişi önce bir DAX sorgusuyla doğrula:</p>
<pre class="dax">EVALUATE
VAR T =
    ADDCOLUMNS(
        VALUES(Musteriler[MusteriNo]),
        "S23", CALCULATE([Net Satış], Tarih[Yil] = 2023),
        "S24", CALCULATE([Net Satış], Tarih[Yil] = 2024)
    )
VAR T2 =
    ADDCOLUMNS(
        T,
        "Onceki", COALESCE(MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] &lt; [S23] &amp;&amp; [S23] &lt;= MusteriDilimleri[Max]), MusteriDilimleri[Dilim]), "Yok"),
        "Simdi", COALESCE(MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] &lt; [S24] &amp;&amp; [S24] &lt;= MusteriDilimleri[Max]), MusteriDilimleri[Dilim]), "Yok")
    )
RETURN GROUPBY(T2, [Onceki], [Simdi], "Musteri", COUNTX(CURRENTGROUP(), 1))
ORDER BY [Onceki], [Simdi]</pre>
<p>Sorgu ilginç bir tablo verir: 2023'te Büyük bantta olan 24 müşteriden 7'si yerinde kaldı, 4'ü VIP'e çıktı, 8'i Orta'ya indi, 4'ü hiç gelmedi. 2023'te alışveriş yapmayıp 2024'te gelen 59 müşteri var (“Yok” satırı). Bu satırlar “Yükselen” değildir; yeni müşteridir. Ölçüdeki <code>NOT ISBLANK(B0)</code> koşulu tam olarak bunu ayırır.</p>
<div class="note"><b>Üretim notu</b>Geçiş ölçüsü her hücrede müşteri sayısı × 2 bağlam geçişi yapar. Birkaç bin müşteride sorun yok. Yüz binlerde, aylık anlık görüntü tablosu (Ay, MusteriNo, Bant) kaynakta hazırlanır ve geçiş basit bir sayıma döner. Hangi yolu seçtiğini rapor belgesine yaz; iki ekip aynı soruya iki farklı sayıyla gelmesin.</div>
<div class="tip"><b>Kontrol listesi</b>Bant sınırları tek taraflı mı (Min hariç, Max dahil)? Toplam satırı satırların toplamına eşit mi? İlişkisiz tablodan değer okuyan ölçü toplamda satırları dolaşıyor mu? Yıllık eşikler çok yıllık dönemde kullanılmıyor mu? Yüzdelik eşiğin altında gerçek müşteri sayısı yazıyor mu? Geçişte yeni müşteri ile yükselen müşteri ayrılıyor mu?</div>
`, ex: [
  { t:'dax', name:'Bant Satış Payı %', q:'<b>Bant Satış Payı %</b>: Satırlarda MusteriDilimleri[Dilim] var. Her bandın, seçili dönemin net satışı içindeki payı. Toplam satırı %100 olmalı.', sol:'DIVIDE([Dilim Satışı], [Net Satış])', hint:'Pay için hazır [Dilim Satışı] ölçüsünü kullan. [Net Satış] ilişkisiz bant tablosundan etkilenmez; paydaya doğrudan yazılabilir.', grid:[{t:'MusteriDilimleri',c:'Dilim'}] },
  { t:'dax', name:'Müşteri 80. Yüzdelik Satışı', q:'<b>Müşteri 80. Yüzdelik Satışı</b>: Seçili bağlamda alışveriş yapmış (iptal edilmemiş siparişi olan) müşterilerin net satışlarının 80. yüzdeliği. Bu, “en iyi %20” bandının eşiğidir. 2024 için 9.305 ₺.', sol:'PERCENTILEX.INC(ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), "S", [Net Satış]), [S], 0.8)', hint:'Müşteri listesini Satislar’dan al (Durum <> "İptal"); ADDCOLUMNS ile her müşterinin [Net Satış]’ını ekle; PERCENTILEX.INC(tablo, [S], 0.8).' },
  { t:'dax', name:'Bandı Yükselen Müşteri', grid:[{t:'Tarih',c:'Yil'}], q:'<b>Bandı Yükselen Müşteri</b>: Geçen yılın aynı döneminde bir banttayken (MusteriDilimleri, Min hariç, Max dahil) bu dönemde daha yüksek Sira numaralı bir banda çıkan müşteri sayısı. Geçen yıl hiç alışveriş yapmayanlar sayılmaz. 2024 için 28.', sol:'VAR T = ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "Bu", [Net Satış], "GY", [Satış GY]) RETURN COUNTROWS(FILTER(T, VAR B1 = MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [Bu] && [Bu] <= MusteriDilimleri[Max]), MusteriDilimleri[Sira]) VAR B0 = MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [GY] && [GY] <= MusteriDilimleri[Max]), MusteriDilimleri[Sira]) RETURN NOT ISBLANK(B0) && B1 > B0))', hint:'Önce müşteri başına [Net Satış] ve [Satış GY] içeren bir tablo kur. Her satırda iki bandın Sira değerini MAXX(FILTER(MusteriDilimleri, …)) ile bul, sonra karşılaştır.' },
  { t:'query', q:'2023 bandından 2024 bandına geçiş tablosunu yazan bir DAX sorgusu yaz. Her müşteri için iki yılın net satışını hesapla, MusteriDilimleri ile bant adını bul (alışveriş yoksa "Yok"), sonra (Onceki, Simdi) çiftlerine göre müşteri say.', start:'EVALUATE\n', sol:'EVALUATE\nVAR T = ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "S23", CALCULATE([Net Satış], Tarih[Yil] = 2023), "S24", CALCULATE([Net Satış], Tarih[Yil] = 2024))\nVAR T2 = ADDCOLUMNS(T, "Onceki", COALESCE(MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [S23] && [S23] <= MusteriDilimleri[Max]), MusteriDilimleri[Dilim]), "Yok"), "Simdi", COALESCE(MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [S24] && [S24] <= MusteriDilimleri[Max]), MusteriDilimleri[Dilim]), "Yok"))\nRETURN GROUPBY(T2, [Onceki], [Simdi], "Musteri", COUNTX(CURRENTGROUP(), 1))\nORDER BY [Onceki], [Simdi]', hint:'İki ADDCOLUMNS adımı: önce satışlar, sonra bant adları. Gruplama için GROUPBY ve COUNTX(CURRENTGROUP(), 1).' },
  { t:'mc', q:'Bir analistin bant ölçüsü satırlarda doğru sayıları gösteriyor, ama matrisin toplam satırı boş. Ölçü, sınırları SELECTEDVALUE(MusteriDilimleri[Min]) ve SELECTEDVALUE(MusteriDilimleri[Max]) ile okuyor. Ne önerirsin?', o:['Toplam satırını matrisin biçim ayarlarından kapatmak','Bantları SUMX(MusteriDilimleri, …) ile dolaşmak','MusteriDilimleri ile Musteriler arasında ilişki kurmak','SELECTEDVALUE’ya varsayılan değer olarak 0 vermek'], a:1, why:'Toplamda dört bant birden görünür ve SELECTEDVALUE BLANK döner. Bantları SUMX ile tek tek dolaşmak her satırda ve toplamda doğru sonucu verir (2024’te 123). Toplamı kapatmak sorunu gizler. Bant tablosunun Musteriler’le ortak bir anahtarı yok; ilişki kurulamaz. Varsayılan 0, toplamda Min = 0 ve Max = 0 yapar; yine hiç müşteri saymaz.' },
  { t:'mc', q:'Bant eşikleri yıllık harcamaya göre seçildi (VIP > 15.000 ₺). Bir yönetici dilimleyicide tüm yılları seçince VIP bandında 34 müşteri ve %57 pay görüyor; 2024’te 10 müşteri ve %25. Ne yaparsın?', o:['Hiçbir şey yapmamak; ölçü teknik olarak doğru çalışıyor','VIP eşiğini elle 15.000 ₺ yerine 30.000 ₺ yapmak','Dönemi tek yıla sabitlemek ya da eşiği ölçeklemek','Bant ölçüsünü Musteriler’de hesaplanmış sütuna çevirmek'], a:2, why:'Ölçü teknik olarak doğrudur ama yıllık bir tanımı üç yıllık harcamaya uyguladığı için müşterileri yukarı taşır; iş anlamı bozulur. Ya dönem tek yıla sabitlenir ya eşikler gün sayısına göre ölçeklenir. Eşiği elle yükseltmek tek bir dilimleyici durumuna göre ayar yapmaktır. Hesaplanmış sütun dönemi hiç dikkate almaz; tersi bir hata üretir.' },
  { t:'mc', q:'Bant tanımında koşul [S] >= Min && [S] &lt;= Max yazılmış. Test paketine hangi kontrolü eklersin?', o:['Her bandın en az bir müşteri içermesi','Bant satırları toplamının toplam satırına eşitliği','Toplam satırının Müşteri Sayısı ölçüsünden büyük olması','Bant tablosunun tam 4 satırdan oluşması'], a:1, why:'İki taraflı dahil koşul, tam sınırda harcayan bir müşteriyi iki bantta sayar. O zaman satırların toplamı toplam satırını aşar. Eşitlik kontrolü bu hatayı yakalar. Boş bant bir hata değildir. Toplamın Müşteri Sayısı’ndan büyük olması hatanın kendisidir; test bunu beklememeli. Satır sayısı sınır mantığını test etmez.' }
] });

/* ───────────────────────── 3. Rapor tasarımı ───────────────────────── */
ext('dashboard-tasarim', { min: 15, html: `
<h2>Bilgi hiyerarşisi: üç soru, üç katman</h2>
<p>Genel müdür pazartesi toplantısında rapora 30 saniye bakacak. Bu sürede iki soruya cevap almalı: “Hedefin neresindeyiz?” ve “Sorun nerede?” Tasarımın işi, gözün bu iki cevaba ilk önce gitmesini sağlamaktır.</p>
<div class="tbl-wrap"><table><tr><th>Katman</th><th>Soru</th><th>Anadolu Market örneği (2024)</th><th>Nerede durur?</th></tr>
<tr><td>1. Durum</td><td>İyi mi, kötü mü?</td><td>Net satış 747.066 ₺, hedefin %97,9'u</td><td>Sol üst şerit, en büyük yazı</td></tr>
<tr><td>2. Neden</td><td>Fark nereden geliyor?</td><td>Hediye %83,6 ile en geride; Kitap %100,2</td><td>Orta bölge: kategori × hedef, aylık eğilim</td></tr>
<tr><td>3. Ayrıntı</td><td>Hangi ürün, hangi müşteri?</td><td>Hediye ürünleri, iade oranı, son 12 ay</td><td>Detay sayfası, araç ipucu</td></tr></table></div>
<p>Görsel ağırlığı üç şey belirler: <b>boyut</b>, <b>konum</b> ve <b>kontrast</b>. Bir sayfada yalnızca bir öğe “en ağır” olmalı. İki büyük grafik yan yana durursa göz ikisi arasında gidip gelir ve hiyerarşi kaybolur. Hızlı test: sayfayı bulanıklaştırılmış hâlde düşün. Hâlâ seçilebilen tek bir blok kalıyorsa hiyerarşi doğrudur.</p>

<h2>Izgara sistemi: piksele kadar plan</h2>
<p>16:9 tuval 1280 × 720 pikseldir. 12 sütunlu bir ızgara kur: dış kenar boşluğu 24 px, sütun arası 16 px. Bir sütun (1280 − 2 × 24 − 11 × 16) ÷ 12 = 88 px olur.</p>
<div class="tbl-wrap"><table><tr><th>Öğe</th><th>Sütun</th><th>Genişlik</th></tr>
<tr><td>KPI kartı (4 adet yan yana)</td><td>3</td><td>3 × 88 + 2 × 16 = 296 px</td></tr>
<tr><td>Ana grafik</td><td>8</td><td>8 × 88 + 7 × 16 = 816 px</td></tr>
<tr><td>Yan grafik</td><td>4</td><td>4 × 88 + 3 × 16 = 400 px</td></tr></table></div>
<p>Dört kart ve üç aralık tam 1.232 px eder: 1280'den iki kenar boşluğu çıkınca kalan genişlik. Görünüm (View) sekmesinde Kılavuz çizgileri (Gridlines) ve Izgaraya yasla (Snap to grid) açılır. Kesin değerler Biçim bölmesinde Genel → Özellikler → Boyut ve Konum alanlarına elle girilir. Ekipte herkes aynı ızgarayı kullansın diye ızgarayı ve başlık şeridini içeren boş bir şablon sayfası hazırla, her yeni sayfayı ondan çoğalt.</p>

<h2>Sayfa mimarisi: ne nerede açılır?</h2>
<p>Kademeli açıklamanın düğme, panel ve alan parametresi teknikleri Kullanıcı odaklı tasarım dersinde; yer işareti, araç ipucu ve detay sayfasının kurulumu Raporla hikâye anlatmak dersinde. Burada karar kısmına bakıyoruz: bir bilgi hangi mekanizmaya gider?</p>
<div class="tbl-wrap"><table><tr><th>Kullanıcı bunu…</th><th>Mekanizma</th><th>Kural</th></tr>
<tr><td>her açılışta görmeli</td><td>Ana sayfa görseli</td><td>Bütçeden yer kaplar; gerçekten gerekli mi?</td></tr>
<tr><td>bir noktanın üstünde merak eder</td><td>Araç ipucu sayfası</td><td>Tek soru, 2–3 küçük görsel, hızlı açılmalı</td></tr>
<tr><td>tek bir varlık için derine iner</td><td>Detay sayfası (drillthrough)</td><td>Bir kategori, bir müşteri; geri düğmesi zorunlu</td></tr>
<tr><td>aynı soruya başka açıdan bakar</td><td>Alan parametresi ya da yer işareti</td><td>Görsel değişimi için önce alan parametresi</td></tr></table></div>
<p>Tipik bir yönetici raporu: 1 özet sayfası, 2–3 analiz sayfası, 1–2 detay sayfası, 1–2 araç ipucu sayfası. Yardımcı sayfaları gizle ve adlarına önek ver (“İP_Kategori”, “DS_Ürün”). Böylece ekip arkadaşın sayfa listesinde neyin ne olduğunu bir bakışta anlar.</p>
<div class="warn"><b>Anti-kalıp: yer işareti yığını</b>Görsel değiştirmek için 12 yer işareti kuran bir rapor, her yeni görselde 12 yer işaretinin yeniden güncellenmesini ister. Ayrıca “Veri” seçeneği açık bırakılan yer işaretleri dilimleyici seçimini de kaydeder; kullanıcı düğmeye bastığında kendi seçimi sıfırlanır. Görsel değiştirmeyi alan parametresiyle yap; yer işaretlerinde yalnızca “Görüntüle” durumunu tut.</div>

<h2>Performans bütçesi</h2>
<p>Her veri görseli en az bir sorgu gönderir. Sayfa açılırken bu sorgular paralel çalışır ama sınırsız değildir; ayrıca her görsel ayrıca çizilir. Bu yüzden görsel sayısı bir bütçedir:</p>
<ul>
<li><b>Özet sayfası:</b> en fazla 8–10 veri görseli. Dört ayrı kart yerine birden çok değeri tek görselde gösteren bir kart düşün.</li>
<li><b>Ayrıntı tablosu:</b> özet sayfasında nadiren kullanılıyorsa detay sayfasına taşı. En pahalı görsel çoğunlukla çok satırlı tablodur.</li>
<li><b>Ölç, tahmin etme:</b> Performans Analizi'nde (Performance Analyzer) her görselin DAX sorgusu ve görsel çizim süresini ayrı ayrı gör. Sorgu yavaşsa sorun DAX'ta ya da modelde; çizim yavaşsa görsel sayısında ya da görsel türündedir.</li>
</ul>

<h2>Durum rengi ve dinamik başlık</h2>
<p>Koşullu biçimlendirmede renk kurallarını görselde tek tek tanımlamak yerine rengi bir ölçüye taşı. Kural tek yerde durur; kart, tablo ve madde grafiği aynı eşiği kullanır.</p>
<pre class="dax">KPI Durum Rengi =
VAR Oran = [Hedef Gerçekleşme %]
RETURN
    SWITCH(
        TRUE(),
        ISBLANK(Oran), "#8A8A8A",
        Oran &gt;= 1, "#1B7F3B",
        Oran &gt;= 0.95, "#B26A00",
        "#B42318"
    )</pre>
<p>Biçim bölmesinde renk alanının yanındaki <b>fx</b> düğmesi → Biçim stili: Alan değeri → bu ölçü. 2024'te sonuç turuncu (%97,9), Hediye kırmızı (%83,6).</p>
<p><b>Kenar durum: yuvarlama.</b> 2023 oranı %99,6. Kart “%0” ondalıkla biçimlenmişse ekranda “%100” yazar ama renk turuncu kalır. Kullanıcı “hedefi tutturmuşuz, neden turuncu?” diye sorar. Ya bir ondalık göster (%99,6) ya da eşiği ekranda görünen yuvarlanmış değere göre kur. Renk tek başına anlam taşımamalı; yanına ▲ ▼ gibi bir simge ya da “Hedefin altında” metni koy. Bu hem renk körlüğü olan kullanıcılar hem de siyah-beyaz çıktı için gereklidir.</p>
<pre class="dax">Seçim Özeti Başlığı =
VAR Kat =
    IF(
        ISFILTERED(Kategoriler[Kategori]),
        IF(
            HASONEVALUE(Kategoriler[Kategori]),
            SELECTEDVALUE(Kategoriler[Kategori]),
            COUNTROWS(VALUES(Kategoriler[Kategori])) &amp; " kategori"
        ),
        "Tüm kategoriler"
    )
VAR Yil = IF(HASONEVALUE(Tarih[Yil]), FORMAT(SELECTEDVALUE(Tarih[Yil]), "0"), "Tüm yıllar")
RETURN "Net satış · " &amp; Kat &amp; " · " &amp; Yil</pre>
<p>Kitap ve Spor seçiliyse başlık “Net satış · 2 kategori · Tüm yıllar” olur. Neden ISFILTERED? Filtre yokken de HASONEVALUE yanlış döner; ISFILTERED “hiç seçim yok” ile “birden çok seçim”i ayırır. Kullanıcı Urunler[Kategori] sütunundan filtrelerse ISFILTERED(Kategoriler[Kategori]) yanlış döner; bu durumda ISCROSSFILTERED kullan.</p>

<h2>Erişilebilirlik: ileri kontroller</h2>
<ul>
<li><b>Kontrast:</b> Metin ile arka plan arasında en az 4,5:1 kontrast hedefle. Açık gri eksen etiketleri en sık hatadır.</li>
<li><b>Sekme sırası:</b> Seçim bölmesindeki Sekme sırası görünümünde, klavyeyle gezen kullanıcı için sırayı bilgi hiyerarşisiyle aynı yap: KPI'lar, ana grafik, ayrıntı. Dekoratif şekilleri sekme sırasından çıkar.</li>
<li><b>Alternatif metin:</b> fx ile bir ölçüye bağlanabilir. Böylece ekran okuyucu “Net satış 747.066 ₺, hedefin %97,9'u” gibi güncel bir cümle okur.</li>
</ul>
<p>Temel ayarlar Mobil düzen, erişilebilirlik dersinde.</p>

<h2>Tasarım eleştirisi kontrol listesi</h2>
<p>Bir raporu eleştirirken her maddeyi <b>gözlem → etki → öneri</b> biçiminde yaz. Örnek: “İki ana grafik aynı boyutta (gözlem). Göz önce nereye bakacağını bilmiyor (etki). Hedef grafiğini 8 sütuna büyüt, eğilimi 4 sütuna al (öneri).”</p>
<ol>
<li>Ana mesaj 5 saniyede okunuyor mu? Tek bir “en ağır” öğe var mı?</li>
<li>Her KPI bir karşılaştırmayla mı geliyor (hedef, geçen yıl)?</li>
<li>Öğeler ızgaraya hizalı mı, boşluklar tutarlı mı?</li>
<li>Başlıklar bir sonucu söylüyor mu (“Hediye hedefin %16 gerisinde”)?</li>
<li>Renk tek bir anlam mı taşıyor, yanında simge ya da metin var mı?</li>
<li>Görsel sayısı bütçede mi; Performans Analizi ne diyor?</li>
<li>Detay ve araç ipucu yolları keşfedilebilir mi (“Ayrıntı için sağ tıkla → Detaya git” notu)?</li>
<li>Sekme sırası, alternatif metin ve kontrast kontrol edildi mi?</li>
</ol>
`, ex: [
  { t:'dax', name:'KPI Durum Rengi', q:'<b>KPI Durum Rengi</b>: Hedef gerçekleşme oranına göre renk kodu döndür: oran boşsa "#8A8A8A", %100 ve üstü "#1B7F3B", %95 ve üstü "#B26A00", altı "#B42318". Oran için [Hedef Gerçekleşme %] kullan.', sol:'VAR Oran = [Hedef Gerçekleşme %] RETURN SWITCH(TRUE(), ISBLANK(Oran), "#8A8A8A", Oran >= 1, "#1B7F3B", Oran >= 0.95, "#B26A00", "#B42318")', hint:'SWITCH(TRUE(), …) ile koşulları büyükten küçüğe sırala; BLANK kontrolü ilk sırada olsun.' },
  { t:'dax', name:'Seçim Özeti Başlığı', q:'<b>Seçim Özeti Başlığı</b>: Görsel başlığı için metin. Biçim: "Net satış · {kategori} · {yıl}". Tek kategori varsa adı; birden çok seçim varsa "N kategori"; filtre yoksa "Tüm kategoriler". Yıl tekse yıl, değilse "Tüm yıllar".', sol:'VAR Kat = IF(ISFILTERED(Kategoriler[Kategori]), IF(HASONEVALUE(Kategoriler[Kategori]), SELECTEDVALUE(Kategoriler[Kategori]), COUNTROWS(VALUES(Kategoriler[Kategori])) & " kategori"), "Tüm kategoriler") VAR Yil = IF(HASONEVALUE(Tarih[Yil]), FORMAT(SELECTEDVALUE(Tarih[Yil]), "0"), "Tüm yıllar") RETURN "Net satış · " & Kat & " · " & Yil', hint:'Önce ISFILTERED ile “seçim var mı?”, sonra HASONEVALUE ile “tek mi?” sor. Yılı FORMAT(…, "0") ile metne çevir.' },
  { t:'mc', q:'Yönetici özet sayfasında 4 kart, 6 grafik, 2 ayrıntı tablosu ve 3 dilimleyici var; sayfa 5,8 saniyede açılıyor. Kullanım verisi ayrıntı tablolarının nadiren kullanıldığını gösteriyor. İlk adımın ne olur?', o:['Tabloları detay sayfasına taşıyıp kartları birleştirmek','Kapasiteyi bir üst SKU’ya yükseltip sayfayı aynen bırakmak','Tabloları bir yer işaretiyle gizleyip düğmeyle gösterilebilir yapmak','Modelin depolama modunu Import’tan DirectQuery’ye çevirmek'], a:0, why:'Görsel sayısı bir bütçedir; nadiren kullanılan pahalı tablolar detay sayfasında yerinde durur, kartlar da tek görselde birleşir. Kapasite artırmak tasarım sorununu parayla örter. Gizleme düğmesi sayfayı karmaşıklaştırır ve önce ölçmeden yapılan bir tahmindir. DirectQuery genellikle sorguları daha da yavaşlatır.' },
  { t:'mc', q:'Bir taslakta sayfanın üst yarısında aynı boyutta iki büyük grafik, sağ alt köşede küçük KPI kartları var. Eleştirinde ana öneri ne olmalı?', o:['Grafiklerin renk paletini birbirinden belirgin biçimde ayırmak','İki grafiği tek bir kombo grafikte birleştirmek','Kartların yazı tipini büyütüp kartları yerinde bırakmak','KPI’ları sol üste alıp tek ana grafik seçmek'], a:3, why:'Bilgi hiyerarşisi bozuk: durum katmanı (KPI) en az görülen köşede, iki eşit grafik de gözü ikiye bölüyor. KPI’ları sol üste almak ve tek bir “en ağır” grafik seçmek sorunu çözer. Renk ayrımı hiyerarşiyi düzeltmez. Yazıyı büyütmek konum sorununu çözmez. Kombo grafik farklı soruları tek görsele sıkıştırabilir.' },
  { t:'mc', q:'Kategori yöneticisi bir kategoriye tıklayınca o kategorinin ürün listesini, iade oranını ve 12 aylık eğilimini görmek istiyor. Bunu ayda birkaç kez yapıyor. Hangi mekanizma?', o:['Araç ipucu sayfası','Özet sayfasına üç yeni görsel','Detay sayfası','Her kategori için bir yer işareti'], a:2, why:'Tek bir varlık için derine inme ve birden çok ayrıntı görseli detay sayfasının işidir. Araç ipucu tek bir soruya hızlı cevap içindir; liste ve eğilim için küçük kalır. Özet sayfasına eklemek bütçeyi her açılışta harcar. Kategori başına yer işareti bakımı zor bir yığın üretir.' },
  { t:'mc', q:'Kart “Hedef gerçekleşme %100” gösteriyor ama arka plan turuncu. Kullanıcılar şikâyet ediyor. Gerçek değer %99,6 ve eşik %100. Ne yaparsın?', o:['Turuncu eşiğini %100 yerine %99’a indirmek','Kartta yüzde yerine hedef farkını tutar olarak göstermek','Bir ondalık göstermek ya da eşiği hizalamak','Koşullu biçimlendirmeyi karttan tamamen kaldırmak'], a:2, why:'Sorun, ekrandaki yuvarlanmış değer ile rengin kullandığı gerçek değerin farklı olması. Bir ondalık (%99,6) ya da yuvarlanmış değere göre eşik bu çelişkiyi kaldırır. Eşiği keyfî indirmek iş kuralını değiştirir. Tutar göstermek soruyu değiştirir. Biçimi kaldırmak durum bilgisini yok eder.' },
  { t:'mc', q:'Kullanıcılar “Grafik / Tablo” düğmesine basınca kendi dilimleyici seçimlerinin sıfırlandığını söylüyor. Düğmeler yer işaretlerine bağlı. En olası neden?', o:['Dilimleyiciler sayfalar arasında eşitlenmemiş','Düğme eylemi yanlış sayfaya gidiyor','Seçim bölmesinde görseller gruplanmamış','Yer işaretlerinde “Veri” seçeneği açık'], a:3, why:'“Veri” seçeneği açık bir yer işareti, kaydedildiği andaki filtre ve dilimleyici durumunu da geri yükler. Yalnızca “Görüntüle” tutulursa kullanıcının seçimi korunur; görsel değişimi için alan parametresi daha da iyidir. Eşitleme sayfalar arası bir ayardır. Yanlış sayfa başka bir belirti verir. Gruplama filtreyi etkilemez.' }
] });

/* ───────────────────────── 4. Bitirme projesine hazırlık ───────────────────────── */
ext('final-hazirlik', { min: 14, html: `
<h2>Bitirme projesini yürütmek: altı aşama</h2>
<p>Bitirme projesi bir “rapor yapma” ödevi değil, küçük bir iş projesidir. Değerlendiren kişi sonuçtan çok yolu görmek ister: bir soruyu nasıl tanımladın, nasıl modelledin, sayının doğru olduğunu nasıl kanıtladın. Aşamaları ve “bitti” ölçütlerini baştan bil.</p>
<div class="tbl-wrap"><table><tr><th>Aşama</th><th>Çıktı</th><th>Zaman payı</th><th>Bitti sayılır, eğer…</th></tr>
<tr><td>1. Gereksinim</td><td>Brif, KPI sözlüğü, sayfa taslağı</td><td>%15</td><td>Her KPI'ın bir cümlelik tanımı ve iş kuralı var</td></tr>
<tr><td>2. Model</td><td>Yıldız şema diyagramı, tarih tablosu</td><td>%20</td><td>Tüm ilişkiler bire-çok ve tek yönlü (gerekçesi yazılı istisnalar hariç)</td></tr>
<tr><td>3. Ölçüler</td><td>Temel → türetilmiş ölçüler, görüntü klasörleri</td><td>%25</td><td>Her ölçünün açıklaması, biçimi ve bir test sorgusu var</td></tr>
<tr><td>4. Rapor</td><td>Sayfa haritası, ızgara, etkileşimler</td><td>%20</td><td>Tasarım eleştirisi listesinden geçti</td></tr>
<tr><td>5. Test</td><td>Mutabakat, kenar durum, RLS, performans</td><td>%10</td><td>Sonuçlar bir test sayfasında belgeli</td></tr>
<tr><td>6. Sunum</td><td>5 dakikalık demo, README</td><td>%10</td><td>Bir yabancı README'den projeyi anlayabiliyor</td></tr></table></div>
<p>En sık hata, zamanın yarısını 4. aşamaya harcayıp 1. ve 5. aşamaları atlamaktır. Güzel görünen ama tanımı belirsiz bir rapor, değerlendirmede en çok puan kaybeden rapordur.</p>

<h2>1. Gereksinim: tanımlar sayıdan önce gelir</h2>
<p>Brif yazımı Talepten rapor brifine dersinde. Bitirme projesinde en çok işe yarayan belge <b>KPI sözlüğü</b>dür: ad, tek cümlelik tanım, iş kuralı, kaynak sütun, biçim. Neden bu kadar önemli? Bu modelde “Net satış” iki farklı sayı olabilir:</p>
<div class="tbl-wrap"><table><tr><th>Tanım</th><th>Kural</th><th>Tüm dönem</th></tr>
<tr><td>Uygulamadaki [Net Satış]</td><td>İptaller hariç, iadeler dahil</td><td>1.250.772 ₺</td></tr>
<tr><td>Finansın beklediği olabilir</td><td>İptaller ve iadeler hariç</td><td>1.169.937 ₺</td></tr></table></div>
<p>Aradaki 80.835 ₺ tam olarak <code>[İade Tutarı]</code>'dır. İkisi de savunulabilir; savunulamayan, hangisinin kullanıldığını yazmamaktır. Sözlüğe tek satır ekle: “Net satış: iptal hariç, iade dahil; iade ayrı KPI olarak izlenir.”</p>

<h2>2–3. Model ve ölçüler: katmanlı kur</h2>
<p>Ölçüleri dört katmanda düşün. Her katman yalnızca bir alttakini kullanır:</p>
<ol>
<li><b>Temel:</b> <code>[Toplam Satış] = SUM(Satislar[Tutar])</code> — ham toplama, rapora konmaz.</li>
<li><b>İş kuralı:</b> <code>[Net Satış]</code> — sözlükteki tanımın tek yeri.</li>
<li><b>Türetilmiş:</b> marj, YoY, hedef farkı — iş kuralı ölçülerinden kurulur.</li>
<li><b>Sunum:</b> başlık, renk, etiket metni — rapora özgü.</li>
</ol>
<p>Kural bir gün değişirse (ör. iade hariç tutulacak) yalnızca 2. katmandaki bir ölçüyü değiştirirsin; yüzlerce ölçü kendiliğinden güncellenir.</p>
<h3>Gereksinimden ölçüye: bir örnek</h3>
<p>Satış direktörü: “Her kategori için hedefe ne kadar kaldığını görmek istiyorum. Hedefi aşan kategoride eksi sayı görmeyeyim.”</p>
<pre class="dax">Hedefe Kalan Tutar =
VAR Kalan = [Hedef] - [Net Satış]
RETURN IF(NOT ISBLANK([Hedef]), MAX(Kalan, 0))

Kategori Bazında Kalan =
SUMX(VALUES(Kategoriler[Kategori]), [Hedefe Kalan Tutar])</pre>
<p>2024'te Kitap hedefi aştı ve satırında 0 görünür. Toplam satırında ise iki ölçü ayrışır: <code>[Hedefe Kalan Tutar]</code> 16.134 ₺ der (şirketin toplam hedefi ile toplam satışı arasındaki fark). <code>[Kategori Bazında Kalan]</code> 16.361 ₺ der (satırların toplamı). Çünkü ilk ölçü Kitap'ın fazlasını diğer kategorilerin açığından düşer. Hangisi doğru? Bu bir iş sorusudur: “Kategorilerin toplam açığı” mı, “şirketin net açığı” mı? Direktöre sor, cevabı ölçü açıklamasına yaz. Değerlendirmede tam puan alan proje, bu tür bir kararı belgelemiş projedir.</p>

<h2>4–5. Rapor ve test</h2>
<p>Rapor aşaması için Rapor tasarımı dersindeki ızgara ve eleştiri listesini kullan. Test aşaması için Rapor kalitesi dersindeki test paketini uygula. Bitirme projesinde en az şu üç test belgeli olsun:</p>
<ul>
<li><b>Mutabakat:</b> DAX sorgu görünümünde, rapor ölçüsü ile kaynak tablodan doğrudan hesaplanan toplamı yıl yıl karşılaştıran bir sorgu. Fark sütunu her satırda 0 olmalı.</li>
<li><b>Kenar durumlar:</b> hedefi olmayan dönem, satışı olmayan kategori, tek gün seçimi, çoklu seçim, toplam satırı.</li>
<li><b>Güvenlik ve performans:</b> RLS rolü “Farklı görüntüle” ile iki kullanıcıda; Performans Analizi'nde her sayfanın açılış süresi.</li>
</ul>

<h2>6. Sunum ve portföy</h2>
<p>Beş dakikalık demo akışı:</p>
<ol>
<li><b>30 sn — bağlam:</b> Kim kullanıyor, hangi kararı veriyor?</li>
<li><b>1 dk — ana bulgu:</b> “2024'te hedefin %97,9'undayız; açığın büyük kısmı Elektronik ve Ev &amp; Yaşam'da.”</li>
<li><b>2 dk — gezinme:</b> özet → kategori detayı → araç ipucu.</li>
<li><b>1 dk — teknik:</b> model diyagramı ve en zor ölçünün mantığı.</li>
<li><b>30 sn — sınırlar ve sonraki adım:</b> “Hedefler aylık; günlük hedef gelirse model şöyle değişir.”</li>
</ol>
<p>README başlıkları: amaç, kullanıcılar, veri kaynakları, model görseli, KPI sözlüğü, varsayımlar, bilinen sınırlar, test sonuçları. Portföyde paylaşırken gerçek şirket verisi kullanma. <b>Web'de yayımla</b> (Publish to web) bağlantısı herkese açıktır; yalnızca anonim, örnek veriyle kullan. Ayrıntı Portföy, CV ve ilk 90 gün dersinde.</p>

<h2>Rubrik: puan nerede kazanılır?</h2>
<div class="tbl-wrap"><table><tr><th>Ölçüt</th><th>Başlangıç</th><th>Yeterli</th><th>Profesyonel</th></tr>
<tr><td>Tanımlar</td><td>KPI'lar adıyla var</td><td>Formüller yazılı</td><td>İş kuralları ve istisnalar sözlükte</td></tr>
<tr><td>Model</td><td>Çalışıyor</td><td>Yıldız şema, tarih tablosu</td><td>Her istisna gerekçeli; gereksiz sütun yok</td></tr>
<tr><td>DAX</td><td>Doğru sonuç</td><td>Katmanlı, VAR, biçimli</td><td>Toplam satırı kararı belgeli, test sorgusu var</td></tr>
<tr><td>Rapor</td><td>Bilgiler sayfada</td><td>Hiyerarşi ve ızgara</td><td>Mimari (detay, araç ipucu) ve erişilebilirlik</td></tr>
<tr><td>Test</td><td>Elle bakıldı</td><td>Mutabakat yapıldı</td><td>Kenar durum, RLS, performans belgeli</td></tr>
<tr><td>Sunum</td><td>Rapor gösterildi</td><td>Bulgu anlatıldı</td><td>Karar, sınır ve sonraki adım net</td></tr></table></div>
<div class="tip"><b>Teslim öncesi son kontrol</b>KPI sözlüğü raporla birebir aynı mı? Mutabakat sorgusunda fark 0 mı? Her toplam satırı kararı bir ölçü açıklamasında mı? README bir yabancıya yetiyor mu? Demo 5 dakikaya sığıyor mu (saatle dene)?</div>
`, ex: [
  { t:'dax', name:'Hedefe Kalan (Bitirme)', q:'<b>Hedefe Kalan (Bitirme)</b>: Hedef ile net satış arasındaki fark; hedef aşıldıysa 0, hedef yoksa boş. 2024 kategori kırılımında Kitap 0 göstermeli.', sol:'VAR Kalan = [Hedef] - [Net Satış] RETURN IF(NOT ISBLANK([Hedef]), MAX(Kalan, 0))', hint:'Farkı bir değişkene al; MAX(Kalan, 0) eksiyi keser. Hedef boşsa IF ile BLANK döndür.' },
  { t:'query', q:'Mutabakat testi: yıl bazında rapor ölçüsü [Net Satış] ile kaynaktan doğrudan hesaplanan toplamı (Durum “Teslim Edildi”, “Kargoda” ya da “İade” olan satırların Tutar toplamı) ve ikisinin farkını veren bir DAX sorgusu yaz. Sütunlar: Rapor, Kaynak, Fark.', start:'EVALUATE\n', sol:'EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[Yil],\n    "Rapor", [Net Satış],\n    "Kaynak", CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] IN {"Teslim Edildi", "Kargoda", "İade"}),\n    "Fark", [Net Satış] - CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] IN {"Teslim Edildi", "Kargoda", "İade"})\n)', hint:'SUMMARIZECOLUMNS(Tarih[Yil], "Rapor", …, "Kaynak", …, "Fark", …). Kaynak için ölçüyü kullanma; SUM ve IN { … } ile kuralı yeniden yaz.' },
  { t:'mc', q:'Bitirme projen için iki haftan var. İlk iki günü nasıl kullanırsın?', o:['KPI sözlüğü ve sayfa taslağı yazmak','Temayı ve sayfa düzenini hazırlamak','Tüm ölçüleri hızlıca yazıp sonra ayıklamak','Power Query’de tüm tabloları temizlemek'], a:0, why:'Tanımlar olmadan yazılan ölçü ve tasarım sonradan yeniden yapılır. Sözlük ve taslak hangi verinin, hangi ölçünün, hangi sayfanın gerekli olduğunu belirler. Tema en son işlerden biridir. Ölçüleri önce yazıp ayıklamak bakım yükü üretir. Tüm tabloları temizlemek de neyin gerekli olduğu bilinmeden emek harcamaktır.' },
  { t:'mc', q:'Finans ekibi raporundaki tüm dönem net satışın 1.169.937 ₺ olduğunu, seninkinin 1.250.772 ₺ gösterdiğini söylüyor. Fark tam olarak iade tutarı kadar. Ne yaparsın?', o:['Ölçüyü hemen iadeleri hariç tutacak biçimde değiştirmek','Tanımı finansla netleştirip KPI sözlüğüne yazmak','Raporun altına iki sayının da doğru olduğunu not etmek','Finansın kaynağının hatalı olduğunu belirtmek'], a:1, why:'İki sayı da bir tanıma göre doğrudur; sorun tanımın yazılı olmaması. Önce paydaşla hangi tanımın kullanılacağına karar verilir, sonra sözlük ve gerekirse ölçü güncellenir. Tek taraflı değiştirmek başka bir ekibi bozabilir. “İkisi de doğru” notu kullanıcıyı belirsizlikte bırakır. Finansı suçlamak hem yanlış hem ilişkiyi bozar.' },
  { t:'mc', q:'Değerlendirmede “Hedefe kalan” ölçünün toplam satırı 16.134 ₺, satırların toplamı 16.361 ₺. Değerlendirici neyi görmek ister?', o:['Toplam satırının matristen kapatılmasını','İki ölçünün ortalamasının toplamda gösterilmesini','Seçilen anlamın ölçü açıklamasında yazılmasını','Toplamı her zaman satırların toplamına zorlayan bir ölçü'], a:2, why:'Fark, hedefi aşan Kitap’ın fazlasının toplamda diğer açıklardan düşülmesinden gelir. İki anlam da geçerlidir; profesyonel çözüm iş sorusunu sorup kararı belgelemektir. Toplamı kapatmak bilgiyi gizler. Ortalama anlamsızdır. Her zaman satır toplamına zorlamak “şirketin net açığı” sorusunu yanlış cevaplar.' },
  { t:'mc', q:'Portföyün için bitirme projeni paylaşacaksın. Model, çalıştığın şirketin gerçek müşteri verisinden kopyalanmış bir örnek içeriyor. Ne yaparsın?', o:['Web’de yayımla ile paylaşıp bağlantıyı yalnızca CV’ye koymak','Raporu PDF’e aktarıp yalnızca müşteri adlarını kapatmak','Çalışma alanına okuma izniyle işe alanları eklemek','Veriyi anonim ya da sentetik veriyle değiştirmek'], a:3, why:'Gerçek şirket verisi portföyde kullanılmaz. Web’de yayımla bağlantısı herkese açıktır ve dizinlenebilir. PDF’te adları kapatmak verinin geri kalanını korumaz. Dış kişileri şirket çalışma alanına eklemek de bir veri paylaşımı ihlalidir. Anonim ya da sentetik veriyle aynı modeli göstermek güvenli yoldur.' }
] });

/* ───────────────────────── 5. PL-300 ───────────────────────── */
ext('pl300', { min: 16, html: `
<h2>Güncel çerçeve: neyi, ne ağırlıkla?</h2>
<p>Aşağıdaki ağırlıklar Microsoft Learn'deki PL-300 çalışma kılavuzunun <b>20 Nisan 2026</b> tarihli “ölçülen beceriler” listesinden alındı. Sınava girmeden önce aynı sayfayı bir kez daha aç; Microsoft listeyi yılda birkaç kez günceller. İngilizce sürüm önce güncellenir, yerelleştirilmiş sürümler genellikle yaklaşık sekiz hafta geriden gelir.</p>
<div class="tbl-wrap"><table><tr><th>Alan</th><th>Ağırlık</th><th>Dikkat çeken maddeler</th><th>Bu uygulamada</th></tr>
<tr><td>Veriyi hazırlama</td><td>%25–30</td><td>DirectLake / DirectQuery / Import seçimi, gizlilik düzeyleri, referans mı çoğaltma mı, ilişki anahtarları</td><td>Veri alma, Power Query dersleri, M dili</td></tr>
<tr><td>Veriyi modelleme</td><td>%25–30</td><td>Rol oynayan boyutlar, yarı toplanabilir ölçüler, hesaplama grupları, Performans Analizi ve DAX sorgu görünümü</td><td>Modelleme, DAX dersleri, Performans</td></tr>
<tr><td>Görselleştirme ve analiz</td><td>%25–30</td><td>Copilot ile anlatı görseli ve sayfa önerisi, görsel hesaplamalar, sayfalandırılmış rapor ne zaman, erişilebilirlik, otomatik sayfa yenileme</td><td>Görselleştirme dersleri, Copilot, Pencere fonksiyonları</td></tr>
<tr><td>Power BI'ı yönetme ve güvenli hâle getirme</td><td>%15–20</td><td>Dağıtım yöntemi seçimi, abonelik ve uyarılar, ağ geçidi ne zaman, RLS grup üyeliği, duyarlılık etiketleri</td><td>Yayımlama, Güvenlik, Yönetişim</td></tr></table></div>
<p>Geçme puanı 1000 üzerinden 700. Lab içermeyen rol tabanlı sınavlarda süre 100 dakika, oturum süresi 120 dakikadır. Sınav ana dilinde sunulmuyorsa 30 dakika ek süre istenebilir. Yapay zekâ görselleri maddesinde ayrıştırma ağacı ve anahtar etkileyiciler çalış. Soru-Cevap (Q&amp;A) görseli kaldırılıyor (Learn: Şubat 2027); doğal dil soruları için Copilot'u ve modeli “Yapay zekâ için verileri hazırla” (Prep data for AI) ile hazırlamayı öğren.</p>

<h2>Soru türleri ve her birinin çözüm yolu</h2>
<p>Microsoft sınavdaki biçimleri önceden açıklamaz, ama deneme ortamında (exam sandbox) şu türleri gösterir:</p>
<div class="tbl-wrap"><table><tr><th>Tür</th><th>Nasıl görünür?</th><th>Strateji</th></tr>
<tr><td>Çoktan seçmeli</td><td>Tek ya da birden çok doğru</td><td>Kaç seçim istendiğini oku; kısıt ifadesini bul</td></tr>
<tr><td>Liste oluşturma, sürükle-bırak</td><td>Adımları doğru sıraya koy</td><td>Önce ilk ve son adımı sabitle, sonra aradakileri yerleştir</td></tr>
<tr><td>Etkin alan (hot area)</td><td>Ekran görüntüsünde doğru yer ya da açılır listelerle DAX tamamlama</td><td>DAX'ı kafanda bir hücrede çalıştır: hangi filtre kalıyor, hangisi kalkıyor?</td></tr>
<tr><td>Vaka çalışması</td><td>Şirket anlatısı, gereksinimler, birden çok soru</td><td>Önce soruları oku, sonra anlatıda yalnızca ilgili bölümü ara</td></tr>
<tr><td>Sorun–çözüm setleri</td><td>“Bu çözüm hedefi karşılıyor mu? Evet / Hayır”; aynı senaryo farklı çözümlerle tekrar eder</td><td>Her çözümü bağımsız değerlendir; ara verilemez, cevabı kesin ver</td></tr></table></div>
<p>Rol tabanlı sınavlarda Microsoft Learn'e sınav içinden erişebilirsin; Q&amp;A, alıştırma değerlendirmeleri ve profil sayfası hariç. Saat bu sırada durmaz. Learn'i her soru için değil, emin olmadığın bir sınır ya da menü adı için kullan.</p>

<h2>Zaman yönetimi</h2>
<ul>
<li><b>Hız hedefi:</b> Sınavlar bölümündeki not, raporlarda soru sayısının çoğunlukla 50–55 olduğunu söylüyor. 100 dakikada soru başına yaklaşık 1,5 dakika eder. Vaka için 15–20 dakika ayır.</li>
<li><b>90 saniye kuralı:</b> 90 saniyede çözemediğin soruyu işaretle (mark for review) ve geç. İlk turda emin olduklarını topla.</li>
<li><b>Ara kuralı:</b> Ara verebilirsin ama saat işlemeye devam eder ve aradan sonra daha önce gördüğün sorulara <b>dönemezsin</b>; işaretli olanlara bile. Önce işaretlileri bitir, sonra ara ver.</li>
<li><b>Son 10 dakika:</b> Boş soru bırakma; yanlış cevabın ceza puanı yok.</li>
</ul>

<h2>Kısıt ifadeleri: soruyu çözen anahtar</h2>
<p>Senaryo sorularında genellikle birden çok seçenek teknik olarak çalışır. Doğruyu seçtiren şey sorudaki kısıttır:</p>
<div class="tbl-wrap"><table><tr><th>İfade</th><th>Genellikle doğru yön</th></tr>
<tr><td>“En az geliştirme çabasıyla”</td><td>Yerleşik özellik: hızlı ölçü, yerleşik görsel, Power Query arayüzü</td></tr>
<tr><td>“En az ayrıcalık ilkesiyle”</td><td>İşi yapabilen en düşük rol ya da izin</td></tr>
<tr><td>“Veri mümkün olduğunca güncel olmalı”</td><td>DirectQuery ya da Direct Lake, otomatik sayfa yenileme</td></tr>
<tr><td>“Model boyutunu küçült”</td><td>Gereksiz satır ve sütunu kaldır, ayrıntı düzeyini düşür</td></tr>
<tr><td>“Kullanıcılar raporu değiştirmeden kendi görünümünü kursun”</td><td>Görselleri kişiselleştirme</td></tr></table></div>

<h2>Sık tuzak konular: motorla gösterilmiş hâlleri</h2>
<h3>1. Yarı toplanabilir ölçüde LASTDATE</h3>
<p>Stok anlık görüntüleri her ayın son gününde alınıyor. <code>LASTDATE(Tarih[Tarih])</code> bağlamın son <b>takvim</b> gününü döndürür. Yıl kırılımında sorun yok: iki yöntem de 2024 için 311 adet verir. Ama haftanın günü kırılımında “Salı” dışındaki her hücre boş gelir, çünkü bu günlerin son tarihinde kayıt yok. Seçim ayın ortasında biterse (ör. kapanmamış ay) aynı boşluk raporda da görünür. <code>LASTNONBLANK</code> kaydı olan son günü bulur.</p>
<pre class="dax">Dönem Sonu Stok (Son Kayıt) =
CALCULATE(
    SUM(StokGorunum[StokAdet]),
    LASTNONBLANK(Tarih[Tarih], CALCULATE(COUNTROWS(StokGorunum)))
)</pre>
<h3>2. Yıl kırılımında “önceki dönem”</h3>
<p><code>CALCULATE([Net Satış], PREVIOUSQUARTER(Tarih[Tarih]))</code> 2024 yıl hücresinde 144.346 ₺ döndürür. Bu geçen yılın satışı değil, 2023-Ç4'tür: bağlamın ilk tarihinden önceki çeyrek. Sınavda bu tür sorular hücrenin hangi tarih kümesini gördüğünü sorar.</p>
<h3>3. Temel istatistik: neyin medyanı?</h3>
<p><code>MEDIAN(Satislar[Tutar])</code> sipariş <b>satırlarının</b> medyanıdır: 640 ₺. Soru “sipariş tutarının medyanı” ise önce sipariş düzeyine çıkmak gerekir: 1.086,5 ₺. Ortalama sepet (1.492,57 ₺) ile medyan arasındaki fark, birkaç büyük siparişin ortalamayı yukarı çektiğini gösterir.</p>
<pre class="dax">Sipariş Düzeyi Medyan Tutar =
MEDIANX(
    CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] &lt;&gt; "İptal"),
    [Net Satış]
)</pre>
<h3>4. RLS kime uygulanır?</h3>
<p>Satır düzeyi güvenlik çalışma alanında yalnızca <b>Görüntüleyici</b> rolündeki kullanıcıları ve uygulama ya da paylaşım yoluyla erişenleri kısıtlar. Yönetici, Üye ve Katkıda bulunan rolleri tüm veriyi görür. “RLS çalışmıyor” şikâyetinin en sık nedeni budur.</p>

<h2>Uygulamanın sınav bölümünü kullanma planı</h2>
<ol>
<li><b>Konu alıştırması:</b> Sınavlar → PL-300 konu alıştırması. Her alanı ayrı çöz; %70'in altındaki alanı not al.</li>
<li><b>Kısa deneme:</b> Üçüncü haftanın sonunda. Süreyi tut ve 90 saniye kuralını uygula.</li>
<li><b>Tam deneme:</b> Son hafta iki kez. Arada yanlışlarını ilgili derse dönerek çalış; aynı denemeyi ezberlemek için tekrar çözme.</li>
<li><b>Microsoft'un ücretsiz alıştırma değerlendirmesi:</b> Biçimi tanıtır. Gerçek sınav soruları değildir.</li>
</ol>
<div class="warn"><b>Sınav sorusu paylaşan sitelerden uzak dur</b>Gerçek soruları dolaştıran “dump” siteleri sınav sözleşmesini ihlal eder; sertifikanın iptaline yol açabilir. Üstelik bu sorular çoğu zaman eski ve yanlış cevaplıdır. Buradaki ve uygulamadaki tüm sorular özgün alıştırmalardır.</div>
`, ex: [
  { t:'dax', name:'Dönem Sonu Stok Değeri (Son Kayıt)', q:'<b>Dönem Sonu Stok Değeri (Son Kayıt)</b>: Seçili dönemde StokGorunum’da kaydı olan son günün toplam stok değeri (StokDegeri). Bağlamın son takvim gününde kayıt yoksa da değer dönmeli. 2024 için 163.465 ₺.', sol:'CALCULATE(SUM(StokGorunum[StokDegeri]), LASTNONBLANK(Tarih[Tarih], CALCULATE(COUNTROWS(StokGorunum))))', hint:'LASTDATE yerine LASTNONBLANK(Tarih[Tarih], CALCULATE(COUNTROWS(StokGorunum))) kullan; içteki CALCULATE her tarih için bağlam geçişi yapar.' },
  { t:'dax', name:'Sipariş Düzeyi Medyan Tutar', q:'<b>Sipariş Düzeyi Medyan Tutar</b>: İptal edilmemiş siparişlerin sipariş düzeyindeki net satış tutarlarının medyanı (satır düzeyindeki Tutar’ın medyanı değil). Tüm dönem için 1.086,5 ₺.', sol:'MEDIANX(CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal"), [Net Satış])', hint:'Sipariş listesini CALCULATETABLE(VALUES(Satislar[SiparisNo]), …) ile al ve MEDIANX ile her sipariş için [Net Satış] hesapla.' },
  { t:'mc', q:'Bir matriste satırlarda Tarih[Yil], değer olarak CALCULATE([Net Satış], PREVIOUSQUARTER(Tarih[Tarih])) var. 2024 hücresi neyi gösterir?', o:['2023 yılının toplam net satışını','2024’ün ilk çeyreğinin net satışını','2023’ün son çeyreğinin net satışını','Boş, çünkü yıl düzeyinde çeyrek yoktur'], a:2, why:'PREVIOUSQUARTER bağlamın ilk tarihine göre bir önceki çeyreği döndürür; 2024 yılının ilk günü 1 Ocak olduğu için sonuç 2023-Ç4’tür (bu modelde 144.346 ₺). Geçen yılın toplamı için SAMEPERIODLASTYEAR gerekir. Fonksiyon yılın kendi çeyreğini döndürmez. Yıl düzeyinde de tarih kümesi olduğu için boş dönmez.' },
  { t:'mc', q:'Bölge RLS’i yayımlandı. Çalışma alanında Üye rolündeki satış müdürü tüm bölgeleri görüyor, Görüntüleyici rolündeki temsilci yalnızca kendi bölgesini. Müdür de kendi bölgesine sınırlanmalı. Ne yaparsın?', o:['RLS rolünün DAX filtresini USERNAME() ile yeniden yazmak','Modeldeki tüm ilişkileri çift yönlü hâle getirmek','Müdüre Görüntüleyici rolü ya da uygulama erişimi vermek','Müdürü RLS rolüne e-posta adresiyle ikinci kez eklemek'], a:2, why:'RLS, çalışma alanında Yönetici, Üye ve Katkıda bulunan rollerine uygulanmaz; bu roller düzenleme yetkisi taşır. Müdür Görüntüleyici olur ya da içeriği uygulama üzerinden alırsa RLS devreye girer. Filtre fonksiyonunu değiştirmek rol sorununu çözmez. Role tekrar eklemek bir şey değiştirmez. Çift yönlü ilişki güvenlikle ilgili değildir.' },
  { t:'mc', q:'Temizlenmiş bir “Satışlar” sorgusundan iki ayrı tablo türetmek istiyorsun: biri günlük, biri aylık özet. Temizlik adımları tek yerde kalmalı ve değişince ikisine de yansımalı. Hangisi?', o:['Sorguyu iki kez çoğaltmak (Duplicate)','Temiz sorguyu iki ayrı kez içeri aktarmak','Özetleri DAX hesaplanmış tablolarıyla yapmak','İki başvuru sorgusu (Reference) kurmak'], a:3, why:'Başvuru (Reference), temiz sorgunun çıktısını girdi olarak kullanır; temizlik adımı değişince iki türev de güncellenir. Çoğaltma adımları kopyalar; değişiklik iki yerde yapılmak zorunda kalır. İki kez içeri aktarmak aynı sorunu taşır. Hesaplanmış tablo mümkündür ama soru Power Query’de adımların tek yerde kalmasını istiyor.' },
  { t:'mc', q:'Sınavın 60. dakikasındasın, 7 soruyu gözden geçirmek için işaretledin ve kısa bir ara vermen gerekiyor. En doğru sıra hangisi?', o:['Önce işaretlileri gözden geçirmek, sonra ara vermek','Hemen ara vermek, sonra işaretlilere dönmek','Ara vermeden sınavı bitirmek, işaretlileri boş bırakmak','Arada Learn’de işaretli konulara bakmak'], a:0, why:'Aradan sonra daha önce görülen sorulara, işaretli olsalar bile dönülemez. Önce işaretlileri bitirmek gerekir. Boş bırakmak puan kaybettirir; yanlış cevabın cezası yoktur. Arada herhangi bir materyale bakmak sınavın iptaline yol açar; Learn erişimi yalnızca sınav ekranından ve saat işlerken yapılır.' },
  { t:'mc', q:'Operasyon ekibi, DirectQuery kaynağına bağlı bir izleme sayfasının kimse dokunmadan her 30 saniyede güncellenmesini istiyor. En az geliştirme çabasıyla ne yaparsın?', o:['Zamanlanmış yenilemeyi 30 saniyeye ayarlamak','Power Automate ile raporu yeniden açan bir akış kurmak','Modeli Import’a çevirip artımlı yenileme kurmak','Sayfada otomatik sayfa yenilemeyi açmak'], a:3, why:'Otomatik sayfa yenileme DirectQuery kaynaklı sayfaların belirli aralıklarla sorgulanmasını sağlar; yerleşik bir ayardır. Zamanlanmış yenileme Import modelleri içindir ve bu sıklıkta değildir. Power Automate akışı gereksiz geliştirme çabasıdır. Import ve artımlı yenileme 30 saniyelik güncelliği vermez.' }
] });

/* ───────────────────────── 6. DP-600 ───────────────────────── */
ext('dp600', { min: 16, html: `
<h2>Çerçeveyi doğrula: 19 Ekim 2026 sürümü</h2>
<p>Microsoft Learn'deki DP-600 çalışma kılavuzunun ölçülen beceriler listesi <b>19 Ekim 2026</b> tarihli. Alan ağırlıkları değişmedi: analitik çözümü sürdürme %25–30, veriyi hazırlama %45–50, anlam modellerini uygulama ve yönetme %25–30. Değişiklik günlüğünde yalnızca “Veriyi sorgulama ve analiz etme” alt başlığında küçük bir değişiklik var. İngilizce sürüm önce güncellenir; yerelleştirilmiş sürüm birkaç hafta geriden gelebilir. Geçme puanı 700.</p>
<p>Ağırlıkların anlamı açık: sınavın neredeyse yarısı veriyi hazırlamak. Burada T-SQL görünümleri, saklı yordamlar, yıldız şemayı lakehouse ya da ambarda kurmak, yinelenen ve eksik veriyi temizlemek ve veriyi dört araçla sorgulamak var: görsel sorgu düzenleyici, SQL, KQL ve DAX. Power BI geçmişinden gelen biri için en büyük açık genellikle SQL'dir.</p>

<h2>Depo kararı: bir karar ağacı</h2>
<ol>
<li><b>Veri saniyeler içinde akıyor mu?</b> (telemetri, log, tıklama akışı) → Eventhouse / KQL veritabanı. Analiz katmanı için OneLake erişilebilirliğini açarsan aynı veri Delta olarak OneLake'te görünür ve kopyalamadan anlam modeline bağlanabilir.</li>
<li><b>Ekip veriyi T-SQL ile yazacak mı?</b> (INSERT, UPDATE, MERGE, çok tablolu işlemler, saklı yordamlar) → Warehouse.</li>
<li><b>Dosya, yarı yapılandırılmış veri ya da Spark / Python mühendisliği var mı?</b> → Lakehouse. Lakehouse'un SQL analiz uç noktası T-SQL ile <b>okur</b>; tablolara yazmaz.</li>
<li><b>Veri başka bir yerde zaten var mı?</b> (ADLS, başka bir lakehouse) → kopyalama, kısayol (shortcut) oluştur.</li>
<li><b>Raporlar nasıl tüketecek?</b> → Anlam modeli her zaman en üstte durur. Depolama modu kararı aşağıda.</li>
</ol>
<p>Ayrıntılı tasarım Fabric'te yıldız şema ve Fabric'te veriyi hazırlamak derslerinde.</p>

<h2>Direct Lake: OneLake mı, SQL uç noktası mı?</h2>
<p>Beceri listesinde ayrı bir madde var: “Direct Lake on OneLake ile Direct Lake on SQL analytics endpoint arasında seçim”. Fabric belgelerindeki farklar:</p>
<div class="tbl-wrap"><table><tr><th>Konu</th><th>Direct Lake on OneLake</th><th>Direct Lake on SQL</th></tr>
<tr><td>Kaynak</td><td>Bir ya da birden çok Fabric öğesi (kısayollar dahil)</td><td>SQL analiz uç noktası olan tek kaynak</td></tr>
<tr><td>DirectQuery'ye geri dönüş</td><td>Yok</td><td>Var (açıksa); kapalıysa sorgu hata verir</td></tr>
<tr><td>Import tablolarla karışım</td><td>Mümkün</td><td>Aynı modelde DirectQuery / Dual ile karışmaz</td></tr>
<tr><td>Ambardaki SQL RLS</td><td>Uygulanmaz; kullanıcının OneLake dosya erişimi gerekir</td><td>Uygulanır ama sorgular DirectQuery'ye düşer</td></tr>
<tr><td>Sınır (guardrail) aşılırsa</td><td>Yenileme başarısız; Delta tabloları optimize edilene kadar model sorgulanamaz</td><td>Uyarıyla devam eder, sorgular DirectQuery'ye düşer ve yavaşlar</td></tr></table></div>
<p>SQL uç noktasında geri dönüşü tetikleyenler: gerçekleştirilmemiş SQL görünümü, ambarda SQL tabanlı ayrıntılı erişim denetimi (SQL RLS dahil), henüz işlenmemiş tablo ve sınır aşımı. Direct Lake yenilemesi (framing) veri kopyalamaz; yalnızca en son Delta dosyalarına işaret eden meta veriyi günceller ve saniyeler sürer.</p>
<div class="note"><b>Sınav dili</b>“Raporlar yavaşladı, Performans Analizi'nde Direct Lake görselleri DirectQuery sorgusu gönderiyor” cümlesini görürsen geri dönüş tetikleyicilerini düşün: görünüm mü, SQL RLS mi, sınır mı?</div>

<h2>Aynı soru, üç dil: DAX, SQL, KQL</h2>
<p>Soru: “2024'te en çok satan 5 ürün hangisi?” Anlam modelinde DAX sorgusu:</p>
<pre class="dax">EVALUATE
TOPN(
    5,
    SUMMARIZECOLUMNS(
        Urunler[Urun], Urunler[Kategori],
        TREATAS({2024}, Tarih[Yil]),
        "Net Satış 2024", [Net Satış]
    ),
    [Net Satış 2024], DESC
)
ORDER BY [Net Satış 2024] DESC</pre>
<p>Sonuç: 27" Monitör 59.992 ₺, Akıllı Saat 37.789 ₺, Türk Kahvesi Makinesi 34.744 ₺, Robot Süpürge 32.396 ₺, Yoga Matı 28.868 ₺. Aynı sorunun ambar ya da SQL uç noktası karşılığı:</p>
<pre class="dax" data-notry>SELECT TOP 5 u.Urun, u.Kategori, SUM(s.Tutar) AS NetSatis2024
FROM dbo.Satislar AS s
JOIN dbo.Urunler AS u ON u.UrunNo = s.UrunNo
WHERE s.Durum &lt;&gt; 'İptal' AND YEAR(s.Tarih) = 2024
GROUP BY u.Urun, u.Kategori
ORDER BY NetSatis2024 DESC;</pre>
<p>Eventhouse'ta bir satış olayı tablosu olsaydı KQL karşılığı:</p>
<pre class="dax" data-notry>SatisOlaylari
| where Durum != "İptal" and Tarih between (datetime(2024-01-01) .. datetime(2024-12-31T23:59:59))
| summarize NetSatis2024 = sum(Tutar) by Urun, Kategori
| top 5 by NetSatis2024 desc</pre>
<div class="tbl-wrap"><table><tr><th>Dil</th><th>Nerede doğru?</th><th>Dikkat</th></tr>
<tr><td>DAX</td><td>İş kuralı anlam modelinde; tüm raporlar aynı tanımı kullanmalı</td><td>SQL'de “Net satış”ı yeniden yazmak iki tanım üretir</td></tr>
<tr><td>SQL</td><td>Dönüştürme, görünüm, saklı yordam, veri kalitesi kontrolü</td><td>SQL uç noktası salt okunur; yazma ambarda</td></tr>
<tr><td>KQL</td><td>Zaman serisi, log, yakın gerçek zamanlı analiz</td><td>Zaman aralığı filtresini erken uygula</td></tr>
<tr><td>Görsel sorgu düzenleyici</td><td>Kod yazmadan hızlı seçme, filtreleme, toplama</td><td>Karmaşık mantıkta SQL'e geç</td></tr></table></div>

<h2>Anlam modeli kararları: sınavın sevdiği eşleşmeler</h2>
<ul>
<li><b>Depolama modu:</b> Delta tabloları OneLake'teyse önce Direct Lake; eski bir kaynak varsa DirectQuery ya da Import; boyutlar için Dual (Kurumsal model dersi).</li>
<li><b>Artımlı yenileme:</b> RangeStart / RangeEnd parametreleri; filtre kaynağa katlanmalı.</li>
<li><b>Hesaplama grupları, dinamik biçim dizeleri, alan parametreleri:</b> Hesaplama grupları dersinde.</li>
<li><b>Pencere ve bilgi fonksiyonları:</b> OFFSET, WINDOW, INDEX; ISINSCOPE, ISFILTERED gibi bilgi fonksiyonları (Pencere fonksiyonları dersi).</li>
<li><b>Yaşam döngüsü:</b> Git sürüm denetimi ve .pbip, dağıtım işlem hatları ve dağıtım kuralları, XMLA ile dağıtım, etki analizi (Yaşam döngüsü dersi).</li>
</ul>

<h2>Sınav stratejisi</h2>
<p>Uygulamanın Sınavlar bölümündeki aday notlarına göre DP-600'de vaka çalışması çoğunlukla başta gelir ve geri dönülemez; sonda “aynı senaryo, farklı çözüm” evet/hayır serisi olur. T-SQL ağırlıklıdır. Plan: Sınavlar → DP-600 konu alıştırması ile alanları tek tek çalış, son iki haftada kısa ve tam denemeleri çöz. Her yanlışta kendine şu soruyu sor: kısıt neydi (en az çaba, en az ayrıcalık, kopyasız, gerçek zamana yakın)? Yanlış şık o kısıtın hangisini çiğniyordu?</p>
`, ex: [
  { t:'query', q:'2024 yılında net satışı en yüksek 5 ürünü, kategorileriyle birlikte, satışa göre azalan sırada döndüren bir DAX sorgusu yaz. Yıl filtresini TREATAS ile ver; değer sütununun adı "Net Satış 2024" olsun.', start:'EVALUATE\n', sol:'EVALUATE\nTOPN(5, SUMMARIZECOLUMNS(Urunler[Urun], Urunler[Kategori], TREATAS({2024}, Tarih[Yil]), "Net Satış 2024", [Net Satış]), [Net Satış 2024], DESC)\nORDER BY [Net Satış 2024] DESC', hint:'SUMMARIZECOLUMNS içinde filtre argümanı olarak TREATAS({2024}, Tarih[Yil]); dışında TOPN(5, …, [Net Satış 2024], DESC).' },
  { t:'mc', q:'Veri mühendisleri lakehouse’taki Delta tablolarını Spark ile yüklüyor. SQL ekibi aynı tablolarda UPDATE çalıştıran bir saklı yordamı lakehouse’un SQL analiz uç noktasında kurmak istiyor. Ne söylersin?', o:['Uç noktada UPDATE çalışır, yalnızca yazma izni vermek gerekir','Uç nokta salt okunur; yazma ambarda ya da Spark’ta','Tabloları KQL veritabanına taşıyıp orada güncellemek gerekir','Saklı yordam yerine Dataflow Gen2 ile UPDATE yazılmalı'], a:1, why:'Lakehouse’un SQL analiz uç noktası tablolara T-SQL ile okuma (ve görünüm, fonksiyon) sunar; DML ile yazmaz. T-SQL yazma gerekiyorsa veri bir ambarda tutulur ya da güncelleme Spark ile yapılır. İzin vermek salt okunurluğu değiştirmez. KQL veritabanı bu iş yükü için değildir. Dataflow Gen2 UPDATE çalıştırmaz.' },
  { t:'mc', q:'Direct Lake on SQL kullanan bir modelde raporlar yavaşladı. Performans Analizi bazı görsellerin DirectQuery sorgusu gönderdiğini gösteriyor. Ambar ekibi geçen hafta satış tablosuna SQL tabanlı satır düzeyi güvenlik ekledi. En olası açıklama?', o:['Delta tablolarında V-Order kapatılmış','Anlam modelinin son yenilemesi başarısız oldu','SQL RLS sorguları DirectQuery’ye düşürüyor','Kullanıcıların Fabric lisansı eksik'], a:2, why:'Direct Lake on SQL, ambarda SQL tabanlı ayrıntılı erişim denetimi görünce o sorgular için DirectQuery’ye geri döner; bu da yavaşlık yaratır. V-Order okuma performansını etkiler ama DirectQuery’ye düşürmez. Başarısız yenileme sorguyu yavaşlatmaz, veriyi eski bırakır. Lisans sorunu erişim hatası verir.' },
  { t:'mc', q:'IoT sensör verisi bir Eventhouse’ta toplanıyor. Analistler bu veriyi kopyalamadan, bir lakehouse’taki ürün tablosuyla aynı anlam modelinde kullanmak istiyor. İlk adım ne?', o:['KQL veritabanında OneLake erişilebilirliğini açmak','Bir işlem hattıyla veriyi her saat lakehouse’a kopyalamak','Anlam modelinde Eventhouse’a DirectQuery ile bağlanmak','Sensör verisini Dataflow Gen2 ile ambara yazmak'], a:0, why:'OneLake erişilebilirliği, Eventhouse tablolarını OneLake’te Delta olarak görünür kılar; anlam modeli bunu kopya olmadan kullanabilir. Saatlik kopya, kopyasız şartını çiğner ve gecikme ekler. DirectQuery bağlantısı çalışabilir ama iki kaynağı tek Direct Lake modelinde birleştirmez. Dataflow ile yazmak da bir kopyadır.' },
  { t:'mc', q:'Anlam modeli geliştirme, test ve üretim çalışma alanlarından geçmeli; her aşamada veri kaynağı o aşamanın lakehouse’u olmalı. En az bakım çabasıyla hangisi?', o:['Her aşamada PBIX’i elle yayımlayıp kaynağı değiştirmek','Üç ayrı model kopyası ve üç ayrı Git dalı','XMLA ile her aşamaya ayrı betik çalıştırmak','Dağıtım işlem hattı ve dağıtım kuralları'], a:3, why:'Dağıtım işlem hattı içeriği aşamalar arasında taşır; dağıtım kuralları her aşama için veri kaynağını ve parametreleri otomatik değiştirir. Elle yayımlamak hataya açıktır. Üç model kopyası tanımları ayrıştırır. XMLA betikleri çalışır ama bakım çabası daha yüksektir.' },
  { t:'mc', q:'Bir uygulamanın hata loglarında “son 1 saatte 5 dakikalık aralıklarla hata sayısı” isteniyor; veri saniyede yüzlerce kayıtla Eventhouse’a geliyor. Hangi dil ve yaklaşım?', o:['DAX ölçüsü ve otomatik sayfa yenilemesi kurmak','T-SQL görünümü ve saatlik zamanlanmış yenileme','KQL’de zaman filtresi ve bin() ile summarize','Görsel sorgu düzenleyicide zaman sütununa göre gruplama'], a:2, why:'Yakın gerçek zamanlı log analizi KQL’in alanıdır: önce zaman aralığı filtrelenir, sonra summarize count() by bin(Zaman, 5m). DAX ölçüsü bu veri hacminde ve gecikmede doğru katman değildir. T-SQL görünümü ve zamanlanmış yenileme gecikme ekler. Görsel sorgu düzenleyici bu senaryoda KQL’in zaman serisi araçlarını sunmaz.' },
  { t:'mc', q:'Direct Lake on OneLake modelinin yenilemesi bir sınır (guardrail) aşıldığı için başarısız oldu ve model sorgulanamıyor. Ne yaparsın?', o:['Delta tablolarını optimize edip yenilemek','Modelde DirectQuery’ye geri dönüş ayarını açmak','Modeli Import moduna çevirip yeniden yayımlamak','Kapasiteyi bir gece için duraklatıp sürdürmek'], a:0, why:'Direct Lake on OneLake’te geri dönüş yoktur; sınır aşılınca yenileme başarısız olur ve Delta tabloları optimize edilene kadar model sorgulanamaz. Dosya ve satır grubu sayısını azaltan bakım (OPTIMIZE) çözümdür. Geri dönüş ayarı SQL uç noktası türüne özgüdür. Import’a çevirmek büyük bir mimari değişikliktir. Kapasiteyi duraklatmak sorunu çözmez.' }
] });

/* ───────────────────────── 7. Mülakat ───────────────────────── */
ext('mulakat', { min: 16, html: `
<h2>İleri teknik mülakat: dört tur</h2>
<p>Kıdemli analist ve BI geliştirici mülakatlarında kavram soruları kısalır, uygulama turları uzar. Genellikle şu dört tur görülür:</p>
<div class="tbl-wrap"><table><tr><th>Tur</th><th>Süre</th><th>Ölçülen</th><th>En çok puan kaybettiren</th></tr>
<tr><td>Canlı DAX kodlama</td><td>30–45 dk</td><td>Soruyu ölçüye çevirme, doğrulama alışkanlığı</td><td>Sessizce yazıp test etmeden “bitti” demek</td></tr>
<tr><td>Model tasarım tahtası</td><td>30 dk</td><td>Tanecik, olgu–boyut ayrımı, zor ilişkiler</td><td>Doğrudan tablo çizmeye başlamak</td></tr>
<tr><td>Rapor eleştirisi</td><td>15–20 dk</td><td>Önceliklendirme, iş dili</td><td>Renk ve yazı tipiyle başlamak</td></tr>
<tr><td>“Bu rakam yanlış”</td><td>20–30 dk</td><td>Sistematik hata ayıklama</td><td>Tahminle formül değiştirmek</td></tr></table></div>

<h2>Canlı DAX turu: sorgu ile çalış</h2>
<p>Mülakatçı ekran paylaşımında şunu ister: “Birden fazla kanaldan alışveriş yapmış müşteri sayısını yıl yıl göster.” Ölçüyü model içinde yazmak yerine DAX sorgu görünümünde <code>DEFINE MEASURE</code> ile yaz. Hem tanımı hem sonucu aynı ekranda gösterirsin ve modeli değiştirmeden denersin:</p>
<pre class="dax">DEFINE
    MEASURE Satislar[Çok Kanallı Müşteri] =
        COUNTROWS(
            FILTER(
                VALUES(Satislar[MusteriNo]),
                CALCULATE(DISTINCTCOUNT(Satislar[Kanal]), Satislar[Durum] &lt;&gt; "İptal") &gt;= 2
            )
        )
EVALUATE
SUMMARIZECOLUMNS(Tarih[Yil], "Çok kanallı", [Çok Kanallı Müşteri], "Müşteri", [Müşteri Sayısı])</pre>
<p>Sonuç: 2022'de 32 müşteriden 9'u, 2023'te 77'den 48'i, 2024'te 123'ten 88'i birden çok kanal kullanmış. Şimdi sesli doğrula:</p>
<ul>
<li><b>Bağlam geçişi:</b> FILTER her müşteri satırında CALCULATE çağırır; satır bağlamı müşteri filtresine döner ve kanal sayısı o müşteri için hesaplanır.</li>
<li><b>Toplam:</b> Tüm dönemde 113. Yılların toplamı (145) değildir, çünkü müşteri yıllar arasında tekrar eder. Bunu mülakatçı sormadan söyle.</li>
<li><b>Kenar durum:</b> İptal filtresi içerideki CALCULATE'te. Yalnızca iptal edilmiş bir Mağaza siparişi olan müşteri “çok kanallı” sayılmaz.</li>
</ul>
<h3>Takip sorusuna hazır ol</h3>
<p>İkinci görev çoğu zaman bir öncekinin üstüne kurulur: “Her kategorinin lider ürününü yaz.” <code>TOPN(1, VALUES(Urunler[Urun]), [Net Satış])</code> çoğu hücrede doğru çalışır. Ama satış olmayan aylarda (bu modelde 2022'nin ilk beş ayı) bütün ürünler BLANK ile berabere kalır ve TOPN 40 ürünün hepsini döndürür. Çözüm: önce satışı olan ürünleri filtrele. Bu tuzağı kendin bulup söylemek, kıdemli adayı ayıran davranıştır.</p>
<pre class="dax">Lider Ürün =
VAR Satanlar = FILTER(VALUES(Urunler[Urun]), NOT ISBLANK([Net Satış]))
VAR Lider = TOPN(1, Satanlar, [Net Satış], DESC)
RETURN CONCATENATEX(Lider, Urunler[Urun], ", ")</pre>

<h2>Model tasarım tahtası</h2>
<p>Örnek soru: “Bir e-ticaret şirketi kampanya etkisini ölçmek istiyor. Bir sipariş birden çok kampanya kodu kullanabilir. Hedefler aylık ve kategori bazında. İadeler ayrı bir sistemden geliyor. Modeli çiz.” Çizmeden önce şu sırayla konuş:</p>
<ol>
<li><b>Tanecik (grain):</b> “Satış olgusu sipariş satırı düzeyinde; hedef ay × kategori düzeyinde; iade, iade satırı düzeyinde.” Bu cümle modelin yarısıdır.</li>
<li><b>Olgular:</b> Satislar, Hedefler, Iadeler. Üç olgu, üç ayrı tanecik; birleştirilmez.</li>
<li><b>Ortak boyutlar:</b> Tarih, Ürün (kategori dahil), Müşteri, Kanal, Kampanya. Hedefler Tarih ve Kategori'ye bağlanır, Ürün'e değil.</li>
<li><b>Zor kısım:</b> Sipariş–kampanya çoka-çok. Bir köprü tablo (SiparisNo, KampanyaNo) ve iki bire-çok ilişki. Kampanya filtresinin satışa ulaşması için ölçü içinde yön açma ya da köprü üzerinden filtre. Bir siparişi iki kampanyaya tam olarak saymanın toplamı şişireceğini söyle ve ağırlık (paylaştırma) seçeneğini öner.</li>
<li><b>Güvenlik ve büyüme:</b> RLS hangi boyutta? Veri büyürse artımlı yenileme ve toplama tabloları.</li>
</ol>
<p>Sık hatalar: her şeyi tek düz tabloya koymak, hedefleri satış satırlarına join etmek, “filtreler aksın” diye her ilişkiyi çift yönlü yapmak. Ayrıntı Model tasarımı II ve Fabric'te yıldız şema derslerinde.</p>

<h2>Rapor eleştirisi turu</h2>
<p>Bir rapor ekran görüntüsü verilir. İlk dakika konuşma; incele. Sonra eleştiriyi <b>doğruluk → anlam → tasarım</b> önceliğiyle ve gözlem → etki → öneri biçiminde anlat.</p>
<ul>
<li><b>Doğruluk:</b> “Kategori matrisinin toplam satırında marj %249,5 görünüyor. Bu bir oranın satırlarının toplanmış hâli; gerçek marj %36,5. Ölçü SUMX ile kategori marjlarını topluyor olabilir.” Doğruluk hatası her zaman ilk maddedir.</li>
<li><b>Anlam:</b> “Net satış kartında karşılaştırma yok; iyi mi kötü mü bilinmiyor.”</li>
<li><b>Tasarım:</b> “Yedi dilimli pasta grafikte küçük dilimler ayırt edilmiyor; sıralı çubuk daha iyi.”</li>
</ul>
<p>Tam liste Rapor tasarımı dersindeki eleştiri kontrol listesinde.</p>

<h2>“Bu rakam yanlış” turu: beş adım</h2>
<p>Mülakatçı der ki: “CRM 2023'te 77 müşteri alışveriş yaptı diyor, sizin rapor 79 diyor. Bul.”</p>
<ol>
<li><b>Tanımı sor:</b> “CRM neyi sayıyor? İptal edilen siparişler dahil mi?”</li>
<li><b>Bağlamı sabitle:</b> Aynı dönem, aynı filtreler. Rapordaki dilimleyicileri yaz.</li>
<li><b>En küçük sorguda yeniden üret:</b> İki tanımı yan yana koy. <code>DISTINCTCOUNT(Satislar[MusteriNo])</code> 2023 için 79, <code>[Müşteri Sayısı]</code> 77.</li>
<li><b>Farkı satır düzeyinde bul:</b> Küme farkı sorgusu farkı yapan müşterileri listeler.</li>
<li><b>Düzelt ve testi ekle:</b> Rapordaki görsel yanlış ölçüyü kullanıyordu. Doğru ölçüye geç ve bu karşılaştırmayı test sayfasına ekle.</li>
</ol>
<pre class="dax">EVALUATE
EXCEPT(
    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023),
    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023, Satislar[Durum] &lt;&gt; "İptal")
)</pre>
<p>Sorgu iki müşteri döndürür (78 ve 102): 2023'te yalnızca iptal edilmiş siparişleri var. Aynı turda sık gelen iki varyasyon:</p>
<div class="tbl-wrap"><table><tr><th>Şikâyet</th><th>Rapordaki</th><th>Beklenen</th><th>Kök neden</th></tr>
<tr><td>“Ortalama sipariş tutarı çok düşük”</td><td>AVERAGE(Satislar[Tutar]) = 831 ₺</td><td>1.492,57 ₺</td><td>Satır ortalaması, sipariş ortalaması değil; iptaller de içeride</td></tr>
<tr><td>“Net satış finanstan yüksek”</td><td>1.250.772 ₺</td><td>1.169.937 ₺</td><td>İadeler dahil; fark tam olarak iade tutarı (80.835 ₺)</td></tr></table></div>
<div class="tip"><b>Sesli düşünme kalıbı</b>“Önce tanımı netleştireyim. Sonra aynı bağlamda iki sayıyı yan yana üreteyim. Fark satır düzeyinde nereden geliyor, bulayım. Düzeltmeden önce bir test yazayım ki bir daha olmasın.” Bu dört cümle, doğru formülden daha çok puan getirir.</div>
`, ex: [
  { t:'dax', name:'Web ve Mobil Müşterisi', q:'<b>Web ve Mobil Müşterisi</b>: Canlı kodlama görevi. Bağlamda, iptal edilmemiş siparişlerde en az iki farklı kanal kullanmış müşteri sayısı. 2024 için 88.', sol:'COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), CALCULATE(DISTINCTCOUNT(Satislar[Kanal]), Satislar[Durum] <> "İptal") >= 2))', hint:'VALUES(Satislar[MusteriNo]) üzerinde FILTER; her müşteri için CALCULATE(DISTINCTCOUNT(Satislar[Kanal]), Durum <> "İptal") >= 2.' },
  { t:'dax', name:'Lider Ürün', q:'<b>Lider Ürün</b>: Takip sorusu. Bağlamda net satışı en yüksek ürünün adı; eşitlikte adları virgülle birleştir. Satış olmayan bağlamda 40 ürünün hepsi listelenmesin: yalnızca satışı olan ürünler aday olsun.', sol:'VAR Satanlar = FILTER(VALUES(Urunler[Urun]), NOT ISBLANK([Net Satış])) VAR Lider = TOPN(1, Satanlar, [Net Satış], DESC) RETURN CONCATENATEX(Lider, Urunler[Urun], ", ")', hint:'Önce FILTER(VALUES(Urunler[Urun]), NOT ISBLANK([Net Satış])), sonra TOPN(1, …), en son CONCATENATEX.' },
  { t:'dax', name:'Sipariş Ortalaması (Düzeltilmiş)', q:'<b>Sipariş Ortalaması (Düzeltilmiş)</b>: “Bu rakam yanlış” turu. Rapordaki ölçü AVERAGE(Satislar[Tutar]) ve tüm dönemde 831 ₺ gösteriyor. Ölçüyü, iptal edilmemiş siparişlerin sipariş başına ortalama tutarını verecek biçimde düzelt (beklenen 1.492,57 ₺).', sol:'DIVIDE(CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal"), CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), Satislar[Durum] <> "İptal"))', hint:'Satır ortalaması değil: toplam tutarı sipariş sayısına böl. İkisinde de iptalleri dışla (ya da hazır ölçüleri kullan).' },
  { t:'query', q:'“CRM 2023’te 77 müşteri diyor, rapor 79 diyor” vakası. 2023’te en az bir satırı olan ama iptal edilmemiş hiçbir siparişi olmayan müşterilerin numaralarını döndüren bir DAX sorgusu yaz.', start:'EVALUATE\n', sol:'EVALUATE\nEXCEPT(\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023),\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023, Satislar[Durum] <> "İptal")\n)', hint:'İki müşteri kümesi kur: 2023’ün tüm müşterileri ve iptal dışı müşterileri. EXCEPT ile farkı al.' },
  { t:'mc', q:'Model tasarım tahtasında soru: “Bir sipariş birden çok kampanya kodu kullanabilir; kampanya etkisini ölçmek istiyoruz.” Tahtaya ilk ne yazarsın?', o:['Satış, kampanya ve hedef olgularının tanecik cümlelerini','Kampanya tablosunun sütun listesini','Satış ile kampanya arasında çift yönlü ilişkiyi','Kampanyaları sipariş satırına virgüllü metin olarak eklemeyi'], a:0, why:'Tanecik cümleleri hangi olgunun hangi düzeyde tutulduğunu ve hangi ilişkilerin gerektiğini belirler; köprü tablo ihtiyacı buradan çıkar. Sütun listesi sonraki adımdır. Çift yönlü ilişki gerekçesiz bir kısayoldur ve belirsiz yollar yaratır. Virgüllü metin filtrelenemez ve toplamları bozar.' },
  { t:'mc', q:'Rapor eleştirisi turunda bir rapor görüyorsun: pasta grafikte 7 kategori, karşılaştırmasız KPI kartları ve toplam satırında %249,5 marj gösteren bir matris. Eleştirine nereden başlarsın?', o:['Pasta grafiğin sıralı çubukla değişmesinden','KPI kartlarına hedef ve geçen yıl eklenmesinden','Toplam satırındaki hatalı marjdan','Renk paletinin kurumsal temaya uymamasından'], a:2, why:'Doğruluk hatası her zaman ilk maddedir: %249,5 bir oranın toplanmış hâlidir; gerçek marj %36,5. Yanlış bir sayı, iyi tasarlanmış bir sayfanın tüm güvenilirliğini yok eder. KPI karşılaştırması anlam sorunudur, ikinci sırada gelir. Pasta grafik ve renk tasarım sorunlarıdır, en sonda.' }
] });

})(window);
