/* Kesit Power BI içerik 7: C2 yeni dersler */
(window.PBI_LESSONS = window.PBI_LESSONS || []).push(

{
  id: 'ileri-kaliplar', lv: 'C2', mod: 'Uzman DAX', min: 30,
  title: 'İleri iş kalıpları: Top N + Diğer, sepet, LFL, para birimi',
  sum: 'Gerçek projelerde en çok istenen dört uzun kalıbı sıfırdan yazmak ve her satırın neden orada olduğunu anlamak.',
  body: `
<h2>İleri seviyede ölçü yazmak</h2>
<p>Uzun bir ölçü, birbirine bağlanan küçük adımlardan oluşur. İleri seviyenin sonunda ölçüyü yazmadan önce adımları kâğıda dökersin:</p>
<ol>
<li><b>Soru:</b> Ölçü tam olarak neyi cevaplıyor? Toplam satırında ne görünmeli?</li>
<li><b>Bağlam:</b> Görselde hangi alanlar olacak? Hangi filtreler korunmalı, hangileri kaldırılmalı?</li>
<li><b>Kümeler:</b> Hangi ara tablolar gerekiyor (ilk N ürün, A alan müşteriler, ortak ürünler)?</li>
<li><b>Skaler adımlar:</b> Hangi sayılar bu kümelerden türetiliyor?</li>
<li><b>Dallar:</b> Toplam satırı, boş değerler, özel satırlar (“Diğer”) için SWITCH dalları.</li>
</ol>
<p>Her adım bir <code>VAR</code> olur. İyi adlandırılmış değişkenler ölçünün belgesidir.</p>
<h2>1 · Top N + Diğer</h2>
<p><b>Soru:</b> Grafikte ilk N ürün ve tek bir “Diğer” çubuğu; toplam her zaman genel toplama eşit. <b>Model hilesi:</b> Ürün adları + “Diğer” satırını içeren bağlantısız <code>UrunlerVeDiger</code> tablosu eksene konur; çünkü ölçü, modelde olmayan bir satır (“Diğer”) üretemez.</p>
<h2>2 · Sepet analizi</h2>
<p><b>Soru:</b> A'yı alanların yüzde kaçı B'yi de aldı? <b>Model hilesi:</b> Ürünlerin bağlantısız bir kopyası (<code>KarsiUrunler</code>) ikinci eksen olur; A filtresi kaldırılıp B filtresi <code>TREATAS</code> ile uygulanır. Destek (support), güven (confidence) ve kaldıraç (lift) üç temel metriktir:</p>
<div class="tbl-wrap"><table>
<tr><th>Metrik</th><th>Formül</th><th>Anlam</th></tr>
<tr><td>Destek</td><td>A ve B'yi birlikte alan / tüm müşteriler</td><td>Birlikteliğin yaygınlığı</td></tr>
<tr><td>Güven</td><td>A ve B'yi birlikte alan / A'yı alan</td><td>A alındığında B'nin olasılığı</td></tr>
<tr><td>Kaldıraç</td><td>Güven / B'nin genel alınma oranı</td><td>1'den büyükse birliktelik tesadüften güçlü</td></tr>
</table></div>
<h2>3 · Like-for-like (LFL)</h2>
<p><b>Soru:</b> Yeni ürün eklemenin etkisi olmadan organik büyüme ne? Her iki dönemde de satılan ürün kümesi bulunur, iki dönemin satışı yalnızca bu kümeyle hesaplanır.</p>
<h2>4 · Para birimi dönüşümü</h2>
<p><b>Soru:</b> Satışı USD/EUR olarak göster. <b>Kural:</b> Dönüşüm işlemin tanecikte (ay) yapılır, sonra toplanır. Yıllık TL toplamı yıllık ortalama kura bölünmez.</p>
<p>Dört kalıbın tam kodu ve satır satır açıklaması <button class="lnk" data-go="lab">Measure Lab</button>'nda. Aşağıdaki alıştırmalarda bunları sen yazacaksın; iskelet verildi.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Satış (Top N + Diğer)</b>: Eksende <code>UrunlerVeDiger[Urun]</code>, dilimleyicide <code>TopNSecim[N]</code> (varsayılan 5). İlk N üründe ürünün satışı, “Diğer”de genel toplam − ilk N toplamı, toplam satırında genel toplam, ilk N dışındaki ürünlerde boş.', name: 'Satış (Top N + Diğer)',
      start: 'VAR N = SELECTEDVALUE(TopNSecim[N], 5)\nVAR SeciliUrun = SELECTEDVALUE(UrunlerVeDiger[Urun])\nVAR Siralama = ADDCOLUMNS(ALL(Urunler[Urun]), "S", [Net Satış])\nVAR IlkN = TOPN(N, Siralama, [S], DESC)\nVAR IlkNToplam = \nVAR Genel = \nVAR IlkNde = NOT ISEMPTY(FILTER(IlkN, Urunler[Urun] = SeciliUrun))\nRETURN\n    SWITCH(\n        TRUE(),\n        \n    )',
      sol: 'VAR N = SELECTEDVALUE(TopNSecim[N], 5)\nVAR SeciliUrun = SELECTEDVALUE(UrunlerVeDiger[Urun])\nVAR Siralama = ADDCOLUMNS(ALL(Urunler[Urun]), "S", [Net Satış])\nVAR IlkN = TOPN(N, Siralama, [S], DESC)\nVAR IlkNToplam = SUMX(IlkN, [S])\nVAR Genel = CALCULATE([Net Satış], REMOVEFILTERS(Urunler))\nVAR IlkNde = NOT ISEMPTY(FILTER(IlkN, Urunler[Urun] = SeciliUrun))\nRETURN\n    SWITCH(\n        TRUE(),\n        NOT HASONEVALUE(UrunlerVeDiger[Urun]), Genel,\n        SeciliUrun = "Diğer", Genel - IlkNToplam,\n        IlkNde, CALCULATE([Net Satış], Urunler[Urun] = SeciliUrun),\n        BLANK()\n    )',
      grid: [{ t: 'UrunlerVeDiger', c: 'Urun' }], hint: 'IlkNToplam = SUMX(IlkN, [S]); Genel = CALCULATE([Net Satış], REMOVEFILTERS(Urunler)). SWITCH dalları: toplam satırı, "Diğer", IlkNde, BLANK().',
      explain: 'UrunlerVeDiger modele bağlı değildir; bu yüzden Siralama tüm ürünleri görür ve ürün adı Urunler\'e CALCULATE filtresiyle aktarılır. “Diğer” satırı = genel − ilk N. İlk N dışındaki ürünler boş döner ve grafikte görünmez; görselin toplamı genel toplama eşit kalır.' },
    { t: 'dax', q: '<b>Birlikte Alma Oranı %</b>: Dilimleyicideki ürün/kategori filtresiyle (A) alışveriş yapan müşterilerin, eksendeki <code>KarsiUrunler</code> ürünlerini (B) de alanlarının oranı (iptaller hariç).', name: 'Birlikte Alma Oranı %',
      start: 'VAR A_Musteriler =\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")\nVAR B_Musteriler =\n    CALCULATETABLE(\n        VALUES(Satislar[MusteriNo]),\n        REMOVEFILTERS(Urunler),\n        REMOVEFILTERS(Kategoriler),\n        \n        Satislar[Durum] <> "İptal"\n    )\nRETURN\n',
      sol: 'VAR A_Musteriler =\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")\nVAR B_Musteriler =\n    CALCULATETABLE(\n        VALUES(Satislar[MusteriNo]),\n        REMOVEFILTERS(Urunler),\n        REMOVEFILTERS(Kategoriler),\n        TREATAS(VALUES(KarsiUrunler[KarsiUrunNo]), Urunler[UrunNo]),\n        Satislar[Durum] <> "İptal"\n    )\nRETURN\n    DIVIDE(COUNTROWS(INTERSECT(A_Musteriler, B_Musteriler)), COUNTROWS(A_Musteriler))',
      grid: [{ t: 'KarsiUrunler', c: 'KarsiKategori' }], explain: 'A_Musteriler mevcut filtreyle (kontrol tablosunda filtre yok: tüm müşteriler) hesaplanır. B için ürün filtreleri kaldırılır ve yerine eksendeki B ürünleri TREATAS ile konur. Kesişim / A = güven (confidence).' },
    { t: 'dax', q: '<b>LFL Büyüme %</b>: Her iki dönemde (bu dönem ve geçen yılın aynı dönemi) satılan ürünler üzerinden büyüme oranı.', name: 'LFL Büyüme %',
      sol: 'VAR BuYil = CALCULATETABLE(VALUES(Satislar[UrunNo]), Satislar[Durum] <> "İptal")\nVAR GecenYil = CALCULATETABLE(VALUES(Satislar[UrunNo]), SAMEPERIODLASTYEAR(Tarih[Tarih]), Satislar[Durum] <> "İptal")\nVAR Ortak = INTERSECT(BuYil, GecenYil)\nVAR S1 = CALCULATE([Net Satış], Ortak)\nVAR S0 = CALCULATE([Net Satış], Ortak, SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN DIVIDE(S1 - S0, S0)',
      grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Kategoriler', c: 'Kategori' }], explain: 'Ortak, soy bağı Satislar[UrunNo] olan bir tablodur; CALCULATE\'e verilince satışları yalnızca ortak ürünlerle sınırlar. Geçen yılın hesabında hem Ortak hem SAMEPERIODLASTYEAR birlikte uygulanır.' },
    { t: 'dax', q: '<b>Satış (Seçili Para)</b>: <code>ParaBirimleri[ParaBirimi]</code> seçimi (varsayılan TRY). TRY değilse görünen her ay için o ayın satışını <code>DovizKurlari</code>\'ndaki o ayın kuruna böl ve topla. Ayın ilk günü: DATEVALUE(Tarih[YilAy] & "-01").', name: 'Satış (Seçili Para)',
      start: 'VAR Para = SELECTEDVALUE(ParaBirimleri[ParaBirimi], "TRY")\nRETURN\n    IF(\n        Para = "TRY",\n        [Net Satış],\n        SUMX(\n            VALUES(Tarih[YilAy]),\n            \n        )\n    )',
      sol: 'VAR Para = SELECTEDVALUE(ParaBirimleri[ParaBirimi], "TRY")\nRETURN\n    IF(\n        Para = "TRY",\n        [Net Satış],\n        SUMX(\n            VALUES(Tarih[YilAy]),\n            VAR AyBasi = DATEVALUE(Tarih[YilAy] & "-01")\n            VAR Kur = LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], AyBasi, DovizKurlari[ParaBirimi], Para)\n            RETURN DIVIDE([Net Satış], Kur)\n        )\n    )',
      grid: [{ t: 'ParaBirimleri', c: 'ParaBirimi' }, { t: 'Tarih', c: 'Yil' }], explain: 'Eksende para birimi olunca her satır kendi para birimini döndürür. SUMX içindeki VAR\'lar her ay için yeniden tanımlanır. LOOKUPVALUE ilişki olmadan iki koşulla kuru bulur; [Net Satış] bağlam geçişiyle yalnızca o ayın satışıdır.' }
  ]
},

{
  id: 'hiyerarsi', lv: 'C2', mod: 'Uzman DAX', min: 20,
  title: 'Hiyerarşiler: ebeveyn-çocuk, düzensiz hiyerarşi, hiyerarşiye göre hesap',
  sum: 'PATH, PATHITEM, PATHLENGTH, PATHCONTAINS; ebeveyne göre pay; ISINSCOPE ile düzey bilinçli ölçüler.',
  body: `
<h2>Doğal hiyerarşi ve ebeveyn-çocuk hiyerarşisi</h2>
<p>Kategori → Ürün ya da Yıl → Çeyrek → Ay gibi <b>doğal hiyerarşiler</b> farklı sütunlarda durur ve matrise satır satır eklenir. Organizasyon şeması ise tek tabloda <b>ebeveyn-çocuk</b> (parent-child) biçimindedir: <code>Calisanlar[CalisanNo]</code> ve <code>Calisanlar[YoneticiNo]</code>. Derinlik sabit değildir; buna <b>düzensiz</b> (ragged) hiyerarşi denir.</p>
<h2>PATH ailesi</h2>
<pre class="dax" data-notry>-- Hesaplanmış sütunlar (Calisanlar tablosunda):
Yol = PATH(Calisanlar[CalisanNo], Calisanlar[YoneticiNo])        -- "1|2|9"
Seviye = PATHLENGTH(Calisanlar[Yol])                             -- 3
Seviye1 = LOOKUPVALUE(Calisanlar[AdSoyad], Calisanlar[CalisanNo], PATHITEM(Calisanlar[Yol], 1, INTEGER))
Seviye2 = LOOKUPVALUE(Calisanlar[AdSoyad], Calisanlar[CalisanNo], PATHITEM(Calisanlar[Yol], 2, INTEGER))
Seviye3 = LOOKUPVALUE(Calisanlar[AdSoyad], Calisanlar[CalisanNo], PATHITEM(Calisanlar[Yol], 3, INTEGER))</pre>
<p>Seviye1–3 sütunları matrisin satırlarına konunca organizasyon şeması açılıp kapanan bir hiyerarşi olur. Boş seviyeleri gizlemek için düzey bilinçli bir ölçü kullanılır:</p>
<pre class="dax" data-notry>Satış (Hiyerarşi) =
VAR Derinlik = MAX(Calisanlar[Seviye])
VAR GosterilenDuzey =
    ISINSCOPE(Calisanlar[Seviye1])
        + ISINSCOPE(Calisanlar[Seviye2])
        + ISINSCOPE(Calisanlar[Seviye3])
RETURN
    IF(GosterilenDuzey <= Derinlik, [Ekip Satışı])</pre>
<p>Matris, bir çalışanın gerçek derinliğinden daha alt bir düzeyi gösteriyorsa (ör. temsilcinin altında boş bir “Seviye4”) ölçü boş döner ve o satır gizlenir. TRUE/FALSE değerleri toplanınca 1/0 olur.</p>
<h2>Ekibin toplamı: PATHCONTAINS</h2>
<p>Bir yöneticinin satırında, hiyerarşide altındaki herkesin toplamı:</p>
<pre class="dax">Ekip Satışı =
VAR Kisi = SELECTEDVALUE(Calisanlar[CalisanNo])
RETURN CALCULATE([Net Satış], FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], Kisi)))</pre>
<h2>Hiyerarşide pay: ebeveyne göre</h2>
<p>Matriste Kategori → Ürün varken, ürün satırında ürünün kategorisi içindeki payını, kategori satırında kategorinin genel paydaki yerini göstermek:</p>
<pre class="dax">Ebeveyne Göre Pay % =
SWITCH(
    TRUE(),
    ISINSCOPE(Urunler[Urun]),
        DIVIDE([Net Satış], CALCULATE([Net Satış], ALLSELECTED(Urunler[Urun]))),
    ISINSCOPE(Urunler[Kategori]),
        DIVIDE([Net Satış], CALCULATE([Net Satış], ALLSELECTED(Urunler[Kategori]))),
    1
)</pre>
<p><code>ISINSCOPE</code> en alt düzeyden başlayarak kontrol edilir: ürün düzeyinde kategori de “kapsamda”dır.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Ekip Satışı</b>: Satırdaki çalışan ve hiyerarşide altındaki herkesin net satış toplamı (Calisanlar[Yol] sütununda çalışan numarası geçenler).', name: 'Ekip Satışı',
      sol: 'VAR Kisi = SELECTEDVALUE(Calisanlar[CalisanNo])\nRETURN IF(NOT ISBLANK(Kisi), CALCULATE([Net Satış], FILTER(ALL(Calisanlar), PATHCONTAINS(Calisanlar[Yol], Kisi))))',
      grid: [{ t: 'Calisanlar', c: 'AdSoyad' }], noTotal: true, explain: 'Satış müdürünün Yol değeri “1|2”; temsilcilerinki “1|2|9” gibi. PATHCONTAINS(Yol, 2) müdürü ve tüm temsilcilerini döndürür. Genel müdür satırında herkes, yani toplam satış.' },
    { t: 'dax', q: '<b>Ebeveyne Göre Pay %</b>: Ürün satırında ürünün görünen ürünler içindeki payı (ALLSELECTED(Urunler[Urun])), kategori satırında kategorinin görünen kategoriler içindeki payı (ALLSELECTED(Urunler[Kategori])), toplamda 1.', name: 'Ebeveyne Göre Pay %',
      sol: 'SWITCH(TRUE(),\n    ISINSCOPE(Urunler[Urun]), DIVIDE([Net Satış], CALCULATE([Net Satış], ALLSELECTED(Urunler[Urun]))),\n    ISINSCOPE(Urunler[Kategori]), DIVIDE([Net Satış], CALCULATE([Net Satış], ALLSELECTED(Urunler[Kategori]))),\n    1)',
      grid: [{ t: 'Urunler', c: 'Kategori' }], explain: 'Kategori satırında ISINSCOPE(Urunler[Kategori]) doğrudur ve kategorinin payı hesaplanır. Ürün düzeyinde ALLSELECTED(Urunler[Urun]) yalnızca ürün filtresini kaldırır; kategori filtresi kaldığı için pay kategori içidir.' },
    { t: 'dax', q: '<b>Hiyerarşi Derinliği</b>: Satırdaki çalışanın yöneticiler zincirindeki derinliği. Satır bağlamında PATH ile yol üret ve PATHLENGTH ile uzunluğunu al. Ölçüde satır bağlamı yok; MAXX(Calisanlar, …) ile dolaş.', name: 'Hiyerarşi Derinliği',
      sol: 'MAXX(Calisanlar, PATHLENGTH(PATH(Calisanlar[CalisanNo], Calisanlar[YoneticiNo])))', grid: [{ t: 'Departmanlar', c: 'Departman' }],
      explain: 'PATH satır bağlamı ister; MAXX her çalışan satırında yolu hesaplar ve en derinini döndürür. Departman satırında o departmandaki en derin seviye.' }
  ]
},

