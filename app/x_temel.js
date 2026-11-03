/* Kesit Power BI — Temel seviye ders genişletmeleri (Ekim 2026): Başlangıç, Veri Hazırlama, Veri Modelleme, DAX Temelleri, Görselleştirme */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, o) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('ext: ders yok', id); return; } if (o.html) l.body += '<section class="deep"><span class="eyebrow">Uzmanlaş</span>' + o.html + '</section>'; if (o.min) l.min += o.min; if (o.ex) l.ex = (l.ex || []).concat(o.ex); (W.PBI_EXT = W.PBI_EXT || []).push({ id, html: o.html || '', ex: o.ex || [] }); };

/* ───────────── tarih ───────────── */
ext('tarih', { min: 9, html: `
<h2>Bugün nerede duruyor? (Ekim 2026 özeti)</h2>
<p>Tarihçe 2025'te bitmedi. Power BI her ay yeni bir Desktop sürümü çıkarır. Bir işe başladığında ekibin “bunu yeni sürümde yapıyoruz” dediği şeylerin çoğu son iki yılda geldi. Aşağıdaki özet, bu uygulamanın hangi derslerinde nereye bakacağını da gösterir.</p>
<h3>1. Fabric: Power BI artık bir platformun parçası</h3>
<p>Power BI, Microsoft Fabric'in içindeki iş yüklerinden biridir. Rapor, anlam modeli, lakehouse, veri ambarı ve not defteri aynı <b>çalışma alanında (workspace)</b> yan yana durur. Veriler <b>OneLake</b> adlı ortak depoda tutulur. <b>Direct Lake</b> modu, OneLake'teki tabloları kopyalamadan okur. Kurumlar eskiden “Premium kapasite” alırdı; bugün Fabric kapasitesi (F SKU'ları) alır. Ayrıntılar Microsoft Fabric'e giriş dersinde.</p>
<h3>2. Copilot ve yapay zekâya hazır modeller</h3>
<p>Copilot rapor sayfasını özetleyebilir, soruya göre görsel önerebilir, DAX yazmana yardım eder. Copilot'un iyi cevap vermesi için modelin temiz olması gerekir. Bunun için <b>Yapay zekâ için verileri hazırla (Prep data for AI)</b> özelliği var: hangi tabloların kullanılacağını seçersin, doğrulanmış cevaplar ve yapay zekâ talimatları eklersin. Eski doğal dil soru görseli kaldırılıyor (Learn: Şubat 2027); onun yerini Copilot alıyor. Copilot ile çalışmak dersinde adım adım göreceksin.</p>
<h3>3. Desktop'ta yeni görünümler ve görseller</h3>
<div class="tbl-wrap"><table>
<tr><th>Yenilik</th><th>Ne işe yarar?</th><th>Durum (Ekim 2026)</th></tr>
<tr><td>DAX sorgu görünümü</td><td>EVALUATE sorgusu yazıp sonucu tablo olarak görürsün; sonuçta sıralama ve filtre yapabilirsin.</td><td>Genel kullanımda</td></tr>
<tr><td>TMDL görünümü</td><td>Modeli kod olarak okur ve düzenlersin. Artık web'de de var.</td><td>Desktop'ta ve web'de</td></tr>
<tr><td>Görsel hesaplamalar</td><td>Görselin kendi satırları üzerinde hesap (ör. sıra, kümülatif).</td><td>Mayıs 2026'dan beri genel kullanımda</td></tr>
<tr><td>Yeni kart, liste ve düğme dilimleyici</td><td>Birden çok değer gösteren kart, görüntülü düğmeler.</td><td>Kullanımda</td></tr>
<tr><td>Modern görsel varsayılanları, Tema bölmesi, tarih seçici dilimleyici</td><td>Yeni raporlar daha sade bir temayla açılır; tarih dilimleyicisinde takvimden seçim.</td><td>Ağustos 2026 güncellemesi</td></tr>
<tr><td>Web'de modelleme</td><td>Modeli tarayıcıda düzenlemek; Desktop'u açmadan küçük değişiklikler.</td><td>Kullanımda</td></tr>
</table></div>
<div class="warn"><b>Güncel kal</b>Mart 2026 ve öncesindeki Desktop sürümleri Ekim 2026'dan itibaren OneDrive ve SharePoint'e dosya kaydedemez. Kurulum dersinde anlatılan güncelleme yolunu kullan. Özelliklerin durumu sık değişir; bir karar vermeden önce Microsoft'un aylık güncelleme sayfasına bak.</div>
<h2>Eski adlar, yeni adlar</h2>
<p>İş yerinde eski belgelere, eski e-postalara rastlarsın. Aynı şeyin iki adını bilmek seni yanlış anlaşılmaktan korur.</p>
<div class="tbl-wrap"><table>
<tr><th>Eski belgede gördüğün</th><th>Bugünkü karşılığı</th></tr>
<tr><td>Dataset (veri kümesi)</td><td>Anlam modeli (semantic model)</td></tr>
<tr><td>Premium kapasite (P SKU)</td><td>Fabric kapasitesi (F SKU)</td></tr>
<tr><td>Veri görünümü</td><td>Tablo görünümü</td></tr>
<tr><td>Power View</td><td>Power BI rapor tuvali</td></tr>
<tr><td>Doğal dil soru görseli</td><td>Copilot</td></tr>
</table></div>
<div class="tip"><b>Neden önemli?</b>Bir iş görüşmesinde “dataset'i yeniledim” diyen biriyle “anlam modelini yeniledim” diyen aynı işi anlatır. İkisini de anlarsan, sen de güncel adı kullanırsan hem eski hem yeni ekiplerle rahat konuşursun.</div>
`, ex: [
  { t: 'mc', q: 'Eski bir iç belgede “Raporu açmadan önce dataset’i yenile” yazıyor. Bugünkü Power BI Service’te neyi yenilersin?', o: ['Anlam modelini', 'Panoyu (dashboard)', 'Veri akışını (dataflow)', 'Uygulamayı (app)'], a: 0, why: 'Dataset kavramı Fabric ile birlikte anlam modeli (semantic model) adını aldı. Pano yalnızca sabitlenmiş kutuları gösterir, kendi verisi yoktur. Veri akışı ayrı bir hazırlık nesnesidir. Uygulama ise raporları dağıtmanın yoludur; yenilenecek bir verisi yoktur.' },
  { t: 'mc', q: 'Satış müdürü, ekibin rapordaki veriye düz cümleyle soru sorup cevap almasını istiyor. Ekim 2026 itibarıyla hangi yolu önerirsin?', o: ['Her sayfaya doğal dil soru görseli koymayı', 'Copilot’u açıp modeli ona hazırlamayı', 'Raporu Excel’e aktarıp Power Pivot’ta sormayı', 'Her olası soru için ayrı bir sayfa açmayı'], a: 1, why: 'Doğal dil soru görseli kaldırılıyor; yeni yatırım için doğru yol Copilot ve “Yapay zekâ için verileri hazırla” özelliğidir. Excel’e aktarmak soruyu cevaplamaz, her soru için sayfa açmak sürdürülemez.' },
  { t: 'mc', q: 'Ekip, modelin ölçülerini ve tablolarını Git’te sürüm sürüm izlemek ve değişikliği satır satır görmek istiyor. Hangi gelişme bunu kolaylaştırdı?', o: ['Otomatik tarih/saat tabloları', 'Dilimleyicileri eşitleme bölmesi', 'PBIP proje biçimi ve TMDL', 'Performans Analizi bölmesi'], a: 2, why: 'PBIP biçimi raporu ve modeli metin dosyaları olarak kaydeder; TMDL de modeli okunur kod hâline getirir. Böylece Git değişikliği satır satır gösterir. Diğer seçenekler tasarım ve performans araçlarıdır, sürüm izlemeyle ilgisi yoktur.' }
] });

/* ───────────── aile ───────────── */
ext('aile', { min: 9, html: `
<h2>Service’teki nesneler: kim kimin içinde?</h2>
<p>Raporunu yayımladığında Power BI Service’te (Service) tek bir dosya görmezsin; birkaç ayrı nesne oluşur. Bunları bilmek, “raporu sildim, veri de gitti mi?” gibi soruları cevaplamanı sağlar.</p>
<div class="tbl-wrap"><table>
<tr><th>Nesne</th><th>Ne tutar?</th><th>Anadolu Market örneği</th></tr>
<tr><td>Çalışma alanı (Workspace)</td><td>Bir ekibin klasörü. İçindeki her şeye erişimi yönetir.</td><td>“Satış Analitiği” çalışma alanı</td></tr>
<tr><td>Anlam modeli (Semantic model)</td><td>Tablolar, ilişkiler, ölçüler ve verinin kendisi. Yenileme buna yapılır.</td><td>Satislar, Urunler, Tarih ve hazır ölçüler</td></tr>
<tr><td>Rapor (Report)</td><td>Sayfalar ve görseller. Verisi yoktur; bir anlam modeline bağlanır.</td><td>“Aylık Satış Raporu”</td></tr>
<tr><td>Pano (Dashboard)</td><td>Farklı raporlardan sabitlenmiş (pin) kutuları tek ekranda toplar.</td><td>Genel müdürün tek sayfalık özeti</td></tr>
<tr><td>Uygulama (App)</td><td>Çalışma alanındaki seçili raporları paketleyip geniş bir kitleye dağıtır.</td><td>Tüm bölge müdürlerine “Satış Uygulaması”</td></tr>
</table></div>
<p>En önemli fikir şudur: <b>bir anlam modeli, birçok rapor</b>. Finans, satış ve lojistik ekipleri aynı modeli kullanıp kendi raporlarını yaparsa “Net Satış” her raporda aynı çıkar. Herkes kendi kopyasını yaparsa bir ay sonra üç farklı rakam tartışılır.</p>
<h2>Çalışma alanı rolleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Rol</th><th>Ne yapabilir?</th><th>Kime verilir?</th></tr>
<tr><td>Yönetici (Admin)</td><td>Her şey; üye ekleyip çıkarır, alanı siler.</td><td>BI ekibi lideri</td></tr>
<tr><td>Üye (Member)</td><td>İçerik ekler, düzenler, uygulamayı yayımlar.</td><td>Kıdemli geliştiriciler</td></tr>
<tr><td>Katkıda Bulunan (Contributor)</td><td>İçerik ekler ve düzenler, uygulamayı yayımlayamaz.</td><td>Rapor geliştiren analistler</td></tr>
<tr><td>Görüntüleyici (Viewer)</td><td>Yalnızca görüntüler ve etkileşir.</td><td>Okuyucular (çoğu zaman uygulama daha iyidir)</td></tr>
</table></div>
<div class="tip"><b>İyi alışkanlık</b>Okuyucuları çalışma alanına tek tek eklemek yerine onlara uygulama üzerinden erişim ver. Böylece sen çalışma alanında rapor üzerinde değişiklik yaparken okuyucular yarım kalmış hâlini görmez; uygulamayı güncellediğinde yeni hâl yayına çıkar.</div>
<h2>Rolle göre bir gün</h2>
<ul>
<li><b>Analist:</b> Sabah Desktop'ta yeni bir ölçü yazar, test eder, çalışma alanına yayımlar.</li>
<li><b>Satış müdürü:</b> Teams'te ya da telefonda uygulamayı açar, kendi bölgesini dilimleyiciyle seçer, bir veri uyarısı kurar.</li>
<li><b>Veri mühendisi:</b> Fabric'te verinin her gece OneLake'e gelmesini sağlar; analistin modeli bu veriyi okur.</li>
<li><b>BI yöneticisi:</b> Lisansları, kapasiteyi ve kimin hangi çalışma alanına girdiğini izler.</li>
</ul>
<p>Bu derste rolleri kısaca tanıdın; erişim ve güvenlik ayrıntıları Yönetişim ve Satır düzeyinde güvenlik derslerinde.</p>
`, ex: [
  { t: 'mc', q: 'Finans, satış ve lojistik ekipleri aynı satış verisinden kendi raporlarını istiyor. Hangi yapı rakamların her raporda aynı çıkmasını sağlar?', o: ['Her ekip için modelin ayrı bir kopyası', 'Tek bir anlam modeli, üç ayrı rapor', 'Tek rapor, her ekip için gizli sayfa', 'Her ekibe Excel’e aktarılmış bir tablo'], a: 1, why: 'Ortak anlam modeli tek doğru kaynaktır: ölçüler bir kez tanımlanır, üç rapor da aynı modele bağlanır. Kopyalar zamanla birbirinden ayrılır. Gizli sayfalar erişim sorununu çözmez, Excel kopyaları da güncelliğini yitirir.' },
  { t: 'mc', q: 'Genel müdür, üç farklı rapordaki birer kartı ve bir grafiği tek ekranda görmek istiyor. Hangi nesneyi kurarsın?', o: ['Bir pano (dashboard)', 'Yeni bir anlam modeli', 'Bir veri akışı (dataflow)', 'Yeni bir çalışma alanı'], a: 0, why: 'Pano, farklı raporlardan sabitlenmiş kutuları bir araya getirir. Anlam modeli veriyi tutar, görsel göstermez. Veri akışı veri hazırlar. Yeni bir çalışma alanı yalnızca bir klasördür.' },
  { t: 'mc', q: 'Bir analist raporları geliştirmeli ama uygulamayı yayımlama yetkisi olmamalı. Çalışma alanında hangi rolü verirsin?', o: ['Üye (Member)', 'Görüntüleyici (Viewer)', 'Yönetici (Admin)', 'Katkıda Bulunan (Contributor)'], a: 3, why: 'Katkıda Bulunan içerik ekleyip düzenleyebilir ama uygulamayı yayımlayamaz. Üye uygulamayı yayımlayabilir, Yönetici her şeyi yapar. Görüntüleyici ise rapor geliştiremez.' }
] });

