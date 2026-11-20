"""Kesit Power BI: benzetim motoru sonuçlarını açık Power BI Desktop modeliyle karşılaştırır.

Kullanım (Power BI Desktop'ta model açık ve yenilenmişken):
    python kontrol.py
Çıktı: sonuc.txt (özet + farklar) ve sonuc.json (tüm ayrıntı), bu dosyanın yanına yazılır.
Gerekli: pip install pythonnet
"""
import glob
import json
import math
import os
import sys
import datetime as dt

HERE = os.path.dirname(os.path.abspath(__file__))


def find_adomd():
    pats = [
        r"C:\Program Files\Microsoft Power BI Desktop\bin\Microsoft.PowerBI.AdomdClient.dll",
        r"C:\Program Files\Microsoft Power BI Desktop\bin\Microsoft.AnalysisServices.AdomdClient.dll",
        r"C:\Program Files\WindowsApps\Microsoft.MicrosoftPowerBIDesktop*\bin\Microsoft.PowerBI.AdomdClient.dll",
        r"C:\Program Files\Microsoft.NET\ADOMD.NET\*\Microsoft.AnalysisServices.AdomdClient.dll",
        r"C:\Program Files (x86)\Microsoft.NET\ADOMD.NET\*\Microsoft.AnalysisServices.AdomdClient.dll",
    ]
    for p in pats:
        hits = sorted(glob.glob(p))
        if hits:
            return hits[-1]
    return None


def find_port():
    pats = [
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Power BI Desktop\AnalysisServicesWorkspaces\*\Data\msmdsrv.port.txt"),
        os.path.expandvars(r"%USERPROFILE%\Microsoft\Power BI Desktop Store App\AnalysisServicesWorkspaces\*\Data\msmdsrv.port.txt"),
    ]
    files = [f for p in pats for f in glob.glob(p)]
    if not files:
        return None
    newest = max(files, key=os.path.getmtime)
    raw = open(newest, "rb").read()
    for enc in ("utf-16", "utf-8"):
        try:
            txt = raw.decode(enc).strip().strip("\x00")
            if txt.isdigit():
                return txt
        except UnicodeDecodeError:
            pass
    return "".join(ch for ch in raw.decode("latin-1") if ch.isdigit())


def norm(v):
    if v is None:
        return None
    try:
        import System  # noqa
        if isinstance(v, System.DBNull):
            return None
        if isinstance(v, System.DateTime):
            return "D:%04d-%02d-%02d" % (v.Year, v.Month, v.Day)
        if isinstance(v, System.Decimal):
            return float(System.Decimal.ToDouble(v))
    except Exception:
        pass
    if isinstance(v, (dt.datetime, dt.date)):
        return "D:" + v.strftime("%Y-%m-%d")
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v)
    if len(s) >= 10 and s[4] == "-" and s[7] == "-" and (len(s) == 10 or s[10] in "T "):
        if s[11:19] in ("", "00:00:00"):
            return "D:" + s[:10]
    return s


def eq(a, b):
    a, b = norm_exp(a), norm_exp(b)
    if a is None or b is None:
        return a is None and b is None
    if isinstance(a, bool) or isinstance(b, bool):
        return bool(a) == bool(b)
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        if not (math.isfinite(a) and math.isfinite(b)):
            return a == b
        return abs(a - b) <= 1e-7 * max(1.0, abs(b))
    return str(a) == str(b)


def norm_exp(v):
    if isinstance(v, bool):
        return v
    if isinstance(v, float) and not math.isfinite(v):
        return "NAN" if math.isnan(v) else ("INF" if v > 0 else "-INF")
    if isinstance(v, int):
        return float(v)
    if isinstance(v, str) and v == "":
        return None  # boş metin ile BLANK ayrımı burada önemsiz sayılır
    return v


# Ortamdan gelen, motor hatası sayılmayan farklar ayrı sınıflanır.
EN_TR = [("January", "Ocak"), ("February", "Şubat"), ("March", "Mart"), ("April", "Nisan"), ("May", "Mayıs"), ("June", "Haziran"),
         ("July", "Temmuz"), ("August", "Ağustos"), ("September", "Eylül"), ("October", "Ekim"), ("November", "Kasım"), ("December", "Aralık"),
         ("Monday", "Pazartesi"), ("Tuesday", "Salı"), ("Wednesday", "Çarşamba"), ("Thursday", "Perşembe"), ("Friday", "Cuma"), ("Saturday", "Cumartesi"), ("Sunday", "Pazar"),
         ("Jan", "Oca"), ("Feb", "Şub"), ("Mar", "Mar"), ("Apr", "Nis"), ("Jun", "Haz"), ("Jul", "Tem"), ("Aug", "Ağu"), ("Sep", "Eyl"), ("Oct", "Eki"), ("Nov", "Kas"), ("Dec", "Ara")]


