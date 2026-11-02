/* Kesit Power BI — orta seviye DAX derslerine "Uzmanlaş" genişletmeleri (bölüm 1): bağlam, CALCULATE, yineleyiciler, FILTER/ALL, VAR, sıralama, yarı toplanabilir, hızlı ölçü, zaman, hedef, rol oynayan */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, o) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('ext: ders yok', id); return; } if (o.html) l.body += '<section class="deep"><span class="eyebrow">Uzmanlaş</span>' + o.html + '</section>'; if (o.ex) l.ex = (l.ex || []).concat(o.ex); if (o.min) l.min += o.min; (W.PBI_EXT = W.PBI_EXT || []).push({ id, html: o.html || '', ex: o.ex || [] }); };

/* ---------------------------------------------------------------- baglam */
ext('baglam', { min: 14, html: `
<h2>Hesaplanmış sütun mu, ölçü mü?</h2>
<p>Satış müdürü iki şey istiyor: tabloda her satış satırının kâr marjı, kartta da “ortalama marjımız”. Hızlı çözüm şuna benzer: <code>Satislar</code> tablosuna bir hesaplanmış sütun (calculated column) eklenir, karta da bu sütunun ortalaması konur.</p>
<pre class="dax" data-notry>Satır Marjı =
DIVIDE(Satislar[Tutar] - Satislar[Maliyet], Satislar[Tutar])</pre>
<p>Sütun, yenileme sırasında her satır için bir kez hesaplanır. Bu bir <b>satır bağlamı</b> işidir ve sorun çıkarmaz. Sorun karttadır. Sütunun ortalaması her satırı eşit sayar: 50 ₺’lik bir kitap satırı ile 5.000 ₺’lik bir monitör satırı ortalamayı aynı ölçüde etkiler. Aynı hesabı ölçü olarak yazınca farkı görürsün:</p>
<pre class="dax">Satır Marjı Ortalaması =
AVERAGEX(
    FILTER(Satislar, Satislar[Durum] &lt;&gt; "İptal"),
    DIVIDE(Satislar[Tutar] - Satislar[Maliyet], Satislar[Tutar])
)</pre>
<p>Bu modelde satır ortalaması <b>%35,9</b> çıkar; hazır <code>[Kâr Marjı %]</code> ise <b>%36,5</b>. Fark kategori düzeyinde daha da açılır, üstelik yönü bile değişir:</p>
<div class="tbl-wrap"><table><tr><th>Kategori</th><th>[Kâr Marjı %] (toplam kâr / toplam satış)</th><th>Satır marjlarının ortalaması</th></tr>
<tr><td>Elektronik</td><td>%38,0</td><td>%36,9</td></tr>
<tr><td>Kozmetik</td><td>%35,1</td><td>%37,9</td></tr>
<tr><td>Tüm satışlar</td><td>%36,5</td><td>%35,9</td></tr></table></div>
<p>Kozmetikte küçük tutarlı satırların marjı yüksek, büyük tutarlı satırlarınki düşük. Satır ortalaması bu yüzden kategoriyi olduğundan iyi gösterir. Yöneticinin sorduğu “kazandığımız her 100 ₺’nin kaçı kâr?” sorusunun cevabı ilk sütundur.</p>
<div class="tbl-wrap"><table><tr><th>Soru</th><th>Hesaplanmış sütun</th><th>Ölçü</th></tr>
<tr><td>Ne zaman hesaplanır?</td><td>Yenilemede, bir kez</td><td>Her görsel sorgusunda, o hücrenin bağlamında</td></tr>
<tr><td>Hangi bağlamı görür?</td><td>Yalnızca satır bağlamı</td><td>Filtre bağlamı (dilimleyici, eksen, filtreler)</td></tr>
<tr><td>Bellek</td><td>Her satır için değer saklar, modeli büyütür</td><td>Saklamaz, yalnızca formül</td></tr>
<tr><td>Dilimleyici / eksen olabilir mi?</td><td>Evet</td><td>Hayır</td></tr>
<tr><td>Tipik kullanım</td><td>Gruplama etiketi (“Büyük sipariş”), sıralama anahtarı</td><td>Toplam, oran, pay, karşılaştırma</td></tr></table></div>
<div class="tip"><b>Karar kuralı</b>Sonucu dilimleyiciye, eksene ya da satır başlığına koyacaksan sütun yaz. Sonucu bir sayı olarak, kullanıcının seçimine göre değişsin istiyorsan ölçü yaz. Oranı, ortalamayı ve payı asla sütunda saklayıp sonra toplama ya da ortalama alma.</div>

<h2>Hesaplanmış sütunda filtre bağlamı yoktur</h2>
<p>İkinci klasik tuzak: <code>Urunler</code> tablosuna her ürünün cirosunu yazan bir sütun eklemek.</p>
<pre class="dax" data-notry>Ürün Cirosu = SUM(Satislar[Tutar])</pre>
<p>Beklenen, her ürün satırında o ürünün cirosu. Gerçekte her satırda aynı sayı çıkar: <b>1.346.190 ₺</b>, yani bütün satışlar. Sebep şu: hesaplanmış sütunda satır bağlamı vardır ama filtre bağlamı boştur. Satır bağlamı bir filtre değildir; ilişki üzerinden <code>Satislar</code>’a hiçbir şey yaymaz. <code>SUM</code> de filtre bağlamına baktığı için tüm tabloyu toplar.</p>
<p>Formülü <code>CALCULATE</code> içine alınca satır bağlamı bir filtreye dönüşür ve ilişki üzerinden yayılır. Bunun adı bağlam geçişidir; ayrıntısı İleri DAX’taki “Bağlam geçişi” dersinde. Etkisini bir sorguyla görebilirsin:</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    TOPN(3, Urunler, Urunler[UrunNo], ASC),
    "Ham SUM", SUM(Satislar[Tutar]),
    "CALCULATE ile", CALCULATE(SUM(Satislar[Tutar]))
)</pre>
<p>Kablosuz Kulaklık, Akıllı Saat ve Bluetooth Hoparlör satırlarında “Ham SUM” hep 1.346.190 ₺ çıkar. “CALCULATE ile” sütunu ise sırasıyla 42.762 ₺, 64.906 ₺ ve 33.032 ₺ verir. Bir ölçü referansı (<code>[Toplam Satış]</code>) yazsaydın, ölçüler kendiliğinden <code>CALCULATE</code> ile sarıldığı için sonuç doğru olurdu.</p>

<h2>Bir hücrenin filtre bağlamını okumak</h2>
<p>Bazen ölçünün kendi bağlamını bilmesi gerekir: “Toplam satırında mıyım? Kullanıcı kategori seçti mi?” Bunun için dört fonksiyon var ve her biri farklı bir soruya cevap verir:</p>
<div class="tbl-wrap"><table><tr><th>Fonksiyon</th><th>Sorduğu soru</th><th>Toplam satırında, dilimleyicide tek kategori seçiliyken</th></tr>
<tr><td><code>ISFILTERED(Kategoriler[Kategori])</code></td><td>Bu sütuna doğrudan bir filtre var mı?</td><td>DOĞRU</td></tr>
<tr><td><code>HASONEVALUE(Kategoriler[Kategori])</code></td><td>Görünen tek bir değer mi kaldı?</td><td>DOĞRU</td></tr>
<tr><td><code>ISINSCOPE(Kategoriler[Kategori])</code></td><td>Görselin gruplama düzeyi bu sütun mu?</td><td>YANLIŞ</td></tr>
<tr><td><code>COUNTROWS(VALUES(Kategoriler[Kategori]))</code></td><td>Kaç değer görünüyor?</td><td>1</td></tr></table></div>
<p>Toplam satırını gizlemek için <code>ISINSCOPE</code>, “tek bir seçim var mı?” sorusu için <code>HASONEVALUE</code> doğru araçtır. İkisini karıştırınca toplam satırı tek seçimde bir kategori gibi davranır. Hangi hücrede hangi cevabın geldiğini görmek için şu tanı ölçüsünü bir matrise koy:</p>
<pre class="dax">Bağlam Dedektörü =
SWITCH(
    TRUE(),
    ISINSCOPE(Kategoriler[Kategori]), "Kategori satırı",
    ISFILTERED(Kategoriler[Kategori]), "Toplam, kategori filtreli",
    "Filtre yok"
)</pre>
<div class="note"><b>Kontrol listesi: bağlam sorusu</b>1) Formül nerede çalışıyor: hesaplanmış sütun mu, ölçü mü, yineleyicinin içi mi? 2) Satır bağlamı varsa, ilişkili tabloyu süzmesi gerekiyor mu? Gerekiyorsa <code>CALCULATE</code> ya da ölçü referansı kullan. 3) Sonuç bir oran mı? Oransa ölçü yaz, sütunda saklama. 4) Toplam satırında ne görünmeli? <code>ISINSCOPE</code> ile karar ver.</div>
`, ex: [
  { t:'dax', name:'Satır Bazlı Marj Ortalaması', q:'<b>Satır Bazlı Marj Ortalaması</b>: İptal edilmeyen satışlar için her satırın marjını hesapla: (Tutar − Maliyet) / Tutar. Sonra bu satır marjlarının basit ortalamasını döndür. (Bu, [Kâr Marjı %] ile karşılaştırmak için yazılan “yanlış ortalama”dır.)', sol:'AVERAGEX(FILTER(Satislar, Satislar[Durum] <> "İptal"), DIVIDE(Satislar[Tutar] - Satislar[Maliyet], Satislar[Tutar]))', hint:'AVERAGEX’in ilk bağımsız değişkeni FILTER(Satislar, Satislar[Durum] <> "İptal") olsun; ikinci bağımsız değişkende DIVIDE ile satırın marjını hesapla.' },
  { t:'dax', name:'Kategori Filtresi Durumu', q:'<b>Kategori Filtresi Durumu</b>: Kategoriler[Kategori] sütununa doğrudan bir filtre varsa "Kategori seçili", yoksa "Tüm kategoriler" metnini döndür.', sol:'IF(ISFILTERED(Kategoriler[Kategori]), "Kategori seçili", "Tüm kategoriler")', hint:'ISFILTERED(Kategoriler[Kategori]) bir DOĞRU/YANLIŞ döndürür; IF ile iki metinden birini seç.' },
  { t:'query', q:'Her kategori için iki sütun döndüren bir sorgu yaz: "Ham" adlı sütunda <code>SUM(Satislar[Tutar])</code>, "Bağlamlı" adlı sütunda aynı ifadenin <code>CALCULATE</code> ile sarılmış hâli. Satırlar <code>VALUES(Kategoriler[Kategori])</code> olsun. İki sütunun neden farklı çıktığını sonuçta gör.', start:'EVALUATE\n', sol:'EVALUATE\nADDCOLUMNS(\n    VALUES(Kategoriler[Kategori]),\n    "Ham", SUM(Satislar[Tutar]),\n    "Bağlamlı", CALCULATE(SUM(Satislar[Tutar]))\n)', hint:'ADDCOLUMNS satır bağlamı açar. Satır bağlamı ilişki üzerinden süzmez; CALCULATE onu filtreye çevirir.' },
  { t:'mc', q:'Pazarlama ekibi siparişleri “Küçük / Orta / Büyük” diye üç gruba ayırıp bu grupları <b>dilimleyicide</b> kullanmak istiyor. Grup, siparişin kendi tutarına göre belirleniyor ve kullanıcı seçimiyle değişmiyor. Ne yaparsın?', o:['Grubu SWITCH ile döndüren bir ölçü yazar, dilimleyiciye o ölçüyü koyarım','Satislar’a grup sütunu ekler, dilimleyiciye onu koyarım','Grubu her görselde ayrı bir görsel filtresiyle elle tanımlarım','Gruplamayı Copilot’a bırakır, dilimleyiciyi Copilot panelinden yönetirim'], a:1, why:'Dilimleyiciye ve eksene yalnızca sütun konabilir; ölçü konamaz. Grup, satırın kendi değerinden çıkıyor ve seçime göre değişmiyor. Bu yüzden satır bağlamında bir kez hesaplanan sütun doğru araç. Görsel filtresiyle elle gruplama bakımı zorlaştırır. Copilot ise dilimleyici yönetmez.' },
  { t:'mc', q:'Bir analist Urunler tablosuna <code>Ürün Adedi = SUM(Satislar[Adet])</code> hesaplanmış sütununu ekledi. Her üründe aynı büyük sayı görünüyor. En doğru açıklama hangisi?', o:['Urunler ile Satislar arasındaki ilişki pasif olduğu için filtre geçmiyor','SUM yalnızca ölçülerde çalışır; sütunda her zaman genel toplamı döndürür','Sütunda filtre bağlamı yok; satır bağlamı Satislar’ı süzmez','Adet sütunu metin türünde olduğu için toplama yanlış yapılıyor'], a:2, why:'Hesaplanmış sütunda filtre bağlamı boştur. Satır bağlamı bir filtre değildir, ilişki üzerinden yayılmaz; SUM bu yüzden tüm Satislar’ı toplar. CALCULATE(SUM(...)) bağlam geçişiyle ürün filtresini oluşturur. İlişki modelde etkin; SUM sütunda da çalışır, yalnızca bağlam farklıdır.' }
] });

