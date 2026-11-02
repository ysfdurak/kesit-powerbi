const y24 = [{t:'Tarih', c:'Yil', values:[2024]}];
console.log('2024', ev('[Net Satış]', y24), ev('[Hedef]', y24), ev('[Hedef Gerçekleşme %]', y24), ev('[Satış GY]', y24), ev('[YoY %]', y24), ev('[Hedef Farkı]', y24));
console.log('gauge max', ev('ROUNDUP([Hedef] * 1.2, -4)', y24), ev('CEILING(MAX([Net Satış], [Hedef]) * 1.1, 50000)', y24));
console.log('kat payi 2024', ev('[Kategori Payı %]', y24.concat([{t:'Kategoriler',c:'Kategori',values:['Elektronik']}])));
console.log('fark 2024 total', ev('[Net Satış] - [Satış GY]', y24));
console.log('--- L4');
for (const [t,c] of [['Satislar','Kanal'],['Satislar','IndirimBandi'],['Kategoriler','Kategori'],['Musteriler','Segment'],['Musteriler','YasGrubu'],['Musteriler','Cinsiyet'],['Musteriler','Bolge']]) {
  qq('EVALUATE\nADDCOLUMNS(VALUES(' + t + '[' + c + ']), "Iade", CALCULATE(COUNTROWS(Satislar), Satislar[Durum] = "İade"), "Satir", CALCULATE(COUNTROWS(Satislar)), "Oran", [İade Oranı %], "Diger", VAR k = ' + t + '[' + c + '] RETURN CALCULATE([İade Oranı %], ' + t + '[' + c + '] <> k), "Kat", VAR k = ' + t + '[' + c + '] RETURN DIVIDE([İade Oranı %], CALCULATE([İade Oranı %], ' + t + '[' + c + '] <> k)))', 10);
}
console.log('genel iade', ev('[İade Oranı %]'), ev('CALCULATE(COUNTROWS(Satislar), Satislar[Durum] = "İade")'));
