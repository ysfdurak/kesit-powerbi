global.window = global;
global.PBI_LESSONS=['tarih','aile','arayuz','menuler-turu','dax-giris','toplama','ilk-rapor','gorsel-secimi','gorsel-temel','bicim-temel','filtreler','veri-alma','model-temel','tarih-tablosu'].map(id=>({id,body:'',ex:[],min:0}));
require('/home/claude/pbi/x_temel.js');
const plain=s=>String(s).replace(/<[^>]+>/g,'');
PBI_EXT.forEach(x=>x.ex.forEach((e,j)=>{if(e.t!=='mc')return;const L=e.o.map(o=>plain(o).length);const mx=Math.max(...L),mn=Math.min(...L);const tag=L[e.a]===mx&&L.filter(v=>v===mx).length===1?'LONG':(L[e.a]===mn&&L.filter(v=>v===mn).length===1?'short':'');console.log(x.id,j,'a='+e.a,L.join(','),tag);}));
