global.window=global; const P='/home/claude/pbi/'; const fs=require('fs');
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3','pqdata','extra','mcfix','bank','exams','interview','interview2']) require(P+f+'.js');
const norm = s => String(s).replace(/\s+/g, '');
const m = new Map(); PBI_LESSONS.forEach(l => (l.ex||[]).forEach((e,i) => { if (e.sol) m.set(norm(e.sol), (m.get(norm(e.sol))||[]).concat(l.id+'#'+i+' '+e.name)); }));
for (const e of PBI_PRACTICE.concat(PBI_CODEPOOL, PBI_INTERVIEW)) { const k = norm(e.sol||''); if (m.has(k)) console.log(e.id, '<->', m.get(k).join(' | ')); }
for (const [lid, i] of [['model-temel',3],['toplama',5],['performans',8],['pl300',4],['tablo-fonk',5],['hedef',5],['yasam-dongusu',8],['hedef',4]]) { const e = PBI_LESSONS.find(l=>l.id===lid).ex[i]; console.log('\n##', lid, i, JSON.stringify(e)); }
