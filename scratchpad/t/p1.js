/* PBIPatika — mevcut 7 raporun çok sayfalı Power BI raporuna yükseltilmesi: ozet, zaman, urun, musteri, rfm, kohort, hedef.
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
