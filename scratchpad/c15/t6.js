require('./h.js');
const P = s => { try { const r = rq(s); console.log(JSON.stringify(r.map(x=>x.map(v=>typeof v==='number'?Math.round(v*10000)/10000:v)))); } catch(e) { console.log('ERR', e.message); } };
const PR = `VAR Proje = DATATABLE("Yil", INTEGER, "A", DOUBLE, "B", DOUBLE, {{0, -250000, -250000}, {1, 90000, 30000}, {2, 100000, 50000}, {3, 90000, 90000}, {4, 70000, 150000}, {5, 50000, 190000}})`;
P(`EVALUATE\n${PR}\nRETURN ADDCOLUMNS(GENERATESERIES(0, 0.40, 0.05), "NBD A", VAR r = [Value] RETURN SUMX(Proje, [A] / (1 + r) ^ [Yil]), "NBD B", VAR r = [Value] RETURN SUMX(Proje, [B] / (1 + r) ^ [Yil]))`);
P(`EVALUATE\n${PR}\nRETURN ADDCOLUMNS(Proje, "Kum A", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [A]), "Ind A", [A] / 1.15 ^ [Yil], "IndKum A", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [A] / 1.15 ^ [Yil]), "Kum B", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [B]), "IndKum B", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [B] / 1.15 ^ [Yil]))`);
P(`EVALUATE\n${PR}\nRETURN ROW("NBD A", SUMX(Proje, [A] / 1.15 ^ [Yil]), "NBD B", SUMX(Proje, [B] / 1.15 ^ [Yil]), "PI A", DIVIDE(SUMX(FILTER(Proje, [Yil] > 0), [A] / 1.15 ^ [Yil]), 250000), "PI B", DIVIDE(SUMX(FILTER(Proje, [Yil] > 0), [B] / 1.15 ^ [Yil]), 250000))`);
for (const c of ['A','B']) for (const ind of ['1','1.15 ^ [Yil]'])
P(`EVALUATE\n${PR}\nVAR K = ADDCOLUMNS(Proje, "Ind", [${c}] / ${ind}, "Kum", VAR Y = [Yil] RETURN SUMX(FILTER(Proje, [Yil] <= Y), [${c}] / ${ind}))
VAR Ilk = MINX(FILTER(K, [Kum] >= 0), [Yil])
VAR OncekiKum = MAXX(FILTER(K, [Yil] = Ilk - 1), [Kum])
VAR O_Yil = MAXX(FILTER(K, [Yil] = Ilk), [Ind])
RETURN ROW("${c} ${ind}", Ilk - 1 + DIVIDE(-OncekiKum, O_Yil))`);
P(`EVALUATE\n${PR}\nRETURN FILTER(ADDCOLUMNS(GENERATESERIES(0.05, 0.40, 0.001), "A", VAR r = [Value] RETURN SUMX(Proje, [A] / (1 + r) ^ [Yil]), "B", VAR r = [Value] RETURN SUMX(Proje, [B] / (1 + r) ^ [Yil]), "F", VAR r = [Value] RETURN SUMX(Proje, ([B] - [A]) / (1 + r) ^ [Yil])), ABS([A]) < 400 || ABS([B]) < 400 || ABS([F]) < 300)`);
P(`EVALUATE\n${PR}\nRETURN ADDCOLUMNS(CROSSJOIN(SELECTCOLUMNS(GENERATESERIES(0.10, 0.20, 0.05), "Oran", [Value]), SELECTCOLUMNS(GENERATESERIES(-0.2, 0.2, 0.1), "Degisim", [Value])), "NBD", VAR r = [Oran] VAR d = [Degisim] RETURN SUMX(Proje, IF([Yil] = 0, [A], [A] * (1 + d)) / (1 + r) ^ [Yil]))`);
