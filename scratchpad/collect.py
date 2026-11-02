import os, shutil, sys
W='/home/claude/kaynak'
S='/tmp/claude-0/-home-claude/53cd9548-0d28-57c3-99dc-de41d98193f5/scratchpad'
S1='/tmp/claude-0/-home-claude/8d15e87e-21b9-51fd-9b9d-27135d77cfc3/scratchpad'
BAD_EXT={'.png','.zip','.cpuprofile','.sqlite','.err','.woff2','.jpg','.gif','.webm','.mp4'}
def copy(src, dst, skipdirs=(), skipext=BAD_EXT, maxsize=20*1024*1024, keep_ext=()):
    n=0
    for root, dirs, files in os.walk(src):
        rel=os.path.relpath(root, src)
        dirs[:]=[d for d in dirs if d not in skipdirs and d!='node_modules' and d!='.git' and not d.startswith('vdp-')]
        for f in files:
            p=os.path.join(root,f); e=os.path.splitext(f)[1].lower()
            if e in skipext and e not in keep_ext: continue
            if os.path.getsize(p)>maxsize: print('BÜYÜK, atlandı', p); continue
            q=os.path.join(dst, rel, f); os.makedirs(os.path.dirname(q), exist_ok=True); shutil.copy2(p,q); n+=1
    return n
# uygulama kaynağı (yayın zip'leri dahil: veri/*.zip, veri/*.b64.txt; derleme çıktısı index.html de)
print('app', copy('/home/claude/pbi', W+'/app', keep_ext=('.png','.woff2','.zip')))
print('tests', copy('/home/claude/recover', W+'/tests'))
skip=('artifact-files','gh','site','sh4','sh6','ux','review_ux','dn2','k3','t','u2','prof','dc','lkw')
print('scratch', copy(S, W+'/scratchpad', skipdirs=skip, keep_ext=('.woff2',)))
# t/ (UX test araçları): yalnızca betikler
print('scratch/t', copy(S+'/t', W+'/scratchpad/t', skipext=BAD_EXT|{'.json'}))
print('scratch/u2', copy(S+'/u2', W+'/scratchpad/u2'))
print('eski scratchpad', copy(S1, W+'/scratchpad-8d15', skipdirs=('sh3','sh4','sh5','shm','shots2','undefined')))
# ds: .sql tohumları ve .sqlite yeniden üretilebilir (NASIL.md)
for root,dirs,files in os.walk(W+'/scratchpad/ds'):
    for f in files:
        if f.endswith('.sql'): os.remove(os.path.join(root,f))