{
  id: 'istatistik-ileri', lv: 'C2', mod: 'Analiz', min: 20,
  title: 'İleri istatistik: eğilim, z-skoru, mevsimsellik',
  sum: 'Analiz bölmesindeki eğilim çizgisinin matematiği, aykırı değer tespiti ve mevsim endeksi; hepsi DAX ile.',
  body: `
<h2>Eğilim: en küçük kareler</h2>
<p>Eğilim çizgisi <code>y = a + b·x</code> doğrusudur. <code>b</code> eğim, <code>a</code> kesişimdir:</p>
<p style="font-family:var(--f-mono)">b = (N·Σxy − Σx·Σy) / (N·Σx² − (Σx)²)<br>a = (Σy − b·Σx) / N</p>
<p>DAX'ta x için ay sıra numarası (<code>RANKX</code> ile), y için satış alınır ve beş toplam <code>SUMX</code> ile hesaplanır. Analiz bölmesindeki eğilim çizgisi görselde bunu yapar; ölçü olarak yazmak ise eğimi bir kartta (“ayda ortalama +4,2 B ₺”) göstermeyi ve eğilimden sapmayı hesaplamayı sağlar.</p>
<h2>Z-skoru</h2>
<p><code>z = (değer − ortalama) / standart sapma</code>. |z| ≥ 2 genellikle aykırı kabul edilir. <code>STDEVX.P</code> sanal tablo üzerinde standart sapma hesaplar. Güçlü eğilimli serilerde önce eğilimi çıkarmak (kalıntılar üzerinde z-skoru) daha doğrudur.</p>
<h2>Mevsimsellik</h2>
<p>Her takvim ayının ortalamasının genel ortalamaya oranı. Klasik tuzak: ara tabloyu <code>CALCULATETABLE</code>'ın dışında genişletmek; satırdaki ay filtresi diğer ayları boşaltır ve her ay 1 çıkar.</p>
<h2>Korelasyon</h2>
<pre class="dax">Fiyat–Adet Korelasyonu =
VAR T = ADDCOLUMNS(VALUES(Urunler[Urun]), "X", CALCULATE(AVERAGE(Urunler[Fiyat])), "Y", [Satılan Adet])
VAR MX = AVERAGEX(T, [X])
VAR MY = AVERAGEX(T, [Y])
VAR Kov = SUMX(T, ([X] - MX) * ([Y] - MY))
VAR SX = SQRT(SUMX(T, ([X] - MX) ^ 2))
VAR SY = SQRT(SUMX(T, ([Y] - MY) ^ 2))
RETURN DIVIDE(Kov, SX * SY)</pre>
<p>−1 ile 1 arası: negatif değer, pahalı ürünlerin daha az adet sattığını gösterir. Korelasyon nedensellik değildir.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Eğilim Eğimi</b>: Görünen aylar (ALLSELECTED(Tarih[YilAy])) için x = ay sıra numarası, y = net satış; satışı olmayan aylar hariç. En küçük kareler eğimini döndür.', name: 'Eğilim Eğimi',
      start: 'VAR Seri =\n    FILTER(\n        ADDCOLUMNS(\n            ALLSELECTED(Tarih[YilAy]),\n            "X", RANKX(ALLSELECTED(Tarih[YilAy]), Tarih[YilAy], , ASC),\n            "Y", [Net Satış]\n        ),\n        NOT ISBLANK([Y])\n    )\nVAR N = COUNTROWS(Seri)\nVAR SX = SUMX(Seri, [X])\nVAR SY = SUMX(Seri, [Y])\nVAR SXY = \nVAR SXX = \nRETURN\n',
      sol: 'VAR Seri =\n    FILTER(\n        ADDCOLUMNS(\n            ALLSELECTED(Tarih[YilAy]),\n            "X", RANKX(ALLSELECTED(Tarih[YilAy]), Tarih[YilAy], , ASC),\n            "Y", [Net Satış]\n        ),\n        NOT ISBLANK([Y])\n    )\nVAR N = COUNTROWS(Seri)\nVAR SX = SUMX(Seri, [X])\nVAR SY = SUMX(Seri, [Y])\nVAR SXY = SUMX(Seri, [X] * [Y])\nVAR SXX = SUMX(Seri, [X] * [X])\nRETURN\n    DIVIDE(N * SXY - SX * SY, N * SXX - SX * SX)',
      grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Kategoriler', c: 'Kategori' }], explain: 'Eğim, ayda ortalama kaç TL arttığını söyler. Kategori satırında her kategorinin kendi eğilimi hesaplanır (ALLSELECTED yalnızca tarih eksenini açar, kategori filtresi korunur).' },
    { t: 'dax', q: '<b>Z-Skoru</b>: Satırdaki ayın net satışının, görünen ayların (ALLSELECTED(Tarih[YilAy])) ortalamasından kaç popülasyon standart sapması uzakta olduğu. Satışsız aylar hariç; tek ay değilse boş.', name: 'Z-Skoru',
      sol: 'VAR Seri = FILTER(ADDCOLUMNS(ALLSELECTED(Tarih[YilAy]), "S", [Net Satış]), NOT ISBLANK([S]))\nVAR Ort = AVERAGEX(Seri, [S])\nVAR Sapma = STDEVX.P(Seri, [S])\nVAR Deger = [Net Satış]\nRETURN IF(HASONEVALUE(Tarih[YilAy]) && NOT ISBLANK(Deger), DIVIDE(Deger - Ort, Sapma))',
      grid: [{ t: 'Tarih', c: 'YilAy' }], noTotal: true, explain: 'Koşullu biçimlendirmede kural: değer ≥ 2 ise kırmızı, ≤ −2 ise mavi. Hızlı büyüyen bu veride ilk aylar negatif, son aylar pozitif çıkar; bu, z-skorunun eğilime duyarlı olduğunu gösterir.' }
  ]
},

{
  id: 'dax-opt', lv: 'C2', mod: 'İleri Modelleme', min: 24,
  title: 'DAX optimizasyonu: depolama motoru, formül motoru',
  sum: 'Sorgu planı, SE ve FE süreleri, materyalizasyon, geri çağırmalar; yavaş ölçüyü hızlandırma reçeteleri.',
  body: `
<h2>İki motor</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Depolama motoru (SE, VertiPaq)</th><th>Formül motoru (FE)</th></tr>
<tr><td>Ne yapar?</td><td>Sıkıştırılmış sütunları tarar, filtreler, toplar</td><td>DAX mantığını yürütür: IF, iç içe yineleyiciler, karmaşık ifadeler</td></tr>
<tr><td>Paralel mi?</td><td>Çok çekirdekli</td><td>Tek iş parçacığı</td></tr>
<tr><td>Önbellek</td><td>Var (aynı veri isteği tekrar hesaplanmaz)</td><td>Yok</td></tr>
<tr><td>Hedef</td><td>İşin çoğu burada yapılsın</td><td>Az ve küçük ara sonuçlarla çalışsın</td></tr>
</table></div>
<p>DAX Studio → <b>Server Timings</b>: toplam süre, SE süresi, FE süresi, SE sorgu sayısı ve her SE sorgusunun döndürdüğü satır sayısı. Yavaş bir ölçüde genellikle iki desen görürsün: (1) çok sayıda küçük SE sorgusu (yineleyicide bağlam geçişi), (2) milyonlarca satırlık bir ara sonucun FE'ye taşınması (materyalizasyon).</p>
<h2>Geri çağırma (callback)</h2>
<p>SE basit aritmetiği kendi yapabilir; ama <code>IF</code>, <code>DIVIDE</code> gibi bazı ifadeler satır satır FE'ye “geri çağırma” ister (CallbackDataID). <code>SUMX(Satislar, IF(Satislar[Indirim] &gt; 0, Satislar[Tutar]))</code> yerine <code>CALCULATE(SUM(Satislar[Tutar]), Satislar[Indirim] &gt; 0)</code> yazmak işi tamamen SE'ye verir.</p>
<h2>Reçeteler</h2>
<div class="tbl-wrap"><table>
<tr><th>Belirti</th><th>Neden</th><th>Çözüm</th></tr>
<tr><td>Ölçü tek başına hızlı, matriste yavaş</td><td>Her hücrede tekrar eden pahalı alt ifade</td><td>VAR ile bir kez hesapla; mümkünse dışa taşı</td></tr>
<tr><td>Çok sayıda SE sorgusu</td><td>Büyük tabloda yineleyici + ölçü çağrısı</td><td>Boyutun anahtarı üzerinde dolaş: <code>SUMX(VALUES(Urunler[UrunNo]), …)</code></td></tr>
<tr><td>FE süresi yüksek</td><td>Büyük materyalizasyon (FILTER(Satislar…))</td><td>Sütun filtresi kullan; <code>KEEPFILTERS</code> ile kesişim</td></tr>
<tr><td>Yüksek kardinaliteli sütun filtresi yavaş</td><td>Milyonlarca farklı değer</td><td>Modelde sütunu böl (tarih/saat), gruplanmış sütun ekle</td></tr>
<tr><td>IFERROR / ISERROR yaygın</td><td>Hata yakalama satır satır FE'de</td><td>DIVIDE ve doğru veri türleri</td></tr>
<tr><td>Çift yönlü ilişkiler</td><td>Filtre zincirleri ve belirsizlik</td><td>Tek yön + gerektiğinde CROSSFILTER</td></tr>
<tr><td>Görsel çok satırlı</td><td>Görselde 10.000+ satır</td><td>İlk N filtresi, sayfalandırma, detay sayfası</td></tr>
</table></div>
<h2>Ölçme yöntemi</h2>
<ol>
<li>Performans Analizi'nde yavaş görseli bul → <b>Sorguyu kopyala</b>.</li>
<li>DAX Studio'da (ya da DAX sorgu görünümünde) sorguyu çalıştır; önbelleği temizleyerek (Clear Cache) ölç.</li>
<li>Ölçüyü değiştir, aynı koşulda tekrar ölç. Tek değişiklik, tek ölçüm.</li>
<li>Sonuçların aynı olduğunu doğrula (performans için doğruluktan vazgeçme).</li>
</ol>
<div class="note"><b>Bu oyun alanında</b>DAX Playground her çalıştırmada süreyi milisaniye olarak gösterir. Motor VertiPaq değildir ama kalıplar aynı yönde davranır: Measure Lab’deki RFM segment sayımı, segment satırı başına tüm müşterileri dolaştığı için diğerlerinden çok daha yavaştır.</div>
`,
  ex: [
    { t: 'mc', q: 'DAX Studio\'da bir ölçünün 2.000 küçük depolama motoru sorgusu ürettiğini görüyorsun. En olası neden?', o: ['Tarih tablosu işaretli değil', 'Büyük bir tabloda yineleyicinin içinde ölçü çağrısı (her satırda bağlam geçişi)', 'Tema dosyası', 'Çok fazla görsel'], a: 1, why: 'Her satırdaki bağlam geçişi ayrı bir SE sorgusu doğurabilir; boyutun anahtarı üzerinde dolaşmak sayıyı azaltır.' },
    { t: 'mc', q: 'Hangisi geri çağırma (callback) gerektirmeden depolama motorunda çözülür?', o: ['SUMX(Satislar, IF(Satislar[Indirim] > 0, Satislar[Tutar]))', 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Indirim] > 0)', 'SUMX(Satislar, IFERROR(Satislar[Tutar] / Satislar[Adet], 0))', 'Hiçbiri'], a: 1, why: 'Sütun filtresi ve basit toplama SE\'nin işidir.' },
    { t: 'dax', q: '<b>İndirimli Satış (Hızlı)</b>: İndirimli (Indirim > 0) ve iptal edilmemiş satırların tutar toplamı; satır satır IF kullanmadan, CALCULATE filtreleriyle.', name: 'İndirimli Satış (Hızlı)', sol: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Indirim] > 0, Satislar[Durum] <> "İptal")', grid: [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }], explain: 'İki sütun filtresi depolama motorunda uygulanır ve toplam tek taramada bulunur. SUMX(Satislar, IF(…)) aynı sonucu verir ama satır satır formül motoruna geri çağırma gerektirir.' }
  ]
},

{
  id: 'kurumsal-model', lv: 'C2', mod: 'İleri Modelleme', min: 22,
  title: 'Kurumsal model: bileşik, toplamalar, Direct Lake, artımlı yenileme, XMLA',
  sum: 'Büyük anlam modelleri için depolama modu kararları, toplama tabloları, büyük model biçimi, Direct Lake geri dönüşü, XMLA uç noktası.',
  body: `
<h2>Depolama modu kararları</h2>
<div class="tbl-wrap"><table>
<tr><th>Durum</th><th>Öneri</th></tr>
<tr><td>Veri 1 GB'ın altında, günlük yenileme yeterli</td><td>Import</td></tr>
<tr><td>Fabric lakehouse/warehouse'ta Delta tablolar, büyük hacim</td><td>Direct Lake</td></tr>
<tr><td>Kaynakta sürekli değişen veri, saniyeler önemli</td><td>DirectQuery (ya da gerçek zamanlı zekâ)</td></tr>
<tr><td>Özet hızlı olsun, ayrıntı canlı kalsın</td><td>Bileşik model: toplama tablosu Import, ayrıntı DirectQuery</td></tr>
<tr><td>Birden çok yayımlanmış modeli birleştirmek</td><td>Bileşik model: canlı bağlantı + yerel tablolar (DirectQuery for Power BI datasets/AS)</td></tr>
</table></div>
<h2>Bileşik modeller ve Dual</h2>
<p>Bir tabloyu <b>Dual</b> yapmak, onu hem Import hem DirectQuery gibi davranabilir kılar: Import tabloyla birlikte sorgulanınca bellekten, DirectQuery tabloyla birlikte sorgulanınca kaynaktan okunur. Boyut tabloları genellikle Dual olur; böylece “zayıf ilişki” (limited relationship) oluşmaz.</p>
<h2>Kullanıcı tanımlı toplamalar</h2>
<p>Milyar satırlık bir DirectQuery olgu tablosunun yanında ay × ürün düzeyinde bir Import özet tablo oluşturulur ve <b>Toplamaları yönet</b> ile eşlenir (Satış Toplamı → Satislar[Tutar] Toplam). Sorgu özet düzeyindeyse motor özet tabloyu kullanır, ayrıntıya inilince DirectQuery'ye düşer. Kullanıcı yalnızca ayrıntı tablosunu görür.</p>
<h2>Büyük model biçimi</h2>
<p>Premium/Fabric kapasitesinde anlam modeli ayarı: model 10 GB sınırını aşabilir, XMLA yazma işlemleri ve artımlı yenileme bölümleri daha verimli olur. Büyük modellerde açılması önerilir.</p>
<h2>Direct Lake</h2>
<ul>
<li><b>Direct Lake on OneLake:</b> Model doğrudan OneLake'teki Delta dosyalarını okur; birden çok lakehouse/warehouse'tan tablo alabilir; SQL uç noktasına bağımlı değildir.</li>
<li><b>Direct Lake on SQL analytics endpoint:</b> Lakehouse/warehouse'un SQL uç noktası üzerinden; görünümler (view) ya da satır düzeyi güvenlik gibi durumlarda sorgu <b>DirectQuery'ye geri döner</b> (fallback).</li>
<li><b>Geri dönüş davranışı</b> (DirectLakeBehavior): Otomatik, Yalnızca Direct Lake (geri dönüş yerine hata), Yalnızca DirectQuery. Performansı öngörülebilir tutmak için geri dönüşleri izle.</li>
<li><b>Çerçeveleme (framing):</b> Direct Lake'te “yenileme”, modelin Delta tablolarının hangi sürümüne bakacağını güncellemektir; veri kopyalanmaz, saniyeler sürer.</li>
</ul>
<h2>Artımlı yenileme</h2>
<ol>
<li>Power Query'de <code>RangeStart</code> ve <code>RangeEnd</code> (Tarih/Saat) parametrelerini oluştur.</li>
<li>Olgu tablosunu <code>[Tarih] &gt;= RangeStart and [Tarih] &lt; RangeEnd</code> ile filtrele (sorgu katlanmalı).</li>
<li>Tabloya sağ tık → <b>Artımlı yenileme</b>: “Son 5 yılı arşivle, son 10 günü yenile”, isteğe bağlı “yalnızca tam günler”, “veri değişikliklerini algıla”, ve DirectQuery ile gerçek zamanlı son bölüm (hibrit tablo).</li>
<li>Yayımla; ilk yenileme bölümleri oluşturur, sonrakiler yalnızca son bölümleri yeniler.</li>
</ol>
<h2>XMLA uç noktası</h2>
<p>Premium/Fabric çalışma alanları Analysis Services protokolüyle erişilebilir. Tabular Editor, SQL Server Management Studio, DAX Studio ve ALM Toolkit bu uç noktayla modele bağlanır: tek tablo ya da bölüm yenileme, hesaplama grubu ve nesne düzeyi güvenlik (OLS) tanımlama, modeli komut dosyasıyla dağıtma. “Okuma-yazma” kapasite ayarından açılır.</p>
`,
  ex: [
    { t: 'mc', q: 'Milyar satırlık olgu tablosu DirectQuery\'de; yöneticiler çoğunlukla aylık kategori toplamlarına bakıyor ve rapor yavaş. Kullanıcıyı değiştirmeden çözüm?', o: ['Tüm modeli Import yapmak', 'Ay × kategori düzeyinde Import toplama tablosu oluşturup Toplamaları yönet ile eşlemek', 'Görselleri silmek', 'RLS'], a: 1, why: 'Kullanıcı tanımlı toplamalar özet sorguları bellekten, ayrıntıyı kaynaktan karşılar.' },
    { t: 'mc', q: 'Direct Lake modelinde bazı sorguların beklenmedik şekilde yavaşladığını ve DirectQuery\'ye düştüğünü görüyorsun. Bunu sistematik olarak engellemek için?', o: ['DirectLakeBehavior = Yalnızca Direct Lake', 'Artımlı yenileme', 'Tema', 'Büyük model biçimini kapatmak'], a: 0, why: 'Yalnızca Direct Lake ayarı geri dönüş yerine hata verir; geri dönüşe neden olan durum (ör. SQL görünümü ya da SQL uç noktasında tanımlı satır/nesne güvenliği) tespit edilip düzeltilir.' },
    { t: 'mc', q: 'Artımlı yenileme için Power Query\'de gereken iki parametrenin adı ve türü?', o: ['Baslangic ve Bitis, metin', 'RangeStart ve RangeEnd, Tarih/Saat', 'MinDate ve MaxDate, Tarih', 'Start ve End, sayı'], a: 1, why: 'Adlar ve tür (Date/Time) zorunludur; filtre sorgu katlanmalıdır.' },
    { t: 'mc', q: 'Bileşik modelde boyut tablolarını hangi depolama moduna almak zayıf (limited) ilişkileri önler?', o: ['Import', 'DirectQuery', 'Dual', 'Direct Lake'], a: 2, why: 'Dual tablolar sorgunun bağlamına göre Import ya da DirectQuery gibi davranır.' }
  ]
},

{
  id: 'yasam-dongusu', lv: 'C2', mod: 'Yönetim ve Güvenlik', min: 20,
  title: 'Yaşam döngüsü: PBIP, TMDL, Git, dağıtım işlem hatları, şablonlar',
  sum: 'Raporu kod gibi yönetmek: proje biçimi, sürüm denetimi, ortamlar arası dağıtım, etki analizi ve yeniden kullanılabilir varlıklar.',
  body: `
<h2>PBIP: rapor bir klasör olur</h2>
<p>Dosya → Farklı kaydet → <b>Power BI Projesi (.pbip)</b>. Tek bir ikili .pbix yerine bir klasör yapısı oluşur:</p>
<pre class="dax" data-notry>AnadoluMarket.pbip
AnadoluMarket.SemanticModel/
    definition/            -- TMDL: tablolar, ölçüler, ilişkiler metin olarak
        tables/Satislar.tmdl
        relationships.tmdl
AnadoluMarket.Report/
    definition/            -- PBIR: sayfalar ve görseller JSON olarak</pre>
<p>Model <b>TMDL</b> (Tabular Model Definition Language) ile yazılır; bir ölçü şöyle görünür:</p>
<pre class="dax" data-notry>measure 'Net Satış' = CALCULATE([Toplam Satış], Satislar[Durum] &lt;&gt; "İptal")
    formatString: #,0 ₺
    displayFolder: Temel</pre>
<p>Artık her değişiklik satır satır görülebilir, kod incelemesi (pull request) yapılabilir, iki geliştiricinin değişiklikleri birleştirilebilir. Desktop'taki <b>TMDL görünümü</b> modeli doğrudan metin olarak düzenlemeyi sağlar.</p>
<h2>Git entegrasyonu</h2>
<p>Fabric çalışma alanı ayarları → <b>Git tümleştirmesi</b>: Azure DevOps ya da GitHub deposu ve dalı bağlanır. Çalışma alanındaki öğeler depoya işlenir (commit), depodaki değişiklikler çalışma alanına alınır (update). Tipik akış: her geliştirici kendi dalında Desktop'ta çalışır → pull request → ana dal → bağlı geliştirme çalışma alanı güncellenir.</p>
<h2>Dağıtım işlem hatları</h2>
<ol>
<li>Geliştirme → Test → Üretim aşamaları, her biri bir çalışma alanı.</li>
<li><b>Dağıt</b>: içerik bir sonraki aşamaya kopyalanır; aşamalar arasında fark karşılaştırılır.</li>
<li><b>Dağıtım kuralları</b>: Test'te test veritabanı, Üretim'de canlı veritabanı (veri kaynağı ya da parametre kuralı).</li>
<li>Otomasyon: Fabric REST API ve Azure DevOps/GitHub Actions ile.</li>
</ol>
<h2>Etki analizi</h2>
<p>Bir lakehouse tablosunu, veri akışını ya da anlam modelini değiştirmeden önce <b>Soy (lineage) görünümü</b> ve <b>etki analizi</b>: bu öğeye bağlı kaç model, rapor, pano ve kullanıcı var? Değişikliği bağlı öğelerin sahiplerine bildirebilirsin.</p>
<h2>Yeniden kullanılabilir varlıklar</h2>
<div class="tbl-wrap"><table>
<tr><th>Dosya</th><th>İçerik</th><th>Kullanım</th></tr>
<tr><td>.pbit (şablon)</td><td>Model, ölçüler, rapor; veri yok; isteğe bağlı parametre istemi</td><td>Standart rapor başlangıcı, müşteriye dağıtılan çözüm</td></tr>
<tr><td>.pbids (veri kaynağı)</td><td>Bağlantı bilgisi (JSON)</td><td>Kullanıcı açınca doğru kaynağa bağlanmış boş rapor</td></tr>
<tr><td>Paylaşılan anlam modeli</td><td>Yayımlanmış, onaylı model</td><td>Birçok raporun tek doğru kaynağı (Derleme izni ile)</td></tr>
<tr><td>Tema JSON</td><td>Renk ve stil</td><td>Kurumsal görünüm</td></tr>
</table></div>
`,
  ex: [
    { t: 'mc', q: 'İki geliştirici aynı modelde farklı ölçüler üzerinde çalışıyor ve değişikliklerini incelemek istiyorlar. Doğru başlangıç?', o: ['Aynı .pbix dosyasını e-postayla göndermek', 'Projeyi .pbip olarak kaydedip Git deposunda dallarla çalışmak', 'Web\'de yayımla', 'Her şeyi tek bir ölçüye yazmak'], a: 1, why: 'PBIP modeli TMDL metni olarak saklar; Git dalları ve pull request ile birleştirme yapılır.' },
    { t: 'mc', q: 'Test aşamasında test veritabanına, Üretim\'de canlı veritabanına bağlanmayı otomatik yapan özellik?', o: ['Dağıtım kuralları', 'RLS', 'Yer işareti', 'Sertifikalama'], a: 0, why: 'Dağıtım işlem hattı kuralları veri kaynağını ya da parametreyi aşamaya göre değiştirir.' },
    { t: 'mc', q: 'Kullanıcının dosyayı açınca doğrudan şirket SQL veritabanına bağlanmış boş bir rapor görmesi için hangi dosya?', o: ['.pbit', '.pbids', '.pbip', '.rdl'], a: 1, why: '.pbids yalnızca veri kaynağı bağlantı bilgisini taşır.' }
  ]
},

{
  id: 'dp600', lv: 'C2', mod: 'Sınav Hazırlığı', min: 16,
  title: 'DP-600 Fabric Analytics Engineer hazırlığı',
  sum: 'DP-600’ün dört sınav alanı, güncel ağırlıkları ve Kesit Power BI’daki çalışma karşılıkları.',
  body: `
<h2>Sınav hakkında</h2>
<p><b>DP-600: Implementing Analytics Solutions Using Microsoft Fabric</b> sınavını geçenler <i>Microsoft Certified: Fabric Analytics Engineer Associate</i> unvanını alır. PL-300'ün bir üst basamağı gibi düşünülebilir: rapor yazmaktan çok veriyi hazırlamak, kurumsal anlam modeli kurmak ve çözümü yönetmek ölçülür. Geçme puanı 1000 üzerinden 700'dür.</p>
<h2>Ölçülen beceriler</h2>
<p>Ağırlıklar 9 Kasım 2026’da <a href="https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600" target="_blank" rel="noopener">Microsoft Learn çalışma kılavuzundan</a> doğrulandı. Kılavuzun son güncellemesi 30 Ekim 2026.</p>
<div class="tbl-wrap"><table>
<tr><th>Alan</th><th>Ağırlık</th><th>Başlıca konular</th><th>Bu uygulamada</th></tr>
<tr><td><b>Analitik çözümü planla, uygula ve yönet</b></td><td>%10–15</td><td>Ortam ve kapasite seçimi, erişim, çalışma alanı, sürüm denetimi ve dağıtım</td><td>Çalışma alanı, Güvenlik, Yönetişim, Yaşam döngüsü</td></tr>
<tr><td><b>Veriyi hazırla ve sun</b></td><td>%40–45</td><td>Veri alma, kopyalama, zamanlama, dönüşüm ve yükleme performansı</td><td>Lakehouse, Data Factory, İşlem hatları, T-SQL ve PySpark ödevleri</td></tr>
<tr><td><b>Anlam modellerini uygula ve yönet</b></td><td>%20–25</td><td>Direct Lake, model ilişkileri, DAX, RLS/OLS ve performans</td><td>Kurumsal model, Fabric’te anlam modeli, DAX optimizasyonu</td></tr>
<tr><td><b>Veriyi keşfet ve analiz et</b></td><td>%20–25</td><td>Profilleme, betimleyici ve tanısal analiz, tahmin ve SQL/XMLA ile sorgulama</td><td>SQL analizi, kapsam haritasındaki keşif dersleri ve ek sorgu pratiği</td></tr>
</table></div>
<h2>Fabric'te Power BI uzmanının bilmesi gerekenler</h2>
<ul>
<li><b>OneLake:</b> Kuruluşun tek veri gölü; tüm Fabric öğeleri verisini burada Delta/Parquet olarak tutar. <b>Kısayollar</b> (shortcuts) veriyi kopyalamadan başka konumlara (ADLS, S3, başka lakehouse) bağlar.</li>
<li><b>Lakehouse:</b> Dosyalar + Delta tablolar; Spark not defterleri ve otomatik SQL analiz uç noktası.</li>
<li><b>Warehouse:</b> Tam T-SQL yazma desteği olan veri ambarı.</li>
<li><b>Eventhouse / KQL veritabanı:</b> Gerçek zamanlı ve zaman serisi verisi; KQL ile sorgulanır.</li>
<li><b>Dataflow Gen2:</b> Power Query'nin bulut sürümü; sonucu lakehouse/warehouse'a yazar.</li>
<li><b>İşlem hattı (pipeline):</b> Veri kopyalama ve düzenleme (orchestration).</li>
</ul>
<h2>Hangi veri deposu?</h2>
<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>Seçim</th></tr>
<tr><td>Yapılandırılmamış + yapılandırılmış veri, Spark ile mühendislik</td><td>Lakehouse</td></tr>
<tr><td>T-SQL ile yazma (INSERT/UPDATE), saklı yordamlar, SQL ekibi</td><td>Warehouse</td></tr>
<tr><td>Akış verisi, telemetri, log, saniyelik analiz</td><td>Eventhouse (KQL)</td></tr>
</table></div>
`,
  ex: [
    { t: 'mc', q: 'Ekip T-SQL ile veriyi güncelleyen saklı yordamlar yazmak istiyor. Hangi Fabric deposu?', o: ['Lakehouse', 'Warehouse', 'Eventhouse', 'Dataflow Gen2'], a: 1, why: 'Warehouse tam T-SQL DML desteği sunar; lakehouse SQL uç noktası salt okunurdur.' },
    { t: 'mc', q: 'Veriyi kopyalamadan bir ADLS Gen2 klasörünü lakehouse içinde göstermek için?', o: ['Kısayol (shortcut)', 'Artımlı yenileme', 'Dağıtım işlem hattı', 'XMLA'], a: 0, why: 'OneLake kısayolları veriyi yerinde bırakıp mantıksal olarak bağlar.' },
    { t: 'mc', q: 'DP-600\'de “windowing functions” ifadesi hangi DAX fonksiyonlarını kasteder?', o: ['WINDOW, OFFSET, INDEX', 'TOTALYTD, DATEADD', 'SUMX, AVERAGEX', 'PATH, PATHITEM'], a: 0, why: 'Pencere fonksiyonları WINDOW, OFFSET, INDEX (ve RANK, ROWNUMBER) ailesidir.' }
  ]
},

{
  id: 'final-hazirlik', lv: 'C2', mod: 'Bitirme', min: 10,
  title: 'Bitirme projesine hazırlık',
  sum: 'Bitirme projesi\'nin aşamaları, değerlendirme ölçütleri ve profesyonel bir rapor teslim kontrol listesi.',
  body: `
<h2>Ne yapacaksın?</h2>
<p><button class="lnk" data-go="final">Bitirme projesi</button>, Anadolu Market yönetimi için ham veriden yayımlanmış bir Power BI uygulamasına kadar uçtan uca bir çözüm kurmanı ister. Her aşama Power BI'ın belirli menülerini kullanır; sonunda Desktop'ın tüm şerit sekmelerini, Power Query menülerini, tüm bölmeleri ve Service'in yönetim özelliklerini kullanmış olursun. Proje sayfasında bir “menü kapsama” tablosu var: hangi aşamada hangi menü kullanılıyor.</p>
<h2>Değerlendirme ölçütleri</h2>
<div class="tbl-wrap"><table>
<tr><th>Ölçüt</th><th>Ağırlık</th><th>Profesyonel düzey</th></tr>
<tr><td>Veri hazırlama</td><td>%15</td><td>Temiz türler, ara sorgular yüklenmiyor, adımlar adlandırılmış, katlama korunmuş</td></tr>
<tr><td>Model</td><td>%20</td><td>Yıldız şema, tek yönlü ilişkiler, işaretli tarih tablosu, gizlenmiş anahtarlar, görüntü klasörleri</td></tr>
<tr><td>DAX</td><td>%25</td><td>Temel ölçüler üzerine kurulu ölçüler, VAR, doğru toplam satırları, biçim dizeleri, açıklamalar</td></tr>
<tr><td>Görsel tasarım</td><td>%20</td><td>Z deseni, tutarlı renkler, doğru görsel türleri, okunur başlıklar, erişilebilirlik</td></tr>
<tr><td>Etkileşim ve hikâye</td><td>%10</td><td>Gezinme, yer işareti, detay sayfası, araç ipucu sayfası, eşitlenmiş dilimleyiciler</td></tr>
<tr><td>Yönetim</td><td>%10</td><td>RLS test edilmiş, uygulama yayımlanmış, yenileme zamanlanmış, etiket ve onay</td></tr>
</table></div>
<h2>Teslim kontrol listesi</h2>
<ol>
<li>Her sayfa 5 saniyede ana mesajını veriyor.</li>
<li>Her KPI bir karşılaştırmayla (hedef, geçen yıl) geliyor.</li>
<li>Her görselin başlığı bir soruyu cevaplıyor; birimler açık.</li>
<li>Toplam satırları doğru (oranlar toplanmıyor, yeniden hesaplanıyor).</li>
<li>Kırmızı yalnızca kötüyü gösteriyor ve yanında simge var.</li>
<li>Performans Analizi'nde hiçbir görsel 1 saniyeyi geçmiyor.</li>
<li>RLS, “Farklı görüntüle” ile en az iki kullanıcıyla test edildi.</li>
<li>Mobil düzen hazırlandı; alternatif metinler girildi.</li>
<li>Kullanılmayan sütunlar kaldırıldı, otomatik tarih/saat kapalı.</li>
<li>Ölçüler görüntü klasörlerinde, açıklamaları dolu.</li>
</ol>
`,
  ex: [
    { t: 'mc', q: 'Bir KPI kartında yalnızca “Net Satış 747 B ₺” yazıyor. Değerlendirmede neden puan kaybeder?', o: ['Sayı çok büyük', 'Karşılaştırma (hedef, geçen yıl) olmadan sayı yorumlanamaz', 'Kart görseli yasak', 'Biçim yanlış'], a: 1, why: 'Bir KPI ancak bir referansla anlam kazanır.' }
  ]
}

);
