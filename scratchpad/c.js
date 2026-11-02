m('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2023,7,1), DATE(2024,3,31)))');
m('CALCULATE([Net Satış], DATESYTD(Tarih[Tarih]), Tarih[YilAy]="2024-03")');
m('CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "30-6"), Tarih[YilAy]="2024-03")');
m('CALCULATE(CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6-30")), Tarih[YilAy]="2023-08")');
m('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2023,7,1), DATE(2023,8,31)))');
m('CALCULATE(CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6-30")), Tarih[Yil]=2024)');
m('CALCULATE([Net Satış], DATESBETWEEN(Tarih[Tarih], DATE(2024,7,1), DATE(2024,12,31)))');
m('CALCULATE(CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6-30")), Tarih[Yil]=2022)');
console.log(X.query({ rows: [{ t: 'Tarih', c: 'Yil' }], measures: ms, values: ['CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6-30"))','CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "30-6"))','TOTALYTD([Net Satış], Tarih[Tarih])'], slicers: [], totals: true }).rows);
