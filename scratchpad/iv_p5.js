
Object.assign(W.PBI_IV_TAKEHOME, {
  tedarik: {
    title: 'Ev ödevi: 2024 tedarikçi karnesi ve tedarik gecikmeleri',
    brief: 'Aynı perakende şirketinin satın alma ekibi için BI analisti adayısın. Satın alma müdürü yıllık tedarikçi değerlendirme toplantısına hazırlanıyor ve hangi tedarikçilerle sözleşme koşullarını yeniden konuşacağına karar vermek istiyor. Veri, bu uygulamanın örnek modelidir: `SatinAlmalar` (sipariş satırları; Adet, BirimFiyat, Tutar, TeslimGun, Zamaninda, Kusurlu), `Tedarikciler` (Ulke, SozGun: sözleşmedeki teslim süresi), `Urunler`, `Kategoriler` ve `Tarih`. Modeldeki `[Satın Alma Tutarı]`, `[Ortalama Tedarik Süresi]`, `[Tedarikte Zamanında %]` ve `[Kusur Oranı %]` ölçülerini kullanabilirsin. Müdür üç soruya cevap arıyor: Hangi tedarikçiler gecikiyor ve gecikmeler ne kadar uzun? Kalite sorunu hangi tedarikçilerde yoğunlaşıyor ve bize maliyeti ne? Yurt içi ve yurt dışı tedarik arasında belirgin bir fark var mı? Senden 5–7 yeni ölçü, tek sayfalık bir tedarikçi karnesi taslağı ve en fazla beş maddelik bir bulgu özeti bekleniyor. Süre: 4 saat. Puanlama formülünü ve ağırlıklarını kendin belirle ve gerekçesini yaz; mülakatta 10 dakikada sunacaksın.',
    tasks: [
      { t: 'Gecikme ölçüleri', detail: 'Geciken siparişlerin oranı ve geciken siparişlerde sözleşme süresinin ortalama kaç gün aşıldığı. Sözleşme süresi `Tedarikciler` tablosunda; satır düzeyinde `RELATED` gerekecek.' },
      { t: 'Tedarik süresi', detail: 'Basit ortalama tedarik süresinin yanında tutara göre ağırlıklandırılmış bir süre. İkisinin neden farklı çıktığını bir cümleyle açıkla.' },
      { t: 'Kalite ve maliyeti', detail: 'Kusurlu ürünlerin tutar karşılığı. Kusur oranını satır oranlarının ortalaması olarak değil, toplam kusurlu adedin toplam adede oranı olarak yorumla.' },
      { t: 'Tedarikçi puanı', detail: 'Zamanında teslim ve kalite oranlarını birleştiren 0–100 arası bir puan. Tedarikçi satırında anlamlı olmalı; satın alması olmayan satırlarda BLANK dönmeli.' },
      { t: 'Yurt içi payı', detail: 'Türkiye’deki tedarikçilerin satın alma tutarındaki payı. Ülke kırılımında Çin satırında %100’ün üzerinde bir değer görmemelisin.' },
      { t: 'Karne ve bulgular', detail: 'Tedarikçi başına tek satırlık bir karne tablosu (sıralı), bir dağılım grafiği (zamanında % ve kusur %) ve en fazla beş madde. Son madde hangi tedarikçiyle ne konuşulacağına dair somut bir öneri olmalı.' }
    ],
    rubric: [
      { c: 'Ölçülerin doğruluğu', w: 30, good: 'Ölçüler tedarikçi, ülke ve kategori kırılımında doğru çalışır; `RELATED` ve satır bağlamı doğru kullanılır; oranlar toplamlardan hesaplanır, BLANK durumları yönetilir.' },
      { c: 'Model ve bağlam anlayışı', w: 20, good: '`SatinAlmalar` ile `Satislar` arasında tedarikçi üzerinden bir ilişki olmadığını, ülke payında `KEEPFILTERS` gerektiğini ve tablo üretirken bağlam geçişinin nerede gerektiğini fark eder.' },
      { c: 'Puanlama yaklaşımı', w: 15, good: 'Puan formülü basit ve açıklanabilirdir; ağırlıklar iş gerekçesiyle savunulur; az siparişi olan tedarikçilerin puanının daha az güvenilir olduğu belirtilir.' },
      { c: 'Bulguların kalitesi', w: 20, good: 'Her bulgu bir sayı ve bir karşılaştırma içerir (geçen yıla, ortalamaya ya da sözleşmeye göre); gecikme oranı ile gecikme süresi ayrı yorumlanır; somut bir öneriyle biter.' },
      { c: 'Rapor tasarımı ve iletişim', w: 15, good: 'Karne tek bakışta okunur, renk yalnızca eşik aşımlarında kullanılır, varsayımlar (sözleşme süresi tanımı, puan ağırlıkları) yazılıdır ve sunum 10 dakikaya sığar.' }
    ],
    solution: {
      measures: [
        ['Geciken Sipariş Oranı %', 'DIVIDE(CALCULATE(COUNTROWS(SatinAlmalar), SatinAlmalar[Zamaninda] = "Hayır"), COUNTROWS(SatinAlmalar))'],
        ['Ortalama Aşım Günü', 'AVERAGEX(\n  FILTER(SatinAlmalar, SatinAlmalar[TeslimGun] > RELATED(Tedarikciler[SozGun])),\n  SatinAlmalar[TeslimGun] - RELATED(Tedarikciler[SozGun])\n)'],
        ['Tutar Ağırlıklı Tedarik Süresi', 'DIVIDE(SUMX(SatinAlmalar, SatinAlmalar[TeslimGun] * SatinAlmalar[Tutar]), [Satın Alma Tutarı])'],
        ['Kusurlu Ürün Tutarı', 'SUMX(SatinAlmalar, SatinAlmalar[Kusurlu] * SatinAlmalar[BirimFiyat])'],
        ['Tedarikçi Puanı', 'IF(\n  NOT ISBLANK([Satın Alma Tutarı]),\n  100 * (0.6 * [Tedarikte Zamanında %] + 0.4 * (1 - [Kusur Oranı %]))\n)'],
        ['Yerli Tedarik Payı %', 'DIVIDE(CALCULATE([Satın Alma Tutarı], KEEPFILTERS(Tedarikciler[Ulke] = "Türkiye")), [Satın Alma Tutarı])'],
        ['Satın Alma Büyümesi %', 'VAR GY = CALCULATE([Satın Alma Tutarı], SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN IF(NOT ISBLANK(GY), DIVIDE([Satın Alma Tutarı] - GY, GY))']
      ],
      story: '• Hacim: 2024’te 138 satın alma siparişiyle 478.455 ₺ alım yapıldı; 2023’e göre +%56,1.\n• Gecikme: Siparişlerin %28,3’ü sözleşme süresinden geç geldi (2023’te %27,5). En kötü Lumière Kozmetik (%47,1) ve Shenzhen Link Co. (%40,0), en iyi Anka Yayın Dağıtım (%10,7). Ancak gecikmeler kısa: geciken siparişlerde sözleşme süresi ortalama 1,3 gün aşılıyor. Sorun büyük gecikmeler değil, sık ve küçük gecikmeler.\n• Süre: Tutara göre ağırlıklı tedarik süresi 7,7 gün, basit ortalama 7,3 gün; pahalı siparişler daha uzun sürede geliyor. Shenzhen’de ortalama süre 19,8 gün, Lumière’de 14,1 gün.\n• Kalite: Toplam kusur oranı %3,8; Shenzhen’de %11,8, Atlas Spor’da %8,3. Kusurlu ürünlerin tutar karşılığı 21.950 ₺; en büyük kalemler Shenzhen (4.764 ₺) ve Marmara Ev Gereçleri (4.292 ₺).\n• Karne ve öneri: Puan (0,6 × zamanında + 0,4 × kalite) en yüksek Anka’da (93,0), en düşük Lumière (70,7) ve Shenzhen’de (71,3). Shenzhen hem gecikme hem kalitede zayıf ve alımların %9,4’ünü oluşturuyor; öncelikli görüşme konusu kabul kontrolü ve kusur iadesi koşulları olmalı. Lumière’de kalite iyi (%2,7) ama gecikme yüksek; sözleşme süresinin gerçekçi olup olmadığı birlikte gözden geçirilmeli. Yerli tedarik payı %78,3 (2023’te %80,0).'
    },
    pitfalls: [
      'Karne tablosunu `ADDCOLUMNS(VALUES(Tedarikciler[Tedarikci]), "N", COUNTROWS(SatinAlmalar))` ile kurmak: `COUNTROWS` bağlam geçişi olmadan çalıştığı için her tedarikçide 2024’ün toplamı (138) görünür. Ölçü ya da `CALCULATE(COUNTROWS(SatinAlmalar))` kullanılmalı.',
      'Yerli payı `KEEPFILTERS` olmadan yazmak: ülke kırılımında Türkiye filtresi Çin satırının filtresini ezer ve Çin satırında %836, Fransa satırında %636 gibi anlamsız oranlar çıkar.',
      'Tedarikçi kırılımında alımı `[Net Maliyet]` ile oranlamak: `Satislar` tedarikçiye bağlı olmadığı için payda her satırda şirket toplamıdır ve oran tedarikçi bazında anlamsızlaşır.',
      'Zamanında teslim oranını tedarikçi oranlarının basit ortalaması olarak sunmak: sekiz tedarikçinin ortalaması %70,6, sipariş bazında gerçek oran %71,7; az siparişi olan tedarikçi (Hediyelik Atölye, 4 sipariş) ortalamayı orantısız etkiler.',
      'Kusur oranını satır başına oranların ortalaması (`AVERAGEX(SatinAlmalar, DIVIDE(Kusurlu, Adet))`) olarak hesaplamak: 2024 için %4,2 çıkar, adet ağırlıklı doğru oran %3,8’dir.'
    ]
  },
  butce: {
    title: 'Ev ödevi: 2024 gider bütçesi sapma analizi',
    brief: 'Aynı şirketin finans ekibi (FP&A) için BI analisti adayısın. Finans direktörü 2025 bütçe görüşmelerinden önce 2024 giderlerinin bütçeye göre nasıl gerçekleştiğini ve faaliyet kârlılığının nasıl değiştiğini görmek istiyor. Veri, bu uygulamanın örnek modelidir: `Giderler` (ay, gider türü ve departman düzeyinde gerçekleşen gider), `GiderButce` (ay ve gider türü düzeyinde bütçe; departman sütunu yok), `GiderTurleri` (Grup ve sorumlu DepartmanNo), `Departmanlar`, `Tarih` ve satış tarafı için `Satislar`. Modeldeki `[Gider]`, `[Gider Bütçe]`, `[Gider Sapma %]`, `[Faaliyet Kârı]` ve `[Faaliyet Kâr Marjı %]` ölçülerini kullanabilirsin. Direktör üç soruya cevap arıyor: Bütçeyi aştık mı, aştıysak hangi gider türleri ve hangi aylar yüzünden? Hangi departmanlar kendi sorumlu oldukları bütçeyi aştı? Gider yapısı ve faaliyet kâr marjı geçen yıla göre nasıl değişti? Senden 5–7 yeni ölçü, tek sayfalık bir sapma raporu taslağı ve en fazla beş maddelik bir bulgu özeti bekleniyor. Süre: 4 saat. Bütçenin departmana nasıl bağlandığına dair varsayımını yazılı olarak belirt.',
    tasks: [
      { t: 'Bütçe sapması', detail: 'Yılbaşından bugüne gerçekleşen gider ile bütçe farkı ve dönem içinde bütçenin aşıldığı ay sayısı. Ay kırılımında da çalışmalı.' },
      { t: 'Departman bütçesi', detail: '`GiderButce` tablosunda departman yok. Her gider türünün sorumlu departmanını kullanarak departman kırılımında anlamlı bir bütçe ve sapma üret; ilişki eklemeden çöz.' },
      { t: 'Gider yapısı', detail: 'Her gider türünün toplam gider içindeki payı ve personel giderinin net satışa oranı.' },
      { t: 'Kârlılık değişimi', detail: 'Faaliyet kâr marjının geçen yıla göre kaç puan değiştiği. Yüzde değişim ile puan farkını karıştırma.' },
      { t: 'Sapma raporu taslağı', detail: 'Üstte gider, bütçe ve sapma kartları; ortada aylık gider ve bütçe (ya da kümülatif sapma) grafiği; altta gider türü ve departman sapma tablosu. Bir şelale grafiği kullanacaksan neyi gösterdiğini bir cümleyle açıkla.' },
      { t: 'Bulgu özeti ve öneri', detail: 'En fazla beş madde; her madde bir tutar, bir oran ve bir “bu yüzden” içermeli. Son madde 2025 bütçesi için somut bir öneri olmalı.' }
    ],
    rubric: [
      { c: 'Ölçülerin doğruluğu', w: 30, good: 'Ölçüler ay, gider türü ve departman kırılımında doğru çalışır; YTD ölçüleri ay düzeyinde birikir; oranlar ve puan farkları doğru hesaplanır.' },
      { c: 'Model ve ayrıntı düzeyi', w: 25, good: 'Bütçenin departman düzeyinde olmadığını fark eder, `TREATAS` ile sorumlu departmana bağlar, bunun bir varsayım olduğunu yazar ve gider türü kırılımında `[Faaliyet Kârı]`nın anlamsızlaştığını görür.' },
      { c: 'Bulguların kalitesi', w: 20, good: 'Sapmanın kaynağını tür, departman ve zaman boyutunda ayrıştırır; küçük toplam sapmanın içinde büyük bir kalem sapması olduğunu gösterir; somut bir öneriyle biter.' },
      { c: 'Rapor tasarımı', w: 10, good: 'Sapmalar işaretiyle tutarlı renklendirilir (aşım ve tasarruf ayrımı), eksenler ve birimler açıktır, sayfa yukarıdan aşağıya okunur.' },
      { c: 'Varsayımlar ve iletişim', w: 15, good: 'Departman bütçesi varsayımı, 2022’nin yarım yıl olması ve puan ile yüzde farkı yazılıdır; sunum 10 dakikaya sığar.' }
    ],
    solution: {
      measures: [
        ['Gider YTD Sapma', 'TOTALYTD([Gider], Tarih[Tarih]) - TOTALYTD([Gider Bütçe], Tarih[Tarih])'],
        ['Bütçe Aşan Ay', 'COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Gider] > [Gider Bütçe]))'],
        ['Sorumlu Departman Bütçesi', 'CALCULATE([Gider Bütçe], TREATAS(VALUES(Departmanlar[DepartmanNo]), GiderTurleri[DepartmanNo]))'],
        ['Departman Sapması', '[Gider] - CALCULATE([Gider Bütçe], TREATAS(VALUES(Departmanlar[DepartmanNo]), GiderTurleri[DepartmanNo]))'],
        ['Gider Türü Payı %', 'DIVIDE([Gider], CALCULATE([Gider], ALL(GiderTurleri)))'],
        ['Personel Gideri / Satış %', 'DIVIDE(CALCULATE([Gider], GiderTurleri[Grup] = "Personel"), [Net Satış])'],
        ['Faaliyet Marjı Değişimi (puan)', 'VAR GY = CALCULATE([Faaliyet Kâr Marjı %], SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN IF(NOT ISBLANK(GY), [Faaliyet Kâr Marjı %] - GY)']
      ],
      story: '• Toplam: 2024 gideri 171.559 ₺ ile bütçeyi (169.027 ₺) 2.532 ₺ (%1,5) aştı; 2023’te aşım %2,8 idi. Toplam sapma küçük görünse de tek bir kalemde yoğunlaşıyor.\n• Gider türü: Aşımın tamamından fazlası Pazarlama ve reklamdan geliyor (+3.906 ₺, +%8,8). Diğer türler bütçede ya da altında: Personel −795 ₺ (−%1,0), Genel yönetim −476 ₺ (−%5,3), Teknoloji −129 ₺ (−%1,3), Lojistik +26 ₺, Kira tam bütçede.\n• Zamanlama: 12 ayın 7’sinde bütçe aşıldı. Kümülatif sapma Eylül sonunda 628 ₺ iken yıl sonunda 2.532 ₺’ye çıktı; aşımın büyük kısmı Kasım (+745 ₺) ve Aralık’ta (+1.415 ₺) oluştu.\n• Departman (gider türünün sorumlu departmanına göre): Pazarlama +3.906 ₺ aştı; Satış −769 ₺, Genel Müdürlük −476 ₺, Yazılım −129 ₺ bütçenin altında kaldı.\n• Kârlılık ve öneri: Giderin net satışa oranı %30,4’ten %23,0’a indi; faaliyet kâr marjı %1,5’ten %15,7’ye çıktı (+14,2 puan). Personel gideri / satış %13,7’den %10,4’e geriledi. 2025 için pazarlama bütçesi kampanya takvimine göre aylara dağıtılmalı ve Ç4 harcamaları ayrı bir onay eşiğine bağlanmalı; aksi hâlde yıl sonu aşımı tekrarlanır.'
    },
    pitfalls: [
      'Departman kırılımında `[Gider Bütçe]`yi doğrudan kullanmak: `GiderButce` departmana bağlı olmadığı için her departman satırında toplam bütçe (169.027 ₺) görünür ve tüm departmanlar bütçenin çok altında görünür.',
      '`[Faaliyet Kârı]`nı gider türü kırılımında göstermek: brüt kâr gider türüne göre filtrelenmez, her satırda tüm brüt kârdan yalnızca o türün gideri düşülür ve 211.059 ₺ ile 282.746 ₺ arasında anlamsız değerler çıkar.',
      'Faaliyet kârındaki değişimi yüzde olarak sunmak: 2023’ün faaliyet kârı çok küçük (5.941 ₺) olduğu için değişim %1.870 gibi bir sayı verir; marjın puan farkı (+14,2 puan) çok daha anlamlıdır.',
      'Aylık `[Gider Sapma %]` değerlerinin ortalamasını yıllık sapma diye sunmak: aylar eşit ağırlık alır; yıllık sapma toplamlardan hesaplanmalıdır (%1,5).',
      'Departman bütçesi için `GiderTurleri` ile `Departmanlar` arasında fiziksel ilişki kurmak: `Giderler` zaten `Departmanlar`a bağlı olduğu için model iki yollu ve belirsiz hâle gelir; `TREATAS` filtreyi yalnızca ölçü içinde aktarır.'
    ]
  },
  destek: {
    title: 'Ev ödevi: Müşteri hizmetleri yük ve memnuniyet değerlendirmesi',
    brief: 'Aynı şirketin müşteri hizmetleri birimi için BI analisti adayısın. Birim müdürü 2025’te ek personel ve kanal yatırımı talep etmeden önce 2024’ün tablosunu görmek istiyor. Veri, bu uygulamanın örnek modelidir: `Talepler` (Tarih, MusteriNo, Kanal, Konu, Oncelik, IlkYanitDk, CozumSaat, Cozuldu, Memnuniyet 1–5; anket her talepte doldurulmamış), `Musteriler` (Segment), `Tarih` ve sipariş tarafı için `Satislar`. Modeldeki `[Talep Sayısı]`, `[Çözüm Oranı %]`, `[Ortalama İlk Yanıt (dk)]`, `[Ortalama Çözüm (saat)]`, `[CSAT %]` ve `[SLA Uyum %]` (ilk yanıt 60 dakika içinde) ölçülerini kullanabilirsin. Müdür üç soruya cevap arıyor: Talep yükü satışlarla orantılı mı artıyor? Hangi kanal ve konular SLA’yı ve memnuniyeti aşağı çekiyor? Teslimatla ilgili talepler toplam yükün ne kadarı? Senden 5–7 yeni ölçü, tek sayfalık bir operasyon raporu taslağı ve en fazla beş maddelik bir bulgu özeti bekleniyor. Süre: 4 saat. Memnuniyet anketine yanıt vermeyen talepleri nasıl ele aldığını yaz.',
    tasks: [
      { t: 'Yük ve orantı', detail: 'Sipariş başına talep sayısı ve çözülmeyen talep sayısı. Geçen yılla karşılaştır; talep artışını sipariş artışıyla birlikte yorumla.' },
      { t: 'Anket kapsamı', detail: 'Memnuniyet anketinin doldurulma oranı. CSAT yorumunu bu oranla birlikte ver; boş anketleri 0 ya da düşük puan sayma.' },
      { t: 'Konu kırılımı', detail: 'Kargo gecikmesi ve hasarlı ürün taleplerinin toplam içindeki payı. Konu kırılımında da anlamlı sonuç vermeli; diğer konularda %100 görmemelisin.' },
      { t: 'Öncelik ve hız', detail: 'Yüksek öncelikli taleplerin SLA uyumu ve çözüm süresinin medyanı. Ortalama ile medyanın neden farklı çıktığını bir cümleyle açıkla.' },
      { t: 'Operasyon raporu taslağı', detail: 'Üstte yük, hız ve memnuniyet kartları; ortada kanal bazında SLA ve CSAT karşılaştırması; altta konu bazında hacim ve çözüm süresi. Görsel seçimini bir cümleyle gerekçelendir.' },
      { t: 'Bulgu özeti ve öneri', detail: 'En fazla beş madde; her madde bir sayı, bir karşılaştırma ve bir “bu yüzden” içermeli. Son madde yatırım talebine dair somut bir öneri olmalı.' }
    ],
    rubric: [
      { c: 'Ölçülerin doğruluğu', w: 30, good: 'Ölçüler kanal, konu, öncelik ve segment kırılımında doğru çalışır; CSAT paydası yanıtlanmış anketlerdir; `KEEPFILTERS` gereken yerde kullanılır.' },
      { c: 'Model ve bağlam anlayışı', w: 15, good: '`Talepler`in `Satislar` ile yalnızca `Musteriler` ve `Tarih` üzerinden bağlı olduğunu, ürün ya da kategori kırılımında talep ölçülerinin değişmediğini fark eder.' },
      { c: 'İstatistiksel yorum', w: 20, good: 'Ortalama ile medyanı ayırt eder, anket yanıt oranını yoruma katar, az talep olan kırılımlarda (ör. sosyal medya, hasarlı ürün) oranların oynak olduğunu belirtir.' },
      { c: 'Bulguların kalitesi', w: 20, good: 'SLA sorununun kanala özgü olduğunu sayıyla gösterir, yükü siparişle oranlar ve personel talebini veriye bağlayan somut bir öneri sunar.' },
      { c: 'Rapor tasarımı ve iletişim', w: 15, good: 'Kanal karşılaştırması tek bakışta okunur, SLA eşiği görselde çizgi olarak durur, varsayımlar yazılıdır ve sunum 10 dakikaya sığar.' }
    ],
    solution: {
      measures: [
        ['Talep / Sipariş Oranı', 'DIVIDE([Talep Sayısı], [Sipariş Sayısı])'],
        ['Çözülmeyen Talep', 'CALCULATE([Talep Sayısı], Talepler[Cozuldu] = "Hayır")'],
        ['Anket Yanıt Oranı %', 'DIVIDE(COUNT(Talepler[Memnuniyet]), [Talep Sayısı])'],
        ['Teslimat Kaynaklı Talep %', 'DIVIDE(\n  CALCULATE([Talep Sayısı], KEEPFILTERS(Talepler[Konu] IN {"Kargo gecikmesi", "Hasarlı ürün"})),\n  [Talep Sayısı]\n)'],
        ['Yüksek Öncelik SLA %', 'CALCULATE([SLA Uyum %], KEEPFILTERS(Talepler[Oncelik] = "Yüksek"))'],
        ['Medyan Çözüm (saat)', 'MEDIAN(Talepler[CozumSaat])'],
        ['Talep Açan Müşteri %', 'DIVIDE(DISTINCTCOUNT(Talepler[MusteriNo]), COUNTROWS(Musteriler))']
      ],
      story: '• Yük: 2024’te 165 talep geldi (2023’te 105, +%57,1). Sipariş başına talep 0,37’den 0,33’e indi; yani talepler siparişlerden daha yavaş arttı. Kayıtlı 150 müşterinin 82’si (%54,7) en az bir talep açtı. Çözülmeyen talep 11 (2023’te 6); çözüm oranı %93,3.\n• Hız ve SLA: Ortalama ilk yanıt 97,5 dakikadan 67,2 dakikaya indi, SLA uyumu %61,0’dan %65,5’e çıktı. Ama sorun kanala özgü: telefon ve canlı destekte SLA %100, e-postada %4,2 (ortalama ilk yanıt 184,6 dk), sosyal medyada %31,3. Yüksek öncelikli taleplerde SLA %72,7.\n• Çözüm süresi: Ortalama 22,0 saat, medyan 14,4 saat; birkaç uzun talep ortalamayı yukarı çekiyor. En uzun konu İade ve değişim (ortalama 44,0 saat); aynı zamanda en kalabalık konu (46 talep) ve CSAT’ı en düşük konu (%64,3).\n• Memnuniyet ve teslimat: CSAT %68,9’dan %75,8’e çıktı; anket yanıt oranı %60,0. Kurumsal segmentte CSAT %65,4 ile en düşük. Kargo gecikmesi ve hasarlı ürün talepleri yükün %28,5’i (2023’te %34,3).\n• Öneri: Genel ek personelden önce e-posta kanalı için bir ilk yanıt hedefi ve otomatik ilk yanıt kurulmalı; SLA açığının neredeyse tamamı buradan geliyor. İade ve değişim süreci ayrı bir iyileştirme konusu olarak ele alınmalı; Kurumsal müşteriler için ayrıca bir memnuniyet incelemesi yapılmalı.'
    },
    pitfalls: [
      'CSAT paydasında tüm talepleri kullanmak (`COUNTROWS(Talepler)`): anketi doldurulmamış talepler memnuniyetsiz sayılır ve 2024 CSAT’ı %75,8 yerine %45,5 çıkar.',
      'SLA’yı ortalama ilk yanıta bakarak yorumlamak: toplam ortalama (67,2 dk) eşiğe yakın görünür, ama telefonda ortalama 5,5 dakika, e-postada 184,6 dakikadır; sorun dağılımda, ortalamada değil.',
      'Konu payını `KEEPFILTERS` olmadan yazmak: konu kırılımında “Ödeme” gibi bir satırda filtre ezilir ve teslimat taleplerinin sayısı o konunun talebine bölünür.',
      'Talep ölçülerini ürün ya da kategori kırılımında göstermek: `Talepler` ürüne bağlı olmadığı için her satırda aynı değer görünür; ürün düzeyinde analiz için talep konusunu ve müşteri bağlantısını kullanmak gerekir.',
      'Power Query’de boş memnuniyet değerlerini 0 ile doldurmak: ortalama memnuniyet puanı ve CSAT anlamsız biçimde düşer; boş değer “yanıt yok” anlamında kalmalıdır.'
    ]
  }
});

