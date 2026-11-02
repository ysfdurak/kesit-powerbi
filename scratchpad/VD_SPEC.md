# Kesit Power BI — "Veri setleri" vaka paketi yazma kuralları

Kesit Power BI (eski adıyla PBIPatika) Türkçe bir Power BI / DAX öğrenme uygulaması (/home/claude/pbi). Kardeş uygulama Kesit SQL'in hayali veri setleri
Power BI'a taşınıyor. Her veri seti, öğrencinin **Power BI Desktop'ta** CSV'leri yükleyip modeli kuracağı, ölçüleri yazacağı ve
rapor tasarlayacağı uçtan uca bir vaka paketi olacak. Uygulama paketi bir sayfada gösterir; CSV'ler zip olarak indirilir.
Öğrenci Desktop'ta bulduğu sayıyı paketteki **beklenen değerle** karşılaştırır. Bu yüzden her sayı doğru olmalı.

**Sen yalnızca sana verilen dosyayı yazarsın:** `/home/claude/pbi/vd_<id>.js`. Başka dosyaya dokunma.

## Kaynak veri
- CSV'ler: `/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/ds/csv/<src>/<tablo>.csv` (UTF-8 BOM, virgülle ayrılmış, ondalık nokta, tarih `YYYY-MM-DD`, tarih-saat `YYYY-MM-DD HH:MM:SS`, boş hücre = null).
- Aynı veri SQLite olarak: `.../scratchpad/ds/<src>.sqlite` (sayıları bağımsız doğrulamak için).
- Veriyi üreten betik ve sütun açıklamaları: `.../scratchpad/sqlsrc/<dosya>.js` (db.js, hv.js, lk.js, ik.js, bk.js). **Betiğin başındaki yorumları ve kodu oku**: veriye bilerek yerleştirilmiş örüntüler ve veri kalitesi tuzakları var (ör. kapanmamış kayıtlar, boş alanlar, dedektif vakası izleri). Bunları vaka anlatısında ve görevlerde kullan. `SQLP_COLMETA` sütun açıklamalarını içerir; Türkçe açıklamaları oradan alıp Power BI'a uyarla.
- Tablo ve sütun adlarını CSV'deki gibi kullan (İngilizce snake_case). Öğrenci Desktop'ta aynı adları görecek.

## Dosya şablonu
```js
/* Kesit Power BI — <veri seti adı> vaka paketi */
(function (W) {
'use strict';
(W.PBI_DATASETS = W.PBI_DATASETS || []).push({
  id: '<id>', name: '<Ad>', sector: '<Sektör>', icon: '<tek emoji>', color: '#RRGGBB', lv: 'orta', src: '<src>',
  period: 'Eylül–Aralık 2024', tagline: 'Bir cümlelik özet',
  roles: ['analist', 'gelistirici'],            // uygun patikalar: analist, gelistirici, dax, pl300, dp600, yonetici, karar
  story: `<p>…</p>`,                            // 1.500–3.000 karakter HTML: şirket, iş sorusu, paydaşlar, senden beklenen
  tables: [ { name: 'hv_flights', kind: 'fact', desc: 'Uçuşlar (3.173)', cols: [['flight_id', 'Tam sayı', 'Uçuş kaydı (anahtar)'], …] }, … ],
  derive: [ { t: 'hv_flights', c: 'Tarih', from: 'sched_dep', fn: 'date', why: 'Takvim ilişkisi için tarih-saatten yalnız tarih' } ],
  calendar: { name: 'Takvim', from: '2024-09-01', to: '2024-12-31' },
  rels: [ ['hv_flights', 'route_id', 'hv_routes', 'route_id'], ['hv_flights', 'Tarih', 'Takvim', 'Tarih'], ['hv_bookings', 'BookTarih', 'Takvim', 'Tarih', { inactive: true, why: '…' }] ],
  prep: [ 'Power Query adımı (HTML olabilir)', … ],
  dateTableDax: 'Takvim =\nADDCOLUMNS(\n    CALENDAR(DATE(2024, 9, 1), DATE(2024, 12, 31)),\n    "Yil", YEAR([Date]), …\n)',
  measures: [ { name: 'Uçuş Sayısı', expr: 'COUNTROWS(hv_flights)', desc: '…', folder: 'Temel' }, … ],
  tasks: [ { id: 'k1', lv: 'temel', q: '…', hint: '…', name: 'İptal Edilen Uçuş', dax: 'CALCULATE([Uçuş Sayısı], hv_flights[status] = "cancelled")', expect: 62, unit: 'adet', sql: "select count(*) from hv_flights where status = 'cancelled'", explain: '…' }, … ],
  dashboard: { title: '…', audience: '…', pages: [ { name: '…', purpose: '…', visuals: ['…'], interactions: ['…'] } ] },
  traps: [ '…' ],
  portfolio: [ '…' ]
});
})(window);
```

