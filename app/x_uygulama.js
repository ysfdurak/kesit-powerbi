/* Kesit Power BI — çoğunlukla çoktan seçmeli kalan derslere uygulamalı görev (Kasım 2026).
   Başlangıç: ilk görseller ve model sorgulama. Service, yönetim ve Fabric: tarayıcıda yapılabilen gerçek iş adımları
   (model envanteri, yük sonrası mutabakat, veri kalitesi kontrolü, API'ye gidecek sorgu). Kariyer: projeler ve talepler üzerinde ölçü.
   Power Query dersleri: M kodu. Arayüz taklidi yok; her görev bir sonuç tablosu üretir ve denetlenir. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, ex) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('x_uygulama: ders yok', id); return; } l.ex = (l.ex || []).concat(ex); (W.PBI_EXT = W.PBI_EXT || []).push(id); };
const G = (q, sol, o) => Object.assign({ t: 'gorsel', q, sol: Object.assign({ tur: 'sutun', eksen: null, gosterge: null, degerler: [], filtre: { alan: null, degerler: [] }, sirala: 'etiket', topn: 0, hesap: [] }, sol) }, o || {});
const Q = (q, sol, hint) => ({ t: 'query', q, start: 'EVALUATE\n', sol: 'EVALUATE\n' + sol, hint });
const Mo = (q, tablolar, sol, o) => Object.assign({ t: 'model', q, tablolar, sol }, o || {});
const R = (from, fromCol, to, toCol, o) => Object.assign({ from, fromCol, to, toCol, kard: '*:1', yon: 'tek', aktif: true }, o || {});
const MC = (q, start, sol, must, hint) => ({ t: 'mcode', q, start, sol, must, hint });
const DEP = [{ t: 'Departmanlar', c: 'Departman' }], SEG = [{ t: 'Musteriler', c: 'Segment' }, { t: 'Tarih', c: 'Yil' }];

/* ---------------------------------------------------------------- başlangıç */
ext('tarih', [
  G('Şirketin hikâyesini tek görselde anlat: <b>net satış yıllar boyunca</b> nasıl değişti?', { tur: 'cizgi', eksen: 'Tarih[Yil]', degerler: ['Net Satış'] }, { kural: { turler: ['cizgi', 'sutun', 'alan'], turNeden: 'Zaman ekseni çizgi ya da sütunla okunur.' }, hint: 'Eksen Tarih[Yil], değer Net Satış.' }),
  Q('Verinin kapsadığı dönemi bul: <b>ilk ve son satış tarihini</b> "İlk Satış" ve "Son Satış" adlı iki sütunla tek satırda döndür.', 'ROW("İlk Satış", MIN(Satislar[Tarih]), "Son Satış", MAX(Satislar[Tarih]))', 'ROW("İlk Satış", MIN(...), "Son Satış", MAX(...))'),
  G('Yönetici yalnız bir sayı istiyor: <b>kaç farklı müşteri</b> alışveriş yaptı?', { tur: 'kart', degerler: ['Müşteri Sayısı'] }, { kural: { turler: ['kart'] }, hint: 'Tek sayı: Kart, değer Müşteri Sayısı.' }),
]);
ext('aile', [
  Q('Desktop\'ta Model görünümünde gördüğün tabloları DAX ile listele: <b>1.000\'den fazla satırı olan</b> tabloları INFO.VIEW.TABLES() ile getir.', 'FILTER(INFO.VIEW.TABLES(), [RowCount] > 1000)', 'FILTER(INFO.VIEW.TABLES(), [RowCount] > 1000)'),
  Q('Modelde <b>kaç ilişki</b> var? "İlişki" adlı tek sütunlu bir satır döndür.', 'ROW("İlişki", COUNTROWS(INFO.VIEW.RELATIONSHIPS()))', 'ROW("İlişki", COUNTROWS(INFO.VIEW.RELATIONSHIPS()))'),
  G('Rapor sayfasındaki ilk tabloyu kur: kategori başına <b>net satış ve sipariş sayısı</b>.', { tur: 'tablo', eksen: 'Urunler[Kategori]', degerler: ['Net Satış', 'Sipariş Sayısı'] }, { kural: { turler: ['tablo', 'matris'] }, hint: 'Tablo görseli: Satırlar Kategori, Değerler iki ölçü.' }),
]);
ext('kurulum', [
  { t: 'dax', name: 'Satılan Adet', q: 'Kurulumdan sonraki ilk deneme ölçüsü: <b>Satılan Adet</b>, Satislar[Adet] sütununun toplamı.', sol: 'SUM(Satislar[Adet])', hint: 'SUM(Satislar[Adet])' },
  Q('Veri doğru yüklendi mi? <b>Satislar</b> tablosunun satır sayısını "Satır" adıyla döndür (beklenen 1.620).', 'ROW("Satır", COUNTROWS(Satislar))', 'ROW("Satır", COUNTROWS(Satislar))'),
  G('Kurulum testinin son adımı: <b>sipariş sayısını</b> bir kartta göster.', { tur: 'kart', degerler: ['Sipariş Sayısı'] }, { kural: { turler: ['kart'] } }),
]);
ext('arayuz', [
  Q('Veri bölmesinde <b>Urunler</b> tablosunun alanlarını gör: INFO.VIEW.COLUMNS() içinden Table = "Urunler" satırlarını süz.', 'FILTER(INFO.VIEW.COLUMNS(), [Table] = "Urunler")', 'FILTER(INFO.VIEW.COLUMNS(), [Table] = "Urunler")'),
]);
ext('menuler-turu', [
  G('Biçim bölmesinden önce veri: <b>bölgeye göre net satışı</b> büyükten küçüğe sıralı bir çubuk grafikte göster.', { tur: 'cubuk', eksen: 'Musteriler[Bolge]', degerler: ['Net Satış'], sirala: 'azalan' }, { kural: { turler: ['cubuk', 'sutun'] }, hint: 'Sırala: değere göre azalan.' }),
  Q('Modelleme menüsündeki ilişki yöneticisini DAX ile oku: <b>Satislar</b> tablosundan çıkan ilişkilerin <b>ToTable</b> ve <b>IsActive</b> sütunlarını "Boyut" ve "Etkin" adıyla seç.', 'SELECTCOLUMNS(FILTER(INFO.VIEW.RELATIONSHIPS(), [FromTable] = "Satislar"), "Boyut", [ToTable], "Etkin", [IsActive])', 'SELECTCOLUMNS(FILTER(INFO.VIEW.RELATIONSHIPS(), [FromTable] = "Satislar"), ...)'),
]);
ext('hizmet-kullanici', [
  G('Service\'te bir rapor tüketicisi gibi: <b>Mobil</b> kanalının net satışını kategori kategori gösteren grafiği kur (görsel filtresi Satislar[Kanal]).', { tur: 'sutun', eksen: 'Urunler[Kategori]', degerler: ['Net Satış'], filtre: { alan: 'Satislar[Kanal]', degerler: ['Mobil'] } }, { kural: { turler: ['sutun', 'cubuk'] } }),
]);

