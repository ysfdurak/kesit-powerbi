const {ev,q,run,def}=require('./h.js');
def('İşe Girişten Önceki Satış','SUMX(VALUES(Calisanlar[CalisanNo]), VAR Giris = CALCULATE(MAX(Calisanlar[IseGiris])) RETURN CALCULATE([Net Satış], Satislar[Tarih] < Giris))');
console.log(q(['[İşe Girişten Önceki Satış]','CALCULATE(MIN(Satislar[Tarih]))','CALCULATE(MAX(Calisanlar[IseGiris]))'],{t:'Calisanlar',c:'AdSoyad'}));
console.log(ev('[İşe Girişten Önceki Satış]'));
// HR: IN operator, TREATAS hires
def('Doğrudan Bağlı','VAR Yoneticiler = VALUES(Calisanlar[CalisanNo])\nRETURN COUNTROWS(FILTER(ALL(Calisanlar), Calisanlar[YoneticiNo] IN Yoneticiler))');
console.log(q('[Doğrudan Bağlı]',{t:'Departmanlar',c:'Departman'}), q('[Doğrudan Bağlı]',{t:'Calisanlar',c:'Seviye'}), ev('[Doğrudan Bağlı]'));
def('Yönetici Sayısı','COUNTROWS(FILTER(VALUES(Calisanlar[CalisanNo]), [Doğrudan Bağlı] > 0))');
def('Ortalama Ekip Büyüklüğü','DIVIDE([Doğrudan Bağlı], [Yönetici Sayısı])');
console.log(q(['[Yönetici Sayısı]','[Ortalama Ekip Büyüklüğü]'],{t:'Departmanlar',c:'Departman'}), ev('[Ortalama Ekip Büyüklüğü]'));
def('İşe Alım','CALCULATE(COUNTROWS(Calisanlar), TREATAS(VALUES(Tarih[Tarih]), Calisanlar[IseGiris]))');
console.log(q('[İşe Alım]',{t:'Tarih',c:'Yil'}), ev('[İşe Alım]'));
def('Kıdem Grubu Sayısı', 'x');
console.log(run(`EVALUATE
VAR T = ADDCOLUMNS(Calisanlar, "Grup", SWITCH(TRUE(), Calisanlar[KidemYil] <= 1, "0-1 yıl", Calisanlar[KidemYil] <= 4, "2-4 yıl", Calisanlar[KidemYil] <= 7, "5-7 yıl", "8+ yıl"))
RETURN ROW("01", COUNTROWS(FILTER(T,[Grup]="0-1 yıl")), "24", COUNTROWS(FILTER(T,[Grup]="2-4 yıl")), "57", COUNTROWS(FILTER(T,[Grup]="5-7 yıl")), "8", COUNTROWS(FILTER(T,[Grup]="8+ yıl")),
"m01", MEDIANX(FILTER(T,[Grup]="0-1 yıl"), Calisanlar[Maas]), "m24", MEDIANX(FILTER(T,[Grup]="2-4 yıl"), Calisanlar[Maas]), "m57", MEDIANX(FILTER(T,[Grup]="5-7 yıl"), Calisanlar[Maas]), "m8", MEDIANX(FILTER(T,[Grup]="8+ yıl"), Calisanlar[Maas]))`));
def('Maaş Aralığı Oranı','DIVIDE(MAX(Calisanlar[Maas]), MIN(Calisanlar[Maas]))');
console.log(q(['[Maaş Aralığı Oranı]','MAX(Calisanlar[Maas]) - MIN(Calisanlar[Maas])'],{t:'Calisanlar',c:'Unvan'}).filter(s=>!s.includes('= 1 |')));
console.log(q(['[Maaş Aralığı Oranı]'],{t:'Departmanlar',c:'Departman'}), q(['[Maaş Aralığı Oranı]'],{t:'Calisanlar',c:'Seviye'}));
console.log(ev('CALCULATE([Medyan Maaş], Calisanlar[Seviye] = 2)'), ev('CALCULATE([Medyan Maaş], Calisanlar[Seviye] = 3)'));
console.log(q(['[Toplam Maaş]','DIVIDE([Toplam Maaş], CALCULATE([Toplam Maaş], ALL(Departmanlar)))'],{t:'Departmanlar',c:'Departman'}));
console.log(q(['[Medyan Maaş]','[Maaş Std. Sapma]'],{t:'Departmanlar',c:'Sehir'}));
