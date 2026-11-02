/* Kesit Power BI — işte gereken beceriler: paydaşlarla çalışmak, rapor kalitesi ve test, analist için SQL, portföy ve ilk 90 gün. */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

/* ---------- 1 · Kariyer · paydaşlar ---------- */
add('dashboard-tasarim', {
  id: 'paydas-iletisim', lv: 'B1', mod: 'Kariyer', min: 24,
  title: 'Paydaşlarla çalışmak: talep, önceliklendirme, demo ve geri bildirim',
  sum: 'Bir BI analistinin günü DAX’tan çok insanlarla geçer: talepleri tek kapıdan almak, etki × efor ile sıralamak, nazikçe “şimdi değil” demek, demo yapmak, geri bildirimi ayıklamak, kapsam kaymasını yönetmek ve bulguyu yöneticiye üç cümlede anlatmak.',
  body: `
<p>Anadolu Market’te pazartesi sabahı. Rapor ekibindeki tek analist sensin ve gelen kutunda dokuz mesaj var: satış müdürü “acil” bir tablo istiyor, finans bir sayının tutmadığını söylüyor, depo şefi yeni bir sayfa öneriyor, BT yenilemenin gece başarısız olduğunu bildiriyor. Hepsini aynı anda yapamazsın. Bu ders, işin teknik olmayan ama işi belirleyen kısmını anlatıyor. Belirsiz bir talebi tek sayfalık brife çevirmeyi “Talepten rapor brifine: ihtiyaç toplama ve sayfa planı” dersinde gördük; burada brif sonrası hayatı konuşuyoruz.</p>

<h2>Paydaşlar kimdir?</h2>
<p><b>Paydaş (stakeholder)</b>, raporun sonucundan etkilenen ya da raporun yapılmasına katkı veren herkestir. Her birinden farklı bir şey istersin ve her biri senden farklı bir şey bekler:</p>
<div class="tbl-wrap"><table>
<tr><th>Paydaş</th><th>Anadolu Market örneği</th><th>Senden beklediği</th><th>Senin ondan istediğin</th></tr>
<tr><td><b>Talep sahibi</b></td><td>Satış müdürü</td><td>Kararını hızlandıran, zamanında gelen cevap</td><td>Net soru, öncelik, demo ve onay için zaman</td></tr>
<tr><td><b>Veri sahibi</b></td><td>ERP’den sorumlu finans uzmanı</td><td>Verinin doğru yorumlanması</td><td>Alan tanımları, iş kuralları (“iptal” ne demek?), erişim</td></tr>
<tr><td><b>Son kullanıcı</b></td><td>Bölge sorumluları, mağaza yöneticileri</td><td>Hızlı açılan, anlaşılır sayfa</td><td>Gerçek kullanım senaryoları, kabul testinde geri bildirim</td></tr>
<tr><td><b>BT / platform</b></td><td>Veritabanı yöneticisi, Power BI yöneticisi</td><td>Güvenli bağlantı, kurallara uyum</td><td>Ağ geçidi, servis hesabı, çalışma alanı, lisans</td></tr>
<tr><td><b>Sponsor</b></td><td>Ticaret direktörü</td><td>Ekibin doğru işlere zaman harcaması</td><td>Öncelik çatışmasında son söz</td></tr>
</table></div>
<div class="tip"><b>Veri sahibini ilk hafta bul</b>Bir sayının neden tutmadığını en hızlı veri sahibi açıklar. Projenin başında “bu tablodaki Durum alanı hangi değerleri alır, iptal edilen sipariş ne zaman satır olarak kalır?” diye sorman, sonradan günlerce mutabakat yapmaktan kurtarır.</div>

<h2>Talep girişi: tek kapı</h2>
<p>Talepler e-postadan, koridordan, toplantı sonunda “bir şey daha” diye gelirse hiçbir şey sıralanamaz. Ekibin <b>tek bir giriş noktası</b> olsun: bir form, bir Teams kanalı ya da bir iş takip aracı. Her talepte şu alanlar dolu olmalı:</p>
<ol>
<li><b>Kim istiyor, kim kullanacak?</b></li>
<li><b>Hangi kararı ya da soruyu destekliyor?</b> (“Elektronik kampanyasına devam edelim mi?”)</li>
<li><b>Ne zamana lazım ve neden o tarih?</b> (“Perşembe bütçe toplantısı” gerçek bir tarihtir; “ASAP” değildir.)</li>
<li><b>Mevcut bir rapor bu soruya yakın mı?</b> Çoğu talep, var olan sayfaya bir filtre ya da sütun eklemekle çözülür.</li>
<li><b>Hangi veri gerekiyor?</b> Modelde yoksa veri sahibi kim?</li>
</ol>
<p>Talebin yaşamı da görünür olsun: <b>Yeni → Netleştiriliyor → Sırada → Geliştiriliyor → Testte → Yayında</b> ya da <b>Reddedildi / Ertelendi</b>. Talep sahibi “benim işim nerede?” diye sormak zorunda kalmamalı.</p>

<h2>Önceliklendirme: etki × efor</h2>
<p>Her talebe iki not ver: <b>etki</b> (kaç kişiyi, hangi büyüklükte bir kararı etkiliyor, 1–5) ve <b>efor</b> (kaç günlük iş, yeni veri gerekiyor mu, 1–5). Sonra dört kutuya yerleştir:</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>Düşük efor</th><th>Yüksek efor</th></tr>
<tr><td><b>Yüksek etki</b></td><td><b>Hızlı kazanç</b>: hemen yap</td><td><b>Büyük proje</b>: planla, parçala, sponsorla konuş</td></tr>
<tr><td><b>Düşük etki</b></td><td><b>Dolgu işi</b>: boşlukta yap ya da topluca yap</td><td><b>Kaçın</b>: nedenini açıklayarak reddet ya da ertele</td></tr>
</table></div>
<p>Pazartesi sabahının dört talebi:</p>
<div class="tbl-wrap"><table>
<tr><th>Talep</th><th>Etki</th><th>Efor</th><th>Kutu</th></tr>
<tr><td>Gece yenilemesi başarısız; rapor dünkü veriyi gösteriyor</td><td>5</td><td>1</td><td>Hızlı kazanç (aslında acil hata, sıranın en başı)</td></tr>
<tr><td>Satış müdürü: “Aralık nasıl geçti?” sorusu için yorum</td><td>4</td><td>1</td><td>Hızlı kazanç</td></tr>
<tr><td>Depo şefi: tedarikçi teslim süresi sayfası (veri modelde yok)</td><td>4</td><td>4</td><td>Büyük proje</td></tr>
<tr><td>Bir kullanıcı: tüm grafiklerin rengini mor yapalım</td><td>1</td><td>2</td><td>Kaçın / ertele</td></tr>
</table></div>
<div class="note"><b>Puanlar kesin değil, konuşma aracı</b>Etki × efor tablosu kararı tek başına vermez; seni ve talep sahibini aynı dili konuşmaya zorlar. İki talep çakıştığında sponsorla bu tabloyu paylaş ve sırayı ona onaylat.</div>

<h2>Tahmin vermek ve nazikçe “şimdi değil” demek</h2>
<p>“Ne zaman biter?” sorusuna tek bir gün söyleme. İşi parçala (veri bağlantısı, model, ölçüler, sayfa, test) ve <b>aralık</b> ver: “Veri modelde varsa 2–3 gün; yeni bir kaynak gerekiyorsa veri sahibinin erişim vermesine bağlı olarak 1–2 hafta.” Belirsizliği saklamak değil, adlandırmak güven verir.</p>
<p>Reddetmek de bir iletişim becerisidir. “Hayır” yerine <b>neden</b>, <b>ne zaman</b> ve <b>bugün ne yapabileceğini</b> söyle:</p>
<div class="note"><b>Örnek mesaj: erteleme</b>Merhaba Selin Hanım, tedarikçi teslim süresi sayfası önemli bir ihtiyaç; ama bu veri şu an modelde yok ve satın alma sisteminden erişim gerekiyor. Bu hafta ekibin önceliği, sponsorumuzun onayladığı bütçe raporu. Önerim: talebi 2 hafta sonraki planlamaya alalım, bu arada satın almadan örnek bir dosya isteyeyim. Kısa vadede mevcut stok raporundaki “Stok gün sayısı” sütunu işinizi görür mü?</div>

<h2>Demo yapmak</h2>
<p>Demo, “bakın ne yaptım” gösterisi değil, <b>doğru şeyi yaptığını erkenden kontrol etme</b> toplantısıdır. Rapor yüzde 60 hazırken yapılan bir demo, yüzde 100’de yapılandan daha değerlidir.</p>
<ol>
<li><b>Soruyla başla:</b> “Brifte üç soru vardı; ilkiyle başlayalım.” Özellik turu yapma.</li>
<li><b>Gerçek veriyle ve gerçek bir senaryoyla göster:</b> “Diyelim ki aralık ayına bakıyorsunuz. Hangi kategori geride? İşte burada.”</li>
<li><b>Fareyi kullanıcıya ver:</b> Kullanıcının nerede takıldığını izlemek, onun ne söylediğinden daha öğreticidir.</li>
<li><b>Bilinen eksikleri önce sen söyle:</b> “Teslim tarihi filtresi henüz yok, cuma eklenecek.”</li>
<li><b>Sonda iki soru sor:</b> “Bu sayfayla kararınızı verebilir misiniz? Eksik olan en önemli tek şey ne?”</li>
</ol>

<h2>Geri bildirimi toplamak ve ayıklamak</h2>
<p>Demo sonrası notları ve hizmetteki yorumları tek bir listeye topla. Power BI hizmetinde raporun ya da tek bir görselin üzerine <b>yorum (comment)</b> eklenebilir ve <b>@bahsetme</b> ile bir meslektaş etiketlenebilir; etiketlenen kişiye bildirim gider. Sonra her maddeyi bir türe ayır:</p>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Örnek</th><th>Ne yaparsın?</th></tr>
<tr><td><b>Hata</b></td><td>“Aralık satışı finans tablosundan farklı.”</td><td>Hemen incele; doğrula ya da farkın nedenini açıkla.</td></tr>
<tr><td><b>Veri sorusu</b></td><td>“Bu sayıya iadeler dahil mi?”</td><td>Tanımı açıkla; sık soruluyorsa araç ipucuna yaz.</td></tr>
<tr><td><b>Değişiklik isteği</b></td><td>“Web ve Mobil’i tek satırda ‘Dijital’ diye görelim.”</td><td>Brifle karşılaştır, eforu söyle, sıraya al.</td></tr>
<tr><td><b>Yeni talep</b></td><td>“Bir de temsilci prim raporu olsa…”</td><td>Talep girişine yönlendir; bu projeye ekleme.</td></tr>
<tr><td><b>Tercih</b></td><td>“Bu mavi biraz soluk.”</td><td>Kurumsal temayla çelişmiyorsa topluca, sonra yap.</td></tr>
</table></div>

<h2>Değişiklik talebi ve kapsam kayması</h2>
<p><b>Kapsam kayması (scope creep)</b>, her biri küçük görünen eklemelerin teslim tarihini sessizce kaydırmasıdır. Kural basit: brifte yazmayan her şey bir <b>değişiklik talebidir</b>. Değişikliği reddetmek zorunda değilsin, ama bedelini görünür yapmalısın:</p>
<div class="note"><b>Örnek mesaj: değişiklik talebi</b>“Dijital kanal” satırını eklemek yarım günlük iş ve brifte yoktu. Eklersem kanal sayfasının testi perşembeye kayar, yayın tarihi değişmez. Onaylıyor musunuz? Onaylarsanız brife ve sürüm notlarına ekliyorum.</div>
<p>“Dijital” isteği teknik olarak küçük bir ölçüdür (alıştırma 2). Asıl iş; tanımı yazmak, testi güncellemek ve kullanıcılara duyurmaktır. 2024’te Web ve Mobil birlikte net satışın %83,4’ünü yapıyor; bu yüzden tanım net olmalı.</p>

<h2>Kısa durum güncellemesi</h2>
<p>Haftada bir, beş satırı geçmeyen bir durum notu, onlarca “ne oldu?” mesajını önler. Biçim hep aynı olsun:</p>
<div class="note"><b>Örnek: haftalık durum (Satış raporu v1.2)</b><b>Bitti:</b> Kanal sayfası, Dijital kanal satırı. <b>Bu hafta:</b> Kabul testi (3 bölge sorumlusu). <b>Engel:</b> Satın alma verisine erişim bekleniyor (talep BT’de). <b>Karar gereken:</b> Tedarikçi sayfası bu sürüme mi, sonrakine mi? <b>Risk:</b> Yok.</div>

<h2>Bulguyu yöneticiye sunmak: önce cevap</h2>
<p>Satış müdürü soruyor: <i>“Bu ay geçen aya göre nasılız?”</i> Yöneticiler sunumun ilk cümlesinde cevabı bekler. Sıra: <b>cevap → kanıt → öneri</b>. Bizim modelde aralık 2024 ile kasım 2024:</p>
<div class="tbl-wrap"><table>
<tr><th>Gösterge</th><th>Kasım 2024</th><th>Aralık 2024</th></tr>
<tr><td>Net satış</td><td>89.055,60 ₺</td><td>94.000,95 ₺ (+%5,6)</td></tr>
<tr><td>Aylık hedef gerçekleşme</td><td>%99,3</td><td>%106,3</td></tr>
<tr><td>Sipariş sayısı</td><td>58</td><td>58</td></tr>
<tr><td>Ortalama sepet</td><td>1.535,44 ₺</td><td>1.620,71 ₺</td></tr>
<tr><td>Elektronik</td><td>33.147,30 ₺</td><td>15.936,85 ₺</td></tr>
<tr><td>Giyim</td><td>9.864,80 ₺</td><td>20.974,55 ₺</td></tr>
</table></div>
<div class="note"><b>Örnek e-posta: üç paragraf</b><b>Cevap:</b> Aralıkta net satış geçen aya göre %5,6 artarak 94.000,95 ₺ oldu ve aylık hedefi %106,3 ile geçtik. <b>Kanıt:</b> Sipariş sayısı değişmedi (58); artış sepet büyüklüğünden geldi. Giyim 11.109,75 ₺, Ev &amp; Yaşam 8.359,50 ₺ arttı; Elektronik ise 17.210,45 ₺ geriledi. <b>Öneri:</b> Elektronikteki düşüşün kampanya bitişinden mi stoktan mı geldiğini satın almayla bu hafta kontrol edelim; gerekirse ocak kampanya bütçesini buna göre düzenleyelim.</div>
<p>Rakamları kurtaran ölçü küçüktür:</p>
<pre class="dax">Geçen Ay Farkı =
[Net Satış] - [Satış GA]</pre>
<p>Aralık 2024 satırında 4.945,35 ₺ döner. Yüzdeyi değişkenlerle kendin yazmak alıştırma 1’de.</p>
<div class="warn"><b>Bir rakam, bir cümle</b>E-postaya 12 sütunlu bir tablo yapıştırma. Yöneticinin karar vermesi için gereken iki-üç sayıyı cümleye koy, ayrıntı için rapor bağlantısını ver. Yorumunu (“kampanya bitti”) kanıt gibi sunma; “kontrol edelim” diye öner.</div>
`,
  ex: [
    { t: 'dax', name: 'Geçen Aya Göre %', grid: [{ t: 'Tarih', c: 'YilAy' }], noTotal: true,
      q: '<b>Geçen Aya Göre %</b>: Satış müdürü “Bu ay geçen aya göre nasılız?” diye soruyor. Hazır [MoM %] ölçüsünü kullanmadan yaz: VAR ile bu ayın [Net Satış] değerini ve PREVIOUSMONTH(Tarih[Tarih]) ile önceki ayın [Net Satış] değerini sakla; farkı önceki aya DIVIDE ile böl.',
      sol: 'VAR Bu = [Net Satış] VAR Onceki = CALCULATE([Net Satış], PREVIOUSMONTH(Tarih[Tarih])) RETURN DIVIDE(Bu - Onceki, Onceki)',
      hint: 'VAR Bu = [Net Satış] VAR Onceki = CALCULATE([Net Satış], PREVIOUSMONTH(Tarih[Tarih])) RETURN DIVIDE(Bu - Onceki, Onceki). Aralık 2024 için %5,6 çıkmalı.' },
    { t: 'dax', name: 'Dijital Satış',
      q: '<b>Dijital Satış</b>: Demo sonrası onaylanan değişiklik talebi: “Web ve Mobil kanallarını birlikte ‘Dijital’ olarak görelim.” Bu iki kanalın [Net Satış] toplamını döndür.',
      sol: 'CALCULATE([Net Satış], Satislar[Kanal] IN {"Web", "Mobil"})',
      hint: 'CALCULATE([Net Satış], Satislar[Kanal] IN {"Web", "Mobil"}). IN yerine iki koşulu || ile de bağlayabilirsin.' },
    { t: 'mc', q: 'Aynı gün üç talep geldi: (1) gece yenilemesi başarısız oldu, rapor eski veri gösteriyor; (2) yeni bir veri kaynağı gerektiren büyük bir sayfa; (3) grafik renklerini değiştirme isteği. Hangi sıra en doğrudur?',
      o: ['3, 1, 2: en kolay iş her zaman en önce', '1; sonra 2’yi planla, 3’ü ertele', '2, 1, 3: en büyük ve zor iş en önce', 'Üçünü aynı anda paralel başlatmak'], a: 1,
      why: 'Yenileme hatası yüksek etkili ve genellikle düşük eforlu, herkesin baktığı sayıyı bozuyor. Büyük sayfa planlanır ve parçalanır; renk isteği düşük etkili olduğu için sonraya kalır.' },
    { t: 'mc', q: 'Demo sırasında satış müdürü “Bir de temsilci prim raporu olsa iyi olur” dedi. Bu projenin brifinde prim yok. En uygun yanıt hangisi?',
      o: ['Hemen bu sürüme ekleyeceğini söylemek', 'İsteği duymamış gibi demoya devam etmek', 'Ayrı bir talep olarak girişe almayı önermek', 'Prim verisinin gizli olduğunu söyleyip reddetmek'], a: 2,
      why: 'Brifte olmayan yeni bir rapor kapsam kaymasıdır. İsteği reddetmeden talep girişine alırsın; etki ve eforu değerlendirilip sıraya konur, mevcut teslim tarihi korunur.' },
    { t: 'mc', q: 'Yöneticiye aylık sonucu anlatan bir e-postanın ilk cümlesi hangisi olmalı?',
      o: ['Verinin hangi kaynaklardan nasıl alındığı', 'Kullanılan DAX ölçülerinin kısa bir listesi', 'Rapor sayfalarının ekran görüntüleri', 'Cevap: ay geçen aya göre %5,6 arttı'], a: 3,
      why: 'Yöneticiye önce cevap verilir, sonra kanıt, en son öneri. Yöntem ve teknik ayrıntı, sorulursa ya da ekte verilir.' },
    { t: 'mc', q: 'Hizmetteki bir rapora gelen yorum: “Bu sayıya iadeler dahil mi?” Bu geri bildirim hangi türe girer ve ne yaparsın?',
      o: ['Veri sorusu: tanımı açıkla ve not et', 'Hata: ölçüyü hemen değiştirip yayımla', 'Yeni talep: ayrı bir rapor projesi aç', 'Tercih: bir sonraki sürüme bırak'], a: 0,
      why: 'Kullanıcı bir tanımı soruyor; bu bir hata değil. Tanımı açıklarsın; aynı soru tekrar ediyorsa tanımı araç ipucuna ya da “Hakkında” sayfasına eklersin.' },
    { t: 'mc', q: 'Talep sahibi “Ne zaman biter?” diye soruyor; işin bir kısmı henüz erişimin olmayan bir veri kaynağına bağlı. En iyi cevap hangisi?',
      o: ['“Yarın akşam kesin biter, söz veriyorum.”', '“Bilemem, veri gelince bakarım.”', '“2–3 gün; yeni kaynak gerekirse 1–2 hafta.”', '“Önce raporu yapayım, süreyi sonra söylerim.”'], a: 2,
      why: 'İşi parçalayıp aralık vermek ve belirsizliğin kaynağını adlandırmak güven verir. Kesin ama tutmayan bir tarih de, hiç tarih vermemek de ilişkiyi zedeler.' }
  ]
});

