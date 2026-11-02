/* Kesit Power BI — c12: Copilot ve modeli yapay zekâya hazırlamak, yapay zekânın DAX'ını denetlemek, Python ve R, Fabric'e giriş, Fabric'te yıldız şema (SCD2, köprü, Delta bakımı) */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- 1. Copilot ile çalışmak (B2 · Analiz) ---------- */
add('analiz-ozellikleri', {
  id: 'copilot', lv: 'B2', mod: 'Analiz', min: 20,
  title: 'Copilot ile çalışmak ve modeli yapay zekâya hazırlamak',
  sum: 'Copilot’un Power BI’daki yerleri, kapasite ve kiracı gereksinimleri, Soru-Cevap’tan Copilot’a geçiş, “Yapay zekâ için verileri hazırla” ile veri şeması, onaylı cevaplar ve talimatlar; iyi soru yazmak ve cevabı doğrulamak.',
  body: `
<p>Copilot, Power BI’da doğal dille soru sorduğun, rapor sayfası istediğin ya da DAX yazdırdığın yapay zekâ yardımcısıdır. Ama Copilot <b>modelini</b> okur: tablo, sütun ve ölçü adlarını, açıklamaları, ilişkileri. Model dağınıksa cevap da dağınık olur. Bu derste önce Copilot’un nerede olduğunu, sonra modeli ona nasıl hazırlayacağını öğreneceksin. DAX tarafındaki ilk adımlar “Hızlı ölçüler ve Copilot ile DAX” dersinde; burada rapor, model ve yönetim tarafına odaklanıyoruz.</p>

<h2>Copilot Power BI’da nerede?</h2>
<div class="tbl-wrap"><table>
<tr><th>Yer</th><th>Ne yapar?</th><th>Durum</th></tr>
<tr><td>Rapor Copilot bölmesi (Copilot pane)</td><td>Açık raporla sohbet: soru sorarsın, sayfanın ya da raporun özetini alırsın. Düzenleme modunda yeni rapor sayfası önerir ve oluşturur.</td><td>Genel kullanım</td></tr>
<tr><td>Anlatı görseli (Narrative)</td><td>Sayfadaki görselleri metinle özetler; filtre değişince metin de güncellenir.</td><td>Genel kullanım</td></tr>
<tr><td>DAX sorgu görünümü (DAX query view)</td><td><code>Ctrl+I</code> ile Copilot: doğal dilden DAX sorgusu yazar, “Bu sorguyu açıkla” ile kodu anlatır, “Bir DAX konusunu açıkla” ile fonksiyon anlatır.</td><td>Desktop’ta Önizleme özellikleri altından açılır</td></tr>
<tr><td>Ölçü açıklamaları</td><td>Bir ölçünün DAX’ını okuyup açıklama (description) önerir.</td><td>Model yazarı için</td></tr>
<tr><td>Bağımsız Copilot (standalone)</td><td>Hizmette sol gezinti çubuğundaki simge: tüm raporlar ve modeller arasında arar, soruyu doğru öğeye yönlendirir.</td><td><b>Önizleme</b></td></tr>
<tr><td>Web modellemede Copilot</td><td>Hizmette modeli inceler; ölçü, tablo, sütun ve ilişki düzenler.</td><td><b>Önizleme</b></td></tr>
</table></div>
<p>Rapor bölmesinde bir <b>yetenek seçici</b> (skill picker) vardır: “Veriyle ilgili soruları yanıtla”, “Rapor görsellerini analiz et” ve “Yeni rapor sayfası oluştur”. Test ederken hangi yeteneği kullandığını bilerek seç; çünkü aşağıda göreceğin ayarların bir kısmı yalnızca veri sorularını etkiler.</p>

<h2>Gereksinimler: Copilot neden görünmüyor?</h2>
<ul>
<li><b>Kapasite:</b> Çalışma alanı ücretli bir Fabric kapasitesinde (F2 ve üstü) ya da Power BI Premium’da (P1 ve üstü) olmalı. Deneme kapasiteleri desteklenmez. Alternatif olarak yönetici bir <b>Fabric Copilot kapasitesi</b> atayabilir; o zaman yapay zekâ tüketimi oraya faturalanır.</li>
<li><b>Lisans:</b> Yalnızca Pro ya da Kullanıcı Başına Premium (PPU) lisansı Copilot için yetmez; kuruluşun kapasitesi gerekir.</li>
<li><b>Kiracı ayarı:</b> Yönetim portalında “Users can use Copilot and other features powered by Azure OpenAI” açık olmalı. Bağımsız Copilot için ayrıca kendi ayarı vardır ve kiracı düzeyinde açılmalıdır.</li>
<li><b>Bölge:</b> Azure OpenAI’ın bulunmadığı bölgelerde verinin bölge dışında işlenmesine izin veren ayar gerekir. ABD ve AB veri sınırı dışında bu ayar kapalı geldiği için Copilot da kapalı başlar.</li>
<li><b>Desktop:</b> İlk kullanımda Copilot uyumlu bir çalışma alanı seçersin; bu alanda en az Katkıda bulunan (Contributor) rolün olmalı.</li>
<li><b>Dil:</b> Learn, İngilizce dışındaki dillerin resmî olarak desteklenmediğini söylüyor. Türkçe sorular çoğu zaman anlaşılır, ama kritik sorularda İngilizce sormak ve cevabı mutlaka doğrulamak daha güvenli.</li>
</ul>
<div class="note"><b>Önbellek</b>Model değişmediyse aynı soruya 24 saat içinde önbellekten aynı cevap gelir; “sohbeti temizle” bunu değiştirmez. Ayarları değiştirip test ediyorsan soruyu biraz değiştir ya da modeli yenile.</div>

<h2>Soru-Cevap’tan Copilot’a geçiş</h2>
<p>Soru-Cevap (Q&amp;A) görseli ve Q&amp;A kurulum ekranı emekliye ayrılıyor. Microsoft’un duyurusu Aralık 2026’yı veriyor; bazı Learn sayfalarındaki güncel uyarı ise Şubat 2027 diyor. Tarih ne olursa olsun yeni rapora Soru-Cevap koyma. Yerine geçenler:</p>
<div class="tbl-wrap"><table>
<tr><th>Soru-Cevap nerede kullanılıyordu?</th><th>Yerine</th></tr>
<tr><td>Rapordaki Soru-Cevap görseli</td><td>Rapor Copilot bölmesi</td></tr>
<tr><td>Panodaki soru kutusu</td><td>Bağımsız Copilot (önizleme)</td></tr>
<tr><td>Mobil uygulama</td><td>Power BI Mobile’da Copilot</td></tr>
<tr><td>Q&amp;A kurulumu (eş anlamlılar, ifadeler, öğretme)</td><td>Yapay zekâ için verileri hazırla</td></tr>
</table></div>
<p>Bir ayrıntı: “Yapay zekâ için verileri hazırla” bugün hâlâ modelde Soru-Cevap’ın <b>açık</b> olmasını ister; çünkü Copilot, metin sütunlarındaki değerleri (ör. “Ege”, “Premium”) bu dizinle tanır. Soru-Cevap görselini kaldırırken model ayarını kapatma.</p>

<h2>Yapay zekâ için verileri hazırla (Prep data for AI) — önizleme</h2>
<p>Desktop’ta <b>Giriş</b> şeridinde Copilot düğmesinin yanındadır; hizmette anlam modelinin sayfasında. Yaptığın her şey <b>anlam modeline</b> kaydedilir, rapora değil; o modeli kullanan tüm raporlar yararlanır.</p>
<ol>
<li><b>Yapay zekâ veri şeması (AI data schema):</b> Copilot’un öncelik vereceği alanları seçersin. Bizim modelde <code>Satislar[SatirNo]</code>, <code>KohortAyFarki</code>, <code>TopNSecim</code>, <code>OlcuSecimi</code> gibi yardımcı alanların Copilot’a gösterilmesine gerek yok. Modelde gizli alanlar ilk kurulumda otomatik olarak dışarıda kalır. Şema yalnızca veri sorularını etkiler; rapor özeti, sayfa oluşturma ve DAX sorgu üretimi tüm modeli kullanır.</li>
<li><b>Onaylı cevaplar (verified answers):</b> Bir görseli seçip <b>…</b> menüsünden “Onaylı cevap ayarla” dersin ve tetikleyici ifadeler eklersin: “kanallara göre ciro”, “hangi kanal ne kadar sattı”. Kullanıcı benzer bir şey sorduğunda Copilot senin hazırladığın görseli döndürür. Sık sorulan, yanlış anlaşılmaya açık sorular için idealdir.</li>
<li><b>Yapay zekâ talimatları (AI instructions):</b> En çok 10.000 karakterlik serbest metin. İş terimleri, varsayılan ölçüler ve belirsizlikte ne yapılacağı yazılır. Kullanıcılar talimatları göremez ve kapatamaz.</li>
</ol>
<pre>Ölçüler
- "Ciro", "satış" ya da "gelir" denince [Net Satış] kullan; [Toplam Satış] iptalleri de içerir.
- Kâr oranı için [Kâr Marjı %] kullan; satır düzeyindeki marjların ortalamasını alma.

Tarihler
- Tarih filtresi ve zaman karşılaştırması için her zaman Tarih tablosunu kullan, Satislar[Tarih]'i değil.
- "Geçen yıl" sorularında [Satış GY] ölçüsünü kullan.

Terimler
- "Temsilci", "satıcı" ve "satış uzmanı" aynı şeydir: Calisanlar[AdSoyad].
- "Kurumsal müşteri" Musteriler[Segment] = "Kurumsal" demektir.

Belirsizlik
- "Performans" sorusunda hangi ölçünün kastedildiği belli değilse kullanıcıya sor.</pre>
<p>Model hazır olunca hizmette modelin ayarlarından <b>Copilot için onaylı</b> (Approved for Copilot) kutusunu işaretleyebilirsin. Yönetici, bağımsız Copilot’un yalnızca onaylı içerikte arama yapmasını isteyebilir; onaysız modeller o zaman hiç görünmez.</p>

<h2>Modeli okunur kılmak</h2>
<ul>
<li><b>Adlandırma:</b> Kullanıcının söyleyeceği kelimeyi kullan. <code>Tbl_F_Sls</code> yerine <code>Satislar</code>, <code>M1</code> yerine <code>Net Satış</code>. Aynı şeye iki ad verme.</li>
<li><b>Açıklamalar:</b> Ölçü ve sütunlara açıklama yaz (“İptaller hariç, KDV hariç ciro”). DAX Copilot açıklamanın yalnızca ilk 200 karakterini okur; en önemli bilgiyi başa koy.</li>
<li><b>Gizli alanlar:</b> Anahtar sütunları, sıralama yardımcılarını, ara ölçüleri gizle. Gizlenen her alan, Copilot’un yanlış alanı seçme ihtimalini azaltır.</li>
<li><b>Eş anlamlılar:</b> Bugün Model görünümündeki Özellikler bölmesinde ve Q&amp;A kurulumunda duruyor. Q&amp;A kurulumu kalkarken Learn, terim eşlemesini yapay zekâ talimatlarıyla yapmayı gösteriyor (“satıcı = temsilci”). Kalıcı yeri için güncel belgeleri izle.</li>
<li><b>Yapı:</b> Yıldız şema, işaretli tarih tablosu, doğru özetleme ayarları (yıl sütunu toplanmasın), açık ölçüler. Copilot’un sorunlarının çoğu model sorunudur.</li>
</ul>

<h2>İyi soru yazmak</h2>
<div class="tbl-wrap"><table>
<tr><th>Zayıf soru</th><th>Daha iyi soru</th><th>Neden?</th></tr>
<tr><td>satışlar nasıl?</td><td>2024’te kanallara göre Net Satış ve geçen yıla göre değişim yüzdesi</td><td>Ölçü, dönem ve kırılım belli.</td></tr>
<tr><td>en iyi ürünler</td><td>2024’te Net Satış’a göre ilk 5 ürün, kategorileriyle</td><td>“En iyi”nin ölçüsü ve sayısı verildi.</td></tr>
<tr><td>bir sayfa yap</td><td>Bölge müdürü için tek sayfa: üstte Net Satış, Hedef Gerçekleşme % ve YoY % kartları; altta aylık trend ve bölgelere göre çubuk grafik</td><td>Kitle, kartlar ve görseller tanımlı.</td></tr>
<tr><td>bu ölçü ne?</td><td>[Kümülatif Satış] ölçüsünün mantığını adım adım açıkla; ALL(Tarih[Tarih]) neden var?</td><td>Neyin açıklanacağı belli.</td></tr>
</table></div>

<h2>Sınırlar ve doğrulama sorumluluğu</h2>
<p>Copilot olasılıksal çalışır: aynı soru farklı günlerde farklı kurgulanabilir. Model meta verisini okur ama iş kurallarını bilmez. Bu yüzden son sorumluluk sende:</p>
<ul>
<li><b>Bilinen bir sayıyla karşılaştır:</b> Bu modelde Net Satış toplamı yaklaşık 1.250.772 ₺, Toplam Satış ise 1.346.190 ₺. Copilot “ciro”ya ikinci sayıyı veriyorsa iptalleri dahil etmiştir.</li>
<li><b>Hangi alanı kullandığına bak:</b> Copilot’un oluşturduğu görselde alan kutularını aç.</li>
<li><b>Yazdığı DAX’ı oku:</b> Ayrıntılı denetim listesi “Yapay zekânın yazdığı DAX’ı denetlemek” dersinde.</li>
<li><b>Sayfa özetini yayına koymadan önce oku:</b> Anlatı görseli yanlış bir neden-sonuç cümlesi kurabilir.</li>
</ul>
<div class="warn"><b>Güvenlik ve gizlilik</b>Copilot kullanıcının izinlerine uyar: satır düzeyi güvenlik (RLS) varsa yalnızca görebildiği veriyle cevap verir. Yine de duyarlı alanları (maaş, e-posta) yapay zekâ veri şemasından çıkarmak iyi bir alışkanlıktır.</div>
`,
  ex: [
    { t: 'mc', q: 'Pro lisanslı bir kullanıcı, paylaşılan kapasitedeki (Pro) çalışma alanında Copilot düğmesini göremiyor. En olası neden?', o: ['Rapor sayfasına henüz anlatı görseli eklenmediği için düğme gizli', 'Kullanıcının Desktop sürümü eski', 'Çalışma alanı Copilot’u destekleyen ücretli bir kapasitede değil', 'Modelde tarih tablosu işaretlenmemiş'], a: 2, why: 'Copilot ücretli Fabric (F2+) ya da Premium (P1+) kapasite ister; deneme kapasitesi ve tek başına Pro/PPU lisansı yetmez. Yönetici bir Fabric Copilot kapasitesi de atayabilir.' },
    { t: 'mc', q: 'Bir panodaki Soru-Cevap kutusunu kullanan yöneticiler için Soru-Cevap kalktıktan sonra önerilen yol hangisi?', o: ['Bağımsız Copilot', 'Panoya sayfalandırılmış rapor eklemek', 'Q&amp;A görselini rapora taşımak', 'Anahtar etkileyiciler görseli'], a: 0, why: 'Microsoft panolardaki Soru-Cevap için bağımsız (standalone) Copilot deneyimini öneriyor; o deneyim şu an önizlemede. Rapordaki Soru-Cevap görselinin yerini rapor Copilot bölmesi alır.' },
    { t: 'mc', q: '“Yapay zekâ için verileri hazırla” ile yazdığın yapay zekâ talimatları nereye kaydedilir?', o: ['Yalnızca açık olan rapor dosyasına', 'Kullanıcının kişisel Copilot ayarlarına', 'Kiracı yönetim portalındaki Copilot ayarına', 'Anlam modeline'], a: 3, why: 'Veri şeması, onaylı cevaplar ve talimatlar anlam modeline kaydedilir; o modeli kullanan bütün raporlar ve Copilot deneyimleri yararlanır.' },
    { t: 'mc', q: 'Kullanıcılar “ciro” diye sorunca Copilot iptalleri de içeren [Toplam Satış]’ı kullanıyor. En kalıcı çözüm?', o: ['Her kullanıcıya soruyu İngilizce sormasını söylemek', 'Talimata “ciro = [Net Satış]” yazmak, Toplam Satış’ı gizlemek', '[Toplam Satış] ölçüsünü silip raporu yeniden yayımlamak', 'Rapor sayfasına “Ciro = Net Satış” yazan bir metin kutusu koymak'], a: 1, why: 'Terim eşlemesi yapay zekâ talimatlarının işidir; kullanılmaması gereken ara ölçüyü gizlemek (ya da şemadan çıkarmak) yanlış seçim ihtimalini azaltır. Silmek başka raporları bozabilir; metin kutusu Copilot’u etkilemez.' },
    { t: 'mc', q: 'Yapay zekâ veri şemasından çıkardığın bir alan hangi Copilot işinde yine de kullanılabilir?', o: ['Veriyle ilgili soruları yanıtlarken', 'Hiçbirinde: alan Copilot’tan tamamen gizlenir', 'Yalnızca onaylı cevaplarda', 'DAX sorgu görünümünde sorgu üretirken'], a: 3, why: 'Learn’e göre veri şeması yalnızca veri sorularını yanıtlayan yetenekleri etkiler; rapor sayfası oluşturma ve DAX sorgu üretimi tüm modeli kullanır. Gerçekten saklamak istediğin alanı modelde gizle ya da güvenlikle koru.' },
    { t: 'dax', name: 'Mobil Satış Payı %', q: '<b>Mobil Satış Payı %</b>: Copilot şu ölçüyü önerdi: <code>DIVIDE(CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] = "Mobil"), SUM(Satislar[Tutar]))</code>. Ölçü iptal edilen siparişleri de sayıyor. Hazır <code>[Net Satış]</code> ölçüsünü kullanarak düzeltilmiş hâlini yaz.', sol: 'DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Mobil"), [Net Satış])', hint: 'Pay ve paydada SUM(Satislar[Tutar]) yerine [Net Satış] kullan; payda için CALCULATE gerekmez.' }
  ]
});

