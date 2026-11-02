/* Kesit Power BI — Orta seviye genişletme (2): görselleştirme ilkeleri, etkileşim, koşullu biçim, tema, hikâye, mobil ve erişilebilirlik, istatistik, analiz özellikleri, Power Query orta ve modele hazırlık */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, o) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('ext: ders yok', id); return; } if (o.html) l.body += '<section class="deep"><span class="eyebrow">Uzmanlaş</span>' + o.html + '</section>'; if (o.ex) l.ex = (l.ex || []).concat(o.ex); if (o.min) l.min += o.min; (W.PBI_EXT = W.PBI_EXT || []).push({ id, html: o.html || '', ex: o.ex || [] }); };

/* Power Query alıştırmaları için adım yardımcıları (pqdata.js ile aynı biçim) */
const S = (op, cols, extra) => Object.assign({ op, cols: cols || [] }, extra || {});
const BAYI_A = [S('removeTop', [], { n: 1 }), S('promote'), S('removeCols', ['Not'])];
const BAYI_B = [S('trim', ['Şehir']), S('proper', ['Şehir']), S('replace', ['Tutar'], { find: '-', repl: 'null', whole: true }), S('type', ['Tutar'], { to: 'number' })];
const BAYI_C = [S('removeBlank'), S('distinct'), S('type', ['Tarih'], { to: 'date' }), S('removeErrors', ['Tarih'])];
const HEDEF_A = [S('unpivot', ['Kategori']), S('rename', ['Öznitelik'], { to: 'Ay' }), S('rename', ['Değer'], { to: 'Hedef' })];
const MUS_A = [S('promote'), S('type', ['MusteriNo'], { to: 'int' }), S('lower', ['E-posta']), S('proper', ['Ad Soyad']), S('distinct', ['MusteriNo'])];

/* ------------------------------------------------------------------ */
ext('gorsel-ilkeler', { min: 14, html: `
<h2>Eksen sıfırdan başlamalı mı? Karar kuralı</h2>
<p>“Eksen her zaman sıfırdan başlar” kuralı yarım bir kuraldır. Doğrusu şu: <b>uzunlukla değer anlatan</b> grafiklerde eksen sıfırdan başlar; <b>konumla değişim anlatan</b> grafiklerde başlamak zorunda değildir.</p>
<div class="tbl-wrap"><table><tr><th>Grafik</th><th>Göz neyi okur?</th><th>Eksen</th></tr>
<tr><td>Sütun / çubuk</td><td>Çubuğun boyu</td><td>Sıfırdan başlamalı. Kesik eksen boyu yalan söyletir.</td></tr>
<tr><td>Alan grafiği</td><td>Dolgunun alanı</td><td>Sıfırdan başlamalı.</td></tr>
<tr><td>Çizgi</td><td>Eğim ve yön</td><td>Veriye yakın başlayabilir; küçük oynamaları görmek için uygundur.</td></tr>
<tr><td>Dağılım</td><td>Noktanın konumu</td><td>Veriye yakın başlar; sıfır çoğu zaman boşluk yaratır.</td></tr></table></div>
<p>Somut örnek: Anadolu Market’te Giyim’in toplam net satışı yaklaşık 190.169 TL, Spor’un 184.231 TL. Fark yalnızca %3 civarında. Bir sütun grafiğinde y eksenini 180.000’den başlatırsan Giyim çubuğu yaklaşık 10.169, Spor çubuğu 4.231 birim boyunda çizilir. Okuyucu “Giyim, Spor’un iki katından fazla” diye okur. Aynı veriyi çizgi grafikte aylık eğilim olarak gösterirken eksenin 180.000’den başlaması ise sorun değildir; çünkü orada kimse çizginin boyunu ölçmez.</p>
<div class="tip"><b>Power BI’da nerede?</b>Görseli seç → Biçim → Y ekseni → Aralık → Minimum. Varsayılan “Otomatik” değeri çubuk grafikte sıfırdan başlar ama elle yazılmış bir minimum, rapor yıllarca kopyalanırken fark edilmeden kalabilir. Gözden geçirmede her çubuk grafiğin minimumuna bak.</div>

<h2>Yanıltıcı grafik kataloğu</h2>
<p>Aşağıdaki hataların çoğu kötü niyetle değil, “daha etkileyici görünsün” isteğiyle yapılır. Gözden geçirmede bu listeyi tek tek tara:</p>
<ul>
<li><b>Kesik eksenli çubuk:</b> Yukarıdaki örnek. Çözüm: sıfırdan başlat ya da farkı ayrı bir “fark” ölçüsüyle göster.</li>
<li><b>Çift eksen oyunu:</b> Net satış sol eksende, kâr marjı sağ eksende. İki eksenin ölçeği elle seçildiği için çizgiler istenen yerde kesişir ve sahte bir ilişki görünür. Görsel algı dersindeki kombo grafik kurallarına uy; emin değilsen iki ayrı küçük grafik kullan.</li>
<li><b>Eksik dönemle karşılaştırma:</b> İçinde bulunulan ayın yarısı geçmişken ayı tam aylarla aynı çizgide göstermek, son noktada sahte bir düşüş yaratır. Son noktayı farklı renkle işaretle ya da tamamlanmamış ayı filtrele.</li>
<li><b>Kümülatif ile dönemsel karışıklığı:</b> Kümülatif satış çizgisi hiç düşmez. Kötü geçen bir ay, eğimdeki küçük bir yassılmadan ibaret kalır. Başlıkta “kümülatif” sözcüğü mutlaka geçsin.</li>
<li><b>3B ve pasta:</b> Perspektif öndeki dilimi büyük gösterir. Yedi kategoriyi pastada okumak zordur; sıralı yatay çubuk her zaman daha dürüsttür.</li>
<li><b>Renk ölçeğinin her filtrede yeniden kurulması:</b> Isı haritasında “koyu” bir sayfada yüksek, öbür sayfada orta anlamına gelir. Koşullu biçim dersinde sabit eşik yöntemini gördün.</li>
<li><b>Oran yerine mutlak sayı:</b> Mobil kanal satışı (yaklaşık 599.841 TL) Mağaza’dan (yaklaşık 193.600 TL) büyük diye “Mobil daha başarılı” denemez; sipariş, müşteri ya da ziyaretçi başına bakmadan karar verilmez.</li>
</ul>

<h2>Veri-mürekkep oranını adım adım artırmak</h2>
<p>Varsayılan bir sütun grafiği alıp beş adımda sadeleştir. Her adımdan sonra “bu kaldırdığım şey okuyucunun bir sorusuna cevap veriyor muydu?” diye sor:</p>
<ol>
<li>Kenarlık, gölge ve arka plan rengini kapat (Biçim → Genel → Efektler).</li>
<li>Y ekseni ve yatay ızgara çizgilerini kapat, onun yerine veri etiketlerini aç. Yedi çubuk için yedi etiket, eksenden daha hızlı okunur.</li>
<li>Etiketleri kısalt: “339.303,65” yerine “339 B” (Görüntüleme birimleri: Bin). Ondalık hane okuyucuya bilgi değil, gürültü verir.</li>
<li>Gösterge (legend) tek seri için gereksizdir; kapat. Bilgiyi başlığa taşı.</li>
<li>Başlığı bulguya çevir: “Kategoriye göre net satış” yerine “Elektronik satışın yaklaşık %27’sini taşıyor”.</li>
</ol>
<div class="warn"><b>Aşırıya kaçma</b>Sadeleştirme bağlamı yok etmemeli. Hedef çizgisi, geçen yıl karşılaştırması ya da birim (TL, adet) “mürekkep” değil, anlamdır. Kural: veriyi ya da karşılaştırmayı taşıyan öğe kalır, süs olan gider.</div>

<h2>Renk bütçesi</h2>
<p>Bir sayfada kaç renk kullandığını say. İyi bir rapor sayfasında genellikle şunlar yeterlidir: bir nötr gri (bağlam), bir vurgu rengi (odak), ve gerekiyorsa durum renkleri (iyi/kötü). Kanal gibi kategorik bir boyut varsa onun 3 rengi eklenir. Bu sayının 6–7’yi geçmesi, okuyucunun göstergeye bakmak zorunda kalması demektir. Vurguyu ölçüyle yapmak, “hangi çubuk renkli olsun?” kararını rapor yazarının elinden alıp veriye bırakır: en yüksek satışlı kategori kendiliğinden renklenir.</p>
<pre class="dax">En İyi Kategori Rengi =
VAR Bu = [Net Satış]
VAR EnYuksek = MAXX(ALLSELECTED(Kategoriler[Kategori]), [Net Satış])
RETURN IF(Bu = EnYuksek, "#2A78D6", "#B8B5AD")</pre>
<p>Bu ölçüyü sütun grafiğinin Biçim → Sütunlar → Renk → fx → Biçim stili: Alan değeri ile bağlarsın. Kullanıcı bir yıl seçtiğinde lider kategori değişirse vurgu da değişir.</p>
`, ex: [
  { t: 'mc', q: 'Pazarlama müdürü aylık net satış <b>çizgi</b> grafiğinde y ekseninin 0’dan değil 20.000’den başladığını görüp “bu yanıltıcı” diyor. Ne cevap verirsin?', o: ['Haklı; tüm grafiklerde eksen sıfırdan başlamalı', 'Çizgide kabul edilir; göz eğimi okur', 'Ekseni gizlersek sorun ortadan kalkar', 'Çizgiyi alan grafiğine çevirmek gerekir'], a: 1, why: 'Çizgi grafikte göz uzunluğu değil yönü ve eğimi okur; eksenin veriye yakın başlaması değişimi görünür kılar. Sıfır kuralı uzunluk ya da alan anlatan çubuk ve alan grafikleri içindir. Ekseni gizlemek sorunu gizler; alan grafiğine geçmek ise sıfır zorunluluğunu geri getirir.' },
  { t: 'mc', q: 'Bir yönetici sayfasında bu ayın satışı (ayın 12’si) önceki tam aylarla aynı çizgide gösteriliyor ve son noktada sert bir düşüş var. En doğru düzeltme?', o: ['Çizgiyi kümülatif satışa çevirmek', 'Y eksenini logaritmik yapmak', 'Eksik ayı işaretlemek', 'Grafiği sütun grafiğe çevirmek'], a: 2, why: 'Düşüş gerçek değil; ay tamamlanmadığı için toplam küçük. Tamamlanmamış dönemi filtrelemek ya da farklı renk/etiketle işaretlemek sorunu çözer. Kümülatife geçmek düşüşü gizler ama soruyu değiştirir; logaritmik eksen ve sütun grafik eksik dönem sorununu çözmez.' },
  { t: 'mc', q: 'Bir sütun grafiğinde y ekseni kapatılıp veri etiketleri açılıyor, ızgara çizgileri kaldırılıyor. Ekip arkadaşın “hedef çizgisini de kaldıralım, daha sade olur” diyor. Doğru tutum?', o: ['Kaldır; sadelik her zaman bağlamdan önce gelir', 'Kaldır ama hedefi başlığa yaz', 'Hedef çizgisini kalın ve kırmızı yaparak öne çıkar', 'Kalsın; karşılaştırmayı taşıyan öğe süs değil'], a: 3, why: 'Veri-mürekkep oranı süsü atar, anlamı değil. Hedef çizgisi her çubuğun neye göre iyi ya da kötü olduğunu söyler; kaldırılırsa okuyucu karşılaştırmayı kafasında yapmak zorunda kalır. Başlığa yazmak tek bir sayıyı verir, çubuk çubuk karşılaştırmayı vermez. Kalın kırmızı çizgi ise veriyle yarışır.' },
  { t: 'dax', name: 'En İyi Kategori Rengi', q: '<b>En İyi Kategori Rengi</b>: Sütun grafiğinde yalnızca en yüksek net satışlı kategori mavi (<code>"#2A78D6"</code>), diğerleri gri (<code>"#B8B5AD"</code>) olsun. Karşılaştırmayı görünen kategoriler (<code>ALLSELECTED(Kategoriler[Kategori])</code>) içinde yap.', sol: 'VAR Bu = [Net Satış] VAR EnYuksek = MAXX(ALLSELECTED(Kategoriler[Kategori]), [Net Satış]) RETURN IF(Bu = EnYuksek, "#2A78D6", "#B8B5AD")', hint: 'Önce satırın değerini VAR ile sakla, sonra MAXX ile görünen kategoriler arasındaki en büyük değeri bul ve IF ile karşılaştır.' }
] });

