require('./e.js');
const tb='RANKX(ALL(Urunler[Urun]), [Sipariş Sayısı] * 1000000 + [Net Satış])';
p(q('EVALUATE FILTER(ADDCOLUMNS(VALUES(Urunler[Urun]), "Sip", [Sipariş Sayısı], "S", [Net Satış], "R", '+tb+'), [Sip] >= 53 && [Sip] <= 55)'));
p(g([{t:'Tarih',c:'Yil'}],['SUM(StokGorunum[StokAdet])','[Stok Adedi]','[Stok Değeri]','SUM(StokGorunum[StokDegeri])','AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])','[Net Maliyet]','DIVIDE([Net Maliyet], AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri]))','[Gelen Adet]','[Satılan Adet]']));
p('tot', ev('SUM(StokGorunum[StokAdet])'), ev('[Stok Adedi]'), ev('[Stok Değeri]'));
p(g([{t:'Tarih',c:'Yil'}],['CALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))','CALCULATE(SUM(StokGorunum[StokAdet]), CLOSINGBALANCEYEAR(SUM(StokGorunum[StokAdet]), Tarih[Tarih]))'.replace(/CALCULATE\(SUM\(StokGorunum\[StokAdet\]\), (CLOSING.*)\)$/,'$1'),'[Stok Adedi] - CALCULATE([Stok Adedi], PREVIOUSDAY(FIRSTDATE(Tarih[Tarih])))','CALCULATE([Stok Adedi], PREVIOUSDAY(FIRSTDATE(Tarih[Tarih])))']));
p(g([{t:'Kategoriler',c:'Kategori'}],['[Stok Adedi]','[Stok Değeri]','DIVIDE([Net Maliyet], AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri]))','AVERAGEX(VALUES(Tarih[YilAy]), [Stok Değeri])']));
// partial month: 2024-12-15 filter
const sl=[{t:'Tarih',c:'YilAy',values:['2024-12']}];
p('dec', ev('[Stok Adedi]',sl), ev('CLOSINGBALANCEMONTH(SUM(StokGorunum[StokAdet]), Tarih[Tarih])',sl));
const sl2=[{t:'Tarih',c:'Tarih',values:[new Date(Date.UTC(2024,11,1)),new Date(Date.UTC(2024,11,15))]}];
try{p('dec half', ev('[Stok Adedi]',sl2), ev('CLOSINGBALANCEMONTH(SUM(StokGorunum[StokAdet]), Tarih[Tarih])',sl2), ev('CALCULATE(SUM(StokGorunum[StokAdet]), LASTDATE(Tarih[Tarih]))',sl2));}catch(e){p(e.message)}