/* ---------------------------------------------------------------- veri alma ve bağlantı */
ext('veri-alma', [
  Q('Yükleme sonrası ilk kontrol: <b>Satislar, Urunler ve Musteriler</b> tablolarının satır sayısını "Satış", "Ürün" ve "Müşteri" adlı sütunlarla tek satırda döndür.', 'ROW("Satış", COUNTROWS(Satislar), "Ürün", COUNTROWS(Urunler), "Müşteri", COUNTROWS(Musteriler))', 'ROW("Satış", COUNTROWS(Satislar), ...)'),
]);
ext('veri-baglantilari', [
  Q('DirectQuery\'de bu sorgu kaynağa gider: <b>yıl başına satış satırı sayısı ve tutar toplamı</b>. SUMMARIZECOLUMNS ile Tarih[Yil] grupla; "Satır" ve "Tutar" sütunları.', 'SUMMARIZECOLUMNS(Tarih[Yil], "Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]))', 'SUMMARIZECOLUMNS(Tarih[Yil], "Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]))'),
]);
ext('m-dili', [
  MC('<b>Elektronik</b> kategorisinin satış satırlarını süz. Kaynak tablo <code>Satislar</code> (Power Query\'deki temiz satış tablosu).', 'let\n    Kaynak = Satislar,\n    Elektronik = \nin\n    Elektronik', 'let\n    Kaynak = Satislar,\n    Elektronik = Table.SelectRows(Kaynak, each [Kategori] = "Elektronik")\nin\n    Elektronik', ['Table.SelectRows'], 'Table.SelectRows(Kaynak, each [Kategori] = "Elektronik")'),
]);
ext('pq-donusum', [
  MC('Satislar\'a tarihten <b>Yıl</b> sütunu ekle (tamsayı türünde).', 'let\n    Kaynak = Satislar,\n    Yilli = \nin\n    Yilli', 'let\n    Kaynak = Satislar,\n    Yilli = Table.AddColumn(Kaynak, "Yil", each Date.Year([Tarih]), Int64.Type)\nin\n    Yilli', ['Table.AddColumn', 'Date.Year'], 'Table.AddColumn(Kaynak, "Yil", each Date.Year([Tarih]), Int64.Type)'),
]);
ext('pq-menu', [
  MC('Giriş → Gruplandır komutunun M karşılığı: Satislar\'ı <b>Kategori</b> başına grupla, <b>Tutar</b> sütununun toplamını "Tutar" adıyla hesapla.', 'let\n    Kaynak = Satislar,\n    Grup = \nin\n    Grup', 'let\n    Kaynak = Satislar,\n    Grup = Table.Group(Kaynak, {"Kategori"}, {{"Tutar", each List.Sum([Tutar]), type number}})\nin\n    Grup', ['Table.Group', 'List.Sum'], 'Table.Group(Kaynak, {"Kategori"}, {{"Tutar", each List.Sum([Tutar]), type number}})'),
]);
ext('m-performans', [
  MC('Performans için erken daralt: Satislar\'dan yalnız <b>Tarih, Kategori ve Tutar</b> sütunlarını tut.', 'let\n    Kaynak = Satislar,\n    Dar = \nin\n    Dar', 'let\n    Kaynak = Satislar,\n    Dar = Table.SelectColumns(Kaynak, {"Tarih", "Kategori", "Tutar"})\nin\n    Dar', ['Table.SelectColumns'], 'Table.SelectColumns(Kaynak, {"Tarih", "Kategori", "Tutar"})'),
]);

