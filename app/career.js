/* Kesit Power BI — Hedef ve kariyer katmanı: hedef seçimi, öğrenme yolu aşamaları, bitirme projesi,
   işe hazırlık kontrol listesi ve tamamlama belgesi. Veri: roles.js (PBI_ROLES). */
(function () {
'use strict';
const C = window.PBI_CORE, P = C.P, esc = C.esc, ic = C.ic;
const PATHS = window.PBI_PATHS || [], PMAP = {}; PATHS.forEach(p => PMAP[p.id] = p);
const R = window.PBI_ROLES || {};
['cap', 'ready', 'cert'].forEach(k => { if (!P[k] || typeof P[k] !== 'object') P[k] = {}; });

/* ---------- Hesaplar ---------- */
const estMin = l => (l.min || 10) + (l.ex || []).length * 3;
const fmtH = m => m < 60 ? (Math.round(m / 5) * 5) + ' dk' : Math.max(1, Math.round(m / 60)).toLocaleString('tr-TR') + ' saat';
function stats(p) {
  const ls = p.lessons.map(id => C.LMAP[id]).filter(Boolean), dn = ls.filter(l => P.done[l.id]);
  const tot = ls.reduce((a, l) => a + estMin(l), 0), rem = ls.filter(l => !P.done[l.id]).reduce((a, l) => a + estMin(l), 0);
  return { ls, n: ls.length, done: dn.length, pct: ls.length ? Math.round(dn.length / ls.length * 100) : 0, tot, rem };
}
function milestones(p) {
  const r = R[p.id], ls = p.lessons.filter(id => C.LMAP[id]);
  if (!r || !r.ms) return [{ t: 'Dersler', d: '', ids: ls }];
  const out = []; let i = 0;
  r.ms.forEach(m => { const j = ls.indexOf(m.to); const end = j < 0 ? i : Math.max(i, j + 1); out.push({ t: m.t, d: m.d || '', ids: ls.slice(i, end) }); i = end; });
  if (i < ls.length && out.length) out[out.length - 1].ids = out[out.length - 1].ids.concat(ls.slice(i));
  return out.filter(m => m.ids.length);
}
const capOf = id => (R[id] || {}).cap;
function capState(id) { const c = capOf(id); if (!c) return { n: 0, d: 0 }; const st = P.cap[id] || {}; const items = c.check || []; return { n: items.length, d: items.filter((x, i) => st[i]).length }; }
/* İşe hazırlık maddeleri: otomatik (ders, sınav, proje) ya da elle işaretlenir */
function readyItems(id) {
  const r = R[id]; if (!r || !r.ready) return [];
  return r.ready.map((x, i) => {
    let ok = false, auto = true, info = '';
    if (x.lessons) { const ids = x.lessons.filter(l => C.LMAP[l]); const d = ids.filter(l => P.done[l]).length; ok = ids.length > 0 && d === ids.length; info = d + '/' + ids.length + ' ders'; }
    else if (x.exam) { const e = (P.exams || {})[x.exam]; const best = e ? e.best : 0; ok = best >= (x.min || 70); info = e ? 'en iyi %' + best : 'henüz çözülmedi'; }
    else if (x.cap) { const s = capState(id); ok = s.n > 0 && s.d === s.n; info = s.d + '/' + s.n + ' teslim'; }
    else if (x.arena) { const pts = ((P.arena || {}).pts) || 0; ok = pts >= x.arena; info = pts + ' puan'; }
    else if (x.iv) { const iv = P.ivr || {}; const n = Object.values(iv).filter(v => v === 3).length; ok = n >= x.iv; info = n + ' soru hazır'; }
    else { auto = false; ok = !!(P.ready[id] || {})[i]; }
    return Object.assign({ i, ok, auto, info }, x);
  });
}
function readyPct(id) { const it = readyItems(id); return it.length ? Math.round(it.filter(x => x.ok).length / it.length * 100) : 0; }
function certReady(id) { const p = PMAP[id]; if (!p) return false; const s = stats(p); const it = readyItems(id); return s.pct === 100 && it.every(x => x.ok); }
function eta(p) {
  const s = stats(p), wk = (P.goal && P.goal.path === p.id && P.goal.hours) || 5;
  const weeks = Math.max(1, Math.ceil(s.rem / (wk * 60)));
  const d = new Date(); d.setDate(d.getDate() + weeks * 7);
  return { weeks, date: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }), wk };
}
const nextIn = p => C.nextOpen(p.lessons.map(id => C.LMAP[id]).filter(Boolean));

