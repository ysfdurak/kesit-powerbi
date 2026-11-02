import json, subprocess, os, sys
calls = json.load(open('/home/claude/recover/calls.json'))
start, end = int(sys.argv[1]), int(sys.argv[2])
cwdfile = '/home/claude/recover/cwd.txt'
cwd = open(cwdfile).read().strip() if os.path.exists(cwdfile) else '/home/claude/pbi'
log = open('/home/claude/recover/replay.log', 'a')
for i in range(start, min(end, len(calls))):
    c = calls[i]; t = c['tool']; p = c['params']
    if t == 'Write':
        fp = p['file_path']; os.makedirs(os.path.dirname(fp), exist_ok=True)
        open(fp, 'w', encoding='utf-8').write(p['content'])
        log.write(f'#{i} WRITE {fp} {len(p["content"])}\n')
    elif t == 'Edit':
        fp = p['file_path']; s = open(fp, encoding='utf-8').read()
        old, new = p['old_string'], p['new_string']
        n = s.count(old)
        if n == 0: log.write(f'#{i} EDIT FAIL {fp}\n'); print('EDIT FAIL', i)
        else:
            s = s.replace(old, new) if p.get('replace_all') == 'true' else s.replace(old, new, 1)
            open(fp, 'w', encoding='utf-8').write(s); log.write(f'#{i} EDIT ok {fp} n={n}\n')
    elif t == 'Bash':
        cmd = p['command']
        script = 'trap \'pwd > ' + cwdfile + '\' EXIT\ncd ' + cwd + '\n' + cmd + '\n'
        open('/home/claude/recover/cur.sh', 'w', encoding='utf-8').write(script)
        try:
            r = subprocess.run(['bash', '/home/claude/recover/cur.sh'], stdout=open('/home/claude/recover/out.txt', 'w'), stderr=subprocess.STDOUT, timeout=240)
            code = r.returncode
        except subprocess.TimeoutExpired:
            code = 'TIMEOUT'
        out = open('/home/claude/recover/out.txt', errors='replace').read()
        cwd = open(cwdfile).read().strip() if os.path.exists(cwdfile) else cwd
        log.write(f'#{i} BASH [{p.get("description","")}] code={code} cwd={cwd}\n{out[-1500:]}\n')
        print(i, code, p.get('description', '')[:70])
open(cwdfile, 'w').write(cwd)
