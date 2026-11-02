/* Kesit Power BI içerik 3: İleri seviye */
(window.PBI_LESSONS = window.PBI_LESSONS || []).push(

{
  id: 'baglam-gecisi', lv: 'ileri', mod: 'İleri DAX', min: 18,
  title: 'Bağlam geçişi',
  sum: 'Satır bağlamı filtre bağlamına nasıl dönüşür? Ölçü çağırmak neden farklı sonuç verir?',
  body: `
<h2>Tanım</h2>
<p><b>Bağlam geçişi</b> (context transition), <code>CALCULATE</code> bir satır bağlamının içinde çalıştığında olur: geçerli satırın tüm sütun değerleri <b>filtreye</b> dönüşür. Ölçüler her zaman gizli bir <code>CALCULATE</code> ile sarılı olduğundan, bir yineleyicinin içinde <b>ölçü çağırmak</b> da bağlam geçişini tetikler.</p>
<h2>Karşılaştır</h2>
<pre class="dax">A = SUMX(Musteriler, SUM(Satislar[Tutar]))
B = SUMX(Musteriler, CALCULATE(SUM(Satislar[Tutar])))
C = SUMX(Musteriler, [Toplam Satış])</pre>
<ul>
<li><b>A:</b> Her müşteri satırında <code>SUM</code> çalışır ama satır bağlamı filtre değildir; her satırda <i>tüm</i> satışların toplamı gelir. 150 müşteri × toplam satış: anlamsız, çok büyük bir sayı.</li>
<li><b>B:</b> <code>CALCULATE</code> geçerli müşteri satırını filtreye çevirir; her satırda o müşterinin satışı hesaplanır. Sonuç, toplam satışa eşittir.</li>
<li><b>C:</b> Ölçü çağrısı gizli <code>CALCULATE</code> içerdiği için B ile aynıdır.</li>
</ul>
<p>Stüdyo'da üçünü de çalıştırıp farkı gör.</p>
<h2>Nerede işe yarar?</h2>
<pre class="dax">-- Müşteri başına ortalama satış (yalnızca alışveriş yapanlar)
Müşteri Ortalaması = AVERAGEX(VALUES(Satislar[MusteriNo]), [Net Satış])

-- 10.000 TL üstü alışveriş yapan müşteri sayısı
Değerli Müşteri = COUNTROWS(FILTER(VALUES(Musteriler[Musteri]), [Net Satış] &gt; 10000))</pre>
<div class="warn"><b>Dikkat: yinelenen satırlar</b>Bağlam geçişi satırın <i>tüm sütunlarını</i> filtreye çevirir. Tabloda birebir aynı iki satır varsa, her biri ikisinin toplamını görür ve sonuç iki kat sayılır. Bu yüzden yineleyiciyi mümkünse anahtarı olan bir tabloda ya da <code>VALUES(Tablo[Anahtar])</code> üzerinde çalıştır.</div>
<div class="note"><b>Performans</b>Bağlam geçişi her satır için yeni bir filtre bağlamı kurar. 1 milyon satırlık olgu tablosu üzerinde <code>SUMX(Satislar, [Ölçü])</code> yavaştır; boyut üzerinde (<code>VALUES(Urunler[Urun])</code>) dolaşmak çok daha hızlıdır.</div>
`,
  ex: [
    { t: 'dax', q: '<b>Müşteri Ortalaması</b>: alışveriş yapan müşteriler (<code>VALUES(Satislar[MusteriNo])</code>) üzerinde <code>[Net Satış]</code> ortalaması.', name: 'Müşteri Ortalaması', sol: 'AVERAGEX(VALUES(Satislar[MusteriNo]), [Net Satış])', hint: 'AVERAGEX(VALUES(...), [Net Satış]): ölçü çağrısı bağlam geçişi yapar.' },
    { t: 'dax', q: '<b>Değerli Müşteri</b>: net satışı 10.000 TL\'nin üzerinde olan müşteri sayısı (<code>Musteriler[Musteri]</code> değerleri üzerinde).', name: 'Değerli Müşteri', sol: 'COUNTROWS(FILTER(VALUES(Musteriler[Musteri]), [Net Satış] > 10000))', hint: 'COUNTROWS(FILTER(VALUES(Musteriler[Musteri]), [Net Satış] > 10000))', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Satislar', c: 'Kanal' }] },
    { t: 'dax', q: '<b>En İyi Ay Satışı</b>: görünen aylar (<code>VALUES(Tarih[YilAy])</code>) içinde en yüksek aylık net satış.', name: 'En İyi Ay Satışı', sol: 'MAXX(VALUES(Tarih[YilAy]), [Net Satış])', hint: 'MAXX(VALUES(Tarih[YilAy]), [Net Satış])', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Kategoriler', c: 'Kategori' }] },
    { t: 'mc', q: '<code>SUMX(Urunler, SUM(Satislar[Tutar]))</code> ifadesi kategori satırında ne döndürür?', o: ['Kategorinin satışı', 'Kategorideki ürün sayısı × kategorinin toplam satışı', 'Boş', 'Hata'], a: 1, why: 'SUM satır bağlamını filtreye çevirmez. Her ürün satırında kategorinin toplamı gelir ve ürün sayısı kadar toplanır.' }
  ]
},

{
  id: 'zaman-ileri', lv: 'ileri', mod: 'Zaman Zekâsı', min: 16,
  title: 'Gelişmiş zaman hesapları',
  sum: 'Hareketli ortalama, kümülatif toplam, dönem başı/sonu ve özel dönemler.',
  body: `
<h2>Hareketli ortalama</h2>
<pre class="dax">3 Ay Hareketli Ort. =
VAR Donem = DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -3, MONTH)
RETURN DIVIDE(CALCULATE([Net Satış], Donem), 3)</pre>
<p><code>DATESINPERIOD(tarih, başlangıç, sayı, birim)</code> başlangıçtan geriye (negatif sayı) ya da ileriye doğru bir tarih aralığı döndürür. <code>MAX(Tarih[Tarih])</code> görünen dönemin son günüdür.</p>
<p>Ay sayısını sabit 3 yerine gerçekten verisi olan ay sayısına bölmek istersen:</p>
<pre class="dax">3 Ay Ortalama (gerçek) =
VAR Donem = DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -3, MONTH)
RETURN AVERAGEX(CALCULATETABLE(VALUES(Tarih[YilAy]), Donem), [Net Satış])</pre>
<h2>Kümülatif toplam</h2>
<pre class="dax">Kümülatif Satış =
CALCULATE([Net Satış], FILTER(ALL(Tarih[Tarih]), Tarih[Tarih] &lt;= MAX(Tarih[Tarih])))</pre>
<p><code>ALL(Tarih[Tarih])</code> tarih filtresini kaldırır, <code>FILTER</code> verinin başından görünen dönemin sonuna kadar olan günleri geri koyar. Tarih tablosu olarak işaretlenmiş tablonun tarih sütununa filtre koymak, aynı tablonun diğer sütunlarındaki (Yıl, Ay) filtreleri de kaldırır.</p>
<h2>Dönem başı ve sonu</h2>
<ul>
<li><code>STARTOFMONTH</code>, <code>ENDOFMONTH</code>, <code>STARTOFYEAR</code>, <code>ENDOFYEAR</code>, <code>FIRSTDATE</code>, <code>LASTDATE</code>: tek satırlık tarih tabloları döndürür.</li>
<li>Stok gibi <b>yarı toplanabilir</b> ölçülerde (aylar toplanmaz, dönem sonu değeri alınır): <code>CALCULATE([Stok], LASTDATE(Tarih[Tarih]))</code> ya da <code>CLOSINGBALANCEMONTH</code>.</li>
</ul>
<h2>Paralel dönem</h2>
<pre class="dax">Geçen Yıl Tamamı = CALCULATE([Net Satış], PARALLELPERIOD(Tarih[Tarih], -1, YEAR))</pre>
<p><code>PARALLELPERIOD</code>, görünen dönemi kapsayan <b>tam</b> dönemi kaydırır: Mart 2024 satırında 2023'ün tamamını verir. <code>SAMEPERIODLASTYEAR</code> ise yalnızca Mart 2023'ü.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Son 3 Ay Satış</b>: görünen dönemin son gününden geriye 3 aylık net satış toplamı.', name: 'Son 3 Ay Satış', sol: 'CALCULATE([Net Satış], DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -3, MONTH))', hint: 'DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -3, MONTH)', grid: [{ t: 'Tarih', c: 'YilAy' }] },
    { t: 'dax', q: '<b>Kümülatif Satış</b>: verinin başından görünen dönemin sonuna kadar net satış.', name: 'Kümülatif Satış', sol: 'CALCULATE([Net Satış], FILTER(ALL(Tarih[Tarih]), Tarih[Tarih] <= MAX(Tarih[Tarih])))', hint: 'FILTER(ALL(Tarih[Tarih]), Tarih[Tarih] <= MAX(Tarih[Tarih]))', grid: [{ t: 'Tarih', c: 'YilAy' }, { t: 'Tarih', c: 'Yil' }] },
    { t: 'dax', q: '<b>Geçen Yıl Tamamı</b>: görünen dönemin bir önceki yılının tamamındaki net satış (PARALLELPERIOD).', name: 'Geçen Yıl Tamamı', sol: 'CALCULATE([Net Satış], PARALLELPERIOD(Tarih[Tarih], -1, YEAR))', grid: [{ t: 'Tarih', c: 'YilAy' }, { t: 'Tarih', c: 'Yil' }] },
    { t: 'dax', q: '<b>Çeyrek Başından Bugüne</b>: <code>[Net Satış]</code> için QTD.', name: 'Satış QTD', sol: 'TOTALQTD([Net Satış], Tarih[Tarih])', grid: [{ t: 'Tarih', c: 'YilAy' }] }
  ]
},

{
  id: 'dax-sorgu', lv: 'ileri', mod: 'İleri DAX', min: 18,
  title: 'DAX sorguları ve tablo fonksiyonları',
  sum: 'EVALUATE, SUMMARIZECOLUMNS, ADDCOLUMNS, SELECTCOLUMNS, TOPN, DEFINE MEASURE ve ORDER BY.',
  body: `
<h2>DAX sorgu görünümü</h2>
<p>Power BI Desktop'taki <b>DAX sorgu görünümü</b> (ve DAX Studio gibi araçlar), bir tablo döndüren sorgular çalıştırır. Ölçüleri görsel kurmadan test etmenin, veriyi incelemenin ve hata ayıklamanın en hızlı yoludur. Bu uygulamadaki DAX Stüdyosu'nun “Sorgu” modu da aynıdır.</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Kategoriler[Kategori],
    Tarih[Yil],
    "Net Satış", [Net Satış],
    "Hedef", [Hedef]
)
ORDER BY Kategoriler[Kategori], Tarih[Yil]</pre>
<h2>Tablo fonksiyonları</h2>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Ne döndürür?</th></tr>
<tr><td><code>SUMMARIZECOLUMNS(sütunlar…, "Ad", ifade…)</code></td><td>Grup başına satır + hesaplanmış sütunlar. Görsellerin arka planda ürettiği sorgu budur. Tüm ölçüleri boş olan satırları atar.</td></tr>
<tr><td><code>SUMMARIZE(tablo, sütunlar…)</code></td><td>Tablodaki var olan grup kombinasyonları. Hesap eklemek için ADDCOLUMNS ile birlikte kullanılması önerilir.</td></tr>
<tr><td><code>ADDCOLUMNS(tablo, "Ad", ifade…)</code></td><td>Tabloya hesaplanmış sütun ekler (her satırda bağlam geçişiyle).</td></tr>
<tr><td><code>SELECTCOLUMNS(tablo, "Ad", ifade…)</code></td><td>Yalnızca seçilen ya da yeniden adlandırılan sütunlar.</td></tr>
<tr><td><code>TOPN(n, tablo, ifade)</code></td><td>İlk n satır.</td></tr>
<tr><td><code>FILTER</code>, <code>VALUES</code>, <code>ALL</code>, <code>CALCULATETABLE</code></td><td>Süzülmüş ya da filtresiz tablolar.</td></tr>
<tr><td><code>{ }</code>, <code>ROW</code>, <code>GENERATESERIES</code></td><td>Elle tablo oluşturma.</td></tr>
</table></div>
<h2>Sorgu içinde ölçü tanımlamak</h2>
<pre class="dax">DEFINE
    MEASURE Satislar[Marj] = DIVIDE([Brüt Kâr], [Net Satış])
EVALUATE
TOPN(5, SUMMARIZECOLUMNS(Urunler[Urun], "Satış", [Net Satış], "Marj", [Marj]), [Satış])
ORDER BY [Satış] DESC</pre>
<p><code>DEFINE MEASURE</code> modeli değiştirmeden geçici bir ölçü tanımlar. Desktop'ta bu ölçüyü tek tıkla modele ekleyebilirsin.</p>
<h2>Tek değer görmek</h2>
<pre class="dax">EVALUATE { [Net Satış] }</pre>
<p>Birden çok değeri tek satırda görmek için <code>ROW</code> kullanılır:</p>
<pre class="dax">EVALUATE ROW("Satış", [Net Satış], "Marj", [Kâr Marjı %])</pre>
`,
  ex: [
    { t: 'query', q: 'Her <b>kanal</b> için <code>[Net Satış]</code> değerini içeren bir tablo döndür (SUMMARIZECOLUMNS).', start: 'EVALUATE\n', sol: 'EVALUATE\nSUMMARIZECOLUMNS(Satislar[Kanal], "Net Satış", [Net Satış])', hint: 'SUMMARIZECOLUMNS(Satislar[Kanal], "Net Satış", [Net Satış])' },
    { t: 'query', q: 'Net satışa göre <b>ilk 3 ürünü</b> ürün adı ve net satışla birlikte döndür.', start: 'EVALUATE\n', sol: 'EVALUATE\nTOPN(3, SUMMARIZECOLUMNS(Urunler[Urun], "Net Satış", [Net Satış]), [Net Satış])', hint: 'TOPN(3, SUMMARIZECOLUMNS(...), [Net Satış])' },
    { t: 'query', q: 'Her <b>segment</b> için müşteri sayısını (<code>COUNTROWS</code>) içeren bir tablo döndür. Sütun adı "Müşteri" olsun. İpucu: Musteriler tablosundaki segmentleri ADDCOLUMNS ile genişlet.', start: 'EVALUATE\nADDCOLUMNS(\n    VALUES(Musteriler[Segment]),\n    \n)', sol: 'EVALUATE\nADDCOLUMNS(VALUES(Musteriler[Segment]), "Müşteri", CALCULATE(COUNTROWS(Musteriler)))', hint: '"Müşteri", CALCULATE(COUNTROWS(Musteriler)): bağlam geçişi için CALCULATE gerekir.' }
  ]
},

{
  id: 'hesaplama-gruplari', lv: 'ileri', mod: 'İleri Modelleme', min: 14,
  title: 'Hesaplama grupları, alan parametreleri, görsel hesaplamalar',
  sum: 'Ölçü patlamasını önlemek ve kullanıcıya ölçü/boyut seçtirmek.',
  body: `
<h2>Ölçü patlaması</h2>
<p>5 temel ölçün (Satış, Kâr, Adet, Sipariş, Müşteri) ve 6 zaman varyasyonun (Cari, GY, YTD, GY YTD, YoY, YoY %) varsa 30 ölçü yazman gerekir. <b>Hesaplama grupları</b> bu varyasyonları bir kez tanımlar ve her ölçüye uygular.</p>
<pre class="dax" data-notry>-- Hesaplama grubu: Zaman Zekâsı, öğeler:
Cari    = SELECTEDMEASURE()
GY      = CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Tarih[Tarih]))
YTD     = CALCULATE(SELECTEDMEASURE(), DATESYTD(Tarih[Tarih]))
YoY %   = VAR c = SELECTEDMEASURE()
          VAR g = CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Tarih[Tarih]))
          RETURN DIVIDE(c - g, g)</pre>