/* ---------- 2 · Yönetim ve Güvenlik · kalite ve test ---------- */
add('mobil-erisilebilirlik', {
  id: 'kalite-test', lv: 'B2', mod: 'Yönetim ve Güvenlik', min: 28,
  title: 'Rapor kalitesi: veri mutabakatı, ölçü testleri, belgeleme ve kabul testi',
  sum: 'Raporun sayılarını kaynakla eşleştir, beklenen değerlerle bir DAX sorgu test paketi kur, uç durumları dene, ölçüleri bir veri sözlüğüyle belgele, sürüm notu yaz ve yayımlamadan önce kullanıcı kabul testini yönet.',
  body: `
<p>Finans uzmanı yazıyor: <i>“Raporunuz toplam satışı 1.250.772,45 ₺ diyor, bizim ERP dökümü 1.346.189,85 ₺. Hangisi doğru?”</i> İkisi de doğru olabilir. Fark tam olarak 95.417,40 ₺ ve bu, iptal edilen satırların tutarıdır: ERP tüm satırları topluyor, rapordaki <code>[Net Satış]</code> iptalleri dışlıyor. Bu cevabı beş dakikada verebilmek için mutabakatı önceden yapmış olman gerekir. Kullanıcı bir kez “bu rapor yanlış” derse, sonra doğru da olsa güveni geri kazanmak zordur.</p>

<h2>Veri mutabakatı: rapor kaynağı tutuyor mu?</h2>
<p><b>Mutabakat (reconciliation)</b>, rapordaki sayıların kaynak sistemdeki sayılarla aynı kurala göre aynı sonucu verdiğini göstermektir. Üç katmanda yapılır:</p>
<ol>
<li><b>Satır sayısı:</b> Kaynakta kaç satır var, modelde kaç satır var? Bizim modelde Satislar tablosu 1.620 satır; <code>SatirNo</code> sütununda da 1.620 farklı değer var, yani yinelenen satır yok.</li>
<li><b>Kontrol toplamları (control totals):</b> Ham tutar toplamı, durumlara göre dağılım. Ham tutar 1.346.189,85 ₺; iptal 95.417,40 ₺; ikisinin farkı net satış 1.250.772,45 ₺.</li>
<li><b>Dönem kırılımı:</b> Toplam tutsa bile aylar kayabilir (saat dilimi, yanlış tarih sütunu). Yıl ve ay düzeyinde karşılaştır.</li>
</ol>
<div class="tbl-wrap"><table>
<tr><th>Yıl</th><th>Satır</th><th>Ham tutar</th><th>Net satış</th></tr>
<tr><td>2022</td><td>105</td><td>109.278,30 ₺</td><td>102.837,20 ₺</td></tr>
<tr><td>2023</td><td>550</td><td>428.549,90 ₺</td><td>400.869,55 ₺</td></tr>
<tr><td>2024</td><td>965</td><td>808.361,65 ₺</td><td>747.065,70 ₺</td></tr>
<tr><td><b>Toplam</b></td><td><b>1.620</b></td><td><b>1.346.189,85 ₺</b></td><td><b>1.250.772,45 ₺</b></td></tr>
</table></div>
<p>Kaynak taraftaki karşılığını SQL ile alırsın (<code>COUNT(*)</code>, <code>SUM(Tutar)</code>, yıla göre <code>GROUP BY</code>); bunun için “Power BI analisti için SQL” dersine bak. Model tarafında aynı tabloyu DAX sorgu görünümünde (DAX query view) tek sorguyla üretirsin:</p>
<pre class="dax">EVALUATE
ROW(
    "Satır", COUNTROWS(Satislar),
    "Tekil satır", DISTINCTCOUNT(Satislar[SatirNo]),
    "Ham tutar", SUM(Satislar[Tutar]),
    "İptal", CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] = "İptal"),
    "Net", [Net Satış]
)</pre>
<div class="tip"><b>Mutabakatı belgeye yaz</b>Sonucu bir tabloyla sakla: “6 Ocak, kaynak: ERP satış dökümü, satır 1.620 = 1.620, ham tutar eşit, fark yok.” Bir sonraki “tutmuyor” sorusunda ilk bakacağın yer burasıdır.</div>

<h2>Test sayfası ve DAX sorgu test paketi</h2>
<p>Yazılımcılar kodlarını otomatik testlerle korur; ölçülerini sen de koruyabilirsin. Fikir: <b>bilinen değerleri</b> (brifteki ya da mutabakattaki sayılar) bir tabloya yaz, ölçülerin bugünkü sonucunu yanına koy ve farkı işaretle. Bir ölçüyü değiştirdikten sonra sorguyu tekrar çalıştırırsın; “FARK” görürsen bir şeyi bozmuşsundur.</p>
<pre class="dax">EVALUATE
VAR Testler =
    DATATABLE(
        "Test", STRING, "Beklenen", DOUBLE,
        {
            { "Satır sayısı", 1620 },
            { "Net satış", 1250772.45 },
            { "Sipariş sayısı", 838 }
        }
    )
VAR Sonuc =
    ADDCOLUMNS(
        Testler,
        "Gerçek",
            SWITCH(
                [Test],
                "Satır sayısı", COUNTROWS(Satislar),
                "Net satış", [Net Satış],
                "Sipariş sayısı", [Sipariş Sayısı]
            )
    )
RETURN
    ADDCOLUMNS(Sonuc, "Durum", IF(ABS([Gerçek] - [Beklenen]) &lt; 0.01, "OK", "FARK"))</pre>
<div class="warn"><b>Ondalık sayıları = ile karşılaştırma</b>Net satış motorda 1.250.772,4499999997 olarak hesaplanır; 1.250.772,45 ile <code>=</code> karşılaştırması “FARK” der. Para tutarlarını her zaman bir tolerans ile karşılaştır: <code>ABS(Gerçek - Beklenen) &lt; 0.01</code>.</div>
<p>Aynı testleri raporda gizli bir <b>Test</b> sayfasına da koyabilirsin: her test için bir kart, kart değeri “OK” ya da “FARK” döndüren bir ölçü. Sayfa yayımlanan uygulamada gizlenir; geliştirici her yayından önce bakar.</p>

<h2>Uç durumlar: testin asıl yeri</h2>
<p>Ölçülerin çoğu ortalama durumda doğru çalışır. Hatalar kenarlarda saklanır. Bizim modelde her biri gerçek olan beş kenar:</p>
<div class="tbl-wrap"><table>
<tr><th>Uç durum</th><th>Bu modelde</th><th>Ne kontrol edersin?</th></tr>
<tr><td><b>Boş değer</b></td><td>131 satırda <code>KargoGun</code> boş: 121’i iptal, 10’u aralık 2024’te hâlâ kargoda olan sipariş.</td><td>Boşluk beklenen bir durum mu (henüz teslim edilmedi) yoksa veri hatası mı? Ortalama kargo günü boşları atlar; bunu tanıma yaz.</td></tr>
<tr><td><b>Eksik boyut bilgisi</b></td><td>7 müşterinin şehri boş; bu müşterilerin net satışı 63.852,75 ₺.</td><td>Şehir grafiğinde “(Boş)” çubuğu çıkar. Gizlemek yerine veri sahibine bildir.</td></tr>
<tr><td><b>Kısmi dönem</b></td><td>Satışlar 22 Haziran 2022’de başlıyor; haziran 2022 net satışı yalnızca 595 ₺. Temmuz 2022’nin aylık büyümesi bu yüzden +%1.902,7 görünür. Hedefler ise ocak 2022’den başlıyor: ilk beş ayın 17.500 ₺ hedefi satışsız kaldığı için 2022 gerçekleşmesi %77,0.</td><td>Büyüme ve hedef ölçülerini ilk ve son dönemde dene. Gerekirse kısmi dönemi rapordan dışla ya da not düş.</td></tr>
<tr><td><b>Sıfıra bölme</b></td><td>Önceki ayı olmayan ilk ayda <code>[MoM %]</code> boş döner, çünkü DIVIDE kullanılıyor.</td><td>Her oranda <code>/</code> yerine DIVIDE; “BLANK, hatalar ve DAX’ta hata ayıklama” dersine bak.</td></tr>
<tr><td><b>Toplam satırı</b></td><td>Kategori satırlarındaki sipariş sayılarının toplamı 1.377, toplam satırı 838. Kategorilerin ortalama sepetlerini toplasan 6.251,44 ₺ eder; gerçek ortalama sepet 1.492,57 ₺.</td><td>Toplam satırı satırların toplamı olmak zorunda değildir: bir sipariş birden çok kategoride ürün içerebilir, ortalamalar toplanmaz. Kullanıcıya bunun hata olmadığını açıklayan bir not ekle.</td></tr>
</table></div>
<p>Bunlara ek olarak her sayfayı <b>filtrelerle</b> dene: tek bir yıl, hiç verisi olmayan bir kategori ve kanal kombinasyonu, birden çok dilimleyici seçimi. Satır düzeyi güvenlik varsa “Rol olarak görüntüle” ile her rolü tek tek test et (“Satır ve nesne düzeyinde güvenlik” dersi).</p>

<h2>Veri sözlüğü: her ölçünün kimliği</h2>
<p><b>Veri sözlüğü (data dictionary)</b>, modeldeki her ölçünün ve önemli sütunun ne anlama geldiğini yazan tablodur. Raporu devralan kişinin ilk açtığı belgedir.</p>
<div class="tbl-wrap"><table>
<tr><th>Ölçü</th><th>İş tanımı</th><th>Biçim</th><th>Sahip</th><th>Bilinen değer</th></tr>
<tr><td>Net Satış</td><td>İptal olmayan satırların indirim sonrası tutarı. İadeler dahil.</td><td>#.##0,00 ₺</td><td>Finans</td><td>Tüm yıllar 1.250.772,45 ₺</td></tr>
<tr><td>Sipariş Sayısı</td><td>İptal olmayan farklı sipariş numarası sayısı. Kategoriler toplanmaz.</td><td>#.##0</td><td>Satış</td><td>838</td></tr>
<tr><td>MoM %</td><td>Net satışın önceki aya göre değişimi. İlk ayda boş.</td><td>%0,0</td><td>Satış</td><td>Aralık 2024: %5,6</td></tr>
</table></div>
<p>Tanımı modelin içine de yaz: Model görünümünde ölçüyü seçip Özellikler bölmesindeki <b>Açıklama (Description)</b> alanını doldurursan, kullanıcı Veri bölmesinde ölçünün üzerine geldiğinde bu metni görür. Sözlüğün ham hâlini DAX sorgu görünümünde <code>INFO.VIEW.MEASURES()</code> fonksiyonu verir: her ölçünün adı, tablosu, açıklaması, ifadesi ve biçim dizesi gelir. İfade sütununu yalnızca modelde yazma izni olanlar görür.</p>
<pre class="dax" data-notry>EVALUATE
SELECTCOLUMNS(
    INFO.VIEW.MEASURES(),
    "Ölçü", [Name],
    "Açıklama", [Description],
    "Biçim", [FormatString],
    "İfade", [Expression]
)</pre>

<h2>Sürüm notları</h2>
<p>Her yayında kısa bir not yaz ve raporun “Hakkında” sayfasına ya da çalışma alanındaki bir belgeye ekle:</p>
<div class="note"><b>Örnek: Satış raporu v1.3 (14 Ocak)</b><b>Eklendi:</b> Dijital kanal satırı (Web + Mobil). <b>Değişti:</b> Ortalama kargo günü tanımı: kargodaki siparişler hesaba girmiyor. <b>Düzeltildi:</b> Şehir grafiğinde boş şehir “Bilinmiyor” olarak etiketlendi. <b>Etkisi:</b> Geçmiş net satış rakamları değişmedi. <b>Testler:</b> 3/3 OK.</div>
<p>Sürüm notunun en önemli satırı <b>etkisi</b>dir: kullanıcı, dün indirdiği Excel’deki sayının neden bugün farklı olduğunu orada görür. Dosyaları PBIP biçiminde Git’te tutuyorsan, not commit mesajıyla birlikte geçmişe de yazılır (“Yaşam döngüsü: PBIP, TMDL, Git, dağıtım işlem hatları, şablonlar” dersi).</p>

<h2>Kullanıcı kabul testi (UAT)</h2>
<p><b>Kullanıcı kabul testi (user acceptance testing)</b>, raporu yapan değil kullanan kişinin, brifteki kabul kriterlerine göre “evet, bu iş görüyor” demesidir. Kriterleri brifte yazmıştın; burada testi yönetiyorsun:</p>
<ol>
<li><b>Test kişilerini seç:</b> her rolden en az bir kullanıcı (müdür, bölge sorumlusu).</li>
<li><b>Senaryo ver, tur verme:</b> “Aralıkta hedefin altında kalan kategoriyi bul ve geçen yılla karşılaştır.” Kullanıcı kendisi yapsın.</li>
<li><b>Bulguları tek listede topla:</b> madde, kim buldu, önem (engelleyici / önemli / küçük), durum.</li>
<li><b>Engelleyici yoksa onay al:</b> e-postayla ya da iş takip aracında “Kabul edildi” durumu, tarih ve kişi.</li>
</ol>

<h2>Yayımlamadan önce kontrol listesi</h2>
<ul>
<li>Test sorgusu ve test sayfası: tüm satırlar OK.</li>
<li>Mutabakat tablosu güncel; son kontrolden sonra kaynakta yapı değişikliği yok.</li>
<li>Uç durumlar denendi: ilk ve son dönem, boş değerler, toplam satırı, filtre kombinasyonları.</li>
<li>Her ölçünün açıklaması dolu; veri sözlüğü güncel.</li>
<li>Satır düzeyi güvenlik her rolle test edildi.</li>
<li>Sayfa, Performans Analizi’nde (Performance analyzer) kabul edilebilir sürede açılıyor.</li>
<li>Erişilebilirlik ve mobil düzen kontrol edildi (“Mobil düzen, erişilebilirlik, dışa aktarma ve kişiselleştirme” dersi).</li>
<li>Sürüm notu yazıldı, kullanıcılara duyuru hazır.</li>
</ul>
`,
  ex: [
    { t: 'query', q: 'Finansla mutabakat için yıl düzeyinde kontrol toplamlarını üret: Tarih[Yil] başına <b>"Satır"</b> = COUNTROWS(Satislar) ve <b>"Tutar"</b> = SUM(Satislar[Tutar]). SUMMARIZECOLUMNS kullan.',
      start: 'EVALUATE\n',
      sol: 'EVALUATE\nSUMMARIZECOLUMNS(Tarih[Yil], "Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar]))',
      hint: 'EVALUATE SUMMARIZECOLUMNS(Tarih[Yil], "Satır", COUNTROWS(Satislar), "Tutar", SUM(Satislar[Tutar])). 2024 satırı 965 satır, 808.361,65 ₺ olmalı.' },
    { t: 'query', q: 'Tek satırlık bir test yaz: ROW ile iki sütun döndür. <b>"Test"</b> sütununda "Net satış" metni, <b>"Durum"</b> sütununda [Net Satış] ile beklenen 1250772.45 arasındaki farkın mutlak değeri 0.01’den küçükse "OK", değilse "FARK".',
      start: 'EVALUATE\n',
      sol: 'EVALUATE\nROW("Test", "Net satış", "Durum", IF(ABS([Net Satış] - 1250772.45) < 0.01, "OK", "FARK"))',
      hint: 'EVALUATE ROW("Test", "Net satış", "Durum", IF(ABS([Net Satış] - 1250772.45) < 0.01, "OK", "FARK")). = ile karşılaştırma ondalık yüzünden FARK der.' },
    { t: 'dax', name: 'Sipariş Toplam Testi',
      q: '<b>Sipariş Toplam Testi</b>: Test sayfası için: [Sipariş Sayısı], o bağlamdaki kategorilerin (VALUES(Kategoriler[Kategori])) [Sipariş Sayısı] toplamına eşitse "OK", değilse "FARK" döndür. Tek kategoride OK, yıl satırlarında FARK görmelisin: sipariş sayısı toplanabilir değildir.',
      sol: 'IF([Sipariş Sayısı] = SUMX(VALUES(Kategoriler[Kategori]), [Sipariş Sayısı]), "OK", "FARK")',
      hint: 'IF([Sipariş Sayısı] = SUMX(VALUES(Kategoriler[Kategori]), [Sipariş Sayısı]), "OK", "FARK"). SUMX her kategori için ölçüyü ayrı hesaplayıp toplar.' },
    { t: 'dax', name: 'Kargo Günü Eksik Satır',
      q: '<b>Kargo Günü Eksik Satır</b>: Veri kalitesi kontrolü: Satislar[KargoGun] değeri boş olan ve durumu "İptal" olmayan satırları say.',
      sol: 'CALCULATE(COUNTROWS(Satislar), ISBLANK(Satislar[KargoGun]), Satislar[Durum] <> "İptal")',
      hint: 'CALCULATE(COUNTROWS(Satislar), ISBLANK(Satislar[KargoGun]), Satislar[Durum] <> "İptal"). Toplamda 10 çıkmalı: hepsi aralık 2024’te kargoda.' },
    { t: 'mc', q: 'Rapor net satışı 1.250.772,45 ₺, ERP dökümü 1.346.189,85 ₺ gösteriyor. Mutabakatta ilk adım ne olmalı?',
      o: ['Rapordaki ölçüyü ERP ile aynı sonucu verecek şekilde değiştirmek', 'Farkı durum alanına göre ayırıp tanımı karşılaştırmak', 'ERP dökümünün hatalı olduğunu hemen finansa bildirmek', 'Modeli silip tüm veriyi baştan içeri aktarmak'], a: 1,
      why: 'Önce farkın nereden geldiğini bul. Burada fark tam olarak iptal satırlarının tutarı (95.417,40 ₺); yani iki sistem farklı tanım kullanıyor. Tanım farkı açıklanır ve sözlüğe yazılır.' },
    { t: 'mc', q: 'Bir matriste kategori satırlarındaki sipariş sayılarının toplamı 1.377, toplam satırı 838 gösteriyor. Bu durumu nasıl değerlendirirsin?',
      o: ['Toplam satırı hatalı; ölçü SUM ile yazılmalı', 'Kategori satırları hatalı; ilişki yönü yanlış', 'Matristen toplam satırını kaldırmak gerekir', 'Hata değil: sipariş çok kategoride olabilir'], a: 3,
      why: 'Farklı sipariş sayısı toplanabilir bir ölçü değildir. Birden çok kategoriden ürün içeren bir sipariş her kategoride bir kez sayılır, toplamda ise bir kez. Bu bir hata değil; kullanıcıya not olarak açıklanır.' },
    { t: 'mc', q: 'Kullanıcı kabul testinde (UAT) test kullanıcısına ne verirsin?',
      o: ['Gerçek bir iş senaryosu', 'Tüm DAX ölçülerinin listesi', 'Modelin ilişki diyagramı', 'Raporun .pbix dosyasının kopyası'], a: 0,
      why: 'Kabul testi, kullanıcının gerçek işini raporla yapıp yapamadığını sınar. Senaryoyu kullanıcı kendisi uygular; teknik belgeler bu testin konusu değildir.' }
  ]
});