/* ---------------------------------------------------------------- calculate */
ext('calculate', { min: 14, html: `
<h2>Filtre bağımsız değişkeninin türleri</h2>
<p><code>CALCULATE</code>’in ilk bağımsız değişkeninden sonra yazdığın her şey ya bir <b>tablo</b> ya da bir <b>düzenleyicidir</b>. Boolean ifade bile perde arkasında tabloya çevrilir. Hangi türü yazdığını bilmek, sonucun neden öyle çıktığını açıklar:</p>
<div class="tbl-wrap"><table><tr><th>Tür</th><th>Örnek</th><th>Etkisi</th></tr>
<tr><td>Boolean (sütun koşulu)</td><td><code>Satislar[Kanal] = "Web"</code></td><td>O sütundaki dış filtrenin yerine geçer</td></tr>
<tr><td>Tablo ifadesi</td><td><code>FILTER(Satislar, …)</code>, <code>VALUES(…)</code>, bir tablo değişkeni</td><td>Tablonun satırları ve tüm sütunları filtre olur</td></tr>
<tr><td>Kaldırıcı</td><td><code>REMOVEFILTERS(Urunler)</code>, <code>ALL(Satislar[Kanal])</code></td><td>Filtreyi siler, yerine bir şey koymaz</td></tr>
<tr><td>Düzenleyici</td><td><code>KEEPFILTERS</code>, <code>USERELATIONSHIP</code>, <code>CROSSFILTER</code></td><td>Filtrenin nasıl birleşeceğini ya da ilişkinin nasıl çalışacağını değiştirir</td></tr></table></div>

<h2>Boolean filtrenin üç sınırı</h2>
<h3>1. İçinde ölçü olamaz</h3>
<pre class="dax" data-notry>Hatalı = CALCULATE([Net Satış], [Net Satış] &gt; 1000)</pre>
<p>Boolean filtre bir sütunun değerlerini süzer; ölçünün “sütunu” yoktur. Koşul bir ölçüye dayanıyorsa önce hangi satırlar üzerinde test edileceğini seçmen gerekir: <code>FILTER(VALUES(Urunler[Urun]), [Net Satış] &gt; 1000)</code>.</p>
<h3>2. Tek bir tablonun sütunlarını kullanabilir</h3>
<p>Kampanya ekibinin sorusu: “Web kanalından gelen <b>ya da</b> Kitap kategorisindeki satışlar ne kadar?” İlk deneme genellikle iki ayrı bağımsız değişkendir:</p>
<pre class="dax">Web ve Kitap (yanlış soru) =
CALCULATE([Net Satış], Satislar[Kanal] = "Web", Urunler[Kategori] = "Kitap")</pre>
<p>Ayrı bağımsız değişkenler <b>VE</b> ile birleşir: sonuç <b>57.545 ₺</b>, yani yalnızca web’den satılan kitaplar. <code>Satislar[Kanal] = "Web" || Urunler[Kategori] = "Kitap"</code> yazmak ise hata verir, çünkü koşul iki tabloya yayılıyor. Doğru yol, koşulu satır satır test eden bir tablo filtresidir:</p>
<pre class="dax">Web veya Kitap =
CALCULATE(
    [Net Satış],
    FILTER(Satislar, Satislar[Kanal] = "Web" || RELATED(Urunler[Kategori]) = "Kitap")
)</pre>
<p>Sonuç <b>551.668 ₺</b>. Sağlamasını yap: web 457.331 ₺ + kitap 151.882 ₺ − ikisinin kesişimi 57.545 ₺ = 551.668 ₺. Aynı tablodaki iki sütunla VEYA kurmak ise boolean filtreyle mümkündür: <code>Satislar[Indirim] &gt; 0 || Satislar[Kanal] = "Mağaza"</code> geçerli bir filtredir.</p>
<h3>3. Aynı sütuna iki koşul VE olur</h3>
<p><code>CALCULATE([Net Satış], Satislar[Kanal] = "Web", Satislar[Kanal] = "Mobil")</code> BLANK döndürür. Bir satır aynı anda hem Web hem Mobil olamaz. İki kanalı birlikte istiyorsan tek koşul yaz: <code>Satislar[Kanal] IN {"Web", "Mobil"}</code>.</p>

<h2>Filtre bağımsız değişkeni dış bağlamda hesaplanır</h2>
<p>Operasyon müdürü yıllık tabloda “her yılın son günündeki ciro” sütununu istiyor:</p>
<pre class="dax">Takvimin Son Günü =
CALCULATE([Net Satış], Tarih[Tarih] = MAX(Tarih[Tarih]))

Satışın Son Günü =
CALCULATE([Net Satış], Satislar[Tarih] = MAX(Satislar[Tarih]))</pre>
<p><code>MAX</code>, CALCULATE filtreyi değiştirmeden <b>önce</b>, hücrenin kendi bağlamında hesaplanır. Yıl satırında <code>MAX(Tarih[Tarih])</code> 31 Aralık’tır. 2022 ve 2023’te 31 Aralık’ta hiç satış olmadığı için ilk ölçü bu yıllarda BLANK döner; 2024’te 1.047 ₺ verir. İkinci ölçü satış olan son günü arar: 2022’de 2.871,95 ₺, 2023’te 1.216,40 ₺. Hangisi doğru? Soru “takvimin son günü” mü, “son işlem günü” mü? Bunu ölçü adında açıkça yaz.</p>

<h2>Boolean filtre mi, FILTER(Satislar, …) mı?</h2>
<p>İkisi çoğu zaman aynı sayıyı verir. Fark, dışarıda aynı sütuna bir filtre olduğunda ortaya çıkar. Satırlarda <code>Satislar[Kanal]</code> olan bir tabloda üç yazımı karşılaştır:</p>
<div class="tbl-wrap"><table><tr><th>Yazım</th><th>Mağaza satırı</th><th>Mobil satırı</th><th>Web satırı</th><th>Neden?</th></tr>
<tr><td><code>Satislar[Kanal] = "Web"</code></td><td>457.331</td><td>457.331</td><td>457.331</td><td>İçteki <code>ALL(Satislar[Kanal])</code> satır filtresinin yerine geçer</td></tr>
<tr><td><code>FILTER(Satislar, Satislar[Kanal] = "Web")</code></td><td>(boş)</td><td>(boş)</td><td>457.331</td><td>FILTER yalnızca görünen satırları dolaşır; dış filtre korunur</td></tr>
<tr><td><code>FILTER(ALL(Satislar), Satislar[Kanal] = "Web")</code></td><td>457.331</td><td>457.331</td><td>457.331</td><td>Tüm tablo filtresizleşir; kategori, tarih filtreleri de gider</td></tr></table></div>
<p>Üçüncü yazım en tehlikelisidir. Satırlarda kategori olan bir tabloda her satırda 457.331 ₺ görürsün, çünkü <code>ALL(Satislar)</code> genişletilmiş tablo üzerinden kategori filtresini de siler (bir sonraki derste). İkinci yazım dış filtreyi korur, ama bütün <code>Satislar</code> tablosunu dolaştığı için büyük modelde yavaştır. Dış filtreyle kesişim istiyorsan aynı sonucu daha ucuza <code>KEEPFILTERS(Satislar[Kanal] = "Web")</code> verir.</p>
<div class="note"><b>Karar ağacı</b>Koşul tek sütunda mı? Boolean yaz. Aynı tablonun birkaç sütununda mı? Yine boolean (<code>||</code>, <code>&amp;&amp;</code>). Birden çok tabloya mı yayılıyor ya da ölçü mü içeriyor? <code>FILTER</code> yaz ve dolaşılan tabloyu olabildiğince küçük seç (<code>VALUES(Urunler[Urun])</code> gibi). Dış filtreyi silmek değil kesiştirmek mi istiyorsun? <code>KEEPFILTERS</code> ekle.</div>
`, ex: [
  { t:'dax', name:'Web veya Kitap Satışı', q:'<b>Web veya Kitap Satışı</b>: Web kanalından gelen <i>ya da</i> Kitap kategorisindeki (Urunler[Kategori]) satışların [Net Satış] toplamı. İki koşul farklı tablolarda.', sol:'CALCULATE([Net Satış], FILTER(Satislar, Satislar[Kanal] = "Web" || RELATED(Urunler[Kategori]) = "Kitap"))', hint:'Boolean filtre iki tabloyu kapsayamaz. FILTER(Satislar, ...) içinde Urunler[Kategori] değerini RELATED ile oku ve koşulları || ile bağla.' },
  { t:'dax', name:'Satışın Son Günü Cirosu', q:'<b>Satışın Son Günü Cirosu</b>: Görünen dönemde satış yapılan son gündeki [Net Satış]. Son günü Satislar[Tarih] sütunundan bul.', sol:'CALCULATE([Net Satış], Satislar[Tarih] = MAX(Satislar[Tarih]))', hint:'MAX(Satislar[Tarih]) dış bağlamda hesaplanır ve o hücrede satış olan son günü verir; bunu Satislar[Tarih] üzerinde boolean filtre olarak kullan.' },
  { t:'dax', name:'Liste Fiyatı 1000+ Satışı', q:'<b>Liste Fiyatı 1000+ Satışı</b>: Liste fiyatı (Urunler[Fiyat]) 1.000 ₺ ya da üzerinde olan ürünlerin [Net Satış] toplamı. Tablo filtresi değil, sütun filtresi kullan.', sol:'CALCULATE([Net Satış], Urunler[Fiyat] >= 1000)', hint:'Koşul tek sütunda: CALCULATE([Net Satış], Urunler[Fiyat] >= 1000).' },
  { t:'query', q:'Kanal başına üç sütun döndüren bir sorgu yaz: "Net" ([Net Satış]), "Boolean" (<code>Satislar[Kanal] = "Web"</code> filtresiyle [Net Satış]) ve "FILTER" (<code>FILTER(Satislar, Satislar[Kanal] = "Web")</code> ile [Net Satış]). Satırlar Satislar[Kanal] olsun.', start:'EVALUATE\n', sol:'EVALUATE\nSUMMARIZECOLUMNS(\n    Satislar[Kanal],\n    "Net", [Net Satış],\n    "Boolean", CALCULATE([Net Satış], Satislar[Kanal] = "Web"),\n    "FILTER", CALCULATE([Net Satış], FILTER(Satislar, Satislar[Kanal] = "Web"))\n)', hint:'SUMMARIZECOLUMNS(Satislar[Kanal], "Ad", ifade, ...) kalıbını kullan. Boolean sütunu her satırda aynı, FILTER sütunu yalnızca Web satırında dolu çıkmalı.' },
  { t:'mc', q:'Bir ekip arkadaşın <code>CALCULATE([Net Satış], [Sipariş Sayısı] &gt;= 5)</code> yazdı ve hata aldı. Amacı “en az 5 siparişi olan müşterilerin satışı”. Ne önerirsin?', o:['Koşulu KEEPFILTERS içine almasını; ölçü filtresi böylece geçerli olur','Ölçüyü bir hesaplanmış sütuna çevirip koşulu o sütunda yazmasını','FILTER(VALUES(Satislar[MusteriNo]), …) tablosunu vermesini','İki CALCULATE’i iç içe yazıp koşulu dıştakine taşımasını'], a:2, why:'Boolean filtre bir sütunu süzer, içinde ölçü olamaz. Koşul ölçüye dayanıyorsa hangi satırlar üzerinde test edileceğini bir tabloyla seçmek gerekir: müşteri listesi. KEEPFILTERS ve iç içe CALCULATE bu kuralı değiştirmez. Sütun ise sipariş sayısını seçime göre değil sabit hesaplar; dönem filtresine tepki vermez.' }
] });