<p><code>SELECTEDMEASURE()</code>, görselde o an kullanılan ölçünün yerine geçer. Hesaplama grubu modelde bir tablo gibi görünür; öğelerini matrisin sütununa koyduğunda her ölçü için altı varyasyon kendiliğinden gelir. Öğeler <b>biçim dizesi ifadesi</b> de taşıyabilir: YoY % öğesi sonucu yüzde olarak gösterir.</p>
<p>Desktop'ta Model görünümünde <b>Hesaplama grubu</b> düğmesiyle (ya da Tabular Editor ile) oluşturulur. Hesaplama grubu eklenince örtük ölçüler kapanır; tüm değerler açık ölçü olmalıdır.</p>
<h2>Alan parametreleri</h2>
<p>Modelleme → Yeni parametre → <b>Alanlar</b>. Kullanıcıya bir dilimleyiciden “Grafiğin ekseni: Kategori / Kanal / Segment” ya da “Değer: Satış / Kâr / Adet” seçtirirsin. Arka planda özel bir tablo ve <code>NAMEOF</code> fonksiyonu kullanılır.</p>
<h2>Görsel hesaplamalar</h2>
<p>Görselin kendisinde, yalnızca görseldeki verilerle çalışan DAX hesapları. Model ölçüsü yazmadan kümülatif toplam, hareketli ortalama, önceki satıra göre fark:</p>
<pre class="dax" data-notry>Kümülatif = RUNNINGSUM([Net Satış])
Öncekine Göre = [Net Satış] - PREVIOUS([Net Satış])</pre>
<p>Görsel hesaplamalar matris ızgarası üzerinde düşünür (satırlar, sütunlar, üst düzey). Model ölçülerinden daha basit yazılır ama yalnızca o görselde yaşar.</p>
<h2>Dinamik biçim dizeleri</h2>
<p>Ölçü araçları → Biçim → <b>Dinamik</b>. Ölçünün yanında, sonucun nasıl yazılacağını döndüren ikinci bir DAX ifadesi tanımlanır; sonuç <b>sayı olarak kalır</b> (sıralanır, grafikte kullanılır) ama biçimi bağlama göre değişir:</p>
<pre class="dax" data-notry>-- [Satış (Seçili Para)] ölçüsünün biçim dizesi ifadesi:
VAR Sembol = SELECTEDVALUE(ParaBirimleri[Sembol], "₺")
RETURN "#,0 " & Sembol

