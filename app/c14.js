/* Kesit Power BI — dört yeni ders: hesaplanmış tablolar, dashboard kavramları, özel grafik teknikleri, ayrıştırma ağacı ve önemli etkileyenler. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- 1 · DAX Temelleri ---------- */
add('dax-tarih-metin', {
  id: 'hesap-tablolar', lv: 'A2', mod: 'DAX Temelleri', min: 20,
  title: 'Hesaplanmış tablolar: CALENDAR, GENERATESERIES, DATATABLE ve özet tablolar',
  sum: 'DAX ile modele kalıcı tablo eklemek: ne zaman hesaplanır, neden dilimleyiciye tepki vermez; parametre ve eşik tabloları, küçük arama tabloları, özet tablolar ve Power Query mi, ölçü mü kararı.',
  body: `
<p>Şimdiye kadar DAX ile iki şey yazdın: <b>ölçü</b> (bir sayı döndürür) ve <b>hesaplanmış sütun</b> (her satıra bir değer ekler). Üçüncü bir seçenek daha var: <b>hesaplanmış tablo (calculated table)</b>. Formül bir <b>tablo</b> döndürür ve bu tablo modele, içe aktarılmış bir tablo gibi eklenir. Ona ilişki kurabilir, sütunlarını dilimleyicide ya da eksende kullanabilirsin.</p>

<h2>Hesaplanmış tablo ne zaman hesaplanır?</h2>
<p>Desktop’ta <b>Tablo görünümü</b> ya da <b>Model görünümü</b> → <b>Hesaplamalar</b> grubu → <b>Yeni tablo (New table)</b>. Formül çubuğuna tablo döndüren bir ifade yazarsın:</p>
<pre class="dax">Kategori Özeti =
SUMMARIZECOLUMNS(
    Kategoriler[Kategori],
    "Satış", [Net Satış],
    "Hedef", [Hedef]
)</pre>
<p>Bu tablonun en önemli özelliği <b>ne zaman</b> hesaplandığıdır:</p>
<ul>
<li>Formülü yazdığında ya da değiştirdiğinde bir kez hesaplanır.</li>
<li>Beslendiği tablolardan biri <b>yenilendiğinde</b> yeniden hesaplanır.</li>
<li>Rapor açıkken, kullanıcı dilimleyiciye tıkladığında <b>hesaplanmaz</b>. Sonuç modelde saklanmış durur.</li>
</ul>
<p>Örnek: Yukarıdaki tabloda Elektronik satırının <code>Satış</code> değeri 339.303,65 ₺’dir (tüm yıllar, tüm kanallar). Sayfaya “Kanal = Web” dilimleyicisi koysan da bu sütun 339.303,65 kalır. Aynı tabloda <code>[Net Satış]</code> <b>ölçüsünü</b> bir görsele koyarsan Web seçiminde 130.786,85 ₺ görürsün. Fark şudur: ölçü sorgu anında, filtre bağlamına göre hesaplanır; hesaplanmış tablodaki sütun ise yenileme anının dondurulmuş sonucudur.</p>
<div class="note"><b>DirectQuery notu</b>Hesaplanmış tablo DirectQuery bir kaynaktan besleniyorsa kaynak değiştiğinde kendiliğinden güncellenmez; anlam modeli yenilendikten sonra değişikliği yansıtır.</div>

<h2>Tarih tabloları: CALENDAR ve CALENDARAUTO</h2>
<p>En yaygın hesaplanmış tablo tarih tablosudur. Nasıl kurulduğu, hangi sütunların ekleneceği ve “Tarih tablosu olarak işaretle” adımı <b>“Tarih tablosu”</b> dersinde. Burada yalnızca iki fonksiyonun farkını hatırlayalım:</p>
<ul>
<li><code>CALENDAR(başlangıç, bitiş)</code> verdiğin iki tarih arasındaki her günü üretir. <code>CALENDAR(DATE(2022,1,1), DATE(2024,12,31))</code> 1.096 satırdır.</li>
<li><code>CALENDARAUTO()</code> modeldeki tarih sütunlarına bakar, en küçük ve en büyük tarihi tam yıllara yuvarlar. İsteğe bağlı argüman mali yılın bittiği aydır: <code>CALENDARAUTO(6)</code> Temmuz–Haziran yılları üretir.</li>
</ul>
<pre class="dax" data-notry>Takvim = CALENDARAUTO()</pre>
<div class="warn"><b>CALENDARAUTO beklenmedik bir sütunu da görür</b>Bu modelde <code>Calisanlar[IseGiris]</code> 2015’ten başlıyor. Power BI’da CALENDARAUTO bu sütunu da hesaba katar ve takvim 2015-01-01’den başlar: 1.096 yerine 3.653 gün. Doğum tarihi, sözleşme bitiş tarihi gibi sütunlar takvimi on yıllarca uzatabilir. Aralığı bilerek seçmek için CALENDAR kullan.</div>

<h2>GENERATESERIES: parametre ve eşik tabloları</h2>
<p><code>GENERATESERIES(başlangıç, bitiş, adım)</code> tek sütunlu (<code>Value</code>) bir sayı dizisi üretir. Bu tablo bir dilimleyiciye konur, ölçü de seçilen değeri okur. Örnek soru: “Kargo hedefimiz kaç gün olmalı?” Mevcut <code>[Zamanında Teslim %]</code> ölçüsü eşiği 3 güne sabitlemiş. Eşiği kullanıcıya bırakalım:</p>
<pre class="dax">Teslim Eşiği =
GENERATESERIES(1, 7, 1)</pre>
<pre class="dax" data-notry>Eşik İçinde Teslim % =
VAR Esik = SELECTEDVALUE('Teslim Eşiği'[Value], 3)
RETURN
DIVIDE(
    CALCULATE(COUNTROWS(Satislar), Satislar[KargoGun] &lt;= Esik, NOT ISBLANK(Satislar[KargoGun])),
    CALCULATE(COUNTROWS(Satislar), NOT ISBLANK(Satislar[KargoGun]))
)</pre>
<p>Kargo günü bilinen satırlarda eşik 1 gün iken oran %29,6, 3 günde %60,2, 5 günde %87,2, 7 günde %94,2. Kullanıcı dilimleyiciyi kaydırdıkça kart değişir. Bu tablo modelde ilişkisizdir; yalnızca seçim taşır. Desktop’taki <b>Modelleme → Yeni parametre → Sayısal aralık</b> sihirbazı da arka planda aynı GENERATESERIES tablosunu ve bir SELECTEDVALUE ölçüsünü oluşturur (“Segmentasyon” dersindeki ne olur analizi).</p>

<h2>DATATABLE ve tablo oluşturucu: küçük arama tabloları</h2>
<p>Modelde olmayan küçük bir listeye ihtiyacın varsa (kanal sırası, durum grupları, eşik adları) iki yol var:</p>
<pre class="dax">Kanal Sırası =
DATATABLE(
    "Kanal", STRING,
    "Sira", INTEGER,
    {
        {"Mağaza", 1},
        {"Web", 2},
        {"Mobil", 3}
    }
)</pre>
<pre class="dax">Kanal Sırası 2 =
{ ("Mağaza", 1), ("Web", 2), ("Mobil", 3) }</pre>
<ul>
<li><b>DATATABLE</b> sütun adlarını ve türlerini (STRING, INTEGER, DOUBLE, CURRENCY, BOOLEAN, DATETIME) açıkça verir. Değerler sabit olmalıdır; içine ölçü ya da ifade yazamazsın.</li>
<li><b>Tablo oluşturucu</b> <code>{ (…), (…) }</code> daha kısadır ama sütunlar <code>Value1</code>, <code>Value2</code> adını alır ve tür otomatik seçilir. Anlamlı ad için <code>SELECTCOLUMNS</code> ile yeniden adlandır.</li>
<li>Tek sütunlu oluşturucu <code>{1, 2, 3}</code> bir <code>Value</code> sütunu üretir; ölçülerde <code>IN</code> ile de kullanılır.</li>
</ul>
<p>Kanal Sırası tablosunu <code>Satislar[Kanal]</code> ile ilişkilendirip <code>Kanal</code> sütununu <code>Sira</code>’ya göre sıralarsan grafikler Mağaza → Web → Mobil sırasıyla dizilir. Aynı işi Power Query’de <b>Giriş → Veri gir (Enter data)</b> ile de yapabilirsin; o tabloyu iş kullanıcısı arayüzden düzenleyebilir.</p>

<h2>Özet tablolar: SUMMARIZECOLUMNS ve ADDCOLUMNS</h2>
<p>Bir özet tablo, büyük bir olgu tablosunu daha kaba bir taneciğe indirir. İki kalıp:</p>
<pre class="dax">Yıl Kanal Özeti =
SUMMARIZECOLUMNS(
    Tarih[Yil],
    Satislar[Kanal],
    "Satış", [Net Satış]
)</pre>
<pre class="dax">Kanal Satışı =
ADDCOLUMNS(
    VALUES(Satislar[Kanal]),
    "Satış", [Net Satış]
)</pre>
<p>SUMMARIZECOLUMNS gruplamayı ve ölçüyü tek adımda yapar; tüm ölçülerin boş döndüğü satırları kendisi atar. ADDCOLUMNS ise elindeki tabloya sütun ekler; her satırda ölçü çağrıldığı için bağlam geçişi olur (“Bağlam geçişi” dersi). Aynı ifadeleri bir ölçünün içinde <b>sanal tablo</b> olarak da kullanabilirsin: tablo modele yazılmaz, ölçü her çalıştığında yeniden kurulur ve dilimleyiciye tepki verir.</p>
<pre class="dax">Hedefi Tutan Kategori Sayısı =
COUNTROWS(
    FILTER(
        ADDCOLUMNS(VALUES(Kategoriler[Kategori]), "G", [Hedef Gerçekleşme %]),
        [G] &gt;= 1
    )
)</pre>
<p>Bu ölçü 2023’te 3, 2024’te 1 döndürür (2024’te yalnızca Kitap: %100,2). Aynı mantığı hesaplanmış tabloyla yapsaydın yıl dilimleyicisi sonucu değiştirmezdi.</p>

<h2>Hesaplanmış tablo mu, Power Query mi, ölçü mü?</h2>
<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>En iyi yer</th><th>Neden?</th></tr>
<tr><td>Kaynaktan gelen veriyi temizlemek, birleştirmek</td><td>Power Query</td><td>Kaynağa yakın; sorgu katlama yapılabilir</td></tr>
<tr><td>İş kullanıcısının elle düzenleyeceği küçük liste</td><td>Power Query “Veri gir”</td><td>Formül bilmeden düzenlenir</td></tr>
<tr><td>Tarih tablosu, parametre tablosu, sabit sıralama listesi</td><td>Hesaplanmış tablo</td><td>Kısa formül; kaynak gerektirmez</td></tr>
<tr><td>Modeldeki başka tablolardan türeyen boyut (rol oynayan tarih kopyası gibi)</td><td>Hesaplanmış tablo</td><td>Model değiştikçe yenilemede kendini günceller</td></tr>
<tr><td>Dilimleyiciye göre değişmesi gereken her sonuç</td><td>Ölçü (sanal tablo)</td><td>Sorgu anında hesaplanır</td></tr>
</table></div>

<h2>Tuzaklar</h2>
<ul>
<li><b>Dilimleyiciye tepki yok:</b> “Seçili yıldaki ilk 5 ürün” gibi bir hesaplanmış tablo yazarsan seçim değiştiğinde liste değişmez. Bu iş bir ölçünün içinde TOPN ile yapılır.</li>
<li><b>Yenileme ve bellek maliyeti:</b> Tablo modelde saklanır ve sıkıştırılır. Tarih × ürün çaprazı (<code>CROSSJOIN</code>) bu modelde 1.096 × 40 = 43.840 satır; buna kanal da eklersen 131.520 satır olur. Büyük modelde bu, her yenilemede zaman ve bellek demektir.</li>
<li><b>Döngüsel bağımlılık (circular dependency):</b> Tablo A’dan türeyen bir hesaplanmış tabloyu A’ya ilişkiyle bağlarsan ya da A’ya, bu tabloyu okuyan bir hesaplanmış sütun eklersen Power BI “döngüsel bağımlılık algılandı” hatası verebilir. Boyutu olgudan türetiyorsan <code>VALUES</code> ve <code>ALL</code> yerine boş satıra bağımlı olmayan <code>DISTINCT</code> ya da <code>ALLNOBLANKROW</code> kullan; daha temiz yol boyutu Power Query’de kurmaktır.</li>
<li><b>Tekrarlanan mantık:</b> Bir özet tablo ile bir ölçü aynı sayıyı farklı tanımla hesaplıyorsa raporda iki “doğru” oluşur. Özet tablodaki sütunlar mümkünse hazır ölçüleri çağırsın.</li>
</ul>
<div class="tip"><b>Önce sorguda dene</b>Bir hesaplanmış tablo yazmadan önce aynı ifadeyi DAX sorgu görünümünde <code>EVALUATE</code> ile çalıştır. Satır sayısını ve değerleri gördükten sonra “Yeni tablo”ya yapıştır. Aşağıdaki alıştırmaların ilk üçü bu yüzden sorgu biçiminde.</div>
`,
  ex: [
    { t: 'query',
      q: 'Kargo eşiği tablosunu sorguyla kur: <code>GENERATESERIES(1, 7, 1)</code> ile 1–7 gün eşiklerini üret ve her eşik için, kargo günü boş olmayan satırlar içinde <code>Satislar[KargoGun]</code> değeri o eşiğe eşit ya da küçük olanların oranını yeni bir sütun olarak ekle. Sonuç 7 satır, 2 sütun olmalı.',
      start: 'EVALUATE\n',
      sol: 'EVALUATE\nADDCOLUMNS(GENERATESERIES(1, 7, 1), "Oran", VAR Esik = [Value] RETURN DIVIDE(CALCULATE(COUNTROWS(Satislar), Satislar[KargoGun] <= Esik, NOT ISBLANK(Satislar[KargoGun])), CALCULATE(COUNTROWS(Satislar), NOT ISBLANK(Satislar[KargoGun]))))',
      hint: 'ADDCOLUMNS(GENERATESERIES(1, 7, 1), "Oran", VAR Esik = [Value] RETURN DIVIDE(...)). Pay: CALCULATE(COUNTROWS(Satislar), Satislar[KargoGun] <= Esik, NOT ISBLANK(Satislar[KargoGun])). Payda aynı ifadenin eşiksiz hâli.' },
    { t: 'query',
      q: '2024 için bir kategori özet tablosu döndür: her kategori, o kategorinin [Net Satış] ve [Hedef] değeri. Yalnızca 2024 verisi hesaba girsin. Sonuç 7 satır, 3 sütun olmalı.',
      start: 'EVALUATE\n',
      sol: 'EVALUATE\nSUMMARIZECOLUMNS(Kategoriler[Kategori], TREATAS({2024}, Tarih[Yil]), "Satış", [Net Satış], "Hedef", [Hedef])',
      hint: 'SUMMARIZECOLUMNS(Kategoriler[Kategori], <filtre tablosu>, "Satış", [Net Satış], "Hedef", [Hedef]). Filtre için TREATAS({2024}, Tarih[Yil]) ya da FILTER(ALL(Tarih[Yil]), Tarih[Yil] = 2024) kullanabilirsin.' },
    { t: 'query',
      q: 'Tablo oluşturucuyla <code>{ ("Mağaza", 1), ("Web", 2), ("Mobil", 3) }</code> küçük bir kanal listesi kur ve her satıra o kanalın [Net Satış] değerini ekle. Sonuç 3 satır, 3 sütun olmalı.',
      start: 'EVALUATE\n',
      sol: 'EVALUATE\nADDCOLUMNS({ ("Mağaza", 1), ("Web", 2), ("Mobil", 3) }, "Satış", VAR K = [Value1] RETURN CALCULATE([Net Satış], Satislar[Kanal] = K))',
      hint: 'Oluşturucunun sütunları [Value1] ve [Value2] adını alır. ADDCOLUMNS(..., "Satış", VAR K = [Value1] RETURN CALCULATE([Net Satış], Satislar[Kanal] = K)).' },
    { t: 'dax', name: 'Hedefi Tutan Kategori',
      q: '<b>Hedefi Tutan Kategori</b>: Bağlamdaki kategorilerden kaçının [Hedef Gerçekleşme %] değeri 1 ya da üstünde? Kategorileri ve gerçekleşmelerini sanal bir tabloda topla, koşulu sağlayanları say.',
      sol: 'COUNTROWS(FILTER(ADDCOLUMNS(VALUES(Kategoriler[Kategori]), "G", [Hedef Gerçekleşme %]), [G] >= 1))',
      hint: 'ADDCOLUMNS(VALUES(Kategoriler[Kategori]), "G", [Hedef Gerçekleşme %]) sanal tabloyu kurar. FILTER ile [G] >= 1 olanları al, COUNTROWS ile say.' },
    { t: 'dax', name: 'En Güçlü Kanal Satışı',
      q: '<b>En Güçlü Kanal Satışı</b>: Bağlamdaki kanalların her biri için [Net Satış] hesapla ve bunların en büyüğünü döndür. Kategori ya da yıl değiştikçe en güçlü kanalın satışı görünmeli.',
      sol: 'MAXX(ADDCOLUMNS(VALUES(Satislar[Kanal]), "S", [Net Satış]), [S])',
      hint: 'MAXX bir tablo üzerinde döner: MAXX(ADDCOLUMNS(VALUES(Satislar[Kanal]), "S", [Net Satış]), [S]). Kısa yolu MAXX(VALUES(Satislar[Kanal]), [Net Satış]) da aynı sonucu verir.' },
    { t: 'mc', q: 'Bir hesaplanmış tablo, kategori başına net satışı tutuyor. Kullanıcı sayfadaki Yıl dilimleyicisinde 2024’ü seçiyor. Tablodaki satış sütunu ne olur?',
      o: ['Değişmez; yenilemede hesaplanmıştır', '2024 değerleriyle yeniden hesaplanır', 'Boşalır, çünkü tabloda yıl sütunu yok', 'Bir sonraki tıklamada güncellenir'], a: 0,
      why: 'Hesaplanmış tablolar formül değiştiğinde ya da kaynak tablolar yenilendiğinde hesaplanır. Dilimleyici seçimleri yalnızca ölçüleri yeniden hesaplatır.' },
    { t: 'mc', q: 'Kullanıcının dilimleyiciyle 1–7 gün arasında bir kargo eşiği seçmesini istiyorsun. Hangi kurulum doğru?',
      o: ['Satislar’a eşik için hesaplanmış bir sütun eklemek', 'Her eşik için ayrı bir ölçü yazıp yedi kart koymak', 'Eşikleri Satislar[KargoGun] sütunundan seçtirmek', 'GENERATESERIES tablosu + SELECTEDVALUE ölçüsü'], a: 3,
      why: 'İlişkisiz bir GENERATESERIES tablosu seçimi taşır, ölçü SELECTEDVALUE ile okur. KargoGun’dan seçim yapmak satırları süzer; eşik mantığı kurmaz.' },
    { t: 'mc', q: 'İş biriminin her ay kendisinin güncelleyeceği 6 satırlık bir “bölge sorumlusu” listesi gerekiyor. En uygun yer neresi?',
      o: ['Power Query’de Veri gir', 'DATATABLE hesaplanmış tablosu', 'Bir ölçünün içinde sanal tablo', 'Tablo oluşturucu { } içeren sütun'], a: 0,
      why: 'Veri gir tablosu Power Query arayüzünden formül bilmeden düzenlenir. DATATABLE da çalışır ama her değişiklik DAX düzenlemesi ister; ölçü içindeki sanal tablo ise modelde görünmez.' }
  ]
});

