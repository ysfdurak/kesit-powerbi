window.trFold = window.trFold || (s => String(s == null ? '' : s).toLocaleLowerCase('tr').replace(/[ıİ]/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[âà]/g,'a').replace(/[îì]/g,'i').replace(/[ûù]/g,'u'));
/* Kesit Power BI uygulama çekirdeği: kabuk, ilerleme, dersler, Playground, model, fonksiyonlar, test, sözlük.
   Görseller, Örnek raporlar, Measure Lab, Püf noktaları, Arayüz ve uygulama kılavuzu sayfaları pages.js içinde. */
(function () {
'use strict';
const X = window.PBI_DAX, V = window.PBIViz, MODEL = window.PBI_MODEL, CHK = window.PBI_CHECK;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CFG0 = window.KESIT_CONFIG || {};
const SITE = { home: CFG0.homeUrl || 'https://ysfdurak.github.io/', sql: CFG0.sqlUrl || 'https://ysfdurak.github.io/kesit-sql/', pbi: CFG0.pbiUrl || 'https://ysfdurak.github.io/kesit-powerbi/', python: CFG0.pythonUrl || 'https://ysfdurak.github.io/kesit-python/' };
const REPO_URL = (CFG0.author && CFG0.author.repo) || 'https://github.com/ysfdurak/kesit-powerbi';
const SQL_URL = SITE.sql;

/* ---------- Seviyeler ve dersler ---------- */
const LEVELS = window.PBI_LEVELS; const LVI = id => LEVELS.findIndex(L => L.id === id);
const TIER = window.PBI_TIER || (x => x);
/* Veri dosyalarındaki ince seviye kodlarını (A1–C2, A–C) üç seviyeye indir */
Object.keys(window).filter(k => k.indexOf('PBI_') === 0 && Array.isArray(window[k])).forEach(k => window[k].forEach(o => { if (!o || typeof o !== 'object') return; if (typeof o.lv === 'string' && /^[ABC][12]$/.test(o.lv)) o.lv = TIER(o.lv); if (typeof o.L === 'string' && /^[ABC][12]?$/.test(o.L)) o.L = TIER(o.L); }));
const ORDER = window.PBI_ORDER || [];
const lvOf = l => { const v = TIER((window.PBI_LEVEL_OF || {})[l.id] || l.lv); return LVI(v) >= 0 ? v : 'temel'; };
const LESSONS = (window.PBI_LESSONS || []).map((l, i) => ({ l, i })).sort((a, b) => { const ia = ORDER.indexOf(a.l.id), ib = ORDER.indexOf(b.l.id); return (ia < 0 ? 900 + a.i : ia) - (ib < 0 ? 900 + b.i : ib); }).map(x => x.l);
const LMAP = {}; LESSONS.forEach((l, i) => { l._i = i; l.lvl = lvOf(l); LMAP[l.id] = l; });
const PATHS = window.PBI_PATHS || []; const PMAP = {}; PATHS.forEach(p => { p.lessons = p.lessons.filter(id => LMAP[id]); PMAP[p.id] = p; });
const LIB = window.PBI_MEASURES || []; const LIBMAP = {}; LIB.forEach(m => LIBMAP[m.name] = m);
const lvName = id => (LEVELS[LVI(TIER(id))] || {}).name || id;
const lvBadge = id => { const L = LEVELS[LVI(TIER(id))]; return '<span class="lv ' + (L ? L.c : '') + '" title="' + esc(L ? L.name + ' seviye' : id) + '">' + esc(L ? L.name : id) + '</span>'; };
const parseCol = s => { const m = String(s).match(/^(\w+)\[(.+)\]$/); return m ? { t: m[1], c: m[2] } : null; };
const colKey = o => o.t + '[' + o.c + ']';

/* ---------- Depolama ---------- */
const KEY = 'pbipatika.v1';
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
const FRESH = () => ({ weak: {}, skillStat: {}, rv: {}, rvc: 0, reports: [], exams: {}, arena: null, theme: 'auto', welcomed: false, bkDone: 0, vd: {}, done: {}, ex: {}, xp: 0, days: {}, placement: null, drafts: {}, last: null, seen: {}, mine: [], studio: null, gclosed: {}, final: {}, labSeen: {}, trickSeen: {}, goal: null, cap: {}, ready: {}, cert: {}, name: '', navc: {}, ivr: {}, testDone: null, _v: 2, _ts: 0 });
/* Kayıtlı ilerlemeyi şemaya göre temizle: bozuk ya da eski biçimli alanlar varsayılana döner, uygulama asla beyaz ekranda kalmaz */
const kindOf = v => v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
function sanitize(o) {
  const base = FRESH(); if (!o || kindOf(o) !== 'object') return base;
  const out = {};
  Object.keys(o).forEach(k => { if (!(k in base)) out[k] = o[k]; });
  Object.keys(base).forEach(k => { const b = base[k], v = o[k]; if (v === undefined) { out[k] = b; return; }
    const kb = kindOf(b), kv = kindOf(v);
    if (kb === 'null') out[k] = (kv === 'object' || kv === 'string' || kv === 'null') ? v : null;
    else if (kb === kv) out[k] = v; else out[k] = b; });
  if (!isFinite(out.xp)) out.xp = 0; if (!isFinite(out.rvc)) out.rvc = 0;
  return out;
}
const P = sanitize(load());
if (P.placement) { P.placement = TIER(P.placement); if (LVI(P.placement) < 0) P.placement = null; }
let saveT = null;
let STORE_OK = true, storeWarned = false;
/* Ana sayfanın (ysfdurak.github.io) okuduğu özet: yalnız geçerli ders kimlikleri sayılır */
function writeOzet() { try { localStorage.setItem('kesit.ozet.pbi', JSON.stringify({ bitti: Object.keys(P.done || {}).filter(k => LMAP[k]).length, toplam: LESSONS.length })); } catch (e) {} }
function save() { clearTimeout(saveT); saveT = setTimeout(() => { P._ts = Date.now(); writeOzet(); try { localStorage.setItem(KEY, JSON.stringify(P)); STORE_OK = true; } catch (e) { STORE_OK = false; if (!storeWarned) { storeWarned = true; toast('Tarayıcın ilerlemeyi kaydetmeye izin vermiyor (gizli pencere ya da dolu depolama). Profil sayfasından ilerlemeni dosya olarak indirebilirsin.'); } } try { window.dispatchEvent(new CustomEvent('pbi-saved')); } catch (e) {} }, 150); }
function flushSave() { clearTimeout(saveT); P._ts = Date.now(); writeOzet(); try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
window.addEventListener('pagehide', flushSave); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });
/* Dışarıdan gelen ilerlemeyi (dosya ya da bulut) yerine koy */
function replaceProgress(o) { const n = sanitize(o); Object.keys(P).forEach(k => { delete P[k]; }); Object.assign(P, n); writeOzet(); try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} render(); }
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today = () => ymd(new Date());
function streak() { let n = 0; const d = new Date(); if (!P.days[today()]) d.setDate(d.getDate() - 1); for (;;) { if (P.days[ymd(d)]) { n++; d.setDate(d.getDate() - 1); } else break; } return n; }
function addXP(n) { if (!n) return; P.xp += n; P.days[today()] = (P.days[today()] || 0) + n; save(); renderStats(); }
const DAILY_GOAL = 50;

function measureSet(excludeName) {
  const ms = {};
  LIB.forEach(m => { if (m.name !== excludeName) ms[m.name] = { name: m.name, expr: m.expr }; });
  (P.mine || []).forEach(m => { if (m.name !== excludeName && m.name) ms[m.name] = { name: m.name, expr: m.expr }; });
  return ms;
}
const fmtOf = name => (LIBMAP[name] && LIBMAP[name].fmt) || ((P.mine || []).find(m => m.name === name) || {}).fmt || guessFmt(name);
function guessFmt(name) { if (/%/.test(name || '')) return 'yuzde'; if (/Sayı|Adet|Sıra|Müşteri$|Sayisi|Ziyaretçi/i.test(name || '')) return 'adet'; if (/Satış|Tutar|Kâr|Maliyet|Hedef|Sepet|Ciro|Değer|Maaş/i.test(name || '')) return 'para'; return null; }

/* ---------- Vurgulama ---------- */
const FNSET = new Set(Object.keys(X.FN));
const KWS = new Set(['VAR', 'RETURN', 'EVALUATE', 'DEFINE', 'MEASURE', 'ORDER', 'BY', 'ASC', 'DESC', 'IN', 'YEAR', 'QUARTER', 'MONTH', 'DAY', 'WEEK', 'DENSE', 'SKIP', 'REL', 'ABS', 'INTEGER', 'STRING', 'DOUBLE', 'CURRENCY', 'BOOLEAN', 'DATETIME', 'BOTH', 'ONEWAY', 'NONE', 'COLUMN', 'TABLE']);
function hl(src) {
  const re = /(\/\/[^\n]*|--[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|("(?:[^"]|"")*"?)|('[^'\n]*'?)(\[[^\]\n]*\]?)?|([A-Za-z_À-￿][\w.À-￿]*)(\[[^\]\n]*\]?)?|(\[[^\]\n]*\]?)|(\b\d+(?:\.\d+)?\b)|([\s\S])/g;
  let out = '', m;
  while ((m = re.exec(src))) {
    if (m[1]) out += '<span class="c">' + esc(m[1]) + '</span>';
    else if (m[2]) out += '<span class="s">' + esc(m[2]) + '</span>';
    else if (m[3]) out += '<span class="v">' + esc(m[3]) + (m[4] ? esc(m[4]) : '') + '</span>';
    else if (m[5]) { const w = m[5], up = w.toUpperCase(); if (m[6]) out += '<span class="v">' + esc(w + m[6]) + '</span>'; else if (KWS.has(up) && !/^\s*\(/.test(src.slice(re.lastIndex))) out += '<span class="k">' + esc(w) + '</span>'; else if (FNSET.has(up) && /^\s*\(/.test(src.slice(re.lastIndex))) out += '<span class="f">' + esc(w) + '</span>'; else if (MODEL.tables[w]) out += '<span class="v">' + esc(w) + '</span>'; else out += esc(w); }
    else if (m[7]) out += '<span class="ms">' + esc(m[7]) + '</span>';
    else if (m[8]) out += '<span class="n">' + m[8] + '</span>';
    else out += esc(m[9]);
  }
  return out;
}
const hlM = src => esc(src).replace(/(&quot;.*?&quot;|"[^"\n]*")/g, '<span class="s">$1</span>').replace(/\b(let|in|each|if|then|else|try|otherwise|as|type|null|true|false)\b/g, '<span class="k">$1</span>').replace(/\b([A-Z][a-z]+\.[A-Za-z]+)\b/g, '<span class="f">$1</span>').replace(/(\/\/[^\n]*)/g, '<span class="c">$1</span>');
function toast(t) { const lv = document.getElementById('live'); if (lv) lv.textContent = t; const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('aria-hidden', 'true'); el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), Math.max(2600, String(t).length * 45)); }

const ICON = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  path: '<path d="M5 21c0-5 6-5 6-10S5 6 5 3"/><path d="M19 21c0-4-4-5-4-9"/><rect x="14" y="2" width="6" height="6" rx="1"/>',
  book: '<path d="M4 4h6a2 2 0 012 2v14a2 2 0 00-2-2H4z"/><path d="M20 4h-6a2 2 0 00-2 2v14a2 2 0 012-2h6z"/>',
  model: '<rect x="9" y="9" width="6" height="6" rx="1"/><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="17" y="2" width="5" height="5" rx="1"/><rect x="2" y="17" width="5" height="5" rx="1"/><rect x="17" y="17" width="5" height="5" rx="1"/><path d="M7 7l2 2M17 7l-2 2M7 17l2-2M17 17l-2-2"/>',
  term: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
  fx: '<path d="M10 4c-2 0-3 1-3.4 3L5 18c-.4 2-1.4 2-2.5 2"/><path d="M4 10h7"/><path d="M14 10l6 8M20 10l-6 8"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  dash: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  dict: '<path d="M6 3h11a2 2 0 012 2v16H8a2 2 0 01-2-2z"/><path d="M6 19a2 2 0 012-2h11"/><path d="M10 8h5"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  tick: '<path d="M5 12l5 5 9-10"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 006 21h12a1.7 1.7 0 001.5-2.5L14 9V3"/><path d="M7 15h10"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  cert: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 9h10M7 12h6"/><circle cx="16" cy="17" r="2.5"/><path d="M15 19.5V22l1-.6 1 .6v-2.5"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  dl: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  menu: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M6 13h4M6 17h4M14 13h4M14 17h4"/>',
  pq: '<path d="M3 4h18l-7 8v6l-4 2v-8z"/>',
  gym: '<path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12"/>',
  exam: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  refresh: '<path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 5v6h-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4"/><path d="M12 13v4M8 21h8M9 17h6"/>',
  swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>'
};
const ic = (n, sw) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[n] || '') + '</svg>';
const NAV = [
  ['Öğren', [['home', 'Ana sayfa', 'home'], ['paths', 'Öğrenme yolları', 'path'], ['curr', 'Dersler', 'book'], ['review', 'Tekrar', 'refresh'], ['test', 'Seviye testi', 'target']]],
  ['Pratik', [['pratik', 'Pratik', 'gym'], ['arena', 'DAX Arena', 'trophy'], ['sinav', 'Sınavlar', 'exam']]],
  ['Araçlar', [['studio', 'DAX Playground', 'term'], ['pq', 'Power Query Lab', 'pq'], ['lab', 'Measure Lab', 'flask'], ['dash', 'Örnek raporlar', 'dash']]],
  ['Kariyer', [['iv', 'Mülakat', 'brief'], ['projeler', 'Bitirme projeleri', 'flag'], ['sertifika', 'Belgelerim', 'cert']]],
  ['Referans', [['veriler', 'Veri setleri', 'model'], ['hatalar', 'Sık hatalar ve ipuçları', 'alert'], ['formulas', 'DAX fonksiyonları', 'fx'], ['menus', 'Power BI arayüzü', 'menu'], ['visuals', 'Görseller ve biçim', 'chart'], ['model', 'Anadolu Market modeli', 'dict'], ['dict', 'Sözlük', 'dict']]]
];
const NAVFOOT = [['profile', 'Profil', 'user'], ['hakkinda', 'Hakkında', 'bulb']];
const NAVFLAT = NAV.flatMap(g => g[1]).concat(NAVFOOT);
const TABNAV = [['home', 'Ana sayfa', 'home'], ['mypath', 'Yolum', 'path'], ['curr', 'Dersler', 'book'], ['pratik', 'Pratik', 'gym'], ['more', 'Menü', 'more']];
/* Telefon menüsündeki tek cümlelik amaçlar */
const NAVSUB = { home: 'Sıradaki dersin ve hedefin', paths: 'Role ya da sınava göre sıralı dersler', curr: 'Bütün dersler, seviyeye göre', review: 'Bugün tekrar edeceğin alıştırmalar', test: 'Bildiğin seviyeyi atla', pratik: 'Dersten bağımsız görevler', arena: 'Puanlı problemler ve oyunlar', sinav: 'PL-300, DP-600 ve seviye denemeleri', studio: 'Ölçü ve sorgu yaz, sonucu gör', pq: 'Kirli tabloyu adım adım temizle', lab: 'Uzun DAX kalıpları, satır satır', dash: 'Çok sayfalı raporlar ve yapılışları', iv: 'Soru bankası ve canlı DAX provası', projeler: 'Portföyüne koyacağın projeler', sertifika: 'Tamamlama belgelerin', veriler: 'CSV paketleri ve bilinen sınırlar', hatalar: 'Sık hatalar, karıştırılanlar, püf noktaları', formulas: 'Söz dizimi ve çalışan örnek', menus: 'Şerit ve bölme komutları, iki dilde', visuals: 'Görselleştirmeler bölmesi benzetimi', model: 'Tablolar, ilişkiler, veri indirme', dict: 'Power BI terimleri', profile: 'İlerleme, yedek ve tema', hakkinda: 'Proje, motor sınırları, gizlilik' };

