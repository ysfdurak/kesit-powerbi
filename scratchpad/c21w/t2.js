require('./h.js');
const K=[{t:'Kategoriler',c:'Kategori'}], U=[{t:'Urunler',c:'Kategori'}], Y=[{t:'Tarih',c:'Yil'}], KN=[{t:'Satislar',c:'Kanal'}];
const show=(lbl,rows,vals,sl)=>{console.log('--',lbl); console.log(G(rows,vals,sl).join('\n'));};
show('ALL vs', K, ['[Net Satış]','CALCULATE([Net Satış], ALL(Satislar))','CALCULATE([Net Satış], REMOVEFILTERS(Urunler))','CALCULATE([Net Satış], REMOVEFILTERS(Kategoriler))','CALCULATE([Net Satış], REMOVEFILTERS(Urunler[Kategori]))']);
show('by kanal', KN, ['[Net Satış]','CALCULATE([Net Satış], ALL(Satislar))','CALCULATE([Net Satış], REMOVEFILTERS(Urunler))','CALCULATE([Net Satış], FILTER(ALL(Satislar), Satislar[Durum] <> "İade"))']);
show('Urunler kat hedef', U, ['[Hedef]','CALCULATE([Hedef], TREATAS(VALUES(Urunler[Kategori]), Hedefler[Kategori]))','[Net Satış]']);
show('table filter', K, ['CALCULATE([Net Satış], FILTER(Satislar, Satislar[Kanal] = "Web"))','CALCULATE([Net Satış], Satislar[Kanal] = "Web")','CALCULATE([Net Satış], FILTER(ALL(Satislar), Satislar[Kanal] = "Web"))']);
show('order', Y, ['[Net Satış]','CALCULATE([Net Satış], Tarih[Yil] = 2024, REMOVEFILTERS(Tarih))','CALCULATE([Net Satış], REMOVEFILTERS(Tarih), Tarih[Yil] = 2024)']);
