# Kesit Power BI · kaynak dalı: derleme ve test

Bu dal (`kaynak`) uygulamanın kaynak dosyalarını, derleme betiklerini ve test araçlarını içerir.
Yayındaki site `main` dalındadır ve bu daldan **üretilir**; `main`'i elle düzenleme.

## Klasörler

| Klasör | Ne var | Çalışırken beklenen mutlak yol |
|---|---|---|
| `app/` | Uygulamanın kaynağı: içerik dosyaları (`c*.js`, `x_*.js`, `vd_*.js`…), motor (`dax.js`, `pq.js`), arayüz (`app.js`, `pages.js`, `portfolio.js`…), stiller (`app.css`), `build/` (derleme betikleri, GitHub sayfası şablonları), `veri/` (vaka paketlerinin zip'leri ve claude.ai yayını için base64 kopyaları), `index.html` (derleme çıktısı) | `/home/claude/pbi` |
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
sh build/ghpack.sh           # GitHub Pages paketi → scratchpad/gh/kesit-powerbi/ ve kesit-powerbi.zip
```

- **Yeni bir JS dosyası** eklenirse `build/build.sh` içindeki `for f in …` listesine doğru sıraya yaz. Sıra önemli: veri → motor → içerik → `app.js` → modüller → `pages.js`.
- **`ghpack.sh`**: bütün betikleri tek `kesit.js` dosyasında birleştirir, `build/gh/config.js` (dolu yapılandırma), `build/gh/static/` (simgeler, manifest, `sw.js`, `og.png`, yerel yazı tipleri) ve lisans/rehber dosyalarını ekler, `build/ghhead.py` ile Google Fonts yerine yerel yazı tiplerini ve paylaşım etiketlerini koyar, `build/readme.js` ile README'yi sayılardan üretir.
- **Sosyal görsel** (`og.png`) ve simgeler: `scratchpad/og/og.html` + `scratchpad/icons.js` (8799 portunda `scratchpad/og` sunulurken çalıştır).

### Yayın

- **GitHub Pages (`main` dalı):** `sh build/ghpack.sh`, sonra `scratchpad/gh/kesit-powerbi/` içeriğini `main` dalına kopyala ve gönder. Site: https://ysfdurak.github.io/kesit-powerbi/ (Pages ayarı: Settings → Pages → `main` / root).
- **claude.ai artifact (önizleme):** https://claude.ai/artifact/5rutyn2r3dSusYh7p1N1dL — `root: /home/claude/pbi`, `file_path: index.html`, `files`: index.html'deki her script (aynı ad) + `veri/*.b64.txt`. Yetenekler: `downloads`, `db` (kural: `feedback` read/write `interact`), `user`. Eşleme listesini üretmek için:
  ```sh
  cd /home/claude/pbi && python3 -c "import re,json;s=open('index.html').read();m={f:f for f in re.findall(r'src=\"([^\"]+)\"',s)};import glob;[m.update({f:f}) for f in glob.glob('veri/*.b64.txt')];print(json.dumps(m))"
  ```
  claude.ai sürümü `app/config.js` (boş) ile çalışır; GitHub sürümü `app/build/gh/config.js` (dolu) kullanır.

## Testler

Önce yerel sunucu (tarayıcı testleri için):

```sh
cd /home/claude/pbi && python3 -m http.server 8765
```

### Node doğrulayıcıları (`/home/claude/recover`; son satır `SORUN 0` / `bad 0` / `fark 0` olmalı)

```sh
cd /home/claude/recover
node cross.js                 # 70 ölçünün motor sonucu ↔ bağımsız hesap
node exval.js                 # tüm ders DAX/sorgu alıştırmaları çözülebiliyor mu
node snip.js                  # derslerdeki ve püf noktalarındaki çalıştırılabilir DAX blokları
node bankval.js               # alıştırma bankası
node codeval.js /home/claude/pbi/interview2.js     # kod havuzu + canlı mülakat görevleri
node arenaval.js              # DAX Arena
node agentval.js /home/claude/pbi/confused.js /home/claude/pbi/confused2.js /home/claude/pbi/interview.js /home/claude/pbi/interview2.js
node dashval.js               # 24 rapor, tüm sayfalar, yer imleri, parametreler, mobil
node lessonval.js /home/claude/pbi/c21.js /home/claude/pbi/c22.js /home/claude/pbi/c23.js   # yeni ders dosyası (şablon B)
node extval.js /home/claude/pbi/x_*.js             # ders genişletme dosyaları (şablon A)
for f in ilgaz kanat lezzet pusula pedal; do node vdval.js /home/claude/pbi/vd_$f.js | tail -1; done   # vaka paketleri: DAX = beklenen = SQLite
node longest.js               # çoktan seçmeli şık dengesi (bilgi)
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

## Bilinen motor sınırları (tarayıcı DAX motoru)

Bu durumlar derslerde `data-notry` ile gösterilir ve alıştırmalarda kullanılmaz:
çoka çok ilişki kurma ve çift yönlü model ilişkisi (ölçü içinde CROSSFILTER/TREATAS çalışır), takvim tabanlı zaman zekâsı (önizleme özelliği), pencere fonksiyonlarının toplam satırı (motor boş döndürür), SUMMARIZECOLUMNS'ta IGNORE, sorguda START AT ve birden çok EVALUATE, GENERATEALL.
Motorun ağır kaldığı yerler: büyük tabloda (Pedal İzmir ~116 bin satır) satır satır bağlam geçişi saniyeler sürer.
