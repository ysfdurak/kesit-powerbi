/* Kesit Power BI içerik 5: B2 yeni dersler */
(window.PBI_LESSONS = window.PBI_LESSONS || []).push(

{
  id: 'pq-model', lv: 'B2', mod: 'Veri Hazırlama', min: 18,
  title: 'Power Query ile modele hazırlık',
  sum: 'Parametreler, gizlilik düzeyleri, başvuru ve çoğaltma, JSON gibi yarı yapılandırılmış veri, olgu/boyut ve anahtar oluşturma, yükleme ayarları.',
  body: `
<h2>Kaynak ayarları ve gizlilik</h2>
<p>Dosya → Seçenekler ve ayarlar → <b>Veri kaynağı ayarları</b>: her kaynağın kimlik bilgisini (Windows, veritabanı, kuruluş hesabı) ve <b>gizlilik düzeyini</b> değiştirirsin.</p>
<div class="tbl-wrap"><table>
<tr><th>Gizlilik düzeyi</th><th>Anlamı</th></tr>
<tr><td>Özel</td><td>Hassas veri; başka bir kaynağa hiç gönderilmez</td></tr>
<tr><td>Kuruluş</td><td>Kuruluş içindeki kaynaklarla birleştirilebilir</td></tr>
<tr><td>Genel</td><td>Herkese açık veri (ör. döviz kuru web sayfası)</td></tr>
</table></div>
<p>Power Query, farklı düzeydeki kaynakları birleştirirken (Merge) veri sızıntısını önlemek için sorgu katlamayı kısıtlayabilir. “Formula.Firewall” hatası genellikle buradan gelir.</p>
<h2>Parametreler</h2>
<p>Giriş → <b>Parametreleri yönet</b>. Sunucu adı, veritabanı, başlangıç tarihi gibi değerler bir kez tanımlanır, sorgularda kullanılır. Yayımladıktan sonra Service'te anlam modelinin ayarlarından değiştirilebilir; geliştirme ve canlı ortam arasında geçiş tek tıklamadır. Artımlı yenilemenin <code>RangeStart</code> / <code>RangeEnd</code> parametreleri de böyledir.</p>
<h2>Başvuru mu, çoğaltma mı?</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Başvuru (Reference)</th><th>Çoğalt (Duplicate)</th></tr>
<tr><td>Ne yapar?</td><td>Yeni sorgu, eski sorgunun <b>sonucunu</b> kaynak alır</td><td>Eski sorgunun <b>tüm adımlarını</b> kopyalar</td></tr>
<tr><td>Kaynak değişirse</td><td>Değişiklik yeni sorguya da yansır</td><td>Bağımsızdır</td></tr>
<tr><td>Tipik kullanım</td><td>Ham satış sorgusundan Müşteriler ve Ürünler boyutlarını türetmek</td><td>Benzer ama ayrı bir kaynağa uyarlamak</td></tr>
<tr><td>Dikkat</td><td>Ara sorgunun “Yüklemeyi etkinleştir” seçeneğini kapat</td><td>Mantık iki yerde bakım ister</td></tr>
</table></div>
<h2>Düz tablodan yıldız şemaya</h2>
<p>Excel'den gelen tek ve geniş bir satış tablosunu (sipariş, müşteri adı, şehir, ürün adı, kategori, fiyat…) modele uygun hâle getirmek:</p>
<ol>
<li>Ham sorguya <b>Başvuru</b> ver → yalnızca müşteri sütunlarını seç → <b>Yinelenenleri kaldır</b> → <code>Musteriler</code> boyutu.</li>
<li>Aynısını ürün sütunları için yap → <code>Urunler</code>.</li>
<li>Boyutlarda doğal anahtar yoksa <b>Sütun ekle → Dizin sütunu</b> ile vekil anahtar (surrogate key) oluştur.</li>
<li>Olgu tablosunda boyutlarla <b>Sorguları birleştir</b> → anahtar sütunu genişlet → metin sütunlarını kaldır. Geriye anahtarlar ve sayılar kalır.</li>
<li>Ham ve ara sorgularda sağ tık → <b>Yüklemeyi etkinleştir</b> işaretini kaldır; modele yalnızca olgu ve boyutlar yüklensin.</li>
</ol>
<h2>Yarı yapılandırılmış veri: JSON</h2>
<p>Bir API'den gelen JSON, Power Query'de önce <b>Kayıt</b> ya da <b>Liste</b> olarak görünür:</p>
<ol>
<li>Liste → <b>Tabloya dönüştür</b>.</li>
<li>Kayıt sütununun başlığındaki genişlet düğmesi → alanları seç (iç içe kayıtlarda tekrar genişlet).</li>
<li>İç içe liste (bir siparişin satırları) → <b>Yeni satırlara genişlet</b>.</li>
</ol>
<pre class="m">let
    Kaynak = Json.Document(Web.Contents("https://api.ornek.com/siparisler")),
    Tablo = Table.FromList(Kaynak, Splitter.SplitByNothing(), {"Kayit"}),
    Genislet = Table.ExpandRecordColumn(Tablo, "Kayit", {"id", "tarih", "satirlar"}),
    Satirlar = Table.ExpandListColumn(Genislet, "satirlar"),
    Alanlar = Table.ExpandRecordColumn(Satirlar, "satirlar", {"urun", "adet", "fiyat"})
in
    Alanlar</pre>
<h2>Hataları çözmek</h2>
<ul>
<li><b>Veri türü hatası:</b> Sütunda “Hata” hücreleri → hücreye tıklayıp nedeni oku; Giriş → Satırları kaldır → <b>Hataları kaldır</b> ya da Dönüştür → <b>Hataları değiştir</b>.</li>
<li><b>“Sütun bulunamadı”:</b> Kaynakta sütun adı değişmiş; ilgili adımın formülünü düzelt.</li>
<li><b>Boş ve null:</b> Değerleri değiştir (null → 0 ya da “Bilinmiyor”); boyutlarda “Bilinmiyor” satırı bırakmak, olguda eşleşmeyen anahtarları gösterir.</li>
</ul>
<h2>Yükleme ayarları</h2>
<ul>
<li><b>Yüklemeyi etkinleştir:</b> Kapalıysa sorgu modele yüklenmez (ara adım).</li>
<li><b>Rapor yenilemeye dahil et:</b> Kapalıysa yenilemede atlanır (statik referans tabloları).</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Ham satış sorgusundan Müşteriler boyutunu türetmek istiyorsun; ham sorgudaki temizlik adımları değişince boyut da güncellensin.', o: ['Çoğalt', 'Başvuru', 'Ekleme', 'Yeni kaynak'], a: 1, why: 'Başvuru, kaynak sorgunun sonucunu kullanır; oradaki değişiklikler yansır.' },
    { t: 'mc', q: 'Ara bir sorgunun modelde tablo olarak görünmesini istemiyorsun ama diğer sorgular onu kullanıyor.', o: ['Sorguyu silmek', 'Yüklemeyi etkinleştir seçeneğini kapatmak', 'Rapor yenilemeye dahil etmemek', 'Gizlilik düzeyini Özel yapmak'], a: 1, why: 'Yüklemesi kapalı sorgu, Power Query\'de kalır ve diğer sorgulara kaynak olur.' },
    { t: 'mc', q: 'Bir sipariş JSON\'unda her siparişin içinde “satirlar” listesi var. Her satırın ayrı bir satır olması için?', o: ['Yeni satırlara genişlet', 'Değerleri ayıklamak', 'Özetten çıkar', 'Devrik'], a: 0, why: 'İç içe liste “Yeni satırlara genişlet” ile satırlara açılır.' },
    { t: 'mc', q: 'Bir özel (Private) kaynakla bir genel (Public) kaynağı birleştirirken “Formula.Firewall” hatası alıyorsun. Neden?', o: ['İnternet yok', 'Gizlilik düzeyleri, özel verinin genel kaynağa sızmasını önlemek için birleştirmeyi kısıtlıyor', 'M kodu büyük/küçük harf hatalı', 'DAX hatası'], a: 1, why: 'Gizlilik düzeyleri Power Query\'nin veri sızıntısını önleme mekanizmasıdır.' }
  ]
},

{
  id: 'rol-oynayan', lv: 'B2', mod: 'Veri Modelleme', min: 16,
  title: 'Rol oynayan boyutlar ve USERELATIONSHIP',
  sum: 'Bir tarih tablosu, iki tarih sütunu: sipariş ve teslim tarihi. Pasif ilişkiyi ölçüde etkinleştirmek.',
  body: `
<h2>Sorun</h2>
<p><code>Satislar</code> tablosunda iki tarih var: <code>Tarih</code> (sipariş) ve <code>TeslimTarihi</code>. İkisi de <code>Tarih</code> tablosuna bağlanmak ister. Ama iki tablo arasında aynı anda yalnızca <b>bir etkin ilişki</b> olabilir. Diğeri <b>pasif</b> (model diyagramında kesik çizgi) kalır.</p>
<p>Bu modelde <code>Satislar[Tarih]</code> → <code>Tarih[Tarih]</code> etkin, <code>Satislar[TeslimTarihi]</code> → <code>Tarih[Tarih]</code> pasif. Tarih tablosu iki “rol” oynar: sipariş takvimi ve teslim takvimi.</p>
<h2>Çözüm 1: USERELATIONSHIP</h2>
<pre class="dax">Teslime Göre Satış =
CALCULATE(
    [Net Satış],
    USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih])
)</pre>
<p><code>USERELATIONSHIP</code> yalnızca <code>CALCULATE</code> içinde çalışır ve o hesap süresince pasif ilişkiyi etkinleştirir; aynı tablolar arasındaki etkin ilişki geçici olarak devre dışı kalır. Aralık 2023'te verilip Ocak 2024'te teslim edilen sipariş, sipariş ölçüsünde Aralık'a, teslim ölçüsünde Ocak'a yazılır.</p>
<h2>Çözüm 2: Boyutu çoğaltmak</h2>
<p>İkinci bir tarih tablosu (<code>TeslimTarihi</code> tablosu) oluşturup etkin ilişkiyle bağlamak. Avantajı: kullanıcı aynı görselde iki tarihi ayrı eksenlere koyabilir (ör. sipariş ayı × teslim ayı matrisi). Dezavantajı: model büyür, iki takvim bakım ister, zaman zekâsı ölçüleri hangi takvimi kullandığını bilmelidir.</p>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Önerilen</th></tr>
<tr><td>Birkaç ölçü ikinci tarihe göre hesaplanacak</td><td>USERELATIONSHIP</td></tr>
<tr><td>Kullanıcı iki tarihi aynı anda dilimleyecek / eksene koyacak</td><td>İkinci tarih tablosu</td></tr>
<tr><td>Çok sayıda rol (sipariş, kargo, teslim, fatura)</td><td>Genellikle ölçüler + USERELATIONSHIP; gerekirse hesaplama grubu</td></tr>
</table></div>
<h2>CROSSFILTER</h2>
<p>Aynı aileden: <code>CROSSFILTER(Sütun1, Sütun2, BOTH | NONE | ONEWAY)</code> bir ilişkinin filtre yönünü hesap süresince değiştirir. Modelde ilişkiyi kalıcı olarak çift yönlü yapmak yerine yalnızca gereken ölçüde kullanılır:</p>
<pre class="dax">Satılan Ürün Sayısı =
CALCULATE(
    COUNTROWS(Urunler),
    CROSSFILTER(Satislar[UrunNo], Urunler[UrunNo], BOTH)
)</pre>
<p>Kanal dilimleyicisinde “Mağaza” seçiliyse bu ölçü mağazada satılmış ürün sayısını verir; çünkü filtre bu ölçüde Satislar'dan Urunler'e de akar.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Teslime Göre Satış</b>: <code>[Net Satış]</code> ölçüsünü teslim tarihine göre hesapla (pasif ilişkiyi etkinleştir).', name: 'Teslime Göre Satış', sol: 'CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))', hint: 'CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))', grid: [{ t: 'Tarih', c: 'YilAy' }, { t: 'Tarih', c: 'Yil' }], explain: 'Ay sınırında teslim edilen siparişler bir sonraki aya kayar. Toplam satırı farklıdır: Aralık 2024\'te verilip 2025\'te teslim edilecek siparişlerin teslim tarihi takvimde yok.' },
    { t: 'dax', q: '<b>Teslim Edilen Sipariş</b>: Teslim tarihine göre benzersiz sipariş sayısı (iptal edilmeyenler).', name: 'Teslim Edilen Sipariş', sol: 'CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]), Satislar[Durum] <> "İptal")', grid: [{ t: 'Tarih', c: 'YilAy' }], explain: 'USERELATIONSHIP ve normal filtreler aynı CALCULATE\'te birlikte kullanılabilir.' },
    { t: 'dax', q: '<b>Satılan Ürün Sayısı</b>: Seçili kanalda (ya da kırılımda) en az bir kez satılmış ürün sayısı. Urunler satırlarını say; filtrenin Satislar\'dan Urunler\'e akması için CROSSFILTER kullan.', name: 'Satılan Ürün Sayısı', sol: 'CALCULATE(COUNTROWS(Urunler), CROSSFILTER(Satislar[UrunNo], Urunler[UrunNo], BOTH))', grid: [{ t: 'Satislar', c: 'Kanal' }, { t: 'Tarih', c: 'Yil' }], explain: 'Normalde Satislar[Kanal] filtresi Urunler\'e ulaşmaz ve sonuç her satırda 40 olur. CROSSFILTER(…, BOTH) bu ölçü için ilişkiyi çift yönlü yapar.' },
    { t: 'mc', q: 'Model diyagramında kesik çizgiyle gösterilen ilişki nedir?', o: ['Çift yönlü ilişki', 'Pasif ilişki', 'Çoka-çok ilişki', 'Bozuk ilişki'], a: 1, why: 'Pasif ilişkiler kesik çizgiyle gösterilir ve yalnızca USERELATIONSHIP ile kullanılır.' }
  ]
},