/* ------------------------------------------------------------------ */
ext('etkilesim', { min: 14, html: `
<h2>Filtrele mi, vurgula mı? Okuyucu ne görür?</h2>
<p>Satış müdürü Kanal çubuğunda “Mobil”e tıklıyor. Yanındaki Kategori sütun grafiği iki farklı şekilde tepki verebilir:</p>
<div class="tbl-wrap"><table><tr><th>Davranış</th><th>Kategori grafiğinde ne olur?</th><th>Ne zaman iyi?</th></tr>
<tr><td>Vurgula (Highlight)</td><td>Her çubuğun tam boyu soluk kalır; Mobil’in payı koyu renkle çubuğun içinde çizilir.</td><td>Parçanın bütüne oranı görülmek istenirken: “Elektronik’in ne kadarı Mobil’den?”</td></tr>
<tr><td>Filtrele (Filter)</td><td>Çubuklar yalnızca Mobil satışıyla yeniden çizilir; eksen yeniden ölçeklenir, sıralama değişebilir.</td><td>Seçimin kendi dünyasına bakılırken: “Mobil’de hangi kategori lider?”</td></tr>
<tr><td>Yok (None)</td><td>Hiçbir şey değişmez.</td><td>Genel toplamı gösteren KPI kartları, karşılaştırma için sabit kalması gereken referans grafikler.</td></tr></table></div>
<p>Learn’e göre çizgi, dağılım ve harita görselleri vurgulanamaz; bu yüzden onlar her zaman filtrelenir. Kartlar da vurgulanamaz, seçim onlara filtre olarak ulaşır. Ayar <b>Biçim → Etkileşimleri düzenle</b> (Edit interactions) ile açılır: kaynak görseli seç, diğer görsellerin köşesinde beliren filtre, vurgu ve “yok” simgelerinden birine tıkla. Ayar <b>kaynak → hedef</b> yönündedir; A’nın B’ye etkisi, B’nin A’ya etkisinden bağımsızdır.</p>
<div class="tip"><b>Varsayılanı değiştirmek</b>Vurgulama yerine her yerde filtreleme istiyorsan tek tek ayarlamak zorunda değilsin: Dosya → Seçenekler ve ayarlar → Seçenekler → Geçerli dosya → Rapor ayarları altında varsayılan etkileşimi çapraz vurgulamadan çapraz filtrelemeye çeviren bir seçenek bulunur. Yalnızca o dosyayı etkiler.</div>

<h2>Detaya inme ile detaya git farkı</h2>
<p>İki özellik adları benzediği için sürekli karıştırılır. Tek cümleyle: <b>detaya inme aynı görselin içinde hiyerarşide aşağı iner, detaya git başka bir sayfaya gider.</b></p>
<div class="tbl-wrap"><table><tr><th></th><th>Detaya inme (Drill down)</th><th>Detaya git (Drill through)</th></tr>
<tr><td>Nerede olur?</td><td>Aynı görselde</td><td>Hedef sayfada</td></tr>
<tr><td>Kurulum</td><td>Eksene birden çok alan (Yıl → Çeyrek → Ay)</td><td>Hedef sayfanın Detaylandırma kutusuna alan</td></tr>
<tr><td>Diğer görselleri etkiler mi?</td><td>Varsayılan olarak hayır</td><td>Hedef sayfadaki tüm görseller süzülür</td></tr>
<tr><td>Geri dönüş</td><td>Görselin üstündeki yukarı ok</td><td>Otomatik eklenen Geri düğmesi</td></tr></table></div>
<p>Detaya inmenin sayfadaki diğer görselleri de süzmesini istiyorsan: görseli seç → Biçim şeridi → <b>Detaya inme filtrelerini uygula</b> (Apply drill down filters to) → <b>Tüm sayfa</b>. Böylece kullanıcı 2024 → 2. çeyreğe indiğinde yanındaki kartlar da o çeyreği gösterir.</p>

<h2>Dilimleyici eşitlemenin ileri hâli: eşitleme grupları</h2>
<p>Hikâye anlatımı dersinde aynı dilimleyiciyi sayfalar arasında eşitlemeyi gördün. Bazen eşitlenmesi gereken şey <b>iki ayrı dilimleyicidir</b>: örneğin Özet sayfasında açılır liste biçiminde, Detay sayfasında döşeme biçiminde bir Kategori dilimleyicisi. Dilimleyicileri eşitle bölmesinde <b>Gelişmiş seçenekler</b>’i aç ve iki dilimleyiciye birebir aynı grup adını yaz. İki seçenek var:</p>
<ul>
<li><b>Filtre değişikliklerini diğer dilimleyicilerle eşitle:</b> Birinde yapılan seçim ötekine taşınır.</li>
<li><b>Alan değişikliklerini diğer dilimleyicilerle eşitle:</b> Birinin alanını değiştirirsen öteki de değişir.</li>
</ul>
<div class="warn"><b>Eşitleme ile performans</b>Beş sayfaya eşitlenmiş bir dilimleyicide her tıklama, açık sayfanın tüm görsellerini yeniden sorgular. Kullanıcı çok sayıda dilimleyiciyi art arda değiştiriyorsa <b>Tüm dilimleyicileri uygula</b> (Apply all slicers) eylemli bir düğme koy: seçimler önce toplanır, sorgular tek seferde gider. Desktop’ta düğmeyi denemek için Ctrl tuşuna basılı tutarak tıkla.</div>

<h2>Düğme eylemleri: hangi iş için hangisi?</h2>
<div class="tbl-wrap"><table><tr><th>Eylem</th><th>Tipik kullanım</th></tr>
<tr><td>Sayfa gezintisi</td><td>Menü şeridi; yer imi gerektirmez</td></tr>
<tr><td>Yer imi</td><td>Grafik/Tablo geçişi, hazır filtre senaryoları</td></tr>
<tr><td>Detaya git</td><td>Seçili ürünün ayrıntı sayfasına götüren düğme; seçim yokken devre dışı görünür</td></tr>
<tr><td>Tüm dilimleyicileri uygula / temizle</td><td>Çok dilimleyicili filtre panelleri</td></tr>
<tr><td>Geri</td><td>Detay sayfasından dönüş</td></tr>
<tr><td>Web URL’si</td><td>Kaynak sisteme, belge sayfasına bağlantı</td></tr></table></div>
<p>Düğme eylem listesinde Soru-Cevap da görünür; ancak bu özellik Aralık 2026’da kaldırılacağı için yeni raporlarda kullanma. Kullanıcının hangi seçimle baktığını görünür kılmak, etkileşimli raporun en çok unutulan parçasıdır: bir metin kartı seçimi yazsın.</p>
<pre class="dax">Seçim Özeti Metni =
IF(
    ISFILTERED(Kategoriler[Kategori]),
    "Kategori: " &amp; CONCATENATEX(VALUES(Kategoriler[Kategori]), Kategoriler[Kategori], ", "),
    "Tüm kategoriler"
)</pre>
`, ex: [
  { t: 'mc', q: 'Kategori grafiğinde “Kitap”a tıklandığında yanındaki Kanal çubuk grafiği, çubukların tam boyunu soluk bırakıp Kitap payını koyu gösteriyor. Müdür ise Kitap’ta hangi kanalın lider olduğunu, eksen yeniden ölçeklenmiş hâlde görmek istiyor. Ne yaparsın?', o: ['Kanal grafiğini çizgi grafiğe çevir', 'Etkileşimi Filtrele yap', 'Kanal grafiğine Kategori dilimleyicisi ekle', 'Kanal grafiğinde detaya inmeyi aç'], a: 1, why: 'Gördüğü davranış çapraz vurgulamadır. Filtreleme seçilen kategoriyle çubukları yeniden çizer ve ekseni yeniden ölçekler. Çizgiye çevirmek soruyu değiştirir; ek dilimleyici aynı işi kullanıcıya yaptırır; detaya inme hiyerarşi içindir.' },
  { t: 'mc', q: 'Yıl → Çeyrek → Ay hiyerarşili sütun grafiğinde kullanıcı 2024’ün 2. çeyreğine indiğinde yan taraftaki kartların da o çeyreği göstermesi isteniyor. Hangisi?', o: ['Detaya inme filtrelerini Tüm sayfa’ya uygula', 'Kartları ayrı bir detay sayfasına taşıyıp bağla', 'Kartlarda etkileşimi Vurgula yap', 'Tarih dilimleyicisini tüm sayfalarla eşitle'], a: 0, why: 'Detaya inme varsayılan olarak diğer görselleri etkilemez; Biçim şeridindeki “Detaya inme filtrelerini uygula: Tüm sayfa” bunu açar. Detay sayfası başka bir sayfaya gider; kartlar vurgulanamaz; dilimleyici eşitleme detaya inme durumunu taşımaz.' },
  { t: 'mc', q: 'Özet sayfasında açılır liste, Detay sayfasında döşeme biçiminde iki ayrı Kategori dilimleyicisi var. Birinde yapılan seçimin ötekine geçmesi gerekiyor. En temiz yol?', o: ['İki sayfayı tek sayfada birleştirmek', 'Her iki sayfaya aynı yer imini koymak', 'Kategoriyi rapor düzeyi filtreye taşıyıp kilitlemek', 'İkisine aynı eşitleme grubu adını vermek'], a: 3, why: 'Eşitleme grupları ayrı dilimleyicileri aynı grup adıyla bağlar ve “filtre değişikliklerini eşitle” seçimi taşır; biçimleri farklı kalabilir. Yer imi seçimi anlık kaydeder, canlı eşitlemez. Rapor düzeyi filtre kullanıcıya dilimleyici deneyimi vermez.' },
  { t: 'mc', q: 'Filtre panelinde 6 dilimleyici var. Kullanıcı her seçimde tüm sayfanın yeniden yüklenmesinden şikâyet ediyor. Hangi düğme eylemi işe yarar?', o: ['Tüm dilimleyicileri uygula', 'Sayfa gezintisi düğmesi', 'Yer imi gezgini ile sekmeler', 'Detaya git düğmesi'], a: 0, why: '“Tüm dilimleyicileri uygula” seçimlerin önce toplanmasını, sorguların tek seferde gönderilmesini sağlar. Diğer eylemler gezinme içindir ve sorgu sayısını azaltmaz.' },
  { t: 'dax', name: 'Seçim Özeti Metni', q: '<b>Seçim Özeti Metni</b>: Kategori süzülüyse <code>"Kategori: "</code> ve ardından seçili kategorilerin virgülle ayrılmış listesini, süzülmüyorsa <code>"Tüm kategoriler"</code> metnini döndür.', sol: 'IF(ISFILTERED(Kategoriler[Kategori]), "Kategori: " & CONCATENATEX(VALUES(Kategoriler[Kategori]), Kategoriler[Kategori], ", "), "Tüm kategoriler")', hint: 'ISFILTERED ile kategori sütununda doğrudan filtre olup olmadığına bak; CONCATENATEX(VALUES(...), sütun, ", ") listeyi birleştirir.' }
] });

