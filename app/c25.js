/* Kesit Power BI — c25: Service, paylaşım, yenileme, ağ geçidi, çoklu kaynak ve yerel geliştirme dersleri.
   Ürün ayrıntıları Kasım 2026'da Microsoft Learn'den doğrulandı; emin olunamayan yerde "resmî belgeye bak" yazar. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };
const S = (op, cols, x) => Object.assign({ op, cols: cols || [] }, x || {});
const BA = [S('removeTop', [], { n: 1 }), S('promote'), S('removeCols', ['Not'])];
const BB = [S('trim', ['Şehir']), S('proper', ['Şehir']), S('replace', ['Tutar'], { find: '-', repl: 'null', whole: true }), S('type', ['Tutar'], { to: 'number' })];
const BC = [S('removeBlank'), S('distinct'), S('type', ['Tarih'], { to: 'date' }), S('removeErrors', ['Tarih'])];
const TEMIZ = BA.concat(BB, BC);
const ORTAM = '<div class="tip"><b>Kendi ortamında dene</b>';

/* ---------- Çoklu veri kaynağı ---------- */
add('pq-orta', {
  id: 'coklu-kaynak', lv: 'B1', mod: 'Veri Hazırlama', min: 30,
  title: 'Birden çok veri kaynağıyla çalışmak: ekle, birleştir, ilişkilendir',
  sum: 'SQL, Excel, SharePoint ve web kaynağını tek modelde toplamak. Sorguları eklemek mi, birleştirmek mi, ilişki kurmak mı? Gizlilik düzeyi, sorgu katlama ve yenileme sonuçları; Power Query Lab’de iki kaynakla çalışan alıştırmalar.',
  body: `
<p>Gerçek bir raporda veri tek yerden gelmez. Anadolu Market’te satış satırları şirket içindeki SQL Server’da, hedefler finansın SharePoint’teki Excel dosyasında, bayi raporları ortak klasördeki CSV’lerde, döviz kuru ise merkez bankasının sitesinde. <b>Birden çok kaynağı bağlamak kolaydır; zor olan, hangi işi nerede yapacağına karar vermektir.</b> Bu ders dört kaynağı tek modele indirirken sorulması gereken soruları ve yanlış kararın sonuçlarını anlatır.</p>
<h2>Üç yol: ekle, birleştir, ilişkilendir</h2>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Ne yapar?</th><th>Ne zaman?</th><th>Yanlış kullanılırsa</th></tr>
<tr><td><b>Sorguları ekle (Append)</b></td><td>Aynı yapıdaki tabloları alt alta koyar; satır sayısı artar.</td><td>Ocak ve Şubat dosyaları, şube dosyaları</td><td>Sütun adı farklıysa (“Şehir” ve “Sehir”) iki sütun oluşur, boşluklar null kalır.</td></tr>
<tr><td><b>Sorguları birleştir (Merge)</b></td><td>Bir anahtarla yan yana getirir; sütun sayısı artar.</td><td>Boyutu düzleştirmek, olguya tek bir öznitelik eklemek</td><td>Sağ tabloda anahtar yinelenirse satırlar çoğalır, toplamlar şişer.</td></tr>
<tr><td><b>Model ilişkisi</b></td><td>Tablolar ayrı kalır; filtre ilişkiden akar.</td><td>Olgu ve boyut, farklı taneciklikte hedef tablosu</td><td>Anahtar türleri uyuşmazsa ilişki kurulmaz; yetim satırlar boş satırda toplanır.</td></tr>
</table></div>
<p>Kural: <b>yeni bir olgu satırı geliyorsa ekle; bir boyutu ya da özniteliği tamamlıyorsan önce model ilişkisini düşün</b>, ancak tablo gerçekten tek bir boyuta inecekse birleştir. Yıldız şemanın nedeni “Veri modelleme” dersinde. Join türleri “Power Query: join türleri, dizin sütunu ve gruplu sıra” dersinde.</p>
<h2>Önce temizle, sonra birleştir</h2>
<p>Merge eşleşmesi büyük/küçük harfe ve boşluğa duyarlıdır. Bayi raporunda “ ANKARA ” yazıyorsa SharePoint listesindeki “Ankara” ile eşleşmez; sorgu hata vermez, sütun sessizce null gelir. Bu en sık yapılan çoklu kaynak hatasıdır: rapor açılır, görünür hiçbir sorun yoktur, ama bölge kırılımında büyük bir “(Boş)” satırı çıkar.</p>
<ol><li>İki taraftaki anahtarın türünü eşitle (metin ve sayı karışmasın).</li><li>Kırp, harf biçimini tekleştir, görünmeyen karakterleri temizle.</li><li>Sağ tablonun anahtarını yinelenenlere karşı kontrol et.</li><li>Birleştirmeden sonra eşleşmeyen satırları say: sol karşıt (left anti) birleştirme tam bu sayıyı verir.</li></ol>
<p>Power Query Lab’de bu akışı gerçekten yapacaksın: alıştırmalarda ikinci kaynak olarak SharePoint listesi ve Şubat CSV dosyası var.</p>
<h2>Gizlilik düzeyi ve Formula.Firewall</h2>
<p>Farklı kaynaklı iki sorgu birleşince Power Query bir kaynağın verisini ötekine gönderebilir. Gizlilik düzeyleri (Özel, Kuruluş, Genel) bunu sınırlar; ayarın yeri “Veri alma ve bağlantı modları” dersinde. Üç sonuç genelde atlanır:</p>
<ul><li><b>Sorgu katlama kırılabilir.</b> Özel düzeyli bir CSV ile SQL Server tablosu birleşiyorsa motor filtreyi SQL’e gönderemez; bütün tabloyu çeker, sonra yerelde birleştirir. Yenileme yavaşlar.</li>
<li><b>Masaüstü ayarı Service’e taşınmaz.</b> Microsoft Learn, Desktop’taki gizlilik ayarlarının yayımlanmadığını söyler. Yayımdan sonra anlam modeli ayarlarında (ağ geçidi varsa ağ geçidi bağlantısında) yeniden ver.</li>
<li><b>“Yok say” Service’te seni kurtarmaz.</b> Desktop’ta gizlilik düzeylerini yok sayarak çalışan sorgu Service’te hata verebilir.</li></ul>
<h2>Yenileme açısından çoklu kaynak</h2>
<p>Her kaynağın yenileme yolu farklıdır, ama bir anlam modeli yalnız <b>bir ağ geçidi bağlantısı</b> kullanır. Aynı sorguda şirket içi SQL ile SharePoint Online birleşiyorsa bulut kaynağı da ağ geçidinden geçmek zorundadır: ağ geçidinde bulut kaynağı için bir veri kaynağı tanımı eklenir ya da “kullanıcının bulut veri kaynaklarının bu ağ geçidi kümesinden yenilenmesine izin ver” seçeneği açılır. Ayrıntı “On-premises data gateway” dersinde.</p>
<div class="tbl-wrap"><table><tr><th>Kaynak</th><th>Kimlik bilgisi nerede?</th><th>Ağ geçidi?</th></tr>
<tr><td>Şirket içi SQL Server</td><td>Ağ geçidi bağlantısı</td><td>Evet</td></tr>
<tr><td>SharePoint Online Excel</td><td>Anlam modeli ayarları, Veri kaynağı kimlik bilgileri</td><td>Hayır (aynı sorguda şirket içiyle birleşiyorsa evet)</td></tr>
<tr><td>Ağ klasöründeki CSV</td><td>Ağ geçidi bağlantısı</td><td>Evet</td></tr>
<tr><td>Web sayfası</td><td>Anlam modeli ayarları</td><td>Hayır</td></tr></table></div>
<p>Pratik sonuç: ağ klasöründeki dosyayı SharePoint’e taşımak çoğu zaman bir ağ geçidi bağımlılığını ortadan kaldırır. Dinamik adresli kaynaklar da Service’te yenilenmeyebilir; web kaynağında <code>Web.Contents</code> ile <code>RelativePath</code> ya da <code>Query</code> kullan.</p>
<h2>Bileşik model ne zaman?</h2>
<p>Her kaynağı Import etmek zorunda değilsin. Satışlar DirectQuery, hedefler Import olabilir; bu bir bileşik modeldir. Ama farklı kaynak gruplarındaki tablolar arasındaki ilişki <b>sınırlı ilişki</b> olur. Tablo tablo karar “Kurumsal model” dersinde. Başlangıç kuralı: veri yeterince küçükse hepsini Import et, karmaşıklığı ancak bir gereksinim zorlarsa ekle.</p>
<h2>Kaynaklar arası mutabakat</h2>
<p>İki kaynak birleşince “hangi sayı doğru?” sorusu çıkar. Excel’den gelen bir tabloyu modele bağlamadan önce DAX sorgu görünümünde sınayabilirsin. Aşağıdaki sorgu, Excel’den gelmiş gibi küçük bir hedef tablosunu sanal ilişkiyle (TREATAS) modele bağlar:</p>
<pre class="dax">EVALUATE
VAR ExcelHedef =
    DATATABLE("Kategori", STRING, "Plan", INTEGER, {{"Kitap", 150000}, {"Elektronik", 350000}, {"Giyim", 200000}})
RETURN
    ADDCOLUMNS(ExcelHedef, "Net", CALCULATE([Net Satış], TREATAS({[Kategori]}, Kategoriler[Kategori])))</pre>
<p>Sonuçta Kitap 151.882 ₺, Elektronik 339.304 ₺ gelir. Excel’de “Kitaplar” yazsaydı o satır boş kalırdı; sorun rapora çıkmadan görülürdü.</p>
<div class="note"><b>Kontrol listesi</b>Her kaynağın sahibi ve yenileme sıklığı yazılı mı? · Anahtarlar temizlendi mi, türleri aynı mı? · Eşleşmeyen satır sayısı biliniyor mu? · Gizlilik düzeyi her kaynakta doğru mu, Service’te yeniden verildi mi? · Birleşen sorgu hâlâ katlanıyor mu (Yerel sorguyu görüntüle)? · Ağ geçidi gerekiyorsa bulut kaynağı da tanımlı mı?</div>
`,
  ex: [
    { t: 'pq', src: 'bayi', pre: TEMIZ, sol: [S('append', [], { with: 'bayi_sub' })], q: '<b>İki ayı tek tabloda topla.</b> Temizlenmiş Ocak bayi tablosunun altına Şubat CSV sorgusunu ekle. Sonuç 11 satır olmalı.', hint: 'Giriş sekmesi → Birleştir grubu → Sorguları ekle. Sütun seçmen gerekmez; sütunlar ada göre eşleşir.' },
    { t: 'pq', src: 'bayi', pre: TEMIZ, sol: [S('merge', ['Şehir'], { with: 'sehir_bolge', kind: 'left' })], q: '<b>Bölgeyi getir.</b> SharePoint listesini kullanarak her bayi satırına <code>Bölge</code> sütununu ekle. Hiçbir satır kaybolmamalı; satır sayısı 7 kalmalı.', hint: 'Şehir sütununu seç → Sorguları birleştir → ikinci sorgu Şehir ve bölge eşlemesi, tür Sol dış.' },
    { t: 'pq', src: 'bayi', pre: BA, sol: [S('trim', ['Şehir']), S('proper', ['Şehir']), S('merge', ['Şehir'], { with: 'sehir_bolge', kind: 'left' })], q: '<b>Sessiz hatayı yakala.</b> Bu tablo henüz temizlenmedi. Şehirler “ istanbul ”, “ANKARA” gibi. Doğrudan birleştirirsen <code>Bölge</code> her satırda null gelir ve hata görmezsin. Önce şehirleri temizle, sonra <code>Bölge</code>’yi getir. Hedef tablodaki gibi yalnızca boş satırda ve eşleşmesi olmayan yerde null kalsın.', hint: 'Sıra önemli: Kırp → Her Sözcüğün İlk Harfi → Sorguları birleştir (Sol dış). Önce birleştirirsen adımı sil, yeniden sırala.' },
    { t: 'pq', src: 'bayi', pre: TEMIZ.concat([S('merge', ['Şehir'], { with: 'sehir_bolge', kind: 'left' })]), sol: [S('group', ['Bölge'], { name: 'Toplam Tutar', agg: 'sum', src: 'Tutar' })], q: '<b>Bölge özeti çıkar.</b> Birleştirilmiş tabloyu <code>Bölge</code>’ye göre gruplandır; <code>Tutar</code>’ın toplamını <code>Toplam Tutar</code> adlı sütunda hesapla.', hint: 'Bölge sütununu seç → Gruplandırma ölçütü: yeni sütun adı Toplam Tutar, işlem Toplam, sütun Tutar.' },
    { t: 'query', q: 'Excel’den gelen hedef tablosunu modele bağlamadan sına. <code>DATATABLE</code> ile <b>Kategori</b> (STRING) ve <b>Plan</b> (INTEGER) sütunlu üç satır yaz: Kitap 150000, Spor 90000, Giyim 200000. <code>ADDCOLUMNS</code> ile her satıra <code>TREATAS</code> üzerinden <code>[Net Satış]</code> değerini <b>Net</b> adıyla ekle.', start: 'EVALUATE\n', sol: 'EVALUATE\nVAR ExcelPlan = DATATABLE("Kategori", STRING, "Plan", INTEGER, {{"Kitap", 150000}, {"Spor", 90000}, {"Giyim", 200000}})\nRETURN ADDCOLUMNS(ExcelPlan, "Net", CALCULATE([Net Satış], TREATAS({[Kategori]}, Kategoriler[Kategori])))', hint: 'CALCULATE içinde TREATAS({[Kategori]}, Kategoriler[Kategori]) satırdaki metni model sütununa filtre olarak uygular.' },
    { t: 'mc', q: 'Her ay gelen bayi dosyası aynı yapıda. Finans “Şubat’ı rapora ekle” diyor. Bir analist Ocak ve Şubat’ı ayrı tablolar olarak modele alıp ilişki kurmak istiyor. Ne dersin?', o: ['İki tablo ayrı kalsın; daha hızlı çalışır', 'Sorguları ekle; yeni olgu satırı geliyor', 'Sorguları birleştir; anahtar Bayi olsun', 'Şubat’ı ayrı bir .pbix dosyasına koy'], a: 1, why: 'Aynı yapıdaki yeni satırlar eklenir. Merge satırları değil sütunları artırır ve Bayi tekil olmadığı için satır çoğaltır. Ayrı tablo ya da dosya her ölçüyü ikiye böler.' },
    { t: 'mc', q: 'Birleştirmeden sonra toplam tutar 1,4 katına çıktı. Sol tablonun satır sayısı 10.000’den 14.200’e yükselmiş. En olası neden?', o: ['Sağ tabloda anahtar yineleniyor', 'Gizlilik düzeyi yanlış ayarlanmış', 'Birleştirme türü sol karşıt seçilmiş', 'Tür dönüşümü yuvarlama yapmış'], a: 0, why: 'Sağda aynı anahtardan birden çok satır varsa sol satır her eşleşme için çoğalır. Sol karşıt satır sayısını artırmaz; gizlilik düzeyi ve tür dönüşümü satır üretmez. Çözüm: sağ tabloyu anahtara göre tekilleştirmek.' },
    { t: 'mc', q: 'Rapor Desktop’ta sorunsuz. Yayımdan sonra SQL Server ve web kaynağını birleştiren sorgu Service’te hata veriyor; Desktop’ta “gizlilik düzeylerini yok say” açık. Önce ne yaparsın?', o: ['Ağ geçidini baştan kurarım', 'Raporu DirectQuery’ye alırım', 'Her kaynağa gerçek düzeyini veririm', 'Web kaynağını elle tabloya yazarım'], a: 2, why: 'Yok sayma ayarı Desktop’a özgüdür ve yayımlanmaz. Doğru çözüm SQL’e Kuruluş, web’e Genel vermek ve bunu Service tarafında da uygulamaktır. Ağ geçidini kurmak gizlilik hatasını çözmez, DirectQuery’ye geçmek sorunu büyütür.' },
    { t: 'mc', q: 'Bir sorgu ağ klasöründeki CSV ile şirket içi SQL’i birleştiriyor, sonuna da bir filtre ekledin. “Yerel sorguyu görüntüle” gri. Bu ne demek?', o: ['SQL Server filtreyi uygulamıştır', 'Katlama kırıldı, adım yerelde çalışıyor', 'Ağ geçidi çevrim dışı kalmıştır', 'Sorgu artık DirectQuery modundadır'], a: 1, why: 'Gri seçenek o adımın kaynağa SQL olarak gitmediğini gösterir. Filtre, tüm veri çekildikten sonra yerelde uygulanır. Filtreyi birleştirmeden önceye, SQL adımlarının üzerine taşımak genellikle katlamayı korur.' },
    { t: 'mc', q: 'Şirket içi SQL ile SharePoint Online’daki hedef Excel’i aynı sorguda birleştiren model yenilenmiyor: “veri kaynağı tanımlı değil”. SQL ağ geçidinde tanımlı. Eksik olan ne?', o: ['SharePoint için ayrı bir kişisel ağ geçidi', 'Modeli iki ayrı modele bölmek', 'Kişisel modda ağ geçidi kurmak', 'Bulut kaynağını aynı ağ geçidine eklemek'], a: 3, why: 'Bir model tek ağ geçidi bağlantısı kullanır; aynı sorguda birleşen bulut kaynağı da o ağ geçidinden geçer. İkinci ağ geçidi bu kısıtı çözmez. Modeli bölmek gereksiz bir mimari değişikliktir.' }
  ]
});

