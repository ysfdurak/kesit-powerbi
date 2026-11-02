import sys
p='/home/claude/pbi/x_ileri2.js'; s=open(p).read()
R=[
("`Satılan adet için açık bir ölçü yazar, yazara onu kullandırırım`","`Açık bir adet ölçüsü yazıp onu kullandırırım`"),
("`Grupta çoklu seçim ifadesi tanımlayıp BLANK ve uyarı biçimi döndürmek`","`Çoklu seçim ifadesi tanımlayıp BLANK ve uyarı döndürmek`"),
("`Kartları tek çok değerli karta toplar, dilimleyicileri azaltırım`","`Görsel sayısını azaltır, kartları birleştiririm`"),
("`Görsellerde otomatik Yıl/Ay hiyerarşisinin kullanılıp kullanılmadığını`","`Otomatik Yıl/Ay hiyerarşisini kullanan görselleri`"),
("`Bütün tarih sütunlarının metne çevrildiğini`","`Bütün tarih sütunlarının metne çevrilmiş olduğunu`"),
("`Tarih tablosunun 1900'den başladığını`","`Tarih tablosunun 1900 yılından başlayıp başlamadığını`"),
("`FILTER(olgu tablosu) materyalizasyonu; sütun filtresine geçmek`","`Materyalizasyon; FILTER(olgu) yerine sütun filtresi`"),
("`İki CALCULATE toplamına bölerim: indirimli × 0,9 + indirimsiz`","`İki ayrı CALCULATE toplamına bölerim`"),
("`Görünümün mantığını Delta tablosuna ya da somut görünüme taşımak`","`Görünümü bir Delta tablosuna dönüştürmek`"),
("`Görünümü Dual moda almak`","`Görünüm tablosunu Dual depolama moduna almak`"),
("`Sınır aşıldı; geri dönüş yok, Delta'yı iyileştir ya da SKU'yu büyüt`","`Sınır aşıldı; Delta'yı iyileştir ya da SKU büyüt`"),
("`Çerçeveleme bozuldu; modeli yeniden yayımla`","`Çerçeveleme bozuldu; modeli yeniden yayımlamak gerekir`"),
("`Kaynak modelde Derleme izni ve kiracıda anlam modellerine DirectQuery izni`","`Derleme izni ve kiracıda DirectQuery izni`"),
("`Farklı kaynak grupları arasındaki ilişki sınırlı ilişki olmuş`","`İlişki sınırlı (limited) ilişkiye dönmüş`"),
("`İki koşulu tek bir rolde birleştirip Ece'yi yalnızca ona eklerim`","`İki koşulu tek bir rolde birleştiririm`"),
("`RLS, ALL içeren paydada da geçerli; pay Ece'nin satışları içinde`","`RLS paydada da geçerli; pay Ece'nin satışı içinde`"),
("`Kullanıcıyı Görüntüleyici yapar ya da uygulama ile erişim veririm`","`Görüntüleyici yapar ya da uygulamadan erişim veririm`"),
("`İhtiyacı sorgulamak; gerçekten gerekiyorsa PPU ya da kapasiteye geçmek`","`İhtiyacı doğrulayıp gerekirse PPU'ya geçmek`"),
("`Müşteriler için yerleştirme, hizmet sorumlusu ve belirteçte etkin kimlik`","`Müşteriler için yerleştirme ve belirteçte etkin kimlik`"),
("`Veri .csv olarak dışa aktarılmış; .csv etiketi taşımaz`","`Veri .csv olarak aktarılmış`"),
("`Davranışı düzeltmeyi ya da açıklamada belgelemeyi şart koşmak`","`Düzeltme ya da belgeleme şartı koymak`"),
("`Günlük olayları her gece çekip kendi depoda biriktirmek`","`Olayları her gece kendi depoda biriktirmek`"),
("`Soy görünümünde etki analizi açıp sahiplere bildirmek`","`Etki analizine bakıp sahiplere bildirmek`"),
("`Eski adla yeni bir hesaplanmış sütun eklemek`","`Eski adla yeni bir hesaplanmış sütun daha eklemek`"),
("`Tasarlayıp Çalışma alanım'a yayımlayabilir; ekip alanına Pro/PPU ister`","`Çalışma alanım'a evet; ekip alanına Pro/PPU gerekir`"),
("`İki değer sorguya tek metin olarak geliyor; eşitlik karşılaştırması tutmuyor`","`Değerler tek metin olarak geliyor; eşitlik tutmuyor`"),
("`Parametrenin varsayılan değeri boş bırakılmış`","`Parametrenin varsayılan değeri boş bırakılmış olduğu için`"),
("`Ay parametresinin varsayılanını “önceki ay” ifadesiyle hesaplamak`","`Varsayılanı “önceki ay” ifadesiyle hesaplamak`"),
("`Her geliştiricinin özellik dalında çalışıp çekme isteğiyle birleştirmesi`","`Özellik dalları ve çekme isteğiyle çalışmak`"),
("`Dosyayı çıkarıp .gitignore'un önbelleği dışladığından emin olurum`","`Çıkarır, .gitignore'u düzeltirim`"),
("`Commit'i geri alıp Dev'i güncellemek, Test ve Üretim'e dağıtmak`","`Revert, Dev'i güncelle, işlem hattıyla dağıt`"),
("`Kuralı tut; DIVIDE ile düzelt, boş hücre ve gizli hata farkını test et`","`Kuralı tutup DIVIDE ile düzeltmek, kenarı test etmek`"),
("`Burada _ hücrenin değeridir; [Şehir] alanı yok, Text.Proper(_) yazılmalı`","`_ hücre değeridir; Text.Proper(_) yazılmalı`"),
("`try sonucunu kayıt olarak tutup HasError ve Error[Message] alanlarını sütunlara açarım`","`try kaydını tutup Error[Message]'ı sütuna açarım`"),
]
for a,b in R:
    c=s.count(a)
    if c!=1: print('COUNT',c,a); sys.exit(1)
    s=s.replace(a,b)
open(p,'w').write(s)