/* ---------------------------------------------------------------- tasarım */
ext('tema-sayfa', [
  G('Tema renkleri seriyi ayırsın: yıllara göre net satışı <b>kanallara bölünmüş yığılmış sütun</b> grafikte göster.', { tur: 'yigin', eksen: 'Tarih[Yil]', gosterge: 'Satislar[Kanal]', degerler: ['Net Satış'] }, { kural: { turler: ['yigin', 'sutun'] }, hint: 'Eksen Tarih[Yil], Gösterge Satislar[Kanal].' }),
  G('Sayfanın sağ üstüne KPI: <b>brüt kâr</b> kartı.', { tur: 'kart', degerler: ['Brüt Kâr'] }, { kural: { turler: ['kart'] } }),
]);
ext('panolar', [
  G('Panoya sabitlenecek kutucuk: <b>2024 net satışı</b> kartı (görsel filtresi Tarih[Yil] = 2024).', { tur: 'kart', degerler: ['Net Satış'], filtre: { alan: 'Tarih[Yil]', degerler: [2024] } }, { kural: { turler: ['kart'] } }),
]);
ext('power-bi-apps', [
  G('Uygulamanın açılış sayfası için özet: <b>kanal başına net satış ve sipariş sayısı</b> tablosu.', { tur: 'tablo', eksen: 'Satislar[Kanal]', degerler: ['Net Satış', 'Sipariş Sayısı'] }, { kural: { turler: ['tablo', 'matris'] } }),
  G('Uygulama kitlesi yöneticiler: <b>bölgeye göre net satış</b>, büyükten küçüğe.', { tur: 'cubuk', eksen: 'Musteriler[Bolge]', degerler: ['Net Satış'], sirala: 'azalan' }, { kural: { turler: ['cubuk', 'sutun'] } }),
]);

