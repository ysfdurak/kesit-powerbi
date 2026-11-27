/* Kesit Power BI — görsel kurma ve model kurma alıştırmaları (gv.js). Seçmeli ağırlıklı görselleştirme ve modelleme derslerine uygulamalı pratik ekler. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, ex) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('x_gorsel: ders yok', id); return; } l.ex = (l.ex || []).concat(ex); (W.PBI_EXT = W.PBI_EXT || []).push({ id, html: '', ex }); };
const G = (q, sol, o) => Object.assign({ t: 'gorsel', q, sol: Object.assign({ tur: 'sutun', eksen: null, gosterge: null, degerler: [], filtre: { alan: null, degerler: [] }, sirala: 'etiket', topn: 0, hesap: [] }, sol) }, o || {});
const Mo = (q, tablolar, sol, o) => Object.assign({ t: 'model', q, tablolar, sol }, o || {});
const R = (from, fromCol, to, toCol, o) => Object.assign({ from, fromCol, to, toCol, kard: '*:1', yon: 'tek', aktif: true }, o || {});
const SU = R('Satislar', 'UrunNo', 'Urunler', 'UrunNo'), SM = R('Satislar', 'MusteriNo', 'Musteriler', 'MusteriNo'), ST = R('Satislar', 'Tarih', 'Tarih', 'Tarih');

/* ---------------------------------------------------------------- görsel kurma */
ext('gorsel-temel', [
  G('Her kategorinin <b>toplam satışını</b> yan yana karşılaştıran bir görsel kur. Eksene <code>Urunler[Kategori]</code>, değere <code>Toplam Satış</code>.', { tur: 'sutun', eksen: 'Urunler[Kategori]', degerler: ['Toplam Satış'] }, { kural: { turler: ['sutun', 'cubuk'] }, hint: 'Görsel türü sütun ya da çubuk; kategori eksene, ölçü Değerler kutusuna.' }),
  G('Şirketin üç yıllık <b>toplam satışını tek bir sayı</b> olarak göster.', { tur: 'kart', degerler: ['Toplam Satış'] }, { hint: 'Tek sayı için Kart görseli.' }),
  G('Müşterilerin yaşadığı <b>şehirlere göre toplam satışı</b>, en çoktan en aza sıralı bir çubuk grafikte göster.', { tur: 'cubuk', eksen: 'Musteriler[Sehir]', degerler: ['Toplam Satış'], sirala: 'azalan' }, { hint: 'Şehir adları uzun ve çok: çubuk grafik. Sırala: değere göre büyükten küçüğe.' }),
]);
ext('ilk-rapor', [
  G('Net satışın <b>aydan aya</b> nasıl değiştiğini gösteren bir görsel kur (eksende <code>Tarih[YilAy]</code>).', { tur: 'cizgi', eksen: 'Tarih[YilAy]', degerler: ['Net Satış'] }, { kural: { turler: ['cizgi', 'alan'], turNeden: 'Zaman içindeki değişim çizgiyle okunur; 36 ayı sütunla göstermek kalabalık olur.' } }),
  G('Yalnız <b>2024</b> yılının net satışını bir kartta göster (görsel düzeyinde <code>Tarih[Yil]</code> filtresi).', { tur: 'kart', degerler: ['Net Satış'], filtre: { alan: 'Tarih[Yil]', degerler: [2024] } }, { hint: 'Filtre, sıralama, görsel hesaplama bölümünü aç; Tarih[Yil] seç, 2024\'e dokun.' }),
  G('Kategori başına <b>net satış ve brüt kârı</b> aynı tabloda göster.', { tur: 'tablo', eksen: 'Urunler[Kategori]', degerler: ['Net Satış', 'Brüt Kâr'] }, { hint: 'Tablo: Satırlar Kategori, Değerler iki ölçü.' }),
]);
ext('gorsel-secimi', [
  G('Satışların <b>kanallara dağılımını</b> (bütünün parçaları) gösteren görseli seç ve kur.', { tur: 'halka', eksen: 'Satislar[Kanal]', degerler: ['Net Satış'] }, { kural: { turler: ['halka', 'sutun', 'cubuk'], turNeden: 'Üç kanalın bütün içindeki payı: halka (ya da sıralı sütun/çubuk). Çizgi zaman içindir.' } }),
  G('Net satışın <b>yıllar boyunca</b> nasıl değiştiğini göster.', { tur: 'cizgi', eksen: 'Tarih[Yil]', degerler: ['Net Satış'] }, { kural: { turler: ['cizgi', 'alan', 'sutun'], turNeden: 'Zaman ekseni: çizgi ya da sütun. Halka ve tablo eğilimi göstermez.' } }),
  G('40 ürün arasından <b>en çok satan 10 ürünü</b> sıralı bir listede göster.', { tur: 'cubuk', eksen: 'Urunler[Urun]', degerler: ['Net Satış'], sirala: 'azalan', topn: 10 }, { kural: { turler: ['cubuk'], turNeden: 'Uzun ürün adlarını yatay çubuk okutur; sütunda adlar eğik ve kesik kalır.' }, hint: 'Çubuk, Sırala büyükten küçüğe, İlk 10.' }),
  G('Yöneticinin sorusu: “Toplam kaç sipariş aldık?” Tek bakışta cevap veren görseli kur.', { tur: 'kart', degerler: ['Sipariş Sayısı'] }, { kural: { turler: ['kart'], turNeden: 'Tek bir sayı soruluyor: Kart.' } }),
]);
ext('filtreler', [
  G('Kategori başına net satışı yalnız <b>2024</b> için gösteren sütun grafiği kur (görsel düzeyi filtre).', { tur: 'sutun', eksen: 'Urunler[Kategori]', degerler: ['Net Satış'], filtre: { alan: 'Tarih[Yil]', degerler: [2024] } }, { kural: { turler: ['sutun', 'cubuk'] } }),
  G('Müşteri <b>segmentine</b> göre net satışı yalnız <b>Marmara</b> bölgesi için göster.', { tur: 'sutun', eksen: 'Musteriler[Segment]', degerler: ['Net Satış'], filtre: { alan: 'Musteriler[Bolge]', degerler: ['Marmara'] } }, { kural: { turler: ['sutun', 'cubuk', 'halka'] } }),
  G('Ürünlerden yalnız <b>net satışı en yüksek 5 ürünü</b> gösteren bir çubuk grafik kur (İlk N görsel filtresi).', { tur: 'cubuk', eksen: 'Urunler[Urun]', degerler: ['Net Satış'], sirala: 'azalan', topn: 5 }, { kural: { turler: ['cubuk', 'sutun'] } }),
]);
ext('dashboard-kavramlar', [
  G('Hedefe ulaşma oranını <b>tek bir KPI sayısı</b> olarak göster.', { tur: 'kart', degerler: ['Hedef Gerçekleşme %'] }, { kural: { turler: ['kart'] } }),
  G('Kategori başına <b>net satışı ve hedefi</b> yan yana sütunlarla göster. Hedefle karşılaştırmak için kategoriyi <code>Kategoriler</code> tablosundan al.', { tur: 'sutun', eksen: 'Kategoriler[Kategori]', degerler: ['Net Satış', 'Hedef'] }, { kural: { turler: ['sutun', 'cubuk'] }, hint: 'Hedefler ile Urunler, Kategoriler tablosu üzerinden buluşur; Urunler[Kategori] hedefi kırmaz.' }),
]);
ext('gorsel-ilkeler', [
  G('Her bölgede satışın <b>kanallara nasıl bölündüğünü</b>, toplamı da görünecek biçimde göster (eksen <code>Musteriler[Bolge]</code>, gösterge <code>Satislar[Kanal]</code>).', { tur: 'yigin', eksen: 'Musteriler[Bolge]', gosterge: 'Satislar[Kanal]', degerler: ['Net Satış'] }, { kural: { turler: ['yigin'], turNeden: 'Toplam ve parçalar birlikte: yığılmış sütun.' } }),
  G('Kategorileri net satışa göre <b>büyükten küçüğe</b> sıralı gösteren bir çubuk grafik kur.', { tur: 'cubuk', eksen: 'Urunler[Kategori]', degerler: ['Net Satış'], sirala: 'azalan' }, { kural: { turler: ['cubuk', 'sutun'] } }),
]);
ext('etkilesim', [
  G('Bölge × yıl net satış tablosunu <b>matris</b> olarak kur (satırlarda <code>Musteriler[Bolge]</code>, sütunlarda <code>Tarih[Yil]</code>).', { tur: 'matris', eksen: 'Musteriler[Bolge]', gosterge: 'Tarih[Yil]', degerler: ['Net Satış'] }, { kural: { turler: ['matris'] } }),
  G('Müşteri <b>segmenti</b> başına sipariş sayısını yalnız <b>Web</b> kanalı için göster (görsel düzeyi filtre: <code>Satislar[Kanal]</code>).', { tur: 'sutun', eksen: 'Musteriler[Segment]', degerler: ['Sipariş Sayısı'], filtre: { alan: 'Satislar[Kanal]', degerler: ['Web'] } }, { kural: { turler: ['sutun', 'cubuk'] } }),
]);
ext('gorsel-algi', [
  G('Satış temsilcilerinden <b>en çok satan 3 kişiyi</b>, en çoktan en aza göster (<code>Calisanlar[AdSoyad]</code>).', { tur: 'cubuk', eksen: 'Calisanlar[AdSoyad]', degerler: ['Net Satış'], sirala: 'azalan', topn: 3 }, { kural: { turler: ['cubuk'] } }),
]);
ext('hikaye', [
  G('Kategorilerin yıllara göre satışını <b>matris</b>te göster: satırlarda kategori, sütunlarda yıl.', { tur: 'matris', eksen: 'Urunler[Kategori]', gosterge: 'Tarih[Yil]', degerler: ['Net Satış'] }, { kural: { turler: ['matris'] } }),
]);
ext('dashboard-tasarim', [
  G('Pano için <b>2024 yılının geçen yıla göre büyümesini</b> tek sayı olarak göster.', { tur: 'kart', degerler: ['YoY %'], filtre: { alan: 'Tarih[Yil]', degerler: [2024] } }, { kural: { turler: ['kart'] } }),
  G('Müşteri <b>yaş gruplarına</b> göre net satışı yaş sırasıyla gösteren bir sütun grafik kur.', { tur: 'sutun', eksen: 'Musteriler[YasGrubu]', degerler: ['Net Satış'] }, { kural: { turler: ['sutun'], turNeden: 'Yaş grupları sıralı bir ölçek: soldan sağa sütun.', sirali: true } }),
]);

