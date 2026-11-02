/* Kesit Power BI — dört yeni ders: Power BI ve Excel birlikte, Power Platform ile eyleme geçmek, DAX kullanıcı tanımlı fonksiyonları (UDF), finansal tablolar ve yatırım analizi. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* Finans dersindeki DAX alıştırmaları için yıl sonu özet bilanço (varsayımsal) */
const OZET = 'DATATABLE("Yil", INTEGER, "Donen", CURRENCY, "Stok", CURRENCY, "KVY", CURRENCY, "Varlik", CURRENCY, "Ozkaynak", CURRENCY, "NetKar", CURRENCY, {\n        {2022, 155000, 70000, 95000, 355000, 160000, 20000},\n        {2023, 220000, 95000, 125000, 450000, 215000, 55000},\n        {2024, 325000, 140000, 175000, 585000, 290000, 75000}})';
const OZET_START = 'VAR Y = MAX(Tarih[Yil])\nVAR B = FILTER(\n    ' + OZET + ',\n    [Yil] = Y)\nRETURN\n';
const PROJE = 'VAR Proje = DATATABLE("Yil", INTEGER, "A", DOUBLE, "B", DOUBLE, {\n    {0, -200000, -200000}, {1, 110000, 10000}, {2, 90000, 30000},\n    {3, 60000, 70000}, {4, 30000, 130000}, {5, 10000, 160000}})\n';

/* ---------- 1 · Power BI ve Excel (A2) ---------- */
add('hizmet-kullanici', {
  id: 'excel-entegrasyon', lv: 'A2', mod: 'Başlangıç', min: 20,
  title: 'Power BI ve Excel birlikte: Excel’de analiz et, bağlı tablolar, dışa aktarma',
  sum: 'Excel dosyasını kaynak olarak doğru yere koymak, Excel’de Analiz Et ile modele canlı bağlı PivotTable, bağlı tablolar, özetlenmiş ve temel veriyi dışa aktarmanın sınırları, etiketlerin dosyayla gitmesi ve modeli Excel kullanıcısına hazırlamak.',
  body: `
<p>Şirketlerde Power BI çoğu zaman Excel'in yerine değil, yanına gelir. Finans ekibi rakamları yine Excel'de çevirmek ister; satış ekibi listeyi Excel'e alıp telefonla arama yapar. Bu derste iki yönü de göreceğiz: <b>Excel'den Power BI'a</b> (Excel bir veri kaynağı olarak) ve <b>Power BI'dan Excel'e</b> (Excel, yayımlanmış modelin bir istemcisi olarak).</p>

<h2>Excel kaynak olarak: dosya nerede durmalı?</h2>
<p>Desktop'ta <b>Veri al → Excel çalışma kitabı</b> ile bir dosyaya bağlanmak kolaydır. Sorun yayımladıktan sonra başlar. <code>C:\\Raporlar\\satis.xlsx</code> gibi <b>yerel bir yol</b> yalnızca senin bilgisayarında vardır. Power BI Service buluttadır ve bu yola ulaşamaz; zamanlanmış yenileme hata verir.</p>
<ul>
<li><b>Çözüm 1 – dosyayı buluta taşı:</b> Dosyayı iş ya da okul hesabının OneDrive'ına veya bir SharePoint Online sitesine koy. Bulut kaynakları için ağ geçidi gerekmez.</li>
<li><b>Çözüm 2 – ağ geçidi:</b> Dosya şirket ağındaki bir klasörde kalacaksa şirket içi veri ağ geçidi (on-premises data gateway) kurulur. Ağ geçidinin çalıştığı makine açık olmalıdır.</li>
</ul>
<div class="warn"><b>Eşitlenmiş klasör tuzağı</b>OneDrive'ın bilgisayarına eşitlediği klasör (<code>C:\\Users\\...\\OneDrive - Şirket\\...</code>) de yerel bir yoldur. Dosya bulutta olsa bile bağlantı yerel yoldan kurulduysa Service onu bulamaz. Bağlantıyı dosyanın <b>web adresiyle</b> kur: Excel'de Dosya → Bilgi → Yolu kopyala ile https adresini al, Power BI'da Veri al → Web ya da SharePoint klasörü bağlayıcısını kullan.</div>
<p>Excel dosyasını doğrudan Service’e içeri aldıysan Power BI dosyayı OneDrive ya da SharePoint'te <b>yaklaşık saatte bir</b> kontrol eder. Bu dosya eşitlemesi, dış kaynaklardan veri çeken <b>zamanlanmış yenilemeden</b> ayrı bir işlemdir.</p>
<p>Excel tarafında da düzen gerekir. Veriyi <b>Tablo</b> olarak biçimlendir (Ctrl+T) ve tabloya anlamlı bir ad ver. Power BI'da sayfaya değil tabloya bağlan; yeni satırlar tabloya eklendikçe yenilemede gelir. Birleştirilmiş hücre, ara toplam satırı ve aynı sütunda metinle sayının karışması temizlik işini artırır. Sütun adını sonradan değiştirmek Power Query adımlarını kırar. Temizlik için <b>Power Query ile veri temizleme</b> dersine bak.</p>

<h2>Excel'de Analiz Et: PivotTable'ı modele bağlamak</h2>
<p><b>Excel'de Analiz Et</b> (Analyze in Excel), yayımlanmış bir anlam modeline (semantic model) <b>canlı bağlı</b> bir Excel çalışma kitabı üretir. Dosyada verinin kopyası değil, modele giden bağlantı vardır. PivotTable Alanları listesinde modelin tabloları ve ölçüleri görünür.</p>
<ul>
<li><b>Service’ten:</b> Raporu aç → <b>Dışa aktar → Excel'de Analiz Et</b>. Çalışma alanında anlam modelinin <b>…</b> menüsünden de başlatılabilir.</li>
<li><b>Excel'den:</b> Ekle → PivotTable → <b>Power BI'dan</b>, ya da Veri → Veri Al → Power Platform'dan → <b>Power BI'dan</b>. Sağda erişebildiğin anlam modellerini listeleyen bir bölme açılır.</li>
</ul>
<p><b>Gereksinimler:</b> Modelde <b>Derleme (Build) izni</b> ya da çalışma alanında en az <b>Katkıda bulunan</b> rolü, bir Power BI lisansı ve kiracı yöneticisinin canlı bağlantıyla Excel kullanımını açmış olması. Mac kullanıcıları bu dosyaları yalnızca Excel'in web sürümünde inceleyebilir. Kiracı dışındaki konuk kullanıcılar Power BI verisini Excel'de canlı bağlantıyla kullanamaz.</p>
<p><b>Güvenlik:</b> Satır düzeyi güvenlik (RLS) ve nesne düzeyi güvenlik (OLS) Excel'de de geçerlidir; kullanıcı yalnızca raporda görebildiği veriyi görür. <b>Yenile:</b> Excel'de Veri → Tümünü Yenile modele yeni bir sorgu gönderir. Excel'deki rakam, modelin en son yenilendiği an kadar günceldir.</p>
<div class="note"><b>Learn'deki sınırlar</b>Hiyerarşiler PivotTable alan listesinde yalnızca <b>İçeri aktarma</b> (Import) modundaki modellerde korunur; DirectQuery, Direct Lake ve bileşik modellerde görünmez. Alan parametreleri olan modellerde Excel'de Analiz Et beklendiği gibi çalışmayabilir. Canlı bağlantılı bir raporun içine eklenen rapor ölçüleri Excel'e gelmez; Excel modeli görür, raporu değil.</div>

<h2>Bağlı tablolar ve öne çıkan tabloların sonu</h2>
<p>Herkes PivotTable istemez; bazıları düz bir liste ister. Excel masaüstünde aynı bölmede <b>Insert Table</b> seçeneği bir tablo tasarlama penceresi açar: alanları seçer, filtreyi kurarsın ve sonuç Excel sayfasına <b>bağlı tablo</b> (connected table) olarak gelir. Bağlı tablo, normal bir Excel tablosu gibi görünür ama yenilendiğinde modelden yeniden dolar; tabloya verdiğin Excel biçimi yenilemede korunur.</p>
<p>İkinci yol bir görselden başlar: görselin <b>…</b> menüsü → <b>Verileri dışa aktar → Özetlenmiş veriler</b> → dosya biçimi olarak <b>canlı bağlantılı .xlsx</b> (en fazla 500.000 satır). İnen dosyadaki tablo da yenilenebilir. Bu dosyada bir <b>ExportHeaders</b> sayfası, görsele uygulanan filtreleri listeler; rakamın hangi seçimle alındığını sonradan da görürsün.</p>
<div class="warn"><b>Öne çıkan tablolar kaldırıldı</b>Eskiden Desktop'ta bir tabloyu “öne çıkan tablo” (featured table) yapıp Excel'de <b>kuruluş veri türü</b> (organization data type) olarak kullanabiliyordun. Microsoft Learn'e göre bu ayar <b>Haziran 2026</b> Desktop sürümüyle kaldırıldı. Eski çalışma kitaplarında görebilirsin ama yeni çözümü bağlı tablo ya da PivotTable üzerine kur.</div>

<h2>Modeli Excel kullanıcısına hazırlamak</h2>
<p>Excel'in PivotTable'ı modele Power BI görsellerinden farklı bir sorgu diliyle (MDX) bağlanır. Bunun pratik sonuçları var:</p>
<ul>
<li><b>Açık ölçü şart:</b> Power BI'da sayısal bir sütunu görsele sürükleyince örtük (implicit) bir toplam oluşur. Excel PivotTable'ında sütunlar satır, sütun ve filtre alanlarına girer; <b>Değerler</b> alanına modeldeki ölçüler gelir. Kullanıcının toplamak isteyeceği her sayı için bir ölçü yaz.</li>
<li><b>Biçimi ölçünün özelliği olarak ver:</b> Ölçü araçları → Biçim ile para, yüzde, ondalık ayarla. <code>FORMAT()</code> sonucu <b>metindir</b>; metin döndüren ölçü pivotta sayı gibi sıralanmaz, Excel grafiğine giremez, Excel formülünde hesaplanamaz.</li>
<li><b>Oranları modelde hesapla:</b> Excel'in klasik “Hesaplanmış alan” komutu bu tür (OLAP) pivotlarda kullanılamaz. Kullanıcı oranı satırların ortalamasını alarak üretmeye kalkarsa yanılır.</li>
<li><b>Düzen:</b> Teknik sütunları gizle, ölçüleri görüntüleme klasörlerine koy, ay adlarını “Sütuna göre sırala” ile sırala. Excel kullanıcısı alan listesinde neyi görürse onu kullanır.</li>
</ul>
<p>Oran tuzağına bir örnek: Sipariş başına adet.</p>
<pre class="dax">EVALUATE
ROW(
    "Doğru oran", DIVIDE([Satılan Adet], [Sipariş Sayısı]),
    "Kategori satırlarının ortalaması",
        AVERAGEX(VALUES(Kategoriler[Kategori]), DIVIDE([Satılan Adet], [Sipariş Sayısı])))</pre>
<p>Doğru değer <b>2,87</b>; kategori satırlarının ortalaması ise <b>1,61</b>. Bir sipariş birden çok kategoriden ürün içerebildiği için kategori satırları toplamı vermez. Oran bir ölçü olarak modelde dursun ki Excel'deki toplam satırı da doğru hesaplansın.</p>
<pre class="dax">Satır Sayısı (Excel) = COUNTROWS(Satislar)</pre>
<p>Bu basit ölçü bile Excel kullanıcısının işine yarar: Satislar tablosunda 1.620 satır var; pivotta hangi seçimde kaç satır olduğunu görmek, dışa aktarma sınırlarını tahmin etmeyi kolaylaştırır.</p>

<h2>Dışa aktarma: özetlenmiş mi, temel veri mi?</h2>
<p>Görselin <b>…</b> menüsündeki <b>Verileri dışa aktar</b> komutu birkaç seçenek sunar. Hizmet kullanıcısı tarafı için <b>Power BI Service’te rapor kullanmak</b>, ayarlar için <b>Mobil düzen, erişilebilirlik, dışa aktarma ve kişiselleştirme</b> derslerine bak; burada sınırları bir arada görelim:</p>
<div class="tbl-wrap"><table>
<tr><th>Seçenek</th><th>Ne iner?</th><th>Sınır (Learn)</th></tr>
<tr><td>Özetlenmiş veriler (.xlsx)</td><td>Görselin gösterdiği toplama düzeyi</td><td>150.000 satır</td></tr>
<tr><td>Geçerli düzene sahip veriler (matris)</td><td>Matrisin şekli korunur</td><td>150.000 kesişim (satır × değer sütunu)</td></tr>
<tr><td>Temel veriler</td><td>Görselin arkasındaki ayrıntı satırları</td><td>Yazar ya da yönetici izin verdiyse</td></tr>
<tr><td>.csv</td><td>Düz liste, ara toplamsız</td><td>30.000 satır</td></tr>
<tr><td>Canlı bağlantılı .xlsx</td><td>Yenilenebilir tablo</td><td>500.000 satır</td></tr>
</table></div>
<ul>
<li>Filtreler ve dilimleyiciler dışa aktarmaya uygulanır. Gizli alanlar gelmez (temel veri hariç).</li>
<li>Modeldeki biçim dizeleri Excel ve CSV'de korunur; <b>dinamik biçim</b> ve görsele özgü “genel toplamın yüzdesi” gibi gösterimler korunmaz.</li>
<li>Görselde <b>Veri içermeyen öğeleri göster</b> açıksa temel veri dışa aktarımı çalışmaz.</li>
<li>Rapor ayarlarında üç seçenek vardır: yalnızca özetlenmiş, özetlenmiş ve temel, hiç. Yönetici portalındaki ayar rapor ayarıyla çelişirse yönetici kazanır.</li>
</ul>

<h2>Duyarlılık etiketleri dosyayla birlikte gider</h2>
<p>Veri Excel'e indiğinde Power BI'ın dışına çıkar. Bu yüzden koruma ayarlı bir duyarlılık etiketi (ör. “Gizli”) dışa aktarılan Excel, PowerPoint ve PDF dosyasına da uygulanır; dosyayı yalnızca yetkili kişiler açabilir. Bir PivotTable ya da bağlı tablo eklediğinde modelin etiketi çalışma kitabına <b>otomatik</b> geçer. Çalışma kitabında zaten bir etiket varsa <b>daha kısıtlayıcı olan</b> uygulanır. Yönetici, Microsoft Defender for Cloud Apps ile etikete göre kural koyabilir; örneğin yönetilmeyen cihazlara indirmeyi engelleyebilir. Etiketlerin kendisi <b>Yönetişim: erişim, etiketler, onay, abonelik ve uyarılar</b> dersinde.</p>

<h2>Ne zaman Excel, ne zaman başka bir araç?</h2>
<div class="tbl-wrap"><table>
<tr><th>İhtiyaç</th><th>Uygun araç</th></tr>
<tr><td>Kullanıcı kendi pivotunu kurup Excel formülleriyle senaryo yapacak</td><td>Excel'de Analiz Et / bağlı PivotTable</td></tr>
<tr><td>Belli kolonlarla, filtrelenmiş, yenilenebilir düz liste</td><td>Bağlı tablo ya da canlı bağlantılı .xlsx</td></tr>
<tr><td>Her ay aynı biçimde, sayfa sayfa basılacak uzun liste ya da fatura</td><td>Sayfalandırılmış rapor</td></tr>
<tr><td>Etkileşimli keşif, mobilde izleme</td><td>Power BI raporu</td></tr>
<tr><td>Bir kez, birkaç yüz satırlık hızlı kontrol</td><td>Özetlenmiş veriyi dışa aktar</td></tr>
</table></div>
<p>Excel'e “her şeyi indir” isteği çoğu zaman yanlış soruya işarettir. Kullanıcı aslında aynı listeyi her ay istiyorsa <b>Sayfalandırılmış raporlar: ne zaman?</b> dersindeki çözüm, kendi hesabını yapmak istiyorsa canlı bağlı PivotTable daha güvenli ve günceldir.</p>
`,
  ex: [
    { t: 'mc', q: 'Desktop’ta <code>C:\\Raporlar\\hedef.xlsx</code> dosyasına bağlı bir raporu yayımladın. Service’te zamanlanmış yenileme hata veriyor. En olası neden nedir?', o: ['Excel dosyası çok büyük', 'Service yerel yola ulaşamıyor', 'Rapor sayfası sayısı fazla', 'Excel tablosuna ad verilmemiş'], a: 1, why: 'Yerel yol yalnızca senin bilgisayarında vardır. Dosyayı OneDrive iş/okul ya da SharePoint Online’a taşıyıp web adresiyle bağlanmak ya da ağ geçidi kurmak gerekir.' },
    { t: 'mc', q: 'Excel’de Analiz Et ile açtığın PivotTable’da <code>Satislar[Adet]</code> sütununu Değerler alanına koyup toplayamıyorsun. Model tarafında ne yapmalısın?', o: ['Sütunu metin türüne çevirmek', 'Raporu yeniden yayımlamak', 'Adet için açık bir ölçü yazmak', 'Excel’de Hesaplanmış alan eklemek'], a: 2, why: 'Excel PivotTable’ı modele MDX ile bağlanır; Değerler alanına modeldeki ölçüler gelir. Örtük toplam yerine SUM(Satislar[Adet]) gibi açık bir ölçü yaz. Hesaplanmış alan komutu bu tür pivotlarda kullanılamaz.' },
    { t: 'mc', q: 'Satış ekibi 400.000 satırlık, filtrelenmiş ve her gün güncellenebilen bir listeyi Excel’de istiyor. Hangisi uygun?', o: ['.csv olarak dışa aktarmak', 'Canlı bağlantılı .xlsx ya da bağlı tablo', 'Temel verileri .xlsx olarak almak', 'Görseli PowerPoint’e aktarmak'], a: 1, why: '.csv en fazla 30.000, normal .xlsx dışa aktarımı en fazla 150.000 satır alır ve yenilenmez. Canlı bağlantılı .xlsx (500.000 satıra kadar) ya da bağlı tablo Excel’den yenilenebilir.' },
    { t: 'mc', q: 'Bir ekip yeni bir Excel çözümünü “öne çıkan tablolar” ve kuruluş veri türleri üzerine kurmak istiyor. Ne önerirsin?', o: ['Bağlı tablo ya da PivotTable kullanmalarını', 'Featured table ayarını açmalarını', 'Modeli DirectQuery’ye çevirmelerini', 'Dosyayı .csv olarak paylaşmalarını'], a: 0, why: 'Learn’e göre öne çıkan tablo ayarı Haziran 2026 Desktop sürümüyle kaldırıldı. Yeni çözüm, modele canlı bağlı PivotTable ya da bağlı tablo üzerine kurulmalı.' },
    { t: 'mc', q: 'Modelin etiketi “Gizli”, kullanıcının çalışma kitabının etiketi “Genel”. Kullanıcı bu modelden bağlı bir PivotTable eklerse çalışma kitabının etiketi ne olur?', o: ['Genel kalır', 'Etiket tamamen kaldırılır', 'Gizli olur', 'Kullanıcıya hiç sorulmaz, iki etiket birlikte durur'], a: 2, why: 'Bağlı PivotTable ya da tablo eklenince modelin etiketi çalışma kitabına geçer; zaten etiket varsa daha kısıtlayıcı olan uygulanır.' },
    { t: 'mc', q: 'Bir ölçü <code>FORMAT([Net Satış], "#,0 TL")</code> döndürüyor. Excel kullanıcısı bu ölçüyle neden zorlanır?', o: ['Excel TL simgesini tanımaz', 'Sonuç metin olur', 'Ölçü Excel’de gizlenir', 'FORMAT Excel’de çalışmaz'], a: 1, why: 'FORMAT metin döndürür; metin değeri pivotta sayı gibi sıralanmaz, grafiğe giremez, formülde kullanılamaz. Biçimi ölçünün biçim dizesi özelliğiyle ver.' },
    { t: 'dax', name: 'Toplam Adet (Tümü)', q: '<b>Toplam Adet (Tümü)</b>: Excel kullanıcıları <code>Adet</code> sütununu Değerler alanına koyamıyor. İptaller dahil tüm satırların adet toplamını veren açık bir ölçü yaz.', sol: 'SUM(Satislar[Adet])', hint: 'Örtük toplamın açık hâli: SUM(Satislar[Adet]). Hazır [Satılan Adet] iptalleri çıkarır; burada istenen tümü.' },
    { t: 'dax', name: 'Müşteri Başına Adet', q: '<b>Müşteri Başına Adet</b>: İptal edilmemiş satırlarda müşteri başına satılan adet. Excel’de satırların ortalamasıyla değil, modelde oran olarak hesaplansın. Hazır ölçüleri kullan.', sol: 'DIVIDE([Satılan Adet], [Müşteri Sayısı])', hint: 'DIVIDE([Satılan Adet], [Müşteri Sayısı]). İki ölçü de iptalleri zaten çıkarır.' },
    { t: 'dax', name: 'İade Oranı (Tutar)', q: '<b>İade Oranı (Tutar)</b>: İade tutarının net satışa oranı. Sonuç sayı kalsın (FORMAT kullanma); yüzde biçimini ölçünün biçim ayarından vereceksin.', sol: 'DIVIDE([İade Tutarı], [Net Satış])', hint: 'DIVIDE([İade Tutarı], [Net Satış]). Yüzde görünümü için ölçü araçlarında Biçim → Yüzde seç.' }
  ]
});