{
  id: 'yari-toplanabilir', lv: 'B2', mod: 'DAX Kalıpları', min: 16,
  title: 'Yarı toplanabilir ölçüler: stok, bakiye, nüfus',
  sum: 'Bazı boyutlarda toplanan, zamanda toplanmayan değerler; dönem sonu, dönem başı ve ortalama bakiye.',
  body: `
<h2>Üç tür ölçü</h2>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Örnek</th><th>Davranış</th></tr>
<tr><td>Toplanabilir</td><td>Satış tutarı, adet</td><td>Her boyutta toplanır</td></tr>
<tr><td>Yarı toplanabilir</td><td>Stok adedi, banka bakiyesi, çalışan sayısı, abone sayısı</td><td>Ürünler/şubeler arasında toplanır; zamanda toplanmaz</td></tr>
<tr><td>Toplanamaz</td><td>Oran, ortalama, yüzde</td><td>Hiçbir boyutta toplanmaz; her düzeyde yeniden hesaplanır</td></tr>
</table></div>
<p><code>StokGorunum</code> tablosu her ürünün her ay sonundaki stokunu tutar. 2024 satırında <code>SUM(StokGorunum[StokAdet])</code> 12 ayın stokunu toplar; gerçek stokun yaklaşık 12 katıdır. Doğru cevap: yılın <b>son</b> görüntüsü.</p>
<h2>Dönem sonu (kapanış) değeri</h2>
<pre class="dax">Stok Adedi =
VAR SonTarih = CALCULATE(MAX(StokGorunum[Tarih]))
RETURN CALCULATE(SUM(StokGorunum[StokAdet]), Tarih[Tarih] = SonTarih)</pre>
<p>Alternatifler: <code>LASTNONBLANK(Tarih[Tarih], CALCULATE(COUNTROWS(StokGorunum)))</code> veri olan son günü bulur; <code>CLOSINGBALANCEMONTH / QUARTER / YEAR</code> takvimin son gününü kullanır (o gün veri yoksa boş döner).</p>
<div class="warn"><b>Ürün bazında farklı son tarih</b>Bazı ürünler son ayda kaydedilmemişse, ürünlerin kendi son değerlerini toplamak gerekir: <code>SUMX(VALUES(Urunler[UrunNo]), CALCULATE(SUM(StokGorunum[StokAdet]), LASTNONBLANK(Tarih[Tarih], CALCULATE(COUNTROWS(StokGorunum)))))</code>.</div>
<h2>Dönem başı ve ortalama bakiye</h2>
<pre class="dax">Açılış Stoku =
CALCULATE([Stok Adedi], PREVIOUSDAY(STARTOFMONTH(Tarih[Tarih])))

Ortalama Stok =
AVERAGEX(VALUES(Tarih[YilAy]), [Stok Adedi])</pre>
<p>Ortalama stok, stok devir hızı hesabında kullanılır: <code>Stok Devir Hızı = DIVIDE([Net Maliyet], [Ortalama Stok Değeri])</code>.</p>
<h2>Toplanabilir yanı unutma</h2>
<p><code>GelenAdet</code> (depoya giren) toplanabilir bir hareket ölçüsüdür: <code>SUM</code> doğrudur. İyi bir stok raporu ikisini birlikte gösterir: hareket (giren/çıkan) ve görüntü (bakiye). <button class="lnk" data-go="dash" data-id="stok">Stok raporu</button> bu ayrımı kullanıyor.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Stok Adedi (Kapanış)</b>: Seçili dönemde stok kaydı olan son tarihteki toplam stok adedi.', name: 'Stok Adedi (Kapanış)', start: 'VAR SonTarih = CALCULATE(MAX(StokGorunum[Tarih]))\nRETURN\n', sol: 'VAR SonTarih = CALCULATE(MAX(StokGorunum[Tarih]))\nRETURN CALCULATE(SUM(StokGorunum[StokAdet]), Tarih[Tarih] = SonTarih)', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Tarih', c: 'YilCeyrek' }, { t: 'Kategoriler', c: 'Kategori' }], explain: 'Yıl ve çeyrek satırlarında dönemin son ay sonu kullanılır; kategoriler arasında toplanır. Toplam satırında 31.12.2024 stoku.' },
    { t: 'dax', q: '<b>Ortalama Stok</b>: Görünen ayların (Tarih[YilAy]) ay sonu stok adetlerinin ortalaması. Hazır <code>[Stok Adedi]</code> ölçüsünü kullan.', name: 'Ortalama Stok', sol: 'AVERAGEX(VALUES(Tarih[YilAy]), [Stok Adedi])', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Kategoriler', c: 'Kategori' }], explain: 'AVERAGEX her ay için kapanış stokunu hesaplar (bağlam geçişi) ve ortalamasını alır.' },
    { t: 'mc', q: 'Bir bankanın “müşteri mevduat bakiyesi” ölçüsü için hangisi doğru?', o: ['SUM(Bakiye) her düzeyde doğrudur', 'Müşteriler arasında toplanır, zamanda dönem sonu değeri alınır', 'Hiç toplanmaz', 'Ortalama alınır'], a: 1, why: 'Bakiye yarı toplanabilirdir: aynı anda farklı müşterilerin bakiyesi toplanır, farklı günlerin bakiyesi toplanmaz.' }
  ]
},

{
  id: 'hikaye', lv: 'B2', mod: 'Görselleştirme', min: 20,
  title: 'Raporla hikâye anlatmak: yer işareti, araç ipucu, detay, gezinme',
  sum: 'Yer işaretleri ve düğmeler, rapor sayfası araç ipuçları, detay sayfaları, sayfa gezgini, seçim bölmesi ve katmanlar.',
  body: `
<h2>Seçim bölmesi: katmanlar ve gruplar</h2>
<p>Görünüm → <b>Seçim</b>. Sayfadaki her nesne (görsel, şekil, düğme) listelenir. Buradan:</p>
<ul>
<li>Nesneleri <b>gizle/göster</b> (göz simgesi). Yer işaretleri bu görünürlüğü kaydeder.</li>
<li><b>Katman sırasını</b> değiştir (arka plan kutusu altta, grafik üstte).</li>
<li><b>Grupla</b> (Ctrl + G): bir kart, başlığı ve arka planı tek nesne gibi taşınır ve gizlenir.</li>
<li><b>Sekme sırası</b>: klavyeyle gezinme sırası (erişilebilirlik).</li>
</ul>
<h2>Yer işaretleri</h2>
<p>Görünüm → <b>Yer işaretleri</b> → Ekle. Bir yer işareti sayfanın o anki durumunu kaydeder. Yer işaretinin <b>…</b> menüsünde neleri kaydedeceğini seçersin:</p>
<div class="tbl-wrap"><table>
<tr><th>Seçenek</th><th>Kaydeder</th><th>Kapalıysa</th></tr>
<tr><td>Veri</td><td>Filtreler, dilimleyiciler, sıralama, detaya inme durumu</td><td>Yer işaretine geçince filtreler değişmez</td></tr>
<tr><td>Görüntü</td><td>Görünürlük (Seçim bölmesi), odak modu</td><td>Görünürlük değişmez</td></tr>
<tr><td>Geçerli sayfa</td><td>Hangi sayfada olunduğu</td><td>Yer işareti bulunulan sayfada uygulanır</td></tr>
<tr><td>Tüm görseller / Seçili görseller</td><td>Kapsam</td><td>Yalnızca seçili görsellere uygulanır</td></tr>
</table></div>
<h3>Klasik kalıp: Grafik ↔ Tablo geçişi</h3>
<ol>
<li>Aynı yere bir grafik ve aynı veriyi gösteren bir tablo koy.</li>
<li>Seçim bölmesinde tabloyu gizle → “Grafik” yer işareti (yalnızca <b>Görüntü</b> açık, Veri kapalı; böylece kullanıcının filtreleri korunur).</li>
<li>Grafiği gizle, tabloyu göster → “Tablo” yer işareti.</li>
<li>İki düğme ekle (Ekle → Düğmeler) → Biçim → <b>Eylem</b> → Tür: Yer işareti → ilgili yer işareti.</li>
</ol>
<p>Birden çok yer işaretini bir <b>yer işareti grubu</b>na koyup Ekle → Düğmeler → <b>Yer işareti gezgini</b> ile sekme gibi görünen bir düğme şeridi oluşturabilirsin.</p>
<h2>Rapor sayfası araç ipuçları</h2>
<ol>
<li>Yeni sayfa → Biçim → Sayfa bilgileri → <b>Araç ipucu olarak kullan</b>: Açık. Tuval ayarları → Tür: <b>Araç ipucu</b> (küçük boyut).</li>
<li>Bu sayfaya küçük görseller koy (ör. kategorinin aylık eğilimi + iki kart).</li>
<li>Ana sayfadaki görselin Biçim → Genel → <b>Araç ipuçları</b> → Tür: Rapor sayfası → Sayfa: bu sayfa.</li>
</ol>
<p>Fareyle bir çubuğun üzerine gelince, mini sayfa o çubuğun filtresiyle (ör. Kategori = Kitap) açılır. <button class="lnk" data-go="dash">Örnek raporlar</button>'da kategori grafiklerinin üzerine gelince açılan mini eğilim grafiği bu özelliğin benzetimidir.</p>
<h2>Detay sayfası (drillthrough)</h2>
<ol>
<li>“Ürün Detayı” sayfası oluştur; <code>Urunler[Urun]</code> alanını Görselleştirmeler bölmesindeki <b>Detaylandırma</b> kutusuna sürükle.</li>
<li>“Tüm filtreleri koru” açıksa kaynak sayfadaki diğer filtreler (yıl, kanal) de taşınır.</li>
<li>Power BI sayfaya otomatik bir <b>geri</b> düğmesi ekler.</li>
<li>Kullanıcı herhangi bir sayfada bir ürüne sağ tık → <b>Detaya git</b> → Ürün Detayı.</li>
<li>Daha keşfedilebilir yol: bir düğmenin Eylem türünü <b>Detaya git</b> yap; düğme, kullanıcı bir ürün seçince etkin olur. Düğme metnini ölçüyle dinamik yapabilirsin: <code>"Ayrıntı: " &amp; SELECTEDVALUE(Urunler[Urun], "bir ürün seç")</code>.</li>
</ol>
<h2>Gezinme</h2>
<ul>
<li><b>Sayfa gezgini</b> (Ekle → Düğmeler → Gezgin → Sayfa gezgini): Tüm görünür sayfalar için otomatik düğmeler. Gizli sayfalar dahil edilmez.</li>
<li><b>Düğme eylemleri:</b> Geri, Yer işareti, Detaya git, Sayfa gezintisi, Web URL'si, Tüm dilimleyicileri temizle (yeni “Filtreleri temizle” eylemi).</li>
<li><b>Dilimleyicileri eşitle:</b> Bir dilimleyiciyi seç → Görünüm → Dilimleyicileri eşitle → hangi sayfalarda eşitleneceğini ve görüneceğini işaretle. “Görünür değil ama eşitlenmiş” bir dilimleyici, seçimi sayfadan sayfaya taşır.</li>
</ul>
<div class="tip"><b>Hikâye akışı</b>İyi bir rapor bir soru zinciridir: Özet sayfası (ne oldu?) → Analiz sayfası (neden?) → Detay sayfası (hangi kayıtlar?). Gezinmeyi bu sıraya göre kur; kullanıcı her zaman bir “Geri” ve “Filtreleri temizle” düğmesi bulsun.</div>
`,
  ex: [
    { t: 'mc', q: 'Grafik/Tablo geçişi yapan bir yer işareti, kullanıcının seçtiği yıl filtresini sıfırlıyor. Ne yapmalısın?', o: ['Yer işaretinde “Veri” seçeneğini kapatmak', 'Yer işaretini silmek', 'Dilimleyiciyi kilitlemek', 'Sayfayı gizlemek'], a: 0, why: '“Veri” kapalıysa yer işareti filtreleri değiştirmez; yalnızca görünürlüğü uygular.' },
    { t: 'mc', q: 'Bir çubuğun üzerine gelince o kategorinin aylık eğilimini gösteren küçük bir grafik açılsın istiyorsun.', o: ['Detay sayfası', 'Rapor sayfası araç ipucu', 'Yer işareti', 'Sayfa gezgini'], a: 1, why: 'Araç ipucu olarak işaretlenmiş sayfa, üzerine gelinen veri noktasının filtresiyle açılır.' },
    { t: 'mc', q: 'Bir sayfadaki Yıl dilimleyicisi seçiminin diğer 4 sayfaya da taşınmasını istiyorsun ama diğer sayfalarda dilimleyici görünmesin.', o: ['Dilimleyicileri eşitle: eşitle açık, görünür kapalı', 'Her sayfaya ayrı dilimleyici', 'Rapor filtresi', 'Yer işareti'], a: 0, why: 'Eşitlenmiş ama görünmez dilimleyici seçimi taşır.' },
    { t: 'dax', q: '<b>Detay Düğmesi Metni</b>: Tek ürün seçiliyse "Ayrıntı: Ürün adı", değilse "Ayrıntı için bir ürün seç" döndür.', name: 'Detay Düğmesi Metni', sol: 'IF(HASONEVALUE(Urunler[Urun]), "Ayrıntı: " & SELECTEDVALUE(Urunler[Urun]), "Ayrıntı için bir ürün seç")', grid: [{ t: 'Urunler', c: 'Urun' }], explain: 'Düğmenin Metin alanı fx ile bu ölçüye bağlanır; düğme, kullanıcı bir ürün seçince ne yapacağını söyler.' }
  ]
},

{
  id: 'analiz-ozellikleri', lv: 'B2', mod: 'Analiz', min: 18,
  title: 'Analiz özellikleri ve yapay zekâ görselleri',
  sum: 'Referans çizgileri, hata çubukları, tahmin, anomali, Analiz (artışı açıkla), anahtar etkileyiciler, ayrıştırma ağacı, Copilot anlatısı ve Copilot için veriyi hazırlama.',
  body: `
<h2>Analiz bölmesi</h2>
<p>Bir grafik seçiliyken Görselleştirmeler bölmesindeki <b>büyüteç</b> simgesi. Seçenekler görsel türüne göre değişir:</p>
<div class="tbl-wrap"><table>
<tr><th>Öğe</th><th>Ne çizer?</th><th>Ne zaman?</th></tr>
<tr><td>Sabit çizgi</td><td>Elle verilen değerde yatay çizgi (fx ile ölçüye bağlanabilir)</td><td>Hedef, eşik, bütçe</td></tr>
<tr><td>Ortalama / Medyan</td><td>Görünen noktaların ortalaması / ortancası</td><td>“Ortalamanın üstündekiler”</td></tr>
<tr><td>Minimum / Maksimum</td><td>Uç değer çizgisi</td><td>Aralığı vurgulamak</td></tr>
<tr><td>Yüzdebirlik</td><td>Ör. 90. yüzdebirlik</td><td>Üst dilimi ayırmak</td></tr>
<tr><td>Eğilim çizgisi</td><td>Doğrusal regresyon</td><td>Uzun dönem yön (çizgi ve dağılımda)</td></tr>
<tr><td>Tahmin</td><td>Gelecek dönemler + güven aralığı (üstel düzeltme)</td><td>Yalnızca sürekli tarih eksenli çizgi grafikte</td></tr>
<tr><td>Hata çubukları</td><td>Her noktada üst/alt sınır (ölçülerden)</td><td>Belirsizlik, hedef aralığı, min–max</td></tr>
<tr><td>Anomali bul</td><td>Beklenen aralığın dışındaki noktalar ve açıklamaları</td><td>Zaman serisinde sıra dışı aylar</td></tr>
<tr><td>Gölge alan / X ekseni sabit çizgisi</td><td>Dağılım grafiğinde bölgeler</td><td>Dört bölgeli (kadran) analiz</td></tr>
</table></div>
<p><b>Tahmin</b> ayarları: tahmin uzunluğu (ör. 6 ay), güven aralığı (%95), mevsimsellik (otomatik ya da 12), son N noktayı yok say (eksik son ayı tahmine katmamak için).</p>
<h2>Analiz et: artışı / azalışı açıkla</h2>
<p>Bir çizgi ya da sütun grafikteki noktaya sağ tık → <b>Analiz et</b> → <b>Artışı açıkla</b>. Power BI modeldeki diğer alanları tarar ve değişime en çok katkı yapan kırılımları (ör. “Mobil kanaldaki Elektronik”) küçük grafiklerle gösterir. “Dağılım bakımından farklılıkları bul” ise bir kategorinin diğerlerinden hangi alanda ayrıştığını gösterir.</p>
<h2>Yapay zekâ görselleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Görsel</th><th>Soru</th><th>Kurulum</th></tr>
<tr><td><b>Anahtar etkileyiciler</b></td><td>“İade olasılığını en çok ne artırıyor?”</td><td>Çözümle: hedef (Durum = İade ya da bir ölçü). Açıklayan: Kanal, Kategori, İndirim bandı…</td></tr>
<tr><td><b>Ayrıştırma ağacı</b></td><td>“Bu toplam hangi parçalardan oluşuyor?”</td><td>Çözümle: ölçü. Açıklama ölçütü: boyutlar. Kullanıcı istediği sırayla dallanır; “Yüksek değer” yapay zekâ bölmesi en büyük dalı kendisi seçer.</td></tr>
<tr><td><b>Copilot (Soru-Cevap’ın yerine)</b></td><td>Doğal dil soruları, rapor özeti</td><td>Soru-Cevap Aralık 2026’da kaldırılıyor. Copilot’un doğru cevap vermesi için Giriş → Yapay zekâ için verileri hazırla: veri şeması, onaylı cevaplar, yapay zekâ talimatları (ciro = Net Satış).</td></tr>
<tr><td><b>Anlatı</b> (Copilot / akıllı anlatı)</td><td>Sayfanın özetini metin olarak yaz</td><td>Ekle → Anlatı. Metin filtrelerle güncellenir.</td></tr>
</table></div>
<h2>Aykırı değer ve anomali</h2>
<p>Yerleşik “Anomali bul” eğilimi ve mevsimselliği hesaba katar. Kendi kuralınla işaretlemek için z-skoru ölçüsü yazılır (İleri seviye Measure Lab: <i>Z-skoru ile aykırı ay tespiti</i>) ve koşullu biçimlendirmeyle renklendirilir.</p>
<div class="warn"><b>Dikkat</b>Tahmin ve yapay zekâ görselleri keşif araçlarıdır. Bir yönetim raporuna koymadan önce sonucun iş açısından mantıklı olup olmadığını kontrol et ve varsayımları (güven aralığı, mevsimsellik) görsel başlığında ya da notta belirt.</div>
`,
  ex: [
    { t: 'mc', q: 'Aylık satış çizgisinde gelecek 6 ayın tahminini ve güven aralığını göstermek için?', o: ['Analiz bölmesi → Tahmin (sürekli tarih ekseni gerekli)', 'Ayrıştırma ağacı', 'Sabit çizgi', 'Anahtar etkileyiciler'], a: 0, why: 'Tahmin yalnızca sürekli tarih eksenli çizgi grafiklerde çalışır.' },
    { t: 'mc', q: '“İadeleri en çok hangi faktörler artırıyor?” sorusu için en uygun görsel?', o: ['Anahtar etkileyiciler', 'Huni', 'Kart', 'Şelale'], a: 0, why: 'Anahtar etkileyiciler hedef bir sonucu en çok etkileyen alanları sıralar.' },
    { t: 'dax', q: '<b>Hedef Çizgisi</b>: Analiz bölmesinde sabit çizgiyi bağlamak için: görünen aylardaki aylık hedeflerin ortalaması. Görünen aylar (Tarih[YilAy]) üzerinde [Hedef]\'in ortalamasını al.', name: 'Hedef Çizgisi', sol: 'AVERAGEX(VALUES(Tarih[YilAy]), [Hedef])', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Kategoriler', c: 'Kategori' }], explain: 'Sabit çizginin değeri fx ile bir ölçüye bağlanır; ölçü görselin genel (eksensiz) bağlamında hesaplanır. Bu yüzden aylık ortalama hedefi vermesi için ayları dolaşırız.' }
  ]
},

{
  id: 'mobil-erisilebilirlik', lv: 'B2', mod: 'Görselleştirme', min: 14,
  title: 'Mobil düzen, erişilebilirlik, dışa aktarma ve kişiselleştirme',
  sum: 'Telefon için düzen, ekran okuyucu ve klavye, kontrast, dışa aktarma ayarları, görselleri kişiselleştir, otomatik sayfa yenileme.',
  body: `
<h2>Mobil düzen</h2>
<p>Görünüm → <b>Mobil düzen</b>. Telefon tuvaline sayfadaki görselleri sürüklersin; masaüstü düzeni değişmez. Mobil düzende görsellerin biçimini ayrıca (yalnızca mobil için) değiştirebilirsin.</p>
<ul>
<li>Üstte 2–4 kart, altında tek ana grafik, en altta dilimleyiciler.</li>
<li>Yatay çubuk grafik telefonda sütun grafikten iyi okunur.</li>
<li>Geniş tabloları mobil düzene koyma; detay sayfasına bırak.</li>
</ul>
<h2>Erişilebilirlik kontrol listesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Konu</th><th>Ne yapılır?</th></tr>
<tr><td>Alternatif metin</td><td>Her görsele (Genel → Alternatif metin); gerekirse ölçüyle dinamik</td></tr>
<tr><td>Sekme sırası</td><td>Seçim bölmesi → Sekme sırası; dekoratif şekilleri sekme sırasından çıkar</td></tr>
<tr><td>Kontrast</td><td>Metin/arka plan en az 4,5:1; açık gri üstüne beyaz yazı yok</td></tr>
<tr><td>Renk tek başına bilgi taşımasın</td><td>Durum için simge (▲ ▼), etiket ya da desen</td></tr>
<tr><td>Başlıklar</td><td>Her görselin açıklayıcı başlığı</td></tr>
<tr><td>Yazı boyutu</td><td>En az 10–12 pt</td></tr>
<tr><td>Veri tablosu olarak göster</td><td>Kullanıcı görselde Alt + Shift + F11 ile veriyi tablo olarak görebilir</td></tr>
<tr><td>Tema</td><td>Yüksek kontrast temalarda raporun okunur kalması</td></tr>
</table></div>
<h2>Dışa aktarma ayarları</h2>
<p>Dosya → Seçenekler → Geçerli dosya → <b>Rapor ayarları</b> ve Service'te rapor ayarları:</p>
<ul>
<li><b>Verileri dışa aktar:</b> Yok / Yalnızca özetlenmiş veri / Özetlenmiş ve temel veri. Hassas veride yalnızca özetlenmiş.</li>
<li>PDF, PowerPoint ve Excel'e dışa aktarmaya izin verme kiracı (tenant) yöneticisinin ayarlarına da bağlıdır.</li>
<li>Duyarlılık etiketleri dışa aktarılan dosyaya taşınır.</li>
</ul>
<h2>Kişiselleştirme</h2>
<p>Rapor ayarları → <b>Okuyucuların görselleri kişiselleştirmesine izin ver</b>. Okuyucu bir görselin türünü değiştirebilir, alan ekleyip çıkarabilir ve bunu kendi kişisel yer işareti olarak kaydedebilir; asıl rapor değişmez. Görsel başına kapatılabilir.</p>
<h2>Otomatik sayfa yenileme</h2>
<p>DirectQuery ya da gerçek zamanlı kaynaklarda sayfa ayarlarında <b>Sayfa yenileme</b>: sabit aralık (ör. 30 saniye) ya da <b>değişiklik algılama</b> (bir ölçünün değeri değişince yenile). Kapasite yöneticisi en kısa aralığı sınırlar.</p>
`,
  ex: [
    { t: 'mc', q: 'Hassas müşteri verisi içeren raporda kullanıcıların satır düzeyinde veriyi Excel\'e aktarmasını engellemek istiyorsun.', o: ['Verileri dışa aktar: Yalnızca özetlenmiş veri (ya da Yok)', 'Mobil düzen', 'Kişiselleştirmeyi açmak', 'Otomatik sayfa yenileme'], a: 0, why: 'Dışa aktarma ayarı temel (satır düzeyi) veriyi kapatır.' },
    { t: 'mc', q: 'Ekran okuyucu kullanan bir kullanıcı grafiğin ne gösterdiğini duymalı.', o: ['Alternatif metin', 'Gölge', 'Arka plan görseli', 'Kılavuz çizgisi'], a: 0, why: 'Ekran okuyucular alternatif metni okur.' },
    { t: 'dax', q: '<b>Alternatif Metin</b>: Ekran okuyucu için dinamik açıklama: "Net satış X TL, hedefe göre Y" — X için FORMAT([Net Satış], "#,0"), Y için FORMAT([Hedef Gerçekleşme %] - 1, "+0.0%;-0.0%").', name: 'Alternatif Metin', sol: '"Net satış " & FORMAT([Net Satış], "#,0") & " TL, hedefe göre " & FORMAT([Hedef Gerçekleşme %] - 1, "+0.0%;-0.0%")', grid: [{ t: 'Tarih', c: 'Yil' }], explain: 'Alternatif metin alanı fx ile ölçüye bağlanabilir; ekran okuyucu filtrelere göre güncellenen ana bulguyu okur.' }
  ]
}

);
