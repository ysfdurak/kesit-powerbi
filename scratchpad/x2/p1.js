/* PBIPatika — İleri dersler genişletmesi (2): hesaplama grupları, performans, DAX optimizasyonu, kurumsal model,
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
    o: [`Hesaplama grubunu silip örtük ölçülere izin veririm`, `Adet sütununun veri türünü ondalık sayıya çeviririm`, `Satılan adet için açık bir ölçü yazar, yazara onu kullandırırım`, `Sütunun “Özetleme” özelliğini Toplam olarak yeniden ayarlarım`], a: 2,
    why: `Hesaplama grubu örtük ölçüleri kapatır; Σ kaybolur ama eski görseller çalışır. Kalıcı çözüm açık ölçüdür (modelde [Satılan Adet] zaten var). Grubu silmek tüm varyasyonları kaybettirir; veri türü ya da özetleme ayarı örtük ölçü engelini kaldırmaz.` },
  { t: 'mc', q: `Kullanıcılar para birimi hesaplama grubunun dilimleyicisinde hem USD hem EUR seçince tablonun sessizce TL tutarlara döndüğünü fark ediyor. Kimse bunu fark etmeden sunum yapılmış. Kalıcı çözüm?`,
    o: [`Grupta çoklu seçim ifadesi tanımlayıp BLANK ve uyarı biçimi döndürmek`, `Dilimleyiciyi “Tümünü seç” seçeneği kapalı olacak şekilde ayarlamak`, `Para birimi öğelerinin önceliğini Zaman grubundan düşük tutmak`, `Raporun üstüne “tek para birimi seçin” metin kutusu eklemek`], a: 0,
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
    o: [`Kartları tek çok değerli karta toplar, dilimleyicileri azaltırım`, `Bütün ölçüleri VAR kullanacak şekilde yeniden yazarım`, `Modeli DirectQuery'den Import'a geçiririm`, `Dilimleyicileri hiyerarşik dilimleyiciye çeviririm`], a: 0,
    why: `“Diğer” süresi, görselin sırasını beklediği zamandır; sorun ölçüler değil, sorgu sayısıdır. Görsel sayısını azaltmak doğrudan bekleme süresini düşürür. Ölçüler zaten hızlı; depolama modu bilgisi soruda yok; hiyerarşik dilimleyici sorgu sayısını anlamlı azaltmaz.` },
  { t: 'mc', q: `Otomatik tarih/saati kapatmak istiyorsun. Model kendi <code>Tarih</code> tablosuna sahip ve işaretli. Kapatmadan önce neyi kontrol etmelisin?`,
    o: [`Tarih tablosunun Import modunda olup olmadığını`, `Bütün tarih sütunlarının metne çevrildiğini`, `Görsellerde otomatik Yıl/Ay hiyerarşisinin kullanılıp kullanılmadığını`, `Tarih tablosunun 1900'den başladığını`], a: 2,
    why: `Ayar kapanınca gizli tarih tabloları ve otomatik hiyerarşi kaybolur; onları kullanan görseller ve hızlı ölçüler bozulur, Tarih tablosunun sütunlarıyla yeniden kurulmalıdır. Depolama modu, metne çevirme ya da 1900 başlangıcı bu kararla ilgili değildir.` },
  { t: 'mc', q: `Olgu tablosunda her satırda farklı olan <code>SatirNo</code> sütunu var. Raporlarda hiçbir görselde, ölçüde ya da ilişkide kullanılmıyor; denetim ekibi nadiren tek bir satırı arıyor. Ne yaparsın?`,
    o: [`Sütunu gizlerim; gizli sütun yer kaplamaz`, `Sütunu metin türüne çeviririm; sözlükte daha iyi sıkışır`, `Sütunu tutar ama tabloyu SatirNo'ya göre sıralarım`, `Modelden kaldırır, denetime ayrıntı raporu sunarım`], a: 3,
    why: `Benzersiz bir sütun modelde en pahalı sütunlardandır ve gizlemek yer kazandırmaz. Metin türü daha da pahalıdır. Sıralama tek başına sözlük boyutunu küçültmez. Kullanılmıyorsa kaldırmak, nadir ihtiyaç için kaynağa giden ayrıntı raporu sunmak doğru dengedir.` },
  { t: 'dax', name: 'Hafta Sonu Net Satışı', q: `<b>Hafta Sonu Net Satışı</b>: Olgu tablosuna hesaplanmış sütun eklemeden, hafta sonu günlerinin net satışını veren ölçüyü yaz. <code>Tarih[HaftaSonu]</code> sütunu "Evet" / "Hayır" değerleri alır.`,
    sol: `CALCULATE([Net Satış], Tarih[HaftaSonu] = "Evet")`, hint: `Bilgi boyut tablosunda: CALCULATE([Net Satış], Tarih[HaftaSonu] = "Evet"). Filtre ilişki üzerinden Satislar'a iner.` },
  { t: 'dax', name: 'Uzun Kargolu Net Satış', q: `<b>Uzun Kargolu Net Satış</b>: Kargo süresi 5 günden uzun olan satırların net satışı. “GecikmeliMi” diye hesaplanmış sütun yazmadan, var olan <code>Satislar[KargoGun]</code> sütunuyla yaz.`,
    sol: `CALCULATE([Net Satış], Satislar[KargoGun] > 5)`, hint: `Sayısal sütun üzerinde doğrudan filtre: CALCULATE([Net Satış], Satislar[KargoGun] > 5).` },
  { t: 'query', q: `Boyut tablosunun maliyetini ölç: <code>Musteriler</code> tablosundaki <code>MusteriNo</code>, <code>Sehir</code> ve <code>Segment</code> sütunlarının farklı değer sayılarını tek satırda döndür.`,
    start: 'EVALUATE\n', sol: `EVALUATE\nROW(\n    "MusteriNo", DISTINCTCOUNT(Musteriler[MusteriNo]),\n    "Sehir", DISTINCTCOUNT(Musteriler[Sehir]),\n    "Segment", DISTINCTCOUNT(Musteriler[Segment])\n)`, hint: `ROW("Ad", ifade, "Ad2", ifade2, ...) tek satırlık tablo üretir; her sütun için DISTINCTCOUNT(Musteriler[...]).` }
] });
