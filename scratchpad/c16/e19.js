require('./h.js'); const {K, PLAN} = require('./kr.js'); const Ozet = require('fs').readFileSync('ozet.txt','utf8');
const D2 = `DEFINE\nVAR Krediler = ${K}\nVAR Plan = ${PLAN}\nVAR Rapor = DATE(2024, 12, 31)\nVAR Ozet = ${Ozet}\n`;
T(D2 + `EVALUATE ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Krediler, "Segment", [Segment])),
 "Net", VAR s = [Segment] RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s && [GecikmeGun] < 90), [Bakiye] * [YillikFaiz]), SUMX(FILTER(Ozet, [Segment] = s), [Bakiye])),
 "Pay", VAR s = [Segment] RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s), [Bakiye]), SUMX(Ozet, [Bakiye])),
 "Tah25", VAR s = [Segment] RETURN SUMX(FILTER(Ozet, [Segment] = s), [Tahsilat2025]))`);
T(`DEFINE VAR Krediler = ${K} VAR Plan = ${PLAN} EVALUATE SELECTCOLUMNS(FILTER(Plan, [KrediNo] = "K03" && ([TaksitNo] <= 2 || [TaksitNo] = 15 || [TaksitNo] = 36)), "No", [TaksitNo], "T", [OdemeTarihi], "Taksit", [Taksit], "Faiz", [Faiz], "Ana", [Taksit]-[Faiz], "Kalan", [Kalan])`);
T(`DEFINE VAR Krediler = ${K} VAR Plan = ${PLAN} EVALUATE ROW("FaizK03", SUMX(FILTER(Plan, [KrediNo]="K03"), [Faiz]), "Top", SUMX(FILTER(Plan, [KrediNo]="K03"), [Taksit]), "Son", MAXX(Plan, [OdemeTarihi]), "Sonra2024", COUNTROWS(FILTER(Plan, [OdemeTarihi] > DATE(2024,12,31))), "Toplam", COUNTROWS(Plan))`);
