/* Kesit Power BI içerik 1: Temel seviye */
(window.PBI_LESSONS = window.PBI_LESSONS || []).push(

{
  id: 'tarih', lv: 'temel', mod: 'Başlangıç', min: 10,
  title: 'Power BI\'ın hikâyesi: Excel eklentisinden veri platformuna',
  sum: 'Power Pivot, DAX, Power Query ve Power BI Desktop nasıl doğdu; bugün Fabric içinde nerede duruyor.',
  body: `
<h2>Excel'in içinden doğan bir araç</h2>
<p>Power BI tek bir günde ortaya çıkmadı. Bugün kullandığın parçaların çoğu önce <b>Excel eklentisi</b> olarak doğdu, sonra tek bir üründe birleşti. Bu geçmişi bilmek işe yarar: DAX'ın neden Excel formüllerine benzediğini, Power Query'nin neden ayrı bir pencerede açıldığını buradan anlarsın.</p>
<ul class="timeline">
<li><b>2010</b> · <b>PowerPivot for Excel 2010</b> çıkar. Milyonlarca satırı belleğe sıkıştıran <b>VertiPaq</b> motoru ve onunla konuşan dil <b>DAX</b> (Data Analysis Expressions) ilk kez kullanıcıların eline geçer.</li>
<li><b>2012</b> · SQL Server 2012 ile <b>Analysis Services Tabular</b> modeli gelir. Aynı motor ve aynı DAX, artık kurumsal sunucularda da çalışır. Aynı yıl görselleştirme aracı <b>Power View</b> tanıtılır.</li>
<li><b>2013</b> · Veri alma ve temizleme eklentisi <b>Power Query</b> (ilk adı Data Explorer) yayımlanır. Arkasında <b>M</b> adlı bir dil vardır. Yıl içinde “Power BI for Office 365” duyurulur.</li>
<li><b>2015</b> · Temmuzda bugünkü <b>Power BI hizmeti</b> ve ücretsiz <b>Power BI Desktop</b> genel kullanıma açılır. Power Query, Power Pivot ve Power View tek bir uygulamada birleşir.</li>
<li><b>2016–2017</b> · Aylık güncelleme temposu başlar. Kurumsal ölçek için <b>Premium</b> kapasite ve şirket içinde çalışan <b>Power BI Report Server</b> eklenir.</li>
<li><b>2019–2020</b> · Yapay zekâ görselleri (Anahtar etkileyiciler, Ayrıştırma ağacı), veri akışları (dataflows) ve dağıtım işlem hatları gelir.</li>
<li><b>2023</b> · <b>Microsoft Fabric</b> duyurulur ve yıl sonunda genel kullanıma açılır. Power BI artık veri mühendisliği, veri ambarı ve gerçek zamanlı analizle aynı platformun bir parçasıdır. “Dataset” kavramının adı <b>anlam modeli</b> (semantic model) olur.</li>
<li><b>2023–2025</b> · <b>DAX sorgu görünümü</b>, görsel hesaplamalar, TMDL ile metin tabanlı modeller ve Copilot gibi yeniliklerle araç, geliştiricilere daha da yaklaşır.</li>
</ul>
<h2>Neden bu kadar yaygın?</h2>
<ul>
<li><b>Excel'den geçiş kolay:</b> Pivot tablo mantığını bilen biri Power BI'da kendini evinde hisseder.</li>
<li><b>Ücretsiz başlangıç:</b> Desktop ücretsizdir; rapor geliştirmek için lisans gerekmez, paylaşmak için gerekir.</li>
<li><b>Microsoft ekosistemi:</b> Excel, Teams, SharePoint, Azure ve Fabric ile doğal olarak bağlanır.</li>
<li><b>Hızlı motor:</b> VertiPaq, verileri sütun sütun sıkıştırır. Birkaç yüz milyon satır bile dizüstü bilgisayarda çalışabilir.</li>
</ul>
<div class="note"><b>Bu uygulamada</b>Tüm dersler aynı örnek şirketi kullanır: <b>Anadolu Market</b>. Kesit SQL’deki sipariş verisinin aynısı burada Power BI'ın sevdiği <b>yıldız şemaya</b> dönüştürüldü. DAX formüllerin tarayıcında, bu veri üzerinde gerçekten çalışır.</div>
`,
  ex: [
    { t: 'mc', q: 'DAX dili ilk olarak hangi ürünle kullanıcılara ulaştı?', o: ['Power BI Desktop (2015)', 'PowerPivot for Excel 2010', 'SQL Server 2000', 'Power View'], a: 1, why: 'DAX, 2010\'da PowerPivot eklentisiyle geldi. Power BI Desktop aynı motoru ve dili devraldı.' },
    { t: 'mc', q: 'Power BI\'da verileri sütun sütun sıkıştırarak bellekte tutan motorun adı nedir?', o: ['VertiPaq', 'M', 'Power View', 'DirectQuery'], a: 0, why: 'VertiPaq (bugün “VertiPaq / xVelocity” olarak da anılır) sütun tabanlı, bellek içi motordur. M, Power Query\'nin dilidir.' }
  ]
},

{
  id: 'aile', lv: 'temel', mod: 'Başlangıç', min: 9,
  title: 'Power BI ailesi ve iş akışı',
  sum: 'Desktop, Service, Mobile, Report Server, lisans türleri ve bir raporun baştan sona yolculuğu.',
  body: `
<h2>Hangi parça ne işe yarar?</h2>
<div class="tbl-wrap"><table>
<tr><th>Parça</th><th>Ne yaparsın?</th><th>Kim kullanır?</th></tr>
<tr><td><b>Power BI Desktop</b></td><td>Veriyi al, temizle, modelle, DAX yaz, rapor tasarla. Windows uygulaması, ücretsiz.</td><td>Rapor geliştiricisi, analist</td></tr>
<tr><td><b>Power BI Service</b> (app.powerbi.com)</td><td>Raporu yayımla, paylaş, yenileme zamanla, pano ve uygulama oluştur, izinleri yönet.</td><td>Herkes; tüketiciler raporu burada görür</td></tr>
<tr><td><b>Power BI Mobile</b></td><td>Raporları telefon ve tablette görüntüle, uyarı al.</td><td>Yöneticiler, sahadaki ekipler</td></tr>
<tr><td><b>Power BI Report Server</b></td><td>Raporları bulut yerine şirket içindeki sunucuda yayımla.</td><td>Veriyi buluta çıkaramayan kurumlar</td></tr>
<tr><td><b>Microsoft Fabric</b></td><td>Power BI'ın içinde yaşadığı geniş platform: lakehouse, veri ambarı, veri akışları, not defterleri.</td><td>Veri ekipleri</td></tr>
</table></div>
<h2>Lisanslar kısaca</h2>
<ul>
<li><b>Ücretsiz (Free):</b> Desktop'ta her şeyi yapabilirsin, Service'te yalnızca kendi “Çalışma alanım” bölümünde çalışırsın. Başkasıyla paylaşamazsın.</li>
<li><b>Pro:</b> Rapor yayımlama ve paylaşma için kullanıcı başına lisans. Paylaşan ve görüntüleyen tarafın ikisinde de Pro gerekir (kapasite yoksa).</li>
<li><b>Premium Per User (PPU):</b> Pro'ya ek olarak büyük model, sık yenileme, dağıtım işlem hatları gibi gelişmiş özellikler.</li>
<li><b>Kapasite (Fabric F SKU'ları):</b> Kurum bir kapasite satın alır. Yeterli büyüklükteki kapasitede raporu görüntüleyenlerin Pro almasına gerek kalmaz.</li>
</ul>
<div class="warn"><b>Güncel bilgiyi kontrol et</b>Microsoft lisans adlarını ve fiyatlarını sık değiştirir. Satın alma kararı için her zaman Microsoft'un resmi fiyat sayfasına bak.</div>
<h2>Bir raporun yolculuğu</h2>
<ol>
<li><b>Veri al:</b> Excel, SQL Server, SharePoint, web, API… (Giriş → Veri al)</li>
<li><b>Dönüştür:</b> Power Query'de temizle, biçimlendir, birleştir.</li>
<li><b>Modelle:</b> Tabloları ilişkilendir, yıldız şema kur, tarih tablosu ekle.</li>
<li><b>Hesapla:</b> DAX ile ölçüler yaz: satış, kâr, büyüme, pay…</li>
<li><b>Görselleştir:</b> Grafikleri, kartları, dilimleyicileri sayfaya yerleştir.</li>
<li><b>Yayımla ve paylaş:</b> Service'e gönder, yenilemeyi zamanla, uygulama olarak dağıt.</li>
</ol>
<p>Bu uygulamadaki menü de aynı sırayı izler: <b>Veri Modeli</b> (2–3. adım), <b>DAX Stüdyosu</b> ve <b>Formüller</b> (4. adım), <b>Görseller</b> ve <b>Dashboardlar</b> (5. adım).</p>
`,
  ex: [
    { t: 'mc', q: 'Bir analist raporu Desktop\'ta hazırladı ve 5 meslektaşıyla Service üzerinden paylaşmak istiyor. Kurumda kapasite yok. Neye ihtiyaç var?', o: ['Hiçbir şeye, Desktop ücretsiz', 'Sadece analistin Pro lisansı', 'Analistin ve 5 meslektaşın her birinin Pro (ya da PPU) lisansı', 'Report Server kurulumu'], a: 2, why: 'Kapasite yoksa paylaşım için hem paylaşanın hem görüntüleyenlerin Pro ya da PPU lisansı olmalıdır.' },
    { t: 'mc', q: 'Yenilemenin zamanlanması ve raporun uygulama olarak dağıtılması nerede yapılır?', o: ['Power BI Desktop', 'Power BI Service', 'Power Query Düzenleyicisi', 'DAX Studio'], a: 1, why: 'Zamanlanmış yenileme, uygulamalar, çalışma alanı izinleri Service tarafındadır.' }
  ]
},

{
  id: 'arayuz', lv: 'temel', mod: 'Başlangıç', min: 10,
  title: 'Desktop arayüz turu',
  sum: 'Görünümler, bölmeler, alan kutuları: hangi düğme nerede ve ne işe yarar?',
  body: `
<h2>Soldaki görünümler</h2>
<div class="tbl-wrap"><table>
<tr><th>Görünüm</th><th>Ne için?</th></tr>
<tr><td><b>Rapor</b></td><td>Görselleri sayfaya yerleştirdiğin tuval. Zamanının çoğu burada geçer.</td></tr>
<tr><td><b>Tablo</b> (eski adı Veri)</td><td>Yüklenen tabloların satırlarına bakarsın, hesaplanmış sütun eklersin.</td></tr>
<tr><td><b>Model</b></td><td>Tabloları ve aralarındaki ilişkileri diyagram olarak görürsün; ilişki kurar, düzenlersin.</td></tr>
<tr><td><b>DAX sorgu</b></td><td>EVALUATE ile başlayan sorgular yazıp sonucu tablo olarak görürsün. Ölçüleri denemek için idealdir.</td></tr>
<tr><td><b>TMDL</b></td><td>Modeli metin (kod) olarak görüp düzenlersin. İleri seviye.</td></tr>
</table></div>
<h2>Sağdaki bölmeler</h2>
<ul>
<li><b>Veri bölmesi:</b> Tablolar, sütunlar ve ölçüler. Ölçülerin yanında hesap makinesi simgesi, hesaplanmış sütunlarda fx simgesi görürsün.</li>
<li><b>Görselleştirmeler bölmesi:</b> Görsel türleri, <b>alan kutuları</b> (Eksen, Değerler, Gösterge, Araç ipuçları…) ve <b>biçim</b> sekmesi.</li>
<li><b>Filtreler bölmesi:</b> Görsel, sayfa ve tüm rapor düzeyinde filtreler.</li>
</ul>
<h2>Alan kutuları: görselin iskeleti</h2>
<p>Bir sütun grafiği oluşturduğunu düşün. <b>X ekseni</b> kutusuna <code>Kategoriler[Kategori]</code>, <b>Y ekseni</b> kutusuna <code>[Net Satış]</code> ölçüsünü sürüklersin. Power BI her kategori için ölçüyü ayrı ayrı hesaplar. Gösterge kutusuna <code>Satislar[Kanal]</code> koyarsan her kategori çubuğu kanallara bölünür.</p>
<div class="tip"><b>Kural</b>Eksene <b>sütun</b> (gruplanacak şey), değerlere <b>ölçü</b> (hesaplanacak şey) konur. Sayısal bir sütunu değerlere sürüklersen Power BI onu kendiliğinden toplar; buna <i>örtük ölçü</i> denir. İyi pratik, her zaman açık (explicit) DAX ölçüsü yazmaktır.</div>
<h2>Şerit (ribbon) sekmeleri</h2>
<ul>
<li><b>Giriş:</b> Veri al, Verileri dönüştür (Power Query'yi açar), Yenile, Yayımla.</li>
<li><b>Ekle:</b> Yeni sayfa, metin kutusu, düğme, şekil, görsel.</li>
<li><b>Modelleme:</b> Yeni ölçü, yeni sütun, yeni tablo, roller (RLS), parametreler.</li>
<li><b>Görünüm:</b> Temalar, mobil düzen, Performans Analizi, yer imleri, seçim bölmesi.</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Tabloların arasındaki ilişkileri görmek ve düzenlemek için hangi görünüme geçersin?', o: ['Rapor', 'Tablo', 'Model', 'DAX sorgu'], a: 2, why: 'Model görünümü tabloları kutular, ilişkileri çizgiler olarak gösterir.' },
    { t: 'mc', q: 'Bir sütun grafiğinde her kanal için ayrı renk görmek istiyorsun. Satislar[Kanal] sütununu hangi alan kutusuna koyarsın?', o: ['Y ekseni', 'Gösterge', 'Araç ipuçları', 'Detaylandırma filtresi'], a: 1, why: 'Gösterge (Legend), serileri renklere ayırır. Y eksenine ölçü konur.' }
  ]
},

{
  id: 'veri-alma', lv: 'temel', mod: 'Veri Hazırlama', min: 11,
  title: 'Veri alma ve bağlantı modları',
  sum: 'Import, DirectQuery, Live Connection ve Direct Lake arasındaki farklar; hangisini ne zaman seçmeli?',
  body: `
<h2>Veri nereden gelir?</h2>
<p>Giriş → <b>Veri al</b> menüsünde yüzlerce bağlayıcı var: Excel, CSV, SQL Server, PostgreSQL, Oracle, SharePoint listeleri, Dataverse, Salesforce, Google Analytics, web sayfaları, REST API'ler… Bağlayıcı seçtikten sonra Power BI bir <b>Gezgin</b> penceresi açar; tabloları seçip <b>Yükle</b> ya da <b>Verileri Dönüştür</b> dersin.</p>
<div class="tip"><b>Alışkanlık</b>Doğrudan “Yükle”ye basma. Önce “Verileri Dönüştür” ile Power Query'ye gir, veri türlerini ve gereksiz sütunları kontrol et.</div>
<h2>Depolama modları</h2>
<div class="tbl-wrap"><table>
<tr><th>Mod</th><th>Veri nerede?</th><th>Artısı</th><th>Eksisi</th></tr>
<tr><td><b>Import (İçeri aktar)</b></td><td>Power BI dosyasına kopyalanır, VertiPaq'te sıkıştırılır.</td><td>En hızlı; tüm DAX ve Power Query özellikleri çalışır.</td><td>Veri yenileme anı kadar günceldir; model boyutu sınırları var.</td></tr>
<tr><td><b>DirectQuery</b></td><td>Kaynakta kalır; her görsel kaynağa sorgu gönderir.</td><td>Veri hep günceldir; çok büyük tablolar için uygundur.</td><td>Kaynak yavaşsa rapor yavaşlar; bazı DAX ve dönüşümler kısıtlıdır.</td></tr>
<tr><td><b>Live Connection (Canlı bağlantı)</b></td><td>Başka bir yerde yayımlanmış anlam modelinde (ya da Analysis Services'te).</td><td>Tek doğru kaynak; ekipler aynı ölçüleri kullanır.</td><td>Modeli değiştiremezsin, yalnızca rapor ölçüleri eklersin.</td></tr>
<tr><td><b>Direct Lake</b></td><td>Fabric lakehouse'taki Delta tablolarında.</td><td>Import'a yakın hız, kopyalama ve zamanlanmış yenileme yükü olmadan.</td><td>Fabric gerektirir.</td></tr>
<tr><td><b>Bileşik (Composite)</b></td><td>Bazı tablolar Import, bazıları DirectQuery; “Dual” mod ikisi de olabilir.</td><td>Esneklik: özet veri hızlı, ayrıntı canlı.</td><td>Tasarımı daha karmaşık.</td></tr>
</table></div>
<h2>Karar verirken sorulacak üç soru</h2>
<ol>
<li><b>Veri ne kadar güncel olmalı?</b> Günde birkaç kez yeterliyse Import.</li>
<li><b>Veri ne kadar büyük?</b> Yüz milyonlarca satır ve büyüyen bir olgu tablosu varsa DirectQuery ya da Direct Lake.</li>
<li><b>Ortak bir model var mı?</b> Şirketin onaylı bir anlam modeli varsa ona Live Connection ile bağlan, aynı ölçüyü ikinci kez yazma.</li>
</ol>
<div class="note"><b>Ağ geçidi (gateway)</b>Kaynak şirket ağının içindeyse (ör. ofisteki SQL Server), Service'in ona ulaşması için <b>şirket içi veri ağ geçidi</b> kurulur. Bulut kaynaklarında genellikle gerekmez.</div>
`,
  ex: [
    { t: 'mc', q: 'Fabrika sensörlerinden gelen veriyi dakikalar içinde raporda görmek gerekiyor ve tablo çok büyük. En uygun mod hangisi?', o: ['Import', 'DirectQuery', 'Excel\'e aktarıp Import', 'Yalnızca Power Query'], a: 1, why: 'DirectQuery her etkileşimde kaynağa gider; veri kaynakta kaldığı için hep günceldir.' },
    { t: 'mc', q: 'Finans ekibinin yayımladığı onaylı “Satış Modeli” anlam modelini kendi raporunda kullanmak istiyorsun. Hangi bağlantı?', o: ['Live Connection', 'CSV olarak dışa aktarıp Import', 'DirectQuery ile SQL\'e', 'Web bağlayıcısı'], a: 0, why: 'Live Connection, yayımlanmış modeli kopyalamadan kullanır. Herkes aynı ölçü tanımlarını görür.' },
    { t: 'mc', q: 'Şirket içi SQL Server\'dan Import edilen bir raporun Service\'te her sabah otomatik yenilenmesi için ne gerekir?', o: ['Power BI Mobile', 'Şirket içi veri ağ geçidi', 'DAX Studio', 'Report Server'], a: 1, why: 'Service buluttadır; şirket ağındaki kaynağa ağ geçidi üzerinden ulaşır.' }
  ]
},

{
  id: 'pq-temel', lv: 'temel', mod: 'Veri Hazırlama', min: 14,
  title: 'Power Query ile veri temizleme',
  sum: 'Uygulanan adımlar, veri türleri, kırpma, bölme, yinelenenleri kaldırma ve sütun kalitesi.',
  body: `
<h2>Power Query nedir?</h2>
<p>Power Query, veriyi modele yüklemeden önce temizlediğin <b>ETL</b> (çıkar, dönüştür, yükle) aracıdır. Giriş → <b>Verileri dönüştür</b> ile açılır. Yaptığın her tıklama sağdaki <b>Uygulanan Adımlar</b> listesine bir satır olarak eklenir ve arka planda <b>M</b> dilinde kod üretir. Yenilemede bu adımlar sırayla yeniden çalışır; yani temizliği bir kez tasarlarsın.</p>
<h2>Kirli veri örneği</h2>
<p>Anadolu Market'in web formundan gelen kayıt verisi şöyle görünüyor (Kesit SQL’deki <code>raw_signups</code> tablosu):</p>
<div class="tbl-wrap"><table>
<tr><th>id</th><th>full_name</th><th>email</th><th>city</th><th>signup_date</th></tr>
<tr><td>3</td><td>"  Elif Kaya "</td><td>ELIF.KAYA@GMAIL.COM</td><td>istanbul</td><td>2024-03-05</td></tr>
<tr><td>3</td><td>"  Elif Kaya "</td><td>elif.kaya@gmail.com</td><td>istanbul</td><td>2024-03-05</td></tr>
<tr><td>7</td><td>MEHMET DEMİR</td><td>mehmet.demir@gmail.com</td><td>" Ankara"</td><td>14.07.2024</td></tr>
</table></div>
<h2>Temizlik adımları</h2>
<ol>
<li><b>Veri türlerini belirle:</b> Sütun başlığındaki simgeye tıkla. Tarih, Tam Sayı, Ondalık Sayı, Metin. Yanlış tür, ileride en çok hata çıkaran şeydir.</li>
<li><b>Kırp ve temizle:</b> Dönüştür → Biçim → <b>Kırp</b> (baştaki ve sondaki boşlukları siler) ve <b>Temizle</b> (yazdırılamayan karakterleri siler).</li>
<li><b>Büyük/küçük harf:</b> Biçim → <b>Her Sözcüğün İlk Harfi Büyük</b> (ad soyad için), <b>küçük harf</b> (e-posta için).</li>
<li><b>Değerleri değiştir:</b> “istanbul” → “İstanbul”. Türkçe büyük İ/ı harflerine dikkat.</li>
<li><b>Yinelenenleri kaldır:</b> Anahtar sütunu (id ya da e-posta) seçip Giriş → Satırları Kaldır → <b>Yinelenenleri Kaldır</b>.</li>
<li><b>Karışık tarih biçimi:</b> Sütun türünü <b>Yerel ayarı kullanarak</b> Tarih'e çevir (Türkçe, gg.aa.yyyy) ya da önce metni ayrıştır.</li>
<li><b>Sütunu böl:</b> “Ad Soyad” sütununu Sınırlayıcıya göre böl → en sağdaki boşluk: Ad ve Soyad.</li>
</ol>
<h2>Arka plandaki M kodu</h2>
<pre class="m">let
    Kaynak = Csv.Document(File.Contents("kayitlar.csv"), [Delimiter=",", Encoding=65001]),
    Basliklar = Table.PromoteHeaders(Kaynak),
    Kirpilmis = Table.TransformColumns(Basliklar, {{"full_name", Text.Trim}, {"city", Text.Trim}}),
    BuyukHarf = Table.TransformColumns(Kirpilmis, {{"full_name", Text.Proper}, {"email", Text.Lower}}),
    Tekil = Table.Distinct(BuyukHarf, {"email"}),
    Turler = Table.TransformColumnTypes(Tekil, {{"id", Int64.Type}, {"signup_date", type date}}, "tr-TR")
in
    Turler</pre>
<p>Her satır bir adımdır; bir adım bir önceki adımın adını girdi olarak alır. <code>let … in</code> bloğunun sonundaki ad, sorgunun çıktısıdır.</p>
<div class="tip"><b>Sütun kalitesi</b>Görünüm sekmesinde <b>Sütun kalitesi</b>, <b>Sütun dağılımı</b> ve <b>Sütun profili</b>ni aç. Her sütunun yüzde kaçının geçerli, hatalı ya da boş olduğunu, kaç farklı değeri olduğunu anında görürsün. Varsayılan olarak ilk 1000 satıra bakar; alt çubuktan “Tüm veri kümesine göre sütun profili oluşturma”yı seçebilirsin.</div>
<div class="warn"><b>Erken temizle, geç hesapla</b>Satır düzeyinde düzeltmeleri (boşluk, tür, harf) Power Query'de yap. Toplama ve oran gibi hesapları DAX ölçülerine bırak.</div>
`,
  ex: [
    { t: 'mc', q: 'Şehir sütununda “ Ankara”, “ankara” ve “Ankara” değerleri var. Dilimleyicide tek “Ankara” görmek için en doğru adım sırası hangisi?', o: ['Yinelenenleri kaldır', 'Kırp → Her Sözcüğün İlk Harfi Büyük', 'DAX ile UPPER kullan', 'Sütunu sil'], a: 1, why: 'Önce baştaki boşluğu kırp, sonra harf biçimini eşitle. Yinelenenleri kaldırmak satırları siler; sorunu çözmez.' },
    { t: 'mc', q: 'Power Query\'de yaptığın adımlar yenileme sırasında ne olur?', o: ['Silinir, yeniden yapman gerekir', 'Sırayla yeniden çalışır', 'Yalnızca ilk adım çalışır', 'DAX\'a dönüşür'], a: 1, why: 'Uygulanan adımlar bir tariftir: her yenilemede kaynak veriye baştan uygulanır.' },
    { t: 'mc', q: 'Bir sütunun yüzde kaçının boş ya da hatalı olduğunu hızla görmek için hangi özellik kullanılır?', o: ['Sütun kalitesi', 'Performans Analizi', 'Yer imleri', 'Hızlı ölçü'], a: 0, why: 'Görünüm → Sütun kalitesi, geçerli / hata / boş yüzdelerini sütun başlığının altında gösterir.' }
  ]
},

{
  id: 'model-temel', lv: 'temel', mod: 'Veri Modelleme', min: 14,
  title: 'Veri modelleme: yıldız şema ve ilişkiler',
  sum: 'Olgu ve boyut tabloları, kardinalite, filtre yönü. Power BI neden yıldız şemayı sever?',
  body: `
<h2>İki tür tablo</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Olgu (fact) tablosu</th><th>Boyut (dimension) tablosu</th></tr>
<tr><td>Ne tutar?</td><td>Olayları ve sayıları: satış satırı, ödeme, ziyaret</td><td>Olayları tanımlayan nitelikleri: ürün, müşteri, tarih</td></tr>
<tr><td>Satır sayısı</td><td>Çok (milyonlar)</td><td>Az (yüzler, binler)</td></tr>
<tr><td>Sütunlar</td><td>Anahtarlar + sayısal değerler</td><td>Tek bir anahtar + metin nitelikler</td></tr>
<tr><td>Bu modelde</td><td><code>Satislar</code>, <code>Hedefler</code></td><td><code>Urunler</code>, <code>Musteriler</code>, <code>Tarih</code>, <code>Kategoriler</code></td></tr>
</table></div>
<h2>Yıldız şema</h2>
<p>Olgu tablosu ortada durur, boyutlar çevresinde dizilir. Her boyut olguya <b>bire-çok (1:*)</b> ilişkiyle bağlanır: bir ürünün çok satış satırı vardır. Diyagram bir yıldıza benzer. <b>Veri Modeli</b> sayfasında bu modelin diyagramını görebilirsin.</p>
<div class="tip"><b>Neden yıldız?</b>Filtreler boyuttan olguya doğru akar. Kullanıcı dilimleyicide “Kitap” seçer → <code>Urunler</code> süzülür → ilişki üzerinden <code>Satislar</code> yalnızca kitap satırlarına iner → ölçü bu satırlar üzerinde hesaplanır. Tablolar az, ilişkiler net olduğunda hem DAX basitleşir hem motor hızlanır.</div>
<h2>İlişkinin özellikleri</h2>
<ul>
<li><b>Kardinalite:</b> <i>Bire-çok</i> (en yaygın ve önerilen), <i>bire-bir</i> (genelde iki tablonun birleştirilmesi gerektiğine işaret), <i>çoka-çok</i> (dikkatli kullanılmalı).</li>
<li><b>Çapraz filtre yönü:</b> <i>Tek</i> (boyuttan olguya; varsayılan ve önerilen) ya da <i>Her ikisi</i> (çift yönlü; belirsizlik ve performans sorunu yaratabilir).</li>
<li><b>Etkin / pasif:</b> İki tablo arasında yalnızca bir ilişki etkin olabilir. Pasif ilişkiler kesik çizgiyle görünür ve DAX'ta <code>USERELATIONSHIP</code> ile çağrılır (ör. Sipariş Tarihi ve Teslim Tarihi).</li>
</ul>
<h2>Anahtarlar</h2>
<p>Boyut tablosundaki anahtar (<code>Urunler[UrunNo]</code>) <b>benzersiz</b> olmalıdır. Olgu tablosundaki yabancı anahtar (<code>Satislar[UrunNo]</code>) tekrar edebilir. Boyut anahtarında tekrar varsa Power BI ilişkiyi çoka-çok yapar; bu genellikle veride bir sorun olduğunu gösterir.</p>
<h2>Kaçınılacak desenler</h2>
<ul>
<li><b>Tek dev tablo:</b> Her şeyi tek tabloya birleştirmek ilk başta kolay gelir ama DAX'ı zorlaştırır ve modeli şişirir.</li>
<li><b>Kar tanesi (snowflake) aşırılığı:</b> Boyutu boyuta, onu da başka boyuta bağlamak. Mümkünse Power Query'de boyutları düzleştir. (Bu modeldeki <code>Kategoriler</code> bilinçli bir istisnadır: hem ürünleri hem hedefleri bağlayan ortak bir boyut.)</li>
<li><b>Gereksiz çift yönlü ilişkiler.</b></li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Bu modelde Urunler ile Satislar arasındaki ilişkinin kardinalitesi nedir?', o: ['Bire-bir', 'Bire-çok (Urunler 1 → Satislar *)', 'Çoka-çok', 'İlişki yok'], a: 1, why: 'Her ürün bir kez listelenir ama birçok satış satırında geçer.' },
    { t: 'mc', q: 'Dilimleyicide “Mobil” kanalı seçildiğinde Urunler tablosu kendiliğinden süzülür mü? (İlişki tek yönlü)', o: ['Evet, her zaman', 'Hayır; filtre boyuttan olguya akar, olgudan boyuta akmaz', 'Yalnızca DirectQuery\'de', 'Yalnızca hesaplanmış sütunlarda'], a: 1, why: 'Tek yönlü ilişkide filtre 1 tarafından * tarafına akar. Satislar\'daki bir filtre Urunler\'i süzmez.' },
    { t: 'mc', q: 'Hangisi tipik bir boyut tablosu sütunudur?', o: ['Tutar', 'Adet', 'Segment', 'Maliyet'], a: 2, why: 'Segment bir niteliktir; müşteriyi tanımlar. Tutar, Adet, Maliyet olgu tablosundaki ölçülebilir değerlerdir.' }
  ]
},

{
  id: 'tarih-tablosu', lv: 'temel', mod: 'Veri Modelleme', min: 12,
  title: 'Tarih tablosu',
  sum: 'Her modele neden ayrı bir tarih tablosu gerekir; CALENDAR ile oluşturma ve tarih tablosu olarak işaretleme.',
  body: `
<h2>Neden ayrı bir tarih tablosu?</h2>
<ul>
<li><b>Zaman zekâsı fonksiyonları</b> (<code>TOTALYTD</code>, <code>SAMEPERIODLASTYEAR</code>…) kesintisiz bir tarih sütunu ister: aralığın her günü bir kez bulunmalı.</li>
<li>Satış olmayan günler de raporda görünebilir (ör. “bu ay satış yok” sıfırı).</li>
<li>Yıl, Çeyrek, Ay, Hafta günü gibi sütunlar tek yerde tanımlanır; <code>Satislar</code> ve <code>Hedefler</code> aynı takvimi paylaşır.</li>
</ul>
<h2>DAX ile oluşturma</h2>
<p>Modelleme → <b>Yeni tablo</b>:</p>
<pre class="dax">Tarih =
ADDCOLUMNS(
    CALENDAR(DATE(2022, 1, 1), DATE(2024, 12, 31)),
    "Yil", YEAR([Date]),
    "AyNo", MONTH([Date]),
    "Ay", FORMAT([Date], "MMM"),
    "Ceyrek", "Ç" &amp; QUARTER([Date])
)</pre>
<p><code>CALENDAR</code> iki tarih arasındaki her günü tek sütunlu bir tablo olarak döndürür. <code>ADDCOLUMNS</code> bu tabloya yeni sütunlar ekler. Bu uygulamadaki <code>Tarih</code> tablosu aynı mantıkla kuruldu.</p>
<h2>Kurulumdan sonra üç ayar</h2>
<ol>
<li><b>Tarih tablosu olarak işaretle:</b> Tabloya sağ tık → <i>Tarih tablosu olarak işaretle</i> → tarih sütununu seç. Böylece zaman zekâsı doğru çalışır.</li>
<li><b>İlişki kur:</b> <code>Tarih[Tarih]</code> → <code>Satislar[Tarih]</code> (1:*).</li>
<li><b>Ay sıralaması:</b> <code>Ay</code> sütununu seç → <i>Sütuna göre sırala</i> → <code>AyNo</code>. Yoksa aylar alfabetik dizilir (Ağu, Ara, Eki…).</li>
</ol>
<div class="warn"><b>Otomatik tarih/saat</b>Power BI, varsayılan olarak her tarih sütunu için gizli bir tarih tablosu üretir. Kendi tarih tablon varsa Dosya → Seçenekler → Veri Yükleme → <b>Otomatik tarih/saat</b> seçeneğini kapat. Model küçülür ve karışıklık azalır.</div>
<p>Aşağıdaki alıştırmada bir DAX sorgusu yazacaksın. Sorgu <code>EVALUATE</code> ile başlar ve bir tablo döndürür; sonucu tablo olarak görürsün.</p>
`,
  ex: [
    { t: 'query', q: '2024 yılının <b>Ocak ayındaki</b> günleri içeren bir tablo döndür. <code>CALENDAR</code> kullan; tek sütun yeterli.', start: 'EVALUATE\n', sol: 'EVALUATE\nCALENDAR(DATE(2024, 1, 1), DATE(2024, 1, 31))', hint: 'CALENDAR(DATE(yıl, ay, gün), DATE(yıl, ay, gün))' },
    { t: 'query', q: 'Tarih tablosundan yalnızca <b>2024 yılının hafta sonu</b> günlerini getir. Kaç satır döndüğüne bak.', start: 'EVALUATE\nFILTER(\n    Tarih,\n    \n)', sol: 'EVALUATE\nFILTER(Tarih, Tarih[Yil] = 2024 && Tarih[HaftaSonu] = "Evet")', hint: 'İki koşulu && ile bağla: Tarih[Yil] = 2024 && Tarih[HaftaSonu] = "Evet"' },
    { t: 'mc', q: 'Bir matriste aylar “Ağu, Ara, Eki, Eyl…” diye alfabetik diziliyor. Çözüm nedir?', o: ['Ay sütununu silmek', 'Ay sütununu AyNo sütununa göre sıralamak', 'Otomatik tarih/saati açmak', 'Görseli tabloya çevirmek'], a: 1, why: 'Sütuna göre sırala özelliği, metin sütununun görüntülenme sırasını başka bir sütundan alır.' }
  ]
},

{
  id: 'dax-giris', lv: 'temel', mod: 'DAX Temelleri', min: 12,
  title: 'DAX\'a giriş: ölçü, hesaplanmış sütun, söz dizimi',
  sum: 'İlk ölçünü yaz. Ölçü ile hesaplanmış sütun arasındaki farkı ve yazım kurallarını öğren.',
  body: `
<h2>DAX nedir?</h2>
<p>DAX (Data Analysis Expressions), Power BI modelindeki hesapların dilidir. Excel formüllerine benzer ama hücreyle değil <b>tablolar ve sütunlarla</b> çalışır. Bir DAX formülü üç şeyden birini üretir:</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>Ölçü (measure)</th><th>Hesaplanmış sütun</th><th>Hesaplanmış tablo</th></tr>
<tr><td>Ne zaman hesaplanır?</td><td>Görsel her çizildiğinde, o anki filtrelere göre</td><td>Yenileme sırasında, her satır için bir kez</td><td>Yenileme sırasında</td></tr>
<tr><td>Nerede saklanır?</td><td>Saklanmaz (yalnızca formül)</td><td>Modelde, bellekte yer kaplar</td><td>Modelde</td></tr>
<tr><td>Tipik kullanım</td><td>Toplamlar, oranlar, büyüme</td><td>Satırı sınıflandırmak (Yaş grubu, Fiyat bandı)</td><td>Tarih tablosu, yardımcı tablolar</td></tr>
<tr><td>Örnek</td><td><code>Toplam Satış = SUM(Satislar[Tutar])</code></td><td><code>Tutar = Satislar[Adet] * Satislar[BirimFiyat]</code></td><td><code>Tarih = CALENDAR(...)</code></td></tr>
</table></div>
<div class="tip"><b>Altın kural</b>Sonuç bir <b>toplam, oran ya da karşılaştırma</b> ise ölçü yaz. Sonuç <b>her satıra ait bir etiket</b> ise ve dilimleyicide ya da eksende kullanacaksan hesaplanmış sütun (ya da daha iyisi Power Query sütunu) kullan.</div>
<h2>Yazım kuralları</h2>
<ul>
<li>Ölçü adı, eşittir, ifade: <code>Toplam Satış = SUM(Satislar[Tutar])</code></li>
<li>Sütunlar <b>her zaman tablo adıyla</b>: <code>Satislar[Tutar]</code>. Boşluklu tablo adı tek tırnakla: <code>'Satış Tablosu'[Tutar]</code>.</li>
<li>Ölçüler <b>tablo adı olmadan</b>, köşeli parantezle: <code>[Toplam Satış]</code>. Böylece okuyan kişi sütun ile ölçüyü ayırt eder.</li>
<li>Metinler çift tırnakla: <code>"Web"</code>. Bağımsız değişkenler virgülle ayrılır.</li>
<li>Satır sonları ve girinti serbesttir; okunabilirlik için kullan. Yorum: <code>// açıklama</code></li>
</ul>
<h2>İlk ölçün</h2>
<pre class="dax">Toplam Satış = SUM(Satislar[Tutar])</pre>
<p>Bu ölçüyü bir karta koyarsan tüm satışların toplamını, kategoriye göre bir sütun grafiğine koyarsan her kategorinin toplamını görürsün. Formül aynı, sonuç <b>bağlama</b> göre değişir. DAX'ın en önemli fikri budur; Orta seviyedeki <button class="lnk" data-lesson="baglam">Filtre bağlamı</button> dersinde ayrıntısıyla göreceğiz.</p>
<p>Alıştırmalarda yalnızca ifadeyi yazman yeterli; ölçü adı verilmiştir. İstersen <code>Ad = </code> önekini de yazabilirsin. Sonucun, toplamda ve kategori / yıl kırılımlarında doğru çözümle karşılaştırılır.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Toplam Satış</b> ölçüsünü yaz: Satislar tablosundaki <code>Tutar</code> sütununun toplamı.', name: 'Toplam Satış', sol: 'SUM(Satislar[Tutar])', hint: 'SUM(Tablo[Sütun])' },
    { t: 'dax', q: '<b>Toplam Adet</b>: satılan ürün adetlerinin toplamı.', name: 'Toplam Adet', sol: 'SUM(Satislar[Adet])', hint: 'Adet sütunu Satislar tablosunda.' },
    { t: 'dax', q: '<b>Toplam Kâr</b>: Tutar toplamından Maliyet toplamını çıkar.', name: 'Toplam Kâr', sol: 'SUM(Satislar[Tutar]) - SUM(Satislar[Maliyet])', hint: 'İki SUM ifadesini eksi işaretiyle bağla.' },
    { t: 'mc', q: 'Müşterileri doğum yılına göre “Genç / Orta / Olgun” diye sınıflayıp bunu bir dilimleyicide kullanmak istiyorsun. Ne yazmalısın?', o: ['Ölçü', 'Hesaplanmış sütun (ya da Power Query\'de sütun)', 'Hesaplanmış tablo', 'Rapor filtresi'], a: 1, why: 'Dilimleyiciye ve eksene yalnızca sütunlar konabilir. Her müşteri satırına bir etiket gerekiyor.' }
  ]
},

{
  id: 'toplama', lv: 'temel', mod: 'DAX Temelleri', min: 14,
  title: 'Toplama fonksiyonları ve DIVIDE',
  sum: 'SUM, AVERAGE, MIN, MAX, COUNTROWS, DISTINCTCOUNT ve güvenli bölme.',
  body: `
<h2>Temel toplayıcılar</h2>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Ne yapar?</th><th>Örnek</th></tr>
<tr><td><code>SUM</code></td><td>Sütundaki sayıları toplar</td><td><code>SUM(Satislar[Tutar])</code></td></tr>
<tr><td><code>AVERAGE</code></td><td>Aritmetik ortalama</td><td><code>AVERAGE(Satislar[BirimFiyat])</code></td></tr>
<tr><td><code>MIN</code> / <code>MAX</code></td><td>En küçük / en büyük değer (tarihlerde de çalışır)</td><td><code>MAX(Satislar[Tarih])</code></td></tr>
<tr><td><code>COUNTROWS</code></td><td>Tablodaki satır sayısı</td><td><code>COUNTROWS(Satislar)</code></td></tr>
<tr><td><code>DISTINCTCOUNT</code></td><td>Sütundaki farklı değer sayısı</td><td><code>DISTINCTCOUNT(Satislar[MusteriNo])</code></td></tr>
<tr><td><code>COUNT</code> / <code>COUNTA</code></td><td>Boş olmayan sayısal / tüm değerleri sayar</td><td><code>COUNTA(Musteriler[Sehir])</code></td></tr>
</table></div>
<h2>Satır mı, sipariş mi?</h2>
<p><code>Satislar</code> tablosunda her satır bir <b>sipariş satırı</b>dır. Bir siparişte iki ürün varsa iki satır olur. Bu yüzden:</p>
<pre class="dax">Satır Sayısı = COUNTROWS(Satislar)
Sipariş Sayısı = DISTINCTCOUNT(Satislar[SiparisNo])</pre>
<p>İkisi farklı sonuç verir. “Kaç sipariş aldık?” sorusunun cevabı ikincisidir. Tanecik (grain) dediğimiz şey budur: tablonun bir satırı neyi temsil ediyor?</p>
<h2>Güvenli bölme: DIVIDE</h2>
<pre class="dax">Ortalama Sepet = DIVIDE(SUM(Satislar[Tutar]), DISTINCTCOUNT(Satislar[SiparisNo]))</pre>
<p><code>/</code> işleci payda sıfırsa sonsuz ya da hata üretir. <code>DIVIDE(pay, payda, [alternatif])</code> ise payda sıfır ya da boşsa <b>boş</b> (ya da verdiğin alternatif değeri) döner. Görselde boş değerli satırlar gizlenir; bu genellikle istediğin davranıştır.</p>
<h2>Ölçüleri yeniden kullan</h2>
<pre class="dax">Ortalama Sepet = DIVIDE([Toplam Satış], [Sipariş Sayısı])</pre>
<p>Bir kez tanımladığın ölçüyü başka ölçülerde çağırmak, formülü kısa ve tutarlı tutar. Toplam Satış'ın tanımı değişirse (ör. iptaller hariç tutulursa) Ortalama Sepet de kendiliğinden güncellenir.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Sipariş Sayısı</b>: farklı sipariş numarası sayısı.', name: 'Sipariş Sayısı', sol: 'DISTINCTCOUNT(Satislar[SiparisNo])', hint: 'Bir siparişin birden çok satırı olabilir; DISTINCTCOUNT kullan.' },
    { t: 'dax', q: '<b>Satır Sayısı</b>: Satislar tablosundaki satır sayısı.', name: 'Satır Sayısı', sol: 'COUNTROWS(Satislar)', hint: 'COUNTROWS bir tablo alır, sütun değil.' },
    { t: 'dax', q: '<b>Ortalama Sepet</b>: toplam tutarı sipariş sayısına böl. Sıfıra bölmeye karşı DIVIDE kullan.', name: 'Ortalama Sepet', sol: 'DIVIDE(SUM(Satislar[Tutar]), DISTINCTCOUNT(Satislar[SiparisNo]))', hint: 'DIVIDE(SUM(...), DISTINCTCOUNT(...))' },
    { t: 'dax', q: '<b>Son Sipariş Tarihi</b>: en son sipariş tarihi.', name: 'Son Sipariş Tarihi', sol: 'MAX(Satislar[Tarih])', hint: 'MAX tarihlerde de çalışır.' },
    { t: 'dax', q: '<b>Ortalama Birim Fiyat</b>: Satislar[BirimFiyat] sütununun ortalaması.', name: 'Ortalama Birim Fiyat', sol: 'AVERAGE(Satislar[BirimFiyat])' }
  ]
},

