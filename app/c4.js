/* Kesit Power BI içerik 4: A1–B1 yeni dersler */
(window.PBI_LESSONS = window.PBI_LESSONS || []).push(

{
  id: 'menuler-turu', lv: 'A1', mod: 'Başlangıç', min: 14,
  title: 'Menüler turu: hangi komut nerede?',
  sum: 'Dosya, Giriş, Ekle, Modelleme, Görünüm, İyileştir ve Yardım sekmeleri; bağlama göre açılan araç sekmeleri.',
  body: `
<h2>Şerit (ribbon) mantığı</h2>
<p>Power BI Desktop'un üstündeki şerit, işi yaptığın sıraya göre düzenlenmiştir: önce veri (<b>Giriş</b>), sonra sayfa öğeleri (<b>Ekle</b>), sonra hesaplar (<b>Modelleme</b>), sonra görünüm ve kalite (<b>Görünüm</b>, <b>İyileştir</b>). Bir şeyi seçtiğinde (bir tablo, bir ölçü, bir görsel) şeride yalnızca o nesneye ait <b>bağlamsal sekmeler</b> eklenir.</p>
<div class="tbl-wrap"><table>
<tr><th>Sekme</th><th>En sık kullanılan komutlar</th><th>Ne zaman açarsın?</th></tr>
<tr><td><b>Dosya</b></td><td>Kaydet, Farklı kaydet (.pbix / .pbip), Dışa aktar (.pbit şablonu, PDF), Seçenekler ve ayarlar, Yayımla</td><td>Proje başında ayarlar (otomatik tarih/saat, bölgesel ayarlar), sonunda yayımlama</td></tr>
<tr><td><b>Giriş</b></td><td>Veri al, Excel çalışma kitabı, OneLake kataloğu, Verileri dönüştür, Yenile, Yeni görsel, Yeni ölçü, Yayımla</td><td>Her gün: veri alma ve yenileme</td></tr>
<tr><td><b>Ekle</b></td><td>Yeni sayfa, Yeni görsel, Anahtar etkileyiciler, Ayrıştırma ağacı, Anlatı, Metin kutusu, Düğmeler, Şekiller, Görüntü</td><td>Rapor sayfasını tasarlarken</td></tr>
<tr><td><b>Modelleme</b></td><td>İlişkileri yönet, Yeni ölçü, Yeni sütun, Yeni tablo, Hızlı ölçü, Yeni parametre (sayısal aralık / alanlar), Rolleri yönet, Farklı görüntüle, Hesaplama grubu</td><td>Model ve DAX çalışırken</td></tr>
<tr><td><b>Görünüm</b></td><td>Temalar, Sayfa görünümü, Mobil düzen, Kılavuz çizgileri, Izgaraya yapış, Filtreler, Yer işaretleri, Seçim, Performans Analizi, Dilimleyicileri eşitle</td><td>Tasarım ve hata ayıklama</td></tr>
<tr><td><b>İyileştir</b> (Optimize)</td><td>Görselleri duraklat, İyileştirme ön ayarları, Sorgu azaltma, Performans Analizi</td><td>Büyük modellerde rapor yavaşladığında</td></tr>
<tr><td><b>Yardım</b></td><td>Belgeler, Topluluk, Eğitim, Hakkında (sürüm)</td><td>Sürümünü öğrenmek, öğrenme kaynakları</td></tr>
</table></div>
<h2>Bağlamsal sekmeler</h2>
<ul>
<li><b>Tablo araçları:</b> Bir tablo seçince. Ad, tarih tablosu olarak işaretle, ilişkileri yönet, yeni ölçü/sütun.</li>
<li><b>Sütun araçları:</b> Bir sütun seçince. Ad, veri türü, biçim, <b>Sütuna göre sırala</b>, veri kategorisi (Şehir, Görüntü URL'si…), özetleme (Topla / Toplama), grupla.</li>
<li><b>Ölçü araçları:</b> Bir ölçü seçince. Ad, giriş tablosu, biçim (para, yüzde, dinamik), ondalık basamak.</li>
<li><b>Biçim</b> ve <b>Veri / Detaya git</b> (Görsel araçları): Bir görsel seçince. Etkileşimleri düzenle, detaya inme modu, gruplama, hizala, öne getir.</li>
</ul>
<h2>Bölmeler</h2>
<p>Şeridin sağında kalan dikey paneller: <b>Veri</b> (tablolar, sütunlar, ölçüler), <b>Görselleştirmeler</b> (görsel türü + <i>Oluştur / Biçim / Analiz</i> sekmeleri), <b>Filtreler</b>. Görünüm sekmesinden <b>Yer işaretleri</b>, <b>Seçim</b>, <b>Performans Analizi</b> ve <b>Dilimleyicileri eşitle</b> bölmeleri açılır.</p>
<div class="tip"><b>Uygulamada gez</b>Bu uygulamadaki <button class="lnk" data-go="menus">Power BI arayüzü</button> bölümünde her sekmenin her komutunu tıklayıp ne işe yaradığını, ne zaman kullanılacağını ve hangi derste geçtiğini görebilirsin.</div>
<h2>Klavye kısayolları</h2>
<div class="tbl-wrap"><table>
<tr><th>Kısayol</th><th>İş</th></tr>
<tr><td>Ctrl + S</td><td>Kaydet</td></tr>
<tr><td>Ctrl + G / Ctrl + Shift + G</td><td>Görselleri grupla / grubu çöz</td></tr>
<tr><td>Ctrl + tıklama</td><td>Birden çok veri noktası seç (çapraz filtrede çoklu seçim)</td></tr>
<tr><td>Alt + Shift + F10</td><td>Seçili görselin “Daha fazla seçenek” menüsü (erişilebilirlik)</td></tr>
<tr><td>Ctrl + /</td><td>DAX formül çubuğunda satırı yoruma al</td></tr>
<tr><td>Shift + Enter</td><td>Formül çubuğunda yeni satır</td></tr>
</table></div>
`,
  ex: [
    { t: 'mc', q: 'Bir sütunun aylarını alfabetik değil takvim sırasıyla göstermek istiyorsun. Komut hangi sekmede?', o: ['Giriş', 'Sütun araçları (Sütuna göre sırala)', 'Görünüm', 'Yardım'], a: 1, why: 'Sütun seçiliyken açılan Sütun araçları sekmesinde “Sütuna göre sırala” bulunur.' },
    { t: 'mc', q: 'Dilimleyici ve sayı ne olur (what-if) parametresi oluşturmak için hangi sekme?', o: ['Ekle', 'Modelleme (Yeni parametre)', 'Dosya', 'İyileştir'], a: 1, why: 'Modelleme → Yeni parametre → Sayısal aralık ya da Alanlar.' },
    { t: 'mc', q: 'Rapor yavaş; hangi görselin ne kadar sürdüğünü görmek istiyorsun. Hangi bölme?', o: ['Seçim', 'Yer işaretleri', 'Performans Analizi', 'Filtreler'], a: 2, why: 'Performans Analizi her görselin DAX sorgu, çizim ve diğer sürelerini kaydeder.' }
  ]
},

{
  id: 'gorsel-temel', lv: 'A1', mod: 'Görselleştirme', min: 14,
  title: 'Temel görseller ve alan kutuları',
  sum: 'Bir alanı hangi kutuya koyarsan ne olur? Eksen, değerler, gösterge, küçük katlar, araç ipuçları.',
  body: `
<h2>Görsel = alan kutularının toplamı</h2>
<p>Görselleştirmeler bölmesinin <b>Oluştur</b> sekmesinde her görselin <b>alan kutuları</b> (field wells) vardır. Görselin ne söylediğini, hangi alanı hangi kutuya koyduğun belirler. Aynı iki alan, kutular değişince bambaşka bir grafik olur.</p>
<h2>Sütun grafiğinin kutuları: ne koyarsan ne olur?</h2>
<div class="tbl-wrap"><table>
<tr><th>Kutu</th><th>Ne koyulur?</th><th>Koyduğunda ne olur?</th><th>Örnek</th></tr>
<tr><td><b>X ekseni</b></td><td>Sütun (kategori ya da tarih)</td><td>Her farklı değer için bir sütun çizilir. Birden çok alan koyarsan hiyerarşi oluşur ve detaya inme okları belirir.</td><td><code>Kategoriler[Kategori]</code></td></tr>
<tr><td><b>Y ekseni</b></td><td>Ölçü (ya da sayısal sütun)</td><td>Sütunun yüksekliği. İkinci bir ölçü eklersen kümelenmiş sütunlar oluşur.</td><td><code>[Net Satış]</code></td></tr>
<tr><td><b>Gösterge</b></td><td>Sütun</td><td>Her sütun bu alanın değerlerine bölünür ve renklendirilir (yığılmış ya da kümelenmiş).</td><td><code>Satislar[Kanal]</code></td></tr>
<tr><td><b>Küçük katlar</b></td><td>Sütun</td><td>Aynı grafik bu alanın her değeri için ayrı küçük bir panelde tekrarlanır; eksenler ortaktır.</td><td><code>Musteriler[Segment]</code></td></tr>
<tr><td><b>Araç ipuçları</b></td><td>Ölçü</td><td>Fareyle üzerine gelince açılan kutuya ek bilgi eklenir; grafik değişmez.</td><td><code>[Kâr Marjı %]</code></td></tr>
<tr><td><b>Detaylandırma</b> (sayfada)</td><td>Sütun</td><td>Bu sayfa bir detay sayfası olur; başka sayfalardan sağ tıklayıp buraya gelinir.</td><td><code>Urunler[Urun]</code></td></tr>
</table></div>
<h2>Sık kullanılan görsellerin kutuları</h2>
<div class="tbl-wrap"><table>
<tr><th>Görsel</th><th>Kutular</th><th>Dikkat</th></tr>
<tr><td>Kart</td><td>Alanlar (tek ölçü)</td><td>Yeni kart görseli birden çok ölçü ve referans etiketi alır.</td></tr>
<tr><td>Çizgi grafik</td><td>X ekseni (tarih), Y ekseni, İkincil y ekseni, Gösterge, Küçük katlar</td><td>Tarihi X'e koy; Power BI kesintisiz (sürekli) eksen kullanır.</td></tr>
<tr><td>Halka / Pasta</td><td>Gösterge, Değerler, Ayrıntılar</td><td>Dilim sayısını 5'in altında tut.</td></tr>
<tr><td>Tablo</td><td>Sütunlar</td><td>Ölçüler de sütun olarak eklenir; toplam satırı otomatik.</td></tr>
<tr><td>Matris</td><td>Satırlar, Sütunlar, Değerler</td><td>Satırlara birden çok alan = artı/eksi ile açılan hiyerarşi.</td></tr>
<tr><td>Dağılım</td><td>Değerler (nokta başına), X ekseni, Y ekseni, Gösterge, Boyut, Oynatma ekseni</td><td>“Değerler” kutusu boşsa tek bir nokta çizilir!</td></tr>
<tr><td>Dilimleyici</td><td>Alan</td><td>Tarih alanında kaydırıcı, metin alanında liste/döşeme.</td></tr>
</table></div>
<div class="warn"><b>En sık yapılan hata</b>Sayısal bir sütunu (ör. <code>Satislar[Adet]</code>) eksene koymak. Power BI onu kategori gibi davranıp her farklı adet değeri için bir sütun çizer. Sayıyı ölçüye, metni eksene koy.</div>
<h2>Bir görsele tıklayınca ne olur?</h2>
<p>Rapor görünümünde bir sütuna tıklamak, sayfadaki diğer görselleri <b>çapraz filtreler</b> ya da <b>vurgular</b>. Bu Power BI'ın varsayılan davranışıdır. Detaya inmek için ise görselin üstündeki <b>aşağı ok</b> (detaya inme modu) açılır; o zaman tıklama filtrelemek yerine bir alt düzeye iner. İkisini karıştırmamak için <button class="lnk" data-go="dash">Örnek raporlar</button> bölümünde her görselin başlığında bu oklar ayrı düğmeler olarak duruyor.</p>
<div class="tip"><b>Canlı dene</b><button class="lnk" data-go="visuals">Görseller</button> bölümünde her görsel için Oluştur sekmesindeki kutuları değiştirebilir ve sonucu anında görebilirsin.</div>
`,
  ex: [
    { t: 'mc', q: 'Kategoriye göre net satış sütun grafiğinde her sütunun kanal kırılımını renklerle görmek için Satislar[Kanal]\'ı nereye koyarsın?', o: ['X ekseni', 'Y ekseni', 'Gösterge', 'Araç ipuçları'], a: 2, why: 'Gösterge serileri renklere ayırır.' },
    { t: 'mc', q: 'Dağılım grafiğine X: [Net Satış], Y: [Kâr Marjı %] koydun ama tek bir nokta görüyorsun. Neden?', o: ['Veri yok', '“Değerler” kutusu boş; nokta başına hangi öğenin çizileceği belirtilmemiş', 'Eksen sıfırdan başlamıyor', 'Gösterge eksik'], a: 1, why: 'Dağılımda her noktanın ne olduğu (ör. Urunler[Urun]) Değerler kutusuna konur; yoksa tüm veri tek nokta olur.' },
    { t: 'mc', q: 'Aynı sütun grafiğini her müşteri segmenti için ayrı küçük panellerde, ortak eksenle görmek istiyorsun.', o: ['Küçük katlar', 'Gösterge', 'Detaylandırma', 'İkincil y ekseni'], a: 0, why: 'Küçük katlar (small multiples) aynı görseli bir alanın her değeri için tekrarlar.' },
    { t: 'dax', q: '<b>Net Satış Kartı</b>: Bir karta koymak için iptaller hariç satış tutarını veren ölçüyü yaz (Satislar[Durum] "İptal" olmayanlar).', name: 'Net Satış Kartı', sol: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal")', hint: 'CALCULATE(SUM(Satislar[Tutar]), Satislar[Durum] <> "İptal")', explain: 'Kart tek bir sayı gösterir; ölçü kartın filtre bağlamında (sayfa ve dilimleyiciler) hesaplanır. CALCULATE, iptal satırlarını dışarıda bırakan bir filtre ekler.' }
  ]
},

{
  id: 'bicim-temel', lv: 'A2', mod: 'Görselleştirme', min: 16,
  title: 'Biçim bölmesi: her ayar ne işe yarar?',
  sum: 'Görsel ve Genel sekmeleri: eksenler, veri etiketleri, gösterge, renkler, başlık, araç ipuçları; ne yaparsan ne olur.',
  body: `
<h2>İki sekme: Görsel ve Genel</h2>
<p>Bir görseli seçip Görselleştirmeler bölmesindeki <b>boya fırçası</b> simgesine tıkladığında <b>Görseli biçimlendir</b> açılır. İki sekmesi vardır: <b>Görsel</b> (bu görsel türüne özel ayarlar) ve <b>Genel</b> (tüm görsellerde ortak: başlık, efektler, araç ipuçları, alternatif metin). Üstteki arama kutusuna ayarın adını yazmak en hızlı yoldur.</p>
<h2>Görsel sekmesi (sütun / çubuk / çizgi)</h2>
<div class="tbl-wrap"><table>
<tr><th>Bölüm</th><th>Ayar</th><th>Değiştirirsen ne olur?</th><th>Ne zaman?</th></tr>
<tr><td rowspan="3"><b>X ekseni</b></td><td>Tür: Kategorik / Sürekli</td><td>Sürekli tarih ekseni boşlukları korur ve etiketleri seyreltir; kategorik her değeri eşit aralıkla yazar.</td><td>Tarihte sürekli; ay adlarında kategorik</td></tr>
<tr><td>Değerler (yazı tipi, döndürme)</td><td>Etiket boyutu ve eğikliği</td><td>Etiketler sığmıyorsa çubuk grafiğe geç; eğik metin son çaredir</td></tr>
<tr><td>Başlık</td><td>Eksen adını gösterir/gizler</td><td>Birim açık değilse (TL, adet) göster</td></tr>
<tr><td rowspan="3"><b>Y ekseni</b></td><td>Aralık: Minimum / Maksimum</td><td>Eksenin başlangıç ve bitişini sabitler</td><td>Çubuklarda minimum = 0 kalmalı; birden çok grafiği aynı ölçekte karşılaştırırken maksimumu sabitle</td></tr>
<tr><td>Görüntü birimleri</td><td>Otomatik, Bin, Milyon…</td><td>Ekseni sadeleştirmek için</td></tr>
<tr><td>Ölçek türü: Doğrusal / Logaritmik</td><td>Log ölçek büyüklük farkı çok olan değerleri sıkıştırır</td><td>Nadiren; okuyucu log'a alışkın değilse yanıltır</td></tr>
<tr><td><b>Kılavuz çizgileri</b></td><td>Yatay / dikey, renk, stil</td><td>Arka plandaki yardımcı çizgiler</td><td>Açık ve soluk tut; veri etiketleri açıksa kapatabilirsin</td></tr>
<tr><td rowspan="2"><b>Sütunlar / Çubuklar</b></td><td>Renk, “Tüm kategorileri göster” (her çubuğa ayrı renk), fx (koşullu)</td><td>Rengi değiştirir; fx ile kurala veya ölçüye bağlanır</td><td>Tek seri tek renk; vurgu için yalnızca bir çubuğu farklı renk yap</td></tr>
<tr><td>Düzen: Aralık, yeniden sırala</td><td>Çubuklar arası boşluk</td><td>Az kategoride boşluğu artır</td></tr>
<tr><td rowspan="2"><b>Veri etiketleri</b></td><td>Konum, görüntü birimleri, ondalık</td><td>Değeri çubuğun üstüne/içine yazar</td><td>12'den az veri noktasında; kalabalıkta kapat</td></tr>
<tr><td>Özel etiket (fx: Değer)</td><td>Etikette başka bir ölçüyü (ör. “+%4”) gösterir</td><td>Gerçekleşen + büyüme gibi iki bilgiyi bir arada vermek için</td></tr>
<tr><td><b>Gösterge</b></td><td>Konum (üst, alt, sağ…), başlık</td><td>Seri adlarının listesi</td><td>2+ seri varsa göster; tek seride gizle (başlık yeterli)</td></tr>
<tr><td><b>Çizgiler</b> (çizgi grafik)</td><td>Genişlik, stil (kesik), enterpolasyon (adım, yumuşak)</td><td>Çizginin görünüşü</td><td>Geçen yıl / hedef için kesik çizgi; adım enterpolasyonu fiyat gibi kademeli değişimler için</td></tr>
<tr><td><b>İşaretçiler</b></td><td>Şekil, boyut</td><td>Her veri noktasına bir nokta</td><td>Az noktada açık; son noktayı vurgulamak için</td></tr>
</table></div>
<h2>Genel sekmesi</h2>
<div class="tbl-wrap"><table>
<tr><th>Bölüm</th><th>Ne yapar?</th><th>İpucu</th></tr>
<tr><td><b>Özellikler</b></td><td>Boyut, konum, iç kenar boşluğu</td><td>Hizalı tasarım için piksel değerlerini elle eşitle</td></tr>
<tr><td><b>Başlık</b></td><td>Başlık metni, alt başlık, ayırıcı; fx ile ölçüye bağlanabilir</td><td>Dinamik başlık: <code>"Net satış · " &amp; SELECTEDVALUE(Tarih[Yil])</code></td></tr>
<tr><td><b>Efektler</b></td><td>Arka plan, görsel kenarlığı, gölge</td><td>Gölgeyi kapat; kenarlık yerine boşlukla ayır</td></tr>
<tr><td><b>Veri biçimi</b></td><td>Görsel düzeyinde sayı biçimi (yeni)</td><td>Ölçüdeki biçimi bu görsel için geçersiz kılar</td></tr>
<tr><td><b>Başlık simgeleri</b></td><td>Görselin sağ üstündeki filtre, odak, daha fazla simgeleri</td><td>Sunum raporlarında sadeleştir</td></tr>
<tr><td><b>Araç ipuçları</b></td><td>Varsayılan / Rapor sayfası; metin rengi, arka plan</td><td>Rapor sayfası türünde bir sayfayı mini rapor olarak gösterir</td></tr>
<tr><td><b>Alternatif metin</b></td><td>Ekran okuyucunun okuduğu açıklama</td><td>Ölçüyle dinamik yapılabilir: ana bulguyu yaz</td></tr>
</table></div>
<h2>Analiz sekmesi (büyüteç simgesi)</h2>
<p>Sabit çizgi, ortalama, minimum, maksimum, medyan, yüzdebirlik çizgileri; eğilim çizgisi; tahmin; hata çubukları; anomali bulma. Hepsi Orta seviyedeki <b>Analiz özellikleri</b> dersinde.</p>
<div class="tip"><b>Ne yaparsan ne olur? Canlı gör</b><button class="lnk" data-go="visuals">Görseller</button> bölümünde her görselin yanında bir Biçim bölmesi var: veri etiketini aç, göstergeyi taşı, ekseni sıfırdan başlatmayı kapat, ortalama çizgisi ekle… Grafik anında değişir ve her ayarın yanında ne zaman kullanılacağı yazar.</div>
`,
  ex: [
    { t: 'mc', q: 'Sütun grafiğinde fark küçük ama abartılı görünüyor. Biçim bölmesinde neye bakarsın?', o: ['Y ekseni → Aralık → Minimum', 'Gösterge → Konum', 'Başlık → Metin', 'Kılavuz çizgileri → Renk'], a: 0, why: 'Minimum 0 değilse çubuklar oranları bozar. Çubuk grafiklerde minimum her zaman 0 olmalı.' },
    { t: 'mc', q: 'Tek serili bir çubuk grafikte gösterge kutusu “Net Satış” yazıyor ve yer kaplıyor. Ne yaparsın?', o: ['Göstergeyi kapat; başlık zaten ölçüyü söylüyor', 'Göstergeyi büyüt', 'Her çubuğa ayrı renk ver', 'Logaritmik ölçek'], a: 0, why: 'Tek seride gösterge bilgi taşımaz.' },
    { t: 'mc', q: 'Veri etiketinde gerçekleşen tutarın yanında büyüme oranını da göstermek istiyorsun.', o: ['Veri etiketleri → Özel etiket (fx) ile büyüme ölçüsünü bağlamak', 'İkinci bir grafik', 'Görüntü birimini değiştirmek', 'Alternatif metin'], a: 0, why: 'Yeni veri etiketlerinde “Değer” alanı fx ile başka bir ölçüye bağlanabilir.' },
    { t: 'dax', q: '<b>Grafik Başlığı</b>: Görsel başlığına bağlanacak metin ölçüsü. Tek yıl görünüyorsa "Kategoriye göre net satış · 2024", değilse "Kategoriye göre net satış · tüm yıllar" döndür.', name: 'Grafik Başlığı', sol: '"Kategoriye göre net satış · " & IF(HASONEVALUE(Tarih[Yil]), FORMAT(SELECTEDVALUE(Tarih[Yil]), "0"), "tüm yıllar")', hint: 'Metinleri & ile birleştir; IF(HASONEVALUE(Tarih[Yil]), FORMAT(SELECTEDVALUE(Tarih[Yil]), "0"), "tüm yıllar")', grid: [{ t: 'Tarih', c: 'Yil' }], explain: 'Başlık alanındaki fx düğmesi metin döndüren bir ölçü bekler. FORMAT(…, "0") yılı “2.024” gibi binlik ayıraçla yazmasın diye kullanılır.' }
  ]
},

{
  id: 'filtreler', lv: 'A2', mod: 'Görselleştirme', min: 15,
  title: 'Filtreler bölmesi ve dilimleyiciler',
  sum: 'Görsel, sayfa ve rapor düzeyi filtreler; temel, gelişmiş, İlk N, göreli tarih; dilimleyici türleri.',
  body: `
<h2>Üç düzey filtre</h2>
<div class="tbl-wrap"><table>
<tr><th>Düzey</th><th>Etkilediği</th><th>Örnek</th></tr>
<tr><td><b>Bu görseldeki filtreler</b></td><td>Yalnızca seçili görsel</td><td>“İlk 10 ürün” tablosu</td></tr>
<tr><td><b>Bu sayfadaki filtreler</b></td><td>Sayfadaki tüm görseller</td><td>Bu sayfa yalnızca 2024</td></tr>
<tr><td><b>Tüm sayfalardaki filtreler</b></td><td>Rapordaki tüm sayfalar</td><td>İptal edilen siparişleri tüm rapordan çıkar</td></tr>
<tr><td><b>Detaylandırma filtreleri</b></td><td>Detay sayfasına gelen filtre</td><td>Sağ tık → Detaya git → Ürün Detayı</td></tr>
</table></div>
<h2>Filtre türleri</h2>
<ul>
<li><b>Temel filtreleme:</b> Değer listesinden onay kutusuyla seçim. “Tümünü seç” ve “Seçimi ters çevir” (Hariç tut).</li>
<li><b>Gelişmiş filtreleme:</b> “içerir”, “ile başlar”, “boş değil”, “büyüktür” gibi koşullar; VE/VEYA ile iki koşul.</li>
<li><b>İlk N:</b> Bir alanı bir ölçüye göre sıralayıp ilk/son N değeri tutar. Yalnızca görsel düzeyinde.</li>
<li><b>Göreli tarih:</b> “Son 3 ay”, “Bu yıl”, “Son 12 tam ay” gibi bugüne göre değişen tarih aralıkları.</li>
<li><b>Göreli saat:</b> “Son 60 dakika”; gerçek zamanlı ve otomatik sayfa yenilemeli raporlarda.</li>
</ul>
<h2>Filtre bölmesi ayarları</h2>
<ul>
<li><b>Kilitle:</b> Okuyucu filtreyi göremez ya da değiştiremez. Zorunlu iş kuralları için.</li>
<li><b>Gizle:</b> Okuyucu filtreyi görmez ama filtre çalışır.</li>
<li><b>Ölçüye filtre:</b> Görsel düzeyinde bir ölçü koşulu (ör. Net Satış &gt; 10.000). Satırları ölçü sonucuna göre gizler.</li>
<li>Filtre bölmesini okuyucuya kapatmak: Görünüm → Filtreler bölmesinin göz simgesi.</li>
</ul>
<h2>Dilimleyici türleri ve ne zaman kullanılır?</h2>
<div class="tbl-wrap"><table>
<tr><th>Stil</th><th>Ne zaman?</th></tr>
<tr><td>Dikey liste</td><td>Çok değer, kaydırılabilir; arama kutusu açılabilir</td></tr>
<tr><td>Açılır menü</td><td>Yer darsa</td></tr>
<tr><td>Döşeme (düğmeler)</td><td>2–6 değer: yıl, kanal, segment</td></tr>
<tr><td>Arasında (kaydırıcı)</td><td>Sayı ya da tarih aralığı</td></tr>
<tr><td>Göreli tarih</td><td>“Son N gün” seçimi</td></tr>
<tr><td>Hiyerarşi</td><td>Kategori → Ürün gibi iç içe seçim</td></tr>
<tr><td>Düğme dilimleyici (yeni)</td><td>Görsel olarak zengin, görüntülü düğmeler</td></tr>
</table></div>
<p>Dilimleyici ayarları: <b>Tek seçim</b> (yalnızca bir değer), <b>Ctrl ile çoklu seçim</b>, <b>“Tümünü seç” seçeneğini göster</b>. Görünüm → <b>Dilimleyicileri eşitle</b> ile bir dilimleyiciyi başka sayfalara bağlarsın.</p>
<div class="warn"><b>Filtre mi, dilimleyici mi?</b>Okuyucunun sık değiştireceği seçimler için dilimleyici; değişmeyecek iş kuralları için kilitli filtre. Her sayfaya 8 dilimleyici koymak yerine filtre bölmesini açmak da bir seçenektir.</div>
<h2>DAX açısından</h2>
<p>Hangi yoldan gelirse gelsin (dilimleyici, filtre bölmesi, çapraz filtre), hepsi ölçünün <b>filtre bağlamına</b> eklenir. Ölçünün içinde bunu <code>ISFILTERED</code>, <code>SELECTEDVALUE</code>, <code>VALUES</code> ile okuyabilir, <code>ALL</code>/<code>REMOVEFILTERS</code> ile yok sayabilirsin.</p>
`,
  ex: [
    { t: 'mc', q: 'Bir tablo görselinde yalnızca net satışa göre ilk 10 ürünü göstermek istiyorsun; sayfadaki diğer görseller etkilenmesin.', o: ['Sayfa filtresi: temel', 'Görsel filtresi: İlk N = 10, Değere göre: Net Satış', 'Dilimleyici', 'Rapor filtresi'], a: 1, why: 'İlk N filtresi görsel düzeyindedir ve yalnızca o görseli etkiler.' },
    { t: 'mc', q: 'Rapordaki hiçbir sayfada test müşterileri görünmemeli ve kullanıcı bunu değiştirememeli.', o: ['Tüm sayfalardaki filtreler + Kilitle (ve isteğe bağlı Gizle)', 'Her sayfaya dilimleyici', 'Görsel filtresi', 'Yer işareti'], a: 0, why: 'Rapor düzeyi kilitli filtre tüm sayfalara uygulanır ve değiştirilemez.' },
    { t: 'dax', q: '<b>Seçili Kanal Sayısı</b>: Kanal dilimleyicisinde kaç kanal görünüyorsa onu say. (VALUES ile görünen değerler.)', name: 'Seçili Kanal Sayısı', sol: 'COUNTROWS(VALUES(Satislar[Kanal]))', hint: 'COUNTROWS(VALUES(Satislar[Kanal]))', grid: [{ t: 'Satislar', c: 'Kanal' }, { t: 'Tarih', c: 'Yil' }], explain: 'VALUES, filtre bağlamında görünen farklı değerleri tablo olarak döndürür; COUNTROWS satırları sayar. Toplam satırında filtre olmadığı için 3 döner.' }
  ]
},

{
  id: 'istatistik', lv: 'B1', mod: 'Analiz', min: 18,
  title: 'Temel istatistik, gruplama ve kutulama',
  sum: 'Ortalama, medyan, standart sapma, yüzdebirlik; grup ve kutu (bin) oluşturma, kümeleme, histogram.',
  body: `
<h2>İstatistik fonksiyonları</h2>
<div class="tbl-wrap"><table>
<tr><th>Fonksiyon</th><th>Ne verir?</th><th>Ne zaman?</th></tr>
<tr><td><code>AVERAGE</code> / <code>AVERAGEX</code></td><td>Aritmetik ortalama</td><td>Dağılım simetrikse</td></tr>
<tr><td><code>MEDIAN</code> / <code>MEDIANX</code></td><td>Ortanca değer</td><td>Maaş, sepet tutarı gibi uç değerli verilerde ortalamadan daha temsilî</td></tr>
<tr><td><code>STDEV.S</code>, <code>STDEV.P</code>, <code>STDEVX.P</code></td><td>Standart sapma (örneklem / popülasyon)</td><td>Değişkenliği ölçmek, z-skoru</td></tr>
<tr><td><code>VAR.S</code>, <code>VAR.P</code></td><td>Varyans</td><td>Standart sapmanın karesi</td></tr>
<tr><td><code>PERCENTILE.INC</code>, <code>PERCENTILEX.INC</code></td><td>Yüzdebirlik (0–1)</td><td>“Müşterilerin en iyi %20'si kaç TL üstünde?”</td></tr>
<tr><td><code>MIN</code>, <code>MAX</code>, <code>COUNT</code>, <code>DISTINCTCOUNT</code></td><td>Uç değerler ve sayımlar</td><td>Her yerde</td></tr>
<tr><td><code>GEOMEAN</code></td><td>Geometrik ortalama</td><td>Büyüme oranlarının ortalaması</td></tr>
</table></div>
<div class="note"><b>Ortalama yanıltabilir</b>Anadolu Market'te müşteri başına net satışın ortalaması medyanından belirgin yüksektir; birkaç VIP müşteri ortalamayı yukarı çeker. Yöneticiye “tipik müşteri” sorulduğunda medyanı göster.</div>
<h2>Gruplama ve kutulama (Power BI özelliği)</h2>
<p>Veri bölmesinde bir sütuna sağ tık → <b>Yeni grup</b>:</p>
<ul>
<li><b>Liste grubu:</b> Metin değerlerini elle gruplara topla (İstanbul + Bursa = Marmara). Arka planda hesaplanmış bir sütun oluşturur.</li>
<li><b>Kutu (bin):</b> Sayısal ya da tarih sütununu eşit genişlikte aralıklara böl (Maaş: 10.000'lik kutular). <b>Histogram</b> çizmek için kutulanmış sütunu eksene, sayımı değere koyarsın.</li>
</ul>
<pre class="dax" data-notry>-- Aynı kutuyu DAX hesaplanmış sütunuyla yapmak:
Maaş Kutusu = FLOOR(Calisanlar[Maas], 10000)</pre>
<h2>Kümeleme</h2>
<p>Dağılım grafiğinde <b>…</b> → <b>Kümeleri otomatik bul</b>. Power BI noktaları benzerliklerine göre gruplar ve yeni bir küme sütunu oluşturur (ör. “düşük satış, yüksek marj” ürünleri). Küme sayısını kendin de belirleyebilirsin. Sonuç keşif içindir; iş kuralına dönüştürmeden önce kümelerin anlamını kontrol et.</p>
<h2>Bu modelde</h2>
<p>İK verisi (<code>Calisanlar</code>, <code>Departmanlar</code>) istatistik alıştırmaları için idealdir: 27 çalışan, 7 departman, maaşlar arasında belirgin farklar. <button class="lnk" data-go="dash" data-id="ik">İK raporu</button> maaş histogramını ve dağılımını gösteriyor.</p>
`,
  ex: [
    { t: 'dax', q: '<b>Medyan Maaş</b>: Calisanlar tablosundaki maaşların ortancası. Kontrol, departman kırılımında yapılır.', name: 'Medyan Maaş', sol: 'MEDIAN(Calisanlar[Maas])', grid: [{ t: 'Departmanlar', c: 'Departman' }], explain: 'MEDIAN sıralı listenin ortasındaki değeri alır. Departman filtresi Departmanlar → Calisanlar ilişkisiyle akar.' },
    { t: 'dax', q: '<b>Maaş Değişkenliği</b>: Maaşların popülasyon standart sapmasının ortalama maaşa oranı (değişim katsayısı).', name: 'Maaş Değişkenliği', sol: 'DIVIDE(STDEV.P(Calisanlar[Maas]), AVERAGE(Calisanlar[Maas]))', hint: 'DIVIDE(STDEV.P(...), AVERAGE(...))', grid: [{ t: 'Departmanlar', c: 'Departman' }], explain: 'Standart sapmayı ortalamaya bölmek, farklı büyüklükteki departmanların maaş dağınıklığını karşılaştırılabilir yapar (değişim katsayısı).' },
    { t: 'dax', q: '<b>Üst %20 Eşiği</b>: Seçili dönemde müşterilerin net satışına göre 80. yüzdebirlik değeri. Müşteriler üzerinde dolaş: <code>VALUES(Musteriler[MusteriNo])</code>.', name: 'Üst %20 Eşiği', sol: 'PERCENTILEX.INC(VALUES(Musteriler[MusteriNo]), [Net Satış], 0.8)', hint: 'PERCENTILEX.INC(tablo, ifade, 0.8)', grid: [{ t: 'Tarih', c: 'Yil' }], explain: 'PERCENTILEX.INC her müşteri için [Net Satış]\'ı hesaplar (bağlam geçişi), sonra değerlerin %80\'inin altında kaldığı noktayı bulur. Not: Satışı olmayan müşteriler boş döner ve hesaba katılmaz.' },
    { t: 'mc', q: 'Maaşların dağılımını gösteren bir histogram için en kısa yol?', o: ['Maaş sütununa sağ tık → Yeni grup → Kutu; kutuyu eksene, çalışan sayısını değere koymak', 'Pasta grafik', 'Maaşı X eksenine doğrudan koymak', 'Ortalama çizgisi'], a: 0, why: 'Kutulama sayısal sütunu aralıklara böler; histogram bu kutuların sayımıdır.' }
  ]
},

{
  id: 'hizli-olcu', lv: 'B1', mod: 'DAX Temelleri', min: 12,
  title: 'Hızlı ölçüler ve Copilot ile DAX',
  sum: 'Kod yazmadan ölçü üretmek; üretilen DAX\'ı okumak, düzeltmek ve ne zaman güvenmemek gerektiği.',
  body: `
<h2>Hızlı ölçüler</h2>
<p>Modelleme → <b>Hızlı ölçü</b> (ya da bir ölçüye sağ tık → Yeni hızlı ölçü). Bir hesaplama türü seçip alanları kutulara sürüklersin; Power BI DAX'ı yazar.</p>
<div class="tbl-wrap"><table>
<tr><th>Kategori</th><th>Örnekler</th></tr>
<tr><td>Kategori başına toplama</td><td>Kategori başına ortalama, varyans, maksimum</td></tr>
<tr><td>Filtreler</td><td>Filtrelenmiş değer, filtrelenmiş değerden fark, yüzde fark, yeni müşterilerin satışı</td></tr>
<tr><td>Zaman zekâsı</td><td>YTD, QTD, MTD, yıldan yıla değişim, hareketli ortalama</td></tr>
<tr><td>Toplamlar</td><td>Kümülatif toplam, kategori toplamı</td></tr>
<tr><td>Matematik</td><td>Toplama, çıkarma, çarpma, bölme, yüzde fark, korelasyon katsayısı</td></tr>
<tr><td>Metin</td><td>Yıldız derecelendirmesi, değer listesi (birleştirilmiş)</td></tr>
</table></div>
<p>Oluşan ölçü normal bir ölçüdür: formül çubuğunda açıp okuyabilir, değiştirebilirsin. Örneğin “Yıldan yıla değişim” şuna benzer bir kod üretir:</p>
<pre class="dax">Net Satış YoY% =
VAR __PREV_YEAR = CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, YEAR))
RETURN DIVIDE([Net Satış] - __PREV_YEAR, __PREV_YEAR)</pre>
<h2>Copilot ile DAX</h2>
<p>DAX sorgu görünümünde ve ölçü düzenleyicide Copilot'a doğal dille istek yazarsın (“geçen yılın aynı dönemine göre büyüme”). Copilot ölçüyü önerir, açıklar; DAX sorgu görünümünde test edip modele ekleyebilirsin. Ayrıca Copilot rapor sayfası önerebilir, anlatı görseli oluşturabilir ve anlam modelini özetleyebilir (PL-300'de bu beceriler ölçülüyor).</p>
<div class="warn"><b>Güven ama doğrula</b>Hızlı ölçü ve Copilot, modeli tanımadan yazar: iptalleri dahil etmek, yanlış tarih sütununu kullanmak, toplam satırında yanlış sonuç vermek sık görülür. Her üretilen ölçüyü bir matriste toplam satırıyla birlikte kontrol et. Ölçüyü anlamadan rapora koyma.</div>
<h2>Kontrol listesi</h2>
<ol>
<li>Doğru temel ölçüyü mü kullanıyor? (<code>[Toplam Satış]</code> mı <code>[Net Satış]</code> mı?)</li>
<li>Tarih tablosundaki sütunu mu kullanıyor, olgu tablosundakini mi?</li>
<li>Toplam satırında ve boş dönemlerde ne veriyor?</li>
<li>Adını ve biçimini ekip standardına göre düzelt (ör. <code>__PREV_YEAR</code> yerine <code>GecenYil</code>).</li>
</ol>
`,
  ex: [
    { t: 'mc', q: 'Hızlı ölçüyle oluşturduğun YoY ölçüsü iptal edilen siparişleri de sayıyor. En doğru düzeltme?', o: ['Hızlı ölçüyü silip tekrar oluşturmak', 'Üretilen DAX\'ta temel ölçüyü [Net Satış] yapmak', 'Görsele filtre eklemek', 'Copilot\'a tekrar sormak'], a: 1, why: 'Hızlı ölçü normal DAX üretir; formül çubuğunda düzeltilir.' },
    { t: 'dax', q: '<b>Satış YoY (DATEADD)</b>: Hızlı ölçünün ürettiği mantıkla: [Net Satış] ile bir yıl önceki değerin farkının bir yıl önceki değere oranı. DATEADD kullan.', name: 'Satış YoY (DATEADD)', start: 'VAR GecenYil = CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, YEAR))\nRETURN\n', sol: 'VAR GecenYil = CALCULATE([Net Satış], DATEADD(Tarih[Tarih], -1, YEAR))\nRETURN DIVIDE([Net Satış] - GecenYil, GecenYil)', grid: [{ t: 'Tarih', c: 'Yil' }, { t: 'Kategoriler', c: 'Kategori' }], explain: 'DATEADD(…, -1, YEAR) tüm tarihleri bir yıl kaydırır; tam yıl ve tam ay seçimlerinde SAMEPERIODLASTYEAR ile aynı sonucu verir.' }
  ]
},

{
  id: 'tema-sayfa', lv: 'B1', mod: 'Görselleştirme', min: 14,
  title: 'Temalar, sayfa ayarları ve tuval tasarımı',
  sum: 'Tema JSON, renk paleti, tuval boyutu, sayfa arka planı, sayfa türleri ve arka plan görseliyle tasarım.',
  body: `
<h2>Tema</h2>
<p>Görünüm → <b>Temalar</b>. Hazır temalardan biri seçilebilir, <b>Geçerli temayı özelleştir</b> ile renkler, metin stilleri ve görsel varsayılanları değiştirilebilir, ya da bir <b>JSON tema dosyası</b> yüklenir. Tema bir kez ayarlanınca tüm görseller aynı renkleri, yazı tiplerini ve kenarlıkları kullanır; kurumsal raporların hepsi aynı görünür.</p>
<pre class="dax" data-notry>{
  "name": "Anadolu Market",
  "dataColors": ["#2A78D6", "#EB6834", "#1BAF7A", "#EDA100", "#E87BA4", "#008300", "#6250D6", "#E34948"],
  "background": "#FFFFFF",
  "foreground": "#1B1A16",
  "tableAccent": "#E9B10C",
  "good": "#17855A", "neutral": "#A86A12", "bad": "#C0392B",
  "textClasses": {
    "title": { "fontFace": "Segoe UI Semibold", "fontSize": 14 },
    "label": { "fontFace": "Segoe UI", "fontSize": 10, "color": "#625F55" }
  },
  "visualStyles": { "*": { "*": { "border": [{ "show": false }] } } }
}</pre>
<ul>
<li><b>dataColors:</b> Serilerin sırayla aldığı renkler. Sıra önemlidir; renk körlüğüne dayanıklı bir sıra seç.</li>
<li><b>good / neutral / bad:</b> KPI ve koşullu biçimdeki durum renkleri.</li>
<li><b>textClasses:</b> Başlık, etiket, büyük sayı gibi metin sınıflarının yazı tipi ve boyutu.</li>
<li><b>visualStyles:</b> Tüm görsellerin (ya da bir türün) varsayılan biçim ayarları; burada tüm kenarlıklar kapatılmış.</li>
</ul>
<h2>Sayfa ayarları</h2>
<p>Tuvalin boş bir yerine tıklayıp Biçim bölmesini aç:</p>
<div class="tbl-wrap"><table>
<tr><th>Ayar</th><th>Seçenekler</th><th>Ne zaman?</th></tr>
<tr><td>Tuval ayarları → Tür</td><td>16:9, 4:3, Mektup, Özel (ör. 1280 × 1800 uzun sayfa)</td><td>Ekranda 16:9; kaydırmalı uzun rapor için özel yükseklik</td></tr>
<tr><td>Tuval arka planı</td><td>Renk, görüntü, saydamlık</td><td>Tasarımcıdan gelen arka plan görseli</td></tr>
<tr><td>Duvar kâğıdı</td><td>Tuvalin dışındaki alan</td><td>Sunumlarda nötr bir renk</td></tr>
<tr><td>Sayfa bilgileri</td><td>Ad, araç ipucu olarak kullan</td><td>Araç ipucu sayfaları için</td></tr>
<tr><td>Görünüm (Görünüm sekmesi)</td><td>Sayfaya sığdır, genişliğe sığdır, gerçek boyut</td><td>Okuyucunun ekranına göre</td></tr>
<tr><td>Sayfa görünürlüğü</td><td>Sayfayı gizle</td><td>Detay ve araç ipucu sayfaları</td></tr>
</table></div>
<h2>Arka plan görseliyle tasarım</h2>
<p>Profesyonel raporlarda kartların kutuları, başlık şeridi ve logo PowerPoint ya da Figma'da tek bir görsel olarak tasarlanır ve <b>tuval arka planı</b> yapılır (Görüntü sığdırma: Sığdır). Görseller bu kutuların üstüne şeffaf arka planla yerleştirilir. Avantaj: Power BI'da yüzlerce şekil ve metin kutusu kullanmadan tutarlı, hafif bir tasarım.</p>
<div class="tip"><b>Izgara</b>Görünüm → <b>Kılavuz çizgileri</b> ve <b>Izgaraya yapış</b>. Görsel kenarlarını 8 ya da 16 pikselin katlarına hizalamak, tasarımı “profesyonel” gösteren en ucuz yöntemdir.</div>
`,
  ex: [
    { t: 'mc', q: 'Şirketin 30 raporunun aynı renk paletini ve yazı tipini kullanmasını sağlamanın en sürdürülebilir yolu?', o: ['Her görselde renkleri elle seçmek', 'Bir JSON tema dosyası hazırlayıp tüm raporlara uygulamak', 'Arka plan görseli', 'Koşullu biçimlendirme'], a: 1, why: 'Tema dosyası tek yerde tanımlanır ve her rapora yüklenir.' },
    { t: 'mc', q: 'Tema JSON\'unda “good”, “neutral”, “bad” renkleri ne için kullanılır?', o: ['Seri renkleri', 'KPI ve koşullu biçimdeki durum (iyi/nötr/kötü) renkleri', 'Arka plan', 'Yazı tipi'], a: 1, why: 'Durum renkleri kategorik seri renklerinden ayrıdır.' }
  ]
}

);