/* ---------- Sayfa rehberleri (her sayfanın açıklaması) ---------- */
const GUIDES = {
  home: ['Bu uygulama nasıl çalışır?', 'Kesit Power BI, Power BI’ı sıfırdan profesyonel rapor kuracak seviyeye götüren bir program. Temel, Orta ve İleri olmak üzere üç seviyeden oluşur. Tarayıcında DAX’ı benzeten bir motor çalışır: yazdığın ölçü Anadolu Market verisi üzerinde anında hesaplanır.', [['1. Hedefini seç', 'Veri analisti, BI geliştirici, PL-300, Fabric, Excel’den geçiş ya da yönetici: yol haritan, bitiş tarihin ve işe hazırlık listen hazırlanır. Biraz biliyorsan seviye testiyle bildiğin seviyeyi atla.'], ['2. Yaparak öğren', 'Her ders kısa bir anlatım ve alıştırmalardan oluşur. DAX alıştırmaları farklı kırılımlarda hücre hücre denetlenir.'], ['3. Sonuca çevir', 'Örnek raporları incele, bitirme projeni kur, Sınavlar ve Mülakat ile kendini sına.']]],
  paths: ['Öğrenme yolu nedir?', 'Öğrenme yolu, dersleri bir role ya da sınava göre seçen, aşamalara bölen ve bir bitirme projesiyle bitiren yol haritasıdır. Her yolda “bitirdiğinde bir şirkette neler yapabileceğin”, işe hazırlık kontrol listesi ve tamamlama belgesi var. Bir dersi bir yolda bitirdiğinde diğer yollarda da tamamlanmış sayılır.', [['Tam program', 'Hiç bilmiyorsan buradan başla.'], ['PL-300 / DP-600', 'Microsoft sertifika sınavlarının çalışma kılavuzlarına göre.']]],
  curr: ['Dersler nasıl okunur?', 'Dersler Temel, Orta ve İleri olmak üzere üç seviyede, her seviyede konu modüllerine göre gruplanır. Seviye başlığındaki “yapabilirim” listesi o seviyenin çıkış hedefidir; “DAX uzunluğu” satırı o seviyede yazacağın ölçülerin karmaşıklığını gösterir.', [['Rozetler', 'Yeşil tik tamamlandı, yarım daire alıştırmaların bir kısmı çözüldü, “Atlandı” seviye testinde geçtiğin seviye demek.'], ['“DAX” etiketi', 'Dersteki canlı DAX alıştırmalarının sayısı.']]],
  test: ['Seviye testi', 'Temel, Orta ve İleri seviyelerden 8’er soru (toplam 24). Bilmediğin soruda tahmin etme, “Bilmiyorum” de: sonuç daha doğru çıkar. Bir seviyenin en az 6 sorusunu bilirsen o seviye geçilmiş sayılır. Sonuçta “Şuradan başla” düğmesi çıkar; geçtiğin seviyenin dersleri “sıradaki ders” listesinden atlanır, ama ilerleme yüzdesine tamamlanmış diye yazılmaz.', null],
  studio: ['DAX Playground ne işe yarar?', 'Power BI’daki “Yeni ölçü (New measure)” ile matris görselinin birleşimi. Ölçüyü yaz, satır ve sütun eksenini ve dilimleyicileri seç; ölçü her hücre için ayrı filtre bağlamında hesaplanır. Sorgu modunda DAX sorgu görünümü (DAX query view) gibi EVALUATE çalıştırırsın. Topluluk aracı DAX Studio ile aynı şey değildir.', [['Ölçü olarak kaydet', '“Ad = ifade” yazıp kaydedersen ölçü “Ölçülerim”e girer, diğer ölçülerde [Ad] diye çağrılabilir.'], ['Toplam satırı', 'Toplam, satırların toplamı değildir: ölçü, görselin kendi eksen filtresi olmadan yeniden hesaplanır. Dilimleyici ve sayfa filtreleri kalır. Oranlarda farkı burada gör.']]],
  lab: ['Measure Lab', 'Seviyeye göre uzayan, gerçek iş sorularını çözen DAX kalıpları. Her kalıpta: problem, tam formül, satır satır mantık (adımın üzerine gelince ilgili satır vurgulanır), canlı sonuç ve sık yapılan hata. Orta seviyede 12 satırlık YoY, İleri seviyede 40+ satırlık fiyat, hacim ve karışım köprüsü.', [['Nasıl çalışılır?', 'Önce problemi oku ve kendin dene (Playground’da dene), sonra mantığı adım adım oku.'], ['Örnek raporlarda', '“Kullanıldığı yer” bağlantıları kalıbın hangi rapor görselinde çalıştığını gösterir.']]],
  dash: ['Örnek raporlar nasıl kullanılır?', 'Her biri farklı bir kitle ve soru için hazırlanmış, çok sayfalı <b>rapordur</b>. Power BI’da pano (dashboard) ayrı bir nesnedir: Service’te rapor görsellerinin sabitlendiği tek sayfa. İş dilinde “dashboard” çoğu zaman bu tür raporları anlatır. “Rapor” sekmesinde sayfalar, yer işaretleri, düğmeler, dilimleyiciler ve görsellerle oyna; “Nasıl yapıldı” sekmesinde raporun Power BI Desktop’ta nasıl kurulduğunu oku.', [['Sayfalar ve düğmeler', 'Alttaki sekmeler sayfalar arasında gezinir; rapor içindeki düğmeler sayfa gezgini, yer işareti ya da görünüm değiştirici gibi çalışır.']]],
  final: ['Uygulama kılavuzu', 'Tam programın bitirme projesini 10 aşamada, görev görev kurmanı sağlar. Her aşamada Power BI’da yapacağın görevler, yazacağın ölçüler ve teslim çıktısı var. Tüm kaynak veri indirdiğin CSV paketidir; lisans gerektiren adımlarda alternatif yazılıdır. Alttaki tablo her Power BI komutunun hangi aşamada kullanıldığını gösterir.', null],
  menus: ['Power BI arayüzü', 'Power BI Desktop şeridinin her sekmesi, bağlamsal sekmeler, görünümler ve bölmeler, Power Query Düzenleyicisi ve Power BI Service menüleri. Her komut Türkçe ve İngilizce adıyla: ne yapar, ne zaman kullanılır, hangi derste anlatılır. Arama iki dili de bulur.', [['Bitirme etiketi', 'Komutun bitirme projesinde hangi aşamada kullanıldığı.']]],
  visuals: ['Görseller ve biçim', 'Power BI’daki Görselleştirmeler bölmesinin benzetimi. Üstten bir görsel seç; solda canlı grafik, sağda üç sekme var: Oluştur (alan kutuları), Biçim (Görsel ve Genel alt sekmeleriyle) ve Analiz (referans çizgileri, tahmin). Her seçeneğin altında değiştirince ne olacağı ve ne zaman kullanılacağı yazar; değiştirdiğinde grafik anında güncellenir ve “Ne değişti?” kutusu açıklar.', null],
  formulas: ['DAX fonksiyonları', 'Sık kullanılan fonksiyonların söz dizimi, açıklaması ve bu modelde çalışan örneği. Altta, örnek raporların kullandığı ölçü kütüphanesi seviyesiyle birlikte listelenir.', null],
  model: ['Anadolu Market modeli', 'Uygulamadaki tüm verinin anlam modeli (semantic model): olgu tabloları (Satislar, Hedefler, StokGorunum, WebOlaylari) ve çevresindeki boyutlar. Oklar filtrenin aktığı yönü gösterir (1 → *); kesikli çizgi pasif ilişkidir. Altta ilişkisi olmayan parametre tabloları var. Bir tabloya dokunarak sütunlarını ve ilk satırlarını gör.', null],
  pq: ['Power Query Lab', 'Power Query Düzenleyicisi’nin (Power Query Editor) tarayıcıda çalışan bir benzeri. Üstten bir kaynak seç; bir sütun başlığına tıkla, sonra şeritten bir komut uygula. Her komut sağdaki “Uygulanan adımlar” listesine bir adım ekler ve Gelişmiş Düzenleyici’de M koduna dönüşür. Sütun başlıklarının altındaki çubuk Power BI’daki “sütun kalitesi”dir: yeşil geçerli, kırmızı hata, gri boş.', [['Sütun seçimi', 'Başlığa tıkla; birden çok sütun için “Çoklu sütun seçimi”ni aç ya da Ctrl/⌘ ile tıkla.']]],
  pratik: ['Pratik nedir?', 'Konu anlatımı olmadan, yalnızca görev. Görevler ders alıştırmalarından farklıdır; seviyeye, konuya ve türe (DAX ölçüsü, DAX sorgusu, Power Query) göre süzülür. Çözdüğün her görev Tekrar listesine girer.', [['Hangisi ne zaman?', 'Dersin içindeki soru alıştırmadır. Burası dersten bağımsız pratik. DAX Arena puanlı ve gizli testli, Sınavlar süreli.'], ['Kontrol', 'DAX görevlerinde ölçün birkaç kırılımda hesaplanıp doğru çözümle hücre hücre karşılaştırılır; sabit bir sayı yazarak geçemezsin.'], ['İpucu', 'Üç kademe: yazarın ipucu, kullanılan fonksiyonlar, çözümün iskeleti.']]],
  review: ['Tekrar nasıl çalışır?', 'Öğrendiğini kalıcı yapmanın en etkili yolu, unutmaya başladığın anda hatırlamaktır. İlk kez çözdüğün her alıştırma 1, 3, 7, 16 ve 35 gün sonra yeniden karşına çıkar. Doğru çözersen bir sonraki aralığa geçer, yanlış yaparsan başa döner.', null],
  sinav: ['Sınavlar', 'Süreli sınavlar: seviye bitirme sınavları, PL-300 ve DP-600 denemeleri, DAX yazdığın kodlama sınavları ve mülakat simülasyonu. Her denemede sorular bankadan karışık seçilir; sonunda konu bazında doğru oranın ve en iyi puanın görünür. Seviye testinden farkı: seviye testi nereden başlayacağını söyler, seviye bitirme sınavı o seviyeyi ölçer.', [['İşaretle', 'Emin olmadığın soruyu işaretleyip sona bırakabilirsin.'], ['Süre', 'Süre bitince sınav kendiliğinden teslim edilir.']]],
  arena: ['DAX Arena', 'Puanlı meydan okumalar ve oyunlar. Meydan okumalarda ölçün yalnızca gördüğün tabloda değil, gizli kırılım ve dilimleyicilerde de doğru çalışmalı: sabit sayı yazmak ya da filtreyi atlamak yakalanır.', [['Puan', 'Kolay 10, orta 25, zor 50 puan. İpucu açmak puanı %30 düşürür. Günün sorusu 1,5 kat.'], ['Oyunlar', 'Hız turu, sonucu tahmin et, ölçü bulmacası, DAX Dedektif vakaları ve haftalık set.']]],
  karis: ['Sık karıştırılanlar', 'Birbirine benzeyen fonksiyonlar, ayarlar ve kavramlar. Her kartta tek cümlelik fark, “ne zaman hangisi” kuralı, varsa aynı kırılımda canlı hesaplanan karşılaştırma ve mini test var. Mini testte çözdüklerin Tekrar listesine girer.', [['Canlı', 'Etiketli kartlarda iki ya da daha fazla ifade aynı tabloda yan yana hesaplanır; farkı kendi gözünle görürsün.']]],
  hatalar: ['Sık hatalar', 'Raporda gördüğün belirtiden yola çık: arama kutusuna “toplam yanlış”, “boş çıkıyor”, “her satırda aynı” gibi yaz. Her kayıt nedeni, düzeltmeyi ve ilgili dersi gösterir; görevli kayıtlarda bozuk bir ölçüyü kendin düzeltirsin.', null],
  tricks: ['Püf noktaları', 'Profesyonel raporları sıradan raporlardan ayıran teknikler: araç ipucu sayfası, dinamik başlık, yer işaretleri, SVG mini grafik, alan parametresi, Top N + Diğer ve daha fazlası. Her kart: problem, Power BI’da adım adım yapılışı, gerekiyorsa DAX ve çoğunda canlı bir demo.', null],
  iv: ['Mülakat', 'Rol bazlı soru bankasında önce kendi cevabını söyle, sonra zayıf ve güçlü cevabı karşılaştır ve kendini değerlendir. Davranışsal sorular, ev ödevi vakası, rapor eleştirisi ve canlı DAX provası da burada.', [['Prova', '“Rastgele soru sor” önce “tekrar çalış” işaretlediğin ya da hiç bakmadığın soruları getirir.']]],
  profile: ['Profil', 'İlerlemenin özeti: XP, seri, etkinlik takvimi, rozetler, seviye ve öğrenme yolu ilerlemesi, sınav ve arena sonuçları. Tema ayarı ve ilerleme yedeği de burada.', null],
  dict: ['Sözlük', 'Power BI ve DAX terimleri. Fonksiyonlar için DAX fonksiyonları sayfasına bak.', null]
};
/* Rehber kartı: araç sayfalarında ve telefonda kapalı gelir, kullanıcı açarsa açık kalır */
const GUIDE_OPEN = new Set(['paths', 'test', 'pratik', 'review']);
function guide(v) {
  const g = GUIDES[v]; if (!g) return ''; const st = (P.gclosed || {})[v]; const open = st === undefined ? (GUIDE_OPEN.has(v) && window.innerWidth > 760) : !st;
  return '<details class="guide" data-guide="' + v + '"' + (open ? ' open' : '') + '><summary><span class="gi" aria-hidden="true">i</span>' + esc(g[0]) + '</summary><div class="gbody"><p>' + g[1] + '</p>' + (g[2] ? '<ul>' + g[2].map(x => '<li><b>' + x[0] + '</b> ' + x[1] + '</li>').join('') + '</ul>' : '') + '</div></details>';
}
/* Üst etiket her zaman menü grubudur; adım bilgisi taşıyanlar (Seviye testi · 3/24) olduğu gibi kalır */
const groupOf = v => { const c = parentOf(v); const g = NAV.find(x => x[1].some(i => i[0] === c)); return g ? g[0] : (NAVFOOT.some(i => i[0] === c) ? '' : null); };
const head = (eyebrow, title, desc, v) => { const gn = /·/.test(eyebrow) ? null : groupOf(S.view); const eb = gn === null ? eyebrow : gn; return '<div class="phead">' + (eb ? '<span class="eyebrow">' + eb + '</span>' : '') + '<h1>' + title + '</h1>' + (desc ? '<p class="muted">' + desc + '</p>' : '') + '</div>' + guide(v); };

/* ---------- İlerleme ---------- */
const exKey = (l, i) => l.id + ':' + i;
function lessonState(l) { if (P.done[l.id]) return 'done'; const n = (l.ex || []).filter((e, i) => P.ex[exKey(l, i)]).length; return n ? 'part' : 'none'; }
function pct(ids) { if (!ids.length) return 0; return Math.round(ids.filter(id => P.done[id]).length / ids.length * 100); }
const levelIds = lv => LESSONS.filter(l => l.lvl === lv).map(l => l.id);
function myLevel() { let best = null; for (const L of LEVELS) { const ids = levelIds(L.id); if (ids.length && pct(ids) >= 80) best = L.id; else break; } if (P.placement && (!best || LVI(P.placement) > LVI(best))) return P.placement; return best; }
/* Seviye testi: geçilen seviyenin dersleri “sıradaki ders”ten atlanır; bitmiş sayılmaz, yüzdeye girmez */
const skippedLv = l => !!P.placement && LVI(l.lvl) >= 0 && LVI(l.lvl) <= LVI(P.placement);
const isSkipped = l => skippedLv(l) && !P.done[l.id];
const firstOpen = list => list.find(l => !P.done[l.id] && !skippedLv(l)) || list.find(l => !P.done[l.id]) || null;
const goalPath = () => (P.goal && PMAP[P.goal.path] ? P.goal.path : null);
/* Seviye testi sonucu ve ana sayfa aynı yolu önerir: hedef varsa o yol, yoksa geçilen seviyeye uyan yol */
const placementPath = () => goalPath() || (!P.testDone ? null : !P.testDone.lv ? 'profesyonel' : P.testDone.lv === 'temel' ? 'analist' : P.testDone.lv === 'orta' ? 'pl300' : 'gelistirici');
function nextLesson(ctxPath) { const list = ctxPath && PMAP[ctxPath] ? PMAP[ctxPath].lessons.map(id => LMAP[id]).filter(Boolean) : LESSONS; return firstOpen(list); }
/* Dersin yol bağlamı: yolda yoksa bağlam yok; verilmediyse hedefteki yol kullanılır */
function lessonCtx(id, ctx) { if (ctx && PMAP[ctx] && PMAP[ctx].lessons.includes(id)) return ctx; const g = goalPath(); return g && PMAP[g].lessons.includes(id) ? g : null; }
function checkLessonDone(l) { const ex = l.ex || []; if (ex.length && ex.every((e, i) => P.ex[exKey(l, i)]) && !P.done[l.id]) { P.done[l.id] = true; addXP(10); save(); toast('Ders tamamlandı: ' + l.title + ' (+10 XP)'); try { document.dispatchEvent(new CustomEvent('pbi-lesson-done', { detail: { id: l.id, title: l.title } })); } catch (e) {} return true; } return false; }

