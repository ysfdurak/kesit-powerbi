/* Kesit Power BI — Sık karıştırılanlar (35 yeni) ve sık yapılan hatalar (27 yeni), ikinci set. */
(function (W) {
'use strict';

W.PBI_CONFUSED.push(
/* ---------------- DAX ---------------- */
{
  id: 'summarize-ailesi', area: 'DAX', lesson: 'dax-sorgu',
  title: 'SUMMARIZE / SUMMARIZECOLUMNS / GROUPBY',
  items: [
    { n: 'SUMMARIZE', d: 'Bir tablonun (ve ilişkili tabloların) sütunlarına göre benzersiz gruplar döndürür. Gruplama için güvenli; içine hesaplanan sütun yazmak önerilmez.' },
    { n: 'SUMMARIZECOLUMNS', d: 'Görsellerin arka planda kullandığı sorgu fonksiyonu: gruplar, filtre alır, ölçüleri hesaplar ve tüm ölçüleri boş olan satırları kendiliğinden atar.' },
    { n: 'GROUPBY', d: 'Gruplar ve CURRENTGROUP() ile her grubun satırları üzerinde X fonksiyonu (SUMX, MAXX…) çalıştırır. Bağlam geçişi yapmaz; ölçü çağrılamaz.' }
  ],
  rule: 'Rapor tablosu ya da DAX sorgusu için SUMMARIZECOLUMNS. Ölçü içinde gruplanmış bir tabloya ihtiyacın varsa SUMMARIZE (yalnızca sütunlar) + ADDCOLUMNS. Sanal bir tablonun kendi sütunları üzerinde yeniden gruplayacaksan GROUPBY.',
  body: 'Üçü de “grupla” der ama farklı yerlerde güçlüdür. SUMMARIZECOLUMNS’un boş satırları atması çoğu zaman istenen davranıştır; hiç satışı olmayan kategoriyi de görmek istiyorsan kategori listesini ADDCOLUMNS(VALUES(Kategoriler[Kategori]), …) ile kur. GROUPBY, ADDCOLUMNS ile üretilmiş sanal bir tabloda (ör. müşteri başına satış) ikinci bir gruplama yapmak için idealdir; çünkü SUMMARIZE sanal tablodaki hesaplanmış sütunlarla iyi çalışmaz.',
  quiz: [
    { q: 'DAX sorgu görünümünde kategori ve kanal kırılımında Net Satış tablosu çıkaracaksın; boş kombinasyonlar gelmesin. Hangisi en uygun?', o: ['`SUMMARIZE` ile ifade', '`GROUPBY` ve `SUMX`', '`CROSSJOIN` ve `FILTER`', '`SUMMARIZECOLUMNS`'], a: 3, why: 'SUMMARIZECOLUMNS sorgular için tasarlanmıştır ve tüm ölçüleri boş olan satırları kendiliğinden çıkarır. SUMMARIZE içinde ifade önerilmez; GROUPBY ölçü çağıramaz; CROSSJOIN önce tüm kombinasyonları üretir.' },
    { q: 'VAR ile müşteri başına satış tablosu kurdun (ADDCOLUMNS). Şimdi bu tabloda segment başına en yüksek müşteri satışını bulacaksın. Ne kullanırsın?', o: ['`SUMMARIZECOLUMNS` ile yeni sorgu', '`SUMMARIZE` ile yeniden gruplama', '`GROUPBY` + `MAXX(CURRENTGROUP())`', 'Ayrı bir hesaplanmış tablo kurmak'], a: 2, why: 'GROUPBY sanal tablonun kendi sütunları üzerinde gruplar ve CURRENTGROUP ile grup satırlarında X fonksiyonu çalıştırır. SUMMARIZECOLUMNS (Haziran 2024’ten beri ölçü içinde de desteklenir) model sütunlarına göre gruplar; sanal tablonun ADDCOLUMNS ile eklenmiş sütununa göre gruplayamaz. SUMMARIZE de sanal hesaplanmış sütunlarda zayıftır.' }
  ]
},
{
  id: 'filter-calculatetable', area: 'DAX', lesson: 'tablo-fonk',
  title: 'FILTER / CALCULATETABLE',
  items: [
    { n: 'FILTER', d: 'Verilen tabloyu satır satır dolaşır ve koşulu sağlayanları bırakır. Dış filtre bağlamı korunur; yalnızca daraltır.' },
    { n: 'CALCULATETABLE', d: 'Tablo ifadesini, CALCULATE gibi filtre bağlamını değiştirerek hesaplar. Aynı sütundaki dış filtrenin yerine geçer.' }
  ],
  rule: 'Ölçüye bağlı ya da birden çok sütunu karşılaştıran koşul için FILTER. Basit sütun koşuluyla bir tabloyu farklı bir bağlamda istiyorsan CALCULATETABLE. Dış seçimi korumak istiyorsan CALCULATETABLE içinde KEEPFILTERS.',
  body: 'Demo kanal kırılımında çalışıyor. FILTER satır satır baktığı için Mağaza ve Mobil satırlarında Web satırı bulamaz ve boş kalır. CALCULATETABLE ise kanal filtresini “Web” ile değiştirir; her satırda Web’in satır sayısını verir. Karşılaştırma için ilk satırda ham satır sayısı var.',
  demo: { grid: { t: 'Satislar', c: 'Kanal' }, rows: [
    ['COUNTROWS(Satislar)', 'COUNTROWS(Satislar)'],
    ['FILTER(Satislar, Kanal = "Web")', 'COUNTROWS(FILTER(Satislar, Satislar[Kanal] = "Web"))'],
    ['CALCULATETABLE(Satislar, Kanal = "Web")', 'COUNTROWS(CALCULATETABLE(Satislar, Satislar[Kanal] = "Web"))']
  ] },
  quiz: [
    { q: 'Kanal matrisinde her satırda “Web’in satır sayısı” referans sütunu olsun. Hangisi?', o: ['`CALCULATETABLE(Satislar, …Web)`', '`FILTER(Satislar, …Web)`', '`FILTER(VALUES(Satislar[Kanal]), …)`', '`KEEPFILTERS` ile CALCULATETABLE'], a: 0, why: 'CALCULATETABLE kanal filtresini Web ile değiştirir; her satırda aynı referans değeri çıkar. FILTER ve KEEPFILTERS dış kanal filtresini korur, Mağaza satırında boş verir.' },
    { q: 'Ürünleri “ürün bazında net satışı 20.000’den büyük” koşuluyla süzeceksin. Hangisi doğru araç?', o: ['Sütun koşullu CALCULATETABLE', 'Görsel düzeyi Top N filtresi', 'CALCULATETABLE içinde ölçü koşulu', 'FILTER ve VALUES(Urunler[Urun])'], a: 3, why: 'Ölçüye bağlı koşul satır satır değerlendirilmelidir; bunu FILTER yapar. CALCULATETABLE’ın filtre argümanında ölçü doğrudan kullanılamaz. Top N filtresi eşik değil sıra seçer.' }
  ]
},
{
  id: 'rank-ailesi', area: 'DAX', lesson: 'siralama',
  title: 'RANKX / RANK / ROWNUMBER',
  items: [
    { n: 'RANKX', d: 'Bir tabloyu dolaşıp ifadeyi her satırda hesaplar ve geçerli değerin sırasını verir. Esnek ama toplam satırında ve boşlarda dikkat ister.' },
    { n: 'RANK', d: 'Pencere fonksiyonu: ORDERBY ile sıralama, PARTITIONBY ile gruplar içi sıra. Eşitlikte SKIP ya da DENSE seçilebilir.' },
    { n: 'ROWNUMBER', d: 'Pencere fonksiyonu: her satıra benzersiz bir numara verir. Eşitlik olsa da aynı numara iki kez çıkmaz.' }
  ],
  rule: 'Eşit değerler aynı sırayı almalıysa RANKX ya da RANK. Her satır benzersiz bir sıra almalıysa (ilk N’i kesin seçmek, sayfalama) ROWNUMBER. Grup içi sıra için RANK + PARTITIONBY, RANKX’le uğraşmaktan kolaydır.',
  body: 'Demo ürün kırılımında. RANKX toplam satırında da hesaplanır ve “1” gösterir; RANK/ROWNUMBER ise toplamda ürün olmadığı için boş döner. Satışı olmayan iki üründe RANKX ikisine de aynı sırayı verir (eşitlik), ROWNUMBER ise birini 39, diğerini 40 yapar.',
  demo: { grid: { t: 'Urunler', c: 'Urun' }, rows: [
    ['RANKX(ALL(Urun), [Net Satış])', 'RANKX(ALL(Urunler[Urun]), [Net Satış])'],
    ['ROWNUMBER(…, ORDERBY([Net Satış], DESC))', 'ROWNUMBER(ALL(Urunler[Urun]), ORDERBY([Net Satış], DESC))']
  ] },
  quiz: [
    { q: 'Satış müdürü “ilk 10 ürünü kesin 10 satır olarak göster, eşitlikte ürün adına göre ayır” diyor. Hangisi?', o: ['`RANKX` ve `DENSE`', '`RANK` ve `SKIP`', '`ROWNUMBER` ve ORDERBY', 'Görsel Top N filtresi'], a: 2, why: 'ROWNUMBER eşitlikte bile benzersiz numara verir; ORDERBY’a ikinci sıralama ölçütü olarak ürün adını ekleyerek eşitliği kesin bozarsın. RANK ve RANKX eşitlerde aynı sırayı verir, Top N filtresi eşitlikte 10’dan fazla satır getirebilir.' },
    { q: 'Her kategori içinde ürün sırası lazım. En okunur çözüm hangisi?', o: ['`RANK` ve `PARTITIONBY`', 'İç içe iki `RANKX`', '`ROWNUMBER`, bölüm yok', '`TOPN` ve `COUNTROWS`'], a: 0, why: 'PARTITIONBY(Urunler[Kategori]) sıralamayı her kategoride yeniden başlatır. RANKX ile aynı işi ALLEXCEPT ya da kategori filtresiyle kurmak mümkün ama okunması ve bakımı zordur.' }
  ]
},
{
  id: 'iscrossfiltered-ailesi', area: 'DAX', lesson: 'hiyerarsi',
  title: 'ISFILTERED / ISCROSSFILTERED / HASONEFILTER / HASONEVALUE',
  items: [
    { n: 'ISFILTERED', d: 'Sütuna doğrudan bir filtre konmuşsa TRUE. Başka bir sütundan ilişkiyle gelen filtreyi saymaz.' },
    { n: 'ISCROSSFILTERED', d: 'Sütun doğrudan ya da başka bir sütun/tablo üzerinden dolaylı olarak süzülüyorsa TRUE.' },
    { n: 'HASONEFILTER', d: 'Sütunda doğrudan filtre var ve bu filtre tek bir değer içeriyorsa TRUE.' },
    { n: 'HASONEVALUE', d: 'Sütunda (filtre nereden gelirse gelsin) görünen değer tam olarak bir taneyse TRUE.' }
  ],
  rule: '“Kullanıcı bu alanı mı seçti?” sorusu için ISFILTERED/HASONEFILTER. “Bu satırda tek bir değer mi görünüyor?” sorusu için HASONEVALUE. Filtrenin başka tablodan gelip gelmediğini ayırt etmen gerekiyorsa ISCROSSFILTERED.',
  body: 'Demo Kategoriler[Kategori] kırılımında, ama sorular Urunler[Kategori] sütununa soruluyor. Görsel Kategoriler tablosunu süzer; filtre ilişkiyle Urunler’e akar. Bu yüzden Urunler[Kategori] doğrudan süzülmemiştir (ISFILTERED, HASONEFILTER yanlış) ama çapraz süzülmüştür ve her satırda tek değer görünür (ISCROSSFILTERED, HASONEVALUE doğru). Dinamik başlık yazarken hangi tablonun sütununu sorduğun bu yüzden önemlidir.',
  demo: { grid: { t: 'Kategoriler', c: 'Kategori' }, rows: [
    ['ISFILTERED(Kategoriler[Kategori])', 'IF(ISFILTERED(Kategoriler[Kategori]), "doğrudan", "yok")'],
    ['ISFILTERED(Urunler[Kategori])', 'IF(ISFILTERED(Urunler[Kategori]), "doğrudan", "yok")'],
    ['ISCROSSFILTERED(Urunler[Kategori])', 'IF(ISCROSSFILTERED(Urunler[Kategori]), "çapraz", "yok")'],
    ['HASONEVALUE(Urunler[Kategori])', 'IF(HASONEVALUE(Urunler[Kategori]), "tek değer", "birden çok")']
  ] },
  quiz: [
    { q: 'Dilimleyici Kategoriler[Kategori] alanında. Başlık ölçün `ISFILTERED(Urunler[Kategori])` ile seçimi kontrol ediyor ve hep “Tüm kategoriler” yazıyor. Neden?', o: ['Dilimleyici çoklu seçimde', 'ISFILTERED toplamda çalışmaz', 'İlişki çift yönlü olmalı', 'Filtre dolaylı geliyor'], a: 3, why: 'Doğrudan filtre Kategoriler tablosunda; Urunler[Kategori] yalnızca çapraz süzülür. Ya dilimleyicideki sütunu sor (Kategoriler[Kategori]) ya da ISCROSSFILTERED kullan.' },
    { q: 'Matriste her satırda tek bir ürün görünüyorsa birim fiyatı, aksi hâlde boş göstereceksin; filtre nereden gelirse gelsin. Hangisi?', o: ['`ISFILTERED(Urunler[Urun])`', '`HASONEFILTER(Urunler[Urun])`', '`HASONEVALUE(Urunler[Urun])`', '`ISCROSSFILTERED(Urunler)`'], a: 2, why: 'HASONEVALUE görünen değer sayısına bakar; filtrenin satır başlığından, dilimleyiciden ya da başka bir tablodan gelmesi fark etmez. ISFILTERED çoklu seçimde de TRUE olur, HASONEFILTER dolaylı filtreyi görmez.' }
  ]
},
{
  id: 'yineleyicide-olcu', area: 'DAX', lesson: 'baglam-gecisi',
  title: 'Yineleyicide ölçü çağırmak / çıplak toplama',
  items: [
    { n: 'SUMX(Urunler, [Ölçü])', d: 'Her ürün satırında ölçü çağrılır; ölçünün görünmez CALCULATE’i satır bağlamını filtreye çevirir (bağlam geçişi). Sonuç o ürünün değeridir.' },
    { n: 'SUMX(Urunler, SUM(...))', d: 'SUM satır bağlamını görmez; her ürün satırında dış filtre bağlamındaki toplamı döndürür. Sonuç toplam × satır sayısıdır.' },
    { n: 'SUMX(Urunler, CALCULATE(SUM(...)))', d: 'CALCULATE ile sarınca bağlam geçişi olur; ölçü çağırmakla aynı sonucu verir.' }
  ],
  rule: 'Yineleyicinin içinde başka tablodaki bir değeri satıra göre hesaplatacaksan ölçü çağır ya da CALCULATE ile sar. Çıplak SUM/COUNT her satırda aynı sayıyı tekrarlar.',
  body: 'Demoda kategori kırılımında ürünler üzerinde dönülüyor. Ölçü çağıran satır doğru kategori toplamını verir. Çıplak SUM ise her ürün satırında kategorinin toplamını bir daha ekler; Elektronik’te 8 ürün olduğu için sonuç 8 katına çıkar. Bağlam geçişi dersinde mekanizmayı ayrıntılı gördün; bu kart yalnızca belirtiyi tanımak için.',
  demo: { grid: { t: 'Kategoriler', c: 'Kategori' }, rows: [
    ['SUMX(Urunler, [Toplam Satış])', 'SUMX(Urunler, [Toplam Satış])'],
    ['SUMX(Urunler, SUM(Satislar[Tutar]))', 'SUMX(Urunler, SUM(Satislar[Tutar]))']
  ] },
  quiz: [
    { q: 'Bir ölçü kategori satırlarında gerçeğin tam ürün sayısı katı kadar büyük çıkıyor. En olası neden?', o: ['SUMX içinde çıplak SUM', 'İlişki çift yönlü kurulmuş', 'Ölçüde DIVIDE kullanılmamış', 'Tarih tablosu işaretsiz'], a: 0, why: 'SUM satır bağlamını filtreye çevirmez; her ürün satırında kategori toplamını yeniden döndürür. Sonuç toplam × ürün sayısıdır. Ölçü çağırmak ya da CALCULATE ile sarmak düzeltir.' },
    { q: '`SUMX(Urunler, [Toplam Satış])` ile `SUMX(Urunler, CALCULATE(SUM(Satislar[Tutar])))` farkı?', o: ['İkincisi iptalleri dışlar', 'Birincisi bağlam geçişi yapmaz', 'İkincisi toplamda boş döner', 'Sonuç aynı'], a: 3, why: 'Her ölçü çağrısının etrafında görünmez bir CALCULATE vardır; ikisi de bağlam geçişi yapar ve aynı sonucu verir. Ölçü kullanmak okunurluk ve tekrar kullanım için tercih edilir.' }
  ]
},
{
  id: 'lastdate-lastnonblank', area: 'DAX', lesson: 'yari-toplanabilir',
  title: 'SUM / LASTDATE / LASTNONBLANK (stok gibi ölçülerde)',
  items: [
    { n: 'SUM', d: 'Dönemdeki tüm anlık değerleri toplar. Stok ve bakiye gibi yarı toplanabilir ölçülerde yıl satırında anlamsız büyük sayılar üretir.' },
    { n: 'LASTDATE', d: 'Görünen dönemin takvimdeki son tarihini verir; o gün veri yoksa sonuç boştur.' },
    { n: 'LASTNONBLANK', d: 'Görünen dönemde ifadenin boş olmadığı son tarihi verir; veri olmayan son günleri atlar.' }
  ],
  rule: 'Akış ölçüsü (satış, adet) toplanır. Anlık değer (stok, bakiye, çalışan sayısı) dönemin son değeriyle gösterilir: veri her dönem sonunda varsa LASTDATE, aralıklı geliyorsa LASTNONBLANK.',
  body: 'StokGorunum her ay sonunda bir anlık görüntü tutar. Yıl kırılımında SUM 12 ayın stoğunu toplar; gerçek bir anlamı yoktur. LASTDATE yılın son gününe, yani Aralık sonu stoğuna bakar. Bu modelde veri her ay sonunda olduğu için LASTNONBLANK aynı sonucu verir; ama son ayın görüntüsü henüz gelmediyse LASTDATE boş, LASTNONBLANK bir önceki ayı gösterir.',
  demo: { grid: { t: 'Tarih', c: 'Yil' }, noTotal: true, rows: [
    ['SUM(StokAdet)', 'SUM(StokGorunum[StokAdet])'],
    ['LASTDATE ile son gün', 'CALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))']
  ] },
  quiz: [
    { q: 'Banka bakiye tablosu yalnızca hareket olan günlerde satır tutuyor. Ay sonu bakiyesini göstereceksin. Hangisi?', o: ['`SUM` ile toplam bakiye', '`LASTDATE` ile ayın son günü', '`LASTNONBLANK`', '`AVERAGE` ile ortalama bakiye'], a: 2, why: 'Ayın son günü hareket yoksa LASTDATE boş döner. LASTNONBLANK verinin bulunduğu son günü bulur. SUM ve ortalama anlık değerler için yanlış birimdir.' },
    { q: 'Çalışan sayısı ölçüsü yıl satırında “3.120” gösteriyor; şirkette 260 kişi var. Neden?', o: ['Aylık değerler toplanıyor', 'İlişki pasif kalmış', 'RLS bazı satırları gizliyor', 'Tarih tablosu eksik gün içeriyor'], a: 0, why: '12 aylık anlık değerin toplamı 12 × 260 civarıdır. Yarı toplanabilir bir ölçüde dönemin son değerini (LASTDATE/LASTNONBLANK) ya da ortalamasını açıkça seçmelisin.' }
  ]
},
{
  id: 'iliski-fonksiyonlari', area: 'DAX', lesson: 'rol-oynayan',
  title: 'USERELATIONSHIP / CROSSFILTER / TREATAS',
  items: [
    { n: 'USERELATIONSHIP', d: 'Modelde zaten var olan pasif bir ilişkiyi yalnızca bu hesap için etkinleştirir; aynı iki tablo arasındaki etkin ilişki o sırada devre dışı kalır.' },
    { n: 'CROSSFILTER', d: 'Var olan bir ilişkinin yönünü bu hesap için değiştirir: BOTH (çift yön), ONEWAY ya da NONE (ilişkiyi yok say).' },
    { n: 'TREATAS', d: 'Arada hiç ilişki olmasa bile bir tablonun değerlerini başka bir sütunun filtresi gibi uygular (sanal ilişki).' }
  ],
  rule: 'İlişki var ama pasifse USERELATIONSHIP. İlişki var ama yönü ya da varlığı bu hesapta farklı olmalıysa CROSSFILTER. İlişki hiç yoksa ve kurmak istemiyorsan TREATAS.',
  body: 'Demo yıl kırılımında. İlk satır sipariş tarihine göre net satış (etkin ilişki). USERELATIONSHIP teslim tarihi ilişkisini açar; Aralık siparişlerinin bir kısmı ertesi yıla kaydığı için yıllar değişir. CROSSFILTER(…, NONE) tarih ilişkisini tamamen kapatır; her yılda tüm dönemin toplamı görünür.',
  demo: { grid: { t: 'Tarih', c: 'Yil' }, noTotal: true, rows: [
    ['[Net Satış] (sipariş tarihi)', '[Net Satış]'],
    ['USERELATIONSHIP (teslim tarihi)', 'CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))'],
    ['CROSSFILTER(…, NONE)', 'CALCULATE([Net Satış], CROSSFILTER(Satislar[Tarih], Tarih[Tarih], NONE))']
  ] },
  quiz: [
    { q: 'Bütçe tablosu modele bağlı değil; bütçe ölçüsü kategori dilimleyicisine tepki vermeli ama yeni ilişki eklemek yasak. Ne kullanırsın?', o: ['`USERELATIONSHIP`', '`CROSSFILTER(…, BOTH)`', '`RELATED`', '`TREATAS`'], a: 3, why: 'İlişki yokken filtre taşımanın yolu TREATAS’tır. USERELATIONSHIP ve CROSSFILTER yalnızca modelde var olan bir ilişki üzerinde çalışır; RELATED de ilişki ister.' },
    { q: 'Teslim tarihine göre satış ölçüsü sipariş tarihine göre olanla aynı çıkıyor. Kod: `CALCULATE([Net Satış], USERELATIONSHIP(Satislar[Tarih], Tarih[Tarih]))`. Hata ne?', o: ['İlişki çift yönlü olmalı', 'CROSSFILTER eksik', 'Yanlış sütun verilmiş', 'Tarih tablosu işaretsiz'], a: 2, why: 'USERELATIONSHIP zaten etkin olan sipariş tarihi ilişkisini istiyor; hiçbir şey değişmez. Pasif ilişkinin sütunu Satislar[TeslimTarihi] verilmelidir.' }
  ]
},
{
  id: 'format-bicim-dizesi', area: 'DAX', lesson: 'hesaplama-gruplari',
  title: 'FORMAT() / biçim dizesi / dinamik biçim dizesi',
  items: [
    { n: 'FORMAT()', d: 'Sayıyı metne çevirir. Görselde sayı değil metin olur: grafikte çizilemez, sayısal sıralanmaz, toplam satırı ve koşullu biçim bozulur.' },
    { n: 'Biçim dizesi', d: 'Ölçünün sabit görüntü biçimi (Ölçü araçları → Biçim). Değer sayı olarak kalır; yalnızca gösterimi değişir.' },
    { n: 'Dinamik biçim dizesi', d: 'Biçimi bir DAX ifadesi belirler (Biçim: Dinamik). Değer yine sayıdır; seçime göre % ya da ₺ gibi farklı biçimler alabilir.' }
  ],
  rule: 'Grafikte, tabloda ve sıralamada kullanılacak her değer sayı kalmalı: biçim dizesi ya da dinamik biçim dizesi. FORMAT’ı yalnızca başlık, etiket ve açıklama gibi metin ölçülerinde kullan.',
  body: 'En sık görülen hata, “₺ işareti görünsün” diye ölçüyü FORMAT ile sarmaktır. Ölçü metne döner ve “9.500 ₺” değeri “12.000 ₺”den büyük sıralanır, çünkü metin karakter karakter karşılaştırılır. Seçime göre değişen biçim gerekiyorsa (ör. Görünüm tablosu: Cari / YoY %) dinamik biçim dizesi doğru araçtır; hesaplama grubu öğelerinde de aynı mekanizma vardır.',
  quiz: [
    { q: 'Alan parametresiyle ölçü seçiliyor: “Net Satış” seçilince ₺, “YoY %” seçilince yüzde biçimi gerekiyor ve grafik çizilmeye devam etmeli. Ne yaparsın?', o: ['Dinamik biçim dizesi', '`FORMAT` ile metne çevir', 'İki ayrı grafik ve yer işareti', 'Biçimi Genel bırak'], a: 0, why: 'Dinamik biçim dizesi değeri sayı olarak bırakır, yalnızca gösterimi seçime göre değiştirir. FORMAT metin üretir ve grafik çizemez.' },
    { q: 'Tablo Net Satış’a göre sıralanınca “9.500 ₺” en üstte, “120.000 ₺” aşağıda. Ölçüde ne olabilir?', o: ['Biçim dizesi yanlış seçilmiş', 'Sıralama ölçütü sütunu eksik', 'Toplam satırı kapatılmış', 'Ölçü metin döndürüyor'], a: 3, why: 'Metin, karakter karakter sıralanır: “9” “1”den büyüktür. Ölçünün sayı döndürmesini sağla, para birimini biçim dizesiyle göster.' }
  ]
},
{
  id: 'pencere-fonksiyonlari', area: 'DAX', lesson: 'pencere',
  title: 'OFFSET / INDEX / WINDOW',
  items: [
    { n: 'OFFSET', d: 'Geçerli satıra göre göreli bir satır döndürür: −1 bir önceki, +1 bir sonraki. Önceki dönem ve fark hesapları için.' },
    { n: 'INDEX', d: 'Sıralanmış listede mutlak konumdaki satırı döndürür: 1 ilk, −1 son. “İlk yıla göre” ya da “en son aya göre” kıyas için.' },
    { n: 'WINDOW', d: 'Bir başlangıç ve bitiş arasındaki satır aralığını döndürür (mutlak ya da göreli). Kümülatif toplam ve hareketli pencere için.' }
  ],
  rule: 'Tek bir komşu satır: OFFSET. Sabit bir referans satır: INDEX. Bir satır aralığı: WINDOW. Üçü de ORDERBY ister; hangi tabloda gezildiğini (ALLSELECTED(…)) açıkça yaz.',
  body: 'Demo yıl kırılımında. OFFSET(−1) her yılda bir önceki yılı verir; 2022’nin öncesi olmadığı için boştur. INDEX(1) her satırda ilk yılı (2022) verir. WINDOW(1, ABS, 0, REL) ilk yıldan geçerli yıla kadar olan aralığı toplar: kümülatif. Pencere fonksiyonları dersindeki ayrıntılara buradan dönebilirsin.',
  demo: { grid: { t: 'Tarih', c: 'Yil' }, noTotal: true, rows: [
    ['OFFSET(-1, …)', 'CALCULATE([Net Satış], OFFSET(-1, ALLSELECTED(Tarih[Yil]), ORDERBY(Tarih[Yil], ASC)))'],
    ['INDEX(1, …)', 'CALCULATE([Net Satış], INDEX(1, ALLSELECTED(Tarih[Yil]), ORDERBY(Tarih[Yil], ASC)))'],
    ['WINDOW(1, ABS, 0, REL, …)', 'CALCULATE([Net Satış], WINDOW(1, ABS, 0, REL, ALLSELECTED(Tarih[Yil]), ORDERBY(Tarih[Yil], ASC)))']
  ] },
  quiz: [
    { q: 'Her ay satırında satışın, seçili dönemin ilk ayına göre endeksi (ilk ay = 100) gösterilecek. Paydada hangisi?', o: ['`INDEX(1, …)`', '`OFFSET(-1, …)`', '`WINDOW(1, ABS, 0, REL, …)`', '`PREVIOUSMONTH`'], a: 0, why: 'İlk ay sabit bir referanstır: mutlak konum 1’i INDEX döndürür. OFFSET yalnızca bir önceki ayı, WINDOW bir aralığı verir.' },
    { q: 'Son 3 ayın hareketli toplamını pencere fonksiyonuyla yazacaksın. Hangisi?', o: ['`OFFSET(-2, …)` ve SUMX', '`WINDOW(-2, REL, 0, REL, …)`', '`INDEX(-3, …)` ve SUMX', '`WINDOW(-3, REL, -1, REL, …)`'], a: 1, why: 'Geçerli satır dahil üç satır: iki önceki satırdan (−2, göreli) geçerli satıra (0, göreli). OFFSET tek bir satır verir; −3…−1 aralığı geçerli ayı dışarıda bırakır.' }
  ]
},
{
  id: 'hesaplama-grubu-alan-param', area: 'DAX', lesson: 'hesaplama-gruplari',
  title: 'Hesaplama grubu / alan parametresi',
  items: [
    { n: 'Hesaplama grubu', d: 'Herhangi bir ölçüye uygulanan dönüşümler (YTD, GY, YoY %) tanımlar. Öğeler SELECTEDMEASURE() ile çalışır; ölçü sayısı çarpılmaz.' },
    { n: 'Alan parametresi', d: 'Kullanıcının görselde hangi ölçünün ya da hangi boyut sütununun görüneceğini seçmesini sağlar. Hesap yapmaz, yalnızca alan değiştirir.' }
  ],
  rule: '“Aynı hesabı her ölçüye uygula” sorusu hesaplama grubudur. “Kullanıcı hangi alanı göreceğini seçsin” sorusu alan parametresidir. İkisi birlikte de kullanılabilir: parametre ölçüyü, hesaplama grubu zaman dönüşümünü seçer.',
  body: 'Beş ölçü × dört zaman görünümü için 20 ölçü yazmak yerine beş ölçü ve dört öğelik bir hesaplama grubu yeter. Alan parametresi ise “Net Satış mı Brüt Kâr mı?” ya da “Kategoriye mi kanala mı göre?” seçimini dilimleyiciye taşır. Hesaplama grubu örtük ölçülerle (sürükle-bırak toplama) çalışmaz; modelde açık ölçü kullanma alışkanlığı ister.',
  quiz: [
    { q: 'Finans ekibi 12 ölçünün her biri için YTD, GY ve YoY % istiyor. Bakımı en kolay yol?', o: ['36 yeni ölçü', 'Alan parametresi', 'Görsel hesaplama', 'Hesaplama grubu'], a: 3, why: 'Hesaplama grubu üç dönüşümü bir kez tanımlar ve tüm ölçülere uygular. Alan parametresi yalnızca alan seçtirir, hesap yapmaz. Görsel hesaplama tek görselde kalır.' },
    { q: 'Yönetici aynı grafikte ekseni “Kategori”, “Kanal” ve “Şehir” arasında değiştirmek istiyor. Hangisi?', o: ['Alan parametresi', 'Hesaplama grubu', 'Yer işareti ve üç grafik', '`SWITCH` ölçüsü'], a: 0, why: 'Alan parametresi boyut sütunlarını da listeleyebilir; eksene konduğunda seçilen sütunla gruplar. Hesaplama grubu ölçüleri dönüştürür, ekseni değiştirmez.' }
  ]
},
{
  id: 'gorsel-hesaplama-olcu', area: 'DAX', lesson: 'pencere',
  title: 'Model ölçüsü / görsel hesaplama / hızlı ölçü',
  items: [
    { n: 'Model ölçüsü', d: 'Modelde yaşar; her raporda, her görselde ve Excel’de kullanılabilir. Filtre bağlamıyla çalışır.' },
    { n: 'Görsel hesaplama', d: 'Yalnızca bir görselin içinde yaşar ve görselin satır/sütun düzeninde çalışır (RUNNINGSUM, PREVIOUS…). Başka görselde kullanılamaz.' },
    { n: 'Hızlı ölçü', d: 'Menüden şablonla üretilen normal bir model ölçüsüdür. Üretildikten sonra kodu okunup düzenlenmelidir.' }
  ],
  rule: 'Kurumsal bir tanım (marj, YoY) model ölçüsüdür. Yalnızca o görselin düzenine bağlı bir hesap (bu tablodaki kümülatif, önceki satırla fark) görsel hesaplamadır. Hızlı ölçü bir başlangıç noktasıdır, son hâl değil.',
  body: 'Görsel hesaplama, görseldeki satırların sırasını bildiği için kümülatif ve fark gibi hesapları çok kısa yazar; ama tanım o görselde hapsolur ve başka rapor ya da Excel kullanıcısı onu göremez. Aynı hesap birden çok yerde gerekiyorsa model ölçüsüne taşı. Hızlı ölçülerin ürettiği kodun adları ve biçimi çoğu zaman ekip standartlarına uymaz; yeniden adlandır ve sadeleştir.',
  quiz: [
    { q: 'Bir analist yalnızca kendi matrisinde “önceki satıra göre fark” sütunu istiyor; bu tanım başka yerde kullanılmayacak. En hızlı doğru yol?', o: ['Hesaplama grubu', 'Model ölçüsü ve OFFSET', 'Görsel hesaplama', 'Hesaplanmış sütun'], a: 2, why: 'Hesap görselin kendi satır düzenine bağlı ve tek yerde kullanılacak; görsel hesaplama bunun için tasarlanmıştır. Model ölçüsü de olur ama gereksiz yere modeli büyütür.' },
    { q: 'Görsel hesaplamayla yazılan “kümülatif marj” finans ekibinin Excel’e bağlı raporunda da lazım. Ne yapmalısın?', o: ['Görseli Excel’e kopyala', 'Excel’de formülle yeniden yaz', 'Model ölçüsüne taşı', 'Görsel hesaplamayı dışa aktar'], a: 2, why: 'Görsel hesaplama yalnızca o görselde yaşar; Excel ya da başka raporlar onu göremez. Paylaşılacak tanım modele taşınmalıdır.' }
  ]
},
{
  id: 'stdev-p-s', area: 'DAX', lesson: 'istatistik',
  title: 'STDEV.P / STDEV.S',
  items: [
    { n: 'STDEV.P', d: 'Elindeki veri tüm topluluk (popülasyon) kabul edilir; n’e böler. Tek değerde sonuç 0’dır.' },
    { n: 'STDEV.S', d: 'Veri daha büyük bir topluluğun örneklemi kabul edilir; n − 1’e böler, sonuç biraz daha büyüktür. Tek değerde hesaplanamaz.' }
  ],
  rule: 'Şirketteki tüm çalışanların maaş dağılımını anlatıyorsan .P. Bir anketin ya da örneklemin daha büyük bir kitleyi temsil ettiğini varsayıyorsan .S. Küçük gruplarda fark büyür; hangi seçimi yaptığını rapor notuna yaz.',
  body: 'Demo departman kırılımında. Çalışan sayısı az olan departmanlarda iki değer arasındaki fark belirginleşir. Tek kişilik departmanda .P sıfır verir, .S hesaplanamaz ve boş kalır. İleri istatistik dersindeki z-skoru ölçüsü .P kullanır; çünkü seri, seçili dönemin tamamıdır.',
  demo: { grid: { t: 'Departmanlar', c: 'Departman' }, rows: [
    ['STDEV.P(Maas)', 'STDEV.P(Calisanlar[Maas])'],
    ['STDEV.S(Maas)', 'STDEV.S(Calisanlar[Maas])']
  ] },
  quiz: [
    { q: 'İK, şirketteki 27 çalışanın tümünün maaş dağılımını raporluyor. Hangisi?', o: ['`STDEV.P`', '`STDEV.S`', '`VAR.S`', '`STDEVX.S`'], a: 0, why: 'Veri tüm topluluğun kendisi; tahmin yapılmıyor. Popülasyon formülü (.P) uygundur. Varyans fonksiyonları standart sapma değil, karesini verir.' },
    { q: '200 kişilik müşteri memnuniyeti anketinden tüm müşteri kitlesi için dağılım tahmini yapılacak. Hangisi?', o: ['`STDEV.P`', '`MEDIAN`', '`AVERAGE`', '`STDEV.S`'], a: 3, why: 'Örneklemden kitleye genelleme yapılıyor; n − 1’e bölen örneklem formülü (.S) yanlılığı düzeltir. Medyan ve ortalama yayılım ölçüsü değildir.' }
  ]
},

/* ---------------- Model ---------------- */
{
  id: 'yildiz-kartanesi', area: 'Model', lesson: 'model-ileri',
  title: 'Yıldız şema / kar tanesi şema / tek düz tablo',
  items: [
    { n: 'Yıldız şema', d: 'Ortada olgu tablosu, çevresinde ona doğrudan bağlı boyut tabloları. Power BI’ın en iyi çalıştığı yapı.' },
    { n: 'Kar tanesi', d: 'Boyutlar kendi içinde başka boyutlara bağlanır (Ürün → Kategori). Kaynak sistemde yaygın; raporda fazladan ilişki zinciri demektir.' },
    { n: 'Tek düz tablo', d: 'Her şey tek bir geniş tabloda. Küçük analizlerde hızlı başlar ama farklı ayrıntı düzeyindeki verilerle (hedef, bütçe) birleştirilemez.' }
  ],
  rule: 'Varsayılan hedef yıldız şemadır. Kar tanesindeki küçük boyutları Power Query’de ana boyuta birleştir; ayrı tutmak için açık bir sebep olsun (ör. başka bir olgu tablosu da o boyuta bağlanıyorsa). Düz tabloyu yalnızca tek seferlik keşifte kullan.',
  body: 'Bu modelde Urunler → Kategoriler bağı küçük bir kar tanesi örneğidir; Kategoriler ayrı duruyor çünkü Hedefler de kategori düzeyinde ona bağlanıyor. Bu iyi bir sebeptir. Sebep yoksa her ek bağ, filtrenin bir adım daha yürümesi ve alan listesinde bir tablo daha demektir.',
  quiz: [
    { q: 'Kaynakta Ürün → AltKategori → Kategori üç ayrı tabloda. Başka hiçbir tablo AltKategori ya da Kategori’ye bağlanmıyor. Ne önerirsin?', o: ['Üçünü zincir hâlinde bırak', 'Satışa kategori sütunu ekle', 'İlişkileri çift yönlü yap', 'PQ’da tek boyuta birleştir'], a: 3, why: 'Başka bağlayan yoksa üç tabloyu tek boyuta birleştirmek ilişki zincirini kısaltır, alan listesini sadeleştirir. Olgu tablosuna metin eklemek onu şişirir; çift yön belirsizlik riski getirir.' },
    { q: 'Hedefler kategori ve ay düzeyinde, satışlar ürün ve gün düzeyinde. Neden tek düz tablo yetmez?', o: ['Ayrıntı düzeyleri farklı', 'Satır sayısı çok fazla', 'Düz tabloda ölçü yazılamaz', 'Power BI düz tablo okumaz'], a: 0, why: 'Hedefi ürün satırlarına kopyalamak hedefi şişirir. Farklı ayrıntı düzeyleri ancak ortak boyutlar (Kategoriler, Tarih) üzerinden yıldız şemayla doğru birleşir.' }
  ]
},
{
  id: 'kardinalite-turleri', area: 'Model', lesson: 'model-temel',
  title: 'Çoka bir / bire bir / çoka çok ilişki',
  items: [
    { n: 'Çoka bir (*:1)', d: 'Bir tarafta anahtar benzersiz (boyut), diğer tarafta tekrar eder (olgu). Standart ve en verimli ilişki.' },
    { n: 'Bire bir (1:1)', d: 'İki tarafta da anahtar benzersiz. Çoğu zaman iki tablonun aslında tek tablo olması gerektiğini gösterir.' },
    { n: 'Çoka çok (*:*)', d: 'İki tarafta da anahtar tekrar eder. Farklı ayrıntı düzeyleri için geçerli bir araçtır ama kirli bir anahtarın üstünü örtmek için kullanılırsa sessizce yanlış toplam üretir.' }
  ],
  rule: 'Önce *:1 hedefle. 1:1 görürsen tabloları birleştirmeyi düşün. *:* yalnızca bilinçli bir tasarım kararı olsun (ör. ay düzeyindeki bütçeyi kategoriyle bağlamak); “Power BI önerdi” diye kabul etme.',
  body: 'Power BI ilişkiyi kurarken anahtardaki değerlere bakarak kardinaliteyi önerir. Ürün tablosunda tek bir yinelenen ürün numarası varsa öneri *:* olur. Bu bir uyarıdır: önce yinelenen satırı bul. Püf noktaları sayfasındaki kardinalite kontrolü sorgusu bunu tek satırda yapar.',
  quiz: [
    { q: 'Ürün boyutunu bağlarken Power BI çoka çok önerdi. İlk adımın ne olur?', o: ['Tekrar eden anahtarı bul', 'Öneriyi olduğu gibi kabul et', 'İlişkiyi çift yönlü kur', 'Tabloyu DirectQuery’ye çevir'], a: 0, why: 'Boyut tablosunda anahtar benzersiz olmalı; *:* önerisi orada tekrar olduğunu söyler. Önce veri düzeltilir, sonra *:1 kurulur.' },
    { q: 'Musteriler ve MusteriAdresleri arasında 1:1 ilişki var; her müşterinin tek adresi var. En iyi tasarım?', o: ['Bire bir ilişki kalsın', 'İlişkiyi çoka çok yap', 'Tabloları birleştir', 'İki ayrı rapor hazırla'], a: 2, why: '1:1 ilişki, iki tablonun aynı varlığı anlattığını gösterir. Birleştirmek bir ilişkiyi ve bir tabloyu ortadan kaldırır, alan listesi sadeleşir.' }
  ]
},
{
  id: 'hesap-sutun-ozel-sutun', area: 'Model', lesson: 'pq-model',
  title: 'DAX hesaplanmış sütun / Power Query özel sütun',
  items: [
    { n: 'DAX hesaplanmış sütun', d: 'Veri modele yüklendikten sonra hesaplanır; diğer tablolara ve ilişkilere (RELATED) erişebilir. Sıkıştırması genelde daha zayıftır, yenilemede ayrıca hesaplanır.' },
    { n: 'Power Query özel sütun', d: 'Yükleme sırasında, kaynağa yakın hesaplanır; katlama varsa kaynakta çalışır. Model onu sıradan bir sütun gibi sıkıştırır; başka sorgulara ve paylaşılan veri akışına da taşınabilir.' }
  ],
  rule: 'Sütun ham veriden üretilebiliyorsa Power Query’de (ya da daha da yukarıda, kaynakta) yap. Model ilişkilerine ya da başka tablodaki toplamlara ihtiyaç duyuyorsa DAX hesaplanmış sütun. Rapor anında filtreye göre değişmesi gerekiyorsa sütun değil ölçü.',
  body: 'Genel ilke: dönüşümü olabildiğince yukarıda, olabildiğince aşağıda gerektiği kadar yap. “Yaş grubu” gibi bir sütun doğum yılından Power Query’de üretilir. “Müşterinin ilk sipariş tarihi” gibi Satislar’a bakan bir sütun ise DAX’ta RELATEDTABLE/CALCULATE ile daha kolaydır. İkisinde de sonuç sabittir; dilimleyiciye tepki vermez.',
  quiz: [
    { q: 'Musteriler tablosuna DogumYili’ndan “YasGrubu” sütunu eklenecek. Nerede yaparsın?', o: ['Power Query', 'DAX hesaplanmış sütun', 'Rapor ölçüsü', 'Görsel hesaplama'], a: 0, why: 'Yalnızca aynı satırdaki ham veriye dayanıyor; Power Query’de üretmek modeli sade tutar ve sütun iyi sıkışır. Ölçü sabit bir sınıflandırma için gereksizdir.' },
    { q: 'Urunler tablosunda “tüm zamanların toplam satış adedi” sütunu gerekiyor (sıralama ve gruplama için sabit). En pratik yer?', o: ['Power Query özel sütun', 'Dinamik biçim dizesi', 'Alan parametresi', 'DAX hesaplanmış sütun'], a: 3, why: 'Değer başka bir tablodaki (Satislar) toplamı istiyor; DAX hesaplanmış sütunu bağlam geçişiyle bunu tek satırda yapar. Power Query’de birleştirme ve gruplama gerekir.' }
  ]
},
{
  id: 'tarih-isaretle-otomatik', area: 'Model', lesson: 'tarih-tablosu',
  title: 'Tarih tablosu olarak işaretle / otomatik tarih-saat',
  items: [
    { n: 'Tarih tablosu olarak işaretle', d: 'Kendi takvim tablonu modelin resmî tarih tablosu yapar. Sütun benzersiz ve boşluksuz tarihler içermelidir. Zaman zekâsı bu tabloyu kullanır.' },
    { n: 'Otomatik tarih/saat', d: 'Her tarih sütunu için gizli bir takvim tablosu üretir ve Yıl/Çeyrek/Ay/Gün hiyerarşisi verir. Hızlı başlangıç sağlar ama modeli büyütür ve ortak bir takvim sunmaz.' }
  ],
  rule: 'Kurumsal modelde: kendi Tarih tablon + işaretle + otomatik tarih/saat kapalı. Otomatik tarih/saati yalnızca tek tablolu hızlı keşiflerde kullan.',
  body: 'İşaretli tarih tablosunda, tarih sütununa filtre koyan zaman zekâsı fonksiyonları (SAMEPERIODLASTYEAR gibi) tablonun diğer sütunlarındaki filtreleri de kendiliğinden kaldırır. Otomatik tarih/saat açıkken ise “Tarih” ve “Tarih Hiyerarşisi” diye iki farklı alan görünür ve ekipte hangi yılın kullanıldığı karışır.',
  quiz: [
    { q: 'Modelde kendi Tarih tablon var; dosya beklenenden büyük ve alan listesinde her tarih sütununun altında hiyerarşi çıkıyor. Ne yaparsın?', o: ['Tarih tablosunu sil', 'Tarihleri metne çevir', 'Otomatik tarihi kapat', 'Hiyerarşileri gizle'], a: 2, why: 'Gizli takvim tabloları otomatik tarih/saat ayarından gelir. Kapatınca tablolar silinir, model küçülür; kendi Tarih tablon tek takvim olur.' },
    { q: '“Tarih tablosu olarak işaretle” hata veriyor. En olası neden?', o: ['Tarihte tekrar ya da boşluk', 'Tabloda Yıl sütunu bulunmuyor', 'Tablo DAX ile üretilmiş', 'İlişki tek yönlü kurulmuş'], a: 0, why: 'İşaretlenecek sütun benzersiz ve kesintisiz tarih değerleri içermelidir. DAX ile üretilmiş tablo da işaretlenebilir; Yıl sütunu şart değildir.' }
  ]
},
{
  id: 'scd-tip1-tip2', area: 'Model', lesson: 'fabric-yildiz',
  title: 'SCD Tip 1 / SCD Tip 2',
  items: [
    { n: 'SCD Tip 1', d: 'Boyuttaki değer değişince eski değerin üzerine yazılır. Geçmiş satışlar da yeni değerle raporlanır.' },
    { n: 'SCD Tip 2', d: 'Değişince yeni bir satır eklenir (yeni vekil anahtar, geçerlilik başlangıç/bitiş tarihleri). Geçmiş satışlar o tarihteki değerle kalır.' }
  ],
  rule: '“Bugünkü duruma göre geçmişi görmek” isteniyorsa Tip 1. “O gün nasılsa öyle görmek” isteniyorsa Tip 2. Tip 2’de olgu tablosu iş anahtarına değil, vekil anahtara bağlanır.',
  body: 'Bir müşteri İzmir’den Ankara’ya taşındı. Tip 1’de tüm geçmiş satışları Ankara’ya geçer; bölge hedefleri geriye dönük değişir. Tip 2’de taşınmadan önceki satışlar İzmir’de, sonrakiler Ankara’da kalır. Tip 2, “müşteri sayısı” gibi ölçülerde aynı müşterinin iki satırı olduğu için DISTINCTCOUNT’ın iş anahtarı üzerinden yazılmasını gerektirir.',
  quiz: [
    { q: 'Temsilciler bölge değiştiriyor; satış müdürü geçmiş satışların o tarihte hangi bölgeye yazıldıysa orada kalmasını istiyor. Hangisi?', o: ['SCD Tip 2', 'SCD Tip 1', 'Hesaplanmış sütun', 'Artımlı yenileme'], a: 0, why: 'Geçmişi o günkü değerle korumak Tip 2’dir: değişiklikte yeni satır ve geçerlilik tarihleri. Tip 1 geçmişi yeni bölgeye taşır.' },
    { q: 'Tip 2 müşteri boyutunda müşteri sayısı olduğundan fazla çıkıyor. Ne değişmeli?', o: ['Tip 1’e geri dönülmeli', 'İlişki çift yönlü yapılmalı', 'İş anahtarı sayılmalı', 'Geçerlilik tarihleri silinmeli'], a: 2, why: 'Tip 2’de aynı müşteri birden çok satırda yer alır; vekil anahtarı saymak müşteriyi tekrar sayar. Değişmeyen iş anahtarı (MusteriNo) üzerinden say.' }
  ]
},
{
  id: 'veri-turu-bicim', area: 'Model', lesson: 'pq-donusum',
  title: 'Veri türü / biçim',
  items: [
    { n: 'Veri türü', d: 'Değerin ne olduğunu belirler: tam sayı, ondalık, sabit ondalık, tarih, metin… Sıralama, toplama, ilişki ve sıkıştırma buna göre çalışır.' },
    { n: 'Biçim', d: 'Değerin nasıl görüneceğini belirler: binlik ayırıcı, ₺, %, tarih gösterimi. Değeri değiştirmez.' }
  ],
  rule: 'Önce türü doğru ver (mümkünse Power Query’de), sonra biçimi modelde ayarla. Biçimle sorun çözmeye çalışma: “metin olarak saklanmış sayı” biçim değiştirerek sayıya dönmez.',
  body: 'Bir tutarı “Para birimi” biçimine almak onu sayıya çevirmez; tür Metin ise Σ işareti çıkmaz ve toplama yapılamaz. Tersine, ondalık bir sütunu “0 ondalık” biçimle göstermek değeri yuvarlamaz; toplamda küsuratlar yine birikir. Para tutarlarında “Sabit ondalık sayı” türü kayan nokta yuvarlama farklarını önler.',
  quiz: [
    { q: 'Tutar sütunu metin olarak gelmiş. Kullanıcı Biçim → Para birimi seçti ama toplama hâlâ yapılamıyor. Neden?', o: ['Para birimi biçimi hatalı', 'Sütun gizli', 'İlişki eksik', 'Biçim türü değiştirmez'], a: 3, why: 'Biçim yalnızca görünümdür. Türü (tercihen Power Query’de) Ondalık ya da Sabit ondalık sayı yapmak gerekir.' },
    { q: 'Tabloda satırlar tam sayı görünüyor ama toplam satırı 0,01 farkla tutmuyor. En olası açıklama?', o: ['Biçim değeri yuvarlıyor', 'Biçim küsuratı gizliyor', 'Toplam satırı hatalı', 'Sütun türü metin'], a: 1, why: 'Biçim küsuratı gösterimde saklar ama toplama gerçek değerle yapılır. Gerekiyorsa değeri kaynakta ya da Power Query’de yuvarla.' }
  ]
},

/* ---------------- Power Query ---------------- */
{
  id: 'sutun-kaldir-diger', area: 'Power Query', lesson: 'pq-temel',
  title: 'Sütunları kaldır / Diğer sütunları kaldır',
  items: [
    { n: 'Sütunları kaldır', d: 'Seçtiğin sütunları adıyla siler (Table.RemoveColumns). Kaynağa yeni sütun eklenirse o sütun modele de gelir.' },
    { n: 'Diğer sütunları kaldır', d: 'Seçtiğin sütunlar dışındaki her şeyi siler (Table.SelectColumns). Kaynağa eklenen yeni sütunlar kendiliğinden dışarıda kalır.' }
  ],
  rule: 'Modelde hangi sütunların olacağını sen belirle: ihtiyacın olanları seçip “Diğer sütunları kaldır”. Böylece kaynak genişleyince model sessizce büyümez.',
  body: 'İki adım da aynı sonucu verebilir ama kaynak değişince farklı davranır. “Sütunları kaldır” adımı, silinecek sütunun kaynakta artık olmaması durumunda hata da verir. “Diğer sütunları kaldır” ise yalnızca tutulacak sütunlara bağlıdır; kaynakta yeni sütun belirmesi onu etkilemez. İki adım da katlanabilir ve kaynağa SELECT olarak gider.',
  quiz: [
    { q: 'Kaynak tablo sık sık yeni sütunlarla genişliyor ve model her seferinde büyüyor. Hangi adımı kullanmalısın?', o: ['Sütunları kaldır', 'Yinelenen satırları kaldır', 'Diğer sütunları kaldır', 'Sütun türünü değiştir'], a: 2, why: '“Diğer sütunları kaldır” yalnızca seçtiğin sütunları tutar; yeni sütunlar kendiliğinden dışarıda kalır.' },
    { q: 'Kaynakta “Not” sütunu silindi; yenileme “Not sütunu bulunamadı” hatası veriyor. Hangi adım buna yol açmış olabilir?', o: ['Sütunları kaldır (Not)', 'Diğer sütunları kaldır', 'Dizin sütunu ekle', 'Satırları filtrele'], a: 0, why: '“Sütunları kaldır” silinecek sütunu adıyla arar; kaynakta yoksa hata verir. Tutulacak sütunları seçen adım bundan etkilenmez.' }
  ]
},
{
  id: 'harf-duyarliligi', area: 'Power Query', lesson: 'pq-ileri',
  title: 'Power Query harfe duyarlı / model harfe duyarsız',
  items: [
    { n: 'Power Query', d: 'Metin karşılaştırmaları büyük/küçük harfe duyarlıdır: “WEB” ve “Web” farklı değerdir. Yinelenenleri kaldırma, birleştirme ve filtre buna göre çalışır.' },
    { n: 'Model ve DAX', d: 'VertiPaq ve DAX harfe duyarsızdır: “WEB” ve “Web” aynı değer sayılır ve sütunda tek bir değer olarak saklanır.' }
  ],
  rule: 'Anahtar ve kategori sütunlarında harfleri Power Query’de standartlaştır (Biçim → Büyük harf ya da Her Sözcüğün İlk Harfi Büyük), sonra yinelenenleri kaldır.',
  body: 'Tipik belirti: Power Query’de “Yinelenenleri kaldır” uyguladın, ama ilişki kurarken “bir taraf benzersiz olmalı” hatası alıyorsun. Çünkü Power Query “abc01” ve “ABC01”i farklı saydı, model ise aynı saydı. Ters yönde de sürpriz olur: PQ’da harf farkı yüzünden eşleşmeyen birleştirme (Merge) satırları boş kalır.',
  quiz: [
    { q: 'PQ’da müşteri kodlarında yinelenenleri kaldırdın; ilişki kurarken “yinelenen değerler” hatası geliyor. Neden?', o: ['Model harf farkını yok sayıyor', 'İlişki yanlış yönde', 'Yinelenenleri kaldır çalışmadı', 'Tür tam sayı olmalı'], a: 0, why: 'PQ harfe duyarlıdır ve “abc01” ile “ABC01”i ayrı tutar; model ikisini aynı değer sayar ve anahtar benzersiz olmaz. Önce harfleri standartlaştır.' },
    { q: 'Birleştirme (Merge) sonrası satırların bir kısmında eşleşme boş geliyor; iki taraftaki kodlar gözle aynı. Önce neyi kontrol edersin?', o: ['İlişkinin kardinalitesi', 'Kaynakların gizlilik düzeyleri', 'Sorgu bağımlılıkları', 'Harf ve boşluk farkları'], a: 3, why: 'PQ’da birleştirme harfe duyarlıdır; sondaki boşluklar da eşleşmeyi bozar. İki tarafta Kırp ve aynı harf dönüşümünü uygula.' }
  ]
},
{
  id: 'parametre-fonksiyon', area: 'Power Query', lesson: 'pq-model',
  title: 'Parametre / özel fonksiyon',
  items: [
    { n: 'Parametre', d: 'Tek bir değer tutar (sunucu adı, dosya yolu, tarih sınırı). Sorgularda kullanılır, Service’te ayarlardan değiştirilebilir.' },
    { n: 'Özel fonksiyon', d: 'Girdi alıp bir dönüşüm uygulayan yeniden kullanılabilir sorgu. Aynı temizlik adımlarını birçok dosyaya ya da tabloya uygulamak için.' }
  ],
  rule: 'Ortama göre değişen tek bir değer varsa parametre. Aynı adım dizisini birden çok girdiye uygulayacaksan fonksiyon. Fonksiyonun girdisi de parametre olabilir.',
  body: 'Geliştirme ve üretim sunucusu arasındaki fark bir parametredir: sorgu aynı, yalnızca adres değişir. Her ayın Excel dosyasını aynı biçimde temizlemek ise bir fonksiyondur: “Fonksiyon oluştur” ile örnek sorguyu fonksiyona çevirir, sonra Sütun ekle → Özel fonksiyon çağır ile her dosyaya uygularsın. Klasör bağlayıcısının “Birleştir” düğmesi de arka planda tam olarak bunu yapar.',
  quiz: [
    { q: 'Aynı rapor test ve üretim veritabanına yayımlanacak; yalnızca sunucu adı farklı. Ne kullanırsın?', o: ['Özel fonksiyon', 'Başvuru sorgusu', 'Yinelenen sorgu', 'Parametre'], a: 3, why: 'Ortama göre değişen tek değer parametredir; Service’te anlam modeli ayarlarından ya da dağıtım işlem hattı kurallarıyla değiştirilebilir.' },
    { q: '12 şubenin aynı biçimdeki Excel dosyasına aynı 9 temizlik adımı uygulanacak. En bakımlı yol?', o: ['Her şubeye ayrı sorgu', 'Özel fonksiyon', 'Parametre ve tek sorgu', 'DAX hesaplanmış tablo'], a: 1, why: 'Adımlar bir kez fonksiyonda yazılır, her dosyaya çağrılır. Bir adım değişince 12 sorguyu değil tek fonksiyonu güncellersin.' }
  ]
},
{
  id: 'null-bos-metin', area: 'Power Query', lesson: 'pq-donusum',
  title: 'null / boş metin ("")',
  items: [
    { n: 'null', d: 'Değer yok. Modelde BLANK olur; COUNTBLANK sayar, filtrede “(Boş)” olarak görünür. Aşağı doldur (Fill down) yalnızca null’ları doldurur.' },
    { n: 'Boş metin ("")', d: 'Uzunluğu sıfır olan gerçek bir metin değeri. Modelde de boş görünür ama BLANK sayılmayabilir; Aşağı doldur ona dokunmaz.' }
  ],
  rule: 'Metin sütunlarında boş hücreleri tek bir biçime getir: Değerleri değiştir ile "" → null. Ardından aşağı doldurma, boşları sayma ve filtreleme tutarlı çalışır.',
  body: 'Excel’den gelen tablolarda bir hücre gerçekten boş (null), komşusu ise formülden gelen boş metin olabilir. Ekranda ikisi aynı görünür. Sonuç: “Aşağı doldur” bazı satırları doldurur bazılarını atlar, “Boş olmayanları say” beklenenden fazla çıkar. Sütun kalitesi şeridi null’u “Boş” olarak gösterir; "" değerini geçerli sayar.',
  quiz: [
    { q: 'Aşağı doldur bazı boş hücreleri doldurdu, bazılarını atladı. En olası neden?', o: ['Hücreler boş metin', 'Sütun türü ondalık sayı', 'Sorgu katlaması bozuk', 'Sütun modelde gizli'], a: 0, why: 'Aşağı doldur yalnızca null değerleri doldurur. Önce "" değerlerini null ile değiştir, sonra doldur.' },
    { q: 'Sütun kalitesi “Boş %0” diyor ama tabloda birçok hücre boş görünüyor. Ne olabilir?', o: ['Profil tüm veriye bakıyor', 'Boş metin değerleri var', 'Sütunda hata değerleri var', 'Sütun türü tarih olarak ayarlı'], a: 1, why: 'Sütun kalitesi yalnızca null’u boş sayar; boş metin geçerli bir değer gibi görünür. Değerleri değiştir ile "" → null yap.' }
  ]
},
{
  id: 'gizlilik-duzeyleri', area: 'Power Query', lesson: 'pq-model',
  title: 'Gizlilik düzeyi: Özel / Kuruluş / Genel',
  items: [
    { n: 'Özel (Private)', d: 'Hassas ya da gizli veri. Başka bir kaynağa gönderilmez; başka kaynakla birleştirilirken katlama engellenir.' },
    { n: 'Kuruluş (Organizational)', d: 'Kurum içi veri. Diğer Kuruluş kaynaklarıyla birleştirilebilir; Genel kaynaklara gönderilmez.' },
    { n: 'Genel (Public)', d: 'Herkese açık veri (ör. açık döviz kuru servisi). Diğer kaynaklara gönderilmesinde sakınca yoktur.' }
  ],
  rule: 'Her kaynağa gerçeği yansıtan düzeyi ver. “Formula.Firewall” hatasını gizlilik düzeylerini yok sayarak değil, sorguyu yeniden düzenleyerek ya da düzeyleri doğru ayarlayarak çöz. Service’te de aynı düzeyler kullanılır.',
  body: 'Gizlilik düzeyleri, Power Query birleştirme yaparken bir kaynaktan aldığı değeri (ör. bir filtre listesi) başka bir kaynağa sorgu içinde göndermesini kontrol eder. Özel bir Excel dosyasındaki müşteri listesiyle Genel bir web servisini birleştirirsen, motor müşteri adlarını web servisine göndermemek için katlamayı durdurur ve veriyi yerelde işler. “Gizlilik düzeylerini yoksay” Desktop’ta hızlı çözüm gibi görünür ama Service’te aynı sorgu farklı davranabilir.',
  quiz: [
    { q: 'İK’nın maaş Excel’i ile herkese açık bir enflasyon servisini birleştiriyorsun. Maaş dosyasına hangi düzeyi verirsin?', o: ['Genel', 'Kuruluş', 'Özel', 'Hiçbir düzey vermem'], a: 2, why: 'Maaş verisi hassastır; Özel düzeyi bu değerlerin başka bir kaynağa sorgu içinde gönderilmesini engeller.' },
    { q: 'İki kurum içi SQL veritabanını birleştirirken katlama gereksiz yere duruyor; biri Özel, diğeri Kuruluş işaretli. Doğru çözüm?', o: ['Gizlilik düzeylerini yoksay', 'İkisini de Kuruluş yap', 'İkisini de Genel yap', 'Birleştirmeyi DAX’a taşı'], a: 1, why: 'İkisi de kurum içi veridir; aynı Kuruluş düzeyi aralarında veri akışına izin verir. Genel yanlış bir beyan olur, yoksaymak Service’te risk taşır.' }
  ]
},
{
  id: 'dataflow-gen1-gen2', area: 'Power Query', lesson: 'veri-akislari',
  title: 'Veri akışı Gen1 / Gen2',
  items: [
    { n: 'Gen1 (Power BI veri akışı)', d: 'Power BI çalışma alanında yaşar; sonuç veri akışının kendi depolamasında (ya da bağlanan Azure Data Lake hesabında) tutulur. Raporlar ve modeller veri akışı bağlayıcısıyla okur.' },
    { n: 'Gen2 (Fabric veri akışı)', d: 'Fabric kapasitesinde çalışır; sonucu bir hedefe (lakehouse, ambar, SQL veritabanı…) yazar. İşlem hattına eklenebilir, hazırlama (staging) ile büyük veride ölçeklenir.' }
  ],
  rule: 'Fabric kullanıyorsan yeni işler için Gen2: veri bir lakehouse ya da ambara yazılır ve başka araçlar (SQL, not defteri, Direct Lake) da kullanabilir. Fabric yoksa ya da yalnızca Power BI modellerini besleyeceksen Gen1 hâlâ iş görür.',
  body: 'İkisi de aynı Power Query arayüzünü kullanır; fark, sonucun nereye gittiği ve kimin kullanabildiğidir. Gen1’in çıktısı esasen Power BI içindir. Gen2’nin çıktısı OneLake’te standart Delta tablosudur: Direct Lake modeli doğrudan okuyabilir, veri mühendisi SQL ile sorgulayabilir. Gen1’den Gen2’ye taşırken sorgular dışa aktarılıp (şablon) yeni veri akışına alınabilir.',
  quiz: [
    { q: 'Temizlenen satış verisi hem Direct Lake modeline hem de veri bilimcinin not defterine gidecek. Hangisi?', o: ['Gen1 ve yerleşik depolaması', 'Desktop’ta Power Query', 'DAX hesaplanmış tablo', 'Gen2 ve lakehouse hedefi'], a: 3, why: 'Gen2 sonucu lakehouse’a Delta tablosu olarak yazar; Direct Lake ve not defterleri aynı tabloyu okur. Gen1 çıktısı esasen Power BI içindir.' },
    { q: 'Şirkette Fabric kapasitesi yok; üç Power BI modeli aynı müşteri temizliğini paylaşmak istiyor. Ne önerirsin?', o: ['Veri akışı Gen1', 'Veri akışı Gen2', 'Her modelde kopya sorgu', 'Eventhouse'], a: 0, why: 'Gen2 Fabric kapasitesi ister. Gen1, Pro çalışma alanında da temizliği bir kez yapıp birden çok modele sunar; kopya sorgulardan çok daha bakımlıdır.' }
  ]
},

/* ---------------- Rapor ---------------- */
{
  id: 'yerimi-detay-ipucu', area: 'Rapor', lesson: 'hikaye',
  title: 'Yer işareti / detaylandırma sayfası / araç ipucu sayfası',
  items: [
    { n: 'Yer işareti', d: 'Sayfanın bir durumunu (görünür görseller, filtreler, seçimler) kaydeder. Düğmeyle durumlar arasında geçiş ve hikâye anlatımı için.' },
    { n: 'Detaylandırma sayfası', d: 'Bir değere sağ tıklayınca (ya da düğmeyle) o değere süzülmüş ayrı bir ayrıntı sayfası açılır. Bağlam taşınır.' },
    { n: 'Araç ipucu sayfası', d: 'Fareyle üzerine gelince küçük bir sayfa açılır; tıklama gerekmez, sayfa değişmez. Hızlı bakış için.' }
  ],
  rule: 'Aynı sayfada görünüm değiştir: yer işareti. Bir değerin ayrıntısına git ve orada çalış: detaylandırma. Ayrıntıya yalnızca göz at, ana sayfadan ayrılma: araç ipucu sayfası.',
  body: 'Üçü de “ayrıntı göster” der ama kullanıcının akışı farklıdır. Araç ipucu dokunmatik ekranda zayıftır; mobil kullanıcıların çoğunlukta olduğu raporda detaylandırma düğmesi daha güvenilirdir. Yer işareti filtre durumunu da kaydedebilir; kullanıcının kendi seçimini ezmemesi için “Veri” seçeneğini bilerek ayarla.',
  quiz: [
    { q: 'Kullanıcı ürün grafiğinde bir ürünün üzerine gelince, sayfadan ayrılmadan o ürünün aylık eğilimini görmek istiyor. Hangisi?', o: ['Yer işareti', 'Detaylandırma sayfası', 'Alt düzeye inme', 'Araç ipucu sayfası'], a: 3, why: 'Üzerine gelince açılan, sayfayı değiştirmeyen küçük ayrıntı araç ipucu sayfasıdır. Detaylandırma ayrı sayfaya götürür; yer işareti değerden bağımsız bir durum kaydıdır.' },
    { q: 'Müşteri tablosunda bir müşteri seçilince o müşterinin tüm siparişleri, talepleri ve iletişim bilgileri ayrı bir sayfada açılmalı. Hangisi?', o: ['Detaylandırma sayfası', 'Rapor sayfası araç ipucu', 'Yer işareti gezgini', 'Sayfa gezgini'], a: 0, why: 'Bir değerin bağlamını ayrı ve dolu bir sayfaya taşımak detaylandırmadır. Araç ipucu bu kadar içerik için küçük kalır.' }
  ]
},
{
  id: 'esitleme-tum-sayfa', area: 'Rapor', lesson: 'filtreler',
  title: 'Eşitlenmiş dilimleyici / tüm sayfalardaki filtre',
  items: [
    { n: 'Eşitlenmiş dilimleyici', d: 'Görünüm → Dilimleyicileri eşitle ile aynı dilimleyici seçili sayfalarda birlikte çalışır; her sayfada görünür ya da gizli olabilir. Kullanıcı seçimi sayfalar arasında taşır.' },
    { n: 'Tüm sayfalardaki filtreler', d: 'Filtreler bölmesindeki rapor düzeyi filtre. Raporun tamamına uygulanır; kullanıcı açıksa bölmeden değiştirebilir, yazar kilitleyebilir ya da gizleyebilir.' }
  ],
  rule: 'Kullanıcının sık değiştirdiği ve görünür bir kontrol isteyen seçim: eşitlenmiş dilimleyici. Raporun kapsamını belirleyen, nadiren değişen ya da sabit kalması gereken koşul: tüm sayfalardaki filtre (gerekirse kilitli).',
  body: 'Yıl seçimi kullanıcı için ana kontroldür ve her sayfada aynı kalmalıdır: eşitlenmiş dilimleyici. “İptal edilen siparişler hariç” ise raporun tanımıdır; rapor düzeyi kilitli filtre olarak durur. Eşitleme grubu (Gelişmiş seçenekler) ile farklı görünümlü iki dilimleyici aynı seçimi paylaşabilir.',
  quiz: [
    { q: 'Kullanıcı ilk sayfada 2024’ü seçiyor, ikinci sayfaya geçince seçim kayboluyor. En doğru çözüm?', o: ['Her sayfaya yeni dilimleyici', 'Dilimleyicileri eşitle', 'Yer işaretiyle seçimi kaydet', 'Sayfa filtresine 2024 yaz'], a: 1, why: 'Dilimleyicileri eşitle, seçimi sayfalar arasında taşır. Sayfa filtresine sabit yıl yazmak kullanıcıdan kontrolü alır.' },
    { q: 'Rapor yalnızca Türkiye satışlarını göstermeli ve kullanıcı bunu değiştirememeli. Ne yaparsın?', o: ['Tüm sayfalarda kilitli filtre', 'Eşitlenmiş gizli dilimleyici', 'Her görsele görsel filtresi', 'Yer işaretiyle varsayılan görünüm'], a: 0, why: 'Raporun kapsamı rapor düzeyinde bir kez tanımlanır ve kilitlenir. Görsel düzeyinde tek tek filtre bakım yükü yaratır; yer işareti kullanıcı seçimiyle bozulabilir. Bu bir güvenlik değildir; veri gerçekten gizliyse RLS gerekir.' }
  ]
},
{
  id: 'vurgulama-filtreleme', area: 'Rapor', lesson: 'etkilesim',
  title: 'Çapraz vurgulama / çapraz filtreleme',
  items: [
    { n: 'Çapraz vurgulama', d: 'Tıklanan değerin payı diğer görselde koyu, geri kalan soluk gösterilir. Bütün içindeki payı görmek için.' },
    { n: 'Çapraz filtreleme', d: 'Diğer görsel yalnızca tıklanan değere süzülür; ölçekler yeniden ayarlanır. Seçimin kendi dağılımını görmek için.' }
  ],
  rule: 'Seçimin bütün içindeki payı önemliyse vurgulama, seçimin kendi iç yapısı önemliyse filtreleme. Çizgi grafikler ve kartlar vurgulama desteklemez; her zaman filtrelenir.',
  body: 'Kanal sütun grafiğinde Web’e tıklandığında kategori grafiği vurgulama modunda “Web her kategoride ne kadar yer tutuyor?” sorusunu cevaplar. Filtreleme modunda ise “Web’de kategori sıralaması nasıl?” sorusunu cevaplar; çünkü eksen Web’in değerlerine göre yeniden ölçeklenir. Biçim → Etkileşimleri düzenle ile her görsel çifti için ayrı ayarlanır.',
  quiz: [
    { q: 'Yönetici bir şehre tıklayınca kategori grafiğinde o şehrin her kategorideki payını, toplam çubuğun içinde görmek istiyor. Hangisi?', o: ['Çapraz filtreleme', 'Etkileşim yok', 'Çapraz vurgulama', 'Detaylandırma'], a: 2, why: 'Vurgulama tüm çubuğu soluk bırakıp seçili payı koyu gösterir; bütün içindeki pay okunur.' },
    { q: 'Kullanıcılar küçük bir kanala tıklayınca diğer grafikteki çubukların neredeyse görünmediğinden şikâyetçi. Ne değiştirirsin?', o: ['Görseli daha büyük yap', 'Çubuk rengini koyulaştır', 'Etkileşimi tamamen kapat', 'Filtrelemeye geç'], a: 3, why: 'Vurgulamada küçük kanalın payı tüm ölçeğe göre ince kalır. Filtreleme ekseni seçime göre yeniden ölçekler ve dağılım okunur hâle gelir.' }
  ]
},
{
  id: 'sayfalandirilmis-rapor', area: 'Rapor', lesson: 'sayfalandirilmis',
  title: 'Power BI raporu / sayfalandırılmış rapor',
  items: [
    { n: 'Power BI raporu (.pbix)', d: 'Etkileşimli keşif: dilimleyici, çapraz filtre, detaya inme. Ekrana sığan özet görseller için.' },
    { n: 'Sayfalandırılmış rapor (.rdl)', d: 'Yazdırmaya ve dışa aktarmaya hazır, piksel hassasiyetli belge. Uzun tablolar birden çok sayfaya akar; fatura, ekstre ve resmî rapor için.' }
  ],
  rule: 'Kullanıcı analiz edip soru soracaksa Power BI raporu. Belge çıktısı (PDF, Excel), sabit düzen ve binlerce satır gerekiyorsa sayfalandırılmış rapor. İkisi aynı anlam modelini kullanabilir.',
  body: 'Power BI raporundaki tablo görseli kaydırma çubuğuyla çalışır; PDF’e aktarınca yalnızca ekranda görünen satırlar çıkar. Sayfalandırılmış rapor ise tüm satırları sayfalara böler, her sayfada başlık ve sayfa numarası basar. Power BI Report Builder ile tasarlanır; artık Service’te web üzerinden basit sayfalandırılmış rapor oluşturmak da mümkün.',
  quiz: [
    { q: 'Muhasebe her ay sonunda 3.000 satırlık müşteri ekstresini PDF olarak arşivliyor. Hangisi?', o: ['Sayfalandırılmış rapor', 'Power BI raporu ve tablo', 'Pano (dashboard)', 'Excel’de analiz et'], a: 0, why: 'Uzun, çok sayfalı, yazdırılabilir belge sayfalandırılmış raporun işidir. Power BI tablo görseli PDF’e yalnızca görünen satırları aktarır.' },
    { q: 'Bölge müdürleri kategori ve kanal kırılımında “neden düştü?” sorusunu kendileri araştırmak istiyor. Hangisi?', o: ['Sayfalandırılmış rapor', 'Power BI raporu', 'PDF aboneliği', 'CSV dışa aktarma'], a: 1, why: 'Etkileşimli keşif (dilimleyici, detaya inme, çapraz filtre) Power BI raporunun gücüdür. Sayfalandırılmış rapor sabit çıktıya odaklanır.' }
  ]
},
{
  id: 'etkileyen-ayristirma', area: 'Rapor', lesson: 'ayristirma-etkileyen',
  title: 'Anahtar etkileyiciler / ayrıştırma ağacı',
  items: [
    { n: 'Anahtar etkileyiciler', d: 'Bir sonucu (ör. iade, düşük memnuniyet) en çok hangi faktörlerin artırdığını istatistiksel olarak sıralar. “Neden?” sorusuna aday cevaplar.' },
    { n: 'Ayrıştırma ağacı', d: 'Bir ölçüyü boyutlara göre adım adım parçalar; kullanıcı her düzeyde hangi alana bölüneceğini seçer (ya da en yüksek/en düşük değeri yapay zekâ seçer). “Nerede?” sorusuna yol.' }
  ],
  rule: '“Hangi faktörler sonucu etkiliyor?” sorusu: anahtar etkileyiciler. “Bu toplam nereden geliyor, hangi dala inersem büyüğü bulurum?” sorusu: ayrıştırma ağacı. İkisi de bir başlangıçtır; bulguyu ölçü ve iş bilgisiyle doğrula.',
  body: 'Anahtar etkileyiciler korelasyon gösterir, nedensellik değil: “Premium segmentte iade 1,8 kat fazla” bulgusu, ürün karmasından kaynaklanıyor olabilir. Ayrıştırma ağacı ise yalnızca toplamı böler; istatistik yapmaz ama yolu herkesin görebileceği şekilde açar. Toplantıda canlı keşif için ağaç, analist çalışması için etkileyenler daha uygundur.',
  quiz: [
    { q: 'Destek müdürü “düşük memnuniyeti en çok hangi faktörler artırıyor: kanal mı, konu mu, öncelik mi?” diye soruyor. Hangi görsel?', o: ['Ayrıştırma ağacı', 'Anomali algılamalı çizgi', 'Anahtar etkileyiciler', 'Şelale grafiği'], a: 2, why: 'Bir sonucu etkileyen faktörleri sıralamak anahtar etkileyicilerin işidir. Ayrıştırma ağacı toplamı parçalar ama faktörleri istatistiksel olarak karşılaştırmaz.' },
    { q: 'Toplantıda CFO, giderin hangi departman → gider türü → aydan geldiğini canlı olarak adım adım açmak istiyor. Hangisi?', o: ['Anahtar etkileyiciler', 'Ayrıştırma ağacı', 'Dağılım grafiği', 'Anomali algılama'], a: 1, why: 'Toplamı kullanıcının seçtiği sırayla dallara bölmek ayrıştırma ağacıdır; her adım ekranda görünür ve geri alınabilir.' }
  ]
},

/* ---------------- Hizmet ---------------- */
{
  id: 'lisans-kapasite', area: 'Service', lesson: 'bi-yonetimi',
  title: 'Pro / Premium kullanıcı başına (PPU) / Fabric kapasitesi',
  items: [
    { n: 'Pro', d: 'Kullanıcı başına lisans. Paylaşılan kapasitede içerik yayımlar ve paylaşır; içeriği görüntüleyenlerin de Pro’su olmalı.' },
    { n: 'PPU', d: 'Kullanıcı başına Premium özellikleri: daha büyük modeller, daha sık yenileme, XMLA uç noktası, dağıtım işlem hatları. PPU çalışma alanındaki içeriği görüntüleyenin de PPU’su olmalı.' },
    { n: 'Fabric kapasitesi (F SKU)', d: 'Kuruluşun satın aldığı işlem gücü. Fabric öğelerini (lakehouse, ambar, Gen2 veri akışı) çalıştırır. F64 ve üzerinde ücretsiz lisanslı kullanıcılar da Power BI içeriğini görüntüleyebilir.' }
  ],
  rule: 'Az sayıda içerik üreten ve tüketen kullanıcı: Pro. Az kullanıcı ama Premium özellik ihtiyacı: PPU. Çok sayıda yalnızca okuyan kullanıcı ya da Fabric iş yükleri: kapasite (görüntüleyicilerin lisanssız erişimi için F64+). İçerik üretenler kapasitede de Pro/PPU ister.',
  body: 'Karar genelde iki soruya iner: kaç kişi yalnızca okuyacak ve Premium/Fabric özelliği gerekiyor mu? 30 kişilik bir ekip için Pro yeterlidir. 2.000 kişilik bir sahaya rapor dağıtılacaksa her birine Pro almak yerine F64 kapasite ekonomik hâle gelir. Küçük F SKU’lar (F2–F32) Fabric öğelerini çalıştırır ama görüntüleyicilerin yine Pro’su olmalıdır.',
  quiz: [
    { q: '1.500 saha çalışanı yalnızca rapor okuyacak; 10 analist rapor geliştiriyor. En uygun yapı?', o: ['Herkese Pro', 'Herkese PPU', 'F64+ kapasite, analistlere Pro', 'F2 kapasite, kimseye lisans yok'], a: 2, why: 'F64 ve üzeri kapasitede ücretsiz lisanslı kullanıcılar içeriği görüntüleyebilir; içerik üreten analistler Pro (ya da PPU) ister. F2’de görüntüleyicilerin de Pro’su gerekir.' },
    { q: '8 kişilik ekip 20 GB’lık bir model ve dağıtım işlem hattı istiyor; kapasite bütçesi yok. Hangisi?', o: ['PPU', 'Pro', 'Ücretsiz lisans', 'Yerel rapor sunucusu'], a: 0, why: 'Büyük model ve işlem hattı Premium özellikleridir; kapasite olmadan bunları kullanıcı başına PPU sağlar. Pro’da model boyutu sınırı daha düşüktür.' }
  ]
},
{
  id: 'lakehouse-warehouse-eventhouse', area: 'Service', lesson: 'fabric-giris',
  title: 'Lakehouse / Ambar (Warehouse) / Eventhouse (KQL)',
  items: [
    { n: 'Lakehouse', d: 'Dosya ve Delta tabloları bir arada. Spark not defterleri ve veri akışlarıyla yazılır; SQL analiz uç noktası tabloları salt okunur T-SQL ile sunar.' },
    { n: 'Ambar (Warehouse)', d: 'Tam T-SQL veri ambarı: INSERT/UPDATE/DELETE, saklı yordamlar, çok tablolu işlemler. SQL ekipleri ve klasik ETL için.' },
    { n: 'Eventhouse (KQL veritabanı)', d: 'Akan ve zaman damgalı veri (log, IoT, tıklama) için. KQL ile saniyeler içinde büyük hacimde sorgu; gerçek zamanlı panolar.' }
  ],
  rule: 'Ekip Spark/Python ile çalışıyor ya da ham dosyalar da tutulacaksa lakehouse. Ekip T-SQL ile yazıyor ve işlem bütünlüğü gerekiyorsa ambar. Veri sürekli akıyor ve dakikalar içinde sorgulanmalıysa Eventhouse. Üçü de veriyi OneLake’te saklar.',
  body: 'Seçim çoğu zaman teknolojiden çok ekibin becerisine dayanır. Aynı satış verisi lakehouse’ta da ambarda da Delta tablosu olarak durur ve Direct Lake modeli ikisinden de okuyabilir. Fark, veriyi kimin ve nasıl yazacağıdır. Web tıklama akışı ise saniyede binlerce olayla gelir; bunu toplu ETL ile değil Eventstream → Eventhouse ile alırsın.',
  quiz: [
    { q: 'Veri ekibi yalnızca T-SQL biliyor; günlük ETL’de birden çok tabloyu tek işlemde güncellemeleri gerekiyor. Hangisi?', o: ['Ambar', 'Lakehouse', 'Eventhouse', 'Veri akışı Gen1'], a: 0, why: 'Ambar tam T-SQL yazma ve çok tablolu işlem destekler. Lakehouse’un SQL uç noktası salt okunurdur; yazma Spark ya da veri akışıyla yapılır.' },
    { q: 'Mağaza sensörlerinden saniyede binlerce ölçüm geliyor; vardiya müdürü son 5 dakikayı görmek istiyor. Hangisi?', o: ['Ambar', 'Lakehouse', 'Eventhouse', 'Paylaşılan Excel'], a: 2, why: 'Akan, zaman damgalı veriyi neredeyse anında sorgulamak Eventhouse ve KQL’in işidir; gerçek zamanlı panolarla doğrudan çalışır.' }
  ]
},
{
  id: 'yenileme-turleri', area: 'Service', lesson: 'yayinlama',
  title: 'Zamanlanmış yenileme / otomatik sayfa yenileme',
  items: [
    { n: 'Zamanlanmış yenileme', d: 'İçeri aktarma (Import) modelinin verisini belirli saatlerde kaynaktan yeniden yükler. Pro’da günde 8, Premium/Fabric kapasitede 48 zamana kadar.' },
    { n: 'Otomatik sayfa yenileme', d: 'Açık rapor sayfasındaki görselleri belirli aralıklarla yeniden sorgular. Yalnızca DirectQuery (ve benzeri) kaynaklarda anlamlıdır; Import verisini değiştirmez.' }
  ],
  rule: 'Veri saatte bir değişiyor ve Import yeterli: zamanlanmış yenileme. Ekrandaki sayı dakikalar içinde güncellenmeli ve kaynak DirectQuery: otomatik sayfa yenileme (aralığı kapasite yöneticisinin izin verdiği alt sınıra göre). Gerçek zamanlı akış için Eventhouse ve gerçek zamanlı panolar.',
  body: 'Sık karıştırılan nokta: Import modelinde otomatik sayfa yenilemeyi açmak yeni veri getirmez; görseller aynı bellekteki veriyi yeniden okur. Tersine, DirectQuery modelinde zamanlanmış veri yenilemesi yoktur; her sorgu zaten kaynağa gider (yalnızca önbellek yenilenir). Otomatik sayfa yenilemenin kısa aralıkları kaynak sistemi yorar; aralığı iş ihtiyacına göre seç.',
  quiz: [
    { q: 'Import modelindeki rapora 1 dakikalık otomatik sayfa yenileme eklendi ama sayılar değişmiyor. Neden?', o: ['Aralık çok kısa seçilmiş', 'Görsel sayısı çok fazla', 'Model verisi yenilenmedi', 'Ağ geçidi kapalı'], a: 2, why: 'Otomatik sayfa yenileme yalnızca görselleri yeniden sorgular; Import modelinin verisi ancak model yenilenince değişir.' },
    { q: 'Satış verisi gece bir kez güncelleniyor; rapor sabah hazır olmalı. Ne kurarsın?', o: ['Otomatik sayfa yenileme', 'DirectQuery', 'Gerçek zamanlı pano', 'Zamanlanmış yenileme'], a: 3, why: 'Günlük güncellenen kaynak için Import + sabah erken saatte zamanlanmış yenileme en basit ve en hızlı çözümdür.' }
  ]
},
{
  id: 'ag-gecidi-modlari', area: 'Service', lesson: 'veri-baglantilari',
  title: 'Ağ geçidi: standart mod / kişisel mod',
  items: [
    { n: 'Standart mod (şirket içi veri ağ geçidi)', d: 'Sunucuya kurulur, birçok kullanıcı ve veri kaynağıyla paylaşılır. Zamanlanmış yenileme, DirectQuery ve canlı bağlantı destekler; Fabric veri akışları ve işlem hatları da kullanır. Kümelenerek yüksek erişilebilirlik sağlar.' },
    { n: 'Kişisel mod', d: 'Bir kullanıcının bilgisayarına kurulur ve yalnızca onun için çalışır. Yalnızca Power BI Import yenilemesi; DirectQuery ve paylaşım yok. Bilgisayar kapanınca yenileme durur.' }
  ],
  rule: 'Üretimdeki her şey için standart mod, bir sunucuda ve bir yönetici ekiple. Kişisel modu yalnızca bireysel denemeler için kullan; ekip raporunun yenilemesi birinin dizüstü bilgisayarına bağlı olmamalı.',
  body: 'Kişisel mod hızlı kurulur ve bu yüzden cazip görünür. Ancak kurulduğu bilgisayar uyku moduna geçince, kullanıcı şirketten ayrılınca ya da parolasını değiştirince yenileme durur. Standart modda veri kaynakları ağ geçidi üzerinde tanımlanır ve kimin kullanabileceği yönetilir; kümelemeyle bir sunucu düşse bile yenileme devam eder.',
  quiz: [
    { q: 'Şirket içindeki SQL Server’a DirectQuery ile bağlı rapor yayımlanacak. Hangisi gerekir?', o: ['Kişisel mod', 'Standart mod', 'Ağ geçidi gerekmez', 'Veri akışı Gen1'], a: 1, why: 'DirectQuery ve canlı bağlantıyı yalnızca standart mod ağ geçidi destekler. Kişisel mod yalnızca Import yenilemesi yapar.' },
    { q: 'Ekibin ana raporu her pazartesi yenilenmiyor; ağ geçidi bir analistin dizüstü bilgisayarında kişisel modda. Kalıcı çözüm?', o: ['Standart mod kurmak', 'Bilgisayarı açık bırakmak', 'Yenilemeyi elle yapmak', 'Raporu yeniden yayımlamak'], a: 0, why: 'Yenileme tek bir kişinin cihazına bağlı olmamalı. Sunucuya kurulan, yönetilen ve gerekirse kümelenen standart mod ağ geçidi sorunu kökünden çözer.' }
  ]
},
{
  id: 'pipeline-git', area: 'Service', lesson: 'yasam-dongusu',
  title: 'Dağıtım işlem hattı / Git tümleştirmesi',
  items: [
    { n: 'Dağıtım işlem hattı', d: 'İçeriği Geliştirme → Test → Üretim gibi aşamalar (çalışma alanları) arasında taşır; aşamalar arası farkı gösterir, dağıtım kurallarıyla bağlantı ve parametreleri değiştirir.' },
    { n: 'Git tümleştirmesi', d: 'Çalışma alanını Azure DevOps ya da GitHub’daki bir dala bağlar. Her değişiklik kod (PBIP/TMDL) olarak kaydedilir; sürüm geçmişi, dallanma ve kod incelemesi sağlar.' }
  ],
  rule: 'Ortamlar arası yayın için işlem hattı, değişiklik geçmişi ve ekip çalışması için Git. Olgun ekiplerde ikisi birlikte: Geliştirme çalışma alanı Git’e bağlı, Test ve Üretim’e işlem hattıyla taşınır.',
  body: 'İşlem hattı “ne zaman ve nereye yayımlanacak?” sorusunu, Git ise “kim neyi ne zaman değiştirdi ve geri alabilir miyim?” sorusunu cevaplar. Git tek başına üretime dağıtım yapmaz; işlem hattı da tek başına satır satır değişiklik geçmişi tutmaz. Desktop tarafında PBIP biçimi, modeli ve raporu metin dosyaları olarak sakladığı için Git ile birleştirmeyi mümkün kılar.',
  quiz: [
    { q: 'Üç geliştirici aynı modelde çalışıyor; kimin hangi ölçüyü değiştirdiğini görmek ve gerektiğinde geri almak istiyorlar. Hangisi?', o: ['Dağıtım işlem hattı', 'Çalışma alanı rolleri', 'Git tümleştirmesi', 'Uygulama sürümleri'], a: 2, why: 'Değişiklik geçmişi, karşılaştırma ve geri alma Git’in işidir. İşlem hattı aşamalar arasında taşır ama satır düzeyinde geçmiş tutmaz.' },
    { q: 'Test’te onaylanan model Üretim’e taşınırken veri kaynağı otomatik olarak üretim sunucusuna dönmeli. Ne kullanırsın?', o: ['Git dalı birleştirme', 'Raporu yeniden yayımlama', 'Kişisel ağ geçidi', 'Dağıtım kuralı'], a: 3, why: 'Dağıtım işlem hattının dağıtım kuralları, aşamaya göre veri kaynağını ve parametreleri değiştirir. Git birleştirmesi ortam ayarı yapmaz.' }
  ]
},
{
  id: 'yayimla-gomme', area: 'Service', lesson: 'embed-api',
  title: 'Web’de yayımla / güvenli gömme / uygulamaya gömme',
  items: [
    { n: 'Web’de yayımla (Publish to web)', d: 'Herkese açık bir bağlantı ve iframe üretir. Oturum açma yok, RLS uygulanmaz; bağlantıyı bulan herkes görür. Yalnızca gerçekten kamuya açık veri için.' },
    { n: 'Güvenli gömme (Embed)', d: 'Raporu SharePoint, Teams ya da bir web sayfasına gömer; görüntüleyen kendi hesabıyla oturum açar, izinler ve RLS uygulanır.' },
    { n: 'Uygulamaya gömme (Power BI Embedded)', d: 'Kendi uygulamanın kullanıcılarına rapor gösterirsin; kimlik doğrulamayı uygulama yapar (uygulamanın verisi), kapasite gerekir.' }
  ],
  rule: 'Kamuya açık veri ve kampanya sayfası: web’de yayımla. Kurum içi kullanıcılar ve portal: güvenli gömme. Müşterilerine kendi ürününde rapor sunan yazılım: Power BI Embedded. Şüphedeysen web’de yayımla seçme.',
  body: 'Web’de yayımlanan bir raporun bağlantısı e-postayla iletilebilir, arama motorlarına düşebilir; geri çekmek için kodu silmen gerekir ve o ana kadar görülen görülmüştür. Bu yüzden birçok kuruluşta yönetici bu özelliği kapatır ya da yalnızca belirli bir gruba açar. Güvenli gömme ise aynı iframe kolaylığını kimlik doğrulamayla sunar.',
  quiz: [
    { q: 'İK, çalışan memnuniyeti panosunu intranet sayfasına koymak istiyor; yalnızca çalışanlar görmeli. Hangisi?', o: ['Web’de yayımla', 'PDF dışa aktarma', 'Herkese açık bağlantı', 'Güvenli gömme'], a: 3, why: 'Güvenli gömmede görüntüleyen kendi kurum hesabıyla oturum açar ve izinler uygulanır. Web’de yayımla herkese açıktır.' },
    { q: 'Bir yazılım şirketi, kendi müşterilerine (Power BI hesabı olmayan) ürün içinde kendi verilerini gösteren rapor sunacak. Hangisi?', o: ['Web’de yayımla', 'Güvenli gömme', 'Power BI Embedded', 'E-posta aboneliği'], a: 2, why: 'Müşteriler Power BI hesabına sahip değil; kimlik doğrulamayı uygulama yapar ve satır filtresi uygulama tarafından verilir. Bu “uygulama verinin sahibi” gömme senaryosudur.' }
  ]
}
);

W.PBI_MISTAKES.push(
/* ---------------- DAX (görevli) ---------------- */
{
  id: 'iptal-dahil-ciro', area: 'DAX', lesson: 'toplama',
  sym: 'Raporun cirosu muhasebenin rakamından yüksek',
  cause: 'Ölçü SUM(Satislar[Tutar]) ile tüm satırları topluyor; iptal edilen siparişler de ciroya dahil oluyor. Muhasebe ise iptalleri dışarıda bırakır.',
  fix: 'İş kuralını ölçüye yaz: `CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal")`. Kuralı paydaşla yazılı netleştir (iadeler dahil mi?) ve ölçü açıklamasına not düş.',
  tags: ['ciro yüksek', 'iptal', 'muhasebe tutmuyor', 'mutabakat', 'durum filtresi', 'net satış'],
  task: { name: 'Muhasebe Cirosu', q: 'Ciro, iptal edilen siparişleri içermemeli (iadeler şimdilik dahil). Bozuk ölçüyü düzelt.', start: 'SUM(Satislar[Tutar])', sol: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal")', hint: 'CALCULATE ile Durum sütununa “İptal değil” koşulu ekle.' }
},
{
  id: 'sifir-ekleme-satir-patlamasi', area: 'DAX', lesson: 'blank-hata',
  sym: 'Tablo, satışı olmayan aylar ve ürünlerle doldu; görsel yavaşladı',
  cause: 'Boşları sıfır göstermek için ölçüye “+ 0” eklendi. Ölçü artık hiçbir satırda BLANK dönmediği için görsel, boyuttaki tüm değerleri (satışı olmayanlar dahil) listeler.',
  fix: '“+ 0”ı kaldır ve BLANK’in görseli kendiliğinden süzmesine izin ver. Sıfır yalnızca bir kartta gerekiyorsa o karta özel bir ölçü yaz ya da “Veri içermeyen öğeleri göster” ayarını bilinçli kullan.',
  tags: ['+ 0', 'sıfır', 'boş satırlar', 'çok satır', 'yavaş görsel', 'blank'],
  task: { name: 'Sade Aylık Satış', q: 'Aylık tabloda yalnızca satışı olan aylar görünmeli; satışsız aylar listeden kendiliğinden düşmeli. Bozuk ölçüyü düzelt.', start: '[Net Satış] + 0', sol: '[Net Satış]', hint: 'Boş değeri sıfıra çeviren kısmı kaldır.', grid: [{ t: 'Tarih', c: 'YilAy' }] }
},
{
  id: 'count-musteri-satir', area: 'DAX', lesson: 'toplama',
  sym: 'Müşteri sayısı, satış satırı sayısına eşit çıkıyor',
  cause: 'COUNT(Satislar[MusteriNo]) dolu hücreleri sayar; aynı müşteri her satırda yeniden sayılır. Sonuç müşteri değil, satış satırı sayısıdır.',
  fix: 'Benzersiz müşteriyi saymak için `DISTINCTCOUNT(Satislar[MusteriNo])` kullan; iptal kuralını da koru.',
  tags: ['müşteri sayısı', 'count', 'distinctcount', 'şişmiş sayı', 'benzersiz'],
  task: { name: 'Aktif Müşteri Adedi', q: 'Ölçü, iptal edilmemiş satırlardaki benzersiz müşteri sayısını vermeli. Bozuk ölçüyü düzelt.', start: 'CALCULATE(COUNT(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")', sol: 'CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")', hint: 'Satırları değil, farklı değerleri sayan fonksiyonu kullan.' }
},
{
  id: 'sply-olgu-tarihi', area: 'DAX', lesson: 'zaman',
  sym: 'Geçen yıl ölçüsü yıl satırlarında boş, kategori satırlarında da olması gerekenden düşük',
  cause: 'Zaman zekâsı fonksiyonuna Tarih tablosunun değil, olgu tablosunun tarih sütunu verilmiş: `SAMEPERIODLASTYEAR(Satislar[Tarih])`. Kaydırılan tarihler Satislar[Tarih] sütununa filtre olur, ama Tarih[Yil] filtresi yerinde kalır; iki filtre kesişmez.',
  fix: 'Zaman zekâsını her zaman işaretli Tarih tablosunun tarih sütunuyla yaz: `SAMEPERIODLASTYEAR(Tarih[Tarih])`.',
  tags: ['geçen yıl', 'sameperiodlastyear', 'olgu tablosu tarihi', 'yıl satırı boş', 'zaman zekâsı'],
  task: { name: 'GY Satış (Takvimden)', q: 'Ölçü her yıl ve kategoride geçen yılın aynı dönemindeki net satışı vermeli. Bozuk ölçüyü düzelt.', start: 'CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Satislar[Tarih]))', sol: 'CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))', hint: 'Fonksiyona olgu tablosunun değil, takvim tablosunun tarih sütununu ver.' }
},
{
  id: 'calculate-olcu-kosulu', area: 'DAX', lesson: 'filter-all',
  sym: '“20.000’i aşan ürünlerin satışı” ölçüsü her yerde boş (ya da CALCULATE True/False hatası)',
  cause: 'İlk denemede `CALCULATE([Net Satış], [Net Satış] > 20000)` hata verir: basit filtre argümanı sütun koşulu olmalıdır. “Düzeltme” olarak `FILTER(Satislar, [Net Satış] > 20000)` yazılınca hata gider ama koşul her SATIŞ SATIRI için değerlendirilir; tek bir satır 20.000’i aşmadığı için sonuç boştur. Koşul yanlış ayrıntı düzeyinde.',
  fix: 'Koşulu hangi düzeyde değerlendireceğini seç ve FILTER ile yaz: `CALCULATE([Net Satış], FILTER(VALUES(Urunler[Urun]), [Net Satış] > 20000))`.',
  tags: ['true/false', 'calculate hata', 'ölçü filtre', 'filter', 'eşik'],
  task: { name: 'Büyük Ürünlerin Satışı', q: 'Ölçü yalnızca ürün bazında net satışı 20.000’den büyük olan ürünlerin toplam satışını vermeli. Bozuk ölçü her yerde boş dönüyor; düzelt.', start: 'CALCULATE([Net Satış], FILTER(Satislar, [Net Satış] > 20000))', sol: 'CALCULATE([Net Satış], FILTER(VALUES(Urunler[Urun]), [Net Satış] > 20000))', hint: 'FILTER satış satırlarında değil, ürün listesinde dönmeli.' }
},
{
  id: 'switch-sira-hatasi', area: 'DAX', lesson: 'var-mantik',
  sym: 'SWITCH(TRUE()) etiketinde “Yüksek” hiç görünmüyor',
  cause: 'SWITCH(TRUE()) koşulları yukarıdan aşağı dener ve ilk doğru olanda durur. Daha geniş koşul (≥ %35) önce yazıldığı için ≥ %38 olan değerler de “Orta” olur.',
  fix: 'Eşikleri en dar olandan en geniş olana doğru sırala: önce ≥ %38 “Yüksek”, sonra ≥ %35 “Orta”, sonra varsayılan.',
  tags: ['switch true', 'sıra', 'koşul sırası', 'etiket', 'eşik', 'yüksek görünmüyor'],
  task: { name: 'Marj Bandı', q: 'Kâr marjı ≥ %38 ise “Yüksek”, ≥ %35 ise “Orta”, değilse “Düşük” yazmalı. Bozuk ölçüyü düzelt.', start: 'SWITCH(TRUE(), [Kâr Marjı %] >= 0.35, "Orta", [Kâr Marjı %] >= 0.38, "Yüksek", "Düşük")', sol: 'SWITCH(TRUE(), [Kâr Marjı %] >= 0.38, "Yüksek", [Kâr Marjı %] >= 0.35, "Orta", "Düşük")', hint: 'İlk doğru koşulda durulduğunu hatırla; en yüksek eşiği öne al.' }
},
{
  id: 'and-or-oncelik', area: 'DAX', lesson: 'var-mantik',
  sym: '“Web ya da Mobil iadeleri” sayısı, Web’deki tüm satırları içeriyor',
  cause: 'DAX’ta && (VE) işleci || (VEYA) işlecinden önce değerlendirilir. `Kanal = "Web" || Kanal = "Mobil" && Durum = "İade"` aslında “Web’in tamamı ya da Mobil iadeleri” demektir.',
  fix: 'VEYA kısmını parantezle grupla: `(Kanal = "Web" || Kanal = "Mobil") && Durum = "İade"`. Daha okunur bir yol: `Satislar[Kanal] IN {"Web", "Mobil"} && …`.',
  tags: ['and or', 'öncelik', 'parantez', '&&', '||', 'yanlış sayım'],
  task: { name: 'Dijital İade Satırları', q: 'Ölçü yalnızca Web ya da Mobil kanalındaki iade satırlarını saymalı. Bozuk ölçüyü düzelt.', start: 'COUNTROWS(FILTER(Satislar, Satislar[Kanal] = "Web" || Satislar[Kanal] = "Mobil" && Satislar[Durum] = "İade"))', sol: 'COUNTROWS(FILTER(Satislar, (Satislar[Kanal] = "Web" || Satislar[Kanal] = "Mobil") && Satislar[Durum] = "İade"))', hint: 'İki kanal koşulunu parantez içine al.' }
},
{
  id: 'gunluk-ortalama-bos-gun', area: 'DAX', lesson: 'iteratorler',
  sym: 'Günlük ortalama satış, “toplam ÷ gün sayısı” hesabından çok yüksek',
  cause: '`AVERAGEX(VALUES(Tarih[Tarih]), [Net Satış])` satışı olmayan günlerde BLANK alır ve bu günleri ortalamadan atar. Sonuç “satış olan günlerin ortalaması” olur, takvim günü ortalaması değil.',
  fix: 'İş tanımı takvim günüyse paydayı açıkça gün sayısı yap: `DIVIDE([Net Satış], COUNTROWS(Tarih))`. Tanımı ölçü adına yaz: “Takvim Günü Başına Satış”.',
  tags: ['günlük ortalama', 'averagex', 'boş gün', 'blank atlanıyor', 'ortalama yüksek'],
  task: { name: 'Takvim Günü Başına Satış', q: 'Ölçü, net satışı dönemdeki TÜM takvim günlerine (satış olmayan günler dahil) bölmeli. Bozuk ölçüyü düzelt.', start: 'AVERAGEX(VALUES(Tarih[Tarih]), [Net Satış])', sol: 'DIVIDE([Net Satış], COUNTROWS(Tarih))', hint: 'Boş günleri atlayan yineleyici yerine toplamı gün sayısına böl.' }
},
{
  id: 'selectedvalue-varsayilansiz', area: 'DAX', lesson: 'siralama',
  sym: 'Top N kartı dilimleyicide seçim yokken boş görünüyor',
  cause: '`SELECTEDVALUE(TopNSecim[N])` seçim yokken (ya da çoklu seçimde) BLANK döner; TOPN’e N olarak BLANK gider ve sonuç boş kalır.',
  fix: 'İkinci argümanla varsayılan ver: `SELECTEDVALUE(TopNSecim[N], 5)`. Dilimleyiciyi de tek seçime ayarla.',
  tags: ['selectedvalue', 'varsayılan', 'top n boş', 'parametre', 'dilimleyici seçimsiz'],
  task: { name: 'İlk N Ürün Toplamı', q: 'Ölçü, dilimleyicide N seçilmemişse ilk 5 ürünün satışını göstermeli. Bozuk ölçüyü düzelt.', start: 'VAR N = SELECTEDVALUE(TopNSecim[N]) RETURN CALCULATE([Net Satış], TOPN(N, ALL(Urunler[Urun]), [Net Satış]))', sol: 'VAR N = SELECTEDVALUE(TopNSecim[N], 5) RETURN CALCULATE([Net Satış], TOPN(N, ALL(Urunler[Urun]), [Net Satış]))', hint: 'SELECTEDVALUE’nun ikinci argümanı seçim olmadığında döner.' }
},
{
  id: 'yuzde-iki-kez', area: 'DAX', lesson: 'dax-giris',
  sym: 'Kâr marjı “%3.647” ya da “3.647%” gibi görünüyor',
  cause: 'Ölçü oranı 100 ile çarpıyor, biçim de Yüzde seçili. Yüzde biçimi zaten 100 ile çarparak gösterir; değer iki kez büyür.',
  fix: 'Ölçü oranı 0–1 arası döndürsün (`DIVIDE(kâr, satış)`), gösterimi biçim dizesi (Yüzde) yapsın. Excel’e aktarılan değer de böylece doğru kalır.',
  tags: ['yüzde', '*100', 'biçim', 'marj çok büyük', 'percent'],
  task: { name: 'Marj Oranı (Ham)', q: 'Ölçü 0 ile 1 arasında bir oran döndürmeli; yüzde görünümü biçim dizesiyle verilecek. Bozuk ölçüyü düzelt.', start: '[Kâr Marjı %] * 100', sol: '[Kâr Marjı %]', hint: 'Gösterim işini biçime bırak; ölçü ham oranı döndürsün.' }
},
{
  id: 'urun-sayisi-her-yil-ayni', area: 'Model', lesson: 'model-temel',
  sym: 'Ürün sayısı her yılda aynı (40); yıl seçimi ölçüyü etkilemiyor',
  cause: 'COUNTROWS(Urunler) boyut tablosunu sayıyor. Tarih filtresi Tarih → Satislar yönünde akar, Satislar’dan Urunler’e akmaz (tek yönlü ilişki). Urunler tablosu yıldan habersizdir.',
  fix: 'Soruyu olgu tablosu üzerinden sor: “o yıl satılan ürün” için `CALCULATE(DISTINCTCOUNT(Satislar[UrunNo]), Satislar[Durum] <> "İptal")`. İlişkiyi çift yönlü yapmak tüm modeli etkiler; gerekmez.',
  tags: ['ürün sayısı aynı', 'filtre akmıyor', 'tek yönlü', 'countrows boyut', 'satılan ürün'],
  task: { name: 'Satılan Ürün Çeşidi', q: 'Ölçü her yıl ve kategoride, iptal edilmemiş satırlarda satılmış farklı ürün sayısını vermeli. Bozuk ölçüyü düzelt.', start: 'COUNTROWS(Urunler)', sol: 'CALCULATE(DISTINCTCOUNT(Satislar[UrunNo]), Satislar[Durum] <> "İptal")', hint: 'Boyut tablosunu değil, olgu tablosundaki ürün numaralarını benzersiz say.' }
},
{
  id: 'yil-metin-karsilastirma', area: 'DAX', lesson: 'blank-hata',
  sym: 'Hata: metin ile sayı karşılaştırılamaz (Tarih[Yil] = "2024")',
  cause: 'Yil sütunu tam sayıdır ama koşulda tırnak içinde metin olarak yazılmış. DAX karşılaştırmada tam sayı ile metni kendiliğinden eşlemez.',
  fix: 'Sayıyı tırnaksız yaz: `Tarih[Yil] = 2024`. Değer bir dilimleyiciden ya da metin ölçüsünden geliyorsa VALUE() ile çevir.',
  tags: ['metin sayı', 'tür uyumsuz', 'karşılaştırma hatası', 'tırnak', 'yil']
},

/* ---------------- DAX / Model (görevsiz) ---------------- */
{
  id: 'hesap-sutun-sum-toplam', area: 'DAX', lesson: 'baglam',
  sym: 'Hesaplanmış sütunda her satırda aynı sayı (tablonun genel toplamı) görünüyor',
  cause: 'Urunler tablosuna `= SUM(Satislar[Tutar])` yazıldı. Hesaplanmış sütunda yalnızca satır bağlamı vardır; SUM satır bağlamını filtreye çevirmez ve her satırda tüm satışları toplar.',
  fix: 'Bağlam geçişi için CALCULATE ile sar: `= CALCULATE(SUM(Satislar[Tutar]))` ya da bir ölçü çağır: `= [Toplam Satış]`. Değer rapor anında değişmeyecekse sütun uygundur; değişecekse ölçü yaz.',
  tags: ['hesaplanmış sütun', 'aynı değer', 'sum', 'satır bağlamı', 'calculate', 'bağlam geçişi']
},
{
  id: 'mali-yil-ytd', area: 'DAX', lesson: 'zaman',
  sym: 'Mali yıl Temmuz’da başlıyor ama YTD her Ocak’ta sıfırlanıyor',
  cause: 'TOTALYTD/DATESYTD varsayılan olarak yıl sonunu 31 Aralık kabul eder. Mali yıl sonu belirtilmediği için takvim yılına göre toplanır.',
  fix: 'Yıl sonu argümanını ver: `CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6-30"))` (yıl sonu 30 Haziran; TOTALYTD’de de aynı argüman var). Tarih tablosuna MaliYil ve MaliAyNo sütunlarını ekle ki eksen ve sıralama da mali yıla uysun.',
  tags: ['mali yıl', 'fiscal year', 'ytd', 'totalytd', 'yıl sonu', 'temmuz']
},
{
  id: 'format-metin-siralama', area: 'DAX', lesson: 'kosullu-bicim',
  sym: 'Ölçü grafikte çizilmiyor, tabloda sayılar yanlış sıralanıyor',
  cause: 'Ölçü `FORMAT([Net Satış], "#,0 ₺")` ile metne çevrilmiş. Grafik metin değeri eksene koyamaz; tablo da metni karakter karakter sıralar (“9” > “1”).',
  fix: 'Ölçü sayı döndürsün; görünümü biçim dizesi ya da dinamik biçim dizesi versin. Metin gerekiyorsa (başlık, etiket) ayrı bir metin ölçüsü yaz.',
  tags: ['format', 'metin', 'sıralama yanlış', 'grafik boş', 'biçim dizesi'],
  task: { name: 'Sayısal Net Satış', q: 'Ölçü grafikte çizilebilmeli ve tabloda sayısal sıralanmalı; ₺ gösterimi biçim dizesiyle verilecek. Bozuk ölçüyü düzelt.', start: 'FORMAT([Net Satış], "#,0 ₺")', sol: '[Net Satış]', hint: 'Metne çeviren fonksiyonu kaldır; ölçü sayı döndürsün.' }
},
{
  id: 'hesap-tablo-dilimleyici', area: 'Model', lesson: 'hesap-tablolar',
  sym: 'DAX ile oluşturduğum özet tablo dilimleyiciye tepki vermiyor',
  cause: 'Hesaplanmış tablolar yenileme sırasında bir kez hesaplanır ve modelde sabit durur. Dilimleyici seçimi rapor anındadır; tabloyu yeniden hesaplatmaz.',
  fix: 'Seçime göre değişmesi gereken her şeyi ölçü olarak yaz; gerekiyorsa sanal tabloyu ölçü içinde VAR ile kur. Hesaplanmış tabloyu sabit eşleme, parametre ya da yardımcı boyut tabloları için kullan.',
  tags: ['hesaplanmış tablo', 'dilimleyici', 'statik', 'summarize tablo', 'güncellenmiyor']
},
{
  id: 'iliski-yinelenen-anahtar', area: 'Model', lesson: 'model-temel',
  sym: 'İlişki kurulamıyor: “Bir tarafta benzersiz değerler olmalı” / Power BI çoka çok öneriyor',
  cause: 'Boyut tablosunun anahtar sütununda yinelenen değerler (ya da birden çok boş) var. Çoğu zaman kaynakta iki kez yüklenmiş bir kayıt ya da harf/boşluk farkı yüzünden PQ’da ayrı, modelde aynı görünen değerlerdir.',
  fix: 'Yinelenenleri bul (DAX sorgusu: anahtara göre COUNTROWS > 1). Power Query’de Kırp, harf standardı ve Yinelenenleri kaldır uygula; tekrar gerçek bir iş anlamı taşıyorsa daha ayrıntılı bir anahtar kullan.',
  tags: ['ilişki hatası', 'benzersiz', 'yinelenen anahtar', 'çoka çok', 'kardinalite']
},

/* ---------------- Power Query ---------------- */
{
  id: 'harf-farki-yinelenen', area: 'Power Query', lesson: 'pq-ileri',
  sym: '“Yinelenenleri kaldır” uyguladım ama yüklemede “yinelenen değer” hatası alıyorum',
  cause: 'Power Query harfe duyarlıdır, model değildir. “abc01” ve “ABC01” PQ’da iki ayrı satır olarak kalır; modelde aynı değer sayılır ve anahtar benzersiz olmaz.',
  fix: 'Yinelenenleri kaldırmadan önce anahtar sütununu standartlaştır: Dönüştür → Biçim → BÜYÜK HARF ve Kırp. Sonra Yinelenenleri kaldır.',
  tags: ['harf duyarlı', 'yinelenen', 'büyük küçük harf', 'case sensitive', 'anahtar']
},
{
  id: 'birlestirme-bosluk', area: 'Power Query', lesson: 'pq-orta',
  sym: 'Birleştirme (Merge) sonrası birçok satırda eşleşme boş; kodlar gözle aynı',
  cause: 'Bir taraftaki değerlerin sonunda boşluk, satır sonu ya da görünmeyen karakter var (Excel ve CSV’de çok yaygın). PQ birleştirmesi karakter karakter eşleştirir.',
  fix: 'Birleştirmeden önce iki tarafta da Dönüştür → Biçim → Kırp (Trim) ve Temizle (Clean) uygula. Kalan eşleşmeyenleri “Sol karşıtlık” birleştirmesiyle listele.',
  tags: ['merge', 'eşleşme yok', 'boşluk', 'trim', 'clean', 'görünmeyen karakter']
},
{
  id: 'sutun-bulunamadi', area: 'Power Query', lesson: 'm-dili',
  sym: 'Yenileme hatası: “Tablonun ‘X’ sütunu bulunamadı” (Expression.Error)',
  cause: 'Kaynakta bir sütunun adı değişti ya da sütun kaldırıldı. Otomatik eklenen “Değiştirilen Tür” ve “Sütunları kaldır” adımları sütunları adıyla kodladığı için kırılır.',
  fix: 'Hatanın olduğu adımı bul; sütun adını güncelle ya da adımı yalnızca kullandığın sütunlara bağla (“Diğer sütunları kaldır”). Kaynak sahibiyle ad değişikliklerini önceden duyurma kuralı koy.',
  tags: ['sütun bulunamadı', 'expression.error', 'ad değişti', 'yenileme hatası', 'değiştirilen tür']
},
{
  id: 'formula-firewall', area: 'Power Query', lesson: 'pq-model',
  sym: 'Hata: “Formula.Firewall: Sorgu başka sorgulara veya adımlara başvuruyor… veri birleşimini yeniden oluşturun”',
  cause: 'Bir sorgu, farklı gizlilik düzeyindeki kaynaklardan gelen veriyi aynı adımda birleştiriyor (ör. bir dosyadan okunan değeri başka bir kaynağın sorgusuna parametre olarak veriyor). Gizlilik denetimi bu akışı engeller.',
  fix: 'Kaynaklara doğru gizlilik düzeyini ver (ikisi de kurum içiyse Kuruluş). Gerekirse kaynakları ayrı sorgularda okuyup birleştirmeyi ayrı bir sorguda yap. “Gizlilik düzeylerini yoksay” ayarını yalnızca riskini bilerek kullan.',
  tags: ['formula.firewall', 'gizlilik', 'privacy', 'veri birleşimi', 'yenileme hatası']
},

/* ---------------- Rapor ---------------- */
{
  id: 'dilimleyici-sayfa-degisince', area: 'Rapor', lesson: 'filtreler',
  sym: 'Sayfa değiştirince dilimleyici seçimi kayboluyor',
  cause: 'Her sayfada ayrı, birbirinden bağımsız dilimleyiciler var. Seçim yalnızca kendi sayfasını süzer.',
  fix: 'Görünüm → Dilimleyicileri eşitle bölmesinde dilimleyiciyi ilgili sayfalarda “eşitle” olarak işaretle (görünür ya da gizli). Farklı görünümlü dilimleyicileri aynı eşitleme grubuna koy.',
  tags: ['dilimleyici', 'sayfa değişince', 'seçim kayboluyor', 'eşitle', 'sync slicers']
},
{
  id: 'yer-imi-filtre-eziyor', area: 'Rapor', lesson: 'hikaye',
  sym: 'Grafik/tablo düğmesine basınca kullanıcının yaptığı filtre seçimleri sıfırlanıyor',
  cause: 'Görsel değiştiren yer işaretlerinde “Veri” seçeneği açık. Yer işareti, kaydedildiği andaki filtre ve dilimleyici durumunu da geri yüklüyor.',
  fix: 'Yer işaretleri bölmesinde ilgili yer işaretinin “…” menüsünden Veri seçeneğini kapat; yalnızca Görüntü (ve gerekiyorsa Seçili görseller) kalsın. Sonra yer işaretini güncelle.',
  tags: ['yer işareti', 'filtre sıfırlanıyor', 'bookmark', 'veri seçeneği', 'seçim kayboldu']
},
{
  id: 'tooltip-acilmiyor', area: 'Rapor', lesson: 'etkilesim',
  sym: 'Hazırladığım araç ipucu sayfası açılmıyor; varsayılan ipucu görünüyor',
  cause: 'Sayfa araç ipucu olarak işaretlenmemiş, görselin araç ipucu türü “Rapor sayfası” değil ya da otomatik eşleme için kullanılan alan görselde yok.',
  fix: 'Sayfa bilgileri → Araç ipucu olarak kullan: Açık. Görsel → Biçim → Genel → Araç ipuçları → Tür: Rapor sayfası → Sayfa: bu sayfa. Otomatik eşleme için araç ipucu sayfasına koyduğun alan, görselde de kullanılmalı.',
  tags: ['araç ipucu', 'tooltip', 'açılmıyor', 'rapor sayfası', 'ipucu sayfası']
},

/* ---------------- Hizmet ---------------- */
{
  id: 'today-utc', area: 'Service', lesson: 'yayinlama',
  sym: '“Bugün” ölçüsü Service’te sabah saatlerinde bir gün geride',
  cause: 'Power BI Service TODAY() ve NOW() fonksiyonlarını sunucunun saat diliminde (UTC) hesaplar. Türkiye UTC+3 olduğu için gece 00:00–03:00 arasında hâlâ önceki gün döner; Desktop’ta ise bilgisayarın saati kullanıldığı için sorun görünmez.',
  fix: 'Yerel saati açıkça hesapla: `UTCNOW() + 3/24` ya da Power Query’de DateTimeZone.SwitchZone ile. Göreli tarih filtrelerinde de bu farkı hesaba kat; kritik raporlarda “bugün”ü verinin son tarihinden türet.',
  tags: ['today', 'utc', 'saat dilimi', 'bir gün geride', 'now', 'Service farkı']
},
{
  id: 'yenileme-zaman-asimi', area: 'Service', lesson: 'yayinlama',
  sym: 'Zamanlanmış yenileme yaklaşık 2 saat sonra zaman aşımıyla başarısız oluyor',
  cause: 'Paylaşılan kapasitede (Pro) içeri aktarma modelinin yenilemesi 2 saatle sınırlıdır (Premium/Fabric kapasitede 5 saat). Büyük veri, katlanmayan Power Query adımları ya da yavaş kaynak süreyi aşar.',
  fix: 'Gereksiz sütun ve satırları kaynakta at, katlanmayan adımları düzelt, büyük olgu tablolarında artımlı yenileme kur. Hâlâ yetmiyorsa kapasiteye taşı ya da hazırlığı veri akışı/lakehouse katmanına ayır.',
  tags: ['zaman aşımı', 'timeout', 'yenileme uzun', '2 saat', 'artımlı yenileme']
},
{
  id: 'rls-rol-yok-bos', area: 'Service', lesson: 'guvenlik',
  sym: 'Paylaştığım kişi raporu açıyor ama tüm görseller boş',
  cause: 'Modelde RLS tanımlı ve kullanıcı (ya da grubu) hiçbir role eklenmemiş. RLS’li bir modelde rolü olmayan Görüntüleyici hiçbir satır göremez.',
  fix: 'Service’te anlam modeli → Güvenlik bölümünde kullanıcıyı ya da güvenlik grubunu ilgili role ekle. Rol atamasını kişi kişi değil gruplarla yönet; “Rol olarak test et” ile doğrula.',
  tags: ['rls', 'boş rapor', 'rol atanmamış', 'görseller boş', 'güvenlik', 'paylaşım']
}
);
})(window);
/* Service ve Fabric: karıştırılan kavramlar ve sık hatalar (Kasım 2026, Microsoft Learn) */
(function (W) {
'use strict';
const C = W.PBI_CONFUSED, M = W.PBI_MISTAKES; if (!C || !M) return;
C.push(
{ id: 'paylasim-uygulama-rol', area: 'Service', lesson: 'paylasim', title: 'Doğrudan paylaşım / Uygulama / Çalışma alanı rolü',
  items: [{ n: 'Doğrudan paylaşım', d: 'Tek rapor ya da pano, birkaç kişi, hızlı. Bağlantılar birikir, izlemesi zorlaşır.' }, { n: 'Uygulama (app)', d: 'Geniş kitle, menü, kitleler. Okuyucu çalışma alanını görmez.' }, { n: 'Çalışma alanı rolü', d: 'Birlikte geliştiren ekip. Görüntüleyici dışındaki rollere RLS uygulanmaz.' }],
  rule: 'Bir kez ve küçük ise paylaş; sürekli ve büyük ise uygulama; yazan ekip ise rol.',
  quiz: [{ q: '300 kişilik satış ekibine düzenli dağıtım için?', o: ['Herkese Üye rolü', 'Uygulama ve gruplar', '300 ayrı bağlantı göndermek', 'Web’de yayımla'], a: 1, why: 'Geniş kitlede uygulama ve grup yönetimi sürdürülebilir. Üye rolü RLS’i aşar; Web’de yayımla herkese açıktır.' }, { q: 'Rapor yazarları raporu birlikte düzenleyecek. Hangisi?', o: ['Uygulama', 'Katkıda bulunan rolü', 'Rapor bağlantısı', 'Abonelik'], a: 1, why: 'Düzenleme için içerik oluşturan rol gerekir. Uygulama ve bağlantı görüntüleme içindir.' }] },
{ id: 'calisma-org-uygulama', area: 'Service', lesson: 'power-bi-apps', title: 'Çalışma alanı uygulaması / Kuruluş uygulaması (org app)',
  items: [{ n: 'Çalışma alanı uygulaması', d: 'Alan başına bir. Sürümlüdür: “Uygulamayı güncelle” denene kadar okuyucu eskiyi görür. Model erişimi elle.' }, { n: 'Kuruluş uygulaması', d: 'Alan başına birden çok Fabric öğesi. Canlıdır: kaydedilince görünür. Model erişimi otomatik. Yükleme yok.' }],
  rule: 'Sürüm kapısı istiyorsan çalışma alanı uygulaması; alan başına çok paket ve az izin işi istiyorsan kuruluş uygulaması. İkisi birlikte yaşar.',
  quiz: [{ q: 'Yazar her kaydettiğinde okuyucu hemen görmeli. Hangisi?', o: ['Çalışma alanı uygulaması', 'Kuruluş uygulaması', 'Abonelik', 'Yer işareti'], a: 1, why: 'Org app canlı içeriktir, kaydedilince görünür. Çalışma alanı uygulaması güncelleme ister.' }, { q: 'Rapor çubuğunda yorum şart. Hangisi hazır sunar?', o: ['Kuruluş uygulaması', 'Çalışma alanı uygulaması', 'Web’de yayımla', 'PDF'], a: 1, why: 'Learn: org app’te rapor araç çubuğu yorumu yoktur; çalışma alanı uygulamasında vardır.' }] },
{ id: 'yenileme-turleri', area: 'Service', lesson: 'veri-yenileme', title: 'Veri yenileme / OneDrive yenilemesi / Kutucuk yenileme',
  items: [{ n: 'Veri yenileme', d: 'Kaynaktan Import modele veri alır. Zamanlanır. Günde 8 ya da 48.' }, { n: 'OneDrive yenilemesi', d: 'Modeli dosyayla eşitler; saatlik. Asıl kaynağa gitmez.' }, { n: 'Kutucuk yenileme', d: 'Pano kutucuğunu günceller. DirectQuery’de saatlik; Import’ta veriyle birlikte.' }],
  rule: '“Yenilendi” diyen kişiye hangisi diye sor. Gerçek tazelik için modeldeki son iş tarihine bak.',
  quiz: [{ q: 'OneDrive’daki .pbix bağlı model her saat eşitleniyor, SQL’deki veri gelmiyor. Neden?', o: ['Saat sınırı doldu', 'Asıl kaynağa gitmez', 'RLS satırları engelliyor', 'Pano kapalı'], a: 1, why: 'OneDrive yenilemesi dosyayla eşitler. Dosyadaki veri eskiyse model de eskidir.' }, { q: 'DirectQuery’de pano kutucuğu rapordan 40 dakika eski. Normal mi?', o: ['Normal, saatlik', 'Hata, düzeltilmeli', 'Lisans sorunu', 'Filtre sorunu'], a: 0, why: 'Kutucuklar önbellekten gelir; DirectQuery’de yaklaşık saatte bir yenilenir.' }] },
{ id: 'gateway-turleri', area: 'Service', lesson: 'gateway', title: 'Standart / Kişisel / VNet ağ geçidi',
  items: [{ n: 'Standart', d: 'Sürekli açık sunucu, çok kullanıcı, DirectQuery, canlı bağlantı, küme, Fabric.' }, { n: 'Kişisel', d: 'Tek kullanıcı, kullanıcı makinesi, Import yenileme, yalnız Power BI. Learn kaçınılmasını önerir.' }, { n: 'VNet', d: 'Özel sanal ağdaki kaynaklar için Microsoft yönetir, kurulum yok; kapasite ve ek ücret gerekir.' }],
  rule: 'Şirket içi üretim için standart ve küme; özel ağdaki Azure kaynağı için VNet; kişisel moddan önce dosyayı buluta taşımayı dene.',
  quiz: [{ q: 'Şirket içi SQL’e DirectQuery raporu yayımlanacak. Hangisi?', o: ['Kişisel', 'Standart', 'Ağ geçidi gerekmez', 'OneDrive'], a: 1, why: 'DirectQuery kişisel modda yoktur; standart gerekir.' }, { q: 'Özel uç noktalı Azure SQL, kurulum istemeyen ekip. Hangisi?', o: ['VNet ağ geçidi', 'Kişisel mod', 'Web’de yayımla', 'Kısayol'], a: 0, why: 'VNet ağ geçidi Microsoft tarafından yönetilir, özel ağa erişir; kapasite gerektirir.' }] },
{ id: 'kisayol-yansitma-kopya', area: 'Service', lesson: 'fabric-onelake', title: 'Kısayol / Yansıtma / Copy job',
  items: [{ n: 'Kısayol', d: 'Kopya yok, yerinde erişim. Delta ise tablo gibi görünür.' }, { n: 'Yansıtma', d: 'Operasyonel veritabanını yakın gerçek zamanlı OneLake’e çoğaltır; hedef salt okunur.' }, { n: 'Copy job', d: 'Toplu, artımlı ya da CDC kopya; zamanlanır, 50’den fazla kaynak.' }],
  rule: 'Kopya istemiyorsan kısayol; kod yazmadan yakın gerçek zamanlı çoğaltma için yansıtma; zamanlı çok tablolu taşıma için Copy job.',
  quiz: [{ q: 'Başka alandaki Delta’yı kopyasız kullan. Hangisi?', o: ['Copy job', 'Kısayol', 'Yansıtma', 'Not defteri'], a: 1, why: 'Kopya oluşturmayan yol kısayoldur.' }, { q: 'Azure SQL verisi dakikalar içinde gölde, dönüşüm yok. Hangisi?', o: ['Yansıtma', 'Gece işlem hattı', 'Web’de yayımla', 'Abonelik'], a: 0, why: 'Yansıtma hazır kurulumla yakın gerçek zamanlı çoğaltır.' }] },
{ id: 'hat-akis-not', area: 'Service', lesson: 'fabric-data-factory', title: 'İşlem hattı / Dataflow Gen2 / Not defteri',
  items: [{ n: 'İşlem hattı', d: 'Düzenler: sıra, koşul, zamanlama, bildirim. Kendisi dönüştürmez.' }, { n: 'Dataflow Gen2', d: 'Power Query ile kod yazmadan dönüştürür, hedefe yazar.' }, { n: 'Not defteri', d: 'Spark ile kodlu, karmaşık ve büyük dönüşüm.' }],
  rule: 'Ne yapılacağı için veri akışı ya da not defteri; ne zaman ve hangi sırayla için işlem hattı.',
  quiz: [{ q: 'Kopyala, temizle, yordam çalıştır, hata olursa haber ver. Hangisi düzenler?', o: ['Dataflow Gen2', 'İşlem hattı', 'Not defteri', 'Kısayol'], a: 1, why: 'Sıra, koşul ve bildirim işlem hattının işidir. Diğerleri onun içinde adım olur.' }, { q: 'Analist Power Query biliyor, küçük liste temizlenecek. Hangisi?', o: ['Dataflow Gen2', 'Spark not defteri', 'Airflow', 'Eventstream'], a: 0, why: 'Kod yazmadan dönüştürme için Dataflow Gen2.' }] }
);
M.push(
{ id: 'yayim-sonrasi-veri-yok', area: 'Service', lesson: 'calisma-alani', sym: 'Rapor yayımlandı; bir kullanıcı raporu açıyor ama hiç veri görmüyor', cause: 'RLS rol tanımları yayımla gider, rol üyeleri gitmez. Model RLS içeriyorsa ve kullanıcı hiçbir rolde değilse veri göremez.', fix: 'Anlam modeli ayarlarında Güvenlik altından rol üyelerini (tercihen grup) ekle, “Farklı görüntüle” ile sına.', tags: ['boş rapor', 'veri yok', 'rls üyeleri', 'yayımlama', 'görüntüleyici'] },
{ id: 'uygulama-yeni-rapor-gizli', area: 'Service', lesson: 'power-bi-apps', sym: 'Uygulamaya eklenen yeni raporu kullanıcılar görmüyor', cause: 'Yayımdan sonra eklenen içerik her kitlede varsayılan olarak gizli gelir.', fix: 'Uygulamayı düzenle, Kitle sekmesinde her kitlenin görünürlüğünü aç, güncelle. Kullanıcıya haber ver.', tags: ['uygulama', 'app', 'kitle', 'audience', 'yeni rapor', 'gizli içerik'] },
{ id: 'uygulama-eski-gorunum', area: 'Service', lesson: 'power-bi-apps', sym: 'Rapor değişti ama uygulamada eski hâli görünüyor', cause: 'Çalışma alanı sahneleme alanıdır; çalışma alanı uygulaması “Uygulamayı güncelle” denene kadar eski sürümü gösterir.', fix: 'Çalışma alanından Uygulamayı güncelle. Her kaydettiğinde gitsin istiyorsan kuruluş uygulamasını değerlendir.', tags: ['uygulama', 'güncelle', 'eski rapor', 'update app'] },
{ id: 'zamanlama-kapandi', area: 'Service', lesson: 'veri-yenileme', sym: 'Zamanlanmış yenileme kendiliğinden kapanmış', cause: 'Art arda dört hata, kimlik bilgisi süresinin dolması gibi kurtarılamaz bir hata ya da iki ay görüntülenmeme.', fix: 'Yenileme geçmişini oku, kök nedeni çöz, elle yenile, zamanlamayı yeniden aç. Bildirimleri ekip listesine yönlendir.', tags: ['yenileme kapandı', 'zamanlama', 'refresh', 'dört hata', 'kimlik bilgisi', 'geçmiş'] },
{ id: 'yesil-eski-veri', area: 'Service', lesson: 'veri-yenileme', sym: 'Yenileme başarılı görünüyor ama veri eski', cause: 'Üst adım (veri akışı, kaynak dosya) bitmeden model yenilenmiş ya da OneDrive yenilemesi veri yenilemesi sanılmıştır.', fix: 'Rapora son iş tarihini gösteren kart ekle: MAX(Satislar[Tarih]). Saat zincirini işlem hattıyla olaya bağla.', tags: ['eski veri', 'yeşil', 'tazelik', 'güncel değil', 'veri akışı', 'onedrive'], task: { name: 'Son İş Tarihi Kartı', q: 'Kart verideki gerçek son satış tarihini göstermeli ve seçim yapılınca değişmemeli. Bozuk ölçü süzgece uyuyor: Hediye seçilince farklı bir tarih gösteriyor.', start: 'MAX(Satislar[Tarih])', sol: 'CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS())', noTotal: false, grid: [{ t: 'Kategoriler', c: 'Kategori' }] } },
{ id: 'veri-kaynagi-tanimli-degil', area: 'Service', lesson: 'gateway', sym: 'Yenileme: “veri kaynağı tanımlı değil”', cause: 'Ağ geçidindeki bağlantı .pbix’teki sunucu ya da veritabanı adıyla birebir aynı değil; ya da aynı sorguda birleşen bulut kaynağı ağ geçidinde tanımlı değil.', fix: 'Bağlantıyı adları birebir aynı yazarak oluştur, anlam modeli ayarlarında eşle. Bulut kaynağını da aynı ağ geçidinden tanımla.', tags: ['ağ geçidi', 'gateway', 'veri kaynağı', 'tanımlı değil', 'sharepoint', 'şirket içi'] },
{ id: 'merge-null', area: 'Power Query', lesson: 'coklu-kaynak', sym: 'Birleştirmeden sonra eklenen sütun boş (null) geliyor, hata yok', cause: 'Merge büyük/küçük harfe ve boşluğa duyarlıdır. “ ANKARA ” ile “Ankara” eşleşmez, sorgu sessizce null döndürür.', fix: 'Önce anahtarı temizle: kırp, harf biçimini tekleştir, türü eşitle. Sonra birleştir ve sol karşıt birleştirmeyle eşleşmeyeni say.', tags: ['merge', 'birleştir', 'null', 'boş sütun', 'eşleşmiyor', 'kırp'] },
{ id: 'merge-satir-cogaldi', area: 'Power Query', lesson: 'coklu-kaynak', sym: 'Birleştirmeden sonra satır sayısı ve toplamlar arttı', cause: 'Sağ tabloda anahtar yineleniyor; sol satır her eşleşme için çoğalır.', fix: 'Sağ tabloyu anahtara göre tekilleştir ya da model ilişkisi kur. Birleştirmeden önce ve sonra satır sayısını karşılaştır.', tags: ['merge', 'satır çoğaldı', 'yinelenen anahtar', 'toplam şişti'] },
{ id: 'firewall', area: 'Power Query', lesson: 'veri-alma', sym: 'Formula.Firewall hatası ya da Desktop’ta çalışıp Service’te çalışmayan birleştirme', cause: 'İki kaynağın gizlilik düzeyi uyuşmuyor. Desktop’ta “yok say” açık olabilir; ayar yayımlanmaz.', fix: 'Her kaynağa gerçek düzeyini ver (şirket Kuruluş, herkese açık Genel), Service tarafında ya da ağ geçidi bağlantısında yeniden ayarla.', tags: ['firewall', 'gizlilik', 'privacy', 'service hata', 'çok kaynak'] },
{ id: 'hat-yesil-hata', area: 'Service', lesson: 'fabric-pipeline', sym: 'İşlem hattında bir adım düştü ama hat “Başarılı” görünüyor', cause: 'Hata yolundaki etkinlik başarılı olduğu için hat başarılı sayılabilir; izleme ve üst zincir yanılır.', fix: 'Hata yolunun sonuna Fail etkinliği ekle. Doğru hata kodu ve iletisini Fail içinde ver.', tags: ['pipeline', 'işlem hattı', 'fail', 'başarılı', 'hata yolu', 'data factory'] },
{ id: 'hat-parametre-sessiz', area: 'Service', lesson: 'fabric-pipeline', sym: 'Zamanlanmış işlem hattı verdiğin parametre yerine varsayılanla çalışıyor', cause: 'Zamanlamadaki parametre adı hat parametresiyle birebir aynı değil; uyuşmayan ad sessizce yok sayılır.', fix: 'Adları büyük küçük harfiyle eşitle. Çıktı sekmesinde etkinlik girdisini aç, ifadenin nasıl çözüldüğüne bak.', tags: ['pipeline', 'parametre', 'zamanlama', 'varsayılan'] },
{ id: 'copilot-gorunmuyor', area: 'Service', lesson: 'fabric-copilot', sym: 'Copilot düğmesi görünmüyor ya da kullanılamıyor', cause: 'Çalışma alanı ücretli F2+ ya da P kapasitede değil, deneme kapasitesi kullanılıyor, kiracı ayarı kapalı ya da bölge işleme ayarı açık değil. Pro ya da PPU tek başına yetmez.', fix: 'Kapasiteyi, kiracı ayarını ve bölgeyi kontrol et. Yeni ya da büyütülmüş kapasitede 24 saate kadar bekle.', tags: ['copilot', 'görünmüyor', 'düğme yok', 'deneme', 'kapasite', 'ppu'] },
{ id: 'm-buyuk-kucuk', area: 'Power Query', lesson: 'm-yaz', sym: 'Hata: “The name ‘table.addcolumn’ wasn’t recognized”', cause: 'M büyük küçük harfe duyarlıdır. İşlev adı, sütun adı ve alan adı aynen yazılmalıdır.', fix: 'İşlevi Table.AddColumn olarak yaz. DAX ve Excel’den gelen alışkanlıkla küçük harf yazma.', tags: ['m', 'büyük küçük harf', 'wasnt recognized', 'expression.error'] },
{ id: 'm-operator', area: 'Power Query', lesson: 'm-yaz', sym: 'Hata: “We cannot apply operator & to types Text and Number”', cause: 'M örtük tür çevirmez. Metin ile sayı birleşmez.', fix: 'Text.From ile çevir: "Tutar: " & Text.From([Tutar]). Sütun türünü de kontrol et.', tags: ['m', 'operator', 'tür', 'text.from'] },
{ id: 'm-null-if', area: 'Power Query', lesson: 'm-yaz', sym: 'Koşullu sütunda bazı hücreler Error: “We cannot convert the value null to type Logical”', cause: 'null ile karşılaştırma null döner, if yalnız true ya da false kabul eder.', fix: 'Önce null’u sına: if [x] = null then ... else if [x] > 5 ... ya da ([x] ?? 0) > 5.', tags: ['m', 'null', 'if', 'logical', 'koşullu sütun'] },
{ id: 'm-each-eksik', area: 'Power Query', lesson: 'm-yaz', sym: 'Hata: “The name ‘_’ wasn’t recognized” ya da satır fonksiyonu çalışmıyor', cause: 'Satır fonksiyonu beklenen yerde each unutuldu: [Tutar] > 5 tek başına fonksiyon değildir.', fix: 'each [Tutar] > 5 yaz.', tags: ['m', 'each', 'table.selectrows'] },
{ id: 'm-sutun-koseli', area: 'Power Query', lesson: 'm-tablo', sym: 'Table.TransformColumns’ta “We cannot apply field access to the type Text”', cause: 'Bu işleve satır değil hücre gelir. [Sütun] kayıt alanı arar.', fix: 'each Text.Lower(_) yaz: hücre _ ile okunur.', tags: ['m', 'transformcolumns', 'field access', 'alan erişimi'] },
{ id: 'm-pivot-cok', area: 'Power Query', lesson: 'pq-pivot-devrik', sym: 'Pivot sonrası bazı hücreler Error: “There were too many elements in the enumeration”', cause: 'Aynı kesişime birden çok değer düştü ve toplama işlevi verilmedi.', fix: 'Pivot sütunu kutusunda toplama seç ya da önce yinelemeyi bul ve gider.', tags: ['pivot', 'too many elements', 'toplama'] },
{ id: 'm-cultur', area: 'Power Query', lesson: 'm-yaz', sym: 'Tarih ya da sayı başka bilgisayarda farklı okunuyor', cause: 'Kültür verilmedi; dönüşüm makinenin bölge ayarını kullanıyor.', fix: 'Table.TransformColumnTypes(t, {{"Tarih", type date}}, "tr-TR") ya da Change Type → Using Locale.', tags: ['kültür', 'locale', 'tr-tr', 'tarih', 'dataformat.error'] },
{ id: 'klasor-yabanci', area: 'Power Query', lesson: 'm-klasor', sym: 'Klasör birleştirmede fazladan null satırlar ya da yenileme hatası', cause: 'Klasöre yapısı farklı bir dosya düştü; şablon herkese uygulanıyor.', fix: 'Folder.Files adımından sonra uzantı ve ada göre süz. Dosya adı sütununu koruyup sorunu izle.', tags: ['klasör', 'combine files', 'folder.files', 'yabancı dosya'] },
{ id: 'lakehouse-sqlde-yok', area: 'Service', lesson: 'fabric-lakehouse', sym: 'Lakehouse’a konan dosya ya da yeni tablo SQL analiz uç noktasında görünmüyor', cause: 'Files bölümündeki dosyalar uç noktada görünmez; yalnız Tables altındaki Delta tabloları görünür. Yeni tablo için meta veri eşitlemesi anlık olmayabilir.', fix: 'Dosyayı Delta’ya çevir. İşlem hattında Refresh SQL analytics endpoint etkinliğini kullan.', tags: ['lakehouse', 'sql analytics', 'uç nokta', 'görünmüyor', 'delta', 'files'] }
);
})(window);