/* ---------- Ortak parçalar ---------- */
function ring(pct, size, label) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return '<svg class="ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + esc(label || ('%' + pct)) + '"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="ring-bg"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" class="ring-fg" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/><text x="50%" y="50%" dy=".35em" text-anchor="middle">%' + pct + '</text></svg>';
}
function msStrip(p, compact) {
  const ms = milestones(p); let cur = ms.findIndex(m => m.ids.some(id => !P.done[id])); if (cur < 0) cur = ms.length;
  return '<ol class="msstrip' + (compact ? ' compact' : '') + '">' + ms.map((m, i) => { const d = m.ids.filter(id => P.done[id]).length; const st = d === m.ids.length ? 'done' : i === cur ? 'cur' : ''; return '<li class="' + st + '"><span class="dot">' + (st === 'done' ? ic('tick', 3) : i + 1) + '</span><span class="mt"><b>' + esc(m.t) + '</b>' + (compact ? '' : '<small>' + d + '/' + m.ids.length + ' ders</small>') + '</span></li>'; }).join('') + '</ol>';
}

/* ---------- Ana sayfa hedef paneli ---------- */
function homeGoal() {
  const g = P.goal, p = g && PMAP[g.path];
  if (!p) {
    return '<section class="panel goalcta"><div class="gc-text"><span class="eyebrow">1 dakikada başla</span><h2>Hangi işi yapmak istiyorsun?</h2><p>Hedefini seç: veri analisti, BI geliştirici, PL-300, Fabric ya da Excel’den geçiş. Sana uygun öğrenme yolunu, haftalık temponla bitiş tarihini ve işe hazırlık listeni hazırlayalım.</p></div><div class="row"><button class="btn pri" data-go="hedef">Hedefimi seç</button><button class="btn ghost" data-go="paths">Öğrenme yollarına göz at</button></div></section>';
  }
  const s = stats(p), e = eta(p), nx = nextIn(p), r = R[p.id] || {}, rp = readyPct(p.id);
  let h = '<section class="panel goalpanel"><div class="gp-top">' + ring(s.pct, 92, 'Öğrenme yolu ilerlemesi %' + s.pct) + '<div class="grow"><span class="eyebrow">Hedefin</span><h2>' + esc(r.title || p.name) + '</h2><p class="muted">' + s.done + '/' + s.n + ' ders · kalan ~' + fmtH(s.rem) + ' · haftada ' + e.wk + ' saatle tahmini bitiş <b>' + e.date + '</b></p></div><div class="gp-act">' + (nx ? '<button class="btn pri" data-lesson="' + nx.id + '" data-ctx="' + p.id + '">' + (s.done ? 'Devam et' : 'Başla') + ': ' + esc(nx.title) + '</button>' : '<button class="btn pri" data-go="path" data-id="' + p.id + '">Bitirme projesine geç</button>') + '<button class="btn ghost sm" data-go="hedef">Hedefi değiştir</button></div></div>';
  h += msStrip(p, true);
  h += '<div class="gp-foot"><button class="gp-link" data-go="path" data-id="' + p.id + '"><span>' + ic('path') + ' Yol haritası</span><b>' + milestones(p).length + ' aşama</b></button><button class="gp-link" data-go="path" data-id="' + p.id + '" data-scroll="ready"><span>' + ic('brief') + ' İşe hazırlık</span><b>%' + rp + '</b></button><button class="gp-link" data-go="path" data-id="' + p.id + '" data-scroll="cap"><span>' + ic('flag') + ' Bitirme projesi</span><b>' + (capState(p.id).d + '/' + capState(p.id).n) + '</b></button></div></section>';
  return h;
}

