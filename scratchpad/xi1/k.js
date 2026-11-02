require('./h.js');
const p=(...x)=>console.log(JSON.stringify(x));
const q=(rows,vals,sl)=>{const r=X.query({rows,measures:ms,values:vals,slicers:sl||[],totals:true});return {rows:r.rows.map(x=>[x.keys.join('/'),...x.vals.map(v=>v==null?null:Math.round(v*1000)/1000)]),total:r.total}};
p(Q('EVALUATE MusteriDilimleri'));
p(q([{t:'MusteriDilimleri',c:'Dilim'}],['[Dilimdeki Müşteri]','[Dilim Satışı]']));
p(q([{t:'MusteriDilimleri',c:'Dilim'}],['[Dilimdeki Müşteri]'],[{t:'Kategoriler',c:'Kategori',values:['Kitap']}]));
p(q([{t:'MusteriDilimleri',c:'Dilim'}],['[Dilimdeki Müşteri]','VAR MusteriSatis = ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "S", CALCULATE([Net Satış], REMOVEFILTERS(Urunler), REMOVEFILTERS(Kategoriler))) RETURN SUMX(MusteriDilimleri, COUNTROWS(FILTER(MusteriSatis, [S] > MusteriDilimleri[Min] && [S] <= MusteriDilimleri[Max])))'],[{t:'Kategoriler',c:'Kategori',values:['Kitap']}]));
p(M('[Müşteri Sayısı]',[{t:'Kategoriler',c:'Kategori',values:['Kitap']}]));
// ABC
const sales=Q('EVALUATE ADDCOLUMNS(VALUES(Urunler[Urun]), "S", [Net Satış])',100).rows.map(r=>r[1]).filter(x=>x!=null).sort((a,b)=>b-a);
const tot=sales.reduce((a,b)=>a+b,0); let c=0, A1=0,A2=0,B1=0,B2=0, p80=0; sales.forEach(s=>{const prev=c; c+=s; if(c/tot<=0.7)A1++; else if(c/tot<=0.9)B1++; if(prev/tot<0.7)A2++; else if(prev/tot<0.9)B2++; if(prev/tot<0.8)p80++;});
console.log('n',sales.length,'A<=70',A1,'B',B1,'C',sales.length-A1-B1,'| crossing-in A',A2,'B',B2,'C',sales.length-A2-B2,'p80',p80, 'ties', sales.length-new Set(sales).size);
p(q([{t:'Urunler',c:'Urun'}],['[ABC Sınıfı]']).rows.reduce((a,r)=>{a[r[1]]=(a[r[1]]||0)+1;return a},{}));
p(M('COUNTROWS(FILTER(ADDCOLUMNS(VALUES(Urunler[Urun]), "C", [ABC Sınıfı]), [C] = "A"))'));
// order-level category pairs
const r=Q('EVALUATE FILTER(ADDCOLUMNS(CROSSJOIN(VALUES(Kategoriler[Kategori]), DISTINCT(KarsiUrunler[KarsiKategori])), "AB", VAR K2 = KarsiUrunler[KarsiKategori] RETURN COUNTROWS(INTERSECT(CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal"), CALCULATETABLE(VALUES(Satislar[SiparisNo]), REMOVEFILTERS(Kategoriler), Kategoriler[Kategori] = K2, Satislar[Durum] <> "İptal")))), Kategoriler[Kategori] < KarsiUrunler[KarsiKategori])',100);
p(r);
p(q([{t:'Kategoriler',c:'Kategori'}],['[Sipariş Sayısı]']), M('[Sipariş Sayısı]'));
p(M('AVERAGEX(VALUES(Satislar[SiparisNo]), CALCULATE(COUNTROWS(Satislar)))'), M('COUNTROWS(FILTER(VALUES(Satislar[SiparisNo]), CALCULATE(COUNTROWS(Satislar), Satislar[Durum] <> "İptal") >= 2))'));
