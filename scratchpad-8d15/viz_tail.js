  // araç ipucu (rapor sayfası araç ipucu benzetimi: d.x içinde mini rapor)
  let tipEl = null;
  function tipHTML(d) {
    let h = '<b>' + esc(d.h) + '</b>' + d.r.map(r => '<span><i>' + esc(r[0]) + '</i>' + esc(r[1]) + '</span>').join('');
    if (d.x) { h += '<div class="tpage"><div class="tpage-h">' + esc(d.x.title || 'Araç ipucu sayfası') + '</div>'; if (d.x.cards) h += '<div class="tcards">' + d.x.cards.map(c => '<div><small>' + esc(c[0]) + '</small><b>' + esc(c[1]) + '</b></div>').join('') + '</div>'; if (d.x.spark) h += spark(d.x.spark, { W: 210, H: 46, area: true }) + (d.x.sparkLabel ? '<small class="tsl">' + esc(d.x.sparkLabel) + '</small>' : ''); h += '</div>'; }
    return h;
  }
  function bindTips(rootEl) {
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'vtip'; tipEl.hidden = true; document.body.appendChild(tipEl); }
    const show = (el, x, y) => { let d; try { d = JSON.parse(el.getAttribute('data-tip')); } catch (e) { return; } tipEl.innerHTML = tipHTML(d); tipEl.classList.toggle('wide', !!d.x); tipEl.hidden = false; const w = tipEl.offsetWidth, hh = tipEl.offsetHeight; tipEl.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x + 14)) + 'px'; tipEl.style.top = Math.max(8, y - hh - 12 < 8 ? y + 18 : y - hh - 12) + 'px'; };
    rootEl.addEventListener('pointermove', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el && rootEl.contains(el)) show(el, e.clientX, e.clientY); else tipEl.hidden = true; });
    rootEl.addEventListener('pointerleave', () => { tipEl.hidden = true; });
    rootEl.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) { const r = el.getBoundingClientRect(); show(el, r.left + r.width / 2, r.top); } });
    rootEl.addEventListener('focusout', () => { tipEl.hidden = true; });
    window.addEventListener('scroll', () => { if (tipEl) tipEl.hidden = true; }, { passive: true });
  }
  root.PBIViz = { column, bar, line, donut, card, kpi, gauge, bullet, waterfall, funnel, treemap, scatter, map, decomp, table, slicer, spark, thumb, fmt, bindTips, esc, stats };
})(typeof window !== 'undefined' ? window : globalThis);
