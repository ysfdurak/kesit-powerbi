const C=require('./common.js');
(async()=>{const {b,ctx,p,errs}=await C.open();
await p.goto('http://localhost:8765/index.html#dashboard-ozet'); await p.waitForTimeout(500);
const tiles=await p.$$eval('.dtile[data-scope="dash"]',els=>els.map(e=>e.dataset.tile+' thruchip='+!!e.querySelector('.chip.tp')+' '+(e.querySelector('h3')||{}).textContent+' cross='+e.dataset.cross+' items='+e.querySelectorAll('[data-i]').length));
console.log(tiles.join('\n'));
const thruTile=await p.$('.dtile[data-scope="dash"]:has(.chip.tp:text("Detay sayfası"))');
if(!thruTile){console.log('no thru tile on page 1');}
const tileId=thruTile? await thruTile.getAttribute('data-tile'):'kat';
const item=await p.$(`.dtile[data-tile="${tileId}"][data-scope="dash"] [data-i]`);
await item.scrollIntoViewIfNeeded();
await item.click({button:'right'}); await p.waitForTimeout(400);
const top=await p.evaluate(()=>{const e=document.querySelector('[data-dbm]');return e.getBoundingClientRect().top+scrollY});
await p.evaluate(t=>scrollTo(0,t-80),top); await p.waitForTimeout(100);
await p.screenshot({path:C.SS+'46_drillthrough.png'});
console.log('after right-click:', (await p.innerText('.dtile >> nth=0').catch(()=>'')).slice(0,100), '|', (await p.$$eval('#main button',els=>els.filter(e=>/Geri/.test(e.textContent)).map(e=>e.textContent.trim()))));
// back via button
const back=await p.$('#main button:has-text("Geri")'); if(back){await back.click(); await p.waitForTimeout(300);}
// left-click select then "Detaya git"
const item2=await p.$(`.dtile[data-tile="${tileId}"][data-scope="dash"] [data-i]`); await item2.click(); await p.waitForTimeout(300);
const cb=await p.$('.crossbar'); console.log('crossbar:', cb? await cb.innerText():'none');
await p.screenshot({path:C.SS+'47_crossfilter.png'});
const go=await p.$('[data-dthru]'); if(go){ await go.click(); await p.waitForTimeout(300); console.log('Detaya git OK; page now has:', (await p.innerText('#main')).match(/Detay sayfası filtresi[^\n]*|Geri[^\n]*/g)); }
// browser back after drillthrough
await p.goBack(); await p.waitForTimeout(300); console.log('after browser back url',p.url());
// phone layout button
await p.goto('http://localhost:8765/index.html#dashboard-ozet'); await p.waitForTimeout(400);
const mob=await p.$('[data-dmob]'); console.log('mob btn', mob && await mob.innerText());
if(mob){ await mob.scrollIntoViewIfNeeded(); await mob.click(); await p.waitForTimeout(400); const mt=await p.evaluate(()=>{const e=document.querySelector('.phone, .mobframe, [class*=phone]');return e? e.className:null}); console.log('phone frame', mt);
  const el=await p.$('.phone, [class*=phone]'); if(el){await el.scrollIntoViewIfNeeded(); await p.screenshot({path:C.SS+'48_phone_layout.png'});} }
console.log(errs);await b.close();})();
