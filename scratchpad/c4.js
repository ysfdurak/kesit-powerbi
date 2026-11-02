module.exports=[
['calc','CALCULATE([Net Satış], FILTER(Satislar, [Net Satış] > 20000))','CALCULATE([Net Satış], FILTER(VALUES(Urunler[Urun]), [Net Satış] > 20000))'],
['fmt','FORMAT([Net Satış], "#,0 ₺")','[Net Satış]'],
];
