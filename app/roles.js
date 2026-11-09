/* Kesit Power BI — Rol katmanı: her patikanın kime göre olduğu, hangi işlere hazırladığı, bitirince yapabilecekleri,
   aşamaları (kilometre taşları), bitirme projesi ve işe hazırlık kontrol listesi.
   Kapsam, rol odaklı öğrenme yollarında yaygın konular ve
   2026 iş ilanlarındaki gereksinimlerle karşılaştırılarak belirlendi; metinler özgündür. */
(function (W) {
'use strict';
const L = (t, lessons, d, go) => ({ t, lessons, d, go: go || null });
const EXAM = (t, exam, min, d, go) => ({ t, exam, min, d, go });
const CAP = (t, d) => ({ t, cap: true, d, go: null });
const SELF = (t, d, go) => ({ t, d, go: go || null });
const DATA = 'Uygulamanın Anadolu Market modeli (Satislar, Urunler, Kategoriler, Musteriler, Tarih, Hedefler, Calisanlar, StokGorunum, WebOlaylari). Model sayfasındaki “Veri setini indir” ile tabloları CSV olarak alıp Power BI Desktop’ta kendi bilgisayarında kur.';
const PRESENT = 'Önce iş sorusunu ve cevabı tek cümleyle söyle, sonra modeli ve en zor ölçüyü anlat, en son ne yapılmasını önerdiğini ve bunun etkisini söyle. Ekran görüntüsü, PBIP klasörü ve kısa bir README hazır olsun.';
const RUB_BASE = [
  ['Model', 'Yıldız şema kurulmuş, ilişkiler çalışıyor', 'Tarih tablosu işaretli, gereksiz sütunlar gizli, adlandırma tutarlı', 'Ayrıntı düzeyleri belgelenmiş, rol oynayan ve yarı toplanabilir durumlar doğru çözülmüş'],
  ['Ölçüler', 'Temel ölçüler doğru sonuç veriyor', 'Ölçüler klasörlenmiş, biçimli, açıklamalı; toplam satırı doğru', 'Test sayfası ve kaynakla mutabakat var; karmaşık ölçüler VAR ile okunur'],
  ['Rapor', 'Sayfalar bir soruya cevap veriyor', 'Görsel seçimi doğru, filtre ve etkileşimler bilinçli', 'Yönetici özeti, detay ve araç ipucu katmanları; mobil düzen ve erişilebilirlik kontrolü'],
  ['İletişim', 'Bulgular yazılı', 'Bulgu → kanıt → öneri sırasıyla anlatılmış', 'Etkisi sayıyla ölçülmüş, sonraki adımlar sahibi ve tarihiyle belirlenmiş']
];

const DP_DOMAINS = W.PBI_CERT_INFO.dp600.domains;
const dpArea = (index, lessons) => {
  const [title, , lo, hi] = DP_DOMAINS[index];
  return L(title, lessons, '%' + lo + '–' + hi);
};
W.PBI_ROLES = {
  profesyonel: {
    title: 'Tam program', who: 'Hiç Power BI açmamış biri için; Excel bilmen yeterli. Temel’den İleri’ye bütün dersler.', jobs: ['Veri analisti', 'BI uzmanı', 'BI geliştirici'], level: 'Temel → İleri',
    long: 'Tüm müfredat tek yolda: arayüzden ve ilk rapordan başlayıp Power Query, yıldız şema, DAX, rapor tasarımı, paylaşma ve güvenlik, ileri DAX, performans, kurumsal model ve Fabric’e kadar. Vaka çalışmaları ve bitirme projesiyle biter.',
    outcomes: ['Farklı kaynaklardan gelen kirli veriyi Power Query ile temizleyip yıldız şemaya dönüştürürüm.', 'İş birimlerinin KPI’larını doğru tanımlar, CALCULATE, zaman zekâsı ve tablo fonksiyonlarıyla ölçüye çeviririm.', 'Yöneticinin bir bakışta anladığı, detaya inilebilen, mobilde de çalışan raporlar tasarlarım.', 'Raporu yayımlar, yenilemeyi kurar, RLS ile güvenliğini sağlar ve kullanıcılara dağıtırım.', 'Yavaş bir raporun nedenini bulur, modeli ve DAX’ı hızlandırırım.', 'Kurumsal ölçekte model, sürüm kontrolü ve dağıtım işlem hatlarıyla çalışırım.', 'Bir iş sorusunu brif, model, ölçü, rapor ve öneri adımlarıyla uçtan uca çözerim.'],
    cap: { title: 'Anadolu Market yönetim kokpiti: uçtan uca BI projesi', brief: 'Genel müdür, şirketin satış, kârlılık, müşteri ve stok durumunu tek bir raporda görmek istiyor. Ham verilerden başlayıp yayımlanmış, güvenli ve belgelenmiş bir rapor teslim et.', data: DATA,
      steps: ['Genel müdürle yapılmış gibi bir brif yaz: 5 soru, 8 KPI, kitle ve yenileme sıklığı.', 'Tabloları Power Query ile temizle; yıldız şemayı kur, tarih tablosunu işaretle.', 'KPI’ları ölçü olarak yaz: net satış, brüt kâr, marj, hedef gerçekleşme, YoY, yeni ve kayıp müşteri, stok devir hızı.', 'Üç sayfa tasarla: yönetici özeti, analiz (detay ve ayrıştırma), müşteri ve stok.', 'Bölge müdürleri için RLS rolü ekle ve test et.', 'Test sayfası kur: kaynak toplamlarıyla mutabakat ve kenar durumları.', 'Performans Analizi ile en yavaş görseli bul ve iyileştir.', 'Bulgular sayfası ve bir paragraflık yönetici özeti yaz; projeyi PBIP olarak sakla ve README hazırla.'],
      check: ['Brif ve KPI tanımları yazıldı', 'Power Query adımları adlandırıldı, model yıldız şemada', 'En az 12 ölçü klasörlü, biçimli ve açıklamalı', 'Üç rapor sayfası ve mobil düzen hazır', 'RLS rolü tanımlandı ve “Rol olarak görüntüle” ile test edildi', 'Mutabakat ve test sayfası hazır', 'Performans iyileştirmesi ölçülerek belgelendi', 'README, ekran görüntüleri ve 3 dakikalık anlatım hazır'],
      rubric: RUB_BASE, present: PRESENT },
    ready: [L('Temel seviyenin tüm dersleri', null, 'Arayüz, Power Query, model, ilk ölçüler ve görseller.'), L('Orta seviyenin tüm dersleri', null, 'Bağlam, CALCULATE, zaman zekâsı, etkileşimli raporlar.'), L('İleri seviyenin tüm dersleri', null, 'Bağlam geçişi, performans, güvenlik, kurumsal model.'), EXAM('PL-300 deneme sınavında en az 700', 'pl300', 70, 'Gerçek sınav formatında, 100 dakika.', ['sinav', null, 'Sınavlar']), EXAM('DAX kodlama sınavı (orta) en az %75', 'kod-b', 75, 'DAX yazdığın süreli sınav.', ['sinav', null, 'Sınavlar']), { t: 'DAX Arena’da 300 puan', arena: 300, d: 'Gizli kırılımlarda da doğru çalışan ölçüler.', go: ['arena', null, 'Arena'] }, CAP('Bitirme projesinin tüm teslimleri'), SELF('Projeyi Power BI Desktop’ta kendi bilgisayarımda baştan kurdum', 'Uygulamadaki simülasyonlar yetmez; gerçek araçta en az bir kez uçtan uca kur.'), SELF('Projemi 3 dakikada sesli anlatabiliyorum', 'Bulgu → kanıt → öneri sırasıyla, bir arkadaşına ya da kayda alarak.')]
  },
  analist: {
    title: 'Power BI Veri Analisti', who: 'Raporlama, satış, finans ya da operasyon ekibinde veriyle çalışıp karar destek raporları hazırlamak isteyenler için.', jobs: ['Veri analisti', 'Raporlama uzmanı', 'BI analisti'], level: 'Temel → Orta (+ seçili İleri)',
    long: 'İş ilanlarında en çok istenen beceriler bu öğrenme yolunda: SQL ile kaynağı sorgulamak, Power Query ile temizlemek, yıldız şema, DAX, doğru görsel ve hikâye, paydaşla çalışmak, rapor kalitesi ve portföy. Gerçek vaka çalışmalarıyla ve bir portföy projesiyle biter.',
    outcomes: ['Bir iş talebini netleştirip tek sayfalık brife ve ölçülebilir KPI’lara çeviririm.', 'SQL ile kaynaktan veri çeker, Power Query ile temizleyip modele hazırlarım.', 'Yıldız şema kurar, CALCULATE ve zaman zekâsıyla “geçen yıla göre, hedefe göre, paya göre” sorularını cevaplarım.', 'Yöneticinin bir bakışta anladığı, detaya inilebilen etkileşimli raporlar tasarlarım.', 'Rapordaki sayıları kaynakla mutabık kılar, ölçüleri test eder ve belgelerim.', 'Bulgularımı yöneticiye cevap → kanıt → öneri sırasıyla sunarım.', 'Raporu yayımlar, paylaşır, abonelik ve uyarı kurarım.'],
    cap: { title: 'Satış performansı ve müşteri raporu (portföy projesi)', brief: 'Satış direktörü, hedefe göre neden geride kalındığını ve hangi müşteri gruplarının kaybedildiğini soruyor. Bir haftalık süre içinde iki sayfalık bir rapor ve beş maddelik bir bulgu notu hazırla.', data: DATA,
      steps: ['Talebi netleştir: direktöre soracağın 5 soruyu ve brifi yaz.', 'Veriyi hazırla ve modeli kur; SQL ile yazsaydın hangi sorguyu yazacağını da not et.', 'Ölçüleri yaz: net satış, hedef, hedef gerçekleşme %, YoY, pay, yeni / kayıp müşteri.', 'Sayfa 1: hedef ve trend (yönetici özeti). Sayfa 2: kategori, kanal ve müşteri kırılımı, detay sayfası.', 'Rakamları kaynakla mutabık kıl (aylık toplamlar, satır sayıları).', 'Beş maddelik bulgu notu ve öneri yaz; raporu yayımla ve paylaşım yöntemini seç.'],
      check: ['Brif ve KPI tanımları', 'Temiz model ve tarih tablosu', 'En az 8 doğru ve biçimli ölçü', 'İki rapor sayfası + detay sayfası', 'Mutabakat kontrolü yapıldı', 'Bulgu notu (5 madde) ve öneri', 'README ve ekran görüntüleri portföyde'],
      rubric: RUB_BASE, present: PRESENT },
    ready: [L('Veri hazırlama ve modelleme dersleri', ['pq-temel', 'pq-donusum', 'pq-orta', 'model-temel', 'tarih-tablosu', 'sql-analist'], 'SQL, Power Query, yıldız şema.'), L('DAX çekirdeği', ['baglam', 'calculate', 'iteratorler', 'zaman', 'filter-all', 'siralama'], 'Bağlam, CALCULATE, zaman zekâsı, pay ve sıralama.'), L('Rapor tasarımı ve hikâye', ['gorsel-secimi', 'gorsel-ilkeler', 'etkilesim', 'hikaye', 'dashboard-tasarim'], 'Doğru görsel, etkileşim, yönetici özeti.'), L('İş becerileri', ['rapor-brifi', 'paydas-iletisim', 'kalite-test', 'karar-toplantisi'], 'Talep, paydaş, kalite, sunum.'), EXAM('DAX kodlama sınavı (temel) en az %75', 'kod-a', 75, 'Süreli, DAX yazarak.', ['sinav', null, 'Sınavlar']), EXAM('Seviye sınavı: Orta en az %70', 'sv-b', 70, 'Orta seviyenin kapsamlı tekrarı.', ['sinav', null, 'Sınavlar']), L('En az iki vaka çalışması', ['vaka-satis', 'vaka-kiyaslama'], 'Gerçek bir iş sorusunu uçtan uca çözmek.'), CAP('Portföy projesinin tüm teslimleri'), SELF('Projeyi Power BI Desktop’ta kendim kurdum ve yayımladım', 'Kişisel çalışma alanına yayımla; iş ya da okul hesabın yoksa yayımlama planını yaz. Gerçek şirket verisini asla “Web’de yayımla” ile paylaşma.'), SELF('CV’me ölçülebilir sonuçlu 3 madde yazdım', 'Portföy ve kariyer dersindeki formülle.', ['lesson', 'portfoy-kariyer', 'Derse git'])]
  },
  pl300: {
    title: 'PL-300 Sertifika Hazırlığı', who: 'Microsoft Power BI Data Analyst Associate sertifikasını almak isteyenler için; 20 Nisan 2026 beceri listesine göre.', jobs: ['Sertifikalı veri analisti'], level: 'Temel → Orta (+ yönetim)',
    long: 'Sınavın dört alanı (veriyi hazırla, modelle, görselleştir ve analiz et, yönet ve güvenli hâle getir) ders ders kapsanır. Sınav tarzı sorular, vaka çalışmaları, seri sorular ve arayüz tıklama sorularıyla deneme sınavlarına hazırlanırsın.',
    outcomes: ['Sınavın dört alanındaki her beceriyi Power BI’da uygulayarak gösteririm.', 'Depolama modu, gizlilik düzeyi, sorgu katlama gibi sık sorulan kararları gerekçesiyle veririm.', 'CALCULATE, zaman zekâsı ve yarı toplanabilir ölçüleri sınav senaryolarında doğru seçerim.', 'Rapor etkileşimlerini, yer işaretlerini, detay sayfalarını ve erişilebilirliği kurarım.', 'Çalışma alanı rolleri, uygulama, RLS ve duyarlılık etiketleriyle içeriği güvenle dağıtırım.', 'Deneme sınavlarında 1000 üzerinden 700’ün üzerinde puan alırım.'],
    cap: { title: 'Sınav provası: dört alanı kapsayan mini proje', brief: 'Sınavdaki her alandan en az bir görevi kendi elinle yap: bu, ezberlediğin cevapları gerçek beceriye çevirir.', data: DATA,
      steps: ['Hazırla: iki kaynağı birleştir (ekle ve birleştir), bir sütunu özetten çıkar, veri türlerini düzelt, profili incele.', 'Modelle: yıldız şema, rol oynayan tarih, yarı toplanabilir stok ölçüsü, hesaplama grubu ile YTD/PY.', 'Görselleştir: yer işareti + düğme ile görünüm değiştir, araç ipucu sayfası, detay sayfası, mobil düzen.', 'Yönet: RLS rolü, çalışma alanı rolleri, uygulama ile dağıtım ve zamanlanmış yenileme ayarlarını yaz.'],
      check: ['Hazırla görevleri', 'Modelle görevleri', 'Görselleştir görevleri', 'Yönet görevleri', 'Kapsama haritasında tüm maddeleri çalıştım'], rubric: null, present: null },
    ready: [L('Veriyi hazırla alanı dersleri', ['veri-alma', 'pq-temel', 'pq-donusum', 'pq-orta', 'pq-model', 'veri-baglantilari'], '%25–30'), L('Modelle alanı dersleri', ['model-temel', 'tarih-tablosu', 'calculate', 'zaman', 'rol-oynayan', 'yari-toplanabilir', 'hesaplama-gruplari', 'performans'], '%25–30'), L('Görselleştir ve analiz et alanı dersleri', ['gorsel-secimi', 'etkilesim', 'hikaye', 'analiz-ozellikleri', 'mobil-erisilebilirlik', 'copilot'], '%25–30'), L('Yönet ve güvenli hâle getir alanı dersleri', ['yayinlama', 'yonetisim', 'guvenlik'], '%15–20'), EXAM('Kısa PL-300 denemesinde en az %70', 'pl300k', 70, '20 soru, 40 dakika.', ['sinav', null, 'Sınavlar']), EXAM('Tam PL-300 denemesinde en az 700', 'pl300', 70, 'Gerçek sınav süresi ve bölümleriyle.', ['sinav', null, 'Sınavlar']), CAP('Sınav provası mini projesi'), SELF('Microsoft Learn’ün ücretsiz uygulama değerlendirmesini (Practice Assessment) çözdüm', 'Gerçek sorulara en yakın resmî kaynak; sonucu buradaki denemelerle karşılaştır.'), SELF('Sınav arayüzü deneyimini (Exam Sandbox) denedim', 'Soru tiplerine ve gezinmeye sınav gününden önce alış.')]
  },
  gelistirici: {
    title: 'Power BI / BI Geliştirici', who: 'Analist olarak başlayıp kurumsal modeller, ileri DAX, performans, güvenlik ve dağıtımla uğraşmak isteyenler için.', jobs: ['Power BI geliştirici', 'BI geliştirici', 'Analitik mühendisi'], level: 'Orta → İleri',
    long: 'İlanlarda “ileri DAX, veri modelleme, performans, RLS, Git ve dağıtım işlem hatları” diye geçen her şey: bağlam geçişi, tablo ve pencere fonksiyonları, UDF, hesaplama grupları, VertiPaq ve optimizasyon, kurumsal model, PBIP/Git, gömme ve REST API, Fabric ile veri hazırlama.',
    outcomes: ['Birden fazla olgu tablosu, farklı ayrıntı düzeyleri ve çoka çok ilişkiler içeren modeller tasarlarım.', 'Bağlam geçişini, tablo ve pencere fonksiyonlarını kullanarak karmaşık iş kurallarını DAX’a dökerim.', 'DAX Studio ve Performans Analizi ile darboğazı bulur, model ve ölçüyü hızlandırırım.', 'Statik ve dinamik RLS, OLS ve çalışma alanı güvenliğini kurar ve test ederim.', 'Projeyi PBIP/TMDL olarak Git’te tutar, dağıtım işlem hatlarıyla ortamlar arasında taşırım.', 'Raporu uygulamalara gömer, yenileme ve dağıtımı REST API ile otomatikleştiririm.', 'Rapor kalitesini test sayfaları ve mutabakatla güvenceye alır, belgelerim.'],
    cap: { title: 'Kurumsal satış modeli: performans, güvenlik ve sürüm kontrolü', brief: 'Şirket tek bir onaylı satış anlam modeline geçmek istiyor. Model çok sayıda raporu besleyecek; hızlı, güvenli, belgelenmiş ve sürüm kontrollü olmalı.', data: DATA,
      steps: ['Gereksinimleri yaz: hangi raporlar, hangi roller, hangi yenileme sıklığı.', 'Modeli tasarla: olgu ve boyutlar, hedefler için farklı ayrıntı düzeyi, rol oynayan tarih, görünürlük ve klasörler.', 'Hesaplama grubu (YTD, PY, YoY %) ve dinamik biçim dizeleri; tekrar eden mantık için bir UDF.', 'Dinamik RLS: temsilci kendi müşterilerini, bölge müdürü bölgesini görür.', 'Test sorguları (DAX sorgu görünümünde EVALUATE) ve mutabakat sayfası.', 'Performans: en yavaş üç ölçüyü DAX Studio ile ölç, iyileştir, önce/sonra yaz.', 'PBIP olarak Git’e koy; geliştirme → test → üretim dağıtım planını yaz.'],
      check: ['Gereksinim belgesi', 'Model diyagramı ve ayrıntı düzeyi açıklaması', 'Hesaplama grubu ve UDF', 'Dinamik RLS ve test senaryoları', 'Test sorguları ve mutabakat', 'Performans önce/sonra ölçümü', 'PBIP + Git + dağıtım planı', 'README ve mimari çizimi'],
      rubric: [['Model', 'Doğru çalışıyor', 'Ayrıntı düzeyleri ve ilişkiler gerekçeli', 'Ölçeklenebilir: bileşik model, toplamalar ya da Direct Lake değerlendirilmiş'], ['DAX', 'Doğru sonuç', 'Okunur, VAR’lı, tekrar yok', 'Ölçülmüş performans, hesaplama grubu ve UDF ile sade'], ['Güvenlik', 'RLS var', 'Dinamik RLS test edilmiş', 'OLS ve çalışma alanı rolleriyle bütünlüklü'], ['Yaşam döngüsü', 'Dosya yedekli', 'PBIP + Git', 'Dağıtım işlem hattı, sürüm notları, etki analizi']], present: PRESENT },
    ready: [L('İleri DAX', ['baglam-gecisi', 'tablo-fonk', 'pencere', 'dax-udf', 'dax-sorgu'], 'Bağlam geçişi, tablo ve pencere fonksiyonları, UDF.'), L('İleri modelleme ve performans', ['model-ileri', 'hesaplama-gruplari', 'performans', 'dax-opt', 'kurumsal-model'], 'Hesaplama grupları, VertiPaq, kurumsal model.'), L('Güvenlik, yaşam döngüsü ve otomasyon', ['guvenlik', 'yayinlama', 'yonetisim', 'yasam-dongusu', 'embed-api'], 'RLS/OLS, Git, dağıtım işlem hatları, API.'), L('Kalite ve veri tarafı', ['sql-analist', 'kalite-test', 'veri-akislari'], 'SQL, test ve paylaşılan modeller.'), EXAM('DAX kodlama sınavı (ileri) en az %75', 'kod-c', 75, 'Süreli, ileri seviye DAX görevleri.', ['sinav', null, 'Sınavlar']), EXAM('Seviye sınavı: İleri en az %70', 'sv-c', 70, '', ['sinav', null, 'Sınavlar']), { t: 'DAX Arena’da 500 puan', arena: 500, d: 'Zor meydan okumalarla.', go: ['arena', null, 'Arena'] }, CAP('Kurumsal model projesinin tüm teslimleri'), SELF('DAX Studio’yu kendi bilgisayarımda kurup bir sorguyu ölçtüm', 'Sunucu zamanlamaları ve formül motoru / depolama motoru ayrımı.'), SELF('Projemi Git deposunda README ile yayınladım', 'Şirket verisi değil, uygulamanın örnek verisiyle.')]
  },
  dax: {
    title: 'DAX Ustalığı', who: 'Power BI’ı kullanan ama DAX’ta takılan analistler ve geliştiriciler için: yalnızca DAX, ilk SUM’dan kurumsal kalıplara.', jobs: ['Power BI geliştirici', 'Kıdemli analist'], level: 'Temel → İleri',
    long: 'Filtre ve satır bağlamı, CALCULATE’in kuralları, genişletilmiş tablolar, bağlam geçişi, tablo ve pencere fonksiyonları, zaman zekâsı, UDF, hesaplama grupları, istatistik, müşteri analitiği ve finans kalıpları, optimizasyon ve test.',
    outcomes: ['Bir ölçünün her hücrede neden o sonucu verdiğini filtre bağlamıyla açıklarım.', 'CALCULATE, ALL ailesi ve KEEPFILTERS’ı doğru seçer; bağlam geçişini önceden görürüm.', 'Sanal tablolar, TREATAS ve pencere fonksiyonlarıyla karmaşık iş kurallarını yazarım.', 'Zaman zekâsını standart ve standart dışı takvimlerle kurarım.', 'Kohort, RFM, ABC, Top N + Diğer gibi kalıpları sıfırdan yazarım.', 'Yavaş ölçüyü ölçer, yeniden yazar, test sorgularıyla doğrularım.'],
    cap: { title: 'DAX kalıp kütüphanesi: 15 ölçülük test edilmiş paket', brief: 'Ekibin tekrar tekrar sorduğu soruları tek bir ölçü paketiyle çöz: her ölçünün tanımı, kodu, testi ve bilinen sınırları olsun.', data: DATA,
      steps: ['15 iş sorusunu seç (pay, sıra, YoY, YTD, hareketli ortalama, yeni/kayıp müşteri, kohort, ABC, Top N + Diğer, bütçe sapması…).', 'Her biri için ölçüyü yaz; VAR ile okunur yap, biçim dizesini ayarla.', 'Her ölçü için EVALUATE ile en az iki test yaz (toplam ve bir kırılım).', 'Toplam satırında ve boş değerlerde davranışı not et.', 'En yavaş iki ölçüyü yeniden yaz ve süreyi karşılaştır.'],
      check: ['15 ölçü yazıldı', 'Her ölçünün tanımı ve sınırları yazıldı', 'Her ölçü için test sorguları', 'Toplam satırı ve BLANK davranışı kontrol edildi', 'İki ölçü optimize edildi'], rubric: null, present: PRESENT },
    ready: [L('Bağlamlar ve CALCULATE', ['baglam', 'calculate', 'iteratorler', 'filter-all', 'baglam-gecisi'], ''), L('Tablo, pencere ve zaman', ['tablo-fonk', 'pencere', 'zaman', 'zaman-ileri', 'dax-udf'], ''), L('İş kalıpları', ['musteri-analitigi', 'segmentasyon', 'ileri-kaliplar', 'finans'], ''), L('Optimizasyon ve test', ['dax-opt', 'kalite-test'], ''), EXAM('DAX kodlama sınavı (ileri) en az %75', 'kod-c', 75, '', ['sinav', null, 'Sınavlar']), { t: 'DAX Arena’da 500 puan', arena: 500, d: '', go: ['arena', null, 'Arena'] }, CAP('Kalıp kütüphanesinin tüm teslimleri')]
  },
  dp600: {
    title: 'Fabric Analitik Mühendisi (DP-600)', who: 'Power BI’ın ötesine geçip Microsoft Fabric’te lakehouse, ambar, gerçek zamanlı analitik ve kurumsal anlam modelleriyle çalışmak isteyenler için.', jobs: ['Analitik mühendisi', 'Fabric geliştirici', 'BI mimarı'], level: 'Orta → İleri',
    long: 'Fabric hazırlığı dört alanı birleştirir: çözüm yönetimi, veriyi hazırlama ve sunma, anlam modeli, veri keşfi ve analizi. Tarayıcıda kavramları çalış, gerçek Fabric uygulamasını ayrı kanıtla.',
    outcomes: ['Bir ihtiyaç için lakehouse, ambar ya da eventhouse arasında gerekçeli seçim yaparım.', 'T-SQL görünümleri, not defterleri, veri akışları ve işlem hatlarıyla veriyi hazırlarım.', 'Fabric’te yıldız şema, SCD ve köprü tabloları kurarım.', 'Direct Lake modeli tasarlar, geri dönüş (fallback) ve yenileme davranışını yönetirim.', 'KQL ile gerçek zamanlı veriyi sorgular ve panolara bağlarım.', 'Çalışma alanını Git, dağıtım işlem hatları ve etki analiziyle yönetirim.'],
    cap: { title: 'Fabric uçtan uca: lakehouse → ambar → Direct Lake raporu', brief: 'Anadolu Market satış verisini Fabric’e taşı: ham veriyi lakehouse’a al, ambar katmanında yıldız şemayı kur, Direct Lake anlam modeli ve rapor yayımla.', data: DATA + ' Fabric deneme kapasitesi ya da şirketinin geliştirme çalışma alanı gerekir.',
      steps: ['Mimariyi çiz: bronz / gümüş / altın katmanlar ve hangi öğenin nerede durduğu.', 'CSV’leri lakehouse’a yükle; bir not defteriyle temizle (tekrarlar, boşlar, türler).', 'Ambarda boyut ve olgu tablolarını T-SQL ile oluştur; müşteri boyutu için SCD Tip 2.', 'Direct Lake anlam modeli: ilişkiler, ölçüler, hesaplama grubu, RLS.', 'Bir işlem hattıyla yüklemeyi zamanla; hata durumunda uyarı kur.', 'Çalışma alanını Git’e bağla, dağıtım işlem hattı planını yaz.'],
      check: ['Mimari çizim', 'Lakehouse yükleme ve temizlik not defteri', 'Ambarda yıldız şema ve SCD2', 'Direct Lake modeli ve rapor', 'İşlem hattı tasarımı ve varsa çalıştırma kaydı', 'Git + dağıtım planı'], rubric: null, present: PRESENT },
    ready: [
      dpArea(0, ['calisma-alani', 'guvenlik', 'yonetisim', 'yasam-dongusu']),
      dpArea(1, ['fabric-giris', 'fabric-veri-alma', 'fabric-tsql-odev', 'fabric-spark-odev', 'fabric-yildiz']),
      dpArea(2, ['kurumsal-model', 'fabric-anlam-modeli', 'hesaplama-gruplari', 'dax-opt']),
      dpArea(3, ['sql-analist', 'kql-gercek-zaman', 'dax-sorgu']),
      EXAM('Kesit DP-600 denemesinde en az %70', 'dp600', 70, 'Bu oran uygulama içi hazırlık hedefidir.', ['sinav', null, 'Sınavlar']),
      CAP('Fabric uçtan uca projesinin tüm teslimleri'),
      SELF('Fabric ortamında lakehouse ve ambarı kurdum', 'Tasarım notuna ek olarak gerçek çalıştırma kaydını sakla.'),
    ]
  },
  yonetici: {
    title: 'Excel’den Power BI’a', who: 'Pivot tablo ve formüllerle rapor hazırlayan raporlama, finans ve satış operasyon ekipleri için hızlı geçiş.', jobs: ['Raporlama uzmanı', 'Finansal analist', 'Satış operasyon'], level: 'Temel → Orta',
    long: 'Excel’de bildiğin her şeyin Power BI karşılığı: Power Query ile tekrar eden temizlik, VLOOKUP yerine ilişkiler, pivot yerine ölçüler, grafik yerine etkileşimli rapor. Excel ile birlikte çalışmayı, veri okuryazarlığını ve yöneticiye sunmayı da öğrenirsin.',
    outcomes: ['Her ay elle yaptığım Excel temizliğini Power Query’de bir kez kurup otomatikleştiririm.', 'VLOOKUP’lı dev tablolar yerine ilişkili bir model kurarım.', 'Pivot tablodaki hesapları ölçülere çeviririm; YTD ve geçen yıl karşılaştırmasını yaparım.', 'Excel’de analiz et ile Power BI modelini Excel’den kullanırım.', 'Yöneticiye etkileşimli, tek sayfalık bir rapor sunarım.'],
    cap: { title: 'Aylık Excel raporunu otomatikleştir', brief: 'Her ay iki gün süren satış raporunu Power BI’a taşı: aynı sayılar, otomatik yenileme, etkileşimli görünüm.', data: DATA,
      steps: ['Bugünkü Excel raporunun sayfalarını ve formüllerini listele.', 'Power Query ile kaynakları birleştir ve temizle.', 'Modeli kur, pivottaki hesapları ölçüye çevir.', 'Excel raporundaki sayılarla mutabakat yap.', 'Tek sayfalık rapor ve Excel’de analiz et bağlantısı.'],
      check: ['Eski rapor envanteri', 'Power Query adımları', 'Ölçüler', 'Mutabakat', 'Rapor ve Excel bağlantısı'], rubric: null, present: PRESENT },
    ready: [L('Temel dersler', ['pq-temel', 'model-temel', 'dax-giris', 'toplama', 'excel-entegrasyon'], ''), L('Raporlama', ['bicim-temel', 'filtreler', 'calculate', 'zaman', 'dashboard-tasarim'], ''), EXAM('Seviye sınavı: Temel en az %70', 'sv-a', 70, '', ['sinav', null, 'Sınavlar']), CAP('Otomasyon projesinin tüm teslimleri'), SELF('Gerçek bir Excel raporumu Power BI’a taşıdım', 'Şirket kurallarına uyarak.')]
  },
  'is-analisti': {
    title: 'BT İş Analisti için Power BI', who: 'Rapor talebi toplayan, gereksinim yazan ve raporu kabul eden iş analistleri için. Önce Kesit SQL’deki BT İş Analisti yolunun SQL bölümünü bitirmeni öneririz.', jobs: ['BT iş analisti', 'İş analisti', 'Ürün ve süreç analisti'], level: 'Temel → Orta',
    long: 'Rapor geliştiricisi olmak için değil, geliştiriciyle aynı dili konuşmak için: yıldız şemayı ve ölçüleri okumak, CALCULATE ve zaman zekâsı ifadelerinin ne yaptığını anlamak, talebi rapor brifine ve KPI tanımına çevirmek, raporu mutabakat ve kabul testiyle teslim almak, yayımlamanın ve paylaşmanın kavramlarını bilmek. Bu 18 ders tek başına bir işe hazırlamaz; iş analistliğinin kendisi Kesit SQL’deki yolda anlatılır.',
    outcomes: ['Bir rapor talebini kitle, karar ve KPI listesi olan tek sayfalık brife çeviririm.', 'Her KPI için tanım kartı yazarım: formül, kapsam, kaynak, sahip, hedef.', 'Model görünümünü okur, bir ölçünün hangi ayrıntı düzeyinde çalıştığını sorarım.', 'CALCULATE, VAR ve zaman zekâsı içeren bir ölçünün ne hesapladığını okuyup açıklarım.', 'Raporu kaynakla mutabık kılar, kabul kriterlerine göre test eder ve kaydederim.', 'Çalışma alanı, uygulama, yenileme ve RLS kavramlarını gereksinime yazabilecek kadar bilirim.'],
    cap: {
      title: 'Depo Sevkiyat Kontrolü: gereksinim ve UAT',
      progressKey: 'is-analisti-wms-sevkiyat',
      brief: 'Bursa ve Gebze depo ekipleri vardiya devrinde açık geciken sevkiyatları ve istisna nedenlerini tek raporda görmek istiyor. Operasyon müdürü depoları karşılaştıracak, vardiya sorumlusu müdahale sırasını belirleyecek. Geliştiriciye verilecek brifi yaz ve rapor kabulünü planla.',
      data: '18 sentetik WMS kaydı. Her satır bir sevkiyat. Gözlem anı 17 Ekim 2026, 12.00 Türkiye saati. Depo, kanal ve tarih filtreleri planlanan çıkışa göre uygulanır.',
      download: 'veri/wms-sevkiyat/sevkiyat.csv',
      downloadLabel: 'Sentetik sevkiyat verisini indir (.csv)',
      caseGuide: 'veri/wms-sevkiyat/BRIF-UAT.md',
      steps: [
        'Brifi yaz: karar sahibi, vardiya devri, planlanan tarih/depo/kanal filtreleri ve açık geciken sevkiyatların detay listesi.',
        'Beş KPI kartı oluştur: planlanan sevkiyat, çıkışı yapılan, zamanında çıkış oranı, açık geciken ve istisnalı sevkiyat. Kaynak alanı, pay/payda ve kapsam kurallarını yaz.',
        'Filtresiz ve Bursa 16 Ekim sonuçlarını CSV’den hesapla. Tam saatinde ve bir saniye geç çıkışı, iptali, boş paydayı ve açık gecikme sınırını test et.',
        'UAT kaydına beklenen, gerçekleşen, kanıt, durum ve hata notunu ekle. Çalışan rapor veya yetkili ortam yoksa ilgili kontrolü bekliyor olarak bırak.',
        'Erişim ve yenileme gereksinimini yaz. Kanıta göre kabul, koşullu kabul veya ret kararı ver ve açık bulgu için sorumlu belirle.',
      ],
      check: ['Rapor brifi ve filtre eşlemesi', 'Beş KPI tanım kartı', 'Sınır ve veri kalite kabul kriterleri', 'UAT matrisi ve kaynak mutabakatı', 'Yayım gereksinimi ve kabul kararı'],
      rubric: [
        ['KPI kapsamı', 'Beş tanım ve kaynak alanı var', 'İptal, gözlem anı ve boş payda kuralları açık', 'Sınır sonuçları satır kimlikleriyle izlenebilir'],
        ['Kabul testi', 'Filtresiz ve birleşik filtreli beklenenler var', 'Beklenen, gerçekleşen ve kanıt ayrı', 'Kaynak hatası ve erişim testi de ayrı statüde'],
      ],
    },
    ready: [L('Modeli ve ölçüleri okumak', ['model-temel', 'dax-giris', 'baglam', 'calculate', 'var-mantik', 'zaman'], ''), L('Gereksinim ve KPI', ['rapor-brifi', 'dashboard-kavramlar', 'veri-okuryazarligi'], ''), L('Kabul ve yayım', ['kalite-test', 'yayinlama', 'paydas-iletisim'], ''), CAP('Gereksinim ve kabul paketinin tüm teslimleri')]
  },
  karar: {
    title: 'Yönetici ve Karar Verici', who: 'Rapor geliştirmeyecek ama her gün rapor kullanan, ekibinden rapor isteyen ve veriyle karar alan yöneticiler için.', jobs: ['Yönetici', 'Ekip lideri', 'İş birimi sorumlusu'], level: 'Temel → Orta',
    long: 'Power BI Service’te gezinmekten raporu doğru okumaya, veri okuryazarlığından doğru rapor talebine, karar toplantısından BI ekibini ve ortamını yönetmeye kadar.',
    outcomes: ['Raporlarda gezinir, filtreler, detaya iner, abonelik ve uyarı kurarım.', 'Ortalama ile medyan, yüzde ile puan farkı, korelasyon ile nedensellik tuzaklarını fark ederim.', 'Ekibimden ne istediğimi brif ve KPI tanımıyla açıkça yazarım.', 'Toplantıda kırmızı bir KPI’dan nedenine üç tıklamada inerim ve kararı sahibiyle tarihiyle bağlarım.', 'BI ortamında lisans, yönetişim ve benimseme kararlarını bilgiyle veririm.'],
    cap: { title: 'Bir karar toplantısı hazırla', brief: 'Bir sonraki ay toplantısı için satış raporunu kullanarak üç karar önerisi hazırla.', data: 'Uygulamadaki Örnek raporlar bölümü ve vaka çalışmaları.',
      steps: ['Satış ve hedef raporunu incele; üç kırmızı ya da sarı göstergeyi seç.', 'Her biri için “neye göre?” sorusunu cevapla ve nedenine in.', 'Her bulguya bir karar, sahip ve tarih yaz.', 'Ekibinden bir sonraki ay için iyileştirme talebini brif olarak yaz.'],
      check: ['Üç bulgu', 'Her bulgunun kanıtı', 'Karar, sahip, tarih', 'Rapor iyileştirme brifi'], rubric: null, present: null },
    ready: [L('Rapor kullanımı', ['hizmet-kullanici', 'excel-entegrasyon', 'filtreler'], ''), L('Veri okuryazarlığı ve karar', ['veri-okuryazarligi', 'dashboard-kavramlar', 'karar-toplantisi', 'ayristirma-etkileyen'], ''), L('Talep ve yönetim', ['rapor-brifi', 'paydas-iletisim', 'bi-yonetimi'], ''), CAP('Karar toplantısı hazırlığının tüm teslimleri')]
  },
  hizli: {
    title: 'Bir Günde Başla', who: 'Zamanı kısıtlı olanlar için: bir günde ilk modelinden ilk raporuna.', jobs: ['Başlangıç'], level: 'Temel', pick: true,
    long: 'En kısa yoldan, kendi başına bir rapor kurabilecek kadar Power BI. Bitince Veri Analisti ya da Excel’den Power BI’a yoluyla devam et.',
    outcomes: ['Power BI Desktop ve Service’te yolumu bulurum.', 'Veriyi yükler, basit bir model kurarım.', 'İlk ölçülerimi yazar, tek sayfalık bir rapor hazırlarım.'],
    cap: { title: 'İlk raporun', brief: 'Kategori ve aya göre satışları gösteren tek sayfalık bir rapor hazırla.', data: DATA, steps: ['Veriyi yükle', 'İlişkileri kur', 'Net satış ve YoY ölçülerini yaz', 'Üç görsel ve bir dilimleyici ekle'], check: ['Model', 'İki ölçü', 'Tek sayfalık rapor'], rubric: null, present: null },
    ready: [L('Tüm dersler', null, ''), CAP('İlk rapor')]
  },
  mulakat: {
    title: 'Mülakat Hazırlığı', who: 'Veri analisti ve BI geliştirici mülakatlarına girecekler için: kavram soruları, canlı DAX, vaka anlatımı, portföy.', jobs: ['Veri analisti', 'BI geliştirici'], level: 'Orta → İleri',
    long: 'Mülakatçının sorduğu kavramlar (bağlam, CALCULATE, model, performans, güvenlik), canlı DAX provası, SQL, vaka ve portföy anlatımı, ev ödevi ve davranışsal sorular.',
    outcomes: ['En sık sorulan kavram sorularını örnekle ve kısa cevaplarım.', 'Canlı DAX sorusunda düşüncemi sesli anlatarak doğru ölçüyü yazarım.', 'Bir projemi STAR yöntemiyle 3 dakikada anlatırım.', 'Ev ödevi vakasını süresinde ve belgeleyerek teslim ederim.'],
    cap: { title: 'Mülakat simülasyonu', brief: 'Kendini gerçek bir mülakata hazırla: kavram, canlı kod, vaka ve davranışsal turlar.', data: 'Uygulamadaki Mülakat bölümü.',
      steps: ['Soru bankasından 20 soruyu sesli cevapla ve kendini puanla.', 'Mülakat simülasyonu sınavını çöz.', 'Ev ödevi vakasını süre tutarak yap.', '3 STAR hikâyesi yaz.'],
      check: ['20 soru sesli cevaplandı', 'Mülakat simülasyonu', 'Ev ödevi', '3 STAR hikâyesi'], rubric: null, present: null },
    ready: [L('Kavram dersleri', ['baglam', 'calculate', 'filter-all', 'baglam-gecisi', 'performans', 'guvenlik'], ''), L('SQL ve iş becerileri', ['sql-analist', 'paydas-iletisim', 'kalite-test', 'portfoy-kariyer'], ''), EXAM('Mülakat simülasyonunu geç', 'mulakat', 70, '', ['sinav', null, 'Sınavlar']), { t: 'Soru bankasında 20 soruyu “hazırım” işaretle', iv: 20, d: '', go: ['iv', null, 'Mülakat'] }, CAP('Simülasyonun tüm teslimleri')]
  },
  vaka: {
    title: 'Vaka Çalışmaları', who: 'Konuları öğrendikten sonra gerçek iş sorularıyla prova yapmak ve portföy oluşturmak isteyenler için.', jobs: ['Veri analisti', 'BI analisti'], level: 'Orta → İleri',
    long: 'Satış, müşteri kaybı, İK, stok, tedarik, e-ticaret, kıyaslama, pazar payı, kredi portföyü ve finans: her vaka brif, model, ölçüler, modelden hesaplanmış bulgular, rapor taslağı ve öneriyle biter.',
    outcomes: ['Bir iş sorusunu analiz planına çeviririm.', 'Farklı sektör sorularında doğru KPI’ları seçerim.', 'Bulguyu kanıtıyla ve önerisiyle sunarım.', 'En iyi iki vakamı portföyüme koyarım.'],
    cap: { title: 'Kendi vakan: sektör seç, uçtan uca çöz', brief: 'Vaka derslerinin yapısını kullanarak kendi sorunu seç ve aynı beş adımla çöz.', data: DATA,
      steps: ['Soru ve brif', 'Veri ve model', 'Analiz adımları ve ölçüler', 'Rapor sayfası taslağı', 'Bulgu özeti ve öneri'], check: ['Brif', 'Model', 'Ölçüler', 'Rapor', 'Bulgular ve öneri'], rubric: RUB_BASE, present: PRESENT },
    ready: [L('En az 6 vaka', ['vaka-satis', 'vaka-kiyaslama', 'vaka-pazar', 'vaka-stok', 'vaka-kayip', 'vaka-eticaret'], ''), L('Sunum ve portföy', ['karar-toplantisi', 'portfoy-kariyer'], ''), CAP('Kendi vakanın tüm teslimleri')]
  }
};
/* Aşamalar (kilometre taşları): her aşama, patikadaki sırasına göre “to” dersine kadar olan dersleri kapsar */
const M = (t, to, d) => ({ t, to, d });
const MS = {
  profesyonel: [M('Power BI’ı tanı', 'excel-entegrasyon', 'Arayüz, hizmet, ilk rapor'), M('Veriyi hazırla ve modelle', 'tarih-tablosu', 'Power Query, yıldız şema'), M('İlk ölçüler ve rapor', 'filtreler', 'DAX’a giriş, görsel seçimi, brif'), M('DAX’ın kalbi', 'tema-sayfa', 'Bağlam, CALCULATE, zaman'), M('Veri tarafında derinleş', 'pq-ileri', 'SQL, birleştirme, veri akışları'), M('Pay, sıra ve iş kalıpları', 'model-ileri', 'ALL ailesi, RANKX, stok, hedef'), M('Rapor tasarımı ve hikâye', 'dashboard-tasarim', 'Etkileşim, analiz, kalite'), M('Analist olarak işte', 'portfoy-kariyer', 'Paydaş, vaka, portföy'), M('İleri DAX ve analitik', 'dax-sorgu', 'Bağlam geçişi, pencere, müşteri, finans'), M('Yayın, güvenlik, Fabric ve sınav', 'mulakat', 'Performans, RLS, yönetişim, PL-300'), M('Uzmanlık ve bitirme', 'final-hazirlik', 'Kurumsal model, optimizasyon, yaşam döngüsü')],
  analist: [M('Power BI’ı tanı', 'excel-entegrasyon'), M('Veriyi hazırla ve modelle', 'tarih-tablosu'), M('İlk ölçüler ve rapor', 'filtreler'), M('DAX çekirdeği', 'tema-sayfa'), M('Veri tarafı: SQL ve Power Query', 'pq-ileri'), M('Pay, sıra ve hedef', 'hedef'), M('Rapor tasarımı ve hikâye', 'kademeli-tasarim'), M('Analiz ve karar', 'copilot'), M('İşte: kalite, paydaş, vaka', 'portfoy-kariyer'), M('Müşteri analitiği ve bitirme', 'final-hazirlik')],
  pl300: [M('Başlangıç', 'excel-entegrasyon'), M('Veriyi hazırla I', 'pq-donusum'), M('Modelle I', 'hesap-tablolar'), M('Görselleştir I', 'filtreler'), M('Modelle II: CALCULATE ve zaman', 'kosullu-bicim'), M('Veriyi hazırla II', 'pq-ileri'), M('Modelle III', 'model-ileri'), M('Görselleştir ve analiz et II', 'dashboard-tasarim'), M('Yönet, güvenli hâle getir, sınav', 'pl300')],
  gelistirici: [M('Model ve DAX temeli', 'hesap-tablolar'), M('Bağlam ve CALCULATE', 'zaman'), M('Veri katmanı', 'veri-akislari'), M('İleri model kalıpları', 'model-ileri'), M('Ekip içinde çalışmak', 'portfoy-kariyer'), M('İleri DAX', 'dax-sorgu'), M('Güvenlik ve yönetim', 'bi-yonetimi'), M('Fabric ve kurumsal model', 'fabric-yildiz'), M('Yaşam döngüsü ve bitirme', 'final-hazirlik')],
  dax: [M('DAX temelleri', 'hesap-tablolar'), M('Bağlamlar', 'zaman'), M('Pay, sıra, ilişkiler', 'kalite-test'), M('İleri DAX', 'dax-udf'), M('İş kalıpları', 'finans-tablolar'), M('Kurumsal kalıplar ve optimizasyon', 'dax-opt')],
  dp600: [M('Hazırlık', 'kalite-test'), M('Anlam modelinde DAX', 'dax-sorgu'), M('Performans ve güvenlik', 'bi-yonetimi'), M('Fabric’te veri', 'kql-gercek-zaman'), M('Kurumsal model ve sınav', 'dp600')],
  yonetici: [M('Power BI’ı tanı', 'excel-entegrasyon'), M('Excel’den modele', 'toplama'), M('Raporu planla ve kur', 'filtreler'), M('Ölçüler ve biçim', 'hedef'), M('Rapor ve karar', 'dashboard-tasarim'), M('İşte uygulamak', 'portfoy-kariyer')],
  karar: [M('Raporu kullanmak', 'excel-entegrasyon'), M('Okuryazarlık ve talep', 'filtreler'), M('Karar ve ekip', 'paydas-iletisim'), M('Vakalar', 'vaka-kayip'), M('BI’ı yönetmek', 'bi-yonetimi')],
  hizli: [M('Tanış', 'excel-entegrasyon'), M('İlk model ve ölçü', 'zaman')],
  mulakat: [M('Model ve bağlam', 'zaman'), M('Sık sorulanlar ve iş becerileri', 'portfoy-kariyer'), M('İleri sorular ve prova', 'mulakat')],
  vaka: [M('Orta seviye vakalar', 'portfoy-kariyer'), M('İleri vakalar ve bitirme', 'final-hazirlik')]
};
Object.keys(MS).forEach(k => { if (W.PBI_ROLES[k]) W.PBI_ROLES[k].ms = MS[k]; });
/* “Tüm dersler” maddeleri: patikanın kendi dersleri; seviye maddeleri: o seviyedeki tüm dersler */
const T = W.PBI_TIER || (x => x);
const tierIds = t => (W.PBI_LESSONS || []).filter(l => T((W.PBI_LEVEL_OF || {})[l.id] || l.lv) === t).map(l => l.id);
const P0 = W.PBI_ROLES.profesyonel.ready; P0[0].lessons = tierIds('temel'); P0[1].lessons = tierIds('orta'); P0[2].lessons = tierIds('ileri');
const hz = (W.PBI_PATHS || []).find(p => p.id === 'hizli'); if (hz) W.PBI_ROLES.hizli.ready[0].lessons = hz.lessons.slice();
/* Üçüncü tur uzman dersleri ilgili patikalara, bağlı oldukları dersin arkasına eklenir */
const INS = { gelistirici: [['baglam-gecisi', 'genisletilmis-tablolar'], ['ileri-kaliplar', 'uzman-kaliplar'], ['model-ileri', 'coka-cok'], ['zaman-ileri', 'ozel-takvim'], ['kurumsal-model', 'buyuk-model']], dax: [['baglam-gecisi', 'genisletilmis-tablolar'], ['ileri-kaliplar', 'uzman-kaliplar'], ['zaman-ileri', 'ozel-takvim']], dp600: [['kurumsal-model', 'buyuk-model']], pl300: [['model-ileri', 'coka-cok']] };
(W.PBI_PATHS || []).forEach(p => (INS[p.id] || []).forEach(([after, id]) => { if (!(W.PBI_LESSONS || []).some(l => l.id === id) || p.lessons.includes(id)) return; const i = p.lessons.indexOf(after); p.lessons.splice(i < 0 ? p.lessons.length : i + 1, 0, id); }));
(W.PBI_PATHS || []).forEach(p => { const r = W.PBI_ROLES[p.id]; if (r && r.title) { p.short0 = p.name; p.name = r.title; } });
/* Öğrenme yollarındaki portföy görevleri; proje kontrol listesindeki eski sıra korunur. */
const EVIDENCE = {
  profesyonel: {
    environment: 'Power BI Desktop. Service yenileme ve yetki denetimi için ayrıca erişim gerekir.',
    task: 'Anadolu Market yönetim kokpitinde satış ve kârlılığı tek karar sorusuna bağla. Aynı aya ait kaynak toplamı ile rapor toplamını ve kategori filtresi altındaki sonucu karşılaştır.',
    hint: 'Sipariş satırı tane düzeyini yaz, tarih ve ürün boyutlarının ilişki yönünü kontrol et, ardından toplamı kaynakta ayrı hesapla.',
    transfer: 'Lezzet Kurye sipariş verisinde aynı model ve mutabakat akışını uygula. Net satış yerine 35 dakika teslimat SLA’sını tanımla; iade ve iptal kayıtlarının etkisini göster.',
    files: ['Rapor dosyası (.pbix veya .pbip proje klasörü)', 'Model şeması ve ölçü listesi', 'Filtreli ve filtresiz mutabakat tablosu'],
  },
  analist: {
    environment: 'Power BI Desktop ve ayrı bir CSV, SQL veya Excel kontrol hesabı.',
    task: 'Anadolu Market’te düşük marjı hangi ürün kategorilerinin sürüklediğini incele. İki bulgu için dönem, filtre, örneklem ve karşılaştırma değerini yaz.',
    hint: 'Marj yüzdesini satır oranlarının ortalaması yerine toplam kâr / toplam satış olarak yeniden hesapla.',
    transfer: 'Lezzet Kurye’de aynı analiz akışını ilçe bazında SLA uyumuna taşı. Az siparişli ilçeyi göster ve bu grupta önerinin ne kadar güvenilir olduğunu açıkla.',
    files: ['Rapor dosyası ve model şeması', 'Kaynak hesapları ile rapor sonuçlarının karşılaştırması', 'İki bulgu ve öneri'],
  },
  pl300: {
    environment: 'Power BI Desktop. Service çalışma alanı ve rol davranışı için ayrıca erişim gerekir.',
    task: 'Anadolu Market için CSV’yi temizle, yıldız şema ve ölçülerle bir rapor kur. Bir filtreli toplamı ve bir RLS rolünün görünür satırlarını kontrol et.',
    hint: 'Dört işi ayrı kaydet: hazırlama, modelleme, görselleştirme ve erişim. Rol testinde görünmemesi gereken bir örnek satır seç.',
    transfer: 'Pusula İK verisinde aynı akışı bölüm bazında uygula. Bölüm rolüyle başka bölümün kaydının görünmediğini test et.',
    files: ['Rapor dosyası ve Power Query adımları', 'Model şeması ve ölçüler', 'RLS rol ve beklenen/gerçek sonuç tablosu'],
  },
  gelistirici: {
    environment: 'Power BI Desktop ve Performans Çözümleyicisi. Dağıtım ve yetki testleri için erişilebilir bir geliştirme ortamı.',
    task: 'Anadolu Market modelinde yavaş bir görseli seç. Tek bir değişiklik yap, aynı filtreyle önce/sonra sürelerini ve ölçü sonucunu karşılaştır.',
    hint: 'Önce aynı filtreyi ve aynı ölçüyü sabitle. Bir kez ölçmek yerine birkaç tekrar kaydet ve önbellek koşulunu belirt.',
    transfer: 'Ilgaz Bank işlem verisinde aynı performans ölçüm planını çalıştır. Veri hacmi ve tane düzeyi değişince hangi model kararını değiştirdiğini açıkla.',
    files: ['Model ve ölçü değişiklikleri', 'Önce/sonra süre ve doğruluk ölçümleri', 'Dağıtım ve geri dönüş notu'],
  },
  dax: {
    environment: 'Tarayıcıda DAX alıştırması, gerçek model davranışı için Power BI Desktop.',
    task: 'Anadolu Market’te kategori payı ölçüsünü yaz. Genel toplam, seçili kategoriler ve tek kategori bağlamlarında paydanın nasıl değiştiğini göster.',
    hint: 'Ölçüyü yazmadan önce üç filtre bağlamı için elle beklenen pay ve paydayı yaz. ALL ile ALLSELECTED arasındaki farkı bu sonuçlardan incele.',
    transfer: 'Lezzet Kurye’de ilçe payını teslim edilen siparişlerle yeniden kur. İlçe filtresi varken tarih filtresinin paydada korunmasını test et.',
    files: ['DAX ölçüsü ve alternatif ifade', 'Üç bağlam için beklenen ve gerçekleşen sonuç', 'Payda davranışını açıklayan model notu'],
  },
  dp600: {
    environment: 'Tasarım tarayıcıda yapılabilir. Çalışan işlem hattı ve Direct Lake için Fabric çalışma alanı gerekir.',
    task: 'Anadolu Market’te ham dosyadan rapora tek akış tasarla. Her katmanın girişini, çıkışını ve yeniden çalıştırma koşulunu belirt.',
    hint: 'Lakehouse, ambar ve anlam modelinin sorumluluklarını bir çizimde ayır. Her geçişe bir satır sayısı kontrolü koy.',
    transfer: 'Kanat Havayolları uçuş verisini aynı akışa uyarla. Gecikme verisi geç geldiğinde hangi tablonun ve kontrolün yeniden çalışacağını göster.',
    files: ['Katman ve tablo şeması', 'Dönüşüm sorgusu veya not defteri', 'Tasarım kanıtı: doğrulama planı ve yeniden çalıştırma koşulu', 'Çalıştırma kanıtı: Fabric çalışma kimliği, sonuç ve mutabakat. Ortam yoksa bekliyor olarak kaydet.'],
  },
  yonetici: {
    environment: 'Kaynak karşılaştırması Excel veya CSV ile yapılabilir. Otomatik yenileme ve rapor için Power BI Desktop.',
    task: 'Anadolu Market aylık Excel özetindeki satış ve sipariş adedini Power BI raporuyla karşılaştır. Bir ay ve kategori filtresi altında fark varsa kaynağını bul.',
    hint: 'Excel ve Power BI’da aynı tarih aralığını, boş satır kuralını ve sipariş sayım yöntemini kullan.',
    transfer: 'Lezzet Kurye’de aynı kontrolü sipariş haftası ve restoran ilçesi için yap. Tüm siparişler ile yalnızca teslim edilen siparişleri ayrı say.',
    files: ['Power Query adımları ve model şeması', 'Eski/yeni rapor karşılaştırması', 'Yenileme adımları ve fark notu'],
  },
  'is-analisti': {
    environment: 'Brif ve UAT tasarımı ile kaynak mutabakatı CSV üzerinden yapılabilir. Çalışan raporun filtre ve erişim kabulü için Power BI ortamı gerekir.',
    task: 'Depo Sevkiyat Kontrolü için beş KPI kartı ve UAT matrisi hazırla. Tüm kayıtlar ile Bursa ve 16 Ekim seçildiğindeki beklenen değerleri CSV’den hesapla.',
    hint: 'İptalleri çıkar. Zamanında çıkış oranının paydasına yalnızca çıkışı yapılan sevkiyatları al. Tam plan saati ile bir saniye sonrasını ve boş paydayı ayrı test et.',
    transfer: 'Kanat Havayolları’nda 15 dakika uçuş gecikmesi için yeni KPI kartı ve iki UAT senaryosu yaz. Birim, iptal kapsamı ve veri kaynağına ilişkin kararları yeniden belirt.',
    files: ['Rapor brifi ve beş KPI kartı', 'WMS alan/filtre eşlemesi ve yayım gereksinimi', 'Beklenen, gerçekleşen ve kanıt alanları bulunan UAT matrisi'],
  },
  karar: {
    environment: 'Örnek raporlarla karar provası yapılabilir. Gerçek kurum raporu için yetkili erişim gerekir.',
    task: 'Satış hedefi sapmasında bir bölgeyi seç. Dönemi ve karşılaştırma tabanını yazarak karar önerisi, sorumlu ve yeniden ölçüm tarihini belirle.',
    hint: 'Yüzde ile yüzde puanı ayır. Tek bir kırmızı göstergeye bakmadan hacmi ve önceki dönemi birlikte kontrol et.',
    transfer: 'Lezzet Kurye’de düşük SLA uyumlu bir ilçe için aynı karar notunu yaz. Sipariş hacmini dikkate al ve nedeni doğrulamak için hangi ek veriyi isteyeceğini belirt.',
    files: ['Filtreler görünen rapor görüntüsü veya tablo', 'İki dönemin sayısal karşılaştırması', 'Sorumlusu ve kontrol tarihi olan karar notu'],
  },
  hizli: {
    environment: 'Tarayıcıda ilk prova, çalışır rapor dosyası için Power BI Desktop.',
    task: 'Anadolu Market için ay ve kategoriye göre satışları gösteren tek sayfa hazırla. Bir ay filtresi seç ve satış toplamını kaynakla karşılaştır.',
    hint: 'Bir tarih ve bir ürün boyutu kullan. Önce tek toplam kartı kur, sonra ay grafiğini ve kategori dilimleyicisini ekle.',
    transfer: 'Lezzet Kurye’de tek sayfayı sipariş adedi ve haftalık filtreyle yeniden kur. Filtresiz ve tek hafta sayısını kontrol et.',
    files: ['Tek sayfalık rapor dosyası', 'İlişki şeması ve ölçüler', 'İki satırlık mutabakat tablosu'],
  },
  mulakat: {
    environment: 'Tarayıcıda prova. Dosya teslimi istenen vakada Power BI Desktop.',
    task: 'Süre tutarak bir satış KPI’ını modelle ve iki filtre altında doğrula. Üç dakikada problemi, kendi katkını, kontrol sonucunu ve bir sınırı anlat.',
    hint: 'Durum, görev, eylem ve sonuç için birer cümle yaz. Sonuç cümlesine rapor ekranından bağımsız bir kontrol sayısı koy.',
    transfer: 'Aynı sunumu Kanat Havayolları gecikme metriğiyle, önceki dosyayı açmadan yap. Değişen kapsam kuralını mülakatçıya açıklamayı ekle.',
    files: ['Süreli vaka teslim dosyası', 'Filtreli iki kontrol örneği', 'Üç dakikalık mülakat notu'],
  },
  vaka: {
    environment: 'Örnek veriyle tarayıcıda analiz provası. Teslim raporu için Power BI Desktop veya belgelenmiş başka bir analiz ortamı.',
    task: 'Pedal İzmir vakasında istasyon doluluğu veya dengeleme için bir karar sorusu seç. Analiz tane düzeyini ve bir kontrol senaryosunu belirt.',
    hint: 'Önce karar sahibini ve gerekli zaman aralığını yaz. İstasyon ile yolculuk verisinin aynı tane düzeyinde olmadığını kontrol et.',
    transfer: 'Pusula İK’da aynı analiz planını bölüm bazlı devamsızlık sorusuna taşı. Payda ve kapsam kuralını yeni iş problemine göre yeniden yaz.',
    files: ['Vaka brifi ve model şeması', 'Sorgu/ölçüler ve kontrol sonuçları', 'Karar sayfası ve veri sınırlamaları'],
  },
};
Object.entries(EVIDENCE).forEach(([id, evidence]) => { W.PBI_ROLES[id].cap.evidence = evidence; });
})(window);
