const fs=require('fs');const F='/home/claude/pbi/certdata_pl.js';let s=fs.readFileSync(F,'utf8');
const T={'case-pl-1-q1':2,'case-pl-1-q2':3,'case-pl-2-q1':1,'pl-n05':0,'pl-n19':0,'pl-n33':0};
for(const [id,to] of Object.entries(T)){
  const i=s.indexOf("id:'"+id+"'"); const re=/o:\[([\s\S]*?)\], a:(\d)/g; re.lastIndex=i; const m=re.exec(s);
  const opts=[...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x=>x[1]); const a=+m[2];
  const c=opts.splice(a,1)[0]; opts.splice(to,0,c);
  const multi=m[1].includes('\n'); s=s.slice(0,m.index)+'o:['+opts.map(o=>"'"+o+"'").join(multi?',\n     ':', ')+'], a:'+to+s.slice(m.index+m[0].length);
}
// multi: rotate by r
const R={'pl-n04':1,'pl-n10':2,'pl-n18':3,'pl-n24':2,'pl-n30':1,'pl-n35':3,'pl-n43':2,'case-pl-1-q4':3,'case-pl-2-q5':1};
for(const [id,r] of Object.entries(R)){
  const i=s.indexOf("id:'"+id+"'"); const re=/o:\[([\s\S]*?)\], a:\[([\d,]+)\]/g; re.lastIndex=i; const m=re.exec(s);
  const opts=[...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x=>x[1]); const n=opts.length; const a=m[2].split(',').map(Number);
  const no=opts.map((_,j)=>opts[(j-r+n)%n]); const na=a.map(x=>(x+r)%n).sort((p,q)=>p-q);
  if(na.some((x,k)=>no[x]!==opts[a[k]]) && false) throw id;
  const multi=m[1].includes('\n'); s=s.slice(0,m.index)+'o:['+no.map(o=>"'"+o+"'").join(multi?',\n     ':', ')+'], a:['+na.join(',')+']'+s.slice(m.index+m[0].length);
  console.log(id, na.map(x=>no[x].slice(0,40)));
}
fs.writeFileSync(F,s);
