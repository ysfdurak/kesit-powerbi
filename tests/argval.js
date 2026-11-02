/* DAX motoru: bağımsız değişken sayısı ve tür hataları. Gerçek DAX'ın hata verdiği ifadeler burada da hata vermeli;
   hiçbir fonksiyon, hiçbir girdiyle ham JavaScript hatası üretmemeli. */
global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data', 'data2', 'dax', 'measures']) require(P + f + '.js');
const X = window.PBI_DAX; const ms = {}; window.PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
let bad = 0; const fail = m => { bad++; console.log('SORUN ' + m); };
const MUST_ERR = ['IF(AND(TRUE(),TRUE(),FALSE()),"e","h")', 'IF(OR(FALSE(),FALSE(),TRUE()),"e","h")', 'SUM(Satislar[Tutar],Satislar[Maliyet])', 'MAX(1,2,3)', 'MIN(1,2,3)', 'CONCATENATE("a","b","c")', 'COUNTROWS(Satislar,Urunler)', 'DIVIDE(1,2,3,4)', 'IF(1=1,2,3,4)', 'SUM(Urunler[Urun])', 'AVERAGE(Urunler[Urun])', 'ISBLANK()', 'ISBLANK(1,2)', 'BLANK(1)', 'TRUE(1)', 'SUMX(Satislar)', 'FILTER(Satislar)', 'YEAR("olmaz")', 'YEAR("2024-13-01")', 'IF(FALSE(),AND(TRUE(),TRUE(),TRUE()),1)'];
for (const e of MUST_ERR) { try { X.evalMeasure(ms, e, []); fail('hata vermedi: ' + e); } catch (er) { if (!er.dax) fail('ham hata: ' + e + ' -> ' + er.message); } }
const MUST_OK = [['YEAR("2024-03-01")', 2024], ['MONTH("2024-03-01")', 3], ['IF(TRUE() && TRUE() && FALSE(),1,2)', 2], ['MAX(1,2)', 2], ['MIN(1,2)', 1], ['DIVIDE(1,0,9)', 9], ['IF(1=2,1)', null], ['"a"&"b"&"c"', 'abc']];
for (const [e, want] of MUST_OK) { try { const v = X.evalMeasure(ms, e, []); if (v !== want) fail(e + ' = ' + v + ', beklenen ' + want); } catch (er) { fail(e + ' hata: ' + er.message); } }
/* her fonksiyon: 0..4 bağımsız değişkenli rastgele girdiler ham hata vermemeli */
const ARGS = ['1', '"x"', 'Urunler', 'Urunler[Urun]', 'Tarih[Tarih]', '[Net Satış]', 'BLANK()', 'TRUE()'];
let tried = 0;
for (const fn of Object.keys(X.FN)) for (let n = 0; n <= 4; n++) for (let v = 0; v < (n ? ARGS.length : 1); v++) {
  const e = fn + '(' + Array.from({ length: n }, (_, i) => ARGS[(v + i * 3) % ARGS.length]).join(',') + ')'; tried++;
  try { X.evalMeasure(ms, e, []); } catch (er) { if (!er.dax && !(er instanceof RangeError)) fail('ham hata: ' + e + ' -> ' + er.message); }
  try { X.runQuery(ms, 'EVALUATE ROW("x", ' + e + ')'); } catch (er) { if (!er.dax && !(er instanceof RangeError)) fail('ham hata (sorgu): ' + e + ' -> ' + er.message); }
}
console.log('denenen ifade ' + tried + ' SORUN ' + bad);
