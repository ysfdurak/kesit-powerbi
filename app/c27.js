/* Kesit Power BI — c27: Power Query Düzenleyicisi menü haritası ve M dilinde gerçek kod yazma.
   Menü adları ve davranışlar Kasım 2026'da Microsoft Learn'den denetlendi (Türkçe sayfalar dahil). Türkçe adı doğrulanamayan komutlarda İngilizce ad ana addır.
   M alıştırmaları mengine.js alt küme yorumlayıcısında çalışır; tests/mval.js her çözümü ve data-run kod bloğunu çalıştırır. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };
const code = s => '<code>' + s + '</code>';
/* Komut satırı: [komut, ne işe yarar, ne zaman, M, tuzak] */
const tb = rows => '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Komut</th><th>Ne işe yarar</th><th>Ne zaman</th><th>Ürettiği M</th><th>Sık tuzak</th></tr></thead><tbody>' + rows.map(r => '<tr><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + (r[3] ? code(r[3]) : 'M adımı üretmez') + '</td><td>' + r[4] + '</td></tr>').join('') + '</tbody></table></div>';
const AD_NOTU = '<div class="note"><b>Adlar hakkında</b>Microsoft Learn’in Türkçe sayfalarında doğrulanan adlar Türkçe yazıldı: Giriş, Dönüştür, Sütun ekle, Görünüm, Araçlar, Sorgular, Uygulanan adımlar, Sorgu ayarları, Gelişmiş Düzenleyici, Kapat ve Uygula, Koşullu sütun, Dizin sütunu, Pivot sütunu, Satırları ters çevir. Doğrulayamadığımız komutlarda İngilizce ad ana addır, parantezdeki Türkçe yalnız açıklamadır. Masaüstünün Türkçe arayüzünde ad farklı olabilir; şerit sürümden sürüme de değişir. Bu ders Power BI Desktop açılarak değil, belgelerden hazırlandı.</div>';

/* ---------- Menü haritası 1: bölmeler, Giriş, Görünüm, Araçlar ---------- */
add('pq-donusum', {
  id: 'pq-menu', lv: 'B1', mod: 'Veri Hazırlama', min: 22,
  title: 'Power Query menü haritası 1: bölmeler, Giriş, Görünüm, Araçlar',
  sum: 'Verileri dönüştür ile açılan düzenleyicinin bölümleri; Giriş, Görünüm ve Araçlar sekmelerindeki komutlar: ne işe yarar, ne zaman kullanılır, ürettiği M, sık tuzak.',
  body: `<h2>Düzenleyicinin beş bölümü</h2>
<p>Power BI Desktop’ta <b>Giriş → Verileri dönüştür</b> Power Query Düzenleyicisi’ni açar. Burada yaptığın hiçbir şey kaynak veriyi değiştirmez: düzenleyici yalnız verinin görünümünü şekillendirir ve her işlemi bir adım olarak kaydeder. Learn düzenleyiciyi beş bölüme ayırır:</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Bölüm</th><th>Ne gösterir</th><th>Bilmen gereken</th></tr></thead><tbody>
<tr><td><b>Şerit</b></td><td>Sekmeler: Giriş, Dönüştür, Sütun ekle, Görünüm, Araçlar, Yardım</td><td>Aynı komut birden çok sekmede olabilir. Dönüştür sütunu değiştirir, Sütun ekle yeni sütun açar.</td></tr>
<tr><td><b>Sorgular</b> bölmesi</td><td>Dosyadaki tüm sorgular</td><td>Sağ tık: Çoğalt, Başvuru, Yüklemeyi etkinleştir, Rapor yenilemeye dahil et, Gruba taşı, Create Function.</td></tr>
<tr><td><b>Geçerli görünüm</b></td><td>Varsayılan olarak veri önizlemesi</td><td>Önizleme, verinin tamamı değil örneğidir. Schema view ve Diagram view şu an yalnız Power Query Online’da.</td></tr>
<tr><td><b>Sorgu ayarları</b></td><td>Sorgu adı ve <b>Uygulanan adımlar</b></td><td>Adıma tıklayınca o andaki veri görünür. Dişli simgesi ayarları açar. Adım adını ve açıklamasını Özellikler’den değiştir.</td></tr>
<tr><td><b>Durum çubuğu</b></td><td>Çalışma süresi, sütun ve satır sayısı, işlem durumu</td><td>Sol alttaki <b>Column profiling based on top 1000 rows</b> yazısına tıklayıp profili tüm veriye genişletebilirsin.</td></tr>
</tbody></table></div>
${AD_NOTU}
<h2>Uygulanan adımlar menüsü</h2>
<p>Adıma sağ tıklamak, kod yazmadan yapabileceğin en güçlü işlerin yeridir.</p>
${tb([
  ['Edit Settings (dişli)', 'Adımın iletişim kutusunu yeniden açar.', 'Filtre değerini ya da birleştirme türünü değiştirmek.', '', 'Elle düzenlediğin M adımında dişli çıkmayabilir.'],
  ['Rename / Properties', 'Adı ve açıklamayı değiştirir.', 'Kodu okunur kılmak için.', '#"Filtrelenen Satırlar" = ...', 'Sonraki adımlar yeni adı otomatik izler; elle yazdığın kod da düzenleyicide güncellenir, dışarıya yapıştırdığın kod güncellenmez.'],
  ['Delete / Delete Until End', 'Adımı ya da sonrasını siler.', 'Yanlış yola sapınca.', '', 'Sonraki adım silinen sütuna bakıyorsa o adım hata verir.'],
  ['Insert Step After', 'Araya adım ekler.', 'Süreci baştan kurmadan düzeltmek.', '= #"Önceki Adım"', 'Araya eklenen dönüşüm sonraki adımların beklediği sütunu değiştirebilir.'],
  ['Move Before / Move After', 'Adımın sırasını değiştirir.', 'Filtreyi öne almak.', '', 'Sıra sonucu değiştirebilir: filtreden önce ve sonra Dizin sütunu farklı numara verir.'],
  ['Extract Previous', 'Önceki adımları yeni sorguya taşır.', 'Uzun sorguyu bölmek, ortak hazırlığı paylaşmak.', 'Kaynak = #"Yeni Sorgu"', 'Yeni sorgu yüklenmesin diye yüklemeyi kapat.'],
  ['View Native Query (Yerel sorguyu görüntüle)', 'Adımın kaynağa gönderdiği SQL’i gösterir.', 'Katlanıp katlanmadığını görmek.', '', 'Soluk görünmesi kesin kanıt değildir; katlama göstergelerine de bak (Online).']
])}
<h2>Giriş sekmesi</h2>
${tb([
  ['Kapat ve Uygula (Close & Apply)', 'Değişiklikleri modele yükler, düzenleyiciyi kapatır. Dosya menüsünde de var.', 'İş bitince.', '', 'Yalnız Kapat dersen rapor eski veriyle kalır, üstte bekleyen değişiklik uyarısı çıkar. Kaydetmek ayrı iştir: Dosya → Kaydet.'],
  ['New Source (Yeni kaynak)', 'Yeni bağlantı ve sorgu ekler.', 'İkinci kaynağı getirmek.', 'Sql.Database("srv", "db")', 'Farklı gizlilik düzeyli kaynakları birleştirmek firewall hatası verir.'],
  ['Recent Sources / Enter Data', 'Son kaynaklar; elle küçük tablo.', 'Küçük eşleme tablosu.', 'Table.FromRows(Json.Document(Binary.Decompress(...)))', 'Elle girilen veri kaynakta değil dosyadadır; yenilemeyle güncellenmez.'],
  ['Data source settings', 'Kimlik bilgisi ve gizlilik düzeyi.', 'Şifre değişince, kaynak taşınınca.', '', 'Kaynak yolu burada değişir; M’de elle değiştirmek her sorguda ayrı iş çıkarır.'],
  ['Manage Parameters', 'Sunucu adı, tarih eşiği gibi değerleri tek yerde tutar.', 'Geliştirme ve canlı ortam geçişi.', '"srv" meta [IsParameterQuery = true, Type = "Text", IsParameterQueryRequired = true]', 'Parametre türü sütun türüyle uyuşmalı: Metin parametre ile tarih filtre hata verir.'],
  ['Refresh Preview (Önizlemeyi yenile)', 'Önbellekteki önizlemeyi kaynaktan yeniden okur.', 'Kaynak dosya değiştiyse, yeni sütunu görmek için.', '', 'Modeli yenilemez. Modeli güncelleyen Kapat ve Uygula ile rapordaki Yenile’dir.'],
  ['Advanced Editor (Gelişmiş Düzenleyici)', 'Sorgunun tüm M kodu. Görünüm sekmesinde de var.', 'Elle düzenleme, paylaşma.', 'let ... in ...', 'Bitti demeden kapatırsan değişiklik gider. Söz dizimi hatası sorguyu kaydettirmez.'],
  ['Choose Columns / Remove Columns', 'Sütun seçer ya da siler.', 'Gereksiz sütunları modele almamak.', 'Table.SelectColumns(t, {"a", "b"})', 'Remove Columns adı geçen sütuna bağlıdır, yeni sütun içeri girer. Şema oynaksa Choose Columns daha sağlamdır.'],
  ['Keep Rows (Satırları tut)', 'İlk, son, aralık, yinelenen, hatalı satırları tutar.', 'Geliştirirken küçültme, hata incelemesi.', 'Table.FirstN(t, 100)', 'Keep Top adımını kaldırmayı unutursan model eksik yüklenir.'],
  ['Remove Rows (Satırları kaldır)', 'Üst, alt, boş, yinelenen, hatalı satırları siler.', 'Excel başlık ve dip toplam temizliği.', 'Table.Skip(t, 3)', 'Remove Duplicates seçili sütunlara bakar, yalnız ilk görülen kalır. Sıra garanti değildir.'],
  ['Sort', 'Satırları sıralar.', 'Dizinden önce ya da “ilk kayıt” kalıbında.', 'Table.Sort(t, {{"Tutar", Order.Descending}})', 'Tüm satırları okur, yavaştır. Rapordaki sıra görselden gelir, buradan değil.'],
  ['Merge Queries (Sorguları birleştir)', 'Sütun ekler: anahtar eşleşmesiyle ikinci sorgudan.', 'Boyuttan alan getirmek.', 'Table.NestedJoin(a, {"k"}, b, {"k"}, "b", JoinKind.LeftOuter)', 'Sağ tablodaki yinelenen anahtar satırları çoğaltır. Eşleşme harfe ve boşluğa duyarlıdır.'],
  ['Append Queries (Sorguları ekle)', 'Satır ekler: aynı yapıdaki sorgular alt alta.', 'Aylık dosyalar.', 'Table.Combine({a, b})', 'Sütunlar ada göre eşleşir: Şehir ve Sehir iki ayrı sütun olur, boşluklar null kalır.'],
  ['Combine Files (Dosyaları birleştir)', 'Klasördeki dosyaları tek şablonla okur, yardımcı sorgular üretir.', 'Aynı yapıda çok dosya.', 'Folder.Files("C:\\Veri")', 'Örnek dosyayı değiştirmek işlevi de değiştirir. Klasöre yabancı dosya düşerse birleştirme bozulur. Bkz. M klasör dersi.']
])}
<h2>Görünüm sekmesi</h2>
<p>Görünüm komutları M adımı üretmez, yalnız ne gördüğünü değiştirir. Profil araçları için Lab’de <b>Görünüm</b> sekmesini aç: sayılar o anki tablodan hesaplanır.</p>
${tb([
  ['Query Settings / Formula Bar', 'Sağ bölmeyi ve formül çubuğunu açıp kapatır.', 'Formül çubuğu kapalıysa M’yi göremezsin.', '', 'İlk iş formül çubuğunu aç: öğrenmenin en hızlı yolu her adımın M’sini görmektir.'],
  ['Column quality (Sütun kalitesi)', 'Geçerli, hata, boş yüzdesi.', 'Tür değiştirmeden önce ve sonra.', '', 'Varsayılan olarak ilk 1000 satıra bakar. Hata sonra çıkıyorsa yüzde 100 geçerli görebilirsin.'],
  ['Column distribution (Sütun dağılımı)', 'Ayrı (distinct) ve tek (unique) değer sayısı.', 'Anahtar adayını sınamak.', '', 'Ayrı: farklı değer sayısı. Tek: yalnız bir kez geçen değer sayısı. Anahtarda ikisi satır sayısına eşit olmalı.'],
  ['Column profile (Sütun profili)', 'Seçili sütunun istatistikleri ve değer dağılımı önizlemenin altında.', 'Uç değer ve dağılım.', '', 'Sayıyı raporda kullanacaksan tüm veriye geçir: durum çubuğundan “entire data set”.'],
  ['Monospaced / Show whitespace', 'Eşit aralıklı yazı ve boşluk işaretleri.', 'Sondaki boşluğu ya da satır sonunu görmek.', '', 'Eşleşmeyen birleştirmenin nedeni çoğu kez görünmeyen boşluktur.'],
  ['Go to Column', 'Sütuna atlar.', 'Çok sütunlu tablo.', '', 'Yalnız gezinme; adım üretmez.'],
  ['Query Dependencies', 'Sorguların birbirine ve kaynaklara bağımlılık şeması.', 'Etki analizi: sorguyu silmeden önce.', '', 'Düzenleme yapılmaz, yalnız okunur.']
])}
<h2>Araçlar sekmesi</h2>
${tb([
  ['Start / Stop Diagnostics (Sorgu tanılaması)', 'Başlattıktan sonraki değerlendirmeleri izler.', 'Yavaş sorguda süre nereye gidiyor?', '', 'Mutlaka Stop de: durdurmazsan izler kaybolur. Sonuç, yeni sorgular olarak gelir. Exclusive duration yüzdesini yalnız aynı Id içinde topla.'],
  ['Diagnose Step', 'Yalnız görüntülediğin adımı tanılar.', 'Sorunu tek adıma indirmek.', '', 'Düzenleme sırasındaki önbellek süreleri gerçek yenilemeden farklı olabilir.'],
  ['Diagnostic Options', 'Hangi çıktıların üretileceği.', 'Yönetici izni yoksa: Options → Diagnostics → Enable in Query Editor.', '', 'Bu yöntem önizlemeyi izler, tam yenilemeyi izlemez.']
])}
<div class="tip"><b>Elle dene</b><button class="lnk" data-go="pq">Power Query Lab</button> sayfasında Görünüm sekmesini aç, üç kutuyu da işaretle, bir sütuna tıkla: istatistikler ve değer dağılımı tablodan hesaplanır. Sıradaki ders Dönüştür ve Sütun ekle sekmelerini tamamlıyor.</div>`,
  ex: [
    { t: 'mc', q: 'Kaynak Excel dosyasına yeni bir sütun eklendi. Düzenleyici açık, önizlemede sütun görünmüyor. Bu sütunu görmek için ilk denenecek komut hangisi?', o: ['Refresh Preview', 'Kapat ve Uygula', 'Query Dependencies', 'Column profile'], a: 0, why: 'Refresh Preview, önizleme önbelleğini kaynaktan yeniden okur. Kapat ve Uygula modele yükler ama açık önizlemeyi yenilemek için değildir; öteki ikisi yalnız görüntüler.' },
    { t: 'mc', q: 'Sütun kalitesi yüzde 100 geçerli gösteriyor, ama model yüklenirken aynı sütunda satır hatası çıkıyor. En olası açıklama nedir?', o: ['Sütun kalitesi yalnız metin sütunlarında hata gösterir ve sayı sütununda bu yüzden yanılır', 'Profil varsayılan olarak ilk 1000 satıra bakar; hatalı satır daha aşağıda', 'Model yükleme sırasında veri türleri sıfırlanır', 'Kapat ve Uygula Uygulanan adımları atlar'], a: 1, why: 'Profil araçları varsayılan olarak ilk 1000 satırı kullanır. Durum çubuğundaki yazıya tıklayıp “entire data set” seçmek sorunu görünür kılar.' },
    { t: 'mc', q: 'Bir anahtar sütunu sınıyorsun: 500 satır, ayrı değer 500, tek değer 480. Sütun dağılımında bu nasıl okunmalı?', o: ['Sayılar çelişiyor: ayrı 500 ise tek de 500 olmalı', 'Anahtar temiz, sorun yok', 'Yinelenen var demektir ama kaç tane olduğu söylenemez', 'Boş değerler ayrı sayılmıyor'], a: 0, why: 'Ayrı değer 500 ve satır 500 ise her değer bir kez geçiyordur, o zaman tek değer de 500 olur. Böyle bir ekranda ilk şüphe okunan sayılar ya da örneklemdir. Gerçek anahtarda üç sayı da satır sayısına eşittir.' },
    { t: 'mc', q: 'Rapor sıralaması için Power Query’de Sort adımı eklendi, ama görselde sıra değişmedi. Doğru yaklaşım hangisi?', o: ['Görselde ya da Sort by column ile sırala', 'Sort adımını sorgunun en başına al', 'Kapat ve Uygula yerine Refresh Preview kullan', 'Adımı Table.Buffer içine al'], a: 0, why: 'Görsel sırası modeldeki sıralama ayarından ve görselden gelir. Power Query’deki sıralama tablo yükleme sırasına güvenilir bir rapor sırası vermez ve maliyetlidir.' },
    { t: 'mc', q: 'Sorgu tanılamasını başlattın, sonra düzenleyiciyi hiç durdurmadan kapattın. Ne bekleriz?', o: ['Sonuçlar yine de oluşur', 'İzler kaybolur', 'Rapor yenilemesi başarısız olur', 'Sorgular otomatik katlanır'], a: 1, why: 'Learn: Stop Diagnostics izleri toplayıp ayrıştırır; durdurulmazsa izler kaybolur.' },
    { t: 'mc', q: 'Şema görünümü (Schema view) ve diyagram görünümü için Learn’in Kasım 2026 durumu nedir?', o: ['Yalnız Power Query Online’da', 'Yalnız Power BI Desktop’ta', 'Her iki üründe de var', 'Kaldırıldı'], a: 0, why: 'power-query-ui sayfası: Schema view ve diagram view şu an yalnız Power Query Online’da.' },
    { t: 'mc', q: 'Düzenleyicide yaptığın tüm dönüşümler kaynak Excel dosyasını nasıl etkiler?', o: ['Dosyayı değiştirir; önce yedek alınmalıdır', 'Yalnız silinen sütunları kaynakta da siler', 'Kaynak dosyayı Kapat ve Uygula anında kopyalayıp yeni dosyaya yazar', 'Hiç etkilemez; düzenleyici verinin görünümünü şekillendirir'], a: 3, why: 'Learn: temel veri değişmez, Power Query Düzenleyicisi yalnız görünümü şekillendirir ve adımları kaydeder.' },
    { t: 'pq', src: 'satis', pre: [], sol: [{ op: 'sort', cols: ['Tutar'], order: 'desc' }, { op: 'keepTop', cols: [], n: 3 }], q: '<b>En büyük üç sipariş.</b> Giriş sekmesinden <code>Tutar</code>’a göre azalan sırala, sonra ilk 3 satırı tut.', hint: 'Sort’tan sonra Keep top rows. Sıra önemli: önce tutarsan rastgele üç satırı sıralarsın.' }
  ]
});

/* ---------- Menü haritası 2: Dönüştür, Sütun ekle ---------- */
add('pq-menu', {
  id: 'pq-menu-2', lv: 'B1', mod: 'Veri Hazırlama', min: 22,
  title: 'Power Query menü haritası 2: Dönüştür ve Sütun ekle',
  sum: 'Dönüştür ile Sütun ekle arasındaki fark; Pivot, Transpose, Satırları ters çevir, Convert to List, Column from Examples, Koşullu sütun, Invoke Custom Function ve sayı ile tarih komutları, M karşılıkları.',
  body: `<h2>İki sekmenin tek farkı</h2>
<p>Metin, sayı ve tarih komutlarının çoğu iki sekmede de var. <b>Dönüştür</b> seçili sütunu yerinde değiştirir ve <code>Table.TransformColumns</code> üretir. <b>Sütun ekle</b> asıl sütuna dokunmaz, sona yeni sütun açar ve <code>Table.AddColumn</code> üretir. Aslı sonra lazımsa Sütun ekle; kirli sütunu temizliyorsan Dönüştür.</p>
${AD_NOTU}
<h2>Dönüştür sekmesi</h2>
${tb([
  ['Group By (Grupla)', 'Satırları anahtara göre özetler.', 'Olgu tablosunu özetlemek.', 'Table.Group(t, {"Şehir"}, {{"Toplam", each List.Sum([Tutar]), type number}})', 'Modelin ayrıntı düzeyini düşürür: sonradan detaya inemezsin. Çoğu toplam ölçü olarak daha iyidir.'],
  ['Use First Row as Headers', 'İlk satırı başlık yapar; aşağı açılırda tersi de var.', 'CSV ya da Excel başlığı satırda kaldıysa.', 'Table.PromoteHeaders(t, [PromoteAllScalars = true])', 'Sonraki Changed Type adımı eski sütun adına bakarsa hata verir.'],
  ['Transpose', 'Satırları sütun, sütunları satır yapar.', 'Excel’de yanlış yönde duran özet tablolar.', 'Table.Transpose(t)', 'Sütun adları kaybolur, Column1 olur. Korumak için önce başlıkları ilk satıra indir.'],
  ['Satırları ters çevir (Reverse Rows)', 'Sırayı tersine çevirir.', 'Sondan ilk kayıt, yukarıdan doldurma.', 'Table.ReverseRows(t)', 'Değere göre sıralamaz.'],
  ['Count Rows', 'Tabloyu tek sayıya indirir.', 'Kontrol sorgusu.', 'Table.RowCount(t)', 'Sonuç tablo değil sayıdır, sonraki tablo adımları çalışmaz.'],
  ['Detect Data Type (Veri türünü algıla)', 'Tüm sütunlarda türü ilk 200 satırdan tahmin eder. Herhangi bir sütun grubunda.', 'Yeni dosyada hızlı başlangıç.', 'Table.TransformColumnTypes(t, {{"Tutar", type number}})', 'Tahmindir. Posta kodu sayıya dönüşür, baştaki sıfır gider. Türü bilinçli ver.'],
  ['Rename', 'Sütun adını değiştirir.', 'Teknik adları iş diline çevirmek.', 'Table.RenameColumns(t, {{"Tutar_TL", "Tutar"}})', 'Sonra kaynak sütun adı değişirse bu adım hata verir.'],
  ['Replace Values / Replace Errors', 'Değer ya da hata hücresini değiştirir.', '“-” işaretini null yapmak.', 'Table.ReplaceValue(t, "-", null, Replacer.ReplaceValue, {"Tutar"})', 'Hatayı 0 yapmak sorunu gizler: 0 ile bilinmiyor aynı görünür.'],
  ['Fill Down / Fill Up', 'Boşları komşu değerle doldurur.', 'Birleştirilmiş Excel hücreleri.', 'Table.FillDown(t, {"Kategori"})', 'Yalnız null doldurur, boş metin ("") dolmaz: önce null’a çevir.'],
  ['Pivot sütunu (Pivot Column)', 'Bir sütunun değerlerini başlığa çevirir: uzundan genişe. Herhangi bir sütun grubunda.', 'Sunum tablosu, satır başına bir nesne.', 'Table.Pivot(t, List.Distinct(t[Ay]), "Ay", "Tutar", List.Sum)', 'Toplama seçmezsen aynı kesişimde iki değer hücrede hata üretir. Yeni ay yeni sütun demektir; model için uzun tablo daha iyidir.'],
  ['Unpivot Columns / Other Columns', 'Sütunları satıra çevirir: genişten uzuna.', 'Ay sütunlu bütçe dosyaları.', 'Table.UnpivotOtherColumns(t, {"Kategori"}, "Ay", "Tutar")', 'Unpivot Columns adı yazılı sütunlara bağlıdır, yeni ay içeri girmez. Other Columns yeni sütunları da alır. null hücreler satır üretmez.'],
  ['Move', 'Sütun sırasını değiştirir.', 'Okunurluk.', 'Table.ReorderColumns(t, {"b", "a"})', 'Sıra modele anlam katmaz, bağımlılık ekler.'],
  ['Convert to List (Listeye dönüştür)', 'Sütunu M listesine çevirir, tablo gider.', 'Başka bir sorguya değer listesi vermek.', 't[Şehir]', 'Sonuç liste olduğu için tablo komutları kaybolur; adımı silmek dışında yol yok.'],
  ['Split Column', 'Sınırlayıcı ya da uzunlukla böler.', 'Ad Soyad, kod ve ad.', 'Table.SplitColumn(t, "Ad", Splitter.SplitTextByDelimiter(" ", QuoteStyle.Csv))', 'Otomatik gelen sütun listesi kalıcıdır: Her sınırlayıcıda bölmede yeni parça yeni sütun açmaz.'],
  ['Format', 'Küçük, büyük harf, kırpma, temizleme, önek.', 'Eşleşme öncesi temizlik.', 'Table.TransformColumns(t, {{"Şehir", Text.Trim, type text}})', 'Her Sözcüğün İlk Harfi Büyük komutu kültür verilmezse Türkçe i ve ı’yı bozabilir.'],
  ['Merge Columns', 'Burada seçili sütunları tek sütunda toplar, aslı gider.', 'Adres parçaları.', 'Table.CombineColumns(t, {"a", "b"}, Combiner.CombineTextByDelimiter(" ", QuoteStyle.None), "c")', 'Sütun ekle’deki aynı adlı komut aslı korur ve Text.Combine üretir.'],
  ['Extract / Parse', 'Metinden parça alır; JSON ve XML ayrıştırır.', 'Kod ayıklama, API yanıtı.', 'Table.TransformColumns(t, {{"Kod", each Text.Start(_, 3), type text}})', 'JSON ayrıştırınca sütun kayıt olur; genişletmeden yüklenemez.'],
  ['Standard, Scientific, Rounding', 'Sayı işlemleri sütunun üstüne yazar.', 'Birim çevirmek.', 'Table.TransformColumns(t, {{"Tutar", each _ * 1.2, type number}})', 'Asıl değer gider; KDV gibi durumlarda çoğu kez Sütun ekle gerekir. Yuvarlama varsayılanı bankacı yuvarlamasıdır.'],
  ['Date, Time, Duration', 'Tarih sütununu yıl, ay gibi parçaya çevirir.', 'Eksik takvim alanı.', 'Table.TransformColumns(t, {{"Tarih", Date.Year, Int64.Type}})', 'Metin tarihte Error verir; önce türü düzelt. Rapor için Tarih tablosu daha doğrudur.'],
  ['Expand / Aggregate', 'İç içe tablo ya da kaydı açar.', 'Birleştirmeden sonra.', 'Table.ExpandTableColumn(t, "b", {"Bölge"})', 'Listeyi elle seç: “tüm sütunlar” kalıcı bir ad listesi yazar, yeni sütun gelmez.'],
  ['Run R / Python Script', 'Betikle dönüşüm yapar.', 'İstatistik ya da özel işlem.', 'Python.Execute("...")', 'Ağ geçidi ve kişisel mod gerekir; hizmette kısıtları vardır.']
])}
<h2>Sütun ekle sekmesi</h2>
${tb([
  ['Column from Examples (Örneklerden sütun)', 'Örnek değer yazarsın, dönüşümü kendisi bulur. From All Columns ya da From Selection.', 'Formülü bilmediğinde ya da hızlıca.', 'Table.AddColumn(t, "Kısa", each Text.BeforeDelimiter([Ad], " "), type text)', 'Birkaç satıra uyan yanlış kuralı bulabilir. Üretilen M’yi oku; Tamam’dan önce kesinleşmez.'],
  ['Custom Column (Özel sütun)', 'M formülü yazarsın.', 'Şerit yetmediğinde.', 'Table.AddColumn(t, "KDVli", each [Tutar] * 1.2)', 'Tür seçmezsen sütun Herhangi kalır. DAX yazılmaz: M büyük küçük harfe duyarlıdır.'],
  ['Invoke Custom Function (Özel işlev çağır)', 'Her satır için bir M fonksiyonu çağırır. Genel grubunda.', 'Dosya okuma, ortak temizlik.', 'Table.AddColumn(t, "Sonuç", each fnTemizle([Ad]))', 'Fonksiyona sonradan parametre ekleyince çağıran adım hata verir: adımı yeniden aç, değeri gir.'],
  ['Koşullu sütun (Conditional Column)', 'Görsel if, else if. Genel grubunda.', 'Basit sınıflama.', 'Table.AddColumn(t, "Boy", each if [Tutar] > 1000 then "Büyük" else "Küçük")', 'Learn: yeni koşullu sütunun türü tanımsızdır, Herhangi gelir, ayrıca tür ver. Maddeler yukarıdan aşağı denenir. null karşılaştırması hata üretir.'],
  ['Dizin sütunu (Index Column)', '0, 1 ya da özel başlangıçla sıra numarası.', 'Satır sırasını korumak, gruplamak.', 'Table.AddIndexColumn(t, "Dizin", 0, 1, Int64.Type)', 'Kalıcı anahtar değildir: kaynak sırası değişirse numara değişir. Filtreden önce ve sonra farklı sonuç verir.'],
  ['Duplicate Column', 'Sütunun kopyasını sona ekler.', 'Aslı koruyup kopyayı dönüştürmek.', 'Table.DuplicateColumn(t, "Şehir", "Şehir - Kopya")', 'Aynı veriyi iki kez yükleme: işin bitince kopyayı ya da aslı kaldır.'],
  ['Merge Columns (Sütun ekle)', 'Sütunları birleştirip yeni sütun açar, aslı kalır.', 'Etiket, bileşik anahtar.', 'Table.AddColumn(t, "Etiket", each Text.Combine({[a], [b]}, " "), type text)', 'null parçalar atlanır. Bileşik anahtarda ayırıcı kullan: 1 ve 23 ile 12 ve 3 aynı metne dönüşmesin.'],
  ['From Text', 'Biçim, ayıklama, ayrıştırma.', 'Aslı korunacaksa.', 'Table.AddColumn(t, "Uzunluk", each Text.Length([Ad]), Int64.Type)', 'Metin olmayan hücrede Error.'],
  ['From Number', 'Standart (Modulo, Bölme (Tamsayı) dahil), bilimsel, yuvarlama, bilgi.', 'Oran, KDV.', 'Table.AddColumn(t, "Mod", each Number.Mod([Dizin], 3), type number)', 'Tek sütun seçiliyken sabit değer sorar. İki sütun seçiliyken ikisini işler.'],
  ['From Date & Time', 'Yıl, ay, çeyrek, ayın başı, yaş.', 'Tarih parçası gerekiyor.', 'Table.AddColumn(t, "Yıl", each Date.Year([Tarih]), Int64.Type)', 'Yaş gibi bugüne bağlı değerler yenilemede değişir.']
])}
<h2>Lab’de dene</h2>
<p>Bu derste adı geçen komutların çoğu <button class="lnk" data-go="pq">Power Query Lab</button> şeridinde çalışıyor. Her adımın M’si, Lab’in içindeki yorumlayıcıda çalıştırılarak üretilir; yani gördüğün kod sonucu gerçekten üreten koddur. Lab’deki sayı ve tarih komutları tek bir Sayı işlemi ve Tarih işlemi kutusunda toplanmıştır.</p>`,
  ex: [
    { t: 'pq', src: 'aylik', pre: [], sol: [{ op: 'pivot', cols: ['Ay'], val: 'Tutar', agg: 'sum' }], q: '<b>Uzundan genişe.</b> <code>Ay</code> sütununu seç, Dönüştür sekmesinden <b>Pivot sütunu</b> ile aylar başlık olsun; değer sütunu <code>Tutar</code>, toplama Toplam.', hint: 'Önce Ay başlığına tıkla. Değer sütunu kutusu Tutar olmalı.' },
    { t: 'pq', src: 'satis', pre: [], sol: [{ op: 'dateOp', cols: ['Tarih'], what: 'month', name: 'Ay' }, { op: 'addCond', cols: ['Adet'], name: 'Sınıf', cmp: '>', v: '2', then: 'Toplu', els: 'Tekil' }], q: '<b>Sütun ekle sekmesi.</b> <code>Tarih</code>’ten <code>Ay</code> adlı sütun çıkar (Tarih işlemi → Ay). Sonra <code>Adet</code> üzerinde <code>Sınıf</code> adlı koşullu sütun ekle: 2’den büyükse Toplu, değilse Tekil.', hint: 'Koşullu sütunu açmadan önce Adet başlığına tıkla.' },
    { t: 'pq', src: 'satis', pre: [], sol: [{ op: 'addIndex', cols: [], name: 'Sıra', start: 1, step: 1 }, { op: 'addCustom', cols: [], name: 'KDVli', expr: '[Tutar] * 1.2', to: 'number' }, { op: 'reverse', cols: [] }], q: '<b>Dizin, özel sütun, ters çevir.</b> 1’den başlayan <code>Sıra</code> dizini ekle. <code>KDVli</code> adlı özel sütun: <code>[Tutar] * 1.2</code>, türü Ondalık sayı. En sonda satırları ters çevir.', hint: 'Sıra önemli: Satırları ters çevir son adım olmalı ki dizin numaraları kaynak sırasını göstersin.' },
    { t: 'pq', src: 'hedef', pre: [], sol: [{ op: 'demote', cols: [] }, { op: 'transpose', cols: [] }], q: '<b>Ad kaybetmeden devrik.</b> Sütun adları kaybolmasın diye önce başlıkları ilk satıra indir, sonra Transpose uygula.', hint: 'Dönüştür sekmesi, Tablo grubu.' },
    { t: 'mc', q: 'Bütçe dosyasına her ay yeni bir ay sütunu ekleniyor. Yenilemede yeni ayın da satıra dönmesi için hangi komut gerekir?', o: ['Unpivot Only Selected', 'Unpivot Other Columns', 'Pivot sütunu', 'Transpose'], a: 1, why: 'Other Columns üretilen kodda yalnız sabit sütunları adlandırır, gerisini her yenilemede yeniden hesaplar. Seçili sütunlarla yapılan unpivot yeni ayı içeri almaz.' },
    { t: 'mc', q: 'Aynı bölge ve aya iki satır düşen tabloda toplama seçmeden Pivot sütunu uygularsan ne olur?', o: ['İlk değer alınır', 'Değerler toplanır', 'Adım hiç çalışmaz', 'O hücre Error olur'], a: 3, why: 'Toplama işlevi yoksa kesişime birden çok değer düşünce o hücrede hata oluşur. Çözüm toplama işlevi vermek ya da önce yinelemeyi bulup gidermek.' },
    { t: 'mc', q: 'Koşullu sütun ekledin ve türü hâlâ ABC123 görünüyor. Ne yapmalısın?', o: ['Normal: yeni koşullu sütunun türü tanımsızdır, ayrı bir tür adımı ekle', 'Koşul maddelerini yeniden sırala', 'Sütunu silip Özel sütun ile yeniden oluştur; koşullu sütunlar türü bozar', 'Detect Data Type tüm sorguda sorunu kalıcı çözer, başka iş gerekmez'], a: 0, why: 'Learn: yeni koşullu sütunların türü tanımlı değildir. Bilinçli bir tür adımı ekle, Herhangi türü modele taşıma.' },
    { t: 'mc', q: '“Şehir” sütununu temizlemek istiyorsun ama asıl değeri denetim için tutmalısın. Hangi sekmeden Format → Trim?', o: ['Dönüştür', 'Giriş', 'Sütun ekle', 'Görünüm'], a: 2, why: 'Dönüştür yerinde değiştirir, Sütun ekle yeni sütun açar. Komutlar iki sekmede de vardır.' },
    { t: 'mc', q: 'Şehir sütununa Convert to List uyguladın; artık sütun filtreleri ve tablo komutları görünmüyor. Neden?', o: ['Sorgu bozuldu', 'Sonuç artık listedir', 'Yetki gerekir', 'Önizleme yenilenmedi'], a: 1, why: 'Convert to List tablonun sütununu M listesine çevirir (t[Şehir]). Liste için Liste araçları görünür, tablo komutları görünmez.' },
    { t: 'mc', q: 'Column from Examples ile üretilen sütun ilk 20 satırda doğru. Yine de ne yapmalısın?', o: ['Hiçbir şey; yapay zekâ kontrol etti', 'Sütunu Pivot ile doğrula', 'Satır sayısını azalt', 'Üretilen M’yi oku, istisnayla sına'], a: 3, why: 'Kural örneklere uyar, verinin tamamına uymayabilir. Learn de başka satırı düzelterek kuralın iyileştirilmesini anlatır; Tamam demeden kesinleşmez.' }
  ]
});

/* ---------- M: kod yazmaya başla ---------- */
const NOTE_M = '<div class="note"><b>Burada çalışan ne?</b>Alıştırmalar ve Çalıştır düğmeleri, uygulamanın içindeki küçük bir M alt kümesi yorumlayıcısında çalışır. Gerçek Power Query motoru değildir: kaynağa bağlanmaz, sorgu katlamaz. Desteklenmeyen işlevde sonuç uydurmaz, “bu alt kümede yok” der. Hazır sorgular: <code>Satislar</code>, <code>Aylik_Satis</code>, <code>Bayi_Subat</code>, <code>Sehir_Bolge</code>, <code>Hedefler</code>, <code>Urun_Listesi</code>, <code>Musteri_Ham</code>, <code>Bayi_Ocak</code>.</div>';
add('m-dili', {
  id: 'm-yaz', lv: 'B2', mod: 'Veri Hazırlama', min: 18,
  title: 'M kodu yazmaya başla: değerler, let, each, if, tür sistemi',
  sum: 'Gelişmiş Düzenleyici’de elle yazmak: değer türleri, let ve in, tembel değerlendirme, each ve alt çizgi, if, null kuralları, is ve as.',
  body: `<p><button class="lnk" data-lesson="m-dili">M dili</button> dersi arkadaki kodu okumayı öğretti. Bu derste kodu sen yazıyorsun.</p>${NOTE_M}
<h2>Her şey bir değer, her ifade bir sonuç</h2>
<p>M bir formül dilidir: komut sırası çalıştırmaz, tek bir ifadeyi değerlendirir. Değer türleri: null, logical, number, text, date, datetime, duration, binary, list, record, table, function, type.</p>
<pre class="m" data-run>let
    Tutar = 1000,
    Oran = 0.2,
    KDV = Tutar * Oran
in
    Tutar + KDV</pre>
<p><code>let</code> ara adlar tanımlar, <code>in</code> sonucu söyler. Uygulanan adımlar listesindeki her satır, let içindeki bir addır. Son adımdan sonra virgül olmaz; bu, elle yazarken en sık hatadır.</p>
<h2>Tembel değerlendirme</h2>
<p>M, gereken değeri hesaplar. Sonuçta kullanılmayan adım çalışmaz. Aşağıdaki kod hata vermez, çünkü <code>Kotu</code> hiç istenmiyor:</p>
<pre class="m" data-run>let
    Kotu = error "çalışsaydı patlardı",
    Iyi = 5
in
    Iyi</pre>
<p>Sıra da bağlayıcı değildir: adımlar birbirine adla bağlanır. Yine de okunurluk için sırayla yaz.</p>
<h2>each ve alt çizgi</h2>
<p><code>each</code>, tek parametreli fonksiyonun kısaltmasıdır: <code>each [Tutar] * 2</code> ile <code>(_) =&gt; _[Tutar] * 2</code> aynı şeydir. Köşeli parantez, <code>_</code> kaydının alanını okur. Listelerde alan yoktur, doğrudan <code>_</code> yazılır.</p>
<pre class="m" data-run>let
    Satirlar = Table.SelectRows(Satislar, each [Şehir] = "Ankara"),
    Ciftler = List.Select({1, 2, 3, 4}, each Number.IsEven(_))
in
    [Tablo = Table.RowCount(Satirlar), Liste = Ciftler]</pre>
<h2>null kuralları ve if</h2>
<ul><li>İşlemde null varsa sonuç null’dur: <code>1 + null</code> null döner.</li>
<li>Karşılaştırmada da: <code>[Tutar] &gt; 1000</code>, Tutar null ise null olur.</li>
<li><code>if</code> yalnız true ya da false kabul eder. <code>if null then</code> hata verir: <i>We cannot convert the value null to type Logical</i>.</li>
<li><code>Table.SelectRows</code> null sonucu olan satırı atar; bu yüzden filtre sessizce çalışır, Koşullu sütun ise aynı satırda hata verir.</li>
<li>Çözüm: önce null’u sına ya da <code>??</code> kullan: <code>([Tutar] ?? 0) &gt; 1000</code>.</li></ul>
<h2>Metin birleştirme ve tür dönüşümü</h2>
<p>M örtük tür dönüşümü yapmaz. <code>"Tutar: " &amp; 1250</code> hata verir; <code>Text.From(1250)</code> gerekir. Excel ve DAX alışkanlığının en çok çarptığı yer burasıdır. Büyük küçük harf de önemlidir: <code>table.addcolumn</code> tanınmaz.</p>
<h2>Tür sistemi: değer türü ve sütun türü</h2>
<p><code>x is number</code> sınar, <code>x as number</code> doğrular ve uymazsa hata verir. Fonksiyon parametresinde de aynı denetim çalışır. Sütun türü ayrı bir bilgidir: <code>Table.TransformColumnTypes</code> değerleri çevirir, <code>Table.AddColumn(..., type number)</code> ise yalnız etiket koyar, değeri çevirmez.</p>
<pre class="m" data-run>let
    Sinama = [Sayi = 5 is number, Metin = "5" is number, BosMetin = null is nullable text],
    Cevirme = Number.FromText("12.5") + 1
in
    [Sinama = Sinama, Cevirme = Cevirme]</pre>
<div class="warn"><b>Kültür</b>Metin sayıya ya da tarihe çevrilirken kültür belirleyicidir: <code>Table.TransformColumnTypes(t, {{"Tarih", type date}}, "tr-TR")</code>. Kültür vermezsen bilgisayarın bölge ayarı kullanılır, aynı kod başka makinede başka sonuç verebilir. Lab kültürsüz durumda tarihi kabul etmez, kültür ister.</div>`,
  ex: [
    { t: 'mcode', q: '<b>İlk let.</b> <code>Fiyat</code> = 250, <code>Adet</code> = 4, <code>Indirim</code> = 0.1 adlarını tanımla; sonuç indirimli toplam olsun.', start: 'let\n    Fiyat = 250,\n    Adet = 4,\n    Indirim = 0.1\nin\n    ', sol: 'let\n    Fiyat = 250,\n    Adet = 4,\n    Indirim = 0.1\nin\n    Fiyat * Adet * (1 - Indirim)', hint: 'Yalnız in satırını tamamla.' },
    { t: 'mcode', q: '<b>each ile filtre.</b> <code>Satislar</code> sorgusundan yalnız <code>Kategori</code> değeri Elektronik olan satırları döndür.', start: 'Table.SelectRows(Satislar, )', sol: 'Table.SelectRows(Satislar, each [Kategori] = "Elektronik")', must: ['Table.SelectRows'], hint: 'İkinci bağımsız değişken her satır için true ya da false döndürmeli: each [Kategori] = ...' },
    { t: 'mcode', q: '<b>Hatayı bul.</b> Kod çalışmıyor. <code>each</code> eksik. 1000’den büyük tutarlı satırları döndürecek şekilde düzelt.', start: 'let\n    Kaynak = Satislar,\n    Buyuk = Table.SelectRows(Kaynak, [Tutar] > 1000)\nin\n    Buyuk', sol: 'let\n    Kaynak = Satislar,\n    Buyuk = Table.SelectRows(Kaynak, each [Tutar] > 1000)\nin\n    Buyuk', must: ['each'], hint: 'Çalıştır: hata “_ tanınmıyor” der. Satır fonksiyonu each ister.' },
    { t: 'mcode', q: '<b>Hatayı bul.</b> Metin ve sayı birleşmiyor. Sonuç <code>"Toplam: 1250"</code> olacak.', start: 'let\n    Toplam = 1250\nin\n    "Toplam: " & Toplam', sol: 'let\n    Toplam = 1250\nin\n    "Toplam: " & Text.From(Toplam)', must: ['Text.From'], hint: 'M örtük çevirmez; & iki tarafta da metin ister.' },
    { t: 'mcode', q: '<b>null’a dayanıklı if.</b> <code>Satislar</code>’a <code>Boy</code> sütunu ekle: <code>Tutar</code> null ise Bilinmiyor, 1000’den büyükse Büyük, değilse Küçük.', start: 'Table.AddColumn(Satislar, "Boy", each )', sol: 'Table.AddColumn(Satislar, "Boy", each if [Tutar] = null then "Bilinmiyor" else if [Tutar] > 1000 then "Büyük" else "Küçük")', must: ['Table.AddColumn'], bad: ['Table.AddColumn(Satislar, "Boy", each if [Tutar] > 1000 then "Büyük" else "Küçük")'], hint: 'Önce null’u sına: null ile karşılaştırma if içinde hata verir. Sıralama önemli.' },
    { t: 'mcode', q: '<b>?? ile varsayılan.</b> <code>Satislar</code>’da null tutarlar 0 sayılacak. <code>TutarTL</code> sütunu ekle, türü sayı olsun.', sol: 'Table.AddColumn(Satislar, "TutarTL", each [Tutar] ?? 0, type number)', must: ['??'], hint: 'x ?? y: x null ise y. Dördüncü bağımsız değişken: type number.', start: 'Satislar', types: true },
    { t: 'mc', q: 'Şu kodun sonucu nedir?<pre class="m">let a = 2, b = error "x", c = a * 3 in c</pre>', o: ['6', 'Error: x', 'null', '2'], a: 0, why: 'M tembeldir: b hiç istenmediği için hesaplanmaz.' },
    { t: 'mc', q: 'Şu ifadenin sonucu nedir?<pre class="m">if 1 + null > 0 then "E" else "H"</pre>', o: ['"E"', '"H"', 'Hata: null, Logical türüne çevrilemez', 'null'], a: 2, why: '1 + null null olur, null > 0 da null. if yalnız mantıksal değer kabul eder, null hata verir.' },
    { t: 'mc', q: '<code>Table.AddColumn(t, "x", each [a] &amp; "TL", type number)</code> ne yapar?', o: ['Metni sayıya çevirir', 'Etiket koyar, değeri çevirmez', 'Hata verip sütunu eklemez', 'Sütunu metin yapar'], a: 1, why: 'Dördüncü bağımsız değişken sütuna etiket koyar, değeri çevirmez. Bu yüzden Desktop’ta yüklemede tür hatası çıkabilir. Değeri çevirmek için TransformColumnTypes ya da Number.From.' },
    { t: 'mc', q: '<code>each _ + 1</code> ile eşdeğer olan hangisi?', o: ['(x) => x + 1', '() => _ + 1', 'List.Transform(_, 1)', '_ => + 1'], a: 0, why: 'each, tek parametreli fonksiyonun kısaltmasıdır; parametrenin adı _ dir, ad değişse de anlam aynıdır.' },
    { t: 'mc', q: 'Şu kodun hatası nedir?<pre class="m">let\n    A = 1,\n    B = 2,\nin\n    A + B</pre>', o: ['in küçük harfle yazılmaz, IN olmalıdır', 'Son adımdan sonra virgül olmaz', 'A ve B tür belirtmeden tanımlanamaz', 'let tek satırda yazılmalı'], a: 1, why: 'Virgül adımları ayırır; son adımdan sonra virgül söz dizimi hatasıdır.' }
  ]
});

/* ---------- M: kayıt, liste, tablo ---------- */
add('m-yaz', {
  id: 'm-yapi', lv: 'B2', mod: 'Veri Hazırlama', min: 18,
  title: 'M’de kayıt, liste, tablo: yapıları kurmak ve gezmek',
  sum: 'Kayıt ve liste kurma, alan ve öğe erişimi, ? ile güvenli erişim, #table, Table.ToRecords, Record.Field ile değişken alan adı.',
  body: `<h2>Üç yapı, üç parantez</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Yapı</th><th>Kurma</th><th>Erişim</th><th>Karşılığı</th></tr></thead><tbody>
<tr><td>Liste</td><td><code>{1, 2, 3}</code>, <code>{1..12}</code></td><td><code>x{0}</code> (0’dan başlar)</td><td>Tablodaki bir sütun: <code>t[Şehir]</code></td></tr>
<tr><td>Kayıt</td><td><code>[Ad = "Ayşe", Yas = 30]</code></td><td><code>r[Ad]</code></td><td>Tablodaki bir satır: <code>t{0}</code></td></tr>
<tr><td>Tablo</td><td><code>#table({"a"}, {{1}})</code>, <code>Table.FromRecords</code></td><td><code>t{0}[a]</code>, <code>t{[a = 1]}</code></td><td>Sorgu sonucu</td></tr>
</tbody></table></div>
<p>Süslü parantez öğe, köşeli parantez alan okur. Bu ikisini ayırmak M’yi okumanın yarısıdır.</p>
<pre class="m" data-run>let
    Satir = Satislar{0},
    Sutun = Satislar[Tutar],
    Hucre = Satislar{0}[Şehir],
    Anahtar = Satislar{[SiparisNo = 1005]}[Tutar]
in
    [Ilk = Satir[Tarih], Adet = List.Count(Sutun), Hucre = Hucre, Anahtar = Anahtar]</pre>
<p>Sütun listedir, satır kayıttır: <code>Satislar[Tutar]</code> dediğinde liste işlevleri, <code>Satislar{0}</code> dediğinde kayıt işlevleri kullanılır. Kayıt alanı başka bir kayıt, liste ya da tablo olabilir; birleştirmeden sonra hücrede gördüğün Table ve Record yazısı bu yüzdendir.</p><h2>Soru işareti: bulunmazsa null</h2>
<p><code>r[x]</code> alan yoksa hata verir, <code>r[x]?</code> null döner. Listede de aynı: <code>{1, 2}{5}?</code>. Şeması oynak kaynaklarda işe yarar; ama yazım hatasını da gizler, her yere koyma.</p>
<h2>Tablo satırları kayıttır</h2>
<p><code>Table.ToRecords</code> tabloyu kayıt listesine çevirir. Satır fonksiyonunda eline gelen <code>_</code> de budur. Alan adı bir değişkendeyse köşeli parantez çalışmaz: <code>r[alan]</code> sabit “alan” adlı alanı okur. Değişken ad için <code>Record.Field</code> gerekir.</p>
<pre class="m" data-run>let
    Alan = "Bölge",
    Kayitlar = Table.ToRecords(Sehir_Bolge),
    Bolgeler = List.Transform(Kayitlar, each Record.Field(_, Alan))
in
    List.Distinct(Bolgeler)</pre>
<h2>Tabloyu elle kurmak</h2>
<pre class="m" data-run>#table(
    type table [Kod = text, Oran = number],
    {{"A", 0.1}, {"B", 0.2}}
)</pre>
<p>Küçük eşleme tablolarını Enter Data yerine böyle yazmak, kodun okunur ve karşılaştırılabilir kalmasını sağlar.</p>`,
  ex: [
    { t: 'mcode', q: '<b>Tek hücre.</b> <code>Satislar</code>’ın üçüncü satırındaki <code>Şehir</code> değerini döndür.', sol: 'Satislar{2}[Şehir]', hint: 'Satırlar 0’dan başlar. Önce {satır}, sonra [alan].', start: 'Satislar' },
    { t: 'mcode', q: '<b>Sütundan liste.</b> <code>Aylik_Satis</code>’ın <code>Tutar</code> sütununu listeye al ve topla. Sonuç tek sayı.', sol: 'List.Sum(Aylik_Satis[Tutar])', must: ['List.Sum'], hint: 't[Sütun] liste döndürür.', start: 'Aylik_Satis' },
    { t: 'mcode', q: '<b>Liste üret.</b> <code>{"Ç1", "Ç2", "Ç3", "Ç4"}</code> listesini 1..4 aralığından üret, elle yazma.', sol: 'List.Transform({1..4}, each "Ç" & Text.From(_))', must: ['List.Transform', '..'], hint: 'Her sayıyı metne çevirip başa Ç ekle.', start: '{1..4}' },
    { t: 'mcode', q: '<b>Tablo kur.</b> <code>Kod</code> (metin) ve <code>Oran</code> (sayı) sütunlu iki satırlık tablo kur: A 0.1 ve B 0.2. Türleri <code>type table</code> ile ver.', sol: '#table(\n    type table [Kod = text, Oran = number],\n    {{"A", 0.1}, {"B", 0.2}}\n) ', must: ['#table', 'type table'], types: true, hint: '#table(type table [...], {{...}, {...}})', start: '#table()' },
    { t: 'mcode', q: '<b>Değişken alan.</b> <code>Alan</code> adı bir değişkende. <code>Sehir_Bolge</code>’nin ilk satırından o alanı oku: Record.Field kullan.', start: 'let\n    Alan = "Bölge",\n    Satir = Sehir_Bolge{0}\nin\n    Satir[Alan]', sol: 'let\n    Alan = "Bölge",\n    Satir = Sehir_Bolge{0}\nin\n    Record.Field(Satir, Alan)', must: ['Record.Field'], hint: 'Satir[Alan], “Alan” adlı alanı arar, değişkene bakmaz.' },
    { t: 'mcode', q: '<b>Kayıtları gez.</b> <code>Sehir_Bolge</code>’yi kayıt listesine çevir, her kayıttan <code>"Şehir (Bölge)"</code> metni üret. Sonuç liste.', sol: 'List.Transform(Table.ToRecords(Sehir_Bolge), each [Şehir] & " (" & [Bölge] & ")")', must: ['Table.ToRecords'], ordered: true, hint: 'each içinde [Şehir] ve [Bölge] kayıttan okunur.', start: 'Table.ToRecords(Sehir_Bolge)' },
    { t: 'mcode', q: '<b>Güvenli erişim.</b> Kayıtta <code>Not</code> alanı olmayabilir. Yoksa null dönecek şekilde düzelt.', start: 'let\n    Kayit = [Ad = "Ayşe", Yas = 30]\nin\n    Kayit[Not]', sol: 'let\n    Kayit = [Ad = "Ayşe", Yas = 30]\nin\n    Kayit[Not]?', must: ['?'], hint: 'Alan erişiminin sonuna bir karakter.' },
    { t: 'mc', q: 'Sonuç nedir?<pre class="m">{10, 20, 30}{1}</pre>', o: ['10', '20', '30', 'Hata'], a: 1, why: 'Liste dizini 0’dan başlar; {1} ikinci öğedir.' },
    { t: 'mc', q: '<code>Satislar{[Şehir = "Ankara"]}</code> ne döndürür?', o: ['Ankara satırları tablosu', 'İlk Ankara satırı', 'Hata: birden çok eşleşme', 'null'], a: 2, why: 'Ankara’da üç satır var. Kayıtla satır arama tam bir eşleşme bekler; birden çok eşleşmede hata verir.' },
    { t: 'mc', q: '<code>let Alan = "Tutar" in Satislar{0}[Alan]</code> neden hata verir?', o: ['“Alan” adlı sütun aranır', 'Alan ayrılmış bir sözcüktür, ad olarak kullanılamaz', 'let içinde metin tanımlanamaz', 'Satır erişimi {0} ile değil [0] ile yapılır'], a: 0, why: 'Değişken adla erişim için Record.Field(Satislar{0}, Alan) ya da tablo için Table.Column kullanılır.' },
    { t: 'mc', q: 'Şu ikisinin farkı nedir?<pre class="m">t[Şehir]\nt[[Şehir]]</pre>', o: ['Fark yok', 'İlki liste, ikincisi tablo', 'İlki kayıt, ikincisi liste', 'İkincisi söz dizimi hatası'], a: 1, why: 'Çift köşeli parantez projeksiyondur: tablo kalır, yalnız o sütun seçilir.' }
  ]
});

/* ---------- M: Table.* ---------- */
add('m-yapi', {
  id: 'm-tablo', lv: 'B2', mod: 'Veri Hazırlama', min: 20,
  title: 'Table işlevlerini elle yazmak: grupla, pivot, unpivot, birleştir',
  sum: 'Table.Group, Table.Pivot, Table.UnpivotOtherColumns, Table.NestedJoin, Table.Transpose, Table.TransformColumns; şeridin ürettiği kodu sadeleştirmek.',
  body: `<h2>Adımlar tablo alır, tablo döndürür</h2>
<p>Table işlevlerinin ilk bağımsız değişkeni tablodur, sonucu da tablodur. Bu yüzden adımlar zincirlenir. Şeridin yazdığı kod çoğu zaman tek bir ifadeye indirilebilir, ama okunurluk için adlı adımları koru.</p>
<h2>Table.Group: agregasyon listesi</h2>
<p>Üçüncü bağımsız değişken <code>{ad, fonksiyon, tür}</code> listelerinin listesidir. Fonksiyona o grubun alt tablosu gelir; <code>[Tutar]</code> bu yüzden tek değer değil listedir.</p>
<pre class="m" data-run>Table.Group(
    Satislar,
    {"Şehir"},
    {
        {"Toplam", each List.Sum([Tutar]), type number},
        {"Sipariş", each Table.RowCount(_), Int64.Type}
    }
)</pre>
<div class="warn"><b>Tuzak</b>Fonksiyon <code>each _</code> olursa her grubun hücresine alt tablo düşer. “Tüm satırlar” seçeneği budur; ilk satırı alma ya da grup içi sıralama gibi kalıplar buna dayanır.</div>
<h2>Table.Pivot ve Table.UnpivotOtherColumns</h2>
<p>Pivot’un ikinci bağımsız değişkeni, sütun olacak değerlerin listesidir. Şerit bunu <code>List.Distinct(t[Ay])</code> diye yazar. Sabit liste yazarsan yeni ay sütun açmaz. Aşağıdaki kodda Ege’nin Mart’ı yoktur: o hücre null gelir.</p>
<pre class="m" data-run>Table.Pivot(Aylik_Satis, List.Distinct(Aylik_Satis[Ay]), "Ay", "Tutar", List.Sum)</pre>
<pre class="m" data-run>Table.UnpivotOtherColumns(Hedefler, {"Kategori"}, "Ay", "Hedef")</pre>
<p>Giyim’in Mart hücresi null olduğundan unpivot satırı üretmez: 12 yerine 11 satır çıkar. Bu Learn’deki davranıştır ve rapor toplamını değiştirmez ama satır sayısını şaşırtabilir.</p>
<h2>Birleştirme: NestedJoin ve genişletme</h2>
<pre class="m" data-run>let
    Birlesik = Table.NestedJoin(Bayi_Subat, {"Şehir"}, Sehir_Bolge, {"Şehir"}, "Eslesme", JoinKind.LeftOuter),
    Acik = Table.ExpandTableColumn(Birlesik, "Eslesme", {"Bölge"})
in
    Acik</pre>
<p><code>Table.NestedJoin</code> eşleşen satırları hücrede tablo olarak tutar, <code>Table.ExpandTableColumn</code> açar. Şeridin “Merge” komutu da aynı kodu üretir. <code>Table.Join</code> doğrudan düz sonuç verir ama aynı adlı sütunda hata verir.</p>
<h2>Sütun dönüştürme ve tür</h2>
<pre class="m" data-run>let
    Basliklar = Table.PromoteHeaders(Musteri_Ham),
    Temiz = Table.TransformColumns(Basliklar, {{"E-posta", Text.Lower, type text}, {"Ad Soyad", each Text.Proper(_, "tr-TR"), type text}}),
    Tipli = Table.TransformColumnTypes(Temiz, {{"MusteriNo", Int64.Type}}),
    Tekil = Table.Distinct(Tipli, {"MusteriNo"})
in
    Tekil</pre>
<p><code>TransformColumns</code> için alan adı <code>{"Sütun", fonksiyon, tür}</code> biçimindedir; fonksiyonun aldığı değer hücredir, satır değil. Bu yüzden <code>[Alan]</code> yazılmaz, <code>_</code> yazılır.</p>
<div class="tip"><b>Sadeleştirme</b>Uzun otomatik adların yerine kısa adlar kullan, gereksiz Changed Type adımlarını sil, aynı sütunu üç kez dönüştüren adımları birleştir. Kod kısalır, davranış aynı kalır.</div>`,
  ex: [
    { t: 'mcode', q: '<b>Grupla.</b> <code>Satislar</code>’ı <code>Kategori</code>’ye göre grupla: <code>Toplam</code> (Tutar toplamı) ve <code>Sipariş</code> (satır sayısı).', start: 'Table.Group(Satislar, {"Kategori"}, {\n    \n})', sol: 'Table.Group(Satislar, {"Kategori"}, {\n    {"Toplam", each List.Sum([Tutar]), type number},\n    {"Sipariş", each Table.RowCount(_), Int64.Type}\n})', must: ['Table.Group', 'List.Sum', 'Table.RowCount'], hint: 'Her agregasyon: {ad, fonksiyon, tür}. each içinde [Tutar] gruba ait listedir.' },
    { t: 'mcode', q: '<b>Pivot.</b> <code>Aylik_Satis</code>’ı bölge satırı, ay sütunu olacak şekilde çevir. Sütunlar sabit değil, veriden gelsin.', sol: 'Table.Pivot(Aylik_Satis, List.Distinct(Aylik_Satis[Ay]), "Ay", "Tutar", List.Sum)', must: ['Table.Pivot', 'List.Distinct'], bad: ['Aylik_Satis'], start: 'Aylik_Satis', hint: 'Table.Pivot(tablo, değerler, öznitelik sütunu, değer sütunu, toplama)' },
    { t: 'mcode', q: '<b>Unpivot.</b> <code>Hedefler</code> tablosunu uzun yap: <code>Kategori</code> kalsın, yeni sütunlar <code>Ay</code> ve <code>Hedef</code>. Sonra Giyim satırlarını çıkar.', start: 'let\n    Uzun = Hedefler\nin\n    Uzun', sol: 'let\n    Uzun = Table.UnpivotOtherColumns(Hedefler, {"Kategori"}, "Ay", "Hedef"),\n    Filtre = Table.SelectRows(Uzun, each [Kategori] <> "Giyim")\nin\n    Filtre', must: ['Table.UnpivotOtherColumns', 'Table.SelectRows'], hint: 'Önce UnpivotOtherColumns, sonra SelectRows.' },
    { t: 'mcode', q: '<b>Birleştir.</b> <code>Bayi_Subat</code>’a <code>Sehir_Bolge</code>’den <code>Bölge</code> sütununu getir. Sonra <code>Bölge</code>’ye göre <code>Toplam</code> tutarı hesapla.', sol: 'let\n    Birlesik = Table.NestedJoin(Bayi_Subat, {"Şehir"}, Sehir_Bolge, {"Şehir"}, "B", JoinKind.LeftOuter),\n    Acik = Table.ExpandTableColumn(Birlesik, "B", {"Bölge"}),\n    Ozet = Table.Group(Acik, {"Bölge"}, {{"Toplam", each List.Sum([Tutar]), type number}})\nin\n    Ozet', must: ['Table.NestedJoin', 'Table.ExpandTableColumn', 'Table.Group'], start: 'Bayi_Subat', hint: 'Üç adım: NestedJoin, ExpandTableColumn, Group.' },
    { t: 'mcode', q: '<b>Devrik.</b> <code>Hedefler</code>’in sütun adları kaybolmadan transpose alınmış hâlini döndür.', sol: 'Table.Transpose(Table.DemoteHeaders(Hedefler))', must: ['Table.Transpose', 'Table.DemoteHeaders'], bad: ['Table.Transpose(Hedefler)'], start: 'Table.Transpose(Hedefler)', hint: 'Önce başlıkları satıra indir.', ordered: true },
    { t: 'mcode', q: '<b>En büyük 3.</b> <code>Satislar</code>’da tutarı en büyük üç siparişin yalnız <code>SiparisNo</code> ve <code>Tutar</code> sütunlarını döndür. Sıra önemli: büyükten küçüğe.', sol: 'let\n    Sirali = Table.Sort(Satislar, {{"Tutar", Order.Descending}}),\n    Ilk = Table.FirstN(Sirali, 3)\nin\n    Table.SelectColumns(Ilk, {"SiparisNo", "Tutar"})', must: ['Table.Sort', 'Table.FirstN'], ordered: true, start: 'Satislar', hint: 'Sort, FirstN, SelectColumns.' },
    { t: 'mcode', q: '<b>Ay özeti.</b> <code>Satislar</code>’a <code>Ay</code> (Date.Month) ekle, <code>Ay</code>’a göre <code>Toplam</code> tutarı hesapla, aya göre artan sırala.', sol: 'let\n    Ayli = Table.AddColumn(Satislar, "Ay", each Date.Month([Tarih]), Int64.Type),\n    Ozet = Table.Group(Ayli, {"Ay"}, {{"Toplam", each List.Sum([Tutar]), type number}}),\n    Sirali = Table.Sort(Ozet, {{"Ay", Order.Ascending}})\nin\n    Sirali', must: ['Date.Month', 'Table.Group', 'Table.Sort'], ordered: true, start: 'Satislar', hint: 'List.Sum null’ları atlar; Mart’taki null satır toplamı bozmaz.' },
    { t: 'mcode', q: '<b>Hatayı bul.</b> Sütun dönüşümü çalışmıyor: <code>TransformColumns</code>’a hücre gelir, satır değil. E-postaları küçült.', start: 'let\n    B = Table.PromoteHeaders(Musteri_Ham),\n    K = Table.TransformColumns(B, {{"E-posta", each Text.Lower([E-posta]), type text}})\nin\n    K', sol: 'let\n    B = Table.PromoteHeaders(Musteri_Ham),\n    K = Table.TransformColumns(B, {{"E-posta", each Text.Lower(_), type text}})\nin\n    K', must: ['Text.Lower(_)'], hint: 'Hücre _ ile okunur. [E-posta] kayıt alanı arar; hem hücre metindir hem de tireli ad #"..." ister.' },
    { t: 'mc', q: 'Table.Group’un agregasyon fonksiyonuna ne gelir?', o: ['O grubun alt tablosu', 'Grubun anahtar değeri', 'Tablonun tamamı', 'Tek satırlık kayıt'], a: 0, why: 'Bu yüzden each List.Sum([Tutar]) çalışır: [Tutar] alt tablonun sütun listesidir.' },
    { t: 'mc', q: 'Pivot’ta değer listesini elle <code>{"Oca", "Şub"}</code> yazdın. Veriye Mar geldi. Ne olur?', o: ['Yeni sütun açılır', 'Sorgu hata verir', 'Mar sonuca girmez', 'Mar, Şub ile toplanır'], a: 2, why: 'Yalnız listedeki değerler sütun olur. Dinamik olması için List.Distinct(t[Ay]) gerekir; ama o zaman modelin sütunları da değişir.' },
    { t: 'mc', q: 'Şu kodun sonucundaki satır sayısı için hangisi doğrudur?<pre class="m">Table.NestedJoin(a, {"k"}, b, {"k"}, "x", JoinKind.LeftOuter)</pre>', o: ['b’de eşleşme kadar', 'a kadar satır', 'b kadar satır', 'a ile b’nin çarpımı'], a: 1, why: 'NestedJoin iç içe tablo üretir, satır sayısı a ile aynı kalır. Satır çoğalması ExpandTableColumn adımında olur.' },
    { t: 'mc', q: 'Aşağıdaki kod neden sıkça yanlış sonuç üretir?<pre class="m">Table.Distinct(Table.Sort(t, {{"Tarih", Order.Descending}}), {"MusteriNo"})</pre>', o: ['Distinct sıralama alamaz; kod hata verir', 'Sonuç her zaman doğrudur, sorun yoktur', 'Distinct tüm sütunlara bakar', 'Motor sırayı garanti etmez'], a: 3, why: 'Bilinen tuzak: motor adımları yeniden düzenleyebilir, sıra garanti edilmez. Grupla ve her grupta en büyük tarihi seç ya da önce Table.Buffer ile sıralı sonucu sabitle.' }
  ]
});

/* ---------- M: List, Text, Date ---------- */
add('m-tablo', {
  id: 'm-liste-metin', lv: 'B2', mod: 'Veri Hazırlama', min: 18,
  title: 'List, Text, Date: List.Accumulate, List.Generate, Text.Split',
  sum: 'Liste işlevleri ile döngü yerine katlama, List.Generate ile adım adım üretim, metin bölme ve ayıklama, tarih aritmetiği, takvim tablosu.',
  body: `<h2>M’de döngü yok, liste işlevi var</h2>
<p>M’de for ya da while yoktur. Yerine dört kalıp kullanırsın:</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>İş</th><th>İşlev</th><th>Örnek</th></tr></thead><tbody>
<tr><td>Her öğeyi dönüştür</td><td><code>List.Transform</code></td><td><code>List.Transform({1, 2}, each _ * 2)</code></td></tr>
<tr><td>Süz</td><td><code>List.Select</code></td><td><code>List.Select(x, each _ &gt; 0)</code></td></tr>
<tr><td>Tek değere indir</td><td><code>List.Accumulate</code></td><td>Bir toplam, birleşik metin, ardışık uygulama</td></tr>
<tr><td>Önceki değerden yenisini üret</td><td><code>List.Generate</code></td><td>Sayfalı API, ardışık tarihler</td></tr>
</tbody></table></div>
<h2>List.Accumulate</h2>
<p>Üç bağımsız değişken: liste, başlangıç durumu, <code>(durum, öğe) =&gt; yeni durum</code>. Durum yalnız sayı değildir: tablo olabilir. Bir sözlükteki tüm değişimleri sırayla bir sütuna uygulamak bunun klasik kullanımıdır.</p>
<pre class="m" data-run>let
    Degisim = {{"ist", "İstanbul"}, {"ank", "Ankara"}},
    Metin = "ist ve ank",
    Sonuc = List.Accumulate(Degisim, Metin, (durum, d) => Text.Replace(durum, d{0}, d{1}))
in
    Sonuc</pre>
<h2>List.Generate</h2>
<p>Dört bağımsız değişken: başlangıç (fonksiyon), devam koşulu, sonraki değer, isteğe bağlı seçici. Hepsi fonksiyondur; ilki bile <code>() =&gt;</code> ister. Koşul hiç yanlış olmazsa sorgu bitmez: burada durdurulur, gerçek motorda takılır.</p>
<pre class="m" data-run>List.Generate(() => 1, each _ &lt;= 100, each _ * 2)</pre>
<pre class="m" data-run>List.Generate(
    () => [Sayfa = 1, Toplam = 10],
    each [Sayfa] &lt;= 3,
    each [Sayfa = [Sayfa] + 1, Toplam = [Toplam] + 10],
    each [Toplam]
)</pre>
<h2>Metin</h2>
<p><code>Text.Split</code> liste döndürür, <code>{0}</code> ile parçaya erişilir. <code>Text.BeforeDelimiter</code>, <code>Text.AfterDelimiter</code>, <code>Text.Start</code>, <code>Text.Middle</code>, <code>Text.Replace</code>, <code>Text.Contains</code> en sık kullanılanlar. Büyük küçük harf için üçüncü bağımsız değişken: <code>Comparer.OrdinalIgnoreCase</code>. Türkçede <code>Text.Upper(x, "tr-TR")</code> kültürünü ver; yoksa i harfi I olur.</p>
<pre class="m" data-run>let
    Kod = "PTY-CM1090-LAX",
    P = Text.Split(Kod, "-")
in
    [Kalkis = P{0}, Sirket = Text.Start(P{1}, 2), Ucus = Text.End(P{1}, 4), Varis = P{2}]</pre>
<h2>Tarih</h2>
<p>Tarih aritmetiği süre (duration) ile yapılır: <code>#date(2024, 3, 1) - #date(2024, 2, 1)</code> 29 günlük süre verir. Gün eklemek için <code>Date.AddDays</code>. Takvim tablosu üretmek klasik bir M işidir; rapor için bir kez kurulur.</p>
<pre class="m" data-run>let
    Baslangic = #date(2024, 1, 1),
    Gunler = List.Dates(Baslangic, 5, #duration(1, 0, 0, 0)),
    T = Table.FromList(Gunler, Splitter.SplitByNothing(), {"Tarih"}),
    Tipli = Table.TransformColumnTypes(T, {{"Tarih", type date}}),
    Ay = Table.AddColumn(Tipli, "Ay Adı", each Date.MonthName([Tarih], "tr-TR"), type text)
in
    Ay</pre>
<h2>List.Buffer</h2>
<p><code>List.Buffer</code> listeyi bellekte sabitler. Filtrede <code>List.Contains</code> her satır için listeyi yeniden üretiyorsa bir kez arabelleğe almak ciddi hız kazandırabilir. Sonucu değiştirmez, yalnız değerlendirme davranışını değiştirir; bu yüzden Lab’de fark görünmez.</p>`,
  ex: [
    { t: 'mcode', q: '<b>List.Accumulate ile çarpım.</b> <code>{2, 3, 4}</code> listesinin çarpımını List.Accumulate ile hesapla.', start: 'List.Accumulate({2, 3, 4}, , )', sol: 'List.Accumulate({2, 3, 4}, 1, (d, x) => d * x)', must: ['List.Accumulate'], bad: ['List.Accumulate({2, 3, 4}, 0, (d, x) => d * x)'], hint: 'Çarpımda başlangıç 1 olmalı, 0 değil.' },
    { t: 'mcode', q: '<b>Sırayla değiştir.</b> <code>"kdv ve otv"</code> metninde <code>kdv</code> yerine <code>KDV</code>, <code>otv</code> yerine <code>ÖTV</code> yaz. Değişim listesini List.Accumulate ile uygula.', start: 'let\n    Degisim = {{"kdv", "KDV"}, {"otv", "ÖTV"}},\n    Metin = "kdv ve otv"\nin\n    Metin', sol: 'let\n    Degisim = {{"kdv", "KDV"}, {"otv", "ÖTV"}},\n    Metin = "kdv ve otv"\nin\n    List.Accumulate(Degisim, Metin, (m, d) => Text.Replace(m, d{0}, d{1}))', must: ['List.Accumulate', 'Text.Replace'], hint: 'Durum metindir; her adımda d{0} yerine d{1}.' },
    { t: 'mcode', q: '<b>List.Generate.</b> 1’den başlayıp ikiye katlayarak 100’ü geçmeyen sayıları üret: 1, 2, 4, ... 64.', start: 'List.Generate()', sol: 'List.Generate(() => 1, each _ <= 100, each _ * 2)', must: ['List.Generate'], hint: 'Başlangıç () => 1, koşul each _ <= 100, sonraki each _ * 2.' },
    { t: 'mcode', q: '<b>Seçicili List.Generate.</b> 1’den 5’e kadar yıl numaraları için 1000 anaparanın yüzde 10 bileşik büyümesini üret: <code>[Yil, Tutar]</code> durumu tut, sonuç yalnız yuvarlanmış tutar listesi (0 basamak).', sol: 'List.Generate(\n    () => [Yil = 1, Tutar = 1000],\n    each [Yil] <= 5,\n    each [Yil = [Yil] + 1, Tutar = [Tutar] * 1.1],\n    each Number.Round([Tutar], 0)\n)', must: ['List.Generate', 'Number.Round'], start: 'List.Generate()', hint: 'Dördüncü bağımsız değişken seçici. Kayıt içinde [Yil = [Yil] + 1] eski değeri okur.' },
    { t: 'mcode', q: '<b>Text.Split.</b> <code>"Ayşe Yılmaz;Ankara;34"</code> metninden <code>[Ad, Sehir, Yas]</code> kaydı üret, <code>Yas</code> sayı olsun.', start: 'let\n    Satir = "Ayşe Yılmaz;Ankara;34"\nin\n    Satir', sol: 'let\n    Satir = "Ayşe Yılmaz;Ankara;34",\n    P = Text.Split(Satir, ";")\nin\n    [Ad = P{0}, Sehir = P{1}, Yas = Number.From(P{2})]', must: ['Text.Split', 'Number.From'], hint: 'Parçalara P{0} ile eriş.' },
    { t: 'mcode', q: '<b>Ürün kodu.</b> <code>Urun_Listesi</code>’ne <code>Kod</code> sütunu ekle: <code>Ürün Kodu ve Adı</code> sütununda ilk boşluktan önceki parça.', sol: 'Table.AddColumn(Urun_Listesi, "Kod", each Text.BeforeDelimiter([Ürün Kodu ve Adı], " "), type text)', must: ['Text.BeforeDelimiter'], start: 'Urun_Listesi', hint: 'Boşluklu sütun adı köşeli parantezde doğrudan yazılır.' },
    { t: 'mcode', q: '<b>Liste ile filtre.</b> Marmara ve Ege şehirlerini <code>Sehir_Bolge</code>’den listeye al, <code>List.Buffer</code> ile sabitle, <code>Satislar</code>’ı bu listeye göre süz.', sol: 'let\n    Sehirler = List.Buffer(Table.SelectRows(Sehir_Bolge, each List.Contains({"Marmara", "Ege"}, [Bölge]))[Şehir]),\n    Sonuc = Table.SelectRows(Satislar, each List.Contains(Sehirler, [Şehir]))\nin\n    Sonuc', must: ['List.Buffer', 'List.Contains'], start: 'Satislar', hint: 'Önce şehir listesi, sonra List.Contains(Sehirler, [Şehir]).' },
    { t: 'mcode', q: '<b>Takvim.</b> 2024 Ocak’ın ilk 7 gününden tablo kur: <code>Tarih</code> (tarih türü) ve <code>Gün</code> (Date.DayOfWeekName, tr-TR).', sol: 'let\n    Gunler = List.Dates(#date(2024, 1, 1), 7, #duration(1, 0, 0, 0)),\n    T = Table.FromList(Gunler, Splitter.SplitByNothing(), {"Tarih"}),\n    Tipli = Table.TransformColumnTypes(T, {{"Tarih", type date}}),\n    Sonuc = Table.AddColumn(Tipli, "Gün", each Date.DayOfWeekName([Tarih], "tr-TR"), type text)\nin\n    Sonuc', must: ['List.Dates', 'Date.DayOfWeekName'], ordered: true, start: 'List.Dates(#date(2024, 1, 1), 7, #duration(1, 0, 0, 0))', hint: 'Table.FromList için Splitter.SplitByNothing() ver; yoksa değer metin sayılır.' },
    { t: 'mcode', q: '<b>Ay sonu farkı.</b> <code>#date(2024, 2, 10)</code> tarihinden ay sonuna kaç gün kaldığını sayı olarak döndür.', sol: 'let\n    T = #date(2024, 2, 10)\nin\n    Duration.Days(Date.EndOfMonth(T) - T)', must: ['Date.EndOfMonth', 'Duration.Days'], start: '#date(2024, 2, 10)', hint: 'Tarih eksi tarih süredir; Duration.Days ile sayıya çevir.' },
    { t: 'mc', q: 'Sonuç nedir?<pre class="m">List.Accumulate({1, 2, 3}, 10, (d, x) => d + x)</pre>', o: ['6', '16', '10', '11'], a: 1, why: 'Başlangıç 10, sonra 1, 2, 3 eklenir.' },
    { t: 'mc', q: 'Şu kodun sonucu nedir?<pre class="m">List.Generate(() => 3, each _ > 0, each _ - 1)</pre>', o: ['{3, 2, 1, 0}', '{2, 1, 0}', '{3, 2, 1}', 'Sonsuz döngü'], a: 2, why: 'Koşul her değer için üretimden önce sınanır: 0 geçemez, listeye girmez.' },
    { t: 'mc', q: '<code>List.Generate(1, each _ &lt; 3, each _ + 1)</code> neden hata verir?', o: ['Başlangıç değer değil fonksiyon olmalı: () => 1', 'Üçüncü bağımsız değişken each alamaz', 'Koşul each _ &lt;= 3 olmak zorundadır', 'List.Generate dört bağımsız değişken ister'], a: 0, why: 'İlk bağımsız değişkenin türü fonksiyondur. Learn’deki söz dizimi: initial as function.' },
    { t: 'mc', q: '<code>Text.Upper("istanbul")</code> kültür vermeden Türkçe kullanıcıya neden yanlış görünür?', o: ['Türkçe karakterde hata', 'Yalnız ilk harfi büyütür', 'Metni kısaltır', 'i harfi I olur, İ değil'], a: 3, why: 'Kültür, büyük küçük harf eşlemesini belirler. Sonuç bilgisayarın diline bağlı kalmasın diye kültürü açıkça ver.' },
    { t: 'mc', q: 'Bir sütunda bir sözlükteki 20 değişimi sırayla uygulamak istiyorsun. En iyi yol hangisi?', o: ['20 ayrı Replace Values adımı', 'List.Accumulate ile değişim listesini gezmek', 'Table.Pivot', 'Table.Transpose ile sözlüğü çevirip birleştirmek'], a: 1, why: 'List.Accumulate durumu her değişimde taşır; sözlük bir sorgu olarak yönetilebilir, adım sayısı artmaz.' }
  ]
});

/* ---------- M: özel fonksiyon ve parametre ---------- */
add('m-liste-metin', {
  id: 'm-fonksiyon', lv: 'C1', mod: 'Veri Hazırlama', min: 18,
  title: 'Özel fonksiyon ve parametre: tekrar eden işi tek yere toplamak',
  sum: 'Fonksiyon söz dizimi, isteğe bağlı parametre, tür denetimi, tablo alan fonksiyon, Invoke Custom Function, @ ile özyineleme, Manage Parameters, Create Function.',
  body: `<h2>Fonksiyon bir değerdir</h2>
<p>Parametreler parantezde, gövde <code>=&gt;</code> sonrasında. Tür yazmak isteğe bağlıdır ama hatayı erken yakalar. <code>optional</code> parametre verilmezse null olur, <code>??</code> ile varsayılan verilir.</p>
<pre class="m" data-run>let
    KdvEkle = (tutar as number, optional oran as nullable number) as number =>
        tutar * (1 + (oran ?? 0.2))
in
    [Varsayilan = KdvEkle(100), Yuzde10 = KdvEkle(100, 0.1)]</pre>
<h2>Sütunda çağırmak: Invoke Custom Function</h2>
<p>Şeritte <b>Sütun ekle → Genel → Invoke Custom Function</b>. Ürettiği kod:</p>
<pre class="m" data-run>let
    Sinif = (t as nullable number) as text =>
        if t = null then "Bilinmiyor" else if t > 1000 then "Büyük" else "Küçük",
    Sonuc = Table.AddColumn(Satislar, "Sınıf", each Sinif([Tutar]), type text)
in
    Sonuc</pre>
<p>Power BI’da fonksiyonu ayrı bir sorgu olarak tutarsın, adı <code>fnSinif</code> gibi olur, her sorgudan çağrılır. Lab’de tek kod kutusu olduğu için let içinde tanımlıyoruz.</p>
<h2>Tablo alan fonksiyon</h2>
<p>Fonksiyon tablo alıp tablo döndürebilir. Sütun adını parametre yapmak için <code>Table.Column</code> ya da <code>Record.Field</code> gerekir:</p>
<pre class="m" data-run>let
    Ozet = (t as table, kirilim as text, deger as text) as table =>
        Table.Group(t, {kirilim}, {{"Toplam", each List.Sum(Table.Column(_, deger)), type number}})
in
    Ozet(Satislar, "Kategori", "Tutar")</pre>
<h2>Özyineleme: @</h2>
<p>Fonksiyon kendine <code>@</code> ile başvurur. Learn’deki örnek faktöriyeldir. Sonsuz özyineleme burada durdurulur.</p>
<pre class="m" data-run>let
    fact = (num) => if num = 0 then 1 else num * @fact(num - 1)
in
    fact(5)</pre>
<h2>Parametreler</h2>
<p><b>Giriş → Manage Parameters</b> ad, tür ve geçerli değer ister. Arkada parametre sıradan bir sorgudur:</p>
<pre class="m" data-run>let
    EsikTutar = 1000 meta [IsParameterQuery = true, Type = "Number", IsParameterQueryRequired = true],
    Sonuc = Table.SelectRows(Satislar, each [Tutar] > EsikTutar)
in
    Sonuc</pre>
<p>Power BI’da <code>EsikTutar</code> ayrı sorgudur; burada aynı kutuya yazdık. <code>meta</code> kısmı değeri değiştirmez, arayüze “bu bir parametredir” der. Service’te anlam modeli ayarlarından değiştirilebilir, bu da geliştirme ve canlı sunucu arasında geçişi çözer.</p>
<h2>Şeritten fonksiyon üretmek</h2>
<p>Learn’ün önerdiği yol: Bir parametre, ona başvuran örnek sorgu, sonra sorguya sağ tık <b>Create Function</b>. Örnek sorguda yaptığın değişiklik fonksiyona yansır. Fonksiyonun kodunu elle değiştirirsen bu bağ kopar; düzenleyici de uyarır. Fonksiyona sonradan parametre eklersen çağıran adım hata verir: adımı yeniden aç, değeri gir.</p>
<div class="warn"><b>Performans ve katlama</b>Bir satır için fonksiyon çağırmak, özellikle fonksiyon kaynağa sorgu gönderiyorsa, kaynağa satır sayısı kadar istek demektir. Fonksiyon adımından sonraki adımlar da genellikle katlanmaz.</div>`,
  ex: [
    { t: 'mcode', q: '<b>İlk fonksiyon.</b> <code>Ort</code> adlı iki parametreli fonksiyon yaz: <code>(a, b)</code>’nin ortalaması. <code>Ort(2, 4)</code> sonucunu döndür.', start: 'let\n    Ort = \nin\n    Ort(2, 4)', sol: 'let\n    Ort = (a, b) => (a + b) / 2\nin\n    Ort(2, 4)', must: ['=>'], hint: '(a, b) => ...' },
    { t: 'mcode', q: '<b>İsteğe bağlı parametre.</b> <code>Yuvarla(x, optional b)</code> yaz: b verilmezse 0 basamak. Sonuç: <code>[A = Yuvarla(3.456), B = Yuvarla(3.456, 2)]</code>.', sol: 'let\n    Yuvarla = (x as number, optional b as nullable number) => Number.Round(x, b ?? 0)\nin\n    [A = Yuvarla(3.456), B = Yuvarla(3.456, 2)]', must: ['optional', '??'], start: 'let\n    Yuvarla = (x) => x\nin\n    [A = Yuvarla(3.456), B = Yuvarla(3.456, 2)]', hint: 'b ?? 0' },
    { t: 'mcode', q: '<b>Sütunda çağır.</b> <code>Etiket</code> fonksiyonu: tutarı null ise Yok, değilse <code>"Şehir: tutar"</code> metni üretsin. <code>Satislar</code>’a <code>Etiket</code> sütunu ekle. Fonksiyon iki parametre alsın: şehir ve tutar.', sol: 'let\n    Etiket = (s as text, t as nullable number) as text =>\n        if t = null then "Yok" else s & ": " & Text.From(t),\n    Sonuc = Table.AddColumn(Satislar, "Etiket", each Etiket([Şehir], [Tutar]), type text)\nin\n    Sonuc', must: ['=>', 'Table.AddColumn'], start: 'Satislar', hint: 'Text.From ile sayıyı çevir.' },
    { t: 'mcode', q: '<b>Tablo fonksiyonu.</b> <code>IlkN(t, kolon, n)</code> yaz: tabloyu <code>kolon</code>’a göre azalan sıralayıp ilk n satırı döndürsün. <code>IlkN(Satislar, "Adet", 2)</code> çağır.', sol: 'let\n    IlkN = (t as table, kolon as text, n as number) as table =>\n        Table.FirstN(Table.Sort(t, {{kolon, Order.Descending}}), n)\nin\n    IlkN(Satislar, "Adet", 2)', must: ['as table', 'Table.Sort', 'Table.FirstN'], ordered: true, start: 'let\n    IlkN = (t as table, kolon as text, n as number) as table => t\nin\n    IlkN(Satislar, "Adet", 2)', hint: 'Table.Sort sütun adını metin olarak alır; kolon değişkenini doğrudan ver.' },
    { t: 'mcode', q: '<b>Hatayı bul.</b> Özyineleme <code>@</code> istiyor. 1’den n’e toplamı veren <code>Topla(10)</code> çalışsın.', start: 'let\n    Topla = (n) => if n = 0 then 0 else n + Topla(n - 1)\nin\n    Topla(10)', sol: 'let\n    Topla = (n) => if n = 0 then 0 else n + @Topla(n - 1)\nin\n    Topla(10)', must: ['@Topla'], hint: 'Fonksiyon gövdesinde kendi adı görünmez; @ gerekir.' },
    { t: 'mcode', q: '<b>Parametre.</b> <code>AltSinir</code> parametresini <code>meta</code> ile tanımla (500, Number), <code>Satislar</code>’ı <code>Tutar &gt;= AltSinir</code> ile süz.', sol: 'let\n    AltSinir = 500 meta [IsParameterQuery = true, Type = "Number", IsParameterQueryRequired = true],\n    Sonuc = Table.SelectRows(Satislar, each [Tutar] >= AltSinir)\nin\n    Sonuc', must: ['meta', 'IsParameterQuery'], start: 'Satislar', hint: 'Değer meta [ ... ] biçimi.' },
    { t: 'mcode', q: '<b>Tür denetimi.</b> Fonksiyon metin geldiğinde hata vermeli, sessizce çalışmamalı. Parametreye tür ekle ve <code>try</code> ile hatayı yakalayıp <code>[HasError]</code> değerini döndür.', start: 'let\n    Iki = (x) => x * 2\nin\n    Iki("a")', sol: 'let\n    Iki = (x as number) => x * 2\nin\n    (try Iki("a"))[HasError]', must: ['as number', 'try'], hint: 'try ifade, HasError alanı olan kayıt döndürür.' },
    { t: 'mc', q: 'Şu kodun sonucu nedir?<pre class="m">let f = (x, optional y) => x + (y ?? 1) in f(2)</pre>', o: ['2', '3', 'null', 'Hata: y eksik'], a: 1, why: 'optional y verilmez, null gelir. y ?? 1 ile 1 olur, sonuç 3.' },
    { t: 'mc', q: 'Parametre sorgusundaki <code>meta [IsParameterQuery = true, ...]</code> ne işe yarar?', o: ['Değeri sayıya çevirir', 'Sorgunun yenilenmesini durdurur', 'Yalnız arayüze bilgi verir', 'Sorguyu katlanır yapar'], a: 2, why: 'meta, değere üst veri ekler. Parametre arayüzü ve anlam modeli ayarları bu bilgiyi okur.' },
    { t: 'mc', q: 'Create Function ile üretilen fonksiyonun kodunu Gelişmiş Düzenleyici’de elle değiştirdin. Ne olur?', o: ['Örnek sorguyla bağ kopar', 'Hiçbir fark olmaz', 'Fonksiyon silinir', 'Çağıran sorgular değişir'], a: 0, why: 'Learn: fonksiyon kodu doğrudan değiştirilirse örnek sorguyla bağ kopar; düzenleyici uyarı verir.' },
    { t: 'mc', q: 'Çağrılan fonksiyona sonradan zorunlu parametre ekledin. Invoked Custom Function adımı ne yapar?', o: ['Yeni parametreyi null kabul eder', 'Hata verir', 'Sessizce eski kodu çalıştırır', 'Sorguyu siler'], a: 1, why: 'Learn: yeni parametre sonrası adım hata gösterir, Uygulanan adımlarda açıp eksik değeri gir.' },
    { t: 'mc', q: 'Geliştirme ve canlı SQL sunucusu arasında geçiş için en doğru yöntem hangisi?', o: ['Her sorgunun Kaynak adımını elle değiştirmek', 'İki ayrı .pbix tutmak ve her değişikliği iki dosyada aynı anda yapmak', 'Sunucu adını metin parametresi yapıp Sql.Database’e vermek', 'Value.NativeQuery ile sunucu adını sorgu metnine gömmek'], a: 2, why: 'Parametre tek noktadan yönetilir, Service’te anlam modeli ayarlarından da değiştirilir.' }
  ]
});

/* ---------- M: klasör ve Binary ---------- */
add('m-fonksiyon', {
  id: 'm-klasor', lv: 'C1', mod: 'Veri Hazırlama', min: 15,
  title: 'Klasörden dosya birleştirme: Folder.Files, Binary, yardımcı sorgular',
  sum: 'Folder.Files çıktısı, Content sütunundaki Binary, Csv.Document, fonksiyonla okuma ve genişletme; Combine Files’ın yardımcı sorguları ve tipik tuzaklar.',
  body: `<h2>Combine Files ne yapar?</h2>
<p>Klasör bağlayıcısı dosya başına bir satır getirir. Şerit <b>Combine</b> ile bir örnek dosya seçer, o dosyadaki temizliği fonksiyona çevirir ve her dosyaya uygular. Yardımcı sorgular grubunda örnek dosya, parametre, işlev ve <b>Transform Sample file</b> oluşur. Sen temizliği yalnız bu örnek sorguda yaparsın.</p>
<div class="note"><b>Benzetim</b>Lab gerçek diske bağlanmaz. <code>Folder.Files("C:\\Veri\\Satis")</code> üç aylık CSV ve bir notlar dosyasından oluşan sabit bir klasör döndürür; dosya içeriği <code>Binary</code> olarak taşınır. Gerçek Binary’nin bayt işlemleri, Excel.Workbook ve kodlama seçenekleri alt küme dışındadır. Mantık gerçek klasör birleştirmeyle aynıdır.</div>
<h2>Elle yazılışı</h2>
<pre class="m" data-run>Folder.Files("C:\\Veri\\Satis")</pre>
<p>Learn: Folder.Files klasördeki ve alt klasörlerdeki her dosya için bir satır, özellikler ve içeriğe bağlantı döndürür. Dört adım var: dosyaları süz, tek dosyayı okuyan fonksiyon yaz, her satırda çağır, genişlet.</p>
<pre class="m" data-run>let
    Dosyalar = Folder.Files("C:\\Veri\\Satis"),
    Csvler = Table.SelectRows(Dosyalar, each [Extension] = ".csv"),
    Oku = (ikili as binary) as table =>
        Table.PromoteHeaders(Csv.Document(ikili, [Delimiter = ";"])),
    Okunan = Table.AddColumn(Csvler, "Veri", each Oku([Content])),
    Sade = Table.SelectColumns(Okunan, {"Name", "Veri"}),
    Acik = Table.ExpandTableColumn(Sade, "Veri", {"Tarih", "Bayi", "Tutar"}),
    Tipli = Table.TransformColumnTypes(Acik, {{"Tarih", type date}, {"Tutar", type number}})
in
    Tipli</pre>
<p><code>Name</code> sütununu tutmak iyi alışkanlıktır: Combine Files bunun için <code>Source.Name</code> sütununu üretir, hatalı satırın hangi dosyadan geldiğini gösterir.</p>
<h2>Tipik tuzaklar</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr></thead><tbody>
<tr><td>Fazladan null satırlar</td><td>Klasördeki yabancı dosya da okundu</td><td>Combine yerine Transform data ile önce uzantıya ve ada göre süz</td></tr>
<tr><td><i>The column 'Column1' of the table wasn't found</i></td><td>Örnek sorguda başlık yükselttin, çıktı sorgusundaki eski tür adımı Column1’i arıyor</td><td>O adımı Uygulanan adımlardan sil</td></tr>
<tr><td>Bir dosyada sütun eksik</td><td>Yeni dosyanın şeması farklı</td><td>Genişletmede null gelir ya da tür adımı hata verir; dosya sözleşmesi koy, <code>Name</code> ile bul</td></tr>
<tr><td>Yeni sütun gelmiyor</td><td>ExpandTableColumn’daki sütun listesi kalıcıdır</td><td>Listeyi kodda güncelle ya da <code>Table.ColumnNames</code> ile dinamik üret</td></tr>
<tr><td>Türler Herhangi geliyor</td><td>Birleşik sütunların türü yok</td><td>Son adım tür ver</td></tr>
<tr><td>Sonuç filtre listesinde eksik görünüyor</td><td>Liste eksik olabilir uyarısı</td><td>Load more ile genişlet, sonra karar ver</td></tr>
</tbody></table></div>
<h2>Klasör yolunu parametre yap</h2>
<p>Yolu parametre yaparsan başka makine ve bulutta çalışır. Bulutta paylaşılmış klasör için <code>SharePoint.Files</code> ve ağ geçidi gerekir; yerel yol Service’te ağ geçidi ister. Çok dosyada Learn’ün tavsiyesi: filtreyi erken uygula, yalnız gereken dosyaları oku.</p>`,
  ex: [
    { t: 'mcode', q: '<b>Dosyaları listele.</b> <code>Folder.Files("C:\\Veri\\Satis")</code> sonucundan yalnız <code>.csv</code> dosyalarının <code>Name</code> listesini döndür.', start: 'Folder.Files("C:\\Veri\\Satis")', sol: 'Table.SelectRows(Folder.Files("C:\\Veri\\Satis"), each [Extension] = ".csv")[Name]', must: ['Folder.Files', '[Extension]'], ordered: true, hint: 'Süz, sonra [Name] ile sütunu liste al.' },
    { t: 'mcode', q: '<b>Tek dosya oku.</b> <code>File.Contents("C:\\Veri\\Satis\\satis_2024_01.csv")</code> dosyasını <code>;</code> ile ayrılmış CSV olarak oku, ilk satırı başlık yap.', sol: 'Table.PromoteHeaders(Csv.Document(File.Contents("C:\\Veri\\Satis\\satis_2024_01.csv"), [Delimiter = ";"]))', must: ['Csv.Document', 'Table.PromoteHeaders'], start: 'File.Contents("C:\\Veri\\Satis\\satis_2024_01.csv")', hint: 'Csv.Document(ikili, [Delimiter = ";"])' },
    { t: 'mcode', q: '<b>Birleştir.</b> Klasördeki CSV’leri tek tabloda topla. Sütunlar: <code>Name</code>, <code>Tarih</code>, <code>Bayi</code>, <code>Tutar</code>. <code>Tarih</code> ve <code>Tutar</code> doğru türde olsun.', sol: 'let\n    Dosyalar = Table.SelectRows(Folder.Files("C:\\Veri\\Satis"), each [Extension] = ".csv"),\n    Oku = (b as binary) as table => Table.PromoteHeaders(Csv.Document(b, [Delimiter = ";"])),\n    Okunan = Table.AddColumn(Dosyalar, "Veri", each Oku([Content])),\n    Sade = Table.SelectColumns(Okunan, {"Name", "Veri"}),\n    Acik = Table.ExpandTableColumn(Sade, "Veri", {"Tarih", "Bayi", "Tutar"}),\n    Tipli = Table.TransformColumnTypes(Acik, {{"Tarih", type date}, {"Tutar", type number}})\nin\n    Tipli', must: ['Folder.Files', 'Table.ExpandTableColumn', 'Table.TransformColumnTypes'], types: true, start: 'let\n    Dosyalar = Folder.Files("C:\\Veri\\Satis")\nin\n    Dosyalar', hint: 'Süz, oku, çağır, seç, genişlet, tür ver. Ondalık nokta olduğu için kültür gerekmez.' },
    { t: 'mcode', q: '<b>Hatayı bul.</b> Çıktıda fazladan satır ve null değerler var. Yabancı dosyayı kod içinde süzerek düzelt, sonuçta yalnız satış satırları kalsın.', start: 'let\n    Dosyalar = Folder.Files("C:\\Veri\\Satis"),\n    Okunan = Table.AddColumn(Dosyalar, "Veri", each Table.PromoteHeaders(Csv.Document([Content], [Delimiter = ";"]))),\n    Sade = Table.SelectColumns(Okunan, {"Name", "Veri"}),\n    Acik = Table.ExpandTableColumn(Sade, "Veri", {"Tarih", "Bayi", "Tutar"})\nin\n    Acik', sol: 'let\n    Dosyalar = Table.SelectRows(Folder.Files("C:\\Veri\\Satis"), each [Extension] = ".csv"),\n    Okunan = Table.AddColumn(Dosyalar, "Veri", each Table.PromoteHeaders(Csv.Document([Content], [Delimiter = ";"]))),\n    Sade = Table.SelectColumns(Okunan, {"Name", "Veri"}),\n    Acik = Table.ExpandTableColumn(Sade, "Veri", {"Tarih", "Bayi", "Tutar"})\nin\n    Acik', must: ['[Extension]'], hint: 'okubeni.txt de okunuyor. Süzgeç en başa.' },
    { t: 'mcode', q: '<b>Dosya başına özet.</b> Her dosya için <code>Name</code> ve <code>Satır</code> (satır sayısı). Yalnız CSV’ler.', sol: 'let\n    Dosyalar = Table.SelectRows(Folder.Files("C:\\Veri\\Satis"), each [Extension] = ".csv"),\n    Sayi = Table.AddColumn(Dosyalar, "Satır", each Table.RowCount(Table.PromoteHeaders(Csv.Document([Content], [Delimiter = ";"]))), Int64.Type)\nin\n    Table.SelectColumns(Sayi, {"Name", "Satır"})', must: ['Table.RowCount'], start: 'Folder.Files("C:\\Veri\\Satis")', hint: 'Kontrol sorgusu: satır sayıları dosya büyüklüğüyle tutuyor mu?' },
    { t: 'mc', q: 'Folder.Files’ın <code>Content</code> sütununda ne vardır?', o: ['Dosyanın metni', 'Binary: yorumlanmamış içerik', 'Dosyanın tam yolu', 'Boyut bilgisi'], a: 1, why: 'Binary, yorumlanmamış içeriktir. Hangi biçim olduğunu okuyucu işlev belirler.' },
    { t: 'mc', q: 'Örnek sorguda başlık yükselttikten sonra çıktı sorgusunda “Column1 wasn’t found” hatası çıktı. Ne yapmalısın?', o: ['Klasördeki dosyaları yeniden adlandır', 'Örnek dosyayı değiştir', 'Eski tür adımını sil', 'Kapat ve Uygula’yı iki kez çalıştır'], a: 2, why: 'Learn’ün CSV birleştirme örneğindeki durum budur: çıktıdaki eski adım Column1’i arıyor. Adım silinir, tür yeniden verilir.' },
    { t: 'mc', q: 'Klasöre bir sonraki ay farklı başlıklı dosya düştü. Combine Files’ın işlevine göre ne beklersin?', o: ['Sütunlar null ya da hata gelir', 'Yeni sütunlar otomatik eklenir', 'Yenileme bu dosyayı atlar ve uyarı vermez', 'Power BI örnek dosyayı yeni dosyayla değiştirir'], a: 0, why: 'Bir şablon herkese uygulanır. Bu yüzden dosya yapısı sözleşme gibidir; Name sütunuyla sorunlu dosya bulunur.' },
    { t: 'mc', q: 'Örnek dosyada temizliği nerede yapmalısın?', o: ['Çıktı sorgusunda dosya başına', 'Transform Sample file sorgusunda', 'İşlev kodunda elle', 'Klasördeki dosyalarda Excel’le tek tek'], a: 1, why: 'Yardımcı sorgular grubunda örnek sorgu işlevi besler. İşlevi elle değiştirince bu bağ kopar.' }
  ]
});

/* ---------- M: hata yönetimi ---------- */
add('m-klasor', {
  id: 'm-hata', lv: 'C1', mod: 'Veri Hazırlama', min: 15,
  title: 'M’de hata yönetimi: try, otherwise, catch, error, hata hücreleri',
  sum: 'Adım hatası ve hücre hatası, try sonuç kaydı, otherwise ve catch, error ile kendi hatanı üretmek, hata günlüğü sorgusu, try’ın yakalamadığı ertelenmiş hata.',
  body: `<h2>İki tür hata</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Tür</th><th>Örnek</th><th>Davranış</th></tr></thead><tbody>
<tr><td><b>Adım düzeyi</b></td><td>Olmayan sütun, olmayan dosya</td><td>Sorgu durur, sonuç yok</td></tr>
<tr><td><b>Hücre düzeyi</b></td><td>Metni sayıya çevirme, null ile if</td><td>Satır kalır, hücre Error olur. Yüklemede satır hatası sayılır.</td></tr>
</tbody></table></div>
<h2>try</h2>
<p><code>try x</code> kayıt döndürür: başarılıysa <code>[HasError = false, Value = x]</code>, değilse <code>[HasError = true, Error = hata]</code>. Hata da bir kayıttır: <code>Reason</code>, <code>Message</code>, <code>Detail</code>.</p>
<pre class="m" data-run>let
    Iyi = try 1 + 1,
    Kotu = try "a" + 1
in
    [Iyi = Iyi[Value], Mesaj = Kotu[Error][Message], Neden = Kotu[Error][Reason]]</pre>
<div class="note"><b>Belgede küçük bir tutarsızlık</b>M dil belirtimi anlatımda <code>HasErrors</code> yazar, aynı sayfadaki örnekler <code>x[HasError]</code> kullanır. Biz örnekleri izledik.</div>
<h2>otherwise ve catch</h2>
<p><code>try x otherwise y</code> hatada y döndürür. Hepsini tek değere bağlamak en kısa yoldur ama nedeni kaybettirir. <code>catch (e) =&gt; ...</code> hata kaydını da verir:</p>
<pre class="m" data-run>let
    Ham = #table({"Kod", "Tutar"}, {{"A", "120"}, {"B", "yok"}, {"C", "75"}}),
    Sayi = Table.AddColumn(Ham, "Sayi", each try Number.From([Tutar]) otherwise null, type number),
    Neden = Table.AddColumn(Sayi, "Neden", each try Number.From([Tutar]) catch (e) => e[Reason])
in
    Neden</pre>
<h2>error: kendi hatanı üret</h2>
<p>Bir iş kuralı bozulduğunda sessizce devam etmek yerine hata üret: <code>error "metin"</code>, <code>error Error.Record("Neden", "Mesaj", ayrıntı)</code>. Beklenmeyen durumda durmak, yanlış raporu paylaşmaktan iyidir.</p>
<pre class="m" data-run>let
    Kontrol = (t as table) as table =>
        if Table.IsEmpty(t) then error Error.Record("VeriYok", "Tablo boş geldi", null) else t,
    Sonuc = try Kontrol(Table.FirstN(Satislar, 0))
in
    Sonuc[Error][Reason]</pre>
<h2>Hata satırlarını bulmak</h2>
<p><code>Table.SelectRowsWithErrors</code> yalnız hatalı satırları, <code>Table.RemoveRowsWithErrors</code> geri kalanını verir. Uygun desen: asıl sorgu temiz satırları yükler, ikinci sorgu hatalı satırları bir denetim sayfasına yükler. Hataları silmek toplamı sessizce küçültür; hangi satırların gittiğini izle.</p>
<pre class="m" data-run>let
    Ham = #table({"Kod", "Tutar"}, {{"A", "120"}, {"B", "yok"}}),
    Tipli = Table.TransformColumnTypes(Ham, {{"Tutar", type number}})
in
    [Temiz = Table.RowCount(Table.RemoveRowsWithErrors(Tipli)), Hatali = Table.RowCount(Table.SelectRowsWithErrors(Tipli))]</pre>
<h2>Ertelenmiş hata tuzağı</h2>
<p>M tembeldir: <code>try</code> yalnız o an değerlendirdiğini yakalar. Kayıt alanının içindeki hata, alan okununcaya kadar oluşmaz. Learn’deki örnek:</p>
<pre class="m" data-notry>let
    f = (x) => [a = error "bad", b = x],
    g = try f(42) otherwise 123
in
    g[a]  // yine de error "bad"</pre>
<p>Çözüm, hatayı olduğu yerde ele almak: alanın içinde <code>try</code> kullan.</p>
<h2>Karar tablosu</h2>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Durum</th><th>Yöntem</th></tr></thead><tbody>
<tr><td>Bilinen, zararsız değer (“-”, “yok”)</td><td>Tür öncesi Replace Values ile null</td></tr>
<tr><td>Az sayıda bozuk satır ve kaynak düzeltilemiyor</td><td><code>try ... otherwise null</code> ve hata günlüğü sorgusu</td></tr>
<tr><td>İş kuralı bozuldu</td><td><code>error</code> ile dur</td></tr>
<tr><td>Hücre hatası toplamı etkilemez ama bilinmeli</td><td>Replace Errors değil, ayrı sütunda <code>Neden</code></td></tr>
</tbody></table></div>`,
  ex: [
    { t: 'mcode', q: '<b>otherwise.</b> <code>try</code> ile <code>Number.From("abc")</code> hatasında 0 döndür.', sol: 'try Number.From("abc") otherwise 0', must: ['try', 'otherwise'], start: 'Number.From("abc")', hint: 'try ifade otherwise yedek.' },
    { t: 'mcode', q: '<b>Sütunda try.</b> <code>Ham</code> tablosuna <code>Sayi</code> sütunu ekle: <code>Tutar</code> sayıya çevrilemezse null.', start: 'let\n    Ham = #table({"Kod", "Tutar"}, {{"A", "120"}, {"B", "yok"}, {"C", "75"}})\nin\n    Ham', sol: 'let\n    Ham = #table({"Kod", "Tutar"}, {{"A", "120"}, {"B", "yok"}, {"C", "75"}})\nin\n    Table.AddColumn(Ham, "Sayi", each try Number.From([Tutar]) otherwise null, type number)', must: ['try', 'Table.AddColumn'], hint: 'each try Number.From([Tutar]) otherwise null' },
    { t: 'mcode', q: '<b>Hata mesajını oku.</b> <code>"a" + 1</code> ifadesinin hata kaydından <code>Reason</code> değerini döndür.', sol: '(try "a" + 1)[Error][Reason]', must: ['try', '[Error]'], start: '"a" + 1', hint: 'Parantezle kaydı al: (try ...)[Error][Reason]' },
    { t: 'mcode', q: '<b>catch.</b> Tutar çevrilemezse <code>Durum</code> sütununa hata nedenini, çevrilirse <code>"Tamam"</code> yaz. <code>catch</code> kullan.', start: 'let\n    Ham = #table({"Kod", "Tutar"}, {{"A", "120"}, {"B", "yok"}})\nin\n    Ham', sol: 'let\n    Ham = #table({"Kod", "Tutar"}, {{"A", "120"}, {"B", "yok"}})\nin\n    Table.AddColumn(Ham, "Durum", each if (try Number.From([Tutar]))[HasError] then (try Number.From([Tutar]) catch (e) => e[Reason]) else "Tamam")', must: ['catch', 'HasError'], hint: 'Önce [HasError] ile sına, hatadaysa catch (e) => e[Reason].' },
    { t: 'mcode', q: '<b>İş kuralı.</b> <code>Dogrula</code> fonksiyonu tutar 0’dan küçükse <code>"Negatif tutar"</code> iletisiyle hata üretsin, değilse tutarı döndürsün. Sonuç: <code>Dogrula(-5)</code> için try ile <code>Message</code> alanı.', sol: 'let\n    Dogrula = (t as number) as number => if t < 0 then error "Negatif tutar" else t\nin\n    (try Dogrula(-5))[Error][Message]', must: ['error', 'try'], start: 'let\n    Dogrula = (t as number) as number => t\nin\n    Dogrula(-5)', hint: 'error "metin" bir kayıt üretir; Message alanında metin olur.' },
    { t: 'mcode', q: '<b>Hata günlüğü.</b> <code>Bayi_Ocak</code>’tan ilk satırı atla, başlık yükselt, <code>Tarih</code>’i <code>tr-TR</code> ile tarihe çevir. Tarih çevrimi hatalı satırları döndür; yalnız <code>Bayi</code> sütunu kalsın.', sol: 'let\n    A = Table.PromoteHeaders(Table.Skip(Bayi_Ocak, 1)),\n    Tipli = Table.TransformColumnTypes(A, {{"Tarih", type date}}, "tr-TR"),\n    Hatali = Table.SelectRowsWithErrors(Tipli, {"Tarih"})\nin\n    Table.SelectColumns(Hatali, {"Bayi"})', must: ['Table.SelectRowsWithErrors'], start: 'Bayi_Ocak', hint: 'Table.SelectRowsWithErrors(t, {"Tarih"})' },
    { t: 'mc', q: 'Sonuç nedir?<pre class="m">let x = try error "A" in x[HasError]</pre>', o: ['true', 'false', '"A"', 'Hata'], a: 0, why: 'try hatayı kayda çevirir, sorgu devam eder.' },
    { t: 'mc', q: 'Sonuç nedir?<pre class="m">try error "A" otherwise error "B"</pre>', o: ['"A"', 'Hata: B', 'null', '"B" metni'], a: 1, why: 'Yedek ifade de hata verirse o hata yukarı çıkar.' },
    { t: 'mc', q: 'Aşağıdaki kod neden yine hata verir?<pre class="m">let f = (x) => [a = error "bad", b = x], g = try f(42) otherwise 123 in g[a]</pre>', o: ['otherwise’ün değeri sayı olamaz', 'Alan, try bittikten sonra okunur', 'Kayıtta error kullanılamaz', 'f, try’a verilemez'], a: 1, why: 'Learn’deki uyarı: kayıt alanları tembeldir, hata alan okunurken oluşur. Hatayı üretildiği yerde ele al.' },
    { t: 'mc', q: 'Raporda toplam biraz düşük. Sorgunun sonunda Remove Errors adımı var. Doğru yaklaşım hangisi?', o: ['Adımı olduğu gibi bırak; hatalı satır zaten bozuktur', 'Remove Errors yerine Replace Errors ile 0 yaz; satır sayısı korunur', 'Hatalı satırları ayrıca görünür kıl', 'Sorguya Table.Buffer ekleyip hatanın kaybolmasını bekle'], a: 2, why: 'Sessiz silme toplamı küçültür, 0 yazmak da sorunu gizler. Önce hangi satırların gittiğini gör.' },
    { t: 'mc', q: 'Hangisi adım düzeyi bir hatadır?', o: ['Metni sayıya çevirirken “yok” hücresi', 'Olmayan sütuna başvurmak', 'if içinde null karşılaştırması', 'Number.From ile çevrilemeyen tek hücre'], a: 1, why: 'Sütun bulunamayınca sorgu durur. Ötekiler o hücrede Error olur, satır kalır.' }
  ]
});

/* ---------- M: katlama ve performans ---------- */
add('m-hata', {
  id: 'm-performans', lv: 'C1', mod: 'Veri Hazırlama', min: 18,
  title: 'Sorgu katlama, Table.Buffer, performans, Value.NativeQuery',
  sum: 'Tam, kısmi ve hiç katlama; katlamayı bozan adımlar; Table.Buffer ve List.Buffer ne zaman; Sorgu tanılaması; Value.NativeQuery ile parametreli SQL ve riskleri.',
  body: `<div class="warn"><b>Bu dersin sınırı</b>Yorumlayıcı kaynağa bağlanmadığı için katlama burada gözlenemez. Bu ders kavram ve karar öğretir. Kod blokları salt okunurdur ya da sonucu değil söz dizimini gösterir. Gerçek sınama için Power BI Desktop ve bir SQL kaynağı gerekir.</div>
<h2>Sorgu katlama</h2>
<p>Learn: Sorgu katlama, Power Query’nin dönüşümleri tek bir kaynak sorgusuna (örneğin tek bir <code>SELECT</code>) çevirmesidir. DirectQuery ve Dual tablolarda zorunludur. Import’ta en iyi yenileme performansını verir. Üç sonuç vardır: tam katlama, kısmi katlama (bir noktaya kadar kaynak, sonrası motor), katlama yok.</p>
<pre class="m">let
    Kaynak = Sql.Database("srv", "AnadoluMarket"),
    Satis = Kaynak{[Schema = "dbo", Item = "Satislar"]}[Data],
    Filtre = Table.SelectRows(Satis, each [Tarih] >= #date(2024, 1, 1)),   // katlanır
    Sutun = Table.SelectColumns(Filtre, {"Tarih", "Tutar"}),               // katlanır
    Grup = Table.Group(Sutun, {"Tarih"}, {{"T", each List.Sum([Tutar])}}), // katlanır
    Dizin = Table.AddIndexColumn(Grup, "Sıra", 1, 1)                       // çoğu kaynakta katlanmaz
in
    Dizin</pre>
<h2>Nasıl anlarsın?</h2>
<ul><li>Adıma sağ tık, <b>View Native Query</b>. Soluk ise o adım büyük olasılıkla katlanmıyordur; ama kesin kanıt değildir.</li>
<li>Power Query Online’da <b>katlama göstergeleri</b> adım yanında durum gösterir.</li>
<li><b>Araçlar → Diagnose Step</b> kaynağa gönderilen sorguyu <code>Data Source Query</code> sütununda gösterir (bağlayıcıya bağlıdır).</li>
<li><code>Value.Metadata</code> ile gezinmeye gerek yok: kaynakta SQL Profiler ya da benzeri izleme kesin sonuç verir.</li></ul>
<h2>Katlamayı koruyan düzen</h2>
<ol><li>Filtre ve sütun seçimini en başa al. Learn: akış işlemleri önce, pahalı işlemler sona.</li>
<li>Katlanmayan adımı bul, sonrasındaki adımları önüne alabiliyorsan al.</li>
<li>Özel M fonksiyonu, Text.Proper gibi kaynakta karşılığı olmayan işlevler, farklı kaynakları birleştirmek, Dizin ve Table.Buffer katlamayı genellikle bozar.</li>
<li>Bir SELECT ile yapılabilecek işi görünüm olarak veri tabanına taşı.</li>
<li>Artımlı yenileme filtre katlanmazsa anlamını yitirir; önce katlamayı doğrula.</li></ol>
<h2>Table.Buffer ve List.Buffer</h2>
<p><code>Table.Buffer</code> tabloyu belleğe alır, değerlendirme sırasında dış değişikliklerden yalıtır. Learn’ün uyarısı açık: <b>hızlandırmayabilir; hepsini okuyup bellekte tutmak yavaşlatabilir ve sonraki adımların katlanmasını engeller.</b> Yalnız katlamayı durdurmak istiyorsan <code>Table.StopFolding</code> var. Buffer sığdır: hücredeki kayıt, liste ve tablo içeriklerini zorlamaz.</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Durum</th><th>Buffer?</th></tr></thead><tbody>
<tr><td>Sıralı sonucu sabitleyip sonra Distinct ya da gruplama</td><td>Evet, sonuç sırası kritikse</td></tr>
<tr><td>Bir sorguyu satır fonksiyonunda defalarca okuyorsun</td><td>Evet: List.Buffer ya da Table.Buffer ile tek okuma</td></tr>
<tr><td>“Yavaş” diye rastgele her adıma</td><td>Hayır: bellek artar, katlama bozulur</td></tr>
<tr><td>Veri kaynağı katlıyor, filtre sonra gelecek</td><td>Hayır: tüm satırları çeker</td></tr>
</tbody></table></div>
<h2>Sorgu tanılaması</h2>
<p><b>Araçlar → Start Diagnostics</b>, yenile, <b>Stop Diagnostics</b>. İki sorgu gelir: özet ve ayrıntılı. <code>Exclusive duration (%)</code> nerede vakit geçtiğini gösterir; yalnız aynı Id içinde toplanır. Power Query filtre listeleri ve üst veri için de sorgu çalıştırdığından tekrarlar görürsün.</p>
<h2>Value.NativeQuery</h2>
<p>Elle SQL gerektiğinde Learn’ün önerdiği yol budur: değerleri metne eklemek yerine parametre olarak geçirir.</p>
<pre class="m">let
    Source = Sql.Database("server", "database"),
    Result = Value.NativeQuery(
        Source,
        "SELECT * FROM Sales WHERE SalesYear = @year",
        [year = 2024]
    )
in
    Result</pre>
<ul><li>Sonraki adımlar katlanmaz; mümkün olan her işi sorgunun içine koy.</li>
<li>Learn’e göre DirectQuery modeli düz <code>SELECT</code> ister: CTE ve saklı yordam olmaz.</li>
<li>Artımlı yenileme yerel SQL ile çalışmaz: Power Query tüm satırları çekip kendisi süzer.</li>
<li>Geçerli her ifade çalışır, veri değiştiren ifade dahil. En az yetkili, salt okunur hesap kullan.</li>
<li>Seçenek kaydı kaynağa özgüdür. SQL için kullanılan <code>[EnableFolding = true]</code> üzerine sonraki adımların katlanması denenir, ama her kaynakta desteklenmez; sayfa bunu kaynağa bırakır.</li>
<li>Metin birleştirerek SQL kurma: <code>"... WHERE Yil = " &amp; Text.From(x)</code> hem yönetilmesi zordur hem de enjeksiyona açıktır.</li></ul>
<div class="note"><b>Lab’de dene</b><code>Value.NativeQuery</code> burada “bu alt kümede çalışmaz” der. Bunu <button class="lnk" data-go="pq">M editöründe</button> görebilirsin.</div>
<h2>Kısa performans listesi</h2>
<ul><li>Gereksiz sütunu baştan at: en ucuz iyileştirme budur.</li><li>Filtreyi erken uygula, sıralamayı en sona bırak.</li><li>Başvuru zincirini anla: Learn’e göre başvuru, kaynağı iki kez sorgulatabilir.</li><li>Birleştirmede küçük tarafı tampon yap, anahtarı temizle.</li><li>Geliştirirken ilk N satırla çalış, adımı sonra sil.</li><li>Tasarımdan önce ölç: tanılama yoksa “yavaş” bir his olarak kalır.</li></ul>`,
  ex: [
    { t: 'mcode', q: '<b>Filtreyi öne al.</b> Kod doğru sonucu veriyor ama filtre en sonda: gerçek kaynakta katlanmaz. Dönüşümü değiştirme, <code>Filtre</code> adımını <code>Dizin</code>’in önüne al. (Sonuç satırları için dizini filtreden sonra ver.)', start: 'let\n    Kaynak = Satislar,\n    Dizin = Table.AddIndexColumn(Kaynak, "Sıra", 1, 1),\n    Filtre = Table.SelectRows(Dizin, each [Şehir] = "Ankara")\nin\n    Filtre', sol: 'let\n    Kaynak = Satislar,\n    Filtre = Table.SelectRows(Kaynak, each [Şehir] = "Ankara"),\n    Dizin = Table.AddIndexColumn(Filtre, "Sıra", 1, 1)\nin\n    Dizin', hint: 'Dikkat: dizin numaraları 1, 2, 3 olur. Sıra değişince sonuç da değişir; işte bu yüzden adım sırası iş kararıdır.' },
    { t: 'mcode', q: '<b>Arabelleğe al.</b> <code>Satislar</code>’dan <code>Tutar</code>’a göre azalan sıralayıp <code>Table.Buffer</code> ile sabitle, sonra <code>Şehir</code> başına ilk (en büyük tutarlı) satırı tut. Sütun: tüm sütunlar.', sol: 'let\n    Sirali = Table.Buffer(Table.Sort(Satislar, {{"Tutar", Order.Descending}})),\n    Tek = Table.Distinct(Sirali, {"Şehir"})\nin\n    Tek', must: ['Table.Buffer', 'Table.Distinct'], start: 'Satislar', hint: 'Yorumlayıcıda Buffer sonucu değiştirmez; gerçek motorda sırayı korumak için gerekir.' },
    { t: 'mc', q: 'Bir sorguda Dizin adımından sonra Table.SelectRows filtresi var ve yenileme yavaş. İlk bakılacak iyileştirme hangisi?', o: ['Filtreyi Dizin’in önüne almak', 'Her adıma Table.Buffer eklemek', 'Sütun türlerini silmek', 'Sorguyu DirectQuery’e çevirmek'], a: 0, why: 'Dizin çoğu kaynakta katlanmaz; ardındaki filtre motorda çalışır. Önce filtre katlanır. Ama dizin numarası sıraya bağlıysa sonucu değiştirir, kontrol et.' },
    { t: 'mc', q: 'Table.Buffer hakkında Learn’deki uyarı hangisidir?', o: ['Her zaman hızlandırır', 'Yavaşlatabilir ve katlamayı bozar', 'Yalnız DirectQuery’de çalışır', 'İç içe tablolardaki veriyi de belleğe alır'], a: 1, why: 'Learn: Buffer sığdır, sonraki adımların katlanmasını engeller ve yavaşlatabilir. Yalnız katlamayı durdurmak için Table.StopFolding önerilir.' },
    { t: 'mc', q: 'DirectQuery bir tablo için Power Query’de hangi şart gerekir?', o: ['Sorgu kaynağa katlanmalı', 'Tablo Table.Buffer içinde olmalı', 'Özel fonksiyon kullanılmalı', 'Dizin sütunu olmalı'], a: 0, why: 'Learn’ün katlama kılavuzu: DirectQuery ve Dual tablolar için katlama zorunludur.' },
    { t: 'mc', q: 'Value.NativeQuery ile SQL yazıyorsun. Yıl değerini nasıl vermelisin?', o: ['Metne ekleyerek: "... = " &amp; Text.From(y)', 'Parametre kaydıyla: [year = y], sorguda @year', 'Sorgudan sonra Table.SelectRows ile', 'Expression.Evaluate ile metni çalıştırarak'], a: 1, why: 'Learn: Value.NativeQuery parametre değerlerini güvenle geçirmek için tasarlandı. Metin birleştirmek enjeksiyona açıktır.' },
    { t: 'mc', q: 'Artımlı yenileme kurulu tabloda kaynak sorgusu yerel SQL’e çevrildi. Learn’e göre ne olur?', o: ['Daha hızlı olur', 'Filtre yine kaynağa katlanır, fark olmaz', 'Yenileme başarısız olur', 'Tüm satırları çeker, kendisi süzer'], a: 3, why: 'Katlama kılavuzu: artımlı yenileme yerel SQL ile kullanılamaz; tüm satırlar alınıp motorda süzülür.' },
    { t: 'mc', q: 'View Native Query komutu soluk görünüyor. Bu ne demektir?', o: ['Kaynak bağlı değil', 'Sorgu hatalı', 'Büyük olasılıkla katlanmıyor', 'Kesinlikle hiçbir adım katlanmıyor'], a: 2, why: 'Komut bazı bağlayıcılarda katlanan adımlarda da soluk olabilir. Sorgu tanılaması ya da kaynak izleme kesin sonuç verir.' },
    { t: 'mc', q: 'Sorgu tanılaması sonucunda Exclusive duration yüzdelerini tüm tablo için topladın ve 340 buldun. Sorun nedir?', o: ['Yüzde yalnız Id içinde toplanır', 'Sorgu bozuk', 'Tanılama seçenekleri yanlış ayarlanmış', 'Kaynak yavaş'], a: 0, why: 'Learn: Exclusive duration yüzdesi yalnız tek Id içinde toplanmalıdır.' },
    { t: 'mc', q: 'Bir Fabric ekibi Value.NativeQuery ile salt okunur olmayan bir hesap kullanıyor. En önemli risk nedir?', o: ['Kod daha uzun olur', 'Modelin boyutu büyür', 'Veri değiştiren bir ifade de çalışabilir', 'Rapor renkleri bozulur'], a: 2, why: 'Learn: geçerli her ifade, veri değiştirenler dahil çalışır. En az yetkili salt okunur hesap kullan.' }
  ]
});
})(window);