/* ---------- Çalışma alanı ve yayımlama ---------- */
add('kalite-test', {
  id: 'calisma-alani', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 30,
  title: 'Çalışma alanı (workspace) kurmak ve raporu yayımlamak',
  sum: 'Çalışma alanını kurmak, ayarları, dört rol ve lisans etkisi; Desktop’tan Service’e yayımlarken ne gider, ne gitmez; yayımdan sonra yapılacaklar ve adlandırma düzeni.',
  body: `
<p>Rapor bitti, Desktop’ta kusursuz çalışıyor. Şimdi başkaları görecek. İlk soru “nereye yayımlayacağım?”dır ve cevabı neredeyse her zaman <b>bir çalışma alanı</b>dır. Çalışma alanı (workspace), ekibin raporlarını, anlam modellerini ve panolarını birlikte tuttuğu paylaşılan bir kaptır.</p>
<div class="tbl-wrap"><table><tr><th></th><th>Çalışma alanım (My workspace)</th><th>Ekip çalışma alanı</th></tr>
<tr><td>Kim için?</td><td>Yalnız sen; deneme alanı</td><td>Ekip; gerçek içerik</td></tr>
<tr><td>Rol atama</td><td>Yok</td><td>Yönetici, Üye, Katkıda bulunan, Görüntüleyici</td></tr>
<tr><td>Uygulama yayımlama</td><td>Yok</td><td>Var</td></tr>
<tr><td>Kullanım ölçümleri, Direct Lake</td><td>Desteklenmez</td><td>Var (Direct Lake için Fabric kapasitesi gerekir)</td></tr></table></div>
<h2>Çalışma alanı kurmak</h2>
<p>Çalışma alanı yalnız Service’te oluşturulur; Desktop var olan bir çalışma alanına yayımlar, yenisini açamaz. <b>Çalışma alanları → Yeni çalışma alanı</b> ile ad verirsin. Ad kiracıda benzersiz olmalı. Pro ya da PPU lisansı gerekir; yönetici, oluşturmayı bir güvenlik grubuna kısıtlamış olabilir. Düğmeyi göremiyorsan önce lisansına, sonra yöneticiye bak.</p>
<div class="tbl-wrap"><table><tr><th>Ayar</th><th>Ne işe yarar?</th><th>İyi uygulama</th></tr>
<tr><td>İletişim listesi (Contact list)</td><td>Sorun bildirimlerini alanlar; varsayılan yöneticiler</td><td>Kişi değil, ekip grubu ekle</td></tr>
<tr><td>Workspace SharePoint (arayüzün bazı yerlerinde eski adıyla Workspace OneDrive)</td><td>Microsoft 365 grubunun belge kitaplığını bağlar</td><td>Erişimde de aynı grubu kullan; Power BI üyeliği eşitlemez</td></tr>
<tr><td>Lisans modu (Pro, PPU, Fabric kapasitesi)</td><td>Hangi özellik var, okuyucu ne lisans ister</td><td>Fabric öğesi gerekiyorsa kapasite şart</td></tr>
<tr><td>Katkıda bulunanların uygulamayı güncellemesine izin ver</td><td>Uygulamayı güncelleyebilirler; ilk yayını yapamaz, erişimi değiştiremezler</td><td>Rapor ekibi sürekli güncelliyorsa aç</td></tr></table></div>
<p>Yönetici çalışma alanını siler ve bu içeriği de siler; bu yüzden en az iki yönetici bulundur. Bir çalışma alanında toplam en fazla 1.000 Fabric ve Power BI öğesi bulunabilir; pratikte çok daha önce bölmek gerekir.</p>
<h2>Dört rol</h2>
<div class="tbl-wrap"><table><tr><th>İş</th><th>Yönetici</th><th>Üye</th><th>Katkıda bulunan</th><th>Görüntüleyici</th></tr>
<tr><td>Görüntüle, etkileşim</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>İçerik oluştur, düzenle, sil</td><td>✓</td><td>✓</td><td>✓</td><td></td></tr>
<tr><td>.pbix indir, Excel’de analiz et</td><td>✓</td><td>✓</td><td>✓</td><td>Yalnız Derleme izniyle Excel</td></tr>
<tr><td>Yenilemeyi zamanla</td><td>✓</td><td>✓</td><td>✓</td><td></td></tr>
<tr><td>Uygulama yayımla, erişimini değiştir</td><td>✓</td><td>✓</td><td></td><td></td></tr>
<tr><td>Düşük roller ekle</td><td>✓</td><td>✓</td><td></td><td></td></tr>
<tr><td>Her kullanıcıyı ekle, çıkar; çalışma alanını sil</td><td>✓</td><td></td><td></td><td></td></tr>
<tr><td>Satır düzeyi güvenlik uygulanır</td><td></td><td></td><td></td><td>✓</td></tr></table></div>
<p>İki ayrıntı sorun çıkarır. Üye, var olan birinin rolünü değiştiremez; önce yönetici kullanıcıyı çıkarır. RLS yalnız Görüntüleyici için çalışır: satış müdürüne “kolay olsun” diye Katkıda bulunan verirsen bütün bölgeleri görür. Son kullanıcıyı ise çalışma alanına değil, uygulamaya ekle (“Power BI uygulamaları” dersi).</p>
<div class="warn"><b>Lisans etkisi</b>Çalışma alanı paylaşılan kapasitedeyse içeriği görecek herkes Pro ya da PPU ister. F64 ve üstü Fabric ya da Premium kapasitede Görüntüleyici rolü ücretsiz lisansla da görür. F2-F32 kapasitede yine Pro gerekir. Kurallar değişebilir; satın almadan önce resmî lisans sayfasına bak.</div>
<h2>Desktop’tan yayımlamak</h2>
<ol><li>Dosyayı kaydet. <b>Giriş → Yayımla</b>.</li><li>Oturum açtığın hesabın çalışma alanlarından birini seç.</li><li>Aynı adda rapor varsa <b>Değiştir</b> sorusu gelir: içerik üzerine yazılır, rapor ve modelin kimliği korunur.</li><li>Başarı iletisindeki bağlantıyla raporu Service’te aç.</li></ol>
<div class="tbl-wrap"><table><tr><th>Yayımla ile giden</th><th>Gitmeyen: Service’te yeniden yapılır</th></tr>
<tr><td>Rapor sayfaları, görseller, yer işaretleri</td><td>Veri kaynağı kimlik bilgileri</td></tr>
<tr><td>Model: tablolar, ilişkiler, ölçüler, RLS rol tanımları</td><td>RLS rol üyeleri</td></tr>
<tr><td>Import verisi, Power Query adımları</td><td>Gizlilik düzeyleri</td></tr>
<tr><td>Parametreler</td><td>Yenileme zamanlaması, ağ geçidi bağlantısı</td></tr></table></div>
<p>Yayımdan sonraki bu liste bir alışkanlık olmalı. Bir kişi unuttuğunda sonuç: rapor o günün verisiyle kalır, RLS rolü boş olduğu için görüntüleyici hiçbir şey göremez. Model ve raporu ayırmayı düşünüyorsan “ince rapor” deseni “Veri akışları ve paylaşılan anlam modelleri” dersinde.</p>
<h3>Başka yollarla öğe eklemek</h3>
<ul><li><b>Karşıya yükle:</b> çalışma alanında .pbix ya da Excel dosyası yüklenir.</li><li><b>OneDrive ya da SharePoint’ten:</b> dosyaya bağlı öğe saatte bir denetlenir, dosya değişince güncellenir (OneDrive yenilemesi).</li><li><b>Dağıtım işlem hattı ya da Git:</b> ekip büyüdüğünde elle yayımlamanın yerini alır (“Yaşam döngüsü” dersi).</li></ul>
<h2>Adlandırma ve düzen</h2>
<p>“BI”, “Rapor2”, “Yeni klasör” gibi alanlar altı ay sonra kimsenin silmeye cesaret edemediği çöplüktür. Basit bir standart yeter: <code>Birim - Konu [Dev|Test|Prod]</code>. Her alanın sahibi, açıklaması ve iletişim listesi olsun. Çalışma alanı içinde klasör de kullanılabilir. Model ve raporları ayrı alanlarda tutmanın tasarımı “Yayımlama, yenileme ve yaşam döngüsü” dersinde.</p>
<h2>Yayım öncesi mutabakat</h2>
<p>Yayımlamadan önce modelin ana sayılarını bir sorguyla sabitle; yayımdan sonra aynı sorguyu Service’teki modelde çalıştırıp karşılaştır. Fark varsa yenileme ya da kaynak farklıdır:</p>
<pre class="dax">EVALUATE
ROW("Net Satış", [Net Satış], "Sipariş", [Sipariş Sayısı], "Satır", COUNTROWS(Satislar))</pre>
` + ORTAM + `Service için iş ya da okul hesabı gerekir; kişisel e-posta çoğu zaman kabul edilmez. Hesabın varsa <b>Çalışma alanım</b>a Desktop’tan bir rapor yayımla, sonra kimlik bilgisi ve yenileme ayarlarını gör. Ekip çalışma alanı için Pro, PPU ya da deneme lisansı gerekir. Hesabın yoksa bu dersin alıştırmalarıyla kararları çalış; Örnek raporlar sayfası Desktop’ta olanı taklit eder, Service’i taklit etmez.</div>
`,
  ex: [
    { t: 'mc', q: 'Yeni gelen satış analisti Desktop’tan yayımlamak istiyor ama hedef listesinde kendi ekibinin çalışma alanı yok. Diğer alanları görüyor. En olası neden?', o: ['Desktop sürümü çok eski', 'Dosya .pbip olarak kaydedilmiş', 'O çalışma alanında rolü yok', 'Rapor RLS içerdiği için gizleniyor'], a: 2, why: 'Hedef listesi, hesabının yayımlama yetkisi olduğu çalışma alanlarını gösterir. Katkıda bulunan ya da üstü rol gerekir. .pbip ve RLS yayımlamayı engellemez.' },
    { t: 'mc', q: 'Bölge müdürleri çalışma alanına Katkıda bulunan olarak eklendi. Model RLS’li ama hepsi tüm bölgeleri görüyor. Ne olmuş?', o: ['Katkıda bulunana RLS uygulanmaz', 'RLS üyeleri Service’te atanmamış', 'Rol tanımı yayımlanmamış', 'Filtre çift yönlü değil'], a: 0, why: 'Yönetici, Üye ve Katkıda bulunan modeli düzenleme yetkisi taşır, RLS onları süzmez. Üye atanmamış olsaydı Görüntüleyiciler hiç veri göremezdi. Çözüm: Görüntüleyici rolü ya da uygulama.' },
    { t: 'mc', q: 'Yeni rapor yayımlandı, açılıyor, ama iki gün sonra rakamlar hâlâ eski. Yenileme geçmişi boş. Önce neye bakarsın?', o: ['Rapor temasının dosyasına', 'Zamanlama kurulmuş mu', 'Görsel etkileşim ayarlarına', 'Hedefler tablosu ilişkisine'], a: 1, why: 'Yayımlama zamanlama kurmaz. Geçmiş boşsa hiç yenileme denenmemiştir. Önce kimlik bilgileri ve ağ geçidi, sonra zamanlama kurulur.' },
    { t: 'mc', q: 'Yayım sonrası işleri doğru sırayla hangisi veriyor?', o: ['Zamanla → kimlik bilgisi → RLS üyeleri → elle yenile', 'RLS üyeleri → zamanla → elle yenile → kimlik bilgisi', 'Test → zamanla → kimlik bilgisi → RLS üyeleri', 'Kimlik bilgisi → elle yenile → RLS üyeleri → zamanla'], a: 3, why: 'Kimlik bilgisi yoksa yenileme çalışmaz. Önce elle yenileyip çalıştığını görür, RLS üyelerini ekler, sonra zamanlarsın. Kimlik bilgisi olmadan zamanlamak art arda hata üretir; dört hatadan sonra zamanlama kapanır.' },
    { t: 'mc', q: 'F32 kapasitedeki alanda Görüntüleyici rolü verilen ücretsiz lisanslı müdürler raporu açamıyor. F64’e geçmek bütçeyi aşıyor. Hangi çözüm kuralla uyumlu?', o: ['Müdürlere Pro ya da PPU atamak', 'Rolü Görüntüleyiciden Üye yapmak', 'Raporu Web’de yayımlamak', 'Raporu sertifikalamak'], a: 0, why: 'F64 altında Power BI içeriği görmek için ücretli kullanıcı lisansı gerekir. Rol değiştirmek lisans kuralını aşmaz. Web’de yayımla kurumsal veri için asla kullanılmaz, sertifika erişim vermez.' },
    { t: 'mc', q: 'Bir Üye, Görüntüleyici olan arkadaşını Katkıda bulunana çıkarmak istiyor, ama rolünü değiştiremiyor. Doğru açıklama?', o: ['Üyeler kimseyi çalışma alanına ekleyemez', 'Rol yükseltme yalnız kapasitede yapılabilir', 'Üye mevcut rolü değiştiremez; yönetici çıkarır', 'Önce kullanıcıya Derleme izni verilmelidir'], a: 2, why: 'Learn’e göre Üye düşük rollerle kullanıcı ekleyebilir, ama var olan kullanıcının rolünü değiştiremez ya da onu çıkaramaz. Yönetici çıkardıktan sonra Üye yeni rolle ekleyebilir.' },
    { t: 'query', q: 'Yayım öncesi mutabakat sorgusu yaz: her <code>Tarih[Yil]</code> için <b>Net Satış</b> ve <b>Sipariş</b> ([Sipariş Sayısı]) döndür. Yayımdan sonra aynı sorgu Service’teki modelde çalıştırılıp karşılaştırılacak.', start: 'EVALUATE\n', sol: 'EVALUATE\nSUMMARIZECOLUMNS(Tarih[Yil], "Net Satış", [Net Satış], "Sipariş", [Sipariş Sayısı])', hint: 'SUMMARIZECOLUMNS(Tarih[Yil], "Ad", [Ölçü], …)' }
  ]
});

