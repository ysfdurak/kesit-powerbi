global.window = global; const P='/home/claude/pbi/';
['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10'].filter(x=>require('fs').existsSync(P+x+'.js')).forEach(f=>require(P+f+'.js'));
require(P+'x_temel.js');
const plain=s=>s.replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s+/g,' ');
PBI_EXT.forEach(x=>console.log(x.id, plain(x.html).length, x.ex.length, x.ex.filter(e=>e.t!=='mc').length));
const X=PBI_DAX, ms={}; PBI_MEASURES.forEach(m=>ms[m.name]={name:m.name,expr:m.expr});
console.log(JSON.stringify(X.runQuery(ms,'EVALUATE SUMMARIZECOLUMNS(Tarih[Yil], "u", DISTINCTCOUNT(Satislar[UrunNo]))').rows));
