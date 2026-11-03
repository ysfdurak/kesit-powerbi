global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep',...['c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','c23','c24','c25','c26','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3'].filter(x=>require('fs').existsSync(P+x+'.js')),'pqdata','extra','mcfix']) require(P + f + '.js');
const plain = s => String(s).replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, 'x');
const all = [];
PBI_LESSONS.forEach(l => (l.ex || []).forEach((e, i) => { if (e.t === 'mc' && !e.thumbs) all.push({ src: l.id + '#' + i, e }); }));
PBI_PLACEMENT.forEach((e, i) => all.push({ src: 'test#' + i, e }));
let longest = 0, strict = 0; const flagged = [];
all.forEach(({ src, e }) => { const L = e.o.map(o => plain(o).length); const mx = Math.max(...L); const second = L.slice().sort((a, b) => b - a)[1];
  if (L[e.a] === mx) { longest++; if (L[e.a] > 1.3 * second) { strict++; flagged.push(src + ' | ' + L.join('/') + ' | ' + plain(e.q).slice(0, 70)); } } });
console.log('toplam', all.length, 'doğru en uzun', longest, '(%' + Math.round(longest / all.length * 100) + ')', 'belirgin en uzun (>%30)', strict);
if (process.argv[2]) console.log(flagged.join('\n'));

/* Şık uzunluğu ipucu vermesin: iki yönlü denetim (sınıra gelen yeni içerik; eski dosyalar yalnız bilgi).
   Doğru şık en uzun ve en kısa olma oranı %15-35 arasında olmalı; yanlış şıkkın ötekilerden belirgin uzun olduğu soru (%30'dan fazla) %20'yi geçmemeli. */
const fs0 = require('fs'), vm0 = require('vm');
const fileEx = f => { const src = fs0.readFileSync(P + f + '.js', 'utf8'); const w = { PBI_LESSONS: [], PBI_ORDER: [], console }; w.window = w; vm0.runInNewContext(src, w); return w.PBI_LESSONS.flatMap(l => (l.ex || []).filter(e => e.t === 'mc')); };
['bank', 'certskills', 'certdata_x', 'confused', 'confused2'].forEach(f => require(P + f + '.js'));
const GROUPS = { c25: fileEx('c25'), c26: fileEx('c26'), 'Pratik Senaryo': PBI_PRACTICE.filter(p => p.t === 'mc'), 'Sınav ek (-tNN)': PBI_CERTQ.filter(q => /-t\d\d$/.test(q.id) && q.type === 'mc') };
let bad = 0;
for (const g in GROUPS) { const a = GROUPS[g]; let lo = 0, sh = 0, gap = 0; a.forEach(e => { const L = e.o.map(o => plain(o).length), mx = Math.max(...L), mn = Math.min(...L), so = L.slice().sort((x, y) => y - x); if (L[e.a] === mx && L.filter(x => x === mx).length === 1) lo++; if (L[e.a] === mn && L.filter(x => x === mn).length === 1) sh++; if (L[e.a] !== mx && so[0] > 1.3 * so[1]) gap++; });
  const pc = x => Math.round(x / a.length * 100); console.log(g, a.length, 'mc · doğru=en uzun %' + pc(lo), '· en kısa %' + pc(sh), '· yanlış şık belirgin uzun %' + pc(gap));
  if (a.length >= 8) { if (pc(lo) < 15 || pc(lo) > 35) { bad++; console.log('SORUN', g, 'doğru en uzun oranı %15-35 dışında'); } if (pc(sh) < 15 || pc(sh) > 35) { bad++; console.log('SORUN', g, 'doğru en kısa oranı %15-35 dışında'); } if (pc(gap) > 20) { bad++; console.log('SORUN', g, 'yanlış şıklar yapay uzun'); } } }
console.log('SORUN', bad); process.exitCode = bad ? 1 : 0;
