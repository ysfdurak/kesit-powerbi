const f=[{t:'Tarih',c:'Yil',values:[2024]}], g=[{t:'Tarih',c:'Yil',values:[2023]}];
for (const e of ['[Gider]','[Gider Bütçe]','[Gider Sapma %]','[Faaliyet Kârı]','[Faaliyet Kâr Marjı %]','[Gider / Satış %]','[Brüt Kâr]']) { process.stdout.write(e+' '); M(e,f); process.stdout.write('   23 '); M(e,g); }
Q('EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(GiderTurleri[GiderTuru]), "G", [Gider], "B", [Gider Bütçe], "S", [Gider Sapma %]), Tarih[Yil] = 2024)');
Q('EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(Departmanlar[Departman]), "G", [Gider], "B", [Gider Bütçe]), Tarih[Yil] = 2024)');
Q('EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(Tarih[YilAy]), "G", [Gider], "B", [Gider Bütçe], "S", [Gider Sapma]), Tarih[Yil] = 2024)');
