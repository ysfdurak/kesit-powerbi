/* Kesit SQL yapılandırması — yayından önce yalnızca bu dosyayı düzenlemen yeterli (YAYIN.md). */
window.KESIT_CONFIG = {
  /* Hakkında sayfasında görünür. Boş bırakılan alan gösterilmez. */
  author: {
    name: '',            // örnek: 'Ad Soyad'
    title: '',           // örnek: 'Veri Analisti'
    bio: '',             // bir iki cümle
    linkedin: '',        // örnek: 'https://www.linkedin.com/in/kullaniciadi'
    github: '',          // örnek: 'https://github.com/kullaniciadi'
    repo: ''             // örnek: 'https://github.com/kullaniciadi/kesit-sql'
  },
  /* Hakkında → "Nasıl yapıldı". Boş bırakırsan bölüm görünmez. */
  story: '',
  license: '',           // boşsa: içerik CC BY-NC 4.0, kod MIT

  /* Geri bildirim formu (Google Forms ya da Tally). Adreste {ders} yazan yere ders adı otomatik gelir.
     Google Forms: formda "Ders" adlı kısa yanıt sorusu aç → ⋮ → "Önceden doldurulmuş bağlantı al" → Ders alanına {ders} yaz → bağlantıyı kopyala.
     Tally: formun adresinin sonuna ?ders={ders} ekle ve formda "ders" adlı gizli alan tanımla. */
  feedbackFormUrl: '',

  /* Ders yorumları (Giscus, GitHub Discussions). Değerleri https://giscus.app sayfasından al (YAYIN.md, adım 4). */
  giscus: { repo: '', repoId: '', category: '', categoryId: '' },

  /* Ziyaret sayacı (GoatCounter, çerezsiz). goatcounter.com'da açtığın kod: örn. 'kesitsql' → https://kesitsql.goatcounter.com
     Boş kalırsa sayaç yüklenmez. */
  goatcounter: '',

  /* İsteğe bağlı hesap sistemi (Supabase). Portföy sürümünde BOŞ kalsın: hesap olmaz, kişisel veri toplanmaz. */
  supabaseUrl: '',
  supabaseAnonKey: '',
  google: false,
  privacyUrl: 'gizlilik.html'
};
