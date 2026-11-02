
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