/* ---------------------------------------------------------------- iteratorler */
ext('iteratorler', { min: 14, html: `
<h2>Ağırlıklı ortalama: neyin ortalaması?</h2>
<p>Fiyatlama ekibi soruyor: “Ortalama satış fiyatımız ne kadar?” Bu soruya üç farklı ve üçü de savunulabilir cevap var. Hangisini verdiğini bilmezsen toplantıda üç farklı sayı dolaşır.</p>
<pre class="dax">Basit Ortalama Fiyat =
CALCULATE(AVERAGE(Satislar[BirimFiyat]), Satislar[Durum] &lt;&gt; "İptal")

Adet Ağırlıklı Fiyat =
CALCULATE(
    DIVIDE(SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat]), SUM(Satislar[Adet])),
    Satislar[Durum] &lt;&gt; "İptal"
)

İndirimli Birim Gelir = DIVIDE([Net Satış], [Satılan Adet])</pre>
<div class="tbl-wrap"><table><tr><th>Ölçü</th><th>Sonuç</th><th>Cevapladığı soru</th></tr>
<tr><td>Basit ortalama</td><td>710,16 ₺</td><td>“Ortalama bir satış satırındaki fiyat ne?” Her satır bir oy.</td></tr>
<tr><td>Adet ağırlıklı</td><td>537,83 ₺</td><td>“Sattığımız ortalama bir ürünün liste fiyatı ne?” Her adet bir oy.</td></tr>
<tr><td>İndirimli birim gelir</td><td>520,72 ₺</td><td>“Bir adetten ortalama ne kazanıyoruz?” İndirim de hesapta.</td></tr></table></div>
<p>Basit ortalama en yüksek çıkıyor, çünkü pahalı ürünler genellikle tek adet satılıyor; ucuz kitaplar ise satır başına daha çok adetle. Basit ortalama her satırı eşit saydığı için pahalı satırlar ortalamayı yukarı çeker. Ağırlıklı ortalamanın genel kalıbı her zaman aynıdır:</p>
<pre class="dax" data-notry>Ağırlıklı Ortalama =
DIVIDE(SUMX(Tablo, Ağırlık * Değer), SUMX(Tablo, Ağırlık))</pre>
<p>İndirimde de durum benzer. <code>AVERAGE(Satislar[Indirim])</code> tüm satırlar için %3,25 verir; brüt tutarla ağırlıklandırılmış indirim oranı %3,15’tir. Kategori düzeyinde fark büyür: Ev &amp; Yaşam’da satır ortalaması %3,81 iken ciro ağırlıklı oran %4,19. Bu kategoride indirim büyük tutarlı satışlarda yoğunlaşıyor. Satır ortalamasına bakan biri bunu kaçırır.</p>

<h2>Hangi tabloyu dolaşıyorsun?</h2>
<p>Bir yineleyicinin ilk bağımsız değişkeni, sorunun <b>tanecik (grain)</b> düzeyidir. Aynı ifade farklı tablolar üzerinde farklı sorulara cevap verir:</p>
<div class="tbl-wrap"><table><tr><th>Dolaşılan tablo</th><th>Örnek</th><th>Soru</th></tr>
<tr><td><code>Satislar</code></td><td><code>AVERAGEX(Satislar, …)</code></td><td>Satır başına</td></tr>
<tr><td><code>VALUES(Satislar[SiparisNo])</code></td><td>Sipariş başına ortalama tutar</td><td>Sipariş başına</td></tr>
<tr><td><code>VALUES(Tarih[YilAy])</code></td><td><code>MAXX(VALUES(Tarih[YilAy]), [Net Satış])</code></td><td>En iyi ay: 94.001 ₺ (Aralık 2024)</td></tr>
<tr><td><code>VALUES(Kategoriler[Kategori])</code></td><td>Kategorilerin ortalaması</td><td>Kategori başına</td></tr></table></div>
<h3>Boş aylar tuzağı</h3>
<p>“Aylık ortalama satışımız ne?” sorusunu <code>AVERAGEX(VALUES(Tarih[YilAy]), [Net Satış])</code> ile cevaplarsın. Ama <code>AVERAGEX</code> BLANK sonuçları atlar. Bu modelde satışlar Haziran 2022’de başlıyor; 2022’de satış olan yalnızca 7 ay var.</p>
<pre class="dax">Satışlı Ay Ortalaması =
AVERAGEX(VALUES(Tarih[YilAy]), [Net Satış])

Takvim Ayı Ortalaması =
AVERAGEX(VALUES(Tarih[YilAy]), [Net Satış] + 0)</pre>
<p>2022 satırında ilk ölçü 14.691 ₺ (7 aya bölünür), ikincisi 8.570 ₺ (12 aya bölünür) verir. Tüm dönemde 40.347 ₺’ye karşı 34.744 ₺. Hangisi doğru? “Faaliyet gösterdiğimiz aylarda ortalama” sorusu için ilki, “yıllık bütçeyi 12’ye böl” sorusu için ikincisi. <code>+ 0</code> hilesini dikkatli kullan: verinin henüz gelmediği gelecek ayları da sıfır sayar.</p>

<h2>Yineleyicide çıplak toplayıcı tuzağı</h2>
<p>Yineleyicinin içinde ölçü yerine doğrudan <code>AVERAGE</code> ya da <code>SUM</code> yazarsan, satır bağlamı ilişki üzerinden süzmez:</p>
<pre class="dax">EVALUATE
ADDCOLUMNS(
    VALUES(Kategoriler[Kategori]),
    "Çıplak", AVERAGE(Satislar[BirimFiyat]),
    "CALCULATE ile", CALCULATE(AVERAGE(Satislar[BirimFiyat]))
)</pre>
<p>“Çıplak” sütunu her kategoride 704,80 ₺ gösterir: tüm satırların ortalaması. “CALCULATE ile” sütunu ise Elektronik’te 1.462 ₺, Kitap’ta 218,80 ₺ verir. Bu hatayı fark etmenin en kolay yolu sütundaki değerlerin hepsinin aynı olmasıdır. Ölçü referansı kullanırsan (<code>[Ortalama Birim Fiyat]</code>) <code>CALCULATE</code> otomatik eklenir.</p>
<div class="note"><b>Kontrol listesi: yineleyici yazarken</b>1) Sorunun tanecik düzeyi ne: satır, sipariş, müşteri, ay? İlk bağımsız değişken o olsun. 2) Ortalama mı istiyorsun, ağırlıklı ortalama mı? Ağırlığı açıkça yaz. 3) BLANK değerler atlansın mı, sıfır mı sayılsın? 4) İçerideki ifade ölçü değilse <code>CALCULATE</code> gerekiyor mu? 5) Dolaşılan tablo gereğinden büyük mü? 1.620 satır yerine 7 kategori dolaşmak çok daha ucuzdur.</div>
`, ex: [
  { t:'dax', name:'Adet Ağırlıklı Liste Fiyatı', q:'<b>Adet Ağırlıklı Liste Fiyatı</b>: İptal edilmeyen satışlarda birim fiyatın (Satislar[BirimFiyat]) adet ile ağırlıklandırılmış ortalaması: Σ(Adet × BirimFiyat) / Σ Adet.', sol:'CALCULATE(DIVIDE(SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat]), SUM(Satislar[Adet])), Satislar[Durum] <> "İptal")', hint:'Pay SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat]), payda SUM(Satislar[Adet]). İkisini DIVIDE ile böl, bütününü CALCULATE ile iptal hariç hesapla.' },
  { t:'dax', name:'Ciro Ağırlıklı İndirim %', q:'<b>Ciro Ağırlıklı İndirim %</b>: Tüm satırlarda indirim oranının brüt tutarla (Adet × BirimFiyat) ağırlıklandırılmış ortalaması. Pay: Σ(Adet × BirimFiyat × Indirim), payda: Σ(Adet × BirimFiyat).', sol:'DIVIDE(SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat] * Satislar[Indirim]), SUMX(Satislar, Satislar[Adet] * Satislar[BirimFiyat]))', hint:'İki ayrı SUMX yaz: biri indirim tutarını, diğeri brüt tutarı toplasın. Sonra DIVIDE.' },
  { t:'dax', name:'Takvim Ayı Ortalaması', q:'<b>Takvim Ayı Ortalaması</b>: Görünen her takvim ayının (Tarih[YilAy]) [Net Satış] değerinin ortalaması. Satış olmayan aylar ortalamaya <b>sıfır</b> olarak girsin.', sol:'AVERAGEX(VALUES(Tarih[YilAy]), [Net Satış] + 0)', hint:'AVERAGEX BLANK değerleri atlar. Ölçüye + 0 ekleyerek boş ayları sıfıra çevir.' },
  { t:'query', q:'Net satışı en yüksek <b>3 ayı</b> (Tarih[YilAy]) ve her ayın satışını "Satış" adlı sütunda döndüren bir sorgu yaz.', start:'EVALUATE\n', sol:'EVALUATE\nTOPN(\n    3,\n    ADDCOLUMNS(VALUES(Tarih[YilAy]), "Satış", [Net Satış]),\n    [Satış], DESC\n)', hint:'Önce ADDCOLUMNS(VALUES(Tarih[YilAy]), "Satış", [Net Satış]) ile ay tablosunu kur, sonra TOPN(3, ..., [Satış], DESC).' },
  { t:'mc', q:'Satın alma müdürü “tedarikçilere ödediğimiz ortalama birim fiyat” kartını istiyor. Kartta <code>AVERAGE(SatinAlmalar[BirimFiyat])</code> var. Bir siparişte 2 adet, başka birinde 400 adet alınmış olabiliyor. Ne yaparsın?', o:['Kartı olduğu gibi bırakırım; AVERAGE zaten tüm satırları hesaba katar','Ortalamayı AVERAGEX(VALUES(SatinAlmalar[TedarikciNo]), …) ile tedarikçi başına alırım','Kartı MEDIAN(SatinAlmalar[BirimFiyat]) ile değiştiririm; uç değerler böylece etkisiz kalır','Toplam tutarı toplam adede bölerim: DIVIDE(SUM(Tutar), SUM(Adet))'], a:3, why:'Soru “ödediğimiz ortalama birim fiyat”; her adet bir oy olmalı. Bu, toplam tutarın toplam adede bölünmesiyle bulunan adet ağırlıklı ortalamadır. AVERAGE 2 adetlik siparişle 400 adetlik siparişi eşit sayar. Tedarikçi başına ortalama ya da medyan başka sorulara cevap verir.' }
] });

/* ---------------------------------------------------------------- filter-all */
ext('filter-all', { min: 14, html: `
<h2>ALLSELECTED ve görselin toplamı</h2>
<p>Kategori müdürü dilimleyicide yalnızca Elektronik, Kitap ve Spor’u seçti. Pasta grafiğinde payların 100’e tamamlanmasını bekliyor. Hazır <code>[Kategori Payı %]</code> ölçüsü ise şunu gösteriyor:</p>
<div class="tbl-wrap"><table><tr><th>Kategori</th><th>[Net Satış]</th><th>[Kategori Payı %] (ALL)</th><th>Seçime göre pay (ALLSELECTED)</th></tr>
<tr><td>Elektronik</td><td>339.304 ₺</td><td>%27,1</td><td>%50,2</td></tr>
<tr><td>Kitap</td><td>151.882 ₺</td><td>%12,1</td><td>%22,5</td></tr>
<tr><td>Spor</td><td>184.231 ₺</td><td>%14,7</td><td>%27,3</td></tr>
<tr><td>Toplam</td><td>675.417 ₺</td><td>%54,0</td><td>%100</td></tr></table></div>
<p>İki ölçü de doğru; farklı sorulara cevap veriyorlar. <code>ALL(Kategoriler)</code> paydaya tüm şirketi koyar: “Elektronik, şirketin %27’si.” <code>ALLSELECTED(Kategoriler)</code> ise görselin kendi satır filtresini kaldırır ama dilimleyici gibi dışarıdan gelen filtreleri korur. Payda 675.417 ₺ olur: “Seçtiğin üç kategorinin yarısı Elektronik.”</p>
<pre class="dax">Seçili Kategoriler İçinde Pay % =
DIVIDE([Net Satış], CALCULATE([Net Satış], ALLSELECTED(Kategoriler)))</pre>
<div class="warn"><b>ALLSELECTED’in sınırı</b>ALLSELECTED “görselin dışından gelen filtreleri” tanır. Başka bir görselden gelen çapraz filtre de bu gruba girer. Ölçüyü başka bir yineleyicinin içinden çağırırsan davranışı tahmin etmek zorlaşır. Kural: ALLSELECTED’i görselde doğrudan kullanılan en dış ölçüde kullan, yardımcı ölçülerin içine gömme.</div>

<h2>Paydayı kurarken hangi filtre kalıyor?</h2>
<p>Şimdi dilimleyicide kategori değil, <b>Kanal = Web</b> seçili olsun. Satırlarda kategoriler var. Paydayı üç farklı şekilde kurarsan:</p>
<div class="tbl-wrap"><table><tr><th>Payda</th><th>Ne kaldırılır?</th><th>Elektronik</th><th>Okunuşu</th></tr>
<tr><td><code>ALL(Kategoriler)</code></td><td>Yalnızca kategori</td><td>%28,6</td><td>Web satışları içinde Elektronik’in payı</td></tr>
<tr><td><code>ALL(Satislar)</code></td><td>Kategori, kanal, tarih, müşteri… hepsi</td><td>%10,5</td><td>Web’deki Elektronik, şirketin tüm satışlarının yüzde kaçı?</td></tr>
<tr><td><code>ALLSELECTED(Kategoriler)</code></td><td>Görselin kategori filtresi</td><td>%28,6</td><td>Kategori seçimi olmadığı için ALL ile aynı</td></tr></table></div>
<p>Dilimleyicinin kanal filtresi <code>ALL(Satislar)</code> ile de silinir, çünkü <code>Satislar[Kanal]</code> olgu tablosundadır ve genişletilmiş <code>Satislar</code> bütün boyutları kapsar. Kullanıcı “Web’i seçtim, neden paydada Web yok?” diye sorarsa ilk bakacağın yer burasıdır.</p>

<h2>Zaman içinde pay</h2>
<p>Pay her zaman kategoriyle ilgili değildir. Finans ekibi iki soru soruyor: “Aralık, yılın yüzde kaçı?” ve “2024, üç yılın yüzde kaçı?”</p>
<pre class="dax">Yıl İçi Ay Payı % =
DIVIDE([Net Satış], CALCULATE([Net Satış], ALLEXCEPT(Tarih, Tarih[Yil])))

Tüm Yıllara Göre Pay % =
DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Tarih)))</pre>
<p>Aralık 2024 yılın %7,5’i; 2024 ise tüm dönemin %59,7’si. Yıl içi payda <code>ALL(Tarih[YilAy])</code> yazmak da yalnız ay sütunu varken aynı sonucu verir. Ama matrise <code>Tarih[Ay]</code> ya da <code>Tarih[Ceyrek]</code> eklenince o filtreler yerinde kalır ve paylar bozulur. <code>ALLEXCEPT(Tarih, Tarih[Yil])</code> “yıl dışındaki tüm tarih filtrelerini kaldır” dediği için daha sağlamdır.</p>

<h2>Hiyerarşide ebeveyne göre pay</h2>
<p>Kategori → Ürün hiyerarşisi olan bir matriste her düzey kendi ebeveynine göre pay göstersin: ürün satırında kategorinin yüzde kaçı, kategori satırında şirketin yüzde kaçı.</p>
<pre class="dax">Ebeveyn Payı (Hiyerarşi) =
SWITCH(
    TRUE(),
    ISINSCOPE(Urunler[Urun]), DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Urunler[Urun]))),
    ISINSCOPE(Kategoriler[Kategori]), DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Kategoriler)))
)</pre>
<p>Sıra önemlidir. Ürün satırında hem ürün hem kategori kapsamdadır. Bu yüzden en derin düzey önce denenir. 27" Monitör, Elektronik’in %30,1’i; Elektronik de şirketin %27,1’i. Toplam satırında hiçbir koşul doğru olmadığı için ölçü BLANK döner. %100 göstermek anlamsız olacağından bu bilinçli bir tercihtir.</p>
<div class="note"><b>Kontrol listesi: pay ölçüsü</b>1) Payda kim: şirket, seçim, ebeveyn, yıl? Ölçü adına yaz. 2) Görselde hangi sütunla grupluyorsun? Paydada o sütunun (ya da tablosunun) filtresini kaldır. 3) Dilimleyici filtresi paydada kalmalı mı? Kalmalıysa olgu tablosunu değil boyutu hedefle. 4) Toplam satırında ne görünmeli: %100 mü, BLANK mi?</div>
`, ex: [
  { t:'dax', name:'Seçili Kategoriler İçinde Pay %', q:'<b>Seçili Kategoriler İçinde Pay %</b>: [Net Satış] değerinin, görselin kategori filtresi kaldırılmış ama dilimleyici seçimleri korunmuş toplama oranı. Kategoriler tablosunu hedefle.', sol:'DIVIDE([Net Satış], CALCULATE([Net Satış], ALLSELECTED(Kategoriler)))', hint:'Payda CALCULATE([Net Satış], ALLSELECTED(Kategoriler)). Dilimleyici yokken sonuç [Kategori Payı %] ile aynıdır.' },
  { t:'dax', name:'Yıl İçi Ay Payı %', q:'<b>Yıl İçi Ay Payı %</b>: Her ayın [Net Satış] değerinin, kendi yılının toplamına oranı. Paydada yıl dışındaki tüm Tarih filtrelerini kaldır. (Kontrol satırları Tarih[YilAy].)', sol:'DIVIDE([Net Satış], CALCULATE([Net Satış], ALLEXCEPT(Tarih, Tarih[Yil])))', hint:'ALLEXCEPT(Tarih, Tarih[Yil]) yıl filtresini korur, ay ve gün filtrelerini kaldırır.', grid:[{t:'Tarih',c:'YilAy'}] },
  { t:'dax', name:'Tüm Yıllara Göre Pay %', q:'<b>Tüm Yıllara Göre Pay %</b>: [Net Satış] değerinin, tarih filtresi olmadan hesaplanan [Net Satış] değerine oranı. Kategori filtresi korunsun.', sol:'DIVIDE([Net Satış], CALCULATE([Net Satış], REMOVEFILTERS(Tarih)))', hint:'Paydada yalnızca Tarih tablosunun filtrelerini kaldır: REMOVEFILTERS(Tarih).' },
  { t:'query', q:'Her kategori için "Satış" ([Net Satış]) ve "Şirket Payı" (paydası tüm kategorilerin net satışı olan pay) sütunlarını döndüren bir sorgu yaz. Satırlar Kategoriler[Kategori] olsun.', start:'EVALUATE\n', sol:'EVALUATE\nSUMMARIZECOLUMNS(\n    Kategoriler[Kategori],\n    "Satış", [Net Satış],\n    "Şirket Payı", DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Kategoriler)))\n)', hint:'SUMMARIZECOLUMNS içinde ikinci sütun DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Kategoriler))) olsun.' },
  { t:'mc', q:'Bölge müdürü dilimleyicide 3 kategori seçiyor ve çubuk grafikteki yüzdelerin toplamının %100 olmasını istiyor. Grafikteki ölçü <code>DIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Kategoriler)))</code>. Ne değiştirirsin?', o:['ALL yerine ALLSELECTED(Kategoriler) kullanırım','ALL(Kategoriler) yerine ALL(Satislar) yazarım','DIVIDE yerine bölme işleci (/) kullanırım','Dilimleyiciyi kaldırıp kategori seçimini görsel filtresine taşırım'], a:0, why:'ALLSELECTED görselin kendi kategori filtresini kaldırır ama dilimleyici seçimini korur; payda seçili 3 kategorinin toplamı olur ve paylar 100’e tamamlanır. ALL(Satislar) paydayı daha da büyütür. Bölme işleci sonucu değiştirmez. Görsel filtresi de dışarıdan gelen bir filtredir; ALL onu yine siler.' }
] });