/* ---------- 2. Yapay zekânın yazdığı DAX'ı denetlemek (C1 · İleri DAX) ---------- */
add('baglam-gecisi', {
  id: 'yz-dax-denetim', lv: 'C1', mod: 'İleri DAX', min: 22,
  title: 'Yapay zekânın yazdığı DAX’ı denetlemek',
  sum: 'Copilot ve sohbet asistanlarının sık yaptığı DAX hataları (uydurma adlar, SUM yerine SUMX, toplam satırı, olgu tarihiyle zaman zekâsı, ALL, VAR zamanlaması, bölme, performans) ve bir öneriyi rapora koymadan önce uygulanacak denetim listesi.',
  body: `
<p>Yapay zekâ asistanları DAX’ı hızlı yazar; ama modelini görmeden yazar ve <b>çalışan</b> kodla <b>doğru</b> kodu ayırt etmez. Bir ölçü hata vermeden çalışıp yanlış sayı üretebilir. Bu derste asistanların en sık yaptığı hataları bizim modelde göreceğiz: her hata için önce “önerilen” kod, sonra düzeltilmiş hâli. Arka plan için “Bağlam geçişi”, “CALCULATE” ve “Zaman zekâsı” derslerine dönebilirsin.</p>

<h2>1 · Var olmayan sütun ya da ölçü</h2>
<p>Asistan, genel bir satış modeli varsayar ve <code>Satislar[Ciro]</code> ya da <code>[Total Revenue]</code> gibi adlar uydurur. Bu en masum hatadır, çünkü motor hemen hata verir:</p>
<pre class="dax" data-notry>Ciro (önerilen) = SUM(Satislar[Ciro])   -- böyle bir sütun yok</pre>
<p>Asıl tehlike, adın <b>var olup yanlış</b> olmasıdır: <code>Satislar[Tutar]</code> gerçekten var ama iptalleri de içerir. Bizim modelde ciro için <code>[Net Satış]</code> kullanılır. Asistana soru sorarken tablo, sütun ve ölçü listesini ver; “yalnızca bu adları kullan” de.</p>

<h2>2 · SUM × SUM ya da SUMX gereken yerde SUM</h2>
<pre class="dax">Brüt Ciro (önerilen) = SUM(Satislar[Adet]) * SUM(Satislar[BirimFiyat])</pre>
<p>Bu kod iki toplamı çarpar: bizim modelde yaklaşık 2,97 milyar ₺ çıkar. Doğru hesap her satırda adet × fiyat yapıp sonra toplar (yaklaşık 1,29 milyon ₺, iptaller hariç):</p>
<pre class="dax">Brüt Ciro =
CALCULATE(
    SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat]),
    Satislar[Durum] &lt;&gt; "İptal"
)</pre>
<p>Ters hata da görülür: tek bir sütunu toplamak için <code>SUMX(Satislar, Satislar[Tutar])</code> yazmak. Sonuç aynıdır ama gereksizdir; <code>SUM</code> yeter.</p>

<h2>3 · Gereksiz FILTER(Tablo)</h2>
<pre class="dax">Web Satışı (önerilen) = CALCULATE([Net Satış], FILTER(Satislar, Satislar[Kanal] = "Web"))</pre>
<pre class="dax">Web Satışı = CALCULATE([Net Satış], Satislar[Kanal] = "Web")</pre>
<p>İkisi de 457.331 ₺ verir. Ama ilki tüm olgu tablosunu satır satır tarar ve genişletilmiş tabloyu filtre olarak uygular; büyük modelde yavaştır ve bazı bağlamlarda farklı sonuç verir. Kural: tek sütuna koşul koyacaksan sütun filtresi yaz, <code>FILTER</code>’ı ölçüye bağlı koşullar için sakla.</p>

<h2>4 · Toplam satırında yanlış sonuç</h2>
<pre class="dax">Hedef Aşımı (önerilen) = IF([Net Satış] &gt; [Hedef], [Net Satış] - [Hedef], 0)</pre>
<p>Bu ölçü bir ayda hedefi aşan kategoride doğru farkı gösterir. Ama toplam satırında toplam satışla toplam hedefi karşılaştırır: bizim modelde üç yılın tamamında satış hedefin altında kaldığı için toplam <b>0</b> çıkar. Oysa tek tek aylarda ve kategorilerde aşımlar vardır. Toplamın, ayrıntıların toplamı olması gerekiyorsa ayrıntı düzeyinde dolaş:</p>
<pre class="dax">Hedef Aşımı =
SUMX(
    CROSSJOIN(VALUES(Kategoriler[Kategori]), VALUES(Tarih[YilAy])),
    VAR Fark = [Net Satış] - [Hedef]
    RETURN IF(Fark &gt; 0, Fark)
)</pre>
<p>Bu hâliyle toplam 33.447 ₺ olur. Asistanlar toplam satırını neredeyse hiç düşünmez; her öneriyi bir matriste toplam satırıyla birlikte dene.</p>

<h2>5 · Zaman zekâsında olgu tablosunun tarihi</h2>
<pre class="dax">Satış GY (önerilen) = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Satislar[Tarih]))</pre>
<p>Yıl dilimleyicisi <code>Tarih</code> tablosundan gelir. Kod, olgu tablosundaki tarihleri bir yıl geri kaydırır ama <code>Tarih[Yil]</code> filtresi yerinde kalır: 2024 satırında “2024’te olup 2023 tarihli satışlar” istenir ve sonuç <b>boş</b> çıkar. Zaman zekâsı fonksiyonlarına her zaman işaretli tarih tablosunun sütununu ver: <code>SAMEPERIODLASTYEAR(Tarih[Tarih])</code>.</p>

<h2>6 · ALL ile dilimleyiciyi silmek</h2>
<pre class="dax">Seçili Dönem Toplamı (önerilen) = CALCULATE([Net Satış], ALL(Tarih))</pre>
<p>Amaç “seçili yılların toplamı” ise bu kod yanlıştır: <code>ALL(Tarih)</code> yıl dilimleyicisini de siler ve her satırda 1.250.772 ₺ gösterir. Seçime saygı için <code>ALLSELECTED</code>, yalnızca belirli bir sütunun filtresini kaldırmak için <code>REMOVEFILTERS(Tablo[Sütun])</code> kullan. “FILTER, ALL, ALLEXCEPT, ALLSELECTED” dersindeki üç pay türünü hatırla.</p>

<h2>7 · VAR, CALCULATE’ten önce hesaplanır</h2>
<pre class="dax">Web Payı (önerilen) =
VAR S = [Net Satış]
RETURN DIVIDE(CALCULATE(S, Satislar[Kanal] = "Web"), S)</pre>
<p>Değişken tanımlandığı yerde ve bir kez hesaplanır. <code>CALCULATE(S, …)</code> artık bir sayıyı filtreler; sayı değişmez. Sonuç her hücrede %100 olur. Filtrelenecek ifade ölçünün kendisi olmalı:</p>
<pre class="dax">Web Payı =
VAR Toplam = [Net Satış]
RETURN DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Web"), Toplam)</pre>

<h2>8 · DIVIDE yerine bölü işareti</h2>
<pre class="dax">Büyüme (önerilen) = ([Net Satış] - [Satış GY]) / [Satış GY]</pre>
<p>İlk yıl (2022) geçen yıl boştur: payda BLANK, sonuç <b>sonsuz</b> olur ve kartta “∞” görünür. <code>DIVIDE([Net Satış] - [Satış GY], [Satış GY])</code> bu durumda BLANK döndürür. Ayrıca payın da anlamlı olup olmadığını düşün: geçen yıl yoksa fark da anlamsızdır.</p>

<h2>9 · Performans: iteratör içinde ölçü</h2>
<pre class="dax">Net Satış (önerilen) = SUMX(Satislar, [Net Satış])</pre>
<p>Sonuç doğru çıkar, ama her satırda bağlam geçişi olur: 1.620 satırlık tabloda 1.620 kez, milyonluk tabloda milyonlarca kez. Ayrıca olgu tablosunda tekrar eden satırlar varsa sonuç bozulur. Ölçüyü iteratör içinde çağıracaksan küçük bir tabloda dolaş (<code>VALUES(Urunler[Kategori])</code> gibi). Ayrıntı “DAX optimizasyonu” dersinde.</p>

<h2>Denetim kontrol listesi</h2>
<ol>
<li><b>Adlar:</b> Her tablo, sütun ve ölçü modelde var mı? Doğru temel ölçü mü (<code>[Net Satış]</code> mı, <code>Satislar[Tutar]</code> mı)?</li>
<li><b>Bilinen toplam:</b> Sonucu bildiğin bir sayıyla karşılaştır (ör. Net Satış ≈ 1.250.772 ₺, 2024 ≈ 747.066 ₺).</li>
<li><b>Toplam satırı:</b> Matriste satırları topla; toplamla tutuyor mu, tutması gerekiyor mu?</li>
<li><b>Dilimleyici:</b> Bir yıl, bir kategori seç; sonuç beklediğin gibi değişiyor mu, değişmemesi gereken yerde sabit mi?</li>
<li><b>Sınır durumları:</b> İlk yıl, boş ay, hiç satmamış ürün, tek gün seçimi.</li>
<li><b>Okunabilirlik:</b> <code>__PREV_YEAR</code> gibi adları ekip standardına çevir; açıklama ekle.</li>
</ol>

<h2>DAX sorgu görünümünde test et</h2>
<p>Ölçüyü modele eklemeden önce sorgu içinde tanımlayıp yan yana karşılaştırabilirsin. Aşağıdaki sorgu hatalı öneriyi ve doğru ölçüyü aynı tabloda gösterir; boş sütun, hatanın kanıtıdır:</p>
<pre class="dax">DEFINE
    MEASURE Satislar[GY (önerilen)] = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Satislar[Tarih]))
EVALUATE
SUMMARIZECOLUMNS(
    Tarih[Yil],
    "Net Satış", [Net Satış],
    "GY (önerilen)", [GY (önerilen)],
    "GY (doğru)", [Satış GY]
)</pre>
<div class="tip"><b>Asistana daha iyi soru</b>“Satislar[Tutar], Satislar[Durum], Tarih[Tarih] (işaretli tarih tablosu) ve [Net Satış] ölçüsü var. İptaller hariç geçen yılın aynı dönemine göre büyüme yüzdesini yaz; ilk yılda boş dönsün; yalnızca bu adları kullan.” Bağlam verdikçe hata azalır, ama denetim yine sende.</div>
`,
  ex: [
    { t: 'dax', name: 'YoY Fark (Düzeltilmiş)', q: '<b>YoY Fark (Düzeltilmiş)</b>: Asistan şunu önerdi: <code>[Net Satış] - CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Satislar[Tarih]))</code>. İki sorunu düzelt: zaman zekâsı tarih tablosunun sütunuyla çalışsın ve geçen yıl boşsa sonuç BLANK olsun.', sol: 'VAR GY = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN IF(NOT ISBLANK(GY), [Net Satış] - GY)', hint: 'Geçen yılı Tarih[Tarih] ile bir değişkende hesapla; IF(NOT ISBLANK(GY), …) ile ilk yılı boş bırak.' },
    { t: 'dax', name: 'Brüt Ciro', q: '<b>Brüt Ciro</b>: Önerilen <code>SUM(Satislar[Adet]) * SUM(Satislar[BirimFiyat])</code> toplamları çarpıyor. Her satırda adet × birim fiyatı hesaplayıp toplayan, iptalleri dışarıda bırakan ölçüyü yaz.', sol: 'CALCULATE(SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat]), Satislar[Durum] <> "İptal")', hint: 'SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat]) ifadesini CALCULATE ile Satislar[Durum] <> "İptal" filtresine sar.' },
    { t: 'dax', name: 'Web Payı %', q: '<b>Web Payı %</b>: Önerilen <code>VAR S = [Net Satış] RETURN DIVIDE(CALCULATE(S, Satislar[Kanal] = "Web"), S)</code> her hücrede %100 veriyor. Web kanalının net satıştaki payını doğru hesaplayan ölçüyü yaz.', sol: 'DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Web"), [Net Satış])', hint: 'CALCULATE’in ilk bağımsız değişkeni değişken değil, ölçünün kendisi olmalı.' },
    { t: 'dax', name: 'Hedef Aşımı (Ay-Kategori)', q: '<b>Hedef Aşımı (Ay-Kategori)</b>: Önerilen <code>IF([Net Satış] &gt; [Hedef], [Net Satış] - [Hedef], 0)</code> toplamlarda 0 veriyor. Kategori × ay (<code>Tarih[YilAy]</code>) düzeyinde yalnızca pozitif farkları toplayan ölçüyü yaz.', sol: 'SUMX(CROSSJOIN(VALUES(Kategoriler[Kategori]), VALUES(Tarih[YilAy])), VAR Fark = [Net Satış] - [Hedef] RETURN IF(Fark > 0, Fark))', hint: 'SUMX(CROSSJOIN(VALUES(Kategoriler[Kategori]), VALUES(Tarih[YilAy])), …) içinde farkı bir değişkene al ve yalnızca pozitifse döndür.' },
    { t: 'mc', q: 'Asistanın önerdiği <code>CALCULATE([Net Satış], ALL(Tarih))</code> ölçüsünün “seçili yılların toplamı” olması isteniyor. Sorun ne?', o: ['ALL yalnızca hesaplanmış tablolarda ve sorgularda çalışır', 'Yıl dilimleyicisi de silinir, sonuç hep tüm yıllar', 'Ölçü iptalleri iki kez sayar', 'Tarih tablosu işaretli değilse hata verir'], a: 1, why: 'ALL(Tarih) tarih tablosundaki tüm filtreleri, dilimleyiciden gelen yıl seçimi dâhil, kaldırır. Seçime saygı için ALLSELECTED kullanılır.' },
    { t: 'mc', q: 'Önerilen bir ölçünün <b>toplam satırını</b> neden ayrıca kontrol edersin?', o: ['Toplam satırı her zaman satırların toplamıdır, kontrol gerekmez', 'Toplam satırında DAX hiç çalışmaz', 'Ölçü toplamda kendi bağlamında yeniden hesaplanır', 'Copilot toplam satırını gizler'], a: 2, why: 'Toplam satırı satırların toplamı değildir; ölçü daha geniş bir filtre bağlamında yeniden hesaplanır. IF ve oran içeren ölçüler toplamda bambaşka sonuç verebilir.' },
    { t: 'mc', q: 'Bir öneriyi modele eklemeden önce hatalı ve doğru sürümü yan yana görmenin en pratik yolu?', o: ['Raporu yayımlayıp kullanıcılara sormak', 'Ölçüyü hesaplanmış sütuna çevirip satır satır bakmak', 'Power Query’de yeni bir sütun eklemek', 'DAX sorgu görünümünde DEFINE MEASURE ile EVALUATE'], a: 3, why: 'DAX sorgu görünümünde ölçüyü sorgu içinde tanımlayıp SUMMARIZECOLUMNS ile mevcut ölçülerin yanında çalıştırırsın; model değişmez.' }
  ]
});