/* ---------- Hedef seçimi (karşılama) ---------- */
let OB = { step: 0, path: null, exp: null, hours: 5 };
const EXP = [['sifir', 'Hiç kullanmadım', 'Excel biliyorum ama Power BI’ı ilk kez açacağım.'], ['biraz', 'Biraz kullandım', 'Hazır raporlara baktım, basit görseller yaptım.'], ['iyi', 'Düzenli kullanıyorum', 'Model kuruyor, DAX ölçüleri yazıyorum.']];
function viewGoal() {
  const roles = PATHS.filter(p => R[p.id] && R[p.id].pick !== false);
  let h = '<div class="wrap ob"><div class="phead"><span class="eyebrow">Hedefini seç · ' + (OB.step + 1) + '/3</span><h1>' + ['Hangi işi yapmak istiyorsun?', 'Power BI deneyimin ne kadar?', 'Haftada kaç saat ayırabilirsin?'][OB.step] + '</h1><p class="muted">' + ['Seçtiğin hedef ana sayfanda yol haritası, bitiş tarihi ve işe hazırlık listesi olarak görünür. İstediğin zaman değiştirebilirsin.', 'Yol haritanda bunu dikkate alırız. Bildiğin seviyeyi atlamak istersen yol haritasından seviye testi çözebilirsin.', 'Bitiş tarihini bu tempoya göre hesaplarız. Düzenli küçük adımlar, seyrek uzun oturumlardan daha iyi sonuç verir.'][OB.step] + '</p></div>';
  h += '<div class="obbar"><i style="width:' + ((OB.step + 1) / 3 * 100) + '%"></i></div>';
  if (OB.step === 0) {
    h += '<div class="rolegrid">' + roles.map(p => { const r = R[p.id], s = stats(p); return '<button class="rolecard' + (OB.path === p.id ? ' on' : '') + '" data-ob-path="' + p.id + '"><span class="ic" style="background:' + p.color + '">' + p.short + '</span><b>' + esc(r.title || p.name) + '</b><small>' + esc(r.who || p.desc) + '</small><span class="rc-meta">' + s.n + ' ders · ~' + fmtH(s.tot) + (r.jobs ? ' · ' + esc(r.jobs[0]) : '') + '</span></button>'; }).join('') + '</div>';
  } else if (OB.step === 1) {
    h += '<div class="optlist">' + EXP.map(([k, t, d]) => '<button class="optcard' + (OB.exp === k ? ' on' : '') + '" data-ob-exp="' + k + '"><b>' + t + '</b><small>' + d + '</small></button>').join('') + '</div>';
  } else {
    const p = PMAP[OB.path], s = stats(p);
    h += '<div class="optlist">' + [2, 5, 8, 12].map(hh => { const w = Math.max(1, Math.ceil(s.rem / (hh * 60))); return '<button class="optcard' + (OB.hours === hh ? ' on' : '') + '" data-ob-hours="' + hh + '"><b>Haftada ' + hh + ' saat</b><small>Yaklaşık ' + w + ' haftada bitirirsin.</small></button>'; }).join('') + '</div>';
  }
  h += '<div class="pager">' + (OB.step ? '<button class="btn" data-ob-back>Geri</button>' : '<button class="btn ghost" data-go="home">Şimdilik geç</button>') + '<button class="btn pri" data-ob-next' + ((OB.step === 0 && !OB.path) || (OB.step === 1 && !OB.exp) ? ' disabled' : '') + '>' + (OB.step === 2 ? 'Yol haritamı oluştur' : 'Devam') + '</button></div></div>';
  return h;
}
function finishGoal() {
  P.goal = { path: OB.path, exp: OB.exp, hours: OB.hours, start: C.today() }; C.save();
  C.toast('Hedefin kaydedildi: ' + ((R[OB.path] || {}).title || PMAP[OB.path].name));
  OB.step = 0; C.go('path', OB.path);
}

