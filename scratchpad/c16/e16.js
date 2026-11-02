require('./h.js');
T(`EVALUATE ADDCOLUMNS(VALUES(Tarih[Yil]), "m", DISTINCTCOUNT(Tarih[YilAy]))`);
const L = `Urunler[Urun] IN {"Nemlendirici Krem", "Güneş Kremi SPF50", "Şampuan", "Dudak Balmı"}`;
const TK = `DATATABLE(
        "Secenek", STRING, "YillikSabit", CURRENCY, "BirimOran", DOUBLE, "MinAdet", INTEGER,
        {
            {"Mevcut tedarikçi", 0, 1.00, 0},
            {"Yeni tedarikçi", 3000, 0.88, 250},
            {"Kendi üretim", 18000, 0.55, 0}
        }
    )`;
const q3 = `EVALUATE
VAR Teklifler = ${TK}
VAR Birim =
    CALCULATE(
        DIVIDE([Net Maliyet], [Satılan Adet]),
        Tarih[Yil] = 2024,
        ${L}
    )
VAR Senaryolar =
    DATATABLE("Senaryo", STRING, "Adet", INTEGER,
        {{"Durgun", 299}, {"Temel (+%25)", 374}, {"İyimser (+%50)", 449}})
RETURN
    ADDCOLUMNS(
        GENERATE(Senaryolar, Teklifler),
        "Uygun", IF([Adet] >= [MinAdet], "Evet", "Hayır"),
        "Toplam Maliyet", [YillikSabit] + [BirimOran] * [Adet] * Birim
    )`;
T(q3);
const q4 = `EVALUATE
VAR Birim = CALCULATE(DIVIDE([Net Maliyet], [Satılan Adet]), Tarih[Yil] = 2024, ${L})
RETURN
    ADDCOLUMNS(
        GENERATESERIES(150, 450, 50),
        "Mevcut", [Value] * Birim,
        "Yeni", IF([Value] >= 250, 3000 + 0.88 * [Value] * Birim),
        "Kendi", 18000 + 0.55 * [Value] * Birim,
        "En ucuz",
            VAR M = [Value] * Birim
            VAR Y = IF([Value] >= 250, 3000 + 0.88 * [Value] * Birim, M)
            VAR K = 18000 + 0.55 * [Value] * Birim
            RETURN SWITCH(TRUE(), K <= MIN(M, Y), "Kendi üretim", Y < M, "Yeni tedarikçi", "Mevcut tedarikçi")
    )`;
T(q4);
console.log(ev(`VAR Birim = CALCULATE(DIVIDE([Net Maliyet], [Satılan Adet]), Tarih[Yil] = 2024, ${L}) RETURN 18000 / (0.45 * Birim)`), ev(`VAR Birim = CALCULATE(DIVIDE([Net Maliyet], [Satılan Adet]), Tarih[Yil] = 2024, ${L}) RETURN 15000 / (0.33 * Birim)`), ev(`VAR Birim = CALCULATE(DIVIDE([Net Maliyet], [Satılan Adet]), Tarih[Yil] = 2024, ${L}) RETURN 3000 / (0.12 * Birim)`), ev(`VAR Birim = CALCULATE(DIVIDE([Net Maliyet], [Satılan Adet]), Tarih[Yil] = 2024, ${L}) RETURN 36000 / (0.45 * Birim)`));
require('fs').writeFileSync('q3.txt', q3); require('fs').writeFileSync('q4.txt', q4);
