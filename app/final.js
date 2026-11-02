/* Kesit Power BI — Final projesi: sıfırdan yayına uçtan uca profesyonel rapor. Her menü komutu bir aşamada kullanılır. */
(function (W) {
const S = [
  { n: 1, lv: 'A1', title: 'Proje kurulumu ve veri alma', goal: 'Boş bir Power BI Desktop dosyasından başlayıp Anadolu Market verisini (Excel + SQL) içeri al, dosyayı doğru ayarlarla kaydet.',
    tasks: [
      'Dosya → Seçenekler → Geçerli dosya → Veri yükleme: “Otomatik tarih/saat” ve “İlişkileri otomatik algıla” seçeneklerini kapat; bölgesel ayarı Türkçe yap.',
      'Giriş → Veri al → Excel çalışma kitabı: Satislar, Urunler, Musteriler, Calisanlar sayfalarını seç; “Yükle” yerine “Verileri dönüştür”e bas.',
      'Giriş → Veri al → SQL Server ile Hedefler tablosunu, Veri gir ile küçük bir Kanal açıklama tablosunu ekle.',
      'Dosya → İçeri aktar ile şirketin standart tema/şablonunu (.pbit) değerlendir; Son kaynaklar listesini kontrol et.',
      'Dosya → Veri kaynağı ayarları ve Giriş → Verileri dönüştür → Parametreleri düzenle: dosya yolunu “KaynakKlasor” parametresine bağla.',
      'Sol görünümler: Rapor ve Tablo görünümleri arasında geçip yüklenen satır sayılarını doğrula; Giriş → Yenile ile yenile.',
      'Yardım → Kılavuzlu öğrenme / Belgeler: kullandığın bağlayıcının belge sayfasını bul (sınavda da sorulur).',
      'Dosyayı Power BI Projesi (.pbip) olarak kaydet.'
    ], measures: [], deliver: 'Tüm kaynakları içeri almış, parametreli ve .pbip olarak kaydedilmiş dosya.' },
  { n: 2, lv: 'A2', title: 'Power Query ile temizlik ve şekillendirme', goal: 'Kirli kaynakları güvenilir, doğru türde ve yıldız şemaya hazır tablolara dönüştür.',
    tasks: [
      'Görünüm → Sütun kalitesi / dağılımı / profili ve “Tüm veri kümesine göre profil oluştur”: hatalı ve boş değerleri bul.',
      'Giriş: Sütunları kaldır, Satırları kaldır (boş/hatalı), Sırala, İlk satırı başlık olarak kullan, Veri türü; Dönüştür → Türleri algıla değil, türleri elle ver.',
      'Dönüştür → Değerleri değiştir / Hataları değiştir / Doldur (aşağı) ile eksik kategori adlarını tamamla; Biçim → Kırp, Temizle, Her Sözcüğün İlk Harfini Büyüt.',
      'Dönüştür → Sütunu böl ve Ayıkla ile “AdSoyad”dan e-posta kullanıcı adı üret; Tarih → Yıl, Ay adı.',
      'Hedefler tablosunu Dönüştür → Sütunların özetini kaldır ile geniş biçimden uzun biçime çevir; ters işlem için Özet sütunu dene; Devrik ve Satır sayısını say ile kontrol et.',
      'Sütun ekle: Örneklerden sütun (İndirim bandı), Koşullu sütun, Özel sütun (Tutar = Adet × BirimFiyat × (1 − İndirim)), Dizin sütunu, Sütunu çoğalt.',
      'Giriş → Gruplandırma ölçütü ile müşteri başına ilk sipariş tarihini hesapla; Sorguları birleştir (Musteriler ← ilk sipariş) ve Sorguları ekle (2023 + 2024 dosyaları); Dosyaları birleştir ile klasördeki aylık dosyaları tek tabloya al.',
      'Sütun ekle → Özel işlev çağır: temizleme adımlarını bir işleve çevirip her dosyaya uygula; Dönüştür → Yapılandırılmış sütun → Genişlet.',
      'Dönüştür → İstatistikler / Standart / Yuvarlama ile tutarları 2 haneye yuvarla; R/Python betiği seçeneğinin ne zaman uygun olduğunu not et.',
      'Giriş → Gelişmiş Düzenleyici ile M kodunu oku; adımları anlamlı adlarla yeniden adlandır. Görünüm → Formül çubuğu ve Sorgu bağımlılıkları.',
      'Araçlar: Sorgu tanılaması ile yavaş adımı bul; adıma sağ tık → Yerel sorguyu görüntüle (sorgu katlama); ara sorgularda Yüklemeyi etkinleştir’i kapat; Başvuru ve Çoğalt farkını uygula; sorguları gruplara ayır.',
      'Giriş → Yapay zekâ içgörüleri: neden bu projede kullanılmadığını (lisans, gerek) yaz; Önizlemeyi yenile; Kapat ve uygula.'
    ], measures: [], deliver: 'Hatasız yüklenen, türleri doğru, ara sorguları gizli bir sorgu seti.' },
  { n: 3, lv: 'A2', title: 'Yıldız şema ve tarih tablosu', goal: 'Olgu ve boyutları ayır, ilişkileri doğru kardinalite ve yönle kur, tarih tablosunu işaretle.',
    tasks: [
      'Model görünümünde tabloları yıldız düzeninde yerleştir; Modelleme → İlişkileri yönet: Satislar → Urunler, Musteriler, Tarih, Calisanlar; Hedefler → Kategoriler, Tarih (bire-çok, tek yön).',
      'Satislar[TeslimTarihi] → Tarih[Tarih] ilişkisini pasif bırak (rol oynayan boyut; ölçüde USERELATIONSHIP).',
      'Tablo araçları → Tarih tablosu olarak işaretle; Ad ile tabloları iş diliyle yeniden adlandır.',
      'Sütun araçları: Veri türü ve Biçim; Özetleme = Hiçbiri (anahtarlar, yıl); Veri kategorisi = Şehir (Musteriler[Sehir]); Sütuna göre sırala (Ay → AyNo); Veri grupları ile Yaş grubu.',
      'Veri bölmesinde anahtar sütunları gizle; Özellikler bölmesinde açıklama ve eş anlamlı ekle; ölçüler için ayrı bir “_Ölçüler” tablosu oluştur.'
    ], measures: [], deliver: 'Doğrulanmış yıldız şema (Veri Modeli sayfasındaki gibi).' },
  { n: 4, lv: 'B1', title: 'Temel ve zaman ölçüleri', goal: 'Raporun tüm sayılarının dayandığı ölçü katmanını yaz: önce temel, sonra karşılaştırma ölçüleri.',
    tasks: [
      'Modelleme → Yeni ölçü: [Toplam Satış], [Net Satış] (iptaller hariç), [Brüt Kâr], [Kâr Marjı %], [Sipariş Sayısı].',
      'Ölçü araçları: Ad / Giriş tablosu = _Ölçüler; Biçim (para birimi, yüzde); Görüntü klasörü (Temel, Zaman, Hedef).',
      'Zaman zekâsı: [Satış GY], [YoY %], [Satış YTD], [3 Ay Hareketli Ort.]. Hızlı ölçü ile YTD üret, oluşan DAX’ı kendi yazdığınla karşılaştır.',
      'Modelleme → Yeni sütun (Satislar[KargoGun]) ve Yeni tablo (UrunlerVeDiger) — hesaplanmış sütun ile ölçü farkını not et.',
      'DAX sorgu görünümünde EVALUATE SUMMARIZECOLUMNS ile ölçüleri kategori × yıl tablosunda test et.'
    ], measures: ['Net Satış', 'Brüt Kâr', 'Kâr Marjı %', 'Sipariş Sayısı', 'Satış GY', 'YoY %', 'Satış YTD', '3 Ay Hareketli Ort.', 'Hedef', 'Hedef Gerçekleşme %'], deliver: 'Klasörlenmiş, biçimli, test edilmiş ölçü tablosu.' },
  { n: 5, lv: 'B1', title: 'Özet sayfasını tasarla', goal: 'Yönetici Özeti sayfasını 12 sütunluk ızgarada, tema ve biçim kurallarıyla kur.',
    tasks: [
      'Görünüm → Temalar: kurumsal tema (JSON) uygula; Sayfa görünümü = Sayfaya sığdır; Kılavuz çizgileri, Izgaraya yapış, Nesneleri kilitle.',
      'Ekle → Yeni sayfa (Özet) ve Sayfayı çoğalt; Giriş/Ekle → Yeni görsel: 4 KPI/kart, çizgi, halka, çubuk, tablo (Dashboardlar → Yönetici Özeti).',
      'Görselleştirmeler → Oluştur: alanları doğru kutulara koy; Biçim: başlık, eksen, veri etiketleri, renk; Analiz: ortalama ve sabit (hedef) çizgisi.',
      'Ekle → Metin kutusu (sayfa başlığı), Şekiller (ayırıcı), Görüntü (logo), Düğmeler (sayfa gezintisi).',
      'Biçim boyacısı ile ilk kartın biçimini diğer kartlara aktar; Biçim → Hizala / Dağıt / Öne getir; ilgili görselleri Gruplandır.',
      'Filtreler bölmesi: sayfa düzeyi filtre (Durum ≠ İptal değil — ölçüde çözüldü!), rapor düzeyi filtre gereksinimini tartış; Görünüm → Filtreler ile bölmeyi okuyucu için biçimlendir.'
    ], measures: ['Net Satış', 'Hedef', 'Satış GY', 'Kategori Payı %', 'Trend Mini Grafik'], dash: 'ozet', deliver: 'Biçim kurallarına uyan tek sayfalık özet.' },
  { n: 6, lv: 'B2', title: 'Etkileşim ve hikâye', goal: 'Okuyucunun özetten ayrıntıya kendi gitmesini sağla: detaya inme, detay sayfası, yer imleri, eşitlenmiş dilimleyiciler.',
    tasks: [
      'Kategori → Ürün hiyerarşisini çubuğa koy; Veri / Detaya git sekmesi: Detaya inme modu, Sonraki düzeye git, Bir düzey aşağı genişlet; Verileri göster / Kayıtları göster.',
      'Ürün detayı sayfası oluştur: Detaya git (drill through) alanına Urunler[Urun]; Geri düğmesi otomatik eklenir.',
      'Araç ipucu sayfası (320×240) kur ve kategori çubuğuna bağla (Püf Noktaları → Rapor sayfası araç ipucu).',
      'Biçim → Etkileşimleri düzenle: halka grafiğin KPI kartlarını filtrelemesini kapat, tabloyu vurgula yerine filtreleye çevir.',
      'Görünüm → Yer imleri ve Seçim: “Grafik / Tablo” geçiş yer imleri, gizli görseller; Yer imleri bölmesinde Veri seçeneğinin anlamını not et.',
      'Görünüm → Dilimleyicileri eşitle: Yıl dilimleyicisini tüm sayfalarda eşitle, Ekip sayfasında gizli ama etkin tut.'
    ], measures: ['Seçime Göre Pay %', 'Dinamik Başlık'], dash: 'urun', deliver: 'Kendi kendine keşfedilebilen çok sayfalı rapor.' },
  { n: 7, lv: 'B2', title: 'Yapay zekâ görselleri, mobil ve erişilebilirlik', goal: 'Analitik görselleri doğru yerde kullan, raporu telefona ve ekran okuyuculara uygun hâle getir.',
    tasks: [
      'Ekle → Anahtar etkileyiciler: “İade = Evet”i ne etkiliyor? Ayrıştırma ağacı: Net Satış → Kategori → Kanal → Segment.',
      'Ekle → Anlatı (akıllı anlatı) ve Giriş → Copilot ile sayfa özeti; çıktıyı ölçülerle doğrula.',
      'Ekle → Soru-Cevap ve Modelleme → Soru-Cevap kurulumu: eş anlamlılar (ciro = net satış) ve öneri soruları.',
      'Ekle → Sayfalandırılmış rapor görselini ve Power Apps / Power Automate görsellerini değerlendir: hangisi bu projede gerekli, neden?',
      'Görünüm → Mobil düzen: Özet sayfasının telefon düzenini kur; her görsele alternatif metin, sekme sırası (Seçim bölmesi) ver.'
    ], measures: ['Akıllı Etiket'], dash: 'musteri', deliver: 'Mobil düzenli, erişilebilirlik kontrolünden geçmiş rapor.' },
  { n: 8, lv: 'C1', title: 'İleri DAX, parametreler ve performans', goal: 'Uzun kalıpları (Top N + Diğer, ne olur, hesaplama grupları) ekle ve raporu hızlandır.',
    tasks: [
      'Modelleme → Yeni parametre → Sayısal aralık: Fiyat değişimi (−20%…+20%); Yeni parametre → Alanlar: ölçü seçici.',
      'Modelleme → Hesaplama grubu: Zaman Hesabı (Cari, GY, YTD, YoY %) ve dinamik biçim dizesi.',
      'Ölçü Laboratuvarı’ndaki İleri seviye kalıplarını (RFM, kohort, Top N + Diğer, LFL) kendi modeline uyarla.',
      'Görünüm → Performans Analizi ve İyileştir → Görselleri duraklat, İyileştirme ön ayarları, Sorgu azaltma ayarları: “Uygula” düğmeli dilimleyiciler.',
      'Harici araçlar → DAX Studio (sunucu zamanlamaları, VertiPaq Analyzer) ve Tabular Editor (toplu biçim, en iyi uygulama analizcisi); TMDL görünümünde ölçü klasörlerini metinle düzenle.'
    ], measures: ['Satış (Top N + Diğer)', 'Senaryo Kârı', 'RFM Segmenti', 'Kohort Tutma %', 'LFL Büyüme %', 'Görünüm (Dinamik Biçim)'], dash: 'fiyat', deliver: 'Tüm görselleri 1 sn altında çizilen, parametreli rapor.' },
  { n: 9, lv: 'C1', title: 'Güvenlik ve yayımlama', goal: 'Temsilcilerin yalnızca kendi verisini gördüğü raporu Service’e yayımla, yenilemeyi kur.',
    tasks: [
      'Modelleme → Rolleri yönet: “Temsilci” rolü, Calisanlar[Eposta] = USERPRINCIPALNAME(); Farklı görüntüle ile test et (Dashboardlar → Satış Ekibi).',
      'Giriş → Duyarlılık etiketi: “Genel değil — Şirket içi”.',
      'Giriş/Dosya → Yayımla: “Satış Analitiği [Geliştirme]” çalışma alanı.',
      'Service, çalışma alanı: Yeni öğe, Erişimi yönet (geliştiriciler Üye, okuyucular yalnızca uygulama), Çalışma alanı ayarları.',
      'Anlam modeli ayarları: Ağ geçidi ve bulut bağlantıları, Veri kaynağı kimlik bilgileri, Parametreler, Zamanlanmış yenileme (günde 2), Satır düzeyi güvenlik üyeleri, Onaylama (Yükseltilmiş), Büyük model depolama biçimi, Derleme izni.',
      'Uygulama oluştur: hedef kitleler (Yönetim, Satış), gezinti sırası.'
    ], measures: ['Temsilci Sırası', 'Ekip Satışı'], dash: 'ekip', deliver: 'RLS’li, zamanlanmış yenilemeli, uygulama ile dağıtılmış rapor.' },
  { n: 10, lv: 'C2', title: 'Dağıtım, yönetişim ve teslim', goal: 'Raporu geliştirme → test → üretim akışına al, tüketicilerin kullanımını ve yönetişimi kur, teslim dosyalarını hazırla.',
    tasks: [
      'Dağıtım işlem hattı oluştur (Geliştirme → Test → Üretim); parametre kurallarıyla kaynakları ortama göre değiştir; ALM Toolkit ile ortamlar arası model farkını karşılaştır.',
      'Soy görünümü: kaynak → anlam modeli → rapor → uygulama bağımlılıklarını doğrula.',
      'Rapor menüsü: Abone ol (Pazartesi 08:00), Paylaş / Teams / bağlantı, Dışa aktar → PowerPoint/PDF/Excel’de analiz et, Kopyasını kaydet / İndir, Düzenle, Kişisel yer imleri / Odak modu.',
      'Net Satış kartını panoya sabitle ve uyarı ayarla (hedefin %5 altına düşerse).',
      'Yönetici portalı: kiracı ayarları (dışa aktarma, Excel’de analiz), kapasite ayarları, denetim ve kullanım ölçümleri raporu.',
      'Dosya → Dışa aktar → Power BI şablonu (.pbit) ve PDF: teslim paketi; README’de ölçü sözlüğü ve sayfa amaçları.'
    ], measures: [], dash: 'hedef', deliver: 'Üretimde, izlenen ve belgelenmiş profesyonel rapor.' }
];
/* menü sekmesi → aşama (varsayılan, {komut sırası: aşama}) */
const TAB = {
  dosya: [10, { 0: 1, 1: 1, 2: 1, 6: 1, 7: 1, 5: 9 }], giris: [1, { 0: 5, 8: 5, 9: 5, 10: 4, 11: 9, 12: 9, 13: 7 }], ekle: [5, { 2: 7, 3: 7, 4: 7, 5: 7, 6: 7, 7: 7 }],
  modelleme: [4, { 0: 3, 5: 8, 6: 8, 7: 8, 8: 9, 9: 9, 10: 7 }], gorunum: [5, { 2: 7, 5: 6, 6: 6, 8: 6, 7: 8 }], iyilestir: [8], yardim: [1], harici: [8, { 2: 10 }],
  tablo: [3], sutun: [3], olcu: [4], bicim: [5, { 0: 6, 3: 6 }], veri: [6],
  gorunumler: [1, { 2: 3, 3: 4, 4: 8 }], bolmeler: [5, { 0: 3, 9: 3, 5: 6, 6: 6, 8: 6, 7: 8 }],
  'pq-giris': [2, { 1: 1, 2: 1, 3: 1 }], 'pq-donustur': [2], 'pq-sutun': [2], 'pq-gorunum': [2], 'pq-araclar': [2],
  'srv-calisma': [9, { 4: 10, 5: 10 }], 'srv-model': [9], 'srv-rapor': [10], 'srv-yonetici': [10]
};
const stageOf = (tab, i) => { const m = TAB[tab]; if (!m) return null; return (m[1] && m[1][i] != null) ? m[1][i] : m[0]; };
W.PBI_FINAL = {
  title: 'Anadolu Market Ticari Performans Raporu',
  intro: 'Bu proje, öğrendiğin her şeyi tek bir profesyonel teslimde birleştirir: veri almadan yayına, 10 aşamada. Sonunda beş sayfalı (Özet, Ürün, Müşteri, Hedef, Ekip), araç ipucu ve detay sayfalı, RLS’li, mobil düzenli ve dağıtım işlem hattında yaşayan bir rapor olacak. Aşağıdaki tablo, Power BI’ın her menü komutunun hangi aşamada kullanıldığını gösterir: final bittiğinde tüm menüleri en az bir kez kullanmış olursun.',
  stages: S, stageOf,
  pages: [['ozet', 'Özet'], ['urun', 'Ürün'], ['musteri', 'Müşteri'], ['hedef', 'Hedef'], ['ekip', 'Ekip']],
  rubric: [
    ['Soru', 'Her sayfanın tek cümlelik bir sorusu ve kitlesi var; başlıklar bu soruyu cevaplıyor.'],
    ['Model', 'Yıldız şema, işaretli tarih tablosu, gizli anahtarlar, iki yönlü ilişki yok (ya da gerekçeli).'],
    ['Ölçüler', 'Temel ölçüler bir kez tanımlı, diğerleri onları çağırıyor; biçimli, klasörlü, açıklamalı.'],
    ['Görseller', 'Her görsel türü soruya uygun; 0’dan başlayan çubuklar, tutarlı renkler, gereksiz süs yok.'],
    ['Etkileşim', 'Detaya inme, detay sayfası, araç ipucu, eşitlenmiş dilimleyiciler, düzenlenmiş etkileşimler.'],
    ['Performans', 'Performans Analizi’nde her görsel < 1 sn; gereksiz sütun/satır yüklenmemiş.'],
    ['Güvenlik', 'RLS rolü test edilmiş; çalışma alanı rolleri doğru; duyarlılık etiketi var.'],
    ['Teslim', 'Uygulama, abonelik, uyarı, işlem hattı ve belgeler hazır.']
  ]
};
})(window);
