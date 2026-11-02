global.window = global; const P = '/home/claude/pbi/';
for (const f of ['data','dax','measures']) require(P + f + '.js');
const X = PBI_DAX; const ms = {}; PBI_MEASURES.forEach(m => ms[m.name] = { name: m.name, expr: m.expr });
const ev = (e) => X.evalMeasure(ms, e, []);
const sorgu = s => X.runQuery(Object.assign({}, ms), s).rows;
const r = sorgu('EVALUATE\nFILTER(ADDCOLUMNS(VALUES(Urunler[Urun]), "M", [Kâr Marjı %], "I", [Ortalama İndirim %], "S", [Net Satış]), NOT ISBLANK([S]))');
const xs=r.map(a=>a[2]), ys=r.map(a=>a[1]); const n=xs.length, mx=xs.reduce((a,b)=>a+b)/n, my=ys.reduce((a,b)=>a+b)/n; let sxy=0,sxx=0,syy=0; for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;syy+=(ys[i]-my)**2;} console.log('n',n,'corr',sxy/Math.sqrt(sxx*syy));
for (const e of ['CALCULATE([Net Satış], Tarih[Yil]=2024)','CALCULATE([Sipariş Sayısı], Tarih[Yil]=2024)','CALCULATE([İptal Oranı %], Tarih[Yil]=2024)','CALCULATE([Hedef], Tarih[Yil]=2024)','CALCULATE([Müşteri Sayısı], Tarih[Yil]=2024)',
 'CALCULATE(DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Mobil"), [Net Satış]), Tarih[Yil]=2024)',
 'CALCULATE(DIVIDE([Satılan Adet], [Sipariş Sayısı]), Tarih[Yil]=2024)',
 'CALCULATE(DIVIDE(CALCULATE([Net Satış], Satislar[Durum] = "Teslim Edildi"), CALCULATE(DISTINCTCOUNT(Satislar[SiparisNo]), Satislar[Durum] = "Teslim Edildi")), Tarih[Yil]=2024)',
 'CALCULATE([Net Satış], Tarih[Yil]=2024, Tarih[CeyrekNo]=4)', 'CALCULATE([Satış GY], Tarih[Yil]=2024, Tarih[CeyrekNo]=4)',
 'CALCULATE([YoY %], Tarih[Yil]=2024, Tarih[CeyrekNo]=4)','CALCULATE([Kâr Marjı %], Tarih[Yil]=2024)']) console.log(e, ev(e));
console.log(JSON.stringify(sorgu('EVALUATE\nADDCOLUMNS(VALUES(Kategoriler[Kategori]), "Y24", CALCULATE([YoY %], Tarih[Yil]=2024), "S24", CALCULATE([Net Satış], Tarih[Yil]=2024), "H", CALCULATE([Hedef Gerçekleşme %], Tarih[Yil]=2024))')));
console.log(JSON.stringify(sorgu('EVALUATE\nADDCOLUMNS(VALUES(Musteriler[Segment]), "S24", CALCULATE([Net Satış], Tarih[Yil]=2024), "Y", CALCULATE([YoY %], Tarih[Yil]=2024))')));
