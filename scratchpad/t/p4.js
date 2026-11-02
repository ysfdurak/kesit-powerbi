
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