-- Büyüklüğe göre biçim:
SWITCH(TRUE(),
    SELECTEDMEASURE() >= 1000000, "#,0.0,, \"Mn\"",
    SELECTEDMEASURE() >= 1000, "#,0.0, \"B\"",
    "#,0")</pre>
<p>FORMAT ile metne çevirmenin (Ölçü Laboratuvarı: Akıllı Etiket) aksine, dinamik biçim dizesi sayının kendisini korur.</p>
<h2>Alan parametresi, adım adım</h2>
<ol>
<li>Modelleme → Yeni parametre → <b>Alanlar</b>.</li>
<li>Listeye ölçüleri (Net Satış, Brüt Kâr, Sipariş Sayısı) ya da sütunları (Kategori, Kanal, Segment) ekle; sırala, yeniden adlandır.</li>
<li>“Sayfaya dilimleyici ekle” işaretli bırak. Power BI bir parametre tablosu oluşturur; her satırda <code>NAMEOF('Ölçüler'[Net Satış])</code> gibi bir başvuru vardır.</li>
<li>Parametre sütununu görselin eksenine ya da değerine koy. Kullanıcı dilimleyiciden seçtikçe görsel alan değiştirir.</li>
</ol>
<p>Ölçülerle alan parametresi “ölçü seçici”, sütunlarla “eksen seçici” olur. İkisi aynı görselde birlikte kullanılabilir. Bu uygulamadaki <code>OlcuSecimi</code> tablosu ve <code>[Seçili Ölçü]</code> ölçüsü, alan parametresi gelmeden önceki SWITCH tabanlı yöntemin benzetimidir.</p>
<div class="note"><b>Bu oyun alanında</b>Hesaplama grupları ve görsel hesaplamalar model ya da görsel düzeyinde tanımlandığı için DAX Stüdyosu'nda çalıştırılamaz. Kavramları ve kalıpları bilmen sınav ve iş için yeterlidir.</div>
`,
  ex: [
    { t: 'mc', q: 'Hesaplama grubu öğesinde, görseldeki ölçüyü temsil eden fonksiyon hangisidir?', o: ['SELECTEDVALUE()', 'SELECTEDMEASURE()', 'ISINSCOPE()', 'VALUES()'], a: 1, why: 'SELECTEDMEASURE(), öğenin uygulandığı ölçünün yerine geçer.' },
    { t: 'mc', q: 'Kullanıcının bir dilimleyiciyle grafiğin eksenini Kategori, Kanal ya da Segment arasında değiştirebilmesi için ne kullanılır?', o: ['Hesaplama grubu', 'Alan parametresi', 'Yer imi', 'RLS'], a: 1, why: 'Alan parametreleri eksen ya da değer alanını dinamik yapar.' },
    { t: 'mc', q: '30 zaman ölçüsü yazmak yerine 6 varyasyonu tek yerde tanımlamak hangi soruna çözümdür?', o: ['Ölçü patlaması', 'Döngüsel bağımlılık', 'Sorgu katlama', 'Bağlam geçişi'], a: 0, why: 'Hesaplama grupları, her ölçü için aynı varyasyonları tekrar yazma ihtiyacını ortadan kaldırır.' }
  ]
},

{
  id: 'performans', lv: 'ileri', mod: 'İleri Modelleme', min: 16,
  title: 'Performans ve VertiPaq',
  sum: 'Model neden yavaş? Kardinalite, sıkıştırma, Performans Analizi, DAX Studio ve iyi alışkanlıklar.',
  body: `