/* ---------- Kabuk ---------- */
const VIEWS = {};
function view(name, def) { VIEWS[name] = def; }
let S = { view: 'home', id: null, step: 0, ctx: null };
const parentOf = v => ({ lesson: 'curr', path: 'paths', hedef: 'paths', final: 'projeler', karis: 'hatalar', tricks: 'hatalar', pratikSoru: 'pratik' })[v] || v;
function familyLinks() {
  const items = [['Ana sayfa', SITE.home], ['Kesit SQL', SITE.sql], ['Kesit Python', SITE.python]];
  return '<div class="fam"><span class="eyebrow">Kesit</span>' + items.map(([t, u]) => '<a href="' + esc(u) + '">' + t + '</a>').join('') + '</div>';
}
function renderNav() {
  const cur = parentOf(S.view);
  P.navc = P.navc || {};
  const btn = ([v, t, i]) => '<button data-go="' + v + '" aria-current="' + (cur === v) + '">' + ic(i) + t + '</button>';
  $('#nav').innerHTML = NAV.map(([g, items]) => { const shut = P.navc[g] && !items.some(x => x[0] === cur); return '<button class="navgrp" data-navg="' + g + '" aria-expanded="' + !shut + '">' + g + ic('chev', 2.4) + '</button>' + (shut ? '' : items.map(btn).join('')); }).join('') + '<div class="navfoot">' + NAVFOOT.map(btn).join('') + '</div>' + familyLinks();
  const goalP = goalPath(); const onMine = cur === 'paths' && (S.view === 'path' ? S.id === goalP : !goalP) || (S.view === 'paths' && !goalP);
  const inTab = TABNAV.some(n => n[0] === cur) || onMine;
  $('#tabbar').innerHTML = TABNAV.map(([v, t, i]) => v === 'mypath' ? '<button data-go="' + (goalP ? 'path' : 'paths') + '"' + (goalP ? ' data-id="' + goalP + '"' : '') + ' aria-current="' + onMine + '">' + ic(i) + '<span>' + t + '</span></button>' : '<button data-go="' + v + '" aria-current="' + (cur === v || (v === 'more' && !inTab)) + '">' + ic(i) + '<span>' + t + '</span></button>').join('');
}
function renderStats() {
  const st = streak(), done = Object.keys(P.done).filter(k => LMAP[k]).length; const lv = myLevel();
  const ss = $('#sideStats'); if (ss) ss.innerHTML = '<div class="stat"><b>' + P.xp + '</b><span>XP</span></div><div class="stat"><b>' + st + '</b><span>günlük seri</span></div><div class="stat"><b>' + done + '/' + LESSONS.length + '</b><span>ders</span></div><div class="stat"><b>' + (lv ? lvName(lv) : '—') + '</b><span>seviye</span></div>';
  const ms = $('#miniStats'); if (ms) ms.innerHTML = '<b>' + P.xp + '</b>&nbsp;XP · <b>' + st + '</b>&nbsp;gün';
}
let lastHash = location.hash;
function hashFor(v, id, ctx, step) { const d = VIEWS[v]; if (!d || v === 'home') return ''; let h = (d.hash || v) + (id ? '-' + id : ''); if (v === 'lesson') h += (ctx ? '@' + ctx : '') + (step ? '/' + step : ''); return h; }
function writeHash(hash, replace) { try { const url = hash ? ('#' + hash) : location.pathname + location.search; if (replace || ('#' + hash) === location.hash || (!hash && !location.hash)) history.replaceState(null, '', url); else history.pushState(null, '', url); lastHash = location.hash; } catch (e) {} }
function go(v, id, opts) {
  opts = opts || {};
  if (v === 'path' && !id) v = 'paths';
  S = { view: v, id: id || null, step: opts.step || 0, ctx: opts.ctx !== undefined ? opts.ctx : (v === 'lesson' ? S.ctx : null) };
  if (v === 'path') S.ctx = id;
  if (v === 'lesson') S.ctx = lessonCtx(id, S.ctx);
  writeHash(hashFor(v, id, S.ctx, S.step), opts.replace);
  render(); if (!opts.keepScroll) window.scrollTo(0, 0); const m = $('#main'); if (m) m.focus({ preventScroll: true });
}
/* Alıştırma adımı tarayıcı geçmişine yazılır: geri tuşu önceki adıma döner */
function setStep(n) { S.step = n; writeHash(hashFor('lesson', S.id, S.ctx, n)); render(); window.scrollTo(0, 0); }
/* Etkin alıştırma: ders dışında (Pratik, tekrar, sınav, arena) aynı ekranlar CUR ile çalışır */
let CUR = null;
function curX() { if (CUR) return CUR; const l = LMAP[S.id], i = S.step - 1; const k = exKey(l, i); return { l, i, e: l.ex[i], k, onSolved: q => solved(l, i, k, q) }; }
/* Yanlış denemeler ders bazında sayılır; Profil “en çok zorlandığın konular”ı buradan gösterir */
function noteWrong(CX) { if (CX.onWrong) CX.onWrong(); const lid = CX.l ? CX.l.id : (CX.e && CX.e.lesson); if (lid && !String(CX.k || '').startsWith('mt:')) { P.weak = P.weak || {}; P.weak[lid] = (P.weak[lid] || 0) + 1; save(); } }
function exView(e, k, onSolved, extra) { CUR = Object.assign({ e, k, onSolved: onSolved || (() => {}) }, extra || {}); return e.t === 'mc' ? mcView(e, k) : e.t === 'pq' ? window.PBI_PQUI.lessonView(e, k) : daxView(e, k); }
function exMount() { const c = CUR; if (!c) return; mountEx(c.e, c.k, c.onSolved); }
function mountEx(e, k, onSolved) {
  if (!e || e.t === 'mc') return;
  if (e.t === 'pq') { window.PBI_PQUI.mountLesson(e, k, () => onSolved()); return; }
  const init = P.drafts[k] != null ? P.drafts[k] : (e.start || (e.t === 'query' ? 'EVALUATE\n' : ''));
  ED = makeEditor($('#ed'), init, () => checkEx(true), e.t === 'query');
  ED.onChange = v => { P.drafts[k] = v; save(); };
  if (P.ex[k] && P.drafts[k] != null) checkEx(false, true);
}
function render() {
  CUR = null; const main = $('#main');
  try {
    renderNav(); renderStats();
    const d = VIEWS[S.view] || VIEWS.home;
    main.innerHTML = d.render(S.id);
    enhance(main);
    if (d.mount) d.mount(S.id);
    const h1 = main.querySelector('h1'); document.title = (h1 && S.view !== 'home' ? h1.textContent.trim().slice(0, 60) + ' · ' : '') + 'Kesit Power BI';
    try { document.dispatchEvent(new CustomEvent('pbi-rendered', { detail: { view: S.view, id: S.id, step: S.step, title: h1 ? h1.textContent.trim() : '' } })); } catch (e2) {}
  } catch (e) {
    if (window.console) console.error(e);
    main.innerHTML = '<div class="wrap"><div class="panel empty" role="alert" style="padding:24px"><h2>Bu sayfa açılırken bir sorun oldu</h2><p>Ana sayfaya dönebilir ya da kayıtlı ilerlemen bozulduysa önce yedeğini indirip sıfırlayabilirsin.</p><div class="row"><button class="btn pri" data-go="home">Ana sayfa</button><button class="btn" data-act="prog-export">İlerlemeyi indir (.json)</button><span id="resetBox" class="confirm"><button class="btn ghost" data-act="reset-ask">İlerlemeyi sıfırla</button></span></div></div></div>';
  }
}
function enhance(root) {
  root.querySelectorAll('pre.dax').forEach(pre => {
    if (pre.dataset.done) return; pre.dataset.done = 1; const src = pre.textContent; pre.innerHTML = hl(src);
    const wrap = document.createElement('div'); wrap.className = 'codebox'; pre.parentNode.insertBefore(wrap, pre); wrap.appendChild(pre);
    if (!pre.hasAttribute('data-notry')) { const b = document.createElement('button'); b.className = 'try'; b.type = 'button'; b.textContent = 'Playground’da dene'; b.addEventListener('click', () => openInStudio(src)); wrap.appendChild(b); }
  });
  root.querySelectorAll('pre.m').forEach(pre => { if (pre.dataset.done) return; pre.dataset.done = 1; pre.innerHTML = hlM(pre.textContent); });
  root.querySelectorAll('.theory table').forEach(t => { if (t.parentNode.classList.contains('tbl-wrap')) return; const w = document.createElement('div'); w.className = 'tbl-wrap'; t.parentNode.insertBefore(w, t); w.appendChild(t); });
  root.querySelectorAll('.tbl-wrap, .coltable, .rtable-wrap, .term-rows, .vtable').forEach(el => { if (!el.hasAttribute('tabindex') && el.scrollWidth > el.clientWidth + 2) { el.tabIndex = 0; el.setAttribute('role', 'region'); if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Kaydırılabilir tablo'); } });
}
const TABLE_FN = /^(CALENDAR|CALENDARAUTO|ADDCOLUMNS|SELECTCOLUMNS|SUMMARIZE|SUMMARIZECOLUMNS|DATATABLE|GENERATESERIES|FILTER|VALUES|DISTINCT|ALL|TOPN|UNION|CROSSJOIN|GENERATE|NATURALINNERJOIN|NATURALLEFTOUTERJOIN|TREATAS|EXCEPT|INTERSECT|ROW|GROUPBY|CALCULATETABLE)\s*\(|^\{/i;
function openInStudio(src) {
  src = src.trim();
  const isQ = /^\s*(DEFINE|EVALUATE)\b/i.test(src) || /\bEVALUATE\b/.test(src);
  if (!isQ) {
    const defs = splitDefs(src);
    if (defs.length > 1) { defs.slice(0, -1).forEach(d => { if (d.name && !LIBMAP[d.name]) upsertMine(d.name, d.expr, true); }); src = defs[defs.length - 1].name ? defs[defs.length - 1].name + ' = ' + defs[defs.length - 1].expr : defs[defs.length - 1].expr; }
  }
  let q = isQ;
  if (!q) { const d = X.stripDef(src); if (TABLE_FN.test(d.expr.trim())) { q = true; src = (d.name ? '-- ' + d.name + ' (hesaplanmış tablo)\n' : '') + 'EVALUATE\n' + d.expr.trim(); } }
  ST.mode = q ? 'q' : 'm'; ST.code[ST.mode] = src; ST.yil = []; ST.kanal = []; saveStudio(); go('studio');
}
function splitDefs(src) {
  const lines = src.split('\n'); const out = []; let cur = null;
  lines.forEach(line => { const m = line.match(/^([^\s\-\/=()\[\]"'{},<>][^=()\[\]"{},<>]*?(?:\s\([^()=\[\]]*\))?)\s*:?=(?!=)\s*(.*)$/); if (m && !/^(VAR|RETURN)\b/i.test(m[1].trim())) { cur = { name: m[1].trim(), expr: m[2] }; out.push(cur); } else if (cur) cur.expr += '\n' + line; else { cur = { name: null, expr: line }; out.push(cur); } });
  return out.map(d => ({ name: d.name, expr: d.expr.replace(/^\s*\n/, '').replace(/\s+$/, '') })).filter(d => d.expr.trim() && !/^--/.test(d.expr.trim()));
}
/* ölçü + bağımlılıklarının DAX bloğu */
function daxDeps(names) { const uniq = [], seen = new Set(); const add = n => { if (seen.has(n)) return; seen.add(n); const m = LIBMAP[n]; if (!m) return; const re = /(\w|')?\[([^\]]+)\]/g; let mm; while ((mm = re.exec(m.expr))) { if (!mm[1] && LIBMAP[mm[2]]) add(mm[2]); } uniq.push(n); }; (names || []).forEach(add); return uniq; }
function daxBlock(names, title, open) {
  const uniq = daxDeps(names); if (!uniq.length) return '';
  const code = uniq.map(n => n + ' =\n' + LIBMAP[n].expr).join('\n\n');
  return '<details class="daxshow"' + (open ? ' open' : '') + '><summary>' + esc(title || 'DAX ölçüleri') + ' (' + uniq.length + ')</summary><pre class="dax" data-notry>' + esc(code) + '</pre><button class="btn sm" data-try="' + esc(uniq.map(n => n + ' = ' + LIBMAP[n].expr).join('\n')) + '">Playground’da aç</button></details>';
}

/* ---------- Genişlik yardımcıları: SVG viewBox'u kutunun gerçek genişliğine eşitle ---------- */
function mainW() { const m = document.getElementById('main'); const w = (m ? m.clientWidth : window.innerWidth) - 32; return Math.min(1180, Math.max(300, w)); }
function spanW(span) { const ww = window.innerWidth; const eff = ww <= 760 ? 12 : ww <= 1080 ? (span <= 3 ? 6 : 12) : span; const inner = mainW() - 34; return Math.max(260, Math.round((inner - (12 / eff - 1) * 12) * eff / 12) - 34); }
function studioW() { const ww = window.innerWidth; const side = ww > 980 ? 256 : 0; return Math.max(280, Math.min(900, mainW() - side - 36)); }
let tipsBound = false;
function bindMarks() { if (!tipsBound) { V.bindTips(document.body); tipsBound = true; } }

/* ---------- Ana sayfa ---------- */
function lessonRow(l, ctx) {
  const st = lessonState(l), n = (l.ex || []).length; const nd = (l.ex || []).filter(e => e.t === 'dax' || e.t === 'query').length, npq = (l.ex || []).filter(e => e.t === 'pq').length;
  return '<button class="litem" data-lesson="' + l.id + '"' + (ctx ? ' data-ctx="' + ctx + '"' : '') + '><span class="check ' + (st === 'done' ? 'done' : st === 'part' ? 'part' : '') + '">' + (st === 'done' ? ic('tick', 3.2) : '') + '</span><span style="min-width:0"><b>' + esc(l.title) + '</b><small>' + esc(l.sum || '') + '</small></span><span class="row" style="gap:6px;flex-wrap:nowrap">' + (nd ? '<span class="chip dx">' + nd + ' DAX</span>' : '') + (npq ? '<span class="chip pqc">' + npq + ' PQ</span>' : '') + '<span class="chip">' + (n ? n + ' alıştırma' : 'okuma') + '</span>' + (isSkipped(l) ? '<span class="chip skipc" title="Seviye testinde geçtin. Sıradaki dersten atlanır, ilerlemeye sayılmaz.">Atlandı</span>' : '') + lvBadge(l.lvl) + '</span></button>';
}
function counts() {
  const ex = LESSONS.reduce((a, l) => a + (l.ex || []).length, 0), dx = LESSONS.reduce((a, l) => a + (l.ex || []).filter(e => e.t === 'dax' || e.t === 'query').length, 0), pq = LESSONS.reduce((a, l) => a + (l.ex || []).filter(e => e.t === 'pq').length, 0);
  const cmds = (window.PBI_MENUS || []).reduce((a, g) => a + g.tabs.reduce((b, t) => b + t.cmds.length, 0), 0);
  return { ex, dx, pq, cmds, pat: (window.PBI_PATTERNS || []).length, dash: (window.PBI_DASHES || []).length, tricks: (window.PBI_TRICKS || []).length };
}
/* Ders süresi: okuma + alıştırma başına 3 dk, 5'e yuvarlı. Yol süreleri de aynı hesaptan çıkar. */
const lessonMin = l => Math.max(5, Math.round(((l.min || 10) + (l.ex || []).length * 3) / 5) * 5);
/* Referans: Sık hatalar, Sık karıştırılanlar, Püf noktaları tek sayfanın sekmeleri */
const tipsTabs = cur => '<nav class="filters tipstabs" aria-label="Bölümler">' + [['hatalar', 'Sık hatalar'], ['karis', 'Sık karıştırılanlar'], ['tricks', 'Püf noktaları']].map(([v, t]) => '<button data-go="' + v + '" aria-pressed="' + (v === cur) + '">' + t + '</button>').join('') + '</nav>';
function viewHome() {
  const st = streak(), td = P.days[today()] || 0, hctx = placementPath(), nx = (P.last && LMAP[P.last] && !P.done[P.last] && !skippedLv(LMAP[P.last])) ? LMAP[P.last] : nextLesson(hctx);
  const done = Object.keys(P.done).filter(k => LMAP[k]).length, C = counts();
  let h = '<div class="wrap">';
  const GOAL = window.PBI_CAREER && P.goal && PMAP[P.goal.path];
  h += GOAL ? '<section class="hero">' + window.PBI_CAREER.homeGoal() + '<div style="display:none">' : '';
  h += (GOAL ? '' : '<section class="hero">') + '<div class="panel hero-main"><div class="bars-deco" aria-hidden="true"><i></i><i></i><i></i><i></i></div><span class="eyebrow">Power BI · DAX · Fabric · Türkçe</span><h1>Sıfırdan <em>işe hazır</em> Power BI uzmanlığına.</h1><p>Rolüne göre yol seç, tarayıcında DAX yaz, bitirme projesiyle portföyünü kur.<br>' + LESSONS.length + ' ders, ' + C.ex.toLocaleString('tr-TR') + ' alıştırma, ' + C.dash + ' örnek rapor. Kurulum ve hesap gerekmez.</p><div class="row">';
  h += nx ? '<button class="btn pri" data-lesson="' + nx.id + '"' + (hctx ? ' data-ctx="' + hctx + '"' : '') + '>' + (done || P.placement ? 'Devam et' : 'Hemen başla') + ': ' + esc(nx.title) + '</button>' : '<button class="btn pri" data-go="projeler">Bitirme projelerine geç</button>';
  h += P.testDone ? '<button class="btn" data-go="paths">Öğrenme yolu seç</button>' : '<button class="btn" data-go="test">Seviyemi belirle</button>';
  h += '</div></div>' + (GOAL ? '</div>' : '');
  h += '<div class="panel today"><div class="sec-head"><h3>Bugün</h3><span class="muted" style="font-size:.85rem">Günlük hedef ' + DAILY_GOAL + ' XP</span></div><div class="bar"><i style="width:' + Math.min(100, td / DAILY_GOAL * 100) + '%"></i></div>';
  h += '<div class="kpis"><div class="kpi"><b>' + P.xp + '</b><span>toplam XP</span></div><div class="kpi"><b>' + st + '</b><span>gün seri</span></div><div class="kpi"><b>' + done + '</b><span>biten ders</span></div></div>';
  if (nx) h += '<div class="continue">' + lvBadge(nx.lvl) + '<div class="grow"><b>' + esc(nx.title) + '</b><span class="muted" style="font-size:.85rem">' + esc(nx.mod) + ' · ~' + lessonMin(nx) + ' dk</span></div><button class="btn sm" data-lesson="' + nx.id + '"' + (hctx ? ' data-ctx="' + hctx + '"' : '') + '>Aç</button></div>';
  h += '<span class="muted" style="font-size:.8rem">İlerlemen bu tarayıcıda saklanır.</span></div></section>';
  if (window.PBI_CAREER && !GOAL) h += window.PBI_CAREER.homeGoal();
  h += guide('home');
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Seviye haritası</span><h2>Üç seviye, her birinin sonunda “yapabilirim”</h2></div>' + (myLevel() ? '<span class="chip">Şu anki seviyen: ' + lvName(myLevel()) + '</span>' : '') + '</div><div class="climb6">';
  LEVELS.forEach(L => { const ids = levelIds(L.id), p = pct(ids); h += '<button class="stop6 ' + L.c + '" data-go="curr" data-lv="' + L.id + '"><span class="row" style="justify-content:space-between;width:100%"><span class="code">' + L.name + '</span><span class="muted num" style="font-size:.76rem">' + ids.filter(i => P.done[i]).length + '/' + ids.length + '</span></span><b>' + esc(L.tag) + '</b><small>' + esc(L.desc) + '</small><span class="daxlen">DAX: ' + esc(L.dax) + '</span><span class="bar"><i style="width:' + p + '%"></i></span></button>'; });
  h += '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Araçlar</span><h2>Okumanın ötesi</h2></div></div><div class="tools">';
  [['studio', 'term', 'DAX Playground', 'Ölçü yaz, ekseni ve dilimleyicileri seç, matris ve grafikte gör. EVALUATE sorguları da çalışır.'], ['pq', 'pq', 'Power Query Lab', 'Kirli tabloyu şeritten komutlarla temizle; her adım M koduna dönüşür, sütun kalitesi anında güncellenir.'], ['lab', 'flask', 'Measure Lab', C.pat + ' uzun kalıp (Orta → İleri): problem, tam formül, satır satır mantık ve canlı sonuç.'], ['dash', 'dash', 'Örnek raporlar', C.dash + ' rapor: her görselin alanları, biçimi, nedeni ve raporun adım adım yapılışı.'], ['projeler', 'flag', 'Bitirme projeleri', 'Her öğrenme yolunun portföy projesi; tam program için 10 aşamalı uygulama kılavuzu.'], ['menus', 'menu', 'Power BI arayüzü', C.cmds + ' komut: Desktop şeridi, bölmeler, Power Query ve Service.'], ['visuals', 'chart', 'Görseller ve biçim', 'Biçim bölmesi benzetimi: her seçenek ne yapar, ne zaman kullanılır, anında gör.'], ['tricks', 'bulb', 'Püf noktaları', C.tricks + ' teknik: araç ipucu sayfası, yer işareti, SVG, alan parametresi…'], ['formulas', 'fx', 'DAX fonksiyonları', window.PBI_CATALOG.length + ' fonksiyon ve ölçü kütüphanesi.']].forEach(([v, i, t, d]) => { h += '<button class="tool" data-go="' + v + '"><span class="tic">' + ic(i) + '</span><b>' + t + '</b><small>' + d + '</small></button>'; });
  h += '</div></section>';
  h += '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Öğrenme yolları</span><h2>Hedefine göre yol seç</h2></div><button class="btn sm ghost" data-go="paths">Tümünü gör</button></div><div class="paths">' + PATHS.map(pathCard).join('') + '</div></section>';
  h += '<section class="row" style="justify-content:space-between"><span class="muted" style="font-size:.85rem">SQL tarafını da öğrenmek ister misin? Aynı şirket ve siparişler <a href="' + SQL_URL + '">Kesit SQL</a>\'de SQL ile sorgulanıyor; Power BI modeli zenginleştirildi.</span></section>';
  return h + '</div>';
}
function pathCard(p) {
  if (window.PBI_CAREER) return window.PBI_CAREER.pathCard(p);
  const ids = p.lessons, pc = pct(ids);
  return '<button class="pcard" data-go="path" data-id="' + p.id + '"><span class="row" style="justify-content:space-between"><span class="ic" style="background:' + p.color + '">' + p.short + '</span><span class="chip">' + ids.length + ' ders</span></span><h3>' + esc(p.name) + '</h3><p>' + esc(p.desc) + '</p><span class="bar"><i style="width:' + pc + '%;background:' + p.color + '"></i></span><span class="foot"><span>%' + pc + ' tamamlandı</span><span>~' + Math.max(1, Math.round(ids.reduce((a, id) => a + (LMAP[id].min || 10), 0) / 60)) + ' saat</span></span></button>';
}
function viewPaths() { const g = goalPath(); return '<div class="wrap">' + head('Öğren', 'Öğrenme yolları', 'Her yol, dersleri bir hedefe göre seçer ve sıralar. Bir yol açıp “Hedefim yap” de ya da üç adımda birlikte seçelim.', 'paths') + '<div class="row"><button class="btn pri" data-go="hedef">' + (g ? 'Hedefi değiştir' : 'Hedefimi seç') + '</button>' + (P.testDone ? '' : '<button class="btn" data-go="test">Bildiklerini atlamak için seviye testi</button>') + '</div><div class="paths">' + PATHS.map(pathCard).join('') + '</div></div>'; }
function viewPath(id) {
  if (window.PBI_CAREER && PMAP[id]) return window.PBI_CAREER.viewPath(id);
  const p = PMAP[id]; if (!p) return viewPaths();
  const ls = p.lessons.map(x => LMAP[x]), nx = ls.find(l => !P.done[l.id]);
  let h = '<div class="wrap"><div class="crumbs"><button data-go="paths">Öğrenme yolları</button><span>/</span><span>' + esc(p.name) + '</span></div>';
  h += '<section class="panel hero-main"><div class="row"><span class="ic" style="background:' + p.color + ';height:46px;min-width:46px">' + p.short + '</span><div class="grow"><span class="eyebrow">Öğrenme yolu</span><h1 style="font-size:1.9rem">' + esc(p.name) + '</h1></div></div><p>' + esc(p.long || p.desc) + '</p>';
  if (p.skills) h += '<div class="row" style="gap:6px">' + p.skills.map(s => '<span class="chip">' + esc(s) + '</span>').join('') + '</div>';
  h += '<div class="bar"><i style="width:' + pct(p.lessons) + '%;background:' + p.color + '"></i></div><div class="row">' + (nx ? '<button class="btn pri" data-lesson="' + nx.id + '" data-ctx="' + p.id + '">' + (pct(p.lessons) ? 'Devam et' : 'Yola başla') + '</button>' : '<span class="chip">Yol tamamlandı</span><button class="btn pri" data-go="projeler">Bitirme projesi</button>') + '<span class="muted num">' + ls.filter(l => P.done[l.id]).length + '/' + ls.length + ' ders · %' + pct(p.lessons) + '</span></div></section>';
  LEVELS.forEach(L => { const items = ls.filter(l => l.lvl === L.id); if (!items.length) return; h += '<section class="lvl-block"><div class="lvl-head">' + '<h2>' + L.name + ' seviye</h2><span class="muted" style="font-size:.88rem">' + items.length + ' ders</span></div><div class="panel lessons">' + items.map(l => lessonRow(l, p.id)).join('') + '</div></section>'; });
  return h + '</div>';
}
function viewMore() {
  const tool = ([v, t, i]) => '<button class="tool" data-go="' + v + '"><span class="tic">' + ic(i) + '</span><b>' + t + '</b><small>' + esc(NAVSUB[v] || '') + '</small></button>';
  return '<div class="wrap"><div class="phead"><h1>Menü</h1></div>' + NAV.map(([g, items]) => '<section class="lvl-block"><span class="eyebrow">' + g + '</span><div class="tools morelist">' + items.map(tool).join('') + '</div></section>').join('') + '<section class="lvl-block"><div class="tools morelist">' + NAVFOOT.map(tool).join('') + '</div></section><section class="lvl-block"><span class="eyebrow">Kesit</span><div class="tools morelist"><a class="tool" href="' + esc(SITE.home) + '"><span class="tic">' + ic('home') + '</span><b>Ana sayfa</b><small>Kesit ailesinin ortak sayfası</small></a><a class="tool" href="' + esc(SITE.sql) + '"><span class="tic">' + ic('term') + '</span><b>Kesit SQL</b><small>Aynı şirketin verisiyle SQL öğren</small></a><a class="tool" href="' + esc(SITE.python) + '"><span class="tic">' + ic('term') + '</span><b>Kesit Python</b><small>Veri analizi için Python öğren</small></a></div></section></div>';
}

/* ---------- Müfredat ---------- */
const currFilter = { lv: 'all', q: '' };
function viewCurr() {
  return '<div class="wrap">' + head('Öğren', 'Dersler', LESSONS.length + ' ders, üç seviye: Temel, Orta, İleri. İstediğin dersi açabilirsin; sıra öneridir.', 'curr') + '<div class="row"><input class="input" id="currQ" placeholder="Ders ara: CALCULATE, RLS, Power Query, araç ipucu…" value="' + esc(currFilter.q) + '" style="max-width:360px" aria-label="Ders ara"><div class="filters">' + ['all'].concat(LEVELS.map(l => l.id)).map(x => '<button data-lvf="' + x + '" aria-pressed="' + (currFilter.lv === x) + '">' + (x === 'all' ? 'Tümü' : lvName(x)) + '</button>').join('') + '</div></div><div id="currList">' + currList() + '</div></div>';
}
function currList() {
  const q = trFold(currFilter.q.trim()); let h = '';
  LEVELS.forEach(L => {
    if (currFilter.lv !== 'all' && currFilter.lv !== L.id) return;
    const ls = LESSONS.filter(l => l.lvl === L.id && (!q || trFold(l.title + ' ' + (l.sum || '') + ' ' + l.mod + ' ' + l.body).includes(q)));
    if (!ls.length) return;
    const mods = []; ls.forEach(l => { let m = mods.find(x => x.n === l.mod); if (!m) { m = { n: l.mod, items: [] }; mods.push(m); } m.items.push(l); });
    const ids = levelIds(L.id);
    h += '<section class="lvl-block" style="margin-bottom:28px"><div class="lvl-head">' + '<h2>' + L.name + ' seviye</h2><span class="muted" style="font-size:.88rem">' + esc(L.desc) + '</span></div>';
    h += '<div class="panel cando"><div><span class="eyebrow">Bu seviyenin sonunda…</span><ul>' + L.can.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul></div><div class="cando-side"><span class="eyebrow">DAX uzunluğu</span><b>' + esc(L.dax) + '</b><span class="bar"><i style="width:' + pct(ids) + '%"></i></span><small class="muted">' + ids.filter(i => P.done[i]).length + '/' + ids.length + ' ders tamamlandı</small></div></div>';
    const nextId = (firstOpen(LESSONS) || {}).id, fold = !q && window.innerWidth <= 760;
    h += '<div class="panel lessons">' + mods.map(m => fold ? '<details class="moddet"' + (m.items.some(l => l.id === nextId) ? ' open' : '') + '><summary class="mod-head">' + esc(m.n) + ' <small class="muted">' + m.items.filter(l => P.done[l.id]).length + '/' + m.items.length + '</small></summary>' + m.items.map(l => lessonRow(l)).join('') + '</details>' : '<div class="mod-head">' + esc(m.n) + '</div>' + m.items.map(l => lessonRow(l)).join('')).join('') + '</div></section>';
  });
  return h || '<div class="panel empty">Aramana uyan ders bulunamadı.</div>';
}

/* ---------- Ders ---------- */
let ED = null;
function viewLesson() {
  const l = LMAP[S.id]; if (!l) return '<div class="wrap"><div class="panel empty">Ders bulunamadı.</div></div>';
  P.last = l.id; save(); const ex = l.ex || [];
  let h = '<div class="wrap" style="gap:18px"><div class="lhead"><div class="crumbs">' + (S.ctx && PMAP[S.ctx] ? '<button data-go="path" data-id="' + S.ctx + '">' + esc(PMAP[S.ctx].name) + '</button>' : '<button data-go="curr">Dersler</button>') + '<span>/</span>' + lvBadge(l.lvl) + '<span>' + esc(l.mod) + '</span></div>';
  if (S.ctx && PMAP[S.ctx] && PMAP[S.ctx].lessons.includes(l.id)) { const arr = PMAP[S.ctx].lessons, pos = arr.indexOf(l.id), dn = arr.filter(x => P.done[x]).length; let msn = ''; if (window.PBI_CAREER) { const ms = window.PBI_CAREER.milestones(PMAP[S.ctx]); const mi = ms.findIndex(m => m.ids.includes(l.id)); if (mi >= 0 && ms.length > 1) msn = ' · Aşama ' + (mi + 1) + ': ' + ms[mi].t; } h += '<div class="lctx"><span>' + esc(PMAP[S.ctx].name) + ' ' + (pos + 1) + '/' + arr.length + msn + '</span><span class="bar"><i style="width:' + Math.round(dn / arr.length * 100) + '%"></i></span></div>'; }
  h += '<div class="row" style="justify-content:space-between;align-items:end"><h1 style="font-size:clamp(1.5rem,3.4vw,2.1rem)">' + esc(l.title) + '</h1><span class="muted" style="font-size:.85rem" title="Okuma ve alıştırmalar dahil">~' + lessonMin(l) + ' dk</span></div>';
  h += '<div class="steps"><button data-step="0" aria-current="' + (S.step === 0) + '" class="' + (P.seen[l.id] ? 'done' : '') + '">Konu</button>' + ex.map((e, i) => '<button data-step="' + (i + 1) + '" aria-current="' + (S.step === i + 1) + '" class="' + (P.ex[exKey(l, i)] ? 'done' : '') + '" aria-label="Alıştırma ' + (i + 1) + '">' + (i + 1) + (e.t === 'pq' ? '<i class="dxdot pq" title="Power Query"></i>' : e.t !== 'mc' ? '<i class="dxdot" title="DAX"></i>' : '') + '</button>').join('') + '</div></div>';
  if (S.step === 0) {
    h += '<article class="panel theory">' + l.body + '</article><div class="pager"><span></span>' + (ex.length ? '<button class="btn pri" data-step="1">Alıştırmalara geç (' + ex.length + ')</button>' : (P.done[l.id] ? nextBtn(l) : '<button class="btn pri" data-act="read-done">Okudum, dersi tamamla</button>')) + '</div>';
  } else if (S.step <= ex.length) {
    const e = ex[S.step - 1], k = exKey(l, S.step - 1);
    h += e.t === 'mc' ? mcView(e, k) : e.t === 'pq' ? window.PBI_PQUI.lessonView(e, k) : daxView(e, k);
    h += '<div class="pager"><button class="btn" data-step="' + (S.step - 1) + '">Geri</button>' + (window.PBI_PRACTICE_UI ? window.PBI_PRACTICE_UI.reportBtn('Ders ' + l.id + ' · alıştırma ' + S.step) : '') + (S.step < ex.length ? '<button class="btn" data-step="' + (S.step + 1) + '">Sonraki alıştırma</button>' : (P.done[l.id] ? nextBtn(l) : '<button class="btn" data-step="0">Konuya dön</button>')) + '</div>';
  }
  return h + '</div>';
}
function nextBtn(l) {
  let nx = null; const ctx = S.ctx && PMAP[S.ctx] && PMAP[S.ctx].lessons.includes(l.id) ? S.ctx : null;
  if (ctx) { const arr = PMAP[ctx].lessons, i = arr.indexOf(l.id), rest = arr.slice(i + 1).map(id => LMAP[id]).filter(Boolean); nx = firstOpen(rest); if (!nx) { const all = arr.map(id => LMAP[id]).filter(Boolean); nx = firstOpen(all); } if (nx && nx.id === l.id) nx = null; if (!nx) return '<button class="btn pri" data-go="path" data-id="' + ctx + '" data-scroll="cap">Yolu bitirdin: bitirme projesi</button>'; }
  else { nx = firstOpen(LESSONS.slice(l._i + 1)); if (nx && l.id !== 'tarih' && nx.id === 'tarih') nx = firstOpen(LESSONS.slice(nx._i + 1)) || nx; }
  return nx ? '<button class="btn pri" data-lesson="' + nx.id + '"' + (ctx ? ' data-ctx="' + ctx + '"' : '') + '>Sonraki ders: ' + esc(nx.title) + '</button>' : '<button class="btn pri" data-go="projeler">Bitirme projelerine geç</button>';
}
/* Şık sırası: veride doğru cevap çoğunlukla B'de; her soru için sabit (soru metninden türeyen) bir karışık sıra kullan.
   “Hiçbiri / Hepsi / İkisi …” gibi şıklar sonda kalır. */
function optOrder(q) {
  const n = q.o.length; let h = 2166136261; const key = String(q.q || '') + '|' + q.o.join('|');
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const fixedEnd = /^(Hiçbiri|Hepsi|İkisi|Hiçbir|Yukarıdakiler)/i;
  const free = [], tail = []; for (let i = 0; i < n; i++) (fixedEnd.test(String(q.o[i]).replace(/<[^>]+>/g, '')) ? tail : free).push(i);
  for (let i = free.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; const j = h % (i + 1); [free[i], free[j]] = [free[j], free[i]]; }
  return free.concat(tail);
}
/* Kademeli ipuçları: yazarın ipucu → kullanılan fonksiyonlar ve ölçüler → çözümün iskeleti */
function hintsOf(e) {
  if (e.t === 'pq') { const O = window.PBI_PQ.OPS; const names = []; e.sol.forEach(s => { if (!names.includes(O[s.op].name)) names.push(O[s.op].name); }); return [e.hint ? esc(e.hint) : 'Hedef tabloyu aç ve kendi tablonla sütun sütun karşılaştır.', 'Örnek çözüm ' + e.sol.length + ' adım; kullanılan komutlar: ' + names.map(n => '<b>' + esc(n) + '</b>').join(', ') + '.', 'Adımlar sırasıyla: ' + e.sol.map(s => '<code>' + esc(O[s.op].name) + (s.cols && s.cols.length ? ' → ' + s.cols.join(', ') : '') + '</code>').join(' · ')]; }
  const out = []; const sol = String(e.sol || '');
  if (e.hint) { const ch = CHK.cleanHint(e); out.push(ch === e.hint ? esc(ch) : ch); }
  const fns = []; (sol.match(/\b[A-Z][A-Z0-9.]*(?=\s*\()/g) || []).forEach(f => { if (!fns.includes(f) && f !== 'EVALUATE') fns.push(f); });
  const ms = []; (sol.match(/(^|[^\w'\]])\[([^\]]+)\]/g) || []).forEach(m => { const n = m.replace(/^[^\[]*\[/, '').slice(0, -1); if (LIBMAP[n] && !ms.includes(n)) ms.push(n); });
  if (fns.length || ms.length) out.push((fns.length ? 'Çözümde kullanılan fonksiyonlar: ' + fns.map(f => '<code>' + esc(f) + '</code>').join(', ') + '.' : '') + (ms.length ? ' Hazır ölçüler: ' + ms.map(m => '<code>[' + esc(m) + ']</code>').join(', ') + '.' : ''));
  const lines = sol.split('\n').length;
  if (fns.length) { const sk = sol.replace(/"[^"]*"/g, '"…"').replace(/\b\d+(\.\d+)?\b/g, '…').replace(/(\w+)?\[([^\]]+)\]/g, (m0, t) => t ? t + '[…]' : '[…]');
    out.push('Çözümün iskeleti (' + lines + ' satır; tablo, sütun ve değerleri sen doldur):<pre class="m" style="margin:6px 0 0;white-space:pre-wrap">' + esc(sk) + '</pre>'); }
  if (!out.length) out.push('Konu anlatımındaki örneklere geri dön; çözüm oradaki kalıba çok benziyor.');
  return out;
}
function mcView(e, k) {
  const solved = P.ex[k];
  let h = '<div class="panel brief" style="max-width:820px"><span class="eyebrow">Soru' + (solved ? ' · çözüldü' : '') + '</span><div class="q">' + e.q + '</div><div class="mc' + (e.thumbs ? ' mc-vis' : '') + '" id="mc">';
  optOrder(e).forEach((i, pos) => { const o = e.o[i]; h += '<button data-mc="' + i + '" class="' + (solved && i === e.a ? 'right' : '') + '">' + (e.thumbs ? V.thumb(e.thumbs[i]) : '<span class="key">' + String.fromCharCode(65 + pos) + '</span>') + '<span>' + o + '</span></button>'; });
  return h + '</div><div id="mcFb">' + (solved && e.why ? '<div class="msg ok"><b>Doğru.</b>' + e.why + '</div>' : '') + '</div></div>';
}
const DEFAULT_GRID = [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }];
function daxView(e, k) {
  const solved = P.ex[k]; const isQ = e.t === 'query';
  let h = '<div class="ex-grid"><div class="panel brief"><div class="row" style="justify-content:space-between"><span class="eyebrow">' + (isQ ? 'DAX sorgusu' : 'Ölçü yaz') + (solved ? ' · çözüldü' : '') + '</span>' + (!isQ ? '<span class="chip dx">' + esc(e.name) + '</span>' : '') + '</div><div class="q">' + e.q + '</div>';
  if (!isQ) { const g = e.grid || DEFAULT_GRID; h += '<div class="note" style="margin:0"><b>Nasıl kontrol edilir?</b>Ölçün ' + (e.noTotal ? '' : 'toplamda ve ') + g.map(x => '<code>' + colKey(x) + '</code>').join(' ile ') + ' kırılımlarında hesaplanır ve doğru çözümle karşılaştırılır. Hazır ölçüler (ör. <code>[Net Satış]</code>, <code>[Hedef]</code>) kullanılabilir.</div>'; }
  const exm = CUR && CUR.exam, arn = CUR && CUR.arena;
  if (!exm) h += '<div class="row" style="gap:8px">' + '<button class="btn sm" data-act="hint">' + (arn ? 'İpucu (−%30 puan)' : 'İpucu') + '</button>' + (arn ? '' : '<button class="btn sm ghost" data-act="sol">Çözümü göster</button><button class="btn sm ghost" data-act="ex-studio">Playground’da aç</button>') + '</div>';
  h += '<div id="hintBox"></div><div id="solBox"></div></div>';
  h += '<div class="work"><div class="ed-shell"><div class="ed-top"><span>' + (isQ ? 'EVALUATE sorgusu' : esc(e.name) + ' =') + '</span><span class="kbdhint">Ctrl/⌘ + Enter: kontrol et</span></div><div id="ed"></div></div><div class="ed-actions"><button class="btn pri" data-act="check">Kontrol et</button><button class="btn" data-act="run">Yalnızca çalıştır</button><button class="btn ghost sm" data-act="reset-ed">Baştan başla</button></div><div id="out"></div></div></div>';
  return h;
}
function mountLesson() {
  const l = LMAP[S.id]; if (!l) return;
  if (S.step === 0) { if (!P.seen[l.id]) { P.seen[l.id] = true; save(); } return; }
  const e = (l.ex || [])[S.step - 1]; if (!e || e.t === 'mc') return;
  const k = exKey(l, S.step - 1), i = S.step - 1;
  mountEx(e, k, q => solved(l, i, k, q));
}
function cmpVal(a, b) {
  const bl = v => v === null || v === undefined || (typeof v === 'number' && isNaN(v));
  if (bl(a) && bl(b)) return true; if (bl(a) || bl(b)) return false;
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return String(a) === String(b);
}
function gridEval(ms, expr, grid, noTotal, sl) {
  const out = []; sl = sl || [];
  if (!noTotal) out.push({ g: 'Toplam', rows: [{ k: 'Toplam', v: X.evalMeasure(ms, expr, sl) }] });
  grid.forEach(col => { const r = X.query({ rows: [col], measures: ms, values: [expr], slicers: sl, totals: false, keepBlank: true }); out.push({ g: colKey(col), rows: r.rows.map(x => ({ k: x.keys[0], v: x.vals[0] })) }); });
  return out;
}
const explainBox = e => (e.explain ? '<div class="explain"><b>Mantığı</b>' + e.explain + '</div>' : '') + (e.why ? '<div class="explain"><b>Neden?</b>' + e.why + '</div>' : '');
function checkEx(grade, quiet) {
  const CX = curX(), e = CX.e, k = CX.k; const out = $('#out'); const src = ED.get();
  if (!src.trim() || (e.t === 'query' && !/EVALUATE[\s\S]*\S/.test(src.replace(/^\s*EVALUATE\s*$/, '')))) { out.innerHTML = '<div class="msg info"><b>Editör boş</b>Önce bir ifade yaz.</div>'; return; }
  try {
    if (e.t === 'query') {
      const mine = X.runQuery(measureSet(), src); const html = resultTable(mine.cols, mine.rows);
      if (!grade) { out.innerHTML = html; return; }
      const ref = X.runQuery(measureSet(), e.sol);
      const cmp = CHK.compareQuery(mine, ref, e, src), tq = cmp.ok ? CHK.techIssue(e, k && CX.l ? CX.l.id + '#' + CX.i : null, src) : '';
      if (cmp.ok && tq) { out.innerHTML = '<div class="msg info"><b>Sonuç doğru, ama teknik farklı</b>' + esc(tq) + '</div>' + html; return; }
      if (cmp.ok) { CX.onSolved(quiet); out.innerHTML = '<div class="msg ok"><b>Doğru!</b>Sorgun beklenen ' + ref.rows.length + ' satırı döndürdü.' + (CX.exam ? '' : explainBox(e)) + '</div>' + html; }
      else { noteWrong(CX); out.innerHTML = '<div class="msg err"><b>Henüz değil</b>' + esc(cmp.msg) + '</div>' + html; }
      return;
    }
    const ms = measureSet(e.name); const grid = e.grid || DEFAULT_GRID;
    const expr = X.stripDef(src).expr; const err0 = X.check(src); if (err0) throw new X.DaxError(err0);
    const mine = gridEval(ms, expr, grid, e.noTotal);
    if (!grade) { out.innerHTML = gridHTML(mine, null, e.name); return; }
    const ref = gridEval(measureSet(e.name), e.sol, grid, e.noTotal);
    let bad = 0, total = 0;
    ref.forEach((G, gi) => G.rows.forEach(r => { total++; const m = (mine[gi].rows.find(x => X.keyOf(x.k) === X.keyOf(r.k)) || {}).v; if (!cmpVal(m, r.v)) bad++; }));
    /* gizli testler (Arena, sınav): görünmeyen kırılım ve dilimleyicilerde de aynı sonuç */
    let hid = null; const allHidden = (e.hidden || []).concat(CHK.autoHidden(e));
    if (!bad) for (const hc of allHidden) { const g2 = hc.grid || grid, nt = hc.noTotal !== undefined ? hc.noTotal : e.noTotal; const r2 = gridEval(measureSet(e.name), e.sol, g2, nt, hc.slicers), m2 = gridEval(ms, expr, g2, nt, hc.slicers); let b2 = 0; r2.forEach((G, gi) => G.rows.forEach(r => { const m = (m2[gi].rows.find(x => X.keyOf(x.k) === X.keyOf(r.k)) || {}).v; if (!cmpVal(m, r.v)) b2++; })); if (b2) { hid = hc; break; } }
    if (hid) { noteWrong(CX); out.innerHTML = '<div class="msg err"><b>Gizli test başarısız</b>Görünen tablo doğru, ama ölçün şu durumda farklı sonuç veriyor: <b>' + esc(hid.label) + '</b>. ' + esc(hid.why || 'Sabit bir değere ya da belirli bir filtreye dayanıyor olabilir.') + '</div>' + gridHTML(mine, null, e.name); return; }
    const tech = bad ? '' : CHK.techIssue(e, CX.l ? CX.l.id + '#' + CX.i : null, src);
    if (tech) { out.innerHTML = '<div class="msg info"><b>Sonuç doğru, ama teknik farklı</b>' + esc(tech) + '</div>' + gridHTML(mine, null, e.name); return; }
    if (!bad) { CX.onSolved(quiet); out.innerHTML = '<div class="msg ok"><b>Doğru!</b>' + total + ' hücrenin tamamı beklenen sonuçla aynı' + (allHidden.length ? ' ve ' + allHidden.length + ' gizli test de geçti' : '') + '.' + (CX.exam ? '' : explainBox(e)) + '</div>' + gridHTML(mine, CX.exam ? null : ref, e.name); }
    else if (CX.exam) { noteWrong(CX); out.innerHTML = '<div class="msg err"><b>Henüz değil</b>' + total + ' hücreden ' + bad + ' tanesi beklenenden farklı. Sınavda beklenen değerler gösterilmez.</div>' + gridHTML(mine, null, e.name); }
    else { noteWrong(CX); out.innerHTML = '<div class="msg err"><b>Henüz değil</b>' + total + ' hücreden ' + bad + ' tanesi beklenenden farklı. Farklı hücreler işaretli; “beklenen” değerleri ipucu olarak kullan.</div>' + gridHTML(mine, ref, e.name); }
  } catch (er) {
    if (!er.dax) console.error(er);
    out.innerHTML = daxErrHTML(er);
  }
}
function daxErrHTML(er, src) {
  if (src == null) { const ta = document.querySelector('.ed-shell textarea'); src = ta ? ta.value : ''; }
  const raw = String(er && er.message || er || ''); const tips = [];
  let msg = er && er.dax ? raw : 'Bu ifade hesaplanamadı. Parantezleri, bağımsız değişken sayısını ve türünü kontrol et.';
  if (er instanceof RangeError || /call stack|too much recursion/i.test(raw)) msg = 'İfade çok derin iç içe geçmiş ya da kendini çağıran bir ölçü var. Ölçüyü VAR ile parçalara böl; bir ölçünün kendi adını çağırmadığından emin ol.';
  const t = String(src || '').trim();
  if (/^=/.test(t)) tips.push('Başta “=” işaretine gerek yok: Excel’deki gibi değil. Burada yalnızca ifadeyi yaz (örnek: SUM(Satislar[Tutar])). Ölçüyü tanımlarken “Ad = ifade” biçimi Power BI’ın kendi formül çubuğuna özgüdür.');
  if (/;/.test(t.replace(/"[^"]*"/g, ''))) tips.push('Bağımsız değişkenleri “;” ile ayırmışsın. Bu uygulama, Power BI’ın varsayılan ayarı gibi “,” bekler. Türkçe bölgesel ayarlı Power BI Desktop’ta “;” görebilirsin; burada virgül kullan.');
  if (/[“”‘’]/.test(t)) tips.push('Akıllı tırnak (“ ” ‘ ’) var. Metinler için düz çift tırnak ("), tablo adları için düz tek tırnak (\') kullan.');
  return '<div class="msg err"><b>DAX hatası</b><span class="vend">' + esc(msg) + '</span>' + tips.map(x => '<p class="errtip"><b>İpucu:</b> ' + esc(x) + '</p>').join('') + '</div>';
}
/* Aralıklı tekrar: ilk kez çözülen alıştırma 1, 3, 7, 16, 35 gün sonra yeniden sorulur */
const RV_GAPS = [1, 3, 7, 16, 35];
const addDaysYmd = n => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
function trackRv(k) { P.rv = P.rv || {}; if (!P.rv[k]) P.rv[k] = { b: 0, d: addDaysYmd(RV_GAPS[0]) }; }
function solved(l, i, k, quiet) {
  if (!P.ex[k]) { P.ex[k] = true; trackRv(k); addXP(l.ex[i].t === 'mc' ? 5 : 10); if (!quiet) toast('+' + (l.ex[i].t === 'mc' ? 5 : 10) + ' XP'); save(); }
  const b = document.querySelector('.steps button[data-step="' + (i + 1) + '"]'); if (b) b.classList.add('done');
  if (checkLessonDone(l)) { const p = document.querySelector('.pager'); if (p) p.lastElementChild.outerHTML = nextBtn(l); }
}
function gridHTML(mine, ref, name) {
  const f = fmtOf(name);
  return '<div class="panel result">' + mine.map((G, gi) => {
    const R = ref && ref[gi];
    let h = '<div class="rset"><div class="result-meta"><span><b>' + esc(G.g) + '</b></span><span>' + G.rows.length + ' satır</span></div><div class="rtable"><table><thead><tr><th>' + (G.g === 'Toplam' ? '' : esc(G.g)) + '</th><th class="numc">Senin sonucun</th>' + (R ? '<th class="numc">Beklenen</th>' : '') + '</tr></thead><tbody>';
    const rows = R ? R.rows : G.rows;
    rows.forEach(r => { const m = R ? (G.rows.find(x => X.keyOf(x.k) === X.keyOf(r.k)) || {}).v : r.v; const ok = !R || cmpVal(m, r.v); h += '<tr class="' + (ok ? '' : 'bad') + '"><td>' + esc(V.fmt(r.k)) + '</td><td class="numc">' + esc(fmtVal(m, f)) + '</td>' + (R ? '<td class="numc">' + esc(fmtVal(r.v, f)) + '</td>' : '') + '</tr>'; });
    return h + '</tbody></table></div></div>';
  }).join('') + '</div>';
}
function fmtVal(v, f) { if (v === null || v === undefined) return '(Boş)'; if (typeof v === 'number') { if (f === 'yuzde') return V.fmt(v, 'yuzde'); if (f === 'para') return V.fmt(v, 'para'); return V.fmt(v); } return V.fmt(v); }
function resultTable(cols, rows, lim) {
  lim = lim || 200;
  let h = '<div class="panel result"><div class="result-meta"><span>' + rows.length + ' satır · ' + cols.length + ' sütun</span>' + (rows.length > lim ? '<span>İlk ' + lim + ' satır gösteriliyor</span>' : '') + '</div><div class="rtable"><table><thead><tr>' + cols.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>';
  rows.slice(0, lim).forEach(r => { h += '<tr>' + r.map((v, j) => { const f = guessFmt(cols[j]); return '<td class="' + (typeof v === 'number' ? 'numc' : '') + (v === null ? ' null' : '') + '">' + esc(v === null ? '(Boş)' : typeof v === 'number' ? fmtVal(v, f && /%/.test(cols[j]) ? 'yuzde' : null) : V.fmt(v)) + '</td>'; }).join('') + '</tr>'; });
  if (!rows.length) h += '<tr><td class="null">Sonuç boş</td></tr>';
  return h + '</tbody></table></div></div>';
}

/* ---------- Editör ---------- */
function makeEditor(host, init, onSubmit, isQ) {
  const keys = ['[', ']', '(', ')', '"', ',', '=', '&', '{', '}', 'CALCULATE(', 'SUM(', 'DIVIDE(', 'FILTER(', 'ALL(', 'VAR ', 'RETURN '].concat(isQ ? ['EVALUATE', 'SUMMARIZECOLUMNS('] : []);
  host.innerHTML = '<div class="ed"><pre aria-hidden="true"><code></code></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="DAX editörü" id="daxEditor"></textarea></div><div class="ed-keys">' + keys.map(k => '<button type="button" data-k="' + esc(k) + '">' + esc(k.trim()) + '</button>').join('') + '</div>';
  const ta = $('textarea', host), code = $('code', host), pre = $('pre', host);
  const api = { get: () => ta.value, set: v => { ta.value = v; paint(); api.onChange && api.onChange(v); }, onChange: null, focus: () => ta.focus(), insert: t => insert(t) };
  function paint() { code.innerHTML = hl(ta.value) + '\n'; pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; }
  ta.value = init; paint();
  ta.addEventListener('input', () => { paint(); api.onChange && api.onChange(ta.value); });
  ta.addEventListener('scroll', () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; });
  ta.addEventListener('keydown', ev => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); onSubmit && onSubmit(); }
    else if (ev.key === 'Escape') { ta.blur(); toast('Düzenleyiciden çıktın; Tab ile sonraki öğeye geçebilirsin.'); }
    else if (ev.key === 'Tab' && !ev.shiftKey) { ev.preventDefault(); insert('    '); }
    else if (ev.key === 'Enter') { const before = ta.value.slice(0, ta.selectionStart); const ln = before.split('\n').pop(); const ind = (ln.match(/^\s*/) || [''])[0] + (/[(,]\s*$/.test(ln) ? '    ' : ''); ev.preventDefault(); insert('\n' + ind); }
  });
  function insert(t) { const s = ta.selectionStart, e = ta.selectionEnd; ta.setRangeText(t, s, e, 'end'); ta.dispatchEvent(new Event('input')); }
  host.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { insert(b.dataset.k); ta.focus(); }));
  return api;
}

/* ---------- Veri Modeli ---------- */
let modelSel = 'Satislar';
const ER_POS = { Departmanlar: [10, 330], Musteriler: [240, 20], Calisanlar: [240, 300], Satislar: [490, 120], Urunler: [750, 20], Tarih: [750, 230], Kategoriler: [1000, 20], StokGorunum: [1000, 120], Hedefler: [1000, 270], WebOlaylari: [1000, 390] };
function viewModel() {
  const params = X.TNAMES.filter(t => !ER_POS[t] && MODEL.tables[t].kind === 'param'), extras = X.TNAMES.filter(t => !ER_POS[t] && MODEL.tables[t].kind !== 'param');
  let h = '<div class="wrap">' + head('Referans', 'Anadolu Market modeli', X.TNAMES.length + ' tablo · ' + MODEL.rels.length + ' ilişki. Çekirdek satış modeli, örnek rapor senaryoları için ' + extras.length + ' ek tablo ve ' + params.length + ' bağlantısız parametre tablosu.', 'model');
  h += '<div class="panel dlbox"><div class="grow"><b>Bu veriyle Power BI Desktop’ta çalış</b><small>' + ((window.PBI_CAREER && window.PBI_CAREER.DATA_TABLES.length) || X.TNAMES.filter(t => MODEL.tables[t].kind !== 'param').length) + ' tablo CSV olarak, ilişkileri ve içe aktarma ipuçlarını anlatan bir BENIOKU dosyasıyla tek .zip içinde. Bitirme projelerini kendi bilgisayarında kurmak için.</small></div><button class="btn pri" data-act="data-zip">' + ic('dl') + ' Veri setini indir</button></div>';
  h += '<div class="panel er" id="er">' + erSVG() + '</div>';
  if (extras.length) h += '<div class="panel ptables"><span class="eyebrow">Ek tablolar: finans, müşteri hizmetleri, tedarik ve proje</span><div class="row" style="gap:6px">' + extras.map(t => '<button class="chip" data-tbl="' + t + '" aria-pressed="' + (t === modelSel) + '">' + t + ' <small class="muted">' + MODEL.tables[t].rows.length + '</small></button>').join('') + '</div><p class="muted" style="margin:6px 0 0;font-size:.86rem">Finans (Giderler, GiderButce, GiderTurleri), müşteri hizmetleri (Talepler), tedarik (SatinAlmalar, Tedarikciler) ve proje portföyü (Projeler). Tarih, Musteriler, Urunler ve Departmanlar boyutlarına bağlıdır; ilişkiler aşağıdaki tabloda.</p></div>';
  h += '<div class="panel ptables"><span class="eyebrow">Bağlantısız (parametre) tablolar</span><div class="row" style="gap:6px">' + params.map(t => '<button class="chip" data-tbl="' + t + '" aria-pressed="' + (t === modelSel) + '">' + t + ' <small class="muted">' + MODEL.tables[t].rows.length + '</small></button>').join('') + '</div><p class="muted" style="margin:6px 0 0;font-size:.86rem">Bu tabloların modelde ilişkisi yoktur. Dilimleyici ya da eksen olarak kullanılır; ölçüler seçimi SELECTEDVALUE veya TREATAS ile okur (ne olur parametresi, Top N, para birimi, alan parametresi, RFM segmentleri).</p></div><div id="tdetail"></div>';
  h += '<div class="panel" style="padding:18px 20px"><h3 style="margin-bottom:8px">Bu modeldeki ilişkiler</h3><div class="coltable"><table><thead><tr><th>Bir (1)</th><th>Çok (*)</th><th>Kardinalite</th><th>Filtre yönü</th><th>Durum</th></tr></thead><tbody>' + MODEL.rels.map(r => '<tr><td>' + r.to + '[' + r.toCol + ']</td><td>' + r.from + '[' + r.fromCol + ']</td><td>Bire-çok</td><td>Tek</td><td>' + (r.inactive ? '<span class="chip">Pasif · USERELATIONSHIP</span>' : 'Etkin') + '</td></tr>').join('') + '</tbody></table></div></div>';
  return h + '</div>';
}
function erSVG() {
  const Wd = 200, rowH = 15, head0 = 24; let lines = '', boxes = '';
  const boxH = t => head0 + MODEL.tables[t].cols.length * rowH + 6;
  const anchor = (t, c) => { const [x, y] = ER_POS[t]; const i = MODEL.tables[t].cols.indexOf(c); return [x, y + head0 + i * rowH + rowH / 2 + 1]; };
  MODEL.rels.forEach(r => {
    if (!ER_POS[r.to] || !ER_POS[r.from]) return;
    const [x1, y1] = anchor(r.to, r.toCol), [x2, y2] = anchor(r.from, r.fromCol); let d, a, b;
    if (Math.abs(x1 - x2) < 10) { a = [x1 + Wd, y1]; b = [x2 + Wd, y2]; const bx = x1 + Wd + 34; d = 'M' + a[0] + ',' + a[1] + ' C' + bx + ',' + a[1] + ' ' + bx + ',' + b[1] + ' ' + b[0] + ',' + b[1]; }
    else { a = x1 < x2 ? [x1 + Wd, y1] : [x1, y1]; b = x1 < x2 ? [x2, y2] : [x2 + Wd, y2]; const mx = (a[0] + b[0]) / 2; d = 'M' + a[0] + ',' + a[1] + ' C' + mx + ',' + a[1] + ' ' + mx + ',' + b[1] + ' ' + b[0] + ',' + b[1]; }
    const right = a[0] <= b[0];
    lines += '<path d="' + d + '"' + (r.inactive ? ' class="inactive"' : '') + '/><text class="card1" x="' + (a[0] + (right ? 4 : -10)) + '" y="' + (a[1] - 3) + '">1</text><text class="card1" x="' + (b[0] + (right && Math.abs(x1 - x2) >= 10 ? -10 : 4)) + '" y="' + (b[1] - 3) + '">*</text>';
  });
  Object.keys(ER_POS).forEach(t => { const [x, y] = ER_POS[t]; const tb = MODEL.tables[t]; const fact = tb.kind === 'fact'; boxes += '<g class="tbox' + (t === modelSel ? ' sel' : '') + (fact ? ' fact' : '') + '" data-tbl="' + t + '" tabindex="0" role="button" aria-label="' + t + ' tablosu"><rect x="' + x + '" y="' + y + '" width="' + Wd + '" height="' + boxH(t) + '" rx="8"/><path class="hd" d="M' + x + ',' + (y + head0) + 'V' + (y + 8) + 'Q' + x + ',' + y + ' ' + (x + 8) + ',' + y + 'H' + (x + Wd - 8) + 'Q' + (x + Wd) + ',' + y + ' ' + (x + Wd) + ',' + (y + 8) + 'V' + (y + head0) + 'Z"/><text class="t" x="' + (x + 10) + '" y="' + (y + 16) + '">' + t + '</text><text class="k" x="' + (x + Wd - 10) + '" y="' + (y + 16) + '" text-anchor="end">' + (fact ? 'OLGU' : 'BOYUT') + '</text>' + tb.cols.map((c, i) => { const isPk = MODEL.rels.some(r => r.to === t && r.toCol === c), isFk = MODEL.rels.some(r => r.from === t && r.fromCol === c); return '<text x="' + (x + 10) + '" y="' + (y + head0 + i * rowH + 12) + '">' + c + '</text>' + (isPk ? '<text class="k" x="' + (x + Wd - 10) + '" y="' + (y + head0 + i * rowH + 12) + '" text-anchor="end">1</text>' : isFk ? '<text class="fk" x="' + (x + Wd - 10) + '" y="' + (y + head0 + i * rowH + 12) + '" text-anchor="end">*</text>' : ''); }).join('') + '</g>'; });
  return '<svg viewBox="0 0 1240 560" role="img" aria-label="Model diyagramı">' + lines + boxes + '</svg>';
}
function mountModel() { showTable(modelSel); }
function showTable(t) {
  modelSel = t; const er = $('#er'); if (er) er.innerHTML = erSVG();
  document.querySelectorAll('.ptables [data-tbl]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tbl === t));
  const tb = MODEL.tables[t]; const rows = tb.rows.slice(0, 8);
  let h = '<div class="panel" style="padding:18px 20px;display:flex;flex-direction:column;gap:12px"><div class="row" style="justify-content:space-between"><h2>' + t + '</h2><span class="chip">' + tb.rows.length.toLocaleString('tr-TR') + ' satır · ' + ({ fact: 'olgu', dim: 'boyut', param: 'parametre (bağlantısız)' })[tb.kind] + '</span></div><p class="muted" style="margin:0">' + esc((MODEL.notes || {})[t] || '') + '</p>';
  h += '<div class="coltable"><table><thead><tr><th>Sütun</th><th>Tür</th><th>Açıklama</th></tr></thead><tbody>' + tb.cols.map(c => { const r0 = tb.rows.find(r => r[c] != null); const v = r0 ? r0[c] : null; const ty = v instanceof Date ? 'Tarih' : typeof v === 'number' ? (Number.isInteger(v) ? 'Tam sayı' : 'Ondalık') : 'Metin'; const calc = tb.calc && tb.calc[c]; return '<tr><td>' + c + '</td><td>' + ty + (calc ? ' <span class="chip">hesaplanmış</span>' : '') + '</td><td>' + esc((MODEL.colDesc || {})[t + '[' + c + ']'] || '') + (calc ? '<code class="mcode">' + hl(calc) + '</code>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  h += '<span class="eyebrow">İlk ' + rows.length + ' satır</span>' + resultTable(tb.cols, rows.map(r => tb.cols.map(c => r[c] === undefined ? null : r[c])));
  h += '<div class="row"><button class="btn sm" data-try="EVALUATE TOPN(20, ' + t + ')">Playground’da sorgula</button></div></div>';
  $('#tdetail').innerHTML = h;
}

/* ---------- DAX Playground ---------- */
const ST = Object.assign({ mode: 'm', code: { m: 'Net Satış Payı % =\nDIVIDE(\n    [Net Satış],\n    CALCULATE([Net Satış], ALL(Kategoriler))\n)', q: 'EVALUATE\nSUMMARIZECOLUMNS(\n    Kategoriler[Kategori],\n    "Net Satış", [Net Satış],\n    "Hedef", [Hedef],\n    "Gerçekleşme", [Hedef Gerçekleşme %]\n)\nORDER BY [Net Satış] DESC' }, axis: 'Kategoriler[Kategori]', axis2: '', chart: 'column', yil: [], kanal: [], side: 'fields' }, P.studio || {});
function saveStudio() { P.studio = { mode: ST.mode, code: ST.code, axis: ST.axis, axis2: ST.axis2, chart: ST.chart, yil: ST.yil, kanal: ST.kanal, side: ST.side }; save(); }
const STUDIO_EX = [
  ['Kategori payı', 'm', 'Net Satış Payı % =\nDIVIDE([Net Satış], CALCULATE([Net Satış], ALL(Kategoriler)))', 'Kategoriler[Kategori]'],
  ['Yıllık büyüme', 'm', 'YoY % =\nVAR BuYil = [Net Satış]\nVAR GecenYil = CALCULATE([Net Satış], SAMEPERIODLASTYEAR(Tarih[Tarih]))\nRETURN DIVIDE(BuYil - GecenYil, GecenYil)', 'Kategoriler[Kategori]'],
  ['Aylık YTD', 'm', 'Satış YTD = TOTALYTD([Net Satış], Tarih[Tarih])', 'Tarih[YilAy]', 'line'],
  ['Teslim tarihine göre (pasif ilişki)', 'm', 'Teslime Göre =\nCALCULATE([Net Satış], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))', 'Tarih[Ay]', 'column'],
  ['Bağlam geçişi farkı', 'm', '// SUM satır bağlamını filtreye çevirmez:\nSUMX(Musteriler, SUM(Satislar[Tutar]))', 'Satislar[Kanal]'],
  ['Ürün sırası', 'm', 'Ürün Sırası = IF(HASONEVALUE(Urunler[Urun]), RANKX(ALL(Urunler[Urun]), [Net Satış]))', 'Urunler[Urun]', 'table'],
  ['Önceki ay (OFFSET)', 'm', 'Önceki Ay =\nCALCULATE([Net Satış], OFFSET(-1, ALLSELECTED(Tarih[YilAy]), ORDERBY(Tarih[YilAy])))', 'Tarih[YilAy]', 'table'],
  ['Stok (yarı toplanabilir)', 'm', 'Dönem Sonu Stok =\nCALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))', 'Tarih[YilCeyrek]', 'column'],
  ['İlk 5 ürün (sorgu)', 'q', 'EVALUATE\nTOPN(5, SUMMARIZECOLUMNS(Urunler[Urun], Urunler[Kategori], "Net Satış", [Net Satış], "Marj", [Kâr Marjı %]), [Net Satış])\nORDER BY [Net Satış] DESC'],
  ['Segment × kanal (sorgu)', 'q', 'EVALUATE\nSUMMARIZECOLUMNS(\n    Musteriler[Segment],\n    Satislar[Kanal],\n    FILTER(ALL(Tarih[Yil]), Tarih[Yil] = 2024),\n    "Net Satış", [Net Satış]\n)'],
  ['Kaybedilen müşteriler (sorgu)', 'q', 'EVALUATE\nEXCEPT(\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2023),\n    CALCULATETABLE(VALUES(Satislar[MusteriNo]), Tarih[Yil] = 2024)\n)'],
  ['Organizasyon yolu (sorgu)', 'q', 'EVALUATE\nSELECTCOLUMNS(Calisanlar, "Ad", Calisanlar[AdSoyad], "Unvan", Calisanlar[Unvan], "Yol", Calisanlar[Yol], "Düzey", PATHLENGTH(Calisanlar[Yol]))'],
  ['Ölçü tanımlı sorgu', 'q', 'DEFINE\n    MEASURE Satislar[Ortalama İndirimli Satır] =\n        AVERAGEX(FILTER(Satislar, Satislar[Indirim] > 0), Satislar[Tutar])\nEVALUATE\nADDCOLUMNS(VALUES(Satislar[Kanal]), "Ort. İndirimli", [Ortalama İndirimli Satır])']
];
let SED = null, CW = 420;
/* Urunler[Kategori], Kategoriler[Kategori]'nin kopyasıdır; karışmasın diye alan listesinde gösterilmez (ifadelerde çalışır) */
const isHiddenField = (t, c) => t === 'Urunler' && c === 'Kategori';
function viewStudio() {
  const axisOpts = (sel, none) => (none ? '<option value="">Yok</option>' : '') + X.TNAMES.map(t => '<optgroup label="' + t + '">' + MODEL.tables[t].cols.filter(c => !isHiddenField(t, c) || t + '[' + c + ']' === sel).map(c => { const k = t + '[' + c + ']'; return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</optgroup>').join('');
  let h = '<div class="wrap" style="gap:18px"><div class="sec-head"><div><span class="eyebrow">Araçlar</span><h1>DAX Playground</h1></div><div class="dtoggle" role="tablist"><button data-smode="m" aria-pressed="' + (ST.mode === 'm') + '">Ölçü</button><button data-smode="q" aria-pressed="' + (ST.mode === 'q') + '">Sorgu (EVALUATE)</button></div></div>' + guide('studio');
  h += '<div class="studio"><aside class="panel fields"><div class="dtoggle sm"><button data-side="fields" aria-pressed="' + (ST.side === 'fields') + '">Alanlar</button><button data-side="measures" aria-pressed="' + (ST.side === 'measures') + '">Ölçüler</button></div><div id="sideList">' + sideList() + '</div></aside>';
  h += '<div class="work"><div class="ed-shell"><div class="ed-top"><label>Örnek yükle <select id="stEx"><option value="">Seç…</option>' + STUDIO_EX.map((x, i) => x[1] === ST.mode ? '<option value="' + i + '">' + esc(x[0]) + '</option>' : '').join('') + '</select></label><span class="kbdhint">Ctrl/⌘ + Enter: çalıştır</span></div><div id="sed"></div></div>';
  h += '<div class="ed-actions"><button class="btn pri" data-act="st-run">Çalıştır</button>' + (ST.mode === 'm' ? '<button class="btn" data-act="st-save">Ölçü olarak kaydet</button>' : '') + '<button class="btn ghost sm" data-act="st-clear">Temizle</button></div>';
  if (ST.mode === 'm') {
    h += '<div class="panel vset"><label>Satır ekseni<select id="stAxis">' + axisOpts(ST.axis) + '</select></label><label>Sütun ekseni<select id="stAxis2">' + axisOpts(ST.axis2, true) + '</select></label><label>Görsel<select id="stChart">' + [['table', 'Matris'], ['column', 'Sütun'], ['bar', 'Çubuk'], ['line', 'Çizgi'], ['donut', 'Halka'], ['card', 'Kart']].map(([v, t]) => '<option value="' + v + '"' + (v === ST.chart ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></label>';
    h += '<div class="slrow"><span class="eyebrow">Dilimleyici: Yıl</span>' + [2022, 2023, 2024].map(y => '<button class="chip" data-styil="' + y + '" aria-pressed="' + ST.yil.includes(y) + '">' + y + '</button>').join('') + '</div><div class="slrow"><span class="eyebrow">Kanal</span>' + ['Web', 'Mobil', 'Mağaza'].map(k => '<button class="chip" data-stkanal="' + k + '" aria-pressed="' + ST.kanal.includes(k) + '">' + k + '</button>').join('') + '</div></div>';
  }
  h += '<div id="stOut"></div></div></div></div>';
  return h;
}
function sideList() {
  if (ST.side === 'fields') return X.TNAMES.map(t => '<details' + (t === 'Satislar' ? ' open' : '') + '><summary>' + t + '<span>' + MODEL.tables[t].rows.length + '</span></summary><ul>' + MODEL.tables[t].cols.filter(c => !isHiddenField(t, c)).map(c => '<li><button data-ins="' + esc(t + '[' + c + ']') + '">' + c + '</button></li>').join('') + '</ul></details>').join('') + '<p class="muted" style="font-size:.78rem;margin:8px 4px 0">Bir alana dokununca editöre eklenir.</p>';
  const groups = {}; LIB.forEach(m => (groups[m.group] = groups[m.group] || []).push(m));
  let h = '';
  if ((P.mine || []).length) h += '<details open><summary>Ölçülerim<span>' + P.mine.length + '</span></summary><ul>' + P.mine.map((m, i) => '<li class="mm"><button data-ins="[' + esc(m.name) + ']" title="' + esc(m.expr) + '">' + esc(m.name) + '</button><button class="x" data-act="mine-edit" data-i="' + i + '" aria-label="Düzenle">✎</button><button class="x" data-act="mine-del" data-i="' + i + '" aria-label="Sil">✕</button></li>').join('') + '</ul></details>';
  Object.keys(groups).forEach(g => { h += '<details' + (g === 'Temel' ? ' open' : '') + '><summary>' + g + '<span>' + groups[g].length + '</span></summary><ul>' + groups[g].map(m => '<li><button data-ins="[' + esc(m.name) + ']" title="' + esc(m.name + ' = ' + m.expr) + '">' + esc(m.name) + '</button></li>').join('') + '</ul></details>'; });
  return h + '<p class="muted" style="font-size:.78rem;margin:8px 4px 0">Hazır ölçüler örnek raporlarda kullanılır. Üzerine gelince formülü görünür; dokununca editöre eklenir.</p>';
}
function mountStudio() { SED = makeEditor($('#sed'), ST.code[ST.mode] || '', studioRun, ST.mode === 'q'); SED.onChange = v => { ST.code[ST.mode] = v; saveStudio(); }; studioRun(); }
function upsertMine(name, expr, quiet) {
  P.mine = P.mine || []; const i = P.mine.findIndex(m => m.name.toLowerCase() === name.toLowerCase());
  if (LIBMAP[name]) { if (!quiet) toast('“' + name + '” hazır bir ölçünün adı; başka bir ad seç.'); return false; }
  if (i >= 0) P.mine[i].expr = expr; else P.mine.push({ name, expr }); save(); if (!quiet) toast('Kaydedildi: [' + name + ']'); return true;
}
const VC = {}; ['column', 'bar', 'line', 'donut'].forEach(n => { VC[n] = (d, o) => V[n](d, Object.assign({ W: CW }, o || {})); });
function studioRun() {
  const out = $('#stOut'); if (!out) return; const src = SED ? SED.get() : ST.code[ST.mode];
  if (!src.trim()) { out.innerHTML = '<div class="panel empty">Bir ifade yaz ya da yukarıdan bir örnek yükle.</div>'; return; }
  const t0 = performance.now(); CW = studioW();
  try {
    if (ST.mode === 'q') { const r = X.runQuery(measureSet(), src); out.innerHTML = '<div class="timing">' + Math.round(performance.now() - t0) + ' ms</div>' + resultTable(r.cols, r.rows); return; }
    const d = X.stripDef(src); const err0 = X.check(src); if (err0) throw new X.DaxError(err0);
    const name = d.name || 'Ölçü'; const ms = measureSet(d.name); const f = fmtOf(name);
    const sl = []; if (ST.yil.length) sl.push({ t: 'Tarih', c: 'Yil', values: ST.yil }); if (ST.kanal.length) sl.push({ t: 'Satislar', c: 'Kanal', values: ST.kanal });
    if (ST.chart === 'card') { const v = X.evalMeasure(ms, d.expr, sl); out.innerHTML = '<div class="timing">' + Math.round(performance.now() - t0) + ' ms</div><div class="panel vbox" style="max-width:320px">' + V.card(v, name, f) + '</div>'; return; }
    const a1 = parseCol(ST.axis), a2 = ST.axis2 ? parseCol(ST.axis2) : null;
    if (a2) {
      const r = X.query({ rows: [a1, a2], measures: ms, values: [d.expr], slicers: sl, totals: true });
      const k1 = [], k2 = []; r.rows.forEach(x => { if (!k1.some(v => X.keyOf(v) === X.keyOf(x.keys[0]))) k1.push(x.keys[0]); if (!k2.some(v => X.keyOf(v) === X.keyOf(x.keys[1]))) k2.push(x.keys[1]); });
      k2.sort((a, b) => X.sortCompare(a2, a, b));
      const cell = (a, b) => { const x = r.rows.find(z => X.keyOf(z.keys[0]) === X.keyOf(a) && X.keyOf(z.keys[1]) === X.keyOf(b)); return x ? x.vals[0] : null; };
      const rowTot = k1.map(a => X.evalMeasure(ms, d.expr, sl.filter(s => !(s.t === a1.t && s.c === a1.c)).concat([{ t: a1.t, c: a1.c, values: [a] }]), { shadow: sl }));
      const colTot = k2.map(b => X.evalMeasure(ms, d.expr, sl.filter(s => !(s.t === a2.t && s.c === a2.c)).concat([{ t: a2.t, c: a2.c, values: [b] }]), { shadow: sl }));
      const rows = k1.map((a, i) => [V.fmt(a)].concat(k2.map(b => cell(a, b))).concat([rowTot[i]]));
      out.innerHTML = '<div class="timing">' + r.rows.length + ' hücre · ' + Math.round(performance.now() - t0) + ' ms</div><div class="panel vbox"><div class="vtitle">' + esc(name) + ' · ' + esc(a1.c) + ' × ' + esc(a2.c) + '</div>' + V.table([a1.c].concat(k2.map(b => V.fmt(b))).concat(['Toplam']), rows, { fmts: [null].concat(k2.map(() => f)).concat([f]), cf: Object.fromEntries(k2.map((b, i) => [i + 1, 'heat'])), total: ['Toplam'].concat(colTot).concat(r.total) }) + '</div>';
      bindMarks(); return;
    }
    const r = X.query({ rows: [a1], measures: ms, values: [d.expr], slicers: sl, totals: true });
    const cats = r.rows.map(x => V.fmt(x.keys[0])), vals = r.rows.map(x => x.vals[0]);
    const numeric = vals.every(v => v === null || typeof v === 'number');
    let vis = '';
    if (!numeric || ST.chart === 'table' || !r.rows.length) vis = V.table([a1.c, name], r.rows.map(x => [V.fmt(x.keys[0]), x.vals[0]]), { fmts: [null, f], cf: numeric ? { 1: 'bar' } : null, total: ['Toplam', r.total[0]] });
    else {
      const data = { cats, series: [{ name, vals }], fmt: f };
      vis = ST.chart === 'bar' ? VC.bar(data) : ST.chart === 'line' ? VC.line(data, { area: true }) : ST.chart === 'donut' ? VC.donut(data) : VC.column(data, { labels: cats.length <= 14 });
      vis += '<div class="vtot"><span>Toplam satırı</span><b>' + esc(fmtVal(r.total[0], f)) + '</b></div>';
      vis += '<details class="vdet"><summary>Matris olarak gör</summary>' + V.table([a1.c, name], r.rows.map(x => [V.fmt(x.keys[0]), x.vals[0]]), { fmts: [null, f], total: ['Toplam', r.total[0]] }) + '</details>';
    }
    out.innerHTML = '<div class="timing">' + r.rows.length + ' satır · ' + Math.round(performance.now() - t0) + ' ms' + (!numeric && ST.chart !== 'table' ? ' · metin sonuçlar matris olarak gösterildi' : '') + '</div><div class="panel vbox"><div class="vtitle">' + esc(name) + ' · ' + esc(a1.c) + (sl.length ? ' <span class="muted">(' + sl.map(s => s.values.join(', ')).join(' · ') + ')</span>' : '') + '</div>' + vis + '</div>';
    bindMarks();
  } catch (er) {
    if (!er.dax) console.error(er);
    out.innerHTML = daxErrHTML(er);
  }
}

/* ---------- Formüller ---------- */
const fq = { cat: 'Tümü', q: '' };
function viewFormulas() {
  const cats = ['Tümü'].concat([...new Set(window.PBI_CATALOG.map(x => x[1]))]);
  return '<div class="wrap">' + head('Referans', 'DAX fonksiyonları', window.PBI_CATALOG.length + ' fonksiyon. Her örnek bu modelde çalışır: “Playground’da dene” ile sonucu gör.', 'formulas') + '<div class="row"><input class="input" id="fQ" placeholder="Fonksiyon ara: CALCULATE, pencere, tarih…" value="' + esc(fq.q) + '" style="max-width:340px" aria-label="Fonksiyon ara"><div class="filters">' + cats.map(c => '<button data-fcat="' + esc(c) + '" aria-pressed="' + (fq.cat === c) + '">' + esc(c) + '</button>').join('') + '</div></div><div class="fgrid" id="fList">' + fList() + '</div>' + libSection() + '</div>';
}
function fList() {
  const q = trFold(fq.q.trim());
  const all = window.PBI_CATALOG.filter(x => (fq.cat === 'Tümü' || x[1] === fq.cat) && (!q || trFold(x.join(' ')).includes(q)));
  if (!all.length) return '<div class="panel empty">Aramana uyan fonksiyon yok.</div>';
  const lim = fq.all || q ? all.length : 30, items = all.slice(0, lim);
  return items.map(([n, c, syn, d, ex]) => '<article class="panel fcard"><div class="row" style="justify-content:space-between"><h3>' + esc(n) + '</h3><span class="chip">' + esc(c) + '</span></div><code class="syn">' + esc(syn) + '</code><p>' + esc(d) + '</p><pre class="dax ex"' + (/^(--|\/\/)/.test(ex) ? ' data-notry' : '') + '>' + esc(ex) + '</pre></article>').join('') + (all.length > lim ? '<button class="btn" data-fall="1">Kalan ' + (all.length - lim) + ' fonksiyonu göster</button>' : '');
}
function libSection() {
  const lv = m => m.lv || (window.PBI_PATTERNS || []).find(p => p.name === m.name)?.lv || '';
  return '<section class="lvl-block"><div class="sec-head"><div><span class="eyebrow">Hazır ölçüler</span><h2>Bu modelin ölçü kütüphanesi (' + LIB.length + ')</h2></div><button class="btn sm" data-go="lab">Uzun kalıplar: Measure Lab</button></div><p class="muted" style="margin:0;max-width:70ch">Örnek raporlar ve alıştırmalar bu ölçüleri kullanır. İyi bir model ölçüleri birbirinin üzerine kurar: temel ölçüler bir kez tanımlanır, diğerleri onları çağırır.</p><div class="panel"><div class="coltable"><table><thead><tr><th>Ölçü</th><th>Seviye</th><th>Formül</th><th>Açıklama</th></tr></thead><tbody>' + LIB.map(m => '<tr><td>[' + esc(m.name) + ']</td><td>' + (lv(m) ? lvBadge(lv(m)) : '') + '</td><td><code class="mcode">' + hl(m.expr.length > 420 ? m.expr.slice(0, 420) + '\n…' : m.expr) + '</code></td><td>' + esc(m.desc || '') + '</td></tr>').join('') + '</tbody></table></div></div></section>';
}

/* ---------- Seviye testi ---------- */
let T = null;
/* Sonuç: kişinin hedefi varsa o yol, yoksa geçtiği seviyeye uyan yol */
function testResult(res) {
  const Q2 = window.PBI_PLACEMENT, lv = res.lv, nextL = LEVELS[lv ? LVI(lv) + 1 : 0];
  const rec = placementPath();
  const start = nextLesson(rec), skipped = PMAP[rec] ? PMAP[rec].lessons.filter(id => LMAP[id] && isSkipped(LMAP[id])).length : 0;
  return '<div class="wrap"><div class="panel hero-main"><span class="eyebrow">Seviye testi · sonuç</span><h1>' + res.total + '/' + Q2.length + ' doğru · <em>' + (lv ? lvName(lv) : 'Başlangıç') + '</em></h1><p>' + (lv ? lvName(lv) + ' seviyesini geçtin. Bu seviyenin dersleri sıradaki ders listesinden atlanır' + (skipped ? ' (önerilen yol ' + esc(PMAP[rec].name) + ': ' + skipped + ' ders)' : '') + '; istersen yine açabilirsin. İlerleme yüzdesine ve belgeye tamamlanmış sayılmazlar. ' : 'Temel seviyeden başlamak en hızlı yol olacak. ') + (nextL ? 'Sıradaki seviye: <b>' + nextL.name + '</b>. ' + esc(nextL.desc) : 'Tüm seviyeleri geçtin; bitirme projesiyle kendini sına.') + '</p><div class="row">' + (start ? '<button class="btn pri" data-lesson="' + start.id + '" data-ctx="' + rec + '">Şuradan başla: ' + esc(start.title) + '</button>' : '<button class="btn pri" data-go="projeler">Bitirme projelerine geç</button>') + '<button class="btn" data-go="path" data-id="' + rec + '">' + esc(PMAP[rec] ? PMAP[rec].name : 'Öğrenme yolu') + ' yolunu gör</button><button class="btn ghost" data-act="test-again">Testi yeniden çöz</button>' + (lv ? '<button class="btn ghost" data-act="test-clear">Atlamayı kaldır</button>' : '') + '</div></div>' +
    '<div class="panel lessons">' + LEVELS.map(L => { const n = Q2.filter(q => q.lv === L.id).length; const sc = (res.score || {})[L.id] || 0; return '<div class="litem" style="cursor:default"><span>' + lvBadge(L.id) + '</span><span><b>' + L.name + ' seviye</b><small>' + sc + '/' + n + ' doğru · ' + (sc >= Math.ceil(n * 0.75) ? 'geçildi' : 'çalışılmalı') + '</small></span><span class="bar" style="width:120px"><i style="width:' + (sc / n * 100) + '%"></i></span></div>'; }).join('') + '</div></div>';
}
function viewTest() {
  const Q2 = window.PBI_PLACEMENT;
  if (!T && P.testDone) return testResult(P.testDone);
  if (!T) T = { i: 0, score: {}, ans: [] };
  if (T.i >= Q2.length) {
    let lv = null; for (const L of LEVELS) { const n = Q2.filter(q => q.lv === L.id).length; if (n && (T.score[L.id] || 0) >= Math.ceil(n * 0.75)) lv = L.id; else break; }
    P.placement = lv; P.last = null; P.testDone = { lv, total: T.ans.filter(Boolean).length, score: Object.assign({}, T.score), at: today() }; save(); try { document.dispatchEvent(new CustomEvent('pbi-placement', { detail: { lv: lv || 'baslangic' } })); } catch (e) {}
    const res = P.testDone; T = null; return testResult(res);
  }
  const q = Q2[T.i];
  return '<div class="wrap">' + head('Seviye testi · ' + (T.i + 1) + '/' + Q2.length, 'Seviye testi', null, 'test') + '<div class="bar"><i style="width:' + (T.i / Q2.length * 100) + '%"></i></div><div class="panel brief" style="max-width:760px">' + lvBadge(q.lv) + '<div class="q">' + esc(q.q) + '</div><div class="mc">' + optOrder(q).map((i, pos) => '<button data-tq="' + i + '"><span class="key">' + String.fromCharCode(65 + pos) + '</span><span>' + esc(q.o[i]) + '</span></button>').join('') + '<button data-tq="-1"><span class="key">?</span><span>Bilmiyorum</span></button></div></div></div>';
}

/* ---------- Sözlük ---------- */
let dq = '';
function viewDict() { return '<div class="wrap">' + head('Referans', 'Sözlük', window.PBI_GLOSSARY.length + ' terim.', 'dict') + '<input class="input" id="dQ" placeholder="Terim ara" value="' + esc(dq) + '" style="max-width:340px" aria-label="Terim ara"><div class="panel dict" id="dList">' + dList() + '</div></div>'; }
function dList() { const q = trFold(dq.trim()); const it = window.PBI_GLOSSARY.filter(g => !q || trFold(g[0] + ' ' + g[1]).includes(q)).sort((a, b) => a[0].localeCompare(b[0], 'tr')); return it.length ? '<dl>' + it.map(g => '<div><dt>' + esc(g[0]) + '</dt><dd>' + esc(g[1]) + '</dd></div>').join('') + '</dl>' : '<div class="empty">Sonuç yok.</div>'; }

/* ---------- Görünüm kayıtları ---------- */
view('home', { render: viewHome, hash: '' });
view('paths', { render: viewPaths, hash: 'patikalar' });
view('path', { render: id => viewPath(id), hash: 'patika' });
view('curr', { render: viewCurr, hash: 'dersler' });
view('lesson', { render: viewLesson, mount: mountLesson, hash: 'ders' });
view('model', { render: viewModel, mount: mountModel, hash: 'model' });
view('studio', { render: viewStudio, mount: mountStudio, hash: 'studyo' });
view('formulas', { render: viewFormulas, hash: 'formuller' });
view('test', { render: viewTest, hash: 'test' });
view('dict', { render: viewDict, hash: 'sozluk' });
view('more', { render: viewMore, hash: 'menu' });

/* ---------- Olaylar ---------- */
document.addEventListener('click', ev => {
  const t = ev.target.closest('button, [data-tbl], a'); if (!t) return;
  const d = t.dataset;
  if (d.navg) { P.navc = P.navc || {}; P.navc[d.navg] = !P.navc[d.navg]; save(); renderNav(); return; }
  if (d.go) { ev.preventDefault(); if (d.lv) currFilter.lv = d.lv; return go(d.go, d.id); }
  if (d.lesson) return go('lesson', d.lesson, { ctx: d.ctx || (S.view === 'path' ? S.id : S.view === 'lesson' ? S.ctx : null) });
  if (d.step !== undefined) { setStep(+d.step); return; }
  if (d.lvf) { currFilter.lv = d.lvf; document.querySelectorAll('[data-lvf]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lvf === d.lvf)); $('#currList').innerHTML = currList(); return; }
  if (d.mc !== undefined) {
    const CX = curX(), e = CX.e, k = CX.k; const ch = +d.mc;
    document.querySelectorAll('#mc button').forEach(b => b.classList.remove('right', 'wrong'));
    if (ch === e.a) { t.classList.add('right'); $('#mcFb').innerHTML = '<div class="msg ok"><b>Doğru.</b>' + (e.why || '') + (e.explain ? '<div class="explain">' + e.explain + '</div>' : '') + '</div>'; CX.onSolved(); }
    else { t.classList.add('wrong'); $('#mcFb').innerHTML = '<div class="msg err"><b>Tekrar dene.</b>Bu seçenek doğru değil.</div>'; noteWrong(CX); }
    return;
  }
  if (d.tq !== undefined) { const q = window.PBI_PLACEMENT[T.i]; const ok = +d.tq === q.a; if (ok) T.score[q.lv] = (T.score[q.lv] || 0) + 1; T.ans.push(ok); T.i++; render(); return; }
  if (d.tbl && S.view === 'model') return showTable(d.tbl);
  if (d.try) return openInStudio(d.try);
  if (d.smode) { ST.mode = d.smode; saveStudio(); render(); return; }
  if (d.side) { ST.side = d.side; saveStudio(); document.querySelectorAll('[data-side]').forEach(b => b.setAttribute('aria-pressed', b.dataset.side === d.side)); $('#sideList').innerHTML = sideList(); return; }
  if (d.ins) { if (SED) { SED.insert(d.ins); SED.focus(); } return; }
  if (d.styil) { const y = +d.styil; ST.yil = ST.yil.includes(y) ? ST.yil.filter(x => x !== y) : ST.yil.concat([y]); t.setAttribute('aria-pressed', ST.yil.includes(y)); saveStudio(); studioRun(); return; }
  if (d.stkanal) { const k = d.stkanal; ST.kanal = ST.kanal.includes(k) ? ST.kanal.filter(x => x !== k) : ST.kanal.concat([k]); t.setAttribute('aria-pressed', ST.kanal.includes(k)); saveStudio(); studioRun(); return; }
  if (d.fall) { fq.all = true; $('#fList').innerHTML = fList(); enhance($('#fList')); return; }
  if (d.fcat) { fq.cat = d.fcat; fq.all = false; document.querySelectorAll('[data-fcat]').forEach(b => b.setAttribute('aria-pressed', b.dataset.fcat === d.fcat)); $('#fList').innerHTML = fList(); enhance($('#fList')); return; }
  const act = d.act; if (!act) return;
  if (act === 'hint') { if (CUR && CUR.onHint) CUR.onHint(); const e = curX().e; const hs = hintsOf(e); const box = $('#hintBox'); const n = Math.min(hs.length, (+box.dataset.n || 0) + 1); box.dataset.n = n;
    box.innerHTML = hs.slice(0, n).map((x, i) => '<div class="tip" style="margin:0 0 6px"><b>İpucu ' + (i + 1) + '/' + hs.length + '</b>' + x + '</div>').join('');
    t.textContent = n < hs.length ? 'Bir ipucu daha' : 'İpuçlarının hepsi açık'; if (n >= hs.length) t.disabled = true; return; }
  if (act === 'sol') { const e = curX().e; $('#solBox').innerHTML = '<div class="codebox"><pre class="dax" data-done="1">' + hl((e.name ? e.name + ' =\n' : '') + e.sol) + '</pre></div>' + (e.explain ? '<div class="explain"><b>Mantığı</b>' + e.explain + '</div>' : '') + '<div class="row" style="margin-top:6px"><button class="btn sm" data-act="take-sol">Editöre al</button></div>'; return; }
  if (act === 'take-sol') { const e = curX().e; ED.set(e.sol); return; }
  if (act === 'ex-studio') { const e = curX().e; const src = ED.get(); openInStudio(e.t === 'query' ? src : (X.stripDef(src).name ? src : e.name + ' = ' + src)); return; }
  if (act === 'check') return checkEx(true);
  if (act === 'run') return checkEx(false);
  if (act === 'reset-ed') { const e = curX().e; ED.set(e.start || (e.t === 'query' ? 'EVALUATE\n' : '')); $('#out').innerHTML = ''; return; }
  if (act === 'read-done') { const l = LMAP[S.id]; if (!P.done[l.id]) { P.done[l.id] = true; addXP(5); save(); try { document.dispatchEvent(new CustomEvent('pbi-lesson-done', { detail: { id: l.id, title: l.title } })); } catch (e) {} } render(); return; }
  if (act === 'st-run') return studioRun();
  if (act === 'st-clear') { SED.set(''); $('#stOut').innerHTML = ''; return; }
  if (act === 'st-save') { const src = SED.get(); const dd = X.stripDef(src); if (!dd.name) { toast('Kaydetmek için ölçüye ad ver: Ad = ifade'); return; } const er = X.check(src); if (er) { toast('Önce hatayı düzelt: ' + er); return; } if (upsertMine(dd.name, dd.expr.trim())) { ST.side = 'measures'; saveStudio(); document.querySelectorAll('[data-side]').forEach(b => b.setAttribute('aria-pressed', b.dataset.side === 'measures')); $('#sideList').innerHTML = sideList(); } return; }
  if (act === 'mine-del') { P.mine.splice(+d.i, 1); save(); $('#sideList').innerHTML = sideList(); toast('Ölçü silindi'); return; }
  if (act === 'mine-edit') { const m = P.mine[+d.i]; SED.set(m.name + ' =\n' + m.expr); studioRun(); return; }
  if (act === 'test-again') { T = { i: 0, score: {}, ans: [] }; render(); return; }
  if (act === 'test-clear') { P.placement = null; save(); toast('Atlama kaldırıldı: dersler yine sırayla önerilir.'); render(); return; }
  if (act === 'reset-ask') { $('#resetBox').innerHTML = '<span class="muted" style="font-size:.85rem">Tüm ilerleme, XP ve kayıtlı ölçüler silinecek.</span><button class="btn sm" data-act="reset-yes">Evet, sıfırla</button><button class="btn sm ghost" data-act="reset-no">Vazgeç</button>'; return; }
  if (act === 'reset-yes') { Object.keys(P).forEach(k => delete P[k]); Object.assign(P, FRESH()); save(); toast('İlerleme sıfırlandı'); render(); return; }
  if (act === 'reset-no') { render(); return; }
});
document.addEventListener('keydown', ev => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return; const tg = ev.target; if (tg && (tg.matches('input, textarea, select') || tg.isContentEditable)) return;
  const k = (ev.key || '').toUpperCase(); if (k.length === 1 && k >= 'A' && k <= 'F') { const box = document.querySelector('#mc, .mc'); if (!box) return; const btns = [...box.querySelectorAll('button')].filter(b => !b.disabled); const b = btns[k.charCodeAt(0) - 65]; if (b) { ev.preventDefault(); b.focus(); b.click(); } }
});
document.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[data-tbl]:not(button)')) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
document.addEventListener('input', ev => {
  if (ev.target.id === 'currQ') { currFilter.q = ev.target.value; $('#currList').innerHTML = currList(); }
  if (ev.target.id === 'fQ') { fq.q = ev.target.value; fq.all = false; $('#fList').innerHTML = fList(); enhance($('#fList')); }
  if (ev.target.id === 'dQ') { dq = ev.target.value; $('#dList').innerHTML = dList(); }
});
document.addEventListener('change', ev => {
  const id = ev.target.id;
  if (id === 'stAxis') { ST.axis = ev.target.value; saveStudio(); studioRun(); }
  if (id === 'stAxis2') { ST.axis2 = ev.target.value; saveStudio(); studioRun(); }
  if (id === 'stChart') { ST.chart = ev.target.value; saveStudio(); studioRun(); }
  if (id === 'stEx' && ev.target.value !== '') { const x = STUDIO_EX[+ev.target.value]; SED.set(x[2]); if (x[3]) { ST.axis = x[3]; const a = $('#stAxis'); if (a) a.value = x[3]; } if (x[4]) { ST.chart = x[4]; const c = $('#stChart'); if (c) c.value = x[4]; } ST.axis2 = ''; const a2 = $('#stAxis2'); if (a2) a2.value = ''; saveStudio(); studioRun(); ev.target.value = ''; }
});
document.addEventListener('toggle', e => { const el = e.target; if (el && el.matches && el.matches('details.guide')) { P.gclosed = P.gclosed || {}; P.gclosed[el.dataset.guide] = !el.open; save(); } }, true);

/* ---------- Başlat ---------- */
function fromHash() {
  const h = decodeURIComponent((location.hash || '').slice(1));
  const i = h.indexOf('-'); const pre = i < 0 ? h : h.slice(0, i); const id = i < 0 ? null : h.slice(i + 1);
  const v = Object.keys(VIEWS).find(k => k !== 'home' && (VIEWS[k].hash || k) === pre);
  if (!v) { S = { view: 'home', id: null, step: 0, ctx: null }; if (h && h !== 'home') setTimeout(() => toast('Bu sayfa bulunamadı; ana sayfa açıldı.'), 300); return; }
    if (v === 'lesson') { const m = String(id).match(/^(.+?)(?:@([\w-]+))?(?:\/(\d+))?$/) || [], lid = m[1] || id; if (!LMAP[lid]) { S = { view: 'curr', id: null, step: 0, ctx: null }; setTimeout(() => toast('Bu ders bulunamadı; dersler açıldı.'), 300); return; } const n = (LMAP[lid].ex || []).length, st = Math.min(n, +m[3] || 0); S = { view: v, id: lid, step: st, ctx: lessonCtx(lid, m[2] || null) }; return; }
  S = { view: v, id, step: 0, ctx: v === 'path' ? id : null };
}
function start() {
  try { document.documentElement.lang = 'tr'; } catch (e) {}
  window.addEventListener('popstate', () => { if (location.hash === lastHash) return; lastHash = location.hash; fromHash(); render(); window.scrollTo(0, 0); const m = $('#main'); if (m) m.focus({ preventScroll: true }); });
  window.addEventListener('hashchange', () => { if (location.hash === lastHash) return; lastHash = location.hash; fromHash(); render(); window.scrollTo(0, 0); });
  let rz = null; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { const d = VIEWS[S.view]; if (d && d.resize) d.resize(); }, 250); });
  fromHash(); writeOzet(); render();
}
window.PBI_CORE = { tipsTabs, nextOpen: firstOpen, isSkipped, skippedLv, goalPath, SITE, REPO_URL, lessonMin, setStep, views: VIEWS, daxErrHTML, sanitize, replaceProgress, KEY, storeOk: () => STORE_OK, lessonRow, PMAP, PATHS, noteWrong, trackRv, RV_GAPS, addDaysYmd, solvedLesson: solved, nextBtn, FRESH, exView, exMount, curX, optOrder, hintsOf, exKey, streak, today, ymd, renderStats, lessonState, pct, myLevel, X, V, MODEL, $, esc, hl, enhance, go, render, view, P, save, toast, addXP, measureSet, fmtOf, guessFmt, LIB, LIBMAP, LEVELS, LVI, lvBadge, lvName, LESSONS, LMAP, ic, head, guide, spanW, mainW, bindMarks, openInStudio, daxBlock, daxDeps, resultTable, parseCol, fmtVal, start, state: () => S };
})();
