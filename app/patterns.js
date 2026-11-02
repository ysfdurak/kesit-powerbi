/* Kesit Power BI — Measure Lab: seviyeye göre uzayan DAX kalıpları.
   Her kalıp kütüphaneye de eklenir; raporlar bu ölçüleri kullanır. */
(function (root) {
const P = [
/* ======================= B1 ======================= */
{ id: 'yoy-var', lv: 'B1', name: 'YoY % (VAR)', fmt: 'yuzde', group: 'Zaman', axis: 'Kategoriler[Kategori]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'bar',
  title: 'Değişkenlerle yıllık büyüme',
  problem: 'Her kategori için bu yılın geçen yıla göre büyümesini hesapla. Geçen yıl satışı olmayan kategoride hata değil boş görünsün.',
  expr: `VAR BuYil = [Net Satış]
VAR GecenYil =
    CALCULATE(
        [Net Satış],
        SAMEPERIODLASTYEAR(Tarih[Tarih])
    )
VAR Fark = BuYil - GecenYil
RETURN
    IF(
        NOT ISBLANK(GecenYil),
        DIVIDE(Fark, GecenYil)
    )`,
  steps: [
    ['BuYil', 'Geçerli filtre bağlamında (ör. Kitap · 2024) net satış. Değişken bir kez hesaplanır ve sabit kalır.'],
    ['GecenYil', 'Aynı bağlamın tarihleri bir yıl geri kaydırılır. Kategori filtresi korunur, yalnızca tarih değişir.'],
    ['Fark', 'İki değişkenin farkı. Ara adımı adlandırmak hem okunurluğu hem hata ayıklamayı kolaylaştırır: geçici olarak RETURN Fark yazıp sonucu görebilirsin.'],
    ['RETURN', 'Geçen yıl boşsa (verinin ilk yılı) büyüme anlamsızdır; IF ile boş bırakılır. DIVIDE ayrıca sıfıra bölmeye karşı korur.']
  ],
  pitfall: 'CALCULATE(BuYil, SAMEPERIODLASTYEAR(...)) yazmak işe yaramaz: değişken tanımlandığı yerde hesaplanmıştır, CALCULATE onu yeniden hesaplamaz.',
  uses: ['zaman', 'urun'] },

{ id: 'hedef-metin', lv: 'B1', name: 'Hedef Durumu', fmt: null, group: 'Hedef', axis: 'Kategoriler[Kategori]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'table',
  title: 'Durumu simge ve metinle anlatmak',
  problem: 'Her kategori için hedefe göre durumu “▲ Hedefin üstünde (+%4,2)” gibi okunur bir metin olarak göster. Renk körü kullanıcılar için simge de olsun.',
  expr: `VAR Oran = DIVIDE([Net Satış], [Hedef])
VAR Sapma = Oran - 1
VAR Etiket = FORMAT(Sapma, "+0.0%;-0.0%")
RETURN
    SWITCH(
        TRUE(),
        ISBLANK(Oran), "Hedef yok",
        Oran >= 1.05, "▲ Hedefin çok üstünde (" & Etiket & ")",
        Oran >= 1, "▲ Hedefte (" & Etiket & ")",
        Oran >= 0.95, "■ Hedefe yakın (" & Etiket & ")",
        "▼ Hedefin altında (" & Etiket & ")"
    )`,
  steps: [
    ['Oran', 'Gerçekleşen / hedef. Hedef boşsa DIVIDE boş döner.'],
    ['Sapma', '1\'den farkı: 0,042 = hedefin %4,2 üstü.'],
    ['Etiket', 'FORMAT ile işaretli yüzde metni. Noktalı virgülün solu pozitif, sağı negatif sayılar için biçimdir.'],
    ['SWITCH(TRUE())', 'Koşullar yukarıdan aşağı denenir; ilk doğru olan kazanır. Bu yüzden en dar koşul (≥ 1,05) önce gelir.']
  ],
  pitfall: 'Metin döndüren ölçüler grafikte değer olarak kullanılamaz; tablo, kart ya da araç ipucu için uygundur. Sayısal karşılaştırmayı ayrı bir ölçüde tut.',
  uses: ['hedef'] },

{ id: 'dinamik-baslik', lv: 'B1', name: 'Dinamik Başlık', fmt: null, group: 'Metin', axis: 'Satislar[Kanal]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'card',
  title: 'Seçime göre değişen görsel başlığı',
  problem: 'Görsel başlığı, kullanıcının seçtiği yılı ve kanalları yazsın: “Net satış · 2024 · Web, Mobil”. Hiçbir şey seçilmemişse “Tüm yıllar · Tüm kanallar”.',
  expr: `VAR Yil =
    IF(
        HASONEVALUE(Tarih[Yil]),
        FORMAT(SELECTEDVALUE(Tarih[Yil]), "0"),
        "Tüm yıllar"
    )
VAR Kanallar =
    IF(
        ISFILTERED(Satislar[Kanal]),
        CONCATENATEX(VALUES(Satislar[Kanal]), Satislar[Kanal], ", ", Satislar[Kanal], ASC),
        "Tüm kanallar"
    )
RETURN
    "Net satış · " & Yil & " · " & Kanallar`,
  steps: [
    ['Yil', 'Tek yıl görünüyorsa onu metne çevir, değilse “Tüm yıllar”. FORMAT(…, "0") binlik ayıracı olmadan yazar.'],
    ['Kanallar', 'Kanal sütununa doğrudan bir filtre varsa (dilimleyici), görünen kanalları alfabetik sırayla virgülle birleştir.'],
    ['RETURN', 'Metinler & ile birleştirilir. Görselin Biçim → Genel → Başlık → Metin alanındaki fx düğmesine bu ölçü bağlanır.']
  ],
  pitfall: 'ISFILTERED yerine HASONEVALUE kullansaydın, iki kanal seçildiğinde “Tüm kanallar” yazardı; bu yanlış olurdu.',
  uses: ['ozet', 'final'] },

/* ======================= B2 ======================= */
{ id: 'akilli-etiket', lv: 'B2', name: 'Akıllı Etiket', fmt: null, group: 'Metin', axis: 'Kategoriler[Kategori]', slicers: [], chart: 'table',
  title: 'Büyüklüğe göre biçim değiştiren etiket',
  problem: 'Değer milyonun üstündeyse “1,3 Mn ₺”, binin üstündeyse “339,3 B ₺”, değilse “595 ₺” yaz. Veri etiketlerinde özel etiket olarak kullanılacak.',
  expr: `VAR V = [Net Satış]
VAR Mutlak = ABS(V)
RETURN
    SWITCH(
        TRUE(),
        ISBLANK(V), BLANK(),
        Mutlak >= 1000000, FORMAT(V / 1000000, "#,0.0") & " Mn ₺",
        Mutlak >= 1000, FORMAT(V / 1000, "#,0.0") & " B ₺",
        FORMAT(V, "#,0") & " ₺"
    )`,
  steps: [
    ['V', 'Ölçü bir kez hesaplanır; üç dalda da tekrar kullanılır.'],
    ['Mutlak', 'Negatif değerler (zarar, fark) için de doğru eşik.'],
    ['SWITCH', 'Boşsa boş döner; böylece etiket boş hücrede “0 ₺” yazmaz.']
  ],
  pitfall: 'Power BI\'da aynı işi sayıyı metne çevirmeden yapmanın yolu dinamik biçim dizesidir (Ölçü araçları → Biçim → Dinamik). Metin ölçüsü sıralanamaz ve grafikte değer olamaz.',
  uses: ['ozet'] },

{ id: 'dinamik-topn', lv: 'B2', name: 'İlk N Satışı', fmt: 'para', group: 'Sıralama', axis: 'Tarih[Yil]', slicers: [['TopNSecim', 'N', [5]]], chart: 'column',
  title: 'Parametreyle dinamik İlk N',
  problem: 'Kullanıcı kaydırıcıdan N seçsin (3–15). Ölçü, net satışa göre ilk N ürünün toplamını versin. Parametre seçilmemişse N = 5.',
  expr: `VAR N = SELECTEDVALUE(TopNSecim[N], 5)
VAR IlkN =
    TOPN(
        N,
        ALL(Urunler[Urun]),
        [Net Satış], DESC
    )
RETURN
    CALCULATE([Net Satış], KEEPFILTERS(IlkN))`,
  steps: [
    ['N', 'Ne olur (what-if) parametresinin seçili değeri. Modelleme → Yeni parametre → Sayısal aralık; Power BI tabloyu GENERATESERIES ile oluşturur.'],
    ['IlkN', 'Tüm ürünler (ALL) net satışa göre sıralanır, ilk N tanesi bir tablo olarak tutulur. TOPN eşitlik varsa N\'den fazla satır döndürebilir.'],
    ['RETURN', 'Bu tablo CALCULATE\'e filtre olarak verilir. KEEPFILTERS, görselde zaten bir ürün filtresi varsa onunla kesişim alır.']
  ],
  pitfall: 'ALL yazılmazsa TOPN yalnızca görünen ürünler arasında sıralar; tek bir ürün satırında “ilk 5” her zaman o ürünün kendisi olur.',
  uses: ['urun'] },

{ id: 'secime-sira', lv: 'B2', name: 'Seçime Göre Sıra', fmt: 'adet', group: 'Sıralama', axis: 'Urunler[Urun]', slicers: [['Kategoriler', 'Kategori', ['Elektronik']]], chart: 'table',
  title: 'Filtrelere duyarlı sıralama',
  problem: 'Kategori dilimleyicisinde ne seçildiyse ürünler o kümede sıralansın. Toplam satırında sıra görünmesin.',
  expr: `VAR Satis = [Net Satış]
RETURN
    IF(
        ISINSCOPE(Urunler[Urun]) && NOT ISBLANK(Satis),
        RANKX(
            ALLSELECTED(Urunler[Urun]),
            [Net Satış],
            Satis,
            DESC,
            DENSE
        )
    )`,
  steps: [
    ['Satis', 'Geçerli ürünün net satışı.'],
    ['ISINSCOPE', 'Görselin ürün düzeyindeki satırında mıyız? Toplam satırında FALSE döner; orada sıra anlamsızdır.'],
    ['ALLSELECTED', 'Görselin kendi satır filtresini kaldırır ama dilimleyici seçimini (Elektronik) korur. ALL kullansaydın sıra tüm ürünlere göre olurdu.'],
    ['DENSE', 'Eşitlikten sonra numara atlamaz: 1, 2, 2, 3.']
  ],
  pitfall: 'HASONEVALUE de toplam satırını eler ama bir dilimleyicide tek ürün seçildiğinde kartlarda da sıra görünür; ISINSCOPE görselin hiyerarşisine bakar.',
  uses: ['urun', 'ekip'] },

{ id: 'stok-son', lv: 'B2', name: 'Stok Adedi', fmt: 'adet', group: 'Stok', axis: 'Tarih[YilCeyrek]', slicers: [], chart: 'column',
  title: 'Yarı toplanabilir ölçü: dönem sonu stok',
  problem: 'Stok, aylar boyunca toplanmaz. Çeyrek satırında çeyreğin son ayının stoku, yıl satırında yılın son ayının stoku görünmeli; ürünler arasında ise toplanmalı.',
  expr: `VAR SonTarih =
    CALCULATE(
        MAX(StokGorunum[Tarih])
    )
RETURN
    CALCULATE(
        SUM(StokGorunum[StokAdet]),
        Tarih[Tarih] = SonTarih
    )`,
  steps: [
    ['SonTarih', 'Geçerli dönem içinde stok görüntüsü olan son tarih (ör. çeyrek için 31 Mart). StokGorunum ay sonu tarihleri içerir.'],
    ['RETURN', 'Tarih filtresi tek bir güne daraltılır; o gündeki tüm ürünlerin stoku toplanır. Tarih tablosu işaretli olduğu için bu filtre Yıl/Çeyrek filtrelerinin yerine geçer.']
  ],
  pitfall: 'SUM(StokGorunum[StokAdet]) tek başına bir yılda 12 ayın stokunu toplar ve gerçek stokun 12 katını gösterir. Bakiye, nüfus, abone sayısı gibi tüm “anlık görüntü” ölçüleri böyledir.',
  uses: ['stok'] },

{ id: 'stok-deger', lv: 'B2', name: 'Stok Değeri', fmt: 'para', group: 'Stok', axis: 'Kategoriler[Kategori]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'bar',
  title: 'LASTNONBLANK ile dönem sonu değer',
  problem: 'Stok değerini, seçili dönemde verisi olan son tarihe göre göster. Bu sefer LASTNONBLANK ile.',
  expr: `CALCULATE(
    SUM(StokGorunum[StokDegeri]),
    LASTNONBLANK(
        Tarih[Tarih],
        CALCULATE(COUNTROWS(StokGorunum))
    )
)`,
  steps: [
    ['LASTNONBLANK', 'Tarih değerlerini sondan başa dolaşır ve ikinci ifade boş olmayan ilk tarihi (stok kaydı olan son günü) tek satırlık bir tablo olarak döndürür.'],
    ['CALCULATE', 'Bu tek günü filtre olarak kullanır. İçteki CALCULATE, her tarih için bağlam geçişi yapar.']
  ],
  pitfall: 'LASTDATE(Tarih[Tarih]) dönemin takvimdeki son gününü verir; o gün stok kaydı yoksa sonuç boş olur. LASTNONBLANK veri olan son günü bulur.',
  uses: ['stok'] },

{ id: 'teslim-satis', lv: 'B2', name: 'Yoldaki Sipariş', fmt: 'adet', group: 'Operasyon', axis: 'Tarih[YilAy]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'line',
  title: 'Devam eden olaylar: yoldaki siparişler',
  problem: 'Her ayın son gününde, verilmiş ama henüz teslim edilmemiş kaç sipariş vardı?',
  expr: `VAR Gun = MAX(Tarih[Tarih])
RETURN
    CALCULATE(
        DISTINCTCOUNT(Satislar[SiparisNo]),
        REMOVEFILTERS(Tarih),
        Satislar[Tarih] <= Gun,
        Satislar[TeslimTarihi] > Gun
    )`,
  steps: [
    ['Gun', 'Satırdaki dönemin son günü (ay satırında ayın son günü).'],
    ['REMOVEFILTERS(Tarih)', 'Sipariş, ay içinde değil daha önce verilmiş olabilir; tarih filtresini tamamen kaldırırız.'],
    ['Satislar[Tarih] <= Gun', 'O güne kadar verilmiş siparişler…'],
    ['Satislar[TeslimTarihi] > Gun', '…ve o günden sonra teslim edilenler. İki ayrı filtre birlikte (VE) uygulanır.']
  ],
  pitfall: 'Bu kalıp (events in progress) aktif abonelik, açık destek kaydı, kirada olan ekipman gibi “başlangıç–bitiş” olaylarının hepsine uyar.',
  uses: ['operasyon'] },

/* ======================= C1 ======================= */
{ id: 'geri-donen', lv: 'C1', name: 'Geri Dönen Müşteri', fmt: 'adet', group: 'Müşteri', axis: 'Tarih[YilCeyrek]', slicers: [], chart: 'column',
  title: 'Yeni ve geri dönen müşteri',
  problem: 'Bu dönemde alışveriş yapan müşterilerden kaçı daha önce de alışveriş yapmıştı?',
  expr: `VAR DonemBasi = MIN(Tarih[Tarih])
VAR BuDonem =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        Satislar[Durum] <> "İptal"
    )
VAR Onceki =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        Tarih[Tarih] < DonemBasi,
        Satislar[Durum] <> "İptal"
    )
RETURN
    COUNTROWS(INTERSECT(BuDonem, Onceki))`,
  steps: [
    ['DonemBasi', 'Satırdaki dönemin ilk günü.'],
    ['BuDonem', 'Bu dönemde iptal edilmemiş siparişi olan müşteri numaraları (tek sütunlu tablo).'],
    ['Onceki', 'Dönem başından önceki tüm tarihlerde alışveriş yapanlar. Tarih tablosu işaretli olduğu için Tarih[Tarih] < X filtresi Yıl ve Çeyrek filtrelerinin yerine geçer.'],
    ['INTERSECT', 'İki kümenin kesişimi: hem bu dönem hem daha önce alanlar. Yeni müşteri ise EXCEPT(BuDonem, Onceki) ile bulunur.']
  ],
  pitfall: 'Müşteri tablosundaki “ilk sipariş” sütunuyla da yapılabilir, ama o sütun yenileme anında sabitlenir; bu ölçü filtrelere (ör. kanal) duyarlıdır: “Web\'e geri dönen”.',
  uses: ['musteri', 'kohort'] },

{ id: 'yeni-musteri2', lv: 'C1', name: 'Yeni Müşteri (Küme)', fmt: 'adet', group: 'Müşteri', axis: 'Tarih[YilCeyrek]', slicers: [], chart: 'column',
  title: 'Küme farkıyla yeni müşteri',
  problem: 'Bu dönemde ilk kez alışveriş yapan müşteri sayısı (EXCEPT ile).',
  expr: `VAR DonemBasi = MIN(Tarih[Tarih])
VAR BuDonem =
    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")
VAR Onceki =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        Tarih[Tarih] < DonemBasi,
        Satislar[Durum] <> "İptal"
    )
RETURN
    COUNTROWS(EXCEPT(BuDonem, Onceki))`,
  steps: [
    ['BuDonem / Onceki', 'Bir önceki kalıpla aynı iki küme.'],
    ['EXCEPT', 'Bu dönemde olup öncekinde olmayanlar: ilk kez gelenler. Yeni + Geri dönen = Müşteri Sayısı.']
  ],
  pitfall: 'Küme fonksiyonlarının iki tarafındaki sütun sayısı ve sırası aynı olmalı.',
  uses: ['musteri'] },

{ id: 'kayip', lv: 'C1', name: 'Kayıp Müşteri', fmt: 'adet', group: 'Müşteri', axis: 'Tarih[Yil]', slicers: [], chart: 'column',
  title: 'Kayıp (churn) müşteri',
  problem: 'Önceki 12 ayda alışveriş yapıp bu dönemde hiç alışveriş yapmayan müşteri sayısı.',
  expr: `VAR DonemBasi = MIN(Tarih[Tarih])
VAR OncekiYil =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        DATESINPERIOD(Tarih[Tarih], DonemBasi - 1, -12, MONTH),
        Satislar[Durum] <> "İptal"
    )
VAR BuDonem =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        Satislar[Durum] <> "İptal"
    )
RETURN
    COUNTROWS(EXCEPT(OncekiYil, BuDonem))`,
  steps: [
    ['OncekiYil', 'Dönem başının bir gün öncesinden geriye 12 aylık pencerede alışveriş yapanlar.'],
    ['BuDonem', 'Bu dönemde alışveriş yapanlar.'],
    ['EXCEPT', 'Önceki pencerede olup bu dönemde görünmeyenler: kaybedilen müşteriler.']
  ],
  pitfall: 'Kayıp tanımı işe göre değişir (90 gün, 6 ay, 12 ay). Pencere uzunluğunu bir parametreye bağlamak iyi bir fikirdir.',
  uses: ['kohort', 'musteri'] },

{ id: 'abc', lv: 'C1', name: 'ABC Sınıfı', fmt: null, group: 'Segmentasyon', axis: 'Urunler[Urun]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'table',
  title: 'ABC (Pareto) sınıflandırması',
  problem: 'Ürünleri net satışa göre büyükten küçüğe sırala. Kümülatif payı %70\'e kadar olanlar A, %90\'a kadar B, kalanı C olsun. Hesap seçili filtrelere duyarlı olsun.',
  expr: `VAR UrunSatis = [Net Satış]
VAR Toplam =
    CALCULATE([Net Satış], ALLSELECTED(Urunler))
VAR Siralama =
    ADDCOLUMNS(
        ALLSELECTED(Urunler[Urun]),
        "S", [Net Satış]
    )
VAR Kumulatif =
    SUMX(
        FILTER(Siralama, [S] >= UrunSatis),
        [S]
    )
VAR Pay = DIVIDE(Kumulatif, Toplam)
RETURN
    IF(
        ISINSCOPE(Urunler[Urun]) && NOT ISBLANK(UrunSatis),
        SWITCH(
            TRUE(),
            Pay <= 0.7, "A",
            Pay <= 0.9, "B",
            "C"
        )
    )`,
  steps: [
    ['UrunSatis', 'Geçerli ürünün satışı.'],
    ['Toplam', 'Görünen tüm ürünlerin toplamı (dilimleyici seçimi korunur).'],
    ['Siralama', 'Görünen her ürün için net satışı içeren sanal tablo. ADDCOLUMNS her satırda bağlam geçişi yapar.'],
    ['Kumulatif', 'Satışı bu ürününkinden büyük ya da eşit olan ürünlerin toplamı: sıralı listede bu ürüne kadarki birikimli satış. Pencere fonksiyonu olmadan kümülatif toplamın klasik yolu.'],
    ['Pay', 'Birikimli satışın toplama oranı: Pareto eğrisinin bu üründeki noktası.'],
    ['SWITCH', 'Eşiklere göre sınıf. Eşikleri bir parametre tablosundan almak (A=%70, B=%90) kalıbı yeniden kullanılabilir yapar.']
  ],
  pitfall: 'ABC\'yi hesaplanmış sütun olarak yaparsan sınıflar yenileme anında donar ve dilimleyiciye tepki vermez; ölçü olarak yaparsan dinamiktir ama eksene konamaz. İkisinin de yeri vardır.',
  uses: ['urun'] },

{ id: 'pareto', lv: 'C1', name: 'Kümülatif Pay %', fmt: 'yuzde', group: 'Segmentasyon', axis: 'Urunler[Urun]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'pareto',
  title: 'Pareto eğrisi için birikimli pay',
  problem: 'Ürünler satışa göre sıralandığında her ürüne kadar birikimli payı hesapla; sütun + çizgi (Pareto) grafiğinde çizgi olarak kullanılacak.',
  expr: `VAR UrunSatis = [Net Satış]
VAR Toplam = CALCULATE([Net Satış], ALLSELECTED(Urunler[Urun]))
VAR Kumulatif =
    SUMX(
        FILTER(
            ADDCOLUMNS(ALLSELECTED(Urunler[Urun]), "S", [Net Satış]),
            [S] >= UrunSatis
        ),
        [S]
    )
RETURN
    IF(NOT ISBLANK(UrunSatis), DIVIDE(Kumulatif, Toplam))`,
  steps: [
    ['Toplam', 'Seçili ürünlerin toplamı.'],
    ['Kumulatif', 'ABC kalıbındaki gibi: bu ürüne kadar sıralı birikimli satış.'],
    ['RETURN', 'Satışı olmayan ürünlerde boş; böylece grafikte kuyruk görünmez.']
  ],
  pitfall: 'Grafikte X ekseni Net Satış\'a göre azalan sıralanmalı; aksi hâlde çizgi monoton artmaz.',
  uses: ['urun'] },

{ id: 'segment', lv: 'C1', name: 'Dilimdeki Müşteri', fmt: 'adet', group: 'Segmentasyon', axis: 'MusteriDilimleri[Dilim]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'column',
  title: 'Dinamik segmentasyon',
  problem: 'Müşterileri seçili dönemdeki net satışlarına göre Küçük / Orta / Büyük / VIP dilimlerine ayır. Dilim sınırları bir tablodan gelsin; yıl değişince müşteriler dilim değiştirebilsin.',
  expr: `VAR MusteriSatis =
    ADDCOLUMNS(
        VALUES(Musteriler[MusteriNo]),
        "S", [Net Satış]
    )
RETURN
    SUMX(
        MusteriDilimleri,
        COUNTROWS(
            FILTER(
                MusteriSatis,
                [S] > MusteriDilimleri[Min]
                    && [S] <= MusteriDilimleri[Max]
            )
        )
    )`,
  steps: [
    ['MusteriSatis', 'Her müşteri ve seçili dönemdeki net satışı. Müşteri tablosunun adını değişkene vermiyoruz; değişken adları tablo adlarıyla çakışmamalı.'],
    ['SUMX(MusteriDilimleri…)', 'Görünen dilimler üzerinde dolaşır (eksende “Orta” satırındaysak yalnızca Orta). MusteriDilimleri modele bağlı değildir (bağlantısız tablo).'],
    ['FILTER', 'Satışı dilimin alt ve üst sınırı arasında olan müşteriler sayılır. Toplam satırında tüm dilimler toplanır.']
  ],
  pitfall: 'Dilim sınırları çakışmamalı (> Min ve <= Max); yoksa bir müşteri iki dilimde sayılır ve toplam müşteri sayısını aşar.',
  uses: ['musteri', 'rfm'] },

{ id: 'segment-satis', lv: 'C1', name: 'Dilim Satışı', fmt: 'para', group: 'Segmentasyon', axis: 'MusteriDilimleri[Dilim]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'bar',
  title: 'Dilimin getirdiği satış',
  problem: 'Her dilimdeki müşterilerin toplam net satışı.',
  expr: `VAR MusteriSatis =
    ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "S", [Net Satış])
RETURN
    SUMX(
        MusteriDilimleri,
        SUMX(
            FILTER(
                MusteriSatis,
                [S] > MusteriDilimleri[Min] && [S] <= MusteriDilimleri[Max]
            ),
            [S]
        )
    )`,
  steps: [['Aynı kalıp', 'Saymak yerine dilimdeki müşterilerin [S] değerleri toplanır.']],
  pitfall: 'Az sayıda VIP müşterinin satışın büyük kısmını getirmesi tipik bir Pareto bulgusudur; bu ölçüyü Dilimdeki Müşteri ile yan yana göster.',
  uses: ['musteri'] },

{ id: 'rfm', lv: 'C1', name: 'RFM Skoru', fmt: null, group: 'Segmentasyon', axis: 'Musteriler[Musteri]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'table',
  title: 'RFM skoru: yenilik, sıklık, parasal değer',
  problem: 'Her müşteri için seçili dönemin sonuna göre: R = son alımdan bu yana gün, F = son 12 aydaki sipariş, M = son 12 aydaki net satış. Her biri 1–5 puan; skor “RFM” üç haneli sayı.',
  expr: `VAR Bugun = MAX(Tarih[Tarih])
VAR SonAlim =
    CALCULATE(
        MAX(Satislar[Tarih]),
        Tarih[Tarih] <= Bugun,
        Satislar[Durum] <> "İptal"
    )
VAR Son12Ay = DATESINPERIOD(Tarih[Tarih], Bugun, -12, MONTH)
VAR R = DATEDIFF(SonAlim, Bugun, DAY)
VAR F = CALCULATE([Sipariş Sayısı], Son12Ay)
VAR M = CALCULATE([Net Satış], Son12Ay)
VAR RPuan = SWITCH(TRUE(), R <= 45, 5, R <= 90, 4, R <= 180, 3, R <= 365, 2, 1)
VAR FPuan = SWITCH(TRUE(), F >= 8, 5, F >= 6, 4, F >= 4, 3, F >= 2, 2, 1)
VAR MPuan = SWITCH(TRUE(), M >= 12000, 5, M >= 7000, 4, M >= 3500, 3, M >= 1500, 2, 1)
RETURN
    IF(
        HASONEVALUE(Musteriler[MusteriNo]) && NOT ISBLANK(SonAlim),
        RPuan * 100 + FPuan * 10 + MPuan
    )`,
  steps: [
    ['Bugun', 'Analiz tarihi: seçili dönemin son günü. Yıl dilimleyicisinde 2023 seçilirse RFM 31.12.2023\'e göre hesaplanır.'],
    ['SonAlim', 'Bugüne kadarki son iptal edilmemiş sipariş. Tarih[Tarih] <= Bugun filtresi yıl filtresinin yerine geçer: geçmişin tamamına bakar.'],
    ['Son12Ay', 'Tablo döndüren bir değişken: bugünden geriye 12 ay. İki CALCULATE\'te filtre olarak yeniden kullanılır.'],
    ['R, F, M', 'Ham değerler: gün, sipariş adedi, TL.'],
    ['Puanlar', 'Eşiklerle 1–5 puan. R\'de küçük değer iyidir, F ve M\'de büyük değer. Gerçek projede eşikler veri dağılımına (yüzdebirliklere) göre seçilir.'],
    ['RETURN', '543 gibi bir skor: R=5, F=4, M=3. Yalnızca tek müşteri bağlamında ve müşterinin bir alımı varsa.']
  ],
  pitfall: 'Puanları sabit eşikler yerine PERCENTILEX.INC ile dağılımdan hesaplamak daha sağlamdır, ama her müşteri için tüm müşterileri dolaşacağı için daha yavaştır.',
  uses: ['rfm'] },

{ id: 'rfm-segment', lv: 'C1', name: 'RFM Segmenti', fmt: null, group: 'Segmentasyon', axis: 'Musteriler[Musteri]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'table',
  title: 'Skordan segmente',
  problem: 'RFM skorunu iş dilinde bir segmente çevir: Şampiyon, Sadık, Potansiyel sadık, Yeni, Dikkat gerektiren, Risk altında, Kaybedilmiş.',
  expr: `VAR Skor = [RFM Skoru]
VAR R = INT(Skor / 100)
VAR F = INT(MOD(Skor, 100) / 10)
VAR M = MOD(Skor, 10)
RETURN
    SWITCH(
        TRUE(),
        ISBLANK(Skor), BLANK(),
        R >= 4 && F >= 4, "Şampiyon",
        F >= 4, "Sadık",
        R >= 4 && F <= 1, "Yeni",
        R >= 3 && F >= 2, "Potansiyel sadık",
        R <= 2 && F >= 3, "Risk altında",
        R <= 1, "Kaybedilmiş",
        "Dikkat gerektiren"
    )`,
  steps: [
    ['Skor', 'Önceki ölçü yeniden kullanılır; tanım tek yerde kalır.'],
    ['R, F, M', 'Üç haneli sayıdan haneleri geri çıkar: INT ve MOD.'],
    ['SWITCH', 'Kurallar sırayla denenir; sıralama iş kuralının parçasıdır (önce Şampiyon kontrol edilir).']
  ],
  pitfall: 'Segment adlarını ölçüde sabit yazmak yerine RFMSegmentleri tablosundaki sırayla eşleştirmek, rapordaki renk ve sıralamayı tutarlı tutar.',
  uses: ['rfm'] },

{ id: 'rfm-sayi', lv: 'C1', name: 'Segmentteki Müşteri', fmt: 'adet', group: 'Segmentasyon', axis: 'RFMSegmentleri[Segment]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'bar',
  title: 'Bağlantısız tabloyla segment sayımı',
  problem: 'RFMSegmentleri tablosundaki her segmentte kaç müşteri olduğunu say. Segment bir sütun değil ölçü olduğu için eksene doğrudan konamaz.',
  expr: `VAR Secili = VALUES(RFMSegmentleri[Segment])
RETURN
    COUNTROWS(
        FILTER(
            VALUES(Musteriler[MusteriNo]),
            [RFM Segmenti] IN Secili
        )
    )`,
  steps: [
    ['Secili', 'Eksendeki segment(ler). Toplam satırında tüm segmentler.'],
    ['FILTER', 'Her müşteri için segment ölçüsü hesaplanır (bağlam geçişi) ve seçili segmentlerde olanlar sayılır.']
  ],
  pitfall: 'VALUES(Musteriler[MusteriNo]) burada tüm müşterileri döndürür, çünkü RFMSegmentleri\'ndeki filtre müşteri tablosuna ulaşmaz. Bu istediğimiz şey: segmenti ölçü belirler.',
  uses: ['rfm'] },

{ id: 'kohort', lv: 'C1', name: 'Kohort Tutma %', fmt: 'yuzde', group: 'Müşteri', axis: 'Musteriler[KohortAy]', axis2: 'Satislar[KohortAyFarki]', slicers: [], chart: 'matrix',
  title: 'Kohort tutma matrisi',
  problem: 'Satırlarda müşterinin ilk alışveriş ayı (kohort), sütunlarda o aydan bu yana geçen ay. Hücre: kohorttaki müşterilerin yüzde kaçı o ay yine alışveriş yaptı?',
  expr: `VAR Aktif =
    CALCULATE(
        DISTINCTCOUNT(Satislar[MusteriNo]),
        Satislar[Durum] <> "İptal",
        REMOVEFILTERS(Tarih)
    )
VAR KohortBuyuklugu =
    CALCULATE(
        DISTINCTCOUNT(Satislar[MusteriNo]),
        Satislar[KohortAyFarki] = 0,
        Satislar[Durum] <> "İptal",
        REMOVEFILTERS(Tarih)
    )
RETURN
    DIVIDE(Aktif, KohortBuyuklugu)`,
  steps: [
    ['Aktif', 'Bu kohortta, bu ay farkında alışveriş yapan müşteri. Satır (KohortAy) ve sütun (KohortAyFarki) filtreleri ikisi de geçerli.'],
    ['KohortBuyuklugu', 'Ay farkı filtresi “= 0” ile değiştirilir: kohortun ilk ayındaki müşteri sayısı. Aynı sütuna verilen filtre mevcut filtrenin yerine geçer.'],
    ['REMOVEFILTERS(Tarih)', 'Takvim dilimleyicisi kohort hesabını bozmasın.'],
    ['RETURN', 'Oran. 0. sütun her zaman %100\'dür.']
  ],
  pitfall: 'KohortAy ve KohortAyFarki hesaplanmış sütunlardır (Anadolu Market modeli sayfasında formülleri var). Kohortu ölçüyle hesaplamak mümkündür ama her hücrede tüm müşterilerin ilk tarihini bulmak çok yavaştır; burada ön hesaplama doğru tercihtir.',
  uses: ['kohort'] },

{ id: 'senaryo', lv: 'C1', name: 'Senaryo Satışı', fmt: 'para', group: 'Parametre', axis: 'Kategoriler[Kategori]', slicers: [['Tarih', 'Yil', [2024]], ['FiyatSenaryosu', 'FiyatDegisimi', [0.1]]], chart: 'bar',
  title: 'Ne olur analizi: fiyat esnekliği',
  problem: 'Fiyatlar %X değişirse satış ne olur? Talep esnekliği −1,4 varsayılsın: fiyat %10 artarsa adet %14 düşer.',
  expr: `VAR Degisim = SELECTEDVALUE(FiyatSenaryosu[FiyatDegisimi], 0)
VAR Esneklik = -1.4
VAR AdetCarpani = MAX(0, 1 + Esneklik * Degisim)
VAR FiyatCarpani = 1 + Degisim
RETURN
    CALCULATE(
        SUMX(
            Satislar,
            Satislar[Tutar] * FiyatCarpani * AdetCarpani
        ),
        Satislar[Durum] <> "İptal"
    )`,
  steps: [
    ['Degisim', 'Kullanıcının kaydırıcıdan seçtiği fiyat değişimi (FiyatSenaryosu bir ne olur parametresidir).'],
    ['Esneklik', 'Varsayım. Gerçek projede kategori bazında farklı esneklikler bir tablodan alınabilir.'],
    ['AdetCarpani', 'Adet etkisi; MAX(0, …) negatif satışı engeller.'],
    ['SUMX', 'Her satış satırında yeni tutar = eski tutar × fiyat çarpanı × adet çarpanı.']
  ],
  pitfall: 'What-if sonuçlarını gerçekleşen değerlerle aynı renkte gösterme; senaryo olduğunu başlık ve renkle belli et.',
  uses: ['fiyat'] },

{ id: 'senaryo-kar', lv: 'C1', name: 'Senaryo Kârı', fmt: 'para', group: 'Parametre', axis: 'FiyatSenaryosu[FiyatDegisimi]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'line',
  title: 'Senaryo kârı ve optimum fiyat',
  problem: 'Her fiyat değişimi senaryosu için brüt kârı hesapla; kâr eğrisinin tepe noktası optimum fiyat değişimini gösterir.',
  expr: `VAR Degisim = SELECTEDVALUE(FiyatSenaryosu[FiyatDegisimi], 0)
VAR AdetCarpani = MAX(0, 1 - 1.4 * Degisim)
VAR YeniSatis =
    CALCULATE(
        SUMX(Satislar, Satislar[Tutar] * (1 + Degisim) * AdetCarpani),
        Satislar[Durum] <> "İptal"
    )
VAR YeniMaliyet = [Net Maliyet] * AdetCarpani
RETURN
    YeniSatis - YeniMaliyet`,
  steps: [
    ['AdetCarpani', 'Satılan adet esneklikle değişir; maliyet adetle orantılıdır.'],
    ['YeniSatis', 'Fiyat ve adet etkisiyle satış.'],
    ['YeniMaliyet', 'Birim maliyet değişmez, adet değiştiği için toplam maliyet değişir.'],
    ['RETURN', 'Kâr. Eksende FiyatSenaryosu[FiyatDegisimi] olunca her senaryo ayrı hesaplanır.']
  ],
  pitfall: 'Parametre tablosu eksende kullanıldığında SELECTEDVALUE satırın değerini döndürür; dilimleyicide kullanıldığında seçilen değeri. Aynı ölçü ikisinde de çalışır.',
  uses: ['fiyat'] },

{ id: 'doviz', lv: 'C1', name: 'Satış (Seçili Para)', fmt: null, group: 'Döviz', axis: 'Tarih[Yil]', slicers: [['ParaBirimleri', 'ParaBirimi', ['USD']]], chart: 'column',
  title: 'Aylık kurla para birimi dönüşümü',
  problem: 'Satışı kullanıcının seçtiği para biriminde göster. Her ayın satışı o ayın ortalama kuruyla çevrilsin; yıllık toplam aylık çevrilmiş tutarların toplamı olsun.',
  expr: `VAR Para = SELECTEDVALUE(ParaBirimleri[ParaBirimi], "TRY")
RETURN
    IF(
        Para = "TRY",
        [Net Satış],
        SUMX(
            VALUES(Tarih[YilAy]),
            VAR AyBasi = DATEVALUE(Tarih[YilAy] & "-01")
            VAR Kur =
                LOOKUPVALUE(
                    DovizKurlari[Kur],
                    DovizKurlari[Tarih], AyBasi,
                    DovizKurlari[ParaBirimi], Para
                )
            RETURN DIVIDE([Net Satış], Kur)
        )
    )`,
  steps: [
    ['Para', 'Dilimleyicide seçilen para birimi; seçim yoksa TRY.'],
    ['SUMX(VALUES(Tarih[YilAy]))', 'Görünen her ay için ayrı hesap. Yıl satırında 12 ay dolaşılır.'],
    ['AyBasi', 'Ay etiketinden ayın ilk günü. Değişken SUMX\'in içinde, her ay için yeniden tanımlanır.'],
    ['Kur', 'İlişki olmadan kur tablosundan değer bulma: iki koşullu LOOKUPVALUE.'],
    ['DIVIDE', 'Ayın TL satışı ÷ o ayın kuru. Ölçü çağrısı bağlam geçişiyle yalnızca o ayın satışını verir.']
  ],
  pitfall: 'Yıllık TL toplamını yıllık ortalama kura bölmek, kurun hızlı değiştiği yıllarda ciddi yanlış sonuç verir; dönüşüm işlemin yapıldığı tanecikte (ay) yapılmalıdır.',
  uses: ['fiyat', 'final'] },

{ id: 'stok-gun', lv: 'C1', name: 'Stok Gün Sayısı', fmt: null, group: 'Stok', axis: 'Kategoriler[Kategori]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'bar',
  title: 'Stok devir süresi (DIO)',
  problem: 'Mevcut stok, son dönemdeki günlük satış maliyeti hızıyla kaç gün yeter?',
  expr: `VAR Stok = [Stok Değeri]
VAR Gun =
    DATEDIFF(MIN(Tarih[Tarih]), MAX(Tarih[Tarih]), DAY) + 1
VAR GunlukMaliyet = DIVIDE([Net Maliyet], Gun)
RETURN
    DIVIDE(Stok, GunlukMaliyet)`,
  steps: [
    ['Stok', 'Dönem sonu stok değeri (yarı toplanabilir ölçü).'],
    ['Gun', 'Dönemin gün sayısı.'],
    ['GunlukMaliyet', 'Satılan malın maliyeti / gün.'],
    ['RETURN', 'Stokun kaç günlük satışa yettiği. Yüksek değer fazla stok, düşük değer tükenme riski demektir.']
  ],
  pitfall: 'Yeni ürünlerde ya da satışı olmayan dönemlerde günlük maliyet boştur ve sonuç boş döner; bu doğru davranıştır.',
  uses: ['stok'] },

{ id: 'pencere', lv: 'C1', name: 'Önceki Ay (OFFSET)', fmt: 'para', group: 'Zaman', axis: 'Tarih[YilAy]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'line',
  title: 'Pencere fonksiyonu: OFFSET',
  problem: 'Zaman zekâsı fonksiyonları yerine pencere fonksiyonuyla önceki ayın satışını bul. Bu yöntem tarih olmayan sıralı eksenlerde de (ör. sıralı ürünler) çalışır.',
  expr: `CALCULATE(
    [Net Satış],
    OFFSET(
        -1,
        ALLSELECTED(Tarih[YilAy]),
        ORDERBY(Tarih[YilAy], ASC)
    )
)`,
  steps: [
    ['ALLSELECTED(Tarih[YilAy])', 'İlişki (relation): görseldeki tüm aylar.'],
    ['ORDERBY', 'Satırların hangi sırayla dizileceği.'],
    ['OFFSET(-1, …)', 'Geçerli satırın bir öncesindeki satırı tek satırlık tablo olarak döndürür; CALCULATE bunu filtre olarak kullanır.']
  ],
  pitfall: 'Dilimleyicide 2024 seçiliyse Ocak 2024\'ün “öncesi” yoktur (ilişkide Aralık 2023 yok) ve sonuç boş olur. PREVIOUSMONTH ise Aralık 2023\'ü bulur. Hangisinin doğru olduğu iş sorusuna bağlıdır.',
  uses: ['zaman'] },

{ id: 'mevsim', lv: 'C1', name: 'Mevsim Endeksi', fmt: null, group: 'Zaman', axis: 'Tarih[Ay]', slicers: [], chart: 'column',
  title: 'Mevsimsellik endeksi',
  problem: 'Her takvim ayının ortalama aylık satışı, tüm ayların ortalamasının kaç katı? 1\'in üstü güçlü, altı zayıf ay.',
  expr: `VAR AyNo = SELECTEDVALUE(Tarih[AyNo])
VAR AylikSeri =
    FILTER(
        CALCULATETABLE(
            ADDCOLUMNS(
                SUMMARIZE(Tarih, Tarih[YilAy], Tarih[AyNo]),
                "S", [Net Satış]
            ),
            REMOVEFILTERS(Tarih),
            Tarih[Yil] >= 2023
        ),
        [S] > 0
    )
VAR AyOrt = AVERAGEX(FILTER(AylikSeri, Tarih[AyNo] = AyNo), [S])
VAR GenelOrt = AVERAGEX(AylikSeri, [S])
RETURN
    IF(HASONEVALUE(Tarih[AyNo]), DIVIDE(AyOrt, GenelOrt))`,
  steps: [
    ['AylikSeri', '2023–2024\'teki her ay (yıl-ay) ve satışı; satışsız aylar atılır. ADDCOLUMNS bilerek CALCULATETABLE\'ın İÇİNDE: [S] hesaplanırken satırdaki “Kasım” filtresi kalkmış olmalı.'],
    ['AyOrt', 'Aynı takvim ayının (ör. tüm Kasımlar) ortalaması.'],
    ['GenelOrt', 'Tüm ayların ortalaması.'],
    ['RETURN', 'Oran. Kasım 1,4 ise Kasım ortalamadan %40 güçlüdür.']
  ],
  pitfall: 'Klasik tuzak: ADDCOLUMNS\'ı CALCULATETABLE\'ın dışına yazarsan [S] dışarıdaki ay filtresiyle hesaplanır; diğer aylar boş kalır ve her ay için endeks 1 çıkar. Ayrıca hızlı büyüyen bir işte geç aylar büyüme yüzünden de güçlü görünür. Daha doğrusu önce eğilimi çıkarıp (ör. 12 aylık hareketli ortalamaya bölüp) sonra ortalama almaktır.',
  uses: ['zaman'] },

/* ======================= C2 ======================= */
{ id: 'topn-diger', lv: 'C2', name: 'Satış (Top N + Diğer)', fmt: 'para', group: 'Sıralama', axis: 'UrunlerVeDiger[Urun]', slicers: [['Tarih', 'Yil', [2024]], ['TopNSecim', 'N', [6]]], chart: 'bar',
  title: 'Top N + Diğer',
  problem: 'Grafikte en çok satan N ürün tek tek, kalan ürünler tek bir “Diğer” çubuğunda görünsün. Toplam her zaman genel toplama eşit olsun. N kullanıcı tarafından seçilsin.',
  expr: `VAR N = SELECTEDVALUE(TopNSecim[N], 5)
VAR SeciliUrun = SELECTEDVALUE(UrunlerVeDiger[Urun])
VAR Siralama =
    ADDCOLUMNS(ALL(Urunler[Urun]), "S", [Net Satış])
VAR IlkN = TOPN(N, Siralama, [S], DESC)
VAR IlkNToplam = SUMX(IlkN, [S])
VAR Genel = CALCULATE([Net Satış], REMOVEFILTERS(Urunler))
VAR IlkNde =
    NOT ISEMPTY(FILTER(IlkN, Urunler[Urun] = SeciliUrun))
RETURN
    SWITCH(
        TRUE(),
        NOT HASONEVALUE(UrunlerVeDiger[Urun]), Genel,
        SeciliUrun = "Diğer", Genel - IlkNToplam,
        IlkNde, CALCULATE([Net Satış], Urunler[Urun] = SeciliUrun),
        BLANK()
    )`,
  steps: [
    ['Eksen', 'Eksende Urunler değil UrunlerVeDiger kullanılır: ürün adları + fazladan bir “Diğer” satırı olan bağlantısız tablo (Anadolu Market modelinde formülü var).'],
    ['Siralama / IlkN', 'Tüm ürünler satışa göre sıralanır, ilk N tutulur.'],
    ['IlkNToplam / Genel', 'İlk N\'in toplamı ve tüm ürünlerin toplamı.'],
    ['IlkNde', 'Eksendeki ürün ilk N içinde mi? ISEMPTY, FILTER sonucunun boş olup olmadığını hızlıca söyler.'],
    ['SWITCH', 'Toplam satırında genel toplam; “Diğer” satırında genel − ilk N; ilk N\'deki ürünlerde kendi satışı (bağlantısız tablodan gelen adı Urunler\'e filtre olarak uygulayarak); geri kalanlarda boş, böylece grafikte görünmezler.']
  ],
  pitfall: 'Görselde “Diğer”in en sonda kalması için UrunlerVeDiger[Urun] sütunu Sira sütununa göre sıralanmalı ve görsel ölçüye göre değil eksene göre sıralanmalı; ya da sıralama için ayrı bir ölçü yazılmalı.',
  uses: ['urun', 'final'] },

{ id: 'sepet', lv: 'C2', name: 'Birlikte Alma Oranı %', fmt: 'yuzde', group: 'Sepet', axis: 'KarsiUrunler[KarsiKategori]', slicers: [['Kategoriler', 'Kategori', ['Elektronik']]], chart: 'bar',
  title: 'Sepet analizi: birlikte alınanlar',
  problem: 'Dilimleyicide seçilen ürünleri (A) satın alan müşterilerin yüzde kaçı eksendeki ürünleri (B) de satın aldı? B ekseni Urunler\'in bağlantısız bir kopyasıdır.',
  expr: `VAR A_Musteriler =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        Satislar[Durum] <> "İptal"
    )
VAR B_Musteriler =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        REMOVEFILTERS(Urunler),
        REMOVEFILTERS(Kategoriler),
        TREATAS(VALUES(KarsiUrunler[KarsiUrunNo]), Urunler[UrunNo]),
        Satislar[Durum] <> "İptal"
    )
VAR Ikisi = INTERSECT(A_Musteriler, B_Musteriler)
RETURN
    DIVIDE(COUNTROWS(Ikisi), COUNTROWS(A_Musteriler))`,
  steps: [
    ['A_Musteriler', 'Mevcut ürün/kategori filtresiyle (A) alışveriş yapan müşteriler.'],
    ['B_Musteriler', 'A filtresi kaldırılır (REMOVEFILTERS), yerine eksendeki B ürünleri konur. TREATAS, bağlantısız tablodaki ürün numaralarını Urunler[UrunNo] sütununa aitmiş gibi uygular: sanal ilişki.'],
    ['Ikisi', 'Hem A hem B alan müşteriler.'],
    ['RETURN', 'A alanların içinde B alanların oranı (destek değil güven, “confidence”). Lift için bunu B\'nin genel alınma oranına bölmek gerekir.']
  ],
  pitfall: 'Bu hesap müşteri düzeyinde: aynı müşteri A\'yı ve B\'yi farklı zamanlarda almış olabilir. Aynı sepet (sipariş) analizi için MusteriNo yerine SiparisNo kullan.',
  uses: ['urun'] },

{ id: 'lfl', lv: 'C2', name: 'LFL Büyüme %', fmt: 'yuzde', group: 'Zaman', axis: 'Kategoriler[Kategori]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'bar',
  title: 'Benzer koşullarda karşılaştırma (like-for-like)',
  problem: 'Büyümeyi yalnızca her iki yılda da satılan ürünler üzerinden hesapla; yeni eklenen ya da satıştan kalkan ürünler büyümeyi çarpıtmasın.',
  expr: `VAR BuYilUrunler =
    CALCULATETABLE(
        VALUES(Satislar[UrunNo]),
        Satislar[Durum] <> "İptal"
    )
VAR GecenYilUrunler =
    CALCULATETABLE(
        VALUES(Satislar[UrunNo]),
        SAMEPERIODLASTYEAR(Tarih[Tarih]),
        Satislar[Durum] <> "İptal"
    )
VAR Ortak = INTERSECT(BuYilUrunler, GecenYilUrunler)
VAR LFLBuYil = CALCULATE([Net Satış], Ortak)
VAR LFLGecenYil =
    CALCULATE([Net Satış], Ortak, SAMEPERIODLASTYEAR(Tarih[Tarih]))
RETURN
    DIVIDE(LFLBuYil - LFLGecenYil, LFLGecenYil)`,
  steps: [
    ['BuYilUrunler / GecenYilUrunler', 'İki dönemde satılan ürün kümeleri.'],
    ['Ortak', 'Her iki dönemde de satılanlar.'],
    ['LFLBuYil / LFLGecenYil', 'Her iki dönemin satışı yalnızca ortak ürünlerle hesaplanır. Tablo değişkeni filtre olarak kullanılır; soy bağı (lineage) Satislar[UrunNo]\'yu gösterdiği için doğru sütunu süzer.'],
    ['RETURN', 'Organik büyüme oranı.']
  ],
  pitfall: 'Perakendede LFL genellikle mağaza düzeyinde yapılır (her iki yılda açık olan mağazalar). Mantık aynıdır; yalnızca küme ürün yerine mağazadır.',
  uses: ['urun', 'zaman'] },

{ id: 'svg', lv: 'C2', name: 'Trend Mini Grafik', fmt: 'svg', group: 'Görsel', axis: 'Kategoriler[Kategori]', slicers: [], chart: 'table',
  title: 'SVG ölçüsüyle tabloda mini grafik',
  problem: 'Tablonun her satırında o kategorinin 2024 aylık satış eğilimini küçük bir çizgi olarak göster. Ölçü bir SVG resmi döndürsün; sütunun veri kategorisi “Görüntü URL\'si” yapılsın.',
  expr: `VAR Seri =
    CALCULATETABLE(
        ADDCOLUMNS(VALUES(Tarih[AyNo]), "S", [Net Satış] + 0),
        REMOVEFILTERS(Tarih),
        Tarih[Yil] = 2024
    )
VAR EnAz = MINX(Seri, [S])
VAR EnCok = MAXX(Seri, [S])
VAR Noktalar =
    CONCATENATEX(
        Seri,
        FORMAT((Tarih[AyNo] - 1) * 10, "0") & ","
            & FORMAT(28 - DIVIDE([S] - EnAz, EnCok - EnAz, 0) * 24, "0"),
        " ",
        Tarih[AyNo], ASC
    )
VAR SonY = 28 - DIVIDE(MAXX(FILTER(Seri, Tarih[AyNo] = 12), [S]) - EnAz, EnCok - EnAz, 0) * 24
RETURN
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-2 0 114 32'>"
        & "<polyline fill='none' stroke='%232a78d6' stroke-width='2' points='" & Noktalar & "'/>"
        & "<circle cx='110' cy='" & FORMAT(SonY, "0") & "' r='2.5' fill='%232a78d6'/></svg>"`,
  steps: [
    ['Seri', '2024\'ün 12 ayı ve her ayın satışı (satırın kategori filtresi korunur); “+ 0”, satış olmayan ayı boş değil 0 yapar. ADDCOLUMNS, CALCULATETABLE’ın içinde: [Net Satış] her ay satırında bağlam geçişiyle o ayı görür. ADDCOLUMNS dışarıda olup içeride CALCULATE(..., REMOVEFILTERS(Tarih)) yazılsaydı ay filtresi silinir ve 12 ayın hepsi aynı değeri alırdı.'],
    ['EnAz / EnCok', 'Y eksenini ölçeklemek için en küçük ve en büyük değer.'],
    ['Noktalar', 'Her ay için “x,y” koordinatı: x = (ay − 1) × 10, y = 4–28 arası ters ölçek (SVG\'de y aşağı doğru artar). Biçim "0" (tam sayı): Türkçe bölgesel ayarda "0.0" ondalık virgül üretir ve SVG koordinatını bozar. CONCATENATEX bunları sıralı ve boşlukla birleştirir.'],
    ['SonY', 'Son noktayı vurgulamak için Aralık\'ın y değeri.'],
    ['RETURN', 'Metin olarak bir SVG belgesi. # işareti URL içinde %23 olarak yazılır. Power BI\'da ölçü seçiliyken Ölçü araçları → Veri kategorisi → Görüntü URL\'si.']
  ],
  pitfall: 'SVG ölçüleri tablo, matris ve kartlarda çalışır; grafik görsellerinde çalışmaz. Çok satırlı tablolarda her satır için ayrı hesaplandığından performansı izle.',
  uses: ['urun', 'final'] },

{ id: 'egilim', lv: 'C2', name: 'Eğilim Çizgisi', fmt: 'para', group: 'İstatistik', axis: 'Tarih[YilAy]', slicers: [['Tarih', 'Yil', [2023, 2024]]], chart: 'trend',
  title: 'En küçük kareler ile eğilim çizgisi',
  problem: 'Seçili aylardaki net satışa doğrusal bir eğilim çizgisi uydur (y = a + b·x) ve her ay için eğilim değerini döndür. Analiz bölmesindeki eğilim çizgisinin arkasındaki matematik.',
  expr: `VAR Seri =
    ADDCOLUMNS(
        ALLSELECTED(Tarih[YilAy]),
        "X", RANKX(ALLSELECTED(Tarih[YilAy]), Tarih[YilAy], , ASC),
        "Y", [Net Satış]
    )
VAR Gecerli = FILTER(Seri, NOT ISBLANK([Y]))
VAR N = COUNTROWS(Gecerli)
VAR SX = SUMX(Gecerli, [X])
VAR SY = SUMX(Gecerli, [Y])
VAR SXY = SUMX(Gecerli, [X] * [Y])
VAR SXX = SUMX(Gecerli, [X] * [X])
VAR Egim = DIVIDE(N * SXY - SX * SY, N * SXX - SX * SX)
VAR Kesisim = DIVIDE(SY - Egim * SX, N)
VAR BuX =
    RANKX(ALLSELECTED(Tarih[YilAy]), Tarih[YilAy], MAX(Tarih[YilAy]), ASC)
RETURN
    IF(HASONEVALUE(Tarih[YilAy]), Kesisim + Egim * BuX)`,
  steps: [
    ['Seri', 'Görseldeki her ay için sıra numarası (X = 1, 2, 3…) ve satış (Y). RANKX metin sütununu artan sırada numaralar.'],
    ['Gecerli', 'Satışı olmayan aylar hesaba katılmaz.'],
    ['N, SX, SY, SXY, SXX', 'En küçük kareler formülünün beş toplamı.'],
    ['Egim', 'b = (N·Σxy − Σx·Σy) / (N·Σx² − (Σx)²): her ay satışın ortalama ne kadar arttığı.'],
    ['Kesisim', 'a = (Σy − b·Σx) / N.'],
    ['BuX', 'Satırdaki ayın sıra numarası.'],
    ['RETURN', 'Bu ay için eğilim değeri. Eğim ölçüsünü ayrıca bir kartta göstermek (“ayda ortalama +4,2 B ₺”) yöneticiler için çok anlamlıdır.']
  ],
  pitfall: 'Doğrusal eğilim, mevsimsel ya da üstel büyüyen seriyi iyi temsil etmez. Bu ölçü bir görselleştirme yardımcısıdır, tahmin modeli değildir.',
  uses: ['zaman'] },

{ id: 'anomali', lv: 'C2', name: 'Z-Skoru', fmt: null, group: 'İstatistik', axis: 'Tarih[YilAy]', slicers: [['Tarih', 'Yil', [2023, 2024]]], chart: 'column',
  title: 'Z-skoru ile aykırı ay tespiti',
  problem: 'Her ayın satışının, seçili ayların ortalamasından kaç standart sapma uzakta olduğunu hesapla. |z| ≥ 2 aykırı kabul edilsin.',
  expr: `VAR Seri =
    FILTER(
        ADDCOLUMNS(ALLSELECTED(Tarih[YilAy]), "S", [Net Satış]),
        NOT ISBLANK([S])
    )
VAR Ortalama = AVERAGEX(Seri, [S])
VAR Sapma = STDEVX.P(Seri, [S])
VAR Deger = [Net Satış]
RETURN
    IF(
        HASONEVALUE(Tarih[YilAy]) && NOT ISBLANK(Deger),
        DIVIDE(Deger - Ortalama, Sapma)
    )`,
  steps: [
    ['Seri', 'Görseldeki ayların satışları.'],
    ['Ortalama / Sapma', 'Ortalama ve popülasyon standart sapması (STDEVX.P).'],
    ['RETURN', 'z = (değer − ortalama) / sapma. Koşullu biçimlendirmede |z| ≥ 2 olan sütunları kırmızıya boyamak için kullan.']
  ],
  pitfall: 'Güçlü eğilimi olan seride geç aylar hep yüksek z alır. Power BI\'ın yerleşik anomali algılaması (Analiz → Anomali bul) mevsimselliği ve eğilimi hesaba katar.',
  uses: ['zaman'] },

{ id: 'ekip', lv: 'C2', name: 'Ekip Satışı', fmt: 'para', group: 'Hiyerarşi', axis: 'Calisanlar[AdSoyad]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'table',
  title: 'Ebeveyn-çocuk: yöneticinin ekip toplamı',
  problem: 'Her çalışan için kendisinin ve hiyerarşide altındaki herkesin (doğrudan ve dolaylı) toplam net satışı. Satış müdürü satırında tüm temsilcilerin toplamı görünsün.',
  expr: `VAR Kisi = SELECTEDVALUE(Calisanlar[CalisanNo])
VAR Ekip =
    FILTER(
        ALL(Calisanlar),
        PATHCONTAINS(Calisanlar[Yol], Kisi)
    )
RETURN
    IF(
        NOT ISBLANK(Kisi),
        CALCULATE([Net Satış], Ekip)
    )`,
  steps: [
    ['Kisi', 'Satırdaki çalışanın numarası.'],
    ['Ekip', 'Yol sütununda bu kişinin numarası geçen herkes: kendisi ve altındaki tüm kademeler. Yol = PATH(CalisanNo, YoneticiNo) hesaplanmış sütunudur, örn. “1|2|9”.'],
    ['RETURN', 'Ekip tablosu filtre olarak uygulanır; Satislar[TemsilciNo] ilişkisi üzerinden ekibin satışları toplanır.']
  ],
  pitfall: 'Matris görselinde hiyerarşi göstermek için PATHITEM ile Seviye1, Seviye2, Seviye3 sütunları üretilir ve bunlar satırlara konur; boş seviyeleri gizlemek ayrı bir ölçü gerektirir.',
  uses: ['ik', 'ekip'] },

{ id: 'secili-gorunum', lv: 'C2', name: 'Görünüm (Dinamik Biçim)', fmt: null, group: 'Parametre', axis: 'Gorunum[Gorunum]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'table',
  title: 'Hesaplama grubu mantığı ve dinamik biçim',
  problem: 'Hesaplama grubu kullanmadan, bir dilimleyiciden Cari / Geçen yıl / YTD / YoY % görünümünü seç. YoY % seçilince sonuç yüzde, diğerlerinde TL biçiminde yazsın.',
  expr: `VAR Secim = SELECTEDVALUE(Gorunum[Gorunum], "Cari")
VAR Deger =
    SWITCH(
        Secim,
        "Cari", [Net Satış],
        "Geçen yıl", [Satış GY],
        "YTD", [Satış YTD],
        "YoY %", [YoY %]
    )
VAR Bicim = IF(Secim = "YoY %", "+0.0%;-0.0%", "#,0 ₺")
RETURN
    IF(NOT ISBLANK(Deger), FORMAT(Deger, Bicim))`,
  steps: [
    ['Secim', 'Bağlantısız Gorunum tablosundaki seçim; eksende kullanılırsa satırın değeri.'],
    ['Deger', 'Seçime göre ilgili ölçü. Bu, hesaplama grubu öncesi “ölçü değiştirici” kalıbıdır.'],
    ['Bicim / RETURN', 'Biçime göre metin. Gerçek modelde FORMAT yerine dinamik biçim dizesi kullanılır; böylece sonuç sayı olarak kalır ve grafiklerde çalışır.']
  ],
  pitfall: 'Hesaplama grubu bu kalıbın kurumsal hâlidir: her ölçüye ayrı ayrı uygulanır, biçim dizesini öğe düzeyinde tanımlar ve SWITCH bakımını ortadan kaldırır.',
  uses: ['final'] },
/* ======================= C2 · uzun kalıplar (30–45 satır) ======================= */
{ id: 'pvm', lv: 'C2', name: 'Satış Köprüsü (PVM)', fmt: null, group: 'Fiyat', axis: 'Kategoriler[Kategori]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'table',
  title: 'Fiyat – hacim – karışım köprüsü',
  problem: 'Bir yıldan diğerine satış farkını beş bileşene ayır: fiyat etkisi (aynı ürünü daha pahalı mı sattık?), hacim etkisi (daha çok mu sattık?), karışım etkisi (pahalı ürünlere mi kaydık?), yeni ürünler ve kaybedilen ürünler. Bileşenlerin toplamı farkı tam vermeli; vermiyorsa ölçü bunu söylemeli.',
  expr: `VAR UrunTablosu =
    ADDCOLUMNS(
        VALUES(Urunler[UrunNo]),
        "S1", [Net Satış],
        "Q1", CALCULATE(SUM(Satislar[Adet]), Satislar[Durum] <> "İptal"),
        "S0", [Satış GY],
        "Q0", CALCULATE(
            SUM(Satislar[Adet]),
            Satislar[Durum] <> "İptal",
            SAMEPERIODLASTYEAR(Tarih[Tarih])
        )
    )
VAR Ortak = FILTER(UrunTablosu, [Q1] > 0 && [Q0] > 0)
VAR Yeni = FILTER(UrunTablosu, [Q1] > 0 && ISBLANK([Q0]))
VAR Kayip = FILTER(UrunTablosu, ISBLANK([Q1]) && [Q0] > 0)
VAR Q1Ortak = SUMX(Ortak, [Q1])
VAR Q0Ortak = SUMX(Ortak, [Q0])
VAR OrtFiyat0 = DIVIDE(SUMX(Ortak, [S0]), Q0Ortak)
VAR FiyatEtkisi =
    SUMX(Ortak, (DIVIDE([S1], [Q1]) - DIVIDE([S0], [Q0])) * [Q1])
VAR HacimEtkisi = (Q1Ortak - Q0Ortak) * OrtFiyat0
VAR KarisimEtkisi =
    SUMX(Ortak, DIVIDE([S0], [Q0]) * [Q1]) - Q1Ortak * OrtFiyat0
VAR YeniEtkisi = SUMX(Yeni, [S1])
VAR KayipEtkisi = -SUMX(Kayip, [S0])
VAR Toplam = FiyatEtkisi + HacimEtkisi + KarisimEtkisi + YeniEtkisi + KayipEtkisi
VAR Kontrol = [Net Satış] - [Satış GY]
VAR Bicim = "+#,##0;-#,##0;0"
RETURN
    IF(
        ISBLANK([Satış GY]),
        "Karşılaştırma yılı yok",
        "Fiyat " & FORMAT(FiyatEtkisi, Bicim)
            & " · Hacim " & FORMAT(HacimEtkisi, Bicim)
            & " · Karışım " & FORMAT(KarisimEtkisi, Bicim)
            & " · Yeni " & FORMAT(COALESCE(YeniEtkisi, 0), Bicim)
            & " · Kayıp " & FORMAT(COALESCE(KayipEtkisi, 0), Bicim)
            & IF(
                ABS(Toplam - Kontrol) > 1,
                "  ⚠ uyumsuz",
                "  = " & FORMAT(Kontrol, Bicim)
            )
    )`,
  steps: [
    ['UrunTablosu', 'Satırın filtre bağlamındaki (ör. Elektronik · 2024) her ürün için bu yıl ve geçen yılın satış (S) ve adedi (Q). ADDCOLUMNS her ürün satırında bağlam geçişi yapar; [Satış GY] zaten SAMEPERIODLASTYEAR içerir, adet için aynısı açıkça yazılır.'],
    ['Ortak', 'İki yılda da satılan ürünler. Fiyat, hacim ve karışım yalnızca bu küme üzerinden anlamlıdır.'],
    ['Yeni', 'Bu yıl satılan, geçen yıl hiç satılmayan ürünler: farkın tamamı “yeni ürün” bileşenidir.'],
    ['Kayip', 'Geçen yıl satılıp bu yıl satılmayan ürünler: geçen yılki satışları eksi olarak yazılır.'],
    ['Q1Ortak', 'Ortak ürünlerin bu yılki toplam adedi.'],
    ['Q0Ortak', 'Ortak ürünlerin geçen yılki toplam adedi.'],
    ['OrtFiyat0', 'Geçen yılın ortak ürün sepetinin ağırlıklı ortalama fiyatı: hacim ve karışım bu “eski fiyat” üzerinden ölçülür.'],
    ['FiyatEtkisi', 'Her ürün için (yeni birim fiyat − eski birim fiyat) × yeni adet. Aynı ürünü daha pahalıya satmanın katkısı.'],
    ['HacimEtkisi', 'Toplam adet değişimi × eski ortalama fiyat: ürün karışımı hiç değişmeseydi daha çok satmanın getirisi.'],
    ['KarisimEtkisi', 'Yeni adetler eski fiyatlarla değerlendirilir ve ortalama fiyatlı bir sepetle karşılaştırılır. Pozitifse müşteri pahalı ürünlere kaymıştır.'],
    ['YeniEtkisi', 'Yeni ürünlerin bu yılki satışı.'],
    ['KayipEtkisi', 'Kaybedilen ürünlerin geçen yılki satışı, eksi işaretle.'],
    ['Toplam', 'Beş bileşenin toplamı. Matematiksel olarak bu yıl − geçen yıl farkına eşit olmalıdır.'],
    ['Kontrol', 'Gerçek fark. Toplam ile karşılaştırmak, ölçüye yerleşik bir test koyar.'],
    ['Bicim', 'Üç bölümlü biçim dizesi: pozitif; negatif; sıfır. İşaret her zaman görünür.'],
    ['RETURN', 'Okunur bir köprü cümlesi. Gerçek raporda her bileşen ayrı ölçü yapılıp şelale grafiğe konur; burada mantığı tek ölçüde görmek için metin döndürülür.']
  ],
  pitfall: 'Fiyat etkisini toplam satış / toplam adet farkıyla hesaplamak karışım etkisini fiyatın içine gömer: müşteri ucuz üründen pahalıya kaydığında “zam yaptık” sanılır. Ürün düzeyinde hesaplamak zorunludur.',
  uses: ['fiyat', 'final'] },

{ id: 'musteri-hareketi', lv: 'C2', name: 'Müşteri Hareketi Özeti', fmt: null, group: 'Müşteri', axis: 'Tarih[YilCeyrek]', slicers: [], chart: 'table',
  title: 'Sadık, yeni, geri kazanılan ve kayıp müşteri dengesi',
  problem: 'Her çeyrek için müşteri tabanının nasıl değiştiğini tek satırda anlat: önceki 6 ayda da alan (sadık), ilk kez alan (yeni), uzun aradan sonra dönen (geri kazanılan), önceki 6 ayda alıp bu dönem almayan (kayıp), net değişim ve tutma oranı.',
  expr: `VAR BasT = MIN(Tarih[Tarih])
VAR OncekiBas = EDATE(BasT, -6)
VAR Simdi =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        Satislar[Durum] <> "İptal"
    )
VAR Onceki =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        Satislar[Durum] <> "İptal",
        DATESBETWEEN(Tarih[Tarih], OncekiBas, BasT - 1)
    )
VAR DahaEski =
    CALCULATETABLE(
        VALUES(Satislar[MusteriNo]),
        Satislar[Durum] <> "İptal",
        DATESBETWEEN(Tarih[Tarih], DATE(2000, 1, 1), OncekiBas - 1)
    )
VAR Sadik = COUNTROWS(INTERSECT(Simdi, Onceki)) + 0
VAR YeniVeDonen = EXCEPT(Simdi, Onceki)
VAR GeriKazanilan = COUNTROWS(INTERSECT(YeniVeDonen, DahaEski)) + 0
VAR Yeni = COUNTROWS(YeniVeDonen) + 0 - GeriKazanilan
VAR Kayip = COUNTROWS(EXCEPT(Onceki, Simdi)) + 0
VAR NetDegisim = Yeni + GeriKazanilan - Kayip
VAR Tutma = DIVIDE(Sadik, COUNTROWS(Onceki))
RETURN
    IF(
        ISEMPTY(Simdi) && ISEMPTY(Onceki),
        BLANK(),
        "Sadık " & Sadik
            & " · Yeni " & Yeni
            & " · Geri kazanılan " & GeriKazanilan
            & " · Kayıp " & Kayip
            & " · Net " & FORMAT(NetDegisim, "+0;-0;0")
            & IF(NOT ISBLANK(Tutma), " · Tutma " & FORMAT(Tutma, "0%"), "")
    )`,
  steps: [
    ['BasT', 'Seçili dönemin ilk günü (ör. 2024 için 1 Ocak 2024).'],
    ['OncekiBas', 'Karşılaştırma penceresinin başı: dönem başından 6 ay önce. Pencere uzunluğu bir iş kararıdır (bu veride müşteriler en fazla ~6,5 ay ara veriyor; 12 aylık pencerede “geri kazanılan” hiç oluşmaz).'],
    ['Simdi', 'Dönemde iptal edilmemiş siparişi olan müşteriler. Satırdaki çeyrek (ve varsa segment, kanal) filtresi uygulanır.'],
    ['Onceki', 'Dönemden hemen önceki 6 ayda alan müşteriler. DATESBETWEEN tarih tablosundaki yıl filtresinin yerini alır (işaretli tarih tablosu).'],
    ['DahaEski', 'Önceki 6 aydan da eskiye uzanan geçmişte alanlar: “geri kazanılan” ile “yeni”yi ayırmak için.'],
    ['Sadik', 'Hem şimdi hem önceki 6 ayda alanlar: INTERSECT kümelerin kesişimi. “+ 0” boş sonucu 0 yapar ki metinde “(Boş)” görünmesin.'],
    ['YeniVeDonen', 'Şimdi alıp önceki 6 ayda almayanlar: EXCEPT küme farkı. Bunlar ya ilk kez alıyor ya da uzun aradan sonra döndü.'],
    ['GeriKazanilan', 'YeniVeDonen içinden daha eski geçmişi olanlar.'],
    ['Yeni', 'Kalanlar: hiç geçmişi olmayan, gerçekten yeni müşteriler.'],
    ['Kayip', 'Önceki 6 ayda alıp bu dönem almayanlar.'],
    ['NetDegisim', 'Kazanılan (yeni + geri kazanılan) − kaybedilen. Sadık + Yeni + Geri kazanılan = bu dönemin aktif müşterisi; Sadık + Kayıp = önceki dönemin aktif müşterisi.'],
    ['Tutma', 'Önceki dönemin müşterilerinin yüzde kaçı kaldı.'],
    ['RETURN', 'ISEMPTY tablo boşsa TRUE döner (COUNTROWS = 0’dan hızlı). Sonuç tek okunur cümle; gerçek raporda her bileşen ayrı ölçü olup yığılmış çubukta gösterilir.']
  ],
  pitfall: 'Kümeleri CALCULATE([Müşteri Sayısı], ...) ile sayıp çıkarmak (yeni = bu dönem − önceki dönem) yanlıştır: iki dönemde de alanlar ile el değiştiren müşteriler birbirini götürür. Kimlik düzeyinde küme işlemleri (INTERSECT/EXCEPT) gerekir.',
  uses: ['musteri', 'final'] },

{ id: 'yonetici-metni', lv: 'C2', name: 'Yönetici Özeti Metni', fmt: null, group: 'Hikâye', axis: 'Tarih[Yil]', slicers: [], chart: 'table',
  title: 'Filtreye göre yazılan yönetici özeti',
  problem: 'Seçime göre kendini yeniden yazan bir özet paragrafı üret: satış ve büyüme, hedef durumu (dört kademe), en büyük, en hızlı büyüyen ve en zayıf kategori, öne çıkan kanal. Akıllı anlatı görselinin yaptığını, kontrolü sende olacak biçimde DAX ile yap.',
  expr: `VAR Satis = [Net Satış]
VAR GY = [Satış GY]
VAR Hedef = [Hedef]
VAR Buyume = DIVIDE(Satis - GY, GY)
VAR Gercek = DIVIDE(Satis, Hedef)
VAR KatTablo =
    ADDCOLUMNS(
        VALUES(Kategoriler[Kategori]),
        "S", [Net Satış],
        "B", [YoY %]
    )
VAR Buyuyenler = FILTER(KatTablo, NOT ISBLANK([B]))
VAR EnBuyuk = TOPN(1, KatTablo, [S], DESC)
VAR EnHizli = TOPN(1, Buyuyenler, [B], DESC)
VAR EnZayif = TOPN(1, Buyuyenler, [B], ASC)
VAR KanalTablo =
    ADDCOLUMNS(VALUES(Satislar[Kanal]), "S", [Net Satış])
VAR EnKanal = MAXX(TOPN(1, KanalTablo, [S], DESC), Satislar[Kanal])
VAR Cumle1 =
    "Net satış " & FORMAT(Satis, "#,##0") & " ₺"
        & IF(
            NOT ISBLANK(Buyume),
            ", geçen yıla göre " & FORMAT(Buyume, "+0%;-0%"),
            ""
        ) & "."
VAR Cumle2 =
    SWITCH(
        TRUE(),
        ISBLANK(Gercek), "",
        Gercek >= 1.05, " Hedef rahat aşıldı (" & FORMAT(Gercek, "0%") & ").",
        Gercek >= 1, " Hedef tutturuldu (" & FORMAT(Gercek, "0%") & ").",
        Gercek >= 0.95, " Hedefe çok yakın (" & FORMAT(Gercek, "0%") & ").",
        " Hedefin gerisinde (" & FORMAT(Gercek, "0%") & ")."
    )
VAR Cumle3 =
    " En büyük kategori " & MAXX(EnBuyuk, Kategoriler[Kategori])
        & IF(
            ISEMPTY(Buyuyenler),
            "",
            ", en hızlı büyüyen " & MAXX(EnHizli, Kategoriler[Kategori])
                & " (" & FORMAT(MAXX(EnHizli, [B]), "+0%;-0%") & ")"
                & ", en zayıf " & MAXX(EnZayif, Kategoriler[Kategori])
        ) & "."
VAR Cumle4 = " Öne çıkan kanal: " & EnKanal & "."
RETURN
    IF(
        ISBLANK(Satis),
        "Seçimde satış yok.",
        Cumle1 & Cumle2 & Cumle3 & Cumle4
    )`,
  steps: [
    ['Satis', 'Temel ölçüler bir kez hesaplanıp değişkenlere alınır; her biri aşağıda birkaç kez kullanılacak.'],
    ['GY', 'Geçen yılın aynı dönemi.'],
    ['Hedef', 'Bütçe. Hedefler tablosu yalnızca Tarih ve Kategoriler ile ilişkilidir: metin yıl, ay ve kategori kırılımlarında anlamlıdır; segment ya da kanal seçildiğinde hedef bölünmez (bu yüzden sonuç burada yıl ekseninde gösteriliyor).'],
    ['Buyume', 'DIVIDE, geçen yıl boşsa (ilk yıl) boş döndürür; cümlede bu durum ayrıca ele alınır.'],
    ['Gercek', 'Hedef gerçekleşme oranı.'],
    ['KatTablo', 'Bellekte kategori × (satış, büyüme) tablosu. ADDCOLUMNS içindeki ölçüler her kategori satırında bağlam geçişiyle hesaplanır; satırın segment filtresi korunur.'],
    ['Buyuyenler', 'Büyümesi hesaplanabilen kategoriler (boşlar sıralamayı bozmasın).'],
    ['EnBuyuk', 'TOPN(1, …) en büyük satışlı satırı tablo olarak döndürür.'],
    ['EnHizli', 'En yüksek büyüme.'],
    ['EnZayif', 'Aynı tablo, artan sırada: en düşük büyüme.'],
    ['KanalTablo', 'Kanal başına satış tablosu.'],
    ['EnKanal', 'Tek satırlık tablodan metni almak için MAXX (ya da CONCATENATEX) kullanılır.'],
    ['Cumle1', 'Satış ve büyüme cümlesi. Biçim dizesi “+0%;-0%” işareti hep gösterir.'],
    ['Cumle2', 'Hedef durumu dört kademede. SWITCH(TRUE(), …) koşulları yukarıdan aşağı dener; ilk doğru olan kazanır, bu yüzden büyükten küçüğe sıralanır.'],
    ['Cumle3', 'Kategori cümlesi: tablolardan değerleri MAXX ile okur. Verinin ilk yılında büyüme hesaplanamaz (Buyuyenler boş); ISEMPTY ile o kısım atlanır.'],
    ['Cumle4', 'Kanal cümlesi.'],
    ['RETURN', 'Satış yoksa açıklayıcı bir mesaj, varsa dört cümlenin birleşimi. Rapora bir kart (ya da metin kutusu + ölçü) olarak eklenir; filtreler değiştikçe metin kendini yeniden yazar.']
  ],
  pitfall: 'Cümleleri tek bir uzun ifade içinde iç içe IF’lerle yazmak hem okunmaz hem yavaştır: aynı ölçüler defalarca hesaplanır. Değişkenler her ölçüyü bir kez hesaplar ve metni parçalara ayırır.',
  uses: ['ozet', 'final'] }

];

root.PBI_PATTERNS = P;
const lib = root.PBI_MEASURES || (root.PBI_MEASURES = []);
P.forEach(p => { if (!lib.some(m => m.name === p.name)) lib.push({ name: p.name, expr: p.expr, group: p.group, fmt: p.fmt === 'svg' ? null : p.fmt, desc: p.title + '. ' + p.problem, lv: p.lv, lib: true, pattern: p.id }); });
})(typeof window !== 'undefined' ? window : globalThis);
