p='/home/claude/pbi/examui.js'; s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt, (s.count(a), a[:80]); s=s.replace(a,b)
rep("""function norm(x, ex) {
  const t = x.type || 'mc', q = { type: t, ex, k: x.k, s: x.s, id: x.id, q: fm(x.q), why: fm(x.why || '') };""",
"""/* Sınıf: 'sinav' (gerçek sınava benzer; denemelerde), 'alistirma' (öğretici ama sınav tarzı değil; yalnızca konu alıştırmasında), 'duzelt' (kullanılmaz) */
const clsOf = key => ((window.PBI_CERT_CLASS || {})[key] || ['sinav'])[0];
function norm(x, ex, key) {
  const t = x.type || 'mc', q = { type: t, ex, k: x.k, s: x.s, id: x.id, key: key || x.id, cls: clsOf(key || x.id), q: fm(x.q), why: fm(x.why || '') };""")
rep("const legacy = (arr, ex) => (arr || []).map((x, i) => Object.assign(norm(Object.assign({ type: 'mc' }, x), ex), { s: (TAGS[ex] || [])[i] }));",
"const legacy = (arr, ex) => (arr || []).map((x, i) => Object.assign(norm(Object.assign({ type: 'mc' }, x), ex, ex + '#' + i), { s: (TAGS[ex] || [])[i] }));")
rep("const casesOf = ex => (window.PBI_CASES || []).filter(c => c.ex === ex);",
"""const casesOf = ex => (window.PBI_CASES || []).filter(c => c.ex === ex).map(c => { const all = c.qs.concat((window.PBI_CASE_ADD || {})[c.id] || []); return Object.assign({}, c, { qs: all.map((q, i) => Object.assign(norm(q, ex, c.id + '#' + i), { caseRef: c.id })).filter(q => q.cls !== 'duzelt') }); });
const seriesOf = ex => (window.PBI_SERIES || []).filter(s => s.ex === ex).map(s => s.sols.map((so, j) => ({ type: 'serq', ex, k: s.k, s: s.s, id: s.id + '#' + j, key: s.id, cls: 'sinav', q: fm(s.q), t: fm(so.t), a: so.a, why: fm(so.why || ''), serRef: s.id, serN: s.sols.length, serI: j })));
const examPool = ex => certPool(ex).filter(q => q.cls === 'sinav');
const practicePool = (ex, pid) => certPool(ex).filter(q => q.cls !== 'duzelt').concat(pathMC(pid || ex));""")
rep("""qs: certPool('pl300').concat(pathMC('pl300')), n: 50, min: 100, pass: 70, withCase: true, path: 'pl300' },""",
"""qs: examPool('pl300'), n: 50, min: 100, pass: 70, layout: ['main', 'series', 'case'], path: 'pl300' },""")
rep("desc: 'Gerçek sınav biçiminde 50 soru ve 100 dakika: tek ve çoklu seçim, evet/hayır, sıralama, kodda boşluk doldurma ve sonda bir vaka çalışması. Alanlar resmî ağırlıklara göre seçilir.'",
"desc: 'Sınava girenlerin anlattığı düzende 50 soru, 100 dakika: ana bölüm, “aynı senaryo, farklı çözüm” evet/hayır serisi ve sonda vaka çalışması. Bölüm bitince geri dönülmez. Yalnızca sınav tarzındaki sorular.'")
rep("name: 'PL-300 kısa deneme', desc: 'Yalnızca sertifika havuzundan 20 soru, 40 dakika; vaka yok. Hızlı durum tespiti.', qs: certPool('pl300'),",
"name: 'PL-300 kısa deneme', desc: 'Sınav tarzındaki sorulardan 20 soru, 40 dakika; vaka ve seri yok. Hızlı durum tespiti.', qs: examPool('pl300'),")
rep("""qs: certPool('dp600').concat(pathMC('dp600')), n: 50, min: 100, pass: 70, withCase: true, path: 'dp600' },""",
"""qs: examPool('dp600'), n: 50, min: 100, pass: 70, layout: ['case', 'main', 'series'], path: 'dp600' },""")
rep("desc: 'Fabric Analytics Engineer: 50 soru, 100 dakika ve bir vaka çalışması. SQL, KQL ve DAX okuma; resmî ağırlıkta “Veriyi hazırla” %45–50.'",
"desc: 'Sınava girenlerin anlattığı düzende: başta geri dönülemeyen vaka, ana bölüm (T-SQL ağırlıklı, KQL ve DAX okuma), sonda evet/hayır serisi. 50 soru, 100 dakika.'")
rep("name: 'DP-600 kısa deneme', desc: 'Yalnızca sertifika havuzundan 20 soru, 40 dakika; vaka yok.', qs: certPool('dp600'),",
"name: 'DP-600 kısa deneme', desc: 'Sınav tarzındaki sorulardan 20 soru, 40 dakika; vaka ve seri yok.', qs: examPool('dp600'),")
rep("  { id: 'kod-a',", """  { id: 'pl300a', fam: 'certprac', cert: 'pl300', practice: true, short: 'PL-300', name: 'PL-300 konu alıştırması', desc: 'Süresiz; her sorudan sonra doğru cevap ve açıklama. Sınav tarzında olmayan ama öğretici sertifika soruları ve PL-300 patikasındaki ders soruları da burada.', qs: practicePool('pl300'), n: 20, min: 0, pass: 70 },
  { id: 'dp600a', fam: 'certprac', cert: 'dp600', practice: true, short: 'DP-600', name: 'DP-600 konu alıştırması', desc: 'Süresiz; her sorudan sonra açıklama. Sınav tarzında olmayan sertifika soruları ve DP-600 patikasındaki ders soruları dahil.', qs: practicePool('dp600'), n: 20, min: 0, pass: 70 },
  { id: 'kod-a',""")
