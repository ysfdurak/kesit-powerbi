global.window=global; const P='/home/claude/pbi/'; const fs=require('fs');
for (const f of ['data','data2','dax','measures','patterns','levels','tricks','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','pqdata','extra','mcfix','bank','exams','certskills','certdata_pl','certdata_pl2','certdata_dp','certdata_x','certdata_dp2','uiscreens','certclass','enterms','confused','interview','arenadata']) { try { require(P+f+'.js'); } catch(e){ console.log('ERR',f,e.message.slice(0,80)); } }
const L=window.PBI_LESSONS; const T={A1:'temel',A2:'temel',B1:'orta',B2:'orta',C1:'ileri',C2:'ileri',temel:'temel',orta:'orta',ileri:'ileri'};
const by={}; L.forEach(l=>{const k=T[l.lv]+' | '+l.mod; (by[k]=by[k]||[]).push(l);});
Object.keys(by).sort().forEach(k=>{const ls=by[k]; console.log(k.padEnd(45), ls.length+' ders', ls.reduce((a,l)=>a+(l.ex||[]).length,0)+' alıştırma', ls.map(l=>l.id+':'+(l.ex||[]).length+':'+Math.round(l.body.length/1000)+'k').join(' '));});
console.log('TOTAL', L.length, L.reduce((a,l)=>a+(l.ex||[]).length,0));
const ks=Object.keys(window).filter(k=>k.startsWith('PBI_')); ks.forEach(k=>{const v=window[k]; if(Array.isArray(v)) console.log(k, v.length); else if (v&&typeof v==='object') console.log(k, 'obj', Object.keys(v).length);});