/* ---------- 3 · Veri Hazırlama · SQL ---------- */
add('veri-baglantilari', {
  id: 'sql-analist', lv: 'B1', mod: 'Veri Hazırlama', min: 26,
  title: 'Power BI analisti için SQL: kaynağı sorgulamak ve DAX ile karşılaştırmak',
  sum: 'İş ilanlarının neredeyse hepsi Power BI’ın yanında SQL ister. SELECT, WHERE, JOIN, GROUP BY ve HAVING’i bu uygulamanın tablolarıyla öğren, aynı soruyu SQL ve DAX ile yan yana cevapla, işin SQL görünümünde mi, Power Query’de mi, DAX’ta mı yapılacağına karar ver.',
  body: `
<p>Anadolu Market’te bir analistin SQL’e üç yerde ihtiyacı olur: <b>kaynağı tanımak</b> (bu tabloda ne var, kaç satır var?), <b>rakamı doğrulamak</b> (rapordaki toplam veritabanıyla tutuyor mu?) ve <b>veriyi hazırlamak</b> (veritabanı ekibiyle birlikte bir görünüm yazmak). Power BI’a bağlanmadan önce birkaç satır SQL, modelde saatlerce aranacak bir sorunu baştan gösterir. Bu derste örnekler, uygulamanın modelindeki tabloların bir veritabanında aynı adla durduğunu varsayar: Satislar, Urunler, Musteriler.</p>

<h2>Aynı veri, iki farklı düşünme biçimi</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>SQL</th><th>DAX</th></tr>
<tr><td>Nerede çalışır?</td><td>Kaynak veritabanında</td><td>Power BI anlam modelinde</td></tr>
<tr><td>Tabloları nasıl bağlar?</td><td>Her sorguda <code>JOIN</code> ile açıkça</td><td>Modeldeki ilişkiler üzerinden, kendiliğinden</td></tr>
<tr><td>Filtre nereden gelir?</td><td>Sorgunun <code>WHERE</code> koşulundan</td><td>Görselden, dilimleyiciden ve CALCULATE’ten (filtre bağlamı)</td></tr>
<tr><td>Sonuç</td><td>Bir kez hesaplanan sabit bir tablo</td><td>Her hücrede yeniden hesaplanan bir ölçü</td></tr>
</table></div>
<p>Bu farkın en önemli sonucu şudur: SQL’de “kategoriye göre satış” için bir sorgu, “yıla göre satış” için başka bir sorgu yazarsın. DAX’ta tek bir <code>[Net Satış]</code> ölçüsü her iki görselde de doğru çalışır.</p>

<h2>SELECT ve WHERE: satırları seçmek</h2>
<pre data-notry>-- 2024’te Mağaza kanalında iptal olmayan satışların toplamı
SELECT SUM(s.Tutar) AS NetSatis
FROM   Satislar AS s
WHERE  s.Kanal = N'Mağaza'
  AND  s.Durum &lt;&gt; N'İptal'
  AND  s.Tarih &gt;= '2024-01-01' AND s.Tarih &lt; '2025-01-01';</pre>
<p>Aynı soru DAX’ta bir ölçüyle ve tarihin görselden gelmesiyle cevaplanır:</p>
<pre class="dax">Mağaza Net Satış (2024) =
CALCULATE([Net Satış], Satislar[Kanal] = "Mağaza", Tarih[Yil] = 2024)</pre>
<p>İkisi de 123.997,10 ₺ döner. Ayrıntılar:</p>
<ul>
<li><b>N öneki:</b> SQL Server’da Türkçe karakterli metinleri <code>N'İptal'</code> biçiminde yaz. N, metnin Unicode olduğunu söyler; yoksa “İ” gibi harfler sütunun karakter kümesine göre bozulabilir ve eşleşme sessizce başarısız olur.</li>
<li><b>Tarih aralığı:</b> <code>YEAR(Tarih) = 2024</code> yerine aralık yazmak, veritabanının dizini kullanmasını sağlar.</li>
<li><b>Büyük-küçük harf:</b> DAX metin karşılaştırmasında harf büyüklüğüne bakmaz; SQL’de bu, veritabanının harmanlama (collation) ayarına bağlıdır.</li>
</ul>

<h2>JOIN: ilişkiyi sorguda kurmak</h2>
<pre data-notry>SELECT u.Kategori, SUM(s.Tutar) AS NetSatis
FROM   Satislar AS s
JOIN   Urunler  AS u ON u.UrunNo = s.UrunNo
WHERE  s.Durum &lt;&gt; N'İptal'
GROUP BY u.Kategori
ORDER BY NetSatis DESC;</pre>
<p>DAX karşılığında JOIN yok, çünkü Satislar ile Urunler arasındaki ilişki modelde zaten var:</p>
<pre class="dax">EVALUATE
SUMMARIZECOLUMNS(Urunler[Kategori], "Net Satış", [Net Satış])
ORDER BY [Net Satış] DESC</pre>
<p>Elektronik 339.303,65 ₺ ile ilk sırada, Hediye 17.370 ₺ ile son sırada. <b>JOIN türü</b> önemlidir: <code>JOIN</code> (INNER) yalnızca iki tarafta da eşleşen satırları getirir, <code>LEFT JOIN</code> soldaki tablonun tüm satırlarını tutar. “Hiç alışveriş yapmamış müşteri” sorusu bu yüzden LEFT JOIN ister: Musteriler tablosundaki 150 müşterinin 14’ünün hiç satış satırı yok. Power Query’deki birleştirme türleri de aynı mantıkla çalışır (“Power Query: join türleri, dizin sütunu ve gruplu sıra” dersi).</p>

<h2>GROUP BY ve HAVING: gruplamak ve grubu süzmek</h2>
<p><code>WHERE</code> gruplamadan önce satırları, <code>HAVING</code> gruplamadan sonra grupları süzer. “Net satışı 180.000 ₺’yi aşan kategoriler”:</p>
<pre data-notry>SELECT u.Kategori, SUM(s.Tutar) AS NetSatis
FROM   Satislar AS s
JOIN   Urunler  AS u ON u.UrunNo = s.UrunNo
WHERE  s.Durum &lt;&gt; N'İptal'
GROUP BY u.Kategori
HAVING SUM(s.Tutar) &gt; 180000;</pre>
<pre class="dax">EVALUATE
FILTER(
    SUMMARIZECOLUMNS(Urunler[Kategori], "Net", [Net Satış]),
    [Net] &gt; 180000
)</pre>
<p>Dört kategori döner: Elektronik, Ev &amp; Yaşam, Giyim, Spor (184.231,10 ₺). HAVING’in DAX’taki karşılığı, özet tablonun üzerine konan FILTER’dır.</p>
<div class="warn"><b>Ada göre değil, anahtara göre grupla</b>Musteriler tablosunda 150 müşteri var ama yalnızca 140 farklı ad: 10 ad iki farklı kişiye ait. <code>GROUP BY Musteri</code> yazarsan iki “Kaan Kara” tek satırda birleşir ve 32 sipariş görünür; 49 numaralı Kaan Kara’nın kendi sipariş sayısı 18. Her zaman anahtarla (<code>MusteriNo</code>) grupla, adı yalnızca etiket olarak ekle. Aynı tuzak DAX’ta da vardır: görsele Musteriler[Musteri] koyarsan iki kişi tek satır olur.</div>
<p><b>COUNT(DISTINCT …)</b> da toplanabilir değildir. Kategorilere göre farklı sipariş sayılarını toplarsan 1.377 eder; gerçek sipariş sayısı 838’dir, çünkü bir sipariş birden çok kategoride ürün içerebilir. SQL’de de DAX’ta da toplam, alt toplamların toplamı olmayabilir.</p>

<h2>İş nerede yapılmalı: SQL görünümü, Power Query, DAX</h2>
<p>Yaygın bir kural (Roche’un ilkesi olarak bilinir): veri dönüşümünü <b>olabildiğince yukarıda, gerektiği kadar aşağıda</b> yap.</p>
<div class="tbl-wrap"><table>
<tr><th>Nerede?</th><th>Ne için uygun?</th><th>Anadolu Market örneği</th></tr>
<tr><td><b>SQL görünümü (view)</b></td><td>Birçok raporun kullanacağı, kurumsal kurala bağlı temizlik ve birleştirme. Veritabanı ekibi bakımını üstlenir.</td><td>Test siparişlerini dışlayan <code>vw_Satislar</code> görünümü</td></tr>
<tr><td><b>Power Query</b></td><td>Kaynağa yazma iznin olmadığında şekillendirme; Excel ve SharePoint gibi veritabanı olmayan kaynaklar.</td><td>Bayi Excel dosyasındaki başlık satırlarını temizlemek</td></tr>
<tr><td><b>DAX ölçüsü</b></td><td>Filtreye göre değişmesi gereken her hesap: oranlar, zaman karşılaştırmaları, paylar.</td><td><code>[MoM %]</code>, <code>[Kategori Payı %]</code></td></tr>
</table></div>
<p>Kural basit: <b>satır düzeyinde ve sabit</b> olan iş kaynağa ya da Power Query’ye, <b>filtreye göre değişen</b> iş DAX’a. Kategori payını SQL’de sabit bir sütun olarak hesaplarsan, kullanıcı dilimleyiciden bir yıl seçtiğinde pay yanlış kalır.</p>

<h2>Sorgu katlama ve yerel sorgu riskleri</h2>
<p>Power Query, gezginden seçtiğin bir tabloda yaptığın filtre ve gruplama adımlarını çoğu zaman kendisi SQL’e çevirip veritabanına gönderir; buna <b>sorgu katlama (query folding)</b> denir. Gezgin ile yerel SQL sorgusu arasındaki seçimi ve katlamayı korumanın yolunu “Veri bağlantıları: veritabanı, yerel SQL sorgusu, Desktop ile hizmet” dersinde gördük; katlamanın temelleri “Power Query: birleştirme, ekleme, özetten çıkarma” dersinde. Burada yalnızca analistin bilmesi gereken riskleri toplayalım:</p>
<ul>
<li><b>Katlama çoğu zaman biter:</b> Yerel bir SQL sorgusundan sonra eklenen Power Query adımlarının kaynağa katlanması yalnızca bazı bağlayıcılarda mümkündür. Geri kalan adımlar bilgisayarında ya da ağ geçidinde çalışır ve yenileme yavaşlar.</li>
<li><b>Yan etki riski:</b> Microsoft Learn’e göre yerel sorguların amacı veriyi değiştirmemektir, ama Power Query bunun garantisini vermez. Bu yüzden Desktop, bağlayıcı penceresi dışında çalışan her yeni sorgu metni için onay ister (Seçenekler → Güvenlik → “Require user approval for new native database queries”). Başkasının yazdığı sorguyu senin kimlik bilgilerinle çalıştırmadan önce oku.</li>
<li><b>DDL desteklenmez:</b> <code>CREATE TABLE</code>, <code>DROP TABLE</code>, <code>ALTER TABLE</code> gibi komutlar Power Query’de desteklenmez ve hataya yol açar.</li>
<li><b>Bakım:</b> Rapora gömülü uzun bir SQL metnini başka kimse bulamaz. Tekrar kullanılacak mantığı veritabanında bir görünüme taşı ve bağlantı için yalnızca okuma izni olan bir hesap iste.</li>
</ul>

<h2>Rakamı SQL ile doğrulamak</h2>
<p>Bir raporu yayımlamadan önce veritabanında üç sorgu çalıştırıp sonucu modeldeki karşılığıyla eşleştirmek iyi bir alışkanlıktır: satır sayısı (<code>COUNT(*)</code>), ham tutar toplamı (<code>SUM(Tutar)</code>) ve yıla göre kırılım. Modeldeki karşılığı ve mutabakatın tamamı “Rapor kalitesi: veri mutabakatı, ölçü testleri, belgeleme ve kabul testi” dersinde.</p>
<pre data-notry>SELECT YEAR(Tarih) AS Yil, COUNT(*) AS Satir, SUM(Tutar) AS HamTutar
FROM   Satislar
GROUP BY YEAR(Tarih)
ORDER BY Yil;</pre>
<div class="tip"><b>Daha fazla SQL için Kesit SQL</b>Bu uygulamanın kardeşi Kesit SQL’de aynı sipariş verisiyle SELECT’ten pencere fonksiyonlarına kadar SQL alıştırmaları var. Mülakatlarda en sık istenen konular: JOIN türleri, GROUP BY ile HAVING farkı, alt sorgu ve CTE, ROW_NUMBER gibi pencere fonksiyonları.</div>
`,
  ex: [
    { t: 'query', q: 'Bu SQL’i DAX sorgusuna çevir: <code>SELECT u.Kategori, SUM(s.Tutar) AS NetSatis FROM Satislar s JOIN Urunler u ON u.UrunNo = s.UrunNo WHERE s.Durum &lt;&gt; N\'İptal\' GROUP BY u.Kategori</code>. Sütun adı <b>"Net Satış"</b> olsun ve hazır [Net Satış] ölçüsünü kullan.',
      start: 'EVALUATE\n',
      sol: 'EVALUATE\nSUMMARIZECOLUMNS(Urunler[Kategori], "Net Satış", [Net Satış])',
      hint: 'JOIN ve WHERE gerekmez: ilişki modelde var, iptal filtresi [Net Satış] içinde. EVALUATE SUMMARIZECOLUMNS(Urunler[Kategori], "Net Satış", [Net Satış]).' },
    { t: 'query', q: 'Bu SQL’i DAX sorgusuna çevir: <code>SELECT m.Sehir, COUNT(DISTINCT s.MusteriNo) AS Musteri FROM Satislar s JOIN Musteriler m ON … WHERE s.Durum &lt;&gt; N\'İptal\' GROUP BY m.Sehir HAVING COUNT(DISTINCT s.MusteriNo) &gt;= 10</code>. Sütun adı <b>"Müşteri"</b> olsun; [Müşteri Sayısı] ölçüsünü kullan.',
      start: 'EVALUATE\n',
      sol: 'EVALUATE\nFILTER(SUMMARIZECOLUMNS(Musteriler[Sehir], "Müşteri", [Müşteri Sayısı]), [Müşteri] >= 10)',
      hint: 'HAVING, özet tablonun üzerine konan FILTER’dır: EVALUATE FILTER(SUMMARIZECOLUMNS(Musteriler[Sehir], "Müşteri", [Müşteri Sayısı]), [Müşteri] >= 10). Dört şehir dönmeli.' },
    { t: 'dax', name: 'Mağaza Kanalı Net Satış',
      q: '<b>Mağaza Kanalı Net Satış</b>: Bu SQL’in ölçü karşılığını yaz; tarih filtresi görselden gelsin: <code>SELECT SUM(Tutar) FROM Satislar WHERE Kanal = N\'Mağaza\' AND Durum &lt;&gt; N\'İptal\'</code>',
      sol: 'CALCULATE([Net Satış], Satislar[Kanal] = "Mağaza")',
      hint: 'İptal koşulu [Net Satış] içinde. CALCULATE([Net Satış], Satislar[Kanal] = "Mağaza"). Tüm yıllar için 193.600,35 ₺.' },
    { t: 'dax', name: 'Beş Siparişli Müşteri',
      q: '<b>Beş Siparişli Müşteri</b>: SQL’deki <code>SELECT COUNT(*) FROM (SELECT MusteriNo FROM Satislar WHERE Durum &lt;&gt; N\'İptal\' GROUP BY MusteriNo HAVING COUNT(DISTINCT SiparisNo) &gt;= 5) t</code> sorgusunun ölçü karşılığı: o bağlamda en az 5 siparişi olan müşteri sayısı. VALUES(Satislar[MusteriNo]) ve [Sipariş Sayısı] kullan.',
      sol: 'COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), [Sipariş Sayısı] >= 5))',
      hint: 'İç sorgu = FILTER(VALUES(Satislar[MusteriNo]), [Sipariş Sayısı] >= 5); dıştaki COUNT(*) = COUNTROWS. Tüm yıllar için 68 müşteri.' },
    { t: 'mc', q: 'SQL’de <code>WHERE</code> ile <code>HAVING</code> arasındaki fark nedir?',
      o: ['WHERE grupları, HAVING ise tek satırları süzer', 'WHERE satırları önce, HAVING grupları sonra süzer', 'İkisi aynıdır; yalnızca yazım sırası farklıdır', 'HAVING yalnızca JOIN içeren sorgularda kullanılabilir'], a: 1,
      why: 'WHERE ham satırları gruplamadan önce eler; HAVING ise GROUP BY ile oluşan grupları, örneğin SUM(Tutar) > 180000 gibi toplama koşullarıyla süzer. DAX’taki karşılığı özet tablonun üzerine konan FILTER’dır.' },
    { t: 'mc', q: 'Kategori payını (%) bir SQL görünümünde sabit bir sütun olarak hesapladın. Kullanıcı dilimleyiciden 2024’ü seçince ne olur?',
      o: ['Pay 2024’e göre doğru biçimde değişir', 'Görsel bir hesaplama hatası gösterir', 'Pay 2024’e göre yeniden hesaplanmaz', 'Görünüm dilimleyiciyle yeniden çalışır'], a: 2,
      why: 'SQL sonucu yenileme anında bir kez hesaplanır; dilimleyici onu değiştirmez. Filtreye göre değişmesi gereken oranlar DAX ölçüsü olarak yazılır.' },
    { t: 'mc', q: 'Bir meslektaşın raporunda, Power Query’de elle yazılmış uzun bir yerel SQL sorgusu var ve sonrasında birçok Power Query adımı eklenmiş. En olası sorun hangisi?',
      o: ['Adımlar katlanmayabilir, yenileme yavaşlar', 'DAX ölçüleri bu tabloyla hiç çalışmaz', 'Rapor hizmette hiçbir zaman yayımlanamaz', 'Tablo kendiliğinden DirectQuery moduna geçer'], a: 0,
      why: 'Yerel sorgudan sonra katlama yalnızca bazı bağlayıcılarda mümkündür. Katlanmayan adımlar kaynağa değil bilgisayarına ya da ağ geçidine yük bindirir. Çözüm genellikle mantığı bir SQL görünümüne taşımaktır.' }
  ]
});

