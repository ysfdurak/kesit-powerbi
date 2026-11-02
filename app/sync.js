/* Kesit Power BI — ilerleme yedeği ve eşitleme.
   1) Dosya: ilerlemeyi .json olarak indir / geri yükle (herkes için).
   2) Bulut: claude.ai’da oturum açmış ve bu sayfaya yazma izni olan kişilerde ilerleme, kişiye özel ve gizli
      `data/users/<id>/progress` belgesinde de tutulur; başka cihazda açınca en yeni olan kullanılır. */
(function () {
'use strict';
const C = window.PBI_CORE, P = C.P, esc = C.esc;
const SY = { state: 'kapali', note: 'İlerlemen bu tarayıcıda saklanıyor; tarayıcıyı kapatmak silmez. Tarayıcı verisini temizlersen, gizli pencere kullanırsan ya da Safari siteye 7 gün girilmediğinde verileri sildiğinde kaybolabilir. Ara ara dosyaya kaydet; başka cihazda ya da veri silindikten sonra dosyadan yükleyip devam edersin (yüklenen ilerleme mevcut olanla birleştirilir).', at: null, ref: null, busy: false, last: '' };
const label = () => ({ kapali: 'Yalnızca bu tarayıcı', baglaniyor: 'Bağlanıyor…', acik: 'Bulutta eşitleniyor', hata: 'Eşitlenemedi' })[SY.state];
function panel() {
  return '<section class="lvl-block"><div class="sec-head"><h2>Yedek ve eşitleme</h2><span class="chip' + (SY.state === 'acik' ? ' on' : '') + '">' + esc(label()) + '</span></div><div class="panel syncbox"><p class="muted" style="margin:0">' + esc(SY.note) + (SY.at ? ' Son eşitleme: ' + SY.at.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + '.' : '') + (C.storeOk() ? '' : ' <b>Uyarı:</b> tarayıcın şu an kaydetmeye izin vermiyor; çıkmadan önce ilerlemeni dosya olarak indir.') + '</p><div class="row"><button class="btn" data-act="prog-export">İlerlemeyi indir (.json)</button><label class="btn ghost" style="cursor:pointer">Dosyadan geri yükle<input type="file" accept="application/json,.json" data-act="prog-import" class="sr-only"></label>' + (SY.state === 'acik' ? '<button class="btn ghost" data-act="prog-sync">Şimdi eşitle</button>' : '') + '</div></div></section>';
}
async function exportProgress() {
  const name = 'kesit-powerbi-ilerleme-' + C.today() + '.json', data = JSON.stringify(P, null, 1);
  if (window.PBI_CAREER && window.PBI_CAREER.saveFile) return window.PBI_CAREER.saveFile(name, data);
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = name; a.click();
}
function importProgress(file) {
  const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); if (!o || typeof o !== 'object' || (!o.done && !o.ex && !o.xp)) throw new Error('biçim'); C.replaceProgress(merge(P, o)); C.toast('İlerleme yüklendi ve bu cihazdakiyle birleştirildi.'); pushSoon(); } catch (e) { C.toast('Bu dosya bir Kesit Power BI ilerleme dosyası değil.'); } }; r.readAsText(file);
}
/* İki ilerlemeyi birleştir: bitenler ve çözülenler birleşir, sayılar büyük olanı alır; ayarlarda bu cihazdaki kalır */
function merge(a, b) {
  const out = JSON.parse(JSON.stringify(a || {})); b = b || {};
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  Object.keys(b).forEach(k => { const x = out[k], y = b[k];
    if (x === undefined || x === null || x === '' || x === false) { out[k] = y; return; }
    if (typeof x === 'number' && typeof y === 'number') { out[k] = Math.max(x, y); return; }
    if (Array.isArray(x) && Array.isArray(y)) { const seen = new Set(x.map(v => JSON.stringify(v))); y.forEach(v => { const s = JSON.stringify(v); if (!seen.has(s)) { seen.add(s); x.push(v); } }); return; }
    if (isObj(x) && isObj(y)) { Object.keys(y).forEach(j => { const p = x[j], q = y[j]; if (p === undefined || p === null || p === false || p === '') x[j] = q; else if (typeof p === 'number' && typeof q === 'number') x[j] = Math.max(p, q); else if (isObj(p) && isObj(q)) x[j] = Object.assign({}, q, p); }); } });
  out._ts = Date.now(); return out;
}
/* ---- bulut ---- */
let pushT = null;
function pushSoon() { if (!SY.ref) return; clearTimeout(pushT); pushT = setTimeout(push, 4000); }
async function push() {
  if (!SY.ref || SY.busy) return; const json = JSON.stringify(P); if (json === SY.last) return;
  if (json.length > 240000) { SY.state = 'hata'; SY.note = 'İlerleme verin buluta sığmayacak kadar büyük; dosya yedeğini kullan.'; return; }
  SY.busy = true; try { await SY.ref.set({ json, ts: P._ts || Date.now(), v: 2 }); SY.last = json; SY.state = 'acik'; SY.at = new Date(); } catch (e) { SY.state = 'hata'; SY.note = 'Bulut eşitlemesi şu an çalışmıyor; ilerlemen bu tarayıcıda güvende.'; } finally { SY.busy = false; }
}
async function connect() {
  try {
    const cl = window.claude; if (!cl || !cl.use) return;
    const [db, user] = await Promise.all([cl.use('db'), cl.use('user')]); DB = db; if (!db || !user) return;
    let can = null; try { can = await user.can('data.write'); } catch (e) { can = null; } if (can === false) { SY.note = 'Bu bağlantıyla yalnızca görüntüleme iznin var; ilerlemen bu tarayıcıda saklanıyor. Dosya yedeği alabilirsin.'; return; }
    const id = await user.id(); if (!id) return;
    SY.state = 'baglaniyor'; const ref = db.collection('data/users/' + id).doc('progress');
    const snap = await ref.get(); SY.ref = ref;
    const rem = snap.exists ? snap.data() : null;
    let remDone = 0; try { remDone = rem && rem.json ? Object.keys(JSON.parse(rem.json).done || {}).length : 0; } catch (e) {}
    const localWins = !P._ts && Object.keys(P.done || {}).length > remDone;
    if (rem && rem.json && !localWins && (rem.ts || 0) > (P._ts || 0)) { C.replaceProgress(JSON.parse(rem.json)); SY.last = rem.json; C.toast('İlerlemen başka bir cihazdan eşitlendi.'); }
    SY.state = 'acik'; SY.at = new Date(); SY.note = 'claude.ai hesabınla eşitleniyor: bu sayfayı başka bir cihazda açtığında kaldığın yerden devam edersin. Veri yalnızca sana görünür.';
    await push();
  } catch (e) { if (SY.state === 'baglaniyor') { SY.state = 'hata'; SY.note = 'Bulut eşitlemesi başlatılamadı; ilerlemen bu tarayıcıda saklanıyor.'; } }
}
window.addEventListener('pbi-saved', pushSoon);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') push(); });
document.addEventListener('click', ev => { const t = ev.target.closest('button'); if (!t) return; if (t.dataset.act === 'prog-export') exportProgress(); if (t.dataset.act === 'prog-sync') { push().then(() => C.render()); } });
document.addEventListener('change', ev => { const el = ev.target; if (el && el.dataset && el.dataset.act === 'prog-import' && el.files && el.files[0]) importProgress(el.files[0]); });
setTimeout(connect, 600);
/* Sorun bildirimi: yazma izni olan görünümlerde paylaşılan `feedback` koleksiyonuna gider; sahibi okur */
let DB = null;
async function feedback(rep) { try { if (!DB) { const cl = window.claude; DB = cl && cl.use ? await cl.use('db') : null; } if (!DB) return false; await DB.collection('feedback').add({ w: String(rep.w).slice(0, 200), t: rep.t, d: rep.d, at: Date.now(), ua: navigator.userAgent.slice(0, 120) }); return true; } catch (e) { return false; } }
window.PBI_SYNC = { panel, exportProgress, push, feedback, merge };
})();
