trap 'pwd > /home/claude/recover/cwd.txt' EXIT
cd /tmp/claude-0/-home-claude/8d15e87e-21b9-51fd-9b9d-27135d77cfc3/scratchpad
cd /home/claude/pbi && cat >> app.css <<'EOF'
.stage-b .chip,.cover .chip{white-space:normal; max-width:100%; height:auto; line-height:1.35; padding-top:4px; padding-bottom:4px}
.stage-b,.stage-b *{min-width:0}
.stage-b .codebox,.stage-b pre{max-width:100%; overflow-x:auto}
EOF
cd /tmp/claude-0/-home-claude/8d15e87e-21b9-51fd-9b9d-27135d77cfc3/scratchpad && ./build.sh && node ov.js final
