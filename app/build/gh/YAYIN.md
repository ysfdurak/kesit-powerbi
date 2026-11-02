# Kesit Power BI'ı GitHub Pages'te yayınlama

> **Durum:** Dosyalar `ysfdurak/kesit-powerbi` deposuna yüklendi, adın ve bağlantıların `config.js`'e yazıldı. Senin yapman gerekenler aşağıda “Kalanlar” başlığında.

## Kalanlar
- [ ] Pages açık değilse: Settings → Pages → Branch `main` / root → Save (adım 2).
- [ ] İstersen form kur: `feedbackFormUrl` boşken geri bildirim GitHub Issues'a gider (adım 4).
- [ ] İstersen ders yorumları: Discussions'ı aç, Giscus'u kur, `repoId` ve `categoryId`'yi yaz (adım 5). Boşken yorum alanı görünmez.
- [ ] İstersen ziyaret sayacı: GoatCounter kodunu yaz (adım 6). Boşken sayaç çalışmaz.

Ücretsiz, hesapsız, portföy amaçlı yayın. Yaklaşık 30–45 dakika sürer. Kod yazman gerekmiyor; yalnızca `config.js` dosyasını düzenleyeceksin.

## 1. Depoyu oluştur ve dosyaları yükle
1. https://github.com adresinde giriş yap → sağ üstte **+ → New repository**.
2. **Repository name:** `kesit-powerbi` · **Public** seç · README ekleme seçeneğini işaretleme → **Create repository**.
3. Açılan sayfada **uploading an existing file** bağlantısına tıkla.
4. Zip'ten çıkardığın `kesit-powerbi` klasörünün **içindekilerin tamamını** (klasörün kendisini değil) sürükleyip bırak. `veri` ve `ekran` klasörleri de gelsin. `.nojekyll` dosyası gizli olduğu için görünmeyebilir; görünmezse sorun değil.
5. Alttaki **Commit changes** düğmesine bas. GitHub web arayüzü tek seferde 100 dosya yükler; dosya sayısı bunun altında.

## 2. Sayfayı aç
1. Depoda **Settings → Pages**.
2. **Source:** *Deploy from a branch* · **Branch:** `main`, klasör `/ (root)` → **Save**.
3. 1–2 dakika sonra sayfanın üstünde adres çıkar: `https://ysfdurak.github.io/kesit-powerbi/`. Aç; karşılama ekranındaki üç kapı görünmeli.

## 3. Kendi bilgilerini yaz
Depoda `config.js` dosyasını aç → sağ üstteki kalem simgesi (**Edit**) → `author` alanlarını doldur → **Commit changes**. Bir iki dakika içinde siteye yansır. Doldurmayı unutma:
- `sqlUrl`: Kesit SQL'i de yayınladıysan onun adresi (ana sayfadaki ve Hakkında'daki bağlantı buna gider).
- `README.md`: `ysfdurak` yazan yeri kendi kullanıcı adınla değiştir.
- `LICENSE` ve `LICENSE-ICERIK.md`: `AD SOYAD` yerine adını yaz.

## 4. Geri bildirim formu (Google Forms, isteğe bağlı)
Bu adım atlanırsa “Geri bildirim” ve “Sorun bildir” düğmeleri GitHub Issues'ta ders adı dolu bir kayıt açar.

1. https://forms.google.com → boş form. Başlık: *Kesit Power BI geri bildirim*.
2. Sorular:
   - **Ders** (kısa yanıt)
   - **Ne oldu?** (çoktan seçmeli: Hata buldum / Anlatım eksik ya da anlaşılmaz / Öneri / Diğer)
   - **Ayrıntı** (paragraf)
   - **Sana ulaşmamı ister misin? İstersen e-posta adresin** (kısa yanıt, isteğe bağlı)
3. Ayarlar → Yanıtlar: **E-posta adreslerini toplama** kapalı olsun.
4. Sağ üstte **⋮ → Önceden doldurulmuş bağlantı al** → **Ders** alanına tam olarak `{ders}` yaz → **Bağlantı al → Bağlantıyı kopyala**.
5. `config.js` içinde `feedbackFormUrl` alanına bu bağlantıyı yapıştır.

Form tanımlanınca her dersin başlığının altında “Bu ders hakkında geri bildirim” bağlantısı çıkar ve ders adı forma kendiliğinden yazılır. Alıştırmalardaki “Sorun bildir” düğmeleri de bu forma gider. Kesit SQL için açtığın formu burada da kullanabilirsin; Ders alanından hangi uygulama olduğu anlaşılır.