/* ---------------------------------------------------------------- yayın, yönetim, yaşam döngüsü */
ext('yayinlama', [
  Q('Yayımlamadan önce mutabakat: <b>satır sayısı ve tutar toplamı</b> kaynakla aynı mı? "Satır" ve "Tutar" adlı iki sütunla tek satır döndür.', 'ROW("Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]))', 'ROW("Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]))'),
  Q('Net ile brüt farkını yayından önce açıkla: durumu <b>İptal</b> ve <b>İade</b> olan satır sayılarını "İptal" ve "İade" sütunlarıyla tek satırda döndür.', 'ROW("İptal", COUNTROWS(FILTER(Satislar, Satislar[Durum] = "İptal")), "İade", COUNTROWS(FILTER(Satislar, Satislar[Durum] = "İade")))', 'ROW("İptal", COUNTROWS(FILTER(Satislar, Satislar[Durum] = "İptal")), "İade", ...)'),
]);
ext('gateway', [
  Q('Ağ geçidiyle yenilemeden sonra kanal kanal kontrol: <b>Satislar[Kanal]</b> başına satır sayısı ("Satır") ve tutar toplamı ("Tutar").', 'SUMMARIZECOLUMNS(Satislar[Kanal], "Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]))', 'SUMMARIZECOLUMNS(Satislar[Kanal], "Satır", ..., "Tutar", ...)'),
]);
ext('yonetisim', [
  Q('Model envanteri: <b>tarih türündeki</b> bütün sütunları listele (INFO.VIEW.COLUMNS, DataType = "DateTime").', 'FILTER(INFO.VIEW.COLUMNS(), [DataType] = "DateTime")', 'FILTER(INFO.VIEW.COLUMNS(), [DataType] = "DateTime")'),
  Q('Kod incelemesi: ifadesinde <b>CALCULATE</b> geçen ölçü sayısını "CALCULATE kullanan" adıyla döndür.', 'ROW("CALCULATE kullanan", COUNTROWS(FILTER(INFO.VIEW.MEASURES(), CONTAINSSTRING([Expression], "CALCULATE"))))', 'COUNTROWS(FILTER(INFO.VIEW.MEASURES(), CONTAINSSTRING([Expression], "CALCULATE")))'),
]);
ext('bi-yonetimi', [
  Q('BI ekibinin aylık raporu için model envanteri: <b>tablo, ölçü ve ilişki sayısını</b> "Tablo", "Ölçü", "İlişki" sütunlarıyla tek satırda döndür.', 'ROW("Tablo", COUNTROWS(INFO.VIEW.TABLES()), "Ölçü", COUNTROWS(INFO.VIEW.MEASURES()), "İlişki", COUNTROWS(INFO.VIEW.RELATIONSHIPS()))', 'ROW("Tablo", COUNTROWS(INFO.VIEW.TABLES()), ...)'),
]);
ext('kurumsal-model', [
  Q('Kurumsal modelde pasif yolları bul: <b>pasif ilişkilerin</b> FromTable, FromColumn ve ToTable sütunlarını seç.', 'SELECTCOLUMNS(FILTER(INFO.VIEW.RELATIONSHIPS(), [IsActive] = FALSE()), "FromTable", [FromTable], "FromColumn", [FromColumn], "ToTable", [ToTable])', 'SELECTCOLUMNS(FILTER(INFO.VIEW.RELATIONSHIPS(), [IsActive] = FALSE()), ...)'),
]);
ext('yasam-dongusu', [
  Q('Değişiklik incelemesinde hızlı tarama: ifadesinde <b>DIVIDE</b> geçen ölçüleri listele, yalnız <b>Name</b> sütununu "Ölçü" adıyla seç.', 'SELECTCOLUMNS(FILTER(INFO.VIEW.MEASURES(), CONTAINSSTRING([Expression], "DIVIDE")), "Ölçü", [Name])', 'SELECTCOLUMNS(FILTER(INFO.VIEW.MEASURES(), CONTAINSSTRING([Expression], "DIVIDE")), "Ölçü", [Name])'),
  { t: 'query', q: 'Ölçüyü modele eklemeden önce yerelde dene: <code>DEFINE MEASURE Satislar[Ortalama Adet] = AVERAGE(Satislar[Adet])</code> tanımla ve <b>kanal başına</b> değerini SUMMARIZECOLUMNS ile döndür.', start: 'DEFINE\n', sol: 'DEFINE\n    MEASURE Satislar[Ortalama Adet] = AVERAGE(Satislar[Adet])\nEVALUATE\nSUMMARIZECOLUMNS(Satislar[Kanal], "Ortalama Adet", [Ortalama Adet])', hint: 'DEFINE MEASURE ... EVALUATE SUMMARIZECOLUMNS(Satislar[Kanal], "Ortalama Adet", [Ortalama Adet])' },
]);
ext('yerel-gelistirme', [
  Q('TMDL\'deki ölçüyü DAX sorgu görünümünde doğrula: <b>Net Satış</b> ölçüsünün ifadesini INFO.VIEW.MEASURES()\'tan getir (Name = "Net Satış"; Name ve Expression sütunları).', 'SELECTCOLUMNS(FILTER(INFO.VIEW.MEASURES(), [Name] = "Net Satış"), "Name", [Name], "Expression", [Expression])', 'SELECTCOLUMNS(FILTER(INFO.VIEW.MEASURES(), [Name] = "Net Satış"), "Name", [Name], "Expression", [Expression])'),
]);
ext('embed-api', [
  Q('REST API <code>executeQueries</code> ile uygulamana göndereceğin sorgu: <b>kanal başına net satış</b> (SUMMARIZECOLUMNS, "Net Satış" sütunu).', 'SUMMARIZECOLUMNS(Satislar[Kanal], "Net Satış", [Net Satış])', 'SUMMARIZECOLUMNS(Satislar[Kanal], "Net Satış", [Net Satış])'),
]);

