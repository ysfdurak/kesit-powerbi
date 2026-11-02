const { M, ms, ev, q, rq, X } = require('./h.js');
const r = X.runQuery(Object.assign({}, ms), `EVALUATE DATATABLE("Ad", STRING, "Nakit", INTEGER, {{"a", 250000}, {"b", 120000}})`); console.log(JSON.stringify(r).slice(0,400));
console.log(rq(`EVALUATE ROW("s", SUMX(DATATABLE("Ad", STRING, "Nakit", INTEGER, {{"a", 250000}, {"b", 120000}}), [Nakit]))`));
console.log(rq(`EVALUATE VAR A = {(DATE(2025,1,1), -250000), (DATE(2026,1,1), 120000), (DATE(2027,1,1), 120000), (DATE(2028,1,1), 120000)} RETURN ROW("n", XNPV(A, [Value2], [Value1], 0.3), "i", XIRR(A, [Value2], [Value1]))`));
console.log(rq(`EVALUATE VAR A = ADDCOLUMNS(DATATABLE("Tarih", STRING, "Nakit", INTEGER, {{"2025-01-01", -250000}, {"2026-01-01", 120000}, {"2027-01-01", 120000}, {"2028-01-01", 120000}}), "Gun", DATEVALUE([Tarih])) RETURN ROW("n", XNPV(A, [Nakit], [Gun], 0.3), "i", XIRR(A, [Nakit], [Gun]))`));