/* ───────────── arayuz ───────────── */
ext('arayuz', { min: 8, html: `
<h2>İlk on dakika: boş dosyadan ilk görsele</h2>
<p>Arayüzü ezberlemenin en iyi yolu, bir kez baştan sona küçük bir iş yapmaktır. Aşağıdaki sırayı izle; her adımda hangi bölgeyi kullandığına dikkat et.</p>
<ol>
<li><b>Şerit (üst):</b> Giriş → Veri al ile bir Excel dosyası yükle.</li>
<li><b>Veri bölmesi (sağ):</b> Tabloların listesi gelir. Bir tablonun yanındaki oka tıklayıp sütunlarını aç.</li>
<li><b>Tuval (orta):</b> Veri bölmesinden bir ölçüyü tuvale sürükle. Power BI bir görsel oluşturur.</li>
<li><b>Görselleştirmeler bölmesi:</b> Görsel türünü değiştir, alan kutularını düzenle.</li>
<li><b>Sayfa sekmeleri (alt):</b> Artı (+) ile yeni sayfa ekle; sekmeye çift tıklayıp “Özet” adını ver.</li>
<li><b>Dosya:</b> Ctrl + S ile kaydet. Kaydetmeden çalışmak, ilk dersin en pahalı hatasıdır.</li>
</ol>
<h2>Görselleştirmeler bölmesinin üç simgesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Simge</th><th>Adı</th><th>Ne yaparsın?</th></tr>
<tr><td>Izgara / grafik</td><td>Görsel oluştur</td><td>Görsel türünü seçer, alanları kutulara koyarsın.</td></tr>
<tr><td>Boya fırçası</td><td>Görseli biçimlendir</td><td>Renk, başlık, eksen, veri etiketi gibi görünüş ayarları.</td></tr>
<tr><td>Büyüteç</td><td>Analiz</td><td>Ortalama çizgisi, eğilim çizgisi gibi ek çizgiler.</td></tr>
</table></div>
<p>Bu simgeler yalnızca bir görsel seçiliyken anlamlıdır. Hiçbir görsel seçili değilken fırçaya basarsan sayfanın kendisini (tuval arka planı, sayfa boyutu) biçimlendirirsin. Yeni başlayanların “ayar kayboldu” şikâyetinin çoğu bundandır.</p>
<h2>Alt kenar: sayfalar ve durum çubuğu</h2>
<ul>
<li><b>Sayfa sekmeleri:</b> Sağ tık ile çoğalt, yeniden adlandır, gizle, sil. Gizli sayfa, yayımlanınca okuyucuya görünmez; detay ve araç ipucu sayfaları için kullanılır.</li>
<li><b>Yakınlaştırma:</b> Sağ alttaki kaydırıcı ve “Sayfaya sığdır” düğmesi. Küçük ekranda tuvali bütün görmek için.</li>
</ul>
<h2>Kaybolan bölmeler ve formül çubuğu</h2>
<p>Bölmeler, başlıklarındaki ok ile daraltılır. Tamamen kapanan bir bölmeyi <b>Görünüm</b> sekmesindeki Bölmeleri göster grubundan (Filtreler, Yer işaretleri, Seçim, Performans Analizi…) geri açarsın. Formül çubuğu ise yalnızca bir ölçü, hesaplanmış sütun ya da tablo seçiliyken şeridin hemen altında belirir. Veri bölmesinde ölçünün adına tıkla; formülü orada görürsün.</p>
<div class="note"><b>Arama kutusu</b>Veri bölmesinin üstündeki arama kutusu, onlarca tablonun olduğu modellerde sütunu ya da ölçüyü bulmanın en hızlı yoludur. “satış” yazınca adında satış geçen her alan süzülür.</div>
`, ex: [
  { t: 'mc', q: 'Sağ taraftaki Filtreler bölmesini yanlışlıkla kapattın ve göremiyorsun. Onu nereden geri açarsın?', o: ['Dosya → Seçenekler', 'Görünüm sekmesi', 'Modelleme sekmesi', 'Giriş → Yenile'], a: 1, why: 'Bölmeler Görünüm sekmesindeki bölme düğmeleriyle açılıp kapanır. Seçenekler penceresi uygulama ayarlarıdır, Modelleme sekmesi ölçü ve ilişkiler içindir, Yenile ise veriyi yeniden yükler.' },
  { t: 'mc', q: 'Bir sütun grafiği seçtin ve çubukların rengini değiştirmek istiyorsun. Görselleştirmeler bölmesinde hangi simgeye basarsın?', o: ['Büyüteç (Analiz sekmesi)', 'Izgara (Görsel oluştur sekmesi)', 'Boya fırçası (Biçimlendir)', 'Huni (Filtreler bölmesi)'], a: 2, why: 'Renk, başlık, eksen gibi görünüş ayarları boya fırçası simgesindeki Görseli biçimlendir sekmesindedir. Büyüteç ek analiz çizgileri içindir, ızgara alan kutularını gösterir; huni ise Görselleştirmeler bölmesinde değil, ayrı Filtreler bölmesindedir.' },
  { t: 'mc', q: 'Bir ölçünün formülünü görmek istiyorsun ama şeridin altında formül çubuğu yok. Ne yaparsın?', o: ['Veri bölmesinde ölçünün adını seçerim', 'Model görünümüne geçip ilişkiye tıklarım', 'Tuvaldeki boş bir alana çift tıklarım', 'Dosya → Dışa aktar ile şablon alırım'], a: 0, why: 'Formül çubuğu yalnızca bir ölçü, hesaplanmış sütun ya da tablo seçiliyken görünür. İlişkiye tıklamak ilişki özelliklerini açar, boş tuval sayfayı seçer, şablon dışa aktarmak formülü göstermez.' }
] });

/* ───────────── menuler-turu ───────────── */
ext('menuler-turu', { min: 9, html: `
<h2>Seçenekler penceresi: yeni projede ilk bakılacaklar</h2>
<p>Şeritteki komutlar günlük iştir. Bazı kararlar ise projenin başında bir kez verilir ve <b>Dosya → Seçenekler ve ayarlar → Seçenekler</b> penceresinde durur. Pencerenin solunda iki grup vardır: <b>Genel</b> (bu bilgisayardaki tüm dosyalar) ve <b>Geçerli dosya</b> (yalnızca açık dosya).</p>
<div class="tbl-wrap"><table>
<tr><th>Nerede?</th><th>Ayar</th><th>Neden bakarsın?</th></tr>
<tr><td>Geçerli dosya → Veri Yükleme</td><td>Otomatik tarih/saat</td><td>Kendi tarih tablon varsa kapat; model küçülür.</td></tr>
<tr><td>Geçerli dosya → Veri Yükleme</td><td>Yüklemeden sonra yeni ilişkileri otomatik algıla</td><td>Power BI ad benzerliğinden yanlış ilişki kurabilir. Modeli kendin kuruyorsan kapat.</td></tr>
<tr><td>Geçerli dosya → Bölgesel ayarlar</td><td>İçeri aktarma için yerel ayar</td><td>“1.250,50” gibi Türkçe sayıları ve “31.12.2024” gibi tarihleri doğru okumak için.</td></tr>
<tr><td>Genel → Gizlilik</td><td>Gizlilik düzeyleri</td><td>Farklı kaynakları birleştirirken verinin nereye gönderilebileceği. Veri alma dersinde.</td></tr>
<tr><td>Genel → Önizleme özellikleri</td><td>Yeni, henüz deneme aşamasındaki özellikler</td><td>Açtığın önizleme özelliğini ekip arkadaşın da açmalı; yoksa dosya onda farklı davranır.</td></tr>
</table></div>
<p>Aynı menüdeki <b>Veri kaynağı ayarları</b> ise bağlandığın kaynakların listesidir: dosya yolunu değiştirir, kimlik bilgisini yeniler, izinleri düzenlersin.</p>
<h2>Sağ tık menüleri: en kısa yol</h2>
<p>Şeritte aradığın komutun çoğu, nesneye sağ tıkladığında da çıkar ve orada yalnızca o nesneye uygun komutlar listelenir.</p>
<ul>
<li><b>Veri bölmesinde tabloya sağ tık:</b> Yeni ölçü, Yeni sütun, Verileri yenile, Tarih tablosu olarak işaretle, Görünümde gizle.</li>
<li><b>Sütuna sağ tık:</b> Yeniden adlandır, Gizle, Yeni hiyerarşi, Yeni grup.</li>
<li><b>Görseldeki bir çubuğa sağ tık:</b> Detaya git, Ayrıntıya in, Grupla, “Tablo olarak göster” (görselin arkasındaki sayıları görmek için).</li>
<li><b>Sayfa sekmesine sağ tık:</b> Sayfayı çoğalt, Sayfayı gizle.</li>
</ul>
<h2>Komutu bulamıyorsan</h2>
<ol>
<li><b>Bir şey seçili mi?</b> Bağlamsal sekmeler (Tablo araçları, Sütun araçları, Ölçü araçları) yalnızca ilgili nesne seçiliyken görünür.</li>
<li><b>Doğru görünümde misin?</b> Sütuna göre sıralama Rapor ya da Tablo görünümünde çalışır; ilişki çizmek Model görünümünde.</li>
<li><b>Pencerenin üstündeki arama kutusunu kullan:</b> Komutun adını yazınca Power BI onu bulup çalıştırır.</li>
<li><b>Sürümünü kontrol et:</b> Yardım → Hakkında. Eğitimdeki komut senin sürümünde yoksa güncelleme gerekebilir.</li>
</ol>
<div class="tip"><b>Ekip kuralı</b>Projenin başında Seçenekler penceresindeki kararları (otomatik tarih kapalı, ilişki algılama kapalı, Türkçe yerel ayar) kısa bir nota yaz ve proje klasörüne koy. Ekibe yeni katılan biri aynı ayarlarla başlar.</div>
`, ex: [
  { t: 'mc', q: 'Muhasebeden gelen CSV’de “1.250,50” yazan tutarlar Power BI’da yanlış sayı olarak okunuyor. İlk bakacağın yer neresi?', o: ['Görünüm → Temalar → Tema bölmesi', 'Biçim bölmesindeki veri etiketleri', 'Ölçü araçları → Biçim → Ondalık', 'Seçenekler → Bölgesel ayarlar'], a: 3, why: 'Sayının nasıl okunacağı içeri aktarma yerel ayarına bağlıdır; Türkçe seçilince nokta binlik, virgül ondalık olur. Tema, veri etiketi ve ölçü biçimi yalnızca görünüşü değiştirir; yanlış okunmuş veriyi düzeltmez.' },
  { t: 'mc', q: 'Yeni tablolar yüklediğinde Power BI, adları benzediği için birbiriyle ilgisiz sütunlar arasında kendiliğinden ilişki kuruyor. Bunu nasıl durdurursun?', o: ['İlişki algılama seçeneğini kapatırım', 'Tüm tabloları tek tabloda birleştiririm', 'Otomatik tarih/saat seçeneğini açarım', 'Model görünümünü hiç açmam'], a: 0, why: 'Veri Yükleme bölümündeki “yüklemeden sonra yeni ilişkileri otomatik algıla” seçeneği bu davranışı yönetir. Tek tabloya birleştirmek modeli bozar, otomatik tarih/saat ilişkiyle ilgili değildir, Model görünümünü açmamak ilişkileri engellemez.' },
  { t: 'mc', q: 'Yönetici bir çubuktaki rakamın hangi sayılardan geldiğini soruyor. Görselden çıkmadan sayıları hızlıca görmenin yolu nedir?', o: ['Seçenekler penceresini açmak', 'Veri kaynağı ayarlarına girmek', 'Sağ tık → Tablo olarak göster', 'Raporu PDF olarak dışa aktarmak'], a: 2, why: '“Tablo olarak göster”, görselin arkasındaki değerleri bir tablo hâlinde açar. Seçenekler ve Veri kaynağı ayarları yapılandırma pencereleridir; PDF yalnızca görüntüyü verir.' }
] });

