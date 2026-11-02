require('./h.js');
const D=[{t:'Departmanlar',c:'Departman'}];
def('Pay Bütçe', `VAR Kopru =
    DATATABLE(
        "ProjeNo", INTEGER, "DepartmanNo", INTEGER, "Pay", DOUBLE,
        {
            {5, 2, 0.7}, {5, 1, 0.3},
            {7, 3, 0.6}, {7, 4, 0.4},
            {12, 3, 0.5}, {12, 1, 0.3}, {12, 2, 0.2}
        }
    )
VAR Gorunen = FILTER(Kopru, [DepartmanNo] IN VALUES(Departmanlar[DepartmanNo]))
RETURN SUMX(Gorunen, [Pay] * LOOKUPVALUE(Projeler[Butce], Projeler[ProjeNo], [ProjeNo]))`);
def('Tam Bütçe', `VAR Kopru =
    DATATABLE(
        "ProjeNo", INTEGER, "DepartmanNo", INTEGER, "Pay", DOUBLE,
        {
            {5, 2, 0.7}, {5, 1, 0.3},
            {7, 3, 0.6}, {7, 4, 0.4},
            {12, 3, 0.5}, {12, 1, 0.3}, {12, 2, 0.2}
        }
    )
VAR Projeler_ = SELECTCOLUMNS(FILTER(Kopru, [DepartmanNo] IN VALUES(Departmanlar[DepartmanNo])), "P", [ProjeNo])
RETURN CALCULATE([Proje Bütçesi], REMOVEFILTERS(Departmanlar), TREATAS(Projeler_, Projeler[ProjeNo]))`);
console.log(G(D,['[Proje Bütçesi]','[Pay Bütçe]','[Tam Bütçe]','[Gider]','[Çalışan Sayısı]']).join('\n'));
const S=[{t:'Calisanlar',c:'AdSoyad'}], B=[{t:'Musteriler',c:'Bolge'}];
const e='CALCULATE(COUNTROWS(Kategoriler), CROSSFILTER(Satislar[UrunNo], Urunler[UrunNo], BOTH), CROSSFILTER(Urunler[Kategori], Kategoriler[Kategori], BOTH))';
console.log(G(B,[e]).join('\n')); console.log(G(S,[e]).join('\n'));
console.log(G([{t:'Satislar',c:'Kanal'}],[e, 'CALCULATE(COUNTROWS(Urunler), CROSSFILTER(Satislar[UrunNo], Urunler[UrunNo], BOTH))']).join('\n'));
