/* Bir dersin mevcut gövdesini ve alıştırmalarını yazdırır: node show.js <ders-id> [--html] */
global.window=global; const P='/home/claude/pbi/'; const fs=require('fs');
for (const f of ['data','data2','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20','c21','c22'].filter(x=>fs.existsSync(P+x+'.js'))) { try { require(P+f+'.js'); } catch (e) {} }
const l=PBI_LESSONS.find(x=>x.id===process.argv[2]); if(!l){console.log('yok');process.exit(1);}
const html=process.argv.includes('--html'); console.log(l.id,l.lv,l.mod,l.min+' dk','\n'+l.title+'\n'+l.sum+'\n');
console.log(html?l.body:l.body.replace(/<h2>/g,'\n## ').replace(/<pre class="dax"[^>]*>/g,'\n```dax\n').replace(/<\/pre>/g,'\n```\n').replace(/<li>/g,'\n- ').replace(/<\/p>|<\/tr>/g,'\n').replace(/<[^>]+>/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/[ \t]+/g,' '));
console.log('\nALIŞTIRMALAR:'); (l.ex||[]).forEach((e,i)=>console.log(i, e.t, e.name||'', String(e.q).replace(/<[^>]+>/g,'').slice(0,200), e.sol? '\n   sol: '+e.sol.replace(/\n/g,' ').slice(0,200):''));