/* ---------- 2 · Görselleştirme ---------- */
add('rapor-brifi', {
  id: 'dashboard-kavramlar', lv: 'A2', mod: 'Görselleştirme', min: 20,
  title: 'Dashboard kavramları: KPI, hedef ve gösterge türleri',
  sum: 'Metrik, KPI ve OKR farkı; öncü ve gecikmeli göstergeler; operasyonel, analitik, stratejik ve taktik dashboard türleri; Gestalt ilkeleri ve ters piramit düzeni; süssüz ama ilgi çeken tasarım; kullanım ölçümleriyle benimsenmeyi izlemek.',
  body: `
<p>“Talepten rapor brifine” dersinde talep sahibiyle konuşup KPI’ları yazdın. Bu ders o konuşmanın sözlüğünü veriyor: hangi sayı KPI’dır, hangisi yalnızca bir metriktir, hangi gösterge geleceği haber verir ve bir dashboard kime göre nasıl kurulur? Somut bir tasarım örneği “Dashboard tasarımı: bir vaka çalışması” dersinde.</p>

<h2>Metrik, KPI, OKR</h2>
<div class="tbl-wrap"><table>
<tr><th>Kavram</th><th>Tanım</th><th>Bu modelde örnek</th></tr>
<tr><td><b>Metrik (metric)</b></td><td>Ölçülebilen herhangi bir sayı.</td><td>Sipariş sayısı, ortalama kargo günü, ziyaretçi sayısı</td></tr>
<tr><td><b>KPI (anahtar performans göstergesi)</b></td><td>Bir hedefe bağlanmış ve karar için seçilmiş az sayıdaki metrik. Hedefi, eşiği ve sahibi vardır.</td><td>Net satış hedef gerçekleşmesi: 2024’te 747.065,70 ₺ / 763.200 ₺ = %97,9</td></tr>
<tr><td><b>OKR (hedef ve anahtar sonuçlar)</b></td><td>Bir hedef cümlesi (Objective) ve onu ölçen 2–4 anahtar sonuç (Key Results). Genelde çeyreklik, iddialı.</td><td>Hedef: “Web kanalını kârlı büyütmek.” Anahtar sonuç: “Sepete ekleme oranı %28’den %32’ye.”</td></tr>
</table></div>
<p>Kural: Her KPI bir metriktir ama her metrik KPI değildir. Bir dashboard’da 30 KPI varsa aslında hiç KPI yoktur; yalnızca metrik listesi vardır. Yöneticiye dönük bir sayfada 3–6 KPI yeterlidir.</p>
<p>Bir KPI kartı üç parçadan oluşur: <b>değer</b>, <b>karşılaştırma</b> (hedef ya da geçen yıl) ve <b>durum</b> (iyi / izlenmeli / kötü). Durumu metinle değil sayısal bir kodla üreten bir ölçü, renk, simge ve sıralama için tek kaynak olur (alıştırma 1).</p>

<h2>Öncü ve gecikmeli göstergeler</h2>
<ul>
<li><b>Gecikmeli gösterge (lagging indicator):</b> Sonucu ölçer, olaydan sonra gelir. Net satış, kâr, müşteri kaybı. “Ne oldu?” sorusunu cevaplar; değiştirmek için geç kalmışsındır.</li>
<li><b>Öncü gösterge (leading indicator):</b> Sonucu önceden haber veren davranışı ölçer. Sepete ekleme oranı, yeni müşteri sayısı, web ziyaretçisi. Bugün hareket edersen yarının sonucu değişir.</li>
</ul>
<p>Bu modelde web hunisi Ekim–Kasım 2024’ü kapsıyor. Ziyaret adımındaki 900 ziyaretçinin 254’ü sepete ekledi (%28,2), 88’i satın aldı (%9,8). Kaynaklara göre bakınca E-posta’dan gelenlerde sepete ekleme %36,3, Reklam’dan gelenlerde %20,9. Satış gerçekleşmeden önce, sepete ekleme oranı hangi kaynağın daha verimli olduğunu gösteriyor. Yeni müşteri sayısı da öncü bir göstergedir: 2022’de 32, 2023’te 45, 2024’te 59.</p>
<div class="tip"><b>İkisini eşleştir</b>Her gecikmeli KPI’ın yanına onu besleyen bir öncü gösterge koy: “Net satış” kartının yanında “Sepete ekleme oranı”, “Müşteri kaybı”nın yanında “90 gündür alışveriş yapmayan müşteri”. Okuyucu hem sonucu hem de yarının işaretini görür.</div>

<h2>Dashboard türleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Kullanıcı</th><th>Soru</th><th>Ne gerekir?</th></tr>
<tr><td><b>Stratejik</b></td><td>Üst yönetim</td><td>“Yıllık hedefe göre neredeyiz?”</td><td>Az KPI, uzun dönem eğilim, hedef ve geçen yıl karşılaştırması; aylık güncelleme yeterli</td></tr>
<tr><td><b>Taktik</b></td><td>Bölüm yöneticisi</td><td>“Bu çeyrek hangi kategori geride, ne yapmalı?”</td><td>Hedef sapması, kategori ve bölge kırılımı, bir sonraki adıma geçiş</td></tr>
<tr><td><b>Operasyonel</b></td><td>Saha ekibi, depo</td><td>“Bugün hangi sipariş gecikiyor?”</td><td>Sık yenileme, liste ve uyarı, eşik renkleri, az grafik</td></tr>
<tr><td><b>Analitik</b></td><td>Analist</td><td>“Neden iade arttı?”</td><td>Esnek filtre, detaya inme, dağılım ve yapay zekâ görselleri, ayrıntı tablosu</td></tr>
</table></div>
<p>Bir sayfa iki türü birden taşımaya çalışınca ikisini de kötü yapar. Stratejik bir sayfaya 40 satırlık bir sipariş listesi eklemek yerine detay sayfasına geçiş koy.</p>

<h2>Gestalt ilkeleri ve düzen</h2>
<p>Gestalt ilkeleri, gözün ayrı öğeleri nasıl <b>grup</b> olarak algıladığını anlatır. Dashboard’da “bu kutular birbirine ait” mesajını kenarlıksız verebilirsin:</p>
<ul>
<li><b>Yakınlık (proximity):</b> Birbirine yakın öğeler grup sayılır. Satış kartı ile hedef kartı yan yana, kargo kartı biraz uzakta olsun.</li>
<li><b>Benzerlik (similarity):</b> Aynı renk ya da şekil aynı anlamı taşır. “Hedef” her grafikte aynı gri kesikli çizgi olsun.</li>
<li><b>Çevreleme (enclosure):</b> Hafif bir arka plan dikdörtgeni içindeki görselleri tek bölüm yapar. Satış bölümü ve operasyon bölümü ayrı zeminlerde dursun.</li>
<li><b>Süreklilik (continuity):</b> Göz bir çizgiyi izler. Aynı x eksenini paylaşan grafikleri alt alta hizala; okuyucu ayı yukarıdan aşağı takip eder.</li>
</ul>
<p>Tasarımcıların dört temel kuralı da aynı sonuca götürür: <b>karşıtlık (contrast)</b> önemli sayıyı büyük ve koyu yapar; <b>tekrar (repetition)</b> aynı yazı tipi, renk ve kart biçimini her sayfada kullanır; <b>hizalama (alignment)</b> görselleri ortak bir ızgaraya oturtur; <b>yakınlık</b> ilgili öğeleri toplar, ilgisizleri ayırır.</p>

<h2>Ters piramit: özet, eğilim, ayrıntı</h2>
<p>Gazetecilikte en önemli bilgi ilk cümlededir. Dashboard’da da aynı sıra işler:</p>
<ol>
<li><b>Üstte özet:</b> KPI kartları. “İyi mi, kötü mü?” sorusu 5 saniyede cevaplanır.</li>
<li><b>Ortada eğilim ve karşılaştırma:</b> Aylık seri, hedef çizgisi, kategori sıralaması. “Ne zaman, nerede?”</li>
<li><b>Altta ya da başka sayfada ayrıntı:</b> Tablo, ürün listesi, detay sayfası. “Hangi kayıtlar?”</li>
</ol>
<p>Okuyucu yukarıdan aşağı indikçe soru daralır, ayrıntı artar. Kullanıcı her katmanda durabilir; çoğu yönetici ilk katmanda durur.</p>

<h2>İlgi çeken ama süssüz tasarım</h2>
<p>Duygusal ve ilgi çekici tasarım süs demek değildir. Gereksiz 3B efekt, gölge, arka plan resmi ve dekoratif simgeler (<b>chartjunk</b>) okuyucunun dikkatini veriden çalar. İlgiyi şunlarla kazan:</p>
<ul>
<li><b>Bulgu başlığı:</b> “Kategoriye göre satış” değil, “2024’te Hediye hedefin %16 gerisinde”.</li>
<li><b>Kitlenin dili:</b> Ölçü adları yerine iş terimleri (“Net satış”, “İade oranı”).</li>
<li><b>Tek vurgu rengi</b> ve anlamlı simgeler (▲ ▼). Rengin anlamı her sayfada aynı.</li>
<li><b>Karşılaştırma:</b> Tek başına sayı duygu uyandırmaz; “geçen yıla göre %86,4 büyüme” uyandırır.</li>
</ul>

<h2>Benimsenmeyi ölçmek: kullanım ölçümleri</h2>
<p>Bir dashboard kullanılmıyorsa başarısızdır, ne kadar güzel olursa olsun. Power BI hizmetinde rapor açıkken <b>Diğer seçenekler (…) → Kullanım ölçümlerini aç (Open usage metrics)</b>; ya da çalışma alanı listesinde raporun yanındaki <b>…</b> → <b>Kullanım ölçümleri raporunu görüntüle</b>.</p>
<ul>
<li>Rapor son <b>90 günü</b> gösterir ve günde bir güncellenir; veri 24 saate kadar gecikebilir.</li>
<li>Görüntüleme sayısı, tekil görüntüleyen, kullanıcı başına görüntüleme, sayfa bazında görüntüleme ve platform (tarayıcı ya da mobil) gibi ölçümler içerir.</li>
<li>Raporu görmek için içerikte <b>düzenleme iznin</b> olmalı ve yöneticinin ilgili kiracı ayarını açık bırakmış olması gerekir. Kişisel çalışma alanında (My workspace) çalışmaz.</li>
<li>Raporu kopyalayıp filtre bölmesindeki rapor filtresini kaldırırsan çalışma alanındaki tüm raporların kullanımını görürsün. Yeni sürüm önizlemede, raporun üstündeki anahtarla açılır.</li>
</ul>
<p>Hangi sayfa hiç açılmıyor? Kullanıcıların çoğu ilk sayfada mı kalıyor? Bu sorular bir sonraki sürümün brifini yazar.</p>

<h2>Dashboard kontrol listesi</h2>
<ol>
<li>Sayfanın türü (stratejik, taktik, operasyonel, analitik) ve kullanıcısı tek cümleyle yazılabiliyor mu?</li>
<li>Her KPI’ın hedefi, eşiği ve sahibi var mı? Metriklerden ayrılmış mı?</li>
<li>Her gecikmeli KPI’ın yanında en az bir öncü gösterge var mı?</li>
<li>Sıra özet → eğilim → ayrıntı mı?</li>
<li>Gruplar yakınlık ve çevrelemeyle mi kurulmuş, kenarlık kalabalığıyla mı?</li>
<li>Süs öğesi kaldırıldığında mesaj kayboluyor mu? Kaybolmuyorsa o öğe gereksizdir.</li>
<li>Yayımladıktan bir ay sonra kullanım ölçümlerine bakma tarihi takvimde mi?</li>
</ol>
`,
  ex: [
    { t: 'dax', name: 'Hedef Durum Kodu',
      q: '<b>Hedef Durum Kodu</b>: KPI kartlarında renk ve simge için sayısal bir durum kodu üret. [Hedef Gerçekleşme %] boşsa BLANK, 1 ya da üstündeyse 1, 0,95 ya da üstündeyse 0, değilse -1 döndür.',
      sol: 'VAR O = [Hedef Gerçekleşme %] RETURN SWITCH(TRUE(), ISBLANK(O), BLANK(), O >= 1, 1, O >= 0.95, 0, -1)',
      hint: 'VAR O = [Hedef Gerçekleşme %] RETURN SWITCH(TRUE(), ISBLANK(O), BLANK(), O >= 1, 1, O >= 0.95, 0, -1). Koşullar yukarıdan aşağı denenir; önce BLANK kontrolü.' },
    { t: 'dax', name: 'Sepete Ekleme Oranı',
      q: '<b>Sepete Ekleme Oranı</b>: Öncü gösterge olarak, “Sepete ekleme” adımına ulaşan ziyaretçi sayısını ([Ziyaretçi], WebOlaylari[Adim] = "Sepete ekleme") ilk adımdaki ziyaretçi sayısına (WebOlaylari[AdimNo] = 1) böl.',
      sol: 'DIVIDE(CALCULATE([Ziyaretçi], WebOlaylari[Adim] = "Sepete ekleme"), CALCULATE([Ziyaretçi], WebOlaylari[AdimNo] = 1))',
      hint: 'İki CALCULATE: pay WebOlaylari[Adim] = "Sepete ekleme", payda WebOlaylari[AdimNo] = 1 filtresiyle [Ziyaretçi]. DIVIDE ile böl.',
      grid: [{ t: 'WebOlaylari', c: 'Kaynak' }, { t: 'WebOlaylari', c: 'Cihaz' }] },
    { t: 'mc', q: 'Aşağıdakilerden hangisi bir <b>öncü</b> göstergedir?',
      o: ['Geçen çeyreğin brüt kârı', 'Sepete ekleme oranı', 'Yıllık müşteri kaybı sayısı', 'Kapanmış ayın net satışı'], a: 1,
      why: 'Sepete ekleme satın almadan önce gerçekleşir ve yakın gelecekteki satışı haber verir. Diğerleri olmuş bitmiş sonuçları ölçen gecikmeli göstergelerdir.' },
    { t: 'mc', q: 'Depo ekibi, bugün kargoya verilmesi gereken ama hâlâ bekleyen siparişleri görmek istiyor. Bu hangi dashboard türüdür?',
      o: ['Stratejik dashboard', 'Analitik dashboard', 'Operasyonel', 'Taktik dashboard'], a: 2,
      why: 'Günlük, eyleme dönük, sık yenilenen liste ve uyarılar operasyonel dashboard’un işidir. Stratejik sayfa uzun dönem hedefe, analitik sayfa “neden” sorusuna bakar.' },
    { t: 'mc', q: 'Satış kartları ile kargo kartlarını kenarlık çizmeden iki ayrı grup gibi göstermek istiyorsun. En sade yol hangi Gestalt ilkesidir?',
      o: ['Grupların arasını açmak (yakınlık)', 'Her karta farklı bir renk vermek', 'Kartları dairesel düzene yerleştirmek', 'Her kartın başlığını büyük harf yapmak'], a: 0,
      why: 'Yakınlık ilkesine göre birbirine yakın öğeler grup algılanır. Gruplar arasına boşluk koymak kenarlık ve renk kalabalığı olmadan ayrımı yapar.' },
    { t: 'mc', q: 'Ters piramit düzeninde bir yönetici sayfasının en üstünde ne bulunmalı?',
      o: ['Ürün düzeyinde ayrıntı tablosu', 'Aylık seri ve hedef çizgisi', 'Tüm dilimleyiciler ve filtreler', 'Hedefe göre durumlu KPI kartları'], a: 3,
      why: 'Ters piramitte en önemli bilgi en üstte durur: “iyi mi, kötü mü?” sorusunu cevaplayan KPI’lar. Eğilim ortada, ayrıntı altta ya da detay sayfasında.' },
    { t: 'mc', q: 'Yayımladığın raporun hangi sayfalarının açıldığını görmek istiyorsun. Power BI hizmetinde nereye bakarsın?',
      o: ['Raporun … menüsü → Kullanım ölçümlerini aç', 'Desktop’ta Görünüm → Performans Analizi', 'Raporun Dışa aktar → PDF olarak indir', 'Çalışma alanı → Ayarlar → Lisans türü'], a: 0,
      why: 'Kullanım ölçümleri raporu son 90 günün görüntüleme, görüntüleyen ve sayfa bazında kullanım bilgisini verir. Performans Analizi yalnızca görsellerin yüklenme süresini ölçer.' }
  ]
});

