
/* ===================================================================== 5. GÜVENLİK */
ext('guvenlik', { min: 22, html: `
<h2>Dinamik RLS: kim, hangi satırı?</h2>
<p>Satış Müdürü Elif Doğan şunu istiyor: “Temsilcilerim yalnızca kendi satışlarını görsün. Ben ekibimin tamamını göreyim. Genel müdür her şeyi görsün.” Modelde <code>Satislar[TemsilciNo]</code> → <code>Calisanlar[CalisanNo]</code> ilişkisi ve <code>Calisanlar[Eposta]</code> sütunu zaten var. En basit dinamik rol tek satırlık bir tablo filtresidir:</p>
<pre class="dax" data-notry>-- Rol: "Temsilci", tablo: Calisanlar
Calisanlar[Eposta] = USERPRINCIPALNAME()</pre>
<p>Ece Kurt oturum açtığında <code>Calisanlar</code> tek satıra iner, filtre ilişki üzerinden <code>Satislar</code>'a akar. Bunu yayımlamadan önce aynı filtreyi bir ölçüyle taklit ederek doğrulayabilirsin:</p>
<pre class="dax">Ece Kurt Testi =
CALCULATE([Net Satış], Calisanlar[Eposta] = "ece.kurt@anadolumarket.com")</pre>
<p>Sonuç <b>146.836,45 ₺</b> olmalıdır; rapor “Farklı görüntüle” ile açıldığında kart bu sayıyı göstermiyorsa rol ya da ilişki hatalıdır. Dikkat edilecek üç ayrıntı:</p>
<ul>
<li><b>Boş e-posta:</b> Bu modelde Pınar Yıldırım, Defne Öztürk ve Kerem Yılmaz'ın <code>Eposta</code> değeri boş. Rolde olsalar bile <b>hiçbir şey görmezler</b>. Eşleşen satırı olmayan kullanıcı boş rapor görür; hata mesajı almaz.</li>
<li><b>Biçim:</b> <code>USERPRINCIPALNAME()</code> Service'te kullanıcının UPN'ini döndürür. Tabloda büyük/küçük harf ya da eski alan adı farkı varsa eşleşme kaçar. Konuk (B2B) kullanıcılarda değer <code>#EXT#</code> içeren bir biçimde gelebilir; gerçek bir konuk hesabıyla test et.</li>
<li><b>Boyutlar filtrelenmez:</b> Filtre <code>Calisanlar</code> → <code>Satislar</code> yönünde akar. <code>Musteriler</code> ve <code>Urunler</code> boyutlarının tüm satırları görünür kalır; temsilci tüm müşteri adlarını dilimleyicide görebilir. Bu kabul edilemezse müşteri tablosuna ayrı bir filtre gerekir.</li>
</ul>
<h3>Eşleme tablosu: bir kişi, birden çok bölge</h3>
<p>Bölge müdürlerinin birden çok bölgesi varsa <code>Yetkiler(Eposta, Bolge)</code> gibi bir eşleme tablosu kurulur. İki yol vardır:</p>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Nasıl?</th><th>Artı / eksi</th></tr>
<tr><td>İlişki + iki yönlü güvenlik filtresi</td><td>Yetkiler → Bolge boyutu ilişkisi, “Güvenlik filtresini iki yönde uygula”</td><td>Görsel olarak sade; ama iki yönlü filtre performansı düşürür ve bir tabloda yalnızca bir ilişkide açılabilir</td></tr>
<tr><td>İlişkisiz tablo + filtre ifadesi</td><td>Musteriler rolünde: bölge, kullanıcının bölgeleri içinde mi?</td><td>Tek yönlü, öngörülebilir; ifade biraz daha uzun</td></tr></table></div>
<pre class="dax" data-notry>-- Rol filtresi, tablo: Musteriler (Yetkiler tablosu ilişkisiz)
Musteriler[Bolge] IN
    CALCULATETABLE(VALUES(Yetkiler[Bolge]), Yetkiler[Eposta] = USERPRINCIPALNAME())</pre>

<h2>Yönetici hiyerarşisi: PATHCONTAINS</h2>
<p>Elif'in “ekibimin tamamını göreyim” isteği hiyerarşi ister. <code>Calisanlar[Yol]</code> sütunu <code>PATH(CalisanNo, YoneticiNo)</code> ile üretilmiştir: Ece Kurt için “1|2|9”. Rol filtresi, oturum açan kişinin numarasının satırın yolunda geçip geçmediğine bakar:</p>
<pre class="dax" data-notry>-- Rol: "Hiyerarşi", tablo: Calisanlar
PATHCONTAINS(
    Calisanlar[Yol],
    LOOKUPVALUE(Calisanlar[CalisanNo], Calisanlar[Eposta], USERPRINCIPALNAME())
)</pre>
<p>Analitik Müdürü Serkan Özdemir (4) için hangi satırların kalacağını bir sorguyla görebilirsin:</p>
<pre class="dax">EVALUATE
FILTER(
    SELECTCOLUMNS(Calisanlar, "Ad", Calisanlar[AdSoyad], "Unvan", Calisanlar[Unvan], "Yol", Calisanlar[Yol]),
    PATHCONTAINS([Yol], 4)
)</pre>
<p>Beş satır döner: Serkan ve dört ekip üyesi. Elif (2) için ise kendisi ve beş temsilci kalır; tüm satışlar bu ekipte olduğu için Elif <b>1.250.772,45 ₺</b>'nin tamamını görür, kendi adına kayıtlı satış yalnızca 183.134,35 ₺'dir. Kenar durumlar:</p>
<ul>
<li>E-posta tabloda yoksa <code>LOOKUPVALUE</code> BLANK döner, <code>PATHCONTAINS</code> hiçbir satırda doğru olmaz: kullanıcı boş rapor görür.</li>
<li>Aynı e-posta iki satırda varsa <code>LOOKUPVALUE</code> hata verir ve kullanıcının <b>tüm görselleri</b> bozulur. <code>Eposta</code> sütununda benzersizlik kontrolü yap.</li>
<li>Filtre 27 satırlık küçük bir tabloda değerlendirilir; ucuzdur. Aynı ifadeyi milyonlarca satırlık olgu tablosuna yazmak pahalıdır. RLS'yi her zaman <b>küçük boyut tablosunda</b> tanımla.</li>
</ul>

<h2>Birden çok rol: kesişim değil birleşim</h2>
<p>Ece hem “Temsilci” rolünde hem de bir kampanya için “Ege Bölgesi” rolünde olsun. Roller <b>toplanır</b>: Ece kendi satışlarını <b>ve</b> Ege bölgesinin tüm satışlarını görür, ikisinin kesişimini değil. Bu, en geniş rolün diğerlerini boşa çıkarması demektir. “Hem kendi satışları hem yalnızca Ege” gibi bir kesişim isteniyorsa iki koşul <b>tek bir rolün</b> ifadesinde birleştirilmelidir. Birleşim etkisini test etmek için iki temsilcinin görünümünü birlikte hesapla:</p>
<pre class="dax">İki Temsilci Birleşimi =
CALCULATE([Net Satış], Calisanlar[CalisanNo] = 9 || Calisanlar[CalisanNo] = 10)</pre>
<p>Ece (9) ve Can Aydın (10) birlikte 385.695,65 ₺ eder. Bir diğer kural: <b>RLS ve OLS farklı rollerden birleştirilemez</b>. Bir kullanıcı, birinde satır filtresi, diğerinde nesne gizleme olan iki role üyeyse sorgu anında hata alır. Nesne güvenliğini ve satır güvenliğini aynı rolde tanımla.</p>
<h3>OLS ve ölçüler</h3>
<p>OLS bir sütunu gizlediğinde o sütuna başvuran ölçüler de o rol için otomatik kısıtlanır: <code>Calisanlar[Maas]</code> gizlenirse <code>[Ortalama Maaş]</code>, <code>[Toplam Maaş]</code> ve <code>[Medyan Maaş]</code> da çalışmaz. Kullanıcı görselde “alan bulunamadı” türünde bir hata görür; bu yüzden OLS'li kullanıcılar için ayrı sayfa ya da rapor tasarla. OLS'yi Desktop'ta TMDL görünümünde ya da Tabular Editor gibi bir dış araçla tanımlarsın; rol üyeliği yine Service'te atanır.</p>

<h2>Test etmek: matrisle, kişiyle, sayıyla</h2>
<ul>
<li><b>Desktop:</b> Modelleme → <b>Farklı görüntüle</b> (View as): rolü seç, “Diğer kullanıcı” kutusuna e-postayı yaz. Dinamik RLS ancak böyle sınanır.</li>
<li><b>Service:</b> anlam modelinde <b>…</b> → <b>Güvenlik</b> (Security) → rolün yanındaki <b>…</b> → <b>Rol olarak test et</b> (Test as role). Belirli bir kişi ya da rol bileşimi seçilebilir. Panolar bu testte desteklenmez; sayfalandırılmış raporlarda ve SSO'lu DirectQuery modellerinde çalışmaz.</li>
</ul>
<div class="tbl-wrap"><table><tr><th>Test kullanıcısı</th><th>Rol</th><th>Beklenen Net Satış</th></tr>
<tr><td>ece.kurt@…</td><td>Temsilci</td><td>146.836,45 ₺</td></tr>
<tr><td>elif.dogan@…</td><td>Hiyerarşi</td><td>1.250.772,45 ₺</td></tr>
<tr><td>Pınar Yıldırım (e-posta yok)</td><td>Temsilci</td><td>Boş</td></tr>
<tr><td>Rolü olmayan bir Görüntüleyici</td><td>—</td><td>Boş</td></tr></table></div>
<p>Bu tabloyu bir test belgesi olarak modelin yanında tut; her model değişikliğinden sonra aynı kişilerle tekrar et.</p>

<h2>RLS'nin uygulanmadığı ve yanıltabildiği yerler</h2>
<ul>
<li><b>Çalışma alanı rolleri:</b> Yönetici, Üye ve Katkıda bulunan modeli düzenleyebildiği için RLS'den etkilenmez. Son kullanıcıları yalnızca Görüntüleyici olarak ekle ya da içerikleri uygulama ile dağıt. Derleme izni olan Görüntüleyiciler (Excel'de Çözümle dahil) RLS ile kısıtlı kalır.</li>
<li><b>Hizmet sorumlusu:</b> rollere eklenemez; uygulamaya gömülü senaryolarda kullanıcının kimliği yerleştirme belirtecinde (embed token) etkin kimlik olarak gönderilir (Yayımlama dersi).</li>
<li><b>ALL RLS'yi aşmaz:</b> <code>[Kategori Payı %]</code> gibi ölçülerde payda <code>ALL</code> ya da <code>REMOVEFILTERS</code> ile yazılmış olsa bile RLS filtresi geçerlidir. Ece'nin “kategori payı” kendi satışları içindeki paydır, şirket içindeki pay değil. Şirket geneli bir pay göstermek istiyorsan bu değeri ayrı ve onaylı bir yoldan (ör. RLS'siz bir özet tablo) sağlamak gerekir.</li>
<li><b>USERELATIONSHIP:</b> RLS açıkken beklenmedik hatalar verebilir. <code>[Teslime Göre Satış]</code> gibi pasif ilişki kullanan ölçüleri rol testine dahil et.</li>
<li><b>Performans:</b> iki yönlü güvenlik filtresi ve olgu tablosunda yazılmış karmaşık ifadeler her sorguya eklenir. Performans Analizi'ni “Farklı görüntüle” açıkken çalıştır; yönetici gözüyle hızlı olan sayfa temsilci gözüyle yavaş olabilir.</li>
</ul>
<div class="tip"><b>Kontrol listesi</b>Rol filtresi küçük boyut tablosunda mı? · E-posta sütunu benzersiz ve boş değer kontrolü yapıldı mı? · Konuk kullanıcı biçimi test edildi mi? · Roller birleşim olarak düşünüldü mü; RLS ve OLS aynı rolde mi? · Test kullanıcıları ve beklenen sayılar belgelendi mi? · Son kullanıcılar Görüntüleyici mi?</div>
`, ex: [
  { t: 'mc', q: `Veri Mühendisi Pınar Yıldırım “Temsilci” rolüne eklendi ama raporu açınca bütün görseller boş. Hata mesajı yok. En olası neden?`,
    o: [`Rol ifadesinde USERNAME() yerine USERPRINCIPALNAME() kullanılmış`, `Calisanlar tablosunda Pınar'ın e-posta değeri boş`, `Pınar çalışma alanında Katkıda bulunan rolünde`, `Pınar'ın Derleme izni olmadığı için`], a: 1,
    why: `Eşleşen satırı olmayan kullanıcı boş rapor görür; bu modelde Pınar'ın Eposta değeri boş. USERPRINCIPALNAME doğru fonksiyondur; Katkıda bulunan olsaydı RLS hiç uygulanmaz, her şeyi görürdü; Derleme izni rapor görüntülemeyi etkilemez.` },
  { t: 'mc', q: `Ece Kurt hem “Temsilci” (yalnızca kendi satışları) hem de “Ege Bölgesi” (Ege müşterilerinin tüm satışları) rolüne üye. Satış müdürü Ece'nin yalnızca Ege'deki kendi satışlarını görmesini istiyor. Ne yaparsın?`,
    o: [`İki rolü koruyup Ege rolüne öncelik veririm`, `Ece'yi Ege rolünden çıkarıp raporda Ege filtresi koyarım`, `Ece'ye RLS'yi aşmayan Görüntüleyici rolü veririm`, `İki koşulu tek bir rolde birleştirip Ece'yi yalnızca ona eklerim`], a: 3,
    why: `Roller toplanır; iki rol birleşim verir, kesişim değil. Kesişim için iki koşul tek bir rolün ifadesinde olmalı. Rollerin önceliği yoktur; rapor filtresi güvenlik değildir, kullanıcı kaldırabilir; Görüntüleyici zaten RLS'ye tabidir ve sorunu çözmez.` },
  { t: 'mc', q: `Ece raporda “Kategori Payı %” sütununda Elektronik için %21,9 görüyor; şirket genelinde bu pay %27,1. Ölçünün paydası ALL ile yazılmış. Ece neden farklı görüyor?`,
    o: [`RLS, ALL içeren paydada da geçerli; pay Ece'nin satışları içinde`, `ALL ilişki üzerinden çalışmadığı için payda eksik`, `Ece'nin önbelleği eski; yenileme gerekli`, `Kategori tablosunda Ece için ayrı RLS tanımlı`], a: 0,
    why: `ALL ya da REMOVEFILTERS RLS'yi aşmaz; payda da Ece'nin görebildiği satırlarla hesaplanır. Bu bir hata değil, RLS'nin doğal sonucudur. ALL ilişki sorunu değildir; önbellek ya da kategori RLS'si bu farkı açıklamaz.` },
  { t: 'mc', q: `Bir bölge müdürü çalışma alanına Üye olarak eklenmiş ve tüm bölgelerin satışlarını görebildiğini bildiriyor. Rol tanımı doğru. Ne yaparsın?`,
    o: [`Rol ifadesine Üye rolünü dışlayan bir koşul eklerim`, `Modeli Direct Lake'e taşırım; orada Üye de kısıtlanır`, `Kullanıcıyı Görüntüleyici yapar ya da uygulama ile erişim veririm`, `Bölge filtresini rapor düzeyinde kilitlerim`], a: 2,
    why: `Yönetici, Üye ve Katkıda bulunan modeli düzenleyebildiği için RLS onlara uygulanmaz. Son kullanıcı Görüntüleyici olmalı ya da içeriği uygulamadan almalı. DAX ifadesi çalışma alanı rolünü bilmez; depolama modu bu kuralı değiştirmez; rapor filtresi güvenlik değildir.` },
  { t: 'dax', name: 'Ece Kurt Görünümü (RLS Testi)', q: `<b>Ece Kurt Görünümü (RLS Testi)</b>: “Temsilci” rolünün Ece Kurt için yapacağı filtrelemeyi taklit eden ölçüyü yaz: <code>Calisanlar[Eposta]</code> değeri <code>ece.kurt@anadolumarket.com</code> olan satırlara göre net satış.`,
    sol: `CALCULATE([Net Satış], Calisanlar[Eposta] = "ece.kurt@anadolumarket.com")`, hint: `Rol filtresindeki USERPRINCIPALNAME() yerine e-postayı metin olarak yaz ve CALCULATE filtresi yap.` },
  { t: 'dax', name: 'Gamze ve Oğuz Birleşimi', q: `<b>Gamze ve Oğuz Birleşimi</b>: Gamze Özkan (CalisanNo 8) ile Oğuz Demir (CalisanNo 12) iki ayrı role üye bir kullanıcının göreceği birleşimi hesapla: ikisinin toplam net satışı.`,
    sol: `CALCULATE([Net Satış], Calisanlar[CalisanNo] = 8 || Calisanlar[CalisanNo] = 12)`, hint: `Roller birleşir: aynı sütunda VEYA koşulu. Calisanlar[CalisanNo] = 8 || Calisanlar[CalisanNo] = 12.` },
  { t: 'query', q: `“Hiyerarşi” rolünü Satış Müdürü Elif Doğan (CalisanNo 2) için test et: <code>Calisanlar</code> tablosundan yolunda 2 geçen çalışanların adını ve unvanını döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nFILTER(\n    SELECTCOLUMNS(Calisanlar, "Ad", Calisanlar[AdSoyad], "Unvan", Calisanlar[Unvan], "Yol", Calisanlar[Yol]),\n    PATHCONTAINS([Yol], 2)\n)`, hint: `SELECTCOLUMNS ile Ad, Unvan ve Yol sütunlarını seç; FILTER içinde PATHCONTAINS([Yol], 2).` }
] });

