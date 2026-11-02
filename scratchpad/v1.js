const {ev,q,run}=require('./h.js');
console.log(ev('MAX(Satislar[Tarih])'), ev('MIN(Satislar[Tarih])'), ev('MAX(Tarih[Tarih])'), ev('MIN(WebOlaylari[Tarih])'), ev('MAX(WebOlaylari[Tarih])'));
console.log(q('[Net Satış]',{t:'Tarih',c:'Yil'}));
console.log(run('EVALUATE ROW("a", MAX(StokGorunum[Tarih]), "b", MIN(StokGorunum[Tarih]), "n", DISTINCTCOUNT(StokGorunum[Tarih]))'));
console.log(run('EVALUATE ROW("a", MAX(Hedefler[Tarih]), "b", MIN(Hedefler[Tarih]))'));
console.log(q(['[Hedef]','[Net Satış]'],{t:'Tarih',c:'Yil'}));
