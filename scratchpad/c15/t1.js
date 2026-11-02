require('./h.js');
console.log(ev('[Net Satış]'), ev('[Brüt Kâr]'), ev('[Kâr Marjı %]'));
console.log(q('[Net Satış]',{t:'Kategoriler',c:'Kategori'}));
console.log(q('[Net Satış]',{t:'Tarih',c:'Yil'}));
console.log(JSON.stringify(rq('EVALUATE\nDATATABLE("Hesap", STRING, "Tutar", CURRENCY, {{"Kasa", 100}, {"Stok", 250.5}})')));
console.log(JSON.stringify(rq('EVALUATE\nVAR T = DATATABLE("Yil", INTEGER, "Nakit", DOUBLE, {{0, -1000}, {1, 300}, {2, 400}, {3, 500}})\nRETURN ADDCOLUMNS(T, "Kum", SUMX(FILTER(T, [Yil] <= EARLIER([Yil])), [Nakit]))')));
