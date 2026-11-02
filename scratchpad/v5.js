const {ev,q,run,def}=require('./h.js');
def('Ortalama Stok Değeri','AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])');
def('Stok Devir Hızı','DIVIDE([Net Maliyet], [Ortalama Stok Değeri])');
def('Stokta Kalma Günü','DIVIDE(DATEDIFF(MIN(Tarih[Tarih]), MAX(Tarih[Tarih]), DAY) + 1, [Stok Devir Hızı])');
def('Stoksuz Ay','COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Stok Adedi] = 0))');
const w=m=>`CALCULATE(${m}, Tarih[Yil] = 2024)`;
console.log(q(['[Stok Değeri]','[Ortalama Stok Değeri]','[Net Maliyet]','[Stok Devir Hızı]','[Stokta Kalma Günü]','[Stoksuz Ay]'].map(w),{t:'Kategoriler',c:'Kategori'}));
console.log(ev(w('[Stoksuz Ay]')), ev(w('COUNTROWS(FILTER(VALUES(Urunler[UrunNo]), [Stok Adedi] = 0))')));
console.log(run(`EVALUATE
VAR T = CALCULATETABLE(ADDCOLUMNS(VALUES(Urunler[Urun]), "Kat", MAX(Urunler[Kategori]), "SonStok", [Stok Adedi], "StokTL", [Stok Değeri], "Devir", [Stok Devir Hızı], "Gun", [Stokta Kalma Günü], "Sifir", [Stoksuz Ay], "Adet", [Satılan Adet], "Satis", [Net Satış]), Tarih[Yil] = 2024)
RETURN T`));
