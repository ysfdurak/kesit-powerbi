require('./h.js');
const p=(...x)=>console.log(JSON.stringify(x));
const q=(rows,vals,sl)=>{const r=X.query({rows,measures:ms,values:vals,slicers:sl||[],totals:true});return {rows:r.rows.map(x=>[x.keys.join('/'),...x.vals.map(v=>typeof v!=='number'?v:Math.round(v*1000)/1000)]),total:r.total}};
const seg='VAR MusteriSatis = ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), "S", CALCULATE([Net Satış], REMOVEFILTERS(Urunler), REMOVEFILTERS(Kategoriler))) RETURN SUMX(MusteriDilimleri, COUNTROWS(FILTER(MusteriSatis, [S] > MusteriDilimleri[Min] && [S] <= MusteriDilimleri[Max])))';
p(q([{t:'MusteriDilimleri',c:'Dilim'}],['[Dilimdeki Müşteri]',seg],[{t:'Kategoriler',c:'Kategori',values:['Kitap']}]));
p(q([{t:'MusteriDilimleri',c:'Dilim'}],['[Dilimdeki Müşteri]',seg],[{t:'Tarih',c:'Yil',values:[2024]}]));
const br=`VAR Simdi = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal") VAR Onceki = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal", DATEADD(Tarih[Tarih], -1, YEAR)) VAR Eski = CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal", Tarih[Tarih] < MIN(Tarih[Tarih]))`;
p(q([{t:'Tarih',c:'Yil'}],[br+' RETURN COUNTROWS(Simdi)', br+' RETURN COUNTROWS(Onceki)', br+' RETURN COUNTROWS(INTERSECT(Simdi, Onceki))', br+' RETURN COUNTROWS(EXCEPT(EXCEPT(Simdi, Onceki), Eski))', br+' RETURN COUNTROWS(INTERSECT(EXCEPT(Simdi, Onceki), Eski))', br+' RETURN COUNTROWS(EXCEPT(Onceki, Simdi))']));
p(q([{t:'Tarih',c:'Yil'}],['[Yeni Müşteri (Küme)]','[Geri Dönen Müşteri]','[Kayıp Müşteri]','[Yeni Müşteri]']));
// basket lift engine
const lift='VAR Tum = CALCULATE([Sipariş Sayısı], REMOVEFILTERS(Kategoriler), REMOVEFILTERS(Urunler)) VAR A = CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal", Kategoriler[Kategori] = "Hediye") VAR B = CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal", Kategoriler[Kategori] = "Kozmetik") VAR AB = COUNTROWS(INTERSECT(A, B)) RETURN DIVIDE(AB * Tum, COUNTROWS(A) * COUNTROWS(B))';
p(M(lift), q([{t:'Tarih',c:'Yil'}],[lift]));
// avg lines
p(M('DIVIDE(CALCULATE(COUNTROWS(Satislar), Satislar[Durum] <> "İptal"), [Sipariş Sayısı])'));
