/* Kesit Power BI — c24: DP-600 veri hazırlama ödevleri (Fabric deneme kapasitesinde adım adım; sonuçlar Anadolu Market verisinden hesaplandı) */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

add('fabric-hazirlama', {
  id: 'fabric-veri-alma', lv: 'C1', mod: 'Fabric', min: 25,
  title: 'Fabric’e veri getirmek: kısayol, işlem hattı, veri akışı, not defteri (ödevli)',
  sum: 'Veriyi kopyalamak mı, yerinde erişmek mi? Kısayol, Dataflow Gen2, işlem hattı ve not defteri arasında seçim; Anadolu Market CSV’lerini bir lakehouse’a yükleme ödevi.',
  body: `
<p>DP-600 çalışma kılavuzunda veriyi hazırlama ve sunma alanı %40–45 ağırlıktadır. Lakehouse veya ambara veri almayı, kopyalamayı, dönüştürmeyi ve yükleme performansını kapsar. Bu ders veri alma araçlarını karşılaştırır. Ardından T-SQL ve PySpark ödevleriyle dönüşümü uygula.</p>
<div class="note"><b>Tarayıcı sınırı</b>Bu uygulama T-SQL, PySpark ya da KQL çalıştırmaz. Bu üç derste ödevleri gerçek Fabric’te yaparsın, sonucu aşağıdaki beklenen değerlerle karşılaştırırsın. Alıştırmalar ise kavramı ve DAX karşılığını denetler.</div>

<h2>Deneme kapasitesi</h2>
<p>Fabric deneme kapasitesi (trial) 60 gün sürer ve F4 ya da F64 olarak açılır. Fabric ana sayfasındaki hesap menüsünden <b>Start trial</b> ile başlatılır ya da sahibi olduğun bir çalışma alanında Fabric öğesi oluşturmaya çalışınca önerilir. Uygunluk kuruluşun kiracı ayarlarına, lisansa ve bölgeye bağlıdır; garanti değildir. Açamazsan SQL bölümlerini <a href="https://ysfdurak.github.io/kesit-sql/">Kesit SQL</a>’de, Power Query bölümlerini Power BI Desktop’ta çalış; kısayol ve işlem hattı adımlarını yalnızca oku.</p>

<h2>Önce karar: kopyala mı, yerinde mi eriş?</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Araç</th><th>Neden</th></tr>
<tr><td>Veri başka bir Fabric öğesinde ya da ADLS, S3, Google Cloud Storage’da duruyor, dönüşüm gerekmiyor</td><td><b>Kısayol (shortcut)</b></td><td>Kopya oluşmaz; sembolik bağlantı gibi davranır</td></tr>
<tr><td>Az kodla bağlan, temizle, hedefe yaz</td><td><b>Dataflow Gen2</b></td><td>Power Query bilgisi yeterli</td></tr>
<tr><td>Büyük hacimli kopyalama, zamanlama, adımları sıraya koyma</td><td><b>İşlem hattı (data pipeline)</b></td><td>Düzenleyicidir; not defteri, veri akışı ve saklı yordam da çağırır</td></tr>
<tr><td>Kod gerektiren dönüşüm, çok dosya, kendi kuralın</td><td><b>Not defteri (notebook)</b></td><td>PySpark ile tam denetim</td></tr>
</table></div>

<h2>Kısayol hakkında dört gerçek</h2>
<ul>
<li>Dahili kısayol lakehouse, ambar, KQL veritabanı gibi Fabric öğelerine, çalışma alanları arasında da işaret edebilir. Harici kısayol ADLS Gen2, Amazon S3, Google Cloud Storage, Azure Blob, Dataverse, OneDrive ve SharePoint’e işaret edebilir.</li>
<li><code>Tables</code> klasöründe yalnızca en üst düzeyde oluşturulur; hedef Delta biçimindeyse tablo olarak tanınır. <code>Files</code> klasöründe her düzeyde ve her biçimde oluşturulur, tablo keşfi olmaz.</li>
<li>Kısayolu silmek hedef veriye dokunmaz.</li>
<li>Ama kısayolun <b>içindeki</b> bir dosyayı silersen, iznin varsa hedefteki dosya da silinir.</li>
</ul>

<h2>Ödev 1: Anadolu Market’i lakehouse’a yükle</h2>
<ol>
<li><button class="lnk" data-go="model">Anadolu Market modeli</button> sayfasından veri setini indir ve zip’i aç.</li>
<li>Fabric’te bir çalışma alanı aç, içinde <code>AnadoluLH</code> adlı bir lakehouse oluştur.</li>
<li>CSV’leri <code>Files/ham</code> klasörüne yükle.</li>
<li><code>Satislar.csv</code>, <code>Urunler.csv</code>, <code>Kategoriler.csv</code> ve <code>Tarih.csv</code> için <b>Load to Tables</b> ile Delta tablo oluştur.</li>
<li>SQL analiz uç noktasında satır sayılarını kontrol et.</li>
</ol>
<div class="tip"><b>Beklenen sonuç</b>Satislar 1.620, Urunler 40, Kategoriler 7, Tarih 1.096 satır. <code>Satislar</code> üzerinde <code>Tutar</code> toplamı 1.346.189,85.</div>
<p>Dosya UTF-8 BOM ile başlıyor. Bir araç ilk sütun adının başında görünmez bir karakter bırakırsa sütun adını düzelt; Türkçe karakterlerin bozulduğunu görürsen kodlamayı kontrol et.</p>

<h2>Ödev 2: İki yolu karşılaştır</h2>
<p>Aynı <code>Urunler.csv</code> dosyasını bir kez Dataflow Gen2 ile <code>Urunler_DF</code> tablosuna yaz, sonra işlem hattındaki <b>Copy data</b> etkinliğiyle <code>Urunler_PL</code> tablosuna yaz. Her ikisi de 40 satır olmalı. Hangisini ne zaman seçeceğini iki cümleyle not et; sınavda “en az efor” ve “dönüşüm gerekiyor mu” ipuçlarını ararsın.</p>
`,
  ex: [
    { t: 'mc', q: 'Başka bir çalışma alanındaki lakehouse’ta duran Delta tabloyu kopya oluşturmadan kullanmak istiyorsun. Ne yaparsın?', o: ['Kısayol oluştururum', 'Her gece kopyalayan işlem hattı kurarım', 'Dataflow Gen2 ile yeniden yazarım', 'Not defterinde yeni tablo olarak kaydederim'], a: 0, why: 'Kısayol veriyi kopyalamadan yerinde erişim sağlar; hedef Delta ise Tables altında tablo olarak tanınır.' },
    { t: 'mc', q: 'Bir lakehouse’ta kısayolu sildin. Hedef veriye ne olur?', o: ['Hedef veri aynen kalır', 'Hedef veri de silinir', 'Hedef tablo salt okunur olur', 'Yalnızca Delta günlüğü silinir'], a: 0, why: 'Kısayol bir işaretçidir; onu silmek hedefi etkilemez. Kısayolun içindeki bir dosyayı silmek ise izin varsa hedeften de siler.' },
    { t: 'mc', q: 'CSV ve Parquet karışık bir dış klasörü olduğu gibi göstermek istiyorsun. Kısayolu nereye açarsın?', o: ['Files klasörüne', 'Tables klasörünün alt klasörüne', 'Ambarın dbo şemasına', 'Anlam modelinin içine'], a: 0, why: 'Files altında her düzeyde ve her biçimde kısayol açılabilir; Tables yalnız en üst düzeyde olur ve Delta olmayan veri tablo olarak tanınmaz.' },
    { t: 'mc', q: 'Bir not defterini, ardından bir saklı yordamı sırayla ve her gece çalıştırmak istiyorsun. En uygun araç?', o: ['İşlem hattı (data pipeline)', 'Dataflow Gen2', 'Kısayol', 'Görsel sorgu düzenleyici'], a: 0, why: 'İşlem hattı düzenleyicidir: etkinlikleri sıraya koyar ve zamanlar.' },
    { t: 'mc', q: 'Küçük bir ekip, kod yazmadan bir SharePoint listesini temizleyip lakehouse’a yazmak istiyor. En uygun araç?', o: ['Dataflow Gen2', 'PySpark not defteri', 'Eventstream', 'XMLA uç noktası'], a: 0, why: 'Dataflow Gen2, Power Query arayüzüyle az kodla bağlanır, dönüştürür ve hedefe yazar.' },
    { t: 'query', q: 'Ödev 1’deki satır sayısını DAX ile doğrula: <b>Tablo</b> ve <b>Satır</b> adlı iki sütunla tek satır döndür. Tablo değeri <code>"Satislar"</code>, Satır değeri Satislar tablosunun satır sayısı olsun.', sol: 'EVALUATE\nROW("Tablo", "Satislar", "Satır", COUNTROWS(Satislar))', hint: 'Tek satırlık tablo üreten fonksiyonu kullan; sayımı tablo üzerinden yap.', explain: 'ROW tek satırlık tablo üretir. Yüklemeden sonra ilk iş her zaman kaynakla satır sayısı karşılaştırmaktır.' }
  ]
});

