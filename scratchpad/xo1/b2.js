require('./e.js');
const t=(e)=>{try{return ev(e)}catch(x){return 'ERR '+x.message.slice(0,100)}};
p('web', t('CALCULATE([Net Satış], Satislar[Kanal] = "Web")'));
p('kitap', t('CALCULATE([Net Satış], Urunler[Kategori] = "Kitap")'));
p('web&kitap', t('CALCULATE([Net Satış], Satislar[Kanal] = "Web", Urunler[Kategori] = "Kitap")'));
p('web|kitap filter', t('CALCULATE([Net Satış], FILTER(Satislar, Satislar[Kanal] = "Web" || RELATED(Urunler[Kategori]) = "Kitap"))'));
p('web|kitap summ', t('CALCULATE([Net Satış], FILTER(SUMMARIZE(Satislar, Satislar[Kanal], Urunler[Kategori]), Satislar[Kanal] = "Web" || Urunler[Kategori] = "Kitap"))'));
p('web|kitap cj', t('CALCULATE([Net Satış], FILTER(CROSSJOIN(ALL(Satislar[Kanal]), ALL(Urunler[Kategori])), Satislar[Kanal] = "Web" || Urunler[Kategori] = "Kitap"))'));
p('web|kitap bool', t('CALCULATE([Net Satış], Satislar[Kanal] = "Web" || Urunler[Kategori] = "Kitap")'));
p('web,mobil', t('CALCULATE([Net Satış], Satislar[Kanal] = "Web", Satislar[Kanal] = "Mobil")'));
p('measure bool', t('CALCULATE([Net Satış], [Net Satış] > 1000)'));
p('pahali', t('CALCULATE([Net Satış], Urunler[Fiyat] >= 1000)'), t('CALCULATE([Net Satış], FILTER(Urunler, Urunler[Fiyat] >= 1000))'));
const sl=[{t:'Satislar',c:'Kanal',values:['Mobil']}];
p('mobil slicer: bool',t2('CALCULATE([Net Satış], Satislar[Kanal] = "Web")'),'filt',t2('CALCULATE([Net Satış], FILTER(Satislar, Satislar[Kanal] = "Web"))'),'keep',t2('CALCULATE([Net Satış], KEEPFILTERS(Satislar[Kanal] = "Web"))'));
function t2(e){try{return ev(e,sl)}catch(x){return 'ERR '+x.message}}
p(g([{t:'Satislar',c:'Kanal'}],['CALCULATE([Net Satış], FILTER(Satislar, Satislar[Kanal] = "Web"))','CALCULATE([Net Satış], Satislar[Kanal] = "Web")','CALCULATE([Net Satış], FILTER(ALL(Satislar), Satislar[Kanal] = "Web"))']));
p(g([{t:'Kategoriler',c:'Kategori'}],['CALCULATE([Net Satış], FILTER(Satislar, Satislar[Kanal] = "Web"))','CALCULATE([Net Satış], FILTER(ALL(Satislar), Satislar[Kanal] = "Web"))']));
p('lastday', t('CALCULATE([Net Satış], Tarih[Tarih] = MAX(Tarih[Tarih]))'), g([{t:'Tarih',c:'Yil'}],['CALCULATE([Net Satış], Tarih[Tarih] = MAX(Tarih[Tarih]))','CALCULATE([Net Satış], Satislar[Tarih] = MAX(Satislar[Tarih]))']));
p(g([{t:'Kategoriler',c:'Kategori'},{t:'Tarih',c:'Yil'}].slice(0,1),['CALCULATE([Net Satış], Satislar[Kanal] = "Web" || Urunler[Kategori] = "Kitap")'].map(()=> 'CALCULATE([Net Satış], FILTER(SUMMARIZE(Satislar, Satislar[Kanal], Urunler[Kategori]), Satislar[Kanal] = "Web" || Urunler[Kategori] = "Kitap"))')));
