global.window = global; const P = '/home/claude/pbi/';
['data','data2','dax','measures'].forEach(f => require(P + f + '.js'));
const T = PBI_DATA || window.PBI_DATA;
console.log(Object.keys(global).filter(k=>k.startsWith('PBI')));