/* ---------------------------------------------------------------- görsel hesaplama */
ext('gorsel-hesaplama', [
  G('Ay ay net satış çizgisine, <b>yılbaşından bugüne değil, ilk aydan itibaren birikimli</b> toplamı görsel hesaplamayla ekle. Ad: <code>Kümülatif</code>.', { tur: 'cizgi', eksen: 'Tarih[YilAy]', degerler: ['Net Satış'], hesap: [{ ad: 'Kümülatif', ifade: 'RUNNINGSUM([Net Satış])' }] }, { kural: { turler: ['cizgi', 'sutun', 'tablo'] }, hint: 'Görsel hesaplama kutusu: Kümülatif = RUNNINGSUM([Net Satış])' }),
  G('Yıllara göre net satış tablosuna, her yılın <b>bir önceki yıldan farkını</b> görsel hesaplamayla ekle. Ad: <code>Fark</code>.', { tur: 'tablo', eksen: 'Tarih[Yil]', degerler: ['Net Satış'], hesap: [{ ad: 'Fark', ifade: '[Net Satış] - PREVIOUS([Net Satış])' }] }, { kural: { turler: ['tablo', 'sutun', 'cizgi'] }, hint: 'PREVIOUS([Net Satış]) bir önceki satırın değeridir.' }),
  G('Aylık net satışa <b>3 aylık hareketli ortalama</b> ekle. Ad: <code>3 Ay Ort.</code>', { tur: 'cizgi', eksen: 'Tarih[YilAy]', degerler: ['Net Satış'], hesap: [{ ad: '3 Ay Ort.', ifade: 'MOVINGAVERAGE([Net Satış], 3)' }] }, { kural: { turler: ['cizgi', 'tablo'] }, hint: 'MOVINGAVERAGE([Net Satış], 3)' }),
  G('Kategori tablosunda her kategorinin <b>toplam içindeki payını</b> görsel hesaplamayla ekle. Ad: <code>Pay</code>.', { tur: 'tablo', eksen: 'Urunler[Kategori]', degerler: ['Net Satış'], hesap: [{ ad: 'Pay', ifade: 'DIVIDE([Net Satış], COLLAPSE([Net Satış], ROWS))' }] }, { kural: { turler: ['tablo', 'sutun', 'cubuk'] }, hint: 'COLLAPSE([Net Satış], ROWS) bir üst düzeyin (burada toplamın) değeridir.' }),
  G('Kategorileri net satışa göre büyükten küçüğe sırala ve <b>birikimli payı</b> (Pareto) görsel hesaplamayla ekle. Ad: <code>Birikimli Pay</code>.', { tur: 'tablo', eksen: 'Urunler[Kategori]', degerler: ['Net Satış'], sirala: 'azalan', hesap: [{ ad: 'Birikimli Pay', ifade: 'DIVIDE(RUNNINGSUM([Net Satış]), COLLAPSE([Net Satış], ROWS))' }] }, { kural: { turler: ['tablo', 'sutun', 'cubuk'] }, hint: 'Önce sırala; RUNNINGSUM görünen sırayla birikir.' }),
]);
ext('pencere', [
  G('Yıllık net satış tablosuna, ilk yıla göre <b>büyüme katsayısını</b> ekle: her yılın satışı / ilk yılın satışı. Ad: <code>Endeks</code>.', { tur: 'tablo', eksen: 'Tarih[Yil]', degerler: ['Net Satış'], hesap: [{ ad: 'Endeks', ifade: 'DIVIDE([Net Satış], FIRST([Net Satış]))' }] }, { kural: { turler: ['tablo', 'cizgi', 'sutun'] }, hint: 'FIRST([Net Satış]) görseldeki ilk satırın değeri.' }),
]);