add('fabric-veri-alma', {
  id: 'fabric-tsql-odev', lv: 'C1', mod: 'Fabric', min: 30,
  title: 'Ambar ödevi: T-SQL ile yıldız şema, görünüm ve saklı yordam',
  sum: 'Lakehouse’tan ambara CTAS ile taşımak, türü açıkça vermek, iptalleri ayıklayan görünüm, yükleme yordamı ve MERGE tuzakları; sonuçları beklenen değerlerle karşılaştır.',
  body: `
<p>Sınavdaki <b>Transform data</b> maddeleri (görünüm, fonksiyon, saklı yordam, yıldız şema, birleştirme, tür dönüşümü) ambar üzerinde T-SQL ile sorulur. Bu ödev önceki dersteki <code>AnadoluLH</code> lakehouse’unu kullanır. SQL’in kendisi eksikse aynı şirketin verisiyle <a href="https://ysfdurak.github.io/kesit-sql/">Kesit SQL</a>’de çalış: <code>JOIN</code>, <code>GROUP BY</code> ve pencere fonksiyonları orada alıştırmalı anlatılıyor.</p>

<h2>T-SQL ile yükleme seçenekleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar?</th><th>Dikkat</th></tr>
<tr><td><code>CREATE TABLE AS SELECT</code> (CTAS)</td><td>Hedefi oluşturur ve doldurur</td><td>Türler sorgudan çıkarılır; kritik sütunda <code>CAST</code> yaz</td></tr>
<tr><td><code>SELECT ... INTO</code></td><td>Sorgu sonucundan yeni tablo</td><td>Türler yine çıkarılır</td></tr>
<tr><td><code>INSERT ... SELECT</code></td><td>Var olan tabloya ekler</td><td>Tablo tanımı senin denetiminde</td></tr>
<tr><td><code>MERGE</code></td><td>Anahtara göre ekler, günceller, siler</td><td>Kaynakta anahtar başına en çok bir satır olmalı. Artımlı toplu veride <code>WHEN NOT MATCHED BY SOURCE THEN DELETE</code> geçerli satırları silebilir</td></tr>
</table></div>
<p>Aynı çalışma alanındaki bir lakehouse’un <code>Tables</code> altındaki tablosuna üç parçalı adla ulaşırsın: <code>AnadoluLH.dbo.Satislar</code>. Öğe, Explorer’a eklenmiş olmalı.</p>

<h2>Ödev 1: Boyut ve olgu tablosu</h2>
<p>Ambar oluştur (<code>AnadoluDW</code>), sonra çalıştır:</p>
<pre data-notry>CREATE TABLE dbo.DimUrun AS
SELECT CAST(u.UrunNo AS int)          AS UrunKey,
       CAST(u.Urun AS varchar(100))   AS Urun,
       CAST(u.Kategori AS varchar(50)) AS Kategori
FROM AnadoluLH.dbo.Urunler AS u;

CREATE TABLE dbo.FactSatis AS
SELECT CAST(s.SatirNo AS int)         AS SatirNo,
       CAST(s.SiparisNo AS int)       AS SiparisNo,
       CAST(s.Tarih AS date)          AS Tarih,
       CAST(s.UrunNo AS int)          AS UrunKey,
       CAST(s.Durum AS varchar(20))   AS Durum,
       CAST(s.Tutar AS decimal(18,2)) AS Tutar
FROM AnadoluLH.dbo.Satislar AS s;</pre>
<div class="tip"><b>Beklenen sonuç</b>DimUrun 40, FactSatis 1.620 satır. Tutar toplamı 1.346.189,85.</div>
<p>Toplam tutmuyorsa önce <code>Tutar</code> sütununun metin mi yüklendiğine, sonra ondalık ayırıcıya bak.</p>

<h2>Ödev 2: Temizlik kuralını görünümde tut</h2>
<pre data-notry>CREATE VIEW dbo.vw_NetSatis AS
SELECT f.SiparisNo, f.Tarih, d.Kategori, f.Tutar
FROM dbo.FactSatis AS f
JOIN dbo.DimUrun  AS d ON d.UrunKey = f.UrunKey
WHERE f.Durum &lt;&gt; 'İptal';</pre>
<p>Şunu çalıştır ve Elektronik satırını bul:</p>
<pre data-notry>SELECT Kategori, SUM(Tutar) AS NetSatis, COUNT(DISTINCT SiparisNo) AS Siparis
FROM dbo.vw_NetSatis
GROUP BY Kategori
ORDER BY NetSatis DESC;</pre>
<div class="tip"><b>Beklenen sonuç</b>Görünümün toplamı 1.250.772,45 (121 iptal satırı çıktı). Elektronik 339.303,65 ile ilk sırada. Aynı sayılar bu uygulamadaki <code>[Net Satış]</code> ölçüsünden de çıkar.</div>

<h2>Ödev 3: Saklı yordam</h2>
<p>Yükleme adımlarını tek çağrıda toplayan bir yordam yaz: önce <code>DROP TABLE IF EXISTS</code>, sonra iki CTAS. Yordamı bir işlem hattına <b>Stored procedure</b> etkinliği olarak ekle ve zamanla. Bir not yaz: “Bu tam yükleme. Artımlı yüklemede ne değişir?” Cevabın <code>MERGE</code>, anahtar benzersizliği ve silme kuralını içermeli.</p>

<h2>Sınavda neye bakılır?</h2>
<ul>
<li>Soru “aynı yerde güncellenebilir tablo” diyorsa ambar; SQL analiz uç noktası lakehouse tablolarında veri değiştirmez.</li>
<li>“Kuralı tek yerde tut, kopya üretme” görünümdür.</li>
<li>“Yinelenen satır” sorusunda önce anahtarı sor: hangi sütunlar bir satırı belirliyor?</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'CTAS ile tablo oluşturdun; Tutar sütunu beklediğin duyarlılıkta değil. Doğru düzeltme?', o: ['Sorguda CAST ile türü açıkça veririm', 'Tabloyu Direct Lake moduna alırım', 'Sorguya ORDER BY eklerim', 'Sütunu görünüme taşırım'], a: 0, why: 'CTAS ve SELECT INTO türleri sorgudan çıkarır. Belirli tür, duyarlılık ve uzunluk için CAST yazılır.' },
    { t: 'mc', q: 'Her gece yalnızca son günün satırlarını içeren bir kaynakla MERGE çalıştırıyorsun. Hangi kısım geçerli satırları silebilir?', o: ['WHEN NOT MATCHED BY SOURCE THEN DELETE', 'WHEN MATCHED THEN UPDATE', 'WHEN NOT MATCHED THEN INSERT', 'ON koşulundaki anahtar'], a: 0, why: 'Kaynak tüm veri değilse, kaynakta bulunmayan her hedef satırı “silinmiş” sanılır. Bu kısım yalnız kaynak eksiksizken güvenlidir.' },
    { t: 'mc', q: 'MERGE hata veriyor: kaynakta aynı anahtardan iki satır var. Ne yaparsın?', o: ['Kaynağı anahtar başına tek satıra indiririm', 'Hedef tabloyu silerim', 'Anahtarı metne çeviririm', 'WHEN MATCHED kısmını kaldırırım'], a: 0, why: 'MERGE kaynağı hedef anahtar başına en çok bir satır döndürmeli; önce yinelenenleri kuralına göre ayıkla.' },
    { t: 'mc', q: 'Aynı çalışma alanındaki AnadoluLH lakehouse’unun Satislar tablosunu ambardan nasıl okursun?', o: ['AnadoluLH.dbo.Satislar', 'Files/ham/Satislar.csv', 'dbo.AnadoluLH_Satislar', 'OneLake://Satislar'], a: 0, why: 'Çalışma alanındaki öğelere üç parçalı adla (öğe.şema.tablo) ulaşılır; öğe Explorer’a eklenmiş olmalı.' },
    { t: 'mc', q: 'İptalleri ayıklama kuralını her raporda tekrar yazmak istemiyorsun; veriyi de kopyalamak istemiyorsun. En uygun nesne?', o: ['Görünüm (view)', 'Yeni bir tablo', 'Yeni bir lakehouse', 'İkinci bir ambar'], a: 0, why: 'Görünüm kuralı tek yerde tutar, veri kopyası oluşturmaz.' },
    { t: 'dax', name: 'Görünüm Toplamı', q: '<b>Görünüm Toplamı</b>: Ödev 2’deki <code>vw_NetSatis</code> toplamının DAX karşılığı. <code>Satislar[Durum]</code> “İptal” olmayan satırların <code>Satislar[Tutar]</code> toplamı.', sol: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal")', hint: 'SQL’deki WHERE koşulu burada filtre bağımsız değişkeni olur.', explain: 'Aynı kural iki dilde aynı sonucu vermeli: 1.250.772,45. Katmanlar arası mutabakat, Fabric projelerinin ilk testidir.' }
  ]
});

add('fabric-tsql-odev', {
  id: 'fabric-spark-odev', lv: 'C1', mod: 'Fabric', min: 30,
  title: 'Lakehouse ödevi: PySpark ile temizlik, Delta ve dosya bakımı',
  sum: 'Şemayı açıkça vermek, yinelenen ve boş değer, Delta tablosuna yazmak, küçük dosya sorunu, OPTIMIZE, V-Order ve VACUUM’un ne zaman gerektiği.',
  body: `
<p>Sınav not defterini ayrıntılı kod olarak değil, <b>doğru işlem</b> olarak sorar: hangi adım yineleneni çözer, hangi işlem boş değeri doldurur, hangi ayar Direct Lake’i etkiler. Yine de kavram kendi elinle yapınca kalıcı olur. Bu ödev <code>AnadoluLH</code> lakehouse’undaki <code>Files/ham</code> klasörünü kullanır.</p>

<h2>Ödev 1: CSV’den Delta’ya</h2>
<p>Lakehouse’a bir not defteri bağla ve çalıştır:</p>
<pre data-notry>from pyspark.sql import functions as F

df = (spark.read
      .option("header", True)
      .option("inferSchema", False)
      .csv("Files/ham/Musteriler.csv"))

print(df.columns)   # ilk sütun adında görünmez bir karakter var mı?
print(df.count())
df.filter(F.col("Sehir").isNull()).count()</pre>
<div class="tip"><b>Beklenen sonuç</b>150 satır, <code>Sehir</code> sütununda 7 boş değer. Boşlar veride bilerek var: <code>Musteriler[Sehir]</code> boş olan satırların DAX’taki davranışını “BLANK ve hatalar” dersinde gördün.</div>
<p><code>inferSchema</code> kapalıyken her sütun metin gelir. Bu bilinçli: türü sen verirsin ve hatalı değeri görürsün.</p>

<h2>Ödev 2: Türü ver, boşu çöz, yineleneni kontrol et</h2>
<pre data-notry>temiz = (df
  .withColumn("MusteriNo", F.col("MusteriNo").cast("int"))
  .fillna({"Sehir": "Bilinmiyor"})
  .dropDuplicates(["MusteriNo"]))

print(temiz.count())
temiz.write.format("delta").mode("overwrite").saveAsTable("Musteriler_Temiz")</pre>
<div class="tip"><b>Beklenen sonuç</b>Yine 150 satır: <code>MusteriNo</code> yinelenmiyor. Boş şehirler “Bilinmiyor” oldu. SQL analiz uç noktasında <code>Musteriler_Temiz</code> görünmeli.</div>
<p>Anahtar yinelenmiyorsa <code>dropDuplicates</code> hiçbir şey değiştirmez, ama satır sayısını önce ve sonra karşılaştırmak iyi bir alışkanlıktır. Satır sayısı düştüyse hangi satırın neden silindiğini açıklayabilmelisin.</p>

<h2>Delta dosya bakımı</h2>
<div class="tbl-wrap"><table>
<tr><th>İşlem</th><th>Ne yapar?</th><th>Ne zaman?</th></tr>
<tr><td><code>OPTIMIZE</code></td><td>Küçük dosyaları birleştirir</td><td>Dosya sayısı tablo boyutundan hızlı artıyorsa; birikmiş sorunu bir kez çöz, sonra otomatik sıkıştırmayı (auto compaction) aç</td></tr>
<tr><td><b>V-Order</b></td><td>Parquet dosyasını okuma için düzenler</td><td>Spark’ın yazdığı tablolarda yalnız Direct Lake ana tüketiciyse aç. Ambarda varsayılan olarak açıktır</td></tr>
<tr><td><code>VACUUM</code></td><td>Saklama süresi dolan, başvurulmayan dosyaları siler</td><td>Depolamayı geri kazanır, etkin dosya düzenini iyileştirmez. Süreyi kısaltmak zaman yolculuğunu ve eşzamanlı okuyucuları bozabilir</td></tr>
</table></div>
<p>Learn’e göre Direct Lake genellikle 1 ile 16 milyon satırlık satır gruplarıyla en iyi çalışır. Küçük ve dengesiz satır grupları daha çok sütun segmenti ve dönüştürme yükü demektir. Bir tablonun yavaş olduğunu görünce önce dosya ve satır grubu durumuna bak, ayarı sonra değiştir.</p>

<h2>Ödev 3: Etkisini göster</h2>
<p>Aynı tabloya küçük parçalar halinde on kez <code>append</code> yap, dosya sayısına bak, sonra <code>OPTIMIZE</code> çalıştır:</p>
<pre data-notry>%%sql
OPTIMIZE Musteriler_Temiz;
DESCRIBE DETAIL Musteriler_Temiz;</pre>
<p><code>numFiles</code> değerinin düştüğünü not et. Mülakatta bunu “dosya sayısını ölçtüm, sıkıştırdım, tekrar ölçtüm” diye anlatabilirsin.</p>
`,
  ex: [
    { t: 'mc', q: 'Sipariş tablosunda aynı SiparisNo ve SatirNo’ya sahip satırları tekilleştirmek istiyorsun. Hangi işlem doğru?', o: ['dropDuplicates(["SiparisNo", "SatirNo"])', 'fillna({"SiparisNo": 0})', 'withColumn("SatirNo", F.lit(1))', 'cast("int")'], a: 0, why: 'dropDuplicates verilen anahtar sütunlara göre tek satır bırakır. Anahtarı doğru seçmek işin kendisidir.' },
    { t: 'mc', q: 'Tablon Spark ile yazılıyor ve yalnızca Spark ile okunuyor. V-Order için Learn’ün önerisi?', o: ['Yalnız bunun için açma', 'Mutlaka aç', 'Ambardan kopyala', 'VACUUM ile birlikte aç'], a: 0, why: 'Learn, Spark tablolarında V-Order’ı Direct Lake ana tüketiciyken açmayı önerir; yalnız Spark ya da SQL uç noktası performansı için önermez.' },
    { t: 'mc', q: 'Tablodaki dosya sayısı hızla artıyor, sorgular yavaşladı. İlk adım?', o: ['OPTIMIZE ile sıkıştırıp otomatik sıkıştırmayı açmak', 'VACUUM saklama süresini sıfırlamak', 'Sütun türlerini metne çevirmek', 'Tabloyu Files klasörüne taşımak'], a: 0, why: 'Küçük dosya sorununda birikmişi OPTIMIZE ile bir kez çözer, sonra otomatik sıkıştırmayı açarsın. VACUUM düzeni iyileştirmez.' },
    { t: 'mc', q: 'VACUUM saklama süresini kısaltmanın riski nedir?', o: ['Zaman yolculuğu ve eşzamanlı okuyucular etkilenebilir', 'Sorgu sonuçları yuvarlanır', 'Kısayollar silinir', 'Tablo şeması değişir'], a: 0, why: 'Dosyalar erken silinirse gereken tablo sürümlerine ulaşılamayabilir.' },
    { t: 'mc', q: 'CSV’yi inferSchema kapalı okudun. Sütunlar hangi türde gelir?', o: ['Metin', 'Her sütun kendi doğru türünde', 'İkili (binary)', 'Tarih'], a: 0, why: 'Şema çıkarımı kapalıyken Spark CSV sütunlarını metin okur; türü sen açıkça verirsin.' },
    { t: 'query', q: 'Ödev 1’i DAX ile doğrula: <b>Toplam</b> ve <b>BosSehir</b> adlı iki sütunla tek satır döndür. Toplam, Musteriler satır sayısı; BosSehir, <code>Musteriler[Sehir]</code> boş olan satır sayısı.', sol: 'EVALUATE\nROW("Toplam", COUNTROWS(Musteriler), "BosSehir", COUNTROWS(FILTER(Musteriler, ISBLANK(Musteriler[Sehir]))))', hint: 'Boş satırları süzmek için satır satır çalışan filtre ve boşluk denetimi gerekir.', explain: 'Beklenen 150 ve 7. Kaynakla katman arasında sayıları karşılaştırmak veri kalitesi kontrolünün ilk adımıdır.' }
  ]
});
})(window);
