import sqlite3,sys
c=sqlite3.connect('/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/ds/db.sqlite')
for q in open(sys.argv[1]).read().split(';\n'):
    q=q.strip()
    if not q: continue
    try:
        r=c.execute(q).fetchall(); print('>>',q[:90].replace('\n',' ')); [print('  ',x) for x in r[:40]]
    except Exception as e: print('ERR',q[:80],e)
