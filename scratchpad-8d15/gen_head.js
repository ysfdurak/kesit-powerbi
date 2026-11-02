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
