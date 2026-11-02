require('./h.js');
const S = M.tables.Satislar.rows; console.log(S.length, Object.keys(S[0]));
console.log([...new Set(S.map(r=>r.Kanal))], [...new Set(S.map(r=>r.Durum))]);
console.log([...new Set(M.tables.Musteriler.rows.map(r=>r.Sehir))], [...new Set(M.tables.Musteriler.rows.map(r=>r.Bolge))], [...new Set(M.tables.Musteriler.rows.map(r=>r.Segment))]);
console.log(M.tables.Urunler.rows.slice(0,3));
const r = Q('EVALUATE ROW("a", 1)'); console.log(JSON.stringify(r).slice(0,300));
