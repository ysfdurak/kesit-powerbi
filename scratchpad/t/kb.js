const { chromium } = require('playwright');
const fs=require('fs'); const AXE=fs.readFileSync('node_modules/axe-core/axe.min.js','utf8');
const EP='/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const U='http://localhost:8765/index.html';
(async () => {
  const b = await chromium.launch({ executablePath: EP });
  const ctx=await b.newContext({viewport:{width:1366,height:900}, reducedMotion:'reduce'}); const p=await ctx.newPage(); await p.route(/fonts\.(googleapis|gstatic)/, rt=>rt.abort());
  await p.goto(U+'#dashboard-rfm'); await p.waitForTimeout(1200);
  console.log('chart svgs sample', await p.evaluate(()=>[...document.querySelectorAll('#main svg')].filter(s=>s.getBoundingClientRect().width>150).slice(0,4).map(s=>({role:s.getAttribute('role'),label:(s.getAttribute('aria-label')||'').slice(0,80), title:(s.querySelector('title')||{}).textContent, hidden:s.getAttribute('aria-hidden'), parentLabel:(s.parentElement.getAttribute('aria-label')||'').slice(0,60)}))));
  console.log('tables in dashboard', await p.evaluate(()=>document.querySelectorAll('#main table').length));
  // reduced motion
  console.log('animations under reduce', await p.evaluate(()=>document.getAnimations().length), 'smooth scroll css', await p.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior));
  // keyboard on home
  await p.goto(U); await p.waitForTimeout(600);
  let noOutline=[], seq=[];
  for (let i=0;i<40;i++){ await p.keyboard.press('Tab'); const f=await p.evaluate(()=>{const e=document.activeElement; const cs=getComputedStyle(e); return {t:e.tagName+(e.dataset.go?'['+e.dataset.go+']':'')+' '+(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,25), ol: cs.outlineStyle!=='none' && parseFloat(cs.outlineWidth)>0, bs: cs.boxShadow!=='none'}}); seq.push(f.t); if(!f.ol&&!f.bs) noOutline.push(f.t); }
  console.log('tab seq', seq.slice(0,14).join(' > ')); console.log('no visible focus', noOutline.length, noOutline.slice(0,6));
  // skip link?
  // keyboard lesson flow: go to lesson via Enter
  await p.goto(U+'#ders-tarih'); await p.waitForTimeout(500);
  const fe = await p.evaluate(()=>[...document.querySelectorAll('#main button, #main input, #main [tabindex]')].slice(0,12).map(e=>e.tagName+':'+(e.innerText||'').trim().slice(0,20)));
  console.log('lesson controls', fe.join(' | '));
  // focus after route change
  await p.focus('#nav [data-go="curr"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  console.log('after Enter on nav: hash', await p.evaluate(()=>location.hash), 'active', await p.evaluate(()=>document.activeElement.id||document.activeElement.tagName));
  // studio Tab trap
  await p.goto(U+'#studyo'); await p.waitForTimeout(500); await p.focus('#daxEditor'); await p.keyboard.press('Tab'); console.log('after Tab in editor active', await p.evaluate(()=>document.activeElement.id)); await p.keyboard.press('Escape'); await p.keyboard.press('Tab'); console.log('after Esc+Tab', await p.evaluate(()=>document.activeElement.id));
  // live region
  console.log('aria-live regions', await p.evaluate(()=>[...document.querySelectorAll('[aria-live],[role=status],[role=alert]')].map(e=>e.id||e.className).join(',')));
  // print
  await p.goto(U+'#ders-tarih'); await p.waitForTimeout(500); await p.emulateMedia({media:'print'}); console.log('print: side visible', await p.evaluate(()=>getComputedStyle(document.querySelector('.side')).display), 'tabbar', await p.evaluate(()=>getComputedStyle(document.querySelector('#tabbar')).display));
  await p.emulateMedia({media:'screen'});
  // mobile
  const m=await b.newContext({viewport:{width:375,height:740}, isMobile:true}); const mp=await m.newPage(); await mp.route(/fonts/, rt=>rt.abort());
  for (const r of ['','#studyo','#dashboard-rfm','#formuller','#model']) { await mp.goto(U+r); await mp.waitForTimeout(900); console.log('mobile hscroll', r||'home', await mp.evaluate(()=>document.documentElement.scrollWidth - innerWidth)); }
  await b.close();
})();