/* ---------- 3. Power BI'da Python ve R (B2 · Analiz) ---------- */
add('copilot', {
  id: 'python-r', lv: 'B2', mod: 'Analiz', min: 18,
  title: 'Power BI’da Python ve R',
  sum: 'Python/R betiğini veri kaynağı ve Power Query adımı olarak kullanmak, Python ve R görselleri, kurulum, hizmetteki sınırlar ve aynı işin DAX ya da Power Query ile ne zaman daha iyi yapılacağı.',
  body: `
<p>Power BI, Python ve R betiklerini üç yerde çalıştırabilir: <b>veri kaynağı</b> olarak, Power Query’de <b>dönüştürme adımı</b> olarak ve rapor tuvalinde <b>görsel</b> olarak. Bu, istatistik ve makine öğrenmesi kütüphanelerini rapora getirir. Ama her betik bir bağımlılık ve bir sınır demektir. Bu derste ne zaman kullanılacağını ve nerede duracağını göreceksin. (Kesit Power BI tarayıcıda Python çalıştıramaz; kodlar okumak ve kendi bilgisayarında denemek içindir.)</p>

<h2>Kurulum</h2>
<ol>
<li>Bilgisayarına Python (python.org dağıtımı önerilir) ya da R kur.</li>
<li>Python için en az iki paket: <code>pip install pandas matplotlib</code>. Power BI veriyi yalnızca <b>pandas veri çerçevesi</b> (DataFrame) olarak alır ve verir.</li>
<li>Desktop’ta <b>Dosya → Seçenekler ve ayarlar → Seçenekler → Python betiği oluşturma</b> (R için “R betiği oluşturma”): Python giriş dizinini seç.</li>
</ol>
<div class="note"><b>Conda ortamları</b>Power BI, seçtiğin dizindeki <code>python.exe</code>’yi doğrudan çalıştırır. Ek ortam ayarı isteyen dağıtımlar (Conda gibi) çalışmayabilir; o durumda Desktop’ı ortamın komut isteminden başlatmak gerekir.</div>

<h2>Betik veri kaynağı olarak</h2>
<p><b>Giriş → Veri al → Diğer → Python betiği</b>. Betikte oluşturduğun her DataFrame, Gezgin’de bir tablo olarak görünür. Örnek: bir API’den ya da dosyadan gelen veriyi pandas ile hazırlamak.</p>
<pre data-notry>import pandas as pd

kampanya = pd.DataFrame({
    "Kampanya": ["Okula Dönüş", "Yaz Festivali", "Yılbaşı"],
    "Baslangic": pd.to_datetime(["2024-08-20", "2024-06-01", "2024-12-15"]),
    "Butce": [40000, 25000, 60000],
})
# Gezginde "kampanya" adlı bir tablo görünür</pre>
<p>Sınırlar: 30 dakikadan uzun süren betik zaman aşımına uğrar; kullanıcıdan girdi bekleyen komutlar betiği durdurur; iç içe tablolar desteklenmez; çalışma dizini ayarlıyorsan tam yol yazmalısın.</p>

<h2>Power Query’de betik adımı</h2>
<p>Power Query’de <b>Dönüştür → Python betiği çalıştır</b>. Sorgunun o anki tablosu betiğe <code>dataset</code> adlı bir DataFrame olarak gelir. Örnek: bölgesi boş müşterilerde eksik değeri şehirden tamamlamak, kalanları “Bilinmiyor” yapmak.</p>
<pre data-notry>import pandas as pd

sehir_bolge = {"İstanbul": "Marmara", "Ankara": "İç Anadolu", "İzmir": "Ege"}
df = dataset.copy()
df["Bolge"] = df["Bolge"].fillna(df["Sehir"].map(sehir_bolge))
df["Bolge"] = df["Bolge"].fillna("Bilinmiyor")
# zaman serisinde boşluğu bir sonraki değerle doldurmak: df["Kur"] = df["Kur"].bfill()</pre>
<p>Bunun için Python gerekmez: aynı iş Power Query’de birleştirme (Merge) ve “Değeri değiştir” adımlarıyla da yapılır ve sorgu katlamayı bozmaz. Python’ı, Power Query’nin yapamadığı işler için sakla: istatistiksel eksik değer tahmini (ör. regresyonla doldurma), metin madenciliği, kümeleme.</p>
<div class="warn"><b>Hizmette yenileme</b>Python ya da R betiği içeren bir sorgunun hizmette zamanlanmış yenilemesi için betiğin çalıştığı bilgisayara <b>kişisel mod ağ geçidi</b> (personal gateway) kurulmalı ve o bilgisayarda Python yüklü olmalı. Ayrıca betikle aynı sorgudaki tüm veri kaynaklarının gizlilik düzeyi <b>Genel</b> (Public) olmalı. Kurumsal ortamda bu çoğu zaman kabul edilemez; betiği Fabric not defterine ya da kaynağa taşımak daha sağlıklıdır.</div>

<h2>Python ve R görselleri</h2>
<p>Görselleştirmeler bölmesinde <b>Py</b> ya da <b>R</b> simgesini seç, betik görsellerini etkinleştir ve alanları <b>Değerler</b> kutusuna sürükle. Power BI bu alanlardan <code>dataset</code> adlı bir veri çerçevesi oluşturur. Dikkat: alanlar tablo görseli gibi gruplanır, tekrar eden satırlar bir kez gelir; her satırı istiyorsan benzersiz bir alan (ör. <code>SatirNo</code>) ekle.</p>
<pre data-notry>import seaborn as sns
import matplotlib.pyplot as plt

# Değerler: Kanal, Kategori, Net Satış
pivot = dataset.pivot_table(index="Kategori", columns="Kanal",
                            values="Net Satış", aggfunc="sum")
sns.heatmap(pivot, annot=True, fmt=".0f", cmap="Blues")
plt.title("Kategori × kanal net satış")
plt.show()</pre>
<pre data-notry># R görseli: aynı ısı haritası ggplot2 ile
library(ggplot2)
ggplot(dataset, aes(x = Kanal, y = Kategori, fill = \`Net Satış\`)) +
  geom_tile() +
  scale_fill_gradient(low = "white", high = "steelblue")</pre>
<p>Görsel bir <b>resim</b>dir: üzerine gelince araç ipucu çıkmaz, tıklayınca başka görselleri filtrelemez. Diğer görsellerden gelen filtre ve vurgulamaya ise tepki verir. Çoğu ısı haritası için matris + koşullu biçimlendirme yeterlidir ve etkileşimlidir; “Koşullu biçimlendirme ve KPI'lar” dersine bak.</p>

<h2>Sınırlar (Learn’e göre)</h2>
<div class="tbl-wrap"><table>
<tr><th>Konu</th><th>Sınır</th></tr>
<tr><td>Görsele gelen veri</td><td>En çok 150.000 satır (fazlası kesilir, görselde uyarı çıkar); Desktop’ta en çok 250 MB girdi</td></tr>
<tr><td>Zaman aşımı</td><td>Desktop’ta görsel betiği 5 dakika; hizmette görsel başına 1 dakika</td></tr>
<tr><td>Hizmetteki yük</td><td>Sıkıştırılmış veri + betik en çok 30 MB</td></tr>
<tr><td>Paketler (hizmet)</td><td>Python 3.11 ve R 4.3.3 çalışma zamanı; yalnızca listede olan, PyPI/CRAN’da yayımlanmış açık kaynak paketler (pandas, matplotlib, seaborn, scikit-learn, ggplot2, corrplot…). Ağ bağlantısı kuran paketler engellenir.</td></tr>
<tr><td>Lisans</td><td>Hizmette betik görseli oluşturmak için Pro ya da PPU; görüntüleme için Fabric/Premium çalışma alanı da yeterli olabilir. Fabric’in olmadığı bölgelerde ve egemen bulutlarda hizmette desteklenmez.</td></tr>
<tr><td>Paylaşım</td><td>Web’de yayımla (Publish to web) desteklemez; 2026 itibarıyla “müşterilerin için ekle” (app owns data) senaryosunda da destek sona eriyor.</td></tr>
<tr><td>Çözünürlük</td><td>Görseller 72 DPI; sütun adları yeniden adlandırılsa da betik özgün adları görür.</td></tr>
</table></div>

<h2>Ne zaman DAX ya da Power Query yeterli?</h2>
<div class="tbl-wrap"><table>
<tr><th>İş</th><th>Önerilen</th><th>Neden?</th></tr>
<tr><td>Eksik değeri sabit ya da eşleme ile doldurmak</td><td>Power Query</td><td>Katlanabilir, ağ geçidi gerektirmez.</td></tr>
<tr><td>Eksik değer sayımı, veri kalitesi kartı</td><td>DAX</td><td>Dilimleyiciyle değişir, etkileşimlidir.</td></tr>
<tr><td>Korelasyon, z-skoru, doğrusal eğilim</td><td>DAX</td><td>Formülü bilinen istatistikler DAX’ta yazılır (“İleri istatistik” dersi).</td></tr>
<tr><td>Kümeleme, regresyon modeli, metin analizi</td><td>Python/R (tercihen Fabric not defteri)</td><td>Kütüphane gerekir; sonuç tablo olarak modele gelir.</td></tr>
<tr><td>Özel istatistik grafiği (yoğunluk, çift grafik)</td><td>Python/R görseli</td><td>Yerleşik görsel yoksa; etkileşim beklenmiyorsa.</td></tr>
</table></div>
<p>Örneğin Python’da <code>df["Indirim"].corr(df["Adet"])</code> ile bulunan Pearson korelasyonu DAX’ta da yazılabilir; üstelik dilimleyiciyle değişir:</p>
<pre class="dax">İndirim-Adet Korelasyonu =
VAR T = FILTER(Satislar, Satislar[Durum] &lt;&gt; "İptal")
VAR OrtX = AVERAGEX(T, Satislar[Indirim])
VAR OrtY = AVERAGEX(T, Satislar[Adet])
VAR Kov = SUMX(T, (Satislar[Indirim] - OrtX) * (Satislar[Adet] - OrtY))
VAR SX = SQRT(SUMX(T, (Satislar[Indirim] - OrtX) ^ 2))
VAR SY = SQRT(SUMX(T, (Satislar[Adet] - OrtY) ^ 2))
RETURN DIVIDE(Kov, SX * SY)</pre>
<p>Bizim modelde sonuç yaklaşık −0,02: indirim ile satılan adet arasında neredeyse hiç doğrusal ilişki yok. Elektronik’te sonuç boş döner, çünkü o kategoride indirim hiç değişmiyor (standart sapma 0, DIVIDE boş döndürür).</p>
`,
  ex: [
    { t: 'mc', q: 'Python görseline Değerler kutusuyla <code>Kanal</code> ve <code>Adet</code> alanlarını koydun; betik yalnızca birkaç satır görüyor. Neden?', o: ['Python görseli en çok 100 satır alır', 'Alanlar gruplanır, tekrar eden satırlar bir kez gelir', 'pandas yüklü değilse satırlar kırpılır', 'Görsel yalnızca seçili dilimleyici değerinin satırlarını alır'], a: 1, why: 'Betik görselleri alanları tablo görseli gibi gruplar ve tekrarları kaldırır. Her satırı görmek için SatirNo gibi benzersiz bir alan eklenir. Satır sınırı 150.000’dir.' },
    { t: 'mc', q: 'Power Query’de Python adımı içeren bir model hizmette zamanlanmış yenilenecek. Ne gerekir?', o: ['Kişisel mod ağ geçidi ve o makinede Python', 'Yalnızca bir Fabric kapasitesi', 'Standart mod ağ geçidi, Python gerekmez', 'Hiçbir şey; hizmet Python’ı kendisi çalıştırır'], a: 0, why: 'Learn’e göre Python betikli sorguların yenilemesi için betiği çalıştıracak bilgisayarda kişisel ağ geçidi ve Python kurulu olmalı; kaynakların gizlilik düzeyi de Genel olmalı.' },
    { t: 'mc', q: 'Hizmette bir Python görseli bir web servisinden kur verisi çekmeye çalışıyor ve çalışmıyor. En olası neden?', o: ['Görsel 72 DPI ile sınırlı', 'Python 2 sürümü kullanılıyor', 'Hizmette betik görsellerinden ağ erişimi engellenir', 'Betikte veri çerçevesinin adı dataset olarak geçmiyor'], a: 2, why: 'Güvenlik ve gizlilik için hizmette ağ bağlantısı kuran paket ve çağrılar engellenir. Dış veri Power Query ya da Fabric işlem hattıyla modele alınmalı.' },
    { t: 'mc', q: 'Kategori × kanal ısı haritası istendi ve kullanıcılar hücreye tıklayıp diğer görselleri filtrelemek istiyor. En iyi seçim?', o: ['seaborn kütüphanesiyle çizilen bir Python görseli', 'R görseli ve ggplot2', 'Python betiği veri kaynağı', 'Matris ve arka plan rengi koşullu biçimi'], a: 3, why: 'Python/R görselleri resimdir; çapraz filtreleme yapamaz. Matris + koşullu biçimlendirme ısı haritası etkisini verir ve tam etkileşimlidir.' },
    { t: 'mc', q: 'Hangisi hizmette Python görseli için doğru bir sınırdır?', o: ['Görsel başına 1 dakika zaman aşımı', 'Görsel başına en çok 10 sütun', 'Yalnızca Premium kapasitede görüntülenir', 'Betik en çok 50 satır olabilir'], a: 0, why: 'Hizmette her Python/R görseli betiği için 1 dakika zaman aşımı ve 30 MB yük (sıkıştırılmış veri + betik) sınırı vardır.' },
    { t: 'dax', name: 'Bölgesi Eksik Satır', q: '<b>Bölgesi Eksik Satır</b>: Python’da <code>df["Bolge"].isna().sum()</code> ile yaptığın eksik değer sayımını DAX’ta yap: bölgesi boş müşterilere ait <code>Satislar</code> satırlarının sayısı.', sol: 'CALCULATE(COUNTROWS(Satislar), ISBLANK(Musteriler[Bolge]))', hint: 'COUNTROWS(Satislar) ifadesini CALCULATE ile ISBLANK(Musteriler[Bolge]) koşuluna sar; ilişki filtreyi Satislar’a taşır.' },
    { t: 'dax', name: 'İndirim-Adet Korelasyonu', q: '<b>İndirim-Adet Korelasyonu</b>: İptaller hariç satış satırlarında <code>Satislar[Indirim]</code> ile <code>Satislar[Adet]</code> arasındaki Pearson korelasyonunu hesapla (Python’daki <code>df["Indirim"].corr(df["Adet"])</code> karşılığı).', sol: 'VAR T = FILTER(Satislar, Satislar[Durum] <> "İptal") VAR OrtX = AVERAGEX(T, Satislar[Indirim]) VAR OrtY = AVERAGEX(T, Satislar[Adet]) VAR Kov = SUMX(T, (Satislar[Indirim] - OrtX) * (Satislar[Adet] - OrtY)) VAR SX = SQRT(SUMX(T, (Satislar[Indirim] - OrtX) ^ 2)) VAR SY = SQRT(SUMX(T, (Satislar[Adet] - OrtY) ^ 2)) RETURN DIVIDE(Kov, SX * SY)', hint: 'Önce iptal olmayan satırları bir değişkene al; ortalamaları, kovaryansı ve iki standart sapmanın çarpımını hesapla; DIVIDE ile böl.' }
  ]
});

