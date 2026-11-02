const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open({dark:true});
for(const r of ['','ders-ilk-rapor','dashboard-ozet','dashboard-kokpit','sinavlar','profil','arena']){ await p.goto('http://localhost:8765/index.html#'+r); await p.reload(); await p.waitForTimeout(400);
 if(r.startsWith('dashboard')){const top=await p.evaluate(()=>{const e=document.querySelector('[data-dbm]');return e.getBoundingClientRect().top+scrollY}); await p.evaluate(t=>scrollTo(0,t-80),top);}
 if(r==='ders-ilk-rapor'){ await p.click('[data-step="3"]'); await p.fill('#daxEditor','En Küçük Satır = MIN(Satislar[Tutar])'); await p.click('[data-act="check"]'); await p.waitForTimeout(200);}
 await p.screenshot({path:C.SS+'70_dark_'+(r||'home')+'.png'});
 const bg=await p.evaluate(()=>getComputedStyle(document.body).backgroundColor); console.log(r,bg);
}
console.log(errs.filter(e=>!/ERR_FAILED/.test(e)));await b.close();})();
