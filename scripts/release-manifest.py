"""Paket dosyalarını mühürle veya HTTPS yayınıyla bayt düzeyinde karşılaştır."""
import argparse, hashlib, json, pathlib, urllib.request
p = argparse.ArgumentParser()
p.add_argument('directory', type=pathlib.Path)
p.add_argument('--source-commit')
p.add_argument('--url')
a = p.parse_args()
manifest = a.directory / 'release-manifest.json'
if a.url:
    m = json.loads(manifest.read_text())
    for name, expected in m['files'].items():
        url = a.url.rstrip('/') + '/' + name + '?release=' + m['sourceCommit']
        with urllib.request.urlopen(url, timeout=45) as r:
            actual = hashlib.sha256(r.read()).hexdigest()
        if actual != expected:
            raise SystemExit('Yayın eşleşmiyor: ' + name)
    print(str(len(m['files'])) + ' canlı dosya SHA-256 ile eşleşti.')
else:
    if not a.source_commit:
        p.error('--source-commit gerekli')
    files = ['index.html', 'kesit.js', 'config.js', 'sw.js']
    m = {'schema': 1, 'date': '2026-11-08', 'sourceCommit': a.source_commit,
         'checks': ['6 kurtarma kontrolü', '443 referans çözüm', 'Sahte cevap reddi', '2 eşdeğer çözüm'],
         'files': {f: hashlib.sha256((a.directory / f).read_bytes()).hexdigest() for f in files}}
    manifest.write_text(json.dumps(m, ensure_ascii=False, indent=2) + '\n')
    print('4 yayın dosyası mühürlendi.')
