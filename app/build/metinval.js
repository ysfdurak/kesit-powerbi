/* Kesit Power BI ayarları: yazarın HTML'i ham basılan alanlar (RAW), kaçışlanan alanlar (ESC). Çalıştırma: NODE_PATH=$(npm root -g) node build/metinval.js */
const path=require('path'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
require('./metinval_core.js')({
  root:path.resolve(__dirname,'..'), wait:3000, dump:process.env.DUMP,
  RAW:['PBI_LESSONS[].ex[].q','PBI_LESSONS[].ex[].o[]','PBI_LESSONS[].ex[].why','PBI_LESSONS[].ex[].explain','PBI_PRACTICE[].q','PBI_EXAMS[].qs[].q','PBI_EXAMS[].qs[].why','PBI_EXAMS[].qs[].o[]','PBI_EXAMS[].qs[].items[]','PBI_EXAMS[].tasks[].q','PBI_AR_CH[].q','PBI_AR_DET[].steps[].q'],
  ESC:['PBI_LESSONS[].ex[].hint','PBI_PRACTICE[].hint','PBI_AR_CH[].hint','PBI_AR_PRED[].why'],
  async dom(p,scan){
    const go=async h=>{ await p.evaluate(x=>{location.hash=x},h); await sleep(120); };
    await go('#hatalar'); await p.evaluate(()=>document.querySelectorAll('#main details').forEach(d=>d.open=true)); await scan('#main','sik-hatalar');
    await go('#karis'); await scan('#main','karistirilanlar');
    const pr=await p.evaluate(()=>PBI_PRACTICE.filter((x,i)=>i%6===0).map(x=>x.id));
    for(const id of pr){ await go('#alistirma/'+id); const b=await p.$('[data-act="hint"],[data-act="ex-hint"]'); if(b){ await b.click(); await sleep(30); } await scan('#main .tip,#main .hints,#main .msg','pratik '+id); }
  }
});
