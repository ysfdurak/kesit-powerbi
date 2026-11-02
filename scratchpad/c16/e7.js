require('./h.js');
T(`EVALUATE ADDCOLUMNS(VALUES(Kategoriler[Kategori]), "s23", CALCULATE([Net Satış], Tarih[Yil]=2023), "s24", CALCULATE([Net Satış], Tarih[Yil]=2024), "s22", CALCULATE([Net Satış], Tarih[Yil]=2022))`);
const P = `DATATABLE("Kategori", STRING, "Yil", INTEGER, "Pazar", CURRENCY, {{"Elektronik", 2023, 6000000}, {"Elektronik", 2024, 9600000}, {"Kitap", 2024, 100}})`;
T(`EVALUATE ${P}`);
console.log(ev(`VAR P = ${P} RETURN SUMX(FILTER(P, [Kategori] IN VALUES(Kategoriler[Kategori]) && [Yil] IN VALUES(Tarih[Yil])), [Pazar])`, []));
T(`EVALUATE ADDCOLUMNS(${P}, "Biz", CALCULATE([Net Satış], TREATAS(ROW("K", [Kategori], "Y", [Yil]), Kategoriler[Kategori], Tarih[Yil])), "Biz2", VAR k=[Kategori] VAR y=[Yil] RETURN CALCULATE([Net Satış], Kategoriler[Kategori]=k, Tarih[Yil]=y))`);
console.log(X.query({rows:[{t:'Kategoriler',c:'Kategori'}], measures: ms, values:[`VAR P = ${P} RETURN SUMX(FILTER(P, [Kategori] IN VALUES(Kategoriler[Kategori]) && [Yil] IN VALUES(Tarih[Yil])), [Pazar])`], totals:true}).rows.map(r=>r.keys+'='+r.vals));
console.log(X.query({rows:[{t:'Tarih',c:'Yil'}], measures: ms, values:[`VAR P = ${P} RETURN SUMX(FILTER(P, CONTAINS(VALUES(Kategoriler[Kategori]), Kategoriler[Kategori], [Kategori]) && [Yil] IN VALUES(Tarih[Yil])), [Pazar])`], totals:true}).rows.map(r=>r.keys+'='+r.vals));
// TREATAS in measure form: filter model by variable table
console.log(ev(`VAR P = ${P} RETURN CALCULATE([Net Satış], TREATAS(SELECTCOLUMNS(P, "K", [Kategori]), Kategoriler[Kategori]))`), ev(`CALCULATE([Net Satış], Kategoriler[Kategori] IN {"Elektronik","Kitap"})`));
console.log(ev('PMT(0.02, 12, -100000)'));
T(`EVALUATE { ("a", 1, 2.5), ("b", 2, 3) }`);
