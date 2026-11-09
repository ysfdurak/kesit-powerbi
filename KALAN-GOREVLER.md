# Kesit Power BI — dört etap

8 Kasım 2026. Başlangıç kaynak sürümü: c9fe9cf.

## 1. Güvenilir yayın ve paket eşleşmesi

Kapsam: mevcut cevap doğrulama ve kayıt kurtarma düzeltmelerini test etmek, kaynak derlemesinden yayın paketini üretmek, main dalına aktarmak, Pages sonucunu ve canlı çekirdek dosyalarının SHA-256 özetlerini kontrol etmek. Test araçları yayın paketi üzerinde de çalıştırılır. Geçmiş test beyanı yeni test sonucu yerine kullanılmaz.

Kabul: 443 referans çözüm geçer; sabit cevap reddedilir; iki eşdeğer çözüm kabul edilir; altı kayıt koruma kontrolü geçer; kaynak bütünlük kontrolü geçer; Pages başarılıdır; dört çekirdek dosya canlı yayında manifestle eşleşir.

## 2. Gerçek Power BI Desktop referans raporu

G04 durumu: Lezzet Kurye proje paketi yayında. Windows Power BI Desktop açılış, yenileme ve görsel inceleme kaydı bekliyor.

G04: Tek bir vaka için açık üretim adımları, model/ilişki şeması, ölçüler, filtreli ve filtresiz kontrol sayıları, rapor sayfaları ve inceleme kaydı. Desktop'ta açılıp doğrulanmayan dosya doğrulanmış PBIX diye sunulmaz. İnsan/Desktop doğrulaması ayrı durum taşır.

## 3. Rol bazlı yeterlik ve teslim kanıtları

G07, G17–G19, G21: rol beklentilerini gerçek görev/çıktıya bağlama; benzetim ve gerçek uygulama ayrımı; yardımlı/bağımsız çözüm ayrımı; bitirme projesinde dosya/model/karar notu kanıtı; farklı veride transfer görevi. Uzman incelemesi G08 ayrıca kaydedilir.

Teslim: 12 öğrenme yolunun bitirme projesinde role özel iş görevi, farklı veride bağımsız tekrar, çalışma ortamı ve indirilebilir teslim kaydı yer alır. Çalışma biçimi kullanıcı beyanıdır. G08 incelemesi kaydedildi. İlk düzeltmede BT İş Analisti yolu ayrı sentetik WMS sevkiyat vakasına bağlandı. İlk uygulama ile bağımsız tekrar ayrı kayıtlar ve ayrı dışa aktarma bölümleri olarak tamamlandı. DP-600 yol, ders ve kapsam haritası Microsoft Learn’in dört alanıyla eşlendi. Haritada soru eksiği olan başlıklar görünür. G08-04 kapsamında 12 yolun kabul ölçütleri ve olumsuz senaryoları proje ekranında ve teslim şablonunda yer alır. G08-05 kapsamında ilk uygulama ve bağımsız tekrar için doğru veri veya rapor bağlantıları proje ekranında ve teslim şablonunda ayrı gösterilir.

## 4. Kullanıcı deneyimi, performans ve bakım

G09, G12–G16, G20, G22–G23, G36: kalan eski yol bağımlılıkları, içerik yükleme bütçesi, klavye odağı, geçmiş rapor durumları ve sayı manifesti. Fiziksel Android ve gözlemli kullanıcı pilotu sonuçları otomatik testten ayrı tutulur.

Mobil menüde öğrenme yolları ve bitirme projeleri üstte yer alır. Yolun başından projeye geçilebilir. Proje ve işe hazırlık bölümleri paylaşılabilen bağlantılarla açılır. Mobil DAX editöründe işaretler kaydırma gerektirmeden görünür. Açıkça çalıştırılan kodun sonucu ve hata mesajı öne gelir. Sonuçtan editöre dönülebilir. Koyu temada yol rozetlerinin, tamamlanma işaretlerinin, kod açıklamalarının ve sunum düğmelerinin kontrastı iyileştirildi. Açık temada kazanılmamış rozetlerin metni, yüklenen rapor kartlarının başlıkları ve Power Query uyarılarının kontrastı iyileştirildi.

## Sınırlar

Teslimat vakasının portföy deposundaki G05/G24–G27 işleri ayrı proje kapsamındadır. Önceden yapılmış düzeltmeler yeniden açık iş sayılmaz; eksik doğrulama açık kalır. Bu plan bütün içerik için uzman onayı vermez.