/* ---------- Panolar ---------- */
add('calisma-alani', {
  id: 'panolar', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 25,
  title: 'Panolar (dashboards): kutucuk, canlı sayfa ve veri uyarısı',
  sum: 'Rapor ile pano farkı, görsel sabitlemek, canlı sayfa, farklı raporlardan tek bakış, veri uyarısı kurmak; kutucuğa uygun ölçü yazmak ve panonun bugün hâlâ nerede işe yaradığı.',
  body: `
<p>Service’te “pano” (dashboard) belirli bir nesnedir: farklı raporlardan sabitlenen kutucuklardan oluşan <b>tek sayfa</b>. Günlük dilde her rapora pano denir; sınavda ve iş görüşmesinde bu karışıklık puan kaybettirir. Bu uygulamadaki Örnek raporlar sayfası da pano değil, rapordur.</p>
<h2>Rapor mu, pano mu?</h2>
<div class="tbl-wrap"><table><tr><th></th><th>Rapor</th><th>Pano</th></tr>
<tr><td>Sayfa</td><td>Bir ya da çok</td><td>Tek</td></tr>
<tr><td>Veri</td><td>Tek anlam modeli</td><td>Bir ya da çok rapor ve model</td></tr>
<tr><td>Nerede yapılır?</td><td>Desktop ve Service</td><td>Yalnız Service</td></tr>
<tr><td>Dilimleyici, filtre</td><td>Var</td><td>Yok (odak modundaki süzme kaydedilmez)</td></tr>
<tr><td>Detaya inme</td><td>Var</td><td>Yalnız sayfanın tamamı sabitlenmişse</td></tr>
<tr><td>Veri uyarısı</td><td>Klasik uyarı yok</td><td>Kart, KPI, gösterge kutucuklarında</td></tr>
<tr><td>Kutucuğa tıklayınca</td><td>Yok</td><td>Kaynak rapora gider</td></tr></table></div>
<h2>Ne zaman pano?</h2>
<p>Her raporun panoya ihtiyacı yoktur. Üç durumda işe yarar:</p>
<ul><li><b>Birden çok rapordan tek bakış.</b> Satış, stok ve kargo ayrı modellerde. Yönetici sabah üç raporu tek tek açmak istemez.</li><li><b>Veri uyarısı.</b> Klasik uyarılar yalnız panoda kurulur.</li><li><b>Ana sayfada öne çıkarma.</b> Yönetici için sade bir giriş.</li></ul>
<p>Tek modelde özet ve ayrıntı istiyorsan <b>iyi tasarlanmış bir rapor sayfası genellikle daha iyidir</b>: dilimleyici var, etkileşim var, Desktop’ta kaynak denetimine girer. Panolar Git tümleştirmesinde desteklenmez.</p>
<h2>Kutucuk sabitlemek</h2>
<ol><li>Service’te raporu <b>düzenleme izniyle</b> aç. Size paylaşılan rapordan sabitleyemezsin.</li><li>Görselin üzerindeki raptiye simgesi: <b>Panoya sabitle</b>.</li><li>Var olan panoyu seç ya da yeni oluştur.</li><li>Panoda kutucuğun … menüsünden başlık, alt başlık ve özel bağlantıyı düzenle.</li></ol>
<div class="tbl-wrap"><table><tr><th></th><th>Görsel sabitleme</th><th>Canlı sayfa sabitleme</th></tr>
<tr><td>Ne gider?</td><td>Tek görsel</td><td>Sayfanın tamamı</td></tr>
<tr><td>Etkileşim</td><td>Tıklayınca rapora gider</td><td>Sayfa içinde çapraz filtreleme çalışır</td></tr>
<tr><td>Rapordaki değişiklik</td><td>Görselin biçimi değişirse kutucuk güncellenmeyebilir</td><td>Sayfa yenilenince yansır</td></tr>
<tr><td>Mobil</td><td>Kutucuk olarak görünür</td><td>Rapor kutucukları mobilde etkileşimli değildir</td></tr></table></div>
<p>Pano oluşturmak bir yazar işidir. Çalışma alanında Pro ya da PPU gerekir; Çalışma alanım’da bu lisans gerekmez. Panoya görsel sabitlemeden metin, resim, video da eklenebilir; ama gerçek sayılar rapordan gelmeli ki tıklayan ayrıntıya ulaşabilsin.</p>
<h2>Veri uyarısı</h2>
<p>“Net satış 50.000 ₺’nin altına düşünce haber ver.” Bu iş panoda kurulur:</p>
<ul><li>Yalnız <b>gösterge, KPI ve kart</b> kutucuklarında.</li><li>Uyarıyı kuran kişiye özeldir; pano paylaşılmış olsa da başkası göremez. Ekip için her kişi kendi uyarısını kurar ya da Power Automate kullanılır.</li><li>Uyarı <b>veri yenilendiğinde</b> denetlenir. Model günde bir yenileniyorsa uyarı da günde bir kez bakar.</li><li>Sıklık sınırlıdır: saatte ya da 24 saatte en fazla bir bildirim. Bildirim merkezinde her zaman, e-postada isteğe bağlı görünür.</li></ul>
<p>Fabric’te Activator, rapor görselinden kural tabanlı uyarı kurmayı sağlar (“Yayımlama” dersinde örnek var). Satın alma kararı değil, “kimin haber alması gerekiyor” sorusu belirleyicidir.</p>
<h2>Kutucuğa uygun ölçü</h2>
<p>Panoda dilimleyici olmadığı için <b>bağlamı ölçünün içine yazarsın</b>. Rapordaki bir kart seçili yıla bakar, panodaki kutucuk ise sabitlendiği hâlde kalır. “2024 net satışı” gibi sabit bir dönem için:</p>
<pre class="dax">Kart 2024 Net Satış =
CALCULATE([Net Satış], Tarih[Yil] = 2024)</pre>
<p>Eşik uyarısı için sayısal bir sapma göstermek, metin göstermekten iyidir: “hedefin 12.000 ₺ gerisinde” gibi bir değer eşikle karşılaştırılabilir.</p>
<div class="warn"><b>Soru-Cevap kalkıyor</b>Panonun üstündeki soru kutusu Soru-Cevap (Q&amp;A) ile çalışır ve emekliye ayrılıyor. Learn’deki güncel uyarı Şubat 2027 diyor; önceki duyurularda Aralık 2026 geçiyordu. Tarih için resmî sayfaya bak. Yeni pano tasarımını soru kutusuna dayandırma; yerine bağımsız Copilot önerilir (“Copilot ile çalışmak” dersi).</div>
` + ORTAM + `Service’te herhangi bir raporu aç, bir kartı Çalışma alanım’daki yeni bir panoya sabitle, kutucukta uyarı kur. Ücretsiz lisansla Çalışma alanım’da denenebilir. Uyarının tetiklenmesi için verinin yenilenmesi gerekir; değişmeyen örnek veride uyarı gelmez.</div>
`,
  ex: [
    { t: 'mc', q: 'Yönetim kurulu üyesi sabah tek ekranda satış, stok ve kargo KPI’larını görmek istiyor. Üçü ayrı anlam modellerinde. Hangisi?', o: ['Üç modeli tek modelde birleştirmek', 'Üç rapordan sabitlenen bir pano', 'Üç sayfalı tek bir rapor', 'Her rapordan ayrı abonelik'], a: 1, why: 'Rapor tek modele bağlıdır; pano farklı modellerden kutucuk toplar. Modelleri birleştirmek bu ihtiyaç için aşırı bir mimari değişikliktir. Abonelik üç ayrı e-posta üretir, tek bakış değildir.' },
    { t: 'mc', q: 'Analist rapordaki kartta “Uyarı ayarla” bulamıyor. Rapor ona paylaşılmış. Panoya da sabitleyemiyor. Ne yapmalı?', o: ['Desktop’ı güncellemeli', 'Kartı KPI görseline çevirmeli', 'Düzenleme izni olan kişi sabitlemeli', 'Raporu Web’de yayımlamalı'], a: 2, why: 'Paylaşılan rapordan sabitleme yapılamaz; düzenleme izni gerekir. Klasik uyarı da panoda kurulur. Yazar kutucuğu panoya koyup panoyu paylaşırsa analist kendi uyarısını kurabilir.' },
    { t: 'mc', q: 'Pano paylaşılan kullanıcı, senin kurduğun 50.000 ₺ uyarısını görmüyor. Neden?', o: ['Uyarı kişiye özeldir', 'Lisansı yetersizdir', 'Kutucuk canlı sayfa değildir', 'Model yenilenmemiştir'], a: 0, why: 'Uyarı yalnız kuran kişiye görünür, pano paylaşılsa da paylaşılmaz. Ekip bildirimi için herkes kendi uyarısını kurar ya da Power Automate kullanılır.' },
    { t: 'mc', q: 'Model her gece 02:00’de yenileniyor. Müdür “öğlen eşik aşılırsa hemen haber ver” diyor. Sana sorsa?', o: ['Uyarı sıklığını saatliğe almak yeter', 'Uyarı yenilemede bakar; önce tazelik değişmeli', 'Kartı canlı sayfa olarak sabitlemek çözer', 'E-posta yerine bildirim merkezini seçmek'], a: 1, why: 'Uyarılar yeni veri geldiğinde denetlenir. Gün içi tepki için önce yenileme sıklığı ya da depolama modu değişmeli. Sıklık ayarı yalnız bildirimi sınırlar, veriyi güncellemez.' },
    { t: 'mc', q: 'Tek modelli bir rapor için “özet ekranı” isteniyor; kullanıcı yılı ve bölgeyi seçebilmeli. Hangi öneri doğru?', o: ['Yıl başına bir pano', 'Dilimleyicili bir rapor sayfası', 'Canlı sayfa panosu ve odak modu', 'Yıl başına bir yer işareti panosu'], a: 1, why: 'Panoda dilimleyici yoktur, odak modundaki süzme kaydedilmez. İhtiyaç seçim ve tek model olduğunda rapor sayfası hem daha esnek hem daha kolay bakımlıdır.' },
    { t: 'dax', name: 'Kutucuk 2024 Net Satış', q: '<b>Kutucuk 2024 Net Satış</b>: Panoda dilimleyici yok. Yılı ölçünün içine yaz: 2024 yılının net satışı. Kategori kırılımında çalışmaya devam etmeli.', sol: 'CALCULATE([Net Satış], Tarih[Yil] = 2024)', hint: 'CALCULATE([Net Satış], Tarih[Yil] = 2024)', grid: [{ t: 'Kategoriler', c: 'Kategori' }] },
    { t: 'dax', name: 'Kutucuk Hedef Sapması', q: '<b>Kutucuk Hedef Sapması</b>: Veri uyarısı için sayısal sapma: <code>[Net Satış]</code> eksi <code>[Hedef]</code>. Hedefin altındaysa negatif çıkmalı. Hazır ölçüleri kullan.', sol: '[Net Satış] - [Hedef]', hint: 'İki hazır ölçüyü çıkar.', grid: [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }] }
  ]
});

/* ---------- Paylaşım ---------- */
add('panolar', {
  id: 'paylasim', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 25,
  title: 'Paylaşım ve erişim: bağlantı türleri, izinler ve dağıtım seçimi',
  sum: 'Rapor paylaşmanın yolları ve hangisinin ne zaman doğru olduğu: bağlantı türleri, Yeniden paylaş ve Derleme izinleri, kuruluş dışı kullanıcılar, kaldırma; “paylaştım ama göremiyor” teşhisi.',
  body: `
<p>“Raporu paylaştım ama göremiyor.” Power BI desteğine gelen en sık cümlelerden biri. Sebep genellikle üç şeyden biridir: lisans, modele erişim ya da yanlış bağlantı türü. Bu ders doğru dağıtım yolunu seçmeyi ve paylaşım sorunlarını teşhis etmeyi öğretir.</p>
<h2>Dağıtım yolları</h2>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Ne zaman doğru?</th><th>Bedel</th></tr>
<tr><td><b>Çalışma alanı rolü</b></td><td>Birlikte geliştiren ekip</td><td>Okuyucuya verilirse görünüm karışır, RLS rolle değişir</td></tr>
<tr><td><b>Doğrudan paylaşım</b></td><td>Birkaç kişi, tek rapor, hızlı</td><td>Kişi kişi izlemek zorlaşır, bağlantılar birikir</td></tr>
<tr><td><b>Uygulama (app)</b></td><td>Geniş kitle, düzenli menü, kitleler</td><td>Kurulum ve güncelleme disiplini gerekir</td></tr>
<tr><td><b>Teams, SharePoint</b></td><td>Kullanıcı zaten orada çalışıyor</td><td>Bağlantı erişim vermez; izni ayrıca verilir</td></tr>
<tr><td><b>Abonelik</b></td><td>Düzenli e-posta anlık görüntüsü</td><td>Etkileşim yok; görüntüleme sayısını şişirebilir</td></tr>
<tr><td><b>Web’de yayımla</b></td><td>Yalnız herkese açık veri</td><td>Kimlik doğrulaması yok, alttaki tüm veri açığa çıkar</td></tr></table></div>
<p>Kural: <b>bir kez, küçük: paylaş. Sürekli, büyük: uygulama. Yazan ekip: rol.</b> Uygulama “Power BI uygulamaları” dersinde.</p>
<h2>Bağlantı türleri</h2>
<p>Rapordaki <b>Paylaş</b> düğmesi “Bağlantı gönder” penceresini açar. Üç tür vardır:</p>
<div class="tbl-wrap"><table><tr><th>Tür</th><th>Kim açabilir?</th><th>Dikkat</th></tr>
<tr><td><b>Kuruluşundaki kişiler</b></td><td>Kuruluştan bağlantıyı alan herkes</td><td>Konuk ve dış kullanıcıda çalışmaz; yönetici kapatabilir</td></tr>
<tr><td><b>Belirli kişiler</b></td><td>Yazdığın kişi ve gruplar, Entra B2B konukları dahil</td><td>Dış kullanıcı konuk olmalı</td></tr>
<tr><td><b>Erişimi olan kişiler</b></td><td>Zaten erişimi olanlar</td><td>Erişim vermez; yalnız adres üretir</td></tr></table></div>
<p>Her rapor için en fazla 1.000 paylaşım bağlantısı olabilir; sınıra gelirsen “Belirli kişiler” bağlantılarını silip doğrudan erişim verirsin. Pano doğrudan paylaşımında tek seferde en fazla 100 kullanıcı ya da grup yazılır; daha büyük kitlede grup ya da uygulama kullan.</p>
<h2>İzinler: Yeniden paylaş ve Derleme</h2>
<ul><li><b>Yeniden paylaş:</b> alan kişi başkasına da paylaşabilir. Rapor bağlantılarında varsayılan olarak açık gelir. Hassas raporda kapat.</li><li><b>Derleme (Build):</b> alan kişi modeli kullanarak kendi raporunu yapar, Excel’de analiz eder. Rapor bağlantısında varsayılan kapalı, pano paylaşımında varsayılan açıktır. RLS ve OLS yine geçerlidir.</li></ul>
<div class="warn"><b>Gizleme güvenlik değildir</b>Gizli sütun, gizli sayfa ve kilitli filtre yalnız görünümü değiştirir. Derleme izni olan biri Excel’de modeli sorgular. Bir sütunu saklamak gerekiyorsa OLS, satırları saklamak gerekiyorsa RLS kullan.</div>
<h2>Kuruluş dışı kullanıcılar</h2>
<p>Yönetici kiracı ayarından dış paylaşımı açmış olmalı. Dış kullanıcı Microsoft Entra B2B konuğu olarak davet edilir, gönderilen e-posta adresiyle oturum açar. Bağlantıyı başkasına iletmek işe yaramaz; yalnız doğrudan alıcılar görür. Konuk panoyu yeniden paylaşamaz. İçerik Premium ya da F64+ kapasitede değilse konuğun da Pro ya da PPU lisansı gerekir.</p>
<h2>“Paylaştım ama göremiyor” teşhisi</h2>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Olası neden</th><th>Çözüm</th></tr>
<tr><td>“Lisans gerekiyor” iletisi</td><td>Paylaşılan kapasite ya da F64 altı, alıcı ücretsiz lisanslı</td><td>Pro/PPU ya da F64+ kapasite</td></tr>
<tr><td>Rapor açılıyor, görseller hata veriyor</td><td>Model başka çalışma alanında, erişim yok</td><td>Modele erişim ver; zincirdeki her modele</td></tr>
<tr><td>Rapor boş ya da bazı değerler yok</td><td>RLS rolüne eklenmemiş</td><td>Rol üyeliğini kontrol et; “Farklı görüntüle” ile test et</td></tr>
<tr><td>“Benimle paylaşılanlar”da yok</td><td>Bağlantı “Erişimi olan kişiler” türünde</td><td>Doğru türle yeniden paylaş</td></tr>
<tr><td>Teams sekmesinde “içerik kullanılamıyor”</td><td>Teams’e eklemek erişim vermez</td><td>Rapor iznini ayrıca ver; grup kullan</td></tr>
<tr><td>Uygulamadaki raporu paylaşamıyor</td><td>Uygulama raporu yeniden paylaşılmaz</td><td>Uygulama sahibi kişiyi kitleye ekler</td></tr></table></div>
<h2>Erişimi kaldırmak ve denetlemek</h2>
<p>Raporda <b>İzinleri yönet</b> ekranından bağlantılar, doğrudan erişimler ve bekleyen talepler görülür. Pano erişimini kaldırırken ilgili rapor ve model erişimini de kaldırmayı düşün. Kullanıcıyı Entra’da devre dışı bırakmak erişim kayıtlarını silmez, yalnız kullanmasını engeller. Düzenli denetim için kimin hangi yolla geldiğini bilmek gerekir. Aşağıdaki sorgu örnek bir erişim envanterini özetler; ne kadar erişimin bağlantıyla dağıldığını gösterir:</p>
<pre class="dax">EVALUATE
VAR Envanter =
    DATATABLE("Kisi", STRING, "Yol", STRING, {
        {"ayse", "Uygulama"}, {"mert", "Uygulama"}, {"selin", "Uygulama"},
        {"burak", "Bağlantı"}, {"kerem", "Bağlantı"}, {"deniz", "Rol"}
    })
RETURN
    GROUPBY(Envanter, [Yol], "Kişi", SUMX(CURRENTGROUP(), 1))</pre>
<p>Üç kişi uygulamadan, iki kişi tek tek bağlantıyla, bir kişi rolle geliyor. Bağlantıyla gelenler büyüyorsa uygulamaya geçme zamanıdır.</p>
` + ORTAM + `Çalışma alanım’daki raporu Pro ya da deneme lisanslı bir meslektaşınla paylaş; “Belirli kişiler” bağlantısında Yeniden paylaş kutusunu kapat, İzinleri yönet ekranında sonucu gör. Paylaşım için ücretli lisans gerekir; lisansın yoksa senaryoları alıştırmalarla çalış.</div>
`,
  ex: [
    { t: 'mc', q: 'Finans müdürü yönetim raporunu üç yöneticiye bugün göstermek istiyor. Model RLS’li, yöneticiler çalışma alanı üyesi değil. En uygun yol?', o: ['Üçüne çalışma alanında Üye rolü vermek', 'Belirli kişilere Yeniden paylaş kapalı bağlantı', 'Raporu Web’de yayımlayıp adres vermek', 'Uygulama açıp otomatik yüklemeyle vermek'], a: 1, why: 'Üç kişi ve tek seferlik ihtiyaç için doğrudan bağlantı yeterlidir; Yeniden paylaş kapatılarak yayılma önlenir. Üye rolü RLS’i aşar. Web’de yayımla kurumsal veri için kullanılmaz. Uygulama bu ölçek için ağırdır.' },
    { t: 'mc', q: 'Tedarikçi firmadaki kişiye (kuruluş dışında) “Kuruluşundaki kişiler” bağlantısı gönderildi. Açamıyor. Neden?', o: ['Bu tür konuklarda çalışmaz', 'Rapor sertifikalı olmalı', 'Kişinin Derleme izni olmalı', 'Bağlantının süresi dolmuştur'], a: 0, why: 'Bu tür yalnız kuruluş içindir. Dış kişi Entra B2B konuğu olarak davet edilip “Belirli kişiler” ile paylaşılmalıdır; kiracıda dış paylaşım da açık olmalı.' },
    { t: 'mc', q: 'Analiste yalnız görüntüleme verdiğini düşünüyordun, ama kendi raporunu yapıp Excel’de bağlandı. Paylaşırken neye bakmalıydın?', o: ['Filtreler bölmesi kilidine', 'Görsel üstbilgi ayarına', 'Derleme izni kutusuna', 'Sayfa gizleme ayarına'], a: 2, why: 'Excel’de analiz ve yeni rapor Derleme izniyle mümkün olur. Filtre kilidi, üstbilgi ve gizli sayfa güvenlik sağlamaz, bu erişimi de kapatmaz.' },
    { t: 'mc', q: 'Maaş sütunu gizlendi ve rapor Derleme izniyle paylaşıldı. Bir kullanıcı Excel’den maaşı görebildi. Doğru düzeltme?', o: ['Sütunu rapor filtresinden kaldırmak', 'Dışa aktarmayı kapatmak', 'Sayfayı gizli yapmak', 'Maaş sütununa OLS kuralı vermek'], a: 3, why: 'Gizleme güvenlik değildir. Sütunu rol bazında kapatan OLS’dir. Dışa aktarma ayarı Excel’de analiz bağlantısını da çözmez.' },
    { t: 'mc', q: 'Ekip kanalına bir rapor sekmesi eklendi. Bir kullanıcı “İçerik kullanılamıyor” görüyor. Lisansı var. Neye bakarsın?', o: ['Teams sürümüne', 'Rapordaki erişim iznine', 'Sekmenin adına', 'Tarayıcı önbelleğine'], a: 1, why: 'Teams’e eklemek ya da bağlantı göndermek erişim vermez. Learn lisanssız ya da izinsiz kullanıcıların bu iletiyi gördüğünü söyler. Kolay yol: ekibin Microsoft 365 grubuna erişim.' },
    { t: 'mc', q: 'Bir kullanıcı uygulama içindeki raporu ekip arkadaşına paylaşmak istiyor, ama seçenek yok. Sana soruyor. Doğru cevap?', o: ['Rapor bağlantısını e-postayla göndersin', 'Uygulama sahibi kişiyi kitleye eklesin', 'Raporu indirip kendi alanına yüklesin', 'Tarayıcıda oturumu yenilesin'], a: 1, why: 'Uygulama üzerinden alınan rapor yeniden paylaşılmaz. Sahip kişiyi ekler, uygulamayı günceller. E-postayla gönderilen adres erişim vermez.' },
    { t: 'query', q: 'Erişim envanteri: <b>Kisi</b>, <b>Yol</b> sütunlu DATATABLE yaz; satırlar ayse-Uygulama, mert-Uygulama, burak-Bağlantı, kerem-Bağlantı, selin-Bağlantı, deniz-Rol. Yol başına kişi sayısını <b>Kişi</b> adıyla döndür.', start: 'EVALUATE\n', sol: 'EVALUATE\nVAR E = DATATABLE("Kisi", STRING, "Yol", STRING, {{"ayse", "Uygulama"}, {"mert", "Uygulama"}, {"burak", "Bağlantı"}, {"kerem", "Bağlantı"}, {"selin", "Bağlantı"}, {"deniz", "Rol"}})\nRETURN GROUPBY(E, [Yol], "Kişi", SUMX(CURRENTGROUP(), 1))', hint: 'GROUPBY(Tablo, [Yol], "Kişi", SUMX(CURRENTGROUP(), 1))' }
  ]
});

