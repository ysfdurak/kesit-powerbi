/* Kesit Power BI — Karıştırılanlar, Sık hatalar ve Mülakat bölümleri. Veriler: confused.js (PBI_CONFUSED, PBI_MISTAKES), interview.js (PBI_IV_*). */
(function () {
'use strict';
const C = window.PBI_CORE, X = C.X, V = C.V, esc = C.esc, $ = C.$, P = C.P;
const fm = s => esc(String(s == null ? '' : s)).replace(/`([^`]+)`/g, '<code>$1</code>');
const fmB = s => String(s || '').split(/\n+/).filter(x => x.trim()).map(x => /^\s*-\s+/.test(x) ? '<li>' + fm(x.replace(/^\s*-\s+/, '')) + '</li>' : '<p>' + fm(x) + '</p>').join('').replace(/(<li>.*?<\/li>)+/g, m => '<ul>' + m + '</ul>');
const KC = window.PBI_CONFUSED || [], MS = window.PBI_MISTAKES || [];
const KMAP = {}; KC.forEach(c => KMAP[c.id] = c); const MMAP = {}; MS.forEach(m => MMAP[m.id] = m);
const AREAS = ['DAX', 'Model', 'Power Query', 'Rapor', 'Service'];
const save = () => C.save();

/* Tekrar ve alıştırma anahtarları: kq:<kart>:<i> ve mt:<hata> */
const quizEx = (c, i) => { const q = c.quiz[i]; return { t: 'mc', q: fm(q.q), o: q.o.map(fm), a: q.a, why: fm(q.why), lesson: c.lesson }; };
const taskEx = m => { const t = m.task; return Object.assign({ t: 'dax', lesson: m.lesson }, t, { q: fm(t.q), hint: t.hint || 'Belirtiyi ve “Neden?” açıklamasını yeniden oku.' }); };
window.PBI_GUIDEX = k => { const p = k.split(':'); if (p[0] === 'kq') { const c = KMAP[p[1]]; return c && c.quiz[+p[2]] ? { e: quizEx(c, +p[2]), title: 'Karıştırılanlar · ' + c.title, lv: (C.LMAP[c.lesson] || {}).lvl || 'orta' } : null; } if (p[0] === 'mt') { const m = MMAP[p[1]]; return m && m.task ? { e: taskEx(m), title: 'Sık hatalar · ' + m.task.name, lv: (C.LMAP[m.lesson] || {}).lvl || 'B1' } : null; } return null; };
const solve = k => { if (!P.ex[k]) { P.ex[k] = true; C.trackRv(k); C.addXP(5); C.toast('+5 XP · Tekrar listesine eklendi'); save(); } };

/* ---------- Karıştırılanlar ---------- */
let KF = { area: '', q: '' };
function demoTable(c) {
  const d = c.demo; if (!d) return '';
  try { const ms = C.measureSet(); const r = X.query({ rows: [d.grid], measures: ms, values: d.rows.map(x => x[1]), slicers: [], totals: !d.noTotal, keepBlank: true });
    const f = v => v === null || v === undefined ? '(Boş)' : typeof v === 'number' ? (Math.abs(v) < 1.5 && v % 1 ? V.fmt(v, 'yuzde') : V.fmt(v)) : V.fmt(v);
    return '<div class="kc-demo"><span class="eyebrow">Aynı kırılım, farklı sonuç · canlı hesaplandı</span><div class="rtable"><table><thead><tr><th>' + esc(d.grid.t + '[' + d.grid.c + ']') + '</th>' + d.rows.map(x => '<th class="numc">' + esc(x[0]) + '</th>').join('') + '</tr></thead><tbody>' + r.rows.slice(0, 8).map(row => '<tr><td>' + esc(V.fmt(row.keys[0])) + '</td>' + row.vals.map(v => '<td class="numc">' + esc(f(v)) + '</td>').join('') + '</tr>').join('') + (r.total ? '<tr class="tot"><td>Toplam</td>' + r.total.map(v => '<td class="numc">' + esc(f(v)) + '</td>').join('') + '</tr>' : '') + '</tbody></table></div><div class="kc-exprs">' + d.rows.map(x => '<div><b>' + esc(x[0]) + '</b><pre class="dax">' + esc(x[1]) + '</pre></div>').join('') + '</div></div>'; }
  catch (e) { return ''; }
}
function karisList() {
  const q = trFold(KF.q);
  const list = KC.filter(c => (!KF.area || c.area === KF.area) && (!q || trFold(c.title + ' ' + c.rule + ' ' + c.items.map(i => i.n + ' ' + i.d).join(' ')).includes(q)));
  let h = '<div class="wrap" style="gap:16px">' + C.head('Referans', 'Sık hatalar ve ipuçları', 'Birbirine benzeyen fonksiyonlar, ayarlar ve kavramlar: tek cümlelik fark, ne zaman hangisi, canlı karşılaştırma ve mini test.', 'karis') + C.tipsTabs('karis');
  h += '<div class="row" style="gap:10px"><input class="input" id="kcQ" placeholder="Ara: ALLSELECTED, Merge, Direct Lake…" value="' + esc(KF.q) + '" style="max-width:340px" aria-label="Karıştırılanlarda ara"><div class="filters">' + [''].concat(AREAS).map(a => '<button data-kca="' + a + '" aria-pressed="' + (KF.area === a) + '">' + (a || 'Tümü') + ' <small>' + (a ? KC.filter(c => c.area === a).length : KC.length) + '</small></button>').join('') + '</div></div>';
  h += '<div class="kc-grid" id="kcList">' + kcCards(list) + '</div>';
  return h + '</div>';
}
const kcCards = list => list.map(c => { const done = (c.quiz || []).filter((_, i) => P.ex['kq:' + c.id + ':' + i]).length; return '<button class="panel kc-card" data-go="karis" data-id="' + c.id + '"><span class="row" style="gap:6px"><span class="chip">' + esc(c.area) + '</span>' + (c.demo ? '<span class="chip dx">canlı</span>' : '') + (done ? '<span class="chip ok">' + done + '/' + c.quiz.length + '</span>' : '') + '</span><b>' + esc(c.title) + '</b><small>' + fm(c.rule) + '</small></button>'; }).join('') || '<p class="muted">Sonuç yok.</p>';
let KQI = {};
function karisOne(id) {
  const c = KMAP[id]; if (!c) return karisList(); const i = KQI[id] || 0;
  let h = '<div class="wrap" style="gap:16px;max-width:1000px"><div class="lhead"><div class="crumbs"><button data-go="karis">Sık karıştırılanlar</button><span>/</span><span>' + esc(c.area) + '</span></div><h1 style="font-size:clamp(1.4rem,3vw,1.9rem)">' + esc(c.title) + '</h1></div>';
  h += '<div class="panel kc-items">' + c.items.map(x => '<div><code class="kc-n">' + esc(x.n) + '</code><span>' + fm(x.d) + '</span></div>').join('') + '</div>';
  h += '<div class="note"><b>Kural</b>' + fm(c.rule) + '</div>' + (c.body ? '<div class="theory panel kc-body">' + fmB(c.body) + '</div>' : '') + demoTable(c);
  if (c.quiz && c.quiz.length) { h += '<section class="lvl-block"><div class="sec-head"><h3>Mini test</h3><div class="steps">' + c.quiz.map((_, j) => '<button data-kcq="' + j + '" class="' + (P.ex['kq:' + c.id + ':' + j] ? 'done ' : '') + '" aria-current="' + (j === i) + '">' + (j + 1) + '</button>').join('') + '</div></div>' + C.exView(quizEx(c, i), 'kq:' + c.id + ':' + i, () => solve('kq:' + c.id + ':' + i)) + '</section>'; }
  const rel = MS.filter(m => m.lesson && m.lesson === c.lesson).slice(0, 3);
  h += '<div class="row" style="gap:8px">' + (c.lesson && C.LMAP[c.lesson] ? '<button class="btn" data-go="lesson" data-id="' + c.lesson + '">Ders: ' + esc(C.LMAP[c.lesson].title) + '</button>' : '') + rel.map(m => '<button class="btn ghost" data-go="hatalar" data-id="' + m.id + '">Hata: ' + esc(m.sym.slice(0, 50)) + '</button>').join('') + '</div>';
  const ix = KC.indexOf(c); h += '<div class="pager">' + (ix > 0 ? '<button class="btn" data-go="karis" data-id="' + KC[ix - 1].id + '">← ' + esc(KC[ix - 1].title) + '</button>' : '<span></span>') + (ix < KC.length - 1 ? '<button class="btn pri" data-go="karis" data-id="' + KC[ix + 1].id + '">' + esc(KC[ix + 1].title) + ' →</button>' : '') + '</div>';
  return h + '</div>';
}
C.view('karis', { render: id => id ? karisOne(id) : karisList(), mount: id => { if (id) C.exMount(); }, hash: 'karistirilanlar' });

/* ---------- Sık hatalar ---------- */
let MF = { area: '', q: '' };
function hataList() {
  const q = trFold(MF.q);
  const list = MS.filter(m => (!MF.area || m.area === MF.area) && (!q || trFold(m.sym + ' ' + m.cause + ' ' + (m.tags || []).join(' ')).includes(q)));
  let h = '<div class="wrap" style="gap:16px">' + C.head('Referans', 'Sık hatalar ve ipuçları', 'Gördüğün belirtiyi yaz: neden olduğunu, nasıl düzeltileceğini ve ilgili dersi bul. Görevli kayıtlarda bozuk bir ölçüyü kendin düzeltirsin.', 'hatalar') + C.tipsTabs('hatalar');
  h += '<div class="row" style="gap:10px"><input class="input" id="mtQ" placeholder="Belirti yaz: toplam yanlış, boş çıkıyor, her satırda aynı…" value="' + esc(MF.q) + '" style="max-width:420px" aria-label="Belirtiye göre ara"><div class="filters">' + [''].concat(AREAS).map(a => '<button data-mta="' + a + '" aria-pressed="' + (MF.area === a) + '">' + (a || 'Tümü') + ' <small>' + (a ? MS.filter(m => m.area === a).length : MS.length) + '</small></button>').join('') + '</div></div>';
  h += '<div class="panel mt-list" id="mtList">' + mtRows(list) + '</div>';
  return h + '</div>';
}
const mtRows = list => list.map(m => '<details class="mt-row"><summary><span class="chip">' + esc(m.area) + '</span><b>' + fm(m.sym) + '</b>' + (m.task ? '<span class="chip dx">' + (P.ex['mt:' + m.id] ? 'düzeltildi ✓' : 'düzelt') + '</span>' : '') + '</summary><div class="mt-body"><p><b>Neden?</b> ' + fm(m.cause) + '</p><p><b>Düzeltme:</b> ' + fm(m.fix) + '</p><div class="row" style="gap:8px">' + (m.task ? '<button class="btn sm pri" data-go="hatalar" data-id="' + m.id + '">Bozuk ölçüyü düzelt</button>' : '') + (m.lesson && C.LMAP[m.lesson] ? '<button class="btn sm ghost" data-go="lesson" data-id="' + m.lesson + '">Ders: ' + esc(C.LMAP[m.lesson].title) + '</button>' : '') + '</div></div></details>').join('') || '<p class="muted" style="padding:14px">Bu belirtiyle eşleşen kayıt yok. Daha genel bir kelime dene (ör. “toplam”, “boş”, “tarih”).</p>';
function hataOne(id) {
  const m = MMAP[id]; if (!m) return hataList();
  let h = '<div class="wrap" style="gap:16px"><div class="lhead"><div class="crumbs"><button data-go="hatalar">Sık hatalar</button><span>/</span><span>' + esc(m.area) + '</span></div><h1 style="font-size:clamp(1.3rem,3vw,1.8rem)">' + fm(m.sym) + '</h1></div>';
  h += '<div class="panel mt-body" style="padding:16px 18px"><p><b>Neden?</b> ' + fm(m.cause) + '</p><p style="margin:0"><b>Düzeltme:</b> ' + fm(m.fix) + '</p></div>';
  if (m.task) h += '<div class="note" style="margin:0"><b>Görev</b>Düzenleyicide bozuk ölçü hazır. Belirtiyi gör (“Yalnızca çalıştır”), sonra düzelt ve kontrol et.</div>' + C.exView(taskEx(m), 'mt:' + m.id, () => solve('mt:' + m.id));
  const rel = KC.filter(c => c.lesson && c.lesson === m.lesson).slice(0, 3);
  h += '<div class="row" style="gap:8px">' + (m.lesson && C.LMAP[m.lesson] ? '<button class="btn" data-go="lesson" data-id="' + m.lesson + '">Ders: ' + esc(C.LMAP[m.lesson].title) + '</button>' : '') + rel.map(c => '<button class="btn ghost" data-go="karis" data-id="' + c.id + '">' + esc(c.title) + '</button>').join('') + '</div>';
  const tk = MS.filter(x => x.task), ix = tk.indexOf(m); if (ix >= 0 && ix < tk.length - 1) h += '<div class="pager"><span></span><button class="btn pri" data-go="hatalar" data-id="' + tk[ix + 1].id + '">Sıradaki görev →</button></div>';
  return h + '</div>';
}
C.view('hatalar', { render: id => id ? hataOne(id) : hataList(), mount: id => { if (id) C.exMount(); }, hash: 'hatalar' });

/* ---------- Mülakat ---------- */
const IVB = window.PBI_IV_BANK || [], STAR = window.PBI_IV_STAR || [], ASK = window.PBI_IV_ASK || [], TH = window.PBI_IV_TAKEHOME;
const ROLES = { '': 'Tüm roller', analist: 'Veri analisti', gelistirici: 'BI geliştirici', fabric: 'Fabric / analitik mühendisi' };
let IVF = { role: '', cat: '', tab: 'banka', q: '', st: '' }, IVOPEN = {}, IVRAND = null;
P.ivr = P.ivr || {};
function ivQ(q) {
  const open = IVOPEN[q.id], r = P.ivr[q.id];
  return '<div class="panel iv-q" id="iv-' + q.id + '"><div class="row" style="gap:6px;justify-content:space-between"><span class="row" style="gap:6px"><span class="chip">' + esc(ROLES[q.role] || 'Tüm roller') + '</span><span class="chip">' + esc(q.cat) + '</span></span>' + (r ? '<span class="pill ' + (r === 3 ? 'p-ok' : 'p-bad') + '">' + ['', 'Tekrar çalış', 'Neredeyse', 'Hazırım'][r] + '</span>' : '') + '</div><b class="iv-qt">' + fm(q.q) + '</b>' +
    (open ? '<div class="iv-ans"><div class="iv-weak"><span class="eyebrow">Zayıf cevap</span><p>' + fm(q.weak) + '</p></div><div class="iv-strong"><span class="eyebrow">Güçlü cevap</span>' + fmB(q.strong) + '</div><p class="muted" style="margin:0"><b>Neden güçlü?</b> ' + fm(q.why) + '</p><div class="note" style="margin:0"><b>Takip sorusu</b>' + fm(q.follow) + '</div><div class="row" style="gap:6px"><span class="muted" style="font-size:.84rem">Kendi cevabın nasıldı?</span>' + [[1, 'Tekrar çalış'], [2, 'Neredeyse'], [3, 'Hazırım']].map(([v, t]) => '<button class="btn sm' + (r === v ? ' pri' : ' ghost') + '" data-ivr="' + q.id + ':' + v + '">' + t + '</button>').join('') + '</div></div>'
      : '<p class="muted" style="margin:0;font-size:.88rem">Önce cevabını sesli söyle ya da yaz: tanım, örnek, ne zaman önemli.</p><button class="btn sm" data-ivo="' + q.id + '">Cevapları göster</button>') + '</div>';
}
function ivBank() {
  const cats = [...new Set(IVB.map(q => q.cat))];
  const fq = trFold((IVF.q || '').trim());
  const list = IVB.filter(q => (!IVF.role || q.role === IVF.role || q.role === 'hepsi') && (!IVF.cat || q.cat === IVF.cat) && (!IVF.st || (IVF.st === 'yeni' ? !P.ivr[q.id] : IVF.st === 'tekrar' ? (P.ivr[q.id] === 1 || P.ivr[q.id] === 2) : P.ivr[q.id] === 3)) && (!fq || trFold(q.q + ' ' + q.strong + ' ' + q.cat).includes(fq)));
  const ready = IVB.filter(q => P.ivr[q.id] === 3).length;
  let h = '<div class="row" style="gap:10px;justify-content:space-between"><div class="filters">' + Object.entries(ROLES).map(([k, t]) => '<button data-ivrole="' + k + '" aria-pressed="' + (IVF.role === k) + '">' + t + '</button>').join('') + '</div><span class="muted" style="font-size:.86rem">' + ready + ' / ' + IVB.length + ' soruda “hazırım”</span></div>';
  h += '<div class="filters">' + [''].concat(cats).map(c => '<button data-ivcat="' + esc(c) + '" aria-pressed="' + (IVF.cat === c) + '">' + esc(c || 'Tüm konular') + '</button>').join('') + '</div>';
  h += '<div class="row" style="gap:10px"><input class="input" id="ivQ" placeholder="Soru ara: RLS, CALCULATE, Direct Lake…" value="' + esc(IVF.q || '') + '" style="max-width:340px" aria-label="Mülakat sorusu ara"><div class="filters">' + [['', 'Hepsi'], ['yeni', 'Bakmadıklarım'], ['tekrar', 'Tekrar çalışılacak'], ['hazir', 'Hazırım']].map(([k, t]) => '<button data-ivst="' + k + '" aria-pressed="' + (IVF.st === k) + '">' + t + '</button>').join('') + '</div><span class="muted" style="font-size:.84rem">' + list.length + ' soru</span></div>';
  h += '<div class="row" style="gap:8px"><button class="btn pri" data-ivrand="1">Rastgele soru sor (prova)</button><span class="muted" style="font-size:.84rem">Seçili rol ve konudan; önce “tekrar çalış” işaretlediklerin gelir.</span></div>';
  if (IVRAND) { const q = IVB.find(x => x.id === IVRAND); if (q) h += '<div class="iv-rand">' + ivQ(q) + '</div>'; }
  return h + '<div class="iv-list" id="ivList">' + (list.length ? list.map(ivQ).join('') : '<div class="panel empty">Bu filtreyle eşleşen soru yok.</div>') + '</div>';
}
function ivStar() {
  return '<p class="muted" style="margin:0;max-width:80ch">Davranışsal sorularda mülakatçı geçmişte gerçekten ne yaptığını duymak ister. Cevabı Durum, Görev, Eylem ve ölçülebilir Sonuç sırasıyla kur; “biz” değil “ben” de, sonucu bir sayıyla bitir. Aşağıdaki örnekleri kendi projelerinle yeniden yaz.</p>' + STAR.map(s => '<details class="panel star"><summary><b>' + fm(s.q) + '</b><small>' + fm(s.aim) + '</small></summary><div class="star-grid">' + [['Durum', s.S], ['Görev', s.T], ['Eylem', s.A], ['Sonuç', s.R]].map(([k, v]) => '<div><span class="eyebrow">' + k + '</span><p>' + fm(v) + '</p></div>').join('') + '</div><div class="note" style="margin:0"><b>Dikkat</b>' + fm(s.tip) + '</div></details>').join('');
}
function ivTake() {
  if (!TH) return '';
  const LIST = [['satis', TH]].concat(Object.keys(TH).filter(k => TH[k] && typeof TH[k] === 'object' && TH[k].title && Array.isArray(TH[k].tasks)).map(k => [k, TH[k]]));
  const cur = LIST.find(x => x[0] === IVF.th) || LIST[0]; const K = cur[1];
  let pick = LIST.length > 1 ? '<div class="filters" role="tablist" aria-label="Ev ödevi seç">' + LIST.map(([k, o]) => '<button role="tab" data-ivth="' + k + '" aria-selected="' + (k === cur[0]) + '" aria-pressed="' + (k === cur[0]) + '">' + esc(String(o.title).replace(/^Ev ödevi:\s*/i, '')) + '</button>').join('') + '</div>' : '';
  let h = pick + '<div class="panel th-brief"><span class="eyebrow">Ev ödevi vakası</span><h3>' + fm(K.title) + '</h3>' + fmB(K.brief) + '<ol>' + K.tasks.map(t => '<li><b>' + fm(t.t) + '</b> ' + fm(t.detail || '') + '</li>').join('') + '</ol><div class="row" style="gap:8px"><button class="btn" data-go="studio">DAX Playground’da çalış</button><button class="btn ghost" data-go="model">Veri modeli</button></div></div>';
  h += '<section class="lvl-block"><h3>Değerlendirme ölçütleri</h3><div class="panel coltable"><table><thead><tr><th>Ölçüt</th><th class="numc">Puan</th><th>İyi bir teslim</th></tr></thead><tbody>' + K.rubric.map(r => '<tr><td>' + fm(r.c) + '</td><td class="numc">' + r.w + '</td><td>' + fm(r.good) + '</td></tr>').join('') + '</tbody></table></div></section>';
  if (K.pitfalls) h += '<section class="lvl-block"><h3>Adayların sık yaptığı hatalar</h3><ul class="panel th-pit">' + K.pitfalls.map(p => '<li>' + fm(p) + '</li>').join('') + '</ul></section>';
  h += '<details class="panel th-sol"><summary><b>Örnek çözüm</b> <span class="muted">(önce kendin dene)</span></summary>';
  const ms = C.measureSet();
  h += '<div class="coltable"><table><thead><tr><th>Ölçü</th><th class="numc">2024</th></tr></thead><tbody>' + (K.solution.measures || []).map(([n, e]) => { let v; try { v = X.evalMeasure(ms, e, [{ t: 'Tarih', c: 'Yil', values: [2024] }]); } catch (er) { v = null; } return '<tr><td><b>' + esc(n) + '</b><pre class="dax">' + esc(n + ' =\n' + e) + '</pre></td><td class="numc">' + esc(v === null ? '—' : typeof v === 'number' ? (Math.abs(v) < 1.5 && v % 1 ? V.fmt(v, 'yuzde') : V.fmt(v)) : String(v)) + '</td></tr>'; }).join('') + '</tbody></table></div><div class="th-story">' + fmB(K.solution.story) + '</div></details>';
  return h;
}
function ivAsk() { return '<p class="muted" style="margin:0">Mülakatın sonunda “Sizin sorunuz var mı?” sorusu bir değerlendirme fırsatıdır. İyi bir soru, işi gerçekten anlamaya çalıştığını gösterir.</p><div class="panel lessons">' + ASK.map(a => '<div class="litem prof" style="cursor:default;grid-template-columns:minmax(0,1fr)"><span><b>' + fm(a.q) + '</b><small>' + fm(a.why) + '</small></span></div>').join('') + '</div>'; }
/* Rapor eleştirisi: bilerek hatalı kurulmuş bir sayfa; 8 sorunu bul */
const CRIT = [
  ['c1', 'Başlık ile filtre çelişiyor', 'Başlık “2024” diyor ama sayfa filtresi 2023’ü gösteriyor. Okuyucu yanlış yılın rakamlarıyla karar verir.', 'Başlığı seçime göre dinamik yap: `"Satış performansı · " & SELECTEDVALUE(Tarih[Yil])`; gizli sayfa filtrelerini filtre bölmesinde görünür bırak.'],
  ['c2', 'Bağlamsız, okunamaz KPI kartı', 'Kuruşlu, birimsiz bir sayı; hedef, geçen yıl ya da eğilim yok. “İyi mi kötü mü?” sorusuna cevap vermiyor.', 'Kısaltılmış birim (ör. “400,9 B ₺”), hedefe ya da geçen yıla göre fark ve küçük bir eğilim çizgisi ekle.'],
  ['c3', 'Yedi dilimli pasta', 'Benzer büyüklükteki yedi dilimi açıyla karşılaştırmak neredeyse imkânsız; renkler de birbirine yakın.', 'Değere göre sıralı yatay çubuk grafik kullan; pasta ve halkayı en fazla 2–3 parça için sakla.'],
  ['c4', 'Kesik eksen farkı abartıyor', 'Çubuk grafiğin ekseni sıfırdan değil yüksek bir değerden başlıyor; küçük farklar dev gibi görünüyor.', 'Çubuk grafiklerde eksen sıfırdan başlamalı. Farkı vurgulamak istiyorsan farkın kendisini (değişim %) göster.'],
  ['c5', 'Alfabetik sıralama', 'Kategoriler ada göre sıralanmış; en büyük ve en küçük kategoriyi bulmak için gözün bütün çubukları taraması gerekiyor.', 'Görselin sıralamasını ölçüye göre azalan yap; sıralama bir anlam taşımıyorsa her zaman değere göre sırala.'],
  ['c6', 'Yalnızca kırmızı-yeşil kodlama', 'Kategorilerin iyi ya da kötü durumu (ortalamanın üstü ya da altı) yalnızca kırmızı ve yeşil arka planla gösteriliyor; ölçüt de yazmıyor. Renk körlüğü olan kullanıcılar (erkeklerin yaklaşık %8’i) ayırt edemez; ekran okuyucu da okuyamaz.', 'Renge ek olarak simge ya da metin kullan (▲ ▼, “Hedefin altında”); renk körü dostu bir palet seç.'],
  ['c7', 'Tutarsız sayı biçimleri', 'Aynı sayfada “400,9 B ₺” gibi kısaltılmış, “144735,1” gibi binlik ayırıcısız ve kuruşlu biçimler bir arada; karşılaştırma zorlaşıyor ve özensiz görünüyor.', 'Biçimi ölçünün kendisinde tanımla; aynı birimdeki değerleri sayfa boyunca aynı kısaltma ve ondalıkla göster.'],
  ['c8', 'Anlamsız başlıklar', '“Grafik 1”, “Grafik 2” başlıkları okuyucuya ne görmesi gerektiğini söylemiyor; eksen adı da yok.', 'Başlığı bulguyu söyleyecek biçimde yaz: “Web kanalı satışın üçte birinden fazlasını getiriyor”. Eksenleri ve birimi adlandır.']
];
let CFOUND = {}, CSHOW = false;
function critBoard() {
  const ms = C.measureSet(); const F = [{ t: 'Tarih', c: 'Yil', values: [2023] }];
  let tot = 0, ch = [], cat = [], hd = []; try { tot = X.evalMeasure(ms, '[Net Satış]', F); ch = X.query({ rows: [{ t: 'Satislar', c: 'Kanal' }], measures: ms, values: ['[Net Satış]'], slicers: F, totals: false }).rows.map(r => [r.keys[0], r.vals[0]]); cat = X.query({ rows: [{ t: 'Urunler', c: 'Kategori' }], measures: ms, values: ['[Net Satış]', '[Hedef Gerçekleşme %]'], slicers: F, totals: false }).rows.map(r => [r.keys[0], r.vals[0], r.vals[1]]); } catch (e) {}
  const pal = ['#5B7DB1', '#5E83B8', '#6A8FC0', '#7699C6', '#83A3CB', '#90ADD0', '#9DB7D5'];
  const catA = cat.slice().sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'tr'));
  const sum = cat.reduce((s, c) => s + (c[1] || 0), 0); let ang = 0;
  const pie = cat.map((c, i) => { const a0 = ang, a1 = ang + (c[1] || 0) / sum * Math.PI * 2; ang = a1; const p = (a) => [60 + 52 * Math.sin(a), 60 - 52 * Math.cos(a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return '<path d="M60,60 L' + x0.toFixed(1) + ',' + y0.toFixed(1) + ' A52,52 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ',1 ' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' Z" fill="' + pal[i % 7] + '" stroke="#fff" stroke-width=".6"/>'; }).join('');
  const mx = Math.max(...ch.map(c => c[1] || 0)), mn = Math.min(...ch.map(c => c[1] || 0)) * 0.97;
  const bars = ch.map((c, i) => { const hgt = 8 + ((c[1] - mn) / (mx - mn || 1)) * 90; return '<rect x="' + (44 + i * 50) + '" y="' + (110 - hgt) + '" width="36" height="' + hgt + '" fill="#5B7DB1"/><text x="' + (62 + i * 50) + '" y="124" font-size="9" text-anchor="middle" fill="currentColor">' + esc(c[0]) + '</text>'; }).join('') + '<text x="2" y="14" font-size="8" fill="currentColor">' + esc(V.fmt(Math.round(mx))) + '</text><text x="2" y="110" font-size="8" fill="currentColor">' + esc(V.fmt(Math.round(mn))) + '</text>';
  const cmx = Math.max(...catA.map(c => c[1] || 0));
  const hb = catA.map((c, i) => '<div class="cr-hb"><span>' + esc(c[0]) + '</span><i style="width:' + Math.round((c[1] || 0) / cmx * 100) + '%"></i></div>').join('');
  const web = (ch.find(c => c[0] === 'Web') || [0, 0])[1];
  const spot = (id, inner, cls) => '<button class="cr-spot ' + (cls || '') + (CFOUND[id] || CSHOW ? ' found' : '') + '" data-crit="' + id + '" aria-label="Bu alanda bir sorun ara">' + (CFOUND[id] || CSHOW ? '<em>' + (CRIT.findIndex(x => x[0] === id) + 1) + '</em>' : '') + inner + '</button>';
  return '<div class="cr-board" aria-label="Hatalı örnek rapor">' +
    '<div class="cr-top">' + spot('c1', '<h3>2024 Satış Performansı</h3>') + '<span class="cr-filter">Sayfa filtresi: Yıl = 2023</span></div>' +
    '<div class="cr-row">' + spot('c2', '<div class="cr-kpi"><b>' + esc(String(Math.round(tot * 100) / 100).replace('.', ',')) + '</b><span>Net Satış</span></div>') + spot('c7', '<div class="cr-kpi sm"><b>' + esc(V.fmt(tot, 'para', true)) + '</b><span>Toplam</span><b style="font-size:1rem">' + esc(String(Math.round(web * 10) / 10).replace('.', ',')) + '</b><span>Web</span></div>') + '</div>' +
    '<div class="cr-row">' + spot('c3', '<div class="cr-tile"><small>Kategori dağılımı</small><svg viewBox="0 0 120 120" width="130" height="130">' + pie + '</svg></div>') + spot('c4', '<div class="cr-tile"><small>Kanal</small><svg viewBox="0 0 190 130" width="190" height="130">' + bars + '</svg></div>') + '</div>' +
    '<div class="cr-row">' + '<div class="cr-tile wide">' + spot('c8', '<small class="cr-gtitle">Grafik 1</small>', 'inner') + spot('c5', hb, 'bars') + '</div>' + spot('c6', '<div class="cr-tile"><small>Kategori durumu</small>' + cat.slice(0, 6).map(c => '<div class="cr-st" style="background:' + ((c[1] || 0) >= sum / cat.length ? '#3fae5a' : '#d64545') + '">' + esc(c[0]) + '</div>').join('') + '</div>') + '</div></div>';
}
function ivCrit() {
  const n = Object.keys(CFOUND).length;
  let h = '<p class="muted" style="margin:0;max-width:80ch">Mülakatlarda sık gelen bir görev: “Bu rapora bak, neyi değiştirirdin?” Aşağıdaki sayfada bilerek yapılmış <b>8 tasarım ve doğruluk hatası</b> var. Şüphelendiğin alana tıkla; bulduğun her sorun açıklamasıyla listelenir.</p>';
  h += '<div class="cr-wrap">' + critBoard() + '<div class="panel cr-found"><span class="eyebrow">Bulduğun sorunlar · ' + n + ' / 8</span>' + CRIT.filter(c => CFOUND[c[0]] || CSHOW).map(c => '<div class="cr-item"><b>' + (CRIT.indexOf(c) + 1) + '. ' + esc(c[1]) + '</b><p>' + fm(c[2]) + '</p><p><b>Düzeltme:</b> ' + fm(c[3]) + '</p></div>').join('') + (n < 8 && !CSHOW ? '<button class="btn sm ghost" data-crall="1">Hepsini göster</button>' : '') + (n || CSHOW ? '<button class="btn sm ghost" data-crreset="1">Baştan başla</button>' : '') + '</div></div>';
  return h;
}
function viewIV() {
  const tabs = [['banka', 'Soru bankası (' + IVB.length + ')'], ['star', 'Davranışsal (' + STAR.length + ')'], ['vaka', 'Ev ödevi vakası'], ['elestiri', 'Rapor eleştirisi'], ['sor', 'Sen ne sormalısın?'], ['canli', 'Canlı DAX']];
  let h = '<div class="wrap" style="gap:16px">' + C.head('Kariyer', 'Mülakat', 'Rol bazlı kavram soruları (zayıf ve güçlü cevaplarla), davranışsal sorular, ev ödevi vakası, rapor eleştirisi ve canlı DAX provası.', 'iv');
  h += '<div class="filters iv-tabs">' + tabs.map(([k, t]) => '<button data-ivtab="' + k + '" aria-pressed="' + (IVF.tab === k) + '">' + t + '</button>').join('') + '</div>';
  const tb = IVF.tab;
  if (tb === 'banka') h += ivBank(); else if (tb === 'star') h += ivStar(); else if (tb === 'vaka') h += ivTake(); else if (tb === 'elestiri') h += ivCrit(); else if (tb === 'sor') h += ivAsk();
  else h += '<div class="tools"><button class="tool" data-ivsim="1"><b>Teknik mülakat simülasyonu</b><small>4 klasik DAX sorusu, 45 dakika, her çözümden sonra takip sorusu.</small></button><button class="tool" data-go="lesson" data-id="mulakat"><b>Mülakat dersi</b><small>Mülakatın yapısı, 12 kavram sorusu ve canlı DAX sorusuna 5 adımlı yaklaşım.</small></button><button class="tool" data-go="arena"><b>DAX Arena</b><small>Gizli testli meydan okumalar: sabit sayı ya da eksik filtre yakalanır.</small></button><button class="tool" data-go="hatalar"><b>Bozuk ölçüyü düzelt</b><small>Sık hatalar kataloğundaki görevler; mülakatta “bu ölçüde ne yanlış?” sorusunun provası.</small></button></div>';
  return h + '</div>';
}
C.view('iv', { render: viewIV, hash: 'kariyer' });

/* ---------- Olaylar ---------- */
document.addEventListener('input', ev => {
  if (ev.target.id === 'ivQ') { IVF.q = ev.target.value; clearTimeout(window.__ivT); window.__ivT = setTimeout(() => { const y = window.scrollY; C.render(); window.scrollTo(0, y); const i = document.getElementById('ivQ'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); return; }
  if (ev.target.id === 'kcQ') { KF.q = ev.target.value; const q = trFold(KF.q); $('#kcList').innerHTML = kcCards(KC.filter(c => (!KF.area || c.area === KF.area) && (!q || trFold(c.title + ' ' + c.rule + ' ' + c.items.map(i => i.n + ' ' + i.d).join(' ')).includes(q)))); }
  if (ev.target.id === 'mtQ') { MF.q = ev.target.value; const q = trFold(MF.q); $('#mtList').innerHTML = mtRows(MS.filter(m => (!MF.area || m.area === MF.area) && (!q || trFold(m.sym + ' ' + m.cause + ' ' + (m.tags || []).join(' ')).includes(q)))); }
});
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-kca],[data-kcq],[data-mta],[data-ivtab],[data-ivrole],[data-ivcat],[data-ivst],[data-ivth],[data-ivo],[data-ivr],[data-ivrand],[data-ivsim],[data-crit],[data-crall],[data-crreset]'); if (!t) return;
  const d = t.dataset; const keep = () => { const y = window.scrollY; C.render(); window.scrollTo(0, y); };
  if (d.kca !== undefined) { KF.area = d.kca; C.render(); return; }
  if (d.kcq !== undefined) { KQI[C.state().id] = +d.kcq; keep(); return; }
  if (d.mta !== undefined) { MF.area = d.mta; C.render(); return; }
  if (d.ivtab) { IVF.tab = d.ivtab; C.render(); return; }
  if (d.ivrole !== undefined) { IVF.role = d.ivrole; keep(); return; }
  if (d.ivcat !== undefined) { IVF.cat = d.ivcat; keep(); return; }
  if (d.ivst !== undefined) { IVF.st = d.ivst; keep(); return; }
  if (d.ivth !== undefined) { IVF.th = d.ivth; keep(); return; }
  if (d.ivo) { IVOPEN[d.ivo] = true; keep(); return; }
  if (d.ivr) { const [id, v] = d.ivr.split(':'); P.ivr[id] = +v; save(); keep(); return; }
  if (d.ivrand) { const pool = IVB.filter(q => (!IVF.role || q.role === IVF.role || q.role === 'hepsi') && (!IVF.cat || q.cat === IVF.cat)); const pri = pool.filter(q => P.ivr[q.id] === 1 || !P.ivr[q.id]); const src = pri.length ? pri : pool; const q = src[Math.floor(Math.random() * src.length)]; if (q) { IVRAND = q.id; delete IVOPEN[q.id]; } C.render(); window.scrollTo(0, 0); return; }
  if (d.ivsim) { window.PBI_EXAMUI.start('mulakat'); return; }
  if (d.crit) { ev.stopPropagation(); CFOUND[d.crit] = true; keep(); return; }
  if (d.crall) { CSHOW = true; keep(); return; }
  if (d.crreset) { CFOUND = {}; CSHOW = false; keep(); return; }
});
window.PBI_GUIDES = { KC, MS, CRIT };
})();
