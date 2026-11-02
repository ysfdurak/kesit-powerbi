/* Kesit Power BI — “Sık karıştırılanlar” kartları ve belirtiye göre “Sık hatalar” kataloğu. */
(function (W) {
'use strict';

W.PBI_CONFUSED = [
/* ---------------- DAX ---------------- */
{
  id: 'all-ailesi', area: 'DAX', lesson: 'filter-all',
  title: 'ALL / ALLSELECTED / REMOVEFILTERS / ALLEXCEPT',
  items: [
    { n: 'ALL', d: 'Verilen tablo ya da sütunlardaki tüm filtreleri kaldırır; tablo fonksiyonu olarak da tüm satırları döndürür.' },
    { n: 'ALLSELECTED', d: 'Görselin kendi satır/sütun filtrelerini kaldırır ama dilimleyici ve filtre bölmesinden gelen seçimi korur.' },
    { n: 'REMOVEFILTERS', d: 'CALCULATE içinde ALL ile aynı işi yapar; yalnızca filtre kaldırıcıdır, tablo döndürmez, niyeti daha açık gösterir.' },
    { n: 'ALLEXCEPT', d: 'Bir tablodaki (genişletilmiş tablo dahil) tüm filtreleri, belirttiğin sütunlar hariç kaldırır.' }
  ],
  rule: 'Pay hesabında payda “her şey” ise ALL/REMOVEFILTERS, “kullanıcının seçtiği her şey” ise ALLSELECTED kullan. ALLEXCEPT’i yalnızca korunacak sütunlar azsa ve tablo genişlemesini bilerek kullanıyorsan seç.',
  body: 'Aşağıdaki demoda her satırda önce `Urunler[Kategori] = "Elektronik"` filtresi kurulur, sonra iç CALCULATE farklı bir kaldırıcı uygular. `ALL(Satislar[Kanal])` yalnızca kanalı kaldırır (Elektronik kalır). `ALLEXCEPT(Satislar, Satislar[Kanal])` kanal dışındaki her şeyi siler; Urunler genişletilmiş Satislar tablosunun parçası olduğu için Elektronik filtresi de gider. `ALL(Satislar)` hepsini siler. ALLSELECTED farkı yalnızca bir dilimleyici seçimi olduğunda görünür; seçim yoksa ALL ile aynı sonucu verir.',
  demo: { grid: { t: 'Satislar', c: 'Kanal' }, noTotal: true, rows: [
    ['Elektronik (kaldırıcı yok)', 'CALCULATE([Net Satış], Urunler[Kategori] = "Elektronik")'],
    ['ALL(Satislar[Kanal])', 'CALCULATE(CALCULATE([Net Satış], ALL(Satislar[Kanal])), Urunler[Kategori] = "Elektronik")'],
    ['ALLEXCEPT(Satislar, Satislar[Kanal])', 'CALCULATE(CALCULATE([Net Satış], ALLEXCEPT(Satislar, Satislar[Kanal])), Urunler[Kategori] = "Elektronik")'],
    ['ALL(Satislar)', 'CALCULATE(CALCULATE([Net Satış], ALL(Satislar)), Urunler[Kategori] = "Elektronik")']
  ] },
  quiz: [
    { q: 'Raporda yıl dilimleyicisinde 2024 seçili. Kategori payının paydası yalnızca 2024’ün tüm kategorilerini içermeli. Paydada hangisi?', o: ['`REMOVEFILTERS(Urunler[Kategori], Tarih)`', '`ALL(Urunler)`', '`ALL(Satislar)`', '`ALLSELECTED(Urunler[Kategori])`'], a: 3, why: 'ALLSELECTED görselin kategori satırlarının filtresini kaldırır ama dilimleyiciden gelen 2024 seçimini korur. ALL(Urunler) da yılı korurdu ama aynı görsele bir ürün dilimleyicisi eklenirse onu da silerdi; ALL(Satislar) yıl filtresini de kaldırır.' },
    { q: '`CALCULATE([Net Satış], ALLEXCEPT(Satislar, Satislar[Kanal]))` kategori × kanal matrisinde ne gösterir?', o: ['Her kanalın tüm kategorilerdeki satışını', 'Her hücrede genel toplamı', 'Hücrenin kendi değerini', 'Her kategorinin tüm kanallardaki satışını'], a: 0, why: 'ALLEXCEPT, genişletilmiş Satislar tablosundaki (Urunler dahil) tüm filtreleri kaldırır, yalnızca Kanal’ı korur. Sonuç: aynı kanal sütununda her kategoride o kanalın toplamı.' },
    { q: 'REMOVEFILTERS ile ALL arasındaki gerçek fark hangisi?', o: ['REMOVEFILTERS dilimleyiciyi korur', 'REMOVEFILTERS tablo döndürmez', 'ALL yalnızca sütun alabilir, tablo alamaz', 'REMOVEFILTERS satır bağlamını da kaldırır'], a: 1, why: 'CALCULATE filtre argümanı olarak ikisi aynı işi yapar. Fark: ALL bir tablo fonksiyonudur (FILTER(ALL(...)) içinde kullanılabilir), REMOVEFILTERS yalnızca filtre kaldırıcıdır.' }
  ]
},
{
  id: 'sum-sumx', area: 'DAX', lesson: 'iteratorler',
  title: 'SUM / SUMX',
  items: [
    { n: 'SUM', d: 'Tek bir sütunun o anki filtre bağlamında görünen değerlerini toplar.' },
    { n: 'SUMX', d: 'Bir tabloyu satır satır dolaşır, her satırda ifadeyi hesaplar ve sonuçları toplar.' }
  ],
  rule: 'Toplanacak değer bir sütunda hazır duruyorsa SUM; değer satır düzeyinde iki sütundan hesaplanıyorsa (adet × fiyat) SUMX. Önce çarpıp sonra topla, asla önce toplayıp sonra çarpma.',
  body: '`SUM(Satislar[Tutar])` aslında `SUMX(Satislar, Satislar[Tutar])` yazımının kısaltmasıdır. Demodaki üçüncü satır sık görülen hatadır: toplam adet ile toplam fiyatın çarpımı anlamsız ve çok büyük bir sayı üretir.',
  demo: { grid: { t: 'Urunler', c: 'Kategori' }, rows: [
    ['SUM(Tutar)', 'SUM(Satislar[Tutar])'],
    ['SUMX(Adet × BirimFiyat)', 'SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat])'],
    ['SUM(Adet) × SUM(BirimFiyat)', 'SUM(Satislar[Adet]) * SUM(Satislar[BirimFiyat])']
  ] },
  quiz: [
    { q: 'Liste fiyatıyla ciro (adet × birim fiyat) hesaplanacak. Hangisi doğru?', o: ['`SUM(Satislar[Adet]) * SUM(Satislar[BirimFiyat])`', '`SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat])`', '`SUM(Satislar[Adet] * Satislar[BirimFiyat])`', '`AVERAGE(Satislar[BirimFiyat]) * COUNT(Satislar[Adet])`'], a: 1, why: 'Çarpım her satırda yapılmalı, sonra toplanmalı; bunu SUMX yapar. SUM tek sütun alır, içine ifade yazılamaz; toplamların çarpımı ise satır düzeyindeki ilişkiyi kaybeder.' },
    { q: '`SUM(Satislar[Tutar])` ile `SUMX(Satislar, Satislar[Tutar])` aynı bağlamda farklı sonuç verir mi?', o: ['Evet, SUMX bağlam geçişi yapar', 'Evet, SUMX boşları sıfır sayar', 'Hayır', 'Yalnızca toplam satırında farklıdır'], a: 2, why: 'SUM, tek sütunlu SUMX’in kısaltmasıdır. SUMX içinde ölçü çağırmadıkça bağlam geçişi olmaz; burada yalnızca bir sütun var.' },
    { q: 'SUMX hangi durumda gereksiz yere yavaş olur?', o: ['Tablo yerine VALUES verildiğinde', 'Her satırda ölçü çağrılınca', 'İfade tek bir sütun olduğunda', 'Filtre bağlamı boş olduğunda'], a: 1, why: 'Her satırda bir ölçü çağırmak, her satırda bağlam geçişi demektir. Mümkünse daha az satırlı bir tabloda (ör. VALUES(Urunler[Urun])) dön.' }
  ]
},
{
  id: 'count-ailesi', area: 'DAX', lesson: 'toplama',
  title: 'COUNT / COUNTA / COUNTROWS / DISTINCTCOUNT',
  items: [
    { n: 'COUNT', d: 'Bir sütunda boş olmayan sayı, tarih ve metin değerlerini sayar; TRUE/FALSE değerlerini desteklemez.' },
    { n: 'COUNTA', d: 'Bir sütunda boş olmayan değerleri sayar; mantıksal (TRUE/FALSE) sütunlarda da çalışır.' },
    { n: 'COUNTROWS', d: 'Bir tablonun satır sayısını verir; sütundaki boşlardan etkilenmez.' },
    { n: 'DISTINCTCOUNT', d: 'Bir sütundaki farklı değerlerin sayısını verir; boş değer varsa onu da bir değer olarak sayar.' }
  ],
  rule: '“Kaç satış satırı?” için COUNTROWS, “kaç farklı sipariş/müşteri?” için DISTINCTCOUNT, “bu alan kaç satırda dolu?” için COUNT/COUNTA. Boşları saymak istemiyorsan DISTINCTCOUNTNOBLANK.',
  body: 'Bu modelde 131 satırın `KargoGun` değeri boştur (çoğu iptal edilen siparişler). Bu yüzden `COUNT(Satislar[KargoGun])` 1.489, `COUNTROWS(Satislar)` 1.620 verir. `DISTINCTCOUNT(Satislar[KargoGun])` 15 döner, çünkü boş değer de bir “farklı değer” sayılır; `DISTINCTCOUNTNOBLANK` 14 verir.',
  demo: { grid: { t: 'Satislar', c: 'Kanal' }, rows: [
    ['COUNTROWS(Satislar)', 'COUNTROWS(Satislar)'],
    ['COUNT(KargoGun)', 'COUNT(Satislar[KargoGun])'],
    ['DISTINCTCOUNT(SiparisNo)', 'DISTINCTCOUNT(Satislar[SiparisNo])'],
    ['DISTINCTCOUNT(MusteriNo)', 'DISTINCTCOUNT(Satislar[MusteriNo])']
  ] },
  quiz: [
    { q: 'Satış satırlarının sayısı isteniyor; bazı satırlarda KargoGun boş. Hangisi her zaman doğru sayar?', o: ['`COUNT(Satislar[KargoGun])`', '`COUNTA(Satislar[KargoGun])`', '`COUNTROWS(Satislar)`', '`DISTINCTCOUNT(Satislar[SatirNo]) - 1`'], a: 2, why: 'COUNTROWS satırları sayar, herhangi bir sütunun boş olmasından etkilenmez. COUNT ve COUNTA boş KargoGun satırlarını atlar.' },
    { q: 'Bir sütunda 3 farklı değer ve bazı boş hücreler var. `DISTINCTCOUNT` kaç döndürür?', o: ['4', '3', 'Hata verir', '2'], a: 0, why: 'DISTINCTCOUNT boş değeri de ayrı bir değer olarak sayar: 3 + 1 = 4. Boşu saymamak için DISTINCTCOUNTNOBLANK kullanılır.' },
    { q: 'COUNT ile COUNTA arasındaki fark ne zaman önemlidir?', o: ['TRUE/FALSE sütununda', 'Boş değer içeren satırlarda', 'Metin sütununda', 'Toplam satırında'], a: 0, why: 'Microsoft Learn’e göre COUNT sayı, tarih ve metin değerlerini sayar, TRUE/FALSE değerlerini desteklemez; mantıksal sütun için COUNTA gerekir. Boşları ikisi de atlar.' }
  ]
},
{
  id: 'values-distinct', area: 'DAX', lesson: 'tablo-fonk',
  title: 'VALUES / DISTINCT / ALL (sütun)',
  items: [
    { n: 'VALUES', d: 'Sütunun o anki bağlamda görünen farklı değerlerini döndürür; ilişkide eşleşmeyen olgu satırları varsa boş satırı da ekler.' },
    { n: 'DISTINCT', d: 'Aynı farklı değerleri döndürür ama ilişkiden doğan bu ek boş satırı eklemez; yalnızca sütunda gerçekten bulunan boşu getirir.' },
    { n: 'ALL', d: 'Filtreleri yok sayarak sütunun tüm farklı değerlerini döndürür (eşleşmeyen satır varsa boş satır dahil).' }
  ],
  rule: 'Çoğu durumda VALUES yeterlidir ve “şu anda görünen değerler” demektir. Boş satırın sayıma girmesini istemiyorsan DISTINCT kullan; filtreden bağımsız tam liste istiyorsan ALL.',
  body: 'Boş satır nereden gelir? Olgu tablosunda boyut tablosunda karşılığı olmayan bir anahtar varsa (ör. Urunler’de bulunmayan bir UrunNo), Power BI ilişkinin bir tarafına sanal bir boş satır ekler. Görselde “(Boş)” etiketi olarak görünür. Bu modelde eşleşmeyen anahtar yoktur; demoda VALUES ile ALL arasındaki bağlam farkını görürsün.',
  demo: { grid: { t: 'Urunler', c: 'Kategori' }, rows: [
    ['COUNTROWS(VALUES(Kategori))', 'COUNTROWS(VALUES(Urunler[Kategori]))'],
    ['COUNTROWS(ALL(Kategori))', 'COUNTROWS(ALL(Urunler[Kategori]))']
  ] },
  quiz: [
    { q: 'Görselde kategori listesinde “(Boş)” satırı çıktı. En olası sebep?', o: ['Kategori sütununda yazım hatası var', 'Tarih tablosu işaretlenmemiş', 'İlişki çift yönlü kurulmuş', 'Eşleşmeyen olgu anahtarları var'], a: 3, why: 'Eşleşmeyen olgu satırları için motor boyut tarafına sanal bir boş satır ekler. Çözüm, eksik boyut kayıtlarını eklemek ya da anahtarı Power Query’de düzeltmektir.' },
    { q: 'Eşleşmeyen satırlar varken hangisi bu sanal boş satırı içermez?', o: ['`VALUES(Urunler[Kategori])`', '`DISTINCT(Urunler[Kategori])`', '`ALL(Urunler[Kategori])`', '`ALLSELECTED(Urunler[Kategori])`'], a: 1, why: 'DISTINCT yalnızca sütunda gerçekten bulunan değerleri döndürür; VALUES ve ALL ilişkiden gelen sanal boş satırı da ekler.' },
    { q: 'Kategori satırlarının olduğu bir matriste `COUNTROWS(VALUES(Urunler[Kategori]))` her satırda kaç verir?', o: ['1', 'Kategori sayısı', 'O kategorideki ürün sayısı', 'Boş'], a: 0, why: 'VALUES o anki filtre bağlamındaki farklı değerleri döndürür; her satırda yalnızca bir kategori görünür. ALL kullansaydın her satırda tüm kategorilerin sayısı çıkardı.' }
  ]
},
{
  id: 'filter-vs-sutun', area: 'DAX', lesson: 'calculate',
  title: 'CALCULATE filtre argümanı / FILTER / KEEPFILTERS',
  items: [
    { n: 'CALCULATE(…, Sütun = değer)', d: 'Sütundaki dış filtreyi kaldırıp yerine yeni filtreyi koyar (filtreyi değiştirir).' },
    { n: 'FILTER(Tablo, koşul)', d: 'Tabloyu o anki bağlamda satır satır süzen bir yineleyicidir; dış filtre korunur, sonuç tablo filtresi olur.' },
    { n: 'KEEPFILTERS(koşul)', d: 'Yeni filtreyi dış filtreyle kesiştirir; dış filtreyi silmeden daraltır.' }
  ],
  rule: 'Basit koşullarda sütun filtresi (`Sütun = değer`) yaz; dış filtreyle kesişim gerekiyorsa KEEPFILTERS ekle. FILTER’ı yalnızca koşul bir ölçü ya da birden çok sütun içerdiğinde, mümkün olan en küçük tabloda kullan.',
  body: '`CALCULATE(X, Satislar[Durum] = "İade")` motorda `FILTER(ALL(Satislar[Durum]), Satislar[Durum] = "İade")` olarak çalışır; içteki ALL, durum satırlarından gelen filtreyi siler. Demoda bu yüzden her durum satırında iade sayısı (110) görünür. FILTER(Satislar, ...) ise mevcut bağlamdaki satırları süzer; yalnızca İade satırında değer kalır.',
  demo: { grid: { t: 'Satislar', c: 'Durum' }, rows: [
    ['COUNTROWS(Satislar)', 'COUNTROWS(Satislar)'],
    ['CALCULATE(…, Durum = "İade")', 'CALCULATE(COUNTROWS(Satislar), Satislar[Durum] = "İade")'],
    ['FILTER(Satislar, Durum = "İade")', 'COUNTROWS(FILTER(Satislar, Satislar[Durum] = "İade"))']
  ] },
  quiz: [
    { q: 'Kategori matrisinde `CALCULATE([Net Satış], Urunler[Kategori] = "Kitap")` her satırda aynı değeri gösteriyor. Neden?', o: ['Ölçü hesaplanmış sütun gibi davranıyor', 'İlişki pasif', 'Dış filtrenin yerine geçiyor', 'Kitap kategorisi boş'], a: 2, why: 'Sütun filtresi aynı sütundaki dış filtreyi kaldırıp kendi değerini koyar. Kesişim için KEEPFILTERS(Urunler[Kategori] = "Kitap") kullanılır.' },
    { q: '`FILTER(Urunler, Urunler[Fiyat] > 1000)` ile `Urunler[Fiyat] > 1000` filtresinin farkı?', o: ['İkincisi dış fiyat filtresini korur', 'Birincisi ilişkileri devre dışı bırakır', 'Birincisi tablo filtresi üretir', 'İkincisi yalnızca ölçülerle çalışır'], a: 2, why: 'FILTER(Urunler, …) bağlamdaki Urunler satırlarını tüm sütunlarıyla filtre olarak verir; bu daha yavaştır ve diğer Urunler sütunlarını da sabitler. Sütun filtresi yalnızca Fiyat sütununu etkiler.' },
    { q: 'Koşul bir ölçü içeriyorsa (`[Net Satış] > 10000`) hangisi gerekir?', o: ['`FILTER(VALUES(Urunler[Urun]), [Net Satış] > 10000)`', 'KEEPFILTERS', 'Kısa yazım: `CALCULATE([Net Satış], [Net Satış] > 10000)`', 'USERELATIONSHIP'], a: 0, why: 'CALCULATE’in kısa filtre yazımı ölçü kabul etmez; ölçüyü satır satır değerlendirmek için FILTER gerekir. En küçük tabloda (ürün listesi) dönmek performansı korur.' }
  ]
},
{
  id: 'related-lookup', area: 'DAX', lesson: 'iteratorler',
  title: 'RELATED / RELATEDTABLE / LOOKUPVALUE',
  items: [
    { n: 'RELATED', d: 'Satır bağlamında, çoktan bire ilişkinin “bir” tarafından (boyuttan) tek bir değer getirir.' },
    { n: 'RELATEDTABLE', d: 'Satır bağlamında, ilişkinin “çok” tarafındaki eşleşen satırları tablo olarak getirir.' },
    { n: 'LOOKUPVALUE', d: 'İlişki gerektirmeden, verilen sütun değerlerine göre başka bir tablodan tek değer arar.' }
  ],
  rule: 'İlişki varsa RELATED (olgudan boyuta) veya RELATEDTABLE (boyuttan olguya) kullan; hızlıdır ve ilişkiyi izler. LOOKUPVALUE’yu yalnızca ilişki kurulamayan ya da birden çok sütunla eşleşen aramalarda seç.',
  body: 'Demodaki üç ifade üç farklı soruyu cevaplar: satılan adetlerin maliyeti (RELATED ile BirimMaliyet), ürün başına satış satırı sayısı (RELATEDTABLE) ve liste fiyatıyla ciro (LOOKUPVALUE ile Fiyat). LOOKUPVALUE birden çok eşleşme bulursa hata verir.',
  demo: { grid: { t: 'Urunler', c: 'Kategori' }, rows: [
    ['RELATED(BirimMaliyet)', 'SUMX(Satislar, Satislar[Adet] * RELATED(Urunler[BirimMaliyet]))'],
    ['RELATEDTABLE(Satislar)', 'SUMX(Urunler, COUNTROWS(RELATEDTABLE(Satislar)))'],
    ['LOOKUPVALUE(Fiyat)', 'SUMX(Satislar, Satislar[Adet] * LOOKUPVALUE(Urunler[Fiyat], Urunler[UrunNo], Satislar[UrunNo]))']
  ] },
  quiz: [
    { q: 'Satislar tablosunda hesaplanmış sütunla ürünün kategorisini getirmek istiyorsun. Hangisi?', o: ['`RELATEDTABLE(Urunler)`', '`LOOKUPVALUE(Urunler[Kategori])`', '`VALUES(Urunler[Kategori])`', '`RELATED(Urunler[Kategori])`'], a: 3, why: 'Satislar çok tarafı, Urunler bir tarafı; satır bağlamında bir taraftan değer RELATED ile gelir. LOOKUPVALUE’nun arama sütunu ve değeri eksik olduğu için çalışmaz.' },
    { q: 'Urunler tablosunda “bu ürün kaç kez satıldı?” hesaplanmış sütunu için hangisi?', o: ['`RELATED(Satislar[SatirNo])`', '`COUNTROWS(RELATEDTABLE(Satislar))`', '`COUNT(Satislar[SatirNo])`', '`SUMX(Satislar, RELATED(Urunler[Stok]))`'], a: 1, why: 'Boyuttan olguya bakarken birden çok satır döner; RELATEDTABLE bu satırları getirir. COUNT tek başına satır bağlamını filtreye çevirmez ve her üründe tüm satırları sayar.' },
    { q: 'LOOKUPVALUE ne zaman RELATED’dan daha uygundur?', o: ['Her zaman, çünkü daha hızlıdır', 'İlişki kurulamadığında', 'Bir taraftan çok tarafa bakarken', 'Ölçü içinde satır bağlamı olmadığında'], a: 1, why: 'RELATED mevcut ilişkiyi kullanır ve daha hızlıdır. LOOKUPVALUE ilişki olmadan arama yapar; örneğin tarih ve para birimiyle kur tablosundan değer bulmak.' }
  ]
},
{
  id: 'isfiltered-ailesi', area: 'DAX', lesson: 'hiyerarsi',
  title: 'ISFILTERED / ISINSCOPE / HASONEVALUE / SELECTEDVALUE',
  items: [
    { n: 'ISFILTERED', d: 'Sütuna doğrudan bir filtre uygulanmış mı? Dilimleyici, filtre bölmesi veya görsel satırı olabilir.' },
    { n: 'ISINSCOPE', d: 'Sütun, görselde o anki hücrenin gruplama düzeyi mi? Toplam satırında FALSE döner, dilimleyici onu TRUE yapmaz.' },
    { n: 'HASONEVALUE', d: 'Bağlamda sütunun tam olarak bir değeri mi görünüyor?' },
    { n: 'SELECTEDVALUE', d: 'Tek değer görünüyorsa onu, yoksa (sıfır ya da çok değer) alternatif sonucu (varsayılan BLANK) döndürür.' }
  ],
  rule: 'Hiyerarşi düzeyine göre farklı hesap için ISINSCOPE; “kullanıcı bir şey seçti mi?” için ISFILTERED; tek seçimi okumak için SELECTEDVALUE (içinde HASONEVALUE vardır).',
  body: 'Demoda dilimleyicide Kitap ve Spor seçilmiş gibi davranmak için `KEEPFILTERS(Urunler[Kategori] IN {"Kitap", "Spor"})` kullanıldı. Toplam satırında ISFILTERED TRUE (seçim var), ISINSCOPE FALSE (gruplama yok), HASONEVALUE FALSE (iki kategori) döner. Seçim dışındaki kategori satırlarında görünen değer kalmadığı için HASONEVALUE FALSE olur.',
  demo: { grid: { t: 'Urunler', c: 'Kategori' }, rows: [
    ['ISFILTERED', 'CALCULATE(ISFILTERED(Urunler[Kategori]), KEEPFILTERS(Urunler[Kategori] IN {"Kitap", "Spor"}))'],
    ['ISINSCOPE', 'CALCULATE(ISINSCOPE(Urunler[Kategori]), KEEPFILTERS(Urunler[Kategori] IN {"Kitap", "Spor"}))'],
    ['HASONEVALUE', 'CALCULATE(HASONEVALUE(Urunler[Kategori]), KEEPFILTERS(Urunler[Kategori] IN {"Kitap", "Spor"}))'],
    ['SELECTEDVALUE', 'CALCULATE(SELECTEDVALUE(Urunler[Kategori], "Birden çok"), KEEPFILTERS(Urunler[Kategori] IN {"Kitap", "Spor"}))']
  ] },
  quiz: [
    { q: 'Dilimleyicide tek kategori seçiliyken toplam satırında `ISINSCOPE(Urunler[Kategori])` ne döner?', o: ['TRUE', 'BLANK', 'FALSE', 'Seçili kategori adı'], a: 2, why: 'ISINSCOPE yalnızca görselin gruplama düzeyini sorar; toplam satırında kategori gruplaması yoktur. Dilimleyici seçimi ISFILTERED’ı TRUE yapar ama ISINSCOPE’u değiştirmez.' },
    { q: 'Dinamik başlıkta seçili yılı göstermek istiyorsun; seçim yoksa “Tüm yıllar” yazsın. En kısa doğru yazım?', o: ['`SELECTEDVALUE(Tarih[Yil], "Tüm yıllar")`', '`IF(ISINSCOPE(Tarih[Yil]), Tarih[Yil], "Tüm yıllar")`', '`MAX(Tarih[Yil])`', '`IF(ISFILTERED(Tarih[Yil]), VALUES(Tarih[Yil]))`'], a: 0, why: 'SELECTEDVALUE tek değer varsa onu, yoksa alternatif sonucu döndürür. İki yıl seçilirse VALUES birden çok satır döndürüp hata verir; MAX ise yalnızca son yılı gösterir.' },
    { q: 'Kategori → Ürün hiyerarşisinde ürün düzeyinde sıra, kategori düzeyinde boş göstermek için hangisi?', o: ['`ISCROSSFILTERED(Urunler)`', '`HASONEVALUE(Urunler[Kategori])`', '`ISFILTERED(Urunler[Kategori])`', '`ISINSCOPE(Urunler[Urun])`'], a: 3, why: 'ISINSCOPE(Urunler[Urun]) yalnızca ürün düzeyindeki hücrelerde TRUE’dur. HASONEVALUE(Urunler[Urun]), tek ürünlü bir kategoride kategori satırında da TRUE olabilir.' }
  ]
},
{
  id: 'zaman-kaydirma', area: 'DAX', lesson: 'zaman',
  title: 'SAMEPERIODLASTYEAR / DATEADD / PARALLELPERIOD',
  items: [
    { n: 'SAMEPERIODLASTYEAR', d: 'Bağlamdaki tarihlerin bir yıl öncesini döndürür; DATEADD(…, -1, YEAR) ile aynıdır.' },
    { n: 'DATEADD', d: 'Bağlamdaki tarihleri istenen sayıda gün, ay, çeyrek veya yıl kaydırır; aralığın şekli korunur.' },
    { n: 'PARALLELPERIOD', d: 'Kaydırdıktan sonra aralığı tam döneme genişletir: ay kırılımında -1 YEAR, geçen yılın tamamını verir.' }
  ],
  rule: 'Aynı dönemi geçen yılla kıyaslamak için SAMEPERIODLASTYEAR; ay/çeyrek kaydırmak için DATEADD; “geçen yılın tamamı” gibi tam dönem gerekiyorsa PARALLELPERIOD.',
  body: 'Bu modelde satışlar Haziran 2022’de başlar. Demoda 2023 aylarında `[Satış GY]` 2022’nin aynı ayını, DATEADD -1 MONTH bir önceki ayı, PARALLELPERIOD ise her ayda 2022’nin tamamını (102.837 ₺) gösterir.',
  demo: { grid: { t: 'Tarih', c: 'YilAy' }, noTotal: true, rows: [
    ['SAMEPERIODLASTYEAR', 'CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))'],
    ['DATEADD -1 MONTH', 'CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, MONTH))'],
    ['PARALLELPERIOD -1 YEAR', 'CALCULATE([Net Satış], PARALLELPERIOD(Tarih[Tarih], -1, YEAR))']
  ] },
  quiz: [
    { q: 'Mart 2024 hücresinde `CALCULATE([Net Satış], PARALLELPERIOD(Tarih[Tarih], -1, YEAR))` neyi gösterir?', o: ['Mart 2023 satışını', 'Ocak–Mart 2023 toplamını', 'Şubat 2024 satışını', '2023 yılının tamamını'], a: 3, why: 'PARALLELPERIOD kaydırdığı aralığı tam döneme (burada yıl) genişletir. Aynı ayı isteseydin SAMEPERIODLASTYEAR ya da DATEADD(…, -1, YEAR) kullanırdın.' },
    { q: 'Önceki ayın satışı için hangisi doğru?', o: ['`DATEADD(Tarih[Tarih], -1, MONTH)`', '`SAMEPERIODLASTYEAR(Tarih[Tarih])`', '`PARALLELPERIOD(Tarih[Tarih], 1, MONTH)`', '`DATESYTD(Tarih[Tarih])`'], a: 0, why: 'DATEADD bağlamdaki tarihleri bir ay geri kaydırır; CALCULATE’in filtre argümanı olarak kullanılır. PARALLELPERIOD’da 1 bir sonraki ayı verirdi.' },
    { q: 'Bu fonksiyonların hepsinin doğru çalışması için ortak ön koşul?', o: ['Olgu tablosunda ayrı bir yıl sütunu', 'Çift yönlü ilişki', 'Kesintisiz bir tarih tablosu', 'Hesaplanmış sütun'], a: 2, why: 'Zaman zekâsı fonksiyonları tarih sütunundaki gün listesini kaydırır; eksik günler varsa kaydırılmış aralık da eksik olur. Tarih tablosu kesintisiz olmalı ve işaretlenmelidir.' }
  ]
},
{
  id: 'ytd-kumulatif', area: 'DAX', lesson: 'zaman',
  title: 'TOTALYTD / kümülatif toplam',
  items: [
    { n: 'TOTALYTD', d: 'Yılbaşından bağlamdaki son tarihe kadar toplar; her yeni yılda sıfırdan başlar.' },
    { n: 'Kümülatif (çalışan) toplam', d: 'Verinin başından son tarihe kadar toplar; yıl sınırında sıfırlanmaz.' }
  ],
  rule: 'Raporda “yıl içi ilerleme” isteniyorsa TOTALYTD (ya da DATESYTD); “başlangıçtan bu yana” isteniyorsa `FILTER(ALL(Tarih[Tarih]), Tarih[Tarih] <= MAX(Tarih[Tarih]))` kalıbı.',
  body: 'Demoda 2022 boyunca iki ölçü aynıdır; Ocak 2023’te YTD 13.537 ₺’ye düşer, kümülatif toplam ise 116.374 ₺ ile büyümeye devam eder. Mali yıl farklıysa TOTALYTD’ye yıl sonu tarihi verilebilir (ör. `"06-30"`).',
  demo: { grid: { t: 'Tarih', c: 'YilAy' }, noTotal: true, rows: [
    ['[Satış YTD]', '[Satış YTD]'],
    ['[Kümülatif Satış]', '[Kümülatif Satış]']
  ] },
  quiz: [
    { q: 'Grafikte çizgi her Ocak ayında aşağı düşüyor. Ölçü hangisi olabilir?', o: ['TOTALYTD', 'Kümülatif toplam', '3 ay hareketli ortalama', 'SAMEPERIODLASTYEAR'], a: 0, why: 'TOTALYTD her yılın başında sıfırlanır; Ocak değeri yalnızca Ocak’ın satışıdır. Kümülatif toplam hiç sıfırlanmaz.' },
    { q: 'Kümülatif toplamda neden `ALL(Tarih[Tarih])` gerekir?', o: ['Toplam satırını gizlemek için', 'İlişkiyi etkinleştirmek için', 'Önceki ayları görebilmek için', 'Performansı artırmak için'], a: 2, why: 'Hücrede yalnızca o ayın tarihleri görünür; önceki ayları toplayabilmek için tarih filtresini kaldırıp “son tarihe kadar olanlar” koşulunu yeniden kurmak gerekir.' },
    { q: 'Şirketin mali yılı Temmuz’da başlıyor. YTD için hangisi doğru yaklaşım?', o: ['DATEADD ile altı ay kaydır', '`TOTALYTD(…, "06-30")`', 'Kümülatif toplam kullan', 'Tarih tablosunu Temmuz’dan başlat'], a: 1, why: 'TOTALYTD ve DATESYTD isteğe bağlı yıl sonu tarihi alır; "06-30" ile yıl 1 Temmuz’da yeniden başlar. Tarih tablosunu kesmek zaman zekâsını bozar.' }
  ]
},
{
  id: 'rankx-tuzaklari', area: 'DAX', lesson: 'siralama',
  title: 'RANKX: SKIP / DENSE, ALL / ALLSELECTED',
  items: [
    { n: 'SKIP (varsayılan)', d: 'Eşit değerler aynı sırayı alır, sonraki sıra atlanır: 1, 2, 2, 4.' },
    { n: 'DENSE', d: 'Eşit değerler aynı sırayı alır, sonraki sıra atlanmaz: 1, 2, 2, 3.' },
    { n: 'RANKX(ALL(…))', d: 'Dilimleyiciden bağımsız olarak tüm ürünler içinde sıralar.' },
    { n: 'RANKX(ALLSELECTED(…))', d: 'Yalnızca kullanıcının seçtiği/görselde görünen ürünler içinde sıralar.' }
  ],
  rule: 'Sıralama tablosunu her zaman ALL ya da ALLSELECTED ile ver; VALUES verirsen her satırda tek ürün kalır ve herkes 1 olur. Eşitliklerde “madalya” mantığı için SKIP, kesintisiz sıra numarası için DENSE.',
  body: 'Demoda ürünler stok adedine göre sıralanır (stoklarda çok eşitlik var). SKIP’te 20. sıradan sonra birden 27’ye atlanır, DENSE’te sıralar ardışıktır. Üçüncü satır sık hatayı gösterir: `RANKX(VALUES(Urunler[Urun]), …)` her üründe 1 verir.',
  demo: { grid: { t: 'Urunler', c: 'Urun' }, rows: [
    ['Stok sırası (SKIP)', 'RANKX(ALL(Urunler[Urun]), CALCULATE(SUM(Urunler[Stok])))'],
    ['Stok sırası (DENSE)', 'RANKX(ALL(Urunler[Urun]), CALCULATE(SUM(Urunler[Stok])), , DESC, DENSE)'],
    ['VALUES ile (hatalı)', 'RANKX(VALUES(Urunler[Urun]), [Net Satış])']
  ] },
  quiz: [
    { q: 'Değerler 500, 400, 400, 300. DENSE ile 300’ün sırası?', o: ['3', '4', '2', '5'], a: 0, why: 'DENSE eşitlikten sonra sıra atlamaz: 1, 2, 2, 3. Varsayılan SKIP olsaydı 4 olurdu.' },
    { q: 'Kullanıcı dilimleyicide yalnızca Elektronik’i seçtiğinde ürün sırasının 1’den başlaması isteniyor. Hangisi?', o: ['`RANKX(ALLSELECTED(Urunler[Urun]), [Net Satış])`', '`RANKX(VALUES(Urunler[Urun]), [Net Satış])`', '`RANKX(ALL(Urunler[Urun]), [Net Satış])`', '`RANKX(ALL(Urunler[Kategori]), [Net Satış], , DESC)`'], a: 0, why: 'ALLSELECTED görseldeki satır filtresini kaldırır ama dilimleyici seçimini korur; sıralama yalnızca Elektronik ürünleri arasında yapılır. ALL tüm ürünler içindeki sırayı verir.' },
    { q: 'RANKX ölçüsünde ikinci argüman neden bir ölçü (`[Net Satış]`) olmalı, sütun toplamı (`SUM(...)`) değil?', o: ['Ölçü bağlam geçişi yapar', 'SUM, RANKX içinde desteklenmez', 'SUM metin döndürür', 'Ölçü daha az bellek kullanır'], a: 0, why: 'RANKX tablo üzerinde döner; her satırda değerin o ürüne göre hesaplanması için bağlam geçişi gerekir. Ölçü otomatik CALCULATE ile sarılır, çıplak SUM ise her satırda aynı toplamı verir.' }
  ]
},
{
  id: 'divide-bolme', area: 'DAX', lesson: 'toplama',
  title: 'DIVIDE / bölme işareti (/)',
  items: [
    { n: 'DIVIDE(a, b)', d: 'Payda sıfır ya da BLANK ise hata yerine BLANK (veya verdiğin alternatif sonucu) döndürür.' },
    { n: 'a / b', d: 'Payda sıfır ya da BLANK olduğunda sonsuz (∞) ya da NaN üretir; hata kontrolü yapmaz.' }
  ],
  rule: 'Ölçülerde oran hesaplarken DIVIDE kullan. `/` yalnızca paydanın asla sıfır olmayacağından emin olduğunda (ör. sabit bir sayıya bölerken) uygundur.',
  body: 'Demoda 2022’de geçen yıl verisi yoktur. `[Net Satış] / [Satış GY]` bu satırda sonsuz (∞) verir; DIVIDE ise BLANK döndürür ve görsel satırı temiz kalır. Üçüncü argümanla `DIVIDE(a, b, 0)` boş yerine 0 gösterir; ancak bu, BLANK satırların gizlenmesini engeller.',
  demo: { grid: { t: 'Tarih', c: 'Yil' }, rows: [
    ['DIVIDE', 'DIVIDE([Net Satış], [Satış GY])'],
    ['DIVIDE(…, 0)', 'DIVIDE([Net Satış], [Satış GY], 0)']
  ] },
  quiz: [
    { q: '`DIVIDE(10, BLANK())` ne döndürür?', o: ['BLANK', 'Sonsuz', '0', 'Hata'], a: 0, why: 'DIVIDE payda BLANK veya sıfır olduğunda alternatif sonucu döndürür; alternatif verilmezse BLANK’tır. `10 / BLANK()` ise sonsuz verir.' },
    { q: 'DIVIDE’ın üçüncü argümanına 0 vermenin yan etkisi?', o: ['Toplam satırı yanlış hesaplanır', 'Yüzde biçimi kaybolur', 'Boş satırlar artık gizlenmez', 'Performans çok düşer'], a: 2, why: 'Görseller ölçüsü BLANK olan satırları gizler. 0 döndürünce bu satırlar listede kalır; genellikle istenmeyen bir kalabalık oluşur.' },
    { q: 'Hangisinde `/` kullanmak güvenlidir?', o: ['`[Net Satış] / [Sipariş Sayısı]`', '`[Brüt Kâr] / [Net Satış]`', '`[Toplam Maaş] / 12`', '`[Net Satış] / [Satış GY]`'], a: 2, why: 'Payda sabit 12 olduğu için sıfır olamaz. Diğerlerinde payda bir ölçüdür ve bazı bağlamlarda BLANK ya da sıfır olabilir.' }
  ]
},
{
  id: 'sutun-olcu', area: 'DAX', lesson: 'dax-giris',
  title: 'Hesaplanmış sütun / ölçü',
  items: [
    { n: 'Hesaplanmış sütun', d: 'Yenilemede satır satır hesaplanır, modelde saklanır, bellek kaplar; dilimleyici ve eksende kullanılabilir.' },
    { n: 'Ölçü', d: 'Sorgu anında, o anki filtre bağlamında hesaplanır; saklanmaz, toplamlar ve oranlar için doğru araçtır.' }
  ],
  rule: 'Bir değere göre filtrelemek, gruplamak ya da eksene koymak istiyorsan sütun; bir sonucu toplamak, oranlamak, filtreye göre değişmesini istiyorsan ölçü. Oranları asla satır düzeyinde hesaplayıp ortalama.',
  body: 'Demoda satır düzeyinde hesaplanan marjın ortalaması (hesaplanmış sütun + AVERAGE gibi) ile ölçü olarak hesaplanan marj (toplam kâr / toplam satış) karşılaştırılıyor. Küçük satırlar ortalamada büyükler kadar ağırlık aldığı için iki sonuç farklıdır; doğru olan ölçüdür.',
  demo: { grid: { t: 'Urunler', c: 'Kategori' }, rows: [
    ['Satır marjlarının ortalaması', 'AVERAGEX(Satislar, DIVIDE(Satislar[Tutar] - Satislar[Maliyet], Satislar[Tutar]))'],
    ['Toplamların oranı (ölçü)', 'DIVIDE(SUM(Satislar[Tutar]) - SUM(Satislar[Maliyet]), SUM(Satislar[Tutar]))']
  ] },
  quiz: [
    { q: 'Müşterileri “Genç / Orta / Olgun” yaş grubuna ayırıp dilimleyicide kullanmak istiyorsun. Ne yazarsın?', o: ['Ölçü', 'Ölçü + alan parametresi', 'Hızlı ölçü', 'Hesaplanmış sütun'], a: 3, why: 'Dilimleyici ve eksen sabit değerlere ihtiyaç duyar; bunlar sütunlardır. Ölçü sonucu dilimleyiciye konamaz.' },
    { q: 'Hesaplanmış sütun ne zaman yeniden hesaplanır?', o: ['Her görsel etkileşiminde', 'Dilimleyici değiştiğinde', 'Rapor her açıldığında', 'Yenilemede'], a: 3, why: 'Sütun değerleri yenileme sırasında hesaplanıp saklanır; filtrelere tepki vermez. Ölçüler ise her sorguda yeniden hesaplanır.' },
    { q: 'Kâr marjı % için en iyi yaklaşım?', o: ['Satır düzeyinde marj sütunu, görselde Ortalama', 'Power Query’de marj sütunu', 'Satır düzeyinde marj sütunu, görselde Toplam', 'Ölçü: `DIVIDE([Brüt Kâr], [Net Satış])`'], a: 3, why: 'Oran, toplanmış pay ve paydanın oranı olmalıdır; ölçü her bağlamda bunu doğru hesaplar. Satır marjlarının ortalaması küçük satırlara gereğinden fazla ağırlık verir.' }
  ]
},
{
  id: 'degistir-kesistir', area: 'DAX', lesson: 'calculate',
  title: 'Filtreyi değiştirmek / KEEPFILTERS ile kesiştirmek',
  items: [
    { n: 'CALCULATE(…, Tarih[Yil] = 2024)', d: 'Yıl sütunundaki dış filtreyi siler, 2024’ü koyar: her yıl satırında 2024 görünür.' },
    { n: 'CALCULATE(…, KEEPFILTERS(Tarih[Yil] = 2024))', d: 'Dış filtreyi korur, 2024 ile kesiştirir: yalnızca 2024 satırında değer kalır.' }
  ],
  rule: 'Bir ölçü “sabit bir dilimi” göstermeliyse (ör. her satırda 2024 kıyas değeri) düz filtre; yalnızca uygun satırlarda görünmeliyse KEEPFILTERS.',
  body: 'Bu davranış, Derinleş bölümündeki “Filtre argümanı aslında bir tablodur” notunun özetidir: düz filtre `FILTER(ALL(Sütun), …)` olarak çalışır, ALL dış filtreyi kaldırır.',
  demo: { grid: { t: 'Tarih', c: 'Yil' }, rows: [
    ['Düz filtre', 'CALCULATE([Net Satış], Tarih[Yil] = 2024)'],
    ['KEEPFILTERS', 'CALCULATE([Net Satış], KEEPFILTERS(Tarih[Yil] = 2024))']
  ] },
  quiz: [
    { q: 'Yıl matrisinde `CALCULATE([Net Satış], KEEPFILTERS(Tarih[Yil] = 2024))` 2023 satırında ne gösterir?', o: ['2023 satışı', 'BLANK', '2024 satışı', 'Genel toplam'], a: 1, why: '2023 filtresi korunur ve 2024 ile kesiştirilir; iki koşulu sağlayan tarih olmadığı için sonuç BLANK’tır.' },
    { q: 'Her yıl satırında “2024 kıyas değeri” göstermek istiyorsun. Hangisi?', o: ['`KEEPFILTERS(Tarih[Yil] = 2024)`', '`FILTER(Tarih, Tarih[Yil] = 2024)`', '`Tarih[Yil] = 2024` düz filtresi', '`ISFILTERED(Tarih[Yil])`'], a: 2, why: 'Düz filtre satırdaki yıl filtresinin yerine geçer, her satırda 2024 değeri görünür. FILTER(Tarih, …) dış filtreyi korur ve yalnızca 2024 satırında değer bırakır.' },
    { q: 'KEEPFILTERS hangi durumda sonucu değiştirmez?', o: ['Ölçü SUM kullanıyorsa', 'Koşul tek değerliyse', 'Toplam satırında dahi her zaman değiştirir', 'Görselde başka bir sütun varsa'], a: 3, why: 'Düz filtre yalnızca aynı sütundaki dış filtreyi kaldırır. Görselde başka bir sütun (ör. kanal) varsa iki yazım aynı sonucu verir.' }
  ]
},
{
  id: 'blank-sifir', area: 'DAX', lesson: 'blank-hata',
  title: 'BLANK / 0',
  items: [
    { n: 'BLANK', d: 'Değer yok demektir; görseller ölçüsü BLANK olan satırları gizler, toplama ve çıkarmada 0 gibi davranır; çarpma ve bölmede (BLANK × 5, BLANK / 5) sonuç yine BLANK olur.' },
    { n: '0', d: 'Gerçek bir sayıdır; görselde satır görünür kalır, ortalamalara ve sayımlara girer.' }
  ],
  rule: 'Veri yoksa BLANK döndür; görselin boş satırları gizlemesine izin ver. 0’ı yalnızca “gerçekten sıfır” anlamına geldiğinde ya da kullanıcı açıkça istediğinde göster.',
  body: '`[Satış GY] + 0` hilesi 2022 satırını 0 yapar ama bu, satış olmayan her ürün/ay kombinasyonunu da görselde görünür kılar. Aritmetikte BLANK sıfır gibi davranır: `[Net Satış] - [Satış GY]` ilk yılda tüm satışı “artış” olarak gösterir.',
  demo: { grid: { t: 'Tarih', c: 'Yil' }, rows: [
    ['[Satış GY]', '[Satış GY]'],
    ['[Satış GY] + 0', '[Satış GY] + 0'],
    ['Fark (BLANK aritmetiği)', '[Net Satış] - [Satış GY]']
  ] },
  quiz: [
    { q: '`BLANK() + 5` ne döndürür?', o: ['BLANK', '0', 'Hata', '5'], a: 3, why: 'Toplama ve çıkarmada BLANK sıfır gibi davranır. Bu yüzden geçen yıl verisi olmayan dönemde fark, bu yılın tamamına eşit çıkar.' },
    { q: 'Ölçünün sonuna `+ 0` eklemenin en önemli yan etkisi?', o: ['Ölçü hesaplanmış sütuna dönüşür', 'Toplam satırı kaybolur', 'Biçim metne dönüşür', 'Boş kombinasyonlar görünür olur'], a: 3, why: 'Görsel BLANK satırları gizler; 0 gizlenmez. Ürün × gün gibi büyük kırılımlarda binlerce boş satır oluşabilir ve sorgu yavaşlar.' },
    { q: 'Hangisi BLANK’ı doğru kontrol eder?', o: ['`[Satış GY] = 0`', '`[Satış GY] == ""`', '`ISBLANK([Satış GY])`', '`ISERROR([Satış GY])`'], a: 2, why: 'ISBLANK yalnızca BLANK için TRUE döner. `= 0` karşılaştırması BLANK için de TRUE verir, yani gerçek sıfırla değer yokluğunu ayırt etmez.' }
  ]
},

/* ---------------- Model ---------------- */
{
  id: 'iliski-yonu', area: 'Model', lesson: 'model-temel',
  title: 'Tek yönlü / çift yönlü çapraz filtre',
  items: [
    { n: 'Tek yönlü', d: 'Filtre boyuttan (bir) olguya (çok) akar; yıldız şemanın varsayılan ve önerilen yönü.' },
    { n: 'Çift yönlü (Her ikisi)', d: 'Filtre iki yöne akar; olgudaki seçim boyut listesini de daraltır, ama belirsiz yollar ve yavaşlık riski taşır.' },
    { n: 'CROSSFILTER', d: 'Yönü yalnızca tek bir ölçünün içinde geçici olarak değiştirir; modeli değiştirmez.' }
  ],
  rule: 'İlişkileri tek yönlü bırak. İki yönlü filtre yalnızca belirli bir hesap için gerekiyorsa ölçü içinde CROSSFILTER(…, BOTH) kullan; modelde çift yönü yalnızca köprü tablolarında ve bilerek aç.',
  quiz: [
    { q: 'İki boyut ve bir olgu tablosu arasında birden çok çift yönlü ilişki açınca Power BI bir ilişkiyi etkinleştirmeyi reddediyor. Sebep?', o: ['İlişki kardinalitesi yanlış', 'Belirsiz filtre yolu', 'Tarih tablosu işaretli değil', 'Veri türleri uyuşmuyor'], a: 1, why: 'Bir tablodan diğerine filtrenin birden çok yoldan ulaşabileceği durumda model belirsiz olur; Power BI bunu engeller. Çözüm, ilişkileri tek yönlü yapmaktır.' },
    { q: 'Ürün dilimleyicisinde yalnızca satışı olan ürünlerin listelenmesini istiyorsun. Çift yönlü ilişkiye alternatif?', o: ['Hesaplanmış tablo ile Urunler’i kopyalamak', 'İlişkiyi pasif yapmak', 'Dilimleyiciye görsel filtresi', 'Urunler’i DirectQuery yapmak'], a: 2, why: 'Dilimleyiciye ölçü tabanlı görsel filtresi eklemek, modeli değiştirmeden aynı sonucu verir. Çift yönlü ilişki tüm modeli etkiler.' },
    { q: 'CROSSFILTER’ın USERELATIONSHIP’ten farkı?', o: ['İkisi aynı işi yapar', 'CROSSFILTER ilişkinin yönünü değiştirir', 'CROSSFILTER pasif ilişkiyi etkinleştirir', 'USERELATIONSHIP yönü BOTH yapar'], a: 1, why: 'USERELATIONSHIP hangi ilişkinin kullanılacağını seçer (pasifi etkinleştirir); CROSSFILTER mevcut ilişkinin filtre yönünü değiştirir ya da ilişkiyi kapatır (NONE).' }
  ]
},
{
  id: 'depolama-modlari', area: 'Model', lesson: 'kurumsal-model',
  title: 'Import / DirectQuery / Direct Lake / Çift (Dual)',
  items: [
    { n: 'Import (İçeri aktarma)', d: 'Verinin bir kopyası modelde (VertiPaq) saklanır; hızlıdır, güncellik yenilemeye bağlıdır.' },
    { n: 'DirectQuery', d: 'Veri modelde saklanmaz; her görsel sorgusu kaynağa çevrilip gönderilir, hız kaynağa bağlıdır.' },
    { n: 'Direct Lake', d: 'Fabric’te OneLake’teki Delta tablolarını kopyalamadan, ihtiyaç anında belleğe yükler; yenileme yalnızca meta veriyi günceller (framing).' },
    { n: 'Çift (Dual)', d: 'Tablo duruma göre önbellekten (Import) ya da kaynaktan (DirectQuery) yanıt verir; bileşik modellerde genelde boyutlar için.' }
  ],
  rule: 'Varsayılan Import; veri çok büyük ya da gerçek zamana yakın olmalıysa DirectQuery; Fabric lakehouse/warehouse üzerinde büyük veri için Direct Lake. Bileşik modelde DirectQuery olgusuna bağlanan boyutları Çift yap.',
  quiz: [
    { q: 'Direct Lake yenilemesinde ne olur?', o: ['Tüm veri yeniden kopyalanır', 'Sorgular kaynağa SQL olarak gönderilir', 'Yalnızca meta veri güncellenir', 'Power Query adımları yeniden çalışır'], a: 2, why: 'Direct Lake yenilemesi “framing”dir: modeldeki tablolar en son Delta sürümünün dosyalarına yönlendirilir; veri kopyalanmaz.' },
    { q: 'Bileşik modelde Satislar DirectQuery, Urunler Import. Ürün dilimleyicili sorgular yavaş. İlk öneri?', o: ['Satislar’ı Çift yap', 'İlişkiyi çift yönlü yap', 'Urunler’i Çift yap', 'Urunler’i DirectQuery yap'], a: 2, why: 'Boyutu Çift yapınca DirectQuery olguyla birlikte sorgulandığında kaynaktan, tek başına sorgulandığında önbellekten yanıt verebilir; DirectQuery ile Import arasındaki zayıf ilişki sorunu da kalkar.' },
    { q: 'Hangi tablo depolama modu değişikliği Desktop’ta tek yönlüdür?', o: ['Import → DirectQuery', 'DirectQuery → Import', 'Çift → DirectQuery', 'Import → Çift'], a: 1, why: 'Microsoft Learn’e göre depolama modu çoğu tabloda yalnızca DirectQuery (veya OneLake üzerinde Direct Lake) olarak oluşturulanlarda değiştirilebilir ve Import’a geçiş geri alınamaz. Import tablosu sonradan DirectQuery’ye çevrilemez.' }
  ]
},

/* ---------------- Power Query ---------------- */
{
  id: 'birlestir-ekle', area: 'Power Query', lesson: 'pq-orta',
  title: 'Sorguları birleştir (Merge) / Sorgu ekle (Append)',
  items: [
    { n: 'Birleştir (Merge)', d: 'İki tabloyu ortak bir anahtar sütunla yan yana bağlar; sütun ekler (SQL JOIN gibi).' },
    { n: 'Ekle (Append)', d: 'Aynı yapıdaki tabloları alt alta koyar; satır ekler (SQL UNION ALL gibi).' }
  ],
  rule: 'Başka tablodan sütun getirmek istiyorsan Birleştir; aynı biçimde gelen dosyaları (ör. aylık satış dosyaları) tek tabloda toplamak istiyorsan Ekle.',
  body: 'Birleştir’de birleşim türü (Sol dış, İç, Tam dış, Sol karşıt…) hangi satırların kalacağını belirler. Ekle’de sütunlar ADLARINA göre eşlenir; adı farklı olan sütun ayrı sütun olarak eklenir ve diğer tablonun satırlarında null kalır.',
  quiz: [
    { q: '2023 ve 2024 satış dosyaları aynı sütunlara sahip. Tek tablo için hangisi?', o: ['Ekle', 'Birleştir', 'Özet sütun', 'Gruplandırma ölçütü'], a: 0, why: 'Aynı yapıdaki tabloları alt alta koymak Ekle işlemidir. Birleştir yan yana sütun ekler.' },
    { q: 'Ekle sonrası “Tutar” ve “tutar” diye iki sütun çıktı, yarısı null. Neden?', o: ['Veri türleri farklı', 'Sütun adları eşleşmiyor', 'Birleşim türü yanlış', 'Sorgu katlaması bozuldu'], a: 1, why: 'Ekle sütunları adına göre eşler ve M büyük/küçük harfe duyarlıdır. Eklemeden önce adları aynılaştır.' },
    { q: 'Siparişlerde, müşteri tablosunda karşılığı olmayan kayıtları bulmak için hangi birleşim?', o: ['İç birleşim', 'Sol karşıt', 'Tam dış', 'Sağ dış'], a: 1, why: 'Sol karşıt (Left anti) birleşim, sol tablonun sağda eşleşmeyen satırlarını döndürür; yetim kayıtları bulmanın en kısa yoludur.' }
  ]
},
{
  id: 'basvuru-cogaltma', area: 'Power Query', lesson: 'pq-model',
  title: 'Başvuru (Reference) / Çoğalt (Duplicate)',
  items: [
    { n: 'Başvuru', d: 'Yeni sorgu, kaynağı olarak orijinal sorgunun SONUCUNU kullanır; orijinaldeki değişiklikler yeni sorguya yansır.' },
    { n: 'Çoğalt', d: 'Orijinalin tüm adımlarını kopyalayan bağımsız bir sorgu oluşturur; sonraki değişiklikler birbirini etkilemez.' }
  ],
  rule: 'Ortak temizlik adımlarını tek yerde tutup ondan birden çok tablo türeteceksen Başvuru; aynı adımlarla başlayıp tamamen farklı bir yöne gidecek bağımsız bir sorgu istiyorsan Çoğalt.',
  body: 'Tipik kalıp: ham satış sorgusunu temizle, yüklemeyi kapat (Yüklemeyi etkinleştir işaretini kaldır), sonra ondan Başvuru ile olgu ve boyut sorguları türet.',
  quiz: [
    { q: 'Temel sorguya yeni bir temizlik adımı ekledin; türetilen sorguların hepsinin bunu alması gerekiyor. Türetilenler nasıl oluşturulmalıydı?', o: ['Çoğalt ile', 'Kopyala/yapıştır ile', 'Ekle ile', 'Başvuru ile'], a: 3, why: 'Başvuru, orijinalin sonucuna bağlıdır; orijinaldeki her adım türetilen sorgulara da yansır. Çoğaltılan sorgular adımların o anki kopyasıdır.' },
    { q: 'Temel sorgunun yüklemesini kapattın (Yüklemeyi etkinleştir işareti kaldırıldı). Ondan Başvuru ile türetilen sorgu ne olur?', o: ['Boş tablo döndürür', 'Hata verir', 'Çalışır', 'Çoğaltılmış sorguya dönüşür'], a: 2, why: 'Yüklemeyi kapatmak yalnızca o sorgunun modele tablo olarak gelmesini engeller; sorgu yine çalışır ve başvuran sorgulara sonucunu verir. Ara sorguları modelden saklamanın standart yolu budur.' },
    { q: 'Çoğalt’ın Başvuru’ya göre avantajı?', o: ['Daha az bellek kullanır', 'Yenileme her zaman daha hızlıdır', 'Sorgular birbirinden bağımsızdır', 'Sorgu katlamayı korur'], a: 2, why: 'Çoğaltılan sorgu kendi adımlarına sahiptir; orijinali değiştirmek onu bozmaz. Bedeli, ortak adımların iki yerde bakım gerektirmesidir.' }
  ]
},
{
  id: 'ozet-ozetikaldir', area: 'Power Query', lesson: 'pq-orta',
  title: 'Sütunların özetini kaldır (Unpivot) / Özet sütun (Pivot)',
  items: [
    { n: 'Özeti kaldır (Unpivot)', d: 'Sütun başlıklarını satırlara çevirir: Oca, Şub, Mar sütunları “Ay” ve “Değer” sütunlarına dönüşür.' },
    { n: 'Özet sütun (Pivot)', d: 'Bir sütunun değerlerini yeni sütun başlıklarına çevirir; satırları sütunlara yayar.' }
  ],
  rule: 'Excel’den gelen “her ay bir sütun” tablolarını modele almadan önce özetini kaldır; model uzun (dar) tabloyu sever. Özet sütunu genelde yalnızca anahtar-değer çiftlerini (ör. özellik adı/değer) sütunlara yaymak için kullan.',
  body: '“Diğer sütunların özetini kaldır” seçeneği, seçtiğin kimlik sütunları dışındaki her şeyi çevirir; kaynağa yeni bir ay sütunu eklendiğinde de çalışmaya devam eder. Seçili sütunların özetini kaldırmak ise sütun adlarını koda sabitler.',
  quiz: [
    { q: 'Hedef dosyasında Kategori sütunu ve 12 ay sütunu var. Modele uygun hale getirmek için?', o: ['Kategori dışındakilerin özetini kaldır', 'Ekle ile ayları alt alta koy', 'Ay sütunlarını seçip Özet sütun uygula, değer olarak Toplam', 'Devrik (Transpose)'], a: 0, why: 'Kategori kimlik sütunu olarak kalır, 12 ay “Ay” ve “Değer” satırlarına dönüşür. “Diğer sütunlar” seçeneği yeni ay sütunları eklendiğinde de çalışır.' },
    { q: '“Seçili sütunların özetini kaldır” ile “Diğer sütunların özetini kaldır” farkı?', o: ['Sonuç tablosunun şekli farklıdır', 'Biri yalnızca metin sütunlarında çalışır', 'Biri null değerleri siler', 'Koda sabitlenen sütun adları'], a: 3, why: 'İlk anda aynı tabloyu üretirler. Seçili sütunlar seçeneği çevrilen sütunların adlarını, diğerleri seçeneği korunan kimlik sütunlarını koda yazar; kaynağa yeni sütun gelince davranış ayrışır.' },
    { q: 'Özet sütun işleminde aynı satır/sütun kesişimine birden çok değer düşerse?', o: ['Toplama işlevi seçmek gerekir', 'İlk değer alınır', 'İşlem her zaman başarısız olur', 'Değerler virgülle birleştirilir'], a: 0, why: 'Özet sütun bir değer sütunu ve toplama işlevi (Toplam, Say…) ister. “Toplama yapma” seçilirse ve tekrarlar varsa hücre hata verir.' }
  ]
},

/* ---------------- Rapor ---------------- */
{
  id: 'detay-altduzey', area: 'Rapor', lesson: 'etkilesim',
  title: 'Detaylandırma (drillthrough) / Alt düzeye inme (drill down)',
  items: [
    { n: 'Detaylandırma (drillthrough)', d: 'Bir veri noktasına sağ tıklayıp başka bir sayfaya o değerin filtresiyle gitmek.' },
    { n: 'Alt düzeye inme (drill down)', d: 'Aynı görselde hiyerarşinin bir alt düzeyine inmek (Yıl → Çeyrek → Ay).' },
    { n: 'Sonraki düzey / Tümünü genişlet', d: 'Hiyerarşide tek bir dala değil, tüm değerleri bir alt düzeye birlikte göstermek.' }
  ],
  rule: 'Aynı görselde daha ince ayrıntı istiyorsan alt düzeye in; seçili öğe hakkında ayrı bir sayfada farklı görsellerle ayrıntı istiyorsan detaylandırma sayfası kur.',
  quiz: [
    { q: 'Müşteri adına sağ tıklayıp o müşterinin sipariş listesini gösteren ayrı sayfaya gitmek için ne kurulur?', o: ['Alt düzeye inme', 'Araç ipucu (tooltip) sayfası', 'Yer işareti', 'Detaylandırma sayfası'], a: 3, why: 'Detaylandırma, hedef sayfanın Detaylandırma alanına konan alanla çalışır; kaynak görselden gelen değer o sayfayı filtreler.' },
    { q: 'Alt düzeye inme hangi koşulda kullanılabilir?', o: ['Görselde hiyerarşi varsa', 'Rapor yayımlandıysa', 'Detaylandırma sayfası varsa', 'Ölçü kullanılıyorsa'], a: 0, why: 'Alt düzeye inme, görselin ekseninde (veya satırlarında) birden çok düzeyli alan olmasını gerektirir; tarih hiyerarşisi bunun tipik örneğidir.' },
    { q: 'Detaylandırma sayfasında “Tüm filtreleri koru” (Keep all filters) açık olduğunda ne olur?', o: ['Diğer filtreler de gelir', 'Hedef sayfa filtrelenmez', 'Dilimleyiciler eşitlenir', 'Yer işaretleri sıfırlanır'], a: 0, why: 'Bu seçenek açıkken yalnızca tıklanan değer değil, kaynak görseldeki tüm filtre bağlamı da hedef sayfaya aktarılır.' }
  ]
},
{
  id: 'yer-isareti', area: 'Rapor', lesson: 'hikaye',
  title: 'Yer işareti: Veri / Görüntü / Geçerli sayfa',
  items: [
    { n: 'Veri', d: 'Filtre ve dilimleyici durumlarını yakalar; yer işareti seçilince o seçimler geri yüklenir.' },
    { n: 'Görüntü', d: 'Görsellerin görünür/gizli durumunu ve spot ışığı ayarını yakalar.' },
    { n: 'Geçerli sayfa', d: 'Açıkken yer işareti oluşturulduğu sayfaya gider; kapalıyken ayarları o an bulunulan sayfaya uygular.' },
    { n: 'Tüm görseller / Seçili görseller', d: 'Yer işaretinin sayfadaki tüm görsellere mi, yalnızca seçtiklerine mi uygulanacağı.' }
  ],
  rule: 'Görünüm değiştirme (grafik ↔ tablo) düğmelerinde Veri’yi kapat, Görüntü’yü açık bırak; böylece kullanıcının filtreleri sıfırlanmaz. Hikâye anlatımında belirli bir seçimi göstermek istiyorsan Veri açık kalsın.',
  quiz: [
    { q: 'Grafik/tablo geçiş düğmesine basınca kullanıcının dilimleyici seçimleri sıfırlanıyor. Ne değiştirilmeli?', o: ['Görüntü seçeneğini kapat', 'Veri’yi kapat', 'Geçerli sayfa seçeneğini aç', 'Dilimleyicileri eşitle'], a: 1, why: 'Veri açıkken yer işareti, oluşturulduğu andaki filtreleri geri yükler. Kapatınca yalnızca görünürlük değişir, filtreler yerinde kalır.' },
    { q: 'Yer işaretinin yalnızca iki grafiği gizleyip göstermesi, diğerlerine dokunmaması için?', o: ['Tüm görseller seçeneği', 'Seçili görseller', 'Veri seçeneği', 'Geçerli sayfa'], a: 1, why: 'Seçili görseller seçeneği, yer işaretini oluşturmadan önce seçtiğin görsellerle sınırlar; böylece farklı yer işaretleri sayfanın farklı bölümlerini yönetebilir.' },
    { q: 'Görsellerin gizli/görünür durumunu hangi seçenek yakalar?', o: ['Veri', 'Görüntü', 'Geçerli sayfa', 'Seçim bölmesi'], a: 1, why: 'Görüntü seçeneği görünürlük ve spot ışığı durumunu yakalar. Seçim bölmesi görünürlüğü ayarladığın yerdir, yer işareti seçeneği değildir.' }
  ]
},
{
  id: 'filtre-dilimleyici', area: 'Rapor', lesson: 'filtreler',
  title: 'Filtre bölmesi düzeyleri / dilimleyici',
  items: [
    { n: 'Bu görseldeki filtreler', d: 'Yalnızca seçili görseli etkiler.' },
    { n: 'Bu sayfadaki filtreler', d: 'Sayfadaki tüm görselleri etkiler.' },
    { n: 'Tüm sayfalardaki filtreler', d: 'Rapordaki her sayfayı etkiler (rapor düzeyi).' },
    { n: 'Dilimleyici', d: 'Tuvalde duran, kullanıcının görerek kullandığı filtre görseli; varsayılan olarak sayfadaki görselleri etkiler, eşitlenerek başka sayfalara taşınabilir.' }
  ],
  rule: 'Kullanıcının sık değiştirdiği ve görmesi gereken seçimler dilimleyiciye; tasarımcının sabitlediği ya da az kullanılan filtreler filtre bölmesine. Filtre bölmesindeki filtreyi kilitleyerek veya gizleyerek kullanıcıdan saklayabilirsin.',
  body: 'Ölçüye dayalı filtre (ör. “Net Satış > 10.000”) yalnızca görsel düzeyinde eklenebilir. Dilimleyicinin hangi görselleri etkilediğini Biçim sekmesindeki “Etkileşimleri düzenle” ile değiştirirsin.',
  quiz: [
    { q: 'Ölçü tabanlı bir filtreyi (Net Satış > 10.000) hangi düzeyde ekleyebilirsin?', o: ['Görsel', 'Sayfa', 'Tüm sayfalar', 'Detaylandırma'], a: 0, why: 'Ölçüler görselin kırılımına göre hesaplandığı için ölçü filtreleri yalnızca görsel düzeyinde desteklenir.' },
    { q: 'Yıl dilimleyicisinin üç sayfada aynı seçimi taşıması için?', o: ['Rapor düzeyi filtre eklemek', 'Dilimleyicileri eşitle (Sync slicers)', 'Yer işareti', '`Etkileşimleri düzenle` ile görselleri bağlamak'], a: 1, why: 'Dilimleyicileri eşitle bölmesi, bir dilimleyiciyi başka sayfalarda görünür ya da yalnızca eşitlenmiş yapar. Rapor düzeyi filtre de çalışır ama kullanıcıya tuvalde görünmez.' },
    { q: 'Kullanıcının filtre bölmesinde bir filtreyi değiştirememesi ama görebilmesi için?', o: ['Filtreyi gizle', 'Filtreyi kilitle', 'Filtreyi sil', 'Görsel düzeyine taşı'], a: 1, why: 'Kilitlenen filtre okuma modunda görünür ama değiştirilemez. Gizlenen filtre ise hiç görünmez, yine de uygulanır.' }
  ]
},

/* ---------------- Hizmet ---------------- */
{
  id: 'rapor-pano-uygulama', area: 'Service', lesson: 'aile',
  title: 'Rapor / Pano (dashboard) / Uygulama (app)',
  items: [
    { n: 'Rapor', d: 'Bir anlam modeline dayanan, çok sayfalı, etkileşimli görsel koleksiyonu; Desktop’ta veya Service’te oluşturulur.' },
    { n: 'Pano (dashboard)', d: 'Yalnızca Service’te, tek sayfalık; farklı rapor ve modellerden sabitlenmiş kutucuklardan oluşur.' },
    { n: 'Uygulama (app)', d: 'Bir çalışma alanındaki rapor ve panoları paketleyip kitlesine düzenli bir gezintiyle dağıtma yolu.' }
  ],
  rule: 'Analiz ve keşif için rapor; birden çok rapordan en önemli sayıları tek bakışta izlemek için pano; tüketicilere düzenli, sürüm kontrollü dağıtım için uygulama.',
  quiz: [
    { q: 'Hangisi Power BI Desktop’ta oluşturulamaz?', o: ['Rapor', 'Anlam modeli', 'Detaylandırma sayfası', 'Pano'], a: 3, why: 'Panolar yalnızca Power BI Service’te, rapor görsellerini sabitleyerek oluşturulur. Rapor ve model Desktop’ta da yapılır.' },
    { q: 'Panodaki bir kutucuğa tıklayınca ne olur (varsayılan)?', o: ['Kutucuk büyür ve düzenlenir', 'Uyarı kurulur', 'Veri dışa aktarılır', 'Kaynak rapora gidilir'], a: 3, why: 'Sabitlenmiş kutucuk varsayılan olarak kaynak rapor sayfasına bağlantıdır. Bu, panonun bir “giriş kapısı” olarak kullanılmasını sağlar.' },
    { q: 'Yüzlerce tüketiciye çalışma alanına erişim vermeden içerik dağıtmanın önerilen yolu?', o: ['Herkesi Görüntüleyici yapmak', 'Uygulama yayımlamak', 'Raporu PDF olarak e-postalamak', 'Web’de yayımla'], a: 1, why: 'Uygulama, tüketicilere çalışma alanını göstermeden seçilmiş içeriği ve gezintiyi sunar; geliştirme ile yayımlanan sürüm ayrı tutulur. Web’de yayımla içeriği herkese açık yapar.' }
  ]
},
{
  id: 'calisma-alani-rolleri', area: 'Service', lesson: 'yonetisim',
  title: 'Çalışma alanı rolleri: Yönetici / Üye / Katkıda bulunan / Görüntüleyici',
  items: [
    { n: 'Yönetici (Admin)', d: 'Her şeyi yapar; çalışma alanını güncelleyip silebilir, diğer yöneticileri ekleyip çıkarabilir.' },
    { n: 'Üye (Member)', d: 'İçerik oluşturur ve düzenler, kendinden düşük yetkili kişi ekleyebilir, uygulamayı yayımlayabilir.' },
    { n: 'Katkıda bulunan (Contributor)', d: 'İçerik oluşturur, düzenler, siler ve yenileme zamanlar; kişi ekleyemez.' },
    { n: 'Görüntüleyici (Viewer)', d: 'İçeriği yalnızca görüntüler ve etkileşimde bulunur; RLS yalnızca bu role uygulanır.' }
  ],
  rule: 'Geliştiricilere Katkıda bulunan, ekip liderine Üye, tüketicilere Görüntüleyici (ya da daha iyisi uygulama erişimi) ver. Yönetici rolünü az kişiyle sınırla.',
  quiz: [
    { q: 'RLS tanımlı bir modelde hangi çalışma alanı rolündeki kullanıcıya RLS uygulanır?', o: ['Yönetici', 'Katkıda bulunan', 'Görüntüleyici', 'Üye'], a: 2, why: 'Microsoft Learn’e göre Yönetici, Üye ve Katkıda bulunan modeli düzenleme iznine sahiptir ve RLS onlara uygulanmaz; yalnızca Görüntüleyici kısıtlanır.' },
    { q: 'Ekip lideri içerik düzenleyebilmeli ve çalışma alanına Katkıda bulunan ya da Görüntüleyici ekleyebilmeli, ama yöneticileri çıkaramamalı. En uygun rol?', o: ['Yönetici', 'Katkıda bulunan', 'Üye', 'Görüntüleyici'], a: 2, why: 'Üye kendinden düşük yetkili kişileri ekleyebilir; yöneticileri ekleyip çıkarmak yalnızca Yönetici’dedir. Katkıda bulunan içerik düzenler ama kimseyi ekleyemez.' },
    { q: 'Hangi rol diğer yöneticileri çalışma alanından çıkarabilir?', o: ['Tüm roller', 'Yalnızca Yönetici', 'Üye ve Katkıda bulunan', 'Yönetici ve Üye'], a: 1, why: 'Yöneticiler dahil kişi ekleyip çıkarma yalnızca Yönetici rolündedir. Üye yalnızca daha düşük yetkili kişileri ekleyebilir.' }
  ]
},
{
  id: 'rls-ols', area: 'Service', lesson: 'guvenlik',
  title: 'RLS / OLS',
  items: [
    { n: 'RLS (satır düzeyi güvenlik)', d: 'Rol içindeki DAX filtresiyle kullanıcının göreceği SATIRLARI kısıtlar; tablo ve sütunlar görünür kalır.' },
    { n: 'OLS (nesne düzeyi güvenlik)', d: 'Belirli tablo veya sütunları rol için tamamen gizler; o alanı kullanan görseller “alan bulunamadı” hatası verir.' }
  ],
  rule: '“Kim hangi bölgenin verisini görür?” sorusu RLS; “maaş sütununu kim hiç görmemeli?” sorusu OLS. İkisi de yalnızca Görüntüleyici izniyle erişenlere uygulanır.',
  body: 'RLS rolleri Desktop’ta Modelleme > Rolleri yönet ile tanımlanır. OLS kuralları TMDL görünümünde betikle ya da Tabular Editor gibi harici araçla (metadataPermission: none) tanımlanır. Rollere kişi ve grup ataması Service’te, anlam modelinin Güvenlik sayfasında yapılır.',
  quiz: [
    { q: 'İK dışındakilerin Calisanlar[Maas] sütununu hiç görmemesi isteniyor; diğer sütunlar herkese açık. Hangisi?', o: ['Gizli sütun', 'RLS', 'OLS', 'Görsel düzeyi filtre'], a: 2, why: 'OLS bir sütunu rol için meta veri dahil gizler. Sütunu modelde gizlemek yalnızca alan listesinden saklar, güvenlik sağlamaz.' },
    { q: 'Dinamik RLS’te kullanıcının e-postasına göre filtre için hangi fonksiyon kullanılır?', o: ['`USERPRINCIPALNAME()`', '`SELECTEDVALUE(Kullanicilar[Eposta])`', '`LOOKUPVALUE()`', '`USERELATIONSHIP()`'], a: 0, why: 'USERPRINCIPALNAME, Service’te oturum açan kullanıcının UPN’sini (genelde e-posta) döndürür; rol filtresinde kullanıcı tablosuyla eşleştirilir.' },
    { q: 'Service’te “Rol olarak test et” ile dinamik RLS denerken `USERPRINCIPALNAME()` neyi döndürür?', o: ['Seçilen kişinin UPN’sini', 'BLANK', 'Rol adını', 'Kendi UPN’ni'], a: 3, why: 'Microsoft Learn’e göre bu özellik dinamik RLS ifadelerini değerlendirirken test edenin kendi kimliğini kullanır; yani simüle etmeye çalıştığın kişinin değil, senin UPN’in döner.' }
  ]
}
];

W.PBI_MISTAKES = [
{
  id: 'toplam-satirlar-esit-degil', area: 'DAX', lesson: 'baglam',
  sym: 'Toplam satırı, satırların toplamına eşit değil',
  cause: 'Toplam satırı üstteki hücreleri toplamaz; ölçü, kategori filtresi olmadan yeniden hesaplanır. DISTINCTCOUNT, oran ve ortalama gibi toplanamayan ölçülerde bu yüzden farklı çıkar.',
  fix: 'Önce hangi sonucun doğru olduğuna karar ver. Toplamın gerçekten satırların toplamı olması gerekiyorsa açıkça yinele: `SUMX(VALUES(Urunler[Kategori]), [Müşteri Sayısı])`.',
  tags: ['toplam', 'yanlış toplam', 'genel toplam', 'matris toplamı', 'distinctcount', 'satırların toplamı'],
  task: { name: 'Kategori Müşteri Toplamı', q: 'Kategori satırlarında müşteri sayısı, toplam satırında ise kategori satırlarının TOPLAMI görünmeli (bir müşteri birden çok kategoride sayılabilir). Bozuk ölçüyü düzelt.', start: '[Müşteri Sayısı]', sol: 'SUMX(VALUES(Urunler[Kategori]), [Müşteri Sayısı])', hint: 'Kategori listesinde dönen bir yineleyici kullan; her kategoride ölçü bağlam geçişiyle hesaplanır.' }
},
{
  id: 'her-satirda-ayni', area: 'DAX', lesson: 'calculate',
  sym: 'Her satırda aynı değer görünüyor (CALCULATE filtresi kategoriyi eziyor)',
  cause: 'CALCULATE içindeki `Urunler[Kategori] = "Elektronik"` filtresi aynı sütundaki dış filtrenin yerine geçer; her kategori satırında Elektronik’in değeri hesaplanır.',
  fix: 'Dış filtreyle kesiştirmek için `KEEPFILTERS(Urunler[Kategori] = "Elektronik")` yaz. Sabit kıyas değeri istiyorsan mevcut davranış doğrudur.',
  tags: ['aynı değer', 'her satır aynı', 'calculate', 'filtre eziliyor', 'keepfilters', 'tekrarlanan değer'],
  task: { name: 'Elektronik Satışı (Kesişim)', q: 'Ölçü kategori matrisinde yalnızca Elektronik satırında değer göstermeli, diğer kategorilerde boş kalmalı. Şu an her satırda aynı sayı var. Düzelt.', start: 'CALCULATE([Net Satış], Urunler[Kategori] = "Elektronik")', sol: 'CALCULATE([Net Satış], KEEPFILTERS(Urunler[Kategori] = "Elektronik"))', hint: 'Filtreyi değiştirmek yerine kesiştiren sarmalayıcıyı hatırla.', grid: [{ t: 'Urunler', c: 'Kategori' }] }
},
{
  id: 'filter-all-satislar', area: 'DAX', lesson: 'filter-all',
  sym: 'Web satışı her kategori ve yılda aynı (genel Web toplamı) görünüyor',
  cause: '`FILTER(ALL(Satislar), …)` önce genişletilmiş Satislar tablosunun tüm filtrelerini (Urunler ve Tarih üzerinden gelen kategori ve yıl dahil) kaldırır, sonra Web satırlarını tablo filtresi olarak geri koyar. Her hücrede tüm Web satışı görünür.',
  fix: 'Tüm tabloyu süzme; yalnızca gereken sütuna filtre koy: `CALCULATE([Toplam Satış], Satislar[Kanal] = "Web")`. Bu hem doğru hem daha hızlıdır.',
  tags: ['filter all', 'all(satislar)', 'tablo filtresi', 'kategori filtresi kayboldu', 'yavaş ölçü'],
  task: { name: 'Web Brüt Satışı', q: 'Ölçü, matristeki her kategori ve yıl için o hücrenin Web kanalı satışını (tüm durumlar, `[Toplam Satış]`) göstermeli. Bozuk ölçü kategori ve yıl filtrelerini siliyor. Düzelt.', start: 'CALCULATE([Toplam Satış], FILTER(ALL(Satislar), Satislar[Kanal] = "Web"))', sol: 'CALCULATE([Toplam Satış], Satislar[Kanal] = "Web")', hint: 'Tüm tabloyu değil, yalnızca Kanal sütununu filtrele.' }
},
{
  id: 'ay-kiriliminda-gy-bos', area: 'DAX', lesson: 'zaman',
  sym: 'Geçen yıl ölçüsü yıl kırılımında doğru ama ay (YilAy) kırılımında boş',
  cause: '`CALCULATE([Net Satış], Tarih[Yil] = Y - 1)` yalnızca yıl sütununu değiştirir; satırdaki “2024-03” YilAy filtresi yerinde kalır. Hem 2024-03 hem 2023 olan tarih olmadığı için sonuç BLANK’tır.',
  fix: 'Tarih sütunu üzerinden çalışan zaman zekâsı kullan: `CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))`. Tarih tablosu işaretliyse diğer tarih filtreleri otomatik kaldırılır.',
  tags: ['geçen yıl boş', 'ay kırılımı', 'yil - 1', 'sameperiodlastyear', 'gy blank', 'zaman zekâsı'],
  task: { name: 'Geçen Yıl Satışı (Doğru)', q: 'Ölçü her ay satırında geçen yılın aynı ayını göstermeli. Bozuk ölçü ay kırılımında boş dönüyor. Zaman zekâsı fonksiyonuyla düzelt.', start: 'VAR Y = MAX(Tarih[Yil]) RETURN CALCULATE([Net Satış], Tarih[Yil] = Y - 1)', sol: 'CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))', hint: 'Yıl sütununu değil tarih sütununu kaydıran fonksiyonu kullan.', grid: [{ t: 'Tarih', c: 'YilAy' }, { t: 'Tarih', c: 'Yil' }] }
},
{
  id: 'ilk-yil-eksi-yuz', area: 'DAX', lesson: 'blank-hata',
  sym: 'İlk yılda büyüme -%100 görünüyor',
  cause: '`DIVIDE([Net Satış], [Satış GY]) - 1` ilk yılda DIVIDE’dan BLANK alır; BLANK - 1 = -1 olur. Veri yokluğu “-%100 düşüş” gibi raporlanır.',
  fix: 'Çıkarmayı payda yap: `DIVIDE([Net Satış] - [Satış GY], [Satış GY])`. Payda BLANK olduğunda sonuç da BLANK kalır.',
  tags: ['-100%', 'büyüme yanlış', 'yoy', 'ilk yıl', 'blank aritmetiği', 'eksi yüz'],
  task: { name: 'Yıllık Büyüme', q: 'Büyüme oranı geçen yıl verisi olmayan dönemde boş kalmalı. Şu an ilk yılda -%100 görünüyor. Düzelt.', start: 'DIVIDE([Net Satış], [Satış GY]) - 1', sol: 'DIVIDE([Net Satış] - [Satış GY], [Satış GY])', hint: 'Çıkarma işlemini DIVIDE’ın içine, paya taşı.' }
},
{
  id: 'fark-ilk-yil-tum-satis', area: 'DAX', lesson: 'blank-hata',
  sym: 'İlk yılda “geçen yıla göre fark” tüm satışa eşit (büyüme %100 gibi)',
  cause: 'Çıkarmada BLANK sıfır gibi davranır: `[Net Satış] - [Satış GY]` geçen yıl verisi yokken bu yılın tamamını artış olarak gösterir.',
  fix: 'Kıyas değeri yoksa boş döndür: `IF(NOT ISBLANK([Satış GY]), [Net Satış] - [Satış GY])`.',
  tags: ['blank', 'fark', 'ilk yıl', '%100', 'geçen yıl yok', 'blank sıfır'],
  task: { name: 'GY Farkı', q: 'Geçen yıla göre fark, geçen yıl verisi olmayan dönemlerde boş kalmalı. Bozuk ölçüyü düzelt.', start: '[Net Satış] - [Satış GY]', sol: 'IF(NOT ISBLANK([Satış GY]), [Net Satış] - [Satış GY])', hint: 'Önce kıyas değerinin var olup olmadığını kontrol et.', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Tarih', c: 'YilAy' }] }
},
{
  id: 'var-calculate-oncesi', area: 'DAX', lesson: 'var-mantik',
  sym: 'CALCULATE içindeki filtre hiçbir şeyi değiştirmiyor (VAR ile)',
  cause: 'VAR tanımlandığı yerde, o anki bağlamda bir kez hesaplanır ve sabite dönüşür. `CALCULATE(S, Satislar[Kanal] = "Web")` artık bir sayıyı “filtrelemeye” çalışır; sonuç değişmez.',
  fix: 'Ölçüyü CALCULATE’in içinde çağır: `CALCULATE([Net Satış], Satislar[Kanal] = "Web")`. VAR’ı yalnızca dış bağlamdaki değeri bilerek saklamak için kullan.',
  tags: ['var', 'değişken', 'calculate etkisiz', 'filtre çalışmıyor', 'var sabit'],
  task: { name: 'Web Kanalı Satışı', q: 'Ölçü yalnızca Web kanalının satışını göstermeli. Bozuk ölçü tüm kanalların satışını döndürüyor. Düzelt.', start: 'VAR S = [Net Satış] RETURN CALCULATE(S, Satislar[Kanal] = "Web")', sol: 'CALCULATE([Net Satış], Satislar[Kanal] = "Web")', hint: 'Değişken, CALCULATE’ten önce hesaplanıp donar.' }
},
{
  id: 'ortalamalarin-ortalamasi', area: 'DAX', lesson: 'iteratorler',
  sym: 'Ortalama sepet toplamda olması gerekenden çok düşük',
  cause: '`AVERAGEX(VALUES(Urunler[Kategori]), [Ortalama Sepet])` kategorilerin ortalamalarının ortalamasını alır; küçük kategoriler büyükler kadar ağırlık kazanır.',
  fix: 'Ortalamayı her zaman pay/payda oranı olarak hesapla: `DIVIDE([Net Satış], [Sipariş Sayısı])`.',
  tags: ['ortalama', 'ortalamaların ortalaması', 'averagex', 'ağırlıklı ortalama', 'sepet'],
  task: { name: 'Sipariş Başı Satış', q: 'Ölçü, sipariş başına ortalama net satışı her bağlamda doğru vermeli. Bozuk ölçü kategori ortalamalarının ortalamasını alıyor. Düzelt.', start: 'AVERAGEX(VALUES(Urunler[Kategori]), [Ortalama Sepet])', sol: 'DIVIDE([Net Satış], [Sipariş Sayısı])', hint: 'Toplam satışı toplam sipariş sayısına böl.' }
},
{
  id: 'satir-marji-ortalamasi', area: 'DAX', lesson: 'dax-giris',
  sym: 'Kâr marjı yüzdesi Excel’deki hesapla tutmuyor',
  cause: 'Marj satır düzeyinde (hesaplanmış sütun ya da AVERAGEX ile) hesaplanıp ortalanıyor. Oranların ortalaması, toplamların oranına eşit değildir.',
  fix: 'Marjı ölçü olarak toplamlardan hesapla: `DIVIDE(SUM(Satislar[Tutar]) - SUM(Satislar[Maliyet]), SUM(Satislar[Tutar]))`.',
  tags: ['marj', 'yüzde yanlış', 'hesaplanmış sütun', 'oranların ortalaması', 'kâr marjı'],
  task: { name: 'Brüt Marj (Tüm Satırlar)', q: 'İptaller dahil tüm satırların brüt marjı: (Tutar toplamı - Maliyet toplamı) / Tutar toplamı. Bozuk ölçü satır marjlarının ortalamasını alıyor. Düzelt.', start: 'AVERAGEX(Satislar, DIVIDE(Satislar[Tutar] - Satislar[Maliyet], Satislar[Tutar]))', sol: 'DIVIDE(SUM(Satislar[Tutar]) - SUM(Satislar[Maliyet]), SUM(Satislar[Tutar]))', hint: 'Önce topla, sonra böl.' }
},
{
  id: 'toplamlarin-carpimi', area: 'DAX', lesson: 'toplama',
  sym: 'Ciro milyarlarla çıkıyor, gerçeğin yüzlerce katı',
  cause: '`SUM(Satislar[Adet]) * SUM(Satislar[BirimFiyat])` toplam adet ile tüm birim fiyatların toplamını çarpar; satır düzeyindeki eşleşme kaybolur.',
  fix: 'Satır satır çarpıp topla: `SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat])`.',
  tags: ['şişmiş değer', 'çarpım', 'sumx', 'adet fiyat', 'çok büyük sayı'],
  task: { name: 'Liste Cirosu', q: 'Ölçü, her satırda Adet × BirimFiyat çarpımının toplamını vermeli. Bozuk ölçü toplamları çarpıyor. Düzelt.', start: 'SUM(Satislar[Adet]) * SUM(Satislar[BirimFiyat])', sol: 'SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat])', hint: 'Satır satır hesaplayan X fonksiyonunu kullan.' }
},
{
  id: 'sifira-bolme', area: 'DAX', lesson: 'toplama',
  sym: 'Tabloda “Sonsuz” (∞) ya da NaN görünüyor',
  cause: '`/` operatörü payda BLANK veya sıfır olduğunda sonsuz ya da NaN üretir. Geçen yıl verisi olmayan dönemde büyüme oranı sonsuz çıkar.',
  fix: 'Bölmeyi `DIVIDE` ile yap: `DIVIDE([Net Satış] - [Satış GY], [Satış GY])`. Payda boşsa sonuç BLANK olur.',
  tags: ['sonsuz', 'infinity', 'nan', 'sıfıra bölme', 'divide', 'bölme hatası']
},
{
  id: 'rankx-herkes-1', area: 'DAX', lesson: 'siralama',
  sym: 'RANKX ölçüsünde her ürün 1. sırada',
  cause: 'Sıralama tablosu olarak `VALUES(Urunler[Urun])` verildi. Ürün satırında VALUES yalnızca o ürünü içerir; tek elemanlı listede herkes birincidir.',
  fix: 'Sıralama listesini filtreden bağımsız ver: `RANKX(ALL(Urunler[Urun]), [Net Satış])`; dilimleyiciye uymasını istiyorsan `ALLSELECTED`. Toplam satırı için `IF(HASONEVALUE(Urunler[Urun]), …)` ekle.',
  tags: ['rankx', 'herkes 1', 'sıralama', 'rank', 'hep 1'],
  task: { name: 'Satış Sırası', q: 'Ürün tablosunda her ürünün tüm ürünler içindeki net satış sırası görünmeli (en büyük 1). Toplam satırı boş kalmalı. Bozuk ölçüde herkes 1. Düzelt.', start: 'RANKX(VALUES(Urunler[Urun]), [Net Satış])', sol: 'IF(HASONEVALUE(Urunler[Urun]), RANKX(ALL(Urunler[Urun]), [Net Satış]))', hint: 'Sıralanacak liste o ürünle sınırlı olmamalı.', grid: [{ t: 'Urunler', c: 'Urun' }] }
},
{
  id: 'selectedvalue-coklu', area: 'DAX', lesson: 'var-mantik',
  sym: 'Dinamik başlık birden çok seçimde boş kalıyor (SELECTEDVALUE)',
  cause: 'SELECTEDVALUE yalnızca tek değer görünürken o değeri döndürür; iki ya da daha fazla seçimde (ve hiç seçim yokken) alternatif sonucu, verilmediyse BLANK’ı döndürür.',
  fix: 'Birden çok değeri listelemek için `CONCATENATEX(VALUES(Urunler[Kategori]), Urunler[Kategori], ", ", Urunler[Kategori], ASC)` kullan; yalnızca etiket gerekiyorsa `SELECTEDVALUE(…, "Birden çok")`.',
  tags: ['selectedvalue', 'boş başlık', 'çoklu seçim', 'dinamik başlık', 'concatenatex'],
  task: { name: 'Seçili Kategoriler', q: 'Başlık metni bağlamdaki kategorileri alfabetik sırayla, virgül ve boşlukla (", ") ayırarak listelemeli. Bozuk ölçü çoklu seçimde boş dönüyor. Düzelt.', start: 'SELECTEDVALUE(Urunler[Kategori])', sol: 'CONCATENATEX(VALUES(Urunler[Kategori]), Urunler[Kategori], ", ", Urunler[Kategori], ASC)', hint: 'Bir tablonun değerlerini ayırıcıyla birleştiren yineleyiciyi kullan; sıralama argümanını unutma.' }
},
{
  id: 'count-bos-satirlar', area: 'DAX', lesson: 'toplama',
  sym: 'Satır sayısı olması gerekenden az (COUNT boşları atlıyor)',
  cause: '`COUNT(Satislar[KargoGun])` yalnızca KargoGun dolu olan satırları sayar; iptal edilen siparişlerde bu alan boş olduğu için sayıma girmez.',
  fix: 'Satır saymak için `COUNTROWS(Satislar)` kullan. Belirli bir alanın dolu olduğu satırları saymak istiyorsan COUNT doğrudur; niyetini ölçü adına yaz.',
  tags: ['count', 'countrows', 'eksik sayım', 'boş', 'satır sayısı'],
  task: { name: 'Satış Satırı Sayısı', q: 'Ölçü, kargo bilgisi boş olanlar dahil tüm satış satırlarını saymalı. Düzelt.', start: 'COUNT(Satislar[KargoGun])', sol: 'COUNTROWS(Satislar)', hint: 'Bir sütunun değerlerini değil, tablonun satırlarını say.' }
},
{
  id: 'distinctcount-toplam', area: 'DAX', lesson: 'baglam',
  sym: 'Müşteri sayısı toplamda satırların toplamından küçük',
  cause: 'DISTINCTCOUNT toplanamaz: aynı müşteri birden çok yılda/kategoride alışveriş yaptıysa her satırda sayılır, toplamda ise bir kez. Bu genellikle hata değil, doğru cevaptır.',
  fix: 'Soruyu netleştir: “kaç farklı müşteri?” için mevcut ölçü doğru. Toplamın satırların toplamı olması isteniyorsa `SUMX(VALUES(Tarih[Yil]), [Müşteri Sayısı])` gibi açık bir yineleme yaz ve adını buna göre koy.',
  tags: ['distinctcount', 'farklı sayım', 'toplam küçük', 'müşteri sayısı', 'tekil'],
  task: { name: 'Yıllık Müşteri Toplamı', q: 'Toplam satırında her yılın müşteri sayılarının TOPLAMI görünmeli (yıl satırlarında o yılın müşteri sayısı). Düzelt.', start: '[Müşteri Sayısı]', sol: 'SUMX(VALUES(Tarih[Yil]), [Müşteri Sayısı])', hint: 'Yıl listesinde dönen bir yineleyici kullan.', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Urunler', c: 'Kategori' }] }
},
{
  id: 'pasif-iliski', area: 'Model', lesson: 'rol-oynayan',
  sym: 'Teslim tarihine göre satış, sipariş tarihine göre satışla aynı çıkıyor (ilişki kesik çizgi)',
  cause: 'Satislar[TeslimTarihi] ile Tarih arasındaki ilişki pasiftir (diyagramda kesik çizgi). Ölçü aktif ilişkiyi, yani Satislar[Tarih]’i kullanır. İki tablo arasında yalnızca bir aktif ilişki olabilir.',
  fix: 'Ölçüde pasif ilişkiyi etkinleştir: `CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))`.',
  tags: ['pasif ilişki', 'kesik çizgi', 'userelationship', 'rol oynayan', 'teslim tarihi', 'ikinci tarih'],
  task: { name: 'Teslim Tarihli Satış', q: 'Ölçü, satışları teslim tarihine göre göstermeli. Bozuk ölçü yanlış ilişkiyi etkinleştiriyor. Düzelt.', start: 'CALCULATE([Net Satış], USERELATIONSHIP(Satislar[Tarih], Tarih[Tarih]))', sol: 'CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))', hint: 'Pasif ilişkinin olgu tarafındaki sütunu hangisi?', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Tarih', c: 'YilAy' }] }
},
{
  id: 'ytd-sifirlanmiyor', area: 'DAX', lesson: 'zaman',
  sym: 'YTD ölçüsü yeni yılda sıfırlanmıyor',
  cause: 'Kullanılan ölçü yılbaşından değil, verinin başından itibaren toplayan kümülatif kalıp (`FILTER(ALL(Tarih[Tarih]), Tarih[Tarih] <= MAX(Tarih[Tarih]))`).',
  fix: 'Yıl içi toplam için `TOTALYTD([Net Satış], Tarih[Tarih])` ya da `CALCULATE([Net Satış], DATESYTD(Tarih[Tarih]))` kullan.',
  tags: ['ytd', 'yılbaşından bugüne', 'kümülatif', 'sıfırlanmıyor', 'totalytd'],
  task: { name: 'Yıl İçi Satış', q: 'Ölçü her ayda yılbaşından o aya kadar olan net satışı vermeli ve her Ocak’ta yeniden başlamalı. Düzelt.', start: 'CALCULATE([Net Satış], FILTER(ALL(Tarih[Tarih]), Tarih[Tarih] <= MAX(Tarih[Tarih])))', sol: 'TOTALYTD([Net Satış], Tarih[Tarih])', hint: 'Zaman zekâsının yıl içi toplam fonksiyonunu kullan.', grid: [{ t: 'Tarih', c: 'YilAy' }], noTotal: true }
},
{
  id: 'all-satislar-pay', area: 'DAX', lesson: 'filter-all',
  sym: 'Kategori payı, kanal dilimleyicisi seçilince yanlış (paydada kanal filtresi de kayboluyor)',
  cause: '`ALL(Satislar)` genişletilmiş Satislar tablosunun tüm filtrelerini, ilişkili boyutlar ve Satislar[Kanal] dahil kaldırır. Payda tüm kanalların toplamı olur.',
  fix: 'Yalnızca kaldırmak istediğin boyutu hedefle: `DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Urunler)))`. Kanal ve tarih filtreleri korunur.',
  tags: ['pay', 'yüzde', 'all(satislar)', 'genişletilmiş tablo', 'kategori payı', 'dilimleyici'],
  task: { name: 'Kategori İçi Pay', q: 'Ölçü, satırdaki kategorinin (Urunler[Kategori]) tüm kategoriler içindeki payını vermeli; kanal ve tarih filtreleri paydada korunmalı. Düzelt.', start: 'DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Satislar)))', sol: 'DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Urunler)))', hint: 'Tüm olgu tablosunu değil, ürün boyutunu hedefle.', grid: [{ t: 'Satislar', c: 'Kanal' }, { t: 'Tarih', c: 'Yil' }] }
},
{
  id: 'hedef-her-kanalda-ayni', area: 'Model', lesson: 'hedef',
  sym: 'Hedef değeri her kanal satırında aynı (toplam hedef) görünüyor',
  cause: 'Hedefler tablosu yalnızca Tarih ve Kategoriler ile ilişkili; kanal bilgisi yok. Satislar[Kanal] filtresi Hedefler’e ulaşmaz, her kanalda filtresiz hedef hesaplanır.',
  fix: 'Hedefi yalnızca desteklediği düzeyde göster: `IF(NOT ISFILTERED(Satislar[Kanal]), [Hedef])`. Kanal düzeyinde hedef gerekiyorsa hedef tablosuna kanal sütunu ekle.',
  tags: ['hedef', 'farklı ayrıntı düzeyi', 'granülerlik', 'aynı değer', 'ilişki yok', 'bütçe'],
  task: { name: 'Hedef (Düzeye Duyarlı)', q: 'Hedef, kanal kırılımı yapıldığında boş kalmalı; kanal filtresi yokken normal hedefi göstermeli. Düzelt.', start: '[Hedef]', sol: 'IF(NOT ISFILTERED(Satislar[Kanal]), [Hedef])', hint: 'Kanal sütununun filtrelenip filtrelenmediğini sor.', grid: [{ t: 'Satislar', c: 'Kanal' }, { t: 'Tarih', c: 'Yil' }] }
},
{
  id: 'tarih-tablosu-isaretsiz', area: 'Model', lesson: 'tarih-tablosu',
  sym: 'Zaman zekâsı ölçüleri yanlış ya da boş; alan listesinde her tarihin altında “Tarih Hiyerarşisi” var',
  cause: 'Tarih tablosu “tarih tablosu olarak işaretlenmemiş” ve/veya Otomatik tarih/saat açık. Power BI her tarih sütunu için gizli tarih tabloları oluşturur; ölçüler senin tarih tablonu değil bunları kullanabilir, model de şişer.',
  fix: 'Tarih tablosunu seç, Tablo araçları > Tarih tablosu olarak işaretle; Seçenekler > Geçerli dosya > Veri yükleme altında Otomatik tarih/saat’i kapat. Tarih sütunu kesintisiz olmalı.',
  tags: ['otomatik tarih saat', 'tarih tablosu', 'işaretle', 'tarih hiyerarşisi', 'zaman zekâsı çalışmıyor']
},
{
  id: 'cift-yonlu-belirsizlik', area: 'Model', lesson: 'model-temel',
  sym: 'İlişki etkinleştirilemiyor: “belirsizlik” uyarısı ya da sonuçlar tutarsız',
  cause: 'Birden çok çift yönlü (Her ikisi) çapraz filtre, bir tablodan diğerine filtrenin iki farklı yoldan ulaşmasına yol açar. Power BI belirsiz yolu engeller ya da beklenmedik yoldan filtreler.',
  fix: 'İlişkileri tek yönlü yap. İki yönlü filtre yalnızca belirli bir hesapta gerekiyorsa ölçü içinde `CROSSFILTER(…, BOTH)` kullan.',
  tags: ['çift yönlü', 'belirsiz', 'ambiguous', 'çapraz filtre', 'ilişki pasif kaldı', 'both']
},
{
  id: 'ay-alfabetik', area: 'Model', lesson: 'tarih-tablosu',
  sym: 'Ay adları alfabetik sıralanıyor (Ağu, Ara, Eki…)',
  cause: 'Ay sütunu metindir; görsel varsayılan olarak metni alfabetik sıralar.',
  fix: 'Veri görünümünde Ay sütununu seç, Sütun araçları > Sütuna göre sırala (Sort by column) ile AyNo’yu seç. Aynı işlem gün adları (HaftaninGunu → GunNo) için de gerekir.',
  tags: ['sıralama', 'ay sırası', 'alfabetik', 'sütuna göre sırala', 'sort by column']
},
{
  id: 'metin-sayilar', area: 'Power Query', lesson: 'pq-temel',
  sym: 'Sayılar toplanmıyor; alan listesinde Σ işareti yok, görselde yalnızca “Say” seçeneği çıkıyor',
  cause: 'Sütun Power Query’den metin (ABC) türünde geliyor; boşluk, binlik ayırıcı ya da para simgesi tür algılamayı bozmuş olabilir.',
  fix: 'Power Query’de sütun başlığındaki tür simgesinden Ondalık sayı/Tam sayı seç; gerekirse önce Kırp, Değiştir ile simgeleri temizle. Hata veren satırları “Hataları tut” ile incele.',
  tags: ['metin sayı', 'veri türü', 'toplanmıyor', 'say', 'abc', 'tür dönüştürme']
},
{
  id: 'yerel-ayar-tarih', area: 'Power Query', lesson: 'pq-temel',
  sym: 'Tarihlerde gün ve ay yer değiştirmiş ya da 12’den büyük günler hata veriyor',
  cause: 'Kaynak metin tarihleri farklı bir biçimde (ör. ABD AA/GG/YYYY), dönüştürme ise bilgisayarın yerel ayarıyla (GG.AA.YYYY) yapılıyor.',
  fix: 'Sütun türünü değiştirirken “Yerel ayarı kullanarak” (Using locale) seç ve kaynağın biçimine uyan yerel ayarı (ör. İngilizce (ABD)) belirt. Dosya düzeyinde varsayılan yerel ayar Seçenekler’den de ayarlanabilir.',
  tags: ['yerel ayar', 'locale', 'tarih yanlış', 'gün ay karıştı', 'tarih biçimi', 'hata']
},
{
  id: 'sorgu-katlama', area: 'Power Query', lesson: 'm-dili',
  sym: 'Yenileme çok yavaşladı; “Yerel sorguyu görüntüle” gri',
  cause: 'Sorgu katlama (query folding) bozulmuş: kaynağa SQL olarak çevrilemeyen bir adımdan (ör. dizin sütunu, bazı özel sütunlar) sonra tüm adımlar Power Query motorunda yerel olarak çalışır ve tüm veri indirilir.',
  fix: 'Adımlara sağ tıklayıp “Yerel sorguyu görüntüle” ile katlamanın nerede bittiğini bul; filtreleme ve sütun kaldırma gibi katlanabilir adımları o adımdan öne al ya da işi kaynağa (görünüm) taşı.',
  tags: ['query folding', 'sorgu katlama', 'yavaş yenileme', 'yerel sorgu', 'native query', 'performans']
},
{
  id: 'kimlik-bilgisi', area: 'Service', lesson: 'yayinlama',
  sym: 'Service’te zamanlanmış yenileme başarısız: kimlik bilgileri geçersiz / eksik',
  cause: 'Yayımlanan anlam modelinin veri kaynağı kimlik bilgileri Service’te girilmemiş, süresi dolmuş ya da şirket içi kaynak için ağ geçidi eşlenmemiş.',
  fix: 'Anlam modeli Ayarlar’ında Veri kaynağı kimlik bilgilerini düzenle; şirket içi kaynaklarda ağ geçidi bağlantısını eşle. Sonra Şimdi yenile ile dene.',
  tags: ['yenileme hatası', 'kimlik bilgisi', 'credentials', 'ağ geçidi', 'gateway', 'refresh failed']
},
{
  id: 'rls-herkes-goruyor', area: 'Service', lesson: 'guvenlik',
  sym: 'RLS tanımlı ama bir kullanıcı tüm bölgeleri görüyor',
  cause: 'Kullanıcı çalışma alanında Yönetici, Üye veya Katkıda bulunan rolünde. Bu rollerin model üzerinde düzenleme izni vardır ve RLS onlara uygulanmaz; RLS yalnızca Görüntüleyici izniyle erişenleri kısıtlar.',
  fix: 'Tüketicilere çalışma alanında yalnızca Görüntüleyici rolü ver ya da içeriği uygulama ile paylaş; kullanıcıyı anlam modelinin Güvenlik sayfasında doğru role ata ve “Rol olarak test et” ile doğrula.',
  tags: ['rls', 'satır düzeyi güvenlik', 'her şeyi görüyor', 'çalışma alanı rolü', 'görüntüleyici', 'güvenlik']
},
{
  id: 'dilimleyici-suzmuyor', area: 'Rapor', lesson: 'etkilesim',
  sym: 'Dilimleyici bir görseli süzmüyor',
  cause: 'Ya “Etkileşimleri düzenle” ile o görselin etkileşimi kapatılmış (Yok), ya dilimleyicideki alan ile görseldeki alanlar arasında filtre yolu (ilişki) yok, ya da ölçü filtreyi ALL/REMOVEFILTERS ile siliyor.',
  fix: 'Dilimleyiciyi seçip Biçim > Etkileşimleri düzenle’de görselin üstündeki filtre simgesini aç. Etkileşim açıksa model diyagramında ilişkiyi ve ölçüdeki filtre kaldırıcıları kontrol et.',
  tags: ['dilimleyici çalışmıyor', 'etkileşim', 'edit interactions', 'filtre uygulanmıyor', 'slicer']
}
];
})(window);
