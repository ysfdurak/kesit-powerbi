/* Kesit Power BI — Sınav deneyimlerinde öne çıkan ama uygulamada eksik kalan biçim ve konular:
   “aynı senaryo, farklı çözüm” serileri, vakalara ek sorular, T-SQL, harici araçlar, Git dallanma akışı,
   PL-300 prosedürel (“nerede, hangi adımlarla”) ve DAX hata ayıklama soruları. Tüm sorular özgündür.
   Güncel ayrıntılar Microsoft Learn sayfalarına göre (Ekim 2026) doğrulandı. */
(function (W) {
var VH = 'Veriyi hazırla', YON = 'Analitik çözümü yönet', AM = 'Anlam modelini uygula';
var PV = 'Veriyi hazırla', PM = 'Modelle', PG = 'Görselleştir ve analiz et', PY = 'Yönet ve güvenli hâle getir';

W.PBI_CERTQ = (W.PBI_CERTQ || []).concat([
/* ================= DP-600: T-SQL ================= */
{ ex:'dp600', id:'dp-x01', k:VH, s:'dp-qa2', type:'hot',
  q:'Ambardaki `dbo.GunlukMagazaSatis` tablosunda her satır bir mağazanın bir günlük cirosu. Her mağaza için, tarih sırasıyla o güne kadarki birikimli ciroyu (running total) satırları kaybetmeden yeni bir sütun olarak döndürmek istiyorsun. Boşlukları doldur.',
  code:`SELECT MagazaNo, SatisTarihi, GunlukCiro,
       SUM(GunlukCiro) {0} (
           {1} MagazaNo
           ORDER BY SatisTarihi
           {2}
       ) AS BirikimliCiro
FROM dbo.GunlukMagazaSatis;`,
  slots:[ { o:['WITHIN GROUP', 'OVER', 'FILTER'], a:1 },
          { o:['GROUP BY', 'CLUSTER BY', 'PARTITION BY'], a:2 },
          { o:['ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW', 'ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING', 'ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING'], a:0 } ],
  why:'`SUM(...) OVER (PARTITION BY ...)` toplamı satırları gruplamadan her satıra yazar; `PARTITION BY MagazaNo` her mağazada baştan başlatır. `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` çerçevesi ilk satırdan geçerli satıra kadar toplar. `GROUP BY` satırları tek satıra indirirdi; `CURRENT ROW AND UNBOUNDED FOLLOWING` kalan toplamı verirdi.' },
{ ex:'dp600', id:'dp-x02', k:VH, s:'dp-qa2', type:'hot',
  q:'Her bölgenin aylık cirosunu ve bir önceki aya göre farkını tek sorguda döndürmek istiyorsun. Önce ayları bir ortak tablo ifadesinde (CTE) topla, sonra farkı pencere fonksiyonuyla hesapla. Boşlukları doldur.',
  code:`{0} Aylik AS (
    SELECT Bolge,
           DATEFROMPARTS(YEAR(SiparisTarihi), MONTH(SiparisTarihi), 1) AS Ay,
           SUM(Tutar) AS Ciro
    FROM dbo.Satis
    GROUP BY Bolge, DATEFROMPARTS(YEAR(SiparisTarihi), MONTH(SiparisTarihi), 1)
)
SELECT Bolge, Ay, Ciro,
       Ciro - {1}(Ciro, 1) OVER ({2} Bolge ORDER BY Ay) AS OncekiAyaFark
FROM Aylik;`,
  slots:[ { o:['DECLARE', 'WITH', 'CREATE VIEW'], a:1 },
          { o:['LEAD', 'FIRST_VALUE', 'LAG'], a:2 },
          { o:['PARTITION BY', 'GROUP BY', 'ORDER BY'], a:0 } ],
  why:'CTE `WITH ad AS (...)` ile tanımlanır ve hemen ardından gelen sorguda tablo gibi kullanılır. `LAG(Ciro, 1)` aynı bölümdeki bir önceki satırın değerini getirir; `LEAD` bir sonrakini getirirdi. `PARTITION BY Bolge` olmasaydı bir bölgenin ilk ayı başka bölgenin son ayıyla karşılaştırılırdı.' },
{ ex:'dp600', id:'dp-x03', k:VH, s:'dp-qa2', type:'mc',
  q:'`dbo.Satis` tablosunda her siparişin, kendi bölgesinin toplam cirosu içindeki payını hesaplamak istiyorsun. Sipariş satırlarının hepsi sonuçta kalmalı ve tek sorgu yazılmalı. Hangi ifadeyi `SELECT` listesine eklersin?',
  o:['`Tutar * 1.0 / SUM(Tutar) OVER (PARTITION BY Bolge)`',
     '`Tutar * 1.0 / SUM(Tutar)` ve sorgunun sonuna `GROUP BY Bolge`',
     '`Tutar * 1.0 / SUM(Tutar) OVER (ORDER BY Bolge)`',
     '`Tutar * 1.0 / (SELECT SUM(Tutar) FROM dbo.Satis)`'], a:0,
  why:'`ORDER BY` içermeyen `SUM(...) OVER (PARTITION BY Bolge)` her satıra kendi bölgesinin toplamını yazar; satırlar korunur. `GROUP BY` satırları bölge başına teke indirir; `OVER (ORDER BY ...)` birikimli toplam üretir; alt sorgu ise tüm tablonun toplamını verir.' },
{ ex:'dp600', id:'dp-x04', k:VH, s:'dp-tr6', type:'hot',
  q:'`dbo.Siparis` tablosunda `Indirim` bazen NULL, `Ciro` bazen 0, `MusteriNo` bazen NULL. Sorgu indirimi boşsa 0 göstermeli, ciro 0 olduğunda sıfıra bölme hatası vermek yerine oranı NULL döndürmeli ve yalnızca müşterisi bilinen siparişleri listelemeli. Boşlukları doldur.',
  code:`SELECT SiparisNo,
       {0}(Indirim, 0) AS Indirim,
       Kar / {1}(Ciro, 0) AS KarOrani
FROM dbo.Siparis
WHERE MusteriNo {2};`,
  slots:[ { o:['NULLIF', 'COALESCE', 'IIF'], a:1 },
          { o:['NULLIF', 'COALESCE', 'ISNULL'], a:0 },
          { o:['<> NULL', 'IS NOT NULL', "<> ''"], a:1 } ],
  why:'`COALESCE(Indirim, 0)` ilk NULL olmayan değeri döndürür. `NULLIF(Ciro, 0)` ciro 0 ise NULL verir ve NULL’a bölme sonucu NULL olur, hata oluşmaz. NULL hiçbir değere eşit ya da eşit değil sayılmadığı için `<> NULL` hiçbir satır döndürmez; `IS NOT NULL` kullanılmalıdır.' },
{ ex:'dp600', id:'dp-x05', k:VH, s:'dp-tr4', type:'mc',
  q:'Ambarda, sütunları ve türleri elle tanımlamadan tek bir ifadeyle yeni bir `dbo.MusteriOzet` tablosu oluşturup 2026’da en az 3 siparişi olan müşterilerin sipariş sayısı ve toplam tutarıyla doldurmak istiyorsun. Tablo fiziksel olarak saklanmalı. Hangi ifade gereksinimi karşılar?',
  o:['`CREATE VIEW dbo.MusteriOzet AS SELECT MusteriNo, COUNT(*) AS Adet, SUM(Tutar) AS Toplam FROM dbo.Siparis WHERE YEAR(Tarih) = 2026 GROUP BY MusteriNo HAVING COUNT(*) >= 3;`',
     '`CREATE TABLE dbo.MusteriOzet AS SELECT MusteriNo, COUNT(*) AS Adet, SUM(Tutar) AS Toplam FROM dbo.Siparis WHERE YEAR(Tarih) = 2026 AND COUNT(*) >= 3 GROUP BY MusteriNo;`',
     '`INSERT INTO dbo.MusteriOzet (MusteriNo, Adet, Toplam) SELECT MusteriNo, COUNT(*) AS Adet, SUM(Tutar) AS Toplam FROM dbo.Siparis WHERE YEAR(Tarih) = 2026 GROUP BY MusteriNo HAVING COUNT(*) >= 3;`',
     '`CREATE TABLE dbo.MusteriOzet AS SELECT MusteriNo, COUNT(*) AS Adet, SUM(Tutar) AS Toplam FROM dbo.Siparis WHERE YEAR(Tarih) = 2026 GROUP BY MusteriNo HAVING COUNT(*) >= 3;`'], a:3,
  why:'`CREATE TABLE ... AS SELECT` (CTAS) tabloyu sorgunun sonucundan şemasıyla birlikte oluşturur ve doldurur. Toplama koşulu `WHERE`’de değil, gruplamadan sonra `HAVING`’de yazılır. Görünüm veriyi saklamaz; `INSERT INTO` ise tablonun önceden oluşturulmuş olmasını ister.' },
{ ex:'dp600', id:'dp-x06', k:VH, s:'dp-tr3', type:'hot',
  q:'Ambardaki `dbo.DimMusteri` boyutunu her gece `dbo.StgMusteri` hazırlık tablosundan güncelliyorsun: şehri değişen mevcut müşterilerin şehri güncellenmeli (geçmiş tutulmuyor), boyutta olmayan yeni müşteriler eklenmeli. Tek bir `MERGE` ifadesi yazmak istiyorsun. Boşlukları doldur.',
  code:`MERGE dbo.DimMusteri AS h
USING dbo.StgMusteri AS k
    {0} h.MusteriNo = k.MusteriNo
WHEN MATCHED {1} h.Sehir <> k.Sehir THEN
    UPDATE SET h.Sehir = k.Sehir
WHEN NOT MATCHED {2} THEN
    INSERT (MusteriNo, Sehir) VALUES (k.MusteriNo, k.Sehir);`,
  slots:[ { o:['WHERE', 'ON', 'USING'], a:1 },
          { o:['AND', 'OR', 'WHERE'], a:0 },
          { o:['BY SOURCE', 'BY TARGET', 'AND h.Sehir IS NULL'], a:1 } ],
  why:'`MERGE` eşleşme koşulunu `ON` ile alır; `WHEN MATCHED AND ...` ek koşul ekler, böylece yalnızca şehri değişen satırlar güncellenir. `WHEN NOT MATCHED BY TARGET` kaynakta olup hedefte olmayan satırlar içindir ve `INSERT` burada yapılır. `BY SOURCE` ise hedefte olup kaynakta olmayan satırlar içindir; orada ekleme yapılamaz.' },

/* ================= DP-600: harici araçlar ================= */
{ ex:'dp600', id:'dp-x07', k:AM, s:'dp-op1', type:'mc',
  q:'Bir matrisin DAX sorgusunu DAX Studio’da Sunucu Zamanlamaları (Server Timings) açıkken çalıştırdın. Toplam süre 4.200 ms; bunun 3.900 ms’si formül motorunda (FE), 300 ms’si depolama motorunda (SE) geçiyor ve onlarca küçük SE sorgusu var. En olası neden ve ilk iyileştirme adımı hangisi?',
  o:['Sütunlar çok yer kaplıyor; VertiPaq Analyzer ile büyük sütunları bulup kaldırmak',
     'DAX mantığı formül motorunu yoruyor; ölçüyü yeniden yazmak',
     'Görselin ekrana çizilmesi yavaş; matrisi daha basit bir görselle değiştirmek',
     'Önbellek soğuk; sorguyu tekrar çalıştırıp ikinci süreyi esas almak'], a:1,
  why:'Sürenin büyük kısmı tek iş parçacıklı formül motorundaysa ve çok sayıda küçük SE sorgusu varsa sorun genellikle iç içe yineleyiciler ya da gereksiz bağlam geçişi gibi DAX mantığıdır. SE süresi zaten düşük olduğu için sütun boyutu darboğaz değildir; Sunucu Zamanlamaları görselin çizim süresini ölçmez.' },
{ ex:'dp600', id:'dp-x08', k:YON, s:'dp-lc5', type:'mc',
  q:'Üretim çalışma alanındaki bir anlam modelinde artımlı yenileme var ve beş yıllık geçmiş bölümler (partitions) halinde duruyor; XMLA uç noktası okuma-yazma açık. Geliştirme kopyanda üç yeni ölçü ekledin. Ölçüleri en az yönetim çabasıyla, geçmiş verileri yeniden yüklemeden ve modelin diğer nesnelerine dokunmadan Üretim’e almak istiyorsun. Ne yaparsın?',
  o:['Power BI Desktop’tan modeli aynı adla Üretim’e yeniden yayımlamak',
     'Tabular Editor’da Best Practice Analyzer’ı çalıştırıp önerileri uygulamak',
     'DAX Studio’da ölçüleri `DEFINE MEASURE` ile tanımlayıp sorguyu çalıştırmak',
     'ALM Toolkit ile karşılaştırıp yalnızca yeni ölçüleri dağıtmak'], a:3,
  why:'ALM Toolkit iki modelin meta verisini karşılaştırır, seçilen farkları XMLA uç noktası üzerinden hedefe uygular ve artımlı yenilemenin geçmiş verisini koruyarak dağıtım yapabilir. Desktop’tan yeniden yayımlamak Service’teki modeli değiştirir ve bölümleri yeniden oluşturmak için tam yenileme gerekir. `DEFINE MEASURE` yalnızca o sorgu için geçerlidir; BPA ise kural denetimi yapar, dağıtım yapmaz.' },

/* ================= DP-600: Git / DevOps ================= */
{ ex:'dp600', id:'dp-x09', k:YON, s:'dp-lc1', type:'order',
  q:'Ekibin ortak “Satış-Dev” çalışma alanı Azure DevOps’taki `main` dalına bağlı. Bir geliştirici, ortak alanı bozmadan kendi dalında bir anlam modelini değiştirip değişikliği ekibe kazandırmalı. Adımları doğru sıraya koy.',
  items:['Satış-Dev’de Kaynak denetimi (Source control) bölmesinden Dallanma (Branch out) ile yeni dal ve yeni çalışma alanı oluştur',
         'Yeni çalışma alanında anlam modelini değiştir ve kaydet',
         'Değişikliği Kaynak denetimi bölmesinden özellik dalına commit et',
         'Azure DevOps’ta özellik dalından `main` dalına çekme isteği (pull request) açıp birleştir',
         'Satış-Dev’de Kaynak denetimi bölmesinden Tümünü güncelle (Update all) ile `main`’deki değişikliği al'],
  extra:['Değişikliği doğrudan Satış-Dev’de yapıp `main` dalına commit et', 'Özellik çalışma alanını dağıtım işlem hattıyla Satış-Dev’e dağıt'],
  why:'Bir çalışma alanı tek bir dala bağlanır; en iyi uygulama her geliştiricinin kendi dalına bağlı ayrı bir çalışma alanında çalışmasıdır. Değişiklik özellik dalına commit edilir, Git sağlayıcısında çekme isteğiyle `main`’e birleştirilir; ortak alan da Kaynak denetimi bölmesinden güncellenir. Dağıtım işlem hattı Git dalları arasında değişiklik taşımaz.' },

/* ================= PL-300: prosedürel ================= */
{ ex:'pl300', id:'pl-x01', k:PV, s:'pl-gc4', type:'order',
  q:'SQL Server’daki 80 milyon satırlık `Siparis` tablosu için artımlı yenileme (incremental refresh) hazırlayacaksın. Desktop’ta yalnızca küçük bir dönem yüklenmeli, aynı satır iki bölüme düşmemeli. Adımları doğru sıraya koy.',
  items:['Power Query’de Tarih/Saat (Date/Time) türünde `RangeStart` ve `RangeEnd` parametrelerini oluştur',
         'Sipariş tarihi sütununa `>= RangeStart` ve `< RangeEnd` koşullu özel filtre uygula',
         'Kapat ve Uygula (Close & Apply) ile filtrelenmiş veriyi yükle',
         'Veri bölmesinde tabloya sağ tıklayıp Artımlı yenileme’de arşiv ve yenileme dönemlerini tanımla',
         'Modeli yayımlayıp Service’te ilk yenilemeyi çalıştır'],
  extra:['Parametreleri Metin (Text) türünde oluştur', 'Tarih sütununa `>= RangeStart` ve `<= RangeEnd` filtresi uygula'],
  why:'Artımlı yenileme, adları büyük-küçük harf duyarlı ve Tarih/Saat türündeki `RangeStart`/`RangeEnd` parametreleriyle yapılan filtreye dayanır; eşittir işareti yalnızca bir tarafta olmalıdır, yoksa sınırdaki satır iki bölüme düşebilir. İlke Desktop’ta tanımlanır ama bölümler Service’teki ilk yenilemede oluşur.' },
{ ex:'pl300', id:'pl-x02', k:PY, s:'pl-ws2', type:'mc',
  q:'“Satış” çalışma alanından yayımlanmış bir uygulamanın Satış ve Finans adlı iki hedef kitlesi (audience) var. Çalışma alanına yeni bir “Kampanya” raporu ekledin. Satış kitlesi raporu uygulamada görebilmeli ama Finans kitlesi görmemeli. En az yönetim çabasıyla ne yaparsın?',
  o:['Raporu Satış kullanıcılarıyla doğrudan paylaşmak; uygulamayı güncellememek',
     'Rapor için ayrı bir çalışma alanı ve yalnızca Satış’a açık ikinci bir uygulama oluşturmak',
     'Uygulamayı güncelle’de raporu yalnızca Satış kitlesi için görünür yapmak',
     'Rapora bir RLS rolü ekleyip Finans kullanıcılarını bu role eklememek'], a:2,
  why:'Çalışma alanındaki değişiklikler, Uygulamayı güncelle (Update app) seçilene kadar uygulamaya yansımaz; yayımlanmış uygulamaya eklenen yeni içerik her kitle için varsayılan olarak gizlidir. Hedef kitle (Audience) sekmesinde raporu yalnızca Satış için görünür yapıp güncellemek yeterlidir. RLS satırları süzer, raporun görünürlüğünü belirlemez.' },
{ ex:'pl300', id:'pl-x03', k:PG, s:'pl-us8', type:'mc',
  q:'Bir rapor sayfasında klavye kullanıcıları Tab tuşuyla gezerken önce dilimleyicilere, sonra KPI kartlarına, en son grafiğe gelmeli; sayfadaki dekoratif şekiller ekranda kalmalı ama ekran okuyucu tarafından seslendirilmemeli. Görünüm (View) şeridinden Seçim (Selection) bölmesini açtın. Sonra ne yaparsın?',
  o:['Katman sırası (Layer order) sekmesinde nesneleri istenen sıraya sürükle, dekoratif şekilleri göz simgesiyle gizle',
     'Görselleri Hizala ile soldan sağa diz; sekme sırası yerleşime göre kendiliğinden oluşur',
     'Sekme sırası (Tab order) sekmesinde sırala; dekoratif şekillerin numarasına tıklayıp sıradan çıkar',
     'Dekoratif şekillerin alternatif metnini boş bırak ve görselleri sırayla yeniden adlandır'], a:2,
  why:'Sekme sırası (Tab order) sekmesi, klavye ve ekran okuyucu kullanıcılarının nesneler arasında hangi sırayla gezeceğini belirler; bir nesnenin numarasına tıklamak onu sekme sırasından çıkarır ama ekranda bırakır. Katman sırası yalnızca üst üste binmeyi belirler; göz simgesi nesneyi ekrandan da gizler.' },
{ ex:'pl300', id:'pl-x04', k:PY, s:'pl-sg3', type:'mc',
  q:'Desktop’ta “Temsilci” rolünü `Calisanlar[Eposta] = USERPRINCIPALNAME()` filtresiyle tanımladın. Raporu yayımlamadan ve rol filtresini değiştirmeden, ayse@kuzey.com kullanıcısının ne göreceğini kontrol etmek istiyorsun. Ne yaparsın?',
  o:['Rolü geçici olarak `Calisanlar[Eposta] = "ayse@kuzey.com"` yapıp raporu incelemek',
     'Modelleme > Rol olarak görüntüle’de Diğer kullanıcı’ya adresi yazıp rolü seçmek',
     'DAX sorgu görünümünde `EVALUATE ROW("u", USERPRINCIPALNAME())` çalıştırmak',
     'Service’te anlam modelinin Güvenlik sayfasında Rol olarak test et’i kullanmak'], a:1,
  why:'Desktop’taki Rol olarak görüntüle (View as) penceresinde rolü seçip Diğer kullanıcı (Other user) alanına UPN girersen `USERPRINCIPALNAME()` o değeri döndürür ve dinamik filtre o kullanıcı için sınanır. Service’teki Rol olarak test et yayımlamayı gerektirir; filtreyi değiştirmek koşula aykırıdır.' },
{ ex:'pl300', id:'pl-x05', k:PY, s:'pl-ws6', type:'order',
  q:'Şirket içi SQL Server’dan Import ile veri alan bir anlam modelini yayımladın. Model her gün 06:00’da yenilenmeli; bağlantı birden çok model ve yönetici tarafından paylaşılabilmeli ve analistin bilgisayarı kapalıyken de çalışmalı. Adımları doğru sıraya koy.',
  items:['Sürekli açık bir sunucuya şirket içi veri ağ geçidini standart modda kurup kaydet',
         'Service’te ağ geçidine, sunucu ve veritabanı adları Desktop’takiyle aynı olan bir SQL Server bağlantısı ekle',
         'Anlam modeli ayarlarında Ağ geçidi ve bulut bağlantıları (Gateway and cloud connections) bölümünde bu bağlantıyı seçip uygula',
         'Zamanlanmış yenilemeyi aç ve 06:00’ı ekle'],
  extra:['Ağ geçidini kişisel modda analistin dizüstü bilgisayarına kur', 'Modeli DirectQuery’ye çevirip ağ geçidini kaldır'],
  why:'Şirket içi kaynak için Service’in veriye ulaşacağı bir ağ geçidi gerekir; paylaşılabilir bağlantılar standart modda kurulur, kişisel mod tek kullanıcılıktır. Bağlantı Desktop’taki sunucu ve veritabanıyla birebir aynı olmalı ki modelin kaynağıyla eşleşsin; zamanlama en son ayarlanır. DirectQuery de şirket içi kaynak için ağ geçidi ister.' },

/* ================= PL-300: DAX hata ayıklama ================= */
{ ex:'pl300', id:'pl-x06', k:PM, s:'pl-dx2', type:'mc',
  q:'Satırlarında `Urunler[Kategori]` olan bir matriste şu ölçü her kategoride aynı değeri gösteriyor:\n`Pahalı Ürün Satışı = CALCULATE([Net Satış], FILTER(ALL(Urunler), Urunler[Fiyat] > 1000))`\nNeden?',
  o:['`[Net Satış]` içindeki durum filtresi kategori filtresinin üzerine yazıyor',
     '`ALL(Urunler)` kategori filtresini de kaldırıyor',
     'Urunler’den Satislar’a giden ilişki tek yönlü olduğu için filtre ulaşmıyor',
     '`FILTER` satır bağlamı oluşturduğu için `[Net Satış]` bağlam geçişine uğramıyor'], a:1,
  why:'`FILTER(ALL(Urunler), ...)` tüm ürün tablosunu tarar ve sonucu Urunler’in bütün sütunlarına filtre olarak koyar; satırdan gelen Kategori filtresi bu yüzden geçersiz kalır. `Urunler[Fiyat] > 1000` gibi basit bir koşul yalnızca Fiyat sütununun filtresini değiştirir ve kategori filtresi korunur.' },
{ ex:'pl300', id:'pl-x07', k:PM, s:'pl-dx3', type:'hot', dax:true,
  q:'Satırlarında `Tarih[YilAy]` olan bir matriste `CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Satislar[Tarih]))` ölçüsü her ayda boş dönüyor. Tarih tablosu işaretli ve Satislar[Tarih] ile ilişkili. Ölçüyü düzelt.',
  code:'Satış GY Düzeltilmiş =\nCALCULATE([Net Satış], {0}({1}))',
  slots:[ { o:['SAMEPERIODLASTYEAR', 'PREVIOUSYEAR', 'DATESYTD'], a:0 },
          { o:['Satislar[TeslimTarihi]', 'Tarih[Tarih]', 'Satislar[Tarih]'], a:1 } ],
  grid:[ { t:'Tarih', c:'YilAy' }, { t:'Tarih', c:'Yil' } ],
  why:'Zaman zekâsı fonksiyonuna olgu tablosunun tarih sütunu verilince kaydırılmış tarihler Satislar[Tarih] üzerine konur, ama satırdan gelen Tarih[YilAy] filtresi yerinde kalır; ikisinin kesişimi boştur. İşaretli tarih tablosunun `Tarih[Tarih]` sütunu kullanılınca CALCULATE tarih tablosundaki filtreyi geçen yılın aynı dönemiyle değiştirir. `PREVIOUSYEAR` her ayda bütün önceki yılı verirdi.' }
]);

/* ================= “Aynı senaryo, farklı çözüm” serileri ================= */
W.PBI_SERIES = [
{ ex:'pl300', id:'ser-pl-1', k:PY, s:'pl-sg3',
  q:'“Satış” anlam modelinde bölgeye göre filtreleyen RLS rolleri var ve her rolün üyesi ilgili bölgenin Entra güvenlik grubu. Bölge müdürleri raporda yalnızca kendi bölgelerini görmeli ve modeli kullanarak kendi çalışma alanlarında yeni raporlar oluşturabilmeli, ama modelin bulunduğu çalışma alanındaki içerikleri düzenleyememeli. Önerilen çözüm hedefi karşılıyor mu?',
  sols:[
    { t:'Çözüm: Bölge müdürlerine modelin çalışma alanında Katkıda bulunan (Contributor) rolünü verirsin.', a:false,
      why:'Katkıda bulunan rolü içerikleri düzenleme yetkisi verir ve bu roldeki kullanıcılara RLS uygulanmaz; iki koşul da bozulur.' },
    { t:'Çözüm: Müdürleri çalışma alanına eklemeden, anlam modelinde Derleme (Build) izni verirsin; RLS rol üyelikleri olduğu gibi kalır.', a:true,
      why:'Derleme izni modelden başka çalışma alanlarında rapor oluşturmayı sağlar ve düzenleme yetkisi vermez; RLS Derleme izni olan Görüntüleyicilere de uygulanır.' },
    { t:'Çözüm: Müdürleri modelin çalışma alanında Görüntüleyici (Viewer) yapar, ayrıca modelde Derleme izni verirsin.', a:true,
      why:'Görüntüleyici içerikleri düzenleyemez ve RLS’ye tabidir; Derleme izni kendi alanlarında rapor oluşturmalarını sağlar.' } ] },
{ ex:'pl300', id:'ser-pl-2', k:PY, s:'pl-ws6',
  q:'Bir Import anlam modeli şirket içi bir SQL Server veritabanından ve SharePoint Online’daki bir Excel dosyasından veri alıyor. Model her gün 07:00, 12:00 ve 17:00’de otomatik olarak yenilenmeli; yenileme bir analistin bilgisayarının açık olmasına bağlı olmamalı. Önerilen çözüm hedefi karşılıyor mu?',
  sols:[
    { t:'Çözüm: Bir sunucuya standart modda şirket içi veri ağ geçidi kurar, SQL Server bağlantısını ağ geçidine ekleyip modele eşler ve üç saatlik zamanlanmış yenileme tanımlarsın.', a:true,
      why:'Şirket içi kaynak için sürekli açık bir sunucudaki standart ağ geçidi gerekir; SharePoint Online bulut kaynağıdır ve ağ geçidi gerektirmez.' },
    { t:'Çözüm: Modeli yayımlar ve ağ geçidi kurmadan üç saatlik zamanlanmış yenileme tanımlarsın; Excel dosyası zaten bulutta olduğu için yenileme çalışır.', a:false,
      why:'SQL Server şirket içinde olduğu için Service ona ağ geçidi olmadan ulaşamaz; yenileme başarısız olur.' },
    { t:'Çözüm: Ağ geçidini kişisel modda (personal mode) analistin dizüstü bilgisayarına kurup zamanlamayı tanımlarsın.', a:false,
      why:'Kişisel mod analistin bilgisayarına bağlıdır; bilgisayar kapalıyken yenileme çalışmaz ve bu koşul hedefe aykırıdır.' } ] },
{ ex:'pl300', id:'ser-pl-3', k:PM, s:'pl-op2',
  q:'Bir rapor sayfasında 28 görsel var ve sayfa geç açılıyor. Performans Analizi’nde (Performance Analyzer) çoğu görselin DAX sorgusu 100 ms’nin altında, ama Diğer (Other) süreleri birkaç saniyeye çıkıyor. Hedef, sayfanın açılış süresini belirgin biçimde kısaltmak. Önerilen çözüm hedefi karşılıyor mu?',
  sols:[
    { t:'Çözüm: Ölçüleri `VAR` değişkenleriyle yeniden yazarak DAX sorgu sürelerini kısaltırsın.', a:false,
      why:'Sorgu süreleri zaten kısa; zaman, görsellerin birbirini beklediği Diğer kategorisinde geçiyor. DAX’ı hızlandırmak bunu çözmez.' },
    { t:'Çözüm: Ayrı KPI kartlarını tek bir çok satırlı kart görseline toplar, ikincil görselleri detaylandırma ya da araç ipucu sayfalarına taşıyarak sayfadaki görsel sayısını azaltırsın.', a:true,
      why:'Diğer süresi görsellerin sırayla işlenirken birbirini beklemesini içerir; görsel sayısını azaltmak bekleme kuyruğunu kısaltır.' },
    { t:'Çözüm: Modeli Import’tan DirectQuery’ye çevirirsin.', a:false,
      why:'DirectQuery her görselin sorgusunu kaynağa gönderir; sorgular genelde daha yavaşlar ve görsel sayısından doğan bekleme azalmaz.' } ] },
{ ex:'dp600', id:'ser-dp-1', k:VH, s:'dp-gd3',
  q:'Başka bir ekibin ADLS Gen2 hesabında Delta biçiminde tutulan `Musteri` tablosunu bir Fabric lakehouse’ta kullanmak istiyorsun. Veri ADLS’de kalmalı ve kopyalanmamalı; tablo lakehouse’un SQL analitik uç noktasından sorgulanabilmeli ve en az yönetim çabası gerekmeli. Önerilen çözüm hedefi karşılıyor mu?',
  sols:[
    { t:'Çözüm: Lakehouse’un Tables bölümünde, Delta klasörüne işaret eden bir ADLS Gen2 OneLake kısayolu oluşturursun.', a:true,
      why:'Kısayol veriyi kopyalamadan OneLake’ten erişilebilir kılar; Tables altındaki bir Delta kısayolu tablo olarak tanınır ve SQL analitik uç noktasında görünür.' },
    { t:'Çözüm: Bir veri işlem hattında (pipeline) her gece çalışan Kopyalama etkinliğiyle tabloyu lakehouse’a yazarsın.', a:false,
      why:'Kopyalama etkinliği veriyi OneLake’e kopyalar ve zamanlama yönetimi gerektirir; “kopyalanmamalı” koşulu bozulur.' },
    { t:'Çözüm: Files bölümünde bir kısayol oluşturup bir not defteriyle veriyi Tables altındaki yeni bir Delta tablosuna yazarsın.', a:false,
      why:'Not defteri veriyi yeni bir tabloya yazarak kopyalar ve düzenli çalıştırılması gerekir; hem kopyalama hem yönetim çabası doğar.' } ] },
{ ex:'dp600', id:'ser-dp-2', k:VH, s:'dp-qa2',
  q:'Ambardaki `dbo.UrunCiro` tablosunda Bolge, Urun ve Ciro sütunları var. Her bölgede ciroya göre ilk 3 sıradaki ürünleri listeleyen bir sorgu yazmalısın; cirosu eşit ürünler aynı sırayı paylaşmalı ve ikisi de listede yer almalı. Önerilen çözüm hedefi karşılıyor mu?',
  sols:[
    { t:'Çözüm: Bir CTE’de `RANK() OVER (PARTITION BY Bolge ORDER BY Ciro DESC) AS Sira` hesaplar, dış sorguda `WHERE Sira <= 3` ile süzersin.', a:true,
      why:'`RANK` eşit değerlere aynı sırayı verir ve bölüm her bölgede yeniden başlar; eşitlik varsa listede 3’ten fazla ürün de olabilir, bu da istenen davranıştır.' },
    { t:'Çözüm: Aynı sorguyu `ROW_NUMBER() OVER (PARTITION BY Bolge ORDER BY Ciro DESC)` ile yazıp `<= 3` ile süzersin.', a:false,
      why:'`ROW_NUMBER` eşit cirolu ürünlere farklı numaralar verir; sınırdaki eşit ürünlerden biri listeden düşebilir.' },
    { t:'Çözüm: `SELECT TOP 3 WITH TIES Bolge, Urun, Ciro FROM dbo.UrunCiro ORDER BY Ciro DESC` yazarsın.', a:false,
      why:'`TOP` tüm tabloya uygulanır; bölge başına değil, bütün bölgeler içinde en yüksek 3 ciroyu döndürür.' } ] },
{ ex:'dp600', id:'ser-dp-3', k:AM, s:'dp-op2',
  q:'Bir Direct Lake anlam modeli bir lakehouse’taki Delta tablolarını okuyor. Bir işlem hattı tabloları saatte bir yeniden yüklüyor. Raporlar her yüklemeden sonra yeni veriyi elle işlem yapılmadan göstermeli, veri ikinci kez kopyalanmamalı ve kullanıcılar yarım kalmış bir yüklemenin verisini görmemeli. Önerilen çözüm hedefi karşılıyor mu?',
  sols:[
    { t:'Çözüm: Modelde “Direct Lake verilerini güncel tut” (Keep your Direct Lake data up to date) ayarını kapatır, işlem hattının son adımına anlam modelini yenileyen bir etkinlik eklersin.', a:true,
      why:'Otomatik güncelleme kapalıyken model, yenileme (framing) tetiklenene kadar eski sürümü gösterir; yenilemeyi yüklemenin sonunda çalıştırmak tutarlı ve güncel veri sağlar.' },
    { t:'Çözüm: Modeli Import moduna çevirip saatlik zamanlanmış yenileme tanımlarsın.', a:false,
      why:'Import veriyi modele kopyalar; “ikinci kez kopyalanmamalı” koşulu bozulur ve yenileme zamanı yüklemeyle eşleşmeyebilir.' },
    { t:'Çözüm: Otomatik güncellemeyi kapatır ve günde bir kez gece zamanlanmış yenileme tanımlarsın.', a:false,
      why:'Model yalnızca gece yenilenir; saatlik yüklemelerden sonra raporlar yeni veriyi göstermez.' } ] }
];

/* ================= Vakalara ek sorular ================= */
W.PBI_CASE_ADD = {
'case-pl-1': [
  { k:PY, s:'pl-sg1', type:'mc',
    q:'Finans analistlerinin tüm bölgelerin verisini görme gereksinimini en az yönetim çabasıyla nasıl karşılarsın?',
    o:['Filtresi olmayan bir “Finans” rolü oluşturup analistleri bu role eklemek',
       'Analistleri tüm bölge güvenlik gruplarına üye yapmak',
       'Ek işlem gerekmez; Katkıda bulunan rolüne RLS uygulanmaz',
       'Analistlere anlam modelinde Derleme (Build) izni vermek'], a:2,
    why:'RLS yalnızca Görüntüleyici izniyle erişenleri süzer; Yönetici, Üye ve Katkıda bulunan rollerinin model üzerinde düzenleme yetkisi olduğu için onlara uygulanmaz. Analistler zaten Katkıda bulunan olacağından ek bir rol ya da grup üyeliği gerekmez; Derleme izni RLS’yi atlatmaz.' },
  { k:PM, s:'pl-dm4', type:'mc',
    q:'Özeti kaldırılmış (unpivot) hedef tablosunda her satır bir bölge ve bir ay (Oca, Şub…) içeriyor; satışlar ise gün düzeyinde. Hedefi satışla aynı görselde bölge ve ay bazında karşılaştırmak için modeli nasıl kurarsın?',
    o:['Hedef ve satış tablolarını Bolge sütunuyla doğrudan çoka çok ilişkilendirmek',
       'Hedefe ay başı tarihi ekleyip Tarih’e, Bolge’yi ortak bölge boyutuna bağlamak',
       'Hedef tablosunu ay adı metniyle (“Oca”) Tarih tablosunun Ay sütununa ilişkilendirmek',
       'Hedefleri birleştirme (merge) ile satış tablosuna her güne eşit pay düşecek şekilde dağıtmak'], a:1,
    why:'Farklı ayrıntı düzeyindeki iki olgu tablosu, ortak boyutlar (Tarih ve Bölge) üzerinden karşılaştırılır; aylık hedef ayın ilk günüyle Tarih tablosuna bağlanır ve ay ya da üstü düzeyde doğru sonuç verir. Ay adı yıllar arasında tekrarlandığı için tek tarafta benzersiz değildir.' } ],
'case-pl-2': [
  { k:PG, s:'pl-us9', type:'yesno',
    q:'Canlı Filo sayfasında değişiklik algılamalı sayfa yenilemesi (change detection) kullanacaksın. Her ifade için Evet ya da Hayır seç.',
    st:[ { t:'Seçilen değişiklik algılama ölçüsü belirlenen aralıkta tek bir sorguyla kaynağa sorulur; değer değişmedikçe görseller yenilenmez.', a:true },
         { t:'Modelde birden çok değişiklik algılama ölçüsü tanımlayıp her görsel için ayrı bir ölçü seçebilirsin.', a:false },
         { t:'Kapasite yöneticisinin belirlediği en kısa aralıktan daha kısa bir aralık girersen Service yöneticinin belirlediği değeri uygular.', a:true } ],
    why:'Değişiklik algılamada yalnızca ölçünün sorgusu düzenli olarak kaynağa gider; bu, 40 operatörün açık tuttuğu sayfada Azure SQL yükünü azaltır. Bir modelde yalnızca bir değişiklik algılama ölçüsü olabilir ve en kısa aralığı kapasite yöneticisi belirler.' },
  { k:PY, s:'pl-sg1', type:'mc',
    q:'Bölge planlamacıları Sevkiyat modeline dayanan raporlarını Planlama çalışma alanına yayımlayabilmeli. En az ayrıcalık ilkesine göre Planlama çalışma alanında hangi rolü verirsin?',
    o:['Görüntüleyici (Viewer) ve modelde Derleme izni', 'Üye (Member)', 'Yönetici (Admin)', 'Katkıda bulunan (Contributor)'], a:3,
    why:'Bir çalışma alanına içerik yayımlayıp düzenleyebilen en düşük rol Katkıda bulunan’dır. Görüntüleyici yayımlayamaz; Üye ve Yönetici gereğinden fazla yetki (paylaşma, erişim yönetimi) verir. Modele erişim ise Operasyon’daki Derleme izniyle ayrıca sağlanır.' } ],
'case-dp-1': [
  { k:VH, s:'dp-gd3', type:'mc',
    q:'Azure Event Hubs’a gelen telemetriyi saniyeler içinde eventhouse’taki KQL veritabanına almak istiyorsun. Ne kullanırsın?',
    o:['Saatlik zamanlanmış bir veri akışı Gen2 (Dataflow Gen2)', 'Event Hubs’a işaret eden bir OneLake kısayolu', 'Her gece çalışan bir Kopyalama etkinliği içeren işlem hattı', 'Kaynağı Event Hubs, hedefi eventhouse olan bir eventstream'], a:3,
    why:'Eventstream, Event Hubs gibi akış kaynaklarından olayları sürekli alıp eventhouse’a düşük gecikmeyle yazar. Veri akışı ve işlem hattı zamanlanmış toplu işlerdir, “saniyeler içinde” koşulunu karşılamaz; Event Hubs bir kısayol hedefi değildir.' },
  { k:VH, s:'dp-gd4', type:'mc',
    q:'Veri mühendisleri ERP’den gelen sefer ve sürücü verisini temizleyip birleştirerek finans raporları için tablolar üretecek. Sonuç tabloları hangi veri deposunda tutulmalı?',
    o:['Lakehouse', 'Eventhouse (KQL veritabanı)', 'Ambar (warehouse)', 'Import modlu bir anlam modeli'], a:0,
    why:'Veri mühendisleri PySpark not defterleriyle çalışıyor; lakehouse, Spark ile Delta tablolarına yazmak için doğal hedeftir ve raporlar bu tabloları Direct Lake ile okuyabilir. Ambara yazım T-SQL ile yapılır; eventhouse akış ve zaman serisi verisi içindir.' } ],
'case-dp-2': [
  { k:VH, s:'dp-gd3', type:'hot',
    q:'Her gece yalnızca o günün POS CSV dosyaları geliyor; önceki günlerin satırları `PosSatis` tablosunda kalmalı. Not defterindeki yazma satırını tamamla.',
    code:`df = spark.read.option("header", True).csv("Files/pos/gunluk/*.csv")
df.write.format("{0}").mode("{1}").saveAsTable("PosSatis")`,
    slots:[ { o:['csv', 'delta', 'parquet'], a:1 }, { o:['overwrite', 'append', 'ignore'], a:1 } ],
    why:'Lakehouse tabloları Delta biçimindedir; `format("delta")` ve `saveAsTable` yönetilen bir Delta tablosu yazar. `append` yeni günün satırlarını ekler; `overwrite` önceki günleri silerdi, `ignore` tablo varsa hiçbir şey yazmazdı.' },
  { k:YON, s:'dp-lc1', type:'mc',
    q:'Rapor geliştiricilerinin değişiklikleri e-postayla .pbix olarak paylaşması yerine, BI ekibinin EP-Rapor’daki model ve raporlar üzerinde değişiklik geçmişiyle birlikte çalışmasını istiyorsun. Çalışma alanı düzeyinde ne yaparsın?',
    o:['EP-Rapor için bir dağıtım işlem hattı oluşturmak', 'Tüm geliştiricileri EP-Rapor’da Yönetici yapmak', 'EP-Rapor’u bir Git deposuna bağlamak', '.pbix dosyalarını bir SharePoint klasöründe tutmak'], a:2,
    why:'Git tümleştirmesi çalışma alanındaki öğeleri bir depo dalına bağlar; değişiklikler commit edilir, geçmiş tutulur ve dallarla birlikte çalışılabilir. Dağıtım işlem hattı içeriği aşamalar arasında taşır ama sürüm geçmişi tutmaz; SharePoint .pbix için satır düzeyi karşılaştırma sağlamaz.' } ]
};
})(window);
