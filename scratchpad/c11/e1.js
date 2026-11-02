const { M, ev, q, rq } = require('./h.js');
const S = M.tables.Satislar.rows; console.log('satir', S.length, S[0]);
const T = M.tables.Tarih.rows; console.log('tarih', T[0], T[T.length-1], T.length);
console.log('min/max sat', ev('MIN(Satislar[Tarih])'), ev('MAX(Satislar[Tarih])'));
for (const e of ['COUNT(Satislar[KargoGun])','COUNTA(Satislar[KargoGun])','COUNTBLANK(Satislar[KargoGun])','COUNTROWS(Satislar)','DISTINCTCOUNT(Satislar[KargoGun])','DISTINCTCOUNTNOBLANK(Satislar[KargoGun])','COUNTBLANK(Satislar[TeslimTarihi])','COUNTA(Musteriler[Sehir])','COUNTBLANK(Musteriler[Sehir])','COUNTROWS(Musteriler)','DISTINCTCOUNT(Musteriler[Sehir])','DISTINCTCOUNTNOBLANK(Musteriler[Sehir])','COUNTA(Satislar[Kanal])','COUNT(Satislar[Kanal])',
'FORMAT(DATE(2024,3,5), "MMMM yyyy")','FORMAT(DATE(2024,3,5), "yyyy-MM")','FORMAT(DATE(2024,3,5), "MMM")','FORMAT(1234.5, "#,0.00")','FORMAT(DATE(2024,3,5), "dddd")','WEEKDAY(DATE(2024,3,4))','WEEKDAY(DATE(2024,3,4),2)','EOMONTH(DATE(2024,2,10),0)','NETWORKDAYS(DATE(2024,3,1), DATE(2024,3,31))','DATEDIFF(DATE(2024,1,31), DATE(2024,2,1), MONTH)','COMBINEVALUES("|","a","b")','SEARCH("x","Abcx")','FIND("X","Abcx")','SEARCH("z","Abc",1,-1)','TODAY()','LEFT("Anadolu",3)','SUBSTITUTE("a-b-c","-","")','TRIM("  a  b ")','UPPER("istanbul")','LEN("Merhaba")','"a" & 1','CONCATENATE("a","b")','FV(0.01, 12, -1000)','PV(0.01,12,-1000)','PMT(0.02/12, 36, 100000)','MID("ABCDEF",2,3)']) console.log(e, '=>', ev(e));
console.log(Object.keys(M.tables.Musteriler.rows[0]), M.tables.Musteriler.rows[0]);
console.log(M.tables.Urunler.rows.slice(0,3), M.tables.Urunler.rows.length);
console.log('durum', [...new Set(S.map(r=>r.Durum))], 'kanal', [...new Set(S.map(r=>r.Kanal))]);
console.log('hedef', M.tables.Hedefler.rows.slice(0,3), M.tables.Hedefler.rows.length);
console.log('fiyatsen', M.tables.FiyatSenaryosu.rows);