/* ---------- Öğrenme yolu sayfası ---------- */
function viewPath(id) {
  const p = PMAP[id]; if (!p) return '<div class="wrap"><div class="panel empty">Öğrenme yolu bulunamadı.</div></div>';
  const r = R[id] || {}, s = stats(p), e = eta(p), nx = nextIn(p), mine = P.goal && P.goal.path === id;
  let h = '<div class="wrap"><div class="crumbs"><button data-go="paths">Öğrenme yolları</button><span>/</span><span>' + esc(p.name) + '</span></div>';
  h += '<section class="panel pathhero" style="--pc:' + p.color + '"><div class="ph-main"><div class="row" style="gap:12px;flex-wrap:nowrap"><span class="ic" style="background:' + p.color + ';height:46px;min-width:46px">' + p.short + '</span><div class="grow"><span class="eyebrow">' + (mine ? 'Hedefin' : 'Öğrenme yolu') + (r.jobs ? ' · ' + esc(r.jobs.join(' · ')) : '') + '</span><h1>' + esc(r.title || p.name) + '</h1></div></div><p>' + esc(r.long || p.long || p.desc) + '</p>';
  h += '<div class="ph-facts"><span><b>' + s.n + '</b> ders</span><span><b>~' + fmtH(s.tot) + '</b> çalışma</span><span><b>' + milestones(p).length + '</b> aşama</span><span><b>' + (r.cap ? 1 : 0) + '</b> bitirme projesi</span>' + (r.level ? '<span><b>' + esc(r.level) + '</b></span>' : '') + '</div>';
  h += '<div class="row">' + (nx ? '<button class="btn pri" data-lesson="' + nx.id + '" data-ctx="' + id + '">' + (s.done || P.placement ? 'Devam et' : 'Yola başla') + ': ' + esc(nx.title) + '</button>' : '<span class="chip">Tüm dersler tamamlandı</span>') + (mine ? '' : '<button class="btn" data-setgoal="' + id + '">Hedefim yap</button>') + '</div></div>';
  h += '<div class="ph-side">' + ring(s.pct, 112, 'Öğrenme yolu ilerlemesi') + '<small class="muted">' + s.done + '/' + s.n + ' ders</small><small class="muted">Kalan ~' + fmtH(s.rem) + (mine ? '<br>Tahmini bitiş ' + e.date : '') + '</small></div></section>';
  if (r.outcomes) h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Sonunda</span><h2>Bu yolu bitirdiğinde bir şirkette…</h2></div></div><div class="panel cando outcomes"><ul>' + r.outcomes.map(o => '<li>' + esc(o) + '</li>').join('') + '</ul></div></section>';
  h += stateBlock(p, mine) + prereqBlock(r);
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Yol haritası</span><h2>Aşamalar</h2></div></div>' + msStrip(p) + '</section>';
  milestones(p).forEach((m, i) => { const d = m.ids.filter(x => P.done[x]).length; h += '<section class="lvl-block msblock"><div class="lvl-head"><span class="msn">' + (i + 1) + '</span><h2>' + esc(m.t) + '</h2><span class="muted" style="font-size:.88rem">' + d + '/' + m.ids.length + ' ders' + (m.d ? ' · ' + esc(m.d) : '') + '</span></div><div class="panel lessons">' + m.ids.map(x => C.lessonRow(C.LMAP[x], id)).join('') + '</div></section>'; });
  if (r.cap) h += capBlock(id);
  if (r.ready) h += readyBlock(id);
  h += certBlock(id);
  return h + '</div>';
}
/* Seviye testi sonucu ya da testi çözme önerisi */
function stateBlock(p, mine) {
  const sk = p.lessons.filter(id => C.LMAP[id] && C.isSkipped(C.LMAP[id])).length;
  if (sk) return '<div class="panel skipnote"><b>' + sk + ' ders atlandı.</b> Seviye testinde ' + esc(C.lvName(P.placement)) + ' seviyesini geçtin; “sıradaki ders” bunları atlar. Yüzdeye tamamlanmış sayılmazlar; belge için bu derslerin de bitmesi gerekir. <button class="btn sm ghost" data-go="test">Sonucu gör</button></div>';
  const exp = P.goal && P.goal.exp;
  if (mine && exp && exp !== 'sifir' && !P.testDone) return '<div class="panel skipnote"><b>Biraz biliyorsun.</b> Bildiklerini atlamak istersen kısa seviye testini çöz; zorunlu değil. <button class="btn sm" data-go="test">Bildiklerini atlamak için test çöz</button></div>';
  return '';
}
function prereqBlock(r) {
  const q = r.prereq; if (!q) return '';
  const ids = (q.lessons || []).filter(id => C.LMAP[id]); const d = ids.filter(id => P.done[id]).length;
  return '<section class="lvl-block" id="onkosul"><div class="sec-head"><div><span class="eyebrow">Ön koşul</span><h2>' + esc(q.t) + '</h2></div>' + (ids.length ? '<span class="chip">' + d + '/' + ids.length + ' ders</span>' : '') + '</div><p class="muted" style="margin:0 0 8px;max-width:72ch">' + esc(q.d) + (q.path && PMAP[q.path] ? ' <button class="lnk" data-go="path" data-id="' + q.path + '">' + esc((R[q.path] || {}).title || PMAP[q.path].name) + ' yolu</button>' : '') + '</p>' + (ids.length ? '<div class="panel lessons">' + ids.map(x => C.lessonRow(C.LMAP[x])).join('') + '</div>' : '') + '</section>';
}
function capBlock(id) {
  const c = capOf(id), st = P.cap[id] || {}, cs = capState(id);
  let h = '<section class="lvl-block" id="cap"><div class="sec-head"><div><span class="eyebrow">Bitirme projesi · portföyüne koy</span><h2>' + esc(c.title) + '</h2></div><span class="chip">' + cs.d + '/' + cs.n + ' teslim</span></div><div class="panel capbox">';
  h += '<div class="cap-brief"><span class="eyebrow">Brif</span><p>' + c.brief + '</p>' + (c.data ? '<p class="muted"><b>Veri:</b> ' + c.data + '</p><div class="row" style="margin-top:8px"><button class="btn sm" data-act="data-zip">' + ic('dl') + ' Veri setini indir (.zip, CSV)</button></div>' : '') + '</div>';
  if (c.steps) h += '<div>' + (c.guide ? '<div class="row" style="margin-bottom:8px"><button class="btn sm pri" data-go="final">' + esc(c.guide) + '</button></div>' : '') + '<span class="eyebrow">Adımlar</span><ol class="capsteps">' + c.steps.map(x => '<li>' + x + '</li>').join('') + '</ol></div>';
  h += '<div><span class="eyebrow">Teslim kontrol listesi</span><ul class="chk">' + (c.check || []).map((x, i) => '<li><label><input type="checkbox" data-capchk="' + id + ':' + i + '"' + (st[i] ? ' checked' : '') + '> <span>' + x + '</span></label></li>').join('') + '</ul></div>';
  if (c.rubric) h += '<div><span class="eyebrow">Değerlendirme ölçütü (kendini puanla)</span><div class="tbl-wrap"><table class="rubric"><tr><th>Ölçüt</th><th>Yeterli</th><th>İyi</th><th>Çok iyi</th></tr>' + c.rubric.map(rw => '<tr><td><b>' + esc(rw[0]) + '</b></td><td>' + esc(rw[1]) + '</td><td>' + esc(rw[2]) + '</td><td>' + esc(rw[3]) + '</td></tr>').join('') + '</table></div></div>';
  if (c.present) h += '<div class="note"><b>Mülakatta nasıl anlatılır?</b>' + c.present + '</div>';
  return h + '</div></section>';
}
function readyBlock(id) {
  const it = readyItems(id), d = it.filter(x => x.ok).length;
  return '<section class="lvl-block" id="ready"><div class="sec-head"><div><span class="eyebrow">İşe hazırlık</span><h2>“Bu işi yapabilirim” kontrol listesi</h2></div><span class="chip">' + d + '/' + it.length + '</span></div><div class="panel readybox"><div class="bar"><i style="width:' + (it.length ? d / it.length * 100 : 0) + '%"></i></div><ul class="readyl">' + it.map(x => '<li class="' + (x.ok ? 'ok' : '') + '"><span class="rk">' + (x.auto ? '<span class="check ' + (x.ok ? 'done' : '') + '">' + (x.ok ? ic('tick', 3.2) : '') + '</span>' : '<input type="checkbox" data-rdy="' + id + ':' + x.i + '"' + (x.ok ? ' checked' : '') + ' aria-label="' + esc(x.t) + '">') + '</span><span class="grow"><b>' + esc(x.t) + '</b>' + (x.d ? '<small>' + esc(x.d) + '</small>' : '') + '</span>' + (x.info ? '<span class="chip">' + esc(x.info) + '</span>' : '') + (x.go ? '<button class="btn sm ghost" data-go="' + x.go[0] + '"' + (x.go[1] ? ' data-id="' + x.go[1] + '"' : '') + '>' + esc(x.go[2] || 'Aç') + '</button>' : '') + '</li>').join('') + '</ul><p class="muted" style="font-size:.84rem;margin:0">Yeşil tikler otomatik dolar (ders, sınav, proje). Kutucuklu maddeleri kendin işaretlersin; dürüst ol, bu liste senin için.</p></div></section>';
}
function certBlock(id) {
  const ok = certReady(id), s = stats(PMAP[id]), it = readyItems(id);
  return '<section class="lvl-block"><div class="panel certcta' + (ok ? ' on' : '') + '"><div class="cc-seal" aria-hidden="true">' + ic('trophy', 1.6) + '</div><div class="grow"><b>' + (ok ? 'Tamamlama belgen hazır' : 'Tamamlama belgesi') + '</b><small>' + (ok ? 'Adını yaz, yazdır ya da PDF olarak kaydet; portföyüne ve LinkedIn profiline ekle.' : 'Tüm dersler (' + s.done + '/' + s.n + ') ve işe hazırlık listesi (' + it.filter(x => x.ok).length + '/' + it.length + ') tamamlanınca açılır.') + '</small></div><button class="btn' + (ok ? ' pri' : '') + '" data-go="sertifika" data-id="' + id + '"' + (ok ? '' : ' disabled') + '>Belgeyi aç</button></div></section>';
}

