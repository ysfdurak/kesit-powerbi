/* Kesit Power BI — DP-600 ek sınav tarzı sorular: “Analitik çözümü yönet” (duyarlılık etiketleri ve onaylama, .pbip,
   etki analizi, öğe izinleri, dağıtım işlem hatları, XMLA, yeniden kullanılabilir varlıklar, Git) ve “Anlam modelini uygula”.
   Tüm sorular özgündür. Ürün ayrıntıları Microsoft Learn sayfalarına göre (Ekim 2026) doğrulandı. */
(function (W) {
var YON = 'Analitik çözümü yönet', AM = 'Anlam modelini uygula';

W.PBI_CERTQ = (W.PBI_CERTQ || []).concat([
/* ================= dp-sg3: duyarlılık etiketleri ve onaylama ================= */
{ ex:'dp600', id:'dp-y01', k:YON, s:'dp-sg3', type:'mc',
  q:'Kiracıda aşağı akış devralma tam otomatik moda (fully automated downstream inheritance) alınmış. “Müşteri” anlam modelinin duyarlılık etiketi (sensitivity label) Genel. Modele bağlı yedi rapor var: beşi etiketini oluşturulurken modelden devralmış (Genel), birine sahibi elle Genel, birine de elle Çok Gizli uygulamış. Modelin etiketini Gizli olarak değiştiriyorsun. Raporların etiketleri ne olur?',
  o:['Yedi raporun hepsi Gizli olur; aşağı akış devralma model etiketini her rapora yazar',
     'Devralınmış etiketli beş rapor Gizli olur, elle Genel verilen rapor da Gizli’ye yükselir; Çok Gizli rapor değişmez',
     'Beş rapor Gizli olur; elle etiketlenen iki rapor etiketini korur',
     'Hiçbir rapor değişmez; model etiketi yalnızca bundan sonra oluşturulacak raporlara geçer'], a:2,
  why:'Aşağı akış devralma elle uygulanmış etiketlerin üzerine hiçbir zaman yazmaz ve bir etiketi daha az kısıtlayıcı olanla değiştirmez. Bu yüzden yalnızca etiketi devralınmış beş rapor Gizli olur. En çekici yanlış olan ikinci şık, elle verilen Genel etiketinin de yükseltileceğini varsayıyor.' },
{ ex:'dp600', id:'dp-y02', k:YON, s:'dp-sg3', type:'multi',
  q:'Ayşe, Satış çalışma alanında Katkıda bulunan (Contributor) rolünde. Satış anlam modeli bugünden itibaren yazarlarca “paylaşıma ve yeniden kullanıma hazır” olarak görülmeli, kalite incelemesinden geçince de kuruluşun yetkili gözden geçirenlerinin onayını gösteren bir rozet almalı. Ayşe’nin ekranında Sertifikalı (Certified) seçeneği gri. Hangi iki eylemi uygularsın? İki tane seç.',
  o:['Ayşe modeli şimdiden Tanıtılmış (Promoted) olarak onaylar',
     'Fabric yöneticisi sertifikayı etkinleştirip yetkili gözden geçirenleri belirler; incelemeden sonra bu kişilerden biri modeli Sertifikalı yapar',
     'Ayşe’ye çalışma alanında Yönetici (Admin) rolü verilir; Sertifikalı seçeneği bu rolle açılır',
     'Modele Gizli duyarlılık etiketi uygulanır; etiketli modeller onaylı modeller arasında listelenir',
     'Ayşe modeli Ana veri (Master data) olarak işaretler; bu rozet sertifikanın yerini tutar'], a:[0, 1],
  why:'Öğe üzerinde yazma izni olan herkes onu Tanıtılmış yapabilir; Katkıda bulunan bu izne sahiptir. Sertifika ve Ana veri yalnızca Fabric yöneticisinin etkinleştirip belirlediği kullanıcılarca verilebilir; çalışma alanı rolü bunu açmaz. Duyarlılık etiketi bir onay türü değildir.' },
{ ex:'dp600', id:'dp-y03', k:YON, s:'dp-sg3', type:'yesno',
  q:'Finans raporu ve anlam modeli şifreleme (koruma) içeren Gizli etiketini taşıyor. Kullanıcılar raporun verisini farklı biçimlerde dışarı aktarıyor; geliştiriciler de raporu Git’te izlemek istiyor. Her ifade için Evet ya da Hayır seç.',
  st:[ { t:'Bir görselin verisi Excel’e aktarıldığında oluşan dosya Gizli etiketini ve korumasını taşır.', a:true },
       { t:'Görselin verisi .csv olarak aktarıldığında da etiket ve koruma dosyaya uygulanır.', a:false },
       { t:'Rapor Genel, model Gizli etiketli olsaydı, raporu .pbix olarak indirince dosyaya daha kısıtlayıcı olan Gizli uygulanırdı.', a:true } ],
  why:'Excel, PDF ve PowerPoint’e aktarma etiketi ve korumayı taşır; .csv gibi desteklenmeyen yollarda etiket uygulanmaz. .pbix indirirken rapor ve model etiketleri farklıysa daha kısıtlayıcı olan uygulanır.' },

/* ================= dp-lc2: Power BI Desktop projesi (.pbip) ================= */
{ ex:'dp600', id:'dp-y04', k:YON, s:'dp-lc2', type:'mc',
  q:'Bir Git deposunda `Satis.SemanticModel` klasörü ve ona `byPath` ile bağlı üç rapor klasörü var. `Finans.Report` raporu bundan sonra yerel klasöre değil, “Satış-Prod” çalışma alanındaki yayımlanmış modele bağlanmalı; Power BI Desktop bu raporu açtığında model düzenleme modunda açılmamalı. Ne yaparsın?',
  o:['`Finans.Report` içindeki `definition.pbir` dosyasında `byPath` yolunu çalışma alanının mutlak adresiyle değiştirmek',
     '`definition.pbir` dosyasındaki `datasetReference` bölümünü `byConnection` ve bir bağlantı dizesiyle değiştirmek',
     '`Satis.SemanticModel` klasöründeki `definition.pbism` dosyasında rapor bağlantısını salt okunur yapmak',
     '`cache.abf` dosyasını silmek; önbellek olmayınca rapor yayımlanmış modele bağlanır'], a:1,
  why:'`byConnection` başvurusu raporu bir Fabric çalışma alanındaki modele bağlantı dizesiyle bağlar ve Desktop modeli düzenleme modunda açmaz. `byPath` yalnızca göreli klasör yolu kabul eder. `cache.abf` olmadan Desktop modeli verisiz açar; bağlantı türü değişmez.' },
{ ex:'dp600', id:'dp-y05', k:YON, s:'dp-lc2', type:'order',
  q:'Bir .pbix raporunu Git’te satır satır karşılaştırılabilir biçimde tutmaya başlayacaksın. Bir ölçünün ifadesini Power BI Desktop açıkken Visual Studio Code’da değiştirmek ve yalnızca kaynak dosyaları depoya göndermek istiyorsun. Adımları doğru sıraya koy.',
  items:['Power BI Desktop’ta .pbix dosyasını açıp Dosya > Farklı kaydet ile Power BI projesi (.pbip) olarak yerel depo klasörüne kaydet',
         'Oluşan `.gitignore` dosyasının `cache.abf` ve `localSettings.json` dosyalarını dışarıda bıraktığını denetleyip ilk commit’i yap',
         'Visual Studio Code’da `.SemanticModel` klasöründeki model tanımında ölçünün ifadesini değiştirip kaydet',
         'Power BI Desktop’un algıladığı dış değişikliği çıkan istemle uygula ve sonucu raporda denetle',
         'Değişikliği commit edip uzak depoya gönder (push)'],
  extra:['`cache.abf` dosyasını da commit et; ekip arkadaşları veriyi depodan alsın', '.pbix dosyasını Tabular Editor ile .pbip’e dönüştür'],
  why:'.pbix ile .pbip arasındaki dönüşüm yalnızca Desktop’ta Dosya > Farklı kaydet ile yapılır. Varsayılan `.gitignore` yerel veri önbelleğini ve kişisel ayarları depo dışında tutar. Desktop dışarıda kaydedilen değişiklikleri algılar ve tek tıkla uygulamayı önerir.' },

/* ================= dp-lc4: etki analizi ================= */
{ ex:'dp600', id:'dp-y06', k:YON, s:'dp-lc4', type:'mc',
  q:'Satış anlam modelinde bir sütunu yeniden adlandıracaksın. Model, başka çalışma alanlarındaki raporları ve bu modelin üzerine kurulmuş bileşik modelleri besliyor; bileşik modellerin de kendi raporları var. Değişiklikten önce dolaylı olanlar dahil etkilenecek tüm öğeleri görmek ve etkilenen ekipleri en az çabayla haberdar etmek istiyorsun. Ne yaparsın?',
  o:['Etki analizinde Tüm aşağı akış öğeleri sekmesine bakıp Kişileri bilgilendir ile ileti göndermek',
     'Etki analizinde Alt öğeler (Child items) sekmesine bakmak; dolaylı öğeler sütun adından etkilenmez',
     'Kendi çalışma alanının köken görünümünü incelemek ve her rapor sahibine ayrı e-posta yazmak',
     'Değişikliği yapıp Kapasite Ölçümleri uygulamasında hata veren sorguları izlemek'], a:0,
  why:'Etki analizinin Tüm aşağı akış öğeleri (All downstream items) sekmesi yalnızca doğrudan alt öğeleri değil, bileşik modeller ve raporları gibi dolaylı bağımlıları da sayar. Kişileri bilgilendir (Notify contacts) tek iletiyi etkilenen tüm çalışma alanlarının iletişim listelerine e-postayla gönderir.' },
{ ex:'dp600', id:'dp-y07', k:YON, s:'dp-lc4', type:'yesno',
  q:'Stok anlam modelinde bir tabloyu kaldırmadan önce etki analizi (impact analysis) yapacaksın. Model, bir kısmına erişimin olmayan altı çalışma alanındaki raporları besliyor. Her ifade için Evet ya da Hayır seç.',
  st:[ { t:'Etki analizini açabilmek için Stok modeli üzerinde yazma iznine sahip olman gerekir.', a:true },
       { t:'Erişimin olmayan çalışma alanlarındaki öğeler etki analizi bölmesinde hiç sayılmaz.', a:false },
       { t:'Kişileri bilgilendir ile gönderdiğin ileti, erişimin olmayan etkilenmiş çalışma alanlarının iletişim listelerine de ulaşır.', a:true } ],
  why:'Etki analizi öğe üzerinde yazma izni ister. Erişimin olmayan öğeler gizlenmez; adları yerine Sınırlı erişim (Limited access) olarak listelenir. Bilgilendirme iletisi, erişimin olmasa bile etkilenen tüm çalışma alanlarının iletişim listelerine gider.' },

/* ================= dp-sg1: çalışma alanı rolleri ve öğe izinleri ================= */
{ ex:'dp600', id:'dp-y08', k:YON, s:'dp-sg1', type:'mc',
  q:'Denetim ekibi Finans ambarındaki (warehouse) tüm tablo ve görünümleri T-SQL ile salt okunur sorgulayabilmeli. Ekip çalışma alanının diğer öğelerini görmemeli ve ambarın dosyalarını Spark ya da OneLake API’leriyle okuyamamalı. En az ayrıcalık ilkesine göre ne yaparsın?',
  o:['Ekibe çalışma alanında Görüntüleyici (Viewer) rolü vermek',
     'Ambarı ek izin seçmeden paylaşmak',
     'Ambarı SQL kullanarak tüm verileri oku (Read all data using SQL) seçeneğiyle paylaşmak',
     'Ambarı Apache Spark ile tüm verileri oku (Read all data using Apache Spark) seçeneğiyle paylaşmak'], a:2,
  why:'Paylaşımdaki ReadData izni tüm tablo ve görünümleri salt okunur sorgulatır; `db_datareader` rolüne denktir ve Spark erişimi vermez. Ek izinsiz paylaşım yalnızca bağlanmaya (Read) izin verir. Görüntüleyici rolü çalışma alanındaki tüm öğeleri açar; ReadAll ise Spark ile dosya erişimi verir.' },
{ ex:'dp600', id:'dp-y09', k:YON, s:'dp-sg1', type:'multi',
  q:'Veri mühendisleri Operasyon çalışma alanında not defteri oluşturup lakehouse’a yeni tablolar yazabilmeli, ama çalışma alanına başka kişi ekleyememeli. Analistler ise kendi çalışma alanlarındaki not defterlerinden bu lakehouse’un verisini Spark ile okuyabilmeli; Operasyon’a üye olmamalı ve hiçbir şeyi değiştirememeli. En az ayrıcalık ilkesine göre hangi iki atamayı yaparsın? İki tane seç.',
  o:['Mühendislere Operasyon’da Katkıda bulunan (Contributor) rolü vermek',
     'Lakehouse’u analistlerle Apache Spark ile tüm verileri oku (Read all with Apache Spark) izniyle paylaşmak',
     'Analistlere Operasyon’da Görüntüleyici (Viewer) rolü vermek',
     'Mühendislere Operasyon’da Üye (Member) rolü vermek',
     'Mühendislere Tables klasörüne yazma izni tanımlayan bir OneLake veri erişim rolü vermek'], a:[0, 1],
  why:'Katkıda bulunan öğe oluşturup düzenleyebilir ama kişi ekleyemez; Üye bunu yapabildiği için fazla yetkilidir. Lakehouse paylaşımı yazma izni vermez ve Spark ile okuma (ReadAll) eklenebilir. Görüntüleyici Spark ile okuyamaz ve üyelik sağlar; OneLake veri erişim rolleri yalnızca okuma izni tanımlar.' },

/* ================= dp-lc3: dağıtım işlem hatları ================= */
{ ex:'dp600', id:'dp-y10', k:YON, s:'dp-lc3', type:'mc',
  q:'Dağıtım işlem hattının yöneticisisin. Üretim aşamasındaki Satış anlam modelinin SQL Server kaynağını üretim sunucusuna yönlendiren bir kural tanımlamak istiyorsun, ama Dağıtım kuralları bölmesinde Veri kaynağı kuralları seçeneği gri. Model Üretim’de mevcut ve bir SQL Server kaynağı kullanıyor. Kuralı en az çabayla nasıl tanımlarsın?',
  o:['Kuralı Geliştirme aşamasında tanımlayıp sonraki dağıtımda Üretim’e taşımak',
     'SQL Server bu kural türünü desteklemediği için kaynağı parametreye çevirip parametre kuralı kullanmak',
     'Önce işlem hattının tüm içeriğini Test’ten Üretim’e yeniden dağıtmak',
     'Üretim’deki modelin sahipliğini devralıp (Take over) kuralı tanımlamak'], a:3,
  why:'Veri kaynağı kuralını yalnızca öğenin sahibi oluşturabilir; sahip değilsen ya da öğenin veri kaynağı yoksa seçenek gri görünür. Kurallar hedef aşamada tanımlanır ve SQL Server veri kaynağı kurallarında desteklenir; yeniden dağıtım sahipliği değiştirmez.' },
{ ex:'dp600', id:'dp-y11', k:YON, s:'dp-lc3', type:'mc',
  q:'Geliştirme aşamasında yeni bir Stok anlam modeli ve ona bağlı Stok raporu oluşturdun; Test aşamasında ikisi de yok. Yalnızca Stok raporunu seçip Test’e dağıttın ve dağıtım başarısız oldu. Rapor Test’te, Test’teki modele bağlı çalışmalı ve diğer öğeler dağıtılmamalı. Ne yaparsın?',
  o:['Test aşamasında rapor için modeli değiştiren bir veri kaynağı kuralı tanımlamak',
     'İlgili öğeleri seç (Select related) ile modeli de seçip birlikte dağıtmak',
     'Aşamadaki tüm öğeleri Test’e dağıtmak; model de bu sırada taşınır',
     'Raporu Power BI Desktop’tan doğrudan Test çalışma alanına yayımlamak'], a:1,
  why:'Bir öğe, bağlı olduğu öğe hedef aşamada yoksa dağıtılamaz. İlgili öğeleri seç, raporun bağlı olduğu modeli de seçer; birlikte dağıtılınca rapor Test’teki modele otomatik bağlanır (autobinding). Raporlar veri kaynağı kuralını desteklemez; tüm öğeleri dağıtmak “diğer öğeler dağıtılmamalı” koşulunu bozar.' },

/* ================= dp-lc5: XMLA uç noktası ================= */
{ ex:'dp600', id:'dp-y12', k:YON, s:'dp-lc5', type:'order',
  q:'Tabular Editor’da geliştirdiğin yeni bir anlam modelini, Fabric kapasitesindeki Finans çalışma alanına XMLA uç noktası üzerinden ilk kez dağıtıp verisiyle kullanıma açacaksın. Kapasitenin XMLA ayarı varsayılan değerinde. Adımları doğru sıraya koy.',
  items:['Kapasite ayarlarının İş yükleri (Workloads) bölümünde XMLA uç noktasını Okuma Yazma (Read Write) yap',
         'Tabular Editor’da dağıtım sihirbazını açıp sunucu olarak çalışma alanının `powerbi://` adresini gir',
         'Çalışma alanında Katkıda bulunan ya da üstü rolü olan hesapla oturum açıp model meta verisini dağıt',
         'Service’te yeni modelin ayarlarında veri kaynağı kimlik bilgilerini gir',
         'Tabloları doldurmak için XMLA üzerinden TMSL `refresh` komutunu çalıştır'],
  extra:['Hesabına modelde yalnızca Derleme (Build) izni verip bu izinle dağıt', 'XMLA uç noktasını Salt okunur (Read Only) bırak; dağıtım bu ayarla da yapılır'],
  why:'XMLA varsayılan olarak salt okunurdur; yazma için kapasitede Okuma Yazma gerekir. Yazma, modelde Yazma izni demektir ve bu izin çalışma alanında Katkıda bulunan ve üstü rollerde vardır; Derleme yalnızca okumaya yeter. Dağıtım meta veriyi taşır; veri, kimlik bilgileri girildikten sonra yenilemeyle yüklenir.' },
{ ex:'dp600', id:'dp-y13', k:YON, s:'dp-lc5', type:'hot',
  q:'“Satis Modeli” anlam modelinin `Siparis` tablosu yıllık bölümlere (partition) ayrılmış ve XMLA okuma-yazma açık. Kaynakta 2025 siparişleri düzeltildi. SSMS’te yalnızca `Siparis-2025` bölümünün verisini yeniden yükleyip bağlı hesaplamaları güncelleyen, diğer bölümlere dokunmayan bir TMSL komutu çalıştıracaksın. Boşlukları doldur.',
  code:`{
  "{0}": {
    "type": "{1}",
    "objects": [
      { "database": "Satis Modeli", "table": "Siparis", "{2}": "Siparis-2025" }
    ]
  }
}`,
  slots:[ { o:['createOrReplace', 'refresh', 'alter'], a:1 },
          { o:['clearValues', 'calculate', 'full'], a:2 },
          { o:['partition', 'segment', 'column'], a:0 } ],
  why:'`refresh` komutu verilen nesneleri yeniler; `full` türü veriyi yeniden yükler ve bağlı nesneleri yeniden hesaplar. `clearValues` bölümü boşaltır, `calculate` veriyi yeniden okumaz. Nesne listesinde `partition` belirtildiği için yalnızca o bölüm işlenir.' },

/* ================= dp-lc6: .pbit, .pbids, paylaşılan modeller ================= */
{ ex:'dp600', id:'dp-y14', k:YON, s:'dp-lc6', type:'mc',
  q:'Yedi bölge analisti için standart bir rapor tasarladın: sayfalar, ölçüler ve ilişkiler herkeste aynı olmalı. Her analist dosyayı açınca kendi bölge veritabanının adını girmeli ve kendi kimlik bilgileriyle bağlanmalı; senin modelindeki veriden hiçbir satır dağıtılmamalı. Ne dağıtırsın?',
  o:['Sunucu ve veritabanı adını içeren bir .pbids dosyası',
     'Veritabanı adını sorgu parametresi olarak alan bir Power BI şablonu (.pbit)',
     'Raporun .pbix dosyası; analistler Veri kaynağı ayarlarından veritabanını değiştirir',
     'Yayımlanmış modelinde her analiste Derleme (Build) izni'], a:1,
  why:'.pbit sayfaları, model tanımını ve sorgu parametrelerini taşır ama veri içermez; açılınca parametre değerini sorar. .pbids yalnızca tek bir bağlantıyı başlatır; sayfa ve model taşımaz. .pbix içe aktarılmış veriyi içerir; Derleme izni de analistleri senin verine bağlar.' },
{ ex:'dp600', id:'dp-y15', k:YON, s:'dp-lc6', type:'mc',
  q:'Pazarlama analistleri onaylı Satış anlam modeline canlı bağlantıyla (live connection) bağlı bir rapor geliştiriyor. Kendi Excel hedef tablolarını rapora ekleyip satış verisiyle ilişkilendirmek istiyorlar. Merkezi Satış modeli değişmemeli ve kopyası oluşturulmamalı. Ne yaparlar?',
  o:['Bu modelde değişiklik yap (Make changes to this model) ile yerel modele Excel tablosu eklemek',
     'Rapora rapor düzeyinde ölçüler ekleyip hedefleri ölçülerde sabit değer olarak yazmak',
     'Satış modelini .pbix olarak indirip Excel tablosunu ekledikten sonra ayrı bir model olarak yayımlamak',
     'Excel tablosunu Tabular Editor ile XMLA üzerinden Satış modeline eklemek'], a:0,
  why:'Bu modelde değişiklik yap canlı bağlantıyı Power BI anlam modeline DirectQuery bağlantısına çevirir ve yeni tablolar eklenebilen yerel bir bileşik model oluşturur; uzak model değişmez. Kaynak modelde Derleme izni gerekir. Rapor düzeyi ölçüler tablo ekleyemez; diğer iki yol ya kopya oluşturur ya merkezi modeli değiştirir.' },

/* ================= dp-lc1: sürüm denetimi ================= */
{ ex:'dp600', id:'dp-y16', k:YON, s:'dp-lc1', type:'mc',
  q:'Operasyon çalışma alanında bir lakehouse, iki not defteri, bir veri işlem hattı ve bir Power BI panosu (dashboard) var. Çalışma alanını Azure DevOps’taki boş bir dala bağlayıp ilk commit’i yaptın; ekip panonun da sürüm geçmişini görmeyi umuyordu ama pano depoda yok. Durumu doğru açıklayan hangisi?',
  o:['Pano bağlantı sırasında çalışma alanından kaldırıldı; dağıtım işlem hattıyla geri getirilmeli',
     'Pano ilk commit’e alınmaz; ikinci commit’te otomatik olarak eklenir',
     'Pano desteklenmeyen bir öğe; çalışma alanında kalır ama commit edilemez',
     'Panoyu commit etmek için çalışma alanı ikinci bir dala bağlanmalı'], a:2,
  why:'Git tümleştirmesi desteklenmeyen öğeleri yok sayar: bunlar depoya kaydedilmez, eşitlenmez ve silinmez. Kaynak denetimi bölmesinde görünseler de commit ya da güncelleme yapılamaz. Bir çalışma alanı aynı anda tek bir dala bağlanır.' },

/* ================= Anlam modelini uygula ================= */
{ ex:'dp600', id:'dp-y17', k:AM, s:'dp-sm1', type:'mc',
  q:'Bileşik bir modelde 2 milyar satırlık `Satislar` olgu tablosu Azure SQL’den DirectQuery ile, aylık toplamları tutan `SatisOzet` tablosu Import ile geliyor. `Musteriler` ve `Tarih` boyutları Import modunda ve iki olgu tablosuyla da ilişkili. `Satislar` ile boyutlar arasındaki ilişkiler sınırlı (limited) olduğu için ayrıntı sorguları yavaş. Olgu tablolarının modunu değiştirmeden, boyut sorgularının mümkün olduğunda önbellekten yanıtlanmasını da istiyorsun. Ne yaparsın?',
  o:['`Musteriler` ve `Tarih` tablolarını da DirectQuery moduna almak',
     '`Satislar` ile boyutlar arasındaki ilişkileri çift yönlü (Both) çapraz filtrelemeye çevirmek',
     '`Musteriler` ve `Tarih` tablolarını Çift (Dual) moduna almak',
     '`SatisOzet` tablosunu kaldırıp tüm görselleri `Satislar` üzerinden sorgulamak'], a:2,
  why:'Çift moddaki bir tablo duruma göre Import ya da DirectQuery gibi davranır: DirectQuery olgu tablosuyla sorgulandığında ilişki normal (regular) kalır, Import tabloyla ya da tek başına sorgulandığında önbellekten yanıt verir. Boyutları DirectQuery yapmak her boyut sorgusunu kaynağa gönderir.' },
{ ex:'dp600', id:'dp-y18', k:AM, s:'dp-op1', type:'multi',
  q:'Azure SQL’e DirectQuery ile bağlı bir raporda kullanıcılar dilimleyicilerde art arda birçok değer seçiyor ve her tıklama tüm görsellerin kaynağa yeni sorgu göndermesine yol açıyor. Ayrıca `Satislar[UrunNo]` hiç boş değil ve her değerin `Urunler` tablosunda karşılığı var, ama kaynağa giden sorgular dış birleştirme (outer join) kullanıyor. Hangi iki değişiklik kaynağa giden yükü azaltır? İki tane seç.',
  o:['`Satislar`–`Urunler` ilişkisinde Başvuru bütünlüğünü varsay (Assume referential integrity) seçeneğini açmak',
     'Sorgu azaltma (Query reduction) seçeneklerinden dilimleyicilere Uygula (Apply) düğmesi eklemek',
     'Modeldeki tüm ilişkileri çift yönlü (Both) çapraz filtrelemeye çevirmek',
     'Ölçülerde toplamları `SUMX(FILTER(Satislar, ...), ...)` kalıbıyla yazmak',
     '`Tarih` tablosunu da DirectQuery yapıp Otomatik tarih/saat seçeneğini açmak'], a:[0, 1],
  why:'Başvuru bütünlüğünü varsaymak DirectQuery’nin dış birleştirme yerine daha verimli iç birleştirme (inner join) göndermesini sağlar. Uygula düğmesi, kullanıcı seçimini bitirene kadar sorgu gönderilmesini erteler. Çift yönlü filtreler ve `FILTER` ile tablo taraması sorguları genellikle ağırlaştırır.' },
{ ex:'dp600', id:'dp-y19', k:AM, s:'dp-sm3', type:'multi',
  q:'Aşağıdaki ölçü, kategori satırlarının her birinde %100 gösteriyor. Ölçü her kategorinin tüm kategorilerin toplamı içindeki payını vermeli.\n`Kategori Payı = VAR Satis = [Toplam Satış] RETURN DIVIDE(Satis, CALCULATE(Satis, ALL(Urunler[Kategori])))`\nHangi iki yazım doğru sonucu verir? İki tane seç.',
  o:['`VAR Satis = [Toplam Satış] VAR Tum = CALCULATE([Toplam Satış], ALL(Urunler[Kategori])) RETURN DIVIDE(Satis, Tum)`',
     '`DIVIDE([Toplam Satış], CALCULATE([Toplam Satış], ALL(Urunler[Kategori])))`',
     '`VAR Satis = [Toplam Satış] RETURN DIVIDE(Satis, CALCULATE(Satis, REMOVEFILTERS()))`',
     '`VAR Tum = CALCULATE([Toplam Satış], ALL(Urunler[Kategori])) RETURN DIVIDE(Tum, Tum)`'], a:[0, 1],
  why:'Bir değişken tanımlandığı bağlamda bir kez hesaplanır ve sabittir; `CALCULATE` filtreleri onu yeniden hesaplatamaz. Bu yüzden payda değişkenle değil ölçüyle yazılmalıdır. `REMOVEFILTERS` de aynı sabit değişkene uygulandığı için sonuç yine %100 olur.' },
{ ex:'dp600', id:'dp-y20', k:AM, s:'dp-sm4', type:'hot',
  q:'“Zaman Zekası” hesaplama grubuna (calculation group) “YoY %” öğesi ekliyorsun. Öğe, seçili ölçünün geçen yılın aynı dönemine göre değişim oranını vermeli. Ölçüler para birimi biçiminde olduğu için öğe şu an değeri ₺ olarak gösteriyor; öğe uygulandığında sonuç yüzde olarak görünmeli. Boşlukları doldur.',
  code:`-- Hesaplama öğesi: YoY %
VAR Simdi = {0}()
VAR Gecen = CALCULATE(SELECTEDMEASURE(), {1}('Tarih'[Tarih]))
RETURN DIVIDE(Simdi - Gecen, Gecen)

-- Öğede Dinamik biçim dizesi (Dynamic format string) açık:
{2}`,
  slots:[ { o:['SELECTEDVALUE', 'SELECTEDMEASURE', 'ISSELECTEDMEASURE'], a:1 },
          { o:['SAMEPERIODLASTYEAR', 'DATESYTD', 'PREVIOUSDAY'], a:0 },
          { o:['"#,##0.0%"', 'SELECTEDMEASUREFORMATSTRING()', '"#,##0 ₺"'], a:0 } ],
  why:'`SELECTEDMEASURE()` öğenin uygulandığı ölçünün yer tutucusudur; `SAMEPERIODLASTYEAR` aynı dönemi bir yıl geri kaydırır. Hesaplama öğeleri varsayılan olarak ölçünün biçimini kullanır; öğede dinamik biçim dizesini açıp yüzde biçimi yazmak bunu değiştirir. `SELECTEDMEASUREFORMATSTRING()` ölçünün kendi ₺ biçimini döndürürdü.' },
{ ex:'dp600', id:'dp-y21', k:AM, s:'dp-sm5', type:'yesno',
  q:'Fabric kapasitesindeki Lojistik çalışma alanında artımlı yenilemeli, 7 GB’lık bir model önümüzdeki yıl 10 GB’ı aşacak. Ekip modele Tabular Editor ile XMLA üzerinden sık değişiklik yazıyor ve çalışma alanında yeni modeller de yayımlanacak. Her ifade için Evet ya da Hayır seç.',
  st:[ { t:'Modelin 10 GB’ı aşabilmesi için modelde Büyük anlam modeli depolama biçimi (Large semantic model storage format) açılmalıdır.', a:true },
       { t:'Çalışma alanı ayarlarında Varsayılan depolama biçimi (Default storage format) olarak büyük biçim seçilirse yeni modeller bu biçimde oluşturulur.', a:true },
       { t:'Büyük depolama biçimi yalnızca 10 GB’ı aşan modellere fayda sağlar; XMLA yazma işlemlerine etkisi yoktur.', a:false } ],
  why:'10 GB’ın ötesine büyümek için büyük depolama biçimi gerekir; çalışma alanının varsayılan depolama biçimi yeni modellerde bunu otomatik açar. Büyük biçim, büyük sayılmayan modellerde bile XMLA yazma performansını iyileştirebilir.' },
{ ex:'dp600', id:'dp-y22', k:AM, s:'dp-op4', type:'order',
  q:'Fabric kapasitesindeki bir modelde `Siparis` tablosu son üç yılı tutmalı, her gece son yedi gün yenilenmeli; bugün gelen siparişler de bir sonraki yenilemeyi beklemeden raporda görünmeli. Kaynak SQL Server ve filtre kaynağa katlanabiliyor (query folding). Adımları doğru sıraya koy.',
  items:['Power Query’de `SiparisTarihi` sütununu `>= RangeStart` ve `< RangeEnd` koşullarıyla katlanabilen bir filtreyle süz',
         'Kapat ve Uygula (Close & Apply) ile filtrelenmiş veriyi yükle',
         'Artımlı yenileme iletişim kutusunda arşiv dönemini 3 yıl, artımlı yenileme dönemini 7 gün olarak tanımla',
         'DirectQuery ile en son veriyi gerçek zamanlı al (Get the latest data in real time with DirectQuery) ve Yalnızca tamamlanmış günleri yenile (Only refresh complete days) seçeneklerini işaretle',
         'Modeli yayımlayıp Service’te ilk yenilemeyi çalıştır'],
  extra:['Filtreden sonra sorgu katlamayı bozan bir özel sütun adımı ekle', 'Filtrede iki sınırda da eşittir kullan (`>= RangeStart` ve `<= RangeEnd`)'],
  why:'Gerçek zamanlı DirectQuery bölümü, yenileme döneminden sonraki satırları her sorguda kaynaktan okur; bu seçenek Yalnızca tamamlanmış günleri yenile ayarını zorunlu kılar ve katlanmayan dönüşümlere izin vermez. Eşittir yalnızca bir sınırda olmalıdır. Bölümler Service’teki ilk yenilemede oluşur.' }
]);

W.PBI_SERIES = (W.PBI_SERIES || []).concat([
{ ex:'dp600', id:'ser-dp-4', k:YON, s:'dp-lc3',
  q:'Üretim içeriği yıllardır “Satış” çalışma alanında duruyor. Yeni bir üç aşamalı dağıtım işlem hattı kuruyorsun; Geliştirme ve Test aşamalarına atanmış çalışma alanı yok. Satış çalışma alanı Üretim aşamasında olmalı ve Geliştirme ile Test, Üretim’deki tüm içeriğin işlem hattıyla eşleştirilmiş kopyalarıyla en az çabayla doldurulmalı. Önerilen çözüm hedefi karşılıyor mu?',
  sols:[
    { t:'Çözüm: Satış çalışma alanını Üretim aşamasına atar, tüm içeriği önce boş Test aşamasına, ardından boş Geliştirme aşamasına geri dağıtırsın (backward deployment).', a:true,
      why:'Geri dağıtım, hedef aşama boş olduğunda ve tüm öğeler dağıtıldığında yapılabilir. Boş aşamaya dağıtım yeni bir çalışma alanı oluşturur ve öğeler arasındaki bağları korur.' },
    { t:'Çözüm: Satış çalışma alanını Üretim aşamasına atar, yalnızca anlam modelini ve iki raporu seçerek Test’e geri dağıtırsın; kalan öğeleri sonra ayrıca dağıtırsın.', a:false,
      why:'Geri dağıtımda seçmeli dağıtım yapılamaz; tüm öğeler birlikte dağıtılmalıdır. Ayrıca ilk dağıtımdan sonra Test boş olmayacağı için sonraki geri dağıtımlar da yapılamaz.' },
    { t:'Çözüm: Satış çalışma alanını Geliştirme aşamasına atar ve içeriği Test ile Üretim aşamalarına ileri dağıtırsın.', a:false,
      why:'Bu yol aşamaları doldurur ama Satış çalışma alanı Geliştirme aşamasında kalır ve Üretim yeni bir çalışma alanı olur; “Satış Üretim aşamasında olmalı” koşulu bozulur.' } ] }
]);
})(window);
