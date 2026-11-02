,
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

{ id: 'musteri-hareketi', lv: 'C2', name: 'Müşteri Hareketi Özeti', fmt: null, group: 'Müşteri', axis: 'Musteriler[Segment]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'table',
  title: 'Sadık, yeni, geri kazanılan ve kayıp müşteri dengesi',
  problem: 'Seçili dönemde her segment için müşteri tabanının nasıl değiştiğini tek satırda anlat: önceki 12 ayda da alan (sadık), ilk kez alan (yeni), uzun aradan sonra dönen (geri kazanılan), önceki 12 ayda alıp bu dönem almayan (kayıp), net değişim ve tutma oranı.',
  expr: `VAR BasT = MIN(Tarih[Tarih])
VAR OncekiBas = EDATE(BasT, -12)
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
    ['OncekiBas', 'Karşılaştırma penceresinin başı: dönem başından 12 ay önce.'],
    ['Simdi', 'Dönemde iptal edilmemiş siparişi olan müşteriler. Segment filtresi satırdan gelir.'],
    ['Onceki', 'Dönemden hemen önceki 12 ayda alan müşteriler. DATESBETWEEN tarih tablosundaki yıl filtresinin yerini alır (işaretli tarih tablosu).'],
    ['DahaEski', 'Önceki 12 aydan da eskiye uzanan geçmişte alanlar: “geri kazanılan” ile “yeni”yi ayırmak için.'],
    ['Sadik', 'Hem şimdi hem önceki 12 ayda alanlar: INTERSECT kümelerin kesişimi. “+ 0” boş sonucu 0 yapar ki metinde “(Boş)” görünmesin.'],
    ['YeniVeDonen', 'Şimdi alıp önceki 12 ayda almayanlar: EXCEPT küme farkı. Bunlar ya ilk kez alıyor ya da uzun aradan sonra döndü.'],
    ['GeriKazanilan', 'YeniVeDonen içinden daha eski geçmişi olanlar.'],
    ['Yeni', 'Kalanlar: hiç geçmişi olmayan, gerçekten yeni müşteriler.'],
    ['Kayip', 'Önceki 12 ayda alıp bu dönem almayanlar.'],
    ['NetDegisim', 'Kazanılan (yeni + geri kazanılan) − kaybedilen. Sadık + Yeni + Geri kazanılan = bu dönemin aktif müşterisi; Sadık + Kayıp = önceki dönemin aktif müşterisi.'],
    ['Tutma', 'Önceki dönemin müşterilerinin yüzde kaçı kaldı.'],
    ['RETURN', 'ISEMPTY tablo boşsa TRUE döner (COUNTROWS = 0’dan hızlı). Sonuç tek okunur cümle; gerçek raporda her bileşen ayrı ölçü olup yığılmış çubukta gösterilir.']
  ],
  pitfall: 'Kümeleri CALCULATE([Müşteri Sayısı], ...) ile sayıp çıkarmak (yeni = bu dönem − önceki dönem) yanlıştır: iki dönemde de alanlar ile el değiştiren müşteriler birbirini götürür. Kimlik düzeyinde küme işlemleri (INTERSECT/EXCEPT) gerekir.',
  uses: ['musteri', 'final'] },

{ id: 'yonetici-metni', lv: 'C2', name: 'Yönetici Özeti Metni', fmt: null, group: 'Hikâye', axis: 'Musteriler[Segment]', slicers: [['Tarih', 'Yil', [2024]]], chart: 'table',
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
        & ", en hızlı büyüyen " & MAXX(EnHizli, Kategoriler[Kategori])
        & " (" & FORMAT(MAXX(EnHizli, [B]), "+0%;-0%") & ")"
        & ", en zayıf " & MAXX(EnZayif, Kategoriler[Kategori]) & "."
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
    ['Hedef', 'Bütçe; hedef tablosu ay ve kategori tanecikli olduğu için ölçü, kategori dışı filtrelerde de doğru toplanır.'],
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
    ['Cumle3', 'Kategori cümlesi: tablolardan değerleri MAXX ile okur.'],
    ['Cumle4', 'Kanal cümlesi.'],
    ['RETURN', 'Satış yoksa açıklayıcı bir mesaj, varsa dört cümlenin birleşimi. Rapora bir kart (ya da metin kutusu + ölçü) olarak eklenir; filtreler değiştikçe metin kendini yeniden yazar.']
  ],
  pitfall: 'Cümleleri tek bir uzun ifade içinde iç içe IF’lerle yazmak hem okunmaz hem yavaştır: aynı ölçüler defalarca hesaplanır. Değişkenler her ölçüyü bir kez hesaplar ve metni parçalara ayırır.',
  uses: ['ozet', 'final'] }
