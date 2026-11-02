/* ───────────────────────── 3. Dashboard tasarımı ───────────────────────── */
ext('dashboard-tasarim', { min: 15, html: `
<h2>Bilgi hiyerarşisi: üç soru, üç katman</h2>
<p>Genel müdür pazartesi toplantısında rapora 30 saniye bakacak. Bu sürede iki soruya cevap almalı: “Hedefin neresindeyiz?” ve “Sorun nerede?” Tasarımın işi, gözün bu iki cevaba ilk önce gitmesini sağlamaktır.</p>
<div class="tbl-wrap"><table><tr><th>Katman</th><th>Soru</th><th>Anadolu Market örneği (2024)</th><th>Nerede durur?</th></tr>
<tr><td>1. Durum</td><td>İyi mi, kötü mü?</td><td>Net satış 747.066 ₺, hedefin %97,9'u</td><td>Sol üst şerit, en büyük yazı</td></tr>
<tr><td>2. Neden</td><td>Fark nereden geliyor?</td><td>Hediye %83,6 ile en geride; Kitap %100,2</td><td>Orta bölge: kategori × hedef, aylık eğilim</td></tr>
<tr><td>3. Ayrıntı</td><td>Hangi ürün, hangi müşteri?</td><td>Hediye ürünleri, iade oranı, son 12 ay</td><td>Detay sayfası, araç ipucu</td></tr></table></div>
<p>Görsel ağırlığı üç şey belirler: <b>boyut</b>, <b>konum</b> ve <b>kontrast</b>. Bir sayfada yalnızca bir öğe “en ağır” olmalı. İki büyük grafik yan yana durursa göz ikisi arasında gidip gelir ve hiyerarşi kaybolur. Hızlı test: sayfayı bulanıklaştırılmış hâlde düşün. Hâlâ seçilebilen tek bir blok kalıyorsa hiyerarşi doğrudur.</p>

<h2>Izgara sistemi: piksele kadar plan</h2>
<p>16:9 tuval 1280 × 720 pikseldir. 12 sütunlu bir ızgara kur: dış kenar boşluğu 24 px, sütun arası 16 px. Bir sütun (1280 − 2 × 24 − 11 × 16) ÷ 12 = 88 px olur.</p>
<div class="tbl-wrap"><table><tr><th>Öğe</th><th>Sütun</th><th>Genişlik</th></tr>
<tr><td>KPI kartı (4 adet yan yana)</td><td>3</td><td>3 × 88 + 2 × 16 = 296 px</td></tr>
<tr><td>Ana grafik</td><td>8</td><td>8 × 88 + 7 × 16 = 816 px</td></tr>
<tr><td>Yan grafik</td><td>4</td><td>4 × 88 + 3 × 16 = 400 px</td></tr></table></div>
<p>Dört kart ve üç aralık tam 1.232 px eder: 1280'den iki kenar boşluğu çıkınca kalan genişlik. Görünüm (View) sekmesinde Kılavuz çizgileri (Gridlines) ve Izgaraya yasla (Snap to grid) açılır. Kesin değerler Biçim bölmesinde Genel → Özellikler → Boyut ve Konum alanlarına elle girilir. Ekipte herkes aynı ızgarayı kullansın diye ızgarayı ve başlık şeridini içeren boş bir şablon sayfası hazırla, her yeni sayfayı ondan çoğalt.</p>

<h2>Sayfa mimarisi: ne nerede açılır?</h2>
<p>Kademeli açıklamanın düğme, panel ve alan parametresi teknikleri Kullanıcı odaklı tasarım dersinde; yer imi, araç ipucu ve detay sayfasının kurulumu Raporla hikâye anlatmak dersinde. Burada karar kısmına bakıyoruz: bir bilgi hangi mekanizmaya gider?</p>
<div class="tbl-wrap"><table><tr><th>Kullanıcı bunu…</th><th>Mekanizma</th><th>Kural</th></tr>
<tr><td>her açılışta görmeli</td><td>Ana sayfa görseli</td><td>Bütçeden yer kaplar; gerçekten gerekli mi?</td></tr>
<tr><td>bir noktanın üstünde merak eder</td><td>Araç ipucu sayfası</td><td>Tek soru, 2–3 küçük görsel, hızlı açılmalı</td></tr>
<tr><td>tek bir varlık için derine iner</td><td>Detay sayfası (drillthrough)</td><td>Bir kategori, bir müşteri; geri düğmesi zorunlu</td></tr>
<tr><td>aynı soruya başka açıdan bakar</td><td>Alan parametresi ya da yer imi</td><td>Görsel değişimi için önce alan parametresi</td></tr></table></div>
<p>Tipik bir yönetici raporu: 1 özet sayfası, 2–3 analiz sayfası, 1–2 detay sayfası, 1–2 araç ipucu sayfası. Yardımcı sayfaları gizle ve adlarına önek ver (“İP_Kategori”, “DS_Ürün”). Böylece ekip arkadaşın sayfa listesinde neyin ne olduğunu bir bakışta anlar.</p>
<div class="warn"><b>Anti-kalıp: yer imi yığını</b>Görsel değiştirmek için 12 yer imi kuran bir rapor, her yeni görselde 12 yer iminin yeniden güncellenmesini ister. Ayrıca “Veri” seçeneği açık bırakılan yer imleri dilimleyici seçimini de kaydeder; kullanıcı düğmeye bastığında kendi seçimi sıfırlanır. Görsel değiştirmeyi alan parametresiyle yap; yer imlerinde yalnızca “Görüntüle” durumunu tut.</div>

<h2>Performans bütçesi</h2>
<p>Her veri görseli en az bir sorgu gönderir. Sayfa açılırken bu sorgular paralel çalışır ama sınırsız değildir; ayrıca her görsel ayrıca çizilir. Bu yüzden görsel sayısı bir bütçedir:</p>
<ul>
<li><b>Özet sayfası:</b> en fazla 8–10 veri görseli. Dört ayrı kart yerine birden çok değeri tek görselde gösteren bir kart düşün.</li>
<li><b>Ayrıntı tablosu:</b> özet sayfasında nadiren kullanılıyorsa detay sayfasına taşı. En pahalı görsel çoğunlukla çok satırlı tablodur.</li>
<li><b>Ölç, tahmin etme:</b> Performans Analizi'nde (Performance Analyzer) her görselin DAX sorgusu ve görsel çizim süresini ayrı ayrı gör. Sorgu yavaşsa sorun DAX'ta ya da modelde; çizim yavaşsa görsel sayısında ya da görsel türündedir.</li>
</ul>

<h2>Durum rengi ve dinamik başlık</h2>
<p>Koşullu biçimlendirmede renk kurallarını görselde tek tek tanımlamak yerine rengi bir ölçüye taşı. Kural tek yerde durur; kart, tablo ve madde grafiği aynı eşiği kullanır.</p>
<pre class="dax">KPI Durum Rengi =
VAR Oran = [Hedef Gerçekleşme %]
RETURN
    SWITCH(
        TRUE(),
        ISBLANK(Oran), "#8A8A8A",
        Oran &gt;= 1, "#1B7F3B",
        Oran &gt;= 0.95, "#B26A00",
        "#B42318"
    )</pre>
<p>Biçim bölmesinde renk alanının yanındaki <b>fx</b> düğmesi → Biçim stili: Alan değeri → bu ölçü. 2024'te sonuç turuncu (%97,9), Hediye kırmızı (%83,6).</p>
<p><b>Kenar durum: yuvarlama.</b> 2023 oranı %99,6. Kart “%0” ondalıkla biçimlenmişse ekranda “%100” yazar ama renk turuncu kalır. Kullanıcı “hedefi tutturmuşuz, neden turuncu?” diye sorar. Ya bir ondalık göster (%99,6) ya da eşiği ekranda görünen yuvarlanmış değere göre kur. Renk tek başına anlam taşımamalı; yanına ▲ ▼ gibi bir simge ya da “Hedefin altında” metni koy. Bu hem renk körlüğü olan kullanıcılar hem de siyah-beyaz çıktı için gereklidir.</p>
<pre class="dax">Seçim Özeti Başlığı =
VAR Kat =
    IF(
        ISFILTERED(Kategoriler[Kategori]),
        IF(
            HASONEVALUE(Kategoriler[Kategori]),
            SELECTEDVALUE(Kategoriler[Kategori]),
            COUNTROWS(VALUES(Kategoriler[Kategori])) &amp; " kategori"
        ),
        "Tüm kategoriler"
    )
VAR Yil = IF(HASONEVALUE(Tarih[Yil]), FORMAT(SELECTEDVALUE(Tarih[Yil]), "0"), "Tüm yıllar")
RETURN "Net satış · " &amp; Kat &amp; " · " &amp; Yil</pre>
<p>Kitap ve Spor seçiliyse başlık “Net satış · 2 kategori · Tüm yıllar” olur. Neden ISFILTERED? Filtre yokken de HASONEVALUE yanlış döner; ISFILTERED “hiç seçim yok” ile “birden çok seçim”i ayırır. Kullanıcı Urunler[Kategori] sütunundan filtrelerse ISFILTERED(Kategoriler[Kategori]) yanlış döner; bu durumda ISCROSSFILTERED kullan.</p>

<h2>Erişilebilirlik: ileri kontroller</h2>
<ul>
<li><b>Kontrast:</b> Metin ile arka plan arasında en az 4,5:1 kontrast hedefle. Açık gri eksen etiketleri en sık hatadır.</li>
<li><b>Sekme sırası:</b> Seçim bölmesindeki Sekme sırası görünümünde, klavyeyle gezen kullanıcı için sırayı bilgi hiyerarşisiyle aynı yap: KPI'lar, ana grafik, ayrıntı. Dekoratif şekilleri sekme sırasından çıkar.</li>
<li><b>Alternatif metin:</b> fx ile bir ölçüye bağlanabilir. Böylece ekran okuyucu “Net satış 747.066 ₺, hedefin %97,9'u” gibi güncel bir cümle okur.</li>
</ul>
<p>Temel ayarlar Mobil düzen, erişilebilirlik dersinde.</p>

<h2>Tasarım eleştirisi kontrol listesi</h2>
<p>Bir raporu eleştirirken her maddeyi <b>gözlem → etki → öneri</b> biçiminde yaz. Örnek: “İki ana grafik aynı boyutta (gözlem). Göz önce nereye bakacağını bilmiyor (etki). Hedef grafiğini 8 sütuna büyüt, eğilimi 4 sütuna al (öneri).”</p>
<ol>
<li>Ana mesaj 5 saniyede okunuyor mu? Tek bir “en ağır” öğe var mı?</li>
<li>Her KPI bir karşılaştırmayla mı geliyor (hedef, geçen yıl)?</li>
<li>Öğeler ızgaraya hizalı mı, boşluklar tutarlı mı?</li>
<li>Başlıklar bir sonucu söylüyor mu (“Hediye hedefin %16 gerisinde”)?</li>
<li>Renk tek bir anlam mı taşıyor, yanında simge ya da metin var mı?</li>
<li>Görsel sayısı bütçede mi; Performans Analizi ne diyor?</li>
<li>Detay ve araç ipucu yolları keşfedilebilir mi (“Ayrıntı için sağ tıkla → Detaya git” notu)?</li>
<li>Sekme sırası, alternatif metin ve kontrast kontrol edildi mi?</li>
</ol>
`, ex: [
  { t:'dax', name:'KPI Durum Rengi', q:'<b>KPI Durum Rengi</b>: Hedef gerçekleşme oranına göre renk kodu döndür: oran boşsa "#8A8A8A", %100 ve üstü "#1B7F3B", %95 ve üstü "#B26A00", altı "#B42318". Oran için [Hedef Gerçekleşme %] kullan.', sol:'VAR Oran = [Hedef Gerçekleşme %] RETURN SWITCH(TRUE(), ISBLANK(Oran), "#8A8A8A", Oran >= 1, "#1B7F3B", Oran >= 0.95, "#B26A00", "#B42318")', hint:'SWITCH(TRUE(), …) ile koşulları büyükten küçüğe sırala; BLANK kontrolü ilk sırada olsun.' },
  { t:'dax', name:'Seçim Özeti Başlığı', q:'<b>Seçim Özeti Başlığı</b>: Görsel başlığı için metin. Biçim: "Net satış · {kategori} · {yıl}". Tek kategori varsa adı; birden çok seçim varsa "N kategori"; filtre yoksa "Tüm kategoriler". Yıl tekse yıl, değilse "Tüm yıllar".', sol:'VAR Kat = IF(ISFILTERED(Kategoriler[Kategori]), IF(HASONEVALUE(Kategoriler[Kategori]), SELECTEDVALUE(Kategoriler[Kategori]), COUNTROWS(VALUES(Kategoriler[Kategori])) & " kategori"), "Tüm kategoriler") VAR Yil = IF(HASONEVALUE(Tarih[Yil]), FORMAT(SELECTEDVALUE(Tarih[Yil]), "0"), "Tüm yıllar") RETURN "Net satış · " & Kat & " · " & Yil', hint:'Önce ISFILTERED ile “seçim var mı?”, sonra HASONEVALUE ile “tek mi?” sor. Yılı FORMAT(…, "0") ile metne çevir.' },
  { t:'mc', q:'Yönetici özet sayfasında 4 kart, 6 grafik, 2 ayrıntı tablosu ve 3 dilimleyici var; sayfa 5,8 saniyede açılıyor. Kullanım verisi ayrıntı tablolarının nadiren kullanıldığını gösteriyor. İlk adımın ne olur?', o:['Tabloları detay sayfasına taşıyıp kartları birleştirmek','Kapasiteyi bir üst SKU’ya yükseltip sayfayı aynen bırakmak','Tabloları bir yer imiyle gizleyip düğmeyle gösterilebilir yapmak','Modelin depolama modunu Import’tan DirectQuery’ye çevirmek'], a:0, why:'Görsel sayısı bir bütçedir; nadiren kullanılan pahalı tablolar detay sayfasında yerinde durur, kartlar da tek görselde birleşir. Kapasite artırmak tasarım sorununu parayla örter. Gizleme düğmesi sayfayı karmaşıklaştırır ve önce ölçmeden yapılan bir tahmindir. DirectQuery genellikle sorguları daha da yavaşlatır.' },
  { t:'mc', q:'Bir taslakta sayfanın üst yarısında aynı boyutta iki büyük grafik, sağ alt köşede küçük KPI kartları var. Eleştirinde ana öneri ne olmalı?', o:['Grafiklerin renk paletini birbirinden ayırmak','KPI’ları sol üst şeride taşıyıp tek bir ana grafik seçmek','Kartların yazı tipini büyütüp yerinde bırakmak','İki grafiği tek bir kombo grafikte birleştirmek'], a:1, why:'Bilgi hiyerarşisi bozuk: durum katmanı (KPI) en az görülen köşede, iki eşit grafik de gözü ikiye bölüyor. KPI’ları sol üste almak ve tek bir “en ağır” grafik seçmek sorunu çözer. Renk ayrımı hiyerarşiyi düzeltmez. Yazıyı büyütmek konum sorununu çözmez. Kombo grafik farklı soruları tek görsele sıkıştırabilir.' },
  { t:'mc', q:'Kategori yöneticisi bir kategoriye tıklayınca o kategorinin ürün listesini, iade oranını ve 12 aylık eğilimini görmek istiyor. Bunu ayda birkaç kez yapıyor. Hangi mekanizma?', o:['Araç ipucu sayfası','Özet sayfasına üç yeni görsel','Detay sayfası','Her kategori için bir yer imi'], a:2, why:'Tek bir varlık için derine inme ve birden çok ayrıntı görseli detay sayfasının işidir. Araç ipucu tek bir soruya hızlı cevap içindir; liste ve eğilim için küçük kalır. Özet sayfasına eklemek bütçeyi her açılışta harcar. Kategori başına yer imi bakımı zor bir yığın üretir.' },
  { t:'mc', q:'Kart “Hedef gerçekleşme %100” gösteriyor ama arka plan turuncu. Kullanıcılar şikâyet ediyor. Gerçek değer %99,6 ve eşik %100. Ne yaparsın?', o:['Turuncu eşiğini %99’a indirmek','Bir ondalık göstermek ya da eşiği görünen değerle hizalamak','Kartta yüzde yerine tutar göstermek','Koşullu biçimlendirmeyi kaldırmak'], a:1, why:'Sorun, ekrandaki yuvarlanmış değer ile rengin kullandığı gerçek değerin farklı olması. Bir ondalık (%99,6) ya da yuvarlanmış değere göre eşik bu çelişkiyi kaldırır. Eşiği keyfî indirmek iş kuralını değiştirir. Tutar göstermek soruyu değiştirir. Biçimi kaldırmak durum bilgisini yok eder.' },
  { t:'mc', q:'Kullanıcılar “Grafik / Tablo” düğmesine basınca kendi dilimleyici seçimlerinin sıfırlandığını söylüyor. Düğmeler yer imlerine bağlı. En olası neden?', o:['Dilimleyiciler eşitlenmemiş','Yer imlerinde “Veri” seçeneği açık','Düğme eylemi yanlış sayfaya gidiyor','Seçim bölmesinde görseller gruplanmamış'], a:1, why:'“Veri” seçeneği açık bir yer imi, kaydedildiği andaki filtre ve dilimleyici durumunu da geri yükler. Yalnızca “Görüntüle” tutulursa kullanıcının seçimi korunur; görsel değişimi için alan parametresi daha da iyidir. Eşitleme sayfalar arası bir ayardır. Yanlış sayfa başka bir belirti verir. Gruplama filtreyi etkilemez.' }
] });

