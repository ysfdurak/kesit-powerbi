# Dashboard araştırması (Anadolu Market için özellik envanteri)

Not: Yalnızca özellik/konu listesi; hiçbir tasarım ya da metin kopyalanmamıştır. (D) = Learn veya kaynak sayfasında doğrulandı, (G) = genel bilgi / topluluk pratiği, sayfa açılamadı.

## Microsoft örnek raporları

Kaynak: https://learn.microsoft.com/power-bi/create-reports/sample-datasets (18 örnek + 2026 "Samples Revamp", GitHub: microsoft/powerbi-desktop-samples)

- **Sales & Returns** (perakende satış ve iade, 5 sayfa + gizli sayfalar) → intro/hikâye sayfası, nokta navigasyonu, bookmark ile tablo/harita görünüm değiştirme butonları, report-page tooltip, Q&A görseli, Key Influencers ve Decomposition Tree'ye açılan butonlar, "Find where this distribution is different", drillthrough (Return Rate, Market Basket), what-if parametresi slicer'ı, forecast, AppSource özel görselleri (Mapbox, cluster map), Power Apps görseli, telefon düzeni, başlıkta "?" yardım tooltip'leri (D)
- **Store Sales** (perakende mağaza TY vs LY) → kartlar, zincire göre pasta grafikle çapraz filtreleme, kabarcık harita, haritadan drillthrough ("New Stores"), combo (çizgi+sütun) grafik, scatter, "Analyze > Explain the decrease"; 2026 sürümü: modern tema, büyük tuval, mobil optimize düzen (D)
- **Retail Analysis** (perakende: satış, stok, yeni mağaza) → dashboard kutucuklarından rapora geçiş, District Manager slicer'ı, bubble/scatter varyans grafikleri, m² başına satış, Q&A (D)
- **Corporate Spend / IT Spend** (finans: plan vs gerçekleşen) → bölge slicer'ı, decomposition tree (High/Low value AI split), plan varyans tablosu/grafiği, gizli tooltip sayfası; 2026: koşullu biçimlendirme, button slicer, kart referans etiketleri, field parameters (D)
- **IT Spend Analysis** (IT maliyet merkezi, bütçe/chargeback) → plan-gerçekleşen varyans sayfaları (D, kısa)
- **Customer Profitability** (finans/müşteri kârlılığı) → yönetici scorecard'ı, Executive slicer'ı, bütçeye göre gelir % varyansı, bölge treemap'i ile sayfa filtreleme, sektör marj bubble grafiği, sayfa seviyesi filtreler, mobil için özel sayfa boyutu (D)
- **Human Resources** (İK: işe alım, aktif çalışan, ayrılma, "kötü işe alım") → YoY combo grafikler, yaş grubuna göre waterfall, cinsiyet donut/pasta, bölge slicer'ı, çapraz filtreleme, Q&A (D)
- **Employee Hiring and History** (İK zaman serisi, kıdem) → 2026: özel tooltip metni, çizgi/işaretçi stilleri, koşullu biçimlendirme (D)
- **Opportunity Analysis** (satış fırsatları, kazanma oranı) → satışçı etkinliği, win-rate analizi (D, kısa)
- **Revenue Opportunities** (satış hunisi/pipeline, tahmin) → 2026: Shape Map, report-page tooltip, combo grafik (D)
- **Sales and Marketing** (kampanya → pipeline/dönüşüm) → satış+pazarlama verisi birleşimi (D, kısa)
- **Competitive Marketing Analysis** (pazar payı, rakip, duygu) → Executive Overview, drillthrough "Detailed Info" sayfası (sadece drillthrough ile erişilir), tam sayfa tooltip, "Show as table", "Find where this distribution is different"; 2026: yeni kart, donut merkez değeri, yumuşak çizgiler, Azure Maps, koşullu biçimlendirme (D)
- **Regional Sales** (bölgesel satış, çok sayfa) → navigasyon çubuğu/butonları, gizli sayfalar (tek giriş noktası), Insights menüsünde Key Influencers / Decomposition / Q&A sayfaları, drill-down; 2026: Shape Map, kart, sayfa navigasyonu (D)
- **Procurement Analysis** (satın alma/tedarikçi harcaması) → kategori çizgi grafiği, ülke haritası, tier'a göre bar, şehir treemap'i, fatura+indirim % combo, drill-down, çapraz vurgulama (D)
- **Supplier Quality Analysis** (tedarikçi kalite, kusur, duruş süresi) → malzeme tipine göre combo, tesis haritası, satıcı alan/treemap, bubble (tesis × kusur tipi), Q&A sorguları (D)
- **Artificial Intelligence** (AI görselleri, 3 sayfa) → Key Influencers, Decomposition Tree (AI split), small multiples, Smart Narrative, Explain the decrease, anomali tespiti (çizgi grafikte), "Son 90 gün" butonu, Q&A (D)
- **AdventureWorks Sales** (2026 revamp, satış) → koyu tema, donut merkez değeri, seri etiketleri (series labels), Azure Maps, tarih seçici (date picker) (D)
- **COVID-19 US** (kamu sağlığı, .pbit şablon) → zaman serileri, haritalar (D)
- **Financial Excel Workbook** (finans, yalnızca .xlsx) → finansal tablo/KPI örnek verisi (D)
- **Health and Safety** → Microsoft'un güncel örnek listesinde YOK (iş sağlığı/güvenliği dashboard'u, galeri/şablon dünyasından bir tür olarak ele alınmalı)

