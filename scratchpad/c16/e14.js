require('./h.js'); const P = require('./pz.js');
const q1 = `EVALUATE
VAR Pazar = ${P}
VAR T =
    ADDCOLUMNS(
        VALUES(Kategoriler[Kategori]),
        "Satış", CALCULATE([Net Satış], Tarih[Yil] = 2024),
        "Pazar", VAR k = Kategoriler[Kategori] RETURN SUMX(FILTER(Pazar, [Kategori] = k && [Yil] = 2024), [PazarTL])
    )
VAR Ilk3 = TOPN(3, T, [Satış], DESC)
VAR Diger = EXCEPT(T, Ilk3)
RETURN
    UNION(
        SELECTCOLUMNS(Ilk3, "Grup", Kategoriler[Kategori], "Satış", [Satış], "Pazar", [Pazar], "Pay", DIVIDE([Satış], [Pazar])),
        ROW("Grup", "Diğer", "Satış", SUMX(Diger, [Satış]), "Pazar", SUMX(Diger, [Pazar]), "Pay", DIVIDE(SUMX(Diger, [Satış]), SUMX(Diger, [Pazar])))
    )`;
T(q1);
const q2 = `EVALUATE
VAR Pazar = ${P}
VAR T =
    ADDCOLUMNS(
        VALUES(Kategoriler[Kategori]),
        "Biz23", CALCULATE([Net Satış], Tarih[Yil] = 2023),
        "Biz24", CALCULATE([Net Satış], Tarih[Yil] = 2024),
        "P23", VAR k = Kategoriler[Kategori] RETURN SUMX(FILTER(Pazar, [Kategori] = k && [Yil] = 2023), [PazarTL]),
        "P24", VAR k = Kategoriler[Kategori] RETURN SUMX(FILTER(Pazar, [Kategori] = k && [Yil] = 2024), [PazarTL])
    )
VAR PazarOrt = DIVIDE(SUMX(T, [P24]), SUMX(T, [P23])) - 1
RETURN
    ADDCOLUMNS(
        T,
        "Pazar Büyümesi", DIVIDE([P24], [P23]) - 1,
        "Bizim Büyüme", DIVIDE([Biz24], [Biz23]) - 1,
        "Pay Değişimi (puan)", (DIVIDE([Biz24], [P24]) - DIVIDE([Biz23], [P23])) * 100,
        "Kadran",
            VAR Hizli = DIVIDE([P24], [P23]) - 1 >= PazarOrt
            VAR Kazan = DIVIDE([Biz24], [P24]) > DIVIDE([Biz23], [P23])
            RETURN SWITCH(TRUE(),
                Hizli && Kazan, "Yıldız",
                Hizli, "Fırsat kaçıyor",
                Kazan, "Güçleniyor",
                "Geriliyor")
    )`;
T(q2);
T(`EVALUATE VAR Pazar = ${P} RETURN ADDCOLUMNS(Pazar, "Bizim Satış", CALCULATE([Net Satış], TREATAS(ROW("K", [Kategori], "Y", [Yil]), Kategoriler[Kategori], Tarih[Yil])))`);
require('fs').writeFileSync('q1.txt', q1); require('fs').writeFileSync('q2.txt', q2);
