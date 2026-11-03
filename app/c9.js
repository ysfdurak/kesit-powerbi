/* Kesit Power BI — dört yeni ders: Service’te rapor kullanmak, rapor brifi, görsel algı, kademeli tasarım. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- 1 · A1 · Başlangıç ---------- */
add('gorsel-temel', {
  id: 'hizmet-kullanici', lv: 'A1', mod: 'Başlangıç', min: 15,
  title: 'Power BI Service’te rapor kullanmak',
  sum: 'Raporu yapan değil, kullanan tarafta ol: Service’te raporu bul, filtrele, ayrıntıya in, kendi görünümünü kaydet, veriyi Excel’e al, abone ol ve Copilot’a sor.',
  body: `
<p>Bu derste Desktop’u kapatıyoruz. Bir meslektaşın raporu yayımladı, sen de tarayıcıdan <b>app.powerbi.com</b> adresine girip onu <b>kullanacaksın</b>. Raporu yapanların da bu dersi bilmesi gerekir: kullanıcının ne yapabildiğini bilmeyen tasarımcı, gereksiz düğmeler ve dilimleyicilerle sayfayı doldurur.</p>

<h2>Service’e giriş: gezinti bölmesi</h2>
<p>Sol kenardaki dikey şerit <b>gezinti bölmesidir (navigation pane)</b>. Bir içeriği bulmanın yolu, onun sana nasıl ulaştığına bağlıdır:</p>
<div class="tbl-wrap"><table>
<tr><th>İçerik sana nasıl geldi?</th><th>Nerede bulursun?</th></tr>
<tr><td>Biri raporu doğrudan seninle paylaştı</td><td><b>Göz at (Browse)</b> → <b>Benimle paylaşılanlar (Shared with me)</b></td></tr>
<tr><td>Ekip, içeriği bir uygulama olarak dağıttı</td><td><b>Uygulamalar (Apps)</b> ya da Giriş sayfasındaki uygulama listesi</td></tr>
<tr><td>Bir ekip çalışma alanının üyesisin</td><td><b>Çalışma alanları (Workspaces)</b> → ilgili alan</td></tr>
<tr><td>Dün açtığın raporu tekrar arıyorsun</td><td><b>Giriş (Home)</b> ya da Göz at → <b>Son kullanılanlar</b>; sık açtığın raporu yıldızla <b>Sık kullanılanlara</b> ekle</td></tr>
<tr><td>E-postayla bir bağlantı ya da abonelik geldi</td><td>Bağlantı raporu doğrudan açar</td></tr>
</table></div>
<p>Çalışma alanı ve uygulamanın yazar tarafındaki anlamı “Yayımlama, yenileme ve yaşam döngüsü” dersinde. Burada yalnızca okuyucuyuz.</p>
<div class="note"><b>Adlar değişebilir</b>Microsoft Service arayüzünü sık yeniler; Türkçe arayüzde bazı adlar farklı çevrilmiş olabilir. Simgeler ve yerleri genelde aynı kalır. Raporların çoğu <b>Okuma görünümünde (Reading view)</b> açılır; <b>Düzenle</b> düğmesi soluksa raporu değiştirme iznin yoktur. Paylaşılan içeriği görmek için genellikle Pro ya da PPU lisansı gerekir; içerik Premium ya da yeterli büyüklükte Fabric kapasitesindeyse ücretsiz kullanıcı da görebilir.</div>

<h2>Raporu okumak: filtreler ve dilimleyiciler</h2>
<ul>
<li><b>Sayfalar:</b> Rapor sayfaları solda listelenir ya da alttaki sekmelerdedir.</li>
<li><b>Dilimleyiciler (Slicer):</b> Sayfanın üstündeki “Yıl”, “Kanal” düğmeleri. Seçim sayfadaki tüm görselleri süzer.</li>
<li><b>Filtreler bölmesi (Filters pane):</b> Sağ kenarda açılır. Yazarın sana açık bıraktığı filtre kartlarını değiştirebilirsin. Kilit simgeli kartı göremez değil, değiştiremezsin; gizli kartı hiç görmezsin ama çalışır.</li>
<li><b>Seçimin hatırlanır:</b> Raporu kapatıp açınca son filtrelerin geri gelir. Yazarın yayımladığı hâle dönmek için eylem çubuğundaki <b>Varsayılana sıfırla (Reset to default)</b> düğmesini kullan.</li>
</ul>
<p>Filtre düzeyleri ve dilimleyici türleri “Filtreler bölmesi ve dilimleyiciler” dersinde ayrıntılı.</p>

<h2>Görsellerle etkileşim</h2>
<div class="tbl-wrap"><table>
<tr><th>Ne yapmak istiyorsun?</th><th>Nasıl?</th></tr>
<tr><td>Bir kategoriye göre tüm sayfayı süzmek</td><td>Çubuğa tıkla: diğer görseller <b>çapraz filtrelenir</b> ya da <b>vurgulanır</b> (seçilmeyen kısım soluklaşır). Ctrl ile birden çok çubuk seçilir. Aynı çubuğa tekrar tıklayınca seçim kalkar.</td></tr>
<tr><td>Yıldan aya inmek</td><td>Görselin üstündeki <b>detaya inme</b> oklarını kullan (görselde hiyerarşi varsa).</td></tr>
<tr><td>Bir görseli büyük görmek</td><td>Görselin köşesindeki <b>Odak modu (Focus mode)</b> simgesi. Geri dönmek için “Rapora dön”.</td></tr>
<tr><td>Sayıların arkasındaki satırları görmek</td><td>Görselin <b>…</b> menüsü → <b>Tablo olarak göster (Show as a table)</b>. Tek bir çubuğa sağ tıklayıp <b>Veri noktasını tablo olarak göster</b> o noktanın ayrıntısını açar.</td></tr>
<tr><td>Bir sayının ayrıntısını hızla görmek</td><td>Üzerine gel: <b>araç ipucu (tooltip)</b> açılır.</td></tr>
<tr><td>Sıralamayı değiştirmek</td><td><b>…</b> → Sıralama ölçütü.</td></tr>
</table></div>
<div class="warn"><b>Her görselde yok</b>“Tablo olarak göster” kart ve KPI gibi görsellerde çalışmaz. Değer kutusunda ölçü varsa “Veri noktasını tablo olarak göster” de çıkmayabilir.</div>

<h2>Kendi görünümünü kaydetmek: kişisel yer işaretleri</h2>
<p>Her sabah raporu açıp “2024, Mobil kanal” seçiyorsan bunu bir kez kaydet. Eylem çubuğundaki <b>Yer işaretleri</b> → <b>Kişisel yer işaretleri</b> → <b>Ekle</b>. Ad ver; raporun hep bu hâlde açılması için <b>Varsayılan yap</b> kutusunu işaretle.</p>
<ul>
<li>Kişisel yer işareti; sayfayı, filtreleri, dilimleyici seçimlerini, sıralamayı ve detaya inme konumunu saklar.</li>
<li>Yalnızca sen görürsün; raporu değiştirmez. Yazarın eklediği <b>rapor yer işaretleri</b> ise herkese görünür.</li>
<li>Bir raporda en fazla 20 kişisel yer işareti tutabilirsin.</li>
</ul>

<h2>Veriyi dışarı almak, abone olmak, uyarı kurmak</h2>
<ul>
<li><b>Excel’e aktarma:</b> Görselin <b>…</b> menüsü → <b>Verileri dışa aktar</b>. Yazarın izin verdiği düzeyde (yalnızca özet ya da temel satırlar) bir .xlsx dosyası iner. Tüm raporu Excel’de PivotTable gibi incelemek için <b>Excel’de Analiz Et</b> vardır. Satır düzeyi güvenlik dışa aktarmada da geçerlidir: görmediğin satırı indiremezsin.</li>
<li><b>Abonelik (Subscribe):</b> Eylem çubuğundaki <b>Abone ol</b> ile sayfanın anlık görüntüsü seçtiğin sıklıkla e-postana gelir.</li>
<li><b>Veri uyarısı (Data alert):</b> Yalnızca <b>panodaki</b> kart, KPI ve gösterge kutucuklarında kurulur. Rapordaki bir kart görselinde uyarı düğmesi yoktur; önce görseli bir panoya sabitlemek gerekir.</li>
</ul>

<h2>Rapor mu, pano mu?</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Rapor (report)</th><th>Pano (dashboard)</th></tr>
<tr><td>Sayfa</td><td>Birden çok sayfa</td><td>Tek sayfa, kutucuklar</td></tr>
<tr><td>Kaynak</td><td>Tek bir anlam modeli</td><td>Farklı raporlardan sabitlenmiş görseller</td></tr>
<tr><td>Etkileşim</td><td>Filtre bölmesi, dilimleyici, detaya inme</td><td>Kutucuğa tıklayınca kaynak rapora gider</td></tr>
<tr><td>Veri uyarısı</td><td>Klasik uyarı yok; Fabric Activator ile kural kurulabilir</td><td>Kart, KPI, gösterge kutucuklarında var</td></tr>
<tr><td>Nerede yapılır?</td><td>Desktop ya da Service</td><td>Yalnızca Service</td></tr>
</table></div>

<h2>Copilot’a soru sormak</h2>
<p>Rapor açıkken <b>Copilot</b> bölmesini açıp doğal dille sorabilirsin: “Bu sayfayı özetle”, “2024’te hangi kategori hedefin üstünde?”. Bizim modelde doğru cevap <b>Kitap</b>’tır (hedef gerçekleşme %100,2); diğer altı kategori hedefin altında. Copilot cevabını rapordaki görsellerle karşılaştır; özellikle “neden” sorularında yorum yapar, kanıt göstermez.</p>
<div class="warn"><b>Copilot herkese açık değil</b>Copilot, çalışma alanı ücretli bir Fabric (F2 ve üstü) ya da Power BI Premium (P1 ve üstü) kapasitesindeyse ya da kurumda bir Fabric Copilot kapasitesi tanımlıysa çalışır. Deneme kapasitelerinde çalışmaz; yönetici kiracı ya da kapasite ayarından kapatmış olabilir. Yalnızca Pro lisanslı paylaşılan bir çalışma alanındaki raporda Copilot bölmesi görünmüyorsa sebep genellikle budur. Eski Soru-Cevap (Q&amp;A) özelliği kaldırılıyor (Learn: Şubat 2027); doğal dil soruları Copilot’la soruluyor.</div>
<div class="tip"><b>Kullanıcı gibi test et</b>Raporu yayımladıktan sonra Service’te bir “Görüntüleyici” hesabıyla aç: filtreleri değiştir, varsayılana sıfırla, Excel’e aktar, kişisel yer işareti ekle. Kullanıcının takıldığı yer, tasarımın düzeltilecek yeridir.</div>
`,
  ex: [
    { t: 'mc', q: 'Bir meslektaşın bir raporu doğrudan seninle paylaştı. Onun çalışma alanının üyesi değilsin. Raporu Service’te en hızlı nerede bulursun?',
      o: ['Göz at → Benimle paylaşılanlar', 'Çalışma alanları → Çalışma alanım', 'Oluştur → Yeni rapor sayfası', 'OneLake kataloğu → Anlam modelleri'], a: 0,
      why: 'Doğrudan paylaşılan raporlar Göz at altındaki “Benimle paylaşılanlar” listesine düşer. Çalışma alanım yalnızca senin içeriğindir; OneLake kataloğu veri varlıklarını listeler.' },
    { t: 'mc', q: 'Kategori grafiğinde “Elektronik” çubuğunun hangi siparişlerden oluştuğunu satır satır görmek istiyorsun. Ne yaparsın?',
      o: ['Grafiği Odak modunda açıp tam ekrana büyütürsün', 'Sağ tık → Veri noktasını tablo olarak göster', 'Raporu Varsayılana sıfırla düğmesiyle yenilersin', 'Kişisel bir yer işareti ekleyip yeniden açarsın'], a: 1,
      why: '“Veri noktasını tablo olarak göster”, seçili noktanın arkasındaki ayrıntı satırlarını açar. Odak modu yalnızca büyütür; yer işareti ve sıfırlama görünüm durumuyla ilgilidir.' },
    { t: 'mc', q: 'Her sabah raporu açıp aynı iki dilimleyici seçimini (2024, Mobil) yapıyorsun. Raporu değiştirme iznin yok. En iyi çözüm hangisi?',
      o: ['Yazardan bu seçimle ayrı bir sayfa eklemesini istemek', 'Raporu indirip Desktop’ta kendi kopyanı düzenlemek', 'Kişisel yer işareti ekleyip Varsayılan yapmak', 'Sayfayı her sabah Excel’e aktarıp süzmek'], a: 2,
      why: 'Kişisel yer işareti düzenleme izni gerektirmez, yalnızca sana görünür ve “Varsayılan yap” ile rapor her açılışta bu hâlde gelir.' },
    { t: 'mc', q: 'Net satış 50.000 ₺’nin altına düşünce e-posta almak istiyorsun ama rapordaki kart görselinde uyarı seçeneği yok. Neden?',
      o: ['Uyarılar yalnızca tablo görsellerinde çalışır', 'Uyarı kurmak için rapor sahibi olmak gerekir', 'Kart görseli yalnızca Desktop’ta uyarı verir', 'Uyarı yalnızca pano kutucuklarında kurulur'], a: 3,
      why: 'Veri uyarıları panodaki kart, KPI ve gösterge kutucuklarında kurulur. Kartı bir panoya sabitledikten sonra kutucuğun menüsünden uyarı eklenir.' },
    { t: 'mc', q: 'Bir rapor, yalnızca Pro lisanslarıyla çalışan paylaşılan bir çalışma alanında. Kullanıcılar Copilot bölmesini göremiyor. En olası sebep?',
      o: ['Raporda Copilot için yeterli sayfa bulunmuyor', 'Alan ücretli Fabric/Premium kapasitede değil', 'Kullanıcılar raporu Okuma görünümünde açıyor', 'Raporun sayfalarında dilimleyici kullanılmış'], a: 1,
      why: 'Copilot için çalışma alanının ücretli Fabric (F2+) ya da Premium (P1+) kapasitesinde olması ya da bir Fabric Copilot kapasitesi gerekir. Okuma görünümü ve dilimleyici engel değildir.' },
    { t: 'mc', q: 'Bir sütun grafiğine tıkladın; sayfadaki diğer grafikler süzülmek yerine soluklaştı ve seçilen kısım koyu kaldı. Bu davranış nedir?',
      o: ['Detaya inme', 'Odak görünümü', 'Çapraz vurgulama', 'Kalıcı filtre'], a: 2,
      why: 'Çapraz vurgulamada seçilmeyen kısım soluklaşır, toplam görünmeye devam eder. Aynı çubuğa tekrar tıklayınca seçim kalkar. Hangi görselin süzüleceğini ya da vurgulanacağını yazar belirler.' }
  ]
});