rep("const isCert = e => e && e.fam === 'sertifika';","const isCert = e => e && e.fam === 'sertifika';\nconst isPrac = e => e && e.practice;")
rep("""  const qs = certPool(ex).filter(q => q.s === sid).concat(casesOf(ex).flatMap(c => c.qs.filter(q => q.s === sid).map(q => Object.assign(norm(q, ex), { caseRef: c.id }))));
  return { id: 'mad:' + sid, fam: 'sertifika', cert: ex, short: INFO[ex].code, name: INFO[ex].code + ' · ' + sk.t, desc: '', qs, n: qs.length, min: Math.max(4, qs.length * 2), pass: 70, adhoc: true };""",
"""  const qs = certPool(ex).filter(q => q.s === sid && q.cls !== 'duzelt').concat(casesOf(ex).flatMap(c => c.qs.filter(q => q.s === sid)), seriesOf(ex).flat().filter(q => q.s === sid));
  return { id: 'mad:' + sid, fam: 'certprac', cert: ex, practice: true, short: INFO[ex].code, name: INFO[ex].code + ' · ' + sk.t, desc: '', qs, n: qs.length, min: 0, pass: 70, adhoc: true };""")
rep("""function pickCert(e) {
  const info = INFO[e.cert]; const doms = info.domains; const mid = doms.map(d => (d[2] + d[3]) / 2); const tot = mid.reduce((a, b) => a + b, 0);
  let cs = null; if (e.withCase) { const all = casesOf(e.cert); if (all.length) cs = all[Math.floor(Math.random() * all.length)]; }
  const nMain = e.n - (cs ? cs.qs.length : 0);""",
"""function pickCert(e) {
  const info = INFO[e.cert]; const doms = info.domains; const mid = doms.map(d => (d[2] + d[3]) / 2); const tot = mid.reduce((a, b) => a + b, 0);
  const lay = e.layout || ['main'];
  let cs = null; if (lay.includes('case')) { const all = casesOf(e.cert); if (all.length) cs = all[Math.floor(Math.random() * all.length)]; }
  let ser = []; if (lay.includes('series')) { const all = seriesOf(e.cert); if (all.length) ser = all[Math.floor(Math.random() * all.length)]; }
  const nMain = e.n - (cs ? cs.qs.length : 0) - ser.length;""")
