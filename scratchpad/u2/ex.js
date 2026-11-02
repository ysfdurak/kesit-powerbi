global.window = global; global.document = { createElement: () => ({ getContext: () => ({ measureText: s => ({ width: String(s).length * 6 }) }) }) };
const P='/home/claude/pbi/'; for (const f of ['data','data2']) require(P+f+'.js');
const T=PBI_MODEL.tables;
const u=(t,c)=>{const m={};T[t].rows.forEach(r=>{const k=r[c] instanceof Date? r[c].toISOString().slice(0,7):r[c];m[k]=(m[k]||0)+1});return m};
for (const t of Object.keys(T)) console.log(t, T[t].rows.length, T[t].kind||'', Object.keys(T[t].rows[0]||{}).join(','));
const show=(t,c)=>{const m=u(t,c);const k=Object.keys(m);console.log(t+'['+c+']',k.length>30?k.slice(0,30).join('|')+' …'+k.length:JSON.stringify(m))};
show('Satislar','Durum');show('Satislar','Kanal');show('Satislar','IndirimBandi');show('Talepler','Konu');show('Talepler','Kanal');show('Talepler','Oncelik');show('Talepler','Cozuldu');show('Talepler','Tarih');show('SatinAlmalar','Tarih');show('Tedarikciler','Tedarikci');show('Tedarikciler','Ulke');show('Giderler','GiderTuru');show('Giderler','DepartmanNo');show('Giderler','Tarih');show('Departmanlar','Departman');show('Calisanlar','Unvan');show('WebOlaylari','Tarih');show('WebOlaylari','Kaynak');show('WebOlaylari','Adim');show('WebOlaylari','Saat');show('Musteriler','Bolge');show('Calisanlar','DepartmanNo');show('Urunler','Kategori');show('SatinAlmalar','Zamaninda');show('Calisanlar','IseGiris');
console.log(T.Departmanlar.rows); console.log(T.Calisanlar.rows.slice(0,5)); console.log(T.Talepler.rows[0], T.SatinAlmalar.rows[0], T.Giderler.rows[0], T.GiderButce.rows[0], T.Tedarikciler.rows[0]);
