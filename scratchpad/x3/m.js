require('./h.js');
def('Hedefe Kalan Tutar', `VAR Kalan = [Hedef] - [Net Satış] RETURN IF(NOT ISBLANK([Hedef]), MAX(Kalan, 0))`);
def('Kategori Bazında Kalan', `SUMX(VALUES(Kategoriler[Kategori]), [Hedefe Kalan Tutar])`);
const y24=[{t:'Tarih',c:'Yil',values:[2024]}];
console.log(E('[Hedefe Kalan Tutar]',y24), E('[Kategori Bazında Kalan]',y24), E('[Hedef]',y24), E('[Net Satış]',y24), E('[Hedef Gerçekleşme %]',y24));
console.log(E('[Hedef Gerçekleşme %]',[{t:'Tarih',c:'Yil',values:[2024]},{t:'Kategoriler',c:'Kategori',values:['Hediye']}]));
