global.window=global; window.PBI_ORDER=[]; require('/home/claude/pbi/c17.js');
PBI_LESSONS.forEach(l=>{const c={};l.ex.forEach(e=>c[e.t]=(c[e.t]||0)+1); console.log(l.id,l.lv,l.body.replace(/<[^>]+>/g,'').length, JSON.stringify(c), /\b[ABC][12]\b/.test(l.body+JSON.stringify(l.ex)+l.sum));});
