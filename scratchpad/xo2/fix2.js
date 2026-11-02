const fs=require('fs'); const F='/home/claude/pbi/x_orta2.js'; let s=fs.readFileSync(F,'utf8');
const R=[
// Türkçe yüzde biçimi: %27
['RETURN Ad &amp; " satışın " &amp; FORMAT(Pay, "0%") &amp; " kadarını taşıyor"</pre>','RETURN Ad &amp; " satışın %" &amp; FORMAT(Pay * 100, "0") &amp; " kadarını taşıyor"</pre>'],
['<code>Ad & " satışın " & FORMAT(Pay, "0%") & " kadarını taşıyor"</code>','<code>Ad & " satışın %" & FORMAT(Pay * 100, "0") & " kadarını taşıyor"</code> (Türkçede yüzde işareti sayının önüne gelir)'],
['RETURN Ad & " satışın " & FORMAT(Pay, "0%") & " kadarını taşıyor"\'','RETURN Ad & " satışın %" & FORMAT(Pay * 100, "0") & " kadarını taşıyor"\''],
['" kategorisinde, payı " &amp; FORMAT(Pay, "0%") &amp; "."</pre>','" kategorisinde, payı %" &amp; FORMAT(Pay * 100, "0") &amp; "."</pre>'],
['<code>"En yüksek satış " & lider kategori & " kategorisinde, payı " & FORMAT(Pay, "0%") & "."</code>','<code>"En yüksek satış " & lider kategori & " kategorisinde, payı %" & FORMAT(Pay * 100, "0") & "."</code>'],
['" kategorisinde, payı " & FORMAT(Pay, "0%") & "."\'','" kategorisinde, payı %" & FORMAT(Pay * 100, "0") & "."\''],
// istatistik: büyüme oranlarının ortalaması
['<h2>Analiz bölmesindeki ortalama çizgisi neyin ortalaması?</h2>', `<h2>Büyüme oranlarının ortalaması: GEOMEAN</h2>
<p>Finans direktörü “son iki yılda ortalama yıllık büyümemiz ne?” diye soruyor. Modelde net satış 2023’te yaklaşık %290, 2024’te yaklaşık %86 büyüdü. Bu iki oranın aritmetik ortalaması yaklaşık %188 eder. Ama 2022’nin 102.837 TL’sini iki yıl üst üste %188 büyütürsen 2024 için yaklaşık 854 bin TL bulursun; gerçek değer 747 bin TL. Doğru cevap bileşik (geometrik) büyümedir: (1 + 2,898) × (1 + 0,864) çarpımının karekökünden 1 çıkar, yaklaşık %170. Oranlar çarpılarak birikir; bu yüzden ortalamaları da çarpımsal alınır. DAX’ta GEOMEAN ve GEOMEANX bunun içindir; büyüme katsayılarının (1 + oran) ortalamasını alıp 1 çıkarırsın. İlk yıl gibi büyümesi boş olan dönemi hesaba katma.</p>
<h2>Analiz bölmesindeki ortalama çizgisi neyin ortalaması?</h2>`],
];
R.forEach(([a,b])=>{ const n=s.split(a).length-1; if(n!==1) console.log('MISS',n,a.slice(0,70)); s=s.split(a).join(b); });
s=s.replace('Bu ölçü tüm dönemde “Elektronik satışın %27 kadarını taşıyor” üretir.','Bu ölçü tüm dönemde “Elektronik satışın %27 kadarını taşıyor” üretir. FORMAT(Pay, "0%") yazsaydın sonuç “27%” olurdu; Türkçe yazımda yüzde işareti sayının önüne gelir.');
fs.writeFileSync(F,s);
