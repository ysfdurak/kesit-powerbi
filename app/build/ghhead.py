import sys,re
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
s=re.sub(r'<link rel="preconnect" href="https://fonts\.g[^>]*>\n?','',s)
s=re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>','<link rel="stylesheet" href="vendor/fonts.css">',s)
meta='''<meta name="theme-color" content="#E9B10C">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<meta property="og:type" content="website">
<meta property="og:locale" content="tr_TR">
<meta property="og:site_name" content="Kesit Power BI">
<meta property="og:title" content="Kesit Power BI: sıfırdan işe hazır Power BI">
<meta property="og:description" content="Kurulum yok, hesap yok. DAX'ı benzeten tarayıcı motoruyla 118 ders, 900'ü aşkın alıştırma, 24 örnek rapor ve 5 vaka veri seti.">
<meta property="og:image" content="https://ysfdurak.github.io/kesit-powerbi/og.png">
<meta property="og:url" content="https://ysfdurak.github.io/kesit-powerbi/">
<meta name="twitter:card" content="summary_large_image">
'''
s=s.replace('<title>Kesit Power BI</title>','<title>Kesit Power BI</title>\n'+meta,1)
s=s.replace('<script charset="utf-8" src="kesit.js"></script>','<script charset="utf-8" src="kesit.js"></script>\n<script>if(\'serviceWorker\' in navigator && /^https:|^http:\\/\\/localhost/.test(location.href) && !/claude|claudeusercontent/.test(location.host)) navigator.serviceWorker.register(\'sw.js\').catch(()=>{});</script>',1)
assert 'vendor/fonts.css' in s and 'og:image' in s and 'serviceWorker' in s
open(p,'w',encoding='utf-8').write(s)
