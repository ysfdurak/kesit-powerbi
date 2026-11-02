global.window=global; const P='/home/claude/pbi/';
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22','x_temel','x_orta1','x_orta2','x_ileri1','x_ileri2','x_ileri3','pqdata','extra','mcfix','bank','exams','interview','interview2','confused','confused2']) require(P+f+'.js');
const X=PBI_DAX, base={}; PBI_MEASURES.forEach(m=>base[m.name]={name:m.name,expr:m.expr});
const ms=n=>{const o={};for(const k in base) if(k!==n)o[k]=base[k];return o;};
const items=[]; PBI_LESSONS.forEach(l=>(l.ex||[]).forEach((e,i)=>items.push([l.id+'#'+i,e]))); PBI_PRACTICE.concat(PBI_CODEPOOL,PBI_INTERVIEW).forEach(e=>items.push([e.id,e])); PBI_MISTAKES.filter(m=>m.task).forEach(m=>items.push(['mist '+m.id,Object.assign({t:'dax'},m.task)]));
for (const [w,e] of items) { if (e.t!=='dax'&&e.t!=='query') continue; const t0=Date.now(); try { if (e.t==='query') X.runQuery(ms(),e.sol); else { X.evalMeasure(ms(e.name),e.sol,[]); (e.grid||[{t:'Kategoriler',c:'Kategori'},{t:'Tarih',c:'Yil'}]).forEach(c=>X.query({rows:[c],measures:ms(e.name),values:[e.sol],totals:false,keepBlank:true})); } } catch(x){} const d=Date.now()-t0; if (d>700) console.log(d+'ms', w, (e.sol||'').replace(/\s+/g,' ').slice(0,140)); }
console.log('done', items.length);
