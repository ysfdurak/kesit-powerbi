import csv,sys,os,re,collections
base=sys.argv[1]
def load(p):
    raw=open(p,'rb').read()
    bom=raw[:3]==b'\xef\xbb\xbf'
    rows=list(csv.reader(raw.decode('utf-8-sig').splitlines()))
    return bom,rows[0],rows[1:]
T={}
for d in ['db','hv','lk','ik','bk']:
    for f in sorted(os.listdir(d)):
        bom,h,r=load(os.path.join(d,f)); T[f[:-4]]=(h,r)
        if d!='db' or f.startswith('bank'):
            print(f,'BOM' if bom else 'NOBOM',len(r))
def col(t,c):
    h,r=T[t]; i=h.index(c); return [x[i] for x in r]
rels=[('bank_txns','account_id','bank_accounts','account_id'),('bank_accounts','customer_id','bank_customers','customer_id'),('bank_customers','branch_id','bank_branches','branch_id'),
('hv_flights','route_id','hv_routes','route_id'),('hv_routes','origin','hv_airports','airport_code'),('hv_routes','dest','hv_airports','airport_code'),('hv_flights','tail_no','hv_aircraft','tail_no'),('hv_delays','flight_id','hv_flights','flight_id'),('hv_bookings','flight_id','hv_flights','flight_id'),('hv_bookings','passenger_id','hv_passengers','passenger_id'),
('lk_orders','customer_id','lk_customers','customer_id'),('lk_orders','restaurant_id','lk_restaurants','restaurant_id'),('lk_orders','courier_id','lk_couriers','courier_id'),('lk_order_lines','order_id','lk_orders','order_id'),('lk_order_lines','item_id','lk_menu_items','item_id'),('lk_ratings','order_id','lk_orders','order_id'),('lk_menu_items','restaurant_id','lk_restaurants','restaurant_id'),
('ik_positions','dept_id','ik_departments','dept_id'),('ik_employees','position_id','ik_positions','position_id'),('ik_job_history','emp_id','ik_employees','emp_id'),('ik_job_history','position_id','ik_positions','position_id'),('ik_salaries','emp_id','ik_employees','emp_id'),('ik_reviews','emp_id','ik_employees','emp_id'),('ik_reviews','reviewer_id','ik_employees','emp_id'),('ik_leaves','emp_id','ik_employees','emp_id'),('ik_survey','emp_id','ik_employees','emp_id'),('ik_training','emp_id','ik_employees','emp_id'),('ik_requisitions','position_id','ik_positions','position_id'),('ik_candidates','req_id','ik_requisitions','req_id'),('ik_candidates','emp_id','ik_employees','emp_id'),('ik_employees','manager_id','ik_employees','emp_id'),
('bk_trips','start_station','bk_stations','station_id'),('bk_trips','end_station','bk_stations','station_id'),('bk_trips','bike_id','bk_bikes','bike_id'),('bk_trips','user_id','bk_users','user_id'),('bk_maintenance','bike_id','bk_bikes','bike_id')]
for a,ac,b,bc in rels:
    one=col(b,bc); s=set(one)
    many=col(a,ac); orph=[x for x in many if x!='' and x not in s]; bl=sum(1 for x in many if x=='')
    print('REL',a,ac,'->',b,bc,'oneUnique',len(s)==len(one),'orphans',len(orph),'blanks',bl)
# case/space variants
for t,(h,r) in T.items():
    if t.startswith(('ab_','customers','departments','employees','order_items','orders','price','products','raw','web')): continue
    for i,c in enumerate(h):
        v=[x[i] for x in r]
        if any(re.fullmatch(r'-?\d+(\.\d+)?',x) for x in v[:50]): continue
        g=collections.defaultdict(set)
        for x in set(v): g[x.strip().casefold()].add(x)
        bad=[k for k,s2 in g.items() if len(s2)>1]
        sp=[x for x in set(v) if x!=x.strip()]
        if bad or sp: print('VARIANT',t,c,bad[:5],sp[:5])
# decimals >4
for t,(h,r) in T.items():
    for i,c in enumerate(h):
        mx=0
        for x in r:
            m=re.fullmatch(r'-?\d+\.(\d+)',x[i])
            if m: mx=max(mx,len(m.group(1)))
        if mx>4: print('DEC>4',t,c,mx)
# same-name columns where one side unique (autodetect candidates)
groups={'db':[k for k in T if k.startswith('bank')],'hv':[k for k in T if k.startswith('hv')],'lk':[k for k in T if k.startswith('lk')],'ik':[k for k in T if k.startswith('ik')],'bk':[k for k in T if k.startswith('bk')]}
for g,ts in groups.items():
    for t1 in ts:
        for t2 in ts:
            if t1==t2: continue
            for c in set(T[t1][0])&set(T[t2][0]):
                v1=col(t1,c); v2=col(t2,c)
                if len(set(v2))==len(v2):
                    ov=len(set(v1)&set(v2))
                    print('AUTODET',t1,c,'->',t2,'overlap',ov)