rep("""  const items = shuffle(picked).map(j => ({ x: e.qs[j] }));
  if (cs) cs.qs.forEach(q => items.push({ x: Object.assign(norm(q, e.cert), { caseRef: cs.id }) }));
  return { items, cs };
}""","""  const parts = { main: shuffle(picked).map(j => ({ x: e.qs[j] })), case: cs ? cs.qs.map(x => ({ x })) : [], series: ser.map(x => ({ x })) };
  let items = [], secs = [];
  lay.forEach(t => { const it = parts[t]; if (!it.length) return; secs.push({ type: t, a: items.length, b: items.length + it.length - 1 }); items = items.concat(it); });
  return { items, cs, secs };
}""")
rep("""    let items, cs = null;
    if (isCert(e) && !e.adhoc) ({ items, cs } = pickCert(e));
    else items = shuffle(e.qs).slice(0, Math.min(e.n, e.qs.length)).map(x => ({ x }));
    if (e.adhoc) { const ci = items.findIndex(it => it.x.caseRef); if (ci >= 0) cs = (window.PBI_CASES || []).find(c => c.id === items[ci].x.caseRef); items.sort((a, b) => (a.x.caseRef ? 1 : 0) - (b.x.caseRef ? 1 : 0)); }
    items.forEach(it => Object.assign(it, prep(it.x)));
    const caseStart = items.findIndex(it => it.x.caseRef);
    EX = { id, def: e, kind: 'mc', qs: items, ans: items.map(it => emptyAns(it.x)), flag: items.map(() => false), cur: 0, start: now, end: now + e.min * 60000, done: false, cs, caseStart, inCase: false, tab: 0 };""",
"""    let items, cs = null, secs = null;
    if (isCert(e) && !isPrac(e)) ({ items, cs, secs } = pickCert(e));
    else { items = shuffle(e.qs).slice(0, Math.min(e.n, e.qs.length)).map(x => ({ x })); items.sort((a, b) => (a.x.caseRef ? 1 : 0) - (b.x.caseRef ? 1 : 0) || (a.x.serRef ? 1 : 0) - (b.x.serRef ? 1 : 0)); }
    if (!secs) secs = [{ type: 'main', a: 0, b: items.length - 1 }];
    items.forEach(it => Object.assign(it, prep(it.x)));
    EX = { id, def: e, kind: 'mc', qs: items, ans: items.map(it => emptyAns(it.x)), flag: items.map(() => false), checked: items.map(() => false), cur: 0, start: now, end: e.min ? now + e.min * 60000 : Infinity, done: false, cs, secList: secs, sec: 0, tab: 0 };""")
rep("""const left = () => EX ? Math.max(0, Math.round((EX.end - Date.now()) / 1000)) : 0;
function runClock() {
  clearInterval(tick); if (!EX || EX.done) return;""","""const left = () => EX ? Math.max(0, Math.round((EX.end - Date.now()) / 1000)) : 0;
const secOf = i => EX.secList.findIndex(s => i >= s.a && i <= s.b);
const caseFor = x => x.caseRef ? (EX.cs && EX.cs.id === x.caseRef ? EX.cs : casesOf(x.ex).find(c => c.id === x.caseRef)) : null;
function runClock() {
  clearInterval(tick); if (!EX || EX.done || EX.end === Infinity) return;""")
