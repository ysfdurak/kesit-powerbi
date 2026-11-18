/* Depo vakası (vaka/depo/): DAX motoru kopyası yayındaki paketle aynı mı, ölçüler beklenen sonucu veriyor mu?
   node tests/vaka-depo.cjs         → denetler
   node tests/vaka-depo.cjs --yaz   → vaka/depo/dax.js'i kesit.js'teki dax.js bölümünden yeniden üretir */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=root+'/vaka/depo';
const parts=fs.readFileSync(root+'/kesit.js','utf8').split(/\/\* ===== ([^\n]+) ===== \*\//),dax=parts[parts.indexOf('dax.js')+1];
const head='/* Kesit Power BI DAX benzetim motoru: kesit.js paketindeki dax.js bölümünün birebir kopyası.\n   Elle düzenleme. kesit.js değişince: node tests/vaka-depo.cjs --yaz */';
if(process.argv.includes('--yaz')){fs.writeFileSync(dir+'/dax.js',head+dax);console.log('vaka/depo/dax.js yazıldı');process.exit(0);}
assert.equal(fs.readFileSync(dir+'/dax.js','utf8'),head+dax,'vaka/depo/dax.js kesit.js içindeki motordan farklı: node tests/vaka-depo.cjs --yaz');
const html=fs.readFileSync(dir+'/index.html','utf8'),csv=JSON.parse(html.match(/const CSV=("(?:[^"\\]|\\.)*")/)[1]),cozum=JSON.parse(html.match(/const COZUM=(\{.*?\});const BEK_PY/)[1]);
const bek=JSON.parse(fs.readFileSync(dir+'/beklenen.json','utf8')).powerbi;
const L=csv.trim().split('\n'),cols=L[0].split(','),rows=L.slice(1).map(l=>{const v=l.split(','),o={};cols.forEach((c,i)=>o[c]=['satir_id','sure_sn'].includes(c)?Number(v[i]):v[i]);return o;});
global.window=global;global.PBI_MODEL={tables:{Toplama:{rows,cols,kind:'fact'}},rels:[]};vm.runInThisContext(fs.readFileSync(dir+'/dax.js','utf8'));
const ms={};for(const [n,e] of Object.entries(cozum))ms[n]={name:n,expr:e};
for(const n of ['Eski Ort','Yeni Ort','Kazanc sn','Kazanc %'])assert.ok(Math.abs(PBI_DAX.evalMeasure(ms,ms[n].expr,[])-bek.olcu[n])<1e-9,n);
const q=PBI_DAX.query({rows:[{t:'Toplama',c:'bolge'}],measures:ms,values:['[Kazanc sn]'],totals:false});
for(const r of q.rows)assert.ok(Math.abs(r.vals[0]-bek.bolge[r.keys[0]]['Kazanc sn'])<1e-9,'bölge '+r.keys[0]);
console.log(JSON.stringify({vaka:'depo',satir:rows.length,kazancSn:bek.olcu['Kazanc sn'],motorKopyasi:'aynı'}));
