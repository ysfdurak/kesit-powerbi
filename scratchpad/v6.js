const {ev,q,run,def}=require('./h.js');
def('Ortalama Stok Değeri','AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])');
def('Stok Devir Hızı','DIVIDE([Net Maliyet], [Ortalama Stok Değeri])');
def('Stokta Kalma Günü','DIVIDE(DATEDIFF(MIN(Tarih[Tarih]), MAX(Tarih[Tarih]), DAY) + 1, [Stok Devir Hızı])');
def('Stoksuz Ürün-Ay','SUMX(VALUES(Urunler[UrunNo]), COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Stok Adedi] = 0)))');
console.log(q('[Stoksuz Ürün-Ay]',{t:'Kategoriler',c:'Kategori'}), q('[Stoksuz Ürün-Ay]',{t:'Tarih',c:'Yil'}), ev('[Stoksuz Ürün-Ay]'));
console.log(q(['[Net Satış]','[Satılan Adet]'],{t:'Tarih',c:'Yil'},{filters:undefined}).join(), ev('CALCULATE([Satılan Adet], Urunler[Urun] = "Koşu Bandı")'), ev('CALCULATE([Satılan Adet], Urunler[Urun] = "Gurme Lokum Kutusu")'),ev('CALCULATE(MAX(Satislar[Tarih]), Urunler[Urun] = "Koşu Bandı")'),ev('CALCULATE(MAX(Satislar[Tarih]), Urunler[Urun] = "Gurme Lokum Kutusu")'));
console.log(q(['CALCULATE([Stok Adedi], Urunler[Urun] = "Koşu Bandı")','CALCULATE([Satılan Adet], Urunler[Urun] = "Koşu Bandı")'],{t:'Tarih',c:'Yil'}));
console.log(run(`EVALUATE
VAR T = CALCULATETABLE(ADDCOLUMNS(VALUES(Urunler[Urun]), "S", [Net Satış], "Stok", [Stok Değeri]), Tarih[Yil] = 2024)
VAR Top = SUMX(T, [S])
VAR T2 = ADDCOLUMNS(T, "Pay", VAR s = [S] RETURN DIVIDE(SUMX(FILTER(T, [S] >= s), [S]), Top))
VAR T3 = ADDCOLUMNS(T2, "Sinif", IF(ISBLANK([S]), "C", IF([Pay] <= 0.7, "A", IF([Pay] <= 0.9, "B", "C"))))
RETURN ROW("A", COUNTROWS(FILTER(T3,[Sinif]="A")), "B", COUNTROWS(FILTER(T3,[Sinif]="B")), "C", COUNTROWS(FILTER(T3,[Sinif]="C")),
 "Astok", SUMX(FILTER(T3,[Sinif]="A"),[Stok]), "Bstok", SUMX(FILTER(T3,[Sinif]="B"),[Stok]), "Cstok", SUMX(FILTER(T3,[Sinif]="C"),[Stok]),
 "As", SUMX(FILTER(T3,[Sinif]="A"),[S]), "Bs", SUMX(FILTER(T3,[Sinif]="B"),[S]), "Cs", SUMX(FILTER(T3,[Sinif]="C"),[S]), "top", Top, "stok", SUMX(T3,[Stok]))`));
console.log(run(`EVALUATE
CALCULATETABLE(ADDCOLUMNS(VALUES(Urunler[Urun]), "Kat", CALCULATE(MAX(Urunler[Kategori])), "Sifir", [Stoksuz Ürün-Ay]), Tarih[Yil] = 2024)`).filter(s=>!s.endsWith('null]')));
console.log(run(`EVALUATE
ADDCOLUMNS(VALUES(Urunler[Urun]), "Sifir", [Stoksuz Ürün-Ay])`).filter(s=>!s.endsWith('null]')));
