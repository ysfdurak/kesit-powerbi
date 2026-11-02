const K=[{t:'Kategoriler',c:'Kategori'}], Y=[{t:'Tarih',c:'Yil'}], U=[{t:'Urunler',c:'Urun'}], CH=[{t:'Satislar',c:'Kanal'}], D=[{t:'Departmanlar',c:'Departman'}], YA=[{t:'Tarih',c:'YilAy'}];
module.exports=[
['fc1','COUNTROWS(FILTER(Satislar, Satislar[Kanal] = "Web"))','COUNTROWS(CALCULATETABLE(Satislar, Satislar[Kanal] = "Web"))',CH],
['fc2','COUNTROWS(FILTER(ALL(Satislar), Satislar[Kanal] = "Web"))','COUNTROWS(Satislar)',CH],
['isf','IF(ISFILTERED(Kategoriler[Kategori]), "doğrudan", "yok")','IF(ISCROSSFILTERED(Urunler[Kategori]), "çapraz", "yok")',K],
['isf2','IF(ISFILTERED(Urunler[Kategori]), "doğrudan", "yok")','IF(HASONEVALUE(Urunler[Kategori]), "tek değer", "birden çok")',K],
['isf3','IF(HASONEFILTER(Urunler[Kategori]), "tek filtre", "filtre yok")','1',K],
['sx','SUMX(Urunler, [Toplam Satış])','SUMX(Urunler, SUM(Satislar[Tutar]))',K],
['stok','CALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))','CALCULATE(SUM(StokGorunum[StokAdet]), LASTNONBLANK(Tarih[Tarih], CALCULATE(COUNTROWS(StokGorunum))))',Y],
['stok2','SUM(StokGorunum[StokAdet])','CALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))',YA],
['rel','[Teslime Göre Satış]','CALCULATE([Net Satış], CROSSFILTER(Satislar[Tarih], Tarih[Tarih], NONE))',Y],
['win1','CALCULATE([Net Satış], OFFSET(-1, ALLSELECTED(Tarih[Yil]), ORDERBY(Tarih[Yil], ASC)))','CALCULATE([Net Satış], INDEX(1, ALLSELECTED(Tarih[Yil]), ORDERBY(Tarih[Yil], ASC)))',Y],
['win2','CALCULATE([Net Satış], WINDOW(1, ABS, 0, REL, ALLSELECTED(Tarih[Yil]), ORDERBY(Tarih[Yil], ASC)))','[Net Satış]',Y],
['sd','STDEV.P(Calisanlar[Maas])','STDEV.S(Calisanlar[Maas])',D],
['rk','RANKX(ALL(Urunler[Urun]), [Net Satış])','ROWNUMBER(ALL(Urunler[Urun]), ORDERBY([Net Satış], DESC))',U],
['rk2','RANK(DENSE, ALL(Urunler[Urun]), ORDERBY([Net Satış], DESC))','RANK(SKIP, ALL(Urunler[Urun]), ORDERBY([Net Satış], DESC))',U],
];