/* ───────────── dax-giris ───────────── */
ext('dax-giris', { min: 12, html: `
<h2>Ölçünü adım adım oluştur</h2>
<ol>
<li>Veri bölmesinde ölçünün “yaşayacağı” tabloya sağ tıkla → <b>Yeni ölçü</b>. Şeritte Giriş ya da Modelleme sekmesindeki Yeni ölçü düğmesi de aynı işi yapar.</li>
<li>Şeridin altında formül çubuğu açılır. <code>Ölçü = ...</code> yazısını sil, kendi formülünü yaz.</li>
<li><b>Enter</b> ile onayla. Birden çok satır yazmak için <b>Shift + Enter</b>.</li>
<li>Ölçü seçiliyken <b>Ölçü araçları</b> sekmesinden biçimi (para birimi, yüzde, ondalık) ayarla.</li>
<li>Ölçüyü bir karta ya da tabloya koyup sonucu kontrol et.</li>
</ol>
<p>Formül yazarken Power BI öneri listesi açar. <code>[</code> yazınca ölçüler, tablo adını yazınca o tablonun sütunları listelenir. Listeden seçmek yazım hatalarını önler.</p>
<h2>Ölçüler nerede yaşar?</h2>
<p>Ölçü verinin içinde saklanmaz; yalnızca formülü saklanır. Hangi tablonun altında göründüğü (<b>giriş tablosu</b>) sadece düzen içindir, hesabı değiştirmez. Çok ölçülü modellerde ekipler boş bir “_Ölçüler” tablosu açıp tüm ölçüleri orada toplar ve klasörlere ayırır. Her ölçüye bir <b>açıklama</b> yazarsan, ölçünün üzerine gelen kişi “bu iptalleri içeriyor mu?” sorusunun cevabını hemen görür.</p>
<h2>İşleçler: dört işlem ve fazlası</h2>
<div class="tbl-wrap"><table>
<tr><th>İşleç</th><th>Anlamı</th><th>Örnek</th></tr>
<tr><td><code>+ - * /</code></td><td>Dört işlem</td><td><code>SUM(Satislar[Tutar]) / 1000</code></td></tr>
<tr><td><code>&amp;</code></td><td>Metinleri birleştirir</td><td><code>"Yıl: " &amp; 2024</code></td></tr>
<tr><td><code>= &lt;&gt; &gt; &lt; &gt;= &lt;=</code></td><td>Karşılaştırma</td><td><code>Satislar[Durum] &lt;&gt; "İptal"</code></td></tr>
<tr><td><code>&amp;&amp;</code> ve <code>||</code></td><td>VE / VEYA</td><td><code>Satislar[Adet] &gt; 1 &amp;&amp; Satislar[Kanal] = "Web"</code></td></tr>
</table></div>
<p>Yönetim kurulu sunumunda sayılar binlik gösterilmek isteniyor. Bir ölçüyle bunu yapabilirsin:</p>
<pre class="dax">Satış (Bin) = SUM(Satislar[Tutar]) / 1000</pre>
<p>Bu modelde sonuç yaklaşık 1.346,2 olur; yani iptaller dahil toplam tutar 1.346.190 ₺. Aynı işi ölçünün biçim ayarıyla (görüntü birimi: Bin) da yapabilirsin. Fark şu: biçim yalnızca görünüşü değiştirir, bölme ise sayının kendisini değiştirir. Başka bir ölçü bu ölçüyü kullanacaksa biçim ayarı daha güvenlidir.</p>
<h2>İlk hata mesajların</h2>
<div class="tbl-wrap"><table>
<tr><th>Ne yazdın?</th><th>Ne oldu?</th><th>Çözüm</th></tr>
<tr><td><code>Satır Tutarı = Satislar[Tutar]</code></td><td>“Tek bir değer belirlenemiyor” hatası</td><td>Ölçü tek bir sayı döndürmeli. Sütunu bir toplayıcıya sar: <code>SUM(Satislar[Tutar])</code>.</td></tr>
<tr><td><code>SUM(Satis[Tutar])</code></td><td>Tablo ya da sütun bulunamadı</td><td>Adı öneri listesinden seç; tablonun adı Satislar.</td></tr>
<tr><td><code>SUM(Satislar[Tutar]</code></td><td>Söz dizimi hatası</td><td>Her açılan parantez kapanmalı.</td></tr>
</table></div>
<pre class="dax" data-notry>Satır Tutarı = Satislar[Tutar]   -- hatalı: ölçüde çıplak sütun</pre>
<p>Neden hata? Bir ölçü bir kartta tek bir sayı göstermek zorundadır. Satislar[Tutar] ise 1.620 satırlık bir sütundur; Power BI hangisini göstereceğini bilemez. Aynı ifade bir <b>hesaplanmış sütunda</b> çalışır, çünkü orada her satır kendi değerini alır. Bu farkın adı satır bağlamıdır; Filtre bağlamı ve satır bağlamı dersinde ayrıntısıyla göreceksin.</p>
<div class="tip"><b>Ölçüyü ölçüyle kur</b>Uygulamadaki hazır ölçüler birbirinin üzerine kurulur: [Brüt Kâr], [Net Satış] eksi [Net Maliyet] demektir. Bu modelde sonuç 456.108 ₺. İptal kuralı değişirse yalnızca [Net Satış] ve [Net Maliyet] güncellenir, [Brüt Kâr] kendiliğinden doğru kalır.</div>
`, ex: [
  { t: 'dax', name: 'Satış Tutarı (Bin ₺)', q: '<b>Satış Tutarı (Bin ₺)</b>: Sunumda sayılar binlik görünsün. Satislar[Tutar] toplamını 1000’e bölen ölçüyü yaz.', sol: 'SUM(Satislar[Tutar]) / 1000', hint: 'Önce SUM ile topla, sonra / 1000 ile böl.' },
  { t: 'dax', name: 'Kâr (Hazır Ölçülerden)', q: '<b>Kâr (Hazır Ölçülerden)</b>: Hiç sütun kullanmadan, yalnızca hazır [Net Satış] ve [Net Maliyet] ölçülerini kullanarak kârı hesapla.', sol: '[Net Satış] - [Net Maliyet]', hint: 'Ölçüler köşeli parantezle, tablo adı olmadan yazılır.' },
  { t: 'mc', q: 'Bir ölçüye <code>= Satislar[Tutar]</code> yazdın ve “tek bir değer belirlenemiyor” hatası aldın. Neden?', o: ['Tablo adı yanlış, Satis yazılmalıydı', 'Sütun çok satır, ölçü tek değer ister', 'Ölçüye para birimi biçimi verilmemiş', 'İlişki tek yönlü olduğu için filtre geçmiyor'], a: 1, why: 'Ölçü bir hücrede tek bir değer döndürmelidir; çıplak sütun 1.620 değer içerir. SUM gibi bir toplayıcı gerekir. Tablo adı doğru olsaydı bile hata sürerdi; biçim ve ilişki yönü bu hatanın sebebi değildir.' }
] });

