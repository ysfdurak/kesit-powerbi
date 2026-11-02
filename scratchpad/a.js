q("EVALUATE TOPN(10, Tarih, Tarih[Tarih], ASC)");
q("EVALUATE FILTER(Tarih, Tarih[Tarih] >= DATE(2022,12,26) && Tarih[Tarih] <= DATE(2023,1,9))");
q("EVALUATE SUMMARIZECOLUMNS(Tarih[Yil], \"N\", [Net Satış], \"minT\", MIN(Satislar[Tarih]), \"maxT\", MAX(Satislar[Tarih]))");
q("EVALUATE ROW(\"min\", MIN(Tarih[Tarih]), \"max\", MAX(Tarih[Tarih]))");
