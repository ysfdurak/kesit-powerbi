global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const X = PBI_DAX, ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const q = s => { try { const r = X.runQuery(ms, s); console.log(s.replace(/\n/g,' '), '=>', r.rows.length, JSON.stringify(r.rows.slice(0, 10))); } catch (x) { console.log(s, 'ERR', x.message); } };
q('EVALUATE ROW("a", FORMAT(DATE(2024,3,5), "yyyy-MM"), "b", FORMAT(DATE(2024,3,5), "yyyy-mm"), "c", FORMAT(DATE(2024,3,5), "mmmm"))');
const r='VAR G = [Hedef Gerçekleşme %] RETURN IF(ISBLANK(G), BLANK(), IF(G >= 0.97, "#1B7F3B", IF(G >= 0.9, "#C77700", "#B3261E")))';
q('EVALUATE SUMMARIZECOLUMNS(Kategoriler[Kategori], "r", '+r+')');
q('EVALUATE SUMMARIZECOLUMNS(Tarih[Yil], "r", '+r+', "g", [Hedef Gerçekleşme %])');
q('EVALUATE SUMMARIZECOLUMNS(Kategoriler[Kategori], "m", [Kâr Marjı %])');
