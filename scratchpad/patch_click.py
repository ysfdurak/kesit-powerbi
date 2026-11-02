p='/home/claude/pbi/examui.js'; s=open(p).read()
def rep(a,b):
    global s
    assert s.count(a)==1, (s.count(a), a[:80]); s=s.replace(a,b)
rep("  if (t === 'hot') { q.code = x.code; q.slots = x.slots; }\n  return q;","  if (t === 'hot') { q.code = x.code; q.slots = x.slots; }\n  if (t === 'click') { q.ui = x.ui; q.start = x.start; q.a = x.a; }\n  return q;")
rep("const emptyAns = x => x.type === 'mc' || x.type === 'serq' ? null :","const emptyAns = x => x.type === 'click' ? { tab: x.start, pick: null } : x.type === 'mc' || x.type === 'serq' ? null :")
rep("const answered = (x, a) => x.type === 'mc' || x.type === 'serq' ? a !== null :","const answered = (x, a) => x.type === 'click' ? a.pick !== null : x.type === 'mc' || x.type === 'serq' ? a !== null :")
rep("  if (x.type === 'serq') return a === x.a ? 1 : 0;","  if (x.type === 'serq') return a === x.a ? 1 : 0;\n  if (x.type === 'click') return a.pick === x.a ? 1 : 0;")
rep("serq: 'Seri: çözüm hedefi karşılıyor mu?' };","serq: 'Seri: çözüm hedefi karşılıyor mu?', click: 'Arayüzde tıkla' };")
rep("""  if (x.type === 'serq') {""","""  if (x.type === 'click') { const U = (window.PBI_UI || {})[x.ui]; if (!U) return h; const tabs = U.tabs, [at, al] = x.a.split('|'); const cur = review ? (a.pick ? a.pick.split('|')[0] : at) : a.tab; const tb = tabs.find(t => t.id === cur) || tabs[0];
    const lbl = k => { if (!k) return 'seçilmedi'; const [ti, b] = k.split('|'); const tt = tabs.find(t => t.id === ti); return (tt ? tt.name + ' → ' : '') + b; };
    h += '<div class="ui-sim" role="group" aria-label="Arayüz benzetimi: ' + esc(U.title) + '"><div class="ui-title"><span class="ui-dots"><i></i><i></i><i></i></span>' + esc(U.title) + '</div><div class="ui-tabs">' + tabs.map(t => '<button data-exct="' + t.id + '" class="' + (t.id === tb.id ? 'on ' : '') + (t.ctx ? 'ctx' : '') + '">' + esc(t.name) + '<small>' + esc(t.en) + '</small></button>').join('') + '</div><div class="ui-btns">' + tb.btns.map(([tr, en]) => { const k = tb.id + '|' + tr; return '<button data-excb="' + esc(k) + '" class="' + (a.pick === k ? 'picked ' : '') + (review ? (k === x.a ? 'right' : a.pick === k ? 'wrong' : '') : '') + '"' + (review ? ' disabled' : '') + '><b>' + esc(tr) + '</b><small>' + esc(en) + '</small></button>'; }).join('') + '</div><div class="ui-foot">' + esc(U.hint) + ' Benzetimdir; gerçek arayüzde düğme yerleri güncellemelerle değişebilir.</div></div>';
    h += review ? '<p class="exhint">Senin seçimin: <b>' + esc(lbl(a.pick)) + '</b> · Doğru: <b>' + esc(lbl(x.a)) + '</b></p>' : '<p class="exhint">Sekmeler arasında gezinebilirsin; cevap olarak yalnızca tıkladığın komut sayılır.' + (a.pick ? ' Seçimin: <b>' + esc(lbl(a.pick)) + '</b>' : '') + '</p>';
    return h; }
  if (x.type === 'serq') {""")
rep("const t = ev.target.closest('[data-exstart],[data-exq],[data-exa],","const t = ev.target.closest('[data-exct],[data-excb],[data-exstart],[data-exq],[data-exa],")
rep("  if (d.exs) { EX.ans[EX.cur] = d.exs === 'true';","  if (d.exct) { EX.ans[EX.cur].tab = d.exct; const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }\n  if (locked && d.excb) return;\n  if (d.excb) { EX.ans[EX.cur].pick = d.excb; const y = window.scrollY; C.render(); window.scrollTo(0, y); return; }\n  if (d.exs) { EX.ans[EX.cur] = d.exs === 'true';")
open(p,'w').write(s); print('ok')
