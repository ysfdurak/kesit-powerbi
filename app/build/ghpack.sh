#!/bin/sh
# GitHub Pages paketi: sh build/ghpack.sh → scratchpad/gh/kesit-powerbi.zip
set -e
R=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
# Yeni geçici klasör: önceki çıktıları veya kullanıcı dosyalarını silmez.
O=$(mktemp -d "${TMPDIR:-/tmp}/kesit-powerbi.XXXXXX")
mkdir -p "$O/kesit-powerbi/veri" "$O/kesit-powerbi/ekran"
cd $R && sh build/build.sh && node build/vdpack.js > /dev/null
# Her kaynak dosyasını ayrı küçült; paket denetimleri bölüm başlıklarını okur.
files=$(sed -n 's/^<script charset="utf-8" src="\([^"]*\)"><\/script>$/\1/p' index.html | sed '/^config\.js$/d')
mkdir -p "$O/minified"
if [ -n "${KESIT_ESBUILD:-}" ]; then
  set -- "$KESIT_ESBUILD"
else
  set -- npm exec --yes --package=esbuild@0.25.12 -- esbuild
fi
"$@" --minify-whitespace --minify-syntax --charset=utf8 --legal-comments=none --log-level=error --outdir="$O/minified" $files
# Açılıştan sonra yüklenen bölümler (mülakat, sık hatalar, karıştırılanlar): kesit-ek.js. Geri kalanı kesit.js.
EK="confused.js confused2.js interview.js interview2.js guides.js"
paket() {
  for f in "$@"; do
    printf '\n/* ===== %s ===== */\n' "$f"
    # Kurtarma sözleşmesindeki JSON başlığı paket denetiminde doğrudan okunur.
    if [ "$f" = recovery.js ]; then cat "$f"; else cat "$O/minified/$f"; fi
    printf '\n;\n'
  done
}
cekirdek=""; for f in $files; do case " $EK " in *" $f "*) ;; *) cekirdek="$cekirdek $f";; esac; done
paket $EK > "$O/kesit-powerbi/kesit-ek.js"
EKV=$(sha1sum "$O/kesit-powerbi/kesit-ek.js" | cut -c1-10)
{
  # Yükleyici ilk sırada: uygulama başlarken window.PBI_EK hazır olmalı (app.js bekleme ekranı ve yönlendirme).
  printf '/* kesit-ek.js yükleyici */\nwindow.PBI_EK=(function(){var ok,no,p=new Promise(function(a,b){ok=a;no=b});p.hazir=false;p.catch(function(){});function y(){var s=document.createElement("script");s.charset="utf-8";s.src="kesit-ek.js?v=%s";s.onload=function(){p.hazir=true;ok()};s.onerror=function(){p.hazir=true;p.hata=true;no(new Error("kesit-ek.js"))};document.head.appendChild(s)}if(document.readyState==="complete")setTimeout(y,0);else window.addEventListener("load",function(){setTimeout(y,0)});return p})();\n' "$EKV"
  paket $cekirdek
} > "$O/kesit-powerbi/kesit.js"
node build/budget.cjs "$O/kesit-powerbi/kesit.js"
cp build/gh/config.js $O/kesit-powerbi/
{ printf '<!doctype html>\n<html lang="tr">\n'; sed '/<script charset="utf-8" src="/d' index.html; printf '<script charset="utf-8" src="config.js"></script>\n<script charset="utf-8" src="kesit.js"></script>\n<script charset="utf-8" src="en-tour.js" defer></script>\n'; } > $O/kesit-powerbi/index.html
cp veri/*.zip $O/kesit-powerbi/veri/
cp build/gh/LICENSE.md build/gh/LICENSE-ICERIK.md $O/kesit-powerbi/
[ -d build/gh/ekran ] && cp build/gh/ekran/*.png $O/kesit-powerbi/ekran/ || true
touch $O/kesit-powerbi/.nojekyll
cp -r build/gh/static/. $O/kesit-powerbi/
# Statik ders sayfaları (arama motoru ve JavaScript'siz okuma) ve site haritasındaki ders adresleri her derlemede yeniden üretilir.
node build/statik.js "$O/kesit-powerbi"
# Depo vakası (vaka/depo/) DAX motorunun paketteki kopyasını kullanır; her derlemede yeni kesit.js'ten üretilir.
(cd $O/kesit-powerbi && node tests/vaka-depo.cjs --yaz && node tests/vaka-depo.cjs)
node build/readme.js --manifest > "$O/kesit-powerbi/content-manifest.json"
python3 build/ghhead.py "$O/kesit-powerbi/index.html" "$O/kesit-powerbi/content-manifest.json"
V=$(cat $O/kesit-powerbi/index.html $O/kesit-powerbi/kesit.js $O/kesit-powerbi/kesit-ek.js $O/kesit-powerbi/config.js $O/kesit-powerbi/content-manifest.json $O/kesit-powerbi/en-tour.js | sha1sum | cut -c1-10)
sed -i "s/__SURUM__/$V/; s/__EKV__/$EKV/" $O/kesit-powerbi/sw.js
node build/readme.js > $O/kesit-powerbi/README.md
cd $O && rm -f kesit-powerbi.zip && python3 -c "import shutil; shutil.make_archive('kesit-powerbi','zip','.','kesit-powerbi')"
ls -la $O/kesit-powerbi.zip; ls $O/kesit-powerbi | wc -l
