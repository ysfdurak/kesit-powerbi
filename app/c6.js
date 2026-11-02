/* Kesit Power BI içerik 6: C1 yeni dersler */
(window.PBI_LESSONS = window.PBI_LESSONS || []).push(

{
  id: 'tablo-fonk', lv: 'C1', mod: 'İleri DAX', min: 22,
  title: 'Tablo fonksiyonları, kümeler ve sanal ilişkiler',
  sum: 'TREATAS, INTERSECT, EXCEPT, UNION, GENERATE, CROSSJOIN; soy bağı (lineage); köprü tablo ve çoka-çok ilişkiler.',
  body: `
<h2>Tablo döndüren ifadeler bir “değer”dir</h2>
<p>DAX'ta bir tablo ifadesi değişkende tutulabilir, filtre olarak verilebilir, satırları sayılabilir. İleri seviyenin anahtarı, tabloları kümeler gibi düşünmektir:</p>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Küme işlemi</th><th>Örnek soru</th></tr>
<tr><td><code>INTERSECT(A, B)</code></td><td>Kesişim</td><td>Hem 2023 hem 2024'te alışveriş yapan müşteriler</td></tr>
<tr><td><code>EXCEPT(A, B)</code></td><td>Fark</td><td>2023'te alıp 2024'te almayan müşteriler (kayıp)</td></tr>
<tr><td><code>UNION(A, B)</code></td><td>Birleşim (tekrarlar kalır)</td><td>İki listenin birleşimi; DISTINCT ile tekilleştir</td></tr>
<tr><td><code>CROSSJOIN(A, B)</code></td><td>Kartezyen çarpım</td><td>Tüm kanal × yıl kombinasyonları</td></tr>
<tr><td><code>GENERATE(A, ifade)</code></td><td>A'nın her satırı için ifadenin döndürdüğü satırlar</td><td>Her kategori için ilk 3 ürün</td></tr>
<tr><td><code>TREATAS(tablo, sütun…)</code></td><td>Soy bağını değiştirir</td><td>Bağlantısız tablodaki değerleri modeldeki bir sütuna filtre olarak uygulamak</td></tr>
</table></div>
<h2>Soy bağı (lineage)</h2>
<p><code>VALUES(Satislar[MusteriNo])</code> tek sütunlu bir tablodur ve sütunun modeldeki <code>Satislar[MusteriNo]</code> olduğunu “hatırlar”. Bu tablo <code>CALCULATE</code>'e verildiğinde Power BI hangi sütunu süzeceğini soy bağından bilir. <code>{1, 2, 3}</code> gibi elle yazılmış bir tablonun soy bağı yoktur; filtre olarak kullanılamaz. <code>TREATAS</code> soy bağını sonradan verir:</p>
<pre class="dax">Kitap ve Spor = CALCULATE([Net Satış], TREATAS({"Kitap", "Spor"}, Kategoriler[Kategori]))</pre>
<h2>Sanal ilişki</h2>
<p>Modelde ilişki olmayan iki tablo arasında, hesap anında ilişki kurmak. Örneğin bağlantısız <code>KarsiUrunler</code> tablosundaki seçimi <code>Urunler</code>'e uygulamak:</p>
<pre class="dax">B Ürünleri Satışı =
CALCULATE(
    [Net Satış],
    TREATAS(VALUES(KarsiUrunler[KarsiUrunNo]), Urunler[UrunNo])
)</pre>
<p>Alternatifleri: <code>INTERSECT</code> ile ya da <code>FILTER(ALL(Urunler[UrunNo]), Urunler[UrunNo] IN VALUES(KarsiUrunler[KarsiUrunNo]))</code>. <code>TREATAS</code> genellikle en hızlı ve en okunur olanıdır. Sanal ilişki, hedefleri farklı tanecikte tutan bütçe tablolarında da sık kullanılır.</p>
<h2>Çoka-çok ve köprü tablolar</h2>
<p>Bir müşterinin birden çok segmente, bir ürünün birden çok kampanyaya ait olduğu durumlarda köprü (bridge) tablo kullanılır: <code>Musteri ← KopruMusteriSegment → Segment</code>. Filtrenin segmentten satışa ulaşması için köprü ile müşteri arasındaki ilişki çift yönlü olmalı ya da ölçüde <code>CROSSFILTER(…, BOTH)</code> kullanılmalıdır. Power BI'ın doğrudan “çoka-çok” kardinalitesi de vardır (iki tarafta da tekrar eden anahtar), ama sonuçları toplamlarda şaşırtıcı olabilir: bir satış iki segmentte sayılır, toplam ise bir kez sayar. Raporda bunun açıklanması gerekir.</p>
<div class="warn"><b>Performans</b>Büyük olgu tablolarında <code>FILTER(Satislar, …)</code> ile sanal ilişki kurmak yavaştır. Sanal ilişkiyi boyut tablosunun anahtarı üzerinden (<code>TREATAS(…, Urunler[UrunNo])</code>) kur.</div>
`,
  ex: [
    { t: 'dax', q: '<b>Sadık Müşteri</b>: Hem bu yıl hem geçen yıl aynı dönemde alışveriş yapmış müşteri sayısı. İki müşteri kümesini INTERSECT ile kesiştir (iptaller hariç).', name: 'Sadık Müşteri',
      start: 'VAR BuDonem =\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")\nVAR GecenDonem =\n    CALCULATETABLE(\n        VALUES(Satislar[MusteriNo]),\n        SAMEPERIODLASTYEAR(Tarih[Tarih]),\n        Satislar[Durum] <> "İptal"\n    )\nRETURN\n',
      sol: 'VAR BuDonem =\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")\nVAR GecenDonem =\n    CALCULATETABLE(\n        VALUES(Satislar[MusteriNo]),\n        SAMEPERIODLASTYEAR(Tarih[Tarih]),\n        Satislar[Durum] <> "İptal"\n    )\nRETURN\n    COUNTROWS(INTERSECT(BuDonem, GecenDonem))',
      grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Satislar', c: 'Kanal' }], explain: 'İki tablo değişkeni iki müşteri kümesidir. INTERSECT ortak müşterileri döndürür, COUNTROWS sayar. Kanal satırında soru “Web\'de iki yıl üst üste alışveriş yapanlar” olur; ölçü filtrelere duyarlıdır.' },
    { t: 'dax', q: '<b>Kaybedilen Müşteri (Yıl)</b>: Geçen yılın aynı döneminde alışveriş yapıp bu dönemde yapmayan müşteri sayısı (EXCEPT).', name: 'Kaybedilen Müşteri (Yıl)',
      sol: 'VAR BuDonem = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")\nVAR GecenDonem = CALCULATETABLE(VALUES(Satislar[MusteriNo]), SAMEPERIODLASTYEAR(Tarih[Tarih]), Satislar[Durum] <> "İptal")\nRETURN COUNTROWS(EXCEPT(GecenDonem, BuDonem))',
      grid: [{ t: 'Tarih', c: 'Yil' }], explain: 'EXCEPT(A, B): A\'da olup B\'de olmayanlar. Sıra önemlidir: EXCEPT(BuDonem, GecenDonem) yeni (ya da geri dönen) müşterileri verirdi.' },
    { t: 'dax', q: '<b>Karşı Ürün Satışı</b>: Eksende bağlantısız <code>KarsiUrunler[KarsiUrun]</code> var. Eksendeki ürünlerin net satışını, TREATAS ile <code>KarsiUrunler[KarsiUrunNo]</code> değerlerini <code>Urunler[UrunNo]</code>\'ya uygulayarak hesapla.', name: 'Karşı Ürün Satışı',
      sol: 'CALCULATE([Net Satış], TREATAS(VALUES(KarsiUrunler[KarsiUrunNo]), Urunler[UrunNo]))', grid: [{ t: 'KarsiUrunler', c: 'KarsiKategori' }, { t: 'Tarih', c: 'Yil' }],
      explain: 'KarsiUrunler modele bağlı değildir; normalde [Net Satış] her satırda genel toplamı verir. TREATAS seçili ürün numaralarına Urunler[UrunNo] soy bağını vererek sanal bir ilişki kurar.' },
    { t: 'query', q: 'Her <b>kategori</b> için net satışa göre <b>ilk 2 ürünü</b> listeleyen bir tablo döndür: GENERATE(VALUES(Kategoriler[Kategori]), TOPN(2, …)). TOPN içinde ürünleri <code>CALCULATETABLE(VALUES(Urunler[Urun]))</code> ile al ki kategori filtresi uygulansın.', start: 'EVALUATE\nGENERATE(\n    VALUES(Kategoriler[Kategori]),\n    \n)',
      sol: 'EVALUATE\nGENERATE(\n    VALUES(Kategoriler[Kategori]),\n    TOPN(2, CALCULATETABLE(VALUES(Urunler[Urun])), [Net Satış])\n)', hint: 'TOPN(2, CALCULATETABLE(VALUES(Urunler[Urun])), [Net Satış])' }
  ]
},

{
  id: 'pencere', lv: 'C1', mod: 'İleri DAX', min: 18,
  title: 'Pencere fonksiyonları ve görsel hesaplamalar',
  sum: 'OFFSET, WINDOW, INDEX, RANK, ROWNUMBER; ORDERBY ve PARTITIONBY; görsel hesaplamalar (RUNNINGSUM, PREVIOUS, MOVINGAVERAGE).',
  body: `
<h2>Neden pencere fonksiyonları?</h2>
<p>Zaman zekâsı fonksiyonları yalnızca tarih tablosunda çalışır. “Sıradaki bir önceki satır”, “son 3 satırın ortalaması”, “grup içindeki sıra” gibi sorular sıralı her eksende sorulur. 2022'de DAX'a eklenen pencere fonksiyonları bunu SQL'deki <code>OVER()</code> mantığıyla çözer.</p>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Döndürür</th><th>SQL karşılığı</th></tr>
<tr><td><code>OFFSET(n, ilişki, ORDERBY(…))</code></td><td>Geçerli satırdan n satır uzaktaki satır</td><td>LAG / LEAD</td></tr>
<tr><td><code>WINDOW(başl, REL|ABS, bitiş, REL|ABS, ilişki, ORDERBY(…))</code></td><td>Bir satır aralığı</td><td>ROWS BETWEEN</td></tr>
<tr><td><code>INDEX(n, ilişki, ORDERBY(…))</code></td><td>Mutlak konumdaki satır (−1 = son)</td><td>FIRST_VALUE / LAST_VALUE</td></tr>
<tr><td><code>RANK(ilişki, ORDERBY(…))</code></td><td>Sıra numarası</td><td>RANK</td></tr>
<tr><td><code>ROWNUMBER(ilişki, ORDERBY(…))</code></td><td>Benzersiz satır numarası</td><td>ROW_NUMBER</td></tr>
</table></div>
<ul>
<li><b>İlişki (relation):</b> Üzerinde dolaşılacak satırlar; genellikle <code>ALLSELECTED(Tarih[YilAy])</code>.</li>
<li><b>ORDERBY:</b> Sıralama sütunu ya da ölçüsü, ASC/DESC.</li>
<li><b>PARTITIONBY:</b> Grup sınırı; sıra her grupta yeniden başlar (SQL PARTITION BY).</li>
</ul>
<pre class="dax">3 Ay Pencere Ort. =
AVERAGEX(
    WINDOW(-2, REL, 0, REL, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy])),
    [Net Satış]
)

Kategori İçi Sıra =
RANK(
    ALLSELECTED(Urunler[Kategori], Urunler[Urun]),
    ORDERBY([Net Satış], DESC),
    PARTITIONBY(Urunler[Kategori])
)</pre>
<div class="note"><b>Zaman zekâsından farkı</b><code>OFFSET(-1, ALLSELECTED(Tarih[YilAy]), …)</code> görseldeki bir önceki satırı bulur. Görselde yalnızca 2024 varsa Ocak'ın öncesi yoktur. <code>PREVIOUSMONTH</code> ise takvime bakar ve Aralık 2023'ü bulur. Hangisi doğru? İş sorusuna göre değişir.</div>
<h2>Görsel hesaplamalar</h2>
<p>Bir görseli seçip Giriş → <b>Yeni görsel hesaplaması</b>. Formül, modeldeki tüm veriyle değil yalnızca görselin ızgarasıyla (satırlar, sütunlar) çalışır. Model ölçüsü yazmaktan çok daha basittir:</p>
<pre class="dax" data-notry>Kümülatif = RUNNINGSUM([Net Satış])
Önceki Ay = PREVIOUS([Net Satış])
Değişim = [Net Satış] - PREVIOUS([Net Satış])
3 Ay Ort. = MOVINGAVERAGE([Net Satış], 3)
Satıra Göre Pay = DIVIDE([Net Satış], COLLAPSE([Net Satış], ROWS))</pre>
<p>Görsel hesaplamalar modelde ölçü olarak görünmez; yalnızca o görselde yaşar. Hızlı ve basit analizler için idealdir; birden çok raporda kullanılacak iş tanımları ise model ölçüsü olmalıdır. PL-300 artık görsel hesaplama oluşturmayı ölçüyor.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Önceki Satır Satışı</b>: Görseldeki aylar (ALLSELECTED(Tarih[YilAy])) arasında bir önceki ayın net satışı (OFFSET).', name: 'Önceki Satır Satışı',
      sol: 'CALCULATE([Net Satış], OFFSET(-1, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC)))', grid: [{ t: 'Tarih', c: 'YilAy' }], noTotal: true,
      explain: 'OFFSET, geçerli ayın sıralı listede bir öncesindeki satırı tek satırlık tablo olarak döndürür; CALCULATE onu filtre olarak uygular. İlk ayda boş döner.' },
    { t: 'dax', q: '<b>3 Ay Pencere Ort.</b>: Görseldeki aylar arasında geçerli ay ile önceki 2 ayın net satış ortalaması (WINDOW + AVERAGEX).', name: '3 Ay Pencere Ort.',
      sol: 'AVERAGEX(WINDOW(-2, REL, 0, REL, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy])), [Net Satış])', grid: [{ t: 'Tarih', c: 'YilAy' }], noTotal: true,
      explain: 'WINDOW(-2, REL, 0, REL, …) geçerli satırdan iki önceki satıra kadar olan pencereyi döndürür; AVERAGEX bu üç ayın satışını ortalar. İlk aylarda pencere kısalır.' },
    { t: 'dax', q: '<b>Kanal Sırası</b>: Kanalları net satışa göre büyükten küçüğe sırala (RANK + ORDERBY). Kontrol satırları Satislar[Kanal].', name: 'Kanal Sırası',
      sol: 'RANK(ALLSELECTED(Satislar[Kanal]), ORDERBY([Net Satış], DESC))', grid: [{ t: 'Satislar', c: 'Kanal' }], noTotal: true, explain: 'RANK ilişkiyi ORDERBY\'a göre sıralar ve geçerli satırın konumunu döndürür. RANKX\'ten farkı, eşitlik ve sıralama kurallarının açıkça tanımlanmasıdır.' }
  ]
},

{
  id: 'musteri-analitigi', lv: 'C1', mod: 'Müşteri Analitiği', min: 24,
  title: 'Müşteri analitiği: yeni, geri dönen, kayıp, kohort, RFM',
  sum: 'Müşteri yaşam döngüsünü ölçen uzun DAX kalıpları ve her birinin adım adım mantığı.',
  body: `
<h2>Müşteri yaşam döngüsü soruları</h2>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Kalıp</th><th>Anahtar fonksiyon</th></tr>
<tr><td>Bu ay kaç yeni müşteri geldi?</td><td>Bu dönem − (dönem öncesi)</td><td><code>EXCEPT</code></td></tr>
<tr><td>Kaçı geri döndü?</td><td>Bu dönem ∩ (dönem öncesi)</td><td><code>INTERSECT</code></td></tr>
<tr><td>Kaçını kaybettik?</td><td>(önceki 12 ay) − bu dönem</td><td><code>DATESINPERIOD</code> + <code>EXCEPT</code></td></tr>
<tr><td>İlk ayın müşterileri ne kadar süre kalıyor?</td><td>Kohort matrisi</td><td>Hesaplanmış sütunlar + <code>DISTINCTCOUNT</code></td></tr>
<tr><td>Hangi müşteri değerli, hangisi risk altında?</td><td>RFM skoru ve segmenti</td><td><code>DATEDIFF</code>, <code>SWITCH(TRUE())</code></td></tr>
</table></div>
<h2>Ortak teknik: tarih filtresini değiştirmek</h2>
<p>Bu kalıpların hepsinde “bu dönem”in yanında “dönemden önceki her şey” ya da “son 12 ay” gibi ikinci bir zaman penceresi gerekir. Tarih tablosu işaretli olduğu için <code>Tarih[Tarih] &lt; DonemBasi</code> filtresi Yıl, Ay gibi diğer tarih filtrelerinin yerine geçer. Tablo işaretli olmasaydı <code>REMOVEFILTERS(Tarih)</code> eklemen gerekirdi.</p>
<pre class="dax">Geri Dönen Müşteri =
VAR DonemBasi = MIN(Tarih[Tarih])
VAR BuDonem =
    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] &lt;&gt; "İptal")