/* ---------- Uygulamalar ---------- */
add('paylasim', {
  id: 'power-bi-apps', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 28,
  title: 'Power BI uygulamaları (apps): kurmak, kitleler, güncellemek',
  sum: 'Çalışma alanı uygulaması (workspace app) ve kuruluş uygulaması (org app) arasında seçim; yayımlama adımları, kitleler, gizli içerik tuzağı, izinler, güncelleme ve otomatik yükleme.',
  body: `
<p>Satış ekibinde 300 kişi var. Her birine bağlantı göndermek, çalışma alanına eklemek ya da e-postayla PDF atmak yerine menülü tek bir paket istiyorsun: işte <b>uygulama (app)</b>. Çalışma alanı mutfaktır, uygulama servistir. Yazarlar mutfakta değiştirir, okuyucu güncellenene kadar eski tabağı görür.</p>
<h2>İki tür uygulama</h2>
<p>Learn iki tür tanımlar. Klasik “Power BI uygulaması”nın resmî adı artık <b>çalışma alanı uygulaması</b>dır. <b>Kuruluş uygulaması</b> (org app) daha yeni bir Fabric öğesidir, genel kullanımdadır ve ikisi birlikte yaşayabilir. Mevcut uygulamalar kendiliğinden değişmez. Bilgiler Kasım 2026’da Learn’den kontrol edildi; ayrıntılar değişebilir.</p>
<div class="tbl-wrap"><table><tr><th></th><th>Çalışma alanı uygulaması</th><th>Kuruluş uygulaması</th></tr>
<tr><td>Çalışma alanı başına</td><td>Bir</td><td>Birden çok</td></tr>
<tr><td>İçerik</td><td>Sürümlü: “Uygulamayı güncelle” denene kadar eski kalır</td><td>Canlı: kaydedilince görünür</td></tr>
<tr><td>Modele erişim</td><td>Yazar elle yönetir</td><td>Otomatik verilir; başka çalışma alanında olsa da</td></tr>
<tr><td>Kullanıcıyı çıkarınca</td><td>Model erişimi elle kaldırılır</td><td>Uygulamadan gelen erişim otomatik kalkar</td></tr>
<tr><td>Kullanıcı tarafı</td><td>Yükleme ister (ya da otomatik yükleme)</td><td>Yükleme yok; Uygulamalar listesinde görünür</td></tr>
<tr><td>Yorum</td><td>Rapor araç çubuğunda var</td><td>Rapor araç çubuğunda yok</td></tr>
<tr><td>Oluşturma</td><td>Çalışma alanı araç çubuğu: Uygulama oluştur</td><td>Yeni → Org app</td></tr></table></div>
<p>Karar sorusu: <b>“Yazarın kaydettiği her değişiklik okuyucuya hemen gitmeli mi?”</b> Hayır ve test sonrası sürüm yayımlanacaksa çalışma alanı uygulaması. Aynı alandan birden çok paket, farklı alanlardaki modeller ve daha az izin işi isteniyorsa kuruluş uygulaması değerlendirilir. Bu derste sınavda da sorulan çalışma alanı uygulamasını adım adım işleyeceğiz.</p>
<h2>Yayımlama: üç sekme</h2>
<ol><li><b>Kurulum (Setup):</b> ad, açıklama, tema rengi, destek sitesi, iletişim. Gelişmiş ayarlarda rapor kopyalama, gizli içerik erişimi ve uygulamadaki Copilot.</li><li><b>İçerik (Content):</b> çalışma alanındaki öğeleri seç, sırala, dış bağlantı ekle.</li><li><b>Kitle (Audience):</b> kitleleri oluştur, içerik görünürlüğünü ve erişimi ver.</li></ol>
<p>Sonra <b>Uygulamayı yayımla</b>. Yayımlamak ve güncellemek için Pro ya da PPU gerekir. Yönetici ve Üye yayımlar; Katkıda bulunan yalnız yönetici izin verirse günceller. Çalışma alanı başına bir uygulama vardır.</p>
<h2>Kitleler</h2>
<p>Kitle (audience), aynı uygulamada farklı grubun farklı içerik görmesini sağlar. “Temsilciler” Satış Performansı’nı, “Yönetim” ek olarak Kârlılık raporunu görür.</p>
<ul><li>Uygulama başına en fazla 25 kitle; kişi ve grup toplamı 10.000; kitle başına 1.000 giriş. Grup tek giriş sayılır, bu yüzden kişi değil grup ekle.</li><li>Çalışma alanı kullanıcıları her kitlede sayılır: 4 kullanıcı ve 5 kitle 20 giriş eder.</li><li>Kullanıcı birden çok kitledeyse üstte sekme ve “Tümü” görür.</li></ul>
<div class="warn"><b>Kitle güvenlik değildir</b>Gizlemek görünümü değiştirir. Gizli içeriğe erişim seçeneği açıksa, bağlantısı olan herkes gizli öğeleri açabilir. Kârlılık raporunda marjı saklamak gerekiyorsa RLS ya da OLS kullan. Ayrıca gizlenmiş bir rapora giden kutucuk hata verir, gizli detay sayfasına gidilemez.</div>
<h2>Güncellemek ve tuzakları</h2>
<ul><li><b>Çalışma alanı sahneleme alanıdır.</b> Rapor değişti, ama kullanıcı görmüyor: “Uygulamayı güncelle” dememişsindir.</li><li><b>Yeni içerik kitlelerde gizli gelir.</b> İlk yayımda hepsi görünür, sonradan eklenen elle açılır. “Yeni raporu ekledim, kimse göremiyor” şikâyetinin sebebi budur.</li><li><b>Raporu çıkarmak kişiselleştirmeleri siler.</b> Kullanıcının yer işaretleri ve yorumları gider, rapor geri eklense de dönmez.</li><li><b>İzni kaldırmak eski erişimi almaz.</b> Güncellemede izin kutusunu kapatmak yeni yükleyenleri etkiler; var olan Derleme ya da paylaşım iznini modelin Doğrudan erişim sekmesinden kaldır.</li><li><b>Başka alandaki model.</b> Uygulama, modeli başka çalışma alanındaysa o modele erişimi kendi vermez. Tüm kullanıcılar erişebilmeli; zincirli modellerde her halkaya izin ver.</li><li><b>Yayımdan çekmek</b> uygulamayı herkesten kaldırır, kişiselleştirmeleri siler. Çalışma alanı içeriği durur.</li></ul>
<h2>Erişim ve otomatik yükleme</h2>
<p>Erişimi olmayan kullanıcı varsayılan olarak talep gönderebilir; talep sahibe e-postayla gider. <b>İzinleri yönet</b> ekranında Doğrudan erişim ve Bekleyen sekmeleri vardır. Fabric yöneticisi izin verdiyse <b>Bu uygulamayı otomatik yükle</b> seçeneği uygulamayı kitlelere iter; “Tüm kuruluş” için yapılamaz. Mesai dışında yayımla, birkaç kullanıcıyla doğrula.</p>
<h2>Lisans</h2>
<p>Çalışma alanı Premium ya da F64+ kapasitede değilse uygulamayı açmak için herkes Pro ya da PPU ister. Kapasitedeyse ücretsiz lisansla da görülür. Uygulamadaki Copilot önizlemededir ve Copilot gereksinimlerine bağlıdır (“Copilot ile çalışmak” dersi).</p>
<h2>Yaşam döngüsü ile</h2>
<p>Dağıtım işlem hatlarında çoklu kitle tam desteklenmez; yeni içeriğin görünürlüğünü elle yönet. Uygulama öğelerinin kimlikleri çalışma alanındakilerden farklıdır; kullanım günlüklerini okurken bunu hesaba kat. Yayımlama ya da güncelleme 1 dakikada zaman aşımına uğrarsa içerik sayısını azalt ya da raporları gelişmiş rapor biçimine (PBIR) çevir.</p>
<p>Kaç giriş kullandığını hesaplamak kolaydır. Örnek bir kitle planında toplam girişi hesaplayan sorgu:</p>
<pre class="dax">EVALUATE
VAR CalismaAlaniKullanici = 4
VAR Kitleler =
    DATATABLE("Kitle", STRING, "Grup", INTEGER, {{"Temsilciler", 12}, {"Bölge Müdürleri", 3}, {"Yönetim", 1}})
RETURN
    ROW("Toplam Giriş", SUMX(Kitleler, [Grup] + CalismaAlaniKullanici), "Sınır", 10000)</pre>
<p>Sonuç: 16 + 7 + 5 = 28 giriş. Grup yerine kişi ekleseydin 600 temsilci tek başına kitle başına 1.000 sınırına yaklaşırdı.</p>
` + ORTAM + `Pro ya da deneme lisansıyla bir çalışma alanında iki raporla uygulama kur, iki kitle tanımla, bir raporu ikinci kitleden gizle, sonra rapora değişiklik yapıp <b>Uygulamayı güncelle</b> demeden görüntüle. Lisansın yoksa kararları alıştırmalarla çalış.</div>
`,
  ex: [
    { t: 'mc', q: 'Rapor yazarı düzeltmeyi yayımladı, çalışma alanında görünüyor, ama uygulama kullanıcıları eski sayıları görüyor. Neden?', o: ['Yenileme başarısız oldu', 'Kitle tanımı bozuldu', 'Uygulama güncellenmedi', 'Otomatik yükleme kapalı'], a: 2, why: 'Çalışma alanı sahneleme alanıdır; değişiklik “Uygulamayı güncelle” denene kadar çalışma alanı uygulamasına gitmez. Veri yenilemesi ayrıdır: yeni veri model üzerinden görünür, ama rapor tasarımı değişikliği güncelleme ister.' },
    { t: 'mc', q: 'Uygulamaya yeni bir “Kargo” raporu eklendi ve güncellendi. Temsilciler kitlesi raporu görmüyor. Önce neye bakarsın?', o: ['Rapor kitlede gizli mi', 'Model başka alanda mı', 'Temsilcilerin lisansı', 'Uygulamanın teması'], a: 0, why: 'Sonradan eklenen içerik her kitlede varsayılan gizli gelir, elle açılır. İlk yayımda hepsi görünür olduğu için bu sürpriz olur.' },
    { t: 'mc', q: 'Yönetim kitlesine özel Kârlılık raporu var. “Gizli içeriğe erişim” açık. Temsilci bağlantıyı buldu, raporu açtı. Doğru sonuç?', o: ['Kitle bunu engellemeliydi; hata var', 'Ayarı kapat, RLS ya da OLS kullan', 'Kârlılık raporunu sertifikalamak', 'Temsilciler kitlesini yeniden kurmak'], a: 1, why: 'Learn uyarır: bu seçenek açıksa bağlantısı olan gizli öğeyi açabilir. Kitle güvenlik sınırı değildir. Hassas veri için ayarı kapatıp model güvenliği kullan.' },
    { t: 'mc', q: 'Bir çalışma alanından üç departmana bağımsız takvimli üç paket dağıtılacak. Modeller başka alanlarda da var ve yazar erişim işini azaltmak istiyor. Hangisi en uygun?', o: ['Tek çalışma alanı uygulaması, üç kitle', 'Üç kuruluş uygulaması', 'Üç doğrudan paylaşım bağlantısı', 'Üç çalışma alanı, üç rol'], a: 1, why: 'Kuruluş uygulamasında çalışma alanı başına birden çok uygulama olur ve model erişimi çapraz alanda otomatik verilir. Tek uygulamanın üç kitlesi bağımsız güncellenemez. Ama içerik kaydedilince hemen görünür; sürüm kapısı yoktur, bu bedeli bil.' },
    { t: 'mc', q: 'Yazar uygulamadaki “Modeli kullanarak içerik oluştur” iznini kapatıp güncelledi. Eski kullanıcılar hâlâ model üzerinde rapor yapabiliyor. Doğru açıklama?', o: ['Uygulama izinleri önbellekten okuyor', 'Kullanıcı Excel’den bağlanıyor', 'Çalışma alanı rolleri silinmeli', 'Mevcut izin modelden kaldırılmalı'], a: 3, why: 'Güncellemede izin kaldırmak var olan erişimi almaz; yalnız yeni yüklemeleri etkiler. Modelin Doğrudan erişim sekmesinden kaldırılır.' },
    { t: 'mc', q: 'Eski bir rapor uygulamadan çıkarıldı. Bir hafta sonra geri eklendi. Kullanıcılar kişisel yer işaretlerinin kaybolduğunu söylüyor. Ne yaparsın?', o: ['Yedekten geri yüklerim', 'Geri gelmez; süreci düzeltirim', 'Uygulamayı çekip yeniden yayımlarım', 'Farklı tarayıcıda açmalarını öneririm'], a: 1, why: 'Learn: raporu çıkarıp uygulamayı güncellemek yer işareti ve yorumları siler, rapor geri eklense de geri gelmez. Yeniden yayımlamak kayıpları artırır. Ders: raporu çıkarmadan önce kullanıcıya haber ver, gerekiyorsa gizle.' },
    { t: 'mc', q: '500 kişilik bir kitleye uygulama dağıtılacak. Kişileri tek tek mi eklersin?', o: ['Evet, izlemesi kolay olur', 'Evet, grup desteklenmez', 'Hayır, grup tek giriş sayılır', 'Hayır, kitle 100 kişiyle sınırlı'], a: 2, why: 'Grup tek giriş sayılır; uygulama toplamı 10.000, kitle başına 1.000 giriş sınırına takılmazsın. İşe giren ve ayrılan da grupta yönetilir.' },
    { t: 'query', q: 'Kitle planını sına: <b>Kitle</b>, <b>Grup</b> sütunlu DATATABLE yaz (Satış 8, Finans 4, Yönetim 2). Çalışma alanında 3 kullanıcı var ve her kitlede sayılıyor. <code>ROW</code> ile <b>Toplam Giriş</b> döndür.', start: 'EVALUATE\n', sol: 'EVALUATE\nVAR K = DATATABLE("Kitle", STRING, "Grup", INTEGER, {{"Satış", 8}, {"Finans", 4}, {"Yönetim", 2}})\nRETURN ROW("Toplam Giriş", SUMX(K, [Grup] + 3))', hint: 'SUMX(K, [Grup] + 3): her kitle için grup sayısı ve çalışma alanı kullanıcıları.' }
  ]
});

