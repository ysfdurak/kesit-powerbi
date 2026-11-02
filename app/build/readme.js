/* README.md üretir (sayılar uygulamanın içeriğinden) */
global.window = global; const P = '/home/claude/pbi/', fs = require('fs');
const files = fs.readFileSync(P + 'index.html', 'utf8').match(/src="[^"]+"/g).map(s => s.slice(5, -1));
const skip = /^(app|pq|practice|examui|arena|guides|roles|career|sync|portfolio|vdata|pages)\.js$/;
for (const f of files) { if (skip.test(f)) continue; try { require(P + f); } catch (e) {} }
try { require(P + 'roles.js'); } catch (e) {}
const L = window.PBI_LESSONS || [], ex = L.reduce((a, l) => a + (l.ex || []).length, 0);
const nPaths = (window.PBI_PATHS || []).length, nDash = (window.PBI_DASHES || []).length, nPr = (window.PBI_PRACTICE || []).length;
const nIv = (window.PBI_IV_BANK || []).length, nTr = (window.PBI_TRICKS || []).length, nCf = (window.PBI_CONFUSED || []).length, nCq = (window.PBI_CERTQ || []).length;
const DS = window.PBI_DATASETS || [];
const nPages = (window.PBI_DASHES || []).reduce((a, d) => a + (d.pages ? d.pages.length : 1), 0);
const t = `# Kesit Power BI

**Sıfırdan işe hazır seviyeye Türkçe Power BI, DAX ve Fabric eğitimi. Kurulum yok, hesap yok.** Tarayıcında çalışan bir DAX motoruyla ölçü yazarsın; her alıştırma anında denetlenir.

**Dene:** https://ysfdurak.github.io/kesit-powerbi/

![Alıştırma ekranı](ekran/alistirma.png)

## Neler var?
- **${L.length} ders, ${ex.toLocaleString('tr-TR')} ders içi alıştırma, ${nPr} pratik görevi.** İlk ölçüden genişletilmiş tablolara, hesaplama gruplarına, Direct Lake'e ve mülakat kalıplarına kadar; Temel, Orta ve İleri seviyeler.
- **${nPaths} rol patikası:** veri analisti, BI geliştirici, PL-300, DP-600 / Fabric, DAX ustalığı, Excel'den Power BI'a ve diğerleri. Her patikanın bitirme projesi ve işe hazırlık listesi var.
- **${nDash} örnek rapor, ${nPages} sayfa:** yer imleri, araç ipucu sayfaları, detaya git, alan parametreleri ve mobil düzenle, adım adım anlatılmış.
- **${DS.length + 1} hayali veri seti:** Anadolu Market (derslerin modeli) ve Desktop'ta çalışmak için ${DS.length} vaka paketi: ${DS.map(d => d.name).join(', ')}. Her pakette CSV'ler, model planı, ölçü kütüphanesi ve beklenen sonuçlu görevler var.
- **Sınav ve mülakat:** ${nCq} özgün PL-300 / DP-600 deneme sorusu, ${nIv} mülakat sorusu (zayıf ve güçlü cevap örnekleriyle), canlı DAX kodlama turu, ev ödevleri.
- **${nTr} püf noktası, ${nCf} sık karıştırılan kavram**, sık yapılan hatalar, DAX Arena, DAX Stüdyosu ve Power Query atölyesi.

| Karşılama | Örnek rapor | Vaka veri seti |
|---|---|---|
| ![](ekran/karsilama.png) | ![](ekran/rapor.png) | ![](ekran/veri-seti.png) |

## Nasıl çalışıyor?
- Sunucu yok: DAX'ın filtre bağlamı, bağlam geçişi, zaman zekâsı ve tablo fonksiyonları tarayıcıda çalışan bir motorla hesaplanıyor. Power Query adımları da tarayıcıda benzetiliyor.
- İlerleme yalnızca kullanıcının tarayıcısında saklanıyor; Profil sayfasından dosyaya kaydedilip başka cihazda yüklenebiliyor. Kişisel veri toplanmıyor; ziyaretler yalnızca çerezsiz ve anonim olarak sayılıyor (GoatCounter, açıksa).
- Alıştırmalar ve vaka paketlerinin beklenen sonuçları otomatik bir denetim setiyle doğrulanıyor; vaka paketlerinde her sonuç ayrıca SQL ile bağımsız olarak hesaplanıyor.

## Kardeş proje
Aynı mantıkla hazırlanmış SQL eğitimi: **[Kesit SQL](https://ysfdurak.github.io/kesit-sql/)** ([kaynak](https://github.com/ysfdurak/kesit-sql)). Vaka veri setlerinin SQL karşılıkları orada.

## Geri bildirim
Her dersin başlığının altında geri bildirim bağlantısı, konu anlatımının altında yorum alanı var. Genel fikirler için bu deponun **Discussions** sekmesini kullanabilirsin.

## Sorumluluk notu
Ücretsiz, ticari olmayan bir eğitim ve portföy projesidir; içerik “olduğu gibi” sunulur. Veri setlerindeki tüm şirketler, kişiler ve kayıtlar hayalidir. Microsoft ile bağlantılı değildir; Microsoft, Power BI, Fabric ve sınav adları Microsoft Corporation'ın markalarıdır. Sınav denemeleri özgün olarak yazılmıştır, gerçek sınav soruları değildir. Uygulamanın verdiği belgeler kendi beyana dayalıdır.

## Lisans
- Uygulama kodu: [MIT](LICENSE)
- Ders içerikleri, veri setleri ve vaka paketleri: [CC BY-NC 4.0](LICENSE-ICERIK.md)
`;
process.stdout.write(t);