/* ---------------------------------------------------------------- var-mantik */
ext('var-mantik', { min: 13, html: `
<h2>VAR ile hata ayıklama: ölçüyü parça parça aç</h2>
<p>Satış direktörü “Hedef etiketi bazı aylarda saçma” diyor. Ölçü tek satırlık uzun bir formülse nereden başlayacağını bilemezsin. Değişkenlerle yazılmış bir ölçüde ise her ara adımı tek tek görebilirsin. Yöntem basit: <code>RETURN</code>’den sonra sonucu değil, şüphelendiğin değişkeni yaz.</p>
<pre class="dax" data-notry>Hedef Etiketi =
VAR Satis = [Net Satış]
VAR Hedef = [Hedef]
VAR Oran = DIVIDE(Satis, Hedef)
RETURN
    -- geçici: RETURN Oran
    SWITCH(TRUE(), ISBLANK(Oran), "Hedef yok", Oran &gt;= 1, "Hedefte", "Geride")</pre>
<p>Ara değerleri tek tek açmak yerine hepsini aynı anda görmek istersen DAX sorgu görünümünü (DAX query view) kullan. Değişkenleri sorgu sütunu yapınca her ayın ara adımlarını yan yana görürsün:</p>
<pre class="dax">DEFINE
    MEASURE Satislar[Tanı Oranı] = DIVIDE([Net Satış], [Hedef])
EVALUATE
SUMMARIZECOLUMNS(
    Tarih[YilAy],
    "Satış", [Net Satış],
    "Hedef", [Hedef],
    "Oran", [Tanı Oranı]
)</pre>
<p>Bu yöntem bir ekip alışkanlığıdır. Ölçüyü değiştirmeden önce sorgu sekmesinde çalıştır, sonuçları kaydet; değişiklikten sonra aynı sorguyu yeniden çalıştırıp karşılaştır. Böylece “düzelttim ama başka bir yeri bozdum” durumunu yakalarsın.</p>

<h2>SWITCH(TRUE()) sırası: ilk doğru kazanır</h2>
<p><code>SWITCH(TRUE(), …)</code> koşulları yukarıdan aşağıya dener ve <b>ilk</b> doğru olanın sonucunu döndürür. Eşikleri yanlış sırada yazmak sessiz bir hatadır; formül çalışır, ama bazı etiketler hiç görünmez.</p>
<pre class="dax">Etiket (yanlış sıra) =
VAR Oran = DIVIDE([Net Satış], [Hedef])
RETURN SWITCH(TRUE(), Oran &gt;= 0.95, "Hedefte", Oran &gt;= 1.05, "Üstün", "Geride")

Etiket (doğru sıra) =
VAR Oran = DIVIDE([Net Satış], [Hedef])
RETURN SWITCH(TRUE(), Oran &gt;= 1.05, "Üstün", Oran &gt;= 0.95, "Hedefte", "Geride")</pre>
<p>36 aylık bir tabloda yanlış sıralı ölçü hiçbir aya “Üstün” demez: 21 “Hedefte”, 15 “Geride”. Doğru sıralı ölçü iki ayı “Üstün” olarak işaretler: Haziran 2023 ve Aralık 2024 (oran %106,3). Yanlış sırada %106’lık bir ay önce “≥ 0,95” koşuluna takılır ve “Hedefte” olur.</p>
<div class="tip"><b>Sıralama kuralı</b>1) BLANK kontrolünü en başa koy. 2) Büyükten küçüğe eşiklerde en yüksek eşik önce gelsin. 3) Son bağımsız değişken “hiçbiri” durumudur; bilerek yaz. 4) Eşik sayılarını değişkene al (<code>VAR UstEsik = 1.05</code>), böylece değiştirmen gerektiğinde tek yeri düzeltirsin.</div>

<h3>BLANK’i unutmanın iki bedeli</h3>
<p><code>ISBLANK(Oran)</code> kontrolünü atlarsan iki şey olur. Birincisi, satışı olmayan bir kırılımda <code>Oran</code> BLANK’tir; BLANK karşılaştırmalarda 0 gibi davranır ve satır “Geride” etiketi alır. Bu bir hedef başarısızlığı değil, veri yokluğudur. İkincisi, ölçü hiçbir zaman BLANK döndürmediği için görsel, satışı olmayan ürün ve müşterileri de listeler; tablo gereksiz satırlarla dolar.</p>

<h2>Sınıflandırmayı saymak</h2>
<p>Bir sonraki soru genellikle “Kaç tanesi?” olur: “Bu yıl kaç kategori hedefini tuttu?” Etiketi bir değişkende ya da FILTER koşulunda hesaplayıp satırları sayarsın:</p>
<pre class="dax">Hedefi Aşan Kategori =
COUNTROWS(
    FILTER(VALUES(Kategoriler[Kategori]), [Net Satış] &gt;= [Hedef])
)</pre>
<p>2023’te 3 kategori, 2024’te 1 kategori hedefini tuttu; 2022’de hiçbiri (sonuç BLANK). Aylık bakınca Kasım ve Aralık 2024’te 5 kategori hedefte. Tüm dönem satırında sonuç yine BLANK, çünkü hiçbir kategori üç yılın toplam hedefini tutturamadı. Bu, toplam satırının satırların toplamı olmadığının bir örneği daha (Filtre bağlamı dersindeki kural).</p>
<p>FILTER’ın içinde de değişken kullanabilirsin. Değişken, FILTER’ın her satırında o satırın bağlamında yeniden hesaplanır, çünkü tanımlandığı yer satır ifadesinin içidir:</p>
<pre class="dax">Hedefe Yakın Kategori =
COUNTROWS(
    FILTER(
        VALUES(Kategoriler[Kategori]),
        VAR Oran = DIVIDE([Net Satış], [Hedef])
        RETURN Oran &gt;= 0.95 &amp;&amp; Oran &lt; 1
    )
)</pre>
<div class="note"><b>Kontrol listesi: koşullu ölçü</b>1) Her değişkenin adı ne hesapladığını söylüyor mu? 2) BLANK durumu ilk koşul mu? 3) Eşikler büyükten küçüğe mi? 4) Ara değerleri DAX sorgu görünümünde bir kez yan yana gördün mü? 5) Etiket ölçüsü, satırı olmayan kırılımlarda BLANK dönüyor mu?</div>
`, ex: [
  { t:'dax', name:'Sepet Bandı', q:'<b>Sepet Bandı</b>: VAR ile [Ortalama Sepet] değerini al. BLANK ise BLANK, 1.500 ve üzeriyse "Büyük sepet", 800 ve üzeriyse "Orta sepet", değilse "Küçük sepet" döndür.', sol:'VAR S = [Ortalama Sepet] RETURN SWITCH(TRUE(), ISBLANK(S), BLANK(), S >= 1500, "Büyük sepet", S >= 800, "Orta sepet", "Küçük sepet")', hint:'SWITCH(TRUE(), ...) içinde önce ISBLANK(S), sonra S >= 1500, sonra S >= 800 koşulunu yaz.' },
  { t:'dax', name:'Hedefi Aşan Kategori Sayısı', q:'<b>Hedefi Aşan Kategori Sayısı</b>: Görünen kategoriler (Kategoriler[Kategori]) içinde [Net Satış] değeri [Hedef] değerine eşit ya da büyük olanların sayısı.', sol:'COUNTROWS(FILTER(VALUES(Kategoriler[Kategori]), [Net Satış] >= [Hedef]))', hint:'FILTER(VALUES(Kategoriler[Kategori]), [Net Satış] >= [Hedef]) tablosunu COUNTROWS ile say.' },
  { t:'dax', name:'Büyüme Etiketi', q:'<b>Büyüme Etiketi</b>: VAR ile [YoY %] değerini al. BLANK ise "Karşılaştırma yok", 0,5 ve üzeriyse "Hızlı büyüme", 0 ve üzeriyse "Büyüme", değilse "Düşüş" döndür.', sol:'VAR B = [YoY %] RETURN SWITCH(TRUE(), ISBLANK(B), "Karşılaştırma yok", B >= 0.5, "Hızlı büyüme", B >= 0, "Büyüme", "Düşüş")', hint:'Önce ISBLANK(B) koşulunu yaz; ardından büyük eşikten küçüğe: B >= 0.5, B >= 0.' },
  { t:'mc', q:'Bir ölçüde <code>SWITCH(TRUE(), Oran &gt;= 0.9, "Sarı", Oran &gt;= 1, "Yeşil", "Kırmızı")</code> yazılmış. Rapor kullanıcıları hiç yeşil görmediklerini söylüyor. Sebep ne?', o:['SWITCH(TRUE()) yalnızca iki koşulu destekler','Oran ≥ 1 olan her satır önce “≥ 0,9” koşuluna takılıyor','Oran değişkeni BLANK olduğu için hiçbir koşul çalışmıyor','Renk adları metin olduğu için koşullu biçim tanımıyor'], a:1, why:'SWITCH(TRUE()) ilk doğru koşulun sonucunu döndürür. Oran ≥ 1 olan her değer zaten ≥ 0,9 olduğu için “Sarı” alır, “Yeşil” koşuluna hiç sıra gelmez. Çözüm: yüksek eşiği önce yazmak. SWITCH çok sayıda koşul alabilir; BLANK yalnızca boş kırılımları etkiler.' },
  { t:'mc', q:'Ekip arkadaşın bir etiket ölçüsünden <code>ISBLANK(Oran)</code> satırını sildi. Ürün tablosunda artık satışı hiç olmayan ürünler de “Geride” etiketiyle görünüyor. Neden?', o:['BLANK, 0 gibi karşılaştırılır; ölçü hiç BLANK dönmediği için satır gizlenmez','ISBLANK silinince SWITCH(TRUE()) varsayılan değeri döndüremez ve hata yerine etiket basar','Ürün tablosunun ilişkisi çift yönlü olduğu için boş ürünler filtreden geçiyor','DIVIDE sıfıra bölmede BLANK değil “Geride” döndürür'], a:0, why:'Satışı olmayan üründe Oran BLANK’tir; BLANK, 0 gibi karşılaştırılır ve son koşula, “Geride” etiketine düşer. Görsel, ölçünün değeri BLANK olmayan satırları gösterdiği için bu ürünler listeye girer. DIVIDE sıfıra bölmede BLANK döndürür; ilişki yönünün bununla ilgisi yok.' }
] });