/* ---------- Yorum ve iş birliği ---------- */
add('power-bi-apps', {
  id: 'yorum-isbirligi', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 20,
  title: 'Yorum ve iş birliği: rapor üzerinde konuşmak, Teams ve PowerPoint',
  sum: 'Rapora ve görsele yorum eklemek, @ ile bahsetmek, yorumun yakaladığı filtreler ve sınırlar; Teams sekmesi, sohbet, PowerPoint eklentisi; bir rapor gözden geçirme sürecini ekip olarak yürütmek.',
  body: `
<p>“Rapordaki Mart rakamı neden düştü?” sorusu genellikle Teams’te bir ekran görüntüsüyle başlar. Üç mesaj sonra kimse hangi filtrelerle bakıldığını bilmez. Power BI’da konuşmayı <b>verinin yanında</b> tutmanın yolları var; hangisinin ne zaman işe yaradığını bilmek ekibin zamanını kurtarır.</p>
<h2>Yorumlar</h2>
<p>Service’te rapor ya da panonun menü çubuğundaki <b>Yorum (Comment)</b> simgesi Yorumlar bölmesini açar. Yazar ve <b>Gönder</b> dersin.</p>
<ul><li><b>Sayfa ya da pano düzeyi:</b> menü çubuğundan.</li><li><b>Görsel düzeyi:</b> görselin üstüne gel, <b>Diğer seçenekler (…) → Yorum ekle</b>. Grafik simgesi yorumun bir görsele bağlı olduğunu gösterir.</li><li><b>@ ile bahsetme:</b> @ ve meslektaşın adı. Kişiye yorum bağlantısıyla e-posta ya da anında bildirim gider.</li><li><b>Yanıt:</b> aynı konuşma altında kalır.</li></ul>
<h3>Yorum filtreleri hatırlar</h3>
<p>Rapora yorum eklediğinde Power BI o anki filtre ve dilimleyici değerlerini <b>yer işareti olarak yakalar</b>. Yoruma tıklayan kişi o görünüme döner. Bu özelliğin ekran görüntüsüne üstünlüğü budur: “2024, Mobil, Ege” görünümünü anlatmana gerek kalmaz. Yer işareti yalnız <b>konuşmanın ilk yorumunda</b> yakalanır, yanıtlarda değil. Bu yüzden başka bir filtreyle konuşacaksan yeni konuşma aç.</p>
<h3>Sınırlar ve gereksinimler</h3>
<div class="tbl-wrap"><table><tr><th>Konu</th><th>Kural (Learn, Temmuz 2026 sürümü)</th></tr>
<tr><td>Lisans</td><td>Pro ya da PPU; içerik Premium ya da F64+ kapasitedeyse lisanssız da</td></tr>
<tr><td>Uzunluk</td><td>Yorum başına 2.000 karakter (@ ve boşluklar dahil)</td></tr>
<tr><td>Sayı</td><td>Pano ya da rapor başına 100 konuşma, konuşma başına 1.000 yorum</td></tr>
<tr><td>Sayfalandırılmış rapor</td><td>Yalnız genel yorum, tek görsele yorum yok</td></tr>
<tr><td>Kapatma</td><td>Rapor sahibi Dosya → Ayarlar’dan kapatabilir</td></tr>
<tr><td>Kuruluş uygulaması</td><td>Rapor araç çubuğunda yorum yok</td></tr>
<tr><td>Uygulamadan rapor çıkarmak</td><td>Yorumlar silinir, geri gelmez (“Power BI uygulamaları” dersi)</td></tr></table></div>
<p>Yorumu kimin silebileceği bu sayfada yazmıyor; gerekirse resmî belgeye ve kendi kiracına bak.</p>
<h2>Yorum neye yarar, neye yaramaz?</h2>
<div class="tbl-wrap"><table><tr><th>İhtiyaç</th><th>Kanal</th><th>Neden?</th></tr>
<tr><td>“Bu sapmayı açıklar mısın?” diye bir kişiye sormak</td><td>Görsel yorumu + @</td><td>Filtre korunur, bağlam rapordadır</td></tr>
<tr><td>Hatalı sayı bildirmek</td><td>Destek kanalı, iş kaydı</td><td>Yorum kaybolur; hata takibe alınmalı, kimin düzeltti belli olmalı</td></tr>
<tr><td>Rapor düzenleme önerisi, kabul testi</td><td>Çekme isteği ya da kayıt</td><td>Sürümle eşleşir; “Yaşam döngüsü” dersi</td></tr>
<tr><td>Ay sonu açıklaması tüm okuyucu görsün</td><td>Rapor içindeki metin ya da açıklama tablosu</td><td>Yorum bölmesi kapalı olabilir, PDF’e çıkmaz</td></tr>
<tr><td>Sayıyı ekipçe tartışmak</td><td>Teams kanalı ve rapor sekmesi</td><td>Toplantı ve karar aynı yerde</td></tr>
<tr><td>Satır düzeyinde veri yazmak</td><td>Yorum değil; Power Apps ya da translytical akış</td><td>Yorum veriyi değiştirmez (“Power Platform” dersi)</td></tr></table></div>
<p>Kötü yorum: “Bu sayılar yanlış.” İyi yorum: “@Mert 2024 Mart Mobil 42.100 görünüyor, ERP ekranında 39.800. Fark iadelerden mi? Cuma toplantısından önce lazım.” Sayı, kaynak, soru ve zaman yazılı.</p>
<h2>Microsoft Teams</h2>
<ul><li><b>Power BI sekmesi:</b> kanala ya da sohbete etkileşimli rapor gömer. Panolar sekmeye gömülemez.</li><li><b>Service’ten sohbet:</b> “Teams’te sohbet et” ile süzülmüş rapor görünümünü paylaşırsın.</li><li><b>Bağlantı önizlemesi:</b> rapor, pano ya da uygulama bağlantısı yapıştırınca önizleme çıkar; toplantı sohbetinde ve özel kanalda çalışmaz.</li><li><b>Etkinlik akışı:</b> @ bildirimleri ve uyarılar buraya düşebilir.</li></ul>
<div class="warn"><b>Bağlantı erişim vermez</b>Teams’e eklemek ya da link göndermek kimseye izin vermez. Kullanıcının raporda izni ve lisansı olmalı. En kolay yol: ekip raporlarını tek çalışma alanına koymak, erişimi ekibin Microsoft 365 grubuna vermek. Power BI uygulaması Teams yönetim merkezinde etkin olmalı.</div>
<h2>PowerPoint ve Excel</h2>
<p><b>Power BI eklentisi</b> ile PowerPoint slaytına canlı rapor sayfası eklenir; sunum sırasında filtre değiştirebilirsin. Görüntüleyenin yine rapor erişimi ve lisans koşulu gerekir, eklenti yönetici tarafından kısıtlanabilir. Durağan görüntü gerekiyorsa PDF ya da PowerPoint’e dışa aktarım vardır. Excel tarafı “Power BI ve Excel birlikte” dersinde.</p>
<h2>Ekipçe gözden geçirme akışı</h2>
<p>Yeni bir rapor yayımlanmadan önce paydaşla çalışmanın temiz bir yolu:</p>
<ol><li>Rapor Test çalışma alanında yayımlanır, gözden geçirene erişim verilir.</li><li>Gözden geçiren görsel yorumlarıyla notlarını bırakır; her konu ayrı konuşmadır.</li><li>Yazar kabul edilenleri kayda çevirir, Dev’de düzeltir.</li><li>Yorumlar kapanmadan üretime geçilmez; kabul listesi “Rapor kalitesi” dersindeki gibi yazılı tutulur.</li></ol>
<p>Yorumlar rapor sürümüne bağlı değildir: rapor değişse de eski yorum durur ve yanlış sayıyı gösteriyor olabilir. O yüzden yorumu <b>hangi tarihte hangi sayıya baktığını</b> yazarak bırak. Raporda filtre bağlamını gösteren küçük bir ölçü de işe yarar: ekran görüntüsü ve PDF yorumu kaybeder, ama kart kalır.</p>
<pre class="dax">Görünüm Etiketi =
"Yıl: " & IF(HASONEVALUE(Tarih[Yil]), VALUES(Tarih[Yil]), "Tümü")
    & " | Kanal: " & IF(HASONEVALUE(Satislar[Kanal]), VALUES(Satislar[Kanal]), "Tümü")</pre>
` + ORTAM + `Service’te bir raporu Pro ya da deneme lisansıyla aç, bir dilimleyici seç, görsele yorum ekle; dilimleyiciyi değiştir, yoruma tıkla, görünüme dönüşünü gör. İkinci bir kullanıcı yoksa @ bildirimini deneyemezsin; bu senaryoları alıştırmalarla çalış.</div>
`,
  ex: [
    { t: 'mc', q: 'Satış müdürü “Elektronik Mart’ta neden düştü?” diye sormak istiyor; Mobil kanal ve Ege seçili. Sorunun filtreyle birlikte kalması için en iyi yol?', o: ['Ekran görüntüsünü e-postayla atmak', 'Görsel yorumu ve @ ile bahsetmek', 'Raporu PDF olarak dışa aktarmak', 'Yeni bir rapor yer işareti eklemek'], a: 1, why: 'Yorum eklenince filtre ve dilimleyici değerleri yer işareti olarak yakalanır, @ kişiye bildirim gönderir. E-posta ve PDF bağlamı kaybeder. Rapor yer işareti herkese görünür ve yazar izni ister.' },
    { t: 'mc', q: 'Konuşmanın ilk yorumu 2023’e bakıyordu. Müdür 2024 filtresiyle yanıt yazdı ve yanıtına tıklayan görünümün değişmediğini fark etti. Neden?', o: ['Yanıtlar filtre yakalamaz', 'Sayfalandırılmış raporda yorum yok', 'Müdürün PPU lisansı yoktur', 'Konuşma 1.000 yoruma ulaşmıştır'], a: 0, why: 'Learn: yer işareti yalnız konuşmanın ilk yorumunda yakalanır. Farklı filtre için yeni konuşma açılır.' },
    { t: 'mc', q: 'Rapordaki bir sayının yanlış olduğu yorumla bildirildi, üç hafta kimse görmedi. Süreci nasıl düzeltirsin?', o: ['Herkese @ yazmasını söylemek', 'Yorumları kapatmak', 'Hataları kayıt kanalına almak', 'Rapora “yorum okuyun” kutusu koymak'], a: 2, why: 'Yorum tartışma içindir; sorumlu, öncelik, kapanış içermez. Hatalar iş kaydına girmeli. Yorum bağlam ve açıklama için kalır.' },
    { t: 'mc', q: 'Rapor sekmesi Teams kanalına eklendi. Ekipten birine “erişim” gerekiyor. Yönetici “sekmede zaten var” diyor. Doğrusu ne?', o: ['Doğru, sekme erişim verir', 'Sekme erişim vermez; izin gerekir', 'Sekme yalnız sahibine açılır', 'Teams konukları her zaman görür'], a: 1, why: 'Learn açık: gömme ya da link erişim vermez. Kullanıcının lisansı ve rapor izni olmalı; yoksa “İçerik kullanılamıyor” görür.' },
    { t: 'mc', q: 'Ay sonu kapanışında “Mart’ta iade rakamı düzeltildi” notunu tüm okuyucular görmeli, PDF dışa aktarımlarında da kalmalı. Nereye yazarsın?', o: ['Rapor yorumu', 'Teams kanalına', 'Kişisel yer işaretine', 'Rapor sayfasındaki metne'], a: 3, why: 'Yorum bölmesi herkese açık olmayabilir ve dışa aktarıma girmez. Kişisel yer işareti yalnız kişiye görünür. Sayfadaki metin ya da açıklama tablosu her kullanıcıya ve dışa aktarıma gider.' },
    { t: 'mc', q: 'Kuruluş uygulaması olarak dağıtılan raporda kullanıcılar yorum düğmesini bulamıyor. Doğru bilgi?', o: ['Lisansları yetersizdir', 'Sahip yorumları kapatmıştır', 'Org app’te bu düğme yok', 'Rapor sertifikalı olmalıdır'], a: 2, why: 'Learn, org app’te rapor araç çubuğundaki yorum gibi bazı yeteneklerin bulunmadığını belirtir. Yorum şartsa çalışma alanı uygulaması ya da raporu doğrudan açmak düşünülür.' },
    { t: 'dax', name: 'Yorum Görünüm Etiketi', q: '<b>Yorum Görünüm Etiketi</b>: Ekran görüntüsünde filtre kaybolmasın. Metin döndür: <code>"Yıl: "</code>, ardından tek yıl seçiliyse o yıl, değilse <code>"Tümü"</code>. <code>HASONEVALUE</code> ve <code>VALUES</code> kullan.', sol: '"Yıl: " & IF(HASONEVALUE(Tarih[Yil]), VALUES(Tarih[Yil]), "Tümü")', hint: 'IF(HASONEVALUE(Tarih[Yil]), VALUES(Tarih[Yil]), "Tümü") ve önüne "Yıl: " &', grid: [{ t: 'Tarih', c: 'Yil' }] }
  ]
});