/* ───────────── toplama ───────────── */
ext('toplama', { min: 12, html: `
<h2>Hangi soru, hangi fonksiyon?</h2>
<p>Doğru toplayıcıyı seçmek için önce soruyu cümle olarak yaz. Cümledeki anahtar kelime fonksiyonu söyler.</p>
<div class="tbl-wrap"><table>
<tr><th>Soru cümlesi</th><th>Fonksiyon</th><th>Bu modelde sonuç</th></tr>
<tr><td>“Toplam ne kadar sattık?”</td><td><code>SUM(Satislar[Tutar])</code></td><td>1.346.190 ₺ (iptaller dahil)</td></tr>
<tr><td>“Kaç satır kayıt var?”</td><td><code>COUNTROWS(Satislar)</code></td><td>1.620</td></tr>
<tr><td>“Kaç sipariş aldık?”</td><td><code>DISTINCTCOUNT(Satislar[SiparisNo])</code></td><td>910</td></tr>
<tr><td>“Kaç farklı müşteri aldı?”</td><td><code>DISTINCTCOUNT(Satislar[MusteriNo])</code></td><td>136</td></tr>
<tr><td>“Kaç farklı ürün satıldı?”</td><td><code>DISTINCTCOUNT(Satislar[UrunNo])</code></td><td>38 (katalogda 40 ürün var)</td></tr>
<tr><td>“Kaç satırda kargo günü dolu?”</td><td><code>COUNT(Satislar[KargoGun])</code></td><td>1.489</td></tr>
<tr><td>“Bir satır ortalama kaç lira?”</td><td><code>AVERAGE(Satislar[Tutar])</code></td><td>yaklaşık 831 ₺</td></tr>
</table></div>
<h2>Ortalama tuzağı: satır ortalaması sepet değildir</h2>
<p>Satış müdürü “ortalama sepetimiz ne kadar?” diye soruyor. Aceleyle <code>AVERAGE(Satislar[Tutar])</code> yazarsan yaklaşık <b>831 ₺</b> bulursun. Oysa doğru cevap toplam tutarın sipariş sayısına bölümüdür: 1.346.190 / 910 = yaklaşık <b>1.479 ₺</b>.</p>
<p>Neden fark var? AVERAGE her <b>satırı</b> bir kez sayar. Bir siparişte üç ürün varsa o sipariş üç satırdır ve ortalamayı üç küçük parça olarak etkiler. “Sepet” ise siparişin tamamıdır. Kural: ortalama istendiğinde önce “neyin ortalaması?” diye sor. Cevap “satırın” değilse <code>DIVIDE(toplam, sayım)</code> kur.</p>
<h2>Sayımlar toplanmaz</h2>
<p>Bir matriste kategorilere göre müşteri sayısını gösterdin. Elektronik 98, Kitap 115, Ev &amp; Yaşam 99… Alt alta toplarsan 649 eder. Ama toplam satırında <b>136</b> yazar. Hata yok: aynı müşteri hem kitap hem elektronik almış olabilir ve her iki satırda da sayılır. Toplam satırı ise müşterileri bir kez sayar.</p>
<p>Aynı şey yıllar için de geçerli: 2022'de 33, 2023'te 79, 2024'te 123 müşteri vardır; toplamları 235 eder ama üç yılda alışveriş yapan farklı müşteri sayısı 136'dır. DISTINCTCOUNT ile hesaplanan bir rakamı Excel'e alıp alt alta toplamak, iş hayatındaki en yaygın raporlama hatalarından biridir.</p>
<div class="warn"><b>Okuyucuyu önceden uyar</b>Müşteri sayısı gibi toplanmayan ölçülerin olduğu matrislerde toplam satırının yanına kısa bir not ya da araç ipucu ekle: “Bir müşteri birden çok kategoride sayılabilir.” Böylece toplantıda “toplam yanlış” tartışması çıkmaz.</div>
<h2>COUNT, COUNTA, COUNTROWS: boşlukları kim sayar?</h2>
<p>Satislar tablosunda 1.620 satır var ama KargoGun sütunu 131 satırda boş. <code>COUNTROWS(Satislar)</code> 1.620, <code>COUNT(Satislar[KargoGun])</code> 1.489 döndürür. COUNT yalnızca dolu (boş olmayan) değerleri sayar. “Kaç satır?” sorusu için COUNTROWS, “kaç satırda bu bilgi var?” sorusu için COUNT ya da COUNTA (metin sütunlarında) kullan. Boşlukların nedeni ve nasıl ele alınacağı BLANK, hatalar ve DAX'ta hata ayıklama dersinde.</p>
<pre class="dax">Kargo Bilgisi Olan Satır = COUNT(Satislar[KargoGun])
Kargo Bilgisi Eksik Satır = COUNTROWS(Satislar) - [Kargo Bilgisi Olan Satır]</pre>
`, ex: [
  { t: 'dax', name: 'İptalsiz Satılan Farklı Ürün', q: '<b>İptalsiz Satılan Farklı Ürün</b>: Katalogdaki tüm ürünleri değil, iptal edilmemiş bir siparişte en az bir kez satılmış farklı ürünleri say (Satislar tablosundan).', sol: 'CALCULATE(DISTINCTCOUNT(Satislar[UrunNo]), Satislar[Durum] <> "İptal")', hint: 'DISTINCTCOUNT(Satislar[UrunNo]) ifadesini CALCULATE ile Satislar[Durum] <> "İptal" filtresiyle sar.' },
  { t: 'dax', name: 'Satır Başına Ortalama Tutar', q: '<b>Satır Başına Ortalama Tutar</b>: Bir sipariş satırının ortalama Tutar değerini hesapla (sepet değil, satır ortalaması).', sol: 'AVERAGE(Satislar[Tutar])', hint: 'Satır düzeyinde ortalama için AVERAGE yeterli.' },
  { t: 'dax', name: 'Kargo Günü Dolu Satır', q: '<b>Kargo Günü Dolu Satır</b>: KargoGun sütununda değeri olan (boş olmayan) satırların sayısı.', sol: 'COUNT(Satislar[KargoGun])', hint: 'COUNT yalnızca boş olmayan sayısal değerleri sayar.' },
  { t: 'mc', q: 'Matriste kategorilere göre müşteri sayısının satırları toplanınca 649 ediyor ama toplam satırı 136 diyor. Yöneticiye ne söylersin?', o: ['Toplam satırı hatalı, kapatmak gerekir', 'Ölçü yanlış, SUM ile yeniden yazılmalı', 'Müşteri birden çok kategoride sayılır', 'Model yenilenmemiş, yenileyince düzelir'], a: 2, why: 'DISTINCTCOUNT her satırda o kategoriden alışveriş yapan müşterileri sayar; aynı müşteri birkaç kategoride görünür. Toplam satırı müşterileri bir kez sayar, bu yüzden 136 doğrudur. Toplamı kapatmak ya da SUM kullanmak yanlış bilgi verir; yenileme sonucu değiştirmez.' }
] });

/* ───────────── ilk-rapor ───────────── */
ext('ilk-rapor', { min: 9, html: `
<h2>Boş sayfadan yayına: sekiz adımlık çalışma düzeni</h2>
<p>İlk raporda en çok zaman kaybettiren şey, görselleri rastgele eklemek ve sonra her şeyi yeniden dizmektir. Aşağıdaki sıra, işyerinde ilk haftanda vereceğin bir raporu düzenli kurmanı sağlar.</p>
<ol>
<li><b>Soruyu yaz:</b> “Satış müdürü bu sayfaya bakınca hangi üç soruya cevap bulacak?” Sayfanın üstüne bir metin kutusuyla bu soruyu not al; sonra silersin.</li>
<li><b>Kaydet ve adlandır:</b> Dosyaya anlamlı bir ad ver (“Satis_Ozet_v1.pbix”), sayfa sekmesine “Özet” de.</li>
<li><b>Tuvali ayarla:</b> Hiçbir görsel seçili değilken Biçim → Tuval ayarları: 16:9 çoğu ekran için doğrudur.</li>
<li><b>Üst şerit:</b> Soldan sağa 3–4 kart: [Net Satış], [Brüt Kâr], [Kâr Marjı %], [Sipariş Sayısı].</li>
<li><b>Orta alan:</b> Solda kategoriye göre sıralı çubuk, sağda aylara göre çizgi grafik.</li>
<li><b>Dilimleyici:</b> Üstte ya da solda tek bir yıl dilimleyicisi. Başlangıçta fazla dilimleyici koyma.</li>
<li><b>Test et:</b> Rakamları bir kontrol değerine karşı doğrula (aşağıda).</li>
<li><b>Yayımla:</b> Giriş → Yayımla → çalışma alanını seç. Service’te raporu açıp bir kez daha dene.</li>
</ol>
<h2>Sayfa düzeni: göz nereden başlar?</h2>
<p>Soldan sağa okuyan biri sayfaya sol üstten girer, sağa ve aşağı doğru ilerler. Bu yüzden en önemli rakam sol üstte, ayrıntı sağ altta durur. Genelden özele: önce “ne kadar?”, sonra “nerede?”, en son “hangi kalemler?”. Görseller arasında eşit boşluk bırak; hizalamak için birden çok görseli seçip Biçim → Hizala komutunu kullan.</p>
<div class="tip"><b>Az ama doğru</b>İlk sürümde bir sayfaya 6–8 görsel yeter. Daha fazlası gerekiyorsa ayrıntıyı ikinci bir sayfaya ya da detay sayfasına taşı. Kalabalık sayfa hem okunmaz hem yavaş açılır.</div>
<h2>Kendini test et: kontrol rakamları</h2>
<p>Rapor ne kadar güzel olursa olsun, rakam yanlışsa güven bir kez kaybolur. Yayımlamadan önce birkaç değeri başka bir kaynakla karşılaştır. Bu modelde kontrol rakamları şunlar:</p>
<div class="tbl-wrap"><table>
<tr><th>Kontrol</th><th>Beklenen</th><th>Fark çıkarsa ilk şüphe</th></tr>
<tr><td>Tüm yıllar [Net Satış]</td><td>1.250.772 ₺</td><td>Rapor düzeyinde unutulmuş bir filtre</td></tr>
<tr><td>2024 [Net Satış]</td><td>747.066 ₺</td><td>Dilimleyici başka bir yılda kalmış</td></tr>
<tr><td>2024 iptaller dahil tutar</td><td>808.362 ₺</td><td>Karşıdaki kişi iptalleri de topluyor</td></tr>
</table></div>
<p>Muhasebeden biri “bizde 2024 satışı 808 bin” diyorsa ikiniz de haklı olabilirsiniz: biri iptalleri dahil ediyor, diğeri etmiyor. Bu yüzden her kartın araç ipucuna ya da sayfa altına kısa bir tanım yaz: “Net satış: iptal edilen siparişler hariç.” Ayrıntılı test yöntemleri Rapor kalitesi dersinde.</p>
`, ex: [
  { t: 'mc', q: 'Raporundaki 2024 net satış kartı 747.066 ₺ gösteriyor; finans “bizde 808.362 ₺” diyor. İlk neyi kontrol edersin?', o: ['Kartın yazı tipi boyutunu ve rengini', 'İptallerin dahil olup olmadığını', 'Raporun temasını ve sayfa boyutunu', 'Dilimleyicinin stilini ve konumunu'], a: 1, why: 'Bu modelde 2024’te iptaller dahil tutar 808.362 ₺, iptaller hariç net satış 747.066 ₺’dir; fark tanımdan gelir. Yazı tipi, tema ya da dilimleyici stili hesabı değiştirmez.' },
  { t: 'mc', q: 'Satış özet sayfasında en önemli rakam olan toplam net satış kartını nereye koyarsın?', o: ['Sağ alt köşeye', 'Sayfanın ortasına, küçük', 'Sol üst köşeye', 'Ayrı bir gizli sayfaya'], a: 2, why: 'Soldan sağa okuyan biri sayfaya sol üstten girer; ana rakam orada ilk görülür. Sağ alt ayrıntı içindir, ortada küçük bir kart kaybolur, gizli sayfa okuyucuya görünmez.' },
  { t: 'mc', q: 'İlk raporunda bir sayfaya 12 görsel ve 6 dilimleyici yerleştirdin; sayfa kalabalık ve yavaş. En iyi ilk adım hangisi?', o: ['Tüm görselleri küçültüp sığdırmak', 'Dilimleyicileri gizleyip filtreyi kilitlemek', 'Ayrıntıları ikinci bir sayfaya taşımak', 'Temayı koyu renge çevirmek'], a: 2, why: 'Ana sayfada özeti bırakıp ayrıntıyı başka bir sayfaya ya da detay sayfasına taşımak hem okunurluğu hem hızı artırır. Küçültmek okunurluğu bozar, dilimleyicileri gizlemek okuyucunun seçimini elinden alır, tema hız ve kalabalık sorununu çözmez.' }
] });

