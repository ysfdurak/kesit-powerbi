
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
