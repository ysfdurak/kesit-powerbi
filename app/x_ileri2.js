/* Kesit Power BI — İleri dersler genişletmesi (2): hesaplama grupları, performans, DAX optimizasyonu, kurumsal model,
   güvenlik, yayımlama, yönetişim, sayfalandırılmış raporlar, yaşam döngüsü, M dili. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, o) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('ext: ders yok', id); return; } if (o.html) l.body += '<section class="deep"><span class="eyebrow">Uzmanlaş</span>' + o.html + '</section>'; if (o.ex) l.ex = (l.ex || []).concat(o.ex); if (o.min) l.min += o.min; (W.PBI_EXT = W.PBI_EXT || []).push({ id, html: o.html || '', ex: o.ex || [] }); };

/* ===================================================================== 1. HESAPLAMA GRUPLARI */
ext('hesaplama-gruplari', { min: 22, html: `
<h2>Birden çok hesaplama grubu: öncelik (precedence)</h2>
<p>Finans müdürü iki şey istiyor: her ölçüyü <b>YTD</b> görmek ve her ölçüyü <b>gün başına</b> görmek. Ekip iki ayrı hesaplama grubu kurar: <code>Zaman</code> (Cari, GY, YTD) ve <code>Ölçek</code> (Toplam, Gün Başına). Matriste ikisinden birer öğe seçilince motor iki öğeyi iç içe uygular. Hangisinin içte, hangisinin dışta olacağını grubun <b>Öncelik</b> (Precedence) özelliği belirler.</p>
<p>Kural şudur: <b>düşük öncelikli grup içte, yüksek öncelikli grup dışta</b> çalışır. Motor en yüksek öncelikli öğeden başlar; o öğedeki <code>SELECTEDMEASURE()</code> yerine bir alttaki öğeyi koyar; en sonda gerçek ölçüye ulaşır. Ölçek grubu 10, Zaman grubu 20 ise “Gün Başına + YTD” şuna dönüşür:</p>
<pre class="dax">Günlük Ort. YTD (Zaman dışta) =
CALCULATE(DIVIDE([Net Satış], COUNTROWS(Tarih)), DATESYTD(Tarih[Tarih]))
Günlük Ort. YTD (Ortalama dışta) =
DIVIDE(CALCULATE([Net Satış], DATESYTD(Tarih[Tarih])), COUNTROWS(Tarih))</pre>
<p>Mart 2024 hücresinde ilk yazım <b>1.707,59 ₺</b> verir: Ocak–Mart toplamı, Ocak–Mart gün sayısına bölünür. Öncelikler ters verilirse ikinci yazım çalışır ve <b>5.012,60 ₺</b> çıkar: üç aylık toplam yalnızca Mart'ın 31 gününe bölünür. İki sayı da “doğru hesaplanmış” görünür; yalnızca biri iş sorusunun cevabıdır. Öncelik bir teknik ayrıntı değil, <b>iş kuralıdır</b>.</p>
<div class="tbl-wrap"><table><tr><th>Grup türü</th><th>Önerilen yer</th><th>Neden</th></tr>
<tr><td>Para birimi çevirisi, ölçek (bin/milyon), gün başına</td><td>Düşük öncelik (içte)</td><td>Önce tek tek değerler dönüşür, sonra zaman penceresi uygulanır</td></tr>
<tr><td>Zaman zekâsı (YTD, GY, YoY %)</td><td>Yüksek öncelik (dışta)</td><td>Pencere, dönüşmüş değerin tamamını sarmalı</td></tr>
<tr><td>Yalnızca biçim değiştiren grup</td><td>En yüksek</td><td>Biçim dizesinde en yüksek öncelikli grubun ifadesi kazanır</td></tr></table></div>
<p>Biçim dizeleri de öncelikle yarışır: en yüksek öncelikli grubun dinamik biçim dizesi geçerli olur; ölçünün kendi biçimi her hesaplama grubunun altında kalır. “YoY % neden ₺ ile görünüyor?” sorusunun cevabı çoğu zaman budur.</p>

<h2>ISSELECTEDMEASURE: öğeyi her ölçüye uygulama</h2>
<p>Zaman grubundaki <code>YoY %</code> öğesi <code>[Net Satış]</code> için anlamlıdır. Ama <code>[Kâr Marjı %]</code> için “marjın yüzde değişimi” çıkar: %20'den %22'ye çıkan marj “%10 büyüme” olarak görünür. Finans ise “2 puan arttı” demek ister. Metin döndüren ölçülerde (ör. <code>[Hedef Durumu]</code>, <code>[Dinamik Başlık]</code>) durum daha kötüdür: öğedeki aritmetik “metin sayıya çevrilemiyor” hatası verir.</p>
<pre class="dax" data-notry>-- Zaman grubu, "YoY" öğesi
VAR Simdi = SELECTEDMEASURE()
VAR Once  = CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Tarih[Tarih]))
RETURN
SWITCH(TRUE(),
    NOT ISNUMBER(Simdi), BLANK(),                              -- metin ölçüleri: dokunma
    ISSELECTEDMEASURE([Kâr Marjı %], [Ortalama İndirim %]), (Simdi - Once) * 100,   -- oranlar: puan farkı
    DIVIDE(Simdi - Once, Once))                                 -- tutarlar: yüzde değişim

-- Aynı öğenin dinamik biçim dizesi
IF(ISSELECTEDMEASURE([Kâr Marjı %], [Ortalama İndirim %]), "+0.0"" puan"";-0.0"" puan""", "+0.0%;-0.0%")</pre>
<p><code>ISSELECTEDMEASURE</code> ölçüye <b>başvuru</b> alır; ölçü yeniden adlandırılınca başvuru da güncellenir. <code>SELECTEDMEASURENAME() = "Kâr Marjı %"</code> gibi metin karşılaştırması da çalışır, ama ilk yeniden adlandırmada sessizce bozulur. <code>SELECTEDMEASUREFORMATSTRING()</code> ise “ölçünün kendi biçimini koru” demenin yoludur; Cari ve GY öğelerinin biçim dizesine bunu yazarsan ₺ ölçüler ₺, adet ölçüleri adet kalır.</p>

<h2>Seçim ifadeleri: çoklu ya da boş seçim</h2>
<p>Bir dilimleyiciden aynı gruptan iki öğe seçildiğinde ne olur? Hesaplama öğesi yalnızca bağlamda <b>tek öğe</b> varken uygulanır. Varsayılan davranışta iki öğe seçilirse grup hiç uygulanmaz ve ölçü olduğu gibi görünür. Kullanıcı “YTD ve GY” seçtiğini sanırken çıplak cari değeri görür. Bunu iki isteğe bağlı grup özelliği yönetir:</p>
<div class="tbl-wrap"><table><tr><th>Durum</th><th>İfade tanımlı değilse</th><th>Tanımlıysa</th></tr>
<tr><td>Tek öğe seçili</td><td>Öğe uygulanır</td><td>Öğe uygulanır</td></tr>
<tr><td>Birden çok öğe ya da çakışan seçim</td><td>Grup uygulanmaz</td><td><code>multipleOrEmptySelectionExpression</code> sonucu</td></tr>
<tr><td>Grup hiç filtrelenmemiş</td><td>Grup uygulanmaz</td><td><code>noSelectionExpression</code> sonucu</td></tr></table></div>
<p>Para birimi grubunda tipik kullanım: hiçbir şey seçilmemişse TL göster (<code>noSelectionExpression</code>), iki para birimi seçilmişse sayı yerine BLANK döndür ve biçim dizesinde “Tek para birimi seç” yaz. Yanlış rakam göstermek, boş göstermekten her zaman daha pahalıdır.</p>

<h2>Yan etkiler: grup eklenince neler değişir?</h2>
<ul>
<li><b>Örtük ölçüler kapanır.</b> Modelde “örtük ölçüleri engelle” (Discourage implicit measures) açılır; sütunların yanındaki Σ kaybolur, <code>Satislar[Tutar]</code> artık değer alanına sürüklenemez. Var olan görseller çalışmaya devam eder, ama rapor yazarları için her toplam açık bir ölçü olmalıdır.</li>
<li><b>Tüm ölçüler “variant” türüne geçer.</b> Rapor tarafında ölçünün veri türü sabit değildir. Bir ölçünün dinamik biçim dizesini başka yerde yeniden kullanıyorsan hata görebilirsin; ifadeyi <code>FORMAT(…, "")</code> ile sarmak çözüm yoludur.</li>
<li><b>Güvenlik:</b> Hesaplama grubu tablosuna RLS ya da OLS tanımlanamaz. Güvenlik diğer tablolarda kalır (Satır ve nesne düzeyinde güvenlik dersi).</li>
<li><b>Aynı gruptan iki öğe birleşmez.</b> “GY'nin YTD'si” tek gruptan iki öğeyle yapılamaz; ya iki ayrı grup ya da öğe içinde yan özyineleme (sideways recursion): öğe, <code>CALCULATE(SELECTEDMEASURE(), Zaman[Hesap] = "GY")</code> ile kardeş öğeyi çağırabilir.</li>
<li><b>Ölçü içinden çağırma:</b> <code>CALCULATE([Net Satış], Zaman[Hesap] = "YTD")</code> geçerlidir. Bu, “YTD Satış” ölçüsünü ayrıca yazmadan bir kart görseline koymanın yoludur.</li>
</ul>

<h2>Alan parametresiyle birlikte kullanmak</h2>
<p>Yönetim panosunda kullanıcı bir dilimleyiciden ölçüyü seçer (Net Satış, Brüt Kâr, Sipariş Sayısı); matrisin sütunlarında Zaman grubunun öğeleri durur. Ölçü seçiciyi alan parametresi (field parameter), varyasyonları hesaplama grubu sağlar: 3 ölçü × 3 öğe için tek ölçü yazmazsın. Dikkat edilecekler:</p>
<ul>
<li>Alan parametresinde örtük ölçü kullanılamaz; zaten hesaplama grubu da bunu istemez.</li>
<li>Alan parametresi dilimleyicisinde hiçbir şey seçmemek “hepsi seçili” demektir; görsel birden çok ölçüyle dolar. Dilimleyiciyi “tek seçim” yap.</li>
<li>Biçim: Zaman grubunun YoY öğesi biçimi ezer; kart başlığında ölçü adını göstermek için parametre tablosunun görünen ad sütununu kullan.</li>
</ul>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Ne zaman?</th><th>Bakım</th><th>Dikkat</th></tr>
<tr><td>Hesaplama grubu</td><td>Aynı dönüşüm birçok ölçüye uygulanacaksa</td><td>Tek yerde; yeni ölçü kendiliğinden kapsanır</td><td>Öncelik, variant tür, örtük ölçüler</td></tr>
<tr><td>Alan parametresi</td><td>Kullanıcı ölçü ya da eksen seçecekse</td><td>Kolay; Desktop arayüzü</td><td>Boş seçim = hepsi</td></tr>
<tr><td>SWITCH ölçüsü (<code>[Seçili Görünüm]</code>)</td><td>Az sayıda, özel mantık</td><td>Her ölçü için ayrı dal</td><td>Dallar çoğaldıkça okunmaz olur</td></tr>
<tr><td>Görsel hesaplama</td><td>Tek görsele özel kümülatif/fark</td><td>Yalnızca o görselde</td><td>Başka görselde yeniden kullanılamaz</td></tr></table></div>

<h2>Test etmek: önce sorguyla, sonra görselle</h2>
<p>Hesaplama grubunu yayımlamadan önce DAX sorgu görünümünde (DAX query view) yıl × öğe ızgarası çıkar ve bilinen sayılarla karşılaştır. Bu oyun alanında aynı fikri <code>Gorunum</code> tablosu ve <code>[Seçili Görünüm]</code> ölçüsüyle deneyebilirsin:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(Tarih[Yil], Gorunum[Gorunum], "Değer", [Seçili Görünüm])</pre>
<p>Sonuçta iki sağlama hemen görünür. Yıl düzeyinde <b>YTD = Cari</b> olmalı: 2024 için ikisi de 747.065,70 ₺. <b>2024'ün GY'si = 2023'ün Carisi</b> olmalı: 400.869,55 ₺. 2022'de GY ve YoY % satırı hiç gelmez, çünkü önceki yıl yok; BLANK olan satırı SUMMARIZECOLUMNS atar. Bu üç kural tutmuyorsa öğede ya da tarih tablosunda sorun vardır.</p>
<div class="tip"><b>Kontrol listesi</b>Her grup için öncelik yazılı mı ve gerekçesi belgelendi mi? · Oran ve metin ölçüleri ISSELECTEDMEASURE / ISNUMBER ile korunuyor mu? · Çoklu seçim ve boş seçim ifadeleri tanımlı mı? · Yıl düzeyinde YTD = Cari, GY = önceki yılın Carisi sağlaması yapıldı mı? · Rapor yazarlarına “Σ artık yok, açık ölçü kullan” notu iletildi mi?</div>
`, ex: [
  { t: 'mc', q: `İki hesaplama grubu var: <code>Ölçek</code> (öncelik 20, “Gün Başına” öğesi) ve <code>Zaman</code> (öncelik 10, “YTD” öğesi). Mart 2024 hücresinde “Gün Başına + YTD” 5.012,60 ₺ çıkıyor; finans Ocak–Mart günlük ortalamasını, 1.707,59 ₺'yi bekliyor. Ne yaparsın?`,
    o: [`Ölçek grubunun önceliğini Zaman'ın üstüne bir kat daha çıkarırım`, `Zaman grubunun önceliğini Ölçek'ten yüksek yaparım`, `Gün Başına öğesinde COUNTROWS yerine DISTINCTCOUNT kullanırım`, `İki öğeyi aynı grupta toplayıp birlikte seçtiririm`], a: 1,
    why: `Yüksek öncelikli grup dışta çalışır. YTD'nin bölmeyi sarması için Zaman grubu daha yüksek öncelikte olmalı; şu an Ölçek dışta olduğu için üç aylık toplam Mart'ın gün sayısına bölünüyor. Ölçeği daha da yükseltmek sorunu büyütür; DISTINCTCOUNT gün sayısını değiştirmez; aynı gruptan iki öğe birlikte uygulanmaz.` },
  { t: 'mc', q: `Zaman grubundaki YoY öğesi <code>[Kâr Marjı %]</code> için %20 → %22 değişimini “%10” gösteriyor. Finans “+2 puan” görmek istiyor ve ölçü adları sık değişiyor. En sağlam çözüm hangisi?`,
    o: [`Öğede SELECTEDMEASURENAME() sonucunu "Kâr Marjı %" metniyle karşılaştırmak`, `Kâr Marjı % ölçüsünün biçim dizesini yüzde yerine ondalık sayıya çevirmek`, `Öğede ISSELECTEDMEASURE([Kâr Marjı %]) ile oranları ayırıp fark döndürmek`, `Oran ölçüleri için önceliği 0 olan ikinci bir zaman grubu kurmak`], a: 2,
    why: `ISSELECTEDMEASURE ölçüye başvuru aldığı için yeniden adlandırmaya dayanıklıdır ve oranlarda puan farkını, tutarlarda yüzde değişimi döndürmeyi sağlar. Ad metniyle karşılaştırma ilk yeniden adlandırmada bozulur. Biçimi değiştirmek hesabı düzeltmez. İkinci grup aynı ölçüye iki kez uygulanır ve sorunu çözmez.` },
  { t: 'mc', q: `Modele hesaplama grubu eklendikten sonra bir rapor yazarı, <code>Satislar[Adet]</code> sütununu tablo görseline değer olarak sürükleyemediğini söylüyor. Eski görseller ise çalışıyor. Ne yaparsın?`,
    o: [`Hesaplama grubunu silip örtük ölçülere izin veririm`, `Adet sütununun veri türünü ondalık sayıya çeviririm`, `Açık bir adet ölçüsü yazıp onu kullandırırım`, `Sütunun “Özetleme” özelliğini Toplam olarak yeniden ayarlarım`], a: 2,
    why: `Hesaplama grubu örtük ölçüleri kapatır; Σ kaybolur ama eski görseller çalışır. Kalıcı çözüm açık ölçüdür (modelde [Satılan Adet] zaten var). Grubu silmek tüm varyasyonları kaybettirir; veri türü ya da özetleme ayarı örtük ölçü engelini kaldırmaz.` },
  { t: 'mc', q: `Kullanıcılar para birimi hesaplama grubunun dilimleyicisinde hem USD hem EUR seçince tablonun sessizce TL tutarlara döndüğünü fark ediyor. Kimse bunu fark etmeden sunum yapılmış. Kalıcı çözüm?`,
    o: [`Çoklu seçim ifadesi tanımlayıp BLANK ve uyarı döndürmek`, `Dilimleyiciyi “Tümünü seç” seçeneği kapalı olacak şekilde ayarlamak`, `Para birimi öğelerinin önceliğini Zaman grubundan düşük tutmak`, `Raporun üstüne “tek para birimi seçin” metin kutusu eklemek`], a: 0,
    why: `İki öğe seçilince grup uygulanmaz ve çıplak TL değeri görünür. multipleOrEmptySelectionExpression bu durumda ne döneceğini belirler; yanlış sayı yerine boş ve açıklayıcı biçim göstermek en güvenlisidir. “Tümünü seç”i kapatmak çoklu seçimi engellemez; öncelik başka bir konudur; metin kutusu kuralı uygulatmaz.` },
  { t: 'dax', name: 'Brüt Kâr GY (Öğe Benzetimi)', q: `<b>Brüt Kâr GY (Öğe Benzetimi)</b>: Zaman grubundaki “GY” öğesi <code>[Brüt Kâr]</code> ölçüsüne uygulandığında ne döndürürse onu veren bir ölçü yaz. <code>SELECTEDMEASURE()</code> yerine ölçünün kendisini koy.`,
    sol: `CALCULATE([Brüt Kâr], SAMEPERIODLASTYEAR(Tarih[Tarih]))`, hint: `Öğe: CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Tarih[Tarih])). SELECTEDMEASURE() yerine [Brüt Kâr] yaz.` },
  { t: 'dax', name: 'Günlük Ort. Satış YTD', q: `<b>Günlük Ort. Satış YTD</b>: “Gün Başına” grubu içte, Zaman grubu dışta çalıştığında oluşan ifadeyi yaz: yılbaşından bugüne net satışın, yılbaşından bugüne gün sayısına bölümü.`,
    sol: `CALCULATE(DIVIDE([Net Satış], COUNTROWS(Tarih)), DATESYTD(Tarih[Tarih]))`, hint: `Dıştaki öğe (YTD) içteki öğenin (DIVIDE(…, COUNTROWS(Tarih))) tamamını sarar: CALCULATE(DIVIDE(...), DATESYTD(...)).` },
  { t: 'query', q: `Hesaplama grubu testi gibi düşün: <b>yalnızca 2024 yılı</b> için <code>Gorunum[Gorunum]</code> öğelerini ve her öğede <code>[Seçili Görünüm]</code> değerini “Değer” sütununda döndüren bir sorgu yaz. YTD ile Cari aynı çıkmalı.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nCALCULATETABLE(\n    SUMMARIZECOLUMNS(Gorunum[Gorunum], "Değer", [Seçili Görünüm]),\n    Tarih[Yil] = 2024\n)`, hint: `SUMMARIZECOLUMNS(Gorunum[Gorunum], "Değer", [Seçili Görünüm]) ifadesini CALCULATETABLE(..., Tarih[Yil] = 2024) ile sar.` }
] });

