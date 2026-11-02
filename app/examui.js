/* Kesit Power BI — Deneme sınavları: seviye (A/B/C), PL-300 ve DP-600 (gerçek sınav biçimleri: tek ve çoklu seçim, evet/hayır, sıralama,
   kodda açılır liste, vaka çalışması; 1000 üzerinden puan), DAX kodlama, mülakat simülasyonu, kapsam haritası ve sınav günü rehberi. */
(function () {
'use strict';
const C = window.PBI_CORE, esc = C.esc, $ = C.$, P = C.P;
P.exams = P.exams || {}; P.skillStat = P.skillStat || {};
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmtT = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
/* Düz metin + `kod` → HTML */
const fm = s => esc(String(s == null ? '' : s)).replace(/`([^`]+)`/g, '<code>$1</code>');
const fmBlock = s => String(s || '').split(/\n/).map(line => /^\s*-\s+/.test(line) ? '<li>' + fm(line.replace(/^\s*-\s+/, '')) + '</li>' : line.trim() ? '<p>' + fm(line) + '</p>' : '').join('').replace(/(<li>.*?<\/li>)+/g, m => '<ul>' + m + '</ul>');
const INFO = window.PBI_CERT_INFO || {}, SKILLS = window.PBI_CERT_SKILLS || {}, TAGS = window.PBI_CERT_TAGS || {};
const SKMAP = {}; Object.values(SKILLS).forEach(a => a.forEach(s => SKMAP[s.id] = s));

/* ---------- Soru havuzları ---------- */
const lessonMC = lvs => C.LESSONS.filter(l => lvs.includes(l.lvl)).flatMap(l => (l.ex || []).filter(e => e.t === 'mc' && !e.thumbs).map(e => ({ type: 'mc', k: l.mod || l.title, q: e.q, o: e.o, a: e.a, why: e.why || '', src: l.title })));
const testMC = lvs => (window.PBI_PLACEMENT || []).filter(q => lvs.includes(q.lv)).map(q => ({ type: 'mc', k: 'Seviye testi', q: esc(q.q), o: q.o.map(esc), a: q.a, why: q.why || '' }));
const DOM = {
  pl300: { 'Başlangıç': 'Görselleştir ve analiz et', 'Veri Hazırlama': 'Veriyi hazırla', 'Veri Modelleme': 'Modelle', 'DAX Temelleri': 'Modelle', 'DAX Bağlamları': 'Modelle', 'Zaman Zekâsı': 'Modelle', 'DAX Kalıpları': 'Modelle', 'İleri DAX': 'Modelle', 'İleri Modelleme': 'Modelle', 'Uzman DAX': 'Modelle', 'Müşteri Analitiği': 'Modelle', 'Görselleştirme': 'Görselleştir ve analiz et', 'Analiz': 'Görselleştir ve analiz et', 'Yönetim ve Güvenlik': 'Yönet ve güvenli hâle getir', 'Sınav Hazırlığı': 'Yönet ve güvenli hâle getir', 'Bitirme': 'Görselleştir ve analiz et', 'Yapay Zekâ': 'Görselleştir ve analiz et', 'Vaka Çalışmaları': 'Görselleştir ve analiz et', 'Fabric': 'Yönet ve güvenli hâle getir' },
  dp600: { 'Veri Hazırlama': 'Veriyi hazırla', 'Yönetim ve Güvenlik': 'Analitik çözümü yönet', 'Sınav Hazırlığı': 'Analitik çözümü yönet', 'Bitirme': 'Analitik çözümü yönet', 'Fabric': 'Analitik çözümü yönet' }
};
const pathMC = pid => { const p = (window.PBI_PATHS || []).find(x => x.id === pid); const dm = DOM[pid] || {}; return p ? C.LESSONS.filter(l => p.lessons.includes(l.id)).flatMap(l => (l.ex || []).filter(e => e.t === 'mc' && !e.thumbs).map(e => ({ type: 'mc', k: dm[l.mod] || (pid === 'dp600' ? 'Anlam modelini uygula' : l.mod || l.title), q: e.q, o: e.o, a: e.a, why: e.why || '', src: l.title, fromLesson: true }))) : []; };
/* Sertifika sorularını tek biçime getir */
/* Sınıf: 'sinav' (gerçek sınava benzer; denemelerde), 'alistirma' (öğretici ama sınav tarzı değil; yalnızca konu alıştırmasında), 'duzelt' (kullanılmaz) */
const clsOf = key => ((window.PBI_CERT_CLASS || {})[key] || ['sinav'])[0];
function norm(x, ex, key) {
  const t = x.type || 'mc', q = { type: t, ex, k: x.k, s: x.s, id: x.id, key: key || x.id, cls: clsOf(key || x.id), q: fm(x.q), why: fm(x.why || '') };
  if (t === 'mc' || t === 'multi') { q.o = x.o.map(fm); q.a = x.a; }
  if (t === 'yesno') q.st = x.st.map(s => ({ t: fm(s.t), a: s.a }));
  if (t === 'order') { q.items = x.items.map(fm); q.extra = (x.extra || []).map(fm); }
  if (t === 'hot') { q.code = x.code; q.slots = x.slots; }
  if (t === 'click') { q.ui = x.ui; q.start = x.start; q.a = x.a; }
  return q;
}
const legacy = (arr, ex) => (arr || []).map((x, i) => Object.assign(norm(Object.assign({ type: 'mc' }, x), ex, ex + '#' + i), { s: (TAGS[ex] || [])[i] }));
const certPool = ex => legacy(ex === 'pl300' ? window.PBI_PL300 : window.PBI_DP600, ex).concat((window.PBI_CERTQ || []).filter(x => x.ex === ex).map(x => norm(x, ex)));
const casesOf = ex => (window.PBI_CASES || []).filter(c => c.ex === ex).map(c => { const all = c.qs.concat((window.PBI_CASE_ADD || {})[c.id] || []); return Object.assign({}, c, { qs: all.map((q, i) => Object.assign(norm(q, ex, c.id + '#' + i), { caseRef: c.id })).filter(q => q.cls !== 'duzelt') }); });
const seriesOf = ex => (window.PBI_SERIES || []).filter(s => s.ex === ex).map(s => s.sols.map((so, j) => ({ type: 'serq', ex, k: s.k, s: s.s, id: s.id + '#' + j, key: s.id, cls: 'sinav', q: fm(s.q), t: fm(so.t), a: so.a, why: fm(so.why || ''), serRef: s.id, serN: s.sols.length, serI: j })));
const examPool = ex => certPool(ex).filter(q => q.cls === 'sinav');
const practicePool = (ex, pid) => certPool(ex).filter(q => q.cls !== 'duzelt').concat(pathMC(pid || ex));
const CP = window.PBI_CODEPOOL || [], IV = window.PBI_INTERVIEW || [];
const EXAMS = [
  { id: 'sv-a', fam: 'seviye', short: 'Temel', name: 'Seviye bitirme sınavı: Temel', desc: 'Arayüz, veri alma, Power Query temelleri, model ve ilk ölçüler.', qs: lessonMC(['temel']).concat(testMC(['temel'])), n: 20, min: 25, pass: 70 },
  { id: 'sv-b', fam: 'seviye', short: 'Orta', name: 'Seviye bitirme sınavı: Orta', desc: 'Bağlam, CALCULATE, zaman zekâsı, pay ve sıralama, etkileşim ve hikâye.', qs: lessonMC(['orta']).concat(testMC(['orta'])), n: 20, min: 25, pass: 70 },
  { id: 'sv-c', fam: 'seviye', short: 'İleri', name: 'Seviye bitirme sınavı: İleri', desc: 'Bağlam geçişi, tablo ve pencere fonksiyonları, performans, güvenlik, kurumsal model.', qs: lessonMC(['ileri']).concat(testMC(['ileri'])), n: 20, min: 30, pass: 70 },
  { id: 'pl300', fam: 'sertifika', cert: 'pl300', short: 'PL-300', name: 'PL-300 tam deneme', desc: 'Sınava girenlerin anlattığı düzende 50 soru, 100 dakika: ana bölüm, “aynı senaryo, farklı çözüm” evet/hayır serisi ve sonda vaka çalışması. Bölüm bitince geri dönülmez. Yalnızca sınav tarzındaki sorular.', qs: examPool('pl300'), n: 50, min: 100, pass: 70, layout: ['main', 'series', 'case'], path: 'pl300' },
  { id: 'pl300k', fam: 'sertifika', cert: 'pl300', short: 'PL-300', name: 'PL-300 kısa deneme', desc: 'Sınav tarzındaki sorulardan 20 soru, 40 dakika; vaka ve seri yok. Hızlı durum tespiti.', qs: examPool('pl300'), n: 20, min: 40, pass: 70, path: 'pl300' },
  { id: 'dp600', fam: 'sertifika', cert: 'dp600', short: 'DP-600', name: 'DP-600 tam deneme', desc: 'Sınava girenlerin anlattığı düzende: başta geri dönülemeyen vaka, ana bölüm (T-SQL ağırlıklı, KQL ve DAX okuma), sonda evet/hayır serisi. 50 soru, 100 dakika.', qs: examPool('dp600'), n: 50, min: 100, pass: 70, layout: ['case', 'main', 'series'], path: 'dp600' },
  { id: 'dp600k', fam: 'sertifika', cert: 'dp600', short: 'DP-600', name: 'DP-600 kısa deneme', desc: 'Sınav tarzındaki sorulardan 20 soru, 40 dakika; vaka ve seri yok.', qs: examPool('dp600'), n: 20, min: 40, pass: 70, path: 'dp600' },
  { id: 'pl300a', fam: 'certprac', cert: 'pl300', practice: true, short: 'PL-300', name: 'PL-300 konu alıştırması', desc: 'Süresiz; her sorudan sonra doğru cevap ve açıklama. Sınav tarzında olmayan ama öğretici sertifika soruları ve PL-300 yolundaki ders soruları da burada.', qs: practicePool('pl300'), n: 20, min: 0, pass: 70 },
  { id: 'dp600a', fam: 'certprac', cert: 'dp600', practice: true, short: 'DP-600', name: 'DP-600 konu alıştırması', desc: 'Süresiz; her sorudan sonra açıklama. Sınav tarzında olmayan sertifika soruları ve DP-600 yolundaki ders soruları dahil.', qs: practicePool('dp600'), n: 20, min: 0, pass: 70 },
  { id: 'kod-a', fam: 'kod', kind: 'code', short: 'Kodlama: Temel', name: 'DAX kodlama sınavı: temel', desc: '4 ölçü, 25 dakika. Toplama, CALCULATE ile basit filtre, DIVIDE.', tasks: CP.filter(t => t.L === 'temel'), n: 4, min: 25, pass: 75 },
  { id: 'kod-b', fam: 'kod', kind: 'code', short: 'Kodlama: Orta', name: 'DAX kodlama sınavı: orta', desc: '4 ölçü, 35 dakika. Pay, sıralama, zaman zekâsı, metin döndüren ölçüler.', tasks: CP.filter(t => t.L === 'orta'), n: 4, min: 35, pass: 75 },
  { id: 'kod-c', fam: 'kod', kind: 'code', short: 'Kodlama: İleri', name: 'DAX kodlama sınavı: ileri', desc: '3 ölçü ya da sorgu, 45 dakika. Bağlam geçişi, tablo değişkenleri, kümeler.', tasks: CP.filter(t => t.L === 'ileri'), n: 3, min: 45, pass: 66 },
  { id: 'mulakat', fam: 'mulakat', kind: 'code', short: 'Mülakat', name: 'Teknik mülakat simülasyonu', desc: 'Gerçek bir BI mülakatı gibi 4 klasik DAX sorusu ve 45 dakika. Her doğru çözümden sonra mülakatçının takip sorusu açılır.', tasks: IV, n: 4, min: 45, pass: 75 }
];
const EXMAP = {}; EXAMS.forEach(e => EXMAP[e.id] = e);
window.PBI_EXAMS = EXAMS;
const isCert = e => e && e.fam === 'sertifika';
const isPrac = e => e && e.practice;
/* Madde çalışması: kapsam haritasından tek bir maddenin bütün soruları (süre: soru başına 2 dk) */
function skillExam(sid) {
  const sk = SKMAP[sid]; if (!sk) return null; const ex = sid.startsWith('pl-') ? 'pl300' : 'dp600';
  const qs = certPool(ex).filter(q => q.s === sid && q.cls !== 'duzelt').concat(casesOf(ex).flatMap(c => c.qs.filter(q => q.s === sid)), seriesOf(ex).flat().filter(q => q.s === sid));
  return { id: 'mad:' + sid, fam: 'certprac', cert: ex, practice: true, short: INFO[ex].code, name: INFO[ex].code + ' · ' + sk.t, desc: '', qs, n: qs.length, min: 0, pass: 70, adhoc: true };
}
const exDef = id => EXMAP[id] || (EX && EX.def && EX.def.id === id ? EX.def : null);

/* ---------- Durum ---------- */
let EX = null, tick = null;
function prep(x) { /* deneme başına karıştırma */
  if (x.type === 'mc' || x.type === 'multi') return { ord: shuffle(x.o.map((_, j) => j)) };
  if (x.type === 'order') return { pool: shuffle(x.items.map((_, j) => 'i' + j).concat(x.extra.map((_, j) => 'x' + j))) };
  return {};
}
const emptyAns = x => x.type === 'click' ? { tab: x.start, pick: null } : x.type === 'mc' || x.type === 'serq' ? null : x.type === 'multi' ? [] : x.type === 'yesno' ? x.st.map(() => null) : x.type === 'order' ? [] : x.type === 'hot' ? x.slots.map(() => null) : null;
function pickCert(e) {
  const info = INFO[e.cert]; const doms = info.domains; const mid = doms.map(d => (d[2] + d[3]) / 2); const tot = mid.reduce((a, b) => a + b, 0);
  const lay = e.layout || ['main'];
  let cs = null; if (lay.includes('case')) { const all = casesOf(e.cert); if (all.length) cs = all[Math.floor(Math.random() * all.length)]; }
  let ser = []; if (lay.includes('series')) { const all = seriesOf(e.cert); if (all.length) ser = all[Math.floor(Math.random() * all.length)]; }
  const nMain = e.n - (cs ? cs.qs.length : 0) - ser.length;
  const want = mid.map(m => Math.round(nMain * m / tot)); let diff = nMain - want.reduce((a, b) => a + b, 0); want[1] += diff;
  let picked = [];
  doms.forEach((d, i) => { const pool = e.qs.map((x, j) => j).filter(j => e.qs[j].k === d[0]); const cert = shuffle(pool.filter(j => !e.qs[j].fromLesson)), les = shuffle(pool.filter(j => e.qs[j].fromLesson)); picked = picked.concat(cert.concat(les).slice(0, want[i])); });
  if (picked.length < nMain) picked = picked.concat(shuffle(e.qs.map((x, j) => j).filter(j => !picked.includes(j))).slice(0, nMain - picked.length));
  const parts = { main: shuffle(picked).map(j => ({ x: e.qs[j] })), case: cs ? cs.qs.map(x => ({ x })) : [], series: ser.map(x => ({ x })) };
  let items = [], secs = [];
  lay.forEach(t => { const it = parts[t]; if (!it.length) return; secs.push({ type: t, a: items.length, b: items.length + it.length - 1 }); items = items.concat(it); });
  return { items, cs, secs };
}
function start(id) {
  const e = EXMAP[id] || (id.startsWith('mad:') ? skillExam(id.slice(4)) : null); if (!e) return;
  if (e.kind !== 'code' && !e.qs.length) { C.toast('Bu madde için henüz soru yok'); return; }
  const now = Date.now();
  if (e.kind === 'code') { const tasks = shuffle(e.tasks).slice(0, Math.min(e.n, e.tasks.length)); EX = { id, def: e, kind: 'code', tasks, ok: tasks.map(() => false), tries: tasks.map(() => 0), cur: 0, run: now.toString(36), start: now, end: now + e.min * 60000, done: false }; }
  else {
    let items, cs = null, secs = null;
    if (isCert(e) && !isPrac(e)) ({ items, cs, secs } = pickCert(e));
    else { items = shuffle(e.qs).slice(0, Math.min(e.n, e.qs.length)).map(x => ({ x })); items.sort((a, b) => (a.x.caseRef ? 1 : 0) - (b.x.caseRef ? 1 : 0) || (a.x.serRef ? 1 : 0) - (b.x.serRef ? 1 : 0)); }
    if (!secs) secs = [{ type: 'main', a: 0, b: items.length - 1 }];
    items.forEach(it => Object.assign(it, prep(it.x)));
    EX = { id, def: e, kind: 'mc', qs: items, ans: items.map(it => emptyAns(it.x)), flag: items.map(() => false), checked: items.map(() => false), cur: 0, start: now, end: e.min ? now + e.min * 60000 : Infinity, done: false, cs, secList: secs, sec: 0, tab: 0 };
  }
  C.go('sinav'); window.scrollTo(0, 0);
}
const left = () => EX ? Math.max(0, Math.round((EX.end - Date.now()) / 1000)) : 0;
const secOf = i => EX.secList.findIndex(s => i >= s.a && i <= s.b);
const caseFor = x => x.caseRef ? (EX.cs && EX.cs.id === x.caseRef ? EX.cs : casesOf(x.ex).find(c => c.id === x.caseRef)) : null;
function runClock() {
  clearInterval(tick); if (!EX || EX.done || EX.end === Infinity) return;
  tick = setInterval(() => { if (!EX || EX.done || C.state().view !== 'sinav') { clearInterval(tick); return; } const s = left(); const el = $('#exClock'); if (el) { el.textContent = fmtT(s); el.classList.toggle('late', s < 120); } if (s <= 0) finish(); }, 1000);
}
/* Puanlama: her soru 0–1 puan; çoklu seçim, evet/hayır ve kod boşluklarında kısmi puan (Microsoft'ta da çoğu kısmi puanlanır) */
function points(x, a) {
  if (x.type === 'mc') return a === x.a ? 1 : 0;
  if (x.type === 'multi') { const ok = a.filter(i => x.a.includes(i)).length, wr = a.length - ok; return Math.max(0, (ok - wr) / x.a.length); }
  if (x.type === 'yesno') return x.st.filter((s, i) => a[i] === s.a).length / x.st.length;
  if (x.type === 'order') return a.length === x.items.length && a.every((k, i) => k === 'i' + i) ? 1 : 0;
  if (x.type === 'hot') return x.slots.filter((s, i) => a[i] === s.a).length / x.slots.length;
  if (x.type === 'serq') return a === x.a ? 1 : 0;
  if (x.type === 'click') return String(x.a).split('||').includes(a.pick) ? 1 : 0;
  return 0;
}
const answered = (x, a) => x.type === 'click' ? a.pick !== null : x.type === 'mc' || x.type === 'serq' ? a !== null : x.type === 'yesno' || x.type === 'hot' ? a.every(v => v !== null) : a.length > 0;
function finish() {
  if (!EX || EX.done) return; const e = EX.def;
  if (EX.kind === 'code') { const ok = EX.ok.filter(Boolean).length; EX.score = Math.round(ok / EX.tasks.length * 100); EX.okN = ok; Object.keys(P.drafts).forEach(k => { if (k.startsWith('ex:' + EX.run)) delete P.drafts[k]; }); C.addXP(ok * 15); }
  else {
    EX.pts = EX.qs.map((it, i) => points(it.x, EX.ans[i])); const sum = EX.pts.reduce((a, b) => a + b, 0);
    EX.score = Math.round(sum / EX.qs.length * 100); EX.okN = EX.pts.filter(p => p === 1).length; EX.scaled = Math.round(sum / EX.qs.length * 1000); C.addXP(Math.round(sum * 2));
    if (isCert(e) || isPrac(e)) EX.qs.forEach((it, i) => { const s = it.x.s; if (!s) return; const r = P.skillStat[s] = P.skillStat[s] || { n: 0, p: 0 }; r.n++; r.p = Math.round((r.p + EX.pts[i]) * 100) / 100; });
  }
  EX.done = true; setTimeout(persistEx, 0); EX.secs = Math.round((Math.min(Date.now(), EX.end) - EX.start) / 1000);
  if (!e.adhoc) { const r = P.exams[EX.id] || { best: 0, n: 0 }; r.best = Math.max(r.best, EX.score); r.last = EX.score; r.n++; r.date = C.today(); P.exams[EX.id] = r; }
  C.save(); clearInterval(tick); C.render(); window.scrollTo(0, 0);
}

/* ---------- Ana sayfa: kartlar, kapsam haritası, sınav günü rehberi ---------- */
const scoreTxt = (e, pct) => isCert(e) && !isPrac(e) ? (pct * 10) + '/1000' : '%' + pct;
function card(e) {
  const r = P.exams[e.id];
  return '<div class="panel excard"><div class="row" style="justify-content:space-between;gap:8px"><span class="chip' + (e.kind === 'code' ? ' dx' : '') + '">' + esc(e.short) + '</span>' + (r ? '<span class="pill ' + (r.best >= e.pass ? 'p-ok' : 'p-bad') + '">En iyi ' + scoreTxt(e, r.best) + '</span>' : '') + '</div><h3>' + esc(e.name) + '</h3><p class="muted">' + esc(e.desc) + '</p><div class="exmeta"><span>' + (e.kind === 'code' ? e.n + ' görev' : e.n + ' soru') + '</span><span>' + (e.min ? e.min + ' dk' : 'süresiz') + '</span>' + (isPrac(e) ? '<span>anında geri bildirim</span>' : '<span>Geçme ' + (isCert(e) ? '700/1000' : '%' + e.pass) + '</span>') + '<span>' + (e.kind === 'code' ? 'Havuz ' + e.tasks.length : 'Havuz ' + e.qs.length + ((e.layout || []).includes('case') ? ' + ' + casesOf(e.cert).length + ' vaka' : '') + ((e.layout || []).includes('series') ? ' + ' + seriesOf(e.cert).length + ' seri' : '')) + '</span></div><button class="btn pri" data-exstart="' + e.id + '">' + (r ? 'Yeniden başla' : 'Başla') + '</button></div>';
}
let COVX = 'pl300';
function coverage() {
  const ex = COVX, info = INFO[ex], sk = SKILLS[ex] || []; if (!info) return '';
  const pool = certPool(ex).filter(q => q.cls !== 'duzelt').concat(casesOf(ex).flatMap(c => c.qs), seriesOf(ex).flat());
  const cnt = {}, cntS = {}, types = {}; pool.forEach(q => { if (!q.s) return; cnt[q.s] = (cnt[q.s] || 0) + 1; if (q.cls === 'sinav') cntS[q.s] = (cntS[q.s] || 0) + 1; types[q.type] = (types[q.type] || 0) + 1; });
  const nS = pool.filter(q => q.cls === 'sinav').length;
  const TN = { mc: 'tek seçim', multi: 'çoklu seçim', yesno: 'evet/hayır', order: 'sıralama', hot: 'kodda boşluk', serq: 'seri sorusu', click: 'arayüz tıklama' };
  let h = '<section class="lvl-block" id="kapsam"><div class="sec-head"><div><span class="eyebrow">Kapsam haritası</span><h2>Resmî sınav maddeleri, dersler ve soru havuzu</h2><span class="muted" style="font-size:.86rem">Microsoft Learn çalışma kılavuzu, ' + esc(info.asOf) + ' sürümü. Her soru bir maddeye bağlı. Denemelerde yalnızca sınav tarzındaki sorular çıkar; diğerleri “Çalış” ile açılan konu alıştırmasındadır.</span></div><div class="filters">' + ['pl300', 'dp600'].map(x => '<button data-covx="' + x + '" aria-pressed="' + (x === ex) + '">' + INFO[x].code + '</button>').join('') + '</div></div>';
  h += '<div class="panel cov-sum"><span><b>' + pool.length + '</b> soru (' + nS + ' sınav tarzı, ' + (pool.length - nS) + ' alıştırma)</span>' + Object.entries(types).map(([t, n]) => '<span>' + n + ' ' + TN[t] + '</span>').join('') + '<span>' + casesOf(ex).length + ' vaka</span><span><b>' + sk.filter(s => cnt[s.id]).length + '/' + sk.length + '</b> madde kapsanıyor</span><a href="' + info.url + '" target="_blank" rel="noopener">Resmî kılavuz ↗</a></div>';
  info.domains.forEach(([d, en, lo, hi]) => {
    const items = sk.filter(s => s.d === d); const dq = items.reduce((a, s) => a + (cnt[s.id] || 0), 0);
    h += '<div class="panel cov-dom"><div class="cov-head"><div><b>' + esc(d) + '</b><small>' + esc(en) + '</small></div><span class="chip">Sınavda %' + lo + '–' + hi + '</span><span class="chip">Havuzda %' + Math.round(dq / pool.length * 100) + '</span></div><table class="cov-t"><tbody>';
    let g0 = '';
    items.forEach(s => { const st = P.skillStat[s.id]; const pc = st && st.n ? Math.round(st.p / st.n * 100) : null;
      if (s.g !== g0) { g0 = s.g; h += '<tr class="cov-g"><td colspan="4">' + esc(s.g) + '</td></tr>'; }
      const les = (window.PBI_SKILL_LESSON || {})[s.id] || []; h += '<tr><td><span>' + esc(s.t) + '</span><small>' + esc(s.en) + '</small>' + (les.length ? '<span class="cov-les">' + les.filter(id => C.LMAP[id]).map(id => '<button class="lnk" data-lesson="' + id + '" data-ctx="' + ex + '">' + esc(C.LMAP[id].title) + (P.done[id] ? ' ✓' : '') + '</button>').join(' · ') + '</span>' : '') + '</td><td class="nc">' + (cnt[s.id] || 0) + ' soru' + (cnt[s.id] && cntS[s.id] !== cnt[s.id] ? '<small class="muted"> · ' + (cntS[s.id] || 0) + ' sınavda</small>' : '') + '</td><td class="nc">' + (pc === null ? '<span class="muted">—</span>' : '<span class="pill ' + (pc >= 70 ? 'p-ok' : 'p-bad') + '">%' + pc + '</span>') + '</td><td class="nc">' + (cnt[s.id] ? '<button class="btn sm ghost" data-exstart="mad:' + s.id + '">Çalış</button>' : '') + '</td></tr>'; });
    h += '</tbody></table></div>';
  });
  return h + '</section>';
}
const GUIDE = [
  ['Sınava girenlerin anlattıkları', 'PL-300: 40–60 soru (çoğu raporda 50–55), sonda 6–8 soruluk bir vaka; en çok zorlayanlar “bunu hangi adımlarla, nerede yaparsın” soruları, DAX’ta filtre bağlamı ve hata ayıklama, çalışma alanı, paylaşım ve izinler. DP-600: vaka çoğunlukla başta ve geri dönülemez; sonda “aynı senaryo, farklı çözüm” evet/hayır serisi; T-SQL en sık ağırlıklı konu, KQL ve PySpark daha az, bazı adaylarda Tabular Editor ve DAX Studio gibi harici araçlar. İkisinde de en sık şikâyet zaman baskısı ve soruların küçük koşullara (“en az yönetim çabası”, “en az ayrıcalık”) dayanması. Microsoft’un ücretsiz deneme değerlendirmesi biçimi tanıtır ama gerçek sınav daha zordur. Bu bilgiler 2024–2026 arası paylaşılan deneyimlerden derlendi; sınav sürekli güncellenir.'],
  ['“Dump” sitelerinden uzak dur', 'Gerçek sınav sorularını paylaşan siteler Microsoft sınav sözleşmesini ihlal eder; sertifikanın iptaline yol açabilir. Sınava girenler bu sitelerdeki cevapların sık sık yanlış olduğunu da bildiriyor. Bu uygulamadaki bütün sorular özgündür.'],
  ['Puanlama', 'Sonuç 1–1000 arası ölçeklenmiş bir puandır; geçme puanı 700’dür. Bu bir yüzde değildir: soruların ağırlığı farklı olabilir. Yanlış cevap eksi puan getirmez, bu yüzden hiçbir soruyu boş bırakma.'],
  ['Soru tipleri', 'Tek ve çoklu seçim (kaç seçenek işaretleneceği yazar), aynı senaryonun farklı çözümlerle tekrarlandığı evet/hayır serileri, adımları sıraya dizme, kod ya da ekran görüntüsü içinde açılır listeden seçme ve vaka çalışmaları. Biçimleri sınavdan önce Microsoft’un sınav demosunda (aka.ms/examdemo) dene.'],
  ['Geri dönülemeyen bölümler', 'Vaka çalışmasına girdiğinde önceki sorulara dönemezsin; vakanın kendi soruları arasında gezinebilirsin, bölümü bitirince ona da dönemezsin. Aynı senaryonun tekrarlandığı evet/hayır serilerinde de geri dönülemez. Bu yüzden bu bölümlere girmeden önce işaretlediğin sorulara bak.'],
  ['Süre', 'Süre ve soru sayısı sınava ve döneme göre değişir; güncel bilgi sınav sayfasında yazar. Bu uygulamadaki tam denemeler 50 soru ve 100 dakikadır. Vaka bölümüne 20–25 dakika ayır.'],
  ['Microsoft Learn erişimi', 'Rol tabanlı sınavlarda sınav sırasında Microsoft Learn’e erişim açıktır, ancak süre durmaz. Yalnızca birkaç ayrıntı sorusunda kullan; konuyu orada öğrenmeye çalışmak zaman kaybettirir.'],
  ['Dil', 'Sınav İngilizce güncellenir, yerelleştirilmiş sürümler birkaç hafta geride kalabilir. Sınavı kendi dilinde alamıyorsan ek 30 dakika talep edebilirsin. Terimleri İngilizce de tanı: aşağıdaki terim kartları bunun için.'],
  ['Önizleme özellikleri', 'Sorular çoğunlukla genel kullanıma açık (GA) özellikleri kapsar; yaygın kullanılan bazı önizleme özellikleri de çıkabilir.'],
  ['Yenileme', 'Sertifika bir yıl geçerlidir. Bitişten önceki altı ay içinde Microsoft Learn’de ücretsiz, çevrim içi yenileme değerlendirmesiyle uzatılır.'],
  ['Son hafta planı', 'Resmî ücretsiz deneme değerlendirmesini (Practice Assessment) çöz, kapsam haritasında %70’in altındaki maddeleri “Çalış” ile tekrarla, bir tam deneme yap ve vaka bölümünde süre tut.']
];
let TERMI = 0, TERMOPEN = false, TERMQ = '';
function guide() {
  const T = window.PBI_EN_TERMS || [];
  let h = '<section class="lvl-block" id="sinavgunu"><div class="sec-head"><div><span class="eyebrow">Hazırlık</span><h2>Sınav günü rehberi</h2></div></div><div class="panel guide-list">' + GUIDE.map(([t, d]) => '<details><summary>' + esc(t) + '</summary><p>' + esc(d) + '</p></details>').join('') + '</div>';
  if (T.length) {
    const c = T[TERMI % T.length];
    h += '<div class="term-grid"><div class="panel term-card"><span class="eyebrow">İngilizce terim kartı ' + ((TERMI % T.length) + 1) + ' / ' + T.length + '</span><b class="term-tr">' + esc(c[0]) + '</b>' + (TERMOPEN ? '<b class="term-en">' + esc(c[1]) + '</b>' + (c[2] ? '<small>' + esc(c[2]) + '</small>' : '') : '<button class="btn sm" data-term="open">İngilizcesini göster</button>') + '<div class="row"><button class="btn sm ghost" data-term="prev">Önceki</button><button class="btn sm pri" data-term="next">Sonraki</button><button class="btn sm ghost" data-term="rand">Karışık</button></div></div>';
    const q = trFold(TERMQ); const list = T.filter(t => !q || trFold(t[0] + ' ' + t[1]).includes(q));
    h += '<div class="panel term-list"><input class="input" id="termQ" placeholder="Terim ara (Türkçe ya da İngilizce)" value="' + esc(TERMQ) + '" aria-label="Terim ara"><div class="term-rows" id="termRows">' + termRows(list) + '</div></div></div>';
  }
  return h + '</section>';
}
const termRows = list => list.map(t => '<div><span>' + esc(t[0]) + '</span><b>' + esc(t[1]) + '</b></div>').join('') || '<span class="muted">Sonuç yok.</span>';
function viewSinav() {
  if (EX && EX.def) return EX.kind === 'code' ? (EX.done ? codeResult() : codeRun()) : (EX.done ? mcResult() : mcRun());
  let h = '<div class="wrap" style="gap:16px">' + C.head('Pratik', 'Sınavlar', 'Süreli sınavlar; her denemede sorular havuzdan karışık seçilir, şıkların sırası da karışır.', 'sinav');
  h += '<div class="row" style="gap:8px"><a class="btn sm ghost" href="#sinavlar" data-jump="kapsam">Kapsam haritası</a><a class="btn sm ghost" href="#sinavlar" data-jump="sinavgunu">Sınav günü rehberi ve İngilizce terimler</a></div>';
  [['seviye', 'Seviye sınavları', 'Çoktan seçmeli; derslerdeki sorulardan ve seviye testinden derlenir.'], ['sertifika', 'Sertifika denemeleri', 'Resmî maddelere göre yazılmış özgün sorular; bölüm düzeni, soru biçimleri ve puanlama sınava girenlerin anlattıklarına göre kuruldu. Gerçek sınav soruları değildir.'], ['certprac', 'Sertifika konu alıştırmaları', 'Sınav tarzında olmayan ama konuyu öğreten sorular ve ders soruları. Süre yok; her sorudan sonra doğru cevabı ve açıklamayı görürsün.'], ['kod', 'DAX kodlama sınavları', 'Süre sınırı altında gerçek ölçü yazarsın. İpucu ve çözüm kapalıdır; yanlışta beklenen değerler gösterilmez.'], ['mulakat', 'Mülakat simülasyonu', 'BI analisti ve geliştirici mülakatlarında sık sorulan DAX soruları, takip sorularıyla. Kavram soruları ve davranışsal hazırlık için Mülakat bölümüne bak.']].forEach(([f, t, d]) => {
    h += '<section class="lvl-block"><div class="sec-head"><div><h2>' + t + '</h2><span class="muted" style="font-size:.86rem">' + d + '</span></div>' + (f === 'mulakat' ? '<button class="btn sm" data-go="iv">Mülakat bölümü</button>' : '') + '</div><div class="paths">' + EXAMS.filter(e => e.fam === f).map(card).join('') + '</div></section>';
  });
  h += coverage() + guide();
  return h + '</div>';
}

/* ---------- Soru çizimi (çalışma ve inceleme) ---------- */
const TYPEN = { mc: 'Tek seçim', multi: 'Çoklu seçim', yesno: 'Evet / Hayır', order: 'Sıralama', hot: 'Kodda boşluk doldur', serq: 'Seri: çözüm hedefi karşılıyor mu?', click: 'Arayüzde tıkla' };
const SECN = { main: 'Ana bölüm', case: 'Vaka çalışması', series: 'Evet/hayır serisi' };
function qBody(it, a, review) {
  const x = it.x; let h = '<div class="q">' + x.q + '</div>';
  if (x.type === 'click') { const U = (window.PBI_UI || {})[x.ui]; if (!U) return h; const tabs = U.tabs, [at, al] = String(x.a).split('||')[0].split('|'); const cur = review ? at : a.tab; const tb = tabs.find(t => t.id === cur) || tabs[0];
    const lbl = k => { if (!k) return 'seçilmedi'; const [ti, b] = k.split('|'); const tt = tabs.find(t => t.id === ti); return (tt ? tt.name + ' → ' : '') + b; };
    h += '<div class="ui-sim" role="group" aria-label="Arayüz benzetimi: ' + esc(U.title) + '"><div class="ui-title"><span class="ui-dots"><i></i><i></i><i></i></span>' + esc(U.title) + '</div><div class="ui-tabs">' + tabs.map(t => '<button data-exct="' + t.id + '" class="' + (t.id === tb.id ? 'on ' : '') + (t.ctx ? 'ctx' : '') + '">' + esc(t.name) + '<small>' + esc(t.en) + '</small></button>').join('') + '</div><div class="ui-btns">' + tb.btns.map(([tr, en]) => { const k = tb.id + '|' + tr; return '<button data-excb="' + esc(k) + '" class="' + (a.pick === k ? 'picked ' : '') + (review ? (String(x.a).split('||').includes(k) ? 'right' : a.pick === k ? 'wrong' : '') : '') + '"' + (review ? ' disabled' : '') + '><b>' + esc(tr) + '</b><small>' + esc(en) + '</small></button>'; }).join('') + '</div><div class="ui-foot">' + esc(U.hint) + ' Benzetimdir; gerçek arayüzde düğme yerleri güncellemelerle değişebilir.</div></div>';
    h += review ? '<p class="exhint">Senin seçimin: <b>' + esc(lbl(a.pick)) + '</b> · Doğru: <b>' + esc(lbl(x.a)) + '</b></p>' : '<p class="exhint">Sekmeler arasında gezinebilirsin; cevap olarak yalnızca tıkladığın komut sayılır.' + (a.pick ? ' Seçimin: <b>' + esc(lbl(a.pick)) + '</b>' : '') + '</p>';
    return h; }
  if (x.type === 'serq') { h += '<div class="ser-sol"><span class="eyebrow">Önerilen çözüm ' + (x.serI + 1) + ' / ' + x.serN + '</span><p>' + x.t + '</p></div><div class="ser-yn">' + [[true, 'Evet'], [false, 'Hayır']].map(([v, l]) => '<button data-exs="' + v + '" class="btn' + (a === v ? ' pri' : '') + (review ? (v === x.a ? ' right' : a === v ? ' wrong' : '') : '') + '"' + (review ? ' disabled' : '') + '>' + l + '</button>').join('') + (review ? '<small class="muted">Doğru cevap: ' + (x.a ? 'Evet' : 'Hayır') + '</small>' : '') + '</div>'; return h; }
  if (x.type === 'mc') h += '<div class="mc">' + it.ord.map((j, pos) => '<button data-exa="' + j + '" class="' + (a === j ? 'picked ' : '') + (review ? (j === x.a ? 'right' : a === j ? 'wrong' : '') : '') + '"' + (review ? ' disabled' : '') + '><span class="key">' + String.fromCharCode(65 + pos) + '</span><span>' + x.o[j] + '</span></button>').join('') + '</div>';
  else if (x.type === 'multi') h += '<p class="exhint">' + x.a.length + ' seçenek işaretle.' + (review ? '' : ' Seçtiğin: ' + a.length) + '</p><div class="mc multi">' + it.ord.map((j, pos) => { const on = a.includes(j); return '<button data-exm="' + j + '" class="' + (on ? 'picked ' : '') + (review ? (x.a.includes(j) ? 'right' : on ? 'wrong' : '') : '') + '"' + (review ? ' disabled' : '') + ' aria-pressed="' + on + '"><span class="key box">' + (on ? '✓' : '') + '</span><span>' + x.o[j] + '</span></button>'; }).join('') + '</div>';
  else if (x.type === 'yesno') h += '<table class="yn"><thead><tr><th>İfade</th><th>Evet</th><th>Hayır</th></tr></thead><tbody>' + x.st.map((s, i) => '<tr class="' + (review ? (a[i] === s.a ? 'ok' : 'bad') : '') + '"><td>' + s.t + (review ? ' <small class="muted">(doğru: ' + (s.a ? 'Evet' : 'Hayır') + ')</small>' : '') + '</td>' + [true, false].map(v => '<td><button data-exy="' + i + ':' + v + '" class="ynb' + (a[i] === v ? ' on' : '') + '"' + (review ? ' disabled' : '') + ' aria-label="' + (v ? 'Evet' : 'Hayır') + '">' + (a[i] === v ? '●' : '○') + '</button></td>').join('') + '</tr>').join('') + '</tbody></table>';
  else if (x.type === 'order') {
    const lbl = k => k[0] === 'i' ? x.items[+k.slice(1)] : x.extra[+k.slice(1)];
    if (review) h += '<div class="ord-grid"><div class="panel pz-box"><span class="eyebrow">Senin sıran</span>' + (a.length ? a.map((k, i) => '<div class="ord-it ' + (k === 'i' + i ? 'ok' : 'bad') + '"><em>' + (i + 1) + '</em>' + lbl(k) + '</div>').join('') : '<i class="muted">boş</i>') + '</div><div class="panel pz-box"><span class="eyebrow">Doğru sıra</span>' + x.items.map((t, i) => '<div class="ord-it ok"><em>' + (i + 1) + '</em>' + t + '</div>').join('') + (x.extra.length ? '<small class="muted">Kullanılmaması gerekenler: ' + x.extra.join(' · ') + '</small>' : '') + '</div></div>';
    else h += '<p class="exhint">Gereken adımları doğru sıraya diz; gereksiz adımlar dışarıda kalabilir. Sağdaki bir adıma tıklayınca geri döner.</p><div class="ord-grid"><div class="panel pz-box"><span class="eyebrow">Adımlar</span>' + it.pool.filter(k => !a.includes(k)).map(k => '<button class="ord-it pick" data-exo="' + k + '">' + lbl(k) + '</button>').join('') + '</div><div class="panel pz-box pz-ans"><span class="eyebrow">Senin sıran</span>' + (a.length ? a.map((k, i) => '<button class="ord-it on" data-exor="' + i + '"><em>' + (i + 1) + '</em>' + lbl(k) + '</button>').join('') : '<span class="muted" style="font-size:.86rem">Soldan adımlara sırayla tıkla.</span>') + '</div></div>';
  }
  else if (x.type === 'hot') {
    let code = esc(x.code); x.slots.forEach((s, i) => { const v = a[i]; const sel = review ? '<span class="hot-v ' + (v === s.a ? 'ok' : 'bad') + '">' + esc(v === null ? '…' : s.o[v]) + (v === s.a ? '' : ' → ' + esc(s.o[s.a])) + '</span>' : '<select data-exh="' + i + '" aria-label="Boşluk ' + (i + 1) + '"><option value="">— seç —</option>' + s.o.map((o, j) => '<option value="' + j + '"' + (v === j ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>'; code = code.split('{' + i + '}').join(sel); });
    h += '<pre class="hot-code">' + code + '</pre>';
  }
  return h;
}
function caseBox(x) {
  const cs = caseFor(x); if (!cs) return '';
  return '<div class="panel case-box"><span class="eyebrow">Vaka çalışması</span><h3>' + esc(cs.title) + '</h3><div class="filters case-tabs">' + cs.tabs.map((t, i) => '<button data-extab="' + i + '" aria-pressed="' + (EX.tab === i) + '">' + esc(t[0]) + '</button>').join('') + '</div><div class="case-txt">' + fmBlock(cs.tabs[EX.tab][1]) + '</div></div>';
}
function mcRun() {
  const e = EX.def, it = EX.qs[EX.cur], x = it.x, ans = EX.ans[EX.cur], prac = isPrac(e);
  const sc = secOf(EX.cur), sec = EX.secList[sc], multiSec = EX.secList.length > 1, isSer = sec.type === 'series';
  let h = '<div class="wrap" style="max-width:980px;gap:14px"><div class="row" style="justify-content:space-between"><div><span class="eyebrow">' + esc(e.name) + (multiSec ? ' · bölüm ' + (sc + 1) + '/' + EX.secList.length + ': ' + SECN[sec.type] : '') + '</span><h2 style="margin:2px 0 0">Soru ' + (EX.cur + 1) + ' / ' + EX.qs.length + '</h2></div><div class="row" style="gap:10px">' + (EX.end === Infinity ? '<span class="chip">Süresiz alıştırma</span>' : '<span class="clock" id="exClock">' + fmtT(left()) + '</span>') + '<button class="btn sm" data-exfin="ask">' + (prac ? 'Bitir' : 'Sınavı bitir') + '</button></div></div><div id="exAsk"></div>';
  if (multiSec) h += '<div class="sec-strip">' + EX.secList.map((s2, j) => '<span class="' + (j < sc ? 'done' : j === sc ? 'cur' : '') + '">' + (j + 1) + '. ' + SECN[s2.type] + ' (' + (s2.b - s2.a + 1) + ')' + (j < sc ? ' · kapandı' : '') + '</span>').join('') + '</div>';
  h += '<div class="exgrid">' + EX.qs.map((q, i) => { const si = secOf(i); const lock = si !== sc || (isSer && i < EX.cur); return '<button data-exq="' + i + '" class="' + (answered(q.x, EX.ans[i]) ? 'ans ' : '') + (EX.flag[i] ? 'flag ' : '') + (i === EX.cur ? 'cur ' : '') + (EX.secList[si].type !== 'main' ? 'case' : '') + '"' + (lock ? ' disabled' : '') + ' aria-label="Soru ' + (i + 1) + '">' + (i + 1) + '</button>'; }).join('') + '</div>';
  if (x.caseRef) h += caseBox(x);
  if (isSer && !prac) h += '<div class="note" style="margin:0"><b>Seri sorusu</b>Aynı senaryo farklı çözümlerle tekrar eder. Bir sonrakine geçince bu soruya dönemezsin.</div>';
  const chk = prac && EX.checked[EX.cur];
  h += '<div class="panel brief"><div class="row" style="justify-content:space-between"><span class="row" style="gap:6px"><span class="chip">' + esc(x.k) + '</span><span class="chip qt">' + TYPEN[x.type] + '</span>' + (prac && x.cls === 'alistirma' ? '<span class="chip">alıştırma sorusu</span>' : '') + (x.src ? '<span class="chip">ders: ' + esc(x.src) + '</span>' : '') + '</span>' + (prac || isSer ? '' : '<button class="btn sm ghost" data-exflag="1">' + (EX.flag[EX.cur] ? 'İşareti kaldır' : 'Sonra bakmak için işaretle') + '</button>') + '</div>' + qBody(it, ans, chk);
  if (prac) h += chk ? (function () { const pt = points(x, ans); return '<div class="msg ' + (pt === 1 ? 'ok' : 'err') + '"><b>' + (pt === 1 ? 'Doğru.' : pt > 0 ? 'Kısmen doğru (%' + Math.round(pt * 100) + ').' : 'Yanlış.') + '</b>' + (x.why || '') + (x.s && SKMAP[x.s] ? '<small class="muted" style="display:block;margin-top:4px">Madde: ' + esc(SKMAP[x.s].t) + '</small>' : '') + '</div>'; })() : '<div class="row"><button class="btn pri" data-excheck="1"' + (answered(x, ans) ? '' : ' disabled') + '>Kontrol et</button></div>';
  h += '</div>';
  const last = EX.cur === EX.qs.length - 1, endSec = EX.cur === sec.b && !last;
  h += '<div class="pager"><button class="btn" data-exq="' + Math.max(0, EX.cur - 1) + '"' + (EX.cur > sec.a && !isSer ? '' : ' disabled') + '>Önceki</button>' + (!last ? '<button class="btn pri" data-exq="' + (EX.cur + 1) + '">' + (endSec ? 'Bölümü bitir: ' + SECN[EX.secList[sc + 1].type] + ' →' : 'Sonraki') + '</button>' : '<button class="btn pri" data-exfin="ask">' + (prac ? 'Bitir' : 'Sınavı bitir') + '</button>') + '</div>';
  return h + '</div>';
}
function mcResult() {
  const e = EX.def, pass = EX.score >= e.pass, cert = isCert(e) && !isPrac(e);
  const by = {}; EX.qs.forEach((it, i) => { const b = by[it.x.k] = by[it.x.k] || { n: 0, p: 0 }; b.n++; b.p += EX.pts[i]; });
  const types = {}; EX.qs.forEach((it, i) => { const b = types[it.x.type] = types[it.x.type] || { n: 0, p: 0 }; b.n++; b.p += EX.pts[i]; });
  let h = '<div class="wrap" style="max-width:980px;gap:16px"><div class="panel finish"><span class="eyebrow">' + esc(e.name) + ' · sonuç</span><h2 style="margin:4px 0">' + (cert ? EX.scaled + ' / 1000' : '%' + EX.score) + ' · ' + (isPrac(e) ? 'alıştırma tamamlandı' : pass ? 'Geçtin' : 'Geçme ' + (cert ? '700' : 'notu %' + e.pass)) + '</h2><p class="muted" style="margin:0">' + EX.okN + ' / ' + EX.qs.length + ' tam doğru' + (cert ? ' · kısmi puanlar dahil %' + EX.score : '') + ' · ' + fmtT(EX.secs) + ' sürdü' + (P.exams[EX.id] ? ' · en iyi ' + scoreTxt(e, P.exams[EX.id].best) : '') + '</p>' + (cert ? '<p class="muted" style="margin:0;font-size:.82rem">Gerçek sınavın ölçeklemesi yayımlanmaz; buradaki puan doğru oranının 1000’e çevrilmiş hâlidir.</p>' : '') + '<div class="row"><button class="btn pri" data-exstart="' + esc(e.adhoc ? e.id : e.id) + '">Yeni deneme</button><button class="btn" data-exback="1">Sınavlara dön</button>' + (e.path ? '<button class="btn ghost" data-go="path" data-id="' + e.path + '">İlgili öğrenme yolu</button>' : '') + '</div></div>';
  const bars = obj => Object.entries(obj).sort((a, b) => a[1].p / a[1].n - b[1].p / b[1].n).map(([k, b]) => { const pc = Math.round(b.p / b.n * 100); return '<div class="litem prof" style="cursor:default"><span class="pill ' + (pc >= 70 ? 'p-ok' : 'p-bad') + '">%' + pc + '</span><span style="min-width:0"><b>' + esc(TYPEN[k] || k) + '</b><small>' + (Math.round(b.p * 10) / 10) + ' / ' + b.n + ' puan</small></span><span class="bar"><i style="width:' + pc + '%"></i></span></div>'; }).join('');
  h += '<section class="lvl-block"><h3>' + (cert ? 'Alan bazında (Microsoft sonuç raporundaki gibi)' : 'Konu bazında') + '</h3><div class="panel lessons">' + bars(by) + '</div></section>';
  if (Object.keys(types).length > 1) h += '<section class="lvl-block"><h3>Soru tipine göre</h3><div class="panel lessons">' + bars(types) + '</div></section>';
  if (cert || isPrac(e)) { const weak = {}; EX.qs.forEach((it, i) => { if (it.x.s && EX.pts[i] < 1) weak[it.x.s] = (weak[it.x.s] || 0) + 1; }); const w = Object.entries(weak).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (w.length) h += '<section class="lvl-block"><h3>Çalışman gereken maddeler</h3><div class="panel lessons">' + w.map(([s, n]) => '<div class="litem prof" style="cursor:default"><span class="pill p-bad">' + n + ' hata</span><span style="min-width:0"><b>' + esc(SKMAP[s] ? SKMAP[s].t : s) + '</b><small>' + esc(SKMAP[s] ? SKMAP[s].en : '') + '</small></span><button class="btn sm ghost" data-exstart="mad:' + s + '">Çalış</button></div>').join('') + '</div></section>'; }
  const wrong = EX.qs.map((it, i) => ({ it, i })).filter(z => EX.pts[z.i] < 1);
  if (wrong.length) h += '<section class="lvl-block"><h3>Tam puan alamadıkların (' + wrong.length + ')</h3>' + wrong.map(z => '<div class="panel exrev"><div class="row" style="gap:6px"><span class="chip">' + esc(z.it.x.k) + '</span><span class="chip qt">' + TYPEN[z.it.x.type] + '</span>' + (EX.pts[z.i] > 0 ? '<span class="pill p-bad">kısmi: ' + Math.round(EX.pts[z.i] * 100) + '%</span>' : '') + (answered(z.it.x, EX.ans[z.i]) ? '' : '<span class="pill p-bad">boş</span>') + '</div>' + qBody(z.it, EX.ans[z.i], true) + (z.it.x.why ? '<p class="muted" style="margin:0">' + z.it.x.why + '</p>' : '') + (z.it.x.src ? '<small class="muted">Ders: ' + esc(z.it.x.src) + '</small>' : '') + (z.it.x.s && SKMAP[z.it.x.s] ? '<small class="muted">Madde: ' + esc(SKMAP[z.it.x.s].t) + '</small>' : '') + '</div>').join('') + '</section>';
  return h + '</div>';
}
function codeRun() {
  const e = EX.def, t = EX.tasks[EX.cur];
  let h = '<div class="wrap" style="gap:14px"><div class="row" style="justify-content:space-between"><div><span class="eyebrow">' + esc(e.name) + '</span><h2 style="margin:2px 0 0">Görev ' + (EX.cur + 1) + ' / ' + EX.tasks.length + '</h2></div><div class="row" style="gap:10px"><span class="clock" id="exClock">' + fmtT(left()) + '</span><button class="btn sm" data-exfin="ask">Sınavı bitir</button></div></div><div id="exAsk"></div>';
  h += '<div class="exgrid">' + EX.tasks.map((_, i) => '<button data-exq="' + i + '" class="' + (EX.ok[i] ? 'ans ' : '') + (i === EX.cur ? 'cur' : '') + '">' + (i + 1) + (EX.ok[i] ? ' ✓' : '') + '</button>').join('') + '</div>';
  const i = EX.cur;
  h += C.exView(t, 'ex:' + EX.run + ':' + i, () => { if (!EX.ok[i]) { EX.ok[i] = true; C.toast('Görev ' + (i + 1) + ' çözüldü'); const b = document.querySelector('[data-exq="' + i + '"]'); if (b) { b.classList.add('ans'); b.textContent = (i + 1) + ' ✓'; } if (t.follow) { const f = $('#exFollow'); if (f) f.innerHTML = '<div class="note"><b>Mülakatçının takip sorusu</b>' + esc(t.follow) + '</div>'; } } }, { exam: true, onWrong: () => { EX.tries[i]++; } });
  h += '<div id="exFollow">' + (EX.ok[i] && t.follow ? '<div class="note"><b>Mülakatçının takip sorusu</b>' + esc(t.follow) + '</div>' : '') + '</div>';
  h += '<div class="pager"><button class="btn" data-exq="' + Math.max(0, i - 1) + '"' + (i ? '' : ' disabled') + '>Önceki</button>' + (i < EX.tasks.length - 1 ? '<button class="btn pri" data-exq="' + (i + 1) + '">Sonraki görev</button>' : '<button class="btn pri" data-exfin="ask">Sınavı bitir</button>') + '</div>';
  return h + '</div>';
}
function codeResult() {
  const e = EX.def, pass = EX.score >= e.pass;
  let h = '<div class="wrap" style="max-width:920px;gap:16px"><div class="panel finish"><span class="eyebrow">' + esc(e.name) + ' · sonuç</span><h2 style="margin:4px 0">' + EX.okN + ' / ' + EX.tasks.length + ' görev · ' + (pass ? 'Geçtin' : 'Geçme notu %' + e.pass) + '</h2><p class="muted" style="margin:0">%' + EX.score + ' · ' + fmtT(EX.secs) + ' sürdü · en iyi %' + P.exams[EX.id].best + '</p><div class="row"><button class="btn pri" data-exstart="' + e.id + '">Yeni deneme</button><button class="btn" data-exback="1">Sınavlara dön</button></div></div>';
  h += '<section class="lvl-block"><h3>Görevler ve örnek çözümler</h3>' + EX.tasks.map((t, i) => '<div class="panel exrev"><div class="row" style="justify-content:space-between"><b>' + (i + 1) + '. ' + esc(t.name || 'DAX sorgusu') + '</b><span class="pill ' + (EX.ok[i] ? 'p-ok' : 'p-bad') + '">' + (EX.ok[i] ? 'Çözüldü' : 'Çözülmedi') + (EX.tries[i] ? ' · ' + EX.tries[i] + ' hatalı deneme' : '') + '</span></div><div class="q">' + t.q + '</div><pre class="dax" data-notry>' + esc((t.name && t.t !== 'query' ? t.name + ' =\n' : '') + t.sol) + '</pre>' + (t.follow ? '<p class="muted" style="margin:0"><b>Takip sorusu:</b> ' + esc(t.follow) + '</p>' : '') + '</div>').join('') + '</section>';
  return h + '</div>';
}
/* Yarım kalan sınavı koru: sayfa yenilense de kapanıp açılsa da kaldığı yerden devam eder (süre işlemeye devam eder) */
const EXKEY = 'pbipatika.exam';
function persistEx() { try { if (!EX || EX.done) { localStorage.removeItem(EXKEY); return; } const o = Object.assign({}, EX, { def: null, end: isFinite(EX.end) ? EX.end : null }); localStorage.setItem(EXKEY, JSON.stringify(o)); } catch (e) {} }
function restoreEx() { try { const raw = localStorage.getItem(EXKEY); if (!raw || EX) return; const o = JSON.parse(raw); const def = EXMAP[o.id] || (String(o.id).startsWith('mad:') ? skillExam(o.id.slice(4)) : null); if (!def || o.done) { localStorage.removeItem(EXKEY); return; } o.def = def; if (o.end == null) o.end = Infinity; if (o.end < Date.now() - 6 * 3600e3) { localStorage.removeItem(EXKEY); return; } EX = o; setTimeout(() => C.toast('Yarım kalan sınavın geri yüklendi: ' + def.name), 400); } catch (e) { try { localStorage.removeItem(EXKEY); } catch (x) {} } }
restoreEx();
setInterval(() => { if (EX && !EX.done) persistEx(); }, 3000);
window.addEventListener('pagehide', persistEx);
window.addEventListener('beforeunload', ev => { if (EX && !EX.done && EX.kind) { persistEx(); ev.preventDefault(); ev.returnValue = ''; } });
C.view('sinav', { render: viewSinav, mount: () => { if (EX && !EX.done) { runClock(); if (EX.kind === 'code') C.exMount(); } }, hash: 'sinavlar' });

/* ---------- Olaylar ---------- */
const markGrid = () => { const ok = answered(EX.qs[EX.cur].x, EX.ans[EX.cur]); const g = document.querySelector('[data-exq="' + EX.cur + '"]'); if (g) g.classList.toggle('ans', ok); const cb = document.querySelector('[data-excheck]'); if (cb) cb.disabled = !ok; };
function goQ(i) {
  if (EX.kind !== 'mc') { EX.cur = i; C.render(); window.scrollTo(0, 0); return; }
  const sc = secOf(EX.cur), si = secOf(i);
  if (si < sc) return;
  if (si > sc) {
    const sec = EX.secList[sc], open = EX.qs.slice(sec.a, sec.b + 1).filter((q, j) => !answered(q.x, EX.ans[sec.a + j])).length, fl = EX.flag.slice(sec.a, sec.b + 1).some(Boolean);
    $('#exAsk').innerHTML = '<div class="msg info confirm"><span><b>' + SECN[sec.type] + '</b> bölümünü bitiriyorsun; bu bölüme geri dönemezsin.' + (open ? ' ' + open + ' soru boş.' : '') + (fl ? ' İşaretlediğin sorular var.' : '') + ' Sıradaki: ' + SECN[EX.secList[si].type] + '.</span><button class="btn sm pri" data-exsec="' + si + '">Bölümü bitir</button><button class="btn sm ghost" data-exsec="no">Bölümde kal</button></div>'; window.scrollTo(0, 0); return;
  }
  if (EX.secList[sc].type === 'series' && i < EX.cur) return;
  EX.cur = i; C.render(); window.scrollTo(0, 0);
}
document.addEventListener('change', ev => { const s = ev.target.closest('[data-exh]'); if (!s || !EX || EX.done) return; if (isPrac(EX.def) && EX.checked[EX.cur]) return; EX.ans[EX.cur][+s.dataset.exh] = s.value === '' ? null : +s.value; markGrid(); });
document.addEventListener('input', ev => { if (ev.target.id !== 'termQ') return; TERMQ = ev.target.value; const T = window.PBI_EN_TERMS || []; const q = trFold(TERMQ); $('#termRows').innerHTML = termRows(T.filter(t => !q || trFold(t[0] + ' ' + t[1]).includes(q))); });
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-exct],[data-excb],[data-exstart],[data-exq],[data-exa],[data-exm],[data-exy],[data-exo],[data-exor],[data-extab],[data-exsec],[data-exs],[data-excheck],[data-exflag],[data-exfin],[data-exback],[data-covx],[data-term],[data-jump]'); if (!t) return;
  const d = t.dataset;
  if (d.jump) { ev.preventDefault(); const el = document.getElementById(d.jump); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  if (d.covx) { COVX = d.covx; C.render(); const el = document.getElementById('kapsam'); if (el) el.scrollIntoView(); return; }
  if (d.term) { const n = (window.PBI_EN_TERMS || []).length || 1; if (d.term === 'open') TERMOPEN = true; else { TERMOPEN = false; TERMI = d.term === 'next' ? TERMI + 1 : d.term === 'prev' ? TERMI + n - 1 : Math.floor(Math.random() * n); } const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }
  if (d.exstart) { start(d.exstart); return; }
  if (d.exback) { EX = null; persistEx(); C.render(); return; }
  if (!EX) return;
  if (d.exq !== undefined) { goQ(+d.exq); return; }
  if (d.exsec) { if (d.exsec !== 'no') { const si = +d.exsec; EX.sec = si; EX.cur = EX.secList[si].a; EX.tab = 0; C.render(); window.scrollTo(0, 0); } else $('#exAsk').innerHTML = ''; return; }
  if (EX.done) return;
  const locked = isPrac(EX.def) && EX.checked && EX.checked[EX.cur];
  if (d.excheck) { if (answered(EX.qs[EX.cur].x, EX.ans[EX.cur])) { EX.checked[EX.cur] = true; const y = window.scrollY; C.render(); window.scrollTo(0, y); } return; }
  if (locked && (d.exa !== undefined || d.exm !== undefined || d.exy || d.exo || d.exor !== undefined || d.exs)) return;
  if (d.exct) { EX.ans[EX.cur].tab = d.exct; const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }
  if (locked && d.excb) return;
  if (d.excb) { EX.ans[EX.cur].pick = d.excb; const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }
  if (d.exs) { EX.ans[EX.cur] = d.exs === 'true'; const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }
  if (d.extab !== undefined) { EX.tab = +d.extab; const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }
  if (d.exa !== undefined) { EX.ans[EX.cur] = +d.exa; document.querySelectorAll('[data-exa]').forEach(b => b.classList.toggle('picked', b === t)); markGrid(); return; }
  if (d.exm !== undefined) { const a = EX.ans[EX.cur], j = +d.exm, need = EX.qs[EX.cur].x.a.length; const k = a.indexOf(j); if (k >= 0) a.splice(k, 1); else { if (a.length >= need) a.shift(); a.push(j); } const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }
  if (d.exy) { const [i, v] = d.exy.split(':'); EX.ans[EX.cur][+i] = v === 'true'; const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }
  if (d.exo) { EX.ans[EX.cur].push(d.exo); const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }
  if (d.exor !== undefined) { EX.ans[EX.cur].splice(+d.exor, 1); const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }
  if (d.exflag) { EX.flag[EX.cur] = !EX.flag[EX.cur]; C.render(); return; }
  if (d.exfin === 'ask') { const open = EX.kind === 'code' ? EX.ok.filter(x => !x).length : EX.qs.filter((it, i) => !answered(it.x, EX.ans[i])).length; $('#exAsk').innerHTML = '<div class="msg info confirm"><span>' + (open ? open + (EX.kind === 'code' ? ' görev çözülmedi.' : ' soru boş ya da eksik.') + ' ' : '') + 'Sınavı bitirmek istediğine emin misin?</span><button class="btn sm pri" data-exfin="yes">Evet, bitir</button><button class="btn sm ghost" data-exfin="no">Devam et</button></div>'; window.scrollTo(0, 0); return; }
  if (d.exfin === 'yes') { finish(); return; }
  if (d.exfin === 'no') { $('#exAsk').innerHTML = ''; return; }
});
window.PBI_EXAMUI = { start, EXAMS, cur: () => EX, points, certPool, skillExam };
})();
