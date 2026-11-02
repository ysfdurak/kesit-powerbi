exports.K = `DATATABLE(
    "KrediNo", STRING, "Segment", STRING, "Tutar", CURRENCY, "YillikFaiz", DOUBLE,
    "Vade", INTEGER, "Baslangic", DATETIME, "GecikmeGun", INTEGER,
    {
        {"K01", "KOBİ", 400000, 0.42, 24, "2024-01-15", 0},
        {"K02", "KOBİ", 250000, 0.45, 12, "2024-06-01", 45},
        {"K03", "Bireysel", 120000, 0.48, 36, "2023-09-01", 0},
        {"K04", "Bireysel", 80000, 0.50, 24, "2024-03-01", 120},
        {"K05", "Kurumsal", 1000000, 0.38, 36, "2023-04-01", 0},
        {"K06", "Kurumsal", 600000, 0.40, 24, "2024-09-01", 0},
        {"K07", "KOBİ", 300000, 0.44, 18, "2023-12-01", 0},
        {"K08", "Bireysel", 60000, 0.52, 12, "2024-02-01", 35},
        {"K09", "KOBİ", 150000, 0.46, 24, "2024-04-01", 95},
        {"K10", "Kurumsal", 450000, 0.39, 12, "2024-07-01", 0}
    }
)`;
exports.PLAN = `GENERATE(
    Krediler,
    VAR i = [YillikFaiz] / 12
    VAR A = PMT(i, [Vade], -[Tutar])
    VAR P0 = [Tutar]
    VAR Bas = [Baslangic]
    RETURN
        SELECTCOLUMNS(
            GENERATESERIES(1, [Vade]),
            "TaksitNo", [Value],
            "OdemeTarihi", EDATE(Bas, [Value]),
            "Taksit", A,
            "Faiz", (P0 * POWER(1 + i, [Value] - 1) - A * (POWER(1 + i, [Value] - 1) - 1) / i) * i,
            "Kalan", P0 * POWER(1 + i, [Value]) - A * (POWER(1 + i, [Value]) - 1) / i
        )
)`;
