require('./h.js');
const y24=[{t:'Tarih',c:'Yil',values:[2024]}];
def('Naif Dilim Müşterisi', `VAR AltSinir = SELECTEDVALUE(MusteriDilimleri[Min])
VAR UstSinir = SELECTEDVALUE(MusteriDilimleri[Max])
RETURN COUNTROWS(FILTER(VALUES(Musteriler[MusteriNo]), [Net Satış] > AltSinir && [Net Satış] <= UstSinir))`);
console.log(G([{t:'MusteriDilimleri',c:'Dilim'}], ['[Naif Dilim Müşterisi]','[Dilimdeki Müşteri]'], y24), E('[Naif Dilim Müşterisi]', y24));
def('Bandı Yükselen Müşteri', `VAR T = ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "Bu", [Net Satış], "GY", [Satış GY])
RETURN COUNTROWS(FILTER(T,
    VAR B1 = MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [Bu] && [Bu] <= MusteriDilimleri[Max]), MusteriDilimleri[Sira])
    VAR B0 = MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [GY] && [GY] <= MusteriDilimleri[Max]), MusteriDilimleri[Sira])
    RETURN NOT ISBLANK(B0) && B1 > B0))`);
def('Bandı Düşen Müşteri', `VAR T = ADDCOLUMNS(VALUES(Musteriler[MusteriNo]), "Bu", [Net Satış], "GY", [Satış GY])
RETURN COUNTROWS(FILTER(T,
    VAR B1 = MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [Bu] && [Bu] <= MusteriDilimleri[Max]), MusteriDilimleri[Sira])
    VAR B0 = MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [GY] && [GY] <= MusteriDilimleri[Max]), MusteriDilimleri[Sira])
    RETURN NOT ISBLANK(B0) && (ISBLANK(B1) || B1 < B0)))`);
console.log(E('[Bandı Yükselen Müşteri]'), G([{t:'Tarih',c:'Yil'}], ['[Bandı Yükselen Müşteri]','[Bandı Düşen Müşteri]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Bandı Yükselen Müşteri]','[Bandı Düşen Müşteri]']));
try { console.log(Q(`EVALUATE
VAR T = ADDCOLUMNS(VALUES(Musteriler[MusteriNo]),
    "S23", CALCULATE([Net Satış], Tarih[Yil] = 2023),
    "S24", CALCULATE([Net Satış], Tarih[Yil] = 2024))
VAR T2 = ADDCOLUMNS(T,
    "Onceki", COALESCE(MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [S23] && [S23] <= MusteriDilimleri[Max]), MusteriDilimleri[Dilim]), "Yok"),
    "Simdi", COALESCE(MAXX(FILTER(MusteriDilimleri, MusteriDilimleri[Min] < [S24] && [S24] <= MusteriDilimleri[Max]), MusteriDilimleri[Dilim]), "Yok"))
RETURN GROUPBY(T2, [Onceki], [Simdi], "Musteri", COUNTX(CURRENTGROUP(), 1))
ORDER BY [Onceki], [Simdi]`)); } catch(e) { console.log('ERR', e.message); }
def('Üst %20 Eşiği', `PERCENTILEX.INC(ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), "S", [Net Satış]), [S], 0.8)`);
def('Üst %20 Payı %', `VAR Esik = [Üst %20 Eşiği]
VAR T = ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal"), "S", [Net Satış])
RETURN DIVIDE(SUMX(FILTER(T, [S] >= Esik), [S]), [Net Satış])`);
console.log(E('[Üst %20 Eşiği]'), E('[Üst %20 Payı %]'), G([{t:'Tarih',c:'Yil'}], ['[Üst %20 Eşiği]','[Üst %20 Payı %]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Üst %20 Eşiği]','[Üst %20 Payı %]']));
