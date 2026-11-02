const {M, ev, q, rq} = require('./h.js');
console.log(q(['[Kanal Payı %]','[Net Satış]'], [{t:'Satislar',c:'Kanal'},{t:'Tarih',c:'Yil'}]));
console.log(q(['[Müşteri Sayısı]','[Net Satış]','[Ortalama İndirim %]', '[İndirimli Satış Payı %]'], {t:'Tarih',c:'Yil'}));
const y = (e, Y) => ev(`CALCULATE(${e}, Tarih[Yil] = ${Y})`);
const i23=y('[İade Oranı %]',2023), i24=y('[İade Oranı %]',2024), m23=y('[Kâr Marjı %]',2023), m24=y('[Kâr Marjı %]',2024);
console.log('iade pp', (i24-i23)*100, 'rel', i24/i23-1, 'marj pp', (m24-m23)*100, 'rel', m24/m23-1);
console.log('trunc', (599841.2-400000)/(457330.9-400000), 599841.2/457330.9);
try { console.log(rq(`EVALUATE
ADDCOLUMNS(
  DATATABLE("Firma", STRING, "Mesafe", STRING, "Gonderi", INTEGER, "Zamaninda", INTEGER,
    {{"A", "Yakın", 200, 180}, {"A", "Uzak", 600, 300}, {"B", "Yakın", 600, 510}, {"B", "Uzak", 200, 90}}),
  "Oran", DIVIDE([Zamaninda], [Gonderi]))`)); } catch(e){console.log('E1', e.message)}
try { console.log(rq(`DEFINE
VAR T = DATATABLE("Firma", STRING, "Mesafe", STRING, "Gonderi", INTEGER, "Zamaninda", INTEGER,
    {{"A", "Yakın", 200, 180}, {"A", "Uzak", 600, 300}, {"B", "Yakın", 600, 510}, {"B", "Uzak", 200, 90}})
EVALUATE
SUMMARIZE(T, [Firma], "Toplam Gönderi", SUM([Gonderi]), "Genel Oran", DIVIDE(SUM([Zamaninda]), SUM([Gonderi])))`)); } catch(e){console.log('E2', e.message)}
try { console.log(rq(`EVALUATE
VAR T = DATATABLE("Firma", STRING, "Gonderi", INTEGER, "Zamaninda", INTEGER, {{"A", 200, 180}, {"B", 600, 510}})
RETURN ADDCOLUMNS(T, "x", [Gonderi]*2)`)); } catch(e){console.log('E3', e.message)}
