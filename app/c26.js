/* Kesit Power BI — c26: Microsoft Fabric derinleştirme: OneLake, Lakehouse, Data Factory, işlem hatları, anlam modeli, Copilot.
   Fabric hızlı değişiyor: bilgiler Kasım 2026'da Microsoft Learn'den alındı; önizleme durumları derste belirtilir. Sayılar uygulama verisinden hesaplandı. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };
const ORTAM = '<div class="tip"><b>Kendi Fabric ortamında dene</b>';
const TRIAL = 'Fabric deneme kapasitesi 60 gün sürer, F4 ya da F64 olarak açılır, OneLake’te 1 TB’a kadar yer verir. Başlatmak için Fabric hesabı ve kuruluşunun iki ayarı (Users can create Fabric items, Users can try Microsoft Fabric paid features) gerekir; uygunluk bölgeye ve kiracıya göre değişir, garanti değildir. Denemede Copilot, veri ajanı ve yapay zekâ fonksiyonları çalışmaz. Bitince öğeler pasif olur, içerik OneLake’te 7 gün durur. Güncel koşullar için resmî “Fabric trial capacity” sayfasına bak. ';

/* ---------- OneLake ---------- */
add('fabric-giris', {
  id: 'fabric-onelake', lv: 'C1', mod: 'Fabric', min: 30,
  title: 'OneLake: tek veri gölü, kısayol, yansıtma ve güvenlik',
  sum: 'OneLake’in yapısı, açık biçimler, kısayol türleri ve kimlik davranışı, yansıtma, OneLake kataloğu, dosya gezgini; OneLake güvenlik rolleri kime uygulanır, kime uygulanmaz.',
  body: `
<p>Anadolu Market’te dört ekip, aynı satış verisini dört ayrı kopya olarak tutuyor: BI, pazarlama, finans ve veri bilimi. Her kopyanın yenileme zamanı farklı, hepsi farklı sayı üretiyor. <b>OneLake’in vaadi şudur: tek göl, tek kopya, çok motor.</b> “Microsoft Fabric’e giriş” dersinde adını gördün; burada nasıl çalıştığını, nerede tuzak olduğunu öğreneceksin.</p>
<h2>Yapı</h2>
<div class="tbl-wrap"><table><tr><th>Düzey</th><th>Ne?</th><th>Karşılığı</th></tr>
<tr><td>Kiracı (tenant)</td><td>Kuruluş başına <b>tek</b> OneLake; silinmez, ikincisi açılmaz</td><td>Kök; kiracı ilkeleri</td></tr>
<tr><td>Çalışma alanı</td><td>Sahiplik ve erişim sınırı; bir kapasiteye ve bölgeye bağlıdır</td><td>Kapsayıcı (container)</td></tr>
<tr><td>Öğe</td><td>Lakehouse, ambar, eventhouse…</td><td>Kapsayıcı içinde klasör</td></tr></table></div>
<p>OneLake, Azure Data Lake Storage üzerine kuruludur ve ADLS Gen2 API’lerini destekler. Bu yüzden ADLS’le konuşan araç genelde OneLake’le de konuşur. Tablolar Delta Parquet ya da Apache Iceberg biçimindedir; açık biçim demek, Spark, T-SQL ve Power BI’ın aynı dosyaları kopyalamadan okuması demektir. Silinen dosyalar 7 gün yumuşak silme ile tutulur. Kısa adres kalıbı için Learn’deki “OneLake access and APIs” sayfasına bak.</p>
<h2>Kısayol (shortcut) kuralları</h2>
<p>Kısayol, başka yerdeki veriyi yerindeymiş gibi gösteren işaretçidir. Kaynak değişince hemen görünür, kopya oluşmaz. “Fabric’e veri getirmek” dersindeki dört gerçeğe ek olarak üç konu üretimde önemlidir.</p>
<h3>Kimlik: kim adına okunuyor?</h3>
<div class="tbl-wrap"><table><tr><th>Mod</th><th>Ne zaman?</th><th>Sonuç</th></tr>
<tr><td><b>Geçiş (passthrough)</b></td><td>OneLake’ten OneLake’e varsayılan</td><td>Çağıranın kimliği kullanılır. Etkin izin: kısayol yolundaki ve hedef yolundaki iznin kesişimi.</td></tr>
<tr><td><b>Devredilen (delegated)</b></td><td>Dış sistemlere her zaman</td><td>Bir bağlantı kimliğiyle okunur. Kullanıcının kendi kaynak izni aranmaz.</td></tr></table></div>
<p>Devredilen kısayolda <b>bağlantı kimliği ne görüyorsa kısayolu görebilen de onu görür</b>. Dış S3 klasörüne “finans okuyucu” hesabıyla açılan kısayolu tüm çalışma alanına göstermek, finans verisini herkese açmak demektir.</p>
<h3>Sınırlar ve dönüşümler</h3>
<ul><li>Tables altında yalnız en üst düzeyde; Delta ise tablo olarak tanınır. Files altında her düzeyde.</li><li>Kısayol dönüşümleri CSV’yi Delta’ya çevirebilir ya da metne yapay zekâ uygulayabilir; durumunu Learn’den kontrol et.</li><li>Silme farkı önemli: kısayolu silmek veriyi silmez; <b>kısayolun içindeki dosyayı silmek hedefteki dosyayı siler</b>.</li></ul>
<h2>Yansıtma (mirroring)</h2>
<p>Yansıtma, dış veritabanını neredeyse gerçek zamanlı olarak OneLake’e çoğaltır; işlem hattı kurmak gerekmez. Learn üç tür sayar:</p>
<div class="tbl-wrap"><table><tr><th>Tür</th><th>Ne yapar?</th><th>Örnek</th></tr>
<tr><td>Veritabanı yansıtma</td><td>Sürekli Delta’ya çoğaltır</td><td>Azure SQL, Snowflake gibi desteklenen kaynaklar</td></tr>
<tr><td>Meta veri yansıtma</td><td>Dış kataloğu eşitler, veri yerinde kalır (kısayol)</td><td>Unity Catalog gibi</td></tr>
<tr><td>Açık yansıtma</td><td>Uygulaman API ile Delta yazar</td><td>Kendi CDC süreci</td></tr></table></div>
<p>Learn’e göre yansıtma işlemi Fabric kapasite birimi tüketmez, depolama SKU’ya bağlı bir sınıra kadar ücretsizdir (F64 için 64 TB). Fiyat kuralları değişebilir; kesin hesap için resmî fiyat sayfasına bak. Yansıtılan veri salt okunurdur. Dönüştürmek istediğinde başka öğe gerekir.</p>
<h2>Kısayol, yansıtma, kopyalama: hangisi?</h2>
<div class="tbl-wrap"><table><tr><th>Durum</th><th>Seçim</th></tr>
<tr><td>Veri zaten Delta, ADLS ya da başka çalışma alanında; kopya istemiyorsun</td><td>Kısayol</td></tr>
<tr><td>Operasyonel veritabanı; yakın gerçek zamanlı ve hazır kurulum</td><td>Yansıtma</td></tr>
<tr><td>Dönüşümlü, zamanlanmış, çok adımlı</td><td>İşlem hattı, Dataflow Gen2, not defteri</td></tr>
<tr><td>Basit toplu ya da artımlı taşıma</td><td>Copy job</td></tr></table></div>
<p>Ayrıntılı seçim “Data Factory” dersinde.</p>
<h2>OneLake kataloğu ve dosya gezgini</h2>
<p><b>OneLake kataloğu</b> veriyi bulma ve yönetme yeridir: etki alanı, çalışma alanı, öğe türü, onaya göre süz; açıklama, sahip, şema, soy gör. Sahip için etiket ve onay önerileri çıkarır. <b>OneLake dosya gezgini</b> ise Windows’ta dosya gezgini gibi çalışan, teknik olmayan kullanıcılar için bir istemcidir. Finans ekibi aylık dosyayı buraya bırakır, lakehouse’tan okunur.</p>
<h2>OneLake güvenlik rolleri</h2>
<p>OneLake güvenliği rol tabanlıdır ve varsayılan olarak reddeder: rol vermezsen veri erişimi yoktur. Reddeden rol yoktur, yalnız verir. Rol, klasör, tablo, satır ve sütun düzeyinde kapsam tanımlar; Spark, SQL ve Power BI’da tutarlı uygulanması hedeflenir.</p>
<div class="tbl-wrap"><table><tr><th>Kullanıcı</th><th>Roller uygulanır mı?</th></tr>
<tr><td>Yönetici, Üye, Katkıda bulunan</td><td><b>Hayır.</b> Yazma izinleri rollerin üstündedir.</td></tr>
<tr><td>Görüntüleyici</td><td>Evet; roller ve varsayılan rol geçerli</td></tr></table></div>
<ul><li><b>DefaultReader:</b> yeni lakehouse’larda otomatik gelir, ReadAll sahiplerini okur. Silersen ReadAll tek başına veri vermez.</li><li><b>Çoklu rol:</b> rol içi kapsamlar kesişir, roller arası birleşir. Bu yüzden birlikte uygulanması gereken RLS ve sütun kuralını aynı rolde tut.</li><li><b>SQL uç noktası:</b> birden çok rolde RLS koşulları VEYA ile birleşir; sütun kuralları daha katıdır, bir rol sütunu gizliyorsa engeller.</li><li><b>Direct Lake:</b> SQL üzerindeki Direct Lake sahibin kimliğini kullanır; son kullanıcı kimliğiyle uçtan uca için OneLake üzerindeki Direct Lake ya da kullanıcı kimliği modlu uç nokta gerekir.</li></ul>
<div class="warn"><b>Durum notu</b>Learn’deki sayfa bu özelliğin önizleme mi genel kullanım mı olduğunu açık yazmıyor. Rol değişikliği yaklaşık 5 dakika, grup üyeliği değişikliği 1 saat ve üstü sürebilir; 250 rol, rol başına 500 üye gibi sınırlar var. Üretime almadan önce resmî sayfayı kontrol et.</div>
<h2>Satır yetkisini model tarafıyla karıştırma</h2>
<p>Modeldeki DAX RLS raporun kapısıdır; OneLake rolü gölün kapısıdır. Veri bilimci not defterinden Delta dosyasını okuyorsa DAX RLS onu durdurmaz. İkisini birlikte düşün. Modelde RLS sınaması “Satır ve nesne düzeyinde güvenlik” dersinde.</p>
` + ORTAM + TRIAL + `Denemede bir lakehouse aç, başka bir lakehouse tablosuna kısayol oluştur, kısayolu sil, hedefin durduğunu gör. Silme denemesini kendi test verinde yap.</div>
`,
  ex: [
    { t: 'mc', q: 'Pazarlama çalışma alanı, BI çalışma alanındaki satış Delta tablosunu kopya oluşturmadan kullanacak. BI verisini görmek için kimde izin aranır?', o: ['Yalnız kısayolu açanda', 'Çağıranda; iki yolda da', 'Bağlantı hesabında', 'Kiracı yöneticisinde'], a: 1, why: 'OneLake’ten OneLake’e kısayol varsayılan olarak geçiş modunda çalışır; çağıranın kimliği kullanılır ve iki yoldaki iznin kesişimi geçerlidir. Bağlantı kimliği dış sistemlere giden devredilen modda kullanılır.' },
    { t: 'mc', q: 'S3’teki finans klasörüne kısayolu “finans-okuyucu” hesabıyla açtın ve çalışma alanındaki herkes lakehouse’u okuyabiliyor. Risk?', o: ['Kısayol S3’te çalışmaz', 'Kısayolu silmek S3’ü siler', 'Herkes bağlantı kimliğiyle görür', 'Yalnız Delta dosyaları görünür'], a: 2, why: 'Dış sistem kısayolları devredilen modda çalışır. Kullanıcı S3 izni taşımasa da bağlantı kimliğinin gördüğünü görür. Erişimi OneLake rolü ya da ayrı öğe ile sınırla.' },
    { t: 'mc', q: 'Bir analist kısayol klasöründeki eski bir CSV’yi “temizlik için” sildi. Sonra kaynak ekip dosyanın kaybolduğunu bildirdi. Ne olmuştur?', o: ['Dosya kaynaktan da silindi', 'Yalnız OneLake kopyası gitti', 'Kaynak dosya salt okunur kalır', 'OneLake 30 gün sonra siler'], a: 0, why: 'Kısayolu silmek hedefe dokunmaz; ama içindeki dosyayı silmek, iznin varsa hedefteki dosyayı siler. Kısayolları temizlerken bu ayrımı kaçırmamak gerekir.' },
    { t: 'mc', q: 'Operasyonel Azure SQL verisini düşük gecikmeyle OneLake’te görmek istiyorsun, dönüşüm yok, ekip ETL bilmiyor. Hangisi?', o: ['Not defteri', 'Yansıtma', 'Veri akışı Gen2', 'Eventstream'], a: 1, why: 'Yansıtma hazır kurulumla yakın gerçek zamanlı çoğaltma yapar, kod gerektirmez. Eventstream olay akışı içindir, operasyonel tabloyu çoğaltmaz. Not defteri ve veri akışı bu işe fazla emek ister.' },
    { t: 'mc', q: 'Satış müdürü çalışma alanında Katkıda bulunan. OneLake güvenlik rolünde yalnız Ege bölgesini görmesi tanımlandı. Yine de hepsini görüyor. Neden?', o: ['Rol koşulu yanlış yazılmış', 'Rol yayımlanmamış', 'Spark desteklemiyor', 'Bu rol Katkıda bulunanı süzmez'], a: 3, why: 'Learn: Yönetici, Üye ve Katkıda bulunan yazma izniyle erişir; OneLake rolleri onları kısıtlamaz. Görüntüleyici yapıp öğe izni ver.' },
    { t: 'mc', q: 'Lakehouse’ta DefaultReader rolü “gereksiz” diye silindi. ReadAll izinli kullanıcılar veriyi göremiyor. Doğru yorum?', o: ['Beklenen davranıştır', 'Hata; ReadAll yeter', 'Kapasite sorunu', 'SQL uç noktası kapanmış'], a: 0, why: 'OneLake güvenliği açıkken ReadAll veri erişimini DefaultReader üzerinden sağlar. Silince erişim gider. Başka role atayarak geri verilir.' },
    { t: 'mc', q: 'Veri bilimci not defteriyle tabloyu okuyor ve modelde DAX RLS ile kapalı satırları görüyor. Kullanıcı Görüntüleyici değil, Üye. Karar?', o: ['DAX RLS’i sıkılaştırmak', 'Rolü düşürüp göl kuralı vermek', 'Modeli silmek', 'Raporu sertifikalamak'], a: 1, why: 'DAX RLS modelin kapısıdır, Spark’ı durdurmaz. Yazma rolü olan kullanıcı dosyaları okuyabilir. Rolü düşürüp OneLake rolü ya da ayrı öğeyle sınırla.' }
  ]
});

