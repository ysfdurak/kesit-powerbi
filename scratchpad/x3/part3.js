/* ───────────────────────── 5. PL-300 ───────────────────────── */
ext('pl300', { min: 16, html: `
<h2>Güncel çerçeve: neyi, ne ağırlıkla?</h2>
<p>Aşağıdaki ağırlıklar Microsoft Learn'deki PL-300 çalışma kılavuzunun <b>20 Nisan 2026</b> tarihli “ölçülen beceriler” listesinden alındı. Sınava girmeden önce aynı sayfayı bir kez daha aç; Microsoft listeyi yılda birkaç kez günceller. İngilizce sürüm önce güncellenir, yerelleştirilmiş sürümler genellikle yaklaşık sekiz hafta geriden gelir.</p>
<div class="tbl-wrap"><table><tr><th>Alan</th><th>Ağırlık</th><th>Dikkat çeken maddeler</th><th>Bu uygulamada</th></tr>
<tr><td>Veriyi hazırlama</td><td>%25–30</td><td>DirectLake / DirectQuery / Import seçimi, gizlilik düzeyleri, referans mı çoğaltma mı, ilişki anahtarları</td><td>Veri alma, Power Query dersleri, M dili</td></tr>
<tr><td>Veriyi modelleme</td><td>%25–30</td><td>Rol oynayan boyutlar, yarı toplanabilir ölçüler, hesaplama grupları, Performans Analizi ve DAX sorgu görünümü</td><td>Modelleme, DAX dersleri, Performans</td></tr>
<tr><td>Görselleştirme ve analiz</td><td>%25–30</td><td>Copilot ile anlatı görseli ve sayfa önerisi, görsel hesaplamalar, sayfalandırılmış rapor ne zaman, erişilebilirlik, otomatik sayfa yenileme</td><td>Görselleştirme dersleri, Copilot, Pencere fonksiyonları</td></tr>
<tr><td>Power BI'ı yönetme ve güvenli hâle getirme</td><td>%15–20</td><td>Dağıtım yöntemi seçimi, abonelik ve uyarılar, ağ geçidi ne zaman, RLS grup üyeliği, duyarlılık etiketleri</td><td>Yayımlama, Güvenlik, Yönetişim</td></tr></table></div>
<p>Geçme puanı 1000 üzerinden 700. Laboratuvar içermeyen rol tabanlı sınavlarda süre 100 dakika, oturum süresi 120 dakikadır. Sınav ana dilinde sunulmuyorsa 30 dakika ek süre istenebilir. Yapay zekâ görselleri maddesinde ayrıştırma ağacı ve önemli etkileyenler çalış. Soru-Cevap (Q&amp;A) görseli Aralık 2026'da kaldırılıyor; doğal dil soruları için Copilot'u ve modeli “Yapay zekâ için verileri hazırla” (Prep data for AI) ile hazırlamayı öğren.</p>

<h2>Soru türleri ve her birinin çözüm yolu</h2>
<p>Microsoft sınavdaki biçimleri önceden açıklamaz, ama deneme ortamında (exam sandbox) şu türleri gösterir:</p>
<div class="tbl-wrap"><table><tr><th>Tür</th><th>Nasıl görünür?</th><th>Strateji</th></tr>
<tr><td>Çoktan seçmeli</td><td>Tek ya da birden çok doğru</td><td>Kaç seçim istendiğini oku; kısıt ifadesini bul</td></tr>
<tr><td>Liste oluşturma, sürükle-bırak</td><td>Adımları doğru sıraya koy</td><td>Önce ilk ve son adımı sabitle, sonra aradakileri yerleştir</td></tr>
<tr><td>Etkin alan (hot area)</td><td>Ekran görüntüsünde doğru yer ya da açılır listelerle DAX tamamlama</td><td>DAX'ı kafanda bir hücrede çalıştır: hangi filtre kalıyor, hangisi kalkıyor?</td></tr>
<tr><td>Vaka çalışması</td><td>Şirket anlatısı, gereksinimler, birden çok soru</td><td>Önce soruları oku, sonra anlatıda yalnızca ilgili bölümü ara</td></tr>
<tr><td>Sorun–çözüm setleri</td><td>“Bu çözüm hedefi karşılıyor mu? Evet / Hayır”; aynı senaryo farklı çözümlerle tekrar eder</td><td>Her çözümü bağımsız değerlendir; ara verilemez, cevabı kesin ver</td></tr></table></div>
<p>Rol tabanlı sınavlarda Microsoft Learn'e sınav içinden erişebilirsin; Q&amp;A, alıştırma değerlendirmeleri ve profil sayfası hariç. Saat bu sırada durmaz. Learn'i her soru için değil, emin olmadığın bir sınır ya da menü adı için kullan.</p>

<h2>Zaman yönetimi</h2>
<ul>
<li><b>Hız hedefi:</b> Sınavlar bölümündeki not, raporlarda soru sayısının çoğunlukla 50–55 olduğunu söylüyor. 100 dakikada soru başına yaklaşık 1,5 dakika eder. Vaka için 15–20 dakika ayır.</li>
<li><b>90 saniye kuralı:</b> 90 saniyede çözemediğin soruyu işaretle (mark for review) ve geç. İlk turda emin olduklarını topla.</li>
<li><b>Ara kuralı:</b> Ara verebilirsin ama saat işlemeye devam eder ve aradan sonra daha önce gördüğün sorulara <b>dönemezsin</b>; işaretli olanlara bile. Önce işaretlileri bitir, sonra ara ver.</li>
<li><b>Son 10 dakika:</b> Boş soru bırakma; yanlış cevabın ceza puanı yok.</li>
</ul>

<h2>Kısıt ifadeleri: soruyu çözen anahtar</h2>
<p>Senaryo sorularında genellikle birden çok seçenek teknik olarak çalışır. Doğruyu seçtiren şey sorudaki kısıttır:</p>
<div class="tbl-wrap"><table><tr><th>İfade</th><th>Genellikle doğru yön</th></tr>
<tr><td>“En az geliştirme çabasıyla”</td><td>Yerleşik özellik: hızlı ölçü, yerleşik görsel, Power Query arayüzü</td></tr>
<tr><td>“En az ayrıcalık ilkesiyle”</td><td>İşi yapabilen en düşük rol ya da izin</td></tr>
<tr><td>“Veri mümkün olduğunca güncel olmalı”</td><td>DirectQuery ya da Direct Lake, otomatik sayfa yenileme</td></tr>
<tr><td>“Model boyutunu küçült”</td><td>Gereksiz satır ve sütunu kaldır, ayrıntı düzeyini düşür</td></tr>
<tr><td>“Kullanıcılar raporu değiştirmeden kendi görünümünü kursun”</td><td>Görselleri kişiselleştirme</td></tr></table></div>

<h2>Sık tuzak konular: motorla gösterilmiş hâlleri</h2>
<h3>1. Yarı toplanabilir ölçüde LASTDATE</h3>
<p>Stok anlık görüntüleri her ayın son gününde alınıyor. <code>LASTDATE(Tarih[Tarih])</code> bağlamın son <b>takvim</b> gününü döndürür. Yıl kırılımında sorun yok: iki yöntem de 2024 için 311 adet verir. Ama haftanın günü kırılımında “Salı” dışındaki her hücre boş gelir, çünkü bu günlerin son tarihinde kayıt yok. Seçim ayın ortasında biterse (ör. kapanmamış ay) aynı boşluk raporda da görünür. <code>LASTNONBLANK</code> kaydı olan son günü bulur.</p>
<pre class="dax">Dönem Sonu Stok (Son Kayıt) =
CALCULATE(
    SUM(StokGorunum[StokAdet]),
    LASTNONBLANK(Tarih[Tarih], CALCULATE(COUNTROWS(StokGorunum)))
)</pre>
<h3>2. Yıl kırılımında “önceki dönem”</h3>
<p><code>CALCULATE([Net Satış], PREVIOUSQUARTER(Tarih[Tarih]))</code> 2024 yıl hücresinde 144.346 ₺ döndürür. Bu geçen yılın satışı değil, 2023-Ç4'tür: bağlamın ilk tarihinden önceki çeyrek. Sınavda bu tür sorular hücrenin hangi tarih kümesini gördüğünü sorar.</p>
<h3>3. Temel istatistik: neyin medyanı?</h3>
<p><code>MEDIAN(Satislar[Tutar])</code> sipariş <b>satırlarının</b> medyanıdır: 640 ₺. Soru “sipariş tutarının medyanı” ise önce sipariş düzeyine çıkmak gerekir: 1.086,5 ₺. Ortalama sepet (1.492,57 ₺) ile medyan arasındaki fark, birkaç büyük siparişin ortalamayı yukarı çektiğini gösterir.</p>
<pre class="dax">Medyan Sipariş Tutarı =
MEDIANX(
    CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] &lt;&gt; "İptal"),
    [Net Satış]
)</pre>
<h3>4. RLS kime uygulanır?</h3>
<p>Satır düzeyi güvenlik çalışma alanında yalnızca <b>Görüntüleyici</b> rolündeki kullanıcıları ve uygulama ya da paylaşım yoluyla erişenleri kısıtlar. Yönetici, Üye ve Katkıda bulunan rolleri tüm veriyi görür. “RLS çalışmıyor” şikâyetinin en sık nedeni budur.</p>

<h2>Uygulamanın sınav bölümünü kullanma planı</h2>
<ol>
<li><b>Konu alıştırması:</b> Sınavlar → PL-300 konu alıştırması. Her alanı ayrı çöz; %70'in altındaki alanı not al.</li>
<li><b>Kısa deneme:</b> Üçüncü haftanın sonunda. Süreyi tut ve 90 saniye kuralını uygula.</li>
<li><b>Tam deneme:</b> Son hafta iki kez. Arada yanlışlarını ilgili derse dönerek çalış; aynı denemeyi ezberlemek için tekrar çözme.</li>
<li><b>Microsoft'un ücretsiz alıştırma değerlendirmesi:</b> Biçimi tanıtır. Gerçek sınav soruları değildir.</li>
</ol>
<div class="warn"><b>Sınav sorusu paylaşan sitelerden uzak dur</b>Gerçek soruları dolaştıran “dump” siteleri sınav sözleşmesini ihlal eder; sertifikanın iptaline yol açabilir. Üstelik bu sorular çoğu zaman eski ve yanlış cevaplıdır. Buradaki ve uygulamadaki tüm sorular özgün alıştırmalardır.</div>
`, ex: [
  { t:'dax', name:'Dönem Sonu Stok (Son Kayıt)', q:'<b>Dönem Sonu Stok (Son Kayıt)</b>: Seçili dönemde StokGorunum’da kaydı olan son günün toplam stok adedi. Bağlamın son takvim gününde kayıt yoksa da değer dönmeli. 2024 için 311.', sol:'CALCULATE(SUM(StokGorunum[StokAdet]), LASTNONBLANK(Tarih[Tarih], CALCULATE(COUNTROWS(StokGorunum))))', hint:'LASTDATE yerine LASTNONBLANK(Tarih[Tarih], CALCULATE(COUNTROWS(StokGorunum))) kullan; içteki CALCULATE her tarih için bağlam geçişi yapar.' },
  { t:'dax', name:'Medyan Sipariş Tutarı', q:'<b>Medyan Sipariş Tutarı</b>: İptal edilmemiş siparişlerin sipariş düzeyindeki net satış tutarlarının medyanı (satır düzeyindeki Tutar’ın medyanı değil). Tüm dönem için 1.086,5 ₺.', sol:'MEDIANX(CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal"), [Net Satış])', hint:'Sipariş listesini CALCULATETABLE(VALUES(Satislar[SiparisNo]), …) ile al ve MEDIANX ile her sipariş için [Net Satış] hesapla.' },
  { t:'mc', q:'Bir matriste satırlarda Tarih[Yil], değer olarak CALCULATE([Net Satış], PREVIOUSQUARTER(Tarih[Tarih])) var. 2024 hücresi neyi gösterir?', o:['2023 yılının toplam net satışını','2024’ün ilk çeyreğinin net satışını','2023’ün son çeyreğinin net satışını','Boş, çünkü yıl düzeyinde çeyrek yoktur'], a:2, why:'PREVIOUSQUARTER bağlamın ilk tarihine göre bir önceki çeyreği döndürür; 2024 yılının ilk günü 1 Ocak olduğu için sonuç 2023-Ç4’tür (bu modelde 144.346 ₺). Geçen yılın toplamı için SAMEPERIODLASTYEAR gerekir. Fonksiyon yılın kendi çeyreğini döndürmez. Yıl düzeyinde de tarih kümesi olduğu için boş dönmez.' },
  { t:'mc', q:'Bölge RLS’i yayımlandı. Çalışma alanında Üye rolündeki satış müdürü tüm bölgeleri görüyor, Görüntüleyici rolündeki temsilci yalnızca kendi bölgesini. Müdür de kendi bölgesine sınırlanmalı. Ne yaparsın?', o:['RLS rolünün DAX filtresini USERNAME() ile yeniden yazmak','Müdürü çalışma alanında Görüntüleyici yapmak ya da uygulamadan erişim vermek','Müdürü RLS rolüne ikinci kez eklemek','Modelde ilişkileri çift yönlü yapmak'], a:1, why:'RLS, çalışma alanında Yönetici, Üye ve Katkıda bulunan rollerine uygulanmaz; bu roller düzenleme yetkisi taşır. Müdür Görüntüleyici olur ya da içeriği uygulama üzerinden alırsa RLS devreye girer. Filtre fonksiyonunu değiştirmek rol sorununu çözmez. Role tekrar eklemek bir şey değiştirmez. Çift yönlü ilişki güvenlikle ilgili değildir.' },
  { t:'mc', q:'Temizlenmiş bir “Satışlar” sorgusundan iki ayrı tablo türetmek istiyorsun: biri günlük, biri aylık özet. Temizlik adımları tek yerde kalmalı ve değişince ikisine de yansımalı. Hangisi?', o:['Sorguyu iki kez çoğaltmak (Duplicate)','İki yeni sorguyu temiz sorguya başvurarak (Reference) oluşturmak','Temiz sorguyu iki kez içeri aktarmak','Özetleri DAX hesaplanmış tablolarıyla yapmak'], a:1, why:'Başvuru (Reference), temiz sorgunun çıktısını girdi olarak kullanır; temizlik adımı değişince iki türev de güncellenir. Çoğaltma adımları kopyalar; değişiklik iki yerde yapılmak zorunda kalır. İki kez içeri aktarmak aynı sorunu taşır. Hesaplanmış tablo mümkündür ama soru Power Query’de adımların tek yerde kalmasını istiyor.' },
  { t:'mc', q:'Sınavın 60. dakikasındasın, 7 soruyu gözden geçirmek için işaretledin ve kısa bir ara vermen gerekiyor. En doğru sıra hangisi?', o:['Hemen ara vermek, sonra işaretlilere dönmek','Önce işaretlileri gözden geçirmek, sonra ara vermek','Ara vermeden sınavı bitirmek, işaretlileri boş bırakmak','Arada Learn’de işaretli konulara bakmak'], a:1, why:'Aradan sonra daha önce görülen sorulara, işaretli olsalar bile dönülemez. Önce işaretlileri bitirmek gerekir. Boş bırakmak puan kaybettirir; yanlış cevabın cezası yoktur. Arada herhangi bir materyale bakmak sınavın iptaline yol açar; Learn erişimi yalnızca sınav ekranından ve saat işlerken yapılır.' },
  { t:'mc', q:'Operasyon ekibi, DirectQuery kaynağına bağlı bir izleme sayfasının kimse dokunmadan her 30 saniyede güncellenmesini istiyor. En az geliştirme çabasıyla ne yaparsın?', o:['Zamanlanmış yenilemeyi 30 saniyeye ayarlamak','Sayfada otomatik sayfa yenilemeyi açmak','Power Automate ile raporu yeniden açan bir akış kurmak','Modeli Import’a çevirip artımlı yenileme kurmak'], a:1, why:'Otomatik sayfa yenileme DirectQuery kaynaklı sayfaların belirli aralıklarla sorgulanmasını sağlar; yerleşik bir ayardır. Zamanlanmış yenileme Import modelleri içindir ve bu sıklıkta değildir. Power Automate akışı gereksiz geliştirme çabasıdır. Import ve artımlı yenileme 30 saniyelik güncelliği vermez.' }
] });

