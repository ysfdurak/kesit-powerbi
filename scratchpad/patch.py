import re
p='/home/claude/pbi/confused2.js'; s=open(p,encoding='utf-8').read()
N={ # index (0-based quiz order) -> (options list, a)
0:(["`SUMMARIZE` ile ifade","`GROUPBY` ve `SUMX`","`CROSSJOIN` ve `FILTER`","`SUMMARIZECOLUMNS`"],3),
1:(["`SUMMARIZECOLUMNS` ile yeni sorgu","`SUMMARIZE` ile yeniden gruplama","`GROUPBY` + `MAXX(CURRENTGROUP())`","Ayrı bir hesaplanmış tablo kurmak"],2),
2:(["`CALCULATETABLE(Satislar, …Web)`","`FILTER(Satislar, …Web)`","`FILTER(VALUES(Satislar[Kanal]), …)`","`KEEPFILTERS` ile CALCULATETABLE"],0),
3:(["Sütun koşullu CALCULATETABLE","Görsel düzeyi Top N filtresi","CALCULATETABLE içinde ölçü koşulu","FILTER ve VALUES(Urunler[Urun])"],3),
4:(["`RANKX` ve `DENSE`","`RANK` ve `SKIP`","`ROWNUMBER` ve ORDERBY","Görsel Top N filtresi"],2),
6:(["Dilimleyici çoklu seçimde","ISFILTERED toplamda çalışmaz","İlişki çift yönlü olmalı","Filtre dolaylı geliyor"],3),
8:(["SUMX içinde çıplak SUM","İlişki çift yönlü kurulmuş","Ölçüde DIVIDE kullanılmamış","Tarih tablosu işaretsiz"],0),
9:(["İkincisi iptalleri dışlar","Birincisi bağlam geçişi yapmaz","İkincisi toplamda boş döner","Sonuç aynı"],3),
10:(["`SUM` ile toplam bakiye","`LASTDATE` ile ayın son günü","`LASTNONBLANK`","`AVERAGE` ile ortalama bakiye"],2),
12:(["`USERELATIONSHIP`","`CROSSFILTER(…, BOTH)`","`RELATED`","`TREATAS`"],3),
13:(["İlişki çift yönlü olmalı","CROSSFILTER eksik","Yanlış sütun verilmiş","Tarih tablosu işaretsiz"],2),
14:(["Dinamik biçim dizesi","`FORMAT` ile metne çevir","İki ayrı grafik ve yer imi","Biçimi Genel bırak"],0),
15:(["Biçim dizesi yanlış seçilmiş","Sıralama ölçütü sütunu eksik","Toplam satırı kapatılmış","Ölçü metin döndürüyor"],3),
16:(["`INDEX(1, …)`","`OFFSET(-1, …)`","`WINDOW(1, ABS, 0, REL, …)`","`PREVIOUSMONTH`"],0),
17:(["`OFFSET(-2, …)` ve SUMX","`WINDOW(-2, REL, 0, REL, …)`","`INDEX(-3, …)` ve SUMX","`WINDOW(-3, REL, -1, REL, …)`"],1),
18:(["36 yeni ölçü","Alan parametresi","Görsel hesaplama","Hesaplama grubu"],3),
20:(["Hesaplama grubu","Model ölçüsü ve OFFSET","Görsel hesaplama","Hesaplanmış sütun"],2),
21:(["Görseli Excel’e kopyala","Excel’de formülle yeniden yaz","Model ölçüsüne taşı","Görsel hesaplamayı dışa aktar"],2),
22:(["`STDEV.P`","`STDEV.S`","`VAR.S`","`STDEVX.S`"],0),
23:(["`STDEV.P`","`MEDIAN`","`AVERAGE`","`STDEV.S`"],3),
24:(["Üçünü zincir hâlinde bırak","Satışa kategori sütunu ekle","İlişkileri çift yönlü yap","PQ’da tek boyuta birleştir"],3),
26:(["Tekrar eden anahtarı bul","Öneriyi olduğu gibi kabul et","İlişkiyi çift yönlü kur","Tabloyu DirectQuery’ye çevir"],0),
27:(["Bire bir ilişki kalsın","İlişkiyi çoka çok yap","Tabloları birleştir","İki ayrı rapor hazırla"],2),
28:(["Power Query","DAX hesaplanmış sütun","Rapor ölçüsü","Görsel hesaplama"],0),
29:(["Power Query özel sütun","Dinamik biçim dizesi","Alan parametresi","DAX hesaplanmış sütun"],3),
30:(["Tarih tablosunu sil","Tarihleri metne çevir","Otomatik tarihi kapat","Hiyerarşileri gizle"],2),
31:(["Tarihte tekrar ya da boşluk","Tabloda Yıl sütunu bulunmuyor","Tablo DAX ile üretilmiş","İlişki tek yönlü kurulmuş"],0),
32:(["SCD Tip 2","SCD Tip 1","Hesaplanmış sütun","Artımlı yenileme"],0),
33:(["Tip 1’e geri dönülmeli","İlişki çift yönlü yapılmalı","İş anahtarı sayılmalı","Geçerlilik tarihleri silinmeli"],2),
34:(["Para birimi biçimi hatalı","Sütun gizli","İlişki eksik","Biçim türü değiştirmez"],3),
35:(["Biçim değeri yuvarlıyor","Biçim küsuratı gizliyor","Toplam satırı hatalı","Sütun türü metin"],1),
36:(["Sütunları kaldır","Yinelenen satırları kaldır","Diğer sütunları kaldır","Sütun türünü değiştir"],2),
39:(["İlişkinin kardinalitesi","Kaynakların gizlilik düzeyleri","Sorgu bağımlılıkları","Harf ve boşluk farkları"],3),
40:(["Özel fonksiyon","Başvuru sorgusu","Yinelenen sorgu","Parametre"],3),
41:(["Her şubeye ayrı sorgu","Özel fonksiyon","Parametre ve tek sorgu","DAX hesaplanmış tablo"],1),
42:(["Hücreler boş metin","Sütun türü ondalık sayı","Sorgu katlaması bozuk","Sütun modelde gizli"],0),
43:(["Profil tüm veriye bakıyor","Boş metin değerleri var","Sütunda hata değerleri var","Sütun türü tarih olarak ayarlı"],1),
44:(["Genel","Kuruluş","Özel","Hiçbir düzey vermem"],2),
45:(["Gizlilik düzeylerini yoksay","İkisini de Kuruluş yap","İkisini de Genel yap","Birleştirmeyi DAX’a taşı"],1),
46:(["Gen1 ve yerleşik depolaması","Desktop’ta Power Query","DAX hesaplanmış tablo","Gen2 ve lakehouse hedefi"],3),
48:(["Yer imi","Detaylandırma sayfası","Alt düzeye inme","Araç ipucu sayfası"],3),
49:(["Detaylandırma sayfası","Rapor sayfası araç ipucu","Yer imi gezgini","Sayfa gezgini"],0),
52:(["Çapraz filtreleme","Etkileşim yok","Çapraz vurgulama","Detaylandırma"],2),
53:(["Görseli daha büyük yap","Çubuk rengini koyulaştır","Etkileşimi tamamen kapat","Filtrelemeye geç"],3),
54:(["Sayfalandırılmış rapor","Power BI raporu ve tablo","Pano (dashboard)","Excel’de analiz et"],0),
56:(["Ayrıştırma ağacı","Anomali algılamalı çizgi","Önemli etkileyenler","Şelale grafiği"],2),
59:(["PPU","Pro","Ücretsiz lisans","Yerel rapor sunucusu"],0),
60:(["Ambar","Lakehouse","Eventhouse","Veri akışı Gen1"],0),
61:(["Ambar","Lakehouse","Eventhouse","Paylaşılan Excel"],2),
62:(["Aralık çok kısa seçilmiş","Görsel sayısı çok fazla","Model verisi yenilenmedi","Ağ geçidi kapalı"],2),
63:(["Otomatik sayfa yenileme","DirectQuery","Gerçek zamanlı pano","Zamanlanmış yenileme"],3),
64:(["Kişisel mod","Standart mod","Ağ geçidi gerekmez","Veri akışı Gen1"],1),
65:(["Standart mod kurmak","Bilgisayarı açık bırakmak","Yenilemeyi elle yapmak","Raporu yeniden yayımlamak"],0),
66:(["Dağıtım işlem hattı","Çalışma alanı rolleri","Git tümleştirmesi","Uygulama sürümleri"],2),
67:(["Git dalı birleştirme","Raporu yeniden yayımlama","Kişisel ağ geçidi","Dağıtım kuralı"],3),
68:(["Web’de yayımla","PDF dışa aktarma","Herkese açık bağlantı","Güvenli gömme"],3),
}
cut=s.index('W.PBI_MISTAKES.push(')
head,tail=s[:cut],s[cut:]
ms=list(re.finditer(r"o: \[(.*?)\], a: (\d)", head))
print(len(ms))
out=[];last=0
for k,m in enumerate(ms):
    out.append(head[last:m.start()])
    if k in N:
        o,a=N[k]
        out.append("o: ["+", ".join("'"+x.replace("'","\\'")+"'" for x in o)+"], a: "+str(a))
    else: out.append(m.group(0))
    last=m.end()
out.append(head[last:])
head=''.join(out)
head=head.replace("OFFSET tek satır verir; ABS 1–3 her zaman ilk üç ayı alır.","OFFSET tek bir satır verir; −3…−1 aralığı geçerli ayı dışarıda bırakır.")
open(p,'w',encoding='utf-8').write(head+tail)
