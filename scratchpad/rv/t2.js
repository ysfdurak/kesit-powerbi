const C=require('./common.js');
(async()=>{const {b,p,errs}=await C.open();
p.on('requestfailed',r=>console.log('FAILED',r.url()));
await p.goto('http://localhost:8765/index.html');
const items=await p.$$eval('#nav [data-go], nav button, nav a',els=>els.map(e=>e.outerHTML.slice(0,160)));
console.log(items.slice(0,40).join('\n'));
console.log(errs);await b.close();})();
