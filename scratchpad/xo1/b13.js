require('./e.js');
const t=(e,s)=>{try{return ev(e,s)}catch(x){return 'ERR '+x.message.slice(0,90)}};
const ka='AVERAGEX(VALUES(Kategoriler[Kategori]), CALCULATE([Net Satış]))';
p('ka', t(ka), g([{t:'Tarih',c:'Yil'}],[ka]));
const rt='CALCULATE([Net Satış], FILTER(ALLSELECTED(Tarih[Tarih]), Tarih[Tarih] <= MAX(Tarih[Tarih])))';
p(g([{t:'Tarih',c:'Yil'}],[rt,'[Kümülatif Satış]']), g([{t:'Tarih',c:'Yil'}],[rt,'[Kümülatif Satış]'],[{t:'Tarih',c:'Yil',values:[2023,2024]}]));
p('rt ym', g([{t:'Tarih',c:'YilAy'}],[rt],[{t:'Tarih',c:'Yil',values:[2024]}]).slice(0,2));
const qm='VAR __BASELINE_VALUE = CALCULATE(SUM(Satislar[Tutar]), Satislar[Kanal] IN { "Web" }) VAR __VALUE_TO_COMPARE = SUM(Satislar[Tutar]) RETURN IF(NOT ISBLANK(__VALUE_TO_COMPARE), DIVIDE(__VALUE_TO_COMPARE - __BASELINE_VALUE, __BASELINE_VALUE))';
p('qm', t(qm), g([{t:'Satislar',c:'Kanal'}],[qm,'DIVIDE([Net Satış] - CALCULATE([Net Satış], Satislar[Kanal] = "Web"), CALCULATE([Net Satış], Satislar[Kanal] = "Web"))']));
// quick measure average per category raw
const ka2='AVERAGEX(VALUES(Urunler[Kategori]), CALCULATE(SUM(Satislar[Tutar])))';
p(t(ka2), t(ka));
p(t('[Net Satış] - CALCULATE([Net Satış], Satislar[Kanal] = "Web")'), g([{t:'Satislar',c:'Kanal'}],['[Net Satış] - CALCULATE([Net Satış], Satislar[Kanal] = "Web")']), g([{t:'Kategoriler',c:'Kategori'}],['[Net Satış] - CALCULATE([Net Satış], Satislar[Kanal] = "Web")']).slice(0,2));
