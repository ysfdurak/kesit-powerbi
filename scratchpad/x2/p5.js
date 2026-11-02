
/* ===================================================================== 9. YAŞAM DÖNGÜSÜ */
ext('yasam-dongusu', { min: 22, html: `
<h2>Dal stratejisi: kim nerede çalışır?</h2>
<p>BI ekibi üç kişi: biri yeni RFM ölçüleri yazıyor, biri tarih tablosunu düzeltiyor, biri rapor sayfalarını yeniliyor. Hepsi aynı geliştirme çalışma alanına yayımlarsa son yayımlayan diğerlerinin işini ezer. Git tümleştirmesinde temel fikir şudur: <b>bir çalışma alanı bir dala bağlıdır</b>; dal değiştirmek, bağlı çalışma alanının içeriğini o dalın içeriğine göre güncellemektir.</p>
<div class="tbl-wrap"><table><tr><th>Strateji</th><th>Nasıl işler?</th><th>Ne zaman uygun?</th></tr>
<tr><td>Ana dal + Desktop'ta kısa özellik dalları</td><td>Geliştirici dalı yerelde açar, PBIP'i Desktop'ta düzenler, çekme isteği (pull request) açar; birleşince Dev çalışma alanı ana daldan güncellenir</td><td>Küçük ekipler; en yaygın başlangıç</td></tr>
<tr><td>Özellik dalı başına çalışma alanı</td><td>Kaynak denetimi panelinden “başka bir çalışma alanına dallan” ile dal ve ona bağlı bir çalışma alanı oluşur</td><td>Service'te test edilmesi gereken değişiklikler; Fabric öğeleriyle çalışan ekipler</td></tr>
<tr><td>Doğrudan ana dala işleme</td><td>Herkes Dev çalışma alanında çalışır, oradan işler (commit)</td><td>Tek kişilik ekip; kod incelemesi yok</td></tr></table></div>
<p>Git tümleştirmesi Azure DevOps, GitHub ve GitHub Enterprise'ın bulut sürümleriyle çalışır. Raporlar, anlam modelleri ve sayfalandırılmış raporlar Git tümleştirmesinde hâlâ <b>önizleme</b> etiketlidir; desteklenmeyen öğeler (ör. panolar) çalışma alanında kalır ama depoya yazılmaz. Desteklenmeyen öğe yok sayılır, silinmez.</p>
<h3>Çekme isteğinde neye bakılır?</h3>
<ul>
<li><b>TMDL farkları:</b> ölçünün ifadesi, biçim dizesi, görüntüleme klasörü, açıklama. Bir satırlık değişiklik bir satırlık fark olarak görünmelidir.</li>
<li><b>Gürültü:</b> diyagram yerleşimi dosyaları sık değişir ve çakışma üretir. Belgelenmemiş dosyalarda (ör. <code>diagramLayout.json</code>, <code>report.json</code>) elle değişiklik desteklenmez.</li>
<li><b>Yasak dosyalar:</b> <code>.pbi/cache.abf</code> (yerel veri önbelleği) ve <code>.pbi/localSettings.json</code> depoya girmemeli; Desktop'ın oluşturduğu <code>.gitignore</code> bunları zaten dışlar.</li>
</ul>

<h2>Git ve dağıtım işlem hatları birlikte</h2>
<p>Git <b>geliştirme</b> sürecini (kim neyi değiştirdi, inceleme, birleştirme), dağıtım işlem hattı ise <b>ortamlar arası taşıma</b> sürecini yönetir. Yaygın kurgu: Dev çalışma alanı Git'e bağlı; Test ve Prod çalışma alanları bir dağıtım işlem hattının aşamaları.</p>
<ul>
<li>İşlem hattı 2 ile 10 aşama arasında olabilir; varsayılan Geliştirme → Test → Üretim'dir.</li>
<li>Dağıtımda kaynak aşamadaki öğe, hedefte <b>eşleştiği</b> öğenin üzerine yazar. Eşleşmemiş ama aynı ad ve türde bir öğe hedefte varsa üzerine yazılmaz; kopya oluşur. Kaynakta olmayan hedef öğeler dokunulmadan kalır.</li>
<li><b>Dağıtım kuralları</b> ile Test'te test veritabanı, Üretim'de canlı veritabanı kullanılır (veri kaynağı ya da parametre kuralı).</li>
<li>Dağıtım meta veriyi taşır, veriyi değil. Import modelde yeni bir tablo eklendiyse hedefte yenileme ve kimlik bilgisi ayarı gerekir; RLS rol <b>üyelikleri</b> her ortamda ayrıca yönetilir.</li>
</ul>

<h2>Tabular Editor ve Best Practice Analyzer</h2>
<p>Best Practice Analyzer (BPA), modeli JSON olarak yazılmış kurallara göre tarar: “her ölçünün biçim dizesi olsun”, “olgu tablosundaki anahtarlar gizli olsun”, “IFERROR kullanma”, “bölmede DIVIDE kullan”, “çift yönlü ilişkiden kaçın”, “açıklaması olmayan ölçü kalmasın”. Kuralların bir kısmı otomatik düzeltme de önerir. Ekip kuralları depoda tutar; aynı kural seti hem geliştiricinin bilgisayarında hem de çekme isteğinde komut satırından çalışır ve kural ihlali birleştirmeyi durdurur.</p>
<p>Örnek bir ihlal ve düzeltilmiş hâli:</p>
<pre class="dax">Sipariş Başı Kâr (eski) =
IFERROR([Brüt Kâr] / [Sipariş Sayısı], 0)
Sipariş Başı Kâr =
DIVIDE([Brüt Kâr], [Sipariş Sayısı])</pre>
<p>Bu modelde iki ölçü kategori düzeyinde aynı sayıyı verir (Elektronik 596,97 ₺, Kitap 174,84 ₺). Fark kenar durumdadır: sipariş olmayan bir hücrede eski ölçü <b>0</b> döndürür ve satır matriste kalır; yeni ölçü BLANK döndürür, satır düşer. IFERROR ayrıca gerçek bir hatayı da 0'a çevirip saklar. BPA'nın bu kuralı bu yüzden yalnızca stil değil, doğruluk kuralıdır.</p>

<h2>Sürüm notları ve geri alma</h2>
<p>Üretime çıkan her değişikliğin üç sorusu olmalı: <b>Ne değişti?</b> (ölçü tanımı, biçim, yeni tablo) · <b>Kim etkileniyor?</b> (etki analizi: hangi raporlar, kaç görüntüleme) · <b>Nasıl test edildi?</b> (kırılım testi, RLS test kullanıcıları). Bunlar çekme isteği açıklamasına yazılır ve sürüm notu oradan derlenir. Kullanıcıya görünen bir iz bırakmak için modelde basit bir sürüm ölçüsü tutulabilir:</p>
<pre class="dax">Model Sürümü =
"2026.10-3"</pre>
<p>Raporun alt bilgisindeki bir kart bu değeri gösterir; destek talebinde kullanıcı “hangi sürümü görüyorum?” sorusuna cevap verir.</p>
<h3>Geri alma</h3>
<ol>
<li>Hatalı değişikliği Git'te geri al (revert) ve ana dala birleştir; geçmiş silinmez, yeni bir commit oluşur.</li>
<li>Dev çalışma alanını depodan güncelle (update).</li>
<li>İşlem hattında Test'e, sonra Üretim'e yeniden dağıt. Gerekirse yenile.</li>
</ol>
<p>Bu zincir, “dünkü .pbix dosyası kimdeydi?” sorusunu ortadan kaldırır. Ama geri alma, verideki değişikliği geri almaz: yanlış bir Power Query adımı yüzünden yüklenmiş veri, düzeltilmiş tanımla yeniden yenilenmelidir.</p>
<h3>PBIP'in sınırları</h3>
<ul>
<li>Duyarlılık etiketleri desteklenmez; etiketli içerik için süreci ayrıca düşün (Yönetişim dersi).</li>
<li>PBIP doğrudan OneDrive ya da SharePoint'e kaydedilemez. Windows'un 260 karakterlik yol sınırına takılmamak için depo kökünü kısa tut.</li>
<li>Dosyalar BOM'suz UTF-8'dir ve Desktop CRLF satır sonu kullanır; Git'te <code>autocrlf</code> ayarını ekipçe aynı yap.</li>
<li>Desktop'tan yayımlamak yerel önbelleği (veriyi) de gönderir; Git ya da işlem hattıyla dağıtım yalnızca meta veriyi taşır.</li>
</ul>
<div class="tip"><b>Kontrol listesi</b>Dev çalışma alanı Git'e, Test/Prod işlem hattına bağlı mı? · .gitignore önbelleği dışlıyor mu? · BPA kuralları depoda ve çekme isteğinde çalışıyor mu? · Dağıtım kuralları her aşamada doğru kaynağı gösteriyor mu? · Sürüm notu üç soruyu cevaplıyor mu? · Geri alma adımları denendi mi?</div>
`, ex: [
  { t: 'mc', q: `İki geliştirici aynı Dev çalışma alanında çalışıyor ve sık sık birbirinin ölçülerini eziyor. Ekip Git tümleştirmesini açtı ama sorun sürüyor; ikisi de doğrudan Dev'den işleme yapıyor. Ne önerirsin?`,
    o: [`Her geliştiricinin özellik dalında çalışıp çekme isteğiyle birleştirmesi`, `Dev çalışma alanını iki ayrı çalışma alanına bölüp iki modele ayırmak`, `Git'i kapatıp yalnızca dağıtım işlem hattı kullanmak`, `Geliştiricilere sırayla yayımlamaları için takvim vermek`], a: 0,
    why: `Çakışmanın kaynağı, iki kişinin aynı dalda doğrudan çalışması. Özellik dalları ve çekme isteği değişiklikleri ayrı tutar, incelemeyi ve birleştirmeyi Git'e bırakır. Modeli bölmek tek doğru kaynağı bozar; işlem hattı ortam taşır, eşzamanlı geliştirmeyi çözmez; takvim ölçeklenmez.` },
  { t: 'mc', q: `Test aşamasına dağıtılan yeni modelde raporlar açılıyor ama yeni eklenen <code>SatinAlmalar</code> tablosu boş görünüyor. Dev'de dolu. En olası neden?`,
    o: [`Dağıtım kuralı tabloyu filtreliyor`, `Tablo Git'te önizleme olduğu için taşınmadı`, `Dağıtım veriyi taşımaz; Test'te yenileme yapılmadı`, `RLS rolleri Test'e kopyalanmadığı için`], a: 2,
    why: `İşlem hattı meta veriyi taşır, veriyi değil. Yeni tablonun Test'te dolması için o aşamada yenileme (ve gerekirse kimlik bilgisi) gerekir. Dağıtım kuralları kaynak/parametre değiştirir, satır filtrelemez; Git önizleme durumu işlem hattını etkilemez; rol eksikliği tabloyu boşaltmaz.` },
  { t: 'mc', q: `Çekme isteği incelemesinde, tek bir ölçünün biçimini değiştiren bir değişiklikte 4 MB'lık <code>cache.abf</code> dosyasının da depoya eklendiği görülüyor. Ne yaparsın?`,
    o: [`Dosyayı bırakırım; modeli açmak için gerekli`, `Dosyayı çıkarıp .gitignore'un önbelleği dışladığından emin olurum`, `Dosyayı ayrı bir dala taşırım`, `Dosyayı sıkıştırıp tekrar eklerim`], a: 1,
    why: `cache.abf yerel veri önbelleğidir; depoya girmemelidir (hem boyut hem de veri sızıntısı riski). Desktop'ın varsayılan .gitignore'u bunu dışlar; muhtemelen silinmiş ya da değiştirilmiştir. Model meta veriden açılır, önbelleğe ihtiyaç duymaz; ayrı dal ya da sıkıştırma sorunu çözmez.` },
  { t: 'mc', q: `Üretimdeki Net Satış tanımı dün yanlış değiştirildi ve aylık raporlar hatalı. Değişiklik Git'te tek bir commit. En güvenli geri alma sırası?`,
    o: [`Üretim çalışma alanında ölçüyü elle düzeltmek`, `Dünkü .pbix dosyasını bulup Üretim'e yayımlamak`, `Test'ten Üretim'e eski sürümü elle kopyalamak`, `Commit'i geri alıp Dev'i güncellemek, Test ve Üretim'e dağıtmak`], a: 3,
    why: `Git'te revert yeni bir commit olarak izlenir; Dev güncellenir ve işlem hattıyla aynı yol izlenerek Üretim'e gider. Üretimde elle düzeltme Git ile çelişen bir durum yaratır ve bir sonraki dağıtımda ezilir; eski .pbix aradaki diğer değişiklikleri kaybettirir; elle kopyalama izlenebilir değildir.` },
  { t: 'mc', q: `BPA çalıştırınca “IFERROR kullanmayın” kuralı 14 ölçüde ihlal veriyor. Bir geliştirici “sonuçlar aynı, kuralı kapatalım” diyor. En iyi cevap?`,
    o: [`Haklı; IFERROR yalnızca stil sorunudur`, `Kuralı kapatmak yerine ihlalleri tek tek uyarıya çevirmek`, `IFERROR'u ISERROR ile değiştirmek yeterli`, `Kuralı tut; DIVIDE ile düzelt, boş hücre ve gizli hata farkını test et`], a: 3,
    why: `IFERROR satır satır hata yakalar, gerçek hataları saklar ve boş yerine 0 döndürerek fazladan satırlar üretebilir. DIVIDE ile düzeltip kenar durumu (sipariş olmayan hücre) test etmek doğrudur. ISERROR aynı maliyeti taşır; kuralı uyarıya indirmek sorunu ertelemektir.` },
  { t: 'dax', name: 'Sipariş Başı Adet (BPA)', q: `<b>Sipariş Başı Adet (BPA)</b>: Eski ölçü <code>IFERROR([Satılan Adet] / [Sipariş Sayısı], 0)</code> idi. BPA kuralına uygun, sıfıra bölmede BLANK döndüren hâlini yaz.`,
    sol: `DIVIDE([Satılan Adet], [Sipariş Sayısı])`, hint: `DIVIDE(pay, payda) sıfıra bölmede BLANK döner; IFERROR gerekmez.` }
] });

