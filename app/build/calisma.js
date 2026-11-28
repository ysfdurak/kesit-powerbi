/* Anadolu Market çalışma paketini üretir: node build/calisma.js  →  app/veri/anadolu-market-calisma.zip
   İçerik: Power BI proje dosyası (PBIP: SemanticModel/model.bim + boş bir Report), Veri/*.csv, Olculer.dax, BENIOKU.md, DOGRULAMA.md.
   Veri Power Query içine gömülüdür (Binary.Decompress + Csv.Document); dış kaynak ya da yol gerekmez.
   Yapı, Desktop'ta doğrulanan Lezzet Kurye referans paketiyle aynıdır (compatibilityLevel 1600, PBIR). */
const fs = require('fs'), path = require('path'), zlib = require('zlib'), cp = require('child_process'), crypto = require('crypto');
global.window = global;
const APP = path.join(__dirname, '..') + '/';
for (const f of ['data', 'data2', 'dax', 'measures', 'patterns']) require(APP + f + '.js');
const M = window.PBI_MODEL, X = window.PBI_DAX, LIB = window.PBI_MEASURES;
const AD = 'Anadolu-Market';
const TABLOLAR = ['Satislar', 'Urunler', 'Musteriler', 'Tarih', 'Kategoriler', 'Hedefler', 'Calisanlar', 'Departmanlar', 'StokGorunum', 'OlcuSecimi'];
const uuid = s => { const h = crypto.createHash('sha1').update('kesit-pbi:' + s).digest('hex'); return [h.slice(0, 8), h.slice(8, 12), '5' + h.slice(13, 16), '8' + h.slice(17, 20), h.slice(20, 32)].join('-'); };
const isDate = v => v instanceof Date;
const ymd = d => d.toISOString().slice(0, 10);

