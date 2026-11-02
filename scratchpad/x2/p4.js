
/* ===================================================================== 7. YÖNETİŞİM */
ext('yonetisim', { min: 20, html: `
<h2>Kiracı ayarları: kim neyi yapabilir?</h2>
<p>Anadolu Market'in denetim ekibi soruyor: “Müşteri listesini kim CSV olarak indirebilir? Bir rapor internete açılabilir mi? Kim sertifika verebilir?” Bu soruların cevabı rapor dosyalarında değil, Yönetici portalı → <b>Kiracı ayarları</b> (Tenant settings) ekranındadır. Ayarların çoğu üç biçimde açılır: tüm kuruluş, belirli güvenlik grupları ya da belirli gruplar hariç herkes.</p>
<div class="tbl-wrap"><table><tr><th>Ayar grubu</th><th>Örnek ayarlar</th><th>Önerilen başlangıç</th></tr>
<tr><td>Dışa aktarma</td><td>Excel'e aktar, .csv'ye aktar, PDF/PowerPoint olarak aktar, rapor indirme (.pbix), yazdırma</td><td>Açık; ama .csv yalnızca belirli gruplara</td></tr>
<tr><td>Canlı bağlantı</td><td>Excel'de canlı bağlantıyla çalışma (Excel'de Çözümle)</td><td>Açık; RLS geçerli olduğu için güvenli</td></tr>
<tr><td>Paylaşım</td><td>Web'de yayımla, konuk kullanıcılar, kuruluş genelinde paylaşım bağlantısı</td><td>Web'de yayımla kapalı ya da çok küçük bir grup</td></tr>
<tr><td>Abonelik</td><td>E-posta aboneliği kurma, dış kullanıcılara gönderme</td><td>Dış gönderim kapalı</td></tr>
<tr><td>Onaylama</td><td>Sertifikalama, ana veri onayı</td><td>Yalnızca atanmış gözden geçirenler</td></tr>
<tr><td>Bileşik model</td><td>Power BI anlam modellerine DirectQuery bağlantıları</td><td>Açık, eğitimli yazar grubu için</td></tr></table></div>
<p>İki pratik kural: <b>ayarı gruba bağla</b> (kişi listesi yönetilmez) ve <b>her değişikliği gerekçesiyle kaydet</b>. Kiracı ayarları değiştiği anda herkesi etkiler; değişiklik günlüğü olmayan bir kiracıda “bu ne zaman açıldı?” sorusunun cevabı yoktur. Büyük kuruluşlarda sertifikalama yetkisi etki alanı (domain) yöneticilerine devredilebilir; her iş biriminin kendi gözden geçirenleri olur.</p>

<h2>Onaylama: tanıtılmış, sertifikalı, ana veri</h2>
<div class="tbl-wrap"><table><tr><th>Rozet</th><th>Anlamı</th><th>Kim verir?</th><th>Hangi öğeler?</th></tr>
<tr><td>Tanıtılmış (Promoted)</td><td>“Sahibi olarak bunu paylaşmaya hazır görüyorum”</td><td>Öğede yazma izni olan herkes</td><td>Panolar hariç tüm öğeler</td></tr>
<tr><td>Sertifikalı (Certified)</td><td>Kuruluşun kalite standardından geçti</td><td>Yalnızca yöneticinin atadığı gözden geçirenler; herkes talep edebilir</td><td>Panolar hariç tüm öğeler</td></tr>
<tr><td>Ana veri (Master data)</td><td>Kuruluşun temel referans verisi (ürün kodları, müşteri listesi)</td><td>Yalnızca yöneticinin atadığı kişiler</td><td>Yalnızca veri içeren öğeler: lakehouse, anlam modeli…</td></tr></table></div>
<p>Rozet bir süreç sonucudur, süreç değildir. Sertifika vermeden önce gözden geçirenin baktığı somut bir liste olmalı. Bunun en kritik maddesi: <b>ölçüleri kendi kırılım sütunlarında test et</b>. Bu modelde hazır <code>[Net Satış]</code> ölçüsü Durum'a göre kesildiğinde ne olur?</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(Satislar[Durum], "Toplam Satış", [Toplam Satış], "Net Satış", [Net Satış])</pre>
<p>Toplam Satış her durum için farklıdır (Teslim Edildi 1.049.627,00 ₺, İptal 95.417,40 ₺…), ama Net Satış <b>her satırda 1.250.772,45 ₺</b> görünür; İptal satırında bile. Ölçü sütun filtresiyle Durum filtresinin üzerine yazar (DAX optimizasyonu dersinde mekanizması var). Bu bir “hata” mı, “bilinen davranış” mı? Sertifika kararı tam olarak bunu belgelemektir: ya ölçü KEEPFILTERS ile düzeltilir ya da açıklamasına “Durum kırılımında kullanma” yazılır.</p>
<ul>
<li><b>Sertifika kontrol listesi:</b> sahibi ve yedek sahibi belli · tüm ölçülerin açıklaması var · kırılım testleri yapılmış · RLS test kullanıcılarıyla doğrulanmış · yenileme zamanlaması ve hata bildirimi ekip listesine gidiyor · duyarlılık etiketi uygun · etki analizi ile bağlı öğeler biliniyor.</li>
<li><b>Sertifikayı geri almak</b> da süreçtir: model artık bakımı yapılmıyorsa rozet kaldırılmalı; aksi hâlde kullanıcılar eski modeli “güvenilir” sanar.</li>
</ul>

<h2>Duyarlılık etiketleri: devralma ve dışa aktarma</h2>
<p>Etiketleri uygulamak için Microsoft Purview Information Protection lisansının yanında Power BI Pro ya da PPU gerekir; etiketin kullanıcıya bir etiket ilkesiyle yayımlanmış olması da şarttır. Uygulamada önemli olan, etiketin nereye <b>gittiğidir</b>:</p>
<ul>
<li><b>Aşağı yönlü devralma</b> varsayılan olarak açıktır: “Gizli” etiketli bir anlam modelinin üzerine kurulan raporlar ve panolar etiketi devralır.</li>
<li><b>Veri kaynağından devralma:</b> anlam modeli etiketli bir kaynaktan (ör. etiketli bir Excel) veri alınca o etiketi alabilir.</li>
<li><b>Zorunlu etiket ve varsayılan etiket</b> ilkeleri Power BI öğelerinde tam desteklenir: kullanıcı etiket seçmeden kaydedemez ya da varsayılan etiket kendiliğinden atanır.</li>
<li><b>Dışa aktarma:</b> Excel, PDF, PowerPoint, Excel'de Çözümle ve .pbix indirme etiketi dosyaya taşır; etiket şifreleme içeriyorsa dosya korunur. <b>.csv ve .txt dışa aktarımı etiketi taşımaz.</b> Gizli verili modellerde .csv dışa aktarımını bu yüzden kısıtla.</li>
<li>Power BI Projesi (PBIP) biçimi duyarlılık etiketlerini desteklemez; etiketli içeriği Git'e taşımadan önce bu farkı bil (Yaşam döngüsü dersi).</li>
</ul>

<h2>Denetim: kim neyi açtı, kim neyi dışa aktardı?</h2>
<p>Bir müşteri listesinin dışarı sızdığı iddia ediliyor. “Son 30 günde bu raporu kim dışa aktardı?” sorusunun iki kaynağı vardır:</p>
<div class="tbl-wrap"><table><tr><th></th><th>Denetim günlüğü (Purview)</th><th>Etkinlik günlüğü (Power BI)</th></tr>
<tr><td>Kapsam</td><td>Fabric ve Power BI dahil Microsoft 365 etkinlikleri</td><td>Yalnızca Power BI etkinlikleri</td></tr>
<tr><td>Erişim</td><td>Purview portalında denetim araması</td><td>Yönetici REST API'si (ActivityEvents) ya da <code>Get-PowerBIActivityEvent</code></td></tr>
<tr><td>Kim kullanır?</td><td>Uyumluluk ve güvenlik ekipleri</td><td>Fabric yöneticisi; otomasyonla</td></tr>
<tr><td>Not</td><td>Diğer Microsoft 365 olaylarıyla birlikte sorgulanır</td><td>Her istek tek bir günü (UTC) kapsar; olaylar genellikle 30–60 dakika içinde düşer</td></tr></table></div>
<p>Etkinlik günlüğünün geçmişi sınırlıdır. Kurumsal uygulama, her gece önceki günün olaylarını bir betikle çekip kendi deponda (ör. bir lakehouse tablosunda) biriktirmektir. Böylece “kim, hangi raporu, ne zaman görüntüledi ya da dışa aktardı” sorusu aylar sonra da cevaplanır ve kullanılmayan raporlar da bulunur: 90 gündür görüntülenmeyen bir rapor emekliye ayrılma adayıdır.</p>

<h2>Etki analizi ve dışa aktarım kontrolü</h2>
<p>Bir sütunun adını değiştirmeden önce Soy (lineage) görünümünde öğeyi aç ve <b>Etki analizi</b>'ne bak: kaç model, rapor, pano, kaç görüntüleme? Etkilenen öğelerin kişilerine buradan bildirim gönderebilirsin. Dışa aktarımı ise üç katmanda yönetirsin:</p>
<ol>
<li><b>Kiracı:</b> hangi biçimler kimlere açık (yukarıdaki tablo).</li>
<li><b>Rapor:</b> Desktop'ta Seçenekler → Geçerli dosya → Rapor ayarları → dışa aktarma: yalnızca özetlenmiş veri, özetlenmiş ve temel veri ya da hiç. Kiracı ayarından daha geniş olamaz.</li>
<li><b>Model:</b> RLS ve OLS. Dışa aktarılan veri de kullanıcının görebildiği satırlarla sınırlıdır; dışa aktarımı kapatmak, görmemesi gereken veriyi görmesinin çaresi değildir.</li>
</ol>
<div class="tip"><b>Yönetişim karar ağacı</b>Veri gizli mi? → etiket + .csv kısıtı + OLS/RLS. · Model birçok ekip tarafından kullanılıyor mu? → sertifika süreci + Derleme izni. · Dış kullanıcı var mı? → konuk ve abonelik ayarları, Web'de yayımla kapalı. · Değişiklik yapılacak mı? → etki analizi + bildirim. · Kim ne yaptı? → günlükleri her gün kendi depona al.</div>
`, ex: [
  { t: 'mc', q: `“Çok gizli” etiketli müşteri modelinden kullanıcıların Excel'e aktardığı dosyalar şifreli geliyor, ama aynı veriler başka bir yerde düz metin olarak bulundu. Etiket ilkesi doğru. En olası açık nedir?`,
    o: [`Excel'de Çözümle etiketi taşımıyor`, `Veri .csv olarak dışa aktarılmış; .csv etiketi taşımaz`, `PDF dışa aktarımı şifrelemeyi kaldırıyor`, `Aşağı yönlü devralma kapalı olduğu için`], a: 1,
    why: `Excel, PDF, PowerPoint ve Excel'de Çözümle etiketi ve korumayı dosyaya taşır; .csv ve .txt taşımaz. Bu yüzden gizli modellerde .csv dışa aktarımı kısıtlanır. Devralma, rapor ile model arasındaki etiket aktarımıyla ilgilidir; düz metin dosyayı açıklamaz.` },
  { t: 'mc', q: `Sertifika gözden geçireni, satış modelinde Net Satış'ın Durum tablosunda her satırda aynı tutarı gösterdiğini fark ediyor. Model sahibi “ölçü doğru, iptaller hariç” diyor. Gözden geçirenin doğru kararı?`,
    o: [`Ölçü doğru olduğu için hemen sertifikalamak`, `Modeli tanıtılmış olarak bırakıp sertifikayı reddetmek`, `Davranışı düzeltmeyi ya da açıklamada belgelemeyi şart koşmak`, `Durum sütununu modelden kaldırtmak`], a: 2,
    why: `Sertifika, davranışın bilindiği ve belgelendiği anlamına gelir. Sütun filtresi Durum kırılımının üzerine yazdığı için her satırda aynı tutar çıkar; ya KEEPFILTERS ile düzeltilmeli ya da açıklamada “Durum kırılımında kullanma” yazmalı. Olduğu gibi sertifikalamak kullanıcıyı yanıltır; reddetmek ya da sütunu kaldırmak gerekçesiz sert bir tepkidir.` },
  { t: 'mc', q: `Güvenlik ekibi altı ay önceki bir rapor dışa aktarımının kim tarafından yapıldığını soruyor. Kimse etkinlik günlüğünü düzenli toplamamış. Gelecekte bu soruya cevap verebilmek için ne kurarsın?`,
    o: [`Raporlara “dışa aktarmayın” uyarısı eklemek`, `Tüm kullanıcılar için dışa aktarmayı kapatmak`, `Her raporu sertifikalı yapıp sahiplerine sormak`, `Günlük olayları her gece çekip kendi depoda biriktirmek`], a: 3,
    why: `Etkinlik günlüğünün geçmişi sınırlıdır ve istek başına tek gün döner; her gece önceki günü çekip bir depoda tutmak geriye dönük soruları cevaplanabilir kılar. Uyarı metni kanıt üretmez; dışa aktarmayı tamamen kapatmak iş akışını bozar ve geçmişi açıklamaz; sertifika denetim kaydı değildir.` },
  { t: 'mc', q: `Ürün kodları ve kategori eşlemesini içeren lakehouse tablosu, şirketin tüm modellerinin referans kaynağı. Kullanıcıların bunu tek ve yetkili kaynak olarak tanıması isteniyor. Hangi onay?`,
    o: [`Ana veri (master data) rozeti`, `Tanıtılmış rozet`, `Raporlara “resmi” başlığı eklemek`, `Panoya sabitleyip öne çıkarmak`], a: 0,
    why: `Ana veri rozeti, veri içeren öğelerin kuruluşun yetkili temel verisi olduğunu gösterir ve yalnızca yöneticinin atadığı kişilerce verilir. Tanıtılmış rozeti herkes verebilir ve yetki ifade etmez; başlık ya da pano sabitleme bir onay mekanizması değildir.` },
  { t: 'mc', q: `BI ekibi <code>Musteriler[Segment]</code> sütununu yeniden adlandırmak istiyor. Kaç rapor ve kullanıcının etkileneceğini bilmiyor. İlk adım?`,
    o: [`Sütunu adlandırıp bozulan raporları beklemek`, `Eski adla yeni bir hesaplanmış sütun eklemek`, `Soy görünümünde etki analizi açıp sahiplere bildirmek`, `Tüm rapor yazarlarına e-posta atıp sormak`], a: 2,
    why: `Etki analizi, bağlı model, rapor ve panoları ve görüntüleme sayılarını gösterir; ilgili kişilere oradan bildirim gönderilir. Bozulmayı beklemek kullanıcıyı mağdur eder; kopya sütun teknik borç üretir; herkese e-posta göndermek kimin etkilendiğini söylemez.` },
  { t: 'query', q: `Sertifika öncesi kırılım testi: <code>Satislar[Kanal]</code> satırlarında “Toplam Satış” ve “Net Satış” değerlerini yan yana döndür; iki ölçünün kanal kırılımında nasıl davrandığını karşılaştır.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nSUMMARIZECOLUMNS(\n    Satislar[Kanal],\n    "Toplam Satış", [Toplam Satış],\n    "Net Satış", [Net Satış]\n)`, hint: `SUMMARIZECOLUMNS(Satislar[Kanal], "Toplam Satış", [Toplam Satış], "Net Satış", [Net Satış]).` }
] });

