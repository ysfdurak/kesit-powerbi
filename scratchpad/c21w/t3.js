require('./h.js');
console.log('iade', E('[Net Satış] - [İade Tutarı]'), E('CALCULATE([Net Satış], Satislar[Durum] <> "İade")'));
const F='TREATAS({(2023, 12), (2024, 1)}, Tarih[Yil], Tarih[AyNo])';
console.log('arb', E(`CALCULATE([Net Satış], ${F})`));
console.log('2023-12', E('CALCULATE([Net Satış], Tarih[Yil]=2023, Tarih[AyNo]=12)'), '2024-1', E('CALCULATE([Net Satış], Tarih[Yil]=2024, Tarih[AyNo]=1)'), '2024-12', E('CALCULATE([Net Satış], Tarih[Yil]=2024, Tarih[AyNo]=12)'));
console.log('overwrite', E(`CALCULATE(CALCULATE([Net Satış], Tarih[Yil] = 2024), ${F})`));
console.log('keep', E(`CALCULATE(CALCULATE([Net Satış], KEEPFILTERS(Tarih[Yil] = 2024)), ${F})`));
console.log('separate cols', E(`CALCULATE(CALCULATE([Net Satış], Tarih[Yil] = 2024), Tarih[Yil] IN {2023,2024}, Tarih[AyNo] IN {12,1})`));
console.log('yoy arb', E(`CALCULATE([Satış GY], ${F})`));
// ALLSELECTED with slicer
const K=[{t:'Kategoriler',c:'Kategori'}];
const sl=[{t:'Satislar',c:'Kanal',vals:['Web']}];
try { const r=X.query({rows:K, measures:ms, values:['[Net Satış]','[Seçime Göre Pay %]','CALCULATE([Net Satış], ALLSELECTED(Kategoriler))','CALCULATE([Net Satış], ALL(Kategoriler))'], slicers:sl, totals:true}); r.rows.forEach(x=>console.log(x.keys.join(),x.vals.join(' | '))); console.log(r.total);} catch(e){console.log(e.message)}
