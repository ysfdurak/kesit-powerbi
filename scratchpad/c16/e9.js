require('./h.js');
const K = `DATATABLE(
    "KrediNo", STRING, "Segment", STRING, "Tutar", CURRENCY, "YillikFaiz", DOUBLE, "Vade", INTEGER, "Baslangic", DATETIME, "Durum", STRING,
    {
        {"K01", "KOBİ", 400000, 0.42, 24, "2024-01-15", "Düzenli"},
        {"K02", "KOBİ", 250000, 0.45, 12, "2024-06-01", "Gecikmede"},
        {"K03", "Bireysel", 120000, 0.48, 36, "2023-09-01", "Düzenli"},
        {"K04", "Bireysel", 80000, 0.50, 24, "2024-03-01", "Takipte"},
        {"K05", "Kurumsal", 1000000, 0.38, 36, "2023-04-01", "Düzenli"},
        {"K06", "Kurumsal", 600000, 0.40, 24, "2024-09-01", "Düzenli"},
        {"K07", "KOBİ", 300000, 0.44, 18, "2023-12-01", "Düzenli"},
        {"K08", "Bireysel", 60000, 0.52, 12, "2024-02-01", "Gecikmede"}
    }
)`;
const plan = `GENERATE(Krediler, VAR i = [YillikFaiz] / 12 VAR A = PMT(i, [Vade], -[Tutar]) VAR P0 = [Tutar] RETURN
  ADDCOLUMNS(GENERATESERIES(1, [Vade]), "Tarih", EDATE([Baslangic], [Value]), "Taksit", A,
   "Faiz", (P0 * POWER(1 + i, [Value] - 1) - A * (POWER(1 + i, [Value] - 1) - 1) / i) * i,
   "Kalan", P0 * POWER(1 + i, [Value]) - A * (POWER(1 + i, [Value]) - 1) / i))`;
T(`DEFINE VAR Krediler = ${K}
EVALUATE ADDCOLUMNS(Krediler, "Taksit", PMT([YillikFaiz]/12, [Vade], -[Tutar]))`);
T(`DEFINE VAR Krediler = ${K}
EVALUATE TOPN(5, FILTER(${plan}, [KrediNo] = "K01"), [Value], ASC)`);