/* ---------------- Canlı kodlama görevleri ---------------- */
(function () {
  const G = (t, c) => ({ t, c });
  const KAT = G('Kategoriler', 'Kategori'), YIL = G('Tarih', 'Yil'), AY = G('Tarih', 'YilAy'), CEYREK = G('Tarih', 'YilCeyrek'), SEG = G('Musteriler', 'Segment'), KANAL = G('Satislar', 'Kanal');
  const TED = G('Tedarikciler', 'Tedarikci'), TKANAL = G('Talepler', 'Kanal'), DEP = G('Departmanlar', 'Departman'), GTUR = G('GiderTurleri', 'GiderTuru');
  const d = (id, L, name, q, sol, o) => Object.assign({ id, L, t: 'dax', name, q, sol }, o || {});
  W.PBI_INTERVIEW.push(
    d('m-9', 'A', 'Geciken Satın Alma', '<b>Geciken Satın Alma</b>: zamanında teslim edilmeyen (<code>Zamaninda = "Hayır"</code>) satın alma siparişi satırlarının sayısı.', 'CALCULATE(COUNTROWS(SatinAlmalar), SatinAlmalar[Zamaninda] = "Hayır")', { grid: [TED, YIL, KAT], follow: 'Takip: Bu sayıyı tedarikçiler arasında karşılaştırmak neden yanıltıcı olabilir? (Cevap: sipariş hacimleri farklı; oran olarak, yani toplam siparişe bölerek karşılaştırmak gerekir.)' }),
    d('m-10', 'A', 'Yüksek Öncelikli Talep', '<b>Yüksek Öncelikli Talep</b>: önceliği "Yüksek" olan müşteri hizmetleri talebi sayısı. Hazır <code>[Talep Sayısı]</code> ölçüsünü kullan.', 'CALCULATE([Talep Sayısı], Talepler[Oncelik] = "Yüksek")', { grid: [YIL, TKANAL], follow: 'Takip: Bu ölçüyü bir öncelik dilimleyicisiyle birlikte kullanınca “Düşük” seçildiğinde ne görünür ve bunu nasıl değiştirirsin? (Cevap: filtre ezildiği için yine yüksek öncelikli talepler görünür; KEEPFILTERS ile seçim korunur ve sonuç boş olur.)' }),
    d('m-11', 'B', 'Bütçeyi Aşan Gider Türü', '<b>Bütçeyi Aşan Gider Türü</b>: görünen dönemde gideri (<code>[Gider]</code>) bütçesinden (<code>[Gider Bütçe]</code>) büyük olan gider türü sayısı.', 'COUNTROWS(FILTER(VALUES(GiderTurleri[GiderTuru]), [Gider] > [Gider Bütçe]))', { grid: [YIL, CEYREK], follow: 'Takip: Yıl satırındaki sayı neden çeyrek satırlarındaki sayıların toplamı değildir? (Cevap: her bağlamda türler o dönemin toplamına göre yeniden değerlendirilir; bir tür bir çeyrekte aşıp diğerinde altında kalabilir.)' }),
    d('m-12', 'B', 'Sözleşmeye Göre Teslim Farkı', '<b>Sözleşmeye Göre Teslim Farkı</b>: satın alma satırlarında gerçekleşen teslim gününün (<code>TeslimGun</code>) tedarikçinin sözleşme gününden (<code>Tedarikciler[SozGun]</code>) farkının ortalaması. Negatif değer erken teslim demektir.', 'AVERAGEX(SatinAlmalar, SatinAlmalar[TeslimGun] - RELATED(Tedarikciler[SozGun]))', { grid: [TED, YIL], follow: 'Takip: Ortalama negatif çıkmasına rağmen siparişlerin dörtte birinden fazlası geç. Bu nasıl mümkün ve hangi ölçüyü yanına koyarsın? (Cevap: erken teslimler geç teslimleri dengeler; geciken sipariş oranı ve yalnızca gecikenlerdeki ortalama aşım ayrıca gösterilmeli.)' }),
    d('m-13', 'B', 'Premium Segment Payı %', '<b>Premium Segment Payı %</b>: Premium segmentindeki müşterilerin net satışının görünen net satışa oranı. Segment kırılımında Premium satırı %100, diğer segmentler boş olmalı.', 'DIVIDE(CALCULATE([Net Satış], KEEPFILTERS(Musteriler[Segment] = "Premium")), [Net Satış])', { grid: [SEG, YIL, KANAL], follow: 'Takip: KEEPFILTERS olmadan Bireysel satırında ne görürdün? (Cevap: segment filtresi ezilir; Premium satışı Bireysel satışına bölünür ve anlamsız bir oran çıkar.)' }),
    d('m-14', 'B', 'Teslim Tarihine Göre Sipariş', '<b>Teslim Tarihine Göre Sipariş</b>: <code>[Sipariş Sayısı]</code>nı sipariş tarihine göre değil, teslim tarihine (<code>Satislar[TeslimTarihi]</code>, ilişkisi pasif) göre say.', 'CALCULATE([Sipariş Sayısı], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))', { grid: [AY], noTotal: true, follow: 'Takip: Henüz teslim edilmemiş (Kargoda) siparişler bu ölçüde nerede görünür? (Cevap: TeslimTarihi boş olduğu için hiçbir ay satırına düşmez ama tarih filtresi olmayan toplamda sayılır; bu modelde 838 siparişin 6’sı böyledir, ayların toplamı 832 kalır. Bunu raporda ayrıca göstermek gerekir.)' }),
    d('m-15', 'B', 'Kalan Yıllık Gider Bütçesi', '<b>Kalan Yıllık Gider Bütçesi</b>: içinde bulunulan yılın tüm yıllık gider bütçesinden, yılbaşından görünen dönemin sonuna kadar gerçekleşen gideri çıkar.', 'CALCULATE([Gider Bütçe], ALL(Tarih), VALUES(Tarih[Yil])) - TOTALYTD([Gider], Tarih[Tarih])', { grid: [AY], noTotal: true, follow: 'Takip: Birden çok yıl seçili olduğunda (ör. toplam satırı) bu ölçü neden anlamını yitirir ve ne döndürmesini istersin? (Cevap: yıllık bütçe tüm yılların toplamı olur, YTD ise yalnızca son yılı biriktirir; HASONEVALUE(Tarih[Yil]) ile tek yıl yoksa BLANK döndürmek daha doğrudur.)' }),
    d('m-16', 'C', 'Departman Bütçe Sapması', '<b>Departman Bütçe Sapması</b>: departmanın gideri ile sorumlu olduğu gider türlerinin bütçesi arasındaki fark. <code>GiderButce</code>’de departman yok; bütçeyi <code>GiderTurleri[DepartmanNo]</code> üzerinden departmana bağla (ilişki eklemeden).', 'VAR Butce = CALCULATE([Gider Bütçe], TREATAS(VALUES(Departmanlar[DepartmanNo]), GiderTurleri[DepartmanNo]))\nRETURN [Gider] - Butce', { grid: [DEP, YIL, GTUR], follow: 'Takip: Bir gider türünün bütçesi iki departman arasında %70–%30 paylaştırılsaydı modeli nasıl değiştirirdin? (Cevap: tür × departman × pay oranı içeren bir paylaştırma tablosu ve bütçeyi bu oranla çarpan SUMX tabanlı bir ölçü.)' }),
    d('m-17', 'C', 'Tedarikçi Karnesi Puanı', '<b>Tedarikçi Karnesi Puanı</b>: her tedarikçi için 0,6 × <code>[Tedarikte Zamanında %]</code> + 0,4 × (1 − <code>[Kusur Oranı %]</code>) puanı; toplam satırında bu puanların tedarikçiler arasındaki basit ortalaması görünmeli.', 'AVERAGEX(VALUES(Tedarikciler[Tedarikci]), 0.6 * [Tedarikte Zamanında %] + 0.4 * (1 - [Kusur Oranı %]))', { grid: [TED, YIL], follow: 'Takip: Toplamda basit ortalama yerine sipariş ağırlıklı bir puan istenirse ne değişir? (Cevap: puanı doğrudan toplam oranlardan hesaplamak ya da AVERAGEX yerine sipariş sayısıyla ağırlıklandırılmış SUMX / toplam sipariş kullanmak.)' }),
    d('m-18', 'C', 'Alıcıların Talep Sayısı', '<b>Alıcıların Talep Sayısı</b>: görünen bağlamda (iptal olmayan) alışveriş yapmış müşterilerin açtığı müşteri hizmetleri talebi sayısı. Kategori kırılımında, o kategoriden alışveriş yapan müşterilerin talepleri sayılmalı.', 'VAR Alicilar = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")\nRETURN CALCULATE([Talep Sayısı], TREATAS(Alicilar, Musteriler[MusteriNo]))', { grid: [YIL, SEG, KAT], follow: 'Takip: Neden `CALCULATE([Talep Sayısı], Alicilar)` yazmak kategori kırılımında işe yaramaz? (Cevap: Alicilar Satislar[MusteriNo] sütununa ait; filtre Satislar’ı keser ama ilişki yönü yüzünden Musteriler’e ve Talepler’e ulaşmaz. TREATAS ile müşteri boyutuna aktarmak gerekir.)' }),
    d('m-19', 'C', 'Hareketli 12 Ay Gider Oranı %', '<b>Hareketli 12 Ay Gider Oranı %</b>: görünen dönemin sonundan geriye 12 aylık giderin, aynı 12 aydaki net satışa oranı.', 'VAR Donem = DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -12, MONTH)\nRETURN DIVIDE(CALCULATE([Gider], Donem), CALCULATE([Net Satış], Donem))', { grid: [AY], noTotal: true, follow: 'Takip: Verinin ilk 11 ayında bu oran neden yüksek ve oynak çıkar, raporda nasıl ele alırsın? (Cevap: 12 aylık pencere dolmamıştır ve ilk aylarda satış düşüktür; pencerede 12 ay veri yoksa BLANK döndürmek ya da bunu açıkça işaretlemek gerekir.)' }),
    { id: 'm-20', L: 'C', t: 'query', start: 'EVALUATE\n', q: '<b>Tedarikçi karnesi sorgusu</b>: 2024 yılı için her tedarikçinin adını, <code>"Zamanında %"</code> (<code>[Tedarikte Zamanında %]</code>), <code>"Kusur %"</code> (<code>[Kusur Oranı %]</code>) ve <code>"Sipariş"</code> (satın alma satırı sayısı) sütunlarıyla döndür; zamanında oranına göre azalan sırala.', sol: 'EVALUATE\nCALCULATETABLE(\n  ADDCOLUMNS(VALUES(Tedarikciler[Tedarikci]), "Zamanında %", [Tedarikte Zamanında %], "Kusur %", [Kusur Oranı %], "Sipariş", CALCULATE(COUNTROWS(SatinAlmalar))),\n  Tarih[Yil] = 2024\n)\nORDER BY [Zamanında %] DESC', follow: 'Takip: "Sipariş" sütununda CALCULATE’i kaldırırsan ne görürsün? (Cevap: bağlam geçişi olmadığı için her tedarikçide 2024’ün toplam satır sayısı, 138, görünür.)' }
  );
})();
})(window);