/* ===================================================================== 2. PERFORMANS */
ext('performans', { min: 22, html: `
<h2>Bir sütunun bedelini ölçmek: kardinalite</h2>
<p>Anadolu Market'in modeli büyüdükçe dosya şişiyor ve yenileme uzuyor. İlk soru “hangi tablo büyük?” değil, “<b>hangi sütun</b> pahalı?” olmalı. VertiPaq her sütunu ayrı sıkıştırır; bir sütunun boyutunu en çok farklı değer sayısı (kardinalite) belirler. Bunu ölçmenin en hızlı yolu tek satırlık bir sorgudur:</p>
<pre class="dax">EVALUATE
ROW(
    "SatirNo",   DISTINCTCOUNT(Satislar[SatirNo]),
    "SiparisNo", DISTINCTCOUNT(Satislar[SiparisNo]),
    "Tarih",     DISTINCTCOUNT(Satislar[Tarih]),
    "Tutar",     DISTINCTCOUNT(Satislar[Tutar]),
    "MusteriNo", DISTINCTCOUNT(Satislar[MusteriNo]),
    "UrunNo",    DISTINCTCOUNT(Satislar[UrunNo]),
    "Durum",     DISTINCTCOUNT(Satislar[Durum]),
    "Kanal",     DISTINCTCOUNT(Satislar[Kanal])
)</pre>
<p>1.620 satırlık <code>Satislar</code> tablosunda sonuç: SatirNo 1.620, SiparisNo 910, Tarih 533, Tutar 357, MusteriNo 136, UrunNo 38, Durum 4, Kanal 3. <code>SatirNo</code> her satırda farklıdır: sözlüğü tablo kadar büyüktür ve art arda tekrar olmadığı için tekrar uzunluğu kodlaması (RLE) hiçbir şey kazandırmaz. <code>Kanal</code> ise 3 değerle neredeyse bedavadır. Gerçek bir modelde aynı oranlar milyonlarca satırla çarpılır.</p>
<div class="tbl-wrap"><table><tr><th>Sütun tipi</th><th>Tipik kardinalite</th><th>Karar</th></tr>
<tr><td>Satır kimliği, GUID, açıklama metni</td><td>Satır sayısı kadar</td><td>Raporda kullanılmıyorsa kaldır; detay gerekiyorsa ayrı bir detay sorgusu/sayfalandırılmış rapor</td></tr>
<tr><td>Sipariş no, fatura no</td><td>Yüksek</td><td>Sayım için gerekliyse tut (<code>[Sipariş Sayısı]</code>), metin değil tam sayı olsun</td></tr>
<tr><td>Tarih-saat</td><td>Çok yüksek</td><td>Tarih ve saat olarak böl, saniyeyi at</td></tr>
<tr><td>Tutar, fiyat</td><td>Orta-yüksek</td><td>Gereksiz ondalığı azalt; satırda hesaplanabiliyorsa (Adet × Fiyat) iki ucu tut, sonucu ölçüde hesapla</td></tr>
<tr><td>Kanal, durum, kategori</td><td>Çok düşük</td><td>Sorun değil</td></tr></table></div>
<p>Tam sayı sütunları sözlük yerine <b>değer kodlaması</b> (value encoding) ile de saklanabilir; metin anahtar yerine tam sayı anahtar bu yüzden ucuzdur. Satır sırası da önemlidir: aynı değerler art arda geldikçe RLE daha iyi çalışır. VertiPaq sıralamayı kendisi seçer; sen kardinaliteyi düşürmeye odaklan.</p>

<h2>Tarih-saat ve ondalık: kardinaliteyi kırmak</h2>
<p>Saniye hassasiyetindeki bir zaman damgası bir yılda 31.536.000 farklı değer alabilir. Aynı bilgi <b>tarih</b> (365 değer) ve <b>dakika düzeyinde saat</b> (1.440 değer) olarak iki sütuna bölünürse toplam farklı değer 1.805'e iner. Bu oyun alanının <code>WebOlaylari</code> tablosu bu yüzden <code>Tarih</code> ve <code>Saat</code> sütunlarını ayrı tutar. Bölmeyi Power Query'de yap; DAX hesaplanmış sütunuyla bölersen orijinal sütun modelde kalır ve kazanç olmaz.</p>
<p>Ondalık sayılarda da benzer bir kazanç vardır. Kuruş hassasiyeti yeten bir tutarı “Sabit ondalık sayı” (Fixed decimal) türüne almak hem boyutu hem kayan nokta yuvarlama sürprizlerini azaltır. Oran sütunlarını (ör. 0,1537291) iki-dört basamağa yuvarlamak kardinaliteyi ciddi düşürür; ama yuvarlamayı iş biriminin onayıyla yap.</p>

<h2>Otomatik tarih/saat: görünmeyen tablolar</h2>
<p>Otomatik tarih/saat açıkken Power BI modeldeki <b>her tarih sütunu</b> için gizli bir tarih tablosu oluşturur. Bu modelde <code>Satislar[Tarih]</code>, <code>Satislar[TeslimTarihi]</code>, <code>Musteriler[KayitTarihi]</code>, <code>Musteriler[IlkSiparis]</code>, <code>Calisanlar[IseGiris]</code>, projelerin üç tarih sütunu… her biri ayrı bir gizli tablo demektir. Her gizli tablo, sütundaki en eski ve en yeni yılı tam yıllarla kapsar; 1950 doğumlu bir kayıt varsa 70 yıllık bir tablo oluşur.</p>
<ul>
<li><b>Kapatma yolu:</b> Dosya → Seçenekler ve ayarlar → Seçenekler → <b>Geçerli Dosya → Veri Yükü</b> → Otomatik tarih/saat. Yeni dosyalar için <b>Genel</b> bölümündeki aynı ayarı da kapat.</li>
<li><b>Önce:</b> kendi <code>Tarih</code> tablon “Tarih tablosu olarak işaretle” (Mark as date table) ile işaretlenmiş olmalı.</li>
<li><b>Yan etki:</b> otomatik hiyerarşiyi (<code>Tarih.Yıl</code>, <code>Tarih.Ay</code>) kullanan görseller bozulur; bunları <code>Tarih</code> tablosunun sütunlarıyla yeniden kur. Hızlı ölçüler de otomatik hiyerarşiye yazılmışsa gözden geçir.</li>
</ul>

<h2>Performans Analizi'ni okumak</h2>
<p>Performans Analizi (Performance analyzer) her görsel için üç süre verir. Kaydı başlat, <b>Görselleri yenile</b> de ve yavaş görseli aç:</p>
<div class="tbl-wrap"><table><tr><th>Yüksek olan</th><th>Anlamı</th><th>İlk bakılacak yer</th></tr>
<tr><td>DAX sorgusu</td><td>Model ya da ölçü yavaş</td><td>Sorguyu kopyala, DAX Studio'da Server Timings (DAX optimizasyonu dersi)</td></tr>
<tr><td>Görsel görüntüleme</td><td>Çizim yavaş: çok nokta, ağır özel görsel, çok satırlı tablo</td><td>Nokta sayısını azalt, ilk N, özet görsel + detay sayfası</td></tr>
<tr><td>Diğer</td><td>Görsel sırasını bekliyor; sayfadaki başka görseller önce çalışıyor</td><td>Sayfadaki görsel sayısını azalt</td></tr></table></div>
<p>İlk ölçüm soğuk önbellekle yapılmadıysa sayılar yanıltır: ikinci yenilemede DAX süresi önbellekten gelir. Yavaş görselin süresini en az iki kez, aynı koşulla ölç.</p>
<h3>Sayfa ve görsel sayısı</h3>
<p>Her görsel en az bir sorgu gönderir; dilimleyiciler, kartlar ve metin kutusundaki dinamik başlıklar dahil. 30 görselli bir sayfada her biri 80 ms bile sürse sorgular sırayla beklediği için kullanıcı birkaç saniye bekler; Performans Analizi'nde bu bekleme “Diğer” sütununda birikir. Altı ayrı kart yerine çok değerli tek bir kart, on dilimleyici yerine filtre bölmesi, ayrıntı için ikinci bir sayfa kullan. Çapraz filtreleme her tıklamada sayfadaki tüm görselleri yeniden sorgulatır: gereksiz etkileşimleri “Etkileşimleri düzenle” ile kapat. Dilimleyicileri “Uygula” düğmesine bağlamak için Seçenekler → Geçerli Dosya → <b>Sorgu azaltma</b> (Query reduction) ayarlarını kullan.</p>

<h2>Anti-kalıp: her soruya hesaplanmış sütun</h2>
<p>“Hafta sonu satışı” istenince sık görülen çözüm, <code>Satislar</code>'a <code>HaftaSonuMu</code> hesaplanmış sütunu eklemektir. Bu sütun her yenilemede yeniden hesaplanır, olgu tablosunda yer kaplar ve <code>Tarih</code> tablosunda zaten olan bilgiyi kopyalar.</p>
<pre class="dax" data-notry>-- Kaçın: olgu tablosunda hesaplanmış sütun
HaftaSonuMu = RELATED(Tarih[HaftaSonu])</pre>
<p>Doğru yer boyut tablosudur: <code>Tarih[HaftaSonu]</code> 1.096 satırda yaşar, filtre ilişki üzerinden <code>Satislar</code>'a iner. Ölçüde yalnızca bir sütun filtresi yazılır ve sonuç (bu modelde hafta sonları 341.997,65 ₺ net satış) aynı çıkar. Kural: <b>Satır başına bilgi boyuttan geliyorsa boyutta kalsın; olguda yalnızca anahtarlar ve sayılar dursun.</b></p>
<div class="tip"><b>Kontrol listesi (sırayla)</b>1. Kullanılmayan sütunları kaldır (en büyük kazanç). 2. Yüksek kardinaliteli sütunları böl ya da yuvarla. 3. Otomatik tarih/saati kapat. 4. Olgu tablosundaki hesaplanmış sütunları boyuta, Power Query'ye ya da ölçüye taşı. 5. Sayfadaki görsel sayısını ve etkileşimleri azalt. 6. Ancak bundan sonra tek tek ölçüleri optimize et.</div>
`, ex: [
  { t: 'mc', q: `Performans Analizi'nde 1.600 noktalı bir dağılım grafiği için DAX sorgusu 60 ms, Görsel görüntüleme 2.300 ms, Diğer 40 ms görünüyor. Ekip ölçüyü yeniden yazmayı öneriyor. Ne dersin?`,
    o: [`Ölçü yavaş; değişkenlerle yeniden yazmak gerekir`, `Sorun çizimde; nokta sayısını ya da görseli değiştir`, `Sayfadaki diğer görseller bu görseli bekletiyor`, `Önbellek soğuk; ikinci ölçüm gereksiz`], a: 1,
    why: `Sürenin neredeyse tamamı görsel görüntülemede; DAX yalnızca 60 ms. Ölçüyü yeniden yazmak bir şey kazandırmaz. Bekleme olsaydı “Diğer” yüksek olurdu. Nokta sayısını azaltmak (özetleme, örnekleme, farklı görsel) doğru adımdır.` },
  { t: 'mc', q: `Yönetim sayfasında 28 görsel var: 12 kart, 8 dilimleyici, 8 grafik. Her görselin DAX süresi 100 ms'nin altında ama sayfa 4 saniyede açılıyor ve çoğu görselde “Diğer” süresi yüksek. İlk ne yaparsın?`,
    o: [`Görsel sayısını azaltır, kartları birleştiririm`, `Bütün ölçüleri VAR kullanacak şekilde yeniden yazarım`, `Modeli DirectQuery'den Import'a geçiririm`, `Dilimleyicileri hiyerarşik dilimleyiciye çeviririm`], a: 0,
    why: `“Diğer” süresi, görselin sırasını beklediği zamandır; sorun ölçüler değil, sorgu sayısıdır. Görsel sayısını azaltmak doğrudan bekleme süresini düşürür. Ölçüler zaten hızlı; depolama modu bilgisi soruda yok; hiyerarşik dilimleyici sorgu sayısını anlamlı azaltmaz.` },
  { t: 'mc', q: `Otomatik tarih/saati kapatmak istiyorsun. Model kendi <code>Tarih</code> tablosuna sahip ve işaretli. Kapatmadan önce neyi kontrol etmelisin?`,
    o: [`Tarih tablosunun Import modunda olup olmadığını`, `Bütün tarih sütunlarının metne çevrilmiş olduğunu`, `Otomatik Yıl/Ay hiyerarşisini kullanan görselleri`, `Tarih tablosunun 1900 yılından başlayıp başlamadığını`], a: 2,
    why: `Ayar kapanınca gizli tarih tabloları ve otomatik hiyerarşi kaybolur; onları kullanan görseller ve hızlı ölçüler bozulur, Tarih tablosunun sütunlarıyla yeniden kurulmalıdır. Depolama modu, metne çevirme ya da 1900 başlangıcı bu kararla ilgili değildir.` },
  { t: 'mc', q: `Olgu tablosunda her satırda farklı olan <code>SatirNo</code> sütunu var. Raporlarda hiçbir görselde, ölçüde ya da ilişkide kullanılmıyor; denetim ekibi nadiren tek bir satırı arıyor. Ne yaparsın?`,
    o: [`Sütunu gizlerim; gizli sütun yer kaplamaz`, `Sütunu metin türüne çeviririm; sözlükte daha iyi sıkışır`, `Sütunu tutar ama tabloyu SatirNo'ya göre sıralarım`, `Modelden kaldırır, denetime ayrıntı raporu sunarım`], a: 3,
    why: `Benzersiz bir sütun modelde en pahalı sütunlardandır ve gizlemek yer kazandırmaz. Metin türü daha da pahalıdır. Sıralama tek başına sözlük boyutunu küçültmez. Kullanılmıyorsa kaldırmak, nadir ihtiyaç için kaynağa giden ayrıntı raporu sunmak doğru dengedir.` },
  { t: 'dax', name: 'Hafta İçi Net Satışı', q: `<b>Hafta İçi Net Satışı</b>: Olgu tablosuna hesaplanmış sütun eklemeden, hafta içi günlerinin net satışını veren ölçüyü yaz. <code>Tarih[HaftaSonu]</code> sütunu "Evet" / "Hayır" değerleri alır.`,
    sol: `CALCULATE([Net Satış], Tarih[HaftaSonu] = "Hayır")`, hint: `Bilgi boyut tablosunda: CALCULATE([Net Satış], Tarih[HaftaSonu] = "Hayır"). Filtre ilişki üzerinden Satislar'a iner.` },
  { t: 'dax', name: 'Uzun Kargolu Net Satış', q: `<b>Uzun Kargolu Net Satış</b>: Kargo süresi 5 günden uzun olan satırların net satışı. “GecikmeliMi” diye hesaplanmış sütun yazmadan, var olan <code>Satislar[KargoGun]</code> sütunuyla yaz.`,
    sol: `CALCULATE([Net Satış], Satislar[KargoGun] > 5)`, hint: `Sayısal sütun üzerinde doğrudan filtre: CALCULATE([Net Satış], Satislar[KargoGun] > 5).` },
  { t: 'query', q: `Boyut tablosunun maliyetini ölç: <code>Musteriler</code> tablosundaki <code>MusteriNo</code>, <code>Sehir</code> ve <code>Segment</code> sütunlarının farklı değer sayılarını tek satırda döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nROW(\n    "MusteriNo", DISTINCTCOUNT(Musteriler[MusteriNo]),\n    "Sehir", DISTINCTCOUNT(Musteriler[Sehir]),\n    "Segment", DISTINCTCOUNT(Musteriler[Segment])\n)`, hint: `ROW("Ad", ifade, "Ad2", ifade2, ...) tek satırlık tablo üretir; her sütun için DISTINCTCOUNT(Musteriler[...]).` }
] });