/* ---------------------------------------------------------------- sütun türleri ve CSV */
function tur(t, c) {
  const vs = M.tables[t].rows.map(r => r[c]).filter(v => v !== null && v !== undefined);
  if (!vs.length) return 'string';
  if (vs.every(isDate)) return 'date';
  if (vs.every(v => typeof v === 'boolean')) return 'boolean';
  if (vs.every(v => typeof v === 'number')) return vs.every(Number.isInteger) ? 'int64' : 'double';
  return 'string';
}
const csvHucre = v => v === null || v === undefined ? '' : isDate(v) ? ymd(v) : typeof v === 'boolean' ? (v ? 'true' : 'false') : typeof v === 'number' ? String(v) : (/[",\n\r]/.test(v) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v));
const csv = t => [M.tables[t].cols.join(',')].concat(M.tables[t].rows.map(r => M.tables[t].cols.map(c => csvHucre(r[c])).join(','))).join('\r\n') + '\r\n';
const M_TUR = { date: 'type date', int64: 'Int64.Type', double: 'type number', string: 'type text', boolean: 'type logical' };

/* ---------------------------------------------------------------- ölçüler: yalnız paketteki tablolara dayananlar */
const tabloAdlari = Object.keys(M.tables);
const kullandigiTablolar = e => tabloAdlari.filter(t => new RegExp("(^|[^\\w'])'?" + t + "'?\\s*\\[").test(e) || new RegExp('\\b' + t + '\\b\\s*[,)]').test(e));
const olcuAd = new Set(LIB.map(m => m.name));
const bagimli = e => [...String(e).matchAll(/\[([^\]]+)\]/g)].map(x => x[1]).filter(n => olcuAd.has(n));
let olculer = LIB.filter(m => kullandigiTablolar(m.expr).every(t => TABLOLAR.includes(t)));
for (let tur = 0; tur < 5; tur++) { const ad = new Set(olculer.map(m => m.name)); olculer = olculer.filter(m => bagimli(m.expr).every(n => ad.has(n))); }
// motorda çalışıyor mu (sözdizimi ve başvurular)
const ms = {}; olculer.forEach(m => { ms[m.name] = { name: m.name, expr: m.expr }; });
olculer = olculer.filter(m => { try { X.evalMeasure(ms, '[' + m.name + ']', [], {}); return true; } catch (e) { return false; } });
const FMT = { para: '#,0.00 "₺"', yuzde: '0.0%', adet: '#,0' };

/* ---------------------------------------------------------------- model.bim */
function bolum(t) {
  const cols = M.tables[t].cols, tip = cols.map(c => tur(t, c));
  const b64 = zlib.deflateRawSync(Buffer.from(csv(t), 'utf8'), { level: 9 }).toString('base64');
  return [
    'let',
    '    Veri = Binary.Decompress(Binary.FromText("' + b64 + '", BinaryEncoding.Base64), Compression.Deflate),',
    '    Satırlar = Csv.Document(Veri, [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),',
    '    Başlıklar = Table.PromoteHeaders(Satırlar, [PromoteAllScalars=true]),',
    '    Türler = Table.TransformColumnTypes(Başlıklar, {' + cols.map((c, i) => '{"' + c + '", ' + M_TUR[tip[i]] + '}').join(', ') + '}, "en-US")',
    'in',
    '    Türler'];
}
const DT = { date: 'dateTime', int64: 'int64', double: 'double', string: 'string', boolean: 'boolean' };
const anahtar = new Set(M.rels.map(r => r.to + '.' + r.toCol));
const tables = TABLOLAR.map(t => {
  const T = M.tables[t], o = { name: t, lineageTag: uuid('t:' + t) };
  if (T.dateTable) o.dataCategory = 'Time';
  o.columns = T.cols.map(c => {
    const ty = tur(t, c), col = { name: c, dataType: DT[ty], sourceColumn: c, summarizeBy: ty === 'double' || (ty === 'int64' && !/No$|Yil|Sira|Ay$|AyNo|Gun|Hafta|Ceyrek|DogumYili/.test(c)) ? 'sum' : 'none', lineageTag: uuid('c:' + t + '.' + c) };
    if (ty === 'date') { col.formatString = 'dd.MM.yyyy'; col.annotations = [{ name: 'UnderlyingDateTimeDataType', value: 'Date' }]; }
    if (T.dateTable && c === T.dateTable) col.isKey = true;
    if ((T.sortBy || {})[c]) col.sortByColumn = T.sortBy[c];
    if (anahtar.has(t + '.' + c) && T.kind === 'dim' && !T.dateTable) col.isHidden = false;
    return col;
  });
  o.partitions = [{ name: t, mode: 'import', source: { type: 'm', expression: bolum(t) } }];
  if (t === 'Satislar') o.measures = olculer.map(m => Object.assign({ name: m.name, expression: m.expr }, FMT[m.fmt] ? { formatString: FMT[m.fmt] } : {}, m.desc ? { description: m.desc } : {}, { lineageTag: uuid('m:' + m.name) }));
  return o;
});
const relationships = M.rels.filter(r => TABLOLAR.includes(r.from) && TABLOLAR.includes(r.to)).map(r => Object.assign({ name: uuid('r:' + r.from + r.fromCol + r.to + r.toCol), fromTable: r.from, fromColumn: r.fromCol, toTable: r.to, toColumn: r.toCol }, r.inactive ? { isActive: false } : {}));
const bim = {
  name: AD, compatibilityLevel: 1600,
  model: {
    culture: 'tr-TR', sourceQueryCulture: 'tr-TR', defaultPowerBIDataSourceVersion: 'powerBI_V3', dataAccessOptions: { legacyRedirects: true, returnErrorValuesAsNull: true },
    annotations: [{ name: 'PBI_QueryOrder', value: JSON.stringify(TABLOLAR) }, { name: '__PBI_TimeIntelligenceEnabled', value: '0' }],
    tables, relationships,
  },
};

/* ---------------------------------------------------------------- dosyalar */
const out = path.join(APP, 'veri'), tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'calisma-')), kok = path.join(tmp, AD + '-Calisma');
const yaz = (p, s) => { const f = path.join(kok, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const J = o => JSON.stringify(o, null, 2) + '\n';
const SAYFA = 'a1c0ffee00baslangic01';
yaz(AD + '.pbip', J({ $schema: 'https://developer.microsoft.com/json-schemas/fabric/pbip/pbipProperties/1.0.0/schema.json', version: '1.0', artifacts: [{ report: { path: AD + '.Report' } }], settings: { enableAutoRecovery: true } }));
yaz(AD + '.SemanticModel/definition.pbism', J({ $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/semanticModel/definitionProperties/1.0.0/schema.json', version: '1.0', settings: {} }));
yaz(AD + '.SemanticModel/model.bim', J(bim));
yaz(AD + '.Report/definition.pbir', J({ $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json', version: '4.0', datasetReference: { byPath: { path: '../' + AD + '.SemanticModel' } } }));
yaz(AD + '.Report/definition/report.json', J({ $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/3.0.0/schema.json', themeCollection: { baseTheme: { name: 'CY24SU10', type: 'SharedResources', reportVersionAtImport: { visual: '1.8.95', report: '2.0.95', page: '1.3.95' } } } }));
yaz(AD + '.Report/definition/version.json', J({ $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/versionMetadata/1.0.0/schema.json', version: '2.0.0' }));
yaz(AD + '.Report/definition/pages/pages.json', J({ $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.0.0/schema.json', pageOrder: [SAYFA], activePageName: SAYFA }));
yaz(AD + '.Report/definition/pages/' + SAYFA + '/page.json', J({ $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/1.0.0/schema.json', name: SAYFA, displayName: 'Çalışma sayfası', displayOption: 'FitToPage', width: 1280, height: 720 }));
yaz('.gitignore', '**/.pbi/localSettings.json\n**/.pbi/cache.abf\n');
TABLOLAR.forEach(t => yaz('Veri/' + t + '.csv', '﻿' + csv(t)));
yaz('Olculer.dax', olculer.map(m => '// ' + (m.desc || '').replace(/\n/g, ' ') + '\n' + m.name + ' =\n' + m.expr + '\n').join('\n'));

/* kontrol değerleri: motorun hesabı (Desktop'ta aynı çıkmalı) */
const q = (rows, val) => X.query({ rows, measures: ms, values: [val], slicers: [], totals: true });
const tl = v => v == null ? '(boş)' : Number(v).toLocaleString('tr-TR', { maximumFractionDigits: 2 });
const yil = q([{ t: 'Tarih', c: 'Yil' }], 'Net Satış'), kat = q([{ t: 'Kategoriler', c: 'Kategori' }], 'Net Satış');
const kontrol = [
  ['Satislar satır sayısı', String(M.tables.Satislar.rows.length)],
  ['Net Satış (toplam)', tl(yil.total[0])],
  ...yil.rows.map(r => ['Net Satış · ' + r.keys[0], tl(r.vals[0])]),
  ...kat.rows.map(r => ['Net Satış · ' + r.keys[0], tl(r.vals[0])]),
  ['Sipariş Sayısı (toplam)', tl(X.evalMeasure(ms, '[Sipariş Sayısı]', [], {}))],
  ['Müşteri Sayısı (toplam)', tl(X.evalMeasure(ms, '[Müşteri Sayısı]', [], {}))],
];
yaz('DOGRULAMA.md', `# Kontrol değerleri

**Doğrulama durumu:** Windows'ta doğrulandı (28 Kasım 2026, Power BI Desktop, PBIP): aşağıdaki değerlerin hepsi Desktop sonucuyla birebir tuttu. Aynı turda yeni DAX işlevlerinden örneklem de denendi (PPMT, NPER, CONFIDENCE.T, INFO.VIEW.MEASURES = 80 ölçü). Değerler Kesit Power BI'ın tarayıcı motoruyla üretilir; Desktop'ta farklı bir sayı görürsen bildir.

| Kontrol | Beklenen |
|---|---|
${kontrol.map(([a, b]) => '| ' + a + ' | ' + b + ' |').join('\n')}

DAX Sorgu Görünümü'nde tek seferde denemek için:

\`\`\`dax
EVALUATE
SUMMARIZECOLUMNS(Tarih[Yil], "Net Satış", [Net Satış], "Sipariş Sayısı", [Sipariş Sayısı])
\`\`\`
`);
yaz('BENIOKU.md', `# Anadolu Market · Kesit Power BI çalışma paketi

Kesit Power BI derslerinin bütün alıştırmaları bu modelde yazılır. Bu paketle aynı modeli **Power BI Desktop'ta** açıp dersteki ölçüleri, görselleri ve ilişkileri kendi bilgisayarında kurabilirsin.

## Aç ve çalıştır

1. ZIP'in tamamını bir klasöre çıkar. \`${AD}.pbip\` ile \`.Report\` ve \`.SemanticModel\` klasörleri yan yana kalsın.
2. Windows'ta güncel Power BI Desktop ile \`${AD}.pbip\` dosyasını aç. Sürümün gerektiriyorsa **Dosya → Seçenekler ve ayarlar → Seçenekler → Önizleme özellikleri** bölümünde Power BI Project (.pbip) desteğini etkinleştir.
3. Dosya açılınca üstte iki şerit çıkar ("ilişkiler değişti, yenilenmeli" ve "bazı tablolarda veri yok"). Bu normaldir: PBIP veriyi değil modeli taşır. Önce üstteki şeritte **Şimdi yenile**'ye, bittikten sonra ikinci şeritteki **Şimdi yenile**'ye bas (ya da **Giriş → Yenile**). Veri Power Query içine gömülüdür; internet ya da dosya yolu gerekmez. \`Veri/\` klasöründeki CSV kopyaları inceleme ve elle kurma içindir.
   - İlk yenilemede "döngüsel başvuru" (cyclic reference) hatası görürsen bir kez daha **Yenile**'ye bas. Windows testinde bir kez görüldü, ikinci yenilemede kayboldu ve bütün kontrol değerleri tuttu; iki temiz denemede tekrar etmedi. Modelde hesaplanmış tablo, hesaplanmış sütun ya da sorgular arası başvuru yoktur, otomatik tarih tablosu kapalıdır; hata Desktop'un ilk yükleme sırasından kaynaklanıyor görünüyor.
4. [DOGRULAMA.md](DOGRULAMA.md) içindeki kontrol sayılarını bir kart ya da tabloyla karşılaştır.

## İçinde ne var?

- ${TABLOLAR.length} tablo: ${TABLOLAR.join(', ')}.
- ${relationships.length} ilişki (Satislar[TeslimTarihi] → Tarih ilişkisi pasif; USERELATIONSHIP dersleri için).
- ${olculer.length} hazır ölçü (Satislar tablosunda; ifadeleri ayrıca \`Olculer.dax\` dosyasında).
- Boş bir rapor sayfası: görselleri sen kurarsın.

## Derslerle birlikte kullanmak

Her dersin konu sayfasında **Desktop'ta çalış** bölümü var. Oradan o dersin görev kâğıdını (.md) indir: her DAX alıştırmasının sorusu ve beklenen sonuç tablosu, her görsel alıştırmasının alanları ve beklenen değerleri, her model alıştırmasının kurulacak ilişkileri yazılıdır. Önce tarayıcıda dene, sonra Desktop'ta aynısını kur ve sonuçları karşılaştır.

## Bilinen farklar

- Kesit'in tarayıcı motoru Microsoft'un motoru değildir. Ölçülerin büyük çoğunluğu iki yerde aynı sonucu verir; farklı bir sonuç görürsen ders sayfasındaki **Sorun bildir** ile yaz.
- Model, öğretim için küçültülmüş sentetik veridir (Anadolu Market, 2022–2024).

Kaynak: [Kesit Power BI](https://ysfdurak.github.io/kesit-powerbi/) · Yusuf Durak. Veri ve içerik CC BY-NC 4.0, kod PolyForm Shield 1.0.0 kapsamındadır.
`);
for (const f of ['LICENSE.md', 'LICENSE-ICERIK.md']) { const p = path.join(APP, '..', f); if (fs.existsSync(p)) fs.copyFileSync(p, path.join(kok, f)); }

fs.mkdirSync(out, { recursive: true });
const zip = path.join(out, 'anadolu-market-calisma.zip'); if (fs.existsSync(zip)) fs.unlinkSync(zip);
cp.execFileSync('python3', ['-c', 'import shutil,sys; shutil.make_archive(sys.argv[1][:-4], "zip", sys.argv[2], sys.argv[3])', zip, tmp, AD + '-Calisma']);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('anadolu-market-calisma.zip', (fs.statSync(zip).size / 1024).toFixed(0) + ' KB ·', TABLOLAR.length, 'tablo,', relationships.length, 'ilişki,', olculer.length, 'ölçü');
