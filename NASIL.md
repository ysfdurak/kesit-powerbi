# Kesit Power BI · kaynak dalı: derleme ve test

> **8 Kasım 2026 güncellemesi:** Ana derleme ve Node doğrulayıcıları artık depo konumuna göre yol çözümler; aşağıdaki eski oturuma ait sembolik bağlantı kurulumu bu işler için gerekli değildir. Eski tek seferlik yardımcılar hâlâ eski yollar içerebilir.
>
> Linux/macOS: `cd app && sh build/ghpack.sh`. Paket yeni bir geçici klasöre yazılır, önceki paket silinmez.
> Windows: WSL veya Git Bash içinde aynı komut. Node ve Python 3 gerekir. Yerel Windows uygulaması/Power BI Desktop kontrolü bu komutun kapsamında değildir.
> CSV kaynağı varsayılanı `scratchpad/ds`; başka kaynak için `KESIT_DATA_ROOT` ortam değişkenini kullan.
> Node test örneği: depo kökünden `node tests/hiddenval.js` ve `node tests/newdata.cjs`. Node 20+ gerekir.

Bu dal (`kaynak`) uygulamanın kaynak dosyalarını, derleme betiklerini ve test araçlarını içerir.
Kod kimlikleri, adresler ve `pbipatika.v1` depolama anahtarı eski adla kaldı; görünür metin “öğrenme yolu” der.
Yayındaki site `main` dalındadır ve bu daldan **üretilir**; `main`'i elle düzenleme.

## Klasörler