/* ===================================================================== 3. DAX OPTİMİZASYONU */
ext('dax-opt', { min: 24, html: `
<h2>Server Timings'i okumak: bir ekranı adım adım yorumla</h2>
<p>Bir matris 3 saniyede açılıyor. Performans Analizi'nden sorguyu kopyaladın, DAX Studio'da <b>Clear Cache</b> sonrası <b>Server Timings</b> açıkken çalıştırdın. Aşağıdaki değerler örnek bir ekrandır (bu modelden ölçülmüş değil); amaç okumayı öğrenmek:</p>
<div class="tbl-wrap"><table><tr><th>Alan</th><th>Örnek değer</th><th>Nasıl okunur?</th></tr>
<tr><td>Total</td><td>3.050 ms</td><td>Sorgunun toplam süresi</td></tr>
<tr><td>FE</td><td>2.700 ms (%89)</td><td>Formül motoru tek iş parçacığında çalışıyor; asıl yük burada</td></tr>
<tr><td>SE</td><td>350 ms (%11)</td><td>Depolama motorunda geçen süre</td></tr>
<tr><td>SE CPU</td><td>1.400 ms</td><td>SE CPU / SE ≈ 4: tarama paralel çalışmış, SE sağlıklı</td></tr>
<tr><td>SE Queries</td><td>612</td><td>Çok sayıda küçük SE sorgusu: yineleyici içinde bağlam geçişi</td></tr>
<tr><td>SE Cache</td><td>540</td><td>Sorguların çoğu önbellekten geldi; aynı veri tekrar tekrar isteniyor</td></tr></table></div>
<p>Bu tablo tek başına bir teşhis koyar: <b>işin çoğu FE'de, SE sorguları çok ve küçük</b>. Neden genellikle bir yineleyicinin her satırında ölçü çağrılmasıdır. Sonraki adım sorgu listesine bakmaktır: her xmSQL satırında döndürülen satır sayısı (Rows) ve boyut (KB) yazar. Tek bir sorgu 1,6 milyon satır döndürüyorsa sorun <b>materyalizasyondur</b>: SE büyük bir ara tabloyu FE'ye taşımıştır. xmSQL metninde <code>CallbackDataID</code> görüyorsan SE satır satır FE'ye geri çağırma yapıyordur.</p>
<p><b>Query Plan</b> sekmesinde mantıksal ve fiziksel plan vardır. Fiziksel planda büyük “Records” sayılı <i>Spool</i> satırları, FE'nin bellekte tuttuğu ara sonuçlardır. Hedef: az sayıda SE sorgusu, küçük ara sonuçlar, callback yok.</p>

<h2>Sütun filtresi, KEEPFILTERS ve FILTER(tablo): hız ve anlam birlikte</h2>
<p>Pazarlama bir “Web Satışı” ölçüsü istiyor ve onu Kanal satırlı bir matrise koyacak. Üç yazımın hızı ve <b>sonucu</b> farklıdır:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Satislar[Kanal],
    "Net Satış", [Net Satış],
    "Sütun filtresi", CALCULATE([Net Satış], Satislar[Kanal] = "Web"),
    "KEEPFILTERS", CALCULATE([Net Satış], KEEPFILTERS(Satislar[Kanal] = "Web"))
)</pre>
<p>Web satırında üçü de 457.330,90 ₺ verir. Mobil satırında ise sütun filtresi yine <b>457.330,90 ₺</b> gösterir: <code>Satislar[Kanal] = "Web"</code>, satırdan gelen “Kanal = Mobil” filtresinin <b>üzerine yazar</b>. KEEPFILTERS iki filtreyi kesiştirir; Mobil ve Mağaza satırları boş kalır. İkisi de SE'de çözülür, hız aynıdır; fark tamamen anlamdadır.</p>
<p>Üçüncü yol <code>FILTER(Satislar, Satislar[Kanal] = "Web")</code> yazmaktır. Bu, olgu tablosunu satır satır dolaşıp tüm sütunlarıyla bir tablo filtresi üretir. Büyük tabloda materyalizasyon demektir ve filtre genişletilmiş tablonun bütün sütunlarına uygulanır; sonucu tahmin etmek zorlaşır. Kural: <b>tek sütun koşulu → sütun filtresi; mevcut seçime saygı → KEEPFILTERS; FILTER yalnızca ölçüye dayalı koşulda ve küçük bir tablo üzerinde</b> (ör. <code>FILTER(VALUES(Urunler[UrunNo]), [Net Satış] &gt; 5000)</code>).</p>
<div class="warn"><b>Modeldeki örnek</b>Hazır <code>[Net Satış]</code> ölçüsü <code>Satislar[Durum] &lt;&gt; "İptal"</code> sütun filtresiyle yazılmıştır. Bu yüzden Durum satırlı bir tabloda <b>her satırda 1.250.772,45 ₺</b> görünür; İptal satırı dahil. Aynı ölçü KEEPFILTERS ile yazılsaydı İptal satırı boş, Teslim Edildi 1.049.627,00 ₺ olurdu. Ölçüyü hangi sütunlarla kesileceğini düşünerek yaz.</div>

<h2>IF, SWITCH ve kısa devre</h2>
<p>Motor, IF ve SWITCH'te çoğu zaman yalnızca gereken dalı hesaplar. Ama koşul satıra bağlıysa ve bir yineleyicinin içindeyse, SE her iki dalın verisini önceden toplayabilir. Bu bir hata değildir; bazen tek bir geniş SE sorgusu, satır başına küçük sorgulardan hızlıdır. <code>IF.EAGER</code> bu davranışı bilerek ister. Kendi tarafında yapabileceğin iki şey var:</p>
<ul>
<li><b>Ucuz kontrolü öne al:</b> <code>IF(ISBLANK([Net Satış]), BLANK(), &lt;pahalı ifade&gt;)</code>. Satışı olmayan hücrelerde pahalı kısım hesaplanmaz; ayrıca boş satırlar matristen düşer.</li>
<li><b>SWITCH(TRUE(), …) sırası:</b> En sık doğru olan koşulu ilk sıraya koy; koşullarda ölçü değil, değişken kullan.</li>
</ul>
<p>Tersi de bir anti-kalıptır: <code>IF([Net Satış] &gt; 0, [Net Satış], 0)</code> gibi “boş yerine 0” yazımları, satışı olmayan her ürün-gün bileşimini görünür kılar. Matris 40 ürün × 1.096 gün = 43.840 satıra çıkabilir ve yavaşlık DAX'tan değil, sıfırların kendisinden gelir.</p>

<h2>DISTINCTCOUNT'un bedeli</h2>
<p><code>[Müşteri Sayısı]</code> ve <code>[Sipariş Sayısı]</code> DISTINCTCOUNT kullanır. Farklı sayım <b>toplanamaz</b>: ayların müşteri sayılarını toplayıp yıl bulamazsın, çünkü aynı müşteri birden çok ayda alışveriş yapar. Bu yüzden motor her hücre için sütunun sözlüğünü yeniden tarar; kardinalite yükseldikçe maliyet artar. Toplama tabloları da çoğu zaman farklı sayımı karşılayamaz.</p>
<ul>
<li><code>COUNTROWS(VALUES(Satislar[MusteriNo]))</code> aynı sonucu (bu modelde 136) verir ve çoğu zaman aynı planı üretir; tek başına hızlandırmaz.</li>
<li>Asıl kazanç kardinaliteden gelir: birleştirilmiş metin anahtar (“Musteri-Urun”) üzerinde farklı sayım yerine iki tam sayı sütun ya da önceden hesaplanmış bir anahtar kullan.</li>
<li>DirectQuery'de yaklaşık sayım (<code>APPROXIMATEDISTINCTCOUNT</code>) kaynağa itilebilir; “yaklaşık” olduğu raporda belirtilmeli. Bu oyun alanının motorunda yoktur.</li>
</ul>

<h2>Değişken: bir kez hesapla, ama doğru yerde</h2>
<p>Değişken tanımlandığı yerdeki bağlamda <b>bir kez</b> hesaplanır ve sonra sabittir. Bu hem hız kazandırır hem de sık bir hataya yol açar:</p>
<pre class="dax">Yanlış 2023 Satışı =
VAR s = [Net Satış]
RETURN CALCULATE(s, Tarih[Yil] = 2023)
Doğru 2023 Satışı =
CALCULATE([Net Satış], Tarih[Yil] = 2023)</pre>
<p>Toplamda yanlış ölçü <b>1.250.772,45 ₺</b> (bütün yıllar), doğru ölçü <b>400.869,55 ₺</b> verir; 2024 satırında yanlış ölçü 747.065,70 ₺ gösterir. CALCULATE bir sabitin bağlamını değiştiremez. Kural: <b>değişkeni, değerini istediğin bağlamda tanımla</b>; CALCULATE ile değiştirilecek bir şeyse değişkene ölçünün kendisini değil, sonucu kullanılacak tabloyu ya da filtreyi koy.</p>

<h2>Karar ağacı</h2>
<ol>
<li>Önce ölç: Clear Cache + Server Timings. FE mi SE mi baskın?</li>
<li>SE baskın ve sorgu az ama büyükse: model sorunu (kardinalite, ilişki, sütun sayısı) → Performans ve VertiPaq dersi.</li>
<li>FE baskın ve SE sorgusu çoksa: yineleyiciyi boyut anahtarına taşı, bağlam geçişini azalt.</li>
<li>CallbackDataID varsa: IF/koşulu CALCULATE filtresine taşı.</li>
<li>Büyük materyalizasyon varsa: FILTER(olgu) yerine sütun filtresi ya da KEEPFILTERS.</li>
<li>Aynı ölçü bir formülde birden çok kez geçiyorsa: VAR.</li>
<li>Her değişiklikten sonra sonucu karşılaştır; hızlı ama yanlış ölçü, yavaş ve doğru ölçüden kötüdür.</li>
</ol>
`, ex: [
  { t: 'mc', q: `Server Timings: Total 2.900 ms, FE 2.600 ms, SE 300 ms, SE Queries 4. Sorgulardan biri 1,8 milyon satır döndürüyor; xmSQL'de CallbackDataID yok. En olası neden ve ilk deneme?`,
    o: [`SE sorgusu çok; yineleyiciyi boyut anahtarına taşımak`, `Materyalizasyon; FILTER(olgu) yerine sütun filtresi`, `Callback; IF koşulunu CALCULATE filtresine taşımak`, `Kardinalite; tarih-saat sütununu ikiye bölmek`], a: 1,
    why: `Az sayıda ama devasa bir SE sonucu ve baskın FE süresi materyalizasyonun işaretidir: FE milyonlarca satırı bellekte işliyor. Tipik kaynak FILTER(Satislar, …) gibi tablo filtresidir. SE sorgu sayısı az olduğu için bağlam geçişi değil; callback yok; kardinalite SE süresini büyütürdü.` },
  { t: 'mc', q: `Bir ölçüde <code>SUMX(Satislar, IF(Satislar[Indirim] &gt; 0, Satislar[Tutar] * 0.9, Satislar[Tutar]))</code> var ve xmSQL'de CallbackDataID görünüyor. Sonucu değiştirmeden ne yaparsın?`,
    o: [`İfadeyi IFERROR ile sararım; hata yakalama hızlandırır`, `SUMX'i AVERAGEX'e çeviririm; daha az satır okunur`, `İki ayrı CALCULATE toplamına bölerim`, `IF yerine SWITCH(TRUE(), …) yazarım; SE onu anlar`], a: 2,
    why: `Koşulu filtreye taşırsan iki saf SE toplamı kalır: CALCULATE(SUM(Tutar), Indirim > 0) * 0,9 + CALCULATE(SUM(Tutar), Indirim = 0). IFERROR yavaşlatır; AVERAGEX sonucu değiştirir; SWITCH(TRUE()) de satır satır koşuldur ve callback'i kaldırmaz.` },
  { t: 'mc', q: `Bir analist <code>VAR Toplam = [Net Satış] RETURN CALCULATE(Toplam, REMOVEFILTERS(Kategoriler))</code> yazıp kategori payının paydasını bulmaya çalışıyor; her kategoride pay %100 çıkıyor. Neden?`,
    o: [`REMOVEFILTERS ilişki üzerinden çalışmaz`, `Kategoriler tablosu Satislar ile bağlı değil`, `DIVIDE yerine bölme işareti kullanıldığı için`, `Değişken bir kez hesaplanmış; CALCULATE onu değiştiremez`], a: 3,
    why: `Değişken kategori bağlamında hesaplanıp sabitlenir; CALCULATE sabit bir değerin bağlamını değiştiremez, bu yüzden pay = kendisi / kendisi. Doğrusu CALCULATE([Net Satış], REMOVEFILTERS(Kategoriler)) yazmaktır. REMOVEFILTERS ve ilişki doğru çalışıyor; bölme işareti sonucu %100 yapmaz.` },
  { t: 'dax', name: 'Web Satışı (Kesişim)', q: `<b>Web Satışı (Kesişim)</b>: Web kanalının net satışı; ama Kanal satırlı bir matriste Mobil ve Mağaza satırları <b>boş</b> kalmalı (mevcut kanal seçimine saygı).`,
    sol: `CALCULATE([Net Satış], KEEPFILTERS(Satislar[Kanal] = "Web"))`, hint: `Sütun filtresi mevcut Kanal filtresinin üzerine yazar. KEEPFILTERS(Satislar[Kanal] = "Web") ile kesişim al.`, grid: [{ t: 'Satislar', c: 'Kanal' }, { t: 'Tarih', c: 'Yil' }] },
  { t: 'dax', name: 'Sepet Farkı GY (VAR)', q: `<b>Sepet Farkı GY (VAR)</b>: <code>[Ortalama Sepet]</code> ile geçen yılın ortalama sepeti arasındaki fark. Her ifadeyi bir kez hesapla; geçen yıl yoksa BLANK döndür.`,
    sol: `VAR s = [Ortalama Sepet]\nVAR g = CALCULATE([Ortalama Sepet], SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN IF(NOT ISBLANK(g), s - g)`, hint: `İki değişken (bu yıl, geçen yıl), sonra IF(NOT ISBLANK(g), s - g).` },
  { t: 'dax', name: 'Büyük Sepetli Sipariş', q: `<b>Büyük Sepetli Sipariş</b>: Toplam tutarı 2.000 ₺'yi aşan iptal edilmemiş sipariş sayısı. Olgu tablosunun satırlarında değil, sipariş numaraları üzerinde dolaş.`,
    sol: `CALCULATE(\n    COUNTROWS(FILTER(VALUES(Satislar[SiparisNo]), CALCULATE(SUM(Satislar[Tutar])) > 2000)),\n    Satislar[Durum] <> "İptal"\n)`, hint: `FILTER(VALUES(Satislar[SiparisNo]), CALCULATE(SUM(Satislar[Tutar])) > 2000) siparişleri süzer; COUNTROWS sayar; dıştaki CALCULATE iptalleri çıkarır.` },
  { t: 'query', q: `DAX Studio'da Server Timings ile ölçeceğin bir test sorgusu yaz: <code>Tarih[YilAy]</code> satırlarında “Net Satış” ve “Sipariş” (<code>[Sipariş Sayısı]</code>) sütunlarını döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[YilAy],\n    "Net Satış", [Net Satış],\n    "Sipariş", [Sipariş Sayısı]\n)`, hint: `SUMMARIZECOLUMNS(Tarih[YilAy], "Net Satış", [Net Satış], "Sipariş", [Sipariş Sayısı]) — görselin gönderdiği sorgunun sade hâli.` }
] });

