require('./h.js');
console.log(Q('EVALUATE SUMMARIZECOLUMNS(Satislar[Durum], "n", COUNTROWS(Satislar), "bos", CALCULATE(COUNTROWS(Satislar), ISBLANK(Satislar[TeslimTarihi])), "minT", MIN(Satislar[Tarih]), "maxT", MAX(Satislar[Tarih]), "maxTes", MAX(Satislar[TeslimTarihi]))'));
console.log(Q('EVALUATE SUMMARIZECOLUMNS(Musteriler[Segment], "n", COUNTROWS(Musteriler))'));
console.log(Q('EVALUATE SUMMARIZECOLUMNS(Kategoriler[Kategori], TREATAS({"Elektronik","Kitap","Spor"}, Kategoriler[Kategori]), "Pay", [Seçime Göre Pay %], "N", [Net Satış])'));
console.log(E('CALCULATE([Toplam Satış], Satislar[Durum] <> "İptal", Satislar[Durum] <> "İade")'), E('CALCULATE([Net Satış], FILTER(Satislar, Satislar[Durum] <> "İade"))'));
console.log(Q('EVALUATE SUMMARIZECOLUMNS(Tarih[Yil], "Gun", COUNTROWS(Tarih), "Hedef", [Hedef], "Gider", [Gider], "GB", [Gider Bütçe])'));