/* ---------------------------------------------------------------- siralama */
ext('siralama', { min: 14, html: `
<h2>Bağlar: kim beşinci?</h2>
<p>Satış ekibi “sipariş sayısına göre ilk 5 ürün” listesini prim hesabında kullanacak. Liste beşinci sırada bir bağla karşılaşıyor:</p>
<div class="tbl-wrap"><table><tr><th>Ürün</th><th>[Sipariş Sayısı]</th><th>RANKX (varsayılan, SKIP)</th><th>RANKX (DENSE)</th><th>Bağ bozmalı</th></tr>
<tr><td>Nemlendirici Krem</td><td>55</td><td>5</td><td>5</td><td>5</td></tr>
<tr><td>Dudak Balmı</td><td>55</td><td>5</td><td>5</td><td>6</td></tr>
<tr><td>Yün Atkı</td><td>54</td><td>7</td><td>6</td><td>7</td></tr>
<tr><td>İstatistiğe Giriş</td><td>53</td><td>8</td><td>7</td><td>8</td></tr>
<tr><td>Basic Tişört</td><td>53</td><td>8</td><td>7</td><td>9</td></tr>
<tr><td>Suç ve Ceza</td><td>53</td><td>8</td><td>7</td><td>10</td></tr></table></div>
<p>“İlk 5” filtresi SKIP sıralamasıyla 6 ürün döndürür (iki tane 5.), DENSE ile ise 9 ürün (7. sıraya kadar 6 sıra numarası var). İş kuralı bir bağ bozucu ister: “Eşitlikte cirosu yüksek olan önde.” RANKX’te bunun en sade yolu, ikinci ölçüyü ilk ölçüye küçük bir ağırlıkla eklemektir:</p>
<pre class="dax">Bağ Bozmalı Sıra =
IF(
    HASONEVALUE(Urunler[Urun]),
    RANKX(ALL(Urunler[Urun]), [Sipariş Sayısı] * 1000000 + [Net Satış])
)</pre>
<p>Çarpan, ikinci ölçünün alabileceği en büyük değerden büyük olmalı. Bu modelde bir ürünün net satışı 102.000 ₺’yi geçmiyor, 1.000.000 güvenli. Çarpan küçük kalırsa ciro sipariş farkını ezer ve sıra bozulur. Okunurluk istiyorsan Pencere fonksiyonları dersindeki <code>RANK</code> + <code>ORDERBY</code> kalıbı aynı işi açıkça yapar.</p>
<h3>Satışı olmayanlar da sıralanır</h3>
<p>40 üründen 2’si (Koşu Bandı ve Gurme Lokum Kutusu) hiç satmamış. RANKX ikisine de <b>39</b> verir; tabloda “39. sırada” iki ürün görünür. Çoğu raporda bu satırlar gizlenmeli:</p>
<pre class="dax">Satışlı Ürün Sırası =
IF(NOT ISBLANK([Net Satış]), RANKX(ALL(Urunler[Urun]), [Net Satış]))</pre>

<h2>TOPN dış bağlamda değerlendirilir</h2>
<p>Temel bölümdeki <code>İlk 5 Ürün Satışı</code> ölçüsü tüm şirkette 315.381 ₺ verir. Aynı ölçüyü kategori satırlarına koyunca ne olur? <code>TOPN</code>’in içindeki <code>[Net Satış]</code>, kategori filtresi altında hesaplanır. Başka kategorilerin ürünleri o hücrede BLANK değer alır. Sonuçta TOPN o kategorinin ilk 5 ürününü seçer. Elektronik satırında “Elektronik’in ilk 5’i” görürsün, “şirketin ilk 5’inden Elektronik’e düşenler” değil.</p>
<pre class="dax">İlk 5 Dışı Satış =
[Net Satış] - CALCULATE([Net Satış], TOPN(5, ALL(Urunler[Urun]), [Net Satış]))</pre>
<p>Bu ölçü Elektronik’te 68.487 ₺ verir, Hediye, Kozmetik ve Spor’da 0. Bu üç kategoride satışı olan ürün sayısı zaten 5 ya da daha az. Hangisini istediğini bil: kategori içi ilk N ise bu davranış doğru; şirketin ilk N’i ise listeyi kategori filtresi kaldırılmış bir bağlamda hesaplamalısın.</p>

<h2>Top N + Diğer</h2>
<p>Yönetim kurulu sunumunda 40 çubuklu grafik yerine “ilk 5 ürün + Diğer” isteniyor. Sorun: Diğer bir ürün değil, ürün ekseninde böyle bir değer yok. Çözümün iki parçası var:</p>
<ol><li><b>Eksen tablosu:</b> <code>UrunlerVeDiger</code>, 40 ürün adına bir “Diğer” satırı eklenmiş 41 satırlık bağlantısız bir tablo. Grafiğin eksenine bu tablonun <code>Urun</code> sütunu konur.</li>
<li><b>Ölçü:</b> hazır <code>[Satış (Top N + Diğer)]</code> ölçüsü her eksen değeri için karar verir. Değer ilk N’deyse o ürünün satışını, “Diğer” ise genel toplam eksi ilk N toplamını döndürür, kalan ürünler için BLANK döndürür ve çubuk görünmez.</li></ol>
<p>N = 5 iken grafik şöyle görünür: 27" Monitör 101.986 ₺, Akıllı Saat 61.757 ₺, Türk Kahvesi Makinesi 53.963 ₺, Robot Süpürge 49.494 ₺, Kamp Çadırı 48.181 ₺ ve Diğer 935.391 ₺. Sağlama: ilk 5’in toplamı 315.381 ₺ + Diğer 935.391 ₺ = 1.250.772 ₺, yani [Net Satış]’ın tamamı. Grafik hiçbir satışı kaybetmez.</p>
<h3>Dinamik N</h3>
<p><code>TopNSecim</code> tablosu 3’ten 15’e kadar N değerlerini tutar. Bu tabloyu bir dilimleyiciye koyarsın, ölçü <code>SELECTEDVALUE(TopNSecim[N], 5)</code> ile seçimi okur; seçim yoksa 5 kullanır. Kullanıcı 10 seçerse Diğer 727.113 ₺’ye iner.</p>
<div class="warn"><b>Sıralama tuzağı</b>Grafiği değere göre azalan sıralarsan “Diğer” en büyük çubuk olur ve en başa geçer. Çözüm: Diğer için büyük bir sıra numarası döndüren bir yardımcı sıra ölçüsü yazıp araç ipucu (Tooltip) alanına eklemek ve grafiği o alana göre sıralamak.</div>
<div class="note"><b>Üretim notu: RANKX’in maliyeti</b>RANKX her hücrede, sıralama tablosundaki her satır için ölçüyü yeniden hesaplar. 40 ürünlük bir tabloda bu 40 × 40 = 1.600 hesaptır ve fark edilmez. 20.000 müşterilik bir tabloda ise yüz milyonlarca hesaba çıkar. Büyük boyutlarda sıralama tablosunu daralt (<code>ALLSELECTED</code>, ya da yalnızca satışı olanlar), sıra numarasını görselde değil yalnızca gereken sayfada kullan ve süreyi Performans Analizi (Performance analyzer) ile ölç.</div>
`, ex: [
  { t:'dax', name:'Bağ Bozmalı Ürün Sırası', q:'<b>Bağ Bozmalı Ürün Sırası</b>: Tek bir ürün görünüyorsa ürünleri [Sipariş Sayısı] değerine göre büyükten küçüğe sırala; eşitlikte [Net Satış] yüksek olan önde olsun. Sıralama ifadesi olarak [Sipariş Sayısı] * 1000000 + [Net Satış] kullan. Tek ürün yoksa BLANK.', sol:'IF(HASONEVALUE(Urunler[Urun]), RANKX(ALL(Urunler[Urun]), [Sipariş Sayısı] * 1000000 + [Net Satış]))', hint:'IF(HASONEVALUE(Urunler[Urun]), RANKX(ALL(Urunler[Urun]), ...)) kalıbını kullan; ikinci bağımsız değişken bileşik ifade olsun.', grid:[{t:'Urunler',c:'Urun'}] },
  { t:'dax', name:'Satışlı Ürün Sırası', q:'<b>Satışlı Ürün Sırası</b>: [Net Satış] boş değilse ürünün tüm ürünler içindeki sırasını (büyükten küçüğe), boşsa BLANK döndür.', sol:'IF(NOT ISBLANK([Net Satış]), RANKX(ALL(Urunler[Urun]), [Net Satış]))', hint:'IF(NOT ISBLANK([Net Satış]), RANKX(ALL(Urunler[Urun]), [Net Satış])) yeterli.', grid:[{t:'Urunler',c:'Urun'}] },
  { t:'dax', name:'İlk N Dışı Satış', q:'<b>İlk N Dışı Satış</b>: N değerini SELECTEDVALUE(TopNSecim[N], 5) ile oku. [Net Satış] değerinden, net satışa göre ilk N ürünün (ALL(Urunler[Urun]) üzerinden TOPN) satışını çıkar.', sol:'VAR N = SELECTEDVALUE(TopNSecim[N], 5) RETURN [Net Satış] - CALCULATE([Net Satış], TOPN(N, ALL(Urunler[Urun]), [Net Satış]))', hint:'VAR N = SELECTEDVALUE(TopNSecim[N], 5), sonra CALCULATE([Net Satış], TOPN(N, ALL(Urunler[Urun]), [Net Satış])) değerini [Net Satış]’tan çıkar.' },
  { t:'query', q:'Net satışa göre ilk 5 ürünü ve satışlarını ("Satış" sütunu) döndüren bir sorgu yaz. Sonuç satışa göre azalan sıralı olsun.', start:'EVALUATE\n', sol:'EVALUATE\nTOPN(\n    5,\n    ADDCOLUMNS(VALUES(Urunler[Urun]), "Satış", [Net Satış]),\n    [Satış], DESC\n)\nORDER BY [Satış] DESC', hint:'TOPN tabloyu sıralı döndürmez; sonucu sıralamak için sorgunun sonuna ORDER BY [Satış] DESC ekle.' },
  { t:'mc', q:'Prim kuralı “sipariş sayısına göre ilk 5 ürünün satış temsilcileri prim alır” diyor. RANKX ile filtrelenen liste 6 ürün döndürüyor. Ne yaparsın?', o:['DENSE kullanırım; böylece bağlar ortadan kalkar ve 5 ürün kalır','Listeyi alfabetik sıralar, ilk 5 ürünü elle seçerek prime gönderirim','RANKX yerine TOPN(5) kullanırım; TOPN bağları kendisi bozar','Bir bağ bozucu kuralı iş birimiyle belirleyip ifadeye eklerim'], a:3, why:'Bağ bir iş kuralı sorusudur; DAX bunu senin yerine çözmez. Kural belirlenince (ör. cirosu yüksek olan önde) bileşik ifade ya da RANK + ORDERBY ile uygulanır. DENSE bağları kaldırmaz, sıra numaralarını sıkıştırır ve listeyi büyütür. TOPN da bağdaki tüm satırları döndürür. Elle seçim ise tekrarlanabilir değildir.' }
] });

/* ---------------------------------------------------------------- yari-toplanabilir */
ext('yari-toplanabilir', { min: 14, html: `
<h2>Yanlışın boyutu: SUM stoku ne kadar şişirir?</h2>
<p>Depo müdürü yıl sonu raporunda “stok adedi” satırında 4.183 görüyor ve şaşırıyor. Depoda 311 ürün var. Fark, ay sonu görüntülerinin toplanmasından geliyor. Bunu tek sorguyla göster:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Tarih[Yil],
    "Toplanmış (yanlış)", SUM(StokGorunum[StokAdet]),
    "Kapanış", [Stok Adedi],
    "Toplanmış değer", SUM(StokGorunum[StokDegeri]),
    "Kapanış değeri", [Stok Değeri]
)</pre>
<div class="tbl-wrap"><table><tr><th>Yıl</th><th>SUM(StokAdet)</th><th>Kapanış adedi</th><th>SUM(StokDegeri)</th><th>Kapanış değeri</th></tr>
<tr><td>2022</td><td>3.541</td><td>325</td><td>1.964.884 ₺</td><td>164.498 ₺</td></tr>
<tr><td>2023</td><td>4.181</td><td>309</td><td>2.048.566 ₺</td><td>166.057 ₺</td></tr>
<tr><td>2024</td><td>4.183</td><td>311</td><td>2.163.992 ₺</td><td>163.465 ₺</td></tr></table></div>
<p>Toplanmış değer kapanışın 13 katından fazla. “12 ay toplandıysa 12 kat olmalı” diye düşünme: stok ay içinde dalgalandığı için oran sabit değildir. Bu yüzden yanlış sayıyı 12’ye bölerek “düzeltmek” de yanlıştır. Tüm dönem satırında fark daha da büyük: 11.905’e karşı 311.</p>

<h2>Kapanışı bulmanın üç yolu</h2>
<div class="tbl-wrap"><table><tr><th>Yöntem</th><th>Hangi günü seçer?</th><th>Zayıf noktası</th></tr>
<tr><td><code>MAX(StokGorunum[Tarih])</code> ile (hazır [Stok Adedi])</td><td>Görünen dönemde kaydı olan son gün</td><td>Bir ürün son ayda kaydedilmediyse o ürün kapanışta yok olur</td></tr>
<tr><td><code>LASTNONBLANK(Tarih[Tarih], …)</code> (hazır [Stok Değeri])</td><td>İfadenin boş olmadığı son gün</td><td>Aynı sorun; ürün bazında çözüm için <code>SUMX(VALUES(Urunler[UrunNo]), …)</code> gerekir</td></tr>
<tr><td><code>CLOSINGBALANCEMONTH / YEAR</code></td><td>Takvimin son günü (ay ya da yıl sonu)</td><td>O gün kayıt yoksa boş döner; ayın ortasına kadar süzülmüş bir dönemde bile ay sonunu getirir</td></tr></table></div>
<p>Bu modelde her ürünün her ay sonunda kaydı olduğu için üç yöntem aynı sayıyı verir. Gerçek hayatta öyle olmaz: yeni açılan bir ürün, satıştan kalkan bir ürün ya da geç gelen bir depo dosyası farkı ortaya çıkarır. Bir kenar durum daha: kullanıcı tarih dilimleyicisinde 1–15 Aralık 2024’ü seçerse <code>[Stok Adedi]</code> BLANK döner, çünkü bu günlerde görüntü yok. <code>CLOSINGBALANCEMONTH</code> ise 31 Aralık değerini getirir, yani seçilen dönemin dışındaki bir günü. İkisinden hangisi doğru, rapor sahibinin kararıdır. Ama kararı bilinçli ver ve görsel başlığına yaz.</p>

<h2>Açılış, kapanış ve hareket mutabakatı</h2>
<p>Stok kontrolünün temel denklemi: <b>Kapanış − Açılış = Giren − Çıkan</b>. Görüntü ölçüsü ile hareket ölçüsünü yan yana koymak veri kalitesini test eder.</p>
<pre class="dax">Yıllık Stok Değişimi =
VAR Kapanis = [Stok Adedi]
VAR Acilis = CALCULATE([Stok Adedi], PREVIOUSDAY(FIRSTDATE(Tarih[Tarih])))
RETURN IF(NOT ISBLANK(Acilis), Kapanis - Acilis)</pre>
<p>2023’te stok 325’ten 309’a indi (−16), 2024’te 311’e çıktı (+2). 2022 satırı BLANK’tir: veri Ocak 2022’de başlıyor, açılış görüntüsü yok. <code>IF(NOT ISBLANK(Acilis), …)</code> bu yüzden var. Yoksa ölçü 2022’de “+325” gösterirdi, yani bütün stok o yıl gelmiş gibi.</p>
<p>2024’te depoya 1.489 adet girdi (<code>[Gelen Adet]</code>). Denklemden çıkan adet 1.489 − 2 = 1.487 olur. Oysa <code>[Satılan Adet]</code> 1.426. Aradaki 61 adet fire, iade, sayım farkı ya da veri hatasıdır. Böyle bir fark rapordan önce tedarik ekibine sorulacak bir sorudur. Bir stok raporunun en değerli satırı bazen bu mutabakat satırıdır.</p>

<h2>Ortalama bakiye ve devir hızı</h2>
<p>Stok devir hızı “stok yılda kaç kez yenileniyor?” sorusunu cevaplar: dönem maliyeti / ortalama stok değeri. Ortalama stok, ay sonu görüntülerinin ortalamasıdır:</p>
<pre class="dax">Ay Sonu Ortalama Stok Değeri =
AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])

Yıllıklaştırılmış Stok Devri =
DIVIDE([Net Maliyet], [Ay Sonu Ortalama Stok Değeri])
    * DIVIDE(12, COUNTROWS(VALUES(Tarih[YilAy])))</pre>
<p>2024: ortalama stok değeri 180.333 ₺, net maliyet 458.504 ₺, devir 2,54. Yıllıklaştırma çarpanı neden var? Tüm dönem satırında maliyet 36 ayın maliyetidir; çarpan olmadan sonuç “3 yıllık devir” olur ve yıllık sayılarla karşılaştırılamaz. Çarpanla tüm dönem 1,54. Kategori düzeyinde en hızlı dönen Kitap (2,36), en yavaş Spor (0,68). Spor’da ortalama 59.005 ₺’lik stok duruyor; nakit bağlayan kategori burası.</p>
<div class="warn"><b>Eksik yıl</b>2022’de devir 0,39 çıkar. Stok 12 ay boyunca var, ama satışlar Haziran 2022’de başlıyor. Maliyet 7 ayın, ortalama stok 12 ayın. Bu bir iş sonucu değil veri sonucu; görselde not düş ya da yılı karşılaştırmadan çıkar.</div>
`, ex: [
  { t:'dax', name:'Ay Sonu Ortalama Stok Değeri', q:'<b>Ay Sonu Ortalama Stok Değeri</b>: Görünen ayların (Tarih[YilAy]) kapanış stok değerlerinin ortalaması. Hazır [Stok Değeri] ölçüsünü kullan.', sol:'AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])', hint:'AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri]) her ayın kapanış değerini alır ve ortalamasını hesaplar.' },
  { t:'dax', name:'Yıllıklaştırılmış Stok Devri', q:'<b>Yıllıklaştırılmış Stok Devri</b>: [Net Maliyet] / (ay sonu stok değerlerinin ortalaması), sonra 12 / (görünen ay sayısı) ile çarp. Ortalama için AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri]) kullan.', sol:'DIVIDE([Net Maliyet], AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])) * DIVIDE(12, COUNTROWS(VALUES(Tarih[YilAy])))', hint:'İki DIVIDE’ı çarp: DIVIDE([Net Maliyet], ortalama stok) * DIVIDE(12, COUNTROWS(VALUES(Tarih[YilAy]))).' },
  { t:'dax', name:'Dönem Stok Değişimi', q:'<b>Dönem Stok Değişimi</b>: Kapanış = [Stok Adedi]; Açılış = dönemin ilk gününden bir önceki gündeki [Stok Adedi] (PREVIOUSDAY(FIRSTDATE(Tarih[Tarih]))). Açılış boş değilse Kapanış − Açılış, boşsa BLANK döndür. (Kontrol satırları Tarih[Yil] ve Tarih[YilAy].)', sol:'VAR Kapanis = [Stok Adedi] VAR Acilis = CALCULATE([Stok Adedi], PREVIOUSDAY(FIRSTDATE(Tarih[Tarih]))) RETURN IF(NOT ISBLANK(Acilis), Kapanis - Acilis)', hint:'Açılışı CALCULATE([Stok Adedi], PREVIOUSDAY(FIRSTDATE(Tarih[Tarih]))) ile bul; IF(NOT ISBLANK(Acilis), ...) ile ilk dönemi boş bırak.', grid:[{t:'Tarih',c:'Yil'},{t:'Tarih',c:'YilAy'}] },
  { t:'query', q:'Yıl başına (Tarih[Yil]) üç sütun döndüren bir sorgu yaz: "Kapanış" ([Stok Adedi]), "Giren" ([Gelen Adet]) ve "Satılan" ([Satılan Adet]). Mutabakat farkını gözle kontrol edeceksin.', start:'EVALUATE\n', sol:'EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[Yil],\n    "Kapanış", [Stok Adedi],\n    "Giren", [Gelen Adet],\n    "Satılan", [Satılan Adet]\n)', hint:'SUMMARIZECOLUMNS(Tarih[Yil], "Kapanış", [Stok Adedi], ...) kalıbı.' },
  { t:'mc', q:'Bir abonelik şirketinde “aktif abone sayısı” her ay sonunda kaydediliyor. Yönetici çeyrek satırında aboneliklerin toplamını değil, çeyrek boyunca <b>tipik</b> abone sayısını görmek istiyor. Hangisi doğru ölçü?', o:['Çeyreğin son ayının kapanışındaki abone sayısı','Ay sonu abone sayılarının ortalaması','Çeyrekteki ay sonu abone sayılarının toplamı','Çeyreğin ilk ayının sonundaki abone sayısı'], a:1, why:'“Tipik” düzey ortalama bakiyedir: ay sonu görüntülerinin ortalaması (AVERAGEX(VALUES(Tarih[YilAy]), …)). Son ay kapanış değeridir; “çeyrek sonunda kaç abone var?” sorusuna cevap verir. İlk ay açılışa yakındır. Toplam ise yarı toplanabilir bir değeri zamanda topladığı için anlamsızdır.' }
] });

