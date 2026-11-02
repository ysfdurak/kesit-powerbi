
/* ===================================================================== 3. DAX OPTİMİZASYONU */
ext('dax-opt', { min: 24, html: `
<h2>Server Timings'i okumak: bir ekranı adım adım yorumla</h2>
<p>Bir matris 3 saniyede açılıyor. Performans Analizi'nden sorguyu kopyaladın, DAX Studio'da <b>Clear Cache</b> sonrası <b>Server Timings</b> açıkken çalıştırdın. Aşağıdaki değerler örnek bir ekrandır (bu modelden ölçülmüş değil); amaç okumayı öğrenmek:</p>
<div class="tbl-wrap"><table><tr><th>Alan</th><th>Örnek değer</th><th>Nasıl okunur?</th></tr>
<tr><td>Total</td><td>3.050 ms</td><td>Sorgunun toplam süresi</td></tr>
<tr><td>FE</td><td>2.700 ms (%89)</td><td>Formül motoru tek iş parçacığında çalışıyor; asıl yük burada</td></tr>
<tr><td>SE</td><td>350 ms (%11)</td><td>Depolama motorunda geçen süre</td></tr>
<tr><td>SE CPU</td><td>1.400 ms</td><td>SE CPU / SE ≈ 4: tarama paralel çalışmış, SE sağlıklı</td></tr>
<tr><td>SE Queries</td><td>612</td><td>Çok sayıda küçük SE sorgusu: yineleyici içinde bağlam geçişi</td></tr>
<tr><td>SE Cache</td><td>540</td><td>Sorguların çoğu önbellekten geldi; aynı veri tekrar tekrar isteniyor</td></tr></table></div>
<p>Bu tablo tek başına bir teşhis koyar: <b>işin çoğu FE'de, SE sorguları çok ve küçük</b>. Neden genellikle bir yineleyicinin her satırında ölçü çağrılmasıdır. Sonraki adım sorgu listesine bakmaktır: her xmSQL satırında döndürülen satır sayısı (Rows) ve boyut (KB) yazar. Tek bir sorgu 1,6 milyon satır döndürüyorsa sorun <b>materyalizasyondur</b>: SE büyük bir ara tabloyu FE'ye taşımıştır. xmSQL metninde <code>CallbackDataID</code> görüyorsan SE satır satır FE'ye geri çağırma yapıyordur.</p>
<p><b>Query Plan</b> sekmesinde mantıksal ve fiziksel plan vardır. Fiziksel planda büyük “Records” sayılı <i>Spool</i> satırları, FE'nin bellekte tuttuğu ara sonuçlardır. Hedef: az sayıda SE sorgusu, küçük ara sonuçlar, callback yok.</p>

<h2>Sütun filtresi, KEEPFILTERS ve FILTER(tablo): hız ve anlam birlikte</h2>
<p>Pazarlama bir “Web Satışı” ölçüsü istiyor ve onu Kanal satırlı bir matrise koyacak. Üç yazımın hızı ve <b>sonucu</b> farklıdır:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Satislar[Kanal],
    "Net Satış", [Net Satış],
    "Sütun filtresi", CALCULATE([Net Satış], Satislar[Kanal] = "Web"),
    "KEEPFILTERS", CALCULATE([Net Satış], KEEPFILTERS(Satislar[Kanal] = "Web"))
)</pre>
<p>Web satırında üçü de 457.330,90 ₺ verir. Mobil satırında ise sütun filtresi yine <b>457.330,90 ₺</b> gösterir: <code>Satislar[Kanal] = "Web"</code>, satırdan gelen “Kanal = Mobil” filtresinin <b>üzerine yazar</b>. KEEPFILTERS iki filtreyi kesiştirir; Mobil ve Mağaza satırları boş kalır. İkisi de SE'de çözülür, hız aynıdır; fark tamamen anlamdadır.</p>
<p>Üçüncü yol <code>FILTER(Satislar, Satislar[Kanal] = "Web")</code> yazmaktır. Bu, olgu tablosunu satır satır dolaşıp tüm sütunlarıyla bir tablo filtresi üretir. Büyük tabloda materyalizasyon demektir ve filtre genişletilmiş tablonun bütün sütunlarına uygulanır; sonucu tahmin etmek zorlaşır. Kural: <b>tek sütun koşulu → sütun filtresi; mevcut seçime saygı → KEEPFILTERS; FILTER yalnızca ölçüye dayalı koşulda ve küçük bir tablo üzerinde</b> (ör. <code>FILTER(VALUES(Urunler[UrunNo]), [Net Satış] &gt; 5000)</code>).</p>
<div class="warn"><b>Modeldeki örnek</b>Hazır <code>[Net Satış]</code> ölçüsü <code>Satislar[Durum] &lt;&gt; "İptal"</code> sütun filtresiyle yazılmıştır. Bu yüzden Durum satırlı bir tabloda <b>her satırda 1.250.772,45 ₺</b> görünür; İptal satırı dahil. Aynı ölçü KEEPFILTERS ile yazılsaydı İptal satırı boş, Teslim Edildi 1.049.627,00 ₺ olurdu. Ölçüyü hangi sütunlarla kesileceğini düşünerek yaz.</div>

<h2>IF, SWITCH ve kısa devre</h2>
<p>Motor, IF ve SWITCH'te çoğu zaman yalnızca gereken dalı hesaplar. Ama koşul satıra bağlıysa ve bir yineleyicinin içindeyse, SE her iki dalın verisini önceden toplayabilir. Bu bir hata değildir; bazen tek bir geniş SE sorgusu, satır başına küçük sorgulardan hızlıdır. <code>IF.EAGER</code> bu davranışı bilerek ister. Kendi tarafında yapabileceğin iki şey var:</p>
<ul>
<li><b>Ucuz kontrolü öne al:</b> <code>IF(ISBLANK([Net Satış]), BLANK(), &lt;pahalı ifade&gt;)</code>. Satışı olmayan hücrelerde pahalı kısım hesaplanmaz; ayrıca boş satırlar matristen düşer.</li>
<li><b>SWITCH(TRUE(), …) sırası:</b> En sık doğru olan koşulu ilk sıraya koy; koşullarda ölçü değil, değişken kullan.</li>
</ul>
<p>Tersi de bir anti-kalıptır: <code>IF([Net Satış] &gt; 0, [Net Satış], 0)</code> gibi “boş yerine 0” yazımları, satışı olmayan her ürün-gün bileşimini görünür kılar. Matris 40 ürün × 1.096 gün = 43.840 satıra çıkabilir ve yavaşlık DAX'tan değil, sıfırların kendisinden gelir.</p>

<h2>DISTINCTCOUNT'un bedeli</h2>
<p><code>[Müşteri Sayısı]</code> ve <code>[Sipariş Sayısı]</code> DISTINCTCOUNT kullanır. Farklı sayım <b>toplanamaz</b>: ayların müşteri sayılarını toplayıp yıl bulamazsın, çünkü aynı müşteri birden çok ayda alışveriş yapar. Bu yüzden motor her hücre için sütunun sözlüğünü yeniden tarar; kardinalite yükseldikçe maliyet artar. Toplama tabloları da çoğu zaman farklı sayımı karşılayamaz.</p>
<ul>
<li><code>COUNTROWS(VALUES(Satislar[MusteriNo]))</code> aynı sonucu (bu modelde 136) verir ve çoğu zaman aynı planı üretir; tek başına hızlandırmaz.</li>
<li>Asıl kazanç kardinaliteden gelir: birleştirilmiş metin anahtar (“Musteri-Urun”) üzerinde farklı sayım yerine iki tam sayı sütun ya da önceden hesaplanmış bir anahtar kullan.</li>
<li>DirectQuery'de yaklaşık sayım (<code>APPROXIMATEDISTINCTCOUNT</code>) kaynağa itilebilir; “yaklaşık” olduğu raporda belirtilmeli. Bu oyun alanının motorunda yoktur.</li>
</ul>

<h2>Değişken: bir kez hesapla, ama doğru yerde</h2>
<p>Değişken tanımlandığı yerdeki bağlamda <b>bir kez</b> hesaplanır ve sonra sabittir. Bu hem hız kazandırır hem de sık bir hataya yol açar:</p>
<pre class="dax">Yanlış 2023 Satışı =
VAR s = [Net Satış]
RETURN CALCULATE(s, Tarih[Yil] = 2023)
Doğru 2023 Satışı =
CALCULATE([Net Satış], Tarih[Yil] = 2023)</pre>
<p>Toplamda yanlış ölçü <b>1.250.772,45 ₺</b> (bütün yıllar), doğru ölçü <b>400.869,55 ₺</b> verir; 2024 satırında yanlış ölçü 747.065,70 ₺ gösterir. CALCULATE bir sabitin bağlamını değiştiremez. Kural: <b>değişkeni, değerini istediğin bağlamda tanımla</b>; CALCULATE ile değiştirilecek bir şeyse değişkene ölçünün kendisini değil, sonucu kullanılacak tabloyu ya da filtreyi koy.</p>

<h2>Karar ağacı</h2>
<ol>
<li>Önce ölç: Clear Cache + Server Timings. FE mi SE mi baskın?</li>
<li>SE baskın ve sorgu az ama büyükse: model sorunu (kardinalite, ilişki, sütun sayısı) → Performans ve VertiPaq dersi.</li>
<li>FE baskın ve SE sorgusu çoksa: yineleyiciyi boyut anahtarına taşı, bağlam geçişini azalt.</li>
<li>CallbackDataID varsa: IF/koşulu CALCULATE filtresine taşı.</li>
<li>Büyük materyalizasyon varsa: FILTER(olgu) yerine sütun filtresi ya da KEEPFILTERS.</li>
<li>Aynı ölçü bir formülde birden çok kez geçiyorsa: VAR.</li>
<li>Her değişiklikten sonra sonucu karşılaştır; hızlı ama yanlış ölçü, yavaş ve doğru ölçüden kötüdür.</li>
</ol>
`, ex: [
  { t: 'mc', q: `Server Timings: Total 2.900 ms, FE 2.600 ms, SE 300 ms, SE Queries 4. Sorgulardan biri 1,8 milyon satır döndürüyor; xmSQL'de CallbackDataID yok. En olası neden ve ilk deneme?`,
    o: [`SE sorgusu çok; yineleyiciyi boyut anahtarına taşımak`, `FILTER(olgu tablosu) materyalizasyonu; sütun filtresine geçmek`, `Callback; IF koşulunu CALCULATE filtresine taşımak`, `Kardinalite; tarih-saat sütununu ikiye bölmek`], a: 1,
    why: `Az sayıda ama devasa bir SE sonucu ve baskın FE süresi materyalizasyonun işaretidir: FE milyonlarca satırı bellekte işliyor. Tipik kaynak FILTER(Satislar, …) gibi tablo filtresidir. SE sorgu sayısı az olduğu için bağlam geçişi değil; callback yok; kardinalite SE süresini büyütürdü.` },
  { t: 'mc', q: `Bir ölçüde <code>SUMX(Satislar, IF(Satislar[Indirim] &gt; 0, Satislar[Tutar] * 0.9, Satislar[Tutar]))</code> var ve xmSQL'de CallbackDataID görünüyor. Sonucu değiştirmeden ne yaparsın?`,
    o: [`İfadeyi IFERROR ile sararım; hata yakalama hızlandırır`, `SUMX'i AVERAGEX'e çeviririm; daha az satır okunur`, `İki CALCULATE toplamına bölerim: indirimli × 0,9 + indirimsiz`, `IF yerine SWITCH(TRUE(), …) yazarım; SE onu anlar`], a: 2,
    why: `Koşulu filtreye taşırsan iki saf SE toplamı kalır: CALCULATE(SUM(Tutar), Indirim > 0) * 0,9 + CALCULATE(SUM(Tutar), Indirim = 0). IFERROR yavaşlatır; AVERAGEX sonucu değiştirir; SWITCH(TRUE()) de satır satır koşuldur ve callback'i kaldırmaz.` },
  { t: 'mc', q: `Bir analist <code>VAR Toplam = [Net Satış] RETURN CALCULATE(Toplam, REMOVEFILTERS(Kategoriler))</code> yazıp kategori payının paydasını bulmaya çalışıyor; her kategoride pay %100 çıkıyor. Neden?`,
    o: [`REMOVEFILTERS ilişki üzerinden çalışmaz`, `Kategoriler tablosu Satislar ile bağlı değil`, `DIVIDE yerine bölme işareti kullanıldığı için`, `Değişken bir kez hesaplanmış; CALCULATE onu değiştiremez`], a: 3,
    why: `Değişken kategori bağlamında hesaplanıp sabitlenir; CALCULATE sabit bir değerin bağlamını değiştiremez, bu yüzden pay = kendisi / kendisi. Doğrusu CALCULATE([Net Satış], REMOVEFILTERS(Kategoriler)) yazmaktır. REMOVEFILTERS ve ilişki doğru çalışıyor; bölme işareti sonucu %100 yapmaz.` },
  { t: 'dax', name: 'Web Satışı (Kesişim)', q: `<b>Web Satışı (Kesişim)</b>: Web kanalının net satışı; ama Kanal satırlı bir matriste Mobil ve Mağaza satırları <b>boş</b> kalmalı (mevcut kanal seçimine saygı).`,
    sol: `CALCULATE([Net Satış], KEEPFILTERS(Satislar[Kanal] = "Web"))`, hint: `Sütun filtresi mevcut Kanal filtresinin üzerine yazar. KEEPFILTERS(Satislar[Kanal] = "Web") ile kesişim al.`, grid: [{ t: 'Satislar', c: 'Kanal' }, { t: 'Tarih', c: 'Yil' }] },
  { t: 'dax', name: 'Sepet Farkı GY (VAR)', q: `<b>Sepet Farkı GY (VAR)</b>: <code>[Ortalama Sepet]</code> ile geçen yılın ortalama sepeti arasındaki fark. Her ifadeyi bir kez hesapla; geçen yıl yoksa BLANK döndür.`,
    sol: `VAR s = [Ortalama Sepet]\nVAR g = CALCULATE([Ortalama Sepet], SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN IF(NOT ISBLANK(g), s - g)`, hint: `İki değişken (bu yıl, geçen yıl), sonra IF(NOT ISBLANK(g), s - g).` },
  { t: 'dax', name: 'Büyük Sepetli Sipariş', q: `<b>Büyük Sepetli Sipariş</b>: Toplam tutarı 2.000 ₺'yi aşan iptal edilmemiş sipariş sayısı. Olgu tablosunun satırlarında değil, sipariş numaraları üzerinde dolaş.`,
    sol: `CALCULATE(\n    COUNTROWS(FILTER(VALUES(Satislar[SiparisNo]), CALCULATE(SUM(Satislar[Tutar])) > 2000)),\n    Satislar[Durum] <> "İptal"\n)`, hint: `FILTER(VALUES(Satislar[SiparisNo]), CALCULATE(SUM(Satislar[Tutar])) > 2000) siparişleri süzer; COUNTROWS sayar; dıştaki CALCULATE iptalleri çıkarır.` },
  { t: 'query', q: `DAX Studio'da Server Timings ile ölçeceğin bir test sorgusu yaz: <code>Tarih[YilAy]</code> satırlarında “Net Satış” ve “Sipariş” (<code>[Sipariş Sayısı]</code>) sütunlarını döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[YilAy],\n    "Net Satış", [Net Satış],\n    "Sipariş", [Sipariş Sayısı]\n)`, hint: `SUMMARIZECOLUMNS(Tarih[YilAy], "Net Satış", [Net Satış], "Sipariş", [Sipariş Sayısı]) — görselin gönderdiği sorgunun sade hâli.` }
] });