/* ---------- 2 · A2 · Görselleştirme ---------- */
add('gorsel-secimi', {
  id: 'rapor-brifi', lv: 'A2', mod: 'Görselleştirme', min: 18,
  title: 'Talepten rapor brifine: ihtiyaç toplama ve sayfa planı',
  sum: '“Bana bir satış raporu lazım” cümlesini netleştirme sorularıyla tek sayfalık bir brife, KPI tanımlarını ölçülere, brifi de bir sayfa taslağına ve kabul kriterlerine çevir.',
  body: `
<p>Raporların çoğu kötü grafik yüzünden değil, <b>yanlış soruya cevap verdiği</b> için kullanılmaz. Desktop’u açmadan önce 30 dakikalık bir görüşme ve bir sayfalık bir belge, sonradan üç tur düzeltmeyi önler. Bu belgeye <b>rapor brifi</b> diyoruz.</p>

<h2>Belirsiz talebi netleştirmek</h2>
<p>Satış müdürü yazıyor: <i>“Bana bir satış raporu lazım, her şey olsun.”</i> “Her şey” bir gereksinim değildir. Şu soruları sor ve cevapları not et:</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Neden sorulur?</th><th>Örnek cevap</th></tr>
<tr><td>Raporu kim kullanacak?</td><td>Kitle ayrıntı düzeyini ve dili belirler.</td><td>Satış müdürü ve 3 bölge sorumlusu</td></tr>
<tr><td>Rapora bakınca hangi kararı vereceksin?</td><td>Kararı olmayan grafik süstür.</td><td>Hangi kategoriye kampanya bütçesi kaydırılacak</td></tr>
<tr><td>Ne sıklıkla bakacaksın?</td><td>Yenileme saatini ve varsayılan dönemi belirler.</td><td>Her pazartesi sabahı, haftalık toplantıdan önce</td></tr>
<tr><td>Hangi ayrıntıya kadar inmen gerekiyor?</td><td>Modelin tanecikliğini ve detay sayfasını belirler.</td><td>Kategori ve ürün; tek tek sipariş gerekmez</td></tr>
<tr><td>Neye göre iyi ya da kötü diyeceksin?</td><td>Karşılaştırma ölçütü olmayan sayı yorumlanamaz.</td><td>Hedefe ve geçen yıla göre</td></tr>
<tr><td>“Satış” derken neyi kastediyorsun?</td><td>İptal, iade, KDV, indirim tanımları farklı sonuç verir.</td><td>İptaller hariç, indirim sonrası tutar</td></tr>
<tr><td>Herkes her şeyi görebilir mi?</td><td>Satır düzeyi güvenlik gerekir mi?</td><td>Bölge sorumlusu yalnızca kendi bölgesini görür</td></tr>
<tr><td>Nerede bakacaksın?</td><td>Mobil düzen gerekir mi?</td><td>Masaüstünde; yolda telefonda yalnızca KPI’lar</td></tr>
</table></div>
<div class="tip"><b>“Neden?” diye bir kez daha sor</b>“Ürün bazında satış görmek istiyorum.” “Neden?” “Stok bitmeden sipariş vermek için.” Bu durumda asıl ihtiyaç bir satış grafiği değil, stok gün sayısı listesidir. İlk istek çoğu zaman bir çözüm önerisidir; ihtiyacı ikinci cevapta bulursun.</div>

<h2>Tek sayfalık brif şablonu</h2>
<p>Görüşmenin sonunda cevapları aşağıdaki şablona yaz, talep sahibine gönder ve onay iste. Onaylanan brif, projenin sözleşmesidir: yeni bir istek gelirse brife eklenir ya da sonraki sürüme kalır.</p>
<div class="tbl-wrap"><table>
<tr><th>Alan</th><th>Satış müdürü örneği</th></tr>
<tr><td><b>Amaç</b></td><td>Haftalık toplantıda hedeften sapan kategorileri bulmak ve kampanya bütçesini yeniden dağıtmak.</td></tr>
<tr><td><b>Kitle</b></td><td>Satış müdürü (tüm veri), 3 bölge sorumlusu (kendi bölgesi).</td></tr>
<tr><td><b>Ana sorular</b></td><td>1) Yıl içinde hedefe göre neredeyiz? 2) Hangi kategori geride ve geçen yıla göre nasıl? 3) Satış hangi kanaldan geliyor?</td></tr>
<tr><td><b>KPI’lar</b></td><td>Net satış, hedef gerçekleşme %, sipariş başına ortalama tutar, mobil kanal payı, iptal oranı (tanımlar aşağıda).</td></tr>
<tr><td><b>Filtreler</b></td><td>Yıl, çeyrek, bölge, kanal. Varsayılan: içinde bulunulan yıl.</td></tr>
<tr><td><b>Kaynaklar</b></td><td>Satislar, Hedefler, Urunler, Musteriler, Tarih tabloları.</td></tr>
<tr><td><b>Güncelleme</b></td><td>Her gün 06:00 yenileme; pazartesi 07:30’da e-posta aboneliği.</td></tr>
<tr><td><b>Kapsam dışı</b></td><td>Sipariş düzeyinde liste, temsilci primleri (ayrı rapor).</td></tr>
<tr><td><b>Sahip ve onay</b></td><td>Talep sahibi, rapor geliştiricisi, veri sahibi; onay tarihi.</td></tr>
</table></div>

<h2>KPI tanımını ölçüye çevirmek</h2>
<p>Her KPI için üç satır yaz: <b>iş tanımı</b> (talep sahibinin cümlesi), <b>DAX ölçüsü</b> ve <b>bilinen bir değer</b>. Bilinen değer, test sırasında rapordaki sayıyı doğrulamanı sağlar. Bizim modelde 2024 için:</p>
<div class="tbl-wrap"><table>
<tr><th>KPI</th><th>İş tanımı</th><th>Ölçü</th><th>2024</th></tr>
<tr><td>Net satış</td><td>İptaller hariç, indirim sonrası tutar</td><td><code>[Net Satış]</code></td><td>747.065,70 ₺</td></tr>
<tr><td>Hedef gerçekleşme</td><td>Net satış ÷ aylık kategori hedeflerinin toplamı</td><td><code>[Hedef Gerçekleşme %]</code></td><td>%97,9 (hedef 763.200 ₺)</td></tr>
<tr><td>Ortalama sepet</td><td>İptal olmayan sipariş başına net satış</td><td><code>[Ortalama Sepet]</code></td><td>1.515,35 ₺ (493 sipariş)</td></tr>
<tr><td>Mobil payı</td><td>Mobil kanalın net satıştaki payı</td><td>Alıştırmada yazacaksın</td><td>%46,4</td></tr>
<tr><td>İptal oranı</td><td>İptal satırı ÷ tüm satırlar</td><td><code>[İptal Oranı %]</code></td><td>%8,0</td></tr>
</table></div>
<p>Görüşmede müdür bir cümle ekledi: <i>“Ortalama sepette iadeleri de saymayalım.”</i> İlk akla gelen çözüm hazır ölçüye bir filtre eklemektir:</p>
<pre class="dax">Sepet (hatalı deneme) =
CALCULATE([Ortalama Sepet], Satislar[Durum] &lt;&gt; "İade")</pre>
<p>Sonuç değişmez: hâlâ 1.492,57 ₺ (tüm yıllar). Sebep, <code>[Net Satış]</code> ve <code>[Sipariş Sayısı]</code> ölçülerinin içinde zaten <code>Satislar[Durum] &lt;&gt; "İptal"</code> filtresi olmasıdır. İçteki CALCULATE aynı sütuna yeni filtre koyunca dıştaki filtrenin <b>üzerine yazar</b>; iade yeniden hesaba girer. Doğru yol, iki durumu tek filtrede dışlayan yeni bir ölçü yazmaktır (alıştırma 1). Doğru sonuç tüm yıllar için 1.496,08 ₺.</p>
<div class="warn"><b>Brifteki her “hariç” bir test maddesidir</b>Tanımı yazdığın ölçünün gerçekten o satırları dışladığını bir kontrol sorgusuyla doğrula. Hazır ölçüleri kullanmadan önce içlerinde hangi filtrelerin gömülü olduğunu oku.</div>

<h2>Sayfa yerleşimi taslağı</h2>
<p>Taslak, gerçek veriyle değil <b>kutularla</b> çizilir: kâğıtta, PowerPoint’te ya da Power BI’da boş şekillerle. Amaç, talep sahibinin “evet, aradığım bu” demesini veri bağlamadan önce almaktır. Okuma yönü Z desenini izler:</p>
<div class="tbl-wrap"><table>
<tr><th>Bölge</th><th>İçerik</th><th>Cevapladığı soru</th></tr>
<tr><td>Üst şerit (sol → sağ)</td><td>4 KPI kartı: Net satış, Hedef gerçekleşme, Ortalama sepet, Mobil payı; her birinin altında geçen yıla göre fark</td><td>1. soru: Neredeyiz?</td></tr>
<tr><td>Orta sol</td><td>Aylık net satış ve hedef çizgisi</td><td>1. soru: Eğilim ne yönde?</td></tr>
<tr><td>Orta sağ</td><td>Kategoriye göre hedef gerçekleşme (yatay çubuk, sıralı)</td><td>2. soru: Kim geride?</td></tr>
<tr><td>Alt</td><td>Kategori × kanal matrisi; ürün detayına geçiş</td><td>3. soru ve ayrıntı</td></tr>
<tr><td>Üst ya da sol kenar</td><td>Yıl, çeyrek, bölge, kanal dilimleyicileri</td><td>Filtreler</td></tr>
</table></div>
<p>Taslaktaki her kutunun yanına brifteki hangi soruya cevap verdiğini yaz. Hiçbir soruya bağlanmayan kutu taslaktan çıkar. Düzen ilkeleri için “Rapor tasarımı: bir vaka çalışması”, görsel türü için “Doğru görseli seçmek” derslerine bak.</p>

<h2>Kabul kriterleri</h2>
<p>“Rapor bitti mi?” sorusunun cevabı brifte önceden yazılı olmalı. Her kriter ölçülebilir olsun:</p>
<ol>
<li><b>Doğruluk:</b> 2024 net satışı finansın kapanış raporuyla en fazla %0,5 farklı (beklenen 747.065,70 ₺).</li>
<li><b>Tanım:</b> Her KPI kartının araç ipucunda brifteki iş tanımı yazıyor.</li>
<li><b>Güvenlik:</b> Bir bölge sorumlusu hesabıyla test edildi, başka bölge görünmüyor.</li>
<li><b>Hız:</b> Sayfa, Performans Analizi’nde 3 saniyenin altında yükleniyor.</li>
<li><b>Kullanım:</b> Müdür, yardım almadan üç ana soruyu 2 dakikada cevaplayabiliyor.</li>
<li><b>Güncellik:</b> Pazartesi aboneliği bir hafta boyunca zamanında geldi.</li>
</ol>
<div class="tip"><b>Brifi raporun içinde sakla</b>Rapora gizli bir “Hakkında” sayfası ekleyip amaç, KPI tanımları ve güncelleme saatini oraya yaz. Bir yıl sonra raporu devralan kişi, “bu sayı neden finansla tutmuyor?” sorusunun cevabını orada bulur.</div>
`,
  ex: [
    { t: 'dax', name: 'İade Hariç Sepet',
      q: '<b>İade Hariç Sepet</b>: Brifteki tanım: “İptal ve iade olmayan siparişlerin ortalama tutarı.” Satislar[Tutar] toplamını, aynı satırlardaki farklı Satislar[SiparisNo] sayısına böl. Durumu "İptal" ya da "İade" olan satırları dışla.',
      sol: 'DIVIDE(CALCULATE(SUM(Satislar[Tutar]), NOT Satislar[Durum] IN {"İptal", "İade"}), CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), NOT Satislar[Durum] IN {"İptal", "İade"}))',
      hint: 'Hazır [Net Satış] içindeki iptal filtresi senin filtrenin üzerine yazar. Ham SUM ve DISTINCTCOUNT kullan; filtre: NOT Satislar[Durum] IN {"İptal", "İade"}. İkisini DIVIDE ile böl.' },
    { t: 'dax', name: 'Mobil Kanal Payı',
      q: '<b>Mobil Kanal Payı</b>: Brifteki tanım: “Mobil kanalın net satıştaki payı.” Mobil kanalın [Net Satış] değerini, o bağlamdaki tüm kanalların [Net Satış] değerine böl.',
      sol: 'DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Mobil"), [Net Satış])',
      hint: 'Pay: CALCULATE([Net Satış], Satislar[Kanal] = "Mobil"). Payda: [Net Satış]. DIVIDE ile böl.' },
    { t: 'dax', name: 'Müşteri Başına Adet',
      q: '<b>Müşteri Başına Adet</b>: Depo müdürü brife bir KPI ekledi: “İptal olmayan siparişlerde bir müşteri ortalama kaç ürün adedi alıyor?” Hazır ölçüleri kullan.',
      sol: 'DIVIDE([Satılan Adet], [Müşteri Sayısı])',
      hint: '[Satılan Adet] ve [Müşteri Sayısı] ikisi de iptalleri dışlar. DIVIDE([Satılan Adet], [Müşteri Sayısı]).' },
    { t: 'mc', q: 'Bir yönetici “Bana bir müşteri raporu lazım” dedi. Görüşmede ilk netleştirmen gereken soru hangisi?',
      o: ['Raporda hangi kurumsal renkler kullanılsın?', 'Bu raporla hangi kararı vereceksin?', 'Kaç sayfa olsun ve hangi temayı seçelim?', 'Pasta grafiği mi çubuk grafiği mi seversin?'], a: 1,
      why: 'Karar sorusu raporun amacını, KPI’ları ve ayrıntı düzeyini belirler. Renk, tema ve grafik türü bu cevaptan sonra gelir.' },
    { t: 'mc', q: 'Brifte “Satış” diye bir KPI var ama tanım satırı boş. Bu neden risklidir?',
      o: ['Kart görseli tanım metnini kabul etmez', 'İptal/iade seçimine göre sayı değişir', 'Ölçü adı en az iki kelimeden oluşmalıdır', 'Tanımsız ölçü Power BI’da hata verir'], a: 1,
      why: 'Aynı modelde “satış” brüt tutar, iptal hariç tutar ya da iade hariç tutar olabilir; her biri farklı sayı verir. Tanımsız KPI, test sırasında “hangisi doğru?” tartışmasına döner.' },
    { t: 'mc', q: 'Hangisi iyi yazılmış bir kabul kriteridir?',
      o: ['Rapor kullanıcı dostu, modern ve sade görünmeli', 'Sayılar her zaman mümkün olduğunca doğru olmalı', 'Sayfa hızlı açılmalı ve göze güzel görünmeli', 'Sayfa 3 sn altında açılır (Performans Analizi)'], a: 3,
      why: 'Kabul kriteri ölçülebilir ve test edilebilir olmalı. “Kullanıcı dostu”, “hızlı”, “mümkün olduğunca doğru” kişiden kişiye değişir; 3 saniye eşiği ise ölçülür.' }
  ]
});

