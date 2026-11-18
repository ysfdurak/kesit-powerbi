/* Depo vakası, kaynak dalı: app/dax.js (motorun kaynağı) vaka ölçülerinde beklenen sonucu veriyor mu?
   Yayın paketindeki kopya (vaka/depo/dax.js) ghpack.sh içinde kesit.js'ten üretilir ve orada ayrıca denetlenir. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=root+'/app/build/gh/static/vaka/depo';
const html=fs.readFileSync(dir+'/index.html','utf8'),csv=JSON.parse(html.match(/const CSV=("(?:[^"\\]|\\.)*")/)[1]),cozum=JSON.parse(html.match(/const COZUM=(\{.*?\});const BEK_PY/)[1]);
const bek=JSON.parse(fs.readFileSync(dir+'/beklenen.json','utf8')).powerbi;
const L=csv.trim().split('\n'),cols=L[0].split(','),rows=L.slice(1).map(l=>{const v=l.split(','),o={};cols.forEach((c,i)=>o[c]=['satir_id','sure_sn'].includes(c)?Number(v[i]):v[i]);return o;});
global.window=global;global.PBI_MODEL={tables:{Toplama:{rows,cols,kind:'fact'}},rels:[]};vm.runInThisContext(fs.readFileSync(root+'/app/dax.js','utf8'));
const ms={};for(const [n,e] of Object.entries(cozum))ms[n]={name:n,expr:e};
for(const n of ['Eski Ort','Yeni Ort','Kazanc sn','Kazanc %'])assert.ok(Math.abs(PBI_DAX.evalMeasure(ms,ms[n].expr,[])-bek.olcu[n])<1e-9,n);
const q=PBI_DAX.query({rows:[{t:'Toplama',c:'bolge'}],measures:ms,values:['[Kazanc sn]'],totals:false});
for(const r of q.rows)assert.ok(Math.abs(r.vals[0]-bek.bolge[r.keys[0]]['Kazanc sn'])<1e-9,'bölge '+r.keys[0]);
console.log(JSON.stringify({vaka:'depo',kaynak:'app/dax.js',kazancSn:bek.olcu['Kazanc sn']}));
