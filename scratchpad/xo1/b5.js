require('./e.js');
p(g([{t:'Kategoriler',c:'Kategori'}],['[Ortalama Sepet]','DIVIDE([Net Satış],[Hedef])','[YoY %]']));
p(g([{t:'Tarih',c:'Yil'}],['[Ortalama Sepet]','DIVIDE([Net Satış],[Hedef])','[YoY %]','COUNTROWS(FILTER(VALUES(Kategoriler[Kategori]), [Net Satış] >= [Hedef]))']));
p('tot', ev('[Ortalama Sepet]'), ev('DIVIDE([Net Satış],[Hedef])'), ev('COUNTROWS(FILTER(VALUES(Kategoriler[Kategori]), [Net Satış] >= [Hedef]))'));
const wrong='VAR Oran = DIVIDE([Net Satış], [Hedef]) RETURN SWITCH(TRUE(), Oran >= 0.95, "Hedefte", Oran >= 1.05, "Üstün", "Geride")';
const right='VAR Oran = DIVIDE([Net Satış], [Hedef]) RETURN SWITCH(TRUE(), Oran >= 1.05, "Üstün", Oran >= 0.95, "Hedefte", "Geride")';
p(g([{t:'Kategoriler',c:'Kategori'}],[wrong,right]));
p(g([{t:'Tarih',c:'YilAy'}],['COUNTROWS(FILTER(VALUES(Kategoriler[Kategori]), [Net Satış] >= [Hedef]))','DIVIDE([Net Satış],[Hedef])']).slice(24));