{
  id: 'ilk-rapor', lv: 'temel', mod: 'Görselleştirme', min: 12,
  title: 'İlk raporunu kur',
  sum: 'Kart, sütun ve çizgi grafiği; alan kutuları, sayı biçimleri ve tema.',
  body: `
<h2>Üç görsel, bir hikâye</h2>
<p>İyi bir ilk sayfa üç soruya cevap verir: <b>Ne kadar?</b> (kart), <b>Nerede?</b> (kategori karşılaştırması), <b>Nasıl gidiyor?</b> (zaman içindeki eğilim). <b>Görseller</b> sayfasında hepsini bu verilerle canlı görebilirsin.</p>
<ol>
<li><b>Kart:</b> Görselleştirmeler → Kart. Alanlar kutusuna <code>[Net Satış]</code>. Biçim → Belirtici → Görüntü birimleri: Milyon.</li>
<li><b>Kümelenmiş çubuk grafik:</b> Y eksenine <code>Kategoriler[Kategori]</code>, X eksenine <code>[Net Satış]</code>. Görselin “…” menüsünden <i>Eksene göre sırala → Net Satış, azalan</i>.</li>
<li><b>Çizgi grafik:</b> X eksenine <code>Tarih[YilAy]</code>, Y eksenine <code>[Net Satış]</code>. İkinci çizgi olarak <code>[Satış GY]</code> (geçen yıl) eklersen büyümeyi görürsün.</li>
<li><b>Dilimleyici:</b> <code>Tarih[Yil]</code>. Stil: Döşeme (tile). Tüm görselleri birlikte süzer.</li>
</ol>
<h2>Biçimlendirme kontrol listesi</h2>
<ul>
<li><b>Başlık:</b> Ne gösterdiğini söylesin: “Kategoriye göre net satış, 2024”.</li>
<li><b>Sayı biçimi:</b> Ölçüyü seç → Ölçü araçları → Biçim: Para birimi, ondalık 0. Bir kez ölçüde ayarla, her görsel bunu kullanır.</li>
<li><b>Veri etiketleri:</b> Az sayıda çubukta aç; kalabalık grafikte kapat, araç ipuçlarına bırak.</li>
<li><b>Renk:</b> Tek seri tek renk. Rengi anlam taşıdığında kullan (ör. hedefin altı kırmızı).</li>
<li><b>Tema:</b> Görünüm → Temalar. Kurumsal renkleri bir kez JSON tema olarak tanımla, tüm raporlar aynı görünür.</li>
</ul>
<div class="tip"><b>Hızlı yol</b>Veri bölmesinde bir ölçüye tıklayıp tuvalin boş bir yerine bırakırsan Power BI uygun bir görsel önerir. Sonra görsel türünü tek tıkla değiştirebilirsin.</div>
`,
  ex: [
    { t: 'mc', q: 'Yönetici “Bu yılki net satışımız ne kadar?” diye soruyor. Sayfanın en üstüne hangi görsel?', thumbs: ['card', 'line', 'table', 'scatter'], o: ['Kart', 'Çizgi grafik', 'Tablo', 'Dağılım grafiği'], a: 0, why: 'Tek bir sayı, tek bir kartla en hızlı okunur.' },
    { t: 'mc', q: 'Ölçünün para birimi biçimini nerede ayarlamak en verimlidir?', o: ['Her görselin biçim bölmesinde ayrı ayrı', 'Ölçünün kendisinde (Ölçü araçları → Biçim)', 'Power Query\'de', 'Temada'], a: 1, why: 'Ölçüde ayarlanan biçim, ölçünün kullanıldığı her görsele taşınır.' }
  ]
},

