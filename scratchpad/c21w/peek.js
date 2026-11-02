global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const M = PBI_MODEL; console.log(Object.keys(M));
const T = M.tables || M;
for (const t of ['Projeler','Departmanlar','DovizKurlari','ParaBirimleri','Hedefler','GiderButce','Giderler','GiderTurleri','Calisanlar','Musteriler','Satislar']) { const tb = T[t]; if(!tb){console.log('no',t);continue;} const rows = tb.rows||tb; console.log(t, rows.length, JSON.stringify(rows.slice(0,3))); }
console.log(JSON.stringify(T.Projeler.rows||T.Projeler));
console.log(JSON.stringify(T.Departmanlar.rows||T.Departmanlar));
console.log(JSON.stringify((T.DovizKurlari.rows||T.DovizKurlari).slice(0,40)));
