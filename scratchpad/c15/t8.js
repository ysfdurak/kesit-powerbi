require('./h.js');
const P = (n,s) => { try { const r = X.runQuery(Object.assign({}, ms), s); console.log(n, r.cols.join('|')); r.rows.forEach(x=>console.log('  ', x.map(v=>typeof v==='number'?Math.round(v*10000)/10000:v).join(' | '))); } catch(e) { console.log(n,'ERR', e.message); } };
const BL = `VAR Bilanco = DATATABLE("Yil", INTEGER, "Hesap", STRING, "Tutar", CURRENCY, {
    {2022, "102", 60000}, {2022, "120", 25000}, {2022, "153", 70000}, {2022, "253", 200000},
    {2022, "300", 40000}, {2022, "320", 55000}, {2022, "400", 100000},
    {2022, "500", 100000}, {2022, "570", 40000}, {2022, "590", 20000},
    {2023, "102", 85000}, {2023, "120", 40000}, {2023, "153", 95000}, {2023, "253", 230000},
    {2023, "300", 45000}, {2023, "320", 80000}, {2023, "400", 110000},
    {2023, "500", 100000}, {2023, "570", 60000}, {2023, "590", 55000},
    {2024, "102", 120000}, {2024, "120", 65000}, {2024, "153", 140000}, {2024, "253", 260000},
    {2024, "300", 55000}, {2024, "320", 120000}, {2024, "400", 120000},
    {2024, "500", 100000}, {2024, "570", 115000}, {2024, "590", 75000}})`;
P('denklem', `EVALUATE\n${BL}\nRETURN ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Bilanco, "Yil", [Yil])),
    "Varlıklar", VAR Y = [Yil] RETURN SUMX(FILTER(Bilanco, [Yil] = Y && LEFT([Hesap], 1) IN {"1", "2"}), [Tutar]),
    "Yükümlülükler", VAR Y = [Yil] RETURN SUMX(FILTER(Bilanco, [Yil] = Y && LEFT([Hesap], 1) IN {"3", "4"}), [Tutar]),
    "Özkaynak", VAR Y = [Yil] RETURN SUMX(FILTER(Bilanco, [Yil] = Y && LEFT([Hesap], 1) = "5"), [Tutar]))`);
P('oranlar', `EVALUATE\n${BL}\nRETURN ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Bilanco, "Yil", [Yil])),
    "Cari oran", VAR Y = [Yil] VAR B = FILTER(Bilanco, [Yil] = Y)
        RETURN DIVIDE(SUMX(FILTER(B, LEFT([Hesap], 1) = "1"), [Tutar]), SUMX(FILTER(B, LEFT([Hesap], 1) = "3"), [Tutar])),
    "Asit-test oranı", VAR Y = [Yil] VAR B = FILTER(Bilanco, [Yil] = Y)
        RETURN DIVIDE(SUMX(FILTER(B, LEFT([Hesap], 1) = "1" && [Hesap] &lt;&gt; "153"), [Tutar]), SUMX(FILTER(B, LEFT([Hesap], 1) = "3"), [Tutar])))`.replace(/&lt;&gt;/g,'<>'));
P('nakit', `EVALUATE\n${BL}
VAR Fark = (0)
VAR D120 = SUMX(FILTER(Bilanco, [Hesap] = "120"), IF([Yil] = 2024, [Tutar], IF([Yil] = 2023, -[Tutar])))
RETURN ROW("d", D120)`);
P('nakit2', `EVALUATE\n${BL}
VAR Amortisman = 30000
VAR Bakiye = ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Bilanco, "Hesap", [Hesap])),
    "Degisim", VAR H = [Hesap] RETURN SUMX(FILTER(Bilanco, [Hesap] = H &amp;&amp; [Yil] = 2024), [Tutar]) - SUMX(FILTER(Bilanco, [Hesap] = H &amp;&amp; [Yil] = 2023), [Tutar]))
VAR D = SUMX(FILTER(Bakiye, [Hesap] = "120"), [Degisim])
RETURN Bakiye`.replace(/&amp;/g,'&'));
