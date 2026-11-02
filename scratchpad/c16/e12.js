require('./h.js'); const P = require('./pz.js');
ms['Pazar Büyüklüğü']={name:'a',expr:`VAR P = ${P} RETURN SUMX(FILTER(P, [Kategori] IN VALUES(Kategoriler[Kategori]) && [Yil] IN VALUES(Tarih[Yil])), [PazarTL])`};
ms['Pazar Payı %']={name:'b',expr:`DIVIDE([Net Satış], [Pazar Büyüklüğü])`};
ms['Pazar GY']={name:'c',expr:`CALCULATE([Pazar Büyüklüğü], SAMEPERIODLASTYEAR(Tarih[Tarih]))`};
ms['Pay GY']={name:'d',expr:`CALCULATE([Pazar Payı %], SAMEPERIODLASTYEAR(Tarih[Tarih]))`};
const cols = `"Satis", [Net Satış], "Pazar", [Pazar Büyüklüğü], "Pay", [Pazar Payı %], "PayGY", [Pay GY], "Puan", ([Pazar Payı %]-[Pay GY])*100, "PazarBuy", DIVIDE([Pazar Büyüklüğü]-[Pazar GY],[Pazar GY]), "Buy", [YoY %], "PazarGY", [Pazar GY]`;
T(`EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(Kategoriler[Kategori]), ${cols}), Tarih[Yil]=2024)`);
T(`EVALUATE CALCULATETABLE(ROW(${cols}), Tarih[Yil]=2024)`);
T(`EVALUATE ADDCOLUMNS(VALUES(Tarih[Yil]), ${cols})`);
// month level problem
T(`EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(Tarih[Ay]), "Pay", [Pazar Payı %]), Tarih[Yil]=2024, Kategoriler[Kategori]="Elektronik")`);
