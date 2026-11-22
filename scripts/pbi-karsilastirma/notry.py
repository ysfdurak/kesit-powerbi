"""Kesit Power BI: motorda çalışmayan (data-notry) ders bloklarını gerçek Power BI Desktop'ta dener.
Açık modelde (model.tmdl uygulanmış) çalıştır: python notry.py notry.json → notry_sonuc.txt
"""
import json, os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from kontrol import find_adomd, find_port, Conn

EKSIK = re.compile(r"cannot be found|bulunamad|wasn't found|not be found|doesn't exist|does not exist|failed to resolve name|çözümlenemedi", re.I)

def main():
    T = json.load(open(os.path.join(HERE, sys.argv[1] if len(sys.argv) > 1 else "notry.json"), encoding="utf-8"))
    c = Conn(find_adomd(), find_port())
    out, say = [], {"çalıştı": 0, "eksik nesne (beklenen)": 0, "hata": 0}
    for t in T:
        try:
            cols, rows = c.run(t["q"])
            durum = "çalıştı"; ayr = "%d satır; %s; ilk: %s" % (len(rows), cols, rows[:20] if t["tur"] == "yokla" else rows[:2])
        except Exception as e:
            msg = str(e).split("\n")[0][:300]
            durum = "eksik nesne (beklenen)" if EKSIK.search(msg) else "hata"; ayr = msg
        say[durum] += 1
        out.append("%s [%s] %s %s → %s\n    %s" % (t["id"], t["tur"], t["f"], t["ders"], durum, ayr))
    s = "Özet: " + ", ".join("%s %d" % kv for kv in say.items()) + "\n\n" + "\n".join(out)
    open(os.path.join(HERE, "notry_sonuc.txt"), "w", encoding="utf-8").write(s)
    print(s)

if __name__ == "__main__":
    main()
