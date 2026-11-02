const { chromium } = require('playwright');
const EP='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const U='http://localhost:8765/index.html';
const R=['','#patikalar','#patika-pl300','#patika-dax','#dersler','#ders-tarih','#ders-aile','#ders-arayuz','#model','#studyo','#formuller','#test','#sozluk','#menu','#arena','#hedef','#sertifika','#projeler','#sinavlar','#karistirilanlar','#hatalar','#kariyer','#gorseller','#dashboard','#dashboard-ozet','#dashboard-rfm','#dashboard-kokpit','#dashboard-hikaye','#dashboard-mobil','#lab','#puf','#menuler','#final','#pq','#alistirma','#tekrar','#profil','#gorev','#nonexistent','#ders-yok','#dashboard-yok','#'+'x'.repeat(5000)];
async function mk(b, init){ const ctx=await b.newContext(); const p=await ctx.newPage(); await p.route(/fonts\.(googleapis|gstatic)/, rt=>rt.abort()); const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message.slice(0,200))); p.on('console',m=>{ if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.text().slice(0,200));}); if(init) await p.addInitScript(init); return {ctx,p,errs}; }
(async () => {
  const b = await chromium.launch({ executablePath: EP });
  // 1 routes
  let {ctx,p,errs}=await mk(b);
  await p.goto(U); await p.waitForTimeout(800);
  for (const r of R){ const n=errs.length; await p.evaluate(h=>{location.hash=h},r); await p.waitForTimeout(r.includes('dashboard')?900:300); const t=await p.evaluate(()=>({len:document.querySelector('#main').innerText.length, h1:(document.querySelector('#main h1,#main h2')||{}).textContent, title:document.title, hash:location.hash.slice(0,30)})); console.log('ROUTE',r.slice(0,30)||'home',JSON.stringify(t).slice(0,160), errs.slice(n).join(' | ')); }
  // back/forward
  await p.goto(U); await p.waitForTimeout(500);
  await p.click('#nav [data-go="curr"]'); await p.waitForTimeout(300);
  await p.click('#nav [data-go="studio"]').catch(e=>console.log('no studio nav')); await p.waitForTimeout(300);
  console.log('after clicks hash', await p.evaluate(()=>location.hash), 'history.length', await p.evaluate(()=>history.length));
  await p.goBack().catch(()=>{}); await p.waitForTimeout(400); console.log('after back url', p.url());
  // in-content link test (location hash change) back
  await p.goto(U+'#dersler'); await p.waitForTimeout(400); await p.evaluate(()=>location.hash='#studyo'); await p.waitForTimeout(400); await p.goBack(); await p.waitForTimeout(400); console.log('hash-nav back ->', p.url(), (await p.evaluate(()=>document.querySelector('#main h1,#main h2')?.textContent)));
  // rapid nav
  const n0=errs.length; const t0=Date.now();
  for(let i=0;i<60;i++){ await p.evaluate(h=>location.hash=h, R[i%R.length]); }
  await p.waitForTimeout(3000); console.log('rapid nav 60 hashes', Date.now()-t0,'ms errs', errs.slice(n0).slice(0,5));
  const btns = await p.$$('#nav [data-go]'); const n1=errs.length; for (let k=0;k<3;k++) for (const bt of btns) { await bt.click({timeout:2000}).catch(()=>{}); }
  console.log('rapid nav clicks', btns.length*3, 'errs', errs.slice(n1).slice(0,5));
  // studio long input and invalid dax
  await p.goto(U+'#studyo'); await p.waitForTimeout(800);
  const ta='#daxEditor';
  const cases=['SUM(Satis[Tutar]','CALCULATE(','FOO(1)','[Yok Ölçü]','Satis[YokKolon]','1/0','DIVIDE(1,0)','"abc"+1','VAR x = 1','SUMX(Satis, Satis[Tutar] * )','<script>alert(1)</script>','CALCULATE(SUM(Satis[Tutar]), Satis[Tutar] > 1'];
  for (const c of cases){ await p.fill(ta,c); await p.press(ta,'Control+Enter'); await p.waitForTimeout(150); const o=await p.evaluate(()=>document.querySelector('#stOut').innerText.replace(/\s+/g,' ').slice(0,140)); console.log('DAX',JSON.stringify(c),'=>',o); }
  for (const sz of [10000, 100000, 1000000]) { const big='1+'.repeat(sz/2)+'1'; const t=Date.now(); await p.fill(ta,big); const t1=Date.now()-t; const t2s=Date.now(); await p.press(ta,'Control+Enter',{timeout:60000}).catch(e=>console.log('press timeout')); await p.waitForTimeout(100); const o=await p.evaluate(()=>document.querySelector('#stOut').innerText.slice(0,120)); console.log('LONG',sz,'fill ms',t1,'run ms',Date.now()-t2s,o.replace(/\s+/g,' ')); }
  const nest='('.repeat(5000)+'1'+')'.repeat(5000); await p.fill(ta,nest); await p.press(ta,'Control+Enter'); await p.waitForTimeout(200); console.log('NEST5000', (await p.evaluate(()=>document.querySelector('#stOut').innerText.slice(0,120))).replace(/\s+/g,' '));
  const persisted = await p.evaluate(()=>(localStorage.getItem('pbipatika.v1')||'').length); console.log('LS size after big input', persisted);
  console.log('errors studio', errs.slice(-8));
  await ctx.close();
  // storage throwing
  for (const [name, init] of [['throwing', ()=>{ Storage.prototype.getItem=function(){throw new Error('denied')}; Storage.prototype.setItem=function(){throw new Error('denied')}; }], ['no-localStorage-prop', ()=>{ Object.defineProperty(window,'localStorage',{get(){throw new DOMException('SecurityError')}}); }], ['corrupt-text', ()=>{ localStorage.setItem('pbipatika.v1','{not json'); }], ['corrupt-string', ()=>{ localStorage.setItem('pbipatika.v1','"hello"'); }], ['corrupt-nulls', ()=>{ localStorage.setItem('pbipatika.v1', JSON.stringify({done:null, days:null, xp:'x', mine:{}, drafts:null, exams:null, weak:null, P:1, theme:7, studio:'z', reports:null, seen:null})); }], ['corrupt-arrays', ()=>{ localStorage.setItem('pbipatika.v1', JSON.stringify({done:[], days:[], mine:'abc', placement:'zz', last:{view:'nope'}})); }], ['quota', ()=>{ const o=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==='pbipatika.v1') throw new DOMException('QuotaExceededError','QuotaExceededError'); return o.call(this,k,v);} }]]) {
    const m=await mk(b, init); await m.p.goto(U); await m.p.waitForTimeout(800);
    for (const r of ['','#ders-tarih','#studyo','#profil','#hedef','#arena','#dashboard-rfm']) { await m.p.evaluate(h=>location.hash=h,r); await m.p.waitForTimeout(400); }
    const len=await m.p.evaluate(()=>document.querySelector('#main').innerText.length);
    console.log('STORAGE',name,'mainLen',len,'errs',m.errs.length, [...new Set(m.errs)].slice(0,4).join(' | '));
    await m.ctx.close();
  }
  await b.close();
})();