/* ---------- 4. Microsoft Fabric'e giriş (B2 · Fabric) ---------- */
add('yonetisim', {
  id: 'fabric-giris', lv: 'B2', mod: 'Fabric', min: 20,
  title: 'Microsoft Fabric’e giriş: OneLake, lakehouse, ambar ve Direct Lake',
  sum: 'Fabric’in iş yükleri, OneLake ve Delta Parquet, kısayollar, lakehouse ve ambar farkı, Dataflow Gen2, işlem hatları ve not defterleri, Direct Lake’in Import ve DirectQuery ile karşılaştırması ve bir Power BI geliştiricisinin ilk Fabric projesi.',
  body: `
<p>Microsoft Fabric, veri alma, işleme, depolama, analiz ve raporlamayı tek bir SaaS (hizmet olarak yazılım) ürününde toplar. Power BI artık bu platformun bir parçasıdır: aynı portal, aynı çalışma alanları, aynı kapasite. Bir Power BI geliştiricisi için Fabric, “veriyi Power Query’de hazırlayıp modele almak” yerine “veriyi bir kez göle koyup her araçla oradan okumak” demektir.</p>

<h2>Fabric’in iş yükleri</h2>
<div class="tbl-wrap"><table>
<tr><th>İş yükü</th><th>Ne için?</th><th>Başlıca öğeler</th></tr>
<tr><td>Data Factory</td><td>Veri alma ve düzenleme</td><td>Veri akışı Gen2 (Dataflow Gen2), işlem hattı (pipeline), kopyalama işi</td></tr>
<tr><td>Data Engineering</td><td>Spark ile büyük veri işleme</td><td>Lakehouse, not defteri (notebook), Spark iş tanımı</td></tr>
<tr><td>Data Warehouse</td><td>T-SQL ile ilişkisel ambar</td><td>Ambar (warehouse)</td></tr>
<tr><td>Real-Time Intelligence</td><td>Akış ve olay verisi</td><td>Eventstream, eventhouse (KQL), gerçek zamanlı pano</td></tr>
<tr><td>Data Science</td><td>Makine öğrenmesi</td><td>ML deneyi, model, not defteri</td></tr>
<tr><td>Databases</td><td>Operasyonel veritabanı ve yansıtma</td><td>SQL veritabanı, yansıtılmış (mirrored) veritabanı</td></tr>
<tr><td>Power BI</td><td>Modelleme ve raporlama</td><td>Anlam modeli, rapor, pano, uygulama</td></tr>
</table></div>
<p>Learn ayrıca Fabric IQ adlı yeni bir iş yükünü <b>önizleme</b> olarak listeliyor. Bu derste Power BI geliştiricisinin en çok dokunacağı parçalara odaklanıyoruz.</p>

<h2>OneLake ve Delta Parquet</h2>
<p><b>OneLake</b>, her kiracıya (tenant) bir tane verilen veri gölüdür; “verinin OneDrive’ı” gibi düşün. Çalışma alanları onun altında klasörler, lakehouse ve ambarlar da onların içinde öğelerdir. Tablolar açık <b>Delta Lake</b> biçiminde saklanır: veri sütun tabanlı <b>Parquet</b> dosyalarında, değişiklik geçmişi bir işlem günlüğünde (<code>_delta_log</code>) durur. Aynı tabloyu Spark, T-SQL ve Power BI kopyalamadan okuyabilir.</p>
<ul>
<li><b>Kısayol (shortcut):</b> Başka bir yerdeki veriyi (ADLS Gen2, Amazon S3, Google Cloud Storage, başka bir lakehouse) <b>kopyalamadan</b> lakehouse içinde klasör ya da tablo gibi gösterir.</li>
<li><b>Yansıtma (mirroring):</b> Azure SQL, Snowflake, Cosmos DB gibi bir kaynağı neredeyse gerçek zamanlı olarak OneLake’e çoğaltır.</li>
</ul>

<h2>Lakehouse ve ambar</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Lakehouse</th><th>Ambar (Warehouse)</th></tr>
<tr><td>İçerik</td><td><b>Dosyalar</b> (CSV, JSON, görüntü…) + <b>Tablolar</b> (Delta)</td><td>Yalnızca tablolar (Delta)</td></tr>
<tr><td>Yazma</td><td>Spark (PySpark, Spark SQL), Dataflow Gen2, işlem hattı</td><td>T-SQL: INSERT, UPDATE, DELETE, MERGE, saklı yordam</td></tr>
<tr><td>SQL ile okuma</td><td>Otomatik <b>SQL analiz uç noktası</b>: salt okunur T-SQL, görünüm (view) tanımlanabilir</td><td>Tam okuma-yazma T-SQL</td></tr>
<tr><td>Kimin için?</td><td>Veri mühendisi, Python/Spark bilen ekip</td><td>SQL bilen BI ve ambar ekibi</td></tr>
</table></div>
<p>İkisi birbirinin alternatifi değil, çoğu projede birlikte kullanılır: ham ve temizlenmiş veri lakehouse’ta, sunuma hazır yıldız şema ambarda ya da yine lakehouse’ta. Hangi deponun ne zaman seçileceği “DP-600 Fabric Analytics Engineer hazırlığı” dersinde tablo hâlinde var.</p>

<h2>Veriyi taşıyan araçlar</h2>
<ul>
<li><b>Veri akışı Gen2:</b> Bildiğin Power Query’nin bulut sürümü. Fark: sonucu bir <b>hedefe</b> (lakehouse tablosu, ambar) yazar. Power BI geliştiricisinin Fabric’e en kolay giriş kapısıdır.</li>
<li><b>İşlem hattı (pipeline):</b> Adımları sıraya koyar ve zamanlar: “kopyala → veri akışını çalıştır → not defterini çalıştır → anlam modelini yenile → hata olursa e-posta at”.</li>
<li><b>Not defteri (notebook):</b> PySpark ya da Spark SQL ile büyük hacimli dönüşüm, birleştirme, makine öğrenmesi.</li>
</ul>

<h2>Anlam modeli ve Direct Lake</h2>
<p>Fabric’te anlam modeli lakehouse ya da ambar tablolarına üç yolla bağlanabilir:</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>Import</th><th>DirectQuery</th><th>Direct Lake</th></tr>
<tr><td>Veri nerede?</td><td>Modelin belleğine kopyalanır</td><td>Kaynakta kalır, her sorguda SQL gider</td><td>OneLake’teki Delta dosyalarından belleğe, gerektikçe yüklenir</td></tr>
<tr><td>Yenileme</td><td>Tam ya da artımlı veri yükleme (dakikalar–saatler)</td><td>Gerekmez</td><td><b>Çerçeveleme</b> (framing): yalnızca meta veri, genellikle saniyeler</td></tr>
<tr><td>Sorgu hızı</td><td>Çok hızlı</td><td>Kaynağa bağlı, çoğu zaman yavaş</td><td>Import’a yakın (sütunlar bellekteyken)</td></tr>
<tr><td>Power Query / hesaplanmış sütun</td><td>Var</td><td>Sınırlı</td><td>Yok: dönüşüm Delta tablolara yazılırken yapılır</td></tr>
</table></div>
<p>Direct Lake’te bir sorgu ilk kez bir sütuna ihtiyaç duyduğunda o sütun Parquet’ten belleğe yüklenir (transcoding); sonra bellekte kalır. Kullanılmayan sütun bellekten çıkarılabilir. Direct Lake’in iki türü (OneLake üzerinde ve SQL uç noktası üzerinde), DirectQuery’ye geri dönüş ve davranış ayarı “Kurumsal model” dersinde anlatılıyor.</p>
<p>Senin için en iyi haber: <b>DAX değişmez.</b> Ölçüler, ilişkiler, RLS ve DAX sorguları Import modelde nasıl çalışıyorsa Direct Lake modelde de öyle çalışır. Aşağıdaki sorgu, bu uygulamanın modelinde de bir Direct Lake modelinde de aynı sonucu verir:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Tarih[Yil],
    "Net Satış", [Net Satış],
    "Satış GY", [Satış GY]
)</pre>

<h2>Kapasite ve lisans kavramı</h2>
<p>Fabric öğelerini (lakehouse, ambar, not defteri, Direct Lake modeli) oluşturmak için çalışma alanının bir <b>Fabric kapasitesine</b> atanmış olması gerekir. Kapasite, kuruluşun satın aldığı ortak bir işlem gücü havuzudur; boyutu SKU ile ifade edilir ve tüm iş yükleri aynı havuzdan “kapasite birimi” tüketir. Rapor yazarı ve okurlarının Power BI lisansları (Pro, PPU) ise ayrı bir konudur ve kapasitenin boyutuna göre değişebilir. Fiyat ve eşikler sık değiştiği için burada sayı vermiyoruz; projeye başlamadan önce yöneticinle güncel lisans belgelerini kontrol et. Deneme kapasitesi öğrenmek için yeterlidir, ama Copilot gibi bazı özellikler denemede çalışmaz.</p>

<h2>İlk Fabric projen: adım adım</h2>
<ol>
<li><b>Çalışma alanı:</b> Fabric kapasitesine atanmış bir çalışma alanı oluştur (ör. “Satış Analitiği – Geliştirme”).</li>
<li><b>Lakehouse:</b> “SatisLakehouse” adlı bir lakehouse oluştur. Ham CSV dosyalarını <b>Dosyalar</b> bölümüne yükle ya da bir kısayolla bağla.</li>
<li><b>Veri akışı Gen2:</b> Power Query’de temizle (tür, boşluk, birleştirme) ve hedef olarak lakehouse’un <b>Tablolar</b> bölümünü seç: <code>satislar</code>, <code>urunler</code>, <code>musteriler</code>, <code>tarih</code>.</li>
<li><b>SQL analiz uç noktası:</b> Satır sayılarını ve toplamları T-SQL ile kontrol et.</li>
<li><b>Anlam modeli:</b> Lakehouse’tan yeni bir Direct Lake anlam modeli oluştur; ilişkileri kur, tarih tablosunu işaretle, ölçüleri yaz.</li>
<li><b>Rapor:</b> Modelden rapor oluştur ya da Desktop’ta canlı bağlan.</li>
<li><b>Zamanlama:</b> Veri akışını ve gerekirse model çerçevelemesini bir işlem hattında sıraya koy.</li>
<li><b>Yaşam döngüsü:</b> Çalışma alanını Git’e bağla, test ve üretim için dağıtım işlem hattı kur (“Yaşam döngüsü” dersi).</li>
</ol>
<div class="tip"><b>Sonraki adımlar</b>Fabric’te yıldız şemayı (vekil anahtar, SCD Tip 2, köprü tablo, Delta bakımı) “Fabric’te yıldız şema” dersinde, sertifika yolunu “DP-600” dersinde, depolama modu kararlarını “Kurumsal model” dersinde bulacaksın.</div>
`,
  ex: [
    { t: 'mc', q: 'Ekip, Power Query bilgisini kullanarak temizlediği veriyi bir lakehouse tablosuna yazmak istiyor. Hangi öğe?', o: ['Eventstream', 'Veri akışı Gen2', 'SQL analiz uç noktası', 'Spark iş tanımı'], a: 1, why: 'Veri akışı Gen2, Power Query’nin bulut sürümüdür ve sonucu lakehouse ya da ambar gibi bir hedefe yazar. SQL analiz uç noktası salt okunurdur.' },
    { t: 'mc', q: 'Lakehouse’un SQL analiz uç noktası ile ambar arasındaki temel fark nedir?', o: ['Uç nokta T-SQL ile yalnızca okur; ambar T-SQL ile yazar da', 'Uç nokta Delta biçimi kullanmaz', 'Ambar, Power BI anlam modellerine kaynak olarak bağlanamaz', 'Uç nokta yalnızca KQL destekler'], a: 0, why: 'SQL analiz uç noktası lakehouse tablolarına salt okunur T-SQL erişimi (ve görünümler) verir; veri Spark ya da veri akışıyla yazılır. Ambar INSERT, UPDATE, MERGE gibi yazma komutlarını destekler.' },
    { t: 'mc', q: 'Direct Lake modelde “yenileme” (çerçeveleme) neden genellikle saniyeler sürer?', o: ['Veri her sorguda kaynaktan SQL ile çekildiği için', 'Artımlı yenilemedeki gibi yalnızca son birkaç günün verisi yüklendiği için', 'Model en yeni Delta sürümünü işaret eder, veri kopyalanmaz', 'Çerçeveleme yalnızca gece çalıştığı için'], a: 2, why: 'Çerçeveleme Delta günlüğünün meta verisini okuyup modeli en yeni Parquet dosyalarına yönlendirir; Import’taki gibi tüm veri yeniden yüklenmez.' },
    { t: 'mc', q: 'Bir S3 klasörünü kopyalamadan lakehouse’ta göstermek için ne kullanılır?', o: ['Yansıtma', 'İşlem hattında kopyalama etkinliği', 'Veri akışı Gen2', 'Kısayol'], a: 3, why: 'Kısayol (shortcut), ADLS, S3, GCS ya da başka bir OneLake konumundaki veriyi kopyalamadan gösterir. Yansıtma ve kopyalama veriyi OneLake’e çoğaltır.' },
    { t: 'mc', q: 'Import modelden Direct Lake’e geçerken hangisi <b>değişmez</b>?', o: ['Ölçülerin DAX kodu', 'Power Query adımlarının yeri', 'Hesaplanmış sütunların kullanımı', 'Yenilemenin süresi'], a: 0, why: 'DAX ölçüleri, ilişkiler ve RLS aynı kalır. Power Query dönüşümleri Delta tablolara yazmadan önceye taşınır, hesaplanmış sütunlar desteklenmez, yenileme çerçevelemeye dönüşür.' },
    { t: 'query', q: 'Modelin depolama modundan bağımsız çalışan bir DAX sorgusu yaz: her yıl ve müşteri segmenti için <code>[Net Satış]</code> değerini döndür (sütun adı “Net Satış”).', start: 'EVALUATE\n', sol: 'EVALUATE\nSUMMARIZECOLUMNS(Tarih[Yil], Musteriler[Segment], "Net Satış", [Net Satış])', hint: 'SUMMARIZECOLUMNS(Tarih[Yil], Musteriler[Segment], "Net Satış", [Net Satış])' }
  ]
});

