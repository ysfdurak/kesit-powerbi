(function (W) { (W.PBI_DATASETS = W.PBI_DATASETS || []).push({
  id: 'p', name: 'p', src: 'bk', story: 'x', prep: ['x'], dashboard: { pages: [] },
  tables: [{ name: 'bk_trips', kind: 'fact' }, { name: 'bk_stations', kind: 'dim' }, { name: 'bk_bikes', kind: 'dim' }, { name: 'bk_users', kind: 'dim' }, { name: 'bk_weather', kind: 'dim' }, { name: 'bk_maintenance', kind: 'fact' }],
  derive: [{ t: 'bk_trips', c: 'Tarih', from: 'started_at', fn: 'date' }, { t: 'bk_trips', c: 'Saat', from: 'started_at', fn: 'hour' },
           { t: 'bk_weather', c: 'Tarih', from: 'obs_hour', fn: 'date' }, { t: 'bk_weather', c: 'Saat', from: 'obs_hour', fn: 'hour' }],
  calendar: { name: 'Takvim', from: '2024-06-01', to: '2024-08-31' },
  rels: [['bk_trips', 'start_station', 'bk_stations', 'station_id'], ['bk_trips', 'end_station', 'bk_stations', 'station_id', { inactive: true }], ['bk_trips', 'bike_id', 'bk_bikes', 'bike_id'], ['bk_trips', 'user_id', 'bk_users', 'user_id'], ['bk_trips', 'Tarih', 'Takvim', 'Tarih'], ['bk_weather', 'Tarih', 'Takvim', 'Tarih'], ['bk_maintenance', 'bike_id', 'bk_bikes', 'bike_id']],
  measures: [{ name: 'Y', expr: 'COUNTROWS(bk_trips)', desc: 'd' },
   { name: 'Dk', expr: 'AVERAGEX(FILTER(bk_trips, NOT ISBLANK(bk_trips[ended_at])), (bk_trips[ended_at] - bk_trips[started_at]) * 1440)', desc: 'd' },
   { name: 'R', expr: 'CALCULATE([Y], TREATAS(SELECTCOLUMNS(FILTER(bk_weather, bk_weather[rain_mm] > 1), "T", bk_weather[Tarih], "S", bk_weather[Saat]), bk_trips[Tarih], bk_trips[Saat]))', desc: 'd' },
   { name: 'Bis', expr: 'DIVIDE(DISTINCTCOUNT(bk_trips[bike_id]), COUNTROWS(bk_bikes))', desc: 'd' },
   { name: 'Var', expr: 'CALCULATE([Y], USERELATIONSHIP(bk_trips[end_station], bk_stations[station_id]))', desc: 'd' }
  ],
  tasks: []
}); })(window);
