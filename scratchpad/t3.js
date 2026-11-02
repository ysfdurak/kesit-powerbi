const p=(...x)=>console.log(...x.map(v=>JSON.stringify(v)));
const S=M.tables.Satislar.rows;
const bl={};S.filter(r=>r.KargoGun==null).forEach(r=>bl[r.Durum]=(bl[r.Durum]||0)+1);p('blank kargo by durum',bl);
const du={};S.forEach(r=>du[r.Durum]=(du[r.Durum]||0)+1);p('durum',du);
for(const t of Object.keys(M.tables)){const R=M.tables[t].rows;const cols=Object.keys(R[0]||{});const nb=cols.map(c=>[c,R.filter(r=>r[c]==null||r[c]==='').length]).filter(x=>x[1]>0);if(nb.length)p(t,nb)}
p('net',ev('[Net Satış]'),'bk',ev('[Brüt Kâr]'),'sip',ev('[Sipariş Sayısı]'),'kbs',ev('DIVIDE([Brüt Kâr],[Sipariş Sayısı])'));
p(Q('EVALUATE\nSUMMARIZECOLUMNS(Tarih[Yil], "Kâr/Sipariş", DIVIDE([Brüt Kâr], [Sipariş Sayısı]), "Net", [Net Satış])').rows);
p(Q('EVALUATE\nSUMMARIZECOLUMNS(Tarih[Yil], Urunler[Kategori], "Net Satış", [Net Satış], "Adet", [Satılan Adet])').rows.length);
p(Q('EVALUATE\nSUMMARIZECOLUMNS(Tarih[Yil], "Son", MAX(Satislar[Tarih]), "Satır", COUNTROWS(Satislar))').rows);
p(Q('EVALUATE\nSUMMARIZECOLUMNS(Kategoriler[Kategori], "Son", MAX(Satislar[Tarih]))').rows);
p('upn sales',ev('CALCULATE([Net Satış], FILTER(Calisanlar, Calisanlar[Eposta] = USERPRINCIPALNAME()))'));
p(M.tables.Calisanlar.rows.filter(r=>r.Eposta=='ayse.kaya@anadolumarket.com'));
p(Q('EVALUATE\nSUMMARIZECOLUMNS(Calisanlar[AdSoyad], "Net", [Net Satış])').rows);