def en_to_tr(s):
    """İngilizce kültürle biçimlenmiş metni Türkçe karşılığına çevirir (binlik/ondalık ayracı ve ay/gün adları)."""
    import re
    if not isinstance(s, str):
        return s
    for e, t in EN_TR:
        s = re.sub(r"\b%s\b" % e, t, s)
    return re.sub(r"(?<=\d)[.,](?=\d)", lambda m: "," if m.group(0) == "." else ".", s)


def tr_fold(s):
    return s.replace("İ", "I").replace("ı", "i") if isinstance(s, str) else s


def kind_of(motor, pbi):
    """'dil': yalnız biçim dili/büyük harf kuralı farkı; 'para': 4 ondalık para yuvarlaması; None: gerçek fark."""
    if isinstance(motor, str) and isinstance(pbi, str) and (eq(motor, en_to_tr(pbi)) or tr_fold(motor) == tr_fold(pbi)):
        return "dil"
    a, b = norm_exp(motor), norm_exp(pbi)
    if isinstance(a, float) and isinstance(b, float) and abs(a - b) < 0.01:
        return "para"
    return None


def query_kind(want, got, ordered):
    """Sorgudaki tüm farklar biçim dili ya da para yuvarlamasıysa o türü, değilse None döndürür."""
    if len(want) != len(got):
        return None
    if not ordered:
        want = sorted(want, key=lambda r: repr([keyify(v) for v in r]))
        got = sorted(got, key=lambda r: repr([keyify(v) for v in r]))
    ks = set()
    for x, y in zip(want, got):
        if len(x) != len(y):
            return None
        for p, q in zip(x, y):
            if not eq(p, q):
                ks.add(kind_of(p, q))
    if None in ks:
        return None
    return "para" if not ks or "para" in ks else "dil"  # boş küme: farklar yalnız 6. ondalıkta


def dlit(v):
    if v is None:
        return "BLANK()"
    if isinstance(v, bool):
        return "TRUE()" if v else "FALSE()"
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str) and v.startswith("D:"):
        y, mo, d = v[2:].split("-")
        return "DATE(%d, %d, %d)" % (int(y), int(mo), int(d))
    return '"' + str(v).replace('"', '""') + '"'


def treatas(x):
    return "TREATAS({%s}, %s)" % (", ".join(dlit(v) for v in x["values"]), qcol(x["t"], x["c"]))


def slwrap(ref, sl):
    return "CALCULATE(%s, %s)" % (ref, ", ".join(treatas(x) for x in sl)) if sl else ref


def mdef(m):
    """(DEFINE öneki, ölçü başvurusu). Alıştırma ölçüleri modelde; 2. tur ölçüleri sorguda tanımlanır."""
    if m.get("inModel"):
        return "", m["expr"]
    if "defs" in m:
        esc = lambda n: n.replace("]", "]]")
        home = m.get("home", "Satislar").replace("'", "''")
        lines = ["MEASURE '%s'[%s] = %s" % (home, esc(d["name"]), d["expr"]) for d in m["defs"]]
        lines.append("MEASURE '%s'[%s] = %s" % (home, m["code"], m["expr"]))
        return "DEFINE\n" + "\n".join(lines) + "\n", "[%s]" % m["code"]
    return "", "[%s]" % m["code"]


ORTAM = {"embed-api#6": "USERPRINCIPALNAME Desktop'ta senin hesabını döndürür"}


def keyify(v):
    v = norm_exp(v)
    if isinstance(v, float) and v == int(v):
        return str(int(v))
    return "" if v is None else str(v)


class Conn:
    def __init__(self, dll, port):
        try:
            import clr  # pythonnet
        except ImportError:
            print("Bu Python'da pythonnet yok (%s)." % sys.executable)
            print("Önceki çalıştırmada kullandığın Anaconda Prompt penceresini aç ya da bu pencerede şunu çalıştır: python -m pip install pythonnet")
            sys.exit(1)
        clr.AddReference(dll)
        try:
            from Microsoft.AnalysisServices.AdomdClient import AdomdConnection
        except ImportError:
            from Microsoft.PowerBI.AdomdClient import AdomdConnection  # bazı sürümler
        # LocaleIdentifier=1055: oturum Türkçe (FORMAT, ay adları); Desktop arayüzü İngilizce olsa da
        self.c = AdomdConnection("Data Source=localhost:%s;LocaleIdentifier=1055" % port)
        self.c.Open()

    def run(self, dax):
        cmd = self.c.CreateCommand()
        cmd.CommandText = dax
        r = cmd.ExecuteReader()
        cols = [r.GetName(i) for i in range(r.FieldCount)]
        rows = []
        while r.Read():
            rows.append([norm(r.GetValue(i)) for i in range(r.FieldCount)])
        r.Close()
        return cols, rows


