M('[Sipariş Sayısı]'); M('CALCULATE([Sipariş Sayısı], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]))');
M('CALCULATE([Sipariş Sayısı], ISBLANK(Satislar[TeslimTarihi]))');
M('CALCULATE([Sipariş Sayısı], USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih]), Tarih[Yil] IN {2022, 2023, 2024})');