/* ---------------------------------------------------------------- hizli-olcu */
ext('hizli-olcu', { min: 13, html: `
<h2>Hızlı ölçünün ürettiği kodu okumak</h2>
<p>Hızlı ölçü (Quick measure) kodu sen yazmasan da sorumluluğu sende. Üretilen kod genellikle doğrudur, ama modelini tanımaz. Üç tipik kalıbı okuyup iyileştirelim.</p>
<h3>1. Kategori başına ortalama</h3>
<p>“Kategori başına ortalama” hızlı ölçüsüne <code>Satislar[Tutar]</code> sütununu ve <code>Urunler[Kategori]</code> alanını sürüklersen şuna benzer bir kod alırsın:</p>
<pre class="dax" data-notry>Tutar ortalaması Kategori başına =
AVERAGEX(
    KEEPFILTERS(VALUES(Urunler[Kategori])),
    CALCULATE(SUM(Satislar[Tutar]))
)</pre>
<p>Okuma: kategorileri dolaş (<code>KEEPFILTERS</code> dış kategori filtresini koru demek), her kategoride tutarı topla, ortalamasını al. Sorunlar modelle ilgili: <code>SUM(Satislar[Tutar])</code> iptalleri de içerir; sonuç 192.313 ₺. Şirketin kuralına uyan <code>[Net Satış]</code> ile 178.682 ₺. Ayrıca <code>Urunler[Kategori]</code> hedef tablosunu süzmez; hedefle aynı görselde kullanılacaksa paylaşılan <code>Kategoriler</code> boyutu gerekir (Hedef ve gerçekleşen dersi). İyileştirilmiş hâli:</p>
<pre class="dax">Kategori Başına Ortalama =
AVERAGEX(VALUES(Kategoriler[Kategori]), [Net Satış])</pre>
<h3>2. Filtrelenmiş değerden yüzde fark</h3>
<p>“Web kanalına göre yüzde fark” hızlı ölçüsü, temel değeri ve karşılaştırılan değeri iki değişkene koyar:</p>
<pre class="dax">Tutar Web’den fark % =
VAR __BASELINE_VALUE = CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] IN { "Web" })
VAR __VALUE_TO_COMPARE = SUM(Satislar[Tutar])
RETURN
    IF(NOT ISBLANK(__VALUE_TO_COMPARE), DIVIDE(__VALUE_TO_COMPARE - __BASELINE_VALUE, __BASELINE_VALUE))</pre>
<p>Yapı doğru, ama yine ham tutar kullanılmış. Mobil satırında +%23,0 gösterir; net satışla doğru değer +%31,2. Mağaza’da −%59,5 yerine −%57,7. Fark küçük görünebilir, ama yönetim sunumunda “Mobil, Web’den %23 büyük” ile “%31 büyük” farklı kararlara götürür. İyileştirme: <code>SUM(Satislar[Tutar])</code> yerine <code>[Net Satış]</code>, değişken adlarında da ekip standardı (<code>WebSatisi</code>, <code>Satis</code>).</p>
<h3>3. Kümülatif toplam</h3>
<p>Kümülatif toplam hızlı ölçüsü <code>ALLSELECTED</code> ve <code>ISONORAFTER</code> ile bir filtre kurar. Aynı mantığı daha okunur şekilde şöyle yazabilirsin:</p>
<pre class="dax">Seçim İçi Kümülatif =
CALCULATE(
    [Net Satış],
    FILTER(ALLSELECTED(Tarih[Tarih]), Tarih[Tarih] &lt;= MAX(Tarih[Tarih]))
)</pre>
<p>Önemli davranış: <code>ALLSELECTED</code> yüzünden toplam, kullanıcının seçtiği dönemin başından başlar. Dilimleyicide 2023–2024 seçiliyse 2024 satırı 1.147.935 ₺ gösterir. Hazır <code>[Kümülatif Satış]</code> ise <code>ALL</code> kullandığı için 2022’yi de katar ve 1.250.772 ₺ gösterir. Hızlı ölçü sana hangisini istediğini sormaz; sen karar ver.</p>

<h2>Copilot ile ölçü yazdırıp denetlemek</h2>
<p>DAX sorgu görünümünde Copilot (Ctrl+I) doğal dilden sorgu yazabilir, seçili bir sorguyu açıklayabilir (“Explain this query”) ve bir DAX kavramını anlatabilir. Önerilen sorguyu çalıştırır (Run), beğenirsen sekmeye eklersin (Keep query). Bu özellik Fabric kapasitesi ve yönetici ayarları gerektirir.</p>
<p>Copilot modelin <b>meta verisini</b> görür: tablo, sütun ve ölçü adları ile açıklamaları. Verinin kendisini okumaz. Bu yüzden iki şey çok önemli:</p>
<ul><li><b>Açıklamalar:</b> ölçü ve sütun açıklamalarına iş kuralını yaz: “Net satış: iptal edilen siparişler hariç tutar”. Açıklamanın yalnızca ilk 200 karakteri kullanılır; kuralı başa koy.</li>
<li><b>Yapay zekâ için verileri hazırla (Prep data for AI):</b> modele yapay zekâ talimatları ekleyerek “satış dendiğinde [Net Satış] ölçüsünü kullan” gibi kuralları Copilot’a kalıcı olarak öğretebilirsin.</li></ul>
<p>İyi bir istem, modelin adlarını kullanır ve beklenen sonucu tarif eder: “[Net Satış] ölçüsünü kullanarak her kategori için Web kanalının payını hesaplayan bir ölçü yaz; payda kategorinin tüm kanallardaki net satışı olsun.” Sonra öneriyi bilinen bir sayıyla test et:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Satislar[Kanal],
    "Net", [Net Satış],
    "Web'e göre fark %", DIVIDE([Net Satış] - CALCULATE([Net Satış], Satislar[Kanal] = "Web"), CALCULATE([Net Satış], Satislar[Kanal] = "Web"))
)</pre>
<div class="note"><b>Üretilen ölçüyü kabul etmeden önce</b>1) Temel ölçü doğru mu (<code>[Net Satış]</code> mı, ham sütun mu)? 2) Boyut sütunu paylaşılan boyuttan mı? 3) Bilinen bir sayıyla eşleşiyor mu (ör. toplam net satış 1.250.772 ₺)? 4) Toplam satırında ve boş dönemde ne veriyor? 5) Dilimleyici seçimi davranışı (ALL mı, ALLSELECTED mı) bilinçli mi? 6) Adı, biçimi ve açıklaması ekip standardına uygun mu?</div>
`, ex: [
  { t:'dax', name:'Kategori Başına Ortalama Satış', q:'<b>Kategori Başına Ortalama Satış</b>: Görünen her kategorinin (Kategoriler[Kategori]) [Net Satış] değerinin ortalaması. Hızlı ölçünün ürettiği kodu iyileştirilmiş hâliyle yaz.', sol:'AVERAGEX(VALUES(Kategoriler[Kategori]), [Net Satış])', hint:'AVERAGEX(VALUES(Kategoriler[Kategori]), [Net Satış]). Ölçü referansı CALCULATE’i kendiliğinden içerir.' },
  { t:'dax', name:'Seçim İçi Yürüyen Toplam', q:'<b>Seçim İçi Yürüyen Toplam</b>: [Net Satış] değerinin, kullanıcının seçtiği tarihler (ALLSELECTED(Tarih[Tarih])) içinde, görünen son tarihe kadar olan kümülatif toplamı.', sol:'CALCULATE([Net Satış], FILTER(ALLSELECTED(Tarih[Tarih]), Tarih[Tarih] <= MAX(Tarih[Tarih])))', hint:'FILTER(ALLSELECTED(Tarih[Tarih]), Tarih[Tarih] <= MAX(Tarih[Tarih])) tablosunu CALCULATE’e filtre olarak ver.' },
  { t:'dax', name:'Web Kanalına Göre Fark %', q:'<b>Web Kanalına Göre Fark %</b>: Web kanalının net satışını bir değişkene al. [Net Satış] ile bu değerin farkını Web değerine böl.', sol:'VAR WebSatisi = CALCULATE([Net Satış], Satislar[Kanal] = "Web") RETURN DIVIDE([Net Satış] - WebSatisi, WebSatisi)', hint:'VAR WebSatisi = CALCULATE([Net Satış], Satislar[Kanal] = "Web"), sonra DIVIDE([Net Satış] - WebSatisi, WebSatisi).' },
  { t:'mc', q:'Copilot’a “müşteri başı satış ölçüsü yaz” dedin. Gelen ölçü <code>DIVIDE(SUM(Satislar[Tutar]), COUNTROWS(Musteriler))</code>. Modele eklemeden önce ne yaparsın?', o:['Söz dizimi hatasız olduğu için ölçüyü olduğu gibi eklerim','Copilot’tan aynı ölçüyü yeniden üretmesini ister, iki sonucu karşılaştırırım','Payı [Net Satış], paydayı alışveriş yapan müşteri yapıp test ederim','Ölçüyü bir hesaplanmış sütuna çevirip satır düzeyinde kontrol ederim'], a:2, why:'Önerideki iki sorun da modelle ilgili: ham tutar iptalleri içerir, COUNTROWS(Musteriler) ise hiç alışveriş yapmamış kayıtlı müşterileri de sayar. Hazır [Müşteri Başı Satış] = DIVIDE([Net Satış], [Müşteri Sayısı]) gibi şirket kuralına uyan sürüm bilinen bir sayıyla doğrulanmalı. Söz diziminin doğru olması anlamın doğru olduğunu göstermez. Yeniden üretmek aynı varsayımları tekrarlayabilir.' },
  { t:'mc', q:'Copilot önerileri sürekli iptal edilen siparişleri de sayıyor. Ekipteki herkes için kalıcı bir iyileştirme istiyorsun. En etkili adım hangisi?', o:['Her istemin sonuna “iptalleri hariç tut” yazmayı ekipten rica ederim','Satislar tablosundan iptal satırlarını silerim','Copilot’u kapatıp hızlı ölçülere geçerim','[Net Satış] açıklamasına kuralı yazar, yapay zekâ talimatı eklerim'], a:3, why:'Copilot veriyi değil meta veriyi okur. Ölçü açıklamaları ve “Yapay zekâ için verileri hazırla” ile eklenen talimatlar, kuralı herkes için kalıcı hâle getirir. İstem disiplini kişiye bağlıdır. Satır silmek iade ve iptal analizini yok eder. Hızlı ölçüler de modelin kurallarını bilmez.' }
] });

