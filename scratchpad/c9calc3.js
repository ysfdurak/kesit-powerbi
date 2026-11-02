global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const ev = (e) => { try { return X.evalMeasure(ms, e, []); } catch(x) { return 'ERR '+x.message; } };
const r3 = v => typeof v==='number'?Math.round(v*10000)/10000:v;
const q = (e, g) => { try { return X.query({ rows: [g], measures: ms, values: [e], totals: false, keepBlank:true }).rows.map(r => r.keys[0] + '=' + r3(r.vals[0])).join(' ; '); } catch(x) { return 'ERR '+x.message; } };
const E = {
 iadehar: 'VAR Gecerli = NOT Satislar[Durum] IN {"İptal", "İade"}\nRETURN 1',
 sepet2: 'DIVIDE(CALCULATE(SUM(Satislar[Tutar]), NOT Satislar[Durum] IN {"İptal", "İade"}), CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), NOT Satislar[Durum] IN {"İptal", "İade"}))',
 tuzak: 'CALCULATE([Ortalama Sepet], Satislar[Durum] <> "İade")',
 tuzakNet: 'CALCULATE([Net Satış], Satislar[Durum] <> "İade")',
 tuzakKeep: 'CALCULATE([Net Satış], KEEPFILTERS(Satislar[Durum] <> "İade"))',
 mobil: 'DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Mobil"), [Net Satış])',
 adet: 'DIVIDE([Satılan Adet], [Sipariş Sayısı])',
 basit: 'CALCULATE(AVERAGE(Satislar[Indirim]), Satislar[Durum] <> "İptal")',
 urunort: 'AVERAGEX(VALUES(Urunler[Urun]), [Net Satış])',
 ok: 'VAR B = [YoY %]\nRETURN IF(ISBLANK(B), BLANK(), IF(B >= 0, UNICHAR(9650), UNICHAR(9660)) & " " & FORMAT(B, "0.0%"))',
 ok2: 'VAR B = [YoY %]\nRETURN IF(ISBLANK(B), BLANK(), IF(B >= 0, UNICHAR(9650), UNICHAR(9660)) & " " & FORMAT(ABS(B), "0.0%"))',
 btn: 'IF(HASONEVALUE(Kategoriler[Kategori]), SELECTEDVALUE(Kategoriler[Kategori]) & " ayrıntısını aç", "Önce bir kategori seç")',
 renk: 'IF(HASONEVALUE(Kategoriler[Kategori]), "#2A78D6", "#C8C6C0")',
 mom: 'VAR D = [MoM %]\nRETURN SWITCH(TRUE(), ISBLANK(D), BLANK(), D > 0.05, UNICHAR(9650), D < -0.05, UNICHAR(9660), UNICHAR(9644))',
 sayi: 'VAR N = COUNTROWS(VALUES(Kategoriler[Kategori]))\nRETURN N & " kategori seçili"',
 isfilt: 'IF(ISFILTERED(Kategoriler[Kategori]), "Filtreli", "Tümü")',
};
for (const k in E) console.log(k, '| tot', r3(ev(E[k])), '| kat', q(E[k], {t:'Kategoriler',c:'Kategori'}), '| yil', q(E[k], {t:'Tarih',c:'Yil'}));
console.log('mom ay', q(E.mom, {t:'Tarih',c:'YilAy'}));
console.log(ev('UNICHAR(9644)'), ev('UNICHAR(9679)'), ev('UNICHAR(128994)'));