/* ---------- 4 · Kariyer · portföy ve ilk 90 gün ---------- */
add('vaka-pazar', {
  id: 'portfoy-kariyer', lv: 'B2', mod: 'Kariyer', min: 26,
  title: 'Portföy, CV ve ilk 90 gün: Power BI işine hazırlanmak',
  sum: 'İşe alan yöneticinin ne aradığını bil; 2–3 portföy projesi seç ve şirket verisi sızdırmadan yayımla; proje README’si ve ölçülebilir CV maddeleri yaz; iş ilanını oku, ev ödevini çöz ve ilk 90 günü planla.',
  body: `
<p>Bu patikanın sonunda elinde onlarca alıştırma ve birkaç vaka çalışması var. İşe alan yönetici bunların hepsini görmeyecek; CV’ne ve portföyüne birkaç dakika bakıp tek bir soru soracak: <i>“Bu kişi bizim ekipte, bizim verimizle, kısa sürede iş çıkarabilir mi?”</i> Bu ders o soruya kanıt hazırlamayı ve işe başladıktan sonraki ilk üç ayı anlatıyor. Teknik mülakat soruları “DAX ve Power BI mülakatına hazırlık” dersinde.</p>

<h2>İşe alan yönetici ne görmek ister?</h2>
<div class="tbl-wrap"><table>
<tr><th>Aradığı sinyal</th><th>Kanıtı nasıl gösterirsin?</th></tr>
<tr><td>İş sorusunu anlıyor mu?</td><td>Her projenin başında bir cümlelik iş sorusu ve kime yaradığı</td></tr>
<tr><td>Model kurabiliyor mu?</td><td>Yıldız şema ekran görüntüsü, ilişkiler, tarih tablosu</td></tr>
<tr><td>DAX’ı doğru kullanıyor mu?</td><td>3–5 önemli ölçü, ne yaptıkları ve neden öyle yazıldıkları</td></tr>
<tr><td>Bulgu çıkarabiliyor mu?</td><td>Grafik değil, sayıyla desteklenmiş iki-üç bulgu ve öneri</td></tr>
<tr><td>Sayıyı doğruluyor mu?</td><td>Mutabakat ya da test notu (“Rapor kalitesi” dersindeki gibi)</td></tr>
<tr><td>Anlatabiliyor mu?</td><td>Kısa, düzenli bir README ve 2–3 dakikalık bir tanıtım videosu</td></tr>
</table></div>

<h2>2–3 portföy projesi seçmek</h2>
<p>On yarım proje yerine üç bitmiş proje göster. Her biri farklı bir beceriyi kanıtlasın:</p>
<ol>
<li><b>Uçtan uca bir rapor:</b> veri alma, temizlik, model, ölçüler, tasarım, yayımlama. Patikanın bitirme projesi tam olarak bu (Kariyer bölümündeki “Bitirme projeleri” sayfası ve “Bitirme projesine hazırlık” dersi).</li>
<li><b>Derin bir analiz:</b> bir soruya cevap veren vaka. Örnekler: “Vaka: müşteri kaybı (churn)”, “Vaka: e-ticaret dönüşüm hunisi ve kargo”, “Vaka: pazar payı ve rakip karşılaştırması”.</li>
<li><b>Hedeflediğin sektöre yakın bir proje:</b> perakende için “Vaka: stok analizi”, finans için “Vaka: kredi portföyü ve geri ödeme planı”, insan kaynakları için “Vaka: İK analitiği”.</li>
</ol>
<p>Uygulamadaki vakaları birebir kopyalama; kendi sorunu ekle. Örneğin satış vakasını “Hediye kategorisi neden hedefin gerisinde?” sorusuyla bitir ve kendi önerini yaz.</p>

<h2>Güvenli yayımlamak</h2>
<p>Portföyü göstermenin en tehlikeli yolu en kolayı gibi görünendir: <b>Web’de yayımla (Publish to web)</b>. Microsoft Learn bu özellik için açıkça uyarıyor: oluşan bağlantıyı internetteki <b>herkes</b> açabilir, giriş yapması gerekmez ve izleyen kişi raporun topladığı ayrıntı düzeyindeki veriyi görebilir; raporda gösterilmeyen model verisi de açığa çıkabilir. Gizli ya da şirkete ait bilgiyle kullanılmamalıdır. Özelliği bir Power BI yöneticisinin kiracı ayarlarından açması gerekir; satır düzeyi güvenlik kullanan raporlarda zaten desteklenmez.</p>
<div class="warn"><b>Asla şirket verisi</b>Ne çalıştığın ne de staj yaptığın şirketin verisini portföyüne koy; adları değiştirmek de yetmez. Müşteri adı, telefon, e-posta gibi kişisel veriler (KVKK kapsamında) hiçbir koşulda paylaşılmaz. Bu uygulamanın Anadolu Market verisi gibi kurgusal ya da açık lisanslı veri setleri kullan.</div>
<p>Güvenli seçenekler:</p>
<ul>
<li><b>Ekran görüntüleri ve PDF:</b> Desktop’ta Dosya → Dışa aktar → PDF olarak dışa aktar. En az riskli yol.</li>
<li><b>Kısa video:</b> 2–3 dakikada iş sorusu, bir etkileşim ve bulgu. Yönetici dosya indirmeden izler.</li>
<li><b>Git deposunda PBIP:</b> Projeyi Power BI proje (PBIP) biçiminde kaydedersen model ve rapor metin dosyaları olarak saklanır, ölçülerin okunabilir. Verinin yerel kopyasını tutan <code>cache.abf</code> dosyası ve kişisel ayarlar dosyası Git’te varsayılan olarak yok sayılır. Yine de yüklemeden önce Power Query sorgularındaki sunucu adlarına ve dosya yollarına bak.</li>
</ul>

<h2>Proje README’si</h2>
<p>Depodaki ya da portföy sayfasındaki her proje aynı beş başlıkla başlasın:</p>
<div class="tbl-wrap"><table>
<tr><th>Başlık</th><th>Örnek (Anadolu Market hedef takibi)</th></tr>
<tr><td><b>Sorun</b></td><td>Satış müdürü 2024’te hangi kategorilerin hedefin gerisinde kaldığını ve nedenini görmek istiyor.</td></tr>
<tr><td><b>Veri</b></td><td>Kurgusal perakende verisi: 1.620 satış satırı, 40 ürün, 150 müşteri, aylık kategori hedefleri (Haziran 2022 – Aralık 2024).</td></tr>
<tr><td><b>Model</b></td><td>Yıldız şema: Satislar ve Hedefler olgu tabloları; Tarih, Urunler, Kategoriler, Musteriler boyutları. Ekran görüntüsü.</td></tr>
<tr><td><b>Önemli ölçüler</b></td><td>Net Satış, Hedef Gerçekleşme %, Hedef Durum Etiketi; her biri için bir cümle.</td></tr>
<tr><td><b>Bulgular</b></td><td>2024’te yalnızca Kitap hedefi tuttu (%100,2). Hediye %83,6 ile en geride. Toplam gerçekleşme %97,9.</td></tr>
</table></div>

<h2>CV maddesi formülü</h2>
<p>Her madde üç parçadan oluşsun: <b>eylem + araç + ölçülebilir sonuç</b>. Sonuç bir iş etkisi olsun; bunu bilmiyorsan projenin kapsamını sayıyla ver.</p>
<div class="tbl-wrap"><table>
<tr><th>Zayıf</th><th>Güçlü</th></tr>
<tr><td>Power BI ile raporlar hazırladım.</td><td>Haftalık satış raporunu Power BI’da yeniden kurdum; Excel’de 3 saat süren hazırlık otomatik yenilemeye geçti.</td></tr>
<tr><td>DAX biliyorum.</td><td>Hedef, geçen yıl ve aylık değişim için 25 DAX ölçüsü yazdım; finansla mutabakatta fark çıkmadı.</td></tr>
<tr><td>SQL kullandım.</td><td>Satış görünümünü SQL ile yazıp 4 raporun ortak kaynağı yaptım; aynı mantığın 4 kopyası kalktı.</td></tr>
</table></div>
<p>Portföy projesinden gelen bir sayıyı iş deneyimi gibi gösterme; “kişisel proje” olarak etiketle. Mülakatta her maddenin ayrıntısı sorulabilir.</p>

<h2>İş ilanını okumak</h2>
<p>İlanlar genellikle ikiye ayrılır: <b>zorunlu (must-have)</b> ve <b>tercih sebebi (nice-to-have)</b>. Örnek bir “Junior BI Analisti” ilanı:</p>
<div class="tbl-wrap"><table>
<tr><th>İlandaki madde</th><th>Tür</th><th>Hazırlığın</th></tr>
<tr><td>Power BI ile rapor ve veri modeli geliştirme</td><td>Zorunlu</td><td>Bitirme projesi, yıldız şema</td></tr>
<tr><td>DAX ile ölçü yazma</td><td>Zorunlu</td><td>Bağlam, CALCULATE ve zaman zekâsı dersleri</td></tr>
<tr><td>SQL ile veri sorgulama</td><td>Zorunlu</td><td>“Power BI analisti için SQL” dersi ve Kesit SQL</td></tr>
<tr><td>İş birimleriyle ihtiyaç analizi</td><td>Zorunlu</td><td>“Paydaşlarla çalışmak” dersi</td></tr>
<tr><td>PL-300 sertifikası</td><td>Tercih sebebi</td><td>“PL-300 sınavına hazırlık” dersi</td></tr>
<tr><td>Fabric, Python</td><td>Tercih sebebi</td><td>Giriş düzeyinde bilmek yeterli</td></tr>
</table></div>
<p>Zorunluların çoğunu karşılıyor ve kalanları öğrenebileceğini gösterebiliyorsan başvur. Ön yazında ilandaki iki zorunlu maddeyi kendi projenden birer kanıtla eşle.</p>

<h2>Ev ödevi (take-home) görevi</h2>
<p>Birçok şirket mülakatta küçük bir veri seti ve “bir KPI sayfası hazırla” görevi verir. Değerlendirilen şey yalnızca doğru sayı değildir: <b>varsayımlarını yazman</b>, <b>tanımı netleştirmen</b> ve <b>sonucu iki cümlede anlatman</b>. Tipik bir görev: “Her kategorinin hedef gerçekleşmesini hesapla ve bir durum etiketi ver: %100 ve üstü ‘Hedefte’, %95–100 ‘Yakın’, altı ‘Geride’, hedef yoksa ‘Hedef yok’.” 2024 için cevap:</p>
<div class="tbl-wrap"><table>
<tr><th>Kategori</th><th>Net satış</th><th>Hedef</th><th>Gerçekleşme</th><th>Durum</th></tr>
<tr><td>Kitap</td><td>95.326,50 ₺</td><td>95.100 ₺</td><td>%100,2</td><td>Hedefte</td></tr>
<tr><td>Giyim</td><td>110.090,15 ₺</td><td>110.600 ₺</td><td>%99,5</td><td>Yakın</td></tr>
<tr><td>Elektronik</td><td>206.432,20 ₺</td><td>213.300 ₺</td><td>%96,8</td><td>Yakın</td></tr>
<tr><td>Hediye</td><td>9.700 ₺</td><td>11.600 ₺</td><td>%83,6</td><td>Geride</td></tr>
</table></div>
<p>Teslimde ölçünün yanına üç satır ekle: <i>“Varsayım: net satış iptalleri dışlar, iadeleri içerir. Eşikler görevde verildiği gibi. Kategori adı Kategoriler tablosundan alındı, çünkü hedef bu tabloya bağlı.”</i> Son cümle, değerlendiren kişiye modeli anladığını gösterir: ürün tablosundaki kategori sütunu Hedefler tablosunu süzmez.</p>

<h2>İlk 90 gün</h2>
<div class="tbl-wrap"><table>
<tr><th>Dönem</th><th>Odak</th><th>Somut çıktı</th></tr>
<tr><td><b>1–30. gün: öğren</b></td><td>Mevcut raporların envanteri: hangi rapor var, kim kullanıyor, kim sahibi, son ne zaman açıldı? Veri kaynaklarının haritası: hangi sistem, hangi bağlantı, hangi yenileme saati.</td><td>Rapor envanteri tablosu ve bir sayfalık kaynak haritası</td></tr>
<tr><td><b>31–60. gün: katkı ver</b></td><td>Bir <b>hızlı kazanç</b> seç: yavaş açılan bir sayfayı hızlandırmak, sürekli sorulan bir tanımı araç ipucuna yazmak, kırık bir yenilemeyi düzeltmek.</td><td>Ölçülebilir küçük bir iyileştirme ve duyurusu</td></tr>
<tr><td><b>61–90. gün: sahiplen</b></td><td>Bir raporun ya da modelin sorumluluğunu al. Veri sözlüğünü ve sürüm notlarını başlat. Kendi talep listeni etki × efor ile yönet.</td><td>Belgelenmiş bir rapor ve sonraki çeyreğin planı</td></tr>
</table></div>
<p>İlk ayın en değerli yatırımı <b>ilişkilerdir</b>: veri sahipleriyle, BT ile ve raporlarını en çok kullanan üç kişiyle birebir görüş. “Bu rapordan neyi kullanıyorsunuz, neyi hiç açmıyorsunuz?” sorusu sana hem iş listesini hem de güveni getirir. İlk haftalarda var olan bir raporu “yanlış yapılmış” diye eleştirme; nedenini sor, çoğu zaman bir geçmişi vardır.</p>
<div class="tip"><b>Kendine bir başarı günlüğü tut</b>Her hafta yaptığın bir işi ve etkisini bir satırla yaz. Üç ay sonraki değerlendirme görüşmesinde de, bir sonraki CV’nde de bu satırlar en güçlü maddelerin olur.</div>
`,
  ex: [
    { t: 'dax', name: 'Hedef Durum Etiketi',
      q: '<b>Hedef Durum Etiketi</b>: Ev ödevi: [Hedef Gerçekleşme %] değerini bir değişkene al. Boşsa "Hedef yok", 1 ve üstüyse "Hedefte", 0,95 ve üstüyse "Yakın", değilse "Geride" döndür. SWITCH(TRUE(), …) kullan.',
      sol: 'VAR G = [Hedef Gerçekleşme %] RETURN SWITCH(TRUE(), ISBLANK(G), "Hedef yok", G >= 1, "Hedefte", G >= 0.95, "Yakın", "Geride")',
      hint: 'VAR G = [Hedef Gerçekleşme %] RETURN SWITCH(TRUE(), ISBLANK(G), "Hedef yok", G >= 1, "Hedefte", G >= 0.95, "Yakın", "Geride"). Koşullar yukarıdan aşağı denenir; boş kontrolü en başta olmalı.' },
    { t: 'dax', name: 'Yıl İçi Hedef Gerçekleşme',
      q: '<b>Yıl İçi Hedef Gerçekleşme</b>: Ev ödevinin ikinci sorusu: “Yılbaşından bu yana hedefin yüzde kaçındayız?” Hazır [Satış YTD] ölçüsünü [Hedef YTD] ölçüsüne güvenli biçimde böl.',
      sol: 'DIVIDE([Satış YTD], [Hedef YTD])',
      hint: 'DIVIDE([Satış YTD], [Hedef YTD]). 2024 için %97,9 çıkmalı.' },
    { t: 'mc', q: 'Portföyündeki bir raporu işe alan yöneticiye en güvenli biçimde nasıl gösterirsin?',
      o: ['Web’de yayımla ile herkese açık bağlantı', 'Eski işyerinin verisiyle, adları değiştirerek', 'Kurgusal veriyle PDF, kısa video ve PBIP deposu', 'Raporu .pbix olarak e-postayla, veriyle birlikte'], a: 2,
      why: 'Web’de yayımla bağlantısını internetteki herkes giriş yapmadan açabilir ve model verisi açığa çıkabilir. Şirket verisi ad değiştirilse de paylaşılmaz. Kurgusal veriyle hazırlanmış PDF, video ve PBIP deposu güvenli yollardır.' },
    { t: 'mc', q: 'Hangisi “eylem + araç + ölçülebilir sonuç” formülüne uyan bir CV maddesidir?',
      o: ['Power BI, DAX ve SQL konularında çok deneyimliyim.', 'Raporu Power BI’a taşıdım; 3 saatlik hazırlık kalktı.', 'Birçok farklı rapor ve dashboard projesi geliştirdim.', 'Takım çalışmasına yatkın ve öğrenmeye açık biriyim.'], a: 1,
      why: 'İkinci seçenekte eylem (taşıdım), araç (Power BI) ve ölçülebilir sonuç (3 saatlik hazırlığın kalkması) birlikte var. Diğerleri kanıtsız genel ifadeler.' },
    { t: 'mc', q: 'Bir ilanda “Zorunlu: Power BI, DAX, SQL. Tercih sebebi: PL-300, Fabric” yazıyor. Sende ilk üçü var, sertifika yok. Ne yaparsın?',
      o: ['Sertifikayı alana kadar başvurmam', 'Başvururum; zorunluları kanıtla eşlerim', 'Sertifikam varmış gibi CV’ye yazarım', 'Yalnızca Fabric isteyen ilanlara bakarım'], a: 1,
      why: 'Tercih sebepleri eleme ölçütü değildir. Zorunluları karşılıyorsan başvurursun ve kanıtlarını öne çıkarırsın. CV’de olmayan bir sertifikayı yazmak dürüstlük sorunudur.' },
    { t: 'mc', q: 'Yeni işindeki ilk ayında en değerli çıktı hangisidir?',
      o: ['Tüm raporları yeni bir temayla baştan tasarlamak', 'Rapor envanteri ve veri kaynağı haritası', 'Kendi beğendiğin yeni bir dashboard yayımlamak', 'Kullanılmayan eski raporları hemen silmek'], a: 1,
      why: 'İlk ay öğrenme dönemidir. Hangi raporun kim tarafından kullanıldığını ve verinin nereden geldiğini bilmeden yapılan değişiklikler, birinin günlük işini bozabilir.' },
    { t: 'mc', q: 'Ev ödevinde kategori hedef gerçekleşmesini hesaplarken neden Kategoriler[Kategori] sütununu kullanmak gerekir?',
      o: ['Daha kısa yazıldığı için', 'Urunler tablosu gizli olduğu için', 'Biçimlendirme yalnızca bu sütunda çalıştığı için', 'Hedefler tablosu bu tabloya bağlı'], a: 3,
      why: 'Hedefler, Kategoriler tablosuyla ilişkili. Urunler[Kategori] Kategoriler’e doğru filtre geçirmez; o sütunu kullanırsan her kategoride hedef toplamı aynı görünür ve oran yanlış çıkar.' }
  ]
});

})(window);
