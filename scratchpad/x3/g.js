require('./h.js');
console.log(G([{t:'Tarih',c:'Yil'}], ['[Hedef Gerçekleşme %]','[YoY %]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Hedef Gerçekleşme %]','[YoY %]']));
console.log(G([{t:'Kategoriler',c:'Kategori'}], ['[Hedef Gerçekleşme %]','[YoY %]'],[{t:'Tarih',c:'Yil',values:[2024]}]));
def('KPI Durum Rengi', `VAR Oran = [Hedef Gerçekleşme %]
RETURN SWITCH(TRUE(), ISBLANK(Oran), "#8A8A8A", Oran >= 1, "#1B7F3B", Oran >= 0.95, "#B26A00", "#B42318")`);
console.log(E('[KPI Durum Rengi]'), G([{t:'Tarih',c:'Yil'}], ['[KPI Durum Rengi]']), G([{t:'Kategoriler',c:'Kategori'}], ['[KPI Durum Rengi]']));
def('Sayfa Alt Başlığı', `VAR Kat = IF(HASONEVALUE(Kategoriler[Kategori]), SELECTEDVALUE(Kategoriler[Kategori]), "Tüm kategoriler")
VAR Yil = IF(HASONEVALUE(Tarih[Yil]), FORMAT(SELECTEDVALUE(Tarih[Yil]), "0"), "2022–2024")
RETURN Kat & " · " & Yil & " · Hedefe göre %" & FORMAT([Hedef Gerçekleşme %] * 100, "0")`);
console.log(E('[Sayfa Alt Başlığı]'), G([{t:'Tarih',c:'Yil'}], ['[Sayfa Alt Başlığı]']), G([{t:'Kategoriler',c:'Kategori'}], ['[Sayfa Alt Başlığı]']));
console.log(PBI_MEASURES.find(m=>m.name==='Dinamik Başlık').expr);
