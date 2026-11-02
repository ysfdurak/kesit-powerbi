global.window = global; for (const f of ['data','dax','measures']) require('/home/claude/pbi/' + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const ev = e => { try { return X.evalMeasure(ms, e, []); } catch (er) { return 'ERR ' + er.message; } };
for (const e of ['COUNTROWS(FILTER(Urunler, Urunler[Fiyat] = CALCULATE(MAX(Urunler[Fiyat]), ALLEXCEPT(Urunler, Urunler[Kategori]))))',
 'COUNTROWS(FILTER(Urunler, Urunler[Fiyat] = CALCULATE(MAX(Urunler[Fiyat]), ALL(Urunler), VALUES(Urunler[Kategori]))))',
 'COUNTROWS(FILTER(Urunler, Urunler[Fiyat] = CALCULATE(MAX(Urunler[Fiyat]), REMOVEFILTERS(Urunler[Urun], Urunler[UrunNo], Urunler[Fiyat], Urunler[BirimMaliyet], Urunler[Stok]))))',
 'SUMX(Urunler, CALCULATE(COUNTROWS(Urunler), ALLEXCEPT(Urunler, Urunler[Kategori])))',
 'SUMX(Satislar, CALCULATE(COUNTROWS(Satislar), ALLEXCEPT(Satislar, Satislar[Kanal])))'])
  console.log(e.slice(0, 100).padEnd(101), ev(e));
console.log('kategori sayısı', ev('DISTINCTCOUNT(Urunler[Kategori])'), 'ürün', ev('COUNTROWS(Urunler)'));