/* ---------- Lakehouse ---------- */
add('fabric-onelake', {
  id: 'fabric-lakehouse', lv: 'C1', mod: 'Fabric', min: 30,
  title: 'Lakehouse: Files ve Tables, SQL analiz uç noktası, katmanlı mimari',
  sum: 'Lakehouse’un içi, veri yükleme yolları, SQL analiz uç noktasının yapabildikleri ve yapamadıkları, lakehouse mi ambar mı eventhouse mu, tunç-gümüş-altın düzeni ve dosya bölümleme.',
  body: `
<p>Lakehouse, gölün esnekliğini ambarın sorgu kolaylığıyla birleştirir: her türlü dosyayı koyarsın, Delta tablolarını hem Spark hem T-SQL ile sorgularsın. Bu ders lakehouse’u kurmayı değil, <b>ne zaman doğru seçim olduğunu ve tuzaklarını</b> anlatır. Elle kurulum adımları “Fabric’e veri getirmek” ve “Lakehouse ödevi” derslerinde.</p>
<h2>İki bölüm</h2>
<div class="tbl-wrap"><table><tr><th></th><th>Files</th><th>Tables</th></tr>
<tr><td>Ne durur?</td><td>CSV, JSON, resim, Parquet; Delta olmayan her şey</td><td>Yönetilen Delta tabloları</td></tr>
<tr><td>Keşif</td><td>Yok; dosyadır</td><td>Otomatik: meta veri çıkarılır, sütunlar kaydedilir</td></tr>
<tr><td>SQL uç noktası</td><td>Görünmez</td><td>Görünür</td></tr>
<tr><td>Kullanım</td><td>Ham iniş, arşiv</td><td>Analiz, model kaynağı</td></tr></table></div>
<p>Tables’a Delta olmayan dosya koymak işe yaramaz; Learn şu an yalnız Delta’yı doğruladığını söyler. Parquet ya da CSV’yi sorgulamak istiyorsan önce Delta’ya çevir.</p>
<h2>Veri yükleme yolları</h2>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Kim için?</th><th>Örnek</th></tr>
<tr><td>Lakehouse gezgini (karşıya yükle, Load to Tables)</td><td>Tek dosya, deneme</td><td>Aylık Excel’i bir kez</td></tr>
<tr><td>Kısayol</td><td>Kopya istemeyen</td><td>Başka alandaki Delta</td></tr>
<tr><td>Dataflow Gen2</td><td>Power Query bilen</td><td>SharePoint listesini temizleyip yaz</td></tr>
<tr><td>İşlem hattı, Copy job</td><td>Taşıma ve düzen</td><td>ERP’den gece kopyası</td></tr>
<tr><td>Not defteri, Spark iş tanımı</td><td>Kod bilen</td><td>Karmaşık dönüşüm, üretim ETL’i</td></tr></table></div>
<h2>SQL analiz uç noktası</h2>
<p>Her lakehouse ile otomatik gelir. Salt okunurdur: <b>SELECT evet; INSERT, UPDATE, DELETE hayır.</b> Tablo oluşturamazsın, ama görünüm, satır içi fonksiyon, saklı yordam tanımlayabilirsin ve bunlar kalıcıdır. Veriyi değiştirmek için Spark gerekir. Ayrıca:</p>
<ul><li>Yalnız Tables altındaki Delta tabloları görünür. Spark ile oluşturulan dış Delta tablolar ek kısayol olmadan görünmez.</li><li>Meta veri otomatik eşitlenir; ama anlık değildir. Yeni yazılan tablo hemen görünmediyse eşitleme sürüyor olabilir, manuel başlatma seçeneği için “SQL analytics endpoint metadata sync” sayfasına bak. İşlem hattında <b>Refresh SQL analytics endpoint</b> etkinliği vardır.</li><li>Burada tanımlanan SQL güvenliği yalnız uç noktadan erişimde geçerlidir; Spark’ı etkilemez.</li><li>Çok tablolu işlem (transaction) yoktur; ambarda vardır.</li></ul>
<div class="warn"><b>Varsayılan anlam modeli kalktı</b>Eski dokümanlar her lakehouse’un otomatik bir anlam modeli olduğunu yazar. Learn’e göre 5 Eylül 2025’ten beri bu model oluşturulmuyor; var olanlar 30 Kasım 2025’e kadar ayrılarak bağımsız modele dönüştü. Model artık elle oluşturulur (“Fabric’te anlam modeli” dersi).</div>
<h2>Lakehouse mi, ambar mı, eventhouse mu?</h2>
<div class="tbl-wrap"><table><tr><th></th><th>Lakehouse</th><th>Ambar</th><th>Eventhouse</th><th>SQL veritabanı</th></tr>
<tr><td>Amaç</td><td>Esnek depo, büyük veri işleme</td><td>Yönetilen SQL analitiği, BI</td><td>Yüksek hacimli olay</td><td>İşlemsel uygulama</td></tr>
<tr><td>Sorgu</td><td>Spark + salt okunur T-SQL</td><td>Tam T-SQL</td><td>KQL</td><td>Tam T-SQL</td></tr>
<tr><td>Yazma</td><td>Spark, veri akışı, işlem hattı</td><td>T-SQL, işlem hattı</td><td>Doğal alım</td><td>Uygulama</td></tr>
<tr><td>Ne zaman?</td><td>Çeşitli biçim, mühendislik, keşif</td><td>Yıldız şema, saklı yordam, çok tablolu işlem</td><td>Telemetri, log</td><td>Operasyon ve üstünde analiz</td></tr></table></div>
<p>Doğru soru genelde “hangisi?” değil, “hangi katman nerede?”dir.</p>
<h2>Katmanlı düzen: tunç, gümüş, altın</h2>
<p>Learn lakehouse’u bu mimari için uygun bulur; Microsoft’un sabit bir tanımı olmadığı için ekipler kendi kurallarını yazar. Yaygın kullanım:</p>
<div class="tbl-wrap"><table><tr><th>Katman</th><th>İçerik</th><th>Anadolu Market örneği</th></tr>
<tr><td>Tunç (bronze)</td><td>Ham veri, değişmeden</td><td>ERP’den gelen <code>Satislar.csv</code>, Files/ham</td></tr>
<tr><td>Gümüş (silver)</td><td>Temiz, türü doğru, tekil</td><td><code>satis_temiz</code> Delta tablosu</td></tr>
<tr><td>Altın (gold)</td><td>İşe hazır yıldız şema</td><td><code>FactSatis</code>, <code>DimUrun</code>; modelin kaynağı</td></tr></table></div>
<p>Kural: raporlar altından okur. Ham veriyi silme; hatalı dönüşümde en baştan yeniden üretebilmek için gerekir. Üç katmanı üç lakehouse ya da aynı lakehouse’ta şema olarak tutmak ekip ölçeğine bağlıdır. Altın katmanın doğruluğunu DAX ile de sınarsın: toplamları ham veriyle karşılaştır.</p>
<pre class="dax">EVALUATE
ROW(
    "Ham Tutar", SUM(Satislar[Tutar]),
    "İptal Hariç", CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] &lt;&gt; "İptal"),
    "Net Ölçü", [Net Satış]
)</pre>
<p>Bu veride ham 1.346.190 ₺, iptal hariç ve [Net Satış] 1.250.772 ₺’dir. Altın toplam ölçüyle tutmuyorsa kural farklıdır.</p>
<h2>Bölümleme ve dosya sağlığı</h2>
<p>DP-600 dosya bölümlemeyi ayrıca sorar. Bölümleme, sorgunun gereksiz dosyaları atlamasını sağlar: sorgular çoğunlukla ay süzüyorsa aya göre bölmek yardımcı olur. Düşük kardinaliteli bir sütun seç; günlük ve müşteri düzeyi gibi yüksek kardinalite çok küçük dosya üretir. Küçük dosya sorunu ve <code>OPTIMIZE</code>, <code>VACUUM</code> “Lakehouse ödevi” dersinde. Direct Lake’in dosya ve satır grubu sınırları “Fabric’te anlam modeli” dersinde.</p>
` + ORTAM + TRIAL + `Denemede “Lakehouse ödevi”ni yap. SQL uç noktasında <code>INSERT</code> dene, hatayı oku. Sonuç için beklenen değerler o derste.</div>
`,
  ex: [
    { t: 'mc', q: 'Ham CSV dosyaları lakehouse’a kondu. SQL analiz uç noktasında görünmüyor. Neden?', o: ['Kapasite yetersizdir', 'Files’ta duruyor', 'Şema etkin değildir', 'T-SQL CSV okuyamaz'], a: 1, why: 'Uç nokta yalnız Tables’taki Delta tablolarını gösterir. Load to Tables, veri akışı ya da not defteriyle Delta’ya çevrilir.' },
    { t: 'mc', q: 'Ekip SQL analiz uç noktasında MERGE ile tabloları güncellemek istiyor. Sana soruyorlar.', o: ['Mümkün; önce kilit al', 'Uç nokta salt okunurdur', 'Görünüm üzerinden olur', 'Saklı yordam içinde olur'], a: 1, why: 'Uç noktada görünüm ve yordam tanımlanır ama lakehouse tablolarını değiştiremezsin. Veriyi değiştirmek için Spark, T-SQL ile yazmak için ambar gerekir.' },
    { t: 'mc', q: 'İki tabloyu aynı işlem içinde güncellemek, biri düşünce ikisini de geri almak şart. Hangi depo?', o: ['Lakehouse', 'Eventhouse', 'Ambar', 'Kısayol'], a: 2, why: 'Learn: lakehouse çok tablolu işlem desteklemez, ambar destekler. Eventhouse olay verisi içindir.' },
    { t: 'mc', q: 'Eski bir rehber “lakehouse açınca hazır anlam modeli gelir” diyor. Bugün yeni bir lakehouse açtın, model yok. Ne yaparsın?', o: ['Hata bildiririm', 'Elle model oluştururum', 'Eski lakehouse’tan kopyalarım', 'Kapasiteyi büyütürüm'], a: 1, why: 'Varsayılan modeller 5 Eylül 2025’ten beri oluşturulmuyor; yeni modeli kendin oluşturursun. Fazladan öğe olmadığı için kontrol sende olur.' },
    { t: 'mc', q: 'Spark’ta yeni tablo yazıldı. Uç noktada hemen görünmüyor, işlem hattının sonraki adımı onu sorguluyor. Çözüm?', o: ['Refresh SQL analytics endpoint', 'Tablo adını değiştirmek', 'Sorguyu saat başına almak', 'Bir saatlik Wait eklemek'], a: 0, why: 'Meta veri eşitlemesi anlık değildir. İşlem hattında bu etkinlik eşitlemeyi açıkça tetikler. Sabit bekleme kırılgandır.' },
    { t: 'mc', q: 'Rapor doğrudan gümüş katmandaki bir tabloya bağlanmış. Her Spark düzeltmesinde raporda sütun adı bozuluyor. Mimari öneri?', o: ['Raporu ham veriye bağlamak', 'Altın katman kurmak', 'Gümüşü silmek', 'Her düzeltmeyi kapatmak'], a: 1, why: 'Rapor kararlı bir sunum katmanından okumalıdır. Altın tablolar ad ve anlam sözleşmesidir; gümüşteki iç değişiklik raporu kırmaz.' },
    { t: 'mc', q: 'Sorgular çoğunlukla ay süzüyor; satır milyar. Bölümleme sütunu?', o: ['SiparisNo', 'Ay', 'Müşteri', 'Tam zaman damgası'], a: 1, why: 'Sorgunun süzdüğü düşük kardinaliteli sütun dosya atlamayı sağlar. Yüksek kardinaliteli sütun çok küçük dosya üretir, sorunu büyütür.' },
    { t: 'query', q: 'Altın katmanı sına. Tek satırda <b>Ham</b> (<code>SUM(Satislar[Tutar])</code>), <b>Net</b> (<code>[Net Satış]</code>) ve <b>İptal Farkı</b> (Ham eksi Net) döndür.', start: 'EVALUATE\n', sol: 'EVALUATE\nROW("Ham", SUM(Satislar[Tutar]), "Net", [Net Satış], "İptal Farkı", SUM(Satislar[Tutar]) - [Net Satış])', hint: 'ROW("Ad", ifade, …)' }
  ]
});