/* ---------- 2 · Power Platform ile eyleme geçmek (B2) ---------- */
add('python-r', {
  id: 'power-platform', lv: 'B2', mod: 'Analiz', min: 22,
  title: 'Power Platform ile eyleme geçmek: Power Automate, Power Apps ve veri uyarıları',
  sum: 'Rapordaki bir düğmeyle filtrelenmiş veriyi bir akışa göndermek, rapora Power Apps formu gömüp veri yazmak, işlemsel-analitik görev akışları ve Fabric kullanıcı veri işlevleri, pano uyarıları ve Fabric Activator; lisans ve yönetişim uyarıları.',
  body: `
<p>Bir rapor “ne oldu?” sorusunu yanıtlar. Ama kullanıcı çoğu zaman bir sonraki adımı da raporun içinden atmak ister: hedefin altında kalan bölgeleri yöneticisine bildirmek, bir müşterinin durumunu güncellemek, bir yoruma not düşmek. Power BI bunun için Power Platform'un iki aracıyla ve Fabric'in yeni işlevleriyle çalışır.</p>

<h2>Rapordan eyleme: dört yol</h2>
<div class="tbl-wrap"><table>
<tr><th>Araç</th><th>Ne yapar?</th><th>Tipik senaryo</th></tr>
<tr><td>Power Automate görseli</td><td>Düğmeye basınca bir akış çalıştırır; filtrelenmiş veriyi akışa gönderir</td><td>Seçili müşteri listesini Teams kanalına ya da e-postaya göndermek</td></tr>
<tr><td>Power Apps görseli</td><td>Rapora bir tuval uygulaması gömer; uygulama rapordaki veriyi görür</td><td>Bir kaydı düzeltmek, yorum ya da onay girmek (geri yazma)</td></tr>
<tr><td>Veri işlevi düğmesi (işlemsel-analitik görev akışı)</td><td>Fabric'teki bir Python işlevini parametrelerle çağırır</td><td>Durum güncelleme, indirim talebi, harici API çağrısı</td></tr>
<tr><td>Veri uyarıları ve Fabric Activator</td><td>Bir ölçü eşiği geçince bildirim ya da eylem başlatır</td><td>Hedef gerçekleşme %95'in altına düşünce e-posta</td></tr>
</table></div>

<h2>Power Automate görseli: düğmeye basınca akış</h2>
<p>Desktop'ta <b>Ekle → Power Platform → Power Automate</b> ya da Görselleştirmeler bölmesindeki simgeyle eklenir. Görselin <b>Power Automate verileri</b> alanına koyduğun sütunlar ve ölçüler akışa dinamik girdi olur. Görselin <b>…</b> menüsü → Düzenle ile akışı rapordan oluşturursun (sıfırdan ya da şablondan bir anında bulut akışı). Akışı doğrudan Power Automate portalında değil, rapordan oluştur; aksi halde tetikleyici rapordaki alanları görmez.</p>
<ul>
<li><b>Bağlama duyarlı:</b> Akışa giden değerler kullanıcının o anki filtrelerine göre değişir. Bölge dilimleyicisinde “Ege” seçiliyse akış yalnızca Ege satırlarını alır.</li>
<li><b>Sınır:</b> Görsel en fazla <b>1.000 kayıt</b> işler. Yalnızca akışta gerçekten kullanılan alanlar gönderilir.</li>
<li><b>Test:</b> Düzenleme modunda düğmeye <b>Ctrl</b> basılı tıkla. Çalıştırma geçmişini görselin menüsündeki Ayrıntılar'da görürsün.</li>
<li><b>Kim çalıştırabilir?</b> Akışın <b>yalnızca çalıştırma kullanıcıları</b> (run-only users) listesine kişi ya da Microsoft Entra grubu ekle. Raporu görmek akışı çalıştırma yetkisi vermez.</li>
<li><b>Desteklenmeyenler:</b> Web'de yayımla (kimlik doğrulamasız erişim), müşteriler için gömme senaryoları ve dışa aktarma. Veri, akışın dağıtıldığı coğrafyada işlenir; veri yerleşimi kuralı olan kurumlarda bunu sor.</li>
</ul>
<p>Akışa giden veriyi DAX ile hazırlamak çoğu zaman işi kolaylaştırır. Örneğin akışın e-postasına tek satırlık bir özet metni koymak için:</p>
<pre class="dax">Kanal Özeti (Akış) =
CONCATENATEX(
    VALUES(Satislar[Kanal]),
    Satislar[Kanal] &amp; " " &amp; FORMAT([Net Satış], "#,0"),
    " | ",
    [Net Satış], DESC)</pre>
<p>Filtresiz sonuç: <b>Mobil 599.841 | Web 457.331 | Mağaza 193.600</b>. Kullanıcı bir yıl seçerse metin de o yıla göre değişir; akış bu metni olduğu gibi e-postaya yazar.</p>

<h2>Power Apps görseli: rapora form gömmek</h2>
<p>Power Apps görseli rapora bir <b>tuval uygulaması</b> (canvas app) yerleştirir. Uygulama, görselin alanlarına koyduğun veriyi <code>PowerBIIntegration.Data</code> adlı salt okunur bir kaynak olarak görür; kullanıcı rapordan bir müşteri seçince form o müşteriye göre dolar. Kullanıcı formda bir alanı değiştirip kaydettiğinde uygulama değişikliği Dataverse ya da SQL gibi <b>yazılabilir bir kaynağa</b> yazar. Buna <b>geri yazma</b> (write-back) denir.</p>
<ul>
<li>Görsel üzerinden en fazla <b>1.000 kayıt</b> aktarılır.</li>
<li>Raporun yazmadan sonra hemen güncellenmesi için uygulamanın <b>görselin içinden oluşturulmuş</b> olması ve <code>PowerBIIntegration.Refresh()</code> çağırması gerekir. Bu işlev yalnızca <b>DirectQuery</b> ile bağlanmış kaynaklarda çalışır. İçeri aktarma modelinde değişiklik bir sonraki yenilemede görünür.</li>
<li>Görsel rapora geri filtre gönderemez. Uygulamayı rapordan <b>ayrıca paylaşman</b> gerekir. Oluşturma ve düzenleme Edge ve Chrome'da desteklenir; önce raporu yayımlayıp sonra uygulamayı Service’te oluşturmak önerilir.</li>
<li>Gömme yalnızca “kuruluşun için gömme” senaryosunda desteklenir; Power BI Rapor Sunucusu desteklemez.</li>
</ul>

<h2>İşlemsel-analitik görev akışları ve kullanıcı veri işlevleri</h2>
<p><b>Translytical task flows</b> (işlemsel + analitik görev akışları) Power BI raporundan doğrudan kayıt ekleme, düzenleme, silme ya da harici bir API çağırma imkânı verir. Arkada <b>Fabric kullanıcı veri işlevleri</b> (user data functions) çalışır: Fabric'te barındırılan, Python ile yazılmış, sunucusuz işlevler. Bu iki özellik 2025'te önizleme olarak geldi; Microsoft artık ikisini de <b>genel kullanımda</b> (GA) olarak duyuruyor. Yine de alt parçaların durumu değişebilir; kurmadan önce Learn sayfasını kontrol et.</p>
<ol>
<li>Fabric'te bir kullanıcı veri işlevi yaz ve yayımla. Yazma işlemleri için Learn çoğu senaryoda <b>Fabric SQL veritabanını</b> öneriyor; ambar ve lakehouse dosyaları da desteklenir.</li>
<li>Desktop'ta <b>Ekle → Düğme → Veri işlevi</b>. Biçim bölmesinde Eylem altındaki <b>fx</b> ile işlevi OneLake kataloğundan seç.</li>
<li>Her parametreyi bir <b>ölçüye</b> ya da bir <b>dilimleyiciye</b> bağla. Kullanıcının metin yazması için <b>giriş dilimleyicisi</b> (input slicer), seçenek seçmesi için <b>düğme dilimleyicisi</b> (button slicer) kullanılır. Dilimleyiciler parametre listesinde başlıklarıyla görünür; anlamlı başlık ver.</li>
<li>“Başarılı sonuçtan sonra raporu yenile” seçeneğini aç. Direct Lake ya da DirectQuery ile rapor yazılan değeri hemen gösterir.</li>
</ol>
<div class="note"><b>Learn'deki iki kural</b>Rapora bağlanan işlev bir <b>metin (str)</b> döndürmelidir; Power BI bu metni kullanıcıya sonuç mesajı olarak gösterir. Veri işlevi düğmesi belirli bir çalışma alanına, işlev kümesine ve işleve sabit bir başvuru tutar; raporu dağıtım işlem hattıyla başka bir çalışma alanına taşıdığında <b>başvuru otomatik değişmez</b>, hedefte güncellemen gerekir.</div>

<h2>Uyarılar: pano uyarısı ve Fabric Activator</h2>
<p><b>Klasik veri uyarısı</b> Service’teki bir <b>panonun</b> kart, KPI ya da gösterge kutucuğunda kurulur: “Net satış 50.000'in altına düşerse haber ver.” Learn'e göre yalnızca sayısal değerlerle ve yenilenen veriyle çalışır, Desktop'ta yoktur, en fazla 250 uyarı kurabilirsin ve uyarılar kişiseldir. Uyarı bir Power Automate akışını da tetikleyebilir. Pano ve abonelik ayrıntıları <b>Yönetişim</b> dersinde.</p>
<p><b>Rapor görselinde uyarı</b> ise <b>Fabric Activator</b> ile çalışır (eski adı Data Activator). Görselin menüsünden <b>Uyarı ayarla</b> (Set alert) seçilir; izlenecek ölçü, koşul ve eşik belirlenir, bildirim e-postayla ya da Teams'le gelir. Power BI bir <b>Activator öğesi</b> oluşturur ve modeli izlemeye başlar; kural Activator'da genişletilip başka kişilere bildirim ya da Power Automate akışı eklenebilir. Learn bu özelliği <b>genel önizleme</b> olarak işaretliyor ve Fabric kapasitesi olan (sayfaya göre F64 ya da üstü veya Premium) bir çalışma alanında yazma izni istiyor.</p>
<p>Uyarıyı doğrudan bir oran yerine bir <b>bayrak ölçüsüne</b> kurmak, kuralı modelde tutar ve herkes için aynı tanımı sağlar:</p>
<pre class="dax">Hedef Alarmı (Kategori Sayısı) =
COUNTROWS(
    FILTER(VALUES(Kategoriler[Kategori]),
        VAR Oran = [Hedef Gerçekleşme %]
        RETURN NOT ISBLANK(Oran) &amp;&amp; Oran &lt; 0.95))</pre>
<p>Filtresiz durumda yalnızca 1 kategori (Hediye, %68,9) %95'in altında. Kart görselindeki bu sayı 0'dan büyük olduğunda uyarı çalışır.</p>

<h2>Yönetişim ve lisans uyarıları</h2>
<ul>
<li><b>Lisans:</b> Standart bağlayıcılar çoğu Microsoft 365 lisansında gelir. Dataverse ya da SQL gibi premium bağlayıcı kullanan akış ve uygulamalar, onları çalıştıran kullanıcılar için ek Power Platform lisansı gerektirir. Kullanıcı veri işlevleri ve Activator Fabric kapasitesi tüketir. Kesin durumu kurumunun lisans rehberinden doğrula.</li>
<li><b>Sahiplik:</b> Akışın sahibi şirketten ayrılınca akış durabilir. Önemli akışları bir ekip ya da hizmet hesabı sahipliğinde tut, ortak sahip ekle.</li>
<li><b>Veri kaybı önleme (DLP):</b> Power Platform yönetim merkezindeki DLP ilkeleri hangi bağlayıcıların birlikte kullanılabileceğini sınırlar. Raporun verisini kişisel bir e-posta ya da dış bir Service’e gönderen akış bu ilkelere takılabilir; takılması da iyidir.</li>
<li><b>Güvenlik:</b> RLS raporda kullanıcının gördüğünü sınırlar; ama geri yazılan kaynağın yetkileri ayrıdır. Kullanıcının hangi kaydı değiştirebileceğini yazılan kaynakta da kontrol et.</li>
<li><b>Geri yazmayı doğrula:</b> Formdaki her alan bir giriş denetimi ister (boş, negatif, aralık dışı). Kimin neyi ne zaman değiştirdiğini tutan bir denetim sütunu ekle.</li>
<li><b>Ortam:</b> Akış ve uygulamayı kişisel varsayılan ortam yerine ekibin ortamında oluştur; geliştirme ve üretim ortamlarını ayır.</li>
</ul>
`,
  ex: [
    { t: 'mc', q: 'Bölge müdürü, rapordaki filtrelenmiş müşteri listesini bir düğmeyle satış ekibinin Teams kanalına göndermek istiyor. En uygun araç hangisi?', o: ['Power Apps görseli', 'Klasik pano uyarısı', 'Power Automate görseli', 'Sayfalandırılmış rapor aboneliği'], a: 2, why: 'Power Automate görseli, düğmeye basıldığında kullanıcının o anki filtrelerine göre veriyi bir akışa gönderir; akış da Teams’e mesaj yazar.' },
    { t: 'mc', q: 'Power Automate görselinin veri alanına müşteri satırları konmuş; kullanıcı filtresiz durumda 3.000 müşteri görüyor. Düğmeye basınca ne olmasını beklersin?', o: ['Görsel en fazla 1.000 kayıt işler', 'Akış 3.000 kaydın hepsini alır', 'Akış hiç başlamaz', 'Kayıtlar sayfa sayfa gönderilir'], a: 0, why: 'Learn’e göre Power Automate görseli en fazla 1.000 kayıt işler. Kullanıcıyı filtre daraltmaya yönlendir ya da akışı daha özet bir girdiyle tasarla.' },
    { t: 'mc', q: 'Power Apps görseliyle bir kaydı güncelliyorsun; rapordaki tablonun hemen yenilenmesini istiyorsun. Hangi koşul gerekir?', o: ['Rapor İçeri aktarma modunda olmalı', 'Uygulama Power Apps portalında oluşturulmalı', 'Kaynak DirectQuery, Refresh() çağrılmalı', 'Rapor Web’de yayımla ile paylaşılmalı'], a: 2, why: 'PowerBIIntegration.Refresh() yalnızca DirectQuery ile bağlı kaynaklarda çalışır ve uygulamanın görselin içinden oluşturulmuş olması gerekir. İçeri aktarma modelinde değişiklik bir sonraki yenilemede görünür.' },
    { t: 'mc', q: 'Veri işlevi düğmesine bağlayacağın Fabric kullanıcı veri işlevi ne döndürmelidir?', o: ['Bir tablo', 'Bir metin (str)', 'Bir JSON dosyası', 'Bir DAX ölçüsü'], a: 1, why: 'Learn’e göre rapora eklenen işlev str döndürmelidir; Power BI bu metni kullanıcıya işlemin sonucu olarak gösterir.' },
    { t: 'mc', q: 'Bir rapor görselinde <b>Uyarı ayarla</b> komutunu kullandın. Arka planda ne oluşur?', o: ['Panoda yeni bir kutucuk', 'Yeni bir abonelik e-postası', 'Bir Activator öğesi', 'Rapora gizli bir sayfa'], a: 2, why: 'Rapor uyarıları Fabric Activator ile çalışır; Power BI bir Activator öğesi oluşturup modeli izlemeye başlar. Özellik Learn’de genel önizleme olarak geçiyor.' },
    { t: 'mc', q: 'Veri işlevi düğmesi olan raporu dağıtım işlem hattıyla test çalışma alanından üretime taşıdın. Düğme hangi işlevi çağırır?', o: ['Üretimdeki aynı adlı işlevi', 'Hiçbir işlevi, düğme kaybolur', 'Kullanıcının seçtiği işlevi', 'Hâlâ test alanındaki işlevi'], a: 3, why: 'Düğme belirli çalışma alanı, işlev kümesi ve işleve sabit bir başvuru tutar ve otomatik yeniden bağlanmaz. Hedef raporda başvuruyu güncellemen gerekir.' },
    { t: 'dax', name: 'Uyarı Bayrağı', q: '<b>Uyarı Bayrağı</b>: Hedef gerçekleşme oranı (<code>[Hedef Gerçekleşme %]</code>) %95’in altındaysa 1, değilse 0 döndür. Hedef yoksa (oran boşsa) 0 dönsün; uyarı boş hücrede çalışmasın.', sol: 'VAR Oran = [Hedef Gerçekleşme %]\nRETURN IF(NOT ISBLANK(Oran) && Oran < 0.95, 1, 0)', hint: 'VAR Oran = [Hedef Gerçekleşme %] RETURN IF(NOT ISBLANK(Oran) && Oran < 0.95, 1, 0). BLANK < 0.95 doğru sayılır; ISBLANK kontrolü bu yüzden gerekli.' },
    { t: 'dax', name: 'Akış Özeti', q: '<b>Akış Özeti</b>: Akışın e-postasına yazılacak metin: kategorileri net satışa göre büyükten küçüğe, “Kategori: tutar” biçiminde, aralarına <code>"; "</code> koyarak birleştir. Tutar için <code>FORMAT([Net Satış], "#,0")</code> kullan.', sol: 'CONCATENATEX(VALUES(Kategoriler[Kategori]), Kategoriler[Kategori] & ": " & FORMAT([Net Satış], "#,0"), "; ", [Net Satış], DESC)', hint: 'CONCATENATEX(VALUES(Kategoriler[Kategori]), Kategoriler[Kategori] & ": " & FORMAT([Net Satış], "#,0"), "; ", [Net Satış], DESC)' },
    { t: 'dax', name: 'Akış Kayıt Notu', q: '<b>Akış Kayıt Notu</b>: Düğmenin yanındaki kartta gösterilecek uyarı. <code>Satislar</code> satır sayısı 1.000’den fazlaysa <code>"Sınır aşıldı: " &amp; N &amp; " satır"</code>, değilse <code>N &amp; " satır gönderilebilir"</code> döndür (N = satır sayısı).', sol: 'VAR N = COUNTROWS(Satislar)\nRETURN IF(N > 1000, "Sınır aşıldı: " & N & " satır", N & " satır gönderilebilir")', hint: 'VAR N = COUNTROWS(Satislar) RETURN IF(N > 1000, "Sınır aşıldı: " & N & " satır", N & " satır gönderilebilir")' }
  ]
});

