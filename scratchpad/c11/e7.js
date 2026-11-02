const { M, ms, ev, q, rq } = require('./h.js');
console.log(rq(`EVALUATE DATATABLE("Tarih", DATETIME, "Nakit", DOUBLE, {{"2025-01-01", -250000}, {"2026-01-01", 120000}})`));
console.log(rq(`EVALUATE DATATABLE("Tarih", DATETIME, "Nakit", INTEGER, {{"2025-01-01", -250000}, {"2026-01-01", 120000}})`));
console.log(rq(`EVALUATE VAR A = DATATABLE("Tarih", DATETIME, "Nakit", INTEGER, {{"2025-01-01", -250000}, {"2026-01-01", 120000}, {"2027-01-01", 120000}, {"2028-01-01", 120000}}) RETURN ROW("n", XNPV(A, [Nakit], [Tarih], 0.3), "i", XIRR(A, [Nakit], [Tarih]))`));
console.log(rq(`EVALUATE VAR A = DATATABLE("Gun", DATETIME, "Tutar", DOUBLE, {{"2025-01-01", -250000}, {"2026-01-01", 120000}, {"2027-01-01", 120000}, {"2028-01-01", 120000}}) RETURN ROW("n", XNPV(A, [Tutar], [Gun], 0.3), "i", XIRR(A, [Tutar], [Gun]))`));
