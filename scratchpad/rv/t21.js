const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open({vp:{width:390,height:844},mobile:false});
const routes=['','hedef','patikalar','patika-analist','dersler','ders-tarih','ders-ilk-rapor','test','sinavlar','alistirma','arena','studyo','pq','lab','dashboard','dashboard-ozet','dashboard-kokpit','dashboard-mobil','projeler','final','kariyer','hatalar','karistirilanlar','tekrar','profil','model','formuller','sozluk','menuler','gorseller','puf'];
for(const r of routes){ await p.goto('http://localhost:8765/index.html#'+r); await p.reload(); await p.waitForTimeout(350);
 const ov=await p.evaluate(()=>{const W=document.documentElement.clientWidth; const sw=document.documentElement.scrollWidth; const offenders=[...document.querySelectorAll('#main *')].filter(e=>{const r=e.getBoundingClientRect(); return r.right>W+2 && r.width>0 && getComputedStyle(e).position!=='fixed'}).filter(e=>{let a=e.parentElement; while(a){const s=getComputedStyle(a); if(/(auto|scroll|hidden)/.test(s.overflowX)) return false; a=a.parentElement;} return true}).slice(0,3).map(e=>e.tagName+'.'+e.className.toString().slice(0,30)+' r='+Math.round(e.getBoundingClientRect().right)); return {sw,W,offenders}});
 console.log((r||'home').padEnd(18), 'scrollW',ov.sw, ov.offenders.join(' ; '));
 if(['','ders-ilk-rapor','dashboard-ozet','sinavlar','patika-analist','hedef'].includes(r)) await p.screenshot({path:C.SS+'50_m_'+(r||'home')+'.png'});
}
console.log(errs.filter(e=>!/ERR_FAILED/.test(e)));await b.close();})();