/* ---------------------------------------------------------------- analiz */
ext('copilot', [
  Q('Copilot\'a hazırlık: modelde <b>tarih tablosu olarak işaretli</b> tabloyu bul (INFO.VIEW.TABLES, DataCategory = "Time").', 'FILTER(INFO.VIEW.TABLES(), [DataCategory] = "Time")', 'FILTER(INFO.VIEW.TABLES(), [DataCategory] = "Time")'),
  G('Copilot\'un özetleyeceği görseli kendin kur: <b>segmente göre net satış</b>.', { tur: 'sutun', eksen: 'Musteriler[Segment]', degerler: ['Net Satış'] }, { kural: { turler: ['sutun', 'cubuk', 'halka'] } }),
]);
ext('python-r', [
  Q('Python görseline gidecek veri kümesini önce DAX ile hazırla: <b>yaş grubu başına</b> net satış ("Net Satış") ve müşteri sayısı ("Müşteri").', 'SUMMARIZECOLUMNS(Musteriler[YasGrubu], "Net Satış", [Net Satış], "Müşteri", [Müşteri Sayısı])', 'SUMMARIZECOLUMNS(Musteriler[YasGrubu], "Net Satış", [Net Satış], "Müşteri", [Müşteri Sayısı])'),
]);

/* ---------------------------------------------------------------- sınav ve bitirme */
ext('dp600', [
  Q('Altın katman tablosu: <b>yıl ve kategori</b> başına net satış. SUMMARIZECOLUMNS(Tarih[Yil], Urunler[Kategori], "Net Satış", [Net Satış]).', 'SUMMARIZECOLUMNS(Tarih[Yil], Urunler[Kategori], "Net Satış", [Net Satış])', 'SUMMARIZECOLUMNS(Tarih[Yil], Urunler[Kategori], "Net Satış", [Net Satış])'),
  { t: 'dax', name: 'Sipariş Başına Net', q: '<b>Sipariş Başına Net</b>: [Net Satış] bölü [Sipariş Sayısı] (sıfıra bölmede boş).', sol: 'DIVIDE([Net Satış], [Sipariş Sayısı])', hint: 'DIVIDE([Net Satış], [Sipariş Sayısı])' },
]);
ext('final-hazirlik', [
  { t: 'dax', name: 'Yıllık Büyüme (Final)', q: 'Bitirme raporunun ana ölçüsü: <b>Yıllık Büyüme (Final)</b> = bu dönemin [Net Satış]\'ının geçen yılın aynı dönemine göre değişim oranı (SAMEPERIODLASTYEAR, DIVIDE).', sol: 'VAR Onceki = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN DIVIDE([Net Satış] - Onceki, Onceki)', grid: [{ t: 'Tarih', c: 'Yil' }], hint: 'VAR Onceki = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih])) RETURN DIVIDE([Net Satış] - Onceki, Onceki)' },
]);

