/* Kesit Power BI — DAX Arena: gizli testli meydan okumalar, günün sorusu, hız turu, sonucu tahmin et, ölçü bulmacası, DAX Dedektif, haftalık set. */
(function () {
'use strict';
const C = window.PBI_CORE, X = C.X, V = C.V, esc = C.esc, $ = C.$, P = C.P;
const CH = window.PBI_AR_CH || [], PRED = window.PBI_AR_PRED || [], PZ = window.PBI_AR_PZ || [], DET = window.PBI_AR_DET || [], RANKS = window.PBI_AR_RANKS, PTS = window.PBI_AR_PTS, SETS = window.PBI_AR_SETS;
const CHMAP = {}; CH.forEach(c => CHMAP[c.id] = c); const PZMAP = {}; PZ.forEach(z => PZMAP[z.id] = z); const DETMAP = {}; DET.forEach(d => DETMAP[d.id] = d);
const DIFFN = { kolay: 'Kolay', orta: 'Orta', zor: 'Zor' };
const A = () => { P.arena = Object.assign({ pts: 0, ch: {}, att: {}, speed: { best: 0, runs: 0 }, pred: {}, pz: {}, det: {}, tour: {} }, P.arena || {}); return P.arena; };
const plain = s => String(s || '').replace(/<[^>]+>/g, '');
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
const seeded = (arr, seed) => { const a = arr.slice(); let h = hash(seed); for (let i = a.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmtT = s => Math.floor(s / 60) + ':' + String(Math.max(0, s) % 60).padStart(2, '0');
const fmtV = (v, f) => f === 'metin' ? String(v) : v === null || v === undefined ? '(Boş)' : V.fmt(v, f === 'adet' ? undefined : f);
function rank() { const a = A(); let i = 0; RANKS.forEach((r, j) => { if (a.pts >= r[0]) i = j; }); const next = RANKS[i + 1]; return { i, name: RANKS[i][1], next, pct: next ? Math.round((a.pts - RANKS[i][0]) / (next[0] - RANKS[i][0]) * 100) : 100 }; }
function award(n, why) { if (!n) return; const a = A(); a.pts += n; C.addXP(Math.round(n / 2)); C.save(); C.toast('+' + n + ' puan · ' + why); }
const todayKey = () => C.today();
const daily = () => { const pool = CH.filter(c => c.diff !== 'kolay'); return pool[hash('gun' + todayKey()) % pool.length]; };
const weekKey = () => { const d = new Date(); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(); const wk = Math.ceil(((t - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7); return y + '-H' + String(wk).padStart(2, '0'); };
const tourSet = wk => seeded(CH.filter(c => c.diff !== 'kolay'), 'tur' + wk).slice(0, 5);
const head = (title, sub) => '<div class="lhead"><div class="crumbs"><button data-go="arena">DAX Arena</button><span>/</span><span>' + esc(title) + '</span></div>' + (sub ? '<p class="muted" style="margin:0;max-width:80ch">' + sub + '</p>' : '') + '</div>';

/* ---------- Merkez ---------- */
function hub() {
  const a = A(), rk = rank(), dl = daily(), dDone = a.ch[dl.id] && a.ch[dl.id].date === todayKey(); const wk = weekKey(), tb = a.tour[wk];
  let h = '<div class="wrap" style="gap:16px">' + C.head('Pratik', 'DAX Arena', 'Gizli testli meydan okumalar, günlük soru, hız turu, tahmin, bulmaca, dedektif vakaları ve haftalık set.', 'arena');
  h += '<section class="panel ar-rank"><div class="ar-badge">' + (rk.i + 1) + '</div><div style="min-width:0"><span class="eyebrow">Unvan</span><h2>' + esc(rk.name) + '</h2><div class="bar"><i style="width:' + rk.pct + '%"></i></div><span class="muted" style="font-size:.8rem">' + (rk.next ? (rk.next[0] - a.pts) + ' puan sonra: ' + esc(rk.next[1]) : 'En yüksek unvana ulaştın') + '</span></div><div class="ar-nums"><div><b>' + a.pts + '</b><span>puan</span></div><div><b>' + Object.keys(a.ch).length + '/' + CH.length + '</b><span>meydan okuma</span></div><div><b>' + (a.speed.best || 0) + '</b><span>hız rekoru</span></div></div></section>';
  h += '<section class="panel ar-daily"><div style="min-width:0"><span class="eyebrow">Günün sorusu · ' + (dDone ? 'bugün çözüldü' : 'puan × 1,5') + '</span><h3>' + esc(dl.name) + '</h3><span class="muted" style="font-size:.85rem">' + esc(SETS[dl.set]) + ' · ' + DIFFN[dl.diff] + ' · ' + Math.round(PTS[dl.diff] * 1.5) + ' puan</span></div><button class="btn pri" data-arg="ch-' + dl.id + '">' + (dDone ? 'Tekrar aç' : 'Çöz') + '</button></section>';
  const det = DET.map(d => ['det-' + d.id, 'DAX Dedektif: ' + d.title, plain(d.intro).split('.')[0] + '.', (a.det[d.id] || 0) + '/' + d.steps.length + ' adım']);
  const modes = [
    ['liste', 'Meydan okumalar', 'Gizli testli problemler. Kolay 10, orta 25, zor 50 puan; ipucu puanı %30 düşürür.', Object.keys(a.ch).length + '/' + CH.length + ' çözüldü'],
    ['turnuva', 'Haftalık set', '5 orta-zor problem, 30 dakika, ipucu yok. Her hafta yeni set; hepsini çözene %25 bonus.', tb ? 'Bu hafta en iyi: ' + tb.best + ' puan' : 'Bu hafta: ' + wk],
    ['hiz', 'Hız turu', '5 dakikada çözebildiğin kadar kısa ölçü. Doğru cevap seni bir sonrakine geçirir.', 'Rekor: ' + (a.speed.best || 0)],
    ['tahmin', 'Sonucu tahmin et', 'Ölçüyü çalıştırmadan değerini tahmin et. Seçenekler tuzak ölçülerin gerçek çıktısıdır.', Object.keys(a.pred).length + '/' + PRED.length + ' cevaplandı'],
    ['bulmaca', 'Ölçü bulmacası', 'Satırları doğru sıraya diz, tuzak satırları dışarıda bırak. Ölçü çalıştırılarak kontrol edilir.', Object.keys(a.pz).length + '/' + PZ.length + ' çözüldü']
  ].concat(det).concat([['mulakat', 'Mülakat simülasyonu', 'Süreli, gerçek bir BI mülakatı gibi 4 klasik soru ve takip soruları.', 'Sınavlar bölümünde'], ['serbest', 'Serbest çalışma', 'Kendi ölçünü yaz, istediğin kırılımda dene: DAX Playground.', 'Puansız']]);
  h += '<div class="tools ar-modes">' + modes.map(([k, t, d, m]) => '<button class="tool" data-arg="' + k + '"><b>' + esc(t) + '</b><small>' + esc(d) + '</small><span class="chip">' + esc(m) + '</span></button>').join('') + '</div>';
  return h + '</div>';
}

/* ---------- Meydan okumalar ---------- */
const CF = { diff: '' };
function chList() {
  const a = A();
  let h = '<div class="wrap" style="gap:16px">' + head('Meydan okumalar', 'Her problemde ölçün önce görünen tabloda, sonra görmediğin kırılım ve dilimleyicilerde (gizli testler) doğru çözümle karşılaştırılır.');
  h += '<div class="filters">' + ['', 'kolay', 'orta', 'zor'].map(d => '<button data-arcf="' + d + '" aria-pressed="' + (CF.diff === d) + '">' + (d ? DIFFN[d] + ' · ' + PTS[d] + ' puan' : 'Tümü') + '</button>').join('') + '</div>';
  Object.keys(SETS).forEach(sk => { const it = CH.filter(c => c.set === sk && (!CF.diff || c.diff === CF.diff)); if (!it.length) return;
    h += '<section class="lvl-block"><div class="lvl-head"><h2>' + esc(SETS[sk]) + '</h2><span class="muted" style="font-size:.85rem">' + it.filter(c => a.ch[c.id]).length + '/' + it.length + ' çözüldü</span></div><div class="panel lessons">' + it.map(c => { const r = a.ch[c.id]; return '<button class="litem" data-arg="ch-' + c.id + '"><span class="check ' + (r ? 'done' : '') + '">' + (r ? C.ic('tick', 3.2) : '') + '</span><span style="min-width:0"><b>' + esc(c.name) + '</b><small>' + esc(plain(c.q).replace(/^[^:]*:\s*/, '').slice(0, 120)) + '</small></span><span class="row" style="gap:6px;flex-wrap:nowrap"><span class="chip df-' + c.diff + '">' + DIFFN[c.diff] + '</span><span class="chip">' + (r ? r.pts + ' puan alındı' : PTS[c.diff] + ' puan') + '</span>' + (a.att[c.id] ? '<span class="chip">' + a.att[c.id] + ' deneme</span>' : '') + '</span></button>'; }).join('') + '</div></section>'; });
  return h + '</div>';
}
function sample(c) {
  const g = (c.grid || [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }])[0];
  try { const ms = C.measureSet(c.name); const r = X.query({ rows: [g], measures: ms, values: [c.sol], slicers: [], totals: !c.noTotal, keepBlank: false }); const f = C.fmtOf(c.name) || C.guessFmt(c.name);
    return '<div class="ar-sample"><b>Örnek çıktı</b><table><thead><tr><th>' + esc(g.t + '[' + g.c + ']') + '</th><th class="nc">' + esc(c.name) + '</th></tr></thead><tbody>' + r.rows.slice(0, 5).map(x => '<tr><td>' + esc(V.fmt(x.keys[0])) + '</td><td class="nc">' + esc(C.fmtVal(x.vals[0], f)) + '</td></tr>').join('') + (r.rows.length > 5 ? '<tr><td colspan="2" class="muted">… ' + (r.rows.length - 5) + ' satır daha</td></tr>' : '') + (!c.noTotal && r.total !== undefined ? '<tr class="tot"><td>Toplam</td><td class="nc">' + esc(C.fmtVal(Array.isArray(r.total) ? r.total[0] : r.total, f)) + '</td></tr>' : '') + '</tbody></table></div>'; }
  catch (e) { return ''; }
}
let HINTED = {};
function chView(id) {
  const c = CHMAP[id]; if (!c) return chList(); const a = A(); const dl = daily(); const isDaily = dl.id === c.id; const r = a.ch[id];
  const pts = Math.round(PTS[c.diff] * (isDaily ? 1.5 : 1));
  let h = '<div class="wrap" style="gap:16px">' + head('Meydan okumalar') + '<div class="row" style="justify-content:space-between;align-items:end"><h1 style="font-size:clamp(1.4rem,3vw,1.9rem)">' + esc(c.name) + '</h1><span class="row" style="gap:6px"><span class="chip df-' + c.diff + '">' + DIFFN[c.diff] + '</span><span class="chip">' + (r ? r.pts + ' puan alındı' : pts + ' puan' + (isDaily ? ' (günün sorusu)' : '')) + '</span><span class="chip">' + (c.hidden || []).length + ' gizli test</span></span></div>';
  h += sample(c);
  h += C.exView(c, 'ar:' + id, () => { const aa = A(); if (aa.ch[id]) return; const p2 = Math.round(pts * (HINTED[id] ? 0.7 : 1)); aa.ch[id] = { pts: p2, hint: !!HINTED[id], date: todayKey() }; award(p2, c.name); }, { arena: true, onHint: () => { HINTED[id] = true; }, onWrong: () => { const aa = A(); aa.att[id] = (aa.att[id] || 0) + 1; C.save(); } });
  const next = CH.find(x => !a.ch[x.id] && x.id !== id);
  h += '<div class="pager"><button class="btn" data-arg="liste">Listeye dön</button>' + (next ? '<button class="btn pri" data-arg="ch-' + next.id + '">Sıradaki: ' + esc(next.name) + '</button>' : '') + '</div>';
  return h + '</div>';
}

/* ---------- Hız turu ---------- */
const SPOOL = () => (window.PBI_PRACTICE || []).filter(p => p.L === 'temel' && p.t === 'dax').concat((window.PBI_CODEPOOL || []).filter(t => t.L === 'temel'), CH.filter(c => c.diff === 'kolay').map(c => Object.assign({}, c, { hidden: null })));
let SP = null, spTick = null;
function spView() {
  const a = A();
  if (!SP) return '<div class="wrap" style="gap:16px">' + head('Hız turu', '5 dakika içinde olabildiğince çok kısa ölçü yaz. Doğru çözünce bir sonrakine geçersin; takıldığında atlayabilirsin. Her doğru 2 puan.') + '<div class="panel finish"><span class="eyebrow">Rekorun</span><h2>' + (a.speed.best || 0) + ' doğru</h2><p class="muted" style="margin:0">' + (a.speed.runs || 0) + ' tur oynandı · havuzda ' + SPOOL().length + ' görev</p><button class="btn pri" data-arsp="start">Başla</button></div></div>';
  if (SP.done) { const nb = SP.ok >= (a.speed.best || 0) && SP.ok > 0; return '<div class="wrap" style="gap:16px">' + head('Hız turu') + '<div class="panel finish"><span class="eyebrow">Süre doldu</span><h2>' + SP.ok + ' doğru' + (nb ? ' · yeni rekor!' : '') + '</h2><p class="muted" style="margin:0">' + SP.skip + ' atlandı · rekor ' + a.speed.best + '</p><div class="row"><button class="btn pri" data-arsp="start">Yeniden oyna</button><button class="btn" data-arg="">Arena</button></div></div></div>'; }
  const t = SP.list[SP.i];
  let h = '<div class="wrap" style="gap:14px">' + head('Hız turu') + '<div class="row" style="justify-content:space-between"><span class="clock" id="spClock">' + fmtT(Math.round((SP.end - Date.now()) / 1000)) + '</span><span class="row" style="gap:8px"><b class="sp-ok">' + SP.ok + ' doğru</b><button class="btn sm" data-arsp="skip">Atla</button></span></div>';
  h += C.exView(t, 'sp:' + SP.run + ':' + SP.i, () => { if (!SP || SP.done) return; SP.ok++; C.save(); setTimeout(() => { if (SP && !SP.done) { SP.i = (SP.i + 1) % SP.list.length; C.render(); } }, 500); }, { exam: true });
  return h + '</div>';
}
function spStart() { SP = { list: seeded(SPOOL(), 'sp' + Date.now()), i: 0, ok: 0, skip: 0, run: Date.now().toString(36), end: Date.now() + 5 * 60000, done: false }; C.render(); spClock(); }
function spClock() { clearInterval(spTick); spTick = setInterval(() => { if (!SP || SP.done) { clearInterval(spTick); return; } const s = Math.round((SP.end - Date.now()) / 1000); const el = $('#spClock'); if (el) { el.textContent = fmtT(s); el.classList.toggle('late', s < 30); } if (s <= 0) spFinish(); }, 500); }
function spFinish() { if (!SP || SP.done) return; SP.done = true; clearInterval(spTick); const a = A(); a.speed.runs = (a.speed.runs || 0) + 1; if (SP.ok > (a.speed.best || 0)) a.speed.best = SP.ok; Object.keys(P.drafts).forEach(k => { if (k.startsWith('sp:')) delete P.drafts[k]; }); award(SP.ok * 2, 'hız turu'); C.save(); if (C.state().view === 'arena') C.render(); }

/* ---------- Sonucu tahmin et ---------- */
let PRI = 0; const PRS = {};
function predOpts(p) {
  if (PRS[p.id]) return PRS[p.id];
  const ms = C.measureSet(); const vals = [p.expr].concat(p.traps).map(e => { try { return fmtV(X.evalMeasure(ms, e, p.ctx), p.fmt); } catch (er) { return null; } });
  const uniq = []; vals.forEach((v, i) => { if (v !== null && !uniq.some(u => u.v === v)) uniq.push({ v, ok: i === 0 }); });
  return (PRS[p.id] = seeded(uniq, p.id));
}
function predView() {
  const a = A(); const p = PRED[PRI % PRED.length]; const opts = predOpts(p); const done = a.pred[p.id];
  let h = '<div class="wrap" style="gap:16px;max-width:920px">' + head('Sonucu tahmin et', 'Ölçüyü çalıştırmadan, verilen filtre bağlamında ne döndüreceğini tahmin et. İlk denemede doğru: 5 puan.');
  h += '<div class="exgrid">' + PRED.map((x, i) => '<button data-arpi="' + i + '" class="' + (a.pred[x.id] !== undefined ? 'ans ' : '') + (i === PRI % PRED.length ? 'cur' : '') + '">' + (i + 1) + (a.pred[x.id] === true ? ' ✓' : a.pred[x.id] === false ? ' ✗' : '') + '</button>').join('') + '</div>';
  h += '<div class="panel brief"><span class="eyebrow">Filtre bağlamı</span><div class="ctxchips">' + (p.ctx.length ? p.ctx.map(f => '<span class="chip">' + esc(f.t + '[' + f.c + '] = ' + f.values.join(', ')) + '</span>').join('') : '<span class="chip">Hiç filtre yok (toplam)</span>') + '</div><span class="muted" style="font-size:.85rem">' + esc(p.ctxLabel) + '</span><pre class="dax" data-notry>' + esc(p.expr) + '</pre><b>Bu ölçü ne döndürür?</b><div class="mc" id="prMc">' + opts.map((o, i) => '<button data-arpo="' + i + '"><span class="key">' + String.fromCharCode(65 + i) + '</span><span>' + esc(o.v) + '</span></button>').join('') + '</div><div id="prFb">' + (done !== undefined ? '<div class="msg info"><b>' + (done ? 'İlk denemede doğru bildin.' : 'Bu soruyu daha önce cevapladın.') + '</b>' + esc(p.why) + '</div>' : '') + '</div></div>';
  h += '<div class="pager"><button class="btn" data-arpi="' + ((PRI + PRED.length - 1) % PRED.length) + '">Önceki</button><button class="btn pri" data-arpi="' + ((PRI + 1) % PRED.length) + '">Sonraki soru</button></div>';
  return h + '</div>';
}

/* ---------- Ölçü bulmacası ---------- */
let PZS = null;
function pzList() {
  const a = A();
  return '<div class="wrap" style="gap:16px">' + head('Ölçü bulmacası', 'Bir ölçünün satırları karıştırıldı ve araya tuzak satırlar eklendi. Doğru satırları doğru sıraya diz; ölçü çalıştırılıp doğru sonucu verirse bulmaca çözülür. Kolay 10, orta 15, zor 25 puan.') + '<div class="panel lessons">' + PZ.map(z => '<button class="litem" data-arg="pz-' + z.id + '"><span class="check ' + (a.pz[z.id] ? 'done' : '') + '">' + (a.pz[z.id] ? C.ic('tick', 3.2) : '') + '</span><span style="min-width:0"><b>' + esc(z.name) + '</b><small>' + esc(z.q) + '</small></span><span class="row" style="gap:6px;flex-wrap:nowrap"><span class="chip df-' + z.diff + '">' + DIFFN[z.diff] + '</span><span class="chip">' + (z.lines.length + z.traps.length) + ' parça</span></span></button>').join('') + '</div></div>';
}
function pzView(id) {
  const z = PZMAP[id]; if (!z) return pzList(); const a = A();
  if (!PZS || PZS.id !== id) PZS = { id, pool: seeded(z.lines.map((l, i) => ({ l, k: 'L' + i })).concat(z.traps.map((l, i) => ({ l, k: 'T' + i }))), id), used: [], msg: '' };
  let h = '<div class="wrap" style="gap:16px">' + head('Ölçü bulmacası') + '<div class="row" style="justify-content:space-between;align-items:end"><h1 style="font-size:clamp(1.4rem,3vw,1.9rem)">' + esc(z.name) + '</h1><span class="chip df-' + z.diff + '">' + DIFFN[z.diff] + (a.pz[id] ? ' · çözüldü' : '') + '</span></div><p style="margin:0">' + esc(z.q) + ' Kontrol: ' + z.grid.map(g => '<code>' + esc(g.t + '[' + g.c + ']') + '</code>').join(' ve ') + ' kırılımı.</p>';
  h += '<div class="pz-grid"><div class="panel pz-box"><span class="eyebrow">Parçalar (' + PZS.pool.filter(p => !PZS.used.includes(p.k)).length + ')</span>' + PZS.pool.map(p => PZS.used.includes(p.k) ? '' : '<button class="pz-piece" data-arpz="' + p.k + '"><code>' + esc(p.l) + '</code></button>').join('') + '</div>';
  h += '<div class="panel pz-box pz-ans"><span class="eyebrow">' + esc(z.name) + ' =</span>' + (PZS.used.length ? PZS.used.map((k, i) => { const p = PZS.pool.find(x => x.k === k); return '<button class="pz-piece on" data-arpzr="' + i + '" title="Geri al"><em>' + (i + 1) + '</em><code>' + esc(p.l) + '</code></button>'; }).join('') : '<span class="muted" style="font-size:.86rem">Soldaki parçalara sırayla tıkla. Yanlış koyduğun satıra tıklayınca geri döner.</span>') + '</div></div>';
  h += '<div class="row"><button class="btn pri" data-arpzc="1">Kontrol et</button><button class="btn ghost" data-arpzx="1">Sıfırla</button></div><div id="pzOut">' + PZS.msg + '</div>';
  const nx = PZ.find(x => !a.pz[x.id] && x.id !== id); h += '<div class="pager"><button class="btn" data-arg="bulmaca">Listeye dön</button>' + (nx ? '<button class="btn" data-arg="pz-' + nx.id + '">Sıradaki bulmaca</button>' : '') + '</div>';
  return h + '</div>';
}
function gridVals(ms, expr, grid, noTotal) { const out = []; if (!noTotal) out.push(X.evalMeasure(ms, expr, [])); grid.forEach(g => X.query({ rows: [g], measures: ms, values: [expr], slicers: [], totals: false, keepBlank: true }).rows.forEach(r => out.push(X.keyOf(r.keys[0]) + '=' + (typeof r.vals[0] === 'number' ? Math.round(r.vals[0] * 1e6) / 1e6 : r.vals[0])))); return out.map(v => typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v).join('|'); }
function pzCheck() {
  const z = PZMAP[PZS.id]; const code = PZS.used.map(k => PZS.pool.find(x => x.k === k).l).join('\n'); const ms = C.measureSet();
  if (!PZS.used.length) { PZS.msg = '<div class="msg info">Önce parçaları yerleştir.</div>'; C.render(); return; }
  let mine; try { const er = X.check(code); if (er) throw new X.DaxError(er); mine = gridVals(ms, code, z.grid, z.noTotal); } catch (e) { PZS.msg = '<div class="msg err"><b>Ölçü çalışmıyor</b><span class="vend">' + esc(e.message) + '</span>Satır sırasını ya da eksik parçayı kontrol et.</div>'; C.render(); return; }
  const ref = gridVals(ms, z.lines.join('\n'), z.grid, z.noTotal);
  if (mine === ref) { const a = A(); if (!a.pz[z.id]) { a.pz[z.id] = true; award({ kolay: 10, orta: 15, zor: 25 }[z.diff], z.name); } const tr = PZS.used.filter(k => k[0] === 'T').length; PZS.msg = '<div class="msg ok"><b>Çözüldü!</b>Ölçün doğru sonucu veriyor.' + (tr ? ' Tuzak satır kullandın ama sonucu değiştirmedi.' : '') + '</div>'; }
  else PZS.msg = '<div class="msg err"><b>Ölçü çalışıyor ama sonuç farklı</b>Tuzak satırlardan birini kullanmış ya da bir satırı eksik bırakmış olabilirsin.</div>';
  C.render();
}

/* ---------- DAX Dedektif ---------- */
function clueText(st) { const ms = C.measureSet(); let t = st.clue; (st.vals || []).forEach(([e, f], j) => { let v; try { v = fmtV(X.evalMeasure(ms, e, []), f); } catch (er) { v = '?'; } t = t.split('{' + j + '}').join(v); }); return t; }
function detView(id) {
  const d = DETMAP[id]; if (!d) return hub(); const a = A(); const n = a.det[id] || 0;
  let h = '<div class="wrap" style="gap:16px">' + head('DAX Dedektif: ' + d.title) + '<div class="panel det-intro"><span class="eyebrow">Vaka dosyası</span><p style="margin:0">' + esc(d.intro) + '</p><div class="det-steps">' + d.steps.map((s, i) => '<span class="' + (i < n ? 'ok' : i === n ? 'cur' : '') + '">' + (i + 1) + '. ' + esc(s.title) + '</span>').join('') + '</div></div>';
  d.steps.slice(0, n).forEach((s, i) => { h += '<div class="panel det-clue"><b>' + (i + 1) + '. ' + esc(s.title) + '</b><p>' + esc(clueText(s)) + '</p></div>'; });
  if (n >= d.steps.length) h += '<div class="panel finish"><span class="eyebrow">Vaka kapandı</span><h2>Tebrikler, dedektif.</h2><div class="row"><button class="btn" data-arg="">Arena</button>' + DET.filter(x => x.id !== id).map(x => '<button class="btn pri" data-arg="det-' + x.id + '">Sıradaki vaka: ' + esc(x.title) + '</button>').join('') + '<button class="btn ghost" data-ardr="' + id + '">Vakayı baştan oyna (puansız)</button></div></div>';
  else { const s = d.steps[n]; h += '<div class="det-now"><span class="eyebrow">Adım ' + (n + 1) + ' / ' + d.steps.length + ' · ' + esc(s.title) + '</span><p style="margin:4px 0 10px">' + esc(s.story) + '</p></div>';
    h += C.exView(Object.assign({ hint: 'Önceki adımın ipucunu ve hazır ölçüleri ([İade Oranı %], [YoY %], [Net Satış]) kullan.' }, s), 'det:' + id + ':' + n, () => { const aa = A(); if ((aa.det[id] || 0) !== n) return; aa.det[id] = n + 1; const first = !aa['detdone_' + id]; if (first) { award(20, 'vaka adımı'); if (n + 1 === d.steps.length) { aa['detdone_' + id] = true; award(50, 'vaka kapandı'); } } C.save(); setTimeout(() => { if (C.state().view === 'arena') { C.render(); window.scrollTo(0, document.body.scrollHeight); } }, 700); }); }
  return h + '</div>';
}

/* ---------- Haftalık set ---------- */
let TR = null, trTick = null;
function trView() {
  const a = A(), wk = weekKey(), set = tourSet(wk), tb = a.tour[wk];
  if (!TR || TR.wk !== wk) {
    const hist = Object.entries(a.tour).sort((x, y) => x[0] < y[0] ? 1 : -1).slice(0, 6);
    return '<div class="wrap" style="gap:16px">' + head('Haftalık set', 'Her hafta herkes için aynı 5 problem. 30 dakika, ipucu yok, beklenen değerler gösterilmez; gizli testler açık. Hepsini çözersen %25 bonus.') + '<div class="panel finish"><span class="eyebrow">Bu hafta · ' + wk + '</span><h2>' + (tb ? 'En iyi: ' + tb.best + ' puan (' + tb.solved + '/5)' : 'Henüz oynamadın') + '</h2><ol class="tr-list">' + set.map(c => '<li>' + esc(c.name) + ' <span class="chip df-' + c.diff + '">' + DIFFN[c.diff] + ' · ' + PTS[c.diff] + '</span></li>').join('') + '</ol><button class="btn pri" data-artr="start">' + (tb ? 'Yeniden dene' : 'Turnuvaya başla') + '</button><span class="muted" style="font-size:.82rem">Turnuva puanı Arena puanına yalnızca haftanın en iyi sonucu yükseldiğinde, aradaki fark kadar eklenir.</span></div>' + (hist.length ? '<section class="lvl-block"><h3>Geçmiş haftalar</h3><div class="panel lessons">' + hist.map(([k, v]) => '<div class="litem prof" style="cursor:default"><span class="chip">' + k + '</span><span><b>' + v.best + ' puan</b><small>' + v.solved + '/5 çözüldü</small></span></div>').join('') + '</div></section>' : '') + '</div>';
  }
  if (TR.done) return '<div class="wrap" style="gap:16px">' + head('Haftalık set') + '<div class="panel finish"><span class="eyebrow">Set bitti · ' + TR.wk + '</span><h2>' + TR.score + ' puan · ' + TR.ok.filter(Boolean).length + '/5</h2><p class="muted" style="margin:0">Haftanın en iyisi: ' + (a.tour[TR.wk] || {}).best + ' puan</p><div class="row"><button class="btn pri" data-artr="reset">Turnuva sayfası</button><button class="btn" data-arg="">Arena</button></div></div></div>';
  const i = TR.cur, c = TR.set[i];
  let h = '<div class="wrap" style="gap:14px">' + head('Haftalık set') + '<div class="row" style="justify-content:space-between"><span class="clock" id="trClock">' + fmtT(Math.round((TR.end - Date.now()) / 1000)) + '</span><button class="btn sm" data-artr="finish">Turnuvayı bitir</button></div><div class="exgrid">' + TR.set.map((x, j) => '<button data-artrq="' + j + '" class="' + (TR.ok[j] ? 'ans ' : '') + (j === i ? 'cur' : '') + '">' + (j + 1) + (TR.ok[j] ? ' ✓' : '') + '</button>').join('') + '</div>';
  h += '<div class="row" style="gap:6px"><b>' + esc(c.name) + '</b><span class="chip df-' + c.diff + '">' + DIFFN[c.diff] + ' · ' + PTS[c.diff] + '</span></div>';
  h += C.exView(c, 'tr:' + TR.run + ':' + i, () => { if (TR && !TR.ok[i]) { TR.ok[i] = true; C.toast('Problem ' + (i + 1) + ' çözüldü'); const b = document.querySelector('[data-artrq="' + i + '"]'); if (b) { b.classList.add('ans'); b.textContent = (i + 1) + ' ✓'; } if (TR.ok.every(Boolean)) setTimeout(trFinish, 600); } }, { exam: true, arena: true });
  h += '<div class="pager"><button class="btn" data-artrq="' + Math.max(0, i - 1) + '"' + (i ? '' : ' disabled') + '>Önceki</button>' + (i < 4 ? '<button class="btn pri" data-artrq="' + (i + 1) + '">Sonraki problem</button>' : '') + '</div>';
  return h + '</div>';
}
function trStart() { const wk = weekKey(); TR = { wk, set: tourSet(wk), ok: [false, false, false, false, false], cur: 0, run: Date.now().toString(36), end: Date.now() + 30 * 60000, done: false }; C.render(); trClock(); }
function trClock() { clearInterval(trTick); trTick = setInterval(() => { if (!TR || TR.done) { clearInterval(trTick); return; } const s = Math.round((TR.end - Date.now()) / 1000); const el = $('#trClock'); if (el) { el.textContent = fmtT(s); el.classList.toggle('late', s < 120); } if (s <= 0) trFinish(); }, 1000); }
function trFinish() {
  if (!TR || TR.done) return; TR.done = true; clearInterval(trTick);
  let sc = TR.set.reduce((s, c, j) => s + (TR.ok[j] ? PTS[c.diff] : 0), 0); if (TR.ok.every(Boolean)) sc = Math.round(sc * 1.25); TR.score = sc;
  const a = A(); const prev = a.tour[TR.wk] || { best: 0, solved: 0 }; if (sc > prev.best) { a.tour[TR.wk] = { best: sc, solved: TR.ok.filter(Boolean).length }; award(sc - prev.best, 'turnuva'); } C.save();
  Object.keys(P.drafts).forEach(k => { if (k.startsWith('tr:')) delete P.drafts[k]; });
  if (C.state().view === 'arena') C.render();
}

/* ---------- Görünüm yönlendirme ---------- */
function viewArena(sub) {
  sub = sub || '';
  if (sub === 'liste') return chList();
  if (sub.startsWith('ch-')) return chView(sub.slice(3));
  if (sub === 'hiz') return spView();
  if (sub === 'tahmin') return predView();
  if (sub === 'bulmaca') return pzList();
  if (sub.startsWith('pz-')) return pzView(sub.slice(3));
  if (sub.startsWith('det-')) return detView(sub.slice(4));
  if (sub === 'turnuva') return trView();
  return hub();
}
function mountArena(sub) { sub = sub || ''; if (sub.startsWith('ch-') || sub.startsWith('det-') || (sub === 'hiz' && SP && !SP.done) || (sub === 'turnuva' && TR && !TR.done)) C.exMount(); if (sub === 'hiz' && SP && !SP.done) spClock(); if (sub === 'turnuva' && TR && !TR.done) trClock(); }
C.view('arena', { render: viewArena, mount: mountArena, hash: 'arena' });

document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-arg],[data-arcf],[data-arsp],[data-arpi],[data-arpo],[data-arpz],[data-arpzr],[data-arpzc],[data-arpzx],[data-ardr],[data-artr],[data-artrq]'); if (!t) return;
  const d = t.dataset;
  if (d.arg !== undefined) { if (d.arg === 'mulakat') { window.PBI_EXAMUI.start('mulakat'); return; } if (d.arg === 'serbest') { C.go('studio'); return; } C.go('arena', d.arg || null); window.scrollTo(0, 0); return; }
  if (d.arcf !== undefined) { CF.diff = d.arcf; C.render(); return; }
  if (d.arsp === 'start') { spStart(); return; }
  if (d.arsp === 'skip') { if (SP && !SP.done) { SP.skip++; SP.i = (SP.i + 1) % SP.list.length; C.render(); } return; }
  if (d.arpi !== undefined) { PRI = +d.arpi; C.render(); return; }
  if (d.arpo !== undefined) { const p = PRED[PRI % PRED.length]; const o = predOpts(p)[+d.arpo]; const a = A(); const first = a.pred[p.id] === undefined; if (first) { a.pred[p.id] = o.ok; if (o.ok) award(5, 'tahmin'); else C.save(); }
    document.querySelectorAll('#prMc button').forEach((b, i) => { const oo = predOpts(p)[i]; if (oo.ok) b.classList.add('right'); else if (b === t) b.classList.add('wrong'); });
    $('#prFb').innerHTML = '<div class="msg ' + (o.ok ? 'ok' : 'err') + '"><b>' + (o.ok ? 'Doğru.' : 'Yanlış. Doğru cevap işaretli.') + '</b>' + esc(p.why) + '</div>'; return; }
  if (d.arpz) { PZS.used.push(d.arpz); PZS.msg = ''; C.render(); return; }
  if (d.arpzr !== undefined) { PZS.used.splice(+d.arpzr, 1); PZS.msg = ''; C.render(); return; }
  if (d.arpzc) { pzCheck(); return; }
  if (d.arpzx) { PZS.used = []; PZS.msg = ''; C.render(); return; }
  if (d.ardr) { const a = A(); a.det[d.ardr] = 0; C.save(); C.render(); window.scrollTo(0, 0); return; }
  if (d.artr === 'start') { trStart(); return; }
  if (d.artr === 'finish') { trFinish(); return; }
  if (d.artr === 'reset') { TR = null; C.render(); return; }
  if (d.artrq !== undefined) { if (TR) { TR.cur = +d.artrq; C.render(); window.scrollTo(0, 0); } return; }
});
window.PBI_ARENA = { state: () => ({ SP, TR, PZS }), daily, weekKey, tourSet, predOpts };
})();
