require('./e.js');
p(q('EVALUATE TOPN(6, ADDCOLUMNS(VALUES(Urunler[Urun]), "S", [Net Satış]), [S], DESC)'));
p('urun sayisi', ev('COUNTROWS(Urunler)'), 'satisi olmayan', ev('COUNTROWS(FILTER(ALL(Urunler[Urun]), ISBLANK([Net Satış])))'));
p('top5', ev('CALCULATE([Net Satış], TOPN(5, ALL(Urunler[Urun]), [Net Satış]))'), 'top3', ev('CALCULATE([Net Satış], TOPN(3, ALL(Urunler[Urun]), [Net Satış]))'));
p(g([{t:'Kategoriler',c:'Kategori'}],['[Sipariş Sayısı]','RANKX(ALL(Kategoriler[Kategori]), [Sipariş Sayısı])','RANKX(ALL(Kategoriler[Kategori]), [Müşteri Sayısı])','[Müşteri Sayısı]']));
// ties among products by Satılan Adet or Sipariş
const r=q('EVALUATE ADDCOLUMNS(VALUES(Urunler[Urun]), "A", [Satılan Adet], "Skip", RANKX(ALL(Urunler[Urun]), [Satılan Adet]), "Dense", RANKX(ALL(Urunler[Urun]), [Satılan Adet], , DESC, DENSE))');
r.sort((a,b)=>a[2]-b[2]); p(r.slice(0,12));
const ti='VAR N = SELECTEDVALUE(TopNSecim[N], 5) RETURN [Net Satış] - CALCULATE([Net Satış], TOPN(N, ALL(Urunler[Urun]), [Net Satış]))';
p('dışı', ev(ti), g([{t:'Kategoriler',c:'Kategori'}],[ti]), ev(ti,[{t:'TopNSecim',c:'N',values:[10]}]));
p(q('EVALUATE VALUES(TopNSecim[N])').map(x=>x[0]).join(','));
p(g([{t:'UrunlerVeDiger',c:'Urun'}],['[Satış (Top N + Diğer)]']).filter(x=>!/null/.test(x)));
const p3='DIVIDE(CALCULATE([Net Satış], TOPN(3, ALL(Urunler[Urun]), [Net Satış])), [Net Satış])';
p(ev(p3), g([{t:'Kategoriler',c:'Kategori'}],[p3]), g([{t:'Tarih',c:'Yil'}],[p3]));
const p3b='DIVIDE(CALCULATE([Net Satış], TOPN(3, VALUES(Urunler[Urun]), [Net Satış])), [Net Satış])';
p(g([{t:'Kategoriler',c:'Kategori'}],[p3b]), g([{t:'Tarih',c:'Yil'}],[p3b]));
