require('./h.js');
const D=[{t:'Departmanlar',c:'Departman'}];
const kop=`DATATABLE("ProjeNo", INTEGER, "DepartmanNo", INTEGER, "Pay", DOUBLE, {{5, 2, 0.7}, {5, 1, 0.3}, {7, 3, 0.6}, {7, 4, 0.4}, {12, 3, 0.5}, {12, 1, 0.3}, {12, 2, 0.2}})`;
console.log(G(D,[`COUNTROWS(FILTER(${kop}, [DepartmanNo] IN VALUES(Departmanlar[DepartmanNo])))`,`COUNTROWS(DISTINCT(SELECTCOLUMNS(FILTER(${kop}, [DepartmanNo] IN VALUES(Departmanlar[DepartmanNo])), "P", [ProjeNo])))`]).join('\n'));
console.log(G([{t:'Tarih',c:'Yil'}],['[Satış GY]', 'DIVIDE([Net Satış], [Satış GY]) - 1','DIVIDE([Net Satış] - [Satış GY], [Satış GY])']).join('\n'));
def('Satış USD (Sabit Kur)', `SUMX(
    VALUES(Tarih[YilAy]),
    VAR GecenYilAyBasi = EDATE(DATEVALUE(Tarih[YilAy] & "-01"), -12)
    VAR Kur = LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], GecenYilAyBasi, DovizKurlari[ParaBirimi], "USD")
    RETURN DIVIDE([Net Satış], Kur)
)`);
def('Stok USD', `VAR SonAyBasi = EOMONTH(MAX(Tarih[Tarih]), -1) + 1
VAR Kur = LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], SonAyBasi, DovizKurlari[ParaBirimi], "USD")
RETURN DIVIDE([Stok Değeri], Kur)`);
def('Kur Eksik Ay', `COUNTROWS(FILTER(VALUES(Tarih[YilAy]), ISBLANK(LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], EDATE(DATEVALUE(Tarih[YilAy] & "-01"), -12), DovizKurlari[ParaBirimi], "USD"))))`);
console.log(G([{t:'Tarih',c:'Yil'}],['[Satış USD (Sabit Kur)]','[Stok USD]','[Kur Eksik Ay]']).join('\n'));
console.log(G([{t:'Kategoriler',c:'Kategori'}],['[Stok USD]','[Satış USD (Sabit Kur)]']).join('\n'));
def('Son Kur', `VAR Gun = MAX(Tarih[Tarih])
VAR SonKurTarihi = CALCULATE(MAX(DovizKurlari[Tarih]), DovizKurlari[ParaBirimi] = "USD", DovizKurlari[Tarih] <= Gun)
RETURN LOOKUPVALUE(DovizKurlari[Kur], DovizKurlari[Tarih], SonKurTarihi, DovizKurlari[ParaBirimi], "USD")`);
console.log(G([{t:'Tarih',c:'Yil'}],['[Son Kur]']).join('\n'));
console.log(Q('EVALUATE ROW("A", CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024, 12, 1), DATE(2024, 12, 15))), "H", CALCULATE([Hedef], Tarih[YilAy] = "2024-12"), "P", DIVIDE(15, 31))'));
