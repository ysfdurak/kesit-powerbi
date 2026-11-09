/* Kesit Power BI — Pratik, aralıklı tekrar, profil (rozet, etkinlik, ayarlar, yedek) ve sorun bildirme. */
(function () {
'use strict';
const C = window.PBI_CORE, esc = C.esc, $ = C.$, P = C.P;
const PR = window.PBI_PRACTICE || [], PRT = window.PBI_PR_TOPICS || {}, PRMAP = {}; PR.forEach((p, i) => { p._i = i; PRMAP[p.id] = p; });
const prKey = p => 'pr:' + p.id;
const prDone = p => !!P.ex[prKey(p)];
const plain = s => String(s || '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const TYPEN = { dax: 'DAX ölçüsü', query: 'DAX sorgusu', pq: 'Power Query', mcode: 'M kodu', mc: 'Senaryo' };
P.rv = P.rv || {}; P.reports = P.reports || []; P.exams = P.exams || {};

/* ---------- Tema (Otomatik / Açık / Koyu) ---------- */
function applyTheme() { const t = P.theme || 'auto'; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }
applyTheme();

/* ---------- Ortak: alıştırma anahtarından alıştırmayı bul ---------- */
function exByKey(k) {
  if (k.startsWith('kq:') || k.startsWith('mt:')) return window.PBI_GUIDEX ? window.PBI_GUIDEX(k) : null;
  if (k.startsWith('pr:')) { const p = PRMAP[k.slice(3)]; return p ? { e: p, title: 'Pratik · ' + (PRT[p.tp] || ''), lv: p.L, pr: p } : null; }
  const j = k.lastIndexOf(':'); const l = C.LMAP[k.slice(0, j)]; if (!l) return null; const e = (l.ex || [])[+k.slice(j + 1)]; return e ? { e, title: l.title, lv: l.lvl, l } : null;
}

/* ---------- Sorun bildir ---------- */
const reportBtn = where => '<button class="btn sm ghost" data-kfb="' + esc('Sorun: ' + where) + '">Sorun bildir</button>';

/* ---------- Pratik ---------- */
const PF = { L: '', tp: '', ty: '', q: '', open: false };
function prList() {
  const q = PF.q.trim().toLocaleLowerCase('tr');
  return PR.filter(p => (!PF.L || p.L === PF.L) && (!PF.tp || p.tp === PF.tp) && (!PF.ty || p.t === PF.ty) && (!PF.open || !prDone(p)) && (!q || (plain(p.q) + ' ' + (p.name || '') + ' ' + (PRT[p.tp] || '')).toLocaleLowerCase('tr').includes(q)));
}
function prRow(p) {
  return '<button class="litem" data-prgo="' + p.id + '"><span class="check ' + (prDone(p) ? 'done' : '') + '">' + (prDone(p) ? C.ic('tick', 3.2) : '') + '</span><span style="min-width:0"><b>' + esc(p.name || plain(p.q).split('.')[0]) + '</b><small>' + esc(plain(p.q).replace(/^[^:]*:\s*/, '').slice(0, 130)) + '</small></span><span class="row" style="gap:6px;flex-wrap:nowrap"><span class="chip' + (p.t === 'pq' ? ' pqc' : ' dx') + '">' + TYPEN[p.t] + '</span><span class="chip">' + esc(PRT[p.tp] || '') + '</span></span></button>';
}
function prListHTML() {
  const ls = prList(); if (!ls.length) return '<div class="panel empty">Bu filtrelere uyan görev yok.</div>';
  return C.LEVELS.map(L => { const it = ls.filter(p => p.L === L.id); if (!it.length) return ''; return '<section class="lvl-block"><div class="lvl-head">' + '<h2>' + esc(L.name) + ' seviye</h2><span class="muted" style="font-size:.85rem">' + it.length + ' görev · ' + it.filter(prDone).length + ' çözüldü</span></div><div class="panel lessons">' + it.map(prRow).join('') + '</div></section>'; }).join('');
}
function viewPratik() {
  let h = '<div class="wrap" style="gap:16px">' + C.head('Pratik', 'Pratik', PR.length + ' görev; konu anlatımı yok. Dersin içindeki soruya alıştırma, dersten bağımsız göreve pratik diyoruz.', 'pratik');
  h += '<div class="prstats">' + C.LEVELS.map(L => { const a = PR.filter(p => p.L === L.id), n = a.filter(prDone).length; return '<button class="panel prstat' + (PF.L === L.id ? ' on' : '') + '" data-prl="' + L.id + '">' + C.lvBadge(L.id) + '<b>' + n + '/' + a.length + '</b><span class="bar"><i style="width:' + (a.length ? n / a.length * 100 : 0) + '%"></i></span></button>'; }).join('') + '</div>';
  h += '<div class="prfilters"><input class="input" id="prQ" placeholder="Görev ara: YTD, RANKX, ağ geçidi…" value="' + esc(PF.q) + '" aria-label="Görev ara"><select class="input" id="prT" aria-label="Konu"><option value="">Tüm konular</option>' + Object.keys(PRT).filter(k => PR.some(p => p.tp === k)).map(k => '<option value="' + k + '"' + (PF.tp === k ? ' selected' : '') + '>' + esc(PRT[k]) + ' (' + PR.filter(p => p.tp === k).length + ')</option>').join('') + '</select><select class="input" id="prY" aria-label="Tür"><option value="">Tüm türler</option>' + Object.keys(TYPEN).map(k => '<option value="' + k + '"' + (PF.ty === k ? ' selected' : '') + '>' + TYPEN[k] + '</option>').join('') + '</select><label class="row" style="gap:6px;font-size:.86rem"><input type="checkbox" id="prO"' + (PF.open ? ' checked' : '') + '> Yalnızca çözülmemiş</label></div>';
  return h + '<div id="prList">' + prListHTML() + '</div></div>';
}
function viewPratikSoru(id) {
  const p = PRMAP[id]; if (!p) return viewPratik();
  const ls = prList(); const i = ls.indexOf(p); const prev = i > 0 ? ls[i - 1] : null; const next = i >= 0 && i < ls.length - 1 ? ls[i + 1] : PR.find(x => x._i > p._i && !prDone(x));
  let h = '<div class="wrap" style="gap:18px"><div class="lhead"><div class="crumbs"><button data-go="pratik">Pratik</button><span>/</span>' + C.lvBadge(p.L) + '<span>' + esc(PRT[p.tp] || '') + '</span></div><div class="row" style="justify-content:space-between;align-items:end"><h1 style="font-size:clamp(1.4rem,3vw,1.9rem)">' + esc(p.name || plain(p.q).split('.')[0]) + '</h1><span class="chip' + (p.t === 'pq' ? ' pqc' : ' dx') + '">' + TYPEN[p.t] + '</span></div></div>';
  h += C.exView(p, prKey(p), q => { const k = prKey(p); if (!P.ex[k]) { P.ex[k] = true; C.trackRv(k); C.addXP(p.L === 'ileri' ? 15 : 10); if (!q) C.toast('+' + (p.L === 'ileri' ? 15 : 10) + ' XP'); C.save(); } });
  h += '<div class="pager"><span>' + (prev ? '<button class="btn" data-prgo="' + prev.id + '">Önceki</button>' : '') + '</span><span class="row" style="gap:8px">' + reportBtn('Pratik görevi ' + p.id) + '<button class="btn ghost" data-go="pratik">Listeye dön</button>' + (next ? '<button class="btn pri" data-prgo="' + next.id + '">Sonraki görev</button>' : '') + '</span></div>';
  return h + '</div>';
}
C.view('pratik', { render: viewPratik, hash: 'alistirma' });
C.view('pratikSoru', { render: viewPratikSoru, mount: () => C.exMount(), hash: 'gorev' });

/* ---------- Aralıklı tekrar ---------- */
const today = () => C.today();
function dueList() { return Object.keys(P.rv || {}).filter(k => exByKey(k) && P.rv[k].d <= today()).sort((a, b) => P.rv[a].d < P.rv[b].d ? -1 : 1); }
function rvCard(k, extra) { const x = exByKey(k); return '<div class="rcard"><span style="min-width:0">' + C.lvBadge(x.lv) + ' <small>' + esc(x.title) + '</small><span class="qt">' + esc(plain(x.e.q).slice(0, 140)) + '</span></span>' + (extra || '') + '</div>'; }
const RVS = { k: null, wrong: false, done: 0 };
function viewReview(id) {
  if (id && P.rv[id] && exByKey(id)) return reviewItem(id);
  const due = dueList(), all = Object.keys(P.rv || {}).filter(exByKey);
  const up = all.filter(k => P.rv[k].d > today()).sort((a, b) => P.rv[a].d < P.rv[b].d ? -1 : 1).slice(0, 6);
  let h = '<div class="wrap" style="max-width:960px;gap:16px">' + C.head('Öğren', 'Tekrar', null, 'review');
  h += '<div class="kpis kpis4"><div class="kpi"><b>' + due.length + '</b><span>bugün bekleyen</span></div><div class="kpi"><b>' + all.length + '</b><span>takipteki alıştırma</span></div><div class="kpi"><b>' + all.filter(k => P.rv[k].b >= 3).length + '</b><span>kalıcı hâle gelen (16+ gün)</span></div><div class="kpi"><b>' + (P.rvc || 0) + '</b><span>yapılan tekrar</span></div></div>';
  if (!all.length) h += '<div class="panel empty">Henüz takipte alıştırma yok. Bir dersin ya da Pratiknın bir görevini çözdüğünde ertesi gün burada karşına çıkar.<div style="margin-top:12px" class="row"><button class="btn pri" data-go="curr">Derslere git</button><button class="btn" data-go="pratik">Pratik</button></div></div>';
  else if (!due.length) h += '<div class="panel empty"><b>Bugünlük tekrar yok.</b> Yeni bir ders açabilir ya da Arena’da puan toplayabilirsin.</div>';
  else h += '<div class="row"><button class="btn pri" data-rvgo="' + esc(due[0]) + '">Tekrara başla (' + due.length + ')</button></div><div class="panel rcards">' + due.slice(0, 30).map(k => rvCard(k, '<button class="btn sm" data-rvgo="' + esc(k) + '">Aç</button>')).join('') + '</div>';
  if (up.length) h += '<section class="lvl-block"><h3>Yaklaşan tekrarlar</h3><div class="panel rcards">' + up.map(k => rvCard(k, '<span class="chip">' + P.rv[k].d.split('-').reverse().join('.') + '</span>')).join('') + '</div></section>';
  return h + '</div>';
}
function reviewItem(k) {
  const x = exByKey(k); const r = P.rv[k]; RVS.k = k; RVS.wrong = false;
  let h = '<div class="wrap" style="gap:16px"><div class="lhead"><div class="crumbs"><button data-go="review">Tekrar</button><span>/</span>' + C.lvBadge(x.lv) + '<span>' + esc(x.title) + '</span></div><div class="row" style="justify-content:space-between"><h1 style="font-size:clamp(1.3rem,3vw,1.8rem)">Tekrar · ' + (r.b + 1) + '. aralık</h1><span class="muted" style="font-size:.85rem">Doğru: ' + C.RV_GAPS[Math.min(r.b + 1, C.RV_GAPS.length - 1)] + ' gün sonra · Yanlış: yarın</span></div></div>';
  h += C.exView(x.e, 'rv:' + k, () => rvAnswer(true), { onWrong: () => rvAnswer(false) });
  const due = dueList().filter(z => z !== k);
  h += '<div class="pager"><button class="btn" data-go="review">Listeye dön</button><span class="row" style="gap:8px">' + reportBtn('Tekrar ' + k) + (due.length ? '<button class="btn" data-rvgo="' + esc(due[0]) + '" id="rvNext">Sonraki tekrar (' + due.length + ')</button>' : '') + '</span></div>';
  return h + '</div>';
}
function rvAnswer(ok) {
  const k = RVS.k; const r = P.rv[k]; if (!r) return;
  if (!ok) { if (!RVS.wrong) { RVS.wrong = true; r.b = 0; r.d = C.addDaysYmd(1); C.save(); } return; }
  if (r.d > today() && r.last === today()) return; // aynı gün ikinci kez sayma
  if (!RVS.wrong) r.b = Math.min(r.b + 1, C.RV_GAPS.length - 1);
  r.d = C.addDaysYmd(RVS.wrong ? 1 : C.RV_GAPS[r.b]); r.last = today(); P.rvc = (P.rvc || 0) + 1; C.addXP(3); C.save(); C.toast(RVS.wrong ? 'Yarın tekrar sorulacak' : 'Sonraki tekrar: ' + C.RV_GAPS[r.b] + ' gün sonra (+3 XP)');
}
C.view('review', { render: viewReview, mount: () => C.exMount(), hash: 'tekrar' });

/* ---------- Profil ---------- */
const BADGES = [
  ['İA', 'İlk adım', 'İlk alıştırmanı çöz', s => s.ex >= 1], ['25', 'Isınma turu', '25 alıştırma çöz', s => s.ex >= 25], ['100', 'Azimli', '100 alıştırma çöz', s => s.ex >= 100], ['250', 'Ölçü ustası', '250 alıştırma çöz', s => s.ex >= 250],
  ['D10', 'Kitap kurdu', '10 dersi tamamla', s => s.done >= 10], ['3G', 'Üç gün üst üste', '3 günlük seri', s => s.best >= 3], ['7G', 'Bir hafta', '7 günlük seri', s => s.best >= 7], ['30G', 'Alışkanlık', '30 günlük seri', s => s.best >= 30],
  ['T', 'Temel seviye', 'Temel derslerin %80’i', s => s.lv.temel >= 80], ['O', 'Orta seviye', 'Orta derslerin %80’i', s => s.lv.orta >= 80], ['İ', 'İleri seviye', 'İleri derslerin %80’i', s => s.lv.ileri >= 80],
  ['PQ', 'Veri temizlikçisi', '5 Power Query alıştırması çöz', s => s.pq >= 5], ['TK', 'Tekrarın gücü', '20 tekrar yap', s => s.rvc >= 20], ['P', 'Öğrenme yolu bitti', 'Bir öğrenme yolunu tamamla', s => s.paths >= 1],
  ['SN', 'Sınava hazır', 'Bir deneme sınavını geç', s => s.passed >= 1], ['AR', 'Arena çaylağı', 'Arena’da 100 puan topla', s => s.pts >= 100], ['ST', 'Kendini tanı', 'Seviye testini çöz', s => !!P.placement]
];
function bestStreak() { const ds = Object.keys(P.days || {}).filter(k => P.days[k] > 0).sort(); let best = 0, cur = 0, prev = null; ds.forEach(k => { const d = new Date(k + 'T00:00:00'); if (prev && (d - prev) / 86400000 === 1) cur++; else cur = 1; best = Math.max(best, cur); prev = d; }); return best; }
function stats() {
  const lv = {}; C.LEVELS.forEach(L => lv[L.id] = C.pct(C.LESSONS.filter(l => l.lvl === L.id).map(l => l.id)));
  const exK = Object.keys(P.ex).filter(k => !k.startsWith('rv:') && exByKey(k));
  const exs = window.PBI_EXAMS || []; const passed = exs.filter(e => (P.exams[e.id] || {}).best >= e.pass).length;
  return { ex: exK.length, pq: exK.filter(k => { const t = exByKey(k).e.t; return t === 'pq' || t === 'mcode'; }).length, done: Object.keys(P.done).filter(k => C.LMAP[k]).length, best: bestStreak(), lv, rvc: P.rvc || 0, paths: (window.PBI_PATHS || []).filter(p => p.lessons.length && p.lessons.every(id => P.done[id])).length, passed, pts: (P.arena && P.arena.pts) || 0 };
}
function heat() {
  const end = new Date(); const dow = (end.getDay() + 6) % 7; const start = new Date(end); start.setDate(end.getDate() - dow - 7 * 16);
  let cells = '', d = new Date(start); const t = today();
  for (let i = 0; i < 17 * 7; i++) { const k = C.ymd(d); const v = (P.days || {})[k] || 0; const c = k > t ? 'fut' : v > 60 ? 'h4' : v > 30 ? 'h3' : v > 10 ? 'h2' : v > 0 ? 'h1' : ''; cells += '<i class="' + c + '" title="' + k.split('-').reverse().join('.') + ': ' + v + ' XP"></i>'; d.setDate(d.getDate() + 1); }
  return '<div class="heat" role="img" aria-label="Son 17 haftanın günlük XP etkinliği">' + cells + '</div>';
}
function viewProfile() {
  const st = stats(); const earned = BADGES.filter(b => b[3](st)).length;
  let h = '<div class="wrap" style="max-width:1040px;gap:18px">' + C.head('Profil', 'Profil', null, 'profile');
  h += '<div class="kpis kpis4"><div class="kpi"><b>' + P.xp + '</b><span>toplam XP</span></div><div class="kpi"><b>' + C.streak() + '</b><span>günlük seri (en iyi ' + st.best + ')</span></div><div class="kpi"><b>' + st.done + '/' + C.LESSONS.length + '</b><span>tamamlanan ders</span></div><div class="kpi"><b>' + st.ex + '</b><span>çözülen alıştırma</span></div></div>';
  h += '<section class="panel pbox"><div class="sec-head"><h3>Etkinlik</h3><span class="muted" style="font-size:.8rem">Son 17 hafta · koyu kare = daha çok XP</span></div>' + heat() + '</section>';
  if (window.PBI_SYNC) h += window.PBI_SYNC.panel();
  { const pl = P.pilot, t = pl.tests, f = t[0], l = t[t.length - 1], fm = x => x ? x.puan + '/' + x.toplam : 'yok';
    h += '<section class="panel pbox" id="pilotBox"><div class="sec-head"><h3>Pilot özeti</h3><button class="btn sm" data-act2="pilot-copy">Özeti kopyala</button></div><div class="kpis kpis4"><div class="kpi"><b>' + fm(f) + '</b><span>ilk seviye testi</span></div><div class="kpi"><b>' + fm(l) + '</b><span>son seviye testi (' + t.length + ' test)</span></div><div class="kpi"><b>' + pl.aktifDk + '</b><span>aktif dakika</span></div><div class="kpi"><b>' + Object.keys(pl.dersBaslangic).filter(id => C.LMAP[id]).length + '</b><span>açılan ders</span></div></div><p class="muted" style="margin:10px 0 0;font-size:.85rem">Bu tarayıcıda durur, hiçbir yere gönderilmez. Kopyalayıp paylaşmak senin kararın. Ad, e-posta ya da yazdığın kod içermez. Aynı tarayıcıda devam et: gizli pencerede ya da başka cihazda sayılmaz.</p><details style="margin-top:8px"><summary>Kopyalanacak metni gör</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8rem;margin:8px 0 0">' + esc(JSON.stringify(C.pilotSummary(), null, 1)) + '</pre></details></section>'; }
  if (window.PBI_CAREER) { const CR = window.PBI_CAREER, ps = (window.PBI_PATHS || []).filter(p => C.pct(p.lessons) > 0 || (C.P.goal && C.P.goal.path === p.id)); if (ps.length) h += '<section class="lvl-block"><div class="sec-head"><h2>Öğrenme yolların ve belgelerin</h2><button class="btn sm ghost" data-go="hedef">Hedefi değiştir</button></div><div class="panel lessons">' + ps.map(p => { const st = CR.stats(p), ok = CR.certReady(p.id); return '<div class="litem prof" style="cursor:default"><span class="ic" style="--path-color:' + p.color + ';min-width:34px;height:34px">' + p.short + '</span><span style="min-width:0"><b>' + esc(p.name) + (C.P.goal && C.P.goal.path === p.id ? ' · hedefin' : '') + '</b><small>' + st.done + '/' + st.n + ' ders · işe hazırlık %' + CR.readyPct(p.id) + '</small></span>' + (ok ? '<button class="btn sm pri" data-go="sertifika" data-id="' + p.id + '">Belge</button>' : '<button class="btn sm" data-go="path" data-id="' + p.id + '">Aç</button>') + '</div>'; }).join('') + '</div></section>'; }
  h += '<section class="lvl-block"><div class="sec-head"><h2>Seviyeler</h2></div><div class="panel lessons">' + C.LEVELS.map(L => { const ps = PR.filter(p => p.L === L.id), pd = ps.filter(prDone).length; return '<div class="litem prof" style="cursor:default">' + C.lvBadge(L.id) + '<span style="min-width:0"><b>' + esc(L.name) + ' seviye</b><small>Dersler %' + st.lv[L.id] + ' · Pratik ' + pd + '/' + ps.length + '</small></span><span class="bar"><i style="width:' + st.lv[L.id] + '%"></i></span></div>'; }).join('') + '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><h2>Öğrenme yolları</h2></div><div class="panel lessons">' + (window.PBI_PATHS || []).map(p => { const pc = C.pct(p.lessons); return '<button class="litem prof" data-go="path" data-id="' + p.id + '"><span class="ic" style="--path-color:' + p.color + ';min-width:34px;height:34px;font-size:.78rem">' + p.short + '</span><span style="min-width:0"><b>' + esc(p.name) + '</b><small>' + p.lessons.filter(id => P.done[id]).length + '/' + p.lessons.length + ' ders</small></span><span class="bar"><i style="width:' + pc + '%;background:' + p.color + '"></i></span></button>'; }).join('') + '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><h2>Rozetler</h2><span class="muted">' + earned + ' / ' + BADGES.length + '</span></div><div class="badges">' + BADGES.map(b => { const on = b[3](st); return '<div class="badge' + (on ? '' : ' off') + '"><span class="bi">' + b[0] + '</span><b>' + esc(b[1]) + '</b><small>' + esc(b[2]) + '</small></div>'; }).join('') + '</div></section>';
  const exs = (window.PBI_EXAMS || []).filter(e => P.exams[e.id]);
  if (exs.length) h += '<section class="lvl-block"><div class="sec-head"><h2>Sınav sonuçları</h2><button class="btn sm ghost" data-go="sinav">Sınavlar</button></div><div class="panel lessons">' + exs.map(e => { const r = P.exams[e.id]; return '<div class="litem prof" style="cursor:default"><span class="chip">' + esc(e.short || '') + '</span><span style="min-width:0"><b>' + esc(e.name) + '</b><small>' + (e.fam === 'sertifika' ? 'En iyi ' + r.best * 10 + '/1000 · son ' + r.last * 10 + '/1000' : 'En iyi %' + r.best + ' · son %' + r.last) + ' · ' + r.n + ' deneme</small></span><span class="pill ' + (r.best >= e.pass ? 'p-ok' : 'p-bad') + '">' + (r.best >= e.pass ? 'Geçti' : 'Geçme ' + (e.fam === 'sertifika' ? '700' : '%' + e.pass)) + '</span></div>'; }).join('') + '</div></section>';
  const wk = Object.entries(P.weak || {}).filter(([id]) => C.LMAP[id]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (wk.length) { const M = window.PBI_MISTAKES || [], K = window.PBI_CONFUSED || [];
    h += '<section class="lvl-block"><div class="sec-head"><h2>En çok zorlandığın konular</h2><span class="muted" style="font-size:.82rem">Derslerdeki yanlış denemelerinden</span></div><div class="panel lessons">' + wk.map(([id, n]) => { const l = C.LMAP[id]; const rel = K.filter(c => c.lesson === id).map(c => '<button class="chip" data-go="karis" data-id="' + c.id + '">' + esc(c.title) + '</button>').concat(M.filter(m => m.lesson === id).slice(0, 2).map(m => '<button class="chip" data-go="hatalar" data-id="' + m.id + '">' + esc(m.sym.slice(0, 60)) + '</button>')).slice(0, 4).join(''); return '<div class="litem prof weak" style="cursor:default"><span class="pill p-bad">' + n + ' yanlış</span><span style="min-width:0"><b>' + esc(l.title) + '</b>' + (rel ? '<span class="weak-rel">' + rel + '</span>' : '') + '</span><button class="btn sm ghost" data-go="lesson" data-id="' + id + '">Derse dön</button></div>'; }).join('') + '</div></section>'; }
  if (P.arena && P.arena.pts) h += '<section class="panel pbox"><div class="sec-head"><h3>DAX Arena</h3><button class="btn sm ghost" data-go="arena">Arena’ya git</button></div><p class="muted" style="margin:0">' + P.arena.pts + ' puan · ' + Object.keys(P.arena.ch || {}).length + ' meydan okuma · hız rekoru ' + ((P.arena.speed || {}).best || 0) + '</p></section>';
  if ((P.reports || []).length) h += '<section class="panel pbox"><div class="sec-head"><h3>Önceden kaydettiğin notlar (' + P.reports.length + ')</h3><span class="row" style="gap:6px"><button class="btn sm" data-act2="rep-copy">Metni kopyala</button><button class="btn sm ghost" data-act2="rep-clear">Temizle</button></span></div><p class="muted" style="margin:0;font-size:.85rem">Eski sürümde “Sorun bildir” notları yalnızca bu tarayıcıya yazılıyordu, kimseye ulaşmadı. Bugün aynı düğme GitHub’da bir kayıt açar; bu notları iletmek istersen kopyalayıp oraya yapıştır.</p><ol class="replist">' + P.reports.map(r => '<li><b>' + esc(r.w) + '</b> · ' + esc(r.d) + '<br>' + esc(r.t) + '</li>').join('') + '</ol></section>';
  h += '<section class="panel pbox"><h3>Tema</h3><div class="row"><span>Tema</span><div class="dtoggle" role="group" aria-label="Tema">' + [['auto', 'Otomatik'], ['light', 'Açık'], ['dark', 'Koyu']].map(([v, t]) => '<button data-thm="' + v + '" aria-pressed="' + ((P.theme || 'auto') === v) + '">' + t + '</button>').join('') + '</div></div>';
  h += '</section>';
  return h + '</div>';
}
C.view('profile', { render: viewProfile, hash: 'profil' });

/* ---------- Olaylar ---------- */
const later = fn => setTimeout(fn, 0);
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-prgo],[data-prl],[data-rvgo],[data-thm],[data-act2]'); if (!t) return;
  const d = t.dataset;
  if (d.prgo) { C.go('pratikSoru', d.prgo); window.scrollTo(0, 0); return; }
  if (d.prl) { PF.L = PF.L === d.prl ? '' : d.prl; C.render(); return; }
  if (d.rvgo) { C.go('review', d.rvgo); window.scrollTo(0, 0); return; }
  if (d.thm) { P.theme = d.thm; C.save(); applyTheme(); document.querySelectorAll('[data-thm]').forEach(b => b.setAttribute('aria-pressed', b.dataset.thm === d.thm)); return; }
  const a = d.act2;
  if (a === 'pilot-copy') { C.copyText(JSON.stringify(C.pilotSummary()), 'Pilot özeti kopyalandı.'); return; }
  if (a === 'rep-copy') { const tx = P.reports.map((r, i) => (i + 1) + '. [' + r.w + '] ' + r.t).join('\n'); const show = () => { const sec = t.closest('section'); if (sec.querySelector('.repcopy')) return; const ta = document.createElement('textarea'); ta.className = 'input repcopy'; ta.rows = 4; ta.value = tx; sec.appendChild(ta); ta.select(); C.toast('Metin seçildi; Ctrl/⌘ + C ile kopyala'); }; try { navigator.clipboard.writeText(tx).then(() => C.toast('Kopyalandı'), show); } catch (e) { show(); } return; }
  if (a === 'rep-clear') { P.reports = []; C.save(); C.render(); return; }
});
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.id === 'prT') { PF.tp = t.value; $('#prList').innerHTML = prListHTML(); return; }
  if (t.id === 'prY') { PF.ty = t.value; $('#prList').innerHTML = prListHTML(); return; }
  if (t.id === 'prO') { PF.open = t.checked; $('#prList').innerHTML = prListHTML(); return; }
});
document.addEventListener('input', ev => { if (ev.target.id === 'prQ') { PF.q = ev.target.value; $('#prList').innerHTML = prListHTML(); } });

window.PBI_PRACTICE_UI = { exByKey, dueList, reportBtn, prKey };
})();
