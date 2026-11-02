import re, json, sys

def unesc(s):
    return s.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')

TOOL = re.compile(r'&lt;tool name="(\w+)"&gt;\n(.*?)&lt;/tool&gt;', re.S)
PARAM = re.compile(r'&lt;parameter name="(\w+)"&gt;(.*?)&lt;/parameter&gt;\n', re.S)

out = []
for f in sys.argv[1:]:
    txt = open(f, encoding='utf-8').read()
    for m in TOOL.finditer(txt):
        name, body = m.group(1), m.group(2)
        params = {k: unesc(v) for k, v in PARAM.findall(body)}
        out.append({'src': f, 'tool': name, 'params': params})
json.dump(out, open('calls.json', 'w'), ensure_ascii=False, indent=0)
from collections import Counter
print(Counter((c['src'], c['tool']) for c in out))
