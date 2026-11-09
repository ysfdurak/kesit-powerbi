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
{
  for f in $files; do
    printf '\n/* ===== %s ===== */\n' "$f"
    # Kurtarma sözleşmesindeki JSON başlığı paket denetiminde doğrudan okunur.
    if [ "$f" = recovery.js ]; then cat "$f"; else cat "$O/minified/$f"; fi
    printf '\n;\n'
  done
} > "$O/kesit-powerbi/kesit.js"
node build/budget.cjs "$O/kesit-powerbi/kesit.js"
cp build/gh/config.js $O/kesit-powerbi/
{ printf '<!doctype html>\n<html lang="tr">\n'; sed '/<script charset="utf-8" src="/d' index.html; printf '<script charset="utf-8" src="config.js"></script>\n<script charset="utf-8" src="kesit.js"></script>\n'; } > $O/kesit-powerbi/index.html
cp veri/*.zip $O/kesit-powerbi/veri/
cp build/gh/LICENSE build/gh/LICENSE-ICERIK.md $O/kesit-powerbi/
[ -d build/gh/ekran ] && cp build/gh/ekran/*.png $O/kesit-powerbi/ekran/ || true
touch $O/kesit-powerbi/.nojekyll
cp -r build/gh/static/. $O/kesit-powerbi/
node build/readme.js --manifest > "$O/kesit-powerbi/content-manifest.json"
python3 build/ghhead.py "$O/kesit-powerbi/index.html" "$O/kesit-powerbi/content-manifest.json"
V=$(cat $O/kesit-powerbi/index.html $O/kesit-powerbi/kesit.js $O/kesit-powerbi/config.js $O/kesit-powerbi/content-manifest.json | sha1sum | cut -c1-10)
sed -i "s/__SURUM__/$V/" $O/kesit-powerbi/sw.js
node build/readme.js > $O/kesit-powerbi/README.md
cd $O && rm -f kesit-powerbi.zip && python3 -c "import shutil; shutil.make_archive('kesit-powerbi','zip','.','kesit-powerbi')"
ls -la $O/kesit-powerbi.zip; ls $O/kesit-powerbi | wc -l
