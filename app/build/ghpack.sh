#!/bin/sh
# GitHub Pages paketi: sh build/ghpack.sh → scratchpad/gh/kesit-powerbi.zip
set -e
R=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
# Yeni geçici klasör: önceki çıktıları veya kullanıcı dosyalarını silmez.
O=$(mktemp -d "${TMPDIR:-/tmp}/kesit-powerbi.XXXXXX")
mkdir -p "$O/kesit-powerbi/veri" "$O/kesit-powerbi/ekran"
cd $R && sh build/build.sh && node build/vdpack.js > /dev/null
# Tüm uygulama dosyaları tek pakette (config.js ayrı kalır: yayıncı yalnızca onu düzenler)
: > $O/kesit-powerbi/kesit.js
for f in $(grep -o 'src="[^"]*"' index.html | sed 's/src="//;s/"$//' | grep -v '^config.js$'); do printf '\n/* ===== %s ===== */\n' "$f" >> $O/kesit-powerbi/kesit.js; cat "$f" >> $O/kesit-powerbi/kesit.js; printf '\n;\n' >> $O/kesit-powerbi/kesit.js; done
cp build/gh/config.js $O/kesit-powerbi/
{ printf '<!doctype html>\n<html lang="tr">\n'; sed '/<script charset="utf-8" src="/d' index.html; printf '<script charset="utf-8" src="config.js"></script>\n<script charset="utf-8" src="kesit.js"></script>\n'; } > $O/kesit-powerbi/index.html
cp veri/*.zip $O/kesit-powerbi/veri/
cp build/gh/LICENSE build/gh/LICENSE-ICERIK.md $O/kesit-powerbi/
[ -d build/gh/ekran ] && cp build/gh/ekran/*.png $O/kesit-powerbi/ekran/ || true
touch $O/kesit-powerbi/.nojekyll
cp -r build/gh/static/. $O/kesit-powerbi/
python3 build/ghhead.py $O/kesit-powerbi/index.html
V=$(cat $O/kesit-powerbi/index.html $O/kesit-powerbi/kesit.js $O/kesit-powerbi/config.js | sha1sum | cut -c1-10)
sed -i "s/__SURUM__/$V/" $O/kesit-powerbi/sw.js
node build/readme.js > $O/kesit-powerbi/README.md
cd $O && rm -f kesit-powerbi.zip && python3 -c "import shutil; shutil.make_archive('kesit-powerbi','zip','.','kesit-powerbi')"
ls -la $O/kesit-powerbi.zip; ls $O/kesit-powerbi | wc -l
