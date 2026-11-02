require('./h.js');
const PR = `VAR Proje = DATATABLE("Yil", INTEGER, "A", DOUBLE, "B", DOUBLE, {{0, -200000, -200000}, {1, 110000, 10000}, {2, 90000, 30000}, {3, 60000, 70000}, {4, 30000, 130000}, {5, 10000, 160000}})`;
const P = s => console.log(JSON.stringify(rq(s).map(x=>x.map(v=>typeof v==='number'?Math.round(v*10000)/10000:v))));
for (const c of ['A','B']) for (const ind of ['1','(1 + 0.15) ^ [Yil]'])
P(`EVALUATE\n${PR}\nVAR K = ADDCOLUMNS(Proje, "Ind", [${c}] / ${ind}, "Kum", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [${c}] / ${ind}))
VAR Ilk = MINX(FILTER(K, [Kum] >= 0), [Yil])
RETURN ROW("${c} ${ind}", Ilk - 1 + DIVIDE(-MAXX(FILTER(K, [Yil] = Ilk - 1), [Kum]), MAXX(FILTER(K, [Yil] = Ilk), [Ind])))`);
P(`EVALUATE\n${PR}\nRETURN FILTER(ADDCOLUMNS(GENERATESERIES(0.10, 0.30, 0.001), "A", VAR r = [Value] RETURN SUMX(Proje, [A] / (1 + r) ^ [Yil]), "B", VAR r = [Value] RETURN SUMX(Proje, [B] / (1 + r) ^ [Yil]), "F", VAR r = [Value] RETURN SUMX(Proje, ([B] - [A]) / (1 + r) ^ [Yil])), ABS([A]) < 250 || ABS([B]) < 300 || ABS([F]) < 150)`);
P(`EVALUATE ROW("roe ort", DIVIDE(75000, (215000 + 290000) / 2), "ort", (215000 + 290000) / 2)`);