/* ===================================================================== 4. KURUMSAL MODEL */
ext('kurumsal-model', { min: 22, html: `
<h2>Bileşik model: tablo tablo karar vermek</h2>
<p>Senaryo: Anadolu Market'in satış satırları şirket içindeki bir SQL veritabanında yüz milyonlarca satıra ulaştı. Yönetim aylık kategori özetine bakıyor; mağaza müdürleri ise gün içi satışları görmek istiyor. Tek bir depolama modu herkese uymaz; bileşik model (composite model) her tabloya ayrı mod vermeyi sağlar:</p>
<div class="tbl-wrap"><table><tr><th>Tablo</th><th>Mod</th><th>Gerekçe</th></tr>
<tr><td><code>Satislar</code> (ayrıntı)</td><td>DirectQuery</td><td>Belleğe sığmıyor, gün içi güncellik gerekli</td></tr>
<tr><td><code>Tarih</code>, <code>Urunler</code>, <code>Kategoriler</code>, <code>Musteriler</code></td><td>Dual</td><td>Dilimleyiciler bellekten açılır; DirectQuery olguyla birleşince sorguya kaynakta katılır</td></tr>
<tr><td><code>Hedefler</code></td><td>Import</td><td>Excel'den gelir, ayda bir değişir</td></tr>
<tr><td>Aylık özet tablo</td><td>Import (gizli)</td><td>Yönetim sorgularını bellekten karşılar</td></tr></table></div>
<p>Boyutlar Import olsaydı, DirectQuery olgu ile aralarındaki ilişki <b>sınırlı ilişki</b> (limited relationship) olurdu: farklı kaynak grupları arasında motor ilişkiyi tam bir birleşim gibi kuramaz. Sonuçları: <code>RELATED</code> çalışmaz, eşleşmeyen satırlar için boş satır (blank row) oluşmaz, her sorgu iki dünya arasında veri taşır. Dual bu yüzden boyutların varsayılanıdır.</p>
<h3>Yayımlanmış modele bağlanıp genişletmek</h3>
<p>Finans ekibi onaylı satış modelini kullanmak, ama kendi gider bütçesi tablosunu eklemek istiyor. Canlı bağlantıyı “yerel model”e çevirmek (Power BI anlam modellerine DirectQuery) bunu sağlar. Dikkat: kullanıcının kaynak modelde <b>Derleme</b> (Build) izni olmalı, kaynak modeldeki RLS geçerliliğini korur ve kiracıda “Power BI anlam modellerine DirectQuery bağlantılarına izin ver” ayarı açık olmalı. Zincir uzadıkça (model üstüne model üstüne model) sorgular yavaşlar ve hata ayıklamak zorlaşır; iki halkadan uzun zincirden kaçın.</p>

<h2>DirectQuery'e geri dönüş ve Direct Lake davranışı</h2>
<p>Direct Lake'in iki biçimi farklı davranır; karar verirken bu farkı bilmek gerekir:</p>
<div class="tbl-wrap"><table><tr><th></th><th>Direct Lake on OneLake</th><th>Direct Lake on SQL (SQL analiz uç noktası)</th></tr>
<tr><td>Kaynak</td><td>Bir ya da birden çok Fabric öğesinin Delta tabloları</td><td>Tek bir lakehouse/warehouse'un SQL uç noktası</td></tr>
<tr><td>DirectQuery'e geri dönüş</td><td>Yok</td><td>Var: SQL görünümü (view), SQL tarafı ayrıntılı erişim denetimi ya da RLS, işlenmemiş tablo, sınır aşımı</td></tr>
<tr><td>Sınır (guardrail) aşılırsa</td><td>Yenileme başarısız olur; Delta tabloları iyileştirilene kadar model sorgulanamaz</td><td>Geri dönüş açıksa sorgu DirectQuery ile çalışır, yenileme uyarıyla tamamlanır</td></tr>
<tr><td>Import tablolarla bileşik</td><td>Desteklenir</td><td>Aynı modelde karıştırılamaz; Desktop'ta üstüne bileşik model kurulabilir</td></tr></table></div>
<p>Kapasiteye göre sınırlardan örnekler: F2–F8'de tablo başına 1.000 Parquet dosyası/satır grubu, 300 milyon satır ve diskte 10 GB model; F64'te tablo başına 5.000 dosya/satır grubu ve 1,5 milyar satır, belleğe alınabilecek veri için 25 GB üst sınır. Sınırın altında kalmanın yolu çoğu zaman SKU büyütmek değil, Delta tablolarını bakımlı tutmaktır: küçük dosyaları birleştirmek (compaction), V-Order ile yazmak.</p>
<ul>
<li><b>İlk sorgu yavaşsa:</b> Direct Lake sütunları ihtiyaç oldukça belleğe alır (transcoding). Sabah ilk açılış soğuktur; çerçeveleme (framing) sonrası bir ısınma sorgusu planlamak yaygın bir çözümdür.</li>
<li><b>Bellek dolarsa:</b> sütunlar bellekten atılıp yeniden yüklenir (paging); her şey çalışır ama yavaşlar.</li>
<li><b>Geri dönüşü izle:</b> “Direct Lake davranışı” (Direct Lake behavior) özelliğiyle geri dönüşü kapatırsan sorun sessiz yavaşlık yerine açık hata olarak görünür; Fabric kapasite ölçümleri uygulamasında geri dönüşleri takip et.</li>
<li><b>SQL görünümü yerine:</b> lakehouse'ta somutlaştırılmış görünüm (materialized view) ya da dönüşümü yapılmış bir Delta tablosu kullan.</li>
</ul>

<h2>Toplama tabloları ve artımlı yenileme: kısa hatırlatma</h2>
<p>Bu iki konunun ayrıntısını ayrı bir ders işliyor; burada yalnızca karar ölçütü. Toplama tablosunun değeri, <b>tanesine</b> (grain) bağlıdır. Bu modelde <code>Satislar</code> 1.620 satırdır; ay × kategori düzeyinde özet 199 satıra iner. Ürün düzeyinde bir soru gelirse bu özet cevap veremez ve sorgu ayrıntıya düşer. Özet tabloyu, panoların gerçekten sorduğu soruların tanesinde kur; Performans Analizi ile “özet kullanıldı mı?” diye doğrula. Artımlı yenileme ise yenileme süresinin sınırlarını (paylaşılan kapasitede 2 saat, Premium/Fabric'te 5 saat) aşan tablolar için ilk adaydır.</p>

<h2>Modeli kullanıcıya anlatmak: klasörler, açıklamalar, çeviriler</h2>
<p>119 ölçülük bir model, alan listesinde düz bir liste olarak kullanılamaz. Kurumsal bir modelde şu üç meta veri en az ölçü kadar önemlidir:</p>
<ul>
<li><b>Görüntüleme klasörü</b> (Display folder): <code>Satış\\Temel</code>, <code>Satış\\Zaman Zekâsı</code>, <code>Müşteri\\RFM</code>. Ters eğik çizgi alt klasör, noktalı virgül aynı ölçüyü iki klasörde gösterir. Klasör adları da çevrilebilir.</li>
<li><b>Açıklama</b> (Description): alan listesinde araç ipucu olarak çıkar. “İptal hariç, iade dahil net satış; Tarih tablosuyla aktif ilişki” gibi tanımlar yazılmalı. Copilot ve “Yapay zekâ için verileri hazırla” (Prep data for AI) ayarları da bu açıklamalardan yararlanır.</li>
<li><b>Gizleme ve özetleme:</b> anahtar sütunlar (<code>UrunNo</code>, <code>MusteriNo</code>) olgu tablosunda gizli olmalı; sayısal kimlikler “Özetleme: Hiçbiri” olmalı ki kimse SatirNo toplamı almasın.</li>
</ul>
<h3>Meta veri çevirileri (translations)</h3>
<p>Almanya'daki ortak şirket aynı modeli kullanacak. Üç ayrı çeviri türü vardır ve zorlukları farklıdır:</p>
<div class="tbl-wrap"><table><tr><th>Tür</th><th>Neyi çevirir?</th><th>Nasıl?</th></tr>
<tr><td>Meta veri çevirisi</td><td>Tablo, sütun, ölçü, hiyerarşi adları; açıklamalar; görüntüleme klasörleri</td><td>Modelin içinde, dil (culture) başına; Translations Builder gibi araçlarla</td></tr>
<tr><td>Rapor etiketi çevirisi</td><td>Başlıklar, düğme metinleri</td><td>Yerleşik özellik yok; etiketleri ölçü olarak tutan gizli bir tablo kalıbı</td></tr>
<tr><td>Veri çevirisi</td><td>“Elektronik” → “Elektronik”, “Ev &amp; Yaşam” → “Haus &amp; Wohnen”</td><td>Kaynakta çevrilmiş sütunlar + seçim mekanizması</td></tr></table></div>
<p>Sayfa sekmesi adları ve metin kutularındaki sabit yazılar çevrilemez; çok dilli raporlar Web'de yayımla ile desteklenmez. Ölçü adlarını çevirmek DAX'ı bozmaz: formüller nesneye başvurur, görünen ada değil.</p>
<p>Nesne düzeyinde güvenlik (OLS) de kurumsal modelin parçasıdır; ayrıntısı Satır ve nesne düzeyinde güvenlik dersindedir.</p>

<h2>Ölçek kararları</h2>
<div class="tbl-wrap"><table><tr><th>Belirti</th><th>Önce dene</th><th>Sonra</th></tr>
<tr><td>Pro'da model boyutu 1 GB sınırına yaklaştı</td><td>Gereksiz sütun, kardinalite, otomatik tarih/saat</td><td>PPU ya da Fabric kapasitesi; büyük model biçimi</td></tr>
<tr><td>Yenileme 2 saati aşıyor</td><td>Sorgu katlama, artımlı yenileme</td><td>Kapasite (5 saat), XMLA ile bölüm bölüm yenileme</td></tr>
<tr><td>Günde 8'den fazla yenileme gerekiyor</td><td>Gerçekten gerekli mi? Hangi tablo?</td><td>Kapasitede 48'e kadar zamanlanmış; Direct Lake ya da DirectQuery</td></tr>
<tr><td>Birden çok ekip aynı tanımları yeniden yazıyor</td><td>Tek onaylı model + Derleme izni</td><td>Bileşik modelle ekip tablolarını ekleme</td></tr></table></div>
<div class="tip"><b>Kontrol listesi</b>Her tablonun modu ve gerekçesi yazılı mı? · Boyutlar Dual mı? · Direct Lake'te geri dönüş davranışı bilinçli seçildi mi, izleniyor mu? · Toplama tablosunun tanesi gerçek sorulara uyuyor mu? · Her ölçünün açıklaması ve klasörü var mı? · Anahtar sütunlar gizli mi?</div>
`, ex: [
  { t: 'mc', q: `Direct Lake on SQL modelinde satış tablosu, lakehouse'taki bir SQL görünümüne (view) bağlı. Kullanıcılar bazı sayfaların diğerlerinden çok yavaş olduğunu söylüyor. Kalıcı çözüm?`,
    o: [`Modeli Import moduna alıp her saat yenilemek`, `Kapasiteyi bir üst SKU'ya yükseltmek`, `Görünümü bir Delta tablosuna dönüştürmek`, `Görünüm tablosunu Dual depolama moduna almak`], a: 2,
    why: `SQL görünümleri Direct Lake on SQL'de DirectQuery'e geri dönüşe yol açar. Mantığı bir Delta tablosuna (ya da somutlaştırılmış görünüme) taşımak sorguyu Direct Lake'te tutar. SKU büyütmek görünüm kaynaklı geri dönüşü kaldırmaz; Import gereksiz kopya ve gecikme yaratır; Direct Lake tablosu Dual yapılamaz.` },
  { t: 'mc', q: `Direct Lake on OneLake modelinde bir tablo F8 kapasitesinin satır sınırını aştıktan sonra sabah yenilemesi başarısız oldu ve rapor hiç açılmıyor. Ne olmuş ve ne yaparsın?`,
    o: [`Sorgular DirectQuery'e döndü; beklemek yeterli`, `Sınır aşıldı; Delta'yı iyileştir ya da SKU büyüt`, `Çerçeveleme bozuldu; modeli yeniden yayımlamak gerekir`, `RLS hatası; rol üyeliklerini kontrol et`], a: 1,
    why: `Direct Lake on OneLake'te DirectQuery'e geri dönüş yoktur; sınır aşılınca yenileme başarısız olur ve tablolar iyileştirilene (ya da kapasite büyütülene) kadar model sorgulanamaz. Geri dönüş yalnızca Direct Lake on SQL'de vardır; yeniden yayımlamak ya da RLS bu sorunu açıklamaz.` },
  { t: 'mc', q: `Alman ortaklar aynı satış modelini kullanacak. Alan listesinde “Net Satış”, “Kategori” gibi adları ve ölçü açıklamalarını Almanca görmeleri gerekiyor; kategori değerleri Türkçe kalabilir. En az çabalı doğru yol?`,
    o: [`Her ölçünün Almanca kopyasını yazıp ayrı klasöre koymak`, `Kaynağa Almanca kategori sütunları eklemek`, `Modelde Almanca meta veri çevirisi tanımlamak`, `Raporu kopyalayıp başlıkları elle Almancaya çevirmek`], a: 2,
    why: `İstenen yalnızca nesne adları ve açıklamalar: bu meta veri çevirisidir ve modelin içinde dil başına tutulur. Kopya ölçüler bakım yükünü ikiye katlar; Almanca kategori sütunları veri çevirisidir (istenmiyor); rapor kopyalamak alan listesini çevirmez.` },
  { t: 'mc', q: `Finans ekibi onaylı satış modeline canlı bağlanıp kendi gider bütçesi Excel'ini eklemek istiyor. Ekip üyeleri model sahibi değil. Neyin hazır olması gerekir?`,
    o: [`Derleme izni ve kiracıda DirectQuery izni`, `Kaynak modelin RLS rollerinin kaldırılması`, `Ekibe kaynak çalışma alanında Üye rolü verilmesi`, `Kaynak modelin Import'tan DirectQuery'ye çevrilmesi`], a: 0,
    why: `Yayımlanmış modelin üzerine yerel tablo eklemek için kullanıcının kaynak modelde Derleme iznine ve kiracı ayarının açık olmasına ihtiyaç var. RLS kaldırılmaz, kaynak modelde geçerliliğini korur; Üye rolü gereğinden fazla yetkidir; kaynak modelin modunu değiştirmek gerekmez.` },
  { t: 'mc', q: `Bileşik modelde boyutlar Import, satış olgusu DirectQuery. Bir analist hesaplanmış sütunda <code>RELATED(Urunler[Kategori])</code> kullanamadığını ve dilimleyicilerin yavaş olduğunu söylüyor. Kök neden?`,
    o: [`Ürünler tablosunda yinelenen anahtarlar var`, `İlişki çift yönlü olmadığı için filtre inmiyor`, `DirectQuery hesaplanmış sütunları hiç desteklemez`, `İlişki sınırlı (limited) ilişkiye dönmüş`], a: 3,
    why: `Import boyut ile DirectQuery olgu arasındaki ilişki sınırlı (limited) ilişkidir; RELATED çalışmaz ve sorgular iki dünya arasında veri taşır. Boyutları Dual yapmak çözer. Yinelenen anahtar ya da ilişki yönü bu iki belirtiyi birlikte açıklamaz.` },
  { t: 'query', q: `Bir toplama tablosunun içeriğini önizle: <code>Tarih[YilAy]</code> ve <code>Kategoriler[Kategori]</code> düzeyinde “Net Satış” döndüren bir sorgu yaz.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nSUMMARIZECOLUMNS(\n    Tarih[YilAy],\n    Kategoriler[Kategori],\n    "Net Satış", [Net Satış]\n)`, hint: `SUMMARIZECOLUMNS'a iki gruplama sütunu ve bir ölçü ver.` },
  { t: 'query', q: `Toplama tablosu ne kadar küçülür? Tek satırda <code>Satislar</code> tablosunun satır sayısını (“Ayrıntı”) ve <code>Satislar</code> üzerinde <code>Tarih[YilAy]</code> × <code>Urunler[Kategori]</code> bileşimlerinin sayısını (“Özet”) döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nROW(\n    "Ayrıntı", COUNTROWS(Satislar),\n    "Özet", COUNTROWS(SUMMARIZE(Satislar, Tarih[YilAy], Urunler[Kategori]))\n)`, hint: `COUNTROWS(Satislar) ve COUNTROWS(SUMMARIZE(Satislar, Tarih[YilAy], Urunler[Kategori])) ifadelerini ROW içinde iki sütun yap.` }
] });

/* ===================================================================== 5. GÜVENLİK */
ext('guvenlik', { min: 22, html: `
<h2>Dinamik RLS: kim, hangi satırı?</h2>
<p>Satış Müdürü Elif Doğan şunu istiyor: “Temsilcilerim yalnızca kendi satışlarını görsün. Ben ekibimin tamamını göreyim. Genel müdür her şeyi görsün.” Modelde <code>Satislar[TemsilciNo]</code> → <code>Calisanlar[CalisanNo]</code> ilişkisi ve <code>Calisanlar[Eposta]</code> sütunu zaten var. En basit dinamik rol tek satırlık bir tablo filtresidir:</p>
<pre class="dax" data-notry>-- Rol: "Temsilci", tablo: Calisanlar
Calisanlar[Eposta] = USERPRINCIPALNAME()</pre>
<p>Ece Kurt oturum açtığında <code>Calisanlar</code> tek satıra iner, filtre ilişki üzerinden <code>Satislar</code>'a akar. Bunu yayımlamadan önce aynı filtreyi bir ölçüyle taklit ederek doğrulayabilirsin:</p>
<pre class="dax">Ece Kurt Testi =
CALCULATE([Net Satış], Calisanlar[Eposta] = "ece.kurt@anadolumarket.com")</pre>
<p>Sonuç <b>146.836,45 ₺</b> olmalıdır; rapor “Farklı görüntüle” ile açıldığında kart bu sayıyı göstermiyorsa rol ya da ilişki hatalıdır. Dikkat edilecek üç ayrıntı:</p>
<ul>
<li><b>Boş e-posta:</b> Bu modelde Pınar Yıldırım, Defne Öztürk ve Kerem Yılmaz'ın <code>Eposta</code> değeri boş. Rolde olsalar bile <b>hiçbir şey görmezler</b>. Eşleşen satırı olmayan kullanıcı boş rapor görür; hata mesajı almaz.</li>
<li><b>Biçim:</b> <code>USERPRINCIPALNAME()</code> Service'te kullanıcının UPN'ini döndürür. Tabloda büyük/küçük harf ya da eski alan adı farkı varsa eşleşme kaçar. Konuk (B2B) kullanıcılarda değer <code>#EXT#</code> içeren bir biçimde gelebilir; gerçek bir konuk hesabıyla test et.</li>
<li><b>Boyutlar filtrelenmez:</b> Filtre <code>Calisanlar</code> → <code>Satislar</code> yönünde akar. <code>Musteriler</code> ve <code>Urunler</code> boyutlarının tüm satırları görünür kalır; temsilci tüm müşteri adlarını dilimleyicide görebilir. Bu kabul edilemezse müşteri tablosuna ayrı bir filtre gerekir.</li>
</ul>
<h3>Eşleme tablosu: bir kişi, birden çok bölge</h3>
<p>Bölge müdürlerinin birden çok bölgesi varsa <code>Yetkiler(Eposta, Bolge)</code> gibi bir eşleme tablosu kurulur. İki yol vardır:</p>
<div class="tbl-wrap"><table><tr><th>Yol</th><th>Nasıl?</th><th>Artı / eksi</th></tr>
<tr><td>İlişki + iki yönlü güvenlik filtresi</td><td>Yetkiler → Bolge boyutu ilişkisi, “Güvenlik filtresini iki yönde uygula”</td><td>Görsel olarak sade; ama iki yönlü filtre performansı düşürür ve bir tabloda yalnızca bir ilişkide açılabilir</td></tr>
<tr><td>İlişkisiz tablo + filtre ifadesi</td><td>Musteriler rolünde: bölge, kullanıcının bölgeleri içinde mi?</td><td>Tek yönlü, öngörülebilir; ifade biraz daha uzun</td></tr></table></div>
<pre class="dax" data-notry>-- Rol filtresi, tablo: Musteriler (Yetkiler tablosu ilişkisiz)
Musteriler[Bolge] IN
    CALCULATETABLE(VALUES(Yetkiler[Bolge]), Yetkiler[Eposta] = USERPRINCIPALNAME())</pre>

<h2>Yönetici hiyerarşisi: PATHCONTAINS</h2>
<p>Elif'in “ekibimin tamamını göreyim” isteği hiyerarşi ister. <code>Calisanlar[Yol]</code> sütunu <code>PATH(CalisanNo, YoneticiNo)</code> ile üretilmiştir: Ece Kurt için “1|2|9”. Rol filtresi, oturum açan kişinin numarasının satırın yolunda geçip geçmediğine bakar:</p>
<pre class="dax" data-notry>-- Rol: "Hiyerarşi", tablo: Calisanlar
PATHCONTAINS(
    Calisanlar[Yol],
    LOOKUPVALUE(Calisanlar[CalisanNo], Calisanlar[Eposta], USERPRINCIPALNAME())
)</pre>
<p>Analitik Müdürü Serkan Özdemir (4) için hangi satırların kalacağını bir sorguyla görebilirsin:</p>
<pre class="dax">EVALUATE
FILTER(
    SELECTCOLUMNS(Calisanlar, "Ad", Calisanlar[AdSoyad], "Unvan", Calisanlar[Unvan], "Yol", Calisanlar[Yol]),
    PATHCONTAINS([Yol], 4)
)</pre>
<p>Beş satır döner: Serkan ve dört ekip üyesi. Elif (2) için ise kendisi ve beş temsilci kalır; tüm satışlar bu ekipte olduğu için Elif <b>1.250.772,45 ₺</b>'nin tamamını görür, kendi adına kayıtlı satış yalnızca 183.134,35 ₺'dir. Kenar durumlar:</p>
<ul>
<li>E-posta tabloda yoksa <code>LOOKUPVALUE</code> BLANK döner, <code>PATHCONTAINS</code> hiçbir satırda doğru olmaz: kullanıcı boş rapor görür.</li>
<li>Aynı e-posta iki satırda varsa <code>LOOKUPVALUE</code> hata verir ve kullanıcının <b>tüm görselleri</b> bozulur. <code>Eposta</code> sütununda benzersizlik kontrolü yap.</li>
<li>Filtre 27 satırlık küçük bir tabloda değerlendirilir; ucuzdur. Aynı ifadeyi milyonlarca satırlık olgu tablosuna yazmak pahalıdır. RLS'yi her zaman <b>küçük boyut tablosunda</b> tanımla.</li>
</ul>

<h2>Birden çok rol: kesişim değil birleşim</h2>
<p>Ece hem “Temsilci” rolünde hem de bir kampanya için “Ege Bölgesi” rolünde olsun. Roller <b>toplanır</b>: Ece kendi satışlarını <b>ve</b> Ege bölgesinin tüm satışlarını görür, ikisinin kesişimini değil. Bu, en geniş rolün diğerlerini boşa çıkarması demektir. “Hem kendi satışları hem yalnızca Ege” gibi bir kesişim isteniyorsa iki koşul <b>tek bir rolün</b> ifadesinde birleştirilmelidir. Birleşim etkisini test etmek için iki temsilcinin görünümünü birlikte hesapla:</p>
<pre class="dax">İki Temsilci Birleşimi =
CALCULATE([Net Satış], Calisanlar[CalisanNo] = 9 || Calisanlar[CalisanNo] = 10)</pre>
<p>Ece (9) ve Can Aydın (10) birlikte 385.695,65 ₺ eder. Bir diğer kural: <b>RLS ve OLS farklı rollerden birleştirilemez</b>. Bir kullanıcı, birinde satır filtresi, diğerinde nesne gizleme olan iki role üyeyse sorgu anında hata alır. Nesne güvenliğini ve satır güvenliğini aynı rolde tanımla.</p>
<h3>OLS ve ölçüler</h3>
<p>OLS bir sütunu gizlediğinde o sütuna başvuran ölçüler de o rol için otomatik kısıtlanır: <code>Calisanlar[Maas]</code> gizlenirse <code>[Ortalama Maaş]</code>, <code>[Toplam Maaş]</code> ve <code>[Medyan Maaş]</code> da çalışmaz. Kullanıcı görselde “alan bulunamadı” türünde bir hata görür; bu yüzden OLS'li kullanıcılar için ayrı sayfa ya da rapor tasarla. OLS'yi Desktop'ta TMDL görünümünde ya da Tabular Editor gibi bir dış araçla tanımlarsın; rol üyeliği yine Service'te atanır.</p>

<h2>Test etmek: matrisle, kişiyle, sayıyla</h2>
<ul>
<li><b>Desktop:</b> Modelleme → <b>Farklı görüntüle</b> (View as): rolü seç, “Diğer kullanıcı” kutusuna e-postayı yaz. Dinamik RLS ancak böyle sınanır.</li>
<li><b>Service:</b> anlam modelinde <b>…</b> → <b>Güvenlik</b> (Security) → rolün yanındaki <b>…</b> → <b>Rol olarak test et</b> (Test as role). Belirli bir kişi ya da rol bileşimi seçilebilir. Panolar bu testte desteklenmez; sayfalandırılmış raporlarda ve SSO'lu DirectQuery modellerinde çalışmaz.</li>
</ul>
<div class="tbl-wrap"><table><tr><th>Test kullanıcısı</th><th>Rol</th><th>Beklenen Net Satış</th></tr>
<tr><td>ece.kurt@…</td><td>Temsilci</td><td>146.836,45 ₺</td></tr>
<tr><td>elif.dogan@…</td><td>Hiyerarşi</td><td>1.250.772,45 ₺</td></tr>
<tr><td>Pınar Yıldırım (e-posta yok)</td><td>Temsilci</td><td>Boş</td></tr>
<tr><td>Rolü olmayan bir Görüntüleyici</td><td>—</td><td>Boş</td></tr></table></div>
<p>Bu tabloyu bir test belgesi olarak modelin yanında tut; her model değişikliğinden sonra aynı kişilerle tekrar et.</p>

<h2>RLS'nin uygulanmadığı ve yanıltabildiği yerler</h2>
<ul>
<li><b>Çalışma alanı rolleri:</b> Yönetici, Üye ve Katkıda bulunan modeli düzenleyebildiği için RLS'den etkilenmez. Son kullanıcıları yalnızca Görüntüleyici olarak ekle ya da içerikleri uygulama ile dağıt. Derleme izni olan Görüntüleyiciler (Excel'de Çözümle dahil) RLS ile kısıtlı kalır.</li>
<li><b>Hizmet sorumlusu:</b> rollere eklenemez; uygulamaya gömülü senaryolarda kullanıcının kimliği yerleştirme belirtecinde (embed token) etkin kimlik olarak gönderilir (Yayımlama dersi).</li>
<li><b>ALL RLS'yi aşmaz:</b> <code>[Kategori Payı %]</code> gibi ölçülerde payda <code>ALL</code> ya da <code>REMOVEFILTERS</code> ile yazılmış olsa bile RLS filtresi geçerlidir. Ece'nin “kategori payı” kendi satışları içindeki paydır, şirket içindeki pay değil. Şirket geneli bir pay göstermek istiyorsan bu değeri ayrı ve onaylı bir yoldan (ör. RLS'siz bir özet tablo) sağlamak gerekir.</li>
<li><b>USERELATIONSHIP:</b> RLS açıkken beklenmedik hatalar verebilir. <code>[Teslime Göre Satış]</code> gibi pasif ilişki kullanan ölçüleri rol testine dahil et.</li>
<li><b>Performans:</b> iki yönlü güvenlik filtresi ve olgu tablosunda yazılmış karmaşık ifadeler her sorguya eklenir. Performans Analizi'ni “Farklı görüntüle” açıkken çalıştır; yönetici gözüyle hızlı olan sayfa temsilci gözüyle yavaş olabilir.</li>
</ul>
<div class="tip"><b>Kontrol listesi</b>Rol filtresi küçük boyut tablosunda mı? · E-posta sütunu benzersiz ve boş değer kontrolü yapıldı mı? · Konuk kullanıcı biçimi test edildi mi? · Roller birleşim olarak düşünüldü mü; RLS ve OLS aynı rolde mi? · Test kullanıcıları ve beklenen sayılar belgelendi mi? · Son kullanıcılar Görüntüleyici mi?</div>
`, ex: [
  { t: 'mc', q: `Veri Mühendisi Pınar Yıldırım “Temsilci” rolüne eklendi ama raporu açınca bütün görseller boş. Hata mesajı yok. En olası neden?`,
    o: [`Rol ifadesinde USERNAME() yerine USERPRINCIPALNAME() kullanılmış`, `Calisanlar tablosunda Pınar'ın e-posta değeri boş`, `Pınar çalışma alanında Katkıda bulunan rolünde`, `Pınar'ın Derleme izni olmadığı için`], a: 1,
    why: `Eşleşen satırı olmayan kullanıcı boş rapor görür; bu modelde Pınar'ın Eposta değeri boş. USERPRINCIPALNAME doğru fonksiyondur; Katkıda bulunan olsaydı RLS hiç uygulanmaz, her şeyi görürdü; Derleme izni rapor görüntülemeyi etkilemez.` },
  { t: 'mc', q: `Ece Kurt hem “Temsilci” (yalnızca kendi satışları) hem de “Ege Bölgesi” (Ege müşterilerinin tüm satışları) rolüne üye. Satış müdürü Ece'nin yalnızca Ege'deki kendi satışlarını görmesini istiyor. Ne yaparsın?`,
    o: [`İki rolü koruyup Ege rolüne öncelik veririm`, `Ece'yi Ege rolünden çıkarıp raporda Ege filtresi koyarım`, `Ece'ye RLS'yi aşmayan Görüntüleyici rolü veririm`, `İki koşulu tek bir rolde birleştiririm`], a: 3,
    why: `Roller toplanır; iki rol birleşim verir, kesişim değil. Kesişim için iki koşul tek bir rolün ifadesinde olmalı. Rollerin önceliği yoktur; rapor filtresi güvenlik değildir, kullanıcı kaldırabilir; Görüntüleyici zaten RLS'ye tabidir ve sorunu çözmez.` },
  { t: 'mc', q: `Ece raporda “Kategori Payı %” sütununda Elektronik için %21,9 görüyor; şirket genelinde bu pay %27,1. Ölçünün paydası ALL ile yazılmış. Ece neden farklı görüyor?`,
    o: [`RLS paydada da geçerli; pay Ece'nin satışı içinde`, `ALL ilişki üzerinden çalışmadığı için payda eksik`, `Ece'nin önbelleği eski; yenileme gerekli`, `Kategori tablosunda Ece için ayrı RLS tanımlı`], a: 0,
    why: `ALL ya da REMOVEFILTERS RLS'yi aşmaz; payda da Ece'nin görebildiği satırlarla hesaplanır. Bu bir hata değil, RLS'nin doğal sonucudur. ALL ilişki sorunu değildir; önbellek ya da kategori RLS'si bu farkı açıklamaz.` },
  { t: 'mc', q: `Bir bölge müdürü çalışma alanına Üye olarak eklenmiş ve tüm bölgelerin satışlarını görebildiğini bildiriyor. Rol tanımı doğru. Ne yaparsın?`,
    o: [`Rol ifadesine Üye rolünü dışlayan bir koşul eklerim`, `Modeli Direct Lake'e taşırım; orada Üye de kısıtlanır`, `Görüntüleyici yapar ya da uygulamadan erişim veririm`, `Bölge filtresini rapor düzeyinde kilitlerim`], a: 2,
    why: `Yönetici, Üye ve Katkıda bulunan modeli düzenleyebildiği için RLS onlara uygulanmaz. Son kullanıcı Görüntüleyici olmalı ya da içeriği uygulamadan almalı. DAX ifadesi çalışma alanı rolünü bilmez; depolama modu bu kuralı değiştirmez; rapor filtresi güvenlik değildir.` },
  { t: 'dax', name: 'Ece Kurt Görünümü (RLS Testi)', q: `<b>Ece Kurt Görünümü (RLS Testi)</b>: “Temsilci” rolünün Ece Kurt için yapacağı filtrelemeyi taklit eden ölçüyü yaz: <code>Calisanlar[Eposta]</code> değeri <code>ece.kurt@anadolumarket.com</code> olan satırlara göre net satış.`,
    sol: `CALCULATE([Net Satış], Calisanlar[Eposta] = "ece.kurt@anadolumarket.com")`, hint: `Rol filtresindeki USERPRINCIPALNAME() yerine e-postayı metin olarak yaz ve CALCULATE filtresi yap.` },
  { t: 'dax', name: 'Gamze ve Oğuz Birleşimi', q: `<b>Gamze ve Oğuz Birleşimi</b>: Gamze Özkan (CalisanNo 8) ile Oğuz Demir (CalisanNo 12) iki ayrı role üye bir kullanıcının göreceği birleşimi hesapla: ikisinin toplam net satışı.`,
    sol: `CALCULATE([Net Satış], Calisanlar[CalisanNo] = 8 || Calisanlar[CalisanNo] = 12)`, hint: `Roller birleşir: aynı sütunda VEYA koşulu. Calisanlar[CalisanNo] = 8 || Calisanlar[CalisanNo] = 12.` },
  { t: 'query', q: `“Hiyerarşi” rolünü Satış Müdürü Elif Doğan (CalisanNo 2) için test et: <code>Calisanlar</code> tablosundan yolunda 2 geçen çalışanların adını ve unvanını döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nFILTER(\n    SELECTCOLUMNS(Calisanlar, "Ad", Calisanlar[AdSoyad], "Unvan", Calisanlar[Unvan], "Yol", Calisanlar[Yol]),\n    PATHCONTAINS([Yol], 2)\n)`, hint: `SELECTCOLUMNS ile Ad, Unvan ve Yol sütunlarını seç; FILTER içinde PATHCONTAINS([Yol], 2).` }
] });

