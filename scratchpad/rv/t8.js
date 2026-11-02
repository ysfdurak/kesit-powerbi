const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
const st=require('./st_onb.json');
await p.goto('http://localhost:8765/index.html');
await p.evaluate(ls=>{for(const o of ls)localStorage.setItem(o.name,o.value)}, st.origins[0].localStorage);
for (const lid of ['tarih','aile','arayuz','ilk-rapor']) {
  await p.goto('http://localhost:8765/index.html#ders-'+lid); await p.reload(); await p.waitForTimeout(300);
  const exs=await p.evaluate(id=>PBI_CORE.LESSONS.find(l=>l.id===id).ex.map(e=>({t:e.t,a:e.a,sol:e.sol,name:e.name})),lid);
  for (let j=0;j<exs.length;j++){
    await p.click(`[data-step="${j+1}"]`); await p.waitForTimeout(200);
    const e=exs[j];
    if(e.t==='mc'){
      const wrong=e.a===0?1:0;
      await p.click(`#mc [data-mc="${wrong}"]`); const fbw=await p.innerText('#mcFb');
      await p.click(`#mc [data-mc="${e.a}"]`); const fb=await p.innerText('#mcFb');
      console.log(lid,j,'MC wrong->',fbw.slice(0,60).replace(/\n/g,' '),'| right->',fb.slice(0,100).replace(/\n/g,' '));
    } else if (e.t==='dax'||e.t==='measure'||e.t==='query'||!e.t||true){
      // try wrong first
      await p.fill('#daxEditor', e.name? e.name+' = SUM(Satislar[Yok])':'SUM(1');
      await p.click('[data-act="check"]'); await p.waitForTimeout(200);
      const w=await p.innerText('#out').catch(()=> 'no #out');
      await p.fill('#daxEditor', (e.name? e.name+' = ':'')+e.sol);
      await p.click('[data-act="check"]'); await p.waitForTimeout(300);
      const r=await p.innerText('#out').catch(()=> 'no #out');
      console.log(lid,j,e.t,'wrong->',w.slice(0,140).replace(/\n/g,' '),'| right->',r.slice(0,120).replace(/\n/g,' '));
      if(lid==='ilk-rapor'&&j>=2) await p.screenshot({path:C.SS+'07_dax_ex.png',fullPage:false});
    }
  }
  // what is after last?
  await p.waitForTimeout(400); const tail=(await p.innerText('#main')).slice(-600).replace(/\n+/g,' | ');
  console.log('TAIL',lid,tail.slice(-150));
  const bts=await p.$$eval('#main button',els=>els.slice(-6).map(e=>JSON.stringify(e.dataset)+' '+e.textContent.trim().slice(0,60)));
  console.log(bts.join('\n'));
}
await p.screenshot({path:C.SS+'08_lesson_end.png',fullPage:false});
await p.click('[data-go="home"]'); await p.waitForTimeout(300);
await p.screenshot({path:C.SS+'09_home_after.png',fullPage:false});
console.log((await p.innerText('#main')).slice(0,1500));
await ctx.storageState({path:'st_p1.json'});
console.log(errs);await b.close();})();