/* ===================================================================== 4. KURUMSAL MODEL */
ext('kurumsal-model', { min: 22, html: `
<h2>Bileşik model: tablo tablo karar vermek</h2>
<p>Senaryo: Anadolu Market'in satış satırları şirket içindeki bir SQL veritabanında yüz milyonlarca satıra ulaştı. Yönetim aylık kategori özetine bakıyor; mağaza müdürleri ise gün içi satışları görmek istiyor. Tek bir depolama modu herkese uymaz; bileşik model (composite model) her tabloya ayrı mod vermeyi sağlar:</p>
<div class="tbl-wrap"><table><tr><th>Tablo</th><th>Mod</th><th>Gerekçe</th></tr>
<tr><td><code>Satislar</code> (ayrıntı)</td><td>DirectQuery</td><td>Belleğe sığmıyor, gün içi güncellik gerekli</td></tr>
<tr><td><code>Tarih</code>, <code>Urunler</code>, <code>Kategoriler</code>, <code>Musteriler</code></td><td>Dual</td><td>Dilimleyiciler bellekten açılır; DirectQuery olguyla birleşince sorguya kaynakta katılır</td></tr>
<tr><td><code>Hedefler</code></td><td>Import</td><td>Excel'den gelir, ayda bir değişir</td></tr>
<tr><td>Aylık özet tablo</td><td>Import (gizli)</td><td>Yönetim sorgularını bellekten karşılar</td></tr></table></div>
<p>Boyutlar Import olsaydı, DirectQuery olgu ile aralarındaki ilişki <b>sınırlı ilişki</b> (limited relationship) olurdu: farklı kaynak grupları arasında motor ilişkiyi tam bir birleşim gibi kuramaz. Sonuçları: <code>RELATED</code> çalışmaz, eşleşmeyen satırlar için boş satır (blank row) oluşmaz, her sorgu iki dünya arasında veri taşır. Dual bu yüzden boyutların varsayılanıdır.</p>
<h3>Yayımlanmış modele bağlanıp genişletmek</h3>
<p>Finans ekibi onaylı satış modelini kullanmak, ama kendi gider bütçesi tablosunu eklemek istiyor. Canlı bağlantıyı “yerel model”e çevirmek (Power BI anlam modellerine DirectQuery) bunu sağlar. Dikkat: kullanıcının kaynak modelde <b>Derleme</b> (Build) izni olmalı, kaynak modeldeki RLS geçerliliğini korur ve kiracıda “Power BI anlam modellerine DirectQuery bağlantılarına izin ver” ayarı açık olmalı. Zincir uzadıkça (model üstüne model üstüne model) sorgular yavaşlar ve hata ayıklamak zorlaşır; iki halkadan uzun zincirden kaçın.</p>

<h2>DirectQuery'e geri dönüş ve Direct Lake davranışı</h2>
<p>Direct Lake'in iki biçimi farklı davranır; karar verirken bu farkı bilmek gerekir:</p>
<div class="tbl-wrap"><table><tr><th></th><th>Direct Lake on OneLake</th><th>Direct Lake on SQL (SQL analiz uç noktası)</th></tr>
<tr><td>Kaynak</td><td>Bir ya da birden çok Fabric öğesinin Delta tabloları</td><td>Tek bir lakehouse/warehouse'un SQL uç noktası</td></tr>
<tr><td>DirectQuery'e geri dönüş</td><td>Yok</td><td>Var: SQL görünümü (view), SQL tarafı ayrıntılı erişim denetimi ya da RLS, işlenmemiş tablo, sınır aşımı</td></tr>
<tr><td>Sınır (guardrail) aşılırsa</td><td>Yenileme başarısız olur; Delta tabloları iyileştirilene kadar model sorgulanamaz</td><td>Geri dönüş açıksa sorgu DirectQuery ile çalışır, yenileme uyarıyla tamamlanır</td></tr>
<tr><td>Import tablolarla bileşik</td><td>Desteklenir</td><td>Aynı modelde karıştırılamaz; Desktop'ta üstüne bileşik model kurulabilir</td></tr></table></div>
<p>Kapasiteye göre sınırlardan örnekler: F2–F8'de tablo başına 1.000 Parquet dosyası/satır grubu, 300 milyon satır ve diskte 10 GB model; F64'te tablo başına 5.000 dosya/satır grubu ve 1,5 milyar satır, belleğe alınabilecek veri için 25 GB üst sınır. Sınırın altında kalmanın yolu çoğu zaman SKU büyütmek değil, Delta tablolarını bakımlı tutmaktır: küçük dosyaları birleştirmek (compaction), V-Order ile yazmak.</p>
<ul>
<li><b>İlk sorgu yavaşsa:</b> Direct Lake sütunları ihtiyaç oldukça belleğe alır (transcoding). Sabah ilk açılış soğuktur; çerçeveleme (framing) sonrası bir ısınma sorgusu planlamak yaygın bir çözümdür.</li>
<li><b>Bellek dolarsa:</b> sütunlar bellekten atılıp yeniden yüklenir (paging); her şey çalışır ama yavaşlar.</li>
<li><b>Geri dönüşü izle:</b> “Direct Lake davranışı” (Direct Lake behavior) özelliğiyle geri dönüşü kapatırsan sorun sessiz yavaşlık yerine açık hata olarak görünür; Fabric kapasite ölçümleri uygulamasında geri dönüşleri takip et.</li>
<li><b>SQL görünümü yerine:</b> lakehouse'ta somutlaştırılmış görünüm (materialized view) ya da dönüşümü yapılmış bir Delta tablosu kullan.</li>
</ul>

<h2>Toplama tabloları ve artımlı yenileme: kısa hatırlatma</h2>
<p>Bu iki konunun ayrıntısını ayrı bir ders işliyor; burada yalnızca karar ölçütü. Toplama tablosunun değeri, <b>tanesine</b> (grain) bağlıdır. Bu modelde <code>Satislar</code> 1.620 satırdır; ay × kategori düzeyinde özet 199 satıra iner. Ürün düzeyinde bir soru gelirse bu özet cevap veremez ve sorgu ayrıntıya düşer. Özet tabloyu, panoların gerçekten sorduğu soruların tanesinde kur; Performans Analizi ile “özet kullanıldı mı?” diye doğrula. Artımlı yenileme ise yenileme süresinin sınırlarını (paylaşılan kapasitede 2 saat, Premium/Fabric'te 5 saat) aşan tablolar için ilk adaydır.</p>

<h2>Modeli kullanıcıya anlatmak: klasörler, açıklamalar, çeviriler</h2>
<p>119 ölçülük bir model, alan listesinde düz bir liste olarak kullanılamaz. Kurumsal bir modelde şu üç meta veri en az ölçü kadar önemlidir:</p>
<ul>
<li><b>Görüntüleme klasörü</b> (Display folder): <code>Satış\\Temel</code>, <code>Satış\\Zaman Zekâsı</code>, <code>Müşteri\\RFM</code>. Ters eğik çizgi alt klasör, noktalı virgül aynı ölçüyü iki klasörde gösterir. Klasör adları da çevrilebilir.</li>
<li><b>Açıklama</b> (Description): alan listesinde araç ipucu olarak çıkar. “İptal hariç, iade dahil net satış; Tarih tablosuyla aktif ilişki” gibi tanımlar yazılmalı. Copilot ve “Yapay zekâ için verileri hazırla” (Prep data for AI) ayarları da bu açıklamalardan yararlanır.</li>
<li><b>Gizleme ve özetleme:</b> anahtar sütunlar (<code>UrunNo</code>, <code>MusteriNo</code>) olgu tablosunda gizli olmalı; sayısal kimlikler “Özetleme: Hiçbiri” olmalı ki kimse SatirNo toplamı almasın.</li>
</ul>
<h3>Meta veri çevirileri (translations)</h3>
<p>Almanya'daki ortak şirket aynı modeli kullanacak. Üç ayrı çeviri türü vardır ve zorlukları farklıdır:</p>
<div class="tbl-wrap"><table><tr><th>Tür</th><th>Neyi çevirir?</th><th>Nasıl?</th></tr>
<tr><td>Meta veri çevirisi</td><td>Tablo, sütun, ölçü, hiyerarşi adları; açıklamalar; görüntüleme klasörleri</td><td>Modelin içinde, dil (culture) başına; Translations Builder gibi araçlarla</td></tr>
<tr><td>Rapor etiketi çevirisi</td><td>Başlıklar, düğme metinleri</td><td>Yerleşik özellik yok; etiketleri ölçü olarak tutan gizli bir tablo kalıbı</td></tr>
<tr><td>Veri çevirisi</td><td>“Elektronik” → “Elektronik”, “Ev &amp; Yaşam” → “Haus &amp; Wohnen”</td><td>Kaynakta çevrilmiş sütunlar + seçim mekanizması</td></tr></table></div>
<p>Sayfa sekmesi adları ve metin kutularındaki sabit yazılar çevrilemez; çok dilli raporlar Web'de yayımla ile desteklenmez. Ölçü adlarını çevirmek DAX'ı bozmaz: formüller nesneye başvurur, görünen ada değil.</p>
<p>Nesne düzeyinde güvenlik (OLS) de kurumsal modelin parçasıdır; ayrıntısı Satır ve nesne düzeyinde güvenlik dersindedir.</p>

<h2>Ölçek kararları</h2>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Önce dene</th><th>Sonra</th></tr>
<tr><td>Pro'da model boyutu 1 GB sınırına yaklaştı</td><td>Gereksiz sütun, kardinalite, otomatik tarih/saat</td><td>PPU ya da Fabric kapasitesi; büyük model biçimi</td></tr>
<tr><td>Yenileme 2 saati aşıyor</td><td>Sorgu katlama, artımlı yenileme</td><td>Kapasite (5 saat), XMLA ile bölüm bölüm yenileme</td></tr>
<tr><td>Günde 8'den fazla yenileme gerekiyor</td><td>Gerçekten gerekli mi? Hangi tablo?</td><td>Kapasitede 48'e kadar zamanlanmış; Direct Lake ya da DirectQuery</td></tr>
<tr><td>Birden çok ekip aynı tanımları yeniden yazıyor</td><td>Tek onaylı model + Derleme izni</td><td>Bileşik modelle ekip tablolarını ekleme</td></tr></table></div>
<div class="tip"><b>Kontrol listesi</b>Her tablonun modu ve gerekçesi yazılı mı? · Boyutlar Dual mı? · Direct Lake'te geri dönüş davranışı bilinçli seçildi mi, izleniyor mu? · Toplama tablosunun tanesi gerçek sorulara uyuyor mu? · Her ölçünün açıklaması ve klasörü var mı? · Anahtar sütunlar gizli mi?</div>
`, ex: [
  { t: 'mc', q: `Direct Lake on SQL modelinde satış tablosu, lakehouse'taki bir SQL görünümüne (view) bağlı. Kullanıcılar bazı sayfaların diğerlerinden çok yavaş olduğunu söylüyor. Kalıcı çözüm?`,
    o: [`Modeli Import moduna alıp her saat yenilemek`, `Kapasiteyi bir üst SKU'ya yükseltmek`, `Görünümün mantığını Delta tablosuna ya da somut görünüme taşımak`, `Görünümü Dual moda almak`], a: 2,
    why: `SQL görünümleri Direct Lake on SQL'de DirectQuery'e geri dönüşe yol açar. Mantığı bir Delta tablosuna (ya da somutlaştırılmış görünüme) taşımak sorguyu Direct Lake'te tutar. SKU büyütmek görünüm kaynaklı geri dönüşü kaldırmaz; Import gereksiz kopya ve gecikme yaratır; Direct Lake tablosu Dual yapılamaz.` },
  { t: 'mc', q: `Direct Lake on OneLake modelinde bir tablo F8 kapasitesinin satır sınırını aştıktan sonra sabah yenilemesi başarısız oldu ve rapor hiç açılmıyor. Ne olmuş ve ne yaparsın?`,
    o: [`Sorgular DirectQuery'e döndü; beklemek yeterli`, `Sınır aşıldı; geri dönüş yok, Delta'yı iyileştir ya da SKU'yu büyüt`, `Çerçeveleme bozuldu; modeli yeniden yayımla`, `RLS hatası; rol üyeliklerini kontrol et`], a: 1,
    why: `Direct Lake on OneLake'te DirectQuery'e geri dönüş yoktur; sınır aşılınca yenileme başarısız olur ve tablolar iyileştirilene (ya da kapasite büyütülene) kadar model sorgulanamaz. Geri dönüş yalnızca Direct Lake on SQL'de vardır; yeniden yayımlamak ya da RLS bu sorunu açıklamaz.` },
  { t: 'mc', q: `Alman ortaklar aynı satış modelini kullanacak. Alan listesinde “Net Satış”, “Kategori” gibi adları ve ölçü açıklamalarını Almanca görmeleri gerekiyor; kategori değerleri Türkçe kalabilir. En az çabalı doğru yol?`,
    o: [`Her ölçünün Almanca kopyasını yazıp ayrı klasöre koymak`, `Kaynağa Almanca kategori sütunları eklemek`, `Modelde Almanca meta veri çevirisi tanımlamak`, `Raporu kopyalayıp başlıkları elle Almancaya çevirmek`], a: 2,
    why: `İstenen yalnızca nesne adları ve açıklamalar: bu meta veri çevirisidir ve modelin içinde dil başına tutulur. Kopya ölçüler bakım yükünü ikiye katlar; Almanca kategori sütunları veri çevirisidir (istenmiyor); rapor kopyalamak alan listesini çevirmez.` },
  { t: 'mc', q: `Finans ekibi onaylı satış modeline canlı bağlanıp kendi gider bütçesi Excel'ini eklemek istiyor. Ekip üyeleri model sahibi değil. Neyin hazır olması gerekir?`,
    o: [`Kaynak modelde Derleme izni ve kiracıda anlam modellerine DirectQuery izni`, `Kaynak modelin RLS rollerinin kaldırılması`, `Ekibe kaynak çalışma alanında Üye rolü verilmesi`, `Kaynak modelin Import'tan DirectQuery'ye çevrilmesi`], a: 0,
    why: `Yayımlanmış modelin üzerine yerel tablo eklemek için kullanıcının kaynak modelde Derleme iznine ve kiracı ayarının açık olmasına ihtiyaç var. RLS kaldırılmaz, kaynak modelde geçerliliğini korur; Üye rolü gereğinden fazla yetkidir; kaynak modelin modunu değiştirmek gerekmez.` },
  { t: 'mc', q: `Bileşik modelde boyutlar Import, satış olgusu DirectQuery. Bir analist hesaplanmış sütunda <code>RELATED(Urunler[Kategori])</code> kullanamadığını ve dilimleyicilerin yavaş olduğunu söylüyor. Kök neden?`,
    o: [`Ürünler tablosunda yinelenen anahtarlar var`, `İlişki çift yönlü olmadığı için filtre inmiyor`, `DirectQuery hesaplanmış sütunları hiç desteklemez`, `Farklı kaynak grupları arasındaki ilişki sınırlı ilişki olmuş`], a: 3,
    why: `Import boyut ile DirectQuery olgu arasındaki ilişki sınırlı (limited) ilişkidir; RELATED çalışmaz ve sorgular iki dünya arasında veri taşır. Boyutları Dual yapmak çözer. Yinelenen anahtar ya da ilişki yönü bu iki belirtiyi birlikte açıklamaz.` },
  { t: 'query', q: `Bir toplama tablosunun içeriğini önizle: <code>Tarih[YilAy]</code> ve <code>Kategoriler[Kategori]</code> düzeyinde “Net Satış” döndüren bir sorgu yaz.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[YilAy],\n    Kategoriler[Kategori],\n    "Net Satış", [Net Satış]\n)`, hint: `SUMMARIZECOLUMNS'a iki gruplama sütunu ve bir ölçü ver.` },
  { t: 'query', q: `Toplama tablosu ne kadar küçülür? Tek satırda <code>Satislar</code> tablosunun satır sayısını (“Ayrıntı”) ve <code>Satislar</code> üzerinde <code>Tarih[YilAy]</code> × <code>Urunler[Kategori]</code> bileşimlerinin sayısını (“Özet”) döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nROW(\n    "Ayrıntı", COUNTROWS(Satislar),\n    "Özet", COUNTROWS(SUMMARIZE(Satislar, Tarih[YilAy], Urunler[Kategori]))\n)`, hint: `COUNTROWS(Satislar) ve COUNTROWS(SUMMARIZE(Satislar, Tarih[YilAy], Urunler[Kategori])) ifadelerini ROW içinde iki sütun yap.` }
] });