/* ------------------------------------------------------------------ */
ext('kosullu-bicim', { min: 14, html: `
<h2>Kurallarda yüzde tuzağı</h2>
<p>Finans ekibi Hedef Gerçekleşme % sütununa kural yazıyor: “%95’in altı kırmızı”. Kural iletişim kutusunda değerin yanındaki birim açılır listesi iki seçenek sunar: <b>Sayı</b> ve <b>Yüzde</b>. Sezgisel olarak “Yüzde” seçilir ve sonuç tutarsızlaşır. Nedeni: Learn’e göre buradaki “Yüzde”, değerin kendisini değil, <b>en küçük ile en büyük arasındaki aralıktaki konumu</b> ifade eder. Veri 100 ile 400 arasındaysa “yüzde 33’ten küçük” kuralı 200’ün altını boyar.</p>
<ul>
<li>Oran ölçüsüne kural yazarken değeri ondalık gir (%95 → <code>0,95</code>) ve birimi <b>Sayı</b> seç.</li>
<li>Negatif oranlar için ayrı bir “0’dan küçük” kuralı ekle; yoksa o hücreler hiçbir kurala girmez ve biçimsiz kalır.</li>
<li>Renk ölçeği ve yüzde tabanlı kurallar, veride NaN (sıfıra bölmeden gelen “sayı değil”) varsa çalışmaz. Oranları her zaman <code>DIVIDE</code> ile yaz.</li>
</ul>

<h2>Başka bir ölçüye göre boyamak</h2>
<p>Koşullu biçim iletişim kutusundaki <b>Hangi alanı temel almalıyız?</b> (What field should we base this on?) sorusu en güçlü ve en az bilinen ayardır. Net Satış sütununun arka planını <b>Kâr Marjı %</b>’ye göre boyayabilirsin: hücrede ciro yazar ama renk kârlılığı anlatır. Matriste bu, tek bir sütunla iki boyutlu bilgi demektir. Okuyucunun bunu anlaması için sütun başlığına ya da görsel alt başlığına “renk: kâr marjı” notu düş.</p>

<h2>Toplam satırı ve boş değerler</h2>
<p>Alan değeri yöntemiyle bağladığın renk ölçüsü <b>toplam ve ara toplam satırlarında da çalışır</b>. Kategori satırları için yazdığın “marj %40’ın üstü yeşil” kuralı toplam satırını da boyar; toplam çoğu zaman ortalamaya yakın olduğu için sarı görünür ve okuyucu “genelde kötüyüz” diye anlar. İki çözüm:</p>
<ol>
<li>Ölçü toplam satırında <code>BLANK()</code> döndürsün. <code>ISINSCOPE</code> satırda hangi düzeyde olduğunu söyler; boş renk “biçim uygulama” anlamına gelir.</li>
<li>Kural iletişim kutusunda <b>Boş değerleri nasıl biçimlendirelim?</b> seçeneğini “Biçimlendirme yok” bırak.</li>
</ol>
<pre class="dax">Marj Rengi (Toplamsız) =
IF(
    ISINSCOPE(Kategoriler[Kategori]),
    SWITCH(TRUE(),
        [Kâr Marjı %] &gt;= 0.37, "#17855A",
        [Kâr Marjı %] &gt;= 0.35, "#A86A12",
        "#C0392B")
)</pre>
<p>Bu modelde kategori marjları dar bir aralıkta: Elektronik yaklaşık %38,0 ile en yüksek, Hediye yaklaşık %32,3 ile en düşük. Eşikler bu yüzden %37 ve %35 seçildi; eşiği verinin gerçek dağılımına bakmadan yazmak, bütün hücrelerin aynı renge boyanmasıyla sonuçlanır.</p>

<h2>Simgeler ve veri çubukları: ince ayarlar</h2>
<ul>
<li><b>Simge düzeni:</b> Değerin solunda, sağında ya da yalnızca simge. Dar sütunlarda “yalnızca simge” kullanıyorsan, yanında değer gösteren ikinci bir sütun bırak; simge tek başına sayı vermez.</li>
<li><b>Kuraldan simge seçmek:</b> Her kuralın simge listesinden herhangi bir setten simge alabilirsin; üçlü setlere mahkûm değilsin.</li>
<li><b>Alan değeriyle özel simge:</b> Bir sütunda resim adresleri tutup simge olarak gösterebilirsin (SVG, PNG gibi biçimler). Adres herkese açık ya da OneLake dosya bağlantısı olmalı.</li>
<li><b>Veri çubukları ve negatifler:</b> Negatif değerler için ayrı renk ve eksen rengi seçilir. Hedef farkı gibi işaret değiştiren ölçülerde çubuğun ortadan iki yöne açılması, okumayı kolaylaştırır.</li>
<li><b>Yalnızca çubuğu göster:</b> Sayıyı gizler. Yöneticiye ilk bakışta sıralama, ayrıntı isteyene araç ipucunda sayı vermek için uygundur.</li>
</ul>

<h2>Renk körlüğüne dayanıklı durum paleti</h2>
<p>Kırmızı-yeşil çifti en sık kullanılan ve en sorunlu çifttir. Alternatifler: <b>mavi-turuncu</b> ıraksak palet (iyi = mavi, kötü = turuncu) ya da aynı tonun koyu-açık çifti. Büyüme gibi işaretli bir ölçüde üçüncü durumu unutma: geçen yıl verisi yoksa büyüme hesaplanamaz. Bu modelde 2022 ilk yıl olduğu için YoY % boş döner; renk ölçüsü bu durumu açıkça gri yapmalı, yoksa boş hücre “sıfır büyüme” gibi okunur.</p>
<pre class="dax">Büyüme Rengi =
VAR B = [YoY %]
RETURN
    SWITCH(TRUE(),
        ISBLANK(B), "#8A8780",
        B &gt;= 0, "#2A78D6",
        "#D9622B")</pre>
`, ex: [
  { t: 'mc', q: 'Analist, Hedef Gerçekleşme % sütununa “değer 95’ten küçükse kırmızı” kuralını birimi <b>Yüzde</b> seçerek yazıyor. Filtre değiştikçe kırmızı hücreler anlamsızca değişiyor. Sorun ne?', o: ['Kural toplam ve ara toplam satırlarına uygulanmıyor', 'Ölçü DIVIDE yerine bölme işaretiyle yazılmış', 'Kurallar en fazla üç adım alabildiği için kesiliyor', 'Yüzde aralıktaki konumdur; 0,95 ve Sayı seç'], a: 3, why: 'Kuraldaki Yüzde birimi en küçük–en büyük aralığındaki konumu ifade eder; aralık filtreyle değişince eşik de kayar. Oran ölçüleri için değer ondalık girilir ve birim Sayı seçilir. Diğer şıklar bu davranışı açıklamaz.' },
  { t: 'mc', q: 'Matriste Net Satış sütunu var. Müdür, hücrede ciro yazmasını ama rengin kârlılığı göstermesini istiyor. Ne yaparsın?', o: ['Arka plan renginde temel alanı Kâr Marjı % seç', 'Kâr Marjı % sütununu ekleyip Net Satış’ı gizle', 'Net Satış’a veri çubuğu ekle', 'Tema JSON’unda good ve bad renklerini değiştirmek'], a: 0, why: '“Hangi alanı temel almalıyız?” ayarı hücrenin değerinden farklı bir ölçüye göre renk vermeyi sağlar. Sütun eklemek isteği karşılamaz; veri çubuğu ciroyu gösterir; tema renkleri kuralı değiştirmez.' },
  { t: 'dax', name: 'Marj Rengi (Toplamsız)', q: '<b>Marj Rengi (Toplamsız)</b>: Satırda kategori düzeyindeysen (<code>ISINSCOPE(Kategoriler[Kategori])</code>) marj 0,37 ya da üstüyse <code>"#17855A"</code>, 0,35 ya da üstüyse <code>"#A86A12"</code>, değilse <code>"#C0392B"</code> döndür; toplam satırında boş kalsın.', sol: 'IF(ISINSCOPE(Kategoriler[Kategori]), SWITCH(TRUE(), [Kâr Marjı %] >= 0.37, "#17855A", [Kâr Marjı %] >= 0.35, "#A86A12", "#C0392B"))', hint: 'Dış katman IF(ISINSCOPE(...), ...); üçüncü argüman yazılmazsa IF boş döndürür. İçeride SWITCH(TRUE(), ...) ile eşikleri büyükten küçüğe sırala.' },
  { t: 'dax', name: 'Büyüme Rengi', q: '<b>Büyüme Rengi</b>: <code>[YoY %]</code> boşsa gri <code>"#8A8780"</code>, sıfır ya da üstüyse mavi <code>"#2A78D6"</code>, negatifse turuncu <code>"#D9622B"</code> döndür. Renk körlüğüne dayanıklı bir palet kullanıyorsun.', sol: 'VAR B = [YoY %] RETURN SWITCH(TRUE(), ISBLANK(B), "#8A8780", B >= 0, "#2A78D6", "#D9622B")', hint: 'Boş kontrolünü ilk sıraya koy: BLANK karşılaştırmalarda 0 gibi davranır ve B >= 0 koşulu boş değeri de yakalar.' },
  { t: 'mc', q: 'Kategori satırları için yazılmış renk ölçüsü matrisin toplam satırını sarıya boyuyor ve yönetici “genelde kötüyüz” diye yorumluyor. En doğru düzeltme?', o: ['Toplam satırını matristen kaldırmak', 'Toplam satırında ölçüyü boş döndürmek', 'Eşikleri toplamın üstünde kalacak biçimde düşürmek', 'Renk ölçeğine geçip min/max’ı otomatik bırakmak'], a: 1, why: 'Alan değeri renkleri toplam satırında da hesaplanır. ISINSCOPE ile toplamda BLANK döndürmek toplamı biçimsiz bırakır ve bilgi kaybı olmaz. Toplamı kaldırmak bilgi siler; eşikleri oynamak kuralı bozar; otomatik ölçek anlamı her filtrede değiştirir.' }
] });

/* ------------------------------------------------------------------ */
ext('tema-sayfa', { min: 12, html: `
<h2>Tema dosyasının iskeleti</h2>
<p>Tema JSON’unda zorunlu olan tek alan <code>name</code>’dir. Değiştirmek istemediğin her şeyi yazmazsın; Power BI eksikleri kendi varsayılanıyla doldurur. Bu yüzden iyi bir kurumsal tema küçük başlar, ihtiyaç çıktıkça büyür. Üç katman vardır:</p>
<div class="tbl-wrap"><table><tr><th>Katman</th><th>Ne ayarlar?</th><th>Örnek alanlar</th></tr>
<tr><td>Renk sınıfları</td><td>Seriler, durum renkleri, renk ölçeği, arayüz tonları</td><td><code>dataColors</code>, <code>good/neutral/bad</code>, <code>minimum/center/maximum/null</code>, <code>background</code>, <code>tableAccent</code></td></tr>
<tr><td>Metin sınıfları</td><td>Yazı tipi, boyut, renk</td><td><code>callout</code> (kart ve KPI sayıları), <code>title</code>, <code>header</code>, <code>label</code></td></tr>
<tr><td>Görsel stilleri</td><td>Biçim bölmesindeki hemen her ayarın varsayılanı</td><td><code>visualStyles</code></td></tr></table></div>
<p><code>minimum</code>, <code>center</code>, <code>maximum</code> ve <code>null</code> renkleri koşullu biçimdeki renk ölçeğinin başlangıç renkleridir. Analistler ısı haritası için her matriste aynı üç rengi elle seçeceğine bunları temaya koyar. Dört ana metin sınıfından türeyen ikincil sınıflar (örneğin <code>largeTitle</code>, <code>smallLabel</code>) ana sınıftan miras alır; yalnızca farklı olmasını istediğini yaz.</p>

<h2>visualStyles: dört düzeyli adres</h2>
<p>Bir görsel stili şu adresle yazılır: <b>görsel türü → stil ön ayarı → biçim kartı → özellik</b>. Her düzeyde <code>"*"</code> “hepsi” anlamına gelir.</p>
<pre class="dax" data-notry>"visualStyles": {
  "*": { "*": {
      "title": [{ "fontSize": 12, "bold": true }],
      "categoryAxis": [{ "gridlineStyle": "dotted" }]
  } },
  "card": { "*": {
      "labels": [{ "fontSize": 28 }]
  } },
  "slicer": { "*": {
      "general": [{ "responsive": true }]
  } }
}</pre>
<p>İlk blok tüm görsellerin başlığını 12 punto kalın yapar ve kategori ekseni olan her görselde ızgarayı noktalı çizer; ikinci blok yalnızca kartları etkiler. Kart adları her zaman Biçim bölmesindeki etiketle aynı değildir. Doğru adı bulmanın iki yolu var: Microsoft’un GitHub’daki tema şeması (VS Code’da otomatik tamamlama verir) ya da ayarı bir görselde elle yapıp temayı dışa aktararak çıkan JSON’a bakmak. Power BI içe aktarılan temayı şemaya göre doğrular; tanımadığı bir alan içe aktarmayı hata ile durdurur.</p>

<h2>Tema ile elle biçim çatıştığında</h2>
<p>Ekip, raporun yarısını bitirdikten sonra kurumsal temayı içe aktarıyor ve bazı grafikler değişmiyor. Neden: Biçim bölmesinde elle değiştirilmiş bir ayar, temanın üstünde durur. Görseli temaya döndürmek için görselde ya da bölümde <b>Varsayılana sıfırla</b> (Reset to default) kullanılır.</p>
<div class="warn"><b>Sıfırlamanın bedeli</b>Learn’e göre varsayılana sıfırlama yalnızca renk ve yazı tipini değil; düğme ve görüntü eylemlerini, <b>tüm koşullu biçim kurallarını</b>, adresten gelen görüntüleri ve veriye bağlı öğeleri (fx ile bağlanmış başlık, referans etiketi) de kaldırır. Bir matrisi sıfırlamadan önce koşullu biçimlerini not al. Doğru sıra: önce temayı yükle, sonra rapor yaz.</div>
<p>Tema koşullu biçim kuralı taşıyamaz; kuralları görsel görsel uygularsın. Ama kuralın renklerini <code>good/neutral/bad</code> ve renk ölçeği alanlarından alırsan, kurumsal renk değiştiğinde tek dosya yeter.</p>

<h2>Tema yaşam döngüsü</h2>
<ol>
<li><b>Oluştur:</b> Görünüm → Temalar → Geçerli temayı özelleştir. Renkler, metin, görsel arka planı, sayfa arka planı ve duvar kâğıdı, filtre bölmesi burada.</li>
<li><b>Dışa aktar:</b> Aynı menüde Geçerli temayı kaydet. Çıkan JSON’u ince ayar için düzenle.</li>
<li><b>Sürümle:</b> JSON’u ekibin ortak deposunda tut; dosya adına sürüm yaz (anadolu-tema-v3.json). Kimin hangi sürümü kullandığı ancak böyle izlenir.</li>
<li><b>Dağıt:</b> Yeni raporlar Temalara gözat ile bu dosyayı içe aktarır. Daha iyisi: temanın, sayfa düzeninin ve standart ölçülerin hazır olduğu bir şablon dosyası (.pbit). Analist şablonu açar, veri kaynağını gösterir, boş bir kurumsal raporla başlar.</li>
</ol>
<div class="tip"><b>Sayfa arka planı temada da durur</b>Tuval arka planını ve duvar kâğıdını her sayfada elle ayarlamak yerine temaya koyarsan, yeni eklenen her sayfa doğru renkle doğar. Arka plan görseli ise sayfa başına ayarlanır; tasarımcının çizdiği şablonu tüm sayfalara uygulamak için sayfayı çoğalt.</div>
`, ex: [
  { t: 'mc', q: 'Kurumsal tema raporun ortasında içe aktarıldı. Bazı grafikler yeni renklere geçmedi. Bir analist “hepsini varsayılana sıfırlayalım” diyor. Ne uyarısı yaparsın?', o: ['Sıfırlama yalnızca yazı tiplerini değiştirir', 'Sıfırlama raporun temasını da kaldırır', 'Koşullu biçimleri de siler', 'Sıfırlama yalnızca Service’te çalışır'], a: 2, why: 'Varsayılana sıfırlama görseli temaya döndürür ama düğme eylemlerini, koşullu biçim kurallarını ve veriye bağlı öğeleri de kaldırır. Temayı kaldırmaz; yazı tipinden fazlasını etkiler; Desktop’ta da çalışır.' },
  { t: 'mc', q: 'Tüm raporlardaki ısı haritalarında aynı açık-koyu mavi ölçeğin başlangıç rengi olarak gelmesini istiyorsun. Tema dosyasında neyi ayarlarsın?', o: ['dataColors listesindeki ilk üç rengi', 'tableAccent ve background renklerini', 'textClasses içindeki label sınıfının rengini', 'minimum, center ve maximum renklerini'], a: 3, why: 'minimum/center/maximum (ve null) koşullu biçimdeki renk ölçeğinin varsayılan renkleridir. dataColors seri renkleri, tableAccent tablo vurgusu, label metin sınıfıdır.' },
  { t: 'mc', q: 'Tema JSON’una el ile <code>"kartGolgesi": true</code> gibi bir alan eklenince Power BI temayı içe aktarmıyor. Neden?', o: ['Şemada olmayan alan reddedilir', 'Tema dosyası izin verilen boyutu aşmış', 'Alan adları Türkçe olamaz ama değerler olabilir', 'Tema yalnızca Service’ten yüklenebilir'], a: 0, why: 'Power BI içe aktarılan temayı şemaya göre doğrular ve tanımadığı alanları hata olarak görür. Doğru kart ve özellik adını şemadan ya da dışa aktarılmış bir temadan bulmak gerekir.' },
  { t: 'mc', q: 'Ekipte her yeni rapor aynı tema, aynı sayfa düzeni, aynı tarih tablosu ve standart ölçülerle başlamalı. En sürdürülebilir yol?', o: ['Her analiste tema JSON’unu e-postayla göndermek', 'Tema, düzen ve ölçüleri taşıyan .pbit şablonu', 'Eski bir raporu kopyalayıp verisini silmek', 'Her raporda Geçerli temayı özelleştir’i kullanmak'], a: 1, why: 'Şablon dosyası tema, sayfa yapısı ve model öğelerini veri olmadan taşır; analist veri kaynağını bağlayıp başlar. Tema tek başına ölçü ve düzen taşımaz; eski raporu kopyalamak gizli artıklar bırakır; elle özelleştirme tutarlılık sağlamaz.' }
] });

