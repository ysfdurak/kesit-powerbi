/* Kesit Power BI — c19: veri akışları ve paylaşılan anlam modelleri, Fabric’te veri hazırlama (T-SQL, PySpark, işlem hatları), gerçek zamanlı analitik (Eventhouse, KQL), gömme, REST API, otomasyon ve özel görseller */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- 1. Veri akışları ve paylaşılan anlam modelleri (Veri Hazırlama) ---------- */
add('pq-orta', {
  id: 'veri-akislari', lv: 'B2', mod: 'Veri Hazırlama', min: 24,
  title: 'Veri akışları ve paylaşılan anlam modelleri: hazırlığı bir kez yap, herkes kullansın',
  sum: 'Veri akışı Gen2 ile Gen1 arasındaki fark, çıkış hedefleri, hazırlığın nerede yapılacağı (veri akışı, modeldeki Power Query, SQL görünümü), paylaşılan ve onaylı anlam modelleri, canlı bağlantı, ince rapor deseni, yenileme sırası ve veri tazeliği ölçüsü.',
  body: `
<p>Anadolu Market’te dört analist var. Her biri kendi .pbix dosyasında aynı ürün listesini temizliyor: boşlukları siliyor, kategori adlarını düzeltiyor, iptal edilen siparişleri ayıklıyor. Ay sonunda dört raporda dört farklı “net satış” çıkıyor. Sorun DAX’ta değil, <b>hazırlığın dört kez yapılmasında</b>. Bu derste hazırlığı tek bir yere taşımayı ve herkesin aynı anlam modelini kullanmasını öğreneceksin.</p>
<p>İki katman var: <b>veri katmanı</b> (temizlenmiş tablolar) ve <b>anlam katmanı</b> (ilişkiler, ölçüler, güvenlik). Veri akışı birinci katmanı, paylaşılan anlam modeli ikinci katmanı ortak hâle getirir.</p>

<h2>Veri akışı nedir? Gen2 ile Gen1 farkı</h2>
<p>Veri akışı (dataflow), Power Query adımlarının bir .pbix dosyasının içinde değil, hizmette (bulutta) çalışan hâlidir. Adımlar aynıdır: “Power Query ile veri temizleme” ve “Power Query: birleştirme, ekleme, özetten çıkarma” derslerinde öğrendiğin her dönüşüm burada da var. Fark, sonucun bir kez hesaplanıp birçok kişiye sunulmasıdır.</p>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>Veri akışı Gen2 (Fabric)</th><th>Veri akışı Gen1 (Power BI)</th></tr>
<tr><td>Sonuç nereye yazılır?</td><td>Seçtiğin bir veya birden çok <b>çıkış hedefine</b> (lakehouse, ambar…)</td><td>Veri akışının kendi deposuna; raporlar veri akışı bağlayıcısıyla okur</td></tr>
<tr><td>İşlem hattında adım olarak çalışma</td><td>Var (Dataflow Gen2 etkinliği)</td><td>Yok</td></tr>
<tr><td>Hızlı kopyalama (fast copy), izleme merkezi, ayrıntılı yenileme geçmişi</td><td>Var</td><td>Yok</td></tr>
<tr><td>Veri akışı bağlayıcısıyla DirectQuery</td><td>Yok; bunun yerine çıkış tablosuna doğrudan bağlanılır</td><td>Var</td></tr>
<tr><td>Zamanlanmış ve artımlı yenileme, dağıtım işlem hatları</td><td>Var</td><td>Var</td></tr>
<tr><td>Durum</td><td>Önerilen yol; Nisan 2026’dan beri yeni öğeler Git ve CI/CD desteğiyle oluşturuluyor</td><td>Eski (legacy) durumda: çalışmaya devam ediyor, yeni özellik gelmiyor</td></tr>
</table></div>
<div class="note"><b>Gen1 kapanıyor mu?</b>Microsoft Learn’e göre şu an Gen1’i kaldırma planı yok. Fabric erişimi olan kapasitelerde Gen2 öneriliyor. Pro ve PPU kullanıcıları için Gen1 desteklenmeye devam ediyor. Gen1 öğelerini kimliğini, adını ve zamanlamasını koruyarak yükselten bir sihirbaz var, ama <b>önizleme</b> aşamasında. Geçişten önce Learn’deki geçiş sayfasını kontrol et.</div>
<p>Gen2 yayımlandığında çalışma alanında <code>DataflowsStagingLakehouse</code> ve <code>DataflowsStagingWarehouse</code> gibi sistem öğeleri görebilirsin. Bunlar ara (staging) depolardır, dokunman gerekmez.</p>

<h2>Çıkış hedefleri: veriyi nereye bırakacaksın?</h2>
<p>Gen2’de her sorgu için bir <b>veri hedefi</b> (data destination) seçersin. Learn’in listesinde Fabric lakehouse tabloları ve dosyaları, Fabric ambarı, Fabric KQL veritabanı, Fabric SQL veritabanı, Azure SQL, Azure Data Explorer, ADLS Gen2, SharePoint dosyaları, Snowflake ve PostgreSQL var.</p>
<ul>
<li><b>Değiştir (Replace):</b> Her yenilemede hedefteki veri silinir, yerine yeni sonuç yazılır. Boyut tabloları için tipik seçim.</li>
<li><b>Ekle (Append):</b> Her yenilemede sonuç mevcut tablonun sonuna eklenir. Günlük satış dosyası gibi biriken veride kullanılır. KQL veritabanı ve Azure Data Explorer yalnızca Ekle’yi destekler.</li>
<li><b>Otomatik ayarlar:</b> Yeni tablolarda varsayılan olarak açıktır (lakehouse, Azure SQL ve Snowflake için). Sütun eklediğinde eşlemeyi kendisi günceller ve tabloyu gerekirse yeniden oluşturur. Dikkat: tablo yeniden oluşturulunca üzerine kurduğun ilişkiler gidebilir.</li>
</ul>
<div class="warn"><b>Ekle + yeniden çalıştırma = çift kayıt</b>Ekle yöntemiyle çalışan bir veri akışını aynı gün iki kez elle çalıştırırsan o günün satırları iki kez yazılır. Ya Değiştir kullan ya da veri akışında “yalnızca son günü al” filtresiyle ve hedefte tekrar kontrolüyle çalış.</div>

<h2>Hazırlık nerede yapılmalı?</h2>
<p>Aynı temizliği üç yerde yapabilirsin. Hangisinin doğru olduğu, kimin kullanacağına ve verinin nerede durduğuna bağlıdır.</p>
<div class="tbl-wrap"><table>
<tr><th>Yer</th><th>Ne zaman doğru?</th><th>Zayıf yanı</th></tr>
<tr><td>Modeldeki Power Query</td><td>Tablo yalnızca bu modelde kullanılıyor; küçük ve hızlı bir proje</td><td>Başka model aynı temizliği tekrar yazar</td></tr>
<tr><td>Veri akışı (Gen2)</td><td>Aynı tabloyu birden çok model kullanıyor; ekip Power Query biliyor; kaynak şirket içinde (ağ geçidi)</td><td>Çok büyük hacimde Spark ya da SQL kadar hızlı olmayabilir</td></tr>
<tr><td>SQL görünümü (ambar ya da SQL analiz uç noktası)</td><td>Veri zaten ambarda; mantık birkaç birleştirme ve filtre; SQL bilen ekip bakım yapacak</td><td>Direct Lake modelde görünüm kullanmak DirectQuery’ye geri dönüşe yol açabilir (“Kurumsal model” dersi)</td></tr>
</table></div>
<p>Kural olarak: dönüşümü <b>verinin olduğu yere en yakın</b> ve <b>en çok kişinin yararlanacağı</b> katmanda yap. Anadolu Market’te ürün ve müşteri temizliği veri akışına, iptalleri ayıklayan “net satış” mantığı ise ortak anlam modeline gider.</p>

<h2>Paylaşılan anlam modeli ve canlı bağlantı</h2>
<p>Veri katmanı ortaklaştıktan sonra ikinci adım, ölçüleri de ortaklaştırmaktır. Bir anlam modeli bir kez yayımlanır; diğer analistler Desktop’ta <b>Veri al → Power BI anlam modelleri</b> ile ona bağlanır. Bu bağlantıya <b>canlı bağlantı</b> (live connection) denir.</p>
<ul>
<li>Bağlanmak için modelde <b>Derleme (Build)</b> izni gerekir. İzin çalışma alanında ya da uygulama paylaşılırken verilir.</li>
<li>Canlı bağlı raporda modeli değiştiremezsin: yeni tablo, sütun ya da ilişki ekleyemezsin. Ama <b>rapor düzeyi ölçü</b>, görsel hesaplama ekleyebilirsin.</li>
<li>Modelin RLS kuralları canlı bağlı raporda da çalışır.</li>
<li>Güvenilir modeller tanıtılmış (promoted) ya da sertifikalı (certified) olarak işaretlenir. Kimin onaylayabildiği “Yönetişim” dersinde anlatılıyor.</li>
</ul>
<p>Rapor düzeyi ölçü, modeldeki hazır ölçüleri kullanmalıdır. Pazarlama ekibi “sipariş başına brüt kâr” istiyor. Ortak modelde <code>[Brüt Kâr]</code> ve <code>[Sipariş Sayısı]</code> zaten var; sıfırdan SUM yazmak yerine onları kullan:</p>
<pre class="dax">Sipariş Başı Kâr =
DIVIDE([Brüt Kâr], [Sipariş Sayısı])</pre>
<p>Bu modelde sonuç yaklaşık 544 ₺ (456.108 ₺ brüt kâr, 838 sipariş). İptal kuralı değişirse bu ölçü de kendiliğinden doğru kalır, çünkü kural tek yerde, <code>[Net Satış]</code> içinde.</p>
<div class="tip"><b>Model mi değişmeli, rapor mu?</b>Bir rapor düzeyi ölçü üç rapora kopyalanmaya başladıysa, model sahibine onu ortak modele taşımasını öner. Rapor düzeyi ölçü tek bir raporun ihtiyacı içindir.</div>

<h2>İnce rapor (thin report) deseni</h2>
<p>Ekipler büyüyünce model ve raporlar ayrılır:</p>
<ol>
<li><b>Model çalışma alanı:</b> Tek bir .pbix (ya da .pbip) içinde yalnızca model: tablolar, ilişkiler, ölçüler, RLS. Raporu yok ya da yalnızca test sayfası var. Bunu veri ekibi yönetir.</li>
<li><b>Rapor çalışma alanları:</b> Her rapor bu modele canlı bağlı, kendi modeli olmayan bir dosyadır. Buna <b>ince rapor</b> denir. Satış, finans ve pazarlama ayrı raporlar yazar ama sayılar aynı modelden gelir.</li>
</ol>
<p>Kazanç: model bir kez yenilenir, kapasite bir kez harcanır, “hangi sayı doğru?” tartışması biter. Bedel: model sahibi değişiklik yaparken bağlı raporları düşünmek zorundadır. Bunun için etki analizi ve soy (lineage) görünümü kullanılır; .pbit şablonları, .pbids veri kaynağı dosyaları ve PBIP ile Git akışı “Yaşam döngüsü” dersinde ayrıntılı anlatılıyor.</p>
<div class="note"><b>Canlı bağlantıdan bileşik modele</b>İnce raporda kendi Excel dosyanı da eklemek istersen, canlı bağlantıyı “Power BI anlam modellerine DirectQuery” ile bileşik modele çevirmen gerekir. Bu konu “Kurumsal model” dersinde.</div>

<h2>Yenileme bağımlılıkları ve sıra</h2>
<p>Anadolu Market’in gece akışı şöyle: ERP’den satış dosyası gelir → ürün ve satış veri akışları çalışır → anlam modeli yenilenir → raporlar ve abonelik e-postaları güncel veriyi gösterir. Sıra bozulursa model eski veriyle yenilenir ve sabah herkes dünün rakamını görür.</p>
<ul>
<li><b>Saate göre zincir (kırılgan):</b> Veri akışı 02:00’de, model 03:00’te. Veri akışı bir gece 70 dakika sürerse model eski veriyi alır ve kimse fark etmez.</li>
<li><b>Olaya göre zincir (sağlam):</b> Fabric işlem hattında Dataflow Gen2 etkinliği → Anlam modeli yenileme (semantic model refresh) etkinliği. Yenileme etkinliği varsayılan olarak işin bitmesini bekler; bir adım hata verirse sonraki çalışmaz ve hata bildirimi gönderilebilir. Ayrıntı “Fabric’te veriyi hazırlamak” dersinde.</li>
<li><b>Direct Lake modelde</b> veri kopyalanmadığı için “yenileme” yalnızca çerçevelemedir (framing); yine de veri akışı bittikten sonra yapılmalıdır.</li>
</ul>
<p>Sırayı ne kadar iyi kurarsan kur, raporda bir <b>tazelik göstergesi</b> olsun. En basit hâli, olgu tablosundaki en son tarihin bir referans tarihten kaç gün geride olduğunu söyler. Bu uygulamanın verisi 31.12.2024’te bittiği için referans olarak o günü kullanıyoruz; gerçek bir modelde yerine <code>TODAY()</code> ya da yenileme günlüğünden gelen tarih yazılır.</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Kategoriler[Kategori],
    "Son Satış", MAX(Satislar[Tarih]),
    "Gecikme (gün)", DATEDIFF(MAX(Satislar[Tarih]), DATE(2024, 12, 31), DAY)
)</pre>
<p>Sonuçta altı kategori 0 ya da 1 gün geride, <b>Hediye</b> ise 16 gün (son satış 15.12.2024). Bu bir veri hatası olmayabilir; belki o kategoride gerçekten satış yoktur. Ama göstergeyi gören kişi soruyu sorar, rakamı körü körüne kullanmaz.</p>
`,
  ex: [
    { t: 'mc', q: 'Dört farklı anlam modeli aynı ürün tablosunu aynı Power Query adımlarıyla temizliyor. Temizliği tek yerde yapıp sonucu bir lakehouse tablosuna yazmak için ne kullanılır?', o: ['Her modelde başvuru (reference) sorgusu', 'Veri akışı Gen2 ve lakehouse hedefi', 'Rapor düzeyi ölçüler', 'Canlı bağlantılı ince rapor'], a: 1, why: 'Veri akışı Gen2, Power Query adımlarını hizmette bir kez çalıştırır ve sonucu seçilen çıkış hedefine (ör. lakehouse tablosu) yazar. Modeller bu tabloyu okur.' },
    { t: 'mc', q: 'Mevcut bir Gen1 veri akışının raporlarını <b>veri akışı bağlayıcısıyla DirectQuery</b> üzerinden okuyorsun. Gen2’ye geçerken ne değişir?', o: ['Gen2 de aynı DirectQuery bağlantısını destekler', 'Gen2’de DirectQuery için ağ geçidi şarttır', 'Desteklenmez; çıkış tablosuna bağlanılır', 'Gen2 yalnızca Import modda veri akışı okur'], a: 2, why: 'Learn’in karşılaştırmasına göre veri akışı bağlayıcısıyla DirectQuery yalnızca Gen1’de var. Gen2’de veri bir hedefe yazılır ve rapor o tabloya (ör. lakehouse ya da ambar) doğrudan bağlanır.' },
    { t: 'mc', q: 'Canlı bağlantıyla paylaşılan bir anlam modeline bağlanan analist Desktop’ta hangisini <b>yapabilir</b>?', o: ['Rapor düzeyi bir ölçü eklemek', 'Modele yeni bir tablo eklemek', 'İki tablo arasına ilişki kurmak', 'Modelin RLS rolünü kapatmak'], a: 0, why: 'Canlı bağlı raporda model değiştirilemez: tablo, sütun ve ilişki eklenemez, RLS de devrede kalır. Ama rapor düzeyi ölçü ve görsel hesaplama eklenebilir.' },
    { t: 'mc', q: 'Veri akışı her gece 02:00’de, anlam modeli 03:00’te zamanlanmış. Bir gece veri akışı 70 dakika sürdü. En sağlam çözüm hangisi?', o: ['Modelin saatini 04:00’e ertelemek', 'Yenilemeyi her saat başı tekrarlamak', 'İşlem hattında olaya bağlı zincir kurmak', 'Veri akışını ikiye bölüp iki saate yaymak'], a: 2, why: 'Saate göre zincir süre uzayınca kırılır. İşlem hattında Dataflow Gen2 etkinliğinden sonra anlam modeli yenileme etkinliği çalışırsa model ancak veri hazır olduğunda yenilenir; hata olursa zincir durur.' },
    { t: 'dax', name: 'Sipariş Başı Kâr', q: '<b>Sipariş Başı Kâr</b>: İnce rapordasın; modelde yalnızca hazır ölçüler var. Sipariş başına brüt kârı, hazır <code>[Brüt Kâr]</code> ve <code>[Sipariş Sayısı]</code> ölçüleriyle güvenli bölme kullanarak hesapla.', sol: 'DIVIDE([Brüt Kâr], [Sipariş Sayısı])', hint: 'SUM yazma; iki hazır ölçüyü DIVIDE ile böl.' },
    { t: 'dax', name: 'Tazelik Durumu', q: '<b>Tazelik Durumu</b>: Görünen satırlardaki en son satış tarihi (<code>MAX(Satislar[Tarih])</code>) 31.12.2024’ten en fazla 7 gün gerideyse "Güncel", değilse "Gecikmeli" yazsın. Gün farkı için <code>DATEDIFF(..., DATE(2024, 12, 31), DAY)</code> kullan.', sol: 'VAR Son = MAX(Satislar[Tarih])\nRETURN IF(DATEDIFF(Son, DATE(2024, 12, 31), DAY) <= 7, "Güncel", "Gecikmeli")', hint: 'Önce VAR Son = MAX(Satislar[Tarih]); sonra IF(DATEDIFF(Son, DATE(2024, 12, 31), DAY) <= 7, "Güncel", "Gecikmeli").' },
    { t: 'query', q: 'Bir tazelik tablosu yaz: her satış kanalı (<code>Satislar[Kanal]</code>) için son satış tarihi ("Son Satış") ve satır sayısı ("Satır").', start: 'EVALUATE\n', sol: 'EVALUATE\nSUMMARIZECOLUMNS(\n    Satislar[Kanal],\n    "Son Satış", MAX(Satislar[Tarih]),\n    "Satır", COUNTROWS(Satislar)\n)', hint: 'SUMMARIZECOLUMNS(Satislar[Kanal], "Son Satış", MAX(Satislar[Tarih]), "Satır", COUNTROWS(Satislar)).' }
  ]
});