/* ---------- Data Factory ---------- */
add('fabric-veri-alma', {
  id: 'fabric-data-factory', lv: 'C1', mod: 'Fabric', min: 30,
  title: 'Data Factory ve veri kaynakları: Fabric’e veriyi hangi yolla getirirsin?',
  sum: 'Data Factory’nin parçaları, Fabric’in veri kaynağı yelpazesi ve şirket içi erişim; Copy job, kopyalama etkinliği, yansıtma, Eventstream, Dataflow Gen2, not defteri arasında gerçek senaryolarla karar.',
  body: `
<p>“Fabric’e veri nasıl gelir?” sorusunun tek cevabı yok; aynı işi yapan beş araç var ve yanlış olanı seçmek haftalarca emek ya da kapasite israfı demek. <b>Data Factory</b>, Fabric’in veri alma ve düzenleme iş yüküdür. Bu ders araçları tanıtmaktan çok, seçim yapmayı öğretir. İşlem hattının içi bir sonraki derste.</p>
<h2>Parçalar</h2>
<div class="tbl-wrap"><table><tr><th>Öğe</th><th>Ne yapar?</th><th>Kod</th></tr>
<tr><td><b>İşlem hattı (pipeline)</b></td><td>Etkinlikleri sıraya koyar, zamanlar, koşullar; kendi başına dönüştürmez</td><td>Az</td></tr>
<tr><td><b>Copy job</b></td><td>Basit toplu, artımlı, CDC kopyalama; Learn’ün önerdiği taşıma yolu</td><td>Az</td></tr>
<tr><td><b>Kopyalama etkinliği</b></td><td>İşlem hattı içinde büyük ölçekli, ayarı çok kopyalama</td><td>Az</td></tr>
<tr><td><b>Dataflow Gen2</b></td><td>Power Query ile dönüştürür, hedefe yazar</td><td>Az</td></tr>
<tr><td><b>Yansıtma (mirroring)</b></td><td>Operasyonel veritabanını OneLake’e yakın gerçek zamanlı çoğaltır</td><td>Yok</td></tr>
<tr><td><b>dbt job</b></td><td>SQL tabanlı dönüşüm, ambar üzerinde</td><td>SQL</td></tr>
<tr><td><b>Apache Airflow job</b></td><td>Python ile DAG düzenleme</td><td>Python</td></tr></table></div>
<p>Spark not defteri ve Eventstream başka iş yüklerindendir, ama seçimde onlarla da karşılaşırsın. Azure Data Factory ayrı bir üründür, Fabric Data Factory’nin aynısı değildir; Learn’de “differences” sayfası var.</p>
<h2>Veri kaynakları</h2>
<p>Data Factory 170’ten fazla kaynağa bağlanır (Learn, Ağustos 2026). Sayı değil, üç soru önemli:</p>
<div class="tbl-wrap"><table><tr><th>Kaynak nerede?</th><th>Nasıl erişilir?</th></tr>
<tr><td>Bulutta, herkese açık uç nokta</td><td>Doğrudan bulut bağlantısı</td></tr>
<tr><td>Şirket içinde</td><td>Şirket içi veri ağ geçidi: işlem hattı, Dataflow Gen2 ve Copy job için (“On-premises data gateway” dersi)</td></tr>
<tr><td>Özel sanal ağda</td><td>VNet veri ağ geçidi ya da özel uç nokta</td></tr>
<tr><td>Başka Fabric öğesinde, ADLS’te, S3’te</td><td>Önce kısayol düşün</td></tr>
<tr><td>Akış, IoT, Kafka</td><td>Eventstream</td></tr></table></div>
<p>Bağlantılar Power BI’dakiyle aynı <b>Bağlantıları ve ağ geçitlerini yönet</b> ekranındadır. Bağlayıcı desteği araca göre değişir: bir bağlayıcı Dataflow Gen2’de varken kopyalamada olmayabilir. Önce “Connector overview” sayfasına bak.</p>
<h2>Karar tablosu</h2>
<div class="tbl-wrap"><table><tr><th>Araç</th><th>En iyi olduğu iş</th><th>Dönüşüm</th><th>Beceri</th></tr>
<tr><td>Yansıtma</td><td>Hazır kurulumla yakın gerçek zamanlı çoğaltma; hedef salt okunur</td><td>Yok</td><td>Gerekmez</td></tr>
<tr><td>Copy job</td><td>Çok tablolu, artımlı ya da CDC taşıma</td><td>Az</td><td>ETL, SQL</td></tr>
<tr><td>Kopyalama etkinliği</td><td>İşlem hattının parçası, elle ayar, filigran</td><td>Az</td><td>ETL, SQL</td></tr>
<tr><td>Eventstream</td><td>Akan olay, gerçek zamanlı yönlendirme</td><td>Orta</td><td>KQL, SQL</td></tr>
<tr><td>Dataflow Gen2</td><td>Kod yazmadan temizlik, profil</td><td>Yüksek</td><td>M, Power Query</td></tr>
<tr><td>Not defteri</td><td>Karmaşık, büyük ölçekli, kodlu dönüşüm</td><td>Yüksek</td><td>Spark, Python</td></tr>
<tr><td>Kısayol</td><td>Kopyasız erişim</td><td>Kısıtlı</td><td>Gerekmez</td></tr></table></div>
<p>Dört soru: <b>Kopya gerekli mi? Ne kadar taze? Dönüşüm ne kadar karmaşık? Ekip ne biliyor?</b></p>
<h2>Anadolu Market senaryoları</h2>
<div class="tbl-wrap"><table><tr><th>İhtiyaç</th><th>Seçim</th><th>Neden öteki değil?</th></tr>
<tr><td>Azure SQL’deki sipariş tablosunu yöneticiler dakikalar içinde görsün, dönüşüm yok</td><td>Yansıtma</td><td>Copy job zamanlamaya bağlı; işlem hattı gereksiz emek</td></tr>
<tr><td>Şirket içi ERP’den 40 tabloyu her gece artımlı kopyala</td><td>Copy job, ağ geçidi</td><td>Kırk kopyalama etkinliği bakım yükü</td></tr>
<tr><td>SharePoint listesini temizle; analist Power Query biliyor</td><td>Dataflow Gen2</td><td>Spark öğrenmek gerekmez</td></tr>
<tr><td>Web olaylarından gün başına oturum üret; JSON iç içe, 500 milyon satır</td><td>Not defteri</td><td>Veri akışı bu ölçekte zayıf ve pahalı kalabilir</td></tr>
<tr><td>Mağaza kasalarından saniye saniye işlem akışı, anomaliye uyarı</td><td>Eventstream, Eventhouse</td><td>Toplu araç saniyeye inmez</td></tr>
<tr><td>Kopyala, temizle, yordam çalıştır, model yenile, hata olursa haber ver</td><td>İşlem hattı</td><td>Tek araç sırayı yönetemez</td></tr>
<tr><td>Bölge ekibinin lakehouse tablosunu pazarlama da okusun</td><td>Kısayol</td><td>Kopya tutarsızlık üretir</td></tr></table></div>
<h2>Yaygın yanlış seçimler</h2>
<ul><li><b>“Her şeyi not defteriyle yazalım.”</b> Ekipte tek Spark bilen varsa o tatile çıkınca hat durur.</li><li><b>“Yansıtılmış tablodaki kolonu değiştireyim.”</b> Yansıtma hedefi salt okunurdur; dönüşüm ayrı katmanda yapılır.</li><li><b>“Dataflow Gen2 işlem hattının yerine geçer.”</b> Sorgu bağımlılığı yönetir, ama yordam çalıştırma, koşul ve uyarı için işlem hattı gerekir.</li><li><b>“Veri zaten ADLS’te; kopyalayalım.”</b> Delta ise kısayol yeter.</li></ul>
<p>Öğrenme yolunda aynı veriyi iki yolla yükleme ödevi “Fabric’e veri getirmek” dersinde. Copilot’un bu araçlarda ne yapabildiği “Fabric’te Copilot” dersinde. Veriyi modele getirmeden önce doğrulama, tüm yollar için aynıdır: satır sayısı ve toplam.</p>
<pre class="dax">EVALUATE
ROW("Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]), "İlk Tarih", MIN(Satislar[Tarih]), "Son Tarih", MAX(Satislar[Tarih]))</pre>
` + ORTAM + TRIAL + `Pipeline, Dataflow Gen2 ve Copy job denemede çalışır. Şirket içi kaynak için ağ geçidi gerekir; yoksa Anadolu Market CSV’leriyle çalış.</div>
`,
  ex: [
    { t: 'mc', q: 'Şirket içi ERP’de 60 tablo var. Her gece yalnız değişenler taşınacak, dönüşüm sonra. Az bakım önemli. Hangisi?', o: ['60 kopyalama etkinliği', 'Copy job ve ağ geçidi', 'Yansıtma', 'Her tablo için bir veri akışı'], a: 1, why: 'Copy job çok tablolu, artımlı ve CDC kopyalama için tasarlandı. Yansıtma kaynak desteğine bağlı olup şirket içi ERP için uygun olmayabilir. Altmış etkinlik ve akış bakım yüküdür.' },
    { t: 'mc', q: 'Analist SharePoint listesini temizleyip lakehouse’a yazmak istiyor; Python bilmiyor. Hangisi?', o: ['Not defteri', 'Eventstream', 'Dataflow Gen2', 'Airflow job'], a: 2, why: 'Dataflow Gen2 kod yazmadan temizler ve hedefe yazar. Not defteri ve Airflow kod ister; Eventstream akış içindir.' },
    { t: 'mc', q: 'Kasa işlemleri saniye saniye gelecek; eşik aşılınca uyarı gerekecek. Hangisi?', o: ['Saatlik Copy job', 'Eventstream ve Eventhouse', 'Gece işlem hattı', 'Dataflow Gen2 ve abonelik'], a: 1, why: 'Düşük gecikmeli olay akışı için Eventstream; saklama ve sorgu için Eventhouse; uyarı için Activator. Toplu araçlar saniyeye inmez.' },
    { t: 'mc', q: 'Yansıtılmış tabloda bir sütunun türünü düzeltmek isteniyor. Doğru yol?', o: ['Yansıtma tablosunda ALTER', 'Tabloyu Excel üzerinden yüklemek', 'Aşağı katmanda dönüştürmek', 'Kısayolu silmek'], a: 2, why: 'Yansıtma hedefi salt okunurdur. Kaynakta düzelt ya da yansıtılmış tabloyu okuyan bir katmanda dönüştür: görünüm, not defteri, veri akışı.' },
    { t: 'mc', q: 'Lakehouse tablosu 200 sütun; her gece tek ekip okuyor. Bir geliştirici başka alandaki lakehouse’a her gece kopyalayan hat kurmuş. Daha iyi öneri?', o: ['Kopyayı saatliğe almak', 'Kısayol oluşturmak', 'Kopyayı CSV’ye çevirmek', 'Yeni kapasite almak'], a: 1, why: 'Fabric içi Delta için kısayol kopyasız erişim verir, tutarsızlığı ve depolama maliyetini ortadan kaldırır. İzin geçiş modundadır.' },
    { t: 'mc', q: 'Bağlayıcı listesinde Dataflow Gen2’de gördüğün kaynak, kopyalama etkinliğinde yok. Ne düşünürsün?', o: ['Araca göre değişir', 'Kaynak bozuk', 'Kapasite yetersiz', 'Ağ geçidi eksik'], a: 0, why: 'Bağlayıcı desteği araca göre farklıdır. Connector overview sayfasına bak; gerekirse ilk adımı veri akışıyla yap, sonra işlem hattında sırala.' },
    { t: 'mc', q: 'Ekipte iki Power Query bilen var, Spark bilen yok. Veri 4 milyon satır, dönüşüm birkaç birleştirme. Danışman not defteri öneriyor. Senin cevabın?', o: ['Not defteri her zaman hızlıdır', 'Dataflow Gen2 ile başla, ölç', 'Eventstream kullan', 'Airflow ile baştan yaz'], a: 1, why: 'Karar yalnız performans değil, ekibin bakımıdır. Bu hacim ve dönüşümde Dataflow Gen2 uygun başlangıçtır; ölçüp yavaşlık görülürse not defteri düşünülür.' },
    { t: 'query', q: 'Yükleme sonrası doğrulama sorgusu: tek satırda <b>Satır</b> (Satislar satır sayısı), <b>Sipariş</b> (farklı SiparisNo sayısı), <b>Son Tarih</b> (en son Tarih) döndür. Hangi yolla yüklersen yükle aynı olmalı.', start: 'EVALUATE\n', sol: 'EVALUATE\nROW("Satır", COUNTROWS(Satislar), "Sipariş", DISTINCTCOUNT(Satislar[SiparisNo]), "Son Tarih", MAX(Satislar[Tarih]))', hint: 'ROW("Satır", COUNTROWS(Satislar), …)' }
  ]
});