## Alanların kuralları
- **tables:** Pakette kullanılacak tüm CSV'ler. `kind`: 'fact' (olay/hareket) ya da 'dim' (boyut). `cols`: CSV'deki **her** sütun, sırası CSV ile aynı: `[ad, Power BI veri türü (Tam sayı / Ondalık sayı / Sabit ondalık sayı / Metin / Tarih / Tarih/Saat / Doğru/Yanlış), açıklama]`. `desc` içinde satır sayısı.
- **derive:** Power Query'de eklenecek türetilmiş sütunlar. `fn`: 'date' (tarih-saatten tarih), 'hour', 'year', 'weekday' (Pazartesi=1). Doğrulayıcı bunları aynı kuralla üretir. `prep` adımlarında nasıl ekleneceğini (Sütun ekle → … ya da M ifadesi `Date.From([sched_dep])`) yaz.
- **calendar:** Doğrulayıcı şu sütunlarla bir takvim kurar: `Tarih, Yil, CeyrekNo, Ceyrek ("Ç1"), AyNo, Ay ("Oca", "Şub"…), YilAy ("2024-09"), Gun, GunNo (Pazartesi=1), HaftaninGunu ("Pazartesi"…), HaftaSonu ("Evet"/"Hayır")`. `dateTableDax` öğrencinin Desktop'ta aynı tabloyu kuracağı DAX olmalı (aynı sütun adları ve değerler; `FORMAT` yerine `SWITCH` ile Türkçe ay adları önerilir, çünkü Desktop'un dili farklı olabilir). Takvimi Tarih tablosu olarak işaretleme ve sıralama sütunu (Ay → AyNo) adımlarını `prep`e yaz.
- **rels:** `[çokTarafıTablo, sütun, birTarafıTablo, sütun, {inactive?, why?}]`. Bir tarafı benzersiz olmalı. Rol oynayan tarih ilişkilerinde biri etkin, diğerleri `inactive: true` ve görevlerde USERELATIONSHIP kullan.
- **measures:** 12–20 ölçü, `folder` ile gruplu (Temel, Zaman, Oran, İleri gibi). Ölçüler birbirinin üzerine kurulsun. Hepsi motorda hatasız çalışmalı.
- **tasks:** 14–18 görev. Dağılım: ~5 temel, ~6 orta, ~5 ileri. Her görev:
  - `q` (HTML, iş dilinde soru + kırılım/filtre bağlamı açık: "2024 Aralık, yalnızca iç hat"), `hint`, `explain` (çözümün neden böyle olduğu, 1–3 cümle).
  - Çözüm: `dax` (ölçü ifadesi, `Ad =` olmadan; `name` ile adı) **ya da** `query` (EVALUATE … sorgusu, `expectRows` ile ilk 1–3 satır).
  - `filters` (isteğe bağlı): görev bir dilimleyici/filtre bağlamındaysa `[{t: 'Takvim', c: 'AyNo', values: [12]}]`. Bağlam filtreyle de, ölçünün içinde CALCULATE ile de verilebilir; `q` metni hangisi olduğunu açıkça söylesin.
  - `expect`: sayı (yuvarlama yok; doğrulayıcı göreli 1e-6 tolerans kullanır, `tol` ile değiştirilebilir) ya da metin. `unit`: 'para' (₺), 'adet', 'yuzde' (0,123 = %12,3), 'dakika', 'km', 'oran'.
  - `sql`: **aynı sorunun SQLite karşılığı**, bağımsız doğrulama için zorunlu. SQL senin DAX'ını kopyalamasın; soruyu SQL'de baştan çöz. Doğrulayıcı DAX sonucu = beklenen = SQL sonucu kontrol eder.
  - Konu çeşitliliği: temel toplamlar ve oranlar, CALCULATE filtreleri, zaman zekâsı (MTD/QTD/önceki ay), USERELATIONSHIP, iteratörler (AVERAGEX/SUMX), RANKX/TOPN, DISTINCTCOUNT, bağlam geçişi, pencere/hareketli ortalama, segmentasyon (SWITCH(TRUE)), veri kalitesi kontrolü (boş/kapanmamış kayıt sayısı), sektöre özgü KPI (havayolu: doluluk, zamanında kalkış; banka: net akış, şüpheli işlem; kurye: teslim süresi, SLA; İK: devir hızı, işe alım süresi; bisiklet: istasyon dengesizliği, yağmur etkisi).
- **dashboard:** 3–4 sayfalık rapor brifi: genel bakış, analiz/kırılım, detay (detaya git), araç ipucu sayfası. Her sayfada görseller (tür + alanlar + hangi ölçü), etkileşimler (yer imi, detaya git, araç ipucu, alan parametresi, dilimleyici eşitleme). Uygulamadaki "Dashboardlar" bölümünün diliyle uyumlu, somut.
- **traps:** 4–7 veri kalitesi / modelleme tuzağı (betikteki gerçek örüntülerden): ne olur, nasıl fark edilir, ne yapılır.
- **portfolio:** 3–5 madde: bu projeyi CV'de ve mülakatta nasıl anlatacağın (karar, etki, teknik).

## Kalite
- Özgün yaz; rakip kurs içeriği kopyalama. Sade Türkçe, kısa cümleler; arayüz terimleri Türkçe + ilk geçişte İngilizce parantez.
- Power BI menü yolları ve özellikler doğru olsun; emin değilsen Microsoft Learn'den doğrula (WebSearch → learn.microsoft.com WebFetch).
- Motorun desteklediği DAX fonksiyonları: `/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/daxfn.txt`. Görev çözümlerinde yalnızca bunları kullan.
- Metinde geçen her model sayısını motorla ya da SQLite ile hesapla; uydurma.
- Template literal içinde `${` kullanma.

## Doğrulama
`node /home/claude/recover/vdval.js /home/claude/pbi/vd_<id>.js` → son satır `SORUN 0` olmalı. Doğrulayıcı CSV'lerden modeli kurar, ölçüleri ve görevleri PBIPatika'nın DAX motorunda çalıştırır, sonucu `expect` ve SQLite sonucuyla karşılaştırır. Ayrıca `node -e "global.window=global; require('/home/claude/pbi/vd_<id>.js')"` ile sözdizimini kontrol et.