/* ---------------------------------------------------------------- Fabric: tarayıcıda yapılabilen veri işi */
ext('fabric-giris', [
  Q('Direct Lake adayı büyük olgu tablolarını bul: satır sayısına göre <b>en büyük 3 tabloyu</b> getir.', 'TOPN(3, INFO.VIEW.TABLES(), [RowCount], DESC)', 'TOPN(3, INFO.VIEW.TABLES(), [RowCount], DESC)'),
]);
ext('fabric-yildiz', [
  Mo('Lakehouse\'tan gelen gider tablolarını yıldız şemaya bağla: <b>Giderler</b> olgusunu <b>GiderTurleri</b> ve <b>Departmanlar</b> boyutlarına bağla.', ['Giderler', 'GiderTurleri', 'Departmanlar'], [R('Giderler', 'GiderTuru', 'GiderTurleri', 'GiderTuru'), R('Giderler', 'DepartmanNo', 'Departmanlar', 'DepartmanNo')], { kontrol: { satir: 'Departmanlar[Departman]', olcu: 'Gider' }, hint: 'Olgu (çok tarafı) Giderler; ortak sütunlar GiderTuru ve DepartmanNo.' }),
]);
ext('fabric-onelake', [
  Q('Kısayolla gelen tabloyu doğrula: <b>WebOlaylari</b> satır sayısı ("Olay") ve farklı ziyaretçi sayısı ("Ziyaretçi").', 'ROW("Olay", COUNTROWS(WebOlaylari), "Ziyaretçi", DISTINCTCOUNT(WebOlaylari[ZiyaretciNo]))', 'ROW("Olay", COUNTROWS(WebOlaylari), "Ziyaretçi", DISTINCTCOUNT(WebOlaylari[ZiyaretciNo]))'),
  Q('Olgu tablosunun tanecikliğini doğrula: <b>farklı sipariş sayısını</b> ("Sipariş") ve sipariş başına satır sayısını ("Satır/Sipariş", DIVIDE ile) döndür.', 'ROW("Sipariş", DISTINCTCOUNT(Satislar[SiparisNo]), "Satır/Sipariş", DIVIDE(COUNTROWS(Satislar), DISTINCTCOUNT(Satislar[SiparisNo])))', 'ROW("Sipariş", DISTINCTCOUNT(Satislar[SiparisNo]), "Satır/Sipariş", DIVIDE(COUNTROWS(Satislar), DISTINCTCOUNT(Satislar[SiparisNo])))'),
]);
ext('fabric-lakehouse', [
  Q('Gümüş katman kalite kuralı: <b>teslim tarihi boş</b> satır sayısını "Teslim tarihi boş" adıyla döndür. (Boş tarih karşılaştırmada en küçük değer sayılır; bu yüzden tarih kuralından önce boşları ayrı say.)', 'ROW("Teslim tarihi boş", COUNTROWS(FILTER(Satislar, ISBLANK(Satislar[TeslimTarihi]))))', 'COUNTROWS(FILTER(Satislar, ISBLANK(Satislar[TeslimTarihi])))'),
]);
ext('fabric-data-factory', [
  Q('Artımlı yükün filigranı: bir sonraki çalıştırma için <b>en son satış tarihini</b> "Filigran" adıyla döndür.', 'ROW("Filigran", MAX(Satislar[Tarih]))', 'ROW("Filigran", MAX(Satislar[Tarih]))'),
]);
ext('fabric-pipeline', [
  Q('İşlem hattının son adımı, yük sonrası mutabakat: <b>yıl başına</b> satır sayısı ("Satır") ve tutar toplamı ("Tutar").', 'SUMMARIZECOLUMNS(Tarih[Yil], "Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]))', 'SUMMARIZECOLUMNS(Tarih[Yil], "Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]))'),
]);
ext('fabric-anlam-modeli', [
  Q('Direct Lake\'e geçmeden önce: <b>Tarih</b> tablosunda başka sütuna göre sıralanan sütunları listele (INFO.VIEW.COLUMNS, SortByColumn boş değil).', 'FILTER(INFO.VIEW.COLUMNS(), [Table] = "Tarih" && NOT ISBLANK([SortByColumn]))', 'FILTER(INFO.VIEW.COLUMNS(), [Table] = "Tarih" && NOT ISBLANK([SortByColumn]))'),
]);
ext('fabric-copilot', [
  Q('Copilot\'un okuyacağı tanımı kontrol et: <b>Brüt Kâr</b> ölçüsünün ifadesini getir (Name ve Expression).', 'SELECTCOLUMNS(FILTER(INFO.VIEW.MEASURES(), [Name] = "Brüt Kâr"), "Name", [Name], "Expression", [Expression])', 'SELECTCOLUMNS(FILTER(INFO.VIEW.MEASURES(), [Name] = "Brüt Kâr"), ...)'),
]);
ext('fabric-veri-alma', [
  Q('Kaynağı almadan önce profil: WebOlaylari\'nda <b>cihaz başına</b> olay sayısı ("Olay").', 'SUMMARIZECOLUMNS(WebOlaylari[Cihaz], "Olay", COUNTROWS(WebOlaylari))', 'SUMMARIZECOLUMNS(WebOlaylari[Cihaz], "Olay", COUNTROWS(WebOlaylari))'),
]);
ext('fabric-tsql-odev', [
  Q('Ambarda yazdığın <code>GROUP BY</code> sonucunu anlam modelinde doğrula: <b>kategori başına</b> satılan adet ("Adet").', 'SUMMARIZECOLUMNS(Urunler[Kategori], "Adet", SUM(Satislar[Adet]))', 'SUMMARIZECOLUMNS(Urunler[Kategori], "Adet", SUM(Satislar[Adet]))'),
]);
ext('fabric-spark-odev', [
  Q('PySpark\'ta <code>groupBy("Adim").agg(countDistinct("ZiyaretciNo"))</code> sonucunu anlam modelinde doğrula: WebOlaylari\'nda <b>adım başına</b> farklı ziyaretçi sayısı ("Ziyaretçi").', 'SUMMARIZECOLUMNS(WebOlaylari[Adim], "Ziyaretçi", DISTINCTCOUNT(WebOlaylari[ZiyaretciNo]))', 'SUMMARIZECOLUMNS(WebOlaylari[Adim], "Ziyaretçi", DISTINCTCOUNT(WebOlaylari[ZiyaretciNo]))'),
]);