## Galeri ve şablonlarda dashboard türleri

Kaynak kısaltmaları: MS = Microsoft örnekleri, DSG = Power BI Data Stories Gallery (topluluk), MV = Maven Analytics (challenge/showcase), EDNA = Enterprise DNA challenge'ları, ZB = Zebra BI, IR = Inforiver galerisi, MET = Metricalist, NUM = Numerro, NOVY = NovyPro, DQ = Dataquest proje listesi, MAM = Mammoth şablon kategorileri.

- **Yönetici (Executive) özeti / KPI genel bakış** → MS (Competitive Marketing, Customer Profitability), MV (Northwind), ZB (CFO), MAM, DSG, NUM (G), MET (G)
- **Satış performansı (bölge, ürün, satışçı, TY vs LY)** → MS (Store Sales, Regional Sales, AdventureWorks), ZB, IR, MV (Maven Toys, Maven Market), DSG, MAM
- **Satış hunisi / pipeline / fırsat, tahmin** → MS (Opportunity, Revenue Opportunities), IR (lead pipeline, çok kanallı huni), DQ (satış tahmini)
- **İade analizi / sepet (market basket)** → MS (Sales & Returns)
- **Perakende mağaza (m² başına satış, yeni vs mevcut mağaza, zincir)** → MS (Retail Analysis, Store Sales), MV (Maven Market, Maven Toys)
- **Finans: Gelir tablosu (P&L)** → ZB, IR (karşılaştırmalı P&L, global gelir tablosu), MET (Modern Finance), DSG (Financial Performance)
- **Finans: Bilanço** → ZB, IR
- **Finans: Nakit akışı** → ZB, IR (nakit akışı oynaklığı)
- **Bütçe vs Gerçekleşen / plan varyansı / rolling forecast / senaryo** → MS (Corporate Spend, IT Spend), ZB, IR (KPI varyans takvimi, forecast vs actual, writeback planlama)
- **Kâr marjı / katkı marjı / müşteri kârlılığı / CLV** → MS (Customer Profitability), ZB, IR, DQ
- **OpEx / maliyet merkezi / IT harcaması** → MS (Corporate/IT Spend), ZB
- **Alacak yaşlandırma (AR aging) / fatura** → IR (invoice model), (G: NUM/MET finans paketleri)
- **Ay sonu kapanış / kontrolör raporu** → ZB
- **Pazarlama / kampanya performansı / ROI / pazar payı** → MS (Competitive Marketing, Sales & Marketing), MV (Maven Marketing), DQ, MAM
- **Sosyal medya / web analitiği / ücretli reklam** → MAM (web analytics, Facebook Ads), DQ (sosyal medya duygu)
- **Müşteri segmentasyonu / churn** → DQ, DSG
- **Müşteri hizmetleri / çağrı merkezi / müşteri geri bildirimi** → IR (customer feedback trends), MV/DSG (G: çağrı merkezi challenge'ları yaygın), NOVY (G)
- **İK: headcount, işe alım, ayrılma (attrition), çeşitlilik** → MS (Human Resources, Employee Hiring), IR (talent acquisition funnel, employee talent tracker), DQ, DSG (HR Attrition), MAM
- **Tedarik zinciri / satın alma / tedarikçi** → MS (Procurement, Supplier Quality), IR (Manufacturing & Supply Chain), DQ
- **Stok / envanter** → MS (Retail Analysis), MV (Maven Toys), MAM
- **Kalite (Pareto, kusur, duruş)** → MS (Supplier Quality), IR (Pareto quality)
- **Operasyon / üretim (OEE, IoT sensör, enerji)** → DQ (IoT, enerji tüketimi), IR (Manufacturing, Energy), MAM (operations); OEE için (G)
- **Lojistik / sevkiyat maliyeti** → MV (Northwind: shipping costs), IR (Distribution)
- **Proje portföyü / proje durumu / görev dağılımı (Gantt)** → MET (Project Management), IR (project workflow, Gantt)
- **E-ticaret** → MV/DSG (G), DQ (ölçekli model araba satışları)
- **Sağlık (hasta, talep, dolandırıcılık)** → MS (COVID-19), IR (Healthcare), DQ (claims fraud), MAM
- **AI/keşif (etkileyenler, kök neden, anomali)** → MS (Artificial Intelligence, Sales & Returns)
- **Kişisel bütçe / eğitim-kurs performansı / sosyal-ekonomik veri hikâyeleri** → IR (personal budget flow), DQ (kurs NPS, global kalkınma), MV (Everest, Uzay, Olimpiyat challenge'ları)

## Tasarım ve etkileşim kalıpları

- **Tuval arka plan görseli (Figma/PowerPoint)** → kart kutuları, başlık bandı ve menü SVG/PNG olarak tasarlanıp sayfa arka planına konur; görseller şeffaf üstüne yerleştirilir.
- **Kart konteynerleri (card containers)** → yuvarlak köşe, gölge, iç boşluk; her görsel bir "kart"ın içinde, 8px ızgaraya hizalı.
- **Wireframe şablonu / ızgara sistemi** → sabit kenar boşlukları ve sütun ızgarası (MET "Wireframe Template" ile kurulan düzen).
- **Koyu tema ve "soft dark"** → koyu arka plan + yüksek kontrastlı vurgu rengi; Microsoft yerleşik "Dark/Soft dark" temaları da var.
- **JSON tema dosyası** → renk paleti, metin stilleri, görsel bazında varsayılanlar, good/bad/neutral adlandırılmış renkler; tema üreticileriyle (PowerBI.tips, BIBB, POINT themes.pbix, EDNA, Coolors eklentisi) hazırlanır.
- **SVG KPI kartı + sparkline** → DAX ile üretilen SVG (mini çizgi, ilerleme çubuğu, ok) kart görüntüsü veya tablo hücresi resmi olarak gösterilir.
- **Yeni kart görselinde çoklu callout + referans etiketleri** → tek görselde birden çok KPI, hedef/LY/varyans etiketleri, ikon görselleri ve hover durumu.
- **İkon setleri** → menü, KPI ve buton ikonları (tek renkli, tutarlı çizgi kalınlığı); butonlarda özel ikon/görsel.
- **IBCS notasyonu** → AC/PY/PL/FC ölçek tutarlılığı (dolu/çizgili/boş), kırmızı-yeşil varyans çubukları, mutlak ve % varyans, standart başlık bloğu (ZB, IR).
- **Varyans grafikleri / waterfall / köprü (bridge)** → bütçe→gerçekleşen veya LY→TY farkını adım adım gösterme.
- **Small multiples** → aynı grafiğin kategori başına ızgarası (yerleşik small multiples, ZB gelişmiş small multiples).
- **Koşullu biçimlendirmeli matris (ısı haritası, data bar, ikon)** → finans tabloları ve scorecard'lar; özel toplamlar, sabit sütun genişliği.
- **Buton durumları (default/hover/press/selected/disabled)** → farklı dolgu, ikon ve metinle mikro etkileşim.
- **Sayfa navigatörü / menü çubuğu** → sol dikey ya da üst yatay menü; seçili sayfa vurgusu, gizli alt sayfalar.
- **Bookmark ile kayan slicer paneli** → şekil + slicer'lar gruplanır, iki bookmark (açık/kapalı, "Data" kapalı) ile buton tıklamasında panel görünür/gizlenir.
- **Bookmark ile görünüm değiştirme (grafik ↔ tablo ↔ harita)** → aynı alanda alternatif görseller arasında geçiş.
- **Bilgi/yardım katmanı (info overlay)** → "?" butonuyla açılan yarı saydam açıklama katmanı veya ayrı yardım sayfası; görsel başlıklarında yardım tooltip'i.
- **Report-page tooltip** → üzerine gelinince mini rapor sayfası (trend, detay KPI) gösterme.
- **Drillthrough ve geri butonu** → sağ tık ile detay sayfasına, filtre bağlamıyla; çapraz rapor drillthrough.
- **Field parameters ile ölçü/boyut değiştirici** → tek grafikte "Satış / Kâr / Adet" veya "Kategori / Bölge" seçimi.
- **What-if parametresi / senaryo** → slicer ile oran değiştirip etkiyi görme (iade oranı, fiyat artışı).
- **AI görselleri** → Key Influencers, Decomposition Tree, Q&A, Smart/Copilot narrative, anomali tespiti.
- **Hikâye anlatımı / intro sayfası / scrollytelling** → kapak sayfası, adım adım bulgu sayfaları, uzun dikey sayfa ile kaydırmalı anlatım, anlatı metin kutuları.
- **Mobil düzen** → telefon düzeni görünümü, dikey KPI sırası, mobil için ayrı sayfa boyutu.
- **Tarih seçici ve göreli tarih** → tarih picker slicer, "Son 90 gün" gibi hızlı butonlar.
- **Harita katmanları** → Azure Maps (bubble, ısı, referans katmanı), Shape Map ile bölge haritası.
- **Özel görseller (AppSource)** → Zebra BI, Inforiver, Deneb/HTML görselleri, Mapbox; görsel zenginlik ama lisans/performans maliyeti.
- **Tutarlı tipografi ve renk semantiği** → 2-3 yazı boyutu, olumlu/olumsuz renkleri, erişilebilir kontrast; az sayıda görsel/sayfa (performans).

## 2025–2026 özellikleri

- **Card visual (yeni kart)** → Kasım 2025'te GA; çoklu kart, kategoriler, callout/görsel/referans etiketi, hover görsel durumu, koşullu biçim; eskileri "legacy" olarak geri yüklenebilir. https://learn.microsoft.com/power-bi/visuals/power-bi-visualization-new-card
- **Button slicer** → değerleri buton ızgarası olarak gösterir; görseller, seçili/seçisiz durumlar, highlight label, Fixed size / Fit to space. https://learn.microsoft.com/power-bi/visuals/power-bi-visualization-button-slicer
- **List slicer** (önizleme) → hiyerarşili dikey liste, arama, leaf-only seçim, koşullu biçim. https://learn.microsoft.com/power-bi/visuals/power-bi-visualization-list-slicer
- **Input slicer** (eski adı "Text slicer", Şubat 2026 GA) → serbest metin/sayı ile filtre, 7 operatör, translytical task flow girişi. https://learn.microsoft.com/power-bi/visuals/power-bi-visualization-input-slicer
- **Date picker for slicer** → takvim + göreli tarih + kaydırıcı, "Single date" (Ağustos 2026 GA). https://learn.microsoft.com/power-bi/fundamentals/whats-new
- **Visual calculations** → görsel üzerinde DAX (RUNNINGSUM, MOVINGAVERAGE, PREVIOUS, COLLAPSE, LOOKUP…), şablonlar; özel toplamlarla Mayıs 2026'da GA. https://learn.microsoft.com/power-bi/transform-model/desktop-visual-calculations-overview
- **Field parameters** → okuyucunun slicer ile ölçü/boyut değiştirmesi; "persist hierarchy level" ayarı. https://learn.microsoft.com/power-bi/create-reports/power-bi-field-parameters
- **Dynamic format strings for measures** → ölçü sayısal kalırken biçim DAX ile bağlama göre değişir (para birimi, K/M, süre). https://learn.microsoft.com/power-bi/create-reports/desktop-dynamic-format-strings
- **Report page tooltips / Modern visual tooltips** → sayfa tabanlı tooltip; modern tooltip'ler Ocak 2026 GA. https://learn.microsoft.com/power-bi/create-reports/desktop-tooltips
- **Page navigator & Bookmark navigator** → sayfalar/bookmark gruplarıyla otomatik senkron buton menüleri. https://learn.microsoft.com/power-bi/create-reports/button-navigators
- **Copilot narrative visual** → rapor/sayfa/görsel özeti, prompt ile ton; GA (ücretli Fabric kapasitesi gerekir). https://learn.microsoft.com/power-bi/create-reports/copilot-create-narrative
- **Azure Maps visual** → önerilen harita (Bing tabanlı basic map kullanımdan kalkacak); işaretçiler, shape eşleme, filtreye otomatik zoom (2026). https://learn.microsoft.com/power-bi/visuals/power-bi-map-visualizations-overview
- **On-object interaction** (hâlâ önizleme) → görseli tuval üzerinde doğrudan oluşturma/biçimlendirme. https://learn.microsoft.com/power-bi/create-reports/power-bi-on-object-interaction
- **Report themes (JSON) + Modern visual defaults / Theme pane** → Fluent 2 temel tema, yerleşik temalar (Bloom, Dark, Soft dark, Tidal, Frontier, Innovate…), Theme pane Ağustos 2026 GA. https://learn.microsoft.com/power-bi/create-reports/desktop-report-themes · https://learn.microsoft.com/power-bi/create-reports/report-themes-create-custom
- **PBIR (Enhanced Report Format)** → GA ve Desktop'ta varsayılan; her sayfa/görsel/bookmark ayrı JSON (Git dostu). https://learn.microsoft.com/power-bi/developer/projects/projects-report
- **Donut center value, series labels, outer padding, matrix expand/collapse ve freeze** → 2026 görsel biçim yenilikleri. https://learn.microsoft.com/power-bi/fundamentals/whats-new
- **Mobile layout view** → telefon için ayrı düzen tasarımı. https://learn.microsoft.com/power-bi/create-reports/power-bi-create-mobile-optimized-report-mobile-layout-view
- **Translytical task flows** (Mart 2026 GA) → rapordan veri yazma/aksiyon (input slicer + buton). https://learn.microsoft.com/power-bi/fundamentals/desktop-latest-update-archive
