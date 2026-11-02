#!/bin/sh
# Araçların beklediği mutlak yolları bu depoya bağlar (yeni bir oturumda bir kez çalıştır).
# Betikler ve doğrulayıcılar /home/claude/pbi, /home/claude/recover ve iki eski scratchpad yolunu sabit olarak kullanır.
set -e
R=$(cd "$(dirname "$0")" && pwd)
S=/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad
S1=/tmp/claude-0/-home-claude/8d15e87e-21b9-51fd-9b9d-27135d77cfc3/scratchpad
link() { if [ -e "$2" ] && [ ! -L "$2" ]; then echo "UYARI: $2 zaten var (bağlantı değil), dokunulmadı"; return; fi; mkdir -p "$(dirname "$2")"; ln -sfn "$1" "$2"; echo "$2 -> $1"; }
link "$R/app" /home/claude/pbi
link "$R/tests" /home/claude/recover
link "$R/scratchpad" "$S"
link "$R/scratchpad-8d15" "$S1"
# Vaka veri setlerinin SQLite kopyaları (doğrulayıcı bağımsız SQL denetimi için kullanır) ve .sql tohumları
cd "$S/ds" && node seed.js "$S/sqlsrc" >/dev/null && python3 mk.py >/dev/null && python3 -c "
import sqlite3,os
for f in ['db','hv','lk','ik','bk']:
    if os.path.exists(f+'.sqlite'): os.remove(f+'.sqlite')
    c=sqlite3.connect(':memory:'); c.executescript(open(f+'.sql',encoding='utf-8').read()); c.execute(\"vacuum into '\"+f+\".sqlite'\")
print('SQLite kopyaları hazır')"
