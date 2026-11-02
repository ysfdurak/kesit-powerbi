global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const rq = s => { try { const r = X.runQuery(Object.assign({}, ms), s); console.log('->', r.rows.length, JSON.stringify(r.rows.slice(0,8))); } catch(e){console.log('ERR',e.message)} };
rq('EVALUATE\nFILTER(Urunler, VAR K = Urunler[Kategori] RETURN Urunler[Fiyat] = MAXX(FILTER(ALL(Urunler), Urunler[Kategori] = K), Urunler[Fiyat]))');
rq('EVALUATE\nVAR Siralı = ADDCOLUMNS(Urunler, "Sira", RANKX(FILTER(ALL(Urunler), Urunler[Kategori] = EARLIER(Urunler[Kategori])), Urunler[Fiyat]))\nRETURN SELECTCOLUMNS(FILTER(Siralı, [Sira] = 1), "Kategori", Urunler[Kategori], "Urun", Urunler[Urun], "Fiyat", Urunler[Fiyat])');
rq('EVALUATE\nFILTER(Urunler, Urunler[Fiyat] = CALCULATE(MAX(Urunler[Fiyat]), ALL(Urunler), VALUES(Urunler[Kategori])))');
rq('EVALUATE\nSELECTCOLUMNS(EXCEPT(VALUES(Urunler[UrunNo]), VALUES(Satislar[UrunNo])), "UrunNo", [UrunNo])');
