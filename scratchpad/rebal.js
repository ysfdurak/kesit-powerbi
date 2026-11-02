const fs=require('fs'); const p='/home/claude/pbi/confused.js'; let s=fs.readFileSync(p,'utf8');
const end=s.indexOf('W.PBI_MISTAKES'); let out='', i=0, k=0;
let seed=7; const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648; const T=[]; for(let x=0;x<80;x++) T.push(x%4); for(let x=T.length-1;x>0;x--){const y=Math.floor(rnd()*(x+1)); [T[x],T[y]]=[T[y],T[x]];}
const re=/o: \[/g; let m; let last=0;
while((m=re.exec(s)) && m.index<end){
  let j=m.index+4, opts=[];
  while(true){ while(s[j]===' '||s[j]===',') j++; if(s[j]===']') break; if(s[j]!=="'") throw 'parse '+s.slice(j,j+30); let e=s.indexOf("'",j+1); opts.push(s.slice(j,e+1)); j=e+1; }
  const close=j; const am=/^\], a: (\d+)/.exec(s.slice(close)); if(!am) throw 'no a';
  const a=+am[1]; const t=T[k]; k++;
  [opts[a],opts[t]]=[opts[t],opts[a]];
  out+=s.slice(last,m.index)+'o: ['+opts.join(', ')+'], a: '+t; last=close+am[0].length; re.lastIndex=last;
}
out+=s.slice(last); fs.writeFileSync(p,out); console.log('rebalanced',k);
