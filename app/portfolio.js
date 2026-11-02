/* Kesit Power BI — portföy sürümü: karşılama kapıları, Hakkında, geri bildirim formu, ders yorumları (Giscus),
   ziyaret sayacı (GoatCounter, çerezsiz), kalıcı depolama isteği ve yedekleme hatırlatması.
   Ayarların tamamı config.js (window.KESIT_CONFIG) içinde; boş bırakılan özellik görünmez. */
(function () {
'use strict';
const C = window.PBI_CORE, P = C.P, esc = C.esc, VIEWS = C.views;
const CFG = () => window.KESIT_CONFIG || {};

/* ---------- Geri bildirim formu ---------- */
function feedbackUrl(ders) { const u = (CFG().feedbackFormUrl || '').trim(); if (!u) return ''; return u.indexOf('{ders}') >= 0 ? u.replace('{ders}', encodeURIComponent(ders || 'Genel')) : u; }
function openFeedback(ders) { const u = feedbackUrl(ders); gcEvent('geri-bildirim-acildi', 'Geri bildirim formu açıldı'); if (u) window.open(u, '_blank', 'noopener'); else C.toast('Geri bildirim formu henüz eklenmedi.'); }
const fbBtn = (ders, label, cls) => feedbackUrl('x') ? '<button class="btn ' + (cls || 'ghost sm') + '" data-kfb="' + esc(ders) + '">' + (label || 'Geri bildirim') + '</button>' : '';

/* ---------- Ders yorumları: Giscus (GitHub Discussions) ---------- */
function giscusOn() { const g = CFG().giscus || {}; return !!(g.repo && g.repoId && g.category && g.categoryId); }
function mountGiscus(term) {
  const box = document.getElementById('gsBox'); if (!box || !giscusOn()) return; const g = CFG().giscus; box.innerHTML = '';
  const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (document.documentElement.getAttribute('data-theme') !== 'light' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const sc = document.createElement('script'); sc.src = 'https://giscus.app/client.js'; sc.async = true; sc.crossOrigin = 'anonymous';
  const at = { repo: g.repo, 'repo-id': g.repoId, category: g.category, 'category-id': g.categoryId, mapping: 'specific', term, strict: '1', 'reactions-enabled': '1', 'emit-metadata': '0', 'input-position': 'top', theme: dark ? 'dark' : 'light', lang: 'tr', loading: 'lazy' };
  for (const k in at) sc.setAttribute('data-' + k, at[k]);
  box.appendChild(sc);
}

/* ---------- Ziyaret sayacı: GoatCounter (çerezsiz, isteğe bağlı) ---------- */
const GC = { code: String(CFG().goatcounter || '').trim(), q: [], last: '', ready: false };
function gcInit() {
  if (!GC.code || location.protocol === 'file:' || /claude\.ai|claudeusercontent|localhost|127\.0\.0\.1/.test(location.host)) { GC.code = ''; return; }
  window.goatcounter = { no_onload: true };
  const sc = document.createElement('script'); sc.async = true; sc.src = 'https://gc.zgo.at/count.js'; sc.setAttribute('data-goatcounter', 'https://' + GC.code + '.goatcounter.com/count');
  sc.onload = () => { GC.ready = true; GC.q.splice(0).forEach(v => { try { window.goatcounter.count(v); } catch (e) {} }); };
  document.head.appendChild(sc);
}
function gcSend(v) { if (!GC.code) return; if (GC.ready && window.goatcounter && window.goatcounter.count) { try { window.goatcounter.count(v); } catch (e) {} } else if (GC.q.length < 50) GC.q.push(v); }
function gcEvent(name, title) { gcSend({ path: name, title: title || name, event: true }); }
document.addEventListener('pbi-rendered', ev => {
  if (!GC.code) return; const path = location.pathname + (location.hash || ''); if (path === GC.last) return; GC.last = path;
  const d = ev.detail || {}; gcSend({ path, title: 'Kesit Power BI · ' + (d.view === 'home' ? 'Ana sayfa' : (d.title || d.view)) });
});
document.addEventListener('pbi-lesson-done', ev => gcEvent('ders-bitti/' + ev.detail.id, 'Ders bitti: ' + ev.detail.title));
document.addEventListener('pbi-placement', ev => gcEvent('seviye-testi/' + ev.detail.lv, 'Seviye testi: ' + ev.detail.lv));

/* ---------- Kalıcı depolama: tarayıcıdan bu sitenin verisini kendiliğinden silmemesini iste ---------- */
let persistAsked = false;
function askPersist() { if (persistAsked) return; persistAsked = true; try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(ok => ok || navigator.storage.persist()).catch(() => {}); } catch (e) {} }
window.addEventListener('pbi-saved', askPersist);

/* ---------- Ana sayfa: karşılama kapıları ve yedekleme hatırlatması ---------- */
const doneCount = () => Object.keys(P.done || {}).filter(k => C.LMAP[k]).length;
function welcomeHTML() {
  const door = (k, n, t, d) => '<button class="door" data-kdoor="' + k + '"><span class="door-ic" aria-hidden="true">' + n + '</span><b>' + t + '</b><small>' + d + '</small></button>';
  return '<section class="panel welcome"><div><span class="eyebrow">Hoş geldin</span><h2>Nereden başlayalım?</h2><p class="muted" style="margin:6px 0 0;max-width:70ch">Üç yoldan birini seç; istediğin zaman değiştirebilirsin. Kurulum ve hesap gerekmez.</p></div><div class="doors">' +
    door('yeni', '1', 'Hiç bilmiyorum', 'İlk ölçünü 1 dakikada yaz. Ardından adım adım Temel seviye.') +
    door('biraz', '2', 'Biraz biliyorum', 'Kısa seviye testiyle nereden devam edeceğini bul.') +
    door('is', '3', 'İşim için lazım', 'Rolünü seç: veri analisti, BI geliştirici, PL-300, Fabric ve diğerleri.') +
    '</div></section>';
}
function backupHTML() {
  if (window.claude) return '';
  const d = doneCount(); if (d < 10 || d - (P.bkDone || 0) < 10) return '';
  return '<section class="panel bkcard"><div class="grow"><b>İlerlemeni yedekle</b><span class="muted" style="font-size:.88rem">' + d + ' ders bitirdin. İlerlemen bu tarayıcıda saklanıyor; küçük bir dosyaya kaydedersen kaybolmaz, başka cihazda da devam edersin.</span></div><button class="btn sm pri" data-act="prog-export" data-kbk="1">Dosyaya kaydet</button></section>';
}
if (VIEWS.home) { const base = VIEWS.home.render; VIEWS.home.render = id => { let h = base(id); const show = !P.welcomed && !P.goal && doneCount() === 0; const add = (show ? welcomeHTML() : '') + backupHTML(); if (add) h = h.replace('<div class="wrap">', '<div class="wrap">' + add); return h; }; }

/* ---------- Ders sayfası: geri bildirim bağlantısı ve yorumlar ---------- */
if (VIEWS.lesson) {
  const base = VIEWS.lesson.render, mount = VIEWS.lesson.mount;
  VIEWS.lesson.render = id => {
    let h = base(id); const l = C.LMAP[id]; if (!l) return h; const st = C.state();
    if (feedbackUrl('x')) { const i = h.indexOf('</h1>'); if (i > 0) h = h.slice(0, i + 5) + '<p class="lfb">' + fbBtn(l.title + ' (' + l.id + ')', 'Bu ders hakkında geri bildirim') + '</p>' + h.slice(i + 5); }
    if (giscusOn() && !st.step) { const j = h.lastIndexOf('</div>'); const box = '<section class="panel gs-wrap"><div class="sec-head"><h3>Yorumlar</h3><span class="muted" style="font-size:.82rem">GitHub hesabınla yorum yapabilirsin</span></div><div id="gsBox"><div class="empty">Yorumlar yükleniyor…</div></div></section>'; h = j > 0 ? h.slice(0, j) + box + h.slice(j) : h + box; }
    return h;
  };
  VIEWS.lesson.mount = id => { if (mount) mount(id); if (!C.state().step) mountGiscus('ders-' + id); };
}

/* ---------- Hakkında ---------- */
function viewAbout() {
  const c = CFG(), A = c.author || {}; const ex = C.LESSONS.reduce((a, l) => a + (l.ex || []).length, 0);
  const link = (u, t) => u ? '<a class="btn sm" href="' + esc(u) + '" target="_blank" rel="noopener">' + t + '</a>' : '';
  const nDash = (window.PBI_DASHES || []).length, nData = (window.PBI_DATASETS || []).length + 1, nPr = (window.PBI_PRACTICE || []).length;
  let h = '<div class="wrap" style="max-width:880px;gap:18px"><div><span class="eyebrow">Hakkında</span><h1>Kesit Power BI</h1><p class="muted" style="max-width:68ch;margin:6px 0 0">Sıfırdan işe hazır seviyeye Türkçe Power BI, DAX ve Fabric eğitimi. Kurulum yok, hesap yok: tarayıcında çalışan bir DAX motoruyla ölçü yazarsın, her alıştırma anında denetlenir.</p></div>';
  h += '<div class="kpis about-kpis"><div class="kpi"><b>' + C.LESSONS.length + '</b><span>ders</span></div><div class="kpi"><b>' + ex + '</b><span>alıştırma</span></div><div class="kpi"><b>' + nPr + '</b><span>pratik görevi</span></div><div class="kpi"><b>' + nDash + '</b><span>örnek rapor</span></div><div class="kpi"><b>' + nData + '</b><span>veri seti</span></div></div>';
  if (A.name) h += '<section class="panel about-card"><div class="sec-head"><h3>Yapan</h3></div><p style="margin:0"><b style="font-size:1.1rem">' + esc(A.name) + '</b>' + (A.title ? '<br><span class="muted">' + esc(A.title) + '</span>' : '') + '</p>' + (A.bio ? '<p style="margin:0">' + esc(A.bio) + '</p>' : '') + '<div class="row" style="gap:8px">' + link(A.linkedin, 'LinkedIn') + link(A.github, 'GitHub') + link(A.repo, 'Kaynak kod') + fbBtn('Hakkında / iletişim', 'Bana yaz', 'sm') + '</div></section>';
  if (c.story) h += '<section class="panel about-card"><div class="sec-head"><h3>Nasıl yapıldı</h3></div><p style="margin:0">' + esc(c.story) + '</p></section>';
  h += '<section class="panel about-card"><div class="sec-head"><h3>Görüşün önemli</h3></div><p style="margin:0">Bu ücretsiz bir paylaşım ve portföy projesi. Bir hata gördüysen, anlatımı eksik bulduğun bir ders varsa ya da bir fikrin varsa yaz.</p><div class="row" style="gap:8px">' + fbBtn('Genel', 'Geri bildirim formu', 'pri sm') + (giscusOn() ? '<a class="btn sm" href="https://github.com/' + esc(c.giscus.repo) + '/discussions" target="_blank" rel="noopener">GitHub tartışmaları</a>' : '') + (!feedbackUrl('x') && !giscusOn() ? '<span class="muted">Geri bildirim kanalları yakında eklenecek.</span>' : '') + '</div>' + (feedbackUrl('x') || giscusOn() ? '<p class="muted" style="margin:0;font-size:.85rem">' + (feedbackUrl('x') ? 'Her dersin başlığının altında “Bu ders hakkında geri bildirim” bağlantısı' : '') + (feedbackUrl('x') && giscusOn() ? ', ' : '') + (giscusOn() ? 'konu anlatımının altında yorum alanı' : '') + ' var.</p>' : '') + '</section>';
  if (c.sqlUrl) h += '<section class="panel about-card"><div class="sec-head"><h3>Kardeş uygulama</h3></div><p style="margin:0">Aynı mantıkla hazırlanmış SQL eğitimi: <a href="' + esc(c.sqlUrl) + '" target="_blank" rel="noopener">Kesit SQL</a>. Buradaki vaka veri setlerinin SQL karşılıkları orada.</p></section>';
  h += '<section class="panel about-card"><div class="sec-head"><h3>Sorumluluk notu</h3></div><p style="margin:0">Kesit Power BI ücretsiz, ticari olmayan bir eğitim ve bilgi paylaşımı projesidir. İçerik özenle hazırlandı ve alıştırmalar otomatik testlerden geçirildi; yine de hatasız olduğu garanti edilmez ve içerik “olduğu gibi” sunulur. Profesyonel bir eğitim, danışmanlık ya da resmî bir sertifika yerine geçmez; uygulamanın verdiği belgeler kendi beyanına dayalıdır.</p><p style="margin:0">Veri setlerindeki tüm şirketler, kişiler ve kayıtlar hayalidir; gerçek kişi ve kurumlarla benzerlik tesadüftür. Microsoft ile bir bağımız yoktur; Microsoft, Power BI, Fabric, Excel ve sınav adları Microsoft Corporation’ın markalarıdır. Sınav denemeleri özgün olarak yazılmıştır, gerçek sınav soruları değildir.</p></section>';
  h += '<section class="panel about-card"><div class="sec-head"><h3>Gizlilik</h3></div><p style="margin:0">Hesap yok ve kişisel veri toplanmaz. İlerlemen yalnızca kendi tarayıcında saklanır; istersen Profil sayfasından dosyaya kaydedip başka cihazda yükleyebilirsin.' + (window.claude ? ' Bu sayfa claude.ai içinde açıldığında, yazma izni olan kullanıcıların ilerlemesi kendi hesaplarına ait gizli alanda da tutulabilir.' : '') + (giscusOn() ? ' Yorumlar GitHub Discussions üzerinden (Giscus) yapılır ve GitHub’ın koşullarına tabidir.' : '') + (feedbackUrl('x') ? ' Geri bildirim formu harici bir form hizmetiyle toplanır; formda yalnızca yazdıklarını paylaşırsın.' : '') + (GC.code ? ' Ziyaretler GoatCounter ile çerezsiz ve anonim olarak sayılır: hangi sayfaların kaç kez açıldığı, ülke, tarayıcı türü ve ekran boyutu gibi toplu bilgiler; kişiyi tanımlayan bir kimlik tutulmaz.' : '') + '' + (document.querySelector('link[href*="fonts.googleapis"]') ? ' Yazı tipleri Google Fonts’tan yüklenir.' : ' Yazı tipleri bu sitenin kendi dosyalarından yüklenir; üçüncü taraf bir yazı tipi sunucusu kullanılmaz.') + '</p></section>';
  h += '<section class="panel about-card"><div class="sec-head"><h3>Lisans</h3></div><p style="margin:0">' + esc(c.license || 'Ders içerikleri ve veri setleri CC BY-NC 4.0 (kaynak göstererek, ticari olmayan amaçlarla paylaşılabilir); uygulama kodu MIT lisansıyla sunulur.') + '</p></section>';
  return h + '</div>';
}
C.view('hakkinda', { render: viewAbout, hash: 'hakkinda' });

/* ---------- Tıklamalar ---------- */
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-kfb],[data-kdoor],[data-kbk],[data-rep]'); if (!t) return;
  const d = t.dataset;
  if (d.kfb !== undefined) { ev.preventDefault(); openFeedback(d.kfb); return; }
  if (d.kdoor) { gcEvent('karsilama/' + d.kdoor, 'Karşılama: ' + d.kdoor); P.welcomed = true; C.save();
    if (d.kdoor === 'yeni') C.go('lesson', 'ilk-olcu', { ctx: 'profesyonel' }); else if (d.kdoor === 'biraz') C.go('test'); else C.go('hedef'); return; }
  if (d.kbk) { P.bkDone = doneCount(); C.save(); setTimeout(() => { if (C.state().view === 'home') C.render(); }, 300); return; }
  /* "Sorun bildir": form ayarlıysa doğrudan forma, ders adı dolu olarak */
  if (d.rep !== undefined && feedbackUrl('x') && !window.claude) { ev.stopImmediatePropagation(); ev.preventDefault(); openFeedback('Sorun: ' + d.rep); }
}, true);

gcInit();
try { const fb = document.getElementById('footFb'); if (fb && feedbackUrl('x')) fb.hidden = false; } catch (e) {}
window.KESIT_PORTFOLIO = { feedbackUrl, openFeedback, giscusOn, gcEvent };
})();
