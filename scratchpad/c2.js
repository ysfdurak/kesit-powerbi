module.exports=[
['mali','CALCULATE([Net Satış], DATESYTD(Tarih[Tarih]))','CALCULATE([Net Satış], DATESYTD(Tarih[Tarih], "6-30"))'],
['mali2','TOTALYTD([Net Satış], Tarih[Tarih])','TOTALYTD([Net Satış], Tarih[Tarih], ALL(Tarih), "6-30")'],
['switch','SWITCH(TRUE(), [Kâr Marjı %] >= 0.35, "Orta", [Kâr Marjı %] >= 0.38, "Yüksek", "Düşük")','SWITCH(TRUE(), [Kâr Marjı %] >= 0.38, "Yüksek", [Kâr Marjı %] >= 0.35, "Orta", "Düşük")'],
];
