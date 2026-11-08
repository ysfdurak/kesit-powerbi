/* Kaynak veya yayınlanan bundle üzerinde aynı denetim; Node 20+, bağımlılık yok. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');global.window=global;
const skip=f=>/^(app|pq|practice|examui|arena|guides|career|sync|portfolio|vdata|pages)\.js$/.test(f);
if(fs.existsSync(root+'/kesit.js')){
 const blocks=fs.readFileSync(root+'/kesit.js','utf8').split(/\/\* ===== ([^\n]+) ===== \*\//);
 for(let i=1;i<blocks.length;i+=2)if(!skip(blocks[i]))vm.runInThisContext(blocks[i+1],{filename:blocks[i]});
}else{
 const app=root+'/app',files=[...fs.readFileSync(app+'/index.html','utf8').matchAll(/src="([^"]+\.js)"/g)].map(m=>m[1]);
 for(const f of files)if(!skip(f))vm.runInThisContext(fs.readFileSync(app+'/'+f,'utf8'),{filename:f});
}
const base={};PBI_MEASURES.forEach(m=>base[m.name]={name:m.name,expr:m.expr});
let count=0;
for(const l of PBI_LESSONS)for(const [i,e] of (l.ex||[]).entries())if(['dax','query'].includes(e.t)){
 const ms={...base};if(e.name)delete ms[e.name];assert.equal(PBI_CHECK.dataIssue(e,ms,e.sol),'',l.id+'#'+i);count++;
}
const e=PBI_LESSONS.find(x=>x.id==='ilk-olcu').ex.find(x=>x.t==='dax'),ms={...base};delete ms[e.name];
const lit=v=>typeof v==='number'?String(v):'"'+String(v).replaceAll('"','""')+'"';let fake='SWITCH(TRUE(), ';
for(const col of [{t:'Kategoriler',c:'Kategori'},{t:'Tarih',c:'Yil'}]){
 const r=PBI_DAX.query({rows:[col],measures:ms,values:[e.sol],totals:false,keepBlank:true});
 fake+='ISINSCOPE('+col.t+'['+col.c+']), SWITCH(SELECTEDVALUE('+col.t+'['+col.c+']), '+r.rows.map(r=>lit(r.keys[0])+', '+lit(r.vals[0])).join(', ')+', BLANK()), ';
}
fake+=PBI_DAX.evalMeasure(ms,e.sol,[])+') + 0 * SUM(Satislar[Tutar])';
assert.notEqual(PBI_CHECK.dataIssue(e,ms,fake),'','Sahte sabit cevap reddedilmeli');
assert.equal(PBI_CHECK.dataIssue(e,ms,'SUMX(Satislar, Satislar[Tutar])'),'','Eşdeğer çözüm kabul edilmeli');
assert.equal(PBI_CHECK.dataIssue(e,ms,'CALCULATE(SUM(Satislar[Tutar]))'),'','İkinci eşdeğer çözüm kabul edilmeli');
console.log(JSON.stringify({referenceSolutions:count,fakeRejected:true,alternativesAccepted:2}));