/* ===================================================================== 8. SAYFALANDIRILMIŞ */
ext('sayfalandirilmis', { min: 20, html: `
<h2>Report Builder ile ilk rapor: kaynaktan tabloya</h2>
<p>Muhasebe her ay sonunda mağaza kanalının sipariş satırlarını, logolu ve sayfa numaralı bir PDF olarak istiyor. Power BI Report Builder ücretsizdir ve sayfalandırılmış raporun (.rdl) ana tasarım aracıdır. RDL, raporun bütün tanımını (veri kaynağı, sorgu, parametreler, yerleşim) tutan bir XML dosyasıdır; metin olduğu için sürüm denetimine de girer.</p>
<ol>
<li><b>Veri kaynağı:</b> Veri kaynakları → Ekle → <b>Power BI anlam modeli</b>. Onaylı satış modelini seçmek, aynı ölçüleri (Net Satış, Sipariş Sayısı) burada da kullanmak demektir.</li>
<li><b>Veri kümesi:</b> Sorgu tasarımcısında alanları sürükle ya da DAX sorgusunu kendin yaz. Veri kümesi bir DAX sorgusudur; sonucu düz bir tablodur.</li>
<li><b>Tablix:</b> Tablo/matris/liste aynı denetimin farklı biçimleridir. Satır grupları (ör. Tarih'e göre), grup alt toplamları, “her sayfada başlığı tekrarla” ayarı ve grup başında sayfa sonu buradan verilir.</li>
<li><b>Üst/alt bilgi:</b> logo, rapor adı, <code>=Globals!PageNumber &amp; " / " &amp; Globals!TotalPages</code> ifadesiyle sayfa numarası, oluşturma zamanı.</li>
<li><b>Yayımla:</b> Report Builder'dan doğrudan Service'e.</li>
</ol>
<p>Muhasebenin istediği listenin veri kümesi şöyle bir sorgudur (ay ve kanal şimdilik sabit):</p>
<pre class="dax">EVALUATE
CALCULATETABLE(
    SELECTCOLUMNS(Satislar, "Sipariş", Satislar[SiparisNo], "Tarih", Satislar[Tarih], "Durum", Satislar[Durum], "Tutar", Satislar[Tutar]),
    Satislar[Kanal] = "Mağaza",
    Tarih[YilAy] = "2024-12"
)</pre>

<h2>Parametreler: tek değer, çoklu değer, basamaklı</h2>
<p>Sabit “2024-12” yerine kullanıcı ayı ve kategorileri seçmeli. Report Builder'da her parametre bir ad, tür, kullanılabilir değerler (çoğu zaman ayrı bir küçük veri kümesinden) ve varsayılan değer taşır. Sorgu tasarımcısı parametreli filtreyi kendisi üretir; DAX'ı elle yazıyorsan çoklu değerli parametre sorguya <b>tek bir metin</b> olarak gelir. Yaygın kalıp, değerleri parametre ifadesinde birleştirip DAX'ta yola çevirmektir:</p>
<pre class="dax" data-notry>-- Parametre ifadesi (veri kümesi özellikleri → Parametreler):
--   @Kategoriler = Join(Parameters!Kategori.Value, "|")
EVALUATE
SUMMARIZECOLUMNS(
    Kategoriler[Kategori],
    FILTER(VALUES(Kategoriler[Kategori]), PATHCONTAINS(@Kategoriler, Kategoriler[Kategori])),
    "Net Satış", [Net Satış]
)</pre>
<p>Aynı mantığı sabit değerlerle, motorun çalıştırabildiği biçimde denemek için <code>TREATAS</code> kullanılır. “Elektronik ve Kitap” seçimi için:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Kategoriler[Kategori],
    TREATAS({"Elektronik", "Kitap"}, Kategoriler[Kategori]),
    "Net Satış", [Net Satış]
)</pre>
<p>Sonuç iki satırdır: Elektronik 339.303,65 ₺, Kitap 151.882,40 ₺. <b>Basamaklı parametrede</b> ikinci parametrenin (Ürün) kullanılabilir değerleri, birinci parametreye (Kategori) göre süzülen ayrı bir veri kümesinden gelir. Kenar durumlar: “Tümü” seçeneği için parametreye boş değer izni ver ve sorguda boşsa filtre uygulama; çok seçenekli bir listede yüzlerce ürün varsa kullanıcıya önce kategori seçtir.</p>

<h2>Ne zaman sayfalandırılmış rapor? Karar tablosu</h2>
<div class="tbl-wrap"><table><tr><th>İhtiyaç</th><th>En iyi araç</th><th>Neden</th></tr>
<tr><td>Yönetici keşif yapacak, tıklayıp detaya inecek</td><td>Etkileşimli rapor</td><td>Çapraz filtre, araç ipucu, detaya inme</td></tr>
<tr><td>Analist kendi pivotunu kuracak</td><td>Excel'de Çözümle</td><td>Canlı bağlantı, RLS geçerli, Excel becerisi</td></tr>
<tr><td>Tüm satırlar eksiksiz, sayfa sayfa, imza alanıyla</td><td>Sayfalandırılmış rapor</td><td>Tablo kaç sayfa olursa olsun basılır</td></tr>
<tr><td>Her ay aynı belge e-postayla, ekte PDF</td><td>Sayfalandırılmış rapor + abonelik</td><td>Parametreli abonelik, sabit düzen</td></tr>
<tr><td>Etkileşimli sayfada “yazdırılabilir liste” düğmesi</td><td>Sayfalandırılmış rapor görseli</td><td>Raporun filtreleri parametre olarak geçer</td></tr></table></div>

<h2>Lisans, sınırlar ve dağıtım</h2>
<ul>
<li><b>Oluşturma:</b> Report Builder ile oluşturmak ve Çalışma alanım'a yayımlamak için Pro/PPU gerekmez. Başka bir çalışma alanına yayımlamak için Pro ya da PPU gerekir.</li>
<li><b>Görüntüleme:</b> Fabric F64 ya da üstü (veya Premium P1 ve üstü) kapasitedeki çalışma alanlarında ücretsiz lisanslı kullanıcılar görüntüleyebilir. Diğer durumlarda görüntüleyicinin Pro ya da PPU'su olmalı. Sayfalandırılmış raporlar Pro çalışma alanlarında da çalışır ve uygulamalara eklenebilir.</li>
<li><b>Dışa aktarım biçimleri:</b> Excel, Word, PowerPoint, PDF, erişilebilir PDF, CSV, XML ve MHTML.</li>
<li><b>Web'de tasarım:</b> Service içinde yalnızca basit, tek tablolu raporlar oluşturulabilir; ciddi tasarım için Report Builder.</li>
<li><b>Sınırlar:</b> SSRS'nin paylaşılan veri kaynakları (.rds) ve paylaşılan veri kümeleri (.rsd) desteklenmez; özel derlemeler (custom assemblies) yoktur; şirket içi kaynaklar ve saklı yordamlar ağ geçidi üzerinden çalışır.</li>
<li><b>RLS:</b> rapor anlam modeline bağlıysa kullanıcının RLS rolü geçerlidir; ama Service'teki “Rol olarak test et” sayfalandırılmış raporlarda çalışmaz. Testi gerçek bir test kullanıcısıyla yap.</li>
</ul>
<h3>Abonelikle PDF dağıtımı</h3>
<p>Sayfalandırılmış raporun aboneliğinde biçim (PDF, Excel…) ve <b>parametre değerleri</b> seçilir: “Her ayın 1'inde, önceki ay, Mağaza kanalı, PDF ekli”. Varsayılan değeri “önceki ay” olarak hesaplayan bir parametre ifadesi kullanırsan aboneliği her ay güncellemen gerekmez. Her alıcıya kendi verisini göndermek için alıcı listesi ve parametre değerleri bir tablodan okunan dinamik abonelik kullanılır.</p>
<div class="tip"><b>Kontrol listesi</b>Veri kaynağı onaylı anlam modeli mi? · Parametrelerin varsayılanı abonelikte elle değiştirme gerektirmiyor mu? · “Tümü” ve boş seçim davranışı test edildi mi? · Başlık her sayfada tekrar ediyor, sayfa numarası var mı? · Görüntüleyicilerin lisansı çalışma alanı kapasitesine uygun mu? · RLS gerçek bir test hesabıyla denendi mi?</div>
`, ex: [
  { t: 'mc', q: `Bir analistin Pro lisansı yok. Report Builder'da bir sipariş listesi tasarlayıp ekip çalışma alanına (Pro) yayımlamak istiyor. Ne olur?`,
    o: [`Tasarlayıp Çalışma alanım'a yayımlayabilir; ekip alanına Pro/PPU ister`, `Report Builder lisanssız açılmaz; tasarım bile yapamaz`, `Pro çalışma alanları sayfalandırılmış raporu hiç desteklemez`, `Yayımlayabilir ama raporu yalnızca kendisi açabilir`], a: 0,
    why: `Report Builder ücretsizdir; Çalışma alanım'a yayımlamak için lisans gerekmez. Başka bir çalışma alanına yayımlamak Pro ya da PPU gerektirir. Pro çalışma alanları sayfalandırılmış raporları destekler; son şık yayımlamanın mümkün olduğunu varsayıyor, ki değil.` },
  { t: 'mc', q: `Şirket F64 kapasitesinde. 400 mağaza çalışanının (ücretsiz lisanslı) her ay kendi mağazasının sipariş listesini görmesi gerekiyor. Rapor bir kapasite çalışma alanında. Ek lisans gerekir mi?`,
    o: [`Evet; sayfalandırılmış rapor her zaman Pro ister`, `Evet; ücretsiz kullanıcılar yalnızca PDF eki alabilir`, `Hayır; ama yalnızca rapor Çalışma alanım'daysa`, `Hayır; F64 ve üstünde ücretsiz kullanıcılar görebilir`], a: 3,
    why: `F64 ve üstü Fabric (ya da P1 ve üstü Premium) kapasitedeki çalışma alanlarında ücretsiz lisanslı kullanıcılar sayfalandırılmış raporları görüntüleyebilir. Pro yalnızca kapasite dışındaki alanlarda gerekir. Çalışma alanım paylaşım için doğru yer değildir.` },
  { t: 'mc', q: `Elle yazılmış DAX veri kümesinde çoklu değerli <code>@Kategori</code> parametresi kullanılıyor. Kullanıcı iki kategori seçince rapor hiç satır döndürmüyor, tek kategoride çalışıyor. Neden?`,
    o: [`Çoklu değerli parametreler DAX'ta hiç desteklenmez`, `İki değer sorguya tek metin olarak geliyor; eşitlik karşılaştırması tutmuyor`, `Kategori tablosu ile Satislar ilişkisi tek yönlü`, `Parametrenin varsayılan değeri boş bırakılmış`], a: 1,
    why: `Elle yazılmış DAX'ta çoklu değer tek bir metin olarak gelir (“Elektronik,Kitap”); Kategori = @Kategori hiçbir satırda tutmaz. Değerleri birleştirip PATHCONTAINS ya da benzeri bir yöntemle ayırmak gerekir. Çoklu değer kullanılabilir; ilişki yönü ve varsayılan değer bu belirtiyi açıklamaz.` },
  { t: 'mc', q: `Bölge müdürleri her ayın ilk günü yalnızca önceki ayın satış listesini PDF olarak almak istiyor. Abonelik geçen ay elle “2024-11” olarak kurulmuştu ve bu ay yine Kasım geldi. Kalıcı çözüm?`,
    o: [`Her ay aboneliği açıp parametreyi elle değiştirmek`, `Raporu etkileşimli rapora çevirip pano aboneliği kurmak`, `Ay parametresinin varsayılanını “önceki ay” ifadesiyle hesaplamak`, `Aboneliği haftalık yapıp müdürlerin doğru haftayı seçmesi`], a: 2,
    why: `Varsayılan değeri ifadeyle hesaplanan bir parametre (bugünden bir ay önce), aboneliğin her çalışmada doğru ayı kullanmasını sağlar. Elle güncelleme unutulur; etkileşimli rapora geçmek sabit PDF ihtiyacını karşılamaz; haftalık gönderim işi kullanıcıya yükler.` },
  { t: 'query', q: `Bir parametre seçiminin sorguya etkisini dene: <b>Giyim, Spor ve Kozmetik</b> kategorileri seçilmiş gibi, her kanal (<code>Satislar[Kanal]</code>) için “Net Satış” döndür. Kategori seçimini TREATAS ile ver.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nSUMMARIZECOLUMNS(\n    Satislar[Kanal],\n    TREATAS({"Giyim", "Spor", "Kozmetik"}, Kategoriler[Kategori]),\n    "Net Satış", [Net Satış]\n)`, hint: `SUMMARIZECOLUMNS(Satislar[Kanal], TREATAS({...}, Kategoriler[Kategori]), "Net Satış", [Net Satış]).` },
  { t: 'query', q: `Fatura listesi veri kümesi yaz: <b>Web</b> kanalının <b>2024-11</b> ayındaki satış satırlarını; sipariş numarası (“Sipariş”), tarih (“Tarih”) ve tutar (“Tutar”) sütunlarıyla döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nCALCULATETABLE(\n    SELECTCOLUMNS(Satislar, "Sipariş", Satislar[SiparisNo], "Tarih", Satislar[Tarih], "Tutar", Satislar[Tutar]),\n    Satislar[Kanal] = "Web",\n    Tarih[YilAy] = "2024-11"\n)`, hint: `SELECTCOLUMNS ile üç sütunu seç; CALCULATETABLE içinde Satislar[Kanal] = "Web" ve Tarih[YilAy] = "2024-11" filtrelerini ver.` }
] });
