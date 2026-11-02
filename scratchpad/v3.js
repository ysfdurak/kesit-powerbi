const {ev,q,run,def}=require('./h.js');
console.log(ev('[Çalışan Sayısı]'), ev('[Ortalama Maaş]'), ev('[Medyan Maaş]'), ev('PERCENTILE.INC(Calisanlar[Maas], 0.25)'), ev('PERCENTILE.INC(Calisanlar[Maas], 0.75)'), ev('MIN(Calisanlar[Maas])'), ev('MAX(Calisanlar[Maas])'), ev('[Ortalama Kıdem]'), ev('[Toplam Maaş]'));
def('Maaş Ç1','PERCENTILE.INC(Calisanlar[Maas], 0.25)'); def('Maaş Ç3','PERCENTILE.INC(Calisanlar[Maas], 0.75)');
console.log(q(['[Çalışan Sayısı]','[Ortalama Maaş]','[Medyan Maaş]','[Maaş Ç1]','[Maaş Ç3]','[Ortalama Kıdem]','[Toplam Maaş]'],{t:'Departmanlar',c:'Departman'}));
console.log(q(['[Çalışan Sayısı]','MIN(Calisanlar[Maas])','MAX(Calisanlar[Maas])','[Medyan Maaş]'],{t:'Calisanlar',c:'Seviye'}));
console.log(q(['[Çalışan Sayısı]','MIN(Calisanlar[Maas])','MAX(Calisanlar[Maas])'],{t:'Calisanlar',c:'Unvan'}));
console.log(q(['[Çalışan Sayısı]','[Medyan Maaş]'],{t:'Calisanlar',c:'KidemYil'}));
console.log(q(['[Çalışan Sayısı]'],{t:'Calisanlar',c:'MaasKutusu'}));
console.log(run(`EVALUATE
ADDCOLUMNS(FILTER(SELECTCOLUMNS(Calisanlar, "No", Calisanlar[CalisanNo], "Ad", Calisanlar[AdSoyad], "Unvan", Calisanlar[Unvan]), TRUE()), "Ekip", VAR N = [No] RETURN COUNTROWS(FILTER(ALL(Calisanlar), Calisanlar[YoneticiNo] = N)))`));
console.log(run(`EVALUATE
ADDCOLUMNS(GENERATESERIES(2014, 2024, 1), "Ise", VAR Y = [Value] RETURN COUNTROWS(FILTER(Calisanlar, YEAR(Calisanlar[IseGiris]) = Y)))`));
console.log(run(`EVALUATE SELECTCOLUMNS(Calisanlar, "a", Calisanlar[AdSoyad], "d", Calisanlar[DepartmanNo], "y", Calisanlar[YoneticiNo], "u", Calisanlar[Unvan], "m", Calisanlar[Maas], "g", Calisanlar[IseGiris], "k", Calisanlar[KidemYil], "s", Calisanlar[Seviye])`));