/* ───────────── gorsel-secimi ───────────── */
ext('gorsel-secimi', { min: 9, html: `
<h2>Soru cümlesinden grafiğe</h2>
<p>Bir yönetici sana genelde grafik türü söylemez, soru sorar. Sorudaki anahtar kelimeyi yakalarsan grafik kendiliğinden belli olur. Aşağıdaki tablo, ana dersteki karar tablosunu iş hayatında sık duyacağın cümlelerle genişletir.</p>
<div class="tbl-wrap"><table>
<tr><th>Duyduğun cümle</th><th>Anahtar kelime</th><th>Görsel</th><th>Kurulum ipucu</th></tr>
<tr><td>“En çok satan 10 ürün hangisi?”</td><td>en çok, sıralama</td><td>Sıralı yatay çubuk</td><td>İlk N filtresiyle 10 ürün, azalan sıralama</td></tr>
<tr><td>“Hedefin neresindeyiz?”</td><td>hedef</td><td>Kart (referans etiketiyle) ya da KPI</td><td>Değer: [Net Satış], hedef: [Hedef]</td></tr>
<tr><td>“Siparişlerin çoğu hangi tutar aralığında?”</td><td>çoğu, aralık</td><td>Histogram (sütun)</td><td>Tutarı gruplara (kutulara) böl, sipariş say</td></tr>
<tr><td>“Mobil'in payı yıllar içinde arttı mı?”</td><td>pay + zaman</td><td>%100 yığılmış sütun</td><td>X: yıl, gösterge: kanal</td></tr>
<tr><td>“Hangi kategori hangi yılda zayıf?”</td><td>iki boyut</td><td>Matris + koşullu biçim</td><td>Satır: kategori, sütun: yıl, arka plan rengi</td></tr>
<tr><td>“Şehirlere göre satış?”</td><td>yer</td><td>Önce sıralı çubuk; harita yalnızca konum anlam taşıyorsa</td><td>Haritada küçük farklar görünmez</td></tr>
<tr><td>“Bu ayın sipariş listesi lazım.”</td><td>liste</td><td>Tablo</td><td>Okuyucu dışa aktaracaksa en uygun görsel</td></tr>
</table></div>
<h2>Anadolu Market'ten üç örnek</h2>
<h3>1. Kategoriler: pasta neden kötü seçim?</h3>
<p>Yedi kategorinin net satışı Elektronik'te 339.304 ₺, Hediye'de 17.370 ₺. Pasta grafikte Hediye ince bir çizgi olarak kaybolur; Kitap (151.882 ₺) ile Kozmetik (133.564 ₺) arasındaki fark ise açılardan okunamaz. Sıralı yatay çubukta her iki fark da tek bakışta görünür.</p>
<h3>2. Kanallar: üç dilimde halka kabul edilebilir</h3>
<p>Mobil 599.841 ₺, Web 457.331 ₺, Mağaza 193.600 ₺. Yalnızca üç parça var ve soru “bütünün ne kadarı?” ise halka grafik işini görür. Ama soru “kanalların payı nasıl değişti?” olursa yıllara göre %100 yığılmış sütuna geçmen gerekir; tek bir halka zamanı gösteremez.</p>
<h3>3. Hedef: tek sayı, tek bağlam</h3>
<p>2024'te net satış 747.066 ₺, hedef 763.200 ₺; gerçekleşme yaklaşık %97,9. Bunun için bir sütun grafiği gerekmez. Kart görselinde ana değer olarak net satışı, referans etiketi olarak hedefi ve gerçekleşme oranını göster. Okuyucu üç saniyede “hedefin biraz altındayız” der.</p>
<h2>Beş saniye testi</h2>
<p>Grafiği yaptıktan sonra bir arkadaşına beş saniye göster ve kapat. Sonra “ne gördün?” diye sor. Cevabı senin göstermek istediğin mesaja yakınsa görsel doğrudur. Değilse sıralamayı, renkleri ya da görsel türünü değiştir. Bu küçük test, toplantıda yanlış anlaşılmanın önüne geçer. Daha fazla ilke Görselleştirme ilkeleri ve Görsel algı derslerinde.</p>
`, ex: [
  { t: 'mc', q: 'Pazarlama müdürü “Siparişlerimizin çoğu hangi tutar aralığında?” diye soruyor. Hangi görseli kurarsın?', o: ['Tutar aralığına göre sipariş sayısı', 'Kategori bazında sipariş payı pastası', 'Aylara göre net satış ve sipariş çizgisi', 'Ortalama sepet tutarını gösteren kart'], a: 0, why: 'Soru bir dağılım sorusudur: tutarlar gruplara (aralıklara) bölünür ve her gruptaki sipariş sayısı sütunla gösterilir (histogram). Pasta kategori payını, çizgi zamanı, tek kart ise yalnızca ortalamayı gösterir; dağılımı göstermez.' },
  { t: 'mc', q: 'Yönetim “Mobil kanalın payı 2022’den 2024’e nasıl değişti?” diye soruyor. Hangi görsel en doğrudan cevap verir?', o: ['Tüm yılların toplamıyla tek bir halka', 'Yıllara göre %100 yığılmış sütun', 'Kanallara göre sıralı çubuk', 'Kanal başına ayrı bir kart'], a: 1, why: '%100 yığılmış sütun her yılın bütününü eşit boyda gösterir; Mobil diliminin büyüyüp küçüldüğü yıldan yıla görülür. Tek halka zamanı göstermez, sıralı çubuk payı değil tutarı karşılaştırır, ayrı kartlar ise yıl kırılımı vermez.' },
  { t: 'mc', q: '12 şehrin net satışını karşılaştırmak istiyorsun; şehirlerin çoğu birbirine yakın. Yönetici en iyi beş şehri görmek istiyor. Ne kurarsın?', o: ['Kabarcık boyutlu harita', 'Şehir başına pasta dilimi', 'Sıralı yatay çubuk', 'Şehirlere göre çizgi grafik'], a: 2, why: 'Yakın değerleri ve sıralamayı en iyi sıralı çubuk gösterir. Haritada kabarcık boyutları arasındaki küçük farklar okunmaz, 12 dilimli pasta okunamaz, çizgi grafik ise zaman gibi sıralı bir eksen içindir.' }
] });

/* ───────────── gorsel-temel ───────────── */
ext('gorsel-temel', { min: 9, html: `
<h2>Alan kutusundaki küçük ok: özetleme seçenekleri</h2>
<p>Alan kutusuna koyduğun her alanın yanında küçük bir aşağı ok vardır. Bu menü, Power BI'ın o alanla ne yapacağını belirler.</p>
<div class="tbl-wrap"><table>
<tr><th>Seçenek</th><th>Ne yapar?</th><th>Ne zaman?</th></tr>
<tr><td>Topla, Ortalama, En az, En çok</td><td>Sayısal sütunu bu yolla özetler (örtük ölçü).</td><td>Hızlı keşifte; kalıcı raporda açık ölçü yaz.</td></tr>
<tr><td>Say, Farklı say</td><td>Değerleri ya da farklı değerleri sayar.</td><td>Metin sütunlarında varsayılan.</td></tr>
<tr><td>Özetleme</td><td>Her değeri olduğu gibi gösterir.</td><td>Tabloda ürün kodu, fiyat listesi gibi alanlarda.</td></tr>
<tr><td>Bu görsel için yeniden adlandır</td><td>Yalnızca bu görselde başlığı değiştirir; modeldeki ad aynı kalır.</td><td>“Sum of Tutar” yerine “Satış” yazmak için.</td></tr>
<tr><td>Değeri olmayan öğeleri göster</td><td>Ölçüsü boş olan satırları da listeler.</td><td>Satışı olmayan kategorileri de görmek için.</td></tr>
</table></div>
<p>Bir örnek: tabloya Satislar[KargoGun] sütununu sürükledin. Power BI onu kendiliğinden toplar ve “KargoGun toplamı: 4.647” yazar. Bu sayının iş anlamı yoktur; kimse kargo günlerini toplamaz. Oktan <b>Ortalama</b> seçebilirsin ama doğrusu hazır <b>[Ortalama Kargo Günü]</b> ölçüsünü kullanmaktır. Böylece aynı hesap her raporda aynı adla çıkar.</p>
<h2>Tablo mu, matris mi?</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Tablo</th><th>Matris</th></tr>
<tr><td>Yapı</td><td>Düz liste; her satır bir kayıt ya da grup</td><td>Satır × sütun çaprazı (Excel'deki pivot tablo gibi)</td></tr>
<tr><td>Alt toplam</td><td>Yalnızca en altta toplam</td><td>Her düzeyde alt toplam</td></tr>
<tr><td>Hiyerarşi</td><td>Yok</td><td>Artı / eksi ile açılıp kapanan düzeyler</td></tr>
<tr><td>Tipik kullanım</td><td>Sipariş listesi, müşteri listesi, dışa aktarma</td><td>Kategori × yıl satışı, bölge → şehir kırılımı</td></tr>
</table></div>
<p>Kategoriler[Kategori] satırlara, Tarih[Yil] sütunlara, [Net Satış] değerlere konunca matris bir pivot tablo olur: örneğin Elektronik 2022'de 26.724 ₺, Hediye 2022'de 2.000 ₺. Aynı alanları bir tabloya koyarsan her kategori-yıl çifti ayrı bir satır olur; karşılaştırmak zorlaşır.</p>
<h2>Satış olmayan satırlar neden kayboluyor?</h2>
<p>Power BI, ölçüsü boş (BLANK) olan satırları varsayılan olarak gizler. Bir dilimleyicide yalnızca bir ay seçtiğinde o ay satışı olmayan kategori listeden düşer. Çoğu zaman bu istenen davranıştır: boş satırlar gürültüdür. Ama yönetici “satış yapmayan kategoriyi de görmek istiyorum” diyorsa satır alanının okundan <b>Değeri olmayan öğeleri göster</b> seçeneğini aç. Boş yerine 0 görmek istenirse bu bir ölçü kararıdır; BLANK, hatalar ve DAX'ta hata ayıklama dersinde nasıl yapılacağını göreceksin.</p>
<div class="note"><b>Tarih alanında hiyerarşi</b>Otomatik tarih/saat açıksa bir tarih sütununu eksene koyduğunda Yıl → Çeyrek → Ay → Gün hiyerarşisi gelir. Kendi tarih tablonu kullanıyorsan oktan yalnızca tarihin kendisini seçebilir ya da Tarih tablosundaki Yil, Ay sütunlarını ayrı ayrı koyabilirsin. Tarih tablosu dersinde neden kendi tablonun daha iyi olduğunu gördün.</div>
`, ex: [
  { t: 'mc', q: 'Tabloya Satislar[KargoGun] sütununu ekledin, başlıkta “KargoGun toplamı” ve 4.647 yazıyor. Kalıcı raporda en doğru çözüm nedir?', o: ['Sütunu tablodan tamamen çıkarmak', 'Görsel başlığını yeniden adlandırmak', 'Tabloyu matrise çevirmek', 'Hazır ortalama kargo ölçüsünü koymak'], a: 3, why: 'Kargo günlerini toplamak anlamsızdır; ortalama gerekir. Bunu her raporda aynı tutmanın yolu açık bir ölçüdür ([Ortalama Kargo Günü]). Yeniden adlandırmak yanlış hesabı gizler, matris toplamı değiştirmez, sütunu çıkarmak ise soruyu cevapsız bırakır.' },
  { t: 'mc', q: 'Bir ay seçince satışı olmayan kategori tablodan kayboluyor. Yönetici o kategorinin de listede görünmesini istiyor. Ne yaparsın?', o: ['Değeri olmayan öğeleri göster’i açarım', 'Kategoriyi rapor filtresine eklerim', 'Dilimleyiciyi tek seçime çeviririm', 'İlişkiyi çift yönlü yaparım'], a: 0, why: 'Power BI boş ölçülü satırları varsayılan olarak gizler; “Değeri olmayan öğeleri göster” bu satırları geri getirir. Rapor filtresi satırı geri getirmez, tek seçim ayarı ilgisizdir, çift yönlü ilişki ise başka sorunlara yol açar ve bu sorunu çözmez.' },
  { t: 'mc', q: 'Kategori × yıl satışını, her düzeyde alt toplamla ve artı/eksi ile açılan bölge → şehir kırılımıyla göstermek istiyorsun. Hangi görsel?', o: ['Tablo', 'Matris', 'Kart', 'Kümelenmiş sütun'], a: 1, why: 'Satır × sütun çaprazı, her düzeyde alt toplam ve açılıp kapanan hiyerarşi matrisin özelliğidir. Tablo düz listedir, kart tek değer gösterir, sütun grafiği alt toplam vermez.' }
] });