{
  id: 'gorsel-secimi', lv: 'temel', mod: 'Görselleştirme', min: 12,
  title: 'Doğru görseli seçmek',
  sum: 'Karşılaştırma, eğilim, parça-bütün, dağılım, ilişki: her soru için bir görsel türü.',
  body: `
<h2>Önce soru, sonra grafik</h2>
<p>Görsel türünü verinin şekli değil, <b>cevaplanacak soru</b> belirler. Aşağıdaki tabloyu bir karar ağacı gibi kullan. Her türün canlı örneği <b>Görseller</b> sayfasında.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>İlk tercih</th><th>Alternatif</th><th>Kaçın</th></tr>
<tr><td>Tek bir sayı ne?</td><td>Kart</td><td>KPI (hedefle), gösterge</td><td>Tek dilimli pasta</td></tr>
<tr><td>Kategoriler nasıl karşılaştırılır?</td><td>Yatay çubuk (sıralı)</td><td>Sütun (az kategori)</td><td>Pasta (5+ dilim)</td></tr>
<tr><td>Zaman içinde nasıl değişti?</td><td>Çizgi</td><td>Alan, sütun (az dönem)</td><td>Yatay çubuk</td></tr>
<tr><td>Bütünün parçaları?</td><td>Yığılmış çubuk, %100 yığılmış</td><td>Halka (2–5 dilim), ağaç haritası</td><td>3B pasta</td></tr>
<tr><td>Bir toplamdan diğerine ne değişti?</td><td>Şelale</td><td>Fark sütunu</td><td>İki ayrı kart</td></tr>
<tr><td>İki ölçü arasında ilişki var mı?</td><td>Dağılım</td><td>Kabarcık</td><td>İki eksenli çizgi</td></tr>
<tr><td>Süreç adımlarında kayıp?</td><td>Huni</td><td>Çubuk</td><td>Pasta</td></tr>
<tr><td>Ayrıntılı sayılara bakmak?</td><td>Matris (koşullu biçimle)</td><td>Tablo</td><td>Uzun grafik</td></tr>
</table></div>
<h2>Sık yapılan hatalar</h2>
<ul>
<li><b>Sıfırdan başlamayan çubuk ekseni:</b> Farkları olduğundan büyük gösterir. Çubuklar her zaman sıfırdan başlar; çizgilerde esneklik vardır.</li>
<li><b>İkili eksen:</b> İki farklı ölçeği üst üste bindirmek, okuyanı yanlış ilişki kurmaya iter. İki ayrı grafik kullan ya da ölçüleri aynı birime getir (ör. ikisi de %).</li>
<li><b>Gökkuşağı renkleri:</b> Her çubuğa farklı renk, “bunlar farklı gruplar” mesajı verir. Tek seri tek renk.</li>
<li><b>Sıralanmamış kategoriler:</b> Kategorileri değere göre sırala; zaman eksenini kronolojik bırak.</li>
</ul>
`,
  ex: [
    { t: 'mc', q: '7 kategorinin net satışını karşılaştırmak istiyorsun. En okunur görsel hangisi?', thumbs: ['bar', 'donut', 'line', 'gauge'], o: ['Değere göre sıralı yatay çubuk', 'Halka grafik', 'Çizgi grafik', 'Gösterge'], a: 0, why: 'Göz, aynı taban çizgisinden başlayan çubuk uzunluklarını en doğru karşılaştırır. 7 dilimli halkada açılar zor okunur.' },
    { t: 'mc', q: '2023 net satışından 2024 net satışına geçişte hangi kategorinin ne kadar katkı yaptığını göstermek istiyorsun.', thumbs: ['waterfall', 'donut', 'scatter', 'card'], o: ['Şelale grafik', 'Halka grafik', 'Dağılım grafiği', 'İki kart'], a: 0, why: 'Şelale, bir başlangıç toplamından bitiş toplamına giden artış ve azalışları sırayla gösterir.' },
    { t: 'mc', q: 'Ürünlerin satış tutarı ile kâr marjı arasında bir ilişki olup olmadığını merak ediyorsun.', thumbs: ['scatter', 'stacked', 'funnel', 'table'], o: ['Dağılım grafiği', 'Yığılmış sütun', 'Huni', 'Tablo'], a: 0, why: 'Her ürün bir nokta; X satış, Y marj. Kümelenme ve aykırı değerler hemen görünür.' },
    { t: 'mc', q: 'Aylık net satış ile aylık sipariş sayısını tek grafikte, iki ayrı y ekseniyle göstermek istiyorsun. Ne önerirsin?', o: ['İkili eksenli kombo grafik iyi bir fikir', 'İki ayrı çizgi grafiği alt alta koymak', 'Pasta grafik', 'Tek bir kart'], a: 1, why: 'İki farklı ölçek, kesişme noktaları gibi yanıltıcı ilişkiler üretir. Aynı x eksenli iki küçük grafik daha dürüsttür.' }
  ]
}

);
