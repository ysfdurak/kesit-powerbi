# Kesit Power BI

**Sıfırdan işe hazır seviyeye Türkçe Power BI, DAX ve Fabric eğitimi. Kurulum yok, hesap yok.** Tarayıcında çalışan, DAX'ı benzeten bir motorla ölçü yazarsın; her alıştırma anında denetlenir.

**Dene:** https://ysfdurak.github.io/kesit-powerbi/

![Alıştırma ekranı](ekran/alistirma.png)

## Neler var?
- **150 ders, 1.250 ders içi alıştırma, 117 pratik görevi.** İlk ölçüden genişletilmiş tablolara, hesaplama gruplarına, Direct Lake'e ve mülakat kalıplarına kadar; Temel, Orta ve İleri seviyeler.
- **12 öğrenme yolu:** veri analisti, BI geliştirici, PL-300, DP-600 / Fabric, DAX ustalığı, Excel'den Power BI'a ve diğerleri. Her yolun aşamaları ve işe hazırlık listesi var; bitirme projesi olanlar Bitirme projeleri sayfasında.
- **Seviye testi:** geçtiğin seviyenin dersleri “sıradaki ders” listesinden atlanır; ilerleme yüzdesine tamamlanmış sayılmaz.
- **24 örnek rapor, 104 sayfa:** yer işaretleri, araç ipucu sayfaları, detaya git, alan parametreleri ve mobil düzenle, adım adım anlatılmış. Bunlar Power BI raporu örnekleridir; Service'teki pano (dashboard) ayrı bir nesnedir.
- **6 hayali veri seti:** Anadolu Market (derslerin modeli) ve Desktop'ta çalışmak için 5 vaka paketi: Ilgaz Bank, Kanat Havayolları, Lezzet Kurye, Pusula İK, Pedal İzmir. Her pakette CSV'ler, model planı, ölçü kütüphanesi ve beklenen sonuçlu görevler var. Ölçekler öğretim için küçültülmüştür; veri setlerinin bilerek bırakılan izleri ve sınırları uygulamadaki Veri setleri sayfasındadır.
- **Sınav ve mülakat:** 193 özgün PL-300 / DP-600 deneme sorusu, 185 mülakat sorusu (zayıf ve güçlü cevap örnekleriyle), canlı DAX kodlama turu, ev ödevleri. Kapsam haritası her resmî sınav maddesini derse ve sorulara bağlar.
- **Araçlar ve referans:** DAX Playground, Power Query Lab, Measure Lab, DAX Arena; 86 püf noktası, 66 sık karıştırılan kavram, sık hatalar ve iki dilli (Türkçe, İngilizce) Power BI komut listesi.

| Karşılama | Örnek rapor | Vaka veri seti |
|---|---|---|
| ![](ekran/karsilama.png) | ![](ekran/rapor.png) | ![](ekran/veri-seti.png) |

## Nasıl çalışıyor?
- Sunucu yok. DAX'ın filtre bağlamı, bağlam geçişi, zaman zekâsı ve tablo fonksiyonları tarayıcıda çalışan, DAX'ı benzeten bir motorla hesaplanıyor (206 fonksiyon). Microsoft'un motoru değildir; bilinen sınırları uygulamadaki Hakkında sayfasında listeli. Power Query adımları da tarayıcıda benzetiliyor. T-SQL, PySpark ve KQL çalışmaz: DP-600 ödevleri gerçek Fabric'te yapılır.
- İlerleme yalnızca kullanıcının tarayıcısında saklanıyor; Profil sayfasından dosyaya kaydedilip başka cihazda yüklenebiliyor, mevcut ilerlemeyle birleştiriliyor. Hesap yok, kişisel veri toplanmıyor. Yazı tipleri siteyle birlikte sunuluyor, üçüncü taraf sunucuya istek gitmiyor.
- İlk ziyaretten sonra service worker uygulama dosyalarını önbelleğe alır; internet yokken son kopya açılır, yeni sürümde eski önbellek silinir.
- Alıştırmalar ve vaka paketlerinin beklenen sonuçları otomatik bir denetim setiyle doğrulanıyor; vaka paketlerinde her sonuç ayrıca SQL ile bağımsız olarak hesaplanıyor. Paketlerin adımları gerçek Power BI Desktop'ta baştan sona denenmedi. Paketler için Desktop gerekir; Desktop yalnız Windows'ta çalışır.

## Kaynak kod ve yapım
- Bu dal (`main`) yayınlanan derlenmiş sitedir. Düzenlenebilir kaynak, derleme betikleri ve doğrulayıcılar [`kaynak` dalında](https://github.com/ysfdurak/kesit-powerbi/tree/kaynak); başlangıç noktası `NASIL.md`.
- **Yapay zekâ kullanımı:** Ürün kararlarını, hedef kitleyi ve kurguyu Yusuf Durak verdi; kod, DAX motoru ve içerik yapay zekâ (Claude) ile geliştirildi ve otomatik denetimlerden geçirildi. Bağımsız kullanıcı testi yapılmadı.
- **Açık kaynak bileşenler:** Bricolage Grotesque, IBM Plex Sans ve JetBrains Mono yazı tipleri (SIL Open Font License, lisans dosyaları `vendor/fonts` içinde). Başka üçüncü taraf kütüphane kullanılmıyor.

## Kardeş projeler
Aynı mantıkla hazırlanmış diğer eğitimler: **[Kesit SQL](https://ysfdurak.github.io/kesit-sql/)** ve **[Kesit Python](https://ysfdurak.github.io/kesit-python/)**. Beş vaka veri seti üç uygulamada satır satır aynıdır. Anadolu Market, Kesit SQL ile aynı şirket ve siparişleri kullanır; Power BI modeli zenginleştirildi.

## Geri bildirim
Hata ve önerileri bu deponun [Issues](https://github.com/ysfdurak/kesit-powerbi/issues) sayfasına yazabilirsin. Uygulamadaki “Sorun bildir” ve “Bu ders hakkında geri bildirim” düğmeleri ders adı dolu bir kayıt açar.

## Sorumluluk notu
Ücretsiz, ticari olmayan bir eğitim ve portföy projesidir; içerik “olduğu gibi” sunulur. Veri setlerindeki tüm şirketler, kişiler ve kayıtlar hayalidir. Microsoft ile bağlantılı değildir; Microsoft, Power BI, Fabric ve sınav adları Microsoft Corporation'ın markalarıdır. Sınav denemeleri özgün olarak yazılmıştır, gerçek sınav soruları değildir. Uygulamanın verdiği belgeler kendi beyana dayalıdır, Microsoft sertifikası değildir.

## Lisans
- Uygulama kodu: [MIT](LICENSE)
- Ders içerikleri, veri setleri ve vaka paketleri: [CC BY-NC 4.0](LICENSE-ICERIK.md)