/* ───────────── bicim-temel ───────────── */
ext('bicim-temel', { min: 10, html: `
<h2>Biçimi kopyala: Biçim boyacısı</h2>
<p>Altı grafiğin aynı görünmesini istiyorsun. Her birinde yirmi ayarı tek tek yapmak yerine birini bitir, onu seç ve <b>Giriş → Biçim boyacısı (Format painter)</b> düğmesine bas. Sonra hedef görsele tıkla. Başlık, renk, kenarlık, yazı tipi aynen kopyalanır. Düğmeye çift tıklarsan birden çok görsele art arda uygulayabilirsin.</p>
<h2>Tema mı, tek tek ayar mı?</h2>
<p>Biçim ayarlarının bir önceliği vardır. Görselde elle yaptığın ayar, temadan gelen ayarı <b>ezer</b>. Bu iyi bir şeydir ama bir tuzağı var: temayı sonradan değiştirdiğinde elle ayarlanmış görseller eski renklerinde kalır.</p>
<div class="tbl-wrap"><table>
<tr><th>Yol</th><th>Ne zaman doğru?</th><th>Dikkat</th></tr>
<tr><td>Tema (Görünüm → Temalar)</td><td>Kurumsal renkler, yazı tipleri, tüm raporlarda aynı görünüm</td><td>Ağustos 2026'dan beri yeni raporlar sade bir temel temayla açılır; Tema bölmesinden düzenlenir.</td></tr>
<tr><td>Biçim boyacısı</td><td>Bu rapordaki birkaç görseli eşitlemek</td><td>Kopyalanan ayarlar da elle yapılmış sayılır.</td></tr>
<tr><td>Görsel ayarı</td><td>Bir görseli bilinçli olarak farklı yapmak (vurgu)</td><td>Az kullan; tema değişince elle düzeltmen gerekir.</td></tr>
</table></div>
<p>Bir görsel temayı dinlemiyorsa Biçim bölmesinde ilgili bölümün altındaki <b>Varsayılana sıfırla</b> bağlantısını kullan. O bölümün ayarları temaya geri döner.</p>
<h2>Koşullu biçime ilk adım</h2>
<p>Renk, anlam taşıdığında güçlüdür. Bir çubuğun ya da hücrenin rengini sabit seçmek yerine bir kurala bağlayabilirsin. Renk ayarının yanındaki <b>fx</b> düğmesi üç yol sunar:</p>
<ul>
<li><b>Renk ölçeği (Gradient):</b> Değer büyüdükçe renk koyulaşır. Isı haritası gibi matrislerde.</li>
<li><b>Kurallar (Rules):</b> “%97'den küçükse kırmızı” gibi eşikler.</li>
<li><b>Alan değeri (Field value):</b> Rengi bir ölçü döndürür. Kural karmaşıksa ve birden çok görselde kullanılacaksa en temiz yol budur.</li>
</ul>
<p>Örnek: hedefi en az %97 tutturan kategori yeşil, diğerleri kırmızı olsun. Bu modelde Kitap ve Giyim %97'nin üstünde; Elektronik %96,4 ile altında kalır. Yıllara bakınca 2022 (%77) kırmızı, 2023 ve 2024 yeşildir.</p>
<pre class="dax">Hedef Rengi = IF([Hedef Gerçekleşme %] &gt;= 0.97, "#1B7F3B", "#B3261E")</pre>
<p>Sonra çubuk renginin fx'inde Biçim stili: <b>Alan değeri</b>, alan: [Hedef Rengi] seçersin. Simgeler, veri çubukları ve daha ayrıntılı kurallar Koşullu biçimlendirme ve KPI'lar dersinde.</p>
<div class="warn"><b>Rengi tek başına bırakma</b>Kırmızı-yeşil ayrımını görmekte zorlanan okuyucular vardır. Renge ek olarak veri etiketi, simge ya da “▲/▼” gibi bir işaret kullan. Erişilebilirlik ayrıntıları Mobil düzen ve erişilebilirlik dersinde.</div>
`, ex: [
  { t: 'dax', name: 'Hedef Rengi (Temel)', q: '<b>Hedef Rengi (Temel)</b>: Çubuk rengine bağlanacak ölçü. [Hedef Gerçekleşme %] 0,97 ya da üstündeyse "#1B7F3B", değilse "#B3261E" döndür.', sol: 'IF([Hedef Gerçekleşme %] >= 0.97, "#1B7F3B", "#B3261E")', hint: 'IF(koşul, doğruysa, yanlışsa) kalıbını kullan; renk kodları çift tırnak içinde metindir.' },
  { t: 'mc', q: 'Bir grafiği istediğin gibi biçimlendirdin. Aynı sayfadaki beş grafik de böyle görünsün istiyorsun. En hızlı yol hangisi?', o: ['Her grafikte ayarları elle tekrarlamak', 'Grafikleri silip kopyasını yapıştırmak', 'Yeni bir JSON tema yazıp yüklemek', 'Biçim boyacısıyla biçimi kopyalamak'], a: 3, why: 'Biçim boyacısı bir görselin biçimini diğerlerine tek tıkla aktarır. Elle tekrar yavaştır, kopyala-yapıştır alanları da değiştirir, yeni tema ise tüm raporu etkileyen daha büyük bir iştir.' },
  { t: 'mc', q: 'Raporun temasını kurumsal renklere çevirdin ama iki grafik eski renklerinde kaldı. Büyük olasılıkla neden?', o: ['O grafiklerde renk elle ayarlanmış', 'Tema yalnızca kartlara uygulanır', 'Grafiklerin verisi yenilenmemiş', 'Grafikler başka bir sayfada duruyor'], a: 0, why: 'Görsel düzeyindeki elle yapılmış ayar temayı ezer; tema değişse de o ayar kalır. Çözüm ilgili bölümde Varsayılana sıfırla’dır. Tema tüm görsellere uygulanır, veri yenilemesi rengi etkilemez, tema tüm sayfaları kapsar.' },
  { t: 'mc', q: 'Kategori × yıl matrisinde yüksek satışlar koyu, düşükler açık renkte görünsün; okuyucu zayıf hücreleri hemen fark etsin. Hangi fx biçim stilini seçersin?', o: ['Kurallar, tek eşikle', 'Alan değeri, sabit metin', 'Renk ölçeği', 'Varsayılana sıfırla'], a: 2, why: 'Değere göre kademeli koyulaşan renk, renk ölçeğidir (gradient); ısı haritası etkisi verir. Tek eşikli kural yalnızca iki renk üretir, sabit metinli alan değeri her hücreyi aynı boyar, sıfırlama ise koşullu biçimi kaldırır.' }
] });

/* ───────────── filtreler ───────────── */
ext('filtreler', { min: 10, html: `
<h2>Filtre mi, dilimleyici mi? Yan yana karşılaştırma</h2>
<p>Dört yol da sonunda aynı şeyi yapar: ölçünün hesaplandığı satırları daraltır. Farkları kimin değiştirdiği, nerede durduğu ve neyi etkilediğidir.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>Görsel filtresi</th><th>Sayfa filtresi</th><th>Rapor filtresi</th><th>Dilimleyici (Slicer)</th></tr>
<tr><td>Nerede durur?</td><td>Filtreler bölmesi</td><td>Filtreler bölmesi</td><td>Filtreler bölmesi</td><td>Tuvalin üzerinde</td></tr>
<tr><td>Neyi etkiler?</td><td>Tek görsel</td><td>O sayfadaki görseller</td><td>Tüm sayfalar</td><td>Sayfadaki görseller (eşitlenirse başka sayfalar da)</td></tr>
<tr><td>Kim değiştirir?</td><td colspan="3">Okuyucu (kilitli ya da gizli değilse)</td><td>Okuyucu, tek tıkla</td></tr>
<tr><td>Görsel bazında kapatılabilir mi?</td><td>Gerekmez</td><td colspan="2">Hayır</td><td>Evet: Etkileşimleri düzenle</td></tr>
<tr><td>Ölçüye göre filtre</td><td>Evet</td><td colspan="2">Hayır</td><td>Hayır</td></tr>
</table></div>
<p>Pratik kural: okuyucunun sık değiştireceği bir seçimse ve göz önünde olmalıysa dilimleyici; arka planda duran bir iş kuralıysa kilitli bir filtre. “Bu sayfa yalnızca 2024” gibi okuyucunun değiştirmemesi gereken bir şeyi dilimleyiciyle yaparsan biri mutlaka başka yıla tıklar.</p>
<h2>Etkileşimleri düzenle</h2>
<p>Varsayılan olarak bir dilimleyici sayfadaki her görseli süzer. Bazen istemezsin. Örnek: sayfada “Tüm zamanların net satışı: 1.250.772 ₺” kartı var ve yıl seçilince değişmemeli. Dilimleyiciyi seç → <b>Biçim</b> sekmesi → <b>Etkileşimleri düzenle</b>. Her görselin üstünde küçük simgeler çıkar: <b>Filtrele</b>, <b>Vurgula</b> (yalnızca grafiklerde) ve <b>Hiçbiri</b>. Karttaki “Hiçbiri” simgesine bas; artık kart dilimleyiciyi dinlemez. Aynı ayar, bir grafiğe tıklayınca diğer grafiklerin nasıl tepki vereceği için de geçerlidir.</p>
<h2>Okuyucu tarafında üç ayrıntı</h2>
<ul>
<li><b>Kalıcı filtreler:</b> Service’te okuyucunun son seçimleri hatırlanır. Ertesi gün rapor aynı seçimle açılır. Sağ üstteki <b>Varsayılana sıfırla</b> düğmesi senin yayımladığın hâle döner.</li>
<li><b>Uygula düğmesi:</b> Çok dilimleyicili sayfada her tıklama yeni bir hesap başlatır. İyileştir sekmesindeki sorgu azaltma ayarlarıyla dilimleyicilere ve filtrelere bir <b>Uygula</b> düğmesi eklenir; okuyucu seçimlerini bitirip bir kez hesaplatır.</li>
<li><b>Yayımlarken seçim kalır:</b> Desktop'ta dilimleyicide 2023'ü seçili bırakıp yayımlarsan okuyucu raporu 2023 ile açar. Yayımlamadan önce dilimleyicileri istediğin başlangıç hâline getir.</li>
</ul>
<h2>Dilimleyici her şeyi süzmez</h2>
<p>Filtre ilişkiler üzerinden akar. Bu modelde Hedefler tablosu Tarih ve Kategoriler'e bağlıdır ama kanal bilgisi yoktur. Satislar[Kanal] dilimleyicisinde “Web” seçtiğinde net satış küçülür, [Hedef] ise 1.299.300 ₺ olarak aynı kalır. Bu bir hata değil, hedefin kanal düzeyinde verilmemiş olmasıdır. Okuyucu “Web'in hedefi bu mu?” diye yanlış okumasın diye hedef görselinde kanal etkileşimini <b>Hiçbiri</b> yap ya da başlığa “Hedef kanal ayrımı içermez” yaz. Farklı ayrıntı düzeyleri Hedef ve gerçekleşen dersinde.</p>
`, ex: [
  { t: 'mc', q: 'Sayfadaki “Tüm zamanların net satışı” kartı, yıl dilimleyicisinde seçim yapılınca değişiyor. Kart hiç etkilenmesin istiyorsun. Ne yaparsın?', o: ['Kartı rapor düzeyi filtreye eklerim', 'Dilimleyiciyi açılır menü yaparım', 'Etkileşimleri düzenle → kartta Hiçbiri', 'Kartı başka bir sayfaya taşıyıp eşitlerim'], a: 2, why: 'Etkileşimleri düzenle ile dilimleyicinin bu kartı süzmesi kapatılır. Rapor filtresi kartı yine süzer, dilimleyici stili davranışı değiştirmez; başka sayfaya taşıyıp eşitlemek ise kartın yine süzülmesine yol açar.' },
  { t: 'mc', q: 'Kanal dilimleyicisinde “Web” seçilince net satış değişiyor ama hedef 1.299.300 ₺ olarak sabit kalıyor. En olası açıklama nedir?', o: ['Hedef ölçüsü yanlış tabloyu topluyor', 'Hedeflerde kanal sütunu yok', 'Dilimleyici tek seçim moduna ayarlı', 'Rapor Service’te henüz yenilenmemiş'], a: 1, why: 'Filtre ilişkiler üzerinden akar; Hedefler tablosu Tarih ve Kategoriler’e bağlıdır, kanalla bir yolu yoktur. Bu yüzden kanal seçimi hedefi değiştirmez. Ölçü doğrudur, tek seçim ayarı ve yenileme bu davranışı açıklamaz.' },
  { t: 'mc', q: 'Sayfada beş dilimleyici var; okuyucu her tıkladığında tüm görseller yeniden hesaplanıyor ve sayfa yavaşlıyor. Hangi ayar yardımcı olur?', o: ['Dilimleyicilere Uygula düğmesi eklemek', 'Görsellerin gölgesini kapatmak', 'Dilimleyicileri döşeme stiline çevirmek', 'Filtre bölmesini okuyucuya gizlemek'], a: 0, why: 'Sorgu azaltma ayarlarıyla eklenen Uygula düğmesi, okuyucu seçimlerini bitirene kadar hesaplamayı bekletir. Gölge ve stil yalnızca görünüştür; filtre bölmesini gizlemek dilimleyicilerin yarattığı yükü azaltmaz.' }
] });

