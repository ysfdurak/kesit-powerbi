require('./h.js');
console.log(Q('EVALUATE CALCULATETABLE(SELECTCOLUMNS(Tarih, "T", Tarih[Tarih], "H", Tarih[HaftaNo], "YA", Tarih[YilAy]), Tarih[Yil] = 2024, Tarih[HaftaNo] IN {1, 53, 52})'));
console.log(E('CALCULATE([Hedef], Tarih[YilAy]="2024-01")'), E('CALCULATE([Hedef], Tarih[YilAy]="2024-02")'));