/* ===================================================================== 6. YAYIMLAMA */
ext('yayinlama', { min: 20, html: `
<h2>Çalışma alanı tasarımı</h2>
<p>Anadolu Market'te Satış, Finans ve İK raporları tek bir “BI” çalışma alanında toplanmış: 60 öğe, 40 Üye, kimin neyi değiştirdiği belli değil. Yeniden tasarımda iki ilke işe yarar: <b>modeli rapordan ayır</b> ve <b>yetkiyi gruba ver</b>.</p>
<div class="tbl-wrap"><table><tr><th>Çalışma alanı</th><th>İçerik</th><th>Kim, hangi rol?</th></tr>
<tr><td>Satış Modeli [Dev/Test/Prod]</td><td>Onaylı anlam modeli</td><td>BI ekibi: Üye · Rapor yazarları: modelde Derleme izni</td></tr>
<tr><td>Satış Raporları [Dev/Test/Prod]</td><td>Model üstüne kurulmuş raporlar</td><td>Rapor yazarları: Katkıda bulunan · Kimse son kullanıcı olarak eklenmez</td></tr>
<tr><td>(Uygulama)</td><td>Son kullanıcıya giden paket</td><td>Entra güvenlik grupları, kitle bazında</td></tr></table></div>
<p>Kişi yerine Microsoft Entra güvenlik gruplarını ekle; işe giren ve ayrılanlar grupta yönetilir. Çalışma alanının lisans türü (Pro, PPU, Fabric kapasitesi) görüntüleyicilerin lisansını da belirler: PPU çalışma alanındaki içeriği görmek için görüntüleyicinin de PPU'su olmalı; F64 ve üstü kapasitedeki içeriği ücretsiz lisanslı kullanıcılar görüntüleyebilir.</p>

<h2>Uygulama: çalışma alanı uygulaması ve kuruluş uygulaması</h2>
<p>Dağıtım için iki seçenek vardır. Klasik <b>çalışma alanı uygulaması</b> (workspace app) her çalışma alanında bir tanedir; değişiklikler “Uygulamayı güncelle” denene kadar kullanıcıya gitmez. Daha yeni olan <b>kuruluş uygulaması</b> (org app) ise bir Fabric öğesidir ve genel kullanıma açıktır (GA):</p>
<div class="tbl-wrap"><table><tr><th></th><th>Çalışma alanı uygulaması</th><th>Kuruluş uygulaması</th></tr>
<tr><td>Çalışma alanı başına</td><td>Bir</td><td>Birden çok</td></tr>
<tr><td>Değişiklik ne zaman görünür?</td><td>Uygulama güncellenince</td><td>Uygulama kaydedilince</td></tr>
<tr><td>Model erişimi</td><td>Yazar elle yönetir</td><td>Rapora erişim, modeline (başka çalışma alanında olsa da) erişim verir</td></tr>
<tr><td>Kurulum</td><td>Kullanıcı yükler</td><td>Gerekmez; Uygulamalar ve Son kullanılanlar listesinde görünür</td></tr>
<tr><td>Kitleler</td><td>Var</td><td>Var; düzenleme moduna girmeden yönetilir</td></tr></table></div>
<p><b>Kitle</b> (audience) senaryosu: “Temsilciler” kitlesi yalnızca Satış Performansı raporunu, “Yönetim” kitlesi ek olarak Kârlılık raporunu görür. Kitle bir <b>gezinme</b> düzenidir, güvenlik değildir: Kârlılık raporundaki marj sütununu temsilcilerden saklamak gerekiyorsa bunu RLS/OLS yapar, kitle değil.</p>

<h2>Abonelikler ve veri uyarıları</h2>
<ul>
<li><b>Abonelik:</b> rapor sayfasının e-posta anlık görüntüsü; günlük, haftalık ya da veri yenilendikten sonra. Raporun tamamını ek olarak (PDF/PowerPoint) gönderebilir. Başkaları adına abonelik kurulabilir; kiracı ayarlarında dış kullanıcılara gönderim ayrıca kapatılabilir. Sayfalandırılmış raporların abonelikleri parametre değerleriyle çalışır (Sayfalandırılmış raporlar dersi).</li>
<li><b>Veri uyarısı:</b> klasik uyarılar yalnızca <b>panodaki</b> kart, KPI ve gösterge kutucuklarında kurulur; rapor görselinde değil. Her kullanıcı kendi uyarısını kurar; Power Automate ile bir iş akışı tetiklenebilir.</li>
<li><b>Activator:</b> Fabric'te rapor görselinden “Uyarı ayarla” ile kural tabanlı uyarılar kurulabilir: “bir kategorinin günlük satışı geçen haftanın ortalamasının %30 altına düşerse ekibe Teams mesajı”.</li>
</ul>
<p>Bir uyarı ya da abonelik ancak verinin güncel olduğu kadar doğrudur. Bu yüzden her raporda bir <b>veri tazeliği</b> göstergesi olmalı. Basit bir yol, modeldeki en son satış tarihini kartta göstermektir:</p>
<pre class="dax">Veri Tazeliği (gün) =
DATEDIFF(CALCULATE(MAX(Satislar[Tarih]), REMOVEFILTERS()), TODAY(), DAY)</pre>
<p>Yenileme durursa bu sayı her gün bir artar ve okur bunu fark eder; “Son yenileme” zaman damgası ise veri kaynağı güncellenmediğinde bile değişir ve yanıltabilir.</p>

<h2>Ağ geçidi ve yenileme sınırları</h2>
<div class="tbl-wrap"><table><tr><th></th><th>Pro (paylaşılan kapasite)</th><th>PPU / Premium / Fabric kapasitesi</th></tr>
<tr><td>Zamanlanmış yenileme</td><td>Günde 8 (API ile tetiklenenler dahil)</td><td>Günde 48; XMLA okuma-yazma ile komut dosyası yenilemeleri sabit sayıyla sınırlı değil</td></tr>
<tr><td>Yenileme zaman aşımı</td><td>2 saat</td><td>5 saat (XMLA ile aşılabilir)</td></tr>
<tr><td>“Şimdi yenile”</td><td colspan="2">Günlük sayıma dahil değil</td></tr></table></div>
<ul>
<li><b>Etkinlik yoksa duraklama:</b> modele bağlı rapor ya da pano iki ay boyunca hiç açılmazsa zamanlanmış yenileme duraklatılır ve sahibine e-posta gider.</li>
<li><b>Art arda hatalar:</b> yenileme defalarca başarısız olursa zamanlama kapatılır. Hata e-postasını kişisel kutuya değil, ekip dağıtım listesine yönlendir.</li>
<li><b>Ağ geçidi:</b> şirket içi ya da doğrudan erişilemeyen her kaynak için gerekir. Bir model yalnızca <b>bir</b> ağ geçidi bağlantısı kullanır; aynı sorguda şirket içi SQL ile SharePoint Online birleşiyorsa bulut kaynağı da ağ geçidi üzerinden tanımlanmalıdır. Kurumsal kullanımda standart mod; kişisel mod yalnızca tek kişinin yönettiği modeller için.</li>
<li><b>DirectQuery ve canlı bağlantı:</b> veri yenilemesi yoktur; ama pano kutucuklarının önbelleği varsayılan olarak saatte bir yenilenir.</li>
</ul>

<h2>Paylaşmak, uygulama ya da yerleştirme?</h2>
<div class="tbl-wrap"><table><tr><th>İhtiyaç</th><th>Yol</th><th>Dikkat</th></tr>
<tr><td>Üç kişiye hızlıca göster</td><td>Doğrudan paylaşım bağlantısı</td><td>“Yeniden paylaşabilir” ve “Derleyebilir” kutularını bilinçli seç</td></tr>
<tr><td>300 kişilik satış ekibine düzenli dağıtım</td><td>Uygulama + kitleler</td><td>Gruplarla erişim, RLS testi</td></tr>
<tr><td>Ekibin çalıştığı yerde göster</td><td>Teams sekmesi, SharePoint web bölümü</td><td>Kullanıcının rapora erişimi olmalı; RLS geçerli</td></tr>
<tr><td>Şirket içi bir portala göm</td><td>Kuruluşunuz için yerleştirme (kullanıcı kendi kimliğiyle)</td><td>Her kullanıcının lisansı ve erişimi gerekir</td></tr>
<tr><td>Müşterilere (Power BI hesabı olmayan) göster</td><td>Müşterileriniz için yerleştirme (uygulama verinin sahibi)</td><td>Hizmet sorumlusu RLS rolüne eklenemez; etkin kimlik yerleştirme belirtecinde gönderilir; kapasite gerekir</td></tr>
<tr><td>Herkese açık veri</td><td>Web'de yayımla</td><td>İnternetteki herkes görür; kurumsal veri için asla</td></tr></table></div>
<div class="tip"><b>Kontrol listesi</b>Model ve raporlar ayrı çalışma alanlarında mı? · Erişim gruplarla mı veriliyor? · Son kullanıcılar uygulama ile mi geliyor, çalışma alanı rolü almadan? · Yenileme sayısı ve süresi lisans sınırına uygun mu? · Hata bildirimleri ekip listesine gidiyor mu? · Raporda veri tazeliği göstergesi var mı?</div>
`, ex: [
  { t: 'mc', q: `Satış direktörü Pro çalışma alanındaki modelin günde 12 kez, iki saatte bir zamanlanmış olarak yenilenmesini istiyor. Zamanlama ekranında 8'den fazla saat eklenemiyor. Ne önerirsin?`,
    o: [`Ek yenilemeleri Power Automate ile REST API'den tetiklemek`, `İhtiyacı doğrulayıp gerekirse PPU'ya geçmek`, `Aynı modeli kopyalayıp iki ayrı zamanlama kurmak`, `“Şimdi yenile”yi bir kullanıcıya her iki saatte bir yaptırmak`], a: 1,
    why: `Pro'da günde 8 zamanlanmış yenileme sınırı API ile tetiklenenleri de kapsar. Önce iş ihtiyacını netleştir; gerçekten gerekiyorsa PPU/kapasite (48) ya da DirectQuery/Direct Lake. Model kopyalamak iki doğru kaynak üretir; elle yenileme sürdürülebilir değildir.` },
  { t: 'mc', q: `Yaz tatilinden dönen analist, kampanya modelinin zamanlanmış yenilemesinin “etkinlik olmadığı için” durdurulduğunu bildiren bir e-posta görüyor. Model iki aydır kimse tarafından açılmamış. Ne olmuştur?`,
    o: [`Kimlik bilgilerinin süresi dolduğu için yenileme durdu`, `Ağ geçidi çevrim dışı kaldığı için zamanlama silindi`, `İki ay kullanılmayan modelde yenileme duraklatıldı`, `Pro lisansının süresi dolduğu için model arşivlendi`], a: 2,
    why: `Modele bağlı rapor ya da pano iki ay açılmazsa Power BI zamanlanmış yenilemeyi duraklatır ve sahibine e-posta gönderir; raporu açmak ya da “Şimdi yenile” zamanlamayı sürdürür. Kimlik bilgisi ve ağ geçidi sorunları ayrı hata e-postası üretir; lisans süresi bu mesajı vermez.` },
  { t: 'mc', q: `Bir modelin tek sorgusu, şirket içindeki SQL Server'dan sipariş satırlarını ve SharePoint Online'daki bir Excel'den hedefleri birleştiriyor. Yenileme “veri kaynağı tanımlı değil” hatası veriyor. Doğru kurulum?`,
    o: [`İki kaynağı da aynı ağ geçidinde veri kaynağı olarak tanımlamak`, `SQL'i ağ geçidine, SharePoint'i doğrudan bulut bağlantısına bırakmak`, `SharePoint dosyası için kişisel modda ikinci bir ağ geçidi kurmak`, `Hedef Excel'ini OneDrive'a taşıyıp sorgudan ayırmak`], a: 0,
    why: `Model tek bir ağ geçidi bağlantısı kullanır; şirket içi ve bulut kaynakları aynı sorguda birleşiyorsa bulut kaynağı da o ağ geçidi üzerinden tanımlanmalıdır. İkinci ağ geçidi kullanılamaz; dosyayı OneDrive'a taşımak birleştirmeyi ortadan kaldırmaz.` },
  { t: 'mc', q: `Tek bir “Satış” çalışma alanından üç farklı departmana, her birinin kendi menüsü, erişim listesi ve bağımsız güncelleme takvimi olan üç ayrı paket dağıtmak istiyorsun. Hangisi?`,
    o: [`Tek çalışma alanı uygulaması ve üç kitle`, `Üç çalışma alanı açıp her birine bir uygulama`, `Raporları doğrudan paylaşım ile üç gruba göndermek`, `Aynı çalışma alanında üç ayrı kuruluş uygulaması`], a: 3,
    why: `Kuruluş uygulamaları öğe olduğu için bir çalışma alanında birden çok tane oluşturulabilir; her birinin erişimi ve kaydetme zamanı bağımsızdır. Tek uygulama + kitle tek güncelleme akışı demektir; üç çalışma alanı içeriği gereksiz böler; doğrudan paylaşım menü ve sürüm sağlamaz.` },
  { t: 'mc', q: `Bir yazılım şirketi, kendi portalında müşterilerine (Power BI hesabı yok) yalnızca kendi verilerini gösteren raporlar sunmak istiyor. Model RLS'li. Hangi kurgu doğru?`,
    o: [`Web'de yayımla ile üretilen bağlantıyı portala koymak`, `Müşteriler için yerleştirme ve belirteçte etkin kimlik`, `Her müşteriye ücretsiz lisans verip doğrudan paylaşmak`, `Kuruluşunuz için yerleştirme ile kullanıcıların kendi kimliği`], a: 1,
    why: `Hesabı olmayan dış kullanıcılar için “uygulama verinin sahibi” yerleştirmesi kullanılır; hizmet sorumlusu rollere eklenemediği için müşterinin kimliği yerleştirme belirtecinde etkin kimlik olarak gönderilir ve RLS böyle uygulanır. Web'de yayımla herkese açıktır; diğer iki yol Power BI hesabı gerektirir.` },
  { t: 'dax', name: 'Son Veri Tarihi', q: `<b>Son Veri Tarihi</b>: Raporun veri tazeliği kartı için iptal edilmemiş satışların en son tarihini döndüren ölçüyü yaz. Kartta seçili yıl ya da kategoriye göre değişebilir.`,
    sol: `CALCULATE(MAX(Satislar[Tarih]), Satislar[Durum] <> "İptal")`, hint: `MAX(Satislar[Tarih]) ifadesini CALCULATE ile iptal filtresinin içine al.` }
] });

