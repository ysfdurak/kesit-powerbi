require('./h.js');
const P = s => { try { const r = rq(s); console.log(JSON.stringify(r.map(x=>x.map(v=>typeof v==='number'?Math.round(v*10000)/10000:v)))); } catch(e) { console.log('ERR', e.message); } };
const PR = `VAR Proje = DATATABLE("Yil", INTEGER, "A", DOUBLE, "B", DOUBLE, {{0, -250000, -250000}, {1, 60000, 20000}, {2, 80000, 40000}, {3, 90000, 80000}, {4, 70000, 140000}, {5, 50000, 170000}})`;
P(`EVALUATE\n${PR}\nRETURN ADDCOLUMNS(GENERATESERIES(0, 0.40, 0.05), "NBD A", VAR r = [Value] RETURN SUMX(Proje, [A] / (1 + r) ^ [Yil]), "NBD B", VAR r = [Value] RETURN SUMX(Proje, [B] / (1 + r) ^ [Yil]))`);
P(`EVALUATE\n${PR}\nRETURN ADDCOLUMNS(Proje, "Kum A", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [A]), "Ind A", [A] / 1.2 ^ [Yil], "IndKum A", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [A] / 1.2 ^ [Yil]))`);
P(`EVALUATE\n${PR}\nRETURN ROW("PI A", DIVIDE(SUMX(FILTER(Proje, [Yil] > 0), [A] / 1.2 ^ [Yil]), -SUMX(FILTER(Proje, [Yil] = 0), [A])), "PI B", DIVIDE(SUMX(FILTER(Proje, [Yil] > 0), [B] / 1.2 ^ [Yil]), 250000))`);
P(`EVALUATE\n${PR}\nVAR K = ADDCOLUMNS(Proje, "Kum", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [A]))
VAR Ilk = MINX(FILTER(K, [Kum] >= 0), [Yil])
RETURN ROW("Geri ödeme", Ilk - 1 + DIVIDE(-MAXX(FILTER(K, [Yil] = Ilk - 1), [Kum]), MAXX(FILTER(K, [Yil] = Ilk), [A])))`);
P(`EVALUATE\n${PR}\nVAR K = ADDCOLUMNS(Proje, "Kum", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [A] / 1.2 ^ [Yil]), "Ind", [A] / 1.2 ^ [Yil])
VAR Ilk = MINX(FILTER(K, [Kum] >= 0), [Yil])
RETURN ROW("İndirgenmiş geri ödeme", Ilk - 1 + DIVIDE(-MAXX(FILTER(K, [Yil] = Ilk - 1), [Kum]), MAXX(FILTER(K, [Yil] = Ilk), [Ind])))`);
P(`EVALUATE\n${PR}\nVAR K = ADDCOLUMNS(Proje, "Kum", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [B]))
VAR Ilk = MINX(FILTER(K, [Kum] >= 0), [Yil])
RETURN ROW("Geri ödeme B", Ilk - 1 + DIVIDE(-MAXX(FILTER(K, [Yil] = Ilk - 1), [Kum]), MAXX(FILTER(K, [Yil] = Ilk), [B])))`);
P(`EVALUATE\n${PR}\nRETURN ADDCOLUMNS(CROSSJOIN(SELECTCOLUMNS(GENERATESERIES(0.15, 0.25, 0.05), "Oran", [Value]), SELECTCOLUMNS(GENERATESERIES(-0.2, 0.1, 0.1), "Degisim", [Value])), "NBD", VAR r = [Oran] VAR d = [Degisim] RETURN SUMX(Proje, IF([Yil] = 0, [A], [A] * (1 + d)) / (1 + r) ^ [Yil]))`);
P(`EVALUATE\n${PR}\nVAR Akis = SELECTCOLUMNS(Proje, "Tarih", DATE(2025 + [Yil], 1, 1), "A", [A], "B", [B])\nRETURN ROW("IRR A", XIRR(Akis, [A], [Tarih]), "IRR B", XIRR(Akis, [B], [Tarih]))`);
// crossover search
P(`EVALUATE\n${PR}\nRETURN FILTER(ADDCOLUMNS(GENERATESERIES(0.10, 0.20, 0.005), "Fark", VAR r = [Value] RETURN SUMX(Proje, ([B] - [A]) / (1 + r) ^ [Yil])), ABS([Fark]) < 3000)`);