/* ---------- Veri yenileme ---------- */
add('yorum-isbirligi', {
  id: 'veri-yenileme', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 30,
  title: 'Veri yenileme: türler, zamanlama, sınırlar ve hata teşhisi',
  sum: 'Yenilemenin altı türü ve depolama moduna göre hangisinin geçerli olduğu; zamanlama, lisans sınırları, zamanlamanın neden kendiliğinden kapandığı; yenileme geçmişini okumak ve tazelik ölçüleri.',
  body: `
<p>Sabah 09:00. Genel müdür dünkü satışı soruyor, rapor üç gün öncesini gösteriyor. Yenileme “başarılı”, kimse e-posta almadı. Sorun nerede? Power BI’da <b>tek bir yenileme yoktur</b>; altı farklı şey aynı adla anılır. Doğru teşhis önce hangisinden söz ettiğini ayırmakla başlar.</p>
<h2>Yenilemenin türleri</h2>
<div class="tbl-wrap"><table><tr><th>Tür</th><th>Ne yapar?</th><th>Dikkat</th></tr>
<tr><td><b>Veri yenileme</b></td><td>Kaynaktan veriyi Import modele alır</td><td>DirectQuery ve canlı bağlantıda yoktur</td></tr>
<tr><td><b>OneDrive yenilemesi</b></td><td>.pbix, .xlsx, .csv dosyasıyla eşitler; yaklaşık saatte bir</td><td>Asıl kaynaktan veri çekmez</td></tr>
<tr><td><b>Sorgu önbelleği</b></td><td>Kapasitede sorgu sonuçlarını saklar</td><td>Her veri yenilemesi geçersiz kılar</td></tr>
<tr><td><b>Kutucuk yenileme</b></td><td>Pano kutucuklarını günceller</td><td>Import’ta veriyle birlikte; DirectQuery’de yaklaşık saatte bir</td></tr>
<tr><td><b>Görsel yenileme</b></td><td>Rapor görsellerini yeniden sorgular</td><td>Canlı bağlantı için geçerlidir</td></tr>
<tr><td><b>Şema yenileme</b></td><td>Sütun ekleme, silme, ad değişikliğini alır</td><td>Import, DirectQuery ve Direct Lake’te</td></tr></table></div>
<div class="tbl-wrap"><table><tr><th>Mod</th><th>Veri yenileme</th><th>“Güncel” ne demek?</th></tr>
<tr><td>Import</td><td>Zamanlanmış, isteğe bağlı</td><td>Son yenileme anı</td></tr>
<tr><td>DirectQuery</td><td>Yok</td><td>Sorgu anı; kutucuklar saatlik</td></tr>
<tr><td>Canlı bağlantı</td><td>Yok</td><td>Kaynak modelin tazeliği</td></tr>
<tr><td>Direct Lake</td><td>Çerçeveleme (framing)</td><td>Delta’nın işaret edilen sürümü; “Fabric’te anlam modeli” dersi</td></tr></table></div>
<h2>Yenileme yolları</h2>
<ul><li><b>Zamanlanmış:</b> anlam modeli ayarları → Yenileme → Yenilemeyi zamanla. Saat dilimini bilinçli seç.</li><li><b>Şimdi yenile:</b> elle, isteğe bağlı.</li><li><b>Power Automate:</b> olaya bağlı (dosya geldi, onay verildi).</li><li><b>REST API, XMLA:</b> tablo düzeyinde, bölüm düzeyinde, kapasitede geniş denetim.</li><li><b>İşlem hattı:</b> Fabric’te veri hazır olunca (“İşlem hatları” dersi).</li></ul>
<h2>Sınırlar</h2>
<div class="tbl-wrap"><table><tr><th></th><th>Pro (paylaşılan)</th><th>PPU, Premium, Fabric</th></tr>
<tr><td>Zamanlanmış yenileme</td><td>Günde 8</td><td>Günde 48</td></tr>
<tr><td>API ile tetikleme</td><td>8’e dahil</td><td>Sabit sayı yok; kapasiteye bağlı, kuyruğa girebilir</td></tr>
<tr><td>Şimdi yenile</td><td>8’e dahil değil</td><td>Kapasiteye bağlı</td></tr>
<tr><td>Süre</td><td>2 saat</td><td>5 saat (XMLA ile aşılabilir)</td></tr>
<tr><td>Başlama</td><td colspan="2">Seçilen saatten en fazla 5 dk önce, hedef 15 dk içinde; kaynak azsa 1 saate kadar gecikebilir</td></tr></table></div>
<p>Tam yenileme bellekte modelin yaklaşık iki katını ister, çünkü sorgulara hizmet için eski kopya durur. 1 GB’ı aşan ya da saatler süren modelde “Büyük modeller” dersindeki artımlı yenilemeyi düşün. Günde 48 slotunu doldurmak iyi bir hedef değildir: veri sık değişiyor ve kaynak dayanıyorsa DirectQuery daha doğru olabilir.</p>
<h2>Zamanlama neden kendiliğinden kapanır?</h2>
<div class="tbl-wrap"><table><tr><th>Olay</th><th>Sonuç</th><th>Ne yapılır?</th></tr>
<tr><td><b>Art arda 4 hata</b> ya da süresi dolmuş kimlik bilgisi</td><td>Zamanlama kapanır</td><td>Kök nedeni çöz, zamanlamayı yeniden aç. Eşik değiştirilemez.</td></tr>
<tr><td><b>2 ay görüntülenmeme</b></td><td>Zamanlama duraklar, sahibe e-posta gider</td><td>Raporu aç ya da Şimdi yenile</td></tr></table></div>
<p>Hata e-postasını kişisel kutuya değil ekip listesine yönlendir; biri izne çıktığında rapor sessizce eskir.</p>
<h2>Yenileme geçmişini okumak</h2>
<p>Anlam modeli ayarları → <b>Yenileme geçmişi</b>. Tür, başlangıç, bitiş, durum ve hata iletisi burada. Teşhis sırası:</p>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Kök neden</th><th>Çözüm</th></tr>
<tr><td>Kimlik bilgileri geçersiz</td><td>Parola değişti, OAuth süresi doldu</td><td>Veri kaynağı kimlik bilgilerini güncelle, zamanlamayı aç</td></tr>
<tr><td>Veri kaynağı tanımlı değil, ağ geçidi çevrim dışı</td><td>Bağlantı eşleşmemiş, makine kapalı</td><td>“On-premises data gateway” dersi</td></tr>
<tr><td>Sütun bulunamadı</td><td>Kaynak şeması değişti</td><td>Power Query adımını düzelt, yeniden yayımla</td></tr>
<tr><td>Zaman aşımı</td><td>Model büyük, katlama yok</td><td>Sütun azalt, katlamayı koru, artımlı yenileme</td></tr>
<tr><td>Bellek hatası</td><td>Kapasite dolu, eşzamanlı yenileme</td><td>Saatleri yay, gereksiz sütun çıkar</td></tr>
<tr><td>Başlangıç gecikiyor</td><td>Kapasite yük altında</td><td>Saatleri kaydır, “Kullanım ve izleme” dersi</td></tr>
<tr><td>“Başarılı” ama eski veri</td><td>Üst adım bitmeden çalıştı ya da kaynak eski</td><td>Olaya bağlı zincir, tazelik göstergesi</td></tr></table></div>
<p>En tehlikelisi son satırdır: yenileme başarılıdır ve veri yine eskidir. “Son yenileme” zaman damgası yanlış güven verir. Doğru sinyal, <b>olgu tablosundaki en son iş tarihidir</b>:</p>
<pre class="dax">Veri Gecikmesi (gün) =
DATEDIFF(CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS()), DATE(2024, 12, 31), DAY)</pre>
<p>Uygulama verisi 2024 sonunda bittiği için referans tarih sabit; gerçek modelde <code>TODAY()</code> yazılır. <b>Eşiği sıfır yapma.</b> Gece yenilenen modelde en son iş tarihi dündür: fark her sabah 1 çıkar, kart hep kırmızı kalır ve sürekli yanan alarma kimse bakmaz. Kabul edilen gecikmeyi işin sahibiyle konuş. Her gün satış olan ve günlük yenilenen modelde fark 1’den büyükse kırmızıya çevir. Hafta sonu satış yoksa Pazartesi farkı 3 olur: eşiği buna göre ver ya da iş günü takvimiyle say. Az satan kategoride daha geniş eşik gerekir; “Bayat Rapor” vakasında 7 gün kullanılıyor.</p>
<pre class="dax">Tazelik Rengi =
VAR Gecikme = DATEDIFF(CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS()), DATE(2024, 12, 31), DAY)
RETURN IF(Gecikme &gt; 1, "#C0392B", "#2E7D32")</pre>
<h2>Geçmişi sayıya çevirmek</h2>
<p>Yenileme geçmişi REST API ile alınabilir, bir tabloya yazılabilir. Elde edince “hangi model kaç kez düştü?” bir DAX sorgusu olur:</p>
<pre class="dax">EVALUATE
VAR Gecmis =
    DATATABLE("Model", STRING, "Durum", STRING, "Dakika", INTEGER, {
        {"Satış", "Başarılı", 12}, {"Satış", "Başarılı", 14}, {"Satış", "Hata", 2},
        {"Stok", "Başarılı", 41}, {"Stok", "Hata", 120}, {"Stok", "Hata", 120}
    })
RETURN
    GROUPBY(Gecmis, [Model], "Hata", SUMX(CURRENTGROUP(), IF([Durum] = "Hata", 1)), "Süre", SUMX(CURRENTGROUP(), [Dakika]))</pre>
<p>Pro’da 120 dakikayı gören Stok modeli büyük olasılıkla süre sınırına çarpıyor. Bu tablo gerçek değil, sorgunun kalıbını göstermek için yazıldı.</p>
<div class="note"><b>Kontrol listesi</b>Hangi tür yenilemeden söz edildiği belli mi? · Kimlik bilgisi kişiye değil, kurumsal hesaba mı bağlı? · Hata bildirimi ekip listesine gidiyor mu? · Saatler zirve dışına yayıldı mı? · Yenileme sırası (veri akışı → model) olaya mı bağlı? · Raporda iş tarihi gösteren tazelik kartı var mı? · Gizlilik düzeyi Service’te yeniden verildi mi?</div>
`,
  ex: [
    { t: 'mc', q: 'OneDrive’daki .pbix’e bağlı rapor saatte bir “yenileniyor”, ama satışlar SQL’de değişmesine rağmen eski. Neden?', o: ['Kaynaktan veri çekmez', 'SQL ağ geçidi bozulmuştur', 'Saatlik sınır aşılmıştır', 'Rapor DirectQuery’dedir'], a: 0, why: 'OneDrive yenilemesi modeli dosyayla eşitler; asıl kaynağa gitmez. Dosya içindeki veri eskiyse model de eski kalır. Veri yenilemesi ayrıca zamanlanmalı.' },
    { t: 'mc', q: 'DirectQuery modeline bağlı panoda kutucuklar 40 dakika eski görünüyor. Ne bekliyordun?', o: ['Kutucuklar her tıklamada canlıdır', 'Kutucuklar saatlik yenilenir', 'DirectQuery kutucuğu desteklenmez', 'Günde 8 yenileme sınırına girer'], a: 1, why: 'DirectQuery’de rapor görselleri sorgu anındadır, pano kutucukları ise önbellekten gelir ve yaklaşık saatte bir yenilenir. Bunu bilmeyen kullanıcı “rakam tutmuyor” der.' },
    { t: 'mc', q: 'Pro çalışma alanında model her saat elle “Şimdi yenile”yle yenileniyor, zamanlama 8 slotta dolu. Bir analist API ile 9. yenilemeyi tetiklemek istiyor. Olur mu?', o: ['Olur; API sınırsızdır', 'Olur; ama yalnız mesai dışında', 'Olmaz; API de günlük 8’e girer', 'Olmaz; API yalnız Fabric’te vardır'], a: 2, why: 'Learn: paylaşılan kapasitede günlük sınır zamanlanmış ve API yenilemelerini kapsar. Arayüzdeki Şimdi yenile bu sayıya girmez. Kapasitede API için sabit sayı yoktur.' },
    { t: 'mc', q: 'Zamanlama bir sabah kapalı bulundu. Geçmişte dört kırmızı satır, “kimlik bilgileri geçersiz”. Doğru sıra?', o: ['Zamanlamayı aç → kimliği güncelle → bekle', 'Modeli yeniden yayımla → zamanlamayı aç', 'Kimliği güncelle → yenile → zamanlamayı aç', 'Ağ geçidini yeniden kur → zamanlamayı aç'], a: 2, why: 'Önce kök neden: kimlik bilgisi. Elle yenilemeyle çalıştığını gör, sonra zamanlamayı aç. Aksi hâlde yeniden hata alıp kapanır. Eşik dört hatadır, değiştirilemez.' },
    { t: 'mc', q: 'Veri akışı 02:00, model 03:00. Geçmiş iki aydır “Başarılı”, ama pazartesileri rakamlar bir gün eski. Kök neden büyük olasılıkla?', o: ['Veri akışı zamanında bitmiyor', 'Pro lisansının süresi doluyor', 'Tarih tablosu eksik kalmış', 'RLS rolü hafta başı satır gizliyor'], a: 0, why: 'Hafta sonu verisiyle veri akışı uzuyor, model eski veriyi alıyor ve başarılı dönüyor. Saate dayalı zincir kırılgandır. Çözüm olaya bağlı zincir ve iş tarihini gösteren kart.' },
    { t: 'mc', q: 'Yalnız Pro’da olan 800 MB’lık Import model yenilemede 2 saati aşıyor. Önce hangisini denersin?', o: ['Sütun azalt, katlamaya bak', 'Modeli ikiye bölüp iki zamanlama kur', 'Kapasite satın al', 'Günde 8 kez yenilemeyi dene'], a: 0, why: 'Kapasiteye para harcamadan önce modeli küçült, sorgunun kaynağa katlanıp katlanmadığına bak, sonra artımlı yenilemeyi değerlendir. Modeli bölmek ölçüleri de böler.' },
    { t: 'dax', name: 'Gecikmeli Veri Uyarısı', q: '<b>Gecikmeli Veri Uyarısı</b>: Görünen satırlardaki en son satış tarihi 31.12.2024’ten kaç gün geride? Fark 3 günden büyükse farkı, değilse BLANK döndür. Kartta yalnız sorun varken sayı görünsün.', sol: 'VAR Fark = DATEDIFF(MAX(Satislar[Tarih]), DATE(2024, 12, 31), DAY)\nRETURN IF(Fark > 3, Fark)', hint: 'VAR Fark = DATEDIFF(MAX(Satislar[Tarih]), DATE(2024, 12, 31), DAY), sonra IF(Fark > 3, Fark).', grid: [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Urunler', c: 'Urun' }], noTotal: true },
    { t: 'query', q: 'Yenileme günlüğünü özetle. <b>Model</b>, <b>Durum</b> sütunlu DATATABLE yaz: Satış-Başarılı, Satış-Hata, Stok-Hata, Stok-Hata, Kargo-Başarılı. Model başına hata sayısını <b>Hata</b> adıyla döndür. Hatası olmayan modelde boş kalabilir.', start: 'EVALUATE\n', sol: 'EVALUATE\nVAR G = DATATABLE("Model", STRING, "Durum", STRING, {{"Satış", "Başarılı"}, {"Satış", "Hata"}, {"Stok", "Hata"}, {"Stok", "Hata"}, {"Kargo", "Başarılı"}})\nRETURN GROUPBY(G, [Model], "Hata", SUMX(CURRENTGROUP(), IF([Durum] = "Hata", 1)))', hint: 'GROUPBY(G, [Model], "Hata", SUMX(CURRENTGROUP(), IF([Durum] = "Hata", 1)))' },
    { t: 'mc', q: 'Model her gece yenileniyor, her gün satış var. Tazelik kartı <code>TODAY()</code> ile farkı ölçüyor, kural “sıfırdan büyükse kırmızı”. Kart her sabah kırmızı. Ne yaparsın?', o: ['Yenilemeyi gece yarısına almak', 'Kabul edilen eşiği 1 gün yapmak', 'Kartı rapordan kaldırmak', 'Yenilemeyi saatlik yapmak'], a: 1, why: 'Gece yenilenen modelde son iş tarihi dündür, fark normalde 1’dir. Eşik işle konuşulur; 1’den büyükse gerçek sorun vardır. Saati kaydırmak ya da sıklığı artırmak dünün satırlarının bugünün tarihine geçmesini sağlamaz.' }
  ]
});

/* ---------- Ağ geçidi ---------- */
add('veri-yenileme', {
  id: 'gateway', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 30,
  title: 'On-premises data gateway: ne zaman gerekir, nasıl kurulur, nasıl teşhis edilir',
  sum: 'Standart, kişisel ve sanal ağ (VNet) ağ geçidi arasında seçim; kurulum şartları, kurtarma anahtarı, küme, bağlantı ve roller; Fabric’te kullanım ve hata teşhisi.',
  body: `
<p>Service bulutta, Anadolu Market’in SQL Server’ı ise şirket içinde bir sunucuda. Service oraya internetten ulaşamaz. <b>Ağ geçidi (on-premises data gateway)</b>, şirket ağında bir bilgisayara kurulan köprü yazılımıdır: buluttan gelen sorguyu alır, yerel kaynağa gider, sonucu geri gönderir. Giden bağlantı kullanır; bu yüzden gelen port açılmaz.</p>
<h2>Gerekir mi?</h2>
<div class="tbl-wrap"><table><tr><th>Kaynak</th><th>Ağ geçidi</th></tr>
<tr><td>Şirket içi SQL Server, Oracle, ağ klasörü</td><td>Gerekir</td></tr>
<tr><td>Şirket içi Analysis Services canlı bağlantı</td><td>Gerekir (standart)</td></tr>
<tr><td>Azure SQL, SharePoint Online, OneDrive, Fabric</td><td>Genelde gerekmez</td></tr>
<tr><td>Özel ağdaki (VNet, özel uç nokta) Azure kaynağı</td><td>VNet veri ağ geçidi</td></tr>
<tr><td>Aynı sorguda şirket içi ve bulut</td><td>Gerekir; bulut da ağ geçidinden geçer</td></tr>
<tr><td>Bilgisayarındaki yerel Excel</td><td>Kişisel mod ile olur, ama dosyayı SharePoint’e taşımak daha iyidir</td></tr></table></div>
<h2>Üç tür</h2>
<div class="tbl-wrap"><table><tr><th></th><th>Standart</th><th>Kişisel</th><th>VNet</th></tr>
<tr><td>Kim kullanır?</td><td>Çok kullanıcı, merkezî bağlantı</td><td>Tek kişi</td><td>Çok kullanıcı</td></tr>
<tr><td>Kurulum</td><td>Sürekli açık sunucu</td><td>Kullanıcı bilgisayarı</td><td>Microsoft yönetir, kurulum yok</td></tr>
<tr><td>DirectQuery, canlı bağlantı</td><td>Var</td><td>Yok; Import yenileme</td><td>Desteklenen kaynaklarda</td></tr>
<tr><td>Fabric öğeleri (işlem hattı, Dataflow Gen2)</td><td>Var</td><td>Yok</td><td>Desteklenenlerde</td></tr>
<tr><td>Yüksek erişilebilirlik</td><td>Küme</td><td>Yok</td><td>Sabit yapılandırma</td></tr>
<tr><td>Gereksinim</td><td>Pro yeterli</td><td>Pro yeterli</td><td>Fabric ya da Premium kapasite, ek ücret</td></tr></table></div>
<p>Learn kişisel moddan <b>mümkünse kaçınmayı</b> önerir: kullanıcının bilgisayarı kapanınca yenileme durur ve yönetilmesi zordur. Kısıtlamak için ağ geçidi kiracı ilkesi vardır. Bir bilgisayarda en çok bir standart ve bir kişisel kurulum olur.</p>
<h2>Kurulum şartları</h2>
<ul><li>64 bit Windows Server 2019, 2022 ya da 2025 önerilir; 8 çekirdek, 8 GB bellek, biriktirme için SSD. En düşük şart: Windows 10 ya da 11, .NET Framework 4.8.</li><li>Etki alanı denetleyicisi, Server Core ve Windows kapsayıcısına kurulmaz.</li><li>Dizüstü bilgisayar ya da uyuyan makine olmaz; kablolu ağ yeğlenir.</li><li>Kuran kişi makinede yönetici olmalı, iş hesabıyla oturum açmalı.</li><li>Aynı veri merkezine, kaynağa yakın kurmak gecikmeyi azaltır.</li></ul>
<h3>Kurtarma anahtarı</h3>
<p>Kurulum sırasında verdiğin <b>kurtarma anahtarı</b>, ağ geçidini taşımak ya da kümeye makine eklemek için gerekir. Microsoft geri getiremez. Parola kasasına koy; kişinin not defterinde olmasın. Ağ geçidi yöneticisi şirketten ayrıldığında anahtar da gittiyse gerçek sorun yaşarsın.</p>
<h3>Küme (cluster)</h3>
<p>Üretim için Learn küme kullanmayı güçlü biçimde önerir: birincil düğüm düşerse istek sıradakine gider, yük paylaşılır, güncelleme tek tek yapılır. İkinci kurulumda <b>Var olan bir ağ geçidi kümesine ekle</b> seçilir ve birincinin kurtarma anahtarı girilir. Üyeler aynı sürümde olmalı, çevrim dışı üye kaldırılmalı. Üretim ve test için ayrı küme kur.</p>
<h2>Bağlantı ve roller</h2>
<p>Yazılımı kurmak yetmez. Service’te <b>Ayarlar → Bağlantıları ve ağ geçitlerini yönet</b> ekranında kaynak için bağlantı oluşturursun: sunucu, veritabanı, kimlik bilgisi, gizlilik düzeyi. Sonra anlam modeli ayarlarında <b>Ağ geçidi ve bulut bağlantıları</b> altında bu bağlantıyla eşlersin.</p>
<div class="tbl-wrap"><table><tr><th>Rol</th><th>Ne yapar?</th></tr>
<tr><td>Ağ geçidi: Yönetici</td><td>Ağ geçidini ve üyeleri yönetir</td></tr>
<tr><td>Ağ geçidi: Bağlantı oluşturucu (paylaşımlı ya da paylaşımsız)</td><td>Bağlantı oluşturur</td></tr>
<tr><td>Bağlantı: Sahip, Paylaşabilen kullanıcı, Kullanıcı</td><td>Bağlantıyı kullanır, paylaşır</td></tr></table></div>
<p>Dikkat: çalışma alanında Yönetici olmak ağ geçidi izni vermez. Yenilemeyi zamanlamak için bağlantının kullanıcı listesinde olman gerekir. Tek kurumsal hesapla bağlantı kurmak, herkesin o kimlikle sorgu göndermesi demektir; kaynak sistemde kullanıcıya göre güvenlik gerekiyorsa Entra SSO (DirectQuery) düşünülür.</p>
<div class="warn"><b>Sık unutulan ayar</b>Desktop’taki gizlilik düzeylerine ağ geçidi uymaz; bağlantıda ayrıca ver. Bir model tek ağ geçidi bağlantısı kullanır; aynı sorgudaki bulut kaynağını da ağ geçidinde tanımla.</div>
<h2>Bakım</h2>
<ul><li>Her ay yeni sürüm çıkar; yalnız son altı sürüm desteklenir. Önce test kümesinde dene, sonra üretimde düğüm düğüm güncelle. Geri alma yoktur, öncesinde makine görüntüsü al.</li><li>Günlükleri ve Windows performans sayaçlarını izle. Yavaşlıkta biriktirme yerine akış, antivirüs dışlaması değerlendirilir.</li><li>Parola değişimi takvimini bağlantılarla eşle.</li></ul>
<h2>Fabric’te ağ geçidi</h2>
<p>Dataflow Gen2, işlem hattı ve Copy job aynı standart ağ geçidini kullanır. Fark:</p>
<ul><li>İşlem hatları için sürüm <b>3000.214.2 ya da sonrası</b> gerekir, güvenlik duvarında <code>*.frontend.clouddatahub.net</code> çıkışı açılmalı.</li><li>Dataflow Gen2 lakehouse’a yazarken 443 yetmeyebilir: ara depodan (staging) okuma SQL analiz uç noktasına <b>TCP 1433</b> kullanır. Yenileme tablosu “Başarılı” derken <code>WriteToDatabaseTableFrom_...</code> etkinliği “Başarısız” görünebilir.</li><li>Direct Lake yalnız bulut bağlantısı kullanır, ağ geçidi kullanmaz.</li><li>Özel bağlantı (private link) açıksa şirket içi ağ geçidi desteklenmez; VNet ağ geçidi gerekir.</li></ul>
<h2>Teşhis</h2>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Kontrol</th></tr>
<tr><td>“Ağ geçidi çevrim dışı”</td><td>Makine açık mı, servis çalışıyor mu, küme üyesi var mı?</td></tr>
<tr><td>“Veri kaynağı tanımlı değil”</td><td>Bağlantı adı, sunucu ve veritabanı .pbix’teki ile harfi harfine aynı mı? Bulut kaynağı da tanımlı mı?</td></tr>
<tr><td>Kullanıcı bağlantıyı listede görmüyor</td><td>Bağlantı kullanıcı listesine eklenmemiş</td></tr>
<tr><td>Yenileme başlıyor, sorgu zaman aşımı</td><td>Kaynak yavaş, CPU dolu; Import ve DirectQuery için ayrı küme</td></tr>
<tr><td>Kimlik doğrulama hatası (Windows)</td><td>Makine kaynakla aynı etki alanında mı, servis hesabı yetkili mi?</td></tr>
<tr><td>Eski sürüm uyarısı, Fabric bağlantısı olmuyor</td><td>Sürüm ve <code>*.frontend.clouddatahub.net</code> çıkışı</td></tr></table></div>
<p>Ağ geçidi günlüğünden hangi düğümün sorun çıkardığını bulmak bir sorgudur. Örnek bir günlük tablosu üzerinde:</p>
<pre class="dax">EVALUATE
VAR Gunluk =
    DATATABLE("Dugum", STRING, "Durum", STRING, {
        {"GW-01", "Tamam"}, {"GW-01", "Tamam"}, {"GW-02", "Hata"}, {"GW-02", "Hata"}, {"GW-02", "Tamam"}
    })
RETURN
    GROUPBY(Gunluk, [Dugum], "Hata", SUMX(CURRENTGROUP(), IF([Durum] = "Hata", 1)))</pre>
` + ORTAM + `Windows bir bilgisayara standart ya da kişisel ağ geçidi kurmak için ücretsiz yazılımı indirmen yeter, ama kaydetmek için iş hesabı ve Service’i kullanmak için Pro ya da deneme lisansı gerekir. Şirket sunucusunda yönetici izni olmadan deneme; kendi bilgisayarında kişisel modda küçük bir Excel ile yenileme kurup Service’te izleyebilirsin. Üretimde kişisel mod önerilmez.</div>
`,
  ex: [
    { t: 'mc', q: 'Stajyer ağ geçidini kendi dizüstü bilgisayarına kurup üretim modelini ona bağladı. Hafta sonu rapor yenilenmedi. Ne önerirsin?', o: ['Dizüstünü hafta sonu açık bırakmasını', 'Sürekli açık sunucuda standart mod', 'Yenilemeyi hafta içine almasını', 'VNet ağ geçidi kurmasını'], a: 1, why: 'Learn uyuyan ya da kapanan makineyi önermez. Üretimde sürekli açık sunucuda standart mod, kritik iş için küme kullanılır. VNet ağ geçidi özel ağ kaynakları içindir, şirket içi SQL için değil.' },
    { t: 'mc', q: 'Şirket içi Analysis Services’e canlı bağlanan bir rapor yayımlanacak. Hangi tür?', o: ['Kişisel mod', 'Ağ geçidi gerekmez', 'Standart mod', 'İkisi birlikte'], a: 2, why: 'Canlı bağlantı ve DirectQuery kişisel modda yoktur. Şirket içi kaynak için ağ geçidi de şarttır. Bu yüzden standart mod.' },
    { t: 'mc', q: 'Eski BI yöneticisi ayrıldı. İkinci düğüm eklenmek isteniyor, ama kimse kurtarma anahtarını bilmiyor. Microsoft desteği ne yapabilir?', o: ['Anahtarı kiracı yöneticisine verir', 'Faturadan doğrulayıp sıfırlar', 'Geri getiremez; yeniden planlanır', 'Azure portaldan indirilir'], a: 2, why: 'Learn: Microsoft kurtarma anahtarını geri getiremez. Ağ geçidi sürekli çalışıyorsa düğüm durur ama anahtar olmadan küme büyütülemez. Yeni ağ geçidi kurup bağlantıları taşımak gerekebilir. Ders: anahtar kurumsal kasada durur.' },
    { t: 'mc', q: 'Çalışma alanında Yönetici olan analist yenilemeyi zamanlıyor, ama ağ geçidi bağlantısını listede göremiyor. Sebep?', o: ['Çalışma alanı F64 altında', 'Modelde RLS var', 'Zamanlama kapalı', 'Bağlantıda kullanıcı değil'], a: 3, why: 'Ağ geçidi izinleri çalışma alanı rollerinden bağımsızdır. Bağlantı sahibinden kullanıcı olarak eklenmen gerekir.' },
    { t: 'mc', q: 'Üretim küme güncellemesi için doğru sıra hangisi?', o: ['Test → görüntü al → düğüm düğüm', 'Tüm düğümler aynı anda → test', 'Kurtarma anahtarı değiştir → güncelle', 'Kapat → yeni küme aç → bağlantı sil'], a: 0, why: 'Learn test kümesinde denemeyi, geri alma olmadığı için görüntü almayı, düğümleri tek tek düşük kullanım saatinde güncellemeyi önerir. Aynı anda güncellemek kümenin faydasını yok eder.' },
    { t: 'mc', q: 'Dataflow Gen2 ağ geçidiyle şirket içi kaynaktan lakehouse’a yazıyor. Yenileme satırı “Başarılı”, ama yazma etkinliği 10013 ile başarısız: “erişim izni engellendi”. Önce neye bakarsın?', o: ['Kapasite boyutuna', 'TCP 1433 çıkışına', 'Lakehouse şemasına', 'Kurtarma anahtarına'], a: 1, why: 'Learn bu belirtiyi tanımlar: ara depodan okuma SQL analiz uç noktasına TDS 1433 ile gider, proxy ya da güvenlik duvarı engellerse yazma başarısız görünür. Alternatif: staging ve fast copy kapatmak, sorguları yeniden düzenlemek.' },
    { t: 'mc', q: 'Kurum özel bağlantıyı (private link) açtı. Ağ geçidi kaydı hata veriyor. Doğru yorum?', o: ['Ağ geçidi sürümü çok yeni', 'Desteklenmez; VNet kullan', 'Küme üye sayısı yetmiyor', 'Windows 11’e kurulamaz'], a: 1, why: 'Learn: şirket içi ağ geçitlerinde özel bağlantı desteklenmez, bu durumda VNet veri ağ geçidi önerilir.' },
    { t: 'mc', q: 'Bir çalışan masaüstündeki Excel’i Service’te yenilemek için kişisel ağ geçidi istiyor. Daha iyi öneri?', o: ['Dosyayı SharePoint’e taşımak', 'Standart küme kurmak', 'Raporu Web’de yayımlamak', 'Excel’i CSV’ye çevirmek'], a: 0, why: 'Dosya buluta taşınınca ağ geçidi gereksinimi kalkar; Learn de kişisel moda alternatif olarak bunu verir. Tek dosya için küme aşırıdır. CSV’ye çevirmek yerini değiştirmez.' },
    { t: 'query', q: 'Ağ geçidi günlüğünü oku. <b>Dugum</b>, <b>Durum</b> sütunlu DATATABLE yaz: GW-01 Tamam, GW-01 Hata, GW-02 Hata, GW-02 Hata, GW-03 Tamam. Düğüm başına hata sayısını <b>Hata</b> adıyla döndür.', start: 'EVALUATE\n', sol: 'EVALUATE\nVAR G = DATATABLE("Dugum", STRING, "Durum", STRING, {{"GW-01", "Tamam"}, {"GW-01", "Hata"}, {"GW-02", "Hata"}, {"GW-02", "Hata"}, {"GW-03", "Tamam"}})\nRETURN GROUPBY(G, [Dugum], "Hata", SUMX(CURRENTGROUP(), IF([Durum] = "Hata", 1)))', hint: 'GROUPBY(G, [Dugum], "Hata", SUMX(CURRENTGROUP(), IF([Durum] = "Hata", 1)))' }
  ]
});

/* ---------- Kullanım ve izleme ---------- */
add('gateway', {
  id: 'kullanim-izleme', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 28,
  title: 'Kullanım ve izleme: kim açıyor, ne yavaş, kapasite nereye gidiyor?',
  sum: 'Kullanım ölçümleri, etkinlik günlüğü, Monitor hub, Capacity Metrics, çalışma alanı izleme ve Performans Analizi: hangi soruyu hangi araç cevaplar; sınırlar ve kullanım verisiyle karar vermek.',
  body: `
<p>Altı aydır her ay güncellenen rapora emek veriyorsun. Kaç kişi açıyor? Sen bilmiyorsan “rapor başarılı” demek cesaret ister. Bu ders üç soruyu cevaplar: <b>kim kullanıyor, ne yavaş, kapasite nereye gidiyor?</b> Benimseme planı ve kültür tarafı “Power BI ortamını yönetmek” dersinde; burada araçları ve kararları işliyoruz.</p>
<h2>Hangi soru, hangi araç?</h2>
<div class="tbl-wrap"><table><tr><th>Soru</th><th>Araç</th><th>Kim?</th><th>Sınır</th></tr>
<tr><td>Bu raporu kim, ne sıklıkla açıyor?</td><td><b>Kullanım ölçümleri raporu</b></td><td>Yönetici, Üye, Katkıda bulunan; Pro ya da PPU</td><td>Son 30 gün, önizleme</td></tr>
<tr><td>Kiracıda kim neyi yaptı, 6 ay önce kim dışa aktardı?</td><td><b>Etkinlik günlüğü, denetim</b></td><td>Fabric yöneticisi, uyumluluk</td><td>Kendi depona biriktir</td></tr>
<tr><td>Bu gece hangi iş düştü?</td><td><b>Monitor hub</b></td><td>Fabric kullanıcıları; yalnız görme izni olan öğeler</td><td>Learn’de önizleme etiketli sayfa</td></tr>
<tr><td>Yenileme neden düştü?</td><td><b>Yenileme geçmişi</b></td><td>Model erişimi olan</td><td>“Veri yenileme” dersi</td></tr>
<tr><td>Kapasite neden kısıtlıyor?</td><td><b>Fabric Capacity Metrics uygulaması</b></td><td>Kapasite yöneticisi</td><td>İşlem 14, depolama 30 gün görünüm</td></tr>
<tr><td>Bu görsel neden yavaş?</td><td><b>Performans Analizi</b></td><td>Yazar, Desktop’ta</td><td>Service koşulları farklıdır</td></tr>
<tr><td>Modele hangi sorgular geliyor?</td><td><b>Çalışma alanı izleme</b></td><td>Sorgu için en az Katkıda bulunan</td><td>Önizleme; varsayılan 30 gün, kapasite tüketir</td></tr></table></div>
<h2>Kullanım ölçümleri raporu</h2>
<p>Çalışma alanında raporun <b>Diğer seçenekler (…) → Kullanım ölçümleri raporunu görüntüle</b>. Görüntüleyici rolü yetmez. Yöneticinin “içerik oluşturucular için kullanım ölçümleri” ayarı açık olmalı. Çalışma alanım’da ve Azure Private Link arkasında çalışmaz.</p>
<ul><li><b>Gösterir:</b> rapor görüntüleme, sayfa görüntüleme, tekil görüntüleyen, eğilim, dağıtım yolu (çalışma alanı, paylaşım, uygulama), platform (web, gömülü, mobil), tipik açılma süresi (yüzde 50’lik dilim).</li><li><b>Bugünü saymaz.</b> Model günde bir yenilenir; yeni veri 24 saate kadar gecikir.</li><li><b>30 günden eskisi silinir.</b> Uzun eğilim için düzenli dışarı aktar.</li><li><b>Kopya al:</b> Dosya → Kopya kaydet düzenlenebilir rapor üretir; Desktop’tan “Usage Metrics Report” modeline bağlanılabilir. Model önizleme olduğu için ufak değişebilir.</li></ul>
<div class="warn"><b>Sayıyı doğru oku</b>Sayfa görüntüleme istemci izlemesinden gelir; reklam engelleyici ya da ağ sorunu farklılık yaratır. Abonelik anlık görüntüleri görüntülemeyi şişirebilir. Uygulamadaki rapor çalışma alanındakiyle farklı kimlik taşır, ayrı görünebilir. Pano kullanımı yeni raporda yok. Bir ayarla kullanıcı adları “adsız kullanıcı” olarak maskelenebilir.</div>
<h2>Etkinlik günlüğü ve denetim</h2>
<p>Birden çok çalışma alanı, 30 günden uzun geçmiş ya da tüm etkinlikler için kullanım ölçümleri yetmez. Etkinlik günlüğünü her gün kendi deponda biriktir (“Yönetişim” dersi). Böylece “kim dışa aktardı?” aylar sonra cevaplanır.</p>
<h2>Monitor hub</h2>
<p>Fabric’in birleşik izleme ekranı. İş çalıştırmaları, uygulamalar, kapasite ve maliyet, ajanlar, uyarılar sayfaları var. Herkes açabilir, ama yalnız görme izni olduğu öğeleri görür. İşlem hattı hatasını adım adım okumak “İşlem hatları” dersinde. Learn’de Kasım 2026 itibarıyla önizleme etiketi taşıyor.</p>
<h2>Capacity Metrics</h2>
<p>Kapasite kapasite birimi (CU) ile ölçülür. Rapor sorguları, yenileme, not defteri, Copilot aynı havuzdan tüketir. Uygulamanın <b>Sistem durumu</b> sayfası hangi kapasitenin kısıtlandığını, <b>İşlem</b> sayfası 14 günlük eğilimi ve işlem matrisini, <b>Zaman noktası</b> sayfaları 30 saniyelik aralıkları gösterir.</p>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Yorum</th><th>Önce dene</th></tr>
<tr><td>Her gece 02:00’de zirve, sabah rapor yavaş</td><td>Yenilemeler üst üste</td><td>Saatleri yay</td></tr>
<tr><td>Öğlen bir not defteri kapasitenin çoğunu yiyor</td><td>Geliştirme işi üretim havuzunda</td><td>Ayrı kapasite, iş saatini kaydır</td></tr>
<tr><td>Kısıtlama (throttling), sorgu reddi</td><td>Uzun süre kapasite üstünde tüketim</td><td>Ağır işi bul, sonra SKU düşün</td></tr>
<tr><td>Rapor yavaş, kapasite rahat</td><td>Kapasite sorunu değil, DAX ya da model</td><td>Performans Analizi</td></tr></table></div>
<p>Son satır önemli: SKU büyütmek yavaş ölçüyü düzeltmez. Sıra “önce hangi işlem, sonra neden, en son para”dır.</p>
<h2>Çalışma alanı izleme</h2>
<p>İsteğe bağlı bir izleme öğesi, çalışma alanı olaylarını Eventhouse içindeki tablolara yazar. Anlam modeli işlem günlükleri, işlem hattı, Dataflow Gen2 ve ambar kayıtları buraya gelir; KQL ile sorgulanır, Activator ile uyarıya bağlanır. Önizlemededir, kapasite tüketir, açılmadan önceki etkinlik geriye dönük dolmaz.</p>
<h2>Kullanım verisiyle karar</h2>
<div class="tbl-wrap"><table><tr><th>Bulgu</th><th>Karar</th></tr>
<tr><td>30 günde hiç açılmayan rapor</td><td>Sahibine sor, tek açan yoksa arşivle</td></tr>
<tr><td>Çok açılıyor, tek kişi</td><td>Kişisel iş; aboneliğe ya da kendi alanına</td></tr>
<tr><td>Çok görüntüleme, ilk sayfa dışı neredeyse hiç</td><td>Sayfaları azalt, özeti güçlendir</td></tr>
<tr><td>Tipik açılma süresi yüksek</td><td>Sayfadaki görsel sayısını, ölçüleri incele</td></tr>
<tr><td>Çoğu erişim mobil</td><td>Mobil düzeni önceliklendir</td></tr></table></div>
<p>Kullanım tablosunu Desktop’a aldığında sorular DAX’a dönüşür. Örnek kullanım tablosu:</p>
<pre class="dax">EVALUATE
VAR Kullanim =
    DATATABLE("Rapor", STRING, "Kisi", STRING, "Goruntuleme", INTEGER, {
        {"Satış", "ayse", 22}, {"Satış", "mert", 14}, {"Satış", "selin", 9},
        {"Stok", "ayse", 40}, {"Kargo", "mert", 1}
    })
RETURN
    GROUPBY(Kullanim, [Rapor], "Toplam", SUMX(CURRENTGROUP(), [Goruntuleme]), "Kisi Sayisi", SUMX(CURRENTGROUP(), 1))</pre>
<p>Stok 40 görüntülenmiş ama tek kişi; Satış 45 görüntülenmiş, üç kişi. Sadece toplama bakan kişi Stok’u “popüler” sanır. Tablolar örnek amaçlıdır.</p>
` + ORTAM + `Bir çalışma alanında (Pro ya da deneme) kendi raporunun kullanım ölçümlerini aç; verinin gelmesi bir gün sürebilir. Capacity Metrics ve çalışma alanı izleme için Fabric kapasitesi gerekir; Fabric deneme kapasitesi Capacity Metrics uygulamasını destekler. Yönetici ayarına bağlı olabilir.</div>
`,
  ex: [
    { t: 'mc', q: 'Rapor yazarı Görüntüleyici rolüyle raporun kullanım ölçümlerini açamıyor. Neden?', o: ['Yalnız kapasitede çalışır', 'En az Katkıda bulunan olmalı', 'Rapor uygulamada olmalı', 'Rapor 30 günden yeni olmalı'], a: 1, why: 'Düzenleme yetkisi (Yönetici, Üye, Katkıda bulunan) ve Pro ya da PPU gerekir. Pro’da paylaşılan alanda da çalışır, kapasite şart değildir.' },
    { t: 'mc', q: 'Güvenlik ekibi: “5 ay önce bu raporu kim dışa aktardı?” Kullanım ölçümleri 30 gün tutuyor. Doğru hazırlık?', o: ['Kullanım raporunu her ay okumak', 'Etkinlik günlüğünü biriktirmek', 'Raporu sertifikalamak', 'Dışa aktarmayı tamamen kapatmak'], a: 1, why: 'Dışa aktarma olayı etkinlik günlüğündedir ve geçmişi sınırlıdır. Her gün kendi depona alırsan aylar sonra sorgulayabilirsin. Dışa aktarmayı kapatmak geçmiş soruyu cevaplamaz.' },
    { t: 'mc', q: 'Kullanıcılar raporun yavaş açıldığını söylüyor. Capacity Metrics kapasitenin rahat olduğunu gösteriyor. Ekip F64’e geçmek istiyor. Sen?', o: ['Geçelim, sorunu çözer', 'Önce Performans Analizi’ne bak', 'Aboneliği kapatalım', 'Kullanım ölçümlerini silelim'], a: 1, why: 'Kapasite rahatsa sorun büyük olasılıkla model, DAX ya da sayfa tasarımıdır. SKU büyütmek yavaş ölçüyü düzeltmez; “önce neden, en son para”.' },
    { t: 'mc', q: 'Kullanım raporunda bir rapor sabit bir saatte çok görüntüleniyor, ama tekil kişi az. En olası açıklama?', o: ['RLS çalışmıyor', 'Rapor mobil açılıyor', 'Abonelikler şişiriyor', 'Rapor başka alana taşınmış'], a: 2, why: 'Learn: abonelik anlık görüntüleri görüntüleme sayısını şişirebilir. Toplam yerine tekil görüntüleyene bak.' },
    { t: 'mc', q: 'İşlem hattı gece düştü. Fabric’te en hızlı nereden bakarsın?', o: ['Monitor hub', 'Kullanım ölçümleri raporu', 'Kiracı ayarları', 'OneLake kataloğu'], a: 0, why: 'İş çalıştırmaları Monitor hub’da görünür, buradan çalıştırmanın ayrıntısına inilir. Kullanım ölçümleri rapor görüntülemesi içindir.' },
    { t: 'mc', q: 'Çalışma alanı izlemeyi bugün açtın ve dünkü sorguyu arıyorsun. Bulamıyorsun. Neden?', o: ['Kapasite yetersiz', 'Geriye dönük dolmaz', 'KQL Türkçe çalışmaz', 'Silme ilkesi 1 gündür'], a: 1, why: 'Learn: toplama açıldıktan sonra veri akar, önceki etkinlik için doldurma yoktur. Varsayılan saklama süresi 30 gündür.' },
    { t: 'query', q: 'Kullanım tablosunu özetle. <b>Rapor</b>, <b>Goruntuleme</b> sütunlu DATATABLE yaz: Satış 22, Satış 14, Stok 40, Kargo 1. Her rapor için <b>Toplam</b> görüntülemeyi döndür; toplamı 5’in altındakiler emeklilik adayı.', start: 'EVALUATE\n', sol: 'EVALUATE\nVAR K = DATATABLE("Rapor", STRING, "Goruntuleme", INTEGER, {{"Satış", 22}, {"Satış", 14}, {"Stok", 40}, {"Kargo", 1}})\nRETURN GROUPBY(K, [Rapor], "Toplam", SUMX(CURRENTGROUP(), [Goruntuleme]))', hint: 'GROUPBY(K, [Rapor], "Toplam", SUMX(CURRENTGROUP(), [Goruntuleme]))' }
  ]
});

/* ---------- Yerel geliştirme ---------- */
add('kullanim-izleme', {
  id: 'yerel-gelistirme', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 30,
  title: 'Yerel geliştirme: .pbix’ten .pbip’e, DAX sorgu görünümü, TMDL ve Git',
  sum: 'Bilgisayarında düzenli çalışmak: .pbix ile .pbip farkı, klasör yapısı, DAX sorgu görünümünde ölçüyü denemek, TMDL görünümü, VS Code ve Git ile ilk akış, harici araçlar; kendi Desktop’unda adım adım.',
  body: `
<p>“Rapor_son_son2_GERCEK.pbix”. Tanıdık mı? Power BI Desktop ücretsiz ve Windows üzerinde çalışır; rapor geliştirmenin büyük kısmı burada, kendi bilgisayarında olur. Bu ders, ekibe girmeden önce <b>tek başına bile olsan</b> düzenli yerel çalışma alışkanlığını kurar. Dallar, çekme isteği ve dağıtım gibi ekip süreçleri “Yaşam döngüsü” dersinde.</p>
<h2>.pbix mi, .pbip mi?</h2>
<div class="tbl-wrap"><table><tr><th></th><th>.pbix</th><th>.pbip (Power BI projesi)</th></tr>
<tr><td>Biçim</td><td>Tek ikili dosya</td><td>Metin dosyalarından oluşan klasör</td></tr>
<tr><td>Fark görme</td><td>Yok</td><td>Satır satır, Git ile</td></tr>
<tr><td>Veri</td><td>Dosyanın içinde</td><td>Yerel önbellekte (<code>.pbi/cache.abf</code>), depoya girmez</td></tr>
<tr><td>Dış düzenleyici</td><td>Yok</td><td>VS Code ile TMDL ve PBIR</td></tr>
<tr><td>Duyarlılık etiketi</td><td>Var</td><td>Desteklenmez</td></tr>
<tr><td>OneDrive/SharePoint’e doğrudan</td><td>Var</td><td>Önerilmez; eşitleme sorunu çıkarır</td></tr></table></div>
<p>Dönüşüm yalnız Desktop’ta <b>Dosya → Farklı kaydet</b> ile yapılır, otomatikleştirilemez. Klasör şöyle olur:</p>
<pre class="dax" data-notry>AnadoluMarket/
  AnadoluMarket.pbip               // kısayol, isteğe bağlı
  AnadoluMarket.SemanticModel/
    definition/                    // TMDL: tablolar, ölçüler, ilişkiler
  AnadoluMarket.Report/
    definition.pbir                // modeli gösterir
    definition/                    // PBIR: sayfa, görsel, yer işareti
  .gitignore                       // cache.abf ve localSettings.json dışarıda</pre>
<p>Windows’un 260 karakter yol sınırına takılmamak için kısa kök klasör seç (<code>C:\\bi\\</code>). Dosyalar BOM’suz UTF-8, satır sonu CRLF’tir; Git’te <code>autocrlf</code> ayarını ekipçe aynı yap. Elle değişiklik desteklenmeyen dosyalar var (<code>report.json</code>, diyagram düzeni). Yayımdan önce bunlara dokunma.</p>
<h2>DAX sorgu görünümü: ölçüyü yazmadan dene</h2>
<p>Desktop’ta sol şeritteki <b>DAX sorgu görünümü</b>, modele EVALUATE sorgusu gönderir. Ölçüyü modele eklemeden önce <code>DEFINE MEASURE</code> ile yerel olarak yazıp sınayabilirsin. Doğruysa görünümdeki model güncelleme komutuyla modele eklersin. Bu uygulamadaki DAX Playground aynı mantıkla çalışır:</p>
<pre class="dax">DEFINE
    MEASURE Satislar[Deneme Marj] = DIVIDE([Brüt Kâr], [Net Satış])
EVALUATE
SUMMARIZECOLUMNS(Kategoriler[Kategori], "Net", [Net Satış], "Marj", [Deneme Marj])</pre>
<p>Alışkanlık: yeni ölçü yazmadan önce kenar durumları sor. Sıfır bölme var mı, boş kategoride ne dönüyor, toplam satırı anlamlı mı? Sorgu dosyalarını projede saklarsan aynı testi sonra da çalıştırırsın.</p>
<h2>TMDL görünümü</h2>
<p>Modeli metin olarak düzenleyen görünümdür. Elli ölçünün biçimini tek tek tıklamak yerine betikle değiştirirsin, görüntüleme klasörü toplu verilir. Bir ölçü şöyle görünür (“Yaşam döngüsü” dersinde tam örnek var):</p>
<pre class="dax" data-notry>measure 'Net Satış' = CALCULATE([Toplam Satış], Satislar[Durum] &lt;&gt; "İptal")
    formatString: #,0 ₺
    displayFolder: Temel</pre>
<p>Desktop dış değişikliği algılar ve uygulamak için sorar. Açık değişiklik varken dışarıdan düzenleme yaparsan bazı değişiklikler kaybolabilir: önce Desktop’ta kaydet.</p>
<h2>Git ile ilk yerel akış</h2>
<ol><li>Projeyi .pbip olarak kaydet, klasörde <code>git init</code>.</li><li>Oluşan <code>.gitignore</code>’da <code>cache.abf</code> ve <code>localSettings.json</code> olduğunu kontrol et.</li><li>İlk işleme: <code>git add .</code>, <code>git commit -m "İlk sürüm"</code>.</li><li>Bir ölçüyü değiştir, Desktop’ta kaydet, <code>git diff</code> ile tek satırlık farkı gör.</li><li>Beğenmediysen <code>git restore</code> ile geri dön; Desktop’ı yeniden aç.</li></ol>
<p>Bu kadarı bile “dün neyi bozdum?” sorusunu çözer. Uzak depo, dal ve çekme isteği ekip konusudur.</p>
<h2>Harici araçlar</h2>
<div class="tbl-wrap"><table><tr><th>Araç</th><th>Ne için?</th><th>Bağlantı</th></tr>
<tr><td>DAX Studio</td><td>Sorgu planı, sunucu zamanlaması</td><td>Desktop’ın yerel modeli</td></tr>
<tr><td>Tabular Editor</td><td>Toplu ölçü, hesaplama grubu, Best Practice Analyzer</td><td>Yerel model ya da dosya</td></tr>
<tr><td>VS Code</td><td>TMDL, PBIR, Git</td><td>Proje klasörü</td></tr></table></div>
<p>Bu araçlar Desktop’ın çalıştırdığı yerel Analysis Services örneğine bağlanır. Üretimde kuruluşunun izin verdiği sürümleri kullan. Performans ölçümünde Desktop sonucu Service ile aynı olmaz: veri hacmi, eşzamanlılık, kapasite ve RLS farklıdır.</p>
<h2>Yayımla mı, Git mi?</h2>
<p>Desktop’ta Yayımla geçici bir .pbix ile yerel önbelleği de gönderir. Fabric Git tümleştirmesi ve REST API yalnız meta veriyi taşır; veri için yenileme gerekir. Tek başına çalışırken Yayımla yeterlidir; ekipte düzenli dağıtıma geç. PBIP’in sınırları: duyarlılık etiketi yok, Report Server sürümünde yok, AAS veya SSAS’a dağıtılamaz.</p>
<div class="warn"><b>Sürümleri takip et</b>PBIP ve PBIR hızlı değişiyor. Gelişmiş rapor biçimi PBIR’ın durumu ve varsayılan olup olmadığı için Learn’deki güncel sayfaya bak; bu derste kesin tarih vermiyoruz. Eski PBIR-legacy biçimi belgesiz tek <code>report.json</code> kullanır.</div>
` + ORTAM + `Power BI Desktop’u (Windows) Microsoft Store’dan ya da İndirme Merkezi’nden ücretsiz kur (“Power BI Desktop kurulumu” dersi). Hesap gerekmeden çalışır. Veri setleri sayfasından Anadolu Market CSV’lerini indir, ilk rapor dersindeki modeli kur, .pbip olarak kaydet. Yukarıdaki Git adımlarını dene. Mac’te Desktop çalışmaz; alıştırmalar tarayıcıda çözülür.</div>
`,
  ex: [
    { t: 'query', q: 'Ölçüyü modele eklemeden dene. <code>DEFINE MEASURE Satislar[Deneme İade Payı]</code> ile <code>DIVIDE([İade Tutarı], [Net Satış])</code> tanımla. <code>SUMMARIZECOLUMNS</code> ile her <code>Kategoriler[Kategori]</code> için <b>Net</b> ve <b>Pay</b> döndür.', start: 'DEFINE\n    MEASURE Satislar[Deneme İade Payı] = \nEVALUATE\n', sol: 'DEFINE\n    MEASURE Satislar[Deneme İade Payı] = DIVIDE([İade Tutarı], [Net Satış])\nEVALUATE\nSUMMARIZECOLUMNS(Kategoriler[Kategori], "Net", [Net Satış], "Pay", [Deneme İade Payı])', hint: 'DEFINE bloğu EVALUATE’ten önce gelir. Yerel ölçüye [Deneme İade Payı] diye başvurursun.' },
    { t: 'query', q: 'İki sürümü yan yana karşılaştır: <code>DEFINE MEASURE</code> ile <b>Eski</b> (<code>[Toplam Satış]</code>) ve <b>Yeni</b> (<code>[Net Satış]</code>) ölçülerini tanımla. Her <code>Tarih[Yil]</code> için ikisini ve farkı (<b>Fark</b> = Eski eksi Yeni) döndür. Ölçü değişikliğinden önce etkisini böyle ölç.', start: 'DEFINE\n', sol: 'DEFINE\n    MEASURE Satislar[Eski] = [Toplam Satış]\n    MEASURE Satislar[Yeni] = [Net Satış]\nEVALUATE\nSUMMARIZECOLUMNS(Tarih[Yil], "Eski", [Eski], "Yeni", [Yeni], "Fark", [Eski] - [Yeni])', hint: 'İki MEASURE satırı yaz. SUMMARIZECOLUMNS içinde "Fark", [Eski] - [Yeni].' },
    { t: 'mc', q: 'Tek başına çalışan analist her değişiklikten sonra farklı adla .pbix kaydediyor; hangi sürümde neyi değiştirdiğini bilmiyor. İlk iyileştirme?', o: ['Bulut klasöründe sürümleri saklamak', '.pbip ve yerel Git', 'Her gece e-postayla yedek', 'Dosya adına tarih eklemek'], a: 1, why: '.pbip metin dosyaları üretir; Git hangi ölçünün değiştiğini satır satır gösterir, geri dönmek kolaydır. Bulut sürümü ikili dosyanın farkını göstermez. PBIP’i doğrudan OneDrive’a kaydetmek de önerilmez.' },
    { t: 'mc', q: 'Çekme isteğinde 300 MB’lık <code>cache.abf</code> görünüyor. Ne yaparsın?', o: ['Depodan çıkarırım', 'Sıkıştırıp bırakırım', 'Model için depoda bırakırım', 'Yayımlayıp silerim'], a: 0, why: 'cache.abf yerel veri önbelleğidir. Model tanımı için gerekmez ve depoya veri sızdırır. Desktop’ın .gitignore’u bunu zaten dışlar; dosya zorla eklenmiş ya da .gitignore silinmiştir.' },
    { t: 'mc', q: 'Gizli etiketli bir model projesi .pbip’e çevrilecek. Neye dikkat edersin?', o: ['PBIP etiket desteklemez', 'PBIP yalnız Fabric’te açılır', 'TMDL RLS’i siler', 'Etiket .gitignore’a yazılmalı'], a: 0, why: 'Learn: PBIP’te duyarlılık etiketi desteklenmez. Etiketli içerik depoya taşınmadan önce süreç düşünülmelidir. Yerel klasör ve depo erişimi de veri sınıfına uymalıdır.' },
    { t: 'mc', q: 'Desktop’ta açık olan projede VS Code ile TMDL’de ölçü değiştirdin, Desktop’ta da kaydetmediğin değişiklik vardı. Risk?', o: ['VS Code dosyayı kilitler', 'Desktop değişiklikleri birleştirir', 'Dış değişiklik kaybolabilir', 'Model bozulup silinir'], a: 2, why: 'Learn: unappliedChanges.json olan projede dışarıdan yapılan düzenleme, bu değişiklikler uygulanınca kaybolur. Önce Desktop’ta kaydet, sonra dışarıda düzenle.' },
    { t: 'mc', q: 'Yayımladığın model Service’te dolu, ama Git ile dağıtılan aynı model boş. Fark ne?', o: ['Git TMDL okuyamıyor', 'Git veriyi taşımaz', 'Service önbelleği bozuk', 'RLS satırları süzüyor'], a: 1, why: 'Desktop Yayımla yerel önbelleği de gönderir. Git ve REST API yalnız meta veriyi taşır; veri için yenileme ve kimlik bilgisi gerekir.' },
    { t: 'mc', q: 'DAX Studio’da sorgu 200 ms, kullanıcılar Service’te 5 saniye bekliyor. Yorum?', o: ['DAX Studio yanlış ölçer', 'Service koşulları farklıdır', 'Kullanıcı interneti yavaştır', 'Ölçüyü silmek gerekir'], a: 1, why: 'Veri hacmi, eşzamanlılık, kapasite, RLS ve önbellek farklıdır. Desktop sonucu tek başına kanıt değildir; Service’te Performans Analizi benzeri ölçümlerle ya da kullanım ölçümleriyle doğrula.' }
  ]
});
})(window);