/* ---------- 3 · Görselleştirme ---------- */
add('gorsel-algi', {
  id: 'ozel-gorseller', lv: 'B1', mod: 'Görselleştirme', min: 24,
  title: 'Özel grafik teknikleri: şelale, huni, gösterge, tornado, harita ve özel görseller',
  sum: 'Standart çubuk ve çizginin yetmediği sorular: şelale ile köprü, huni ile adım kaybı, gösterge ve KPI görselinin yeri, negatif ölçüyle tornado, hedef çubuğu, ağaç haritası, şerit grafik, haritalar, Analiz bölmesi çizgileri ve AppSource görselleri.',
  body: `
<p>Çoğu soruyu sıralı bir çubuk ya da bir çizgi grafik cevaplar. Bu derste, belirli bir soru tipine özel görselleri ve Power BI’da hazır olmayan iki kalıbı (tornado ve hedef çubuğu) yerleşik görsellerle kurmayı öğreneceksin. Gösterge ve KPI görselinin kurulumu “Koşullu biçimlendirme ve KPI’lar”, algı açısından değerlendirmesi “Görsel algı” dersinde.</p>

<h2>Şelale (waterfall): bir sayıdan diğerine köprü</h2>
<p>Soru: “Net satış 2023’te 400.869,55 ₺ idi, 2024’te 747.065,70 ₺ oldu. Bu 346.196,15 ₺’lik artış nereden geldi?” Şelale grafiği başlangıç ve bitiş sütununu yatay eksenden başlatır, aradaki katkıları havada yüzen sütunlar olarak çizer; artışlar ve azalışlar farklı renklidir.</p>
<ul>
<li><b>Kategori</b> kutusuna <code>Tarih[Yil]</code>, <b>Y ekseni</b>ne <code>[Net Satış]</code>, <b>Ayrıntı (Breakdown)</b> kutusuna <code>Kategoriler[Kategori]</code> koy ve yıl filtresinde 2023 ile 2024’ü bırak. Grafik 2023 sütunundan 2024 sütununa giden köprüyü kategorilere böler.</li>
<li>Katkılar: Elektronik +100.284,95 ₺, Ev &amp; Yaşam +77.168,20 ₺, Kitap +50.451,60 ₺, Kozmetik +44.635,15 ₺, Giyim +41.587,70 ₺, Spor +28.038,55 ₺, Hediye +4.030 ₺.</li>
<li><b>Biçim → Ayrıntı → En fazla ayrıntı sayısı (Maximum breakdowns)</b> kaç katkının ayrı gösterileceğini belirler; mutlak değere göre en büyükler ayrı çizilir, kalanlar “Diğer” olur. Beşte bırakırsan Spor ve Hediye 32.068,55 ₺’lik tek bir “Diğer” sütununda birleşir.</li>
</ul>
<p>İkinci yol: Kategori kutusuna kategorileri, Y eksenine bir <b>fark ölçüsü</b> koymak (alıştırma 2). Yılı 2024’e süzersen yedi artış sütunu ve sonda 346.196,15 ₺’lik toplam görünür. Ölçü negatif de olabilir; şelale azalışları otomatik aşağı çizer.</p>

<h2>Huni (funnel): adım adım kayıp</h2>
<p>Huni, sıralı adımlardan oluşan bir sürecin her adımında kalan miktarı gösterir. Web hunisinde (Ekim–Kasım 2024): Ziyaret 900 → Ürün görüntüleme 640 → Sepete ekleme 254 → Ödeme 137 → Satın alma 88. <b>Kategori</b>: <code>WebOlaylari[Adim]</code>, <b>Değerler</b>: <code>[Ziyaretçi]</code>. Adımları <code>AdimNo</code>’ya göre sırala; aksi hâlde huni alfabetik ya da büyüklüğe göre dizilir. Araç ipucu her adım için ilk adıma göre yüzdeyi verir; önceki adıma göre yüzde için hazır <code>[Önceki Adıma Göre %]</code> ölçüsünü araç ipucuna ekle.</p>
<div class="warn"><b>Huni sıralı süreç ister</b>Kategorilerin satışını huniye koymak (en büyükten en küçüğe) bir süreç anlatmaz; okuyucu “Elektronik’ten Kitap’a kaç kişi geçti?” diye yanlış okur. Sıralı adım yoksa sıralı çubuk kullan.</div>

<h2>Gösterge ve KPI görseli: ne zaman, hangi ayarla?</h2>
<p><b>Gösterge (gauge)</b> tek bir değeri bir hedefe ve bir aralığa göre gösterir; kutuları <b>Değer, En küçük değer, En büyük değer, Hedef değer</b>. Tuzak, en büyük değerin otomatik seçilmesidir: aralık değişince aynı oran farklı “doluluk” gibi görünür. Maksimumu bir ölçüye bağla: 2024’te net satış ile hedefin büyüğü 763.200 ₺, bunun %10 fazlası bine yuvarlanınca 840.000 ₺ (alıştırma 3). Gösterge, filtre değişse de ölçeğini mantıklı tutar.</p>
<p><b>KPI görseli</b> değer, hedef ve bir eğilim eksenini birlikte ister. Eğilim ekseni (ör. <code>Tarih[YilAy]</code>) olmadan anlamı azalır. Birden çok KPI için yeni kart görseli ve referans etiketleri daha az yer kaplar.</p>

<h2>Tornado (kelebek) grafik: iki yönlü çubuk</h2>
<p>İki grubu aynı kategorilerde karşılaştırmak için çubukları ortadaki sıfır çizgisinin iki yanına çizersin. Power BI’da hazır bir tornado görseli yok; <b>yığılmış çubuk grafik (stacked bar)</b> ve bir <b>negatif ölçü</b> ile kurulur:</p>
<pre class="dax">Kadın Satışı (Sol) =
-CALCULATE([Net Satış], Musteriler[Cinsiyet] = "Kadın")</pre>
<pre class="dax">Erkek Satışı (Sağ) =
CALCULATE([Net Satış], Musteriler[Cinsiyet] = "Erkek")</pre>
<ol>
<li>Y eksenine <code>Musteriler[YasGrubu]</code>, X eksenine iki ölçüyü koy. Sol ölçü negatif olduğu için sola uzar.</li>
<li>Etiketlerde ve eksende eksi işaretini gizlemek için sol ölçünün biçim dizesini <code>#,0;#,0</code> yap: noktalı virgülün sağı negatif sayının nasıl yazılacağını belirler.</li>
<li>Y eksenini yaş sırasına göre sırala (bir sıra sütunu ya da “Sütuna göre sırala”).</li>
</ol>
<p>Tüm yıllarda 55+ grubunda kadın müşteriler 229.892,10 ₺, erkek müşteriler 133.129,30 ₺; 25–34 grubunda ise tablo tersine döner: 127.839,85 ₺ ile 165.068 ₺. Tornado bu “hangi tarafa yatıyor?” farkını tek bakışta gösterir.</p>

<h2>Hedef çubuğu (bullet tarzı)</h2>
<p>Bullet grafik, bir çubuğun üstünde hedefi küçük bir dikey çizgiyle gösterir. Power BI’da yerleşik bir bullet grafik yok; AppSource’ta özel görseller var. Yerleşik seçeneklerle üç yol:</p>
<ul>
<li><b>Hata çubukları (error bars):</b> Kümelenmiş çubuk grafiğinde <code>[Net Satış]</code> çiz, <b>Analiz</b> bölmesinde hata çubuğu ekle; üst ve alt sınırın ikisini de <code>[Hedef]</code> ölçüsüne bağla (ilişki: Mutlak). Sonuç her çubukta hedef konumunda bir işaret olur. Hata çubukları kümelenmiş çubuk, kümelenmiş sütun, çizgi ve çizgi + kümelenmiş sütun grafiklerinde var.</li>
<li><b>Çizgi ve kümelenmiş sütun:</b> Hedefi çizgi yerine yalnızca işaretçi olarak göster (çizgi kalınlığı 0, işaretçi açık).</li>
<li><b>Sabit çizgi:</b> Tüm çubuklar için tek bir eşik varsa (ör. %100 gerçekleşme) Analiz bölmesinden sabit çizgi yeterli.</li>
</ul>

<h2>Ağaç haritası ve şerit grafik</h2>
<p><b>Ağaç haritası (treemap)</b> parça-bütün ilişkisini iç içe dikdörtgenlerle gösterir. 2024’te Elektronik %27,6 ile en büyük kutu, Hediye %1,3 ile en küçük. Çok sayıda kategoride ve hiyerarşide (kategori → ürün) iyi çalışır; ama göz alanı kötü karşılaştırır, yakın büyüklükleri (Spor %13,2, Kitap %12,8) ayırmak için çubuk daha iyidir.</p>
<p><b>Şerit grafik (ribbon chart)</b> her dönemde kategorileri büyüklüğe göre üst üste dizer ve dönemler arasında şeritlerle bağlar; <b>sıra değişimi</b> sorusu içindir. Kategori satışında Ev &amp; Yaşam 2022’de ikinci, 2023’te dördüncü, 2024’te yeniden ikinci; Spor ise 2023’te ikinciliğe çıkıp 2024’te dördüncü oluyor. Çizgi grafikte bu sıra değişimi kesişen çizgiler arasında kaybolur.</p>

<h2>Haritalar</h2>
<ul>
<li><b>Kabarcık haritası (bubble):</b> Her konuma büyüklüğe göre bir daire. Şehir bazında satış için uygundur: İstanbul 225.868,75 ₺ ile en büyük daire.</li>
<li><b>Dolgulu harita (choropleth):</b> Bölgeyi renkle doldurur. Toplam değil <b>oran</b> göstermek için kullan (müşteri başı satış, iade oranı); büyük bölge toplam olarak her zaman koyu çıkar.</li>
<li><b>Azure Haritalar (Azure Maps):</b> Kabarcık, dolgulu, ısı haritası, 3B sütun ve işaretçi katmanlarını tek görselde sunar. Microsoft Learn’e göre Bing tabanlı Harita görseli kullanımdan kaldırılmak üzere; tarih henüz belirlenmedi, var olan görseller çalışmaya devam ediyor. Harita ve Dolgulu harita içeren bir rapor açılınca <b>Haritaları yükselt</b> düğmesiyle hepsi Azure Haritalar’a dönüştürülebilir. Azure Haritalar kiracı yöneticisinin ayarıyla açılır; Çin, Kore ve kamu bulutlarında henüz önerilmiyor.</li>
</ul>
<div class="warn"><b>Konumu belirsiz bırakma</b>Şehir sütununun <b>Veri kategorisi</b>ni “Şehir” yap; yine de aynı adlı başka ülkelerdeki yerlerle karışabilir, bu yüzden “İstanbul, Türkiye” gibi birleşik bir konum sütunu daha güvenlidir. Bu modelde 7 müşterinin şehri boş; onların 63.852,75 ₺’lik satışı haritada hiçbir yerde görünmez. Haritanın yanına bir “konumsuz satış” kartı koy.</div>

<h2>Analiz bölmesi: sabit çizgiler ve hata çubukları</h2>
<p>Analiz bölmesinin tam listesi “Analiz özellikleri ve yapay zekâ görselleri” dersinde. Özel grafiklerle birlikte en çok kullanılanlar: hedef için <b>Y ekseni sabit çizgisi</b> (şelalede de var), dağılım grafiğinde dört bölge için iki sabit çizgi, belirsizlik ya da hedef aralığı için <b>hata çubukları</b>. Hata çubuğu sınırları alanlardan ya da yüzdeyle verilir; alan seçeneğinde “Mutlak” sınırın kendisi, “Göreli” ise ölçüden uzaklıktır.</p>

<h2>Özel görseller: AppSource</h2>
<p>Görselleştirmeler bölmesinde <b>…</b> → <b>Diğer görselleri al</b> ile AppSource’taki görseller eklenir ya da bir <code>.pbiviz</code> dosyası içe aktarılır.</p>
<ul>
<li><b>Sertifikalı (certified) görsel:</b> Power BI ekibinin kod gereksinimlerini karşılamış ve testten geçmiştir; testler görselin dış hizmetlere ya da kaynaklara erişmediğini doğrular. Sertifikasız görsel kötü değildir ama bu güvenceyi taşımaz.</li>
<li><b>Yönetici denetimi:</b> Kiracı ayarlarında “Power BI SDK ile oluşturulan görsellere izin ver” kapatılabilir ya da “Yalnızca sertifikalı görselleri ekle ve kullan” açılabilir; o zaman sertifikasız görseller hizmette hata gösterir. Yönetici onayladığı görselleri <b>kuruluş görselleri (organizational visuals)</b> olarak herkese dağıtabilir; bunlar kiracı kısıtlarından etkilenmez.</li>
<li><b>Bakım riski:</b> Üçüncü taraf görsel güncellenmezse ya da ücretli lisansa geçerse rapor bozulabilir. Yerleşik görselle yapılabiliyorsa yerleşik olanı seç.</li>
</ul>
`,
  ex: [
    { t: 'dax', name: 'Kadın Satışı (Sol)',
      q: '<b>Kadın Satışı (Sol)</b>: Tornado grafiğinin sol kanadı için, kadın müşterilerin (Musteriler[Cinsiyet] = "Kadın") [Net Satış] değerini <b>negatif</b> olarak döndür.',
      sol: '-CALCULATE([Net Satış], Musteriler[Cinsiyet] = "Kadın")',
      hint: 'CALCULATE([Net Satış], Musteriler[Cinsiyet] = "Kadın") ifadesinin önüne eksi işareti koy. Eksi işaretini görselde biçim dizesiyle gizlersin.',
      grid: [{ t: 'Musteriler', c: 'YasGrubu' }, { t: 'Tarih', c: 'Yil' }] },
    { t: 'dax', name: 'Geçen Yıla Göre Fark',
      q: '<b>Geçen Yıla Göre Fark</b>: Şelale grafiğinde her kategorinin köprüye katkısı için, [Net Satış] ile geçen yılın aynı dönemindeki net satış ([Satış GY]) arasındaki farkı tutar olarak döndür.',
      sol: '[Net Satış] - [Satış GY]',
      hint: 'Hazır [Satış GY] ölçüsü SAMEPERIODLASTYEAR kullanır. Fark: [Net Satış] - [Satış GY].' },
    { t: 'dax', name: 'Gösterge Maksimumu',
      q: '<b>Gösterge Maksimumu</b>: Göstergenin En büyük değer kutusu için, [Net Satış] ile [Hedef] değerlerinin büyüğünü al, 1,1 ile çarp ve 1.000’in katına yukarı yuvarla.',
      sol: 'CEILING(MAX([Net Satış], [Hedef]) * 1.1, 1000)',
      hint: 'MAX iki değerle çalışır: MAX([Net Satış], [Hedef]). Sonucu 1.1 ile çarp ve CEILING(..., 1000) ile yukarı yuvarla.' },
    { t: 'mc', q: 'Yöneticin 2023 ile 2024 net satışı arasındaki farkın hangi kategorilerden geldiğini tek grafikte görmek istiyor. Hangi kurulum?',
      o: ['Kategori ve yıla göre iç içe ağaç haritası', 'Şelale: Kategori = Yıl, Ayrıntı = Kategori', 'Yıl ve kategoriye göre huni grafiği', 'Yıla göre %100 yığılmış sütun grafik'], a: 1,
      why: 'Şelale, başlangıç değerinden bitiş değerine giden köprüyü katkılara böler. Ayrıntı kutusundaki kategori, iki yıl arasındaki farkı parçalara ayırır.' },
    { t: 'mc', q: 'Tornado grafiğinde sol kanat negatif ölçüyle çiziliyor ve etiketlerde “-229.892” görünüyor. Eksi işaretini nasıl kaldırırsın?',
      o: ['Ölçüyü ABS ile pozitife çevirirsin', 'X eksenini ters sıraya alırsın', 'Biçim dizesini #,0;#,0 yaparsın', 'Veri etiketlerini tamamen kapatırsın'], a: 2,
      why: 'Biçim dizesinin noktalı virgülden sonraki kısmı negatif sayıların yazımını belirler. Değer negatif kalır, çubuk sola uzar ama etiket eksisiz görünür. ABS çubuğu sağa geri taşır.' },
    { t: 'mc', q: 'Power BI’da yerleşik bir bullet grafik yok. Kümelenmiş çubuk grafikte her çubuğa kendi hedefini küçük bir işaretle eklemenin yerleşik yolu hangisi?',
      o: ['Analiz bölmesinde tek bir sabit çizgi eklemek', 'Hata çubuklarını [Hedef] ölçüsüne bağlamak', 'Çubukları %100 yığılmış hâle getirmek', 'Ağaç haritasına hedef alanını eklemek'], a: 1,
      why: 'Hata çubuklarının üst ve alt sınırı [Hedef] ölçüsüne bağlanınca her çubukta kendi hedefinde bir işaret çıkar. Sabit çizgi tüm çubuklar için tek bir değerdir.' },
    { t: 'mc', q: 'Kuruluşunun kiracı ayarlarında “Yalnızca sertifikalı görselleri ekle ve kullan” açık. Raporuna AppSource’tan sertifikasız bir görsel ekledin. Hizmette ne olur?',
      o: ['Görsel çalışır ama bir uyarı simgesi gösterir', 'Görsel otomatik olarak sertifikalanır', 'Görsel tablo görseline dönüştürülür', 'Görsel çizilmez, hata gösterilir'], a: 3,
      why: 'Bu ayar açıkken yalnızca sertifikalı görseller çizilir; sertifikasız olanlar hata gösterir. Yönetici bir görseli kuruluş görseli olarak eklerse bu kısıttan etkilenmez.' }
  ]
});

