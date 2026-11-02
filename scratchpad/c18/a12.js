const {M, ev, q, rq} = require('./h.js');
const OT = 'CALCULATETABLE(VALUES(Satislar[SiparisNo]), Satislar[Durum] <> "İptal")', V='CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal")';
console.log('above', ev(`VAR A=[Ortalama Sepet] RETURN COUNTROWS(FILTER(${OT}, ${V} > A))`));
console.log('rows by yil', q(['COUNTROWS(Satislar)','CALCULATE(COUNTROWS(Satislar), Satislar[Durum]="İade")'], {t:'Tarih',c:'Yil'}));
console.log('dec yoy', ev('CALCULATE([YoY %], Tarih[YilAy]="2024-12")'), ev('CALCULATE([MoM %], Tarih[YilAy]="2024-12")'), ev('CALCULATE([MoM %], Tarih[YilAy]="2023-12")'), ev('CALCULATE([Net Satış], Tarih[YilAy]="2023-11")'));
console.log('2022 ilk', ev('CALCULATE(MIN(Satislar[Tarih]), Tarih[Yil]=2022)'));
console.log('ek iptal/gap', (16497.65-8461.1)/9898);
console.log('med el', ev('CALCULATE(MEDIANX('+OT+','+V+'), Kategoriler[Kategori]="Elektronik")'));
console.log('premium kurumsal', q(['[İade Oranı %]'], {t:'Musteriler',c:'Segment'}));