<h2>VertiPaq nasıl sıkıştırır?</h2>
<ul>
<li><b>Sütun tabanlı:</b> Her sütun ayrı saklanır. Rapor yalnızca kullandığı sütunları okur.</li>
<li><b>Sözlük kodlaması:</b> Metin değerleri bir sözlüğe yazılır, sütunda yalnızca tam sayı kodları tutulur. “İstanbul” milyon kez geçse de bir kez saklanır.</li>
<li><b>Tekrar uzunluğu kodlaması (RLE):</b> Aynı değerin art arda tekrarları “değer × adet” olarak saklanır.</li>
</ul>
<p>Sonuç: Bir sütunun boyutunu en çok <b>kardinalitesi</b> (farklı değer sayısı) belirler. Satır sayısı ikinci sırada gelir.</p>
<h2>Modeli küçültmek</h2>
<ul>
<li>Kullanılmayan sütunları Power Query'de kaldır. Özellikle benzersiz kimlikler, açıklama metinleri, GUID'ler pahalıdır.</li>
<li>Tarih-saat sütununu <b>tarih</b> ve <b>saat</b> olarak ikiye böl; saniyeyi gerekmedikçe tutma.</li>
<li>Ondalık hassasiyeti azalt (Sabit ondalık sayı), metin yerine tam sayı anahtar kullan.</li>
<li>Otomatik tarih/saati kapat.</li>
<li>Hesaplanmış sütunları mümkünse Power Query'ye ya da kaynağa taşı.</li>
</ul>
<h2>Ölçü ölçmek</h2>
<ul>
<li><b>Performans Analizi</b> (İyileştir (Optimize) sekmesi; Görünüm sekmesinden de açılır): Her görselin DAX sorgu süresi, görsel çizim süresi ve “diğer” süresi. Yavaş görselin sorgusunu kopyalayabilirsin.</li>
<li><b>DAX Studio:</b> Ücretsiz araç. Sorgu planı, depolama motoru (SE) ve formül motoru (FE) sürelerini gösterir. VertiPaq Analyzer ile tablo ve sütun boyutlarını görürsün.</li>
<li><b>Best Practice Analyzer</b> (Tabular Editor): Modeli kurallara göre denetler.</li>
</ul>
<h2>DAX alışkanlıkları</h2>
<div class="tbl-wrap"><table>
<tr><th>Yerine</th><th>Bunu yaz</th><th>Neden?</th></tr>
<tr><td><code>FILTER(Satislar, Satislar[Kanal] = "Web")</code></td><td><code>Satislar[Kanal] = "Web"</code></td><td>Tüm tabloyu satır satır taramak yerine tek sütunda filtre</td></tr>
<tr><td><code>a / b</code></td><td><code>DIVIDE(a, b)</code></td><td>Sıfıra bölme güvenli; daha okunur</td></tr>
<tr><td>Aynı ifadeyi iki kez yazmak</td><td><code>VAR</code></td><td>Bir kez hesaplanır</td></tr>
<tr><td><code>SUMX(Satislar, [Ölçü])</code></td><td><code>SUMX(VALUES(Urunler[Urun]), [Ölçü])</code></td><td>Daha az bağlam geçişi</td></tr>
<tr><td><code>IFERROR</code> ile hatayı gizlemek</td><td>Hatanın kaynağını düzeltmek</td><td>IFERROR motoru yavaşlatır, hatayı saklar</td></tr>
<tr><td>Çift yönlü ilişki</td><td>Gerektiğinde <code>CROSSFILTER</code> ile ölçüde</td><td>Belirsizlik ve gereksiz filtre yayılımı</td></tr>
</table></div>
<h2>Büyük veri için</h2>
<ul>
<li><b>Artımlı yenileme:</b> Yalnızca son günleri yeniler, geçmiş bölümleri dokunmadan bırakır.</li>
<li><b>Toplamalar (aggregations):</b> Özet tablo Import, ayrıntı DirectQuery. Motor uygun olanı seçer.</li>
<li><b>Direct Lake:</b> Fabric'te kopyalama olmadan Import'a yakın hız.</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Bir sütunun model boyutunu en çok ne belirler?', o: ['Sütun adının uzunluğu', 'Kardinalitesi (farklı değer sayısı)', 'Veri türünün adı', 'Görsellerde kaç kez kullanıldığı'], a: 1, why: 'Sözlük kodlaması nedeniyle farklı değer sayısı, sıkıştırmayı en çok etkileyen etkendir.' },
    { t: 'mc', q: 'Bir sayfadaki görsellerden hangisinin yavaş olduğunu bulmak için ilk adım?', o: ['DAX Studio\'yu kurmak', 'İyileştir → Performans Analizi ile kaydı başlatıp görselleri yenilemek', 'Modeli DirectQuery\'ye çevirmek', 'Tüm ölçüleri silmek'], a: 1, why: 'Performans Analizi her görselin DAX, çizim ve diğer sürelerini ayrı ayrı gösterir.' },
    { t: 'mc', q: 'Hangisi genellikle daha hızlıdır?', o: ['CALCULATE([Satış], FILTER(Satislar, Satislar[Kanal] = "Web"))', 'CALCULATE([Satış], Satislar[Kanal] = "Web")', 'İkisi aynı plan', 'IFERROR ile sarmak'], a: 1, why: 'Boolean filtre yalnızca Kanal sütununu tarar. FILTER(Satislar, …) tüm tabloyu satır satır dolaşır ve genişletilmiş tablo filtresi uygular.' },
    { t: 'mc', q: '“2024-03-15 14:32:07” biçiminde 5 milyon satırlık bir sütun var. Saat bilgisi raporlarda kullanılmıyor. Ne yaparsın?', o: ['Olduğu gibi bırak', 'Sütunu yalnızca Tarih türüne çevir', 'Metne çevir', 'Hesaplanmış sütunla kopyala'], a: 1, why: 'Saniye düzeyinde tarih-saat neredeyse her satırda farklıdır (yüksek kardinalite). Tarihe indirgemek, farklı değer sayısını binlere düşürür.' }
  ]
},