/* ───────────────────────── 6. DP-600 ───────────────────────── */
ext('dp600', { min: 16, html: `
<h2>Çerçeveyi doğrula: 19 Ekim 2026 sürümü</h2>
<p>Microsoft Learn'deki DP-600 çalışma kılavuzunun ölçülen beceriler listesi <b>19 Ekim 2026</b> tarihli. Alan ağırlıkları değişmedi: analitik çözümü sürdürme %25–30, veriyi hazırlama %45–50, anlam modellerini uygulama ve yönetme %25–30. Değişiklik günlüğünde yalnızca “Veriyi sorgulama ve analiz etme” alt başlığında küçük bir değişiklik var. İngilizce sürüm önce güncellenir; yerelleştirilmiş sürüm birkaç hafta geriden gelebilir. Geçme puanı 700.</p>
<p>Ağırlıkların anlamı açık: sınavın neredeyse yarısı veriyi hazırlamak. Burada T-SQL görünümleri, saklı yordamlar, yıldız şemayı lakehouse ya da ambarda kurmak, yinelenen ve eksik veriyi temizlemek ve veriyi dört araçla sorgulamak var: görsel sorgu düzenleyici, SQL, KQL ve DAX. Power BI geçmişinden gelen biri için en büyük açık genellikle SQL'dir.</p>

<h2>Depo kararı: bir karar ağacı</h2>
<ol>
<li><b>Veri saniyeler içinde akıyor mu?</b> (telemetri, log, tıklama akışı) → Eventhouse / KQL veritabanı. Analiz katmanı için OneLake erişilebilirliğini açarsan aynı veri Delta olarak OneLake'te görünür ve kopyalamadan anlam modeline bağlanabilir.</li>
<li><b>Ekip veriyi T-SQL ile yazacak mı?</b> (INSERT, UPDATE, MERGE, çok tablolu işlemler, saklı yordamlar) → Warehouse.</li>
<li><b>Dosya, yarı yapılandırılmış veri ya da Spark / Python mühendisliği var mı?</b> → Lakehouse. Lakehouse'un SQL analiz uç noktası T-SQL ile <b>okur</b>; tablolara yazmaz.</li>
<li><b>Veri başka bir yerde zaten var mı?</b> (ADLS, başka bir lakehouse) → kopyalama, kısayol (shortcut) oluştur.</li>
<li><b>Raporlar nasıl tüketecek?</b> → Anlam modeli her zaman en üstte durur. Depolama modu kararı aşağıda.</li>
</ol>
<p>Ayrıntılı tasarım Fabric'te yıldız şema ve Fabric'te veriyi hazırlamak derslerinde.</p>

<h2>Direct Lake: OneLake mı, SQL uç noktası mı?</h2>
<p>Beceri listesinde ayrı bir madde var: “Direct Lake on OneLake ile Direct Lake on SQL analytics endpoint arasında seçim”. Fabric belgelerindeki farklar:</p>
<div class="tbl-wrap"><table><tr><th>Konu</th><th>Direct Lake on OneLake</th><th>Direct Lake on SQL</th></tr>
<tr><td>Kaynak</td><td>Bir ya da birden çok Fabric öğesi (kısayollar dahil)</td><td>SQL analiz uç noktası olan tek kaynak</td></tr>
<tr><td>DirectQuery'ye geri dönüş</td><td>Yok</td><td>Var (açıksa); kapalıysa sorgu hata verir</td></tr>
<tr><td>Import tablolarla karışım</td><td>Mümkün</td><td>Aynı modelde DirectQuery / Dual ile karışmaz</td></tr>
<tr><td>Ambardaki SQL RLS</td><td>Uygulanmaz; kullanıcının OneLake dosya erişimi gerekir</td><td>Uygulanır ama sorgular DirectQuery'ye düşer</td></tr>
<tr><td>Sınır (guardrail) aşılırsa</td><td>Yenileme başarısız; Delta tabloları optimize edilene kadar model sorgulanamaz</td><td>Uyarıyla devam eder, sorgular DirectQuery'ye düşer ve yavaşlar</td></tr></table></div>
<p>SQL uç noktasında geri dönüşü tetikleyenler: gerçekleştirilmemiş SQL görünümü, ambarda SQL tabanlı ayrıntılı erişim denetimi (SQL RLS dahil), henüz işlenmemiş tablo ve sınır aşımı. Direct Lake yenilemesi (framing) veri kopyalamaz; yalnızca en son Delta dosyalarına işaret eden meta veriyi günceller ve saniyeler sürer.</p>
<div class="note"><b>Sınav dili</b>“Raporlar yavaşladı, Performans Analizi'nde Direct Lake görselleri DirectQuery sorgusu gönderiyor” cümlesini görürsen geri dönüş tetikleyicilerini düşün: görünüm mü, SQL RLS mi, sınır mı?</div>

<h2>Aynı soru, üç dil: DAX, SQL, KQL</h2>
<p>Soru: “2024'te en çok satan 5 ürün hangisi?” Anlam modelinde DAX sorgusu:</p>
<pre class="dax">EVALUATE
TOPN(
    5,
    SUMMARIZECOLUMNS(
        Urunler[Urun], Urunler[Kategori],
        TREATAS({2024}, Tarih[Yil]),
        "Net Satış 2024", [Net Satış]
    ),
    [Net Satış 2024], DESC
)
ORDER BY [Net Satış 2024] DESC</pre>
<p>Sonuç: 27" Monitör 59.992 ₺, Akıllı Saat 37.789 ₺, Türk Kahvesi Makinesi 34.744 ₺, Robot Süpürge 32.396 ₺, Yoga Matı 28.868 ₺. Aynı sorunun ambar ya da SQL uç noktası karşılığı:</p>
<pre class="dax" data-notry>SELECT TOP 5 u.Urun, u.Kategori, SUM(s.Tutar) AS NetSatis2024
FROM dbo.Satislar AS s
JOIN dbo.Urunler AS u ON u.UrunNo = s.UrunNo
WHERE s.Durum &lt;&gt; 'İptal' AND YEAR(s.Tarih) = 2024
GROUP BY u.Urun, u.Kategori
ORDER BY NetSatis2024 DESC;</pre>
<p>Eventhouse'ta bir satış olayı tablosu olsaydı KQL karşılığı:</p>
<pre class="dax" data-notry>SatisOlaylari
| where Durum != "İptal" and Tarih between (datetime(2024-01-01) .. datetime(2024-12-31T23:59:59))
| summarize NetSatis2024 = sum(Tutar) by Urun, Kategori
| top 5 by NetSatis2024 desc</pre>
<div class="tbl-wrap"><table><tr><th>Dil</th><th>Nerede doğru?</th><th>Dikkat</th></tr>
<tr><td>DAX</td><td>İş kuralı anlam modelinde; tüm raporlar aynı tanımı kullanmalı</td><td>SQL'de “Net satış”ı yeniden yazmak iki tanım üretir</td></tr>
<tr><td>SQL</td><td>Dönüştürme, görünüm, saklı yordam, veri kalitesi kontrolü</td><td>SQL uç noktası salt okunur; yazma ambarda</td></tr>
<tr><td>KQL</td><td>Zaman serisi, log, yakın gerçek zamanlı analiz</td><td>Zaman aralığı filtresini erken uygula</td></tr>
<tr><td>Görsel sorgu düzenleyici</td><td>Kod yazmadan hızlı seçme, filtreleme, toplama</td><td>Karmaşık mantıkta SQL'e geç</td></tr></table></div>

<h2>Anlam modeli kararları: sınavın sevdiği eşleşmeler</h2>
<ul>
<li><b>Depolama modu:</b> Delta tabloları OneLake'teyse önce Direct Lake; eski bir kaynak varsa DirectQuery ya da Import; boyutlar için Dual (Kurumsal model dersi).</li>
<li><b>Artımlı yenileme:</b> RangeStart / RangeEnd parametreleri; filtre kaynağa katlanmalı.</li>
<li><b>Hesaplama grupları, dinamik biçim dizeleri, alan parametreleri:</b> Hesaplama grupları dersinde.</li>
<li><b>Pencere ve bilgi fonksiyonları:</b> OFFSET, WINDOW, INDEX; ISINSCOPE, ISFILTERED gibi bilgi fonksiyonları (Pencere fonksiyonları dersi).</li>
<li><b>Yaşam döngüsü:</b> Git sürüm denetimi ve .pbip, dağıtım işlem hatları ve dağıtım kuralları, XMLA ile dağıtım, etki analizi (Yaşam döngüsü dersi).</li>
</ul>

<h2>Sınav stratejisi</h2>
<p>Uygulamanın Sınavlar bölümündeki aday notlarına göre DP-600'de vaka çalışması çoğunlukla başta gelir ve geri dönülemez; sonda “aynı senaryo, farklı çözüm” evet/hayır serisi olur. T-SQL ağırlıklıdır. Plan: Sınavlar → DP-600 konu alıştırması ile alanları tek tek çalış, son iki haftada kısa ve tam denemeleri çöz. Her yanlışta kendine şu soruyu sor: kısıt neydi (en az çaba, en az ayrıcalık, kopyasız, gerçek zamana yakın)? Yanlış şık o kısıtın hangisini çiğniyordu?</p>
`, ex: [
  { t:'query', q:'2024 yılında net satışı en yüksek 5 ürünü, kategorileriyle birlikte, satışa göre azalan sırada döndüren bir DAX sorgusu yaz. Yıl filtresini TREATAS ile ver; değer sütununun adı "Net Satış 2024" olsun.', start:'EVALUATE\n', sol:'EVALUATE\nTOPN(5, SUMMARIZECOLUMNS(Urunler[Urun], Urunler[Kategori], TREATAS({2024}, Tarih[Yil]), "Net Satış 2024", [Net Satış]), [Net Satış 2024], DESC)\nORDER BY [Net Satış 2024] DESC', hint:'SUMMARIZECOLUMNS içinde filtre argümanı olarak TREATAS({2024}, Tarih[Yil]); dışında TOPN(5, …, [Net Satış 2024], DESC).' },
  { t:'mc', q:'Veri mühendisleri lakehouse’taki Delta tablolarını Spark ile yüklüyor. SQL ekibi aynı tablolarda UPDATE çalıştıran bir saklı yordamı lakehouse’un SQL analiz uç noktasında kurmak istiyor. Ne söylersin?', o:['Uç nokta salt okunur; yazma işi ambarda ya da Spark’ta yapılmalı','Uç noktada UPDATE çalışır, yalnızca izin vermek gerekir','Tabloları KQL veritabanına taşıyıp orada güncellemek gerekir','Saklı yordam yerine Dataflow Gen2 ile UPDATE yazılmalı'], a:0, why:'Lakehouse’un SQL analiz uç noktası tablolara T-SQL ile okuma (ve görünüm, fonksiyon) sunar; DML ile yazmaz. T-SQL yazma gerekiyorsa veri bir ambarda tutulur ya da güncelleme Spark ile yapılır. İzin vermek salt okunurluğu değiştirmez. KQL veritabanı bu iş yükü için değildir. Dataflow Gen2 UPDATE çalıştırmaz.' },
  { t:'mc', q:'Direct Lake on SQL kullanan bir modelde raporlar yavaşladı. Performans Analizi bazı görsellerin DirectQuery sorgusu gönderdiğini gösteriyor. Ambar ekibi geçen hafta satış tablosuna SQL tabanlı satır düzeyi güvenlik ekledi. En olası açıklama?', o:['Delta tablolarında V-Order kapatılmış','SQL RLS nedeniyle sorgular DirectQuery’ye düşüyor','Anlam modelinin yenilemesi başarısız oldu','Kullanıcıların Fabric lisansı yok'], a:1, why:'Direct Lake on SQL, ambarda SQL tabanlı ayrıntılı erişim denetimi görünce o sorgular için DirectQuery’ye geri döner; bu da yavaşlık yaratır. V-Order okuma performansını etkiler ama DirectQuery’ye düşürmez. Başarısız yenileme sorguyu yavaşlatmaz, veriyi eski bırakır. Lisans sorunu erişim hatası verir.' },
  { t:'mc', q:'IoT sensör verisi bir Eventhouse’ta toplanıyor. Analistler bu veriyi kopyalamadan, bir lakehouse’taki ürün tablosuyla aynı anlam modelinde kullanmak istiyor. İlk adım ne?', o:['Bir işlem hattıyla veriyi her saat lakehouse’a kopyalamak','KQL veritabanında OneLake erişilebilirliğini açmak','Anlam modelinde Eventhouse’a DirectQuery ile bağlanmak','Sensör verisini Dataflow Gen2 ile ambara yazmak'], a:1, why:'OneLake erişilebilirliği, Eventhouse tablolarını OneLake’te Delta olarak görünür kılar; anlam modeli bunu kopya olmadan kullanabilir. Saatlik kopya, kopyasız şartını çiğner ve gecikme ekler. DirectQuery bağlantısı çalışabilir ama iki kaynağı tek Direct Lake modelinde birleştirmez. Dataflow ile yazmak da bir kopyadır.' },
  { t:'mc', q:'Anlam modeli geliştirme, test ve üretim çalışma alanlarından geçmeli; her aşamada veri kaynağı o aşamanın lakehouse’u olmalı. En az bakım çabasıyla hangisi?', o:['Her aşamada PBIX’i elle yayımlayıp kaynağı değiştirmek','Dağıtım işlem hattı ve dağıtım kuralları','Üç ayrı model kopyası ve üç ayrı Git dalı','XMLA ile her aşamaya ayrı betik çalıştırmak'], a:1, why:'Dağıtım işlem hattı içeriği aşamalar arasında taşır; dağıtım kuralları her aşama için veri kaynağını ve parametreleri otomatik değiştirir. Elle yayımlamak hataya açıktır. Üç model kopyası tanımları ayrıştırır. XMLA betikleri çalışır ama bakım çabası daha yüksektir.' },
  { t:'mc', q:'Bir uygulamanın hata loglarında “son 1 saatte 5 dakikalık aralıklarla hata sayısı” isteniyor; veri saniyede yüzlerce kayıtla Eventhouse’a geliyor. Hangi dil ve yaklaşım?', o:['DAX ölçüsü ve otomatik sayfa yenileme','KQL’de zaman filtresi ve bin() ile summarize','T-SQL görünümü ve zamanlanmış yenileme','Görsel sorgu düzenleyiciyle gruplama'], a:1, why:'Yakın gerçek zamanlı log analizi KQL’in alanıdır: önce zaman aralığı filtrelenir, sonra summarize count() by bin(Zaman, 5m). DAX ölçüsü bu veri hacminde ve gecikmede doğru katman değildir. T-SQL görünümü ve zamanlanmış yenileme gecikme ekler. Görsel sorgu düzenleyici bu senaryoda KQL’in zaman serisi araçlarını sunmaz.' },
  { t:'mc', q:'Direct Lake on OneLake modelinin yenilemesi bir sınır (guardrail) aşıldığı için başarısız oldu ve model sorgulanamıyor. Ne yaparsın?', o:['Modelde DirectQuery’ye geri dönüşü açmak','Delta tablolarını optimize edip yeniden yenilemek','Modeli Import’a çevirip yeniden yayımlamak','Kapasiteyi bir gece için duraklatmak'], a:1, why:'Direct Lake on OneLake’te geri dönüş yoktur; sınır aşılınca yenileme başarısız olur ve Delta tabloları optimize edilene kadar model sorgulanamaz. Dosya ve satır grubu sayısını azaltan bakım (OPTIMIZE) çözümdür. Geri dönüş ayarı SQL uç noktası türüne özgüdür. Import’a çevirmek büyük bir mimari değişikliktir. Kapasiteyi duraklatmak sorunu çözmez.' }
] });

