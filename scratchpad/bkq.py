import sqlite3,sys
c=sqlite3.connect('/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad/ds/bk.sqlite')
for q in sys.stdin.read().split(';'):
    q=q.strip()
    if q: print('>',q[:90].replace('\n',' ')); [print('  ',r) for r in c.execute(q).fetchall()[:30]]
