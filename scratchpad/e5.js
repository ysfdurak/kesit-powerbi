Q('EVALUATE CALCULATETABLE(SUMMARIZECOLUMNS(Tarih[Yil], "N", [Net Satış], "YoY", [YoY %], "Sip", [Sipariş Sayısı]), Kategoriler[Kategori] = "Hediye")');
Q('EVALUATE SUMMARIZECOLUMNS(Satislar[IndirimBandi], "Iade", [İade Oranı %], "N", COUNTROWS(Satislar))');
Q('EVALUATE SUMMARIZECOLUMNS(Satislar[Kanal], "Iade", [İade Oranı %], "Ind", [Ortalama İndirim %])');
