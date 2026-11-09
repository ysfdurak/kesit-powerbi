# Depo Sevkiyat Kontrolü · BT İş Analisti vakası

## Brif

Bursa ve Gebze depo ekipleri vardiya devrinde geciken sevkiyatları farklı listelerden izliyor. Operasyon müdürü hangi deponun müdahaleye ihtiyaç duyduğunu, vardiya sorumlusu ise hangi açık sevkiyatın öne alınacağını aynı rapordan görmek istiyor.

**Görev:** Geliştiriciye verilecek rapor brifini, beş KPI kartını, alan eşlemesini ve kullanıcı kabul testi (UAT) kaydını hazırla. Brif, karar sahibini, kullanım anını, planlanan çıkış tarihine göre depo/kanal filtrelerini ve açık geciken sevkiyat listesini içersin. Liste, sevkiyat kimliği, planlanan çıkış ve istisna nedenini göstermeli. Paylaşım ve yenileme bölümünde çalışma alanını, yenileme zamanını, kaynak sorumlusunu ve erişim kuralını öneri olarak yaz.

**Başlangıç verisi:** [sevkiyat.csv](sevkiyat.csv) · 18 sentetik kayıt · Her satır bir sevkiyat · Sabit gözlem anı 17 Ekim 2026, 12.00, Türkiye saati (UTC+3). Her iki zaman alanı aynı saat diliminde. Tüm KPI’lara depo, kanal ve planlanan çıkış tarihi filtreleri birlikte uygulanır.

| Alan | Anlamı |
|---|---|
| `sevkiyat_id` | Sevkiyatın tekil anahtarı |
| `depo`, `kanal` | Operasyon kırılımları. `Magaza`, mağaza kanalının kaynak kodudur. |
| `planlanan_cikis` | Depodan çıkış için taahhüt edilen zaman. Rapor tarih filtresi buradan gelir. |
| `gerceklesen_cikis` | Fiilî depo çıkış zamanı. Açık ve iptal satırlarında boştur. |
| `durum` | `CIKTI`, `ACIK` veya `IPTAL` |
| `istisna_kodu` | Varsa operasyon istisnası. Zamanında çıkmış bir kayıtta da bulunabilir. |

## KPI tanım kartları

| KPI | Kural ve kaynak alanı |
|---|---|
| Planlanan sevkiyat | Filtre kapsamındaki `IPTAL` dışındaki tekil `sevkiyat_id` sayısı. Gelecek planlar kapsama girer. |
| Çıkışı yapılan | Planlanan sevkiyatlardan `CIKTI` olup fiilî çıkışı gözlem anında veya öncesinde gerçekleşenler. |
| Zamanında çıkış oranı | Fiilî çıkışı planlanan çıkış anında veya öncesinde olanların sayısı / çıkışı yapılan sevkiyat sayısı. Payda sıfırsa oran boş ve “Çıkışı yapılan sevkiyat yok” mesajı görünür. |
| Açık geciken | `ACIK` ve planlanan çıkışı gözlem anından önce olan sevkiyat sayısı. Tam gözlem anında planlanan satır henüz gecikmemiştir. |
| İstisnalı sevkiyat | `IPTAL` dışındaki, istisna kodu dolu tekil sevkiyat sayısı. Gecikme ile aynı ölçü değildir. |

Her kartta tanım, formül, kaynak alanı, dahil/hariç kayıtlar ve iş sahibi yer alsın. Hedef SLA yüzdesini iş sahibiyle netleştirilecek karar olarak yaz.

## Kullanıcı kabul testi (UAT)

İlk denemede kaynak CSV’den değerleri hesapla. Ardından aşağıdaki beklenenlerle karşılaştır. Çalışan bir rapor teslim edildiğinde aynı senaryolar için gerçek değerleri ve kararını kaydet.

| ID | Girdi ve filtre | Planlanan | Çıkışı yapılan | Zamanında | Açık geciken | İstisnalı |
|---|---|---:|---:|---:|---:|---:|
| U01 | Tüm veri | 16 | 9 | %66,67 (6/9) | 4 | 7 |
| U02 | Bursa · planlanan tarih 16 Ekim | 3 | 2 | %50,00 (1/2) | 1 | 2 |
| U03 | Kaynakta yalnız SV02, SV03, SV05 | 2 | 2 | %50,00 (1/2) | 0 | 1 |
| U04 | Gebze · planlanan tarih 17 Ekim | 3 | 0 | Boş | 1 | 1 |
| U05 | Gebze · 17 Ekim · E-ticaret | 1 | 0 | Boş | 0 | 0 |
| U06 | Planlanan tarih 18 Ekim | 0 | 0 | Boş | 0 | 0 |

- **U03:** SV02 tam plan saatinde çıktığı için zamanında. SV03 bir saniye sonra çıktığı için geç. SV05 iptal edildiği için tüm KPI’ların dışında.
- **U04:** SV15 bir saniye gecikmiş, SV16’nın saati gözlem anına eşit, SV17’nin saati ileride. Açık geciken listesinde yalnız SV15 görünmeli.
- **U07, kaynak kalite kontrolü:** SV02 satırını bir kez kopyala. Tekil anahtar kontrolü yinelenen SV02’yi işaretlemeli ve mutabakat geçerli sayılmamalı. Orijinal dosyayı geri yükle.
- **U08, erişim kabulü:** Bursa rolüyle Gebze satırları görünmemeli. Yetkili geliştirme ortamında rol testi yapıldığında sonucu ve kullanıcı rolünü kaydet. Ortam yoksa “bekliyor” olarak işaretle.

Adetler tam eşleşmeli. Yüzde görünümünde 0,01 yüzde puan tolerans kullan. U03 satır düzeyinde kontrol örneğidir. Rapora sevkiyat kimliği dilimleyicisi ekleme zorunluluğu getirme.

## Teslim ve karar

1. Bir sayfalık rapor brifi ile alan/filtre eşlemesi.
2. Beş KPI kartı ve bir erişim/yenileme gereksinimi.
3. Senaryo, filtre, beklenen, gerçekleşen, kanıt, durum ve hata notu sütunlarını içeren UAT matrisi.
4. Kabul, koşullu kabul veya ret kararı. Açık bulguya bir sahip ve sonraki adım yaz.

Kaynak hesabını yaptıysan “kaynak mutabakatı yapıldı” olarak kaydet. Rapor açılıp filtre ve yetki davranışı gözlendiğinde o testin sonucunu ayrı yaz.

**Farklı veriyle bağımsız tekrar:** Kanat Havayolları vakasında en az 15 dakika kalkış gecikmesi için KPI kartını ve iki UAT senaryosunu hazırla. Uçuş tanesi, iptal kapsamı ve kalkış saatleri için yeni kuralları belgeleyip iki vaka arasındaki farkı karar notuna yaz.