def qcol(t, c):
    return "'%s'[%s]" % (t.replace("'", "''"), c)


def main():
    dll = find_adomd()
    if not dll:
        print("ADOMD istemcisi bulunamadı. Power BI Desktop kurulu mu?")
        sys.exit(1)
    port = find_port()
    if not port:
        print("Açık Power BI Desktop modeli bulunamadı. Modeli açıp tekrar deneyin.")
        sys.exit(1)
    print("ADOMD:", dll)
    print("Port:", port)
    db = Conn(dll, port)
    BEK = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, "beklenen.json")
    OUTD = os.path.dirname(BEK)
    exp = json.load(open(BEK, encoding="utf-8"))

    # 1) ölçü durumları
    states = {}
    try:
        cols, rows = db.run('EVALUATE SELECTCOLUMNS(INFO.MEASURES(), "N", [Name], "S", [State], "E", [ErrorMessage])')
        states = {r[0]: (r[1], r[2]) for r in rows}
    except Exception as e:  # INFO fonksiyonları yoksa atla
        print("INFO.MEASURES kullanılamadı:", e)

    results = {"measures": [], "queries": [], "baseMeasureErrors": []}
    for name, (st, err) in states.items():
        if err and not (name.startswith("X") and name[1:].isdigit()):
            results["baseMeasureErrors"].append({"name": name, "state": st, "error": err})

    # 2) ölçü alıştırmaları
    for i, m in enumerate(exp["measures"], 1):
        rec = {"code": m["code"], "lesson": m["lesson"], "idx": m["idx"], "name": m["name"], "expr": m["expr"], "diffs": [], "error": None}
        st = states.get(m["code"])
        if st and st[1]:
            rec["error"] = "Ölçü tanımı hatalı: " + str(st[1])
        else:
            for ch in m["checks"]:
                try:
                    if ch["kind"] == "total":
                        pre, ref = mdef(m)
                        _, rows = db.run(pre + 'EVALUATE ROW("v", %s)' % slwrap(ref, ch.get("sl")))
                        got = rows[0][0] if rows else None
                        if not eq(got, ch["value"]):
                            rec["diffs"].append({"kesit": "Toplam", "motor": ch["value"], "powerbi": got})
                    else:
                        col = qcol(ch["t"], ch["c"])
                        pre, ref = mdef(m)
                        q = 'ADDCOLUMNS(VALUES(%s), "v", %s)' % (col, ref)
                        if ch.get("sl"):
                            q = "CALCULATETABLE(%s, %s)" % (q, ", ".join(treatas(x) for x in ch["sl"]))
                        _, rows = db.run(pre + "EVALUATE " + q)
                        got = {keyify(r[0]): r[1] for r in rows}
                        want = {keyify(k): v for k, v in ch["rows"]}
                        for k in sorted(set(got) | set(want)):
                            g, w = got.get(k), want.get(k)
                            if not eq(g, w):
                                rec["diffs"].append({"kesit": "%s[%s]=%s" % (ch["t"], ch["c"], k), "motor": w, "powerbi": g})
                except Exception as e:
                    rec["error"] = str(e).splitlines()[0][:400]
                    break
        if rec["diffs"]:
            ks = set(kind_of(d["motor"], d["powerbi"]) for d in rec["diffs"])
            key = "%s#%s" % (m["lesson"], m["idx"])
            rec["kind"] = "ortam" if (key in ORTAM or m.get("env")) else (ks.pop() if len(ks) == 1 and None not in ks else None)
        results["measures"].append(rec)
        if i % 25 == 0:
            print("ölçü", i, "/", len(exp["measures"]))

    # 3) sorgu alıştırmaları
    for i, qx in enumerate(exp["queries"], 1):
        rec = {"code": qx["code"], "lesson": qx["lesson"], "idx": qx["idx"], "sol": qx["sol"], "diff": None, "error": None}
        try:
            cols, rows = db.run(qx["sol"])
            want = qx.get("rows") or []
            ordered = "ORDER BY" in qx["sol"].upper()
            a = [[keyify(v) if not isinstance(norm_exp(v), float) else round(norm_exp(v), 6) for v in r] for r in rows]
            b = [[keyify(v) if not isinstance(norm_exp(v), float) else round(norm_exp(v), 6) for v in r] for r in want]
            if not ordered:
                a, b = sorted(map(repr, a)), sorted(map(repr, b))
            if len(rows) != len(want):
                rec["diff"] = "satır sayısı: motor %d, Power BI %d" % (len(want), len(rows))
            elif a != b and ordered and sorted(map(repr, a)) == sorted(map(repr, b)):
                rec["kind"] = "sıra"  # ORDER BY eşit değerlerin sırasını belirlemiyor; satırlar aynı
                rec["diff"] = "yalnız eşit değerli satırların sırası farklı"
            elif a != b and query_kind(want, rows, ordered):
                rec["kind"] = query_kind(want, rows, ordered)
                first = next(((x, y) for x, y in zip(b, a) if x != y), None)
                rec["diff"] = "değer farkı; ilk fark: motor %s / Power BI %s" % first if first else "fark var"
            elif a != b:
                first = next(((x, y) for x, y in zip(b, a) if x != y), None)
                rec["diff"] = "değer farkı; ilk fark: motor %s / Power BI %s" % first if first else "fark var"
            if len(cols) != len(qx.get("cols") or []):
                rec["diff"] = (rec["diff"] + "; " if rec["diff"] else "") + "sütun sayısı: motor %d, Power BI %d" % (len(qx.get("cols") or []), len(cols))
        except Exception as e:
            rec["error"] = str(e).splitlines()[0][:400]
        results["queries"].append(rec)
        if i % 25 == 0:
            print("sorgu", i, "/", len(exp["queries"]))

    json.dump(results, open(os.path.join(OUTD, "sonuc.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ms = results["measures"]; qs = results["queries"]
    lines = []
    lines.append("ÖZET")
    lines.append("Ölçü alıştırması: %d | birebir aynı: %d | farklı: %d | Power BI hatası: %d" % (
        len(ms), sum(1 for r in ms if not r["diffs"] and not r["error"]), sum(1 for r in ms if r["diffs"]), sum(1 for r in ms if r["error"])))
    lines.append("Sorgu alıştırması: %d | birebir aynı: %d | farklı: %d | Power BI hatası: %d" % (
        len(qs), sum(1 for r in qs if not r["diff"] and not r["error"]), sum(1 for r in qs if r["diff"]), sum(1 for r in qs if r["error"])))
    lines.append("Hazır ölçülerde hata: %d" % len(results["baseMeasureErrors"]))
    real_m = [r for r in ms if r["diffs"] and not r.get("kind")]
    real_q = [r for r in qs if r["diff"] and not r.get("kind")]
    lines.append("Gerçek fark: ölçü %d, sorgu %d | biçim dili (Desktop arayüz dili): %d | 4 ondalık para yuvarlaması: %d | ortam: %d" % (
        len(real_m), len(real_q), sum(1 for r in ms + qs if r.get("kind") == "dil"), sum(1 for r in ms + qs if r.get("kind") == "para"), sum(1 for r in ms if r.get("kind") == "ortam")) + (" | eşitlerin sırası: %d" % sum(1 for r in qs if r.get("kind") == "sıra") if any(r.get("kind") == "sıra" for r in qs) else ""))
    lines.append("")
    for r in results["baseMeasureErrors"]:
        lines.append("HAZIR ÖLÇÜ HATASI  %s: %s" % (r["name"], r["error"]))
    for r in ms:
        if r["error"]:
            lines.append("HATA  %s  %s%s %s :: %s" % (r["code"], r["lesson"], ("#%s" % r["idx"]) if r["idx"] != "" else "", r["name"], r["error"]))
    for r in ms:
        if r["diffs"]:
            d = r["diffs"][:3]
            lines.append(("FARK  " if not r.get("kind") else "(%s)  " % r["kind"]) + "%s  %s%s %s :: %d fark; ör. %s" % (r["code"], r["lesson"], ("#%s" % r["idx"]) if r["idx"] != "" else "", r["name"], len(r["diffs"]),
                         " | ".join("%s motor=%r pbi=%r" % (x["kesit"], x["motor"], x["powerbi"]) for x in d)))
    for r in qs:
        if r["error"]:
            lines.append("SORGU HATA  %s  %s%s :: %s" % (r["code"], r["lesson"], ("#%s" % r["idx"]) if r["idx"] != "" else "", r["error"]))
        elif r["diff"]:
            lines.append(("SORGU FARK  " if not r.get("kind") else "(sorgu %s)  " % r["kind"]) + "%s  %s%s :: %s" % (r["code"], r["lesson"], ("#%s" % r["idx"]) if r["idx"] != "" else "", r["diff"]))
    open(os.path.join(OUTD, "sonuc.txt"), "w", encoding="utf-8").write("\n".join(lines))
    print("\n".join(lines[:7]))
    print("Ayrıntı: sonuc.txt ve sonuc.json")


if __name__ == "__main__":
    main()