/* ───────────── veri-alma ───────────── */
ext('veri-alma', { min: 12, html: `
<h2>Dosya kaynakları: CSV, Excel, klasör</h2>
<p>İş hayatında ilk raporların çoğu bir veritabanından değil, birinin e-postayla gönderdiği bir dosyadan başlar. Üç dosya türünün kendine özgü tuzakları vardır.</p>
<h3>Metin/CSV</h3>
<p>Giriş → Veri al → <b>Metin/CSV</b>. Açılan önizlemede üç ayara bak:</p>
<ul>
<li><b>Dosya kökeni (kodlama):</b> Türkçe karakterler “Ã¼” gibi bozuk görünüyorsa 65001: Unicode (UTF-8) seç.</li>
<li><b>Sınırlayıcı:</b> Türkçe Excel'den kaydedilen CSV dosyaları çoğu zaman virgül değil noktalı virgül kullanır. Tüm veri tek sütunda geliyorsa sınırlayıcı yanlıştır.</li>
<li><b>Veri türü algılama:</b> Power BI türü ilk satırlara bakarak tahmin eder. Sonradan gelen farklı değerler hata olabilir; türleri Power Query'de kendin kontrol et.</li>
</ul>
<h3>Excel çalışma kitabı</h3>
<p>Gezgin penceresinde hem sayfalar hem de <b>Excel tabloları</b> görünür. Mümkünse tabloyu seç: tablo büyüyünce yeni satırlar kendiliğinden gelir ve başlık satırı nettir. Birleştirilmiş hücreler, üstteki başlık-logo satırları ve alt toplam satırları Power BI için gürültüdür; Power Query ile temizlenir (Power Query ile veri temizleme dersi).</p>
<h3>Klasör</h3>
<p>Her ay aynı yapıda bir dosya geliyorsa (“satis_2024_09.xlsx”, “satis_2024_10.xlsx”…) dosyaları tek tek eklemek yerine <b>Klasör</b> bağlayıcısını kullan. Birleştir ve Dönüştür dediğinde Power BI bir örnek dosyadaki adımları tüm dosyalara uygular. Yeni ayın dosyasını klasöre bırakman yeterli: bir sonraki yenilemede rapora girer. Dosyalar şirketin SharePoint'indeyse <b>SharePoint klasörü</b> bağlayıcısını seç; kaynak bulutta olduğu için Service’te yenilemek için ağ geçidine gerek kalmaz.</p>
<h2>Web kaynakları</h2>
<p><b>Web</b> bağlayıcısına bir adres verirsin. Adres bir HTML sayfasıysa Power BI sayfadaki tabloları listeler; bir CSV ya da JSON dosyasıysa onu doğrudan okur. Örnek: Merkez bankasının yayımladığı döviz kuru tablosu. İki uyarı: sayfanın düzeni değişirse sorgu bozulabilir ve bazı siteler otomatik okumaya izin vermez. Kalıcı bir iş için sitenin sunduğu resmi dosya ya da API adresini tercih et.</p>
<h2>Gizlilik düzeyleri: veri nereye gidebilir?</h2>
<p>Power Query bazen iki kaynağı birleştirirken birinin verisini diğerine sorgu içinde gönderir. Şirketin müşteri listesini, herkese açık bir web sitesine filtre olarak göndermesini istemezsin. Gizlilik düzeyi bunu yönetir.</p>
<div class="tbl-wrap"><table>
<tr><th>Düzey</th><th>Anlamı</th><th>Örnek kaynak</th></tr>
<tr><td>Özel (Private)</td><td>Hassas veri; başka hiçbir kaynağa gönderilmez.</td><td>Maaş dosyası, kişisel veriler</td></tr>
<tr><td>Kuruluş (Organizational)</td><td>Şirket içinde paylaşılabilir; genel kaynaklara gönderilmez.</td><td>Şirketin SQL sunucusu, SharePoint</td></tr>
<tr><td>Genel (Public)</td><td>Herkese açık veri.</td><td>Herkese açık döviz kuru sayfası</td></tr>
<tr><td>Yok (None)</td><td>Ayar yok; yalnızca kontrollü deneme için.</td><td>—</td></tr>
</table></div>
<p>Ayarlamak için: <b>Dosya → Seçenekler ve ayarlar → Veri kaynağı ayarları</b> → kaynağı seç → <b>İzinleri düzenle</b> → Gizlilik düzeyi. Yalnızca açık dosya için Giriş sekmesindeki Veri kaynağı ayarları da aynı pencereyi açar. Düzeyler uyumsuzsa Power Query birleştirmeyi durdurur ve bir “Formula.Firewall” hatası verir.</p>
<div class="warn"><b>“Yok say” kestirmesi</b>Seçenekler → Gizlilik bölümünde gizlilik düzeylerini yok sayma seçeneği vardır ve hatayı susturur. Ama hassas verinin dışarı gitmesine izin verebilir ve Service’te yayımlanan rapor bu ayara uymaz. Doğru yol, her kaynağa gerçek düzeyini vermektir.</div>
<p>Dosyanın yeri değiştiğinde (ör. masaüstünden ortak klasöre) aynı Veri kaynağı ayarları penceresindeki <b>Kaynağı değiştir</b> ile yeni yolu gösterirsin; sorgunun adımları korunur.</p>
`, ex: [
  { t: 'mc', q: 'Bölge ofisleri her ay aynı yapıda bir Excel dosyası gönderiyor ve bunlar bir klasörde birikiyor. Raporun her ay elle uğraşmadan güncellenmesi için ne yaparsın?', o: ['Her ay yeni dosyayı ayrı bir sorgu olarak eklerim', 'Klasör bağlayıcısıyla dosyaları birleştiririm', 'Dosyaları elle tek bir Excel’e kopyalarım', 'Her ayı ayrı bir .pbix dosyasında tutarım'], a: 1, why: 'Klasör bağlayıcısı klasördeki tüm dosyalara aynı adımları uygular; yeni dosya bir sonraki yenilemede kendiliğinden gelir. Ayrı sorgular ve ayrı dosyalar bakım yükü yaratır, elle kopyalama hataya açıktır.' },
  { t: 'mc', q: 'Bir CSV dosyasını aldın; “Şehir” sütun başlığı ve şehir adları “Ã…ehir” gibi bozuk karakterlerle görünüyor. Önizlemede neyi değiştirirsin?', o: ['Sınırlayıcıyı noktalı virgül yaparım', 'Veri türü algılamayı kapatırım', 'Dosya kökenini UTF-8 (65001) yaparım', 'Dosyayı Excel tablosu olarak alırım'], a: 2, why: 'Bozuk Türkçe karakter bir kodlama sorunudur; Dosya kökeni UTF-8 seçilince düzelir. Sınırlayıcı sütunların nasıl ayrılacağını, veri türü algılama sütun türlerini belirler; Excel’e dönüştürmek gereksiz ek iştir.' },
  { t: 'mc', q: 'Herkese açık bir web sayfasındaki döviz kurlarını şirket SQL sunucusundaki satışlarla birleştirirken Formula.Firewall hatası aldın. Doğru çözüm hangisi?', o: ['SQL’i Kuruluş, web’i Genel olarak ayarlarım', 'Gizlilik düzeylerini her seferinde yok sayarım', 'İki kaynağı da Yok düzeyine çekerim', 'Döviz kurlarını elle bir tabloya yazarım'], a: 0, why: 'Her kaynağa gerçek gizlilik düzeyini vermek Power Query’nin güvenli bir birleştirme planı yapmasını sağlar. Yok saymak ya da Yok düzeyi hassas verinin dışarı gitmesine izin verebilir; elle yazmak ise güncelliği kaybettirir.' }
] });