{
  id: 'guvenlik', lv: 'ileri', mod: 'Yönetim ve Güvenlik', min: 14,
  title: 'Satır ve nesne düzeyinde güvenlik',
  sum: 'Statik ve dinamik RLS, USERPRINCIPALNAME, OLS ve çalışma alanı rolleri.',
  body: `
<h2>RLS: herkes kendi verisini görsün</h2>
<p><b>Satır düzeyinde güvenlik</b> (Row-Level Security), aynı raporu açan kişilerin farklı satırları görmesini sağlar. Modelleme → <b>Rolleri yönet</b>.</p>
<h3>Statik RLS</h3>
<pre class="dax">-- "İstanbul Ekibi" rolü, Musteriler tablosu filtresi:
Musteriler[Sehir] = "İstanbul"</pre>
<p>Rolün üyeleri yalnızca İstanbul'daki müşterileri ve (ilişki üzerinden) onların satışlarını görür. Her şehir için ayrı rol gerekir.</p>
<h3>Dinamik RLS</h3>
<p>Bir <code>Yetkiler</code> tablosu kur: <code>Eposta | Sehir</code>. Tek bir rol yeter:</p>
<pre class="dax">-- Yetkiler tablosu filtresi:
Yetkiler[Eposta] = USERPRINCIPALNAME()</pre>
<p><code>USERPRINCIPALNAME()</code>, oturum açan kişinin e-postasını döndürür. Yetkiler tablosu Musteriler[Sehir] ile ilişkilendirilir (çoğu zaman çoka-çok ya da köprü tablo + “Güvenlik filtresini iki yönde uygula”). Yeni bir çalışan geldiğinde rol değişmez, yalnızca tabloya bir satır eklenir.</p>
<h2>Test et</h2>
<p>Desktop: Modelleme → <b>Farklı görüntüle</b> → rol ya da kullanıcı seç. Service: anlam modelinin güvenlik ayarlarında <b>Rol olarak test et</b>.</p>
<h2>OLS: sütunu ya da tabloyu gizle</h2>
<p><b>Nesne düzeyinde güvenlik</b> (Object-Level Security), belirli rollerden bir tabloyu ya da sütunu (ör. <code>Calisanlar[Maas]</code>) tamamen gizler. Tabular Editor gibi araçlarla tanımlanır.</p>
<h2>Önemli ayrıntılar</h2>
<ul>
<li>RLS, çalışma alanında <b>Görüntüleyici</b> rolündeki kullanıcılara uygulanır. Yönetici, Üye ve Katkıda bulunan rolleri modeli düzenleyebildiği için RLS'den etkilenmez.</li>
<li>RLS filtresi, ilişkiler üzerinden diğer tablolara yayılır; boyut tablosunda tanımlamak genellikle yeterlidir.</li>
<li>RLS rapor sayfasını gizlemek için değil, <b>veriyi</b> korumak içindir. Sayfa gizleme bir güvenlik önlemi değildir.</li>
</ul>
`,
  ex: [
    { t: 'mc', q: '200 bölge müdürünün her biri yalnızca kendi bölgesini görmeli ve kadro sık değişiyor. En sürdürülebilir çözüm?', o: ['200 ayrı statik rol', 'Yetkiler tablosu + USERPRINCIPALNAME() ile tek dinamik rol', 'Her müdüre ayrı rapor', 'Sayfa gizleme'], a: 1, why: 'Dinamik RLS\'de değişiklik yalnızca yetki tablosuna satır eklemektir; rol tanımı aynı kalır.' },
    { t: 'mc', q: 'Çalışma alanında “Üye” rolündeki bir kullanıcı için RLS uygulanır mı?', o: ['Evet, her zaman', 'Hayır; RLS yalnızca Görüntüleyici rolündekilere uygulanır', 'Yalnızca mobilde', 'Yalnızca DirectQuery\'de'], a: 1, why: 'Düzenleme yetkisi olan roller (Yönetici, Üye, Katkıda bulunan) RLS\'yi atlar.' },
    { t: 'mc', q: 'Maaş sütununun belirli kullanıcılar için hiç görünmemesi gerekiyor (alan listesinde bile). Hangi özellik?', o: ['RLS', 'OLS', 'Gizli sayfa', 'Yer imi'], a: 1, why: 'Nesne düzeyinde güvenlik tablo ya da sütunu rol için tamamen gizler.' }
  ]
},

