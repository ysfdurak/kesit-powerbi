require('./h.js');
ms['Profil Başlığı']={name:'x',expr:`VAR Sehir = SELECTEDVALUE(Musteriler[Sehir], "Tüm şehirler")
VAR Endeks = DIVIDE([Müşteri Başı Satış], CALCULATE([Müşteri Başı Satış], REMOVEFILTERS(Musteriler))) * 100
VAR Sira = RANKX(FILTER(ALL(Musteriler[Sehir]), NOT ISBLANK(Musteriler[Sehir])), [Müşteri Başı Satış])
VAR Adet = COUNTROWS(FILTER(ALL(Musteriler[Sehir]), NOT ISBLANK(Musteriler[Sehir])))
RETURN Sehir & ": " & [Müşteri Sayısı] & " müşteri, " & [Sipariş Sayısı] & " sipariş · müşteri başı satış endeksi " & FORMAT(Endeks, "0") & IF(HASONEVALUE(Musteriler[Sehir]), " (" & Sira & ". / " & Adet & ")")`};
T(`EVALUATE ADDCOLUMNS(VALUES(Musteriler[Sehir]), "B", [Profil Başlığı])`); console.log(ev('[Profil Başlığı]'));
console.log(ev(`CALCULATE([İade Oranı %], Calisanlar[AdSoyad]="Can Aydın", Musteriler[Sehir]<>"Trabzon")`), ev(`CALCULATE([İade Oranı %], Calisanlar[AdSoyad]="Can Aydın", Musteriler[Sehir]="Trabzon")`));
console.log(ev(`CALCULATE([İade Oranı %], Musteriler[Sehir]="Trabzon", Calisanlar[AdSoyad]<>"Can Aydın")`), ev(`CALCULATE(COUNTROWS(Satislar), Musteriler[Sehir]="Trabzon", Calisanlar[AdSoyad]<>"Can Aydın")`));
console.log(ev('COUNTROWS(FILTER(VALUES(Musteriler[Sehir]), [Sipariş Sayısı] >= 30))'));
T(`EVALUATE ADDCOLUMNS(VALUES(Calisanlar[AdSoyad]), "T", CALCULATE(COUNTROWS(Satislar), Musteriler[Sehir]="Trabzon"))`);
console.log(X.query({rows:[{t:'Calisanlar',c:'AdSoyad'}], measures: ms, values:['[İade Oranı %] - DIVIDE(SUMX(VALUES(Musteriler[Sehir]), CALCULATE(COUNTROWS(Satislar)) * CALCULATE([İade Oranı %], REMOVEFILTERS(Calisanlar))), COUNTROWS(Satislar))'], totals:true}).rows.filter(r=>r.vals[0]!=null).map(r=>r.keys+'='+r.vals));
// iade z
T(`EVALUATE ADDCOLUMNS(VALUES(Musteriler[Sehir]), "z", VAR S = FILTER(ADDCOLUMNS(ALL(Musteriler[Sehir]), "M", [İade Oranı %]+0), NOT ISBLANK(Musteriler[Sehir])) VAR o = AVERAGEX(S,[M]) VAR sd = STDEVX.P(S,[M]) RETURN DIVIDE([İade Oranı %]+0-o, sd))`);
