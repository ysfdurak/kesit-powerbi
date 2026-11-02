/* Kesit Power BI — içerik eki: “BLANK, hatalar ve hata ayıklama” dersi, zayıf derslere ek bölümler ve alıştırmalar. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const find = id => L.find(l => l.id === id);

/* ---------- Yeni ders: BLANK, hatalar ve hata ayıklama (B1) ---------- */
L.push({
  id: 'blank-hata', lv: 'B1', mod: 'DAX Kalıpları', min: 16,
  title: 'BLANK, hatalar ve DAX’ta hata ayıklama',
  sum: 'BLANK’in aritmetikte ve karşılaştırmada davranışı, COALESCE ve ISBLANK, sıfıra bölme, IFERROR’ın tuzakları ve bir ölçüyü adım adım ayıklama yöntemi.',
  body: `
<h2>BLANK: “değer yok”</h2>
<p>DAX’ta bir ölçünün hesaplayacak satırı yoksa sonuç <b>BLANK</b> olur. Hiç satılmamış bir ürünün <code>[Net Satış]</code>’ı 0 değil, BLANK’tir. Görseller BLANK olan satırları varsayılan olarak gizler: matriste hiç satmayan ürün görünmez. Bu çoğu zaman istenen davranıştır.</p>
<p>BLANK, SQL’deki NULL’a benzer ama aynı değildir. Aritmetikte ve karşılaştırmada kendine özgü kuralları var:</p>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Sonuç</th><th>Neden önemli?</th></tr>
<tr><td><code>BLANK() + 1</code></td><td>1</td><td>Toplama ve çıkarmada BLANK, 0 gibi davranır. <code>[Net Satış] - [Satış GY]</code> ilk yılda tüm satışı “büyüme” gösterir.</td></tr>
<tr><td><code>BLANK() * 2</code></td><td>BLANK</td><td>Çarpmada BLANK yayılır. Bölmede pay BLANK ise sonuç BLANK; payda BLANK ise 5 / BLANK sonsuz, 0 / BLANK NaN verir. Bu yüzden bölmede DIVIDE kullan.</td></tr>
<tr><td><code>BLANK() = 0</code></td><td>TRUE</td><td><code>=</code> karşılaştırmasında BLANK; 0 ve "" ile eşittir.</td></tr>
<tr><td><code>BLANK() == 0</code></td><td>FALSE</td><td><code>==</code> katı eşitliktir; BLANK yalnızca BLANK’e eşittir.</td></tr>
<tr><td><code>ISBLANK(0)</code></td><td>FALSE</td><td>0 bir değerdir; BLANK değildir.</td></tr>
</table></div>
<h2>BLANK’i yönetmek: ISBLANK ve COALESCE</h2>
<pre class="dax">Satış Değişimi =
VAR GY = [Satış GY]
RETURN IF(ISBLANK(GY), BLANK(), [Net Satış] - GY)</pre>
<p>Geçen yıl verisi yoksa fark anlamsızdır; BLANK döndürmek görselde o hücreyi boş bırakır. <code>COALESCE</code> ise ilk BLANK olmayan değeri döndürür:</p>
<pre class="dax">Net Satış (0'lı) = COALESCE([Net Satış], 0)</pre>
<div class="warn"><b>“+0” ve COALESCE tuzağı</b>Bir ölçü hiçbir zaman BLANK döndürmezse görsel, satır ve sütun alanlarının <b>tüm kombinasyonlarını</b> gösterir: 40 ürün × 150 müşteri tablosu 6.000 satıra çıkar ve yavaşlar. Sıfır göstermeyi yalnızca kart gibi tek değerli görsellerde ya da kombinasyonların anlamlı olduğu küçük matrislerde kullan.</div>
<h2>Boş değerlere göre filtrelemek</h2>
<pre class="dax">Şehri Bilinmeyen Satış = CALCULATE([Net Satış], ISBLANK(Musteriler[Sehir]))</pre>
<p>Veri kalitesi ölçüleri (“şehri boş müşterilerin cirosu”) raporda sorunun büyüklüğünü görünür kılar. Power Query’de sütun kalitesi aynı bilgiyi yükleme sırasında verir.</p>
<h2>Hata mı, BLANK mı?</h2>
<ul>
<li><code>1 / 0</code> hata değildir: sonuç <b>sonsuz</b> (∞) olur. <code>0 / 0</code> ise <b>NaN</b>.</li>
<li><code>DIVIDE(1, 0)</code> BLANK döndürür; üçüncü bağımsız değişkenle başka bir değer verebilirsin: <code>DIVIDE(a, b, 0)</code>.</li>
<li><code>VALUE("12a")</code> gerçek bir hatadır: metin sayıya çevrilemez.</li>
</ul>
<pre class="dax">Güvenli Sayı = IFERROR(VALUE("12a"), 0)</pre>
<div class="warn"><b>IFERROR’ı alışkanlık hâline getirme</b><code>IFERROR</code> ve <code>ISERROR</code> her satırda hatayı yakalamak için formül motorunda çalışır; ölçüyü yavaşlatır ve sorunu saklar. Bölme için <code>DIVIDE</code>, tür sorunları için Power Query’de doğru veri türü kullan. <code>IFERROR(1/0, 0)</code> beklediğin gibi 0 döndürmez; çünkü 1/0 bir hata değil, sonsuzdur.</div>
<h2>Bir ölçüyü adım adım ayıklamak</h2>
<ol>
<li><b>Böl:</b> Uzun bir ölçüyü <code>VAR</code>’larla parçalara ayır. <code>RETURN</code>’den sonra sonucu değil, şüphelendiğin değişkeni yaz ve görsele bak.</li>
<li><b>Tabloyu say:</b> Değişken bir tabloysa <code>RETURN COUNTROWS(Tablo)</code> ile kaç satır kaldığını gör. Beklediğinden fazla ya da az satır, filtrenin yanlış olduğunu söyler.</li>
<li><b>Sorguya dök:</b> DAX sorgu görünümünde (ya da DAX Studio’da) tablo değişkenini <code>EVALUATE</code> ile doğrudan listele.</li>
<li><b>Bağlamı yaz:</b> Hücrenin filtre bağlamını bir “hata ayıklama” ölçüsüyle görünür yap: <code>CONCATENATEX(VALUES(Tarih[Yil]), Tarih[Yil], ", ")</code>.</li>
</ol>
<pre class="dax">EVALUATE
VAR Iptaller = FILTER(Satislar, Satislar[Durum] = "İptal")
RETURN ROW("İptal satırı", COUNTROWS(Iptaller), "İptal tutarı", SUMX(Iptaller, Satislar[Tutar]))</pre>
<h2>Sık görülen hata mesajları</h2>
<div class="tbl-wrap"><table>
<tr><th>Mesaj</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td>Birden çok değer içeren bir tablo, tek bir değer beklenen yerde kullanıldı</td><td>Bir sütunu ya da <code>VALUES</code>’u, birden çok satır dönebilecekken tek değer gibi kullandın.</td><td><code>SELECTEDVALUE</code>, <code>MAX</code> ya da <code>HASONEVALUE</code> ile koru.</td></tr>
<tr><td>Döngüsel bağımlılık algılandı</td><td>İki hesaplanmış sütun (ya da sütun ile ilişki) birbirine dayanıyor.</td><td>Hesabı ölçüye taşı ya da Power Query’ye al.</td></tr>
<tr><td>Sütun bulunamadı / geçerli bir satır için tek değer belirlenemiyor</td><td>Ölçüde bir sütuna satır bağlamı olmadan başvurdun: <code>= Satislar[Tutar] * 2</code>.</td><td>Toplama ya da yineleyici kullan: <code>SUMX(Satislar, Satislar[Tutar] * 2)</code>.</td></tr>
<tr><td>Beklenmedik toplam</td><td>Toplam satırı, satırların toplamı değil, ölçünün toplam bağlamındaki sonucudur.</td><td>Satır satır toplam isteniyorsa <code>SUMX(VALUES(...), [Ölçü])</code>.</td></tr>
</table></div>
`,
  ex: [
    { t: 'mc', q: '<code>[Net Satış] - [Satış GY]</code> ölçüsü 2022 yılında (öncesinde veri yok) ne gösterir?', o: ['BLANK', '2022’nin tüm net satışı; çünkü çıkarmada BLANK 0 gibi davranır', 'Hata', '0'], a: 1, why: 'Toplama ve çıkarmada BLANK 0 sayılır. Bu yüzden ilk yılda “değişim” tüm satışa eşit çıkar. Geçen yıl BLANK ise sonucu da BLANK yapmak gerekir.' },
    { t: 'dax', name: 'Satış Değişimi', q: '<b>Satış Değişimi</b>: geçen yılın satışı (<code>[Satış GY]</code>) boşsa BLANK, değilse <code>[Net Satış]</code> ile geçen yıl arasındaki farkı döndür.', sol: 'VAR GY = [Satış GY]\nRETURN IF(ISBLANK(GY), BLANK(), [Net Satış] - GY)', hint: 'Önce geçen yılı bir değişkene al; ISBLANK ile kontrol et.', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Kategoriler', c: 'Kategori' }], noTotal: true },
    { t: 'dax', name: "Net Satış (0'lı)", q: "<b>Net Satış (0'lı)</b>: hiç satılmamış ürünlerde boş yerine 0 gösteren bir net satış ölçüsü yaz. Kontrol, ürün listesinin tamamında yapılır; iki ürün hiç satılmamış.", sol: 'COALESCE([Net Satış], 0)', hint: 'İlk BLANK olmayan değeri döndüren fonksiyonu kullan.', grid: [{ t: 'Urunler', c: 'Urun' }] },
    { t: 'dax', name: 'Şehri Bilinmeyen Satış', q: '<b>Şehri Bilinmeyen Satış</b>: şehri boş olan müşterilerin net satışı.', sol: 'CALCULATE([Net Satış], ISBLANK(Musteriler[Sehir]))', hint: 'CALCULATE’in filtresi olarak ISBLANK(Musteriler[Sehir]) kullanılabilir.' },
    { t: 'mc', q: '<code>IFERROR(1/0, 0)</code> ne döndürür?', o: ['0', 'BLANK', 'Sonsuz (∞); çünkü 1/0 hata değildir', 'Hata mesajı'], a: 2, why: 'DAX’ta sıfıra bölme hata üretmez; sonuç sonsuzdur. IFERROR bu yüzden devreye girmez. Bölmede DIVIDE kullan.' },
    { t: 'mc', q: '“Birden çok değer içeren bir tablo, tek bir değer beklenen yerde kullanıldı” hatası <code>Başlık = "Yıl: " &amp; VALUES(Tarih[Yil])</code> ölçüsünde çıkıyor. En doğru düzeltme hangisi?', o: ['IFERROR ile sarmak', 'VALUES yerine SELECTEDVALUE(Tarih[Yil], "Tüm yıllar") kullanmak', 'Ölçüyü hesaplanmış sütuna çevirmek', 'Tarih tablosunu tek yıla indirmek'], a: 1, why: 'Birden çok yıl göründüğünde VALUES birden çok satır döndürür. SELECTEDVALUE tek değer varsa onu, yoksa verilen alternatifi döndürür.' },
    { t: 'mc', q: 'Uzun bir ölçü beklenenden büyük sonuç veriyor. İçindeki <code>VAR Musteriler2024 = FILTER(...)</code> değişkeninin doğru olup olmadığını en hızlı nasıl anlarsın?', o: ['Ölçüyü baştan yazmak', '<code>RETURN COUNTROWS(Musteriler2024)</code> yazıp görsele bakmak ya da DAX sorgu görünümünde EVALUATE ile listelemek', 'IFERROR eklemek', 'Görseli yeniden oluşturmak'], a: 1, why: 'RETURN’ü geçici olarak bir ara değişkene çevirmek ve tablo değişkenlerini saymak, DAX’ta hata ayıklamanın temel tekniğidir.' }
  ]
});

/* ---------- Kısa derslere ek bölümler ---------- */
const addBody = (id, html) => { const l = find(id); if (l) l.body += html; };
addBody('var-mantik', `
<h2>Değişken bir tablo da olabilir</h2>
<pre class="dax">Sadık Müşteri Satışı =
VAR Sadiklar =
    FILTER(VALUES(Satislar[MusteriNo]), CALCULATE([Sipariş Sayısı]) &gt;= 5)
RETURN
    CALCULATE([Net Satış], Sadiklar)</pre>
<p><code>Sadiklar</code> bir tablo değişkenidir: en az 5 siparişi olan müşterilerin listesi. <code>CALCULATE</code>’e filtre olarak verilince net satış yalnızca bu müşteriler için hesaplanır. Aynı tabloyu iki yerde kullansan da bir kez hesaplanır.</p>
<h2>IF, SWITCH ve BLANK</h2>
<p><code>IF(koşul, değer)</code> yazıp üçüncü bağımsız değişkeni vermezsen, koşul yanlış olduğunda sonuç <b>BLANK</b> olur ve görsel o satırı gizler. Bu, “yalnızca hedefi aşanları göster” gibi ölçüler için bilinçli bir tekniktir. BLANK’in diğer davranışları için <button class="lnk" data-lesson="blank-hata">BLANK ve hata ayıklama</button> dersine bak.</p>
<div class="tip"><b>İsimlendirme</b>Değişken adları boşluk içeremez ve ölçü adlarıyla çakışmamalı. <code>BuYil</code>, <code>GecenYil</code>, <code>_oran</code> gibi kısa ve anlamlı adlar kullan; tablo değişkenlerine çoğul ad vermek (<code>Sadiklar</code>) okunurluğu artırır.</div>
`);
addBody('siralama', `
<h2>Eşitlikler ve sıralama türleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Net satış</th><th>RANKX (varsayılan, SKIP)</th><th>RANKX(..., DENSE)</th></tr>
<tr><td>900</td><td>1</td><td>1</td></tr>
<tr><td>700</td><td>2</td><td>2</td></tr>
<tr><td>700</td><td>2</td><td>2</td></tr>
<tr><td>500</td><td>4</td><td>3</td></tr>
</table></div>
<p>Yarışma sıralaması için SKIP, “kaçıncı fiyat düzeyi” gibi sorular için DENSE kullanılır. Yeni <code>RANK</code> fonksiyonu (pencere fonksiyonları ailesi) eşitliği ikinci bir sıralama sütunuyla bozabilir: <code>RANK(ALL(Urunler[Urun]), ORDERBY([Net Satış], DESC, Urunler[Urun], ASC))</code>.</p>
<h2>Seçime göre sıra: ALLSELECTED</h2>
<pre class="dax">Seçimdeki Sıra =
IF(
    HASONEVALUE(Urunler[Urun]),
    RANKX(ALLSELECTED(Urunler[Urun]), [Net Satış])
)</pre>
<p><code>ALL</code> tüm ürünler arasındaki sırayı verir; dilimleyicide yalnızca Elektronik seçiliyse bile “Kulaklık 7. sırada” der. <code>ALLSELECTED</code> ise yalnızca seçili ürünler arasında sıralar: Elektronik içinde 2. Hangisinin doğru olduğu soruya bağlıdır; başlıkta hangisini gösterdiğini yaz.</p>
<h2>Kategori içinde sıra</h2>
<pre class="dax">Kategori İçi Sıra =
IF(
    HASONEVALUE(Urunler[Urun]),
    RANKX(ALLEXCEPT(Urunler, Urunler[Kategori]), [Net Satış])
)</pre>
<p><code>ALLEXCEPT</code> ürün filtresini kaldırır ama kategori filtresini korur: her ürün kendi kategorisindeki diğer ürünlerle yarışır.</p>
`);
addBody('kosullu-bicim', `
<h2>Kural mı, ölçü mü, skala mı?</h2>
<div class="tbl-wrap"><table>
<tr><th>Yöntem</th><th>Ne zaman?</th><th>Dikkat</th></tr>
<tr><td>Renk skalası</td><td>Bir değerin büyüklüğünü sezdirmek: ısı haritası.</td><td>Min/max sabit değilse anlam filtreyle değişir.</td></tr>
<tr><td>Kurallar</td><td>Sabit eşikler: “%95’in altı kırmızı”.</td><td>Eşik birkaç görselde tekrarlanırsa bakımı zorlaşır.</td></tr>
<tr><td>Alan değeri (DAX)</td><td>İş kuralı birden çok görselde aynı olmalı; renk başka bir ölçüye bağlı.</td><td>Ölçü bir renk kodu (#RRGGBB) ya da renk adı döndürmeli.</td></tr>
</table></div>
<h2>Renk körlüğü ve simge</h2>
<p>Erkeklerin yaklaşık %8’inde kırmızı-yeşil ayrımı zayıftır. Durumu yalnızca renkle değil, simgeyle de (▲ ■ ▼) ver ve kırmızıyı yalnızca “kötü” için kullan. Tema dosyasındaki <code>good</code>, <code>neutral</code>, <code>bad</code> renkleri bu sınıflar için tek kaynak olsun.</p>
<pre class="dax">Marj Rengi =
SWITCH(
    TRUE(),
    [Kâr Marjı %] &gt;= 0.4, "#17855A",
    [Kâr Marjı %] &gt;= 0.3, "#A86A12",
    "#C0392B"
)</pre>
<p>Aynı mantıkla simge döndüren bir metin ölçüsü de yazılabilir; koşullu biçimdeki “Simgeler” seçeneğinden daha esnektir çünkü simgenin anlamını ölçünün adı açıklar.</p>
`);

/* ---------- Az alıştırmalı derslere ekler ---------- */
const addEx = (id, ...ex) => { const l = find(id); if (l) l.ex = (l.ex || []).concat(ex); };
addEx('tarih', { t: 'mc', q: 'Microsoft Fabric ile birlikte Power BI’daki “dataset” kavramının adı ne oldu?', o: ['Veri akışı', 'Anlam modeli (semantic model)', 'Lakehouse', 'Rapor'], a: 1, why: '2023’te Fabric ile “dataset” adı “anlam modeli” (semantic model) olarak değişti. Kavram aynı: tablolar, ilişkiler ve ölçüler.' });
addEx('aile', { t: 'mc', q: 'Bir rapor, Premium ya da Fabric F64 ve üstü bir kapasitedeki çalışma alanında yayımlandı. Raporu yalnızca <b>görüntüleyecek</b> çalışanlar için ne gerekir?', o: ['Her birine Pro lisansı', 'Ücretsiz (Fabric Free) lisans yeterli; içeriği kapasite karşılar', 'Power BI Desktop kurulumu', 'Report Server lisansı'], a: 1, why: 'Paylaşılan kapasite (Pro) çalışma alanında hem paylaşan hem görüntüleyen Pro ister. Premium ya da F64 ve üstü kapasitede görüntüleyiciler ücretsiz lisansla erişebilir; içerik oluşturanlar yine Pro ister.' });
addEx('arayuz', { t: 'mc', q: '<code>Tarih[Ay]</code> sütunu görsellerde “Ağu, Ara, Eki…” diye alfabetik sıralanıyor. Ay numarasına göre sıralamayı nerede ayarlarsın?', o: ['Rapor görünümünde görselin sıralama menüsünden', 'Tablo görünümünde Ay sütununu seçip <b>Sütuna göre sırala → AyNo</b>', 'Model görünümünde ilişki ekleyerek', 'Power Query’de sütunu yeniden adlandırarak'], a: 1, why: '“Sütuna göre sırala” bir sütunun özelliğidir; Tablo görünümünde (ya da Model görünümünde Özellikler bölmesinde) ayarlanır ve tüm görsellerde geçerli olur.' });
addEx('ilk-rapor',
  { t: 'dax', name: 'En Küçük Satır', q: '<b>En Küçük Satır</b>: tek bir sipariş satırının en düşük <code>Tutar</code> değeri. Raporda “en ucuz satış” kartında kullanılacak.', sol: 'MIN(Satislar[Tutar])', hint: 'En küçük değeri veren fonksiyon: MIN(Tablo[Sütun]).' },
  { t: 'dax', name: 'En Büyük Satır', q: '<b>En Büyük Satır</b>: tek bir sipariş satırının en yüksek <code>Tutar</code> değeri. Kategori ve yıl kırılımında her hücre kendi en büyük satırını gösterir.', sol: 'MAX(Satislar[Tutar])', hint: 'En büyük değeri veren fonksiyon: MAX(Tablo[Sütun]).' });
/* A1 dersinde CALCULATE istemek seviyeyi aşıyordu ve calculate dersindeki alıştırmanın tekrarıydı */
{ const g = find('gorsel-temel'); const i = g ? g.ex.findIndex(e => e.name === 'Net Satış Kartı') : -1;
  if (i >= 0) g.ex[i] = { t: 'dax', name: 'Toplam Maliyet', q: '<b>Toplam Maliyet</b>: Bir karta koymak için satılan ürünlerin toplam maliyetini veren ölçüyü yaz (<code>Satislar[Maliyet]</code> sütununun toplamı).', sol: 'SUM(Satislar[Maliyet])', hint: 'SUM(Tablo[Sütun])', explain: 'Kart tek bir sayı gösterir; ölçü kartın filtre bağlamında (sayfa ve dilimleyiciler) hesaplanır. Aynı ölçüyü kategoriye göre bir sütun grafiğine koyarsan her çubuk kendi kategorisinin toplamını gösterir.' }; }
addEx('hizli-olcu', { t: 'mc', q: 'Copilot’tan “kategori payı” ölçüsü istedin ve bir formül geldi. Modele eklemeden önce en önemli adım hangisi?', o: ['Formülü hemen kullanmak; Copilot hata yapmaz', 'Formülü bilinen bir toplamla karşılaştırmak: tüm kategorilerin payı %100 ediyor mu, dilimleyici seçimi doğru davranıyor mu?', 'Ölçünün adını İngilizce yapmak', 'Formülü hesaplanmış sütuna çevirmek'], a: 1, why: 'Üretilen DAX bir öneridir. Toplamı bilinen bir kesitle (ör. payların toplamı %100) ve dilimleyici davranışıyla doğrulanmadan modele alınmamalı.' });
addEx('kosullu-bicim', { t: 'dax', name: 'Marj Rengi', q: '<b>Marj Rengi</b>: <code>[Kâr Marjı %]</code> 0,4 ya da üstüyse "#17855A", 0,3 ya da üstüyse "#A86A12", aksi hâlde "#C0392B" döndür. Kontrol ürün kırılımında yapılır; ürünlerin marjı farklı olduğu için üç renk de görünür.', grid: [{ t: 'Urunler', c: 'Urun' }], sol: 'SWITCH(TRUE(), [Kâr Marjı %] >= 0.4, "#17855A", [Kâr Marjı %] >= 0.3, "#A86A12", "#C0392B")', hint: 'SWITCH(TRUE(), koşul1, sonuç1, koşul2, sonuç2, varsayılan): koşullar sırayla denenir.' });
addEx('tema-sayfa', { t: 'mc', q: 'Rapor tuvalini 1280 × 720 yerine 1920 × 1080 yapmanın riski nedir?', o: ['Hiçbir risk yoktur', 'Her şey orantılı ölçeklenir; küçük ekranlarda ve Teams’te yazılar okunmaz hâle gelebilir', 'Rapor yayımlanamaz', 'Mobil düzen silinir'], a: 1, why: 'Tuval sığdırılarak gösterilir; büyük tuval, dizüstü ve gömülü görünümlerde her şeyi küçültür. 16:9 ve 1280 × 720 çoğu durumda en güvenli seçimdir.' });
addEx('dashboard-tasarim', { t: 'mc', q: 'Bir yönetici sayfasında 14 görsel var ve sayfa 6 saniyede açılıyor. İlk ne yaparsın?', o: ['Daha güçlü bir kapasiteye geçmek', 'Sayfanın ana sorusunu yazıp ona hizmet etmeyen görselleri ayrıntı sayfasına ya da araç ipucuna taşımak; ardından Performans Analizi ile en yavaş görsele bakmak', 'Tüm görselleri tabloya çevirmek', 'Renkleri azaltmak'], a: 1, why: 'Her görsel en az bir sorgu demektir. Tasarım sorunu (çok görsel) çoğu zaman performans sorunundan önce gelir; sonra Performans Analizi ile ölçülür.' });
addEx('sayfalandirilmis',
  { t: 'query', q: 'Sayfalandırılmış rapor veri kümesi bir DAX sorgusudur. Her <b>şehir</b> için net satışı veren bir tablo döndür (sütunlar: şehir ve "Net Satış").', start: 'EVALUATE\n', sol: 'EVALUATE\nSUMMARIZECOLUMNS(Musteriler[Sehir], "Net Satış", [Net Satış])', hint: 'SUMMARIZECOLUMNS(GruplamaSütunu, "Ad", [Ölçü])' },
  { t: 'mc', q: 'Bir sayfalandırılmış raporda kullanıcı “Yıl” parametresini seçiyor. DAX sorgusunda bu parametre nasıl kullanılır?', o: ['Sorguya @Yil gibi bir sorgu parametresi eklenir ve rapor parametresine bağlanır', 'Parametre kullanılamaz', 'Her yıl için ayrı rapor yapılır', 'Dilimleyici eklenir'], a: 0, why: 'Report Builder’da sorgu parametreleri (@Yil) rapor parametrelerine eşlenir; kullanıcı seçimi sorguya filtre olarak gider.' });
addEx('istatistik-ileri', { t: 'dax', name: 'Aylık Satış Std. Sapma', q: '<b>Aylık Satış Std. Sapma</b>: görünen aylardaki (<code>VALUES(Tarih[YilAy])</code>) aylık net satışların popülasyon standart sapması.', sol: 'STDEVX.P(VALUES(Tarih[YilAy]), [Net Satış])', hint: 'Bir tabloyu satır satır dolaşıp bir ifadenin standart sapmasını alan yineleyici: STDEVX.P(Tablo, İfade).' });
addEx('final-hazirlik',
  { t: 'mc', q: 'Final projesinde “Toplam satırları doğru” ölçütü ne anlama gelir?', o: ['Toplam satırı her zaman gizlenir', 'Oran ve ortalama ölçüleri toplamda satırların toplamı değil, toplam bağlamında yeniden hesaplanır; gerekirse SUMX(VALUES(...)) ile bilinçli olarak satır toplamı alınır', 'Toplam satırı kırmızı yazılır', 'Toplamlar Excel’de kontrol edilir'], a: 1, why: 'Kâr marjı gibi oranlar toplanmaz. Ölçü toplam bağlamında doğru hesaplanmalı; satır toplamı isteniyorsa bu açıkça SUMX ile yazılır.' },
  { t: 'mc', q: 'Raporu yayımlamadan önce RLS’i nasıl doğrularsın?', o: ['Yayımladıktan sonra kullanıcılara sormak', 'Desktop’ta Modelleme → <b>Rol olarak görüntüle</b> ile ve Service’te <b>Rol olarak test et</b> ile en az iki farklı kullanıcıyı denemek', 'Rolleri silmek', 'Yalnızca yönetici hesabıyla bakmak'], a: 1, why: 'RLS hem Desktop’ta hem Service’te farklı kullanıcılarla test edilmelidir; yönetici hesabı RLS’i atladığı için tek başına yeterli değildir.' });

/* ---------- Sıra ve seviye ---------- */
if (W.PBI_ORDER && !W.PBI_ORDER.includes('blank-hata')) W.PBI_ORDER.splice(W.PBI_ORDER.indexOf('var-mantik') + 1, 0, 'blank-hata');
if (W.PBI_LEVEL_OF) W.PBI_LEVEL_OF['blank-hata'] = 'B1';
})(window);