/* ===================================================================== 10. M DİLİ */
ext('m-dili', { min: 20, html: `
<h2>Değerler: kayıt, liste, tablo</h2>
<p>Power Query'de her adım bir <b>değer</b> üretir. Gelişmiş Düzenleyici'de (Advanced Editor) kodu okuyabilmek için dört temel değer türünü ve onlara erişimi tanımak yeter:</p>
<pre class="m">let
    Liste    = {"Web", "Mobil", "Mağaza"},               // liste: sıralı değerler
    Kayit    = [Ad = "Ece Kurt", Sehir = "İzmir"],       // kayıt: ad = değer çiftleri
    Tablo    = #table({"Kanal", "Pay"}, {{"Web", 0.37}, {"Mobil", 0.48}}),
    Ilk      = Liste{0},            // "Web"   — listede konum (0'dan başlar)
    Ad       = Kayit[Ad],           // "Ece Kurt" — kayıtta alan
    IlkSatir = Tablo{0},            // kayıt: [Kanal = "Web", Pay = 0.37]
    Kanallar = Tablo[Kanal],        // liste: {"Web", "Mobil"}
    Guvenli  = Kayit[Telefon]?      // alan yoksa hata yerine null
in
    Guvenli</pre>
<p>Bir tablo, aynı alanlara sahip kayıtların listesi gibi düşünülebilir: <code>Tablo{0}</code> bir kayıt, <code>Tablo[Kanal]</code> bir listedir. <code>?</code> işareti erişimi “isteğe bağlı” yapar: <code>Liste{10}?</code> ve <code>Kayit[Telefon]?</code> hata yerine <code>null</code> döndürür. Kaynaktan gelen sütun bazen yoksa (ör. CRM dışa aktarımı yeni bir sürümde sütunu kaldırdıysa) bu küçük işaret sorgunun tamamen çökmesini önler.</p>

<h2>let/in: sıra değil, bağımlılık</h2>
<p><code>let</code> içindeki adlar bir tarif listesidir; <b>yukarıdan aşağı çalıştırılmaz</b>. M tembel (lazy) değerlendirir: <code>in</code> sonrasındaki değer hangi adlara ihtiyaç duyuyorsa yalnızca onlar hesaplanır. Bunun iki pratik sonucu var:</p>
<ul>
<li><b>Hata ayıklama:</b> <code>in</code> satırına ara bir adımın adını yazarak o adımın sonucunu görebilirsin. Uygulanan Adımlar bölmesinde bir adıma tıklamak da bunu yapar.</li>
<li><b>Kullanılmayan adım çalışmaz:</b> bir adımdaki hata, sonuca giden yolda değilse sorguyu durdurmaz. Ama aynı adımı bir sonraki adım kullanmaya başladığı anda hata ortaya çıkar.</li>
</ul>
<p>Boşluk ya da Türkçe karakter içeren adım adları <code>#"Değiştirilen Tür"</code> biçiminde yazılır. Arayüz bu adları kendisi üretir; elle yazarken kısa ve boşluksuz adlar (<code>Turler</code>, <code>Filtre</code>) kodu okunur kılar.</p>

<h2>each ve _: kısa fonksiyon yazımı</h2>
<p><code>each</code>, tek parametreli bir fonksiyonun kısaltmasıdır: <code>each [Adet] * [Fiyat]</code> = <code>(_) =&gt; _[Adet] * _[Fiyat]</code>. Köşeli parantez içindeki alan adı, <code>_</code> değerinin alanıdır. <code>_</code> ne olduğuna göre değişir:</p>
<div class="tbl-wrap"><table><tr><th>Fonksiyon</th><th><code>_</code> nedir?</th><th>Örnek</th></tr>
<tr><td><code>Table.SelectRows</code>, <code>Table.AddColumn</code></td><td>Satırın kaydı</td><td><code>each [Kanal] = "Web"</code></td></tr>
<tr><td><code>Table.TransformColumns</code></td><td>Hücrenin değeri</td><td><code>each Text.Proper(_)</code></td></tr>
<tr><td><code>List.Transform</code>, <code>List.Select</code></td><td>Listenin elemanı</td><td><code>each _ * 1.2</code></td></tr></table></div>
<pre class="m">let
    Kaynak   = Satislar,
    Secili   = Table.SelectRows(Kaynak, each List.Contains({"Web", "Mobil"}, [Kanal])),
    Etiketli = Table.AddColumn(Secili, "Bant",
                 each if [Tutar] &gt;= 2000 then "Büyük" else if [Tutar] &gt;= 500 then "Orta" else "Küçük",
                 type text)
in
    Etiketli</pre>
<p>İç içe <code>each</code> yazınca iki <code>_</code> çakışır: içteki dıştakini gölgeler. Böyle durumlarda açık adlı fonksiyon yaz: <code>(satir) =&gt; List.Select(Liste, (x) =&gt; x &gt; satir[Esik])</code>.</p>

<h2>Özel fonksiyon ve parametreli kaynak</h2>
<p>Satın alma ekibi her tedarikçi için ayrı Excel gönderiyor; dosyaların yapısı aynı. Aynı temizliği 8 kez yazmak yerine bir fonksiyon yazılır ve dosya listesinin her satırına uygulanır. “Klasörden birleştir” komutu bunu kendiliğinden yapar: bir <i>örnek dosyayı dönüştür</i> sorgusu ve ondan türetilen bir fonksiyon üretir; temizliği örnek sorguda yaptığında fonksiyon da güncellenir.</p>
<pre class="m">// fxTedarikciTemizle
(Dosya as binary, Tedarikci as text) as table =&gt;
let
    Sayfa  = Excel.Workbook(Dosya, null, true){[Item = "Siparis", Kind = "Sheet"]}[Data],
    Baslik = Table.PromoteHeaders(Sayfa, [PromoteAllScalars = true]),
    Turler = Table.TransformColumnTypes(Baslik, {{"Tarih", type date}, {"Tutar", type number}}, "tr-TR"),
    Etiket = Table.AddColumn(Turler, "Tedarikci", each Tedarikci, type text)
in
    Etiket</pre>
<p><b>Parametreli kaynak:</b> sunucu ve veritabanı adlarını Parametreleri yönet ile <code>SunucuAdi</code>, <code>VeritabaniAdi</code> parametrelerine al: <code>Sql.Database(SunucuAdi, VeritabaniAdi)</code>. Dağıtım işlem hattındaki parametre kuralları Test'te test sunucusunu, Üretim'de canlı sunucuyu seçer (Yaşam döngüsü dersi). Kenar durum: farklı kaynakları birleştiren sorgularda gizlilik düzeyleri uyuşmazsa <code>Formula.Firewall</code> hatası çıkar; kaynakları ayrı hazırlık (staging) sorgularına ayırmak ya da gizlilik düzeylerini doğru tanımlamak gerekir.</p>

<h2>Hata yönetimi: try, otherwise, catch</h2>
<p>İki tür hata vardır. <b>Adım düzeyinde hata</b> (dosya yok, sütun yok) sorgunun tamamını durdurur. <b>Hücre düzeyinde hata</b> (bir tarih çevrilemedi) yalnızca o hücreyi Error yapar; yüklemede o hücre boş gelir ve hata raporu oluşur. <code>try</code> her ikisini de bir kayda çevirir:</p>
<pre class="m">let
    Kaynak = Musteri,
    Denendi = Table.AddColumn(Kaynak, "Deneme", each try Date.FromText([KayitTarihi], [Culture = "tr-TR"])),
    // Deneme: [HasError = false, Value = ...]  ya da  [HasError = true, Error = [Reason, Message, Detail]]
    Tarih  = Table.AddColumn(Denendi, "KayitTarihiTemiz", each if [Deneme][HasError] then null else [Deneme][Value], type nullable date),
    Neden  = Table.AddColumn(Tarih, "HataNedeni", each if [Deneme][HasError] then [Deneme][Error][Message] else null, type nullable text),
    Sonuc  = Table.RemoveColumns(Neden, {"Deneme"})
in
    Sonuc</pre>
<ul>
<li><code>try … otherwise null</code> kısa yoldur ama nedeni kaybeder. Kalite raporu gerekiyorsa yukarıdaki gibi <b>neden sütunu</b> tut; “2024-02-30” gibi hatalı satırlar sessizce kaybolmasın.</li>
<li><code>try … catch (e) =&gt; …</code> yazımı hata kaydını doğrudan bir fonksiyona verir: <code>try Number.From([Tutar]) catch (e) =&gt; if e[Message] = "…" then 0 else null</code>.</li>
<li>Kendi hatanı da üretebilirsin: <code>error "Beklenen Tutar sütunu yok"</code>. Kaynak beklenmedik biçimde değiştiğinde sessizce yanlış veri yüklemektense yenilemenin açık bir mesajla durması iyidir.</li>
</ul>

<h2>Sorgu katlama ile ilişkisi</h2>
<p>Bir SQL kaynağında adımlar mümkün olduğunca tek bir SQL sorgusuna çevrilir (sorgu katlama, query folding). M yazım biçimin bunu doğrudan etkiler:</p>
<div class="tbl-wrap"><table><tr><th>Adım</th><th>Çoğu SQL kaynağında</th></tr>
<tr><td>Satır filtresi, sütun seçme/kaldırma, gruplama, aynı kaynaktaki birleştirme</td><td>Katlanır</td></tr>
<tr><td>Satır başına <code>try … otherwise</code>, özel fonksiyon çağrısı, <code>Table.Buffer</code></td><td>Katlanmaz; sonraki adımlar da yerelde çalışır</td></tr>
<tr><td>Dizin sütunu ekleme, bazı metin fonksiyonları (ör. her sözcüğün ilk harfi)</td><td>Genellikle katlanmaz</td></tr></table></div>
<p>Kural: <b>katlanan adımları başa, katlanmayanları sona</b> koy. Adıma sağ tıklayıp <b>Yerel sorguyu görüntüle</b> (View Native Query) seçeneğinin açık olması, o adıma kadar katlandığını gösterir. Artımlı yenilemedeki <code>RangeStart</code>/<code>RangeEnd</code> filtresinin katlanması özellikle kritiktir; o filtreden önce katlamayı bozan bir adım varsa her bölüm için kaynağın tamamı okunur.</p>
<div class="tip"><b>Kontrol listesi</b>Adım adları okunur mu? · Hatalar null'a gömülmek yerine neden sütununda mı? · Kaynak adresleri parametrede mi? · Katlamayı bozan adımlar sonda mı? · Tekrarlanan temizlik fonksiyona alındı mı?</div>
`, ex: [
  { t: 'mc', q: `CRM dışa aktarımının yeni sürümünde <code>Telefon</code> sütunu bazen gelmiyor ve sorgu “alan bulunamadı” hatasıyla tamamen duruyor. Sütun yoksa null yeterli. Hangi yazım?`,
    o: [`Table.AddColumn(t, "Tel", each [Telefon]?)`, `Table.AddColumn(t, "Tel", each [Telefon] ?? 0)`, `Table.AddColumn(t, "Tel", each Text.From([Telefon]))`, `Table.SelectColumns(t, {"Telefon"})`], a: 0,
    why: `Alan erişiminden sonra gelen ? işareti alanı isteğe bağlı yapar; alan yoksa hata yerine null döner. ?? birleştirme işleci yalnızca değer null olduğunda devreye girer, olmayan alan hatasını önlemez. Text.From ve SelectColumns olmayan sütunda yine hata verir.` },
  { t: 'mc', q: `<code>Table.TransformColumns(t, {{"Şehir", each Text.Proper([Şehir])}})</code> yazdın ve her hücrede hata aldın. Neden?`,
    o: [`Text.Proper Türkçe karakterleri desteklemez`, `Burada _ hücrenin değeridir; [Şehir] alanı yok, Text.Proper(_) yazılmalı`, `TransformColumns yalnızca sayısal sütunlarda çalışır`, `Sütun adında Türkçe karakter olduğu için #"Şehir" yazılmalı`], a: 1,
    why: `TransformColumns'ta each içindeki _ satırın kaydı değil, hücrenin değeridir; değerin [Şehir] alanı olmadığı için hata çıkar. Doğrusu each Text.Proper(_). Türkçe karakter ne fonksiyonda ne sütun adında sorun değildir (sütun adı metin olarak verilmiş).` },
  { t: 'mc', q: `Kalite ekibi, kayıt tarihi çevrilemeyen müşterilerin <b>neden</b> çevrilemediğini görmek istiyor. Şu an <code>try … otherwise null</code> kullanılıyor. Ne değiştirirsin?`,
    o: [`otherwise null yerine otherwise #date(1900, 1, 1) yazarım`, `Hatalı satırları Hataları kaldır ile atarım`, `try sonucunu kayıt olarak tutup HasError ve Error[Message] alanlarını sütunlara açarım`, `Sütunun türünü metin bırakıp tarih dönüşümünü DAX'ta yaparım`], a: 2,
    why: `try tek başına [HasError, Value/Error] kaydı döndürür; Error[Message] nedeni taşır. otherwise nedeni kaybeder; 1900 sahte tarihi raporu yanıltır; hataları silmek veriyi kaybettirir; DAX'a taşımak modele kirli metin taşır ve nedeni yine göstermez.` },
  { t: 'mc', q: `SQL kaynağından gelen sorguda adımlar: Kaynak → satır başına özel fonksiyonla müşteri adı temizleme → son 2 yıl filtresi → sütun kaldırma. Yenileme çok yavaş. İlk düzeltme?`,
    o: [`Özel fonksiyonu Table.Buffer ile sarmak`, `Filtreyi ve sütun kaldırmayı fonksiyondan önceye almak`, `Sorguyu DirectQuery moduna çevirmek`, `Gizlilik düzeyini Genel yapmak`], a: 1,
    why: `Satır başına özel fonksiyon katlamayı bozar ve sonraki adımlar yerelde çalışır: tüm tablo indirilip sonra filtrelenir. Katlanan filtre ve sütun kaldırmayı başa almak kaynağa daha az satır ve sütun sordurur. Table.Buffer katlamayı yine bozar; DirectQuery ve gizlilik düzeyi bu sıralama sorununu çözmez.` },
  { t: 'pq', src: 'musteri', pre: [{ op: 'promote', cols: [] }], sol: [{ op: 'type', cols: ['KayitTarihi'], to: 'date' }, { op: 'replaceErr', cols: ['KayitTarihi'], v: 'null' }],
    q: `<b>try … otherwise null'ı arayüzle kur.</b> İlk satır zaten başlık yapıldı. <code>KayitTarihi</code> sütununu tarihe çevir; “2024-02-30” gibi geçersiz tarihte oluşan hatayı <code>null</code> ile değiştir. Satır sayısı değişmemeli (6 satır). Sonra Gelişmiş Düzenleyici'de üretilen <code>Table.ReplaceErrorValues</code> satırını oku.`,
    hint: `KayitTarihi'ni seç → Veri türü: Tarih → Hataları değiştir: null. Hataları kaldır kullanma; satır sayısı azalır.` }
] });

})(window);
