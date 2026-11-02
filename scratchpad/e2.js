const f=[{t:'Tarih',c:'Yil',values:[2024]}];
M('CALCULATE(COUNTROWS(SatinAlmalar), FILTER(SatinAlmalar, SatinAlmalar[TeslimGun] > RELATED(Tedarikciler[SozGun])))', f);
M('CALCULATE(COUNTROWS(SatinAlmalar), SatinAlmalar[Zamaninda] = "Hayır")', f);
M('COUNTROWS(SatinAlmalar)', f);
M('[Satın Alma Tutarı]', f); M('[Kusur Oranı %]', f); M('[Ortalama Tedarik Süresi]', f);
Q('EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(Tedarikciler[Tedarikci]), "T", [Satın Alma Tutarı], "N", COUNTROWS(SatinAlmalar), "K", [Kusur Oranı %], "Ort", [Ortalama Tedarik Süresi]), Tarih[Yil] = 2024)');
Q('EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(Kategoriler[Kategori]), "T", [Satın Alma Tutarı], "Gec", DIVIDE(CALCULATE(COUNTROWS(SatinAlmalar), SatinAlmalar[Zamaninda] = "Hayır"), COUNTROWS(SatinAlmalar)), "K", [Kusur Oranı %]), Tarih[Yil] = 2024)');
