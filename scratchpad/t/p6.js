
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
