/* M alt küme yorumlayıcısı doğrulayıcısı (app/mengine.js).
   1. Resmî M belgesi (learn.microsoft.com/powerquery-m) örnekleri: kod ve belgedeki sonuç.
   2. Desteklenmeyen işlev ve seçeneklerde net hata; sessiz yanlış sonuç yok.
   3. Power Query Lab: her komutun ürettiği M kodu yorumlayıcıda çalıştırılır, Lab sonucuyla karşılaştırılır.
   4. Derslerdeki <pre class="m"> kodları (data-notry değilse) ve mcode alıştırmaları çalışır, ipuçsuz boş kod geçmez.
   Çalıştırma: node tests/mval.js */
const path = require('path'), fs = require('fs');
global.window = global; global.document = undefined;
const APP = path.join(__dirname, '..', 'app') + '/';
require(APP + 'mengine.js');
const M = window.PBI_M;
let bad = 0, n = 0;
function say(ok, name, extra) { n++; if (!ok) { bad++; console.log('HATA', name, extra || ''); } }
/* [kaynak, kod, beklenen M ifadesi] */
const OFFICIAL = [
  ['expressions-values-and-let-expression', 'let Source = Text.Proper("hello world") in Source', '"Hello World"'],
  ['expressions-values-and-let-expression', 'let MyFunction = (parameter1, parameter2) => (parameter1 + parameter2) / 2, Source = MyFunction(2, 4) in Source', '3'],
  ['expressions-values-and-let-expression', '{123, true, "A"}{0}', '123'],
  ['expressions-values-and-let-expression', '{ {1, 2, 3}, {4, 5, 6} }{0}{1}', '2'],
  ['expressions-values-and-let-expression', 'let Source = [ OrderID = 1, CustomerID = 1, Item = "Fishing rod", Price = 100.00 ], GetItem = Source[Item] //equals "Fishing rod"\nin GetItem', '"Fishing rod"'],
  ['expressions-values-and-let-expression', 'let Source = #table({"OrderID", "CustomerID", "Item", "Price"}, {{1, 1, "Fishing rod", 100.00}, {2, 1, "1 lb. worms", 5.00}}) in Source', 'Table.FromRecords({[OrderID=1,CustomerID=1,Item="Fishing rod",Price=100],[OrderID=2,CustomerID=1,Item="1 lb. worms",Price=5]})'],
  ['expressions-values-and-let-expression', 'let Source = #table(type table [OrderID = number, CustomerID = number, Item = text, Price = number], {{1, 1, "Fishing rod", 100.00}, {2, 1, "1 lb. worms", 5.00}}) in Source{1}', '[OrderID=2,CustomerID=1,Item="1 lb. worms",Price=5]'],
  ['expressions-values-and-let-expression', 'if 2 > 1 then 2 + 2 else 1 + 1', '4'],
  ['understanding-power-query-m-functions', 'let AddOne = (x as number) as number => x + 1, CalcAddOne = AddOne(5) in CalcAddOne', '6'],
  ['understanding-power-query-m-functions', 'let Add = (x, y) => x + y, AddResults = [ OnePlusOne = Add(1, 1), OnePlusTwo = Add(1, 2) ] in AddResults', '[OnePlusOne=2,OnePlusTwo=3]'],
  ['understanding-power-query-m-functions', 'let FirstGreaterThan5 = (list) => let GreaterThan5 = List.Select(list, (n) => n> 5), First = List.First(GreaterThan5) in First, Results = [ Found = FirstGreaterThan5({3,7,9}), NotFound = FirstGreaterThan5({1,3,4}) ] in Results', '[Found=7,NotFound=null]'],
  ['understanding-power-query-m-functions', 'let fact = (num) => if num = 0 then 1 else num * @fact (num-1) in fact(5)', '120'],
  ['understanding-power-query-m-functions', 'Table.SelectRows(Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"],[CustomerID = 2, Name = "Jim", Phone = "987-6543"],[CustomerID = 3, Name = "Paul", Phone = "543-7890"],[CustomerID = 4, Name = "Ringo", Phone = "232-1550"]}), each [CustomerID] = 2)[Name]', '{"Jim"}'],
  ['table-pivot ex1', 'Table.Pivot(Table.FromRecords({[key = "x", attribute = "a", value = 1],[key = "x", attribute = "c", value = 3],[key = "y", attribute = "a", value = 2],[key = "y", attribute = "b", value = 4]}),{"a", "b", "c"},"attribute","value")', 'Table.FromRecords({[key = "x", a = 1, b = null, c = 3],[key = "y", a = 2, b = 4, c = null]})'],
  ['table-pivot ex2', 'Table.Pivot(Table.FromRecords({[key = "x", attribute = "a", value = 1],[key = "x", attribute = "c", value = 3],[key = "x", attribute = "c", value = 5],[key = "y", attribute = "a", value = 2],[key = "y", attribute = "b", value = 4]}),{"a", "b", "c"},"attribute","value",List.Max)', 'Table.FromRecords({[key = "x", a = 1, b = null, c = 5],[key = "y", a = 2, b = 4, c = null]})'],
  ['list-accumulate ex1', 'let Source = List.Accumulate({1, 2, 3, 4, 5}, 0, (runningSum, nextNumber) => runningSum + nextNumber) in Source', '15'],
  ['list-accumulate ex2', 'let Source = List.Accumulate({"The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog."}, null, (fullTextSoFar, nextPart) => Text.Combine({fullTextSoFar, nextPart}, " ")) in Source', '"The quick brown fox jumps over the lazy dog."'],
  ['list-accumulate ex3', 'let #"Process Duration" = {#duration(0,1,0,0),#duration(0,2,0,0),#duration(0,3,0,0)}, #"Start Time" = #datetime(2025, 9, 8, 19, 0, 0), #"Process Timeline" = List.Accumulate(#"Process Duration",{#"Start Time"},(accumulatedTimes, nextDuration) => accumulatedTimes & {List.Last(accumulatedTimes) + nextDuration}) in #"Process Timeline"', '{#datetime(2025, 9, 8, 19, 0, 0),#datetime(2025, 9, 8, 20, 0, 0),#datetime(2025, 9, 8, 22, 0, 0),#datetime(2025, 9, 9, 1, 0, 0)}'],
  ['list-generate ex1', 'List.Generate(() => 10, each _ > 0, each _ - 1)', '{10, 9, 8, 7, 6, 5, 4, 3, 2, 1}'],
  ['list-generate ex2', 'List.Generate(() => [x = 1, y = {}], each [x] < 10, each [x = List.Count([y]), y = [y] & {x}], each [x])', '{1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9}'],
  ['table-group', 'Table.Group(Table.FromRecords({[CustomerID = 1, price = 20],[CustomerID = 2, price = 10],[CustomerID = 2, price = 20],[CustomerID = 1, price = 10],[CustomerID = 3, price = 20],[CustomerID = 3, price = 5]}),"CustomerID",{"total", each List.Sum([price])})', 'Table.FromRecords({[CustomerID = 1, total = 30],[CustomerID = 2, total = 30],[CustomerID = 3, total = 25]},{"CustomerID", "total"})'],
  ['text-split ex1', 'Text.Split("Name|Address|PhoneNumber", "|")', '{"Name","Address","PhoneNumber"}'],
  ['text-split ex2', 'Text.Split("Name, the Customer, the Purchase Date", ", the ")', '{"Name","Customer","Purchase Date"}'],
  ['table-unpivotothercolumns', 'Table.UnpivotOtherColumns(Table.FromRecords({[key = "key1", attribute1 = 1, attribute2 = 2, attribute3 = 3],[key = "key2", attribute1 = 4, attribute2 = 5, attribute3 = 6]}),{"key"},"column1","column2")', 'Table.FromRecords({[key = "key1", column1 = "attribute1", column2 = 1],[key = "key1", column1 = "attribute2", column2 = 2],[key = "key1", column1 = "attribute3", column2 = 3],[key = "key2", column1 = "attribute1", column2 = 4],[key = "key2", column1 = "attribute2", column2 = 5],[key = "key2", column1 = "attribute3", column2 = 6]})'],
  ['table-transpose', 'Table.Transpose(Table.FromRecords({[Name = "Full Name", Value = "Fred"],[Name = "Age", Value = 42],[Name = "Country", Value = "UK"]}))', 'Table.FromRecords({[Column1 = "Full Name", Column2 = "Age", Column3 = "Country"],[Column1 = "Fred", Column2 = 42, Column3 = "UK"]})'],
  ['record-field', 'Record.Field([CustomerID = 1, Name = "Bob", Phone = "123-4567"], "CustomerID")', '1'],
  ['list-buffer', 'List.Buffer({1..10})', '{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}'],
  ['table-addcolumn', 'Table.AddColumn(Table.FromRecords({[OrderID = 1, CustomerID = 1, Item = "Fishing rod", Price = 100.0, Shipping = 10.00],[OrderID = 2, CustomerID = 1, Item = "1 lb. worms", Price = 5.0, Shipping = 15.00],[OrderID = 3, CustomerID = 2, Item = "Fishing net", Price = 25.0, Shipping = 10.00]}),"TotalPrice",each [Price] + [Shipping],type number)', 'Table.FromRecords({[OrderID = 1, CustomerID = 1, Item = "Fishing rod", Price = 100, Shipping = 10, TotalPrice = 110],[OrderID = 2, CustomerID = 1, Item = "1 lb. worms", Price = 5, Shipping = 15, TotalPrice = 20],[OrderID = 3, CustomerID = 2, Item = "Fishing net", Price = 25, Shipping = 10, TotalPrice = 35]})'],
  ['table-addindexcolumn ex1', 'Table.AddIndexColumn(Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"],[CustomerID = 2, Name = "Jim", Phone = "987-6543"],[CustomerID = 3, Name = "Paul", Phone = "543-7890"],[CustomerID = 4, Name = "Ringo", Phone = "232-1550"]}),"Index")', 'Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567", Index = 0],[CustomerID = 2, Name = "Jim", Phone = "987-6543", Index = 1],[CustomerID = 3, Name = "Paul", Phone = "543-7890", Index = 2],[CustomerID = 4, Name = "Ringo", Phone = "232-1550", Index = 3]})'],
  ['table-addindexcolumn ex2', 'Table.AddIndexColumn(Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567"],[CustomerID = 2, Name = "Jim", Phone = "987-6543"],[CustomerID = 3, Name = "Paul", Phone = "543-7890"],[CustomerID = 4, Name = "Ringo", Phone = "232-1550"]}),"Index",10,5)', 'Table.FromRecords({[CustomerID = 1, Name = "Bob", Phone = "123-4567", Index = 10],[CustomerID = 2, Name = "Jim", Phone = "987-6543", Index = 15],[CustomerID = 3, Name = "Paul", Phone = "543-7890", Index = 20],[CustomerID = 4, Name = "Ringo", Phone = "232-1550", Index = 25]})'],
  ['m-spec-error-handling try ok', 'let x = try "A" in if x[HasError] then x[Error] else x[Value]', '"A"'],
  ['m-spec-error-handling try err', 'let x = try error "A" in if x[HasError] then x[Error] else x[Value]', '[Reason = "Expression.Error", Message = "A", Detail = null]'],
  ['m-spec-error-handling catch e', 'let x = try error "A" catch (e) => e in x', '[Reason = "Expression.Error", Message = "A", Detail = null]'],
  ['m-spec-error-handling otherwise', 'try error "A" otherwise 1', '1'],
  ['m-spec-error-handling catch ()', 'try error "A" catch () => 1', '1'],
  ['m-spec-error-handling Error.Record', 'try error Error.Record("FileNotFound", "File my.txt not found", "my.txt") catch (e) => e', '[Reason = "FileNotFound", Message = "File my.txt not found", Detail = "my.txt"]'],
  ['m-spec-error-handling Message.Format', '(try error [Message.Format = "Unexpected value \'#{0}\' in field #{1}", Message.Parameters = {"???", "Customer"}] catch (e) => e)[Message]', '"Unexpected value \'???\' in field Customer"'],
  ['custom-function flight', 'let f = (code) => let SplitValues = Text.Split(code, "-") in [Origin = SplitValues{0}, Destination = SplitValues{2}, Airline = Text.Start(SplitValues{1}, 2), FlightID = Text.End(SplitValues{1}, Text.Length(SplitValues{1}) - 2)] in f("PTY-CM1090-LAX")', '[Origin = "PTY", Destination = "LAX", Airline = "CM", FlightID = "1090"]'],
  ['table-join (aynı adlı anahtar tek sütun)', 'Table.Join(Table.FromRecords({[CustomerID = 1, Name = "Bob"]}), "CustomerID", Table.FromRecords({[OrderID = 1, CustomerID = 1, Item = "Fishing rod"]}), "CustomerID")', 'Table.FromRecords({[CustomerID = 1, Name = "Bob", OrderID = 1, Item = "Fishing rod"]})'],
  ['json-document', 'Json.Document("{""a"": 1, ""b"": [true, null]}")', '[a = 1, b = {true, null}]'],
  /* M dil belirtimi (m-spec) davranışları */
  ['m-spec operators null', '1 + null', 'null'],
  ['m-spec operators null text', '"a" & null', 'null'],
  ['m-spec logical', 'null and false', 'false'],
  ['m-spec logical 2', 'null or true', 'true'],
  ['m-spec logical 3', 'null and true', 'null'],
  ['m-spec compare null', '1 > null', 'null'],
  ['m-spec eq', '1 = "1"', 'false'],
  ['m-spec is', '1 is number', 'true'],
  ['m-spec is 2', 'null is nullable text', 'true'],
  ['m-spec coalesce', 'null ?? 5', '5'],
  ['m-spec opt field', '[a = 1][b]?', 'null'],
  ['m-spec opt item', '{1, 2}{5}?', 'null'],
  ['m-spec lazy let', 'let a = error "x", b = 1 in b', '1'],
  ['m-spec self ref record', '[x = 1, y = x + 1][y]', '2'],
  ['m-spec lookup key', 'Table.FromRecords({[k = 1, v = "a"], [k = 2, v = "b"]}){[k = 2]}[v]', '"b"'],
  ['m-spec projection', '[a = 1, b = 2, c = 3][[a], [c]]', '[a = 1, c = 3]'],
  ['m-spec lists concat', '{1} & {2, 3}', '{1, 2, 3}'],
  ['m-spec record merge', '[a = 1] & [b = 2]', '[a = 1, b = 2]'],
  ['m-spec duration', '#date(2024, 3, 1) - #date(2024, 2, 1)', '#duration(29, 0, 0, 0)'],
  ['number-round', 'Number.Round(1.5)', '2'], ['number-round even', 'Number.Round(2.5)', '2'], ['number-round digits', 'Number.Round(1.2345, 3, RoundingMode.Up)', '1.235'], ['number-round down', 'Number.Round(1.2345, 3, RoundingMode.Down)', '1.234'],
  ['date-addmonths', 'Date.AddMonths(#date(2024, 1, 31), 1)', '#date(2024, 2, 29)'],
  ['date-parts', 'Date.Year(#date(2011, 12, 31))', '2011'], ['date-eom', 'Date.EndOfMonth(#date(2011, 5, 14))', '#date(2011, 5, 31)'], ['date-dow', 'Date.DayOfWeek(#date(2011, 2, 21), Day.Sunday)', '1'],
  ['text-middle', 'Text.Middle("Hello World", 6, 5)', '"World"'], ['text-before', 'Text.BeforeDelimiter("111-222-333", "-")', '"111"'], ['text-after', 'Text.AfterDelimiter("111-222-333", "-", 1)', '"333"'],
  ['table-torecords', 'Table.ToRecords(Table.FromRows({{1, "Bob"}}, {"a", "b"}))', '{[a = 1, b = "Bob"]}'],
  ['record-fieldnames', 'Record.FieldNames([OrderID = 1, Item = "Fishing rod"])', '{"OrderID", "Item"}'],
];
for (const [src, code, exp] of OFFICIAL) {
  const a = M.run(code), b = M.run(exp);
  if (!a.ok || !b.ok) { say(false, src, !a.ok ? M.errorText(a) : 'beklenen ifade: ' + M.errorText(b)); continue; }
  const c = M.compareResult(a.value, b.value, { ordered: true });
  say(c.ok, src, c.msg + ' | sonuç: ' + M.fmt(a.value));
}
const nOfficial = OFFICIAL.length;
/* Hata davranışları: [kod, tür, metinde geçecek] */
const ERRS = [
  ['try error "A" otherwise error "B"', 'runtime', 'B'],
  ['let f = (x) => [ a = error "bad", b = x ], g = try f(42) otherwise 123 in g[a]', 'runtime', 'bad'],
  ['(x, y) => ...', null, null],
  ['let f = (x, y) => if x > y then x - y else ... in f(1, 2)', 'runtime', 'Not Implemented'],
  ['"a" + 1', 'runtime', 'operator +'],
  ['"a" & 1', 'runtime', 'operator &'],
  ['if null then 1 else 2', 'runtime', 'Logical'],
  ['Table.FooBar(1)', 'unsupported', 'Table.FooBar'],
  ['List.Foldl({1}, 0, (a, b) => a)', 'unsupported', 'List.Foldl'],
  ['Value.NativeQuery(1, "select 1")', 'connector', 'Value.NativeQuery'],
  ['Sql.Database("s", "d")', 'connector', 'Sql.Database'],
  ['Web.Contents("https://x")', 'connector', 'Web.Contents'],
  ['try Table.FooBar(1) otherwise 0', 'unsupported', 'Table.FooBar'],
  ['Table.Group(#table({"a"}, {{1}}), "a", {"n", each 1}, GroupKind.Global, Comparer.Ordinal)', 'unsupported', 'comparer'],
  ['Text.Contains("a", "A", Comparer.FromCulture("tr"))', 'unsupported', 'Comparer.FromCulture'],
  ['table.addcolumn', 'runtime', 'Table.AddColumn'],
  ['bilinmeyenAd', 'runtime', 'recognized'],
  ['let a = 1, b = 2, in a', 'syntax', 'in'],
  ['if 1 > 0 then 2', 'syntax', 'else'],
  ['{1, 2', 'syntax', '}'],
  ['List.Generate(() => 0, each true, each _ + 1)', 'limit', ''],
  ['let f = (n) => @f(n) in f(1)', 'limit', ''],
  ['let a = a in a', 'runtime', 'recognized'],
  ['let a = b, b = a in a', 'runtime', 'cyclic'],
  ['[a = 1][b]', 'runtime', "field 'b'"],
  ['Table.FromRecords({[a = 1]})[z]', 'runtime', "column 'z'"],
  ['{1, 2}{5}', 'runtime', 'enough elements'],
  ['(x as number) => x', null, null],
  ['((x as number) => x)("a")', 'runtime', 'Number'],
  ['"5" as number', 'runtime', 'Number'],
  ['Date.FromText("05.01.2024")', 'runtime', 'Kültür'],
  ['Number.FromText("abc")', 'runtime', 'Number'],
];
for (const [code, kind, txt] of ERRS) {
  const r = M.run(code);
  if (kind === null) { say(r.ok, code, M.errorText(r)); continue; }
  say(!r.ok && r.kind === kind && M.errorText(r).includes(txt), code, r.ok ? 'hata beklendi, sonuç: ' + M.fmt(r.value) : r.kind + ' ' + M.errorText(r));
}
/* Hücre düzeyi hata: satırı öldürmez */
{ const r = M.run('Table.AddColumn(#table({"a"}, {{1}, {"x"}}), "b", each [a] + 1)'); say(r.ok && r.value.rows[0][1] === 2 && M.isErrCell(r.value.rows[1][1]), 'hücre hatası'); }
{ const r = M.run('Table.RemoveRowsWithErrors(Table.TransformColumnTypes(#table({"a"}, {{"1"}, {"x"}}), {{"a", type number}}))'); say(r.ok && r.value.rows.length === 1, 'tür dönüşümü hatalı satır'); }
{ const r = M.run('Table.TransformColumnTypes(#table({"a"}, {{"05.01.2024"}}), {{"a", type date}}, "tr-TR")'); say(r.ok && r.value.rows[0][0].getUTCMonth() === 0, 'tr-TR tarih'); }
{ const r = M.run('Table.Pivot(Table.FromRecords({[k = 1, a = "x", v = 1], [k = 1, a = "x", v = 2]}), {"x"}, "a", "v")'); say(r.ok && M.isErrCell(r.value.rows[0][1]), 'pivot çok değer hatası'); }
console.log('Resmî örnek ve davranış: ' + nOfficial + ', hata davranışı: ' + ERRS.length);
if (fs.existsSync(APP + 'mval_ext.js')) require(APP + 'mval_ext.js');
module.exports = { say, M };
if (require.main === module) {
  try { require('./mval2.js')(say, M, APP); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
  console.log('Denetim: ' + n + ', SORUN ' + bad);
  process.exit(bad ? 1 : 0);
}
