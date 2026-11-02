require('./e.js');
p('marj', ev('[Kâr Marjı %]'), ev('AVERAGEX(FILTER(Satislar, Satislar[Durum] <> "İptal"), DIVIDE(Satislar[Tutar] - Satislar[Maliyet], Satislar[Tutar]))'));
p(g([{t:'Kategoriler',c:'Kategori'}],['[Kâr Marjı %]','AVERAGEX(FILTER(Satislar, Satislar[Durum] <> "İptal"), DIVIDE(Satislar[Tutar] - Satislar[Maliyet], Satislar[Tutar]))']));
p('toplam', ev('[Toplam Satış]'), ev('[Net Satış]'));
p(q('EVALUATE TOPN(3, ADDCOLUMNS(Urunler, "Ham", SUM(Satislar[Tutar]), "Gecisli", CALCULATE(SUM(Satislar[Tutar]))), Urunler[UrunNo], ASC)').map(r=>[r[0],r[1],r[r.length-2],r[r.length-1]]));
p(g([{t:'Tarih',c:'Yil'}],['IF(ISFILTERED(Kategoriler[Kategori]), "Kategori seçili", "Tüm kategoriler")','COUNTROWS(VALUES(Kategoriler[Kategori]))']));
p(g([{t:'Kategoriler',c:'Kategori'}],['IF(ISFILTERED(Kategoriler[Kategori]), "Kategori seçili", "Tüm kategoriler")']));
