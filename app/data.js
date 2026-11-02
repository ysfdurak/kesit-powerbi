(function (root) {
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const R = rng(20241021);
  const pick = a => a[Math.floor(R() * a.length)];
  const int = (a, b) => a + Math.floor(R() * (b - a + 1));
  const q = v => v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'";
  const pad = n => String(n).padStart(2, '0');
  const dstr = d => d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  const tstr = d => dstr(d) + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
  const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
  const ins = (t, cols, rows) => {
    let s = '';
    for (let i = 0; i < rows.length; i += 400) {
      s += 'INSERT INTO ' + t + ' (' + cols.join(',') + ') VALUES\n' + rows.slice(i, i + 400).map(r => '(' + r.map(q).join(',') + ')').join(',\n') + ';\n';
    }
    return s;
  };

  const firstM = ['Ahmet','Mehmet','Mustafa','Ali','Hüseyin','Hasan','Emre','Burak','Can','Murat','Kerem','Yusuf','Oğuz','Serkan','Deniz','Barış','Tolga','Onur','Eren','Kaan'];
  const firstF = ['Ayşe','Fatma','Zeynep','Elif','Emine','Merve','Esra','Selin','Ece','Derya','Buse','Gamze','İrem','Seda','Nur','Defne','Ceren','Aslı','Pınar','Duygu'];
  const lastN = ['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Yıldırım','Öztürk','Aydın','Özdemir','Arslan','Doğan','Kılıç','Aslan','Çetin','Kara','Koç','Kurt','Özkan','Şimşek','Polat','Erdem','Güneş','Aksoy'];
  const cities = ['İstanbul','İstanbul','İstanbul','Ankara','Ankara','İzmir','İzmir','Bursa','Antalya','Adana','Konya','Gaziantep','Eskişehir','Trabzon','Kayseri','Samsun'];
  const asciiTr = s => s.toLowerCase().replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/i̇/g,'i');

  let sql = `
CREATE TABLE departments (
  dept_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT
);
CREATE TABLE employees (
  emp_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dept_id INTEGER REFERENCES departments(dept_id),
  manager_id INTEGER REFERENCES employees(emp_id),
  title TEXT,
  salary REAL,
  hire_date TEXT,
  email TEXT
);
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT,
  birth_year INTEGER,
  city TEXT,
  email TEXT,
  signup_date TEXT,
  segment TEXT
);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  cost REAL NOT NULL,
  stock INTEGER
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  order_date TEXT NOT NULL,
  status TEXT NOT NULL,
  channel TEXT
);
CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id),
  product_id INTEGER REFERENCES products(product_id),
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  discount REAL DEFAULT 0
);
CREATE TABLE web_events (
  event_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  event_type TEXT,
  event_time TEXT,
  device TEXT
);
CREATE TABLE ab_test (
  user_id INTEGER PRIMARY KEY,
  variant TEXT,
  converted INTEGER,
  revenue REAL
);
CREATE TABLE raw_signups (
  id INTEGER,
  full_name TEXT,
  email TEXT,
  city TEXT,
  signup_date TEXT
);
CREATE TABLE price_updates (
  product_id INTEGER,
  new_price REAL,
  updated_at TEXT
);
`;

  // departments
  const depts = [[1,'Satış','İstanbul'],[2,'Pazarlama','İstanbul'],[3,'Veri Analitiği','Ankara'],[4,'Yazılım','İzmir'],[5,'İnsan Kaynakları','İstanbul'],[6,'Finans','Ankara'],[7,'Hukuk','İstanbul']];
  sql += ins('departments', ['dept_id','name','city'], depts);

  // employees (Hukuk boş)
  const emps = [];
  const titles = {1:['Satış Uzmanı','Satış Temsilcisi'],2:['Pazarlama Uzmanı','İçerik Uzmanı'],3:['Veri Analisti','Veri Bilimci','Veri Mühendisi'],4:['Yazılım Geliştirici','Kıdemli Geliştirici'],5:['İK Uzmanı'],6:['Finans Uzmanı','Muhasebeci']};
  emps.push([1,'Selim','Aksoy',null,null,'Genel Müdür',145000,'2015-03-01','selim.aksoy@anadolumarket.com']);
  const mgrs = {};
  const mgrTitles = {1:'Satış Müdürü',2:'Pazarlama Müdürü',3:'Analitik Müdürü',4:'Yazılım Müdürü',5:'İK Müdürü',6:'Finans Müdürü'};
  let eid = 2;
  for (let d = 1; d <= 6; d++) {
    const f = R() < .5 ? pick(firstF) : pick(firstM), l = pick(lastN);
    emps.push([eid, f, l, d, 1, mgrTitles[d], int(80, 98) * 1000, dstr(addDays(new Date(Date.UTC(2016,0,1)), int(0, 900))), asciiTr(f) + '.' + asciiTr(l) + '@anadolumarket.com']);
    mgrs[d] = eid++;
  }
  const empCount = {1:5,2:3,3:4,4:4,5:2,6:2};
  for (let d = 1; d <= 6; d++) for (let k = 0; k < empCount[d]; k++) {
    const f = R() < .5 ? pick(firstF) : pick(firstM), l = pick(lastN);
    const ttl = pick(titles[d]);
    let sal = int(38, 72) * 1000; if (/Kıdemli|Veri Bilimci|Mühendis/.test(ttl)) sal += 15000;
    emps.push([eid++, f, l, d, mgrs[d], ttl, sal, dstr(addDays(new Date(Date.UTC(2018,0,1)), int(0, 2400))), R() < .9 ? asciiTr(f) + '.' + asciiTr(l) + '@anadolumarket.com' : null]);
  }
  sql += ins('employees', ['emp_id','first_name','last_name','dept_id','manager_id','title','salary','hire_date','email'], emps);

  // products
  const prods = [
    ['Kablosuz Kulaklık','Elektronik',1299],['Akıllı Saat','Elektronik',3499],['Bluetooth Hoparlör','Elektronik',899],['Powerbank 20000mAh','Elektronik',649],['Mekanik Klavye','Elektronik',1899],['Oyuncu Mouse','Elektronik',749],['27" Monitör','Elektronik',7499],['USB-C Hub','Elektronik',549],
    ['Suç ve Ceza','Kitap',145],['Kürk Mantolu Madonna','Kitap',95],['Tutunamayanlar','Kitap',260],['İnce Memed','Kitap',180],['Saatleri Ayarlama Enstitüsü','Kitap',165],['SQL ile Veri Analizi','Kitap',420],['İstatistiğe Giriş','Kitap',380],
    ['Türk Kahvesi Makinesi','Ev & Yaşam',2199],['Çaydanlık Seti','Ev & Yaşam',899],['Pamuk Nevresim Takımı','Ev & Yaşam',1150],['Bakır Cezve','Ev & Yaşam',320],['Seramik Kupa Seti','Ev & Yaşam',275],['Robot Süpürge','Ev & Yaşam',8999],
    ['Basic Tişört','Giyim',249],['Kot Pantolon','Giyim',799],['Mont','Giyim',2499],['Spor Ayakkabı','Giyim',1899],['Yün Atkı','Giyim',349],['Keten Gömlek','Giyim',649],
    ['Yoga Matı','Spor',399],['Dambıl Seti 10kg','Spor',899],['Koşu Bandı','Spor',15999],['Termos 750ml','Spor',459],['Bisiklet Kaskı','Spor',1099],['Kamp Çadırı','Spor',3299],
    ['Nemlendirici Krem','Kozmetik',289],['Güneş Kremi SPF50','Kozmetik',349],['Parfüm 100ml','Kozmetik',1799],['Şampuan','Kozmetik',129],['Dudak Balmı','Kozmetik',79],
    ['Hediye Kartı 500 TL','Hediye',500],['Gurme Lokum Kutusu','Hediye',350]
  ];
  const prodRows = prods.map((p, i) => [i + 1, p[0], p[1], p[2], Math.round(p[2] * (0.45 + R() * 0.25)), i === 38 ? 0 : int(0, 250)]);
  sql += ins('products', ['product_id','name','category','price','cost','stock'], prodRows);
  const neverOrdered = new Set([30, 40]); // Koşu Bandı? hayır: id 30 = Koşu Bandı, 40 = Gurme Lokum
  const popular = []; prodRows.forEach(p => { if (neverOrdered.has(p[0])) return; const w = p[3] < 400 ? 5 : p[3] < 1500 ? 3 : p[3] < 5000 ? 2 : 1; for (let k = 0; k < w; k++) popular.push(p); });

  // customers
  const custs = [];
  const segs = ['Bireysel','Bireysel','Bireysel','Kurumsal','Premium'];
  const NC = 150;
  for (let i = 1; i <= NC; i++) {
    const g = R() < .5 ? 'K' : 'E';
    const f = g === 'K' ? pick(firstF) : pick(firstM), l = pick(lastN);
    const sd = addDays(new Date(Date.UTC(2022, 5, 1)), int(0, 850));
    const domain = pick(['gmail.com','gmail.com','hotmail.com','outlook.com','yandex.com','icloud.com']);
    custs.push([i, f, l, g, int(1960, 2005), R() < .06 ? null : pick(cities), R() < .08 ? null : asciiTr(f) + '.' + asciiTr(l) + (R() < .5 ? int(1, 99) : '') + '@' + domain, dstr(sd), pick(segs)]);
  }
  sql += ins('customers', ['customer_id','first_name','last_name','gender','birth_year','city','email','signup_date','segment'], custs);

  // orders + items
  const orders = [], items = [];
  let oid = 1, iid = 1;
  const end = new Date(Date.UTC(2024, 11, 31));
  const inactive = new Set(); for (let k = 0; k < 14; k++) inactive.add(int(1, NC));
  for (const c of custs) {
    if (inactive.has(c[0])) continue;
    const sd = new Date(c[7] + 'T00:00:00Z');
    const base = c[8] === 'Premium' ? 3.2 : c[8] === 'Kurumsal' ? 2.2 : 1;
    let d = addDays(sd, int(0, 40));
    const stop = R() < .38 ? addDays(sd, int(90, 640)) : end;
    const last = stop < end ? stop : end;
    while (d <= last) {
      const m = d.getUTCMonth();
      orders.push([oid, c[0], d, null, null]);
      const st = R(); const status = st < .80 ? 'delivered' : st < .88 ? 'cancelled' : st < .93 ? 'returned' : 'shipped';
      const ch = R(); const channel = ch < .45 ? 'mobile' : ch < .85 ? 'web' : 'store';
      orders[orders.length - 1][3] = status; orders[orders.length - 1][4] = channel;
      const n = int(1, R() < .3 ? 4 : 2);
      const used = new Set();
      for (let k = 0; k < n; k++) {
        const p = pick(popular); if (used.has(p[0])) continue; used.add(p[0]);
        const disc = R() < .25 ? pick([0.05, 0.1, 0.15, 0.2]) : 0;
        const qty = p[3] < 500 ? int(1, 3) : 1;
        const priceAtSale = d.getUTCFullYear() === 2023 ? Math.round(p[3] * 0.9) : p[3];
        items.push([iid++, oid, p[0], qty, priceAtSale, disc]);
      }
      oid++;
      let gap = Math.round((60 + R() * 140) / base);
      if (m === 9 || m === 10) gap = Math.round(gap * 0.6);
      d = addDays(d, Math.max(5, gap));
    }
  }
  /* ---------- Power BI yıldız şeması ---------- */
  const D = s => s instanceof Date ? s : new Date(s + 'T00:00:00Z');
  const R2 = rng(77031); const int2 = (a, b) => a + Math.floor(R2() * (b - a + 1));
  const ST = { delivered: 'Teslim Edildi', shipped: 'Kargoda', cancelled: 'İptal', returned: 'İade' };
  const CH = { web: 'Web', mobile: 'Mobil', store: 'Mağaza' };
  const AYLAR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const GUNLER = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const BOLGE = { 'İstanbul': 'Marmara', 'Bursa': 'Marmara', 'Eskişehir': 'İç Anadolu', 'Ankara': 'İç Anadolu', 'Konya': 'İç Anadolu', 'Kayseri': 'İç Anadolu', 'İzmir': 'Ege', 'Antalya': 'Akdeniz', 'Adana': 'Akdeniz', 'Gaziantep': 'Güneydoğu Anadolu', 'Trabzon': 'Karadeniz', 'Samsun': 'Karadeniz' };
  const prodById = {}; prodRows.forEach(p => prodById[p[0]] = p);
  const ordById = {}; orders.forEach(o => ordById[o[0]] = o);
  const ym = d => d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1);
  const mIndex = d => d.getUTCFullYear() * 12 + d.getUTCMonth();

  /* Çalışanlar ve departmanlar (ebeveyn-çocuk hiyerarşisi) */
  const Departmanlar = depts.map(d => ({ DepartmanNo: d[0], Departman: d[1], Sehir: d[2] }));
  const empById = {}; emps.forEach(e => empById[e[0]] = e);
  const pathOf = id => { const p = []; let cur = empById[id]; while (cur) { p.unshift(cur[0]); cur = cur[4] ? empById[cur[4]] : null; } return p.join('|'); };
  const Calisanlar = emps.map(e => ({ CalisanNo: e[0], AdSoyad: e[1] + ' ' + e[2], DepartmanNo: e[3] || 0, YoneticiNo: e[4], Unvan: e[5], Maas: e[6], IseGiris: D(e[7]), Eposta: e[8], Yol: pathOf(e[0]), Seviye: pathOf(e[0]).split('|').length, KidemYil: Math.floor((Date.UTC(2024, 11, 31) - D(e[7]).getTime()) / (365.25 * 86400000)), MaasKutusu: Math.floor(e[6] / 20000) * 20000 }));
  if (!Departmanlar.some(d => d.DepartmanNo === 0)) Departmanlar.push({ DepartmanNo: 0, Departman: 'Genel Müdürlük', Sehir: 'İstanbul' });
  const reps = emps.filter(e => e[3] === 1).map(e => e[0]);

  /* Müşteriler */
  const Urunler = prodRows.map(p => ({ UrunNo: p[0], Urun: p[1], Kategori: p[2], Fiyat: p[3], BirimMaliyet: p[4], Stok: p[5] }));
  const Kategoriler = [...new Set(prodRows.map(p => p[2]))].map(k => ({ Kategori: k }));
  const yasGrubu = y => { const a = 2024 - y; return a < 25 ? '18-24' : a < 35 ? '25-34' : a < 45 ? '35-44' : a < 55 ? '45-54' : '55+'; };
  const repOfCust = {}; custs.forEach(c => repOfCust[c[0]] = reps[(c[0] * 7) % reps.length]);
  // sipariş düzeyinde teslim süresi
  const shipDays = {}; orders.forEach(o => { shipDays[o[0]] = o[3] === 'cancelled' ? null : o[4] === 'store' ? 0 : int2(1, o[4] === 'mobile' ? 6 : 5) + (R2() < .08 ? int2(3, 7) : 0); });
  const firstBuy = {}; orders.forEach(o => { if (o[3] === 'cancelled') return; const d = D(o[2]); if (!firstBuy[o[1]] || d < firstBuy[o[1]]) firstBuy[o[1]] = d; });
  const Musteriler = custs.map(c => ({ MusteriNo: c[0], Musteri: c[1] + ' ' + c[2], Cinsiyet: c[3] === 'K' ? 'Kadın' : 'Erkek', DogumYili: c[4], YasGrubu: yasGrubu(c[4]), Sehir: c[5], Bolge: c[5] ? BOLGE[c[5]] : null, Segment: c[8], KayitTarihi: D(c[7]), IlkSiparis: firstBuy[c[0]] || null, KohortAy: firstBuy[c[0]] ? ym(firstBuy[c[0]]) : null, TemsilciNo: repOfCust[c[0]] }));
  const bandOf = x => x === 0 ? 'İndirimsiz' : x <= 0.1 ? '%5–10' : '%15–20';
  const Satislar = items.map(it => {
    const o = ordById[it[1]], p = prodById[it[2]]; const d = D(o[2]); const sd = shipDays[o[0]];
    const tutar = Math.round(it[3] * it[4] * (1 - it[5]) * 100) / 100;
    return { SatirNo: it[0], SiparisNo: it[1], Tarih: d, TeslimTarihi: sd === null ? null : new Date(d.getTime() + sd * 86400000), KargoGun: sd, MusteriNo: o[1], UrunNo: it[2], TemsilciNo: repOfCust[o[1]], Kanal: CH[o[4]], Durum: ST[o[3]], Adet: it[3], BirimFiyat: it[4], Indirim: it[5], IndirimBandi: bandOf(it[5]), Tutar: tutar, Maliyet: it[3] * p[4], KohortAyFarki: firstBuy[o[1]] ? mIndex(d) - mIndex(firstBuy[o[1]]) : null };
  });
  // teslim tarihi 2024 sonunu aşan satırlar tarih tablosunda yok: veri kesimi
  Satislar.forEach(s => { if (s.TeslimTarihi && s.TeslimTarihi > new Date(Date.UTC(2024, 11, 31))) { s.TeslimTarihi = null; s.KargoGun = null; s.Durum = s.Durum === 'Teslim Edildi' ? 'Kargoda' : s.Durum; } });

  /* Tarih tablosu */
  const isoWeek = d => { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); };
  const Tarih = [];
  for (let t = Date.UTC(2022, 0, 1); t <= Date.UTC(2024, 11, 31); t += 86400000) {
    const d = new Date(t), y = d.getUTCFullYear(), m = d.getUTCMonth(), wd = d.getUTCDay();
    Tarih.push({ Tarih: d, Yil: y, CeyrekNo: Math.floor(m / 3) + 1, Ceyrek: 'Ç' + (Math.floor(m / 3) + 1), YilCeyrek: y + '-Ç' + (Math.floor(m / 3) + 1), AyNo: m + 1, Ay: AYLAR[m], YilAy: y + '-' + pad(m + 1), AySonu: new Date(Date.UTC(y, m + 1, 0)), Gun: d.getUTCDate(), HaftaNo: isoWeek(d), GunNo: wd === 0 ? 7 : wd, HaftaninGunu: GUNLER[wd], HaftaSonu: (wd === 0 || wd === 6) ? 'Evet' : 'Hayır' });
  }
  // Hedefler
  const act = {};
  Satislar.forEach(s => { if (s.Durum === 'İptal') return; const p = prodById[s.UrunNo]; const k = s.Tarih.getUTCFullYear() + '|' + s.Tarih.getUTCMonth() + '|' + p[2]; act[k] = (act[k] || 0) + s.Tutar; });
  const Hedefler = [];
  for (let y = 2022; y <= 2024; y++) for (let m = 0; m < 12; m++) for (const k of Kategoriler) {
    const prev = act[(y - 1) + '|' + m + '|' + k.Kategori], cur = act[y + '|' + m + '|' + k.Kategori] || 0;
    const base = cur * (0.86 + R() * 0.3) + (prev || 0) * 0.04;
    Hedefler.push({ Tarih: new Date(Date.UTC(y, m, 1)), Kategori: k.Kategori, Hedef: Math.max(500, Math.round(base / 100) * 100) });
  }
  /* Aylık stok görüntüsü (yarı toplanabilir) */
  const soldM = {}; Satislar.forEach(s => { if (s.Durum === 'İptal') return; const k = s.UrunNo + '|' + mIndex(s.Tarih); soldM[k] = (soldM[k] || 0) + s.Adet; });
  const StokGorunum = [];
  Urunler.forEach(u => {
    let tot24 = 0; for (let m = 0; m < 12; m++) tot24 += soldM[u.UrunNo + '|' + (2024 * 12 + m)] || 0; const avgM = Math.max(1, tot24 / 12);
    const reorder = Math.max(2, Math.round(avgM * (0.8 + R2() * 0.8))); const lot = Math.max(4, Math.round(avgM * (2 + R2() * 2.5))); let st = reorder + int2(1, Math.max(2, Math.round(avgM * 2)));
    for (let y = 2022; y <= 2024; y++) for (let m = 0; m < 12; m++) {
      st -= soldM[u.UrunNo + '|' + (y * 12 + m)] || 0; let gelen = 0;
      while (st < reorder) { st += lot; gelen += lot; }
      if (R2() < 0.05) st = Math.max(0, st - int2(1, 5)); // fire / sayım farkı
      StokGorunum.push({ Tarih: new Date(Date.UTC(y, m + 1, 0)), UrunNo: u.UrunNo, StokAdet: st, GelenAdet: gelen, StokDegeri: st * u.BirimMaliyet });
    }
    u.Stok = st;
  });
  /* Web olayları: dönüşüm hunisi (Ekim–Kasım 2024) */
  const ADIM = ['Ziyaret', 'Ürün görüntüleme', 'Sepete ekleme', 'Ödeme', 'Satın alma'];
  const KAYNAK = ['Organik arama', 'Organik arama', 'Reklam', 'Reklam', 'Sosyal medya', 'E-posta', 'Doğrudan'];
  const WebOlaylari = []; let evid = 1;
  for (let u = 1001; u <= 1900; u++) {
    const dev = R2() < .6 ? 'Mobil' : 'Masaüstü'; const src = KAYNAK[int2(0, KAYNAK.length - 1)];
    let t = Date.UTC(2024, 9, 1) + int2(0, 60 * 24 * 3600) * 1000;
    const pr = dev === 'Mobil' ? [1, .72, .38, .55, .62] : [1, .78, .45, .62, .74];
    const boost = src === 'E-posta' ? 1.12 : src === 'Reklam' ? .9 : 1;
    for (let s = 0; s < ADIM.length; s++) {
      if (R2() > Math.min(1, pr[s] * (s ? boost : 1))) break;
      const d = new Date(t);
      WebOlaylari.push({ OlayNo: evid++, ZiyaretciNo: u, Tarih: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())), Saat: d.getUTCHours(), AdimNo: s + 1, Adim: ADIM[s], Cihaz: dev, Kaynak: src });
      t += int2(20, 900) * 1000;
    }
  }
  /* Döviz kurları (aylık ortalama, yaklaşık) */
  const DovizKurlari = []; const usdPath = [13.6, 14.6, 14.4, 14.7, 15.4, 16.6, 17.4, 18.0, 18.3, 18.5, 18.6, 18.7, 18.8, 18.9, 19.0, 19.3, 19.8, 23.5, 26.0, 26.9, 26.9, 27.8, 28.6, 29.1, 29.6, 30.6, 31.7, 32.3, 32.3, 32.6, 33.0, 33.7, 34.0, 34.2, 34.4, 35.0];
  usdPath.forEach((v, i) => { const d = new Date(Date.UTC(2022 + Math.floor(i / 12), i % 12, 1)); DovizKurlari.push({ Tarih: d, ParaBirimi: 'USD', Kur: v }); DovizKurlari.push({ Tarih: d, ParaBirimi: 'EUR', Kur: Math.round(v * (i < 10 ? 1.08 : i < 20 ? 1.04 : 1.08) * 100) / 100 }); });
  const ParaBirimleri = [{ ParaBirimi: 'TRY', Sembol: '₺', Sira: 1 }, { ParaBirimi: 'USD', Sembol: '$', Sira: 2 }, { ParaBirimi: 'EUR', Sembol: '€', Sira: 3 }];
  /* Bağlantısız parametre tabloları */
  const FiyatSenaryosu = []; for (let x = -20; x <= 20; x += 5) FiyatSenaryosu.push({ FiyatDegisimi: x / 100 });
  const TopNSecim = []; for (let n = 3; n <= 15; n++) TopNSecim.push({ N: n });
  const MusteriDilimleri = [{ Dilim: 'Küçük', Min: 0, Max: 2000, Sira: 1 }, { Dilim: 'Orta', Min: 2000, Max: 6000, Sira: 2 }, { Dilim: 'Büyük', Min: 6000, Max: 15000, Sira: 3 }, { Dilim: 'VIP', Min: 15000, Max: 1e9, Sira: 4 }];
  const UrunlerVeDiger = Urunler.map((u, i) => ({ Urun: u.Urun, Sira: i + 1 })).concat([{ Urun: 'Diğer', Sira: 999 }]);
  const KarsiUrunler = Urunler.map(u => ({ KarsiUrunNo: u.UrunNo, KarsiUrun: u.Urun, KarsiKategori: u.Kategori }));
  const OlcuSecimi = [{ Olcu: 'Net Satış', Sira: 1 }, { Olcu: 'Brüt Kâr', Sira: 2 }, { Olcu: 'Sipariş Sayısı', Sira: 3 }, { Olcu: 'Müşteri Sayısı', Sira: 4 }];
  const RFMSegmentleri = [
    { Segment: 'Şampiyon', Sira: 1, Aciklama: 'Yakın zamanda, sık ve çok alıyor', Eylem: 'Ödüllendir, yeni ürünlerde ilk onlara sun' },
    { Segment: 'Sadık', Sira: 2, Aciklama: 'Düzenli ve sık alıyor', Eylem: 'Sadakat programı, çapraz satış' },
    { Segment: 'Potansiyel sadık', Sira: 3, Aciklama: 'Yakın zamanda aldı, sıklığı orta', Eylem: 'Üyelik ve kişisel öneriler' },
    { Segment: 'Yeni', Sira: 4, Aciklama: 'Yakın zamanda ilk kez aldı', Eylem: 'Hoş geldin akışı, ikinci alışveriş teşviki' },
    { Segment: 'Dikkat gerektiren', Sira: 5, Aciklama: 'Ortalama değerler, son alım gecikiyor', Eylem: 'Sınırlı süreli teklif' },
    { Segment: 'Risk altında', Sira: 6, Aciklama: 'Eskiden sık alırdı, uzun süredir yok', Eylem: 'Kişisel geri kazanma kampanyası' },
    { Segment: 'Kaybedilmiş', Sira: 7, Aciklama: 'Uzun süredir alışveriş yok, sıklığı düşük', Eylem: 'Düşük maliyetli hatırlatma ya da bırak' }
  ];
  const Gorunum = [{ Gorunum: 'Cari', Sira: 1 }, { Gorunum: 'Geçen yıl', Sira: 2 }, { Gorunum: 'YTD', Sira: 3 }, { Gorunum: 'YoY %', Sira: 4 }];

  root.PBI_MODEL = {
    tables: {
      Satislar: { rows: Satislar, cols: ['SatirNo','SiparisNo','Tarih','TeslimTarihi','KargoGun','MusteriNo','UrunNo','TemsilciNo','Kanal','Durum','Adet','BirimFiyat','Indirim','IndirimBandi','Tutar','Maliyet','KohortAyFarki'], kind: 'fact', calc: { IndirimBandi: 'SWITCH(TRUE(), Satislar[Indirim] = 0, "İndirimsiz", Satislar[Indirim] <= 0.1, "%5–10", "%15–20")', KohortAyFarki: 'VAR Ilk = RELATED(Musteriler[IlkSiparis])\nRETURN DATEDIFF(Ilk, Satislar[Tarih], MONTH)' } },
      Urunler: { rows: Urunler, cols: ['UrunNo','Urun','Kategori','Fiyat','BirimMaliyet','Stok'], kind: 'dim' },
      Musteriler: { rows: Musteriler, cols: ['MusteriNo','Musteri','Cinsiyet','DogumYili','YasGrubu','Sehir','Bolge','Segment','KayitTarihi','IlkSiparis','KohortAy','TemsilciNo'], kind: 'dim', calc: { IlkSiparis: 'CALCULATE(MIN(Satislar[Tarih]), Satislar[Durum] <> "İptal")', KohortAy: 'FORMAT(Musteriler[IlkSiparis], "yyyy-MM")', YasGrubu: 'VAR Yas = 2024 - Musteriler[DogumYili]\nRETURN SWITCH(TRUE(), Yas < 25, "18-24", Yas < 35, "25-34", Yas < 45, "35-44", Yas < 55, "45-54", "55+")' } },
      Tarih: { rows: Tarih, cols: ['Tarih','Yil','CeyrekNo','Ceyrek','YilCeyrek','AyNo','Ay','YilAy','AySonu','Gun','HaftaNo','GunNo','HaftaninGunu','HaftaSonu'], kind: 'dim', dateTable: 'Tarih', sortBy: { Ay: 'AyNo', HaftaninGunu: 'GunNo', Ceyrek: 'CeyrekNo' } },
      Kategoriler: { rows: Kategoriler, cols: ['Kategori'], kind: 'dim' },
      Hedefler: { rows: Hedefler, cols: ['Tarih','Kategori','Hedef'], kind: 'fact' },
      Calisanlar: { rows: Calisanlar, cols: ['CalisanNo','AdSoyad','DepartmanNo','YoneticiNo','Unvan','Maas','IseGiris','Eposta','Yol','Seviye','KidemYil','MaasKutusu'], kind: 'dim', calc: { MaasKutusu: 'FLOOR(Calisanlar[Maas], 20000)  -- ya da Yeni grup → Kutu (20.000)', Yol: 'PATH(Calisanlar[CalisanNo], Calisanlar[YoneticiNo])', Seviye: 'PATHLENGTH(Calisanlar[Yol])' } },
      Departmanlar: { rows: Departmanlar, cols: ['DepartmanNo','Departman','Sehir'], kind: 'dim' },
      StokGorunum: { rows: StokGorunum, cols: ['Tarih','UrunNo','StokAdet','GelenAdet','StokDegeri'], kind: 'fact' },
      WebOlaylari: { rows: WebOlaylari, cols: ['OlayNo','ZiyaretciNo','Tarih','Saat','AdimNo','Adim','Cihaz','Kaynak'], kind: 'fact', sortBy: { Adim: 'AdimNo' } },
      DovizKurlari: { rows: DovizKurlari, cols: ['Tarih','ParaBirimi','Kur'], kind: 'param' },
      ParaBirimleri: { rows: ParaBirimleri, cols: ['ParaBirimi','Sembol','Sira'], kind: 'param', sortBy: { ParaBirimi: 'Sira' } },
      FiyatSenaryosu: { rows: FiyatSenaryosu, cols: ['FiyatDegisimi'], kind: 'param', calc: { _table: 'GENERATESERIES(-0.2, 0.2, 0.05)' } },
      TopNSecim: { rows: TopNSecim, cols: ['N'], kind: 'param', calc: { _table: 'GENERATESERIES(3, 15, 1)' } },
      MusteriDilimleri: { rows: MusteriDilimleri, cols: ['Dilim','Min','Max','Sira'], kind: 'param', sortBy: { Dilim: 'Sira' } },
      UrunlerVeDiger: { rows: UrunlerVeDiger, cols: ['Urun','Sira'], kind: 'param', sortBy: { Urun: 'Sira' }, calc: { _table: 'UNION(SELECTCOLUMNS(Urunler, "Urun", Urunler[Urun]), ROW("Urun", "Diğer"))' } },
      KarsiUrunler: { rows: KarsiUrunler, cols: ['KarsiUrunNo','KarsiUrun','KarsiKategori'], kind: 'param' },
      OlcuSecimi: { rows: OlcuSecimi, cols: ['Olcu','Sira'], kind: 'param', sortBy: { Olcu: 'Sira' } },
      RFMSegmentleri: { rows: RFMSegmentleri, cols: ['Segment','Sira','Aciklama','Eylem'], kind: 'param', sortBy: { Segment: 'Sira' } },
      Gorunum: { rows: Gorunum, cols: ['Gorunum','Sira'], kind: 'param', sortBy: { Gorunum: 'Sira' } }
    },
    rels: [
      { from: 'Satislar', fromCol: 'UrunNo', to: 'Urunler', toCol: 'UrunNo' },
      { from: 'Satislar', fromCol: 'MusteriNo', to: 'Musteriler', toCol: 'MusteriNo' },
      { from: 'Satislar', fromCol: 'Tarih', to: 'Tarih', toCol: 'Tarih' },
      { from: 'Satislar', fromCol: 'TeslimTarihi', to: 'Tarih', toCol: 'Tarih', inactive: true },
      { from: 'Satislar', fromCol: 'TemsilciNo', to: 'Calisanlar', toCol: 'CalisanNo' },
      { from: 'Calisanlar', fromCol: 'DepartmanNo', to: 'Departmanlar', toCol: 'DepartmanNo' },
      { from: 'Urunler', fromCol: 'Kategori', to: 'Kategoriler', toCol: 'Kategori' },
      { from: 'Hedefler', fromCol: 'Kategori', to: 'Kategoriler', toCol: 'Kategori' },
      { from: 'Hedefler', fromCol: 'Tarih', to: 'Tarih', toCol: 'Tarih' },
      { from: 'StokGorunum', fromCol: 'UrunNo', to: 'Urunler', toCol: 'UrunNo' },
      { from: 'StokGorunum', fromCol: 'Tarih', to: 'Tarih', toCol: 'Tarih' },
      { from: 'WebOlaylari', fromCol: 'Tarih', to: 'Tarih', toCol: 'Tarih' }
    ],
    notes: {
      Satislar: 'Olgu tablosu: her satır bir sipariş satırı (tanecik). Tutar = Adet × BirimFiyat × (1 − Indirim). TeslimTarihi, Tarih tablosuna PASİF bir ilişkiyle bağlı (USERELATIONSHIP dersleri). IndirimBandi ve KohortAyFarki hesaplanmış sütunlardır.',
      Urunler: 'Boyut: 40 ürün, 7 kategori. Stok, son ay sonundaki stok adedidir.',
      Musteriler: 'Boyut: 150 müşteri. Bazı Sehir değerleri boş. IlkSiparis ve KohortAy hesaplanmış sütunlar (kohort analizi için).',
      Tarih: 'Tarih tablosu (2022–2024, her gün bir satır), tarih tablosu olarak işaretli. Satislar[Tarih] ile etkin, Satislar[TeslimTarihi] ile pasif ilişkisi var: rol oynayan boyut.',
      Kategoriler: 'Paylaşılan boyut: hem Urunler hem Hedefler bu tabloya bağlı. Hedef ile gerçekleşeni birlikte göstermek için kategoriyi buradan alın.',
      Hedefler: 'Aylık kategori hedefi (bütçe). Ayın ilk gününe bağlı; tanecik ay × kategori.',
      Calisanlar: 'Çalışanlar. YoneticiNo aynı tablodaki yöneticiyi gösterir (ebeveyn-çocuk). Yol = PATH(...) ile hesaplanır. Satış ekibi Satislar[TemsilciNo] üzerinden bağlı; dinamik RLS için Eposta sütunu kullanılır.',
      Departmanlar: 'Kar tanesi (snowflake) örneği: Calisanlar → Departmanlar.',
      StokGorunum: 'Aylık stok görüntüsü (ay sonu). Yarı toplanabilir: ürünler arasında toplanır, aylar arasında toplanmaz; dönem sonu değeri alınır.',
      WebOlaylari: 'Web sitesi olayları (Ekim–Kasım 2024): Ziyaret → Ürün görüntüleme → Sepete ekleme → Ödeme → Satın alma. Dönüşüm hunisi dashboardu için.',
      DovizKurlari: 'Aylık ortalama döviz kurları (yaklaşık değerler, eğitim amaçlı). Bağlantısız; para birimi dönüşümü kalıbında kullanılır.',
      ParaBirimleri: 'Bağlantısız seçim tablosu: TRY / USD / EUR.',
      FiyatSenaryosu: 'Ne olur (what-if) parametresi: −%20 … +%20 fiyat değişimi. Modelleme → Yeni parametre ile oluşturulur.',
      TopNSecim: 'Ne olur parametresi: dinamik İlk N için 3–15.',
      MusteriDilimleri: 'Dinamik segmentasyon tablosu: müşterinin net satışı hangi aralıktaysa o dilime düşer.',
      UrunlerVeDiger: 'Top N + Diğer kalıbı için ürün adları ve ek bir “Diğer” satırı (bağlantısız).',
      KarsiUrunler: 'Sepet analizi için Urunler\'in bağlantısız kopyası: “A ürününü alanlar B\'yi de aldı mı?”',
      OlcuSecimi: 'Alan parametresi benzetimi: dilimleyiciden ölçü seçtirmek için.',
      RFMSegmentleri: 'RFM segment listesi (bağlantısız): segment ölçüsü her müşteriyi bu segmentlerden birine atar.',
      Gorunum: 'Hesaplama grubu benzetimi: Cari / Geçen yıl / YTD / YoY % görünümlerini SWITCH ile seçmek için.'
    },
    colDesc: {
      'Satislar[SatirNo]': 'Sipariş satırı numarası', 'Satislar[SiparisNo]': 'Sipariş numarası (bir siparişte birden çok satır olabilir)', 'Satislar[Tarih]': 'Sipariş tarihi (Tarih tablosuna etkin ilişki)', 'Satislar[TeslimTarihi]': 'Teslim tarihi; iptallerde boş (Tarih tablosuna pasif ilişki)', 'Satislar[KargoGun]': 'Sipariş ile teslim arası gün', 'Satislar[MusteriNo]': 'Müşteri anahtarı', 'Satislar[UrunNo]': 'Ürün anahtarı', 'Satislar[TemsilciNo]': 'Müşterinin satış temsilcisi', 'Satislar[Kanal]': 'Web / Mobil / Mağaza', 'Satislar[Durum]': 'Teslim Edildi / Kargoda / İptal / İade', 'Satislar[Adet]': 'Satılan adet', 'Satislar[BirimFiyat]': 'Satış anındaki birim fiyat (TL)', 'Satislar[Indirim]': 'İndirim oranı (0,10 = %10)', 'Satislar[IndirimBandi]': 'Hesaplanmış sütun: indirim aralığı', 'Satislar[Tutar]': 'Net satış tutarı (TL)', 'Satislar[Maliyet]': 'Satırın toplam maliyeti (TL)', 'Satislar[KohortAyFarki]': 'Hesaplanmış sütun: müşterinin ilk siparişinden bu yana geçen ay',
      'Urunler[Fiyat]': 'Liste fiyatı (TL)', 'Urunler[BirimMaliyet]': 'Bir adedin maliyeti (TL)', 'Urunler[Stok]': 'Son ay sonu stok adedi', 'Musteriler[YasGrubu]': 'Hesaplanmış sütun: 2024 itibarıyla yaş aralığı', 'Musteriler[Bolge]': 'Coğrafi bölge (Bölge → Şehir hiyerarşisi)', 'Musteriler[IlkSiparis]': 'Hesaplanmış sütun: ilk iptal edilmemiş sipariş', 'Musteriler[KohortAy]': 'Hesaplanmış sütun: ilk siparişin ayı', 'Musteriler[TemsilciNo]': 'Müşteriden sorumlu temsilci',
      'Tarih[Ceyrek]': 'Ç1–Ç4 (CeyrekNo ile sıralanır)', 'Tarih[YilAy]': 'Sıralanabilir ay etiketi', 'Tarih[Ay]': 'Kısa ay adı (AyNo ile sıralanır)', 'Tarih[HaftaNo]': 'ISO hafta numarası', 'Tarih[GunNo]': '1 = Pazartesi … 7 = Pazar', 'Tarih[AySonu]': 'Ayın son günü',
      'Hedefler[Hedef]': 'Aylık hedef tutar (TL)', 'Calisanlar[YoneticiNo]': 'Yöneticinin CalisanNo değeri (Genel Müdür için boş)', 'Calisanlar[Yol]': 'Hesaplanmış sütun: kökten çalışana yöneticiler zinciri', 'Calisanlar[Seviye]': 'Hiyerarşi derinliği (1 = Genel Müdür)', 'Calisanlar[Maas]': 'Aylık brüt maaş (TL)', 'Calisanlar[KidemYil]': 'Yıl olarak kıdem', 'Calisanlar[MaasKutusu]': 'Kutulama: 20.000 TL\'lik maaş aralığının alt sınırı (histogram için)',
      'StokGorunum[StokAdet]': 'Ay sonu stok adedi', 'StokGorunum[GelenAdet]': 'O ay depoya giren adet', 'StokGorunum[StokDegeri]': 'Stok adedi × birim maliyet', 'WebOlaylari[AdimNo]': '1 = Ziyaret … 5 = Satın alma', 'WebOlaylari[Saat]': 'Olayın saati (0–23)', 'DovizKurlari[Kur]': '1 birim döviz kaç TL (aylık ortalama, yaklaşık)'
    },
    geo: { 'İstanbul': [41.01, 28.98], 'Ankara': [39.93, 32.86], 'İzmir': [38.42, 27.14], 'Bursa': [40.19, 29.06], 'Antalya': [36.9, 30.7], 'Adana': [37.0, 35.32], 'Konya': [37.87, 32.48], 'Gaziantep': [37.07, 37.38], 'Eskişehir': [39.78, 30.52], 'Trabzon': [41.0, 39.72], 'Kayseri': [38.73, 35.48], 'Samsun': [41.29, 36.33] }
  };
})(typeof window !== 'undefined' ? window : globalThis);
