require('./h.js');
const y24=[{t:'Tarih',c:'Yil',values:[2024]}], y23=[{t:'Tarih',c:'Yil',values:[2023]}];
console.log('2024', G([{t:'RFMSegmentleri',c:'Segment'}], ['[Segmentteki Müşteri]'], y24));
console.log('2023', G([{t:'RFMSegmentleri',c:'Segment'}], ['[Segmentteki Müşteri]'], y23));
// quintile thresholds of M (12 months) at end 2024
console.log(Q(`EVALUATE
VAR T = ADDCOLUMNS(CALCULATETABLE(VALUES(Satislar[MusteriNo]), Satislar[Durum] <> "İptal", Tarih[Yil] = 2024), "M", CALCULATE([Net Satış], Tarih[Yil] = 2024))
RETURN ROW("p20", PERCENTILEX.INC(T,[M],0.2), "p40", PERCENTILEX.INC(T,[M],0.4), "p60", PERCENTILEX.INC(T,[M],0.6), "p80", PERCENTILEX.INC(T,[M],0.8), "n", COUNTROWS(T), "ge12000", COUNTROWS(FILTER(T,[M]>=12000)), "lt1500", COUNTROWS(FILTER(T,[M]<1500)))`));
console.log(G([{t:'MusteriDilimleri',c:'Dilim'}], ['[Dilimdeki Müşteri]','[Dilim Satışı]'], y24));
console.log(G([{t:'MusteriDilimleri',c:'Dilim'}], ['[Dilimdeki Müşteri]','[Dilim Satışı]']));
console.log(Q('EVALUATE MusteriDilimleri'), Q('EVALUATE RFMSegmentleri'));
console.log(E('[Net Satış]',[]), G([{t:'Tarih',c:'Yil'}],['[Net Satış]']));
