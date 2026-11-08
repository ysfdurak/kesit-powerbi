global.window = global; const P = (require('path').resolve(__dirname, '../app') + '/');
for (const f of ['data','data2','dax','measures']) require(P + f + '.js');
const X = PBI_DAX, M = PBI_MODEL.tables; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const S = M.Satislar.rows, U = {}; M.Urunler.rows.forEach(u => U[u.UrunNo] = u); const MU = {}; M.Musteriler.rows.forEach(m => MU[m.MusteriNo] = m);
const net = r => r.Durum !== 'İptal'; const y = r => r.Tarih.getUTCFullYear();
const sum = (rows, f) => rows.reduce((a, r) => a + f(r), 0); const near = (a, b) => Math.abs((a || 0) - (b || 0)) < 1e-6 * Math.max(1, Math.abs(b || 0));
let bad = 0, n = 0; const chk = (lbl, eng, js) => { n++; if (!near(eng, js)) { bad++; console.log('FARK', lbl, eng, js); } };
const E = (e, f) => X.evalMeasure(ms, e, f || []); const F = (t, c, v) => ({ t, c, values: [v] });
for (const yr of [2022, 2023, 2024]) {
  const R = S.filter(r => net(r) && y(r) === yr);
  chk('Net Satış ' + yr, E('[Net Satış]', [F('Tarih', 'Yil', yr)]), sum(R, r => r.Tutar));
  chk('Brüt Kâr ' + yr, E('[Brüt Kâr]', [F('Tarih', 'Yil', yr)]), sum(R, r => r.Tutar - r.Maliyet));
  chk('Sipariş ' + yr, E('[Sipariş Sayısı]', [F('Tarih', 'Yil', yr)]), new Set(R.map(r => r.SiparisNo)).size);
  chk('Müşteri ' + yr, E('[Müşteri Sayısı]', [F('Tarih', 'Yil', yr)]), new Set(R.map(r => r.MusteriNo)).size);
  if (yr > 2022) chk('Satış GY ' + yr, E('[Satış GY]', [F('Tarih', 'Yil', yr)]), sum(S.filter(r => net(r) && y(r) === yr - 1), r => r.Tutar));
  for (const k of ['Elektronik', 'Kitap', 'Hediye']) chk('Kat ' + k + yr, E('[Net Satış]', [F('Tarih', 'Yil', yr), F('Kategoriler', 'Kategori', k)]), sum(R.filter(r => U[r.UrunNo].Kategori === k), r => r.Tutar));
  for (const sg of ['Bireysel', 'Premium']) chk('Seg ' + sg + yr, E('[Net Satış]', [F('Tarih', 'Yil', yr), F('Musteriler', 'Segment', sg)]), sum(R.filter(r => MU[r.MusteriNo].Segment === sg), r => r.Tutar));
  // YTD Haziran
  chk('YTD Haz ' + yr, E('[Satış YTD]', [F('Tarih', 'YilAy', yr + '-06')]), sum(R.filter(r => r.Tarih.getUTCMonth() <= 5), r => r.Tutar));
  // 3 ay hareketli ort (Mart)
  chk('3AyOrt Mar ' + yr, E('[3 Ay Hareketli Ort.]', [F('Tarih', 'YilAy', yr + '-03')]), sum(S.filter(r => net(r) && y(r) === yr && r.Tarih.getUTCMonth() <= 2), r => r.Tutar) / 3);
}
// Hedef
chk('Hedef 2024', E('[Hedef]', [F('Tarih', 'Yil', 2024)]), sum(M.Hedefler.rows.filter(h => h.Tarih.getUTCFullYear() === 2024), h => h.Hedef));
// İade oranı
chk('İade oranı', E('[İade Oranı %]'), S.filter(r => r.Durum === 'İade').length / S.length);
// Rank: top product
const byP = {}; S.filter(net).forEach(r => byP[U[r.UrunNo].Urun] = (byP[U[r.UrunNo].Urun] || 0) + r.Tutar);
const sorted = Object.entries(byP).sort((a, b) => b[1] - a[1]);
chk('Ürün sırası #1', E('[Ürün Sırası]', [F('Urunler', 'Urun', sorted[0][0])]), 1);
chk('Ürün sırası #5', E('[Ürün Sırası]', [F('Urunler', 'Urun', sorted[4][0])]), 5);
// Kategori payı
chk('Kategori payı Kitap', E('[Kategori Payı %]', [F('Kategoriler', 'Kategori', 'Kitap')]), sum(S.filter(r => net(r) && U[r.UrunNo].Kategori === 'Kitap'), r => r.Tutar) / sum(S.filter(net), r => r.Tutar));
// Stok değeri
if (ms['Stok Değeri']) chk('Stok değeri', E('[Stok Değeri]'), sum(M.Urunler.rows, u => u.Stok * u.BirimMaliyet));
// Yeni müşteri 2023
const first = {}; S.filter(net).forEach(r => { if (!first[r.MusteriNo] || r.Tarih < first[r.MusteriNo]) first[r.MusteriNo] = r.Tarih; });
for (const yy of [2023, 2024]) chk('Yeni müşteri ' + yy, E('[Yeni Müşteri]', [F('Tarih', 'Yil', yy)]), Object.entries(first).filter(([k, d]) => d.getUTCFullYear() === yy).length);
// Kümülatif
chk('Kümülatif 2023-12', E('[Kümülatif Satış]', [F('Tarih', 'YilAy', '2023-12')]), sum(S.filter(r => net(r) && y(r) <= 2023), r => r.Tutar));
// aynı sütuna iki filtre kesişmeli; BLANK <= 3 tuzağı
chk('İki filtre aynı sütun', E('CALCULATE(COUNTROWS(Satislar), Satislar[KargoGun] <= 3, Satislar[KargoGun] >= 2)'), S.filter(r => r.KargoGun != null && r.KargoGun <= 3 && r.KargoGun >= 2).length);
chk('Zamanında teslim', E('[Zamanında Teslim %]'), S.filter(r => r.KargoGun != null && r.KargoGun <= 3).length / S.filter(r => r.KargoGun != null).length);
// zaman fonksiyonunda bağlam geçişi
chk('PREVIOUSMONTH satır bağlamında', E('SUMX(VALUES(Tarih[YilAy]), CALCULATE([Net Satış], PREVIOUSMONTH(Tarih[Tarih])))', [F('Tarih', 'Yil', 2024)]), sum(S.filter(r => net(r) && ((y(r) === 2024 && r.Tarih.getUTCMonth() <= 10) || (y(r) === 2023 && r.Tarih.getUTCMonth() === 11))), r => r.Tutar));
// SUMMARIZECOLUMNS ifadeleri grup bağlamında hesaplanmalı
{ const r = X.runQuery(ms, 'EVALUATE SUMMARIZECOLUMNS(Satislar[Kanal], "n", COUNTROWS(Satislar))'); r.rows.forEach(x => chk('SUMMARIZECOLUMNS ' + x[0], x[1], S.filter(z => z.Kanal === x[0]).length)); }
{ const r = X.runQuery(ms, 'EVALUATE SUMMARIZECOLUMNS(Urunler[Kategori], "n", COUNTROWS(Urunler))'); r.rows.forEach(x => chk('Kategori ürün ' + x[0], x[1], M.Urunler.rows.filter(u => u.Kategori === x[0]).length)); }
// Sütun filtresi tablo filtresinden yalnızca o sütunu çıkarır (bağlam geçişi + iç CALCULATE)
chk('SUMX(Satislar,[Net Satış])', E('SUMX(Satislar, [Net Satış])', []), sum(S.filter(net), r => r.Tutar));
chk('FILTER(ALL(Satislar)) + Net', E('CALCULATE([Net Satış], FILTER(ALL(Satislar), Satislar[Kanal] = "Web"))', []), sum(S.filter(r => net(r) && r.Kanal === 'Web'), r => r.Tutar));
chk('İptal tablo filtresi + Net = boş', E('CALCULATE([Net Satış], FILTER(Satislar, Satislar[Durum] = "İptal"))', []) || 0, 0);
chk('ALL(Durum) tablo filtresinden yalnızca Durum’u çıkarır', E('CALCULATE(CALCULATE(SUM(Satislar[Tutar]), ALL(Satislar[Durum])), FILTER(Satislar, Satislar[Durum] = "İptal"))', []), sum(S.filter(r => r.Durum === 'İptal'), r => r.Tutar));
// ALLEXCEPT bağlam geçişini korunan sütuna izdüşürür
{ const c = {}, k = {}; M.Urunler.rows.forEach(r => c[r.Kategori] = (c[r.Kategori] || 0) + 1); S.forEach(r => k[r.Kanal] = (k[r.Kanal] || 0) + 1);
  chk('ALLEXCEPT ürün', E('SUMX(Urunler, CALCULATE(COUNTROWS(Urunler), ALLEXCEPT(Urunler, Urunler[Kategori])))', []), Object.values(c).reduce((a, b) => a + b * b, 0));
  chk('ALLEXCEPT satış', E('SUMX(Satislar, CALCULATE(COUNTROWS(Satislar), ALLEXCEPT(Satislar, Satislar[Kanal])))', []), Object.values(k).reduce((a, b) => a + b * b, 0));
  chk('ALLEXCEPT kategori max', E('COUNTROWS(FILTER(Urunler, Urunler[Fiyat] = CALCULATE(MAX(Urunler[Fiyat]), ALLEXCEPT(Urunler, Urunler[Kategori]))))', []), Object.keys(c).length); }
{ const r = X.runQuery(ms, 'EVALUATE SUMMARIZE(Satislar, Satislar[Kanal], "n", COUNTROWS(Satislar))'); r.rows.forEach(x => chk('SUMMARIZE genişletme ' + x[0], x[1], S.filter(z => z.Kanal === x[0]).length)); }
{ const r = X.runQuery(ms, 'EVALUATE GROUPBY(Satislar, Satislar[Kanal], "t", SUMX(CURRENTGROUP(), Satislar[Tutar]))'); r.rows.forEach(x => chk('GROUPBY ' + x[0], x[1], sum(S.filter(z => z.Kanal === x[0]), z => z.Tutar))); }
chk('DATEDIFF boş başlangıç', E('DATEDIFF(BLANK(), DATE(2024, 12, 31), DAY)', []), 45657);
console.log('kontrol', n, 'fark', bad);
