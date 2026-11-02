/* Kesit Power BI — modele eklenen tablolar (dashboardlar için): faaliyet giderleri ve bütçesi, müşteri hizmetleri talepleri,
   tedarikçiler ve satın almalar, proje portföyü. Tamamen kurgusal; satış verisinden türetilir ve her açılışta aynı çıkar. */
(function (root) {
'use strict';
const M = root.PBI_MODEL; if (!M) return;
function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(20261027);
const D = (y, m, d) => new Date(Date.UTC(y, m, d));
const r2 = v => Math.round(v * 100) / 100, r0 = Math.round;
const noise = a => 1 + (R() * 2 - 1) * a;
const S = M.tables.Satislar.rows, U = M.tables.Urunler.rows; const UM = {}; U.forEach(u => UM[u.UrunNo] = u);
const ym = d => d.getUTCFullYear() * 12 + d.getUTCMonth();
/* aylık net satış ve sipariş */
const mon = {}; S.forEach(r => { if (r.Durum === 'İptal') return; const k = ym(r.Tarih); const o = mon[k] || (mon[k] = { s: 0, ord: new Set() }); o.s += r.Tutar; o.ord.add(r.SiparisNo); });
const tgt = {}; M.tables.Hedefler.rows.forEach(h => { const k = ym(h.Tarih); tgt[k] = (tgt[k] || 0) + h.Hedef; });

/* 1) Gider türleri, giderler, gider bütçesi */
const GiderTurleri = [
  { GiderTuru: 'Personel', Grup: 'Personel', Sira: 1, DepartmanNo: 1 },
  { GiderTuru: 'Kira ve tesis', Grup: 'Genel giderler', Sira: 2, DepartmanNo: 0 },
  { GiderTuru: 'Pazarlama ve reklam', Grup: 'Satış ve pazarlama', Sira: 3, DepartmanNo: 2 },
  { GiderTuru: 'Lojistik ve kargo', Grup: 'Satış ve pazarlama', Sira: 4, DepartmanNo: 1 },
  { GiderTuru: 'Teknoloji', Grup: 'Genel giderler', Sira: 5, DepartmanNo: 4 },
  { GiderTuru: 'Genel yönetim', Grup: 'Genel giderler', Sira: 6, DepartmanNo: 0 }
];
const Giderler = [], GiderButce = [];
let gNo = 1, idx = 0;
for (let k = ym(D(2022, 5, 1)); k <= ym(D(2024, 11, 1)); k++, idx++) {
  const y = Math.floor(k / 12), m = k % 12, dt = D(y, m, 1); const s = (mon[k] || { s: 0 }).s, o = (mon[k] ? mon[k].ord.size : 0); const T = tgt[k] || s;
  const peak = (m === 10 || m === 11) ? 1 : 0;
  const act = { 'Personel': (2200 + 0.07 * s) * noise(.04), 'Kira ve tesis': y >= 2024 ? 1800 : 1500, 'Pazarlama ve reklam': (0.055 * s + 300 + peak * 1500) * noise(.12), 'Lojistik ve kargo': 12 * o * noise(.08), 'Teknoloji': (500 + 10 * idx) * noise(.05) + (m === 0 ? 1200 : 0), 'Genel yönetim': 700 * noise(.15) };
  const bud = { 'Personel': 2200 + 0.068 * T, 'Kira ve tesis': y >= 2024 ? 1800 : 1500, 'Pazarlama ve reklam': 0.05 * T + 300 + peak * 1200, 'Lojistik ve kargo': 11 * T / 1450, 'Teknoloji': 520 + 10 * idx + (m === 0 ? 1000 : 0), 'Genel yönetim': 750 };
  GiderTurleri.forEach(g => { Giderler.push({ GiderNo: gNo++, Tarih: dt, GiderTuru: g.GiderTuru, DepartmanNo: g.DepartmanNo, Tutar: r2(act[g.GiderTuru]) }); GiderButce.push({ Tarih: dt, GiderTuru: g.GiderTuru, Butce: r2(bud[g.GiderTuru]) }); });
}

/* 2) Müşteri hizmetleri talepleri (satışlardan türetilir) */
const Talepler = []; let tNo = 1;
const KANAL = ['Telefon', 'E-posta', 'Canlı destek', 'Sosyal medya'], KW = [.34, .28, .3, .08];
const pickW = (a, w) => { let x = R(), c = 0; for (let i = 0; i < a.length; i++) { c += w[i]; if (x <= c) return a[i]; } return a[a.length - 1]; };
const addT = (dt, mus, konu, sev) => {
  const kanal = pickW(KANAL, KW); const yil = dt.getUTCFullYear(); const improve = yil >= 2024 ? .75 : 1;
  const ilk = r0((kanal === 'Canlı destek' ? 4 + R() * 12 : kanal === 'Telefon' ? 2 + R() * 10 : kanal === 'Sosyal medya' ? 30 + R() * 240 : 40 + R() * 420) * improve);
  const coz = r2((konu === 'İade ve değişim' ? 24 + R() * 72 : konu === 'Hasarlı ürün' ? 12 + R() * 60 : konu === 'Kargo gecikmesi' ? 6 + R() * 40 : 1 + R() * 20) * improve);
  const cozuldu = R() < (konu === 'Hasarlı ürün' ? .86 : .94) ? 'Evet' : 'Hayır';
  const base = cozuldu === 'Hayır' ? 1.6 : 4.4 - (coz > 48 ? 1.1 : coz > 24 ? .6 : 0) - (ilk > 240 ? .7 : 0) - (sev === 'Yüksek' ? .3 : 0);
  const mem = R() < .62 ? Math.max(1, Math.min(5, r0(base + (R() * 1.6 - .8)))) : null;
  Talepler.push({ TalepNo: tNo++, Tarih: dt, MusteriNo: mus, Kanal: kanal, Konu: konu, Oncelik: sev, IlkYanitDk: ilk, CozumSaat: coz, Cozuldu: cozuldu, Memnuniyet: mem });
};
const seenOrd = new Set();
S.forEach(r => {
  if (r.Tarih < D(2023, 0, 1)) return;
  const ad = (n) => new Date(r.Tarih.getTime() + n * 864e5); const t = ad(1 + Math.floor(R() * 6)); if (t > D(2024, 11, 31)) return;
  if (r.Durum === 'İade' && R() < .8) addT(t, r.MusteriNo, 'İade ve değişim', 'Orta');
  else if (r.KargoGun != null && r.KargoGun >= 6 && !seenOrd.has(r.SiparisNo) && R() < .55) { seenOrd.add(r.SiparisNo); addT(ad(r.KargoGun - 1), r.MusteriNo, 'Kargo gecikmesi', r.KargoGun >= 8 ? 'Yüksek' : 'Orta'); }
  else if (r.Durum === 'Teslim Edildi' && R() < .025) addT(t, r.MusteriNo, 'Hasarlı ürün', 'Yüksek');
  else if (R() < .1) addT(ad(-Math.floor(R() * 3)), r.MusteriNo, pickW(['Ürün bilgisi', 'Ödeme', 'Hesap ve üyelik', 'Diğer'], [.45, .25, .18, .12]), 'Düşük');
});
Talepler.sort((a, b) => a.Tarih - b.Tarih || a.TalepNo - b.TalepNo); Talepler.forEach((t, i) => t.TalepNo = i + 1);

/* 3) Tedarikçiler ve satın almalar (stok girişlerinden) */
const Tedarikciler = [
  { TedarikciNo: 1, Tedarikci: 'Delta Elektronik', Ulke: 'Türkiye', Sehir: 'İstanbul', SozGun: 5 },
  { TedarikciNo: 2, Tedarikci: 'Shenzhen Link Co.', Ulke: 'Çin', Sehir: 'Shenzhen', SozGun: 21 },
  { TedarikciNo: 3, Tedarikci: 'Ege Tekstil', Ulke: 'Türkiye', Sehir: 'Denizli', SozGun: 7 },
  { TedarikciNo: 4, Tedarikci: 'Anka Yayın Dağıtım', Ulke: 'Türkiye', Sehir: 'Ankara', SozGun: 4 },
  { TedarikciNo: 5, Tedarikci: 'Marmara Ev Gereçleri', Ulke: 'Türkiye', Sehir: 'Bursa', SozGun: 6 },
  { TedarikciNo: 6, Tedarikci: 'Lumière Kozmetik', Ulke: 'Fransa', Sehir: 'Lyon', SozGun: 14 },
  { TedarikciNo: 7, Tedarikci: 'Atlas Spor', Ulke: 'Türkiye', Sehir: 'İzmir', SozGun: 6 },
  { TedarikciNo: 8, Tedarikci: 'Hediyelik Atölye', Ulke: 'Türkiye', Sehir: 'Eskişehir', SozGun: 5 }
];
const TQ = { 1: [.02, 1.6, 1.00], 2: [.045, 6, .93], 3: [.025, 2.2, 1.01], 4: [.006, 1.2, 1.00], 5: [.018, 2, .99], 6: [.012, 4, 1.04], 7: [.03, 2.8, .98], 8: [.01, 1.4, 1.02] }; // kusur oranı, gecikme oynaklığı, fiyat çarpanı
const supOf = u => { const k = u.Kategori; if (k === 'Elektronik') return u.UrunNo % 2 ? 1 : 2; if (k === 'Giyim') return 3; if (k === 'Kitap') return 4; if (k === 'Ev & Yaşam') return 5; if (k === 'Kozmetik') return 6; if (k === 'Spor') return 7; return 8; };
const SatinAlmalar = []; let pNo = 1;
M.tables.StokGorunum.rows.forEach(r => { if (!r.GelenAdet) return; const u = UM[r.UrunNo]; if (!u) return; const t = supOf(u), q = TQ[t], sz = Tedarikciler[t - 1].SozGun;
  const tg = Math.max(1, r0(sz + (R() * 2 - 1.25) * q[1])); const bf = r2(u.BirimMaliyet * q[2] * noise(.03)); let kus = 0; for (let n = 0; n < r.GelenAdet; n++) if (R() < q[0] * 2.5) kus++;
  SatinAlmalar.push({ SiparisNo: pNo++, Tarih: r.Tarih, UrunNo: r.UrunNo, TedarikciNo: t, Adet: r.GelenAdet, BirimFiyat: bf, Tutar: r2(bf * r.GelenAdet), TeslimGun: tg, Zamaninda: tg <= sz ? 'Evet' : 'Hayır', Kusurlu: kus }); });

/* 4) Proje portföyü (BI ve dijital projeler) */
const Projeler = [
  ['Yönetim kokpiti (Power BI)', 3, 'Veri Analitiği', D(2024, 0, 8), D(2024, 2, 29), D(2024, 3, 12), 'Tamamlandı', 180000, 192500, 1],
  ['Müşteri 360 veri modeli', 3, 'Veri Analitiği', D(2024, 2, 4), D(2024, 6, 31), D(2024, 7, 23), 'Tamamlandı', 260000, 271000, 1],
  ['Mobil uygulama yenileme', 4, 'Yazılım', D(2024, 1, 1), D(2024, 9, 31), null, 'Gecikmede', 540000, 498000, .78],
  ['Depo yönetim sistemi entegrasyonu', 4, 'Yazılım', D(2024, 3, 15), D(2024, 10, 30), null, 'Devam', 320000, 205000, .64],
  ['Sadakat programı', 2, 'Pazarlama', D(2024, 4, 1), D(2024, 11, 20), null, 'Devam', 150000, 81000, .55],
  ['Kampanya ölçümleme altyapısı', 2, 'Pazarlama', D(2024, 5, 10), D(2024, 9, 15), null, 'Riskli', 90000, 84000, .6],
  ['Fabric veri platformu geçişi', 3, 'Veri Analitiği', D(2024, 6, 1), D(2025, 2, 31), null, 'Devam', 420000, 151000, .35],
  ['Satış temsilcisi performans raporu', 1, 'Satış', D(2024, 7, 5), D(2024, 9, 30), D(2024, 9, 25), 'Tamamlandı', 45000, 41200, 1],
  ['Bütçe ve tahmin (FP&A) modeli', 6, 'Finans', D(2024, 8, 2), D(2025, 0, 31), null, 'Devam', 210000, 72000, .4],
  ['Ücret karşılaştırma analizi', 5, 'İnsan Kaynakları', D(2024, 9, 1), D(2024, 11, 15), null, 'Gecikmede', 60000, 52000, .7],
  ['KVKK veri envanteri', 7, 'Hukuk', D(2024, 2, 1), D(2024, 5, 30), D(2024, 6, 19), 'Tamamlandı', 75000, 79800, 1],
  ['Yapay zekâ destekli talep tahmini', 3, 'Veri Analitiği', D(2024, 10, 4), D(2025, 4, 30), null, 'Planlandı', 300000, 18000, .05],
  ['E-fatura otomasyonu', 6, 'Finans', D(2023, 9, 2), D(2024, 1, 29), D(2024, 1, 26), 'Tamamlandı', 110000, 104000, 1],
  ['Çağrı merkezi yazılımı', 4, 'Yazılım', D(2024, 8, 16), D(2025, 1, 28), null, 'Riskli', 280000, 160000, .38]
].map((p, i) => ({ ProjeNo: i + 1, Proje: p[0], DepartmanNo: p[1], Birim: p[2], Baslangic: p[3], BitisPlan: p[4], BitisGercek: p[5], Durum: p[6], Butce: p[7], Harcanan: p[8], Ilerleme: p[9] }));

/* Modele ekle */
Object.assign(M.tables, {
  GiderTurleri: { rows: GiderTurleri, cols: ['GiderTuru', 'Grup', 'Sira', 'DepartmanNo'], kind: 'dim', sortBy: { GiderTuru: 'Sira' } },
  Giderler: { rows: Giderler, cols: ['GiderNo', 'Tarih', 'GiderTuru', 'DepartmanNo', 'Tutar'], kind: 'fact' },
  GiderButce: { rows: GiderButce, cols: ['Tarih', 'GiderTuru', 'Butce'], kind: 'fact' },
  Talepler: { rows: Talepler, cols: ['TalepNo', 'Tarih', 'MusteriNo', 'Kanal', 'Konu', 'Oncelik', 'IlkYanitDk', 'CozumSaat', 'Cozuldu', 'Memnuniyet'], kind: 'fact' },
  Tedarikciler: { rows: Tedarikciler, cols: ['TedarikciNo', 'Tedarikci', 'Ulke', 'Sehir', 'SozGun'], kind: 'dim' },
  SatinAlmalar: { rows: SatinAlmalar, cols: ['SiparisNo', 'Tarih', 'UrunNo', 'TedarikciNo', 'Adet', 'BirimFiyat', 'Tutar', 'TeslimGun', 'Zamaninda', 'Kusurlu'], kind: 'fact' },
  Projeler: { rows: Projeler, cols: ['ProjeNo', 'Proje', 'DepartmanNo', 'Birim', 'Baslangic', 'BitisPlan', 'BitisGercek', 'Durum', 'Butce', 'Harcanan', 'Ilerleme'], kind: 'fact' }
});
M.rels.push(
  { from: 'Giderler', fromCol: 'Tarih', to: 'Tarih', toCol: 'Tarih' },
  { from: 'Giderler', fromCol: 'GiderTuru', to: 'GiderTurleri', toCol: 'GiderTuru' },
  { from: 'Giderler', fromCol: 'DepartmanNo', to: 'Departmanlar', toCol: 'DepartmanNo' },
  { from: 'GiderButce', fromCol: 'Tarih', to: 'Tarih', toCol: 'Tarih' },
  { from: 'GiderButce', fromCol: 'GiderTuru', to: 'GiderTurleri', toCol: 'GiderTuru' },
  { from: 'Talepler', fromCol: 'Tarih', to: 'Tarih', toCol: 'Tarih' },
  { from: 'Talepler', fromCol: 'MusteriNo', to: 'Musteriler', toCol: 'MusteriNo' },
  { from: 'SatinAlmalar', fromCol: 'Tarih', to: 'Tarih', toCol: 'Tarih' },
  { from: 'SatinAlmalar', fromCol: 'UrunNo', to: 'Urunler', toCol: 'UrunNo' },
  { from: 'SatinAlmalar', fromCol: 'TedarikciNo', to: 'Tedarikciler', toCol: 'TedarikciNo' },
  { from: 'Projeler', fromCol: 'DepartmanNo', to: 'Departmanlar', toCol: 'DepartmanNo' }
);
Object.assign(M.notes || (M.notes = {}), {
  Giderler: 'Olgu: e-ticaret biriminin aylık faaliyet giderleri (gider türü × ay). Kurgusal; satış ve sipariş hacminden türetildi. Calisanlar[Maas] şirketin tüm çalışanlarını gösterir; buradaki Personel gideri yalnızca e-ticaret birimine dağıtılan paydır, ikisi oranlanmaz. Gelir tablosu (P&L) dashboardunda brüt kârdan düşülür.',
  GiderButce: 'Olgu: aylık gider bütçesi (gider türü × ay). Gider ile aynı ayrıntı düzeyinde; ikisi GiderTurleri ve Tarih üzerinden karşılaştırılır.',
  GiderTurleri: 'Boyut: 6 gider türü ve grubu. Giderler ile GiderButce arasında paylaşılan boyut.',
  Talepler: 'Olgu: müşteri hizmetleri talepleri (2023–2024). Kargo gecikmesi ve iade talepleri satışlardan türetildi; Memnuniyet her talepte yok (anket yanıtı).',
  Tedarikciler: 'Boyut: 8 tedarikçi; SozGun söz verilen teslim süresidir.',
  SatinAlmalar: 'Olgu: stok girişlerinden türetilen satın alma siparişleri; teslim süresi, zamanında teslim ve kusurlu adet.',
  Projeler: 'Olgu: proje portföyü (14 proje). Tarih tablosuna bağlı değil; Gantt benzeri zaman çizelgesi için Baslangic/BitisPlan kullanılır.'
});
})(typeof window !== 'undefined' ? window : globalThis);
