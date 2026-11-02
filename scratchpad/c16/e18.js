require('./h.js'); const {K, PLAN} = require('./kr.js');
const D = `DEFINE\nVAR Krediler = ${K}\nVAR Plan = ${PLAN}\nVAR Rapor = DATE(2024, 12, 31)\n`;
T(D + `EVALUATE TOPN(4, FILTER(Plan, [KrediNo] = "K03"), [TaksitNo], ASC)`);
const Ozet = `ADDCOLUMNS(
        Krediler,
        "Durum", SWITCH(TRUE(), [GecikmeGun] >= 90, "Takipte", [GecikmeGun] >= 30, "Gecikmede", "Düzenli"),
        "Odenen", VAR k = [KrediNo] RETURN COUNTROWS(FILTER(Plan, [KrediNo] = k && [OdemeTarihi] <= Rapor)) + 0,
        "Bakiye", VAR k = [KrediNo] VAR t = [Tutar] VAR p = FILTER(Plan, [KrediNo] = k && [OdemeTarihi] <= Rapor) RETURN IF(ISEMPTY(p), t, MINX(p, [Kalan])),
        "Faiz2024", VAR k = [KrediNo] RETURN SUMX(FILTER(Plan, [KrediNo] = k && YEAR([OdemeTarihi]) = 2024), [Faiz]),
        "Anapara2024", VAR k = [KrediNo] RETURN SUMX(FILTER(Plan, [KrediNo] = k && YEAR([OdemeTarihi]) = 2024), [Taksit] - [Faiz]),
        "Tahsilat2025", VAR k = [KrediNo] RETURN SUMX(FILTER(Plan, [KrediNo] = k && YEAR([OdemeTarihi]) = 2025), [Taksit])
    )`;
T(D + `EVALUATE ${Ozet}`);
const D2 = D + `VAR Ozet = ${Ozet}\n`;
T(D2 + `EVALUATE ADDCOLUMNS(DISTINCT(SELECTCOLUMNS(Krediler, "Segment", [Segment])),
 "Kredi", VAR s = [Segment] RETURN COUNTROWS(FILTER(Ozet, [Segment] = s)),
 "Bakiye", VAR s = [Segment] RETURN SUMX(FILTER(Ozet, [Segment] = s), [Bakiye]),
 "Gecikme30", VAR s = [Segment] RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s && [GecikmeGun] >= 30), [Bakiye]), SUMX(FILTER(Ozet, [Segment] = s), [Bakiye])),
 "Takip90", VAR s = [Segment] RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s && [GecikmeGun] >= 90), [Bakiye]), SUMX(FILTER(Ozet, [Segment] = s), [Bakiye])),
 "AgFaiz", VAR s = [Segment] RETURN DIVIDE(SUMX(FILTER(Ozet, [Segment] = s), [Bakiye] * [YillikFaiz]), SUMX(FILTER(Ozet, [Segment] = s), [Bakiye])),
 "Faiz2024", VAR s = [Segment] RETURN SUMX(FILTER(Ozet, [Segment] = s), [Faiz2024]))`);
T(D2 + `EVALUATE ROW("Bakiye", SUMX(Ozet, [Bakiye]), "Tutar", SUMX(Ozet,[Tutar]), "G30", DIVIDE(SUMX(FILTER(Ozet, [GecikmeGun] >= 30), [Bakiye]), SUMX(Ozet, [Bakiye])), "T90", DIVIDE(SUMX(FILTER(Ozet, [GecikmeGun] >= 90), [Bakiye]), SUMX(Ozet, [Bakiye])), "Brut", DIVIDE(SUMX(Ozet, [Bakiye] * [YillikFaiz]), SUMX(Ozet, [Bakiye])), "Net", DIVIDE(SUMX(FILTER(Ozet, [GecikmeGun] < 90), [Bakiye] * [YillikFaiz]), SUMX(Ozet, [Bakiye])), "Faiz24", SUMX(Ozet,[Faiz2024]), "Faiz24Takip", SUMX(FILTER(Ozet, [GecikmeGun] >= 90), [Faiz2024]), "Tah25", SUMX(Ozet,[Tahsilat2025]), "Tah25Risk", SUMX(FILTER(Ozet, [GecikmeGun] >= 30), [Tahsilat2025]), "Ana24", SUMX(Ozet,[Anapara2024]))`);
require('fs').writeFileSync('ozet.txt', Ozet);