/* ---------- 3 · B1 · Görselleştirme ---------- */
add('gorsel-ilkeler', {
  id: 'gorsel-algi', lv: 'B1', mod: 'Görselleştirme', min: 20,
  title: 'Görsel algı: bilişsel yük, küçük katlar, kombo ve dağılım grafikleri',
  sum: 'Göz neyi önce görür, okuyucunun zihnini ne yorar? Ön-dikkat özellikleri, vurgu, küçük katlar, ikincil eksen tuzağı, dağılım ve kabarcık grafiği, yığılmış ve %100 yığılmış farkı, gösterge ve KPI görselinin yerinde kullanımı.',
  body: `
<p>“Görselleştirme ilkeleri” dersi neyi yapman gerektiğini söyledi: az öğe, tutarlı renk, sıfırdan başlayan eksen. Bu ders <b>nedenini</b> anlatıyor: insan gözü bazı farkları aramadan görür, bazılarını ise ancak tek tek okuyarak bulur. Tasarım, önemli bilgiyi birinci gruba koymaktır.</p>

<h2>Ön-dikkat özellikleri</h2>
<p><b>Ön-dikkat özellikleri (preattentive attributes)</b>, beynin bilinçli olarak aramaya başlamadan önce fark ettiği görsel farklardır. Yirmi gri noktanın arasındaki tek turuncu noktayı aramazsın; o kendini gösterir. Ancak her özellik büyüklüğü aynı doğrulukla taşımaz:</p>
<div class="tbl-wrap"><table>
<tr><th>Özellik</th><th>Büyüklük karşılaştırmasında</th><th>En iyi kullanım</th><th>Power BI’da</th></tr>
<tr><td>Ortak eksende konum</td><td>En doğru</td><td>Değer karşılaştırma</td><td>Çizgi, nokta, dağılım</td></tr>
<tr><td>Uzunluk</td><td>Çok iyi</td><td>Kategori karşılaştırma</td><td>Çubuk ve sütun</td></tr>
<tr><td>Açı ve alan</td><td>Zayıf</td><td>Kaba pay (2–3 dilim)</td><td>Pasta, halka, kabarcık boyutu</td></tr>
<tr><td>Renk koyuluğu</td><td>Kaba</td><td>Isı haritası, yoğunluk</td><td>Matriste renk skalası</td></tr>
<tr><td>Renk tonu</td><td>Büyüklük taşımaz</td><td>Grup kimliği, vurgu</td><td>Gösterge, veri renkleri</td></tr>
</table></div>
<p>Sonuç: Kesin karşılaştırma istiyorsan <b>konum ve uzunluk</b> kullan. Renk tonunu “bu grup farklı” ya da “buraya bak” demek için sakla.</p>

<h2>Bilişsel yükü azaltmak</h2>
<p>Okuyucunun zihni, grafiği okurken bir yandan göstergedeki rengi eşleştiriyor, eksendeki sayıyı tahmin ediyor, birimi çeviriyorsa mesaja yer kalmaz. Kategoriye göre net satış grafiğinde şu adımları uygula:</p>
<ol>
<li><b>Doğrudan etiketle:</b> Göstergeyi kaldır, seri adını çizginin ucuna ya da çubuğun yanına yaz. Göz ileri geri gitmez.</li>
<li><b>Veri etiketi ya da eksen, ikisi değil:</b> Çubuklarda değer yazıyorsa y eksenini kapat; ekseni tutuyorsan etiketleri kaldır.</li>
<li><b>Birimi başlığa taşı:</b> Her etikette “339.303,65 ₺” yerine başlıkta “bin ₺” yaz, etikette 339 kalsın.</li>
<li><b>Izgara çizgilerini soluklaştır</b> ya da kaldır; kenarlık ve gölgeyi kapat.</li>
<li><b>Sırala:</b> Kategoriler büyükten küçüğe. Okuyucu sıralamayı kendi kafasında yapmak zorunda kalmasın.</li>
</ol>

<h2>Vurgu: tek renk ve bulgu başlığı</h2>
<p>2024’te kategorilerin hedef gerçekleşme oranları %83,6 (Hediye) ile %100,2 (Kitap) arasında. Yedi çubuğu yedi renge boyarsan okuyucu “hangisi önemli?” diye sorar. Bunun yerine:</p>
<ul>
<li>Tüm çubuklar açık gri, yalnızca <b>Kitap</b> vurgu renginde.</li>
<li>Başlık konuyu değil <b>bulguyu</b> söylesin: “Kategoriye göre hedef gerçekleşme” değil, “2024’te hedefi yalnızca Kitap tuttu”.</li>
<li>Hedef çizgisini (%100) Analiz bölmesinden sabit çizgi olarak ekle; çubukların çizgiyi geçip geçmediği konumla okunur.</li>
</ul>
<p>Vurgu rengini dinamik yapmak için çubuk renginde “Alan değeri” ile renk kodu döndüren bir ölçü kullanılır (“Koşullu biçimlendirme ve KPI’lar” dersi).</p>

<h2>Küçük katlar ne zaman?</h2>
<p><b>Küçük katlar (small multiples)</b>, aynı grafiği bir alanın her değeri için yan yana çizer. Çizgi grafiğinde üç kanalın aylık satışını tek grafikte üst üste çizmek yerine üç küçük panel kullanırsın.</p>
<ul>
<li><b>İyi olduğu durum:</b> 3–12 grup, her grubun <b>şekli</b> (mevsimsellik, eğilim) merak ediliyor, seriler üst üste binince spagetti oluyor.</li>
<li><b>Ortak eksen:</b> Paneller aynı ölçeği paylaşır; karşılaştırma dürüst kalır. Bedeli: küçük grup ezilir. Bizim modelde 2024’te Mobil 346.353 ₺, Mağaza 123.997 ₺; Mağaza paneli düz bir çizgi gibi görünebilir. Şekil merak ediliyorsa her paneli kendi payı (%) ile göster.</li>
<li><b>Kötü olduğu durum:</b> Tek bir sayıyı karşılaştırmak (her panelde bir çubuk). Bu durumda tek bir sıralı çubuk grafik daha iyidir.</li>
</ul>

<h2>Kombo grafik ve ikincil eksen tuzağı</h2>
<p>“Çizgi ve kümelenmiş sütun” grafiği, sütunda bir ölçüyü, çizgide başka bir ölçüyü gösterir. Farklı birimler (₺ ve %) için ikincil y ekseni açılır. Tuzak şurada: her eksen kendi verisine göre <b>otomatik ölçeklenir</b>.</p>
<p>2024’te aylık net satış 34.233,55 ₺ (Nisan) ile 94.000,95 ₺ (Aralık) arasında, yani yaklaşık üç kat oynuyor. Kâr marjı ise %36,3 ile %40,8 arasında, 4,5 puan. İkincil eksen otomatik olarak yaklaşık %36–%41 aralığına sıkışınca, marjdaki küçük oynama satıştaki üç katlık değişimle aynı yükseklikte görünür. İki çizginin kesiştiği nokta da hiçbir anlam taşımaz: kesişme, iki eksenin nereden başladığının bir sonucudur.</p>
<ul>
<li>İkincil eksenin başlangıcını (Biçim → Y ekseni (ikincil) → Aralık) <b>0</b>’a sabitle; marjın aslında ne kadar sabit olduğu görünür.</li>
<li>Ya da iki ayrı grafiği aynı x ekseniyle alt alta hizala.</li>
<li>Ya da marjı yalnızca araç ipucuna koy.</li>
</ul>
<div class="warn"><b>Kural</b>İkincil eksen ancak iki ölçünün <b>birlikte hareketi</b> konuşulacaksa ve okuyucu iki ölçeği bilinçli okuyacaksa kullanılır. “Daha az yer kaplasın” bir gerekçe değildir.</div>

<h2>Dağılım ve kabarcık grafiği</h2>
<p><b>Dağılım grafiği (scatter)</b>, iki ölçü arasındaki <b>ilişkiyi</b> gösterir. Soru: “Çok indirim yaptığımız ürünlerde marj düşük mü?” Değerler kutusuna <code>Urunler[Urun]</code>, X eksenine indirim oranı, Y eksenine <code>[Kâr Marjı %]</code>, Boyut kutusuna <code>[Net Satış]</code> koyarsın; grafik bir <b>kabarcık grafiğine</b> dönüşür.</p>
<p>Satışı olan 38 ürün için korelasyon yaklaşık <b>−0,23</b>: zayıf, negatif bir ilişki. Grafikte bunun anlamı, bulutun hafif aşağı eğik olması ama çok dağınık kalmasıdır. Örneğin Robot Süpürge %6,8 indirimle %43 marj yaparken, Termos 750ml %6,2 indirimle %29 marjda. “İndirim marjı öldürüyor” demek için bu grafik yetmez.</p>
<p>X eksenindeki indirim oranının iki tanımı vardır ve nokta konumları buna göre değişir:</p>
<pre class="dax">Tutar Ağırlıklı İndirim =
[Ortalama İndirim %]

Satır Ortalaması İndirim =
CALCULATE(AVERAGE(Satislar[Indirim]), Satislar[Durum] &lt;&gt; "İptal")</pre>
<p>İlki indirim tutarını brüt tutara oranlar; büyük siparişler daha çok ağırlık taşır (tüm model: %3,2). İkincisi her satış satırını eşit sayar (%3,3). Kategorilerde fark daha belirgin: Elektronik’te %2,3’e karşı %3,0. Hangisini kullandığını eksen başlığına yaz.</p>
<ul>
<li><b>Ortalama çizgileri:</b> Analiz bölmesinden X ve Y için ortalama çizgisi ekle; grafik dört bölgeye ayrılır (“yüksek indirim, düşük marj” köşesi aksiyon listesidir).</li>
<li><b>Kabarcık boyutu:</b> Göz alanı kötü karşılaştırır. Boyutu “önemli olanı fark et” için kullan, kesin sıralama için değil.</li>
<li><b>Oynatma ekseni (Play axis):</b> <code>Tarih[Yil]</code> koyunca noktalar yıldan yıla hareket eder. Sunumda etkileyicidir; analizde zordur, çünkü göz aynı anda 38 noktanın yolunu izleyemez. Tek bir ürünü seçip izini göstermek daha okunur.</li>
</ul>

<h2>Yığılmış mı, %100 yığılmış mı?</h2>
<p>Kanallara göre yıllık net satış:</p>
<div class="tbl-wrap"><table>
<tr><th>Yıl</th><th>Mobil</th><th>Web</th><th>Mağaza</th><th>Mobil payı</th><th>Mağaza payı</th></tr>
<tr><td>2022</td><td>51.296,80</td><td>35.879,90</td><td>15.660,50</td><td>%49,9</td><td>%15,2</td></tr>
<tr><td>2023</td><td>202.191,70</td><td>144.735,10</td><td>53.942,75</td><td>%50,4</td><td>%13,5</td></tr>
<tr><td>2024</td><td>346.352,70</td><td>276.715,90</td><td>123.997,10</td><td>%46,4</td><td>%16,6</td></tr>
</table></div>
<ul>
<li><b>Yığılmış sütun:</b> Toplam yükseklik ve en alttaki seri kolay okunur. Mesaj: “Satış yedi kattan fazla büyüdü.” Ortadaki ve üstteki seriler ortak bir taban çizgisinden başlamadığı için zor karşılaştırılır.</li>
<li><b>%100 yığılmış sütun:</b> Her sütun 100’e tamamlanır; toplam büyüklük kaybolur. Mesaj: “Mobilin payı 2024’te geriledi, Mağaza toparlandı.” Mutlak satış büyüdüğü hâlde payın düştüğünü yalnızca bu görünüm gösterir.</li>
<li>Her ikisinde de en önemli seriyi tabana koy; taban ortak eksen gibi çalışır.</li>
</ul>

<h2>Gösterge ve KPI görseli</h2>
<p>Kurulum adımları “Koşullu biçimlendirme ve KPI’lar” dersinde. Algı açısından:</p>
<ul>
<li><b>Gösterge (gauge)</b>, tek bir sayı için çok yer kaplar ve değeri açıyla okutur (zayıf özellik). Kullanacaksan <b>maksimumu</b> anlamlı belirle: otomatik maksimum, değerin iki katı olabilir ve %97,9’luk gerçekleşmeyi yarım gibi gösterir. Maksimumu hedefin %120’si gibi sabit bir değere bağla.</li>
<li><b>KPI görseli</b> değer, hedef ve eğilimi birlikte verir; eğilim ekseni (ay) olmadan kullanma.</li>
<li>Birden çok KPI için çoğu zaman <b>kart + referans etiketi</b> (“Hedef: 763.200 ₺ · %97,9”) daha az yer kaplar ve sayıyı doğrudan okutur.</li>
</ul>
`,
  ex: [
    { t: 'dax', name: 'Satır Ortalaması İndirim',
      q: '<b>Satır Ortalaması İndirim</b>: Dağılım grafiğinin X ekseni için, iptal edilmemiş satış satırlarındaki Satislar[Indirim] değerlerinin basit ortalamasını hesapla (her satır eşit ağırlıkta).',
      sol: 'CALCULATE(AVERAGE(Satislar[Indirim]), Satislar[Durum] <> "İptal")',
      hint: 'AVERAGE(Satislar[Indirim]) ifadesini CALCULATE içine al ve Satislar[Durum] <> "İptal" filtresini ekle.' },
    { t: 'dax', name: 'Ürün Başına Ortalama Satış',
      q: '<b>Ürün Başına Ortalama Satış</b>: Kabarcık grafiğinde kategorileri karşılaştırmak için, bağlamdaki her ürünün [Net Satış] değerini hesaplayıp bunların ortalamasını al. Satışı olmayan ürünler ortalamaya girmesin.',
      sol: 'AVERAGEX(VALUES(Urunler[Urun]), [Net Satış])',
      hint: 'AVERAGEX(VALUES(Urunler[Urun]), [Net Satış]). AVERAGEX boş (BLANK) sonuçları ortalamaya katmaz.' },
    { t: 'mc', q: 'Aylık net satış (sütun) ve kâr marjı (çizgi, ikincil eksen) aynı grafikte. Marj %36–%41 arasında oynuyor ama çizgi satış kadar dalgalı görünüyor. En doğru düzeltme?',
      o: ['Çizginin rengini daha açık bir tona çekmek', 'İkincil eksenin alt sınırını 0 yapmak', 'Sütunları yığılmış sütun grafiğine çevirmek', 'Veri etiketlerini her iki seride de açmak'], a: 1,
      why: 'İkincil eksen kendi verisine göre dar bir aralığa ölçeklenince küçük oynama büyük görünür. Başlangıcı 0’a sabitlemek ya da iki ayrı grafik kullanmak gerçek oranı gösterir.' },
    { t: 'mc', q: 'Kanalların satış <b>payının</b> yıllar içinde nasıl değiştiğini göstermek istiyorsun; toplam büyüme bu grafiğin konusu değil. Hangi görsel?',
      o: ['Yığılmış sütun grafik', 'Kümelenmiş sütun grafik', '%100 yığılmış sütun grafik', 'Her yıl için ayrı pasta grafik'], a: 2,
      why: '%100 yığılmış görünümde her sütun 100’e tamamlanır; pay değişimi doğrudan okunur. Yığılmış sütun toplam büyümeyi öne çıkarır, payı gizler.' },
    { t: 'mc', q: 'Yedi kategoriden yalnızca birinin hedefi tuttuğunu anlatmak istiyorsun. Algı açısından en etkili düzen hangisi?',
      o: ['Her çubuğa farklı renk ve ayrıntılı gösterge', 'Gri çubuklar, Kitap vurgulu, bulgu başlığı', 'Pasta grafikte Kitap dilimini dışarı çekmek', 'Tüm çubuklar yeşil, Kitap kalın kenarlı'], a: 1,
      why: 'Tek vurgu rengi ön-dikkat özelliği olarak hemen fark edilir; başlık bulguyu söyler. Gökkuşağı renkler her çubuğu eşit önemli gösterir, pasta ise açıyla okutur.' },
    { t: 'mc', q: 'Üç kanalın aylık satış çizgileri üst üste binip okunmuyor. Her kanalın mevsimsel şekli merak ediliyor. Ne yaparsın?',
      o: ['Çizgileri kalınlaştırıp renkleri koyulaştırırsın', 'Küçük katlar ile her kanala ayrı bir panel', 'Bir kanalı ikincil y eksenine taşırsın', 'Grafiği huni grafiğine dönüştürürsün'], a: 1,
      why: 'Küçük katlar aynı grafiği her kanal için ayrı panelde, ortak eksenle çizer; şekiller karışmadan karşılaştırılır. İkincil eksen ölçeği bozar.' }
  ]
});

