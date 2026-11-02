/* Kesit Power BI — Power BI menüleri başvurusu. Her komut: [ad, ne yapar, ne zaman / ipucu, ilgili ders] */
(function (W) {
W.PBI_MENUS = [
  { grp: 'Desktop şeridi', tabs: [
    { id: 'dosya', name: 'Dosya', desc: 'Dosya işlemleri, seçenekler, dışa aktarma ve yayımlama.', cmds: [
      ['Yeni / Aç / Kaydet / Farklı kaydet', 'Raporu .pbix ya da Power BI Projesi (.pbip) olarak kaydeder.', 'Ekip hâlinde ve Git ile çalışacaksan .pbip seç.', 'yasam-dongusu'],
      ['Veri al', 'Veri alma penceresini açar (Giriş → Veri al ile aynı).', 'Yeni bir kaynak eklerken.', 'veri-alma'],
      ['İçeri aktar', 'Power BI şablonu (.pbit), Excel çalışma kitabı içeriği (Power Pivot modeli) ya da özel görsel (.pbiviz) içeri aktarır.', 'Excel\'deki Power Pivot modelini Power BI\'a taşırken; AppSource dışı özel görsel eklerken.', 'aile'],
      ['Dışa aktar → Power BI şablonu', 'Veri olmadan model, ölçüler ve rapor tasarımını .pbit dosyasına kaydeder.', 'Standart bir rapor başlangıcını ekiple paylaşmak için.', 'yasam-dongusu'],
      ['Dışa aktar → PDF', 'Görünür sayfaları PDF\'e aktarır.', 'Hızlı paylaşım; resmî belge için sayfalandırılmış rapor daha uygundur.', 'sayfalandirilmis'],
      ['Yayımla', 'Raporu ve modeli Power BI Service\'te bir çalışma alanına gönderir.', 'Geliştirme bitince; önce kaydet.', 'yayinlama'],
      ['Seçenekler ve ayarlar → Seçenekler', 'Genel (Genel: önizleme özellikleri, bölgesel ayarlar, güvenlik) ve Geçerli dosya (Veri yükleme: otomatik tarih/saat, ilişkileri otomatik algıla; Rapor ayarları: dışa aktarma, kişiselleştirme) ayarları.', 'Her yeni projede: otomatik tarih/saati kapat, bölgesel ayarı kontrol et.', 'tarih-tablosu'],
      ['Seçenekler ve ayarlar → Veri kaynağı ayarları', 'Kaynakların kimlik bilgilerini ve gizlilik düzeylerini düzenler; kaynağı değiştirir.', 'Sunucu/dosya yolu değiştiğinde, “Formula.Firewall” hatasında.', 'pq-model']
    ] },
    { id: 'giris', name: 'Giriş', desc: 'Veri, sorgular ve en sık kullanılan hesap komutları.', cmds: [
      ['Yapıştır / Kes / Kopyala / Biçim boyacısı', 'Görselleri kopyalar; biçim boyacısı bir görselin biçimini başka bir görsele uygular.', 'Bir kartı tasarlayıp diğer kartlara biçimini aktarmak için biçim boyacısı.', 'bicim-temel'],
      ['Veri al', 'Bağlayıcı listesini açar: Excel, SQL Server, SharePoint, Web, OData, Dataverse, Fabric kaynakları…', 'Yeni kaynak.', 'veri-alma'],
      ['Excel çalışma kitabı / SQL Server / OneLake kataloğu', 'Sık kullanılan bağlayıcılara kısayollar. OneLake kataloğu Fabric\'teki lakehouse, warehouse ve anlam modellerini listeler.', 'Paylaşılan bir anlam modeline bağlanmak (canlı bağlantı) için OneLake kataloğu.', 'veri-alma'],
      ['Veri gir', 'Elle küçük bir tablo oluşturur (Power Query\'de saklanır).', 'Parametre, segment sınırları, eşleme tabloları.', 'segmentasyon'],
      ['Son kaynaklar', 'Son kullanılan bağlantılar.', 'Hızlı yeniden bağlanma.', 'veri-alma'],
      ['Verileri dönüştür', 'Power Query Düzenleyicisi\'ni açar.', 'Temizlik, birleştirme, şekillendirme.', 'pq-temel'],
      ['Verileri dönüştür → Veri kaynağı ayarları / Parametreleri düzenle', 'Kaynak ve parametre değerlerini düzenler.', 'Geliştirme/canlı ortam geçişi.', 'pq-model'],
      ['Yenile', 'Tüm sorguları kaynaktan yeniden yükler.', 'Kaynak verisi değiştiğinde.', 'veri-alma'],
      ['Yeni görsel', 'Tuvale boş bir görsel ekler.', 'Rapor tasarımı.', 'gorsel-temel'],
      ['Metin kutusu / Daha fazla görsel', 'Metin ya da AppSource\'tan özel görsel ekler.', 'Açıklama metni, madde grafiği gibi özel görseller.', 'gorsel-secimi'],
      ['Yeni ölçü / Hızlı ölçü', 'DAX ölçüsü ya da sihirbazla hızlı ölçü oluşturur.', 'Her hesap için açık ölçü yaz.', 'dax-giris'],
      ['Duyarlılık', 'Rapora Microsoft Purview duyarlılık etiketi uygular.', 'Gizli veri içeren raporlarda.', 'yonetisim'],
      ['Yayımla', 'Service\'e yayımlar.', 'Geliştirme sonu.', 'yayinlama'],
      ['Copilot', 'Copilot bölmesini açar: rapor sayfası önerisi, anlatı, model özeti, DAX yardımı.', 'Fikir ve ilk taslak için; sonucu her zaman doğrula.', 'hizli-olcu']
    ] },
    { id: 'ekle', name: 'Ekle', desc: 'Sayfaya eklenen öğeler: sayfalar, görseller, yapay zekâ görselleri, şekiller, düğmeler.', cmds: [
      ['Yeni sayfa / Sayfayı çoğalt', 'Boş sayfa ya da mevcut sayfanın kopyası.', 'Aynı düzende farklı konu için çoğalt.', 'tema-sayfa'],
      ['Yeni görsel', 'Boş görsel.', 'Tasarım.', 'gorsel-temel'],
      ['Soru-Cevap (kaldırılıyor)', 'Doğal dil sorusuyla görsel üreten eski Soru-Cevap görseli. Microsoft Aralık 2026’da tamamen kaldırıyor; mevcut Soru-Cevap görselleri de çalışmayacak.', 'Yeni raporlarda kullanma; yerine Copilot (raporla sohbet) kullanılır.', 'analiz-ozellikleri'],
      ['Anahtar etkileyiciler', 'Bir sonucu en çok etkileyen alanları bulan yapay zekâ görseli.', '“İadeyi ne artırıyor?”', 'analiz-ozellikleri'],
      ['Ayrıştırma ağacı', 'Bir ölçüyü boyutlara dallandırarak ayrıştırır.', 'Kök neden analizi, sunumda canlı keşif.', 'analiz-ozellikleri'],
      ['Anlatı', 'Sayfanın verisini özetleyen dinamik metin (Copilot / akıllı anlatı).', 'Yönetici özetine bir paragraf.', 'analiz-ozellikleri'],
      ['Sayfalandırılmış rapor', 'Etkileşimli raporun içine sayfalandırılmış rapor görseli ekler.', 'Yazdırılabilir listeyi aynı sayfada vermek için.', 'sayfalandirilmis'],
      ['Power Apps / Power Automate', 'Rapora uygulama ya da akış düğmesi gömer.', 'Rapordan veri yazma, onay akışı tetikleme.', 'yonetisim'],
      ['Metin kutusu', 'Biçimli metin; içine dinamik değer (ölçü) eklenebilir.', 'Başlık, açıklama, dipnot.', 'tema-sayfa'],
      ['Düğmeler', 'Geri, Bilgi, Yer imi, Gezgin (sayfa/yer imi gezgini) düğmeleri; eylem atanır.', 'Gezinme, grafik/tablo geçişi, filtre temizleme.', 'hikaye'],
      ['Şekiller', 'Dikdörtgen, çizgi, ok vb.; eylem atanabilir.', 'Arka plan kutuları (tercihen tuval arka plan görseli kullan).', 'tema-sayfa'],
      ['Görüntü', 'Logo ya da resim; eylem atanabilir.', 'Logo, simge tabanlı gezinme.', 'tema-sayfa']
    ] },
    { id: 'modelleme', name: 'Modelleme', desc: 'İlişkiler, DAX nesneleri, parametreler ve güvenlik.', cmds: [
      ['İlişkileri yönet', 'İlişkileri listeler; yeni ilişki, kardinalite, çapraz filtre yönü, etkin/pasif ayarı.', 'Otomatik algılanan ilişkileri kontrol etmek için.', 'model-temel'],
      ['Yeni ölçü', 'DAX ölçüsü.', 'Toplamlar, oranlar, karşılaştırmalar.', 'dax-giris'],
      ['Hızlı ölçü', 'Sihirbazla ölçü.', 'Başlangıç; üretilen DAX\'ı oku ve düzelt.', 'hizli-olcu'],
      ['Yeni sütun', 'Hesaplanmış sütun (satır başına, yenilemede).', 'Dilimleyici/eksen için satır etiketi; mümkünse Power Query.', 'dax-giris'],
      ['Yeni tablo', 'Hesaplanmış tablo (CALENDAR, SUMMARIZE, DATATABLE…).', 'Tarih tablosu, yardımcı ve parametre tabloları.', 'tarih-tablosu'],
      ['Yeni parametre → Sayısal aralık', 'Ne olur parametresi: GENERATESERIES tablosu + değer ölçüsü + kaydırıcı.', 'Senaryo analizi, dinamik İlk N.', 'segmentasyon'],
      ['Yeni parametre → Alanlar', 'Alan parametresi: kullanıcı eksen ya da ölçüyü dilimleyiciden seçer.', 'Ölçü seçici, eksen seçici.', 'hesaplama-gruplari'],
      ['Hesaplama grubu', 'Ölçülere uygulanan hesaplama öğeleri (SELECTEDMEASURE) oluşturur.', 'Zaman zekâsı varyasyonları, para birimi.', 'hesaplama-gruplari'],
      ['Rolleri yönet', 'RLS rolleri ve DAX filtre ifadeleri.', 'Statik/dinamik satır düzeyi güvenlik.', 'guvenlik'],
      ['Farklı görüntüle', 'Raporu bir rolün ya da kullanıcının gözünden gösterir.', 'RLS testi.', 'guvenlik'],
      ['Soru-Cevap kurulumu (kaldırılıyor)', 'Eş anlamlılar ve dil öğretme. Aralık 2026’da Soru-Cevap ile birlikte kalkıyor; yerini Giriş → Yapay zekâ için verileri hazırla (Prep data for AI) alıyor.', 'Copilot’un modeli doğru anlaması için yapay zekâ veri şeması, onaylı cevaplar ve yapay zekâ talimatları tanımla.', 'analiz-ozellikleri']
    ] },
    { id: 'gorunum', name: 'Görünüm', desc: 'Tema, düzen, mobil görünüm ve yardımcı bölmeler.', cmds: [
      ['Temalar', 'Hazır tema seç, özelleştir, JSON yükle/kaydet.', 'Proje başında kurumsal tema.', 'tema-sayfa'],
      ['Sayfa görünümü', 'Sayfaya sığdır, genişliğe sığdır, gerçek boyut.', 'Uzun sayfalarda genişliğe sığdır.', 'tema-sayfa'],
      ['Mobil düzen', 'Telefon düzenini tasarlar.', 'Yöneticiler mobilden bakıyorsa.', 'mobil-erisilebilirlik'],
      ['Kılavuz çizgileri / Izgaraya yapış / Nesneleri kilitle', 'Hizalama yardımcıları; kilit, nesnelerin yanlışlıkla kaymasını önler.', 'Tasarım boyunca açık.', 'tema-sayfa'],
      ['Filtreler', 'Filtreler bölmesini gösterir/gizler.', 'Filtre düzenleme.', 'filtreler'],
      ['Yer imleri', 'Yer imleri bölmesi.', 'Hikâye, geçişler.', 'hikaye'],
      ['Seçim', 'Seçim bölmesi: görünürlük, katman, gruplar, sekme sırası.', 'Yer imleriyle birlikte; erişilebilirlik.', 'hikaye'],
      ['Performans Analizi', 'Görsellerin DAX, çizim ve diğer sürelerini kaydeder.', 'Yavaş rapor teşhisi.', 'performans'],
      ['Dilimleyicileri eşitle', 'Dilimleyicileri sayfalar arasında eşitler.', 'Çok sayfalı raporlarda tutarlı seçim.', 'hikaye']
    ] },
    { id: 'iyilestir', name: 'İyileştir', desc: 'Büyük modellerde rapor tasarımını hızlandıran ayarlar.', cmds: [
      ['Görselleri duraklat', 'Görseller sorgu göndermeyi durdurur; tasarım yaparken her değişiklikte bekleme olmaz.', 'DirectQuery ve büyük modellerde tasarım sırasında.', 'performans'],
      ['İyileştirme ön ayarları', 'Sorgu azaltma, etkileşim ve uygula düğmesi ayarlarını tek seferde değiştirir.', 'Kaynak yavaşsa “Sorgu azaltma” ön ayarı.', 'performans'],
      ['Sorgu azaltma ayarları', 'Çapraz filtrelemeyi varsayılan olarak kapat, dilimleyicilere “Uygula” düğmesi ekle.', 'DirectQuery\'de her tıklamanın sorgu üretmesini önlemek için.', 'performans'],
      ['Performans Analizi', 'Görünüm sekmesindekinin aynısı.', '—', 'performans']
    ] },
    { id: 'yardim', name: 'Yardım', desc: 'Belgeler, topluluk ve sürüm bilgisi.', cmds: [
      ['Kılavuzlu öğrenme / Belgeler / Eğitim videoları', 'Microsoft Learn kaynakları.', 'Sertifika hazırlığı.', 'pl300'],
      ['Topluluk / Destek', 'Forum, destek talebi.', 'Hata ve sorular.', 'aile'],
      ['Hakkında', 'Sürüm numarası.', 'Bir özelliğin sürümünde olup olmadığını kontrol etmek için.', 'aile']
    ] },
    { id: 'harici', name: 'Harici araçlar', desc: 'Kurulu topluluk araçlarını Desktop\'tan açar.', cmds: [
      ['DAX Studio', 'DAX sorgularını çalıştırır; sunucu zamanlamaları ve sorgu planı; VertiPaq Analyzer.', 'Ölçü optimizasyonu, model boyutu analizi.', 'dax-opt'],
      ['Tabular Editor', 'Modeli toplu düzenler: hesaplama grupları, OLS, görüntü klasörleri, Best Practice Analyzer, komut dosyaları.', 'Kurumsal model geliştirme.', 'kurumsal-model'],
      ['ALM Toolkit', 'İki model arasındaki farkları karşılaştırır ve seçerek dağıtır.', 'Sürüm karşılaştırma, kısmi dağıtım.', 'yasam-dongusu']
    ] }
  ] },
  { grp: 'Bağlamsal sekmeler', tabs: [
    { id: 'tablo', name: 'Tablo araçları', desc: 'Veri bölmesinde bir tablo seçiliyken.', cmds: [
      ['Ad', 'Tablonun adını değiştirir; tüm DAX başvuruları otomatik güncellenir.', 'İş dilinde adlar (Satislar, Musteriler).', 'model-temel'],
      ['Tarih tablosu olarak işaretle', 'Zaman zekâsının kullanacağı tarih tablosunu ve sütununu belirler.', 'Kendi tarih tablon olduğunda mutlaka.', 'tarih-tablosu'],
      ['İlişkileri yönet', 'İlişkiler penceresi.', 'Model kontrolü.', 'model-temel'],
      ['Yeni ölçü / Yeni sütun / Hızlı ölçü', 'Bu tabloya DAX nesnesi ekler.', '—', 'dax-giris']
    ] },
    { id: 'sutun', name: 'Sütun araçları', desc: 'Bir sütun seçiliyken.', cmds: [
      ['Ad / Veri türü', 'Sütunu yeniden adlandırır, türünü değiştirir.', 'Tür düzeltmeleri mümkünse Power Query\'de.', 'pq-temel'],
      ['Biçim', 'Sayı, para, yüzde, tarih biçimi; ondalık basamak.', 'Görüntü tutarlılığı.', 'bicim-temel'],
      ['Özetleme', 'Varsayılan toplama (Topla, Ortalama, Toplama yapma).', 'Anahtar ve yıl gibi sayısal sütunlarda “Toplama yapma”.', 'dax-giris'],
      ['Veri kategorisi', 'Şehir, Ülke, Enlem, Web URL\'si, Görüntü URL\'si, Barkod…', 'Haritalar için coğrafi kategori; SVG ölçüleri için Görüntü URL\'si.', 'gorsel-temel'],
      ['Sütuna göre sırala', 'Sütunun görüntü sırasını başka bir sütundan alır (Ay → AyNo).', 'Ay adları, gün adları, özel sıralar.', 'tarih-tablosu'],
      ['Veri grupları', 'Liste grubu ya da kutu (bin) oluşturur.', 'Histogram, elle gruplama.', 'istatistik']
    ] },
    { id: 'olcu', name: 'Ölçü araçları', desc: 'Bir ölçü seçiliyken.', cmds: [
      ['Ad / Giriş tablosu', 'Ölçünün adı ve hangi tablonun altında görüneceği.', 'Ölçüleri ayrı bir “_Ölçüler” tablosunda toplamak yaygındır.', 'dax-giris'],
      ['Biçim', 'Para birimi, yüzde, ondalık; Dinamik biçim dizesi.', 'Biçimi bir kez ölçüde ayarla.', 'hesaplama-gruplari'],
      ['Veri kategorisi', 'Görüntü URL\'si, Web URL\'si…', 'SVG ölçüsü için Görüntü URL\'si.', 'ileri-kaliplar'],
      ['Görüntü klasörü (Özellikler bölmesi)', 'Ölçüleri klasörlerde gruplar.', '30+ ölçülü modellerde.', 'final-hazirlik']
    ] },
    { id: 'bicim', name: 'Biçim (Görsel araçları)', desc: 'Bir görsel seçiliyken.', cmds: [
      ['Etkileşimleri düzenle', 'Seçili görselin diğer görselleri filtreleyip filtrelemeyeceğini (Filtrele / Vurgula / Yok) belirler.', 'KPI kartlarının çapraz filtreden etkilenmemesi için.', 'etkilesim'],
      ['Öne getir / Arkaya gönder / Hizala / Dağıt', 'Katman ve hizalama.', 'Düzenli tasarım.', 'tema-sayfa'],
      ['Gruplandır', 'Seçili nesneleri gruplar (Ctrl + G).', 'Kart + başlık + arka plan.', 'hikaye'],
      ['Seçim bölmesi', 'Seçim bölmesini açar.', '—', 'hikaye']
    ] },
    { id: 'veri', name: 'Veri / Detaya git', desc: 'Hiyerarşili bir görsel seçiliyken.', cmds: [
      ['Detaya inme modu (aşağı ok)', 'Açıkken veri noktasına tıklamak bir alt düzeye iner; kapalıyken çapraz filtreler.', 'Hiyerarşide keşif.', 'etkilesim'],
      ['Sonraki düzeye git (çift ok)', 'Tüm görseli bir alt düzeye indirir.', 'Yıl → tüm aylar.', 'etkilesim'],
      ['Hiyerarşide bir düzey aşağı genişlet (çatallı ok)', 'Alt düzeyi üst düzeyle birlikte gösterir (2024 Oca, 2024 Şub…).', 'Etiketlerde üst düzeyi korumak için.', 'etkilesim'],
      ['Detaya git (Drill through)', 'Seçili veri noktasıyla detay sayfasına gider.', 'Ürün/müşteri ayrıntı sayfaları.', 'hikaye'],
      ['Verileri göster / Kayıtları göster', 'Veri noktasının arkasındaki özet ya da satır verisini tablo olarak gösterir.', 'Bir sayının kaynağını doğrulamak için.', 'etkilesim']
    ] }
  ] },
  { grp: 'Görünümler ve bölmeler', tabs: [
    { id: 'gorunumler', name: 'Sol görünümler', desc: 'Desktop\'ın sol kenarındaki görünüm düğmeleri.', cmds: [
      ['Rapor', 'Tuval: görseller ve sayfalar.', 'Tasarım.', 'arayuz'],
      ['Tablo', 'Tabloların satırları; hesaplanmış sütun ekleme.', 'Veriyi göz ile kontrol.', 'arayuz'],
      ['Model', 'İlişki diyagramı, özellikler bölmesi, düzenler (çok sayfalı diyagram).', 'Model tasarımı.', 'model-temel'],
      ['DAX sorgu', 'EVALUATE sorguları yazıp çalıştırır; ölçüleri tanımlar, test eder ve modele ekler; Copilot desteği.', 'Ölçü testi ve hata ayıklama.', 'dax-sorgu'],
      ['TMDL', 'Modeli metin (TMDL) olarak görüntüler ve düzenler.', 'Toplu değişiklik, komut dosyası.', 'yasam-dongusu']
    ] },
    { id: 'bolmeler', name: 'Bölmeler', desc: 'Sağdaki çalışma panelleri.', cmds: [
      ['Veri', 'Tablolar, sütunlar, ölçüler; arama; sağ tık menüleri.', 'Alanları görsellere sürüklemek için.', 'gorsel-temel'],
      ['Görselleştirmeler → Oluştur', 'Görsel türü ve alan kutuları (eksen, değerler, gösterge, küçük katlar, araç ipuçları, detaylandırma).', 'Görselin iskeleti.', 'gorsel-temel'],
      ['Görselleştirmeler → Biçim', 'Görsel ve Genel sekmeleri: eksenler, etiketler, renkler, başlık, efektler.', 'Biçimlendirme.', 'bicim-temel'],
      ['Görselleştirmeler → Analiz', 'Sabit/ortalama/min/maks/medyan/yüzdebirlik çizgileri, eğilim, tahmin, hata çubukları, anomali.', 'Bağlam ve keşif.', 'analiz-ozellikleri'],
      ['Filtreler', 'Görsel, sayfa, rapor ve detaylandırma filtreleri.', 'Filtreleme.', 'filtreler'],
      ['Yer imleri', 'Yer imi ekle, güncelle, grupla, Görünüm modunda sun.', 'Hikâye.', 'hikaye'],
      ['Seçim', 'Katmanlar, görünürlük, sekme sırası.', 'Yer imleri, erişilebilirlik.', 'hikaye'],
      ['Performans Analizi', 'Kaydı başlat, görselleri yenile, sorguyu kopyala.', 'Performans.', 'performans'],
      ['Dilimleyicileri eşitle', 'Sayfa başına eşitle/görünür onay kutuları, eşitleme grupları.', 'Çok sayfalı raporlar.', 'hikaye'],
      ['Özellikler (Model görünümü)', 'Ad, açıklama, eş anlamlılar, görüntü klasörü, gizle, veri kategorisi, sıralama.', 'Model düzeni ve belgeleme.', 'final-hazirlik']
    ] }
  ] },
  { grp: 'Power Query Düzenleyicisi', tabs: [
    { id: 'pq-giris', name: 'Giriş', desc: 'Sorgu düzeyi işlemler.', cmds: [
      ['Kapat ve uygula', 'Değişiklikleri modele yükler.', 'Her düzenleme sonunda.', 'pq-temel'],
      ['Yeni kaynak / Son kaynaklar / Veri gir', 'Yeni sorgu oluşturur.', '—', 'pq-temel'],
      ['Veri kaynağı ayarları / Parametreleri yönet', 'Kaynak ve parametreler.', 'Ortam geçişi, artımlı yenileme.', 'pq-model'],
      ['Önizlemeyi yenile', 'Önizlemeyi kaynaktan yeniler.', 'Kaynak değişti mi kontrol.', 'pq-temel'],
      ['Gelişmiş Düzenleyici', 'Sorgunun tüm M kodunu gösterir.', 'Toplu düzenleme, kod paylaşımı.', 'm-dili'],
      ['Sütunları seç / Sütunları kaldır', 'Gereksiz sütunları atar.', 'Modeli küçültmenin ilk adımı.', 'performans'],
      ['Satırları tut / Satırları kaldır', 'İlk/son satırlar, aralık, yinelenenler, boşlar, hatalar.', 'Temizlik.', 'pq-temel'],
      ['Sırala', 'Satırları sıralar.', 'Genelde gereksiz (model sıralamayı yapar).', 'pq-temel'],
      ['Sütunu böl', 'Sınırlayıcı, karakter sayısı, konum, büyük/küçük harf geçişine göre.', 'Ad Soyad ayırma.', 'pq-temel'],
      ['Gruplandırma ölçütü', 'Satırları özetler.', 'Modele özet tablo yükleme.', 'pq-orta'],
      ['Veri türü / İlk satırı başlık olarak kullan / Değerleri değiştir', 'Temel dönüşümler.', 'Her sorguda.', 'pq-temel'],
      ['Sorguları birleştir / Sorguları ekle', 'Merge (join) ve Append (union).', 'Tablo birleştirme.', 'pq-orta'],
      ['Dosyaları birleştir', 'Klasördeki dosyaları tek tabloda birleştirir.', 'Aylık dosyalar.', 'pq-orta'],
      ['Yapay zekâ içgörüleri', 'Metin analizi, görüntü işleme, Azure ML (kapasite gerekir).', 'Duygu analizi, anahtar ifade.', 'pq-orta']
    ] },
    { id: 'pq-donustur', name: 'Dönüştür', desc: 'Seçili sütunu yerinde değiştirir.', cmds: [
      ['Grupla / İlk satırı başlık yap / Devrik', 'Tablo şekli.', 'Ters dönmüş Excel tabloları için devrik.', 'pq-orta'],
      ['Satır sayısını say', 'Tablonun satır sayısı.', 'Hızlı kontrol.', 'pq-temel'],
      ['Veri türü / Türleri algıla / Yeniden adlandır', 'Tür ve ad.', '—', 'pq-temel'],
      ['Değerleri değiştir / Hataları değiştir / Doldur (aşağı, yukarı)', 'Değer düzeltme; birleştirilmiş Excel hücrelerindeki boşlukları doldurur.', 'Excel raporlarından gelen veri.', 'pq-temel'],
      ['Özet sütun / Sütunların özetini kaldır', 'Pivot ve unpivot.', 'Bütçe tablolarını uzun biçime çevirme.', 'pq-orta'],
      ['Liste olarak dönüştür / Sütunu böl / Biçim (kırp, temizle, büyük/küçük harf, önek/sonek)', 'Metin işlemleri.', 'Temizlik.', 'pq-temel'],
      ['Ayıkla (uzunluk, ilk/son karakterler, sınırlayıcılar arasında)', 'Metinden parça alır.', 'Kod parçalama.', 'pq-temel'],
      ['İstatistikler / Standart / Bilimsel / Trigonometri / Yuvarlama', 'Sayısal işlemler.', 'Birim çevirme.', 'pq-temel'],
      ['Tarih / Saat / Süre', 'Yıl, ay, gün başlangıcı, yaş vb.', 'Tarih parçaları.', 'pq-temel'],
      ['Yapılandırılmış sütun: Genişlet / Topla / Değerleri ayıkla', 'Kayıt, liste ve tablo sütunlarını açar.', 'JSON ve birleştirme sonuçları.', 'pq-model'],
      ['R / Python betiği çalıştır', 'Betikle dönüşüm.', 'Özel istatistik; kişisel ağ geçidi gerekebilir.', 'pq-orta']
    ] },
    { id: 'pq-sutun', name: 'Sütun ekle', desc: 'Mevcut sütunları koruyup yeni sütun ekler.', cmds: [
      ['Örneklerden sütun', 'Birkaç örnek yazarsın, Power Query kuralı çıkarır.', 'Karmaşık metin dönüşümleri.', 'pq-orta'],
      ['Özel sütun', 'M formülüyle yeni sütun.', 'Hesap: [Adet] * [Fiyat].', 'm-dili'],
      ['Koşullu sütun', 'Eğer/değilse sihirbazı.', 'Gruplama, bantlama.', 'pq-orta'],
      ['Dizin sütunu', '0 ya da 1\'den başlayan sıra numarası.', 'Vekil anahtar; katlamayı bozabilir, sona koy.', 'pq-model'],
      ['Sütunu çoğalt', 'Kopya sütun.', 'Orijinali koruyup dönüştürmek için.', 'pq-temel'],
      ['Özel işlev çağır', 'Kaydedilmiş bir M fonksiyonunu her satıra uygular.', 'Yeniden kullanılabilir temizlik.', 'm-dili'],
      ['Biçim / Ayıkla / İstatistik / Tarih / Saat', 'Dönüştür sekmesindekilerin yeni sütun üreten sürümleri.', '—', 'pq-temel']
    ] },
    { id: 'pq-gorunum', name: 'Görünüm', desc: 'Profil çıkarma ve görünüm ayarları.', cmds: [
      ['Formül çubuğu', 'Seçili adımın M formülünü gösterir.', 'Hep açık tut.', 'm-dili'],
      ['Sütun kalitesi / dağılımı / profili', 'Geçerli-hata-boş yüzdeleri, farklı değer sayısı, istatistikler.', 'Veriyi değerlendirme (PL-300).', 'pq-temel'],
      ['Tüm veri kümesine göre profil oluştur', 'Varsayılan ilk 1000 satır yerine tüm veri.', 'Nadir hataları yakalamak için.', 'pq-temel'],
      ['Sorgu bağımlılıkları', 'Sorguların birbirine bağımlılık diyagramı.', 'Başvuru zincirlerini anlamak için.', 'pq-model'],
      ['Sütuna git / Boşlukları göster', 'Gezinme.', '—', 'pq-temel']
    ] },
    { id: 'pq-araclar', name: 'Araçlar ve adım menüsü', desc: 'Tanılama ve adım düzeyi işlemler.', cmds: [
      ['Sorgu tanılaması', 'Sorgunun kaynağa gönderdiği istekleri ve sürelerini kaydeder.', 'Yavaş yenileme teşhisi.', 'performans'],
      ['Yerel sorguyu görüntüle (adıma sağ tık)', 'Adımın kaynağa SQL olarak katlanıp katlanmadığını gösterir.', 'Sorgu katlama kontrolü.', 'pq-orta'],
      ['Yüklemeyi etkinleştir / Rapor yenilemeye dahil et (sorguya sağ tık)', 'Sorgunun modele yüklenip yüklenmeyeceği ve yenilemeye katılıp katılmayacağı.', 'Ara sorgular.', 'pq-model'],
      ['Başvuru / Çoğalt (sorguya sağ tık)', 'Yeni sorguyu sonuca bağlı ya da bağımsız oluşturur.', 'Boyut türetme.', 'pq-model'],
      ['Grupla (sorgular bölmesi)', 'Sorguları klasörlere ayırır (Kaynak, Boyutlar, Olgular).', 'Düzen.', 'pq-model']
    ] }
  ] },
  { grp: 'Power BI Service', tabs: [
    { id: 'srv-calisma', name: 'Çalışma alanı', desc: 'İçeriklerin ve ekibin yönetildiği alan.', cmds: [
      ['Yeni öğe', 'Rapor, pano, sayfalandırılmış rapor, anlam modeli, veri akışı (Fabric\'te lakehouse, not defteri…).', '—', 'yayinlama'],
      ['Erişimi yönet', 'Yönetici, Üye, Katkıda bulunan, Görüntüleyici rolleri.', 'Ekip yetkileri.', 'yonetisim'],
      ['Çalışma alanı ayarları', 'Ad, açıklama, kapasite/lisans modu, Git tümleştirmesi, OneLake.', 'Kurulum.', 'yasam-dongusu'],
      ['Uygulama oluştur / güncelle', 'İçeriği kitlelere paketler; gezinme ve izinler.', 'Son kullanıcı dağıtımı.', 'yayinlama'],
      ['Dağıtım işlem hattı oluştur', 'Geliştirme → Test → Üretim.', 'Kurumsal yaşam döngüsü.', 'yasam-dongusu'],
      ['Soy görünümü', 'Kaynaktan rapora öğeler arası bağımlılıklar.', 'Etki analizi.', 'yasam-dongusu']
    ] },
    { id: 'srv-model', name: 'Anlam modeli ayarları', desc: 'Yayımlanmış modelin ayarları.', cmds: [
      ['Ağ geçidi ve bulut bağlantıları', 'Kaynakların hangi ağ geçidi/bağlantı ile kullanılacağı.', 'Şirket içi kaynaklar.', 'yonetisim'],
      ['Veri kaynağı kimlik bilgileri', 'Yenileme için kimlik bilgisi.', 'İlk yayımdan sonra.', 'yayinlama'],
      ['Parametreler', 'Power Query parametrelerinin değerleri.', 'Ortam değişimi.', 'pq-model'],
      ['Zamanlanmış yenileme', 'Gün/saat ve başarısızlık bildirimi.', 'Import modeller.', 'yayinlama'],
      ['Satır düzeyi güvenlik', 'Rollere kullanıcı ve grup atama; Rol olarak test et.', 'RLS dağıtımı.', 'guvenlik'],
      ['Onaylama', 'Tanıt ya da sertifikala.', 'Doğru modeli bulunur kılmak.', 'yonetisim'],
      ['Büyük anlam modeli depolama biçimi', 'Büyük model biçimini açar.', 'Kapasitede büyük modeller.', 'kurumsal-model'],
      ['Derleme izni / Yönet izinleri', 'Kimlerin bu modelden rapor yapabileceği.', 'Paylaşılan model stratejisi.', 'yonetisim']
    ] },
    { id: 'srv-rapor', name: 'Rapor menüsü', desc: 'Service\'te bir rapor açıkken üst çubuk.', cmds: [
      ['Dosya → Kopyasını kaydet / İndir (.pbix) / Yazdır', 'Rapor dosyası işlemleri.', '—', 'yayinlama'],
      ['Dışa aktar → PowerPoint / PDF / Excel\'de analiz et', 'Excel\'de analiz et: modele Excel pivot tablosuyla bağlanır (Derleme izni gerekir).', 'Excel kullanıcıları için.', 'yonetisim'],
      ['Paylaş / Sohbet (Teams) / Bağlantı kopyala', 'Kişi ya da grupla paylaşma.', 'Hızlı paylaşım.', 'yonetisim'],
      ['Abone ol', 'Düzenli e-posta anlık görüntüsü.', 'Yöneticilere haftalık özet.', 'yonetisim'],
      ['Düzenle', 'Raporu tarayıcıda düzenler.', 'Küçük değişiklikler.', 'yayinlama'],
      ['Görünüm → Kişisel yer imleri / Odak modu / Sayfayı tam ekran', 'Okuyucu özellikleri.', '—', 'hikaye'],
      ['Sabitle (görselde iğne)', 'Görseli bir panoya sabitler.', 'Pano oluşturma.', 'yonetisim'],
      ['Uyarı ayarla (pano kutucuğu)', 'Eşik aşılınca bildirim.', 'Kart, KPI, gösterge kutucuklarında.', 'yonetisim']
    ] },
    { id: 'srv-yonetici', name: 'Yönetici portalı', desc: 'Kiracı yöneticisinin ayarları (özet).', cmds: [
      ['Kiracı ayarları', 'Web\'de yayımla, dışa aktarma, Copilot, özel görseller, sertifikalama kimlerin yapabileceği.', 'Kuruluş politikaları.', 'yonetisim'],
      ['Kapasite ayarları', 'Fabric/Premium kapasiteleri, iş yükleri, XMLA okuma-yazma.', 'Kurumsal model.', 'kurumsal-model'],
      ['Denetim ve kullanım ölçümleri', 'Kim neye ne zaman baktı.', 'Benimseme ve güvenlik.', 'yonetisim']
    ] }
  ] }
];
})(window);