VAR Onceki =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        Tarih[Tarih] &lt; DonemBasi,
        Satislar[Durum] &lt;&gt; "İptal"
    )
RETURN COUNTROWS(INTERSECT(BuDonem, Onceki))</pre>
<h2>Kohort analizi</h2>
<p>Kohort = aynı ayda ilk alışverişini yapan müşteriler. İki hesaplanmış sütun gerekir:</p>
<pre class="dax" data-notry>-- Musteriler tablosunda:
IlkSiparis = CALCULATE(MIN(Satislar[Tarih]), Satislar[Durum] &lt;&gt; "İptal")
KohortAy = FORMAT(Musteriler[IlkSiparis], "yyyy-MM")
-- Satislar tablosunda:
KohortAyFarki = DATEDIFF(RELATED(Musteriler[IlkSiparis]), Satislar[Tarih], MONTH)</pre>
<p>Hesaplanmış sütunda <code>CALCULATE</code> bağlam geçişi yapar: müşteri satırı filtreye dönüşür ve yalnızca o müşterinin siparişleri arasında en küçük tarih bulunur. Matris: satırlar <code>Musteriler[KohortAy]</code>, sütunlar <code>Satislar[KohortAyFarki]</code>, değer “Kohort Tutma %”.</p>
<h2>RFM</h2>
<p>R (Recency, yenilik), F (Frequency, sıklık), M (Monetary, parasal değer). Her müşteri üç boyutta 1–5 puan alır; puan kombinasyonları iş dilinde segmentlere çevrilir. Ayrıntılı ölçüler <button class="lnk" data-go="lab">Ölçü Laboratuvarı</button>'nda, sonuçlar <button class="lnk" data-go="dash" data-id="rfm">RFM dashboardu</button>'nda.</p>
<div class="tip"><b>Ölçü mü, sütun mu?</b>Müşteri segmentini hesaplanmış sütun yaparsan dilimleyicide ve eksende kullanabilirsin ama yenileme anında donar. Ölçü yaparsan seçili döneme göre değişir ama eksene konamaz; o zaman bağlantısız bir segment tablosu ve sayım ölçüsü gerekir (RFMSegmentleri kalıbı).</div>
`,
  ex: [
    { t: 'dax', q: '<b>Geri Dönen Müşteri</b>: Bu dönemde alışveriş yapanlardan, dönem başından önce de alışveriş yapmış olanların sayısı (iptaller hariç).', name: 'Geri Dönen Müşteri',
      start: 'VAR DonemBasi = MIN(Tarih[Tarih])\nVAR BuDonem =\n    \nVAR Onceki =\n    \nRETURN\n    ',
      sol: 'VAR DonemBasi = MIN(Tarih[Tarih])\nVAR BuDonem = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")\nVAR Onceki = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Tarih] < DonemBasi, Satislar[Durum] <> "İptal")\nRETURN COUNTROWS(INTERSECT(BuDonem, Onceki))',
      grid: [{ t: 'Tarih', c: 'YilCeyrek' }, { t: 'Satislar', c: 'Kanal' }], hint: 'Onceki: CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Tarih] < DonemBasi, …). Sonra INTERSECT.',
      explain: 'Tarih[Tarih] < DonemBasi filtresi işaretli tarih tablosunda diğer tarih filtrelerinin yerine geçer: dönem öncesinin tamamı. Kanal satırında yalnızca o kanaldaki alışverişler dikkate alınır.' },
    { t: 'dax', q: '<b>Kayıp Müşteri</b>: Dönem başından önceki 12 ayda alışveriş yapıp bu dönemde yapmayan müşteri sayısı. Pencere: DATESINPERIOD(Tarih[Tarih], DonemBasi - 1, -12, MONTH).', name: 'Kayıp Müşteri',
      sol: 'VAR DonemBasi = MIN(Tarih[Tarih])\nVAR OncekiYil = CALCULATETABLE(VALUES(Satislar[MusteriNo]), DATESINPERIOD(Tarih[Tarih], DonemBasi - 1, -12, MONTH), Satislar[Durum] <> "İptal")\nVAR BuDonem = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")\nRETURN COUNTROWS(EXCEPT(OncekiYil, BuDonem))',
      grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Tarih', c: 'YilCeyrek' }], explain: 'DonemBasi - 1 bir tarihten bir gün çıkarır. DATESINPERIOD bu günden geriye 12 aylık pencere üretir. EXCEPT önceki pencerede olup bu dönemde olmayanları bırakır.' },
    { t: 'dax', q: '<b>Kohort Tutma %</b>: Kohort matrisi hücresi: bu kohort ve ay farkında alışveriş yapan müşteri sayısının, kohortun 0. aydaki müşteri sayısına oranı. Takvim filtrelerini REMOVEFILTERS(Tarih) ile yok say.', name: 'Kohort Tutma %',
      sol: 'VAR Aktif = CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[Durum] <> "İptal", REMOVEFILTERS(Tarih))\nVAR Boyut = CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[KohortAyFarki] = 0, Satislar[Durum] <> "İptal", REMOVEFILTERS(Tarih))\nRETURN DIVIDE(Aktif, Boyut)',
      grid: [{ t: 'Musteriler', c: 'KohortAy' }, { t: 'Satislar', c: 'KohortAyFarki' }], explain: 'Aynı sütuna (KohortAyFarki) verilen “= 0” filtresi, hücrenin ay farkı filtresinin yerine geçer; böylece payda hep kohortun ilk ayıdır.' },
    { t: 'dax', q: '<b>Son Alımdan Bu Yana Gün</b>: Seçili dönemin son gününe göre müşterinin son (iptal edilmemiş) alışverişinden bu yana geçen gün. Müşteri satırında hesaplanacak; tek müşteri yoksa boş döndür.', name: 'Son Alımdan Bu Yana Gün',
      sol: 'VAR Bugun = MAX(Tarih[Tarih])\nVAR SonAlim = CALCULATE(MAX(Satislar[Tarih]), Tarih[Tarih] <= Bugun, Satislar[Durum] <> "İptal")\nRETURN IF(HASONEVALUE(Musteriler[MusteriNo]) && NOT ISBLANK(SonAlim), DATEDIFF(SonAlim, Bugun, DAY))',
      grid: [{ t: 'Musteriler', c: 'Musteri' }], noTotal: true, explain: 'RFM\'nin R bileşeni. Tarih[Tarih] <= Bugun, yıl filtresini kaldırıp geçmişin tamamına bakar. Müşteri adı tekrarlanabildiği için kontrol MusteriNo üzerinden yapılır.' }
  ]
},

{
  id: 'segmentasyon', lv: 'C1', mod: 'Müşteri Analitiği', min: 20,
  title: 'Segmentasyon: ABC, dinamik dilimler ve ne olur analizi',
  sum: 'Pareto ve ABC sınıfı, bağlantısız tablolarla dinamik segment, sayısal aralık parametresi ile senaryo.',
  body: `