/* ───────────────────────── 4. Bitirme projesine hazırlık ───────────────────────── */
ext('final-hazirlik', { min: 14, html: `
<h2>Bitirme projesini yürütmek: altı aşama</h2>
<p>Bitirme projesi bir “rapor yapma” ödevi değil, küçük bir iş projesidir. Değerlendiren kişi sonuçtan çok yolu görmek ister: bir soruyu nasıl tanımladın, nasıl modelledin, sayının doğru olduğunu nasıl kanıtladın. Aşamaları ve “bitti” ölçütlerini baştan bil.</p>
<div class="tbl-wrap"><table><tr><th>Aşama</th><th>Çıktı</th><th>Zaman payı</th><th>Bitti sayılır, eğer…</th></tr>
<tr><td>1. Gereksinim</td><td>Brif, KPI sözlüğü, sayfa taslağı</td><td>%15</td><td>Her KPI'ın bir cümlelik tanımı ve iş kuralı var</td></tr>
<tr><td>2. Model</td><td>Yıldız şema diyagramı, tarih tablosu</td><td>%20</td><td>Tüm ilişkiler bire-çok ve tek yönlü (gerekçesi yazılı istisnalar hariç)</td></tr>
<tr><td>3. Ölçüler</td><td>Temel → türetilmiş ölçüler, görüntü klasörleri</td><td>%25</td><td>Her ölçünün açıklaması, biçimi ve bir test sorgusu var</td></tr>
<tr><td>4. Rapor</td><td>Sayfa haritası, ızgara, etkileşimler</td><td>%20</td><td>Tasarım eleştirisi listesinden geçti</td></tr>
<tr><td>5. Test</td><td>Mutabakat, kenar durum, RLS, performans</td><td>%10</td><td>Sonuçlar bir test sayfasında belgeli</td></tr>
<tr><td>6. Sunum</td><td>5 dakikalık demo, README</td><td>%10</td><td>Bir yabancı README'den projeyi anlayabiliyor</td></tr></table></div>
<p>En sık hata, zamanın yarısını 4. aşamaya harcayıp 1. ve 5. aşamaları atlamaktır. Güzel görünen ama tanımı belirsiz bir rapor, değerlendirmede en çok puan kaybeden rapordur.</p>

<h2>1. Gereksinim: tanımlar sayıdan önce gelir</h2>
<p>Brif yazımı Talepten rapor brifine dersinde. Bitirme projesinde en çok işe yarayan belge <b>KPI sözlüğü</b>dür: ad, tek cümlelik tanım, iş kuralı, kaynak sütun, biçim. Neden bu kadar önemli? Bu modelde “Net satış” iki farklı sayı olabilir:</p>
<div class="tbl-wrap"><table><tr><th>Tanım</th><th>Kural</th><th>Tüm dönem</th></tr>
<tr><td>Uygulamadaki [Net Satış]</td><td>İptaller hariç, iadeler dahil</td><td>1.250.772 ₺</td></tr>
<tr><td>Finansın beklediği olabilir</td><td>İptaller ve iadeler hariç</td><td>1.169.937 ₺</td></tr></table></div>
<p>Aradaki 80.835 ₺ tam olarak <code>[İade Tutarı]</code>'dır. İkisi de savunulabilir; savunulamayan, hangisinin kullanıldığını yazmamaktır. Sözlüğe tek satır ekle: “Net satış: iptal hariç, iade dahil; iade ayrı KPI olarak izlenir.”</p>

<h2>2–3. Model ve ölçüler: katmanlı kur</h2>
<p>Ölçüleri dört katmanda düşün. Her katman yalnızca bir alttakini kullanır:</p>
<ol>
<li><b>Temel:</b> <code>[Toplam Satış] = SUM(Satislar[Tutar])</code> — ham toplama, rapora konmaz.</li>
<li><b>İş kuralı:</b> <code>[Net Satış]</code> — sözlükteki tanımın tek yeri.</li>
<li><b>Türetilmiş:</b> marj, YoY, hedef farkı — iş kuralı ölçülerinden kurulur.</li>
<li><b>Sunum:</b> başlık, renk, etiket metni — rapora özgü.</li>
</ol>
<p>Kural bir gün değişirse (ör. iade hariç tutulacak) yalnızca 2. katmandaki bir ölçüyü değiştirirsin; yüzlerce ölçü kendiliğinden güncellenir.</p>
<h3>Gereksinimden ölçüye: bir örnek</h3>
<p>Satış direktörü: “Her kategori için hedefe ne kadar kaldığını görmek istiyorum. Hedefi aşan kategoride eksi sayı görmeyeyim.”</p>
<pre class="dax">Hedefe Kalan Tutar =
VAR Kalan = [Hedef] - [Net Satış]
RETURN IF(NOT ISBLANK([Hedef]), MAX(Kalan, 0))

Kategori Bazında Kalan =
SUMX(VALUES(Kategoriler[Kategori]), [Hedefe Kalan Tutar])</pre>
<p>2024'te Kitap hedefi aştı ve satırında 0 görünür. Toplam satırında ise iki ölçü ayrışır: <code>[Hedefe Kalan Tutar]</code> 16.134 ₺ der (şirketin toplam hedefi ile toplam satışı arasındaki fark). <code>[Kategori Bazında Kalan]</code> 16.361 ₺ der (satırların toplamı). Çünkü ilk ölçü Kitap'ın fazlasını diğer kategorilerin açığından düşer. Hangisi doğru? Bu bir iş sorusudur: “Kategorilerin toplam açığı” mı, “şirketin net açığı” mı? Direktöre sor, cevabı ölçü açıklamasına yaz. Değerlendirmede tam puan alan proje, bu tür bir kararı belgelemiş projedir.</p>

<h2>4–5. Rapor ve test</h2>
<p>Rapor aşaması için Dashboard tasarımı dersindeki ızgara ve eleştiri listesini kullan. Test aşaması için Rapor kalitesi dersindeki test paketini uygula. Bitirme projesinde en az şu üç test belgeli olsun:</p>
<ul>
<li><b>Mutabakat:</b> DAX sorgu görünümünde, rapor ölçüsü ile kaynak tablodan doğrudan hesaplanan toplamı yıl yıl karşılaştıran bir sorgu. Fark sütunu her satırda 0 olmalı.</li>
<li><b>Kenar durumlar:</b> hedefi olmayan dönem, satışı olmayan kategori, tek gün seçimi, çoklu seçim, toplam satırı.</li>
<li><b>Güvenlik ve performans:</b> RLS rolü “Farklı görüntüle” ile iki kullanıcıda; Performans Analizi'nde her sayfanın açılış süresi.</li>
</ul>

<h2>6. Sunum ve portföy</h2>
<p>Beş dakikalık demo akışı:</p>
<ol>
<li><b>30 sn — bağlam:</b> Kim kullanıyor, hangi kararı veriyor?</li>
<li><b>1 dk — ana bulgu:</b> “2024'te hedefin %97,9'undayız; açığın büyük kısmı Elektronik ve Ev &amp; Yaşam'da.”</li>
<li><b>2 dk — gezinme:</b> özet → kategori detayı → araç ipucu.</li>
<li><b>1 dk — teknik:</b> model diyagramı ve en zor ölçünün mantığı.</li>
<li><b>30 sn — sınırlar ve sonraki adım:</b> “Hedefler aylık; günlük hedef gelirse model şöyle değişir.”</li>
</ol>
<p>README başlıkları: amaç, kullanıcılar, veri kaynakları, model görseli, KPI sözlüğü, varsayımlar, bilinen sınırlar, test sonuçları. Portföyde paylaşırken gerçek şirket verisi kullanma. <b>Web'de yayımla</b> (Publish to web) bağlantısı herkese açıktır; yalnızca anonim, örnek veriyle kullan. Ayrıntı Portföy, CV ve ilk 90 gün dersinde.</p>

<h2>Rubrik: puan nerede kazanılır?</h2>
<div class="tbl-wrap"><table><tr><th>Ölçüt</th><th>Başlangıç</th><th>Yeterli</th><th>Profesyonel</th></tr>
<tr><td>Tanımlar</td><td>KPI'lar adıyla var</td><td>Formüller yazılı</td><td>İş kuralları ve istisnalar sözlükte</td></tr>
<tr><td>Model</td><td>Çalışıyor</td><td>Yıldız şema, tarih tablosu</td><td>Her istisna gerekçeli; gereksiz sütun yok</td></tr>
<tr><td>DAX</td><td>Doğru sonuç</td><td>Katmanlı, VAR, biçimli</td><td>Toplam satırı kararı belgeli, test sorgusu var</td></tr>
<tr><td>Rapor</td><td>Bilgiler sayfada</td><td>Hiyerarşi ve ızgara</td><td>Mimari (detay, araç ipucu) ve erişilebilirlik</td></tr>
<tr><td>Test</td><td>Elle bakıldı</td><td>Mutabakat yapıldı</td><td>Kenar durum, RLS, performans belgeli</td></tr>
<tr><td>Sunum</td><td>Rapor gösterildi</td><td>Bulgu anlatıldı</td><td>Karar, sınır ve sonraki adım net</td></tr></table></div>
<div class="tip"><b>Teslim öncesi son kontrol</b>KPI sözlüğü raporla birebir aynı mı? Mutabakat sorgusunda fark 0 mı? Her toplam satırı kararı bir ölçü açıklamasında mı? README bir yabancıya yetiyor mu? Demo 5 dakikaya sığıyor mu (saatle dene)?</div>
`, ex: [
  { t:'dax', name:'Hedefe Kalan Tutar', q:'<b>Hedefe Kalan Tutar</b>: Hedef ile net satış arasındaki fark; hedef aşıldıysa 0, hedef yoksa boş. 2024 kategori kırılımında Kitap 0 göstermeli.', sol:'VAR Kalan = [Hedef] - [Net Satış] RETURN IF(NOT ISBLANK([Hedef]), MAX(Kalan, 0))', hint:'Farkı bir değişkene al; MAX(Kalan, 0) eksiyi keser. Hedef boşsa IF ile BLANK döndür.' },
  { t:'query', q:'Mutabakat testi: yıl bazında rapor ölçüsü [Net Satış] ile kaynaktan doğrudan hesaplanan toplamı (Durum “Teslim Edildi”, “Kargoda” ya da “İade” olan satırların Tutar toplamı) ve ikisinin farkını veren bir DAX sorgusu yaz. Sütunlar: Rapor, Kaynak, Fark.', start:'EVALUATE\n', sol:'EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[Yil],\n    "Rapor", [Net Satış],\n    "Kaynak", CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] IN {"Teslim Edildi", "Kargoda", "İade"}),\n    "Fark", [Net Satış] - CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] IN {"Teslim Edildi", "Kargoda", "İade"})\n)', hint:'SUMMARIZECOLUMNS(Tarih[Yil], "Rapor", …, "Kaynak", …, "Fark", …). Kaynak için ölçüyü kullanma; SUM ve IN { … } ile kuralı yeniden yaz.' },
  { t:'mc', q:'Bitirme projen için iki haftan var. İlk iki günü nasıl kullanırsın?', o:['Temayı ve sayfa düzenini hazırlamak','KPI sözlüğü ve sayfa taslağı yazmak','Tüm ölçüleri hızlıca yazıp sonra ayıklamak','Power Query’de tüm tabloları temizlemek'], a:1, why:'Tanımlar olmadan yazılan ölçü ve tasarım sonradan yeniden yapılır. Sözlük ve taslak hangi verinin, hangi ölçünün, hangi sayfanın gerekli olduğunu belirler. Tema en son işlerden biridir. Ölçüleri önce yazıp ayıklamak bakım yükü üretir. Tüm tabloları temizlemek de neyin gerekli olduğu bilinmeden emek harcamaktır.' },
  { t:'mc', q:'Finans ekibi raporundaki tüm dönem net satışın 1.169.937 ₺ olduğunu, seninkinin 1.250.772 ₺ gösterdiğini söylüyor. Fark tam olarak iade tutarı kadar. Ne yaparsın?', o:['Ölçüyü hemen iadeleri hariç tutacak biçimde değiştirmek','Tanımı finansla netleştirip KPI sözlüğüne yazmak','Raporun altına iki sayının da doğru olduğunu not etmek','Finansın kaynağının hatalı olduğunu belirtmek'], a:1, why:'İki sayı da bir tanıma göre doğrudur; sorun tanımın yazılı olmaması. Önce paydaşla hangi tanımın kullanılacağına karar verilir, sonra sözlük ve gerekirse ölçü güncellenir. Tek taraflı değiştirmek başka bir ekibi bozabilir. “İkisi de doğru” notu kullanıcıyı belirsizlikte bırakır. Finansı suçlamak hem yanlış hem ilişkiyi bozar.' },
  { t:'mc', q:'Değerlendirmede “Hedefe kalan” ölçünün toplam satırı 16.134 ₺, satırların toplamı 16.361 ₺. Değerlendirici neyi görmek ister?', o:['Toplam satırının kapatılmasını','Farkın nedeninin ve seçilen anlamın ölçü açıklamasında yazılmasını','İki ölçünün ortalamasının gösterilmesini','Toplamı her zaman satırların toplamına zorlayan bir ölçü'], a:1, why:'Fark, hedefi aşan Kitap’ın fazlasının toplamda diğer açıklardan düşülmesinden gelir. İki anlam da geçerlidir; profesyonel çözüm iş sorusunu sorup kararı belgelemektir. Toplamı kapatmak bilgiyi gizler. Ortalama anlamsızdır. Her zaman satır toplamına zorlamak “şirketin net açığı” sorusunu yanlış cevaplar.' },
  { t:'mc', q:'Portföyün için bitirme projeni paylaşacaksın. Model, çalıştığın şirketin gerçek müşteri verisinden kopyalanmış bir örnek içeriyor. Ne yaparsın?', o:['Web’de yayımla ile paylaşıp bağlantıyı yalnızca CV’ye koymak','Veriyi anonim ya da sentetik veriyle değiştirip öyle yayımlamak','Raporu PDF’e aktarıp müşteri adlarını kapatmak','Çalışma alanına okuma izniyle işe alanları eklemek'], a:1, why:'Gerçek şirket verisi portföyde kullanılmaz. Web’de yayımla bağlantısı herkese açıktır ve dizinlenebilir. PDF’te adları kapatmak verinin geri kalanını korumaz. Dış kişileri şirket çalışma alanına eklemek de bir veri paylaşımı ihlalidir. Anonim ya da sentetik veriyle aynı modeli göstermek güvenli yoldur.' }
] });

})(window);
