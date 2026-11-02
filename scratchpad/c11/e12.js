const { ev, rq } = require('./h.js');
console.log(ev('TRIM("  Kot   Pantolon ")'), ev('LEN("Antalya")'), ev('LEFT("Ankara", 3)'), ev('SEARCH("set", "Çaydanlık Seti", 1, 0)'));
console.log(rq('EVALUATE\nADDCOLUMNS(GENERATESERIES(12, 48, 12), "Taksit", PMT(0.03, [Value], -600000))'));
console.log(rq('EVALUATE\nVAR Akis = SELECTCOLUMNS(GENERATESERIES(0, 3), "Tarih", DATE(2025 + [Value], 1, 1), "Nakit", IF([Value] = 0, -200000, 90000))\nRETURN ROW("NBD", XNPV(Akis, [Nakit], [Tarih], 0.20), "İVO", XIRR(Akis, [Nakit], [Tarih]))'));
console.log(rq('EVALUATE\nADDCOLUMNS(GENERATESERIES(0, 3000, 500), "Satır", VAR Alt = [Value] RETURN COUNTROWS(FILTER(Satislar, Satislar[Tutar] >= Alt && Satislar[Tutar] < Alt + 500)))'));
