const {ev,q,run,def,ms}=require('./h.js');
console.log(ev('COUNTROWS(VALUES(Urunler[Urun]))'));
def('Hedef Özeti Metni',`VAR Satis = [Satış YTD]
VAR Hedef = [Hedef YTD]
VAR Oran = DIVIDE(Satis, Hedef)
VAR Kat = FILTER(ADDCOLUMNS(VALUES(Kategoriler[Kategori]), "O", DIVIDE([Satış YTD], [Hedef YTD])), NOT ISBLANK([O]))
VAR EnGeri = TOPN(1, Kat, [O], ASC)
VAR Temsilci = ADDCOLUMNS(VALUES(Calisanlar[AdSoyad]), "S", [Satış YTD])
VAR EnIyi = TOPN(1, FILTER(Temsilci, NOT ISBLANK([S])), [S], DESC)
VAR Cumle1 = "YTD satış " & FORMAT(Satis, "#,##0") & " ₺; hedefin " & FORMAT(Oran, "0.0%") & " kadarı gerçekleşti"
VAR Cumle2 = IF(Satis >= Hedef, " (hedef aşıldı).", " (açık " & FORMAT(Hedef - Satis, "#,##0") & " ₺).")
VAR Cumle3 = " En geride kalan kategori: " & MAXX(EnGeri, Kategoriler[Kategori]) & " (" & FORMAT(MAXX(EnGeri, [O]), "0.0%") & ")."
VAR Cumle4 = " En yüksek satışlı temsilci: " & MAXX(EnIyi, Calisanlar[AdSoyad]) & "."
RETURN IF(ISBLANK(Hedef), "Seçimde hedef yok.", Cumle1 & Cumle2 & Cumle3 & Cumle4)`);
console.log(ev('CALCULATE([Hedef Özeti Metni], Tarih[Yil] = 2024)'));
console.log(ev('CALCULATE([Hedef Özeti Metni], Tarih[YilAy] = "2024-06")'));
console.log(q('[Hedef Özeti Metni]',{t:'Tarih',c:'Yil'}));
console.log(ev('[Hedef Özeti Metni]'));
def('Büyüme Sırası','IF(HASONEVALUE(Kategoriler[Kategori]), RANKX(ALL(Kategoriler[Kategori]), [YoY %]))');
console.log(q(['[Büyüme Sırası]','[YoY %]'].map(m=>`CALCULATE(${m}, Tarih[Yil] = 2024)`),{t:'Kategoriler',c:'Kategori'}));
console.log(q(['[Büyüme Sırası]'],{t:'Kategoriler',c:'Kategori'}));
console.log(q(['[Satış YTD]','[Hedef YTD]'],{t:'Tarih',c:'Yil'}));
console.log(q(['DIVIDE([Satış YTD],[Hedef YTD])'],{t:'Kategoriler',c:'Kategori'}));