/* ===================================================================== 6. YAYIMLAMA */
ext('yayinlama', { min: 20, html: `
<h2>Çalışma alanı tasarımı</h2>
<p>Anadolu Market'te Satış, Finans ve İK raporları tek bir “BI” çalışma alanında toplanmış: 60 öğe, 40 Üye, kimin neyi değiştirdiği belli değil. Yeniden tasarımda iki ilke işe yarar: <b>modeli rapordan ayır</b> ve <b>yetkiyi gruba ver</b>.</p>
<div class="tbl-wrap"><table><tr><th>Çalışma alanı</th><th>İçerik</th><th>Kim, hangi rol?</th></tr>
<tr><td>Satış Modeli [Dev/Test/Prod]</td><td>Onaylı anlam modeli</td><td>BI ekibi: Üye · Rapor yazarları: modelde Derleme izni</td></tr>
<tr><td>Satış Raporları [Dev/Test/Prod]</td><td>Model üstüne kurulmuş raporlar</td><td>Rapor yazarları: Katkıda bulunan · Kimse son kullanıcı olarak eklenmez</td></tr>
<tr><td>(Uygulama)</td><td>Son kullanıcıya giden paket</td><td>Entra güvenlik grupları, kitle bazında</td></tr></table></div>
<p>Kişi yerine Microsoft Entra güvenlik gruplarını ekle; işe giren ve ayrılanlar grupta yönetilir. Çalışma alanının lisans türü (Pro, PPU, Fabric kapasitesi) görüntüleyicilerin lisansını da belirler: PPU çalışma alanındaki içeriği görmek için görüntüleyicinin de PPU'su olmalı; F64 ve üstü kapasitedeki içeriği ücretsiz lisanslı kullanıcılar görüntüleyebilir.</p>

<h2>Uygulama: çalışma alanı uygulaması ve kuruluş uygulaması</h2>
<p>Dağıtım için iki seçenek vardır. Klasik <b>çalışma alanı uygulaması</b> (workspace app) her çalışma alanında bir tanedir; değişiklikler “Uygulamayı güncelle” denene kadar kullanıcıya gitmez. Daha yeni olan <b>kuruluş uygulaması</b> (org app) ise bir Fabric öğesidir ve genel kullanıma açıktır (GA):</p>
<div class="tbl-wrap"><table><tr><th></th><th>Çalışma alanı uygulaması</th><th>Kuruluş uygulaması</th></tr>
<tr><td>Çalışma alanı başına</td><td>Bir</td><td>Birden çok</td></tr>
<tr><td>Değişiklik ne zaman görünür?</td><td>Uygulama güncellenince</td><td>Uygulama kaydedilince</td></tr>
<tr><td>Model erişimi</td><td>Yazar elle yönetir</td><td>Rapora erişim, modeline (başka çalışma alanında olsa da) erişim verir</td></tr>
<tr><td>Kurulum</td><td>Kullanıcı yükler</td><td>Gerekmez; Uygulamalar ve Son kullanılanlar listesinde görünür</td></tr>
<tr><td>Kitleler</td><td>Var</td><td>Var; düzenleme moduna girmeden yönetilir</td></tr></table></div>
<p><b>Kitle</b> (audience) senaryosu: “Temsilciler” kitlesi yalnızca Satış Performansı raporunu, “Yönetim” kitlesi ek olarak Kârlılık raporunu görür. Kitle bir <b>gezinme</b> düzenidir, güvenlik değildir: Kârlılık raporundaki marj sütununu temsilcilerden saklamak gerekiyorsa bunu RLS/OLS yapar, kitle değil.</p>

<h2>Abonelikler ve veri uyarıları</h2>
<ul>
<li><b>Abonelik:</b> rapor sayfasının e-posta anlık görüntüsü; günlük, haftalık ya da veri yenilendikten sonra. Raporun tamamını ek olarak (PDF/PowerPoint) gönderebilir. Başkaları adına abonelik kurulabilir; kiracı ayarlarında dış kullanıcılara gönderim ayrıca kapatılabilir. Sayfalandırılmış raporların abonelikleri parametre değerleriyle çalışır (Sayfalandırılmış raporlar dersi).</li>
<li><b>Veri uyarısı:</b> klasik uyarılar yalnızca <b>panodaki</b> kart, KPI ve gösterge kutucuklarında kurulur; rapor görselinde değil. Her kullanıcı kendi uyarısını kurar; Power Automate ile bir iş akışı tetiklenebilir.</li>
<li><b>Activator:</b> Fabric'te rapor görselinden “Uyarı ayarla” ile kural tabanlı uyarılar kurulabilir: “bir kategorinin günlük satışı geçen haftanın ortalamasının %30 altına düşerse ekibe Teams mesajı”.</li>
</ul>
<p>Bir uyarı ya da abonelik ancak verinin güncel olduğu kadar doğrudur. Bu yüzden her raporda bir <b>veri tazeliği</b> göstergesi olmalı. Basit bir yol, modeldeki en son satış tarihini kartta göstermektir:</p>
<pre class="dax">Veri Tazeliği (gün) =
DATEDIFF(CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS()), TODAY(), DAY)</pre>
<p>Yenileme durursa bu sayı her gün bir artar ve okur bunu fark eder; “Son yenileme” zaman damgası ise veri kaynağı güncellenmediğinde bile değişir ve yanıltabilir.</p>

<h2>Ağ geçidi ve yenileme sınırları</h2>
<div class="tbl-wrap"><table><tr><th></th><th>Pro (paylaşılan kapasite)</th><th>PPU / Premium / Fabric kapasitesi</th></tr>
<tr><td>Zamanlanmış yenileme</td><td>Günde 8 (API ile tetiklenenler dahil)</td><td>Günde 48; XMLA okuma-yazma ile komut dosyası yenilemeleri sabit sayıyla sınırlı değil</td></tr>
<tr><td>Yenileme zaman aşımı</td><td>2 saat</td><td>5 saat (XMLA ile aşılabilir)</td></tr>
<tr><td>“Şimdi yenile”</td><td colspan="2">Günlük sayıma dahil değil</td></tr></table></div>
<ul>
<li><b>Etkinlik yoksa duraklama:</b> modele bağlı rapor ya da pano iki ay boyunca hiç açılmazsa zamanlanmış yenileme duraklatılır ve sahibine e-posta gider.</li>
<li><b>Art arda hatalar:</b> yenileme defalarca başarısız olursa zamanlama kapatılır. Hata e-postasını kişisel kutuya değil, ekip dağıtım listesine yönlendir.</li>
<li><b>Ağ geçidi:</b> şirket içi ya da doğrudan erişilemeyen her kaynak için gerekir. Bir model yalnızca <b>bir</b> ağ geçidi bağlantısı kullanır; aynı sorguda şirket içi SQL ile SharePoint Online birleşiyorsa bulut kaynağı da ağ geçidi üzerinden tanımlanmalıdır. Kurumsal kullanımda standart mod; kişisel mod yalnızca tek kişinin yönettiği modeller için.</li>
<li><b>DirectQuery ve canlı bağlantı:</b> veri yenilemesi yoktur; ama pano kutucuklarının önbelleği varsayılan olarak saatte bir yenilenir.</li>
</ul>

<h2>Paylaşmak, uygulama ya da yerleştirme?</h2>
<div class="tbl-wrap"><table><tr><th>İhtiyaç</th><th>Yol</th><th>Dikkat</th></tr>
<tr><td>Üç kişiye hızlıca göster</td><td>Doğrudan paylaşım bağlantısı</td><td>“Yeniden paylaşabilir” ve “Derleyebilir” kutularını bilinçli seç</td></tr>
<tr><td>300 kişilik satış ekibine düzenli dağıtım</td><td>Uygulama + kitleler</td><td>Gruplarla erişim, RLS testi</td></tr>
<tr><td>Ekibin çalıştığı yerde göster</td><td>Teams sekmesi, SharePoint web bölümü</td><td>Kullanıcının rapora erişimi olmalı; RLS geçerli</td></tr>
<tr><td>Şirket içi bir portala göm</td><td>Kuruluşunuz için yerleştirme (kullanıcı kendi kimliğiyle)</td><td>Her kullanıcının lisansı ve erişimi gerekir</td></tr>
<tr><td>Müşterilere (Power BI hesabı olmayan) göster</td><td>Müşterileriniz için yerleştirme (uygulama verinin sahibi)</td><td>Hizmet sorumlusu RLS rolüne eklenemez; etkin kimlik yerleştirme belirtecinde gönderilir; kapasite gerekir</td></tr>
<tr><td>Herkese açık veri</td><td>Web'de yayımla</td><td>İnternetteki herkes görür; kurumsal veri için asla</td></tr></table></div>
<div class="tip"><b>Kontrol listesi</b>Model ve raporlar ayrı çalışma alanlarında mı? · Erişim gruplarla mı veriliyor? · Son kullanıcılar uygulama ile mi geliyor, çalışma alanı rolü almadan? · Yenileme sayısı ve süresi lisans sınırına uygun mu? · Hata bildirimleri ekip listesine gidiyor mu? · Raporda veri tazeliği göstergesi var mı?</div>
`, ex: [
  { t: 'mc', q: `Satış direktörü Pro çalışma alanındaki modelin günde 12 kez, iki saatte bir zamanlanmış olarak yenilenmesini istiyor. Zamanlama ekranında 8'den fazla saat eklenemiyor. Ne önerirsin?`,
    o: [`Ek yenilemeleri Power Automate ile REST API'den tetiklemek`, `İhtiyacı sorgulamak; gerçekten gerekiyorsa PPU ya da kapasiteye geçmek`, `Aynı modeli kopyalayıp iki ayrı zamanlama kurmak`, `“Şimdi yenile”yi bir kullanıcıya her iki saatte bir yaptırmak`], a: 1,
    why: `Pro'da günde 8 zamanlanmış yenileme sınırı API ile tetiklenenleri de kapsar. Önce iş ihtiyacını netleştir; gerçekten gerekiyorsa PPU/kapasite (48) ya da DirectQuery/Direct Lake. Model kopyalamak iki doğru kaynak üretir; elle yenileme sürdürülebilir değildir.` },
  { t: 'mc', q: `Yaz tatilinden dönen analist, kampanya modelinin zamanlanmış yenilemesinin “etkinlik olmadığı için” durdurulduğunu bildiren bir e-posta görüyor. Model iki aydır kimse tarafından açılmamış. Ne olmuştur?`,
    o: [`Kimlik bilgilerinin süresi dolduğu için yenileme durdu`, `Ağ geçidi çevrim dışı kaldığı için zamanlama silindi`, `İki ay kullanılmayan modelde yenileme duraklatıldı`, `Pro lisansının süresi dolduğu için model arşivlendi`], a: 2,
    why: `Modele bağlı rapor ya da pano iki ay açılmazsa Power BI zamanlanmış yenilemeyi duraklatır ve sahibine e-posta gönderir; raporu açmak ya da “Şimdi yenile” zamanlamayı sürdürür. Kimlik bilgisi ve ağ geçidi sorunları ayrı hata e-postası üretir; lisans süresi bu mesajı vermez.` },
  { t: 'mc', q: `Bir modelin tek sorgusu, şirket içindeki SQL Server'dan sipariş satırlarını ve SharePoint Online'daki bir Excel'den hedefleri birleştiriyor. Yenileme “veri kaynağı tanımlı değil” hatası veriyor. Doğru kurulum?`,
    o: [`İki kaynağı da aynı ağ geçidinde veri kaynağı olarak tanımlamak`, `SQL'i ağ geçidine, SharePoint'i doğrudan bulut bağlantısına bırakmak`, `SharePoint dosyası için kişisel modda ikinci bir ağ geçidi kurmak`, `Hedef Excel'ini OneDrive'a taşıyıp sorgudan ayırmak`], a: 0,
    why: `Model tek bir ağ geçidi bağlantısı kullanır; şirket içi ve bulut kaynakları aynı sorguda birleşiyorsa bulut kaynağı da o ağ geçidi üzerinden tanımlanmalıdır. İkinci ağ geçidi kullanılamaz; dosyayı OneDrive'a taşımak birleştirmeyi ortadan kaldırmaz.` },
  { t: 'mc', q: `Tek bir “Satış” çalışma alanından üç farklı departmana, her birinin kendi menüsü, erişim listesi ve bağımsız güncelleme takvimi olan üç ayrı paket dağıtmak istiyorsun. Hangisi?`,
    o: [`Tek çalışma alanı uygulaması ve üç kitle`, `Üç çalışma alanı açıp her birine bir uygulama`, `Raporları doğrudan paylaşım ile üç gruba göndermek`, `Aynı çalışma alanında üç ayrı kuruluş uygulaması`], a: 3,
    why: `Kuruluş uygulamaları öğe olduğu için bir çalışma alanında birden çok tane oluşturulabilir; her birinin erişimi ve kaydetme zamanı bağımsızdır. Tek uygulama + kitle tek güncelleme akışı demektir; üç çalışma alanı içeriği gereksiz böler; doğrudan paylaşım menü ve sürüm sağlamaz.` },
  { t: 'mc', q: `Bir yazılım şirketi, kendi portalında müşterilerine (Power BI hesabı yok) yalnızca kendi verilerini gösteren raporlar sunmak istiyor. Model RLS'li. Hangi kurgu doğru?`,
    o: [`Web'de yayımla ile üretilen bağlantıyı portala koymak`, `Müşteriler için yerleştirme, hizmet sorumlusu ve belirteçte etkin kimlik`, `Her müşteriye ücretsiz lisans verip doğrudan paylaşmak`, `Kuruluşunuz için yerleştirme ile kullanıcıların kendi kimliği`], a: 1,
    why: `Hesabı olmayan dış kullanıcılar için “uygulama verinin sahibi” yerleştirmesi kullanılır; hizmet sorumlusu rollere eklenemediği için müşterinin kimliği yerleştirme belirtecinde etkin kimlik olarak gönderilir ve RLS böyle uygulanır. Web'de yayımla herkese açıktır; diğer iki yol Power BI hesabı gerektirir.` },
  { t: 'dax', name: 'Son Veri Tarihi', q: `<b>Son Veri Tarihi</b>: Raporun veri tazeliği kartı için iptal edilmemiş satışların en son tarihini döndüren ölçüyü yaz. Kartta seçili yıl ya da kategoriye göre değişebilir.`,
    sol: `CALCULATE(MAX(Satislar[Tarih]), Satislar[Durum] <> "İptal")`, hint: `MAX(Satislar[Tarih]) ifadesini CALCULATE ile iptal filtresinin içine al.` }
] });
