(function (W) { (W.PBI_DATASETS = W.PBI_DATASETS || []).push({
  id: 'test', name: 'Kanat', src: 'hv', story: 'x', prep: ['x'], dashboard: { pages: [] },
  tables: [{ name: 'hv_flights', kind: 'fact' }, { name: 'hv_routes', kind: 'dim' }, { name: 'hv_airports', kind: 'dim' }],
  derive: [{ t: 'hv_flights', c: 'Tarih', from: 'sched_dep', fn: 'date' }],
  calendar: { name: 'Takvim', from: '2024-09-01', to: '2024-12-31' },
  rels: [['hv_flights', 'route_id', 'hv_routes', 'route_id'], ['hv_routes', 'origin', 'hv_airports', 'airport_code'], ['hv_flights', 'Tarih', 'Takvim', 'Tarih']],
  measures: [{ name: 'Uçuş', expr: 'COUNTROWS(hv_flights)', desc: 'd' }, { name: 'Yolcu', expr: 'SUM(hv_flights[pax])', desc: 'd' }],
  tasks: [{ id: 'a', lv: 'temel', q: 'q', hint: 'h', dax: 'CALCULATE([Uçuş], hv_flights[status] = "cancelled")', expect: 0, sql: "select count(*) from hv_flights where status='cancelled'" },
          { id: 'b', lv: 'orta', q: 'q', hint: 'h', dax: 'CALCULATE([Yolcu], Takvim[AyNo] = 12, hv_airports[city] = "İstanbul")', expect: 0, sql: "select sum(pax) from hv_flights f join hv_routes r using(route_id) join hv_airports a on a.airport_code=r.origin where a.city='İstanbul' and substr(sched_dep,6,2)='12'" },
          { id: 'c', lv: 'ileri', q: 'q', hint: 'h', query: 'EVALUATE TOPN(3, SUMMARIZECOLUMNS(hv_airports[city], "Y", [Yolcu]), [Y], DESC)', expectRows: [['x', 1]], sql: "select a.city, sum(pax) y from hv_flights f join hv_routes r using(route_id) join hv_airports a on a.airport_code=r.origin group by a.city order by y desc limit 3" }]
}); })(window);
