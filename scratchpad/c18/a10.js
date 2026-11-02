const {M, ev, q, rq} = require('./h.js');
const T = `DATATABLE("Firma", STRING, "Mesafe", STRING, "Gonderi", INTEGER, "Zamaninda", INTEGER,
    {{"A", "Yakın", 200, 180}, {"A", "Uzak", 600, 300}, {"B", "Yakın", 600, 510}, {"B", "Uzak", 200, 90}})`;
for (const s of [
`EVALUATE
VAR T = ${T}
RETURN SUMMARIZE(T, [Firma], "Gönderi", SUM([Gonderi]), "Genel Oran", DIVIDE(SUM([Zamaninda]), SUM([Gonderi])))`,
`EVALUATE
VAR T = ${T}
RETURN ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(T, "Firma", [Firma])), "Genel Oran", VAR F = [Firma] RETURN DIVIDE(SUMX(FILTER(T, [Firma] = F), [Zamaninda]), SUMX(FILTER(T, [Firma] = F), [Gonderi])))`,
`EVALUATE
VAR T = ${T}
RETURN ADDCOLUMNS(SUMMARIZE(T, [Firma]), "Genel Oran", VAR F = [Firma] RETURN DIVIDE(SUMX(FILTER(T, [Firma] = F), [Zamaninda]), SUMX(FILTER(T, [Firma] = F), [Gonderi])))`,
`EVALUATE
VAR T = ${T}
RETURN ROW("A", DIVIDE(SUMX(FILTER(T, [Firma] = "A"), [Zamaninda]), SUMX(FILTER(T, [Firma] = "A"), [Gonderi])), "B", DIVIDE(SUMX(FILTER(T, [Firma] = "B"), [Zamaninda]), SUMX(FILTER(T, [Firma] = "B"), [Gonderi])))`,
]) { try { const r = rq(s); console.log(JSON.stringify(r)); } catch(e) { console.log('ERR', e.message); } }
