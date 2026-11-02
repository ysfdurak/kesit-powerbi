# Rol bazlı Power BI eğitim programları: konu kapsamı (araştırma notu)

Okuma tarihi 2026-10-27. Yalnızca konu anahtar kelimeleri, sağlayıcı metni kopyalanmadı. DataCamp ders içerikleri ayrı dosyada (datacamp_syllabus.md); burada yalnızca track ve sertifika düzeyindeki bilgi var.
Not: Bir sağlayıcı bir rolde tekrar ediyorsa, konular ilk geçtiği rolde listelendi ("bkz." ile).

## Rol: profesyonel (sıfırdan uzmana tam program)
- **Coursera, Microsoft Power BI Data Analyst Professional Certificate (Microsoft, 8 ders, yaklaşık 188 saat / 5 ay)**: 1) Excel ile veri hazırlama (formüller, temizleme, wrangling); 2) Power BI'a giriş (bileşenler, analiz yaşam döngüsü, veriye dayalı karar); 3) ETL (veri kaynakları, depolama modları, profilleme, anomali, referans sorgu, dataflow, Advanced Editor); 4) Modelleme (star schema, DAX, model performansı, iş metrikleri); 5) Analiz ve görselleştirme (rapor/dashboard, erişilebilir tasarım, betimsel istatistik, storytelling); 6) Yaratıcı tasarım (özel grafikler, video, streaming veri, QR kod, coğrafi harita); 7) Deploy/maintain ve capstone (app yayınlama, dinamik rapor, güvenlik, alert, SQL); 8) PL-300 hazırlık (deneme sınavı, Copilot/GenAI)
- **DataCamp, Data Analyst in Power BI (career track)**: datacamp_syllabus.md'deki 1-17. dersler sırayla, ardından "Power BI for Data Analysts" değerlendirmesi; track bitince PL-300 sınavında %50 indirim
- **Microsoft (Coursera), Power BI Developer and Architect Professional Certificate (4 ders, yaklaşık 245 saat)**: temel ve modelleme (mimari, geliştirme yaşam döngüsü, dimensional model, workspace, governance) → ileri DAX ve performans (Performance Analyzer, DAX Studio, Copilot) → etkileşimli raporlama (custom visual, AI analitiği, drill-through, storytelling) → kurumsal deploy (Azure entegrasyonu, deployment pipelines, RLS, kapasite planlama, DevOps)
- **Pluralsight, Microsoft Power BI for Data Analysts path (24 ders, 13 lab, 31 saat)**: Başlangıç: import, ek kaynaklar, Power Query hazırlık, DAX temelleri, sıfırdan model, rapor, etkileşim, custom visual ve tema; Orta: ileri Power Query, orta DAX, metin/veri dönüşümü DAX, workspace paylaşımı, takım çalışması, dashboard, dataflow; İleri: measure/aggregation/context, M dili, RLS, Python, embed, Report Server, AI özellikleri
- **Enterprise DNA**: Power BI Data Analyst (19 saat) → DAX for Power BI Analysis (24 saat) → Mastering Visualization (10 saat) → M Code for Power Query (11 saat) → Fabric Fundamentals (11 saat) → Power BI for Data Science / Power BI & Python Advanced Analytics
- **LinkedIn Learning**: path'ler "Master Microsoft Power BI", "Become a Power BI Specialist", "Become a BI Specialist", "Master Dashboards and Data Viz in Power BI". Konular: temeller, import/dönüşüm, Power Query, modelleme/DAX, görsel ve dashboard tasarımı, ileri analitik, paylaşım ve iş birliği, PL-300 hazırlık (Power BI Essential Training, Helen Wall serisi). Path sayfaları açılamadı (robots)