/* ---------------------------------------------------------------- zaman */
ext('zaman', { min: 14, html: `
<h2>YTD, QTD, MTD: aynı satırda üç farklı pencere</h2>
<p>Aylık yönetim raporunda Mayıs 2024 satırına bakan bir finans uzmanı üç sayı görür. Üçü de “bugüne kadar” der, ama başlangıç noktaları farklıdır:</p>
<pre class="dax">Ay Başından Bugüne = TOTALMTD([Net Satış], Tarih[Tarih])
Çeyrek Başından Bugüne = TOTALQTD([Net Satış], Tarih[Tarih])
Yıl Başından Bugüne = TOTALYTD([Net Satış], Tarih[Tarih])</pre>
<div class="tbl-wrap"><table><tr><th>Mayıs 2024 satırı</th><th>Pencere</th><th>Değer</th></tr>
<tr><td>MTD</td><td>1–31 Mayıs</td><td>46.239 ₺</td></tr>
<tr><td>QTD</td><td>1 Nisan – 31 Mayıs</td><td>80.472 ₺</td></tr>
<tr><td>YTD</td><td>1 Ocak – 31 Mayıs</td><td>235.863 ₺</td></tr>
<tr><td>Geçen yıl YTD (<code>[Satış GY YTD]</code>)</td><td>1 Ocak – 31 Mayıs 2023</td><td>117.309 ₺</td></tr></table></div>
<p>YTD büyümesi: (235.863 − 117.309) / 117.309 = %101. Bu sayı “yılın ilk beş ayında satışlar ikiye katlandı” demektir. Aylık YoY’den daha az dalgalıdır ve yönetimin en sık sorduğu sayıdır.</p>
<h3>Yıl satırında MTD ne gösterir?</h3>
<p>2024 yıl satırında MTD 94.001 ₺ gösterir: Aralık’ın ay başından bugüne değeri. Fonksiyon “görünen son tarihin ayı” ile çalışır. Yıl satırında bu sayı yanıltıcıdır; kullanıcı bunu yılın toplamı sanabilir. MTD ve QTD ölçülerini matriste kullanıyorsan üst düzeylerde gizle: <code>IF(ISINSCOPE(Tarih[YilAy]), TOTALMTD(…))</code>.</p>
<h3>Mali yıl</h3>
<p>Şirketin mali yılı Temmuz’da başlıyorsa <code>TOTALYTD</code> ve <code>DATESYTD</code> fonksiyonlarına yıl sonu tarihini metin olarak verirsin:</p>
<pre class="dax">Mali YTD = TOTALYTD([Net Satış], Tarih[Tarih], "6-30")</pre>
<p>Tarih tablosuna da mali yıl ve mali çeyrek sütunları eklenmeli. Yoksa görselde “2024” yazan satır takvim yılını, ölçü ise mali yılı gösterir.</p>

<h2>“Önceki dönem” dört farklı şey olabilir</h2>
<p>Çeyreklik bir tabloda “önceki dönem” sütunu istendi. 2024-Ç2 satırında (net satış 145.102 ₺) dört yazım dört farklı sayı verir:</p>
<div class="tbl-wrap"><table><tr><th>Yazım</th><th>Hangi tarihler?</th><th>2024-Ç2 satırı</th></tr>
<tr><td><code>PREVIOUSMONTH(Tarih[Tarih])</code></td><td>Görünen ilk tarihten önceki tam ay: Mart</td><td>63.252 ₺</td></tr>
<tr><td><code>DATEADD(Tarih[Tarih], -1, MONTH)</code></td><td>Tüm dönem bir ay geri: Mart–Mayıs</td><td>143.724 ₺</td></tr>
<tr><td><code>PREVIOUSQUARTER(Tarih[Tarih])</code></td><td>Önceki tam çeyrek: Ocak–Mart</td><td>155.391 ₺</td></tr>
<tr><td><code>DATEADD(Tarih[Tarih], -1, QUARTER)</code></td><td>Tüm dönem bir çeyrek geri: Ocak–Mart</td><td>155.391 ₺</td></tr></table></div>
<p>Hazır <code>[Satış GA]</code> ölçüsü PREVIOUSMONTH kullandığı için çeyrek satırında yalnızca Mart’ı gösterir; “önceki çeyreğe göre büyüme” için uygun değildir. Kural: ölçünün adındaki dönemi fonksiyonda da kullan. Çeyreklik görsel için çeyreklik ölçü yaz.</p>
<p>Aynı ayrım yıllar için de geçerlidir. Ay satırında <code>SAMEPERIODLASTYEAR</code> geçen yılın aynı ayını verir; <code>PREVIOUSYEAR</code> ise geçen yılın <b>tamamını</b>. 2024’ün her ay satırında <code>PREVIOUSYEAR</code> 400.870 ₺ gösterir. Bu bir hata değil, “geçen yılın toplamına karşı bu ay” karşılaştırması için kullanılan bir ölçüdür.</p>

<h2>Eksik başlayan yıl tuzağı</h2>
<p>Bu modelde satış verisi 22 Haziran 2022’de başlıyor. 2023’ün YoY değeri bu yüzden %289,8 çıkar: 2023’ün 12 ayı, 2022’nin yaklaşık 6 ayıyla karşılaştırılıyor. Kimse bu sayıya göre karar vermemeli. Bir çözüm, karşılaştırılan dönemin tamamı veri kapsamındaysa YoY göstermektir:</p>
<pre class="dax">Tam Dönem YoY % =
VAR OncekiBas = EDATE(MIN(Tarih[Tarih]), -12)
VAR IlkSatis = CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS(Tarih))
RETURN IF(OncekiBas &gt;= IlkSatis, [YoY %])</pre>
<p>2023 yıl satırında önceki dönem 1 Ocak 2022’de başlar. Bu tarih ilk satıştan önce olduğu için ölçü BLANK döner. 2024 satırında %86,4 görünür. Ay satırlarında Temmuz 2023’ten itibaren değer çıkar.</p>
<div class="note"><b>Tarih tablosu kontrol listesi</b>1) Her gün bir satır, boşluk yok; ilk yılın 1 Ocak’ından son yılın 31 Aralık’ına. 2) Tarih sütununda saat yok (00:00 olmayan değerler ilişkiyi bozar). 3) “Tarih tablosu olarak işaretle” yapıldı. 4) Seçenekler’de “Otomatik tarih/saat” kapalı; yoksa her tarih sütunu için gizli bir tarih tablosu oluşur. 5) Ay adı gibi metin sütunları “Sütuna göre sırala” ile sayıya bağlı (Ay → AyNo). 6) Verinin başladığı ve bittiği tarih biliniyor; eksik dönemli karşılaştırmalar gizleniyor.</div>
`, ex: [
  { t:'dax', name:'Ay Başından Bugüne Satış', q:'<b>Ay Başından Bugüne Satış</b>: [Net Satış] ölçüsünün, görünen son tarihin ayının başından o tarihe kadar olan toplamı (MTD).', sol:'TOTALMTD([Net Satış], Tarih[Tarih])', hint:'TOTALYTD ile aynı kalıp: TOTALMTD([Net Satış], Tarih[Tarih]).' },
  { t:'dax', name:'YTD Büyüme %', q:'<b>YTD Büyüme %</b>: Yılbaşından bugüne satışın, geçen yılın aynı dönemine göre büyüme oranı. Hazır [Satış YTD] ve [Satış GY YTD] ölçülerini kullan.', sol:'DIVIDE([Satış YTD] - [Satış GY YTD], [Satış GY YTD])', hint:'DIVIDE(yeni − eski, eski) kalıbı.', grid:[{t:'Tarih',c:'Yil'},{t:'Tarih',c:'YilAy'}] },
  { t:'dax', name:'Tam Dönem YoY %', q:'<b>Tam Dönem YoY %</b>: Karşılaştırılan önceki dönemin başı (EDATE(MIN(Tarih[Tarih]), -12)) ilk satış tarihinden (tüm tarihler üzerinde MIN(Satislar[Tarih])) önce değilse [YoY %] değerini, aksi hâlde BLANK döndür.', sol:'VAR OncekiBas = EDATE(MIN(Tarih[Tarih]), -12) VAR IlkSatis = CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS(Tarih)) RETURN IF(OncekiBas >= IlkSatis, [YoY %])', hint:'İlk satış tarihini CALCULATE(MIN(Satislar[Tarih]), REMOVEFILTERS(Tarih)) ile bul; IF(OncekiBas >= IlkSatis, [YoY %]).', grid:[{t:'Tarih',c:'Yil'},{t:'Tarih',c:'YilAy'}] },
  { t:'query', q:'Çeyrek başına (Tarih[YilCeyrek]) üç sütun döndüren bir sorgu yaz: "Satış" ([Net Satış]), "Önceki Ay (PREVIOUSMONTH)" ve "Önceki Çeyrek" (PREVIOUSQUARTER ile [Net Satış]).', start:'EVALUATE\n', sol:'EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[YilCeyrek],\n    "Satış", [Net Satış],\n    "Önceki Ay (PREVIOUSMONTH)", CALCULATE([Net Satış], PREVIOUSMONTH(Tarih[Tarih])),\n    "Önceki Çeyrek", CALCULATE([Net Satış], PREVIOUSQUARTER(Tarih[Tarih]))\n)', hint:'İki sütun da CALCULATE([Net Satış], <zaman fonksiyonu>(Tarih[Tarih])) biçiminde.' },
  { t:'mc', q:'Çeyreklik bir tabloda “önceki döneme göre büyüme” sütunu, hazır [Satış GA] (PREVIOUSMONTH) üzerine kurulmuş. Her çeyrekte büyüme %100’ün üzerinde görünüyor. Sebep ne?', o:['Çeyrek satırında PREVIOUSMONTH yalnızca bir ayı döndürüyor','Tarih tablosu tarih tablosu olarak işaretlenmemiş','DIVIDE sıfıra bölmede büyük sayılar üretiyor','Tarih[YilCeyrek] sütunu metin olduğu için sıralama bozuk'], a:0, why:'PREVIOUSMONTH, görünen ilk tarihten önceki tam ayı döndürür. Çeyrek satırında üç aylık satış tek bir ayla karşılaştırılır ve büyüme şişer. PREVIOUSQUARTER ya da DATEADD(…, −1, QUARTER) kullanılmalı. DIVIDE sıfıra bölmede BLANK döndürür; işaretleme ve sıralama bu sonucu açıklamaz.' }
] });

/* ---------------------------------------------------------------- hedef */
ext('hedef', { min: 14, html: `
<h2>Hedefe ulaşma oranı: oranların ortalaması değil</h2>
<p>Satış direktörü yıl sonu sunumu için “2024’te hedefin yüzde kaçını tutturduk?” diye soruyor. İki ekip iki cevap getiriyor:</p>
<pre class="dax">Gerçekleşme (doğru) = DIVIDE([Net Satış], [Hedef])

Aylık Oranların Ortalaması = AVERAGEX(VALUES(Tarih[YilAy]), [Hedef Gerçekleşme %])</pre>
<p>2024 için ilki %97,9, ikincisi %97,4 verir. Fark küçük, ama yön farkı önemlidir. Oranların ortalaması, hedefi 30.000 ₺ olan bir ay ile 90.000 ₺ olan bir ayı eşit sayar. Doğru cevap her zaman <b>toplam gerçekleşen / toplam hedef</b>’tir. Bu, Yineleyiciler dersindeki ağırlıklı ortalama kuralının hedefteki karşılığıdır.</p>
<h3>Yılbaşından bugüne gerçekleşme</h3>
<p>Mayıs 2024 satırında aylık gerçekleşme %96,7. YTD gerçekleşme ise 235.863 ₺ / 243.300 ₺ = %96,9. Yönetim toplantısında genellikle ikincisi sorulur: “Yılın bu noktasında planın neresindeyiz?” İki ölçü yan yana konunca okuyucu hem ayın performansını hem yılın gidişatını görür.</p>
<p>Kategori düzeyinde tablo netleşir. Hediye kategorisi tüm dönemde hedefinin yalnızca %68,9’unu tutturmuş, diğer kategoriler %95–99 arasında. Bir “hedefe kalan” sütunu bu açığı tutar olarak gösterir:</p>
<pre class="dax">Hedefe Kalan =
IF([Net Satış] &lt; [Hedef], [Hedef] - [Net Satış], 0)</pre>
<p>Tüm dönemde Elektronik’in açığı 12.496 ₺, Hediye’ninki 7.830 ₺. Oran olarak Hediye çok daha kötü, tutar olarak Elektronik’in açığı daha büyük. İkisini birlikte göstermek önceliklendirmeyi kolaylaştırır.</p>

<h2>Ay içinde günlük hedef payı</h2>
<p>Ayın 15’inde bölge müdürü panoyu açıyor ve tarih dilimleyicisinde 1–15 Mart 2024’ü seçiyor. Ekranda şu var:</p>
<div class="tbl-wrap"><table><tr><th>Ölçü</th><th>Değer</th><th>Yorum</th></tr>
<tr><td>[Net Satış]</td><td>36.217 ₺</td><td>15 günlük satış</td></tr>
<tr><td>[Hedef]</td><td>63.700 ₺</td><td>Mart’ın tüm hedefi</td></tr>
<tr><td>[Hedef Gerçekleşme %]</td><td>%56,9</td><td>Yanlış alarm</td></tr></table></div>
<p>Hedef ayın ilk gününe bağlı olduğu için 1 Mart seçimdeyse ayın tamamı gelir. Seçim 2 Mart’ta başlasaydı hedef BLANK olurdu. İki durumda da sayı anlamsızdır. Çözüm, aylık hedefi görünen gün sayısına göre paylaştırmaktır:</p>
<pre class="dax">Gün Payına Göre Hedef =
SUMX(
    VALUES(Tarih[YilAy]),
    VAR AyHedef = CALCULATE([Hedef], ALLEXCEPT(Tarih, Tarih[YilAy]))
    VAR GorunenGun = CALCULATE(COUNTROWS(Tarih))
    VAR AyGunu = CALCULATE(COUNTROWS(Tarih), ALLEXCEPT(Tarih, Tarih[YilAy]))
    RETURN AyHedef * DIVIDE(GorunenGun, AyGunu)
)</pre>
<p>Mekanizma adım adım:</p>
<ol><li><code>SUMX(VALUES(Tarih[YilAy]), …)</code> görünen her ayı ayrı ele alır. Seçim iki aya yayılırsa iki ayın payı toplanır.</li>
<li><code>ALLEXCEPT(Tarih, Tarih[YilAy])</code> gün filtresini kaldırır ama ayı korur. Böylece <code>AyHedef</code> ayın tam hedefini, <code>AyGunu</code> ayın gün sayısını verir.</li>
<li><code>GorunenGun</code> ise seçimdeki gün sayısıdır: 15.</li></ol>
<p>Sonuç: 63.700 × 15 / 31 = 30.823 ₺. Gerçekleşme 36.217 / 30.823 = <b>%117,5</b>. Bölge, ayın ilk yarısında planın önünde. Tam ay ya da yıl seçildiğinde ölçü [Hedef] ile aynı sonucu verir (2024: 763.200 ₺). Yani bu ölçü [Hedef]’in yerine güvenle kullanılabilir.</p>
<div class="tip"><b>Takvim günü mü, iş günü mü?</b>Mağaza satışları hafta sonu artıyorsa, kurumsal satış ise hafta içi yoğunsa takvim günüyle paylaştırma adil olmaz. <code>COUNTROWS</code> yerine <code>CALCULATE(COUNTROWS(Tarih), Tarih[HaftaSonu] = "Hayır")</code> yazarak iş günü bazlı pay kurarsın. Daha ileri bir yöntem, geçmiş yılların gün bazlı satış dağılımını ağırlık olarak kullanmaktır.</div>

<h2>Kaç ay hedefi tuttuk?</h2>
<p>Bir başka sık soru başarının oranı değil sıklığıdır:</p>
<pre class="dax">Hedefi Tutan Ay =
COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Net Satış] &gt;= [Hedef]))</pre>
<p>2023’te 5 ay, 2024’te yalnızca 2 ay hedef tutturuldu. Ama 2024’ün yıllık gerçekleşmesi 2023’ten çok farklı değil (%97,9’a karşı %99,6). Yani 2024’te çoğu ay hedefe yakın kalıp aşamamış. Kategori kırılımında Giyim 36 ayın 13’ünde, Hediye 7’sinde hedefi tutmuş. Oran ve sıklık birlikte okununca hikâye tamamlanır.</p>
<div class="note"><b>Kontrol listesi: hedef görseli</b>1) Gerçekleşme oranı toplam/toplam mı? 2) Kategori ve tarih paylaşılan boyutlardan mı geliyor? 3) Ay içi seçimlerde hedef gün payına göre mi? 4) YTD gerçekleşme aylık gerçekleşmenin yanında mı? 5) Oran ile tutar açığı birlikte mi gösteriliyor?</div>
`, ex: [
  { t:'dax', name:'Gün Payına Göre Hedef', q:'<b>Gün Payına Göre Hedef</b>: Görünen her ay (Tarih[YilAy]) için ayın tam hedefini (ALLEXCEPT(Tarih, Tarih[YilAy]) ile [Hedef]), görünen gün sayısı / ayın gün sayısı oranıyla çarp ve ayları topla.', sol:'SUMX(VALUES(Tarih[YilAy]), VAR AyHedef = CALCULATE([Hedef], ALLEXCEPT(Tarih, Tarih[YilAy])) VAR GorunenGun = CALCULATE(COUNTROWS(Tarih)) VAR AyGunu = CALCULATE(COUNTROWS(Tarih), ALLEXCEPT(Tarih, Tarih[YilAy])) RETURN AyHedef * DIVIDE(GorunenGun, AyGunu))', hint:'SUMX(VALUES(Tarih[YilAy]), ...) içinde üç değişken: AyHedef, GorunenGun (CALCULATE(COUNTROWS(Tarih))), AyGunu (ALLEXCEPT ile). Sonuç AyHedef * DIVIDE(GorunenGun, AyGunu).' },
  { t:'dax', name:'Hedeften Sapma %', q:'<b>Hedeften Sapma %</b>: Net satışın hedeften yüzde kaç saptığı: ([Net Satış] − [Hedef]) / [Hedef]. Hedef yoksa BLANK dönsün.', sol:'DIVIDE([Net Satış] - [Hedef], [Hedef])', hint:'DIVIDE(fark, [Hedef]) kalıbı; hedef boşsa DIVIDE BLANK döner.' },
  { t:'dax', name:'Hedefin Altında Kalan Ay', q:'<b>Hedefin Altında Kalan Ay</b>: Görünen aylar (Tarih[YilAy]) içinde [Net Satış] &lt; [Hedef] olan ayların sayısı.', sol:'COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Net Satış] < [Hedef]))', hint:'FILTER(VALUES(Tarih[YilAy]), [Net Satış] < [Hedef]) tablosunu COUNTROWS ile say.' },
  { t:'query', q:'Ay başına (Tarih[YilAy]) "Satış" ([Net Satış]), "Hedef" ([Hedef]) ve "Gerçekleşme" ([Hedef Gerçekleşme %]) sütunlarını döndüren bir sorgu yaz.', start:'EVALUATE\n', sol:'EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[YilAy],\n    "Satış", [Net Satış],\n    "Hedef", [Hedef],\n    "Gerçekleşme", [Hedef Gerçekleşme %]\n)', hint:'SUMMARIZECOLUMNS(Tarih[YilAy], "Satış", [Net Satış], ...) kalıbı.' },
  { t:'mc', q:'Bölge müdürü her pazartesi panoda “ayın 1’inden bugüne” dönemini seçiyor ve gerçekleşme oranının ay boyunca %20’den %100’e tırmandığını görüyor. Ekip her hafta “hedefin çok gerisindeyiz” paniği yaşıyor. Ne yaparsın?', o:['Hedefi gün payına göre paylaştıran bir ölçüyle oranı yeniden hesaplarım','Hedef tablosunu günlük düzeye indirip her güne ayın 1/30’unu yazarım','Gerçekleşme oranını panodan kaldırır, yalnızca satış tutarını gösteririm','Dilimleyiciyi tam aya kilitler, ay içi seçime izin vermem'], a:0, why:'Sorun aylık hedefin ay içi bir seçimle karşılaştırılması. Gün payına göre hedef, seçilen günlerin hedefini hesaplar ve oranı adil kılar. Hedef tablosunu günlüğe çevirmek bakım yükü getirir ve 30 gün varsayımı yanlıştır. Oranı kaldırmak ya da ay içi seçimi yasaklamak müdürün sorusunu cevapsız bırakır.' }
] });

