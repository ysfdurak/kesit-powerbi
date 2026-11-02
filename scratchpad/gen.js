global.window=global; const P='/home/claude/pbi/'; const fs=require('fs'); const S=process.argv[2];
const files=['data','data2','dax','measures','patterns','levels','tricks','c1','c2','c3','c4','c5','c6','c7','c8','deep','c9','c10','c11','c12','c13','c14','c15','c16','c17','c18','c19','c20'];
for (const f of files) require(P+f+'.js'); if (fs.existsSync(P+'xext.js')) {}
const M=PBI_MODEL; let o='TABLOLAR (satır sayısı):\n'; for (const t in M.tables){const tb=M.tables[t]; o+=t+' ('+tb.rows.length+'): '+tb.cols.join(', ')+'\n';}
o+='\nİLİŞKİLER:\n'+(M.rels||M.relationships||[]).map(r=>JSON.stringify(r)).join('\n')+'\n\nHAZIR ÖLÇÜLER ('+PBI_MEASURES.length+'):\n'+PBI_MEASURES.map(m=>'['+m.name+'] = '+m.expr.replace(/\s+/g,' ').slice(0,220)).join('\n')+'\n';
fs.writeFileSync(S+'/model.txt',o);
const FN=Object.keys(PBI_DAX.FN||{}); fs.writeFileSync(S+'/daxfn.txt',(FN.length?FN:['(FN listesi bulunamadı)']).sort().join(' ')+'\n');
const T={A1:'temel',A2:'temel',B1:'orta',B2:'orta',C1:'ileri',C2:'ileri'};
const cur=PBI_ORDER.map(id=>PBI_LESSONS.find(l=>l.id===id)).filter(Boolean).map(l=>[T[l.lv]||l.lv,l.lv,l.id,l.mod,l.title].join(' | ')+' || '+(l.body.match(/<h2>(.*?)<\/h2>/g)||[]).map(h=>h.replace(/<[^>]+>/g,'')).join(' / ')+' || '+(l.ex||[]).length+' alıştırma · '+Math.round(l.body.replace(/<[^>]+>/g,'').length/100)/10+'k karakter');
fs.writeFileSync(S+'/curriculum.txt',cur.join('\n')+'\n'); console.log(cur.length, FN.length, Object.keys(M.tables).length);
