require('./h.js');
const K={t:'Kategoriler',c:'Kategori'}, Y={t:'Tarih',c:'Yil'};
const L = ['CONCATENATEX(VALUES(Kategoriler[Kategori]), Kategoriler[Kategori] & ": " & FORMAT([Net Satış], "#,0"), "; ", [Net Satış], DESC)',
'IF(COUNTROWS(Satislar) > 1000, "Filtreyi daralt", "Gönderilebilir")','COUNTROWS(Satislar)',
'DIVIDE([Sipariş Sayısı] - CALCULATE([Sipariş Sayısı], SAMEPERIODLASTYEAR(Tarih[Tarih])), CALCULATE([Sipariş Sayısı], SAMEPERIODLASTYEAR(Tarih[Tarih])))',
'DIVIDE(CALCULATE([Net Satış], Satislar[Kanal] = "Web"), [Net Satış])',
'AVERAGEX(VALUES(Tarih[YilAy]), [Net Satış])','[YoY %]',
'VAR S = [Net Satış] RETURN DIVIDE(S - CALCULATE(S, SAMEPERIODLASTYEAR(Tarih[Tarih])), CALCULATE(S, SAMEPERIODLASTYEAR(Tarih[Tarih])))',
'VAR S = [Net Satış] RETURN AVERAGEX(VALUES(Tarih[YilAy]), S)',
'DIVIDE([İade Tutarı], [Toplam Satış])','COUNTROWS(VALUES(Tarih[YilAy]))','COUNTROWS(FILTER(VALUES(Tarih[YilAy]), NOT ISBLANK([Net Satış])))'];
for (const e of L) console.log(e.slice(0,60), '| T', ev(e), '|', q(e,K).join(' '), '|', q(e,Y).join(' '));
