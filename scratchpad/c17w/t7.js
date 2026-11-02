console.log(rq(`EVALUATE CALCULATETABLE(SUMMARIZECOLUMNS(Kategoriler[Kategori], "Net", [Net Satış], "Hedef", [Hedef], "G", [Hedef Gerçekleşme %], "GY", [Satış GY], "YoY", [YoY %]), Tarih[Yil]=2024)`));
const st='VAR G = [Hedef Gerçekleşme %] RETURN SWITCH(TRUE(), ISBLANK(G), "Hedef yok", G >= 1, "Hedefte", G >= 0.95, "Yakın", "Geride")';
console.log(q(st,{t:'Kategoriler',c:'Kategori'}), q(st,{t:'Tarih',c:'Yil'}), q(st,{t:'Tarih',c:'YilAy'}).slice(-6));
console.log(rq(`EVALUATE CALCULATETABLE(SUMMARIZECOLUMNS(Kategoriler[Kategori], "S", ${st.replace(/"/g,'"')}), Tarih[Yil]=2024)`));
const ytd='DIVIDE([Satış YTD], [Hedef YTD])';
console.log(q(ytd,{t:'Tarih',c:'YilAy'}).slice(-12), q(ytd,{t:'Kategoriler',c:'Kategori'}), q(ytd,{t:'Tarih',c:'Yil'}));
console.log(q('[Hedef Durumu]',{t:'Kategoriler',c:'Kategori'}));