/* ---------- Belge ---------- */
function code(id) { let h = 2166136261; const k = id + '|' + (P.name || '') + '|' + (P.cert[id] || ''); for (let i = 0; i < k.length; i++) { h ^= k.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return 'PBP-' + h.toString(36).toUpperCase().padStart(7, '0').slice(0, 7); }
function viewCert(id) {
  const p = PMAP[id]; if (!p) return '<div class="wrap">' + '<span class="eyebrow">Kariyer</span><h1>Belgelerim</h1><p class="muted" style="max-width:66ch">Bir öğrenme yolunun tüm dersleri ve işe hazırlık listesi tamamlanınca o yolun tamamlama belgesi açılır. Bu belge kendi beyanına dayalıdır; Microsoft sertifikası değildir.</p><div class="paths">' + PATHS.filter(x => R[x.id]).map(x => { const ok = certReady(x.id), st = stats(x); return '<button class="panel pcard" style="--pc:' + x.color + '" data-go="' + (ok ? 'sertifika' : 'path') + '" data-id="' + x.id + '"><b>' + esc(x.name) + '</b><p>' + (ok ? 'Belge hazır: aç, adını yaz, indir.' : st.done + '/' + st.n + ' ders tamamlandı') + '</p></button>'; }).join('') + '</div></div>';
  if (!certReady(id)) return '<div class="wrap"><div class="panel empty">Bu belge, öğrenme yolunun tüm dersleri ve işe hazırlık listesi tamamlanınca açılır. <button class="btn sm" data-go="path" data-id="' + id + '">Yola dön</button></div></div>';
  if (!P.cert[id]) { P.cert[id] = C.today(); C.save(); }
  const r = R[id] || {}, s = stats(p), dt = new Date(P.cert[id] + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  return '<div class="wrap"><div class="row noprint" style="justify-content:space-between"><div class="crumbs"><button data-go="path" data-id="' + id + '">' + esc(p.name) + '</button><span>/</span><span>Belge</span></div><div class="row"><input class="input" id="certName" placeholder="Adın ve soyadın" value="' + esc(P.name || '') + '" style="max-width:240px" aria-label="Adın ve soyadın"><button class="btn" data-act="cert-dl" data-id="' + id + '">Belgeyi indir</button><button class="btn pri" data-act="cert-print">Yazdır / PDF</button></div></div>' +
    '<article class="cert" style="--pc:' + p.color + '"><div class="cert-brand"><span class="marker k" aria-hidden="true"><svg viewBox="0 0 26 26" width="26" height="26"><rect x="0.5" y="0.5" width="25" height="25" rx="7" fill="var(--accent)"/><path d="M0.5 15.5 L15.5 0.5 H20.5 L0.5 20.5 Z" fill="var(--bg)"/><rect x="13.4" y="14.5" width="2.6" height="6.5" rx="1.1" fill="var(--accent-ink)"/><rect x="17.2" y="11.5" width="2.6" height="9.5" rx="1.1" fill="var(--accent-ink)"/><rect x="21" y="8.5" width="2.6" height="12.5" rx="1.1" fill="var(--accent-ink)"/></svg></span><b>Kesit<span> Power BI</span></b></div><span class="eyebrow">Tamamlama belgesi</span><h1 id="certWho">' + esc(P.name || 'Adın Soyadın') + '</h1><p>Kesit Power BI <b>' + esc(r.title || p.name) + '</b> öğrenme yolunun ' + s.n + ' dersini, uygulamalı alıştırmalarını, bitirme projesini ve işe hazırlık listesini tamamladı.</p>' +
    (r.outcomes ? '<ul class="cert-skills">' + r.outcomes.slice(0, 6).map(o => '<li>' + esc(o) + '</li>').join('') + '</ul>' : '') +
    '<div class="cert-foot"><span><small>Tarih</small><b>' + dt + '</b></span><span><small>Çalışma</small><b>~' + fmtH(s.tot) + '</b></span><span><small>Belge kodu</small><b>' + code(id) + '</b></span></div><p class="cert-note">Bu belge Kesit Power BI’daki kişisel ilerleme kaydına dayanır; kendi beyanına dayalıdır ve bağımsız olarak doğrulanmamıştır. Microsoft sertifikası değildir; Microsoft ile bir bağı yoktur. İşverene gösterirken bitirme projeni ve portföyünü birlikte paylaş.</p></article></div>';
}

/* ---------- Bitirme projeleri listesi ---------- */
function viewProjects() {
  const ids = PATHS.filter(p => capOf(p.id)).map(p => p.id);
  return '<div class="wrap">' + C.head('Kariyer', 'Bitirme projeleri', 'Her öğrenme yolu, iş görüşmesinde gösterebileceğin bir portföy projesiyle biter. Brif, adımlar, teslim listesi ve değerlendirme ölçütü projenin sayfasında. Tam program projesinin 10 aşamalı uygulama kılavuzu da burada.', 'projeler') + '<div class="row"><button class="btn" data-go="final">Tam program uygulama kılavuzu: 10 aşama</button><button class="btn ghost" data-act="data-zip">Veri setini indir (.zip, CSV)</button></div><div class="paths">' + ids.map(id => { const p = PMAP[id], c = capOf(id), cs = capState(id); return '<button class="pcard" data-go="path" data-id="' + id + '" data-scroll="cap"><span class="row" style="justify-content:space-between"><span class="ic" style="background:' + p.color + '">' + p.short + '</span><span class="chip">' + cs.d + '/' + cs.n + ' teslim</span></span><h3>' + esc(c.title) + '</h3><p>' + esc((R[id].title || p.name)) + ' yolu</p><span class="bar"><i style="width:' + (cs.n ? cs.d / cs.n * 100 : 0) + '%;background:' + p.color + '"></i></span></button>'; }).join('') + '</div></div>';
}

/* ---------- Öğrenme yolu kartı (liste) ---------- */
function pathCard(p) {
  const s = stats(p), r = R[p.id] || {}, mine = P.goal && P.goal.path === p.id;
  return '<button class="pcard' + (mine ? ' mine' : '') + '" data-go="path" data-id="' + p.id + '"><span class="row" style="justify-content:space-between"><span class="ic" style="background:' + p.color + '">' + p.short + '</span>' + (mine ? '<span class="chip on">Hedefin</span>' : '<span class="chip">' + s.n + ' ders</span>') + '</span><h3>' + esc(r.title || p.name) + '</h3><p>' + esc(r.who || p.desc) + '</p>' + (r.jobs ? '<span class="pc-jobs">' + r.jobs.map(j => '<i>' + esc(j) + '</i>').join('') + '</span>' : '') + '<span class="bar"><i style="width:' + s.pct + '%;background:' + p.color + '"></i></span><span class="foot"><span>%' + s.pct + ' tamamlandı</span><span>~' + fmtH(s.tot) + (r.cap ? ' · proje' : '') + '</span></span></button>';
}


/* ---------- Veri setini indir (CSV'ler + README, tek .zip) ---------- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }; })();
function zip(files) {
  const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
  const u16 = n => [n & 255, (n >>> 8) & 255], u32 = n => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
  files.forEach(f => { const name = enc.encode(f.name), data = enc.encode(f.text), crc = CRC(data);
    const hdr = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
    parts.push(new Uint8Array(hdr), name, data);
    cen.push([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off)), name);
    off += hdr.length + name.length + data.length; });
  let csz = 0; const cparts = []; for (let i = 0; i < cen.length; i += 2) { const a = new Uint8Array(cen[i]); cparts.push(a, cen[i + 1]); csz += a.length + cen[i + 1].length; }
  const end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(csz), u32(off), u16(0)));
  return new Blob(parts.concat(cparts, [end]), { type: 'application/zip' });
}
const DATA_TABLES = ['Satislar', 'Urunler', 'Kategoriler', 'Musteriler', 'Tarih', 'Hedefler', 'Calisanlar', 'Departmanlar', 'StokGorunum', 'WebOlaylari', 'DovizKurlari', 'ParaBirimleri', 'GiderTurleri', 'Giderler', 'GiderButce', 'Talepler', 'Tedarikciler', 'SatinAlmalar', 'Projeler'];
function csvOf(t) {
  const T = C.MODEL.tables[t]; const q = v => { if (v == null) return ''; if (v instanceof Date) return v.toISOString().slice(0, 10); if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'; const s = String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return '﻿' + T.cols.join(',') + '\r\n' + T.rows.map(r => T.cols.map(c => q(r[c])).join(',')).join('\r\n') + '\r\n';
}
const README = 'Kesit Power BI · Anadolu Market örnek veri seti\r\n\r\nBu dosyalar uygulamadaki derslerin, vakaların ve bitirme projelerinin kullandığı modelin tablolarıdır. Tamamen kurgusaldır; portföyünde serbestçe kullanabilirsin (CC BY-NC 4.0). Şirket ölçeği öğretim için sıkıştırılmıştır: tutarlar birbiriyle gerçek şirket oranlarında değildir.\r\n\r\nBiçim: UTF-8 (BOM’lu) CSV, ayraç virgül, ondalık ayırıcı nokta, tarihler YYYY-AA-GG.\r\nPower BI Desktop: Veri al > Metin/CSV. Dosya kaynağı 65001: Unicode (UTF-8) olsun. Sayı ve tarih türlerini değiştirirken “Yerel ayarı kullanarak” > İngilizce (Amerika Birleşik Devletleri) seç; böylece 12.5 doğru okunur.\r\n\r\nİlişkiler (1 → *):\r\n' + '%REL%' + '\r\nTarih tablosunu “Tarih tablosu olarak işaretle”; Satislar[Tarih] ile Tarih[Tarih] arasında ilişki kur. Satislar[TeslimTarihi] ile ikinci (pasif) bir ilişki rol oynayan boyut dersinde kullanılır.\r\n';
async function downloadData() {
  const rel = (C.MODEL.rels || []).filter(r => DATA_TABLES.includes(r.from) && DATA_TABLES.includes(r.to)).map(r => '- ' + r.to + '[' + r.toCol + '] → ' + r.from + '[' + r.fromCol + ']' + (r.inactive || r.active === false ? ' (pasif)' : '')).join('\r\n');
  const files = DATA_TABLES.filter(t => C.MODEL.tables[t]).map(t => ({ name: t + '.csv', text: csvOf(t) })).concat([{ name: 'BENIOKU.txt', text: README.replace('%REL%', rel || '- Model sayfasındaki diyagrama bak.') }]);
  return saveFile('kesit-powerbi-anadolu-market.zip', zip(files));
}
async function saveFile(filename, data) {
  try { const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    if (dl) { await dl.save({ filename, data }); C.toast('İndirildi: ' + filename); return; } } catch (e) { if (e && e.code === 'declined') return; }
  try { const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); }
  catch (e) { C.toast('Bu görünümde indirme yapılamıyor.'); }
}
function certHtml(id) {
  const el = document.querySelector('.cert'); if (!el) return null; const css = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
  return '<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Kesit Power BI belgesi</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=IBM+Plex+Sans:wght@400;600&display=swap"><style>' + css + ' body{background:#F1F0EC;padding:32px;margin:0}</style></head><body>' + el.outerHTML + '</body></html>';
}

/* ---------- Olaylar ---------- */
document.addEventListener('click', ev => {
  const t = ev.target.closest('button, a'); if (!t) return;
  if (t.dataset.obPath) { OB.path = t.dataset.obPath; C.render(); return; }
  if (t.dataset.obExp) { OB.exp = t.dataset.obExp; C.render(); return; }
  if (t.dataset.obHours) { OB.hours = +t.dataset.obHours; C.render(); return; }
  if (t.hasAttribute('data-ob-back')) { OB.step = Math.max(0, OB.step - 1); C.render(); return; }
  if (t.hasAttribute('data-ob-next')) { if (OB.step < 2) { OB.step++; C.render(); window.scrollTo(0, 0); } else finishGoal(); return; }
  if (t.dataset.setgoal) { const id = t.dataset.setgoal; P.goal = { path: id, exp: (P.goal || {}).exp || null, hours: (P.goal || {}).hours || 5, start: C.today() }; C.save(); C.toast('Hedefin: ' + ((R[id] || {}).title || PMAP[id].name)); C.render(); return; }
  if (t.dataset.act === 'cert-print') { try { window.print(); } catch (e) { C.toast('Yazdırma bu görünümde kapalı; “Belgeyi indir”i kullan.'); } return; }
  if (t.dataset.act === 'cert-dl') { const h = certHtml(); if (h) saveFile('kesit-powerbi-belge-' + (t.dataset.id || '') + '.html', h); return; }
  if (t.dataset.act === 'data-zip') { downloadData(); return; }
  if (t.dataset.scroll) { const sc = t.dataset.scroll; setTimeout(() => { const el = document.getElementById(sc); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); }
});
function rerenderKeep(sel) { const y = window.scrollY; C.render(); window.scrollTo(0, y); const n = document.querySelector(sel); if (n) n.focus({ preventScroll: true }); }
document.addEventListener('change', ev => {
  const el = ev.target;
  if (el.dataset && el.dataset.capchk) { const [id, i] = el.dataset.capchk.split(':'); P.cap[id] = P.cap[id] || {}; P.cap[id][i] = el.checked; if (el.checked) C.addXP(5); C.save(); rerenderKeep('[data-capchk="' + el.dataset.capchk + '"]'); }
  if (el.dataset && el.dataset.rdy) { const [id, i] = el.dataset.rdy.split(':'); P.ready[id] = P.ready[id] || {}; P.ready[id][i] = el.checked; C.save(); rerenderKeep('[data-rdy="' + el.dataset.rdy + '"]'); }
});
document.addEventListener('input', ev => { if (ev.target.id === 'certName') { P.name = ev.target.value.slice(0, 60); C.save(); const w = document.getElementById('certWho'); if (w) w.textContent = P.name || 'Adın Soyadın'; } });

C.view('hedef', { render: () => { if (OB.step === 0 && !OB.path && P.goal) { OB.path = P.goal.path; OB.exp = P.goal.exp; OB.hours = P.goal.hours || 5; } return viewGoal(); }, hash: 'hedef' });
C.view('sertifika', { render: id => viewCert(id), hash: 'sertifika' });
C.view('projeler', { render: viewProjects, hash: 'projeler' });
window.PBI_CAREER = { DATA_TABLES, downloadData, saveFile, homeGoal, viewPath, pathCard, stats, milestones, readyItems, readyPct, certReady, capState, eta, fmtH, estMin, msStrip, ring };
})();
