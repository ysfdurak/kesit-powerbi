import sqlite3, csv, json, os, sys, time
for f in ['db','hv','lk','ik','bk']:
    t0=time.time(); con=sqlite3.connect(':memory:'); con.executescript(open(f+'.sql',encoding='utf-8').read())
    tabs=[r[0] for r in con.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%' order by name")]
    print(f, round(time.time()-t0,1),'s', [(t, con.execute(f'select count(*) from "{t}"').fetchone()[0]) for t in tabs])
    con.execute("vacuum into '"+f+".sqlite'") if False else None
    os.makedirs('csv/'+f, exist_ok=True)
    for t in tabs:
        cur=con.execute(f'select * from "{t}"'); cols=[d[0] for d in cur.description]
        with open(f'csv/{f}/{t}.csv','w',newline='',encoding='utf-8-sig') as fh:
            w=csv.writer(fh); w.writerow(cols); w.writerows(cur)