/* ---------------------------------------------------------------- model kurma */
ext('model-temel', [
  Mo('Satış satırları ürün kataloğuyla bağlı değil. <b>Satislar</b> ile <b>Urunler</b> arasındaki ilişkiyi kur.', ['Satislar', 'Urunler'], [SU], { kontrol: { satir: 'Urunler[Kategori]', olcu: 'Net Satış' }, hint: 'Ortak sütun ürün numarası. Satislar\'da aynı ürün birçok kez geçer: çok tarafı Satislar.' }),
  Mo('Yıldız şemayı tamamla: <b>Satislar</b> olgu tablosunu <b>Urunler</b>, <b>Musteriler</b> ve <b>Tarih</b> boyutlarına bağla.', ['Satislar', 'Urunler', 'Musteriler', 'Tarih'], [SU, SM, ST], { kontrol: { satir: 'Musteriler[Bolge]', olcu: 'Net Satış' } }),
  Mo('Bir arkadaşın modeli kurmuş ama Satislar–Urunler ilişkisini <b>çift yönlü</b> yapmış. Gereksiz ayarı düzelt (ilişkiyi silip doğrusunu kur).', ['Satislar', 'Urunler'], [SU], { baslangic: [R('Satislar', 'UrunNo', 'Urunler', 'UrunNo', { yon: 'cift' })], kontrol: { satir: 'Urunler[Kategori]', olcu: 'Net Satış' } }),
]);
ext('model-ileri', [
  Mo('Kar tanesi: ürünler kategori tablosuna bağlanmalı. <b>Satislar → Urunler → Kategoriler</b> zincirini kur.', ['Satislar', 'Urunler', 'Kategoriler'], [SU, R('Urunler', 'Kategori', 'Kategoriler', 'Kategori')], { kontrol: { satir: 'Kategoriler[Kategori]', olcu: 'Net Satış' } }),
  Mo('Satış temsilcisi ve departman: <b>Satislar[TemsilciNo]</b> çalışan tablosundaki <b>CalisanNo</b>\'ya, çalışanlar da <b>Departmanlar</b>\'a bağlanır. Sütun adları farklı; dikkat.', ['Satislar', 'Calisanlar', 'Departmanlar'], [R('Satislar', 'TemsilciNo', 'Calisanlar', 'CalisanNo'), R('Calisanlar', 'DepartmanNo', 'Departmanlar', 'DepartmanNo')], { kontrol: { satir: 'Departmanlar[Departman]', olcu: 'Net Satış' }, hint: 'İlişki için sütun adlarının aynı olması gerekmez; değerlerin aynı şeyi göstermesi gerekir.' }),
]);
ext('rol-oynayan', [
  Mo('Satislar\'da iki tarih var: sipariş tarihi (<b>Tarih</b>) ve <b>TeslimTarihi</b>. İkisini de Tarih tablosuna bağla; varsayılan analiz sipariş tarihine göre olsun.', ['Satislar', 'Tarih'], [ST, R('Satislar', 'TeslimTarihi', 'Tarih', 'Tarih', { aktif: false })], { kontrol: { satir: 'Tarih[Yil]', olcu: 'Net Satış' }, hint: 'İki tablo arasında yalnız bir ilişki etkin olabilir. Teslim tarihi ilişkisini pasif kur; ölçüde USERELATIONSHIP ile açılır.' }),
]);
ext('hedef', [
  Mo('Hedefler kategori ve tarih düzeyinde, satışlar ürün ve gün düzeyinde. İkisini aynı görselde göstermek için ortak boyutları kur: <b>Kategoriler</b> ve <b>Tarih</b>.', ['Satislar', 'Urunler', 'Kategoriler', 'Hedefler', 'Tarih'], [SU, R('Urunler', 'Kategori', 'Kategoriler', 'Kategori'), R('Hedefler', 'Kategori', 'Kategoriler', 'Kategori'), ST, R('Hedefler', 'Tarih', 'Tarih', 'Tarih')], { kontrol: { satir: 'Kategoriler[Kategori]', olcu: 'Hedef' }, hint: 'Hedefler doğrudan Urunler\'e bağlanamaz (kategori orada tekil değil); paylaşılan boyut Kategoriler.' }),
]);
ext('pl300', [
  G('PL-300 tarzı görev: <b>Elektronik</b> kategorisinde yıllara göre net satışı ve bir önceki yıla göre farkı (<code>Fark</code> görsel hesaplaması) tablo olarak göster.', { tur: 'tablo', eksen: 'Tarih[Yil]', degerler: ['Net Satış'], filtre: { alan: 'Urunler[Kategori]', degerler: ['Elektronik'] }, hesap: [{ ad: 'Fark', ifade: '[Net Satış] - PREVIOUS([Net Satış])' }] }, { kural: { turler: ['tablo', 'sutun', 'cizgi'] } }),
  Mo('PL-300 tarzı görev: talepler müşteri ve tarihe göre analiz edilecek. <b>Talepler</b> tablosunu <b>Musteriler</b> ve <b>Tarih</b> ile ilişkilendir.', ['Talepler', 'Musteriler', 'Tarih'], [R('Talepler', 'MusteriNo', 'Musteriler', 'MusteriNo'), R('Talepler', 'Tarih', 'Tarih', 'Tarih')], { kontrol: { satir: 'Musteriler[Bolge]', olcu: 'Talep Sayısı' } }),
]);