/* ------------------------------------------------------------------ */
ext('hikaye', { min: 14, html: `
<h2>Anlatı akışı: dört soruluk iskelet</h2>
<p>Bölge müdürü toplantıya 10 dakika ayırıyor. Rapor ona dört soruyu sırayla cevaplamalı:</p>
<ol>
<li><b>Bağlam:</b> Neye bakıyoruz? (Dönem, kapsam, hedef.)</li>
<li><b>Bulgu:</b> Ne oldu? Tek cümle: “2024’te net satış hedefin yaklaşık %2 altında kaldı.”</li>
<li><b>Neden:</b> Kim ya da ne sürükledi? Kategori, kanal, temsilci kırılımı.</li>
<li><b>Eylem:</b> Ne yapılmalı? Sahip ve tarih (Rapordan karara dersinde bunu ayrıntılı gördün).</li>
</ol>
<p>Bu iskelet sayfa düzenine doğrudan çevrilir: üst şeritte bağlam (dönem dilimleyicisi + hedef kartı), altında bulgu başlığı, ortada neden grafikleri, sağ altta eylem notu. Hikâye sayfadan sayfaya da akar: Özet → Analiz → Detay. Modelde 2024 için Hedef Gerçekleşme % yaklaşık %97,9; 2023 için %99,6. Yani bulgu cümlesi “hedefe çok yaklaştık ama iki yıldır altındayız” olabilir; grafik bu cümleyi kanıtlamak için oradadır.</p>

<h2>Bulgu başlığını ölçüye bağlamak</h2>
<p>Elle yazılmış bulgu başlığı ilk filtrede yalan söyler. “Elektronik lider” başlığı, kullanıcı 2022’yi seçtiğinde de durur. Başlığı ölçüyle üret: Biçim → Genel → Başlık → metnin yanındaki fx → Alan değeri.</p>
<pre class="dax">Lider Kategori Metni =
VAR Lider = TOPN(1, VALUES(Kategoriler[Kategori]), [Net Satış])
VAR Ad = CONCATENATEX(Lider, Kategoriler[Kategori], ", ")
VAR Pay = DIVIDE(CALCULATE([Net Satış], Lider), [Net Satış])
RETURN Ad &amp; " satışın %" &amp; FORMAT(Pay * 100, "0") &amp; " kadarını taşıyor"</pre>
<p>Bu ölçü tüm dönemde “Elektronik satışın %27 kadarını taşıyor” üretir. FORMAT(Pay, "0%") yazsaydın sonuç “27%” olurdu; Türkçe yazımda yüzde işareti sayının önüne gelir. Ölçü kategori kırılımlı bir görselde kullanılmaz; her satırda kendi kategorisini %100 ile yazar. Başlık ve kart ölçüleri <b>görselin değil sayfanın bağlamında</b> çalışacak şekilde yazılır.</p>
<div class="note"><b>Eşitlik durumu</b>TOPN eşit değerleri birlikte döndürür. İki kategori aynı satışta ise Ad “A, B” olur; CONCATENATEX’in ayırıcısı bu yüzden virgüldür. Eşitliği görmezden gelen bir ölçü, rapor yıllarca çalışırken bir gün tek bir adı rastgele seçer.</div>

<h2>Yer imi stratejisi: az, adlı, bakımlı</h2>
<p>Yer imi kurulumunu gördün; asıl sorun altı ay sonra gelir. Rapora yeni bir görsel eklenir, eski yer imleri onu bilmez: “Tablo” yer imine geçince yeni görsel de gizlenir ya da yanlış yerde kalır. Kurallar:</p>
<ul>
<li><b>Ad standardı:</b> <code>Sayfa | Durum</code> biçimi (“Özet | Grafik”, “Özet | Tablo”). Yer imi bölmesinde sırala, gruplara ayır.</li>
<li><b>Kapsamı daralt:</b> Yalnızca değişen görselleri seçip “Seçili görseller” ile kaydet. Sayfaya eklenen yeni görsel yer iminden etkilenmez.</li>
<li><b>Veri seçeneğini bilinçli seç:</b> Görünürlük değiştiren yer imlerinde Veri kapalı olsun; kullanıcının filtresi korunur.</li>
<li><b>Patlamayı fark et:</b> 3 ölçü × 3 görsel türü için 9 yer imi yapıyorsan yanlış araçtasın. Ölçü değiştirmek için alan parametresi ya da ölçü seçici tablo (Seçili Ölçü kalıbı) daha az bakım ister.</li>
<li><b>Kişisel yer imleri:</b> Okuyucu kendi filtre durumunu kişisel yer imi olarak kaydedebilir; rapor yer imleri tasarım içindir, kişisel yer imleri kullanıcı içindir.</li>
</ul>

<h2>Düğme gezintisi ve açıklama metni</h2>
<p>Gezinme şeridi tüm sayfalarda aynı yerde, aynı sırada durmalı; bir sayfadaki şeridi kopyalayıp diğerlerine yapıştırmak konumu korur. Etkin sayfa düğmesi farklı görünmeli: Sayfa gezgini bunu “Seçili” durum biçimiyle kendisi yapar. Düğme hedefini sabit bir sayfa yerine bir ölçüye bağlayabilirsin (Eylem → Hedef → fx): ölçü, kullanıcının seçimine göre sayfa adını metin olarak döndürür. Sayfa adı değişirse ölçü bozulur; sayfa adlarını sabitle ve belgeye yaz.</p>
<p>Açıklama metni için üç katman kullan:</p>
<ul>
<li><b>Bulgu başlığı:</b> Ölçüyle üretilen tek cümle.</li>
<li><b>Metin kutusu + değer:</b> Metin kutusunda “+ Değer” ile cümlenin içine canlı bir sayı yerleştirilir; filtre değişince sayı güncellenir.</li>
<li><b>Tanım notu:</b> “Net Satış: iptaller hariç, KDV hariç.” Sayfanın altında küçük puntoyla ya da bir bilgi (i) düğmesinin araç ipucunda. Tanımı olmayan KPI toplantıda tartışma çıkarır.</li>
</ul>
`, ex: [
  { t: 'dax', name: 'Lider Kategori Metni', q: '<b>Lider Kategori Metni</b>: Bağlamdaki en yüksek net satışlı kategorinin adını ve satıştaki payını yaz: <code>Ad & " satışın %" & FORMAT(Pay * 100, "0") & " kadarını taşıyor"</code> (Türkçede yüzde işareti sayının önüne gelir). Lideri <code>TOPN(1, VALUES(Kategoriler[Kategori]), [Net Satış])</code> ile bul; eşitlikte adlar virgülle birleşsin.', sol: 'VAR Lider = TOPN(1, VALUES(Kategoriler[Kategori]), [Net Satış]) VAR Ad = CONCATENATEX(Lider, Kategoriler[Kategori], ", ") VAR Pay = DIVIDE(CALCULATE([Net Satış], Lider), [Net Satış]) RETURN Ad & " satışın %" & FORMAT(Pay * 100, "0") & " kadarını taşıyor"', hint: 'TOPN bir tablo döndürür; onu hem CONCATENATEX’e hem CALCULATE’in filtre argümanına verebilirsin.' },
  { t: 'mc', q: 'Özet sayfasına yeni bir kart eklendi. “Özet | Tablo” yer imine geçildiğinde yeni kart da kayboluyor. Kalıcı çözüm?', o: ['Kartı ayrı bir sayfaya taşıyıp gizlemek', 'Seçili görsellerle yeniden kaydetmek', 'Yer iminde Veri seçeneğini de açmak', 'Kartı diğerleriyle gruplayıp kilitlemek'], a: 1, why: 'Tüm görseller kapsamındaki yer imi, kaydedildiği andaki görünürlüğü sayfadaki her nesneye uygular. Yalnızca değişen görselleri seçip kaydetmek, sonradan eklenen görselleri yer iminin dışında bırakır. Veri seçeneği filtreleri etkiler, görünürlüğü değil.' },
  { t: 'mc', q: 'Bir rapor sahibi 4 ölçü × 3 görsel türü için 12 yer imi ve 12 düğme kurmuş. Bakım kâbusa dönmüş. Ne önerirsin?', o: ['Yer imlerini tek bir yer imi grubuna toplamak', 'Her kombinasyon için ayrı sayfa açmak', 'Ölçü seçimini alan parametresine taşımak', 'Yer imi gezginini sayfa gezginiyle değiştirmek'], a: 2, why: 'Ölçü değiştirme işi verinin işidir; alan parametresi ya da ölçü seçici tablo tek görselle aynı sonucu verir ve yer imi sayısını düşürür. Gruplamak ve gezgin değiştirmek sayıyı azaltmaz; ayrı sayfalar bakımı daha da büyütür.' },
  { t: 'mc', q: 'Özet sayfasının başlığı elle “Elektronik lider kategori” yazılmış. Kullanıcı 2022’yi seçince başlık hâlâ aynı. Ne yaparsın?', o: ['Başlığı fx ile ölçüye bağlarım', 'Başlığı kaldırıp göstergeyi açarım', 'Sayfaya 2022 için ayrı bir yer imi eklerim', 'Yıl dilimleyicisini sayfadan kaldırırım'], a: 0, why: 'Bulgu başlığı veriye bağlı olmalı; fx → Alan değeri ile bir metin ölçüsüne bağlanan başlık her filtrede yeniden hesaplanır. Yer imi ve dilimleyiciyi kaldırmak sorunu çözmez, kullanıcıyı kısıtlar.' },
  { t: 'mc', q: 'Yönetici “Bu sayfadaki Net Satış iadeleri içeriyor mu?” diye her toplantıda soruyor. En iyi kalıcı çözüm?', o: ['Ölçünün adını “Net Satış (İptalsiz)” yapmak', 'Toplantıda sözlü olarak açıklamak', 'Ayrı bir “Tanımlar” raporu yayımlamak', 'Sayfaya kısa bir tanım notu koymak'], a: 3, why: 'Tanım, sayının yanında durmalı: kısa bir dipnot ya da bilgi düğmesinin araç ipucu soruyu kaynağında cevaplar. Ayrı rapor bulunmaz; sözlü açıklama kalıcı değildir; uzun ölçü adları görselleri kalabalıklaştırır ve iadeyi de açıklamaz.' }
] });

