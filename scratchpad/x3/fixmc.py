import re,json
p='/home/claude/pbi/x_ileri3.js'; s=open(p,encoding='utf-8').read()
def js(a): return "o:[" + ",".join("'"+x+"'" for x in a) + "]"
F={
"Bant tanımında koşul":(['Her bandın en az bir müşteri içermesi','Bant satırları toplamının toplam satırına eşitliği','Toplam satırının Müşteri Sayısı ölçüsünden büyük olması','Bant tablosunun tam 4 satırdan oluşması'],1),
"Bir taslakta sayfanın üst yarısında":(['Grafiklerin renk paletini birbirinden belirgin biçimde ayırmak','İki grafiği tek bir kombo grafikte birleştirmek','Kartların yazı tipini büyütüp kartları yerinde bırakmak','KPI’ları sol üste alıp tek ana grafik seçmek'],3),
"Kart “Hedef gerçekleşme %100”":(['Turuncu eşiğini %100 yerine %99’a indirmek','Kartta yüzde yerine hedef farkını tutar olarak göstermek','Bir ondalık göstermek ya da eşiği hizalamak','Koşullu biçimlendirmeyi karttan tamamen kaldırmak'],2),
"Kullanıcılar “Grafik / Tablo”":(['Dilimleyiciler sayfalar arasında eşitlenmemiş','Düğme eylemi yanlış sayfaya gidiyor','Seçim bölmesinde görseller gruplanmamış','Yer imlerinde “Veri” seçeneği açık'],3),
"Bitirme projen için iki haftan var":(['KPI sözlüğü ve sayfa taslağı yazmak','Temayı ve sayfa düzenini hazırlamak','Tüm ölçüleri hızlıca yazıp sonra ayıklamak','Power Query’de tüm tabloları temizlemek'],0),
"Değerlendirmede “Hedefe kalan”":(['Toplam satırının matristen kapatılmasını','İki ölçünün ortalamasının toplamda gösterilmesini','Seçilen anlamın ölçü açıklamasında yazılmasını','Toplamı her zaman satırların toplamına zorlayan bir ölçü'],2),
"Portföyün için bitirme projeni":(['Web’de yayımla ile paylaşıp bağlantıyı yalnızca CV’ye koymak','Raporu PDF’e aktarıp yalnızca müşteri adlarını kapatmak','Çalışma alanına okuma izniyle işe alanları eklemek','Veriyi anonim ya da sentetik veriyle değiştirmek'],3),
"Bölge RLS’i yayımlandı":(['RLS rolünün DAX filtresini USERNAME() ile yeniden yazmak','Modeldeki tüm ilişkileri çift yönlü hâle getirmek','Müdüre Görüntüleyici rolü ya da uygulama erişimi vermek','Müdürü RLS rolüne e-posta adresiyle ikinci kez eklemek'],2),
"Temizlenmiş bir “Satışlar”":(['Sorguyu iki kez çoğaltmak (Duplicate)','Temiz sorguyu iki ayrı kez içeri aktarmak','Özetleri DAX hesaplanmış tablolarıyla yapmak','İki başvuru sorgusu (Reference) kurmak'],3),
"Sınavın 60. dakikasındasın":(['Önce işaretlileri gözden geçirmek, sonra ara vermek','Hemen ara vermek, sonra işaretlilere dönmek','Ara vermeden sınavı bitirmek, işaretlileri boş bırakmak','Arada Learn’de işaretli konulara bakmak'],0),
"Operasyon ekibi, DirectQuery":(['Zamanlanmış yenilemeyi 30 saniyeye ayarlamak','Power Automate ile raporu yeniden açan bir akış kurmak','Modeli Import’a çevirip artımlı yenileme kurmak','Sayfada otomatik sayfa yenilemeyi açmak'],3),
"Veri mühendisleri lakehouse":(['Uç noktada UPDATE çalışır, yalnızca yazma izni vermek gerekir','Uç nokta salt okunur; yazma ambarda ya da Spark’ta','Tabloları KQL veritabanına taşıyıp orada güncellemek gerekir','Saklı yordam yerine Dataflow Gen2 ile UPDATE yazılmalı'],1),
"Direct Lake on SQL kullanan":(['Delta tablolarında V-Order kapatılmış','Anlam modelinin son yenilemesi başarısız oldu','SQL RLS sorguları DirectQuery’ye düşürüyor','Kullanıcıların Fabric lisansı eksik'],2),
"IoT sensör verisi":(['KQL veritabanında OneLake erişilebilirliğini açmak','Bir işlem hattıyla veriyi her saat lakehouse’a kopyalamak','Anlam modelinde Eventhouse’a DirectQuery ile bağlanmak','Sensör verisini Dataflow Gen2 ile ambara yazmak'],0),
"Anlam modeli geliştirme, test":(['Her aşamada PBIX’i elle yayımlayıp kaynağı değiştirmek','Üç ayrı model kopyası ve üç ayrı Git dalı','XMLA ile her aşamaya ayrı betik çalıştırmak','Dağıtım işlem hattı ve dağıtım kuralları'],3),
"Bir uygulamanın hata loglarında":(['DAX ölçüsü ve otomatik sayfa yenilemesi kurmak','T-SQL görünümü ve saatlik zamanlanmış yenileme','KQL’de zaman filtresi ve bin() ile summarize','Görsel sorgu düzenleyicide zaman sütununa göre gruplama'],2),
"Direct Lake on OneLake modelinin":(['Delta tablolarını optimize edip yenilemek','Modelde DirectQuery’ye geri dönüş ayarını açmak','Modeli Import moduna çevirip yeniden yayımlamak','Kapasiteyi bir gece için duraklatıp sürdürmek'],0),
"Rapor eleştirisi turunda bir dashboard":(['Pasta grafiğin sıralı çubukla değişmesinden','KPI kartlarına hedef ve geçen yıl eklenmesinden','Toplam satırındaki hatalı marjdan','Renk paletinin kurumsal temaya uymamasından'],2),
}
for k,(o,a) in F.items():
    i=s.find("q:'"+k); assert i>=0,k
    j=s.find("o:[",i); m=re.compile(r"o:\[.*?\], a:\d+").match(s,j); assert m,k
    s=s[:j]+js(o)+", a:"+str(a)+s[m.end():]
open(p,'w',encoding='utf-8').write(s)