/* ---------- İşlem hatları ---------- */
add('fabric-data-factory', {
  id: 'fabric-pipeline', lv: 'C1', mod: 'Fabric', min: 38,
  title: 'İşlem hatları (pipelines): etkinlik, bağımlılık, parametre, zamanlama ve hata',
  sum: 'Bir hattı doğru kurmak: etkinlik türleri, başarı ve hata yolları, parametre ve ifade, filigranla artımlı yükleme, zamanlama ve olay tetikleyicisi, yeniden deneme ve izleme; gece hattı teşhis senaryoları.',
  body: `
<p>Anadolu Market’in gece işi şu: ERP’den satışları kopyala, temizle, aylık özeti hesapla, modeli yenile, sorun olursa ekibe haber ver. Her adımı ayrı saate zamanlamak çalışır, ta ki bir gece biri uzayana kadar. <b>İşlem hattı (pipeline)</b> bu adımları tek akışa bağlar. Veri dönüştürmez, düzenler.</p>
<div class="note"><b>Tarayıcı sınırı</b>Bu uygulama Fabric’in tuval arayüzünü taklit etmez. Alıştırmalar gerçek senaryolarda karar, ifade okuma ve hata teşhisi sorar. Uygulaması için aşağıdaki “Kendi Fabric ortamında dene” bölümüne bak.</div>
<h2>Etkinlikler</h2>
<div class="tbl-wrap"><table><tr><th>Grup</th><th>Etkinlik</th><th>Tipik kullanım</th></tr>
<tr><td>Taşıma</td><td>Copy data, Copy job</td><td>Kaynaktan hedefe</td></tr>
<tr><td>Dönüştürme</td><td>Dataflow Gen2, Fabric notebook, Stored procedure, SQL script, Spark job definition, Delete data</td><td>İş mantığı burada çalışır</td></tr>
<tr><td>Denetim</td><td>If condition, Switch, ForEach, Until, Wait, Fail, Invoke pipeline, Set variable, Lookup, Get metadata, Filter</td><td>Akış</td></tr>
<tr><td>Çevre</td><td>Teams, Web, Webhook, Functions, Refresh SQL analytics endpoint, Lakehouse maintenance</td><td>Bildirim, bakım</td></tr></table></div>
<p>Hat başına varsayılan sınır 120 etkinliktir (iç etkinlikler dahil). Yaklaşıyorsan <b>Invoke pipeline</b> ile böl. Modeli yenilemek için <b>Semantic model refresh</b> etkinliği vardır (Direct Lake’te çerçeveleme yapar).</p>
<h2>Bağımlılık: dört yol</h2>
<p>Etkinlikler arasındaki oklar koşulludur:</p>
<div class="tbl-wrap"><table><tr><th>Koşul</th><th>Sonraki etkinlik ne zaman çalışır?</th><th>Kullanım</th></tr>
<tr><td><b>Başarıda (UponSuccess)</b></td><td>Önceki başarılıysa</td><td>Ana akış</td></tr>
<tr><td><b>Hatada (UponFailure)</b></td><td>Önceki başarısızsa</td><td>Teams bildirimi</td></tr>
<tr><td><b>Tamamlandığında (UponCompletion)</b></td><td>Başarılı ya da başarısız fark etmez</td><td>Temizlik, günlük yazma</td></tr>
<tr><td><b>Atlandığında (UponSkip)</b></td><td>Önceki atlanmışsa</td><td>Nadir yollar</td></tr></table></div>
<div class="warn"><b>Sık hata: hata yolu bütün hattı başarılı gösterir</b>Bir adım düşüp hata yolundaki Teams etkinliği başarılı olursa hat genel durumda “başarılı” görünebilir. Düşmüşse düşmüş görünmeli: hata yolunun sonuna bir <b>Fail</b> etkinliği koy. Böylece izleme doğru rengi gösterir ve zincir durur.</div>
<p>Birden çok ok aynı etkinliğe bağlanırsa koşullar birlikte aranır. “A hata ya da B hata” için tek bir bildirim etkinliğine iki hata oku bağlamak, ikisinin de hata vermesini bekler; ayrı bildirim kullan ya da <b>Tamamlandığında</b> ve durum ifadesiyle kur. Ayrıntı için Learn’deki güncel belgeyi izle.</p>
<h2>Yeniden deneme ve zaman aşımı</h2>
<div class="tbl-wrap"><table><tr><th>Ayar</th><th>Varsayılan</th><th>Not</th></tr>
<tr><td>Timeout</td><td>12 saat; en fazla 7 gün</td><td><code>0.12:00:00</code> biçiminde</td></tr>
<tr><td>Yeniden deneme</td><td>Ayarlı değilse denemez; açılırsa 1 kez</td><td>Geçici ağ hatası için</td></tr>
<tr><td>Yeniden deneme aralığı</td><td>30 saniye</td><td></td></tr>
<tr><td>Secure input/output</td><td>Kapalı</td><td>Gizli değeri günlükten saklar</td></tr></table></div>
<p>Yeniden deneme <b>güvenli olmayan adımı tehlikeye atar</b>: “ekle” yapan bir kopyalama yeniden denenirse satırlar iki kez yazılır. Bu yüzden hat <b>yeniden çalıştırılabilir (idempotent)</b> olmalı: tam yüklemede önce temizle, artımlı yüklemede anahtarla birleştir.</p>
<h2>Parametre, değişken, ifade</h2>
<p><b>Parametre</b> çalışma başına sabittir. <b>Değişken</b> çalışma sırasında değişir. Değerler dinamik içerik ifadesiyle kullanılır:</p>
<pre class="dax" data-notry>@pipeline().parameters.Ortam                       // parametre
@variables('SonTarih')                              // değişken
@activity('Lookup1').output.firstRow.WatermarkValue // önceki etkinliğin çıktısı
@pipeline().RunId                                   // bu çalışmanın kimliği
@concat('satis_', formatDateTime(utcNow(), 'yyyyMMdd'), '.csv')
"Ortam: @{pipeline().parameters.Ortam}"             // metin içine gömme</pre>
<p>İki ayrıntı sınavda ve işte can sıkar. <b>Birincisi:</b> tek başına <code>@pipeline().parameters.Sayi</code> sayı döndürür, <code>@{pipeline().parameters.Sayi}</code> metin döndürür. <b>İkincisi:</b> zamanlamadan parametre geçerken ad birebir eşleşmeli; yanlış yazılan ad hata vermeden yok sayılır ve varsayılan değerle çalışır.</p>
<h2>Filigranla artımlı yükleme</h2>
<p>Her gece her şeyi kopyalamak yerine yalnız değişeni al. Learn’ün örneğindeki kalıp:</p>
<ol><li><b>Lookup:</b> filigran tablosundan son değeri oku.</li><li><b>Lookup:</b> kaynağın en büyük değişim zamanını oku.</li><li><b>Copy data:</b> ikisi arasındaki satırları al.</li><li><b>Stored procedure:</b> filigranı yeni değere güncelle, yalnız kopyalama başarılıysa.</li></ol>
<pre class="dax" data-notry>SELECT * FROM dbo.Satislar
WHERE DegisimZamani &gt; '@{activity('EskiFiligran').output.firstRow.Deger}'
  AND DegisimZamani &lt;= '@{activity('YeniFiligran').output.firstRow.Deger}'</pre>
<p>Üst sınır neden şimdiki zaman değil? Çünkü Lookup ile kopya arasında gelen satırlar bir sonraki gece alınsın diye en büyük değer sabitlenir. Copy job bunun büyük kısmını kendiliğinden yapar; hattı yalnız çevresinde başka iş varsa kur. Silinen satırlar filigranla görünmez; CDC ya da karşılaştırma gerekir.</p>
<h2>Zamanlama ve tetikleyici</h2>
<ul><li><b>Zamanlama:</b> hat başına en çok 20. Başlangıç ve bitiş tarihi zorunlu; uzun süre için uzak bir bitiş ver. Saat dilimini bilinçli seç.</li><li><b>Aralık tabanlı zamanlama (önizleme):</b> pencere başlangıç ve bitişi parametresi verir; düzenlenemez, silip yeniden kurulur.</li><li><b>Olay tetikleyici:</b> OneLake ya da Blob’a dosya düşünce çalışır. Bir Reflex öğesi oluşur, olay akışı üstüne kuruludur.</li><li><b>Çalıştırma koşulları (önizleme):</b> üst hattın ya da verinin hazır olmasını bekler.</li></ul>
<p>Olay ifadesinde boş değere dikkat: elle test edince değer gelmez, güvenli gösterim kullan: <code>@pipeline()?.TriggerEvent?.FileName</code>. Hata e-postası <b>Hata bildirimleri</b> ayarıyla kurulur ve yalnız zamanlanmış çalışmalarda gider; elle çalıştırmada gitmez.</p>
<h2>İzleme ve teşhis</h2>
<p>Tuvalin altındaki <b>Çıktı</b> sekmesi her etkinliğin durumunu, süresini, girdi ve çıktısını gösterir. Geçmiş çalışmalar Monitor hub’dadır. Teşhis sırası: ilk kırmızı etkinliği bul, hata iletisini oku, girdiyi kontrol et (ifadeler doğru çözüldü mü?), sonra çıktıya bak. İşlem hattı Copilot’u hatayı açıklayabilir ama nedeni kanıtlamaz (“Fabric’te Copilot” dersi).</p>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Olası neden</th><th>Çözüm</th></tr>
<tr><td>Hat başarılı, satır 0</td><td>Filigran ifadesi hep aynı, parametre adı yanlış</td><td>Girdiyi aç; adı eşleştir</td></tr>
<tr><td>Satırlar iki kat</td><td>Ekle modu ve yeniden deneme</td><td>Temizle ya da birleştir</td></tr>
<tr><td>Model eski veriyi gösteriyor</td><td>Yenileme bağımsız saatte, ya da hatada da çalışıyor</td><td>Başarıda oku</td></tr>
<tr><td>Sonraki adım yeni tabloyu görmüyor</td><td>SQL uç noktası eşitlenmedi</td><td>Refresh SQL analytics endpoint</td></tr>
<tr><td>Hata var, kimse haber almadı</td><td>Elle çalıştırma, ya da hata yolu yok</td><td>Bildirim ve Fail</td></tr>
<tr><td>Şirket içi kopyada bağlantı hatası</td><td>Ağ geçidi sürümü, güvenlik duvarı</td><td>Sürüm ve <code>*.frontend.clouddatahub.net</code></td></tr></table></div>
` + ORTAM + TRIAL + `Denemede: AnadoluLH lakehouse’una bağlı boş bir hat aç; <b>Copy data</b> ile <code>Files/ham/Urunler.csv</code> dosyasını <code>Urunler_PL</code> tablosuna yaz (beklenen: 40 satır). Ardından bir <b>Notebook</b> etkinliği ekle ve okla bağla. Sonuna <b>Fail</b> ve hata yolu ekle, kasıtlı olarak yanlış dosya adıyla çalıştırıp <b>Çıktı</b> sekmesini oku.</div>
`,
  ex: [
    { t: 'mc', q: 'Gece hattı: Kopyala → Yordam → Model yenile. Yordam başarısız olduğu gece model yine yenilendi. Hangi yanlış yapılmış?', o: ['Ok “Tamamlandığında”', 'Yordamda Secure output açık', 'Hat 120 etkinliği aşmış', 'Saat dilimi yanlış'], a: 0, why: 'Tamamlandığında koşulu başarı ve hatada çalışır. Yenilemeyi yalnız başarıya bağlamak gerekir. Secure output yalnız günlüğü etkiler.' },
    { t: 'mc', q: 'Hata yolunda Teams mesajı atıyorsun. Bu gece kopyalama düştü, mesaj gitti, ama Monitor hub’da hat “Başarılı” görünüyor. İstenen “Başarısız”. Ne eklersin?', o: ['Yeniden deneme', 'Fail etkinliği', 'Daha uzun Timeout', 'Wait etkinliği'], a: 1, why: 'Hata yakalanıp başka etkinlik başarılı olunca hat başarılı sayılabilir. Fail etkinliği hattı açıkça başarısız yapar, üst zincir de doğru davranır.' },
    { t: 'mc', q: 'Filigranlı yükleme doğru sırada hangisi?', o: ['Copy → eski oku → yeni oku → güncelle', 'Eski oku → yeni oku → Copy → güncelle', 'Güncelle → eski oku → Copy → yeni oku', 'Yeni oku → güncelle → eski oku → Copy'], a: 1, why: 'Önce iki sınır okunur, aralık kopyalanır, kopya başarılı olursa filigran güncellenir. Önce güncellemek başarısız kopyada veri kaçırır.' },
    { t: 'mc', q: 'Zamanlamada parametreye “Tarih” yazdın; hattın parametresi “tarih”. Hata yok, ama hat hep varsayılan tarihle çalışıyor. Sebep?', o: ['Zamanlama parametre geçiremez', 'Ad birebir eşleşmeli', 'Parametre türü tarih olmalı', 'Önizleme özelliği kapalı'], a: 1, why: 'Learn: ad birebir eşleşmeli, uyuşmayan ad çalışma anında sessizce yok sayılır. Bu hata en zor bulunanlardandır; Çıktı’da girdiyi kontrol et.' },
    { t: 'mc', q: '<code>@{pipeline().parameters.Adet}</code> ifadesi sayı beklenen bir alana yazıldı, tür hatası alındı. Düzeltme?', o: ['@pipeline().parameters.Adet', '@concat(Adet)', '@@pipeline().parameters.Adet', 'Parametreyi silmek'], a: 0, why: 'Tek başına ifade özgün türü döndürür; @{...} her zaman metin üretir. @@ ise gerçek @ karakteri demektir.' },
    { t: 'mc', q: 'Kopyalama etkinliği ekle modunda. Retry 2 yapıldı. Ağ koptuğu gece satırların bir kısmı iki kez geldi. En sağlam çözüm?', o: ['Retry’ı kapatmak', 'Anahtarla birleştirmek', 'Timeout büyütmek', 'Copy’yi gece yarısına almak'], a: 1, why: 'Geçici hatada yeniden deneme iyidir; asıl sorun adımın yeniden çalıştırılamaması. Anahtarla birleştirme ya da aralığı önce silmek idempotent yapar.' },
    { t: 'mc', q: 'Spark bir tablo yazdı, hemen ardından Stored procedure etkinliği uç noktadan okuyor ve tabloyu bulamıyor. İlk düzeltme?', o: ['60 dakika Wait eklemek', 'Refresh SQL analytics endpoint', 'Fail etkinliği', 'Aralık tabanlı zamanlama'], a: 1, why: 'Bu tam olarak o etkinliğin işi: meta veriyi eşitler. Sabit bekleme kırılgandır, Fail sorunu çözmez.' },
    { t: 'mc', q: 'Geliştirici hattı elle çalıştırdı, düştü, e-posta gelmedi. Failure notifications’a ekip listesi ekli. Neden?', o: ['E-posta sunucusu arızalı', 'Yalnız zamanlıda gider', 'Ayrı Fabric kapasitesi gerekir', 'Liste güvenlik grubu olmalı'], a: 1, why: 'Learn: bu bildirimler yalnız zamanlanmış çalışmalar için geçerlidir, elle çalıştırmada gitmez. Test için bir zamanlama kullan.' },
    { t: 'mc', q: 'Ofis saatlerinde farklı dosyalar farklı anda gelecek. Dosya düşünce hat çalışsın. Hangisi?', o: ['20 zamanlama', 'Olay tetikleyici', 'Until döngüsü', 'Aralık tabanlı zamanlama'], a: 1, why: 'OneLake dosya olayı tetikleyicisi tam bunun içindir. Sürekli çalışan döngü kapasite harcar, zamanlama saati bilir, olayı değil.' },
    { t: 'query', q: 'Gece hattının sonuna bir mutabakat ekliyorsun. Modelde beklenen kontrol: her <code>Tarih[Yil]</code> için <b>Satır</b> ve <b>Net Satış</b> döndür; bugünkü çıktıyı hattın kaydıyla karşılaştıracaksın.', start: 'EVALUATE\n', sol: 'EVALUATE\nADDCOLUMNS(VALUES(Tarih[Yil]), "Satır", CALCULATE(COUNTROWS(Satislar)), "Net Satış", [Net Satış])', hint: 'ADDCOLUMNS(VALUES(Tarih[Yil]), "Satır", CALCULATE(COUNTROWS(Satislar)), "Net Satış", [Net Satış])' }
  ]
});

