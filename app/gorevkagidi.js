/* Kesit Power BI — "Desktop'ta çalış": dersin görev kâğıdı (.md) ve Anadolu Market çalışma paketi (PBIP).
   Görev kâğıdı tarayıcıda, aynı motorla üretilir: her DAX alıştırmasının beklenen sonuç tablosu, görsel alıştırmalarının alanları ve verisi, model alıştırmalarının ilişkileri.
   Çözümler kâğıdın sonunda ayrı bir bölümdedir. */
(function () {
'use strict';
if (!window.PBI_CORE) return;
const C = window.PBI_CORE, X = C.X, esc = C.esc;
const PAKET = 'veri/anadolu-market-calisma.zip';
const DEFAULT_GRID = [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }];
const duz = h => String(h || '').replace(/<code>(.*?)<\/code>/g, '`$1`').replace(/<b>(.*?)<\/b>/g, '**$1**').replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+\n/g, '\n').trim();
const deger = v => v == null ? '(boş)' : v instanceof Date ? X.fmtDate(v, 'dd.MM.yyyy') : typeof v === 'number' ? (Number.isInteger(v) ? (Math.abs(v) < 10000 ? String(v) : v.toLocaleString('tr-TR')) : v.toLocaleString('tr-TR', { maximumFractionDigits: 4 })) : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v).replace(/\|/g, '\\|').replace(/\n/g, ' ⏎ ');
const tablo = (basliklar, satirlar, enCok) => { const s = satirlar.slice(0, enCok || 40); return '| ' + basliklar.join(' | ') + ' |\n|' + basliklar.map(() => '---').join('|') + '|\n' + s.map(r => '| ' + r.map(deger).join(' | ') + ' |').join('\n') + (satirlar.length > s.length ? '\n\n_… ' + (satirlar.length - s.length) + ' satır daha._' : ''); };
const ad = c => c.t + '[' + c.c + ']';
const uygulamali = e => e && ['dax', 'query', 'gorsel', 'model', 'pq', 'mcode'].includes(e.t);