/* ===================================================================== 7. YÖNETİŞİM */
ext('yonetisim', { min: 20, html: `
<h2>Kiracı ayarları: kim neyi yapabilir?</h2>
<p>Anadolu Market'in denetim ekibi soruyor: “Müşteri listesini kim CSV olarak indirebilir? Bir rapor internete açılabilir mi? Kim sertifika verebilir?” Bu soruların cevabı rapor dosyalarında değil, Yönetici portalı → <b>Kiracı ayarları</b> (Tenant settings) ekranındadır. Ayarların çoğu üç biçimde açılır: tüm kuruluş, belirli güvenlik grupları ya da belirli gruplar hariç herkes.</p>
<div class="tbl-wrap"><table><tr><th>Ayar grubu</th><th>Örnek ayarlar</th><th>Önerilen başlangıç</th></tr>
<tr><td>Dışa aktarma</td><td>Excel'e aktar, .csv'ye aktar, PDF/PowerPoint olarak aktar, rapor indirme (.pbix), yazdırma</td><td>Açık; ama .csv yalnızca belirli gruplara</td></tr>
<tr><td>Canlı bağlantı</td><td>Excel'de canlı bağlantıyla çalışma (Excel'de Çözümle)</td><td>Açık; RLS geçerli olduğu için güvenli</td></tr>
<tr><td>Paylaşım</td><td>Web'de yayımla, konuk kullanıcılar, kuruluş genelinde paylaşım bağlantısı</td><td>Web'de yayımla kapalı ya da çok küçük bir grup</td></tr>
<tr><td>Abonelik</td><td>E-posta aboneliği kurma, dış kullanıcılara gönderme</td><td>Dış gönderim kapalı</td></tr>
<tr><td>Onaylama</td><td>Sertifikalama, ana veri onayı</td><td>Yalnızca atanmış gözden geçirenler</td></tr>
<tr><td>Bileşik model</td><td>Power BI anlam modellerine DirectQuery bağlantıları</td><td>Açık, eğitimli yazar grubu için</td></tr></table></div>
<p>İki pratik kural: <b>ayarı gruba bağla</b> (kişi listesi yönetilmez) ve <b>her değişikliği gerekçesiyle kaydet</b>. Kiracı ayarları değiştiği anda herkesi etkiler; değişiklik günlüğü olmayan bir kiracıda “bu ne zaman açıldı?” sorusunun cevabı yoktur. Büyük kuruluşlarda sertifikalama yetkisi etki alanı (domain) yöneticilerine devredilebilir; her iş biriminin kendi gözden geçirenleri olur.</p>

<h2>Onaylama: tanıtılmış, sertifikalı, ana veri</h2>
<div class="tbl-wrap"><table><tr><th>Rozet</th><th>Anlamı</th><th>Kim verir?</th><th>Hangi öğeler?</th></tr>
<tr><td>Tanıtılmış (Promoted)</td><td>“Sahibi olarak bunu paylaşmaya hazır görüyorum”</td><td>Öğede yazma izni olan herkes</td><td>Panolar hariç tüm öğeler</td></tr>
<tr><td>Sertifikalı (Certified)</td><td>Kuruluşun kalite standardından geçti</td><td>Yalnızca yöneticinin atadığı gözden geçirenler; herkes talep edebilir</td><td>Panolar hariç tüm öğeler</td></tr>
<tr><td>Ana veri (Master data)</td><td>Kuruluşun temel referans verisi (ürün kodları, müşteri listesi)</td><td>Yalnızca yöneticinin atadığı kişiler</td><td>Yalnızca veri içeren öğeler: lakehouse, anlam modeli…</td></tr></table></div>
<p>Rozet bir süreç sonucudur, süreç değildir. Sertifika vermeden önce gözden geçirenin baktığı somut bir liste olmalı. Bunun en kritik maddesi: <b>ölçüleri kendi kırılım sütunlarında test et</b>. Bu modelde hazır <code>[Net Satış]</code> ölçüsü Durum'a göre kesildiğinde ne olur?</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(Satislar[Durum], "Toplam Satış", [Toplam Satış], "Net Satış", [Net Satış])</pre>
<p>Toplam Satış her durum için farklıdır (Teslim Edildi 1.049.627,00 ₺, İptal 95.417,40 ₺…), ama Net Satış <b>her satırda 1.250.772,45 ₺</b> görünür; İptal satırında bile. Ölçü sütun filtresiyle Durum filtresinin üzerine yazar (DAX optimizasyonu dersinde mekanizması var). Bu bir “hata” mı, “bilinen davranış” mı? Sertifika kararı tam olarak bunu belgelemektir: ya ölçü KEEPFILTERS ile düzeltilir ya da açıklamasına “Durum kırılımında kullanma” yazılır.</p>
<ul>
<li><b>Sertifika kontrol listesi:</b> sahibi ve yedek sahibi belli · tüm ölçülerin açıklaması var · kırılım testleri yapılmış · RLS test kullanıcılarıyla doğrulanmış · yenileme zamanlaması ve hata bildirimi ekip listesine gidiyor · duyarlılık etiketi uygun · etki analizi ile bağlı öğeler biliniyor.</li>
<li><b>Sertifikayı geri almak</b> da süreçtir: model artık bakımı yapılmıyorsa rozet kaldırılmalı; aksi hâlde kullanıcılar eski modeli “güvenilir” sanar.</li>
</ul>

<h2>Duyarlılık etiketleri: devralma ve dışa aktarma</h2>
<p>Etiketleri uygulamak için Microsoft Purview Information Protection lisansının yanında Power BI Pro ya da PPU gerekir; etiketin kullanıcıya bir etiket ilkesiyle yayımlanmış olması da şarttır. Uygulamada önemli olan, etiketin nereye <b>gittiğidir</b>:</p>
<ul>
<li><b>Aşağı yönlü devralma</b> varsayılan olarak açıktır: “Gizli” etiketli bir anlam modelinin üzerine kurulan raporlar ve panolar etiketi devralır.</li>
<li><b>Veri kaynağından devralma:</b> anlam modeli etiketli bir kaynaktan (ör. etiketli bir Excel) veri alınca o etiketi alabilir.</li>
<li><b>Zorunlu etiket ve varsayılan etiket</b> ilkeleri Power BI öğelerinde tam desteklenir: kullanıcı etiket seçmeden kaydedemez ya da varsayılan etiket kendiliğinden atanır.</li>
<li><b>Dışa aktarma:</b> Excel, PDF, PowerPoint, Excel'de Çözümle ve .pbix indirme etiketi dosyaya taşır; etiket şifreleme içeriyorsa dosya korunur. <b>.csv ve .txt dışa aktarımı etiketi taşımaz.</b> Gizli verili modellerde .csv dışa aktarımını bu yüzden kısıtla.</li>
<li>Power BI Projesi (PBIP) biçimi duyarlılık etiketlerini desteklemez; etiketli içeriği Git'e taşımadan önce bu farkı bil (Yaşam döngüsü dersi).</li>
</ul>

<h2>Denetim: kim neyi açtı, kim neyi dışa aktardı?</h2>
<p>Bir müşteri listesinin dışarı sızdığı iddia ediliyor. “Son 30 günde bu raporu kim dışa aktardı?” sorusunun iki kaynağı vardır:</p>
<div class="tbl-wrap"><table><tr><th></th><th>Denetim günlüğü (Purview)</th><th>Etkinlik günlüğü (Power BI)</th></tr>
<tr><td>Kapsam</td><td>Fabric ve Power BI dahil Microsoft 365 etkinlikleri</td><td>Yalnızca Power BI etkinlikleri</td></tr>
<tr><td>Erişim</td><td>Purview portalında denetim araması</td><td>Yönetici REST API'si (ActivityEvents) ya da <code>Get-PowerBIActivityEvent</code></td></tr>
<tr><td>Kim kullanır?</td><td>Uyumluluk ve güvenlik ekipleri</td><td>Fabric yöneticisi; otomasyonla</td></tr>
<tr><td>Not</td><td>Diğer Microsoft 365 olaylarıyla birlikte sorgulanır</td><td>Her istek tek bir günü (UTC) kapsar; olaylar genellikle 30–60 dakika içinde düşer</td></tr></table></div>
<p>Etkinlik günlüğünün geçmişi sınırlıdır. Kurumsal uygulama, her gece önceki günün olaylarını bir betikle çekip kendi deponda (ör. bir lakehouse tablosunda) biriktirmektir. Böylece “kim, hangi raporu, ne zaman görüntüledi ya da dışa aktardı” sorusu aylar sonra da cevaplanır ve kullanılmayan raporlar da bulunur: 90 gündür görüntülenmeyen bir rapor emekliye ayrılma adayıdır.</p>

<h2>Etki analizi ve dışa aktarım kontrolü</h2>
<p>Bir sütunun adını değiştirmeden önce Soy (lineage) görünümünde öğeyi aç ve <b>Etki analizi</b>'ne bak: kaç model, rapor, pano, kaç görüntüleme? Etkilenen öğelerin kişilerine buradan bildirim gönderebilirsin. Dışa aktarımı ise üç katmanda yönetirsin:</p>
<ol>
<li><b>Kiracı:</b> hangi biçimler kimlere açık (yukarıdaki tablo).</li>
<li><b>Rapor:</b> Desktop'ta Seçenekler → Geçerli dosya → Rapor ayarları → dışa aktarma: yalnızca özetlenmiş veri, özetlenmiş ve temel veri ya da hiç. Kiracı ayarından daha geniş olamaz.</li>
<li><b>Model:</b> RLS ve OLS. Dışa aktarılan veri de kullanıcının görebildiği satırlarla sınırlıdır; dışa aktarımı kapatmak, görmemesi gereken veriyi görmesinin çaresi değildir.</li>
</ol>
<div class="tip"><b>Yönetişim karar ağacı</b>Veri gizli mi? → etiket + .csv kısıtı + OLS/RLS. · Model birçok ekip tarafından kullanılıyor mu? → sertifika süreci + Derleme izni. · Dış kullanıcı var mı? → konuk ve abonelik ayarları, Web'de yayımla kapalı. · Değişiklik yapılacak mı? → etki analizi + bildirim. · Kim ne yaptı? → günlükleri her gün kendi depona al.</div>
`, ex: [
  { t: 'mc', q: `“Çok gizli” etiketli müşteri modelinden kullanıcıların Excel'e aktardığı dosyalar şifreli geliyor, ama aynı veriler başka bir yerde düz metin olarak bulundu. Etiket ilkesi doğru. En olası açık nedir?`,
    o: [`Excel'de Çözümle etiketi taşımıyor`, `Veri .csv olarak aktarılmış`, `PDF dışa aktarımı şifrelemeyi kaldırıyor`, `Aşağı yönlü devralma kapalı olduğu için`], a: 1,
    why: `Excel, PDF, PowerPoint ve Excel'de Çözümle etiketi ve korumayı dosyaya taşır; .csv ve .txt taşımaz. Bu yüzden gizli modellerde .csv dışa aktarımı kısıtlanır. Devralma, rapor ile model arasındaki etiket aktarımıyla ilgilidir; düz metin dosyayı açıklamaz.` },
  { t: 'mc', q: `Sertifika gözden geçireni, satış modelinde Net Satış'ın Durum tablosunda her satırda aynı tutarı gösterdiğini fark ediyor. Model sahibi “ölçü doğru, iptaller hariç” diyor. Gözden geçirenin doğru kararı?`,
    o: [`Ölçü doğru olduğu için hemen sertifikalamak`, `Modeli tanıtılmış olarak bırakıp sertifikayı reddetmek`, `Düzeltme ya da belgeleme şartı koymak`, `Durum sütununu modelden kaldırtmak`], a: 2,
    why: `Sertifika, davranışın bilindiği ve belgelendiği anlamına gelir. Sütun filtresi Durum kırılımının üzerine yazdığı için her satırda aynı tutar çıkar; ya KEEPFILTERS ile düzeltilmeli ya da açıklamada “Durum kırılımında kullanma” yazmalı. Olduğu gibi sertifikalamak kullanıcıyı yanıltır; reddetmek ya da sütunu kaldırmak gerekçesiz sert bir tepkidir.` },
  { t: 'mc', q: `Güvenlik ekibi altı ay önceki bir rapor dışa aktarımının kim tarafından yapıldığını soruyor. Kimse etkinlik günlüğünü düzenli toplamamış. Gelecekte bu soruya cevap verebilmek için ne kurarsın?`,
    o: [`Raporlara “dışa aktarmayın” uyarısı eklemek`, `Tüm kullanıcılar için dışa aktarmayı kapatmak`, `Her raporu sertifikalı yapıp sahiplerine sormak`, `Olayları her gece kendi depoda biriktirmek`], a: 3,
    why: `Etkinlik günlüğünün geçmişi sınırlıdır ve istek başına tek gün döner; her gece önceki günü çekip bir depoda tutmak geriye dönük soruları cevaplanabilir kılar. Uyarı metni kanıt üretmez; dışa aktarmayı tamamen kapatmak iş akışını bozar ve geçmişi açıklamaz; sertifika denetim kaydı değildir.` },
  { t: 'mc', q: `Ürün kodları ve kategori eşlemesini içeren lakehouse tablosu, şirketin tüm modellerinin referans kaynağı. Kullanıcıların bunu tek ve yetkili kaynak olarak tanıması isteniyor. Hangi onay?`,
    o: [`Ana veri (master data) rozeti`, `Tanıtılmış rozet`, `Raporlara “resmi” başlığı eklemek`, `Panoya sabitleyip öne çıkarmak`], a: 0,
    why: `Ana veri rozeti, veri içeren öğelerin kuruluşun yetkili temel verisi olduğunu gösterir ve yalnızca yöneticinin atadığı kişilerce verilir. Tanıtılmış rozeti herkes verebilir ve yetki ifade etmez; başlık ya da pano sabitleme bir onay mekanizması değildir.` },
  { t: 'mc', q: `BI ekibi <code>Musteriler[Segment]</code> sütununu yeniden adlandırmak istiyor. Kaç rapor ve kullanıcının etkileneceğini bilmiyor. İlk adım?`,
    o: [`Sütunu adlandırıp bozulan raporları beklemek`, `Eski adla yeni bir hesaplanmış sütun daha eklemek`, `Etki analizine bakıp sahiplere bildirmek`, `Tüm rapor yazarlarına e-posta atıp sormak`], a: 2,
    why: `Etki analizi, bağlı model, rapor ve panoları ve görüntüleme sayılarını gösterir; ilgili kişilere oradan bildirim gönderilir. Bozulmayı beklemek kullanıcıyı mağdur eder; kopya sütun teknik borç üretir; herkese e-posta göndermek kimin etkilendiğini söylemez.` },
  { t: 'query', q: `Sertifika öncesi kırılım testi: <code>Satislar[Kanal]</code> satırlarında “Toplam Satış” ve “Net Satış” değerlerini yan yana döndür; iki ölçünün kanal kırılımında nasıl davrandığını karşılaştır.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nSUMMARIZECOLUMNS(\n    Satislar[Kanal],\n    "Toplam Satış", [Toplam Satış],\n    "Net Satış", [Net Satış]\n)`, hint: `SUMMARIZECOLUMNS(Satislar[Kanal], "Toplam Satış", [Toplam Satış], "Net Satış", [Net Satış]).` }
] });

