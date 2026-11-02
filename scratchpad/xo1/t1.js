require('./e.js');
console.log(q('EVALUATE ROW("min", MIN(Tarih[Tarih]), "max", MAX(Tarih[Tarih]), "smin", MIN(Satislar[Tarih]), "smax", MAX(Satislar[Tarih]), "tmax", MAX(Satislar[TeslimTarihi]))'));
console.log(q('EVALUATE SUMMARIZECOLUMNS(Tarih[Yil], "N", [Net Satış], "H", [Hedef], "S", COUNTROWS(Satislar))'));
console.log(q('EVALUATE SUMMARIZECOLUMNS(Satislar[Kanal], "N", [Net Satış])'));
console.log(q('EVALUATE SUMMARIZECOLUMNS(Satislar[Durum], "N", COUNTROWS(Satislar))'));
console.log(q('EVALUATE TOPN(5, StokGorunum)'));
console.log(q('EVALUATE SUMMARIZECOLUMNS(StokGorunum[Tarih], "N", COUNTROWS(StokGorunum))').slice(0,40).map(r=>JSON.stringify(r)).join(' '));
console.log(q('EVALUATE TOPN(3, Hedefler)'));