/* ---------- Anlam modeli ---------- */
add('fabric-yildiz', {
  id: 'fabric-anlam-modeli', lv: 'C1', mod: 'Fabric', min: 30,
  title: 'Fabric’te anlam modeli (semantic model): Direct Lake’i kurmak ve işletmek',
  sum: 'Varsayılan modelin kalkması, modeli lakehouse üstünde oluşturmak, Direct Lake’in iki biçimi arasında karar, çerçeveleme ve otomatik güncelleme, kapasite sınırları, izinler, Desktop ve web modelleme.',
  body: `
<p>Altın tablolar hazır. Şimdi rapor yazarlarına anlam katmanı gerekiyor. Power BI’ın modeli Fabric’te de <b>anlam modeli</b>dir; ölçü ve ilişki aynıdır. Değişen, verinin modele nasıl geldiğidir. Depolama modlarının mimari karşılaştırması “Kurumsal model” dersinde; burada modeli <b>kurmak ve işletmek</b> var.</p>
<h2>Model kurmak</h2>
<p>Learn’e göre lakehouse ve ambarlarda varsayılan anlam modeli 5 Eylül 2025’ten sonra otomatik oluşturulmuyor. Akış:</p>
<ol><li>Lakehouse ya da ambarda yeni bir anlam modeli oluştur ve tabloları seç. Service ya da Desktop’tan kurulabilir; hangi Direct Lake biçiminin oluştuğunu model ayarlarından kontrol et, arayüz değişebilir.</li><li>İlişkileri kur, tarih tablosunu işaretle.</li><li>Ölçüleri yaz. DAX aynıdır.</li><li>Biçim, görüntüleme klasörü, açıklama, gizli sütunlar.</li><li>RLS varsa rol ve üye; sınamayı Görüntüleyici ile yap.</li></ol>
<p>Çalışma alanım’da Direct Lake modeli olmaz. Model, kaynakla aynı bölgede olmalıdır. Birden çok Fabric kaynağı OneLake biçiminde olur.</p>
<h2>Hangi Direct Lake?</h2>
<div class="tbl-wrap"><table><tr><th></th><th>Direct Lake on OneLake</th><th>Direct Lake on SQL</th></tr>
<tr><td>Kaynak</td><td>Bir ya da çok Fabric öğesi</td><td>Tek öğenin SQL uç noktası</td></tr>
<tr><td>DirectQuery’ye düşme</td><td>Hiç; sınır aşılırsa sorgu hata verir</td><td>Var; görünüm, SQL RLS, sınır aşımı</td></tr>
<tr><td>SQL görünümü</td><td>Desteklenmez (somut değilse)</td><td>DirectQuery’ye düşer</td></tr>
<tr><td>SQL tarafı RLS/OLS</td><td>Uygulanmaz</td><td>RLS düşürür; OLS hata verebilir</td></tr>
<tr><td>Import ile bileşik</td><td>Var</td><td>Aynı modelde yok</td></tr>
<tr><td>Hesaplanmış sütun</td><td>Yalnız kullanıcı bağlamı (önizleme)</td><td>Yok (hesaplama grubu, alan parametresi var)</td></tr>
<tr><td>Otomatik tarih/saat</td><td>Var</td><td>Yok</td></tr></table></div>
<p>Pratik karar: SQL güvenliğini model kapısında istemiyor ve tahmin edilebilir performans istiyorsan OneLake biçimi. Bir SQL görünümü üzerinde çalışmak zorundaysan ya da mevcut uç nokta güvenliği şartsa SQL biçimi; ama düşmeyi izle. Kalıcı çözüm görünümü Delta tablosuna çevirmektir.</p>
<h2>Çerçeveleme ve otomatik güncelleme</h2>
<p>Direct Lake’te “yenileme”, modelin hangi Delta dosyalarına baktığını güncellemektir (çerçeveleme, framing). Veri kopyalanmaz, saniyeler sürer.</p>
<div class="tbl-wrap"><table><tr><th>Yöntem</th><th>Ne zaman?</th><th>Dikkat</th></tr>
<tr><td>Otomatik güncellemeler (açık)</td><td>Delta değiştikçe yansısın</td><td>Toplu yazma ortasında yarım veri görünebilir</td></tr>
<tr><td>Otomatik kapalı + hat sonunda yenileme</td><td>Veri bittikten sonra tek seferde</td><td>Rakamlar tutarlı değişir; gece hatları için iyi</td></tr>
<tr><td>Zamanlanmış</td><td>Düzenli, olaysız</td><td>Hattan bağımsızsa sıra riski</td></tr></table></div>
<p>Gece hattında otomatik güncellemeyi kapatmak yaygın bir karardır: gümüş ve altın yazılırken rapor yarım veri göstermez, hat sonundaki anlam modeli yenileme etkinliği çerçeveyi bir kerede değiştirir. Çerçeveleme sonrası ilk sorgu soğuktur; sütunlar belleğe yüklenir.</p>
<h2>Kapasite sınırları (guardrail)</h2>
<div class="tbl-wrap"><table><tr><th>SKU</th><th>Tablo başına dosya/satır grubu</th><th>Tablo başına satır</th><th>Model boyutu</th><th>Bellek</th></tr>
<tr><td>F2, F4, F8</td><td>1.000</td><td>300 milyon</td><td>10 GB</td><td>3 GB</td></tr>
<tr><td>F16</td><td>1.000</td><td>300 milyon</td><td>20 GB</td><td>5 GB</td></tr>
<tr><td>F32</td><td>1.000</td><td>300 milyon</td><td>40 GB</td><td>10 GB</td></tr>
<tr><td>F64</td><td>5.000</td><td>1,5 milyar</td><td>Sınırsız</td><td>25 GB</td></tr>
<tr><td>F128</td><td>5.000</td><td>3 milyar</td><td>Sınırsız</td><td>50 GB</td></tr></table></div>
<p>Learn, Eylül 2026. Bellek sınırı gerçek bir “guardrail” değildir: aşılırsa yavaşlar. Sınır aşılınca davranış biçime göre değişir: OneLake biçiminde yenileme başarısız olur, tablo iyileştirilene kadar sorgu çalışmaz; SQL biçiminde düşme açıksa DirectQuery ile çalışır, uyarıyla. Küçük dosyaları birleştirmek (OPTIMIZE) çoğu zaman SKU büyütmekten önce gelir.</p>
<h2>İzinler ve ağ</h2>
<ul><li>Kullanıcının modeli sorgulaması için modelde okuma izni yeterli değildir; biçime göre Delta dosyalarına ya da uç noktaya da erişim gerekir. Uygulamayla dağıtımda “Direct Lake izin gereksinimleri” sayfasını oku.</li><li>Bağlantı yalnız bulut bağlantısıdır; şirket içi ağ geçidi kullanılmaz.</li><li>SQL biçiminde kimlik, sahibin kimliğidir; son kullanıcı kimliğiyle geçiş için OneLake biçimi ya da uç noktanın kullanıcı kimliği modu gerekir (“OneLake” dersi).</li></ul>
<h2>Nereden düzenlenir?</h2>
<div class="tbl-wrap"><table><tr><th>Araç</th><th>Güçlü yanı</th><th>Sınır</th></tr>
<tr><td>Desktop canlı düzenleme</td><td>Tanıdık arayüz, TMDL görünümü, hesaplama grubu, alan parametresi</td><td>Değişiklik doğrudan Service’teki modele gider; dikkatli ol</td></tr>
<tr><td>Web modelleme</td><td>Tarayıcıda, Copilot (önizleme)</td><td>Doğrulama sınırlı: kardinalite ve yön sorguyla denetlenmez</td></tr>
<tr><td>XMLA, Tabular Editor</td><td>Toplu değişiklik, BPA</td><td>Kapasite ve okuma-yazma ayarı</td></tr>
<tr><td>Git, PBIP</td><td>Sürüm, inceleme</td><td>“Yerel geliştirme” ve “Yaşam döngüsü” dersleri</td></tr></table></div>
<p>Canlı düzenleme, üretim modeline doğrudan yazmaktır. Geliştirmede kendi çalışma alanını kullan.</p>
<h2>DAX aynı, kontrol farklı</h2>
<p>Bu uygulamadaki ölçülerin hepsi Direct Lake’te de geçerlidir. Ama model kurarken bakılacak şey başka: sütun türleri kaynakla aynı mı (ilişkilerde tür birebir olmalı), bir tarafın anahtarı tekil mi, GUID ve ikili türler var mı? Tekilliği sorguyla sınarsın:</p>
<pre class="dax">EVALUATE
ROW(
    "Satır", COUNTROWS(Urunler),
    "Tekil Anahtar", DISTINCTCOUNT(Urunler[UrunNo]),
    "Yetim Satış Satırı", COUNTROWS(FILTER(Satislar, ISBLANK(RELATED(Urunler[UrunNo]))))
)</pre>
` + ORTAM + TRIAL + `Denemede “Ambar ödevi”ndeki tablolardan yeni bir anlam modeli oluştur, üç ilişki kur, iki ölçü ekle ve bir rapor sayfası çiz. Toplam: Net Satış 1.250.772,45 çıkmalı. Otomatik güncellemeleri kapatıp bir hat sonunda yenilemeyi dene. F4 sınırları küçük; büyük veri denemesi yapma.</div>
`,
  ex: [
    { t: 'mc', q: 'Hat gece gümüş ve altını yazıyor. 02:30’da bir müdür raporu açtı, kategoriler toplamı tutmadı. 03:00’te düzeldi. En olası neden ve çözüm?', o: ['Otomatik güncellemeyi kapat', 'Tarih tablosunu yeniden işaretle', 'RLS rolü ekle', 'F64’e geçip belleği artır'], a: 0, why: 'Otomatik güncelleme açıksa çerçeve yazma sırasında değişir, tablolar farklı anlara bakar. Kapatıp hat sonunda yenilemek tutarlı anlık görüntü verir.' },
    { t: 'mc', q: 'Yeni bir model SQL görünümü kullanacak ve kullanıcılar sayfa açılışının bazen çok yavaşladığını söylüyor. SQL biçiminde Direct Lake. Bulgu?', o: ['Görünüm DirectQuery’ye düşürür', 'Direct Lake görünümü önbelleğe alır', 'Bellek sınırı RLS’e bağlıdır', 'Çerçeveleme gecikmiştir'], a: 0, why: 'SQL biçiminde görünümler Delta dosyası olmadığı için sorgular DirectQuery ile çalışır. Çözüm görünümü Delta tablosuna çevirmek.' },
    { t: 'mc', q: 'F8 kapasitede tablo 400 milyon satıra ulaştı. Model OneLake biçiminde Direct Lake. Sabah ne görürsün?', o: ['Yavaş ama çalışır', 'Yenileme başarısız olur', 'DirectQuery’ye düşer', 'Fazla satırlar atlanır'], a: 1, why: 'F8 sınırı 300 milyon. OneLake biçiminde düşme yoktur; yenileme başarısız olur ve Delta iyileştirilene ya da SKU büyüyene kadar sorgulanamaz.' },
    { t: 'mc', q: 'Lakehouse’ta SQL RLS tanımladın. OneLake üzerinde Direct Lake model kullanıyorsun; kullanıcılar kısıtlanmıyor. Neden?', o: ['Hata; destek kaydı aç', 'Bu biçim SQL RLS uygulamaz', 'RLS ağ geçidi ister', 'Kullanıcı ReadAll olmalı'], a: 1, why: 'Learn: OneLake biçiminde SQL uç noktası RLS ve OLS’i uygulanmaz. Kuralı model RLS’i ya da OneLake rolüyle ver.' },
    { t: 'mc', q: 'Aynı modele iki kaynak lakehouse’tan tablo alınacak. Hangisi?', o: ['SQL biçiminde tek uç nokta', 'OneLake biçimi', 'Görünümle birleştirmek', 'İkisini de Import’a çevirmek'], a: 1, why: 'OneLake biçimi birden çok Fabric öğesini kaynak alabilir; SQL biçimi tek öğeyle sınırlıdır.' },
    { t: 'mc', q: 'Analist üretim modeline Desktop’tan canlı bağlanıp bir ilişkiyi “denemek için” değiştirdi. Sonra raporlar bozuldu. Süreç önerisi?', o: ['Desktop’ı yasaklamak', 'Geliştirme alanı ve Git', 'Her ay yedek almak', 'Yalnız web modelleme'], a: 1, why: 'Canlı düzenleme doğrudan modele yazar. Geliştirme alanı, sürüm kontrolü ve dağıtım kapısı bu riski kapatır. Web modelleme de aynı modele yazar.' },
    { t: 'mc', q: 'İlişki Direct Lake’te hata veriyor: iki sütun da “MusteriNo” ama biri int, biri bigint. Çözüm?', o: ['Delta’da türü eşitlemek', 'Modelde hesaplanmış sütun', 'İlişkiyi çift yönlü yapmak', 'Önbelleği temizlemek'], a: 0, why: 'Learn: ilişki sütunları aynı veri türünde olmalı. Hesaplanmış sütun bu biçimde sınırlıdır. Dönüşüm kaynağa aittir.' },
    { t: 'query', q: 'Model kurmadan önce anahtarları sına. Tek satırda <b>Müşteri Satırı</b> (<code>COUNTROWS(Musteriler)</code>), <b>Tekil No</b> (<code>DISTINCTCOUNT(Musteriler[MusteriNo])</code>) ve <b>Boş Bölge</b> (Bolge boş satır sayısı) döndür.', start: 'EVALUATE\n', sol: 'EVALUATE\nROW("Müşteri Satırı", COUNTROWS(Musteriler), "Tekil No", DISTINCTCOUNT(Musteriler[MusteriNo]), "Boş Bölge", COUNTROWS(FILTER(Musteriler, ISBLANK(Musteriler[Bolge]))))', hint: 'COUNTROWS(FILTER(Musteriler, ISBLANK(Musteriler[Bolge])))' }
  ]
});

