const f=[{t:'Tarih',c:'Yil',values:[2024]}], g=[{t:'Tarih',c:'Yil',values:[2023]}];
for (const e of ['[Talep Sayısı]','[Çözüm Oranı %]','[Ortalama İlk Yanıt (dk)]','[Ortalama Çözüm (saat)]','[CSAT %]','[SLA Uyum %]','[Sipariş Sayısı]','AVERAGE(Talepler[Memnuniyet])']) { process.stdout.write(e+' '); M(e,f); process.stdout.write('   23 '); M(e,g); }
Q('EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(Talepler[Kanal]), "N", [Talep Sayısı], "Y", [Ortalama İlk Yanıt (dk)], "SLA", [SLA Uyum %], "CSAT", [CSAT %], "C", [Ortalama Çözüm (saat)]), Tarih[Yil] = 2024)');
Q('EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(Talepler[Konu]), "N", [Talep Sayısı], "CSAT", [CSAT %], "C", [Ortalama Çözüm (saat)]), Tarih[Yil] = 2024)');
Q('EVALUATE CALCULATETABLE(ADDCOLUMNS(VALUES(Musteriler[Segment]), "N", [Talep Sayısı], "TS", DIVIDE([Talep Sayısı], [Sipariş Sayısı]), "CSAT", [CSAT %]), Tarih[Yil] = 2024)');
