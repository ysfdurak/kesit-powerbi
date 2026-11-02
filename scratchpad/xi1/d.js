require('./h.js');
const p=(...x)=>console.log(JSON.stringify(x));
const q=(rows,vals,sl)=>{const r=X.query({rows,measures:ms,values:vals,slicers:sl||[],totals:true});return {rows:r.rows.map(x=>[x.keys.join('/'),...x.vals.map(v=>v==null?null:Math.round(v*100)/100)]),total:r.total}};
let r=q([{t:'Tarih',c:'YilAy'}],['CALCULATE([Net Satış], OFFSET(-1, ALL(Tarih[YilAy]), ORDERBY(Tarih[YilAy], ASC)), REMOVEFILTERS(Tarih[Yil]))'],[{t:'Tarih',c:'Yil',values:[2024]}]); p(r.rows.slice(0,2));
p(Q(`EVALUATE ROW(
"Satır", COUNTROWS(Satislar),
"Yetim ürün", COUNTROWS(FILTER(Satislar, ISBLANK(RELATED(Urunler[Urun])))),
"Yetim müşteri", COUNTROWS(FILTER(Satislar, ISBLANK(RELATED(Musteriler[Musteri])))),
"Negatif", COUNTROWS(FILTER(Satislar, Satislar[Tutar] < 0)),
"TeslimÖnce", COUNTROWS(FILTER(Satislar, NOT ISBLANK(Satislar[TeslimTarihi]) && Satislar[TeslimTarihi] < Satislar[Tarih])),
"KargoBos", COUNTROWS(FILTER(Satislar, ISBLANK(Satislar[KargoGun]))),
"TeslimBos", COUNTROWS(FILTER(Satislar, ISBLANK(Satislar[TeslimTarihi]))),
"TutarUyumsuz", COUNTROWS(FILTER(Satislar, ABS(Satislar[Tutar] - Satislar[Adet] * Satislar[BirimFiyat] * (1 - Satislar[Indirim])) > 0.01)),
"TarihSatir", COUNTROWS(Tarih), "Gun", DATEDIFF(MIN(Tarih[Tarih]), MAX(Tarih[Tarih]), DAY) + 1,
"EpostaBos", COUNTBLANK(Calisanlar[Eposta]),
"AlmayanMus", COUNTROWS(FILTER(Musteriler, ISEMPTY(RELATEDTABLE(Satislar)))),
"SipNo", DISTINCTCOUNT(Satislar[SiparisNo])
)`));
p(Q('EVALUATE SUMMARIZECOLUMNS(Satislar[Durum], "Satır", COUNTROWS(Satislar), "KargoBos", COUNTBLANK(Satislar[KargoGun]), "Tutar", SUM(Satislar[Tutar]))'));
p(Q('EVALUATE ROW("Toplam", [Net Satış], "KatToplam", SUMX(VALUES(Kategoriler[Kategori]), [Net Satış]), "KanalToplam", SUMX(VALUES(Satislar[Kanal]), [Net Satış]), "Pay", SUMX(VALUES(Kategoriler[Kategori]), [Kategori Payı %]))'));
p(Q('EVALUATE ROW("Hedef", [Hedef], "Hk", SUMX(VALUES(Kategoriler[Kategori]), [Hedef]), "YTD24", CALCULATE([Satış YTD], Tarih[Tarih] = DATE(2024,12,31)), "Y24", CALCULATE([Net Satış], Tarih[Yil] = 2024))'));
p(Q('EVALUATE SUMMARIZECOLUMNS(Kategoriler[Kategori], TREATAS({2024}, Tarih[Yil]), TREATAS({"Web", "Mobil"}, Satislar[Kanal]), "Satış", [Net Satış], "Marj", [Kâr Marjı %])'));
p(Q('EVALUATE FILTER(SUMMARIZECOLUMNS(Urunler[Urun], "Marj", [Kâr Marjı %], "S", [Net Satış]), [Marj] < 0.3)'));
p(Q('EVALUATE ADDCOLUMNS(VALUES(Satislar[TemsilciNo]), "Ad", LOOKUPVALUE(Calisanlar[AdSoyad], Calisanlar[CalisanNo], Satislar[TemsilciNo]))'));
