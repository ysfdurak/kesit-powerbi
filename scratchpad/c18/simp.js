const {M} = require('./h.js');
const U = {}; M.tables.Urunler.rows.forEach(r=>U[r.UrunNo]=r); const C={}; M.tables.Musteriler.rows.forEach(r=>C[r.MusteriNo]=r);
const R = M.tables.Satislar.rows.map(r=>({...r, Kategori:U[r.UrunNo].Kategori, Segment:C[r.MusteriNo].Segment, Bolge:C[r.MusteriNo].Bolge, YasGrubu:C[r.MusteriNo].YasGrubu, Cinsiyet:C[r.MusteriNo].Cinsiyet, Sehir:C[r.MusteriNo].Sehir, Yil:r.Tarih.getUTCFullYear()}));
const rates = {
 iade: {f:r=>true, num:r=>r.Durum==='İade'?1:0, den:r=>1},
 iptal: {f:r=>true, num:r=>r.Durum==='İptal'?1:0, den:r=>1},
 marj: {f:r=>r.Durum!=='İptal', num:r=>r.Tutar-r.Maliyet, den:r=>r.Tutar},
 zaman: {f:r=>r.KargoGun!=null&&r.KargoGun!=='', num:r=>r.KargoGun<=3?1:0, den:r=>1},
 indirimli: {f:r=>r.Durum!=='İptal', num:r=>r.Indirim>0?r.Tutar:0, den:r=>r.Tutar},
};
const dims = ['Kanal','Segment','Bolge','YasGrubu','Cinsiyet','Yil','Kategori','IndirimBandi'];
const rate=(rows,k)=>{const d=rates[k];let n=0,m=0,c=0;rows.forEach(r=>{if(!d.f(r))return;n+=d.num(r);m+=d.den(r);c++;});return [m?n/m:null,c,m];};
const out=[];
for (const k in rates) for (const g of dims) for (const s of dims) { if (g===s) continue; if (g==='IndirimBandi'&&k==='indirimli') continue;
 const gv=[...new Set(R.map(r=>r[g]))]; const sv=[...new Set(R.map(r=>r[s]))];
 for (let i=0;i<gv.length;i++) for (let j=0;j<gv.length;j++){ if(i===j) continue; const A=R.filter(r=>r[g]===gv[i]), B=R.filter(r=>r[g]===gv[j]);
  const [ra]=rate(A,k), [rb]=rate(B,k); if(!(ra>rb)) continue;
  let all=true, det=[]; for (const v of sv){ const a=rate(A.filter(r=>r[s]===v),k), b=rate(B.filter(r=>r[s]===v),k); if(a[1]<6||b[1]<6){all=false;break;} if(!(a[0]<b[0])){all=false;break;} det.push(v+': '+a[0].toFixed(4)+'('+a[1]+') vs '+b[0].toFixed(4)+'('+b[1]+')'); }
  if(all) out.push(`${k} ${g}: ${gv[i]} ${ra.toFixed(4)} > ${gv[j]} ${rb.toFixed(4)} but split by ${s}: ${det.join(' | ')}`);
 }}
console.log(out.join('\n')||'none');