/* ---------- 4 · Analiz ---------- */
add('analiz-ozellikleri', {
  id: 'ayristirma-etkileyen', lv: 'B2', mod: 'Analiz', min: 26,
  title: 'Ayrıştırma ağacı ve önemli etkileyenler: soru sorarak analiz',
  sum: 'Ayrıştırma ağacında yüksek/düşük değer bölmeleri, mutlak ve göreli mod, düzey kilitleme; önemli etkileyenlerde kategorik ve sürekli hedef, en iyi segmentler, veri gereksinimleri; Copilot anlatısı; bulguyu nedensellik iddiası olmadan okumak ve bir ölçüyle doğrulamak.',
  body: `
<p>“Analiz özellikleri ve yapay zekâ görselleri” dersinde bu görsellerin ne işe yaradığını bir tabloda gördün. Bu derste iki yapay zekâ görselini derinlemesine kullanacağız ve her bulguyu bir DAX ölçüsüyle <b>kendimiz doğrulayacağız</b>. Görselin bir cümlesini rapora koymadan önce aynı sayıyı ölçüyle üretebiliyor olmalısın.</p>

<h2>Ayrıştırma ağacı (decomposition tree)</h2>
<p>Ayrıştırma ağacı bir ölçüyü seçtiğin boyutlara göre adım adım böler. İki kutusu var:</p>
<ul>
<li><b>Çözümle (Analyze):</b> Bölünecek değer. Bir ölçü ya da bir toplama olmalı: <code>[Net Satış]</code>, <code>[İade Oranı %]</code>.</li>
<li><b>Açıklama ölçütü (Explain by):</b> Bölmede kullanılabilecek boyutlar: <code>Satislar[Kanal]</code>, <code>Kategoriler[Kategori]</code>, <code>Musteriler[Segment]</code>, <code>Musteriler[Bolge]</code>, <code>Musteriler[Cinsiyet]</code>…</li>
</ul>
<p>Bir düğümün yanındaki <b>+</b> simgesine basınca sıradaki boyutu sen seçersin. Listenin en üstünde ampul simgeli iki <b>yapay zekâ bölmesi (AI split)</b> vardır:</p>
<ul>
<li><b>Yüksek değer (High value):</b> Tüm boyutları dener ve ölçünün <b>en yüksek</b> değerine götüren boyutu seçer.</li>
<li><b>Düşük değer (Low value):</b> Aynı şeyi en düşük değer için yapar. Oranlarda (iade, iptal) sorunlu bölgeyi bulmak için kullanılır.</li>
</ul>
<p>Yapay zekâ düzeyleri arka arkaya eklenebilir; yüksek ve düşük karıştırılabilir. Ama yapay zekâ düzeyinden sonra elle seçilmiş bir düzey gelemez: el ile bölersen ampul kalkar ve düzey normal düzeye döner. Ampule tıklamak da düzeyi normal davranışa döndürür.</p>

<h2>Mutlak mı, göreli mi?</h2>
<p>Biçim bölmesindeki <b>Analiz</b> kartında yapay zekâ bölmesinin modu seçilir. 2024 net satışı (747.065,70 ₺) üzerinde ilk düzeyi düşün:</p>
<div class="tbl-wrap"><table>
<tr><th>Boyut</th><th>En yüksek düğüm</th><th>Değer</th><th>Düğüm ortalaması</th><th>En yüksek ÷ ortalama</th></tr>
<tr><td>Cinsiyet (2 düğüm)</td><td>Kadın</td><td>401.983,85 ₺</td><td>373.532,85 ₺</td><td>1,08</td></tr>
<tr><td>Kanal (3)</td><td>Mobil</td><td>346.352,70 ₺</td><td>249.021,90 ₺</td><td>1,39</td></tr>
<tr><td>Kategori (7)</td><td>Elektronik</td><td>206.432,20 ₺</td><td>106.723,67 ₺</td><td>1,93</td></tr>
<tr><td>Bölge (7, boş düğüm dahil)</td><td>İç Anadolu</td><td>255.512,80 ₺</td><td>106.723,67 ₺</td><td>2,39</td></tr>
</table></div>
<ul>
<li><b>Mutlak (Absolute) mod</b> en büyük düğüm değerine bakar ve <b>Cinsiyet = Kadın</b>’ı seçer. Az değerli boyutlar her zaman büyük parçalar üretir; mutlak mod bu yüzden “iki büyük dilim” buldu ama ilginç bir şey söylemedi.</li>
<li><b>Göreli (Relative) mod</b> sütunun geri kalanına göre <b>öne çıkan</b> değeri arar: düğüm değerini o boyuttaki düğümlerin ortalamasına böler. Burada <b>Bölge = İç Anadolu</b> 2,39 katla öne çıkıyor.</li>
</ul>
<p>Hangisi doğru? İkisi de doğru hesaplıyor; farklı soru soruyorlar. “Satışın büyük kısmı nerede?” için mutlak, “nerede sıra dışı yoğunlaşma var?” için göreli.</p>
<div class="note"><b>Boş düğüm</b>Bu modelde 7 müşterinin bölgesi boş; ağaçta “(Boş)” düğümü olarak görünür ve ortalamayı etkiler. Ağacı yorumlamadan önce boş düğümün ne kadar büyük olduğuna bak.</div>

<h2>Düzeyleri kilitlemek ve sınırlar</h2>
<ul>
<li><b>Kilitleme:</b> Rapor yazarı bir düzeyin üzerine gelip kilit simgesine basar; okuyucu o düzeyi kaldıramaz ya da değiştiremez, ama düzey içinde farklı düğümlere tıklayabilir. Kilitli bir düzeyden önce kilitsiz düzey olamaz: ilk iki düzeyi kilitlersen okuyucu üçüncüden itibaren keşif yapar.</li>
<li><b>Sınırlar:</b> En fazla 50 düzey, aynı anda en fazla 5.000 veri noktası; her düzey ilk 10 düğümü gösterir.</li>
<li><b>Yapay zekâ bölmesi çalışmayan durumlar:</b> Azure Analysis Services, Power BI Rapor Sunucusu, Web’de yayımla ve <b>Çözümle</b> kutusundaki karmaşık ölçüler.</li>
</ul>

<h2>Önemli etkileyenler (key influencers)</h2>
<p>Bu görsel “Hedef değişkeni en çok ne etkiliyor?” sorusunu sorar. Kutuları:</p>
<ul>
<li><b>Çözümle:</b> Hedef. Satislar tablosunun satır düzeyinde çözümlenir.</li>
<li><b>Açıklama ölçütü:</b> Aday etkenler. Her etken çözümlenen tablonun düzeyinde tanımlı olmalı (satış satırı başına bir değer).</li>
<li><b>Genişletme ölçütü (Expand by):</b> Yalnızca bir ölçüyü ya da toplanmış alanı çözümlerken analiz düzeyini belirler (ör. <code>Satislar[SatirNo]</code>); bu alan etken sayılmaz.</li>
</ul>
<div class="tbl-wrap"><table>
<tr><th>Hedef türü</th><th>Soru</th><th>Örnek</th><th>Sonuç nasıl yazılır?</th></tr>
<tr><td><b>Kategorik</b></td><td>“Durum = İade olmasını ne etkiliyor?”</td><td><code>Satislar[Durum]</code>, değer: İade</td><td>“… olduğunda İade olasılığı X kat artar”</td></tr>
<tr><td><b>Sürekli</b></td><td>“Tutarın artmasını ne etkiliyor?”</td><td><code>Satislar[Tutar]</code> (özetlenmemiş) ya da bir ölçü</td><td>“… olduğunda ortalama Tutar Y ₺ daha yüksek”</td></tr>
</table></div>
<p>Özetlenmemiş sayısal bir sütunu iki şekilde de çözümleyebilirsin; seçim Biçim → Analiz kartındadır. Ölçüler her zaman sürekli çözümlenir. Görselin iki sekmesi vardır: <b>Önemli etkileyenler</b> tek tek etkenleri, <b>En iyi segmentler (Top segments)</b> ise birkaç koşulun birleşimini (ör. “Segment Kurumsal ve Bölge Ege”) hedef oranına göre sıralar; kabarcık büyüklüğü segmentteki satır sayısıdır.</p>
<p>Örnek sonuçlar bu modelde: Genel iade oranı 110 ÷ 1.620 satır = %6,8. Görsel muhtemelen şunu söyler: “Segment Kurumsal olduğunda İade olasılığı 1,74 kat artar.” Kurumsal satırlarda iade %9,8 (45 ÷ 461), diğer segmentlerde %5,6. Sürekli hedefte: Elektronik satırlarında ortalama Tutar 1.428,15 ₺, diğer kategorilerde 722,01 ₺; görsel bunu “Kategori Elektronik olduğunda ortalama Tutar yaklaşık 706 ₺ daha yüksek” diye yazar.</p>

<h2>Önemli etkileyenler ne ister, neyi yapamaz?</h2>
<ul>
<li><b>Yeterli gözlem:</b> Seçilen durum için en az 100 gözlem, karşılaştırılan durumlar için en az 10 gözlem gerekir. Bizim 110 iade satırımız sınırın hemen üstünde; tek bir yılı süzersen görsel “yeterli veri yok” der.</li>
<li><b>Örneklem:</b> Analiz 10.000 veri noktalık bir örneklem üzerinde çalışır.</li>
<li><b>Çok değerli etken:</b> 10’dan fazla benzersiz değeri olan etkenlerde kalite düşebilir; sayısal etkeni sürekli analize çevir ya da grupla.</li>
<li><b>Küçük gruplar:</b> Bir grubun oranı yüksek olsa da gözlem azsa istatistiksel olarak anlamlı bulunmaz. Ege’de iade %11,3 ama yalnızca 22 iade satırı var; görsel Ege’yi etken olarak göstermeyebilir.</li>
<li><b>Desteklenmeyenler:</b> DirectQuery, Azure Analysis Services ve SQL Server Analysis Services’e canlı bağlantı, Web’de yayımla, SharePoint Online gömme. Modelde <b>örtük ölçüleri engelle</b> açıksa (ör. hesaplama grupları tanımlıysa) kategorik hedef çözümlenemez.</li>
</ul>

<h2>Anlatı görseli ve Copilot</h2>
<p><b>Anlatı (Narrative)</b> görselinin iki modu var. <b>Copilot modu</b> seçtiğin görselleri ya da sayfaları okuyup bir özet yazar; Copilot’un açık olduğu ücretli bir Fabric ya da Premium kapasitesi ister, deneme kapasitelerinde çalışmaz. Bu modda özet filtre değişince <b>kendiliğinden güncellenmez</b>; okuyucu yenile düğmesine basarak seçili filtrelere göre yeni özet ister. <b>Özel (Custom) mod</b> eski akıllı anlatıdır (smart narrative): metni sen yazarsın, içine ölçüye bağlı dinamik değerler koyarsın ve bunlar filtreyle güncellenir. Anlatı görseli önemli etkileyenler gibi bazı görselleri henüz okuyamıyor. Soru-Cevap görselini kullanma; kaldırılıyor ve yerini Copilot alıyor (“Copilot ile çalışmak” dersi).</p>

<h2>Bulguyu okumak: etki nedensellik değildir</h2>
<p>“Kurumsal olduğunda iade olasılığı 1,74 kat artar” cümlesi bir <b>ilişki</b> raporudur. “Kurumsal müşteri olmak iadeye yol açar” demez. Kurumsal müşteriler toplu sipariş veriyor, farklı ürünler alıyor ya da iadeyi farklı bir süreçle yapıyor olabilir. Rapora şöyle yaz:</p>
<ul>
<li>Kötü: “Kurumsal müşteriler iadeye neden oluyor.”</li>
<li>İyi: “Kurumsal segmentte iade oranı %9,8, diğer segmentlerde %5,6. Fark her kanalda ve her yılda görülüyor. Nedeni için kurumsal iade gerekçelerine bakılmalı.”</li>
</ul>
<p>“Her kanalda ve her yılda görülüyor” cümlesini ölçüyle kontrol ettik: Kurumsal iade oranı Web’de %12,0’a karşı %5,8, Mobil’de %9,0’a karşı %5,7, Mağaza’da %6,7’ye karşı %4,5; yıllara göre 2022’de %15,8 / %10,4, 2023’te %11,9 / %5,4, 2024’te %7,6 / %5,3. Bir ilişki alt gruplarda da tekrar ediyorsa daha güvenilirdir; bir alt grupta tersine dönüyorsa (Simpson paradoksu) toplam bulgu yanıltıcı olabilir. Ayrıca görsel lojistik regresyon kullandığı için sayı diğer etkenleri de hesaba katar; senin basit oranınla birebir aynı çıkmayabilir.</p>

<h2>Bulguyu bir ölçüyle yeniden üretmek</h2>
<p>Görselin yaptığı karşılaştırma, “seçili değer” ile “diğer değerler”dir. Bu karşılaştırmayı ölçüyle kur:</p>
<pre class="dax">Diğer Segmentlerin İade Oranı =
VAR Secili = VALUES(Musteriler[Segment])
RETURN
CALCULATE([İade Oranı %], EXCEPT(ALL(Musteriler[Segment]), Secili))</pre>
<p>Segment satırlarında bu ölçü Kurumsal için %5,6, Premium için %7,9, Bireysel için %7,1 verir. <code>[İade Oranı %]</code> ÷ bu ölçü, görselin “kat” değerinin basit karşılığıdır: Kurumsal 1,74, Bireysel 0,88, Premium 0,65. Ayrıştırma ağacının bulgusunu da aynı şekilde kontrol et: “Bu kanalda en büyük kategori satışın ne kadarı?” sorusunu bir pay ölçüsüyle cevapla (alıştırma 4). Ölçüyü bir matrise koy, görselin cümlesiyle karşılaştır, ancak ondan sonra rapora yaz.</p>
<div class="tip"><b>Kural</b>Bir yapay zekâ görselinin bulgusu bir hipotezdir. Raporda iki şey yan yana dursun: bulgunun cümlesi ve onu doğrulayan ölçünün matrisi.</div>
`,
  ex: [
    { t: 'dax', name: 'Diğer Segmentlerde İade %',
      q: '<b>Diğer Segmentlerde İade %</b>: Önemli etkileyenler görselinin karşılaştırma tabanını üret: bağlamdaki segment(ler) <b>dışındaki</b> tüm segmentlerde [İade Oranı %] değerini hesapla. Segment satırlarında her satır kendi dışındakileri göstermeli.',
      sol: 'VAR Secili = VALUES(Musteriler[Segment]) RETURN CALCULATE([İade Oranı %], EXCEPT(ALL(Musteriler[Segment]), Secili))',
      hint: 'Seçili segmentleri VALUES ile bir değişkene al. EXCEPT(ALL(Musteriler[Segment]), Secili) geri kalan segmentleri verir; bunu CALCULATE filtresi olarak kullan.',
      grid: [{ t: 'Musteriler', c: 'Segment' }], noTotal: true },
    { t: 'dax', name: 'İade Olasılık Katı',
      q: '<b>İade Olasılık Katı</b>: Görseldeki “X kat” değerinin basit karşılığı: bağlamdaki segmentin [İade Oranı %] değerini, diğer tüm segmentlerin [İade Oranı %] değerine böl. Kurumsal satırı yaklaşık 1,74 vermeli.',
      sol: 'VAR Secili = VALUES(Musteriler[Segment]) RETURN DIVIDE([İade Oranı %], CALCULATE([İade Oranı %], EXCEPT(ALL(Musteriler[Segment]), Secili)))',
      hint: 'Payda bir önceki alıştırmanın ifadesi: CALCULATE([İade Oranı %], EXCEPT(ALL(Musteriler[Segment]), Secili)). DIVIDE([İade Oranı %], payda).',
      grid: [{ t: 'Musteriler', c: 'Segment' }], noTotal: true },
    { t: 'dax', name: 'Kurumsal İade Farkı',
      q: '<b>Kurumsal İade Farkı</b>: Bulgunun alt gruplarda da geçerli olup olmadığını kontrol et: Kurumsal segmentin [İade Oranı %] değerinden, Kurumsal olmayan segmentlerin [İade Oranı %] değerini çıkar (puan farkı). Her kategori ve yılda pozitif çıkıyor mu?',
      sol: 'CALCULATE([İade Oranı %], Musteriler[Segment] = "Kurumsal") - CALCULATE([İade Oranı %], Musteriler[Segment] <> "Kurumsal")',
      hint: 'İki CALCULATE: biri Musteriler[Segment] = "Kurumsal", diğeri Musteriler[Segment] <> "Kurumsal" filtresiyle [İade Oranı %]. Farkını al.' },
    { t: 'dax', name: 'En Büyük Kategori Payı',
      q: '<b>En Büyük Kategori Payı</b>: Ayrıştırma ağacında bir düğümün altındaki en büyük kategorinin payını doğrula: bağlamdaki kategoriler içinde en yüksek [Net Satış] değerini, bağlamın toplam [Net Satış] değerine böl.',
      sol: 'DIVIDE(MAXX(VALUES(Kategoriler[Kategori]), [Net Satış]), [Net Satış])',
      hint: 'MAXX(VALUES(Kategoriler[Kategori]), [Net Satış]) en büyük kategorinin satışını verir. DIVIDE ile [Net Satış]’a böl.',
      grid: [{ t: 'Satislar', c: 'Kanal' }, { t: 'Musteriler', c: 'Segment' }] },
    { t: 'mc', q: 'Ayrıştırma ağacında “Yüksek değer” bölmesi mutlak modda ilk düzey için Cinsiyet = Kadın’ı seçti. Göreli moda geçince Bölge = İç Anadolu seçildi. Bunun sebebi nedir?',
      o: ['Göreli mod yalnızca coğrafi alanlara bakar', 'Mutlak mod alanları alfabetik sırayla dener', 'Göreli mod ortalamaya göre öne çıkanı arar', 'Cinsiyet alanında boş değerler bulunuyor'], a: 2,
      why: 'Mutlak mod en büyük düğümü seçer; iki değerli Cinsiyet doğal olarak büyük parçalar verir. Göreli mod düğümü o boyuttaki düğümlerin ortalamasına böler: İç Anadolu 2,39 katla öne çıkar.' },
    { t: 'mc', q: 'Önemli etkileyenler görselinde Durum = İade’yi çözümlüyorsun ve yalnızca 2023’ü süzünce “yeterli veri yok” uyarısı geliyor. En olası neden?',
      o: ['Seçili durumda 100 gözlem eşiği aşılmıyor', 'Görsel yalnızca tek yıllık veriyle çalışır', 'Durum sütunu metin türünde tanımlanmış', 'Tarih tablosu tarih tablosu işaretli değil'], a: 0,
      why: 'Görsel seçilen durum için en az 100, karşılaştırılan durumlar için en az 10 gözlem ister. Tüm yıllarda 110 iade satırı var; tek yıla süzünce eşiğin altına düşülür.' },
    { t: 'mc', q: 'Görsel “Segment Kurumsal olduğunda İade olasılığı 1,74 kat artar” diyor. Rapora yazılacak en doğru cümle hangisi?',
      o: ['Kurumsal müşteriler iadeye neden oluyor', 'Kurumsal müşteriyi azaltmak iadeyi düşürür', 'Kurumsal segment 1,74 kat daha çok iade eder', 'Kurumsalda iade %9,8, diğerlerinde %5,6'], a: 3,
      why: 'Görsel bir ilişki bildirir, neden bildirmez. Sayıyı ve karşılaştırma tabanını açıkça yazmak doğru; “neden olur” ya da “azaltırsak düşer” gibi cümleler nedensellik iddiasıdır.' },
    { t: 'mc', q: 'Anlatı görselini Copilot modunda kullanıyorsun. Okuyucu dilimleyicide başka bir kanal seçiyor. Özet metni ne olur?',
      o: ['Anında yeni seçime göre yeniden yazılır', 'Değişmez; yenile düğmesiyle güncellenir', 'Boşalır ve görsel hata simgesi gösterir', 'Yalnızca rapor yazarı için güncellenir'], a: 1,
      why: 'Copilot modundaki anlatı filtrelerle otomatik güncellenmez; okuyucu yenile düğmesiyle seçili filtrelere göre yeni bir özet ister. Özel moddaki dinamik değerler ise filtreyle güncellenir.' }
  ]
});

})(window);
