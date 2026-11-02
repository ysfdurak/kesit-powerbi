#!/bin/sh
S=/tmp/claude-0/-home-claude/8d15e87e-21b9-51fd-9b9d-27135d77cfc3/scratchpad
cd /home/claude/pbi
{
  cat $S/head.html
  echo '<style>'
  cat $S/style_old.css app.css
  echo '</style>'
  cat $S/body.html
  for f in data data2 dax measures patterns levels viz formatpane menus tricks dashboards dashcore $(ls dash_*.js 2>/dev/null | sed 's/\.js$//' | sort | tr '\n' ' ') final c1 c2 c3 c4 c5 c6 c7 c8 deep c9 c10 c11 c12 c13 c14 c15 c16 c17 c18 c19 pqdata extra mcfix bank exams certskills certdata_pl certdata_pl2 certdata_dp certdata_x certdata_dp2 uiscreens certclass enterms confused interview arenadata app pq practice examui arena guides roles career sync pages; do echo "<script charset=\"utf-8\" src=\"$f.js\"></script>"; done
} > index.html
