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