/* ---------- 4 · B2 · Görselleştirme ---------- */
add('hikaye', {
  id: 'kademeli-tasarim', lv: 'B2', mod: 'Görselleştirme', min: 22,
  title: 'Kullanıcı odaklı tasarım: kademeli açığa çıkarma, düğme durumları ve simgeler',
  sum: 'Özeti önde tut, ayrıntıyı kullanıcı istedikçe aç: göster/gizle paneller, beş düğme durumu ve ölçüyle dinamik düğme metni, alan parametresiyle görsel değiştirme, UNICHAR ile durum okları, filtre bölmesi ve tema JSON varsayılanları, mobilde aynı ilke.',
  body: `
<p>Bir sayfaya koyabileceğin her şeyi koyarsan kullanıcı hiçbir şeyi görmez. <b>Kademeli açığa çıkarma (progressive disclosure)</b>, bilgiyi katmanlara ayırıp her katmanı kullanıcı bir adım attığında göstermektir. Yer işareti, Seçim bölmesi, detay sayfası ve araç ipucunun mekaniği “Raporla hikâye anlatmak” dersinde; burada bu araçlarla <b>kullanıcı odaklı</b> bir arayüz kuruyoruz.</p>

<h2>Üç katman</h2>
<div class="tbl-wrap"><table>
<tr><th>Katman</th><th>Soru</th><th>İçerik</th><th>Nasıl açılır?</th></tr>
<tr><td>1 · Özet</td><td>İyi mi, kötü mü?</td><td>3–4 KPI kartı, durum okları</td><td>Sayfa açılınca görünür</td></tr>
<tr><td>2 · Açıklama</td><td>Nerede, ne zaman?</td><td>Eğilim, kategori karşılaştırması</td><td>Kaydırma, sekme düğmesi, alan parametresi</td></tr>
<tr><td>3 · Ayrıntı</td><td>Hangi kayıtlar?</td><td>Tablo, ürün listesi</td><td>Panel, detay sayfası, araç ipucu</td></tr>
</table></div>
<p>Kural: Bir katmanı açmak <b>tek bir tıklama</b> olmalı ve kullanıcı her zaman geri dönebilmeli. Gizlenen bilgi, gizlendiğini belli etmeli; aksi hâlde kullanıcı onun varlığından haberdar olmaz.</p>

<h2>Göster/gizle paneli</h2>
<p>En sık kalıp, sayfayı dolduran dilimleyicileri ve açıklama metinlerini bir <b>yan panele</b> toplamaktır. Kullanıcı “Filtreler” düğmesine basınca panel kayar gibi açılır.</p>
<ol>
<li>Bir dikdörtgen şekil (panel arka planı), dilimleyiciler ve bir “Kapat ×” düğmesi yerleştir.</li>
<li>Seçim bölmesinde bunları seçip <b>grupla</b>; grubu “Filtre Paneli” diye adlandır.</li>
<li>Panel açıkken bir yer işareti ekle: “Panel açık”. Panel grubunu gizleyip ikinci yer işaretini ekle: “Panel kapalı”.</li>
<li>Her iki yer işaretinde <b>Veri</b> seçeneğini kapat (kullanıcının seçtiği filtreler korunur), <b>Görüntü</b> açık kalsın ve <b>Seçili görseller</b> ile yalnızca panel grubunu kapsa. Böylece yer işareti sayfadaki diğer görsellerin durumunu değiştirmez.</li>
<li>“Filtreler” düğmesine Eylem → Yer işareti → “Panel açık”, “Kapat ×” düğmesine “Panel kapalı” bağla.</li>
</ol>
<div class="warn"><b>Gizli panel, gizli filtre demektir</b>Panel kapalıyken kullanıcı hangi filtrenin seçili olduğunu göremez. Bunu düğmenin metninde söyle (aşağıdaki ölçü) ya da sayfa başlığına seçimi yazan bir metin ölçüsü koy.</div>
<pre class="dax">Filtre Düğmesi Metni =
IF(
    ISFILTERED(Satislar[Kanal]),
    "Filtreler • " &amp; COUNTROWS(VALUES(Satislar[Kanal])) &amp; " kanal",
    "Filtreler"
)</pre>
<p>Hiç kanal seçilmemişse düğmede yalnızca “Filtreler” yazar; Web ve Mobil seçiliyse “Filtreler • 2 kanal”. Kullanıcı panel kapalıyken de bir filtrenin etkin olduğunu anlar.</p>

<h2>Düğme durumları ve dinamik düğme metni</h2>
<p>Bir düğme beş durumda ayrı biçimlendirilebilir. Biçim → <b>Düğme</b> → <b>Stil</b> (ya da Şekil) kartında <b>Ayarları uygula: Durum</b> listesinden durumu seçip o durumun dolgusunu, metnini, kenarlığını ayarlarsın:</p>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Ne zaman?</th><th>Tasarım önerisi</th></tr>
<tr><td>Varsayılan (Default)</td><td>Düğmeye dokunulmuyor</td><td>Tema rengi, okunur metin</td></tr>
<tr><td>Üzerine gelince (On hover)</td><td>Fare üstünde</td><td>Biraz koyulaşan dolgu; “tıklanabilirim” der</td></tr>
<tr><td>Basıldığında (On press)</td><td>Tıklama anı</td><td>Daha koyu dolgu ya da içe basık kenarlık</td></tr>
<tr><td>Devre dışı (Disabled)</td><td>Eylem yapılamıyor (ör. detaya git için seçim yok)</td><td>Gri dolgu ve ne yapılması gerektiğini söyleyen metin</td></tr>
<tr><td>Yükleniyor (Loading)</td><td>Veri işlevi eylemi sürerken</td><td>Kısa “İşleniyor…” metni</td></tr>
</table></div>
<p><b>Dinamik metin:</b> Stil → Metin kutusunun yanındaki <b>fx</b> düğmesi → Biçim stili: <b>Alan değeri</b> → metin döndüren bir ölçü seç. Aynı yolla dolgu rengini de bir ölçüye bağlarsın. Detaya git düğmesi kullanıcı tek bir öğe seçene kadar zaten devre dışı kalır; metin ölçüsü ona ne seçmesi gerektiğini söyler, renk ölçüsü durumu görünür kılar (alıştırma 2 ve 3). Desktop’ta düğmeyi denemek için Ctrl + tıklama.</p>
<div class="note"><b>Telefonda “üzerine gelme” yok</b>Dokunmatik ekranda üzerine gelince durumu hiç görünmez. Bir düğmenin tıklanabilir olduğunu yalnızca hover rengine bırakma; varsayılan durum da düğme gibi görünmeli.</div>

<h2>Alan parametresiyle görsel değiştirme</h2>
<p>“Grafik / Tablo” geçişi için iki görsel ve iki yer işareti gerekir. Aynı görselde yalnızca <b>ölçüyü ya da ekseni</b> değiştirmek istiyorsan alan parametresi daha sade bir katman sağlar: tek grafik, bir düğme dilimleyici (“Satış · Kâr · Sipariş”), hiç yer işareti yok. Oluşturma adımları “Hesaplama grupları, alan parametreleri, görsel hesaplamalar” dersinde. Arka planda oluşan tablo şuna benzer:</p>
<pre class="dax" data-notry>Ölçü Seçimi = {
    ("Net Satış", NAMEOF('Ölçüler'[Net Satış]), 0),
    ("Brüt Kâr", NAMEOF('Ölçüler'[Brüt Kâr]), 1),
    ("Sipariş Sayısı", NAMEOF('Ölçüler'[Sipariş Sayısı]), 2)
}</pre>
<ul>
<li><b>Alan parametresi:</b> Aynı görsel türü, farklı alan. Filtreler doğal olarak korunur, bakımı kolaydır.</li>
<li><b>Yer işareti geçişi:</b> Farklı görsel türleri (çizgi ↔ matris) ya da farklı düzenler arasında.</li>
<li>Seçili alanı başlığa yazmayı unutma; aksi hâlde ekran görüntüsünde hangi ölçünün çizildiği anlaşılmaz.</li>
</ul>

<h2>Tablolarda simgeler: Unicode ve UNICHAR</h2>
<p>Matriste bir sayının yanındaki küçük ok, satırı okumadan durumu söyler (katman 1’i tablonun içine taşır). <code>UNICHAR(kod)</code>, verilen Unicode kod noktasındaki karakteri döndürür:</p>
<div class="tbl-wrap"><table>
<tr><th>Karakter</th><th>Kod</th><th>Kullanım</th></tr>
<tr><td>▲</td><td>9650</td><td>Artış</td></tr>
<tr><td>▼</td><td>9660</td><td>Azalış</td></tr>
<tr><td>▬</td><td>9644</td><td>Yatay (eşik içinde)</td></tr>
<tr><td>●</td><td>9679</td><td>Durum noktası (renkle birlikte)</td></tr>
<tr><td>🟢</td><td>128994</td><td>Renkli emoji; yazı tipine ve cihaza göre farklı görünür</td></tr>
</table></div>
<pre class="dax">Aylık Eğilim Simgesi =
VAR Degisim = [MoM %]
RETURN
    SWITCH(
        TRUE(),
        ISBLANK(Degisim), BLANK(),
        Degisim &gt; 0.02, UNICHAR(9650),
        Degisim &lt; -0.02, UNICHAR(9660),
        UNICHAR(9644)
    )</pre>
<p>Matrise <code>Tarih[YilAy]</code> koyunca 2024-03’te ▲ (önceki aya göre +%41,5), 2024-04’te ▼ (−%45,9) görünür. ±%2 eşiği, gürültüyü “yatay” sayar; eşiği brifte iş birimiyle birlikte belirle.</p>
<ul>
<li><b>Renk:</b> Simge ölçüsü metin döndürür. Rengi, aynı koşulu kullanan ayrı bir renk ölçüsüyle Yazı rengi → fx → Alan değeri üzerinden ver. Renk + şekil birlikte renk körü kullanıcıyı da korur.</li>
<li><b>Sıralama:</b> Metin ölçüsü alfabetik sıralanır. Sıralama gerekiyorsa sayısal ölçüyü ayrı sütunda tut.</li>
<li><b>Emoji:</b> PDF, abonelik e-postası ve bazı cihazlarda farklı görünebilir. Kurumsal raporlarda geometrik şekiller (▲▼●) daha güvenlidir.</li>
</ul>

<h2>Filtre bölmesini kullanıcıya göre ayarlamak</h2>
<p>Kilitleme ve gizlemenin anlamı “Filtreler bölmesi ve dilimleyiciler” dersinde. Kademeli açığa çıkarma açısından filtre bölmesi, sayfada yer kaplamayan hazır bir “3. katman” panelidir:</p>
<ul>
<li><b>Biçimlendir:</b> Tuvalin boş yerine tıkla → Biçim → <b>Filtreler bölmesi</b> (arka plan, simge, sol kenarlık) ve <b>Filtre kartları</b>. Kartlarda <b>Varsayılan</b> ve <b>Uygulanan</b> durumlara farklı renk ver; uygulanan filtre ilk bakışta fark edilsin.</li>
<li><b>Sadeleştir:</b> Teknik filtreleri gizle, iş kurallarını kilitle, kartları çift tıklayıp anlaşılır adlarla yeniden adlandır, en sık kullanılanı sürükleyip en üste al.</li>
<li><b>Sınırla:</b> Seçenekler → Rapor ayarları → “Kullanıcıların filtre türlerini değiştirmesine izin ver” kutusunu kaldır. Çok filtreli sayfada Sorgu azaltma ayarından tek bir <b>Uygula</b> düğmesi ekle.</li>
<li><b>Bölmeyi tamamen gizlemek</b> için Filtreler başlığının yanındaki göz simgesi. Web’de yayımla raporlarında filtre bölmesi zaten görünmez; orada dilimleyici kullan.</li>
</ul>

<h2>Tema JSON ile varsayılanlar</h2>
<p>Her düğmeyi, her filtre kartını tek tek biçimlendirmek yerine kuralları temaya yaz (tema dosyasının temel yapısı “Temalar, sayfa ayarları ve tuval tasarımı” dersinde). Filtre bölmesi ayarları <code>visualStyles</code> altında <code>page</code> girdisine yazılır:</p>
<pre class="dax" data-notry>{
  "name": "Kesit Sade",
  "textClasses": {
    "label":   { "fontFace": "Segoe UI", "fontSize": 10, "color": "#3B3A36" },
    "callout": { "fontFace": "Segoe UI Semibold", "fontSize": 28 }
  },
  "visualStyles": {
    "page": { "*": {
      "outspacePane": [{ "backgroundColor": { "solid": { "color": "#F6F5F1" } }, "fontFamily": "Segoe UI" }],
      "filterCard": [
        { "$id": "Applied",   "backgroundColor": { "solid": { "color": "#DCE9F8" } }, "border": true },
        { "$id": "Available", "backgroundColor": { "solid": { "color": "#FFFFFF" } } }
      ]
    } }
  }
}</pre>
<p><code>Applied</code> uygulanmış filtre kartını, <code>Available</code> boştaki kartı biçimler. Tema bir kez yüklenince yeni eklenen her sayfa aynı varsayılanla gelir.</p>

<h2>Mobilde kademeli açığa çıkarma</h2>
<ul>
<li>Telefon ekranında katman 1 (KPI kartları ve oklar) üstte kalır; ayrıntı tablosu mobil düzene konmaz, detay sayfasına bırakılır.</li>
<li>Mobil düzen otomatik oluşturulduğunda gizli görseller de yerleştirilir; görünürlüğü değiştiren yer işaretleri mobilde de çalışır. Gizli bir görsel tuvalde yer kaplar, boşluk varmış gibi görünse de oraya başka şey koyma.</li>
<li>Telefonda üzerine gelme olmadığı için araç ipucuna gömülü bilgi zor bulunur. Önemli ayrıntıyı dokunarak açılan bir panele ya da detay sayfasına taşı.</li>
<li>Düğmeleri parmakla rahat basılacak kadar büyük yap; yan yana çok küçük düğme yanlış dokunmaya yol açar.</li>
</ul>
`,
  ex: [
    { t: 'dax', name: 'Aylık Değişim Etiketi', grid: [{ t: 'Tarih', c: 'YilAy' }], noTotal: true,
      q: '<b>Aylık Değişim Etiketi</b>: Matrisin bir sütunu için [MoM %] değerine göre metin üret: değer boşsa BLANK; 0 ya da üstüyse UNICHAR(9650), negatifse UNICHAR(9660); ardından bir boşluk ve değişimin <b>mutlak değeri</b> FORMAT(…, "0.0%") ile. Örnek: “▼ 45,9%”.',
      sol: 'VAR D = [MoM %] RETURN IF(ISBLANK(D), BLANK(), IF(D >= 0, UNICHAR(9650), UNICHAR(9660)) & " " & FORMAT(ABS(D), "0.0%"))',
      hint: 'VAR D = [MoM %] RETURN IF(ISBLANK(D), BLANK(), IF(D >= 0, UNICHAR(9650), UNICHAR(9660)) & " " & FORMAT(ABS(D), "0.0%")). Ok yönü taşıdığı için sayının işaretini ABS ile kaldır.' },
    { t: 'dax', name: 'Kategori Düğmesi Metni',
      q: '<b>Kategori Düğmesi Metni</b>: Bir “Detaya git” düğmesinin metni. Tek bir kategori seçiliyse kategori adının sonuna " ayrıntısını aç" ekle (ör. “Kitap ayrıntısını aç”); değilse "Önce bir kategori seç" döndür. Kategoriler[Kategori] sütununu kullan.',
      sol: 'IF(HASONEVALUE(Kategoriler[Kategori]), SELECTEDVALUE(Kategoriler[Kategori]) & " ayrıntısını aç", "Önce bir kategori seç")',
      hint: 'IF(HASONEVALUE(Kategoriler[Kategori]), SELECTEDVALUE(Kategoriler[Kategori]) & " ayrıntısını aç", "Önce bir kategori seç").' },
    { t: 'dax', name: 'Düğme Dolgu Rengi',
      q: '<b>Düğme Dolgu Rengi</b>: Aynı düğmenin dolgusu için: tek bir kategori seçiliyse "#2A78D6", değilse soluk gri "#C8C6C0" döndür.',
      sol: 'IF(HASONEVALUE(Kategoriler[Kategori]), "#2A78D6", "#C8C6C0")',
      hint: 'HASONEVALUE(Kategoriler[Kategori]) koşuluyla iki renk kodundan birini döndüren bir IF.' },
    { t: 'mc', q: 'Göster/gizle filtre paneli için iki yer işareti kurdun. Kullanıcı paneli kapatınca seçtiği kanal filtresi sıfırlanıyor. Ne değiştirmelisin?',
      o: ['Yer işaretlerinde Veri seçeneğini kapat', 'Panel grubunu çözüp nesneleri tek tek gizle', 'Görünüm menüsünden dilimleyicileri eşitle', 'Paneli ayrı bir rapor sayfasına taşı'], a: 0,
      why: 'Veri seçeneği açık bir yer işareti, kaydedildiği andaki filtreleri geri yükler. Görünürlük için yalnızca Görüntü açık kalmalı; kullanıcının filtreleri korunur.' },
    { t: 'mc', q: 'Bir detaya git düğmesi, kullanıcı seçim yapmadan tıklanamıyor. Kullanıcıya bunu en açık biçimde nasıl anlatırsın?',
      o: ['Düğmenin üzerine gelince rengini değiştir', 'Sayfanın üstüne uzun bir yardım metni ekle', 'Gri devre dışı durumu ve yönlendiren metin', 'Seçim yapılana kadar düğmeyi sayfadan kaldır'], a: 2,
      why: 'Devre dışı durumu ayrıca biçimlendirilir; dinamik metin (“Önce bir kategori seç”) ne yapılması gerektiğini söyler. Hover telefonda görünmez, düğmeyi kaldırmak ise özelliği gizler.' },
    { t: 'mc', q: 'Tek bir çizgi grafikte kullanıcı Net Satış, Brüt Kâr ve Sipariş Sayısı arasında geçiş yapmak istiyor. Bakımı en kolay çözüm?',
      o: ['Üç grafik ve üç yer işareti', 'Ölçülerden bir alan parametresi', 'Üç ayrı rapor sayfası', 'Her ölçü için ayrı detay sayfası'], a: 1,
      why: 'Alan parametresi tek görselde ölçü değiştirir; yer işareti, ek görsel ve sayfa gerektirmez, filtreler doğal olarak korunur.' },
    { t: 'mc', q: 'Tema JSON’unda uygulanmış filtre kartlarını boştaki kartlardan farklı renkte göstermek istiyorsun. Hangi ayar?',
      o: ['textClasses içinde label', 'dataColors dizisinin ilk rengi', 'filterCard altında $id: "Applied"', 'good / neutral / bad renkleri'], a: 2,
      why: 'Filtre kartları visualStyles → page altındaki filterCard girdisiyle biçimlenir; "Applied" uygulanmış, "Available" boştaki kart içindir.' }
  ]
});

})(window);
