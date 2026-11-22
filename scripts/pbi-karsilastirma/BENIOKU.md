# Gerçek Power BI ile karşılaştırma

Tarayıcıdaki DAX motorunun sonuçlarını açık bir Power BI Desktop modeliyle karşılaştırır.

1. Paketi derle (`sh app/build/ghpack.sh`), sonra: `node scripts/pbi-karsilastirma/gen.cjs <paket klasörü> <çıktı klasörü>`
   → `model.tmdl` (modelin TMDL betiği) ve `beklenen.json` (motorun sonuçları).
2. Windows'ta boş Power BI Desktop aç, TMDL görünümüne `model.tmdl`'yi yapıştır, Uygula, Yenile.
3. Klasöre `kontrol.py` ve `calistir.bat` koy; `calistir.bat` pythonnet kurulu Python ile `kontrol.py`'yi çalıştırır
   (yoldaki ortamı kendi bilgisayarına göre düzelt). Sonuç `sonuc.txt` ve `sonuc.json`.
4. Özetteki “Gerçek fark” satırı 0 olmalı. Biçim dili (İngilizce Desktop), 4 ondalık para yuvarlaması ve
   ortam (TODAY, USERPRINCIPALNAME) farkları ayrıca sayılır.

Kapsam: ders alıştırmaları (X, Q), ders örnekleri ve püf noktaları (S, SQ), hazır ölçüler (B), Pratik (P),
mülakat (M), Arena (A, D), kalıplar (K), karıştırılanlar (C), hata kataloğu (H). Bulunan kurallar NASIL.md'de.
`yoklama.py` belirli bir davranışı (ör. boş satır) kısa sorgularla yoklamak için örnektir.

## Vaka paketleri
`node scripts/pbi-karsilastirma/gen-vd.cjs <ilgaz|kanat|lezzet|pusula|pedal> <csv kökü> <çıktı> "<PC'deki klasör>"`
CSV kökünde `csv/<src>/<tablo>.csv` olmalı (paketin zip'indeki `veri/` klasörü). Çıktı: `csv/` (türetilmiş sütunlar ve
Takvim dahil), `model.tmdl` (CSV'leri PC'deki klasörden okur) ve `beklenen.json`. PC'de klasörü `vaka\<ad>\` altına koy,
temiz bir Power BI penceresinde TMDL'yi uygula, Yenile, sonra `python kontrol.py vaka\<ad>\beklenen.json`.

## Power Query (M)
`node scripts/pbi-karsilastirma/gen-pq.cjs <çıktı> "<PC'deki klasör>"` → `model.tmdl`, `beklenen.json` ve `Veri/Satis/` (Folder.Files benzetiminin dosyaları).
Kaynak sorgular TMDL'de `expression` (#table değişmezi) olur, her M ifadesi `PQxxx` tablosuna (Satir, Sutun, Deger) uzun biçimde yüklenir.
`ONLY=PQ001,PQ008 node …` yalnız seçilen maddeleri üretir; 200 tablo birden Desktop'ın belleğini aşabildiği için 50–100'lük gruplarla çalış.
PC'de klasörü `<PC'deki klasör>` olarak koy, temiz Power BI'da TMDL'yi uygula, Yenile, sonra `python kontrol_pq.py pq\beklenen.json`.
Join içeren sorgular sırasız, Folder.Files tarihleri ortam farkı olarak karşılaştırılır.

## Motorda çalışmayan ders blokları (data-notry)
`notry.json`, derslerde `data-notry` ile işaretli bloklardan Power BI'da sorgu olarak çalıştırılabilenleri içerir (ölçüler DEFINE MEASURE, hesaplanmış sütun/tablolar ADDCOLUMNS ya da DEFINE TABLE ile). Model, TMDL ya da M blokları, şablon metinler ve sözdizimi kalıpları dışarıda kalır.
PC'de: `python notry.py notry.json` → `notry_sonuc.txt` (çalıştı / eksik nesne / hata). Beklenen sonuç değeri yoktur; dersteki iddia ile elle karşılaştırılır.
Kasım 2026 sonucu: 31 bloktan 18'i çalıştı. 4 blok modelde olmayan tabloya başvurur (ders başka bir model anlatıyor). 3 blok bilerek hatalı yazılmış örnektir; Power BI da hata verir, yani ders doğru söylüyor. Diğer blokların ders anlatımı Power BI'ın sonucuyla tutar. Yalnız CALENDARAUTO'nun gün sayısı yanlıştı: `Projeler[BitisPlan]` 2025'e uzandığı için 3.653 değil 4.018 gün. Ders metni düzeltildi.