/* ---------- 3 · DAX kullanıcı tanımlı fonksiyonları (C1) ---------- */
add('pencere', {
  id: 'dax-udf', lv: 'C1', mod: 'İleri DAX', min: 25,
  title: 'DAX kullanıcı tanımlı fonksiyonları (UDF): tekrar eden mantığı tek yerde toplamak',
  sum: 'Neden UDF (kopyala-yapıştır ölçü ve hesaplama gruplarıyla karşılaştırma), DAX sorgu görünümünde DEFINE FUNCTION ile tanımlayıp EVALUATE ile denemek, modele kaydetmek ve TMDL, imza tasarımı, parametre türleri, val ve expr geçiş modlarının bağlama etkisi, sınırlar.',
  body: `
<p>Büyüyen bir modelde aynı mantık onlarca ölçüde tekrar eder: “geçen yıla göre değişim”, “payda sıfırsa boş döndür”, “şu kanalın payı”. Bir gün tanım değişir (ör. iadeler de düşülecek) ve sen otuz ölçüyü tek tek düzeltirsin; birini unutursun. <b>DAX kullanıcı tanımlı fonksiyonları</b> (user-defined functions, UDF) bu mantığı parametreli bir fonksiyon olarak <b>bir kez</b> yazmanı sağlar.</p>
<div class="note"><b>Durum</b>UDF'ler 2025'te önizleme olarak geldi. Microsoft Learn'e göre <b>Haziran 2026</b> sürümünden itibaren Power BI Desktop ve Service’te genel kullanımdadır ve veritabanı uyumluluk düzeyi <b>1702</b> ya da üstünü ister. Bu uygulamanın Playground motoru <code>FUNCTION</code> sözcüğünü desteklemez: UDF kodlarını okuyup anla, alıştırmalarda fonksiyon çağrısının <b>açılmış (inline) hâlini</b> yaz.</div>

<h2>UDF mi, hesaplama grubu mu, düz ölçü mü?</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Kopyala-yapıştır ölçü</th><th>Hesaplama grubu</th><th>UDF</th></tr>
<tr><td>Nasıl uygulanır?</td><td>Her ölçüde mantık yeniden yazılır</td><td>Görseldeki ölçüye <code>SELECTEDMEASURE()</code> ile otomatik uygulanır</td><td>Ölçünün içinde adıyla çağrılır</td></tr>
<tr><td>Parametre</td><td>Yok</td><td>Yok (yalnızca seçili ölçü)</td><td>0–256 parametre, varsayılan değer</td></tr>
<tr><td>Kim seçer?</td><td>Model yazarı</td><td>Rapor kullanıcısı (dilimleyiciyle)</td><td>Model yazarı</td></tr>
<tr><td>Nerede çalışır?</td><td>Ölçü</td><td>Ölçüler (örtük ölçüler hariç)</td><td>Ölçü, hesaplanmış sütun, görsel hesaplama, başka UDF</td></tr>
</table></div>
<p>İkisi rakip değil. Hesaplama grubu “kullanıcı Cari / GY / YTD arasında seçsin” sorusunu çözer (<b>Hesaplama grupları, alan parametreleri, görsel hesaplamalar</b> dersi). UDF ise “bu formülü otuz yerde aynı yazalım” sorusunu çözer. Bir hesaplama öğesi de içinde bir UDF çağırabilir.</p>

<h2>İlk fonksiyon: tanımla ve EVALUATE ile dene</h2>
<p>UDF'yi önce <b>DAX sorgu görünümünde</b> yazıp denemek en güvenli yoldur. <code>DEFINE</code> bloğunda <code>FUNCTION</code> anahtar sözcüğü, adı, parametre listesi ve <code>=&gt;</code> işaretinden sonra gövde gelir:</p>
<pre class="dax" data-notry>DEFINE
    /// Payı paydaya güvenli böler; payda 0 ya da boşsa BLANK döner.
    FUNCTION Pbi.Pay = ( pay : NUMERIC, payda : NUMERIC ) =&gt;
        DIVIDE ( pay, payda )

EVALUATE
{ Pbi.Pay ( 10, 4 ), Pbi.Pay ( 10, 0 ) }
// 2,5 ve boş</pre>
<p><code>///</code> ile başlayan satır fonksiyonun <b>açıklamasıdır</b>; IntelliSense bunu gösterir. Düz <code>//</code> ve <code>/* */</code> yorumlar açıklama olarak görünmez. Sorgu düzgün çalışınca:</p>
<ul>
<li>DAX sorgu görünümünde üstteki <b>Modeli değişikliklerle güncelle</b> (Update model with changes) düğmesine ya da editördeki “Update model: Add new function” satırına bas. Fonksiyon modele kaydedilir ve <b>Model gezgininde Functions</b> düğümünde görünür.</li>
<li><b>TMDL görünümünde</b> aynı tanım <code>createOrReplace</code> altında <code>function Pbi.Pay = ...</code> biçimindedir; <b>Uygula</b> ile kaydedilir. PBIP projesinde fonksiyonlar <code>definition</code> klasöründeki <code>functions.tmdl</code> dosyasında durur (<b>Yaşam döngüsü: PBIP, TMDL, Git…</b> dersi).</li>
<li>Kaydedilen fonksiyon bir ölçüde çağrılır: <code>Brüt Marj = Pbi.Pay ( [Brüt Kâr], [Net Satış] )</code>.</li>
</ul>

<h2>İmza tasarlamak: ad, parametre, tür</h2>
<p>Fonksiyonun imzası (adı ve parametreleri) bir sözleşmedir; sonradan değiştirmek onu çağıran her ölçüyü etkiler. Learn'deki kurallar:</p>
<ul>
<li><b>Fonksiyon adı</b> modelde benzersiz olmalı; harf, rakam ve alt çizgi içerir. Ad alanı için nokta kullanılabilir (<code>Pbi.Pay</code>, <code>Finans.Yoy</code>) ama ad noktayla başlayıp bitemez, art arda iki nokta olamaz. Yerleşik bir DAX fonksiyonuyla ya da <code>MEASURE</code>, <code>FUNCTION</code>, <code>DEFINE</code> gibi ayrılmış sözcüklerle çakışamaz.</li>
<li><b>Parametre adı</b> yalnızca harf, rakam ve alt çizgi içerir; nokta olamaz. Türkçe karakterden kaçınmak (<code>oran</code>, <code>payda</code>) taşınabilirliği artırır.</li>
<li><b>Varsayılan değer:</b> <code>esik : NUMERIC = 0.95</code> parametreyi isteğe bağlı yapar. Varsayılan ifade, fonksiyonun tanımlandığı yerde görünen adlara başvurabilir.</li>
<li><b>Aşırı yükleme yok:</b> Aynı adla farklı parametreli iki fonksiyon tanımlanamaz. Özyineleme de desteklenmez; dönüş türü açıkça yazılamaz.</li>
</ul>
<div class="tbl-wrap"><table>
<tr><th>Tür ipucu</th><th>Anlamı</th><th>Varsayılan mod</th></tr>
<tr><td><code>AnyVal</code></td><td>Skaler ya da tablo değer (tür yazılmazsa bu)</td><td>val</td></tr>
<tr><td><code>Scalar</code> + alt tür</td><td>Tek değer; alt tür <code>Int64</code>, <code>Decimal</code>, <code>Double</code>, <code>String</code>, <code>DateTime</code>, <code>Boolean</code>, <code>Numeric</code>, <code>Variant</code></td><td>val</td></tr>
<tr><td><code>Table</code></td><td>Tablo değer</td><td>val</td></tr>
<tr><td><code>AnyRef</code>, <code>ColumnRef</code>, <code>TableRef</code>, <code>MeasureRef</code>, <code>CalendarRef</code></td><td>Sütun, tablo, ölçü ya da takvim <b>başvurusu</b></td><td>expr (val yazılamaz)</td></tr>
</table></div>
<p>Değer türleri örtük tür dönüşümü yapar: <code>x : INT64</code> parametresine 3,4 verirsen 3 olur. Başvuru türleri dönüşüm yapmaz. Gövdede <code>ISNUMERIC</code>, <code>ISSTRING</code>, <code>ISINT64</code> gibi denetim fonksiyonlarıyla gelen değeri kontrol edebilirsin.</p>

<h2>val ve expr: argüman ne zaman hesaplanır?</h2>
<p>Parametrenin <b>geçiş modu</b> UDF'lerin en önemli ve en kolay karıştırılan noktasıdır:</p>
<ul>
<li><b>val (hevesli, eager):</b> Argüman fonksiyon çağrılmadan <b>önce bir kez</b> hesaplanır; fonksiyona yalnızca sonucu gider. Learn'e göre çağıranın hem satır hem filtre bağlamını görür.</li>
<li><b>expr (tembel, lazy):</b> Argüman hesaplanmadan, bir ifade olarak gider. Fonksiyon gövdesinde, gövdenin kurduğu bağlamda (ör. <code>CALCULATE</code> içinde) ve gerekirse <b>birçok kez</b> hesaplanır. Learn'e göre yalnızca filtre bağlamını devralır.</li>
</ul>
<pre class="dax" data-notry>DEFINE
    FUNCTION Pbi.Yoy = ( olcu : SCALAR EXPR ) =&gt;
        VAR Simdi = olcu
        VAR Once = CALCULATE ( olcu, SAMEPERIODLASTYEAR ( Tarih[Tarih] ) )
        RETURN DIVIDE ( Simdi - Once, Once )

    FUNCTION Pbi.YoyHatali = ( olcu : SCALAR VAL ) =&gt;
        VAR Simdi = olcu
        VAR Once = CALCULATE ( olcu, SAMEPERIODLASTYEAR ( Tarih[Tarih] ) )
        RETURN DIVIDE ( Simdi - Once, Once )

EVALUATE
SUMMARIZECOLUMNS ( Tarih[Yil],
    "expr", Pbi.Yoy ( [Net Satış] ),
    "val", Pbi.YoyHatali ( [Net Satış] ) )</pre>
<p><code>val</code> sürümünde <code>olcu</code> artık bir sayıdır; <code>CALCULATE</code> bir sayının filtresini değiştiremez, “geçen yıl” da bu yılla aynı çıkar. Aynı davranışı motorda VAR ile görebilirsin; VAR da val gibi bir kez hesaplanır:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(Tarih[Yil],
    "expr gibi", DIVIDE([Net Satış] - CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih])),
                        CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))),
    "val gibi", VAR S = [Net Satış]
                RETURN DIVIDE(S - CALCULATE(S, SAMEPERIODLASTYEAR(Tarih[Tarih])),
                              CALCULATE(S, SAMEPERIODLASTYEAR(Tarih[Tarih]))))</pre>
<p>Sonuç: expr gibi 2023'te <b>%289,8</b>, 2024'te <b>%86,4</b>; val gibi her yıl <b>0</b>. Kural basit: Fonksiyonun içinde argümanın <b>bağlamını değiştireceksen</b> (CALCULATE, yineleyici, zaman zekâsı) parametre <code>expr</code> olmalı. Yalnızca gelen sayıyla aritmetik yapacaksan (<code>Pbi.Pay</code> gibi) <code>val</code> yeterli ve daha ucuzdur; argüman bir kez hesaplanır.</p>
<p>Yineleyicide fark daha da büyür. <code>AVERAGEX(VALUES(Tarih[YilAy]), olcu)</code> gövdeli bir fonksiyonda expr parametre her ay için ayrı hesaplanır: filtresiz durumda satış olan 31 ayın ortalaması <b>40.347</b> TL'dir. Aynı parametre val olsaydı tek bir toplam (1.250.772) her aya tekrar yazılır ve “ortalama” toplamın kendisine eşit çıkardı.</p>

<h2>Test etmek</h2>
<ol>
<li><b>Bilinen değerle karşılaştır:</b> <code>EVALUATE { Pbi.Pay ( 10, 4 ) }</code> gibi elle hesaplanabilen girdilerle başla.</li>
<li><b>Hazır ölçüyle aynı mı?</b> Fonksiyonla yazdığın ölçüyü eski ölçünün yanına bir tabloya koy: <code>SUMMARIZECOLUMNS ( Tarih[Yil], "Eski", [YoY %], "Yeni", Pbi.Yoy ( [Net Satış] ) )</code>. Her satır aynı olmalı.</li>
<li><b>Kenar durumları:</b> payda 0, BLANK, negatif değer, geçen yılı olmayan ilk yıl (2022).</li>
<li><b>Modeldeki fonksiyonları listele:</b> <code>EVALUATE INFO.USERDEFINEDFUNCTIONS ()</code> modeldeki UDF'leri ve ifadelerini döndürür; belgelendirme ve gözden geçirme için kullanışlıdır.</li>
</ol>

<h2>Sınırlar (Learn'e göre)</h2>
<ul>
<li>UDF'ler görüntüleme klasörlerine konamaz, çevirilerle birleştirilemez; tablosu olmayan modellerde desteklenmez.</li>
<li><b>Nesne düzeyi güvenlik fonksiyonu korumaz:</b> Gizli bir sütunu kullanan fonksiyon otomatik gizlenmez. Gizli nesnelerin adını fonksiyon adına ya da açıklamasına yazma.</li>
<li>Canlı bağlantılı bir raporda kaynak modelin fonksiyonları Model gezgininde görünmez; bileşik modeldeki ölçüler kaynak modelin UDF'lerine başvuramaz.</li>
<li>Görsel hesaplama formül çubuğunda IntelliSense yoktur; sütunu expr parametre olarak geçirmek ya da tablo adı olmadan sütun yazmak kırmızı alt çizgi ve doğrulama hatası üretebilir. Tablo adıyla nitelenmemiş adlar ölçü başvurusu sayılır.</li>
</ul>
<div class="tip"><b>Kütüphane gibi düşün</b>Fonksiyonları bir ad alanı altında topla (<code>Finans.</code>, <code>Zaman.</code>), her birine <code>///</code> açıklaması ve <code>@param</code> satırları yaz, bir test sorgusunu PBIP deposunda sakla. Fonksiyonu değiştirince test sorgusunu yeniden çalıştır.</div>
`,
  ex: [
    { t: 'dax', name: 'İade Payı (UDF açılımı)', q: 'Modelde <code>Pbi.Pay ( pay : NUMERIC, payda : NUMERIC ) =&gt; DIVIDE ( pay, payda )</code> fonksiyonu var. <b>İade Payı (UDF açılımı)</b>: <code>Pbi.Pay ( [İade Tutarı], [Toplam Satış] )</code> çağrısının sonucunu veren ölçüyü fonksiyon olmadan yaz.', sol: 'DIVIDE([İade Tutarı], [Toplam Satış])', hint: 'Parametreleri gövdeye yerleştir: DIVIDE([İade Tutarı], [Toplam Satış]).' },
    { t: 'dax', name: 'Sipariş YoY (UDF açılımı)', q: '<code>Pbi.Yoy ( olcu : SCALAR EXPR )</code> gövdesi: <code>VAR Simdi = olcu VAR Once = CALCULATE ( olcu, SAMEPERIODLASTYEAR ( Tarih[Tarih] ) ) RETURN DIVIDE ( Simdi - Once, Once )</code>. <b>Sipariş YoY (UDF açılımı)</b>: <code>Pbi.Yoy ( [Sipariş Sayısı] )</code> çağrısının açılmış hâlini yaz. Parametre expr olduğu için her <code>olcu</code> geçtiği yerde yeniden hesaplanır.', sol: 'VAR Simdi = [Sipariş Sayısı]\nVAR Once = CALCULATE([Sipariş Sayısı], SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN DIVIDE(Simdi - Once, Once)', hint: 'olcu yerine [Sipariş Sayısı] yaz: VAR Once = CALCULATE([Sipariş Sayısı], SAMEPERIODLASTYEAR(Tarih[Tarih])). Önce VAR S = [Sipariş Sayısı] deyip CALCULATE(S, …) yazarsan val davranışı elde edersin ve sonuç 0 olur.' },
    { t: 'dax', name: 'Web Payı (UDF açılımı)', q: '<code>Pbi.KanalPayi ( olcu : SCALAR EXPR, kanal : STRING ) =&gt; DIVIDE ( CALCULATE ( olcu, Satislar[Kanal] = kanal ), olcu )</code>. <b>Web Payı (UDF açılımı)</b>: <code>Pbi.KanalPayi ( [Net Satış], "Web" )</code> çağrısının açılmış hâlini yaz.', sol: 'DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Web"), [Net Satış])', hint: 'olcu → [Net Satış], kanal → "Web": DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Web"), [Net Satış]).' },
    { t: 'dax', name: 'Aylık Ortalama (UDF açılımı)', q: '<code>Zaman.AyOrtalamasi ( olcu : SCALAR EXPR ) =&gt; AVERAGEX ( VALUES ( Tarih[YilAy] ), olcu )</code>. <b>Aylık Ortalama (UDF açılımı)</b>: <code>Zaman.AyOrtalamasi ( [Net Satış] )</code> çağrısının açılmış hâlini yaz.', sol: 'AVERAGEX(VALUES(Tarih[YilAy]), [Net Satış])', hint: 'expr parametre yineleyicinin içinde her ay için ayrı hesaplanır: AVERAGEX(VALUES(Tarih[YilAy]), [Net Satış]).' },
    { t: 'query', q: 'Bir UDF’yi hazır ölçüyle karşılaştıran test sorgusunu yaz: <code>Tarih[Yil]</code> başına iki sütun döndür: <code>"Hazır"</code> = <code>[YoY %]</code> ve <code>"Açılım"</code> = <code>Pbi.Yoy ( [Net Satış] )</code> çağrısının açılmış hâli. İki sütun her yılda aynı çıkmalı.', start: 'EVALUATE\n', sol: 'EVALUATE\nSUMMARIZECOLUMNS(Tarih[Yil],\n    "Hazır", [YoY %],\n    "Açılım", VAR Once = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih])) RETURN DIVIDE([Net Satış] - Once, Once))', hint: 'SUMMARIZECOLUMNS(Tarih[Yil], "Hazır", [YoY %], "Açılım", VAR Once = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih])) RETURN DIVIDE([Net Satış] - Once, Once))' },
    { t: 'mc', q: 'Bir fonksiyonun gövdesinde parametreyi <code>CALCULATE ( olcu, SAMEPERIODLASTYEAR ( … ) )</code> içinde kullanıyorsun ve parametreyi <code>SCALAR VAL</code> tanımladın. 2024 satırında sonuç ne olur?', o: ['Geçen yılın değeri doğru gelir', 'Geçen yıl, bu yılla aynı çıkar', 'Fonksiyon kaydedilemez', 'Sonuç her zaman BLANK olur'], a: 1, why: 'val parametre çağrıdan önce bir kez hesaplanır ve fonksiyona bir sayı olarak gelir. CALCULATE bir sayının bağlamını değiştiremez; “geçen yıl” bu yılla aynıdır, YoY 0 çıkar. Bağlam değiştirecek parametre expr olmalı.' },
    { t: 'mc', q: 'Kullanıcı rapordaki bir dilimleyiciyle her ölçüyü Cari, Geçen yıl ve YTD arasında değiştirebilmeli. Hangisi bu iş için tasarlanmıştır?', o: ['Bir hesaplama grubu', 'Her ölçü için bir UDF', 'MeasureRef parametreli UDF', 'Görüntüleme klasörü'], a: 0, why: 'Hesaplama grubu, görseldeki ölçüye SELECTEDMEASURE() ile uygulanır ve kullanıcı dilimleyiciyle öğe seçer. UDF ise model yazarının ölçü kodunda adıyla çağırdığı yeniden kullanılabilir mantıktır; ikisi birlikte de kullanılabilir.' },
    { t: 'mc', q: 'Aşağıdaki fonksiyon adlarından hangisi Learn’deki kurallara uyar?', o: ['<code>.Finans.Pay</code>', '<code>Finans..Pay</code>', '<code>Finans Pay</code>', '<code>Finans.Pay</code>'], a: 3, why: 'Nokta ad alanı için kullanılabilir ama ad noktayla başlayıp bitemez, art arda iki nokta içeremez; boşluk da kullanılamaz. Finans.Pay geçerlidir.' }
  ]
});