| Klasör | Ne var | Çalışırken beklenen mutlak yol |
|---|---|---|
| `app/` | Uygulamanın kaynağı: içerik dosyaları (`c*.js`, `x_*.js`, `vd_*.js`…), motor (`dax.js`, `pq.js`), öğrenme yolları ve sıra (`yollar.js`), alıştırma denetimi (`denetim.js`), veri notları (`bilinen-sinirlar.js`), arayüz (`app.js`, `pages.js`, `portfolio.js`…), stiller (`app.css`), `build/` (derleme betikleri, GitHub sayfası şablonları), `veri/` (vaka paketlerinin zip'leri ve claude.ai yayını için base64 kopyaları), `index.html` (derleme çıktısı) | `/home/claude/pbi` |
| `tests/` | Doğrulayıcılar (node betikleri) | `/home/claude/recover` |
| `scratchpad/` | Yazım kuralları (`*_SPEC.md`), müfredat ve model dökümleri, tarayıcı testleri (Playwright), vaka veri setlerinin CSV'leri (`ds/csv`) ve üreteçleri (`sqlsrc/`, `ds/seed.js`, `ds/mk.py`), sosyal görsel şablonu (`og/`), tek seferlik yardımcı betikler | `/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad` |
| `scratchpad-8d15/` | Eski oturumun betikleri; tam ders taraması `crawl.js` burada | `/tmp/claude-0/-home-claude/8d15e87e-21b9-51fd-9b9d-27135d77cfc3/scratchpad` |

Betikler bu mutlak yolları sabit kodlar. Yeni bir oturumda önce:

```sh
git clone -b kaynak https://github.com/ysfdurak/kesit-powerbi /home/claude/kesit-kaynak
sh /home/claude/kesit-kaynak/kur.sh
```

`kur.sh` yukarıdaki dört yolu depodaki klasörlere sembolik bağlantıyla bağlar (yol zaten gerçek bir klasörse dokunmaz, uyarır) ve
vaka veri setlerinin `.sql` tohumlarını ile `.sqlite` kopyalarını yeniden üretir (bunlar depoda yok: büyük ve deterministik olarak yeniden üretilebilir).
Gereken: node, python3, Playwright + Chromium (`require('playwright')`; betikler Chromium'u
`/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` yolunda arar, farklıysa betiklerdeki `executablePath`'i değiştir).

## Derleme

```sh
cd /home/claude/pbi
sh build/build.sh            # index.html: build/head.html + stiller + build/body.html + script etiketleri (sıra build.sh içinde)
node build/vdpack.js         # veri/<paket>.zip: vd_*.js + scratchpad/ds/csv → CSV + BENIOKU.md + olcular.dax + gorevler.md + cozumler.md
for z in veri/*.zip; do base64 -w0 $z > ${z%.zip}.b64.txt; done   # claude.ai yayını zip sunmadığı için base64 kopyası (vdata.js önce .zip, olmazsa .b64.txt dener)
node build/calisma.js        # veri/anadolu-market-calisma.zip: derslerin modeli PBIP olarak (veri M içine gömülü) + CSV + Olculer.dax + DOGRULAMA.md
sh build/ghpack.sh           # GitHub Pages paketi → scratchpad/gh/kesit-powerbi/ ve kesit-powerbi.zip
```

- **Yeni bir JS dosyası** eklenirse `build/build.sh` içindeki `for f in …` listesine doğru sıraya yaz. Sıra önemli: veri → motor → içerik → `roles.js` → `yollar.js` → `denetim.js` → `app.js` → modüller → `pages.js`. Ders sırası ve yol içerikleri yalnız `yollar.js`'te değiştirilir.
- **`ghpack.sh`**: bütün betikleri tek `kesit.js` dosyasında birleştirir, `build/gh/config.js` (dolu yapılandırma), `build/gh/static/` (simgeler, manifest, `sw.js`, `og.png`, yerel yazı tipleri) ve lisans/rehber dosyalarını ekler, `build/ghhead.py` ile Google Fonts yerine yerel yazı tiplerini ve paylaşım etiketlerini koyar, `build/readme.js` ile README'yi sayılardan üretir.
- **Sosyal görsel** (`og.png`) ve simgeler: `scratchpad/og/og.html` + `scratchpad/icons.js` (8799 portunda `scratchpad/og` sunulurken çalıştır).

### Vaka veri setleri

Beş vaka setinin kaynağı Kesit SQL üreteçleridir (Kesit SQL `NASIL.md` → Ortak veri setleri). `scratchpad/sqlsrc/` onların kopyasıdır. Değişiklikten sonra: dosyaları kopyala, `scratchpad/ds` içinde `node seed.js <sqlsrc yolu> && python3 mk.py` (`kur.sh` SQLite kopyalarını da üretir), `vdval.js` ile beklenen değerleri denetle, `node build/vdpack.js` ve `.b64.txt` kopyaları, `sh build/build.sh`, `sh build/ghpack.sh`. Bilerek bırakılanlar ve bilinen sınırlamalar `app/bilinen-sinirlar.js`; metin üç uygulamada aynıdır. Yeni tablo eklendiyse `vd_*.js` içindeki `tables` listesine de ekle (`hv_repositioning`, `bk_rebalancing`); pakete yalnız o liste girer. Uçak ve bisiklet ataması `hv.js`, `bk.js` içine gömülüdür, burada yeniden hesaplanmaz.

### Yayın

- **GitHub Pages (`main` dalı):** `sh build/ghpack.sh`, sonra `scratchpad/gh/kesit-powerbi/` içeriğini `main` dalına kopyala ve gönder. Site: https://ysfdurak.github.io/kesit-powerbi/ (Pages ayarı: Settings → Pages → `main` / root).
- **claude.ai artifact (önizleme):** https://claude.ai/artifact/5rutyn2r3dSusYh7p1N1dL — `root: /home/claude/pbi`, `file_path: index.html`, `files`: index.html'deki her script (aynı ad) + `veri/*.b64.txt`. Yetenekler: `downloads`, `db` (kural: `feedback` read/write `interact`), `user`. Eşleme listesini üretmek için:
  ```sh
  cd /home/claude/pbi && python3 -c "import re,json;s=open('index.html').read();m={f:f for f in re.findall(r'src=\"([^\"]+)\"',s)};import glob;[m.update({f:f}) for f in glob.glob('veri/*.b64.txt')];print(json.dumps(m))"
  ```
  claude.ai sürümü `app/config.js` (boş) ile çalışır; GitHub sürümü `app/build/gh/config.js` (dolu) kullanır.

### Süre tahmini

`app.js` içindeki `sureDk`, `dkAralik`, `saatAralik`: okuma (600 karakter/dk, en az 3 dk) + DAX ya da sorgu görevi başına 2-3 dk + çoktan seçmeli başına 0,5-1 dk. Üç uygulamada aynı formül; ölçülmüş değildir.

## Testler

Önce yerel sunucu (tarayıcı testleri için):

```sh
cd /home/claude/pbi && python3 -m http.server 8765
```

### Node doğrulayıcıları (`/home/claude/recover`; son satır `SORUN 0` / `bad 0` / `fark 0` olmalı)

```sh
cd /home/claude/recover
node cross.js                 # 87 denetim: ölçülerin motor sonucu ↔ bağımsız hesap
node exval.js                 # tüm ders DAX/sorgu alıştırmaları çözülebiliyor mu
node snip.js                  # derslerdeki ve püf noktalarındaki çalıştırılabilir DAX blokları
node bankval.js               # Pratik: DAX, sorgu, Power Query ve Senaryo (mc) görevleri
node codeval.js /home/claude/pbi/interview2.js     # kod havuzu + canlı mülakat görevleri
node arenaval.js              # DAX Arena
node agentval.js /home/claude/pbi/confused.js /home/claude/pbi/confused2.js /home/claude/pbi/interview.js /home/claude/pbi/interview2.js
node dashval.js               # 24 rapor, tüm sayfalar, yer imleri, parametreler, mobil
node lessonval.js /home/claude/pbi/c21.js /home/claude/pbi/c22.js /home/claude/pbi/c23.js /home/claude/pbi/c24.js /home/claude/pbi/c25.js /home/claude/pbi/c26.js   # yeni ders dosyası (şablon B)
node argval.js                # DAX motoru: bağımsız değişken sayısı, tür hataları, ham JS hatası yok
node gvval.js                 # görsel kurma ve model kurma alıştırmaları: çözüm doğru sayılıyor mu, bozulmuş çözüm (tür, kategori, ilişki yönü, kardinalite) yakalanıyor mu, görsel hesaplama birim vakaları
node hiddenval.js             # gizli dilimleyici testleri, teknik şartı, sorgu karşılaştırması, ipucu temizliği, ALL↔ALLSELECTED mutasyonları
node yolval.js                # öğrenme yolları: sıra, aşama, belge şartı, PL-300 dersleri, DP-600 payı, kapsam haritası
node termval.js               # ürün dili: eski adlar (patika, Stüdyo, yer imi…) görünür metinde kalmadı
node extval.js /home/claude/pbi/x_*.js             # ders genişletme dosyaları (şablon A)
for f in ilgaz kanat lezzet pusula pedal; do node vdval.js /home/claude/pbi/vd_$f.js | tail -1; done   # vaka paketleri: DAX = beklenen = SQLite
node mval.js                  # M alt küme yorumlayıcısı: resmî Learn örnekleri, desteklenmeyen işlevde hata, Lab komutu ile M çapraz denetimi, ders kod blokları, mcode çözümleri
node longest.js               # şık uzunluğu ipucu vermesin: doğru şık en uzun ve en kısa %15-35, yanlış şık yapay uzun değil (c25, c26, Pratik Senaryo, Sınav ek); son satır SORUN 0. Yeni içerik dosyasını GROUPS listesine ekle
node dups.js                  # yinelenen adlar (bilgi)
```

Yeni ders/içerik dosyası eklenirse doğrulayıcıların yükleme listelerine de ekle (`grep -l "'c23'" /home/claude/recover/*.js`).

### Tarayıcı testleri (`scratchpad/`, sunucu 8765 açıkken)

```sh
S=/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad
node $S/crawl2.js 1360 > $S/cr1360.txt 2> $S/cr1360.err   # bütün dersler: her alıştırma çözülür, NaN/taşma/hata aranır (~20–40 dk)
node $S/crawl2.js 400  > $S/cr400.txt  2> $S/cr400.err    # telefon genişliği
node $S/excert.js        # PL-300 / DP-600 deneme sınavları
node $S/car.js           # kariyer: hedef, patika, bitirme projesi, belge, veri indirme
W=400 node $S/dt.js      # dashboard sayfaları belirli genişlikte
node $S/vdui.js          # vaka veri setleri sayfaları, indirme, işaretleme (1280 ve 390)
node $S/pf.js            # portföy özellikleri: karşılama, Hakkında, geri bildirim, Giscus, yedek/birleştirme
node $S/pilot.js 1280        # seviye testi, pilot özeti (PORT değişkeni ile)
node $S/mlab.js 1280         # Power Query Lab, Görünüm, M editörü, mcode alıştırması (390 için de çalıştır)
node $S/newf.js          # arama, kısayollar, hata ipuçları, dashboard seçici, belgeler, geri tuşu
node $S/slow.js          # 700 ms'yi aşan alıştırma çözümleri (node, sunucu gerekmez)
```

`crawl2.js` çıktısında bilinen 5 “NaN” satırı içerik metnidir (NaN kavramını anlatan dersler), hata değildir.
GitHub paketi testi: `scratchpad/gh/kesit-powerbi` klasörünü 8793 portunda sun, `node $S/ghtest.js` (dış sunucuya istek olmamalı).

## İçerik yazım kuralları

- `scratchpad/EXPAND_SPEC.md`: ders genişletme (şablon A, `x_*.js`) ve yeni ders (şablon B, `c*.js`) kuralları, ileri seviye kalite çıtası.
- `scratchpad/VD_SPEC.md`: vaka veri seti paketi (`vd_*.js`) şeması.
- `scratchpad/LESSON_SPEC.md`, `scratchpad/DASH_SPEC.md`: eski ders ve rapor kuralları.
- Model ve fonksiyon listeleri: `node scratchpad/gen.js scratchpad` → `model.txt`, `daxfn.txt`, `curriculum.txt`; bir dersi okumak: `node scratchpad/show.js <ders-id>`.

## Service ve Fabric içeriği (c25, c26)

- Bu konular tarayıcıda çalışmaz: alıştırmalar karar, teşhis ve sıralama sorar; DAX karşılığı olan yerde (mutabakat, tazelik, günlük tablosu) gerçek DAX ya da sorgu sorulur. Arayüz taklit edilmez. Kuran adımlar “Kendi ortamında dene” kutusundadır, deneme koşulu Learn’den alınır.
- Ürün durumları (önizleme, sınır, lisans) Kasım 2026’da Microsoft Learn’den okundu; dersin içinde “resmî belgeye bak” diye işaretlidir. Soru-Cevap tarihi: Learn güncel uyarısı Şubat 2027, önceki duyuru Aralık 2026.
- Power Query Lab iki kaynak bilir: `append` ve `merge` komutları (`pqdata.js`), ikinci kaynaklar `bayi_sub`, `sehir_bolge`. Yeni ikinci kaynak `SOURCES` içine `qn` ve (merge için) `key` ile eklenir, form listesine yazılır.
- Pratik `t: 'mc'` görevlerini de taşır (`tp: 'servis' | 'fabric'`, “Senaryo” türü). `bank.js` sonundaki blok.

## Bilinen motor sınırları (tarayıcı DAX motoru)

Bu durumlar derslerde `data-notry` ile gösterilir ve alıştırmalarda kullanılmaz:
çoka çok ilişki kurma (model alıştırmasında `*:*` yalnız seçenek olarak vardır; ölçü içinde CROSSFILTER/TREATAS çalışır; çift yönlü model ilişkisi Aralık 2026'dan beri `rels[].both` ile desteklenir ve model kurma alıştırmasının önizlemesinde kullanılır), takvim tabanlı zaman zekâsı (önizleme özelliği), pencere fonksiyonlarının toplam satırı (motor boş döndürür), SUMMARIZECOLUMNS'ta IGNORE, sorguda START AT ve birden çok EVALUATE, GENERATEALL.
Gerçek Power BI Desktop ile karşılaştırma (Kasım 2026; araç `pbitest/gen.cjs` + PC'de `kontrol.py`, `yoklama.py`). Motor şu kurallara göre ayarlandı:
- **Boş satır:** olgu tarafında boş ya da eşleşmeyen anahtar varsa (pasif ilişkide de) boyuta sanal boş satır eklenir. VALUES, ALL ve SUMMARIZECOLUMNS/görsel grupları içerir; tablo başvurusu, FILTER(tablo), DISTINCT, ALLNOBLANKROW, SUMMARIZE(tablo, …) içermez. Görselde ölçüsü boşsa gizlenir. Anadolu Market'te Satislar[TeslimTarihi] yüzünden Tarih'te var (Tarih 1.096 + 1).
- **Boşlar:** DATEDIFF boşla boş döner; tarih çıkarmada boş 30.12.1899 sayılır. MEDIANX/PERCENTILEX boşları en küçük sayar, seçilen sıra boşsa sonuç boş. EDATE/EOMONTH boşla boş.
- **DATESINPERIOD:** bitiş ay sonuysa ay/çeyrek/yıl adımında başlangıç ay başına hizalanır.
- **Kültür:** motor Türkçe biçimler (Türkçe Desktop gibi); İngilizce Desktop'ta FORMAT `January`, `1,234.5`, UPPER("bisiklet") `BISIKLET` verir. FORMAT'ın üçüncü bağımsız değişkeni (`"en-US"`, `"tr-TR"`) desteklenir. `kontrol.py` bu farkları “biçim dili” diye ayrı sayar.
- **Para birimi:** CURRENCY(), CONVERT(…, CURRENCY) ve DATATABLE CURRENCY sütunu 4 ondalığa yuvarlanır; ama hesap sonuçlarının türü izlenmez (Power BI Currency × sayı sonucunu da 4 ondalığa yuvarlar), bu yüzden kredi vakasında 4. ondalıkta fark kalır.
- USERPRINCIPALNAME Desktop'ta gerçek hesabı döndürür; motor öğretim kullanıcısını kullanır.
- **2. tur (ders örnekleri, püf noktaları, hazır ölçüler, Pratik, Arena, mülakat, kalıplar, karıştırılanlar, hata kataloğu: 1.112 ölçü + 237 sorgu):**
  - Pencere fonksiyonları: geçerli satır, ilişki sütunlarının bağlamda görünen değerleriyle eşleşen satırlardır. Birden çoksa OFFSET/WINDOW/INDEX sonuçları birleştirir (toplam satırında OFFSET(-1) son ay hariç her şeyi verir), RANK/ROWNUMBER boş döner. ORDERBY eşitliğini ilişki sütunları (artan) bozar; RANK eşitlere aynı sırayı verir (SKIP/DENSE).
  - Çift yönlü ilişki (CROSSFILTER BOTH): olgu tablosu boyutu yalnız başka yollardan gelen filtrelerle süzer.
  - Kesintisiz olmayan tarih sütununda (Satislar[Tarih]) zaman zekâsı seçimi aralık olarak kaydırır; seçim bölünürse hata verir.
  - DIVIDE, LEN, POWER boş girdide boş; STDEV.S tek değerde NaN; metinler Türkçe harf sırasıyla, büyük/küçük harfe duyarsız karşılaştırılır; toplamlar 15 anlamlı basamağa yuvarlanır (eşit toplamlar eşit kalsın); sıfıra yuvarlanan negatif sayı FORMAT'ta sıfır bölümüyle yazılır.
  - TODAY/NOW ve USERPRINCIPALNAME kullanan ölçüler ortam farkı sayılır.
- **3. tur (beş vaka paketi, Desktop'ta CSV'den kurulan modellerle; 187 ölçü + 6 sorgu):** işaretli tarih tablosunun tarih sütunu bağlam geçişiyle filtrelenince tablonun diğer filtreleri kalkar (AVERAGEX(DATESINPERIOD(...)) ay satırında da aynı sonuç); DATESINPERIOD'da boş başlangıç tarihi sütunun en erken tarihidir. Düzenek: `scripts/pbi-karsilastirma/gen-vd.cjs <ilgaz|kanat|lezzet|pusula|pedal> <csv kökü> <çıktı> <PC yolu>`; TMDL CSV'leri PC'deki klasörden okur. Her paket için temiz bir Power BI penceresi kullan (ölçü adları paketler arasında çakışır).
- **4. tur (Power Query/M, 207 sorgu: mcode ve Lab pq çözümleri, Lab komut senaryoları, derslerdeki çalıştırılabilir M blokları):** Table.Pivot satırları anahtara göre sıralar; Table.Profile satırları sütun adına göre sıralar, tarih sütununun ortalamasını verir ve sonucu `Table.Buffer` olmadan `Table.SelectRows` ile süzülemez (Power BI “The field 'NullCount' of the record wasn't found.” der; motor da hata verir); Table.SplitColumn sütun adı verilmezse sütun sayısını ilk satırdan alır; Folder.Files sütunları Content, Name, Extension, Date accessed, Date modified, Date created, Attributes, Folder Path, satırlar ada göre sıralı. Kültür yazılmazsa Türkçe Desktop "1250.5"i 12505 okur, bu yüzden dersler `Number.FromText(…, "en-US")` / `Csv` kültürü yazar. Düzenek: `scripts/pbi-karsilastirma/gen-pq.cjs <çıktı> "<PC'deki klasör>"` (ONLY=PQ001,PQ008 alt küme üretir); her madde Satir/Sutun/Deger biçiminde ayrı tabloya yüklenir, metinler onaltılık yazılır (VertiPaq sondaki boşluğu kırpar, büyük/küçük harfi birleştirir), hata mesajı Satir=-1'e yazılır. 206 tablo tek seferde Desktop'ın belleğini aşabiliyor; ~50–100'lük gruplarla çalıştır. PC'de `python kontrol_pq.py pq\beklenen.json`.
- **5. tur (öğrenci hataları ve farklı yazımlar):** `MUT=1 node gen.cjs …` her çözümden yaygın yanlış/alternatif varyantlar üretir (`mutasyon.cjs`: ALL↔ALLSELECTED, DIVIDE↔/, VALUES↔DISTINCT, ölçüyü SUM'a sarmak, tablo adını unutmak, harf farkı, metin sayı/tarih, KEEPFILTERS/RELATED/CALCULATE düşürmek…; M için `mutasyon-m.cjs` ile `MUT=1 node gen-pq.cjs`). Motor hata verdiyse Power BI de hata vermeli (“ikisi de hata” aynı sayılır). Bulunan kurallar: metin eşleşmesi büyük/küçük harfe duyarsız ama Türkçe değil (`"iptal"` ≠ `"İptal"`, `TREATAS({"kitap"})` Kitap'ı bulur; tablo oluşturucuda aynı metinler ilk yazımı alır); tablo adı yazılmamış sütun yalnız toplama işlevlerinde (SUM, DISTINCTCOUNT, COUNTBLANK, PERCENTILE.INC…) ana tablonun (Satislar) sütunu sayılır, SUMMARIZE(Satislar, [Kanal]) de geçerli, VALUES([Kanal]) ve CALCULATE filtresi hatadır; tablo satırının bağlam geçişi ilişkili (bir tarafı) tabloların filtrelerinin yerine geçer (genişletilmiş tablo); kullanılmayan VAR hesaplanmaz; FORMAT(x, "") genel sayı; doğru/yanlış filtrede LASTDATE/FIRSTDATE hata; XIRR çözüm yoksa hata; CALENDAR "2022-01-01" metnini kabul eder; KEEPFILTERS'sız aynı sütun filtresi ISINSCOPE'u yanlış yapar. M tarafında: kültür yazılmazsa Desktop'ın kültürü (tr-TR) geçerli — Text.Proper("istanbul") İstanbul, Date.MonthName Ocak, "1.250,50" ve "1250.5" (nokta binlik sayılır → 12505) sayıya döner; Table.Join'de aynı adlı anahtar yalnız iç birleşimde tek sütuna iner, diğer türlerde "duplicate column names" hatası; Table.NestedJoin eşleşmeyen sağ satırları tek satırda toplar; kayıt alanları tembeldir (hatalı alan Record.ToTable'da hücre hatası olur). Açık kalanlar: ALLSELECTED'ın gölge bağlam ayrıntıları (C003, pencere OFFSET), IF dalı içindeki VAR'ın Power BI'da bazen hevesle hesaplanması, CURRENCY aritmetiği.
- **6. tur (motorda çalışmayan ders blokları, `data-notry`):** çalıştırılabilen 31 blok `notry.json` ile gerçek Power BI'da denendi. Dersler doğru çıktı: DAX UDF'de `val` parametresi YoY'u 0 yapar, `SELECTCOLUMNS` içinde ifade yazılınca soy kaybolur, `START AT` ve `IGNORE` Power BI'da çalışır, boolean filtrede ölçü ve ölçüde çıplak sütun hata verir. Tek fark CALENDARAUTO'nun gün sayısıydı: 4.018 gün, çünkü `Projeler[BitisPlan]` 2025'e uzanıyor. Ders metni düzeltildi.
- Karşılaştırma düzeneği: `pbitest/gen.cjs <paket klasörü>` → `out/model.tmdl`, `out/beklenen.json`; PC'de `kesit-pbi-test` klasöründe `calistir.bat` (shiftflow ortamının Python'u) `kontrol.py`'yi çalıştırır, `sonuc.txt` yazar.

Motorun ağır kaldığı yerler: büyük tabloda (Pedal İzmir ~116 bin satır) satır satır bağlam geçişi saniyeler sürer.

## Uçtan uca depo vakası (vaka/depo/)
Sayfa ve beklenen sonuçlar `app/build/gh/static/vaka/depo/` içindedir (üreteç: `ysfdurak.github.io` › `vaka/depo-kaynak/`). `ghpack.sh` her derlemede DAX motorunun paketteki küçültülmüş kopyasını yeni `kesit.js`'ten `vaka/depo/dax.js` olarak üretir ve `tests/vaka-depo.cjs` ile denetler; derleme denetim geçmezse durur. Kaynak dalında `node tests/vaka-depo-kaynak.cjs` aynı ölçüleri `app/dax.js` ile çalıştırır (CI).

## Görsel kurma, model kurma ve Desktop çalışma paketi (Kasım 2026, 4 aşama)

Kesit Power BI'ı Kesit Excel'in uygulamalı düzeyine çıkarma turu. Ayrıntı ve gerekçe `docs/PROJE_REHBERI.md` › 13.

- **`gv.js`** iki yeni alıştırma türü: `t: 'gorsel'` (görsel türü, eksen, gösterge, değerler, görsel filtresi, sıralama, İlk N, görsel hesaplama) ve `t: 'model'` (ilişki uçları, kardinalite, yön, etkin/pasif). Çözüm `sol`, denetim kuralı `kural` alanındadır; veri `X.query` ile aynı motordan gelir. Görsel hesaplama mini dili `vcParse`/`vcEval`.
- **`x_gorsel.js`** var olan derslere görsel/model alıştırmaları ekler (`ext(id, ex)`), **`c29.js`** sekiz yeni uygulamalı DAX dersi (`add(after, ders)` ile PBI_ORDER'a girer; `yollar.js` grupları da güncellenmeli), **`x_ek.js`** finans, istatistik, yarı toplanabilir, DAX sorgusu, artımlı yenileme alıştırmaları.
- **`dax.js`** ~53 yeni işlev (finans, dağılımlar, LINESTX, OPENINGBALANCE*, INFO.VIEW alt kümesi, TOCSV/TOJSON…). Excel'in bilinen sonuçlarıyla denetlendi; Desktop karşılaştırması henüz yapılmadı.
- **`gorevkagidi.js`** her dersin sayfasına "Desktop'ta çalış" bölümü koyar: çalışma paketi bağlantısı ve tarayıcıda üretilen görev kâğıdı (.md; beklenen sonuç tabloları ve ayrı çözüm bölümü).
- **`build/calisma.js`** çalışma paketini üretir. Yapı, Desktop'ta doğrulanan Lezzet Kurye paketiyle aynıdır; bu paket Desktop'ta henüz açılmadı (KALAN-GOREVLER.md › G40).
- **`build/statik.js`** (ghpack.sh çağırır): 158 statik ders sayfası, ders dizini ve `sitemap.xml` ders adresleri. `ders/statik.css` ve `sitemap.xml` `build/gh/static/` içinde.
- **Ertelenmiş paket:** ghpack.sh `EK=` satırındaki dosyalar (`confused, confused2, interview, interview2, guides`) `kesit-ek.js`'e gider. Bu listeye dosya eklersen: o dosyanın verisini açılışta okuyan başka modül olmamalı; görünüm adresini `app.js` › `EK_HASH`'e yaz.
- **`x_uygulama.js`**: Service, Fabric, kariyer ve başlangıç derslerine uygulamalı görevler; `tests/gvval.js` görsel/model görevlerini de denetler.

