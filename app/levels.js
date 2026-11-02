/* Kesit Power BI — 3 seviye: Temel, Orta, İleri */
(function (W) {
/* Üç seviye: Temel, Orta, İleri. Veri dosyalarındaki ince kodlar (A1–C2) yalnızca ders sırası için tutulur; arayüz PBI_TIER ile üç seviyeye indirir. */
W.PBI_TIER = v => { const s = String(v == null ? '' : v); if (s === 'temel' || /^A[12]?$/.test(s)) return 'temel'; if (s === 'orta' || /^B[12]?$/.test(s)) return 'orta'; if (s === 'ileri' || /^C[12]?$/.test(s)) return 'ileri'; return s; };
W.PBI_LEVELS = [
  { id: 'temel', name: 'Temel', c: 'lv1', tag: 'Sıfırdan ilk rapora', dax: '1–3 satır: SUM, COUNTROWS, DIVIDE, DISTINCTCOUNT',
    desc: 'Power BI\'ı tanır, veri yükler ve temizler, yıldız şema kurar, ilk ölçüleri ve görselleri yapar.',
    can: ['Power BI Desktop\'ı ve Power BI Service’i rahatça kullanır, bir Excel ya da CSV dosyasını yüklerim.', 'Power Query\'de veri türlerini düzeltir, kirli veriyi temizler, sütunları bölüp birleştiririm.', 'Olgu ve boyut tablolarını ayırıp ilişki kurar, tarih tablosu eklerim.', 'Ölçü ile hesaplanmış sütunu ayırt eder; toplama, sayma ve oran ölçüleri yazarım.', 'Doğru görseli seçer, biçim bölmesini, filtreleri ve dilimleyicileri kullanırım.'] },
  { id: 'orta', name: 'Orta', c: 'lv3', tag: 'Analist ve PL-300 düzeyi', dax: '3–14 satır: CALCULATE, SUMX, VAR, zaman zekâsı, ALL ailesi, RANKX',
    desc: 'Filtre bağlamını anlar; CALCULATE, zaman zekâsı, pay ve sıralama ölçüleriyle iş sorularını cevaplar, hikâye anlatan etkileşimli raporlar kurar.',
    can: ['Aynı formülün neden her hücrede farklı sonuç verdiğini açıklarım; CALCULATE ve SUMX ile filtre ve satır mantığı kurarım.', 'YTD, geçen yıl, büyüme, pay ve sıralama ölçülerini doğru ALL türüyle yazarım.', 'Pasif ilişkileri USERELATIONSHIP ile, stok gibi yarı toplanabilir ölçüleri dönem sonu mantığıyla hesaplarım.', 'Yer işareti, araç ipucu, detay sayfası ve sayfa gezintisiyle rapora hikâye kurar; mobil ve erişilebilir tasarlarım.', 'Analiz bölmesini, yapay zekâ görsellerini ve Copilot\'u yorumlayarak kullanırım.'] },
  { id: 'ileri', name: 'İleri', c: 'lv5', tag: 'Geliştirici ve kurumsal düzey', dax: '10–45 satır: bağlam geçişi, tablo ve pencere fonksiyonları, kurumsal kalıplar',
    desc: 'Bağlam geçişini ve tablo fonksiyonlarını ustalıkla kullanır; müşteri analitiği, performans, güvenlik ve kurumsal model tasarımıyla raporun yaşam döngüsünü yönetir.',
    can: ['Bağlam geçişinin ne zaman olduğunu ve sonuca etkisini önceden söylerim.', 'TREATAS, pencere fonksiyonları ve küme fonksiyonlarıyla sanal ilişki ve karmaşık hesaplar kurarım.', 'Kohort, RFM, ABC, kayıp müşteri ve finansal analizleri ölçüyle yaparım.', 'Performans Analizi ve DAX ölçümleriyle darboğaz bulur, ölçüyü hızlandırırım; RLS ve çalışma alanı rolleriyle güvenle dağıtırım.', 'Hesaplama grupları, alan parametreleri, kurumsal model ve Fabric ile büyük ölçekli çözüm tasarlarım.'] }
];
W.PBI_LEVEL_OF = {
  tarih: 'A1', aile: 'A1', arayuz: 'A1', 'ilk-rapor': 'A1',
  'veri-alma': 'A2', 'pq-temel': 'A2', 'model-temel': 'A2', 'tarih-tablosu': 'A2', 'dax-giris': 'A2', toplama: 'A2', 'gorsel-secimi': 'A2',
  baglam: 'B1', calculate: 'B1', iteratorler: 'B1', zaman: 'B1', 'var-mantik': 'B1', 'kosullu-bicim': 'B1',
  'filter-all': 'B2', siralama: 'B2', hedef: 'B2', 'pq-orta': 'B2', 'gorsel-ilkeler': 'B2', etkilesim: 'B2', 'dashboard-tasarim': 'B2',
  'baglam-gecisi': 'C1', 'zaman-ileri': 'C1', 'dax-sorgu': 'C1', performans: 'C1', guvenlik: 'C1', yayinlama: 'C1', 'm-dili': 'C1', pl300: 'C1',
  'hesaplama-gruplari': 'C2'
};
/* Ders sırası: seviyeler içinde öğrenme sırası */
W.PBI_ORDER = [
  'tarih', 'aile', 'arayuz', 'menuler-turu', 'ilk-rapor', 'gorsel-temel',
  'veri-alma', 'pq-temel', 'model-temel', 'tarih-tablosu', 'dax-giris', 'toplama', 'gorsel-secimi', 'bicim-temel', 'filtreler',
  'baglam', 'calculate', 'iteratorler', 'var-mantik', 'zaman', 'istatistik', 'hizli-olcu', 'kosullu-bicim', 'tema-sayfa',
  'pq-model', 'pq-orta', 'filter-all', 'siralama', 'rol-oynayan', 'yari-toplanabilir', 'hedef', 'gorsel-ilkeler', 'etkilesim', 'hikaye', 'analiz-ozellikleri', 'mobil-erisilebilirlik', 'dashboard-tasarim',
  'baglam-gecisi', 'tablo-fonk', 'zaman-ileri', 'pencere', 'musteri-analitigi', 'segmentasyon', 'dax-sorgu', 'm-dili', 'performans', 'guvenlik', 'yayinlama', 'yonetisim', 'sayfalandirilmis', 'pl300',
  'hesaplama-gruplari', 'ileri-kaliplar', 'hiyerarsi', 'istatistik-ileri', 'dax-opt', 'kurumsal-model', 'yasam-dongusu', 'dp600', 'final-hazirlik'
];
})(window);