/* ---------- 2. Fabric’te veriyi hazırlamak (Fabric) ---------- */
add('fabric-giris', {
  id: 'fabric-hazirlama', lv: 'C1', mod: 'Fabric', min: 30,
  title: 'Fabric’te veriyi hazırlamak: T-SQL görünümleri, saklı yordamlar, not defterleri ve işlem hatları',
  sum: 'Doğru depoyu seçmek, ambarda görünüm, fonksiyon ve saklı yordam yazmak, PySpark not defterinde temizlik, görsel sorgu düzenleyici, işlem hatlarıyla düzenleme, yinelenen/eksik/null veri ve tür dönüşümü, anlam modeli için düzleştirme ve önceden toplama, OneLake kataloğu.',
  body: `
<p>DP-600 sınavında en ağır alan, yaklaşık yarı ağırlıkla <b>veriyi hazırlamak</b>tır. Power BI geliştiricisi için bu, Power Query’de yaptığın işin bir katman aşağıya, lakehouse ve ambara inmesi demektir. Bu ders “Microsoft Fabric’e giriş” dersinin devamıdır: orada parçaları tanıdın, burada onlarla Anadolu Market’in satış verisini temizleyip modele hazır hâle getireceksin. Yıldız şema, vekil anahtar ve SCD Tip 2 ayrıntıları “Fabric’te yıldız şema” dersinde; burada tekrar etmiyoruz.</p>

<h2>Önce depoyu seç</h2>
<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>Depo</th><th>Neden?</th></tr>
<tr><td>Ham dosyalar (CSV, JSON) + Spark ile temizlik</td><td>Lakehouse</td><td>Dosyalar ve Delta tablolar bir arada; SQL analiz uç noktası salt okunur sorgu verir</td></tr>
<tr><td>T-SQL ile INSERT/UPDATE/MERGE, saklı yordamlar, SQL ekibi</td><td>Ambar (warehouse)</td><td>Tam okuma-yazma T-SQL</td></tr>
<tr><td>Saniyeler içinde gelen olay, log, tıklama verisi</td><td>Eventhouse (KQL veritabanı)</td><td>Zamana göre düzenlenmiş akış verisi; KQL ile sorgu</td></tr>
</table></div>
<p>Tipik düzen: ham veri lakehouse’ta, temizlenmiş ve modele hazır tablolar ambarda ya da yine lakehouse’ta. Gerçek zamanlı kısım “Gerçek zamanlı analitik” dersinde.</p>

<h2>Ambarda T-SQL: görünüm, fonksiyon, saklı yordam</h2>
<p>Fabric ambarı tablolar, görünümler, saklı yordamlar ve fonksiyonları destekler. Lakehouse’un SQL analiz uç noktasında da görünüm, fonksiyon ve yordam tanımlayabilirsin; ama orada tablo oluşturma, INSERT, UPDATE ve DELETE <b>yoktur</b>, çünkü tabloları Spark ya da veri akışı yazar.</p>
<p><b>Görünüm (view):</b> Temizlik kuralını tek yerde tutar. Aşağıdaki görünüm iptalleri ayıklar, tutarı ondalık sayıya çevirir ve ürün kategorisini satırın yanına getirir:</p>
<pre data-notry>CREATE VIEW dbo.vw_SatisTemiz AS
SELECT  s.SiparisNo,
        s.SatirNo,
        CAST(s.Tarih AS date)            AS Tarih,
        s.MusteriNo,
        s.UrunNo,
        u.Kategori,
        s.Kanal,
        CAST(s.Tutar AS decimal(18, 2))  AS Tutar,
        COALESCE(s.Indirim, 0)           AS Indirim
FROM    dbo.Satislar AS s
JOIN    dbo.Urunler  AS u ON u.UrunNo = s.UrunNo
WHERE   s.Durum &lt;&gt; 'İptal';</pre>
<p><b>Satır içi tablo değerli fonksiyon:</b> Parametre alan bir görünüm gibi düşün. Örneğin tek bir kanalın satışlarını döndürür:</p>
<pre data-notry>CREATE FUNCTION dbo.fn_KanalSatis (@Kanal varchar(20))
RETURNS TABLE
AS
RETURN
    SELECT Tarih, Kategori, SUM(Tutar) AS Tutar
    FROM   dbo.vw_SatisTemiz
    WHERE  Kanal = @Kanal
    GROUP BY Tarih, Kategori;

-- Kullanım
SELECT * FROM dbo.fn_KanalSatis('Web');</pre>
<p><b>Saklı yordam (stored procedure):</b> Birden çok adımı tek komutta toplar ve işlem hattından çağrılır. Bu yordam aylık özet tabloyu baştan kurar:</p>
<pre data-notry>CREATE PROCEDURE dbo.usp_AylikOzetYenile
AS
BEGIN
    DELETE FROM dbo.AylikKategoriOzet;

    INSERT INTO dbo.AylikKategoriOzet (YilAy, Kategori, NetSatis, Adet)
    SELECT  FORMAT(Tarih, 'yyyy-MM'), Kategori, SUM(Tutar), COUNT(*)
    FROM    dbo.vw_SatisTemiz
    GROUP BY FORMAT(Tarih, 'yyyy-MM'), Kategori;
END;</pre>
<div class="note"><b>Learn’de önizleme olanlar</b>T-SQL yüzey alanı sayfasında iç içe CTE, <code>ALTER TABLE … ALTER COLUMN</code>, düzenli ifade (regex) fonksiyonları ve birçok yapay zekâ fonksiyonu <b>önizleme</b> olarak işaretli. Tetikleyici (trigger), gerçekleştirilmiş görünüm (materialized view) ve özyinelemeli sorgu ambarda desteklenmiyor. <code>MERGE</code> ise genel kullanımda.</div>

<h2>Not defterinde PySpark ile temizlik</h2>
<p>Hacim büyüyünce ya da mantık SQL’e sığmayınca not defteri (notebook) kullanılır. PySpark DataFrame’i, pandas’a benzer ama veriyi birçok makineye dağıtarak işler. Aşağıdaki hücre ham satış tablosunu okur, temizler ve Delta tablo olarak yazar:</p>
<pre data-notry>from pyspark.sql import functions as F

ham = spark.read.table("ham_satislar")

temiz = (
    ham
    .dropDuplicates(["SiparisNo", "SatirNo"])              # yinelenen satırlar
    .withColumn("Tutar", F.col("Tutar").cast("decimal(18,2)"))   # tür dönüşümü
    .withColumn("Tarih", F.to_date("Tarih", "dd.MM.yyyy"))
    .withColumn("Kanal", F.trim(F.col("Kanal")))
    .fillna({"Indirim": 0})                                # eksik indirim = 0
    .filter(F.col("Durum") != "İptal")
)

temiz.write.mode("overwrite").format("delta").saveAsTable("satislar_temiz")</pre>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>PySpark</th><th>pandas</th><th>Power Query</th></tr>
<tr><td>Yinelenenleri kaldır</td><td><code>dropDuplicates([...])</code></td><td><code>drop_duplicates(subset=[...])</code></td><td>Yinelenenleri kaldır</td></tr>
<tr><td>Boşu doldur</td><td><code>fillna({...})</code></td><td><code>fillna({...})</code></td><td>Değerleri değiştir</td></tr>
<tr><td>Tür değiştir</td><td><code>cast("int")</code></td><td><code>astype("int")</code></td><td>Veri türü</td></tr>
<tr><td>Satır filtrele</td><td><code>filter(...)</code></td><td><code>df[df.Durum != "İptal"]</code></td><td>Satırları filtrele</td></tr>
</table></div>
<p>Küçük tablolarda Fabric’in Python (Spark’sız) not defterleri ve pandas yeterli olabilir; büyük tabloda Spark tercih edilir.</p>

<h2>Görsel sorgu düzenleyici</h2>
<p>SQL yazmak istemeyen kullanıcılar için ambarda ve SQL analiz uç noktasında <b>görsel sorgu düzenleyici</b> (visual query editor) var. Power Query’nin diyagram görünümünü kullanır: tabloları tuvale sürükler, “Sorguları yeni olarak birleştir” gibi adımlar eklersin.</p>
<ul>
<li><b>SQL’i görüntüle</b> ile adımların T-SQL karşılığını görürsün.</li>
<li><b>Görünüm olarak kaydet</b> sonucu bir SQL görünümüne, <b>Tablo olarak kaydet</b> ise <code>CREATE TABLE AS SELECT</code> ile tabloya çevirir.</li>
<li>Yalnızca okuma (SELECT) yapar ve yalnızca katlanabilen (query folding) Power Query adımlarını sunar. Bir adım SQL’e çevrilemezse görünüm olarak kaydedilemez.</li>
</ul>

<h2>İşlem hatları: kopyala, çalıştır, zamanla</h2>
<p>İşlem hattı (pipeline) adımları sıraya koyar. Anadolu Market’in gece hattı:</p>
<ol>
<li><b>Veri kopyala (Copy data)</b> etkinliği: ERP’deki satış tablosunu lakehouse’un ham bölümüne taşır.</li>
<li><b>Fabric not defteri</b> etkinliği: yukarıdaki temizlik hücresini çalıştırır.</li>
<li><b>Saklı yordam</b> etkinliği: <code>usp_AylikOzetYenile</code> çağrılır.</li>
<li><b>Anlam modeli yenileme</b> etkinliği: modeli yeniler (Direct Lake’te çerçeveleme).</li>
<li>Herhangi bir adım hata verirse <b>Teams</b> etkinliği ekibe mesaj atar; <b>If condition</b> ve <b>ForEach</b> ile koşul ve döngü kurulur.</li>
</ol>
<p>Hat <b>Zamanla</b> düğmesiyle belirli aralıkta, <b>Tetikleyici</b> ile de bir olayda (ör. göle yeni dosya düştüğünde) çalışır. Yalnızca kaynaktan hedefe veri taşıyacaksan işlem hattı kurmadan <b>Kopyalama işi</b> (Copy job) da kullanılabilir; ilk çalışmada tam, sonra yalnızca yeni ve değişen satırları kopyalar.</p>

<h2>Kirli veri: yinelenen, eksik, null ve tür</h2>
<p>Temizliğe başlamadan önce ölç. Anadolu Market modelinde birkaç kontrol yapalım:</p>
<pre class="dax">EVALUATE
ROW(
    "Satır", COUNTROWS(Satislar),
    "Farklı sipariş", DISTINCTCOUNT(Satislar[SiparisNo]),
    "Farklı satır no", DISTINCTCOUNT(Satislar[SatirNo])
)</pre>
<p>1.620 satır, 910 farklı sipariş, 1.620 farklı satır numarası. Yani bir siparişin birden çok satırı var (bu normal, tanecik sipariş satırı), ama <b>anahtar</b> olan satır numarası hiç tekrar etmiyor: yinelenen kayıt yok. Yinelenen kontrolü her zaman tablonun anahtarıyla yapılır.</p>
<p>Müşteri tablosunda ise 150 kayıt ve 140 farklı ad var. Bu yinelenme mi? Hayır: müşteri numaraları 150 farklı. Aynı adı taşıyan farklı kişiler var. Adı anahtar sanıp “yinelenenleri kaldır” dersen gerçek müşterileri silersin.</p>
<div class="tbl-wrap"><table>
<tr><th>Bulgu</th><th>Sayı</th><th>Karar</th></tr>
<tr><td><code>Satislar[KargoGun]</code> boş</td><td>131 satır: 121’i iptal, 10’u hâlâ kargoda</td><td>Doldurma! Boşluk anlamlı: teslim olmamış sipariş. Ortalama kargo günü boşları zaten saymaz.</td></tr>
<tr><td><code>Musteriler[Bolge]</code> ve <code>[Sehir]</code> boş</td><td>7 müşteri, 63.853 ₺ net satış</td><td>Silme; “Bilinmiyor” üyesine ata ve kaynağa geri bildir.</td></tr>
<tr><td>Ad tekrarı</td><td>150 kayıt, 140 farklı ad</td><td>Yinelenme değil; anahtar MusteriNo.</td></tr>
</table></div>
<p>Tür dönüşümünde iki kural: tarihleri metin olarak bırakma (zaman zekâsı çalışmaz) ve para tutarını <code>float</code> yerine <code>decimal</code> tut (toplamlarda kuruş kayması olmasın). Dönüşüm hatasında satırı sessizce atmak yerine hatalı satırları ayrı bir tabloya yaz ve say.</p>

<h2>Düzleştir ve önceden topla</h2>
<p>Anlam modeli için iki hazırlık daha var:</p>
<ul>
<li><b>Düzleştirme (denormalize):</b> Ürün → alt kategori → kategori zincirini tek ürün boyutuna indir. Modelde daha az ilişki, daha basit DAX.</li>
<li><b>Önceden toplama (pre-aggregate):</b> Yöneticiler yalnızca ay × kategori düzeyine bakıyorsa, milyonlarca satırı her sorguda toplamak yerine özet tabloyu ambarda hazırla (yukarıdaki saklı yordam). Modelde bu tabloyu toplama tablosu olarak kullanabilirsin (“Kurumsal model” dersi).</li>
</ul>
<p>Özet tablonun doğru olup olmadığını DAX ile de kontrol edebilirsin. Ambarda <code>GROUP BY</code> ne yapıyorsa, DAX’ta <code>SUMMARIZECOLUMNS</code> aynısını yapar:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Tarih[Yil],
    Urunler[Kategori],
    "Net Satış", [Net Satış],
    "Adet", [Satılan Adet]
)</pre>
<p>1.620 satış satırı, yıl × kategori düzeyinde 21 satıra iner. Ambardaki özet tablonun toplamları bu sorguyla aynı değilse, ya temizlik kuralı (iptaller) ya da tarih dönüşümü farklıdır.</p>

<h2>OneLake kataloğu: veriyi bul, yönet, koru</h2>
<p>Hazırladığın tabloyu başkalarının bulması gerekir. <b>OneLake kataloğu</b> (OneLake catalog), Fabric gezinti bölmesindeki OneLake simgesiyle açılır ve üç sekmeden oluşur:</p>
<ul>
<li><b>Keşfet (Explore):</b> Lakehouse, ambar, anlam modeli gibi öğeleri ara, filtrele, ayrıntılarını gör. Desktop’ta bir modele bağlanırken de bu kataloğu kullanırsın.</li>
<li><b>Yönet (Govern):</b> Sahip olduğun verinin yönetişim sağlığı ve önerilen eylemler.</li>
<li><b>Güvenlik (Secure):</b> Çalışma alanı rolleri ve OneLake güvenlik rolleri tek ekranda.</li>
</ul>
<p>Akış verisi için katalogun karşılığı <b>Real-Time hub</b>’dır; bir sonraki derste.</p>
`,
  ex: [
    { t: 'mc', q: 'Lakehouse’un SQL analiz uç noktasında hangisini <b>yapamazsın</b>?', o: ['Bir görünüm (view) oluşturmak', 'Bir saklı yordam tanımlamak', 'Tabloya INSERT ile satır eklemek', 'Delta tabloyu SELECT ile okumak'], a: 2, why: 'SQL analiz uç noktasında görünüm, fonksiyon ve yordam tanımlanabilir; ama tablo oluşturma ve INSERT/UPDATE/DELETE yalnızca ambarda desteklenir. Lakehouse tablolarını Spark ya da veri akışı yazar.' },
    { t: 'mc', q: 'Müşteri tablosunda 150 kayıt ve 140 farklı ad var; müşteri numaraları 150 farklı. Doğru karar hangisi?', o: ['Aynı adlı 10 kaydı silmek', 'Adları birleştirip tek satıra indirmek', 'Kayıt yinelenmiş sayılmaz; anahtar no', 'Ad sütununu modelden çıkarmak'], a: 2, why: 'Yinelenme anahtarla ölçülür. Numaralar benzersizse aynı adı taşıyan farklı müşteriler vardır; ada göre yinelenen kaldırmak gerçek müşterileri siler.' },
    { t: 'mc', q: '131 satış satırında <code>KargoGun</code> boş: 121’i iptal, 10’u hâlâ kargoda. En doğru yaklaşım?', o: ['Boşları 0 ile doldurmak', 'Boşları ortalama kargo günüyle doldurmak', 'Boşluğu anlamlı kabul edip bırakmak', 'Bu 131 satırı tablodan silmek'], a: 2, why: 'Boşluk burada “teslim olmadı” demektir. 0 ya da ortalama ile doldurmak ortalama kargo gününü bozar; satırı silmek ise satış ve iptal oranlarını bozar.' },
    { t: 'mc', q: 'Görsel sorgu düzenleyicide kurduğun sorgu “görünüm olarak kaydedilemez” uyarısı veriyor. En olası neden?', o: ['Sorgu iki tabloyu birleştiriyor', 'Bir adım SQL’e çevrilemiyor', 'Kullanıcının ambarda okuma izni yok', 'Sorgu bir ORDER BY içermiyor'], a: 1, why: 'Görsel sorgu düzenleyici yalnızca katlanabilen adımları T-SQL’e çevirir. Tam çevrilemeyen bir sorgu ambar görünümü olarak kaydedilemez.' },
    { t: 'mc', q: 'Gece hattında saklı yordam başarısız olursa anlam modeli <b>yenilenmemeli</b> ve ekip haberdar olmalı. Bunu hangisi en iyi sağlar?', o: ['Yordamı ve modeli ayrı saatlere zamanlamak', 'İşlem hattında başarı/hata yolları', 'Modelde artımlı yenilemeyi açmak', 'Yordamı bir görünüme dönüştürmek'], a: 1, why: 'İşlem hattında etkinlikler başarı ve hata bağlantılarıyla zincirlenir: yordam başarılıysa model yenilenir, hata verirse Teams etkinliği çalışır. Ayrı zamanlama bağımlılığı bilmez.' },
    { t: 'dax', name: 'Ek Sipariş Satırı', q: '<b>Ek Sipariş Satırı</b>: SQL’deki <code>COUNT(*) - COUNT(DISTINCT SiparisNo)</code> kontrolünü DAX’la yaz: Satislar satır sayısından farklı sipariş numarası sayısını çıkar. Sonuç, siparişlerin ilk satırından sonra gelen satır sayısıdır.', sol: 'COUNTROWS(Satislar) - DISTINCTCOUNT(Satislar[SiparisNo])', hint: 'COUNTROWS(Satislar) - DISTINCTCOUNT(Satislar[SiparisNo]).' },
    { t: 'dax', name: 'Bölgesiz Müşteri Satışı', q: '<b>Bölgesiz Müşteri Satışı</b>: Bölgesi boş olan müşterilerin (<code>Musteriler[Bolge]</code>) net satışını hesapla. Bu sayı, “Bilinmiyor” üyesine atanacak verinin büyüklüğünü gösterir.', sol: 'CALCULATE([Net Satış], ISBLANK(Musteriler[Bolge]))', hint: 'CALCULATE([Net Satış], ISBLANK(Musteriler[Bolge])).' },
    { t: 'query', q: 'Ambardaki aylık özet tabloyu doğrulamak için bir ön toplama sorgusu yaz: her <code>Tarih[YilAy]</code> ve <code>Urunler[Kategori]</code> için "Net Satış" ([Net Satış]) ve "Adet" ([Satılan Adet]).', start: 'EVALUATE\n', sol: 'EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[YilAy],\n    Urunler[Kategori],\n    "Net Satış", [Net Satış],\n    "Adet", [Satılan Adet]\n)', hint: 'SUMMARIZECOLUMNS içinde önce iki gruplama sütunu, sonra iki ad–ölçü çifti.' }
  ]
});

