global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
console.log(X.evalMeasure(ms,'SUM(Musteriler[DogumYili])',[]), X.evalMeasure(ms,'COUNTROWS(FILTER(Musteriler, ISBLANK(Musteriler[Sehir])))',[]));