/* ------------------------------------------------------------------ */
ext('mobil-erisilebilirlik', { min: 13, html: `
<h2>Mobil düzeni otomatik oluşturmak</h2>
<p>Mobil düzen görünümünde (Görünüm → Mobil düzen) boş telefon tuvalini sıfırdan doldurmak yerine <b>otomatik mobil düzen oluşturma</b> seçeneğini kullanabilirsin. Learn’e göre bu özellik masaüstü düzenindeki görsellerin konumuna, boyutuna, türüne ve sırasına bakarak tam bir mobil düzen üretir. Bilmen gerekenler:</p>
<ul>
<li>Var olan mobil düzenin <b>üzerine yazar</b>; elle yaptığın düzenleme gider.</li>
<li>En iyi sonucu soldan sağa, yukarıdan aşağı okunan sayfalarda verir. Arka plan görselini taşıyamaz, üst üste binen görsellerde zorlanır.</li>
<li>Gizli görselleri de yerleştirir; böylece yer imleriyle görünürlük değiştiren düğmeler telefonda da çalışır.</li>
<li>Yerleştiremediği görseller Sayfa görselleri bölmesinde kalır; elle sürüklersin.</li>
</ul>
<div class="warn"><b>Mobil tuvalde test ederken</b>Mobil tuvalde araç ipuçları kapalıdır (uygulamada çalışır). Tuvalde yaptığın dilimleyici seçimleri web düzenine taşınmaz; yayımlanan rapor, web düzenindeki dilimleyici seçimleriyle açılır. Yani “telefonda 2024 seçili açılsın” istiyorsan seçimi web düzeninde yap.</div>

<h2>Alternatif metin: 250 karakterde içgörü</h2>
<p>Ekran okuyucu görselin başlığını ve türünü zaten okur. Alternatif metne “Kategoriye göre net satış sütun grafiği” yazmak bu yüzden tekrardır. Alternatif metin okuyucuya <b>görselden çıkarılması gereken sonucu</b> söylemeli. Sınır 250 karakterdir. Sabit metne sayı yazma; sayılar filtreyle değişir. Bunun yerine alternatif metin kutusunun yanındaki fx düğmesiyle bir ölçüye bağla. Lider kategoriyi ve payını söyleyen bir ölçü, sütun grafiğinin özünü tek cümlede verir: tüm dönemde “En yüksek satış Elektronik kategorisinde, payı %27.”</p>
<pre class="dax">Alt Metin Lider Kategori =
VAR Lider = TOPN(1, VALUES(Kategoriler[Kategori]), [Net Satış])
VAR Pay = DIVIDE(CALCULATE([Net Satış], Lider), [Net Satış])
RETURN "En yüksek satış " &amp; CONCATENATEX(Lider, Kategoriler[Kategori], ", ") &amp; " kategorisinde, payı %" &amp; FORMAT(Pay * 100, "0") &amp; "."</pre>
<p>Dekoratif şekillerin ve arka plan görsellerinin alternatif metni boş kalsın ve sekme sırasından çıkarılsın (Seçim bölmesi → Sekme sırası → nesnenin yanındaki numaraya tıkla). Metin kutularının içeriğini ise alternatif metne de yaz.</p>

<h2>Renk dışında bir ipucu: işaretçiler ve simgeler</h2>
<p>Üç kanalı gösteren çizgi grafikte renkler ayırt edilemiyorsa, her seriye farklı işaretçi şekli ver: Biçim → İşaretçiler → Seriyi özelleştir. Durum bilgisi ise metin ve simgeyle birlikte verilmeli; yalnızca kırmızı yazı, renk körü bir kullanıcı için hiçbir şey söylemez.</p>
<pre class="dax">Erişilebilir Durum =
IF(
    [Hedef Gerçekleşme %] &gt;= 0.97,
    "▲ Hedefe yakın",
    "▼ Hedefin gerisinde"
)</pre>
<p>Learn ayrıca ayırt edilmesi zor renk çiftlerini sayar: yeşil-kırmızı, yeşil-kahverengi, mavi-mor, yeşil-mavi, açık yeşil-sarı, mavi-gri, yeşil-gri, yeşil-siyah. Kurumsal paletinde bu çiftler yan yana duruyorsa sırayı değiştir.</p>

<h2>Klavye ve ekran okuyucu ile test</h2>
<p>Erişilebilirlik bir ayar değil, bir testtir. Yayından önce raporu fareye dokunmadan gez:</p>
<ol>
<li><b>Ctrl + F6</b> ile ana alanlar (tuval, sayfa sekmeleri, bölmeler) arasında geç; Tab ile görseller arasında dolaş. Sıra, gözün sayfayı okuduğu sırayla aynı mı?</li>
<li>Bir görselde <b>Alt + Shift + F11</b> ile veriyi tablo olarak aç. Tablo görselin sıralamasını kullanır; sıralamayı bilinçli seçmediysen anlamsız bir sırayla okunur.</li>
<li><b>Shift + ?</b> klavye kısayolları penceresini açar; kullanıcı eğitiminde bunu göster.</li>
<li>Yer imi düğmeleriyle gezinen sayfaları yalnızca klavyeyle dene.</li>
<li>Önemli bilgiyi araç ipucuna saklama: rapor sayfası araç ipuçları ekran okuyucuyla okunamaz.</li>
<li>Windows’ta yüksek karşıtlık temasını aç; Desktop bunu algılar. Service’te düzenleme modunda Görünüm → Yüksek karşıtlık renkleri ile dene.</li>
</ol>
<div class="tip"><b>Kısa gözden geçirme sorusu</b>“Bu sayfadaki her bilgi, renk görmeyen, fare kullanmayan ve görseli göremeyen biri için de bir yoldan ulaşılabilir mi?” Cevap hayırsa hangi kanalın eksik olduğunu (metin, klavye, ekran okuyucu) not et.</div>
`, ex: [
  { t: 'mc', q: 'Bir rapor sayfasında mobil düzen elle titizlikle hazırlanmıştı. Yeni gelen analist “Otomatik oluştur”a basmak istiyor. Ne söylersin?', o: ['Sorun yok, yalnızca eksik görselleri ekler', 'Var olan mobil düzenin üzerine yazar', 'Masaüstü düzenini de değiştirir', 'Yalnızca Service’te çalışır, Desktop’ta işe yaramaz'], a: 1, why: 'Otomatik oluşturma mevcut mobil tuval düzenini değiştirir; elle yapılan yerleşim kaybolur. Masaüstü düzenine dokunmaz ve Desktop’ta da kullanılabilir.' },
  { t: 'mc', q: 'Bir sütun grafiğinin alternatif metnine “Kategoriye göre net satış sütun grafiği” yazılmış. Erişilebilirlik gözden geçirmesinde neden zayıf bulunur?', o: ['250 karakter sınırını aşıyor', 'Alternatif metin yalnızca görüntülerde okunur', 'Başlık ve türü tekrarlıyor, içgörü vermiyor', 'Ekran okuyucular Türkçe okumaz'], a: 2, why: 'Ekran okuyucu başlığı ve görsel türünü zaten duyurur. Alternatif metin kullanıcının çıkarması gereken sonucu söylemeli, sayılar değişeceği için de bir ölçüye bağlanmalı. Metin sınırı aşmıyor ve tüm görsellerde okunur.' },
  { t: 'mc', q: 'Kategori grafiğinin üzerine gelince açılan araç ipucu sayfasında her kategorinin hedef farkı yazıyor ve bu bilgi başka hiçbir yerde yok. Erişilebilirlik açısından sorun?', o: ['Araç ipucu sayfaları ekran okuyucuyla okunamaz', 'Araç ipucu sayfaları mobil uygulamada hiç çalışmaz', 'Araç ipucu kontrast oranını düşürür', 'Sorun yok; araç ipucu klavyeyle açılır'], a: 0, why: 'Learn, rapor sayfası araç ipuçlarının ekran okuyucuyla okunamadığını ve önemli bilginin yalnızca araç ipucunda tutulmamasını söyler. Mobil uygulamada araç ipuçları çalışır; kontrastla ilgisi yoktur.' },
  { t: 'dax', name: 'Alt Metin Lider Kategori', q: '<b>Alt Metin Lider Kategori</b>: Alternatif metin için şu cümleyi üret: <code>"En yüksek satış " & lider kategori & " kategorisinde, payı %" & FORMAT(Pay * 100, "0") & "."</code>. Lideri TOPN(1, VALUES(Kategoriler[Kategori]), [Net Satış]) ile bul.', sol: 'VAR Lider = TOPN(1, VALUES(Kategoriler[Kategori]), [Net Satış]) VAR Pay = DIVIDE(CALCULATE([Net Satış], Lider), [Net Satış]) RETURN "En yüksek satış " & CONCATENATEX(Lider, Kategoriler[Kategori], ", ") & " kategorisinde, payı %" & FORMAT(Pay * 100, "0") & "."', hint: 'Pay = lider kategorinin satışı / bağlamdaki toplam satış. CALCULATE([Net Satış], Lider) liderin satışını verir.' },
  { t: 'dax', name: 'Erişilebilir Durum', q: '<b>Erişilebilir Durum</b>: Hedef gerçekleşme 0,97 ya da üstündeyse <code>"▲ Hedefe yakın"</code>, değilse <code>"▼ Hedefin gerisinde"</code> döndür. Durum renk görmeyen biri için de okunur olsun.', sol: 'IF([Hedef Gerçekleşme %] >= 0.97, "▲ Hedefe yakın", "▼ Hedefin gerisinde")', hint: '[Hedef Gerçekleşme %] hazır ölçüsünü IF içinde 0.97 ile karşılaştır. Simgeyi metnin başına koy.' }
] });

