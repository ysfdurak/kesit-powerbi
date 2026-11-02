const fs=require('fs');const F='/home/claude/pbi/certdata_pl.js';let s=fs.readFileSync(F,'utf8');
const T={'pl-n08':3,'pl-n11':2,'pl-n16':3,'pl-n19':2,'pl-n23':3,'pl-n25':2,'pl-n29':3,'pl-n31':2,'pl-n33':3,'pl-n39':3,'pl-n41':2};
for(const [id,to] of Object.entries(T)){
  const i=s.indexOf("id:'"+id+"'"); if(i<0) throw id;
  const re=/o:\[([\s\S]*?)\], a:(\d)/g; re.lastIndex=i; const m=re.exec(s);
  const opts=[...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x=>x[1]); const a=+m[2];
  if(opts.length!==4) throw id+' n='+opts.length;
  const c=opts.splice(a,1)[0]; opts.splice(to,0,c);
  const multi=m[1].includes('\n'); const body=opts.map(o=>"'"+o+"'").join(multi?',\n     ':', ');
  s=s.slice(0,m.index)+'o:['+body+'], a:'+to+s.slice(m.index+m[0].length);
}
fs.writeFileSync(F,s);
