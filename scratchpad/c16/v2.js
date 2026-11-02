global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures'].forEach(f => require(P + f + '.js')); global.PBI_ORDER=[]; require(P + 'c16.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const dec = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function splitDefs(src) { const out=[]; let cur=null; src.split('\n').forEach(line => { const m = line.match(/^([^\s\-\/=()\[\]"'{},<>][^=()\[\]"{},<>]*?(?:\s\([^()=\[\]]*\))?)\s*:?=(?!=)\s*(.*)$/); if (m && !/^(VAR|RETURN)\b/i.test(m[1].trim())) { cur={name:m[1].trim(),expr:m[2]}; out.push(cur);} else if (cur) cur.expr += '\n'+line; }); return out; }
for (const l of PBI_LESSONS) { const re = /<pre class="dax"(?![^>]*data-notry)[^>]*>([\s\S]*?)<\/pre>/g; let m; while ((m = re.exec(l.body))) { const src = dec(m[1]); if (/EVALUATE/.test(src)) continue; splitDefs(src).forEach(d => ms[d.name] = {name:d.name, expr:d.expr}); } }
const g = (e, rows, f) => console.log(e.slice(0,30), X.query({rows, measures: ms, values:[e], totals:true, filters: f}).rows.map(r=>r.keys.join('/')+'='+(typeof r.vals[0]=='number'?Math.round(r.vals[0]*10000)/10000:r.vals[0])).join('  '));
g('[Pazar Payı %]', [{t:'Tarih',c:'Yil'}]); g('[Pay Değişimi (puan)]', [{t:'Kategoriler',c:'Kategori'},{t:'Tarih',c:'Yil'}]);
g('[Pazar Payı %]', [{t:'Kategoriler',c:'Kategori'}]);
g('[Üretim Tasarrufu]', [{t:'Tarih',c:'Yil'}]); g('[Başabaş Adedi (Üret / Mevcut)]', [{t:'Tarih',c:'Yil'}]); g('[Hat Birim Maliyeti]', [{t:'Tarih',c:'Yil'}]);
g('[Güvenilir İade %]', [{t:'Musteriler',c:'Sehir'}]); g('[Şehir Z-Skoru]', [{t:'Musteriler',c:'Sehir'}]); g('[Teslim Farkı (gün)]', [{t:'Musteriler',c:'Sehir'}]); g('[İade Farkı (puan)]', [{t:'Calisanlar',c:'AdSoyad'}]); g('[Sipariş Sıklığı Endeksi]', [{t:'Musteriler',c:'Sehir'}]);
for (const l of PBI_LESSONS) l.ex.filter(e=>e.t==='dax').forEach(e => g(e.sol, e.grid || [{t:'Kategoriler',c:'Kategori'}]));