/* ------------------------------------------------------------------ */
ext('istatistik', { min: 15, html: `
<h2>Ortalama mı, medyan mı? Sayılarla karar</h2>
<p>CRM müdürü “Tipik bir müşteri bize ne kadar kazandırıyor?” diye soruyor. Modelde satın alma yapmış 136 müşteri var. İki cevap çıkıyor:</p>
<div class="tbl-wrap"><table><tr><th>İstatistik</th><th>Değer (yaklaşık)</th></tr>
<tr><td>Müşteri başı ortalama net satış</td><td>9.197 TL</td></tr>
<tr><td>Müşteri başı medyan net satış</td><td>6.467 TL</td></tr>
<tr><td>En düşük / en yüksek müşteri</td><td>586 TL / 37.955 TL</td></tr>
<tr><td>Ortalamanın üstünde kalan müşteri</td><td>136 müşteriden 47’si</td></tr></table></div>
<p>Ortalama, medyandan yaklaşık %42 yüksek. Müşterilerin yalnızca üçte biri ortalamanın üstünde. Yani “ortalama müşteri” aslında azınlıktaki büyük alıcıların çektiği bir sayıdır. Karar kuralı:</p>
<ul>
<li><b>Ortalama:</b> Toplamla ilişkili sorular. “100 yeni müşteri kazanırsak ciro ne kadar artar?” sorusunda ortalama doğrudur, çünkü toplamı ortalama belirler.</li>
<li><b>Medyan:</b> “Tipik” sorular. Kampanya eşiği, müşteri segmenti sınırı, “sıradan bir sipariş ne kadar?” sorularında.</li>
<li><b>İkisini birlikte göster:</b> Aradaki fark çarpıklığın ölçüsüdür. Fark büyükse dağılıma bak (histogram).</li>
</ul>
<pre class="dax">Medyan Müşteri Satışı =
MEDIANX(VALUES(Musteriler[MusteriNo]), [Net Satış])</pre>
<p>Aynı ayrım satır düzeyinde de var: satış satırı tutarının ortalaması yaklaşık 831 TL, medyanı 640 TL. Sipariş düzeyinde ise ortalama sepet yaklaşık 1.493 TL, medyan sipariş 1.087 TL. Hangi düzeyde (satır, sipariş, müşteri) ortalama aldığını ölçünün adına yaz; “Ortalama Satış” adı üç farklı sayıya karşılık gelebilir.</p>

<h2>Ağırlıklı ve basit ortalama</h2>
<p>Ürün müdürü “kategorilerin ortalama marjı” istiyor. İki hesap var:</p>
<ul>
<li><b>Ağırlıklı (oranların oranı):</b> Toplam brüt kâr / toplam net satış = [Kâr Marjı %] ≈ %36,5. Büyük kategori sonuca daha çok etki eder.</li>
<li><b>Basit (oranların ortalaması):</b> Yedi kategorinin marjının aritmetik ortalaması ≈ %35,6. Hediye gibi küçük bir kategori, Elektronik ile aynı ağırlıkta sayılır.</li>
</ul>
<p>Şirketin kârlılığı sorulduğunda ağırlıklı oran doğrudur. “Kategori yöneticilerinin performansı” gibi her birimin eşit sayıldığı sorularda basit ortalama savunulabilir. Matriste toplam satırı her zaman ağırlıklı oranı gösterir; kategori satırlarının ortalamasıyla tutmaması hata değildir.</p>
<pre class="dax">Basit Ortalama Marj =
AVERAGEX(VALUES(Kategoriler[Kategori]), [Kâr Marjı %])</pre>

<h2>Dağılımı tek bakışta anlatmak</h2>
<p>Keşifçi veri analizi dersinde çeyrekler ve aykırı değer kuralını ayrıntılı göreceksin; burada raporda nasıl sunulacağına odaklan. Müşteri satışlarında 25. yüzdebirlik yaklaşık 3.759 TL, 75. yüzdebirlik yaklaşık 14.782 TL. “Müşterilerin yarısı 3.759 ile 14.782 TL arasında harcıyor” cümlesi, standart sapmadan çok daha anlaşılırdır. Yönetici sayfasında dağılım için şu üçlü yeterlidir: medyan kartı, çeyrekler arası aralık cümlesi, küçük bir histogram.</p>

<h2>Büyüme oranlarının ortalaması: GEOMEAN</h2>
<p>Finans direktörü “son iki yılda ortalama yıllık büyümemiz ne?” diye soruyor. Modelde net satış 2023’te yaklaşık %290, 2024’te yaklaşık %86 büyüdü. Bu iki oranın aritmetik ortalaması yaklaşık %188 eder. Ama 2022’nin 102.837 TL’sini iki yıl üst üste %188 büyütürsen 2024 için yaklaşık 854 bin TL bulursun; gerçek değer 747 bin TL. Doğru cevap bileşik (geometrik) büyümedir: (1 + 2,898) × (1 + 0,864) çarpımının karekökünden 1 çıkar, yaklaşık %170. Oranlar çarpılarak birikir; bu yüzden ortalamaları da çarpımsal alınır. DAX’ta GEOMEAN ve GEOMEANX bunun içindir; büyüme katsayılarının (1 + oran) ortalamasını alıp 1 çıkarırsın. İlk yıl gibi büyümesi boş olan dönemi hesaba katma.</p>
<h2>Analiz bölmesindeki ortalama çizgisi neyin ortalaması?</h2>
<p>Aylık net satış sütun grafiğine Analiz bölmesinden <b>Ortalama çizgisi</b> eklediğinde çizgi, <b>görünen noktaların</b> (ayların) ortalamasıdır. Modelde satış olan 31 ayın ortalaması yaklaşık 40.347 TL. Bu sayı ne satır tutarı ortalamasıdır ne de sepet ortalaması. İki tuzak:</p>
<ul>
<li>Grafik filtrelenip 6 ay kalırsa çizgi o 6 ayın ortalamasına kayar. “Ortalama” sabit bir referans değildir.</li>
<li>Satışı olmayan aylar eksende görünmüyorsa ortalamaya girmez. Eksik ay, ortalamayı yukarı çeker.</li>
</ul>
<p>Sabit bir referans istiyorsan (ör. tüm geçmişin aylık ortalaması) <b>Sabit çizgi</b> ekle ve değerini fx ile bir ölçüye bağla. Ölçü görünen aylardan bağımsız hesaplanmalı:</p>
<pre class="dax">Aylık Ortalama (Tüm Dönem) =
CALCULATE(
    AVERAGEX(VALUES(Tarih[YilAy]), [Net Satış]),
    REMOVEFILTERS(Tarih)
)</pre>
<div class="tip"><b>Ortalama çizgisinin yanına not</b>Çizginin etiketini aç ve adını “Görünen ayların ortalaması” yap. İki dakikalık bu iş, toplantıdaki “bu ortalama nereden çıktı?” tartışmasını bitirir.</div>
`, ex: [
  { t: 'dax', name: 'Medyan Müşteri Satışı', q: '<b>Medyan Müşteri Satışı</b>: Bağlamdaki müşterilerin net satışlarının ortancasını hesapla. Müşteriler üzerinde dolaşmak için <code>VALUES(Musteriler[MusteriNo])</code> kullan.', sol: 'MEDIANX(VALUES(Musteriler[MusteriNo]), [Net Satış])', hint: 'MEDIANX(tablo, ifade): tablodaki her satır için ifadeyi hesaplar ve ortancayı alır. Satışı olmayan müşteriler boş döner ve hesaba katılmaz.' },
  { t: 'dax', name: 'Basit Ortalama Marj', q: '<b>Basit Ortalama Marj</b>: Her kategoriyi eşit sayarak kategorilerin <code>[Kâr Marjı %]</code> değerlerinin aritmetik ortalamasını al.', sol: 'AVERAGEX(VALUES(Kategoriler[Kategori]), [Kâr Marjı %])', hint: 'AVERAGEX ile Kategoriler[Kategori] değerleri üzerinde dolaş; her satırda hazır marj ölçüsü kategori bağlamında hesaplanır.' },
  { t: 'query', q: 'Tüm müşteriler için müşteri başı net satışın <b>ortalamasını</b> ve <b>medyanını</b> tek satırda yan yana döndüren bir sorgu yaz. Sütun adları “Ortalama” ve “Medyan” olsun.', start: 'EVALUATE\n', sol: 'EVALUATE\nROW(\n    "Ortalama", AVERAGEX(VALUES(Musteriler[MusteriNo]), [Net Satış]),\n    "Medyan", MEDIANX(VALUES(Musteriler[MusteriNo]), [Net Satış])\n)', hint: 'ROW("Ad1", ifade1, "Ad2", ifade2) tek satırlık bir tablo üretir. Her iki ifade de müşteri listesi üzerinde dolaşmalı.' },
  { t: 'mc', q: 'Pazarlama ekibi “kampanyada ortalama müşteriden fazla harcayanlara hediye verelim” diyor; ortalama 9.197 TL, medyan 6.467 TL. Ekip “müşterilerin yarısına hediye gider” sanıyor. Ne söylersin?', o: ['Doğru; ortalamanın üstü her zaman yarıdır', 'Hayır; ortalamanın üstü azınlıkta kalır', 'Ortalama ile medyan aynı şeyi ölçer', 'Medyan her zaman ortalamadan büyüktür'], a: 1, why: 'Yarıyı ayıran değer medyandır. Birkaç büyük alıcı ortalamayı yukarı çektiği için bu modelde 136 müşteriden yalnızca 47’si ortalamanın üstündedir. Diğer şıklar ortalama ile medyan arasındaki farkı yanlış anlatır.' },
  { t: 'mc', q: 'Aylık satış grafiğine Analiz bölmesinden Ortalama çizgisi eklendi. Kullanıcı yalnızca son 6 ayı seçince çizginin yeri değişiyor. Yönetici sabit bir referans istiyor. Ne yaparsın?', o: ['Ortalama yerine Medyan çizgisi eklerim', 'Grafiğe Yıl dilimleyicisi eklerim', 'Ortalama çizgisini yüzdebirlik çizgisine çeviririm', 'Ölçüye bağlı bir Sabit çizgi eklerim'], a: 3, why: 'Ortalama çizgisi görünen noktaların ortalamasıdır, filtreyle kayar. Sabit çizgi fx ile REMOVEFILTERS kullanan bir ölçüye bağlanırsa seçimden bağımsız kalır. Medyan ve yüzdebirlik çizgileri de görünen noktalara göre hesaplanır.' }
] });

/* ------------------------------------------------------------------ */
ext('analiz-ozellikleri', { min: 14, html: `
<h2>Anomali algılama: koşulları ve okuma biçimi</h2>
<p>Operasyon müdürü aylık net satış çizgisinde “normal dışı” ayları otomatik görmek istiyor. Çizgi grafiği seç → Analiz bölmesi → <b>Anomaliler</b> (Anomalies) → Ekle. Power BI beklenen aralığı gölge olarak çizer, aralık dışındaki noktaları işaretler. Learn’e göre koşullar sıkıdır:</p>
<ul>
<li>Yalnızca <b>çizgi grafik</b>, eksende zaman serisi.</li>
<li>En az <b>4 veri noktası</b>.</li>
<li><b>Gösterge (legend), birden çok değer ya da ikincil değer</b> varken çalışmaz. Kanal göstergeli bir çizgide anomali istiyorsan kanal başına küçük katlar kullan ya da tek kanalı filtrele.</li>
<li><b>Tahmin, ortalama, medyan, min/max ve yüzdebirlik çizgileriyle</b> birlikte kullanılamaz. Bir grafikte ya tahmin ya anomali.</li>
<li>Hiyerarşide detaya inme desteklenmez.</li>
</ul>
<p><b>Duyarlılık</b> (sensitivity) kaydırıcısı artırıldıkça küçük sapmalar da işaretlenir. İşaretli bir noktaya tıklayınca açılan bölmede Power BI modeli tarar ve olası nedenleri güç sırasıyla listeler. Taramayı ilgili alanlarla sınırlamak için <b>Açıklama ölçütü</b> (Explain by) kutusuna alan koy: Kanal, Kategori, Bölge. Güç, o kırılımın beklenenden sapmasının toplam sapmaya oranıdır.</p>
<div class="warn"><b>Bu modelde dikkat</b>Satış 2022’de yıl ortasında başlıyor ve şirket hızla büyüyor (2022’de yaklaşık 103 bin TL, 2024’te 747 bin TL). Güçlü büyüme dönemlerinde ilk aylar “düşük anomali” görünebilir. İşaretleri iş bilgisiyle oku: yeni açılan kanal, kampanya, eksik veri.</div>

<h2>Kendi beklenen aralığını yazmak</h2>
<p>Yerleşik özellik kara kutudur ve bir yönetim raporunda “neden bu ay kırmızı?” sorusuna formülle cevap veremez. Basit ve açıklanabilir bir alternatif: görünen ayların ortalaması ± 2 standart sapma. Modelde satışı olan 31 ayda aylık ortalama yaklaşık 40.347 TL, standart sapma yaklaşık 23.536 TL. Üst sınır yaklaşık 87.419 TL çıkar ve 31 aydan yalnızca 2’si onu aşar: 2024 Kasım ve Aralık. Bunlar sıra dışı aylar değil, büyümenin en ileri noktasıdır. Büyüyen bir seride sabit bant anomaliyi değil eğilimi yakalar. Ders: sabit bir bant yerine hareketli bir ortalama (3 Ay Hareketli Ort. gibi) çevresinde bant kur ya da İleri istatistik dersindeki z-skoru ve mevsimsellik yöntemlerine geç.</p>
<pre class="dax">Aylık Üst Bant =
VAR Aylar = VALUES(Tarih[YilAy])
RETURN
    AVERAGEX(Aylar, [Net Satış]) + 2 * STDEVX.P(Aylar, [Net Satış])</pre>
<p>Bu ölçüyü Analiz bölmesinde <b>Hata çubukları</b> ya da sabit çizgi ile göstermek, kuralı herkesin okuyabileceği bir yere taşır.</p>

<h2>Akıllı anlatı: Özel mod ile Copilot modu</h2>
<p>Görselleştirmeler bölmesindeki <b>Anlatı</b> (Narrative) görselinin iki modu var:</p>
<div class="tbl-wrap"><table><tr><th></th><th>Özel (Custom) mod</th><th>Copilot modu</th></tr>
<tr><td>Metni kim yazar?</td><td>Sen; içine dinamik değerler eklersin</td><td>Copilot, seçtiğin sayfa ya da görsellerden</td></tr>
<tr><td>Filtre değişince</td><td>Değerler kendiliğinden güncellenir</td><td>Okuyucu yenile düğmesine basmalı</td></tr>
<tr><td>Metni düzenlemek</td><td>Doğrudan</td><td>Doğrudan değil; komut (prompt) ile</td></tr>
<tr><td>Gereksinim</td><td>Ek lisans yok</td><td>Copilot açık kiracı, ücretli Fabric kapasitesi; deneme kapasitesi desteklenmez</td></tr>
<tr><td>Kaynak</td><td>Senin seçtiğin alan ve ölçüler</td><td>Tuvaldeki görseller (model değil); dipnotlar kaynağa götürür</td></tr></table></div>
<p>Özel modda “+ Değer” ile bir ölçü ya da alan seçer, özetleme ve biçim verirsin. Learn’e göre bu mod görsel başına en fazla 4, sayfa başına en fazla 16 özet üretir. Tablo, matris, özel görseller ve hesaplama grupları desteklenmez.</p>
<p>Copilot anlatısı tuvali okuduğu için görsel ve eksen adları açık yazılmalı; “Ölçü 1” adlı bir sütunu kimse doğru özetleyemez. Üretilen metni yayımlamadan önce dipnotlardan tek tek doğrula. Copilot’un modeli anlaması ve “Yapay zekâ için verileri hazırla” adımları için Copilot dersine bak; Soru-Cevap görseli Aralık 2026’da kaldırılacağı için yeni raporlarda yer vermiyoruz.</p>

<h2>Hangi araç ne zaman? Karar listesi</h2>
<ul>
<li>“Gelecek 6 ay ne olur?” → Tahmin (yalnızca çizgi; varsayımları başlığa yaz).</li>
<li>“Hangi ay sıra dışı?” → Anomaliler; yönetim raporunda açıklanabilir DAX bandı.</li>
<li>“Bu artış nereden geldi?” → Analiz et → Artışı açıkla; derinlemesine sorgu için ayrıştırma ağacı.</li>
<li>“Sayfayı iki cümleyle özetle” → Anlatı; sayılar kesin olmalıysa Özel mod.</li>
<li>Hiçbiri karar vermez: her bulguyu iş sahibine doğrulat.</li>
</ul>
`, ex: [
  { t: 'mc', q: 'Kanal göstergeli (Web, Mobil, Mağaza) aylık satış çizgisinde Analiz bölmesinde Anomaliler seçeneği kullanılamıyor. En olası neden ve çözüm?', o: ['Gösterge engeller; tek seri kullan', 'Anomaliler yalnızca sütun grafikte çalışır', 'Anomaliler için en az 24 ay gerekir', 'DirectQuery kaynaklarında hiç çalışmaz'], a: 0, why: 'Anomali algılama gösterge, birden çok değer ve ikincil değerle desteklenmez. Tek seriye indirmek ya da küçük katlara geçmek çözer. Özellik çizgi grafik içindir; en az 4 nokta yeter; DirectQuery’deki kısıt yalnızca bazı kaynaklar içindir.' },
  { t: 'mc', q: 'Aynı çizgi grafikte hem 6 aylık tahmin hem anomali işaretleri isteniyor. Ne yaparsın?', o: ['İkisini aynı grafikte açarım', 'Duyarlılığı düşürüp ikisini birlikte kullanırım', 'İki ayrı çizgi grafik kullanırım', 'Tahmini kapatıp ortalama çizgisi eklerim'], a: 2, why: 'Learn’e göre tahmin, ortalama, medyan, min/max ve yüzdebirlik çizgileri anomali algılamayla birlikte çalışmaz. İki ihtiyaç iki grafik ister. Ortalama çizgisi de anomaliyle birlikte kullanılamaz.' },
  { t: 'mc', q: 'Yönetici, sayfadaki anlatı metninin dilimleyici değişince kendiliğinden güncellenmesini ve sayıların biçiminin kesin olmasını istiyor. Hangisi?', o: ['Copilot modunda anlatı', 'Anlatı görselinin Özel modu', 'Görsel başlığına sabit metin', 'Soru-Cevap görseli'], a: 1, why: 'Özel modda dinamik değerler filtrelerle kendiliğinden güncellenir ve biçimleri yazar belirler. Copilot anlatısı okuyucunun yenilemesini ister ve metin doğrudan düzenlenemez. Sabit başlık güncellenmez; Soru-Cevap kaldırılıyor.' },
  { t: 'mc', q: 'Copilot anlatısı “Ölçü 3 en yüksek Sütun2’de” gibi anlamsız cümleler üretiyor. İlk bakacağın yer?', o: ['Fabric kapasitesinin boyutu', 'Anlatının dil ve bölge ayarı', 'Raporun tema dosyası ve renkleri', 'Görsel, eksen ve ölçü adları'], a: 3, why: 'Copilot anlatısı tuvaldeki görselleri okur; görsel başlıkları, eksen ve ölçü adları anlamsızsa metin de anlamsız olur. Kapasite ve tema içeriği etkilemez.' },
  { t: 'dax', name: 'Aylık Üst Bant', q: '<b>Aylık Üst Bant</b>: Görünen aylar (<code>VALUES(Tarih[YilAy])</code>) üzerinde aylık net satışın ortalamasına, aylık net satışın popülasyon standart sapmasının iki katını ekle.', sol: 'VAR Aylar = VALUES(Tarih[YilAy]) RETURN AVERAGEX(Aylar, [Net Satış]) + 2 * STDEVX.P(Aylar, [Net Satış])', hint: 'Ay listesini VAR ile bir kez al; AVERAGEX ve STDEVX.P aynı tabloyu kullansın.' }
] });