/* ===================================================================== 8. SAYFALANDIRILMIŞ */
ext('sayfalandirilmis', { min: 20, html: `
<h2>Report Builder ile ilk rapor: kaynaktan tabloya</h2>
<p>Muhasebe her ay sonunda mağaza kanalının sipariş satırlarını, logolu ve sayfa numaralı bir PDF olarak istiyor. Power BI Report Builder ücretsizdir ve sayfalandırılmış raporun (.rdl) ana tasarım aracıdır. RDL, raporun bütün tanımını (veri kaynağı, sorgu, parametreler, yerleşim) tutan bir XML dosyasıdır; metin olduğu için sürüm denetimine de girer.</p>
<ol>
<li><b>Veri kaynağı:</b> Veri kaynakları → Ekle → <b>Power BI anlam modeli</b>. Onaylı satış modelini seçmek, aynı ölçüleri (Net Satış, Sipariş Sayısı) burada da kullanmak demektir.</li>
<li><b>Veri kümesi:</b> Sorgu tasarımcısında alanları sürükle ya da DAX sorgusunu kendin yaz. Veri kümesi bir DAX sorgusudur; sonucu düz bir tablodur.</li>
<li><b>Tablix:</b> Tablo/matris/liste aynı denetimin farklı biçimleridir. Satır grupları (ör. Tarih'e göre), grup alt toplamları, “her sayfada başlığı tekrarla” ayarı ve grup başında sayfa sonu buradan verilir.</li>
<li><b>Üst/alt bilgi:</b> logo, rapor adı, <code>=Globals!PageNumber &amp; " / " &amp; Globals!TotalPages</code> ifadesiyle sayfa numarası, oluşturma zamanı.</li>
<li><b>Yayımla:</b> Report Builder'dan doğrudan Service'e.</li>
</ol>
<p>Muhasebenin istediği listenin veri kümesi şöyle bir sorgudur (ay ve kanal şimdilik sabit):</p>
<pre class="dax">EVALUATE
CALCULATETABLE(
    SELECTCOLUMNS(Satislar, "Sipariş", Satislar[SiparisNo], "Tarih", Satislar[Tarih], "Durum", Satislar[Durum], "Tutar", Satislar[Tutar]),
    Satislar[Kanal] = "Mağaza",
    Tarih[YilAy] = "2024-12"
)</pre>

<h2>Parametreler: tek değer, çoklu değer, basamaklı</h2>
<p>Sabit “2024-12” yerine kullanıcı ayı ve kategorileri seçmeli. Report Builder'da her parametre bir ad, tür, kullanılabilir değerler (çoğu zaman ayrı bir küçük veri kümesinden) ve varsayılan değer taşır. Sorgu tasarımcısı parametreli filtreyi kendisi üretir; DAX'ı elle yazıyorsan çoklu değerli parametre sorguya <b>tek bir metin</b> olarak gelir. Yaygın kalıp, değerleri parametre ifadesinde birleştirip DAX'ta yola çevirmektir:</p>
<pre class="dax" data-notry>-- Parametre ifadesi (veri kümesi özellikleri → Parametreler):
--   @Kategoriler = Join(Parameters!Kategori.Value, "|")
EVALUATE
SUMMARIZECOLUMNS(
    Kategoriler[Kategori],
    FILTER(VALUES(Kategoriler[Kategori]), PATHCONTAINS(@Kategoriler, Kategoriler[Kategori])),
    "Net Satış", [Net Satış]
)</pre>
<p>Aynı mantığı sabit değerlerle, motorun çalıştırabildiği biçimde denemek için <code>TREATAS</code> kullanılır. “Elektronik ve Kitap” seçimi için:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(
    Kategoriler[Kategori],
    TREATAS({"Elektronik", "Kitap"}, Kategoriler[Kategori]),
    "Net Satış", [Net Satış]
)</pre>
<p>Sonuç iki satırdır: Elektronik 339.303,65 ₺, Kitap 151.882,40 ₺. <b>Basamaklı parametrede</b> ikinci parametrenin (Ürün) kullanılabilir değerleri, birinci parametreye (Kategori) göre süzülen ayrı bir veri kümesinden gelir. Kenar durumlar: “Tümü” seçeneği için parametreye boş değer izni ver ve sorguda boşsa filtre uygulama; çok seçenekli bir listede yüzlerce ürün varsa kullanıcıya önce kategori seçtir.</p>

<h2>Ne zaman sayfalandırılmış rapor? Karar tablosu</h2>
<div class="tbl-wrap"><table><tr><th>İhtiyaç</th><th>En iyi araç</th><th>Neden</th></tr>
<tr><td>Yönetici keşif yapacak, tıklayıp detaya inecek</td><td>Etkileşimli rapor</td><td>Çapraz filtre, araç ipucu, detaya inme</td></tr>
<tr><td>Analist kendi pivotunu kuracak</td><td>Excel'de Çözümle</td><td>Canlı bağlantı, RLS geçerli, Excel becerisi</td></tr>
<tr><td>Tüm satırlar eksiksiz, sayfa sayfa, imza alanıyla</td><td>Sayfalandırılmış rapor</td><td>Tablo kaç sayfa olursa olsun basılır</td></tr>
<tr><td>Her ay aynı belge e-postayla, ekte PDF</td><td>Sayfalandırılmış rapor + abonelik</td><td>Parametreli abonelik, sabit düzen</td></tr>
<tr><td>Etkileşimli sayfada “yazdırılabilir liste” düğmesi</td><td>Sayfalandırılmış rapor görseli</td><td>Raporun filtreleri parametre olarak geçer</td></tr></table></div>

<h2>Lisans, sınırlar ve dağıtım</h2>
<ul>
<li><b>Oluşturma:</b> Report Builder ile oluşturmak ve Çalışma alanım'a yayımlamak için Pro/PPU gerekmez. Başka bir çalışma alanına yayımlamak için Pro ya da PPU gerekir.</li>
<li><b>Görüntüleme:</b> Fabric F64 ya da üstü (veya Premium P1 ve üstü) kapasitedeki çalışma alanlarında ücretsiz lisanslı kullanıcılar görüntüleyebilir. Diğer durumlarda görüntüleyicinin Pro ya da PPU'su olmalı. Sayfalandırılmış raporlar Pro çalışma alanlarında da çalışır ve uygulamalara eklenebilir.</li>
<li><b>Dışa aktarım biçimleri:</b> Excel, Word, PowerPoint, PDF, erişilebilir PDF, CSV, XML ve MHTML.</li>
<li><b>Web'de tasarım:</b> Service içinde yalnızca basit, tek tablolu raporlar oluşturulabilir; ciddi tasarım için Report Builder.</li>
<li><b>Sınırlar:</b> SSRS'nin paylaşılan veri kaynakları (.rds) ve paylaşılan veri kümeleri (.rsd) desteklenmez; özel derlemeler (custom assemblies) yoktur; şirket içi kaynaklar ve saklı yordamlar ağ geçidi üzerinden çalışır.</li>
<li><b>RLS:</b> rapor anlam modeline bağlıysa kullanıcının RLS rolü geçerlidir; ama Service'teki “Rol olarak test et” sayfalandırılmış raporlarda çalışmaz. Testi gerçek bir test kullanıcısıyla yap.</li>
</ul>
<h3>Abonelikle PDF dağıtımı</h3>
<p>Sayfalandırılmış raporun aboneliğinde biçim (PDF, Excel…) ve <b>parametre değerleri</b> seçilir: “Her ayın 1'inde, önceki ay, Mağaza kanalı, PDF ekli”. Varsayılan değeri “önceki ay” olarak hesaplayan bir parametre ifadesi kullanırsan aboneliği her ay güncellemen gerekmez. Her alıcıya kendi verisini göndermek için alıcı listesi ve parametre değerleri bir tablodan okunan dinamik abonelik kullanılır.</p>
<div class="tip"><b>Kontrol listesi</b>Veri kaynağı onaylı anlam modeli mi? · Parametrelerin varsayılanı abonelikte elle değiştirme gerektirmiyor mu? · “Tümü” ve boş seçim davranışı test edildi mi? · Başlık her sayfada tekrar ediyor, sayfa numarası var mı? · Görüntüleyicilerin lisansı çalışma alanı kapasitesine uygun mu? · RLS gerçek bir test hesabıyla denendi mi?</div>
`, ex: [
  { t: 'mc', q: `Bir analistin Pro lisansı yok. Report Builder'da bir sipariş listesi tasarlayıp ekip çalışma alanına (Pro) yayımlamak istiyor. Ne olur?`,
    o: [`Çalışma alanım'a evet; ekip alanına Pro/PPU gerekir`, `Report Builder lisanssız açılmaz; tasarım bile yapamaz`, `Pro çalışma alanları sayfalandırılmış raporu hiç desteklemez`, `Yayımlayabilir ama raporu yalnızca kendisi açabilir`], a: 0,
    why: `Report Builder ücretsizdir; Çalışma alanım'a yayımlamak için lisans gerekmez. Başka bir çalışma alanına yayımlamak Pro ya da PPU gerektirir. Pro çalışma alanları sayfalandırılmış raporları destekler; son şık yayımlamanın mümkün olduğunu varsayıyor, ki değil.` },
  { t: 'mc', q: `Şirket F64 kapasitesinde. 400 mağaza çalışanının (ücretsiz lisanslı) her ay kendi mağazasının sipariş listesini görmesi gerekiyor. Rapor bir kapasite çalışma alanında. Ek lisans gerekir mi?`,
    o: [`Evet; sayfalandırılmış rapor her zaman Pro ister`, `Evet; ücretsiz kullanıcılar yalnızca PDF eki alabilir`, `Hayır; ama yalnızca rapor Çalışma alanım'daysa`, `Hayır; F64 ve üstünde ücretsiz kullanıcılar görebilir`], a: 3,
    why: `F64 ve üstü Fabric (ya da P1 ve üstü Premium) kapasitedeki çalışma alanlarında ücretsiz lisanslı kullanıcılar sayfalandırılmış raporları görüntüleyebilir. Pro yalnızca kapasite dışındaki alanlarda gerekir. Çalışma alanım paylaşım için doğru yer değildir.` },
  { t: 'mc', q: `Elle yazılmış DAX veri kümesinde çoklu değerli <code>@Kategori</code> parametresi kullanılıyor. Kullanıcı iki kategori seçince rapor hiç satır döndürmüyor, tek kategoride çalışıyor. Neden?`,
    o: [`Çoklu değerli parametreler DAX'ta hiç desteklenmez`, `Değerler tek metin olarak geliyor; eşitlik tutmuyor`, `Kategori tablosu ile Satislar ilişkisi tek yönlü`, `Parametrenin varsayılan değeri boş bırakılmış olduğu için`], a: 1,
    why: `Elle yazılmış DAX'ta çoklu değer tek bir metin olarak gelir (“Elektronik,Kitap”); Kategori = @Kategori hiçbir satırda tutmaz. Değerleri birleştirip PATHCONTAINS ya da benzeri bir yöntemle ayırmak gerekir. Çoklu değer kullanılabilir; ilişki yönü ve varsayılan değer bu belirtiyi açıklamaz.` },
  { t: 'mc', q: `Bölge müdürleri her ayın ilk günü yalnızca önceki ayın satış listesini PDF olarak almak istiyor. Abonelik geçen ay elle “2024-11” olarak kurulmuştu ve bu ay yine Kasım geldi. Kalıcı çözüm?`,
    o: [`Her ay aboneliği açıp parametreyi elle değiştirmek`, `Raporu etkileşimli rapora çevirip pano aboneliği kurmak`, `Varsayılanı “önceki ay” ifadesiyle hesaplamak`, `Aboneliği haftalık yapıp müdürlerin doğru haftayı seçmesi`], a: 2,
    why: `Varsayılan değeri ifadeyle hesaplanan bir parametre (bugünden bir ay önce), aboneliğin her çalışmada doğru ayı kullanmasını sağlar. Elle güncelleme unutulur; etkileşimli rapora geçmek sabit PDF ihtiyacını karşılamaz; haftalık gönderim işi kullanıcıya yükler.` },
  { t: 'query', q: `Bir parametre seçiminin sorguya etkisini dene: <b>Giyim, Spor ve Kozmetik</b> kategorileri seçilmiş gibi, her kanal (<code>Satislar[Kanal]</code>) için “Net Satış” döndür. Kategori seçimini TREATAS ile ver.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nSUMMARIZECOLUMNS(\n    Satislar[Kanal],\n    TREATAS({"Giyim", "Spor", "Kozmetik"}, Kategoriler[Kategori]),\n    "Net Satış", [Net Satış]\n)`, hint: `SUMMARIZECOLUMNS(Satislar[Kanal], TREATAS({...}, Kategoriler[Kategori]), "Net Satış", [Net Satış]).` },
  { t: 'query', q: `Fatura listesi veri kümesi yaz: <b>Web</b> kanalının <b>2024-11</b> ayındaki satış satırlarını; sipariş numarası (“Sipariş”), tarih (“Tarih”) ve tutar (“Tutar”) sütunlarıyla döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nCALCULATETABLE(\n    SELECTCOLUMNS(Satislar, "Sipariş", Satislar[SiparisNo], "Tarih", Satislar[Tarih], "Tutar", Satislar[Tutar]),\n    Satislar[Kanal] = "Web",\n    Tarih[YilAy] = "2024-11"\n)`, hint: `SELECTCOLUMNS ile üç sütunu seç; CALCULATETABLE içinde Satislar[Kanal] = "Web" ve Tarih[YilAy] = "2024-11" filtrelerini ver.` }
] });

/* ===================================================================== 9. YAŞAM DÖNGÜSÜ */
ext('yasam-dongusu', { min: 22, html: `
<h2>Dal stratejisi: kim nerede çalışır?</h2>
<p>BI ekibi üç kişi: biri yeni RFM ölçüleri yazıyor, biri tarih tablosunu düzeltiyor, biri rapor sayfalarını yeniliyor. Hepsi aynı geliştirme çalışma alanına yayımlarsa son yayımlayan diğerlerinin işini ezer. Git tümleştirmesinde temel fikir şudur: <b>bir çalışma alanı bir dala bağlıdır</b>; dal değiştirmek, bağlı çalışma alanının içeriğini o dalın içeriğine göre güncellemektir.</p>
<div class="tbl-wrap"><table><tr><th>Strateji</th><th>Nasıl işler?</th><th>Ne zaman uygun?</th></tr>
<tr><td>Ana dal + Desktop'ta kısa özellik dalları</td><td>Geliştirici dalı yerelde açar, PBIP'i Desktop'ta düzenler, çekme isteği (pull request) açar; birleşince Dev çalışma alanı ana daldan güncellenir</td><td>Küçük ekipler; en yaygın başlangıç</td></tr>
<tr><td>Özellik dalı başına çalışma alanı</td><td>Kaynak denetimi panelinden “başka bir çalışma alanına dallan” ile dal ve ona bağlı bir çalışma alanı oluşur</td><td>Service'te test edilmesi gereken değişiklikler; Fabric öğeleriyle çalışan ekipler</td></tr>
<tr><td>Doğrudan ana dala işleme</td><td>Herkes Dev çalışma alanında çalışır, oradan işler (commit)</td><td>Tek kişilik ekip; kod incelemesi yok</td></tr></table></div>
<p>Git tümleştirmesi Azure DevOps, GitHub ve GitHub Enterprise'ın bulut sürümleriyle çalışır. Raporlar, anlam modelleri ve sayfalandırılmış raporlar Git tümleştirmesinde hâlâ <b>önizleme</b> etiketlidir; desteklenmeyen öğeler (ör. panolar) çalışma alanında kalır ama depoya yazılmaz. Desteklenmeyen öğe yok sayılır, silinmez.</p>
<h3>Çekme isteğinde neye bakılır?</h3>
<ul>
<li><b>TMDL farkları:</b> ölçünün ifadesi, biçim dizesi, görüntüleme klasörü, açıklama. Bir satırlık değişiklik bir satırlık fark olarak görünmelidir.</li>
<li><b>Gürültü:</b> diyagram yerleşimi dosyaları sık değişir ve çakışma üretir. Belgelenmemiş dosyalarda (ör. <code>diagramLayout.json</code>, <code>report.json</code>) elle değişiklik desteklenmez.</li>
<li><b>Yasak dosyalar:</b> <code>.pbi/cache.abf</code> (yerel veri önbelleği) ve <code>.pbi/localSettings.json</code> depoya girmemeli; Desktop'ın oluşturduğu <code>.gitignore</code> bunları zaten dışlar.</li>
</ul>

<h2>Git ve dağıtım işlem hatları birlikte</h2>
<p>Git <b>geliştirme</b> sürecini (kim neyi değiştirdi, inceleme, birleştirme), dağıtım işlem hattı ise <b>ortamlar arası taşıma</b> sürecini yönetir. Yaygın kurgu: Dev çalışma alanı Git'e bağlı; Test ve Prod çalışma alanları bir dağıtım işlem hattının aşamaları.</p>
<ul>
<li>İşlem hattı 2 ile 10 aşama arasında olabilir; varsayılan Geliştirme → Test → Üretim'dir.</li>
<li>Dağıtımda kaynak aşamadaki öğe, hedefte <b>eşleştiği</b> öğenin üzerine yazar. Eşleşmemiş ama aynı ad ve türde bir öğe hedefte varsa üzerine yazılmaz; kopya oluşur. Kaynakta olmayan hedef öğeler dokunulmadan kalır.</li>
<li><b>Dağıtım kuralları</b> ile Test'te test veritabanı, Üretim'de canlı veritabanı kullanılır (veri kaynağı ya da parametre kuralı).</li>
<li>Dağıtım meta veriyi taşır, veriyi değil. Import modelde yeni bir tablo eklendiyse hedefte yenileme ve kimlik bilgisi ayarı gerekir; RLS rol <b>üyelikleri</b> her ortamda ayrıca yönetilir.</li>
</ul>

<h2>Tabular Editor ve Best Practice Analyzer</h2>
<p>Best Practice Analyzer (BPA), modeli JSON olarak yazılmış kurallara göre tarar: “her ölçünün biçim dizesi olsun”, “olgu tablosundaki anahtarlar gizli olsun”, “IFERROR kullanma”, “bölmede DIVIDE kullan”, “çift yönlü ilişkiden kaçın”, “açıklaması olmayan ölçü kalmasın”. Kuralların bir kısmı otomatik düzeltme de önerir. Ekip kuralları depoda tutar; aynı kural seti hem geliştiricinin bilgisayarında hem de çekme isteğinde komut satırından çalışır ve kural ihlali birleştirmeyi durdurur.</p>
<p>Örnek bir ihlal ve düzeltilmiş hâli:</p>
<pre class="dax">Sipariş Başı Kâr (eski) =
IFERROR([Brüt Kâr] / [Sipariş Sayısı], 0)
Sipariş Başı Kâr =
DIVIDE([Brüt Kâr], [Sipariş Sayısı])</pre>
<p>Bu modelde iki ölçü kategori düzeyinde aynı sayıyı verir (Elektronik 596,97 ₺, Kitap 174,84 ₺). Fark kenar durumdadır: sipariş olmayan bir hücrede eski ölçü <b>0</b> döndürür ve satır matriste kalır; yeni ölçü BLANK döndürür, satır düşer. IFERROR ayrıca gerçek bir hatayı da 0'a çevirip saklar. BPA'nın bu kuralı bu yüzden yalnızca stil değil, doğruluk kuralıdır.</p>

<h2>Sürüm notları ve geri alma</h2>
<p>Üretime çıkan her değişikliğin üç sorusu olmalı: <b>Ne değişti?</b> (ölçü tanımı, biçim, yeni tablo) · <b>Kim etkileniyor?</b> (etki analizi: hangi raporlar, kaç görüntüleme) · <b>Nasıl test edildi?</b> (kırılım testi, RLS test kullanıcıları). Bunlar çekme isteği açıklamasına yazılır ve sürüm notu oradan derlenir. Kullanıcıya görünen bir iz bırakmak için modelde basit bir sürüm ölçüsü tutulabilir:</p>
<pre class="dax">Model Sürümü =
"2026.10-3"</pre>
<p>Raporun alt bilgisindeki bir kart bu değeri gösterir; destek talebinde kullanıcı “hangi sürümü görüyorum?” sorusuna cevap verir.</p>
<h3>Geri alma</h3>
<ol>
<li>Hatalı değişikliği Git'te geri al (revert) ve ana dala birleştir; geçmiş silinmez, yeni bir commit oluşur.</li>
<li>Dev çalışma alanını depodan güncelle (update).</li>
<li>İşlem hattında Test'e, sonra Üretim'e yeniden dağıt. Gerekirse yenile.</li>
</ol>
<p>Bu zincir, “dünkü .pbix dosyası kimdeydi?” sorusunu ortadan kaldırır. Ama geri alma, verideki değişikliği geri almaz: yanlış bir Power Query adımı yüzünden yüklenmiş veri, düzeltilmiş tanımla yeniden yenilenmelidir.</p>
<h3>PBIP'in sınırları</h3>
<ul>
<li>Duyarlılık etiketleri desteklenmez; etiketli içerik için süreci ayrıca düşün (Yönetişim dersi).</li>
<li>PBIP doğrudan OneDrive ya da SharePoint'e kaydedilemez. Windows'un 260 karakterlik yol sınırına takılmamak için depo kökünü kısa tut.</li>
<li>Dosyalar BOM'suz UTF-8'dir ve Desktop CRLF satır sonu kullanır; Git'te <code>autocrlf</code> ayarını ekipçe aynı yap.</li>
<li>Desktop'tan yayımlamak yerel önbelleği (veriyi) de gönderir; Git ya da işlem hattıyla dağıtım yalnızca meta veriyi taşır.</li>
</ul>
<div class="tip"><b>Kontrol listesi</b>Dev çalışma alanı Git'e, Test/Prod işlem hattına bağlı mı? · .gitignore önbelleği dışlıyor mu? · BPA kuralları depoda ve çekme isteğinde çalışıyor mu? · Dağıtım kuralları her aşamada doğru kaynağı gösteriyor mu? · Sürüm notu üç soruyu cevaplıyor mu? · Geri alma adımları denendi mi?</div>
`, ex: [
  { t: 'mc', q: `İki geliştirici aynı Dev çalışma alanında çalışıyor ve sık sık birbirinin ölçülerini eziyor. Ekip Git tümleştirmesini açtı ama sorun sürüyor; ikisi de doğrudan Dev'den işleme yapıyor. Ne önerirsin?`,
    o: [`Özellik dalları ve çekme isteğiyle çalışmak`, `Dev çalışma alanını iki ayrı çalışma alanına bölüp iki modele ayırmak`, `Git'i kapatıp yalnızca dağıtım işlem hattı kullanmak`, `Geliştiricilere sırayla yayımlamaları için takvim vermek`], a: 0,
    why: `Çakışmanın kaynağı, iki kişinin aynı dalda doğrudan çalışması. Özellik dalları ve çekme isteği değişiklikleri ayrı tutar, incelemeyi ve birleştirmeyi Git'e bırakır. Modeli bölmek tek doğru kaynağı bozar; işlem hattı ortam taşır, eşzamanlı geliştirmeyi çözmez; takvim ölçeklenmez.` },
  { t: 'mc', q: `Test aşamasına dağıtılan yeni modelde raporlar açılıyor ama yeni eklenen <code>SatinAlmalar</code> tablosu boş görünüyor. Dev'de dolu. En olası neden?`,
    o: [`Dağıtım kuralı tabloyu filtreliyor`, `Tablo Git'te önizleme olduğu için taşınmadı`, `Dağıtım veriyi taşımaz; Test'te yenileme yapılmadı`, `RLS rolleri Test'e kopyalanmadığı için`], a: 2,
    why: `İşlem hattı meta veriyi taşır, veriyi değil. Yeni tablonun Test'te dolması için o aşamada yenileme (ve gerekirse kimlik bilgisi) gerekir. Dağıtım kuralları kaynak/parametre değiştirir, satır filtrelemez; Git önizleme durumu işlem hattını etkilemez; rol eksikliği tabloyu boşaltmaz.` },
  { t: 'mc', q: `Çekme isteği incelemesinde, tek bir ölçünün biçimini değiştiren bir değişiklikte 4 MB'lık <code>cache.abf</code> dosyasının da depoya eklendiği görülüyor. Ne yaparsın?`,
    o: [`Dosyayı bırakırım; modeli açmak için gerekli`, `Çıkarır, .gitignore'u düzeltirim`, `Dosyayı ayrı bir dala taşırım`, `Dosyayı sıkıştırıp tekrar eklerim`], a: 1,
    why: `cache.abf yerel veri önbelleğidir; depoya girmemelidir (hem boyut hem de veri sızıntısı riski). Desktop'ın varsayılan .gitignore'u bunu dışlar; muhtemelen silinmiş ya da değiştirilmiştir. Model meta veriden açılır, önbelleğe ihtiyaç duymaz; ayrı dal ya da sıkıştırma sorunu çözmez.` },
  { t: 'mc', q: `Üretimdeki Net Satış tanımı dün yanlış değiştirildi ve aylık raporlar hatalı. Değişiklik Git'te tek bir commit. En güvenli geri alma sırası?`,
    o: [`Üretim çalışma alanında ölçüyü elle düzeltmek`, `Dünkü .pbix dosyasını bulup Üretim'e yayımlamak`, `Test'ten Üretim'e eski sürümü elle kopyalamak`, `Revert, Dev'i güncelle, işlem hattıyla dağıt`], a: 3,
    why: `Git'te revert yeni bir commit olarak izlenir; Dev güncellenir ve işlem hattıyla aynı yol izlenerek Üretim'e gider. Üretimde elle düzeltme Git ile çelişen bir durum yaratır ve bir sonraki dağıtımda ezilir; eski .pbix aradaki diğer değişiklikleri kaybettirir; elle kopyalama izlenebilir değildir.` },
  { t: 'mc', q: `BPA çalıştırınca “IFERROR kullanmayın” kuralı 14 ölçüde ihlal veriyor. Bir geliştirici “sonuçlar aynı, kuralı kapatalım” diyor. En iyi cevap?`,
    o: [`Haklı; IFERROR yalnızca stil sorunudur`, `Kuralı kapatmak yerine ihlalleri tek tek uyarıya çevirmek`, `IFERROR'u ISERROR ile değiştirmek yeterli`, `Kuralı tutup DIVIDE ile düzeltmek, kenarı test etmek`], a: 3,
    why: `IFERROR satır satır hata yakalar, gerçek hataları saklar ve boş yerine 0 döndürerek fazladan satırlar üretebilir. DIVIDE ile düzeltip kenar durumu (sipariş olmayan hücre) test etmek doğrudur. ISERROR aynı maliyeti taşır; kuralı uyarıya indirmek sorunu ertelemektir.` },
  { t: 'dax', name: 'Sipariş Başına Brüt Kâr (BPA)', q: `<b>Sipariş Başına Brüt Kâr (BPA)</b>: Eski ölçü <code>IFERROR([Brüt Kâr] / [Sipariş Sayısı], 0)</code> idi. BPA kuralına uygun, sıfıra bölmede BLANK döndüren hâlini yaz.`,
    sol: `DIVIDE([Brüt Kâr], [Sipariş Sayısı])`, hint: `DIVIDE(pay, payda) sıfıra bölmede BLANK döner; IFERROR gerekmez.` }
] });

