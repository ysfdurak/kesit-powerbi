const { M, ev, q, rq } = require('./h.js');
const S = M.tables.Satislar.rows;
console.log('tutar check', S.slice(0,5).map(r=>[r.Adet,r.BirimFiyat,r.Indirim,r.Tutar,r.Maliyet]));
console.log('tutar=adet*bf*(1-i)?', S.filter(r=>Math.abs(r.Adet*r.BirimFiyat*(1-r.Indirim)-r.Tutar)>0.01).length);
for (const e of ['PERCENTILE.INC(Satislar[Tutar],0.25)','PERCENTILE.INC(Satislar[Tutar],0.5)','PERCENTILE.INC(Satislar[Tutar],0.75)','MAX(Satislar[Tutar])','MIN(Satislar[Tutar])','AVERAGE(Satislar[Tutar])','MEDIAN(Satislar[Tutar])',
 'VAR Q1 = PERCENTILE.INC(Satislar[Tutar],0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar],0.75) RETURN Q3 + 1.5*(Q3-Q1)',
 'VAR Q1 = PERCENTILE.INC(Satislar[Tutar],0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar],0.75) VAR U = Q3 + 1.5*(Q3-Q1) RETURN COUNTROWS(FILTER(Satislar, Satislar[Tutar] > U))',
 'VAR Q1 = PERCENTILE.INC(Satislar[Tutar],0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar],0.75) VAR U = Q3 + 1.5*(Q3-Q1) RETURN SUMX(FILTER(Satislar, Satislar[Tutar] > U), Satislar[Tutar]) / SUM(Satislar[Tutar])',
 'VAR Q1 = PERCENTILE.INC(Satislar[Tutar],0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar],0.75) VAR U = Q3 + 1.5*(Q3-Q1) RETURN AVERAGEX(Satislar, MIN(Satislar[Tutar], U))',
 'PERCENTILEX.INC(VALUES(Satislar[SiparisNo]), CALCULATE(SUM(Satislar[Tutar])), 0.75)',
 'AVERAGE(Satislar[KargoGun])','MEDIAN(Satislar[KargoGun])','PERCENTILE.INC(Satislar[KargoGun],0.75)','PERCENTILE.INC(Satislar[KargoGun],0.25)','MAX(Satislar[KargoGun])',
 'AVERAGEX(FILTER(Satislar, NOT ISBLANK(Satislar[TeslimTarihi])), DATEDIFF(Satislar[Tarih], Satislar[TeslimTarihi], DAY))',
 'AVERAGEX(Satislar, IF(ISBLANK(Satislar[KargoGun]), 0, Satislar[KargoGun]))',
 'AVERAGEX(Satislar, COALESCE(Satislar[KargoGun], MEDIAN(Satislar[KargoGun])))',
]) console.log(e.slice(0,90), '=>', ev(e));
const kq = 'VAR Q1 = PERCENTILE.INC(Satislar[Tutar],0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar],0.75) VAR U = Q3 + 1.5*(Q3-Q1) RETURN COUNTROWS(FILTER(Satislar, Satislar[Tutar] > U))';
console.log(q(kq,{t:'Kategoriler',c:'Kategori'}), q(kq,{t:'Tarih',c:'Yil'}));
console.log(q('VAR Q1 = PERCENTILE.INC(Satislar[Tutar],0.25) VAR Q3 = PERCENTILE.INC(Satislar[Tutar],0.75) RETURN Q3 + 1.5*(Q3-Q1)',{t:'Kategoriler',c:'Kategori'}));
const cor = (x,y,lvl) => `VAR T = ADDCOLUMNS(${lvl}, "X", ${x}, "Y", ${y}) VAR T2 = FILTER(T, NOT ISBLANK([X]) && NOT ISBLANK([Y])) VAR MX = AVERAGEX(T2,[X]) VAR MY = AVERAGEX(T2,[Y]) RETURN DIVIDE(SUMX(T2, ([X]-MX)*([Y]-MY)), SQRT(SUMX(T2, ([X]-MX)^2)) * SQRT(SUMX(T2, ([Y]-MY)^2)))`;
const c1 = cor('AVERAGE(Urunler[Fiyat])','[Satılan Adet]','VALUES(Urunler[Urun])'); console.log('fiyat-adet', ev(c1), q(c1,{t:'Kategoriler',c:'Kategori'}), q(c1,{t:'Tarih',c:'Yil'}));
const c2 = cor('[Ortalama İndirim %]','[Satılan Adet]','VALUES(Urunler[Urun])'); console.log('ind-adet', ev(c2), q(c2,{t:'Kategoriler',c:'Kategori'}));
const c3 = cor('[Sipariş Sayısı]','[Ortalama Sepet]','VALUES(Musteriler[MusteriNo])'); console.log('sip-sepet', ev(c3), q(c3,{t:'Kategoriler',c:'Kategori'}), q(c3,{t:'Tarih',c:'Yil'}));
const c4 = cor('[Ortalama Kargo Günü]','[İade Oranı %]','VALUES(Urunler[Urun])'); console.log('kargo-iade', ev(c4));
const c5 = cor('[Ortalama Kargo Günü]','[İade Oranı %]','VALUES(Musteriler[Sehir])'); console.log('kargo-iade sehir', ev(c5));
const c6 = cor('AVERAGE(Urunler[Fiyat])','[Kâr Marjı %]','VALUES(Urunler[Urun])'); console.log('fiyat-marj', ev(c6));
const c7 = cor('[Ortalama İndirim %]','[Kâr Marjı %]','VALUES(Urunler[Urun])'); console.log('ind-marj', ev(c7), q(c7,{t:'Kategoriler',c:'Kategori'}));
