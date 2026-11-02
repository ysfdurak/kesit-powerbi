p='/home/claude/pbi/examui.js'; s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt, (s.count(a), a[:90]); s=s.replace(a,b)
rep("const TYPEN = { mc: 'Tek seçim', multi: 'Çoklu seçim', yesno: 'Evet / Hayır', order: 'Sıralama', hot: 'Kodda boşluk doldur' };",
"const TYPEN = { mc: 'Tek seçim', multi: 'Çoklu seçim', yesno: 'Evet / Hayır', order: 'Sıralama', hot: 'Kodda boşluk doldur', serq: 'Seri: çözüm hedefi karşılıyor mu?' };\nconst SECN = { main: 'Ana bölüm', case: 'Vaka çalışması', series: 'Evet/hayır serisi' };")
rep("""  const x = it.x; let h = '<div class="q">' + x.q + '</div>';
  if (x.type === 'mc')""","""  const x = it.x; let h = '<div class="q">' + x.q + '</div>';
  if (x.type === 'serq') { h += '<div class="ser-sol"><span class="eyebrow">Önerilen çözüm ' + (x.serI + 1) + ' / ' + x.serN + '</span><p>' + x.t + '</p></div><b>Bu çözüm hedefi karşılıyor mu?</b><div class="ser-yn">' + [[true, 'Evet'], [false, 'Hayır']].map(([v, l]) => '<button data-exs="' + v + '" class="btn' + (a === v ? ' pri' : '') + (review ? (v === x.a ? ' right' : a === v ? ' wrong' : '') : '') + '"' + (review ? ' disabled' : '') + '>' + l + '</button>').join('') + (review ? '<small class="muted">Doğru cevap: ' + (x.a ? 'Evet' : 'Hayır') + '</small>' : '') + '</div>'; return h; }
  if (x.type === 'mc')""")
rep("""function caseBox() {
  const cs = EX.cs; if (!cs) return '';""","""function caseBox(x) {
  const cs = caseFor(x); if (!cs) return '';""")
# mcRun yeniden
i0=s.index("function mcRun() {"); i1=s.index("function mcResult() {")
s=s[:i0]+r"""function mcRun() {
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
"""+s[i1:]
# sonuç: alıştırmada 1000 yok
rep("const e = EX.def, pass = EX.score >= e.pass, cert = isCert(e);","const e = EX.def, pass = EX.score >= e.pass, cert = isCert(e) && !isPrac(e);")
rep("if (cert) { const weak = {};","if (cert || isPrac(e)) { const weak = {};")
# gezinme
i0=s.index("function goQ(i) {"); i1=s.index("document.addEventListener('change'")
s=s[:i0]+r"""function goQ(i) {
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
"""+s[i1:]
rep("const t = ev.target.closest('[data-exstart],[data-exq],[data-exa],[data-exm],[data-exy],[data-exo],[data-exor],[data-extab],[data-excase],[data-exflag],[data-exfin],[data-exback],[data-covx],[data-term],[data-jump]'); if (!t) return;",
"const t = ev.target.closest('[data-exstart],[data-exq],[data-exa],[data-exm],[data-exy],[data-exo],[data-exor],[data-extab],[data-exsec],[data-exs],[data-excheck],[data-exflag],[data-exfin],[data-exback],[data-covx],[data-term],[data-jump]'); if (!t) return;")
rep("""  if (d.excase) { if (d.excase === 'yes') { EX.inCase = true; EX.cur = EX.caseStart; EX.tab = 0; C.render(); window.scrollTo(0, 0); } else $('#exAsk').innerHTML = ''; return; }""",
"""  if (d.exsec) { if (d.exsec !== 'no') { const si = +d.exsec; EX.sec = si; EX.cur = EX.secList[si].a; EX.tab = 0; C.render(); window.scrollTo(0, 0); } else $('#exAsk').innerHTML = ''; return; }
  if (EX.done) return;
  const locked = isPrac(EX.def) && EX.checked && EX.checked[EX.cur];
  if (d.excheck) { if (answered(EX.qs[EX.cur].x, EX.ans[EX.cur])) { EX.checked[EX.cur] = true; const y = window.scrollY; C.render(); window.scrollTo(0, y); } return; }
  if (locked && (d.exa !== undefined || d.exm !== undefined || d.exy || d.exo || d.exor !== undefined || d.exs)) return;
  if (d.exs) { EX.ans[EX.cur] = d.exs === 'true'; const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }""")
open(p,'w').write(s); print('ok')
