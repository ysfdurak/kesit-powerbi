const { a, M } = require('./h.js');
const FX = { 'Bütçe Brüt Marj': 'VAR m = CALCULATE([Kâr Marjı %], PREVIOUSYEAR(Tarih[Tarih])) RETURN IF(ISBLANK(m), CALCULATE([Kâr Marjı %], ALL(Tarih)), m)', 'Maliyet Bütçe': '[Hedef] * (1 - [Bütçe Brüt Marj])',
 'Aktif Ay': 'COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Sipariş Sayısı] > 0))', 'Aylık Değer': 'DIVIDE([Net Satış], [Aktif Ay])', 'Müşteri Aylık Değer': 'AVERAGEX(VALUES(Musteriler[MusteriNo]), [Aylık Değer])' };
let t=Date.now();
console.log(a.Q(['Tarih[Ay]'], ['Hedef','Bütçe Brüt Marj','Maliyet Bütçe','Net Maliyet'], { extraMeasures: FX }).rows.slice(0,3), a.M('[Maliyet Bütçe]',{extraMeasures:FX}), a.M('[Net Maliyet]'), Date.now()-t);
t=Date.now(); const r=a.Q(['Musteriler[Musteri]'], ['Net Satış','Aktif Ay','Aylık Değer'], { extraMeasures: FX }); console.log(r.rows.length, r.rows.slice(0,3), Date.now()-t);
t=Date.now(); console.log(a.Q(['Musteriler[Segment]'], ['Müşteri Aylık Değer'], { extraMeasures: FX }).rows, Date.now()-t);
t=Date.now(); const r2=a.Q(['Satislar[SatirNo]','Tarih[Tarih]','Musteriler[Musteri]','Satislar[Kanal]'], ['Toplam Satış'], { add:[{t:'Satislar',c:'Durum',values:['İade']}] }); console.log(r2.rows.length, r2.rows.slice(0,2), Date.now()-t);
t=Date.now(); const r3=a.Q(['Satislar[SiparisNo]','Urunler[Urun]'], ['Satılan Adet']); console.log(r3.rows.length, Date.now()-t);
const nm = M.tables.Musteriler.rows.map(r=>r.Musteri); console.log('uniq names', new Set(nm).size, nm.length);
console.log(M.tables.Urunler.rows.slice(0,40).map(u=>u.Urun+'/'+u.Kategori).join(', '));
t=Date.now(); console.log(a.Q(['GiderTurleri[Grup]'], ['Gider'], {extraMeasures:{'Gider GY':'CALCULATE([Gider], SAMEPERIODLASTYEAR(Tarih[Tarih]))'}}).rows, Date.now()-t);
console.log(a.Q(['Musteriler[Musteri]','Satislar[Kanal]'], ['Net Satış']).rows.length);
