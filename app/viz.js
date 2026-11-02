/* Kesit Power BI — SVG görsel kütüphanesi (Biçim ve Analiz seçenekleriyle). Tüm renkler tema değişkenlerinden. */
(function (root) {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S = i => 'var(--s' + ((i % 8) + 1) + ')';
  const isNum = v => typeof v === 'number' && isFinite(v);
  const g3 = s => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  function nf(v, dec) { const neg = v < 0; let [i, f] = Math.abs(v).toFixed(dec).split('.'); return (neg ? '−' : '') + g3(i) + (f ? ',' + f : ''); }
  function fmt(v, kind, short, units) {
    if (v === null || v === undefined) return '(Boş)';
    if (typeof v === 'number' && isNaN(v)) return 'NaN';
    if (typeof v !== 'number') { if (v instanceof Date) return root.PBI_DAX ? root.PBI_DAX.fmtDate(v, 'dd.MM.yyyy') : String(v); if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'; return String(v); }
    if (!isFinite(v)) return v > 0 ? '∞' : '−∞';
    if (kind === 'yuzde') return nf(v * 100, 1) + '%';
    const sym = kind === 'para' ? ' ₺' : '';
    const a = Math.abs(v);
    if (units === 'M' || (units !== 'none' && units !== 'K' && short && a >= 1e6)) return nf(v / 1e6, a >= 1e7 ? 1 : 2) + ' Mn' + sym;
    if (units === 'K' || (units !== 'none' && short && a >= (kind === 'para' ? 1e3 : 1e4))) return nf(v / 1e3, 1) + ' B' + sym;
    if (kind === 'para') return nf(v, a < 100 && !Number.isInteger(v) ? 2 : 0) + sym;
    if (kind === 'adet') return nf(v, Number.isInteger(v) ? 0 : 1);
    if (Number.isInteger(v)) return Math.abs(v) < 10000 ? String(v).replace('-', '−') : nf(v, 0);
    return nf(v, Math.abs(v) < 1 ? 3 : Math.abs(v) < 100 ? 2 : 0);
  }
  function niceTicks(min, max, n) {
    if (!(isFinite(min) && isFinite(max))) { min = 0; max = 1; }
    if (min === max) { max = min + (Math.abs(min) || 1); }
    const span = max - min; const step0 = span / (n || 4); const mag = Math.pow(10, Math.floor(Math.log10(step0))); const r = step0 / mag;
    const step = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step; const t = [];
    for (let x = lo; x <= hi + step / 2; x += step) t.push(Math.round(x / step) * step);
    return t;
  }
  const tip = (label, rows, extra) => ' data-tip="' + esc(JSON.stringify({ h: label, r: rows, x: extra || null })) + '"';
  const svgOpen = (W, H, label) => '<svg class="viz" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" role="img" aria-label="' + esc(label || 'Grafik') + '" preserveAspectRatio="xMidYMid meet">';
  const txt = (x, y, s, cls, anchor, extra) => '<text x="' + (+x).toFixed(1) + '" y="' + (+y).toFixed(1) + '" class="' + (cls || 'vt') + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + (extra || '') + '>' + esc(s) + '</text>';
  const trunc = (s, n) => { s = String(s); return s.length > n ? s.slice(0, Math.max(1, n - 1)) + '…' : s; };
  function legendHTML(series, o) { const pos = o && o.legend; if (pos === 'none') return ''; if (series.length < 2 && pos !== 'top' && pos !== 'bottom') return ''; return '<div class="vlegend' + (pos === 'top' ? ' top' : '') + '">' + series.map((s, i) => '<span><i style="background:' + (s.color || S(s.ci != null ? s.ci : i)) + (s.dash ? ';background:repeating-linear-gradient(90deg,' + (s.color || S(i)) + ' 0 3px,transparent 3px 5px)' : '') + '"></i>' + esc(s.name) + '</span>').join('') + '</div>'; }
  const withLegend = (svg, series, o) => { const lg = legendHTML(series, o); return o && o.legend === 'top' ? lg + svg : svg + lg; };
  const roundTopRect = (x, y, w, h, r, fill, extra) => { if (h <= 0.2 || w <= 0) return ''; r = Math.min(r, w / 2, h); return '<path d="M' + x.toFixed(1) + ',' + (y + h).toFixed(1) + 'V' + (y + r).toFixed(1) + 'Q' + x.toFixed(1) + ',' + y.toFixed(1) + ' ' + (x + r).toFixed(1) + ',' + y.toFixed(1) + 'H' + (x + w - r).toFixed(1) + 'Q' + (x + w).toFixed(1) + ',' + y.toFixed(1) + ' ' + (x + w).toFixed(1) + ',' + (y + r).toFixed(1) + 'V' + (y + h).toFixed(1) + 'Z" fill="' + fill + '"' + (extra || '') + '/>'; };
  const roundRightRect = (x, y, w, h, r, fill, extra) => { if (h <= 0 || w <= 0.2) return ''; r = Math.min(r, h / 2, w); return '<path d="M' + x.toFixed(1) + ',' + y.toFixed(1) + 'H' + (x + w - r).toFixed(1) + 'Q' + (x + w).toFixed(1) + ',' + y.toFixed(1) + ' ' + (x + w).toFixed(1) + ',' + (y + r).toFixed(1) + 'V' + (y + h - r).toFixed(1) + 'Q' + (x + w).toFixed(1) + ',' + (y + h).toFixed(1) + ' ' + (x + w - r).toFixed(1) + ',' + (y + h).toFixed(1) + 'H' + x.toFixed(1) + 'Z" fill="' + fill + '"' + (extra || '') + '/>'; };
  const selCls = (o, i) => (o.sel != null && o.sel >= 0 ? (o.sel === i ? ' sel' : ' dim') : '');
  // istatistik yardımcıları (analiz çizgileri için)
  const stats = arr => { const v = arr.filter(isNum); if (!v.length) return null; const s = v.slice().sort((a, b) => a - b); const m = v.reduce((a, b) => a + b, 0) / v.length; const h = s.length >> 1; return { avg: m, median: s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2, min: s[0], max: s[s.length - 1] }; };
  function linfit(vals) { const p = vals.map((v, i) => [i, v]).filter(x => isNum(x[1])); const n = p.length; if (n < 2) return null; let sx = 0, sy = 0, sxy = 0, sxx = 0; p.forEach(([x, y]) => { sx += x; sy += y; sxy += x * y; sxx += x * x; }); const b = (n * sxy - sx * sy) / (n * sxx - sx * sx); const a = (sy - b * sx) / n; const res = p.map(([x, y]) => y - (a + b * x)); const se = Math.sqrt(res.reduce((s, r) => s + r * r, 0) / Math.max(1, n - 2)); return { a, b, se, n }; }
  function refLines(o, vals) {
    const out = []; const st = stats(vals); if (!st) return out;
    (o.lines || []).forEach(l => {
      if (l.type === 'avg') out.push({ v: st.avg, label: 'Ortalama ' + fmt(st.avg, o.fmt, true), cls: 'ref-avg' });
      else if (l.type === 'median') out.push({ v: st.median, label: 'Medyan ' + fmt(st.median, o.fmt, true), cls: 'ref-med' });
      else if (l.type === 'min') out.push({ v: st.min, label: 'Min ' + fmt(st.min, o.fmt, true), cls: 'ref-min' });
      else if (l.type === 'max') out.push({ v: st.max, label: 'Maks ' + fmt(st.max, o.fmt, true), cls: 'ref-min' });
      else if (l.type === 'const' && isNum(l.value)) out.push({ v: l.value, label: (l.label || 'Sabit') + ' ' + fmt(l.value, o.fmt, true), cls: 'ref-const' });
    });
    return out;
  }
  const hasTrend = o => (o.lines || []).some(l => l.type === 'trend');
  // renk modu
  function barColor(o, sIdx, i, v, vals, base) {
    const m = o.colorMode;
    if (m === 'byCat') return S(i);
    if (m === 'highlight') { let best = -Infinity, bi = -1; vals.forEach((x, k) => { if (isNum(x) && x > best) { best = x; bi = k; } }); return i === bi ? base : 'var(--muted-mark)'; }
    if (m === 'cond') { const st = stats(vals); const thr = isNum(o.condTarget) ? o.condTarget : st ? st.avg : 0; return isNum(v) && v >= thr ? 'var(--ok)' : 'var(--err)'; }
    if (m === 'sign') return isNum(v) && v < 0 ? 'var(--err)' : 'var(--ok)';
    return base;
  }

  /* ---------- Sütun (dikey) — kümelenmiş / yığılmış / %100; çizgi serileri (kombo) ---------- */
  function column(d, o) {
    o = Object.assign({ grid: true, legend: 'auto' }, o || {}); o.fmt = d.fmt;
    const W = o.W || 420, H = o.H || 250, padL = o.noAxis ? 6 : 52, padR = 12, padT = (o.labels ? 20 : 14), padB = 38;
    const cats = d.cats; const bars = d.series.filter(s => s.type !== 'line'); const lines = d.series.filter(s => s.type === 'line');
    const stacked = o.stacked || o.pct; let vals = [];
    const totals = cats.map((c, i) => bars.reduce((a, s) => a + (isNum(s.vals[i]) && s.vals[i] > 0 ? s.vals[i] : 0), 0));
    if (o.pct) vals = [0, 1];
    else if (stacked) cats.forEach((c, i) => { let p = 0, n = 0; bars.forEach(s => { const v = s.vals[i] || 0; if (v > 0) p += v; else n += v; }); vals.push(p, n); });
    else bars.forEach(s => vals.push(...s.vals.filter(isNum)));
    lines.forEach(s => vals.push(...s.vals.filter(isNum)));
    const rl = !stacked && bars.length ? refLines(o, bars[0].vals) : []; rl.forEach(r => vals.push(r.v));
    let mn = o.yMin === 'auto' && !stacked ? Math.min(...vals.filter(isNum)) * 0.95 : Math.min(0, ...vals.filter(isNum)), mx = Math.max(o.yMin === 'auto' ? -Infinity : 0, ...vals.filter(isNum));
    if (!isFinite(mn)) mn = 0; if (!isFinite(mx)) mx = 1; if (mx === mn) mx = mn + 1;
    const ticks = o.pct ? [0, .25, .5, .75, 1] : niceTicks(mn, mx, 4); mn = ticks[0]; mx = ticks[ticks.length - 1];
    const iw = W - padL - padR, ih = H - padT - padB; const y = v => padT + ih - (Math.max(mn, Math.min(mx, v)) - mn) / (mx - mn) * ih;
    const bw = iw / Math.max(1, cats.length); const gw = Math.max(2, bw * (o.gap != null ? 1 - o.gap : cats.length > 12 ? 0.78 : 0.66)); const sw = stacked ? gw : (gw - 2 * (bars.length - 1)) / Math.max(1, bars.length);
    let h = svgOpen(W, H, o.label);
    ticks.forEach(t => { if (o.grid || t === 0) h += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(t) + '" y2="' + y(t) + '" class="' + (t === 0 ? 'vbase' : 'vgrid') + '"/>'; if (!o.noAxis) h += txt(padL - 6, y(t) + 3.5, o.pct ? Math.round(t * 100) + '%' : fmt(t, d.fmt, true, o.units), 'vt vax', 'end'); });
    if (o.yMin === 'auto' && mn > 0) h += '<path d="M' + (padL - 4) + ',' + (padT + ih - 4) + 'l4,4l4,-4" class="vbreak"/>';
    const every = Math.ceil(cats.length / Math.max(1, Math.floor(iw / 34)));
    cats.forEach((c, i) => {
      const x0 = padL + i * bw + (bw - gw) / 2; let pos = 0, neg = 0;
      const rows = d.series.map(s => [s.name, fmt(s.vals[i], s.fmt || d.fmt)]); if (o.pct) rows.push(['Toplam', fmt(totals[i], d.fmt)]);
      h += '<g class="vmark' + selCls(o, i) + '" data-i="' + i + '"' + tip(c, rows, o.tipx ? o.tipx(i) : null) + ' tabindex="0">';
      h += '<rect x="' + (padL + i * bw).toFixed(1) + '" y="' + padT + '" width="' + bw.toFixed(1) + '" height="' + ih + '" fill="transparent"/>';
      bars.forEach((s, k) => {
        let v = s.vals[i]; if (!isNum(v) || v === 0) return; const si = d.series.indexOf(s); const base = s.color || S(s.ci != null ? s.ci : si);
        if (stacked) { if (o.pct) v = totals[i] ? Math.max(0, v) / totals[i] : 0; const a = v > 0 ? pos : neg; const b = a + v; if (v > 0) pos = b; else neg = b; const yt = y(Math.max(a, b)), yb = y(Math.min(a, b)); h += '<rect x="' + x0.toFixed(1) + '" y="' + yt.toFixed(1) + '" width="' + gw.toFixed(1) + '" height="' + Math.max(0, yb - yt - 1.5).toFixed(1) + '" fill="' + base + '"/>'; if (o.labels && yb - yt > 14) h += txt(x0 + gw / 2, (yt + yb) / 2 + 4, o.pct ? Math.round(v * 100) + '%' : fmt(s.vals[i], d.fmt, true, o.units), 'vt vlabin', 'middle'); }
        else { const xx = x0 + k * (sw + 2); const col = bars.length === 1 ? barColor(o, k, i, v, s.vals, base) : base; const y0 = y(Math.max(mn, 0)); if (v >= 0) h += roundTopRect(xx, y(v), sw, y0 - y(v), 3, col); else h += '<rect x="' + xx.toFixed(1) + '" y="' + y0.toFixed(1) + '" width="' + sw.toFixed(1) + '" height="' + (y(v) - y0).toFixed(1) + '" fill="' + col + '" rx="2"/>'; if (o.labels && (bars.length === 1 || cats.length <= 6)) h += txt(xx + sw / 2, (v >= 0 ? y(v) - 5 : y(v) + 12), o.labelFn ? o.labelFn(i, v) : fmt(v, d.fmt, true, o.units), 'vt vlab', 'middle'); }
      });
      if (o.labels && stacked && !o.pct && totals[i]) h += txt(x0 + gw / 2, y(pos) - 5, fmt(pos, d.fmt, true, o.units), 'vt vlab', 'middle');
      h += '</g>';
      if (i % every === 0) h += txt(padL + i * bw + bw / 2, H - padB + 15, trunc(c, cats.length > 8 ? 7 : Math.max(4, Math.floor(bw / 6.5))), 'vt vcat', 'middle');
    });
    lines.forEach(s => { const k = d.series.indexOf(s); const col = s.color || S(s.ci != null ? s.ci : k); let path = ''; s.vals.forEach((v, i) => { if (!isNum(v)) return; path += (path ? 'L' : 'M') + (padL + i * bw + bw / 2).toFixed(1) + ',' + y(v).toFixed(1); }); h += '<path d="' + path + '" fill="none" stroke="' + col + '" stroke-width="2.2"' + (s.dash ? ' stroke-dasharray="5 4"' : '') + ' pointer-events="none"/>'; s.vals.forEach((v, i) => { if (isNum(v) && cats.length <= 16) h += '<circle cx="' + (padL + i * bw + bw / 2).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="3.5" fill="' + col + '" stroke="var(--surface)" stroke-width="1.5" pointer-events="none"/>'; }); });
    rl.forEach(r => { h += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(r.v).toFixed(1) + '" y2="' + y(r.v).toFixed(1) + '" class="ref ' + r.cls + '"/>' + txt(W - padR - 2, y(r.v) - 4, r.label, 'vt vref', 'end'); });
    if (hasTrend(o) && bars.length && !stacked) { const f = linfit(bars[0].vals); if (f) h += '<line x1="' + (padL + bw / 2) + '" x2="' + (padL + (cats.length - 0.5) * bw) + '" y1="' + y(f.a) + '" y2="' + y(f.a + f.b * (cats.length - 1)) + '" class="ref ref-trend"/>'; }
    return withLegend(h + '</svg>', d.series, o);
  }
  /* ---------- Çubuk (yatay) ---------- */
  function bar(d, o) {
    o = Object.assign({ grid: true, legend: 'auto' }, o || {}); o.fmt = d.fmt;
    const cats = d.cats; const stacked = o.stacked, pct = o.pct; const series = d.series;
    const rowH = o.rowH || (cats.length > 12 ? 19 : cats.length > 8 ? 23 : 28); const W = o.W || 420, padL = Math.min(o.W ? Math.round(o.W * 0.36) : 150, 14 + 6.3 * Math.max(4, ...cats.map(c => Math.min(24, String(c).length)))), padR = o.labels === false ? 14 : 60, padT = 6;
    const H = padT + rowH * cats.length + 22; const iw = Math.max(40, W - padL - padR);
    const totals = cats.map((c, i) => series.reduce((a, s) => a + (isNum(s.vals[i]) ? s.vals[i] : 0), 0));
    const rl = !stacked && !pct ? refLines(o, series[0] ? series[0].vals : []) : [];
    let mx = pct ? 1 : stacked ? Math.max(...totals, 0) : Math.max(0, ...series.flatMap(s => s.vals.filter(isNum)), ...rl.map(r => r.v));
    let mn = pct || stacked ? 0 : Math.min(0, ...series.flatMap(s => s.vals.filter(isNum)));
    if (o.yMin === 'auto' && !stacked && !pct) mn = Math.min(...series.flatMap(s => s.vals.filter(isNum))) * 0.95;
    if (mx === mn) mx = mn + 1; const ticks = pct ? [0, .25, .5, .75, 1] : niceTicks(mn, mx, 3); mn = ticks[0]; mx = ticks[ticks.length - 1];
    const x = v => padL + (Math.max(mn, Math.min(mx, v)) - mn) / (mx - mn) * iw;
    let h = svgOpen(W, H, o.label);
    ticks.forEach(t => { if (o.grid || t === 0) h += '<line x1="' + x(t).toFixed(1) + '" x2="' + x(t).toFixed(1) + '" y1="' + padT + '" y2="' + (H - 20) + '" class="' + (t === 0 ? 'vbase' : 'vgrid') + '"/>'; h += txt(x(t), H - 6, pct ? Math.round(t * 100) + '%' : fmt(t, d.fmt, true, o.units), 'vt vax', 'middle'); });
    cats.forEach((c, i) => {
      const y0 = padT + i * rowH, bh = rowH * 0.66, yb = y0 + (rowH - bh) / 2;
      const rows = series.map(s => [s.name, fmt(s.vals[i], s.fmt || d.fmt)]); if (pct) rows.push(['Toplam', fmt(totals[i], d.fmt)]);
      h += '<g class="vmark' + selCls(o, i) + '" data-i="' + i + '"' + tip(c, rows, o.tipx ? o.tipx(i) : null) + ' tabindex="0"><rect x="0" y="' + y0 + '" width="' + W + '" height="' + rowH + '" fill="transparent"/>';
      h += txt(padL - 8, y0 + rowH / 2 + 4, trunc(c, Math.floor((padL - 12) / 6.2)), 'vt vcat', 'end');
      if (stacked || pct) { let acc = 0; series.forEach((s, k) => { let v = s.vals[i]; if (!isNum(v) || v <= 0) return; if (pct) v = totals[i] ? v / totals[i] : 0; const x1 = x(acc), x2 = x(acc + v); acc += v; h += '<rect x="' + x1.toFixed(1) + '" y="' + yb.toFixed(1) + '" width="' + Math.max(0, x2 - x1 - 1.5).toFixed(1) + '" height="' + bh.toFixed(1) + '" fill="' + (s.color || S(s.ci != null ? s.ci : k)) + '"/>'; if (o.labels && x2 - x1 > 30) h += txt((x1 + x2) / 2, y0 + rowH / 2 + 4, pct ? Math.round(v * 100) + '%' : fmt(s.vals[i], d.fmt, true, o.units), 'vt vlabin', 'middle'); }); if (!pct && o.labels !== false) h += txt(x(acc) + 5, y0 + rowH / 2 + 4, fmt(totals[i], d.fmt, true, o.units), 'vt vlab'); }
      else { const sh = (bh - (series.length - 1) * 2) / series.length; series.forEach((s, k) => { const v = s.vals[i]; if (!isNum(v)) return; const xs = x(Math.min(Math.max(mn, 0), v)), w = Math.abs(x(v) - x(Math.max(mn, 0))); const base = s.color || S(s.ci != null ? s.ci : k); const col = series.length === 1 ? (o.colorBySign ? (v < 0 ? 'var(--err)' : 'var(--ok)') : barColor(o, k, i, v, s.vals, base)) : base; h += roundRightRect(xs, yb + k * (sh + 2), w, sh, 3, col); if (series.length === 1 && o.labels !== false) h += txt(x(Math.max(0, v)) + 5, y0 + rowH / 2 + 4, o.labelFn ? o.labelFn(i, v) : fmt(v, d.fmt, true, o.units), 'vt vlab'); }); }
      h += '</g>';
    });
    rl.forEach(r => { h += '<line x1="' + x(r.v).toFixed(1) + '" x2="' + x(r.v).toFixed(1) + '" y1="' + padT + '" y2="' + (H - 20) + '" class="ref ' + r.cls + '"/>' + txt(x(r.v) + 3, padT + 9, r.label, 'vt vref'); });
    return withLegend(h + '</svg>', series, o);
  }
  /* ---------- Çizgi / alan (+ tahmin, eğilim, referans çizgileri) ---------- */
  function line(d, o) {
    o = Object.assign({ grid: true, legend: 'auto', yMin: 'zero', width: 2, interp: 'linear' }, o || {}); o.fmt = d.fmt;
    const fc = o.forecast || 0; const W = o.W || 420, H = o.H || 240, padL = 54, padR = 16, padT = 14, padB = 34;
    const cats = d.cats.concat(Array.from({ length: fc }, (_, k) => '+' + (k + 1)));
    const all = d.series.flatMap(s => s.vals.filter(isNum)); const s0 = d.series[0] ? d.series[0].vals : [];
    const fit = (fc || hasTrend(o)) ? linfit(s0) : null; const rl = refLines(o, s0);
    let extra = rl.map(r => r.v); if (fit && fc) for (let k = 0; k < fc; k++) { const xi = s0.length + k; extra.push(fit.a + fit.b * xi + 1.96 * fit.se, fit.a + fit.b * xi - 1.96 * fit.se); }
    let mn = Math.min(...all, ...extra), mx = Math.max(...all, ...extra, 0);
    if (!isFinite(mn)) mn = 0; if (o.yMin === 'zero' || o.area) mn = Math.min(0, mn); if (mx === mn) mx = mn + 1;
    const ticks = niceTicks(mn, mx, 4); mn = ticks[0]; mx = ticks[ticks.length - 1];
    const iw = W - padL - padR, ih = H - padT - padB; const step = cats.length > 1 ? iw / (cats.length - 1) : 0;
    const X = i => padL + (cats.length > 1 ? i * step : iw / 2), Y = v => padT + ih - (v - mn) / (mx - mn) * ih;
    let h = svgOpen(W, H, o.label);
    ticks.forEach(t => { if (o.grid || t === 0) h += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(t).toFixed(1) + '" y2="' + Y(t).toFixed(1) + '" class="' + (t === 0 ? 'vbase' : 'vgrid') + '"/>'; h += txt(padL - 6, Y(t) + 3.5, fmt(t, d.fmt, true, o.units), 'vt vax', 'end'); });
    if (o.yMin === 'auto' && mn > 0) h += '<path d="M' + (padL - 4) + ',' + (padT + ih - 4) + 'l4,4l4,-4" class="vbreak"/>';
    const every = Math.ceil(cats.length / Math.max(1, Math.floor(iw / 42)));
    cats.forEach((c, i) => { if (i % every === 0) h += txt(X(i), H - padB + 16, trunc(c, 8), 'vt vcat', 'middle'); });
    const pathOf = (vals) => { let p = '', prev = null; vals.forEach((v, i) => { if (!isNum(v)) { prev = null; return; } const xx = X(i), yy = Y(v); if (prev === null) p += 'M' + xx.toFixed(1) + ',' + yy.toFixed(1); else if (o.interp === 'step') p += 'H' + xx.toFixed(1) + 'V' + yy.toFixed(1); else if (o.interp === 'smooth') { const mxp = (prev[0] + xx) / 2; p += 'C' + mxp.toFixed(1) + ',' + prev[1].toFixed(1) + ' ' + mxp.toFixed(1) + ',' + yy.toFixed(1) + ' ' + xx.toFixed(1) + ',' + yy.toFixed(1); } else p += 'L' + xx.toFixed(1) + ',' + yy.toFixed(1); prev = [xx, yy]; }); return p; };
    if (fit && fc) { const n0 = s0.length - 1; let up = '', lo = ''; for (let k = 0; k <= fc; k++) { const xi = n0 + k; const c0 = fit.a + fit.b * xi; const band = k === 0 ? 0 : 1.96 * fit.se * Math.sqrt(1 + k / 6); up += (k ? 'L' : 'M') + X(xi).toFixed(1) + ',' + Y(c0 + band).toFixed(1); lo = 'L' + X(xi).toFixed(1) + ',' + Y(c0 - band).toFixed(1) + lo; } h += '<path d="' + up + lo + 'Z" class="fband"/>'; h += '<path d="M' + X(n0) + ',' + Y(fit.a + fit.b * n0) + 'L' + X(n0 + fc) + ',' + Y(fit.a + fit.b * (n0 + fc)) + '" class="ref ref-fc"/>'; h += '<line x1="' + X(n0) + '" x2="' + X(n0) + '" y1="' + padT + '" y2="' + (padT + ih) + '" class="vgrid" stroke-dasharray="2 3"/>'; }
    d.series.forEach((s, k) => {
      const col = s.color || S(s.ci != null ? s.ci : k); const p = pathOf(s.vals); if (!p) return;
      let first = s.vals.findIndex(isNum), last = -1; s.vals.forEach((v, i) => { if (isNum(v)) last = i; });
      if (o.area && (d.series.length === 1 || o.stackedArea)) h += '<path d="' + p + 'L' + X(last).toFixed(1) + ',' + Y(Math.max(mn, 0)).toFixed(1) + 'L' + X(first).toFixed(1) + ',' + Y(Math.max(mn, 0)).toFixed(1) + 'Z" fill="' + col + '" opacity=".15"/>';
      h += '<path d="' + p + '" fill="none" stroke="' + col + '" stroke-width="' + (s.width || o.width) + '" stroke-linejoin="round"' + (s.dash ? ' stroke-dasharray="5 4"' : '') + '/>';
      if (o.markers) s.vals.forEach((v, i) => { if (isNum(v)) h += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="3.2" fill="' + col + '" stroke="var(--surface)" stroke-width="1.4" pointer-events="none"/>'; });
      if (last >= 0) h += '<circle cx="' + X(last).toFixed(1) + '" cy="' + Y(s.vals[last]).toFixed(1) + '" r="4" fill="' + col + '" stroke="var(--surface)" stroke-width="2"/>';
      if (o.labels) s.vals.forEach((v, i) => { if (isNum(v) && (s.vals.length <= 12 || i === last)) h += txt(X(i), Y(v) - 8, fmt(v, d.fmt, true, o.units), 'vt vlab', 'middle'); });
    });
    rl.forEach(r => { h += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(r.v).toFixed(1) + '" y2="' + Y(r.v).toFixed(1) + '" class="ref ' + r.cls + '"/>' + txt(W - padR - 2, Y(r.v) - 4, r.label, 'vt vref', 'end'); });
    if (fit && hasTrend(o)) h += '<line x1="' + X(0) + '" x2="' + X(s0.length - 1) + '" y1="' + Y(fit.a).toFixed(1) + '" y2="' + Y(fit.a + fit.b * (s0.length - 1)).toFixed(1) + '" class="ref ref-trend"/>';
    d.cats.forEach((c, i) => { const w = cats.length > 1 ? step : iw; h += '<g class="vmark vcol' + selCls(o, i) + '" data-i="' + i + '"' + tip(c, d.series.map(s => [s.name, fmt(s.vals[i], s.fmt || d.fmt)]), o.tipx ? o.tipx(i) : null) + '><rect x="' + (X(i) - w / 2).toFixed(1) + '" y="' + padT + '" width="' + w.toFixed(1) + '" height="' + ih + '" fill="transparent"/><line x1="' + X(i).toFixed(1) + '" x2="' + X(i).toFixed(1) + '" y1="' + padT + '" y2="' + (padT + ih) + '" class="vcross"/></g>'; });
    const ser = d.series.slice(); if (fc) ser.push({ name: 'Tahmin (%95 aralık)', color: 'var(--s7)', dash: true });
    return withLegend(h + '</svg>', ser, o);
  }
  /* ---------- Halka / pasta ---------- */
  function donut(d, o) {
    o = Object.assign({ inner: 0.6, labelMode: 'pct', legend: 'right' }, o || {});
    const compact = (o.W || 420) < 380 || o.legend === 'bottom'; const n = d.cats.length;
    const W = compact ? Math.min(o.W || 320, 340) : (o.W || 420), lhC = 20, Rr = compact ? Math.min(92, W / 2 - 24) : 90;
    const H = compact ? Rr * 2 + 24 + (o.legend === 'none' ? 0 : n * lhC + 6) : Math.max(220, n * 22 + 20), cx = compact ? W / 2 : 112, cy = compact ? Rr + 12 : H / 2, R = compact ? Rr : Math.min(90, H / 2 - 12), r = R * o.inner;
    const vals = d.series[0].vals.map(v => isNum(v) && v > 0 ? v : 0); const tot = vals.reduce((a, b) => a + b, 0) || 1;
    let h = svgOpen(W, H, o.label); let a0 = -Math.PI / 2;
    const p = (rr, a) => (cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2);
    vals.forEach((v, i) => {
      if (!v) return; const a1 = a0 + v / tot * Math.PI * 2; const gap = vals.filter(x => x).length > 1 ? 0.012 : 0;
      const large = a1 - a0 > Math.PI ? 1 : 0; const s0 = a0 + gap, s1 = a1 - gap; const full = vals.filter(x => x).length === 1;
      const path = full ? (r > 0 ? 'M' + p(R, 0) + 'A' + R + ',' + R + ' 0 1 1 ' + p(R, Math.PI) + 'A' + R + ',' + R + ' 0 1 1 ' + p(R, 0) + 'M' + p(r, 0) + 'A' + r + ',' + r + ' 0 1 0 ' + p(r, Math.PI) + 'A' + r + ',' + r + ' 0 1 0 ' + p(r, 0) + 'Z' : 'M' + p(R, 0) + 'A' + R + ',' + R + ' 0 1 1 ' + p(R, Math.PI) + 'A' + R + ',' + R + ' 0 1 1 ' + p(R, 0) + 'Z')
        : (r > 0 ? 'M' + p(R, s0) + 'A' + R + ',' + R + ' 0 ' + large + ' 1 ' + p(R, s1) + 'L' + p(r, s1) + 'A' + r + ',' + r + ' 0 ' + large + ' 0 ' + p(r, s0) + 'Z' : 'M' + cx + ',' + cy + 'L' + p(R, s0) + 'A' + R + ',' + R + ' 0 ' + large + ' 1 ' + p(R, s1) + 'Z');
      h += '<path class="vmark' + selCls(o, i) + '" data-i="' + i + '" d="' + path + '" fill="' + ((o.colors && o.colors[i]) || S(i)) + '" fill-rule="evenodd"' + tip(d.cats[i], [[d.series[0].name, fmt(d.series[0].vals[i], d.fmt)], ['Pay', fmt(v / tot, 'yuzde')]], o.tipx ? o.tipx(i) : null) + ' tabindex="0"/>';
      if (o.labelMode !== 'none' && v / tot > 0.06) { const am = (a0 + a1) / 2, rl = r > 0 ? (R + r) / 2 : R * 0.62; h += txt(cx + rl * Math.cos(am), cy + rl * Math.sin(am) + 4, o.labelMode === 'value' ? fmt(v, d.fmt, true) : Math.round(v / tot * 100) + '%', 'vt vlabin', 'middle'); }
      a0 = a1;
    });
    if (r > 0) h += txt(cx, cy - 2, fmt(tot, d.fmt, true), 'vt vbig', 'middle') + txt(cx, cy + 15, 'Toplam', 'vt vax', 'middle');
    if (o.legend !== 'none') {
      const lx = compact ? 24 : 232; const lh = compact ? lhC : Math.min(22, (H - 20) / Math.max(1, n));
      d.cats.forEach((c, i) => { const yy = compact ? Rr * 2 + 34 + i * lh : 14 + i * lh + lh / 2; h += '<g class="vmark' + selCls(o, i) + '" data-i="' + i + '"' + tip(c, [[d.series[0].name, fmt(d.series[0].vals[i], d.fmt)], ['Pay', fmt(vals[i] / tot, 'yuzde')]]) + '><rect x="' + lx + '" y="' + (yy - 6) + '" width="10" height="10" rx="2" fill="' + ((o.colors && o.colors[i]) || S(i)) + '"/>' + txt(lx + 16, yy + 3, trunc(c, compact ? 22 : 15), 'vt vcat') + txt(W - (compact ? 24 : 6), yy + 3, fmt(vals[i] / tot, 'yuzde'), 'vt vlab', 'end') + '</g>'; });
    }
    return h + '</svg>';
  }
  /* ---------- Mini çizgi (sparkline) ---------- */
  function spark(vals, o) { o = o || {}; const W = o.W || 120, H = o.H || 28; const v = vals.map(x => isNum(x) ? x : null); const nn = v.filter(isNum); if (nn.length < 2) return ''; const mn = Math.min(...nn), mx = Math.max(...nn); const X = i => 2 + i * (W - 6) / (v.length - 1), Y = x => H - 3 - (x - mn) / ((mx - mn) || 1) * (H - 6); let p = ''; v.forEach((x, i) => { if (!isNum(x)) return; p += (p ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(x).toFixed(1); }); let li = -1; v.forEach((x, i) => { if (isNum(x)) li = i; }); return '<svg class="vspark" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">' + (o.area ? '<path d="' + p + 'L' + X(li) + ',' + H + 'L' + X(v.findIndex(isNum)) + ',' + H + 'Z" fill="' + (o.color || 'var(--s1)') + '" opacity=".14"/>' : '') + '<path d="' + p + '" fill="none" stroke="' + (o.color || 'var(--s1)') + '" stroke-width="1.8"/><circle cx="' + X(li) + '" cy="' + Y(v[li]) + '" r="2.6" fill="' + (o.color || 'var(--s1)') + '"/></svg>'; }
  /* ---------- Kart ve KPI ---------- */
  function card(v, label, kind, sub, o) { o = o || {}; return '<div class="vcard' + (o.size === 'sm' ? ' sm' : '') + '"><b>' + esc(fmt(v, kind, o.units !== 'none', o.units)) + '</b>' + (o.showLabel === false ? '' : '<span>' + esc(label) + '</span>') + (sub || '') + '</div>'; }
  function kpi(v, target, label, kind, tlabel, o) {
    o = o || {}; const lowerBetter = o.direction === 'down';
    const diff = isNum(v) && isNum(target) && target ? v / target - 1 : null; const good = diff === null ? null : lowerBetter ? diff <= 0 : diff >= 0;
    const state = diff === null ? '' : good ? 'p-ok' : Math.abs(diff) < 0.05 ? 'p-warn' : 'p-bad';
    const icon = state === 'p-ok' ? (diff >= 0 ? '▲' : '▼') : state === 'p-warn' ? '■' : (diff >= 0 ? '▲' : '▼');
    return '<div class="vcard vkpi"><b>' + esc(fmt(v, kind, o.units !== 'none', o.units)) + '</b><span>' + esc(label) + '</span>' + (diff !== null && o.goal !== false ? '<em class="pill ' + state + '">' + icon + ' ' + (diff >= 0 ? '+' : '') + fmt(diff, 'yuzde') + ' <small>' + esc(tlabel || 'hedefe göre') + '</small></em>' : '') + (o.spark && o.trend !== false ? '<div class="kspark">' + spark(o.spark, { W: 160, H: 30, area: true, color: state === 'p-bad' ? 'var(--err)' : 'var(--s1)' }) + '</div>' : '') + '</div>';
  }
  /* ---------- Gösterge ---------- */
  function gauge(v, target, max, kind, label, o) {
    o = o || {}; const W = 260, H = 150, cx = 130, cy = 128, R = 100, r = 72; max = max || Math.max(v || 0, target || 0) * 1.25 || 1;
    const ang = t => Math.PI + Math.min(1, Math.max(0, t / max)) * Math.PI;
    const p = (rr, a) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
    const ps = (rr, a) => p(rr, a).map(x => x.toFixed(2)).join(',');
    const arc = (a0, a1) => 'M' + ps(R, a0) + 'A' + R + ',' + R + ' 0 0 1 ' + ps(R, a1) + 'L' + ps(r, a1) + 'A' + r + ',' + r + ' 0 0 0 ' + ps(r, a0) + 'Z';
    let h = svgOpen(W, H, label) + '<path d="' + arc(Math.PI, 2 * Math.PI) + '" fill="var(--grid)"/>';
    if (isNum(v) && v > 0) h += '<path d="' + arc(Math.PI, ang(v)) + '" fill="' + (o.color || 'var(--s1)') + '"' + tip(label, [['Değer', fmt(v, kind)], ['Hedef', fmt(target, kind)], ['Maksimum', fmt(max, kind)]]) + ' class="vmark"/>';
    if (isNum(target) && o.showTarget !== false) { const a = ang(target); const [x1, y1] = p(r - 6, a), [x2, y2] = p(R + 6, a); h += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="var(--ink)" stroke-width="2.5"/>'; }
    h += txt(cx, cy - 18, fmt(v, kind, true), 'vt vbig', 'middle') + txt(cx - R + 14, cy + 16, '0', 'vt vax', 'middle') + txt(cx + R - 14, cy + 16, fmt(max, kind, true), 'vt vax', 'middle');
    if (isNum(target) && o.showTarget !== false) h += txt(cx, cy + 4, 'Hedef ' + fmt(target, kind, true), 'vt vax', 'middle');
    return h + '</svg>';
  }
  /* ---------- Madde (bullet) grafik ---------- */
  function bullet(rows, o) { o = o || {}; const W = o.W || 420, rowH = 30, padL = 120, padR = 70, H = rows.length * rowH + 8; const mx = Math.max(...rows.flatMap(r => [r.v || 0, r.t || 0])) * 1.1 || 1; const X = v => padL + v / mx * (W - padL - padR); let h = svgOpen(W, H, o.label); rows.forEach((r, i) => { const y = 4 + i * rowH; h += '<g class="vmark" data-i="' + i + '"' + tip(r.c, [['Gerçekleşen', fmt(r.v, o.fmt)], ['Hedef', fmt(r.t, o.fmt)], ['Oran', fmt(r.t ? r.v / r.t : null, 'yuzde')]]) + ' tabindex="0">' + txt(padL - 8, y + rowH / 2 + 3, trunc(r.c, 16), 'vt vcat', 'end') + '<rect x="' + padL + '" y="' + (y + 5) + '" width="' + (W - padL - padR) + '" height="' + (rowH - 10) + '" fill="var(--grid)" rx="2"/><rect x="' + padL + '" y="' + (y + 10) + '" width="' + Math.max(0, X(r.v || 0) - padL).toFixed(1) + '" height="' + (rowH - 20) + '" fill="' + ((r.v || 0) >= (r.t || 0) ? 'var(--s1)' : 'var(--s2)') + '" rx="2"/><line x1="' + X(r.t || 0).toFixed(1) + '" x2="' + X(r.t || 0).toFixed(1) + '" y1="' + (y + 3) + '" y2="' + (y + rowH - 3) + '" stroke="var(--ink)" stroke-width="2.5"/>' + txt(W - 4, y + rowH / 2 + 3, fmt(r.t ? r.v / r.t : null, 'yuzde'), 'vt vlab', 'end') + '</g>'; }); return h + '</svg><div class="vlegend"><span><i style="background:var(--s1)"></i>Hedefte</span><span><i style="background:var(--s2)"></i>Hedefin altında</span><span><i style="background:var(--ink);width:3px"></i>Hedef</span></div>'; }
  /* ---------- Şelale ---------- */
  function waterfall(d, o) {
    o = Object.assign({ showTotal: true }, o || {}); const vals = d.series[0].vals.map(v => isNum(v) ? v : 0);
    let cats = d.cats.slice(); const W = o.W || 420, H = o.H || 250, padL = 54, padR = 10, padT = 18, padB = 40; let acc = o.start != null ? o.start : 0;
    const segs = []; if (o.start != null) { segs.push({ a: 0, b: o.start, v: o.start, total: true }); cats.unshift(o.startLabel || 'Başlangıç'); }
    vals.forEach(v => { segs.push({ a: acc, b: acc + v, v }); acc += v; }); if (o.showTotal) { segs.push({ a: 0, b: acc, v: acc, total: true }); cats.push(o.endLabel || 'Toplam'); }
    const all = segs.flatMap(s => [s.a, s.b]); let mn = Math.min(0, ...all), mx = Math.max(...all); const ticks = niceTicks(mn, mx, 4); mn = ticks[0]; mx = ticks[ticks.length - 1];
    const iw = W - padL - padR, ih = H - padT - padB; const Y = v => padT + ih - (v - mn) / (mx - mn) * ih; const bw = iw / segs.length;
    let h = svgOpen(W, H, o.label);
    ticks.forEach(t => { h += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" class="' + (t === 0 ? 'vbase' : 'vgrid') + '"/>' + txt(padL - 6, Y(t) + 3.5, fmt(t, d.fmt, true), 'vt vax', 'end'); });
    segs.forEach((s, i) => { const x = padL + i * bw + bw * 0.16, w = bw * 0.68; const top = Y(Math.max(s.a, s.b)), bot = Y(Math.min(s.a, s.b)); const col = s.total ? 'var(--s1)' : s.v >= 0 ? 'var(--ok)' : 'var(--err)';
      h += '<g class="vmark" data-i="' + i + '"' + tip(cats[i], [[s.total ? 'Toplam' : 'Değişim', fmt(s.v, d.fmt)]]) + ' tabindex="0"><rect x="' + x.toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(1, bot - top).toFixed(1) + '" fill="' + col + '" rx="2"/></g>';
      if (o.labels !== false && bw > 34) h += txt(x + w / 2, top - 4, (s.total || s.v < 0 ? '' : '+') + fmt(s.v, d.fmt, true), 'vt vlab', 'middle');
      if (i < segs.length - 1) h += '<line x1="' + (x + w).toFixed(1) + '" x2="' + (x + bw).toFixed(1) + '" y1="' + Y(s.b).toFixed(1) + '" y2="' + Y(s.b).toFixed(1) + '" class="vgrid" stroke-dasharray="2 2"/>';
      h += txt(padL + i * bw + bw / 2, H - padB + 15, trunc(cats[i], Math.max(4, Math.floor(bw / 6.5))), 'vt vcat', 'middle'); });
    return h + '</svg><div class="vlegend"><span><i style="background:var(--ok)"></i>Artış</span><span><i style="background:var(--err)"></i>Azalış</span><span><i style="background:var(--s1)"></i>Toplam</span></div>';
  }
  /* ---------- Huni ---------- */
  function funnel(d, o) {
    o = Object.assign({ conv: 'first' }, o || {}); const vals = d.series[0].vals.map(v => isNum(v) ? v : 0); const mx = Math.max(...vals, 1); const W = o.W || 420, rowH = 36, H = rowH * vals.length + 6; const lw = Math.min(140, W * 0.3);
    let h = svgOpen(W, H, o.label);
    vals.forEach((v, i) => { const w = Math.max(4, v / mx * (W - lw - 90)); const x = lw + 8 + (W - lw - 90 - w) / 2; const y = 3 + i * rowH; const conv = o.conv === 'prev' ? (i ? v / (vals[i - 1] || 1) : 1) : v / (vals[0] || 1);
      h += '<g class="vmark' + selCls(o, i) + '" data-i="' + i + '"' + tip(d.cats[i], [[d.series[0].name, fmt(v, d.fmt)], ['İlk adıma oran', fmt(v / (vals[0] || 1), 'yuzde')], ['Önceki adıma oran', i ? fmt(v / (vals[i - 1] || 1), 'yuzde') : '—']]) + ' tabindex="0"><rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + (rowH - 5) + '" rx="3" fill="var(--s1)" opacity="' + (1 - i * 0.11).toFixed(2) + '"/>' + txt(lw, y + rowH / 2 + 2, trunc(d.cats[i], Math.floor(lw / 6.4)), 'vt vcat', 'end') + (o.labels !== false && w > 50 ? txt(x + w / 2, y + rowH / 2 + 2, fmt(v, d.fmt, true), 'vt vlabin', 'middle') : '') + (o.conv !== 'none' ? txt(W - 4, y + rowH / 2 + 2, i || o.conv === 'first' ? fmt(conv, 'yuzde') : '', 'vt vlab', 'end') : '') + '</g>'; });
    return h + '</svg>';
  }
  /* ---------- Ağaç haritası ---------- */
  function treemap(d, o) {
    o = Object.assign({ labels: true }, o || {}); const W = o.W || 420, H = o.H || 240; const items = d.cats.map((c, i) => ({ c, v: d.series[0].vals[i], i, g: d.groups ? d.groups[i] : null })).filter(x => isNum(x.v) && x.v > 0).sort((a, b) => b.v - a.v);
    const tot = items.reduce((a, b) => a + b.v, 0) || 1; const rects = []; const gcol = {}; let gi = 0; items.forEach(it => { if (it.g != null && gcol[it.g] == null) gcol[it.g] = gi++; });
    (function sq(list, x, y, w, h) { if (!list.length) return; if (list.length === 1) { rects.push([list[0], x, y, w, h]); return; } const sum = list.reduce((a, b) => a + b.v, 0); let half = 0, k = 0; while (k < list.length - 1 && half + list[k].v < sum / 2) { half += list[k].v; k++; } if (k === 0) { half = list[0].v; k = 1; } const a = list.slice(0, k), b = list.slice(k); const f = half / sum; if (w >= h) { sq(a, x, y, w * f, h); sq(b, x + w * f, y, w * (1 - f), h); } else { sq(a, x, y, w, h * f); sq(b, x, y + h * f, w, h * (1 - f)); } })(items, 0, 0, W, H);
    let h = svgOpen(W, H, o.label);
    rects.forEach(([it, x, y, w, hh]) => { const col = it.g != null ? S(gcol[it.g]) : S(it.i); h += '<g class="vmark' + selCls(o, it.i) + '" data-i="' + it.i + '"' + tip(it.c, [[d.series[0].name, fmt(it.v, d.fmt)], ['Pay', fmt(it.v / tot, 'yuzde')]].concat(it.g != null ? [['Grup', it.g]] : []), o.tipx ? o.tipx(it.i) : null) + ' tabindex="0"><rect x="' + (x + 1).toFixed(1) + '" y="' + (y + 1).toFixed(1) + '" width="' + Math.max(0, w - 2).toFixed(1) + '" height="' + Math.max(0, hh - 2).toFixed(1) + '" rx="3" fill="' + col + '"/>' + (o.labels && w > 56 && hh > 30 ? txt(x + 8, y + 18, trunc(it.c, Math.floor(w / 7)), 'vt vtm') + txt(x + 8, y + 33, fmt(it.v, d.fmt, true), 'vt vtm2') : '') + '</g>'; });
    return h + '</svg>' + (d.groups ? legendHTML(Object.keys(gcol).map(g => ({ name: g, ci: gcol[g] })), { legend: 'bottom' }) : '');
  }
  /* ---------- Dağılım / kabarcık ---------- */
  function scatter(pts, o) {
    o = o || {}; const W = o.W || 420, H = o.H || 260, padL = 54, padR = 16, padT = o.ylabel ? 26 : 12, padB = 40;
    const xs = pts.map(p => p.x).filter(isNum), ys = pts.map(p => p.y).filter(isNum); if (!xs.length) return '<div class="empty">Veri yok</div>';
    const tx = niceTicks(Math.min(0, ...xs), Math.max(...xs), 4), ty = niceTicks(o.yMin === 'auto' ? Math.min(...ys) - (Math.max(...ys) - Math.min(...ys)) * .08 : Math.min(0, ...ys), Math.max(...ys), 4);
    const X = v => padL + (v - tx[0]) / (tx[tx.length - 1] - tx[0]) * (W - padL - padR), Y = v => padT + (H - padT - padB) - (v - ty[0]) / (ty[ty.length - 1] - ty[0]) * (H - padT - padB);
    const sz = pts.map(p => p.s).filter(isNum); const smax = sz.length ? Math.max(...sz) : 1;
    let h = svgOpen(W, H, o.label);
    ty.forEach(t => { if (o.grid !== false) h += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(t).toFixed(1) + '" y2="' + Y(t).toFixed(1) + '" class="vgrid"/>'; h += txt(padL - 6, Y(t) + 3.5, fmt(t, o.yfmt, true), 'vt vax', 'end'); });
    tx.forEach(t => { h += txt(X(t), H - padB + 15, fmt(t, o.xfmt, true), 'vt vax', 'middle'); });
    h += txt(W - padR, H - 6, o.xlabel || '', 'vt vax', 'end') + '<text class="vt vax" transform="translate(' + (padL - 6) + ',' + (padT - 12) + ')" text-anchor="start">' + esc(o.ylabel || '') + '</text>';
    if (o.quadrants) { const mxv = xs.reduce((a, b) => a + b, 0) / xs.length, myv = ys.reduce((a, b) => a + b, 0) / ys.length; h += '<line x1="' + X(mxv).toFixed(1) + '" x2="' + X(mxv).toFixed(1) + '" y1="' + padT + '" y2="' + (H - padB) + '" class="ref ref-avg"/><line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(myv).toFixed(1) + '" y2="' + Y(myv).toFixed(1) + '" class="ref ref-avg"/>' + txt(W - padR - 2, padT + 10, 'Yüksek–yüksek', 'vt vref', 'end'); }
    if (o.trend) { const p2 = pts.filter(p => isNum(p.x) && isNum(p.y)); const n = p2.length; let sx = 0, sy = 0, sxy = 0, sxx = 0; p2.forEach(p => { sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x; }); const b = (n * sxy - sx * sy) / (n * sxx - sx * sx), a = (sy - b * sx) / n; let x0 = Math.min(...xs), x1 = Math.max(...xs); const lo = ty[0], hi = ty[ty.length - 1]; const cl = x => { const y = a + b * x; if (y < lo && b) return (lo - a) / b; if (y > hi && b) return (hi - a) / b; return x; }; x0 = cl(x0); x1 = cl(x1); if (isFinite(b) && x1 > x0) h += '<line x1="' + X(x0).toFixed(1) + '" x2="' + X(x1).toFixed(1) + '" y1="' + Y(a + b * x0).toFixed(1) + '" y2="' + Y(a + b * x1).toFixed(1) + '" class="ref ref-trend"/>'; }
    const groups = [...new Set(pts.map(p => p.g))];
    pts.forEach((p, i) => { if (!isNum(p.x) || !isNum(p.y)) return; const gi = groups.indexOf(p.g); const rr = o.bubble && isNum(p.s) ? 4 + Math.sqrt(p.s / smax) * 14 : (p.r || 5); h += '<circle class="vmark' + selCls(o, i) + '" data-i="' + i + '" cx="' + X(p.x).toFixed(1) + '" cy="' + Y(p.y).toFixed(1) + '" r="' + rr.toFixed(1) + '" fill="' + S(gi) + '" fill-opacity="' + (o.bubble ? '.6' : '.85') + '" stroke="var(--surface)" stroke-width="1.5"' + tip(p.label, [[o.xlabel || 'X', fmt(p.x, o.xfmt)], [o.ylabel || 'Y', fmt(p.y, o.yfmt)]].concat(isNum(p.s) ? [[o.slabel || 'Boyut', fmt(p.s, o.sfmt)]] : []).concat(p.g ? [['Grup', p.g]] : [])) + ' tabindex="0"/>'; if (o.labels) h += txt(X(p.x) + rr + 2, Y(p.y) + 3, trunc(p.label, 14), 'vt vax'); });
    return h + '</svg>' + (groups.length > 1 && groups[0] != null ? legendHTML(groups.map(g => ({ name: g })), { legend: 'bottom' }) : '');
  }
  /* ---------- Harita (kabarcık) ---------- */
  const TR = [[26.0, 41.9], [28.0, 42.0], [29.1, 41.2], [31.2, 41.1], [33.3, 42.0], [35.2, 42.0], [38.3, 40.9], [40.1, 41.0], [41.5, 41.5], [42.8, 41.6], [43.6, 41.1], [43.5, 40.0], [44.8, 39.7], [44.3, 38.4], [44.8, 37.2], [42.4, 37.1], [40.7, 37.1], [38.2, 36.9], [36.7, 36.8], [36.2, 36.0], [35.8, 36.8], [34.6, 36.8], [33.5, 36.1], [32.0, 36.2], [30.5, 36.3], [29.2, 36.6], [28.0, 36.8], [27.3, 37.4], [26.3, 38.2], [26.6, 39.4], [26.1, 40.0], [26.0, 40.6]];
  function map(pts, o) {
    o = o || {}; const W = o.W || 460, H = Math.round(W * 0.48); const lon0 = 25.5, lon1 = 45.2, lat0 = 35.6, lat1 = 42.4; const X = l => (l - lon0) / (lon1 - lon0) * W, Y = l => H - (l - lat0) / (lat1 - lat0) * H;
    const vmax = Math.max(...pts.map(p => p.v).filter(isNum), 1);
    let h = svgOpen(W, H, o.label) + '<path d="M' + TR.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('L') + 'Z" class="vmap"/>';
    pts.slice().sort((a, b) => b.v - a.v).forEach(p => { if (!p.ll || !isNum(p.v)) return; const r = 4 + Math.sqrt(p.v / vmax) * (o.maxR || 24); h += '<circle class="vmark' + selCls(o, p.i) + '" data-i="' + p.i + '" cx="' + X(p.ll[1]).toFixed(1) + '" cy="' + Y(p.ll[0]).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="var(--s1)" fill-opacity=".55" stroke="var(--s1)" stroke-width="1.2"' + tip(p.label, [[o.vlabel || 'Değer', fmt(p.v, o.fmt)]].concat(p.extra || [])) + ' tabindex="0"/>' + (o.labels !== false && r > 9 ? txt(X(p.ll[1]), Y(p.ll[0]) - r - 3, p.label, 'vt vax', 'middle') : ''); });
    return h + '</svg>';
  }
  /* ---------- Ayrıştırma ağacı ---------- */
  function decomp(levels, o) {
    // levels: [{title, items:[{c, v, open}]}]
    o = o || {}; const colW = Math.max(150, Math.min(210, (o.W || 640) / Math.max(1, levels.length) - 8)); const rowH = 30;
    const maxRows = Math.max(...levels.map(l => l.items.length), 1); const W = levels.length * (colW + 28), H = 28 + maxRows * rowH;
    let h = svgOpen(W, H, o.label); let prevY = null;
    levels.forEach((L, li) => { const x0 = li * (colW + 28); const mx = Math.max(...L.items.map(i => i.v || 0), 1); h += txt(x0, 14, L.title, 'vt vcat');
      L.items.forEach((it, k) => { const y = 24 + k * rowH; const w = Math.max(2, (it.v || 0) / mx * (colW - 70)); h += '<g class="vmark dnode' + (it.open ? ' sel' : '') + '" data-lvl="' + li + '" data-k="' + k + '" tabindex="0"' + tip(it.c, [['Değer', fmt(it.v, o.fmt)]]) + '><rect x="' + x0 + '" y="' + y + '" width="' + colW + '" height="' + (rowH - 6) + '" fill="transparent"/>' + txt(x0, y + 10, trunc(it.c, 22), 'vt vax') + '<rect x="' + x0 + '" y="' + (y + 13) + '" width="' + w.toFixed(1) + '" height="8" rx="2" fill="' + (it.open ? 'var(--s2)' : 'var(--s1)') + '"/>' + txt(x0 + w + 6, y + 21, fmt(it.v, o.fmt, true), 'vt vlab') + '</g>'; if (it.open && li < levels.length - 1) prevY = { x: x0 + colW, y: y + 17, li }; });
      if (li > 0 && levels[li - 1].items.some(i => i.open)) { const pk = levels[li - 1].items.findIndex(i => i.open); const py = 24 + pk * rowH + 17, px = x0 - 28 + 4; L.items.forEach((it, k) => { const y = 24 + k * rowH + 17; h += '<path d="M' + (px - 4) + ',' + py + ' C' + (px + 10) + ',' + py + ' ' + (px + 10) + ',' + y + ' ' + (x0 - 4) + ',' + y + '" class="dlink"/>'; }); }
    });
    return h + '</svg>';
  }
  /* ---------- Tablo / matris ---------- */
  function table(cols, rows, o) {
    o = o || {}; const fmts = o.fmts || [];
    const numCols = cols.map((c, j) => rows.some(r => isNum(r[j])));
    const ranges = cols.map((c, j) => { const v = rows.map(r => r[j]).filter(isNum); return v.length ? [Math.min(...v), Math.max(...v)] : null; });
    const cell = (v, j) => { if (typeof v === 'string' && v.startsWith('data:image/svg')) return '<img class="svgm" alt="" src="' + v.replace(/"/g, '&quot;') + '">'; if (typeof v === 'string' && v.startsWith('<svg')) return v; return esc(fmt(v, fmts[j], o.short, o.units)); };
    let h = '<div class="vtable' + (o.banded ? ' banded' : '') + (o.compact ? ' compact' : '') + '"><table><thead><tr>' + cols.map((c, j) => '<th' + (numCols[j] ? ' class="nc"' : '') + '>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>';
    rows.forEach((r, i) => { h += '<tr class="vmark' + selCls(o, i) + '" data-i="' + i + '"' + (o.tipRows ? tip(r[0], o.tipRows(i)) : '') + '>' + r.map((v, j) => { let style = ''; let inner = cell(v, j); const cf = o.cf && o.cf[j];
      if (cf && isNum(v) && ranges[j]) { const [a, b] = ranges[j]; const t = b > a ? (v - a) / (b - a) : 1;
        if (cf === 'bar') inner = '<span class="cfbar"><i style="width:' + Math.max(2, t * 100).toFixed(0) + '%"></i></span>' + inner;
        if (cf === 'heat' && b > a) style = ' style="background:color-mix(in srgb, var(--s1) ' + Math.round(6 + t * 50) + '%, transparent)"';
        if (cf === 'diverge') { const mid = isNum(o.cfMid) ? o.cfMid : 0; const tt = v >= mid ? Math.min(1, (v - mid) / ((b - mid) || 1)) : Math.min(1, (mid - v) / ((mid - a) || 1)); style = ' style="background:color-mix(in srgb, var(' + (v >= mid ? '--ok' : '--err') + ') ' + Math.round(6 + tt * 38) + '%, transparent)"'; }
        if (cf === 'icon') { const tg = isNum(o.cfTarget) ? o.cfTarget : 0; inner = '<span class="cfi ' + (v >= tg ? 'ok' : 'bad') + '">' + (v >= tg ? '▲' : '▼') + '</span>' + inner; } }
      return '<td' + (numCols[j] ? ' class="nc"' : '') + style + '>' + inner + '</td>'; }).join('') + '</tr>'; });
    if (o.total && o.totals !== false) h += '<tr class="tot">' + o.total.map((v, j) => '<td' + (numCols[j] ? ' class="nc"' : '') + '>' + (j === 0 && typeof v === 'string' ? esc(v) : cell(v, j)) + '</td>').join('') + '</tr>';
    return h + '</tbody></table></div>';
  }
  /* ---------- Dilimleyici ---------- */
  function slicer(id, label, values, selected, o) {
    o = o || {}; const style = o.style || 'tile';
    if (style === 'dropdown') return '<div class="slicer"><span class="eyebrow">' + esc(label) + '</span><select class="sl-dd" data-slicer-dd="' + esc(id) + '" aria-label="' + esc(label) + '"><option value="">Tümü</option>' + values.map(v => '<option value="' + esc(JSON.stringify(v)) + '"' + (selected && selected.length === 1 && selected[0] === v ? ' selected' : '') + '>' + esc(fmt(v)) + '</option>').join('') + '</select></div>';
    if (style === 'list') return '<div class="slicer"><span class="eyebrow">' + esc(label) + '</span><div class="sl-list">' + values.map(v => '<label><input type="checkbox" data-slicer="' + esc(id) + '" data-v="' + esc(JSON.stringify(v)) + '"' + (selected && selected.includes(v) ? ' checked' : '') + '> ' + esc(fmt(v)) + '</label>').join('') + '</div></div>';
    return '<div class="slicer"><span class="eyebrow">' + esc(label) + '</span><div class="sl-opts">' + values.map(v => '<button data-slicer="' + esc(id) + '" data-v="' + esc(JSON.stringify(v)) + '" aria-pressed="' + (!!(selected && selected.some(s => s === v))) + '">' + esc(o.fmtv ? o.fmtv(v) : fmt(v)) + '</button>').join('') + '</div></div>';
  }
  /* Küçük örnek resimler (görsel galerisi kartları için) */
  function thumb(type) {
    const g = 'var(--s1)', o2 = 'var(--s2)', a3 = 'var(--s3)';
    const b = (s) => '<svg viewBox="0 0 80 50" class="vthumb" aria-hidden="true">' + s + '</svg>';
    switch (type) {
      case 'column': return b('<rect x="8" y="22" width="10" height="24" rx="2" fill="' + g + '"/><rect x="24" y="12" width="10" height="34" rx="2" fill="' + g + '"/><rect x="40" y="28" width="10" height="18" rx="2" fill="' + g + '"/><rect x="56" y="6" width="10" height="40" rx="2" fill="' + g + '"/>');
      case 'bar': return b('<rect x="6" y="6" width="62" height="8" rx="2" fill="' + g + '"/><rect x="6" y="18" width="46" height="8" rx="2" fill="' + g + '"/><rect x="6" y="30" width="30" height="8" rx="2" fill="' + g + '"/><rect x="6" y="42" width="16" height="6" rx="2" fill="' + g + '"/>');
      case 'line': return b('<path d="M4 40 L20 30 L36 34 L52 16 L76 10" stroke="' + g + '" stroke-width="2.5" fill="none"/><path d="M4 44 L20 38 L36 40 L52 30 L76 26" stroke="' + o2 + '" stroke-width="2" fill="none" stroke-dasharray="4 3"/>');
      case 'area': return b('<path d="M4 40 L20 30 L36 34 L52 16 L76 10 L76 48 L4 48Z" fill="' + g + '" opacity=".25"/><path d="M4 40 L20 30 L36 34 L52 16 L76 10" stroke="' + g + '" stroke-width="2.5" fill="none"/>');
      case 'donut': return b('<circle cx="40" cy="25" r="17" fill="none" stroke="' + g + '" stroke-width="9" stroke-dasharray="55 107"/><circle cx="40" cy="25" r="17" fill="none" stroke="' + o2 + '" stroke-width="9" stroke-dasharray="30 107" stroke-dashoffset="-56"/><circle cx="40" cy="25" r="17" fill="none" stroke="' + a3 + '" stroke-width="9" stroke-dasharray="20 107" stroke-dashoffset="-87"/>');
      case 'card': return b('<text x="40" y="28" text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)">1,2 Mn</text><text x="40" y="42" text-anchor="middle" font-size="7" fill="var(--muted)">Net Satış</text>');
      case 'kpi': return b('<text x="40" y="24" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">747 B</text><rect x="20" y="31" width="40" height="11" rx="5.5" fill="var(--ok-soft)"/><text x="40" y="39.5" text-anchor="middle" font-size="7" fill="var(--ok)">▲ +4%</text>');
      case 'gauge': return b('<path d="M14 42 A26 26 0 0 1 66 42" stroke="var(--grid)" stroke-width="9" fill="none"/><path d="M14 42 A26 26 0 0 1 56 22" stroke="' + g + '" stroke-width="9" fill="none"/><line x1="60" y1="20" x2="66" y2="14" stroke="var(--ink)" stroke-width="2"/>');
      case 'combo': return b('<rect x="8" y="24" width="10" height="22" rx="2" fill="' + g + '"/><rect x="24" y="16" width="10" height="30" rx="2" fill="' + g + '"/><rect x="40" y="26" width="10" height="20" rx="2" fill="' + g + '"/><rect x="56" y="10" width="10" height="36" rx="2" fill="' + g + '"/><path d="M13 20 L29 18 L45 20 L61 14" stroke="' + o2 + '" stroke-width="2.5" fill="none"/>');
      case 'stacked': return b('<rect x="8" y="22" width="12" height="12" fill="' + g + '"/><rect x="8" y="35" width="12" height="11" fill="' + o2 + '"/><rect x="26" y="10" width="12" height="20" fill="' + g + '"/><rect x="26" y="31" width="12" height="15" fill="' + o2 + '"/><rect x="44" y="26" width="12" height="10" fill="' + g + '"/><rect x="44" y="37" width="12" height="9" fill="' + o2 + '"/><rect x="62" y="6" width="12" height="22" fill="' + g + '"/><rect x="62" y="29" width="12" height="17" fill="' + o2 + '"/>');
      case 'pct': return b('<rect x="6" y="6" width="40" height="9" fill="' + g + '"/><rect x="47" y="6" width="27" height="9" fill="' + o2 + '"/><rect x="6" y="20" width="26" height="9" fill="' + g + '"/><rect x="33" y="20" width="41" height="9" fill="' + o2 + '"/><rect x="6" y="34" width="52" height="9" fill="' + g + '"/><rect x="59" y="34" width="15" height="9" fill="' + o2 + '"/>');
      case 'waterfall': return b('<rect x="6" y="20" width="10" height="26" fill="' + g + '"/><rect x="20" y="12" width="10" height="8" fill="var(--ok)"/><rect x="34" y="12" width="10" height="12" fill="var(--err)"/><rect x="48" y="6" width="10" height="18" fill="var(--ok)"/><rect x="62" y="6" width="10" height="40" fill="' + g + '"/>');
      case 'funnel': return b('<rect x="6" y="4" width="68" height="9" rx="2" fill="' + g + '"/><rect x="16" y="16" width="48" height="9" rx="2" fill="' + g + '" opacity=".85"/><rect x="24" y="28" width="32" height="9" rx="2" fill="' + g + '" opacity=".7"/><rect x="32" y="40" width="16" height="8" rx="2" fill="' + g + '" opacity=".55"/>');
      case 'treemap': return b('<rect x="4" y="4" width="40" height="42" rx="2" fill="' + g + '"/><rect x="46" y="4" width="30" height="24" rx="2" fill="' + o2 + '"/><rect x="46" y="30" width="16" height="16" rx="2" fill="' + a3 + '"/><rect x="64" y="30" width="12" height="16" rx="2" fill="var(--s4)"/>');
      case 'scatter': return b('<circle cx="14" cy="36" r="3.5" fill="' + g + '"/><circle cx="26" cy="28" r="3.5" fill="' + g + '"/><circle cx="36" cy="32" r="3.5" fill="' + o2 + '"/><circle cx="48" cy="18" r="3.5" fill="' + g + '"/><circle cx="60" cy="22" r="3.5" fill="' + o2 + '"/><circle cx="70" cy="10" r="3.5" fill="' + g + '"/>');
      case 'table': return b('<rect x="4" y="5" width="72" height="8" fill="var(--grid)"/><g stroke="var(--line)"><line x1="4" y1="22" x2="76" y2="22"/><line x1="4" y1="31" x2="76" y2="31"/><line x1="4" y1="40" x2="76" y2="40"/></g><rect x="44" y="15" width="22" height="5" fill="' + g + '"/><rect x="44" y="24" width="14" height="5" fill="' + g + '"/><rect x="44" y="33" width="28" height="5" fill="' + g + '"/>');
      case 'matrix': return b('<g>' + [0, 1, 2].map(r => [0, 1, 2, 3].map(c => '<rect x="' + (6 + c * 18) + '" y="' + (6 + r * 14) + '" width="16" height="12" fill="' + g + '" opacity="' + (0.2 + ((r * 4 + c) * 37 % 80) / 100) + '"/>').join('')).join('') + '</g>');
      case 'slicer': return b('<rect x="6" y="6" width="30" height="12" rx="6" fill="var(--ink)"/><rect x="40" y="6" width="34" height="12" rx="6" fill="none" stroke="var(--line)"/><rect x="6" y="24" width="34" height="12" rx="6" fill="none" stroke="var(--line)"/><rect x="44" y="24" width="28" height="12" rx="6" fill="var(--ink)"/>');
      case 'map': return b('<path d="M6 30 Q14 18 26 22 T46 18 T74 24 L70 38 Q56 44 40 40 T10 40Z" fill="var(--grid)"/><circle cx="22" cy="28" r="6" fill="' + g + '" opacity=".8"/><circle cx="44" cy="30" r="4" fill="' + g + '" opacity=".8"/><circle cx="62" cy="30" r="3" fill="' + g + '" opacity=".8"/>');
      case 'ribbon': return b('<path d="M8 40 C24 40 24 20 40 20 S56 30 72 30" stroke="' + g + '" stroke-width="8" fill="none" opacity=".8"/><path d="M8 20 C24 20 24 38 40 38 S56 14 72 14" stroke="' + o2 + '" stroke-width="8" fill="none" opacity=".8"/>');
      case 'decomp': return b('<rect x="4" y="20" width="16" height="8" rx="2" fill="' + g + '"/><path d="M20 24 L30 12 M20 24 L30 24 M20 24 L30 36" stroke="var(--muted)" fill="none"/><rect x="30" y="8" width="18" height="7" rx="2" fill="' + g + '"/><rect x="30" y="21" width="12" height="7" rx="2" fill="' + g + '"/><rect x="30" y="33" width="8" height="7" rx="2" fill="' + g + '"/><path d="M48 12 L58 12" stroke="var(--muted)"/><rect x="58" y="8" width="16" height="7" rx="2" fill="' + o2 + '"/>');
      case 'bullet': return b('<rect x="6" y="8" width="68" height="10" fill="var(--grid)"/><rect x="6" y="11" width="50" height="4" fill="' + g + '"/><line x1="60" x2="60" y1="6" y2="20" stroke="var(--ink)" stroke-width="2"/><rect x="6" y="28" width="68" height="10" fill="var(--grid)"/><rect x="6" y="31" width="34" height="4" fill="' + o2 + '"/><line x1="52" x2="52" y1="26" y2="40" stroke="var(--ink)" stroke-width="2"/>');
      case 'pareto': return b('<rect x="6" y="10" width="10" height="36" fill="' + g + '"/><rect x="20" y="22" width="10" height="24" fill="' + g + '"/><rect x="34" y="30" width="10" height="16" fill="' + g + '"/><rect x="48" y="36" width="10" height="10" fill="' + g + '"/><rect x="62" y="40" width="10" height="6" fill="' + g + '"/><path d="M11 28 L25 16 L39 10 L53 7 L67 5" stroke="' + o2 + '" stroke-width="2.5" fill="none"/>');
      case 'qa': return b('<rect x="6" y="8" width="68" height="12" rx="6" fill="none" stroke="var(--line)"/><text x="12" y="17" font-size="7" fill="var(--muted)">kategoriye göre satış</text><rect x="10" y="28" width="12" height="16" fill="' + g + '"/><rect x="26" y="34" width="12" height="10" fill="' + g + '"/><rect x="42" y="24" width="12" height="20" fill="' + g + '"/>');
    }
    return b('');
  }


  /* ---------- Yığılmış alan ---------- */
  function area(d, o) {
    o = Object.assign({ grid: true, legend: 'top' }, o || {}); o.fmt = d.fmt;
    const W = o.W || 420, H = o.H || 240, padL = 54, padR = 14, padT = 14, padB = 34; const cats = d.cats, n = cats.length;
    const cum = []; let acc = cats.map(() => 0); d.series.forEach(s => { const lo = acc.slice(); acc = acc.map((a, i) => a + (isNum(s.vals[i]) ? s.vals[i] : 0)); cum.push([lo, acc.slice()]); });
    if (o.pct) { const tot = acc.slice(); cum.forEach(c => { c[0] = c[0].map((v, i) => tot[i] ? v / tot[i] : 0); c[1] = c[1].map((v, i) => tot[i] ? v / tot[i] : 0); }); }
    const mx0 = o.pct ? 1 : Math.max(...acc, 1); const ticks = niceTicks(0, mx0, 4); const mx = ticks[ticks.length - 1];
    const iw = W - padL - padR, ih = H - padT - padB; const X = i => padL + (n > 1 ? i * iw / (n - 1) : iw / 2), Y = v => padT + ih - v / mx * ih;
    let h = svgOpen(W, H, o.label);
    ticks.forEach(t => { h += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + Y(t).toFixed(1) + '" y2="' + Y(t).toFixed(1) + '" class="' + (t === 0 ? 'vbase' : 'vgrid') + '"/>' + txt(padL - 6, Y(t) + 3.5, o.pct ? Math.round(t * 100) + '%' : fmt(t, d.fmt, true), 'vt vax', 'end'); });
    const every = Math.ceil(n / Math.max(1, Math.floor(iw / 42))); cats.forEach((c, i) => { if (i % every === 0) h += txt(X(i), H - padB + 16, trunc(c, 8), 'vt vcat', 'middle'); });
    cum.forEach(([lo, hi], k) => { const col = d.series[k].color || S(k); let p = 'M' + X(0).toFixed(1) + ',' + Y(hi[0]).toFixed(1); for (let i = 1; i < n; i++) p += 'L' + X(i).toFixed(1) + ',' + Y(hi[i]).toFixed(1); for (let i = n - 1; i >= 0; i--) p += 'L' + X(i).toFixed(1) + ',' + Y(lo[i]).toFixed(1); h += '<path d="' + p + 'Z" fill="' + col + '" opacity=".78" stroke="var(--surface)" stroke-width="1"/>'; });
    cats.forEach((c, i) => { const w = n > 1 ? iw / (n - 1) : iw; h += '<g class="vmark vcol' + selCls(o, i) + '" data-i="' + i + '"' + tip(c, d.series.map(s => [s.name, fmt(s.vals[i], d.fmt)])) + '><rect x="' + (X(i) - w / 2).toFixed(1) + '" y="' + padT + '" width="' + w.toFixed(1) + '" height="' + ih + '" fill="transparent"/><line x1="' + X(i).toFixed(1) + '" x2="' + X(i).toFixed(1) + '" y1="' + padT + '" y2="' + (padT + ih) + '" class="vcross"/></g>'; });
    return withLegend(h + '</svg>', d.series, o);
  }
  /* ---------- Küçük katlar (aynı ölçek, çok panel) ---------- */
  function multiples(d, o) {
    o = o || {}; const W = o.W || 420, cols = o.cols || (W > 640 ? 4 : W > 420 ? 3 : 2), pw = Math.floor((W - (cols - 1) * 10) / cols), ph = o.PH || 92;
    const all = d.panels.flatMap(p => p.vals.filter(isNum)); const mx = Math.max(...all, 1), mn = Math.min(0, ...all);
    return '<div class="smm" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' + d.panels.map((p, k) => { const n = p.vals.length; const X = i => 4 + (n > 1 ? i * (pw - 8) / (n - 1) : (pw - 8) / 2), Y = v => 6 + (ph - 22) * (1 - (v - mn) / (mx - mn || 1));
      let path = ''; p.vals.forEach((v, i) => { if (isNum(v)) path += (path ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1); });
      const last = p.vals.filter(isNum).slice(-1)[0], tot = p.vals.filter(isNum).reduce((a, b) => a + b, 0);
      let svg = '<svg viewBox="0 0 ' + pw + ' ' + ph + '" width="100%" role="img" aria-label="' + esc(p.title) + '">' + (o.kind === 'column' ? p.vals.map((v, i) => isNum(v) ? '<rect x="' + (X(i) - (pw - 8) / n / 2 + 1).toFixed(1) + '" y="' + Y(Math.max(v, 0)).toFixed(1) + '" width="' + Math.max(1, (pw - 8) / n - 2).toFixed(1) + '" height="' + Math.abs(Y(v) - Y(0)).toFixed(1) + '" fill="' + (p.color || S(o.ci || 0)) + '" rx="1"/>' : '').join('') : '<path d="' + path + 'L' + X(n - 1).toFixed(1) + ',' + Y(mn).toFixed(1) + 'L' + X(0).toFixed(1) + ',' + Y(mn).toFixed(1) + 'Z" fill="' + (p.color || S(o.ci || 0)) + '" opacity=".14"/><path d="' + path + '" fill="none" stroke="' + (p.color || S(o.ci || 0)) + '" stroke-width="1.8"/>') + '</svg>';
      return '<div class="smp vmark' + selCls(o, k) + '" data-i="' + k + '"' + tip(p.title, [[o.totLabel || 'Toplam', fmt(tot, d.fmt)], ['Son', fmt(last, d.fmt)]]) + '><div class="smh"><b>' + esc(trunc(p.title, 18)) + '</b><span>' + esc(fmt(o.showLast ? last : tot, d.fmt, true)) + '</span></div>' + svg + '</div>'; }).join('') + '</div>';
  }
  /* ---------- Takvim ısı haritası ---------- */
  function calendar(d, o) {
    o = o || {}; const days = d.days.filter(x => x.date instanceof Date); if (!days.length) return '';
    const W = o.W || 420, first = days[0].date, y0 = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate()); const dow = x => (x.getUTCDay() + 6) % 7;
    const start = y0 - dow(first) * 864e5; const weeks = Math.ceil((days[days.length - 1].date - start) / 864e5 / 7) + 1; const cell = Math.max(6, Math.min(16, Math.floor((W - 30) / weeks) - 1)); const H = 7 * (cell + 1) + 22;
    const vs = days.map(x => x.v).filter(isNum), mx = Math.max(...vs, 1);
    let h = svgOpen(30 + weeks * (cell + 1), H, o.label); ['Pzt', 'Çar', 'Cum'].forEach((s, k) => { h += txt(0, 18 + (k * 2) * (cell + 1) + cell * .8, s, 'vt vax'); });
    let lastM = -1; days.forEach(x => { const wk = Math.floor((x.date - start) / 864e5 / 7), dy = dow(x.date); const m = x.date.getUTCMonth(); if (m !== lastM && x.date.getUTCDate() <= 7) { h += txt(30 + wk * (cell + 1), 9, ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][m], 'vt vax'); lastM = m; }
      const t = isNum(x.v) && x.v > 0 ? x.v / mx : 0; h += '<rect x="' + (30 + wk * (cell + 1)) + '" y="' + (14 + dy * (cell + 1)) + '" width="' + cell + '" height="' + cell + '" rx="2" fill="' + (t ? 'color-mix(in srgb, ' + (o.color || 'var(--s1)') + ' ' + Math.round(15 + t * 85) + '%, var(--surface-2))' : 'var(--surface-2)') + '"' + tip(x.date.toISOString().slice(0, 10), [[o.vlabel || 'Değer', fmt(x.v, d.fmt)]]) + '/>'; });
    return h + '</svg>';
  }
  /* ---------- IBCS sapma çubukları: gerçekleşen (AC) ve karşılaştırma (PY/BU) farkı ---------- */
  function variance(rows, o) {
    o = o || {}; const W = o.W || 420, rowH = 26, padL = Math.min(150, Math.max(80, W * .26)), mid = padL + (W - padL) * .5, H = rows.length * rowH + 24;
    const d = rows.map(r => isNum(r.ac) && isNum(r.ref) ? r.ac - r.ref : null), pc = rows.map((r, i) => d[i] != null && r.ref ? d[i] / Math.abs(r.ref) : null);
    const useP = o.mode === 'pct'; const vv = (useP ? pc : d).filter(isNum); const mx = Math.max(...vv.map(Math.abs), 1e-9); const half = (W - padL) * .5 - 58;
    let h = svgOpen(W, H, o.label) + '<line x1="' + mid + '" x2="' + mid + '" y1="4" y2="' + (H - 18) + '" class="vbase"/>' + txt(mid, H - 4, (useP ? 'Δ% ' : 'Δ ') + (o.refLabel || 'GY'), 'vt vax', 'middle');
    rows.forEach((r, i) => { const v = (useP ? pc : d)[i], y = 6 + i * rowH; const good = v == null ? null : (o.invert ? v <= 0 : v >= 0); const w = v == null ? 0 : Math.abs(v) / mx * half;
      h += '<g class="vmark' + selCls(o, i) + '" data-i="' + i + '"' + tip(r.cat, [['Gerçekleşen', fmt(r.ac, o.fmt)], [o.refLabel || 'Karşılaştırma', fmt(r.ref, o.fmt)], ['Fark', fmt(d[i], o.fmt)], ['Fark %', pc[i] == null ? '—' : (pc[i] >= 0 ? '+' : '−') + Math.abs(Math.round(pc[i] * 1000) / 10).toLocaleString('tr-TR') + '%']]) + '>' + txt(padL - 8, y + rowH / 2 + 3, trunc(r.cat, Math.floor(padL / 7)), 'vt vcat', 'end') + (v == null ? '' : '<rect x="' + (v >= 0 ? mid : mid - w).toFixed(1) + '" y="' + (y + 5) + '" width="' + Math.max(1, w).toFixed(1) + '" height="' + (rowH - 10) + '" fill="' + (good ? 'var(--ok)' : 'var(--err)') + '"/>' + txt(v >= 0 ? mid + w + 4 : mid - w - 4, y + rowH / 2 + 3, useP ? (v >= 0 ? '+' : '−') + Math.abs(Math.round(v * 1000) / 10).toLocaleString('tr-TR') + '%' : (v >= 0 ? '+' : '') + fmt(v, o.fmt, true), 'vt vlab', v >= 0 ? 'start' : 'end')) + '</g>'; });
    return h + '</svg>';
  }
  /* ---------- Kâr-zarar tablosu (P&L): alt toplamlar, sapma ve mini çubuk ---------- */
  function pnl(rows, o) {
    o = o || {}; const mx = Math.max(...rows.map(r => isNum(r.ac) && isNum(r.ref) ? Math.abs(r.ac - r.ref) : 0), 1);
    return '<div class="vtable pnl"><table><thead><tr><th>' + esc(o.head || 'Kalem') + '</th><th class="nc">' + esc(o.acLabel || 'Gerçekleşen') + '</th><th class="nc">' + esc(o.refLabel || 'Bütçe') + '</th><th class="nc">Δ</th><th class="nc">Δ%</th><th>Sapma</th></tr></thead><tbody>' + rows.map((r, i) => { const dv = isNum(r.ac) && isNum(r.ref) ? r.ac - r.ref : null; const good = dv == null ? null : (r.cost ? dv <= 0 : dv >= 0); const w = dv == null ? 0 : Math.abs(dv) / mx * 50;
      return '<tr class="vmark lv' + (r.level || 0) + (r.kind ? ' ' + r.kind : '') + selCls(o, i) + '" data-i="' + i + '"><td>' + esc(r.label) + '</td><td class="nc">' + esc(fmt(r.ac, o.fmt, o.short)) + '</td><td class="nc">' + esc(fmt(r.ref, o.fmt, o.short)) + '</td><td class="nc ' + (good == null ? '' : good ? 'okc' : 'badc') + '">' + (dv == null ? '—' : (dv >= 0 ? '+' : '') + esc(fmt(dv, o.fmt, o.short))) + '</td><td class="nc ' + (good == null ? '' : good ? 'okc' : 'badc') + '">' + (dv == null || !r.ref ? '—' : (dv >= 0 ? '+' : '−') + Math.abs(Math.round(dv / Math.abs(r.ref) * 1000) / 10).toLocaleString('tr-TR') + '%') + '</td><td><span class="pbar"><i style="' + (dv >= 0 ? 'left:50%' : 'right:50%') + ';width:' + w.toFixed(1) + '%;background:' + (good ? 'var(--ok)' : 'var(--err)') + '"></i></span></td></tr>'; }).join('') + '</tbody></table></div>';
  }
  /* ---------- Zengin KPI kartı: simge, değer, fark rozeti, mini grafik ---------- */
  function kpicard(o) {
    const up = isNum(o.delta) ? (o.invert ? o.delta <= 0 : o.delta >= 0) : null;
    return '<div class="kpic">' + (o.icon ? '<span class="kic" aria-hidden="true">' + o.icon + '</span>' : '') + '<span class="kv">' + esc(fmt(o.v, o.fmt, true)) + '</span>' + (isNum(o.delta) ? '<span class="kd ' + (up ? 'up' : 'dn') + '">' + (o.delta >= 0 ? '▲' : '▼') + ' ' + (o.deltaFmt === 'pp' ? (Math.abs(Math.round(o.delta * 1000) / 10)).toLocaleString('tr-TR') + ' puan' : (Math.abs(Math.round(o.delta * 1000) / 10)).toLocaleString('tr-TR') + '%') + ' ' + esc(o.dlabel || '') + '</span>' : '') + (o.spark ? spark(o.spark, { W: o.W || 180, H: 34, area: true }) : '') + (o.sub ? '<span class="ks">' + esc(o.sub) + '</span>' : '') + '</div>';
  }
  /* ---------- Dambıl: iki dönem arasındaki değişim ---------- */
  function dumbbell(rows, o) {
    o = o || {}; const W = o.W || 420, rowH = 24, padL = Math.min(140, W * .28), padR = 50, H = rows.length * rowH + 26;
    const all = rows.flatMap(r => [r.a, r.b]).filter(isNum); const mx = Math.max(...all, 1), mn = Math.min(0, ...all); const X = v => padL + (v - mn) / (mx - mn) * (W - padL - padR);
    let h = svgOpen(W, H, o.label);
    rows.forEach((r, i) => { const y = 10 + i * rowH + rowH / 2; const up = r.b >= r.a; h += '<g class="vmark' + selCls(o, i) + '" data-i="' + i + '"' + tip(r.cat, [[o.aLabel || 'Önce', fmt(r.a, o.fmt)], [o.bLabel || 'Sonra', fmt(r.b, o.fmt)]]) + '>' + txt(padL - 8, y + 3.5, trunc(r.cat, Math.floor(padL / 7)), 'vt vcat', 'end') + '<line x1="' + X(r.a).toFixed(1) + '" x2="' + X(r.b).toFixed(1) + '" y1="' + y + '" y2="' + y + '" stroke="' + (up ? 'var(--ok)' : 'var(--err)') + '" stroke-width="3" opacity=".5"/><circle cx="' + X(r.a).toFixed(1) + '" cy="' + y + '" r="5" fill="var(--axis)"/><circle cx="' + X(r.b).toFixed(1) + '" cy="' + y + '" r="6" fill="' + (o.color || 'var(--s1)') + '"/>' + txt(Math.max(X(r.a), X(r.b)) + 10, y + 3.5, fmt(r.b, o.fmt, true), 'vt vlab') + '</g>'; });
    return h + txt(padL, H - 4, '● ' + (o.aLabel || 'Önce') + '   ● ' + (o.bLabel || 'Sonra'), 'vt vax') + '</svg>';
  }
  /* ---------- İlerleme listesi (hedefe göre, simgeli) ---------- */
  function progress(rows, o) {
    o = o || {}; return '<div class="prog">' + rows.map((r, i) => { const t = isNum(r.v) && isNum(r.target) && r.target ? r.v / r.target : null; return '<div class="prow vmark' + selCls(o, i) + '" data-i="' + i + '"' + tip(r.cat, [['Değer', fmt(r.v, o.fmt)], ['Hedef', fmt(r.target, o.fmt)], ['Gerçekleşme', t == null ? '—' : (Math.round(t * 1000) / 10).toLocaleString('tr-TR') + '%']]) + '><span class="pl">' + esc(r.cat) + '</span><span class="pb"><i style="width:' + Math.min(100, (t || 0) * 100).toFixed(1) + '%;background:' + (t == null ? 'var(--axis)' : t >= 1 ? 'var(--ok)' : t >= (o.warn || .9) ? 'var(--warn)' : 'var(--err)') + '"></i><u style="left:' + Math.min(100, 100 / Math.max(1, t || 1)).toFixed(1) + '%"></u></span><span class="pv">' + (t == null ? '—' : Math.round(t * 100) + '%') + '</span></div>'; }).join('') + '</div>';
  }


  /* ---------- Gantt: plan ve gerçekleşen çubukları, bugün çizgisi ---------- */
  function gantt(rows, o) {
    o = o || {}; const W = o.W || 420, rowH = 24, padL = Math.min(190, Math.max(110, W * .3)), padR = 12, padT = 22, H = rows.length * rowH + padT + 8;
    const ds = rows.flatMap(r => [r.start, r.end, r.actual].filter(x => x instanceof Date)); if (o.today) ds.push(o.today); const t0 = Math.min(...ds), t1 = Math.max(...ds); const X = d => padL + (d - t0) / ((t1 - t0) || 1) * (W - padL - padR);
    const col = st => ({ 'Tamamlandı': 'var(--ok)', 'Devam': 'var(--s1)', 'Gecikmede': 'var(--warn)', 'Riskli': 'var(--err)', 'Planlandı': 'var(--axis)' })[st] || 'var(--s1)';
    let h = svgOpen(W, H, o.label); const a = new Date(t0), b = new Date(t1);
    for (let y = a.getUTCFullYear(), m = a.getUTCMonth(); y * 12 + m <= b.getUTCFullYear() * 12 + b.getUTCMonth(); m++) { if (m > 11) { m = 0; y++; } const d = Date.UTC(y, m, 1); if (d < t0) continue; const x = X(d); h += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (padT - 4) + '" y2="' + (H - 6) + '" class="vgrid"/>'; if (m % (W > 600 ? 1 : 2) === 0) h += txt(x + 2, 12, ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][m] + (m === 0 ? ' ' + String(y).slice(2) : ''), 'vt vax'); }
    rows.forEach((r, i) => { const y = padT + i * rowH; const x1 = X(r.start), x2 = X(r.end); const p = isNum(r.progress) ? Math.max(0, Math.min(1, r.progress)) : null;
      h += '<g class="vmark' + selCls(o, i) + '" data-i="' + i + '"' + tip(r.label, [['Durum', r.status || '—'], ['Başlangıç', r.start.toISOString().slice(0, 10)], ['Plan bitiş', r.end.toISOString().slice(0, 10)], ['Gerçek bitiş', r.actual ? r.actual.toISOString().slice(0, 10) : '—'], ['İlerleme', p == null ? '—' : Math.round(p * 100) + '%']].concat(r.extra || [])) + '>' + txt(padL - 8, y + rowH / 2 + 3.5, trunc(r.label, Math.floor(padL / 6.4)), 'vt vcat', 'end') +
        '<rect x="' + x1.toFixed(1) + '" y="' + (y + 5) + '" width="' + Math.max(2, x2 - x1).toFixed(1) + '" height="' + (rowH - 10) + '" rx="3" fill="var(--surface-2)" stroke="' + col(r.status) + '"/>' + (p != null ? '<rect x="' + x1.toFixed(1) + '" y="' + (y + 5) + '" width="' + Math.max(1, (x2 - x1) * p).toFixed(1) + '" height="' + (rowH - 10) + '" rx="3" fill="' + col(r.status) + '" opacity=".85"/>' : '') + (r.actual && r.actual > r.end ? '<rect x="' + x2.toFixed(1) + '" y="' + (y + 9) + '" width="' + (X(r.actual) - x2).toFixed(1) + '" height="' + (rowH - 18) + '" fill="var(--err)" opacity=".6"/>' : '') + '</g>'; });
    if (o.today) { const x = X(o.today); h += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="' + (padT - 6) + '" y2="' + (H - 4) + '" class="ref ref-avg"/>' + txt(x + 3, padT - 8, o.todayLabel || 'Bugün', 'vt vref'); }
    return h + '</svg>';
  }
  /* ---------- Önemli etkileyenler: hedef olayın oranını kaç kat artıran etkenler ---------- */
  function influencers(rows, o) {
    o = o || {}; const mx = Math.max(...rows.map(r => r.lift || 0), 1);
    return '<div class="infl">' + (o.head ? '<p class="infh">' + esc(o.head) + '</p>' : '') + rows.map((r, i) => '<div class="infr vmark' + selCls(o, i) + '" data-i="' + i + '"' + tip(r.factor, [['Bu gruptaki oran', fmt(r.rate, 'yuzde')], ['Diğerlerinde', fmt(r.base, 'yuzde')], ['Kat', (Math.round(r.lift * 100) / 100).toLocaleString('tr-TR') + '×'], ['Satır sayısı', String(r.n || '—')]]) + '><span class="inf-f">' + esc(r.factor) + '</span><span class="inf-b"><i style="width:' + Math.max(4, r.lift / mx * 100).toFixed(0) + '%"></i></span><b>' + (Math.round(r.lift * 100) / 100).toLocaleString('tr-TR') + '×</b></div>').join('') + '</div>';
  }

  // araç ipucu (rapor sayfası araç ipucu benzetimi: d.x içinde mini rapor)
  let tipEl = null;
  function tipHTML(d) {
    let h = '<b>' + esc(d.h) + '</b>' + d.r.map(r => '<span><i>' + esc(r[0]) + '</i>' + esc(r[1]) + '</span>').join('');
    if (d.x) { h += '<div class="tpage"><div class="tpage-h">' + esc(d.x.title || 'Araç ipucu sayfası') + '</div>'; if (d.x.cards) h += '<div class="tcards">' + d.x.cards.map(c => '<div><small>' + esc(c[0]) + '</small><b>' + esc(c[1]) + '</b></div>').join('') + '</div>'; if (d.x.spark) h += spark(d.x.spark, { W: 210, H: 46, area: true }) + (d.x.sparkLabel ? '<small class="tsl">' + esc(d.x.sparkLabel) + '</small>' : ''); if (d.x.bars && d.x.bars.length) { const mx = Math.max(...d.x.bars.map(b => Math.abs(+b[1]) || 0), 1); h += (d.x.barsLabel ? '<small class="tsl">' + esc(d.x.barsLabel) + '</small>' : '') + '<div class="tbars">' + d.x.bars.map(b => '<div><span>' + esc(b[0]) + '</span><i style="width:' + Math.max(2, Math.abs(+b[1]) / mx * 100).toFixed(0) + '%' + (+b[1] < 0 ? ';background:var(--err)' : '') + '"></i><b>' + esc(b[2] != null ? b[2] : b[1]) + '</b></div>').join('') + '</div>'; } if (d.x.note) h += '<small class="tnote">' + esc(d.x.note) + '</small>'; h += '</div>'; }
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
  root.PBIViz = { gantt, influencers, area, multiples, calendar, variance, pnl, kpicard, dumbbell, progress, column, bar, line, donut, card, kpi, gauge, bullet, waterfall, funnel, treemap, scatter, map, decomp, table, slicer, spark, thumb, fmt, bindTips, esc, stats };
})(typeof window !== 'undefined' ? window : globalThis);
