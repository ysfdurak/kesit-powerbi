require('./h.js');
const fs=require('fs'); const src=fs.readFileSync('e9.js','utf8'); 
const K = src.match(/const K = `([\s\S]*?)`;/)[1]; const plan = src.match(/const plan = `([\s\S]*?)`;/)[1];
const D = `DEFINE VAR Krediler = ${K}\nVAR Plan = ${plan}\nVAR Rapor = DATE(2024, 12, 31)\n`;
T(D+`EVALUATE ADDCOLUMNS(Krediler,
 "Odenen", VAR k = [KrediNo] RETURN COUNTROWS(FILTER(Plan, [KrediNo] = k && [Tarih] <= Rapor)),
 "Kalan", VAR k = [KrediNo] VAR t = [Tutar] VAR p = FILTER(Plan, [KrediNo] = k && [Tarih] <= Rapor) RETURN IF(ISEMPTY(p), t, MINX(p, [Kalan])),
 "Faiz24", VAR k = [KrediNo] RETURN SUMX(FILTER(Plan, [KrediNo] = k && YEAR([Tarih]) = 2024), [Faiz]),
 "Taksit24", VAR k = [KrediNo] RETURN SUMX(FILTER(Plan, [KrediNo] = k && YEAR([Tarih]) = 2024), [Taksit]),
 "Tahsil25", VAR k = [KrediNo] RETURN SUMX(FILTER(Plan, [KrediNo] = k && YEAR([Tarih]) = 2025), [Taksit]),
 "ToplamFaiz", VAR k = [KrediNo] RETURN SUMX(FILTER(Plan, [KrediNo] = k), [Faiz]))`);
