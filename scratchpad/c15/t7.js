require('./h.js');
const K={t:'Kategoriler',c:'Kategori'}, Y={t:'Tarih',c:'Yil'};
const P = s => { try { const r = rq(s); console.log(JSON.stringify(r.map(x=>x.map(v=>typeof v==='number'?Math.round(v*10000)/10000:v)))); } catch(e) { console.log('ERR', e.message); } };
for (const e of ['[Stok Değeri]','[Net Maliyet]','DIVIDE([Net Maliyet], [Stok Değeri])','DIVIDE([Brüt Kâr], [Stok Değeri])'])
  console.log(e, '| T', ev(e), '|', q(e,K).join(' '), '|', q(e,Y).join(' '));
const MZ = `VAR Mizan = DATATABLE("Hesap", STRING, "Ad", STRING, "Sira", INTEGER, "Borc", CURRENCY, "Alacak", CURRENCY, {
    {"600", "Yurt içi satışlar", 1, 0, 930000},
    {"610", "Satıştan iadeler", 2, 30000, 0},
    {"621", "Satılan ticari mallar maliyeti", 4, 560000, 0},
    {"631", "Pazarlama, satış ve dağıtım giderleri", 6, 120000, 0},
    {"632", "Genel yönetim giderleri", 6, 101250, 0},
    {"660", "Kısa vadeli borçlanma giderleri", 8, 25000, 0},
    {"691", "Dönem kârı vergi karşılığı", 10, 18750, 0}})
VAR Satirlar = DATATABLE("Sira", INTEGER, "Satir", STRING, "AraToplam", BOOLEAN, {
    {1, "Brüt satışlar", FALSE}, {2, "Satış indirimleri", FALSE}, {3, "Net satışlar", TRUE},
    {4, "Satışların maliyeti", FALSE}, {5, "Brüt kâr", TRUE}, {6, "Faaliyet giderleri", FALSE},
    {7, "Esas faaliyet kârı", TRUE}, {8, "Finansman giderleri", FALSE}, {9, "Vergi öncesi kâr", TRUE},
    {10, "Vergi", FALSE}, {11, "Dönem net kârı", TRUE}})`;
P(`EVALUATE\n${MZ}\nRETURN ADDCOLUMNS(Satirlar, "Tutar",
    VAR S = [Sira]
    VAR Ara = [AraToplam]
    RETURN IF(Ara, SUMX(FILTER(Mizan, [Sira] < S), [Alacak] - [Borc]), SUMX(FILTER(Mizan, [Sira] = S), [Alacak] - [Borc])))`);
P(`EVALUATE\nROW("t", DATATABLE("x", BOOLEAN, {{TRUE}}))`);