/* ---------- 5. Fabric'te yıldız şema: SCD2, köprü, Delta bakımı (C2 · Fabric) ---------- */
add('kurumsal-model', {
  id: 'fabric-yildiz', lv: 'C2', mod: 'Fabric', min: 26,
  title: 'Fabric’te yıldız şema: SCD Tip 2, köprü tablolar ve Delta bakımı',
  sum: 'Lakehouse ve ambarda boyut-olgu tasarımı, vekil anahtar, yavaş değişen boyutlar (Tip 1, Tip 2) ve olgu satırını doğru sürüme bağlamak, köprü tablo, T-SQL ile MERGE ve CTAS, OPTIMIZE, V-Order ve VACUUM, DAX’ta “o tarihteki değer”.',
  body: `
<p>“Veri modelleme: yıldız şema ve ilişkiler” dersinde yıldız şemayı Power BI modelinin içinde kurdun. Fabric’te aynı tasarımı bir katman aşağıya, <b>lakehouse ya da ambar tablolarına</b> indirirsin: Direct Lake modelde Power Query adımı yoktur, hesaplanmış sütun ve tablo desteği de sınırlı ve yeni olduğu için (önizleme) şema, Delta tablolar yazılırken hazır olmalıdır. Bu ders o tasarımın üç zor parçasını işliyor: tarih boyunca değişen boyutlar, çok değerli boyutlar ve tabloların fiziksel bakımı.</p>

<h2>Boyut ve olgu tablolarını tasarlamak</h2>
<ul>
<li><b>Olgu tablosu</b> (fact): bir iş olayının en ince ayrıntısı (sipariş satırı), sayısal ölçümler (adet, tutar) ve boyutlara anahtarlar. Dar ve uzun olmalı; metin sütunlarını boyuta taşı.</li>
<li><b>Boyut tablosu</b> (dimension): olayı betimleyen nitelikler (müşteri, ürün, tarih). Geniş ve kısa olabilir.</li>
<li><b>Tanecik</b> (grain) kararı ilk karardır: “Bir satır = bir sipariş satırı.” Hedef tablosu gibi farklı tanecikli olgular ayrı tablolardır (“Hedef ve gerçekleşen” dersi).</li>
<li><b>Normalleştirmeyi kaldırma:</b> Kar tanesi (snowflake) zincirlerini (Ürün → Alt kategori → Kategori) sunum katmanında tek boyut tablosuna düzleştir. Kaynakta normalleştirilmiş kalabilir; Power BI’a giden “altın” katman yıldız olmalı. İstisna: başka olguların da kullandığı ortak bir boyut (bizim modelde <code>Kategoriler</code>, hem <code>Urunler</code> hem <code>Hedefler</code> tarafından kullanılıyor).</li>
</ul>

<h2>Vekil anahtar (surrogate key)</h2>
<p>Kaynak sistemin anahtarı (<code>MusteriNo</code>) bir <b>iş anahtarıdır</b>. Ambarda boyuta ayrıca anlamsız, artan bir tamsayı verilir: <code>MusteriAnahtari</code>. Nedenleri:</p>
<ul>
<li>Aynı müşterinin birden çok sürümü (Tip 2) olabilir; iş anahtarı artık benzersiz değildir.</li>
<li>Farklı kaynaklardan gelen çakışan numaralar ayrılır.</li>
<li>Tamsayı anahtar VertiPaq’ta iyi sıkışır ve ilişkiler hızlı çalışır.</li>
<li>“Bilinmeyen” üye için sabit bir satır (ör. anahtar −1) tutulur; olgu satırı hiçbir zaman boş anahtarla kalmaz.</li>
</ul>
<p>Fabric ambarında <code>IDENTITY</code> sütunları destekleniyor; lakehouse’ta Spark ile <code>row_number()</code> ya da en büyük anahtar + 1 yöntemi kullanılır. Ambarda birincil ve yabancı anahtar kısıtları yalnızca <code>NOT ENFORCED</code> olarak tanımlanabilir: belgeleme ve sorgu iyileştiricisi içindir, benzersizliği yükleme kodun sağlamalıdır.</p>

<h2>Yavaş değişen boyutlar: Tip 1 ve Tip 2</h2>
<p>Bir müşteri 2024 başında Bireysel segmentten Premium’a geçti. 2023 satışları hangi segmentte raporlanmalı?</p>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Ne yapar?</th><th>Sonuç</th></tr>
<tr><td>Tip 1</td><td>Eski değerin üzerine yazar</td><td>Geçmiş satışlar da bugünkü segmentte görünür. Basit; yazım düzeltmeleri için doğru.</td></tr>
<tr><td>Tip 2</td><td>Eski satırı kapatır, yeni sürüm satırı ekler</td><td>Her satış, gerçekleştiği andaki segmentte görünür. Tarihsel doğruluk.</td></tr>
</table></div>
<p>Tip 2 boyutta her satır bir <b>sürümdür</b> ve şu sütunları taşır: <code>MusteriAnahtari</code> (vekil, sürüme özgü), <code>MusteriNo</code> (iş anahtarı), izlenen nitelikler, <code>GecerliBaslangic</code>, <code>GecerliBitis</code> (açık sürümde 9999-12-31) ve <code>Guncel</code> bayrağı (1/0).</p>
<div class="tbl-wrap"><table>
<tr><th>MusteriAnahtari</th><th>MusteriNo</th><th>Segment</th><th>GecerliBaslangic</th><th>GecerliBitis</th><th>Guncel</th></tr>
<tr><td>104</td><td>4</td><td>Bireysel</td><td>2022-01-01</td><td>2023-12-31</td><td>0</td></tr>
<tr><td>388</td><td>4</td><td>Premium</td><td>2024-01-01</td><td>9999-12-31</td><td>1</td></tr>
</table></div>
<p>Hangi niteliklerin Tip 2 olacağını iş kararı belirler: segment, bölge, temsilci evet; ad soyad yazım düzeltmesi hayır (Tip 1). Her niteliği Tip 2 yapmak boyutu gereksiz yere büyütür.</p>

<h2>T-SQL: MERGE ile SCD2, CTAS ile olgu</h2>
<p>Ambarda <code>MERGE</code> genel kullanımda. Önce değişen müşterinin açık sürümünü kapat ve yeni müşterileri ekle:</p>
<pre>MERGE dbo.DimMusteri AS h
USING stg.Musteri AS k
   ON h.MusteriNo = k.MusteriNo AND h.Guncel = 1
WHEN MATCHED AND h.Segment &lt;&gt; k.Segment THEN
    UPDATE SET h.GecerliBitis = DATEADD(day, -1, CAST(GETDATE() AS date)),
               h.Guncel = 0
WHEN NOT MATCHED BY TARGET THEN
    INSERT (MusteriNo, Musteri, Segment, GecerliBaslangic, GecerliBitis, Guncel)
    VALUES (k.MusteriNo, k.Musteri, k.Segment, CAST(GETDATE() AS date), '9999-12-31', 1);

-- Kapatılan sürümlerin yerine yeni açık sürüm
INSERT INTO dbo.DimMusteri (MusteriNo, Musteri, Segment, GecerliBaslangic, GecerliBitis, Guncel)
SELECT k.MusteriNo, k.Musteri, k.Segment, CAST(GETDATE() AS date), '9999-12-31', 1
FROM stg.Musteri AS k
WHERE NOT EXISTS (SELECT 1 FROM dbo.DimMusteri AS h
                  WHERE h.MusteriNo = k.MusteriNo AND h.Guncel = 1);</pre>
<p>Olgu yüklenirken her satır, satış tarihinde geçerli olan sürümün vekil anahtarını almalıdır. <code>CREATE TABLE AS SELECT</code> (CTAS) bunu tek adımda yapar:</p>
<pre>CREATE TABLE dbo.FactSatis AS
SELECT s.SiparisNo, s.SatirNo, s.Tarih, s.UrunNo, s.Adet, s.Tutar,
       COALESCE(m.MusteriAnahtari, -1) AS MusteriAnahtari
FROM stg.Satis AS s
LEFT JOIN dbo.DimMusteri AS m
       ON m.MusteriNo = s.MusteriNo
      AND s.Tarih BETWEEN m.GecerliBaslangic AND m.GecerliBitis;</pre>
<p>Bu yapıldıysa Power BI tarafı kolaydır: <code>FactSatis[MusteriAnahtari]</code> ile <code>DimMusteri[MusteriAnahtari]</code> arasında normal bir ilişki kurarsın ve her satış kendiliğinden doğru segmentte görünür. “Bugünkü segmente göre” analiz de istenirse boyuta bir Tip 1 sütunu (<code>GuncelSegment</code>) eklenir.</p>
<div class="warn"><b>Sık hata</b>Olguyu iş anahtarıyla (<code>MusteriNo</code>) Tip 2 boyuta bağlamak. Boyutta aynı numaradan birden çok satır olduğu için ilişki çoka-çok olur ve satışlar sürüm sayısı kadar çoğalabilir.</div>

<h2>Çok değerli boyut ve köprü tablo</h2>
<p>Bir kampanya birden çok kategoriyi kapsar, bir kategori birden çok kampanyada yer alır. Bunu olgu tablosuna sütun olarak koyamazsın. Çözüm bir <b>köprü tablo</b>dur: <code>KampanyaKategori(Kampanya, Kategori)</code>. Modelde köprü, iki boyut arasında durur; filtrenin <code>Kampanya → Köprü → Kategoriler</code> yönünde akması için köprü ile <code>Kategoriler</code> arasındaki ilişki çift yönlü yapılır ya da ölçüde <code>TREATAS</code> kullanılır. Ayrıntı “Tablo fonksiyonları, kümeler ve sanal ilişkiler” dersinde. İki önemli kural:</p>
<ul>
<li>Kampanyalara göre kırılımda toplamlar <b>toplanmaz</b>: Giyim iki kampanyada olduğu için iki satırda da görünür; toplam satırı her kategoriyi bir kez sayar.</li>
<li>Köprüye ağırlık sütunu (ör. 0,5 / 0,5) eklenirse satış kampanyalara paylaştırılabilir.</li>
</ul>
<p>Bizim modelde kampanya tablosu yok; köprü mantığını DAX içinde küçük bir tabloyla deneyebilirsin:</p>
<pre class="dax">Okula Dönüş Satışı =
VAR Kopru =
    SELECTCOLUMNS(
        { ("Okula Dönüş", "Kitap"), ("Okula Dönüş", "Elektronik"), ("Okula Dönüş", "Giyim"),
          ("Yaz Festivali", "Spor"), ("Yaz Festivali", "Giyim") },
        "Kampanya", [Value1], "Kategori", [Value2]
    )
VAR Kategoriler_ = SELECTCOLUMNS(FILTER(Kopru, [Kampanya] = "Okula Dönüş"), "Kategori", [Kategori])
RETURN CALCULATE([Net Satış], KEEPFILTERS(TREATAS(Kategoriler_, Kategoriler[Kategori])))</pre>
<p><code>KEEPFILTERS</code> olmazsa matrisin her kategori satırında kampanyanın toplamı (681.355 ₺) görünür; çünkü <code>TREATAS</code> aynı sütundaki dış filtrenin üzerine yazar.</p>

<h2>Delta bakımı: OPTIMIZE, V-Order, VACUUM</h2>
<p>Her yükleme yeni Parquet dosyaları ekler. Küçük ve çok sayıda dosya hem Spark’ı hem Direct Lake’i yavaşlatır; Direct Lake’in kapasiteye göre dosya ve satır grubu sınırları (guardrails) da aşılabilir.</p>
<ul>
<li><b>OPTIMIZE</b> (sıkıştırma): küçük dosyaları büyük dosyalarda birleştirir.</li>
<li><b>V-Order</b>: Parquet’i yazarken sıralama, kodlama ve sıkıştırmayı VertiPaq tarzı okumaya göre ayarlar. Learn’e göre yazmayı ortalama yaklaşık %15 yavaşlatır, sıkıştırmayı %50’ye kadar artırabilir. <b>Yeni çalışma alanlarında varsayılan olarak kapalıdır</b>; Power BI’ın yoğun okuduğu tablolar için açman gerekir.</li>
<li><b>VACUUM</b>: artık hiçbir sürümün başvurmadığı eski dosyaları siler. Varsayılan saklama 7 gündür; daha kısa süre zaman yolculuğunu (time travel) ve eşzamanlı okuyucuları etkileyebilir.</li>
</ul>
<pre>-- Spark SQL (lakehouse not defteri)
OPTIMIZE satislar VORDER;
VACUUM satislar RETAIN 168 HOURS;

-- Tabloda V-Order'ı kalıcı aç (yalnızca bundan sonraki yazmaları etkiler)
ALTER TABLE satislar SET TBLPROPERTIES ("delta.parquet.vorder.enabled" = "true");</pre>
<p>Aynı işlemler lakehouse gezgininde tabloya sağ tık → <b>Bakım</b> ile de çalıştırılır; düzenli bakım için işlem hattındaki Lakehouse bakım etkinliği (<b>önizleme</b>) kullanılabilir. Ambar tablolarının bakımını Fabric büyük ölçüde kendisi yapar.</p>

<h2>DAX tarafında SCD2: “o tarihteki değer”</h2>
<p>En iyisi, yukarıdaki gibi olgunun doğru sürümün anahtarını taşımasıdır. Ama bazen elinde yalnızca iş anahtarı olan bir olgu ve ayrı bir geçmiş tablosu olur. O zaman her satış satırı için geçerli sürümü tarih aralığına göre bulursun. Bizim modelde <code>Musteriler</code> Tip 1 (yalnızca bugünkü segment) olduğu için geçmişi küçük bir tabloyla canlandıralım: 4 numaralı müşteri 2024’te Premium’a geçti, 8 numaralı müşteri Nisan 2024’te Premium’dan Bireysel’e indi.</p>
<pre class="dax">EVALUATE
SELECTCOLUMNS(
    { (4, "Bireysel", DATE(2022, 1, 1), DATE(2023, 12, 31)),
      (4, "Premium",  DATE(2024, 1, 1), DATE(2099, 12, 31)),
      (8, "Premium",  DATE(2022, 1, 1), DATE(2024, 3, 31)),
      (8, "Bireysel", DATE(2024, 4, 1), DATE(2099, 12, 31)) },
    "MusteriNo", [Value1], "Segment", [Value2],
    "GecerliBaslangic", [Value3], "GecerliBitis", [Value4]
)</pre>
<p>Ölçü, her satış satırında müşterinin o tarihte geçerli sürümünü arar; geçmişte kaydı olmayan müşteri için bugünkü segmenti kullanır:</p>
<pre class="dax">Premium Satış (O Tarihte) =
VAR Gecmis =
    SELECTCOLUMNS(
        { (4, "Bireysel", DATE(2022, 1, 1), DATE(2023, 12, 31)),
          (4, "Premium",  DATE(2024, 1, 1), DATE(2099, 12, 31)),
          (8, "Premium",  DATE(2022, 1, 1), DATE(2024, 3, 31)),
          (8, "Bireysel", DATE(2024, 4, 1), DATE(2099, 12, 31)) },
        "MusteriNo", [Value1], "Segment", [Value2],
        "Bas", [Value3], "Bit", [Value4]
    )
RETURN
CALCULATE(
    SUMX(
        Satislar,
        VAR No = Satislar[MusteriNo]
        VAR Gun = Satislar[Tarih]
        VAR Surum = FILTER(Gecmis, [MusteriNo] = No &amp;&amp; [Bas] &lt;= Gun &amp;&amp; [Bit] &gt;= Gun)
        VAR Seg = IF(ISEMPTY(Surum), RELATED(Musteriler[Segment]), MAXX(Surum, [Segment]))
        RETURN IF(Seg = "Premium", Satislar[Tutar])
    ),
    Satislar[Durum] &lt;&gt; "İptal"
)</pre>
<p>Sonuç: Tip 1 görünümde (<code>Musteriler[Segment] = "Premium"</code>) 2023 Premium satışı 164.865 ₺, tarihsel görünümde 154.847 ₺. Fark tam olarak 4 numaralı müşterinin 2023’teki Bireysel dönemi (−10.594 ₺) ve 8 numaralı müşterinin 2023’teki Premium dönemidir (+576 ₺). Bu ölçü öğreticidir ama satır satır arama yaptığı için büyük olguda yavaştır; üretimde sürüm anahtarını yükleme sırasında olguya yaz.</p>
`,
  ex: [
    { t: 'mc', q: 'Tip 2 müşteri boyutunda olgu tablosu boyuta hangi sütunla bağlanmalı?', o: ['Sürüme özgü vekil anahtar', 'Müşteri adı ve soyadı', 'Kaynak sistemdeki MusteriNo', 'GecerliBaslangic tarihi'], a: 0, why: 'Tip 2’de aynı MusteriNo birden çok satırda bulunur. Olgu, satış tarihinde geçerli sürümün vekil anahtarını taşımalıdır; böylece ilişki bire-çok kalır.' },
    { t: 'mc', q: 'Bir müşterinin adındaki yazım hatası düzeltildi. Bu nitelik için doğru SCD türü genellikle hangisi?', o: ['Tip 2: yeni sürüm satırı açmak', 'Tip 1: değerin üzerine yazmak', 'Köprü tablo ile iki adı tutmak', 'Olgu tablosuna ad sütunu eklemek'], a: 1, why: 'Yazım düzeltmesi tarihsel bir değişiklik değildir; geçmişte de doğru adın görünmesi istenir. Tip 2, iş açısından anlamlı değişiklikler (segment, bölge) içindir.' },
    { t: 'mc', q: 'Yeni bir Fabric çalışma alanında Direct Lake modelin okuduğu tablolar için V-Order hakkında doğru ifade?', o: ['V-Order yalnızca ambar tablolarında çalışır', 'V-Order VACUUM çalıştırınca kendiliğinden açılır', 'V-Order her zaman açıktır, kapatılamaz', 'Varsayılan kapalı; okuma ağırlıklı tablolarda açılmalı'], a: 3, why: 'Learn’e göre V-Order yeni çalışma alanlarında yazma ağırlıklı işler için varsayılan olarak kapalıdır. Tablo özelliği ya da OPTIMIZE … VORDER ile açılır; yalnızca sonraki yazmaları etkiler.' },
    { t: 'mc', q: 'Kampanya–kategori köprüsüyle yapılan bir ölçüde matrisin her kategori satırında aynı kampanya toplamı görünüyor. Neden?', o: ['Köprü tablosunda tekrar eden satır var', 'TREATAS dış kategori filtresinin üzerine yazıyor', 'Kategoriler tablosu işaretli değil', 'SELECTCOLUMNS sütun adını değiştiriyor'], a: 1, why: 'CALCULATE içindeki TREATAS, Kategoriler[Kategori] üzerindeki mevcut filtreyi değiştirir. KEEPFILTERS ile sarılırsa iki filtre kesişir ve her satır yalnızca kendi kategorisini gösterir.' },
    { t: 'dax', name: 'Okula Dönüş Satışı', q: '<b>Okula Dönüş Satışı</b>: Kampanya–kategori köprüsü şu tablodur: <code>SELECTCOLUMNS({ ("Okula Dönüş", "Kitap"), ("Okula Dönüş", "Elektronik"), ("Okula Dönüş", "Giyim"), ("Yaz Festivali", "Spor"), ("Yaz Festivali", "Giyim") }, "Kampanya", [Value1], "Kategori", [Value2])</code>. “Okula Dönüş” kampanyasının kategorilerindeki <code>[Net Satış]</code>’ı TREATAS ile hesapla; matriste her kategori satırı yalnızca kendi değerini göstersin.', sol: 'VAR Kopru = SELECTCOLUMNS({ ("Okula Dönüş", "Kitap"), ("Okula Dönüş", "Elektronik"), ("Okula Dönüş", "Giyim"), ("Yaz Festivali", "Spor"), ("Yaz Festivali", "Giyim") }, "Kampanya", [Value1], "Kategori", [Value2])\nVAR Kats = SELECTCOLUMNS(FILTER(Kopru, [Kampanya] = "Okula Dönüş"), "Kategori", [Kategori])\nRETURN CALCULATE([Net Satış], KEEPFILTERS(TREATAS(Kats, Kategoriler[Kategori])))', hint: 'Köprüyü bir değişkene al, FILTER ile kampanyayı seç, SELECTCOLUMNS ile yalnızca Kategori sütununu bırak; CALCULATE içinde KEEPFILTERS(TREATAS(…, Kategoriler[Kategori])) kullan.' },
    { t: 'dax', name: 'Premium Satış (Tarihsel)', q: '<b>Premium Satış (Tarihsel)</b>: Segment geçmişi: <code>SELECTCOLUMNS({ (4, "Bireysel", DATE(2022,1,1), DATE(2023,12,31)), (4, "Premium", DATE(2024,1,1), DATE(2099,12,31)), (8, "Premium", DATE(2022,1,1), DATE(2024,3,31)), (8, "Bireysel", DATE(2024,4,1), DATE(2099,12,31)) }, "MusteriNo", [Value1], "Segment", [Value2], "Bas", [Value3], "Bit", [Value4])</code>. Her satış satırında müşterinin satış tarihinde geçerli segmentini bul (geçmişte kaydı yoksa <code>Musteriler[Segment]</code>) ve segmenti “Premium” olan satırların <code>Satislar[Tutar]</code> toplamını iptaller hariç döndür.', sol: 'VAR Gecmis = SELECTCOLUMNS({ (4, "Bireysel", DATE(2022,1,1), DATE(2023,12,31)), (4, "Premium", DATE(2024,1,1), DATE(2099,12,31)), (8, "Premium", DATE(2022,1,1), DATE(2024,3,31)), (8, "Bireysel", DATE(2024,4,1), DATE(2099,12,31)) }, "MusteriNo", [Value1], "Segment", [Value2], "Bas", [Value3], "Bit", [Value4])\nRETURN CALCULATE(SUMX(Satislar, VAR No = Satislar[MusteriNo] VAR Gun = Satislar[Tarih] VAR Surum = FILTER(Gecmis, [MusteriNo] = No && [Bas] <= Gun && [Bit] >= Gun) VAR Seg = IF(ISEMPTY(Surum), RELATED(Musteriler[Segment]), MAXX(Surum, [Segment])) RETURN IF(Seg = "Premium", Satislar[Tutar])), Satislar[Durum] <> "İptal")', hint: 'SUMX(Satislar, …) içinde MusteriNo ve Tarih’i değişkene al; FILTER(Gecmis, …) ile tarih aralığına düşen sürümü bul; ISEMPTY ise RELATED(Musteriler[Segment]) kullan. Hepsini CALCULATE(…, Satislar[Durum] <> "İptal") içine koy.' }
  ]
});

})(window);
