/* Kesit Power BI — alıştırma denetimi: gizli dilimleyici testleri, teknik şartı, sorgu karşılaştırması, ipucu temizliği.
   Saf mantık: uygulama (app.js) ve doğrulayıcılar (tests/hiddenval.js) aynı kodu kullanır. */
(function (W) {
'use strict';
const plain = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const X = () => W.PBI_DAX;
const DEFAULT_GRID = [{ t: 'Kategoriler', c: 'Kategori' }, { t: 'Tarih', c: 'Yil' }];
function distinctOf(t, c) { const T = X().T[t]; if (!T) return []; const s = new Set(); T.rows.forEach(r => { if (r[c] !== null && r[c] !== undefined) s.add(r[c]); }); return [...s].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0)); }
/* Bir tablo için dilimlemeye uygun sütun: ızgaradaki sütun, yoksa ilk metin ya da yıl sütunu */
function sliceCol(t, grid) {
  const T = X().T[t]; if (!T) return null;
  const g = (grid || []).find(x => x.t === t); if (g) return g.c;
  if (t === 'Tarih') return 'Yil';
  const c = T.cols.find(k => { const v = T.rows.find(r => r[k] !== null && r[k] !== undefined); return v && typeof v[k] === 'string' && distinctOf(t, k).length >= 3; });
  return c || null;
}
/* Ortadan, bitişik olmayan iki değer: uçlardaki boş ya da ilk sıradaki değerler farkı gizlemesin */
const pickTwo = d => { const n = d.length; let a = Math.floor(n / 2), b = Math.min(n - 1, a + 2); if (a === b) a = Math.max(0, a - 1); return [d[a], d[b]]; };
const fmtVals = v => v.map(x => String(x)).join(', ');
/* ALL ↔ ALLSELECTED, HASONEVALUE ↔ ISINSCOPE gibi farklar yalnız dilimleyici varken görünür: çözümde geçen sütuna göre gizli test üret */
function autoHidden(e) {
  if (!e || e.t !== 'dax' || e.noAutoHidden) return [];
  const sol = String(e.sol || ''), grid = e.grid || DEFAULT_GRID, out = [], seen = new Set();
  const add = (t, c, vals, why) => { const k = t + '|' + c + '|' + vals.join('|'); if (seen.has(k) || vals.length < 1) return; seen.add(k); out.push({ slicers: [{ t, c, values: vals }], label: 'dilimleyicide ' + t + '[' + c + '] = ' + fmtVals(vals) + ' seçiliyken', noTotal: false, why, auto: true }); };
  const rmv = /\b(ALLSELECTED|ALL|REMOVEFILTERS|ALLEXCEPT)\s*\(/g; let m;
  const WHY = 'Filtre kaldırma kapsamı: ALL dilimleyiciyi de siler, ALLSELECTED korur.';
  while ((m = rmv.exec(sol))) {
    let i = m.index + m[0].length, dep = 1; const st = i; while (i < sol.length && dep) { if (sol[i] === '(') dep++; else if (sol[i] === ')') dep--; i++; }
    const inner = sol.slice(st, i - 1), refs = (inner.match(/'?\w+'?\[[^\]]+\]/g) || []).map(r => { const q = r.match(/'?(\w+)'?\[([^\]]+)\]/); return [q[1], q[2]]; });
    if (!refs.length) { const t = (inner.match(/^\s*'?(\w+)'?/) || [])[1]; if (t && sliceCol(t, grid)) refs.push([t, sliceCol(t, grid)]); }
    refs.forEach(([t, c]) => { if (!X().T[t] || !X().T[t].cols.includes(c)) return; const d = distinctOf(t, c); if (d.length < 3) return; add(t, c, pickTwo(d), WHY); add(t, c, [d[1], d[d.length - 1]], WHY); add(t, c, [d[0], d[d.length - 1]], WHY); });
  }
  if (/\bALLSELECTED\s*\(\s*\)/.test(sol)) { const g = grid[0]; const d = distinctOf(g.t, g.c); if (d.length >= 3) add(g.t, g.c, pickTwo(d), 'ALLSELECTED dilimleyici seçimini korur.'); }
  const scope = /\b(HASONEVALUE|ISINSCOPE|ISFILTERED|HASONEFILTER)\s*\(\s*'?(\w+)'?\[([^\]]+)\]/g;
  while ((m = scope.exec(sol))) { const d = distinctOf(m[2], m[3]); if (d.length >= 2) add(m[2], m[3], pickTwo(d).slice(0, 1), 'HASONEVALUE tek değer seçiliyken toplamda da doğru döner; ISINSCOPE yalnız görselin ekseninde.'); }
  return out;
}
/* Teknik şartı: soru metninden çıkar. e.must / e.not açıkça verilmişse o kullanılır. */
const OVERRIDE = {
  'calculate#7': { not: ['FILTER(Urunler'] },
  'dax-giris#5': { must: ['[Net Satış]', '[Net Maliyet]'] },
  'paydas-iletisim#0': { not: ['[MoM %]'], must: ['VAR', 'PREVIOUSMONTH'] },
  'dax-opt#2': { not: ['IF', 'SUMX', 'FILTER'] },
  'excel-entegrasyon#8': { not: ['FORMAT'] }
};
function techOf(e, key) {
  if (!e || (e.t !== 'dax' && e.t !== 'query')) return { must: [], not: [] };
  if (e.must || e.not) return { must: e.must || [], not: e.not || [] };
  if (key && OVERRIDE[key]) return { must: OVERRIDE[key].must || [], not: OVERRIDE[key].not || [] };
  const q = plain(e.q), sol = String(e.sol || ''), must = [], not = [], FN = (X() && X().FN) || {};
  const uses = w => w === 'VAR' ? /\bVAR\b/.test(sol) : new RegExp('\\b' + w.replace(/\./g, '\\.') + '\\s*\\(').test(sol);
  (q.match(/\b[A-Z][A-Z.]{1,}[A-Z]\b/g) || []).filter((w, i, a) => a.indexOf(w) === i && (w === 'VAR' || FN[w])).forEach(w => {
    const i = q.indexOf(w), after = q.slice(i + w.length, i + w.length + 45);
    if (/^[’'a-zıişçöğü(),\s]*kullanma(dan)?\b/i.test(after)) { not.push(w); return; }
    if (!uses(w)) return;
    const paren = new RegExp('\\((?:[A-Z.\\s+,]*\\b)?' + w.replace(/\./g, '\\.') + '(?:\\b[A-Z.\\s+,()…\\d]*)?\\)').test(q);
    if (/^[^.;]{0,32}\bkullan(?!ma)/i.test(after) || paren || /^\s*(?:ile\b|’?(?:yle|le|la|ıyla|iyle)\b)/.test(after)) must.push(w);
  });
  (q.match(/(?:[Hh]azır\s+)?((?:\[[^\]]+\](?:\s*(?:ve|,)\s*)?)+)\s*ölçü(?:sünü|lerini)\s+kullan(?!ma)/g) || []).forEach(p => { (p.match(/\[[^\]]+\]/g) || []).forEach(mm => { if (sol.includes(mm)) must.push(mm); }); });
  return { must, not };
}
const hasTok = (src, w) => { const s = String(src).replace(/"(?:[^"]|"")*"/g, '""').replace(/\/\/[^\n]*|--[^\n]*/g, ''); if (w === 'VAR') return /\bVAR\b/i.test(s); if (/^\[/.test(w)) return s.toLowerCase().includes(w.toLowerCase()); if (/\(/.test(w)) return s.replace(/\s+/g, '').toLowerCase().includes(w.replace(/\s+/g, '').toLowerCase()); return new RegExp('(^|[^\\w.])' + w.replace(/\./g, '\\.') + '\\s*\\(', 'i').test(s); };
/* Boş dönerse sorun yok; doluysa kullanıcıya gösterilecek cümle */
function techIssue(e, key, src) {
  const { must, not } = techOf(e, key); const miss = must.filter(w => !hasTok(src, w)), bad = not.filter(w => hasTok(src, w));
  if (!miss.length && !bad.length) return '';
  return (miss.length ? 'Bu alıştırma ' + miss.join(', ') + ' kullanmanı istiyor.' : '') + (bad.length ? (miss.length ? ' ' : '') + bad.join(', ') + ' kullanmadan yaz.' : '');
}
/* Sorgu: sütunlar ada göre eşleşir, ad soruda yazılıysa şarttır, satır sırası istenmedikçe önemsizdir */
const norm = c => String(c).replace(/^.*\[/, '').replace(/\]$/, '').trim().toLocaleLowerCase('tr');
const cellKey = v => typeof v === 'number' ? String(Math.round(v * 1e6) / 1e6) : v instanceof Date ? 'd' + v.getTime() : v === null || v === undefined ? '∅' : String(v);
function compareQuery(mine, ref, e, src) {
  if (mine.cols.length !== ref.cols.length) return { ok: false, msg: 'Beklenen sütun sayısı ' + ref.cols.length + ', seninki ' + mine.cols.length + '.' };
  if (mine.rows.length !== ref.rows.length) return { ok: false, msg: 'Beklenen ' + ref.rows.length + ' satır, seninki ' + mine.rows.length + ' satır.' };
  const q = plain(e.q), mn = mine.cols.map(norm), rn = ref.cols.map(norm), used = new Set(), map = [];
  ref.cols.forEach((c, i) => { const j = mn.findIndex((x, k) => x === rn[i] && !used.has(k)); map[i] = j; if (j >= 0) used.add(j); });
  const named = i => !/\[/.test(ref.cols[i]) || /^\[/.test(ref.cols[i]);
  const missing = ref.cols.map((c, i) => i).filter(i => map[i] < 0 && named(i) && new RegExp('["“”*]?' + rn[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["“”*]?', 'i').test(q.toLocaleLowerCase('tr')) && /["“”]/.test(q));
  if (missing.length) return { ok: false, msg: 'Sütun adı eksik: ' + missing.map(i => '“' + String(ref.cols[i]).replace(/^\[|\]$/g, '') + '”').join(', ') + '. Sütunları soruda yazan adlarla adlandır.' };
  const colVals = (R, k) => R.rows.map(r => cellKey(r[k])).sort().join('␟');
  ref.cols.forEach((c, i) => { if (map[i] >= 0) return; const v = colVals(ref, i); const j = mine.cols.findIndex((x, k) => !used.has(k) && colVals(mine, k) === v); if (j >= 0) { map[i] = j; used.add(j); } });
  if (map.some(x => x < 0)) return { ok: false, msg: 'Satır sayısı doğru ama değerler farklı.' };
  const a = mine.rows.map(r => map.map(k => cellKey(r[k])).join('␟')).sort(), b = ref.rows.map(r => r.map(cellKey).join('␟')).sort();
  if (!a.every((x, i) => x === b[i])) return { ok: false, msg: 'Satır sayısı doğru ama değerler farklı.' };
  const wantOrder = /ORDER\s+BY/i.test(String(e.sol)) && /sırala|büyükten|küçükten|azalan|artan|ORDER BY/i.test(q);
  if (wantOrder) {
    if (!/ORDER\s+BY/i.test(String(src))) return { ok: false, msg: 'Değerler doğru, ama sonuç sıralı değil. Bu alıştırma ORDER BY istiyor.' };
    const key = (String(e.sol).match(/ORDER\s+BY\s+([^\n,]+?)(?:\s+(?:ASC|DESC))?\s*(?:,|\n|$)/i) || [])[1];
    const ki = key ? rn.indexOf(norm(key.trim())) : -1;
    if (ki >= 0 && map[ki] >= 0) { const s1 = mine.rows.map(r => cellKey(r[map[ki]])).join('␟'), s2 = ref.rows.map(r => cellKey(r[ki])).join('␟'); if (s1 !== s2) return { ok: false, msg: 'Değerler doğru, ama sıra farklı. ORDER BY yönünü ve sütununu kontrol et.' }; }
  }
  return { ok: true };
}
/* İpucu çözümü ele vermesin: çözümün tamamını ya da büyük bölümünü içeren kod parçaları maskelenir */
const flat = s => plain(s).replace(/\s+/g, '').toLowerCase();
function revealsSol(hint, sol) {
  const h = flat(hint), f = flat(sol); if (!h || !f) return false; if (f.length >= 12 && h.includes(f)) return true;
  /* çözümün son ifadesi (RETURN sonrası ya da tamamı) */
  const tail = flat(String(sol).split(/\bRETURN\b/i).pop()); if (tail.length >= 18 && h.includes(tail)) return true;
  const sq = plain(hint).match(/[A-Z][A-Z.]+\s*\([^]*\)/); if (sq && f.length >= 12) { const c = flat(sq[0]); if (c.length >= f.length * 0.7) return true; }
  return false;
}
function maskCode(code) { return code.replace(/"[^"]*"/g, '"…"').replace(/\b\d+(\.\d+)?\b/g, '…').replace(/('?\w+'?)\[[^\]]+\]/g, '…').replace(/\[[^\]]+\]/g, '[…]'); }
function cleanHint(e) {
  const h = String(e.hint || ''); if (!h || !revealsSol(h, e.sol)) return h;
  let out = h.replace(/<code>([\s\S]*?)<\/code>/g, (m0, c) => (/\(/.test(c) ? '<code>' + maskCode(plain(c)) + '</code>' : m0));
  if (revealsSol(out, e.sol) || !/<code>/.test(h)) { out = plain(h).replace(/[A-Z][A-Z.]+\s*\([^]*\)/, m0 => maskCode(m0)); }
  if (revealsSol(out, e.sol)) out = 'Kullanılacak fonksiyonlar bir sonraki ipucunda. Önce sonucu cümleyle söyle: hangi satırlar, hangi filtre, hangi toplama?';
  return out;
}

/* Yeni veri senaryoları: ana modeli değiştirmeden bağımsız motor/önbellek kullanılır.
   Bunlar güvenlik sınırı değildir; tarayıcıdaki eğitim denetimini güçlendirir. */
let variantEngines;
function dataEngines() {
  if (variantEngines) return variantEngines;
  variantEngines = [0, 1].map(mode => {
    const model = structuredClone(W.PBI_MODEL);
    Object.values(model.tables).filter(t => t.kind === 'fact').forEach(t => {
      if (mode === 1) t.rows = t.rows.filter((r,i) => i % 11 !== 3);
      else t.rows.forEach((r,i) => ['Tutar','Maliyet','BirimFiyat','Hedef','StokDegeri'].forEach(c => {
        if (typeof r[c] === 'number') r[c] = Math.round(r[c] * (1.13 + (i % 5) * .07) * 100) / 100;
      }));
    });
    return W.PBI_CREATE_DAX(model);
  });
  return variantEngines;
}
function dataIssue(e, measures, src) {
  const eq = (a,b) => {
    if(a==null || b==null) return a==null && b==null;
    if(typeof a==='number' && typeof b==='number') return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a-b)<=1e-7*Math.max(1,Math.abs(b));
    return String(a)===String(b);
  };
  const grid = (eng,expr) => {
    const out=[];
    if(!e.noTotal)out.push([eng.evalMeasure(measures,expr,[])]);
    (e.grid||DEFAULT_GRID).forEach(col=>{
      const r=eng.query({rows:[col],measures,values:[expr],slicers:[],totals:false,keepBlank:true});
      out.push(r.rows.map(x=>[x.keys[0],x.vals[0]]));
    });return out;
  };
  const deepEq = (a,b) => Array.isArray(b) ? Array.isArray(a)&&a.length===b.length&&b.every((v,i)=>deepEq(a[i],v)) : eq(a,b);
  for(const eng of dataEngines()) {
    let ref;
    // Bir senaryoda referans motor hatası varsa başarı verilemez.
    try { ref=e.t==='query'?eng.runQuery(measures,e.sol):grid(eng,e.sol); }
    catch(er){return 'Yeni veri denetimi bu görev için tamamlanamadı. Başarı kaydedilmedi; sorunu geri bildirimle iletebilirsin.';}
    try {
      const mine=e.t==='query'?eng.runQuery(measures,src):grid(eng,eng.stripDef(src).expr);
      const ok=e.t==='query'?compareQuery(mine,ref,e,src).ok:deepEq(mine,ref);
      if(!ok)return 'Görünen sonuç doğru, fakat satış tutarları veya satır sayısı değiştiğinde sonuç ayrışıyor. Görünen değerleri sabitlemek yerine veriden hesapla.';
    }catch(er){return 'İfaden yeni veri senaryosunda hesaplanamadı. Görünen veriye özel sabitleri ve varsayımları kontrol et.';}
  }
  return '';
}

W.PBI_CHECK = { dataIssue, autoHidden, techOf, techIssue, compareQuery, revealsSol, cleanHint, plain };
})(typeof window !== 'undefined' ? window : globalThis);
