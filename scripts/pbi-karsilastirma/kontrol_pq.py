"""Power Query karşılaştırması: python kontrol_pq.py pq\\beklenen.json
Her PQxxx tablosunu (satır, sütun, tür etiketli değer) okur ve tarayıcıdaki M motorunun sonucuyla karşılaştırır."""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kontrol import find_adomd, find_port, Conn


def dec(v):
    if isinstance(v, str) and v.startswith("x:"):
        try:
            return "t:" + bytes.fromhex(v[2:]).decode("utf-8")
        except ValueError:
            return v
    return v


ENV_DATES = False


def same(a, b):
    if a == b:
        return True
    if ENV_DATES and isinstance(a, str) and isinstance(b, str) and a.startswith("dt:") and b.startswith("dt:"):
        return True  # Folder.Files tarihleri dosyanın PC'deki zamanıdır
    if isinstance(a, str) and isinstance(b, str) and a[:2] in ("n:", "du") and a.split(":", 1)[0] == b.split(":", 1)[0]:
        try:
            x, y = float(a.split(":", 1)[1]), float(b.split(":", 1)[1])
            return (math.isnan(x) and math.isnan(y)) or abs(x - y) <= 1e-9 * max(1.0, abs(y))
        except ValueError:
            return False
    return False


def main():
    bek = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "beklenen.json")
    exp = json.load(open(bek, encoding="utf-8"))["pq"]
    dll, port = find_adomd(), find_port()
    if not dll or not port:
        print("Power BI Desktop modeli ya da ADOMD bulunamadı."); sys.exit(1)
    db = Conn(dll, port)
    res, lines = [], []
    for i, it in enumerate(exp, 1):
        rec = {"code": it["code"], "lesson": it["lesson"], "diff": None, "error": None}
        try:
            _, rows = db.run("EVALUATE '%s'" % it["code"])
            global ENV_DATES
            ENV_DATES = bool(it.get("envDates"))
            allg = [(int(r[0]), int(r[1]), dec(r[2])) for r in rows]
            msg = [g[2] for g in allg if g[0] < 0]
            got = sorted(g for g in allg if g[0] >= 0)
            want = sorted((int(r[0]), int(r[1]), r[2]) for r in it["rows"])
            if msg:
                rec["pbi_mesaj"] = msg[0]
            if it.get("unordered"):
                def rowsort(cells):
                    hdr = [c for c in cells if c[0] == 0]
                    body = {}
                    for c in cells:
                        if c[0] > 0:
                            body.setdefault(c[0], []).append((c[1], c[2]))
                    rs = sorted(tuple(v for _, v in sorted(r)) for r in body.values())
                    return hdr + [(i + 1, j, v) for i, r in enumerate(rs) for j, v in enumerate(r)]
                got, want = sorted(rowsort(got)), sorted(rowsort(want))
            if (0, 0, "HATA") in got and (0, 0, "HATA") in want:
                rec["both_error"] = True  # ikisi de hata verdi; hata nedeni (Reason) farklı olabilir
                if got != want:
                    rec["neden"] = "motor %s / Power BI %s" % ([w[2] for w in want if w[0] == 1][:1], [g[2] for g in got if g[0] == 1][:1])
            elif len(got) != len(want) or any(g[:2] != w[:2] or not same(g[2], w[2]) for g, w in zip(got, want)):
                gd, wd = dict(((g[0], g[1]), g[2]) for g in got), dict(((w[0], w[1]), w[2]) for w in want)
                keys = sorted(set(gd) | set(wd))
                bad = [(k, wd.get(k), gd.get(k)) for k in keys if not same(gd.get(k), wd.get(k))]
                rec["pbi"] = got
                rec["diff"] = "%d hücre farklı (motor %d, Power BI %d hücre); ilk: %s" % (len(bad), len(want), len(got), "; ".join("[%d,%d] motor=%r pbi=%r" % (k[0], k[1], w, g) for k, w, g in bad[:3]))
        except Exception as e:
            rec["error"] = str(e).splitlines()[0][:300]
        res.append(rec)
        if i % 50 == 0:
            print("pq", i, "/", len(exp))
    od = os.path.dirname(bek)
    stem = os.path.splitext(os.path.basename(bek))[0].replace("beklenen", "")
    json.dump(res, open(os.path.join(od, "sonuc%s.json" % stem), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    lines.append("ÖZET")
    lines.append("M sorgusu: %d | aynı: %d | farklı: %d | okunamadı: %d" % (len(res), sum(1 for r in res if not r["diff"] and not r["error"]), sum(1 for r in res if r["diff"]), sum(1 for r in res if r["error"])))
    nb = sum(1 for r in res if r.get("both_error"))
    if nb:
        lines.append("İkisi de hata verdi (aynı sayılır): %d | hata nedeni farklı: %d" % (nb, sum(1 for r in res if r.get("neden"))))
    lines.append("")
    for r in res:
        if r.get("neden"):
            lines.append("NEDEN  %s  %s :: %s%s" % (r["code"], r["lesson"], r["neden"], (" | " + r["pbi_mesaj"]) if r.get("pbi_mesaj") else ""))
    for r in res:
        if r["error"]:
            lines.append("HATA  %s  %s :: %s" % (r["code"], r["lesson"], r["error"]))
        elif r["diff"]:
            lines.append("FARK  %s  %s :: %s%s" % (r["code"], r["lesson"], r["diff"], (" | Power BI hatası: " + r["pbi_mesaj"]) if r.get("pbi_mesaj") else ""))
    open(os.path.join(od, "sonuc%s.txt" % stem), "w", encoding="utf-8").write("\n".join(lines))
    print("\n".join(lines[:3]))
    print("Ayrıntı: sonuc.txt")


if __name__ == "__main__":
    main()
