/* Kesit Power BI — Power BI menüleri başvurusu. Her komut: [ad, ne yapar, ne zaman / ipucu, ilgili ders] */
(function (W) {
W.PBI_MENUS = [
  { grp: 'Desktop şeridi', tabs: [
    { id: 'dosya', name: 'Dosya', desc: 'Dosya işlemleri, seçenekler, dışa aktarma ve yayımlama.', cmds: [
      ['Yeni / Aç / Kaydet / Farklı kaydet (New / Open / Save / Save as)', 'Raporu .pbix ya da Power BI Projesi (.pbip) olarak kaydeder.', 'Ekip hâlinde ve Git ile çalışacaksan .pbip seç.', 'yasam-dongusu'],
      ['Veri al (Get data)', 'Veri alma penceresini açar (Giriş → Veri al ile aynı).', 'Yeni bir kaynak eklerken.', 'veri-alma'],
      ['İçeri aktar (Import)', 'Power BI şablonu (.pbit), Excel çalışma kitabı içeriği (Power Pivot modeli) ya da özel görsel (.pbiviz) içeri aktarır.', 'Excel\'deki Power Pivot modelini Power BI\'a taşırken; AppSource dışı özel görsel eklerken.', 'aile'],
      ['Dışa aktar → Power BI şablonu (Export → Power BI template)', 'Veri olmadan model, ölçüler ve rapor tasarımını .pbit dosyasına kaydeder.', 'Standart bir rapor başlangıcını ekiple paylaşmak için.', 'yasam-dongusu'],
      ['Dışa aktar → PDF (Export → PDF)', 'Görünür sayfaları PDF\'e aktarır.', 'Hızlı paylaşım; resmî belge için sayfalandırılmış rapor daha uygundur.', 'sayfalandirilmis'],
      ['Yayımla (Publish)', 'Raporu ve modeli Power BI Service\'te bir çalışma alanına gönderir.', 'Geliştirme bitince; önce kaydet.', 'calisma-alani'],
      ['Seçenekler ve ayarlar → Seçenekler (Options and settings → Options)', 'Genel (Genel: önizleme özellikleri, bölgesel ayarlar, güvenlik) ve Geçerli dosya (Veri yükleme: otomatik tarih/saat, ilişkileri otomatik algıla; Rapor ayarları: dışa aktarma, kişiselleştirme) ayarları.', 'Her yeni projede: otomatik tarih/saati kapat, bölgesel ayarı kontrol et.', 'tarih-tablosu'],
      ['Seçenekler ve ayarlar → Veri kaynağı ayarları (Options and settings → Data source settings)', 'Kaynakların kimlik bilgilerini ve gizlilik düzeylerini düzenler; kaynağı değiştirir.', 'Sunucu/dosya yolu değiştiğinde, “Formula.Firewall” hatasında.', 'pq-model']
    ] },
    { id: 'giris', name: 'Giriş', desc: 'Veri, sorgular ve en sık kullanılan hesap komutları.', cmds: [
      ['Yapıştır / Kes / Kopyala / Biçim boyacısı (Paste / Cut / Copy / Format painter)', 'Görselleri kopyalar; biçim boyacısı bir görselin biçimini başka bir görsele uygular.', 'Bir kartı tasarlayıp diğer kartlara biçimini aktarmak için biçim boyacısı.', 'bicim-temel'],
      ['Veri al (Get data)', 'Bağlayıcı listesini açar: Excel, SQL Server, SharePoint, Web, OData, Dataverse, Fabric kaynakları…', 'Yeni kaynak.', 'veri-alma'],
      ['Excel çalışma kitabı / SQL Server / OneLake kataloğu (Excel workbook / SQL Server / OneLake catalog)', 'Sık kullanılan bağlayıcılara kısayollar. OneLake kataloğu Fabric\'teki lakehouse, warehouse ve anlam modellerini listeler.', 'Paylaşılan bir anlam modeline bağlanmak (canlı bağlantı) için OneLake kataloğu.', 'veri-alma'],
      ['Veri gir (Enter data)', 'Elle küçük bir tablo oluşturur (Power Query\'de saklanır).', 'Parametre, segment sınırları, eşleme tabloları.', 'segmentasyon'],
      ['Son kaynaklar (Recent sources)', 'Son kullanılan bağlantılar.', 'Hızlı yeniden bağlanma.', 'veri-alma'],
      ['Verileri dönüştür (Transform data)', 'Power Query Düzenleyicisi\'ni açar.', 'Temizlik, birleştirme, şekillendirme.', 'pq-temel'],
      ['Verileri dönüştür → Veri kaynağı ayarları / Parametreleri düzenle (Transform data → Data source settings / Edit parameters)', 'Kaynak ve parametre değerlerini düzenler.', 'Geliştirme/canlı ortam geçişi.', 'pq-model'],
      ['Yenile (Refresh)', 'Tüm sorguları kaynaktan yeniden yükler.', 'Kaynak verisi değiştiğinde.', 'veri-alma'],
      ['Yeni görsel (New visual)', 'Tuvale boş bir görsel ekler.', 'Rapor tasarımı.', 'gorsel-temel'],
      ['Metin kutusu / Daha fazla görsel (Text box / More visuals)', 'Metin ya da AppSource\'tan özel görsel ekler.', 'Açıklama metni, madde grafiği gibi özel görseller.', 'gorsel-secimi'],
      ['Yeni ölçü / Hızlı ölçü (New measure / Quick measure)', 'DAX ölçüsü ya da sihirbazla hızlı ölçü oluşturur.', 'Her hesap için açık ölçü yaz.', 'dax-giris'],
      ['Duyarlılık (Sensitivity)', 'Rapora Microsoft Purview duyarlılık etiketi uygular.', 'Gizli veri içeren raporlarda.', 'yonetisim'],
      ['Yayımla (Publish)', 'Service\'e yayımlar.', 'Geliştirme sonu.', 'calisma-alani'],
      ['Copilot', 'Copilot bölmesini açar: rapor sayfası önerisi, anlatı, model özeti, DAX yardımı.', 'Fikir ve ilk taslak için; sonucu her zaman doğrula.', 'hizli-olcu']
    ] },
    { id: 'ekle', name: 'Ekle', desc: 'Sayfaya eklenen öğeler: sayfalar, görseller, yapay zekâ görselleri, şekiller, düğmeler.', cmds: [
      ['Yeni sayfa / Sayfayı çoğalt (New page / Duplicate page)', 'Boş sayfa ya da mevcut sayfanın kopyası.', 'Aynı düzende farklı konu için çoğalt.', 'tema-sayfa'],
      ['Yeni görsel (New visual)', 'Boş görsel.', 'Tasarım.', 'gorsel-temel'],
      ['Soru-Cevap (Q&A; kaldırılıyor)', 'Doğal dil sorusuyla görsel üreten eski Soru-Cevap görseli. Microsoft kaldırıyor (Learn: Şubat 2027; önceki duyuru Aralık 2026); mevcut Soru-Cevap görselleri de çalışmayacak.', 'Yeni raporlarda kullanma; yerine Copilot (raporla sohbet) kullanılır.', 'analiz-ozellikleri'],
      ['Anahtar etkileyiciler (Key influencers)', 'Bir sonucu en çok etkileyen alanları bulan yapay zekâ görseli.', '“İadeyi ne artırıyor?”', 'analiz-ozellikleri'],
      ['Ayrıştırma ağacı (Decomposition tree)', 'Bir ölçüyü boyutlara dallandırarak ayrıştırır.', 'Kök neden analizi, sunumda canlı keşif.', 'analiz-ozellikleri'],
      ['Anlatı (Narrative)', 'Sayfanın verisini özetleyen dinamik metin (Copilot / akıllı anlatı).', 'Yönetici özetine bir paragraf.', 'analiz-ozellikleri'],
      ['Sayfalandırılmış rapor (Paginated report)', 'Etkileşimli raporun içine sayfalandırılmış rapor görseli ekler.', 'Yazdırılabilir listeyi aynı sayfada vermek için.', 'sayfalandirilmis'],
      ['Power Apps / Power Automate', 'Rapora uygulama ya da akış düğmesi gömer.', 'Rapordan veri yazma, onay akışı tetikleme.', 'yonetisim'],
      ['Metin kutusu (Text box)', 'Biçimli metin; içine dinamik değer (ölçü) eklenebilir.', 'Başlık, açıklama, dipnot.', 'tema-sayfa'],
      ['Düğmeler (Buttons)', 'Geri, Bilgi, Yer işareti, Gezgin (sayfa/yer işareti gezgini) düğmeleri; eylem atanır.', 'Gezinme, grafik/tablo geçişi, filtre temizleme.', 'hikaye'],
      ['Şekiller (Shapes)', 'Dikdörtgen, çizgi, ok vb.; eylem atanabilir.', 'Arka plan kutuları (tercihen tuval arka plan görseli kullan).', 'tema-sayfa'],
      ['Görüntü (Image)', 'Logo ya da resim; eylem atanabilir.', 'Logo, simge tabanlı gezinme.', 'tema-sayfa']
    ] },
    { id: 'modelleme', name: 'Modelleme', desc: 'İlişkiler, DAX nesneleri, parametreler ve güvenlik.', cmds: [
      ['İlişkileri yönet (Manage relationships)', 'İlişkileri listeler; yeni ilişki, kardinalite, çapraz filtre yönü, etkin/pasif ayarı.', 'Otomatik algılanan ilişkileri kontrol etmek için.', 'model-temel'],
      ['Yeni ölçü (New measure)', 'DAX ölçüsü.', 'Toplamlar, oranlar, karşılaştırmalar.', 'dax-giris'],
      ['Hızlı ölçü (Quick measure)', 'Sihirbazla ölçü.', 'Başlangıç; üretilen DAX\'ı oku ve düzelt.', 'hizli-olcu'],
      ['Yeni sütun (New column)', 'Hesaplanmış sütun (satır başına, yenilemede).', 'Dilimleyici/eksen için satır etiketi; mümkünse Power Query.', 'dax-giris'],
      ['Yeni tablo (New table)', 'Hesaplanmış tablo (CALENDAR, SUMMARIZE, DATATABLE…).', 'Tarih tablosu, yardımcı ve parametre tabloları.', 'tarih-tablosu'],
      ['Yeni parametre → Sayısal aralık (New parameter → Numeric range)', 'Ne olur parametresi: GENERATESERIES tablosu + değer ölçüsü + kaydırıcı.', 'Senaryo analizi, dinamik İlk N.', 'segmentasyon'],
      ['Yeni parametre → Alanlar (New parameter → Fields)', 'Alan parametresi: kullanıcı eksen ya da ölçüyü dilimleyiciden seçer.', 'Ölçü seçici, eksen seçici.', 'hesaplama-gruplari'],
      ['Hesaplama grubu (Calculation group)', 'Ölçülere uygulanan hesaplama öğeleri (SELECTEDMEASURE) oluşturur.', 'Zaman zekâsı varyasyonları, para birimi.', 'hesaplama-gruplari'],
      ['Rolleri yönet (Manage roles)', 'RLS rolleri ve DAX filtre ifadeleri.', 'Statik/dinamik satır düzeyi güvenlik.', 'guvenlik'],
      ['Farklı görüntüle (View as)', 'Raporu bir rolün ya da kullanıcının gözünden gösterir.', 'RLS testi.', 'guvenlik'],
      ['Soru-Cevap kurulumu (Q&A setup; kaldırılıyor)', 'Eş anlamlılar ve dil öğretme. Soru-Cevap ile birlikte kalkıyor; yerini Giriş → Yapay zekâ için verileri hazırla (Prep data for AI) alıyor.', 'Copilot’un modeli doğru anlaması için yapay zekâ veri şeması, onaylı cevaplar ve yapay zekâ talimatları tanımla.', 'analiz-ozellikleri']
    ] },
    { id: 'gorunum', name: 'Görünüm', desc: 'Tema, düzen, mobil görünüm ve yardımcı bölmeler.', cmds: [
      ['Temalar (Themes)', 'Hazır tema seç, özelleştir, JSON yükle/kaydet.', 'Proje başında kurumsal tema.', 'tema-sayfa'],
      ['Sayfa görünümü (Page view)', 'Sayfaya sığdır, genişliğe sığdır, gerçek boyut.', 'Uzun sayfalarda genişliğe sığdır.', 'tema-sayfa'],
      ['Mobil düzen (Mobile layout)', 'Telefon düzenini tasarlar.', 'Yöneticiler mobilden bakıyorsa.', 'mobil-erisilebilirlik'],
      ['Kılavuz çizgileri / Izgaraya yapış / Nesneleri kilitle (Gridlines / Snap to grid / Lock objects)', 'Hizalama yardımcıları; kilit, nesnelerin yanlışlıkla kaymasını önler.', 'Tasarım boyunca açık.', 'tema-sayfa'],
      ['Filtreler (Filters)', 'Filtreler bölmesini gösterir/gizler.', 'Filtre düzenleme.', 'filtreler'],
      ['Yer işaretleri (Bookmarks)', 'Yer işaretleri bölmesi.', 'Hikâye, geçişler.', 'hikaye'],
      ['Seçim (Selection)', 'Seçim bölmesi: görünürlük, katman, gruplar, sekme sırası.', 'Yer işaretleriyle birlikte; erişilebilirlik.', 'hikaye'],
      ['Performans Analizi (Performance Analyzer)', 'Görsellerin DAX, çizim ve diğer sürelerini kaydeder.', 'Yavaş rapor teşhisi.', 'performans'],
      ['Dilimleyicileri eşitle (Sync slicers)', 'Dilimleyicileri sayfalar arasında eşitler.', 'Çok sayfalı raporlarda tutarlı seçim.', 'hikaye']
    ] },
    { id: 'iyilestir', name: 'İyileştir', desc: 'Büyük modellerde rapor tasarımını hızlandıran ayarlar.', cmds: [
      ['Görselleri duraklat (Pause visuals)', 'Görseller sorgu göndermeyi durdurur; tasarım yaparken her değişiklikte bekleme olmaz.', 'DirectQuery ve büyük modellerde tasarım sırasında.', 'performans'],
      ['İyileştirme ön ayarları (Optimization presets)', 'Sorgu azaltma, etkileşim ve uygula düğmesi ayarlarını tek seferde değiştirir.', 'Kaynak yavaşsa “Sorgu azaltma” ön ayarı.', 'performans'],
      ['Sorgu azaltma ayarları (Query reduction settings)', 'Çapraz filtrelemeyi varsayılan olarak kapat, dilimleyicilere “Uygula” düğmesi ekle.', 'DirectQuery\'de her tıklamanın sorgu üretmesini önlemek için.', 'performans'],
      ['Performans Analizi (Performance Analyzer)', 'Görünüm sekmesindekinin aynısı.', '—', 'performans']
    ] },
    { id: 'yardim', name: 'Yardım', desc: 'Belgeler, topluluk ve sürüm bilgisi.', cmds: [
      ['Kılavuzlu öğrenme / Belgeler / Eğitim videoları (Guided learning / Documentation / Training videos)', 'Microsoft Learn kaynakları.', 'Sertifika hazırlığı.', 'pl300'],
      ['Topluluk / Destek (Community / Support)', 'Forum, destek talebi.', 'Hata ve sorular.', 'aile'],
      ['Hakkında (About)', 'Sürüm numarası.', 'Bir özelliğin sürümünde olup olmadığını kontrol etmek için.', 'aile']
    ] },
    { id: 'harici', name: 'Harici araçlar', desc: 'Kurulu topluluk araçlarını Desktop\'tan açar.', cmds: [
      ['DAX Studio', 'DAX sorgularını çalıştırır; sunucu zamanlamaları ve sorgu planı; VertiPaq Analyzer.', 'Ölçü optimizasyonu, model boyutu analizi.', 'dax-opt'],
      ['Tabular Editor', 'Modeli toplu düzenler: hesaplama grupları, OLS, görüntü klasörleri, Best Practice Analyzer, komut dosyaları.', 'Kurumsal model geliştirme.', 'kurumsal-model'],
      ['ALM Toolkit', 'İki model arasındaki farkları karşılaştırır ve seçerek dağıtır.', 'Sürüm karşılaştırma, kısmi dağıtım.', 'yasam-dongusu']
    ] }
  ] },
  { grp: 'Bağlamsal sekmeler', tabs: [
    { id: 'tablo', name: 'Tablo araçları', desc: 'Veri bölmesinde bir tablo seçiliyken.', cmds: [
      ['Ad (Name)', 'Tablonun adını değiştirir; tüm DAX başvuruları otomatik güncellenir.', 'İş dilinde adlar (Satislar, Musteriler).', 'model-temel'],
      ['Tarih tablosu olarak işaretle (Mark as date table)', 'Zaman zekâsının kullanacağı tarih tablosunu ve sütununu belirler.', 'Kendi tarih tablon olduğunda mutlaka.', 'tarih-tablosu'],
      ['İlişkileri yönet (Manage relationships)', 'İlişkiler penceresi.', 'Model kontrolü.', 'model-temel'],
      ['Yeni ölçü / Yeni sütun / Hızlı ölçü (New measure / New column / Quick measure)', 'Bu tabloya DAX nesnesi ekler.', '—', 'dax-giris']
    ] },
    { id: 'sutun', name: 'Sütun araçları', desc: 'Bir sütun seçiliyken.', cmds: [
      ['Ad / Veri türü (Name / Data type)', 'Sütunu yeniden adlandırır, türünü değiştirir.', 'Tür düzeltmeleri mümkünse Power Query\'de.', 'pq-temel'],
      ['Biçim (Format)', 'Sayı, para, yüzde, tarih biçimi; ondalık basamak.', 'Görüntü tutarlılığı.', 'bicim-temel'],
      ['Özetleme (Summarization)', 'Varsayılan toplama (Topla, Ortalama, Toplama yapma).', 'Anahtar ve yıl gibi sayısal sütunlarda “Toplama yapma”.', 'dax-giris'],
      ['Veri kategorisi (Data category)', 'Şehir, Ülke, Enlem, Web URL\'si, Görüntü URL\'si, Barkod…', 'Haritalar için coğrafi kategori; SVG ölçüleri için Görüntü URL\'si.', 'gorsel-temel'],
      ['Sütuna göre sırala (Sort by column)', 'Sütunun görüntü sırasını başka bir sütundan alır (Ay → AyNo).', 'Ay adları, gün adları, özel sıralar.', 'tarih-tablosu'],
      ['Veri grupları (Data groups)', 'Liste grubu ya da kutu (bin) oluşturur.', 'Histogram, elle gruplama.', 'istatistik']
    ] },
    { id: 'olcu', name: 'Ölçü araçları', desc: 'Bir ölçü seçiliyken.', cmds: [
      ['Ad / Giriş tablosu (Name / Home table)', 'Ölçünün adı ve hangi tablonun altında görüneceği.', 'Ölçüleri ayrı bir “_Ölçüler” tablosunda toplamak yaygındır.', 'dax-giris'],
      ['Biçim (Format)', 'Para birimi, yüzde, ondalık; Dinamik biçim dizesi.', 'Biçimi bir kez ölçüde ayarla.', 'hesaplama-gruplari'],
      ['Veri kategorisi (Data category)', 'Görüntü URL\'si, Web URL\'si…', 'SVG ölçüsü için Görüntü URL\'si.', 'ileri-kaliplar'],
      ['Görüntü klasörü (Display folder, Properties pane)', 'Ölçüleri klasörlerde gruplar.', '30+ ölçülü modellerde.', 'final-hazirlik']
    ] },
    { id: 'bicim', name: 'Biçim (Görsel araçları)', desc: 'Bir görsel seçiliyken.', cmds: [
      ['Etkileşimleri düzenle (Edit interactions)', 'Seçili görselin diğer görselleri filtreleyip filtrelemeyeceğini (Filtrele / Vurgula / Yok) belirler.', 'KPI kartlarının çapraz filtreden etkilenmemesi için.', 'etkilesim'],
      ['Öne getir / Arkaya gönder / Hizala / Dağıt (Bring forward / Send backward / Align / Distribute)', 'Katman ve hizalama.', 'Düzenli tasarım.', 'tema-sayfa'],
      ['Gruplandır (Group)', 'Seçili nesneleri gruplar (Ctrl + G).', 'Kart + başlık + arka plan.', 'hikaye'],
      ['Seçim bölmesi (Selection pane)', 'Seçim bölmesini açar.', '—', 'hikaye']
    ] },
    { id: 'veri', name: 'Veri / Detaya git', desc: 'Hiyerarşili bir görsel seçiliyken.', cmds: [
      ['Detaya inme modu (Drill down, aşağı ok)', 'Açıkken veri noktasına tıklamak bir alt düzeye iner; kapalıyken çapraz filtreler.', 'Hiyerarşide keşif.', 'etkilesim'],
      ['Sonraki düzeye git (Go to the next level, çift ok)', 'Tüm görseli bir alt düzeye indirir.', 'Yıl → tüm aylar.', 'etkilesim'],
      ['Hiyerarşide bir düzey aşağı genişlet (Expand all down one level, çatallı ok)', 'Alt düzeyi üst düzeyle birlikte gösterir (2024 Oca, 2024 Şub…).', 'Etiketlerde üst düzeyi korumak için.', 'etkilesim'],
      ['Detaya git (Drill through)', 'Seçili veri noktasıyla detay sayfasına gider.', 'Ürün/müşteri ayrıntı sayfaları.', 'hikaye'],
      ['Verileri göster / Kayıtları göster (Show as a table / Data point table)', 'Veri noktasının arkasındaki özet ya da satır verisini tablo olarak gösterir.', 'Bir sayının kaynağını doğrulamak için.', 'etkilesim']
    ] }
  ] },
  { grp: 'Görünümler ve bölmeler', tabs: [
    { id: 'gorunumler', name: 'Sol görünümler', desc: 'Desktop\'ın sol kenarındaki görünüm düğmeleri.', cmds: [
      ['Rapor (Report)', 'Tuval: görseller ve sayfalar.', 'Tasarım.', 'arayuz'],
      ['Tablo (Table)', 'Tabloların satırları; hesaplanmış sütun ekleme.', 'Veriyi göz ile kontrol.', 'arayuz'],
      ['Model', 'İlişki diyagramı, özellikler bölmesi, düzenler (çok sayfalı diyagram).', 'Model tasarımı.', 'model-temel'],
      ['DAX sorgu (DAX query)', 'EVALUATE sorguları yazıp çalıştırır; ölçüleri tanımlar, test eder ve modele ekler; Copilot desteği.', 'Ölçü testi ve hata ayıklama.', 'dax-sorgu'],
      ['TMDL', 'Modeli metin (TMDL) olarak görüntüler ve düzenler.', 'Toplu değişiklik, komut dosyası.', 'yasam-dongusu']
    ] },
    { id: 'bolmeler', name: 'Bölmeler', desc: 'Sağdaki çalışma panelleri.', cmds: [
      ['Veri (Data)', 'Tablolar, sütunlar, ölçüler; arama; sağ tık menüleri.', 'Alanları görsellere sürüklemek için.', 'gorsel-temel'],
      ['Görselleştirmeler → Oluştur (Visualizations → Build)', 'Görsel türü ve alan kutuları (eksen, değerler, gösterge, küçük katlar, araç ipuçları, detaylandırma).', 'Görselin iskeleti.', 'gorsel-temel'],
      ['Görselleştirmeler → Biçim (Visualizations → Format)', 'Görsel ve Genel sekmeleri: eksenler, etiketler, renkler, başlık, efektler.', 'Biçimlendirme.', 'bicim-temel'],
      ['Görselleştirmeler → Analiz (Visualizations → Analytics)', 'Sabit/ortalama/min/maks/medyan/yüzdebirlik çizgileri, eğilim, tahmin, hata çubukları, anomali.', 'Bağlam ve keşif.', 'analiz-ozellikleri'],
      ['Filtreler (Filters)', 'Görsel, sayfa, rapor ve detaylandırma filtreleri.', 'Filtreleme.', 'filtreler'],
      ['Yer işaretleri (Bookmarks)', 'Yer işareti ekle, güncelle, grupla, Görünüm modunda sun.', 'Hikâye.', 'hikaye'],
      ['Seçim (Selection)', 'Katmanlar, görünürlük, sekme sırası.', 'Yer işaretleri, erişilebilirlik.', 'hikaye'],
      ['Performans Analizi (Performance Analyzer)', 'Kaydı başlat, görselleri yenile, sorguyu kopyala.', 'Performans.', 'performans'],
      ['Dilimleyicileri eşitle (Sync slicers)', 'Sayfa başına eşitle/görünür onay kutuları, eşitleme grupları.', 'Çok sayfalı raporlar.', 'hikaye'],
      ['Özellikler (Properties, Model view)', 'Ad, açıklama, eş anlamlılar, görüntü klasörü, gizle, veri kategorisi, sıralama.', 'Model düzeni ve belgeleme.', 'final-hazirlik']
    ] }
  ] },
  { grp: 'Power Query Düzenleyicisi', tabs: [
    { id: 'pq-giris', name: 'Giriş', desc: 'Sorgu düzeyi işlemler.', cmds: [
      ['Kapat ve uygula (Close & Apply)', 'Değişiklikleri modele yükler.', 'Her düzenleme sonunda.', 'pq-temel'],
      ['Yeni kaynak / Son kaynaklar / Veri gir (New source / Recent sources / Enter data)', 'Yeni sorgu oluşturur.', '—', 'pq-temel'],
      ['Veri kaynağı ayarları / Parametreleri yönet (Data source settings / Manage parameters)', 'Kaynak ve parametreler.', 'Ortam geçişi, artımlı yenileme.', 'pq-model'],
      ['Önizlemeyi yenile (Refresh preview)', 'Önizlemeyi kaynaktan yeniler.', 'Kaynak değişti mi kontrol.', 'pq-temel'],
      ['Gelişmiş Düzenleyici (Advanced Editor)', 'Sorgunun tüm M kodunu gösterir.', 'Toplu düzenleme, kod paylaşımı.', 'm-dili'],
      ['Sütunları seç / Sütunları kaldır (Choose columns / Remove columns)', 'Gereksiz sütunları atar.', 'Modeli küçültmenin ilk adımı.', 'performans'],
      ['Satırları tut / Satırları kaldır (Keep rows / Remove rows)', 'İlk/son satırlar, aralık, yinelenenler, boşlar, hatalar.', 'Temizlik.', 'pq-temel'],
      ['Sırala (Sort)', 'Satırları sıralar.', 'Genelde gereksiz (model sıralamayı yapar).', 'pq-temel'],
      ['Sütunu böl (Split column)', 'Sınırlayıcı, karakter sayısı, konum, büyük/küçük harf geçişine göre.', 'Ad Soyad ayırma.', 'pq-temel'],
      ['Gruplandırma ölçütü (Group by)', 'Satırları özetler.', 'Modele özet tablo yükleme.', 'pq-orta'],
      ['Veri türü / İlk satırı başlık olarak kullan / Değerleri değiştir (Data type / Use first row as headers / Replace values)', 'Temel dönüşümler.', 'Her sorguda.', 'pq-temel'],
      ['Sorguları birleştir / Sorguları ekle (Merge queries / Append queries)', 'Merge (join) ve Append (union).', 'Tablo birleştirme.', 'pq-orta'],
      ['Dosyaları birleştir (Combine files)', 'Klasördeki dosyaları tek tabloda birleştirir.', 'Aylık dosyalar.', 'pq-orta'],
      ['Yapay zekâ içgörüleri (AI insights)', 'Metin analizi, görüntü işleme, Azure ML (kapasite gerekir).', 'Duygu analizi, anahtar ifade.', 'pq-orta']
    ] },
    { id: 'pq-donustur', name: 'Dönüştür', desc: 'Seçili sütunu yerinde değiştirir.', cmds: [
      ['Grupla / İlk satırı başlık yap / Devrik (Group by / Use first row as headers / Transpose)', 'Tablo şekli.', 'Ters dönmüş Excel tabloları için devrik.', 'pq-pivot-devrik'],
      ['Satır sayısını say (Count rows)', 'Tablonun satır sayısı.', 'Hızlı kontrol.', 'pq-temel'],
      ['Veri türü / Türleri algıla / Yeniden adlandır (Data type / Detect data type / Rename)', 'Tür ve ad.', '—', 'pq-temel'],
      ['Değerleri değiştir / Hataları değiştir / Doldur (aşağı, yukarı) (Replace values / Replace errors / Fill)', 'Değer düzeltme; birleştirilmiş Excel hücrelerindeki boşlukları doldurur.', 'Excel raporlarından gelen veri.', 'pq-temel'],
      ['Özet sütun / Sütunların özetini kaldır (Pivot column / Unpivot columns)', 'Pivot ve unpivot.', 'Bütçe tablolarını uzun biçime çevirme.', 'pq-pivot-devrik'],
      ['Liste olarak dönüştür / Sütunu böl / Biçim (kırp, temizle, büyük/küçük harf, önek/sonek) (Convert to list / Split column / Format)', 'Metin işlemleri.', 'Temizlik.', 'pq-temel'],
      ['Ayıkla (uzunluk, ilk/son karakterler, sınırlayıcılar arasında) (Extract)', 'Metinden parça alır.', 'Kod parçalama.', 'pq-temel'],
      ['İstatistikler / Standart / Bilimsel / Trigonometri / Yuvarlama (Statistics / Standard / Scientific / Trigonometry / Rounding)', 'Sayısal işlemler.', 'Birim çevirme.', 'pq-temel'],
      ['Tarih / Saat / Süre (Date / Time / Duration)', 'Yıl, ay, gün başlangıcı, yaş vb.', 'Tarih parçaları.', 'pq-temel'],
      ['Yapılandırılmış sütun: Genişlet / Topla / Değerleri ayıkla (Structured column: Expand / Aggregate / Extract values)', 'Kayıt, liste ve tablo sütunlarını açar.', 'JSON ve birleştirme sonuçları.', 'pq-model'],
      ['R / Python betiği çalıştır (Run R / Python script)', 'Betikle dönüşüm.', 'Özel istatistik; kişisel ağ geçidi gerekebilir.', 'pq-orta']
    ] },
    { id: 'pq-sutun', name: 'Sütun ekle', desc: 'Mevcut sütunları koruyup yeni sütun ekler.', cmds: [
      ['Örneklerden sütun (Column from examples)', 'Birkaç örnek yazarsın, Power Query kuralı çıkarır.', 'Karmaşık metin dönüşümleri.', 'pq-uygulama'],
      ['Özel sütun (Custom column)', 'M formülüyle yeni sütun.', 'Hesap: [Adet] * [Fiyat].', 'pq-menu-2'],
      ['Koşullu sütun (Conditional column)', 'Eğer/değilse sihirbazı.', 'Gruplama, bantlama.', 'pq-orta'],
      ['Dizin sütunu (Index column)', '0 ya da 1\'den başlayan sıra numarası.', 'Vekil anahtar; katlamayı bozabilir, sona koy.', 'pq-model'],
      ['Sütunu çoğalt (Duplicate column)', 'Kopya sütun.', 'Orijinali koruyup dönüştürmek için.', 'pq-temel'],
      ['Özel işlev çağır (Invoke custom function)', 'Kaydedilmiş bir M fonksiyonunu her satıra uygular.', 'Yeniden kullanılabilir temizlik.', 'm-fonksiyon'],
      ['Biçim / Ayıkla / İstatistik / Tarih / Saat (Format / Extract / Statistics / Date / Time)', 'Dönüştür sekmesindekilerin yeni sütun üreten sürümleri.', '—', 'pq-temel']
    ] },
    { id: 'pq-gorunum', name: 'Görünüm', desc: 'Profil çıkarma ve görünüm ayarları.', cmds: [
      ['Formül çubuğu (Formula bar)', 'Seçili adımın M formülünü gösterir.', 'Hep açık tut.', 'm-dili'],
      ['Sütun kalitesi / dağılımı / profili (Column quality / distribution / profile)', 'Geçerli-hata-boş yüzdeleri, farklı değer sayısı, istatistikler.', 'Veriyi değerlendirme (PL-300).', 'pq-temel'],
      ['Tüm veri kümesine göre profil oluştur (Column profiling based on entire data set)', 'Varsayılan ilk 1000 satır yerine tüm veri.', 'Nadir hataları yakalamak için.', 'pq-temel'],
      ['Sorgu bağımlılıkları (Query dependencies)', 'Sorguların birbirine bağımlılık diyagramı.', 'Başvuru zincirlerini anlamak için.', 'pq-model'],
      ['Sütuna git / Boşlukları göster (Go to column / Show whitespace)', 'Gezinme.', '—', 'pq-temel']
    ] },
    { id: 'pq-araclar', name: 'Araçlar ve adım menüsü', desc: 'Tanılama ve adım düzeyi işlemler.', cmds: [
      ['Sorgu tanılaması (Query diagnostics)', 'Sorgunun kaynağa gönderdiği istekleri ve sürelerini kaydeder.', 'Yavaş yenileme teşhisi.', 'pq-menu'],
      ['Yerel sorguyu görüntüle (View Native Query, adıma sağ tık)', 'Adımın kaynağa SQL olarak katlanıp katlanmadığını gösterir.', 'Sorgu katlama kontrolü.', 'pq-orta'],
      ['Yüklemeyi etkinleştir / Rapor yenilemeye dahil et (Enable load / Include in report refresh, sorguya sağ tık)', 'Sorgunun modele yüklenip yüklenmeyeceği ve yenilemeye katılıp katılmayacağı.', 'Ara sorgular.', 'pq-model'],
      ['Başvuru / Çoğalt (Reference / Duplicate, sorguya sağ tık)', 'Yeni sorguyu sonuca bağlı ya da bağımsız oluşturur.', 'Boyut türetme.', 'pq-model'],
      ['Grupla (Group, Queries pane)', 'Sorguları klasörlere ayırır (Kaynak, Boyutlar, Olgular).', 'Düzen.', 'pq-model']
    ] }
  ] },
  { grp: 'Power BI Service', tabs: [
    { id: 'srv-calisma', name: 'Çalışma alanı', desc: 'İçeriklerin ve ekibin yönetildiği alan.', cmds: [
      ['Yeni öğe (New item)', 'Rapor, pano, sayfalandırılmış rapor, anlam modeli, veri akışı (Fabric\'te lakehouse, not defteri…).', '—', 'yayinlama'],
      ['Erişimi yönet (Manage access)', 'Yönetici, Üye, Katkıda bulunan, Görüntüleyici rolleri.', 'Ekip yetkileri.', 'calisma-alani'],
      ['Çalışma alanı ayarları (Workspace settings)', 'Ad, açıklama, kapasite/lisans modu, Git tümleştirmesi, OneLake.', 'Kurulum.', 'yasam-dongusu'],
      ['Uygulama oluştur / güncelle (Create / Update app)', 'İçeriği kitlelere paketler; gezinme ve izinler.', 'Son kullanıcı dağıtımı.', 'power-bi-apps'],
      ['Dağıtım işlem hattı oluştur (Create deployment pipeline)', 'Geliştirme → Test → Üretim.', 'Kurumsal yaşam döngüsü.', 'yasam-dongusu'],
      ['Soy görünümü (Lineage view)', 'Kaynaktan rapora öğeler arası bağımlılıklar.', 'Etki analizi.', 'yasam-dongusu']
    ] },
    { id: 'srv-model', name: 'Anlam modeli ayarları', desc: 'Yayımlanmış modelin ayarları.', cmds: [
      ['Ağ geçidi ve bulut bağlantıları (Gateway and cloud connections)', 'Kaynakların hangi ağ geçidi/bağlantı ile kullanılacağı.', 'Şirket içi kaynaklar.', 'gateway'],
      ['Veri kaynağı kimlik bilgileri (Data source credentials)', 'Yenileme için kimlik bilgisi.', 'İlk yayımdan sonra.', 'veri-yenileme'],
      ['Parametreler (Parameters)', 'Power Query parametrelerinin değerleri.', 'Ortam değişimi.', 'pq-model'],
      ['Zamanlanmış yenileme (Scheduled refresh)', 'Gün/saat ve başarısızlık bildirimi.', 'Import modeller.', 'veri-yenileme'],
      ['Satır düzeyi güvenlik (Row-level security)', 'Rollere kullanıcı ve grup atama; Rol olarak test et.', 'RLS dağıtımı.', 'guvenlik'],
      ['Onaylama (Endorsement)', 'Tanıt ya da sertifikala.', 'Doğru modeli bulunur kılmak.', 'yonetisim'],
      ['Büyük anlam modeli depolama biçimi (Large semantic model storage format)', 'Büyük model biçimini açar.', 'Kapasitede büyük modeller.', 'kurumsal-model'],
      ['Derleme izni / Yönet izinleri (Build / Manage permissions)', 'Kimlerin bu modelden rapor yapabileceği.', 'Paylaşılan model stratejisi.', 'yonetisim']
    ] },
    { id: 'srv-rapor', name: 'Rapor menüsü', desc: 'Service\'te bir rapor açıkken üst çubuk.', cmds: [
      ['Dosya → Kopyasını kaydet / İndir (.pbix) / Yazdır (File → Save a copy / Download / Print)', 'Rapor dosyası işlemleri.', '—', 'yayinlama'],
      ['Dışa aktar → PowerPoint / PDF / Excel\'de analiz et (Export → PowerPoint / PDF / Analyze in Excel)', 'Excel\'de analiz et: modele Excel pivot tablosuyla bağlanır (Derleme izni gerekir).', 'Excel kullanıcıları için.', 'yonetisim'],
      ['Paylaş / Sohbet (Teams) / Bağlantı kopyala (Share / Chat in Teams / Copy link)', 'Kişi ya da grupla paylaşma.', 'Hızlı paylaşım.', 'paylasim'],
      ['Abone ol (Subscribe)', 'Düzenli e-posta anlık görüntüsü.', 'Yöneticilere haftalık özet.', 'yonetisim'],
      ['Düzenle (Edit)', 'Raporu tarayıcıda düzenler.', 'Küçük değişiklikler.', 'yayinlama'],
      ['Görünüm → Kişisel yer işaretleri / Odak modu / Sayfayı tam ekran (View → Personal bookmarks / Focus mode / Full screen)', 'Okuyucu özellikleri.', '—', 'hikaye'],
      ['Sabitle (Pin visual)', 'Görseli bir panoya sabitler.', 'Pano oluşturma.', 'panolar'],
      ['Uyarı ayarla (Set alert, pano kutucuğu)', 'Eşik aşılınca bildirim.', 'Kart, KPI, gösterge kutucuklarında.', 'panolar'],
      ['Yorum (Comment)', 'Rapora ya da görsele konuşma ekler; @ ile kişiye bildirim gider, filtreler saklanır.', 'Bir sayıyı kişiye sorarken.', 'yorum-isbirligi'],
      ['Kullanım ölçümlerini aç (Open usage metrics)', 'Rapor görüntüleme, tekil kişi ve açılma süresi; son 30 gün.', 'Kullanımı ölçerken.', 'kullanim-izleme']
    ] },
    { id: 'srv-yonetici', name: 'Yönetici portalı', desc: 'Kiracı yöneticisinin ayarları (özet).', cmds: [
      ['Kiracı ayarları (Tenant settings)', 'Web\'de yayımla, dışa aktarma, Copilot, özel görseller, sertifikalama kimlerin yapabileceği.', 'Kuruluş politikaları.', 'yonetisim'],
      ['Kapasite ayarları (Capacity settings)', 'Fabric/Premium kapasiteleri, iş yükleri, XMLA okuma-yazma.', 'Kurumsal model.', 'kurumsal-model'],
      ['Denetim ve kullanım ölçümleri (Audit and usage metrics)', 'Kim neye ne zaman baktı.', 'Benimseme ve güvenlik.', 'kullanim-izleme']
    ] }
  ] }
];
})(window);
