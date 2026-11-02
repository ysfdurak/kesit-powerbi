/* PBIPatika — ders genişletme şablonu */
(function (W) {
'use strict';
const L = W.PBI_LESSONS = W.PBI_LESSONS || [];
const ext = (id, o) => { const l = L.find(x => x.id === id); if (!l) { if (W.console) console.warn('ext: ders yok', id); return; } if (o.html) l.body += '<section class="deep"><span class="eyebrow">Uzmanlaş</span>' + o.html + '</section>'; if (o.ex) l.ex = (l.ex || []).concat(o.ex); if (o.min) l.min += o.min; (W.PBI_EXT = W.PBI_EXT || []).push({ id, html: o.html || '', ex: o.ex || [] }); };

ext('baglam', { min: 5, html: `<h2>Deneme</h2><p>${'x'.repeat(1600)}</p><pre class="dax">T = SUM(Satislar[Tutar])</pre>`, ex: [
  { t: 'mc', q: 'Test sorusu bir?', o: ['aa', 'bbb', 'c'], a: 1, why: 'çünkü' },
  { t: 'dax', name: 'Deneme Ölçü X', q: 'görev', sol: 'SUM(Satislar[Tutar])', hint: 'h' }
] });
})(window);
