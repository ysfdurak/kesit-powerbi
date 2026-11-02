require('./h.js');
const P = s => { try { console.log(JSON.stringify(rq(s))); } catch(e) { console.log('ERR', e.message); } };
P(`EVALUATE
VAR T = DATATABLE("Yil", INTEGER, "Nakit", DOUBLE, {{0, -1000}, {1, 300}, {2, 400}, {3, 500}})
RETURN ADDCOLUMNS(T, "Kum", VAR Y = [Yil] RETURN SUMX(FILTER(T, [Yil] <= Y), [Nakit]), "Ind", [Nakit] / (1 + 0.1) ^ [Yil])`);
P(`EVALUATE
VAR T = DATATABLE("Yil", INTEGER, "Nakit", DOUBLE, {{0, -1000}, {1, 300}, {2, 400}, {3, 500}})
RETURN ADDCOLUMNS(GENERATESERIES(0, 0.3, 0.05), "NBD", VAR r = [Value] RETURN SUMX(T, [Nakit] / POWER(1 + r, [Yil])))`);
P(`EVALUATE
VAR T = {(0, -1000), (1, 300)}
RETURN T`);
P(`EVALUATE ROW("a", 2 ^ 3, "b", CONCATENATEX(VALUES(Kategoriler[Kategori]), Kategoriler[Kategori], ", ", Kategoriler[Kategori], ASC))`);
P(`EVALUATE
VAR T = DATATABLE("Yil", INTEGER, "Nakit", DOUBLE, {{0, -1000}, {1, 300}, {2, 400}, {3, 500}})
VAR K = ADDCOLUMNS(T, "Kum", VAR Y = [Yil] RETURN SUMX(FILTER(T, [Yil] <= Y), [Nakit]))
VAR Ilk = MINX(FILTER(K, [Kum] >= 0), [Yil])
VAR Onceki = MAXX(FILTER(K, [Yil] = Ilk - 1), [Kum])
VAR Akis = MAXX(FILTER(K, [Yil] = Ilk), [Nakit])
RETURN ROW("Geri", Ilk - 1 + DIVIDE(-Onceki, Akis))`);