function daxBeklenen(e) {
  const ms = C.measureSet(e.name); const g = e.grid || DEFAULT_GRID;
  return g.map(col => {
    const r = X.query({ rows: [col], measures: ms, values: [e.sol], slicers: [], totals: !e.noTotal });
    const rows = r.rows.map(x => [x.keys[0], x.vals[0]]); if (!e.noTotal && r.total) rows.push(['**Toplam**', r.total[0]]);
    return '_' + ad(col) + ' satırlarında:_\n\n' + tablo([col.c, e.name], rows, 25);
  }).join('\n\n');
}
function kagit(l) {
  const ex = (l.ex || []).map((e, i) => ({ e, i })).filter(x => uygulamali(x.e));
  let md = '# ' + l.title + '\n\n' + duz(l.sum) + '\n\n';
  md += '> Kesit Power BI · Anadolu Market modeli. Önce bu görevleri tarayıcıda dene; sonra çalışma paketini (' + location.origin + location.pathname.replace(/[^/]*$/, '') + PAKET + ') Power BI Desktop\'ta açıp aynılarını kur ve sonuçları bu kâğıttaki beklenen değerlerle karşılaştır.\n\n';
  const coz = [];
  ex.forEach(({ e, i }, n) => {
    const no = 'Görev ' + (n + 1) + ' (alıştırma ' + (i + 1) + ')';
    try {
      if (e.t === 'dax') {
        md += '## ' + no + ' · DAX ölçüsü: ' + e.name + '\n\n' + duz(e.q) + '\n\nYeni bir ölçü oluştur, adı **' + e.name + '** olsun. Bir tablo görselinde aşağıdaki alanlarla dene.\n\n' + daxBeklenen(e) + '\n\n';
        coz.push('### ' + no + '\n\n```dax\n' + e.name + ' =\n' + e.sol + '\n```');
      } else if (e.t === 'query') {
        const r = X.runQuery(C.measureSet(), e.sol);
        md += '## ' + no + ' · DAX sorgusu\n\n' + duz(e.q) + '\n\nDAX Sorgu Görünümü\'nde çalıştır. Beklenen sonuç:\n\n' + tablo(r.cols, r.rows, 25) + '\n\n';
        coz.push('### ' + no + '\n\n```dax\n' + e.sol + '\n```');
      } else if (e.t === 'gorsel') {
        const s = e.sol, d = window.PBI_GV.gorselVerisi(s);
        const turAd = (window.PBI_GV.TURLER || {})[s.tur] || s.tur;
        md += '## ' + no + ' · Görsel kurma\n\n' + duz(e.q) + '\n\nRapor sayfasına bir görsel ekle ve aşağıdaki sonuca ulaş.\n\n';
        if (d.kart) md += '- Beklenen tek değer: **' + deger(d.deger) + '**\n\n';
        else {
          const cols = [s.eksen ? s.eksen.replace(/^.*\[|\]$/g, '') : ''].concat(d.series.map(x => x.name)).concat((d.hesap || []).map(h => h.name));
          const rows = d.cats.map((k, j) => [k].concat(d.series.map(x => x.vals[j])).concat((d.hesap || []).map(h => h.vals[j])));
          md += tablo(cols, rows, 40) + '\n\n';
        }
        coz.push('### ' + no + '\n\n- Görsel: ' + turAd + (s.eksen ? '\n- Eksen / Satırlar: `' + s.eksen + '`' : '') + (s.gosterge ? '\n- Gösterge / Sütunlar: `' + s.gosterge + '`' : '') + '\n- Değerler: ' + s.degerler.map(x => '`' + x + '`').join(', ') + (s.filtre && s.filtre.alan ? '\n- Bu görselde filtre: `' + s.filtre.alan + '` = ' + s.filtre.degerler.map(deger).join(', ') : '') + (s.sirala && s.sirala !== 'etiket' ? '\n- Sırala: değere göre ' + (s.sirala === 'azalan' ? 'azalan' : 'artan') : '') + (s.topn ? '\n- Görsel filtresi: İlk ' + s.topn + ' (değere göre)' : '') + (s.hesap && s.hesap[0] ? '\n- Görsel hesaplama (Yeni görsel hesaplama): `' + s.hesap[0].ad + ' = ' + s.hesap[0].ifade + '`' : ''));
      } else if (e.t === 'model') {
        md += '## ' + no + ' · Model kurma\n\n' + duz(e.q) + '\n\nModel görünümünde ilişkileri kontrol et (çalışma paketinde ilişkiler hazır kurulu gelir; önce silip kendin kur).' + (e.kontrol ? ' Kurduktan sonra `' + e.kontrol.olcu + '` ölçüsünü `' + e.kontrol.satir + '` ile bir tabloya koy: her satırda farklı değer görmelisin.' : '') + '\n\n';
        coz.push('### ' + no + '\n\n' + e.sol.map(r => '- `' + r.from + '[' + r.fromCol + ']` → `' + r.to + '[' + r.toCol + ']` · ' + (r.kard || '*:1') + ' · ' + (r.yon === 'cift' ? 'çift yönlü' : 'tek yönlü') + (r.aktif === false ? ' · pasif' : '')).join('\n'));
      } else if (e.t === 'mcode' || e.t === 'pq') {
        md += '## ' + no + ' · Power Query\n\n' + duz(e.q || '') + '\n\nBu görev tarayıcıdaki Power Query alıştırmasının kaynağıyla çalışır; Desktop\'ta kendi tablonla benzerini dene.\n\n';
        if (e.t === 'mcode') coz.push('### ' + no + '\n\n```m\n' + e.sol + '\n```');
      }
    } catch (err) { md += '## ' + no + '\n\n' + duz(e.q || '') + '\n\n_(Beklenen sonuç hesaplanamadı: ' + err.message + ')_\n\n'; }
  });
  if (coz.length) md += '---\n\n# Çözümler\n\nÖnce kendin dene. Takıldığında bak.\n\n' + coz.join('\n\n') + '\n';
  return md;
}
function indir(l) {
  const md = kagit(l), a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + md], { type: 'text/markdown;charset=utf-8' }));
  a.download = 'kesit-pbi-' + l.id + '-gorevler.md'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function panel(l) {
  const n = (l.ex || []).filter(e => ['dax', 'query', 'gorsel', 'model'].includes(e.t)).length; if (!n) return '';
  return '<section class="panel desktop-calis"><div><span class="eyebrow">Desktop\'ta çalış</span><h3 style="margin:.2em 0">Aynı görevleri Power BI Desktop\'ta kur</h3><p class="muted" style="margin:0">Anadolu Market modelinin proje dosyası (PBIP) ve bu dersin ' + n + ' görevinin beklenen sonuçları. Önce tarayıcıda çöz, sonra Desktop\'ta karşılaştır.</p></div>'
    + '<div class="row" style="gap:8px;flex-wrap:wrap"><a class="btn sm" href="' + PAKET + '" download>Çalışma paketi (.zip, PBIP)</a><button class="btn sm" data-act="gorev-kagidi">Bu dersin görev kâğıdı (.md)</button></div></section>';
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act="gorev-kagidi"]'); if (!b) return;
  const st = C.state(); const l = C.LMAP[st.id]; if (!l) return;
  try { indir(l); C.toast('Görev kâğıdı indirildi'); } catch (err) { C.toast('Görev kâğıdı oluşturulamadı: ' + err.message); }
});
window.PBI_GOREV = { kagit, panel, indir, PAKET };
})();