## 5. Ders yorumları (Giscus)
1. Depoda **Settings → General → Features → Discussions** kutusunu işaretle.
2. **Discussions** sekmesinde kategori düzenleme simgesinden yeni kategori aç: Ad: `Dersler`, biçim: **Announcement**. Bu biçimde yeni başlığı yalnızca sen ve Giscus açabilir, ziyaretçiler yalnızca yorum yazar.
3. https://github.com/apps/giscus → **Install** → yalnızca `kesit-powerbi` deposunu seç.
4. https://giscus.app/tr sayfasında:
   - **Depo:** `ysfdurak/kesit-powerbi`
   - **Sayfa ↔ Tartışma eşlemesi:** *Tartışma başlığı belirli bir terimi içersin*
   - **Kategori:** `Dersler`
   - Sayfanın altında oluşan kodda `data-repo-id` ve `data-category-id` değerlerini kopyala.
5. `config.js` içindeki `giscus` alanını doldur:
   ```js
   giscus: { repo: 'ysfdurak/kesit-powerbi', repoId: 'R_...', category: 'Dersler', categoryId: 'DIC_...' },
   ```
Her ders için ilk yorum yazıldığında o derse ait tartışma başlığı (`ders-<ders-kodu>`) otomatik açılır.

## 6. Ziyaretçi sayacı (GoatCounter)
GitHub Pages ziyaretçi istatistiği vermez. GoatCounter ticari olmayan kullanımda ücretsiz, çerez kullanmaz, onay bandı gerektirmez.
1. https://www.goatcounter.com → **Sign up**. **Code** alanına kısa bir ad yaz (ör. `kesitpowerbi`); panelin adresi `https://kesitpowerbi.goatcounter.com` olur.
2. `config.js` içinde `goatcounter: 'kesitpowerbi'` yaz (yalnızca kod) → **Commit changes**.
3. Siteyi aç, birkaç sayfa gez; birkaç dakika içinde panelde görünür.

Panelde göreceklerin:
- **Sayfalar:** her ders, öğrenme yolu, rapor ve vaka paketi ayrı satır; görüntülenme ve tekil ziyaretçi sayısı.
- **Olaylar:** `karsilama/yeni` (Hiç bilmiyorum'u seçenler), `ders-bitti/<ders>`, `seviye-testi/<seviye>`, `veri-indir/<paket>`, `geri-bildirim-acildi`.
- **Nereden geldiler:** LinkedIn, GitHub, arama motoru; ülke, tarayıcı, cihaz.
Kişiyi tanımlayan bir bilgi tutulmaz; yalnızca toplu sayıları görürsün. Sayaç yalnızca yayındaki sitede çalışır; bilgisayarında dosyayı açarken saymaz.

## 7. Yayından sonra kontrol listesi
- [ ] Sayfa açılıyor; karşılama ekranında üç kapı var.
- [ ] “Hiç bilmiyorum” → “1 dakikada ilk ölçün” → ilk alıştırmada **Kontrol et** çalışıyor.
- [ ] **Veri setleri** sayfasında bir paketi indir; zip açılıyor, içinde CSV'ler ve BENIOKU.md var.
- [ ] **Raporlar** sayfasında bir rapor çiziliyor.
- [ ] Hakkında sayfasında adın ve bağlantıların doğru.
- [ ] Bir derste geri bildirim formu, ders adı dolu olarak açılıyor.
- [ ] Bir dersin konu anlatımının altında yorum alanı görünüyor; deneme yorumu yaz, sonra sil.
- [ ] Profil → **İlerlemeyi indir** dosya indiriyor, **dosyadan yükle** geri yüklüyor.
- [ ] GoatCounter panelinde ziyaretin göründü.
- [ ] Telefondan da aç.

## 8. LinkedIn'de portföy olarak
- Profilinde **Öne çıkanlar (Featured) → Bağlantı ekle** → sitenin adresi. Başlık: *Kesit Power BI: tarayıcıda çalışan Türkçe Power BI ve DAX eğitimi*. Görsel olarak `ekran/alistirma.png` kullanabilirsin.
- İki uygulamayı (Kesit SQL ve Kesit Power BI) aynı projede birlikte anlatmak güçlü durur: aynı ürün mantığı, iki farklı motor.

## Güncelleme
Bir dosyayı değiştirmek için depoda dosyayı aç → kalem simgesi → düzenle → **Commit changes**. Birden çok dosya için **Add file → Upload files** ile aynı adlı dosyaları yeniden yükle; eskilerinin yerine geçer.

## Bilmen gerekenler
- İlerleme her kullanıcının kendi tarayıcısında saklanır. Tarayıcıyı kapatmak silmez; tarayıcı verisini temizlemek ya da gizli pencere siler. Uygulama 10 derste bir yedek almayı hatırlatır.
- Claude içinde açıldığında çalışan bulut eşitlemesi GitHub Pages'te yoktur; bunun yerine dosyaya yedekleme vardır.
