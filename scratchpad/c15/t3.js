require('./h.js');
const K={t:'Kategoriler',c:'Kategori'}, Y={t:'Tarih',c:'Yil'};
console.log('kanal', [...new Set(PBI_MODEL.tables.Satislar.rows.map(r => r.Kanal))], [...new Set(PBI_MODEL.tables.Satislar.rows.map(r => r.Durum))], 'tarih yillar', [...new Set(PBI_MODEL.tables.Tarih.rows.map(r=>r.Yil))]);
console.log('rows', PBI_MODEL.tables.Satislar.rows.length, 'musteri', PBI_MODEL.tables.Musteriler.rows.length);
for (const e of ['SUM(Satislar[Adet])','DIVIDE([Satılan Adet], [Sipariş Sayısı])','DIVIDE([İade Tutarı], [Net Satış])','[Hedef Gerçekleşme %]','IF([Hedef Gerçekleşme %] < 0.95, 1, 0)','DISTINCTCOUNT(Satislar[SiparisNo])','[Sipariş Sayısı]','CONCATENATEX(VALUES(Kategoriler[Kategori]), Kategoriler[Kategori], ", ", Kategoriler[Kategori], ASC)'])
  console.log(e, '| T', ev(e), '|', q(e,K).join(' '), '|', q(e,Y).join(' '));
console.log('avg of cat ratio', ev('AVERAGEX(VALUES(Kategoriler[Kategori]), DIVIDE([Satılan Adet], [Sipariş Sayısı]))'));
console.log('sum siparis by cat', ev('SUMX(VALUES(Kategoriler[Kategori]), [Sipariş Sayısı])'));
console.log(q('[Net Satış]',{t:'Satislar',c:'Kanal'}));
