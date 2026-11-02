for (const [t,c] of [['Satislar','Kanal'],['Kategoriler','Kategori'],['Musteriler','Segment'],['Musteriler','YasGrubu'],['Musteriler','Cinsiyet'],['Musteriler','Bolge'],['Calisanlar','AdSoyad']]) {
  const r = X.runQuery(Object.assign({}, ms), 'EVALUATE\nCALCULATETABLE(ADDCOLUMNS(VALUES(' + t + '[' + c + ']), "S", [Net Satış]), Tarih[Yil] = 2024)').rows.filter(x => x[1] != null);
  const vals = r.map(x => x[1]); const avg = vals.reduce((a,b)=>a+b,0)/vals.length; const mx = r.reduce((a,b)=> b[1]>a[1]?b:a); const mn = r.reduce((a,b)=> b[1]<a[1]?b:a);
  console.log(c, 'n', vals.length, 'max', mx[0], mx[1], 'min', mn[0], mn[1], 'avg', Math.round(avg*100)/100, 'rel', Math.round(mx[1]/avg*1000)/1000);
}
// Level 2 under Kanal=Mobil 2024
for (const [t,c] of [['Kategoriler','Kategori'],['Musteriler','Segment'],['Musteriler','Bolge'],['Musteriler','YasGrubu']]) {
  const r = X.runQuery(Object.assign({}, ms), 'EVALUATE\nCALCULATETABLE(ADDCOLUMNS(VALUES(' + t + '[' + c + ']), "S", [Net Satış]), Tarih[Yil] = 2024, Satislar[Kanal] = "Mobil")').rows.filter(x => x[1] != null);
  const vals = r.map(x => x[1]); const avg = vals.reduce((a,b)=>a+b,0)/vals.length; const mx = r.reduce((a,b)=> b[1]>a[1]?b:a);
  console.log('Mobil>', c, 'max', mx[0], mx[1], 'avg', Math.round(avg), 'rel', Math.round(mx[1]/avg*1000)/1000);
}
console.log('top kat text', g('CONCATENATEX(TOPN(1, ADDCOLUMNS(VALUES(Kategoriler[Kategori]), "S", [Net Satış]), [S], DESC), Kategoriler[Kategori], ", ")', 'Satislar', 'Kanal'));
console.log('top kat text yil', g('CONCATENATEX(TOPN(1, ADDCOLUMNS(VALUES(Kategoriler[Kategori]), "S", [Net Satış]), [S], DESC), Kategoriler[Kategori], ", ")', 'Musteriler', 'Segment'));
console.log('pay en buyuk', g('DIVIDE(MAXX(VALUES(Kategoriler[Kategori]), [Net Satış]), [Net Satış])', 'Satislar', 'Kanal'));
console.log('seg kat', g('VAR k = VALUES(Musteriler[Segment]) RETURN DIVIDE([İade Oranı %], CALCULATE([İade Oranı %], EXCEPT(ALL(Musteriler[Segment]), k)))', 'Musteriler', 'Segment'));
console.log('seg diger', g('VAR k = VALUES(Musteriler[Segment]) RETURN CALCULATE([İade Oranı %], EXCEPT(ALL(Musteriler[Segment]), k))', 'Musteriler', 'Segment'));
console.log('seg kat by kanal grid', g('VAR k = VALUES(Musteriler[Segment]) RETURN DIVIDE([İade Oranı %], CALCULATE([İade Oranı %], EXCEPT(ALL(Musteriler[Segment]), k)))', 'Satislar', 'Kanal'));
console.log('kurumsal iade by kanal', g('CALCULATE([İade Oranı %], Musteriler[Segment] = "Kurumsal")', 'Satislar', 'Kanal'), g('CALCULATE([İade Oranı %], Musteriler[Segment] <> "Kurumsal")', 'Satislar', 'Kanal'));
console.log('kurumsal iade by yil', g('CALCULATE([İade Oranı %], Musteriler[Segment] = "Kurumsal")', 'Tarih', 'Yil'), g('CALCULATE([İade Oranı %], Musteriler[Segment] <> "Kurumsal")', 'Tarih', 'Yil'));
console.log('kurumsal x ege', ev('CALCULATE(COUNTROWS(Satislar), Musteriler[Segment]="Kurumsal", Musteriler[Bolge]="Ege")'), ev('CALCULATE([İade Oranı %], Musteriler[Segment]="Kurumsal", Musteriler[Bolge]="Ege")'));
console.log('kurumsal x 45-54', ev('CALCULATE(COUNTROWS(Satislar), Musteriler[Segment]="Kurumsal", Musteriler[YasGrubu]="45-54")'), ev('CALCULATE([İade Oranı %], Musteriler[Segment]="Kurumsal", Musteriler[YasGrubu]="45-54")'));
qq('EVALUATE\nADDCOLUMNS(VALUES(Kategoriler[Kategori]), "OrtTutar", CALCULATE(AVERAGE(Satislar[Tutar])), "Diger", VAR k = Kategoriler[Kategori] RETURN CALCULATE(AVERAGE(Satislar[Tutar]), Kategoriler[Kategori] <> k))');
qq('EVALUATE\nADDCOLUMNS(VALUES(Musteriler[Segment]), "M", CALCULATE(COUNTROWS(VALUES(Satislar[MusteriNo]))), "Iade", CALCULATE(COUNTROWS(Satislar), Satislar[Durum]="İade"))');
