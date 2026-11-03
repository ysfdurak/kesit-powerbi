/* Kesit Power BI yapılandırması — yayından sonra yalnızca bu dosyayı düzenlemen yeterli (kaynak dalında app/build/gh/YAYIN.md). Boş bırakılan özellik görünmez. */
window.KESIT_CONFIG = {
  /* Sitenin adresi (paylaşım önizlemesinde kullanılır). */
  siteUrl: 'https://ysfdurak.github.io/kesit-powerbi/',

  /* Hakkında sayfasında görünür. */
  author: {
    name: 'Yusuf Durak',
    title: 'Süreç ve Sistem Yalınlaştırma Yöneticisi · Operasyon Geliştirme Yöneticisi',
    bio: 'Süreçleri ve sistemleri yalınlaştırıyor, operasyonları veriyle geliştiriyorum. İsrafı azaltan, ekipleri hızlandıran basit çözümler kurmaya odaklanıyorum.',
    linkedin: 'https://www.linkedin.com/in/yusuf-durak',
    github: 'https://github.com/ysfdurak',
    repo: 'https://github.com/ysfdurak/kesit-powerbi'
  },
  /* Hakkında → "Nasıl yapıldı". */
  story: 'Operasyon geliştirme işinde kararların çoğu bir rapora bakılarak veriliyor; ama raporu kuran kişiyle soruyu soran kişi çoğu zaman farklı, aradaki bekleyiş de en büyük israflardan biri. Power BI bu mesafeyi kısaltan en güçlü araçlardan biri; Türkçe, kurulum gerektirmeyen ve yaparak öğreten, iş hayatına hazırlayan bir kaynak ise yok denecek kadar az. Kesit Power BI\'ı bu boşluğu doldurmak için tasarladım. Ürün sahibi gibi çalıştım: hedef kitleyi, Temel–Orta–İleri seviye yapısını, rol odaklı öğrenme yollarını, örnek raporları ve banka, havayolu, yemek teslimatı, İK ve bisiklet paylaşımı vaka veri setlerini ben kurguladım; kodu, tarayıcıda çalışan DAX motorunu ve içeriği yapay zekâ (Claude) ile geliştirdim. Kaliteyi otomatik denetimlerle sağlamaya çalıştım: her alıştırma motorda çözülüyor, vaka görevlerinin beklenen sonuçları ayrıca SQL ile bağımsız olarak doğrulanıyor; bulunan hatalar düzeltilip her sürüm yeniden denetlendi. Kardeş projeleri Kesit SQL ve Kesit Python ile aynı ürün mantığını paylaşıyor.',
  license: '',           // boşsa: içerik CC BY-NC 4.0, kod MIT

  /* Kesit ailesi (menünün altındaki bağlantılar). */
  homeUrl: 'https://ysfdurak.github.io/',
  sqlUrl: 'https://ysfdurak.github.io/kesit-sql/',
  pbiUrl: 'https://ysfdurak.github.io/kesit-powerbi/',
  pythonUrl: 'https://ysfdurak.github.io/kesit-python/',

  /* Boşsa geri bildirim GitHub Issues'a gider. Form kullanılacaksa adresi buraya yaz: {ders} yazan yere ders adı gelir (kaynak dalında YAYIN.md, adım 4). */
  feedbackFormUrl: '',

  /* Ders yorumları (Giscus, GitHub Discussions). repoId ve categoryId için kaynak dalında YAYIN.md, adım 5. İkisi boşken yorum alanı görünmez. */
  giscus: { repo: 'ysfdurak/kesit-powerbi', repoId: '', category: 'Dersler', categoryId: '' },

  /* Ziyaret sayacı (GoatCounter, çerezsiz). Örn. 'kesitpowerbi' → https://kesitpowerbi.goatcounter.com (kaynak dalında YAYIN.md, adım 6). */
  goatcounter: ''
};