/* ------------------------------------------------------------------ */
ext('pq-orta', { min: 15, html: `
<h2>Birleştir mi, ekle mi? İlk karar</h2>
<p>Satış operasyonundan iki dosya geliyor: bayilerin Ocak satışları ve Şubat satışları. Bir de bayi listesi (bayi adı, bölge, açılış tarihi). Hangi dosya hangi işlemle gelir?</p>
<div class="tbl-wrap"><table><tr><th>Soru</th><th>İşlem</th><th>Sonuç</th></tr>
<tr><td>Aynı sütunlar, farklı dönem mi?</td><td>Ekle (Append)</td><td>Satır sayısı artar, sütunlar aynı kalır</td></tr>
<tr><td>Bir tabloya başka tablodan bilgi mi ekleniyor?</td><td>Birleştir (Merge)</td><td>Sütun sayısı artar; eşleşmeyen satır birleştirme türüne göre kalır ya da düşer</td></tr></table></div>
<p>Ocak + Şubat = Ekle. Satış + bayi bölgesi = Birleştir. Ama çoğu zaman birleştirmeye <b>hiç gerek yoktur</b>: bayi listesini ayrı bir boyut tablosu olarak yükleyip modelde ilişki kurmak, bölgeyi satış tablosuna kopyalamaktan daha temizdir. Birleştirmeyi; anahtar yoksa, iki kaynağı tek boyutta toplamak gerekiyorsa ya da bir arama tablosu modelde gereksiz kalacaksa kullan. Join türlerinin ayrıntısı ve birleştirme sonrası neden null geldiği Power Query ileri dersinde.</p>
<div class="tip"><b>“Yeni olarak” seçenekleri</b>Giriş → Sorguları Birleştir / Ekle düğmelerinin açılır okunda “Yeni olarak” seçenekleri var. Yeni olarak birleştirmek, mevcut sorguyu bozmadan üçüncü bir sorgu üretir; kaynak sorgular ara adım olarak kalır, yüklemelerini kapatırsın.</div>

<h2>Eklemede sütun adı uyuşmazlığı</h2>
<p>Ekleme sütunları <b>sırasına göre değil adına göre</b> eşler. Ocak dosyasında <code>Tutar</code>, Şubat dosyasında <code>Tutar TL</code> yazıyorsa sonuçta iki ayrı sütun oluşur: Ocak satırlarında <code>Tutar TL</code> null, Şubat satırlarında <code>Tutar</code> null. Toplam doğru gibi görünür ama her ölçü yarım çalışır. Önlem:</p>
<ul>
<li>Eklemeden önce her kaynakta sütunları aynı adla yeniden adlandır.</li>
<li>Eklemeden sonra sütun profilinde (Görünüm → Sütun profili) beklenmedik null oranına bak.</li>
<li>Klasörden birleştirmede örnek dosya dönüşümü tüm dosyalara uygulanır; adı farklı olan dosya bu dönüşümde hata verir ve sorun erken görünür.</li>
</ul>

<h2>Gruplandırmanın gelişmiş hâli</h2>
<p>Gruplandırma ölçütü iletişim kutusunda <b>Gelişmiş</b>’i seçince birden çok gruplama sütunu ve birden çok toplama ekleyebilirsin: aynı adımda bayi başına toplam tutar, satır sayısı ve en son tarih. İşlem listesindeki <b>Tüm satırlar</b> seçeneği ise her grubu iç içe bir tablo olarak tutar; sonra her grubun içinden “en son satır” ya da “en büyük tutar” gibi bir seçim yapmak için kullanılır. Ama dikkat: modelde ayrıntıyı tutup DAX ile toplamak çoğu zaman daha esnektir. Gruplandırmayı, ayrıntının modelde hiç gerekmediği durumlar (ör. günlük ham log’u saatlik özete indirmek) için sakla.</p>

<h2>Koşullu sütun ve arkasındaki M</h2>
<p>Sütun ekle → <b>Koşullu sütun</b>. Sihirbaz koşulları yukarıdan aşağı dener ve <b>ilk eşleşende durur</b>. Bu yüzden sıra önemlidir: “Tutar &gt; 1000 ise Büyük” koşulunu “Tutar &gt; 2000 ise Çok büyük” koşulunun üstüne yazarsan 2.040 TL’lik bayi satırı “Büyük” olur. En dar koşulu en üste koy. Sihirbaz arka planda şu M’yi yazar:</p>
<pre class="m">= Table.AddColumn(Kaynak, "Satış Bandı", each
    if [Tutar] = null then "Bilinmiyor"
    else if [Tutar] &gt; 2000 then "Çok büyük"
    else if [Tutar] &gt; 1000 then "Büyük"
    else "Normal", type text)</pre>
<p>null kontrolünü en başa koymak önemli: M’de bir tarafı null olan <code>&gt;</code> karşılaştırması false değil <b>null</b> döner; <code>if</code> koşulu null olunca hücre “null değeri Logical türüne dönüştürülemez” hatası verir. Kontrol başta olursa boş tutarlı satır hata yerine açıkça “Bilinmiyor” gibi bir etikete düşer.</p>

<h2>Hata yönetimi: adım hatası, hücre hatası</h2>
<p>Power Query’de iki tür hata görürsün:</p>
<ul>
<li><b>Adım düzeyi hata:</b> Sorgunun tamamı durur; ön izleme yerine sarı bir uyarı çıkar. Tipik neden: kaynak dosyanın yeri ya da bir sütunun adı değişmiş. Çözüm adımın formülünde.</li>
<li><b>Hücre düzeyi hata:</b> Tablo yüklenir ama bazı hücrelerde <code>Error</code> yazar. Tipik neden: “bilinmiyor” yazan bir tarih, “-” yazan bir tutar.</li>
</ul>
<p>Hücre hatalarında dört yol var; seçim, hatanın iş anlamına bağlı:</p>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Ne yapar?</th><th>Ne zaman?</th></tr>
<tr><td>Hataları kaldır</td><td>Satırı atar</td><td>Satır anlamsızsa (test kaydı)</td></tr>
<tr><td>Hataları değiştir</td><td>Hücreye sabit değer yazar (null, 0)</td><td>Satır değerli, alan boş kalabilir</td></tr>
<tr><td>Hataları koru (Keep errors)</td><td>Yalnızca hatalı satırları bırakır</td><td>Ayrı bir “denetim” sorgusu: kaynak sahibine gönderilecek liste</td></tr>
<tr><td><code>try … otherwise</code></td><td>Hata olursa yedek ifade</td><td>Birden çok olası biçim: önce bir yolu dene, olmazsa ötekini</td></tr></table></div>
<pre class="m">= Table.AddColumn(Kaynak, "Kayıt Tarihi", each
    try Date.FromText([KayitTarihi], [Culture = "tr-TR"]) otherwise null, type date)</pre>
<div class="warn"><b>Sessiz düzeltme tehlikesi</b>Hatayı 0 ile değiştirmek raporda “satış yok” gibi görünür; null ile değiştirmek ise “bilinmiyor” demektir. Tutar için 0 değil null tercih et ve hatalı satır sayısını bir denetim sorgusunda izle.</div>
`, ex: [
  { t: 'pq', src: 'bayi', pre: BAYI_A.concat(BAYI_B, BAYI_C), sol: [S('group', ['Şehir'], { name: 'Kayıt Sayısı', agg: 'count' })], q: '<b>Şehir başına kayıt say.</b> Temizlenmiş bayi tablosunu <code>Şehir</code>’e göre gruplandır ve her şehirdeki satır sayısını <code>Kayıt Sayısı</code> adlı sütunda hesapla. Ankara’nın iki kaydı olmalı.', hint: 'Şehir sütununu seç → Gruplandırma ölçütü: yeni sütun adı “Kayıt Sayısı”, işlem “Satırları say”.' },
  { t: 'pq', src: 'musteri', pre: MUS_A, sol: [S('type', ['KayitTarihi'], { to: 'date' }), S('replaceErr', ['KayitTarihi'], { v: 'null' })], q: '<b>Hatalı tarihi koru, değeri boşalt.</b> Müşteri tablosunda <code>KayitTarihi</code>’ni tarihe çevir. “2024-02-30” geçerli bir tarih olmadığı için Error olur. Müşteriyi kaybetmemek için satırı silme; hatayı <code>null</code> ile değiştir.', hint: 'KayitTarihi’ni seç → Veri türü: Tarih → Hataları değiştir: null yaz.' },
  { t: 'mc', q: 'Ocak dosyasında sütun adı <code>Tutar</code>, Şubat dosyasında <code>Tutar TL</code>. İki sorgu eklendikten sonra toplam satış yarı yarıya eksik çıkıyor. Neden?', o: ['Sütunlar adla eşlenir; iki ayrı sütun oluşur', 'Ekleme yalnızca ilk sorgunun satırlarını alır', 'Ekleme sayı sütunlarını metne çevirir', 'Ekleme yinelenen satırları kendiliğinden siler'], a: 0, why: 'Append sütunları adla eşler. Adlar farklıysa her biri ayrı sütun olur ve diğer dosyanın satırlarında null kalır; ölçü yalnızca birini toplar. Diğer şıklar Append’in davranışı değildir.' },
  { t: 'mc', q: 'Koşullu sütunda ilk koşul “Tutar > 1000 ise Büyük”, ikinci koşul “Tutar > 2000 ise Çok büyük”. 2.040 TL’lik satır “Büyük” çıkıyor. Neden?', o: ['Koşullu sütun yalnızca tam sayılarla çalışır', 'İlk doğru koşulda durulur', 'Tutar sütunu metin türünde kalmış', 'İkinci koşul “ve” ile bağlanmamış'], a: 1, why: 'Koşullu sütun (if … else if …) ilk doğru koşulda durur. 2.040 > 1000 olduğu için ikinci koşula hiç bakılmaz. En dar koşul en üste yazılır.' },
  { t: 'mc', q: 'Kaynak sistemden gelen tarihlerin bir kısmı hatalı. Veri sahibi her hafta hangi kayıtların bozuk olduğunu görmek istiyor. Ana sorguyu temiz tutarken ne yaparsın?', o: ['Ana sorguda hataları 0 ile değiştiririm', 'Ana sorguda hataları kaldırırım ve unuturum', 'Tarih sütununu metin bırakırım', 'Başvuru sorgusunda Hataları koru'], a: 3, why: 'Hataları koru yalnızca hatalı satırları bırakır; ana sorgudan başvuruyla türetilmiş bir denetim sorgusu, veri sahibine gönderilecek listeyi üretir. Hatayı 0 yapmak anlamı bozar; kaldırıp unutmak sorunu gizler; metin bırakmak modelde tarih işlemlerini engeller.' }
] });