/* ===================================================================== 10. M DİLİ */
ext('m-dili', { min: 20, html: `
<h2>Değerler: kayıt, liste, tablo</h2>
<p>Power Query'de her adım bir <b>değer</b> üretir. Gelişmiş Düzenleyici'de (Advanced Editor) kodu okuyabilmek için dört temel değer türünü ve onlara erişimi tanımak yeter:</p>
<pre class="m">let
    Liste    = {"Web", "Mobil", "Mağaza"},               // liste: sıralı değerler
    Kayit    = [Ad = "Ece Kurt", Sehir = "İzmir"],       // kayıt: ad = değer çiftleri
    Tablo    = #table({"Kanal", "Pay"}, {{"Web", 0.37}, {"Mobil", 0.48}}),
    Ilk      = Liste{0},            // "Web"   — listede konum (0'dan başlar)
    Ad       = Kayit[Ad],           // "Ece Kurt" — kayıtta alan
    IlkSatir = Tablo{0},            // kayıt: [Kanal = "Web", Pay = 0.37]
    Kanallar = Tablo[Kanal],        // liste: {"Web", "Mobil"}
    Guvenli  = Kayit[Telefon]?      // alan yoksa hata yerine null
in
    Guvenli</pre>
<p>Bir tablo, aynı alanlara sahip kayıtların listesi gibi düşünülebilir: <code>Tablo{0}</code> bir kayıt, <code>Tablo[Kanal]</code> bir listedir. <code>?</code> işareti erişimi “isteğe bağlı” yapar: <code>Liste{10}?</code> ve <code>Kayit[Telefon]?</code> hata yerine <code>null</code> döndürür. Kaynaktan gelen sütun bazen yoksa (ör. CRM dışa aktarımı yeni bir sürümde sütunu kaldırdıysa) bu küçük işaret sorgunun tamamen çökmesini önler.</p>

<h2>let/in: sıra değil, bağımlılık</h2>
<p><code>let</code> içindeki adlar bir tarif listesidir; <b>yukarıdan aşağı çalıştırılmaz</b>. M tembel (lazy) değerlendirir: <code>in</code> sonrasındaki değer hangi adlara ihtiyaç duyuyorsa yalnızca onlar hesaplanır. Bunun iki pratik sonucu var:</p>
<ul>
<li><b>Hata ayıklama:</b> <code>in</code> satırına ara bir adımın adını yazarak o adımın sonucunu görebilirsin. Uygulanan Adımlar bölmesinde bir adıma tıklamak da bunu yapar.</li>
<li><b>Kullanılmayan adım çalışmaz:</b> bir adımdaki hata, sonuca giden yolda değilse sorguyu durdurmaz. Ama aynı adımı bir sonraki adım kullanmaya başladığı anda hata ortaya çıkar.</li>
</ul>
<p>Boşluk ya da Türkçe karakter içeren adım adları <code>#"Değiştirilen Tür"</code> biçiminde yazılır. Arayüz bu adları kendisi üretir; elle yazarken kısa ve boşluksuz adlar (<code>Turler</code>, <code>Filtre</code>) kodu okunur kılar.</p>

<h2>each ve _: kısa fonksiyon yazımı</h2>
<p><code>each</code>, tek parametreli bir fonksiyonun kısaltmasıdır: <code>each [Adet] * [Fiyat]</code> = <code>(_) =&gt; _[Adet] * _[Fiyat]</code>. Köşeli parantez içindeki alan adı, <code>_</code> değerinin alanıdır. <code>_</code> ne olduğuna göre değişir:</p>
<div class="tbl-wrap"><table><tr><th>Fonksiyon</th><th><code>_</code> nedir?</th><th>Örnek</th></tr>
<tr><td><code>Table.SelectRows</code>, <code>Table.AddColumn</code></td><td>Satırın kaydı</td><td><code>each [Kanal] = "Web"</code></td></tr>
<tr><td><code>Table.TransformColumns</code></td><td>Hücrenin değeri</td><td><code>each Text.Proper(_)</code></td></tr>
<tr><td><code>List.Transform</code>, <code>List.Select</code></td><td>Listenin elemanı</td><td><code>each _ * 1.2</code></td></tr></table></div>
<pre class="m">let
    Kaynak   = Satislar,
    Secili   = Table.SelectRows(Kaynak, each List.Contains({"Web", "Mobil"}, [Kanal])),
    Etiketli = Table.AddColumn(Secili, "Bant",
                 each if [Tutar] &gt;= 2000 then "Büyük" else if [Tutar] &gt;= 500 then "Orta" else "Küçük",
                 type text)
in
    Etiketli</pre>
<p>İç içe <code>each</code> yazınca iki <code>_</code> çakışır: içteki dıştakini gölgeler. Böyle durumlarda açık adlı fonksiyon yaz: <code>(satir) =&gt; List.Select(Liste, (x) =&gt; x &gt; satir[Esik])</code>.</p>

<h2>Özel fonksiyon ve parametreli kaynak</h2>
<p>Satın alma ekibi her tedarikçi için ayrı Excel gönderiyor; dosyaların yapısı aynı. Aynı temizliği 8 kez yazmak yerine bir fonksiyon yazılır ve dosya listesinin her satırına uygulanır. “Klasörden birleştir” komutu bunu kendiliğinden yapar: bir <i>örnek dosyayı dönüştür</i> sorgusu ve ondan türetilen bir fonksiyon üretir; temizliği örnek sorguda yaptığında fonksiyon da güncellenir.</p>
<pre class="m">// fxTedarikciTemizle
(Dosya as binary, Tedarikci as text) as table =&gt;
let
    Sayfa  = Excel.Workbook(Dosya, null, true){[Item = "Siparis", Kind = "Sheet"]}[Data],
    Baslik = Table.PromoteHeaders(Sayfa, [PromoteAllScalars = true]),
    Turler = Table.TransformColumnTypes(Baslik, {{"Tarih", type date}, {"Tutar", type number}}, "tr-TR"),
    Etiket = Table.AddColumn(Turler, "Tedarikci", each Tedarikci, type text)
in
    Etiket</pre>
<p><b>Parametreli kaynak:</b> sunucu ve veritabanı adlarını Parametreleri yönet ile <code>SunucuAdi</code>, <code>VeritabaniAdi</code> parametrelerine al: <code>Sql.Database(SunucuAdi, VeritabaniAdi)</code>. Dağıtım işlem hattındaki parametre kuralları Test'te test sunucusunu, Üretim'de canlı sunucuyu seçer (Yaşam döngüsü dersi). Kenar durum: farklı kaynakları birleştiren sorgularda gizlilik düzeyleri uyuşmazsa <code>Formula.Firewall</code> hatası çıkar; kaynakları ayrı hazırlık (staging) sorgularına ayırmak ya da gizlilik düzeylerini doğru tanımlamak gerekir.</p>

<h2>Hata yönetimi: try, otherwise, catch</h2>
<p>İki tür hata vardır. <b>Adım düzeyinde hata</b> (dosya yok, sütun yok) sorgunun tamamını durdurur. <b>Hücre düzeyinde hata</b> (bir tarih çevrilemedi) yalnızca o hücreyi Error yapar; yüklemede o hücre boş gelir ve hata raporu oluşur. <code>try</code> her ikisini de bir kayda çevirir:</p>
<pre class="m">let
    Kaynak = Musteri,
    Denendi = Table.AddColumn(Kaynak, "Deneme", each try Date.FromText([KayitTarihi], [Culture = "tr-TR"])),
    // Deneme: [HasError = false, Value = ...]  ya da  [HasError = true, Error = [Reason, Message, Detail]]
    Tarih  = Table.AddColumn(Denendi, "KayitTarihiTemiz", each if [Deneme][HasError] then null else [Deneme][Value], type nullable date),
    Neden  = Table.AddColumn(Tarih, "HataNedeni", each if [Deneme][HasError] then [Deneme][Error][Message] else null, type nullable text),
    Sonuc  = Table.RemoveColumns(Neden, {"Deneme"})
in
    Sonuc</pre>
<ul>
<li><code>try … otherwise null</code> kısa yoldur ama nedeni kaybeder. Kalite raporu gerekiyorsa yukarıdaki gibi <b>neden sütunu</b> tut; “2024-02-30” gibi hatalı satırlar sessizce kaybolmasın.</li>
<li><code>try … catch (e) =&gt; …</code> yazımı hata kaydını doğrudan bir fonksiyona verir: <code>try Number.From([Tutar]) catch (e) =&gt; if e[Message] = "…" then 0 else null</code>.</li>
<li>Kendi hatanı da üretebilirsin: <code>error "Beklenen Tutar sütunu yok"</code>. Kaynak beklenmedik biçimde değiştiğinde sessizce yanlış veri yüklemektense yenilemenin açık bir mesajla durması iyidir.</li>
</ul>

<h2>Sorgu katlama ile ilişkisi</h2>
<p>Bir SQL kaynağında adımlar mümkün olduğunca tek bir SQL sorgusuna çevrilir (sorgu katlama, query folding). M yazım biçimin bunu doğrudan etkiler:</p>
<div class="tbl-wrap"><table><tr><th>Adım</th><th>Çoğu SQL kaynağında</th></tr>
<tr><td>Satır filtresi, sütun seçme/kaldırma, gruplama, aynı kaynaktaki birleştirme</td><td>Katlanır</td></tr>
<tr><td>Satır başına <code>try … otherwise</code>, özel fonksiyon çağrısı, <code>Table.Buffer</code></td><td>Katlanmaz; sonraki adımlar da yerelde çalışır</td></tr>
<tr><td>Dizin sütunu ekleme, bazı metin fonksiyonları (ör. her sözcüğün ilk harfi)</td><td>Genellikle katlanmaz</td></tr></table></div>
<p>Kural: <b>katlanan adımları başa, katlanmayanları sona</b> koy. Adıma sağ tıklayıp <b>Yerel sorguyu görüntüle</b> (View Native Query) seçeneğinin açık olması, o adıma kadar katlandığını gösterir. Artımlı yenilemedeki <code>RangeStart</code>/<code>RangeEnd</code> filtresinin katlanması özellikle kritiktir; o filtreden önce katlamayı bozan bir adım varsa her bölüm için kaynağın tamamı okunur.</p>
<div class="tip"><b>Kontrol listesi</b>Adım adları okunur mu? · Hatalar null'a gömülmek yerine neden sütununda mı? · Kaynak adresleri parametrede mi? · Katlamayı bozan adımlar sonda mı? · Tekrarlanan temizlik fonksiyona alındı mı?</div>
`, ex: [
  { t: 'mc', q: `CRM dışa aktarımının yeni sürümünde <code>Telefon</code> sütunu bazen gelmiyor ve sorgu “alan bulunamadı” hatasıyla tamamen duruyor. Sütun yoksa null yeterli. Hangi yazım?`,
    o: [`Table.AddColumn(t, "Tel", each [Telefon]?)`, `Table.AddColumn(t, "Tel", each [Telefon] ?? 0)`, `Table.AddColumn(t, "Tel", each Text.From([Telefon]))`, `Table.SelectColumns(t, {"Telefon"})`], a: 0,
    why: `Alan erişiminden sonra gelen ? işareti alanı isteğe bağlı yapar; alan yoksa hata yerine null döner. ?? birleştirme işleci yalnızca değer null olduğunda devreye girer, olmayan alan hatasını önlemez. Text.From ve SelectColumns olmayan sütunda yine hata verir.` },
  { t: 'mc', q: `<code>Table.TransformColumns(t, {{"Şehir", each Text.Proper([Şehir])}})</code> yazdın ve her hücrede hata aldın. Neden?`,
    o: [`Text.Proper Türkçe karakterleri desteklemez`, `_ hücre değeridir; Text.Proper(_) yazılmalı`, `TransformColumns yalnızca sayısal sütunlarda çalışır`, `Sütun adında Türkçe karakter olduğu için #"Şehir" yazılmalı`], a: 1,
    why: `TransformColumns'ta each içindeki _ satırın kaydı değil, hücrenin değeridir; değerin [Şehir] alanı olmadığı için hata çıkar. Doğrusu each Text.Proper(_). Türkçe karakter ne fonksiyonda ne sütun adında sorun değildir (sütun adı metin olarak verilmiş).` },
  { t: 'mc', q: `Kalite ekibi, kayıt tarihi çevrilemeyen müşterilerin <b>neden</b> çevrilemediğini görmek istiyor. Şu an <code>try … otherwise null</code> kullanılıyor. Ne değiştirirsin?`,
    o: [`otherwise null yerine otherwise #date(1900, 1, 1) yazarım`, `Hatalı satırları Hataları kaldır ile atarım`, `try kaydını tutup Error[Message]'ı sütuna açarım`, `Sütunun türünü metin bırakıp tarih dönüşümünü DAX'ta yaparım`], a: 2,
    why: `try tek başına [HasError, Value/Error] kaydı döndürür; Error[Message] nedeni taşır. otherwise nedeni kaybeder; 1900 sahte tarihi raporu yanıltır; hataları silmek veriyi kaybettirir; DAX'a taşımak modele kirli metin taşır ve nedeni yine göstermez.` },
  { t: 'mc', q: `SQL kaynağından gelen sorguda adımlar: Kaynak → satır başına özel fonksiyonla müşteri adı temizleme → son 2 yıl filtresi → sütun kaldırma. Yenileme çok yavaş. İlk düzeltme?`,
    o: [`Özel fonksiyonu Table.Buffer ile sarmak`, `Filtreyi ve sütun kaldırmayı fonksiyondan önceye almak`, `Sorguyu DirectQuery moduna çevirmek`, `Gizlilik düzeyini Genel yapmak`], a: 1,
    why: `Satır başına özel fonksiyon katlamayı bozar ve sonraki adımlar yerelde çalışır: tüm tablo indirilip sonra filtrelenir. Katlanan filtre ve sütun kaldırmayı başa almak kaynağa daha az satır ve sütun sordurur. Table.Buffer katlamayı yine bozar; DirectQuery ve gizlilik düzeyi bu sıralama sorununu çözmez.` },
  { t: 'pq', src: 'musteri', pre: [{ op: 'promote', cols: [] }], sol: [{ op: 'type', cols: ['KayitTarihi'], to: 'date' }, { op: 'replaceErr', cols: ['KayitTarihi'], v: 'null' }],
    q: `<b>try … otherwise null'ı arayüzle kur.</b> İlk satır zaten başlık yapıldı. <code>KayitTarihi</code> sütununu tarihe çevir; “2024-02-30” gibi geçersiz tarihte oluşan hatayı <code>null</code> ile değiştir. Satır sayısı değişmemeli (6 satır). Sonra Gelişmiş Düzenleyici'de üretilen <code>Table.ReplaceErrorValues</code> satırını oku.`,
    hint: `KayitTarihi'ni seç → Veri türü: Tarih → Hataları değiştir: null. Hataları kaldır kullanma; satır sayısı azalır.` }
] });

})(window);
