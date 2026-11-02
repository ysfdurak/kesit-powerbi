global.window = global; const P = '/home/claude/pbi/';
['data','dax','measures','patterns','levels','c1','c2','c3','c4','c5','c6','c7','c8','deep'].forEach(f => require(P + f + '.js'));
require('/home/claude/pbi/c12.js');
['copilot','yz-dax-denetim','python-r','fabric-giris','fabric-yildiz'].forEach(id=>{const i=PBI_ORDER.indexOf(id); console.log(id, PBI_ORDER[i-1], '->', id, '->', PBI_ORDER[i+1]);});