rep("  if (x.type === 'hot') return x.slots.filter((s, i) => a[i] === s.a).length / x.slots.length;\n  return 0;",
"  if (x.type === 'hot') return x.slots.filter((s, i) => a[i] === s.a).length / x.slots.length;\n  if (x.type === 'serq') return a === x.a ? 1 : 0;\n  return 0;")
rep("const answered = (x, a) => x.type === 'mc' ? a !== null :","const answered = (x, a) => x.type === 'mc' || x.type === 'serq' ? a !== null :")
rep("const emptyAns = x => x.type === 'mc' ? null :","const emptyAns = x => x.type === 'mc' || x.type === 'serq' ? null :")
rep("if (isCert(e)) EX.qs.forEach((it, i) =>","if (isCert(e) || isPrac(e)) EX.qs.forEach((it, i) =>")
rep("const scoreTxt = (e, pct) => isCert(e) ? (pct * 10) + '/1000' : '%' + pct;","const scoreTxt = (e, pct) => isCert(e) && !isPrac(e) ? (pct * 10) + '/1000' : '%' + pct;")
rep("""<span>' + e.min + ' dk</span><span>Geçme ' + (isCert(e) ? '700/1000' : '%' + e.pass) + '</span><span>' + (e.kind === 'code' ? 'Havuz ' + e.tasks.length : 'Havuz ' + e.qs.length + (e.withCase ? ' + ' + casesOf(e.cert).length + ' vaka' : '')) + '</span>""",
"""<span>' + (e.min ? e.min + ' dk' : 'süresiz') + '</span>' + (isPrac(e) ? '<span>anında geri bildirim</span>' : '<span>Geçme ' + (isCert(e) ? '700/1000' : '%' + e.pass) + '</span>') + '<span>' + (e.kind === 'code' ? 'Havuz ' + e.tasks.length : 'Havuz ' + e.qs.length + ((e.layout || []).includes('case') ? ' + ' + casesOf(e.cert).length + ' vaka' : '') + ((e.layout || []).includes('series') ? ' + ' + seriesOf(e.cert).length + ' seri' : '')) + '</span>""")
rep("""  const pool = certPool(ex).concat(casesOf(ex).flatMap(c => c.qs.map(q => ({ s: q.s, type: q.type || 'mc' }))));
  const cnt = {}, types = {}; pool.forEach(q => { if (!q.s) return; cnt[q.s] = (cnt[q.s] || 0) + 1; types[q.type] = (types[q.type] || 0) + 1; });
  const TN = { mc: 'tek seçim', multi: 'çoklu seçim', yesno: 'evet/hayır', order: 'sıralama', hot: 'kodda boşluk' };""",
"""  const pool = certPool(ex).filter(q => q.cls !== 'duzelt').concat(casesOf(ex).flatMap(c => c.qs), seriesOf(ex).flat());
  const cnt = {}, cntS = {}, types = {}; pool.forEach(q => { if (!q.s) return; cnt[q.s] = (cnt[q.s] || 0) + 1; if (q.cls === 'sinav') cntS[q.s] = (cntS[q.s] || 0) + 1; types[q.type] = (types[q.type] || 0) + 1; });
  const nS = pool.filter(q => q.cls === 'sinav').length;
  const TN = { mc: 'tek seçim', multi: 'çoklu seçim', yesno: 'evet/hayır', order: 'sıralama', hot: 'kodda boşluk', serq: 'seri sorusu' };""")
rep("""<span><b>' + pool.length + '</b> soru</span>""","""<span><b>' + pool.length + '</b> soru (' + nS + ' sınav tarzı, ' + (pool.length - nS) + ' alıştırma)</span>""")
rep("""<td class="nc">' + (cnt[s.id] || 0) + ' soru</td>""","""<td class="nc">' + (cnt[s.id] || 0) + ' soru' + (cnt[s.id] && cntS[s.id] !== cnt[s.id] ? '<small class="muted"> · ' + (cntS[s.id] || 0) + ' sınavda</small>' : '') + '</td>""")
rep("Her sertifika sorusu bir maddeye bağlı; sınavlardaki başarın madde bazında burada birikir.","Her soru bir maddeye bağlı. Denemelerde yalnızca sınav tarzındaki sorular çıkar; diğerleri “Çalış” ile açılan konu alıştırmasındadır.")
rep("""['sertifika', 'Sertifika denemeleri', 'Microsoft PL-300 ve DP-600 sınavlarının resmî maddelerine göre yazılmış sorular ve vaka çalışmaları. Gerçek sınav soruları değildir; konu dağılımı, soru biçimleri ve puanlama benzerdir.'],""",
"""['sertifika', 'Sertifika denemeleri', 'Resmî maddelere göre yazılmış özgün sorular; bölüm düzeni, soru biçimleri ve puanlama sınava girenlerin anlattıklarına göre kuruldu. Gerçek sınav soruları değildir.'], ['certprac', 'Sertifika konu alıştırmaları', 'Sınav tarzında olmayan ama konuyu öğreten sorular ve ders soruları. Süre yok; her sorudan sonra doğru cevabı ve açıklamayı görürsün.'],""")
open(p,'w').write(s); print('ok')