/* ───────────────────────── 7. Mülakat ───────────────────────── */
ext('mulakat', { min: 16, html: `
<h2>İleri teknik mülakat: dört tur</h2>
<p>Kıdemli analist ve BI geliştirici mülakatlarında kavram soruları kısalır, uygulama turları uzar. Genellikle şu dört tur görülür:</p>
<div class="tbl-wrap"><table><tr><th>Tur</th><th>Süre</th><th>Ölçülen</th><th>En çok puan kaybettiren</th></tr>
<tr><td>Canlı DAX kodlama</td><td>30–45 dk</td><td>Soruyu ölçüye çevirme, doğrulama alışkanlığı</td><td>Sessizce yazıp test etmeden “bitti” demek</td></tr>
<tr><td>Model tasarım tahtası</td><td>30 dk</td><td>Tanecik, olgu–boyut ayrımı, zor ilişkiler</td><td>Doğrudan tablo çizmeye başlamak</td></tr>
<tr><td>Rapor eleştirisi</td><td>15–20 dk</td><td>Önceliklendirme, iş dili</td><td>Renk ve yazı tipiyle başlamak</td></tr>
<tr><td>“Bu rakam yanlış”</td><td>20–30 dk</td><td>Sistematik hata ayıklama</td><td>Tahminle formül değiştirmek</td></tr></table></div>

<h2>Canlı DAX turu: sorgu ile çalış</h2>
<p>Mülakatçı ekran paylaşımında şunu ister: “Birden fazla kanaldan alışveriş yapmış müşteri sayısını yıl yıl göster.” Ölçüyü model içinde yazmak yerine DAX sorgu görünümünde <code>DEFINE MEASURE</code> ile yaz. Hem tanımı hem sonucu aynı ekranda gösterirsin ve modeli değiştirmeden denersin:</p>
<pre class="dax">DEFINE
    MEASURE Satislar[Çok Kanallı Müşteri] =
        COUNTROWS(
            FILTER(
                VALUES(Satislar[MusteriNo]),
                CALCULATE(DISTINCTCOUNT(Satislar[Kanal]), Satislar[Durum] &lt;&gt; "İptal") &gt;= 2
            )
        )
EVALUATE
SUMMARIZECOLUMNS(Tarih[Yil], "Çok kanallı", [Çok Kanallı Müşteri], "Müşteri", [Müşteri Sayısı])</pre>
<p>Sonuç: 2022'de 32 müşteriden 9'u, 2023'te 77'den 48'i, 2024'te 123'ten 88'i birden çok kanal kullanmış. Şimdi sesli doğrula:</p>
<ul>
<li><b>Bağlam geçişi:</b> FILTER her müşteri satırında CALCULATE çağırır; satır bağlamı müşteri filtresine döner ve kanal sayısı o müşteri için hesaplanır.</li>
<li><b>Toplam:</b> Tüm dönemde 113. Yılların toplamı (145) değildir, çünkü müşteri yıllar arasında tekrar eder. Bunu mülakatçı sormadan söyle.</li>
<li><b>Kenar durum:</b> İptal filtresi içerideki CALCULATE'te. Yalnızca iptal edilmiş bir Mağaza siparişi olan müşteri “çok kanallı” sayılmaz.</li>
</ul>
<h3>Takip sorusuna hazır ol</h3>
<p>İkinci görev çoğu zaman bir öncekinin üstüne kurulur: “Her kategorinin lider ürününü yaz.” <code>TOPN(1, VALUES(Urunler[Urun]), [Net Satış])</code> çoğu hücrede doğru çalışır. Ama satış olmayan aylarda (bu modelde 2022'nin ilk beş ayı) bütün ürünler BLANK ile berabere kalır ve TOPN 40 ürünün hepsini döndürür. Çözüm: önce satışı olan ürünleri filtrele. Bu tuzağı kendin bulup söylemek, kıdemli adayı ayıran davranıştır.</p>
<pre class="dax">Lider Ürün =
VAR Satanlar = FILTER(VALUES(Urunler[Urun]), NOT ISBLANK([Net Satış]))
VAR Lider = TOPN(1, Satanlar, [Net Satış], DESC)
RETURN CONCATENATEX(Lider, Urunler[Urun], ", ")</pre>

<h2>Model tasarım tahtası</h2>
<p>Örnek soru: “Bir e-ticaret şirketi kampanya etkisini ölçmek istiyor. Bir sipariş birden çok kampanya kodu kullanabilir. Hedefler aylık ve kategori bazında. İadeler ayrı bir sistemden geliyor. Modeli çiz.” Çizmeden önce şu sırayla konuş:</p>
<ol>
<li><b>Tanecik (grain):</b> “Satış olgusu sipariş satırı düzeyinde; hedef ay × kategori düzeyinde; iade, iade satırı düzeyinde.” Bu cümle modelin yarısıdır.</li>
<li><b>Olgular:</b> Satislar, Hedefler, Iadeler. Üç olgu, üç ayrı tanecik; birleştirilmez.</li>
<li><b>Ortak boyutlar:</b> Tarih, Ürün (kategori dahil), Müşteri, Kanal, Kampanya. Hedefler Tarih ve Kategori'ye bağlanır, Ürün'e değil.</li>
<li><b>Zor kısım:</b> Sipariş–kampanya çoka-çok. Bir köprü tablo (SiparisNo, KampanyaNo) ve iki bire-çok ilişki. Kampanya filtresinin satışa ulaşması için ölçü içinde yön açma ya da köprü üzerinden filtre. Bir siparişi iki kampanyaya tam olarak saymanın toplamı şişireceğini söyle ve ağırlık (paylaştırma) seçeneğini öner.</li>
<li><b>Güvenlik ve büyüme:</b> RLS hangi boyutta? Veri büyürse artımlı yenileme ve toplama tabloları.</li>
</ol>
<p>Sık hatalar: her şeyi tek düz tabloya koymak, hedefleri satış satırlarına join etmek, “filtreler aksın” diye her ilişkiyi çift yönlü yapmak. Ayrıntı Model tasarımı II ve Fabric'te yıldız şema derslerinde.</p>

<h2>Rapor eleştirisi turu</h2>
<p>Bir dashboard ekran görüntüsü verilir. İlk dakika konuşma; incele. Sonra eleştiriyi <b>doğruluk → anlam → tasarım</b> önceliğiyle ve gözlem → etki → öneri biçiminde anlat.</p>
<ul>
<li><b>Doğruluk:</b> “Kategori matrisinin toplam satırında marj %249,5 görünüyor. Bu bir oranın satırlarının toplanmış hâli; gerçek marj %36,5. Ölçü SUMX ile kategori marjlarını topluyor olabilir.” Doğruluk hatası her zaman ilk maddedir.</li>
<li><b>Anlam:</b> “Net satış kartında karşılaştırma yok; iyi mi kötü mü bilinmiyor.”</li>
<li><b>Tasarım:</b> “Yedi dilimli pasta grafikte küçük dilimler ayırt edilmiyor; sıralı çubuk daha iyi.”</li>
</ul>
<p>Tam liste Dashboard tasarımı dersindeki eleştiri kontrol listesinde.</p>

<h2>“Bu rakam yanlış” turu: beş adım</h2>
<p>Mülakatçı der ki: “CRM 2023'te 77 müşteri alışveriş yaptı diyor, sizin rapor 79 diyor. Bul.”</p>
<ol>
<li><b>Tanımı sor:</b> “CRM neyi sayıyor? İptal edilen siparişler dahil mi?”</li>
<li><b>Bağlamı sabitle:</b> Aynı dönem, aynı filtreler. Rapordaki dilimleyicileri yaz.</li>
<li><b>En küçük sorguda yeniden üret:</b> İki tanımı yan yana koy. <code>DISTINCTCOUNT(Satislar[MusteriNo])</code> 2023 için 79, <code>[Müşteri Sayısı]</code> 77.</li>
<li><b>Farkı satır düzeyinde bul:</b> Küme farkı sorgusu farkı yapan müşterileri listeler.</li>
<li><b>Düzelt ve testi ekle:</b> Rapordaki görsel yanlış ölçüyü kullanıyordu. Doğru ölçüye geç ve bu karşılaştırmayı test sayfasına ekle.</li>
</ol>
<pre class="dax">EVALUATE
EXCEPT(
    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023),
    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023, Satislar[Durum] &lt;&gt; "İptal")
)</pre>
<p>Sorgu iki müşteri döndürür (78 ve 102): 2023'te yalnızca iptal edilmiş siparişleri var. Aynı turda sık gelen iki varyasyon:</p>
<div class="tbl-wrap"><table><tr><th>Şikâyet</th><th>Rapordaki</th><th>Beklenen</th><th>Kök neden</th></tr>
<tr><td>“Ortalama sipariş tutarı çok düşük”</td><td>AVERAGE(Satislar[Tutar]) = 831 ₺</td><td>1.492,57 ₺</td><td>Satır ortalaması, sipariş ortalaması değil; iptaller de içeride</td></tr>
<tr><td>“Net satış finanstan yüksek”</td><td>1.250.772 ₺</td><td>1.169.937 ₺</td><td>İadeler dahil; fark tam olarak iade tutarı (80.835 ₺)</td></tr></table></div>
<div class="tip"><b>Sesli düşünme kalıbı</b>“Önce tanımı netleştireyim. Sonra aynı bağlamda iki sayıyı yan yana üreteyim. Fark satır düzeyinde nereden geliyor, bulayım. Düzeltmeden önce bir test yazayım ki bir daha olmasın.” Bu dört cümle, doğru formülden daha çok puan getirir.</div>
`, ex: [
  { t:'dax', name:'Çok Kanallı Müşteri', q:'<b>Çok Kanallı Müşteri</b>: Canlı kodlama görevi. Bağlamda, iptal edilmemiş siparişlerde en az iki farklı kanal kullanmış müşteri sayısı. 2024 için 88.', sol:'COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), CALCULATE(DISTINCTCOUNT(Satislar[Kanal]), Satislar[Durum] <> "İptal") >= 2))', hint:'VALUES(Satislar[MusteriNo]) üzerinde FILTER; her müşteri için CALCULATE(DISTINCTCOUNT(Satislar[Kanal]), Durum <> "İptal") >= 2.' },
  { t:'dax', name:'Lider Ürün', q:'<b>Lider Ürün</b>: Takip sorusu. Bağlamda net satışı en yüksek ürünün adı; eşitlikte adları virgülle birleştir. Satış olmayan bağlamda 40 ürünün hepsi listelenmesin: yalnızca satışı olan ürünler aday olsun.', sol:'VAR Satanlar = FILTER(VALUES(Urunler[Urun]), NOT ISBLANK([Net Satış])) VAR Lider = TOPN(1, Satanlar, [Net Satış], DESC) RETURN CONCATENATEX(Lider, Urunler[Urun], ", ")', hint:'Önce FILTER(VALUES(Urunler[Urun]), NOT ISBLANK([Net Satış])), sonra TOPN(1, …), en son CONCATENATEX.' },
  { t:'dax', name:'Sipariş Ortalaması (Düzeltilmiş)', q:'<b>Sipariş Ortalaması (Düzeltilmiş)</b>: “Bu rakam yanlış” turu. Rapordaki ölçü AVERAGE(Satislar[Tutar]) ve tüm dönemde 831 ₺ gösteriyor. Ölçüyü, iptal edilmemiş siparişlerin sipariş başına ortalama tutarını verecek biçimde düzelt (beklenen 1.492,57 ₺).', sol:'DIVIDE(CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal"), CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), Satislar[Durum] <> "İptal"))', hint:'Satır ortalaması değil: toplam tutarı sipariş sayısına böl. İkisinde de iptalleri dışla (ya da hazır ölçüleri kullan).' },
  { t:'query', q:'“CRM 2023’te 77 müşteri diyor, rapor 79 diyor” vakası. 2023’te en az bir satırı olan ama iptal edilmemiş hiçbir siparişi olmayan müşterilerin numaralarını döndüren bir DAX sorgusu yaz.', start:'EVALUATE\n', sol:'EVALUATE\nEXCEPT(\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023),\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023, Satislar[Durum] <> "İptal")\n)', hint:'İki müşteri kümesi kur: 2023’ün tüm müşterileri ve iptal dışı müşterileri. EXCEPT ile farkı al.' },
  { t:'mc', q:'Model tasarım tahtasında soru: “Bir sipariş birden çok kampanya kodu kullanabilir; kampanya etkisini ölçmek istiyoruz.” Tahtaya ilk ne yazarsın?', o:['Satış, kampanya ve hedef olgularının tanecik cümlelerini','Kampanya tablosunun sütun listesini','Satış ile kampanya arasında çift yönlü ilişkiyi','Kampanyaları sipariş satırına virgüllü metin olarak eklemeyi'], a:0, why:'Tanecik cümleleri hangi olgunun hangi düzeyde tutulduğunu ve hangi ilişkilerin gerektiğini belirler; köprü tablo ihtiyacı buradan çıkar. Sütun listesi sonraki adımdır. Çift yönlü ilişki gerekçesiz bir kısayoldur ve belirsiz yollar yaratır. Virgüllü metin filtrelenemez ve toplamları bozar.' },
  { t:'mc', q:'Rapor eleştirisi turunda bir dashboard görüyorsun: pasta grafikte 7 kategori, karşılaştırmasız KPI kartları ve toplam satırında %249,5 marj gösteren bir matris. Eleştirine nereden başlarsın?', o:['Pasta grafiğin sıralı çubukla değişmesinden','KPI kartlarına hedef ve geçen yıl eklenmesinden','Toplam satırındaki marjın yanlış hesaplanmasından','Renk paletinin kurumsal temaya uymamasından'], a:2, why:'Doğruluk hatası her zaman ilk maddedir: %249,5 bir oranın toplanmış hâlidir; gerçek marj %36,5. Yanlış bir sayı, iyi tasarlanmış bir sayfanın tüm güvenilirliğini yok eder. KPI karşılaştırması anlam sorunudur, ikinci sırada gelir. Pasta grafik ve renk tasarım sorunlarıdır, en sonda.' }
] });

})(window);
