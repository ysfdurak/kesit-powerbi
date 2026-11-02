const {M, ev, q, rq, X, ms} = require('./h.js');
const K = `DATATABLE("Rapor", STRING, "Kullanici", STRING, "Goruntuleme", INTEGER, {{"Satış Panosu", "ayse", 18}, {"Satış Panosu", "mert", 12}, {"Satış Panosu", "deniz", 9}, {"Satış Panosu", "selin", 7}, {"Satış Panosu", "burak", 4}, {"Stok Raporu", "ayse", 3}, {"Stok Raporu", "kerem", 6}, {"Bölge Raporu", "mert", 1}})`;
const S = [
`EVALUATE
VAR Kullanim = ${K}
RETURN ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Kullanim, "Rapor", [Rapor])), "Tekil Kullanıcı", VAR R = [Rapor] RETURN COUNTROWS(FILTER(Kullanim, [Rapor] = R)), "Görüntüleme", VAR R = [Rapor] RETURN SUMX(FILTER(Kullanim, [Rapor] = R), [Goruntuleme]))`,
`EVALUATE
VAR Kullanim = ${K}
VAR Lisans = 12
RETURN ROW("Aktif Kullanıcı", COUNTROWS(DISTINCT(SELECTCOLUMNS(Kullanim, "K", [Kullanici]))), "Benimseme %", DIVIDE(COUNTROWS(DISTINCT(SELECTCOLUMNS(Kullanim, "K", [Kullanici]))), Lisans))`,
`EVALUATE
VAR Kullanim = ${K}
VAR Envanter = DATATABLE("Rapor", STRING, {{"Satış Panosu"}, {"Stok Raporu"}, {"Bölge Raporu"}, {"Kampanya Raporu 2023"}, {"Kargo Raporu"}})
RETURN EXCEPT(Envanter, DISTINCT(SELECTCOLUMNS(Kullanim, "Rapor", [Rapor])))`,
`EVALUATE
VAR Kullanim = ${K}
RETURN FILTER(ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Kullanim, "Rapor", [Rapor])), "Tekil Kullanıcı", VAR R = [Rapor] RETURN COUNTROWS(FILTER(Kullanim, [Rapor] = R))), [Tekil Kullanıcı] < 2)`,
`EVALUATE
ADDCOLUMNS(VALUES(Satislar[Kanal]), "Ç1", CALCULATE([Net Satış], Tarih[YilCeyrek] = "2024-Ç1"), "Ç2", CALCULATE([Net Satış], Tarih[YilCeyrek] = "2024-Ç2"), "Ç2 iptal %", CALCULATE([İptal Oranı %], Tarih[YilCeyrek] = "2024-Ç2"))`,
`EVALUATE
VAR T = DATATABLE("Firma", STRING, "Mesafe", STRING, "Gonderi", INTEGER, "Zamaninda", INTEGER, {{"A", "Yakın", 200, 180}, {"A", "Uzak", 600, 300}, {"B", "Yakın", 600, 510}, {"B", "Uzak", 200, 90}})
RETURN ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(T, "Firma", [Firma])), "Gönderi", VAR F = [Firma] RETURN SUMX(FILTER(T, [Firma] = F), [Gonderi]), "Genel Oran", VAR F = [Firma] RETURN DIVIDE(SUMX(FILTER(T, [Firma] = F), [Zamaninda]), SUMX(FILTER(T, [Firma] = F), [Gonderi])))`,
];
S.forEach(s => { try { const r = rq(s); console.log(JSON.stringify(r)); } catch (e) { console.log('ERR', e.message); } });
const TO = `VAR Satis = [Net Satış]
VAR Hedef = [Hedef]
VAR GY = [Satış GY]
VAR Oran = DIVIDE(Satis, Hedef)
VAR Buyume = DIVIDE(Satis - GY, GY)
VAR Kanallar = ADDCOLUMNS(VALUES(Satislar[Kanal]), "Iptal", [İptal Oranı %])
VAR EnKotu = TOPN(1, Kanallar, [Iptal], DESC)
VAR Cumle1 = "Net satış " & FORMAT(Satis, "#,0") & " ₺; hedef gerçekleşmesi %" & FORMAT(Oran * 100, "0.0")
VAR Cumle2 = IF(ISBLANK(GY), ".", ", geçen yıla göre " & IF(Buyume >= 0, "+%", "-%") & FORMAT(ABS(Buyume) * 100, "0.0") & ".")
VAR Cumle3 = " En yüksek iptal oranı: " & MAXX(EnKotu, Satislar[Kanal]) & " (%" & FORMAT(MAXX(EnKotu, [Iptal]) * 100, "0.0") & ")."
RETURN CONCATENATE(Cumle1 & Cumle2, Cumle3)`;
console.log(ev('CALCULATE(' + 'VAR x = 1 RETURN 1' + ')'));
const ms2 = Object.assign({}, ms, {'Toplantı Özeti': {name:'Toplantı Özeti', expr: TO}});
console.log(X.evalMeasure(ms2, '[Toplantı Özeti]', []));
console.log(X.evalMeasure(ms2, 'CALCULATE([Toplantı Özeti], Tarih[YilCeyrek] = "2024-Ç2")', []));
console.log(X.evalMeasure(ms2, 'CALCULATE([Toplantı Özeti], Tarih[YilCeyrek] = "2024-Ç3")', []));
