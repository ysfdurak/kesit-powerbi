# PBIPatika içerik dosyaları — ortak kurallar

PBIPatika, Türkçe bir Power BI / DAX öğrenme uygulaması (tarayıcıda çalışır, kendi DAX motoru var). Uygulama: /home/claude/pbi (index.html + JS dosyaları). Sen yalnızca SANA VERİLEN DOSYAYI yazarsın; başka dosyaya dokunma.

## Dil ve üslup
- Türkçe, sade, kısa cümleler; teknik terimlerin Power BI Türkçe arayüzündeki karşılıkları.
- Sınav (PL-300/DP-600) sorularında arayüz terimi ilk geçtiğinde İngilizce karşılığı parantez içinde: “Dilimleyicileri eşitle (Sync slicers)”, “Detaylandırma (drillthrough)”, “Anlam modeli (semantic model)”.
- Uydurma özellik, uydurma menü yolu, uydurma sayı YOK. Emin olmadığın güncel ürün ayrıntısını (limit, lisans, menü adı) yazma; ya kavramsal sor ya da Microsoft Learn'de doğrula (WebSearch/WebFetch kullanabilirsin; learn.microsoft.com sayfalarını WebSearch sonuç linkinden fetch et).
- Kod satır içinde ters tırnakla: `CALCULATE`. Uygulama bunu <code>'a çevirir. HTML yazma (yalnızca `body`/`html` alanları HTML'dir, belirtildiği yerde).
- Her doğru cevabın `why` açıklaması 1–3 cümle: NEDEN doğru, gerekiyorsa en çekici yanlışın neden yanlış olduğu.

## Çoktan seçmeli şık dengesi (ÇOK ÖNEMLİ)
Önceki sürümde doğru şık hep en uzun şıktı; öğrenciler soruyu okumadan tahmin edebiliyordu. Kurallar:
- Doğru şık, sorularının en fazla %30'unda en uzun şık olabilir; en az %20'sinde en KISA şık olmalı.
- Yanlış şıklar inandırıcı olmalı (gerçek bir yanılgıyı temsil etmeli), “Hiçbiri”, “Hepsi” kullanma.
- Doğru şıkkın yerini (a indeksi) dengeli dağıt (0,1,2,3 yaklaşık eşit).
- Doğrulayıcı (aşağıda) bunu ölçer; eşiği geçmeden bitirme.

## Veri modeli
Alıştırmalardaki DAX, uygulamanın örnek modelinde çalışmalıdır. Tablolar, ilişkiler, hazır ölçüler ve ders listesi: /tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/model.txt
Motorla deneme örneği: /home/claude/recover/deepcalc.js (node ile çalıştır; X.evalMeasure(ms, expr, filtreler) ve X.query(...) kullanımı orada).
Motorun desteklemediği bir fonksiyon hata verirse o örneği değiştir.

## Doğrulayıcı
`node /home/claude/recover/agentval.js <senin_dosyan.js>` — şema, DAX çalıştırma ve şık dengesi kontrolü. Sonunda "SORUN 0" görmelisin.