/* ---------- 3. Gerçek zamanlı analitik: Eventhouse, KQL (Fabric) ---------- */
add('fabric-hazirlama', {
  id: 'kql-gercek-zaman', lv: 'C1', mod: 'Fabric', min: 28,
  title: 'Gerçek zamanlı analitik: Eventhouse, KQL ve gerçek zamanlı panolar',
  sum: 'Real-Time hub, eventstream ve eventhouse ile akış verisi; KQL’in temel işleçleri (where, project, summarize, bin, render); aynı sorunun KQL, SQL ve DAX karşılıkları; gerçek zamanlı pano ile DirectQuery ve otomatik sayfa yenileme karşılaştırması; Activator uyarıları ve OneLake ile entegrasyon.',
  body: `
<p>Anadolu Market’in web sitesinde her tıklama bir olaydır: ziyaret, ürün görüntüleme, sepete ekleme, ödeme, satın alma. Kampanya günü pazarlama ekibi “sepete ekleyenler ödemeye geçiyor mu?” sorusunun cevabını yarın sabah değil, <b>şimdi</b> istiyor. Gece yenilenen bir Import model buna cevap veremez. Fabric’te bu işin adı <b>Real-Time Intelligence</b> (gerçek zamanlı zekâ) iş yüküdür.</p>

<h2>Akış verisinin yolculuğu</h2>
<div class="tbl-wrap"><table>
<tr><th>Parça</th><th>Ne yapar?</th></tr>
<tr><td>Real-Time hub</td><td>Kuruluştaki akış verisini bulmak, eklemek ve paylaşmak için merkezi katalog</td></tr>
<tr><td>Eventstream</td><td>Olayları kodsuz toplar, dönüştürür ve hedeflere yönlendirir (eventhouse, lakehouse, Activator…)</td></tr>
<tr><td>Eventhouse ve KQL veritabanı</td><td>Zaman damgalı akış verisi için analiz motoru; veriyi geliş zamanına göre düzenler. Tablolar eventhouse içindeki KQL veritabanlarında durur.</td></tr>
<tr><td>KQL sorgu kümesi (queryset)</td><td>KQL ya da T-SQL ile sorgu yazdığın ortam</td></tr>
<tr><td>Gerçek zamanlı pano (Real-Time Dashboard)</td><td>Her kutucuğu bir KQL sorgusu olan, canlı yenilenen pano</td></tr>
<tr><td>Activator (Fabric Activator)</td><td>Veride bir koşul oluşunca e-posta, Teams mesajı, Power Automate akışı ya da bir Fabric öğesi çalıştırır</td></tr>
</table></div>
<p>Hangi deponun ne zaman seçileceğini “Fabric’te veriyi hazırlamak” dersinde gördün: saniyelik olay ve log verisi eventhouse’a gider.</p>

<h2>KQL’e ilk adım</h2>
<p>KQL (Kusto Query Language), bir tabloyla başlar ve satırları <code>|</code> (boru) ile bir işleçten diğerine aktarır. Okuma sırası yazma sırasıdır: “tabloyu al, süz, seç, özetle, çiz”. Örneklerde eventhouse’ta duran hayalî bir tıklama tablosu kullanıyoruz: <code>TiklamaAkisi(Zaman, ZiyaretciNo, AdimNo, Adim, Cihaz, Kaynak)</code>.</p>
<pre data-notry>// Son 1 saatte mobilden gelen olayların ilk 10 satırı
TiklamaAkisi
| where Zaman &gt; ago(1h) and Cihaz == "Mobil"
| project Zaman, ZiyaretciNo, Adim, Kaynak
| take 10</pre>
<ul>
<li><b>where</b>: satırları süzer (SQL’de WHERE, DAX’ta FILTER ya da CALCULATE filtresi). Eşitlik <code>==</code> ile yazılır.</li>
<li><b>project</b>: sütun seçer ya da yeniden adlandırır (SQL’de SELECT listesi, DAX’ta SELECTCOLUMNS).</li>
<li><b>extend</b>: hesaplanan yeni sütun ekler (DAX’ta ADDCOLUMNS).</li>
<li><b>take</b>: ilk N satır; <code>limit</code> ile aynıdır.</li>
</ul>
<pre data-notry>// Saatlik olay sayısı ve benzersiz ziyaretçi, zaman grafiği olarak
TiklamaAkisi
| where Zaman &gt; ago(1d)
| summarize Olay = count(), Ziyaretci = dcount(ZiyaretciNo) by bin(Zaman, 1h)
| render timechart</pre>
<ul>
<li><b>summarize … by</b>: gruplar ve toplar (SQL’de GROUP BY, DAX’ta SUMMARIZECOLUMNS).</li>
<li><b>bin(Zaman, 1h)</b>: zamanı saatlik kovalara yuvarlar. Learn’e göre tarih sütunları için otomatik saatlik kova artık yok; <code>bin</code> açıkça yazılmalı.</li>
<li><b>render</b>: sonucu grafik olarak çizer (timechart, columnchart…).</li>
</ul>
<div class="warn"><b>dcount bir tahmindir</b>KQL’de <code>dcount()</code> performans için yaklaşık sonuç verir; varsayılan doğrulukta küçük kümelerde tam sayar, büyük kümelerde küçük bir hata payı olabilir. DAX’taki <code>DISTINCTCOUNT</code> ise her zaman tam sayar. İki aracın sonucu çok büyük tablolarda birebir tutmayabilir.</div>

<h2>Aynı soru üç dilde</h2>
<p>DP-600, veriyi görsel sorgu düzenleyiciyle, SQL ile, KQL ile ve DAX ile süzüp toplayabilmeni ister. Soru: “Altı saatlik dilimlerde kaç olay var?”</p>
<div class="tbl-wrap"><table>
<tr><th>Dil</th><th>Sorgu</th></tr>
<tr><td>KQL</td><td><code>TiklamaAkisi | summarize Olay = count() by Dilim = bin(Saat, 6)</code></td></tr>
<tr><td>T-SQL</td><td><code>SELECT (Saat / 6) * 6 AS Dilim, COUNT(*) AS Olay FROM TiklamaAkisi GROUP BY (Saat / 6) * 6</code></td></tr>
<tr><td>DAX</td><td>Aşağıdaki sorgu</td></tr>
</table></div>
<p>Bu uygulamanın modelinde aynı yapıda bir tablo var: <code>WebOlaylari</code> (Ekim–Kasım 2024, 2.019 olay, 900 ziyaretçi). DAX’ta kovaları <code>GENERATESERIES</code> ile üretip her kovadaki olayları sayabilirsin:</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    GENERATESERIES(0, 18, 6),
    "Olay", COUNTROWS(FILTER(WebOlaylari, WebOlaylari[Saat] &gt;= [Value] &amp;&amp; WebOlaylari[Saat] &lt; [Value] + 6))
)</pre>
<p>Sonuç: 00–06 arası 513, 06–12 arası 513, 12–18 arası 502, 18–24 arası 491 olay. Gün içinde belirgin bir tepe yok; trafik dengeli dağılıyor.</p>

<h2>Huniyi KQL ile okumak</h2>
<p>Huni sorusunda her adımda kaç farklı ziyaretçi kaldığını sayarız. KQL’de koşullu toplayıcılar işi tek satırda yapar:</p>
<pre data-notry>TiklamaAkisi
| where Zaman between (datetime(2024-10-01) .. datetime(2024-11-30))
| summarize Ziyaret   = dcountif(ZiyaretciNo, AdimNo == 1),
            Odeme     = dcountif(ZiyaretciNo, AdimNo == 4),
            SatinAlma = dcountif(ZiyaretciNo, AdimNo == 5)
          by Cihaz
| extend OdemedenSatisa = round(100.0 * SatinAlma / Odeme, 1)</pre>
<p>DAX’ta aynı mantık, hazır <code>[Ziyaretçi]</code> ölçüsünü adım filtresiyle CALCULATE içine almaktır. Modelde huni 900 → 640 → 254 → 137 → 88 ziyaretçi. Ödeme adımına gelen 137 kişiden 88’i satın almış: yaklaşık %64,2. Cihaza göre bakınca masaüstünde %68,6, mobilde %59,7. Mobil ödeme sayfası ilk bakılacak yer.</p>
<pre class="dax">Ödemeden Satışa % =
DIVIDE(
    CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 5),
    CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 4)
)</pre>
<p>Huni görselinin kurulumu ve adım oranlarının raporda gösterimi “Vaka: e-ticaret dönüşüm hunisi ve kargo” dersinde var.</p>

<h2>Gerçek zamanlı pano mu, Power BI raporu mu?</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Gerçek zamanlı pano</th><th>Power BI + DirectQuery + otomatik sayfa yenileme</th></tr>
<tr><td>Sorgu dili</td><td>Her kutucuk bir KQL sorgusu</td><td>DAX; motor kaynağa sorgu (ör. KQL ya da SQL) gönderir</td></tr>
<tr><td>Yenileme</td><td>Canlı yenileme: yeni veri gelince görseller güncellenir; yenileme hızı sınırı ayarlanır</td><td>Sabit aralık ya da değişiklik algılama. Paylaşılan kapasitede en az 30 dakika; ayrılmış kapasitede (Fabric F, Premium, PPU) yönetici izin verirse saniyeler; varsayılan alt sınır 5 dakika (değişiklik algılamada 5 saniye)</td></tr>
<tr><td>Güçlü yanı</td><td>Operasyon ekranı: son dakikalar, log, hızlı keşif</td><td>Zengin görsel, yıldız şema, RLS, diğer verilerle birleştirme</td></tr>
<tr><td>Zayıf yanı</td><td>Kurumsal model, ölçü kütüphanesi yok</td><td>Kaynak her yenilemede sorgulanır; kapasite tüketir</td></tr>
</table></div>
<p>Otomatik sayfa yenileme yalnızca DirectQuery (ve bazı canlı bağlantı) senaryolarında çalışır; Import modelde yoktur. Direct Lake’te sabit aralık desteklenir, değişiklik algılama desteklenmez. Pratik ayrım: <b>vardiya ekranı</b> için gerçek zamanlı pano, <b>yönetim raporu</b> için Power BI.</p>

<h2>Activator ile eyleme geçmek</h2>
<p>Ekranı izleyen kimse yoksa gerçek zamanlı veri işe yaramaz. <b>Activator</b>, bir eventstream’den, gerçek zamanlı panodan ya da Power BI raporundan gelen veriyi nesne başına (ör. her ürün, her mağaza) izler ve kural sağlanınca eylem başlatır. Kurallar durumsuz (“değer 50’nin altında”) ya da durumlu (“azalıyor”, “30 dakikadır veri gelmiyor”) olabilir ve yalnızca duruma ilk girişte tetiklenir; aynı uyarı her olayda tekrar gelmez.</p>
<p>Örnek: “Mobil ödeme adımındaki dönüşüm 15 dakikalık pencerede %50’nin altına düşerse ödeme ekibinin Teams kanalına mesaj gönder.” Power BI tarafındaki uyarılar ve Power Automate ile eylem “Power Platform ile eyleme geçmek” dersinde anlatılıyor.</p>

<h2>OneLake ile bağlamak</h2>
<p>Gerçek zamanlı veri yalnız kalmamalı; geçmiş satışlarla birlikte analiz edilmeli. İki köprü var:</p>
<ul>
<li><b>Eventhouse OneLake erişilebilirliği</b> (OneLake availability): KQL veritabanındaki tablolar OneLake’e Delta Parquet biçiminde mantıksal bir kopya olarak açılır. Veritabanı ya da tablo düzeyinde açılır. Sonra lakehouse’tan kısayolla, not defterinden ya da Direct Lake modelden okunur. Learn’e göre ek depolama ücreti yoktur. Gecikme varsayılan olarak 3 saate kadar çıkabilir, 5 dakika ile 3 saat arasında ayarlanabilir. Açıkken tabloyu yeniden adlandıramaz, satır silemez, tabloya RLS uygulayamazsın.</li>
<li><b>Anlam modelleri için OneLake entegrasyonu</b>: Import modelin tabloları her yenilemede OneLake’e Delta tablo olarak yazılır. Böylece veri bilimci aynı “altın” veriyi Spark’la okur. Yalnızca Import tablolar yazılır; ölçüler, DirectQuery tabloları ve hesaplama grupları yazılmaz. Fabric F ya da Premium P kapasitesi gerekir.</li>
</ul>
<div class="tip"><b>Tasarım önerisi</b>Son birkaç günün olaylarını eventhouse’ta KQL ile canlı izle; daha eski olayları OneLake üzerinden lakehouse’a bağla ve satış modeline Direct Lake ile ekle. Böylece hem canlı ekran hem de yıllık eğilim aynı veriden beslenir.</div>
`,
  ex: [
    { t: 'mc', q: 'Kuruluştaki akış verisi kaynaklarını (ör. bir eventstream) bulup paylaşmak için Fabric’te hangi merkezi katalog kullanılır?', o: ['OneLake kataloğu Yönet sekmesi', 'Real-Time hub', 'Dağıtım işlem hattı', 'KQL sorgu kümesi'], a: 1, why: 'Real-Time hub, kuruluştaki akış verisini bulmak, eklemek, keşfetmek ve paylaşmak için merkezi katalogdur. OneLake kataloğu öğeleri, KQL sorgu kümesi ise sorgu yazmayı sağlar.' },
    { t: 'mc', q: '<code>TiklamaAkisi | summarize count() by bin(Zaman, 15m)</code> sorgusu ne döndürür?', o: ['Son 15 dakikadaki olayların sayısı', 'Her 15 dakikalık zaman dilimindeki olay sayısı', 'Zaman sütununun 15 dakikaya yuvarlanmış listesi', 'En çok olay olan 15 zaman dilimi'], a: 1, why: '<code>bin</code> zamanı 15 dakikalık kovalara yuvarlar, <code>summarize … by</code> her kovada satırları sayar. Son 15 dakikayı süzmek için <code>where Zaman &gt; ago(15m)</code> gerekirdi.' },
    { t: 'mc', q: 'Bir Import modelde otomatik sayfa yenilemeyi 10 saniyeye ayarlamak istiyorsun. Ne olur?', o: ['Paylaşılan kapasitede çalışır', 'Değişiklik algılamayla çalışır', 'Desteklenmez; DirectQuery gerekir', 'Ayrılmış kapasitede çalışır'], a: 2, why: 'Learn’e göre otomatik sayfa yenileme Import modelde desteklenmez; DirectQuery ve bazı canlı bağlantı senaryolarında çalışır. Import modelde veri ancak model yenilenince değişir.' },
    { t: 'mc', q: 'Eventhouse tablosunda OneLake erişilebilirliğini açtın. Hangisi <b>doğru</b>?', o: ['Veri Delta Parquet olarak OneLake’e açılır', 'Tabloya hemen RLS uygulayabilirsin', 'Veri yalnızca KQL ile okunabilir hâle gelir', 'Gecikme her zaman bir saniyenin altındadır'], a: 0, why: 'OneLake erişilebilirliği tabloyu Delta Parquet biçiminde mantıksal kopya olarak açar; Spark, SQL ve Direct Lake okuyabilir. Açıkken RLS uygulanamaz ve varsayılan gecikme 3 saate kadar çıkabilir.' },
    { t: 'query', q: 'KQL’deki <code>summarize Olay = count(), Ziyaretci = dcount(ZiyaretciNo) by bin(Zaman, 30d), Cihaz</code> sorgusunun DAX karşılığını yaz: her <code>Tarih[YilAy]</code> ve <code>WebOlaylari[Cihaz]</code> için "Olay" (satır sayısı) ve "Ziyaretçi" ([Ziyaretçi]).', start: 'EVALUATE\n', sol: 'EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[YilAy],\n    WebOlaylari[Cihaz],\n    "Olay", COUNTROWS(WebOlaylari),\n    "Ziyaretçi", [Ziyaretçi]\n)', hint: 'SUMMARIZECOLUMNS(Tarih[YilAy], WebOlaylari[Cihaz], "Olay", COUNTROWS(WebOlaylari), "Ziyaretçi", [Ziyaretçi]).' },
    { t: 'dax', name: 'Ödemeden Satışa %', q: '<b>Ödemeden Satışa %</b>: KQL’deki <code>dcountif(ZiyaretciNo, AdimNo == 5) / dcountif(ZiyaretciNo, AdimNo == 4)</code> oranını DAX’la yaz: satın alma adımına (AdimNo = 5) ulaşan ziyaretçileri ödeme adımına (AdimNo = 4) ulaşanlara böl.', sol: 'DIVIDE(CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 5), CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 4))', hint: 'İki CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = …) ifadesini DIVIDE ile böl.', grid: [{ t: 'WebOlaylari', c: 'Cihaz' }, { t: 'WebOlaylari', c: 'Kaynak' }] },
    { t: 'query', q: 'KQL’deki <code>summarize Olay = count() by bin(Saat, 6)</code> sorgusunu DAX’la yaz: <code>GENERATESERIES(0, 18, 6)</code> ile 0, 6, 12, 18 kovalarını üret ve her kovada <code>WebOlaylari[Saat]</code> değeri kova başlangıcı ile başlangıç + 6 arasında olan olayları "Olay" adıyla say.', start: 'EVALUATE\n', sol: 'EVALUATE\nADDCOLUMNS(\n    GENERATESERIES(0, 18, 6),\n    "Olay", COUNTROWS(FILTER(WebOlaylari, WebOlaylari[Saat] >= [Value] && WebOlaylari[Saat] < [Value] + 6))\n)', hint: 'GENERATESERIES’in sütun adı [Value]; ADDCOLUMNS içinde COUNTROWS(FILTER(WebOlaylari, Saat >= [Value] && Saat < [Value] + 6)).' }
  ]
});

