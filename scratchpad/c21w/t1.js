require('./h.js');
const r = X.query({ rows: [{t:'Kategoriler',c:'Kategori'}], measures: ms, values: ['[Net Satış]'], slicers: [], totals: true }); console.log(JSON.stringify(r.rows[0]), JSON.stringify(r.total));