/* ───────────── model-temel ───────────── */
ext('model-temel', { min: 12, html: `
<h2>Kardinaliteyi veriyle oku</h2>
<p>Kardinalite, bir ilişkinin iki ucunda kaç satırın eşleştiğini söyler. Ezberlemek yerine veriye bakarak bulabilirsin. Urunler ile Satislar ilişkisini ele alalım:</p>
<div class="tbl-wrap"><table>
<tr><th>Soru</th><th>Urunler[UrunNo]</th><th>Satislar[UrunNo]</th></tr>
<tr><td>Kaç satır?</td><td>40</td><td>1.620</td></tr>
<tr><td>Kaç farklı değer?</td><td>40 (her ürün bir kez)</td><td>38 (ürünler tekrar ediyor)</td></tr>
<tr><td>Sonuç</td><td>“Bir” tarafı</td><td>“Çok” tarafı</td></tr>
</table></div>
<p>Satır sayısı ile farklı değer sayısı eşitse o sütun benzersizdir ve ilişkinin <b>bir</b> tarafı olabilir. Satislar'da 38 farklı ürün var; demek ki katalogdaki iki ürün hiç satılmamış. Bu bir hata değil, bir bilgidir. Model görünümünde ilişki çizgisinin ucunda <b>1</b> ve <b>*</b> işaretleri bu durumu gösterir.</p>
<p>Kontrol etmenin kolay yolu: Tablo görünümünde sütunu seç; Power Query'de ise Görünüm → Sütun profili ile “farklı” ve “benzersiz” sayılarını gör. Boyut tablosunda farklı sayısı satır sayısından azsa yinelenen anahtar vardır ve önce onu temizlemen gerekir.</p>
<h2>Filtre yönünü bir örnekle izle</h2>
<p>İlişkiler tek yönlüyken filtre <b>bir</b> tarafından <b>çok</b> tarafına akar. Bunu iki basit ölçüyle görebilirsin:</p>
<pre class="dax">Katalog Ürün Sayısı = COUNTROWS(Urunler)
Satılmış Ürün Sayısı = DISTINCTCOUNT(Satislar[UrunNo])</pre>
<div class="tbl-wrap"><table>
<tr><th>Kırılım</th><th>Katalog Ürün Sayısı</th><th>Satılmış Ürün Sayısı</th><th>Neden?</th></tr>
<tr><td>Kategori: Elektronik</td><td>8</td><td>8</td><td>Kategoriler → Urunler → Satislar yolu var; ikisi de süzülür.</td></tr>
<tr><td>Kategori: Hediye</td><td>2</td><td>1</td><td>İki hediye ürününden biri hiç satılmamış.</td></tr>
<tr><td>Yıl: 2022, 2023, 2024</td><td>40, 40, 40</td><td>36, 38, 38</td><td>Tarih yalnızca Satislar'ı süzer; Urunler'e geri akmaz.</td></tr>
<tr><td>Segment: Premium</td><td>40</td><td>38</td><td>Musteriler → Satislar akar, Satislar → Urunler akmaz.</td></tr>
</table></div>
<p>“Premium müşterilerin aldığı ürün sayısı” isteniyorsa yanlış yol ilişkiyi çift yönlü yapmaktır. Doğru yol, sayımı olgu tablosu üzerinden yapmaktır: <code>DISTINCTCOUNT(Satislar[UrunNo])</code>. Olgu tablosu her boyuttan filtre alır; sayımı orada yaparsan çift yönlü ilişkiye ihtiyaç kalmaz.</p>
<h2>İlişkiyi adım adım kurmak</h2>
<ol>
<li>Model görünümünde <b>bir</b> tarafındaki sütunu (Urunler[UrunNo]) <b>çok</b> tarafındaki sütunun (Satislar[UrunNo]) üzerine sürükle.</li>
<li>Açılan pencerede kardinaliteyi (Bire çok), çapraz filtre yönünü (Tek) ve “Bu ilişkiyi etkin yap” kutusunu kontrol et.</li>
<li>İki sütunun veri türü aynı olmalı. Biri metin “27”, diğeri tam sayı 27 ise ilişki kurulmaz ya da eşleşme olmaz; türü Power Query'de eşitle.</li>
<li>Kurduktan sonra bir tablo görselinde Kategoriler[Kategori] ile [Net Satış]'ı yan yana koy; boş (BLANK) bir kategori satırı görürsen olgu tablosunda boyutta karşılığı olmayan anahtarlar var demektir.</li>
</ol>
<div class="tip"><b>Model sağlık kontrolü</b>Her boyut anahtarı benzersiz mi? Her ilişki bire-çok ve tek yönlü mü? Boş boyut satırı var mı? Bu üç soruya “evet, evet, hayır” diyorsan temel model sağlamdır. İleri konular Model tasarımı II dersinde.</div>
`, ex: [
  { t: 'dax', name: 'Katalogdaki Kategori Adedi', q: '<b>Katalogdaki Kategori Adedi</b>: Kategoriler tablosundaki satır sayısını döndür. Sonra kategori ve yıl kırılımına bak: yıl sütununda neden hep aynı sayı (7) çıkıyor?', sol: 'COUNTROWS(Kategoriler)', hint: 'COUNTROWS bir tablonun satırlarını sayar. Tarih filtresi Kategoriler’e akmaz; ilişkiler bir tarafından çok tarafına doğru filtreler.' },
  { t: 'dax', name: 'Alışveriş Yapan Farklı Müşteri', q: '<b>Alışveriş Yapan Farklı Müşteri</b>: Sayımı olgu tablosu üzerinden yap: Satislar’daki farklı MusteriNo sayısı. Böylece kategori ve yıl filtresi sonuca yansır.', sol: 'DISTINCTCOUNT(Satislar[MusteriNo])', hint: 'Musteriler tablosunu değil, Satislar[MusteriNo] sütununu say.' },
  { t: 'mc', q: 'Satislar[UrunNo] metin, Urunler[UrunNo] tam sayı türünde. İlişkiyi kurdun ama hiçbir satır eşleşmiyor. Ne yaparsın?', o: ['İlişkiyi çift yönlü yaparım', 'İki sütunun veri türünü eşitlerim', 'İlişkiyi çoka çok olarak işaretlerim', 'Urunler tablosunu Satislar’a eklerim'], a: 1, why: 'Anahtar sütunların veri türü aynı olmalıdır; tür eşitlenince değerler eşleşir. Filtre yönü ya da kardinalite tür uyumsuzluğunu çözmez; tabloları birleştirmek ise yıldız şemayı bozar.' },
  { t: 'mc', q: 'Segment dilimleyicisinde “Premium” seçince “ürün sayısı” kartı hep 40 gösteriyor. Kartta COUNTROWS(Urunler) var. Premium müşterilerin aldığı ürünleri saymak için en iyi düzeltme hangisi?', o: ['Urunler–Satislar ilişkisini çift yönlü yapmak', 'Musteriler ile Urunler arasında ilişki kurmak', 'Kartı rapor düzeyi filtreye bağlamak', 'Sayımı DISTINCTCOUNT(Satislar[UrunNo]) yapmak'], a: 3, why: 'Filtre Musteriler’den Satislar’a akar ama Urunler’e geri akmaz. Sayımı olgu tablosunda yapmak sonucu doğru verir (Premium’da 38). Çift yönlü ilişki belirsizlik ve performans riski getirir, doğrudan Musteriler–Urunler ilişkisi modeli bozar, rapor filtresi sorunu çözmez.' }
] });

/* ───────────── tarih-tablosu ───────────── */
ext('tarih-tablosu', { min: 12, html: `
<h2>CALENDAR mı, CALENDARAUTO mu?</h2>
<p>İki fonksiyon da tek sütunlu (Date) bir gün listesi üretir. Farkları, aralığın nereden geldiğidir.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>CALENDAR(başlangıç, bitiş)</th><th>CALENDARAUTO([mali yıl sonu ayı])</th></tr>
<tr><td>Aralık</td><td>Senin verdiğin iki tarih</td><td>Modeldeki tüm tarih sütunlarının en küçüğünden en büyüğüne, tam yıllara genişletilmiş</td></tr>
<tr><td>Kontrol</td><td>Tam sende</td><td>Modele eklenen her tarih sütunu aralığı değiştirebilir</td></tr>
<tr><td>Ne zaman?</td><td>Çoğu üretim modelinde</td><td>Hızlı deneme; ya da tüm tarih sütunlarının temiz olduğundan eminsen</td></tr>
</table></div>
<p>Bu modelde bir deneme yapalım. Satışlar 22 Haziran 2022 ile 31 Aralık 2024 arasında. Ama <code>CALENDARAUTO()</code> çalıştırınca tablo <b>1 Ocak 2015</b>'te başlar, <b>31 Aralık 2025</b>'te biter: 4.018 gün. Neden? Calisanlar[IseGiris] sütununda 2015'te işe girmiş bir çalışan, Projeler[BitisPlan] sütununda 2025'te bitmesi planlanan bir proje var. CALENDARAUTO bunları da hesaba katar. Rapordaki yıl dilimleyicisinde satış olmayan sekiz yıl görünür.</p>
<p>Daha güvenli yol, aralığı satış verisinden almak ve tam yıla yuvarlamaktır:</p>
<pre class="dax">EVALUATE
CALENDAR(
    DATE(YEAR(MIN(Satislar[Tarih])), 1, 1),
    DATE(YEAR(MAX(Satislar[Tarih])), 12, 31)
)</pre>
<p>Sonuç 1.096 gündür: 2022'nin başından 2024'ün sonuna. Bu uygulamadaki Tarih tablosu da tam olarak bu aralıktadır. Mali yılın Haziran'da bittiği bir şirkette CALENDARAUTO(6) yazılırsa aralık Temmuz–Haziran yıllarına genişletilir.</p>
<h2>Sıralama sütunlarıyla tam bir tablo</h2>
<p>Metin olan her takvim sütununun yanında onu doğru sıraya koyacak bir sayı sütunu olmalı:</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    CALENDAR(DATE(2024, 1, 1), DATE(2024, 12, 31)),
    "Yil", YEAR([Date]),
    "AyNo", MONTH([Date]),
    "Ay", FORMAT([Date], "MMM"),
    "YilAy", FORMAT([Date], "yyyy-MM"),
    "GunNo", WEEKDAY([Date], 2),
    "HaftaninGunu", FORMAT([Date], "dddd")
)</pre>
<div class="tbl-wrap"><table>
<tr><th>Metin sütunu</th><th>Sırala ölçütü</th><th>Yapılmazsa</th></tr>
<tr><td>Ay (Oca, Şub…)</td><td>AyNo</td><td>Ağu, Ara, Eki… alfabetik</td></tr>
<tr><td>HaftaninGunu (Pazartesi…)</td><td>GunNo (Pazartesi = 1)</td><td>Cuma, Cumartesi, Pazar… alfabetik</td></tr>
<tr><td>YilAy (2024-01)</td><td>Gerekmez</td><td>Yıl-ay biçimi kendiliğinden doğru sıralanır</td></tr>
</table></div>
<p>Ayarlamak için sütunu seç → Sütun araçları → <b>Sütuna göre sırala</b> → sayı sütunu. WEEKDAY'in ikinci bağımsız değişkeni 2 olunca hafta Pazartesi başlar; Türkiye'deki alışkanlığa uygundur.</p>
<h2>İşaretlemeden önce kontrol listesi</h2>
<p>Tabloya sağ tık → <b>Tarih tablosu olarak işaretle</b> (ya da tabloyu seçip Tablo araçları şeridindeki aynı komut). Power BI tarih sütununu şu kurallara göre denetler:</p>
<ul>
<li>Değerler benzersiz: her gün bir kez.</li>
<li>Boş değer yok.</li>
<li>Kesintisiz: başlangıçtan bitişe tek gün eksik değil.</li>
<li>Sütun türü Tarih ya da Tarih/Saat; Tarih/Saat ise tüm değerlerde saat aynı.</li>
</ul>
<p>Bu yüzden tarih tablosunu satış tablosundan (ör. VALUES(Satislar[Tarih])) üretmek yanlıştır: bu modelde satış olan gün sayısı 2022'de yalnızca 54, 2023'te 202, 2024'te 277'dir. Takvimde ise 365, 365 ve 366 gün olmalı. Eksik günler zaman zekâsı hesaplarını bozar. Zaman zekâsı fonksiyonları Zaman zekâsı dersinde.</p>
`, ex: [
  { t: 'query', q: 'Satış verisinin ilk yılının 1 Ocak’ından son yılının 31 Aralık’ına kadar her günü içeren bir takvim döndür. Tarihleri elle yazma; MIN ve MAX ile Satislar[Tarih] sütunundan al.', start: 'EVALUATE\n', sol: 'EVALUATE\nCALENDAR(DATE(YEAR(MIN(Satislar[Tarih])), 1, 1), DATE(YEAR(MAX(Satislar[Tarih])), 12, 31))', hint: 'CALENDAR(DATE(YEAR(MIN(...)), 1, 1), DATE(YEAR(MAX(...)), 12, 31)) kalıbını kur. Sonuç 1.096 satır olmalı.' },
  { t: 'query', q: '2024’ün ilk çeyreği (1 Ocak – 31 Mart) için bir takvim döndür ve her güne AyNo (ay numarası) ile Ay (kısa ay adı) sütunlarını ekle.', start: 'EVALUATE\n', sol: 'EVALUATE\nADDCOLUMNS(CALENDAR(DATE(2024, 1, 1), DATE(2024, 3, 31)), "AyNo", MONTH([Date]), "Ay", FORMAT([Date], "MMM"))', hint: 'ADDCOLUMNS(CALENDAR(...), "AyNo", MONTH([Date]), "Ay", FORMAT([Date], "MMM"))' },
  { t: 'dax', name: 'Satış Yapılan Gün Sayısı', q: '<b>Satış Yapılan Gün Sayısı</b>: En az bir satış satırı olan farklı gün sayısını hesapla. Yıl kırılımında bunu takvimdeki gün sayısıyla karşılaştır.', sol: 'DISTINCTCOUNT(Satislar[Tarih])', hint: 'Satislar[Tarih] sütunundaki farklı değerleri say.' },
  { t: 'mc', q: 'Modelde CALENDARAUTO() ile tarih tablosu kurdun. Satışlar 2022’de başlıyor ama yıl dilimleyicisinde 2015’ten 2025’e kadar yıllar görünüyor. En olası neden nedir?', o: ['CALENDARAUTO yalnızca bugünün tarihine bakar', 'Tarih tablosu işaretlenmemiştir', 'Diğer tarih sütunları aralığı genişletir', 'Dilimleyici yanlış sütuna bağlıdır'], a: 2, why: 'CALENDARAUTO modeldeki tüm tarih sütunlarına bakar; burada işe giriş (2015) ve planlanan proje bitişi (2025) tarihleri aralığı genişletir. Bugünün tarihine bakmaz; işaretleme aralığı değiştirmez; dilimleyici doğru sütundadır.' }
] });

})(window);
