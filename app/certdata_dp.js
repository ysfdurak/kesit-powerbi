/* DP-600 ek soru havuzu: eksik maddeler, çok tipli sorular ve vaka çalışmaları */
(function (W) {
var YON = 'Analitik çözümü yönet', VH = 'Veriyi hazırla', AM = 'Anlam modelini uygula';
W.PBI_CERTQ = (W.PBI_CERTQ || []).concat([
/* ---------- Analitik çözümü yönet ---------- */
{ ex:'dp600', id:'dp-n01', k:YON, s:'dp-lc2', type:'mc',
  q:'Ekip bir raporu Power BI Desktop projesi (.pbip) olarak kaydedip Git deposuna koyuyor. Power BI Desktop’un oluşturduğu varsayılan `.gitignore` hangi dosyanın depoya girmesini engeller?',
  o:['`cache.abf` yerel veri önbelleği', 'Modelin `definition` klasöründeki TMDL dosyaları', 'Raporun sayfa tanımları', 'Projeyi açan `.pbip` işaretçi dosyası'], a:0,
  why:'Varsayılan `.gitignore`, `.pbi/cache.abf` ve `.pbi/localSettings.json` dosyalarını dışarıda bırakır; önbellek veridir, sürüm denetimine girmez. TMDL ve rapor tanımları ise tam da Git’te izlenmesi istenen metin dosyalarıdır.' },
{ ex:'dp600', id:'dp-n02', k:YON, s:'dp-lc6', type:'mc',
  q:'Yeni rapor yazarlarının şirketin SQL veritabanına doğru sunucu ve veritabanı adıyla bağlanmasını kolaylaştırmak istiyorsun. Kimlik bilgisi girişi ve tablo seçimi kullanıcıda kalmalı. Ne dağıtırsın?',
  o:['Verisiyle birlikte kaydedilmiş bir .pbix dosyası', 'Bağlantı dizesini içeren bir Excel çalışma kitabı', 'Bir .pbids dosyası', 'Kimlik bilgileri gömülü bir .pbit şablonu'], a:2,
  why:'.pbids, tek bir veri kaynağının bağlantı ayrıntılarını JSON olarak taşır; kimlik bilgisi ve tablo bilgisi içermez, açan kişiye kimlik bilgisi sorulur ve Gezgin açılır. .pbit kimlik bilgisi gömmez; rapor ve model yapısını taşır.' },
{ ex:'dp600', id:'dp-n03', k:YON, s:'dp-lc6', type:'yesno',
  q:'Yeniden kullanılabilir Power BI varlıkları hakkında her ifade için Evet ya da Hayır seç.',
  st:[ { t:'Bir .pbit şablonu rapor sayfalarını, model yapısını, ölçüleri ve sorguları içerir ama içe aktarılmış veriyi içermez.', a:true },
       { t:'Tek bir .pbids dosyası birden çok veri kaynağını ve bunların kimlik bilgilerini taşıyabilir.', a:false },
       { t:'Raporları paylaşılan tek bir anlam modeline bağlamak, aynı ölçüleri her raporda yeniden yazmayı önler.', a:true } ],
  why:'.pbit veri olmadan yapıyı taşır; açılınca veri yeniden yüklenir. .pbids yalnızca tek veri kaynağını destekler ve kimlik bilgisi içermez. Paylaşılan anlam modeli tek doğruluk kaynağıdır.' },
{ ex:'dp600', id:'dp-n04', k:YON, s:'dp-sg2', type:'multi',
  q:'Bir Fabric ambarında (warehouse) İK analistleri `dbo.Calisan` tablosunu T-SQL ile sorguluyor. `Maas` sütununu analistlerden gizlemek ve her analistin yalnızca kendi bölgesinin satırlarını görmesini sağlamak istiyorsun. Hangi iki ambar özelliğini kullanırsın? İki tane seç.',
  o:['Maas hariç sütun listesiyle `GRANT SELECT ON dbo.Calisan(...)` (sütun düzeyi güvenlik)', 'Satır filtresi fonksiyonu ve `CREATE SECURITY POLICY` (satır düzeyi güvenlik)', 'Analistlere çalışma alanında Görüntüleyici (Viewer) rolü vermek', 'Ambara Gizli (Confidential) duyarlılık etiketi uygulamak', 'Ambarı Tanıtılmış (Promoted) olarak onaylamak'], a:[0, 1],
  why:'Ambarda sütun düzeyi güvenlik sütun listeli `GRANT` ile, satır düzeyi güvenlik bir filtre fonksiyonu ve güvenlik ilkesiyle uygulanır; ikisi de veritabanı katmanında her sorguda zorlanır. Rol, etiket ve onay satır ya da sütun kısıtlamaz.' },
{ ex:'dp600', id:'dp-n05', k:YON, s:'dp-sg2', type:'mc',
  q:'Ambarda müşteri destek ekibi `Telefon` sütununu sorgulayabilmeli ama değerin yalnızca son dört hanesini görmeli; yöneticiler tam değeri görmeli. Ne kullanırsın?',
  o:['Sütun düzeyi güvenlikle sütunu tamamen kapatmak', 'Dinamik veri maskeleme', 'Anlam modelinde nesne düzeyi güvenlik (OLS)', 'Telefonu ayrı bir tabloya taşıyıp RLS uygulamak'], a:1,
  why:'Dinamik veri maskeleme sütunu sorgulanabilir bırakır ama değeri kısmi maskeyle gösterir; `UNMASK` izni olan yöneticiler tam değeri görür. Sütun düzeyi güvenlik ise sütunu hiç sorgulatmaz, bu da “son dört haneyi görsün” isteğini karşılamaz.' },
{ ex:'dp600', id:'dp-n06', k:YON, s:'dp-lc1', type:'order',
  q:'Bir Fabric çalışma alanını Azure DevOps deposuna bağlayıp ilk değişikliği depoya göndermek için adımları sırala.',
  items:['Çalışma alanı ayarlarında Git tümleştirmesi bölümünü aç ve sağlayıcıyı seç', 'Kuruluşu, projeyi, depoyu, dalı ve klasörü seçip bağlan ve eşitle', 'Çalışma alanında bir rapor ya da anlam modelini değiştir', 'Kaynak denetimi (Source control) bölmesinde değişikliği seçip commit et'],
  extra:['Değişikliği dağıtım işlem hattıyla Üretim aşamasına dağıt'],
  why:'Önce çalışma alanı bir depo dalına bağlanıp eşitlenir; sonra çalışma alanında yapılan değişiklikler Kaynak denetimi bölmesinde görünür ve commit edilir. Dağıtım işlem hattı Git bağlantısının bir adımı değildir.' },
{ ex:'dp600', id:'dp-n07', k:YON, s:'dp-lc3', type:'yesno',
  q:'Fabric dağıtım işlem hatları (deployment pipelines) hakkında her ifade için Evet ya da Hayır seç.',
  st:[ { t:'Dağıtım kuralları, kuralın uygulanacağı hedef aşamada tanımlanır ve o aşamaya yapılan sonraki dağıtımda etkinleşir.', a:true },
       { t:'Dağıtım anlam modelinin verisini de kopyalar; hedef aşamada ilk dağıtımdan sonra yenileme gerekmez.', a:false },
       { t:'Bir aşamadaki öğelerin tamamı yerine yalnızca seçilen öğeler bir sonraki aşamaya dağıtılabilir.', a:true } ],
  why:'Kurallar hedef aşamada tanımlanır ve bir sonraki dağıtımda uygulanır. İşlem hattı meta veriyi taşır, veriyi taşımaz; yeni dağıtılan model hedefte yenilenmelidir. Seçmeli dağıtım desteklenir.' },
{ ex:'dp600', id:'dp-n08', k:YON, s:'dp-sg1', type:'mc',
  q:'Analistler bir anlam modeli üzerinde kendi raporlarını oluşturabilmeli ama modelin bulunduğu çalışma alanına üye olmamalı. Ne verirsin?',
  o:['Çalışma alanında Katkıda Bulunan (Contributor) rolü', 'Çalışma alanında Görüntüleyici (Viewer) rolü', 'Yazma (Write) izni', 'Modelde Derleme (Build) izni'], a:3,
  why:'Derleme (Build) izni, öğe düzeyinde verilir ve kullanıcının çalışma alanı rolü olmadan o model üzerinde rapor oluşturmasını sağlar. Çalışma alanı rolleri istenmeyen çalışma alanı erişimi verir; Yazma izni modeli düzenleme yetkisidir.' },
{ ex:'dp600', id:'dp-n09', k:YON, s:'dp-lc2', type:'multi',
  q:'Bir Power BI Desktop projesi (.pbip) hakkında hangi iki ifade doğrudur? İki tane seç.',
  o:['Rapor ve anlam modeli, `.Report` ve `.SemanticModel` adlı ayrı klasörlerde metin dosyaları olarak saklanır', 'Model tanımı `definition` klasöründe TMDL olarak bir metin düzenleyicide değiştirilebilir', 'Yerel veri önbelleği `cache.abf`, satır karşılaştırması için depoya commit edilmelidir', 'Proje yalnızca Fabric portalında açılabilir; Power BI Desktop’ta açılamaz', '.pbix’ten .pbip’e geçmek için ayrı bir dönüştürme aracı kurmak gerekir'], a:[0, 1],
  why:'.pbip, rapor ve modeli ayrı klasörlerde metin olarak tutar; model tanımı TMDL’dir. Dönüşüm Power BI Desktop’ta Dosya > Farklı kaydet ile yapılır ve `cache.abf` Git dışında tutulur.' },

/* ---------- Veriyi hazırla ---------- */
{ ex:'dp600', id:'dp-n10', k:VH, s:'dp-gd2', type:'mc',
  q:'Farklı çalışma alanlarındaki onaylanmış lakehouse ve anlam modellerini tek yerden aramak, sahiplerini ve ayrıntılarını görmek istiyorsun. Hangi deneyimi açarsın?',
  o:['Kapasite Ölçümleri uygulaması', 'OneLake kataloğu (OneLake catalog)', 'Real-Time hub', 'Çalışma alanının Git tümleştirmesi bölmesi'], a:1,
  why:'OneLake kataloğunun Keşfet (Explore) sekmesi, erişebildiğin Fabric öğelerini filtrelerle listeler ve ayrıntılarını gösterir. Real-Time hub akış verisi içindir; Kapasite Ölçümleri tüketimi izler.' },
{ ex:'dp600', id:'dp-n11', k:VH, s:'dp-gd2', type:'mc',
  q:'Kuruluştaki Azure Event Hubs akışlarını, çalışan eventstream çıktılarını ve Fabric çalışma alanı olaylarını kiracı genelinde tek listede görüp bağlanmak istiyorsun. Nereye gidersin?',
  o:['Real-Time hub', 'OneLake kataloğunun Yönet (Govern) sekmesi', 'Lakehouse gezgini (Lakehouse explorer)', 'Veri akışı Gen2 bağlayıcı listesi'], a:0,
  why:'Real-Time hub, her kiracıda hazır gelen ve akış verisi için tek, kiracı geneli yerdir: veri akışlarını, Microsoft kaynaklarını ve Fabric/Azure olaylarını listeler. OneLake kataloğunun Yönet sekmesi yönetişim sağlığı içindir.' },
{ ex:'dp600', id:'dp-n12', k:VH, s:'dp-gd4', type:'mc',
  q:'Fabrika sensörleri saniyede binlerce olay gönderiyor. Analistler son dakikaların verisini zaman serisi fonksiyonlarıyla, düşük gecikmeyle sorgulamak istiyor. Hangi veri deposu en uygundur?',
  o:['Lakehouse ve saatlik çalışan Spark işi', 'Ambar (warehouse) ve COPY INTO ile yükleme', 'Import modlu anlam modeli ve artımlı yenileme', 'Eventhouse'], a:3,
  why:'Eventhouse, akış ve zaman serisi verisi için tasarlanmıştır; KQL ile hızlı alım ve zaman serisi analizi sunar. Saatlik Spark işi ya da toplu `COPY INTO` “son dakikalar” gecikme isteğini karşılamaz.' },
{ ex:'dp600', id:'dp-n13', k:VH, s:'dp-gd4', type:'multi',
  q:'Hangi iki gereksinim, bir Fabric ambarını (warehouse) lakehouse’a göre daha uygun seçim yapar? İki tane seç.',
  o:['Ekip yalnızca T-SQL biliyor ve çok tablolu işlemler (transaction) gerekiyor', 'Tablolara T-SQL ile `INSERT`, `UPDATE`, `DELETE` yazılacak', 'Görüntü ve JSON gibi yapılandırılmamış dosyalar saklanacak', 'Veri mühendisleri PySpark not defterleriyle çalışıyor', 'Saniyelik telemetri KQL ile sorgulanacak'], a:[0, 1],
  why:'Ambar tam T-SQL işlem ve DML desteği sunar; lakehouse’un SQL analitik uç noktası salt okunurdur. Yapılandırılmamış dosyalar ve Spark lakehouse’a, akış telemetrisi eventhouse’a işaret eder.' },
{ ex:'dp600', id:'dp-n14', k:VH, s:'dp-gd5', type:'mc',
  q:'Eventhouse’taki `Telemetri` tablosunu ayrı bir kopyalama işi yazmadan lakehouse’tan kısayolla ve Direct Lake modelinden okumak istiyorsun. KQL veritabanında neyi açarsın?',
  o:['Tablo için satır düzeyi güvenlik ilkesi', 'Güncelleme ilkesi (update policy)', 'OneLake erişilebilirliği', 'Veri saklama süresini sınırsız yapan ilke'], a:2,
  why:'OneLake erişilebilirliği (OneLake availability) KQL verisinin Delta biçiminde mantıksal bir kopyasını OneLake’e yazar; lakehouse kısayolu, not defterleri ve Direct Lake bunu okuyabilir. Açıkken tabloya RLS uygulanamaz.' },
{ ex:'dp600', id:'dp-n15', k:VH, s:'dp-gd5', type:'yesno',
  q:'Anlam modelleri için OneLake tümleştirmesi (OneLake integration) hakkında her ifade için Evet ya da Hayır seç.',
  st:[ { t:'Modelin Import modundaki tabloları OneLake’e Delta tabloları olarak yazılır.', a:true },
       { t:'DirectQuery tabloları ve ölçüler de Delta tablosu olarak dışa aktarılır.', a:false },
       { t:'Verinin OneLake’e yazılması için tümleştirme açıldıktan sonra en az bir yenileme çalışmalıdır.', a:true } ],
  why:'Yalnızca içe aktarılmış tablolar dışa aktarılır; ölçüler, DirectQuery ve hibrit tablolar, hesaplama grupları aktarılmaz. Dışa aktarma yenilemeyle tetiklenir; tüketiciler lakehouse’tan kısayolla okur.' },
{ ex:'dp600', id:'dp-n16', k:VH, s:'dp-gd3', type:'mc',
  q:'Azure SQL Database’deki işlem tablolarının neredeyse gerçek zamanlı bir kopyasını, ETL işlem hattı kurmadan OneLake’te Delta olarak tutmak istiyorsun. Hangi özellik?',
  o:['Günlük kopyalama etkinliği olan bir işlem hattı', 'Yansıtma (Mirroring)', 'Azure SQL veritabanına işaret eden OneLake kısayolu', 'Zamanlanmış yenilemeli bir veri akışı Gen2'], a:1,
  why:'Yansıtma, kaynak veritabanındaki değişiklikleri sürekli olarak OneLake’e Delta biçiminde çoğaltır. OneLake kısayolları depolama konumlarına (ör. ADLS Gen2, S3) işaret eder, bir Azure SQL veritabanına değil.' },
{ ex:'dp600', id:'dp-n17', k:VH, s:'dp-gd1', type:'mc',
  q:'Bir veri akışı Gen2’nin (Dataflow Gen2) şirket içi ağdaki bir SQL Server’dan veri alması gerekiyor. Bağlantıyı oluşturabilmek için önce ne gerekir?',
  o:['Şirket içi veri ağ geçidi (on-premises data gateway)', 'Sunucuya işaret eden bir OneLake kısayolu', 'Çalışma alanı için Git tümleştirmesi', 'XMLA uç noktası'], a:0,
  why:'Bulut hizmetinin şirket içi kaynaklara erişmesi için şirket içi veri ağ geçidi gerekir; bağlantı ağ geçidi üzerinden tanımlanır. Kısayollar şirket içi SQL Server’a işaret etmez; XMLA anlam modelleri içindir.' },
{ ex:'dp600', id:'dp-n18', k:VH, s:'dp-qa1', type:'mc',
  q:'Ambarın Görsel sorgu düzenleyicisinde (Visual query editor) iki tabloyu birleştirip gruplayan bir sorgu oluşturdun. Sonucu başkalarının T-SQL’den kullanabileceği kalıcı bir nesne yapmak istiyorsun ama verinin ayrı bir kopyası oluşmamalı. Ne seçersin?',
  o:['Sonuçları Excel’e indirmek', 'Tablo olarak kaydet (Save as table)', 'Sorguyu Sorgularım (My queries) altında saklamak', 'Görünüm olarak kaydet (Save as view)'], a:3,
  why:'Görünüm olarak kaydet, sorguyu ambarda bir görünüm olarak oluşturur; veri kopyalanmaz. Tablo olarak kaydet `CREATE TABLE AS SELECT` kullanır ve sonucu ayrı bir tabloya yazar.' },
{ ex:'dp600', id:'dp-n19', k:VH, s:'dp-qa2', type:'hot',
  q:'Ambarda 2026 siparişleri için bölge cirosunu hesaplayıp yalnızca cirosu 100.000’i aşan bölgeleri listelemek istiyorsun. Boşlukları doldur.',
  code:`SELECT Bolge, SUM(Tutar) AS Ciro
FROM dbo.Satislar
{0} YEAR(SiparisTarihi) = 2026
{1} Bolge
{2} SUM(Tutar) > 100000
ORDER BY Ciro DESC;`,
  slots:[ { o:['WHERE', 'HAVING', 'ON', 'FILTER'], a:0 }, { o:['ORDER BY', 'PARTITION BY', 'GROUP BY', 'SUMMARIZE BY'], a:2 }, { o:['WHERE', 'AND', 'QUALIFY', 'HAVING'], a:3 } ],
  why:'`WHERE` satırları gruplamadan önce süzer, `GROUP BY` bölge başına grup oluşturur, `HAVING` toplama sonucuna göre grupları süzer. Toplama fonksiyonu `WHERE` içinde kullanılamaz.' },
{ ex:'dp600', id:'dp-n20', k:VH, s:'dp-qa2', type:'yesno',
  q:'Fabric’te SQL ile sorgulama hakkında her ifade için Evet ya da Hayır seç.',
  st:[ { t:'`WHERE` satırları gruplamadan önce, `HAVING` ise `GROUP BY` sonrasında grupları süzer.', a:true },
       { t:'Lakehouse’un SQL analitik uç noktasında `UPDATE` ile bir Delta tablosundaki satırı değiştirebilirsin.', a:false },
       { t:'`SELECT TOP 10 ... ORDER BY Ciro DESC` en yüksek ciroya sahip 10 satırı döndürür.', a:true } ],
  why:'SQL analitik uç noktası salt okunurdur; Delta tablosunu değiştirmek için Spark ya da ambar kullanılır. `TOP` ile `ORDER BY DESC` birlikte en yüksek değerleri verir.' },
{ ex:'dp600', id:'dp-n21', k:VH, s:'dp-qa2', type:'multi',
  q:'`dbo.Satis` tablosundan 2026 yılı siparişlerinin bölge bazında toplam tutarını almak istiyorsun. Hangi iki sorgu doğru sonucu verir? İki tane seç.',
  o:['`SELECT Bolge, SUM(Tutar) FROM dbo.Satis WHERE YEAR(Tarih) = 2026 GROUP BY Bolge`', '`SELECT Bolge, SUM(Tutar) FROM dbo.Satis WHERE Tarih >= \'2026-01-01\' AND Tarih < \'2027-01-01\' GROUP BY Bolge`', '`SELECT Bolge, SUM(Tutar) FROM dbo.Satis GROUP BY Bolge HAVING YEAR(Tarih) = 2026`', '`SELECT Bolge, Tutar FROM dbo.Satis WHERE YEAR(Tarih) = 2026 GROUP BY Bolge`'], a:[0, 1],
  why:'İlk iki sorgu yılı satır düzeyinde süzüp bölgeye göre toplar; tarih aralığı yazımı da aynı sonucu verir. `HAVING` içinde gruplanmamış `Tarih` kullanılamaz; dördüncü sorguda `Tutar` toplanmadığı için hata alınır.' },
{ ex:'dp600', id:'dp-n22', k:VH, s:'dp-qa3', type:'hot',
  q:'Eventhouse’taki `Telemetri` tablosunda son bir saatte sıcaklığı 80’i aşan olayları cihaz başına 5 dakikalık aralıklarla saymak istiyorsun. Boşlukları doldur.',
  code:`Telemetri
| where Zaman > ago(1h)
| {0} Sicaklik > 80
| {1} OlaySayisi = count() {2} CihazNo, bin(Zaman, 5m)`,
  slots:[ { o:['having', 'where', 'filter by', 'project'], a:1 }, { o:['extend', 'project', 'summarize', 'top'], a:2 }, { o:['by', 'on', 'group by', 'over'], a:0 } ],
  why:'KQL’de satırları `where` süzer; `summarize ... by` gruplayarak toplar, `bin()` zamanı eşit aralıklara böler. `group by` ve `having` SQL sözdizimidir.' },
{ ex:'dp600', id:'dp-n23', k:VH, s:'dp-qa3', type:'mc',
  q:'KQL’de `Telemetri` tablosundan en yüksek `Sicaklik` değerine sahip 10 olayı almak için hangi sorguyu yazarsın?',
  o:['`Telemetri | take 10`', '`Telemetri | limit 10 | sort by Sicaklik`', '`Telemetri | top 10 by Sicaklik desc`', '`Telemetri | summarize max(Sicaklik) by 10`'], a:2,
  why:'`top 10 by Sicaklik desc` tabloyu sıralayıp ilk 10 satırı alır. `take` ve `limit` rastgele 10 satır döndürür; sonradan sıralamak en yüksekleri garanti etmez.' },
{ ex:'dp600', id:'dp-n24', k:VH, s:'dp-qa3', type:'order',
  q:'Son 24 saatte ortalama sıcaklığı en yüksek 5 cihazı bulan bir KQL sorgusunun satırlarını doğru sıraya koy.',
  items:['`Telemetri`', '`| where Zaman > ago(1d)`', '`| summarize OrtSicaklik = avg(Sicaklik) by CihazNo`', '`| top 5 by OrtSicaklik desc`'],
  extra:['`GROUP BY CihazNo`'],
  why:'KQL sorgusu tablo adıyla başlar ve her `|` bir önceki adımın sonucunu işler: önce süz, sonra topla, sonra en yüksekleri al. `GROUP BY` KQL’de yoktur; gruplama `summarize ... by` ile yapılır.' },
{ ex:'dp600', id:'dp-n25', k:VH, s:'dp-qa4', type:'hot',
  q:'DAX sorgu görünümünde 2025 yılı için kategori başına net satışı, büyükten küçüğe sıralı bir tablo olarak döndürmek istiyorsun. Boşlukları doldur.',
  code:`EVALUATE
{0}(
    Urunler[Kategori],
    {1},
    "Net Satış", [Net Satış]
)
{2} [Net Satış] DESC`,
  slots:[ { o:['ADDCOLUMNS', 'SUMMARIZECOLUMNS', 'SELECTCOLUMNS', 'GROUPBY'], a:1 }, { o:['WHERE Tarih[Yil] = 2025', 'TREATAS({2025}, Tarih[Yil])', 'HAVING Tarih[Yil] = 2025'], a:1 }, { o:['SORT BY', 'GROUP BY', 'ORDER BY', 'TOPN'], a:2 } ],
  why:'`SUMMARIZECOLUMNS` gruplama sütunu, filtre tablosu ve ad-ifade çiftleri alır; `TREATAS` 2025 değerini `Tarih[Yil]` üzerinde filtre tablosu yapar. DAX sorgusunda sıralama `ORDER BY` ile yapılır; `WHERE`/`HAVING` DAX’ta yoktur.' },
{ ex:'dp600', id:'dp-n26', k:VH, s:'dp-qa4', type:'multi',
  q:'Bir anlam modeline karşı `EVALUATE` ile başlayan DAX sorgularını hangi iki yerde çalıştırabilirsin? İki tane seç.',
  o:['Power BI Desktop’taki DAX sorgu görünümü (DAX query view)', 'XMLA uç noktası üzerinden DAX Studio ya da SSMS', 'Lakehouse’un SQL analitik uç noktasındaki sorgu düzenleyicisi', 'Eventhouse’taki KQL sorgu kümesi (KQL queryset)'], a:[0, 1],
  why:'DAX sorguları anlam modelinin motorunda çalışır: Desktop’taki DAX sorgu görünümü ya da XMLA uç noktasına bağlanan araçlar bunu yapar. SQL uç noktası T-SQL, KQL sorgu kümesi KQL çalıştırır.' },
{ ex:'dp600', id:'dp-n27', k:VH, s:'dp-tr1', type:'hot',
  q:'Ambarda bir günün satırlarını hazırlık tablosundan olgu tablosuna yeniden yükleyen, parametreli bir saklı yordam yazıp çalıştırmak istiyorsun. Boşlukları doldur.',
  code:`CREATE {0} dbo.usp_GunlukYukle
    @Gun DATE
AS
BEGIN
    DELETE FROM dbo.FactSatis WHERE SatisTarihi = @Gun;
    {1} dbo.FactSatis (SatisTarihi, MagazaKey, Tutar)
    SELECT SatisTarihi, MagazaKey, Tutar
    FROM dbo.StgSatis WHERE SatisTarihi = @Gun;
END;

{2} dbo.usp_GunlukYukle @Gun = '2026-10-26';`,
  slots:[ { o:['VIEW', 'FUNCTION', 'PROCEDURE', 'TABLE'], a:2 }, { o:['INSERT INTO', 'SELECT INTO', 'UPDATE', 'COPY INTO'], a:0 }, { o:['CALL', 'EXEC', 'RUN', 'SELECT'], a:1 } ],
  why:'Parametre alıp `DELETE` ve `INSERT` gibi DML çalıştıran nesne saklı yordamdır (`CREATE PROCEDURE`) ve `EXEC` ile çağrılır. Görünüm ve fonksiyon veri değiştiremez; `COPY INTO` dosyadan yükler, tablodan değil.' },
{ ex:'dp600', id:'dp-n28', k:VH, s:'dp-tr1', type:'mc',
  q:'Ambarda bölge kodunu parametre olarak alıp o bölgenin satırlarını tablo olarak döndüren ve bir sorgunun `FROM` yan tümcesinde kullanılabilen bir nesne gerekiyor. Hangisini oluşturursun?',
  o:['Satır içi tablo değerli fonksiyon', 'Görünüm (view)', 'Saklı yordam (stored procedure)', 'Bölge başına geçici tablo'], a:0,
  why:'Satır içi tablo değerli fonksiyon (`RETURNS TABLE`) parametre alır ve `FROM` içinde tablo gibi kullanılır. Görünüm parametre almaz; saklı yordamın sonucu `FROM` içinde kullanılamaz.' },
{ ex:'dp600', id:'dp-n29', k:VH, s:'dp-tr6', type:'hot',
  q:'Bir not defterinde ham satış DataFrame’ini temizliyorsun: aynı `SiparisNo` tekrarlarını at, boş `Indirim` değerlerini 0 yap, `MusteriNo` boş olan satırları sil. Boşlukları doldur.',
  code:`df_temiz = (df
    .{0}(["SiparisNo"])
    .{1}({"Indirim": 0})
    .{2}(subset=["MusteriNo"]))

df_temiz.write.format("delta").mode("overwrite").saveAsTable("silver_satislar")`,
  slots:[ { o:['distinct', 'dropDuplicates', 'groupBy', 'dropna'], a:1 }, { o:['fillna', 'replace', 'coalesce', 'withColumn'], a:0 }, { o:['isNull', 'drop', 'coalesce', 'dropna'], a:3 } ],
  why:'`dropDuplicates` verilen sütunlara göre tekrarları atar (`distinct` sütun almaz), `fillna` boş değerleri doldurur, `dropna(subset=...)` belirtilen sütunu boş satırları siler. `replace` var olan bir değeri başka bir değerle değiştirir, null’ları doldurmaz.' },
{ ex:'dp600', id:'dp-n30', k:VH, s:'dp-tr6', type:'mc',
  q:'Ambardaki `StgMusteri` tablosunda aynı `MusteriNo` için birden çok satır var. Her müşteri için yalnızca `GuncellemeTarihi` en yeni olan satırı, tüm sütunlarıyla tutmak istiyorsun. Hangi yaklaşımı kullanırsın?',
  o:['`SELECT DISTINCT *` ile tekrarları atmak', '`ROW_NUMBER() OVER (PARTITION BY MusteriNo ORDER BY GuncellemeTarihi DESC)` değeri 1 olan satırları seçmek', '`GROUP BY MusteriNo` ile `MAX(GuncellemeTarihi)` almak', '`COUNT(*) > 1` olan müşterileri silmek'], a:1,
  why:'`ROW_NUMBER` her müşterinin satırlarını tarihe göre numaralar; 1 numaralı satır en yenisidir ve tüm sütunlar korunur. Tarihler farklı olduğu için `DISTINCT *` tekrarı atmaz; `GROUP BY` diğer sütunları kaybeder.' },
{ ex:'dp600', id:'dp-n31', k:VH, s:'dp-tr4', type:'order',
  q:'Kar tanesi biçimindeki Ürün → Alt kategori → Kategori tablolarını veri akışı Gen2’de tek bir `DimUrun` boyutuna dönüştürüp (normalleştirmeyi kaldırma) lakehouse’a yazmak için adımları sırala.',
  items:['Ürün sorgusunu Alt kategori sorgusuyla `AltKategoriKey` üzerinden birleştir (Merge queries)', 'Birleşen sütunu genişletip alt kategori adını ve `KategoriKey`’i al', 'Sonucu Kategori sorgusuyla `KategoriKey` üzerinden birleştirip kategori adını genişlet', 'Gereksiz anahtar sütunlarını kaldırıp sorguyu lakehouse’a `DimUrun` olarak yaz'],
  extra:['Kategori sorgusunu Ürün sorgusunun altına ekle (Append queries)'],
  why:'Normalleştirmeyi kaldırmak, ilişkili tabloları birleştirip (merge) sütunları tek tabloya genişletmektir. Ekleme (append) satırları alt alta koyar, sütun kazandırmaz.' },
{ ex:'dp600', id:'dp-n32', k:VH, s:'dp-tr2', type:'hot',
  q:'Bir not defterinde siparişlere yıl sütunu ve tutara göre segment sütunu ekleyip sonucu her çalıştırmada baştan yazılan bir Delta tablosuna kaydetmek istiyorsun. Boşlukları doldur.',
  code:`from pyspark.sql.functions import col, year, when

df2 = (df
    .{0}("Yil", year(col("SiparisTarihi")))
    .withColumn("Segment", {1}(col("Tutar") >= 10000, "Büyük").otherwise("Standart")))

df2.write.format("delta").mode("{2}").saveAsTable("gold_siparis")`,
  slots:[ { o:['withColumnRenamed', 'withColumn', 'select', 'alias'], a:1 }, { o:['iff', 'case', 'when', 'if_'], a:2 }, { o:['append', 'ignore', 'overwrite', 'merge'], a:2 } ],
  why:'`withColumn` yeni sütun ekler; koşullu değer `when(...).otherwise(...)` ile yazılır. `overwrite` tabloyu her çalıştırmada yeniden yazar, `append` ise satır ekler.' },
{ ex:'dp600', id:'dp-n33', k:VH, s:'dp-tr5', type:'hot',
  q:'Ambarda müşteri boyutunda karşılığı olmayan (yetim) siparişleri bulmak istiyorsun. Boşlukları doldur.',
  code:`SELECT s.SiparisNo, s.MusteriKey
FROM dbo.FactSatis AS s
{0} dbo.DimMusteri AS m
    {1} s.MusteriKey = m.MusteriKey
WHERE m.MusteriKey {2};`,
  slots:[ { o:['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'UNION'], a:1 }, { o:['USING', 'WHERE', 'ON', 'BY'], a:2 }, { o:['= NULL', 'IS NOT NULL', '<> NULL', 'IS NULL'], a:3 } ],
  why:'`LEFT JOIN` tüm siparişleri korur; eşleşmeyenlerde boyut sütunları NULL olur ve `IS NULL` ile yakalanır. `INNER JOIN` yetim satırları baştan atar; NULL karşılaştırması `= NULL` ile yapılamaz.' },

/* ---------- Anlam modelini uygula ---------- */
{ ex:'dp600', id:'dp-n34', k:AM, s:'dp-sm5', type:'mc',
  q:'Bir anlam modeli 3 GB ve büyümüyor, ama ekip Tabular Editor ile XMLA uç noktası üzerinden sık sık değişiklik dağıtıyor. Hangi ayar bu yazma işlemlerinin performansını iyileştirebilir?',
  o:['Modeli DirectQuery depolama moduna çevirmek', 'Tablolar için artımlı yenileme ilkesi tanımlamak', 'Sorgu önbelleğini kapatmak', 'Büyük anlam modeli depolama biçimi'], a:3,
  why:'Büyük anlam modeli depolama biçimi yalnızca 10 GB’ı aşan modeller için değil, XMLA ile yazma yapılan modellerde de önerilir; yazma performansını iyileştirebilir. Diğer seçenekler XMLA yazma işlemini hızlandırmaz.' },
{ ex:'dp600', id:'dp-n35', k:AM, s:'dp-op3', type:'mc',
  q:'Yeni bir Direct Lake modeli iki farklı lakehouse’taki Delta tablolarını birlikte kullanmalı ve hiçbir sorgu DirectQuery’ye düşmemeli. Hangisini seçersin?',
  o:['Direct Lake on SQL analitik uç noktası', 'Lakehouse SQL uç noktalarında görünümler', 'Direct Lake on OneLake', 'Import modu ve günlük zamanlanmış yenileme'], a:2,
  why:'Direct Lake on OneLake birden fazla Fabric öğesindeki Delta tablolarını kullanabilir ve DirectQuery’ye geri dönmez. Direct Lake on SQL tek bir kaynağa bağlanır ve görünümlerde DirectQuery’ye düşer.' },
{ ex:'dp600', id:'dp-n36', k:AM, s:'dp-op3', type:'yesno',
  q:'Direct Lake on OneLake ile Direct Lake on SQL analitik uç noktası arasındaki farklar için her ifadeye Evet ya da Hayır seç.',
  st:[ { t:'Direct Lake on OneLake, aynı modelde birden fazla Fabric öğesindeki Delta tablolarını kullanabilir.', a:true },
       { t:'Direct Lake on OneLake, okuyamadığı bir sorguda SQL analitik uç noktası üzerinden DirectQuery’ye geri döner.', a:false },
       { t:'Direct Lake on SQL, kaynak tablo bir SQL görünümü olduğunda DirectQuery’ye geri döner.', a:true } ],
  why:'OneLake türü dosyaları doğrudan okur, çok kaynaklıdır ve DirectQuery’ye düşmez; kısıt aşılırsa sorgu hata verir. SQL türü tek kaynaklıdır ve görünüm ya da SQL tabanlı ayrıntılı erişim denetimi varsa DirectQuery’ye düşer.' },
{ ex:'dp600', id:'dp-n37', k:AM, s:'dp-op2', type:'mc',
  q:'SQL uç noktası üzerindeki bir Direct Lake modelinde, Direct Lake ile yanıtlanamayan bir sorgunun DirectQuery’ye geçmek yerine hata vermesini istiyorsun. Ne yaparsın?',
  o:['`DirectLakeBehavior` özelliğini `DirectLakeOnly` yap', 'Modelde otomatik sayfa yenilemeyi kapat', 'SQL uç noktasındaki tüm görünümleri sil', 'Delta tablolarında V-Order yazma iyileştirmesini kapat'], a:0,
  why:'Direct Lake davranışı (Direct Lake behavior) özelliği geri dönüşü denetler: `Automatic` geri dönüşe izin verir, `DirectLakeOnly` geri dönüşü kapatır ve sorgu hata verir. Görünümleri silmek yalnızca bir geri dönüş nedenini ortadan kaldırır.' },
{ ex:'dp600', id:'dp-n38', k:AM, s:'dp-sm3', type:'multi',
  q:'Bir ölçüde aynı ara sonucu `VAR` ile değişkene atamanın iki faydası nedir? İki tane seç.',
  o:['Aynı ifadenin ölçü içinde birden çok kez hesaplanmasını önler', 'Ara sonuçları `RETURN` ile tek tek döndürerek hata ayıklamayı kolaylaştırır', 'Değişken, sonradan bir `CALCULATE` içinde filtre bağlamı değişince yeniden hesaplanır', 'Değişkenin değeri modelde kalıcı olarak saklanır ve diğer ölçülerde kullanılır'], a:[0, 1],
  why:'Değişken tanımlandığı bağlamda bir kez hesaplanır ve sabit kalır; bu hem performans hem okunabilirlik sağlar. Sonraki `CALCULATE` değişkeni yeniden hesaplamaz ve değişken yalnızca o ölçünün içinde yaşar.' },
{ ex:'dp600', id:'dp-n39', k:AM, s:'dp-sm2', type:'multi',
  q:'Bir bankada bir hesabın birden çok sahibi, bir müşterinin birden çok hesabı olabilir. Müşteri seçildiğinde o müşterinin hesaplarının bakiyesini doğru göstermek için hangi iki adımı uygularsın? İki tane seç.',
  o:['Müşteri ve hesap anahtarlarını içeren bir köprü tablo oluşturmak', 'Köprü tablo ile Hesap boyutu arasındaki ilişkide çapraz filtre yönünü iki yönlü yapmak', 'Müşteri adını olgu tablosuna kopyalayıp her hesap satırını sahip sayısı kadar çoğaltmak', 'Müşteri ile olgu tablosu arasında doğrudan çoka çok ilişki kurup toplamları ikiye bölmek'], a:[0, 1],
  why:'Köprü tablo çoka çok ilişkiyi iki bire çok ilişkiye böler; filtrenin Müşteri’den köprü üzerinden Hesap’a, oradan olguya ulaşması için köprü ile Hesap arasındaki ilişki iki yönlü olmalıdır. Satırları çoğaltmak toplamları şişirir.' },
{ ex:'dp600', id:'dp-n40', k:AM, s:'dp-op1', type:'order',
  q:'Yavaş açılan bir rapor sayfasındaki sorunlu görseli bulup DAX’ını iyileştirmek için adımları sırala.',
  items:['Performans Analizini (Performance analyzer) açıp kaydı başlat', 'Görselleri yenile', 'En uzun süren görselde DAX sorgusu ve görsel görüntüleme sürelerini karşılaştır', 'Görselin DAX sorgusunu kopyalayıp DAX sorgu görünümünde ya da DAX Studio’da çalıştırarak iyileştir'],
  extra:['Raporu .pbit şablonu olarak kaydet'],
  why:'Performans Analizi kayıt sırasında yenilenen her görselin süresini bileşenlerine ayırır; DAX sorgusu uzun ise sorgu kopyalanıp ayrı bir araçta denenir. Şablon kaydetmek performansla ilgili değildir.' }
]);

W.PBI_CASES = (W.PBI_CASES || []).concat([
{ ex:'dp600', id:'case-dp-1', title:'Anadolu Lojistik: filo telemetrisi ve sefer analitiği',
  tabs:[
    ['Genel bakış', 'Anadolu Lojistik, İstanbul merkezli kurgusal bir karayolu taşımacılığı şirketidir. Filodaki her araçta bulunan cihaz, birkaç saniyede bir konum, hız ve motor sıcaklığı gönderir. Şirket, operasyon ve finans raporlamasını Microsoft Fabric’e taşıyor.\n- Operasyon ekibi araçları anlık izlemek istiyor.\n- Finans ekibi sefer maliyetlerini aylık raporlarda görmek istiyor.'],
    ['Mevcut ortam', '- Şirketin bir Fabric F kapasitesi ve üç çalışma alanı var: AL-Gelistirme, AL-Test, AL-Uretim.\n- Araç telemetrisi şu an Azure Event Hubs’a geliyor.\n- ERP’deki sefer ve sürücü verileri her gece Parquet dosyası olarak bir ADLS Gen2 hesabına yazılıyor; bu hesabı başka ekipler de kullanıyor.\n- Operasyon analistleri KQL biliyor.\n- Veri mühendisleri PySpark not defterleriyle çalışıyor.\n- Finans ekibi yalnızca Power BI raporlarını tüketiyor.'],
    ['Gereksinimler', '- Telemetri saniyeler içinde sorgulanabilir olmalı; operasyon ekibi son bir saatte hız sınırını (90 km/s) aşan araçları KQL ile izlemeli.\n- ERP dosyaları ADLS Gen2’den Fabric’e kopyalanmamalı.\n- Telemetri tablosu, veri mühendislerinin lakehouse not defterlerinden ek bir kopyalama işi olmadan okunabilmeli.\n- Finans ekibi AL-Uretim’deki raporları görebilmeli ama hiçbir öğeyi düzenleyememeli.\n- Veri mühendisleri AL-Gelistirme’de öğe oluşturup düzenleyebilmeli ama çalışma alanı erişimini yönetememeli.\n- İçerik Geliştirme → Test → Üretim sırasıyla taşınmalı; Üretim’deki anlam modeli Üretim lakehouse’una bağlanmalı.'] ],
  qs:[
    { k:VH, s:'dp-gd4', type:'mc', q:'Araç telemetrisi hangi veri deposuna alınmalıdır?',
      o:['Ambar (warehouse)', 'Eventhouse (KQL veritabanı)', 'Lakehouse’un Files klasörü', 'Import modlu bir anlam modeli'], a:1,
      why:'Saniyeler içinde sorgulama ve KQL bilen operasyon ekibi gereksinimi, akış verisi için tasarlanmış eventhouse’u gösterir. Ambar ve lakehouse toplu yükleme odaklıdır; Import modeli yenilemeye bağlıdır.' },
    { k:VH, s:'dp-gd3', type:'multi', q:'ERP ve telemetri gereksinimlerini karşılamak için hangi iki eylemi uygularsın? İki tane seç.',
      o:['Lakehouse’ta ERP’nin ADLS Gen2 klasörüne işaret eden bir OneLake kısayolu oluşturmak', 'KQL veritabanında OneLake erişilebilirliğini açıp telemetri tablosuna lakehouse’ta kısayol oluşturmak', 'ERP dosyalarını her gece bir kopyalama etkinliğiyle lakehouse’a taşımak', 'Telemetriyi saatlik çalışan bir not defteriyle lakehouse Delta tablosuna kopyalamak', 'ERP dosyalarını `COPY INTO` ile bir ambara yüklemek'], a:[0, 1],
      why:'Kısayol, ERP dosyalarını kopyalamadan lakehouse’ta kullanılabilir yapar. OneLake erişilebilirliği telemetriyi Delta biçiminde OneLake’e açar; not defterleri ek kopyalama işi olmadan okur. Diğer seçenekler kopya oluşturur.' },
    { k:VH, s:'dp-qa3', type:'hot', q:'Operasyon ekibinin hız ihlali sorgusunu tamamla: son bir saatte 90 km/s’i aşan olayları araç başına say ve çoktan aza sırala.',
      code:`AracTelemetri
| where Zaman > {0}(1h) and Hiz > 90
| {1} IhlalSayisi = count() by AracNo
| {2} IhlalSayisi desc`,
      slots:[ { o:['ago', 'now', 'datetime', 'between'], a:0 }, { o:['extend', 'summarize', 'project', 'distinct'], a:1 }, { o:['group by', 'having', 'order by', 'where'], a:2 } ],
      why:'`ago(1h)` şimdiden bir saat öncesini verir; `summarize count() by AracNo` araç başına sayar, `order by ... desc` büyükten küçüğe sıralar. `extend` satır başına sütun ekler, toplamaz.' },
    { k:YON, s:'dp-sg1', type:'yesno', q:'Erişim gereksinimleri için her rol ataması gereksinimi karşılıyor mu?',
      st:[ { t:'Finans ekibine AL-Uretim’de Görüntüleyici (Viewer) rolü vermek gereksinimi karşılar.', a:true },
           { t:'Veri mühendislerine AL-Gelistirme’de Üye (Member) rolü vermek gereksinimi karşılar.', a:false },
           { t:'Veri mühendislerine AL-Gelistirme’de Katkıda Bulunan (Contributor) rolü vermek gereksinimi karşılar.', a:true } ],
      why:'Görüntüleyici içeriği görür ama düzenleyemez. Katkıda Bulunan öğe oluşturup düzenleyebilir ama erişim yönetemez; Üye ise başkalarını çalışma alanına ekleyebildiği için “erişimi yönetememeli” şartını bozar.' },
    { k:YON, s:'dp-lc3', type:'order', q:'İçeriği gereksinimlere uygun biçimde Üretim’e taşımak ve Üretim modelini Üretim lakehouse’una bağlamak için adımları sırala.',
      items:['Bir dağıtım işlem hattı oluşturup AL-Gelistirme, AL-Test ve AL-Uretim’i aşamalara ata', 'İçeriği Geliştirme’den Test’e dağıtıp doğrula', 'Test’teki içeriği Üretim’e dağıt', 'Üretim aşamasında anlam modeli için Üretim lakehouse’una işaret eden bir dağıtım kuralı tanımla', 'Kuralın etkinleşmesi için Test’ten Üretim’e yeniden dağıtıp modeli yenile'],
      extra:['AL-Uretim’i AL-Gelistirme ile aynı Git dalına bağla'],
      why:'İşlem hattı aşamaları sırayla ilerler. Kural hedef aşamada tanımlanır ve o aşamaya yapılan sonraki dağıtımda uygulanır; dağıtım veri taşımadığı için model yenilenir.' } ] },
{ ex:'dp600', id:'case-dp-2', title:'Ege Perakende: mağaza satış analitiği',
  tabs:[
    ['Genel bakış', 'Ege Perakende, İzmir merkezli kurgusal bir mağaza zinciridir. Şirket satış ve kampanya analitiğini Microsoft Fabric’te tek bir anlam modelinde toplamak istiyor.\n- Bölge müdürleri günlük satış raporlarını kullanıyor.\n- BI ekibi raporları ve modeli birlikte geliştiriyor.'],
    ['Mevcut ortam', '- Bir Fabric F kapasitesi ve iki çalışma alanı var: EP-Veri (ambar ve lakehouse) ve EP-Rapor.\n- POS satışları her gece CSV olarak lakehouse’un Files klasörüne geliyor; veri mühendisleri bunları Spark ile Delta tablolarına yazıyor.\n- `EP_Ambar` ambarında `FactSatis`, `DimMagaza` ve `DimUrun` tabloları var; BI ekibi T-SQL biliyor.\n- Pazarlamanın `Kampanya` tablosu lakehouse’ta bir Delta tablosu.\n- Mağaza kodları `00417` gibi baştaki sıfırlarla tutuluyor; CSV’de `Tutar` sütunu “1.250,40” gibi Türkçe biçimli metin olarak geliyor.\n- Rapor geliştiricileri değişiklikleri e-postayla .pbix dosyası olarak paylaşıyor.'],
    ['Gereksinimler', '- Tek bir anlam modeli hem ambardaki tabloları hem lakehouse’taki `Kampanya` tablosunu Direct Lake ile okumalı; sorgular DirectQuery’ye düşmemeli.\n- Bölge müdürleri raporlarda yalnızca kendi bölgelerinin satışlarını görmeli.\n- Ambarda `FactSatis[Maliyet]` sütununu yalnızca Finans rolü sorgulayabilmeli.\n- Analistler için ambarda bölge ve ay bazında satış toplamı veren yeniden kullanılabilir bir görünüm olmalı.\n- Rapor ve model değişiklikleri Git’te satır satır karşılaştırılabilir biçimde tutulmalı.'] ],
  qs:[
    { k:AM, s:'dp-op3', type:'mc', q:'Anlam modeli hangi yaklaşımla kurulmalıdır?',
      o:['Ambarın SQL analitik uç noktası üzerinde Direct Lake on SQL', 'Ambara DirectQuery ile bağlanan bir model', 'Kampanya’yı ambara kopyalayıp Direct Lake on SQL kullanmak', 'Direct Lake on OneLake'], a:3,
      why:'Model iki ayrı öğeden (ambar ve lakehouse) okuyacak ve DirectQuery’ye düşmemeli: bunu Direct Lake on OneLake karşılar. Direct Lake on SQL tek kaynaklıdır ve ambarda sütun düzeyi güvenlik olduğunda DirectQuery’ye düşer.' },
    { k:YON, s:'dp-sg2', type:'multi', q:'Güvenlik gereksinimlerini karşılamak için hangi iki eylemi uygularsın? İki tane seç.',
      o:['Anlam modelinde `USERPRINCIPALNAME()` ile bölge filtreleyen dinamik satır düzeyi güvenlik rolü tanımlamak', 'Ambarda `FactSatis` için Maliyet hariç sütun listeli `GRANT SELECT` vermek, Finans rolüne tüm sütunları açmak', 'Bölge müdürlerine EP-Rapor’da Katkıda Bulunan (Contributor) rolü vermek', 'Maliyet sütununa Gizli duyarlılık etiketi uygulamak', 'Her bölge için raporun ayrı bir kopyasını yayımlamak'], a:[0, 1],
      why:'Bölge kısıtı raporlarda olduğu için anlam modeli RLS’i ile, Maliyet kısıtı ambarda olduğu için sütun düzeyi güvenlikle karşılanır. Direct Lake on OneLake ambarın SQL güvenliğini uygulamaz; bu yüzden rapor tarafı model RLS’ine dayanır.' },
    { k:VH, s:'dp-tr1', type:'hot', q:'Analistler için istenen görünümü tamamla.',
      code:`CREATE VIEW dbo.vw_BolgeAySatis
AS
SELECT m.Bolge, YEAR(s.Tarih) AS Yil, MONTH(s.Tarih) AS Ay,
       {0}(s.Tutar) AS Ciro
FROM dbo.FactSatis AS s
{1} dbo.DimMagaza AS m ON s.MagazaKey = m.MagazaKey
{2} m.Bolge, YEAR(s.Tarih), MONTH(s.Tarih);`,
      slots:[ { o:['COUNT', 'SUM', 'MAX', 'AVG'], a:1 }, { o:['UNION', 'CROSS APPLY', 'INNER JOIN', 'INTO'], a:2 }, { o:['GROUP BY', 'ORDER BY', 'PARTITION BY', 'HAVING'], a:0 } ],
      why:'İstenen “satış toplamı” `SUM` ile, bölge bilgisi `DimMagaza` ile `INNER JOIN` yapılarak alınır ve sonuç bölge-yıl-ay düzeyinde `GROUP BY` ile toplanır. Görünüm içinde `TOP` olmadan `ORDER BY` kullanılamaz.' },
    { k:VH, s:'dp-tr7', type:'mc', q:'POS CSV’lerini Delta tablosuna yazarken mağaza kodu ve `Tutar` sütunları için hangi tür dönüşümü doğrudur?',
      o:['Mağaza kodunu tamsayıya, `Tutar`’ı ondalığa çevirmek', 'İki sütunu da metin olarak bırakmak', 'Kodu metin tutmak, `Tutar`’ı tr-TR kültürüyle ondalığa çevirmek', 'Mağaza kodunu ondalığa, `Tutar`’ı tamsayıya yuvarlayarak çevirmek'], a:2,
      why:'Baştaki sıfırlar bir tanımlayıcının parçasıdır; tamsayıya çevirmek `00417`’yi 417 yapar. Tutar ise hesaplamada kullanılacağı için ondalığa çevrilmeli; virgüllü Türkçe biçim kültür belirtilmeden yanlış ayrıştırılır.' },
    { k:YON, s:'dp-lc2', type:'yesno', q:'Git gereksinimi için her ifade için Evet ya da Hayır seç.',
      st:[ { t:'Raporu .pbip olarak kaydedip proje klasörünü Git deposuna koymak, model ve rapor değişikliklerinin satır satır karşılaştırılmasını sağlar.', a:true },
           { t:'.pbix dosyasını doğrudan Git’e koymak da aynı satır düzeyi karşılaştırmayı sağlar.', a:false },
           { t:'Proje klasöründeki `cache.abf` dosyası, karşılaştırma için depoya eklenmelidir.', a:false } ],
      why:'.pbip rapor ve modeli metin dosyaları (model için TMDL) olarak saklar; Git farkları satır satır gösterir. .pbix ikili bir dosyadır. `cache.abf` veri önbelleğidir ve varsayılan `.gitignore` onu dışarıda bırakır.' } ] }
]);

W.PBI_CERT_TAGS = Object.assign(W.PBI_CERT_TAGS || {}, { dp600: [
  'dp-lc3', 'dp-lc1', 'dp-sg1', 'dp-sg3', 'dp-lc4', 'dp-lc5',
  'dp-gd3', 'dp-qa2', 'dp-gd3', 'dp-gd3', 'dp-gd4', 'dp-tr3', 'dp-tr2',
  'dp-op2', 'dp-op2', 'dp-sm4', 'dp-sm5', 'dp-op4', 'dp-sm4', 'dp-op1', 'dp-sm2', 'dp-sm1', 'dp-op1', 'dp-op1', 'dp-sm1'
] });
})(window);