<h2>Statik mi, dinamik mi?</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Statik segment (hesaplanmış sütun)</th><th>Dinamik segment (ölçü + bağlantısız tablo)</th></tr>
<tr><td>Ne zaman hesaplanır?</td><td>Yenilemede</td><td>Her etkileşimde</td></tr>
<tr><td>Filtrelere tepki</td><td>Yok (2024 seçince de tüm zamanlara göre)</td><td>Var</td></tr>
<tr><td>Eksen/dilimleyicide kullanım</td><td>Doğrudan</td><td>Bağlantısız tablo üzerinden</td></tr>
<tr><td>Performans</td><td>Hızlı</td><td>Müşteri sayısıyla orantılı</td></tr>
</table></div>
<h2>Dinamik segmentasyon kalıbı</h2>
<ol>
<li>Sınırları tutan bağlantısız tablo: <code>MusteriDilimleri</code> (Dilim, Min, Max, Sira). Giriş → Veri gir ile ya da DAX <code>DATATABLE</code> ile.</li>
<li>Her müşterinin değerini hesaplayan sanal tablo: <code>ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "S", [Net Satış])</code>.</li>
<li>Görünen dilimler üzerinde dolaşıp sınırlar içindeki müşterileri say.</li>
</ol>
<pre class="dax">Dilimler (DATATABLE) =
DATATABLE(
    "Dilim", STRING, "Min", INTEGER, "Max", INTEGER,
    {
        {"Küçük", 0, 2000},
        {"Orta", 2000, 6000},
        {"Büyük", 6000, 15000},
        {"VIP", 15000, 999999999}
    }
)</pre>
<h2>ABC (Pareto)</h2>
<p>Ürünlerin küçük bir kısmı satışın büyük kısmını getirir. ABC sınıflandırması bunu iş kuralına çevirir: kümülatif payı %70'e kadar olanlar A (yakından izlenir, stoğu bitmemeli), %90'a kadar B, kalanı C (gözden geçirilecek uzun kuyruk). Kümülatif toplamın klasik DAX yolu: “satışı benimkinden büyük ya da eşit olanların toplamı”.</p>
<h2>Ne olur (what-if) parametresi</h2>
<p>Modelleme → <b>Yeni parametre → Sayısal aralık</b>: ad, veri türü, en küçük, en büyük, artış, varsayılan. Power BI iki şey oluşturur:</p>
<pre class="dax" data-notry>FiyatSenaryosu = GENERATESERIES(-0.2, 0.2, 0.05)
FiyatSenaryosu Değeri = SELECTEDVALUE(FiyatSenaryosu[FiyatDegisimi], 0)</pre>
<p>ve sayfaya bir kaydırıcı dilimleyici ekler. Ölçülerinde <code>[FiyatSenaryosu Değeri]</code>'ni kullanarak senaryo hesaplarsın. Parametre tablosunu eksene koyarsan her senaryoyu yan yana görürsün (ör. kâr eğrisi ve optimum fiyat).</p>
<div class="tip"><b>Dashboardda</b><button class="lnk" data-go="dash" data-id="fiyat">Fiyat ve İndirim dashboardu</button> bu parametreyi kaydırıcıyla kullanıyor; <button class="lnk" data-go="dash" data-id="urun">Ürün dashboardu</button> ABC sınıfını ve Pareto eğrisini gösteriyor.</div>
`,
  ex: [
    { t: 'dax', q: '<b>Dilimdeki Müşteri</b>: Eksende <code>MusteriDilimleri[Dilim]</code> var. Seçili dönemde net satışı dilimin Min (hariç) ve Max (dahil) sınırları arasında olan müşteri sayısı.', name: 'Dilimdeki Müşteri',
      start: 'VAR MusteriSatis =\n    ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "S", [Net Satış])\nRETURN\n    SUMX(\n        MusteriDilimleri,\n        \n    )',
      sol: 'VAR MusteriSatis =\n    ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "S", [Net Satış])\nRETURN\n    SUMX(\n        MusteriDilimleri,\n        COUNTROWS(FILTER(MusteriSatis, [S] > MusteriDilimleri[Min] && [S] <= MusteriDilimleri[Max]))\n    )',
      grid: [{ t: 'MusteriDilimleri', c: 'Dilim' }], explain: 'SUMX, eksendeki dilim satırında yalnızca o dilimi dolaşır; MusteriDilimleri[Min] ve [Max] o satırın sınırlarıdır. Toplamda tüm dilimler toplanır ve aktif müşteri sayısına eşittir.' },
    { t: 'dax', q: '<b>Kümülatif Pay %</b>: Görünen ürünler satışa göre sıralandığında, bu ürüne kadar olan birikimli satışın toplama oranı (Pareto). Satışı olmayan üründe boş döndür.', name: 'Kümülatif Pay %',
      sol: 'VAR UrunSatis = [Net Satış]\nVAR Toplam = CALCULATE([Net Satış], ALLSELECTED(Urunler[Urun]))\nVAR Kumulatif = SUMX(FILTER(ADDCOLUMNS(ALLSELECTED(Urunler[Urun]), "S", [Net Satış]), [S] >= UrunSatis), [S])\nRETURN IF(NOT ISBLANK(UrunSatis), DIVIDE(Kumulatif, Toplam))',
      grid: [{ t: 'Urunler', c: 'Urun' }], noTotal: true, explain: '“Satışı benimkinden büyük ya da eşit olanların toplamı” kümülatif toplamın pencere fonksiyonu olmadan klasik yoludur. ALLSELECTED dilimleyici seçimine saygı gösterir.' },
    { t: 'dax', q: '<b>Senaryo Satışı</b>: FiyatSenaryosu[FiyatDegisimi] seçili değeri (yoksa 0) kadar fiyat değişirse ve esneklik −1,4 ise satış ne olur? Her satırda Tutar × (1 + Değişim) × MAX(0, 1 − 1,4 × Değişim); iptaller hariç.', name: 'Senaryo Satışı',
      sol: 'VAR Degisim = SELECTEDVALUE(FiyatSenaryosu[FiyatDegisimi], 0)\nVAR AdetCarpani = MAX(0, 1 - 1.4 * Degisim)\nRETURN CALCULATE(SUMX(Satislar, Satislar[Tutar] * (1 + Degisim) * AdetCarpani), Satislar[Durum] <> "İptal")',
      grid: [{ t: 'FiyatSenaryosu', c: 'FiyatDegisimi' }, { t: 'Kategoriler', c: 'Kategori' }], explain: 'Parametre tablosu eksende olunca SELECTEDVALUE her satırın senaryosunu verir; böylece tüm senaryolar yan yana görünür.' }
  ]
},

{
  id: 'yonetisim', lv: 'C1', mod: 'Yönetim ve Güvenlik', min: 18,
  title: 'Yönetişim: erişim, etiketler, onay, abonelik ve uyarılar',
  sum: 'Çalışma alanı rolleri, öğe düzeyi erişim, Derleme izni, duyarlılık etiketleri, tanıtma/sertifikalama, pano oluşturma, abonelik ve veri uyarıları.',
  body: `