/* ------------------------------------------------------------------ */
ext('pq-model', { min: 15, html: `
<h2>Sorgu katlama: nerede bozuluyor, nasıl görürsün?</h2>
<p>BT ekibi “Power BI yenilemesi veritabanını 40 dakika meşgul ediyor” diye şikâyet ediyor. İlk bakılacak yer sorgu katlamadır: adımların kaynağa tek bir SQL sorgusu olarak gidip gitmediği. Desktop’ta adıma sağ tıklayınca <b>Yerel Sorguyu Görüntüle</b> (View Native Query) etkinse o adıma kadar katlanıyordur; gri ise katlama o adımda ya da öncesinde bozulmuştur. Power Query Online’da (veri akışları, Fabric) her adımın yanında <b>katlama göstergesi</b> çıkar: katlanıyor, katlanmıyor, katlanabilir (ODBC/OData gibi bağlayıcılarda çalışma anında karar verilir), opak (belirsiz plan) ve bilinmiyor. Learn’e göre bu göstergeler yalnızca Power Query Online’da var.</p>
<div class="tbl-wrap"><table><tr><th>Genellikle katlanan</th><th>Genellikle katlamayı bozan</th></tr>
<tr><td>Sütun seçme/kaldırma, satır filtreleme, gruplandırma, aynı kaynaktaki tablolarla birleştirme, sıralama, basit tür değişimi</td><td>Dizin sütunu, <code>Text.Proper</code> gibi kaynağın bilmediği metin fonksiyonları, farklı kaynaklarla birleştirme, ilk N satırı tutmanın bazı biçimleri, özel M fonksiyonu çağrısı</td></tr></table></div>
<p>Kural: <b>katlanan adımları öne, katlanmayanları sona</b>. Filtreyi ve sütun seçimini kaynak adımının hemen arkasına koy; dizin sütunu ve metin güzelleştirme en sonda kalsın. Böylece katlanmayan adımlar veritabanında zaten küçülmüş veri üzerinde çalışır. Artımlı yenileme için RangeStart/RangeEnd filtresinin katlanması zorunludur; katlanmazsa her bölüm için tüm tablo okunur.</p>

<h2>Başvuru zincirinin gizli maliyeti</h2>
<p>Başvuru ile çoğaltma farkını gördün. Ekibin sık düştüğü yanılgı: “Ham satış sorgusunu bir kez okuyorum, Musteriler ve Urunler ondan türüyor; demek kaynak bir kez okunur.” Hayır. Yenilemede her yüklenen sorgu kendi zincirini değerlendirir; ham sorgu, ona başvuran her yüklenen sorgu için ayrıca çalışabilir. Önbellekleme bazı durumlarda tekrarı azaltır ama buna güvenme. Sonuçları:</p>
<ul>
<li>Bir API’ye ya da yavaş bir Excel’e üç başvuru, kaynağa birden çok istek demektir.</li>
<li>Ham sorgunun yüklemesini kapatmak onu yenilemeden çıkarmaz; başvuran sorgular onu yine çalıştırır.</li>
<li>Büyük ve yavaş kaynaklarda hazırlığı bir kez yapıp sonucu paylaşmak için veri akışı (dataflow) daha doğru araçtır.</li>
</ul>

<h2>Parametreleri derinleştirmek</h2>
<p>Giriş → Parametreleri Yönet → Yeni. Her parametrenin adı, açıklaması, gerekli olup olmadığı, türü, önerilen değerleri ve geçerli değeri vardır.</p>
<ul>
<li><b>Türü mutlaka seç.</b> “Herhangi” bırakılan bir tarih parametresi filtre adımında metin gibi davranır.</li>
<li><b>Önerilen değerler:</b> Herhangi bir değer, değer listesi (açılır liste + varsayılan değer) ya da bir liste döndüren sorgu. “Geliştirme / Test / Canlı” sunucu adları için değer listesi idealdir.</li>
<li><b>Sabitten parametreye:</b> Tek bir sabit döndüren sorguya sağ tık → <b>Parametreye dönüştür</b>.</li>
<li><b>Fonksiyona dönüştürmek:</b> Parametre kullanan bir sorguya sağ tık → <b>İşlev oluştur</b>. Sorgu, parametreyi argüman olarak alan özel bir fonksiyona dönüşür; klasördeki her dosyaya aynı dönüşümü uygulamanın temeli budur.</li>
<li>Filtre iletişim kutusunda değerin yanındaki tür düğmesinden <b>Parametre</b>’yi seçebilirsin; filtre sabit bir değer yerine parametreyi kullanır.</li>
</ul>

<h2>Sorgu bağımlılıkları görünümü</h2>
<p>Power Query Düzenleyicisi’nde <b>Görünüm → Sorgu Bağımlılıkları</b> (Query Dependencies), sorguları ve aralarındaki başvuruları bir diyagram olarak gösterir: hangi kaynaktan hangi ara sorgu, hangi ara sorgudan hangi tablo türüyor. Yüklemesi kapalı sorgular ayrıca işaretlenir. Kullanım alanları:</p>
<ul>
<li>Bir kaynağı değiştirmeden önce etkisini görmek: “Bu Excel’i silersem hangi tablolar bozulur?”</li>
<li>Yanlışlıkla yüklenen ara sorguları bulmak: yalnızca başka sorgulara hizmet eden bir düğüm modelde tablo olarak duruyorsa yüklemesini kapat.</li>
<li>Devir teslim: diyagramın ekran görüntüsü, model belgesinin en hızlı okunan sayfasıdır.</li>
</ul>

<h2>Yükleme ayarlarının kontrol listesi</h2>
<div class="tbl-wrap"><table><tr><th>Sorgu türü</th><th>Yüklemeyi etkinleştir</th><th>Rapor yenilemeye dahil et</th></tr>
<tr><td>Olgu ve boyut tabloları</td><td>Açık</td><td>Açık</td></tr>
<tr><td>Ham ve ara sorgular</td><td>Kapalı</td><td>Açık (başvuranlar zaten çalıştırır)</td></tr>
<tr><td>Parametreler ve fonksiyonlar</td><td>Kapalı (zaten tablo değil)</td><td>—</td></tr>
<tr><td>Hiç değişmeyen referans tablo (ör. eski bölge kodları)</td><td>Açık</td><td>Kapalı olabilir; kaynak değişirse elle yenile</td></tr></table></div>
<div class="warn"><b>Yüklemeyi kapatınca kaybolanlar</b>Yüklemesi açık bir sorgunun yüklemesini sonradan kapatırsan modeldeki tablo silinir; o tabloya dayanan ölçüler, ilişkiler ve görseller bozulur. Kapatmadan önce Sorgu Bağımlılıkları’na ve modeldeki kullanımlarına bak.</div>
`, ex: [
  { t: 'pq', src: 'hedef', pre: HEDEF_A, sol: [S('keepCols', ['Kategori']), S('distinct', ['Kategori'])], q: '<b>Uzun hedef tablosundan boyut türet.</b> Bu sorgunun ham hedef sorgusuna bir <b>başvuru</b> olduğunu düşün. Yalnızca <code>Kategori</code> sütununu tut ve yinelenenleri kaldır; sonuçta her kategori için tek satırlık bir boyut kalsın.', hint: 'Kategori’yi seç → Diğer sütunları kaldır → Yinelenenleri kaldır.' },
  { t: 'pq', src: 'bayi', pre: BAYI_A.concat(BAYI_B, BAYI_C), sol: [S('keepCols', ['Bayi', 'Şehir']), S('distinct', ['Bayi'])], q: '<b>Bayi boyutunu çıkar.</b> Temizlenmiş bayi satışlarından yalnızca <code>Bayi</code> ve <code>Şehir</code> sütunlarını tut. Kızılay Bayi iki kez geçiyor; <code>Bayi</code>’ye göre yinelenenleri kaldırarak her bayiye tek satır bırak.', hint: 'Bayi ve Şehir sütunlarını birlikte seç → Diğer sütunları kaldır. Sonra yalnızca Bayi’yi seçip Yinelenenleri kaldır.' },
  { t: 'mc', q: 'SQL kaynağındaki sorguda 8. adım dizin sütunu, 9. adım satır filtresi. Yenileme çok yavaş ve 9. adımda Yerel Sorguyu Görüntüle gri. En iyi ilk hamle?', o: ['Filtreyi dizin sütununun önüne taşımak', 'Dizin sütununu kaldırıp yerine gruplandırma eklemek', 'Sorguyu çoğaltıp iki parçaya bölmek', 'Gizlilik düzeyini Genel yapmak'], a: 0, why: 'Dizin sütunu katlamayı bozar; ondan sonraki filtre artık veritabanında değil Power Query’de, tüm veri üzerinde çalışır. Filtreyi öne almak satırları kaynakta azaltır. Çoğaltma ve gizlilik ayarı katlama sırasını düzeltmez.' },
  { t: 'mc', q: 'Yavaş bir API’den gelen ham sorguya üç ayrı tablo başvuruyor. Ekip “ham sorgunun yüklemesini kapattık, API artık bir kez çağrılır” diyor. Doğru mu?', o: ['Doğru; yüklemesi kapalı sorgu önbelleğe alınır', 'Doğru; başvurular yalnızca sonucu okur', 'Yanlış; ham sorgu yenilemeye hiç katılmaz', 'Yanlış; başvuranlar onu yeniden çalıştırır'], a: 3, why: 'Yüklemeyi kapatmak sorguyu modelden çıkarır ama başvuran yüklenen her sorgu onu kendi değerlendirmesinde yeniden çalıştırabilir. Paylaşılan tek bir sonuç gerekiyorsa veri akışı uygun araçtır.' },
  { t: 'mc', q: 'Geliştirme, test ve canlı ortam sunucu adları arasında hatasız geçiş yapmak istiyorsun. Parametreyi nasıl tanımlarsın?', o: ['Herhangi türünde, önerilen değer yok', 'Metin türü, değer listesiyle', 'Liste türünde, Power Query Online’da', 'Ondalık sayı türünde, geçerli değer boş'], a: 1, why: 'Değer listesi üç sunucu adını açılır liste olarak sunar ve yazım hatasını önler; tür Metin olmalıdır. Herhangi türü filtrelerde beklenmedik davranır; liste türündeki parametreler yalnızca Online’dadır ve tek değer seçimi için değildir.' }
] });

})(window);