## Rol: analist (Power BI veri analisti)
- **DataCamp, Power BI Fundamentals (skill track)**: başlangıç düzeyi dersler (Intro, DAX'a giriş, görselleştirme, veri hazırlama, modelleme, churn vakası)
- **Maven Analytics, Power BI Specialist path (4 ders, 2 proje, 74 saat)**: 1) Power BI Desktop (bağlantı/hazırlık, ilişkisel model, DAX, etkileşimli rapor; sıfırdan uçtan uca BI projesi); 2) Power BI Service (yayınlama, paylaşım, app, workspace, gateway, dataflow, RLS, veri alert'leri); 3) Advanced DAX (bkz. dax); 4) PL-300 hazırlık
- **Udemy, Microsoft Power BI Desktop for Business Intelligence (Maven: Dutton/Parry, bestseller, yaklaşık 17 saat, 200 ders)**: bağlanma ve şekillendirme (Power Query), model kurma, DAX hesaplamaları, raporla görselleştirme, AI görselleri, optimizasyon araçları, yeni özellikler; AdventureWorks projesi, Maven Market bonus projesi, 25 ödev, quiz'ler, e-kitap
- **Udemy, Power BI - The Practical Guide / A Complete Introduction (Academind, Schwarzmüller)**: Query Editor (en geniş bölüm), Data/Relationship view, rapor görselleri, Service ve Mobile, diğer veri kaynakları, custom visual geliştirme, bookmark, custom tooltip
- **Microsoft Learn, Power BI learning path directory, analist yolu**: veri kaynakları, Desktop'ta bağlanma, şekillendirme/birleştirme, Power Query Editor, lakehouse ve warehouse kaynakları, model görünümü, ilişkiler, measure, hesaplanmış sütun, DAX referansı, time intelligence, calculation groups, tabular modelleme, dimensional modelden rapora
- **Pluralsight**: bkz. profesyonel (vaka lab'ları bkz. vaka)

## Rol: pl300 (PL-300 sınav hazırlığı)
- **Microsoft Learn, PL-300 resmi beceri listesi (2026-04-20'den itibaren geçerli)**: 1) Veriyi hazırla (%25-30): kaynaklar, paylaşılan semantic model, kimlik bilgileri, privacy levels, Import/DirectQuery/Direct Lake, parametreler, profilleme, null/kalite/import hataları, veri tipleri, gruplama, pivot/unpivot/transpose, yarı yapılandırılmış veri, fact/dimension, reference ve duplicate sorgu, merge/append, anahtarlar, load ayarı; 2) Modelle (%25-30): tablo/sütun özellikleri, role-playing dimension, kardinalite, çapraz filtre yönü, ortak tarih tablosu, CALCULATE, time intelligence, temel istatistik, semi-additive measure, quick measure, calculation groups, Performance Analyzer, DAX query view, granülerliği azaltma; 3) Görselleştir ve analiz et (%25-30): görsel seçimi, tema, koşullu biçimlendirme, Copilot narrative ve rapor sayfası, paginated report, visual calculations, bookmark, custom tooltip, etkileşimler, sync slicer, Selection pane, drillthrough, export, mobil tasarım, kişiselleştirme, erişilebilirlik, otomatik sayfa yenileme, Analyze özelliği, gruplama/binning/clustering, AI görselleri, referans çizgisi/forecast, aykırı değer/anomali; 4) Yönet ve güvenli hale getir (%15-20): workspace, app, publish, dashboard, dağıtım yöntemleri, abonelik ve alert, promote/certify, gateway, zamanlanmış yenileme, workspace rolleri, öğe düzeyinde erişim, semantic model erişimi, RLS (rol ve grup üyeliği), sensitivity label
- **Microsoft Learn, PL-300T00 learning path'leri**: Microsoft veri analitiğine giriş → Power BI'da veri hazırlama (Get data; temizle/dönüştür/yükle) → Modelleme (model tasarımı, DAX formülleri, measure, hesaplanmış tablo/sütun, time intelligence) → Görsel ve rapor (tasarım, filtreler, kullanıcı deneyimi, analitik) → Workspace ve semantic model yönetimi (workspace, semantic model, dashboard, RLS). Ek olarak ücretsiz Practice Assessment, Exam Sandbox, prep videoları ve Exam Replay
- **Coursera**: 8. ders, PL-300 hazırlık ve pratik (deneme sınavı); bitirenlere %50 sınav indirimi; ayrıca "Exam Prep PL-300" specialization var
- **Pluralsight, PL-300 path**: 4 ders sınav alanlarıyla birebir aynı (hazırla, modelle, görselleştir, yönet; her biri yaklaşık 2 saat) + 4 lab (çok kaynaklı temizlik, ilişki ve measure, etkileşimli rapor, statik RLS) + deneme sınavı
- **Maven / Enterprise DNA / LinkedIn Learning (Microsoft Press PL-300 Cert Prep)**: PL-300 hazırlık dersi path'lerin son halkası
- **DataCamp**: kendi sertifikası yok, PL-300'e yönlendiriyor (career track = %50 indirim); sınav 40-60 soru, 100 dk, geçme puanı 700; sertifika 1 yıl geçerli, ücretsiz online yenileme

## Rol: gelistirici (Power BI / BI developer)
- **Microsoft (Coursera), Developer and Architect**: bkz. profesyonel. Odak: geliştirme yaşam döngüsü, DAX Studio, deployment pipelines, DevOps, kapasite planlama, kurumsal güvenlik
- **Edureka (Coursera), Power BI Developer specialization (3 ders, yaklaşık 34 saat)**: temeller + Power Query + DAX → ölçeklenebilir tasarım ve deploy (KPI, Service, governance, güvenlik, veri etiği) → bağlantı ve AI (Fabric, Python script, AI görselleri, Copilot, tahmin modeli, paginated report, RLS/OLS, Report Server)
- **SQLBI, Data Modeling for Power BI (yaklaşık 10 saat video + 8 saat alıştırma)**: header/detail tablolar, çoklu fact tablosu, tarih ve saat, tarihsel öznitelik takibi (SCD), snapshot'lar, tarih/saat aralıkları, many-to-many, farklı granülerlikler, segmentasyon modelleri, çoklu para birimi
- **SQLBI, Optimizing DAX (yaklaşık 39 saat)**: Tabular sorgu mimarisi, Performance Analyzer, DAX Studio, query plan, formula engine, VertiPaq storage engine, VertiPaq ilişkileri, SE sorgu analizi, yaygın kalıpları optimize etme, filtre taşıma, güvenlik (RLS) optimizasyonu, SQL üzerinde DirectQuery, composite model, karmaşık modeller
- **Microsoft Learn, developer yolu**: embedding (müşteri / kurum içi için), REST API, Fabric REST API, TMSL, custom visual geliştirme (ortam kurulumu, circle card, Visuals API, AppSource), embedded RLS
- **Microsoft Learn, admin yolu (developer için yararlı)**: admin portal, lisanslama, tenant ayarları, Copilot ayarları, gateway, harici paylaşım, kullanım metrikleri, SSRS geçişi
- **Pluralsight, ileri seviye**: M dili, embed, Report Server, Python
- **DataCamp**: Deploying and Maintaining Assets, Intermediate Data Modeling (performans) dersleri; ayrı bir developer track'i yok

## Rol: dax (DAX uzmanı)
- **SQLBI, Mastering DAX (3. baskı, yaklaşık 32-39 saat, 84 alıştırma)**: DAX'a giriş, filter context ve CALCULATE, filter context'i değiştirme, row context ve context transition, temel tablo fonksiyonları, değişkenler, evaluation context (anlamak ve kullanmak), kullanıcı tanımlı fonksiyonlar (UDF), tablolarla çalışma, window fonksiyonları, time intelligence, visual calculations, calculation groups, filter context'i inceleme ve hiyerarşiler, sorgu yazma (DAX query), ileri kavramlar (expanded tables vb.), ileri örneklerle pratik
- **SQLBI, Optimizing DAX**: bkz. gelistirici
- **Maven Analytics, Advanced DAX for Power BI**: evaluation context, filter akışı, formula ve storage engine, VertiPaq sıkıştırma, VAR, yorum/biçim/hata yönetimi, skaler fonksiyonlar, iterator'lar, filtre fonksiyonları, ileri time intelligence, ilişki fonksiyonları, hesaplanmış tablo join'leri, sanal tablolar, SUMMARIZECOLUMNS, sıralama, kohort analizi, DAX Studio; Maven Roasters vakası (stok, tekrar eden müşteri, mağaza performansı)
- **Enterprise DNA, DAX Fundamentals + DAX for Power BI Analysis (24 saat)**: DAX'ın temel taşları, ileri analiz kalıpları
- **Pluralsight, DAX lab'ları**: aggregation, koşullu mantık, filtre ve context değiştiriciler, time intelligence, iterasyon, metin fonksiyonları
- **DataCamp**: Intro DAX → DAX Functions → Intermediate DAX (RLS, SUMMARIZE/ADDCOLUMNS, time intelligence)

## Rol: dp600 (Fabric Analytics Engineer)
- **Microsoft Learn, DP-600 resmi beceri listesi (2026-10-19'dan itibaren geçerli)**: 1) Analitik çözümü sürdür (%25-30): workspace ve öğe erişimi, RLS/CLS/OLS ve dosya düzeyi erişim, sensitivity label, endorsement, workspace sürüm kontrolü (Git), .pbip, deployment pipelines, etki analizi (impact analysis), XMLA endpoint, yeniden kullanılabilir varlıklar (.pbit, .pbids, paylaşılan semantic model); 2) Veriyi hazırla (%45-50): bağlantı, OneLake catalog, Real-Time hub, veri alma (ingest), veri deposu seçimi, Eventhouse/semantic model için OneLake entegrasyonu, view/fonksiyon/stored procedure, zenginleştirme, star schema, denormalizasyon, aggregation, join, yinelenen/eksik/null değer, tip dönüşümü, Visual query editor, SQL, KQL, DAX; 3) Semantic model (%25-30): depolama modu, bridge tablo, many-to-many, DAX (değişkenler, iterator, tablo filtreleme, windowing, information fonksiyonları), calculation groups, dinamik format string, field parameter, large model storage format, composite model, sorgu ve görsel performansı, Direct Lake (fallback, refresh davranışı, OneLake ve SQL endpoint farkı), incremental refresh
- **Microsoft DP-600T00 kursu (güncel, 5 modül)**: analitik veri depolarını keşfet (OneLake, lakehouse, warehouse, Real-Time Intelligence) → veriyi tasarla ve dönüştür (depo seçimi, dimensional model, Dataflows Gen2, notebook, T-SQL) → semantic model tasarla ve yönet (DAX, ölçeklenebilir tasarım, performans, güvenlik, yaşam döngüsü) → AI'a hazır veri (semantic katman, Fabric IQ, ontoloji) → güvenlik ve yönetişim (veri erişimi, warehouse güvenliği, Purview). Önceki sürüm 4 modüldü: Fabric'e giriş, warehouse, semantic model, yönetim ve governance
- **DataCamp, Introduction to Microsoft Fabric**: iş yükleri (workloads), OneLake/Delta-Parquet, Power BI in Fabric, Direct Lake, depolama modları; Fabric track'i yok
- **Enterprise DNA, Microsoft Fabric Fundamentals (11 saat)**
- **Coursera, Microsoft Fabric Analytics Engineer (DP-600) Exam Prep** dersi mevcut (içeriği açılmadı)

## Rol: yonetici (rapor tüketen ve talep eden iş kullanıcısı)
- **Microsoft Learn, Business users learning catalog ve "Consume data with Power BI" path**: Service temelleri, Service'te gezinme, rapor görüntüleme ve keşfetme, mobil uygulamalar
- **Microsoft Learn, directory iş kullanıcısı yolu**: oturum açma, gezinme, terimler, "Benimle paylaşılanlar", rapor açma, okuma görünümü, filtre ve slicer, drill-down, insights, Copilot sohbeti, abonelikler, veri alert'leri
- **DataCamp, Power BI for End Users dersi + Deploying dersindeki "Enabling Users" bölümü**: içerik keşfi, endorse edilmiş içerik, görseli kişiselleştirme, abonelik, alert
- **Coursera / Maven / Udemy**: bu rol için ayrı bir path yok; temel derslerdeki Service ve paylaşım bölümleri. Rapor talep etme ve brief yazma konusu nadiren işleniyor (DataCamp Intro dersinde "report brief" var); KPI tanımlama ve requirements toplama iş ilanlarında geçiyor

## Rol: hizli (hızlı başlangıç)
- **Microsoft Learn, Get started with Power BI path**: bileşenler, Desktop'tan Service'e ilk rapor
- **DataCamp, Introduction to Power BI (yaklaşık 3-4 saat), Design in Power BI track (4 saat: Dashboard Design Concepts + User-Oriented Design, bonus: rapor tasarımı tutorial'ları)**
- **Udemy, A Complete Introduction (yaklaşık 9-10 saat)**: Desktop, Query Editor, model, görseller, Service, Mobile
- **LinkedIn Learning, Power BI Essential Training (2024)**: get data, model, görsel, paylaşım
- Ortak çekirdek: veri al → Power Query'de temizle → ilişki kur → 2-3 temel measure → rapor ve slicer → yayınla ve paylaş

## Rol: mulakat (iş görüşmesi hazırlığı)
- **Sağlayıcı path'lerinde ayrı bir mülakat modülü yok**; Udemy'de soru-cevap dersleri ve blog listeleri var (weekday.works, vskills, dev.to)
- **Başlangıç soruları**: Power BI bileşenleri, rapor ile dashboard farkı, depolama modları (Import / DirectQuery / Live), merge ve append, measure ile hesaplanmış sütun farkı, star schema, fact/dimension, kardinalite, filtre türleri, gateway
- **Orta düzey sorular**: filter ve row context, CALCULATE ve context transition, SUMX, ALL / ALLEXCEPT / ALLSELECTED, toplamın yüzdesi, FILTER performansı, time intelligence ve tarih tablosu, RELATED/RELATEDTABLE, VAR/RETURN, COUNT ailesi, RANKX, USERELATIONSHIP, statik ve dinamik RLS, bookmark, drillthrough, zamanlanmış yenileme
- **İleri sorular**: Performance Analyzer, DAX Studio, incremental refresh, query folding, composite model, aggregation, calculation groups, dataflow/datamart/Fabric, çift yönlü filtre ve CROSSFILTER, dev/test/prod, deployment pipelines, Git/PBIP, veri doğrulama ve mutabakat (reconciliation)
- **Senaryo soruları**: her satırda aynı toplamın çıkması, slicer'dan bağımsız kayan pencere, Top N + "Diğerleri", many-to-many ve bridge tablo, "yaptığın bir dashboard'u anlat" (portföy sunumu)

## Rol: vaka (vaka çalışmaları)
- **DataCamp**: churn, HR, iş piyasası, tedarik zinciri, sağlık, rakip satış analizi, ipotek ticareti, stok, finansal tablolar, beyzbol (ders başlıkları için syllabus dosyasına bkz.)
- **Pluralsight, vaka lab'ları**: zamana göre satış trendi, en iyi ürünler, bütçe ve gerçekleşen, çalışan sayısı ve işten ayrılma
- **Maven**: AdventureWorks (Desktop), Maven Market, Maven Roasters (DAX); path başına 2 portföy projesi; ayrıca aylık Maven Challenge (topluluk yarışması)
- **Coursera Microsoft PC**: her derste uygulamalı proje; capstone'da çok uluslu bir şirketin performans analizi ve yönetici dashboard'u. Developer/Architect: satış modeli, ileri DAX ile finans dashboard'u, yönetici raporu, güvenli kurumsal mimari
- **SQLBI**: alıştırmalarda gerçekçi modelleme vakaları (çoklu para birimi, snapshot, segmentasyon)
- İş ilanlarında sık geçen alanlar: finans, operasyon, sağlık, perakende, İK/bordro, satış/CRM, üretim/ERP

## Job-ready özellikleri
- **Capstone / portföy**: Coursera capstone (yönetici dashboard'u), Maven path başına 2 proje ve "portfolio" hedefi, Microsoft Developer PC'de 4 kademeli proje
- **Sertifika köprüsü**: PL-300 için %50 indirim (Coursera, DataCamp); Maven, Enterprise DNA ve Pluralsight path'leri PL-300 ile bitiyor; Coursera sertifikası ACE kredisi veriyor
- **Değerlendirme**: DataCamp "Power BI for Data Analysts" assessment; MS Learn ücretsiz Practice Assessment ve Exam Sandbox (sınav arayüzü simülasyonu); Pluralsight ve Coursera deneme sınavları; Udemy bölüm quiz'leri
- **Uygulamalı lab'lar**: Pluralsight (13 lab, vaka lab'ları), SQLBI (84 numaralı alıştırma ve çözüm dosyaları), Udemy Maven (25 ödev ve çözüm)
- **Gerçekçi veri setleri**: AdventureWorks, Contoso (SQLBI), sektöre özel vakalar (DataCamp, sektör bazında 10'dan fazla)
- **Topluluk**: SQLBI özel tartışma alanı, Enterprise DNA forum ve topluluk, Maven Challenge, Udemy Q&A
- **Güncellik**: Copilot, visual calculations, UDF, Fabric IQ gibi yeni özellikler hızla müfredata ekleniyor; Udemy Maven'da "yeni özellikler" bölümü var
- **İş akışı becerileri**: requirements toplama, KPI tanımı, paydaşlara sunum, dokümantasyon ve deploy, programlarda zayıf; iş ilanlarında ise güçlü biçimde isteniyor (aşağıya bkz.) → farklılaşma fırsatı
- **Paylaşılabilir rozet**: LinkedIn'e eklenebilir sertifikalar (Coursera, Maven sertifika sayfaları, LinkedIn Learning)

## İş ilanı gereksinimleri
Örneklem: 11 ilan (2026). Türkiye: Sentez Sağlık / MedicalPoint (techcareer.net, kariyer.net kaynaklı), ING Bank İstanbul, EPAM İstanbul, N-iX (Türkçe bilen, TR/AZ/AB). Global: Intetics (uzaktan), TXP (İngiltere), Compass Group (İngiltere), Yourdigitalfuture (İngiltere), Experis (ABD), Insight Global (ABD), Hyland (Hindistan). Frekanslar bu örneklemdeki oranlardır.

| Gereksinim | Sıklık | Kaynak |
|---|---|---|
| DAX (çoğu ilanda ileri / "strong") | 11/11 | [Sentez](https://www.techcareer.net/en/jobs/detail/raporlama-ve-is-zekas-power-b-uzman-4500884), [Compass](https://findajob.dwp.gov.uk/details/17967148) |
| SQL (sorgu, view okuma, optimizasyon) | 11/11 | [MedicalPoint](https://www.techcareer.net/en/jobs/detail/raporlama-ve-is-zekas-power-b-uzman-4550947), [TXP](https://www.jobs24.co.uk/job/power-bi-developer-126718215) |
| Veri modelleme / star schema / dimensional | 10/11 | [Intetics](https://joinrise.co/intetics/power-bi-fabric-developer-4wnh), [EPAM](https://themuse.com/jobs/epamsystems/senior-power-bi-developer-33fd03) |
| Power Query (M) | 9/11 | [ING](https://www.techcareer.net/en/jobs/detail/power-bi-engineer), [Experis](https://www.experis.com/en/job/408575/power-bi-analyst-) |
| Paydaş iletişimi, requirements toplama, KPI tanımlama | 10/11 | [TXP](https://www.jobs24.co.uk/job/power-bi-developer-126718215), [Hyland](https://careers-hyland.icims.com/jobs/13156/business-intelligence-analyst-2/job) |
| Dashboard / rapor tasarımı, görselleştirme | 10/11 | [Sentez](https://www.techcareer.net/en/jobs/detail/raporlama-ve-is-zekas-power-b-uzman-4500884) |
| Performans optimizasyonu (DAX/model/rapor) | 7/11 | [Insight Global](https://jobs.insightglobal.com/find_a_job/hawaii/job-480893), [Intetics](https://joinrise.co/intetics/power-bi-fabric-developer-4wnh) |
| Microsoft Fabric (Lakehouse, Warehouse, OneLake, Direct Lake, Dataflows Gen2) | 6/11 (çoğunlukla "tercih sebebi") | [TXP](https://www.jobs24.co.uk/job/power-bi-developer-126718215), [Hyland](https://careers-hyland.icims.com/jobs/13156/business-intelligence-analyst-2/job) |
| Service yönetimi: workspace, app, gateway, refresh, governance | 7/11 | [Yourdigitalfuture](https://www.itjobswatch.co.uk/jv/Yourdigitalfuture/Power-BI-Developer-Job-England-UK-4te4t6), [Experis](https://www.experis.com/en/job/408575/power-bi-analyst-) |
| RLS / güvenlik | 6/11 | [Intetics](https://joinrise.co/intetics/power-bi-fabric-developer-4wnh), [Hyland](https://careers-hyland.icims.com/jobs/13156/business-intelligence-analyst-2/job) |
| Deployment pipelines, Git / sürüm kontrolü, dev/test/prod, CI/CD | 5/11 | [Compass](https://findajob.dwp.gov.uk/details/17967148), [Hyland](https://careers-hyland.icims.com/jobs/13156/business-intelligence-analyst-2/job) |
| ETL / veri ambarı (SSIS, Azure, Databricks) | 6/11 | [N-iX](https://careers.n-ix.com/jobs/4236774101-data-management-senior), [EPAM](https://themuse.com/jobs/epamsystems/senior-power-bi-developer-33fd03) |
| Veri kalitesi, doğrulama, mutabakat | 5/11 | [Experis](https://www.experis.com/en/job/408575/power-bi-analyst-), [Sentez](https://www.techcareer.net/en/jobs/detail/raporlama-ve-is-zekas-power-b-uzman-4500884) |
| İleri Excel (TR ilanlarında belirgin) | 3/11 | [MedicalPoint](https://www.techcareer.net/en/jobs/detail/raporlama-ve-is-zekas-power-b-uzman-4550947), [Hyland](https://careers-hyland.icims.com/jobs/13156/business-intelligence-analyst-2/job) |
| Dokümantasyon, standartlar, eğitim ve kullanıcı desteği | 6/11 | [Yourdigitalfuture](https://www.itjobswatch.co.uk/jv/Yourdigitalfuture/Power-BI-Developer-Job-England-UK-4te4t6), [N-iX](https://careers.n-ix.com/jobs/4236774101-data-management-senior) |
| Python veya R (genellikle tercih sebebi) | 4/11 | [ING](https://www.techcareer.net/en/jobs/detail/power-bi-engineer), [MedicalPoint](https://www.techcareer.net/en/jobs/detail/raporlama-ve-is-zekas-power-b-uzman-4550947) |
| PL-300 / Power BI sertifikası (zorunlu ya da tercih) | 5/11 | [Compass](https://findajob.dwp.gov.uk/details/17967148) (zorunlu), [EPAM](https://themuse.com/jobs/epamsystems/senior-power-bi-developer-33fd03) |
| Sektör bilgisi (finans, sağlık, perakende, İK, ERP/CRM) | 6/11 | [Intetics](https://joinrise.co/intetics/power-bi-fabric-developer-4wnh), [Experis](https://www.experis.com/en/job/408575/power-bi-analyst-) |
| Yönetici sunumu / executive reporting | 4/11 | [Sentez](https://www.techcareer.net/en/jobs/detail/raporlama-ve-is-zekas-power-b-uzman-4500884), [Hyland](https://careers-hyland.icims.com/jobs/13156/business-intelligence-analyst-2/job) |
| Power Platform (Power Apps, Power Automate) | 2/11 | [Compass](https://findajob.dwp.gov.uk/details/17967148) |
| SSRS / paginated report / OLAP | 1/11 | [N-iX](https://careers.n-ix.com/jobs/4236774101-data-management-senior) |
| Agile, test (unit test) | 2/11 | [ING](https://www.techcareer.net/en/jobs/detail/power-bi-engineer), [TXP](https://www.jobs24.co.uk/job/power-bi-developer-126718215) |
| İngilizce (TR'deki global firmalarda dolaylı olarak; ilanlar İngilizce) / Türkçe (N-iX) | TR'de ilan dili İngilizce: 3/4 | [EPAM](https://themuse.com/jobs/epamsystems/senior-power-bi-developer-33fd03) |
| Deneyim: TR'de 2+ yıl, senior ilanlarda 5-6+ yıl; mühendislik/YBS/istatistik/ekonomi lisansı | - | [Sentez](https://www.techcareer.net/en/jobs/detail/raporlama-ve-is-zekas-power-b-uzman-4500884) |

Mülakat konuları kaynağı: [weekday.works Power BI interview questions 2026](https://www.weekday.works/post/power-bi-interview-questions)
