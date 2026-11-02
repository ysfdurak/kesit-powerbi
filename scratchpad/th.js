const Y = y => [{ t: 'Tarih', c: 'Yil', values: [y] }];
const TH1 = [
 ['Geciken Sipariş Oranı %', 'DIVIDE(CALCULATE(COUNTROWS(SatinAlmalar), SatinAlmalar[Zamaninda] = "Hayır"), COUNTROWS(SatinAlmalar))'],
 ['Ortalama Aşım Günü', 'AVERAGEX(FILTER(SatinAlmalar, SatinAlmalar[TeslimGun] > RELATED(Tedarikciler[SozGun])), SatinAlmalar[TeslimGun] - RELATED(Tedarikciler[SozGun]))'],
 ['Tutar Ağırlıklı Tedarik Süresi', 'DIVIDE(SUMX(SatinAlmalar, SatinAlmalar[TeslimGun] * SatinAlmalar[Tutar]), [Satın Alma Tutarı])'],
 ['Kusurlu Ürün Tutarı', 'SUMX(SatinAlmalar, SatinAlmalar[Kusurlu] * SatinAlmalar[BirimFiyat])'],
 ['Tedarikçi Puanı', 'IF(NOT ISBLANK([Satın Alma Tutarı]), 100 * (0.6 * [Tedarikte Zamanında %] + 0.4 * (1 - [Kusur Oranı %])))'],
 ['Yerli Tedarik Payı %', 'DIVIDE(CALCULATE([Satın Alma Tutarı], KEEPFILTERS(Tedarikciler[Ulke] = "Türkiye")), [Satın Alma Tutarı])'],
 ['Alım / Satılan Maliyet', 'DIVIDE([Satın Alma Tutarı], [Net Maliyet])'],
];
const TH2 = [
 ['Bütçe Aşan Ay', 'COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Gider] > [Gider Bütçe]))'],
 ['Gider YTD Sapma', 'TOTALYTD([Gider], Tarih[Tarih]) - TOTALYTD([Gider Bütçe], Tarih[Tarih])'],
 ['Sorumlu Departman Bütçesi', 'CALCULATE([Gider Bütçe], TREATAS(VALUES(Departmanlar[DepartmanNo]), GiderTurleri[DepartmanNo]))'],
 ['Gider Türü Payı %', 'DIVIDE([Gider], CALCULATE([Gider], ALL(GiderTurleri)))'],
 ['Faaliyet Kârı Değişimi %', 'VAR GY = CALCULATE([Faaliyet Kârı], SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN IF(NOT ISBLANK(GY), DIVIDE([Faaliyet Kârı] - GY, GY))'],
 ['Personel Gideri / Satış %', 'DIVIDE(CALCULATE([Gider], GiderTurleri[Grup] = "Personel"), [Net Satış])'],
];
const TH3 = [
 ['Talep / Sipariş Oranı', 'DIVIDE([Talep Sayısı], [Sipariş Sayısı])'],
 ['Çözülmeyen Talep', 'CALCULATE([Talep Sayısı], Talepler[Cozuldu] = "Hayır")'],
 ['Anket Yanıt Oranı %', 'DIVIDE(COUNT(Talepler[Memnuniyet]), [Talep Sayısı])'],
 ['Teslimat Kaynaklı Talep %', 'DIVIDE(CALCULATE([Talep Sayısı], KEEPFILTERS(Talepler[Konu] IN {"Kargo gecikmesi", "Hasarlı ürün"})), [Talep Sayısı])'],
 ['Yüksek Öncelik SLA %', 'CALCULATE([SLA Uyum %], KEEPFILTERS(Talepler[Oncelik] = "Yüksek"))'],
 ['Medyan Çözüm (saat)', 'MEDIAN(Talepler[CozumSaat])'],
 ['Talep Açan Müşteri %', 'DIVIDE(DISTINCTCOUNT(Talepler[MusteriNo]), COUNTROWS(Musteriler))'],
];
const ms = Object.fromEntries(PBI_MEASURES.map(m=>[m.name,{name:m.name,expr:m.expr}]));
const R = v => typeof v === 'number' ? Math.round(v*10000)/10000 : v;
function show(set, rows) { for (const [n,e] of set) { const a = [2023,2024].map(y => { try { return R(PBI_DAX.evalMeasure(ms, e, Y(y))); } catch(er) { return 'ERR '+er.message; } }); console.log(n.padEnd(32), '2023', a[0], '2024', a[1]);
  for (const [t,c] of rows) { try { const r = PBI_DAX.query({ rows:[{t,c}], measures: ms, values:[e], slicers: Y(2024), totals:false, keepBlank:true }).rows; console.log('    ', c, r.map(x=>x.keys.join('/')+'='+R(x.vals[0])).join(' | ')); } catch(er) { console.log('ERR', er.message);} } } }
const which = process.env.W;
if (which==='1') show(TH1, [['Tedarikciler','Tedarikci'],['Tedarikciler','Ulke']]);
if (which==='2') show(TH2, [['GiderTurleri','GiderTuru'],['Departmanlar','Departman'],['Tarih','YilCeyrek']]);
if (which==='3') show(TH3, [['Talepler','Konu'],['Talepler','Kanal'],['Talepler','Oncelik']]);
