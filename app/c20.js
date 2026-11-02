/* Kesit Power BI — c20: Power BI Desktop kurulumu ve çalışma ortamı (Windows, Microsoft Store / indirme, Mac seçenekleri, hesap) */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const add = (after, lesson) => { L.push(lesson); const O = W.PBI_ORDER; if (O && !O.includes(lesson.id)) { const i = O.indexOf(after); O.splice(i < 0 ? O.length : i + 1, 0, lesson.id); } };

add('aile', {
  id: 'kurulum', lv: 'A1', mod: 'Başlangıç', min: 10,
  title: 'Power BI Desktop kurulumu: bilgisayarını hazırla',
  sum: 'Desktop’ı Microsoft Store’dan ya da indirme merkezinden kurmak, sistem gereksinimleri, aylık güncellemeler, Mac kullanıcıları için seçenekler ve Power BI hizmeti için gereken iş/okul hesabı.',
  body: `
<p>Bu uygulamadaki bütün alıştırmalar tarayıcıda çalışır; kurulum yapmadan ilerleyebilirsin. Ama işte raporu <b>Power BI Desktop</b>’ta yapacaksın. Desktop ücretsizdir ve raporu yerel olarak hazırlamak için lisans ya da oturum açma gerektirmez. Lisans ve hesap, raporu Power BI hizmetinde yayımlamak ve paylaşmak istediğinde gerekir.</p>

<h2>Önce: bilgisayarın uygun mu?</h2>
<p>Power BI Desktop yalnızca <b>Windows</b> uygulamasıdır. Microsoft Learn’deki gereksinimlerin özeti:</p>
<div class="tbl-wrap"><table>
<tr><th>Gereksinim</th><th>Değer</th></tr>
<tr><td>İşletim sistemi</td><td>Windows 10 ya da Windows Server 2016 ve sonrası (istemci Windows önerilir). ARM işlemcili Windows için 2025-09 toplu güncellemesi (KB5065789) gerekir.</td></tr>
<tr><td>Bellek</td><td>En az 2 GB boş; 4 GB ve üzeri önerilir. Pratikte büyük modellerde 8–16 GB çok daha rahat çalışır.</td></tr>
<tr><td>İşlemci</td><td>1 GHz, 64 bit (x64) ya da daha iyisi. 32 bit sürüm artık desteklenmiyor.</td></tr>
<tr><td>Ekran</td><td>En az 1440×900 ya da 1600×900 (16:9)</td></tr>
<tr><td>Yazılım</td><td>.NET 4.7.2 ve sonrası; Microsoft Edge WebView2 (kurulumla birlikte gelir)</td></tr>
</table></div>

<h2>İki kurulum yolu</h2>
<div class="tbl-wrap"><table>
<tr><th></th><th>Microsoft Store</th><th>İndirme merkezi (.exe)</th></tr>
<tr><td>Güncelleme</td><td>Windows yeni sürümü arka planda kendisi indirir</td><td>Her ay yeni sürümü elle indirip kurarsın</td></tr>
<tr><td>Yönetici izni</td><td>Gerekmez</td><td>Genellikle gerekir</td></tr>
<tr><td>Ne zaman seçilir?</td><td>Kişisel bilgisayar ve öğrenme için en kolay yol</td><td>Şirket belirli bir sürümü sabitlemek istiyorsa ya da Store kapalıysa</td></tr>
</table></div>
<ol>
<li>Microsoft Store’u aç, “Power BI Desktop” ara ve <b>Yükle</b>’ye bas. İndirme yolunu seçtiysen 64 bit sürümü al.</li>
<li>İlk açılışta bir oturum açma penceresi çıkabilir. Henüz hesabın yoksa kapatabilirsin; yerel çalışma için gerekmez.</li>
<li><b>Dosya → Seçenekler ve ayarlar → Seçenekler</b> altında bölgesel ayarlara ve önizleme özelliklerine bir göz at. Ondalık ayırıcı ve tarih biçimi buradan etkilenir.</li>
<li>Başlangıç ekranındaki örnek veri seçeneğiyle ya da kendi Excel dosyanla ilk raporunu aç; ardından bu patikadaki “Arayüz turu” dersine geç.</li>
</ol>
<div class="warn"><b>İkisini birden kurma</b>Store sürümü ile .exe sürümünü yan yana kurmak desteklenmiyor. Store sürümüne geçersen .exe sürümündeki kullanıcı ayarları kopyalanmaz; veri kaynağı kimlik bilgilerini yeniden girmen gerekebilir.</div>

<h2>Aylık güncellemeler ve sürüm uyumu</h2>
<p>Desktop her ay yeni sürüm alır ve yalnızca en son sürüm desteklenir. Önemli bir kural: <b>yeni sürümle kaydedilmiş bir dosyayı eski sürüm açamaz</b>. Ekipte herkesin aynı ayın sürümünü kullanması bu yüzden önemlidir. Şirketler bunu genellikle Store sürümüyle ya da merkezi dağıtımla çözer.</p>
<div class="note"><b>Report Server kullanan şirketler</b>Raporları şirket içindeki Power BI Report Server’a yayımlıyorsan normal Desktop yerine <b>Power BI Desktop for Report Server</b> sürümünü kurman gerekir. Bu sürüm daha seyrek güncellenir ve sunucunun sürümüyle eşleşmelidir.</div>

<h2>Mac kullanıyorsan</h2>
<p>Desktop’ın macOS sürümü yok. Seçeneklerin:</p>
<ul>
<li><b>Sanal makine:</b> Mac’te bir sanallaştırma uygulamasıyla Windows çalıştırmak. Apple işlemcili Mac’lerde bu ARM için Windows demektir; yukarıdaki güncelleme şartını unutma.</li>
<li><b>Bulut bilgisayar:</b> Şirketin Windows 365 ya da Azure Virtual Desktop sağlıyorsa Desktop’ı oradaki Windows’ta kullanabilirsin.</li>
<li><b>Tarayıcıda Power BI hizmeti:</b> Rapor oluşturma ve düzenleme hizmette de yapılabilir; ama Power Query ve modelleme özelliklerinin bir kısmı Desktop kadar geniş değildir. Hesap gerektirir.</li>
<li><b>Bu uygulama:</b> DAX, model ve rapor tasarımı alıştırmalarını Mac’te tarayıcıdan yapmaya devam edebilirsin.</li>
</ul>

<h2>Hizmet için hangi hesap gerekir?</h2>
<p>Power BI hizmetine (app.powerbi.com) kaydolmak için <b>iş ya da okul e-posta hesabı</b> gerekir. Gmail, Hotmail gibi kişisel adreslerle doğrudan kaydolunmaz. İş hesabın yoksa Microsoft Learn’ün önerdiği yol, önce bir Microsoft 365 denemesi başlatmaktır; bu deneme sana bir iş hesabı oluşturur. Rapor paylaşmak için Pro, PPU ya da Fabric kapasitesi gerekir; ayrıntılar “Power BI ailesi” ve “Yayınlama” derslerinde.</p>
<div class="tip"><b>İşe başladığında ilk gün</b>Şirket bilgisayarında Desktop kurulu değilse BT ekibinden Store sürümünü ya da şirketin onayladığı sürümü iste. Yönetici izni olmadan .exe kurmaya çalışma; Store sürümü bu yüzden çoğu şirkette en hızlı yoldur.</div>
`,
  ex: [
    { t: 'mc', q: 'Kişisel Windows 11 dizüstü bilgisayarına Desktop kuracaksın ve güncellemelerle uğraşmak istemiyorsun. Hangi yol uygun?', o: ['Microsoft Store sürümü', '32 bit .exe sürümü', 'Power BI Desktop for Report Server', 'Store ve .exe sürümünü birlikte kurmak'], a: 0, why: 'Store sürümü yeni sürümleri arka planda kendisi indirir ve yönetici izni gerektirmez. 32 bit sürüm artık desteklenmiyor; iki sürümü yan yana kurmak da desteklenmiyor.' },
    { t: 'mc', q: 'Bir ekip arkadaşın Desktop’ın bu ayki sürümüyle kaydettiği .pbix dosyasını sana gönderdi. Sende üç ay önceki sürüm var. Ne olur?', o: ['Dosya sorunsuz açılır, sürüm farkı önemli değildir', 'Açılmaz; Desktop’ı güncellemelisin', 'Dosya açılır ama yeni ölçüler sessizce silinir', 'Dosya yalnızca salt okunur modda açılır'], a: 1, why: 'Yeni sürümle kaydedilmiş dosyaları eski sürümler açamaz. Ekipte herkesin güncel sürümü kullanması gerekir.' },
    { t: 'mc', q: 'Apple işlemcili bir MacBook kullanıyorsun. Power BI Desktop ile çalışmak için hangisi gerçek bir seçenektir?', o: ['App Store’dan Power BI Desktop for Mac indirmek', 'Mac’te sanal makinede ARM için Windows çalıştırıp Desktop’ı kurmak', 'Excel for Mac’in Power Pivot sekmesini kullanmak', 'Hiçbir seçenek yok'], a: 1, why: 'Desktop’ın macOS sürümü yok. Sanal makinede ARM için Windows, şirketin bulut bilgisayarı ya da tarayıcıdaki Power BI hizmeti seçeneklerdir.' },
    { t: 'mc', q: 'Kişisel Gmail adresinle app.powerbi.com’a kaydolmaya çalışıyorsun ve kabul edilmiyor. Neden?', o: ['Power BI hizmeti Türkiye’den yapılan kayıtları kabul etmiyor', 'Hizmet iş ya da okul hesabı ister', 'Hizmete kaydolmadan önce Desktop lisansı satın almak gerekir', 'Gmail adresleri yalnızca Power BI Mobile uygulamasında çalışır'], a: 1, why: 'Hizmete kayıt için iş ya da okul e-postası gerekir. İş hesabın yoksa Microsoft 365 denemesi bir iş hesabı oluşturur. Desktop’ın kendisi ücretsizdir ve yerel çalışma için hesap istemez.' },
    { t: 'mc', q: 'Şirketin raporları kendi sunucusundaki Power BI Report Server’da tutuyor. Hangi Desktop’ı kurmalısın?', o: ['Microsoft Store’daki normal Desktop', 'Power BI Desktop for Report Server', 'Herhangi bir sürüm olur', 'Power BI Mobile'], a: 1, why: 'Report Server’a yayımlanan raporlar, sunucunun sürümüyle eşleşen “Power BI Desktop for Report Server” ile hazırlanır.' }
  ]
});
})(window);