/* ---------------------------------------------------------------- başlangıç dersleri: ilk uygulamalar */
ext('arayuz', [
  G('Rapor görünümündeki ilk görselin: <b>Kart</b>. Değerler kutusuna <code>Toplam Satış</code> ölçüsünü koy.', { tur: 'kart', degerler: ['Toplam Satış'] }, { hint: 'Görsel türü Kart, Değerler: Toplam Satış.' }),
  G('Alan kutularını tanı: <b>Tablo</b> görselinde Satırlar kutusuna <code>Musteriler[Bolge]</code>, Değerler kutusuna <code>Toplam Satış</code> koy.', { tur: 'tablo', eksen: 'Musteriler[Bolge]', degerler: ['Toplam Satış'] }, { kural: { turler: ['tablo', 'matris'] } }),
]);
ext('menuler-turu', [
  G('Ekle menüsünden bir sütun grafik eklediğini düşün: eksene <code>Tarih[Yil]</code>, değere <code>Toplam Satış</code> koy.', { tur: 'sutun', eksen: 'Tarih[Yil]', degerler: ['Toplam Satış'] }, { kural: { turler: ['sutun', 'cizgi'] } }),
]);
ext('hizmet-kullanici', [
  G('Service\'te rapor okuyan biri gibi: yalnız <b>Ege</b> bölgesindeki müşterilerin satışını kategoriye göre göster (filtre bölmesi).', { tur: 'cubuk', eksen: 'Urunler[Kategori]', degerler: ['Net Satış'], filtre: { alan: 'Musteriler[Bolge]', degerler: ['Ege'] } }, { kural: { turler: ['cubuk', 'sutun'] } }),
  G('Yöneticinin istediği tek sayı: <b>2023</b> yılının sipariş sayısı.', { tur: 'kart', degerler: ['Sipariş Sayısı'], filtre: { alan: 'Tarih[Yil]', degerler: [2023] } }, { kural: { turler: ['kart'] } }),
]);
ext('bicim-temel', [
  G('Biçimlendirmeden önce düzen: kategorileri <b>net satışa göre büyükten küçüğe</b> sıralı bir çubuk grafikte göster.', { tur: 'cubuk', eksen: 'Urunler[Kategori]', degerler: ['Net Satış'], sirala: 'azalan' }, { kural: { turler: ['cubuk'] } }),
]);
ext('tema-sayfa', [
  G('Sayfanın ana görseli: segment başına net satış ve brüt kârı yan yana gösteren kümelenmiş sütun.', { tur: 'sutun', eksen: 'Musteriler[Segment]', degerler: ['Net Satış', 'Brüt Kâr'] }, { kural: { turler: ['sutun', 'cubuk'] } }),
]);
ext('analiz-ozellikleri', [
  G('Analiz için başlangıç tablosu: <b>yaş grubu × yıl</b> net satış matrisi.', { tur: 'matris', eksen: 'Musteriler[YasGrubu]', gosterge: 'Tarih[Yil]', degerler: ['Net Satış'] }, { kural: { turler: ['matris'] } }),
]);

