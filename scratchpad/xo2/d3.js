global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
console.log(X.evalMeasure(ms,'MAXX(VALUES(Tarih[YilAy]), [Net Satış])',[]), X.evalMeasure(ms,'MINX(FILTER(VALUES(Tarih[YilAy]), [Net Satış] > 0), [Net Satış])',[]));
console.log(X.evalMeasure(ms,'COUNTROWS(FILTER(VALUES(Tarih[YilAy]), [Net Satış] > 87419.13 || ([Net Satış] > 0 && [Net Satış] < 40347.5 - 2*23535.8)))',[]));
console.log(JSON.stringify(X.runQuery(ms,'EVALUATE FILTER(SUMMARIZECOLUMNS(Tarih[YilAy], "N", [Net Satış]), [N] > 87419)').rows));