/* ---------- 4 · Finansal tablolar ve yatırım analizi (C1) ---------- */
add('finans', {
  id: 'finans-tablolar', lv: 'C1', mod: 'Analiz', min: 30,
  title: 'Finansal tablolar ve yatırım analizi: bilanço, nakit akışı, oranlar ve sermaye bütçelemesi',
  sum: 'Bilanço ve muhasebe denklemi, hesap planını modellemek (hiyerarşi, işaret, sıralama), dolaylı yöntemle nakit akış tablosu, FAVÖK, likidite ve kârlılık oranları; geri ödeme, indirgenmiş geri ödeme, kârlılık endeksi, NBD profili ve iki boyutlu duyarlılık tablosu.',
  body: `
<p><b>Finansal raporlama</b> dersinde satış ve maliyet satırlarından bir gelir tablosu kurduk; bütçe sapmasını, FV/PV/PMT'yi, XNPV ve XIRR'ı gördük. Bu ders o dersin devamı: gelir tablosunun iki kardeşi olan <b>bilanço</b> ve <b>nakit akış tablosu</b>, bunlardan çıkan oranlar ve bir yatırımı seçerken kullanılan ek ölçütler.</p>
<p>Anadolu Market modelinde bilanço verisi yok. Bu yüzden kodların içinde <code>DATATABLE</code> ile küçük, <b>varsayımsal</b> bir şirket kuracağız. Gerçek bir projede bu satırlar muhasebe sisteminden gelen bir mizan ya da yevmiye tablosundan okunur.</p>

<h2>Üç tablo, iki tür sayı</h2>
<ul>
<li><b>Gelir tablosu</b> bir <b>dönemin</b> akışıdır: Ocak–Aralık arasında ne sattın, ne harcadın. Aylar toplanabilir.</li>
<li><b>Bilanço</b> bir <b>anın</b> fotoğrafıdır: 31 Aralık'ta kasanda, alacaklarında, borçlarında ne var. Ayların bakiyeleri toplanmaz; bu yarı toplanabilir bir ölçüdür (<b>Yarı toplanabilir ölçüler: stok, bakiye, nüfus</b> dersi).</li>
<li><b>Nakit akış tablosu</b> yine bir dönem akışıdır: kâr ile kasadaki değişimin neden farklı olduğunu açıklar.</li>
</ul>

<h2>Bilanço ve muhasebe denklemi</h2>
<p>Bilançonun sol tarafı (aktif) şirketin <b>varlıklarını</b>, sağ tarafı (pasif) bu varlıkların <b>kaynağını</b> gösterir. Kaynak ya borçtur (yükümlülük) ya da ortakların payıdır (özkaynak):</p>
<p style="text-align:center"><b>Varlıklar = Yükümlülükler + Özkaynak</b></p>
<p>Türkiye'deki Tekdüzen Hesap Planında hesap kodunun ilk hanesi sınıfı verir: <b>1</b> dönen varlıklar, <b>2</b> duran varlıklar, <b>3</b> kısa vadeli yabancı kaynaklar, <b>4</b> uzun vadeli yabancı kaynaklar, <b>5</b> özkaynaklar, <b>6</b> gelir tablosu hesapları. Bu kuralla denklemi yıl yıl kontrol edebiliriz:</p>
<pre class="dax">EVALUATE
VAR Bilanco = DATATABLE("Yil", INTEGER, "Hesap", STRING, "Tutar", CURRENCY, {
    {2022, "102", 60000}, {2022, "120", 25000}, {2022, "153", 70000}, {2022, "253", 200000},
    {2022, "300", 40000}, {2022, "320", 55000}, {2022, "400", 100000},
    {2022, "500", 100000}, {2022, "570", 40000}, {2022, "590", 20000},
    {2023, "102", 85000}, {2023, "120", 40000}, {2023, "153", 95000}, {2023, "253", 230000},
    {2023, "300", 45000}, {2023, "320", 80000}, {2023, "400", 110000},
    {2023, "500", 100000}, {2023, "570", 60000}, {2023, "590", 55000},
    {2024, "102", 120000}, {2024, "120", 65000}, {2024, "153", 140000}, {2024, "253", 260000},
    {2024, "300", 55000}, {2024, "320", 120000}, {2024, "400", 120000},
    {2024, "500", 100000}, {2024, "570", 115000}, {2024, "590", 75000}})
RETURN ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Bilanco, "Yil", [Yil])),
    "Varlıklar", VAR Y = [Yil] RETURN SUMX(FILTER(Bilanco, [Yil] = Y &amp;&amp; LEFT([Hesap], 1) IN {"1", "2"}), [Tutar]),
    "Yükümlülükler", VAR Y = [Yil] RETURN SUMX(FILTER(Bilanco, [Yil] = Y &amp;&amp; LEFT([Hesap], 1) IN {"3", "4"}), [Tutar]),
    "Özkaynak", VAR Y = [Yil] RETURN SUMX(FILTER(Bilanco, [Yil] = Y &amp;&amp; LEFT([Hesap], 1) = "5"), [Tutar]))</pre>
<div class="tbl-wrap"><table>
<tr><th>Yıl sonu</th><th>Varlıklar</th><th>Yükümlülükler</th><th>Özkaynak</th></tr>
<tr><td>2022</td><td>355.000</td><td>195.000</td><td>160.000</td></tr>
<tr><td>2023</td><td>450.000</td><td>235.000</td><td>215.000</td></tr>
<tr><td>2024</td><td>585.000</td><td>295.000</td><td>290.000</td></tr>
</table></div>
<p>Her yıl varlıklar, yükümlülük ile özkaynağın toplamına eşit. Raporda bu kontrolü bir ölçü olarak tut (<code>Varlıklar − Yükümlülükler − Özkaynak</code>) ve sıfırdan farklıysa kırmızı göster: veri yüklemesinde eksik hesap olduğunun en hızlı işaretidir. Hesaplar: 102 Bankalar, 120 Alıcılar, 153 Ticari mallar, 253 Tesis, makine ve cihazlar (net), 300 ve 400 Banka kredileri, 320 Satıcılar, 500 Sermaye, 570 Geçmiş yıllar kârları, 590 Dönem net kârı.</p>

<h2>Hesap planını modellemek: hiyerarşi, işaret, sıralama</h2>
<p>Muhasebe sisteminden gelen veride her satır bir hesabın <b>borç</b> ve <b>alacak</b> tutarıdır. Rapora çevirmek için üç karar gerekir:</p>
<ol>
<li><b>Hiyerarşi:</b> Hesap planı tablosunda kodun ilk hanesi sınıf, ilk iki hanesi grup (60 Brüt satışlar, 61 Satış indirimleri, 62 Satışların maliyeti, 63 Faaliyet giderleri, 66 Finansman giderleri…), üç hanesi hesaptır. Bu sütunları Power Query'de ya da <code>LEFT(HesapPlani[Hesap], 2)</code> gibi hesaplanmış sütunlarla üret, sonra bir hiyerarşi kur (<b>Hiyerarşiler</b> dersi).</li>
<li><b>İşaret:</b> Gelir hesapları alacak, gider hesapları borç bakiyesi verir. Tutarı <code>Alacak − Borç</code> olarak alırsan gelir pozitif, gider negatif olur ve gelir tablosunun ara toplamları basit bir toplamla çıkar. Bilançoda ise aktif için <code>Borç − Alacak</code>, pasif için <code>Alacak − Borç</code> kullanılır; hesap planına bir <b>İşaret</b> sütunu (+1 / −1) eklemek kuralı tek yerde tutar.</li>
<li><b>Sıralama:</b> Rapor satırlarını tutan bir tablo (Sira, Satir, AraToplam) kur ve Satir sütununu “Sütuna göre sırala” ile Sira'ya bağla. Hesap planındaki her hesap bir rapor satırına eşlenir.</li>
</ol>
<p>Ara toplam satırları (Net satışlar, Brüt kâr…) kendisinden önceki tüm satırların toplamıdır. Aşağıdaki sorgu 2024 mizanından gelir tablosunu bu kuralla kurar:</p>
<pre class="dax">EVALUATE
VAR Mizan = DATATABLE("Hesap", STRING, "Ad", STRING, "Sira", INTEGER, "Borc", CURRENCY, "Alacak", CURRENCY, {
    {"600", "Yurt içi satışlar", 1, 0, 930000},
    {"610", "Satıştan iadeler", 2, 30000, 0},
    {"621", "Satılan ticari mallar maliyeti", 4, 560000, 0},
    {"631", "Pazarlama, satış ve dağıtım giderleri", 6, 120000, 0},
    {"632", "Genel yönetim giderleri", 6, 101250, 0},
    {"660", "Kısa vadeli borçlanma giderleri", 8, 25000, 0},
    {"691", "Dönem kârı vergi karşılığı", 10, 18750, 0}})
VAR Satirlar = DATATABLE("Sira", INTEGER, "Satir", STRING, "AraToplam", BOOLEAN, {
    {1, "Brüt satışlar", FALSE}, {2, "Satış indirimleri", FALSE}, {3, "Net satışlar", TRUE},
    {4, "Satışların maliyeti", FALSE}, {5, "Brüt kâr", TRUE}, {6, "Faaliyet giderleri", FALSE},
    {7, "Esas faaliyet kârı", TRUE}, {8, "Finansman giderleri", FALSE}, {9, "Vergi öncesi kâr", TRUE},
    {10, "Vergi", FALSE}, {11, "Dönem net kârı", TRUE}})
RETURN ADDCOLUMNS(Satirlar, "Tutar",
    VAR S = [Sira]
    VAR Ara = [AraToplam]
    RETURN IF(Ara,
        SUMX(FILTER(Mizan, [Sira] &lt; S), [Alacak] - [Borc]),
        SUMX(FILTER(Mizan, [Sira] = S), [Alacak] - [Borc])))</pre>
<p>Sonuç: brüt satışlar 930.000, satış indirimleri −30.000, net satışlar 900.000, satışların maliyeti −560.000, brüt kâr 340.000, faaliyet giderleri −221.250, esas faaliyet kârı 118.750, finansman giderleri −25.000, vergi öncesi kâr 93.750, vergi −18.750, <b>dönem net kârı 75.000</b>. Bu rakam bilançodaki 590 hesabının 2024 bakiyesiyle aynı; iki tablo birbirini doğruluyor.</p>
<p>Gerçek modelde aynı mantık bir ölçüdür. Yevmiye satırları hesap planına, hesap planı rapor satırlarına bağlıdır:</p>
<pre class="dax" data-notry>KZ Tutarı =
VAR Sira = SELECTEDVALUE ( RaporSatirlari[Sira] )
VAR Ara = SELECTEDVALUE ( RaporSatirlari[AraToplam] )
VAR Tutar = SUMX ( Yevmiye, Yevmiye[Alacak] - Yevmiye[Borc] )
RETURN
    IF ( Ara,
        CALCULATE ( SUMX ( Yevmiye, Yevmiye[Alacak] - Yevmiye[Borc] ),
            REMOVEFILTERS ( RaporSatirlari ), RaporSatirlari[Sira] &lt; Sira ),
        Tutar )</pre>

<h2>Nakit akış tablosu: kâr neden kasada değil?</h2>
<p>2024'te şirket 75.000 TL kâr etti ama bankadaki para 85.000'den 120.000'e, yani yalnızca 35.000 TL arttı. <b>Dolaylı yöntem</b> farkı açıklar: net kârdan başla, nakit çıkışı olmayan gideri (amortisman) geri ekle, işletme sermayesindeki değişimleri düzelt, sonra yatırım ve finansman akışlarını ekle.</p>
<pre class="dax">EVALUATE
VAR Bilanco = DATATABLE("Yil", INTEGER, "Hesap", STRING, "Tutar", CURRENCY, {
    {2023, "102", 85000}, {2023, "120", 40000}, {2023, "153", 95000}, {2023, "253", 230000},
    {2023, "300", 45000}, {2023, "320", 80000}, {2023, "400", 110000}, {2023, "590", 55000},
    {2024, "102", 120000}, {2024, "120", 65000}, {2024, "153", 140000}, {2024, "253", 260000},
    {2024, "300", 55000}, {2024, "320", 120000}, {2024, "400", 120000}, {2024, "590", 75000}})
VAR Amortisman = 30000
VAR Fark = ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Bilanco, "Hesap", [Hesap])),
    "D", VAR H = [Hesap]
         RETURN SUMX(FILTER(Bilanco, [Hesap] = H), IF([Yil] = 2024, [Tutar], -[Tutar])))
VAR D = SELECTCOLUMNS(Fark, "Hesap", [Hesap], "D", [D])
VAR NetKar = SUMX(FILTER(Bilanco, [Hesap] = "590" &amp;&amp; [Yil] = 2024), [Tutar])
VAR Akis = {
    ("İşletme", "Dönem net kârı", NetKar),
    ("İşletme", "Amortisman (nakit çıkışı yok)", Amortisman),
    ("İşletme", "Ticari alacak artışı", -SUMX(FILTER(D, [Hesap] = "120"), [D])),
    ("İşletme", "Stok artışı", -SUMX(FILTER(D, [Hesap] = "153"), [D])),
    ("İşletme", "Ticari borç artışı", SUMX(FILTER(D, [Hesap] = "320"), [D])),
    ("Yatırım", "Maddi duran varlık alımı", -(SUMX(FILTER(D, [Hesap] = "253"), [D]) + Amortisman)),
    ("Finansman", "Kredi değişimi (KV + UV)", SUMX(FILTER(D, [Hesap] IN {"300", "400"}), [D])) }
RETURN UNION(Akis,
    ROW("Bölüm", "Toplam", "Kalem", "Net nakit değişimi", "Tutar", SUMX(Akis, [Value3])),
    ROW("Bölüm", "Kontrol", "Kalem", "102 Bankalar değişimi", "Tutar", SUMX(FILTER(D, [Hesap] = "102"), [D])))</pre>
<div class="tbl-wrap"><table>
<tr><th>Bölüm</th><th>Kalem</th><th>2024 (TL)</th></tr>
<tr><td rowspan="5">İşletme</td><td>Dönem net kârı</td><td>75.000</td></tr>
<tr><td>Amortisman (nakit çıkışı yok)</td><td>30.000</td></tr>
<tr><td>Ticari alacak artışı</td><td>−25.000</td></tr>
<tr><td>Stok artışı</td><td>−45.000</td></tr>
<tr><td>Ticari borç artışı</td><td>40.000</td></tr>
<tr><td>Yatırım</td><td>Maddi duran varlık alımı</td><td>−60.000</td></tr>
<tr><td>Finansman</td><td>Kredi değişimi (KV + UV)</td><td>20.000</td></tr>
<tr><td colspan="2"><b>Net nakit değişimi</b></td><td><b>35.000</b></td></tr>
</table></div>
<p>İşletme faaliyetlerinden gelen nakit 75.000 TL; ama alacak ve stok artışı 70.000 TL nakit bağladı, tedarikçiler 40.000 TL kredi açtı. Net nakit değişimi bankadaki 35.000 TL artışla birebir aynı. Duran varlık alımı, net defter değerindeki artış (30.000) ile o yıl ayrılan amortismanın (30.000) toplamıdır.</p>

<h2>FAVÖK ve kârlılık oranları</h2>
<p>FAVÖK (EBITDA), esas faaliyet kârına amortismanı geri ekler; şirketin borç yapısından ve yatırım muhasebesinden bağımsız “nakit üretme gücüne” yakın bir göstergedir. Kârlılık oranları kârı farklı paydalara böler:</p>
<pre class="dax">EVALUATE
VAR KZ = DATATABLE("Yil", INTEGER, "NetSatis", CURRENCY, "SMM", CURRENCY, "FaaliyetGideri", CURRENCY,
    "Amortisman", CURRENCY, "Faiz", CURRENCY, "Vergi", CURRENCY, "Varlik", CURRENCY, "Ozkaynak", CURRENCY, {
    {2022, 450000, 290000, 105000, 20000, 10000, 5000, 355000, 160000},
    {2023, 700000, 445000, 141250, 25000, 20000, 13750, 450000, 215000},
    {2024, 900000, 560000, 191250, 30000, 25000, 18750, 585000, 290000}})
RETURN SELECTCOLUMNS(KZ, "Yil", [Yil],
    "FAVÖK", [NetSatis] - [SMM] - [FaaliyetGideri],
    "FAVÖK marjı", DIVIDE([NetSatis] - [SMM] - [FaaliyetGideri], [NetSatis]),
    "Net kâr", [NetSatis] - [SMM] - [FaaliyetGideri] - [Amortisman] - [Faiz] - [Vergi],
    "Net marj", DIVIDE([NetSatis] - [SMM] - [FaaliyetGideri] - [Amortisman] - [Faiz] - [Vergi], [NetSatis]),
    "ROA", DIVIDE([NetSatis] - [SMM] - [FaaliyetGideri] - [Amortisman] - [Faiz] - [Vergi], [Varlik]),
    "ROE", DIVIDE([NetSatis] - [SMM] - [FaaliyetGideri] - [Amortisman] - [Faiz] - [Vergi], [Ozkaynak]))</pre>
<div class="tbl-wrap"><table>
<tr><th>Yıl</th><th>FAVÖK</th><th>FAVÖK marjı</th><th>Net kâr</th><th>Net marj</th><th>ROA</th><th>ROE</th></tr>
<tr><td>2022</td><td>55.000</td><td>%12,2</td><td>20.000</td><td>%4,4</td><td>%5,6</td><td>%12,5</td></tr>
<tr><td>2023</td><td>113.750</td><td>%16,3</td><td>55.000</td><td>%7,9</td><td>%12,2</td><td>%25,6</td></tr>
<tr><td>2024</td><td>148.750</td><td>%16,5</td><td>75.000</td><td>%8,3</td><td>%12,8</td><td>%25,9</td></tr>
</table></div>
<ul>
<li><b>ROA</b> (aktif kârlılığı) = net kâr / toplam varlıklar: varlıklar ne kadar verimli kullanılıyor?</li>
<li><b>ROE</b> (özkaynak kârlılığı) = net kâr / özkaynak: ortakların koyduğu para ne kazandırıyor? Borç arttıkça ROE, ROA'dan hızlı büyür (finansal kaldıraç).</li>
<li>Burada payda yıl sonu bakiyesidir. Daha doğru bir sürüm <b>ortalama</b> bakiyeyi kullanır: 2024 için (215.000 + 290.000) / 2 = 252.500 ile ROE %29,7 olur. Hangi tanımı seçtiğini ölçü açıklamasına yaz.</li>
</ul>

<h2>Likidite oranları</h2>
<p>Likidite, kısa vadeli borçları zamanında ödeyebilme gücüdür.</p>
<ul>
<li><b>Cari oran</b> = dönen varlıklar / kısa vadeli yükümlülükler.</li>
<li><b>Asit-test (likidite) oranı</b> = (dönen varlıklar − stoklar) / kısa vadeli yükümlülükler. Stok hemen nakde dönmeyebileceği için dışarıda bırakılır.</li>
</ul>
<pre class="dax">EVALUATE
VAR Bilanco = DATATABLE("Yil", INTEGER, "Hesap", STRING, "Tutar", CURRENCY, {
    {2022, "102", 60000}, {2022, "120", 25000}, {2022, "153", 70000}, {2022, "300", 40000}, {2022, "320", 55000},
    {2023, "102", 85000}, {2023, "120", 40000}, {2023, "153", 95000}, {2023, "300", 45000}, {2023, "320", 80000},
    {2024, "102", 120000}, {2024, "120", 65000}, {2024, "153", 140000}, {2024, "300", 55000}, {2024, "320", 120000}})
RETURN ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Bilanco, "Yil", [Yil])),
    "Cari oran", VAR Y = [Yil] VAR B = FILTER(Bilanco, [Yil] = Y)
        RETURN DIVIDE(SUMX(FILTER(B, LEFT([Hesap], 1) = "1"), [Tutar]), SUMX(FILTER(B, LEFT([Hesap], 1) = "3"), [Tutar])),
    "Asit-test", VAR Y = [Yil] VAR B = FILTER(Bilanco, [Yil] = Y)
        RETURN DIVIDE(SUMX(FILTER(B, LEFT([Hesap], 1) = "1" &amp;&amp; [Hesap] &lt;&gt; "153"), [Tutar]), SUMX(FILTER(B, LEFT([Hesap], 1) = "3"), [Tutar])))</pre>
<p>Cari oran 2022'de 1,63, 2023'te 1,76, 2024'te 1,86; asit-test oranı sırasıyla 0,89, 1,00 ve 1,06. Cari oran iyileşirken artışın önemli kısmı stoktan geliyor (70.000 → 140.000); asit-test bu yüzden daha yavaş yükseliyor. Stokun ne kadar hızlı döndüğü de bir orandır ve bunu Anadolu Market modelinden hesaplayabiliriz:</p>
<pre class="dax">Stok Devri (Yıl Sonu Stoğa Göre) = DIVIDE([Net Maliyet], [Stok Değeri])</pre>
<p>2024'te net maliyet 458.504 TL, yıl sonu stok değeri 163.465 TL: stok yılda yaklaşık <b>2,80</b> kez dönüyor. Spor kategorisinde bu oran tüm dönem için 2,13 ile en düşük; Kitap'ta 8,36 ile en yüksek. Bu oranın ayrıntısı alıştırmalarda.</p>

<h2>Sermaye bütçelemesi: geri ödeme, indirgenmiş geri ödeme, kârlılık endeksi</h2>
<p>Şirket iki proje arasında seçim yapıyor. İkisi de bugün 200.000 TL yatırım istiyor, beş yıl nakit getiriyor; şirketin istediği getiri %15:</p>
<div class="tbl-wrap"><table>
<tr><th>Yıl</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
<tr><td>Proje A (hızlı dönüş)</td><td>−200.000</td><td>110.000</td><td>90.000</td><td>60.000</td><td>30.000</td><td>10.000</td></tr>
<tr><td>Proje B (geç açılan)</td><td>−200.000</td><td>10.000</td><td>30.000</td><td>70.000</td><td>130.000</td><td>160.000</td></tr>
</table></div>
<ul>
<li><b>Geri ödeme süresi</b> (payback): Kümülatif nakdin sıfıra ulaştığı an. A'da 2. yılın sonunda tam 200.000'e ulaşılır: <b>2,00 yıl</b>. B'de 3. yıl sonunda −90.000 kalır, 4. yılın 130.000'inin 90/130'u gerekir: <b>3,69 yıl</b>. Basit ama paranın zaman değerini ve geri ödemeden sonraki nakdi yok sayar.</li>
<li><b>İndirgenmiş geri ödeme</b>: Aynı hesap, her akış (1 + oran)^yıl ile bugüne indirgenerek yapılır.</li>
<li><b>Kârlılık endeksi</b> (PI) = girişlerin bugünkü değeri / ilk yatırım. 1'den büyükse NBD pozitiftir; sermaye kısıtlıyken “harcanan her lira başına değer” sıralaması verir.</li>
</ul>
<pre class="dax">EVALUATE
VAR Proje = DATATABLE("Yil", INTEGER, "A", DOUBLE, "B", DOUBLE, {
    {0, -200000, -200000}, {1, 110000, 10000}, {2, 90000, 30000},
    {3, 60000, 70000}, {4, 30000, 130000}, {5, 10000, 160000}})
VAR Oran = 0.15
VAR K = ADDCOLUMNS(Proje,
    "A indirgenmiş", [A] / (1 + Oran) ^ [Yil],
    "A kümülatif", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] &lt;= Y), [A] / (1 + Oran) ^ [Yil]))
VAR Ilk = MINX(FILTER(K, [A kümülatif] &gt;= 0), [Yil])
VAR Onceki = MAXX(FILTER(K, [Yil] = Ilk - 1), [A kümülatif])
VAR OYil = MAXX(FILTER(K, [Yil] = Ilk), [A indirgenmiş])
RETURN ROW(
    "NBD A", SUMX(Proje, [A] / (1 + Oran) ^ [Yil]),
    "PI A", DIVIDE(SUMX(FILTER(Proje, [Yil] &gt; 0), [A] / (1 + Oran) ^ [Yil]), 200000),
    "İndirgenmiş geri ödeme A", Ilk - 1 + DIVIDE(-Onceki, OYil))</pre>
<p>%15 ile A'nın NBD'si 25.280 TL, kârlılık endeksi 1,13, indirgenmiş geri ödemesi 2,92 yıl. Aynı hesap B için NBD 31.282 TL, PI 1,16 ve indirgenmiş geri ödeme 4,61 yıl verir. Geri ödemeye bakan A'yı, NBD'ye bakan B'yi seçer. Hangisi doğru? Bunu tek bir oranla değil, oran aralığıyla görmek gerekir.</p>

<h2>NBD profili: iki projeyi karşılaştırmak</h2>
<p><b>NBD profili</b>, NBD'yi bir dizi iskonto oranında çizer. <code>GENERATESERIES</code> oranları üretir; her oran için akışlar yıllık formülle indirgenir. (<b>Finansal raporlama</b> dersi tarihli akışlar için XNPV kullandı; yıllık, eşit aralıklı akışta <code>Nakit / (1 + r)^yıl</code> yeterli.)</p>
<pre class="dax">EVALUATE
VAR Proje = DATATABLE("Yil", INTEGER, "A", DOUBLE, "B", DOUBLE, {
    {0, -200000, -200000}, {1, 110000, 10000}, {2, 90000, 30000},
    {3, 60000, 70000}, {4, 30000, 130000}, {5, 10000, 160000}})
RETURN ADDCOLUMNS(GENERATESERIES(0, 0.30, 0.05),
    "NBD A", VAR r = [Value] RETURN SUMX(Proje, [A] / (1 + r) ^ [Yil]),
    "NBD B", VAR r = [Value] RETURN SUMX(Proje, [B] / (1 + r) ^ [Yil]))</pre>
<div class="tbl-wrap"><table>
<tr><th>Oran</th><th>%0</th><th>%5</th><th>%10</th><th>%15</th><th>%20</th><th>%25</th><th>%30</th></tr>
<tr><td>NBD A</td><td>100.000</td><td>70.741</td><td>46.159</td><td>25.280</td><td>7.375</td><td>−8.115</td><td>−21.623</td></tr>
<tr><td>NBD B</td><td>200.000</td><td>129.519</td><td>74.615</td><td>31.282</td><td>−3.331</td><td>−31.283</td><td>−54.085</td></tr>
</table></div>
<p>B'nin nakdi geç geldiği için oran yükseldikçe NBD'si çok daha hızlı düşer. İki eğri yaklaşık <b>%16,6</b>'da kesişir (Fisher kesişimi). Bu oranın altında B, üstünde A daha değerlidir. Eğrilerin sıfırı kestiği yerler iç verim oranlarıdır: A yaklaşık %22,3, B yaklaşık %19,5. İVO'su yüksek olan A, %15'te NBD'si düşük olan projedir; birbirini dışlayan projelerde karar <b>şirketin oranındaki NBD</b>'ye göre verilir. Çizgi grafikte oranı eksene, iki NBD'yi değerlere koy; sıfır çizgisini sabit çizgi olarak ekle.</p>

<h2>Duyarlılık tablosu: iki varsayımı birlikte oynatmak</h2>
<p>NBD iki varsayıma bağlı: iskonto oranı ve nakit girişlerinin tutturulup tutturulamayacağı. <code>CROSSJOIN</code> ile iki seriyi çaprazlayıp her hücrede NBD hesaplayınca bir matris görselinde okunabilen bir duyarlılık tablosu çıkar:</p>
<pre class="dax">EVALUATE
VAR Proje = DATATABLE("Yil", INTEGER, "A", DOUBLE, "B", DOUBLE, {
    {0, -200000, -200000}, {1, 110000, 10000}, {2, 90000, 30000},
    {3, 60000, 70000}, {4, 30000, 130000}, {5, 10000, 160000}})
RETURN ADDCOLUMNS(
    CROSSJOIN(
        SELECTCOLUMNS(GENERATESERIES(0.10, 0.20, 0.05), "Oran", [Value]),
        SELECTCOLUMNS(GENERATESERIES(-0.20, 0.20, 0.10), "Sapma", [Value])),
    "NBD B", VAR r = [Oran] VAR s = [Sapma]
        RETURN SUMX(Proje, IF([Yil] = 0, [B], [B] * (1 + s)) / (1 + r) ^ [Yil]))</pre>
<div class="tbl-wrap"><table>
<tr><th>Oran \\ Girişlerde sapma</th><th>−%20</th><th>−%10</th><th>0</th><th>+%10</th><th>+%20</th></tr>
<tr><td>%10</td><td>19.692</td><td>47.154</td><td>74.615</td><td>102.077</td><td>129.538</td></tr>
<tr><td>%15</td><td>−14.974</td><td>8.154</td><td>31.282</td><td>54.410</td><td>77.538</td></tr>
<tr><td>%20</td><td>−42.665</td><td>−22.998</td><td>−3.331</td><td>16.336</td><td>36.004</td></tr>
</table></div>
<p>%15'te girişler %20 eksik gelirse B'nin NBD'si negatife döner; %10'luk bir sapma ise hâlâ tolere edilir. Raporda bu tabloyu ne olur parametreleriyle (oran ve sapma dilimleyicileri) etkileşimli yapabilirsin; kalıp <b>Segmentasyon</b> ve <b>Finansal raporlama</b> derslerindekiyle aynıdır. Koşullu biçimlendirmede negatif hücreleri kırmızı, sıfıra yakın olanları sarı yapmak kararın ne kadar kırılgan olduğunu bir bakışta gösterir.</p>
`,
  ex: [
    { t: 'dax', name: 'Asit-Test Oranı', grid: [{ t: 'Tarih', c: 'Yil' }], q: '<b>Asit-Test Oranı</b>: Editörde seçili yılın (toplam satırında son yılın) yıl sonu özet bilançosu <code>B</code> olarak hazır. (Dönen varlıklar − stok) / kısa vadeli yükümlülükler oranını <code>RETURN</code> satırından sonra yaz. Sütunlar: <code>[Donen]</code>, <code>[Stok]</code>, <code>[KVY]</code>.', start: OZET_START, sol: OZET_START + 'DIVIDE(SUMX(B, [Donen]) - SUMX(B, [Stok]), SUMX(B, [KVY]))', hint: 'B tek satırlık bir tablo; değerleri SUMX ile al: DIVIDE(SUMX(B, [Donen]) - SUMX(B, [Stok]), SUMX(B, [KVY])).' },
    { t: 'dax', name: 'Özkaynak Kârlılığı', grid: [{ t: 'Tarih', c: 'Yil' }], q: '<b>Özkaynak Kârlılığı</b>: Aynı özet bilançoyla net kârın yıl sonu özkaynağa oranını (ROE) döndür. Sütunlar: <code>[NetKar]</code>, <code>[Ozkaynak]</code>.', start: OZET_START, sol: OZET_START + 'DIVIDE(SUMX(B, [NetKar]), SUMX(B, [Ozkaynak]))', hint: 'DIVIDE(SUMX(B, [NetKar]), SUMX(B, [Ozkaynak])). 2024 için 75.000 / 290.000.' },
    { t: 'dax', name: 'Stokta Kalma Günü', q: '<b>Stokta Kalma Günü</b>: Stoğun ortalama kaç günde satıldığı: 365 / stok devir hızı. Stok devir hızı = <code>[Net Maliyet]</code> / <code>[Stok Değeri]</code>. Devir hızı boşsa sonuç da boş olsun.', sol: 'DIVIDE(365, DIVIDE([Net Maliyet], [Stok Değeri]))', hint: 'İç içe iki DIVIDE: DIVIDE(365, DIVIDE([Net Maliyet], [Stok Değeri])). Dikkat: 365 günü varsayar; çok yıllı kırılımda maliyet birden fazla yılı toplar.' },
    { t: 'query', q: 'Proje B için <b>geri ödeme süresini</b> (indirgenmemiş, yıl kesirli) tek satırlık bir sonuç olarak döndür. Proje tablosu editörde hazır. Kümülatif nakdin ilk kez ≥ 0 olduğu yılı bul, bir önceki yılın açığını o yılın akışına böl.', start: 'EVALUATE\n' + PROJE, sol: 'EVALUATE\n' + PROJE + 'VAR K = ADDCOLUMNS(Proje, "Kum", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [B]))\nVAR Ilk = MINX(FILTER(K, [Kum] >= 0), [Yil])\nVAR Onceki = MAXX(FILTER(K, [Yil] = Ilk - 1), [Kum])\nVAR Akis = MAXX(FILTER(K, [Yil] = Ilk), [B])\nRETURN ROW("Geri ödeme", Ilk - 1 + DIVIDE(-Onceki, Akis))', hint: 'K = ADDCOLUMNS(Proje, "Kum", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [B])); Ilk = MINX(FILTER(K, [Kum] >= 0), [Yil]); sonuç Ilk - 1 + (-önceki kümülatif) / o yılın akışı = 3,69.' },
    { t: 'query', q: 'Proje A ve B için %15 oranla <b>kârlılık endeksini</b> tek satırda döndür: <code>"PI A"</code> ve <code>"PI B"</code>. PI = 1–5. yıl girişlerinin bugünkü değeri / 200.000.', start: 'EVALUATE\n' + PROJE, sol: 'EVALUATE\n' + PROJE + 'RETURN ROW(\n    "PI A", DIVIDE(SUMX(FILTER(Proje, [Yil] > 0), [A] / 1.15 ^ [Yil]), 200000),\n    "PI B", DIVIDE(SUMX(FILTER(Proje, [Yil] > 0), [B] / 1.15 ^ [Yil]), 200000))', hint: 'DIVIDE(SUMX(FILTER(Proje, [Yil] > 0), [A] / 1.15 ^ [Yil]), 200000); B için aynısı. Sonuçlar 1,13 ve 1,16.' },
    { t: 'query', q: 'Proje A’nın <b>NBD profilini</b> döndür: %0’dan %40’a 10 puan adımlarla oran (<code>GENERATESERIES</code>) ve her oran için <code>"NBD"</code> sütunu.', start: 'EVALUATE\n' + PROJE, sol: 'EVALUATE\n' + PROJE + 'RETURN ADDCOLUMNS(GENERATESERIES(0, 0.40, 0.10), "NBD", VAR r = [Value] RETURN SUMX(Proje, [A] / (1 + r) ^ [Yil]))', hint: 'ADDCOLUMNS(GENERATESERIES(0, 0.40, 0.10), "NBD", VAR r = [Value] RETURN SUMX(Proje, [A] / (1 + r) ^ [Yil])). Oranı VAR’a almak, SUMX içindeki [Value] karışıklığını önler.' },
    { t: 'mc', q: 'Bir şirketin net kârı 75.000 TL ama banka bakiyesi yalnızca 35.000 TL arttı. Hangisi bu farkı açıklayan bir kalem <b>olamaz</b>?', o: ['Alacakların artması', 'Stokların artması', 'Amortisman gideri', 'Duran varlık alımı'], a: 2, why: 'Amortisman nakit çıkışı olmayan bir giderdir; dolaylı yöntemde kâra geri eklenir, yani nakdi kârdan yüksek gösterir. Alacak ve stok artışı ile yatırım harcaması nakdi kârın altına çeker.' },
    { t: 'mc', q: 'Gelir tablosunda tutarı <code>Alacak − Borç</code> olarak hesaplıyorsun. Bu seçimin sonucu nedir?', o: ['Giderler pozitif, gelirler negatif çıkar', 'Ara toplamlar için işaret çevirmek gerekir', 'Bilanço hesapları da doğru işaretlenir', 'Gelirler pozitif, giderler negatif çıkar'], a: 3, why: 'Gelir hesapları alacak, gider hesapları borç bakiyesi verir. Alacak − Borç ile gelirler pozitif, giderler negatif olur; ara toplamlar basit toplamla çıkar. Bilançoda aktif ve pasif için ayrı işaret kuralı gerekir.' },
    { t: 'mc', q: 'Birbirini dışlayan A ve B projelerinde İVO’su yüksek olan A, şirketin %15 oranında NBD’si düşük olan proje. Hangisini seçmelisin?', o: ['A’yı, çünkü İVO daha yüksek', 'B’yi, %15’teki NBD daha yüksek', 'Geri ödemesi kısa olanı', 'İkisini de reddetmeyi'], a: 1, why: 'NBD profilleri kesişiyorsa İVO ile NBD farklı sıralama verebilir. Değer yaratma ölçütü şirketin kendi oranındaki NBD’dir; %15’te B daha fazla değer yaratır.' }
  ]
});
})(window);
