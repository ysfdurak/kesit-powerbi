global.window=global; global.W=global;
const fs=require('fs');
for (const f of ['certdata_pl.js','certdata_pl2.js','certdata_dp.js','certdata_dp2.js','certdata_x.js','uiscreens.js']) {
  try { eval(fs.readFileSync('/home/claude/pbi/'+f,'utf8')); } catch(e){ console.log('ERR',f,e.message); }
}
const keys=Object.keys(global).filter(k=>k.startsWith('PBI'));
console.log(keys);
const Q=global.PBI_CERTQ||[];
console.log('certq',Q.length);
const pick=process.argv.slice(2);
for (const q of Q) if (pick.includes(q.id)) console.log(JSON.stringify(q).slice(0,2500),'\n');
