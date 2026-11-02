global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
global.ev = (e, f) => { try { return X.evalMeasure(Object.assign({},ms), e, f || []); } catch(err) { return 'ERR '+err.message.slice(0,100); } };
global.q = (e, t, c, n) => { try { const ch = X.check(e); if (ch) return 'CHECK '+ch; return X.query({ rows: [{t,c}], measures: Object.assign({},ms), values: [e], totals: true, keepBlank:true }).rows.slice(0, n||12).map(r => r.keys[0] + '=' + (typeof r.vals[0]==='number'?Math.round(r.vals[0]*100)/100:r.vals[0])).join(' | '); } catch(err) { return 'ERR '+err.message.slice(0,100); } };
global.M = PBI_MODEL;
const lines = require('fs').readFileSync(process.argv[2],'utf8').split('\n').filter(l=>l.trim());
for (const l of lines) { try { console.log(l.slice(0,90), '\n   =>', eval(l)); } catch(e){ console.log(l, 'JSERR', e.message); } }
