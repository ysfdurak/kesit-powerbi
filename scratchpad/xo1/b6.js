require('./e.js');
const wrong='VAR Oran = DIVIDE([Net Satış], [Hedef]) RETURN SWITCH(TRUE(), Oran >= 0.95, "Hedefte", Oran >= 1.05, "Üstün", "Geride")';
const right='VAR Oran = DIVIDE([Net Satış], [Hedef]) RETURN SWITCH(TRUE(), Oran >= 1.05, "Üstün", Oran >= 0.95, "Hedefte", "Geride")';
const r=g([{t:'Tarih',c:'YilAy'}],[wrong,right]).map(JSON.parse);
const c=(i)=>r.reduce((a,x)=>(a[x.vals[i]]=(a[x.vals[i]]||0)+1,a),{});p(c(0),c(1));
p(r.filter(x=>x.vals[1]==='Üstün').map(x=>x.keys[0]));
// sepet bandı
const sb='VAR S = [Ortalama Sepet] RETURN SWITCH(TRUE(), ISBLANK(S), BLANK(), S >= 1500, "Büyük sepet", S >= 800, "Orta sepet", "Küçük sepet")';
p(g([{t:'Kategoriler',c:'Kategori'}],[sb]),g([{t:'Tarih',c:'Yil'}],[sb]));
const be='VAR B = [YoY %] RETURN SWITCH(TRUE(), ISBLANK(B), "Karşılaştırma yok", B >= 0.5, "Hızlı büyüme", B >= 0, "Büyüme", "Düşüş")';
p(g([{t:'Kategoriler',c:'Kategori'}],[be]).slice(0,3),g([{t:'Tarih',c:'Yil'}],[be]));
p(g([{t:'Tarih',c:'YilAy'}],[be]).map(JSON.parse).filter(x=>x.vals[0]==='Düşüş').length);
