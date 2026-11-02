const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
const st=require('./st_p2b.json');
await p.goto('http://localhost:8765/index.html');
await p.evaluate(ls=>{for(const o of ls)localStorage.setItem(o.name,o.value)}, st.origins[0].localStorage);
for(const h of ['alistirma','arena','hatalar','karistirilanlar','kariyer','tekrar','profil','sertifika','projeler','final']){
  const t0=Date.now(); await p.goto('http://localhost:8765/index.html#'+h); await p.reload(); await p.waitForSelector('#main *'); const dt=Date.now()-t0;
  await p.waitForTimeout(300);
  await p.screenshot({path:C.SS+'20_'+h+'.png'});
  const txt=await p.innerText('#main');
  console.log('=====',h,dt+'ms', 'len',txt.length,'\n',txt.slice(0,900).replace(/\n+/g,' | '));
  console.log('BTNS',(await p.$$eval('#main button',els=>els.slice(0,25).map(e=>JSON.stringify(e.dataset)+e.textContent.trim().slice(0,30)))).join(' ; '));
}
console.log(errs);await b.close();})();