/* ---------- Copilot ---------- */
add('fabric-anlam-modeli', {
  id: 'fabric-copilot', lv: 'C1', mod: 'Fabric', min: 22,
  title: 'Fabric ve Power BI’da Copilot: gerçekte ne yapar, neyi yapmaz?',
  sum: 'İş yüküne göre Copilot, durum etiketleri, kapasite ve bölge şartları, gönderilen veri, Data Factory’deki sınırlar; “Copilot yaptı” dedikten sonra doğrulama akışı ve veri ajanı ile farkı.',
  body: `
<p>Copilot’un en büyük riski, yapamadıkları değil, <b>yaptığını doğru sanman</b>dır. Rapor bölmesi, model hazırlığı ve “Yapay zekâ için verileri hazırla” “Copilot ile çalışmak” dersinde anlatıldı. Bu ders Fabric’in geri kalanına bakar ve abartmadan ne bekleyeceğini gösterir.</p>
<div class="warn"><b>Bu tablo hızla eskir</b>Bilgiler Kasım 2026’da Learn’den okundu. Learn’ün iki sayfası her zaman aynı terimi kullanmıyor; bir özellik “genel kullanım” derken diğeri tüm yapay zekâ özelliklerini “önizleme” olarak anabilir. Karar vermeden önce resmî sayfayı aç.</div>
<h2>Nerede ne yapar?</h2>
<div class="tbl-wrap"><table><tr><th>İş yükü</th><th>Copilot ne yapabilir?</th><th>Durum (Learn)</th></tr>
<tr><td>Power BI rapor bölmesi</td><td>Veriyle sohbet, özet, görsel; düzenlemede sayfa önerisi</td><td>Genel kullanım</td></tr>
<tr><td>Bağımsız Power BI ajanı</td><td>Rapor ve modelleri arar, soruyu yönlendirir</td><td>Önizleme</td></tr>
<tr><td>Uygulama içi Copilot</td><td>Yalnız uygulama içeriği ve kullanıcının izni</td><td>Önizleme</td></tr>
<tr><td>Web modelleme</td><td>Model sorunlarını bulur, ölçü ve nesne düzenler</td><td>Önizleme</td></tr>
<tr><td>Data Factory</td><td>Dataflow Gen2’de sorgu ve adım; işlem hattında üretme, özetleme, hata ve ifade yardımı</td><td>Ayrıntı sayfası etiketlemiyor; Copilot genel sayfası önizleme diyor</td></tr>
<tr><td>Not defteri</td><td>Kod üretme, düzenleme, hata düzeltme (Fix with Copilot önizleme)</td><td>Önizleme</td></tr>
<tr><td>Ambar</td><td>Doğal dilden SQL, kod tamamlama</td><td>Önizleme</td></tr>
<tr><td>Real-Time Intelligence</td><td>Doğal dilden KQL</td><td>Önizleme</td></tr></table></div>
<h2>Şartlar</h2>
<ul><li><b>Kapasite:</b> ücretli Fabric F2 ve üstü ya da Power BI Premium P SKU. <b>Pro ya da PPU tek başına yetmez.</b> Yeni açılan ya da büyütülen kapasitede 24 saate kadar gecikebilir.</li><li><b>Deneme:</b> Copilot, veri ajanı ve yapay zekâ fonksiyonları deneme kapasitesinde çalışmaz. Öğrenirken bunu kapasitesiz deneyemezsin.</li><li><b>Kiracı:</b> “Users can use Copilot and other features powered by Azure OpenAI” açık olmalı. Bazı önizlemeler ayrı ayara bağlıdır.</li><li><b>Bölge:</b> ABD ve AB veri sınırı dışındaki kapasitelerde kapalı başlar; bölgeler arası işleme ayarı yöneticidedir. Bağımsız deneyim bazı bölgelerde yoktur; güncel listeye bak.</li><li><b>Tüketim:</b> kapasite birimi harcar. Ayrı Fabric Copilot kapasitesi faturayı ayırır.</li></ul>
<h2>Veri nereye gider?</h2>
<p>Learn’ün iki sayfası bu konuda aynı kesinlikte değil. Genel bakış sayfası prompt, sistem istemi, şema ve sohbet geçmişinin gittiğini, tablo içeriğinin kullanıcı yönlendirmedikçe gitmediğini yazar. Gizlilik ve güvenlik sayfası ise temel alma verisinin (grounding) “şema, belirli veri noktaları ve göreve ilişkin başka bilgiler” içerebileceğini söyler ve ayrıntıyı her iş yükünün kendi sayfasına bırakır. Yani “satır gitmez” diye kesin konuşma: hassas veride kullandığın iş yükünün sayfasını oku. Aynı sayfaya göre veri model eğitiminde kullanılmaz, Copilot yalnız kullanıcının izinli olduğu veriye erişir. Veri sınıflandırma ve hukuk kuralları için yine kuruluşun onayını al. Prompta <b>gerçek müşteri listesi yapıştırma</b>. RLS kullanıcının izinleriyle çalışır; ama veri şemasında maaş gibi alanları açmak gerekmiyorsa açma.</p>
<h2>Data Factory’de sınırlar</h2>
<p>Dataflow Gen2 Copilot’u için Learn şunları açıkça yazar:</p>
<ul><li>Bir istekte birden çok sorgu üzerinde dönüşüm yapamaz: “tüm sorgularda başlıkları büyüt” olmaz.</li><li>Önceki istemin bağlamını korumaz; onaylanan değişikliği geri alamaz (arayüzden silersin).</li><li>Örneklenmiş veri dışındaki sorularda yanlış cevap verebilir.</li><li><b>Desteklemediği isteği her zaman söylemez.</b> İstatistik analizi gibi bir istek hata göstermeden sonuçsuz kalabilir.</li></ul>
<p>Son madde en önemlisidir: “hiçbir şey olmadı” sonucu “bir şey doğru yapıldı” demek değildir.</p>
<h2>Doğrulama akışı</h2>
<ol><li><b>Ne istediğini ölçülebilir yaz.</b> “Satışları temizle” değil, “Tutar’ı decimal yap, Durum İptal olanları çıkar”.</li><li><b>Üretileni oku.</b> Adım, SQL, kod. Anlamadığını kabul etme.</li><li><b>Bilinen sayıyla sına.</b> Bu modelde Net Satış 1.250.772,45.</li><li><b>Kenar durum:</b> boş, sıfır, çoklu seçim, toplam satırı.</li><li><b>Sahipliği devretme.</b> Üretime giden her şeyi bir kişi anlamış olmalı. “Copilot yazdı” bir mazeret değildir.</li></ol>
<p>DAX üretimi için kontrol listesi “Yapay zekânın yazdığı DAX’ı denetlemek” dersinde. Copilot’tan gelen tipik hata iptalleri atlamaktır. Doğru sayıyla kıyasla:</p>
<pre class="dax">EVALUATE
ROW(
    "Copilot Önerisi", SUM(Satislar[Tutar]),
    "Doğru Tanım", [Net Satış],
    "Fark", SUM(Satislar[Tutar]) - [Net Satış]
)</pre>
<p>Fark 95.417,40 ₺. Bu büyüklükte bir hata toplantıda fark edilir; küçük olsa fark edilmezdi.</p>
<h2>Copilot, Fabric veri ajanı, Soru-Cevap</h2>
<div class="tbl-wrap"><table><tr><th></th><th>Ne?</th><th>Dikkat</th></tr>
<tr><td>Rapor Copilot’u</td><td>Açık raporla sohbet</td><td>Rapor bağlamı</td></tr>
<tr><td>Veri ajanı (data agent)</td><td>Hazırladığın kaynaklar üzerinden sorulan soruları cevaplayan öğe</td><td>Denemede yok; talimat ve örnek sorularla kurulur, ayrı değerlendir</td></tr>
<tr><td>Soru-Cevap (Q&amp;A)</td><td>Eski doğal dil</td><td>Learn: Şubat 2027’de kalkıyor (önceki duyurularda Aralık 2026). Yeni tasarımda kullanma</td></tr></table></div>
<h2>Ne zaman kullan, ne zaman kullanma?</h2>
<div class="tbl-wrap"><table><tr><th>İyi</th><th>Zayıf</th></tr>
<tr><td>Başlangıç iskeleti, açıklama, hata iletisini okumak</td><td>Doğruluğu kritik mali tablo, tek başına</td></tr>
<tr><td>Ölçü açıklaması, ifade yazmak</td><td>İş kuralını bilmesi gereken yorumlar</td></tr>
<tr><td>Bilinmeyen sözdizimini hatırlatmak</td><td>İngilizce dışı dilde önemli sorular (resmî olarak desteklenmez)</td></tr></table></div>
<p>Türkçe istemler çoğu zaman çalışır, ama resmî destek yoktur. Önemli soruda İngilizce sor ve cevabı doğrula.</p>
<div class="tip"><b>Deneyemezsen</b>Copilot için ücretli kapasite gerekir; bu uygulamada Copilot yoktur. Yine de doğrulama akışını burada öğrenebilirsin: “Yapay zekânın yazdığı DAX’ı denetlemek” dersindeki bozuk ölçüleri düzelt, aynı refleksi gerçek Copilot’ta kullan.</div>
`,
  ex: [
    { t: 'mc', q: 'Şirket Fabric deneme kapasitesiyle pilot yapıyor; Copilot görünmüyor. Yönetici “kiracı ayarı açık” diyor. Sebep?', o: ['Rapor sayfası az', 'Denemede desteklenmez', 'Dil Türkçe', 'Kullanıcı Görüntüleyici'], a: 1, why: 'Learn: deneme kapasitelerinde Copilot ve veri ajanı çalışmaz. F2 ve üstü ücretli kapasite gerekir.' },
    { t: 'mc', q: 'Dataflow Gen2 Copilot’una “bütün sorgularda başlıkları büyük harf yap” dedin. Hiçbir şey olmadı, hata da yok. Doğru yorum?', o: ['Yapıldı, yenilemek gerek', 'Çoklu sorgu desteklenmez', 'Kapasite doldu', 'Önce sorgu grubu gerekir'], a: 1, why: 'Learn: bir girişte birden çok sorgu üzerinde işlem yapılamaz ve desteklenmeyen istek bildirilmeyebilir. Sessiz sonuç başarı sayılmaz.' },
    { t: 'mc', q: 'Yönetici “Copilot Net Satış’ı 1.346.190 ₺ buldu, sen 1.250.772 ₺ diyorsun” diyor. İlk adımın?', o: ['Copilot’a inanırım', 'Hangi alanı kullandığına bakarım', 'Rapordaki sayıyı değiştiririm', 'Soruyu Türkçe yerine tekrar sorarım'], a: 1, why: 'Fark iptal tutarı kadar: Copilot büyük olasılıkla iptalleri dahil etti. Üretilen görselin alanını ve ölçüsünü aç, sonra talimatla [Net Satış]’a yönlendir.' },
    { t: 'mc', q: 'Pro lisanslı bir ekip, Copilot için PPU almayı düşünüyor. Doğru bilgi?', o: ['PPU Copilot’u açar', 'PPU tek başına yetmez', 'Pro yeter', 'Copilot için ayrı lisans gerekir'], a: 1, why: 'Learn: Pro ya da PPU tek başına yeterli değildir, kuruluş kapasitesi gerekir.' },
    { t: 'mc', q: 'Analist Copilot’a “maaşları analiz et” diye gerçek maaş dosyasını yapıştırmak istiyor. Yanıtın?', o: ['Sorun yok, Azure güvenli', 'Kurum onayı olmadan olmaz', 'İngilizce yazarsan olur', 'Yalnız RLS ile olur'], a: 1, why: 'Prompt verisi kuruluş kurallarına tabidir. Gizli veri, açık onay olmadan istemlere yazılmaz. İstemdeki metin Copilot’a gider; yapıştırdığın maaşlar da onunla gider. Otomatik temel alma verisinin kapsamı için iş yükü sayfasını oku.' },
    { t: 'mc', q: 'Yeni büyütülen F64 kapasitede Copilot henüz açılmadı. Hemen ne yaparsın?', o: ['Kiracıyı sıfırlarım', '24 saate kadar beklerim', 'P SKU’ya geçerim', 'Çalışma alanını silerim'], a: 1, why: 'Learn: yeni ya da büyütülmüş kapasitede Copilot’un görünmesi 24 saate kadar sürebilir. Kiracı ayarı ve bölge kontrol edilir.' },
    { t: 'mc', q: 'Yeni bir pano tasarımında soru kutusu için Soru-Cevap kullanılacak. Görüşün?', o: ['Kullan, sürekli destekleniyor', 'Kullanma; kaldırılıyor', 'Yalnız mobilde kullan', 'Önce Q&A kurulumunu tamamla'], a: 1, why: 'Learn güncel uyarısı Şubat 2027 diyor, önceki duyurular Aralık 2026. Tarihten bağımsız yeni tasarım buna dayanmamalı.' },
    { t: 'dax', name: 'Copilot Düzeltilmiş Pay', q: '<b>Copilot Düzeltilmiş Pay</b>: Copilot şu ölçüyü önerdi: <code>DIVIDE(CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] = "Web"), SUM(Satislar[Tutar]))</code>. İptalleri sayıyor. Hazır <code>[Net Satış]</code> ile Web kanalının payını yaz.', sol: 'DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Web"), [Net Satış])', hint: 'DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Web"), [Net Satış])' }
  ]
});
})(window);
