/* Kesit Power BI — portföy sürümü: karşılama kapıları, Hakkında, geri bildirim formu, ders yorumları (Giscus),
   ziyaret sayacı (GoatCounter, çerezsiz; config ile açılırsa), kalıcı depolama isteği ve yedekleme hatırlatması.
   Ayarların tamamı config.js (window.KESIT_CONFIG) içinde; boş bırakılan özellik görünmez. */
(function () {
'use strict';
const C = window.PBI_CORE, P = C.P, esc = C.esc, VIEWS = C.views;
const CFG = () => window.KESIT_CONFIG || {};

/* ---------- Geri bildirim formu ---------- */
const REPO = () => (CFG().author && CFG().author.repo) || C.REPO_URL || 'https://github.com/ysfdurak/kesit-powerbi';
function issueUrl(ders) {
  const w = String(ders || 'Genel'), st = C.state();
  const where = st.view === 'lesson' && st.id ? 'Ders: ' + (C.LMAP[st.id] ? C.LMAP[st.id].title : st.id) + ' (' + st.id + ')' + (st.step ? ', alıştırma ' + st.step : '') : 'Sayfa: ' + st.view + (st.id ? ' / ' + st.id : '');
  const body = where + '\nKonu: ' + w + '\nAdres: ' + location.href + '\n\nNe gördün, ne bekliyordun?\n\n';
  return REPO() + '/issues/new?title=' + encodeURIComponent(w.slice(0, 120)) + '&body=' + encodeURIComponent(body);
}
function feedbackUrl(ders) { const u = (CFG().feedbackFormUrl || '').trim(); if (!u) return issueUrl(ders); return u.indexOf('{ders}') >= 0 ? u.replace('{ders}', encodeURIComponent(ders || 'Genel')) : u; }
function openFeedback(ders) { gcEvent('geri-bildirim-acildi', 'Geri bildirim açıldı'); window.open(feedbackUrl(ders), '_blank', 'noopener'); }
const fbBtn = (ders, label, cls) => '<button class="btn ' + (cls || 'ghost sm') + '" data-kfb="' + esc(ders) + '">' + (label || 'Geri bildirim') + '</button>';

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
    { const i = h.indexOf('</h1>'); if (i > 0) h = h.slice(0, i + 5) + '<p class="lfb">' + fbBtn('Ders: ' + l.title, 'Bu ders hakkında geri bildirim') + '</p>' + h.slice(i + 5); }
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
  let h = '<div class="wrap" style="max-width:880px;gap:18px"><div><h1>Hakkında</h1><p class="muted" style="max-width:68ch;margin:6px 0 0">Kesit Power BI, sıfırdan işe hazır seviyeye Türkçe Power BI, DAX ve Fabric eğitimi. Kurulum yok, hesap yok: tarayıcında çalışan, DAX’ı benzeten bir motorla ölçü yazarsın, her alıştırma anında denetlenir.</p></div>';
  h += '<div class="kpis about-kpis"><div class="kpi"><b>' + C.LESSONS.length + '</b><span>ders</span></div><div class="kpi"><b>' + ex + '</b><span>alıştırma</span></div><div class="kpi"><b>' + nPr + '</b><span>pratik görevi</span></div><div class="kpi"><b>' + nDash + '</b><span>örnek rapor</span></div><div class="kpi"><b>' + nData + '</b><span>veri seti</span></div></div>';
  if (A.name) h += '<section class="panel about-card"><div class="sec-head"><h3>Yapan</h3></div><p style="margin:0"><b style="font-size:1.1rem">' + esc(A.name) + '</b>' + (A.title ? '<br><span class="muted">' + esc(A.title) + '</span>' : '') + '</p>' + (A.bio ? '<p style="margin:0">' + esc(A.bio) + '</p>' : '') + '<div class="row" style="gap:8px">' + link(A.linkedin, 'LinkedIn') + link(A.github, 'GitHub') + link(A.repo ? A.repo + '/tree/kaynak' : '', 'Kaynak kod') + fbBtn('Hakkında / iletişim', 'Bana yaz', 'sm') + '</div></section>';
  if (c.story) h += '<section class="panel about-card"><div class="sec-head"><h3>Nasıl yapıldı</h3></div><p style="margin:0">' + esc(c.story) + '</p></section>';
  h += '<section class="panel about-card"><div class="sec-head"><h3>Görüşün önemli</h3></div><p style="margin:0">Bu ücretsiz bir paylaşım ve portföy projesi. Bir hata gördüysen, anlatımı eksik bulduğun bir ders varsa ya da bir fikrin varsa yaz. Geri bildirim, GitHub’da bir kayıt (Issue) olarak açılır.</p><div class="row" style="gap:8px">' + fbBtn('Genel', 'Geri bildirim gönder', 'pri sm') + (giscusOn() ? '<a class="btn sm" href="https://github.com/' + esc(c.giscus.repo) + '/discussions" target="_blank" rel="noopener">GitHub tartışmaları</a>' : '') + '</div><p class="muted" style="margin:0;font-size:.85rem">Her dersin başlığının altında “Bu ders hakkında geri bildirim” bağlantısı' + (giscusOn() ? ', konu anlatımının altında yorum alanı' : '') + ' var.</p></section>';
  h += '<section class="panel about-card"><div class="sec-head"><h3>DAX motoru ve bilinen sınırları</h3></div><p style="margin:0">Tarayıcıda çalışan motor DAX’ı <b>benzetir</b>; Microsoft’un motoru (VertiPaq) değildir. Filtre ve satır bağlamı, bağlam geçişi, zaman zekâsı, tablo ve pencere fonksiyonlarının büyük bölümü dersler için yeterince aslına uygun çalışır, ' + Object.keys(C.X.FN).length + ' fonksiyon destekler. Yine de sonuçları gerçek Power BI Desktop’ta da doğrula.</p><ul style="margin:0;padding-left:20px"><li>Çoka çok ilişki kurma ve çift yönlü model ilişkisi yok (ölçü içinde CROSSFILTER ve TREATAS çalışır).</li><li>Takvim tabanlı zaman zekâsı yok.</li><li>Pencere fonksiyonlarının toplam satırı boş döner.</li><li>SUMMARIZECOLUMNS içinde IGNORE, sorguda START AT ve birden çok EVALUATE, GENERATEALL yok.</li><li>Depolama motoru, sorgu planı, gerçek performans ölçümü yok: Performans Analizi (Performance Analyzer) ve DAX Studio dersleri bu nedenle anlatımla ve Desktop ödevleriyle işlenir.</li><li>Büyük tabloda (Pedal İzmir, yaklaşık 116.517 satır) satır satır bağlam geçişi saniyeler sürebilir.</li><li>Power Query Lab M dilini çalıştırmaz, seçili komutları benzetir ve M kodunu üretir.</li></ul></section>';
  const sib = ['<a href="' + esc(C.SITE.sql) + '">Kesit SQL</a>', '<a href="' + esc(C.SITE.python) + '">Kesit Python</a>'];
  if (sib.length) h += '<section class="panel about-card"><div class="sec-head"><h3>Kardeş uygulamalar</h3></div><p style="margin:0">Aynı mantıkla hazırlanmış diğer eğitimler: ' + sib.join(' ve ') + '. Beş vaka veri seti üç uygulamada satır satır aynıdır. Anadolu Market Kesit SQL ile aynı şirket ve siparişleri kullanır; Power BI modeli zenginleştirildi.</p></section>';
  h += '<section class="panel about-card"><div class="sec-head"><h3>Sorumluluk notu</h3></div><p style="margin:0">Kesit Power BI ücretsiz, ticari olmayan bir eğitim ve bilgi paylaşımı projesidir. İçerik özenle hazırlandı ve alıştırmalar otomatik testlerden geçirildi; yine de hatasız olduğu garanti edilmez ve içerik “olduğu gibi” sunulur. Profesyonel bir eğitim, danışmanlık ya da resmî bir sertifika yerine geçmez; uygulamanın verdiği belgeler kendi beyanına dayalıdır.</p><p style="margin:0">Veri setlerindeki tüm şirketler, kişiler ve kayıtlar hayalidir; gerçek kişi ve kurumlarla benzerlik tesadüftür. Microsoft ile bir bağımız yoktur; Microsoft, Power BI, Fabric, Excel ve sınav adları Microsoft Corporation’ın markalarıdır. Sınav denemeleri özgün olarak yazılmıştır, gerçek sınav soruları değildir.</p></section>';
  h += '<section class="panel about-card"><div class="sec-head"><h3>Gizlilik</h3></div><p style="margin:0">Hesap yok ve kişisel veri toplanmaz. İlerlemen yalnızca kendi tarayıcında saklanır; istersen Profil sayfasından dosyaya kaydedip başka cihazda yükleyebilirsin.' + (window.claude ? ' Bu sayfa claude.ai içinde açıldığında, yazma izni olan kullanıcıların ilerlemesi kendi hesaplarına ait gizli alanda da tutulabilir.' : '') + (giscusOn() ? ' Yorumlar GitHub Discussions üzerinden (Giscus) yapılır ve GitHub’ın koşullarına tabidir.' : '') + (feedbackUrl('x') ? ' Geri bildirim bağlantıları GitHub Issues\'u açar (ayarlanmışsa bir form hizmetini); orada yazdıkların o hizmetin koşullarına tabidir.' : '') + (GC.code ? ' Ziyaretler GoatCounter ile çerezsiz ve anonim olarak sayılır: hangi sayfaların kaç kez açıldığı, ülke, tarayıcı türü ve ekran boyutu gibi toplu bilgiler; kişiyi tanımlayan bir kimlik tutulmaz.' : '') + '' + (document.querySelector('link[href*="fonts.googleapis"]') ? ' Yazı tipleri Google Fonts’tan yüklenir.' : ' Yazı tipleri bu sitenin kendi dosyalarından yüklenir; üçüncü taraf bir yazı tipi sunucusu kullanılmaz.') + '</p></section>';
  h += '<section class="panel about-card"><div class="sec-head"><h3>Lisans</h3></div><p style="margin:0">' + esc(c.license || 'Ders içerikleri ve veri setleri CC BY-NC 4.0 (kaynak göstererek, ticari olmayan amaçlarla paylaşılabilir); uygulama kodu MIT lisansıyla sunulur.') + '</p></section>';
  return h + '</div>';
}
C.view('hakkinda', { render: viewAbout, hash: 'hakkinda' });

/* ---------- Tıklamalar ---------- */
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-kfb],[data-kdoor],[data-kbk]'); if (!t) return;
  const d = t.dataset;
  if (d.kfb !== undefined) { ev.preventDefault(); openFeedback(d.kfb); return; }
  if (d.kdoor) { gcEvent('karsilama/' + d.kdoor, 'Karşılama: ' + d.kdoor); P.welcomed = true; C.save();
    if (d.kdoor === 'yeni') C.go('lesson', 'ilk-olcu', { ctx: 'profesyonel' }); else if (d.kdoor === 'biraz') C.go('test'); else C.go('hedef'); return; }
  if (d.kbk) { P.bkDone = doneCount(); C.save(); setTimeout(() => { if (C.state().view === 'home') C.render(); }, 300); return; }
}, true);

gcInit();
try { const fb = document.getElementById('footFb'); if (fb) fb.hidden = false; } catch (e) {}
window.KESIT_PORTFOLIO = { feedbackUrl, openFeedback, giscusOn, gcEvent };
})();
