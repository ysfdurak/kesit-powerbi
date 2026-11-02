const sols = {
 a1: 'CALCULATE(COUNTROWS(SatinAlmalar), SatinAlmalar[Zamaninda] = "Hayır")',
 a2: 'CALCULATE([Talep Sayısı], Talepler[Oncelik] = "Yüksek")',
 b1: 'COUNTROWS(FILTER(VALUES(GiderTurleri[GiderTuru]), [Gider] > [Gider Bütçe]))',
 b2: 'AVERAGEX(SatinAlmalar, SatinAlmalar[TeslimGun] - RELATED(Tedarikciler[SozGun]))',
 b3: 'DIVIDE(CALCULATE([Net Satış], KEEPFILTERS(Musteriler[Segment] = "Premium")), [Net Satış])',
 b4: 'CALCULATE([Sipariş Sayısı], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))',
 b5: 'CALCULATE([Gider Bütçe], ALL(Tarih), VALUES(Tarih[Yil])) - TOTALYTD([Gider], Tarih[Tarih])',
 c1: 'VAR Butce = CALCULATE([Gider Bütçe], TREATAS(VALUES(Departmanlar[DepartmanNo]), GiderTurleri[DepartmanNo]))\nRETURN [Gider] - Butce',
 c2: 'AVERAGEX(VALUES(Tedarikciler[Tedarikci]), 0.6 * [Tedarikte Zamanında %] + 0.4 * (1 - [Kusur Oranı %]))',
 c3: 'VAR Alicilar = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal")\nRETURN CALCULATE([Talep Sayısı], TREATAS(Alicilar, Musteriler[MusteriNo]))',
 c4: 'VAR Donem = DATESINPERIOD(Tarih[Tarih], MAX(Tarih[Tarih]), -12, MONTH)\nRETURN DIVIDE(CALCULATE([Gider], Donem), CALCULATE([Net Satış], Donem))',
};
const grids = { a1:[['Tedarikciler','Tedarikci'],['Tarih','Yil'],['Kategoriler','Kategori']], a2:[['Tarih','Yil'],['Talepler','Kanal']], b1:[['Tarih','Yil'],['Tarih','YilCeyrek']], b2:[['Tedarikciler','Tedarikci'],['Tarih','Yil']], b3:[['Musteriler','Segment'],['Tarih','Yil'],['Satislar','Kanal']], b4:[['Tarih','YilAy']], b5:[['Tarih','YilAy']], c1:[['Departmanlar','Departman'],['Tarih','Yil'],['GiderTurleri','GiderTuru']], c2:[['Tedarikciler','Tedarikci'],['Tarih','Yil']], c3:[['Tarih','Yil'],['Musteriler','Segment'],['Kategoriler','Kategori']], c4:[['Tarih','YilAy']] };
for (const k in sols) { console.log('==', k); M(sols[k]);
  for (const [t,c] of grids[k]) { try { const r = PBI_DAX.query({ rows:[{t,c}], measures: Object.fromEntries(PBI_MEASURES.map(m=>[m.name,{name:m.name,expr:m.expr}])), values:[sols[k]], slicers:[], totals:true, keepBlank:true }).rows; console.log(' ', c, r.slice(0,14).map(x=>x.keys? x.keys.join('/')+'='+(typeof x.vals[0]==='number'?Math.round(x.vals[0]*1000)/1000:x.vals[0]) : JSON.stringify(x)).join(' | ')); } catch(e) { console.log('ERR', e.message); } } }