<h2>Çalışma alanı rolleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Yetki</th><th>Yönetici</th><th>Üye</th><th>Katkıda bulunan</th><th>Görüntüleyici</th></tr>
<tr><td>İçeriği görüntüle</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>İçerik oluştur / düzenle / sil</td><td>✓</td><td>✓</td><td>✓</td><td>—</td></tr>
<tr><td>Uygulama yayımla / güncelle</td><td>✓</td><td>✓</td><td>(ayarla)</td><td>—</td></tr>
<tr><td>Başkalarını ekle</td><td>✓ (tüm roller)</td><td>✓ (Üye ve altı)</td><td>—</td><td>—</td></tr>
<tr><td>Çalışma alanını sil / ayarları</td><td>✓</td><td>—</td><td>—</td><td>—</td></tr>
<tr><td>RLS uygulanır mı?</td><td>Hayır</td><td>Hayır</td><td>Hayır</td><td>Evet</td></tr>
</table></div>
<h2>Öğe düzeyi erişim</h2>
<ul>
<li><b>Paylaşım:</b> Bir raporu kişiye ya da gruba paylaşmak; “yeniden paylaşabilir” ve “derleyebilir” seçenekleri.</li>
<li><b>Anlam modeli izinleri:</b> <b>Okuma</b> (raporları görür), <b>Derleme (Build)</b> (bu modeli kullanarak kendi raporunu yapabilir, Excel'de analiz edebilir), <b>Yeniden paylaşma</b>. Kurumsal “tek doğru model” stratejisinde rapor yazarlarına Derleme izni verilir, modeli düzenleme yetkisi verilmez.</li>
<li><b>Uygulama kitleleri:</b> Aynı uygulamada farklı gruplara farklı rapor/sayfa gösterme.</li>
</ul>
<h2>Duyarlılık etiketleri</h2>
<p>Microsoft Purview Information Protection etiketleri (Genel, İç, Gizli, Çok gizli) rapora ve modele uygulanır. Etiket Excel, PowerPoint ve PDF'e dışa aktarımda dosyaya taşınır ve şifreleme ile korunabilir. Desktop'ta Giriş → Duyarlılık; Service'te öğenin ayarları.</p>
<h2>Onaylama: tanıtma ve sertifikalama</h2>
<ul>
<li><b>Tanıtılmış (Promoted):</b> Öğenin sahibi “bu kullanıma hazır” der. Herkes yapabilir.</li>
<li><b>Sertifikalı (Certified):</b> Kuruluşun belirlediği kişiler, öğenin kalite standartlarını karşıladığını onaylar. Kiracı yöneticisi kimin sertifikalayabileceğini belirler.</li>
<li>Onaylı modeller veri hub'ında / OneLake kataloğunda üstte listelenir; kullanıcılar doğru modeli bulur.</li>
</ul>
<h2>Panolar, abonelikler ve uyarılar</h2>
<ul>
<li><b>Pano (dashboard):</b> Service'te farklı raporlardan görselleri <b>sabitleyerek</b> (pin) oluşturulan tek sayfa. Canlı sayfa da sabitlenebilir. Bu uygulamadaki “dashboard”lar ise rapor sayfası düzeninde örneklerdir; günlük dilde ikisi karıştırılır, sınavda karıştırılmaz.</li>
<li><b>Abonelik:</b> Rapor sayfasının ya da sayfalandırılmış raporun düzenli e-posta anlık görüntüsü (günlük, haftalık, yenilemeden sonra). Başkaları adına abone yapılabilir; dinamik abonelik ile alıcıya göre filtre.</li>
<li><b>Veri uyarıları:</b> Panodaki kart, KPI ve gösterge kutucuklarında eşik aşılınca bildirim (“Net satış 50.000'in altına düşerse”). Power Automate ile iş akışı tetiklenebilir. Fabric'te Activator daha gelişmiş kurallar sunar.</li>
</ul>
<h2>Ağ geçidi ne zaman gerekir?</h2>
<p>Service'in buluttan erişemediği kaynaklar için: şirket ağındaki SQL Server, paylaşılan klasördeki dosyalar, şirket içi Analysis Services. Bulut kaynakları (Azure SQL, SharePoint Online, OneDrive, Fabric) için gerekmez. <b>Kişisel mod</b> yalnızca bir kullanıcı ve Import için; <b>standart mod</b> birden çok kullanıcı, DirectQuery ve canlı bağlantı için.</p>
`,
  ex: [
    { t: 'mc', q: 'Rapor yazarlarının şirketin onaylı satış modeli üzerinde kendi raporlarını yapabilmesini, ama modeli değiştirememesini istiyorsun.', o: ['Çalışma alanı Üye rolü', 'Anlam modelinde Derleme (Build) izni', 'Web\'de yayımla', 'Görüntüleyici rolü yeterli'], a: 1, why: 'Derleme izni modeli kullanarak yeni rapor oluşturmayı sağlar; düzenleme yetkisi vermez.' },
    { t: 'mc', q: 'Net satış kartı belirli bir değerin altına düşünce yöneticiye bildirim gitmeli.', o: ['Pano kutucuğunda veri uyarısı', 'Yer imi', 'RLS', 'Duyarlılık etiketi'], a: 0, why: 'Veri uyarıları pano kutucuklarında (kart, KPI, gösterge) tanımlanır.' },
    { t: 'mc', q: 'Kuruluşta kalite onayından geçmiş tek bir satış modeli olduğunu herkese göstermek için?', o: ['Tanıtmak (Promoted)', 'Sertifikalamak (Certified)', 'Gizlemek', 'Etiketlemek'], a: 1, why: 'Sertifikalama, yetkili kişilerin kalite onayıdır; tanıtma ise sahibin beyanıdır.' },
    { t: 'mc', q: 'Kaynak OneDrive İş\'teki bir Excel dosyası. Zamanlanmış yenileme için ağ geçidi gerekir mi?', o: ['Evet, her zaman', 'Hayır, bulut kaynağı', 'Yalnızca DirectQuery\'de', 'Yalnızca RLS varsa'], a: 1, why: 'Bulut kaynaklarına Service doğrudan erişir.' }
  ]
},

{
  id: 'sayfalandirilmis', lv: 'C1', mod: 'Yönetim ve Güvenlik', min: 12,
  title: 'Sayfalandırılmış raporlar: ne zaman?',
  sum: 'Power BI Report Builder, piksel hassasiyetinde yazdırılabilir raporlar, parametreler ve etkileşimli raporla karşılaştırma.',
  body: `
<h2>İki farklı rapor türü</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Etkileşimli rapor (.pbix)</th><th>Sayfalandırılmış rapor (.rdl)</th></tr>
<tr><td>Amaç</td><td>Keşif, analiz, dashboard</td><td>Yazdırma, PDF, operasyonel liste, resmi belge</td></tr>
<tr><td>Düzen</td><td>Ekrana sığan sayfa</td><td>Piksel hassasiyetinde, çok sayfaya yayılan tablolar</td></tr>
<tr><td>Araç</td><td>Power BI Desktop</td><td>Power BI Report Builder (ücretsiz)</td></tr>
<tr><td>Etkileşim</td><td>Çapraz filtre, detaya inme, araç ipucu</td><td>Parametreler, detay bağlantıları</td></tr>
<tr><td>Satır sayısı</td><td>Görsel başına sınırlı</td><td>Binlerce satır, sayfa sonları, üst/alt bilgi</td></tr>
<tr><td>Tipik örnek</td><td>Satış performansı dashboardu</td><td>Fatura, sipariş listesi, aylık resmî mutabakat</td></tr>
</table></div>
<h2>Ne zaman sayfalandırılmış?</h2>
<ul>
<li>Rapor yazdırılacak ya da PDF olarak dağıtılacaksa.</li>
<li>Tüm satırlar (ör. 12.000 sipariş satırı) eksiksiz listelenmeliyse.</li>
<li>Belge formatı sabitse (logo, üst bilgi, imza alanı, sayfa numarası).</li>
<li>Her alıcıya kendi verisiyle (dinamik abonelik) e-posta gidecekse.</li>
</ul>
<h2>Kurulum adımları</h2>
<ol>
<li>Report Builder → veri kaynağı olarak yayımlanmış anlam modelini seç.</li>
<li>Sorgu tasarımcısında alanları ve ölçüleri sürükle; arka planda bir DAX sorgusu oluşur.</li>
<li>Parametre ekle (Yıl, Kategori); kullanıcı raporu açarken seçer.</li>
<li>Tablo (tablix) yerleştir, grupla, sayfa sonlarını ve tekrarlanan başlıkları ayarla.</li>
<li>Service'e yayımla; abonelik ile PDF dağıt.</li>
</ol>
<div class="note"><b>Etkileşimli raporda “sayfalandırılmış görsel”</b>Power BI raporuna eklenen sayfalandırılmış rapor görseli, etkileşimli raporun filtrelerini parametre olarak gönderip yazdırılabilir listeyi aynı sayfada gösterir.</div>
`,
  ex: [
    { t: 'mc', q: 'Muhasebe her ay 8.000 satırlık fatura listesini logolu, sayfa numaralı PDF olarak istiyor.', o: ['Etkileşimli rapor', 'Sayfalandırılmış rapor', 'Pano', 'Ayrıştırma ağacı'], a: 1, why: 'Çok sayfaya yayılan, yazdırılabilir, sabit formatlı belgeler sayfalandırılmış raporun işidir.' },
    { t: 'mc', q: 'Sayfalandırılmış raporlar hangi araçla tasarlanır?', o: ['Power BI Desktop', 'Power BI Report Builder', 'DAX Studio', 'Tabular Editor'], a: 1, why: 'Report Builder ücretsiz ve ayrı bir uygulamadır.' }
  ]
}

);