/* ---------------------------------------------------------------- rol-oynayan */
ext('rol-oynayan', { min: 14, html: `
<h2>Hangi soru hangi tarihi ister?</h2>
<p>Teknik çözüm (USERELATIONSHIP ya da ikinci tablo) ikinci adımdır. İlk adım, her sorunun hangi tarih rolüne ait olduğunu belirlemektir:</p>
<div class="tbl-wrap"><table><tr><th>İş sorusu</th><th>Soran</th><th>Tarih rolü</th></tr>
<tr><td>“Bu ay ne kadar sipariş aldık?”</td><td>Satış ekibi</td><td>Sipariş tarihi</td></tr>
<tr><td>“Bu ay ne kadar gelir tanıyabiliriz?”</td><td>Finans</td><td>Teslim tarihi</td></tr>
<tr><td>“Gelecek hafta kaç teslimat yapacağız?”</td><td>Lojistik</td><td>Teslim tarihi</td></tr>
<tr><td>“Siparişler ortalama kaç günde teslim ediliyor?”</td><td>Operasyon</td><td>İkisi birlikte (fark)</td></tr></table></div>
<p>Ocak 2024 için sipariş tarihine göre net satış 47.433 ₺, teslim tarihine göre 47.297 ₺. Yıl düzeyinde fark büyür: 2024’te sipariş bazlı 747.066 ₺, teslim bazlı 738.304 ₺. Sınır ayları (Aralık’ta verilip Ocak’ta teslim edilen siparişler) iki ölçüyü birbirinden ayırır.</p>
<h3>Teslim tarihi boş olan satırlar</h3>
<p>Teslim bazlı ölçünün genel toplamı yine 1.250.772 ₺’dir, ama yıl satırlarının toplamı 1.239.709 ₺ tutar. Aradaki 11.063 ₺, henüz teslim edilmemiş (Durum = “Kargoda”) ve <code>TeslimTarihi</code> boş olan satırlardır. Toplam satırında tarih filtresi olmadığı için bu satırlar sayılır. Power BI yıl ekseninde bunları <b>(Boş)</b> etiketli ayrı bir satırda gösterir. Finans raporunda bu satırı gizlemek yerine “Teslim bekleyen” diye adlandırmak daha dürüsttür.</p>

<h2>Anti-kalıp: olgu sütununu tarih dilimleyicisiyle süzmek</h2>
<p>USERELATIONSHIP’i bilmeyen biri teslim bazlı ölçüyü şöyle kurar:</p>
<pre class="dax">Teslim Satışı (hatalı) =
VAR Bas = MIN(Tarih[Tarih])
VAR Son = MAX(Tarih[Tarih])
RETURN CALCULATE([Net Satış], Satislar[TeslimTarihi] &gt;= Bas, Satislar[TeslimTarihi] &lt;= Son)</pre>
<p>Ocak 2024 satırında sonuç 44.996 ₺; doğrusu 47.297 ₺. Eksik 2.301 ₺, Aralık 2023’te verilip Ocak’ta teslim edilen siparişlerdir. Sebep: etkin ilişki hâlâ çalışıyor. Ocak filtresi önce sipariş tarihine göre süzüyor, ölçünün koşulu bunun <b>üstüne</b> ekleniyor. Sonuç “Ocak’ta verilip Ocak’ta teslim edilenler” oluyor. İki düzeltme var:</p>
<pre class="dax">Teslim Satışı (filtre kaldırarak) =
VAR Bas = MIN(Tarih[Tarih])
VAR Son = MAX(Tarih[Tarih])
RETURN CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Satislar[TeslimTarihi] &gt;= Bas, Satislar[TeslimTarihi] &lt;= Son)

Teslim Satışı (ilişkiyle) =
CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))</pre>
<p>İkisi de 47.297 ₺ verir. İkincisi tercih edilir: niyeti açıkça söyler ve zaman zekâsı fonksiyonlarıyla birlikte çalışır. İlk kalıp, hazır <code>[Yoldaki Sipariş]</code> ölçüsündeki gibi iki tarih sütununu aynı anda karşılaştırman gerektiğinde gerekir (“sipariş verilmiş ama teslim edilmemiş”).</p>

<h2>USERELATIONSHIP ve zaman zekâsı birlikte</h2>
<p>Finans teslim bazlı YTD istiyor. Yeni bir YTD formülü yazmana gerek yok. Var olan ölçüyü pasif ilişkiyle sarmalarsın:</p>
<pre class="dax">Teslime Göre YTD =
CALCULATE([Satış YTD], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))</pre>
<p>Dıştaki CALCULATE’in etkinleştirdiği ilişki, içteki ölçünün bütün hesabı boyunca geçerlidir. Mayıs 2024’te teslim bazlı YTD 235.031 ₺, sipariş bazlı YTD 235.863 ₺. Aynı yöntem adet, sipariş sayısı ya da kargo süresi için de çalışır. Ocak 2024’te teslim edilen siparişlerin ortalama kargo süresi 2,74 gün, Ocak’ta verilen siparişlerinki 2,67 gün.</p>
<div class="tip"><b>Ölçü ailesi kur</b>Her temel ölçünün teslim sürümünü tek tek yazmak yerine ad kuralı belirle: “… (Teslim)”. Görüntüleme klasörü (Display folder) ile ayrı bir klasöre koy. Ölçü sayısı çok artarsa aynı mantığı hesaplama grubuyla tek yerde toplayabilirsin (İleri Modelleme’deki hesaplama grupları dersi).</div>

<h2>İkinci tarih tablosuna ne zaman geçmeli?</h2>
<p>Lojistik müdürü bir matris istiyor: satırlarda sipariş ayı, sütunlarda teslim ayı, hücrede sipariş sayısı. Bu soru USERELATIONSHIP ile cevaplanamaz, çünkü aynı görselde aynı tablonun iki rolü aynı anda filtre olamaz. Burada ikinci bir tarih tablosu (ör. <code>TeslimTakvimi</code>) gerekir. Bu modelde siparişlerin %91,7’si verildiği ay içinde teslim ediliyor. Matrisin köşegeni dolu, köşegen dışı ise sınır aylarındaki kaymayı gösterir.</p>
<div class="note"><b>İkinci tablo kurarken</b>1) Sütun adlarını rolüyle başlat (“Teslim Yıl”, “Teslim Ay”); kullanıcı iki “Yil” sütununu karıştırmasın. 2) Tabloyu da tarih tablosu olarak işaretle. 3) Zaman zekâsı ölçüleri hangi takvimi kullanıyorsa adında yazsın. 4) Dilimleyicilerde iki takvimi aynı sayfada kullanacaksan hangi dilimleyicinin hangi rolü süzdüğünü başlıkta belirt.</div>
`, ex: [
  { t:'dax', name:'Teslime Göre YTD', q:'<b>Teslime Göre YTD</b>: Hazır [Satış YTD] ölçüsünü teslim tarihine göre hesapla (Satislar[TeslimTarihi] ile Tarih[Tarih] arasındaki pasif ilişkiyi etkinleştir).', sol:'CALCULATE([Satış YTD], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))', hint:'CALCULATE([Satış YTD], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih])).', grid:[{t:'Tarih',c:'Yil'},{t:'Tarih',c:'YilAy'}] },
  { t:'dax', name:'Teslime Göre Adet', q:'<b>Teslime Göre Adet</b>: Hazır [Satılan Adet] ölçüsünü teslim tarihine göre hesapla.', sol:'CALCULATE([Satılan Adet], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))', hint:'Teslime Göre Satış ile aynı kalıp; ölçü olarak [Satılan Adet] kullan.' },
  { t:'dax', name:'Teslim-Sipariş Farkı', q:'<b>Teslim-Sipariş Farkı</b>: Teslim tarihine göre [Net Satış] ile sipariş tarihine göre [Net Satış] arasındaki fark (teslim − sipariş).', sol:'CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih])) - [Net Satış]', hint:'Hazır [Teslime Göre Satış] ölçüsünü ya da CALCULATE + USERELATIONSHIP ifadesini kullan, sonra [Net Satış]’ı çıkar.', grid:[{t:'Tarih',c:'Yil'},{t:'Tarih',c:'YilAy'}] },
  { t:'query', q:'Ay başına (Tarih[YilAy]) "Sipariş Bazlı" ([Net Satış]) ve "Teslim Bazlı" (pasif ilişkiyle [Net Satış]) sütunlarını döndüren bir sorgu yaz.', start:'EVALUATE\n', sol:'EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[YilAy],\n    "Sipariş Bazlı", [Net Satış],\n    "Teslim Bazlı", CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))\n)', hint:'İkinci sütunda CALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih])) kullan.' },
  { t:'mc', q:'Finans, teslim bazlı satışı aylık raporlamak istiyor. Bir analist ölçüde <code>Satislar[TeslimTarihi] &gt;= MIN(Tarih[Tarih])</code> ve <code>&lt;= MAX(Tarih[Tarih])</code> koşullarını kullanmış. Ocak sonucu beklenenden düşük. En doğru açıklama hangisi?', o:['MIN ve MAX dış bağlamda değil CALCULATE’in içinde hesaplandığı için tarih aralığı boş kalıyor','Teslim tarihi boş olan satırlar koşulu bozup tüm ayı eksik gösteriyor','Etkin sipariş tarihi ilişkisi hâlâ süzüyor; Aralık siparişleri dışarıda kalıyor','Satislar[TeslimTarihi] sütununun veri türü tarih değil metin'], a:2, why:'Ay filtresi etkin ilişki üzerinden önce sipariş tarihine göre süzer; koşullar bunun üstüne eklenir. Aralık’ta verilip Ocak’ta teslim edilen siparişler kaybolur (bu modelde 2.301 ₺). REMOVEFILTERS(Tarih) eklemek ya da USERELATIONSHIP kullanmak çözer. Filtre bağımsız değişkenleri dış bağlamda hesaplanır; boş teslim tarihleri yalnızca kendi satırlarını etkiler.' }
] });

})(window);
