const { M, ms, ev, q, rq } = require('./h.js');
console.log(rq(`EVALUATE DATATABLE("Tarih", DATETIME, "Nakit", DOUBLE, { {"2025-01-01", -250000}, {"2026-01-01", 120000} })`));
console.log(rq(`EVALUATE DATATABLE("Ad", STRING, "Nakit", DOUBLE, {{"a", -250000}, {"b", 120000}})`));
console.log(rq(`EVALUATE DATATABLE("Ad", STRING, "Nakit", INTEGER, { {"a", 250000}, {"b", 120000} })`));
console.log(rq(`EVALUATE DATATABLE("Dilim", STRING, "Min", INTEGER, "Max", INTEGER, { {"Küçük", 0, 2000}, {"Orta", 2000, 6000} })`));
