global.window = global; const P = '/home/claude/pbi/'; const fs=require('fs');
['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20'].forEach(f => { if(fs.existsSync(P+f+'.js')) require(P + f + '.js')});
fs.readdirSync(P).filter(f=>/^x_.*\.js$/.test(f)).forEach(f=>{try{require(P+f)}catch(e){}});
const n=[]; PBI_LESSONS.forEach(l=>(l.ex||[]).forEach(e=>{if(e.name)n.push(e.name)}));
fs.writeFileSync(__dirname+'/names.txt', n.join('\n')); console.log(n.length, PBI_ORDER.includes('model-ileri'));