/* ---------- 4. Gömme, REST API, otomasyon ve özel görseller (Yönetim ve Güvenlik) ---------- */
add('yasam-dongusu', {
  id: 'embed-api', lv: 'C1', mod: 'Yönetim ve Güvenlik', min: 30,
  title: 'Power BI’ı uygulamalara taşımak: gömme, REST API, otomasyon ve özel görseller',
  sum: 'Kuruluş için gömme ile müşteriler için gömme, hizmet sorumlusu ve gömme belirteci, etkin kimlikle gömülü RLS, Power BI ve Fabric REST API ile yenileme, listeleme ve dışa aktarma, PowerShell cmdlet’leri, not defterinde semantic link ve özel görsel geliştirme.',
  body: `
<p>Buraya kadar raporlar Power BI hizmetinde yaşadı. Ama Anadolu Market’in iki yeni isteği var: bayiler kendi satışlarını Anadolu Market’in <b>bayi portalında</b> görsün (bayilerin Power BI hesabı yok), ve BT ekibi her gece yüzlerce yenilemeyi <b>elle değil, kodla</b> yönetsin. Bu ders bir BI geliştiricisinin “rapor yazmanın ötesindeki” araç kutusudur.</p>

<h2>İki gömme senaryosu</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Kuruluşun için gömme (user owns data)</th><th>Müşterilerin için gömme (app owns data)</th></tr>
<tr><td>Kim izler?</td><td>Şirket çalışanları, kendi Microsoft Entra hesaplarıyla</td><td>Dış kullanıcılar (bayi, müşteri); Power BI hesabı gerekmez</td></tr>
<tr><td>Kimlik</td><td>Kullanıcı oturum açar; izinler hizmetteki gibi</td><td>Uygulama kendi kimliğiyle (hizmet sorumlusu) belirteç üretir</td></tr>
<tr><td>Lisans</td><td>İzleyicide Pro/PPU ya da içerik uygun kapasitede</td><td>Kapasite gerekir: Fabric F, Premium P ya da Power BI Embedded; Pro/PPU üretim için yetmez</td></tr>
<tr><td>Tipik yer</td><td>Şirket intraneti, SharePoint, iç uygulama</td><td>SaaS ürünü, müşteri portalı</td></tr>
</table></div>
<p>Learn, Premium P SKU’larının satıştan kaldırıldığını ve yeni projelerde Fabric F SKU’larının düşünülmesini öneriyor. Kodsuz bir seçenek de var: Power Pages raporu kod yazmadan gömebilir.</p>

<h2>Hizmet sorumlusu ve gömme belirteci</h2>
<p>Müşteriler için gömmede akış şöyledir:</p>
<ol>
<li>Microsoft Entra’da bir uygulama kaydı oluşturulur; bu uygulamanın kimliği <b>hizmet sorumlusudur</b> (service principal). Bir Power BI yöneticisi kiracı ayarlarında “Hizmet sorumlularının Power BI API’lerini kullanmasına izin ver” seçeneğini açar ve sorumluyu izinli gruba ekler. Sorumlu, çalışma alanına Üye ya da Yönetici olarak eklenir.</li>
<li>Uygulamanın sunucu tarafı, sorumlunun gizli anahtarı ya da sertifikasıyla Entra’dan bir <b>erişim belirteci</b> alır.</li>
<li>Bu belirteçle Power BI REST API’den rapor için bir <b>gömme belirteci</b> (embed token) ister.</li>
<li>Tarayıcıdaki sayfa, gömme belirteciyle raporu bir iframe içinde açar.</li>
</ol>
<p>Ana kullanıcı (master user) hesabıyla da gömme yapılabilir, ama Learn üretim için hizmet sorumlusunu öneriyor: daha güvenli, otomasyona daha uygun ve sayfalandırılmış raporları da destekliyor.</p>
<pre data-notry>POST https://api.powerbi.com/v1.0/myorg/GenerateToken
Authorization: Bearer {sorumlunun-erişim-belirteci}
Content-Type: application/json

{
  "reports":  [ { "id": "{raporId}" } ],
  "datasets": [ { "id": "{modelId}" } ],
  "identities": [
    {
      "username": "bayi-izmir-07",
      "roles":    [ "BayiRolu" ],
      "datasets": [ "{modelId}" ]
    }
  ]
}</pre>

<h2>Gömülü RLS: etkin kimlik</h2>
<p>Bayiler Power BI’da oturum açmadığı için Power BI onların kim olduğunu bilmez. Bunu uygulama söyler: gömme belirteci isterken <b>etkin kimlik</b> (effective identity) gönderir. Yukarıdaki istekte <code>username</code>, modeldeki dinamik rolde <code>USERNAME()</code> ya da <code>USERPRINCIPALNAME()</code> fonksiyonunun döndüreceği değerdir; <code>roles</code> uygulanacak rol, <code>datasets</code> modeldir.</p>
<div class="warn"><b>İki kritik kural</b>Hizmet sorumlusuyla RLS’li bir model için kimlik ya da rol göndermezsen belirteç üretimi hata verir. Ana kullanıcıyla ise belirteç üretilir ama filtre uygulanmaz ve tüm veri görünür. Ayrıca tarayıcıda JavaScript ile eklenen filtreler güvenlik değildir; kullanıcı onları kaldırabilir. Güvenlik yalnızca RLS ile sağlanır.</div>
<p>Dinamik RLS’nin model tarafı “Satır ve nesne düzeyinde güvenlik” dersinde anlatıldı. Aynı mantığı bir ölçüyle deneyebilirsin. Bu uygulamada <code>USERPRINCIPALNAME()</code> sabit bir test kullanıcısı döndürür (ayse.kaya@anadolumarket.com). Küçük bir yetki tablosu, bu kullanıcının Ege ve Akdeniz bölgelerini görmesini söylüyor:</p>
<pre class="dax">Benim Bölgelerim Satışı =
VAR Yetkiler =
    DATATABLE(
        "Eposta", STRING, "Bolge", STRING,
        {
            {"ayse.kaya@anadolumarket.com", "Ege"},
            {"ayse.kaya@anadolumarket.com", "Akdeniz"},
            {"selim.aksoy@anadolumarket.com", "Marmara"}
        }
    )
VAR Bolgelerim =
    SELECTCOLUMNS(FILTER(Yetkiler, [Eposta] = USERPRINCIPALNAME()), "Bolge", [Bolge])
RETURN
    CALCULATE([Net Satış], TREATAS(Bolgelerim, Musteriler[Bolge]))</pre>
<p>Sonuç 310.138 ₺: Ege (146.768 ₺) ile Akdeniz (163.370 ₺) toplamı. Gömülü senaryoda <code>username</code> alanına “bayi-izmir-07” gönderilseydi, aynı fonksiyon o değeri döndürür ve yetki tablosunda o bayinin satırı aranırdı.</p>

<h2>Tarayıcı tarafı: istemci API’si</h2>
<p>Sayfada gömme için <code>powerbi-client</code> JavaScript/TypeScript kitaplığı kullanılır. Bu kitaplıkla sayfalar arasında gezinme, filtre ve dilimleyici ayarlama, yer imleri ve olaylara (yüklendi, veri noktası seçildi) tepki verebilirsin. Learn’deki Power BI Embedded Analytics Playground denemek için örnek içerik sunar.</p>
<pre data-notry>import * as pbi from "powerbi-client";

const ayar: pbi.IEmbedConfiguration = {
  type: "report",
  id: raporId,
  embedUrl: gommeAdresi,
  accessToken: gommeBelirteci,            // sunucudan gelen embed token
  tokenType: pbi.models.TokenType.Embed,
  settings: { panes: { filters: { visible: false } } }
};

const servis = new pbi.service.Service(
  pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);

const rapor = servis.embed(document.getElementById("rapor-alani")!, ayar);
rapor.on("loaded", () =&gt; console.log("Rapor yüklendi"));</pre>
<p>Gömme belirtecinin süresi dolar; uygulama süre bitmeden yenisini isteyip <code>setAccessToken</code> ile raporu kesintisiz sürdürmelidir.</p>

<h2>REST API ile otomasyon</h2>
<p>Power BI REST API (<code>api.powerbi.com/v1.0/myorg</code>) ve Fabric REST API (<code>api.fabric.microsoft.com/v1</code>), hizmette elle yaptığın işlerin çoğunu kodla yapmanı sağlar. Sık kullanılanlar:</p>
<pre data-notry>// 1) Anlam modelini yenile (202 Accepted döner)
POST https://api.powerbi.com/v1.0/myorg/groups/{calismaAlaniId}/datasets/{modelId}/refreshes
{ "notifyOption": "MailOnFailure", "retryCount": 3 }

// 2) Yenileme geçmişini oku (durum takibi)
GET  https://api.powerbi.com/v1.0/myorg/groups/{calismaAlaniId}/datasets/{modelId}/refreshes?$top=10

// 3) Çalışma alanlarını listele (Fabric REST API)
GET  https://api.fabric.microsoft.com/v1/workspaces

// 4) Raporu PDF olarak dışa aktar: başlat, durumu sorgula, dosyayı al
POST https://api.powerbi.com/v1.0/myorg/groups/{calismaAlaniId}/reports/{raporId}/ExportTo
{ "format": "PDF" }

// 5) Bir Fabric işlem hattını isteğe bağlı çalıştır
POST https://api.fabric.microsoft.com/v1/workspaces/{calismaAlaniId}/items/{ogeId}/jobs/instances?jobType=Pipeline</pre>
<ul>
<li>Yenileme API’si <code>Dataset.ReadWrite.All</code> kapsamı ister. Paylaşılan kapasitede günde en fazla 8 yenileme isteği yapılır (zamanlanmışlar dâhil) ve gövdede yalnızca <code>notifyOption</code> verilebilir. Kapasitede ise tablo ya da bölüm seçen <b>gelişmiş yenileme</b> yapılabilir; o zaman <code>notifyOption</code> gönderilmez.</li>
<li><code>notifyOption</code>, hizmet sorumlusuyla yapılan çağrılarda geçerli değildir; hata bildirimini kendin kurmalısın.</li>
<li>Her çağrıda <code>Authorization: Bearer …</code> başlığı gerekir.</li>
</ul>
<p>Yenileme geçmişinden gelen kayıtlar bir izleme raporuna dönüşebilir. Aşağıdaki sorgu küçük bir geçmiş tablosundan başarı oranı ve ortalama süre üretir; gerçek projede bu tablo API’den bir not defteriyle doldurulur:</p>
<pre class="dax">EVALUATE
VAR Gecmis =
    DATATABLE(
        "Model", STRING, "Durum", STRING, "Dakika", INTEGER,
        {
            {"Satış", "Completed", 12}, {"Satış", "Completed", 14}, {"Satış", "Failed", 3},
            {"Stok", "Completed", 25}, {"Stok", "Completed", 31},
            {"Web", "Failed", 1}, {"Web", "Completed", 6}, {"Web", "Completed", 5}
        }
    )
VAR Basarili = FILTER(Gecmis, [Durum] = "Completed")
RETURN
    ROW(
        "Deneme", COUNTROWS(Gecmis),
        "Başarılı", COUNTROWS(Basarili),
        "Başarı %", DIVIDE(COUNTROWS(Basarili), COUNTROWS(Gecmis)),
        "Ort. süre (dk)", AVERAGEX(Basarili, [Dakika])
    )</pre>
<p>Sonuç: 8 denemenin 6’sı başarılı (%75), başarılı yenilemeler ortalama 15,5 dakika.</p>

<h2>PowerShell ile yönetim</h2>
<p>Yöneticiler için <code>MicrosoftPowerBIMgmt</code> modülü var. Windows PowerShell 3.0 ve üzeri ile PowerShell 6 ve üzeri sürümlerde çalışır. Learn, kimlik doğrulama değişikliği nedeniyle 1.3.84 ya da daha yeni bir sürüm kullanılmasını söylüyor.</p>
<pre data-notry>Install-Module -Name MicrosoftPowerBIMgmt
Connect-PowerBIServiceAccount

# Kuruluştaki tüm çalışma alanları (yönetici yetkisi gerekir)
Get-PowerBIWorkspace -Scope Organization -All

# Bir raporu .pbix olarak indir
Export-PowerBIReport -Id {raporId} -OutFile .\SatisRaporu.pbix

# Cmdlet’i olmayan bir uç noktayı çağır
Invoke-PowerBIRestMethod -Url "groups/{calismaAlaniId}/datasets/{modelId}/refreshes" -Method Post -Body '{"notifyOption":"NoNotification"}'</pre>

<h2>Not defterinden modele: semantic link</h2>
<p><b>Semantic link</b> (SemPy), Fabric not defterinden anlam modeline Python ile erişmeyi sağlar. Spark 3.4 ve üzeri varsayılan çalışma ortamında hazır yüklüdür. Veri bilimci, ölçüleri kendisi yeniden yazmak yerine modeldeki <code>[Net Satış]</code> tanımını kullanır; böylece rapor ve model aynı sayıyı verir.</p>
<pre data-notry>import sempy.fabric as fabric

fabric.list_datasets()                               # çalışma alanındaki modeller
fabric.list_measures("Anadolu Market Satış")         # modeldeki ölçüler

# Ölçüyü kategori ve yıla göre hesapla, pandas benzeri tablo al
df = fabric.evaluate_measure("Anadolu Market Satış", "Net Satış",
                             ["Urunler[Kategori]", "Tarih[Yil]"])

# Doğrudan DAX sorgusu
df2 = fabric.evaluate_dax("Anadolu Market Satış",
    "EVALUATE SUMMARIZECOLUMNS(Tarih[Yil], \\"Net Satış\\", [Net Satış])")</pre>
<p>Sık kullanım: model kalitesini otomatik denetlemek (açıklaması olmayan ölçüler, kullanılmayan sütunlar), tahmin sonuçlarını <code>to_lakehouse_table</code> ile lakehouse’a yazıp modele geri vermek.</p>

<h2>Özel görsel geliştirmek</h2>
<p>Hazır görseller ve AppSource yetmiyorsa kendi görselini yazabilirsin. Özel görsel, Power BI görsel API’sini kullanan bir TypeScript projesidir; çizim için çoğu zaman D3 kullanılır.</p>
<pre data-notry>npm i -g powerbi-visuals-tools@latest   # pbiviz komut satırı aracı
pbiviz new MagazaIsiHaritasi            # proje iskeleti: capabilities.json, pbiviz.json, src/visual.ts
cd MagazaIsiHaritasi
pbiviz start                            # yerelde çalıştır, geliştirici görseliyle canlı izle
pbiviz package                          # dist/ altında .pbiviz paketi üret</pre>
<ul>
<li><code>capabilities.json</code>: görselin alan kutuları (veri rolleri), veri eşlemesi ve biçim seçenekleri.</li>
<li><code>pbiviz.json</code>: ad, sürüm ve kullanılan görsel API sürümü.</li>
<li>Desktop’ta denemek için <b>Dosya → Seçenekler → Rapor ayarları → Görsel geliştir</b> seçeneği açılır; ayar yalnızca o oturum için geçerlidir.</li>
</ul>
<p><b>Sertifika:</b> Görsel önce Partner Center üzerinden AppSource’a gönderilir, sonra isteğe bağlı olarak sertifika istenir. Sertifikalı görsel dış servislere HTTP ya da WebSocket isteği yapamaz, <code>eval</code> gibi dinamik kod kullanamaz ve kod incelemesinden geçer. Karşılığında PowerPoint’e dışa aktarma ve e-posta aboneliklerinde görünme gibi ek yetenekler kazanır. Kurumlar çoğu zaman yalnızca sertifikalı ya da yönetici tarafından onaylanmış görsellere izin verir.</p>

<h2>Hangi araç ne zaman?</h2>
<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>Araç</th></tr>
<tr><td>Dış kullanıcıya kendi portalımızda rapor</td><td>Müşteriler için gömme + hizmet sorumlusu + etkin kimlik</td></tr>
<tr><td>Veri hazır olunca modeli yenile</td><td>İşlem hattı etkinliği ya da REST API</td></tr>
<tr><td>Kiracıdaki tüm çalışma alanlarının envanteri</td><td>PowerShell ya da yönetici REST API’leri</td></tr>
<tr><td>Modelin ölçülerini Python’da kullanmak</td><td>Semantic link</td></tr>
<tr><td>Hiçbir görselin çizemediği bir grafik</td><td>pbiviz ile özel görsel</td></tr>
</table></div>
<p>Bu araçların CI/CD akışındaki yeri (Git, dağıtım işlem hatları) “Yaşam döngüsü” dersinde anlatılıyor.</p>
`,
  ex: [
    { t: 'mc', q: 'Bayiler Anadolu Market’in portalında rapor görecek; hiçbirinin Power BI hesabı yok. Hangi senaryo?', o: ['Kuruluşun için gömme', 'Web’de yayımla', 'Müşteriler için gömme', 'SharePoint’e rapor ekleme'], a: 2, why: 'Dış kullanıcıların Power BI hesabı olmadığında “müşteriler için gömme” (app owns data) kullanılır: uygulama kendi kimliğiyle gömme belirteci üretir. Web’de yayımla ise herkese açık ve güvensizdir.' },
    { t: 'mc', q: 'Hizmet sorumlusuyla RLS’li bir model için gömme belirteci isterken <code>identities</code> göndermezsen ne olur?', o: ['Belirteç üretimi hata verir', 'Tüm veri filtresiz görünür', 'İlk rol otomatik uygulanır', 'Rapor boş bir sayfa açar'], a: 0, why: 'Learn’e göre hizmet sorumlusunda kullanıcı adı ve rol verilmezse belirteç üretimi başarısız olur. Ana kullanıcıyla ise belirteç üretilir ama filtre uygulanmaz.' },
    { t: 'mc', q: 'Gömülü senaryoda etkin kimlikte <code>"username": "bayi-izmir-07"</code> gönderildi. Modeldeki dinamik rol filtresinde <code>USERPRINCIPALNAME()</code> ne döndürür?', o: ['Hizmet sorumlusunun uygulama kimliği', 'Çalışma alanı yöneticisinin e-postası', 'bayi-izmir-07', 'Boş değer (BLANK)'], a: 2, why: 'Müşteriler için gömmede Power BI son kullanıcıyı tanımaz; etkin kimlikte gönderilen username değeri, rol filtresindeki USERNAME() ve USERPRINCIPALNAME() fonksiyonlarının döndürdüğü değer olur.' },
    { t: 'mc', q: 'Paylaşılan kapasitedeki bir modeli REST API ile yenilerken gövdede tablo ve bölüm seçmek istiyorsun. Sonuç?', o: ['Çalışır, yalnızca seçilen bölümler yenilenir', 'Gelişmiş yenileme paylaşılanda yok', 'Çalışır ama notifyOption zorunludur', 'Yalnızca hizmet sorumlusuyla çalışır'], a: 1, why: 'Paylaşılan kapasitede gövdede yalnızca notifyOption verilebilir ve gelişmiş (enhanced) yenileme desteklenmez; tablo/bölüm seçmek kapasite gerektirir.' },
    { t: 'mc', q: 'Veri bilimci, Fabric not defterinde modeldeki <code>[Net Satış]</code> ölçüsünü kategoriye göre hesaplatmak istiyor. Hangisi?', o: ['fabric.evaluate_measure', 'spark.read.table', 'Invoke-PowerBIRestMethod', 'pbiviz package'], a: 0, why: 'Semantic link’in <code>evaluate_measure</code> fonksiyonu modeldeki ölçüyü verilen sütunlara göre hesaplar ve sonucu tablo olarak döndürür. Ölçü yeniden yazılmadığı için rapordaki sayıyla aynı olur.' },
    { t: 'mc', q: 'Sertifikalı bir Power BI özel görseli için hangisi <b>yasaktır</b>?', o: ['TypeScript ile yazılmış olmak', 'Çizimde D3 kullanmak', 'Dış servise HTTP isteği', 'capabilities.json içermek'], a: 2, why: 'Sertifika için görsel Power BI dışına HTTP/S ya da WebSocket isteği yapamaz; fetch, XMLHttpRequest ve eval yasaktır. TypeScript, D3 ve capabilities.json normaldir.' },
    { t: 'dax', name: 'Benim Bölgelerim Satışı', q: '<b>Benim Bölgelerim Satışı</b>: Gömülü RLS’yi bir ölçüyle taklit et. Yetki tablosu: <code>DATATABLE("Eposta", STRING, "Bolge", STRING, {{"ayse.kaya@anadolumarket.com", "Ege"}, {"ayse.kaya@anadolumarket.com", "Akdeniz"}, {"selim.aksoy@anadolumarket.com", "Marmara"}})</code>. Oturumdaki kullanıcının (<code>USERPRINCIPALNAME()</code>) bölgelerini seç ve <code>TREATAS</code> ile <code>Musteriler[Bolge]</code>’ye uygulayarak [Net Satış] hesapla.', sol: 'VAR Yetkiler = DATATABLE("Eposta", STRING, "Bolge", STRING, {{"ayse.kaya@anadolumarket.com", "Ege"}, {"ayse.kaya@anadolumarket.com", "Akdeniz"}, {"selim.aksoy@anadolumarket.com", "Marmara"}})\nVAR Bolgelerim = SELECTCOLUMNS(FILTER(Yetkiler, [Eposta] = USERPRINCIPALNAME()), "Bolge", [Bolge])\nRETURN CALCULATE([Net Satış], TREATAS(Bolgelerim, Musteriler[Bolge]))', hint: 'VAR ile tabloyu tanımla; FILTER(Yetkiler, [Eposta] = USERPRINCIPALNAME()) satırlarından SELECTCOLUMNS ile yalnızca Bolge sütununu al; CALCULATE([Net Satış], TREATAS(…, Musteriler[Bolge])).' },
    { t: 'query', q: 'Yenileme geçmişinden bir KPI satırı üret. <code>DATATABLE("Model", STRING, "Durum", STRING, {{"Satış", "Completed"}, {"Satış", "Failed"}, {"Stok", "Completed"}, {"Web", "Completed"}})</code> tablosunu bir değişkene al ve <code>ROW</code> ile "Deneme" (satır sayısı) ve "Başarı %" (Durum = "Completed" olanların payı) döndür.', start: 'EVALUATE\n', sol: 'EVALUATE\nVAR Gecmis = DATATABLE("Model", STRING, "Durum", STRING, {{"Satış", "Completed"}, {"Satış", "Failed"}, {"Stok", "Completed"}, {"Web", "Completed"}})\nRETURN ROW("Deneme", COUNTROWS(Gecmis), "Başarı %", DIVIDE(COUNTROWS(FILTER(Gecmis, [Durum] = "Completed")), COUNTROWS(Gecmis)))', hint: 'EVALUATE\nVAR Gecmis = DATATABLE(…)\nRETURN ROW("Deneme", COUNTROWS(Gecmis), "Başarı %", DIVIDE(COUNTROWS(FILTER(Gecmis, [Durum] = "Completed")), COUNTROWS(Gecmis))).' }
  ]
});
})(window);
