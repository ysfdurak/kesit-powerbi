"""Power BI davranış yoklaması: boş satır (blank row) ve dil. kontrol.py ile aynı bağlantıyı kullanır."""
import kontrol as k

PROBES = [
    ("COUNTROWS(Tarih)", 'EVALUATE ROW("v", COUNTROWS(Tarih))'),
    ("COUNTROWS(ALL(Tarih))", 'EVALUATE ROW("v", COUNTROWS(ALL(Tarih)))'),
    ("COUNTROWS(VALUES(Tarih))", 'EVALUATE ROW("v", COUNTROWS(VALUES(Tarih)))'),
    ("COUNTROWS(FILTER(Tarih, TRUE()))", 'EVALUATE ROW("v", COUNTROWS(FILTER(Tarih, TRUE())))'),
    ("COUNTROWS(ALLNOBLANKROW(Tarih))", 'EVALUATE ROW("v", COUNTROWS(ALLNOBLANKROW(Tarih)))'),
    ("COUNTROWS(VALUES(Tarih[Yil]))", 'EVALUATE ROW("v", COUNTROWS(VALUES(Tarih[Yil])))'),
    ("COUNTROWS(DISTINCT(Tarih[Yil]))", 'EVALUATE ROW("v", COUNTROWS(DISTINCT(Tarih[Yil])))'),
    ("COUNTROWS(ALL(Tarih[Yil]))", 'EVALUATE ROW("v", COUNTROWS(ALL(Tarih[Yil])))'),
    ("SUMX(Tarih, 1)", 'EVALUATE ROW("v", SUMX(Tarih, 1))'),
    ("COUNTROWS(VALUES(Urunler))", 'EVALUATE ROW("v", COUNTROWS(VALUES(Urunler)))'),
    ("Yil boş satırda net satış", 'EVALUATE ROW("v", CALCULATE([Net Satış], Tarih[Yil] = BLANK()))'),
    ("Yil boş satırda teslim", 'EVALUATE ROW("v", CALCULATE([Net Satış], Tarih[Yil] = BLANK(), USERELATIONSHIP(Satislar[TeslimTarihi], Tarih[Tarih])))'),
    ("FILTER(VALUES(Tarih[Yil]), Yil > 2022)", 'EVALUATE ROW("v", COUNTROWS(FILTER(VALUES(Tarih[Yil]), Tarih[Yil] > 2022)))'),
    ("Kategori filtresinde VALUES(Tarih[Yil])", 'EVALUATE ROW("v", CALCULATE(COUNTROWS(VALUES(Tarih[Yil])), Tarih[Yil] = 2023))'),
    ("Kategori ile CROSS: SUMMARIZECOLUMNS Yil", 'EVALUATE SUMMARIZECOLUMNS(Tarih[Yil], "n", COUNTROWS(Satislar))'),
    ("SUMMARIZECOLUMNS Yil sabit ölçü", 'EVALUATE SUMMARIZECOLUMNS(Tarih[Yil], "n", 1)'),
    ("UPPER i", 'EVALUATE ROW("v", UPPER("bisiklet"))'),
    ("FORMAT varsayılan", 'EVALUATE ROW("v", FORMAT(1234.5, "#,##0.0"))'),
    ("FORMAT tr-TR", 'EVALUATE ROW("v", FORMAT(1234.5, "#,##0.0", "tr-TR"))'),
    ("FORMAT ay", 'EVALUATE ROW("v", FORMAT(DATE(2024, 1, 1), "mmmm yyyy"))'),
    ("CURRENCY", 'EVALUATE ROW("v", CURRENCY(1.234567) * 3)'),
    ("DATATABLE CURRENCY", 'EVALUATE SELECTCOLUMNS(DATATABLE("a", CURRENCY, {{1.234567}}), "b", [a] * 1.5)'),
]

def main():
    port = k.find_port()
    c = k.Conn(k.find_adomd(), port)
    out = []
    for name, q in PROBES:
        try:
            cols, rows = c.run(q)
            val = rows if len(rows) != 1 or len(rows[0]) != 1 else rows[0][0]
        except Exception as e:  # noqa: BLE001
            val = "HATA: " + str(e)[:200]
        out.append(f"{name} :: {val}")
        print(out[-1])
    with open("yoklama.txt", "w", encoding="utf-8") as fh:
        fh.write("\n".join(out) + "\n")

if __name__ == "__main__":
    main()
