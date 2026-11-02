/* Kesit Power BI — Lezzet Kurye vaka paketi */
(function (W) {
'use strict';
var TESLIM = 'FILTER(lk_orders, lk_orders[status] = "teslim")';
var DK = '(lk_orders[delivered_at] - lk_orders[placed_at]) * 1440';
var HIZLI = 'FILTER(lk_orders, NOT ISBLANK(lk_orders[delivered_at]) && (lk_orders[delivered_at] - lk_orders[picked_at]) * 1440 < 5)';
var SQL_DK = "((julianday(delivered_at) - julianday(placed_at)) * 1440)";
var SQL_HIZLI = "delivered_at is not null and (julianday(delivered_at) - julianday(picked_at)) * 1440 < 5";
/* PERCENTILE.INC karşılığı: sıralı listede (n-1)*p konumunda doğrusal ara değer */
function sqlPct(where, p) {
  return "with t as (select " + SQL_DK + " m from lk_orders where " + where + "), r as (select m, row_number() over (order by m) - 1 i from t), " +
    "k as (select (count(*) - 1) * " + p + " h, cast((count(*) - 1) * " + p + " as integer) lo from t) " +
    "select a.m + (k.h - k.lo) * (coalesce(b.m, a.m) - a.m) from k join r a on a.i = k.lo left join r b on b.i = k.lo + 1";
}
(W.PBI_DATASETS = W.PBI_DATASETS || []).push({
  id: 'lezzet-kurye', name: 'Lezzet Kurye', sector: 'Yemek teslimatı', icon: '🛵', color: '#E8553D', lv: 'orta', src: 'lk',
  period: 'Ekim–Aralık 2024', tagline: 'Üç şehirde yemek teslimatı: GMV, teslim süresi, SLA ve Aralık’ta patlayan iadelerin arkasındaki soruşturma.',
  roles: ['analist', 'gelistirici', 'dax', 'karar'],
  story: `<p><b>Lezzet Kurye</b>, İstanbul, Ankara ve İzmir’de çalışan hayali bir yemek siparişi ve teslimat platformu. Müşteri uygulamadan sipariş verir, restoran hazırlar, kurye restorandan alıp kapıya götürür. Elinde Ekim–Aralık 2024’e ait 7.178 sipariş, 14.974 sipariş satırı, 30 restoran, 60 kurye ve 1.209 müşteri var.</p>
<p>Operasyon direktörü üç soru soruyor: <b>Büyüyor muyuz?</b> (GMV, sepet tutarı, aylık değişim), <b>Söz verdiğimiz hızda teslim ediyor muyuz?</b> (35 dakikalık SLA, medyan ve %90’lık dilim teslim süresi, hazırlık süresi) ve <b>Müşteri memnun mu?</b> (iptal oranı, yemek ve kurye puanı, tekrar sipariş veren müşteri payı). Pazarlama ekibi ayrıca indirim kampanyalarının sepeti gerçekten büyütüp büyütmediğini merak ediyor.</p>
<p>Modelde iki ayrı olgu tablosu var: <b>lk_orders</b> sipariş başlığıdır (zamanlar, durum, teslim ücreti, indirim, bahşiş), <b>lk_order_lines</b> ise sipariş detayıdır (ürün, adet, birim fiyat). Ürün tutarı satırlarda, teslim ücreti başlıkta durur. Bu başlık-detay deseni, ücreti satıra taşıyıp toplayan herkesi çift saymaya iter. Zamanlar dakika hassasiyetinde değil saniye hassasiyetinde tutulur; teslim süresini doğru ölçmek de ayrı bir beceridir.</p>
<p>Aralık’ta bir alarm geldi: finans ekibi iade oranının yükseldiğini fark etti. İade edilen siparişin tutarı müşterinin cüzdanına geri yatıyor. Ekim ve Kasım’da iade oranı %2 civarındayken Aralık’ta belirgin biçimde artmış. Destek ekibi “hep aynı restoran, hep aynı saatler” diyor ama kanıt yok. Raporun son bölümünde bir <b>soruşturma</b> yürüteceksin: alarmı sayıyla doğrulayacak, şüpheli restoran ve kuryeyi bulacak, fiziksel olarak imkânsız teslimleri ayıklayacak, bu siparişleri veren hesapların kimin davetiyle açıldığını ortaya çıkaracak ve zararı TL olarak hesaplayacaksın.</p>
<p><b>Senden beklenen:</b> CSV’leri Power BI Desktop’a yükle, yıldız şemayı kur (takvim tablosu, rol oynayan iki tarih ilişkisi), 20 ölçülük kütüphaneyi yaz, görevlerdeki sayıları bul ve dört sayfalık bir operasyon raporu tasarla. Raporun hem yönetime “bugün nasılız” sorusunu hem de denetim ekibine “ne oldu” sorusunu cevaplamalı.</p>`,
  tables: [
    { name: 'lk_orders', kind: 'fact', desc: 'Sipariş başlığı, her satır bir sipariş (7.178)', cols: [
      ['order_id', 'Tam sayı', 'Sipariş numarası (anahtar)'],
      ['customer_id', 'Tam sayı', 'Siparişi veren müşteri → lk_customers'],
      ['restaurant_id', 'Tam sayı', 'Restoran → lk_restaurants'],
      ['courier_id', 'Tam sayı', 'Kurye → lk_couriers; iptal edilen siparişlerin bir kısmında boş'],
      ['placed_at', 'Tarih/Saat', 'Siparişin verildiği an'],
      ['picked_at', 'Tarih/Saat', 'Kuryenin siparişi restorandan aldığı an; iptalde boş'],
      ['delivered_at', 'Tarih/Saat', 'Teslim anı; iptalde boş'],
      ['status', 'Metin', 'teslim / iptal / iade'],
      ['payment', 'Metin', 'kart / nakit / cüzdan'],
      ['delivery_fee', 'Sabit ondalık sayı', 'Teslim ücreti (TL); ürün tutarı 400 TL ve üzerindeyse 0. Başlık düzeyinde, sipariş başına bir kez'],
      ['discount', 'Sabit ondalık sayı', 'Kampanya indirimi (TL); indirimsiz siparişte 0'],
      ['tip', 'Sabit ondalık sayı', 'Kuryeye bahşiş (TL); gelir değildir, kuryeye gider']] },
    { name: 'lk_order_lines', kind: 'fact', desc: 'Sipariş satırları, her satır bir siparişteki bir ürün (14.974)', cols: [
      ['order_id', 'Tam sayı', 'Sipariş → lk_orders'],
      ['item_id', 'Tam sayı', 'Ürün → lk_menu_items'],
      ['qty', 'Tam sayı', 'Adet'],
      ['unit_price', 'Sabit ondalık sayı', 'Sipariş anındaki birim fiyat (TL)']] },
    { name: 'lk_ratings', kind: 'fact', desc: 'Sipariş değerlendirmeleri, siparişlerin bir kısmında (3.979)', cols: [
      ['order_id', 'Tam sayı', 'Değerlendirilen sipariş → lk_orders (her siparişe en çok bir değerlendirme)'],
      ['food_score', 'Tam sayı', 'Yemek puanı (1–5)'],
      ['courier_score', 'Tam sayı', 'Kurye puanı (1–5)'],
      ['comment', 'Metin', 'Yorum; çoğunlukla boş']] },
    { name: 'lk_customers', kind: 'dim', desc: 'Müşteriler (1.209)', cols: [
      ['customer_id', 'Tam sayı', 'Müşteri numarası (anahtar)'],
      ['full_name', 'Metin', 'Ad soyad'],
      ['city', 'Metin', 'Şehir'],
      ['district', 'Metin', 'İlçe; 74 müşteride boş'],
      ['signup_date', 'Tarih', 'Kayıt tarihi'],
      ['referred_by', 'Tam sayı', 'Bu müşteriyi davet eden müşterinin customer_id değeri (aynı tabloya bakar); davetsiz kayıtta boş'],
      ['is_premium', 'Tam sayı', 'Premium üye mi (1/0)']] },
    { name: 'lk_restaurants', kind: 'dim', desc: 'Restoranlar (30)', cols: [
      ['restaurant_id', 'Tam sayı', 'Restoran numarası (anahtar)'],
      ['name', 'Metin', 'Restoran adı'],
      ['cuisine', 'Metin', 'Mutfak türü (Döner, Pizza, Kebap…)'],
      ['city', 'Metin', 'Şehir'],
      ['district', 'Metin', 'İlçe'],
      ['opened_date', 'Tarih', 'Platforma katılma tarihi; bazı restoranlarda boş'],
      ['commission_pct', 'Ondalık sayı', 'Platformun aldığı komisyon yüzdesi (15 = %15)'],
      ['is_active', 'Tam sayı', 'Aktif mi (1/0)']] },
    { name: 'lk_couriers', kind: 'dim', desc: 'Kuryeler (60)', cols: [
      ['courier_id', 'Tam sayı', 'Kurye numarası (anahtar)'],
      ['full_name', 'Metin', 'Ad soyad'],
      ['city', 'Metin', 'Çalıştığı şehir'],
      ['vehicle', 'Metin', 'motosiklet / bisiklet / araba'],
      ['hired_date', 'Tarih', 'İşe başlama tarihi'],
      ['rating', 'Ondalık sayı', 'Müşterilerin verdiği kurye puanlarının ortalaması; boş olabilir']] },
    { name: 'lk_menu_items', kind: 'dim', desc: 'Menü ürünleri (168)', cols: [
      ['item_id', 'Tam sayı', 'Ürün numarası (anahtar)'],
      ['restaurant_id', 'Tam sayı', 'Ürünün restoranı → lk_restaurants'],
      ['name', 'Metin', 'Ürün adı'],
      ['category', 'Metin', 'Ana yemek / Yan ürün / İçecek / Tatlı / Çorba'],
      ['price', 'Sabit ondalık sayı', 'Güncel menü fiyatı (TL); geçmiş siparişler için unit_price kullan'],
      ['is_vegetarian', 'Tam sayı', 'Vejetaryen mi (1/0)']] }
  ],
  derive: [
    { t: 'lk_orders', c: 'Tarih', from: 'placed_at', fn: 'date', why: 'Takvim ile etkin ilişki: siparişin verildiği gün' },
    { t: 'lk_orders', c: 'TeslimTarih', from: 'delivered_at', fn: 'date', why: 'Takvim ile etkin olmayan ikinci ilişki: teslim günü (iptalde boş)' },
    { t: 'lk_orders', c: 'Saat', from: 'placed_at', fn: 'hour', why: 'Öğle ve akşam yoğunluğunu görmek için siparişin saati (0–23)' }
  ],
  calendar: { name: 'Takvim', from: '2024-01-01', to: '2025-12-31' },
  rels: [
    ['lk_orders', 'customer_id', 'lk_customers', 'customer_id'],
    ['lk_orders', 'restaurant_id', 'lk_restaurants', 'restaurant_id'],
    ['lk_orders', 'courier_id', 'lk_couriers', 'courier_id'],
    ['lk_orders', 'Tarih', 'Takvim', 'Tarih'],
    ['lk_orders', 'TeslimTarih', 'Takvim', 'Tarih', { inactive: true, why: 'Rol oynayan tarih: teslim gününe göre saymak için USERELATIONSHIP ile açılır' }],
    ['lk_order_lines', 'order_id', 'lk_orders', 'order_id'],
    ['lk_order_lines', 'item_id', 'lk_menu_items', 'item_id'],
    ['lk_ratings', 'order_id', 'lk_orders', 'order_id'],
    ['lk_menu_items', 'restaurant_id', 'lk_restaurants', 'restaurant_id', { inactive: true, why: 'Satırlardan restorana iki yol oluşur (siparişler üzerinden ve menü üzerinden); belirsizlik olmaması için bu yol kapalı tutulur. Menü analizinde USERELATIONSHIP ile açılır' }]
  ],
  prep: [
    '<b>Veri al → Metin/CSV</b> (Get data → Text/CSV) ile yedi CSV’yi yükle. Her biri için <b>Verileri dönüştür</b> (Transform data) seçerek Power Query Düzenleyicisi’ni aç. Dosya UTF-8 olduğundan “Dosya kaynağı” 65001: Unicode (UTF-8) olmalı; yoksa Türkçe karakterler bozulur.',
    'Veri türlerini kontrol et: <code>placed_at</code>, <code>picked_at</code>, <code>delivered_at</code> → <b>Tarih/Saat</b>; <code>signup_date</code>, <code>hired_date</code>, <code>opened_date</code> → <b>Tarih</b>; <code>delivery_fee</code>, <code>discount</code>, <code>tip</code>, <code>unit_price</code>, <code>price</code> → <b>Sabit ondalık sayı</b> (Fixed decimal number). Bölgesel ayarın Türkçe ise ondalık nokta yanlış okunabilir: tür değiştirirken <b>Yerel ayarı kullanarak</b> (Using locale) → İngilizce (ABD) seç.',
    'lk_orders tablosuna üç sütun ekle. <b>Sütun ekle → Özel sütun</b> (Add column → Custom column): <code>Tarih = Date.From([placed_at])</code>, <code>TeslimTarih = Date.From([delivered_at])</code> (iptallerde null kalır), <code>Saat = Time.Hour([placed_at])</code>. Türlerini Tarih, Tarih ve Tam sayı yap.',
    'Boşları silme: iptal edilen siparişlerde <code>picked_at</code> ve <code>delivered_at</code>, bir kısmında <code>courier_id</code> boştur ve bu bir hata değil, iş kuralıdır. <b>Kapat ve uygula</b> (Close &amp; Apply).',
    '<b>Modelleme → Yeni tablo</b> (Modeling → New table) ile aşağıdaki DAX’la Takvim tablosunu kur. Tablo 2024 ve 2025’in tamamını kapsar; 1 Ocak 2025 00:xx’te verilen 3 sipariş de takvimde karşılık bulur. Takvimi seç → <b>Tablo araçları → Tarih tablosu olarak işaretle</b> (Mark as date table) → Tarih sütunu.',
    'Takvim[Ay] sütununu seç → <b>Sütun araçları → Sütuna göre sırala</b> (Sort by column) → AyNo. Aynısını HaftaninGunu → GunNo için yap.',
    '<b>Model görünümü</b>nde ilişkileri kur: lk_orders → lk_customers, lk_restaurants, lk_couriers (customer_id, restaurant_id, courier_id); lk_order_lines → lk_orders (order_id) ve lk_menu_items (item_id); lk_orders[Tarih] → Takvim[Tarih] etkin; lk_orders[TeslimTarih] → Takvim[Tarih] <b>etkin değil</b> (kesikli çizgi).',
    'lk_ratings → lk_orders ilişkisinde iki taraf da benzersiz olduğu için Desktop bunu <b>Bire bir</b> (One to one) olarak önerir; bire bir ilişkide çapraz filtre yönü her zaman <b>Her ikisi</b>dir (Both). İlişkiyi düzenle: kardinaliteyi <b>Çoğa bir</b> (Many to one, *:1), çapraz filtre yönünü <b>Tek</b> (Single) yap. Böylece puan tablosu siparişleri süzmez, yalnızca siparişlerden süzülür.',
    'lk_menu_items → lk_restaurants ilişkisini ekleyince Desktop iki yol olduğu için onu etkin yapamaz. Etkin olmayan olarak bırak. Restoranın satış filtresi zaten lk_orders üzerinden gelir.',
    'Anahtar sütunları (order_id, customer_id, restaurant_id, courier_id, item_id ve olgu tablolarındaki Tarih/TeslimTarih) <b>Rapor görünümünde gizle</b>. Ölçüleri boş bir <b>_Ölçüler</b> tablosunda topla ve <b>Görüntüleme klasörü</b> (Display folder) alanıyla Temel, Gelir, Oran, Teslimat, Müşteri, Zaman klasörlerine ayır.',
    'Para ölçülerine <b>Biçim → Para birimi</b> (₺ Türkçe), oran ölçülerine <b>Yüzde</b> (1 ondalık), süre ölçülerine 1 ondalıklı sayı biçimi ver. Ölçü adına “(dk)” eklemek yerine açıklamaya (Description) birim yaz.'
  ],
  dateTableDax: 'Takvim =\nADDCOLUMNS(\n    CALENDAR(DATE(2024, 1, 1), DATE(2025, 12, 31)),\n    "Tarih", [Date],\n    "Yil", YEAR([Date]),\n    "CeyrekNo", QUARTER([Date]),\n    "Ceyrek", "Ç" & QUARTER([Date]),\n    "AyNo", MONTH([Date]),\n    "Ay", SWITCH(MONTH([Date]), 1, "Oca", 2, "Şub", 3, "Mar", 4, "Nis", 5, "May", 6, "Haz", 7, "Tem", 8, "Ağu", 9, "Eyl", 10, "Eki", 11, "Kas", 12, "Ara"),\n    "YilAy", YEAR([Date]) & "-" & IF(MONTH([Date]) < 10, "0", "") & MONTH([Date]),\n    "Gun", DAY([Date]),\n    "GunNo", WEEKDAY([Date], 2),\n    "HaftaninGunu", SWITCH(WEEKDAY([Date], 2), 1, "Pazartesi", 2, "Salı", 3, "Çarşamba", 4, "Perşembe", 5, "Cuma", 6, "Cumartesi", 7, "Pazar"),\n    "HaftaSonu", IF(WEEKDAY([Date], 2) >= 6, "Evet", "Hayır")\n)\n-- Not: CALENDAR "Date" adlı bir sütun üretir. Tabloyu kurduktan sonra Date sütununu gizle (ya da SELECTCOLUMNS ile at); ilişki ve işaretleme için Tarih sütununu kullan.',
  measures: [
    { name: 'Sipariş Sayısı', expr: 'COUNTROWS(lk_orders)', desc: 'Durumu ne olursa olsun tüm siparişler (başlık tablosunda satır sayısı)', folder: 'Temel' },
    { name: 'Teslim Edilen Sipariş', expr: 'CALCULATE([Sipariş Sayısı], lk_orders[status] = "teslim")', desc: 'Durumu teslim olan siparişler; iade edilenler dahil değil', folder: 'Temel' },
    { name: 'İptal Edilen Sipariş', expr: 'CALCULATE([Sipariş Sayısı], lk_orders[status] = "iptal")', desc: 'Teslim edilmeden iptal edilen siparişler', folder: 'Temel' },
    { name: 'İade Edilen Sipariş', expr: 'CALCULATE([Sipariş Sayısı], lk_orders[status] = "iade")', desc: 'Teslim edildikten sonra parası iade edilen siparişler', folder: 'Temel' },
    { name: 'Ürün Tutarı', expr: 'SUMX(lk_order_lines, lk_order_lines[qty] * lk_order_lines[unit_price])', desc: 'Satır düzeyinde adet × sipariş anındaki birim fiyat (TL). Menü fiyatı (price) değil, unit_price kullanılır', folder: 'Temel' },
    { name: 'Teslim Ücreti', expr: 'SUM(lk_orders[delivery_fee])', desc: 'Başlık tablosundan, sipariş başına bir kez sayılan teslim ücreti (TL)', folder: 'Temel' },
    { name: 'İndirim Tutarı', expr: 'SUM(lk_orders[discount])', desc: 'Kampanya indirimlerinin toplamı (TL)', folder: 'Temel' },
    { name: 'GMV', expr: 'CALCULATE([Ürün Tutarı] - [İndirim Tutarı] + [Teslim Ücreti], lk_orders[status] = "teslim")', desc: 'Brüt sipariş hacmi: teslim edilen siparişlerde müşterinin ödediği tutar (ürün − indirim + teslim ücreti). Bahşiş dahil değil', folder: 'Gelir' },
    { name: 'Ortalama Sepet', expr: 'DIVIDE([GMV], [Teslim Edilen Sipariş])', desc: 'Teslim edilen sipariş başına GMV (TL)', folder: 'Gelir' },
    { name: 'İptal Oranı', expr: 'DIVIDE([İptal Edilen Sipariş], [Sipariş Sayısı])', desc: 'İptal edilen / tüm siparişler', folder: 'Oran' },
    { name: 'İade Oranı', expr: 'DIVIDE([İade Edilen Sipariş], [Sipariş Sayısı])', desc: 'İade edilen / tüm siparişler; soruşturmanın alarm göstergesi', folder: 'Oran' },
    { name: 'Medyan Teslim Süresi', expr: 'MEDIANX(' + TESLIM + ', ' + DK + ')', desc: 'Teslim edilen siparişlerde siparişten teslime geçen sürenin medyanı (dakika). Tarih/saat farkı gün cinsindendir; 1440 ile çarpınca dakika olur', folder: 'Teslimat' },
    { name: 'P90 Teslim Süresi', expr: 'PERCENTILEX.INC(' + TESLIM + ', ' + DK + ', 0.9)', desc: 'Teslim süresinin %90’lık dilimi (dakika): siparişlerin %90’ı bu sürede ya da daha kısa sürede teslim edilir', folder: 'Teslimat' },
    { name: 'Ort. Hazırlık Süresi', expr: 'AVERAGEX(FILTER(lk_orders, NOT ISBLANK(lk_orders[picked_at])), (lk_orders[picked_at] - lk_orders[placed_at]) * 1440)', desc: 'Siparişten kuryenin restorandan almasına kadar geçen ortalama süre (dakika); restoran performansı', folder: 'Teslimat' },
    { name: 'SLA Uyum Oranı', expr: 'DIVIDE(COUNTROWS(FILTER(lk_orders, lk_orders[status] = "teslim" && ROUND(' + DK + ', 2) <= 35)), [Teslim Edilen Sipariş])', desc: 'Teslim edilen siparişlerden 35 dakika içinde teslim edilenlerin payı. ROUND, tam 35:00 süren siparişlerde kayan nokta hatasını önler', folder: 'Teslimat' },
    { name: 'Yemek Puanı', expr: 'AVERAGE(lk_ratings[food_score])', desc: 'Ortalama yemek puanı (1–5); restoran memnuniyeti', folder: 'Müşteri' },
    { name: 'Tekrar Müşteri Oranı', expr: 'VAR musteriler = VALUES(lk_orders[customer_id])\nRETURN DIVIDE(COUNTROWS(FILTER(musteriler, CALCULATE([Sipariş Sayısı]) >= 2)), COUNTROWS(musteriler))', desc: 'Seçili dönemde en az iki sipariş veren müşterilerin, sipariş veren tüm müşterilere oranı (bağlam geçişi)', folder: 'Müşteri' },
    { name: 'Yeni Müşteri', expr: 'COUNTROWS(FILTER(VALUES(lk_orders[customer_id]), CALCULATE(MIN(lk_orders[Tarih]), ALL(\'Takvim\')) >= MIN(\'Takvim\'[Tarih])))', desc: 'İlk siparişi seçili dönemde olan müşteriler. Veri Ekim 2024’te başladığı için Ekim’de herkes “yeni” görünür', folder: 'Müşteri' },
    { name: 'GMV Önceki Ay', expr: 'CALCULATE([GMV], PREVIOUSMONTH(\'Takvim\'[Tarih]))', desc: 'Bir önceki takvim ayının GMV’si', folder: 'Zaman' },
    { name: 'GMV Aylık Değişim %', expr: 'DIVIDE([GMV] - [GMV Önceki Ay], [GMV Önceki Ay])', desc: 'GMV’nin önceki aya göre değişimi', folder: 'Zaman' }
  ],
  tasks: [
    { id: 'k1', lv: 'temel', q: 'Tüm dönemde (Ekim–Aralık 2024) siparişlerin yüzde kaçı <b>iptal</b> edildi? Filtre yok.', hint: 'İptal edilenleri CALCULATE ile say, tüm siparişlere DIVIDE ile böl.', name: 'İptal Oranı',
      dax: 'DIVIDE(CALCULATE(COUNTROWS(lk_orders), lk_orders[status] = "iptal"), COUNTROWS(lk_orders))', expect: 0.049874616884926164, unit: 'yuzde',
      sql: "select avg(status = 'iptal') from lk_orders",
      explain: 'Payda tüm siparişlerdir (teslim, iptal, iade). DIVIDE sıfıra bölmede hata yerine boş döndürür. Restoran kırılımına bakınca Ankara’daki Bizim Mutfak %14,9 iptal oranıyla platform ortalamasının üç katında çıkar.' },
    { id: 'k2', lv: 'temel', q: 'Dönemin toplam <b>GMV</b>’si nedir? GMV: teslim edilen siparişlerde ürün tutarı − indirim + teslim ücreti. İptal ve iade dahil değil, bahşiş dahil değil.', hint: 'Ürün tutarı satır tablosunda (qty × unit_price), indirim ve teslim ücreti başlık tablosunda. Üçünü ayrı ölçülerle topla, sonra durum filtresini CALCULATE ile ver.', name: 'GMV',
      dax: 'CALCULATE([Ürün Tutarı] - [İndirim Tutarı] + [Teslim Ücreti], lk_orders[status] = "teslim")', expect: 3389310.2, unit: 'para',
      sql: "select (select sum(l.qty * l.unit_price) from lk_order_lines l join lk_orders o on o.order_id = l.order_id where o.status = 'teslim') - (select sum(discount) from lk_orders where status = 'teslim') + (select sum(delivery_fee) from lk_orders where status = 'teslim')",
      explain: 'Her tutarı kendi tablosunda topladığın için hiçbir sipariş iki kez sayılmaz. lk_orders üzerindeki durum filtresi ilişki yoluyla satırlara da iner.' },
    { id: 'k3', lv: 'temel', q: '<b>Ortalama sepet tutarı</b> nedir? Teslim edilen sipariş başına GMV (TL). Filtre yok.', hint: '[GMV] ölçüsünü teslim edilen sipariş sayısına böl.', name: 'Ortalama Sepet',
      dax: 'DIVIDE([GMV], CALCULATE(COUNTROWS(lk_orders), lk_orders[status] = "teslim"))', expect: 510.592075926484, unit: 'para',
      sql: "select (sum(s.urun) - sum(o.discount) + sum(o.delivery_fee)) / count(*) from lk_orders o join (select order_id, sum(qty * unit_price) urun from lk_order_lines group by order_id) s on s.order_id = o.order_id where o.status = 'teslim'",
      explain: 'Ortalamayı satır tablosunda AVERAGE ile alırsan ürün satırı başına tutarı bulursun. Sepet sipariş düzeyinde bir kavramdır, bu yüzden pay ve payda sipariş düzeyinde olmalı.' },
    { id: 'k4', lv: 'temel', q: 'Veri kalitesi kontrolü: <b>courier_id</b> alanı boş olan kaç sipariş var ve bunların hepsi iptal mi? Kurye atanmamış sipariş sayısını bul. Filtre yok.', hint: 'ISBLANK ya da COUNTBLANK kullan. Sonra aynı filtreyi status ile birlikte bir tabloya koyup durumları gör.', name: 'Kuryesiz Sipariş',
      dax: 'COUNTROWS(FILTER(lk_orders, ISBLANK(lk_orders[courier_id])))', expect: 195, unit: 'adet',
      sql: "select count(*) from lk_orders where courier_id is null",
      explain: 'Boş kurye, iptal edilen 358 siparişin bir kısmında görülür; teslim ve iade siparişlerinde hep kurye vardır. Bu bir iş kuralıdır. Kurye bazlı görsellerde “(Boş)” satırı çıkmasının nedeni budur.' },
    { id: 'k5', lv: 'temel', q: '<b>İzmir</b>’deki restoranların ortalama <b>yemek puanı</b> nedir? Dilimleyici: lk_restaurants[city] = İzmir.', hint: 'Puanlar lk_ratings’te. Restoran filtresi restoran → sipariş → puan zinciriyle iner.', name: 'Yemek Puanı',
      dax: 'AVERAGE(lk_ratings[food_score])', filters: [{ t: 'lk_restaurants', c: 'city', values: ['İzmir'] }], expect: 4.17820324005891, unit: 'oran',
      sql: "select avg(r.food_score) from lk_ratings r join lk_orders o on o.order_id = r.order_id join lk_restaurants s on s.restaurant_id = o.restaurant_id where s.city = 'İzmir'",
      explain: 'lk_ratings ile lk_orders arasında tek yönlü *:1 ilişki kurduğun için restoran filtresi iki adımda puan tablosuna ulaşır. Puanı olmayan siparişler ortalamaya girmez.' },

    { id: 'o1', lv: 'orta', q: 'Çift sayma tuzağı: Bir analist teslim ücretini <b>RELATED</b> ile satır tablosuna taşıyıp satırlar üzerinde topladı. Bu yöntem, doğru teslim ücretinden <b>kaç TL fazla</b> sayar? Tüm siparişler, filtre yok.', hint: 'SUMX(lk_order_lines, RELATED(lk_orders[delivery_fee])) ile [Teslim Ücreti] arasındaki farkı al.', name: 'Çift Sayılan Ücret',
      dax: 'SUMX(lk_order_lines, RELATED(lk_orders[delivery_fee])) - [Teslim Ücreti]', expect: 39621, unit: 'para',
      sql: "select (select sum(o.delivery_fee) from lk_order_lines l join lk_orders o on o.order_id = l.order_id) - (select sum(delivery_fee) from lk_orders)",
      explain: 'Bir siparişte kaç ürün satırı varsa ücret o kadar kez tekrar eder. Başlıkta duran bir tutar başlık tablosunda toplanır; satır düzeyindeki bir tutar da satır tablosunda.' },
    { id: 'o2', lv: 'orta', q: 'Teslim edilen siparişlerde, siparişten teslime geçen sürenin <b>medyanı</b> kaç dakika? Filtre yok.', hint: 'delivered_at − placed_at gün cinsinden bir fark verir; 1440 ile çarp. MEDIANX ile yalnız teslim edilenler üzerinde dolaş.', name: 'Medyan Teslim Süresi',
      dax: 'MEDIANX(' + TESLIM + ', ' + DK + ')', expect: 36.8, unit: 'dakika',
      sql: sqlPct("status = 'teslim'", 0.5),
      explain: 'Ortalama (yaklaşık 37,7 dk) birkaç çok uzun teslimle yukarı çekilir; medyan tipik müşteri deneyimini daha iyi anlatır. Desktop’ta DATEDIFF(…, MINUTE) dakika sınırlarını sayar ve saniyeleri atar; saniye hassasiyeti için tarih farkını 1440 ile çarpmak ya da DATEDIFF(…, SECOND) / 60 kullanmak gerekir.' },
    { id: 'o3', lv: 'orta', q: '<b>Aralık 2024</b>’te teslim süresinin <b>%90’lık dilimi</b> (P90) kaç dakika? Dilimleyici: Takvim[YilAy] = 2024-12 (sipariş tarihine göre).', hint: 'PERCENTILEX.INC(tablo, ifade, 0.9). Tabloyu yalnız teslim edilen siparişlerle sınırla.', name: 'P90 Teslim Süresi',
      dax: 'PERCENTILEX.INC(' + TESLIM + ', ' + DK + ', 0.9)', filters: [{ t: 'Takvim', c: 'YilAy', values: ['2024-12'] }], expect: 52.62333333333, unit: 'dakika',
      sql: sqlPct("status = 'teslim' and placed_at >= '2024-12-01' and placed_at < '2025-01-01'", 0.9),
      explain: 'P90 “en kötü %10’luk deneyim nerede başlıyor” sorusunu cevaplar. SLA hedefi konuşulurken ortalama yerine P90 izlemek kuyruk sorunlarını görünür kılar.' },
    { id: 'o4', lv: 'orta', q: '<b>SLA</b>: Teslim edilen siparişlerin yüzde kaçı <b>35 dakika veya daha kısa</b> sürede teslim edildi? Filtre yok.', hint: 'FILTER içinde hem status = "teslim" hem de süre ≤ 35 koşulu. Süreyi ROUND(…, 2) ile yuvarla: tam 35:00 süren siparişler kayan nokta yüzünden 35,0000001 çıkabilir.', name: 'SLA Uyum Oranı',
      dax: 'DIVIDE(COUNTROWS(FILTER(lk_orders, lk_orders[status] = "teslim" && ROUND(' + DK + ', 2) <= 35)), CALCULATE(COUNTROWS(lk_orders), lk_orders[status] = "teslim"))', expect: 0.4300994275384152, unit: 'yuzde',
      sql: "select avg(round(" + SQL_DK + ", 2) <= 35) from lk_orders where status = 'teslim'",
      explain: 'Verideki 4 sipariş tam 35:00’te teslim edilmiş. Yuvarlamadan karşılaştırırsan bu siparişler motorun hesap biçimine göre SLA içine ya da dışına düşer. Eşik karşılaştırmasında süreyi önce sabit bir hassasiyete yuvarla.' },
    { id: 'o5', lv: 'orta', q: '<b>Teslim tarihine göre</b> Kasım 2024’te kaç sipariş teslim edildi (status = teslim)? Dilimleyici: Takvim[YilAy] = 2024-11. Etkin ilişki sipariş tarihine bağlı; teslim tarihini kullanman gerekiyor.', hint: 'CALCULATE içinde USERELATIONSHIP(lk_orders[TeslimTarih], \'Takvim\'[Tarih]).', name: 'Teslim Tarihine Göre Teslim',
      dax: 'CALCULATE([Teslim Edilen Sipariş], USERELATIONSHIP(lk_orders[TeslimTarih], \'Takvim\'[Tarih]))', filters: [{ t: 'Takvim', c: 'YilAy', values: ['2024-11'] }], expect: 2168, unit: 'adet',
      sql: "select count(*) from lk_orders where status = 'teslim' and delivered_at >= '2024-11-01' and delivered_at < '2024-12-01'",
      explain: 'Gece yarısına yakın verilen siparişler ertesi gün teslim edilir. Ay sınırında iki sayım farklılaşır: sipariş tarihine göre Kasım’da 2.169 teslim varken teslim tarihine göre 2.168. Ekim’in son gecesi Kasım’a geçenler ile Kasım’ın son gecesi Aralık’a geçenler birbirini neredeyse götürür. USERELATIONSHIP yalnız bu hesap için kesikli ilişkiyi açar.' },
    { id: 'o6', lv: 'orta', q: '<b>Aralık 2024</b> GMV’si Kasım’a göre yüzde kaç değişti? Dilimleyici: Takvim[YilAy] = 2024-12.', hint: 'Önceki ayın GMV’sini CALCULATE([GMV], PREVIOUSMONTH(\'Takvim\'[Tarih])) ile al. Takvim tarih tablosu olarak işaretli olmalı.', name: 'GMV Aylık Değişim %',
      dax: 'VAR bu = [GMV]\nVAR once = CALCULATE([GMV], PREVIOUSMONTH(\'Takvim\'[Tarih]))\nRETURN DIVIDE(bu - once, once)', filters: [{ t: 'Takvim', c: 'YilAy', values: ['2024-12'] }], expect: 0.14204276290519466, unit: 'yuzde',
      sql: "with g as (select strftime('%Y-%m', o.placed_at) ay, sum(l.urun) - sum(o.discount) + sum(o.delivery_fee) gmv from lk_orders o join (select order_id, sum(qty * unit_price) urun from lk_order_lines group by order_id) l on l.order_id = o.order_id where o.status = 'teslim' group by 1) select (a.gmv - b.gmv) / b.gmv from g a join g b on a.ay = '2024-12' and b.ay = '2024-11'",
      explain: 'Filtre YilAy sütunundayken PREVIOUSMONTH Tarih sütununa yeni bir filtre koyar. Takvim tarih tablosu olarak işaretli olduğu için YilAy filtresi otomatik kalkar ve gerçekten Kasım hesaplanır.' },
    { id: 'o7', lv: 'orta', q: 'Kampanya etkisi: Teslim edilen siparişlerde <b>indirimli</b> siparişlerin ortalama ürün tutarı, <b>indirimsiz</b> siparişlerinkinden kaç TL fazla? Filtre yok.', hint: 'İki VAR: biri discount > 0, diğeri discount = 0 koşuluyla CALCULATE(DIVIDE([Ürün Tutarı], [Sipariş Sayısı]), …). Farkı döndür.', name: 'İndirimli Sepet Farkı',
      dax: 'VAR indirimli = CALCULATE(DIVIDE([Ürün Tutarı], [Sipariş Sayısı]), lk_orders[status] = "teslim", lk_orders[discount] > 0)\nVAR indirimsiz = CALCULATE(DIVIDE([Ürün Tutarı], [Sipariş Sayısı]), lk_orders[status] = "teslim", lk_orders[discount] = 0)\nRETURN indirimli - indirimsiz', expect: 4.856550932625623, unit: 'para',
      sql: "with s as (select o.order_id, o.discount, sum(l.qty * l.unit_price) urun from lk_orders o join lk_order_lines l on l.order_id = o.order_id where o.status = 'teslim' group by o.order_id, o.discount) select avg(case when discount > 0 then urun end) - avg(case when discount = 0 then urun end) from s",
      explain: 'Fark küçükse indirim sepeti büyütmüyor, yalnızca marjı eritiyor demektir. Bu karşılaştırma nedensellik kanıtlamaz; kampanyanın kime gösterildiği bilinmeden “indirim işe yaramıyor” denemez, ama A/B testi için güçlü bir gerekçedir.' },

    { id: 's1', lv: 'ileri', q: '<b>Soruşturma 1 · Alarm.</b> Aralık 2024’ün iade oranı, Ekim–Kasım 2024’ün birleşik iade oranından kaç <b>yüzde puan</b> yüksek? Filtre yok; dönemleri ölçünün içinde ver.', hint: 'İki CALCULATE: biri Takvim[YilAy] = "2024-12", diğeri Takvim[YilAy] IN {"2024-10", "2024-11"}. Farkı yüzde biçiminde göster.', name: 'İade Oranı Artışı',
      dax: 'VAR aralik = CALCULATE([İade Oranı], \'Takvim\'[YilAy] = "2024-12")\nVAR onceki = CALCULATE([İade Oranı], \'Takvim\'[YilAy] IN {"2024-10", "2024-11"})\nRETURN aralik - onceki', expect: 0.010298482487372161, unit: 'yuzde',
      sql: "select (select avg(status = 'iade') from lk_orders where placed_at >= '2024-12-01' and placed_at < '2025-01-01') - (select avg(status = 'iade') from lk_orders where placed_at >= '2024-10-01' and placed_at < '2024-12-01')",
      explain: 'İki dönemin oranını ayrı ayrı hesaplayıp farkını almak, aylık oranların ortalamasını almaktan farklıdır: Ekim–Kasım oranı iki ayın siparişleri birleştirilerek bulunur. Sipariş hacmi artarken iade sayısı neredeyse ikiye katlanmış.' },
    { id: 's2', lv: 'ileri', q: '<b>Soruşturma 2 · Şüpheliler.</b> Aralık 2024’te en çok iade alan <b>restoran–kurye</b> ikilisi hangisi ve kaç iade almış? Sorgu görünümünde (DAX query view) restoran adı, kurye adı ve iade sayısını en yüksekten sırala.', hint: 'SUMMARIZECOLUMNS(lk_restaurants[name], lk_couriers[full_name], filtre tablosu, "Iade", [İade Edilen Sipariş]) sonucunu TOPN ile kes, ORDER BY ile sırala.',
      query: 'EVALUATE\nTOPN(\n    3,\n    SUMMARIZECOLUMNS(\n        lk_restaurants[name],\n        lk_couriers[full_name],\n        TREATAS({"2024-12"}, \'Takvim\'[YilAy]),\n        "Iade", [İade Edilen Sipariş]\n    ),\n    [Iade], DESC\n)\nORDER BY [Iade] DESC', expectRows: [['Köşe Dönercisi', 'Serdar Yalın', 21]],
      sql: "select r.name, c.full_name, count(*) n from lk_orders o join lk_restaurants r on r.restaurant_id = o.restaurant_id join lk_couriers c on c.courier_id = o.courier_id where o.status = 'iade' and o.placed_at >= '2024-12-01' and o.placed_at < '2025-01-01' group by r.name, c.full_name order by n desc limit 3",
      explain: 'Not: 2. sıradan sonraki ikililer 2’şer iadeyle berabere olduğu için TOPN(3, …) eşitlikleri dahil eder ve 3’ten fazla satır görebilirsin; önemli olan ilk satır. Aralık’ta ikinci sıradaki ikili yalnızca birkaç iade almışken ilk sıradaki ikili tek başına onlarca iade almış. Kurye Serdar Yalın Ağustos 2024’te işe başlamış ve kurye puanı boş: müşteri puanı ortalamasında görünmüyor.' },
    { id: 's3', lv: 'ileri', q: '<b>Soruşturma 3 · İmkânsız teslim.</b> Kuryenin siparişi restorandan aldıktan sonra <b>5 dakikadan kısa</b> sürede teslim ettiği kaç sipariş var? (picked_at → delivered_at). Filtre yok.', hint: 'FILTER içinde NOT ISBLANK(delivered_at) koşulunu unutma: boş − boş farkı 0 sayılır ve iptaller de 5’ten küçük görünür.', name: 'Işınlanan Sipariş',
      dax: 'COUNTROWS(' + HIZLI + ')', expect: 21, unit: 'adet',
      sql: "select count(*) from lk_orders where " + SQL_HIZLI,
      explain: 'Normal yol süresi en hızlı kuryede bile 7–8 dakikanın altına inmez. 5 dakikanın altındaki teslimlerin hepsi Aralık akşamlarında, aynı restorandan ve aynı kuryeyle yapılmış, hepsi cüzdana iade edilmiş: teslim gerçekte yapılmamış olabilir.' },
    { id: 's4', lv: 'ileri', q: '<b>Soruşturma 4 · Davet halkası.</b> Işınlanan siparişleri veren müşterilerin hepsi aynı kişinin davetiyle (referred_by) kayıt olmuş. Davet eden müşterinin <b>adı</b> ne? Filtre yok.', hint: 'Hızlı siparişlerin customer_id değerlerini CALCULATETABLE ile al, TREATAS ile lk_customers[customer_id] üzerine uygula, referred_by değerini MAXX ile çek, sonra LOOKUPVALUE ile adını bul. referred_by aynı tabloya baktığı için ilişki kurulamaz.', name: 'Davet Eden',
      dax: 'VAR musteriler = CALCULATETABLE(VALUES(lk_orders[customer_id]), ' + HIZLI + ')\nVAR davetciler = CALCULATETABLE(VALUES(lk_customers[referred_by]), TREATAS(musteriler, lk_customers[customer_id]))\nRETURN IF(COUNTROWS(davetciler) = 1, LOOKUPVALUE(lk_customers[full_name], lk_customers[customer_id], MAXX(davetciler, lk_customers[referred_by])), "Birden çok davetçi")', expect: 'Bora Keskin', unit: 'metin',
      sql: "select d.full_name from lk_customers d where d.customer_id in (select distinct c.referred_by from lk_orders o join lk_customers c on c.customer_id = o.customer_id where " + SQL_HIZLI.replace(/delivered_at|picked_at/g, function (m) { return 'o.' + m; }) + ") ",
      explain: 'Sipariş tablosundaki bir filtre müşteri tablosuna kendiliğinden çıkmaz (filtre bir taraftan çok tarafa akar). TREATAS, sipariş tarafında bulunan müşteri listesini müşteri tablosuna filtre olarak taşır. Bu 9 hesabın hepsi Kasım 2024’te, iki günde bir, Kadıköy’de açılmış.' },
    { id: 's5', lv: 'ileri', q: '<b>Soruşturma 5 · Zarar.</b> Işınlanan siparişler için müşterilere iade edilen toplam tutar ne kadar? (ürün tutarı − indirim + teslim ücreti). Filtre yok.', hint: 'Ürün, indirim ve ücret ölçülerini aynı CALCULATE içinde, hızlı teslim filtresiyle birlikte hesapla.', name: 'Sahte İade Zararı',
      dax: 'CALCULATE([Ürün Tutarı] - [İndirim Tutarı] + [Teslim Ücreti], ' + HIZLI + ')', expect: 10259.2, unit: 'para',
      sql: "select (select sum(l.qty * l.unit_price) from lk_order_lines l join lk_orders o on o.order_id = l.order_id where " + SQL_HIZLI.replace(/delivered_at|picked_at/g, function (m) { return 'o.' + m; }) + ") - (select sum(discount) from lk_orders where " + SQL_HIZLI + ") + (select sum(delivery_fee) from lk_orders where " + SQL_HIZLI + ")",
      explain: 'CALCULATE’in tablo filtresi lk_orders’ı süzer; ilişki üzerinden satır tablosu da süzülür, böylece üç tutar aynı sipariş kümesi için toplanır. Raporu denetim ekibine bu sayı ve sipariş listesiyle teslim et.' },
    { id: 's6', lv: 'ileri', q: '<b>Soruşturma 6 · Gürültüyü ayıkla.</b> Teslim süresindeki her sıçrama dolandırıcılık değildir. Ortalama teslim süresi <b>45 dakikayı aşan</b> kaç gün var? (Sipariş tarihine göre gün, yalnız teslim edilen siparişler.) Filtre yok.', hint: 'VALUES(\'Takvim\'[Tarih]) üzerinde FILTER ile dolaş; her gün için CALCULATE(AVERAGEX(…)) bağlam geçişiyle o günün ortalamasını verir. Siparişsiz günler boş döner ve 45’i aşmaz.', name: 'Yavaş Gün Sayısı',
      dax: 'COUNTROWS(FILTER(VALUES(\'Takvim\'[Tarih]), CALCULATE(AVERAGEX(' + TESLIM + ', ' + DK + ')) > 45))', expect: 10, unit: 'adet',
      sql: "select count(*) from (select date(placed_at) g, avg(" + SQL_DK + ") m from lk_orders where status = 'teslim' group by 1) where m > 45",
      explain: 'Bu günlerde hazırlık ve yol süresi birlikte uzamış, her şehirde ve her kuryede görülüyor: hava ya da trafik gibi dış bir etki. Işınlanan siparişler tam tersine tek restoran ve tek kuryede toplanıyor. Soruşturmada “yaygın mı, yoğunlaşmış mı?” sorusu sinyali gürültüden ayırır.' }
  ],
  dashboard: {
    title: 'Lezzet Kurye · Operasyon ve Denetim Raporu', audience: 'Operasyon direktörü, şehir müdürleri, pazarlama ve iç denetim',
    pages: [
      { name: 'Genel Bakış', purpose: 'Yönetim “bu ay nasılız?” sorusuna 10 saniyede cevap alsın.',
        visuals: ['Kart görselleri (Card): [GMV], [Ortalama Sepet], [Teslim Edilen Sipariş], [İptal Oranı], [SLA Uyum Oranı], [Medyan Teslim Süresi]', 'Çizgi ve kümelenmiş sütun grafik (Line and clustered column): Takvim[YilAy] eksende, sütun [GMV], çizgi [GMV Aylık Değişim %]', 'Halka grafik (Donut): lk_orders[payment] ile [Sipariş Sayısı]', 'Harita ya da çubuk grafik: lk_restaurants[city] ile [GMV] ve [SLA Uyum Oranı]'],
        interactions: ['YilAy ve şehir dilimleyicileri; dilimleyicileri tüm sayfalarla eşitle (Görünüm → Dilimleyicileri eşitle / Sync slicers)', 'KPI kartlarında koşullu biçimlendirme: SLA %50’nin altındaysa kırmızı'] },
      { name: 'Teslimat Analizi', purpose: 'Gecikmenin nerede doğduğunu bul: restoranda mı, yolda mı, hangi saatte?',
        visuals: ['Matris (Matrix): satırda Takvim[HaftaninGunu], sütunda lk_orders[Saat], değer [Medyan Teslim Süresi]; arka plan rengi ile ısı haritası', 'Kümelenmiş çubuk grafik: lk_restaurants[name] ile [Ort. Hazırlık Süresi], ilk 10 (Top N filtre)', 'Çizgi grafik: Takvim[Tarih] ile [Medyan Teslim Süresi] ve [P90 Teslim Süresi]; 45 dk sabit çizgisi (Analiz bölmesi → Sabit çizgi)', 'Dağılım grafiği (Scatter): lk_couriers[full_name] ayrıntı, X [Teslim Edilen Sipariş], Y [Medyan Teslim Süresi], boyut [Yemek Puanı]'],
        interactions: ['Alan parametresi (Field parameter) ile ölçü seçici: Medyan / P90 / Ortalama hazırlık', 'Restoran çubuğundan “Restoran Detayı” sayfasına detaya git (Drill through)'] },
      { name: 'Restoran Detayı', purpose: 'Detaya git hedef sayfası: tek restoranın siparişleri, puanları ve iadeleri.',
        visuals: ['Detaya git alanı: lk_restaurants[name]; “Tüm filtreleri koru” açık', 'Kartlar: [GMV], [İptal Oranı], [İade Oranı], [Yemek Puanı]', 'Tablo: order_id, placed_at, picked_at, delivered_at, status, payment, kurye adı, [Ürün Tutarı]; status = iade satırları koşullu renkli', 'Sütun grafik: lk_menu_items[category] ile [Ürün Tutarı]'],
        interactions: ['Geri düğmesi otomatik eklenir', 'Yer işareti (Bookmark): “Yalnız iadeler” görünümü ile tüm siparişler arasında geçiş'] },
      { name: 'Soruşturma ve Araç İpucu', purpose: 'Denetim ekibine kanıt zinciri: alarm → şüpheli → imkânsız teslim → davet halkası → zarar. Ayrıca kurye üzerine gelince açılan araç ipucu sayfası.',
        visuals: ['Çizgi grafik: Takvim[YilAy] ile [İade Oranı]', 'Tablo: restoran–kurye ikilileri ve [İade Edilen Sipariş], TOPN filtre 5', 'Kart: [Işınlanan Sipariş] ve [Sahte İade Zararı] (görev ölçüleri)', 'Ayrıştırma ağacı (Decomposition tree): [İade Edilen Sipariş] → restoran → kurye → payment', 'Araç ipucu sayfası (Tooltip page; Biçim bölmesi → Sayfa bilgileri / Page information → Araç ipucu / Tooltip anahtarı Açık): kurye adı, işe başlama tarihi, [Teslim Edilen Sipariş], [Medyan Teslim Süresi], [İade Oranı]'],
        interactions: ['Kurye görsellerinde Biçim → Araç ipuçları (Tooltips) kartı → Sayfa açılır listesinden araç ipucu sayfasını seç; ya da kurye adını sayfanın Araç ipucu alanlarına (Tooltip fields) koyup Otomatik bırak', 'Yer işareti: “Soruşturma özeti” (yalnız Aralık, İstanbul)', 'Satır düzeyi güvenlik (RLS) önerisi: şehir müdürleri yalnız kendi şehirlerini görsün'] }
    ]
  },
  traps: [
    '<b>Başlık-detay çift sayma:</b> delivery_fee ve discount sipariş başlığında, ürün tutarı satırlarda. Ücreti RELATED ile satıra taşıyıp toplarsan ücret, siparişteki satır sayısı kadar tekrar eder: doğru toplam 79.894,40 TL iken 39.621 TL (yaklaşık %50) fazla sayılır. 400 TL üzeri sepetlerde ücret 0 olduğu için hata tam iki kat çıkmaz ve gözden kaçması kolaylaşır. Fark etmek için [Teslim Ücreti] ile satır bazlı toplamı yan yana koy. Çözüm: her tutarı kendi tablosunda topla, sonra ölçüleri birleştir.',
    '<b>Süre hesabında birim ve hassasiyet:</b> Tarih/saat farkı gün cinsindendir; dakika için 1440 ile çarp. DATEDIFF(…, MINUTE) saniyeyi atıp dakika sınırlarını sayar (11:07:59 → 11:08:01 = 1 dk). Tam 35:00 süren 4 sipariş kayan nokta yüzünden eşiğin iki yanına düşebilir: eşik karşılaştırmasından önce ROUND kullan.',
    '<b>Boş zamanlar 0 sayılır:</b> İptal edilen 358 siparişte picked_at ve delivered_at boş. Boş − boş farkı BLANK döner ve “&lt; 5” karşılaştırmasında 0 gibi davranır; “5 dakikadan kısa teslim” gibi filtrelerde iptaller de sayılır. Her süre filtresine NOT ISBLANK ya da status koşulu ekle.',
    '<b>Gece yarısı ve ay sınırı:</b> 97 sipariş verildiği günden sonraki gün teslim edilmiş; 3 sipariş 1 Ocak 2025 00:xx’te verilmiş. Takvim yalnız Ekim–Aralık 2024’ü kapsarsa bu siparişler “(Boş)” tarihe düşer. Takvimi tam yıllarla kur; teslim gününe göre raporlarken USERELATIONSHIP kullan.',
    '<b>1:1 ilişki ve çift yönlü filtre:</b> lk_ratings → lk_orders ilişkisini Desktop bire bir ve çift yönlü önerir. Böyle kalırsa puan tablosundaki bir filtre siparişleri de süzer ve “puanlı siparişler” sessizce tüm KPI’lara uygulanır. Çoğa bir ve tek yön yap.',
    '<b>Kuryesiz ve puansız kayıtlar:</b> İptallerin bir kısmında courier_id boş; kurye 47’nin rating alanı boş. Kurye sıralamalarında boş puanlı kurye en alta düşmez, hiç görünmeyebilir. Puanı boş olan kurye sayısını ayrıca izle; soruşturmada boş alan bir ipucudur.',
    '<b>Veri başlangıcı etkisi:</b> Veri 1 Ekim 2024’te başlıyor. [Yeni Müşteri] ölçüsü Ekim’de sipariş veren herkesi “yeni” sayar, çünkü daha eski sipariş görünmüyor. Yeni müşteri trendini Kasım’dan itibaren yorumla ya da kayıt tarihini (signup_date) kullan; Kasım’daki tüm yeni kayıtların aynı davetçiden geldiği de böyle görülür.'
  ],
  portfolio: [
    'Başlık-detay modelini (sipariş ve sipariş satırı iki ayrı olgu) doğru kurdum; teslim ücretinin satır düzeyinde toplandığında yaklaşık iki kat sayıldığını gösterip ölçü kütüphanesini buna göre tasarladım.',
    'Operasyon için ortalama yerine medyan ve P90 teslim süresi, 35 dakikalık SLA uyumu ve hazırlık süresi göstergelerini tanımladım. Gecikmeli 10 günün tüm şehirlere yayıldığını, yani dış etkili olduğunu gösterdim.',
    'İade alarmını bir soruşturmaya çevirdim: tek restoran–kurye ikilisinde yoğunlaşan iadeleri, 5 dakikanın altındaki fiziksel olarak imkânsız teslimleri ve bunları veren 9 hesabın tek bir davetçiye bağlandığını DAX ile kanıtlayıp zararı TL olarak raporladım.',
    'Teknik olarak USERELATIONSHIP (rol oynayan tarih), TREATAS (ilişkisiz filtre taşıma), bağlam geçişiyle gün bazlı filtreleme, PERCENTILEX.INC ve PREVIOUSMONTH kullandım; her sayıyı SQL ile bağımsız doğruladım.',
    'Mülakatta: “İndirimli siparişlerin sepeti indirimsizlerle hemen hemen aynı; kampanya sepeti büyütmüyor olabilir. Bunu kanıtlamak için A/B testi önerdim” diyerek analizden karara geçişi anlat.'
  ]
});
})(window);
