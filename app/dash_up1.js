/* Kesit Power BI — mevcut 7 raporun çok sayfalı Power BI raporuna yükseltilmesi: ozet, zaman, urun, musteri, rfm, kohort, hedef.
   Her rapor: ilk sayfa eski görseller (iyileştirilmiş), 2–3 yeni sayfa, gizli detay sayfası, araç ipucu sayfaları, yer imleri, gezinme/görünüm düğmeleri, alan parametresi. */
(function (W) {
'use strict';
const D = W.PBI_DASHES; const find = id => D.find(d => d.id === id);
const cats = r => r.rows.map(x => x.keys[0]); const col = (r, j) => r.rows.map(x => x.vals[j]);
const sortBy = (r, j, desc) => { r.rows.sort((a, b) => ((desc === false ? 1 : -1) * ((a.vals[j] || 0) - (b.vals[j] || 0)))); return r; };
const grid2 = (r, k1, k2, j) => k1.map(a => k2.map(b => { const x = r.rows.find(z => z.keys[0] === a && z.keys[1] === b); return x ? x.vals[j] : null; }));
const MT = W.PBI_MODEL.tables;
const MON = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const MONL = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const KANAL = ['Web', 'Mobil', 'Mağaza'];
const KIC = { Web: 'W', Mobil: 'M', 'Mağaza': 'Mğ' };
const isN = v => typeof v === 'number' && isFinite(v);
const sgn = (v, dg) => !isN(v) ? '—' : (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(dg == null ? 1 : dg).replace('.', ',') + '%';
const pp = v => !isN(v) ? '—' : (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(1).replace('.', ',') + ' puan';
const ratio = (a, b) => isN(a) && isN(b) && b ? a / b - 1 : null;
const sum = arr => arr.filter(isN).reduce((p, q) => p + q, 0);
const avg = arr => { const v = arr.filter(isN); return v.length ? sum(v) / v.length : null; };
const FM = { 'Net Satış': 'para', 'Brüt Kâr': 'para', 'Sipariş Sayısı': 'adet', 'Müşteri Sayısı': 'adet', 'Satılan Adet': 'adet', 'Kâr Marjı %': 'yuzde', 'Satış YTD': 'para', '3 Ay Hareketli Ort.': 'para', 'Kümülatif Satış': 'para', 'Satış GY': 'para', 'Kohort Tutma %': 'yuzde', 'Gelir Tutma %': 'yuzde' };
const fmOf = m => FM[m] || 'para';
const GYX = m => 'CALCULATE([' + m + '], SAMEPERIODLASTYEAR(Tarih[Tarih]))';
const ymLabel = ym => { const m = /^(\d{4})-(\d{2})$/.exec(String(ym)); return m ? MONL[+m[2] - 1] + ' ' + m[1] : String(ym); };
const empty = msg => '<div class="empty">' + msg + '</div>';
/* aynı filtre bağlamında pahalı sorguları bir kez hesapla (Power BI'daki sorgu önbelleği gibi) */
const CACHE = new Map();
const memo = (a, tag, o, fn) => { const k = tag + '|' + JSON.stringify(a.spec(o || {})); if (CACHE.has(k)) return CACHE.get(k); const v = fn(); if (CACHE.size > 400) CACHE.clear(); CACHE.set(k, v); return v; };
/* modelden: detay sayfalarının varsayılan değerleri */
const MUS = {}; MT.Musteriler.rows.forEach(m => { MUS[m.MusteriNo] = m; });
const URN = {}; MT.Urunler.rows.forEach(u => { URN[u.Urun] = u; });
const topKey = (keyFn, yr) => { const s = {}; MT.Satislar.rows.forEach(r => { if (r.Durum === 'İptal' || (yr && r.Tarih.getUTCFullYear() !== yr)) return; const k = keyFn(r); if (k == null) return; s[k] = (s[k] || 0) + r.Tutar; }); return Object.keys(s).sort((x, y) => s[y] - s[x])[0]; };
const TOP_URUN = (MT.Urunler.rows.find(u => String(u.UrunNo) === topKey(r => r.UrunNo, 2024)) || MT.Urunler.rows[0]).Urun;
const TOP_MUS = +topKey(r => r.MusteriNo, 2024);
const TOP_KAT = (MT.Urunler.rows.find(u => String(u.UrunNo) === topKey(r => r.UrunNo, 2024)) || {}).Kategori || 'Elektronik';
const TOP_KOH = (() => { const c = {}; MT.Musteriler.rows.forEach(m => { if (m.KohortAy && m.KohortAy >= '2023-01' && m.KohortAy <= '2024-06') c[m.KohortAy] = (c[m.KohortAy] || 0) + 1; }); return Object.keys(c).sort((x, y) => c[y] - c[x] || (x < y ? -1 : 1))[0]; })();
const musName = no => (MUS[no] || {}).Musteri || ('Müşteri ' + no);

/* ortak görsel kalıpları */
const pnav = (id, pages) => ({ id, span: 12, kind: 'nav', title: 'Sayfa gezgini', items: pages.map(p => ({ label: p[1], page: p[0], icon: p[2] })), morder: 0 });
const vnav = (id, span) => ({ id, span: span || 12, kind: 'nav', title: 'Görünüm · yer imi düğmeleri', items: [{ label: 'Grafik', icon: '▥', vis: 'gorunum:grafik' }, { label: 'Tablo', icon: '☷', vis: 'gorunum:tablo' }], morder: 1 });
const KFMT = ['Görsel: Kart (yeni) — Referans etiketi: geçen yıl', 'Mini grafik: Tarih[YilAy]', 'Değer: Görüntü birimi Otomatik'];
const kc = (id, span, title, wells, measures, why, fn, extra) => Object.assign({ id, span, title, type: 'Kart (yeni)', wells, measures, format: KFMT, why, render: a => { const o = fn(a); return o && isN(o.v) ? a.V.kpicard(o) : empty('Bu seçimde değer yok'); } }, extra || {});
const header = (id, fn) => ({ id, span: 12, kind: 'text', html: fn, morder: 0 });
/* Araç ipucu sayfası: seçili öğenin satışı, büyümesi, marjı, aylık eğilim ve kırılım */
const tipSales = (by, byLabel) => (a, add, cat) => {
  const ns = a.M('[Net Satış]', { add }), yoy = a.M('[YoY %]', { add }), mj = a.M('[Kâr Marjı %]', { add });
  const sp = a.Q(['Tarih[YilAy]'], ['Net Satış'], { add, totals: false }).rows.map(x => x.vals[0]).filter(isN).slice(-12);
  const b = by ? sortBy(a.Q([by], ['Net Satış'], { add, totals: false }), 0).rows.filter(x => x.keys[0] != null && isN(x.vals[0])).slice(0, 4).map(x => [String(x.keys[0]), x.vals[0], a.fmt(x.vals[0], 'para', true)]) : null;
  return { title: 'Araç ipucu sayfası · ' + cat, cards: [['Net satış', a.fmt(ns, 'para', true)], ['Geçen yıla göre', sgn(yoy)], ['Kâr marjı', isN(mj) ? a.fmt(mj, 'yuzde') : '—']], spark: sp.length > 1 ? sp : null, sparkLabel: 'Seçili dönem, aylık net satış', bars: b, barsLabel: byLabel };
};
/* Ay araç ipucu: ay içindeki satış, geçen yıl, sipariş ve kategori kırılımı */
const tipMonth = (a, add, cat) => {
  const ns = a.M('[Net Satış]', { add }), gy = a.M('[Satış GY]', { add }), sp = a.M('[Sipariş Sayısı]', { add }), hd = a.M('[Hedef]', { add });
  const b = sortBy(a.Q(['Kategoriler[Kategori]'], ['Net Satış'], { add, totals: false }), 0).rows.filter(x => isN(x.vals[0])).slice(0, 4).map(x => [x.keys[0], x.vals[0], a.fmt(x.vals[0], 'para', true)]);
  return { title: 'Araç ipucu sayfası · ' + (String(cat).length === 7 ? ymLabel(cat) : cat), cards: [['Net satış', a.fmt(ns, 'para', true)], ['Geçen yıla göre', sgn(ratio(ns, gy))], [isN(hd) && hd ? 'Hedefe göre' : 'Sipariş', isN(hd) && hd ? sgn(ratio(ns, hd)) : a.fmt(sp, 'adet')]], bars: b, barsLabel: 'En büyük 4 kategori' };
};
/* Ürün araç ipucu */
const tipUrun = (a, add, cat) => {
  const ns = a.M('[Net Satış]', { add }), mj = a.M('[Kâr Marjı %]', { add }), ad = a.M('[Satılan Adet]', { add }), io = a.M('[İade Oranı %]', { add });
  const sp = a.Q(['Tarih[YilAy]'], ['Net Satış'], { add, totals: false }).rows.map(x => x.vals[0]).filter(isN).slice(-12);
  const u = URN[cat];
  return { title: 'Ürün ipucu · ' + cat, cards: [['Net satış', a.fmt(ns, 'para', true)], ['Marj', isN(mj) ? a.fmt(mj, 'yuzde') : '—'], ['Adet', a.fmt(ad || 0, 'adet')], ['İade', a.fmt(io || 0, 'yuzde')]], spark: sp.length > 1 ? sp : null, sparkLabel: 'Aylık net satış', note: u ? u.Kategori + ' · liste fiyatı ' + a.fmt(u.Fiyat, 'para') + ' · stok ' + u.Stok : null };
};
/* basit doğrusal eğilim (Analiz bölmesindeki tahminin mantığı) */
const linfit = vals => { const p = vals.map((v, i) => [i, v]).filter(x => isN(x[1])); const n = p.length; if (n < 3) return null; let sx = 0, sy = 0, sxy = 0, sxx = 0; p.forEach(([x, y]) => { sx += x; sy += y; sxy += x * y; sxx += x * x; }); const b = (n * sxy - sx * sy) / (n * sxx - sx * sx); const c = (sy - b * sx) / n; const se = Math.sqrt(p.reduce((s, [x, y]) => s + Math.pow(y - (c + b * x), 2), 0) / Math.max(1, n - 2)); return { a: c, b, se, n }; };

/* ═════════════════════════ 1. Yönetici Özeti ═════════════════════════ */
(function () {
  const d = find('ozet'); if (!d) return;
  const T = id => d.tiles.find(t => t.id === id);
  d.group = 'Yönetim ve finans';
  d.params = { olcu: { label: 'Ölçü', opts: [['Net Satış', 'Net satış'], ['Brüt Kâr', 'Brüt kâr'], ['Sipariş Sayısı', 'Sipariş'], ['Müşteri Sayısı', 'Müşteri']], def: 'Net Satış' } };
  d.vis = { gorunum: 'grafik' };
  const PG = [['genel', 'Genel bakış', '◧'], ['kanal', 'Kategori ve kanal', '▤'], ['kar', 'Kârlılık', '₺']];
  const PMS = ['Net Satış', 'Brüt Kâr', 'Sipariş Sayısı', 'Müşteri Sayısı', 'Satış GY'];
  const katTip = tipSales('Satislar[Kanal]', 'Kanal kırılımı');
  const XK = [['Kategoriler', 'Kategori']];

  /* sayfa 1: eski görseller + iyileştirmeler */
  const tr = T('trend');
  tr.title = a => 'Aylık net satış ve geçen yıl · ' + a.yearLabel; tr.titleHint = 'Aylık net satış ve geçen yıl · <yıl>';
  tr.tip = tipMonth; tr.wells['Araç ipuçları'] = 'Rapor sayfası: “Ay ipucu”';
  tr.render = a => { const r = a.Q([a.timeAxis], ['Net Satış', 'Satış GY']); const c = cats(r); return a.V.line({ cats: c, series: [{ name: 'Net Satış', vals: col(r, 0) }, { name: 'Geçen yıl', vals: col(r, 1), dash: true, color: 'var(--axis)', width: 1.5 }], fmt: 'para' }, { legend: 'top', tipx: a.tipx(a.timeAxis, c) }); };
  const kn = T('kanal'); kn.tip = tipSales('Kategoriler[Kategori]', 'Kategori kırılımı'); kn.wells['Araç ipuçları'] = 'Rapor sayfası: “Kanal ipucu”';
  kn.render = a => { const r = a.Q(['Satislar[Kanal]'], ['Net Satış'], { except: [['Satislar', 'Kanal']] }); const c = cats(r); return { cats: c, html: a.V.donut({ cats: c, series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { sel: a.sel(c, 'Satislar', 'Kanal'), legend: 'bottom', tipx: a.tipx('Satislar[Kanal]', c) }) }; };
  const kt = T('kat'); kt.thru = 'katdetay'; kt.tip = katTip; kt.wells['Detaya git'] = 'Kategori detayı sayfası';
  kt.why += ' Sağ tık → Detaya git ile “Kategori detayı” sayfası açılır.';
  d.tiles.unshift(pnav('nav1', PG));

  /* sayfa 2: Kategori ve kanal (alan parametresiyle) */
  const kanalCard = (k, i) => ({ id: 'kc' + i, span: 4, title: a => k + ' · ' + a.prmLabel('olcu'), titleHint: k + ' · <seçili ölçü>', type: 'Kart (yeni)', wells: { 'Değer': 'Ölçü (alan parametresi)', 'Referans etiketi': 'Aynı ölçü, geçen yıl', 'Mini grafik': 'Tarih[YilAy]', 'Görsel filtresi': 'Satislar[Kanal] = "' + k + '"' }, measures: PMS, format: KFMT.concat(['Başlık: fx → koşullu başlık ölçüsü']),
    why: 'Her kanal için ayrı kart: ölçüyü üstteki alan parametresi belirler. Fark rozeti geçen yıla göre büyümeyi, mini grafik ayların yönünü gösterir.',
    render: a => { const m = a.prm('olcu'), add = [{ t: 'Satislar', c: 'Kanal', values: [k] }]; const v = a.M('[' + m + ']', { add }), gy = a.M(GYX(m), { add }), tot = a.M('CALCULATE([' + m + '], REMOVEFILTERS(Satislar[Kanal]))'); if (!isN(v)) return empty(k + ' kanalında bu seçimde satış yok'); const sp = col(a.Q(['Tarih[YilAy]'], [m], { add, totals: false }), 0); return a.V.kpicard({ v, fmt: fmOf(m), delta: ratio(v, gy), dlabel: 'geçen yıla göre', icon: KIC[k], spark: sp.length > 1 ? sp : null, sub: 'Toplam içindeki pay: %' + Math.round((v / (tot || 1)) * 100) }); } });
  const kkQuery = a => { const m = a.prm('olcu'); const r = a.Q(['Kategoriler[Kategori]', 'Satislar[Kanal]'], [m], { except: XK, totals: false }); const t = sortBy(a.Q(['Kategoriler[Kategori]'], [m, 'Ölçü GY'], { except: XK, totals: false, extraMeasures: { 'Ölçü GY': GYX(m) } }), 0); t.rows = t.rows.filter(x => isN(x.vals[0])); const c = cats(t); return { m, c, g: grid2(r, c, KANAL, 0), t }; };
  const kanalPage = [
    pnav('nav2', PG),
    kanalCard('Web', 1), kanalCard('Mobil', 2), kanalCard('Mağaza', 3),
    { id: 'kk', span: 7, vis: 'gorunum:grafik', title: a => a.prmLabel('olcu') + ': kategori ve kanal', titleHint: '<ölçü>: kategori ve kanal', type: 'Yığılmış çubuk', cross: 'Kategoriler[Kategori]', thru: 'katdetay', tip: katTip,
      wells: { 'Y ekseni': 'Kategoriler[Kategori]', 'X ekseni': 'Ölçü (alan parametresi)', 'Gösterge': 'Satislar[Kanal]', 'Araç ipuçları': 'Rapor sayfası: “Kategori ipucu”' }, measures: PMS, format: ['Müşteri sayısında kümelenmiş (tekil sayım toplanamaz)', 'Seçim bölmesi: “Grafik” grubunda', 'Sağ tık → Detaya git: Kategori detayı'],
      why: 'Hangi kategori hangi kanaldan satılıyor? Yığılmış çubuk hem toplamı hem kanal karışımını tek satırda verir. Müşteri sayısı tekil sayım olduğu için yığılmaz, yan yana gösterilir.',
      render: a => { const q = kkQuery(a); if (!q.c.length) return { cats: [], html: empty('Bu seçimde satış yok') }; return { cats: q.c, html: a.V.bar({ cats: q.c, series: KANAL.map((k, j) => ({ name: k, vals: q.g.map(row => row[j]) })), fmt: fmOf(q.m) }, { stacked: q.m !== 'Müşteri Sayısı', legend: 'top', grid: false, sel: a.sel(q.c, 'Kategoriler', 'Kategori'), tipx: a.tipx('Kategoriler[Kategori]', q.c), labels: q.m !== 'Müşteri Sayısı' }) }; } },
    { id: 'kkT', span: 7, vis: 'gorunum:tablo', title: a => a.prmLabel('olcu') + ': kategori × kanal tablosu', titleHint: '<ölçü>: kategori × kanal tablosu', type: 'Matris', cross: 'Kategoriler[Kategori]', thru: 'katdetay',
      wells: { 'Satırlar': 'Kategoriler[Kategori]', 'Sütunlar': 'Satislar[Kanal]', 'Değerler': 'Ölçü (alan parametresi), geçen yıla göre %' }, measures: PMS, format: ['Koşullu biçim: arka plan rengi (kanal sütunları)', 'Seçim bölmesi: “Tablo” grubunda, grafikle aynı konumda', 'Satır toplamları açık'],
      why: 'Aynı sorunun kesin rakamlı hâli. Grafik ↔ tablo düğmesi iki görseli seçim bölmesiyle gizleyip gösteren yer imleridir.',
      render: a => { const q = kkQuery(a); if (!q.c.length) return { cats: [], html: empty('Bu seçimde satış yok') }; const f = fmOf(q.m); return { cats: q.c, html: a.V.table(['Kategori'].concat(KANAL, ['Toplam', 'GY\'ye göre']), q.c.map((k, i) => [k].concat(q.g[i], [q.t.rows[i].vals[0], ratio(q.t.rows[i].vals[0], q.t.rows[i].vals[1])])), { fmts: [null, f, f, f, f, 'yuzde'], cf: { 1: 'heat', 2: 'heat', 3: 'heat', 5: 'icon' }, cfTarget: 0, sel: a.sel(q.c, 'Kategoriler', 'Kategori'), compact: true }) }; } },
    { id: 'kdumb', span: 5, title: a => a.prmLabel('olcu') + ': geçen yıl → ' + a.yearLabel, titleHint: '<ölçü>: geçen yıl → <yıl>', type: 'Dambıl (özel görsel)', wells: { 'Kategori': 'Kategoriler[Kategori]', 'Başlangıç': 'Ölçü GY', 'Bitiş': 'Ölçü (alan parametresi)' }, measures: PMS, format: ['Gri nokta: geçen yıl, renkli nokta: bu dönem', 'Çizgi rengi: artış yeşil, azalış kırmızı'],
      why: 'İki dönem arasındaki farkı mesafe olarak gösterir; çubuk çiftlerinden daha az mürekkeple aynı karşılaştırmayı yapar.',
      render: a => { const q = kkQuery(a); const rows = q.t.rows.filter(x => isN(x.vals[0]) && isN(x.vals[1])).map(x => ({ cat: x.keys[0], a: x.vals[1], b: x.vals[0] })); return rows.length ? a.V.dumbbell(rows, { aLabel: 'Geçen yıl', bLabel: a.yearLabel, fmt: fmOf(q.m) }) : empty('Karşılaştırılacak geçen yıl verisi yok (satışlar 22.06.2022\'de başlar).'); } },
    { id: 'kalan', span: 6, title: 'Kanal karışımı aylara göre (%100)', type: '%100 yığılmış alan grafik', wells: { 'X ekseni': 'Tarih[YilAy]', 'Y ekseni': 'Ölçü (alan parametresi)', 'Gösterge': 'Satislar[Kanal]' }, measures: PMS, format: ['%100 yığılmış', 'Kanal renkleri raporun tamamında sabit'],
      why: 'Kanalların payı zaman içinde nasıl kayıyor? %100 alan, toplam büyüklükten bağımsız olarak karışım değişimini gösterir.',
      render: a => { const m = a.prm('olcu'); const r = a.Q(['Tarih[YilAy]', 'Satislar[Kanal]'], [m], { totals: false }); const ms = [...new Set(r.rows.map(x => x.keys[0]))].sort(); if (ms.length < 2) return empty('Eğilim için en az iki ay gerekir.'); const g = grid2(r, ms, KANAL, 0); return a.V.area({ cats: ms, series: KANAL.map((k, j) => ({ name: k, vals: g.map(row => row[j]) })), fmt: fmOf(m) }, { pct: true }); } },
    { id: 'kvar', span: 6, title: a => 'Kanal büyümesi · ' + a.prmLabel('olcu') + ' (geçen yıla göre %)', titleHint: 'Kanal büyümesi · <ölçü>', type: 'Sapma çubukları (IBCS)', wells: { 'Kategori': 'Satislar[Kanal]', 'Gerçekleşen (AC)': 'Ölçü', 'Karşılaştırma (PY)': 'Ölçü GY' }, measures: PMS, format: ['Artış yeşil, azalış kırmızı', 'Orta çizgi: geçen yıl = 0'],
      why: 'IBCS gösterimi: yalnızca fark çizilir, işaret rengi iyi/kötüyü söyler. Kanalların büyüme hızı bir bakışta sıralanır.',
      render: a => { const m = a.prm('olcu'); const r = a.Q(['Satislar[Kanal]'], [m, 'Ölçü GY'], { totals: false, extraMeasures: { 'Ölçü GY': GYX(m) } }); const rows = KANAL.map(k => { const x = r.rows.find(z => z.keys[0] === k); return { cat: k, ac: x ? x.vals[0] : null, ref: x ? x.vals[1] : null }; }).filter(x => isN(x.ac)); return rows.some(x => isN(x.ref)) ? a.V.variance(rows, { fmt: fmOf(m), refLabel: 'GY', mode: 'pct' }) : empty('Geçen yıl verisi yok.'); } },
    { id: 'kmult', span: 12, title: a => a.prmLabel('olcu') + ': kategorilerin aylık seyri (aynı ölçek)', titleHint: '<ölçü>: kategorilerin aylık seyri', type: 'Küçük katlar (çizgi grafik)', wells: { 'X ekseni': 'Tarih[YilAy]', 'Y ekseni': 'Ölçü (alan parametresi)', 'Küçük katlar': 'Kategoriler[Kategori]' }, measures: PMS, format: ['Küçük katlar: 4 sütun', 'Y ekseni tüm panellerde ortak'],
      why: 'Yedi çizgiyi tek grafiğe koymak “spagetti” yapar. Küçük katlar her kategoriye ayrı panel verir; ortak ölçek büyüklük karşılaştırmasını korur.',
      render: a => { const m = a.prm('olcu'); const r = a.Q(['Kategoriler[Kategori]', 'Tarih[YilAy]'], [m], { totals: false }); const ks = sortBy(a.Q(['Kategoriler[Kategori]'], [m], { totals: false }), 0).rows.filter(x => isN(x.vals[0])).map(x => x.keys[0]); const ms = [...new Set(r.rows.map(x => x.keys[1]))].sort(); if (!ks.length) return empty('Bu seçimde satış yok'); const g = grid2(r, ks, ms, 0); return a.V.multiples({ panels: ks.map((k, i) => ({ title: k, vals: g[i] })), fmt: fmOf(m) }, { totLabel: 'Dönem toplamı' }); } }
  ];

  /* sayfa 3: Kârlılık */
  const KISA = { 'Personel': 'Personel', 'Kira ve tesis': 'Kira', 'Pazarlama ve reklam': 'Pazarlama', 'Lojistik ve kargo': 'Lojistik', 'Teknoloji': 'Teknoloji', 'Genel yönetim': 'Yönetim' };
  const giderQ = a => a.Q(['GiderTurleri[GiderTuru]'], ['Gider', 'Gider GY'], { totals: false, extraMeasures: { 'Gider GY': GYX('Gider') } }).rows.filter(x => isN(x.vals[0])).map(x => ({ keys: x.keys, vals: x.vals.map(v => isN(v) ? Math.round(v) : v) }));
  const karPage = [
    pnav('nav3', PG),
    kc('kb', 3, 'Brüt kâr', { 'Değer': '[Brüt Kâr]', 'Referans': 'Brüt kâr GY' }, ['Brüt Kâr', 'Kâr Marjı %'], 'Satıştan maliyet düşülünce kalan; büyümesi satış büyümesinden yavaşsa marj eriyor demektir.',
      a => { const v = a.M('[Brüt Kâr]'); return { v, fmt: 'para', delta: ratio(v, a.M(GYX('Brüt Kâr'))), dlabel: 'geçen yıla göre', icon: '₺', spark: col(a.Q(['Tarih[YilAy]'], ['Brüt Kâr'], { totals: false }), 0) }; }),
    kc('km', 3, 'Brüt kâr marjı', { 'Değer': '[Kâr Marjı %]', 'Referans': 'Marj GY (puan farkı)' }, ['Kâr Marjı %'], 'Oranlarda fark yüzde değil puan olarak verilir: %38\'den %40\'a çıkış “+2 puan”dır.',
      a => { const v = a.M('[Kâr Marjı %]'), g = a.M(GYX('Kâr Marjı %')); return { v, fmt: 'yuzde', delta: isN(v) && isN(g) ? v - g : null, deltaFmt: 'pp', dlabel: 'geçen yıla göre', icon: '%', spark: col(a.Q(['Tarih[YilAy]'], ['Kâr Marjı %'], { totals: false }), 0) }; }),
    kc('kf', 3, 'Faaliyet kârı', { 'Değer': '[Faaliyet Kârı]', 'Referans': 'Faaliyet kârı GY' }, ['Faaliyet Kârı', 'Faaliyet Kâr Marjı %', 'Gider'], 'Brüt kârdan faaliyet giderleri (personel, kira, pazarlama…) düşülünce kalan; şirketin asıl kazancı.',
      a => { const v = a.M('[Faaliyet Kârı]'); return { v, fmt: 'para', delta: ratio(v, a.M(GYX('Faaliyet Kârı'))), dlabel: 'geçen yıla göre', icon: '◆', sub: 'Faaliyet kâr marjı ' + a.fmt(a.M('[Faaliyet Kâr Marjı %]'), 'yuzde') }; }),
    kc('kg', 3, 'Gider / satış', { 'Değer': '[Gider / Satış %]', 'Referans': 'GY (puan, düşük iyi)' }, ['Gider / Satış %', 'Gider'], 'Her 100 ₺ satışın kaç lirası faaliyet giderine gidiyor? Düşmesi iyidir; bu yüzden rozet ters renklenir.',
      a => { const v = a.M('[Gider / Satış %]'), g = a.M(GYX('Gider / Satış %')); return { v, fmt: 'yuzde', delta: isN(v) && isN(g) ? v - g : null, deltaFmt: 'pp', invert: true, dlabel: 'geçen yıla göre', icon: '↧', sub: 'Toplam gider ' + a.fmt(a.M('[Gider]'), 'para', true) }; }),
    { id: 'kopru', span: 7, title: a => 'Net satıştan faaliyet kârına · ' + a.yearLabel, titleHint: 'Net satıştan faaliyet kârına · <yıl>', type: 'Şelale', wells: { 'Kategori': 'Kalem (SMM + GiderTurleri[GiderTuru])', 'Y ekseni': '[Net Satış], −[Net Maliyet], −[Gider]' }, measures: ['Net Satış', 'Net Maliyet', 'Gider', 'Faaliyet Kârı'], format: ['Başlangıç ve bitiş toplam olarak işaretli', 'Azalış kırmızı'],
      why: 'Kâr köprüsü: satıştan başlayıp her maliyet kalemini düşerek faaliyet kârına varır. En büyük kesintinin hangi kalem olduğu hemen görülür. Giderler kanal ve segmentle ilişkili değildir; o dilimleyiciler yalnızca satış ve maliyeti değiştirir.',
      render: a => { const ns = a.M('[Net Satış]'), nm = a.M('[Net Maliyet]'); if (!isN(ns)) return empty('Bu seçimde satış yok'); const g = giderQ(a); return a.V.waterfall({ cats: ['SMM'].concat(g.map(x => KISA[x.keys[0]] || x.keys[0])), series: [{ name: 'Tutar', vals: [-(nm || 0)].concat(g.map(x => -x.vals[0])) }], fmt: 'para' }, { start: ns, startLabel: 'Net satış', endLabel: 'Faaliyet kârı' }); } },
    { id: 'kmarj', span: 5, title: 'Kategorilere göre kâr marjı', type: 'Kümelenmiş çubuk', cross: 'Kategoriler[Kategori]', thru: 'katdetay', tip: katTip, wells: { 'Y ekseni': 'Kategoriler[Kategori]', 'X ekseni': '[Kâr Marjı %]', 'Araç ipuçları': 'Rapor sayfası: “Kategori ipucu”' }, measures: ['Kâr Marjı %', 'Brüt Kâr'], format: ['Değere göre azalan', 'Analiz: ortalama çizgisi', 'Sağ tık → Detaya git'],
      why: 'Marj sıralaması “hangi kategori çok satıyor ama az kazandırıyor?” sorusunun yarısıdır; diğer yarısı için üzerine gel: araç ipucu satış ve büyümeyi gösterir.',
      render: a => { const r = sortBy(a.Q(['Kategoriler[Kategori]'], ['Kâr Marjı %', 'Brüt Kâr'], { except: XK, totals: false }), 0); r.rows = r.rows.filter(x => isN(x.vals[0])); const c = cats(r); return { cats: c, html: a.V.bar({ cats: c, series: [{ name: 'Kâr marjı', vals: col(r, 0) }], fmt: 'yuzde' }, { grid: false, lines: [{ type: 'avg' }], sel: a.sel(c, 'Kategoriler', 'Kategori'), tipx: a.tipx('Kategoriler[Kategori]', c) }) }; } },
    { id: 'pnl', span: 12, title: 'Gelir tablosu: bu dönem ve geçen yıl', type: 'Matris (gelir tablosu)', wells: { 'Satırlar': 'Gelir tablosu kalemleri (ayrı tablo + SWITCH ölçüsü)', 'Değerler': 'Gerçekleşen, GY, Δ, Δ%' }, measures: ['Net Satış', 'Net Maliyet', 'Brüt Kâr', 'Gider', 'Faaliyet Kârı'], format: ['Alt toplam satırları kalın', 'Maliyet satırlarında artış kırmızı (ters renk)', 'Sapma sütununda mini çubuk'],
      why: 'Finansçının alışık olduğu biçim: kalemler, alt toplamlar ve sapma. Maliyet satırlarında artış kötüdür; renk kuralı bu yüzden satır türüne göre çevrilir.',
      render: a => { const M2 = m => [a.M('[' + m + ']'), a.M(GYX(m))]; const [ns, nsG] = M2('Net Satış'), [nm, nmG] = M2('Net Maliyet'), [bk, bkG] = M2('Brüt Kâr'), [gt, gtG] = M2('Gider'), [fk, fkG] = M2('Faaliyet Kârı'); if (!isN(ns)) return empty('Bu seçimde satış yok');
        const rows = [{ label: 'Net satış', ac: ns, ref: nsG }, { label: 'Satılan malın maliyeti', ac: nm, ref: nmG, level: 1, cost: true }, { label: 'Brüt kâr', ac: bk, ref: bkG, kind: 'sub' }].concat(giderQ(a).map(x => ({ label: x.keys[0], ac: x.vals[0], ref: x.vals[1], level: 1, cost: true })), [{ label: 'Faaliyet giderleri', ac: gt, ref: gtG, kind: 'sub', cost: true }, { label: 'Faaliyet kârı', ac: fk, ref: fkG, kind: 'total' }]);
        return a.V.pnl(rows, { fmt: 'para', short: true, acLabel: a.yearLabel, refLabel: 'GY', head: 'Kalem' }); } },
    { id: 'kmtrend', span: 5, title: 'Aylık brüt kâr marjı ve geçen yıl', type: 'Çizgi grafik', wells: { 'X ekseni': 'Tarih[Ay] / Tarih[YilAy]', 'Y ekseni': '[Kâr Marjı %], Marj GY' }, measures: ['Kâr Marjı %'], format: ['Y ekseni: otomatik başlangıç (oranlarda 0 şart değil)', 'Geçen yıl kesik gri'],
      why: 'Marj oran olduğu için ekseni sıfırdan başlatmak değişimi gizler; burada eksen otomatik ve kırık işaretli.',
      render: a => { const r = a.Q([a.timeAxis], ['Kâr Marjı %', 'Marj GY'], { totals: false, extraMeasures: { 'Marj GY': GYX('Kâr Marjı %') } }); return r.rows.length ? a.V.line({ cats: cats(r), series: [{ name: 'Kâr marjı', vals: col(r, 0) }, { name: 'Geçen yıl', vals: col(r, 1), dash: true, color: 'var(--axis)', width: 1.5 }], fmt: 'yuzde' }, { legend: 'top', yMin: 'auto', markers: true }) : empty('Bu seçimde satış yok'); } },
    { id: 'kurun', span: 7, title: 'En çok kâr bırakan ürünler', type: 'Tablo', wells: { 'Sütunlar': 'Urunler[Urun], Urunler[Kategori], [Net Satış], [Brüt Kâr], [Kâr Marjı %], kâr payı' }, measures: ['Net Satış', 'Brüt Kâr', 'Kâr Marjı %'], format: ['Görsel filtresi: İlk 8 (Brüt Kâr)', 'Brüt kâr: veri çubukları', 'Marj: simge (ortalamanın altı ▼)'],
      why: 'Kâr listesi satış listesinden farklıdır: yüksek marjlı orta satıcılar burada yukarı çıkar.',
      render: a => { const r = sortBy(a.Q(['Urunler[Urun]', 'Urunler[Kategori]'], ['Net Satış', 'Brüt Kâr', 'Kâr Marjı %'], { totals: false }), 1); const tot = a.M('[Brüt Kâr]') || 1, mj = a.M('[Kâr Marjı %]'); const rows = r.rows.filter(x => isN(x.vals[1])).slice(0, 8); return rows.length ? a.V.table(['Ürün', 'Kategori', 'Net Satış', 'Brüt Kâr', 'Marj', 'Kâr payı'], rows.map(x => x.keys.concat(x.vals, [x.vals[1] / tot])), { fmts: [null, null, 'para', 'para', 'yuzde', 'yuzde'], cf: { 3: 'bar', 4: 'icon' }, cfTarget: mj, compact: true }) : empty('Bu seçimde satış yok'); } }
  ];

  /* gizli detay sayfası: Kategori detayı */
  const detay = [
    header('kdh', a => '<h2>' + a.esc(a.thruVal()) + ' · kategori detayı</h2><p>' + a.esc(a.yearLabel) + ' · Bu sayfa sekmelerde görünmez; kategori görsellerinde sağ tık → <b>Detaya git</b> ile açılır. Sayfadaki her görsel bu kategoriye filtrelidir.</p>'),
    kc('kd1', 3, 'Net satış', { 'Değer': '[Net Satış]', 'Referans': '[Satış GY]' }, ['Net Satış', 'Satış GY', 'YoY %'], 'Detay sayfasının ilk sorusu: bu kategori ne kadar sattı ve büyüyor mu?',
      a => { const v = a.M('[Net Satış]'); return { v, fmt: 'para', delta: a.M('[YoY %]'), dlabel: 'geçen yıla göre', icon: '₺', spark: col(a.Q(['Tarih[YilAy]'], ['Net Satış'], { totals: false }), 0) }; }),
    kc('kd2', 3, 'Hedef gerçekleşme', { 'Değer': '[Hedef Gerçekleşme %]' }, ['Hedef Gerçekleşme %', 'Hedef'], 'Kategori hedefleri Hedefler tablosunda kategori × ay düzeyinde; bu yüzden kategori detayında hedef karşılaştırması anlamlıdır.',
      a => { const v = a.M('[Hedef Gerçekleşme %]'); return { v, fmt: 'yuzde', delta: isN(v) ? v - 1 : null, deltaFmt: 'pp', dlabel: 'hedefe göre', icon: '◎', sub: 'Hedef ' + a.fmt(a.M('[Hedef]'), 'para', true) }; }),
    kc('kd3', 3, 'Kâr marjı', { 'Değer': '[Kâr Marjı %]', 'Referans': 'Marj GY' }, ['Kâr Marjı %'], 'Satış büyürken marj korunuyor mu?',
      a => { const v = a.M('[Kâr Marjı %]'), g = a.M(GYX('Kâr Marjı %')); return { v, fmt: 'yuzde', delta: isN(v) && isN(g) ? v - g : null, deltaFmt: 'pp', dlabel: 'geçen yıla göre', icon: '%' }; }),
    kc('kd4', 3, 'Toplam içindeki pay', { 'Değer': '[Kategori Payı %]' }, ['Kategori Payı %'], 'Kategori payı ALL(Kategoriler) ile hesaplanır; detay sayfasının filtresi paydaya uygulanmaz.',
      a => { const v = a.M('[Kategori Payı %]'); return { v, fmt: 'yuzde', icon: '◔', sub: 'Tüm kategorilerin net satışı içinde' }; }),
    { id: 'kdtrend', span: 8, title: a => a.thruVal() + ': aylık net satış ve hedef', titleHint: '<kategori>: aylık net satış ve hedef', type: 'Sütun ve çizgi grafik', wells: { 'X ekseni': 'Tarih[Ay] / Tarih[YilAy]', 'Sütun y': '[Net Satış]', 'Çizgi y': '[Hedef]' }, measures: ['Net Satış', 'Hedef'], format: ['Hedef: turuncu çizgi', 'Başlık: fx → SELECTEDVALUE(Kategoriler[Kategori])'],
      why: 'Detay sayfasında başlık dinamik: hangi kategoriye bakıldığı başlıktan okunur.',
      render: a => { const r = a.Q([a.timeAxis], ['Net Satış', 'Hedef'], { totals: false }); return r.rows.length ? a.V.column({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }, { name: 'Hedef', type: 'line', vals: col(r, 1), color: 'var(--s2)' }], fmt: 'para' }, { legend: 'top' }) : empty('Bu seçimde satış yok'); } },
    { id: 'kdkanal', span: 4, title: 'Kanal payı', type: 'Halka grafik', wells: { 'Gösterge': 'Satislar[Kanal]', 'Değerler': '[Net Satış]' }, measures: ['Net Satış'], format: ['Ortada toplam'], why: 'Kategori kanal tercihinde genel ortalamadan ayrışıyor mu?',
      render: a => { const r = a.Q(['Satislar[Kanal]'], ['Net Satış'], { totals: false }); return r.rows.length ? a.V.donut({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { legend: 'bottom' }) : empty('Satış yok'); } },
    { id: 'kdurun', span: 12, title: a => a.thruVal() + ' ürünleri', titleHint: '<kategori> ürünleri', type: 'Tablo', wells: { 'Sütunlar': 'Urunler[Urun], [Net Satış], [YoY %], [Kâr Marjı %], [Satılan Adet], [İade Oranı %]' }, measures: ['Net Satış', 'YoY %', 'Kâr Marjı %', 'Satılan Adet', 'İade Oranı %'], format: ['Net satış: veri çubukları', 'YoY: simgeler', 'Toplam satırı açık'],
      why: 'Detay sayfasının sonu her zaman kalem listesidir: kategori yöneticisine “hangi ürün?” sorusunun cevabı.',
      render: a => { const r = sortBy(a.Q(['Urunler[Urun]'], ['Net Satış', 'YoY %', 'Kâr Marjı %', 'Satılan Adet', 'İade Oranı %'], { totals: false }), 0); const rows = r.rows.filter(x => isN(x.vals[0])); return rows.length ? a.V.table(['Ürün', 'Net Satış', 'YoY', 'Marj', 'Adet', 'İade'], rows.map(x => [x.keys[0]].concat(x.vals.slice(0, 4), [x.vals[4] || 0])), { fmts: [null, 'para', 'yuzde', 'yuzde', 'adet', 'yuzde'], cf: { 1: 'bar', 2: 'icon' }, cfTarget: 0, compact: true, total: ['Toplam', a.M('[Net Satış]'), a.M('[YoY %]'), a.M('[Kâr Marjı %]'), a.M('[Satılan Adet]'), a.M('[İade Oranı %]')] }) : empty('Bu kategoride seçili dönemde satış yok'); } }
  ];

  d.pages = [
    { id: 'genel', name: 'Genel bakış', icon: '◧', tiles: d.tiles },
    { id: 'kanal', name: 'Kategori ve kanal', icon: '▤', tiles: kanalPage },
    { id: 'kar', name: 'Kârlılık', icon: '₺', tiles: karPage },
    { id: 'katdetay', name: 'Kategori detayı', hidden: true, thru: { field: 'Kategoriler[Kategori]', label: 'Kategori', def: TOP_KAT }, tiles: detay, note: 'Kaynak: kategori çubukları ve kategori × kanal görselleri' }
  ];
  const SL0 = { yil: [2024], kanal: [], segment: [] };
  d.bookmarks = [
    { id: 'b24', name: '2024 ve geçen yıl', desc: 'Genel bakış, 2024, tüm kanallar: KPI\'lar hedef ve 2023 ile karşılaştırılır', page: 'genel', sl: SL0, pr: { olcu: 'Net Satış' }, vis: { gorunum: 'grafik' } },
    { id: 'b23', name: '2023 kapanışı', desc: 'Aynı sayfa 2023 için: hedef ve 2022 (yarım yıl) ile', page: 'genel', sl: { yil: [2023], kanal: [], segment: [] }, pr: { olcu: 'Net Satış' }, vis: { gorunum: 'grafik' } },
    { id: 'web', name: 'Yalnızca Web', desc: 'Kanal dilimleyicisi Web: tüm sayfalar senkron filtrelenir', page: 'genel', sl: { yil: [2024], kanal: ['Web'], segment: [] }, pr: { olcu: 'Net Satış' }, vis: { gorunum: 'grafik' } },
    { id: 'tablo', name: 'Kâr tablosu görünümü', desc: 'Kategori ve kanal sayfası, ölçü Brüt kâr, grafik yerine tablo (seçim bölmesi)', page: 'kanal', sl: SL0, pr: { olcu: 'Brüt Kâr' }, vis: { gorunum: 'tablo' } }
  ];
  d.build = [
    ['Soru ve kitle', 'Kitle genel müdür ve yönetim kurulu: rapor haftada bir, birkaç dakika açılır. Ana soru “hedefe ve geçen yıla göre neredeyiz?”; izleyen sorular “büyüme hangi kategori ve kanaldan?” ve “kâr nereye gidiyor?”. Her soru bir sayfa oldu.', []],
    ['Veri ve model', 'Satislar ve Hedefler olguları paylaşılan Tarih ve Kategoriler boyutlarına bağlı. Kârlılık sayfası için Giderler (Tarih ve GiderTurleri\'ne bağlı) eklendi. Giderlerin Kanal ya da Segment ile ilişkisi yok; bu dilimleyiciler gideri değiştirmez, bu not şelalenin “neden” metninde yazılı.', []],
    ['Temel ve karşılaştırma ölçüleri', 'İptalleri dışlayan [Net Satış] her şeyin temeli; karşılaştırmalar hedef ve geçen yıl. Oranlarda fark puan olarak gösterilir (Kart (yeni) → Referans etiketi).', ['Net Satış', 'Brüt Kâr', 'Kâr Marjı %', 'Sipariş Sayısı', 'Hedef', 'Hedef Gerçekleşme %', 'Satış GY', 'YoY %']],
    ['Sayfa yapısı', 'Üç görünür sayfa (Genel bakış, Kategori ve kanal, Kârlılık) ve bir gizli detay sayfası. Sayfa adları kısa; her sayfanın üstünde Ekle → Düğmeler → Gezgin → <b>Sayfa gezgini</b> var (gizli sayfalar gezginde otomatik çıkmaz). Dilimleyiciler Görünüm → <b>Dilimleyicileri eşitle</b> ile üç sayfaya bağlandı.', []],
    ['Alan parametresi', 'Modelleme → Yeni parametre → <b>Alanlar</b>: Net Satış, Brüt Kâr, Sipariş Sayısı, Müşteri Sayısı. Power BI şu tabloyu üretir: <code>Ölçü = { ("Net satış", NAMEOF([Net Satış]), 0), ("Brüt kâr", NAMEOF([Brüt Kâr]), 1), ... }</code>. Parametre sütunu görsellerin değer kutusuna konur; dilimleyicisi ölçüyü değiştirir. Kart başlıkları fx → başlık ölçüsü ile seçili ölçünün adını yazar.', ['Net Satış', 'Brüt Kâr', 'Sipariş Sayısı', 'Müşteri Sayısı']],
    ['Detay sayfası (drillthrough)', '“Kategori detayı” sayfasında Görselleştirmeler bölmesinin altındaki <b>Detaya git</b> kutusuna Kategoriler[Kategori] kondu, sayfa sağ tık → <b>Sayfayı gizle</b> ile gizlendi. Power BI geri düğmesini kendisi ekler. Kaynak görsellerde (kategori çubuğu, kategori × kanal, marj sıralaması) bir öğeye sağ tık → Detaya git.', ['Kategori Payı %']],
    ['Araç ipucu sayfaları', 'Yeni sayfa → Sayfa bilgileri → <b>Araç ipucu olarak kullan</b>, Tuval ayarları → Tür: Araç ipucu (320×240). Üzerine kartlar, mini çizgi ve küçük bir çubuk kondu. Kaynak görselde Biçim → Genel → Araç ipuçları → Tür: <b>Rapor sayfası</b>. Üç ipucu sayfası var: Kategori, Kanal ve Ay.', []],
    ['Yer imleri ve seçim bölmesi', 'Grafik ve tablo aynı konuma üst üste kondu; Görünüm → <b>Seçim</b> bölmesinde “Grafik” ve “Tablo” gruplarına ayrıldı. Görünüm → <b>Yer imleri</b>: her görünüm için yer imi eklendi (Tablo yer iminde grafik grubu gizli). “Yalnızca Web” gibi filtre yer imlerinde <b>Veri</b> seçeneği açık, görünüm yer imlerinde kapalı. Grafik/Tablo düğmeleri: Ekle → Düğme → Eylem → Tür: Yer imi.', []],
    ['Kârlılık görselleri', 'Şelale (Net satış → SMM → gider kalemleri → Faaliyet kârı) ve gelir tablosu matrisi. Gelir tablosu için satırlarda ayrı bir “Kalem” tablosu ve SWITCH ile değer döndüren bir ölçü kullanılır; alt toplam satırları biçimden kalın yapılır.', ['Net Maliyet', 'Gider', 'Faaliyet Kârı', 'Faaliyet Kâr Marjı %', 'Gider / Satış %']],
    ['Düzen ve biçim', 'Her sayfada Z deseni: gezgin → KPI şeridi → eğilim/karşılaştırma → kalem listesi. Tek vurgu rengi, geçen yıl gri ve kesik; sapmalarda yeşil/kırmızı yalnızca işaret için.', []],
    ['Yayın', 'Uygulamanın ilk raporu; yöneticilere Pazartesi 08:00 aboneliği. Telefon düzeni (Görünüm → Mobil) ayrıca kuruldu: gezgin ve KPI kartları önce gelir.', []]
  ];
})();

/* ═════════════════════════ 2. Satış Trendleri ═════════════════════════ */
(function () {
  const d = find('zaman'); if (!d) return;
  const T = id => d.tiles.find(t => t.id === id);
  d.group = 'Satış ve müşteri';
  d.vis = { gorunum: 'grafik' };
  d.params = { olcu: { label: 'Zaman görünümü', opts: [['Net Satış', 'Aylık'], ['3 Ay Hareketli Ort.', '3 ay ort.'], ['Satış YTD', 'Yılbaşından bugüne'], ['Kümülatif Satış', 'Kümülatif']], def: 'Net Satış' } };
  const PG = [['genel', 'Genel bakış', '◧'], ['mevsim', 'Mevsimsellik', '☼'], ['tahmin', 'Tahmin', '↗']];
  const lastYr = a => { const v = a.slicerVals('yilMulti'); return v.length ? Math.max(...v) : 2024; };
  const XYA = [['Tarih', 'YilAy']];
  const aylik = a => memo(a, 'z-aylik', null, () => a.Q(['Tarih[YilAy]'], ['Net Satış'], { totals: false }).rows.filter(x => isN(x.vals[0])));

  /* sayfa 1 iyileştirmeleri */
  const sr = T('seri'); sr.title = a => 'Aylık net satış · ' + a.yearLabel + ': hareketli ortalama, eğilim ve tahmin'; sr.titleHint = 'Aylık net satış · <yıllar>: hareketli ortalama, eğilim ve tahmin';
  sr.tip = tipMonth; sr.wells['Araç ipuçları'] = 'Rapor sayfası: “Ay ipucu”';
  sr.render = a => { const r = a.Q(['Tarih[YilAy]'], ['Net Satış', '3 Ay Hareketli Ort.']); const i0 = r.rows.findIndex(x => x.vals[0] != null); const rows = r.rows.slice(Math.max(0, i0)); const c = rows.map(x => x.keys[0]); return a.V.line({ cats: c, series: [{ name: 'Net Satış', vals: rows.map(x => x.vals[0]), width: 1.3, color: 'var(--s1)' }, { name: '3 ay hareketli ort.', vals: rows.map(x => x.vals[1]), width: 3, color: 'var(--s2)' }], fmt: 'para' }, { legend: 'top', lines: [{ type: 'trend' }], forecast: 3, H: 260, tipx: a.tipx('Tarih[YilAy]', c) }); };
  const mc = T('momcol'); mc.cross = 'Tarih[YilAy]'; mc.thru = 'aydetay'; mc.tip = tipMonth; mc.wells['Detaya git'] = 'Ay detayı sayfası'; mc.wells['Araç ipuçları'] = 'Rapor sayfası: “Ay ipucu”';
  mc.why += ' Bir aya tıklayınca sayfa o aya filtrelenir; sağ tık → Detaya git “Ay detayı”nı açar.';
  mc.render = a => { const r = a.Q(['Tarih[YilAy]'], ['MoM %'], { except: XYA }); const rows = r.rows.filter(x => isN(x.vals[0])).slice(-12); const c = rows.map(x => x.keys[0]); return { cats: c, html: a.V.column({ cats: c.map(k => String(k).slice(2)), series: [{ name: 'MoM %', vals: rows.map(x => x.vals[0]) }], fmt: 'yuzde' }, { colorMode: 'sign', sel: a.sel(c, 'Tarih', 'YilAy'), tipx: a.tipx('Tarih[YilAy]', c) }) }; };
  d.tiles.unshift(pnav('nav1', PG));

  /* sayfa 2: Mevsimsellik */
  const endeks = a => memo(a, 'z-endeks', { except: [['Tarih', 'Yil']] }, () => a.Q(['Tarih[Ay]'], ['Mevsim Endeksi'], { except: [['Tarih', 'Yil']], totals: false }).rows.filter(x => isN(x.vals[0])));
  const gunQ = a => memo(a, 'z-gun', null, () => { const r = a.Q(['Tarih[HaftaninGunu]'], ['Günlük Ortalama'], { totals: false, extraMeasures: { 'Günlük Ortalama': 'DIVIDE([Net Satış], COUNTROWS(FILTER(Tarih, Tarih[Tarih] >= DATE(2022, 6, 22))))' } }); return GUNLER.map(g => { const x = r.rows.find(z => z.keys[0] === g); return [g, x ? x.vals[0] : null]; }); });
  const tipAy = (a, add, cat) => { const r = a.Q(['Tarih[Yil]'], ['Net Satış'], { add, totals: false }); const idx = a.M('[Mevsim Endeksi]', { add, except: [['Tarih', 'Yil']] }); return { title: 'Ay ipucu · ' + cat, cards: r.rows.filter(x => isN(x.vals[0])).map(x => [String(x.keys[0]), a.fmt(x.vals[0], 'para', true)]).concat([['Mevsim endeksi', isN(idx) ? idx.toFixed(2).replace('.', ',') : '—']]), note: 'Endeks 1 = ortalama ay (2023–2024 aylık seri)' }; };
  const yilAy = a => { const r = a.Q(['Tarih[Yil]', 'Tarih[Ay]'], ['Net Satış'], { totals: false }); const ys = [...new Set(r.rows.map(x => x.keys[0]))].sort(); return { ys, g: grid2(r, ys, MON, 0) }; };
  const mevsimPage = [
    pnav('nav2', PG),
    kc('mg1', 3, 'En güçlü ay', { 'Değer': 'MAXX(VALUES(Tarih[Ay]), [Mevsim Endeksi])' }, ['Mevsim Endeksi'], 'Mevsim endeksi 1\'in üstündeki ay ortalamadan güçlüdür; en güçlü ay stok ve kampanya takviminin çapasıdır.',
      a => { const e = endeks(a).slice().sort((x, y) => y.vals[0] - x.vals[0])[0]; return e ? { v: e.vals[0], fmt: null, icon: '▲', sub: MONL[MON.indexOf(e.keys[0])] + ': ortalama ayın ' + e.vals[0].toFixed(2).replace('.', ',') + ' katı' } : null; }),
    kc('mg2', 3, 'En zayıf ay', { 'Değer': 'MINX(VALUES(Tarih[Ay]), [Mevsim Endeksi])' }, ['Mevsim Endeksi'], 'Zayıf ay, bakım, envanter sayımı ve indirimsiz dönemler için uygun zamandır.',
      a => { const e = endeks(a).slice().sort((x, y) => x.vals[0] - y.vals[0])[0]; return e ? { v: e.vals[0], fmt: null, icon: '▼', sub: MONL[MON.indexOf(e.keys[0])] + ': ortalama ayın ' + e.vals[0].toFixed(2).replace('.', ',') + ' katı' } : null; }),
    kc('mg3', 3, 'Hafta sonu payı', { 'Değer': 'DIVIDE(CALCULATE([Net Satış], Tarih[HaftaSonu] = "Evet"), [Net Satış])' }, ['Net Satış'], 'Hafta sonları takvimin 2/7\'sidir (%28,6). Pay bunun üstündeyse satış hafta sonuna yığılıyor demektir.',
      a => { const t = a.M('[Net Satış]'), w = a.M('[Net Satış]', { add: [{ t: 'Tarih', c: 'HaftaSonu', values: ['Evet'] }] }); const v = isN(t) && t ? (w || 0) / t : null; return { v, fmt: 'yuzde', delta: isN(v) ? v - 2 / 7 : null, deltaFmt: 'pp', dlabel: 'takvim payına göre', icon: '☀' }; }),
    kc('mg4', 3, 'En yoğun gün', { 'Değer': 'Günlük ortalama net satış (en yüksek gün)' }, ['Net Satış'], 'Haftanın hangi günü kasada daha çok para var? Vardiya ve kampanya e-postası zamanlaması için.',
      a => { const g = gunQ(a).filter(x => isN(x[1])).sort((x, y) => y[1] - x[1])[0]; return g ? { v: g[1], fmt: 'para', icon: '◷', sub: g[0] + ' · günlük ortalama' } : null; }),
    { id: 'takvim', span: 12, title: a => 'Günlük net satış takvimi · ' + lastYr(a), titleHint: 'Günlük net satış takvimi · <son seçili yıl>', type: 'Takvim ısı haritası (özel görsel)', wells: { 'Tarih': 'Tarih[Tarih]', 'Değer': '[Net Satış]' }, measures: ['Net Satış'], format: ['Hücre: gün, satır: haftanın günü, sütun: hafta', 'Tek renk skalası, satış olmayan gün boş', 'Çok yıl seçiliyse son yıl gösterilir'],
      why: 'Yılın 365 gününü tek bakışta gösterir: kampanya günleri, bayram boşlukları ve hafta içi/sonu deseni aynı anda görünür. Aylık toplamın sakladığı gün etkisini ortaya çıkarır.',
      render: a => { const y = lastYr(a); const r = a.Q(['Tarih[Tarih]'], ['Net Satış'], { add: [{ t: 'Tarih', c: 'Yil', values: [y] }], totals: false, keepBlank: true }); const days = r.rows.filter(x => x.keys[0] instanceof Date).map(x => ({ date: x.keys[0], v: x.vals[0] })).sort((p, q) => p.date - q.date); return days.some(x => isN(x.v)) ? a.V.calendar({ days, fmt: 'para' }, { vlabel: 'Net satış' }) : empty(y + ' yılında satış yok'); } },
    { id: 'yillar', span: 7, vis: 'gorunum:grafik', title: 'Yıl yıl aylık seyir', type: 'Çizgi grafik', tip: tipAy, wells: { 'X ekseni': 'Tarih[Ay] (AyNo\'ya göre sıralı)', 'Y ekseni': '[Net Satış]', 'Gösterge': 'Tarih[Yil]', 'Araç ipuçları': 'Rapor sayfası: “Ay karşılaştırma”' }, measures: ['Net Satış', 'Mevsim Endeksi'], format: ['Son yıl kalın, önceki yıllar ince', 'İşaretçiler açık', 'Seçim bölmesi: “Grafik” grubu'],
      why: 'Mevsimselliğin klasik okuması: yıllar üst üste bindirilir; eğriler aynı şekli tekrarlıyorsa desen mevsimseldir, yukarı kayıyorsa büyüme vardır.',
      render: a => { const q = yilAy(a); if (!q.ys.length) return empty('Bu seçimde satış yok'); return a.V.line({ cats: MON, series: q.ys.map((y, i) => ({ name: String(y), vals: q.g[i], width: i === q.ys.length - 1 ? 3 : 1.5 })), fmt: 'para' }, { legend: 'top', markers: true, tipx: a.tipx('Tarih[Ay]', MON) }); } },
    { id: 'yillarT', span: 7, vis: 'gorunum:tablo', title: 'Yıl yıl aylık tablo', type: 'Matris', wells: { 'Satırlar': 'Tarih[Ay]', 'Sütunlar': 'Tarih[Yil]', 'Değerler': '[Net Satış], [YoY %]' }, measures: ['Net Satış', 'YoY %'], format: ['Son sütun: son iki yıl arası değişim (simge)', 'Seçim bölmesi: “Tablo” grubu'],
      why: 'Aynı bilginin kesin rakamlı hâli; yer imi düğmesiyle grafikle yer değiştirir.',
      render: a => { const q = yilAy(a); if (!q.ys.length) return empty('Bu seçimde satış yok'); const n = q.ys.length; return a.V.table(['Ay'].concat(q.ys.map(String), n > 1 ? ['Son yıl değişim'] : []), MON.map((m, i) => [m].concat(q.g.map(r => r[i]), n > 1 ? [ratio(q.g[n - 1][i], q.g[n - 2][i])] : [])), { fmts: [null].concat(q.ys.map(() => 'para'), ['yuzde']), cf: n > 1 ? { [n + 1]: 'icon' } : {}, cfTarget: 0, compact: true, total: ['Toplam'].concat(q.g.map(r => sum(r)), n > 1 ? [ratio(sum(q.g[n - 1]), sum(q.g[n - 2]))] : []) }); } },
    { id: 'gun', span: 5, title: 'Günlere göre günlük ortalama', type: 'Sütun grafik', tip: tipSales('Kategoriler[Kategori]', 'Kategori kırılımı'), wells: { 'X ekseni': 'Tarih[HaftaninGunu] (GunNo\'ya göre sıralı)', 'Y ekseni': 'Günlük Ortalama (görsel ölçüsü)', 'Araç ipuçları': 'Rapor sayfası: “Gün ipucu”' }, measures: ['Net Satış'], format: ['Renk: en yüksek gün vurgulu, diğerleri gri', 'Veri etiketleri açık'],
      why: 'Toplam yerine günlük ortalama: her gün türünden kaç tane olduğu değişse de karşılaştırma adil olur. Payda, satışların başladığı 22.06.2022\'den sonraki takvim günleridir.',
      render: a => { const g = gunQ(a); if (!g.some(x => isN(x[1]))) return empty('Bu seçimde satış yok'); return a.V.column({ cats: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'], series: [{ name: 'Günlük ortalama', vals: g.map(x => x[1]) }], fmt: 'para' }, { colorMode: 'highlight', labels: true, tipx: a.tipx('Tarih[HaftaninGunu]', g.map(x => x[0])) }); } },
    { id: 'katmult', span: 12, title: 'Kategorilerin mevsim deseni (aynı ölçek)', type: 'Küçük katlar (sütun)', wells: { 'X ekseni': 'Tarih[Ay]', 'Y ekseni': '[Net Satış]', 'Küçük katlar': 'Kategoriler[Kategori]' }, measures: ['Net Satış'], format: ['Küçük katlar: 4 sütun', 'Ortak Y ekseni'],
      why: 'Toplam mevsimsellik kategorilerin deseninin ortalamasıdır. Küçük katlar hangi kategorinin hangi ayda zirve yaptığını ayrı ayrı gösterir.',
      render: a => { const r = a.Q(['Kategoriler[Kategori]', 'Tarih[Ay]'], ['Net Satış'], { totals: false }); const ks = sortBy(a.Q(['Kategoriler[Kategori]'], ['Net Satış'], { totals: false }), 0).rows.filter(x => isN(x.vals[0])).map(x => x.keys[0]); if (!ks.length) return empty('Bu seçimde satış yok'); const g = grid2(r, ks, MON, 0); return a.V.multiples({ panels: ks.map((k, i) => ({ title: k, vals: g[i] })), fmt: 'para' }, { kind: 'column', totLabel: 'Dönem toplamı' }); } }
  ];

  /* sayfa 3: Tahmin */
  const fc = a => memo(a, 'z-fc', null, () => { const s = aylik(a).map(x => x.vals[0]); const f = linfit(s); if (!f) return null; const n = s.length; const next = [1, 2, 3].map(k => f.a + f.b * (n - 1 + k)); const tr = linfit(s.slice(0, -3)); const mape = tr ? avg(s.slice(-3).map((v, k) => Math.abs(v - (tr.a + tr.b * (n - 3 + k))) / v)) : null; return { f, s, n, next, mape }; });
  const tahminPage = [
    pnav('nav3', PG),
    kc('t1', 3, '3 aylık tahmin', { 'Değer': 'Doğrusal eğilimle 3 aylık toplam' }, ['Net Satış', 'Eğilim Çizgisi'], 'Analiz bölmesindeki tahminin sayı hâli. Basit doğrusal eğilimdir; mevsimselliği hesaba katmaz, yön göstergesi olarak okunmalı.',
      a => { const q = fc(a); return q ? { v: sum(q.next), fmt: 'para', icon: '↗', delta: ratio(sum(q.next), sum(q.s.slice(-3))), dlabel: 'son 3 aya göre', sub: '%95 aralık: ay başına ±' + a.fmt(1.96 * q.f.se, 'para', true) } : null; }),
    kc('t2', 3, 'Eğilim eğimi', { 'Değer': 'En küçük kareler eğimi (ayda ₺)' }, ['Eğilim Çizgisi'], 'İşin ayda ortalama ne kadar büyüdüğü; dalgalanmadan bağımsızdır.',
      a => { const q = fc(a); return q ? { v: q.f.b, fmt: 'para', icon: '∠', sub: 'Aylık ortalama satışın %' + Math.round(q.f.b / (avg(q.s) || 1) * 100) + ' kadarı' } : null; }),
    kc('t3', 3, 'Son 3 ay', { 'Değer': 'Son 3 ayın net satışı', 'Referans': 'Önceki 3 ay' }, ['Net Satış', 'Satış QTD'], 'Eğilimin en taze kanıtı: son çeyreklik dilim bir öncekinden iyi mi?',
      a => { const s = aylik(a).map(x => x.vals[0]); if (s.length < 3) return null; const l3 = sum(s.slice(-3)), p3 = s.length >= 6 ? sum(s.slice(-6, -3)) : null; return { v: l3, fmt: 'para', icon: '◷', delta: ratio(l3, p3), dlabel: 'önceki 3 aya göre', spark: s.slice(-12) }; }),
    kc('t4', 3, 'Tahmin hatası', { 'Değer': 'MAPE: son 3 ay, önceki aylarla kurulan eğilime göre' }, ['Net Satış'], 'Tahmine ne kadar güvenebiliriz? Model son 3 ay saklanarak kurulur ve o aylar tahmin edilir; ortalama mutlak yüzde hata küçükse tahmin işe yarar.',
      a => { const q = fc(a); return q && isN(q.mape) ? { v: q.mape, fmt: 'yuzde', icon: '±', sub: 'MAPE · son 3 ay geriye dönük test' } : null; }),
    { id: 'ana', span: 12, title: a => a.prmLabel('olcu') + ' · ' + a.yearLabel + (['Net Satış', '3 Ay Hareketli Ort.'].includes(a.prm('olcu')) ? ' ve 6 aylık tahmin' : ''), titleHint: '<zaman görünümü> · <yıllar> ve tahmin', type: 'Çizgi grafik + Analiz (tahmin)', tip: tipMonth, wells: { 'X ekseni': 'Tarih[YilAy]', 'Y ekseni': 'Zaman görünümü (alan parametresi)', 'Araç ipuçları': 'Rapor sayfası: “Ay ipucu”' }, measures: ['Net Satış', '3 Ay Hareketli Ort.', 'Satış YTD', 'Kümülatif Satış'], format: ['Analiz → Tahmin: 6 ay, %95 güven aralığı (yalnızca aylık ve hareketli ortalamada)', 'Alan grafiği gölgesi açık'],
      why: 'Alan parametresi aynı eksende dört zaman görünümünü değiştirir: aylık değer, hareketli ortalama, YTD ve kümülatif. Tahmin yalnızca birikimsiz serilerde anlamlı olduğu için diğerlerinde kapanır.',
      render: a => { const m = a.prm('olcu'); const r = a.Q(['Tarih[YilAy]'], [m], { totals: false }); const rows = r.rows.filter(x => isN(x.vals[0])); if (rows.length < 2) return empty('Eğilim için en az iki ay gerekir.'); const c = rows.map(x => x.keys[0]); return a.V.line({ cats: c, series: [{ name: a.prmLabel('olcu'), vals: rows.map(x => x.vals[0]) }], fmt: 'para' }, { forecast: ['Net Satış', '3 Ay Hareketli Ort.'].includes(m) ? 6 : 0, area: true, H: 260, legend: 'top', tipx: a.tipx('Tarih[YilAy]', c) }); } },
    { id: 'ytdc', span: 6, title: a => 'Yılbaşından bugüne: ' + lastYr(a) + ' ve ' + (lastYr(a) - 1), titleHint: 'Yılbaşından bugüne: <yıl> ve <yıl−1>', type: 'Çizgi grafik', wells: { 'X ekseni': 'Tarih[Ay]', 'Y ekseni': '[Satış YTD], [Satış GY YTD]', 'Görsel filtresi': 'Tarih[Yil] = son seçili yıl' }, measures: ['Satış YTD', 'Satış GY YTD'], format: ['Geçen yıl kesik gri', 'Veri etiketi: yalnızca son nokta'],
      why: 'Birikimli karşılaştırma dalgalanmayı söndürür: iki eğri arasındaki açıklık yıl içinde kapanıyor mu, açılıyor mu?',
      render: a => { const y = lastYr(a); const r = a.Q(['Tarih[Ay]'], ['Satış YTD', 'Satış GY YTD'], { add: [{ t: 'Tarih', c: 'Yil', values: [y] }], totals: false }); const g = MON.map(m => r.rows.find(x => x.keys[0] === m)); return g.some(x => x && isN(x.vals[0])) ? a.V.line({ cats: MON, series: [{ name: String(y), vals: g.map(x => x ? x.vals[0] : null) }, { name: String(y - 1), vals: g.map(x => x ? x.vals[1] : null), dash: true, color: 'var(--axis)', width: 1.5 }], fmt: 'para' }, { legend: 'top' }) : empty(y + ' için veri yok'); } },
    { id: 'avar', span: 6, title: a => 'Aylık büyüme · ' + lastYr(a) + ' / ' + (lastYr(a) - 1), titleHint: 'Aylık büyüme · <yıl> / <yıl−1>', type: 'Sapma çubukları (IBCS)', wells: { 'Kategori': 'Tarih[Ay]', 'Gerçekleşen (AC)': '[Net Satış]', 'Karşılaştırma (PY)': '[Satış GY]' }, measures: ['Net Satış', 'Satış GY', 'YoY %'], format: ['Fark %: geçen yıla göre', 'Pozitif yeşil, negatif kırmızı'],
      why: 'Her ayın geçen yılın aynı ayına göre büyümesi: eğilim çizgisinin ortalamasını hangi ayların taşıdığını gösterir.',
      render: a => { const y = lastYr(a); const r = a.Q(['Tarih[Ay]'], ['Net Satış', 'Satış GY'], { add: [{ t: 'Tarih', c: 'Yil', values: [y] }], totals: false }); const rows = MON.map(m => { const x = r.rows.find(z => z.keys[0] === m); return { cat: m, ac: x ? x.vals[0] : null, ref: x ? x.vals[1] : null }; }).filter(x => isN(x.ac) && isN(x.ref)); return rows.length ? a.V.variance(rows, { fmt: 'para', refLabel: 'GY', mode: 'pct' }) : empty('Geçen yılın aynı ayları yok (satışlar 22.06.2022\'de başlar).'); } },
    { id: 'son6', span: 12, title: 'Son 6 ay', type: 'Tablo', cross: 'Tarih[YilAy]', thru: 'aydetay', wells: { 'Sütunlar': 'Tarih[YilAy], [Net Satış], [Satış GY], [YoY %], [MoM %], [3 Ay Hareketli Ort.]', 'Görsel filtresi': 'Tarih[YilAy]: son 6' }, measures: ['Net Satış', 'Satış GY', 'YoY %', 'MoM %', '3 Ay Hareketli Ort.'], format: ['YoY ve MoM: simgeler', 'Satıra sağ tık → Detaya git: Ay detayı'],
      why: 'Grafiklerin kesin rakamları. Bir satıra tıklayıp “Detaya git” ile o ayın gün, kategori ve ürün kırılımına inilir.',
      render: a => { const r = a.Q(['Tarih[YilAy]'], ['Net Satış', 'Satış GY', 'YoY %', 'MoM %', '3 Ay Hareketli Ort.'], { except: XYA, totals: false }); const rows = r.rows.filter(x => isN(x.vals[0])).slice(-6).reverse(); const c = rows.map(x => x.keys[0]); return { cats: c, html: a.V.table(['Ay', 'Net Satış', 'Geçen yıl', 'YoY', 'MoM', '3 ay ort.'], rows.map(x => [ymLabel(x.keys[0])].concat(x.vals)), { fmts: [null, 'para', 'para', 'yuzde', 'yuzde', 'para'], cf: { 1: 'bar', 3: 'icon', 4: 'icon' }, cfTarget: 0, sel: a.sel(c, 'Tarih', 'YilAy'), compact: true }) }; } }
  ];

  /* gizli detay sayfası: Ay detayı */
  const detay = [
    header('adh', a => '<h2>' + a.esc(ymLabel(a.thruVal())) + ' · ay detayı</h2><p>Aylık grafiklerde bir aya sağ tık → <b>Detaya git</b>. Kanal dilimleyicisi bu sayfada da geçerlidir (senkron dilimleyici).</p>'),
    kc('ad1', 3, 'Net satış', { 'Değer': '[Net Satış]', 'Referans': '[Satış GY]' }, ['Net Satış', 'Satış GY'], 'Ayın büyüklüğü ve geçen yılın aynı ayına göre değişimi.',
      a => { const v = a.M('[Net Satış]'); return { v, fmt: 'para', icon: '₺', delta: ratio(v, a.M('[Satış GY]')), dlabel: 'geçen yılın aynı ayına göre' }; }),
    kc('ad2', 3, 'Sipariş', { 'Değer': '[Sipariş Sayısı]', 'Referans': 'Önceki ay' }, ['Sipariş Sayısı'], 'Satış değişimi sipariş sayısından mı, sepet büyüklüğünden mi geliyor? İki kart birlikte okunur.',
      a => { const v = a.M('[Sipariş Sayısı]'); return { v, fmt: 'adet', icon: '▤', delta: ratio(v, a.M('CALCULATE([Sipariş Sayısı], PREVIOUSMONTH(Tarih[Tarih]))')), dlabel: 'önceki aya göre' }; }),
    kc('ad3', 3, 'Ortalama sepet', { 'Değer': '[Ortalama Sepet]', 'Referans': 'GY' }, ['Ortalama Sepet'], 'Sepet büyüklüğü fiyat ve ürün karışımını yansıtır.',
      a => { const v = a.M('[Ortalama Sepet]'); return { v, fmt: 'para', icon: '◫', delta: ratio(v, a.M(GYX('Ortalama Sepet'))), dlabel: 'geçen yıla göre' }; }),
    kc('ad4', 3, 'Alışveriş yapan müşteri', { 'Değer': '[Müşteri Sayısı]' }, ['Müşteri Sayısı', 'Yeni Müşteri (Küme)'], 'Ayın müşteri tabanı ve içindeki yeni müşteriler.',
      a => { const v = a.M('[Müşteri Sayısı]'); return { v, fmt: 'adet', icon: '☺', sub: 'Yeni müşteri: ' + a.fmt(a.M('[Yeni Müşteri (Küme)]') || 0, 'adet') }; }),
    { id: 'adgun', span: 8, title: a => ymLabel(a.thruVal()) + ': günlük net satış', titleHint: '<ay>: günlük net satış', type: 'Sütun grafik', wells: { 'X ekseni': 'Tarih[Gun]', 'Y ekseni': '[Net Satış]' }, measures: ['Net Satış'], format: ['Analiz: ortalama çizgisi', 'Boş günler gösterilir (Veri olmayan öğeleri göster)'],
      why: 'Aylık toplamın içindeki gün dağılımı: tek bir kampanya günü mü ayı taşıdı, yoksa satış aya yayılmış mı?',
      render: a => { const r = a.Q(['Tarih[Gun]'], ['Net Satış'], { totals: false, keepBlank: true }); return r.rows.length ? a.V.column({ cats: r.rows.map(x => String(x.keys[0])), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { lines: [{ type: 'avg' }] }) : empty('Bu ayda satış yok'); } },
    { id: 'adkanal', span: 4, title: 'Kanal payı', type: 'Halka grafik', wells: { 'Gösterge': 'Satislar[Kanal]', 'Değerler': '[Net Satış]' }, measures: ['Net Satış'], format: ['Ortada toplam'], why: 'Ay içinde kanal karışımı yılın geneliyle aynı mı?',
      render: a => { const r = a.Q(['Satislar[Kanal]'], ['Net Satış'], { totals: false }); return r.rows.length ? a.V.donut({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { legend: 'bottom' }) : empty('Satış yok'); } },
    { id: 'adkat', span: 6, title: 'Kategoriler (geçen yılın aynı ayına göre)', type: 'Kümelenmiş çubuk', wells: { 'Y ekseni': 'Kategoriler[Kategori]', 'X ekseni': '[Net Satış]', 'Etiket': '[YoY %]' }, measures: ['Net Satış', 'YoY %'], format: ['Veri etiketi: değer + YoY simgesi'], why: 'Ayın büyümesini hangi kategori taşıdı?',
      render: a => { const r = sortBy(a.Q(['Kategoriler[Kategori]'], ['Net Satış', 'YoY %'], { totals: false }), 0); r.rows = r.rows.filter(x => isN(x.vals[0])); return r.rows.length ? a.V.bar({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { grid: false, labelFn: (i, v) => a.fmt(v, 'para', true) + (isN(r.rows[i].vals[1]) ? '  ' + (r.rows[i].vals[1] >= 0 ? '▲' : '▼') + sgn(r.rows[i].vals[1], 0).slice(1) : '') }) : empty('Satış yok'); } },
    { id: 'adurun', span: 6, title: 'Ayın en çok satan ürünleri', type: 'Tablo', wells: { 'Sütunlar': 'Urunler[Urun], [Net Satış], [Satılan Adet], [Kâr Marjı %]', 'Görsel filtresi': 'İlk 8' }, measures: ['Net Satış', 'Satılan Adet', 'Kâr Marjı %'], format: ['Net satış: veri çubukları'], why: 'Detay sayfasının kalem listesi.',
      render: a => { const r = sortBy(a.Q(['Urunler[Urun]'], ['Net Satış', 'Satılan Adet', 'Kâr Marjı %'], { totals: false }), 0); const rows = r.rows.filter(x => isN(x.vals[0])).slice(0, 8); return rows.length ? a.V.table(['Ürün', 'Net Satış', 'Adet', 'Marj'], rows.map(x => [x.keys[0]].concat(x.vals)), { fmts: [null, 'para', 'adet', 'yuzde'], cf: { 1: 'bar' }, compact: true }) : empty('Satış yok'); } }
  ];

  d.pages = [
    { id: 'genel', name: 'Genel bakış', icon: '◧', tiles: d.tiles },
    { id: 'mevsim', name: 'Mevsimsellik', icon: '☼', tiles: mevsimPage },
    { id: 'tahmin', name: 'Tahmin', icon: '↗', tiles: tahminPage },
    { id: 'aydetay', name: 'Ay detayı', hidden: true, thru: { field: 'Tarih[YilAy]', label: 'Ay', def: '2024-12' }, tiles: detay, note: 'Kaynak: “Önceki aya göre değişim” ve “Son 6 ay”' }
  ];
  d.bookmarks = [
    { id: 'y24', name: 'Yalnızca 2024', desc: 'Yıl dilimleyicisi 2024: eksenler ay adına döner', page: 'genel', sl: { yilMulti: [2024], kanal: [] }, pr: { olcu: 'Net Satış' }, vis: { gorunum: 'grafik' } },
    { id: 'web', name: 'Yalnızca Web', desc: '2023–2024, Web kanalı: tüm sayfalarda geçerli', page: 'genel', sl: { yilMulti: [2023, 2024], kanal: ['Web'] }, pr: { olcu: 'Net Satış' }, vis: { gorunum: 'grafik' } },
    { id: 'ytd', name: 'YTD görünümü', desc: 'Tahmin sayfası, zaman görünümü YTD', page: 'tahmin', sl: { yilMulti: [2023, 2024], kanal: [] }, pr: { olcu: 'Satış YTD' }, vis: { gorunum: 'grafik' } },
    { id: 'tablo', name: 'Mevsim tablosu', desc: 'Mevsimsellik sayfası, yıl yıl seyir tablo olarak', page: 'mevsim', sl: { yilMulti: [2022, 2023, 2024], kanal: [] }, pr: { olcu: 'Net Satış' }, vis: { gorunum: 'tablo' } }
  ];
  d.build = [
    ['Soru ve kitle', 'Analistler için keşif raporu. Genel bakış “nasıl gidiyor?”, Mevsimsellik “hangi ay ve gün güçlü?”, Tahmin “önümüzdeki aylar ne getirir, bu tahmine güvenebilir miyiz?” sorularını cevaplar.', []],
    ['Tarih tablosu', 'Tüm zaman hesapları işaretli Tarih tablosuna dayanır. Ay → AyNo, HaftaninGunu → GunNo ile sıralanır. Çok yıllı seçimde eksen YilAy, tek yılda Ay olur. Takvim ısı haritası için Tarih[Tarih] günlük düzeyde kullanılır.', []],
    ['Zaman ölçüleri', 'YTD, geçen yıl YTD, önceki ay, hareketli ortalama ve kümülatif; hepsi [Net Satış] üzerine kurulu.', ['Satış YTD', 'Satış GY YTD', 'Satış GA', 'MoM %', '3 Ay Hareketli Ort.', 'Kümülatif Satış']],
    ['İstatistik ölçüleri', 'Eğilim ve mevsimsellik DAX ile hesaplanır. Günlük ortalama görsel düzeyinde: <code>DIVIDE([Net Satış], COUNTROWS(FILTER(Tarih, Tarih[Tarih] >= DATE(2022, 6, 22))))</code> — payda satışların başladığı günden sonraki takvim günleri.', ['Eğilim Çizgisi', 'Mevsim Endeksi']],
    ['Sayfa yapısı', 'Üç görünür sayfa + gizli “Ay detayı”. Her sayfanın üstünde Ekle → Düğmeler → Gezgin → <b>Sayfa gezgini</b>. Yıl ve kanal dilimleyicileri Görünüm → <b>Dilimleyicileri eşitle</b> ile tüm sayfalara bağlı; Ay detayında da geçerli.', []],
    ['Alan parametresi: zaman görünümü', 'Modelleme → Yeni parametre → Alanlar: Net Satış, 3 Ay Hareketli Ort., Satış YTD, Kümülatif Satış. Ana grafiğin Y eksenine parametre sütunu konur. Tahmin (Analiz bölmesi) yalnızca birikimsiz serilerde açılır; Power BI\'da bunun için iki görsel ve yer imi ya da başlıkta açıklama kullanılır.', ['Net Satış', '3 Ay Hareketli Ort.', 'Satış YTD', 'Kümülatif Satış']],
    ['Detay sayfası', '“Ay detayı” sayfasının Detaya git kutusuna Tarih[YilAy] kondu ve sayfa gizlendi. “Önceki aya göre değişim” sütunlarında ve “Son 6 ay” tablosunda satıra sağ tık → Detaya git. Başlık ve metin kutusu dinamik: fx → SELECTEDVALUE(Tarih[YilAy]).', []],
    ['Araç ipucu sayfaları', 'İki ipucu sayfası (Sayfa bilgileri → Araç ipucu olarak kullan): “Ay ipucu” (net satış, GY, kategori çubukları) ana seride ve aylık değişimde; “Ay karşılaştırma” (her yılın o ayı + mevsim endeksi) yıl yıl seyirde. Kaynak görselde Araç ipuçları → Tür: Rapor sayfası.', []],
    ['Takvim ve küçük katlar', 'Takvim ısı haritası AppSource özel görseli ya da matris + koşullu biçimle yapılır. Küçük katlar: sütun grafiğinde <b>Küçük katlar</b> kutusuna Kategoriler[Kategori]; Biçim → Küçük katlar → Düzen: 4 sütun, Y ekseni ortak.', []],
    ['Yer imleri ve seçim bölmesi', 'Yıl yıl seyir grafiği ve tablosu üst üste; Seçim bölmesinde “Grafik/Tablo” grupları. Görünüm → Yer imleri: “Mevsim tablosu” (Veri + Görüntü), “YTD görünümü” (parametre seçimini yakalar), “Yalnızca 2024/Web” (dilimleyici durumunu yakalar). Düğmeler: Eylem → Yer imi.', []],
    ['Etkileşim', 'Yıl → Çeyrek → Ay hiyerarşisinde detaya inme; aylık değişim sütununa tıklamak sayfayı aya filtreler. Yıl dilimleyicisi çoklu seçime izin verir (Ctrl ile).', []]
  ];
})();

/* ═════════════════════════ 3. Ürün ve Kategori ═════════════════════════ */
(function () {
  const d = find('urun'); if (!d) return;
  const T = id => d.tiles.find(t => t.id === id);
  d.group = 'Satış ve müşteri';
  d.vis = { gorunum: 'grafik' };
  d.params = {
    olcu: { label: 'Ölçü', opts: [['Net Satış', 'Net satış'], ['Brüt Kâr', 'Brüt kâr'], ['Satılan Adet', 'Adet'], ['Kâr Marjı %', 'Kâr marjı']], def: 'Net Satış' },
    eksen: { label: 'Kırılım (eksen)', opts: [['Kategoriler[Kategori]', 'Kategori'], ['Satislar[Kanal]', 'Kanal'], ['Musteriler[Segment]', 'Segment'], ['Musteriler[YasGrubu]', 'Yaş grubu']], def: 'Kategoriler[Kategori]' }
  };
  const PG = [['genel', 'Genel bakış', '◧'], ['abc', 'Pareto / ABC', '▚'], ['karsilastir', 'Ürün karşılaştırma', '⇄']];
  const XU = [['Urunler', 'Urun']];
  const PMS = ['Net Satış', 'Brüt Kâr', 'Satılan Adet', 'Kâr Marjı %'];
  const additive = m => m !== 'Kâr Marjı %';

  /* sayfa 1 iyileştirmeleri */
  const tb = T('tablo'); tb.thru = 'urundetay'; tb.wells['Detaya git'] = 'Ürün detayı sayfası';
  tb.title = a => 'Ürün ayrıntısı · ' + a.yearLabel + (a.slicerVals('kategori').length ? ' · ' + a.slicerVals('kategori').join(', ') : ''); tb.titleHint = 'Ürün ayrıntısı · <yıl> · <kategori>';
  tb.why += ' Satıra sağ tık → Detaya git ile “Ürün detayı” açılır.';
  const lf = T('lfl'); lf.tip = tipSales('Urunler[Urun]', 'En çok satan ürünler'); lf.wells['Araç ipuçları'] = 'Rapor sayfası: “Kategori ipucu”';
  lf.render = a => { const r = a.Q(['Kategoriler[Kategori]'], ['YoY %', 'LFL Büyüme %']); const c = cats(r); return a.V.bar({ cats: c, series: [{ name: 'Toplam (YoY)', vals: col(r, 0) }, { name: 'LFL', vals: col(r, 1) }], fmt: 'yuzde' }, { legend: 'top', grid: false, tipx: a.tipx('Kategoriler[Kategori]', c) }); };
  d.tiles.unshift(pnav('nav1', PG));

  /* sayfa 2: Pareto / ABC */
  const abcQ = a => memo(a, 'u-abc', { except: XU }, () => { const r = sortBy(a.Q(['Urunler[Urun]'], ['Net Satış', 'ABC Sınıfı', 'Satılan Adet', 'Kâr Marjı %'], { except: XU, totals: false }), 0); return r.rows.filter(x => isN(x.vals[0])).map(x => ({ u: x.keys[0], k: (URN[x.keys[0]] || {}).Kategori, v: x.vals[0], cls: x.vals[1], adet: x.vals[2], mj: x.vals[3] })); });
  const xyzQ = a => memo(a, 'u-xyz', { except: XU }, () => { const ms = a.Q(['Tarih[YilAy]'], ['Net Satış'], { except: XU, totals: false }).rows.filter(x => isN(x.vals[0])).map(x => x.keys[0]); const r = a.Q(['Urunler[Urun]', 'Tarih[YilAy]'], ['Satılan Adet'], { except: XU, totals: false }); const by = {}; r.rows.forEach(x => { (by[x.keys[0]] = by[x.keys[0]] || {})[x.keys[1]] = x.vals[0] || 0; }); const out = {}; Object.keys(by).forEach(u => { const v = ms.map(m => by[u][m] || 0); const mu = avg(v); const sd = Math.sqrt(avg(v.map(x => (x - mu) * (x - mu)))); const cv = mu ? sd / mu : null; out[u] = cv == null ? 'Z' : cv <= 0.5 ? 'X' : cv <= 1 ? 'Y' : 'Z'; }); return { out, n: ms.length }; });
  const clsCard = (id, k, why) => kc(id, 3, k + ' sınıfı ürünler', { 'Değer': 'COUNTROWS(FILTER(VALUES(Urunler[Urun]), [ABC Sınıfı] = "' + k + '"))' }, ['ABC Sınıfı', 'Net Satış'], why,
    a => { const L = abcQ(a); if (!L.length) return null; const g = L.filter(x => x.cls === k); const tot = sum(L.map(x => x.v)); return { v: g.length, fmt: 'adet', icon: k, sub: 'Satış payı: %' + Math.round(sum(g.map(x => x.v)) / (tot || 1) * 100) + ' · ' + L.length + ' ürün içinde' }; });
  const abcPage = [
    pnav('nav2', PG),
    clsCard('ca', 'A', 'Satışın ilk %70\'ini getiren ürünler: stokta bitmemeli, fiyatı yakından izlenmeli.'),
    clsCard('cb', 'B', 'Orta grup: kampanya ve çapraz satışla A\'ya taşınabilecek ürünler.'),
    clsCard('cc', 'C', 'Uzun kuyruk: raf yeri, stok maliyeti ve ürün gamı açısından gözden geçirilecek ürünler.'),
    kc('c80', 3, 'Satışın %80\'i', { 'Değer': 'COUNTROWS(FILTER(VALUES(Urunler[Urun]), [Kümülatif Pay %] <= 0,8)) + 1' }, ['Kümülatif Pay %'], 'Pareto kuralının sayısı: satışın %80\'i kaç üründen geliyor? Ürün sayısına oranı ne kadar küçükse yoğunlaşma o kadar yüksek.',
      a => { const L = abcQ(a); if (!L.length) return null; const tot = sum(L.map(x => x.v)); let acc = 0, n = 0; for (const x of L) { acc += x.v; n++; if (acc >= 0.8 * tot) break; } return { v: n, fmt: 'adet', icon: '⅘', sub: 'ürün · toplam ' + L.length + ' ürünün %' + Math.round(n / L.length * 100) + ' kadarı' }; }),
    { id: 'abctree', span: 7, title: 'Ürünler ABC sınıfına göre', type: 'Ağaç haritası', cross: 'Urunler[Urun]', thru: 'urundetay', tip: tipUrun, wells: { 'Kategori': 'ABC sınıfı (hesaplanmış tablo/ölçü ile grup)', 'Ayrıntılar': 'Urunler[Urun]', 'Değerler': '[Net Satış]', 'Araç ipuçları': 'Rapor sayfası: “Ürün ipucu”' }, measures: ['Net Satış', 'ABC Sınıfı'], format: ['Renk: sınıf (A koyu, C açık)', 'Veri etiketleri: ürün adı + değer', 'Sağ tık → Detaya git: Ürün detayı'],
      why: 'Ağaç haritası parça-bütün ilişkisini alanla gösterir: A sınıfının birkaç büyük kutusu ile C\'nin çok sayıda küçük kutusu Pareto\'yu sezgisel kılar.',
      render: a => { const L = abcQ(a); if (!L.length) return { cats: [], html: empty('Bu seçimde satış yok') }; const c = L.map(x => x.u); return { cats: c, html: a.V.treemap({ cats: c, groups: L.map(x => (x.cls || '?') + ' sınıfı'), series: [{ name: 'Net Satış', vals: L.map(x => x.v) }], fmt: 'para' }, { sel: a.sel(c, 'Urunler', 'Urun'), tipx: a.tipx('Urunler[Urun]', c), H: 280 }) }; } },
    { id: 'xyz', span: 5, title: 'ABC × XYZ: değer ve talep düzenliliği', type: 'Matris (renk skalası)', wells: { 'Satırlar': 'ABC sınıfı ([Net Satış] payı)', 'Sütunlar': 'XYZ sınıfı (aylık adet serisinin değişkenlik katsayısı)', 'Değerler': 'Ürün sayısı' }, measures: ['ABC Sınıfı', 'Satılan Adet'], format: ['Koşullu biçim: arka plan', 'X: CV ≤ 0,5 · Y: ≤ 1 · Z: > 1'],
      why: 'ABC değeri, XYZ talebin ne kadar düzenli olduğunu söyler. AX ürünler otomatik sipariş için idealdir; AZ ürünler değerli ama öngörülemez: güvenlik stoku ister.',
      render: a => { const L = abcQ(a); const q = xyzQ(a); if (!L.length) return empty('Bu seçimde satış yok'); const k = ['X', 'Y', 'Z']; const rows = ['A', 'B', 'C'].map(c => [c].concat(k.map(z => L.filter(x => x.cls === c && q.out[x.u] === z).length || ''), [sum(L.filter(x => x.cls === c).map(x => x.v))])); return a.V.table(['Sınıf', 'X (düzenli)', 'Y (dalgalı)', 'Z (düzensiz)', 'Satış'], rows, { fmts: [null, 'adet', 'adet', 'adet', 'para'], cf: { 1: 'heat', 2: 'heat', 3: 'heat' }, short: true }) + '<div class="tsub">Değişkenlik ' + q.n + ' aylık satılan adet serisinden hesaplandı (satış olmayan ay = 0).</div>'; } },
    { id: 'katabc', span: 6, title: 'Kategorilerin ABC karışımı', type: 'Yığılmış çubuk', tip: tipSales('Urunler[Urun]', 'En çok satan ürünler'), wells: { 'Y ekseni': 'Urunler[Kategori]', 'X ekseni': '[Net Satış]', 'Gösterge': 'ABC sınıfı', 'Araç ipuçları': 'Rapor sayfası: “Kategori ipucu”' }, measures: ['Net Satış', 'ABC Sınıfı'], format: ['Seri sırası A, B, C', 'Gösterge üstte'],
      why: 'Hangi kategorinin satışı birkaç yıldız ürüne, hangisininki uzun kuyruğa dayanıyor? Kuyruğu kalın kategori, ürün gamı sadeleştirmesinin adayıdır.',
      render: a => { const L = abcQ(a); if (!L.length) return empty('Bu seçimde satış yok'); const ks = [...new Set(L.map(x => x.k))].sort((p, q) => sum(L.filter(x => x.k === q).map(x => x.v)) - sum(L.filter(x => x.k === p).map(x => x.v))); return a.V.bar({ cats: ks, series: ['A', 'B', 'C'].map(c => ({ name: c + ' sınıfı', vals: ks.map(k => sum(L.filter(x => x.k === k && x.cls === c).map(x => x.v)) || null) })), fmt: 'para' }, { stacked: true, legend: 'top', grid: false, tipx: a.tipx('Kategoriler[Kategori]', ks) }); } },
    { id: 'kuyruk', span: 6, title: 'Uzun kuyruk: C sınıfı ürünler', type: 'Tablo', cross: 'Urunler[Urun]', thru: 'urundetay', wells: { 'Sütunlar': 'Urunler[Urun], Urunler[Kategori], [Net Satış], [Satılan Adet], [Kâr Marjı %], Urunler[Stok]', 'Görsel filtresi': '[ABC Sınıfı] = "C"' }, measures: ['Net Satış', 'Satılan Adet', 'Kâr Marjı %', 'ABC Sınıfı'], format: ['Ölçüye görsel filtresi', 'Stok: ıraksak renk değil, düz sayı', 'Sağ tık → Detaya git'],
      why: 'Gözden geçirme listesi: az satan ama stokta bekleyen ürünler. Satıra tıklayınca sayfa o ürüne filtrelenir; sağ tıkla ürün detayına gidilir.',
      render: a => { const L = abcQ(a).filter(x => x.cls === 'C').slice().sort((p, q) => p.v - q.v); if (!L.length) return { cats: [], html: empty('Bu seçimde C sınıfı ürün yok') }; const c = L.map(x => x.u); return { cats: c, html: a.V.table(['Ürün', 'Kategori', 'Net Satış', 'Adet', 'Marj', 'Stok'], L.map(x => [x.u, x.k, x.v, x.adet, x.mj, (URN[x.u] || {}).Stok]), { fmts: [null, null, 'para', 'adet', 'yuzde', 'adet'], cf: { 2: 'bar' }, sel: a.sel(c, 'Urunler', 'Urun'), compact: true }) }; } }
  ];

  /* sayfa 3: Ürün karşılaştırma (alan parametreleri: ölçü ve eksen) */
  const topQ = (a, n) => { const m = a.prm('olcu'); const r = sortBy(a.Q(['Urunler[Urun]'], [m, 'Ölçü GY', 'Net Satış'], { except: XU, totals: false, extraMeasures: { 'Ölçü GY': GYX(m) } }), 0); r.rows = r.rows.filter(x => isN(x.vals[0]) && isN(x.vals[2])).slice(0, n || 10); return { m, r, c: cats(r) }; };
  const axQ = a => { const m = a.prm('olcu'), ax = a.prm('eksen'); const r = a.Q([ax], [m, 'Ölçü GY'], { totals: false, extraMeasures: { 'Ölçü GY': GYX(m) } }); r.rows = r.rows.filter(x => x.keys[0] != null && isN(x.vals[0])); if (ax === 'Musteriler[YasGrubu]') r.rows.sort((p, q) => String(p.keys[0]).localeCompare(String(q.keys[0]))); else sortBy(r, 0); return { m, ax, r, c: cats(r) }; };
  const tipAx = (a, add, cat) => { const by = add[0] && add[0].t === 'Kategoriler' ? 'Satislar[Kanal]' : 'Kategoriler[Kategori]'; return tipSales(by, by === 'Satislar[Kanal]' ? 'Kanal kırılımı' : 'Kategori kırılımı')(a, add, cat); };
  const karPage = [
    Object.assign(pnav('nav3', PG), { span: 8 }), vnav('gor3', 4),
    { id: 'top10', span: 6, vis: 'gorunum:grafik', title: a => 'İlk 10 ürün · ' + a.prmLabel('olcu'), titleHint: 'İlk 10 ürün · <ölçü>', type: 'Kümelenmiş çubuk', cross: 'Urunler[Urun]', thru: 'urundetay', tip: tipUrun, wells: { 'Y ekseni': 'Urunler[Urun]', 'X ekseni': 'Ölçü (alan parametresi)', 'Görsel filtresi': 'İlk N = 10 (ölçüye göre)', 'Araç ipuçları': 'Rapor sayfası: “Ürün ipucu”' }, measures: PMS, format: ['Başlık: fx → seçili ölçünün adı', 'Değere göre azalan', 'Sağ tık → Detaya git'],
      why: 'Alan parametresiyle aynı görsel dört soruyu cevaplar: en çok satan, en çok kâr bırakan, en çok adet giden ve en yüksek marjlı ürün. Listelerin farkı ürün stratejisini anlatır.',
      render: a => { const q = topQ(a); if (!q.c.length) return { cats: [], html: empty('Bu seçimde satış yok') }; return { cats: q.c, html: a.V.bar({ cats: q.c, series: [{ name: a.prmLabel('olcu'), vals: col(q.r, 0) }], fmt: fmOf(q.m) }, { grid: false, sel: a.sel(q.c, 'Urunler', 'Urun'), tipx: a.tipx('Urunler[Urun]', q.c) }) }; } },
    { id: 'top10T', span: 6, vis: 'gorunum:tablo', title: a => 'İlk 10 ürün tablosu · ' + a.prmLabel('olcu'), titleHint: 'İlk 10 ürün tablosu · <ölçü>', type: 'Tablo', cross: 'Urunler[Urun]', thru: 'urundetay', wells: { 'Sütunlar': 'Urunler[Urun], Ölçü, Ölçü GY, değişim, pay' }, measures: PMS, format: ['Değişim: simgeler', 'Seçim bölmesi: “Tablo” grubu'],
      why: 'Grafikle aynı konumda; yer imi düğmesiyle yer değiştirir.',
      render: a => { const q = topQ(a); if (!q.c.length) return { cats: [], html: empty('Bu seçimde satış yok') }; const f = fmOf(q.m), tot = additive(q.m) ? a.M('[' + q.m + ']', { except: XU }) : null; return { cats: q.c, html: a.V.table(['Ürün', a.prmLabel('olcu'), 'Geçen yıl', 'Değişim'].concat(tot ? ['Pay'] : []), q.r.rows.map(x => [x.keys[0], x.vals[0], x.vals[1], additive(q.m) ? ratio(x.vals[0], x.vals[1]) : (isN(x.vals[1]) ? x.vals[0] - x.vals[1] : null)].concat(tot ? [x.vals[0] / tot] : [])), { fmts: [null, f, f, 'yuzde', 'yuzde'], cf: { 1: 'bar', 3: 'icon' }, cfTarget: 0, sel: a.sel(q.c, 'Urunler', 'Urun'), compact: true }) }; } },
    { id: 'eksen', span: 6, vis: 'gorunum:grafik', title: a => a.prmLabel('olcu') + ' · ' + a.prmLabel('eksen').toLowerCase() + ' kırılımı', titleHint: '<ölçü> · <eksen> kırılımı', type: 'Sütun grafik', tip: tipAx, wells: { 'X ekseni': 'Eksen (alan parametresi)', 'Y ekseni': 'Ölçü (alan parametresi)', 'Araç ipuçları': 'Rapor sayfası: “Kırılım ipucu”' }, measures: PMS, format: ['İki alan parametresi: eksen ve ölçü', 'Yaş grubunda doğal sıra, diğerlerinde değere göre'],
      why: 'Eksen parametresi kullanıcıya “bunu bir de kanala/segmente göre görelim” dedirtir; dört ayrı grafik yerine tek görsel. Sıralama eksene göre akıllıca değişir.',
      render: a => { const q = axQ(a); if (!q.c.length) return empty('Bu seçimde satış yok'); return a.V.column({ cats: q.c.map(String), series: [{ name: a.prmLabel('olcu'), vals: col(q.r, 0) }, { name: 'Geçen yıl', type: 'line', vals: col(q.r, 1), color: 'var(--axis)', dash: true }], fmt: fmOf(q.m) }, { legend: 'top', labels: true, tipx: a.tipx(q.ax, q.c) }); } },
    { id: 'eksenT', span: 6, vis: 'gorunum:tablo', title: a => a.prmLabel('olcu') + ' · ' + a.prmLabel('eksen').toLowerCase() + ' tablosu', titleHint: '<ölçü> · <eksen> tablosu', type: 'Matris', wells: { 'Satırlar': 'Eksen (alan parametresi)', 'Değerler': 'Ölçü, Ölçü GY, değişim' }, measures: PMS, format: ['Değişim: simgeler'],
      why: 'Kırılımın kesin rakamları; grafik ↔ tablo düğmesiyle aynı yerde açılır.',
      render: a => { const q = axQ(a); if (!q.c.length) return empty('Bu seçimde satış yok'); const f = fmOf(q.m); return a.V.table([a.prmLabel('eksen'), a.prmLabel('olcu'), 'Geçen yıl', 'Değişim'], q.r.rows.map(x => [x.keys[0], x.vals[0], x.vals[1], additive(q.m) ? ratio(x.vals[0], x.vals[1]) : (isN(x.vals[1]) ? x.vals[0] - x.vals[1] : null)]), { fmts: [null, f, f, 'yuzde'], cf: { 1: 'bar', 3: 'icon' }, cfTarget: 0, compact: true }); } },
    { id: 'udumb', span: 6, title: a => 'İlk 8 ürün: geçen yıl → bu dönem · ' + a.prmLabel('olcu'), titleHint: 'İlk 8 ürün: geçen yıl → bu dönem · <ölçü>', type: 'Dambıl (özel görsel)', wells: { 'Kategori': 'Urunler[Urun]', 'Başlangıç': 'Ölçü GY', 'Bitiş': 'Ölçü' }, measures: PMS, format: ['Gri: geçen yıl, renkli: bu dönem'],
      why: 'Liste başındaki ürünler zaten büyük mü, yoksa bu yıl mı büyüdü? Dambıl, sıralamayı bozmadan değişimin yönünü ve büyüklüğünü gösterir.',
      render: a => { const q = topQ(a, 8); const rows = q.r.rows.filter(x => isN(x.vals[1])).map(x => ({ cat: x.keys[0], a: x.vals[1], b: x.vals[0] })); return rows.length ? a.V.dumbbell(rows, { aLabel: 'Geçen yıl', bLabel: a.yearLabel, fmt: fmOf(q.m) }) : empty('Geçen yıl verisi yok (satışlar 22.06.2022\'de başlar).'); } },
    { id: 'fiyat', span: 6, title: 'Fiyat ve hacim', type: 'Dağılım grafiği', wells: { 'Değerler': 'Urunler[Urun]', 'X ekseni': '[Ortalama Birim Fiyat]', 'Y ekseni': '[Satılan Adet]', 'Gösterge': 'Urunler[Kategori]' }, measures: ['Ortalama Birim Fiyat', 'Satılan Adet'], format: ['Analiz: X ve Y ortalama çizgileri', 'X ekseni: ₺'],
      why: 'Ucuz ürün çok, pahalı ürün az mı satıyor? Ortalama çizgileri dört bölge çizer: sağ üstteki ürünler hem pahalı hem çok satıyor; sol alttakiler gözden geçirilmeli.',
      render: a => { const r = a.Q(['Urunler[Urun]', 'Urunler[Kategori]'], ['Ortalama Birim Fiyat', 'Satılan Adet'], { totals: false }); const p = r.rows.filter(x => isN(x.vals[0]) && isN(x.vals[1])).map(x => ({ label: x.keys[0], g: x.keys[1], x: x.vals[0], y: x.vals[1] })); return p.length > 1 ? a.V.scatter(p, { xfmt: 'para', yfmt: 'adet', xlabel: 'Ortalama birim fiyat', ylabel: 'Satılan adet', quadrants: true }) : empty('Bu seçimde yeterli ürün yok'); } }
  ];

  /* gizli detay sayfası: Ürün detayı */
  const detay = [
    header('udh', a => { const u = URN[a.thruVal()] || {}; return '<h2>' + a.esc(a.thruVal()) + '</h2><p>' + a.esc(u.Kategori || '') + ' · liste fiyatı ' + a.fmt(u.Fiyat, 'para') + ' · birim maliyet ' + a.fmt(u.BirimMaliyet, 'para') + ' · stok ' + a.fmt(u.Stok, 'adet') + ' adet · ' + a.esc(a.yearLabel) + '</p>'; }),
    kc('ud1', 3, 'Net satış', { 'Değer': '[Net Satış]', 'Referans': '[Satış GY]' }, ['Net Satış', 'YoY %'], 'Ürünün dönem satışı ve büyümesi.',
      a => { const v = a.M('[Net Satış]'); return { v, fmt: 'para', icon: '₺', delta: a.M('[YoY %]'), dlabel: 'geçen yıla göre', spark: col(a.Q(['Tarih[YilAy]'], ['Net Satış'], { totals: false }), 0) }; }),
    kc('ud2', 3, 'Satılan adet', { 'Değer': '[Satılan Adet]', 'Referans': 'Adet GY' }, ['Satılan Adet'], 'Satış artışı fiyattan mı, hacimden mi? Adet kartı net satış kartıyla birlikte okunur.',
      a => { const v = a.M('[Satılan Adet]'); return { v, fmt: 'adet', icon: '#', delta: ratio(v, a.M(GYX('Satılan Adet'))), dlabel: 'geçen yıla göre' }; }),
    kc('ud3', 3, 'Kâr marjı', { 'Değer': '[Kâr Marjı %]', 'Referans': 'Marj GY' }, ['Kâr Marjı %'], 'İndirimler marjı ne kadar yedi?',
      a => { const v = a.M('[Kâr Marjı %]'), g = a.M(GYX('Kâr Marjı %')); return { v, fmt: 'yuzde', icon: '%', delta: isN(v) && isN(g) ? v - g : null, deltaFmt: 'pp', dlabel: 'geçen yıla göre', sub: 'Ortalama indirim ' + a.fmt(a.M('[Ortalama İndirim %]') || 0, 'yuzde') }; }),
    kc('ud4', 3, 'İade oranı', { 'Değer': '[İade Oranı %]' }, ['İade Oranı %', 'İade Tutarı'], 'Yüksek iade oranı ürün açıklamasında ya da kalitede sorun olabileceğini gösterir; düşük olması iyidir.',
      a => { const v = a.M('[İade Oranı %]') || 0; return { v, fmt: 'yuzde', icon: '↺', sub: 'İade tutarı ' + a.fmt(a.M('[İade Tutarı]') || 0, 'para') }; }),
    { id: 'udtrend', span: 8, title: a => a.thruVal() + ': aylık net satış ve geçen yıl', titleHint: '<ürün>: aylık net satış ve geçen yıl', type: 'Çizgi grafik', wells: { 'X ekseni': 'Tarih[Ay] / Tarih[YilAy]', 'Y ekseni': '[Net Satış], [Satış GY]' }, measures: ['Net Satış', 'Satış GY'], format: ['Geçen yıl kesik gri', 'İşaretçiler açık'], why: 'Ürünün yıl içindeki seyri; geçen yılla aynı eksende.',
      render: a => { const r = a.Q([a.timeAxis], ['Net Satış', 'Satış GY'], { totals: false, keepBlank: true }); return r.rows.some(x => isN(x.vals[0])) ? a.V.line({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }, { name: 'Geçen yıl', vals: col(r, 1), dash: true, color: 'var(--axis)', width: 1.5 }], fmt: 'para' }, { legend: 'top', markers: true }) : empty('Bu dönemde satış yok'); } },
    { id: 'udkanal', span: 4, title: 'Kanal payı', type: 'Halka grafik', wells: { 'Gösterge': 'Satislar[Kanal]', 'Değerler': '[Net Satış]' }, measures: ['Net Satış'], format: ['Ortada toplam'], why: 'Ürün hangi kanalda satılıyor? Kanal özel kampanyalar için.',
      render: a => { const r = a.Q(['Satislar[Kanal]'], ['Net Satış'], { totals: false }); return r.rows.length ? a.V.donut({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { legend: 'bottom' }) : empty('Satış yok'); } },
    { id: 'udseg', span: 4, title: 'Müşteri segmenti', type: 'Kümelenmiş çubuk', wells: { 'Y ekseni': 'Musteriler[Segment]', 'X ekseni': '[Net Satış]' }, measures: ['Net Satış'], format: ['Değere göre azalan'], why: 'Ürünü kim alıyor: bireysel mi, kurumsal mı?',
      render: a => { const r = sortBy(a.Q(['Musteriler[Segment]'], ['Net Satış'], { totals: false }), 0); return r.rows.length ? a.V.bar({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { grid: false }) : empty('Satış yok'); } },
    { id: 'udind', span: 4, title: 'İndirim bandına göre', type: 'Sütun grafik', wells: { 'X ekseni': 'Satislar[IndirimBandi]', 'Y ekseni': '[Net Satış]' }, measures: ['Net Satış', 'İndirimli Satış Payı %'], format: ['Eksen sırası: indirimsiz → yüksek indirim'], why: 'Ürün indirimsiz de satılabiliyor mu, yoksa satışların çoğu indirime mi bağlı?',
      render: a => { const r = a.Q(['Satislar[IndirimBandi]'], ['Net Satış'], { totals: false }); const o = ['İndirimsiz', '%5–10', '%15–20']; const v = o.map(k => { const x = r.rows.find(z => z.keys[0] === k); return x ? x.vals[0] : null; }); return v.some(isN) ? a.V.column({ cats: o, series: [{ name: 'Net Satış', vals: v }], fmt: 'para' }, { labels: true }) : empty('Satış yok'); } },
    { id: 'udmus', span: 4, title: 'En çok alan müşteriler', type: 'Tablo', wells: { 'Sütunlar': 'Musteriler[Musteri], [Net Satış], [Sipariş Sayısı]', 'Görsel filtresi': 'İlk 5' }, measures: ['Net Satış', 'Sipariş Sayısı'], format: ['Kompakt'], why: 'Ürünün sadık alıcıları: yeni sürüm ya da tamamlayıcı ürün duyurusu için.',
      render: a => { const r = sortBy(a.Q(['Musteriler[MusteriNo]'], ['Net Satış', 'Sipariş Sayısı'], { totals: false }), 0); const rows = r.rows.filter(x => isN(x.vals[0])).slice(0, 5); return rows.length ? a.V.table(['Müşteri', 'Net Satış', 'Sipariş'], rows.map(x => [musName(x.keys[0])].concat(x.vals)), { fmts: [null, 'para', 'adet'], compact: true }) : empty('Satış yok'); } }
  ];

  d.pages = [
    { id: 'genel', name: 'Genel bakış', icon: '◧', tiles: d.tiles },
    { id: 'abc', name: 'Pareto / ABC', icon: '▚', tiles: abcPage },
    { id: 'karsilastir', name: 'Ürün karşılaştırma', icon: '⇄', tiles: karPage },
    { id: 'urundetay', name: 'Ürün detayı', hidden: true, thru: { field: 'Urunler[Urun]', label: 'Ürün', def: TOP_URUN }, tiles: detay, note: 'Kaynak: ürün tabloları, ağaç haritası ve ilk 10 ürün' }
  ];
  const SL0 = { yil: [2024], kategori: [], topn: [5] };
  d.bookmarks = [
    { id: 'elek', name: 'Yalnızca Elektronik', desc: 'Kategori dilimleyicisi Elektronik: sepet analizi de bu kategoriye göre', page: 'genel', sl: { yil: [2024], kategori: ['Elektronik'], topn: [5] }, pr: { olcu: 'Net Satış', eksen: 'Kategoriler[Kategori]' }, vis: { gorunum: 'grafik' } },
    { id: 'y23', name: '2023 ABC', desc: 'Pareto / ABC sayfası 2023 için: sınıflar yıl seçimine göre yeniden hesaplanır', page: 'abc', sl: { yil: [2023], kategori: [], topn: [5] }, pr: { olcu: 'Net Satış', eksen: 'Kategoriler[Kategori]' }, vis: { gorunum: 'grafik' } },
    { id: 'kar', name: 'Kâra göre, kanal kırılımı', desc: 'Karşılaştırma sayfası: ölçü Brüt kâr, eksen Kanal', page: 'karsilastir', sl: SL0, pr: { olcu: 'Brüt Kâr', eksen: 'Satislar[Kanal]' }, vis: { gorunum: 'grafik' } },
    { id: 'tablo', name: 'Tablo görünümü', desc: 'Karşılaştırma sayfası grafik yerine tablolarla', page: 'karsilastir', sl: SL0, pr: { olcu: 'Net Satış', eksen: 'Kategoriler[Kategori]' }, vis: { gorunum: 'tablo' } }
  ];
  d.build = [
    ['Soru ve kitle', 'Kategori yöneticileri: hangi üründe aksiyon almalıyım? Genel bakış keşif ekranıdır; Pareto / ABC “nereye odaklanmalı, neyi sadeleştirmeli?”, Ürün karşılaştırma “aynı listeyi başka ölçüyle ya da kırılımla görürsem ne değişir?” sorularını cevaplar.', []],
    ['Model hazırlığı', 'Bağlantısız UrunlerVeDiger (Top N + Diğer) ve KarsiUrunler (sepet analizi) tabloları; TopNSecim ne olur parametresi.', []],
    ['Sınıflandırma ölçüleri', 'ABC ve Pareto aynı “benimkinden büyük ya da eşit olanların toplamı” mantığını kullanır. XYZ sınıfı her ürünün aylık adet serisinin değişkenlik katsayısıdır: <code>VAR Seri = ADDCOLUMNS(VALUES(Tarih[YilAy]), "A", [Satılan Adet] + 0) RETURN DIVIDE(STDEVX.P(Seri, [A]), AVERAGEX(Seri, [A]))</code>.', ['Ürün Sırası', 'Kümülatif Pay %', 'ABC Sınıfı', 'Satış (Top N + Diğer)']],
    ['Büyüme ve sepet', 'LFL, her iki yılda da satılan ürün kümesiyle hesaplanır; sepet analizi TREATAS ile sanal ilişki kurar.', ['YoY %', 'LFL Büyüme %', 'Birlikte Alma Oranı %', 'Trend Mini Grafik']],
    ['Sayfa yapısı', 'Üç görünür sayfa + gizli “Ürün detayı”. Sayfa gezgini (Ekle → Düğmeler → Gezgin) her sayfanın üstünde; yıl, kategori ve İlk N dilimleyicileri tüm sayfalara eşitlendi (Görünüm → Dilimleyicileri eşitle).', []],
    ['Alan parametreleri', 'İki parametre: <b>Ölçü</b> (Net Satış, Brüt Kâr, Satılan Adet, Kâr Marjı %) ve <b>Kırılım</b> (Kategori, Kanal, Segment, Yaş grubu). Modelleme → Yeni parametre → Alanlar; eksen parametresi X eksenine, ölçü parametresi Y eksenine konur. Seçili ölçünün geçen yılı için “Zaman zekâsı” hesaplama grubu kullanılır (öğe: <code>CALCULATE(SELECTEDMEASURE(), SAMEPERIODLASTYEAR(Tarih[Tarih]))</code>); böylece her ölçüye ayrı GY ölçüsü yazılmaz.', ['Net Satış', 'Brüt Kâr', 'Satılan Adet', 'Kâr Marjı %']],
    ['Detay sayfası', '“Ürün detayı” sayfasının Detaya git kutusunda Urunler[Urun]; sayfa gizli. Kaynaklar: Ürün ayrıntısı tablosu, ABC ağaç haritası, C sınıfı listesi ve İlk 10 ürün. Başlık bir metin kutusu: ürün adı, kategori, fiyat ve stok Urunler tablosundan SELECTEDVALUE ile gelir.', ['Ortalama İndirim %', 'İade Oranı %', 'İade Tutarı']],
    ['Araç ipucu sayfaları', '“Ürün ipucu” (net satış, marj, adet, iade + aylık mini çizgi) ve “Kategori ipucu” (satış, büyüme, en çok satan ürünler). Sayfa bilgileri → Araç ipucu olarak kullan; kaynak görselde Araç ipuçları → Tür: Rapor sayfası.', []],
    ['Yer imleri ve seçim bölmesi', 'Karşılaştırma sayfasında grafik ve tablolar üst üste; Seçim bölmesinde Grafik/Tablo grupları. Yer imleri: “Tablo görünümü” (yalnızca Görüntü), “Kâra göre, kanal kırılımı” (parametre seçimlerini de yakalar), “Yalnızca Elektronik” ve “2023 ABC” (Veri: dilimleyici durumu).', []],
    ['Düzen ve biçim', 'Z deseni; dağılımda kategori renkleri raporla aynı, “Diğer” her zaman gri; ABC ağaç haritasında renk sınıfı taşır.', []],
    ['Etkileşim', 'Tablo satırına ya da ağaç haritası kutusuna tıklamak sayfayı ürüne filtreler; sağ tık → Detaya git. Sepet analizi için kategori dilimleyicisi tek seçime ayarlanır.', []]
  ];
})();

/* ═════════════════════════ 4. Müşteri Analizi ═════════════════════════ */
/* müşteri detay sayfalarında ortak görseller (musteri ve rfm raporları) */
const SON_ALIM = { 'Son Alım Günü': 'VAR B = MAX(Tarih[Tarih]) VAR S = CALCULATE(MAX(Satislar[Tarih]), Tarih[Tarih] <= B, Satislar[Durum] <> "İptal") RETURN IF(NOT ISBLANK(S), DATEDIFF(S, B, DAY))' };
const musHeader = (id, extra) => header(id, a => { const no = a.thruVal(), m = MUS[no] || {}; return '<h2>' + a.esc(m.Musteri || ('Müşteri ' + no)) + '</h2><p>Müşteri no ' + a.esc(no) + ' · ' + a.esc(m.Segment || '—') + ' · ' + a.esc(m.Sehir || '—') + (m.Bolge ? ' (' + a.esc(m.Bolge) + ')' : '') + ' · yaş grubu ' + a.esc(m.YasGrubu || '—') + ' · kayıt ' + a.fmt(m.KayitTarihi) + (m.IlkSiparis ? ' · ilk sipariş ' + a.fmt(m.IlkSiparis) : '') + '</p>' + (extra ? extra(a, no) : ''); });
const musRank = a => { const no = a.thruVal(); const r = sortBy(a.Q(['Musteriler[MusteriNo]'], ['Net Satış'], { noThru: true, except: [['Musteriler', 'MusteriNo']], totals: false }), 0).rows.filter(x => isN(x.vals[0])); const i = r.findIndex(x => x.keys[0] === no); return i >= 0 ? 'Dönemde ' + r.length + ' müşteri içinde ' + (i + 1) + '. sırada' : 'Seçili dönemde alışveriş yok'; };
const musGecmis = id => ({ id, span: 8, title: 'Tüm alışveriş geçmişi (aylık)', type: 'Sütun grafik', wells: { 'X ekseni': 'Tarih[YilAy]', 'Y ekseni': '[Net Satış]', 'Filtre': 'Tarih filtresi kaldırıldı (bu görselde yıl dilimleyicisi etkileşimi: Yok)' }, measures: ['Net Satış'], format: ['Biçim → Etkileşimleri düzenle: yıl dilimleyicisi → Yok', 'Boş aylar gösterilir'],
  why: 'Müşterinin hikâyesi tek bakışta: düzenli mi alıyor, bir dönem yoğun alıp kayboldu mu? Yıl dilimleyicisi bu görseli etkilemez; geçmişin tamamı görünür.',
  render: a => { const r = a.Q(['Tarih[YilAy]'], ['Net Satış'], { except: [['Tarih', 'Yil']], totals: false, keepBlank: true }); const i0 = r.rows.findIndex(x => isN(x.vals[0])); if (i0 < 0) return empty('Bu müşterinin alışverişi yok'); const rows = r.rows.slice(i0).filter(x => x.keys[0] <= '2024-12'); return a.V.column({ cats: rows.map(x => String(x.keys[0]).slice(2)), series: [{ name: 'Net Satış', vals: rows.map(x => x.vals[0]) }], fmt: 'para' }, {}); } });
const musSiparis = id => ({ id, span: 12, title: 'Son sipariş satırları', type: 'Tablo', wells: { 'Sütunlar': 'Satislar[SiparisNo], Satislar[Tarih], Urunler[Urun], Satislar[Kanal], Satislar[Durum], adet, [Toplam Satış]', 'Görsel filtresi': 'İlk 10 (Tarih azalan)' }, measures: ['Toplam Satış'], format: ['Tarih azalan sıralı', 'İptal satırları da görünür (Durum sütunu)'],
  why: 'Detay sayfasının en altı ham kayıttır: müşteri hizmetleri “son siparişin neydi?” sorusunu buradan cevaplar.',
  render: a => { const r = a.Q(['Satislar[SiparisNo]', 'Satislar[Tarih]', 'Urunler[Urun]', 'Satislar[Kanal]', 'Satislar[Durum]'], ['Adet', 'Toplam Satış'], { totals: false, extraMeasures: { 'Adet': 'SUM(Satislar[Adet])' } }); const rows = r.rows.filter(x => isN(x.vals[1])).sort((p, q) => q.keys[1] - p.keys[1] || q.keys[0] - p.keys[0]).slice(0, 10); return rows.length ? a.V.table(['Sipariş', 'Tarih', 'Ürün', 'Kanal', 'Durum', 'Adet', 'Tutar'], rows.map(x => x.keys.concat(x.vals)), { fmts: [null, null, null, null, null, 'adet', 'para'], compact: true }) : empty('Seçili dönemde sipariş yok'); } });

(function () {
  const d = find('musteri'); if (!d) return;
  const T = id => d.tiles.find(t => t.id === id);
  d.group = 'Satış ve müşteri';
  d.vis = { gorunum: 'grafik' };
  const PG = [['genel', 'Genel bakış', '◧'], ['cografya', 'Coğrafya', '⌖'], ['yasam', 'Yaşam döngüsü', '↻']];
  const XS = [['Musteriler', 'Sehir']];

  /* sayfa 1 iyileştirmeleri */
  const tp = T('top'); tp.cross = 'Musteriler[MusteriNo]'; tp.thru = 'musteridetay'; tp.wells['Detaya git'] = 'Müşteri detayı sayfası';
  tp.title = a => 'En değerli müşteriler · ' + a.yearLabel; tp.titleHint = 'En değerli müşteriler · <yıl>';
  tp.why += ' Satıra sağ tık → Detaya git: müşterinin tüm geçmişi.';
  tp.render = a => { const r = sortBy(a.Q(['Musteriler[MusteriNo]'], ['Net Satış', 'Sipariş Sayısı'], { except: [['Musteriler', 'MusteriNo']], totals: false }), 0); const rows = r.rows.filter(x => isN(x.vals[0])).slice(0, 8); const c = rows.map(x => x.keys[0]); return { cats: c, html: a.V.table(['Müşteri', 'Segment', 'Şehir', 'Net Satış', 'Sipariş'], rows.map(x => { const m = MUS[x.keys[0]] || {}; return [m.Musteri || x.keys[0], m.Segment || '—', m.Sehir || '—'].concat(x.vals); }), { fmts: [null, null, null, 'para', 'adet'], cf: { 3: 'bar' }, compact: true, sel: a.sel(c, 'Musteriler', 'MusteriNo') }) }; };
  const ys = T('yas'); ys.tip = tipSales('Kategoriler[Kategori]', 'Kategori kırılımı'); ys.wells['Araç ipuçları'] = 'Rapor sayfası: “Yaş grubu ipucu”';
  ys.render = a => { const r = a.Q(['Musteriler[YasGrubu]'], ['Net Satış'], { except: [['Musteriler', 'YasGrubu']] }); r.rows.sort((x, y) => String(x.keys[0]).localeCompare(String(y.keys[0]))); const c = cats(r); return { cats: c, html: a.V.column({ cats: c, series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { labels: true, sel: a.sel(c, 'Musteriler', 'YasGrubu'), tipx: a.tipx('Musteriler[YasGrubu]', c) }) }; };
  const ks = T('karisim'); ks.tip = tipSales('Kategoriler[Kategori]', 'Kategori kırılımı'); ks.wells['Araç ipuçları'] = 'Rapor sayfası: “Segment ipucu”';
  ks.render = a => { const r = a.Q(['Musteriler[Segment]', 'Satislar[Kanal]'], ['Net Satış']); const sg = [...new Set(r.rows.map(x => x.keys[0]))]; const g = grid2(r, sg, KANAL, 0); return a.V.bar({ cats: sg, series: KANAL.map((k, j) => ({ name: k, vals: g.map(row => row[j]) })), fmt: 'para' }, { pct: true, legend: 'top', labels: true, tipx: a.tipx('Musteriler[Segment]', sg) }); };
  d.tiles.unshift(pnav('nav1', PG));

  /* sayfa 2: Coğrafya */
  const cityQ = a => memo(a, 'm-city', { except: XS }, () => sortBy(a.Q(['Musteriler[Sehir]'], ['Net Satış', 'Müşteri Sayısı', 'Müşteri Başı Satış', 'YoY %', 'Satış GY'], { except: XS, totals: false }), 0).rows.filter(x => x.keys[0] && isN(x.vals[0])));
  const cogPage = [
    pnav('nav2', PG),
    kc('g1', 3, 'Satış yapılan şehir', { 'Değer': 'COUNTROWS(FILTER(VALUES(Musteriler[Sehir]), [Net Satış] > 0))' }, ['Net Satış'], 'Coğrafi yaygınlık ve yoğunlaşma: ilk üç şehrin payı yüksekse bölgesel risk de yüksektir.',
      a => { const C = cityQ(a); if (!C.length) return null; const t = sum(C.map(x => x.vals[0])); return { v: C.length, fmt: 'adet', icon: '⌖', sub: 'İlk 3 şehrin payı: %' + Math.round(sum(C.slice(0, 3).map(x => x.vals[0])) / (t || 1) * 100) }; }),
    kc('g2', 3, 'En güçlü şehir', { 'Değer': 'TOPN(1, VALUES(Musteriler[Sehir]), [Net Satış])' }, ['Net Satış', 'YoY %'], 'Satışın merkezi; büyümesi toplamı en çok etkileyen şehir.',
      a => { const C = cityQ(a); const x = C[0]; return x ? { v: x.vals[0], fmt: 'para', icon: '★', delta: x.vals[3], dlabel: 'geçen yıla göre', sub: x.keys[0] } : null; }),
    kc('g3', 3, 'En hızlı büyüyen', { 'Değer': 'MAXX(VALUES(Musteriler[Sehir]), [YoY %])', 'Görsel filtresi': 'GY satışı 5.000 ₺ üzeri' }, ['YoY %'], 'Küçük tabanlı şehirler yüzde olarak abartılı büyür; bu yüzden geçen yıl satışı 5.000 ₺\'nin altındaki şehirler hesaba katılmaz.',
      a => { const x = cityQ(a).filter(z => isN(z.vals[3]) && (z.vals[4] || 0) >= 5000).sort((p, q) => q.vals[3] - p.vals[3])[0]; return x ? { v: x.vals[3], fmt: 'yuzde', icon: '↗', sub: x.keys[0] + ' · ' + a.fmt(x.vals[0], 'para', true) } : null; }),
    kc('g4', 3, 'Müşteri başı lider', { 'Değer': 'MAXX(VALUES(Musteriler[Sehir]), [Müşteri Başı Satış])' }, ['Müşteri Başı Satış'], 'Az ama değerli müşterinin olduğu şehir: kişisel hizmet ve premium ürün için aday.',
      a => { const x = cityQ(a).slice().sort((p, q) => (q.vals[2] || 0) - (p.vals[2] || 0))[0]; return x ? { v: x.vals[2], fmt: 'para', icon: '☺', sub: x.keys[0] + ' · ' + a.fmt(x.vals[1], 'adet') + ' müşteri' } : null; }),
    { id: 'cmap', span: 7, title: a => 'Şehirlere göre net satış · ' + a.yearLabel, titleHint: 'Şehirlere göre net satış · <yıl>', type: 'Harita (Azure Maps, kabarcık)', cross: 'Musteriler[Sehir]', wells: { 'Konum': 'Musteriler[Sehir] (Veri kategorisi: Şehir)', 'Kabarcık boyutu': '[Net Satış]', 'Araç ipuçları': '[Müşteri Sayısı], [YoY %]' }, measures: ['Net Satış', 'Müşteri Sayısı', 'YoY %'], format: ['Kabarcık boyutu: orta', 'Kategori etiketleri: büyük kabarcıklarda'],
      why: 'Harita “nerede?” sorusunu cevaplar ama büyüklük karşılaştırmasında zayıftır; yanındaki bölge çubuğu ve şehir tablosu bu eksikliği kapatır. Kabarcığa tıklayınca sayfa o şehre filtrelenir.',
      render: a => { const C = cityQ(a); const c = C.map(x => x.keys[0]); return { cats: c, html: a.V.map(C.map((x, i) => ({ i, label: x.keys[0], ll: W.PBI_MODEL.geo[x.keys[0]], v: x.vals[0], extra: [['Müşteri', a.fmt(x.vals[1], 'adet')], ['Geçen yıla göre', sgn(x.vals[3])]] })), { fmt: 'para', vlabel: 'Net Satış', sel: a.sel(c, 'Musteriler', 'Sehir') }) }; } },
    { id: 'cbolge', span: 5, title: 'Bölgelere göre net satış', type: 'Kümelenmiş çubuk', cross: 'Musteriler[Bolge]', tip: tipSales('Musteriler[Sehir]', 'Bölgedeki şehirler'), wells: { 'Y ekseni': 'Musteriler[Bolge]', 'X ekseni': '[Net Satış]', 'Araç ipuçları': 'Rapor sayfası: “Bölge ipucu”' }, measures: ['Net Satış', 'YoY %'], format: ['Değere göre azalan', 'Büyüme araç ipucunda'],
      why: 'Bölge, şehirleri pazarlama bütçesinin dağıtıldığı düzeye toplar. Üzerine gelince bölgedeki şehirlerin kırılımı açılır.',
      render: a => { const r = sortBy(a.Q(['Musteriler[Bolge]'], ['Net Satış', 'YoY %'], { except: [['Musteriler', 'Bolge']], totals: false }), 0); r.rows = r.rows.filter(x => x.keys[0] && isN(x.vals[0])); const c = cats(r); return { cats: c, html: a.V.bar({ cats: c, series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { grid: false, sel: a.sel(c, 'Musteriler', 'Bolge'), tipx: a.tipx('Musteriler[Bolge]', c) }) }; } },
    { id: 'ctab', span: 7, title: 'Şehir karnesi', type: 'Tablo', cross: 'Musteriler[Sehir]', wells: { 'Sütunlar': 'Musteriler[Sehir], [Net Satış], [Müşteri Sayısı], [Müşteri Başı Satış], [YoY %]' }, measures: ['Net Satış', 'Müşteri Sayısı', 'Müşteri Başı Satış', 'YoY %'], format: ['Net satış: veri çubukları', 'Müşteri başı: renk skalası', 'YoY: simgeler'],
      why: 'Haritanın kesin rakamları. Satış büyüklüğü ile müşteri başı değer aynı şey değildir: tablo ikisini yan yana koyar.',
      render: a => { const C = cityQ(a); const c = C.map(x => x.keys[0]); return { cats: c, html: a.V.table(['Şehir', 'Net Satış', 'Müşteri', 'Müşteri başı', 'YoY'], C.map(x => [x.keys[0]].concat(x.vals.slice(0, 4))), { fmts: [null, 'para', 'adet', 'para', 'yuzde'], cf: { 1: 'bar', 3: 'heat', 4: 'icon' }, cfTarget: 0, sel: a.sel(c, 'Musteriler', 'Sehir'), compact: true }) }; } },
    { id: 'cdumb', span: 5, title: 'İlk 8 şehir: geçen yıl → bu dönem', type: 'Dambıl (özel görsel)', wells: { 'Kategori': 'Musteriler[Sehir]', 'Başlangıç': '[Satış GY]', 'Bitiş': '[Net Satış]' }, measures: ['Net Satış', 'Satış GY'], format: ['Gri: geçen yıl, renkli: bu dönem'],
      why: 'Büyümenin hangi şehirlerden geldiği mesafe olarak görülür.',
      render: a => { const rows = cityQ(a).filter(x => isN(x.vals[4])).slice(0, 8).map(x => ({ cat: x.keys[0], a: x.vals[4], b: x.vals[0] })); return rows.length ? a.V.dumbbell(rows, { aLabel: 'Geçen yıl', bLabel: a.yearLabel, fmt: 'para' }) : empty('Geçen yıl verisi yok (satışlar 22.06.2022\'de başlar).'); } },
    { id: 'ckanal', span: 12, title: 'Bölgelerin kanal karışımı', type: '%100 yığılmış çubuk', wells: { 'Y ekseni': 'Musteriler[Bolge]', 'X ekseni': '[Net Satış]', 'Gösterge': 'Satislar[Kanal]' }, measures: ['Net Satış', 'Kanal Payı %'], format: ['Veri etiketleri: yüzde', 'Kanal renkleri raporla aynı'],
      why: 'Mağazası olmayan bölgelerde dijital kanal payı yüksek mi? Mağaza yatırımı ve teslimat planlaması için.',
      render: a => { const r = a.Q(['Musteriler[Bolge]', 'Satislar[Kanal]'], ['Net Satış'], { totals: false }); const bs = [...new Set(r.rows.map(x => x.keys[0]))].filter(Boolean).sort(); if (!bs.length) return empty('Bu seçimde satış yok'); const g = grid2(r, bs, KANAL, 0); return a.V.bar({ cats: bs, series: KANAL.map((k, j) => ({ name: k, vals: g.map(row => row[j]) })), fmt: 'para' }, { pct: true, legend: 'top', labels: true }); } }
  ];

  /* sayfa 3: Yaşam döngüsü */
  const custQ = a => memo(a, 'm-cust', null, () => a.Q(['Musteriler[MusteriNo]'], ['Sipariş Sayısı', 'Net Satış'], { totals: false }).rows.filter(x => isN(x.vals[0]) && x.vals[0] > 0).map(x => ({ no: x.keys[0], n: x.vals[0], v: x.vals[1] || 0, m: MUS[x.keys[0]] || {} })));
  const BK = ['1 sipariş', '2 sipariş', '3 sipariş', '4 sipariş', '5+ sipariş'];
  const bucket = C => BK.map((b, i) => { const g = C.filter(x => (i < 4 ? x.n === i + 1 : x.n >= 5)); return { b, n: g.length, v: sum(g.map(x => x.v)) }; });
  const yasamPage = [
    Object.assign(pnav('nav3', PG), { span: 8 }), vnav('gor3', 4),
    kc('y1', 3, 'Yeni müşteri', { 'Değer': '[Yeni Müşteri (Küme)]', 'Referans': 'GY' }, ['Yeni Müşteri (Küme)'], 'Kazanım: dönemde ilk kez alışveriş yapanlar. Küme mantığı: bu dönemin müşterileri − daha önce alışveriş yapmış olanlar.',
      a => { const v = a.M('[Yeni Müşteri (Küme)]'); return { v, fmt: 'adet', icon: '+', delta: ratio(v, a.M(GYX('Yeni Müşteri (Küme)'))), dlabel: 'geçen yıla göre' }; }),
    kc('y2', 3, 'Geri dönen müşteri', { 'Değer': '[Geri Dönen Müşteri]', 'Referans': 'GY' }, ['Geri Dönen Müşteri'], 'Sadakat: daha önce de alışveriş yapmış ve bu dönem yine gelenler.',
      a => { const v = a.M('[Geri Dönen Müşteri]'); return { v, fmt: 'adet', icon: '↻', delta: ratio(v, a.M(GYX('Geri Dönen Müşteri'))), dlabel: 'geçen yıla göre' }; }),
    kc('y3', 3, 'Kayıp müşteri', { 'Değer': '[Kayıp Müşteri]' }, ['Kayıp Müşteri'], 'Önceki 12 ayda alışveriş yapıp bu dönem hiç gelmeyenler. Düşük olması iyidir.',
      a => { const v = a.M('[Kayıp Müşteri]'); return { v: isN(v) ? v : 0, fmt: 'adet', icon: '−', sub: 'Önceki 12 ayın müşterilerinden bu dönem gelmeyen' }; }),
    kc('y4', 3, 'Tekrar alım oranı', { 'Değer': 'DIVIDE(COUNTROWS(FILTER(VALUES(Satislar[MusteriNo]), [Sipariş Sayısı] >= 2)), [Müşteri Sayısı])' }, ['Sipariş Sayısı', 'Müşteri Sayısı'], 'Dönem içinde en az iki kez sipariş veren müşterilerin oranı; sadakatin en sade göstergesi.',
      a => { const C = custQ(a); if (!C.length) return null; return { v: C.filter(x => x.n >= 2).length / C.length, fmt: 'yuzde', icon: '⟳', sub: C.length + ' aktif müşteri içinde' }; }),
    { id: 'ysik', span: 6, vis: 'gorunum:grafik', title: 'Sipariş sayısına göre müşteri dağılımı', type: 'Sütun grafik', wells: { 'X ekseni': 'Sipariş sayısı grubu (hesaplanmış tablo / dinamik dilim)', 'Y ekseni': 'Müşteri sayısı' }, measures: ['Sipariş Sayısı', 'Müşteri Sayısı'], format: ['Veri etiketleri açık', 'Eksen doğal sırada'],
      why: 'Tek sipariş veren müşteri kitlesi ne kadar büyük? İkinci alışverişe teşvik kampanyasının hedefi bu sütundur.',
      render: a => { const C = custQ(a); if (!C.length) return empty('Bu seçimde müşteri yok'); const B = bucket(C); return a.V.column({ cats: B.map(x => x.b), series: [{ name: 'Müşteri', vals: B.map(x => x.n) }], fmt: 'adet' }, { labels: true }); } },
    { id: 'ysikT', span: 6, vis: 'gorunum:tablo', title: 'Sipariş sayısına göre müşteri tablosu', type: 'Tablo', wells: { 'Satırlar': 'Sipariş sayısı grubu', 'Değerler': 'Müşteri, pay, net satış, müşteri başı' }, measures: ['Sipariş Sayısı', 'Net Satış'], format: ['Satış payı: veri çubukları'],
      why: 'Aynı dağılımın satış tarafı: az sayıdaki sık alıcı satışın ne kadarını getiriyor?',
      render: a => { const C = custQ(a); if (!C.length) return empty('Bu seçimde müşteri yok'); const B = bucket(C), tv = sum(C.map(x => x.v)); return a.V.table(['Grup', 'Müşteri', 'Müşteri payı', 'Net Satış', 'Satış payı', 'Müşteri başı'], B.map(x => [x.b, x.n, x.n / C.length, x.v, x.v / (tv || 1), x.n ? x.v / x.n : null]), { fmts: [null, 'adet', 'yuzde', 'para', 'yuzde', 'para'], cf: { 4: 'bar' }, compact: true }); } },
    { id: 'yinf', span: 6, title: 'Tekrar alımı ne artırıyor?', type: 'Önemli etkileyenler', wells: { 'Çözümle': 'Tekrar alıcı mı? (dönemde 2+ sipariş)', 'Açıklama ölçütü': 'Musteriler[Segment], [YasGrubu], [Bolge], [Cinsiyet]' }, measures: ['Sipariş Sayısı'], format: ['Analiz türü: Kategorik', 'Yalnızca en az 5 müşterili gruplar'],
      why: 'Önemli etkileyenler görseli, bir sonucun (burada tekrar alım) hangi özellik değerinde kaç kat sık görüldüğünü sıralar. Hedefleme kuralı doğrudan buradan çıkar.',
      render: a => { const C = custQ(a); if (C.length < 10) return empty('Analiz için yeterli müşteri yok'); const F = [['Segment', 'Segment'], ['YasGrubu', 'Yaş grubu'], ['Bolge', 'Bölge'], ['Cinsiyet', 'Cinsiyet']]; const out = []; F.forEach(([k, lb]) => { [...new Set(C.map(x => x.m[k]).filter(Boolean))].forEach(v => { const g = C.filter(x => x.m[k] === v), o = C.filter(x => x.m[k] !== v); if (g.length < 5 || !o.length) return; const rate = g.filter(x => x.n >= 2).length / g.length, base = o.filter(x => x.n >= 2).length / o.length; if (base > 0 && rate > base) out.push({ factor: lb + ': ' + v, rate, base, lift: rate / base, n: g.length }); }); }); out.sort((p, q) => q.lift - p.lift); return out.length ? a.V.influencers(out.slice(0, 6), { head: 'Tekrar alıcı olma olasılığı, şu gruplarda diğerlerine göre kaç kat:' }) : empty('Bu seçimde ortalamadan belirgin ayrışan grup yok'); } },
    { id: 'yarea', span: 12, title: a => 'Aylık aktif müşteri: yeni ve geri dönen · ' + a.yearLabel, titleHint: 'Aylık aktif müşteri: yeni ve geri dönen · <yıl>', type: 'Yığılmış alan grafik', wells: { 'X ekseni': 'Tarih[YilAy]', 'Y ekseni': '[Yeni Müşteri (Küme)], [Geri Dönen Müşteri]' }, measures: ['Yeni Müşteri (Küme)', 'Geri Dönen Müşteri'], format: ['Yığılmış', 'Gösterge üstte'],
      why: 'Her ayın müşteri tabanı iki katmandan oluşur; geri dönenlerin katmanı kalınlaştıkça iş kazanıma daha az bağımlıdır.',
      render: a => { const r = a.Q(['Tarih[YilAy]'], ['Yeni Müşteri (Küme)', 'Geri Dönen Müşteri'], { totals: false }); const rows = r.rows.filter(x => isN(x.vals[0]) || isN(x.vals[1])); return rows.length > 1 ? a.V.area({ cats: rows.map(x => x.keys[0]), series: [{ name: 'Yeni', vals: rows.map(x => x.vals[0]) }, { name: 'Geri dönen', vals: rows.map(x => x.vals[1]) }], fmt: 'adet' }, {}) : empty('Eğilim için en az iki ay gerekir.'); } }
  ];

  /* gizli detay sayfası: Müşteri detayı */
  const detay = [
    musHeader('mdh'),
    kc('md1', 3, 'Net satış', { 'Değer': '[Net Satış]', 'Referans': '[Satış GY]' }, ['Net Satış', 'YoY %'], 'Müşterinin dönem değeri ve büyümesi.',
      a => { const v = a.M('[Net Satış]'); return { v, fmt: 'para', icon: '₺', delta: a.M('[YoY %]'), dlabel: 'geçen yıla göre', sub: musRank(a) }; }, { measures: ['Net Satış', 'YoY %', 'Müşteri Sırası'] }),
    kc('md2', 3, 'Sipariş', { 'Değer': '[Sipariş Sayısı]', 'Referans': 'GY' }, ['Sipariş Sayısı'], 'Sıklık: müşteri ne kadar düzenli geliyor?',
      a => { const v = a.M('[Sipariş Sayısı]'); return { v, fmt: 'adet', icon: '▤', delta: ratio(v, a.M(GYX('Sipariş Sayısı'))), dlabel: 'geçen yıla göre' }; }),
    kc('md3', 3, 'Ortalama sepet', { 'Değer': '[Ortalama Sepet]' }, ['Ortalama Sepet'], 'Sepet büyüklüğü genel ortalamanın üstünde mi?',
      a => { const v = a.M('[Ortalama Sepet]'), g = a.M('[Ortalama Sepet]', { except: [['Musteriler', 'MusteriNo']], noThru: true }); return { v, fmt: 'para', icon: '◫', delta: ratio(v, g), dlabel: 'genel ortalamaya göre' }; }),
    kc('md4', 3, 'Son alımdan bu yana', { 'Değer': 'DATEDIFF(son alım, dönem sonu, DAY)' }, ['Net Satış'], 'Yenilik (RFM\'deki R): gün sayısı büyüdükçe müşteri kaybedilme riskine yaklaşır.',
      a => { const v = a.M('[Son Alım Günü]', { extraMeasures: SON_ALIM }); return isN(v) ? { v, fmt: 'adet', icon: '◷', sub: 'gün (seçili dönemin son gününe göre)' } : null; }),
    musGecmis('mdgec'),
    { id: 'mdkat', span: 4, title: 'Kategori dağılımı', type: 'Halka grafik', wells: { 'Gösterge': 'Kategoriler[Kategori]', 'Değerler': '[Net Satış]' }, measures: ['Net Satış'], format: ['Ortada toplam', 'Gösterge altta'], why: 'Müşteri neyi alıyor? Çapraz satış önerisi için başlangıç noktası.',
      render: a => { const r = sortBy(a.Q(['Kategoriler[Kategori]'], ['Net Satış'], { totals: false }), 0); r.rows = r.rows.filter(x => isN(x.vals[0])); return r.rows.length ? a.V.donut({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { legend: 'bottom' }) : empty('Seçili dönemde alışveriş yok'); } },
    musSiparis('mdsip')
  ];

  d.pages = [
    { id: 'genel', name: 'Genel bakış', icon: '◧', tiles: d.tiles },
    { id: 'cografya', name: 'Coğrafya', icon: '⌖', tiles: cogPage },
    { id: 'yasam', name: 'Yaşam döngüsü', icon: '↻', tiles: yasamPage },
    { id: 'musteridetay', name: 'Müşteri detayı', hidden: true, thru: { field: 'Musteriler[MusteriNo]', label: 'Müşteri no', def: TOP_MUS }, tiles: detay, note: 'Kaynak: “En değerli müşteriler” tablosu' }
  ];
  const SL0 = { yil: [2024], kanal: [], segment: [] };
  d.bookmarks = [
    { id: 'prem', name: 'Premium segment', desc: 'Segment dilimleyicisi Premium: tüm sayfalarda', page: 'genel', sl: { yil: [2024], kanal: [], segment: ['Premium'] }, vis: { gorunum: 'grafik' } },
    { id: 'web', name: 'Yalnızca Web', desc: 'Kanal dilimleyicisi Web', page: 'genel', sl: { yil: [2024], kanal: ['Web'], segment: [] }, vis: { gorunum: 'grafik' } },
    { id: 'ist', name: 'İstanbul odak', desc: 'Coğrafya sayfası İstanbul\'a çapraz filtreli (yer imi seçili öğeyi de yakalar)', page: 'cografya', sl: SL0, cross: { t: 'Musteriler', c: 'Sehir', v: 'İstanbul' }, vis: { gorunum: 'grafik' } },
    { id: 'tablo', name: 'Tablo görünümü', desc: 'Yaşam döngüsü sayfası, dağılım tablo olarak', page: 'yasam', sl: SL0, vis: { gorunum: 'tablo' } }
  ];
  d.build = [
    ['Soru ve kitle', 'Pazarlama ve CRM: müşteri tabanının büyüklüğü, kalitesi ve dağılımı. Genel bakış “kim alıyor?”, Coğrafya “nerede?”, Yaşam döngüsü “kalıyorlar mı, ne onları geri getiriyor?” sorularını cevaplar.', []],
    ['Model', 'Musteriler boyutunda hesaplanmış sütunlar: YasGrubu, Bolge, IlkSiparis, KohortAy. Şehir sütununun Veri kategorisi “Şehir”, Bolge “Eyalet veya il” olarak işaretlendi (harita doğru konumlasın diye). Musteriler[Musteri] tekil değil (aynı adlı müşteriler var); detay sayfası bu yüzden MusteriNo ile çalışır.', []],
    ['Yaşam döngüsü ölçüleri', 'Küme mantığı: bu dönem ∩ önceki = geri dönen; bu dönem − önceki = yeni; önceki 12 ay − bu dönem = kayıp.', ['Müşteri Sayısı', 'Yeni Müşteri (Küme)', 'Geri Dönen Müşteri', 'Kayıp Müşteri', 'Müşteri Başı Satış', 'Müşteri Başı Sipariş']],
    ['Segmentasyon ölçüleri', 'Dinamik dilimler bağlantısız tablo üzerinde dolaşarak hesaplanır; sipariş sayısı grupları da aynı kalıpla (1, 2, 3, 4, 5+) kurulur.', ['Dilimdeki Müşteri', 'Dilim Satışı']],
    ['Sayfa yapısı', 'Üç görünür sayfa + gizli “Müşteri detayı”. Sayfa gezgini her sayfanın başında; yıl, kanal, segment dilimleyicileri tüm sayfalara eşitlendi.', []],
    ['Detay sayfası', 'Detaya git alanı Musteriler[MusteriNo]. Başlık metin kutusu SELECTEDVALUE ile ad, segment, şehir ve kayıt tarihini yazar. “Tüm alışveriş geçmişi” görselinde Biçim → Etkileşimleri düzenle ile yıl dilimleyicisi kapatıldı. Kaynak: “En değerli müşteriler” tablosunda satıra sağ tık → Detaya git.', ['Müşteri Sırası', 'Ortalama Sepet']],
    ['Araç ipucu sayfaları', '“Yaş grubu ipucu”, “Segment ipucu” ve “Bölge ipucu”: net satış, büyüme, marj, aylık mini çizgi ve kategori/şehir çubukları. Sayfa bilgileri → Araç ipucu olarak kullan; kaynak görselde Araç ipuçları → Rapor sayfası.', []],
    ['Önemli etkileyenler', 'Ekle → Yapay zekâ görselleri → Önemli etkileyenler. Çözümle kutusuna “Tekrar alıcı” hesaplanmış sütunu (ya da 2+ sipariş ölçüsü), Açıklama ölçütüne Segment, YasGrubu, Bolge, Cinsiyet. Görsel her değer için “kaç kat daha olası” sıralaması verir.', []],
    ['Yer imleri ve seçim bölmesi', 'Sipariş dağılımı grafiği ve tablosu aynı konumda; Seçim bölmesinde Grafik/Tablo grupları; Grafik/Tablo düğmeleri yer imine bağlı. “İstanbul odak” yer imi çapraz filtre seçimini de yakalar (Veri açık).', []],
    ['Düzen ve güvenlik', 'Kanal renkleri raporun tamamında sabit; yaş grubu doğal sırada; harita yanında liste. Müşteri adları kişisel veridir: OLS ile Musteriler[Musteri] diğer rollerden gizlenir; dışa aktarma “yalnızca özet veri”.', []]
  ];
})();

/* ═════════════════════════ 5. RFM Segmentasyonu ═════════════════════════ */
(function () {
  const d = find('rfm'); if (!d) return;
  const T = id => d.tiles.find(t => t.id === id);
  d.group = 'Satış ve müşteri';
  d.vis = { gorunum: 'grafik' };
  d.params = { olcu: { label: 'Segment ölçüsü', opts: [['Müşteri', 'Müşteri sayısı'], ['Satış', 'Net satış'], ['Değer', 'Müşteri başı satış']], def: 'Müşteri' } };
  const PG = [['genel', 'Genel bakış', '◧'], ['eylem', 'Segment eylem planı', '✓'], ['goc', 'Segment göçü', '⇅']];
  const SEG = MT.RFMSegmentleri.rows.slice().sort((x, y) => x.Sira - y.Sira);
  const SEGS = SEG.map(s => s.Segment); const SIRA = {}; const EYLEM = {}; SEG.forEach(s => { SIRA[s.Segment] = s.Sira; EYLEM[s.Segment] = s.Eylem; });
  const KISA = { 'Şampiyon': 'Şamp.', 'Sadık': 'Sadık', 'Potansiyel sadık': 'Pot. sadık', 'Yeni': 'Yeni', 'Dikkat gerektiren': 'Dikkat', 'Risk altında': 'Risk', 'Kaybedilmiş': 'Kayıp' };
  const GERI = ['Dikkat gerektiren', 'Risk altında', 'Kaybedilmiş'];
  const XM = [['Musteriler', 'MusteriNo']];
  const RMS = ['RFM Skoru', 'RFM Segmenti', 'Net Satış', 'Sipariş Sayısı'];
  /* müşteri başına RFM tablosu: bir kez hesaplanır, sayfadaki tüm görseller paylaşır */
  const base = (a, add) => { const o = add ? { add, except: XM } : { except: XM }; return memo(a, 'r-base', o, () => a.Q(['Musteriler[MusteriNo]'], ['RFM Segmenti', 'RFM Skoru', 'Net Satış', 'Sipariş Sayısı', 'Son Alım Günü'], Object.assign({ totals: false, extraMeasures: SON_ALIM }, o)).rows.filter(x => x.vals[0]).map(x => ({ no: x.keys[0], seg: x.vals[0], skor: x.vals[1], v: x.vals[2] || 0, n: x.vals[3] || 0, gun: x.vals[4] }))); };
  const agg = B => SEGS.map(s => { const g = B.filter(x => x.seg === s); return { seg: s, n: g.length, v: sum(g.map(x => x.v)), gun: avg(g.map(x => x.gun)), ord: avg(g.map(x => x.n)) }; });
  const pv = (a, x) => { const p = a.prm('olcu'); return p === 'Satış' ? x.v : p === 'Değer' ? (x.n ? x.v / x.n : null) : x.n; };
  const pf = a => a.prm('olcu') === 'Müşteri' ? 'adet' : 'para';
  const tipSeg = (a, add, cat) => { const g = base(a).filter(x => x.seg === cat); const top = g.slice().sort((p, q) => q.v - p.v).slice(0, 4); return { title: 'Segment ipucu · ' + cat, cards: [['Müşteri', a.fmt(g.length, 'adet')], ['Net satış', a.fmt(sum(g.map(x => x.v)), 'para', true)], ['Ort. son alım', g.length ? Math.round(avg(g.map(x => x.gun)) || 0) + ' gün' : '—']], bars: top.map(x => [musName(x.no), x.v, a.fmt(x.v, 'para', true)]), barsLabel: 'Segmentin en değerli müşterileri', note: EYLEM[cat] ? 'Eylem: ' + EYLEM[cat] : null }; };
  const yr = a => { const v = a.slicerVals('yil'); return v.length ? Math.max(...v) : 2024; };

  /* sayfa 1 iyileştirmeleri */
  const sg = T('seg'); sg.tip = tipSeg; sg.wells['Araç ipuçları'] = 'Rapor sayfası: “Segment ipucu”';
  sg.title = a => 'Segmentlere göre müşteri · ' + a.yearLabel + ' sonu'; sg.titleHint = 'Segmentlere göre müşteri · <yıl> sonu';
  sg.render = a => { const r = a.Q(['RFMSegmentleri[Segment]'], ['Segmentteki Müşteri']); const c = cats(r); return a.V.bar({ cats: c, series: [{ name: 'Müşteri', vals: col(r, 0) }], fmt: 'adet' }, { grid: false, colorMode: 'byCat', tipx: a.tipx('RFMSegmentleri[Segment]', c) }); };
  const ls = T('liste'); ls.cross = 'Musteriler[MusteriNo]'; ls.thru = 'musteri'; ls.wells['Detaya git'] = 'Müşteri detayı sayfası';
  ls.why += ' Satıra sağ tık → Detaya git: müşterinin RFM puanları ve sipariş geçmişi.';
  ls.render = a => { const rows = base(a).filter(x => x.seg === 'Risk altında' || x.seg === 'Dikkat gerektiren').sort((p, q) => q.v - p.v).slice(0, 8); const c = rows.map(x => x.no); return rows.length ? { cats: c, html: a.V.table(['Müşteri', 'Segment', 'Skor', 'Net Satış'], rows.map(x => [musName(x.no), x.seg, x.skor, x.v]), { fmts: [null, null, 'adet', 'para'], compact: true, sel: a.sel(c, 'Musteriler', 'MusteriNo') }) } : { cats: [], html: empty('Bu seçimde risk altında müşteri yok.') }; };
  d.tiles.unshift(pnav('nav1', PG));

  /* sayfa 2: Segment eylem planı */
  const kanalSeg = a => memo(a, 'r-kanal', { except: XM }, () => { const B = base(a); const sm = {}; B.forEach(x => { sm[x.no] = x.seg; }); const r = a.Q(['Musteriler[MusteriNo]', 'Satislar[Kanal]'], ['Net Satış'], { totals: false, except: XM }); const g = {}; r.rows.forEach(x => { const s = sm[x.keys[0]]; if (!s) return; (g[s] = g[s] || {})[x.keys[1]] = ((g[s] || {})[x.keys[1]] || 0) + (x.vals[0] || 0); }); return g; });
  const eylemPage = [
    Object.assign(pnav('nav2', PG), { span: 8 }), vnav('gor2', 4),
    kc('e1', 3, 'Korunacak değer', { 'Değer': 'Şampiyon + Sadık segmentlerinin net satışı' }, RMS, 'Şampiyon ve sadık müşteriler gelirin çekirdeğidir; amaç onları kaybetmemek, indirimle değil ayrıcalıkla ödüllendirmek.',
      a => { const B = base(a); if (!B.length) return null; const g = B.filter(x => x.seg === 'Şampiyon' || x.seg === 'Sadık'); return { v: sum(g.map(x => x.v)), fmt: 'para', icon: '★', sub: g.length + ' müşteri · satışın %' + Math.round(sum(g.map(x => x.v)) / (sum(B.map(x => x.v)) || 1) * 100) }; }),
    kc('e2', 3, 'Büyütülecek müşteri', { 'Değer': 'Potansiyel sadık + Yeni segmentleri' }, RMS, 'Yakın zamanda gelen ama henüz sıklaşmamış müşteriler: ikinci ve üçüncü alışveriş teşviki en çok burada işe yarar.',
      a => { const B = base(a); if (!B.length) return null; const g = B.filter(x => x.seg === 'Potansiyel sadık' || x.seg === 'Yeni'); return { v: g.length, fmt: 'adet', icon: '↗', sub: 'Müşterilerin %' + Math.round(g.length / B.length * 100) + ' kadarı · ' + a.fmt(sum(g.map(x => x.v)), 'para', true) }; }),
    kc('e3', 3, 'Geri kazanılacak', { 'Değer': 'Dikkat gerektiren + Risk altında + Kaybedilmiş' }, RMS, 'Gelmeyi azaltmış ya da bırakmış müşteriler. Geri kazanma maliyeti yeni müşteri kazanmaktan genelde düşüktür.',
      a => { const B = base(a); if (!B.length) return null; const g = B.filter(x => GERI.includes(x.seg)); return { v: g.length, fmt: 'adet', icon: '↺', sub: 'Dönem satışları ' + a.fmt(sum(g.map(x => x.v)), 'para', true) }; }),
    kc('e4', 3, 'Ortalama son alım', { 'Değer': 'AVERAGEX(Musteriler, Son Alım Günü)' }, ['RFM Skoru'], 'RFM\'nin R\'si: müşteriler ortalama kaç gündür alışveriş yapmıyor? Analiz tarihi seçili dönemin son günüdür.',
      a => { const B = base(a); const v = avg(B.map(x => x.gun)); return isN(v) ? { v: Math.round(v), fmt: 'adet', icon: '◷', sub: 'gün · analiz tarihi ' + a.fmt(a.M('MAX(Tarih[Tarih])')) } : null; }),
    { id: 'etree', span: 7, vis: 'gorunum:grafik', title: a => 'Segmentler · ' + a.prmLabel('olcu'), titleHint: 'Segmentler · <segment ölçüsü>', type: 'Ağaç haritası', tip: tipSeg, wells: { 'Kategori': 'RFMSegmentleri[Segment]', 'Değerler': 'Segment ölçüsü (alan parametresi)', 'Araç ipuçları': 'Rapor sayfası: “Segment ipucu”' }, measures: ['Segmentteki Müşteri', 'Net Satış'], format: ['Segment renkleri tüm raporda sabit', 'Veri etiketleri: segment + değer'],
      why: 'Müşteri sayısına göre bakınca küçük görünen Şampiyonlar satışa göre bakınca en büyük kutu olur. Alan parametresi bu farkı tek tıkla gösterir.',
      render: a => { const A = agg(base(a)).filter(x => x.n > 0); if (!A.length) return empty('Bu seçimde müşteri yok'); const c = A.map(x => x.seg); return a.V.treemap({ cats: c, series: [{ name: a.prmLabel('olcu'), vals: A.map(x => pv(a, x)) }], fmt: pf(a) }, { tipx: a.tipx('RFMSegmentleri[Segment]', c), H: 260 }); } },
    { id: 'eplan', span: 7, vis: 'gorunum:tablo', title: 'Segment eylem tablosu', type: 'Tablo', wells: { 'Sütunlar': 'RFMSegmentleri[Segment], müşteri, satış payı, müşteri başı, ort. sipariş, ort. son alım, RFMSegmentleri[Eylem]' }, measures: ['Segmentteki Müşteri', 'Net Satış', 'Sipariş Sayısı'], format: ['Metni kaydır: Eylem sütunu', 'Satış payı: veri çubukları'],
      why: 'Kampanya ekibinin çalışma tablosu: her segmentin büyüklüğü, değeri, davranışı ve önerilen eylemi aynı satırda.',
      render: a => { const B = base(a), A = agg(B).filter(x => x.n > 0); if (!A.length) return empty('Bu seçimde müşteri yok'); const tv = sum(B.map(x => x.v)) || 1; return a.V.table(['Segment', 'Müşteri', 'Satış payı', 'Müşteri başı', 'Ort. sipariş', 'Ort. son alım (gün)', 'Eylem'], A.map(x => [x.seg, x.n, x.v / tv, x.n ? x.v / x.n : null, x.ord, isN(x.gun) ? Math.round(x.gun) : null, EYLEM[x.seg]]), { fmts: [null, 'adet', 'yuzde', 'para', null, 'adet'], cf: { 2: 'bar' }, compact: true }); } },
    { id: 'ebub', span: 5, title: 'Segment haritası: yenilik ve sıklık', type: 'Dağılım grafiği (kabarcık)', wells: { 'Değerler': 'RFMSegmentleri[Segment]', 'X ekseni': 'Ortalama son alım (gün)', 'Y ekseni': 'Ortalama sipariş', 'Boyut': 'Net satış' }, measures: ['RFM Skoru', 'Sipariş Sayısı', 'Net Satış'], format: ['Kabarcık boyutu: net satış', 'X: sağa gittikçe eski'],
      why: 'Segment tanımlarının veride gerçekten ayrıştığını gösterir: Şampiyonlar sol üstte (yeni ve sık), Kaybedilmişler sağ altta.',
      render: a => { const A = agg(base(a)).filter(x => x.n > 0 && isN(x.gun)); return A.length ? a.V.scatter(A.map(x => ({ label: x.seg, g: x.seg, x: x.gun, y: x.ord, s: x.v })), { xlabel: 'Ortalama son alım (gün)', ylabel: 'Ortalama sipariş', xfmt: null, yfmt: null, sfmt: 'para', slabel: 'Net satış', bubble: true }) : empty('Bu seçimde müşteri yok'); } },
    { id: 'ekanal', span: 6, title: 'Segmentlerin kanal tercihi', type: '%100 yığılmış çubuk', wells: { 'Y ekseni': 'RFMSegmentleri[Segment]', 'X ekseni': '[Net Satış]', 'Gösterge': 'Satislar[Kanal]' }, measures: ['Net Satış', 'RFM Segmenti'], format: ['Veri etiketleri: yüzde'],
      why: 'Kampanya kanalı seçimi: geri kazanılacak müşteriler hangi kanalı kullanıyordu? E-posta mı, mağaza içi teklif mi?',
      render: a => { const g = kanalSeg(a); const ss = SEGS.filter(s => g[s]); return ss.length ? a.V.bar({ cats: ss, series: KANAL.map(k => ({ name: k, vals: ss.map(s => g[s][k] || null) })), fmt: 'para' }, { pct: true, legend: 'top', labels: true }) : empty('Bu seçimde satış yok'); } },
    { id: 'eliste', span: 6, title: 'Öncelikli geri kazanma listesi', type: 'Tablo', cross: 'Musteriler[MusteriNo]', thru: 'musteri', wells: { 'Sütunlar': 'Musteriler[Musteri], [RFM Segmenti], son alım günü, [Net Satış]', 'Görsel filtresi': 'Segment: Dikkat gerektiren, Risk altında, Kaybedilmiş · İlk 8 (Net Satış)' }, measures: ['RFM Segmenti', 'Net Satış'], format: ['Net satış: veri çubukları', 'Sağ tık → Detaya git'],
      why: 'Değeri yüksek olup uzaklaşan müşteriler önce aranır. Listeden sağ tıkla müşteri detayına inilir.',
      render: a => { const rows = base(a).filter(x => GERI.includes(x.seg)).sort((p, q) => q.v - p.v).slice(0, 8); const c = rows.map(x => x.no); return rows.length ? { cats: c, html: a.V.table(['Müşteri', 'Segment', 'Gün', 'Net Satış'], rows.map(x => [musName(x.no), KISA[x.seg] || x.seg, x.gun, x.v]), { fmts: [null, null, 'adet', 'para'], cf: { 3: 'bar' }, compact: true, short: true, sel: a.sel(c, 'Musteriler', 'MusteriNo') }) } : { cats: [], html: empty('Bu seçimde geri kazanılacak müşteri yok') }; } }
  ];

  /* sayfa 3: Segment göçü (önceki yıl sonu → seçili yıl sonu) */
  const goc = a => { const y = yr(a); const B1 = base(a), B0 = base(a, [{ t: 'Tarih', c: 'Yil', values: [y - 1] }]); const m0 = {}; B0.forEach(x => { m0[x.no] = x; }); const m1 = {}; B1.forEach(x => { m1[x.no] = x; }); const ids = [...new Set(B0.map(x => x.no).concat(B1.map(x => x.no)))]; return { y, B0, B1, rows: ids.map(no => ({ no, a: m0[no] ? m0[no].seg : null, b: m1[no] ? m1[no].seg : null, v0: m0[no] ? m0[no].v : 0, v1: m1[no] ? m1[no].v : 0 })) }; };
  const noPrev = g => !g.B0.length;
  const gocCard = (id, title, why, fn) => kc(id, 3, title, { 'Değer': 'Önceki yıl sonu ve seçili yıl sonu RFM segmenti karşılaştırması' }, RMS, why, a => { const g = goc(a); if (noPrev(g)) return null; return fn(a, g); });
  const gocPage = [
    pnav('nav3', PG),
    gocCard('g1', 'Segment yükselten', 'Önceki yıl sonuna göre daha iyi bir segmente geçen müşteriler: kampanyaların ve deneyimin çalıştığının kanıtı.', (a, g) => { const n = g.rows.filter(x => x.a && x.b && SIRA[x.b] < SIRA[x.a]).length; return { v: n, fmt: 'adet', icon: '▲', sub: (g.y - 1) + ' → ' + g.y }; }),
    gocCard('g2', 'Segment düşüren', 'Daha kötü bir segmente geçenler. Bu sayının yükselenlerden büyük olması tabanın aşındığını gösterir.', (a, g) => { const n = g.rows.filter(x => x.a && x.b && SIRA[x.b] > SIRA[x.a]).length; return { v: n, fmt: 'adet', icon: '▼', sub: (g.y - 1) + ' → ' + g.y }; }),
    gocCard('g3', 'Aynı segmentte kalan', 'Sabit kalanlar; Şampiyonlar için iyi, Kaybedilmişler için kötü haber.', (a, g) => { const s = g.rows.filter(x => x.a && x.b && x.a === x.b); return { v: s.length, fmt: 'adet', icon: '=', sub: s.filter(x => x.a === 'Şampiyon').length + ' Şampiyon olarak kaldı' }; }),
    gocCard('g4', 'Yeni katılan', 'Önceki yıl RFM tablosunda olmayıp bu yıl segmentlenen müşteriler (ilk kez alanlar ya da uzun aradan dönenler).', (a, g) => { const n = g.rows.filter(x => !x.a && x.b).length; return { v: n, fmt: 'adet', icon: '+', sub: g.y + ' yılında ilk kez segmentlendi' }; }),
    { id: 'gmat', span: 12, title: a => 'Segment geçiş matrisi · ' + (yr(a) - 1) + ' sonu → ' + yr(a) + ' sonu', titleHint: 'Segment geçiş matrisi · <yıl−1> → <yıl>', type: 'Matris (renk skalası)', wells: { 'Satırlar': 'Önceki yıl segmenti (RFM, Tarih[Yil] = seçili − 1)', 'Sütunlar': 'Seçili yıl segmenti', 'Değerler': 'Müşteri sayısı' }, measures: ['RFM Segmenti', 'RFM Skoru'], format: ['Koşullu biçim: arka plan', 'Köşegen: aynı segmentte kalanlar', '“—”: o yıl segment yok'],
      why: 'Segment sayıları iki yıl arasında aynı kalsa bile müşteriler yer değiştirmiş olabilir. Geçiş matrisi kimin nereden nereye gittiğini gösterir: köşegenin altı iyileşme, üstü kötüleşme.',
      render: a => { const g = goc(a); if (noPrev(g)) return empty((g.y - 1) + ' yılında satış yok; karşılaştırma yapılamıyor.'); const rs = SEGS.concat([null]), cs = SEGS.concat([null]); const lab = s => s ? KISA[s] : '—'; return a.V.table(['Önceki ↓ / Şimdi →'].concat(cs.map(lab), ['Toplam']), rs.map(r => [r ? r : '— (yok)'].concat(cs.map(c => g.rows.filter(x => x.a === r && x.b === c).length || ''), [g.rows.filter(x => x.a === r).length])).filter(row => row[row.length - 1] > 0), { fmts: [null].concat(cs.map(() => 'adet'), ['adet']), cf: Object.fromEntries(cs.map((c, j) => [j + 1, 'heat'])), compact: true }); } },
    { id: 'gdumb', span: 5, title: a => 'Segment büyüklüğü · ' + (yr(a) - 1) + ' → ' + yr(a), titleHint: 'Segment büyüklüğü · <yıl−1> → <yıl>', type: 'Dambıl (özel görsel)', wells: { 'Kategori': 'RFMSegmentleri[Segment]', 'Başlangıç': 'Önceki yıl müşteri sayısı', 'Bitiş': 'Seçili yıl müşteri sayısı' }, measures: ['Segmentteki Müşteri'], format: ['Gri: önceki yıl, renkli: seçili yıl'],
      why: 'Matrisin özeti: hangi segment büyüdü, hangisi küçüldü?',
      render: a => { const g = goc(a); if (noPrev(g)) return empty('Önceki yıl verisi yok.'); return a.V.dumbbell(SEGS.map(s => ({ cat: s, a: g.B0.filter(x => x.seg === s).length, b: g.B1.filter(x => x.seg === s).length })), { aLabel: String(g.y - 1), bLabel: String(g.y), fmt: 'adet' }); } },
    { id: 'gdus', span: 7, title: 'Değer kaybeden müşteriler', type: 'Tablo', cross: 'Musteriler[MusteriNo]', thru: 'musteri', wells: { 'Sütunlar': 'Musteriler[Musteri], önceki segment, şimdiki segment, önceki yıl satış, bu yıl satış', 'Görsel filtresi': 'Önceki: Şampiyon/Sadık/Potansiyel sadık → Şimdi: Dikkat/Risk/Kaybedilmiş ya da yok' }, measures: ['RFM Segmenti', 'Net Satış'], format: ['Önceki yıl satışına göre azalan', 'Sağ tık → Detaya git'],
      why: 'En pahalı kayıplar: geçen yıl iyi segmentte olup bu yıl uzaklaşanlar. Kişisel geri kazanma aramasının listesi.',
      render: a => { const g = goc(a); if (noPrev(g)) return { cats: [], html: empty('Önceki yıl verisi yok.') }; const iyi = ['Şampiyon', 'Sadık', 'Potansiyel sadık']; const rows = g.rows.filter(x => iyi.includes(x.a) && (!x.b || GERI.includes(x.b))).sort((p, q) => q.v0 - p.v0).slice(0, 10); const c = rows.map(x => x.no); return rows.length ? { cats: c, html: a.V.table(['Müşteri', String(g.y - 1), String(g.y), (g.y - 1) + ' satış', g.y + ' satış'], rows.map(x => [musName(x.no), KISA[x.a] || x.a, x.b ? (KISA[x.b] || x.b) : '—', x.v0, x.v1]), { fmts: [null, null, null, 'para', 'para'], cf: { 3: 'bar' }, compact: true, short: true, sel: a.sel(c, 'Musteriler', 'MusteriNo') }) } : { cats: [], html: empty('Bu dönemde iyi segmentten düşen müşteri yok.') }; } }
  ];

  /* gizli detay sayfası: Müşteri detayı (RFM puanları) */
  const me = a => base(a).find(x => x.no === a.thruVal());
  const digit = (s, k) => isN(s) ? Math.floor(s / Math.pow(10, 2 - k)) % 10 : null;
  const detay = [
    musHeader('rdh', a => { const x = me(a); return x ? '<div class="callout">RFM segmenti: <b>' + a.esc(x.seg) + '</b> (skor ' + x.skor + ') · Önerilen eylem: ' + a.esc(EYLEM[x.seg] || '—') + '</div>' : '<div class="callout">Bu müşteri seçili dönemde segmentlenmedi (alışveriş yok).</div>'; }),
    kc('r1', 3, 'R · yenilik puanı', { 'Değer': 'INT([RFM Skoru] / 100)' }, ['RFM Skoru'], 'Yenilik puanı 1–5: son alım ne kadar yakınsa puan o kadar yüksek.',
      a => { const x = me(a); return x ? { v: digit(x.skor, 0), fmt: null, icon: 'R', sub: 'Son alım ' + (isN(x.gun) ? x.gun + ' gün önce' : '—') } : null; }),
    kc('r2', 3, 'F · sıklık puanı', { 'Değer': 'INT(MOD([RFM Skoru], 100) / 10)' }, ['RFM Skoru', 'Sipariş Sayısı'], 'Sıklık puanı 1–5: son 12 aydaki sipariş sayısına göre.',
      a => { const x = me(a); return x ? { v: digit(x.skor, 1), fmt: null, icon: 'F', sub: a.fmt(x.n, 'adet') + ' sipariş (seçili dönem)' } : null; }),
    kc('r3', 3, 'M · parasal puan', { 'Değer': 'MOD([RFM Skoru], 10)' }, ['RFM Skoru', 'Net Satış'], 'Parasal puan 1–5: son 12 aydaki harcamaya göre.',
      a => { const x = me(a); return x ? { v: digit(x.skor, 2), fmt: null, icon: 'M', sub: a.fmt(x.v, 'para') + ' net satış' } : null; }),
    kc('r4', 3, 'Ortalama sepet', { 'Değer': '[Ortalama Sepet]' }, ['Ortalama Sepet'], 'Müşterinin sepeti genel ortalamanın üstünde mi?',
      a => { const v = a.M('[Ortalama Sepet]'), g = a.M('[Ortalama Sepet]', { except: XM, noThru: true }); return { v, fmt: 'para', icon: '◫', delta: ratio(v, g), dlabel: 'genel ortalamaya göre' }; }),
    musGecmis('rgec'),
    { id: 'rkat', span: 4, title: 'Kategori tercihi', type: 'Kümelenmiş çubuk', wells: { 'Y ekseni': 'Kategoriler[Kategori]', 'X ekseni': '[Net Satış]' }, measures: ['Net Satış'], format: ['Değere göre azalan'], why: 'Geri kazanma teklifinde hangi kategori öne çıkmalı?',
      render: a => { const r = sortBy(a.Q(['Kategoriler[Kategori]'], ['Net Satış'], { totals: false }), 0); r.rows = r.rows.filter(x => isN(x.vals[0])); return r.rows.length ? a.V.bar({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { grid: false }) : empty('Seçili dönemde alışveriş yok'); } },
    musSiparis('rsip')
  ];

  d.pages = [
    { id: 'genel', name: 'Genel bakış', icon: '◧', tiles: d.tiles },
    { id: 'eylem', name: 'Segment eylem planı', icon: '✓', tiles: eylemPage },
    { id: 'goc', name: 'Segment göçü', icon: '⇅', tiles: gocPage },
    { id: 'musteri', name: 'Müşteri detayı', hidden: true, thru: { field: 'Musteriler[MusteriNo]', label: 'Müşteri no', def: TOP_MUS }, tiles: detay, note: 'Kaynak: risk listesi, geri kazanma listesi, değer kaybedenler' }
  ];
  d.bookmarks = [
    { id: 'y23', name: '2023 sonu', desc: 'Analiz tarihi 31.12.2023: segmentler o güne göre yeniden hesaplanır', page: 'genel', sl: { yil: [2023], kanal: [] }, pr: { olcu: 'Müşteri' }, vis: { gorunum: 'grafik' } },
    { id: 'mobil', name: 'Yalnızca Mobil', desc: 'RFM yalnızca Mobil siparişlerden: mobil uygulama kampanyası için', page: 'eylem', sl: { yil: [2024], kanal: ['Mobil'] }, pr: { olcu: 'Müşteri' }, vis: { gorunum: 'grafik' } },
    { id: 'deger', name: 'Satış değerine göre', desc: 'Eylem planı, segmentler net satışa göre', page: 'eylem', sl: { yil: [2024], kanal: [] }, pr: { olcu: 'Satış' }, vis: { gorunum: 'grafik' } },
    { id: 'tablo', name: 'Eylem tablosu', desc: 'Eylem planı ağaç haritası yerine tablo', page: 'eylem', sl: { yil: [2024], kanal: [] }, pr: { olcu: 'Müşteri' }, vis: { gorunum: 'tablo' } }
  ];
  d.build = [
    ['Soru ve kitle', 'CRM ekibi: hangi müşteri grubuna hangi kampanya? Genel bakış segmentleri tanıtır; Segment eylem planı “ne yapmalı, kime?”, Segment göçü “geçen yıla göre kim iyileşti, kim uzaklaştı?” sorularını cevaplar.', []],
    ['Analiz tarihi kararı', 'RFM “bugün”e göre hesaplanır: bugün = seçili dönemin son günü (MAX(Tarih[Tarih])). Böylece Segment göçü sayfası aynı ölçüyü önceki yıla filtreleyerek geçmiş segmenti bulabilir.', []],
    ['RFM ölçüleri', 'Skor ölçüsü üç puanı üç haneli bir sayıda toplar; segment ölçüsü haneleri geri ayırıp kurallarla iş diline çevirir. Detay sayfasındaki R, F, M kartları aynı haneleri INT ve MOD ile ayırır.', ['RFM Skoru', 'RFM Segmenti', 'Segmentteki Müşteri']],
    ['Bağlantısız segment tablosu', 'RFMSegmentleri: Segment, Sira, Aciklama, Eylem. Eksende ve tabloda bu tablo kullanılır; Sira hem sıralama hem göç yönü (yükselme/düşme) için kullanılır.', []],
    ['Sayfa yapısı', 'Üç görünür sayfa + gizli “Müşteri detayı”. Yıl ve kanal dilimleyicileri tüm sayfalara eşitlendi; göç sayfasında önceki yıl için ölçüde Tarih[Yil] = seçili − 1 filtresi (CALCULATE + SELECTEDVALUE) kullanılır.', []],
    ['Alan parametresi', '“Segment ölçüsü”: Müşteri sayısı, Net satış, Müşteri başı satış. Modelleme → Yeni parametre → Alanlar; ağaç haritasının Değerler kutusuna parametre sütunu konur.', ['Segmentteki Müşteri', 'Net Satış', 'Müşteri Başı Satış']],
    ['Detay sayfası', 'Detaya git alanı Musteriler[MusteriNo]; kaynaklar: risk listesi, geri kazanma listesi ve değer kaybedenler tablosu. Sayfadaki “Tüm alışveriş geçmişi” görselinde yıl dilimleyicisinin etkileşimi kapalı.', ['Ortalama Sepet']],
    ['Araç ipucu sayfası', '“Segment ipucu”: müşteri sayısı, net satış, ortalama son alım günü, segmentin en değerli dört müşterisi ve önerilen eylem. Segment çubuğu ve ağaç haritasında Araç ipuçları → Rapor sayfası.', []],
    ['Yer imleri ve seçim bölmesi', 'Ağaç haritası ve eylem tablosu aynı konumda (Seçim bölmesi: Grafik/Tablo). Yer imleri: “2023 sonu” ve “Yalnızca Mobil” (Veri: dilimleyiciler), “Satış değerine göre” (parametre), “Eylem tablosu” (Görüntü).', []],
    ['Performans', 'Segment sayımı her müşteri için RFM hesaplar; sayfa diğerlerinden yavaştır. Müşteri başına RFM tablosu bir kez hesaplanıp sayfadaki tüm görsellerde paylaşılır (Power BI\'da: Power Query/SQL ile ön hesaplanmış RFM puanları ya da hesaplanmış tablo).', []],
    ['Yayın', 'Kampanya listelerinin dışa aktarılması yalnızca CRM rolüne açık; diğer rollerde müşteri adı OLS ile gizli.', []]
  ];
})();

/* ═════════════════════════ 6. Kohort ve Tutma ═════════════════════════ */
(function () {
  const d = find('kohort'); if (!d) return;
  const T = id => d.tiles.find(t => t.id === id);
  d.group = 'Satış ve müşteri';
  d.vis = { gorunum: 'grafik' };
  d.params = { olcu: { label: 'Tutma ölçüsü', opts: [['Kohort Tutma %', 'Müşteri tutma'], ['Gelir Tutma %', 'Gelir tutma']], def: 'Kohort Tutma %' } };
  const PG = [['genel', 'Genel bakış', '◧'], ['egriler', 'Tutma eğrileri', '⌒'], ['deger', 'Kohort değeri', '₺']];
  const KF = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const XK = [['Musteriler', 'KohortAy']];
  const SON = '2024-12';
  const EXTRA = { 'Gelir Tutma %': 'DIVIDE(CALCULATE([Net Satış], REMOVEFILTERS(Tarih)), CALCULATE([Net Satış], Satislar[KohortAyFarki] = 0, REMOVEFILTERS(Tarih)))', 'Kohort Boyutu': 'CALCULATE(DISTINCTCOUNT(Satislar[MusteriNo]), Satislar[KohortAyFarki] = 0, Satislar[Durum] <> "İptal", REMOVEFILTERS(Tarih))' };
  const ayFark = (k, e) => { const [y1, m1] = String(k).split('-').map(Number), [y2, m2] = String(e).split('-').map(Number); return (y2 - y1) * 12 + (m2 - m1); };
  const reached = (k, m) => ayFark(k, SON) >= m;
  const yari = k => k < '2023-01' ? '2022 (Haz–Ara)' : k.slice(0, 4) + (+k.slice(5, 7) <= 6 ? ' 1. yarı' : ' 2. yarı');
  /* kohort × ay farkı matrisi: henüz gelmemiş ay boş, gelmiş ama kimse alışveriş yapmamışsa 0 */
  const coh = (a, m, o) => memo(a, 'k-coh-' + m, o, () => { const r = a.Q(['Musteriler[KohortAy]', 'Satislar[KohortAyFarki]'], [m], Object.assign({ totals: false, add: [{ t: 'Satislar', c: 'KohortAyFarki', values: KF }], extraMeasures: EXTRA }, o || {})); const ks = [...new Set(r.rows.map(x => x.keys[0]))].filter(Boolean).sort(); const g = grid2(r, ks, KF, 0).map((row, i) => row.map((v, j) => reached(ks[i], j) ? (isN(v) ? v : 0) : null)); return { ks, g }; });
  const sizes = (a, o) => memo(a, 'k-size', o, () => { const s = {}; a.Q(['Musteriler[KohortAy]'], ['Kohort Boyutu'], Object.assign({ totals: false, extraMeasures: EXTRA }, o || {})).rows.forEach(x => { if (x.keys[0]) s[x.keys[0]] = x.vals[0]; }); return s; });
  const avgAt = (C, j, from) => avg(C.ks.map((k, i) => (k >= (from || '2023-01') ? C.g[i][j] : null)));
  const groups = C => { const gs = [...new Set(C.ks.map(yari))]; return gs.map(gn => { const idx = C.ks.map((k, i) => yari(k) === gn ? i : -1).filter(i => i >= 0); return { name: gn, vals: KF.map(j => avg(idx.map(i => C.g[i][j]))), n: idx.length }; }).filter(x => x.n); };
  const M_ = a => a.prm('olcu');

  /* sayfa 1 iyileştirmeleri */
  const mt = T('matris'); mt.title = a => 'Kohort tutma matrisi (ilk 12 ay)' + (a.slicerVals('kanal').length ? ' · ' + a.slicerVals('kanal').join(', ') : ' · tüm kanallar'); mt.titleHint = 'Kohort tutma matrisi (ilk 12 ay) · <kanal>';
  const tipOff = (a, add, cat) => { const C = coh(a, 'Kohort Tutma %'); const j = +cat; const v = C.ks.map((k, i) => [k, C.g[i][j]]).filter(x => isN(x[1]) && x[0] >= '2023-01').sort((p, q) => q[1] - p[1]); return { title: 'Ay farkı ipucu · ' + j + '. ay', cards: [['Ortalama', a.fmt(avg(v.map(x => x[1])), 'yuzde')], ['En iyi', v[0] ? a.fmt(v[0][1], 'yuzde') : '—'], ['Kohort', String(v.length)]], bars: v.slice(0, 4).map(x => [x[0], x[1], a.fmt(x[1], 'yuzde')]), barsLabel: 'Bu ayda en iyi tutan kohortlar' }; };
  const eg = T('egri'); eg.tip = tipOff; eg.wells['Araç ipuçları'] = 'Rapor sayfası: “Ay farkı ipucu”';
  eg.render = a => { const k2 = KF.slice(1); const C = coh(a, 'Kohort Tutma %'); return a.V.line({ cats: k2.map(m => m + '. ay'), series: [{ name: 'Ortalama tutma', vals: k2.map(j => avgAt(C, j)) }], fmt: 'yuzde' }, { markers: true, labels: true, tipx: a.tipx('Satislar[KohortAyFarki]', k2) }); };
  eg.why += ' Gelmiş ama kimsenin alışveriş yapmadığı aylar %0 sayılır; henüz gelmemiş aylar ortalamaya girmez.';
  const tipQ = (a, add, cat) => { const y = a.M('[Yeni Müşteri (Küme)]', { add }), k = a.M('[Kayıp Müşteri]', { add }), ns = a.M('[Net Satış]', { add }); return { title: 'Çeyrek ipucu · ' + cat, cards: [['Yeni', a.fmt(y || 0, 'adet')], ['Kayıp', a.fmt(k || 0, 'adet')], ['Net değişim', ((y || 0) - (k || 0) >= 0 ? '+' : '−') + Math.abs((y || 0) - (k || 0))]], note: 'Çeyrek net satışı: ' + a.fmt(ns, 'para', true) }; };
  const ky = T('kayip'); ky.tip = tipQ; ky.wells['Araç ipuçları'] = 'Rapor sayfası: “Çeyrek ipucu”';
  ky.render = a => { const r = a.Q(['Tarih[YilCeyrek]'], ['Yeni Müşteri (Küme)', 'Kayıp Müşteri']); const rows = r.rows.filter(x => x.keys[0] >= '2023'); const c = rows.map(x => x.keys[0]); return a.V.column({ cats: c.map(k => k.replace('20', '')), series: [{ name: 'Yeni', vals: rows.map(x => x.vals[0]) }, { name: 'Kayıp', vals: rows.map(x => x.vals[1]), color: 'var(--s8)' }], fmt: 'adet' }, { legend: 'top', tipx: a.tipx('Tarih[YilCeyrek]', c) }); };
  d.tiles.unshift(pnav('nav1', PG));

  /* sayfa 2: Tutma eğrileri */
  const card = (id, j, why) => kc(id, 3, j + '. ay tutma', { 'Değer': 'AVERAGEX(kohortlar, [Tutma ölçüsü]) · KohortAyFarki = ' + j }, ['Kohort Tutma %'], why,
    a => { const C = coh(a, M_(a)); const v = avgAt(C, j); return isN(v) ? { v, fmt: 'yuzde', icon: String(j), sub: a.prmLabel('olcu') + ' · ' + C.ks.filter((k, i) => k >= '2023-01' && isN(C.g[i][j])).length + ' kohortun ortalaması' } : null; });
  const egriPage = [
    Object.assign(pnav('nav2', PG), { span: 8 }), vnav('gor2', 4),
    card('t1', 1, 'İlk ay sonrası kalanlar: ilk deneyimin kalitesi en çok bu sayıyı etkiler.'),
    card('t3', 3, 'Üçüncü ay: alışkanlığın oluşup oluşmadığının işareti.'),
    card('t6', 6, 'Altıncı ay: sadık çekirdeğin büyüklüğü.'),
    card('t11', 11, 'On birinci ay: bir yıl sonra kalan oran (matrisin son sütunu).'),
    { id: 'eqline', span: 8, vis: 'gorunum:grafik', title: a => a.prmLabel('olcu') + ' eğrileri · kohort yarıyılına göre', titleHint: '<tutma ölçüsü> eğrileri · kohort yarıyılına göre', type: 'Çizgi grafik', wells: { 'X ekseni': 'Satislar[KohortAyFarki]', 'Y ekseni': 'Tutma ölçüsü (alan parametresi)', 'Gösterge': 'Kohort yarıyılı (Musteriler[KohortAy]\'dan hesaplanmış sütun)' }, measures: ['Kohort Tutma %'], format: ['Son kohort grubu kalın', 'Gösterge üstte', 'Y ekseni: yüzde'],
      why: 'Yeni kazanılan müşteriler eskilerden daha iyi mi tutuyor? Eğriler yukarı kayıyorsa ürün ve hizmet iyileşiyor demektir. Gelir tutmada değer %100\'ü geçebilir: kalan müşteriler ilk aydan fazla harcıyorsa.',
      render: a => { const G = groups(coh(a, M_(a))); if (!G.length) return empty('Bu seçimde kohort yok'); const k2 = KF.slice(1); return a.V.line({ cats: k2.map(m => m + '. ay'), series: G.map((g, i) => ({ name: g.name, vals: k2.map(j => g.vals[j]), width: i === G.length - 1 ? 3 : 1.6 })), fmt: 'yuzde' }, { legend: 'top', markers: true }); } },
    { id: 'eqtab', span: 8, vis: 'gorunum:tablo', title: a => a.prmLabel('olcu') + ' · kohort yarıyılı tablosu', titleHint: '<tutma ölçüsü> · kohort yarıyılı tablosu', type: 'Matris (renk skalası)', wells: { 'Satırlar': 'Kohort yarıyılı', 'Sütunlar': 'Satislar[KohortAyFarki]', 'Değerler': 'Tutma ölçüsü' }, measures: ['Kohort Tutma %'], format: ['Koşullu biçim: arka plan', 'Boş: henüz gelmemiş ay'],
      why: 'Eğrilerin kesin değerleri; yer imi düğmesiyle grafikle yer değiştirir.',
      render: a => { const G = groups(coh(a, M_(a))); if (!G.length) return empty('Bu seçimde kohort yok'); const k2 = KF.slice(1, 12); return a.V.table(['Kohort'].concat(k2.map(String)), G.map(g => [g.name].concat(k2.map(j => g.vals[j]))), { fmts: [null].concat(k2.map(() => 'yuzde')), cf: Object.fromEntries(k2.map((j, i) => [i + 1, 'heat'])), compact: true }); } },
    { id: 'kanal3', span: 4, title: a => '3. ay ' + a.prmLabel('olcu').toLowerCase() + ': kanala göre', titleHint: '3. ay <tutma ölçüsü>: kanala göre', type: 'Kümelenmiş çubuk', tip: tipSales('Kategoriler[Kategori]', 'Kategori kırılımı'), wells: { 'Y ekseni': 'Satislar[Kanal]', 'X ekseni': 'Tutma ölçüsü (KohortAyFarki = 3)', 'Araç ipuçları': 'Rapor sayfası: “Kanal ipucu”' }, measures: ['Kohort Tutma %'], format: ['Analiz: ortalama çizgisi'],
      why: 'Hangi kanaldaki alışverişler müşteriyi daha çok geri getiriyor? Her kanal yalnızca kendi siparişleriyle hesaplanır (kanal dilimleyicisi bu görselde yok sayılır).',
      render: a => { const v = KANAL.map(k => avgAt(coh(a, M_(a), { add: [{ t: 'Satislar', c: 'KohortAyFarki', values: KF }, { t: 'Satislar', c: 'Kanal', values: [k] }] }), 3)); return v.some(isN) ? a.V.bar({ cats: KANAL, series: [{ name: '3. ay', vals: v }], fmt: 'yuzde' }, { grid: false, lines: [{ type: 'avg' }], tipx: a.tipx('Satislar[Kanal]', KANAL) }) : empty('Veri yok'); } },
    { id: 'kboyut', span: 12, title: 'Kohort büyüklüğü (ilk ayında alışveriş yapan müşteri)', type: 'Sütun grafik', cross: 'Musteriler[KohortAy]', thru: 'kohortdetay', tip: (a, add, cat) => { const C = coh(a, 'Kohort Tutma %', { except: XK }); const i = C.ks.indexOf(cat); const s = sizes(a, { except: XK }); return { title: 'Kohort ipucu · ' + ymLabel(cat), cards: [['Müşteri', a.fmt(s[cat] || 0, 'adet')], ['1. ay', i >= 0 && isN(C.g[i][1]) ? a.fmt(C.g[i][1], 'yuzde') : '—'], ['3. ay', i >= 0 && isN(C.g[i][3]) ? a.fmt(C.g[i][3], 'yuzde') : '—']], bars: i >= 0 ? [1, 2, 3, 6, 11].filter(j => isN(C.g[i][j])).map(j => [j + '. ay', C.g[i][j], a.fmt(C.g[i][j], 'yuzde')]) : null, barsLabel: 'Müşteri tutma', note: 'Sağ tık → Detaya git: kohort detayı' }; },
      wells: { 'X ekseni': 'Musteriler[KohortAy]', 'Y ekseni': 'Kohort Boyutu (DISTINCTCOUNT, KohortAyFarki = 0)', 'Araç ipuçları': 'Rapor sayfası: “Kohort ipucu”' }, measures: ['Kohort Tutma %'], format: ['Veri etiketleri açık', 'Sağ tık → Detaya git: Kohort detayı'],
      why: 'Tutma oranı küçük kohortlarda oynaktır; boyut grafiği hangi oranın kaç müşteriye dayandığını gösterir. Bir sütuna sağ tıkla o kohortun detayına inilir.',
      render: a => { const s = sizes(a, { except: XK }); const c = Object.keys(s).sort(); return c.length ? { cats: c, html: a.V.column({ cats: c.map(k => k.slice(2)), series: [{ name: 'Müşteri', vals: c.map(k => s[k]) }], fmt: 'adet' }, { labels: true, sel: a.sel(c, 'Musteriler', 'KohortAy'), tipx: a.tipx('Musteriler[KohortAy]', c) }) } : { cats: [], html: empty('Kohort yok') }; } }
  ];

  /* sayfa 3: Kohort değeri (birikimli müşteri başı satış) */
  const ltv = (a, o) => memo(a, 'k-ltv', o, () => { const r = a.Q(['Musteriler[KohortAy]', 'Satislar[KohortAyFarki]'], ['Net Satış'], Object.assign({ totals: false, add: [{ t: 'Satislar', c: 'KohortAyFarki', values: KF }] }, o || {})); const s = sizes(a, o); const ks = [...new Set(r.rows.map(x => x.keys[0]))].filter(k => k && s[k]).sort(); const g = grid2(r, ks, KF, 0).map((row, i) => { let acc = 0; return row.map((v, j) => { acc += v || 0; return reached(ks[i], j) ? acc / s[ks[i]] : null; }); }); return { ks, g, s }; });
  const ltvCard = (id, j, title, why) => kc(id, 4, title, { 'Değer': 'Kohortların ortalaması: birikimli net satış / kohort büyüklüğü (KohortAyFarki ≤ ' + j + ')' }, ['Net Satış'], why,
    a => { const L = ltv(a); const v = avgAt(L, j); return isN(v) ? { v, fmt: 'para', icon: '₺', sub: 'müşteri başı · ' + L.ks.filter((k, i) => k >= '2023-01' && isN(L.g[i][j])).length + ' kohort' } : null; });
  const degerPage = [
    pnav('nav3', PG),
    ltvCard('v0', 0, 'İlk ay harcaması', 'Kazanıldığı ay müşteri başına ne harcanıyor? Kazanım maliyetiyle karşılaştırılacak ilk sayı.'),
    ltvCard('v5', 5, '6 ayda birikimli değer', 'İlk altı ayda müşteri başına toplam net satış; kazanım bütçesinin tavanını belirler.'),
    ltvCard('v11', 11, '12 ayda birikimli değer', 'Bir yıllık müşteri değeri (basit LTV). Henüz 12 ayını doldurmamış kohortlar dahil edilmez.'),
    { id: 'ltvline', span: 7, title: 'Birikimli müşteri başı satış · kohort yarıyılına göre', type: 'Çizgi grafik', wells: { 'X ekseni': 'Satislar[KohortAyFarki]', 'Y ekseni': 'Birikimli net satış / kohort büyüklüğü', 'Gösterge': 'Kohort yarıyılı' }, measures: ['Net Satış', 'Kümülatif Satış'], format: ['Son kohort grubu kalın', 'Y ekseni: ₺'],
      why: 'Tutma eğrisi “kaç kişi kaldı?”, değer eğrisi “kalanlar ne kadar getirdi?” sorusunu cevaplar. Eğrinin eğimi müşteri başı aylık gelirdir.',
      render: a => { const G = groups(ltv(a)); if (!G.length) return empty('Bu seçimde kohort yok'); return a.V.line({ cats: KF.map(m => m + '. ay'), series: G.map((g, i) => ({ name: g.name, vals: g.vals, width: i === G.length - 1 ? 3 : 1.6 })), fmt: 'para' }, { legend: 'top' }); } },
    { id: 'katman', span: 5, title: 'Satışın kohort katmanları', type: 'Yığılmış alan grafik', wells: { 'X ekseni': 'Tarih[YilCeyrek]', 'Y ekseni': '[Net Satış]', 'Gösterge': 'Kohort yılı (Musteriler[KohortAy]\'dan)' }, measures: ['Net Satış'], format: ['Eski kohort altta', 'Gösterge üstte'],
      why: '“Katman pastası”: her çeyreğin satışı hangi yıl kazanılmış müşterilerden geliyor? Alt katmanlar kalın kalıyorsa eski müşteriler değer üretmeye devam ediyor.',
      render: a => { const r = a.Q(['Tarih[YilCeyrek]', 'Musteriler[KohortAy]'], ['Net Satış'], { totals: false }); const qs = [...new Set(r.rows.map(x => x.keys[0]))].sort(); const ys = [...new Set(r.rows.map(x => String(x.keys[1] || '').slice(0, 4)).filter(Boolean))].sort(); if (qs.length < 2) return empty('Yeterli dönem yok'); return a.V.area({ cats: qs.map(q => q.replace('20', '')), series: ys.map(y => ({ name: y + ' kohortları', vals: qs.map(q => sum(r.rows.filter(x => x.keys[0] === q && String(x.keys[1]).startsWith(y)).map(x => x.vals[0])) || 0) })), fmt: 'para' }, {}); } },
    { id: 'ltvtab', span: 12, title: 'Kohort yarıyılı karnesi', type: 'Matris', wells: { 'Satırlar': 'Kohort yarıyılı', 'Değerler': 'kohort sayısı, müşteri, birikimli müşteri başı satış (0., 2., 5., 11. ay)' }, measures: ['Net Satış'], format: ['Renk skalası: değer sütunları', 'Boş: süresi dolmamış'],
      why: 'Değer eğrilerinin kesin rakamları; finans ekibi kazanım bütçesini bu tablodan hesaplar.',
      render: a => { const L = ltv(a); const gs = [...new Set(L.ks.map(yari))]; if (!gs.length) return empty('Kohort yok'); const G = groups(L); return a.V.table(['Kohort', 'Ay sayısı', 'Müşteri', 'İlk ay', '3 ay', '6 ay', '12 ay'], G.map(g => [g.name, g.n, sum(L.ks.filter(k => yari(k) === g.name).map(k => L.s[k]))].concat([0, 2, 5, 11].map(j => isN(g.vals[j]) ? g.vals[j] : '—'))), { fmts: [null, 'adet', 'adet', 'para', 'para', 'para', 'para'], cf: { 3: 'heat', 4: 'heat', 5: 'heat', 6: 'heat' }, compact: true }); } }
  ];

  /* gizli detay sayfası: Kohort detayı */
  const one = a => { const C = coh(a, 'Kohort Tutma %'); const k = a.thruVal(); const i = C.ks.indexOf(k); return i >= 0 ? C.g[i] : null; };
  const allAvg = a => coh(a, 'Kohort Tutma %', { except: XK });
  const detay = [
    header('kdh', a => { const k = a.thruVal(); const s = sizes(a, { except: XK })[k]; return '<h2>' + a.esc(ymLabel(k)) + ' kohortu</h2><p>İlk alışverişini ' + a.esc(ymLabel(k)) + ' ayında yapan ' + a.fmt(s || 0, 'adet') + ' müşteri · ' + (a.slicerVals('kanal').length ? a.esc(a.slicerVals('kanal').join(', ')) + ' kanalı' : 'tüm kanallar') + ' · ' + ayFark(k, SON) + ' aylık geçmiş</p>'; }),
    kc('kd1', 3, 'Kohort büyüklüğü', { 'Değer': 'Kohort Boyutu' }, ['Kohort Tutma %'], 'Oranların kaç müşteriye dayandığı: küçük kohortta tek müşteri yüzdeyi çok oynatır.',
      a => { const s = sizes(a, { except: XK }); const v = s[a.thruVal()]; const all = Object.values(s); return isN(v) ? { v, fmt: 'adet', icon: '☺', sub: 'Kohort ortalaması ' + Math.round(avg(all) || 0) } : null; }),
    kc('kd2', 3, '1. ay tutma', { 'Değer': '[Kohort Tutma %] · KohortAyFarki = 1', 'Referans': 'Tüm kohortların ortalaması' }, ['Kohort Tutma %'], 'İlk deneyimin ardından geri gelme oranı; ortalamayla farkı puan olarak.',
      a => { const r = one(a); const v = r ? r[1] : null; const b = avgAt(allAvg(a), 1); return isN(v) ? { v, fmt: 'yuzde', icon: '1', delta: isN(b) ? v - b : null, deltaFmt: 'pp', dlabel: 'ortalamaya göre' } : null; }),
    kc('kd3', 3, '3. ay tutma', { 'Değer': '[Kohort Tutma %] · KohortAyFarki = 3', 'Referans': 'Tüm kohortların ortalaması' }, ['Kohort Tutma %'], 'Alışkanlık sinyali; ortalamanın altındaysa o dönemin kazanım kanalı ya da kampanyası sorgulanmalı.',
      a => { const r = one(a); const v = r ? r[3] : null; const b = avgAt(allAvg(a), 3); return isN(v) ? { v, fmt: 'yuzde', icon: '3', delta: isN(b) ? v - b : null, deltaFmt: 'pp', dlabel: 'ortalamaya göre' } : null; }),
    kc('kd4', 3, 'Toplam net satış', { 'Değer': '[Net Satış] (tüm zamanlar)' }, ['Net Satış', 'Müşteri Başı Satış'], 'Kohortun bugüne kadar getirdiği toplam gelir.',
      a => { const v = a.M('[Net Satış]'); return isN(v) ? { v, fmt: 'para', icon: '₺', sub: 'Müşteri başı ' + a.fmt(v / (sizes(a, { except: XK })[a.thruVal()] || 1), 'para') } : null; }),
    { id: 'kdegri', span: 8, title: a => ymLabel(a.thruVal()) + ' kohortu ve ortalama tutma', titleHint: '<kohort> kohortu ve ortalama tutma', type: 'Çizgi grafik', wells: { 'X ekseni': 'Satislar[KohortAyFarki]', 'Y ekseni': '[Kohort Tutma %] (bu kohort), ortalama (REMOVEFILTERS(Musteriler[KohortAy]))' }, measures: ['Kohort Tutma %'], format: ['Ortalama: kesik gri', 'İşaretçiler açık'],
      why: 'Detay sayfasında bağlam şarttır: kohortun eğrisi tek başına iyi ya da kötü değildir, ortalamanın üstünde ya da altındadır.',
      render: a => { const r = one(a); if (!r) return empty('Bu kohort için veri yok'); const A = allAvg(a); const k2 = KF.slice(1); return a.V.line({ cats: k2.map(m => m + '. ay'), series: [{ name: ymLabel(a.thruVal()), vals: k2.map(j => r[j]) }, { name: 'Tüm kohortlar', vals: k2.map(j => avgAt(A, j)), dash: true, color: 'var(--axis)', width: 1.5 }], fmt: 'yuzde' }, { legend: 'top', markers: true }); } },
    { id: 'kdkanal', span: 4, title: 'Kohortun kanal karışımı', type: 'Halka grafik', wells: { 'Gösterge': 'Satislar[Kanal]', 'Değerler': '[Net Satış]' }, measures: ['Net Satış'], format: ['Ortada toplam'], why: 'Bu kohort hangi kanallardan alışveriş yapıyor?',
      render: a => { const r = a.Q(['Satislar[Kanal]'], ['Net Satış'], { totals: false }); return r.rows.length ? a.V.donut({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { legend: 'bottom' }) : empty('Satış yok'); } },
    { id: 'kdmus', span: 12, title: 'Kohorttaki müşteriler', type: 'Tablo', wells: { 'Sütunlar': 'Musteriler[Musteri], [Segment], [Sehir], [Sipariş Sayısı], [Net Satış], son sipariş' }, measures: ['Sipariş Sayısı', 'Net Satış'], format: ['Net satışa göre azalan', 'Net satış: veri çubukları'],
      why: 'Kohortun içi: kim kaldı, kim tek alışverişte kaldı? Son sipariş tarihi eskiyse müşteri kayıp sayılır.',
      render: a => { const r = sortBy(a.Q(['Musteriler[MusteriNo]'], ['Sipariş Sayısı', 'Net Satış', 'Son Sipariş'], { totals: false, extraMeasures: { 'Son Sipariş': 'CALCULATE(MAX(Satislar[Tarih]), Satislar[Durum] <> "İptal")' } }), 1); const rows = r.rows.filter(x => isN(x.vals[1])).slice(0, 12); return rows.length ? a.V.table(['Müşteri', 'Segment', 'Şehir', 'Sipariş', 'Net Satış', 'Son sipariş'], rows.map(x => { const m = MUS[x.keys[0]] || {}; return [m.Musteri || x.keys[0], m.Segment || '—', m.Sehir || '—', x.vals[0], x.vals[1], x.vals[2]]; }), { fmts: [null, null, null, 'adet', 'para', null], cf: { 4: 'bar' }, compact: true }) : empty('Kohortta müşteri yok'); } }
  ];

  d.pages = [
    { id: 'genel', name: 'Genel bakış', icon: '◧', tiles: d.tiles },
    { id: 'egriler', name: 'Tutma eğrileri', icon: '⌒', tiles: egriPage },
    { id: 'deger', name: 'Kohort değeri', icon: '₺', tiles: degerPage },
    { id: 'kohortdetay', name: 'Kohort detayı', hidden: true, thru: { field: 'Musteriler[KohortAy]', label: 'Kohort', def: TOP_KOH }, tiles: detay, note: 'Kaynak: “Kohort büyüklüğü” sütunları' }
  ];
  d.bookmarks = [
    { id: 'mobil', name: 'Yalnızca Mobil', desc: 'Kohortlar yalnızca Mobil siparişlerle: mobil müşteriler daha mı sadık?', page: 'genel', sl: { kanal: ['Mobil'] }, pr: { olcu: 'Kohort Tutma %' }, vis: { gorunum: 'grafik' } },
    { id: 'web', name: 'Yalnızca Web', desc: 'Kohortlar yalnızca Web siparişlerle', page: 'genel', sl: { kanal: ['Web'] }, pr: { olcu: 'Kohort Tutma %' }, vis: { gorunum: 'grafik' } },
    { id: 'gelir', name: 'Gelir tutma', desc: 'Tutma eğrileri müşteri sayısı yerine gelirle', page: 'egriler', sl: { kanal: [] }, pr: { olcu: 'Gelir Tutma %' }, vis: { gorunum: 'grafik' } },
    { id: 'tablo', name: 'Tablo görünümü', desc: 'Tutma eğrileri tablo olarak', page: 'egriler', sl: { kanal: [] }, pr: { olcu: 'Kohort Tutma %' }, vis: { gorunum: 'tablo' } }
  ];
  d.build = [
    ['Soru ve kitle', 'Büyüme ve ürün ekipleri: kazanılan müşteriler kalıyor mu? Genel bakış matrisi verir; Tutma eğrileri “yeni kohortlar daha mı iyi, hangi kanal tutuyor?”, Kohort değeri “kalanlar ne kadar getiriyor?” sorularını cevaplar.', []],
    ['Hesaplanmış sütunlar', 'Musteriler[IlkSiparis] (CALCULATE ile bağlam geçişi), Musteriler[KohortAy], Satislar[KohortAyFarki] (RELATED ile). Eğriler için Musteriler\'e “Kohort yarıyılı” sütunu eklenir: <code>IF([KohortAy] < "2023-01", "2022 (Haz–Ara)", LEFT([KohortAy], 4) & IF(VALUE(RIGHT([KohortAy], 2)) <= 6, " 1. yarı", " 2. yarı"))</code> (2022 kohortları satışlar Haziran\'da başladığı için tek grupta).', []],
    ['Tutma ölçüleri', 'Aynı sütuna verilen “= 0” filtresi hücrenin ay farkını değiştirir: payda kohort büyüklüğü olur. Gelir tutma aynı kalıbın satış sürümüdür: <code>DIVIDE(CALCULATE([Net Satış], REMOVEFILTERS(Tarih)), CALCULATE([Net Satış], Satislar[KohortAyFarki] = 0, REMOVEFILTERS(Tarih)))</code>.', ['Kohort Tutma %', 'Yeni Müşteri (Küme)', 'Kayıp Müşteri']],
    ['Henüz gelmemiş aylar', 'Ortalamalarda “gelmiş ama kimse alışveriş yapmamış” ay %0 sayılır, “henüz gelmemiş” ay (kohort ayı + fark > son veri ayı) hesaba katılmaz. DAX\'ta: <code>IF(EDATE(DATEVALUE([KohortAy] & "-01"), [Fark]) <= MAX(Tarih[Tarih]), [Kohort Tutma %] + 0)</code>.', []],
    ['Sayfa yapısı', 'Üç görünür sayfa + gizli “Kohort detayı”. Kanal dilimleyicisi tüm sayfalara eşitlendi. Sayfa gezgini her sayfanın başında.', []],
    ['Alan parametresi', '“Tutma ölçüsü”: Kohort Tutma % ve Gelir Tutma %. Modelleme → Yeni parametre → Alanlar; kartlar, eğriler ve kanal çubuğu bu parametreyi kullanır.', ['Kohort Tutma %']],
    ['Detay sayfası', 'Detaya git alanı Musteriler[KohortAy]. “Kohort büyüklüğü” sütunlarında sağ tık → Detaya git. Detay sayfasındaki ortalama çizgisi <code>CALCULATE([Kohort Tutma %], REMOVEFILTERS(Musteriler[KohortAy]))</code> ile detay filtresinden kurtarılır.', []],
    ['Araç ipucu sayfaları', '“Ay farkı ipucu” (ortalama eğride: o ayda en iyi tutan kohortlar), “Çeyrek ipucu” (yeni/kayıp dengesi), “Kohort ipucu” (boyut ve tutma çubukları), “Kanal ipucu”. Sayfa bilgileri → Araç ipucu olarak kullan.', []],
    ['Yer imleri ve seçim bölmesi', 'Eğri grafiği ve tablosu aynı konumda (Seçim bölmesi: Grafik/Tablo). Yer imleri: “Yalnızca Mobil/Web” (Veri), “Gelir tutma” (parametre), “Tablo görünümü” (Görüntü). Düğmeler Eylem → Yer imi.', []],
    ['Performans', 'Kohort hesabı REMOVEFILTERS(Tarih) ile DISTINCTCOUNT\'lardan oluşur; ön hesaplanmış sütunlar sayesinde hızlıdır. Matris bir kez sorgulanır, sayfadaki kartlar ve eğriler aynı sonucu paylaşır.', []]
  ];
})();

/* ═════════════════════════ 7. Hedef ve Gerçekleşen ═════════════════════════ */
(function () {
  const d = find('hedef'); if (!d) return;
  const T = id => d.tiles.find(t => t.id === id);
  d.group = 'Yönetim ve finans';
  d.vis = { gorunum: 'grafik' };
  d.params = { ref: { label: 'Karşılaştırma', opts: [['BU', 'Bütçe (hedef)'], ['GY', 'Geçen yıl']], def: 'BU' } };
  d.theme = { id: 'ibcs', header: 'Hedef ve Gerçekleşen', sub: 'AC gerçekleşen · BÜ bütçe (hedef) · GY geçen yıl', logo: 'AM', desc: 'IBCS esinli sade finans teması: koyu gri gerçekleşen, açık gri karşılaştırma; renk yalnızca sapmada (yeşil iyi, kırmızı kötü). Kenarlık yerine üst çizgi.' };
  const PG = [['genel', 'Genel bakış', '◧'], ['sapma', 'Sapma analizi', '±'], ['takip', 'Bütçe takibi', '▦']];
  const XK = [['Kategoriler', 'Kategori']];
  const refM = a => a.prm('ref') === 'BU' ? '[Hedef]' : '[Satış GY]';
  const refL = a => a.prm('ref') === 'BU' ? 'BÜ' : 'GY';
  const katQ = (a, o) => { const r = a.Q(['Kategoriler[Kategori]'], ['Net Satış', 'Ref'], Object.assign({ totals: false, extraMeasures: { 'Ref': refM(a) } }, o || {})); return r.rows.filter(x => isN(x.vals[0]) || isN(x.vals[1])).map(x => ({ cat: x.keys[0], ac: Math.round(x.vals[0] || 0), ref: isN(x.vals[1]) ? Math.round(x.vals[1]) : null })); };
  const ayQ = a => { const r = a.Q([a.timeAxis], ['Net Satış', 'Ref'], { totals: false, extraMeasures: { 'Ref': refM(a) } }); return r.rows.filter(x => isN(x.vals[0]) && isN(x.vals[1])).map(x => ({ cat: x.keys[0], ac: x.vals[0], ref: x.vals[1] })); };
  const noRef = msg => empty(msg || 'Karşılaştırma değeri yok (geçen yıl için satışlar 22.06.2022\'de başlar).');

  /* sayfa 1 iyileştirmeleri */
  const kb = T('kombo'); kb.tip = tipMonth; kb.wells['Araç ipuçları'] = 'Rapor sayfası: “Ay ipucu”';
  kb.title = a => 'Aylık net satış ve hedef · ' + a.yearLabel; kb.titleHint = 'Aylık net satış ve hedef · <yıl>';
  kb.render = a => { const r = a.Q([a.timeAxis], ['Net Satış', 'Hedef']); const rows = r.rows.filter(x => x.vals[1]); const c = rows.map(x => x.keys[0]); return a.V.column({ cats: c, series: [{ name: 'Net Satış', vals: rows.map(x => x.vals[0]) }, { name: 'Hedef', type: 'line', vals: rows.map(x => x.vals[1]), color: 'var(--s2)' }], fmt: 'para' }, { legend: 'top', tipx: a.tipx(a.timeAxis, c) }).replace(/<g class="vmark([^"]*)" data-i="(\d+)"([^]*?)<\/g>/g, (m0, cl, i) => { const x = rows[+i]; return x && (x.vals[0] || 0) < x.vals[1] ? m0.replace(/fill="var\(--s1\)"/, 'fill="var(--s8)"') : m0; }); };
  ['bullet', 'tablo'].forEach(id => { const t = T(id); t.thru = 'katdetay'; t.wells['Detaya git'] = 'Kategori detayı sayfası'; t.why += ' Sağ tık → Detaya git: kategorinin aylık sapması ve ürünleri.'; });
  d.tiles.unshift(pnav('nav1', PG));

  /* sayfa 2: Sapma analizi (IBCS) */
  const sapmaPage = [
    Object.assign(pnav('nav2', PG), { span: 8 }), vnav('gor2', 4),
    kc('s1', 3, 'Gerçekleşen (AC)', { 'Değer': '[Net Satış]' }, ['Net Satış'], 'IBCS\'de gerçekleşen her zaman koyu ve dolu gösterilir; diğer her şey ona göre okunur.',
      a => ({ v: a.M('[Net Satış]'), fmt: 'para', icon: 'AC', spark: col(a.Q(['Tarih[YilAy]'], ['Net Satış'], { totals: false }), 0) })),
    kc('s2', 3, a => a.prm('ref') === 'BU' ? 'Bütçe (BÜ)' : 'Geçen yıl (GY)', { 'Değer': 'Karşılaştırma (alan parametresi): [Hedef] ya da [Satış GY]' }, ['Hedef', 'Satış GY'], 'Karşılaştırma ölçütünü alan parametresi seçer: bütçe mi, geçen yıl mı? Aynı sayfa iki soruyu cevaplar.',
      a => ({ v: a.M(refM(a)), fmt: 'para', icon: refL(a) }), { titleHint: 'Bütçe (BÜ) / Geçen yıl (GY)' }),
    kc('s3', 3, a => 'Sapma (Δ' + refL(a) + ')', { 'Değer': '[Net Satış] − karşılaştırma' }, ['Hedef Farkı', 'Hedef Gerçekleşme %', 'YoY %'], 'Mutlak sapma ve yüzdesi. Pozitif sapma satışta iyidir.',
      a => { const ac = a.M('[Net Satış]'), rf = a.M(refM(a)); return isN(rf) ? { v: (ac || 0) - rf, fmt: 'para', icon: 'Δ', delta: ratio(ac, rf), dlabel: refL(a) + '\'ye göre' } : null; }, { titleHint: 'Sapma (ΔBÜ / ΔGY)' }),
    kc('s4', 3, 'En büyük olumsuz sapma', { 'Değer': 'MINX(VALUES(Kategoriler[Kategori]), [Net Satış] − karşılaştırma)' }, ['Hedef Farkı'], 'Sapma analizinin ilk eylemi: en çok geride kalan kalemi bulmak.',
      a => { const K = katQ(a, { except: XK }).filter(x => isN(x.ref)).map(x => Object.assign(x, { dv: x.ac - x.ref })).sort((p, q) => p.dv - q.dv); const w = K[0]; return w ? { v: w.dv, fmt: 'para', icon: '▼', delta: ratio(w.ac, w.ref), dlabel: refL(a) + '\'ye göre', sub: w.cat + (w.dv >= 0 ? ' (tüm kategoriler karşılaştırmanın üstünde)' : '') } : null; }),
    { id: 'vkat', span: 6, vis: 'gorunum:grafik', title: a => 'Kategori sapması · AC − ' + refL(a), titleHint: 'Kategori sapması · AC − BÜ/GY', type: 'Sapma çubukları (IBCS, özel görsel)', cross: 'Kategoriler[Kategori]', thru: 'katdetay', wells: { 'Kategori': 'Kategoriler[Kategori]', 'Gerçekleşen (AC)': '[Net Satış]', 'Karşılaştırma': 'BÜ ya da GY (alan parametresi)' }, measures: ['Net Satış', 'Hedef', 'Satış GY', 'Hedef Farkı'], format: ['Yalnızca fark çizilir; orta çizgi = karşılaştırma', 'Yeşil iyi, kırmızı kötü', 'Sağ tık → Detaya git'],
      why: 'IBCS kuralı: “karşılaştırmayı göster, farkı vurgula”. İki çubuğu yan yana koymak yerine yalnızca farkı çizmek gözün yapacağı çıkarmayı ortadan kaldırır.',
      render: a => { const K = katQ(a, { except: XK }).filter(x => isN(x.ref)); if (!K.length) return { cats: [], html: noRef() }; const c = K.map(x => x.cat); return { cats: c, html: a.V.variance(K, { fmt: 'para', refLabel: refL(a), sel: a.sel(c, 'Kategoriler', 'Kategori') }) }; } },
    { id: 'vkatT', span: 6, vis: 'gorunum:tablo', title: a => 'Kategori sapma tablosu · AC − ' + refL(a), titleHint: 'Kategori sapma tablosu', type: 'Matris', cross: 'Kategoriler[Kategori]', thru: 'katdetay', wells: { 'Satırlar': 'Kategoriler[Kategori]', 'Değerler': 'AC, BÜ/GY, Δ, Δ%' }, measures: ['Net Satış', 'Hedef', 'Hedef Farkı', 'Hedef Gerçekleşme %'], format: ['Δ: ıraksak renk (0 ortada)', 'Δ%: simgeler'],
      why: 'Aynı sapmanın rakamları; grafik ↔ tablo düğmesiyle aynı yerde açılır.',
      render: a => { const K = katQ(a, { except: XK }).filter(x => isN(x.ref)); if (!K.length) return { cats: [], html: noRef() }; const c = K.map(x => x.cat); const ac = sum(K.map(x => x.ac)), rf = sum(K.map(x => x.ref)); return { cats: c, html: a.V.table(['Kategori', 'AC', refL(a), 'Δ', 'Δ%'], K.map(x => [x.cat, x.ac, x.ref, x.ac - x.ref, ratio(x.ac, x.ref)]), { fmts: [null, 'para', 'para', 'para', 'yuzde'], cf: { 3: 'diverge', 4: 'icon' }, cfMid: 0, cfTarget: 0, sel: a.sel(c, 'Kategoriler', 'Kategori'), compact: true, total: ['Toplam', ac, rf, ac - rf, ratio(ac, rf)] }) }; } },
    { id: 'vay', span: 6, title: a => 'Aylık sapma · Δ% ' + refL(a), titleHint: 'Aylık sapma · Δ% BÜ/GY', type: 'Sapma çubukları (IBCS, özel görsel)', wells: { 'Kategori': 'Tarih[Ay] / Tarih[YilAy]', 'Gerçekleşen (AC)': '[Net Satış]', 'Karşılaştırma': 'BÜ ya da GY' }, measures: ['Net Satış', 'Hedef', 'Satış GY'], format: ['Yüzde sapma', 'Zaman dikey eksende (IBCS’de liste görünümü)'],
      why: 'Sapma hangi aylarda oluştu? Yüzde sapma, büyük ve küçük ayları aynı ölçekte karşılaştırır.',
      render: a => { const R = ayQ(a); return R.length ? a.V.variance(R, { fmt: 'para', refLabel: refL(a), mode: 'pct' }) : noRef(); } },
    { id: 'kopru', span: 12, title: a => 'Sapma köprüsü: kategorilerden toplam Δ' + refL(a) + '\'ye', titleHint: 'Sapma köprüsü: kategorilerden toplam Δ', type: 'Şelale', wells: { 'Kategori': 'Kategoriler[Kategori]', 'Y ekseni': 'Δ = [Net Satış] − karşılaştırma' }, measures: ['Net Satış', 'Hedef', 'Hedef Farkı'], format: ['Bitiş: toplam sapma', 'Kategoriler sapmaya göre sıralı', 'Başlangıç sütunu yok: ölçek sapmaya odaklanır'],
      why: 'Toplam sapmayı kategorilere böler. Köprü bütçe toplamından başlasaydı 760 binlik sütunun yanında birkaç binlik farklar görünmezdi; bu yüzden yalnızca farklar çizilir ve toplam Δ ile biter.',
      render: a => { const K = katQ(a).filter(x => isN(x.ref)).sort((p, q) => (q.ac - q.ref) - (p.ac - p.ref)); if (!K.length) return noRef(); return a.V.waterfall({ cats: K.map(x => x.cat), series: [{ name: 'Δ', vals: K.map(x => x.ac - x.ref) }], fmt: 'para' }, { endLabel: 'Toplam Δ' }); } },
    { id: 'pnl', span: 12, title: a => a.prm('ref') === 'BU' ? 'Gelir ve gider tablosu: gerçekleşen ve bütçe' : 'Gelir tablosu: gerçekleşen ve geçen yıl', titleHint: 'Gelir tablosu: AC ve BÜ/GY', type: 'Matris (gelir tablosu, IBCS)', wells: { 'Satırlar': 'Kalem tablosu (kategoriler, maliyet, gider türleri, alt toplamlar)', 'Değerler': 'AC, BÜ/GY, Δ, Δ%, sapma çubuğu' }, measures: ['Net Satış', 'Hedef', 'Net Maliyet', 'Brüt Kâr', 'Gider', 'Gider Bütçe', 'Faaliyet Kârı'], format: ['Alt toplam satırları kalın', 'Maliyet ve giderde artış kırmızı (ters renk)', 'Satır içi sapma çubuğu'],
      why: 'Finansçının asıl çalışma ekranı. Bütçe modunda satış kategorileri hedefe, giderler gider bütçesine göre; geçen yıl modunda tam gelir tablosu (brüt kâr ve faaliyet kârı dahil). Maliyet satırlarında renk kuralı ters çevrilir.',
      render: a => { const K = katQ(a).filter(x => isN(x.ref)); if (!K.length) return noRef(); const bu = a.prm('ref') === 'BU'; const G = a.Q(['GiderTurleri[GiderTuru]'], ['Gider', 'GRef'], { totals: false, extraMeasures: { 'GRef': bu ? '[Gider Bütçe]' : GYX('Gider') } }).rows.filter(x => isN(x.vals[0])).map(x => ({ keys: x.keys, vals: x.vals.map(v => isN(v) ? Math.round(v) : v) })); const ac = sum(K.map(x => x.ac)), rf = sum(K.map(x => x.ref)); const gA = sum(G.map(x => x.vals[0])), gR = G.every(x => isN(x.vals[1])) ? sum(G.map(x => x.vals[1])) : null;
        let rows = K.map(x => ({ label: x.cat, ac: x.ac, ref: x.ref, level: 1 })).concat([{ label: 'Net satış', ac, ref: rf, kind: 'sub' }]);
        if (!bu) { const nm = a.M('[Net Maliyet]'), nmG = a.M(GYX('Net Maliyet')); rows = rows.concat([{ label: 'Satılan malın maliyeti', ac: nm, ref: nmG, level: 1, cost: true }, { label: 'Brüt kâr', ac: ac - (nm || 0), ref: isN(nmG) ? rf - nmG : null, kind: 'sub' }]); }
        rows = rows.concat(G.map(x => ({ label: x.keys[0], ac: x.vals[0], ref: x.vals[1], level: 1, cost: true })), [{ label: 'Faaliyet giderleri', ac: gA, ref: gR, kind: 'sub', cost: true }]);
        if (!bu) { const fk = a.M('[Faaliyet Kârı]'), fkG = a.M(GYX('Faaliyet Kârı')); rows.push({ label: 'Faaliyet kârı', ac: fk, ref: fkG, kind: 'total' }); }
        return a.V.pnl(rows, { fmt: 'para', short: true, acLabel: 'AC ' + a.yearLabel, refLabel: refL(a), head: 'Kalem' }); } }
  ];

  /* sayfa 3: Bütçe takibi */
  const takipPage = [
    pnav('nav3', PG),
    kc('b1', 4, 'YTD hedef gerçekleşme', { 'Değer': 'DIVIDE([Satış YTD], [Hedef YTD])' }, ['Satış YTD', 'Hedef YTD'], 'Yılbaşından bugüne gerçekleşen / yılbaşından bugüne hedef. Yıl içinde “hedefin neresindeyiz?” sorusunun tek sayısı.',
      a => { const v = a.M('DIVIDE([Satış YTD], [Hedef YTD])'); return isN(v) ? { v, fmt: 'yuzde', icon: '%', delta: v - 1, deltaFmt: 'pp', dlabel: 'hedefe göre', sub: 'YTD ' + a.fmt(a.M('[Satış YTD]'), 'para', true) + ' / hedef ' + a.fmt(a.M('[Hedef YTD]'), 'para', true) } : null; }),
    kc('b2', 4, 'Hedefi tutan kategori', { 'Değer': 'COUNTROWS(FILTER(VALUES(Kategoriler[Kategori]), [Net Satış] >= [Hedef]))' }, ['Net Satış', 'Hedef'], 'Toplam hedefi tutturmak kategorilerin çoğunun tuttuğu anlamına gelmez; dağılım ayrıca izlenir.',
      a => { const K = katQ(a, { except: XK, extraMeasures: { 'Ref': '[Hedef]' } }).filter(x => isN(x.ref) && x.ref > 0); if (!K.length) return null; const n = K.filter(x => x.ac >= x.ref).length; return { v: n, fmt: 'adet', icon: '✓', sub: K.length + ' kategoriden · %' + Math.round(n / K.length * 100) }; }),
    kc('b3', 4, 'Gider bütçe sapması', { 'Değer': '[Gider Sapma %]' }, ['Gider', 'Gider Bütçe', 'Gider Sapma', 'Gider Sapma %'], 'Gider tarafında pozitif sapma bütçe aşımıdır (kötü); rozet bu yüzden ters renklenir. Giderler kanal dilimleyicisinden etkilenmez.',
      a => { const v = a.M('[Gider Sapma %]'); return isN(v) ? { v, fmt: 'yuzde', icon: '↧', delta: v, invert: true, deltaFmt: 'pp', dlabel: 'bütçeye göre', sub: 'Gider ' + a.fmt(a.M('[Gider]'), 'para', true) + ' · bütçe ' + a.fmt(a.M('[Gider Bütçe]'), 'para', true) } : null; }),
    { id: 'ytdline', span: 8, title: a => 'Yılbaşından bugüne satış ve hedef · ' + a.yearLabel, titleHint: 'Yılbaşından bugüne satış ve hedef · <yıl>', type: 'Çizgi grafik', tip: tipMonth, wells: { 'X ekseni': 'Tarih[Ay] / Tarih[YilAy]', 'Y ekseni': '[Satış YTD], [Hedef YTD]', 'Araç ipuçları': 'Rapor sayfası: “Ay ipucu”' }, measures: ['Satış YTD', 'Hedef YTD'], format: ['Hedef: kesik açık gri (IBCS: bütçe çerçeveli/açık)', 'Gerçekleşen: koyu, kalın'],
      why: 'Birikimli seyir, tek tek ayların gürültüsünü söndürür: iki çizgi arasındaki açıklık yıl sonuna doğru kapanıyor mu?',
      render: a => { const r = a.Q([a.timeAxis], ['Satış YTD', 'Hedef YTD'], { totals: false }); const rows = r.rows.filter(x => isN(x.vals[1])); const c = rows.map(x => x.keys[0]); return rows.length ? a.V.line({ cats: c, series: [{ name: 'Satış YTD (AC)', vals: rows.map(x => x.vals[0]), width: 3 }, { name: 'Hedef YTD (BÜ)', vals: rows.map(x => x.vals[1]), dash: true, color: 'var(--axis)', width: 1.6 }], fmt: 'para' }, { legend: 'top', tipx: a.tipx(a.timeAxis, c) }) : empty('Bu seçimde hedef yok'); } },
    { id: 'prog', span: 4, title: 'Kategori hedef ilerlemesi', type: 'İlerleme listesi (madde grafiği varyantı)', cross: 'Kategoriler[Kategori]', thru: 'katdetay', wells: { 'Kategori': 'Kategoriler[Kategori]', 'Değer': '[Net Satış]', 'Hedef': '[Hedef]' }, measures: ['Net Satış', 'Hedef', 'Hedef Gerçekleşme %'], format: ['Yeşil ≥ %100, sarı ≥ %90, kırmızı altı', 'Gerçekleşmeye göre sıralı'],
      why: 'Madde grafiğinin sade hâli: her kategori için tek çubuk ve yüzde. Renk eşikleri koşullu biçimle tanımlıdır.',
      render: a => { const K = katQ(a, { except: XK, extraMeasures: { 'Ref': '[Hedef]' } }).filter(x => isN(x.ref) && x.ref > 0).sort((p, q) => q.ac / q.ref - p.ac / p.ref); const c = K.map(x => x.cat); return K.length ? { cats: c, html: a.V.progress(K.map(x => ({ cat: x.cat, v: x.ac, target: x.ref })), { fmt: 'para', sel: a.sel(c, 'Kategoriler', 'Kategori') }) } : { cats: [], html: empty('Bu seçimde hedef yok') }; } },
    { id: 'aylik', span: 6, title: 'Aylık hedef gerçekleşme', type: 'Sütun grafik', tip: tipMonth, wells: { 'X ekseni': 'Tarih[Ay] / Tarih[YilAy]', 'Y ekseni': '[Hedef Gerçekleşme %]', 'Araç ipuçları': 'Rapor sayfası: “Ay ipucu”' }, measures: ['Hedef Gerçekleşme %'], format: ['Renk: %100 üstü yeşil, altı kırmızı (fx → Kurallar)', 'Analiz: sabit çizgi %100'],
      why: 'Toplamı tutturan bir yıl, hedefin altında kalan birçok ay saklayabilir. Sabit %100 çizgisi her ayın durumunu okunur kılar.',
      render: a => { const r = a.Q([a.timeAxis], ['Hedef Gerçekleşme %'], { totals: false }); const rows = r.rows.filter(x => isN(x.vals[0])); const c = rows.map(x => x.keys[0]); return rows.length ? a.V.column({ cats: c, series: [{ name: 'Gerçekleşme', vals: rows.map(x => x.vals[0]) }], fmt: 'yuzde' }, { colorMode: 'cond', condTarget: 1, lines: [{ type: 'const', value: 1, label: 'Hedef' }], yMin: 'auto', tipx: a.tipx(a.timeAxis, c) }) : empty('Bu seçimde hedef yok'); } },
    { id: 'gvar', span: 6, title: 'Gider türü sapması · AC − BÜ', type: 'Sapma çubukları (IBCS, özel görsel)', wells: { 'Kategori': 'GiderTurleri[GiderTuru]', 'Gerçekleşen (AC)': '[Gider]', 'Bütçe (BÜ)': '[Gider Bütçe]' }, measures: ['Gider', 'Gider Bütçe', 'Gider Sapma'], format: ['Ters renk: bütçe aşımı kırmızı', 'Değer etiketi: Δ ₺'],
      why: 'Gider tarafında IBCS kuralı tersine işler: bütçenin üstü kötüdür. Aşımın hangi kalemde olduğu tek bakışta görülür.',
      render: a => { const R = a.Q(['GiderTurleri[GiderTuru]'], ['Gider', 'Gider Bütçe'], { totals: false }).rows.filter(x => isN(x.vals[0]) && isN(x.vals[1])).map(x => ({ cat: x.keys[0], ac: Math.round(x.vals[0]), ref: Math.round(x.vals[1]) })); return R.length ? a.V.variance(R, { fmt: 'para', refLabel: 'BÜ', invert: true }) : empty('Bu seçimde gider verisi yok'); } }
  ];

  /* gizli detay sayfası: Kategori detayı */
  const detay = [
    header('hdh', a => '<h2>' + a.esc(a.thruVal()) + ' · hedef detayı</h2><p>' + a.esc(a.yearLabel) + ' · Kategori görsellerinde sağ tık → <b>Detaya git</b>. Hedefler kategori × ay düzeyindedir; ürün düzeyinde hedef yoktur.</p>'),
    kc('hd1', 3, 'Gerçekleşen (AC)', { 'Değer': '[Net Satış]' }, ['Net Satış'], 'Kategorinin dönem satışı.',
      a => ({ v: a.M('[Net Satış]'), fmt: 'para', icon: 'AC', spark: col(a.Q(['Tarih[YilAy]'], ['Net Satış'], { totals: false }), 0) })),
    kc('hd2', 3, 'Bütçe (BÜ)', { 'Değer': '[Hedef]' }, ['Hedef'], 'Kategori hedefi (Hedefler tablosu).',
      a => ({ v: a.M('[Hedef]'), fmt: 'para', icon: 'BÜ' })),
    kc('hd3', 3, 'Hedef gerçekleşme', { 'Değer': '[Hedef Gerçekleşme %]' }, ['Hedef Gerçekleşme %', 'Hedef Durumu'], 'Gerçekleşen / hedef; rozet hedefe göre puan farkı.',
      a => { const v = a.M('[Hedef Gerçekleşme %]'); return isN(v) ? { v, fmt: 'yuzde', icon: '◎', delta: v - 1, deltaFmt: 'pp', dlabel: 'hedefe göre', sub: a.M('[Hedef Durumu]') || '' } : null; }),
    kc('hd4', 3, 'Geçen yıla göre', { 'Değer': '[YoY %]' }, ['YoY %', 'Satış GY'], 'Hedef iç ölçüttür; geçen yıl dış gerçeklik. İkisi birlikte okunur.',
      a => { const v = a.M('[YoY %]'); return isN(v) ? { v, fmt: 'yuzde', icon: 'GY', sub: 'Geçen yıl ' + a.fmt(a.M('[Satış GY]'), 'para', true) } : null; }),
    { id: 'hdkombo', span: 8, title: a => a.thruVal() + ': aylık satış ve hedef', titleHint: '<kategori>: aylık satış ve hedef', type: 'Sütun ve çizgi grafik', wells: { 'X ekseni': 'Tarih[Ay] / Tarih[YilAy]', 'Sütun y': '[Net Satış]', 'Çizgi y': '[Hedef]' }, measures: ['Net Satış', 'Hedef'], format: ['Hedefin altındaki aylar kırmızı', 'Hedef: açık gri çizgi'],
      why: 'Genel bakıştaki kombonun bu kategoriye filtrelenmiş hâli; başlık fx ile kategori adını yazar.',
      render: a => { const r = a.Q([a.timeAxis], ['Net Satış', 'Hedef'], { totals: false }); const rows = r.rows.filter(x => isN(x.vals[1])); return rows.length ? a.V.column({ cats: rows.map(x => x.keys[0]), series: [{ name: 'Net Satış', vals: rows.map(x => x.vals[0]) }, { name: 'Hedef', type: 'line', vals: rows.map(x => x.vals[1]), color: 'var(--s2)' }], fmt: 'para' }, { legend: 'top' }).replace(/<g class="vmark([^"]*)" data-i="(\d+)"([^]*?)<\/g>/g, (m0, cl, i) => { const x = rows[+i]; return x && (x.vals[0] || 0) < x.vals[1] ? m0.replace(/fill="var\(--s1\)"/, 'fill="var(--s8)"') : m0; }) : empty('Bu kategoride hedef yok'); } },
    { id: 'hdkanal', span: 4, title: 'Kanal payı', type: 'Halka grafik', wells: { 'Gösterge': 'Satislar[Kanal]', 'Değerler': '[Net Satış]' }, measures: ['Net Satış'], format: ['Ortada toplam'], why: 'Hedef kanal kırılımında verilmez; kanal payı sapmanın nereden geldiğine dair ipucu verir.',
      render: a => { const r = a.Q(['Satislar[Kanal]'], ['Net Satış'], { totals: false }); return r.rows.length ? a.V.donut({ cats: cats(r), series: [{ name: 'Net Satış', vals: col(r, 0) }], fmt: 'para' }, { legend: 'bottom' }) : empty('Satış yok'); } },
    { id: 'hdvar', span: 6, title: 'Aylık sapma · AC − BÜ', type: 'Sapma çubukları (IBCS, özel görsel)', wells: { 'Kategori': 'Tarih[Ay]', 'Gerçekleşen (AC)': '[Net Satış]', 'Bütçe (BÜ)': '[Hedef]' }, measures: ['Net Satış', 'Hedef', 'Hedef Farkı'], format: ['Mutlak sapma (₺)'], why: 'Kategorinin hedef sapması hangi aylarda birikti?',
      render: a => { const r = a.Q([a.timeAxis], ['Net Satış', 'Hedef'], { totals: false }); const R = r.rows.filter(x => isN(x.vals[1])).map(x => ({ cat: x.keys[0], ac: Math.round(x.vals[0] || 0), ref: Math.round(x.vals[1]) })); return R.length ? a.V.variance(R, { fmt: 'para', refLabel: 'BÜ' }) : empty('Bu kategoride hedef yok'); } },
    { id: 'hdurun', span: 6, title: a => a.thruVal() + ' ürünleri: satış ve büyüme', titleHint: '<kategori> ürünleri: satış ve büyüme', type: 'Tablo', wells: { 'Sütunlar': 'Urunler[Urun], [Net Satış], [Satış GY], [YoY %], kategori içindeki pay' }, measures: ['Net Satış', 'Satış GY', 'YoY %', 'Seçime Göre Pay %'], format: ['YoY: simgeler', 'Pay: veri çubukları'],
      why: 'Hedef ürün düzeyinde yok; sapmanın hangi üründen geldiğini görmek için geçen yıla göre büyüme ve kategori içi pay kullanılır.',
      render: a => { const r = sortBy(a.Q(['Urunler[Urun]'], ['Net Satış', 'Satış GY', 'YoY %'], { totals: false }), 0); const rows = r.rows.filter(x => isN(x.vals[0])); const t = sum(rows.map(x => x.vals[0])) || 1; return rows.length ? a.V.table(['Ürün', 'Net Satış', 'Geçen yıl', 'YoY', 'Pay'], rows.map(x => [x.keys[0], x.vals[0], x.vals[1], x.vals[2], x.vals[0] / t]), { fmts: [null, 'para', 'para', 'yuzde', 'yuzde'], cf: { 3: 'icon', 4: 'bar' }, cfTarget: 0, compact: true }) : empty('Satış yok'); } }
  ];

  d.pages = [
    { id: 'genel', name: 'Genel bakış', icon: '◧', tiles: d.tiles },
    { id: 'sapma', name: 'Sapma analizi', icon: '±', tiles: sapmaPage },
    { id: 'takip', name: 'Bütçe takibi', icon: '▦', tiles: takipPage },
    { id: 'katdetay', name: 'Kategori detayı', hidden: true, thru: { field: 'Kategoriler[Kategori]', label: 'Kategori', def: TOP_KAT }, tiles: detay, note: 'Kaynak: madde grafiği, kategori özeti, sapma çubukları, ilerleme listesi' }
  ];
  d.bookmarks = [
    { id: 'y23', name: '2023 bütçe yılı', desc: 'Yıl dilimleyicisi 2023: hedef ve sapmalar o yıl için', page: 'genel', sl: { yil: [2023], kanal: [] }, pr: { ref: 'BU' }, vis: { gorunum: 'grafik' } },
    { id: 'gy', name: 'Geçen yıla göre', desc: 'Sapma analizi, karşılaştırma ölçütü geçen yıl (tam gelir tablosu)', page: 'sapma', sl: { yil: [2024], kanal: [] }, pr: { ref: 'GY' }, vis: { gorunum: 'grafik' } },
    { id: 'mobil', name: 'Yalnızca Mobil', desc: 'Kanal Mobil: hedef kanal kırılımında olmadığı için sapma bilerek büyür (kanal hedefi yoktur)', page: 'genel', sl: { yil: [2024], kanal: ['Mobil'] }, pr: { ref: 'BU' }, vis: { gorunum: 'grafik' } },
    { id: 'tablo', name: 'Sapma tablosu', desc: 'Sapma analizi, grafik yerine tablo', page: 'sapma', sl: { yil: [2024], kanal: [] }, pr: { ref: 'BU' }, vis: { gorunum: 'tablo' } }
  ];
  d.build = [
    ['Soru ve kitle', 'Finans ve bütçe ekibi: bütçeye göre neredeyiz, sapma nerede? Genel bakış “ne kadar saptık?”, Sapma analizi “hangi kategori ve ayda, bütçeye mi geçen yıla mı göre?”, Bütçe takibi “yıl içinde hedefe yetişiyor muyuz, giderler bütçede mi?” sorularını cevaplar.', []],
    ['Model: iki tanecik', 'Hedefler ay × kategori düzeyinde; Satislar gün × ürün düzeyinde. İkisi paylaşılan boyutlara (Tarih, Kategoriler) bağlı. Giderler ve GiderButce Tarih ve GiderTurleri\'ne bağlı. Hedef ve giderin kanal kırılımı olmadığından kanal dilimleyicisi yalnızca satışı değiştirir (yer imi açıklamasında yazılı).', []],
    ['Ölçüler', 'Hedef karşılaştırmaları tek temel ölçü ([Hedef]) üzerine kurulu; gider tarafında [Gider Sapma] pozitifse kötüdür.', ['Hedef', 'Hedef Farkı', 'Hedef Gerçekleşme %', 'Hedef Durumu', 'Hedef YTD', 'Gider', 'Gider Bütçe', 'Gider Sapma', 'Gider Sapma %']],
    ['Tema: IBCS', 'Görünüm → Temalar → Özel tema (JSON): gerçekleşen koyu gri, karşılaştırma açık gri, iyi/kötü yeşil/kırmızı; kenarlıklar kapalı, görsel üstünde ince çizgi. IBCS notasyonu başlıklarda: AC, BÜ, GY, Δ.', []],
    ['Sayfa yapısı', 'Üç görünür sayfa + gizli “Kategori detayı”. Sayfa gezgini her sayfanın başında; yıl ve kanal dilimleyicileri tüm sayfalara eşitlendi.', []],
    ['Alan parametresi', '“Karşılaştırma”: Bütçe (hedef) ya da Geçen yıl. Modelleme → Yeni parametre → Alanlar ile [Hedef] ve [Satış GY]; sapma görsellerinde Δ ölçüsü <code>[Net Satış] − SELECTEDVALUE ile seçilen karşılaştırma</code> olarak yazılır (ya da parametre tablosuna SWITCH).', ['Hedef', 'Satış GY']],
    ['Sapma görselleri', 'IBCS sapma çubukları ve gelir tablosu AppSource’taki IBCS sertifikalı görsellerle ya da matris + koşullu biçim + veri çubuklarıyla yapılır. Köprü (şelale): kategori Δ\'ları, başlangıç = karşılaştırma toplamı.', ['Net Maliyet', 'Brüt Kâr', 'Faaliyet Kârı']],
    ['Detay sayfası', 'Detaya git alanı Kategoriler[Kategori]; kaynaklar madde grafiği, kategori özeti, sapma çubukları/tablosu ve ilerleme listesi. Başlıklar fx → SELECTEDVALUE(Kategoriler[Kategori]).', ['Seçime Göre Pay %']],
    ['Araç ipucu sayfası', '“Ay ipucu”: ayın net satışı, geçen yıla ve hedefe göre farkı, en büyük dört kategori. Kombo, YTD çizgisi ve aylık gerçekleşme sütunlarında Araç ipuçları → Rapor sayfası.', []],
    ['Yer imleri ve seçim bölmesi', 'Sapma çubukları ve sapma tablosu aynı konumda (Seçim bölmesi: Grafik/Tablo). Yer imleri: “2023 bütçe yılı”, “Yalnızca Mobil” (Veri), “Geçen yıla göre” (parametre), “Sapma tablosu” (Görüntü).', []],
    ['Koşullu renk', 'Kombo sütunlarının rengi bir ölçüyle belirlenir (Sütunlar → Renk → fx → Alan değeri); aylık gerçekleşmede kurallar (≥ 1 yeşil).', []]
  ];
})();
})(window);
