#!/bin/sh
S=/home/claude/pbi/build
cd /home/claude/pbi
{
  cat $S/head.html
  echo '<style>'
  cat $S/style_old.css app.css
  echo '</style>'
  cat $S/body.html
  for f in config data data2 dax measures patterns levels viz formatpane menus tricks tricks2 dashboards dashcore $(ls dash_*.js 2>/dev/null | sed 's/\.js$//' | sort | tr '\n' ' ') final c1 c2 c3 c4 c5 c6 c7 c8 deep c9 c10 c11 c12 c13 c14 c15 c16 c17 c18 c19 c20 c21 c22 c23 c24 c25 c26 x_temel x_orta1 x_orta2 x_ileri1 x_ileri2 x_ileri3 pqdata extra mcfix bank exams certskills certdata_pl certdata_pl2 certdata_dp certdata_x certdata_dp2 uiscreens certclass enterms confused confused2 interview interview2 arenadata roles yollar denetim app pq practice examui arena guides career sync portfolio vd_ilgaz vd_kanat vd_lezzet vd_pusula vd_pedal bilinen-sinirlar vdata pages; do [ -f "$f.js" ] && echo "<script charset=\"utf-8\" src=\"$f.js\"></script>"; done
} > index.html
