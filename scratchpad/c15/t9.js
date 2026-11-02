require('./h.js');
const P = (n,s) => { try { const r = X.runQuery(Object.assign({}, ms), s); console.log(n, r.cols.join('|')); r.rows.forEach(x=>console.log('  ', x.map(v=>typeof v==='number'?Math.round(v*10000)/10000:v).join(' | '))); } catch(e) { console.log(n,'ERR', e.message); } };
P('valexpr', `EVALUATE
SUMMARIZECOLUMNS(Tarih[Yil],
    "expr gibi", DIVIDE([Net Satış] - CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih])), CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))),
    "val gibi", VAR S = [Net Satış] RETURN DIVIDE(S - CALCULATE(S, SAMEPERIODLASTYEAR(Tarih[Tarih])), CALCULATE(S, SAMEPERIODLASTYEAR(Tarih[Tarih]))))`);
P('wide', `EVALUATE
VAR Y = 2023
VAR B = FILTER(DATATABLE("Yil", INTEGER, "Donen", CURRENCY, {{2022, 1}, {2023, 2}}), [Yil] = Y)
RETURN ROW("x", SUMX(B, [Donen]))`);
const W = `DATATABLE("Yil", INTEGER, "Donen", CURRENCY, "Stok", CURRENCY, "KVY", CURRENCY, "Varlik", CURRENCY, "Ozkaynak", CURRENCY, "NetKar", CURRENCY, {{2022, 155000, 70000, 95000, 355000, 160000, 20000}, {2023, 220000, 95000, 125000, 450000, 215000, 55000}, {2024, 325000, 140000, 175000, 585000, 290000, 75000}})`;
const e = `VAR Y = MAX(Tarih[Yil])\nVAR B = FILTER(${W}, [Yil] = Y)\nRETURN DIVIDE(SUMX(B, [NetKar]), SUMX(B, [Ozkaynak]))`;
console.log(ev(e), q(e,{t:'Tarih',c:'Yil'}), q(e,{t:'Kategoriler',c:'Kategori'}).slice(0,2));
P('cf', `EVALUATE
VAR B = DATATABLE("Yil", INTEGER, "Hesap", STRING, "Tutar", CURRENCY, {{2023, "102", 85000}, {2024, "102", 120000}})
VAR Akis = {("İşletme", "Dönem net kârı", 75000), ("Yatırım", "x", -60000)}
RETURN UNION(Akis, ROW("Bölüm", "Toplam", "Kalem", "Net", "Tutar", SUMX(Akis, [Value3])))`);