/* ---------------------------------------------------------------- kariyer: projeler ve talepler */
ext('proje-yonetimi-bi', [
  { t: 'dax', name: 'Geciken Proje', q: '<b>Geciken Proje</b>: gerçek bitişi planlanan bitişten sonra olan proje sayısı (Projeler tablosu).', sol: 'COUNTROWS(FILTER(Projeler, Projeler[BitisGercek] > Projeler[BitisPlan]))', grid: DEP, hint: 'COUNTROWS(FILTER(Projeler, Projeler[BitisGercek] > Projeler[BitisPlan]))' },
  { t: 'dax', name: 'Bütçe Kullanımı', q: '<b>Bütçe Kullanımı</b>: harcanan tutarın bütçeye oranı (Projeler[Harcanan] toplamı / Projeler[Butce] toplamı).', sol: 'DIVIDE(SUM(Projeler[Harcanan]), SUM(Projeler[Butce]))', grid: DEP, hint: 'DIVIDE(SUM(Projeler[Harcanan]), SUM(Projeler[Butce]))' },
]);
ext('paydas-iletisim', [
  { t: 'dax', name: 'Ortalama İlk Yanıt', q: 'Destek ekibi paydaşının sorusu: <b>Ortalama İlk Yanıt</b> kaç dakika? (Talepler[IlkYanitDk] ortalaması)', sol: 'AVERAGE(Talepler[IlkYanitDk])', grid: SEG, hint: 'AVERAGE(Talepler[IlkYanitDk])' },
]);
ext('portfoy-kariyer', [
  { t: 'dax', name: 'Portföy Kategori Payı', q: 'Portföy raporunun anlatı ölçüsü: <b>Portföy Kategori Payı</b> = kategorinin [Net Satış]\'ı bütün kategorilerin içindeki payı (Kategoriler filtresini kaldır).', sol: 'DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Kategoriler)))', hint: 'DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Kategoriler)))' },
]);
})(window);
