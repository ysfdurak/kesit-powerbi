/* Kesit Power BI — c23: "1 dakikada ilk ölçün" (karşılama ekranındaki "Hiç bilmiyorum" kapısının ilk dersi) */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
L.push({
  id: 'ilk-olcu', lv: 'A1', mod: 'Başlangıç', min: 5,
  title: '1 dakikada ilk ölçün',
  sum: 'Kurulum yok: tarayıcıda ilk DAX ölçünü yaz, sonucu tabloda gör, sonra bir filtre ekle.',
  body: `
<p>Power BI’da her rakamın arkasında bir <b>ölçü</b> (measure) vardır: “toplam satış”, “sipariş sayısı”, “kâr marjı” gibi. Ölçü, DAX denen formül diliyle yazılır. Excel’de <code>=TOPLA(A:A)</code> yazmaya benzer; tek fark, hücre yerine <b>sütun</b> adıyla çalışmasıdır.</p>
<p>Bu derste kurulum yok. Anadolu Market adlı hayali bir perakende şirketinin (web, mobil, mağaza) satış verisi tarayıcında hazır bekliyor. Üç küçük adımda ilk ölçünü yazacaksın.</p>

<h2>1. Adım: Toplamı al</h2>
<p><code>Satislar</code> tablosunun <code>Tutar</code> sütunu her satırın satış tutarını tutar. Hepsini toplamak için:</p>
<pre class="dax">İlk Ölçüm =
SUM(Satislar[Tutar])</pre>
<p>Kutunun sağındaki <b>Playground’da dene</b> düğmesine basarsan aynı ölçüyü kategori kırılımında görürsün. Dilimleyici seçili değilken toplam yaklaşık 1,35 milyon ₺ çıkar; Yıl = 2024 seçersen 808 bin ₺.</p>
<div class="tip"><b>Okuma kuralı</b><code>Satislar[Tutar]</code> “Satislar tablosunun Tutar sütunu” demektir. Tablo adı dışarıda, sütun adı köşeli parantezin içinde.</div>

<h2>2. Adım: Say</h2>
<p>Kaç satış satırı var? Satırları saymak için <code>COUNTROWS</code>:</p>
<pre class="dax">Satır Adedi =
COUNTROWS(Satislar)</pre>

<h2>3. Adım: Filtre ekle</h2>
<p>Yalnızca Web kanalının satışını istiyorsan, ölçüye bir koşul eklersin. Bunu yapan fonksiyonun adı <code>CALCULATE</code>; ilerleyen derslerde en çok kullanacağın fonksiyon odur:</p>
<pre class="dax">Web Satışı =
CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] = "Web")</pre>
<p>Hepsi bu. Şimdi aynı üç ölçüyü kendin yaz. Yazdığın ölçü, uygulamanın beklediği sonuçla kırılım kırılım karşılaştırılır; doğruysa yeşil olur.</p>
<div class="note"><b>Sonra ne var?</b>Sıradaki ders Power BI Desktop kurulumu, ardından ilk rapor. “Power BI’ın hikâyesi” isteğe bağlı ek okuma: Dersler sayfasında Temel seviyenin sonunda durur, zorunlu değildir.</div>
`,
  ex: [
    { t: 'dax', name: 'İlk Ölçüm', q: '<b>İlk Ölçüm</b>: Satislar tablosundaki Tutar sütununun toplamı. Editöre şunu yaz: <code>SUM(Satislar[Tutar])</code>', sol: 'SUM(Satislar[Tutar])', hint: 'SUM( yaz, sonra tablo ve sütun adını Satislar[Tutar] biçiminde ekle, parantezi kapat.' },
    { t: 'dax', name: 'Satış Satırı Sayısı', q: '<b>Satış Satırı Sayısı</b>: Satislar tablosunda kaç satır olduğunu say.', sol: 'COUNTROWS(Satislar)', hint: 'COUNTROWS bir tablo alır: COUNTROWS(Satislar).' },
    { t: 'dax', name: 'Mobil Kanal Tutarı', q: '<b>Mobil Kanal Tutarı</b>: Yalnızca Mobil kanalındaki satırların Tutar toplamı. Örnekteki Web ölçüsünü Mobil için uyarla.', sol: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] = "Mobil")', hint: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] = "Mobil"). Metin değerleri düz çift tırnak içinde yazılır.' }
  ]
});
const O = W.PBI_ORDER; if (O && !O.includes('ilk-olcu')) O.unshift('ilk-olcu');
})(window);