{
  id: 'yayinlama', lv: 'ileri', mod: 'Yönetim ve Güvenlik', min: 15,
  title: 'Yayımlama, yenileme ve yaşam döngüsü',
  sum: 'Çalışma alanları, uygulamalar, ağ geçidi, artımlı yenileme, dağıtım işlem hatları ve Git.',
  body: `
<h2>Service'teki yapı taşları</h2>
<ul>
<li><b>Çalışma alanı:</b> Ekip klasörü. Roller: Yönetici, Üye, Katkıda bulunan, Görüntüleyici.</li>
<li><b>Anlam modeli</b> (semantic model, eski adıyla dataset): Tablolar, ilişkiler, ölçüler. Bir model birçok rapora hizmet edebilir.</li>
<li><b>Rapor:</b> Bir modele bağlı, sayfalardan oluşan etkileşimli belge.</li>
<li><b>Pano (dashboard):</b> Service'te farklı raporlardan sabitlenmiş kutucuklardan oluşan tek sayfa. Bu uygulamadaki “Dashboardlar” ise rapor sayfası düzeninde örneklerdir.</li>
<li><b>Uygulama (app):</b> Çalışma alanındaki içeriğin son kullanıcılara düzenli, menülü bir paket olarak dağıtılması. Kitle (audience) bazında farklı içerik gösterebilir.</li>
</ul>
<h2>Yenileme</h2>
<ul>
<li><b>Zamanlanmış yenileme:</b> Import modellerde günde belirli sayıda (Pro'da 8, PPU/kapasitede 48'e kadar).</li>
<li><b>Ağ geçidi:</b> Şirket içi kaynaklar için.</li>
<li><b>Artımlı yenileme:</b> <code>RangeStart</code> / <code>RangeEnd</code> parametreleriyle tablo bölümlere ayrılır; yalnızca son bölümler yenilenir. Kaynakta sorgu katlama gerektirir.</li>
</ul>
<h2>Paylaşma yolları</h2>
<div class="tbl-wrap"><table>
<tr><th>Yol</th><th>Ne zaman?</th></tr>
<tr><td>Uygulama</td><td>Geniş kitleye, düzenli ve sürümlü dağıtım</td></tr>
<tr><td>Doğrudan paylaşım</td><td>Birkaç kişiye hızlı paylaşım</td></tr>
<tr><td>Çalışma alanı erişimi</td><td>Birlikte geliştiren ekip</td></tr>
<tr><td>Teams / SharePoint'e ekleme</td><td>İşin yapıldığı yerde rapor</td></tr>
<tr><td>Abonelik</td><td>Düzenli e-posta anlık görüntüsü</td></tr>
<tr><td>Web'de yayımla</td><td>Yalnızca herkese açık veri. Herkes görebilir; kurumsal veri için asla.</td></tr>
</table></div>
<h2>Yaşam döngüsü</h2>
<ul>
<li><b>Dağıtım işlem hatları:</b> Geliştirme → Test → Üretim aşamaları; aşamalar arası içerik kopyalama ve kurallarla veri kaynağı değiştirme.</li>
<li><b>PBIP ve Git:</b> Power BI Projesi biçimiyle rapor ve model metin dosyaları olarak kaydedilir (model TMDL olarak). Değişiklikler Git'te izlenir, kod incelemesi yapılır. Fabric çalışma alanları Git'e bağlanabilir.</li>
<li><b>Onay:</b> Güvenilir modeller <b>tanıtılmış</b> (promoted) ya da <b>sertifikalı</b> (certified) olarak işaretlenir.</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Satış raporlarını 300 kişilik satış ekibine menülü ve sürümlü bir şekilde dağıtmanın en iyi yolu?', o: ['Herkese çalışma alanı Üye rolü vermek', 'Uygulama (app) yayımlamak', 'Web\'de yayımla', 'Rapor dosyasını e-postayla göndermek'], a: 1, why: 'Uygulamalar son kullanıcı dağıtımı içindir; düzenleme yetkisi vermez, kitleye göre içerik sunabilir.' },
    { t: 'mc', q: '5 yıllık satış tablosunda her gece yalnızca son 3 günün değişebildiğini biliyorsun. Yenilemeyi hızlandırmak için?', o: ['Artımlı yenileme', 'DirectQuery\'ye geçmek', 'Daha sık tam yenileme', 'Ağ geçidini kaldırmak'], a: 0, why: 'Artımlı yenileme geçmiş bölümleri dokunmadan bırakır, yalnızca son bölümü yeniler.' },
    { t: 'mc', q: 'Hangisi kurumsal veriler için asla kullanılmamalıdır?', o: ['Uygulama', 'Web\'de yayımla', 'Teams\'e ekleme', 'Abonelik'], a: 1, why: 'Web\'de yayımla, bağlantıyı bilen herkesin kimlik doğrulaması olmadan raporu görmesini sağlar.' }
  ]
},

{
  id: 'm-dili', lv: 'ileri', mod: 'Veri Hazırlama', min: 14,
  title: 'M dili: Power Query\'nin arkasındaki kod',
  sum: 'let/in yapısı, adımlar, sık kullanılan fonksiyonlar, özel fonksiyonlar ve hata yönetimi.',
  body: `
<h2>Yapı</h2>
<pre class="m">let
    Kaynak = Sql.Database("sunucu", "AnadoluMarket"),
    Siparisler = Kaynak{[Schema="dbo", Item="orders"]}[Data],
    Teslim = Table.SelectRows(Siparisler, each [status] = "delivered"),
    Sutunlar = Table.SelectColumns(Teslim, {"order_id", "customer_id", "order_date"}),
    Adlar = Table.RenameColumns(Sutunlar, {{"order_id", "SiparisNo"}, {"customer_id", "MusteriNo"}})
in
    Adlar</pre>
<ul>
<li>M, büyük/küçük harfe <b>duyarlıdır</b>: <code>Table.SelectRows</code> doğru, <code>table.selectrows</code> hata.</li>
<li><code>each [status] = "delivered"</code>, “her satır için” anlamına gelen kısa fonksiyon yazımıdır: <code>(satir) =&gt; satir[status] = "delivered"</code>.</li>
<li><code>{ }</code> liste, <code>[ ]</code> kayıt (record), <code>Tablo{0}</code> ilk satır, <code>Kayit[Alan]</code> alan erişimi.</li>
</ul>
<h2>Sık kullanılan fonksiyonlar</h2>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Ne yapar?</th></tr>
<tr><td><code>Table.SelectRows</code></td><td>Satır süzme</td></tr>
<tr><td><code>Table.AddColumn</code></td><td>Özel sütun: <code>Table.AddColumn(t, "Tutar", each [Adet] * [Fiyat], type number)</code></td></tr>
<tr><td><code>Table.TransformColumnTypes</code></td><td>Veri türü atama</td></tr>
<tr><td><code>Table.Group</code></td><td>Gruplandırma</td></tr>
<tr><td><code>Table.NestedJoin</code> + <code>Table.ExpandTableColumn</code></td><td>Birleştirme (Merge)</td></tr>
<tr><td><code>Table.Combine</code></td><td>Ekleme (Append)</td></tr>
<tr><td><code>Table.UnpivotOtherColumns</code></td><td>Özetten çıkarma</td></tr>
<tr><td><code>Text.Trim</code>, <code>Text.Proper</code>, <code>Text.Lower</code></td><td>Metin temizliği</td></tr>
<tr><td><code>Date.Year</code>, <code>Date.StartOfMonth</code></td><td>Tarih işlemleri</td></tr>
</table></div>
<h2>Özel fonksiyon</h2>
<pre class="m">let
    TemizSehir = (s as nullable text) as nullable text =&gt;
        if s = null then null
        else Text.Proper(Text.Trim(s))
in
    TemizSehir</pre>
<p>Bu sorguyu kaydedip başka sorgularda <code>Table.TransformColumns(t, {{"city", TemizSehir}})</code> diye çağırabilirsin.</p>
<h2>Hata yönetimi</h2>
<pre class="m">Table.AddColumn(t, "TarihTemiz", each try Date.FromText([signup_date], [Culture="tr-TR"]) otherwise null)</pre>
<p><code>try … otherwise</code>, satır düzeyindeki hatayı yakalayıp yerine değer koyar. Hatalı satırları ayrı bir sorguda tutmak için <b>Hataları Tut</b> komutu kullanılır.</p>
`,
  ex: [
    { t: 'mc', q: 'M dilinde <code>each [Adet] * [Fiyat]</code> ifadesi neye denktir?', o: ['(_) => _[Adet] * _[Fiyat]', 'SUMX(Adet, Fiyat)', 'Bir liste', 'Bir hata'], a: 0, why: 'each, alt çizgi (_) parametreli kısa fonksiyon yazımıdır; [Adet] aslında _[Adet] demektir.' },
    { t: 'mc', q: 'Karışık biçimli bir tarih sütununda hatalı satırlarda boş değer üretmek için?', o: ['try ... otherwise null', 'IFERROR', 'Table.Distinct', 'Text.Trim'], a: 0, why: 'try ifadesi hatayı yakalar, otherwise yerine konacak değeri verir. IFERROR DAX fonksiyonudur.' },
    { t: 'mc', q: '<code>table.selectrows(...)</code> yazdın ve “tanınmıyor” hatası aldın. Neden?', o: ['M büyük/küçük harfe duyarlıdır; Table.SelectRows olmalı', 'Fonksiyon kaldırıldı', 'Parantez eksik', 'Sorgu katlama kapalı'], a: 0, why: 'M\'de fonksiyon ve alan adları harf duyarlıdır.' }
  ]
},

{
  id: 'dashboard-tasarim', lv: 'ileri', mod: 'Görselleştirme', min: 14,
  title: 'Dashboard tasarımı: bir vaka çalışması',
  sum: 'Kitle, soru, düzen, KPI hiyerarşisi ve mobil düzen. Örnek dashboardları çözümle.',
  body: `
<h2>Önce kitle ve soru</h2>
<div class="tbl-wrap"><table>
<tr><th>Kitle</th><th>Soru</th><th>Sayfa tipi</th></tr>
<tr><td>Genel müdür</td><td>“İşler yolunda mı?”</td><td>Özet: 4–5 KPI + 2 eğilim</td></tr>
<tr><td>Kategori yöneticisi</td><td>“Hangi ürün neden geride?”</td><td>Analitik: matris, dağılım, detaya inme</td></tr>
<tr><td>Satış ekibi</td><td>“Bugün kimi aramalıyım?”</td><td>Operasyonel: liste, uyarı, filtre</td></tr>
</table></div>
<h2>Düzen</h2>
<ul>
<li><b>Z deseni:</b> Göz sol üstten başlar. En önemli KPI'lar üst şeritte, soldan sağa.</li>
<li><b>Özetten ayrıntıya:</b> Üstte kartlar, ortada eğilim ve karşılaştırma, altta ayrıntı tablosu.</li>
<li><b>Izgara:</b> Görselleri hizalı tut; Görünüm → Kılavuz çizgileri ve Izgaraya yapış.</li>
<li><b>Filtreler tek yerde:</b> Dilimleyiciler üstte ya da solda bir şeritte.</li>
<li><b>Boşluk:</b> Görseller arasında nefes alanı bırak; her yeri doldurma.</li>
</ul>
<h2>KPI'ı bağlamla ver</h2>
<p>“Net Satış: 747 B ₺” tek başına iyi mi kötü mü bilinmez. Yanına <b>hedefe göre</b>, <b>geçen yıla göre</b> karşılaştırma ve küçük bir eğilim koy. Bu uygulamadaki Yönetici Özeti dashboardı tam olarak bunu yapıyor.</p>
<h2>Mobil düzen</h2>
<p>Görünüm → <b>Mobil düzen</b>. Aynı rapor için telefon tuvaline görselleri sürükleyip dikey bir akış oluşturursun. Kartlar üstte, en önemli tek grafik altta, ayrıntı tabloları genellikle dışarıda.</p>
<h2>Kontrol listesi</h2>
<ol>
<li>Sayfa 5 saniyede ana mesajı veriyor mu?</li>
<li>Her görselin başlığı bir soruya cevap veriyor mu?</li>
<li>Renkler tutarlı mı, kırmızı yalnızca kötüyü mü gösteriyor?</li>
<li>Sayılar doğru birimde ve biçimde mi (B ₺, %)?</li>
<li>Filtrelerin hangi görselleri etkilediği açık mı?</li>
<li>Rapor 3 saniyenin altında açılıyor mu (Performans Analizi)?</li>
</ol>
<p>Şimdi <b>Dashboardlar</b> sayfasına git ve dört örneği bu listeye göre incele. Her görselin “DAX” düğmesi, arkasındaki ölçüleri gösterir.</p>
`,
  ex: [
    { t: 'mc', q: 'Genel müdür için hazırlanan özet sayfasında en üst şeride ne konmalı?', o: ['Ürün bazında 40 satırlık tablo', '4–5 KPI kartı (hedef ve geçen yıl karşılaştırmasıyla)', 'Dağılım grafiği', 'Filtreler bölmesi'], a: 1, why: 'Özet sayfası “işler yolunda mı” sorusuna saniyeler içinde cevap vermeli.' },
    { t: 'mc', q: '“Net Satış 747 B ₺” kartını daha anlamlı yapmanın en iyi yolu?', o: ['Yazı tipini büyütmek', 'Hedefe ve geçen yıla göre farkı eklemek', 'Kartı kırmızıya boyamak', 'Animasyon eklemek'], a: 1, why: 'Bir sayı ancak bir karşılaştırmayla yorumlanabilir.' }
  ]
},

{
  id: 'pl300', lv: 'ileri', mod: 'Sınav Hazırlığı', min: 16,
  title: 'PL-300 sınavına hazırlık',
  sum: 'Microsoft Power BI Data Analyst sertifikası: alanlar, çalışma planı ve örnek sorular.',
  body: `
<h2>Sınav hakkında</h2>
<p><b>PL-300: Microsoft Power BI Data Analyst</b>, Power BI için Microsoft'un temel analist sertifikasıdır. Başarıyla geçenler <i>Microsoft Certified: Power BI Data Analyst Associate</i> unvanını alır. Sertifika yıllık olarak Microsoft Learn üzerindeki ücretsiz çevrim içi değerlendirmeyle yenilenir.</p>
<h2>Ölçülen beceriler</h2>
<div class="tbl-wrap"><table>
<tr><th>Alan</th><th>Kapsam</th><th>Bu uygulamada</th></tr>
<tr><td><b>Veriyi hazırlama</b></td><td>Veri alma, bağlantı modları, profil çıkarma, temizleme, dönüştürme, birleştirme</td><td>Veri alma, Power Query dersleri, M dili</td></tr>
<tr><td><b>Veriyi modelleme</b></td><td>Yıldız şema, ilişkiler, tarih tablosu, DAX ölçüleri, zaman zekâsı, performans</td><td>Modelleme, tüm DAX dersleri, Performans</td></tr>
<tr><td><b>Görselleştirme ve analiz</b></td><td>Görsel seçimi, biçimlendirme, etkileşimler, yer imleri, yapay zekâ görselleri, mobil düzen</td><td>Görselleştirme dersleri, Görseller, Dashboardlar</td></tr>
<tr><td><b>Yönetme ve güvenlik</b></td><td>Çalışma alanları, uygulamalar, yenileme, ağ geçidi, RLS, duyarlılık etiketleri</td><td>Güvenlik, Yayımlama</td></tr>
</table></div>
<p>İlk üç alan ağırlığın büyük kısmını oluşturur; yönetme ve güvenlik daha küçük bir paydır. Güncel yüzdeler ve konu listesi için sınavın Microsoft Learn sayfasındaki “çalışma kılavuzu”na bak; Microsoft bu listeyi periyodik olarak günceller.</p>
<h2>4 haftalık plan</h2>
<ol>
<li><b>1. hafta:</b> Temel seviye dersleri + Power Query. Desktop'ta kendi verinle bir rapor kur.</li>
<li><b>2. hafta:</b> Modelleme + Orta seviye DAX. Bu uygulamadaki tüm DAX alıştırmalarını çöz.</li>
<li><b>3. hafta:</b> Görselleştirme, etkileşimler, Service, RLS. Microsoft Learn'deki ücretsiz öğrenme yollarını tamamla.</li>
<li><b>4. hafta:</b> Microsoft'un ücretsiz alıştırma değerlendirmesi, zayıf alanlara dönüş, Seviye Testi'ni tekrar çöz.</li>
</ol>
<div class="tip"><b>Sınav taktikleri</b>Sorular çoğu zaman senaryo tabanlıdır: “En az geliştirme çabasıyla”, “en iyi performansla” gibi ifadelere dikkat et; birden çok doğru görünen seçenekten hangisinin bu kısıtı karşıladığını seç. Vaka çalışmalarında önce soruları oku, sonra senaryoyu.</div>
`,
  ex: [
    { t: 'mc', q: 'Bir rapor “her kategori için satışın genel toplam içindeki payını” göstermeli; dilimleyicide seçim yapılsa bile payda tüm kategoriler olmalı. Paydada ne kullanılır?', o: ['ALLSELECTED(Kategoriler)', 'ALL(Kategoriler)', 'VALUES(Kategoriler[Kategori])', 'KEEPFILTERS'], a: 1, why: 'ALL tüm filtreleri (dilimleyici dahil) kaldırır. ALLSELECTED dilimleyici seçimini korurdu.' },
    { t: 'mc', q: 'En az geliştirme çabasıyla, bir görselde aylık satışı geçen yılla karşılaştırmak istiyorsun. Tarih tablosu işaretli. En hızlı yol?', o: ['Power Query\'de geçen yıl sütunu hesaplamak', 'Hızlı ölçü → Yıldan yıla değişim', 'Ayrı bir geçen yıl tablosu oluşturmak', 'R betiği'], a: 1, why: 'Hızlı ölçüler, zaman zekâsı DAX\'ını sihirbazla üretir.' },
    { t: 'mc', q: 'Kullanıcılar raporda Kategori → Ürün hiyerarşisinde aynı görsel içinde ilerlemek istiyor. Ne yapılandırılır?', o: ['Drill-through sayfası', 'Eksende iki alanlı hiyerarşi ve detaya inme', 'Yer imi', 'Araç ipucu sayfası'], a: 1, why: 'Aynı görselde düzeyler arası geçiş drill-down\'dur.' },
    { t: 'mc', q: 'Bir CSV\'deki “Tutar” sütunu metin olarak geliyor ve bazı satırlarda “-” var. Modelde sayısal toplam gerekiyor. Ne yaparsın?', o: ['DAX\'ta VALUE kullanmak', 'Power Query\'de “-”i null ile değiştirip türü Ondalık Sayı yapmak', 'Sütunu silmek', 'Görselde örtük ölçü kullanmak'], a: 1, why: 'Tür ve temizlik sorunları kaynağa en yakın yerde, Power Query\'de çözülür.' }
  ]
}

);
