const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#arena'); await p.waitForTimeout(300);
await p.click('[data-arg="liste"]'); await p.waitForTimeout(300); console.log('arena list url',p.url());
const first=await p.$('#main [data-arg^="ch-"]'); const id=await first.getAttribute('data-arg'); await first.click(); await p.waitForTimeout(300);
console.log('challenge',id,p.url(),(await p.innerText('#main')).slice(0,300).replace(/\n/g,' | '));
const sol=await p.evaluate(()=>{const c=PBI_CORE.curX&&PBI_CORE.curX(); return c&&c.e? {sol:c.e.sol,name:c.e.name}:null}); console.log('sol',sol&&sol.sol.slice(0,80));
// try hardcoded number to check hidden tests
await p.fill('#daxEditor', '1'); await p.click('[data-act="check"]'); await p.waitForTimeout(200); console.log('const ->',(await p.innerText('#out')).slice(0,120).replace(/\n/g,' '));
if(sol){ await p.fill('#daxEditor', sol.sol); await p.click('[data-act="check"]'); await p.waitForTimeout(300); console.log('sol ->',(await p.innerText('#out')).slice(0,160).replace(/\n/g,' ')); }
await p.screenshot({path:C.SS+'90_arena.png'});
// hatalar fix
await p.goto('http://localhost:8765/index.html#hatalar-toplam-satirlar-esit-degil'); await p.waitForTimeout(300);
console.log('hatalar detail',(await p.innerText('#main')).slice(0,400).replace(/\n/g,' | '));
await p.screenshot({path:C.SS+'91_hatalar.png'});
await p.goto('http://localhost:8765/index.html#karistirilanlar-all-ailesi'); await p.waitForTimeout(300);
console.log('karis detail',(await p.innerText('#main')).slice(0,300).replace(/\n/g,' | '));
// kariyer canli
await p.goto('http://localhost:8765/index.html#kariyer'); await p.waitForTimeout(300); await p.click('[data-ivo="iv-a01"]'); await p.waitForTimeout(200); await p.screenshot({path:C.SS+'92_kariyer.png'});
await p.click('[data-ivtab="canli"]'); await p.waitForTimeout(300); console.log('canli',(await p.innerText('#main')).slice(0,400).replace(/\n/g,' | '));
console.log(errs.filter(e=>!/ERR_FAILED/.test(e)));await b.close();})();