ext('veri-alma', [
  { t: 'dax', name: 'Yüklenen Satır', q: '<b>Yüklenen Satır</b>: veriyi aldıktan sonra ilk kontrol: Satislar tablosuna kaç satır yüklendi?', sol: 'COUNTROWS(Satislar)', hint: 'COUNTROWS(Satislar)' },
  { t: 'dax', name: 'Ürün Kataloğu Satırı', q: '<b>Ürün Kataloğu Satırı</b>: Urunler tablosunda kaç ürün var? (Kategoriye göre kontrol edilir.)', sol: 'COUNTROWS(Urunler)', grid: [{ t: 'Urunler', c: 'Kategori' }], hint: 'COUNTROWS(Urunler)' },
]);
ext('veri-baglantilari', [
  { t: 'dax', name: 'Kaynak Mutabakatı', q: '<b>Kaynak Mutabakatı</b>: kaynak sistemdeki rapor 1.620 satır diyor. Satislar tablosundaki satır sayısı ile 1620 arasındaki farkı döndür (0 ise eksiksiz yüklenmiş).', sol: 'COUNTROWS(Satislar) - 1620', grid: [{ t: 'Tarih', c: 'Yil' }], hint: 'COUNTROWS(Satislar) - 1620; toplamda 0 olmalı.' },
  { t: 'dax', name: 'Tutar Toplamı (Kontrol)', q: '<b>Tutar Toplamı (Kontrol)</b>: kaynakla karşılaştırmak için Satislar[Tutar] sütununun ham toplamı (iptaller dahil).', sol: 'SUM(Satislar[Tutar])', hint: 'SUM(Satislar[Tutar])' },
]);
})(typeof window !== 'undefined' ? window : globalThis);
