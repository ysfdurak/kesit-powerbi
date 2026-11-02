/* Kesit Power BI — Öğrenme yollarının son hali: ders sırası (PBI_ORDER), her yolun aşamaları ve dersleri, ön koşullar, kapsam haritası bağlantıları.
   extra.js ve roles.js üzerine yazar; yol içeriği yalnız burada değiştirilir. Kimlikler ve depolama anahtarları değişmez. */
(function (W) {
'use strict';
/* Genel sıra: ilk saat (ölçü → kurulum → ilk rapor → arayüz), bitişik DAX yayı, kariyer ve sınav en sonda */
W.PBI_ORDER = [
  'ilk-olcu', 'kurulum', 'ilk-rapor', 'arayuz', 'aile', 'gorsel-temel', 'veri-alma', 'pq-temel', 'pq-donusum', 'model-temel', 'dax-giris', 'tarih-tablosu', 'toplama', 'dax-tarih-metin', 'hesap-tablolar', 'gorsel-secimi', 'bicim-temel', 'filtreler', 'rapor-brifi', 'dashboard-kavramlar', 'veri-okuryazarligi', 'menuler-turu', 'hizmet-kullanici', 'excel-entegrasyon', 'tarih',
  'baglam', 'calculate', 'filter-all', 'iteratorler', 'var-mantik', 'blank-hata', 'zaman', 'siralama', 'hizli-olcu', 'istatistik', 'eda', 'kosullu-bicim', 'tema-sayfa', 'pq-model', 'pq-orta', 'veri-baglantilari', 'sql-analist', 'veri-akislari', 'pq-ileri', 'rol-oynayan', 'yari-toplanabilir', 'vaka-stok', 'hedef', 'model-ileri', 'gorsel-ilkeler', 'gorsel-algi', 'ozel-gorseller', 'etkilesim', 'hikaye', 'kademeli-tasarim', 'analiz-ozellikleri', 'ayristirma-etkileyen', 'karar-toplantisi', 'copilot', 'python-r', 'power-platform', 'mobil-erisilebilirlik', 'kalite-test', 'proje-yonetimi-bi', 'paydas-iletisim', 'vaka-satis', 'vaka-kiyaslama', 'vaka-pazar',
  'dashboard-tasarim', 'baglam-gecisi', 'genisletilmis-tablolar', 'tablo-fonk', 'coka-cok', 'zaman-ileri', 'ozel-takvim', 'zaman-serisi', 'pencere', 'dax-sorgu', 'yz-dax-denetim', 'dax-udf', 'hesaplama-gruplari', 'ileri-kaliplar', 'uzman-kaliplar', 'hiyerarsi', 'musteri-analitigi', 'segmentasyon', 'finans', 'finans-tablolar', 'istatistik-ileri', 'vaka-kayip', 'vaka-eticaret', 'vaka-kredi', 'vaka-tedarik', 'vaka-ik', 'm-dili', 'performans', 'dax-opt', 'guvenlik', 'yayinlama', 'yonetisim', 'bi-yonetimi', 'sayfalandirilmis', 'kurumsal-model', 'buyuk-model', 'fabric-giris', 'fabric-hazirlama', 'fabric-veri-alma', 'fabric-tsql-odev', 'fabric-spark-odev', 'kql-gercek-zaman', 'fabric-yildiz', 'yasam-dongusu', 'embed-api', 'pl300', 'dp600', 'mulakat', 'portfoy-kariyer', 'final-hazirlik'
];
W.PBI_LEVEL_OF = Object.assign(W.PBI_LEVEL_OF || {}, { 'fabric-giris': 'C1' });
/* İsteğe bağlı ek okuma: hiçbir yolun zorunlu dersi değildir */
W.PBI_OPTIONAL = ['tarih'];
const G = (t, d, ids) => ({ t, d, ids });
const ORDERED = ids => ids.slice().sort((a, b) => W.PBI_ORDER.indexOf(a) - W.PBI_ORDER.indexOf(b));
const ALLNOOPT = W.PBI_ORDER.filter(id => !W.PBI_OPTIONAL.includes(id));
const slice = (a, b) => { const i = ALLNOOPT.indexOf(a), j = ALLNOOPT.indexOf(b); return ALLNOOPT.slice(i, j + 1); };
const STAGES = {
  profesyonel: [
    G('Power BI’ı tanı', 'İlk ölçü, kurulum, ilk rapor', slice('ilk-olcu', 'gorsel-temel')),
    G('Veriyi hazırla ve modelle', 'Power Query, yıldız şema, DAX’a giriş', slice('veri-alma', 'hesap-tablolar')),
    G('İlk rapor ve iş dili', 'Görsel, biçim, filtre, brif', slice('gorsel-secimi', 'excel-entegrasyon')),
    G('DAX’ın kalbi', 'Bağlam, CALCULATE, ALL ailesi, zaman, sıralama', slice('baglam', 'siralama')),
    G('Analiz ve biçim', 'Hızlı ölçü, istatistik, koşullu biçim, tema', slice('hizli-olcu', 'tema-sayfa')),
    G('Veri tarafında derinleş', 'Birleştirme, SQL, veri akışları', slice('pq-model', 'pq-ileri')),
    G('İş kalıpları', 'Rol oynayan tarih, stok, hedef, model', slice('rol-oynayan', 'model-ileri')),
    G('Rapor tasarımı ve hikâye', 'Etkileşim, analiz, kalite', slice('gorsel-ilkeler', 'kalite-test')),
    G('Analist olarak işte', 'Proje, paydaş, vaka', slice('proje-yonetimi-bi', 'vaka-pazar')),
    G('İleri DAX ve analitik', 'Bağlam geçişi, pencere, müşteri, finans', slice('dashboard-tasarim', 'vaka-ik')),
    G('Performans, güvenlik, kurumsal model', 'M, optimizasyon, RLS, yönetişim', slice('m-dili', 'buyuk-model')),
    G('Fabric ve yaşam döngüsü', 'Veri hazırlama ödevleri, Git, gömme', slice('fabric-giris', 'embed-api')),
    G('Sınav, mülakat, bitirme', 'Kariyer dersleri en sonda', slice('pl300', 'final-hazirlik'))
  ],
  analist: [
    G('Power BI’ı tanı', 'İlk ölçü, kurulum, ilk rapor', ['ilk-olcu', 'kurulum', 'ilk-rapor', 'arayuz', 'aile', 'gorsel-temel', 'hizmet-kullanici']),
    G('Veriyi hazırla ve modelle', '', ['veri-alma', 'pq-temel', 'pq-donusum', 'model-temel', 'dax-giris', 'tarih-tablosu', 'toplama', 'dax-tarih-metin', 'hesap-tablolar']),
    G('İlk rapor ve brif', '', ['gorsel-secimi', 'bicim-temel', 'filtreler', 'rapor-brifi', 'dashboard-kavramlar', 'veri-okuryazarligi']),
    G('DAX çekirdeği', '', ['baglam', 'calculate', 'filter-all', 'iteratorler', 'var-mantik', 'blank-hata', 'zaman', 'siralama', 'hizli-olcu', 'istatistik', 'eda', 'kosullu-bicim', 'tema-sayfa']),
    G('Veri tarafı: SQL ve Power Query', '', ['pq-model', 'pq-orta', 'sql-analist', 'veri-akislari', 'pq-ileri']),
    G('Yarı toplanabilir, rol oynayan, hedef', '', ['rol-oynayan', 'yari-toplanabilir', 'hedef']),
    G('Rapor tasarımı ve hikâye', '', ['gorsel-ilkeler', 'gorsel-algi', 'ozel-gorseller', 'etkilesim', 'hikaye', 'kademeli-tasarim', 'analiz-ozellikleri', 'ayristirma-etkileyen', 'copilot', 'dashboard-tasarim']),
    G('Yayımla ve paylaş', 'Çalışma alanı, uygulama, yenileme, RLS', ['kalite-test', 'yayinlama', 'guvenlik']),
    G('İşte: paydaş ve vaka', '', ['proje-yonetimi-bi', 'paydas-iletisim', 'vaka-satis', 'vaka-kiyaslama']),
    G('Müşteri analitiği ve bitirme', '', ['baglam-gecisi', 'musteri-analitigi', 'segmentasyon', 'portfoy-kariyer', 'final-hazirlik'])
  ],
  /* Sıra, resmî çalışma kılavuzundaki alan sırasıdır */
  pl300: [
    G('Başlangıç', '', ['ilk-olcu', 'kurulum', 'ilk-rapor', 'arayuz', 'aile', 'menuler-turu']),
    G('Veriyi hazırla', '%25–30', ['veri-alma', 'veri-baglantilari', 'veri-akislari', 'pq-temel', 'pq-donusum', 'pq-orta', 'pq-ileri', 'pq-model']),
    G('Modelle', '%25–30', ['model-temel', 'dax-giris', 'tarih-tablosu', 'toplama', 'dax-tarih-metin', 'hesap-tablolar', 'rol-oynayan', 'model-ileri', 'coka-cok', 'baglam', 'calculate', 'filter-all', 'iteratorler', 'var-mantik', 'blank-hata', 'zaman', 'siralama', 'istatistik', 'hizli-olcu', 'yari-toplanabilir', 'hedef', 'hesaplama-gruplari', 'performans']),
    G('Görselleştir ve analiz et', '%25–30', ['gorsel-temel', 'gorsel-secimi', 'bicim-temel', 'tema-sayfa', 'filtreler', 'kosullu-bicim', 'gorsel-ilkeler', 'gorsel-algi', 'ozel-gorseller', 'pencere', 'etkilesim', 'hikaye', 'kademeli-tasarim', 'mobil-erisilebilirlik', 'eda', 'analiz-ozellikleri', 'ayristirma-etkileyen', 'copilot']),
    G('Yönet ve güvenli hâle getir', '%15–20', ['hizmet-kullanici', 'excel-entegrasyon', 'yayinlama', 'sayfalandirilmis', 'guvenlik', 'yonetisim']),
    G('Sınav', '', ['pl300'])
  ],
  gelistirici: [
    G('Model ve DAX temeli', '', ['veri-alma', 'pq-temel', 'model-temel', 'dax-giris', 'tarih-tablosu', 'toplama', 'hesap-tablolar']),
    G('Rapor kurmak', 'Geliştirici de rapor teslim eder', ['bicim-temel', 'kosullu-bicim', 'etkilesim', 'hikaye']),
    G('Bağlam ve CALCULATE', '', ['baglam', 'calculate', 'filter-all', 'iteratorler', 'var-mantik', 'blank-hata', 'zaman', 'siralama']),
    G('Veri katmanı', '', ['pq-model', 'pq-orta', 'veri-baglantilari', 'sql-analist', 'veri-akislari']),
    G('İleri model kalıpları', '', ['rol-oynayan', 'yari-toplanabilir', 'model-ileri', 'kalite-test']),
    G('İleri DAX', '', ['baglam-gecisi', 'genisletilmis-tablolar', 'tablo-fonk', 'coka-cok', 'zaman-ileri', 'ozel-takvim', 'pencere', 'dax-sorgu', 'yz-dax-denetim', 'dax-udf', 'hesaplama-gruplari', 'ileri-kaliplar', 'uzman-kaliplar', 'hiyerarsi']),
    G('Performans, güvenlik, yönetim', '', ['m-dili', 'performans', 'dax-opt', 'guvenlik', 'yayinlama', 'yonetisim', 'bi-yonetimi', 'sayfalandirilmis']),
    G('Fabric ve kurumsal model', '', ['kurumsal-model', 'buyuk-model', 'fabric-giris', 'fabric-hazirlama', 'fabric-yildiz']),
    G('Yaşam döngüsü ve entegrasyon', '', ['yasam-dongusu', 'embed-api', 'python-r', 'power-platform']),
    G('Ekip içinde çalışmak ve bitirme', '', ['proje-yonetimi-bi', 'paydas-iletisim', 'portfoy-kariyer', 'final-hazirlik'])
  ],
  dax: [
    G('DAX temelleri', '', ['dax-giris', 'toplama', 'dax-tarih-metin', 'hesap-tablolar']),
    G('Bağlamlar', '', ['baglam', 'calculate', 'filter-all', 'iteratorler', 'var-mantik', 'blank-hata', 'zaman', 'siralama', 'istatistik']),
    G('Pay, sıra, ilişkiler', '', ['rol-oynayan', 'yari-toplanabilir', 'hedef', 'kalite-test']),
    G('İleri DAX', '', ['baglam-gecisi', 'genisletilmis-tablolar', 'tablo-fonk', 'coka-cok', 'zaman-ileri', 'ozel-takvim', 'zaman-serisi', 'pencere', 'dax-sorgu', 'yz-dax-denetim', 'dax-udf']),
    G('İş kalıpları', '', ['hesaplama-gruplari', 'ileri-kaliplar', 'uzman-kaliplar', 'hiyerarsi', 'musteri-analitigi', 'segmentasyon', 'finans', 'istatistik-ileri']),
    G('Optimizasyon', '', ['performans', 'dax-opt'])
  ],
  /* Süre payı sınava uyar: veri hazırlama en büyük aşama */
  dp600: [
    G('Veriyi hazırla: al', 'Sınavın %45–50’si veri hazırlama', ['fabric-giris', 'veri-baglantilari', 'veri-akislari', 'fabric-veri-alma', 'pq-orta']),
    G('Veriyi hazırla: dönüştür', 'T-SQL ve PySpark ödevleri', ['sql-analist', 'fabric-hazirlama', 'fabric-tsql-odev', 'fabric-spark-odev', 'fabric-yildiz']),
    G('Veriyi hazırla: sorgula', 'SQL, KQL, DAX', ['kql-gercek-zaman', 'dax-sorgu']),
    G('Anlam modeli', '%25–30', ['coka-cok', 'pencere', 'hesaplama-gruplari', 'performans', 'dax-opt', 'kurumsal-model', 'buyuk-model']),
    G('Çözümü yönet', '%25–30', ['guvenlik', 'yonetisim', 'yasam-dongusu', 'kalite-test']),
    G('Sınav', '', ['dp600'])
  ],
  yonetici: [
    G('Power BI’ı tanı', '', ['ilk-olcu', 'kurulum', 'ilk-rapor', 'arayuz', 'aile', 'gorsel-temel', 'hizmet-kullanici', 'excel-entegrasyon']),
    G('Excel’den modele', 'VLOOKUP yerine ilişki, pivot yerine ölçü', ['veri-alma', 'pq-temel', 'model-temel', 'dax-giris', 'tarih-tablosu', 'toplama']),
    G('Raporu planla ve kur', '', ['rapor-brifi', 'dashboard-kavramlar', 'bicim-temel', 'filtreler', 'veri-okuryazarligi']),
    G('Pivot’un ötesi: bağlam', 'Excel’den gelenin en çok takıldığı yer', ['baglam', 'calculate', 'filter-all', 'zaman', 'hizli-olcu', 'kosullu-bicim', 'tema-sayfa', 'hedef']),
    G('Rapor ve karar', '', ['gorsel-ilkeler', 'etkilesim', 'ayristirma-etkileyen', 'karar-toplantisi', 'copilot', 'dashboard-tasarim']),
    G('İşte uygulamak', '', ['paydas-iletisim', 'vaka-satis', 'vaka-kiyaslama', 'vaka-pazar', 'portfoy-kariyer'])
  ],
  hizli: [
    G('Tanış', 'İlk ölçü, kurulum, ilk rapor', ['ilk-olcu', 'kurulum', 'ilk-rapor']),
    G('İlk model', 'Temizle, ilişkilendir, tarih tablosu ekle', ['pq-temel', 'model-temel', 'dax-giris', 'tarih-tablosu']),
    G('İlk ölçüler', 'Bağlam, CALCULATE, zaman', ['toplama', 'baglam', 'calculate', 'zaman']),
    G('Paylaş', '', ['hizmet-kullanici'])
  ]
};
const paths = W.PBI_PATHS || [], roles = W.PBI_ROLES || {};
paths.forEach(p => {
  const st = STAGES[p.id], r = roles[p.id];
  if (st) { p.lessons.length = 0; st.forEach(g => g.ids.forEach(id => { if (!p.lessons.includes(id)) p.lessons.push(id); })); if (r) r.ms = st.map(g => ({ t: g.t, to: g.ids[g.ids.length - 1], d: g.d })); }
  else { const kept = ORDERED(p.lessons.filter(id => !W.PBI_OPTIONAL.includes(id))); p.lessons.length = 0; kept.forEach(id => p.lessons.push(id)); if (r && r.ms) r.ms = r.ms.filter(m => p.lessons.includes(m.to)); }
  /* Belge şartı yolun kendi dersleriyle sınırlı */
  if (r && r.ready) r.ready.forEach(x => { if (x.lessons) x.lessons = x.lessons.filter(id => p.lessons.includes(id)); });
});
const P = id => paths.find(x => x.id === id), T = (id, o) => { const p = P(id); if (p) Object.assign(p, o); }, RO = (id, o) => { if (roles[id]) Object.assign(roles[id], o); };
T('profesyonel', { short: 'TP', name: 'Tam program', desc: 'Tüm program: Temel’den İleri’ye bütün dersler, örnek raporlar ve bitirme projesi.', skills: ['Tüm komutlar', 'Power Query', 'Yıldız şema', 'DAX: Temel → İleri', 'Örnek raporlar', 'RLS ve yayın', 'Bitirme projesi'] });
RO('profesyonel', { title: 'Tam program', level: 'Temel → İleri', long: 'Tüm müfredat tek yolda: ilk ölçü ve ilk rapordan başlayıp Power Query, yıldız şema, DAX, rapor tasarımı, paylaşma ve güvenlik, ileri DAX, performans, kurumsal model ve Fabric’e kadar. Vaka çalışmaları ve 10 aşamalı bitirme projesiyle biter. “Power BI’ın hikâyesi” dersi isteğe bağlı ek okumadır.' });
if (roles.profesyonel && roles.profesyonel.cap) { roles.profesyonel.cap.guide = 'Adım adım uygulama kılavuzu: 10 aşama'; }
RO('pl300', { title: 'PL-300 sertifika hazırlığı', long: 'Sınavın dört alanı (veriyi hazırla, modelle, görselleştir ve analiz et, yönet ve güvenli hâle getir) çalışma kılavuzundaki sırayla, ders ders işlenir. Sınavlar sayfasındaki kapsam haritası her resmî maddeyi ilgili derse bağlar. Sınav tarzı sorular, vaka çalışmaları, seri sorular ve arayüz soruları deneme sınavlarında.' });
T('pl300', { desc: 'Microsoft Power BI Data Analyst sertifikasının dört alanı.', long: 'Sınavın dört alanını resmî çalışma kılavuzundaki sırayla kapsar: veriyi hazırla %25–30, modelle %25–30, görselleştir ve analiz et %25–30, yönet ve güvenli hâle getir %15–20.', skills: ['Veriyi hazırla', 'Modelle', 'Görselleştir ve analiz et', 'Yönet ve güvenli hâle getir'] });
RO('gelistirici', { prereq: { t: 'Önce analist temeli', d: 'Bu yol kurumsal model ve ileri DAX’a odaklanır; temel rapor derslerinin yalnız bir kısmını içerir. Rapor kurma ve görsel seçme rahat değilse önce şuradan başla:', path: 'analist', lessons: [] } });
RO('dp600', { long: 'Sınavın en ağır alanı olan veri hazırlama (%45–50) en büyük aşamadır: OneLake, lakehouse, ambar, T-SQL ve PySpark ödevleri, kısayollar, KQL ve gerçek zamanlı analitik. Ardından kurumsal anlam modeli (%25–30), Direct Lake, performans, güvenlik ve yaşam döngüsü (%25–30). T-SQL, PySpark ve KQL tarayıcıda çalışmaz: ödevleri Fabric deneme kapasitesinde yapıp sonucu beklenen değerle karşılaştırırsın.',
  prereq: { t: 'PL-300 düzeyi varsayılır', d: 'Bu yol filtre bağlamını, CALCULATE’i ve yıldız şemayı bildiğini varsayar; bu dersler yolun içinde değildir ve belge şartına girmez. Rahat değilsen önce şu dersleri bitir ya da PL-300 yolunu izle.', path: 'pl300', lessons: ['model-temel', 'pq-temel', 'dax-giris', 'baglam', 'calculate', 'iteratorler', 'filter-all', 'zaman', 'baglam-gecisi', 'tablo-fonk'] } });
T('dp600', { desc: 'Fabric Analytics Engineer: veri hazırlama ödevleri, kurumsal anlam modelleri ve Direct Lake.', long: 'Microsoft Fabric Analytics Engineer Associate (DP-600): veri hazırlama, kurumsal anlam modeli, çözümün yönetimi.', skills: ['Lakehouse ve ambar', 'T-SQL ve PySpark', 'KQL', 'Direct Lake', 'Dağıtım işlem hattı'] });
T('dax', {});
RO('yonetici', { level: 'Temel → Orta' });
T('yonetici', { desc: 'Pivot tablo bilen raporlama ve finans ekipleri için hızlı geçiş.', long: 'Excel’de pivot tablo ve grafiklerle rapor hazırlayanlar için. Excel alışkanlıklarını Power BI’ın model, ölçü ve rapor mantığına çevirir.', skills: ['Power Query', 'Model', 'Filtre bağlamı', 'Ölçüler', 'Biçim bölmesi', 'Rapor'] });
const nH = (P('hizli') || { lessons: [] }).lessons.length;
T('hizli', { desc: nH + ' derste ilk ölçünden ilk raporuna.', long: 'Zamanı kısıtlı olanlar için en kısa yol: kurulum, ilk rapor, veri temizliği, model, tarih tablosu, ilk ölçüler, filtre bağlamı, CALCULATE ve zaman zekâsı.', skills: ['İlk rapor', 'Power Query', 'Model', 'İlk ölçüler', 'CALCULATE'] });
RO('hizli', { who: 'Zamanı kısıtlı olanlar için: bir günde ilk modelinden ilk raporuna.', outcomes: (roles.hizli && roles.hizli.outcomes || []).map(o => o.replace('Power BI Desktop ve hizmetinde', 'Power BI Desktop ve Service’te')) });
if (roles.hizli && roles.hizli.ready && roles.hizli.ready[0]) roles.hizli.ready[0].lessons = P('hizli').lessons.slice();
/* Tam program belgesi seviye bazlı listeyi kullanır; isteğe bağlı ders hariç */
if (roles.profesyonel && roles.profesyonel.ready) { const tier = W.PBI_TIER || (x => x); const by = t => W.PBI_LESSONS.filter(l => tier(W.PBI_LEVEL_OF[l.id] || l.lv) === t && !W.PBI_OPTIONAL.includes(l.id)).map(l => l.id); ['temel', 'orta', 'ileri'].forEach((t, i) => { roles.profesyonel.ready[i].lessons = by(t); }); }

paths.forEach(p => { const r = roles[p.id]; if (r && r.title) p.name = r.title; });

/* Kapsam haritası: resmî madde → ana ders */
W.PBI_SKILL_LESSON = {
  'pl-gc1': ['veri-alma'], 'pl-gc2': ['veri-baglantilari'], 'pl-gc3': ['veri-alma', 'model-ileri'], 'pl-gc4': ['pq-model'],
  'pl-pc1': ['pq-temel'], 'pl-pc2': ['pq-temel', 'pq-donusum'], 'pl-pc3': ['pq-temel'],
  'pl-tl1': ['pq-temel'], 'pl-tl2': ['pq-donusum'], 'pl-tl3': ['pq-orta'], 'pl-tl4': ['pq-orta'], 'pl-tl5': ['pq-model'], 'pl-tl6': ['pq-model', 'model-temel'], 'pl-tl7': ['pq-model'], 'pl-tl8': ['pq-orta'], 'pl-tl9': ['pq-model'], 'pl-tl10': ['pq-model'],
  'pl-dm1': ['model-temel'], 'pl-dm2': ['rol-oynayan'], 'pl-dm3': ['model-temel', 'model-ileri'], 'pl-dm4': ['tarih-tablosu'], 'pl-dm5': ['dax-giris', 'hesap-tablolar'],
  'pl-dx1': ['toplama'], 'pl-dx2': ['calculate'], 'pl-dx3': ['zaman'], 'pl-dx4': ['istatistik'], 'pl-dx5': ['yari-toplanabilir'], 'pl-dx6': ['hizli-olcu'], 'pl-dx7': ['hesap-tablolar'], 'pl-dx8': ['hesaplama-gruplari'],
  'pl-op1': ['pq-temel', 'performans'], 'pl-op2': ['performans'], 'pl-op3': ['performans', 'model-ileri'],
  'pl-cr1': ['gorsel-secimi'], 'pl-cr2': ['bicim-temel'], 'pl-cr3': ['copilot'], 'pl-cr4': ['tema-sayfa'], 'pl-cr5': ['kosullu-bicim'], 'pl-cr6': ['filtreler'], 'pl-cr7': ['copilot'], 'pl-cr8': ['tema-sayfa'], 'pl-cr9': ['sayfalandirilmis'], 'pl-cr10': ['pencere'],
  'pl-us1': ['hikaye'], 'pl-us2': ['hikaye'], 'pl-us3': ['etkilesim'], 'pl-us4': ['hikaye'], 'pl-us5': ['filtreler', 'etkilesim'], 'pl-us6': ['etkilesim'], 'pl-us7': ['mobil-erisilebilirlik'], 'pl-us8': ['mobil-erisilebilirlik'], 'pl-us9': ['mobil-erisilebilirlik'],
  'pl-pt1': ['analiz-ozellikleri'], 'pl-pt2': ['istatistik'], 'pl-pt3': ['analiz-ozellikleri'], 'pl-pt4': ['analiz-ozellikleri', 'eda'], 'pl-pt5': ['copilot'],
  'pl-ws1': ['yayinlama'], 'pl-ws2': ['yayinlama'], 'pl-ws3': ['yayinlama', 'hizmet-kullanici'], 'pl-ws4': ['yayinlama'], 'pl-ws5': ['yonetisim'], 'pl-ws6': ['yayinlama', 'veri-baglantilari'],
  'pl-sg1': ['yonetisim'], 'pl-sg2': ['yonetisim'], 'pl-sg3': ['guvenlik'], 'pl-sg4': ['yonetisim'],
  'dp-sg1': ['yonetisim'], 'dp-sg2': ['guvenlik'], 'dp-sg3': ['yonetisim'],
  'dp-lc1': ['yasam-dongusu'], 'dp-lc2': ['yasam-dongusu'], 'dp-lc3': ['yasam-dongusu'], 'dp-lc4': ['yasam-dongusu'], 'dp-lc5': ['yasam-dongusu'], 'dp-lc6': ['yasam-dongusu'],
  'dp-gd1': ['fabric-veri-alma', 'veri-baglantilari'], 'dp-gd2': ['fabric-hazirlama', 'kql-gercek-zaman'], 'dp-gd3': ['fabric-veri-alma'], 'dp-gd4': ['fabric-giris', 'fabric-hazirlama'], 'dp-gd5': ['kql-gercek-zaman'],
  'dp-tr1': ['fabric-tsql-odev', 'fabric-hazirlama'], 'dp-tr2': ['fabric-spark-odev'], 'dp-tr3': ['fabric-yildiz', 'fabric-tsql-odev'], 'dp-tr4': ['fabric-hazirlama'], 'dp-tr5': ['fabric-tsql-odev', 'pq-orta'], 'dp-tr6': ['fabric-spark-odev'], 'dp-tr7': ['fabric-spark-odev', 'fabric-tsql-odev'],
  'dp-qa1': ['fabric-hazirlama'], 'dp-qa2': ['sql-analist', 'fabric-tsql-odev'], 'dp-qa3': ['kql-gercek-zaman'], 'dp-qa4': ['dax-sorgu'],
  'dp-sm1': ['kurumsal-model'], 'dp-sm2': ['fabric-yildiz', 'coka-cok'], 'dp-sm3': ['pencere'], 'dp-sm4': ['hesaplama-gruplari'], 'dp-sm5': ['buyuk-model'],
  'dp-op1': ['dax-opt', 'performans'], 'dp-op2': ['kurumsal-model'], 'dp-op3': ['kurumsal-model'], 'dp-op4': ['buyuk-model']
};
})(window);
/* Yalnız çoktan seçmeli derslerde elle deneme yönlendirmesi */
(function (W) {
  const add = (id, html) => { const l = (W.PBI_LESSONS || []).find(x => x.id === id); if (l) l.body += html; };
  add('veri-alma', '<div class="tip"><b>Elle dene</b><button class="lnk" data-go="pq">Power Query Lab</button> sayfasında bir kaynak seç; türü düzelt, boş satırları kaldır, bir sütunu böl. Her adımın M koduna dönüştüğünü gör.</div>');
  add('tema-sayfa', '<div class="tip"><b>Elle dene</b><button class="lnk" data-go="visuals">Görseller ve biçim</button> sayfasında bir görselin Genel sekmesinden başlık, kenarlık ve arka planı değiştir; “Ne değişti?” kutusunu oku.</div>');
})(window);
/* Model sayfası açıklamaları: kopya kategori sütunu ve ölçek notu (veri değişmez) */
(function (W) {
  const D = W.PBI_MODEL && W.PBI_MODEL.colDesc; if (!D) return;
  D['Urunler[Kategori]'] = 'İlişki anahtarı: Kategoriler[Kategori] ile aynı değerler. Rapor ve alıştırmalarda eksen olarak Kategoriler[Kategori] kullanılır.';
  D['Calisanlar[Maas]'] = 'Aylık brüt maaş (kurgusal). Şirket ölçeği öğretim için sıkıştırıldı: Giderler tablosundaki Personel kalemiyle aynı ölçekte değildir.';
})(window);
